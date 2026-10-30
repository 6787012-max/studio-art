/* film_e props: dolphin, sea turtle, Mount Meron, treasure chests, cup, angler fish, scarf. All deterministic, toon + ink hull. ASCII only. */
import { THREE, sm, cl, frac, V, toon, part, ell, tube, lathe, tubeAlong, leafGeo, cone, OL } from '../../../lib/toon3d/toon3d.js';
import * as KT from '../../toldot07_kit/kit07.js';
import { G, bx, RB } from './e_lib.js';
const { M, rng } = KT;
const ink = () => M(OL, OL, 0);

/* ---------------------------------------------------------------- dolphin (faces +x, ~560 long) */
export function makeDolphin() {
  const root = G(), pitch = G(root), body = G(pitch);
  const grey = toon('#7ba7ca', { tint: '#a9b9da' }), belly = M('#eef5fa', '#cfd8ec');
  const grey2 = toon('#6f9bc0', { tint: '#a0b0d2' });
  part(body, ell(200, 60, 56, 40, 28), grey, 3.2);
  part(body, ell(186, 40, 50, 30, 16), belly, 0, [8, -26, 0]);
  part(body, ell(78, 42, 44, 32, 22), grey, 3, [170, 4, 0]);
  part(body, ell(52, 30, 32, 24, 16), grey, 2.6, [196, 24, 0]);
  part(body, tubeAlong([V(215, -8, 0), V(262, -14, 0), V(290, -14, 0)], t => 24 - 10 * t, { segs: 12, radial: 12 }), toon('#8fb4d4', { tint: '#aebde0' }), 2.6);
  // tail stock + flukes (the tail group swings up and down)
  const tail = G(body, [-160, 4, 0]);
  part(tail, tubeAlong([V(0, 0, 0), V(-80, 6, 0), V(-150, 14, 0)], t => 46 - 32 * t, { segs: 16, flat: 0.85 }), grey2, 2.8);
  const fl = G(tail, [-150, 14, 0]);
  for (const s of [1, -1]) { const g = leafGeo(100, 44, 0.22); g.rotateX(s * Math.PI / 2); g.rotateY(s * 0.4); part(fl, g, grey2, 2.4, [-4, 0, 0]); }
  // fins
  { const g = leafGeo(78, 40, 0.22); g.rotateZ(0.65); part(body, g, grey2, 2.4, [-30, 52, 0]); }
  const flip = [1, -1].map(s => { const b = G(body, [70, -30, s * 48]); const g = leafGeo(86, 34, 0.22); g.rotateZ(Math.PI - 0.5); g.rotateX(s * 0.7); part(b, g, grey2, 2.2); return b; });
  // face: eyes with lids, brows, smile on both sides
  const white = M('#ffffff', '#d8dcec', 0), dark = M('#1f1814', '#1f1814', 0);
  const eyes = [1, -1].map(s => { const e = G(body, [172, 18, s * 40]);
    part(e, ell(14, 14, 7, 16, 12), white, 1.6, [0, 0, s * 1]); const pu = part(e, ell(7, 9, 4, 12, 10), dark, 0, [3, -1, s * 6.5]);
    part(e, ell(2.4, 2.4, 1.5, 6, 5), white, 0, [5, 3, s * 9.5]);
    const lid = part(e, ell(15, 8, 8, 16, 8), grey, 1.4, [0, 9, s * 1.5]); lid.userData.base = 9;
    part(body, tubeAlong([V(150, 36, s * 38), V(170, 40, s * 41), V(190, 36, s * 38)], 2.4, { segs: 8, radial: 6 }), ink(), 0);
    return { e, pu, lid, s }; });
  for (const s of [1, -1]) part(body, tubeAlong([V(262, -16, s * 12), V(226, -22, s * 28), V(190, -10, s * 40), V(178, -2, s * 41)], 2.6, { segs: 14, radial: 6 }), ink(), 0);
  part(body, ell(11, 3, 8, 10, 6), dark, 0, [118, 59, 0]);
  const puff = []; for (let i = 0; i < 6; i++) { const p = part(body, ell(12, 12, 12, 10, 8), M('#ffffff', '#d4e4f4', 0), 1.4, [118, 66, 0]); p.visible = false; puff.push(p); }
  const api = { root, kind: 'dolphin', noFace: true, face: { set() { } }, height: 160, cycle: 100 };
  api.pose = po => {
    const t = po.t || 0, sw = po.swim == null ? 0.6 : po.swim;
    root.position.set(po.x || 0, po.y || 0, po.z || 0); root.rotation.y = po.yaw || 0; root.scale.setScalar(po.scale || 1);
    pitch.rotation.z = po.pitch || 0; pitch.rotation.x = po.rollX || 0;
    const ph = t * (4 + 3 * sw);
    tail.rotation.z = 0.32 * sw * Math.sin(ph); fl.rotation.z = 0.35 * sw * Math.sin(ph - 0.8); body.rotation.z = -0.03 * sw * Math.sin(ph + 0.5);
    flip.forEach((f, i) => { f.rotation.x = (i ? -1 : 1) * 0.1 * Math.sin(ph + i); });
    const bl = (po.blink ? 1 : 0), smile = po.look || [0, 0];
    eyes.forEach(o => { o.lid.position.y = 9 - 9 * bl * 0.9; o.pu.position.x = 3 + 2.2 * smile[0]; o.pu.position.y = -1 + 2.2 * smile[1]; });
    const pf = po.puff || 0;
    puff.forEach((p, i) => { const u = cl(pf * 1.2 - i * 0.1, 0, 1); p.visible = u > 0.01 && u < 0.999; p.position.set(118 - 10 * u + i * 4, 66 + 70 * u + 8 * i * u, (i % 2 ? 1 : -1) * 14 * u); p.scale.setScalar(0.5 + 1.5 * Math.sin(Math.PI * u) + 0.4 * u); });
  };
  return api;
}

