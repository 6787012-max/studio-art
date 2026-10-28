// lh.js - shared module for the stef_41 film (exaggeration lens). Pure functions of t. No Hebrew anywhere.
import { THREE, box, cyl, ball, mesh, toon, label, ease, prog, clamp, lerp, rng, cloud } from '../../lib/stage3d.js';
import { PAL, sm, lp3, mkWorld, motes, checkMark, prohib, clockRing, heroProxy, glow, lens, topiary } from './lh_base.js';
export { PAL, sm, lp3, mkWorld, motes, checkMark, prohib, clockRing, heroProxy, glow, lens, topiary };

export const K = { back: 0xE9E2D3, stone: 0xF3EBD3, sand: 0xD8C9A8, ash: 0x8C8A86, gold: 0xE8B830, red: 0xA8322E, blue: 0x2F5D9E, flame: 0xF08A2E, redB: 0xC2453A, green: 0x4FA35A, cloud: 0xFAFAF7, wood: 0x6B4A32 };
const INK = 0x8C7650, AINK = 0x4F4D49, GINK = 0x7A5A10;
const fr = x => ((x % 1) + 1) % 1;
export const A3 = (a, b, u, h) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + (h || 0) * Math.sin(Math.PI * u), lerp(a[2], b[2], u)];
export const POP = (t, a, b) => ease.out(prog(t, a, b));
export const POPB = (t, a, b) => { const u = prog(t, a, b); return ease.out(u) + .1 * Math.sin(Math.PI * u); };
export const pulse = (t, a, b, c, d) => sm(t, a, b) * (1 - sm(t, c, d));
export const CAM = (p0, l0, p1, l1, dur, fov) => t => { const u = ease.io(prog(t, 0, dur)); return { pos: lp3(p0, p1, u), look: lp3(l0, l1, u), fov: fov || 44 }; };
export const setK = (o, k) => { o.scale.setScalar(Math.max(k, 1e-4)); o.visible = k > .005; };
// piecewise eased keyframes: pts = [[t,v],...]
export const KF = (t, pts) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 0; i < pts.length - 1; i++) { if (t <= pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], ease.io(prog(t, pts[i][0], pts[i + 1][0]))); } return pts[pts.length - 1][1]; };
const fake = g => ({ add: x => g.add(x) });

// ---------- world ----------
export function mkS(o) {
  o = o || {}; const cx = o.cx || 0, Wd = mkWorld(Object.assign({ cx, ext: o.ext || 16, span: o.span }, o.world));
  motes(Wd, o.motes || 40, o.seed || 1, Object.assign({ cx, w: 30, z0: -8, z1: 7, h: 9 }, o.moteO));
  if (!o.noEdge) { topiary(Wd, cx - 12.5, 6.5, 1.2); topiary(Wd, cx + 12.8, 7.2, 1.35); }
  return Wd;
}

// ---------- fading + the "said" shell ----------
export function fader(g) {
  const L = []; g.traverse(o => { if (o.isMesh && o.material) { o.material.transparent = true; L.push([o.material, o.material.opacity === undefined ? 1 : o.material.opacity]); } });
  return { set(a) { a = clamp(a, 0, 1); L.forEach(q => { q[0].opacity = q[1] * a; }); g.visible = a > .01; } };
}
export function said(parent, factory) {
  const g = new THREE.Group(); parent.add(g); const inner = new THREE.Group(); g.add(inner); factory(inner); const L = [];
  inner.traverse(o => {
    if (!o.isMesh) return; const bk = o.material && o.material.side === THREE.BackSide;
    if (bk) { o.material.color.set(0xB8871B); o.material.transparent = true; o.material.depthWrite = false; L.push([o.material, .6]); }
    else { o.material = new THREE.MeshBasicMaterial({ color: 0xF2C94C, transparent: true, opacity: .38, depthWrite: false }); o.castShadow = false; o.receiveShadow = false; L.push([o.material, .38]); }
    o.renderOrder = 3;
  });
  g.visible = false;
  return { g, set(kx, ky, a) { a = clamp(a, 0, 1); g.scale.set(Math.max(kx, 1e-4), Math.max(ky, 1e-4), Math.max(kx, 1e-4)); g.visible = a > .01 && kx > .01; L.forEach(q => { q[0].opacity = q[1] * a; }); } };
}

