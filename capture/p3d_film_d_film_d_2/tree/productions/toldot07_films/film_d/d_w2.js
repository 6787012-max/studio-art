/* film_d worlds 2: terrain builder, ancient Yafo (GY), cedar mountains (GN), the road to the hills (GJ), ancient ships, rafts, carts, trucks. ASCII only. */
import { THREE, sm, cl, frac, V, part, ell, tube, tubeAlong, lathe, toon, KT, M, box, rockGeo, rng, G, col, GY, GN, GJ, hullGeo, makeHalo, lerp, ease, flags } from './d_core.js';

/* ---------------------------------------------------------------- generic vertex-coloured terrain */
export function makeTerrain(H, C, x0, x1, z0, z1, nx, nz) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz).rotateX(-Math.PI / 2), p = g.attributes.position, cols = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + (x0 + x1) / 2, z = p.getZ(i) + (z0 + z1) / 2, h = H(x, z); p.setXYZ(i, x, h, z); const c = C(x, z, h); cols[3 * i] = c.r; cols[3 * i + 1] = c.g; cols[3 * i + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals();
  return new THREE.Mesh(g, toon('#ffffff', { tint: '#d8c4b0', hi: 0, vc: true }));
}
const bump = (x, z, d) => { const dx = (x - d[0]) / d[2], dz = (z - d[1]) / d[2], q = dx * dx + dz * dz; return q >= 1 ? 0 : d[3] * (1 - q) * (1 - q); };
const mix = (a, b, u) => a.clone().lerp(b, cl(u, 0, 1));
/* ancient ship with a PLAIN sail (kit version has stripes). root faces +x. update(t) sways the sail. */
export function makeAncientShip(o) {
  o = Object.assign({ logs: false, oars: true, sail: '#eadbb2' }, o || {});
  const g = G(), wood = toon('#9a6234', { tint: '#b08a7a', stripes: 16 }), dark = M('#6a3f22', '#a08070'), sailA = M(o.sail, '#d8cbb8'), rope = M('#c9a46a', '#b08a7a', 0);
  part(g, hullGeo(520, 90, 150), wood, 3.4);
  box(g, 440, 6, 96, M('#c08a54', '#b49a84', 0), [-10, 80, 0], 2);
  part(g, tubeAlong([V(-262, 96, 0), V(-300, 150, 0), V(-292, 196, 0), V(-262, 186, 0)], 10, { segs: 24 }), dark, 2.6);
  part(g, tubeAlong([V(262, 100, 0), V(290, 140, 0), V(296, 166, 0)], t => 10 - 5 * t, { segs: 16 }), dark, 2.4);
  for (const s of [1, -1]) { part(g, ell(10, 10, 4, 12, 8), M('#ffffff', '#ffffff', 0), 1.6, [230, 70, s * 56]); part(g, ell(5, 5, 3, 10, 8), M('#1d1613', '#1d1613', 0), 0, [233, 70, s * 59]); }
  part(g, tube(7, 6, 330).translate(0, 388, 0), dark, 2.4, [20, 0, 0]);
  part(g, beamGeo([0, 300, -150], [0, 470, 150], 5), dark, 2, [24, 0, 0]);   /* diagonal (lateen) yard: no cross shape */
  const sail = G(g, [30, 250, 0]); g.userData.sail = sail;
  for (let i = 0; i < 6; i++) { const z = -125 + i * 50, top = 300 + (z + 150) / 300 * 170 - 250 - 8, hh = Math.max(40, top + 135 + 20); box(sail, 4, hh, 50, sailA, [3 * Math.cos((z / 125) * 1.4), top - hh / 2, z], 1.6, null, 1.2); }
  for (const s of [1, -1]) part(g, tubeAlong([V(26, 400, s * 150), V(120, 260, s * 40), V(250, 96, 0)], 1.6, { segs: 10 }), rope, 0);
  part(g, tubeAlong([V(-230, 150, 50), V(-270, 60, 80), V(-290, -20, 90)], 5, { segs: 12 }), dark, 2);
  const oars = []; if (o.oars) for (const s of [1, -1]) for (let i = 0; i < 5; i++) { const ob = G(g, [-120 + i * 55, 80, s * 66]); part(ob, tubeAlong([V(0, 0, 0), V(-10, -60, s * 64), V(-16, -100, s * 94)], 3.4, { segs: 8 }), dark, 1.6); oars.push([ob, s, i]); }
  const logsG = G(g);
  if (o.logs) { const lm = [toon('#8a5a3a', { tint: '#b08a7a' }), M('#e3b77d', '#c9a080', 0)];
    for (const [n, y] of [[3, 100], [2, 130], [1, 160]]) for (let i = 0; i < n; i++) part(logsG, new THREE.CylinderGeometry(16, 16, 230, 18).rotateZ(Math.PI / 2), lm, 2.2, [-80, y, (i - (n - 1) / 2) * 34]); }
  g.userData.logs = logsG;
  g.userData.update = t => { sail.scale.x = 1 + 0.6 * Math.sin(t * 0.8); sail.position.x = 30 + 6 * (1 + Math.sin(t * 0.8)); oars.forEach(([ob, s, i]) => { ob.rotation.x = s * 0.35 * Math.sin(t * 2.2 + i * 0.4); ob.rotation.z = 0.12 * Math.cos(t * 2.2 + i * 0.4); }); };
  return g;
}
export function beamGeo(a, b, r) { const d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(); const g = new THREE.CylinderGeometry(r, r * 1.15, L, 7); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize())); g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); return g; }
/* thin rope between two world points (cylinder): call setRope(mesh, a, b) */
export function makeRope(parent, r, colr) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r || 3, r || 3, 1, 6), new THREE.MeshBasicMaterial({ color: col(colr || '#7a5a3a') })); parent.add(m); return m; }
const _up = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion();
export function setRope(m, a, b) { const d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(); m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.scale.set(1, Math.max(L, 0.01), 1); _q.setFromUnitVectors(_up, d.normalize()); m.quaternion.copy(_q); }

