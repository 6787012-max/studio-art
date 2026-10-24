// games_b.js - helpers for odt_haim2/film_b (owned by the film_b builder).
//   actor(Wd, look, fn, o)  : like men(), plus fn(t) may return  ik:{A:[x,y,z],B:..} (world targets for the hands),
//                             ikL:{A:[x,y,z]} (targets in figure-local coordinates), pose:{...bones} (extra bone angles).
//                             The arm(s) with a target are solved with a 2-link IK, so hands really meet things.
//   bodyPt(st,lx,ly,lz)     : figure-local point -> world point for a state {pos,facing,scale}
//   rodProp / chickenProp   : the only props of this film (grey rod, soft yellow chicken)
//   holdSheet / footSheet   : coloured A5 paper in a hand / under a foot
//   polar, fcg, bump, heroProxy, shuffle
import { THREE, ease, prog, clamp, lerp, rng } from './hall.js';
import { men } from './people_v2.js';
import { walkPose } from '../../lib/figure3d.js';
import { box, cyl, ball } from '../../lib/stage3d.js';
export { ease, prog, clamp, lerp, rng };

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const REST = { A: { u: V3(-.12, -.26, -.01).normalize(), f: V3(-.1, -.235, .04).normalize() }, B: { u: V3(.12, -.26, -.01).normalize(), f: V3(.1, -.235, .04).normalize() } };
const L1 = Math.hypot(.12, .26, .01), L2 = Math.hypot(.1, .235, .04);
const SH = { A: [-.215, 1.43, 0], B: [.215, 1.43, 0] };

// ---------------------------------------------------------------- math helpers
export const polar = (r, aDeg, cx, cz) => { const a = aDeg * Math.PI / 180; return [(cx || 0) + Math.sin(a) * r, (cz || 0) + Math.cos(a) * r]; };
export const fcg = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
export const bump = (t, a, b, c, d) => ease.sm(prog(t, a, b)) - ease.sm(prog(t, c, d));
export function shuffle(arr, seed) { const r = rng(seed), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function bodyPt(st, lx, ly, lz) {
  const sc = .95 * (st.scale || 1), f = st.facing || 0, c = Math.cos(f), s = Math.sin(f), p = st.pos;
  return [p[0] + (lx * c + lz * s) * sc, (p[1] || 0) + ly * sc, p[2] + (-lx * s + lz * c) * sc];
}
export const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
// invisible box used as the "hero" of crowd shots (the gate needs something on screen)
export function heroProxy(Wd, c, size) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), new THREE.MeshBasicMaterial()); m.material.visible = false;
  m.position.set(c[0], c[1], c[2]); Wd.add(m); Wd.hero = { group: m }; return m;
}

// ---------------------------------------------------------------- arm IK
function limb(side, up, fo, th) {
  const inv = new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), -(th || 0));
  const u = up.clone().normalize().applyQuaternion(inv), f = fo.clone().normalize().applyQuaternion(inv);
  const qU = new THREE.Quaternion().setFromUnitVectors(REST[side].u, u);
  const qF = new THREE.Quaternion().setFromUnitVectors(REST[side].f, f.applyQuaternion(qU.clone().invert()));
  const e1 = new THREE.Euler().setFromQuaternion(qU, 'XYZ'), e2 = new THREE.Euler().setFromQuaternion(qF, 'XYZ');
  return { ['arm' + side]: [e1.x, e1.y, e1.z], ['fore' + side]: [e2.x, e2.y, e2.z] };
}
// T: wrist target in figure coordinates (group frame). o: {y: body drop, lean: hips pitch, pole: [x,y,z]}
export function reachPose(side, T, o) {
  o = o || {}; const th = o.lean || 0, c = Math.cos(th), s = Math.sin(th), S0 = SH[side];
  const S = V3(S0[0], .95 + (S0[1] - .95) * c + (o.y || 0), (S0[1] - .95) * s);
  const d = T.clone().sub(S); let D = d.length() || 1e-3; const n = d.clone().divideScalar(D);
  const Dmax = (L1 + L2) * .985, Dmin = Math.abs(L1 - L2) + .03; D = clamp(D, Dmin, Dmax);
  const Tc = S.clone().addScaledVector(n, D), a = (L1 * L1 - L2 * L2 + D * D) / (2 * D), h = Math.sqrt(Math.max(L1 * L1 - a * a, 0));
  const sx = side === 'A' ? -1 : 1, pole = o.pole ? V3(...o.pole) : V3(sx * .5, -1, -.15);
  pole.addScaledVector(n, -pole.dot(n)); if (pole.lengthSq() < 1e-6) pole.set(0, -1, 0); pole.normalize();
  const E = S.clone().addScaledVector(n, a).addScaledVector(pole, h);
  return limb(side, E.clone().sub(S), Tc.clone().sub(E), th);
}

