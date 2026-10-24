// games_d.js - helpers owned by the film_d / film_e builder (odt_haim2).
// Poses (count, handshake pump, rock-paper-scissors bounce, palm, stopwatch hold), evening windows, corner sheets with digits,
// the stopwatch prop, walking tracks, crowd formations.
import { THREE, ease, prog, clamp, lerp, walkTo, P } from './hall.js';
import { box, cyl, ball, canvasTex } from '../../lib/stage3d.js';
import { POSES } from '../../lib/figure3d.js';

export const D2R = Math.PI / 180;
export const face = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
export const angl = (a, b, u) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * u;
export const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

// ------------------------------------------------------------ poses
POSES.c1 = Object.assign({}, POSES.finger);   // one finger up
POSES.c2 = { armA: [-.45, 0, -.3], foreA: [-2.0, -.2, 0], armB: [-.45, 0, .3], foreB: [-2.0, .2, 0], point: { A: 1, B: 1 }, fist: { A: 1, B: 1 } };   // two fingers (one each hand)
POSES.c3 = { armA: [-.45, 0, -.35], foreA: [-2.0, -.2, 0], armB: [-.45, 0, .35], foreB: [-2.0, .2, 0], fist: { A: 0, B: 0 } };   // open hands up
// handshake pump levels 0..4 (right hand reaches across the midline, forearm pumps)
for (let k = 0; k <= 4; k++) { const u = k / 4; POSES['hs' + k] = { armB: [-1.25 + .28 * u, 0, -.22], foreB: [-.2 - .55 * u, 0, 0], fist: { B: .6 } }; }
export const hsG = u => 'hs' + clamp(Math.round(u * 4), 0, 4);
// rock-paper-scissors bounce levels 0..6 (fist bounces) + shapes
for (let k = 0; k <= 6; k++) { const u = k / 6; POSES['rb' + k] = { armB: [-1.35 + .6 * u, 0, -.05], foreB: [-.35 - .7 * u, 0, 0], fist: { B: 1 } }; }
export const rbG = (t, t0, per) => 'rb' + clamp(Math.round(6 * (.5 + .5 * Math.cos((t - t0) / (per || .55) * 2 * Math.PI + Math.PI))), 0, 6);
POSES.shP = { armB: [-1.2, 0, -.05], foreB: [-.5, 0, 0], fist: { B: 0 } };                         // open hand (paper / 4 fingers)
POSES.shS = { armB: [-1.2, 0, -.05], foreB: [-.5, 0, 0], point: { B: 1 }, fist: { B: 1 } };        // finger out (scissors / 2 fingers)
POSES.shR = { armB: [-1.2, 0, -.05], foreB: [-.5, 0, 0], fist: { B: 1 } };                         // fist (rock)
POSES.palm = { armB: [-1.3, 0, .08], foreB: [-.25, 0, 0], fist: { B: 0 } };                         // raised palm: stop
POSES.swatch = { armB: [-1.05, 0, .12], foreB: [-1.25, 0, 0], fist: { B: 1 } };                     // holds something up in front
POSES.btn = { armB: [-.55, 0, .1], foreB: [-1.9, -.5, 0], point: { B: 1 }, fist: { B: 1 } };       // finger to the coat
POSES.shoe = { chest: [.5, 0, 0], head: [.15, 0, 0], armB: [.15, 0, .2], foreB: [-.2, 0, 0], point: { B: 1 }, fist: { B: 1 } };   // bends and points at the shoe
POSES.pt2 = { armB: [-1.3, 0, .35], foreB: [-.1, 0, 0], point: { B: 1 }, fist: { B: 1 } };         // arm straight out, pointing
POSES.wS = Object.assign({}, POSES.shS, { armA: [-.2, 0, -1.9], foreA: [-.15, 0, -.1] });   // winner: fingers still out, other hand up first
POSES.wP = Object.assign({}, POSES.shP, { armA: [-.2, 0, -1.9], foreA: [-.15, 0, -.1] });
POSES.hand = { armB: [-.2, 0, 1.9], foreB: [-.15, 0, .1], fist: { B: 0 } };                         // hand raised high (asking)

// ------------------------------------------------------------ walking track
// keys: [[t,x,z,facing?]...]; segs: [[t0,t1,(t,b)=>state]]; base: (t,b)=>state ; hop: cheering hop height
export function track(keys, segs, base) {
  const rt = walkTo(keys);
  return t => {
    const b = rt(t); let s = null;
    for (const sg of segs || []) if (t >= sg[0] && t < sg[1]) { s = sg[2](t, b); break; }
    const out = Object.assign(b, base ? base(t, b) : {}, s || {});
    if (out.hop) { out.pos = [out.pos[0], out.hop * Math.abs(Math.sin(t * 6.5 + (out.hopPh || 0))), out.pos[2]]; }
    return out;
  };
}