/* ---------------------------------------------------------------- sea turtle (faces +x, ~250 long) */
export function makeTurtle(baby) {
  const root = G(), bob = G(root), body = G(bob);
  const shellCol = baby ? '#7f9c3c' : '#6a8a3c';
  const blobs = [[0, 108, 0, 34, 10, 30], [-58, 98, 30, 26, 10, 22], [-58, 98, -30, 26, 10, 22], [58, 98, 30, 26, 10, 22], [58, 98, -30, 26, 10, 22], [0, 96, 58, 26, 8, 14], [0, 96, -58, 26, 8, 14]]
    .map(([x, y, z, a, b, c]) => ({ p: [x, y, z], r: [a, b, c], c: '#4f6f2c', w: 2 }));
  part(body, ell(120, 58, 94, 36, 24), toon(shellCol, { tint: '#8fa070', regions: blobs }), 3.2, [0, 54, 0]);
  part(body, ell(124, 14, 98, 30, 10), M('#d9bd6c', '#c8b090'), 2.6, [0, 34, 0]);
  part(body, ell(106, 12, 82, 28, 8), M('#ecdca4', '#d0c4a0', 0), 1.6, [0, 22, 0]);
  const skin = M('#a9b765', '#b8c090'), skin2 = M('#97a557', '#a8b080');
  const neck = G(body, [100, 56, 0]); const head = G(neck, [0, 0, 0]);
  part(neck, tubeAlong([V(0, -6, 0), V(34, 2, 0), V(62, 12, 0)], 24, { segs: 10, radial: 10 }), skin, 2.4);
  part(head, ell(42, 34, 34, 24, 16), skin, 2.8, [88, 18, 0]);
  part(head, ell(20, 16, 20, 16, 10), skin, 2.2, [122, 8, 0]);
  const dark = M('#1f1814', '#1f1814', 0), white = M('#ffffff', '#d8dcec', 0);
  const eyes = [1, -1].map(s => { const e = G(head, [102, 28, s * 28]); part(e, ell(11, 11, 6, 14, 10), white, 1.6); const pu = part(e, ell(5.5, 7, 3.4, 10, 8), dark, 0, [2.5, -1, s * 5]); part(e, ell(2, 2, 1.2, 6, 5), white, 0, [4, 3, s * 7.4]);
    const lid = part(e, ell(12, 7, 7, 14, 8), skin2, 1.2, [0, 8, s * 1]); return { e, pu, lid }; });
  for (const s of [1, -1]) { part(head, tubeAlong([V(130, 0, s * 8), V(112, -4, s * 20), V(98, 4, s * 28)], 2.4, { segs: 10, radial: 6 }), ink(), 0);
    part(head, tubeAlong([V(94, 38, s * 26), V(104, 41, s * 28), V(114, 38, s * 25)], 2.2, { segs: 6, radial: 6 }), ink(), 0); }
  // flippers (front big, hind small) pivot at the shell edge
  const fl = [1, -1].map(s => { const b = G(body, [78, 34, s * 84]); const g = leafGeo(96, 30, 0.2); g.rotateX(s * Math.PI / 2); g.rotateY(-s * 0.7); part(b, g, skin2, 2.4); b.userData.s = s; return b; });
  const hl = [1, -1].map(s => { const b = G(body, [-82, 30, s * 66]); const g = leafGeo(58, 22, 0.2); g.rotateX(s * Math.PI / 2); g.rotateY(s * 0.9); part(b, g, skin2, 2.2); b.userData.s = s; return b; });
  part(body, cone(14, 36, 0.6, 8), skin2, 1.8, [-122, 36, 0], [0, 0, Math.PI / 2 + 0.1]);
  const api = { root, kind: 'turtle', noFace: true, face: { set() { } }, height: 120, cycle: 80 };
  api.pose = po => {
    const t = po.t || 0, ph = (po.ph || 0) * Math.PI * 2, dig = po.dig || 0, k = baby ? 0.27 : 1;
    root.position.set(po.x || 0, po.y || 0, po.z || 0); root.rotation.y = po.yaw || 0; root.scale.setScalar((po.scale || 1) * k);
    const mv = po.move == null ? 0 : po.move;
    bob.position.y = 3 * Math.sin(t * 1.9) + (mv > 0 ? 3 * Math.abs(Math.sin(ph)) : 0) - (po.sink || 0);
    body.rotation.z = (po.pitch || 0) + dig * 0.12 - 0.05 * mv * Math.sin(ph); body.rotation.x = 0.06 * mv * Math.sin(ph + 1);
    fl.forEach((f, i) => { const s = f.userData.s; const a = mv * Math.sin(ph + (i ? Math.PI : 0)); f.rotation.y = 0.6 * a + (dig > 0 ? 0.15 * Math.sin(t * 3) : 0); f.rotation.z = 0.25 * a * s; });
    hl.forEach((f, i) => { const s = f.userData.s; const a = mv * Math.sin(ph + (i ? 0 : Math.PI)) * 0.5; const d = dig * Math.sin(t * 7 + i * Math.PI); f.rotation.y = a + 0.9 * d * s * 0; f.rotation.z = 0.8 * Math.abs(d) * dig + 0.2 * a; f.rotation.x = 0.6 * d * dig; });
    neck.rotation.z = 0.35 * (po.headUp || 0) + 0.05 * Math.sin(t * 1.3); head.rotation.y = po.headYaw || 0;
    const bl = po.blink ? 1 : 0; eyes.forEach(o => { o.lid.position.y = 8 - 8 * bl * 0.9; o.pu.position.x = 2.5 + 2 * ((po.look || [0, 0])[0]); });
  };
  return api;
}

