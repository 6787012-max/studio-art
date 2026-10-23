// ks65lib.js - shared module for the ks65_3d vertical film (1080x1920). Everything is a pure function of absolute film time T.
// Each shot builds the SAME world (populate) and reads the full-film script, so cuts between shots are seamless.
import { THREE, world, person, box, cyl, ball, mesh, toon, canvasTex, groundTex, ease, prog, clamp, lerp, rng } from '../../lib/stage3d.js';
import { shake } from '../../lib/motion3d.js';
import * as P from '../../lib/props3d.js';

// ---------------- constants ----------------
export const PAL = { skyTop: 0x1e1814, skyBottom: 0x5a3a26, fog: 0x2a201a, ember: 0xff7a2f, gold: 0xffb347, cream: 0xfff3e0, ash: 0x7d7268, charcoal: 0x120c09 };
export const A_LOOK = { coat: '#3a2a24', beard: '#2a1d16', beardLen: .75, hat: 'kippa', skin: '#e6b995', pants: '#1c1613' };   // the one who curses
export const B_LOOK = { coat: '#7a4a2a', beard: '#7d6a5a', beardLen: .75, hat: 'kippa', skin: '#efcaa6', pants: '#2b1f17' };   // the hero
export const DUR = [14.6, 7.2, 7.1, 8.3, 16.2, 5.67];            // sums to 59.07
export const T0S = [0, 14.6, 21.8, 28.9, 37.2, 53.4];
const PI = Math.PI;

// ---------------- generic helpers ----------------
const glowCache = {};
function glowTex(rgb) { return glowCache[rgb] || (glowCache[rgb] = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, `rgba(${rgb},1)`); r.addColorStop(.3, `rgba(${rgb},.45)`); r.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = r; g.fillRect(0, 0, w, h); })); }
export function glow(Wd, rgb, size, op, o) {
  o = o || {};
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(rgb), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: o.depthTest !== false, fog: false, transparent: true, opacity: op === undefined ? 1 : op }));
  s.scale.set(size, size, 1); s.visible = false; if (o.order) s.renderOrder = o.order; Wd.add(s); return s;
}
const addMat = (hex, op) => new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
const basic = hex => new THREE.MeshBasicMaterial({ color: hex });
const UP = new THREE.Vector3(0, 1, 0), RIGHT = new THREE.Vector3(1, 0, 0);
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
const bez = (p0, p1, p2, p3, k) => { const m = 1 - k; return [0, 1, 2].map(i => m * m * m * p0[i] + 3 * m * m * k * p1[i] + 3 * m * k * k * p2[i] + k * k * k * p3[i]); };
const bump = (T, a, b, fi, fo) => Math.min(prog(T, a, a + fi), 1 - prog(T, b - fo, b));      // 0..1..0 window

// hermite spline through keys [[T, [..numbers..]], ...] with finite-difference tangents (zero speed at both ends)
function spline(keys) {
  const n = keys.length;
  const tan = keys.map((k, i) => { if (i === 0 || i === n - 1) return keys[0][1].map(() => 0); const a = keys[i - 1], b = keys[i + 1]; return k[1].map((_, j) => (b[1][j] - a[1][j]) / (b[0] - a[0])); });
  return T => {
    T = clamp(T, keys[0][0], keys[n - 1][0]); let i = 0; while (i < n - 2 && T > keys[i + 1][0]) i++;
    const t0 = keys[i][0], t1 = keys[i + 1][0], h = t1 - t0, u = (T - t0) / h, u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    return keys[i][1].map((v, j) => h00 * v + h10 * h * tan[i][j] + h01 * keys[i + 1][1][j] + h11 * h * tan[i + 1][j]);
  };
}
const impulse = (T, t, dur, amp) => (T > t && T < t + dur ? amp * Math.exp(-(T - t) * 7) * (1 - prog(T, t + dur * .6, t + dur)) : 0);
function withShake(f, imps) {
  return T => {
    const c = f(T); let a = 0; for (const [t, d, m] of imps) a += impulse(T, t, d, m); if (!a) return c;
    return { pos: [c.pos[0] + shake(T, a, 14, 1), c.pos[1] + shake(T, a, 14, 2), c.pos[2] + shake(T, a * .5, 14, 3)], look: [c.look[0] + shake(T, a * .5, 14, 4), c.look[1] + shake(T, a * .5, 14, 5), c.look[2]], fov: c.fov };
  };
}

