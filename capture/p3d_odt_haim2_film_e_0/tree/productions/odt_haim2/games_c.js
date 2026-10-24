// games_c.js - helpers owned by the film_c builder (odt_haim2). Digits-only whiteboard, seats, rod, chicken, clap poses.
import { THREE, ease, prog, clamp, lerp, P } from './hall.js';
import { box, cyl, ball, mesh, toon, canvasTex } from '../../lib/stage3d.js';
import { POSES } from '../../lib/figure3d.js';

export const D2R = Math.PI / 180;
export const angl = (a, b, u) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * u;
export const face = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

// ---------------------------------------------------------------- extra arm poses
// reach across a circle (skip circle): arms forward, crossing / reaching further
POSES.reachC = { armA: [-1.1, 0, .3], armB: [-1.1, 0, -.3], foreA: [-.15, 0, 0], foreB: [-.15, 0, 0] };
POSES.reachF = { armA: [-1.3, 0, .12], armB: [-1.3, 0, -.12], foreA: [-.05, 0, 0], foreB: [-.05, 0, 0] };
// clap levels 0..6: 0 = hands raised in front, apart; 5 = hands almost touching; 6 = touching
export const CLAPN = 6;
for (let k = 0; k <= CLAPN; k++) {
  const u = k / CLAPN, z = .42 - .49 * u, fy = .3 * u;   // hands raised above the head, slightly forward, palms facing; u~.85 = palms meet
  POSES['clap' + k] = { armA: [-2.55, 0, -z], armB: [-2.55, 0, z], foreA: [-.15, -fy, 0], foreB: [-.15, fy, 0] };
}
export const clapG = u => 'clap' + clamp(Math.round(u * CLAPN), 0, CLAPN);
// rod poses: index fingers out, both arms forward; level 0..8 = hand height
const RODN = 8, rodA = u => lerp(.2, 1.45, u), rodF = u => lerp(.9, .1, u);
const handH = (a, f) => 1.42 - .29 * Math.cos(a) - .27 * Math.cos(a + f);
for (let k = 0; k <= RODN; k++) { const u = k / RODN; POSES['rod' + k] = { armA: [-rodA(u), 0, -.05], armB: [-rodA(u), 0, .05], foreA: [-rodF(u), 0, 0], foreB: [-rodF(u), 0, 0], point: { A: 1, B: 1 }, fist: { A: 1, B: 1 } }; }
const HLO = handH(rodA(0), rodF(0)), HHI = handH(rodA(1), rodF(1));
// h = wanted rod height (m) -> {gesture, sit}
export function rodPose(h) {
  let sit = false, hh = h;
  if (h < HLO - .02) { sit = true; hh = Math.max(h, .58) + .43; }
  const u = clamp((hh - HLO) / (HHI - HLO), 0, 1);
  return { gesture: 'rod' + Math.round(u * RODN), sit, sink: sit ? Math.max(0, .58 - h) : 0 };
}

// ---------------------------------------------------------------- seat + time helpers
// cuts([t0,fn],[t1,fn]...) : pick the last part whose start <= t, call with local time
export const cuts = (...parts) => t => { let c = parts[0]; for (const p of parts) if (t >= p[0]) c = p; return c[1](t - c[0]); };
// S([t0,stateFn],...) : same idea for a man (stateFn gets the shot time t, not local)
export const S = (...segs) => t => { let f = segs[0][1]; for (const [t0, fn] of segs) if (t >= t0) f = fn; return f(t); };
export function orb(c, r, h, a0, a1, T, fov, ly) {
  return t => { const a = lerp(a0, a1, ease.io(prog(t, 0, T))) * D2R; return { pos: [c[0] + Math.sin(a) * r, h, c[1] + Math.cos(a) * r], look: [c[0], ly === undefined ? 1.3 : ly, c[1]], fov }; };
}
// walk between two spots {x,z,f}; walk key only while moving
export function go(a, b, t0, t1, t) {
  const u = ease.io(prog(t, t0, t1)), mv = u > 0 && u < 1, hd = Math.atan2(b.x - a.x, b.z - a.z);
  const f = u <= 0 ? a.f : u >= 1 ? b.f : (u < .15 ? angl(a.f, hd, u / .15) : u > .85 ? angl(hd, b.f, (u - .85) / .15) : hd);
  return { pos: [lerp(a.x, b.x, u), 0, lerp(a.z, b.z, u)], facing: f, walk: mv ? (t - t0) * 7.5 : undefined, stride: .8 };
}
export function heroProxy(Wd, focus) {
  const px = new THREE.Mesh(new THREE.BoxGeometry(.5, 1.75, .3), new THREE.MeshBasicMaterial()); px.material.visible = false; Wd.add(px);
  Wd.on(t => { const f = focus(t); px.position.set(f[0], .875, f[2]); });
  Wd.hero = { group: px }; return px;
}

