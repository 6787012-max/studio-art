/* film_d - "Sea ports: the gate of the land" 275.9 s. Deterministic: every frame is a pure function of t (window.__seek(t) + window.__T0). ASCII only. */
import { THREE, renderer, scene, cam, sky, hideAll, flags, POST, warmFaces, Q, SW, SHH, R, B } from './d_core.js';
import { TL, DUR } from './d_tl.js';
import { shot1 } from './d_s1.js';
import { shot2 } from './d_s2.js';
import { shot3 } from './d_s3.js';
import { shot4 } from './d_s4.js';
import { shot5 } from './d_s5.js';
import { shot5b } from './d_s5b.js';
import { shot6, recapOff } from './d_s6.js';
import { SHIP, TUG } from './d_w1.js';
import { mport } from './d_w4.js';

const FN = { d1_where_can_a_ship_stop: shot1, d2_breakwater: shot2, d3_yafo_and_the_cedars: shot3, d4_caesarea: shot4, d5_haifa_and_ashdod: shot5, d5b_giant_ship: shot5b, d6_recap: shot6 };
const shotAt = t => { let s = TL[TL.length - 1]; for (const x of TL) if (t < x.t0 + x.dur) { s = x; break; } return s; };
const capAt = t => { const s = shotAt(t), lt = t - s.t0; for (const c of s.caps) if (lt >= c[1] && lt < c[2]) return c[0]; return null; };
function place(c) { cam.fov = c.fov || 32; cam.position.set(...c.p); cam.lookAt(...c.l); sky.position.copy(cam.position); cam.updateMatrixWorld(true); }
function frame(T) {
  const s = shotAt(T), lt = T - s.t0;
  hideAll(); SHIP.visible = false; TUG.visible = false; mport.cranes.forEach(c => { c.visible = true; }); POST.length = 0; recapOff(); sky.material.uniforms.uHasSun.value = 0;
  const fn = FN[s.id]; const c = fn ? fn(lt, T) : { p: [0, 200, 800], l: [0, 100, 0], fov: 32 };
  if (flags.collect) return;
  window.__dbgcam = c;
  if (c.parts) {
    renderer.setScissorTest(true);
    for (const pt of c.parts) {
      pt.setup && pt.setup(); const [fx, fy, fw, fh] = pt.vp, x = Math.round(fx * SW), y = Math.round(fy * SHH), w = Math.round(fw * SW), h = Math.round(fh * SHH);
      renderer.setViewport(x, y, w, h); renderer.setScissor(x, y, w, h); cam.aspect = w / h; place(pt.cam); cam.updateProjectionMatrix(); POST.forEach(f => f());
      renderer.render(scene, cam);
    }
    renderer.setViewport(0, 0, SW, SHH); renderer.setScissor(Math.round(SW / 2) - 5, 0, 10, SHH); renderer.setClearColor(0xfff1c8, 1); renderer.clear(); renderer.setScissorTest(false);
    cam.aspect = 16 / 9; cam.updateProjectionMatrix();
    return;
  }
  cam.aspect = 16 / 9; place(c); cam.updateProjectionMatrix(); POST.splice(0).forEach(f => f());
  renderer.render(scene, cam);
}
async function warm() {
  flags.collect = true;
  for (let k = 0; k <= DUR * 30; k++) frame(Math.min(k / 30, DUR - 0.001));
  flags.collect = false;
  return await warmFaces();
}
window.__R = R; window.__B = B; window.__cam = cam; window.__scene = scene; window.__dur = DUR; window.__HQ = !!Q.has('hq'); window.__errors = []; window.__T0 = window.__T0 || 0;
window.__shots = TL.map((s, i) => ({ id: s.id, index: i, start: s.t0, end: s.t0 + s.dur, dur: s.dur }));
window.__caption = t => capAt(t);
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
(async () => {
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm(); frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