export function actor(Wd, look, fn, o) {
  const P = men(Wd, look, fn, o);
  Wd.on(t => {
    if (!P.figure) return;
    const s = fn(t); if (!s.ik && !s.ikL && !s.pose) return;
    const sc = .95 * (s.scale || 1), f = s.facing || 0, cf = Math.cos(f), sf = Math.sin(f), pos = s.pos;
    let p = (s.walk !== undefined && s.walk !== null && s.walk !== false) ? walkPose(s.walk, 1) : {};
    if (s.pose) p = Object.assign(p, s.pose);
    const lean = (s.pose && s.pose.hips) ? s.pose.hips[0] : 0;
    if (lean && !(s.pose.thighA)) { p.thighA = [-lean, 0, 0]; p.thighB = [-lean, 0, 0]; }
    const opt = { y: p.y || 0, lean };
    for (const side of ['A', 'B']) {
      let T = null;
      if (s.ikL && s.ikL[side]) T = V3(...s.ikL[side]);
      else if (s.ik && s.ik[side]) { const w = s.ik[side], dx = w[0] - pos[0], dz = w[2] - pos[2]; T = V3((dx * cf - dz * sf) / sc, (w[1] - (pos[1] || 0)) / sc, (dx * sf + dz * cf) / sc); }
      if (T) Object.assign(p, reachPose(side, T, opt));
    }
    P.figure.pose(p);
  });
  return P;
}

// ---------------------------------------------------------------- props
const PAPER = { red: 0xd23a32, blue: 0x2f66c8, green: 0x2f9a4d, yellow: 0xf2c22e };
export { PAPER };
export function rodProp(Wd, fn, rad) {   // the thin light-grey rod, 2.2 m. fn(t) -> {c:[x,y,z], yaw}
  const g = new THREE.Group(), r = cyl(rad || .014, rad || .014, 2.2, 0xc8ccd2, { inkW: .004 }); r.rotation.z = Math.PI / 2; g.add(r); Wd.add(g);
  Wd.on(t => { const s = fn(t); g.position.set(s.c[0], s.c[1], s.c[2]); g.rotation.y = s.yaw || 0; });
  return g;
}
export function chickenProp(Wd, fn) {   // small soft yellow rubber chicken. fn(t) -> {pos:[x,y,z], yaw, pitch, roll}
  const g = new THREE.Group(), yel = 0xf6d23a, org = 0xf08a24, red = 0xd8433a, k = { inkW: .004 };
  const body = ball(.1, yel, k); body.scale.set(1, .82, 1.3); g.add(body);
  const head = ball(.062, yel, k); head.position.set(0, .1, .13); g.add(head);
  const beak = cyl(0, .024, .06, org, k); beak.rotation.x = Math.PI / 2; beak.position.set(0, .095, .2); g.add(beak);
  const comb = ball(.022, red, k); comb.position.set(0, .17, .12); comb.scale.set(.7, 1, 1.3); g.add(comb);
  const tail = box(.05, .09, .03, yel, k); tail.position.set(0, .07, -.15); tail.rotation.x = -.7; g.add(tail);
  for (const sx of [-1, 1]) { const w = ball(.055, yel, k); w.scale.set(.35, .8, 1.2); w.position.set(sx * .1, .02, -.01); w.rotation.z = sx * .3; g.add(w);
    const lg = cyl(.01, .01, .07, org, k); lg.position.set(sx * .04, -.11, .03); g.add(lg); }
  g.scale.setScalar(1.45); Wd.add(g);
  Wd.on(t => { const s = fn(t); g.position.set(s.pos[0], s.pos[1], s.pos[2]); g.rotation.set(s.pitch || 0, s.yaw || 0, s.roll || 0, 'YXZ'); });
  return g;
}
export function holdSheet(Wd, P, side, color) {   // coloured A5 sheet in the hand
  let done = false;
  Wd.on(() => { if (done || !P.figure) return; done = true; const h = P.figure.bones['hand' + side].userData.hand;
    const m = box(.17, .24, .006, PAPER[color], { ink: false }); m.castShadow = false; m.position.set(0, -.12, .035); h.add(m); });
}
export function footSheet(Wd, P, side, color) {   // coloured A5 sheet under the foot
  let done = false;
  Wd.on(() => { if (done || !P.figure) return; done = true; const fb = P.figure.bones['foot' + side];
    const m = box(.17, .007, .24, PAPER[color], { ink: false }); m.castShadow = false; m.position.set(0, -.088, .05); fb.add(m); });
}
