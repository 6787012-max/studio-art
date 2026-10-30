/* film_d worlds 3b: Caesarea (GC) with building insert, the drowned harbour (GU), the rowing boat. ASCII only. */
import { THREE, sm, cl, frac, V, part, ell, tube, tubeAlong, lathe, toon, KT, M, box, rockGeo, rng, G, col, GC, GU, hullGeo, makeSparkle, makeParticles, makeLabel, lerp, ease, flags } from './d_core.js';
import { makeRope, setRope, makeAncientShip, beamGeo } from './d_w2.js';

export const port = KT.makeAncientPort(); GC.add(port.root); port.ships.forEach(s => { s.visible = false; });
export const csea = port.sea;
export const moles = port.root.children.filter(c => c.isGroup && c.userData.curve), towers = port.root.children.filter(c => c.isGroup && c.children.length === 11);
export const cShips = [makeAncientShip({ logs: true, oars: false }), makeAncientShip({ oars: false })]; cShips.forEach(s => { s.visible = false; GC.add(s); });
GC.add(KT.makeHills({ a0: 0.2 * Math.PI, a1: 0.8 * Math.PI, dists: [7500, 10000], base: '#8ab75c', haze: '#d9e6d6', h: 900, n: 7 }));
for (let i = 0; i < 4; i++) { const c = KT.makeCloud(i + 521, { s: 3.2 }); c.position.set(-3600 + i * 2500, 1600 + (i % 2) * 400, -5200 - i * 300); GC.add(c); }
export const cBirds = KT.makeBirds({ n: 5, r: 700, y: 560, seed: 61 }); cBirds.position.set(0, 0, -200); GC.add(cBirds);
{ const r = rng(5151); for (let i = 0; i < 10; i++) { const x = -1700 + r() * 3400, z = 1000 + r() * 500; const t = KT.makeTree(i % 2 ? 'palm' : 'tamarisk', i + 21, 1.0); t.position.set(x, 50, z); GC.add(t); }
  for (let i = 0; i < 22; i++) { const x = -1900 + r() * 3800, z = 820 + r() * 600; const t = KT.makeGrassTuft(i + 70, { col: '#9cae5c', h: 55, n: 9 }); t.position.set(x, 50, z); GC.add(t); }
  for (let i = 0; i < 12; i++) { const x = -1500 + r() * 3000, z = 650 + r() * 120; box(GC, 40 + r() * 30, 40, 40, M('#c89a5a', '#9a7a5a'), [x, 50 + 20, z], 2, [0, r() * 3, 0], 3); } }

