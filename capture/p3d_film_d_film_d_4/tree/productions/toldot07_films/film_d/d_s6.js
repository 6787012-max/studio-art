/* film_d shot 6: recap - the harbour at dusk, calm basin with lights, the pair on the breakwater, centre calm and darker (257.1 - 275.9 s). ASCII only. */
import { THREE, sm, cl, frac, V, KT, M, G, col, part, ell, tube, GH, R, B, GULLS, ease, lin, lerp, blinkAt, flags, fs, pose, CAMS, skyTo, show, bFace, rFace, POST, cam, makeHalo, sky } from './d_core.js';
import { wall, harbourTick, harbour, hsea } from './d_w1.js';
import { barge, spl, crest, crest2 } from './d_s2.js';
import { gullFly } from './d_s1.js';
const PI = Math.PI;
const mk = (stops) => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 144; const c = cv.getContext('2d'), g = c.createRadialGradient(128, 72, 6, 128, 72, 125);
  stops.forEach(([o, col2]) => g.addColorStop(o, col2)); c.fillStyle = g; c.fillRect(0, 0, 256, 144); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })); m.position.set(0, 0, -50); m.renderOrder = 100; m.visible = false; cam.add(m); return m; };
const vigC = mk([[0, 'rgba(14,14,40,0.30)'], [0.55, 'rgba(24,20,50,0.20)'], [1, 'rgba(40,30,70,0.06)']]);
const halos = [0, 1, 2, 3, 4, 5, 6, 7].map(() => { const h = makeHalo(150, '#ffd070', 0.55); h.material.depthTest = true; h.renderOrder = 8; h.visible = false; GH.add(h); return h; });
const u0 = 0.66, LAMPD = [-520, -340, 250, 430, 620, 800];
const lampG = (() => { const g = G(GH); g.visible = false;
  LAMPD.forEach(d => { const p = wall.at(u0 + d / wall.L, 81, 0); part(g, tube(5, 4, 100, 10).translate(0, 100, 0), M('#3b3532', '#5a5a6a'), 1.6, [p.x, 81, p.z]); part(g, ell(15, 10, 15, 12, 8), M('#fff0b0', '#fff0b0', 0), 1.4, [p.x, 81 + 106, p.z]); });
  return g; })();
export const recapOff = () => { vigC.visible = false; lampG.visible = false; halos.forEach(h => { h.visible = false; }); };
export function shot6(lt, T) {
  show(GH, R, B, GULLS[0]); skyTo('dusk'); wall.set(1, 0.05); harbourTick(T, 9, 0.05); barge.visible = false; vigC.visible = true; spl.forEach(s => { s.visible = false; }); crest.visible = crest2.visible = false;
  const U = sky.material.uniforms; U.uHasSun.value = 0;
  lampG.visible = true;
  const lamps = LAMPD.map(d => u0 + d / wall.L); lamps.forEach((u, i) => { const p = wall.at(u, 81 + 108, 0); halos[i].visible = true; halos[i].position.set(p.x, p.y, p.z); });
  wall.lh.visible = false;
  const Q = wall.at(u0, 81, 0), tg = wall.tg(u0), nrm = V(-tg.z, 0, tg.x), yawOut = Math.atan2(tg.x, tg.z);
  const rp = Q.clone().addScaledVector(tg, 40), bp = Q.clone().addScaledVector(tg, -150).addScaledVector(nrm, -10);
  /* idle life every 1.5-3 s: head turns, a pointing hand, a wave, blinks, lamp flicker, a gull pass */
  const pt = ease(lt, 4.0, 4.8) * (1 - ease(lt, 7.4, 8.2)), wv = ease(lt, 10.5, 11.2) * (1 - ease(lt, 14.2, 14.9)), nod = Math.sin(T * 0.9);
  lamps.forEach((x, i) => { const fl = 0.5 + 0.5 * Math.sin(T * 5.3 + i * 1.9) * Math.sin(T * 2.1 + i); halos[i].scale.setScalar(1 + 0.18 * fl); halos[i].material.opacity = 0.45 + 0.3 * fl; });
  pose(R, { t: T, x: rp.x, z: rp.z, yaw: yawOut + PI + 0.25, walk: 0, headYaw: 0.15 + 0.35 * Math.sin(T * 0.55), headTilt: 3 * Math.sin(T * 0.8), arms: { l: { sz: 0.25, sx: 0.2, el: 0.5 }, r: { sz: 0.3 + 0.8 * pt, sx: 0.25 + 0.1 * pt, el: 0.6 - 0.3 * pt, curl: 0.7 * (1 - pt), point: pt > 0.5 } } }, 81); fs(R, rFace(T, { expr: 'smile', look: [0.3 * Math.sin(T * 0.5), 0.1] }));
  pose(B, { t: T, x: bp.x, z: bp.z, yaw: yawOut + PI - 0.3, walk: 0, headTilt: 4 * Math.sin(T * 0.7), headYaw: -0.1 + 0.3 * Math.sin(T * 0.45 + 1), arms: { r: { sz: 0.3 + 1.0 * wv, sx: 0.2 + 0.3 * wv, el: 0.4 - 0.1 * wv + 0.15 * Math.sin(T * 8) * wv }, l: {} } }, 81 + 4 * Math.max(0, Math.sin(T * 1.7)) * (nod > 0.8 ? 1 : 0)); fs(B, bFace(T, { expr: 'smile', look: [0.3, 0.2] }));
  gullFly(GULLS[0], T, Q.x - 300, Q.z - 700, 1100, 520, 0, 0.22);
  /* wide, high, far: chars small in the lower-left third, the centre band = calm sea only; slow 4 percent dolly */
  const dolly = 1 - 0.04 * lin(lt, 0, 18.8), D = 1900 * dolly;
  const cp = Q.clone().addScaledVector(nrm, D); cp.y = 800;
  const lk = Q.clone().addScaledVector(tg, 620 * dolly); lk.y = 474;
  return { p: [cp.x, cp.y, cp.z], l: [lk.x, lk.y, lk.z], fov: 31 };
}
