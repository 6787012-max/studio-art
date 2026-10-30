/* film_d worlds 4: modern port (GP) with the giant ship, cranes, trucks, buses, containers; crate-grid insert (GI); gift crate. ASCII only. */
import { THREE, sm, cl, frac, V, part, ell, tube, tubeAlong, lathe, toon, KT, M, box, rockGeo, rng, G, col, GP, GI, makeLabel, makeParticles, makeSparkle, lerp, ease, lin, flags } from './d_core.js';
import { setRope, makeRope } from './d_w2.js';

export const mport = KT.makeModernPort(); GP.add(mport.root);
export const psea = mport.sea, ship = mport.ship; GP.add(ship);
ship.rotation.order = 'YXZ';
{ const g = GP, r = rng(4242);   // land extension + a long coastal road + dressing
  box(g, 9000, 80, 1600, M('#c9c6c0', '#b9b0c4', 0), [7500, 20, 1200], 3, null, 4);
  box(g, 12000, 2, 170, M('#55555c', '#555', 0), [5800, 61, 770], 0);
  for (let i = 0; i < 60; i++) box(g, 70, 2.4, 8, M('#f2f2ee', '#f2f2ee', 0), [-200 + i * 150, 62.6, 770], 0);
  box(g, 10000, 12, 40, M('#f0c040', '#c9a080', 0), [5200, 62, 412], 0);
  for (let i = 0; i < 18; i++) { const x = -2800 + i * 520 + r() * 100, z = 1000 + r() * 400; box(g, 220, 120 + r() * 120, 160, M(['#efe2c2', '#e8d6ab', '#f3ead6'][i % 3], '#c9b08c'), [x, 60 + 100, z + 300], 3, null, 5); }
  g.userData.birds = KT.makeBirds({ n: 5, r: 900, y: 700, seed: 41 }); g.userData.birds.position.set(0, 0, -300); g.add(g.userData.birds);
  g.add(KT.makeHills({ a0: 0.2 * Math.PI, a1: 0.8 * Math.PI, dists: [8000, 10500], base: '#8ab75c', haze: '#d9e6d6', h: 1000, n: 7 }));
  for (let i = 0; i < 4; i++) { const c = KT.makeCloud(i + 621, { s: 3.3 }); c.position.set(-3600 + i * 2500, 1700 + (i % 2) * 400, -5200 - i * 300); g.add(c); } }
export function portTick(T) { if (flags.collect) return; mport.update(T); GP.userData.birds.userData.update(T); }
const CCOL = ['#d9534f', '#2e86c1', '#f0ad4e', '#5cb85c', '#8e6c8a', '#e8e8e8', '#3b6e8f'].map(c => M(c, '#b0a8c4'));