/* ---------------------------------------------------------------- Mount Meron: cartoon mountain, base radius R, height 1200 (scale in the caller) */
export function makeMeron(o) {
  o = Object.assign({ R: 600, H: 1200, trunc: 0, seed: 5 }, o || {});
  const root = G(), r = rng(o.seed), R = o.R, H = o.H, tt = o.trunc;
  const top = o.top == null ? (tt > 0 ? 0.8 : 0) : o.top, hs = [0, 0.1, 0.25, 0.45, 0.68, 0.86, 0.96], pf = [1, 0.97, 0.86, 0.7, 0.5, 0.34, 0.2];
  const prof = hs.map((h, i) => [R * (top + (1 - top) * pf[i]), H * h]);
  if (top > 0) prof.push([R * top, H], [0.01, H]); else prof.push([R * 0.08, H], [0.01, H * 1.02]);
  const at = y => { for (let i = 1; i < prof.length; i++) if (y <= prof[i][1] + 1e-6) { const A = prof[i - 1], B = prof[i], u = (y - A[1]) / Math.max(1e-6, B[1] - A[1]); return [A[0] + (B[0] - A[0]) * u, y]; } return prof[prof.length - 1]; };
  const slice = (y0, y1) => { const out = [at(y0)]; prof.forEach(q => { if (q[1] > y0 + 1e-6 && q[1] < y1 - 1e-6) out.push(q); }); out.push(at(y1)); return out; };
  const noisy = g => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.07 * Math.sin(a * 5 + y * 0.004) + 0.05 * Math.sin(a * 9 + 1.3); p.setXYZ(i, x * k, y, z * k); } g.computeVertexNormals(); return g; };
  const yTop = prof[prof.length - 2][1];
  [[0, 0.3 * H, '#5a8c46'], [0.3 * H, 0.62 * H, '#7fa65a'], [0.62 * H, yTop + 1, '#b8ab92']].forEach(([y0, y1, c], i) => { let pts = slice(y0, Math.min(y1, yTop + 1e-3)); if (i === 2) pts = pts.concat([prof[prof.length - 1]]); part(root, noisy(lathe(pts, 44)), toon(c, { tint: '#a0a0b8' }), i === 0 ? 4.2 : 3.2); });
  // little pines on the slopes
  const tm = M('#3f7a3f', '#9ab59a'), tm2 = M('#4f8f45', '#9ab59a');
  const nT = 22;
  for (let i = 0; i < nT; i++) { const a = r() * 6.283, h = (0.04 + r() * 0.5) * H, rad = R * (1 - 0.7 * (h / H)) * 0.93 * (1 + 0.0 * Math.sin(a * 5));
    const q = G(root, [Math.cos(a) * rad, h, Math.sin(a) * rad]); const s = 0.9 + r() * 0.5; q.scale.setScalar(s); q.rotation.y = a;
    part(q, cone(34, 70, 1, 8), i % 2 ? tm : tm2, 2, [0, 6, 0]); part(q, cone(26, 56, 1, 8), i % 2 ? tm : tm2, 2, [0, 40, 0]); }
  root.userData.top = H;
  return root;
}