/* ---------------------------------------------------------------- Y: ancient Yafo */
export const HY = (x, z) => {
  let y = z <= -30 ? -24 : (z < 60 ? -24 + 34 * sm((z + 30) / 90) : 10 + Math.min((z - 60) * 0.02, 22));
  if (z > -30) { y += bump(x, z, [350, 1050, 900, 520]) + bump(x, z, [2600, 2700, 1700, 650]) + bump(x, z, [-2900, 2900, 1800, 760]) + bump(x, z, [-1300, 1500, 700, 150]) + bump(x, z, [1700, 1300, 600, 120]);
    y += sm(z / 600) * (8 * Math.sin(x * 0.004 + z * 0.003)); }
  return y;
};
const sandC = col('#efd9a3'), stoneC = col('#e5cf9a'), hillC = col('#e9dcba'), greenC = col('#8ab75c'), hazeC = col('#d9e6d6');
export const yTerr = makeTerrain(HY, (x, z, h) => { let c = sandC.clone(); c = mix(c, stoneC, sm((z - 60) / 300)); c = mix(c, hillC, sm((h - 200) / 300)); c = mix(c, greenC, sm((z - 1900) / 800) * (x > 1400 || x < -1700 ? 1 : 0.6)); return mix(c, hazeC, sm((z - 3200) / 3000) * 0.6); }, -9000, 9000, -300, 6500, 260, 120);
GY.add(yTerr);
export const ysea = KT.makeSea({ A: 16, L: 340, palette: 'summer', pos: [0, -2, -2200], shore: [-40, 400] }); GY.add(ysea.mesh);
export const yfoam = KT.makeFoamLine({ z0: -10, width: 90, len: 9000 }); GY.add(yfoam.mesh);
ysea.setCalm(0, -280, 1500, 260, 0.12);
GY.add(KT.makeHills({ a0: 0.15 * Math.PI, a1: 0.85 * Math.PI, dists: [8000, 10500, 13500], base: '#8ab75c', haze: '#d9e6d6', h: 1100, n: 8 }));
export const yClouds = [0, 1, 2, 3].map(i => { const c = KT.makeCloud(i + 301, { s: 3.2 }); c.position.set(-3600 + i * 2500, 1600 + (i % 2) * 400, -5200 - i * 300); GY.add(c); return c; });
export const yBirds = KT.makeBirds({ n: 5, r: 800, y: 600, seed: 31 }); yBirds.position.set(200, 0, -500); GY.add(yBirds);
{ // the town on the hill: simple stone houses, flat roofs, doors and windows (no religious buildings)
  const r = rng(404), cols = ['#efe2c2', '#e8d6ab', '#f3ead6', '#e2cc9a'], placed = [], dark = M('#4a3a30', '#4a3a30', 0), win = M('#6a5a4a', '#6a5a4a', 0);
  let tries = 0;
  while (placed.length < 62 && tries++ < 900) {
    const a = r() * Math.PI * 2, rho = 0.12 + 0.85 * Math.sqrt(r()), x = 350 + rho * Math.cos(a) * 880, z = 130 + rho * (Math.sin(a) * 0.5 + 0.5) * 1600;
    if (z < 130 || z > 1750 || placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 150)) continue;
    placed.push([x, z]); const w = 100 + r() * 70, h = 70 + r() * 70, d = 90 + r() * 50, yy = HY(x, z) - 12, g = G(GY, [x, yy, z]);
    box(g, w, h, d, M(cols[Math.floor(r() * 4)], '#c9b08c'), [0, h / 2, 0], 2.6, null, 4); box(g, w + 12, 12, d + 12, M('#d6c08a', '#b9a070', 0), [0, h + 6, 0], 2, null, 2);
    box(g, 22, 40, 4, dark, [w * 0.2, 22, -d / 2 - 1], 0); box(g, 18, 22, 4, win, [-w * 0.22, h * 0.6, -d / 2 - 1], 0); if (r() > 0.5) box(g, 18, 22, 4, win, [w * 0.05, h * 0.6, -d / 2 - 1], 0);
    if (r() > 0.6) box(g, w * 0.5, 30, d * 0.5, M('#efe2c2', '#c9b08c'), [0, h + 28, 0], 2.2, null, 3); }
  for (let i = 0; i < 9; i++) { const x = -900 + r() * 2200, z = 100 + r() * 700; if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 150)) continue; const t = KT.makeTree('palm', i + 77, 0.9); t.position.set(x, HY(x, z) - 4, z); GY.add(t); }
}
/* stone quay + wooden derrick + amphorae + crates */
export const yQuay = (() => {
  const g = G(GY), st = M('#d8c496', '#bba07c', 0), woodm = M('#9a6a3e', '#7a5a3a'), r = rng(515);
  box(g, 1500, 60, 220, st, [150, 12, 120], 3, null, 4); box(g, 1500, 14, 26, M('#bfa878', '#9a8a6a', 0), [150, 44, 18], 1.6, null, 2);
  for (let i = 0; i < 6; i++) part(g, lathe([[0.01, 0], [14, 0], [14, 16], [18, 20], [18, 28], [0.01, 28]], 14), M('#3b3532', '#6a6a80'), 1.6, [-380 + i * 230, 42, 36]);
  for (let i = 0; i < 12; i++) { const s = 34 + r() * 26; box(g, s, s, s, [M('#b07a45', '#8a5a3a'), M('#c89a5a', '#9a7a5a')][i % 2], [-480 + r() * 1100, 42 + s / 2, 70 + r() * 90], 2, [0, r() * 3, 0], 3); }
  for (let i = 0; i < 9; i++) part(g, lathe([[0.01, 0], [14, 0], [26, 20], [30, 44], [18, 66], [12, 80], [16, 84], [0.01, 84]], 16), M(['#c0693a', '#b5653d'][i % 2], '#8a4a2a'), 1.8, [-500 + r() * 1000, 42, 100 + r() * 110]);
  // derrick: tripod (A-frame) mast + a diagonal boom that swings; hook rope
  const mast = G(g, [330, 42, 40]); part(mast, tube(9, 11, 300, 10).translate(0, 300, 0), woodm, 2.2); box(mast, 40, 14, 40, woodm, [0, 6, 0], 2);
  for (const z of [-1, 1]) part(mast, beamGeo([0, 296, 0], [-150, 4, z * 95], 6), woodm, 2);
  const boom = G(mast, [0, 290, 0]); part(boom, tube(6, 7, 230, 8).rotateZ(2.47), woodm, 2); g.userData.boom = boom; g.userData.mast = mast;
  g.userData.hook = makeRope(g, 2.4, '#7a5a3a'); g.userData.crate = box(g, 46, 40, 46, M('#c89a5a', '#9a7a5a'), [0, 0, 0], 2, null, 3);
  return g;
})();
/* the natural rock line (a breakwater nobody built) */
export const yRocks = (() => { const g = G(GY), r = rng(61), list = [];
  [-1500, -1200, -950, -640, -420, -120, 120, 360, 640, 900, 1180, 1480].forEach((x, i) => { const s = 0.8 + r() * 0.8; if (i === 5 || i === 9) return;
    const m = part(g, rockGeo(120 * s, 100 * s, 90 * s, i + 70, 0.3), M(['#8a7e6e', '#7a6e60', '#9a8c78'][i % 3], '#a09484'), 3, [x, 20 * s, -540 + (r() - 0.5) * 80]); m.rotation.y = r() * 6; list.push(m); });
  return g; })();