/* ---------------------------------------------------------------- containers, buses, trucks */
export function makeContainer(s, cidx, rib) {
  const g = G(), m = CCOL[(cidx || 0) % CCOL.length], rm = M('#2b2b30', '#2b2b30', 0);
  box(g, 160 * s, 70 * s, 64 * s, m, [0, 0, 0], 2 * Math.max(0.6, s * 0.6), null, 2 * s);
  if (rib) { const n = Math.floor(160 * s / 14); for (let i = 0; i < n; i++) for (const sd of [1, -1]) box(g, 3 * s, 62 * s, 3 * s, rm, [(i - n / 2 + 0.5) * 14, 0, sd * 32.6 * s], 0); }
  return g;
}
export function makeBigContainer(c) {   // tall relative to the boy: 1200 long, 260 high
  const g = G(), m = CCOL[c || 0], rm = M('#3b2b2b', '#3b2b2b', 0);
  box(g, 1200, 260, 250, m, [0, 130, 0], 3, null, 6);
  for (let i = 0; i < 56; i++) for (const sd of [1, -1]) box(g, 8, 236, 6, rm, [-580 + i * 21, 130, sd * 125], 0);
  for (const sd of [1]) { for (const z of [-60, 60]) box(g, 6, 230, 8, M('#9a9a9a', '#9a9a9a', 0), [601, 130, z], 0); box(g, 4, 230, 4, rm, [601, 130, 0], 0); }
  return g;
}
export function makeBus(i) {
  const g = G(), c = ['#f0c040', '#e8e8e8', '#5cb85c', '#d9534f'][i % 4], body = M(c, '#c9b080'), win = M('#8ec0e0', '#8ec0e0', 0), blk = M('#2b2b30', '#555', 0);
  box(g, 100, 40, 36, body, [0, 30, 0], 1.6, null, 5); box(g, 94, 14, 37, win, [0, 42, 0], 0);
  for (const x of [-30, 30]) for (const z of [18, -18]) part(g, new THREE.CylinderGeometry(9, 9, 6, 12).rotateX(Math.PI / 2), blk, 1.2, [x, 10, z]);
  return g;
}
export function makeTruck(c) {
  const g = G(), cab = M('#d9534f', '#b08a9a'), bed = M('#3b3b44', '#555'), blk = M('#2b2b30', '#555', 0), win = M('#8ec0e0', '#8ec0e0', 0);
  box(g, 120, 100, 100, cab, [-190, 80, 0], 2.2, null, 8); box(g, 8, 44, 82, win, [-129, 100, 0], 0); box(g, 440, 16, 100, bed, [10, 40, 0], 2.2, null, 3);
  for (const x of [-190, 20, 110, 190]) for (const z of [54, -54]) part(g, new THREE.CylinderGeometry(28, 28, 18, 16).rotateX(Math.PI / 2), blk, 1.6, [x, 28, z]);
  box(g, 10, 16, 10, M('#f0ad4e', '#f0ad4e', 0), [-250, 56, 30], 0); box(g, 10, 16, 10, M('#f0ad4e', '#f0ad4e', 0), [-250, 56, -30], 0);
  return g;
}

/* ---------------------------------------------------------------- insert: 100 crates, a ship and a small plane */
export const crateRoom = (() => {
  const g = G(GI), r = rng(1010);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4200, 2200).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col('#e8dcc0') })); floor.position.set(300, 0, 0); g.add(floor);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col('#4aa8d8') })); sea.position.set(1000, 1, -200); g.add(sea);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(1300, 260).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col('#8c8c94') })); strip.position.set(900, 1, 650); g.add(strip);
  for (let i = 0; i < 14; i++) box(g, 70, 2, 12, M('#f2f2ee', '#f2f2ee', 0), [260 + i * 95, 3, 650], 0);
  const crates = [];
  const cm = ['#c89a5a', '#b07a45', '#d9b070'].map(c => M(c, '#8a5a3a'));
  for (let i = 0; i < 100; i++) { const gx = i % 10, gz = Math.floor(i / 10), c = box(g, 56, 56, 56, cm[(i * 7) % 3], [-1000 + gx * 70, 28, -315 + gz * 70], 2, null, 3); c.userData.i = i; c.userData.p0 = [-1000 + gx * 70, 28, -315 + gz * 70]; crates.push(c); }
  // small plane (plain)
  const pl = G(g, [1150, 0, 650]); part(pl, ell(150, 38, 38, 20, 12), M('#f4f4f0', '#c9c6d8'), 2.4, [0, 70, 0]); box(pl, 80, 6, 330, M('#d9534f', '#b08a9a'), [10, 62, 0], 2, null, 2); box(pl, 50, 6, 130, M('#d9534f', '#b08a9a'), [-130, 76, 0], 2, null, 2); box(pl, 6, 70, 8, M('#d9534f', '#b08a9a'), [-136, 108, 0], 1.6); part(pl, ell(30, 20, 26, 12, 8), M('#8ec0e0', '#8ec0e0', 0), 1.4, [90, 84, 0]);
  for (const z of [-40, 40]) part(pl, new THREE.CylinderGeometry(14, 14, 8, 12).rotateX(Math.PI / 2), M('#2b2b30', '#555', 0), 1.2, [20, 30, z]);
  const l98 = makeLabel('98', 360, 200, 220), l2 = makeLabel('2', 160, 160, 200); g.add(l98); g.add(l2); l98.position.set(850, 520, -200); l2.position.set(1150, 330, 650);
  g.userData.crates = crates; g.userData.l98 = l98; g.userData.l2 = l2; g.userData.pl = pl; g.visible = false; return g;
})();
export const PLANE_IDX = [41, 73];
export function crateTick(lt, T) {            // lt = time within the crate shot
  const c = crateRoom.userData.crates, S = [820, 130, -140], P = [1250, 100, 650]; let n98 = 0, n2 = 0;
  c.forEach(m => { const i = m.userData.i, plane = PLANE_IDX.includes(i), ti = 1.0 + (i / 100) * 5.8, k = (lt - ti) / 1.4, p0 = m.userData.p0;
    if (k <= 0) { m.position.set(...p0); m.scale.setScalar(1); m.visible = true; return; }
    if (k >= 1) { m.visible = false; if (plane) n2++; else n98++; return; }
    const e = sm(k), T0 = plane ? P : S, a = e < 0.5 ? e * 2 : 1; m.visible = true;
    m.position.set(lerp(p0[0], T0[0], e), lerp(p0[1], T0[1], e) + 140 * Math.sin(Math.PI * e), lerp(p0[2], T0[2], e)); m.scale.setScalar(1 - 0.6 * e * e); m.rotation.y = e * 3; });
  return [n98, n2];
}
export function crateLabels(T, n98, n2) { const u = crateRoom.userData; u.l98.visible = n98 > 0; u.l2.visible = n2 > 0; if (n98 !== u.l98.userData.last) { u.l98.userData.last = n98; u.l98.userData.set(String(n98)); } if (n2 !== u.l2.userData.last) { u.l2.userData.last = n2; u.l2.userData.set(String(n2)); } }