/* ---------------------------------------------------------------- treasure chest with an icon above (kind: drop | salt | flame) */
export function makeChest(kind) {
  const root = G(), wood = M('#8a5a2e', '#b09080'), woodD = M('#6a4220', '#a08070'), gold = M('#e6bf4e', '#d4b070');
  const base = G(root);
  bx(base, 170, 84, 112, wood, [0, 42, 0], 2.4, null, 8);
  for (const x of [-62, 62]) bx(base, 14, 86, 118, gold, [x, 42, 0], 1.6, null, 3);
  const lid = G(root, [0, 84, -50]);
  const lg = new THREE.CylinderGeometry(56, 56, 170, 18, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2).rotateY(0); lg.rotateY(Math.PI);
  part(lid, lg, wood, 2.4, [0, 0, 50]);
  for (const x of [-62, 62]) { const bg = new THREE.CylinderGeometry(58, 58, 14, 18, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2); bg.rotateY(Math.PI); part(lid, bg, gold, 1.4, [x, 0, 50]); }
  part(root, ell(12, 14, 6, 10, 8), gold, 1.6, [0, 78, 58]);
  // icon
  const ic = G(root, [0, 190, 0]);
  if (kind === 'drop') { const prof = []; for (let i = 0; i <= 24; i++) { const u = i / 24, y = -40 + 110 * u, rr = u < 0.55 ? 34 * Math.sin(Math.PI * (u / 0.55) * 0.5 + 0.0) : 34 * Math.pow(Math.cos(Math.PI / 2 * ((u - 0.55) / 0.45)), 1.4); prof.push([rr + 0.01, y]); }
    part(ic, lathe(prof, 28), M('#5ec0ee', '#a8c8e8'), 2.8); part(ic, ell(6, 10, 4, 8, 6), M('#ffffff', '#fff', 0), 0, [-12, 4, 24]); }
  else if (kind === 'salt') { for (const [x, y, z, s] of [[-20, 4, 0, 1], [22, 0, 6, 0.9], [2, 36, -2, 0.85]]) bx(ic, 46 * s, 46 * s, 46 * s, M('#ffffff', '#c8d0e4'), [x, y, z], 2.4, [0.3 * x * 0.05, 0.5 + x * 0.01, 0.2], 6); }
  else { const prof = []; for (let i = 0; i <= 24; i++) { const u = i / 24, y = -34 + 120 * u, rr = 36 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 0.9); prof.push([rr + 0.01, y]); }
    part(ic, lathe(prof, 20), M('#f08a2e', '#e0a070'), 2.8); part(ic, lathe(prof.map(([a, b]) => [a * 0.55 + 0.01, b * 0.6 - 10]), 20), M('#ffd45a', '#e8c880', 0), 0); part(ic, lathe(prof.map(([a, b]) => [a * 0.28 + 0.01, b * 0.35 - 14]), 16), M('#fff4b0', '#fff4b0', 0), 0); }
  root.userData = { lid, ic, kind };
  return root;
}