// ---------- ALTAR ----------
export function altar(parent, s) {
  const g = new THREE.Group(); parent.add(g); g.scale.setScalar(s || 1);
  g.add(box(7, 2.2, 7, K.stone, { pos: [0, 1.1, 0], inkW: .035, inkColor: INK }));
  g.add(box(6.6, .14, 6.6, 0xEADFC0, { pos: [0, 2.27, 0], inkW: .02, inkColor: INK }));
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(5.6, 0); sh.lineTo(0, 2.2); sh.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(sh, { depth: 2.6, bevelEnabled: false }), toon(0xE8DCBA), { pos: [3.5, 0, -1.3], inkW: .03, inkColor: INK, box: true }));
  g.add(box(2.7, .06, 2.6, 0xD9CBA2, { pos: [5.3, .9, 0], ink: false, cast: false, rot: [0, 0, -0.38] }));
  const TOP = 2.34, C = [[-3, -3], [3, -3], [-3, 3], [3, 3]], fl = [];
  C.forEach((c, i) => {
    g.add(box(.7, .4, .7, K.stone, { pos: [c[0], TOP + .2, c[1]], inkW: .02, inkColor: INK }));
    const f = new THREE.Group(); f.position.set(c[0], TOP + .4, c[1]); g.add(f);
    f.add(cyl(0, .4, 1.05, K.flame, { pos: [0, .52, 0], inkW: .02, inkColor: 0x8A3A10 })); f.add(cyl(0, .22, .62, 0xFFD25A, { pos: [0, .36, .08], ink: false })); fl.push(f);
  });
  return { g, TOP, C, fire(t) { fl.forEach((f, i) => { const w = Math.sin(t * 7 + i * 1.7); f.scale.set(1 + .06 * w, 1 + .2 * w, 1 + .06 * w); f.rotation.z = .08 * Math.sin(t * 3 + i); }); } };
}