/* the building rig: pontoon, derrick, wooden box frame, hopper, baskets on a rope */
export const build = (() => {
  const g = G(GC, [-250, -4, 130]), wood = toon('#9a6234', { tint: '#b08a7a', stripes: 14 }), woodD = M('#6a3f22', '#a08070');
  box(g, 380, 26, 260, wood, [0, 6, 0], 2.6, null, 3);
  /* A-frame derrick: two slanted legs meeting at an apex, a diagonal boom and a back stay (no cross shapes) */
  for (const z of [-1, 1]) part(g, beamGeo([0, 330, -60], [z * 130, 16, -60 + z * 20], 9), woodD, 2.2);
  part(g, beamGeo([0, 330, -60], [0, 16, 120], 8), woodD, 2.2);
  part(g, beamGeo([0, 320, -70], [0, 600, -430], 10), woodD, 2.2);
  const frame = G(g, [0, 300, -330]);
  for (const s of [1, -1]) { box(frame, 300, 220, 14, wood, [0, 110, s * 125], 2.2, null, 2); box(frame, 14, 220, 260, wood, [s * 143, 110, 0], 2.2, null, 2); }
  for (const y of [60, 160]) for (const s of [1, -1]) box(frame, 306, 12, 18, woodD, [0, y, s * 130], 1.6, null, 2);
  const fill = new THREE.Mesh(new THREE.BoxGeometry(272, 1, 236).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: col('#5e666c') })); frame.add(fill);
  const ropes = [0, 1, 2, 3].map(() => makeRope(g, 3, '#c9a46a'));
  const hop = G(g, [0, 436, -330]); part(hop, lathe([[34, 0], [120, 70], [120, 80], [30, 14], [30, 0]], 4), M('#8a5a3a', '#7a5a3a'), 2.2);
  const baskets = [0, 1, 2].map(() => { const b = G(g); part(b, lathe([[0.01, 0], [30, 0], [44, 56], [48, 60], [42, 60], [26, 10], [0.01, 6]], 14), M('#c08a4a', '#8a5a3a'), 2); part(b, ell(36, 5, 36, 12, 6), M('#6f757a', '#6f757a', 0), 0, [0, 54, 0]); return b; });
  const bline = makeRope(g, 2, '#7a5a3a');
  const P = makeParticles(40, '#6f757a'); g.add(P.mesh);
  const spark = [0, 1, 2, 3, 4, 5].map(() => { const s = makeSparkle(26, '#ffffff'); s.visible = false; g.add(s); return s; });
  const lab = makeLabel('2,000', 440, 150, 150); lab.visible = false; g.add(lab);
  g.visible = false;
  return { g, frame, fill, ropes, hop, baskets, bline, P, spark, lab };
})();
export function buildTick(T, o) {            // o: {drop 0..1, pour 0..1, hard 0..1}
  if (flags.collect) return; const b = build, g = b.g;
  const f = csea.float(g.position.x, g.position.z, 160); g.position.y = f.y - 4; g.rotation.set(f.rx * 0.2, 0, f.rz * 0.2);
  const fy = lerp(300, -60, o.drop); b.frame.position.y = fy;
  b.ropes.forEach((r, i) => { const sx = i % 2 ? 100 : -100, cx = i % 2 ? 140 : -140, cz = i < 2 ? -330 - 120 : -330 + 120; setRope(r, [0, 596, -426], [cx, fy + 220, cz]); });
  const lvl = lerp(2, 215, o.pour); b.fill.scale.set(1, lvl, 1); b.fill.visible = o.pour > 0.001;
  b.fill.material.color.set(col('#5e666c')).lerp(col('#d2ccbb'), o.hard);
  const act = o.pour > 0.001 && o.pour < 0.999;
  for (let i = 0; i < 40; i++) { const u = frac(T * 1.6 + i * 0.137); if (!act) { b.P.hide(i); continue; } b.P.set(i, Math.sin(i * 7.3) * 26, 436 - (436 - (fy + lvl)) * u * u, -330 + Math.cos(i * 5.1) * 26, 7 + 3 * ((i * 7) % 3) / 2); }
  b.P.commit();
  b.baskets.forEach((bk, i) => { const u = frac(T * 0.38 + i / 3), a = [0, 90, -60], c = [0, 410, -330], x = lerp(a[0], c[0], u), y = lerp(a[1], c[1], u) + 40 * Math.sin(Math.PI * u), z = lerp(a[2], c[2], u);
    bk.position.set(x, y, z); bk.rotation.x = -1.2 * ease(u, 0.8, 0.98); bk.visible = act || (o.drop > 0.99 && o.pour < 0.01); });
  setRope(b.bline, [0, 100, -60], [0, 410, -330]);
  b.spark.forEach((s, i) => { const ph = frac(T * 0.8 + i / 6), on = Math.sin(Math.PI * ph) * o.hard * (o.pour > 0.99 ? 1 : 0); s.visible = on > 0.03; s.position.set(Math.cos(i * 2.4) * 110, fy + 250 + 20 * ph, -330 + Math.sin(i * 2.4) * 90); s.scale.setScalar(Math.max(0.01, on)); });
}