export const yShips = [makeAncientShip({ oars: true }), makeAncientShip({ oars: false, logs: true }), makeAncientShip({ oars: false })]; yShips.forEach(s => { s.visible = false; GY.add(s); });
export const ySefer = (() => { const g = G(GY); g.visible = false; return g; })();
export function yTick(T) { if (flags.collect) return; ysea.update(T); yfoam.update(T, 0.9); yBirds.userData.update(T); }

/* ---------------------------------------------------------------- N: cedar mountains */
export const HN = (x, z) => {
  let y = 0; const B = [[-1900, 3200, 1700, 1800], [1700, 3700, 2000, 2100], [-200, 5400, 2500, 2500], [4100, 2800, 1500, 1200], [-4100, 2500, 1500, 1100], [0, 2300, 900, 330]];
  for (const b of B) y += bump(x, z, b); y += sm((z - 300) / 1500) * (60 * Math.sin(x * 0.004 + z * 0.002) + 30 * Math.sin(x * 0.011 - z * 0.006));
  return y + (z < 200 ? 0 : 0);
};
const fG = col('#5b9a4a'), fG2 = col('#6aa84f'), rockN = col('#9a9488'), snowN = col('#f2f4f6'), hazeN = col('#cfe0ea');
export const nTerr = makeTerrain(HN, (x, z, h) => { let c = mix(fG, fG2, 0.5 + 0.5 * Math.sin(x * 0.004 + z * 0.003)); c = mix(c, rockN, sm((h - 1000) / 400)); c = mix(c, snowN, sm((h - 1500) / 250)); return mix(c, hazeN, sm((z - 3200) / 4000) * 0.55); }, -9000, 9000, -1500, 8500, 220, 130);
GN.add(nTerr);
export function makeCedar(seed, s) {
  const g = G(), r = rng(seed), tr = M('#7a5030', '#9a7a60'), gm = [M('#2f6b3a', '#6a9a7a'), M('#3b7d44', '#7aa88a'), M('#296036', '#6a9a7a')];
  part(g, new THREE.CylinderGeometry(20, 34, 300, 10).translate(0, 150, 0), tr, 2.4);
  const n = 6; for (let k = 0; k < n; k++) { const y = 150 + k * 66, rx = (220 - k * 30) * (0.9 + 0.2 * r()), m = part(g, ell(rx, 20, rx * 0.8, 18, 8), gm[(k + seed) % 3], 2.6, [(r() - 0.5) * 26, y, (r() - 0.5) * 20]); m.rotation.y = r() * 3; }
  part(g, new THREE.ConeGeometry(48, 150, 10).translate(0, 590, 0), gm[0], 2.4);
  g.scale.setScalar(s || 1); return g;
}
{ const r = rng(711); for (let i = 0; i < 70; i++) { const x = -3200 + r() * 6400, z = 250 + r() * 2400; if (Math.hypot(x, z - 650) < 380) continue; const c = makeCedar(i + 5, 0.9 + r() * 0.9); c.position.set(x, HN(x, z) - 6, z); GN.add(c); }
  for (let i = 0; i < 30; i++) { const x = -2200 + r() * 4400, z = 150 + r() * 1200; const b = KT.makeBush(i + 800, { col: '#4f8f45', s: 1 + r() * 0.8 }); b.position.set(x, HN(x, z), z); GN.add(b); }
  for (let i = 0; i < 40; i++) { const x = -2000 + r() * 4000, z = 150 + r() * 1200; const t = KT.makeGrassTuft(i + 900, { col: '#7fb85a', h: 50 + r() * 40, n: 9 }); t.position.set(x, HN(x, z), z); GN.add(t); }
  for (let i = 0; i < 4; i++) { const c = KT.makeCloud(i + 351, { s: 3.4 }); c.position.set(-3200 + i * 2400, 2700 + (i % 2) * 300, 6000); GN.add(c); } }
