/* film_e engine: timeline -> shot -> setup -> frame. Deterministic: frame(t) is a pure function of t. ASCII only. */
import { THREE, V, W, H, Q, renderer, scene, cam, SKY, WORLD, ST, AC, hideAll, hudBegin, hudEnd, renderHud, cl, FGM, ENVP } from './e_core.js';
import './e_w1.js';
import './e_w2.js';
import { SH, ORDER, DEFAULT_FOV, initWorlds } from './e_shots.js';
import { initB } from './e_shots_b.js';

initWorlds(); initB();
const TL = await (await fetch('timeline.json?v=1')).json();
export const DUR = TL.dur;
const shots = TL.shots.map((s, i) => ({ id: s.id, key: ORDER[i], t0: s.t0, dur: s.dur, end: s.t0 + s.dur, caps: s.captions.map(c => ({ id: c.id, a: s.t0 + c.start, b: s.t0 + c.end })), recap: s.recap_lines }));
const shotAt = t => { for (const s of shots) if (t < s.end - 1e-9) return s; return shots[shots.length - 1]; };

function setCam(c) { cam.fov = c.fov || DEFAULT_FOV; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l); if (c.roll) cam.rotateZ(c.roll); cam.updateMatrixWorld(); }
const skyOf = (w, p) => !w ? null : (typeof w.sky === 'function' ? w.sky(p) : w.sky);
function showWorld(name) { for (const k in WORLD) WORLD[k].g.visible = k === name; for (const k in SKY) SKY[k].visible = false; const w = WORLD[name]; const s = skyOf(w, ENVP.p); if (s) SKY[s].visible = true; }
function placeFg(S) { if (!S.fg) return; const f = FGM[S.fg.k || S.fg], off = S.fg.off || [-118, -62, -260]; f.visible = true; f.updateMatrixWorld(); f.position.copy(cam.position).add(V(off[0], off[1], off[2]).applyQuaternion(cam.quaternion)); f.quaternion.copy(cam.quaternion); }

function frame(t0) {
  const s = shotAt(t0), lt = Math.min(t0 - s.t0, s.dur - 1e-4), shot = SH[s.key];
  ST.t = t0;
  const setups = shot.setups; const S = setups.find(q => lt < q.b) || setups[setups.length - 1];
  const u = cl((lt - S.a) / Math.max(1e-6, S.b - S.a), 0, 1);
  hideAll(); hudBegin(); ENVP.p = null;
  const wname = typeof S.w === 'function' ? S.w(lt) : S.w;
  shot.acts(lt, S, u);
  const w = WORLD[wname]; showWorld(wname);
  if (w) w.upd(t0, lt, ENVP.p);
  AC.rabbi.o.root.updateMatrixWorld(true);
  setCam(S.cam(u, lt)); placeFg(S);
  { const s = skyOf(w, ENVP.p); if (s) SKY[s].position.copy(cam.position); }
  renderer.setScissorTest(false); renderer.clear();
  renderer.render(scene, cam);
  if (shot.hud) shot.hud(lt, S, u, wname);
  hudEnd(); renderHud();
}

async function warm() {
  ST.warm = true; ST.faces.clear();
  for (let k = 0; k <= Math.round(DUR * 30); k++) { const t = Math.min(k / 30, DUR - 1e-3); const s = shotAt(t), lt = Math.min(t - s.t0, s.dur - 1e-4); const shot = SH[s.key];
    ST.t = t; const S = shot.setups.find(q => lt < q.b) || shot.setups[shot.setups.length - 1]; const u = cl((lt - S.a) / Math.max(1e-6, S.b - S.a), 0, 1);
    try { shot.acts(lt, S, u); } catch (e) { /* warm only needs the faces */ } }
  ST.warm = false;
  const list = [...ST.faces.values()]; for (const [a, f] of list) await a.o.face.set(f);
  ST.faces.clear(); return list.length;
}

const capAt = t => { const s = shotAt(t); for (const c of s.caps) if (t >= c.a && t < c.b) return c.id; return null; };
window.__dur = DUR; window.__HQ = !!(window.__HQ_RENDER || Q.has('hq')); window.__errors = [];
window.__shots = shots.map((s, i) => ({ id: s.id, index: i, start: s.t0, end: s.end, dur: s.dur }));
window.__caption = t => capAt(t + (window.__T0 || 0));
window.__seek = t => { try { frame(Math.min(Math.max(t + (window.__T0 || 0), 0), DUR - 1e-3)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
window.__warmed = 0; window.__dbg = { WORLD, scene, cam, renderer, AC };
(async () => {
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm(); frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