// ---------------- camera segments (one per continuous run of shots) ----------------
// SegA: s1 (slow push-in) + s2 (crane up and back, sky source enters the top of frame)
const segA = spline([
  [0,    [1.0, 1.55, 7.5,  0, .92, 0,  40]],
  [10,   [.8, 1.5, 7.05,  0, .96, 0,  38.5]],
  [16,   [.55, 1.5, 6.75,  0, 1.0, 0,  37]],
  [21.8, [1.25, 2.45, 8.1,  0, 1.35, 0,  40]],
]);
// SegB: s3 low angle on A + slow orbit, s4 orbit 180 deg (az in degrees around the pair), settle on B + A
const segBraw = spline([
  [21.8, [24, 5.55, .38, .15, 1.72, 0, 49]],
  [28.9, [9, 5.45, .55, 0, 1.62, 0, 47]],
  [31.0, [98, 6.0, 1.0, 0, 1.4, 0, 42]],
  [33.0, [187, 6.7, 1.45, -.15, 1.3, 0, 38]],
  [37.2, [192, 6.1, 1.45, -.35, 1.27, 0, 37]],
]);
const segB = T => { const s = segBraw(T), a = s[0] * PI / 180; return { pos: [s[3] + Math.sin(a) * s[1], s[2], s[5] + Math.cos(a) * s[1]], look: [s[3], s[4], s[5]], fov: s[6] }; };
// SegC: s5 lateral dolly left->right with slight push-in, s6 push-in to B (camera on the -z side after the flip)
const segCraw = spline([
  [37.2, [1.9, 1.5, -6.4,  .05, 1.25, 0,  38]],
  [45,   [.25, 1.5, -6.2,  -.05, 1.25, 0,  37]],
  [53.4, [-1.3, 1.5, -5.7,  -.1, 1.3, 0,  36]],
  [58.4, [-.85, 1.45, -4.3,  -.5, 1.32, 0,  35]],
]);
const mk = f => T => { const s = f(T); return { pos: [s[0], s[1], s[2]], look: [s[3], s[4], s[5]], fov: s[6] }; };
export const CAMS = [
  withShake(mk(segA), [[5.5, .35, .06]]), withShake(mk(segA), [[5.5, .35, .06]]),
  segB, withShake(segB, [[33.1, .5, .09]]),
  mk(segCraw), mk(segCraw),
];
// stage rotation phi (0 -> PI) drives the lights so the sun stays screen-left after the 180 deg flip
export const phi = T => PI * ease.io(prog(T, 29.3, 32.8));

// ---------------- people / script ----------------
const half = T => lerp(.85, .675, ease.io(prog(T, 33, 37)));
const sgn = T => 1 - 2 * ease.io(prog(T, 29.3, 32.7));
export const gestA = T => T < 12 ? 'point' : T < 16 ? 'rest' : T < 17.6 ? 'shrug' : T < 22 ? 'rest' : T < 28.9 ? 'up' : T < 48 ? 'rest' : T < 53.4 ? 'heart' : 'rest';
export const gestB = T => T < 5.5 ? 'rest' : T < 9 ? 'shrug' : T < 14.6 ? 'think' : T < 16.6 ? 'point' : T < 22 ? 'rest' : T < 28.9 ? 'think' : T < 34.7 ? 'rest' : T < 37.2 ? 'wide' : T < 53.4 ? 'offer' : T < 54.2 ? 'rest' : T < 55.95 ? 'thumb' : 'pray';
const stA = T => ({
  pos: [half(T), 0, 0], facing: -PI / 2 + .5 * sgn(T), gesture: gestA(T), seed: .21,
  talk: T < 12 ? .55 + .45 * Math.sin(T * 9.3) * Math.sin(T * 2.1) : (T > 56 ? 0 : .0),
  brow: (T < 12 ? -.55 : 0) + (T > 41 && T < 44.5 ? .9 : 0),
  smile: T < 12 ? 0 : lerp(.25, .95, prog(T, 45.5, 47.5)),
});
const stB = T => ({
  pos: [-half(T), 0, 0], facing: PI / 2 - .5 * sgn(T), gesture: gestB(T), seed: .63,
  talk: T > 14.6 && T < 16.6 ? .55 + .45 * Math.sin(T * 10) : (T > 54.2 && T < 56 ? .5 + .5 * Math.sin(T * 8.5) : 0),
  brow: T > 14.4 && T < 16.8 ? -.8 : 0,
  smile: Math.max(.12, ease.io(prog(T, 33.2, 34.6)) * .9 * (1 - prog(T, 56, 57)) + prog(T, 56, 57) * .45),
});
const headTilt = (P, x, y) => { const h = P.figure && P.figure.bones && P.figure.bones.head; if (!h) return; h.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y || 0, 0))); };
const tipOf = (P, side, out) => { const F = P.figure; if (!F) return false; const h = F.bones['hand' + side], f = F.bones['fore' + side]; h.getWorldPosition(out); f.getWorldPosition(_d); out.addScaledVector(_c.copy(out).sub(_d).normalize(), .16); return true; };
const boneAt = (P, name, out) => { const F = P.figure; if (!F || !F.bones[name]) return false; F.bones[name].getWorldPosition(out); return true; };