// ------------------------------------------------------------ camera / hero helpers
export function orb(c, r, h, a0, a1, T, fov, ly) {
  return t => { const a = lerp(a0, a1, ease.io(prog(t, 0, T))) * D2R; return { pos: [c[0] + Math.sin(a) * r, h, c[1] + Math.cos(a) * r], look: [c[0], ly === undefined ? 1.3 : ly, c[1]], fov }; };
}
export function heroProxy(Wd, focus, sz) {
  sz = sz || [.5, 1.75, .3];
  const px = new THREE.Mesh(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), new THREE.MeshBasicMaterial()); px.material.visible = false; Wd.add(px);
  Wd.on(t => { const f = focus(t); px.position.set(f[0], sz[1] / 2, f[2]); });
  Wd.hero = { group: px }; return px;
}

// ------------------------------------------------------------ evening windows: blue-violet sky, no sun patches
export function evening(Wd) {
  Wd.scene.traverse(m => { if (m.isMesh && m.material && m.material.isMeshBasicMaterial && m.material.color && m.material.color.getHex() === 0xfff1cc) m.material.color.set(0x3f4596); });
  (Wd.patches || []).forEach(p => { p.visible = false; });
  return Wd;
}
export const EVE = { skyTop: 0x262a66, skyBottom: 0x6e5ca6, fogColor: 0xd8d0e0, sun: 1.25, hemi: 1.8 };

// ------------------------------------------------------------ a white A4 sheet with a big digit (scaled up so it reads in a wide shot)
export function sheet(Wd, digit, x, y, z, yaw, w, h) {
  w = w || 1.1; h = h || 1.55;
  const g = new THREE.Group();
  g.add(box(w, h, .02, 0xfdfcf8, { ink: false }));
  const tex = canvasTex(256, 360, (c, W, H) => { c.fillStyle = '#fdfcf8'; c.fillRect(0, 0, W, H); c.fillStyle = '#1f2a44'; c.font = 'bold 280px Arial, Helvetica, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(digit), W / 2, H / 2 + 12); });
  const dm = new THREE.Mesh(new THREE.PlaneGeometry(w * .94, h * .94), new THREE.MeshBasicMaterial({ map: tex })); dm.position.z = .012; g.add(dm);
  g.position.set(x, y, z); g.rotation.y = yaw; Wd.add(g); return g;
}
// the four corner sheets of the hall (back wall left/right, left wall near the back, right wall near the back)
export const SHEETS = [
  { d: 1, x: -10, z: -11.93, yaw: 0, to: [-10, -9.2], f: 0 },
  { d: 2, x: 10, z: -11.93, yaw: 0, to: [10, -9.2], f: 0 },
  { d: 3, x: -15.93, z: -5.6, yaw: Math.PI / 2, to: [-13.4, -5.6], f: Math.PI / 2 },
  { d: 4, x: 15.93, z: -7.4, yaw: -Math.PI / 2, to: [13.4, -7.4], f: -Math.PI / 2 },
];
export function cornerSheets(Wd, vis) {   // vis(t) -> 0..1 (scale pop); undefined = always there
  const gs = SHEETS.map(s => sheet(Wd, s.d, s.x, 2.4, s.z, s.yaw));
  if (vis) Wd.on(t => gs.forEach((g, i) => { const u = clamp(vis(t, i), 0, 1); g.visible = u > .01; g.scale.setScalar(.2 + .8 * ease.out(u)); }));
  return gs;
}

// ------------------------------------------------------------ the stopwatch (small silver disc with a white face) in a hand bone
export function stopwatch(Wd, Pn) {
  let done = false;
  Wd.on(() => {
    if (done || !Pn.figure) return; done = true;
    const h = Pn.figure.bones.handB.userData.hand, g = new THREE.Group();
    g.add(cyl(.045, .045, .02, 0xc9ccd2, { pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], inkW: .004 }));
    g.add(cyl(.036, .036, .004, 0xffffff, { pos: [0, 0, .012], rot: [Math.PI / 2, 0, 0], ink: false }));
    g.add(cyl(.008, .008, .02, 0xc9ccd2, { pos: [0, .055, 0], ink: false }));
    g.position.set(0, -.1, .02); h.add(g);
  });
}

// ------------------------------------------------------------ crowd formation (D4): member j of a crowd with leader at A facing f
export function rowpos(A, f, j) {
  if (j === 0) return [A[0], A[1]];
  const row = Math.ceil(j / 2), lat = (j % 2 ? -1 : 1) * .6, back = .85 * row, fx = Math.sin(f), fz = Math.cos(f);
  return [A[0] - fx * back + (-fz) * lat, A[1] - fz * back + fx * lat];
}
export { P, box, cyl, ball, canvasTex, THREE, ease, prog, clamp, lerp };