export const crown = (() => {
  const g = G(GN), gold = toon('#f5c542', { tint: '#d9a030', hi: 1 }), jew = M('#d9402e', '#d9402e', 0), jew2 = M('#2e86c1', '#2e86c1', 0);
  part(g, lathe([[0.01, 0], [60, 0], [64, 10], [60, 50], [0.01, 50]], 24).translate(0, 0, 0), gold, 3);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, x = Math.cos(a) * 54, z = Math.sin(a) * 54; part(g, new THREE.ConeGeometry(15, 62, 8).translate(0, 31, 0), gold, 2.6, [x, 50, z]); part(g, ell(9, 9, 9, 10, 8), i % 2 ? jew : jew2, 1.6, [x, 116, z]); }
  part(g, ell(11, 11, 11, 10, 8), jew, 1.6, [0, 28, 62]); g.scale.setScalar(2.2); g.visible = false; g.userData.halo = makeHalo(420, '#ffe27a', 0.5); g.userData.halo.visible = false; GN.add(g.userData.halo);
  return g; })();

/* ---------------------------------------------------------------- J: the road to the hills, Jerusalem far away, a village */
export const XR = z => 380 * Math.sin(z / 1300) + 120 * Math.sin(z / 470);
export const RAMP = z => 1150 * sm((z - 900) / 6400);
export const HJ = (x, z) => {
  const dr = Math.abs(x - XR(z)), mask = sm((dr - 140) / 560); let y = RAMP(z);
  y += mask * (bump(x, z, [-2300, 3300, 1300, 520]) + bump(x, z, [2400, 4200, 1400, 640]) + bump(x, z, [-1500, 6000, 1400, 560]) + bump(x, z, [1900, 6900, 1300, 520]) + bump(x, z, [-3800, 1800, 1500, 420]) + bump(x, z, [3500, 1300, 1400, 380]));
  y += mask * sm(z / 800) * (30 * Math.sin(x * 0.006 + z * 0.003));
  y += bump(x, z, [XR(7900) + 0, 8100, 1100, 330]);
  return y;
};
const jG1 = col('#8ab75c'), jG2 = col('#6aa84f'), jDry = col('#c9bb6a'), jRoad = col('#d6bc82'), jHaze = col('#d9e6d6');
export const jTerr = makeTerrain(HJ, (x, z, h) => { const dr = Math.abs(x - XR(z)); let c = mix(jG1, jG2, 0.5 + 0.5 * Math.sin(x * 0.004 + z * 0.003)); c = mix(c, jDry, sm((h - 700) / 500) * 0.7); c = mix(c, jRoad, 1 - sm((dr - 55) / 40)); return mix(c, jHaze, sm((z - 4200) / 4000) * 0.5); }, -7000, 7000, -600, 9200, 280, 190);
GJ.add(jTerr);
GJ.add(KT.makeHills({ a0: 0.35 * Math.PI, a1: 0.65 * Math.PI, dists: [12000, 15000], base: '#8ab75c', haze: '#d9e6d6', h: 1400, n: 6 }));
export const city = (() => { const r = rng(1313), cx = XR(7900), cz = 8100, base = HJ(cx, cz), g = G(GJ, [cx, base, cz]); g.scale.setScalar(2.4);
  const wm = [M('#fbf0cf', '#e0cc98', 0), M('#f4e3b5', '#e0cc98', 0), M('#fff7dc', '#e8d8a8', 0)];
  for (let i = 0; i < 70; i++) { const a = r() * 6.28, rho = Math.sqrt(r()) * 640, x = cx + Math.cos(a) * rho, z = cz + Math.sin(a) * rho * 0.7, w = 70 + r() * 90, h = 50 + r() * 110; box(g, w, h, w * (0.8 + r() * 0.4), wm[i % 3], [x - cx, HJ(x, z) - base + h / 2 - 8, z - cz], 2, [0, r() * 1.5, 0], 3); }
  g.userData.halo = makeHalo(1100, '#ffe9a8', 0.42); g.userData.halo.position.set(0, 120, -200); g.userData.halo.material.depthTest = true; g.userData.halo.renderOrder = 6; g.add(g.userData.halo);
  return g; })();