// ---------------- the courtyard ----------------
function windowsOn(g, w, h, d, seed, lit) {
  const r = rng(seed), cols = Math.max(2, Math.floor(w / 1.7)), rows = Math.max(1, Math.floor((h - 1.4) / 1.9));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = -w / 2 + (i + .5) * w / cols, y = 2.1 + j * 1.9, on = r() < lit;
    g.add(mesh(new THREE.BoxGeometry(1.0, 1.3, .1), toon(0x241a15), { pos: [x, y, d / 2 + .03], ink: false }));
    const pane = new THREE.Mesh(new THREE.BoxGeometry(.78, 1.08, .06), basic(on ? (r() < .5 ? 0xffb04a : 0xffc878) : 0x2c2420)); pane.position.set(x, y, d / 2 + .09); g.add(pane);
    g.add(mesh(new THREE.BoxGeometry(.8, .06, .1), toon(0x3a2c22), { pos: [x, y - .6, d / 2 + .12], ink: false }));
  }
}
function block(Wd, x, z, w, h, d, rotY, col, seed, lit, door) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; Wd.add(g);
  g.add(box(w, h, d, col, { pos: [0, h / 2, 0] })); g.add(box(w + .3, .3, d + .3, 0x4a3c32, { pos: [0, h + .15, 0] }));
  windowsOn(g, w, h, d, seed, lit);
  if (door) { g.add(mesh(new THREE.BoxGeometry(1.5, 2.5, .12), toon(0x2a1a10), { pos: [door, 1.25, d / 2 + .06], ink: false })); g.add(mesh(new THREE.CylinderGeometry(.75, .75, .12, 20, 1, false, 0, PI), toon(0x2a1a10), { pos: [door, 2.5, d / 2 + .06], rot: [PI / 2, 0, 0], ink: false }));
    const lt = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, .06), basic(0xff9a3a)); lt.position.set(door, 1.1, d / 2 + .13); g.add(lt); }
  return g;
}
function courtyard(Wd) {
  const gm = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshLambertMaterial({ map: groundTex('stone', [40, 40]), color: 0x6c5948 }));
  gm.rotation.x = -PI / 2; gm.receiveShadow = true; Wd.add(gm);
  const wall = [0x65564a, 0x6f5f50, 0x5c4e43, 0x74644f, 0x62523f];
  block(Wd, -4.2, -9.5, 5.6, 7.5, 4, 0, wall[0], 3, .65, 1.2);
  block(Wd, 3.4, -10.5, 6.4, 6, 4, 0, wall[1], 5, .55);
  block(Wd, -4.0, 9.5, 6.0, 6.8, 4, PI, wall[2], 7, .6);
  block(Wd, 4.2, 10, 5.2, 8.2, 4, PI, wall[3], 9, .6);
  block(Wd, 9.8, -1, 6.5, 6.4, 4, -PI / 2, wall[4], 11, .6);
  block(Wd, 10.2, 7, 5.0, 5.4, 4, -PI / 2, wall[1], 13, .5);
  block(Wd, -9.8, 1, 6.5, 7.2, 4, PI / 2, wall[2], 15, .6, -1.6);
  block(Wd, -10.4, -7, 5.0, 5.6, 4, PI / 2, wall[0], 17, .55);
  // distant silhouettes
  const r = rng(21); for (let i = 0; i < 18; i++) { const a = i / 18 * PI * 2 + r() * .2, R = 26 + r() * 8, w = 4 + r() * 5, h = 5 + r() * 8; const b = box(w, h, 4, 0x3a2e26, { pos: [Math.cos(a) * R, h / 2, Math.sin(a) * R], rot: [0, -a, 0], ink: false }); Wd.add(b); }
  // props: benches, street lamps, a low stone wall
  P.bench(Wd, { pos: [-5.5, 0, -6.6], rot: 0 }); P.bench(Wd, { pos: [5.8, 0, -7.0], rot: -.15 }); P.bench(Wd, { pos: [-6.5, 0, 6.2], rot: PI + .2 });
  P.lamp(Wd, { pos: [-3.2, 0, -6.2], kind: 'lamp', seed: 1 }); P.lamp(Wd, { pos: [3.6, 0, -6.4], kind: 'lamp', seed: 2 });
  P.lamp(Wd, { pos: [-3.4, 0, 6.4], kind: 'lamp', seed: 3 }); P.lamp(Wd, { pos: [3.8, 0, 6.6], kind: 'lamp', seed: 4 });
  P.lamp(Wd, { pos: [7.2, 0, 0], kind: 'lamp', seed: 5 }); P.lamp(Wd, { pos: [-7.2, 0, -1], kind: 'lamp', seed: 6 });
  P.wall(Wd, { pos: [7, 0, -6.2], len: 4, rot: .35 }); P.wall(Wd, { pos: [-7, 0, 5], len: 3.4, rot: -.3 });
  P.pathStones(Wd, { pts: [[0, -9], [0, -4]], step: 1.1 }); 
}