/* ---------------------------------------------------------------- gift crate with a lid, books and fruit */
export const gift = (() => { const g = G(GP), wood = toon('#b07a45', { tint: '#8a5a3a', stripes: 12 }), woodD = M('#7a4a2a', '#6a4a3a');
  box(g, 150, 80, 110, wood, [0, 40, 0], 2.4, null, 3); for (const x of [-60, 60]) box(g, 14, 84, 114, woodD, [x, 41, 0], 1.6, null, 2);
  const lid = G(g, [-75, 82, 0]); box(lid, 156, 10, 114, wood, [78, 5, 0], 2.2, null, 2); for (const x of [-60, 60]) box(lid, 14, 12, 118, woodD, [78 + x, 6, 0], 1.6, null, 2);
  const items = []; const bc = ['#2e86c1', '#d9534f', '#5cb85c', '#f0ad4e', '#8e6c8a'];
  for (let i = 0; i < 5; i++) { const b = G(g); box(b, 40, 9, 30, M(bc[i], '#b0a8c4'), [0, 0, 0], 1.6, null, 1.5); box(b, 36, 7, 27, M('#f6efdc', '#d6cbb8', 0), [2, 0, 0], 0); items.push(b); }
  const fc = ['#d9402e', '#f08a24', '#7cc04a', '#f2c230', '#d9402e', '#f08a24'];
  for (let i = 0; i < 6; i++) { const f = part(g, ell(15, 14, 15, 14, 10), M(fc[i], '#c0a090'), 1.6); items.push(f); }
  g.userData.lid = lid; g.userData.items = items; g.visible = false; return g; })();
export function giftTick(T, k, base) {          // k: seconds since the opening started
  const o = ease(k, 0, 0.8); gift.userData.lid.rotation.z = -1.7 * o; const sp = gift.userData.items;
  sp.forEach((m, i) => { const u = ease(k, 0.5 + i * 0.12, 1.4 + i * 0.12), a = i * 1.7, hx = (i < 5 ? (i - 2) * 24 : (i - 7.5) * 20), hz = (i % 2 ? 22 : -18);
    m.visible = u > 0.01; m.position.set(hx * u, 70 + 80 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u) + 28 * u + 4 * Math.sin(T * 3 + i) * u, hz * u); m.rotation.y = a + u * 2; m.scale.setScalar(Math.max(0.01, u > 0 ? 1 : 0)); });
}