// ---------- ASH HEAP (origin at its base; apple dimple on top) ----------
export function heap(parent) {
  const g = new THREE.Group(); parent.add(g);
  const L = [[0, .9, 0, 1.5, 0x8C8A86], [-1.0, .55, .5, 1.0, 0x9A9893], [1.05, .5, .3, 1.05, 0x84827E], [.15, .5, -1.0, 1.0, 0x97958F], [-.8, .45, -.6, .85, 0x8A8884], [.55, .45, 1.0, .9, 0x929089], [0, 1.75, 0, .95, 0x8F8D88], [-.3, 1.45, .55, .7, 0x96948F]];
  L.forEach(q => g.add(ball(q[3], q[4], { pos: [q[0], q[1], q[2]], scale: [1, .85, 1], inkW: .035, inkColor: AINK })));
  g.add(ball(.5, 0x6A6865, { pos: [0, 2.46, 0], scale: [1.15, .3, 1.15], ink: false, cast: false }));
  return g;
}
export function sack(parent) {
  const g = new THREE.Group(); parent.add(g);
  g.add(ball(.62, 0x9C9A95, { pos: [0, .55, 0], scale: [1, 1.05, .85], inkW: .03, inkColor: AINK }));
  g.add(cyl(.2, .28, .25, 0x8C8A86, { pos: [0, 1.15, 0], inkW: .02, inkColor: AINK }));
  g.add(mesh(new THREE.TorusGeometry(.3, .05, 8, 18), toon(K.wood), { pos: [0, 1.0, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  return g;
}
export function puffs(parent, n) {
  const g = new THREE.Group(); parent.add(g); const A = [];
  for (let i = 0; i < n; i++) { const m = ball(1, 0xA3A19C, { ink: false, cast: false }); m.visible = false; g.add(m); A.push(m); }
  return { g, A };
}

// ---------- 300 BADGE ----------
export function badge(parent, R, txt) {
  R = R || 1.4; const g = new THREE.Group(); parent.add(g);
  g.add(cyl(R, R, .3, K.gold, { rot: [Math.PI / 2, 0, 0], inkW: .03, inkColor: GINK }));
  g.add(mesh(new THREE.TorusGeometry(R * .82, R * .07, 8, 40), toon(0xF6D463), { pos: [0, 0, .17], ink: false }));
  label(fake(g), txt || '300', { size: 130, height: R * .85, bg: null, color: '#6B4A32', stroke: '#FFF3C8', pos: [0, 0, .35] });
  g.visible = false; return { g, set(k) { setK(g, k); } };
}

// ---------- plinth with digit plate ----------
export function plinth(parent, h, num) {
  const g = new THREE.Group(); parent.add(g);
  g.add(cyl(1.55, 1.75, h, K.stone, { pos: [0, h / 2, 0], inkW: .03, inkColor: INK }));
  g.add(cyl(1.85, 1.85, .18, 0xE8DCBA, { pos: [0, h + .09, 0], inkW: .02, inkColor: INK }));
  g.add(cyl(1.85, 1.95, .2, 0xE8DCBA, { pos: [0, .1, 0], inkW: .02, inkColor: INK }));
  if (num) label(fake(g), String(num), { size: 120, height: .85, bg: 'rgba(255,248,224,.95)', color: '#6B4A32', pos: [0, h * .52, 1.85] });
  return { g, top: h + .18 };
}

// ---------- scrolls / books ----------
export function torah(parent, s, o) {
  o = o || {}; const g = new THREE.Group(); parent.add(g); const H = 3.4 * s, L = 2.4 * s, r = .2 * s;
  g.add(box(L, H * .92, .07 * s, o.paper || 0xF6EBCB, { pos: [0, H / 2, 0], inkW: .02, inkColor: INK }));
  for (let i = 0; i < 6; i++) g.add(box(L * .8, .05 * s, .02, 0xC9B07A, { pos: [0, H * (.2 + i * .12), .05 * s], ink: false, cast: false }));
  [-1, 1].forEach(sd => {
    const x = sd * (L / 2 + r * .4); g.add(cyl(r, r, H + .5 * s, o.rod || 0x8A5A3B, { pos: [x, H / 2, 0], inkW: .02, inkColor: 0x2E1D12 }));
    g.add(ball(r * 1.3, o.knob || K.gold, { pos: [x, H + .3 * s, 0], ink: false })); g.add(ball(r * 1.3, o.knob || K.gold, { pos: [x, -.05 * s, 0], ink: false }));
  });
  return g;
}
export function books(parent, s) {
  const g = new THREE.Group(); parent.add(g); const col = [K.red, K.blue, K.green, K.gold];
  col.forEach((c, i) => {
    const b = new THREE.Group(); b.position.set(.1 * Math.sin(i * 2), (i + .5) * .55 * s, 0); b.rotation.y = i % 2 ? .12 : -.1; g.add(b);
    b.add(box((2.6 - i * .18) * s, .5 * s, 1.8 * s, c, { inkW: .02, inkColor: 0x2E1D12 })); b.add(box((2.5 - i * .18) * s, .38 * s, 1.72 * s, 0xF6EBCB, { pos: [.06 * s, 0, .05 * s], ink: false, cast: false }));
  });
  return g;
}

// ---------- sand tower / city ----------
export function tower(parent, h, w, col) {
  const g = new THREE.Group(); parent.add(g); col = col || K.sand;
  g.add(box(w, h, w, col, { pos: [0, h / 2, 0], inkW: .03, inkColor: INK }));
  g.add(box(w + .35, .32, w + .35, 0xCDBA92, { pos: [0, h, 0], inkW: .02, inkColor: INK }));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => g.add(box(.34, .4, .34, 0xCDBA92, { pos: [c[0] * (w / 2 + .05), h + .36, c[1] * (w / 2 + .05)], inkW: .015, inkColor: INK })));
  g.add(box(w * .35, Math.min(h * .3, 1.0), .06, K.wood, { pos: [0, Math.min(h * .3, 1.0) / 2, w / 2 + .02], ink: false })); g.add(box(.14, Math.min(.5, h * .14), .06, 0x3A2E26, { pos: [0, h * .64, w / 2 + .02], ink: false }));
  return g;
}
export function cityObj(parent, o) {
  o = o || {}; const g = new THREE.Group(); parent.add(g); g.scale.setScalar(o.s || 1);
  g.add(cyl(7, 8.6, 1.4, 0xC9B98F, { pos: [0, .7, 0], inkW: .035, inkColor: INK })); g.add(cyl(6.4, 6.6, .16, 0xB8C98A, { pos: [0, 1.45, 0], ink: false, cast: false }));
  const Y = 1.5, N = 14, R = 4.3, T = [];
  for (let i = 0; i < N; i++) {
    const a = i / N * 2 * Math.PI, L = 2 * R * Math.sin(Math.PI / N) + .15, wl = new THREE.Group(); wl.position.set(R * Math.cos(a), Y, R * Math.sin(a)); wl.rotation.y = -a + Math.PI / 2; g.add(wl);
    wl.add(box(L, 1.9, .55, K.sand, { pos: [0, .95, 0], inkW: .025, inkColor: INK })); [-.5, .5].forEach(x => wl.add(box(.5, .38, .62, 0xCDBA92, { pos: [x * L * .85, 2.08, 0], inkW: .015, inkColor: INK })));
    if (i % 3 === 0) { const h = 3.4 + (i % 2) * .5, w = 1.15; const tg = new THREE.Group(); tg.position.set(R * Math.cos(a), Y, R * Math.sin(a)); g.add(tg); tower(tg, h, w); T.push({ x: R * Math.cos(a), z: R * Math.sin(a), h, w }); }
  }
  const kp = new THREE.Group(); kp.position.set(0, Y, 0); g.add(kp); tower(kp, 4.6, 2.1);
  const sh = T.map(q => { const sd = said(g, f => tower(f, q.h, q.w)); sd.g.position.set(q.x, Y, q.z); return sd; });
  const cl = [[-6, 12.2, -3.5, 2.3, 1], [5.5, 13.2, -2.5, 2.6, 2], [0, 14.5, -5, 2.4, 3], [-2.5, 11.4, 2.6, 1.9, 4], [8, 11.6, 1.8, 1.8, 5]].map(q => { const c = cloud({ seed: q[4], size: q[3], puffs: 6, color: K.cloud, pos: [q[0], q[1], q[2]] }); g.add(c); return c; });
  const cx0 = cl.map(c => c.position.x);
  return { g, towers: T, set(ky, a, t) { sh.forEach(s => s.set(1.18, 1 + 4.0 * ky, a)); cl.forEach((c, i) => { c.position.x = cx0[i] + .8 * Math.sin((t || 0) * .25 + i * 1.7); }); } };
}

// ---------- CROWN / sound rings / ground crack ----------
export function crown(parent) {
  const g = new THREE.Group(); parent.add(g);
  g.add(cyl(.95, .85, .55, K.gold, { pos: [0, .28, 0], inkW: .025, inkColor: GINK }));
  for (let i = 0; i < 5; i++) { const a = i / 5 * 2 * Math.PI; g.add(cyl(0, .22, .95, K.gold, { pos: [Math.cos(a) * .72, .55 + .46, Math.sin(a) * .72], inkW: .02, inkColor: GINK })); g.add(ball(.13, i % 2 ? K.red : K.blue, { pos: [Math.cos(a) * .72, 1.5, Math.sin(a) * .72], ink: false })); }
  g.add(ball(.18, K.red, { pos: [0, .3, .9], ink: false }));
  return g;
}
export function rings(parent, n) {
  const g = new THREE.Group(); parent.add(g); const A = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, .035, 8, 72), new THREE.MeshBasicMaterial({ color: K.gold, transparent: true, opacity: 0, depthWrite: false, fog: false })); m.renderOrder = 4; m.visible = false; g.add(m); A.push(m); }
  return { g, set(t, t0, per, Rmax, a) { A.forEach((m, i) => { const u = t < t0 ? -1 : fr((t - t0) / per + i / n); const on = t >= t0 && a > .01; m.visible = on; if (on) { m.scale.setScalar(.6 + Rmax * ease.out(u)); m.material.opacity = .85 * a * (1 - u) * Math.min(1, u * 8); } }); } };
}
function zig(parent, o) {
  const r = rng(o.seed || 3), N = o.N, P = [], S = []; const mat = o.mat;
  for (let i = 0; i <= N; i++) P.push([lerp(o.x0, o.x1, i / N), (i % 2 ? 1 : -1) * o.amp * (.55 + .45 * r())]);
  for (let i = 0; i < N; i++) {
    const dx = P[i + 1][0] - P[i][0], dz = P[i + 1][1] - P[i][1], len = Math.hypot(dx, dz), an = Math.atan2(dz, dx);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len + .06, o.hgt, o.dep), mat); m.rotation.y = -an; m.renderOrder = 4; m.visible = false; parent.add(m); S.push({ m, x: P[i][0], z: P[i][1], c: dx / len, s: dz / len, len });
  }
  return { draw(k, w) { S.forEach((q, i) => { const f = clamp(k * N - i, 0, 1); q.m.visible = f > .001; q.m.scale.set(Math.max(f, 1e-3), 1, w || 1); q.m.position.set(q.x + q.c * q.len * f / 2, o.y, q.z + q.s * q.len * f / 2); }); } };
}
export function quakeObj(parent, o) {
  o = o || {}; const g = new THREE.Group(); parent.add(g); g.scale.setScalar(o.s || 1);
  const F = box(16, 1, 4, K.sand, { pos: [0, 0, 2.05], inkW: .03, inkColor: INK }), B = box(16, 1, 4, 0xCDBE9A, { pos: [0, 0, -2.05], inkW: .03, inkColor: INK });
  const hf = new THREE.Group(), hb = new THREE.Group(); hf.position.y = .5; hb.position.y = .5; hf.add(F); hb.add(B); g.add(hf); g.add(hb);
  const cr = zig(g, { x0: -7.6, x1: 7.6, N: 15, amp: .55, hgt: .08, dep: .14, y: 1.03, mat: new THREE.MeshBasicMaterial({ color: 0x241A14 }) });
  const gm = new THREE.MeshBasicMaterial({ color: K.gold, transparent: true, opacity: 0, depthWrite: false }); const gz = zig(g, { x0: -8, x1: 8, N: 12, amp: 1.25, hgt: .1, dep: .55, y: 1.12, mat: gm, seed: 8 });
  const cw = crown(g); const rg = rings(g, 4); const CY = 5.6; rg.g.position.set(0, CY, 0.6);
  return { g, F, B, set(t, p) {
    cw.position.set(0, CY + .18 * Math.sin(t * 1.6), 0); cw.rotation.y = t * .5; setK(cw, p.cw === undefined ? 1 : p.cw);
    rg.set(t, p.rt === undefined ? 0.6 : p.rt, 1.9, 8.5, p.ra === undefined ? 1 : p.ra);
    cr.draw(p.ck || 0, 1 + 5 * (p.gap || 0)); const gp = p.gap || 0;
    hf.rotation.x = -.1 * gp; hb.rotation.x = .1 * gp; hf.position.z = .35 * gp; hb.position.z = -.35 * gp;
    gm.opacity = .42 * (p.gh || 0); gz.draw(p.gh > .01 ? Math.min(1, (p.gh || 0) * 1.4) : 0, 1);
  } };
}