const roadPts = []; for (let z = -300; z <= 7900; z += 80) roadPts.push([XR(z), z]);
{ const n = roadPts.length, P = new Float32Array(n * 2 * 3), I = []; roadPts.forEach(([x, z], i) => { const y = HJ(x, z) + 2.2, dz = 1; P.set([x - 62, y, z, x + 62, y, z], i * 6); if (i < n - 1) { const a = i * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setIndex(I); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col('#e2c88c'), side: THREE.DoubleSide })); GJ.add(m);
  const r = rng(77); for (let i = 0; i < 160; i++) { const z = -200 + r() * 7600, side = r() > 0.5 ? 1 : -1, x = XR(z) + side * (75 + r() * 25); const s = KT.makeStone(i + 9, 0.3 + r() * 0.4); s.position.set(x, HJ(x, z), z); GJ.add(s); }
  for (let i = 0; i < 90; i++) { const z = 100 + r() * 7000, side = r() > 0.5 ? 1 : -1, x = XR(z) + side * (170 + r() * 900); const k = i % 4; const t = k === 0 ? KT.makeTree('pine', i + 3, 1.2) : (k === 1 ? KT.makeBush(i + 40, { col: '#6aa84f', s: 1.2 }) : KT.makeGrassTuft(i + 20, { col: '#9cae5c', h: 60, n: 9 })); t.position.set(x, HJ(x, z), z); GJ.add(t); }
  for (let i = 0; i < 4; i++) { const c = KT.makeCloud(i + 451, { s: 3.4 }); c.position.set(-3200 + i * 2400, 2800 + (i % 2) * 300, 7000); GJ.add(c); } }
export const village = (() => { const g = G(GJ), r = rng(2020), cx = XR(2300), cz = 2300, list = [];
  for (let i = 0; i < 9; i++) { const side = i % 2 ? 1 : -1, z = 2000 + Math.floor(i / 2) * 150 + r() * 40, x = XR(z) + side * (340 + r() * 100), w = 150 + r() * 50, h = 90 + r() * 50;
    const hg = G(g, [x, HJ(x, z) - 6, z]); hg.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; box(hg, w, h, 130, M(['#efe2c2', '#e8d6ab', '#f3ead6'][i % 3], '#c9b08c'), [0, h / 2, 0], 2.6, null, 4);
    box(hg, w + 14, 14, 144, M('#b5653d', '#8a4a2a'), [0, h + 7, 0], 2.2, null, 3); box(hg, 36, 60, 4, M('#6a4a30', '#6a4a30', 0), [0, 30, 66], 0); box(hg, 30, 28, 4, M('#8ec0e0', '#8ec0e0', 0), [-w * 0.3, h * 0.62, 66], 0); list.push(hg); }
  return g; })();