// ---------------------------------------------------------------- the whiteboard (digits 1..8 + gold ticks only)
export const BOARD = { x: -1.9, z: -5.3, w: 1.5, h: 1.9, y0: .55 };
const BW = 1.4, BH = 1.8, BTOP = BOARD.y0 + BOARD.h - .05;
export const digitY = k => BTOP - (k - .5) * (BH / 8);
export const DIGIT_X = BOARD.x - .24, TICK_X = BOARD.x + .3;
// ticksAt[k-1] = shot time when tick k appears (use -9 for "already there", 999 for "not yet")
export function whiteboard(Wd, ticksAt) {
  const g = new THREE.Group(), z = BOARD.z; Wd.add(g);
  const cy = BOARD.y0 + BOARD.h / 2;
  g.add(box(BOARD.w, BOARD.h, .06, 0x8a96a3, { pos: [BOARD.x, cy, z] }));
  g.add(box(BW, BH, .03, 0xfbfaf4, { pos: [BOARD.x, cy - .05 + .05, z + .035], ink: false }));
  for (const sx of [-1, 1]) { g.add(box(.06, BOARD.y0 + .02, .06, 0x6e7885, { pos: [BOARD.x + sx * .55, (BOARD.y0 + .02) / 2, z - .02] })); g.add(box(.06, .05, .7, 0x6e7885, { pos: [BOARD.x + sx * .55, .025, z + .05] })); }
  g.add(box(BOARD.w + .1, .05, .1, 0x8a96a3, { pos: [BOARD.x, BOARD.y0 - .02, z + .08] }));
  const tex = canvasTex(512, 640, (c, w, h) => {
    c.fillStyle = '#fbfaf4'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f2a44'; c.font = 'bold 72px Arial, Helvetica, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let k = 1; k <= 8; k++) c.fillText(String(k), (0.5 + (DIGIT_X - BOARD.x) / BW) * w, (k - .5) * h / 8 + 3);
  });
  const dm = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: tex })); dm.position.set(BOARD.x, cy - .05 + .05, z + .052); g.add(dm);
  const tk = canvasTex(128, 128, (c, w, h) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#c9a227'; c.lineWidth = 20; c.beginPath(); c.moveTo(.16 * w, .54 * h); c.lineTo(.4 * w, .78 * h); c.lineTo(.86 * w, .2 * h); c.stroke(); });
  const ticks = [];
  for (let k = 1; k <= 8; k++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, .2), new THREE.MeshBasicMaterial({ map: tk, transparent: true, depthWrite: false })); m.position.set(TICK_X, digitY(k), z + .056); m.renderOrder = 4; m.visible = false; g.add(m); ticks.push(m);
  }
  Wd.on(t => ticks.forEach((m, i) => { const u = prog(t, ticksAt[i], ticksAt[i] + .45), s = ease.out(u) * (1 + .35 * Math.sin(Math.PI * u)); m.visible = s > .01; m.scale.setScalar(Math.max(s, .001)); }));
  return g;
}

// ---------------------------------------------------------------- seats: half circle of chairs facing the instructor
export const AC = { x: 0, z: -4.8 };
export const SEAT = (() => {
  const out = [], A = [-63, -45, -27, -9, 9, 27, 45, 63];
  for (let row = 0; row < 2; row++) for (let k = 0; k < 8; k++) {
    const r = row ? 4.9 : 3.6, a = (A[k] + (row ? 0 : 0)) * D2R, x = AC.x + Math.sin(a) * r, z = AC.z + Math.cos(a) * r;
    out.push({ x, z, f: face(x, z, AC.x, AC.z) });
  }
  return out;
})();
export function chairsAt(Wd, spots) { spots.forEach(s => P.chair(Wd, { pos: [s.x, 0, s.z], rot: s.f })); }

// ---------------------------------------------------------------- rod team: 8 men, two facing rows, index fingers under a 2.2 m rod
// rot = yaw of the rod axis (0 = along x). returns spots (x,z,f)
export function rodSpots(cx, cz, rot) {
  const out = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < 8; i++) {
    const lx = -.83 + (i % 4) * .55, lz = i < 4 ? -.62 : .62, f0 = i < 4 ? 0 : Math.PI;
    // local x axis -> world (cos, -sin) rotation about y
    out.push({ x: cx + lx * c + lz * s, z: cz - lx * s + lz * c, f: f0 + rot });
  }
  return out;
}
export function rodMesh(Wd, fn) {
  const m = cyl(.02, .02, 2.2, 0xc8ccd2, { rot: [0, 0, Math.PI / 2] }), g = new THREE.Group(); g.add(m); Wd.add(g);
  Wd.on(t => { const s = fn(t); g.visible = !!s.vis; g.position.set(s.x, s.y, s.z); g.rotation.y = s.rot; });
  return g;
}

// ---------------------------------------------------------------- the soft yellow rubber chicken
export function chicken(Wd, fn) {
  const g = new THREE.Group(), y = 0xffe040;
  g.add(ball(.08, y, { pos: [0, 0, 0], scale: [1, .92, 1.25] })); g.add(ball(.05, y, { pos: [0, .09, .1] }));
  g.add(mesh(new THREE.ConeGeometry(.022, .06, 8), toon(0xf08a24), { pos: [0, .085, .17], rot: [Math.PI / 2, 0, 0] }));
  g.add(ball(.022, 0xe03a2a, { pos: [0, .15, .1] })); g.add(ball(.035, y, { pos: [0, .04, -.12], scale: [1, 1.2, 1] }));
  g.scale.setScalar(.7); Wd.add(g);
  Wd.on(t => { const s = fn(t); g.visible = !!s.vis; g.position.set(s.x, s.y, s.z); g.rotation.y = s.yaw; g.rotation.x = s.pitch || 0; });
  return g;
}