// ---------- GOLDEN VINE over the Temple doorway ----------
export function vineObj(parent, o) {
  o = o || {}; const g = new THREE.Group(); parent.add(g); g.scale.setScalar(o.s || 1);
  [-1, 1].forEach(sd => g.add(box(1.1, 8, 1.3, K.stone, { pos: [sd * 3.05, 4, 0], inkW: .03, inkColor: INK })));
  g.add(box(7.6, 1.0, 1.5, K.stone, { pos: [0, 8.5, 0], inkW: .03, inkColor: INK })); g.add(box(5, 8, .3, 0x3A2E26, { pos: [0, 4, -.45], ink: false }));
  g.add(box(8.8, .4, 2.6, 0xE8DCBA, { pos: [0, .2, .35], inkW: .02, inkColor: INK }));
  g.add(mesh(new THREE.TorusGeometry(3.3, .09, 8, 40, Math.PI), toon(K.gold), { pos: [0, 9.1, .85], ink: false }));
  [-1, 1].forEach(sd => g.add(cyl(.09, .09, 5.9, K.gold, { pos: [sd * 3.3, 6.15, .85], ink: false })));
  const P = []; for (let i = 0; i < 14; i++) { const a = (i + .5) / 14 * Math.PI; P.push([Math.cos(a) * 3.3, 9.1 + Math.sin(a) * 3.3]); }
  for (let j = 0; j < 5; j++) { const y = 8.4 - j * 1.15; P.push([3.3, y]); P.push([-3.3, y]); }
  const items = P.map((p, i) => {
    const it = new THREE.Group(); g.add(it);
    if (i % 3 === 0) { [[0, 0], [.22, .05], [-.22, .05], [.11, -.2], [-.11, -.2], [0, -.4]].forEach(q => it.add(ball(.21, K.gold, { pos: [q[0], q[1], 0], inkW: .015, inkColor: GINK }))); }
    else { it.add(ball(.34, K.gold, { scale: [1.3, .75, .3], rot: [0, 0, i * .9], inkW: .02, inkColor: GINK })); }
    const sd = i % 2 ? 1 : -1; return { it, p: [p[0], p[1], .9], s0: [sd * (14 + (i % 5)), 5 + (i % 4) * 1.5, 4.5] };
  });
  const N = items.length;
  return { g, N, set(count) { items.forEach((q, i) => { const u = clamp(count - i, 0, 1); q.it.visible = u > .001; const pos = A3(q.s0, q.p, ease.out(u), 2.2); q.it.position.set(pos[0], pos[1], pos[2]); q.it.scale.setScalar(Math.max(.01, .5 + .5 * u)); }); } };
}

