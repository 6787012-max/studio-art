/* film_b engine: timeline -> shot -> setup -> frame. Deterministic: frame(t) is a pure function of t. ASCII only. */
import { THREE, V, W, H, Q, renderer, scene, cam, SKY, WORLD, ST, AC, hideAll, hudBegin, hudEnd, renderHud, hx, HUD, cl, sm, fgGrass, fgRock, fgLeaves } from './fb_core.js';
import { SH, ORDER, DEFAULT_FOV } from './fb_shots.js';
import './fb_shots_b.js';
import './fb_shots_c.js';

const TL = await (await fetch('timeline.json?v=1')).json();
export const DUR = TL.dur;
const shots = TL.shots.map((s, i) => ({ id: s.id, key: ORDER[i], t0: s.t0, dur: s.dur, end: s.t0 + s.dur, caps: s.captions.map(c => ({ id: c.id, a: s.t0 + c.start, b: s.t0 + c.end })), recap: s.recap_lines }));
const shotAt = t => { for (const s of shots) if (t < s.end - 1e-9) return s; return shots[shots.length - 1]; };

function setCam(c) { cam.fov = c.fov || DEFAULT_FOV; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l); if (c.roll) cam.rotateZ(c.roll); cam.updateMatrixWorld(); }
function showWorld(name) { for (const k in WORLD) { WORLD[k].g.visible = k === name; } for (const k in SKY) SKY[k].visible = false; const w = WORLD[name]; if (w && w.sky) SKY[w.sky].visible = true; }
const FGM = { grass: fgGrass, rock: fgRock, leaves: fgLeaves };
function placeFg(S) { if (!S.fg) return; const f = FGM[S.fg.k || S.fg], off = S.fg.off || [-118, -62, -260]; f.visible = true; f.updateMatrixWorld(); f.position.copy(cam.position).add(V(off[0], off[1], off[2]).applyQuaternion(cam.quaternion)); f.quaternion.copy(cam.quaternion); }
function renderScene(name) { showWorld(name); const w = WORLD[name]; if (w && w.sky) SKY[w.sky].position.copy(cam.position); renderer.render(scene, cam); }

function frame(t0) {
  const s = shotAt(t0), lt = Math.min(t0 - s.t0, s.dur - 1e-4), shot = SH[s.key];
  ST.t = t0;
  const setups = shot.setups; let S = setups.find(q => lt < q.b) || setups[setups.length - 1];
  const u = cl((lt - S.a) / Math.max(1e-6, S.b - S.a), 0, 1);
  hideAll(); hudBegin();
  if (S.wipe) { const wp = S.wipe;
    const x = wp.x(lt);                                  // wipe position 0..1: left side shows wp.left, right side shows wp.right
    shot.acts(lt, S, { x });
    setCam(S.cam(u, lt)); placeFg(S);
    renderer.setScissorTest(true); renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H);
    renderer.clear();
    const xs = Math.round(x * W);
    if (xs > 0) { renderer.setScissor(0, 0, xs, H); wp.left.prep(lt); wp.left.fg && wp.left.fg(); renderScene(wp.left.w); }
    if (xs < W) { renderer.setScissor(xs, 0, W - xs, H); wp.right.prep(lt); renderScene(wp.right.w); }
    renderer.setScissorTest(false);
    // no divider bar: a bare cut edge reads cleaner than a pole
  } else {
    shot.acts(lt, S, null);
    setCam(S.cam(u, lt)); placeFg(S);
    renderer.setScissorTest(false); renderer.clear();
    renderScene(S.w);
  }
  if (shot.hud) shot.hud(lt, S, u);
  hudEnd(); renderHud();
}

async function warm() {
  ST.warm = true; ST.faces.clear();
  for (let k = 0; k <= Math.round(DUR * 30); k++) { const t = Math.min(k / 30, DUR - 1e-3); const s = shotAt(t), lt = Math.min(t - s.t0, s.dur - 1e-4); const shot = SH[s.key];
    ST.t = t; const S = shot.setups.find(q => lt < q.b) || shot.setups[shot.setups.length - 1]; const x = S.wipe ? S.wipe.x(lt) : 0;
    try { shot.acts(lt, S, S.wipe ? { x } : null); } catch (e) { /* warm only needs the faces */ } }
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
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm();
    // pre-render one frame per shot so shader compiles happen before __ready (remote screenshot timeout is 30 s)
    for (const s of shots) frame(Math.min(s.t0 + 0.5, DUR - 1e-3));
    frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