/* the drowned harbour seen from under the water */
export const uw = (() => {
  const g = G(GU);
  const bed = new THREE.Mesh(new THREE.CircleGeometry(3200, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col('#d2bd86') })); bed.position.y = -300; g.add(bed);
  const bd = new THREE.Mesh(new THREE.CylinderGeometry(3200, 3200, 1800, 48, 1, true), new THREE.MeshBasicMaterial({ color: col('#2a79a8'), side: THREE.BackSide })); bd.position.y = 500; g.add(bd);
  const topc = new THREE.Mesh(new THREE.CircleGeometry(3200, 48).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: col('#8fe0f4'), transparent: true, opacity: 0.85, side: THREE.DoubleSide })); topc.position.y = 900; g.add(topc);
  const r = rng(99), stone = [M('#cdb88c', '#a89a70'), M('#bba07c', '#9a8a6a'), M('#d8c49a', '#b0a070')], algae = M('#5d8a3a', '#7aa070');
  for (let row = 0; row < 4; row++) for (let i = 0; i < 10 - row; i++) { const x = -700 + i * 150 + row * 70, y = -300 + 30 + row * 56; if (r() > 0.88) continue; box(g, 140, 54, 90, stone[(i + row) % 3], [x + (r() - 0.5) * 8, y, -60 + (r() - 0.5) * 8], 2.4, [0, (r() - 0.5) * 0.1, 0], 3); if (r() > 0.55) box(g, 140, 18, 94, algae, [x, y + 32, -60], 0, null, 2); }
  for (let i = 0; i < 12; i++) box(g, 130, 50, 90, stone[i % 3], [-1300 + r() * 2600, -300 + 26, 300 + r() * 500], 2.4, [0, r() * 3, (r() - 0.5) * 0.3], 3);
  for (let i = 0; i < 6; i++) { const c = part(g, tube(26, 26, 230 - 40 * (i % 3), 16).rotateZ(Math.PI / 2), M('#efe6d0', '#b8b098'), 2.4, [-500 + i * 250, -300 + 28, 140 + 60 * (i % 2)]); c.rotation.y = r() * 3; }
  part(g, new THREE.TorusGeometry(120, 34, 10, 20, Math.PI), stone[0], 2.6, [450, -300 + 30, -30]); box(g, 60, 40, 70, stone[1], [330, -300 + 20, -30], 2.4, null, 3); box(g, 60, 40, 70, stone[1], [570, -300 + 20, -30], 2.4, null, 3);
  g.userData.weeds = [];
  for (let i = 0; i < 46; i++) { const x = -1200 + r() * 2400, z = -200 + r() * 900, w = G(g, [x, -300, z]), hgt = 70 + r() * 130, cl2 = r() > 0.5 ? '#4f7f3a' : '#6a9a3a';
    for (let k = 0; k < 3; k++) { const b = G(w, [(k - 1) * 14, 0, (r() - 0.5) * 12]); part(b, tubeAlong([V(0, 0, 0), V(8, hgt * 0.5, 0), V(-6, hgt, 0)], t => 8 - 6 * t, { segs: 10 }), M(cl2, '#a0c090'), 1.4); b.userData.ph = r() * 6; g.userData.weeds.push(b); } }
  const bub = makeParticles(36, '#e8fbff'); g.add(bub.mesh); g.userData.bub = bub;
  g.visible = false; return g;
})();
export function uwTick(T) { if (flags.collect) return; uw.userData.weeds.forEach(b => { b.rotation.z = 0.35 * Math.sin(T * 1.3 + b.userData.ph); });
  const P = uw.userData.bub; for (let i = 0; i < 36; i++) { const u = frac(T * 0.22 + i * 0.1618); P.set(i, -900 + (i * 97) % 1800, -300 + u * 1100, -300 + (i * 61) % 900, 5 * Math.sin(Math.PI * u) + 1); } P.commit(); }
/* small rowing boat for the boy and the rabbi (faces +x) */
export const rowboat = (() => { const g = G(GC), hull = toon('#8a5a3a', { tint: '#b08a7a', stripes: 14, regions: [{ below: 22, c: '#2f5d8a', w: 0 }] });
  part(g, hullGeo(460, 70, 190, { bow: 0.6, sheer: 0.3 }), hull, 3.2); for (const x of [-120, 40, 160]) box(g, 18, 8, 150, M('#c08a54', '#b49a84', 0), [x, 70, 0], 1.8, null, 2);
  for (const z of [-84, 84]) box(g, 330, 30, 12, M('#b07a45', '#8a5a3a'), [-5, 92, z], 2, null, 2);
  box(g, 12, 30, 150, M('#b07a45', '#8a5a3a'), [-180, 92, 0], 2, null, 2);
  g.visible = false; return g; })();