// ---------- CURTAIN over a pool ----------
export function curtainObj(parent, o) {
  o = o || {}; const g = new THREE.Group(); parent.add(g); g.scale.setScalar(o.s || 1);
  g.add(cyl(.18, .18, 7.2, K.gold, { rot: [0, 0, Math.PI / 2], pos: [0, 9, 0], inkW: .02, inkColor: GINK })); [-1, 1].forEach(sd => g.add(ball(.3, K.gold, { pos: [sd * 3.7, 9, 0], ink: false })));
  const S = []; for (let i = 0; i < 14; i++) { const b = box(.5, 7.6, .25, i % 2 ? K.blue : K.red, { pos: [-3.25 + i * .5, 5.1, 0], inkW: .012, inkColor: 0x2E1D12 }); g.add(b); S.push(b); }
  g.add(box(8.6, .25, 5.2, 0xE8DCBA, { pos: [0, .12, 1.5], inkW: .02, inkColor: INK })); g.add(box(8.0, .2, 4.6, 0x9CC9E6, { pos: [0, .3, 1.5], ink: false, cast: false }));
  return { g, set(t) { S.forEach((b, i) => { b.rotation.z = .025 * Math.sin(t * 1.3 + i * .7); b.position.z = .1 * Math.sin(i * 1.3 + t * .8); }); } };
}