// ---------------- props ----------------
function arrowObj(Wd) {
  const g = new THREE.Group(); g.visible = false; Wd.add(g);
  const O = toon(0xff7a2f, { emissive: 0xc2480f }), G = toon(0xffb347, { emissive: 0x8a5a10 });
  g.add(mesh(new THREE.CylinderGeometry(.04, .04, .44, 16), O, { rot: [0, 0, PI / 2], pos: [-.06, 0, 0], inkW: .012 }));
  g.add(mesh(new THREE.ConeGeometry(.105, .22, 20), O, { rot: [0, 0, -PI / 2], pos: [.27, 0, 0], inkW: .014 }));
  for (const rz of [0, PI / 2]) g.add(mesh(new THREE.BoxGeometry(.13, .01, .1), G, { pos: [-.25, 0, 0], rot: [rz, 0, 0], ink: false }));
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('255,140,50'), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: .8 })); gl.scale.set(.7, .7, 1); gl.position.set(-.25, 0, 0); g.add(gl);
  return { g, gl };
}
function setArrow(a, pos, dir, sc, glowOp, glowSz) {
  a.g.visible = sc > .001; if (!a.g.visible) return;
  a.g.position.set(pos[0], pos[1], pos[2]); a.g.scale.setScalar(sc);
  a.g.quaternion.setFromUnitVectors(RIGHT, _a.set(dir[0], dir[1], dir[2]).normalize());
  a.gl.material.opacity = glowOp; a.gl.scale.setScalar(glowSz);
}
function flowerObj(Wd, i) {
  const root = new THREE.Group(); root.visible = false; Wd.add(root);
  const stem = cyl(.012, .012, 1, 0x6f9a52, { ink: false, pos: [0, .5, 0] }); const stemG = new THREE.Group(); stemG.add(stem); root.add(stemG);
  const head = new THREE.Group(); root.add(head);
  const pet = i % 2 ? 0xffc9a0 : 0xfff3e0;
  for (let k = 0; k < 6; k++) { const a = k / 6 * PI * 2; head.add(ball(.062, k % 2 ? pet : 0xfff3e0, { pos: [Math.cos(a) * .08, Math.sin(a) * .08, 0], scale: [1, 1, .55], inkW: .005 })); }
  head.add(ball(.052, 0xffb347, { pos: [0, 0, .035], inkW: .005 }));
  return { root, stemG, head };
}

