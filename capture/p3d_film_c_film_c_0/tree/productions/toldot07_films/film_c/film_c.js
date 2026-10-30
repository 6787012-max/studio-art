/* film_c - "Sand: where does the sand come from?" 250.2 s. Deterministic: every frame is a pure function of t (window.__seek(t) + window.__T0). ASCII only. */
import { THREE, renderer, scene, cam, sky, R, B, hideAll, flags, POST, warmFaces, Q, SW, SHH } from './c_core.js';
import { TL, DUR } from './c_tl.js';
import { shot1, scrolls, s1Off } from './c_s1.js';
import { shot2, bubbleOff } from './c_s2.js';
import { shot3, s3Off } from './c_s3.js';
import { shot4 } from './c_s4.js';
import { shot4b, shot5, recapOff } from './c_s5.js';

scrolls();
const FN = { c1_where_from: shot1, c2_from_the_nile: shot2, c3_zigzag_and_dune: shot3, c4_kurkar: shot4, c4b_kurkar_cliff: shot4b, c5_recap: shot5 };
const shotAt = t => { let s = TL[TL.length - 1]; for (const x of TL) if (t < x.t0 + x.dur) { s = x; break; } return s; };
const capAt = t => { const s = shotAt(t), lt = t - s.t0; for (const c of s.caps) if (lt >= c[1] && lt < c[2]) return c[0]; return null; };
function frame(T) {
  const s = shotAt(T), lt = T - s.t0;
  hideAll(); POST.length = 0; recapOff(); bubbleOff(); s3Off(); s1Off(); R.root.scale.setScalar(1); B.root.scale.setScalar(1); sky.material.uniforms.uHasSun.value = 0;
  const fn = FN[s.id]; const c = fn ? fn(lt, T) : { p: [0, 200, 800], l: [0, 100, 0], fov: 32 };
  if (flags.collect) return;
  window.__dbgcam = c; cam.fov = c.fov || 32; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l);
  sky.position.copy(cam.position); cam.updateMatrixWorld(true); POST.splice(0).forEach(f => f());
  renderer.render(scene, cam);
}
async function warm() {
  flags.collect = true;
  for (let k = 0; k <= DUR * 30; k++) frame(Math.min(k / 30, DUR - 0.001));
  flags.collect = false;
  return await warmFaces();
}
window.__dur = DUR; window.__HQ = !!Q.has('hq'); window.__errors = []; window.__T0 = window.__T0 || 0;
window.__shots = TL.map((s, i) => ({ id: s.id, index: i, start: s.t0, end: s.t0 + s.dur, dur: s.dur }));
window.__caption = t => capAt(t);
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
(async () => {
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm(); frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