/* ---------------------------------------------------------------- misc small props */
export function makeCup() {
  const g = G(); part(g, lathe([[0.01, 0], [9, 0], [11, 2], [13, 24], [0.01, 24]], 16), M('#e3f3fa', '#b8d0e0', 0), 1.6);
  const w = part(g, lathe([[0.01, 2], [9.5, 2.5], [11.5, 16], [0.01, 16]], 16), M('#5ec0ee', '#a8c8e8', 0), 0); g.userData.water = w; return g;
}
export function makeScarf() {
  const g = G(); part(g, new THREE.TorusGeometry(74, 11, 10, 28).rotateX(Math.PI / 2), M('#d9534f', '#e0a8a0'), 2.2);
  const tl = leafGeo(70, 20, 0.3); tl.rotateZ(Math.PI); part(g, tl, M('#f4e6c8', '#d8c8b0'), 2, [30, -2, 64]); return g;
}
export function makeAngler(seed) {
  const g = G(), r = rng(seed || 1), body = M('#3a3358', '#6a6490'), lure = M('#fff4a0', '#fff4a0', 0);
  part(g, ell(52, 40, 36, 20, 14), body, 2.4); part(g, leafGeo(40, 18, 0.3).rotateZ(Math.PI / 2), body, 2, [-58, 0, 0]);
  part(g, ell(11, 11, 6, 10, 8), M('#ffffff', '#fff', 0), 1.2, [34, 10, 30]); part(g, ell(5, 6, 3, 8, 6), M('#101010', '#101010', 0), 0, [37, 9, 35]);
  part(g, ell(11, 11, 6, 10, 8), M('#ffffff', '#fff', 0), 1.2, [34, 10, -30]); part(g, ell(5, 6, 3, 8, 6), M('#101010', '#101010', 0), 0, [37, 9, -35]);
  part(g, tubeAlong([V(40, 8, 0), V(64, 56, 0), V(92, 62, 0)], 2.4, { segs: 10, radial: 6 }), ink(), 0);
  const bulb = part(g, ell(9, 9, 9, 10, 8), lure, 0, [94, 62, 0]); g.userData.lure = bulb;
  for (let i = 0; i < 5; i++) part(g, cone(3.4, 14, 1, 5), M('#ffffff', '#fff', 0), 0, [44 + i * 2, -8, (i - 2) * 11], [0, 0, Math.PI]);
  return g;
}
export function makeJelly(seed) {
  const g = G(), c = M('#a88ae0', '#d0c0f0', 0);
  part(g, new THREE.SphereGeometry(1, 20, 12, 0, 6.283, 0, 1.57).scale(46, 38, 46), c, 2.2);
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; part(g, tubeAlong([V(Math.cos(a) * 26, 0, Math.sin(a) * 26), V(Math.cos(a) * 30, -36, Math.sin(a) * 30), V(Math.cos(a) * 24, -70, Math.sin(a) * 24)], 3.6, { segs: 8, radial: 6 }), c, 1.4); }
  return g;
}