// ---------------- populate: the whole film world; t0 = this shot's start ----------------
export function populate(Wd, t0, shotIdx) {
  courtyard(Wd);
  // lights that turn with the stage
  const fill = new THREE.DirectionalLight(0xffd7a8, .5); fill.position.set(2, 4, 10); Wd.add(fill); Wd.add(fill.target);
  const rim = new THREE.DirectionalLight(0xff8a3a, 1.0); rim.position.set(1, 5, -10); Wd.add(rim); Wd.add(rim.target);
  const sunBase = [-26, 11, 9], fillBase = [2, 4, 10], rimBase = [1, 5, -10];
  const goldL = new THREE.DirectionalLight(0xffc060, 0); goldL.position.set(.3, 12, 1.2); Wd.add(goldL); Wd.add(goldL.target);

  const pa = person(Wd, A_LOOK, lt => stA(lt + t0)), pb = person(Wd, B_LOOK, lt => stB(lt + t0));
  Wd.hero = pb;

  // gold light cone (s2) + thread (s3)
  const HT = 15;
  const coneO = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 2.0, 1, 40, 1, true), addMat(0xffb347, .09)); coneO.renderOrder = 3; Wd.add(coneO);
  const coneI = new THREE.Mesh(new THREE.CylinderGeometry(.45, .95, 1, 32, 1, true), addMat(0xffd27a, .1)); coneI.renderOrder = 3; Wd.add(coneI);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(2.3, 40), addMat(0xffb347, .3)); pool.rotation.x = -PI / 2; pool.position.y = .04; pool.renderOrder = 2; Wd.add(pool);
  const thread = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, 1, 8), basic(0xffe3a0)); Wd.add(thread);
  const threadHalo = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, 1, 10, 1, true), addMat(0xffb347, .3)); threadHalo.renderOrder = 4; Wd.add(threadHalo);
  const tHead = glow(Wd, '255,225,150', .9, .9), tBead = [0, 1, 2].map(() => glow(Wd, '255,225,150', .32, .9));

  // arrows
  const ar1 = arrowObj(Wd), ar2 = arrowObj(Wd), hit1 = glow(Wd, '255,150,60', 1, 1), hit2 = glow(Wd, '255,150,60', 1, 1);
  const S1 = [-.24, 1.2, .26], S2 = [.24, 1.42, .14];
  // halo around A (s4), glow on B chest (s6)
  const halo = glow(Wd, '255,200,110', 3.2, .8), chestGlow = glow(Wd, '255,205,120', 1, .8, { depthTest: false, order: 6 });
  // gift
  const gift = new THREE.Group(); gift.visible = false; Wd.add(gift);
  gift.add(box(.36, .22, .3, 0xff7a2f, { pos: [0, 0, 0] })); gift.add(box(.075, .225, .305, 0xffb347, { pos: [0, 0, 0], inkW: .006 })); gift.add(box(.365, .225, .07, 0xffb347, { pos: [0, 0, 0], inkW: .006 }));
  gift.add(mesh(new THREE.BoxGeometry(.3, .01, .24), toon(0x2a1608), { pos: [0, .112, 0], ink: false }));
  const lidP = new THREE.Group(); lidP.position.set(0, .11, -.15); gift.add(lidP);
  lidP.add(box(.4, .07, .34, 0xf06a22, { pos: [0, .035, .17] })); lidP.add(box(.08, .075, .345, 0xffb347, { pos: [0, .037, .17], inkW: .005 })); lidP.add(box(.405, .075, .075, 0xffb347, { pos: [0, .037, .17], inkW: .005 }));
  lidP.add(ball(.05, 0xffb347, { pos: [-.045, .1, .17], inkW: .005 })); lidP.add(ball(.05, 0xffb347, { pos: [.045, .1, .17], inkW: .005 }));
  const giftGlow = glow(Wd, '255,200,110', .9, .9);
  const flowers = [0, 1, 2, 3, 4, 5, 6].map(i => flowerObj(Wd, i));
  const FS = [[-.14, 0, 46.5], [.12, .05, 47.3], [-.04, -.04, 48.1], [.18, -.02, 48.9], [-.2, .05, 49.7], [.05, .06, 50.5], [.0, -.02, 51.2]];
  const spark = Array.from({ length: 30 }, () => glow(Wd, '255,215,130', .1, .9));
  const sr = rng(77), SP = spark.map((_, i) => ({ b: 47.5 + sr() * 5.2, ox: (sr() - .5) * .8, oz: (sr() - .5) * .4, sz: .08 + sr() * .1, dur: 1.6 + sr() * 1.2 }));
  const dust = Array.from({ length: 80 }, () => glow(Wd, '255,215,130', .1, .9));
  const dr = rng(31), DU = dust.map(() => ({ b: 54.8 + dr() * 2.2, ox: (dr() - .5) * .85, oz: (dr() - .5) * .5, sz: .07 + dr() * .09, sp: .9 + dr() * .5 }));
  // fade-to-charcoal plate attached to the camera (last shot only)
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(8, 14), new THREE.MeshBasicMaterial({ color: PAL.charcoal, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false }));
  plate.renderOrder = 999; plate.visible = false; Wd.add(plate);

  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
  Wd.on((lt, cam) => {
    const T = lt + t0;
    // --- head tilts (look up) ---
    const upA = bump(T, 17, 30, 1.2, 1.2), upB = bump(T, 17, 22, 1.0, .8);
    headTilt(pa, -.5 * upA); headTilt(pb, -.42 * upB, .2 * bump(T, 22, 29, 1, 1) * -1);
    // --- lights ---
    const ph = phi(T), c = Math.cos(ph), s = Math.sin(ph), rot = p => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    Wd.sun.position.set(...rot(sunBase)); fill.position.set(...rot(fillBase)); rim.position.set(...rot(rimBase));
    goldL.intensity = .8 * ease.io(prog(T, 16, 21)) * (1 - ease.io(prog(T, 30, 35)));
    // --- arrow 1 : A -> B ---
    const hasA = tipOf(pa, 'B', v1);
    if (T < .5 || !hasA) ar1.g.visible = false, hit1.visible = false;
    else {
      const tip = [v1.x, v1.y, v1.z], st0 = [tip[0] - .32, tip[1] + .02, tip[2] + .04];
      const fade = 1 - ease.in(prog(T, 27, 28.5)), pulse = 1 + .08 * Math.sin(T * 12);
      if (T < 2.2) { const sc = ease.out(prog(T, .5, 1.6)); setArrow(ar1, st0, [-1, .05, 0], sc * fade, .5 + .3 * Math.sin(T * 9), (.5 + .5 * sc) * pulse * 1.3); }
      else if (T < 5.5) {
        const k = ease.in(prog(T, 2.2, 5.5)), p = bez(st0, [.95, 2.0, .45], [-.75, 2.05, .5], S1, k), p2 = bez(st0, [.95, 2.0, .45], [-.75, 2.05, .5], S1, Math.min(1, k + .01)), p1 = bez(st0, [.95, 2.0, .45], [-.75, 2.05, .5], S1, Math.max(0, k - .01));
        setArrow(ar1, p, [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]], 1, .9, 1.0);
      } else {
        const e = T - 5.5, w = .03 * Math.exp(-e * 5) * Math.sin(e * 38);
        setArrow(ar1, [S1[0] + w, S1[1], S1[2]], [-1, -.12, -.06], fade, .6 + .15 * Math.sin(T * 8), .6);
        hit1.visible = e < 1.2; if (hit1.visible) { hit1.position.set(S1[0] - .3, S1[1], S1[2] + .05); hit1.scale.setScalar(.4 + 2.2 * Math.exp(-e * 4.5)); hit1.material.opacity = Math.exp(-e * 2.8); }
      }
    }
    // --- arrow 2 : B -> A ---
    const hasB = tipOf(pb, 'B', v2);
    if (T < 14.6 || !hasB) { ar2.g.visible = false; hit2.visible = false; }
    else {
      const fade = 1 - ease.in(prog(T, 27, 28.5)), st0 = [v2.x + .3, v2.y + .02, v2.z + .05], c1 = [-.7, 1.95, .5], c2 = [.65, 2.0, .4];
      if (T < 16.0) {
        const k = ease.in(prog(T, 14.6, 16.0)), p = bez(st0, c1, c2, S2, k), pa2 = bez(st0, c1, c2, S2, Math.min(1, k + .01)), pb2 = bez(st0, c1, c2, S2, Math.max(0, k - .01));
        setArrow(ar2, p, [pa2[0] - pb2[0], pa2[1] - pb2[1], pa2[2] - pb2[2]], ease.out(prog(T, 14.6, 15.0)), .9, 1.0);
      } else {
        const e = T - 16.0, w = .03 * Math.exp(-e * 5) * Math.sin(e * 38);
        setArrow(ar2, [S2[0] - w, S2[1], S2[2]], [1, -.1, -.04], fade, .6 + .15 * Math.sin(T * 8 + 1), .6);
        hit2.visible = e < 1.2; if (hit2.visible) { hit2.position.set(S2[0] + .3, S2[1], S2[2] + .05); hit2.scale.setScalar(.4 + 2.2 * Math.exp(-e * 4.5)); hit2.material.opacity = Math.exp(-e * 2.8); }
      }
    }
    // --- gold cone (16-21), persists, fades 31-36 ---
    const kc = ease.io(prog(T, 16, 21)), fc = 1 - ease.io(prog(T, 31, 36)), Hc = HT * kc;
    const showC = kc > .001 && fc > .001;
    coneO.visible = coneI.visible = showC; pool.visible = showC && kc > .5;
    if (showC) {
      coneO.scale.set(1, Hc, 1); coneO.position.set(0, HT - Hc / 2, 0); coneO.material.opacity = .09 * fc * (.9 + .1 * Math.sin(T * 2.2));
      coneI.scale.set(1, Hc, 1); coneI.position.set(0, HT - Hc / 2, 0); coneI.material.opacity = .1 * fc;
      pool.material.opacity = .2 * fc * ease.out(prog(T, 19, 21.5));
    }
    // --- thread sky -> A hand (21.8-24), fade 28.9-30.5 ---
    const kt = ease.io(prog(T, 21.8, 24)), ft = 1 - ease.io(prog(T, 28.9, 30.5));
    const hasT = tipOf(pa, 'B', v1) && kt > .001 && ft > .001;
    thread.visible = threadHalo.visible = tHead.visible = hasT; tBead.forEach(b => b.visible = false);
    if (hasT) {
      const top = _a.set(.2, HT, -.1).clone(), end = top.clone().lerp(v1.clone().add(_b.set(0, .06, 0)), kt), dv = end.clone().sub(top), L = Math.max(dv.length(), .01), mid = top.clone().add(end).multiplyScalar(.5);
      for (const m of [thread, threadHalo]) { m.position.copy(mid); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(UP, dv.clone().normalize()); }
      thread.material.color.setHex(0xffe3a0); threadHalo.material.opacity = .3 * ft; tHead.position.copy(end); tHead.material.opacity = .9 * ft; tHead.scale.setScalar(.9 + .15 * Math.sin(T * 7));
      if (kt > .95) tBead.forEach((b, i) => { const u = ((T * .5 + i / 3) % 1); b.visible = true; b.position.copy(top.clone().lerp(end, u)); b.material.opacity = .9 * ft * Math.sin(u * PI); });
    }
    // --- halo around A (33-35) ---
    const hh = bump(T, 33, 35.4, 1.0, 1.0); halo.visible = hh > .01;
    if (halo.visible && boneAt(pa, 'chest', v1)) { halo.position.set(v1.x, v1.y + .1, v1.z); halo.material.opacity = .85 * hh; halo.scale.setScalar(3.0 + .6 * hh); }
    // --- gift (s5) ---
    const gs = ease.out(prog(T, 36.9, 37.8)) * (1 - ease.in(prog(T, 52.6, 53.4)));
    const hasG = boneAt(pb, 'handA', v1) && boneAt(pb, 'handB', v2);
    gift.visible = hasG && gs > .01;
    if (gift.visible) {
      const m = v1.clone().add(v2).multiplyScalar(.5), yaw = PI / 2 - .5 * sgn(T);
      gift.position.set(m.x, m.y + .13, m.z); gift.rotation.y = yaw; gift.scale.setScalar(gs);
      lidP.rotation.x = -1.95 * ease.io(prog(T, 40.5, 43.5));
      const open = prog(T, 41, 43.5), gp = _c.set(0, .16, 0).applyAxisAngle(UP, yaw).add(gift.position);
      giftGlow.visible = open > 0 && T < 50; if (giftGlow.visible) { giftGlow.position.copy(gp); giftGlow.material.opacity = .85 * open * (1 - prog(T, 47, 50)); giftGlow.scale.setScalar(.7 + .3 * Math.sin(T * 5)); }
      // flowers emerge from the box mouth
      flowers.forEach((f, i) => {
        const [ox, oz, ts] = FS[i], u = prog(T, ts, ts + 2.6), bl = ease.out(prog(T, ts + .3, ts + 1.6)), end = 1 - ease.in(prog(T, 52.3, 53.3));
        f.root.visible = u > .001 && end > .01 && gs > .01;
        if (!f.root.visible) return;
        const hgt = .06 + .62 * ease.out(u) + .03 * Math.sin(T * 2 + i * 1.7), lat = ox + (i - 3) * .045 * u, fw = oz + .12 * u;
        const lp = _d.set(lat, 0, fw).applyAxisAngle(UP, yaw);
        f.root.position.set(gift.position.x + lp.x, gift.position.y + .12, gift.position.z + lp.z);
        f.stemG.scale.set(1, Math.max(hgt, .01), 1); f.head.position.set(0, hgt, 0); f.head.scale.setScalar(Math.max(.01, bl * 1.15 * end));
        f.head.lookAt(cam.position);
      });
    } else { giftGlow.visible = false; flowers.forEach(f => f.root.visible = false); }
    // --- sparkles rising from A (47.5-53) ---
    const hasS = boneAt(pa, 'chest', v1);
    SP.forEach((p, i) => { const u = (T - p.b) / p.dur, s = spark[i]; s.visible = hasS && u > 0 && u < 1; if (!s.visible) return;
      s.position.set(v1.x + p.ox * .6, v1.y - .25 + u * 1.45, v1.z + p.oz * .6 + .2); s.scale.setScalar(p.sz * 1.1); s.material.opacity = Math.sin(u * PI) * (.7 + .3 * Math.sin(T * 14 + i)); });
    // --- gold dust falling over B (54.8-57), glow on B chest (57-58.6) ---
    const hasD = boneAt(pb, 'chest', v1);
    const bx = v1.x, bz = v1.z;
    DU.forEach((p, i) => { const u = (T - p.b) * p.sp / 2.6, s = dust[i]; s.visible = hasD && u > 0 && u < 1; if (!s.visible) return;
      s.position.set(bx + p.ox + .06 * Math.sin(T * 3 + i), 2.75 - u * 2.45, bz + p.oz); s.scale.setScalar(p.sz * .9); s.material.opacity = (u < .12 ? u / .12 : 1) * (1 - prog(u, .8, 1)) * .9; });
    const kg = ease.io(prog(T, 57, 58.6)); chestGlow.visible = hasD && kg > .01;
    if (chestGlow.visible) { chestGlow.position.set(bx, v1.y - .03, bz); chestGlow.scale.setScalar(.3 + 1.1 * kg); chestGlow.material.opacity = .5 * kg; }
    // --- fade to charcoal (58.4-59.07) ---
    const kf = ease.io(prog(T, 58.4, 59.07)); plate.visible = kf > .001;
    if (plate.visible) { plate.material.opacity = kf; cam.getWorldDirection(v1); plate.position.copy(cam.position).addScaledVector(v1, .6); plate.quaternion.copy(cam.quaternion); plate.scale.setScalar(1); }
  });
  return Wd;
}

// ---------------- world options ----------------
export const WORLD = { skyTop: PAL.skyTop, skyBottom: PAL.skyBottom, fogColor: PAL.fog, fogNear: 14, fogFar: 52, hemi: .55, hemiSky: 0xffd8b0, hemiGround: 0x3a2a20, sun: 1.35, sunColor: 0xffb070, sunPos: [-26, 11, 9], shadowExt: 9, skyR: 300 };
export function buildShot(i) {
  const t0 = T0S[i], Wd = world(WORLD);
  populate(Wd, t0, i);
  return Object.assign(Wd, { cam: lt => CAMS[i](lt + t0) });
}