// ---------- table, masks, dais ----------
export function table(parent) {
  const g = new THREE.Group(); parent.add(g);
  g.add(box(9, .5, 9, 0xB58A5A, { pos: [0, .65, 0], inkW: .03, inkColor: 0x2E1D12 })); g.add(box(8.4, .06, 8.4, 0xC49A68, { pos: [0, .93, 0], ink: false, cast: false }));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => g.add(box(.6, .5, .6, 0x8A5A3B, { pos: [c[0] * 4, .25, c[1] * 4], inkW: .02, inkColor: 0x2E1D12 })));
  return g;
}
export function dais(parent, R) { const g = new THREE.Group(); parent.add(g); g.add(cyl(R, R * 1.06, .4, K.sand, { pos: [0, .2, 0], inkW: .03, inkColor: INK })); return g; }
export function mask(parent, w) { const g = new THREE.Group(); parent.add(g); g.add(box(w, w * .95, w, 0x4A4E57, { pos: [0, w * .475, 0], inkW: .035, inkColor: 0x1F2228 })); g.add(box(w * 1.08, .22, w * 1.08, 0x3A3E46, { pos: [0, w * .95, 0], inkW: .02, inkColor: 0x1F2228 })); return g; }

// ---------- mini stations (shell included) ----------
export function heapStation(parent, o) {
  o = o || {}; const g = new THREE.Group(); parent.add(g); g.scale.setScalar(o.s || 1); dais(g, 4.2);
  const h = heap(g); h.position.y = .4; const sd = said(g, f => heap(f)); sd.g.position.y = .4; const bd = badge(g, 1.8); bd.g.position.set(0, 9.5, 1.5);
  return { g, h, sd, bd, set(k, a, b, t) { sd.set(lerp(1, o.K || 3, k), lerp(1, o.K || 3, k), a); bd.set(b); h.scale.setScalar(1 + .04 * Math.sin((t || 0) * 2.2)); } };
}
