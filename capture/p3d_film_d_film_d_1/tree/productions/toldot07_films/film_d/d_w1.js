/* film_d worlds 1: beach (GA), harbour with a growing breakwater (GH), long breakwater (GL), shared ships. ASCII only. */
import { THREE, sm, cl, frac, V, part, ell, tube, tubeAlong, lathe, toon, KT, M, box, rockGeo, rng, G, col, GA, GH, GL, hullGeo, makeParticles, lerp, ease, flags } from './d_core.js';

/* ---------------------------------------------------------------- growing breakwater */
export function growWall(parent, pts, o) {
  o = Object.assign({ w: 150, h: 70, seed: 61, step: 38, topW: 120, sc: 1, lighthouse: true }, o || {});
  const g = G(parent), r = rng(o.seed), curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => V(x, 0, z))), L = curve.getLength(), n = Math.floor(L / o.step), items = [];
  const mats = [M('#a9a39a', '#b9b0c4'), M('#bdb5a8', '#b9b0c4'), M('#948e86', '#b9b0c4')], slabM = M('#cfcac2', '#b9b0c4', 0), stripe = M('#e8c040', '#c9a080', 0);
  const add = (mesh, u, y0, k) => { mesh.userData.u = u; mesh.userData.y0 = y0; mesh.userData.k = k || 1; items.push(mesh); return mesh; };
  const sc = o.sc;
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = curve.getPointAt(u), tg = curve.getTangentAt(u), nx = V(-tg.z, 0, tg.x), yaw = Math.atan2(tg.x, tg.z);
    for (const side of [-1, 1]) {
      const q = p.clone().addScaledVector(nx, side * o.w * 0.42 * sc), y = (18 + r() * 14) * sc;
      add(part(g, rockGeo((34 + r() * 18) * sc, (30 + r() * 14) * sc, (30 + r() * 16) * sc, i * 7 + side + 3), mats[Math.floor(r() * 3)], 2.6, [q.x + (r() - 0.5) * 14, y, q.z + (r() - 0.5) * 14]), u, y);
    }
    if (i % 2 === 0) { const y = o.h * 0.42; add(part(g, rockGeo(30 * sc, 24 * sc, 28 * sc, i + 500), mats[1], 2.4, [p.x, y, p.z]), u, y); }
    const sy = o.h + 4; const slab = box(g, o.topW * sc, 14, o.step * 1.18, i % 6 === 0 ? stripe : slabM, [p.x, sy, p.z], 1.8, [0, yaw, 0], 2); add(slab, u, sy);
  }
  let lh = null;
  if (o.lighthouse) { const tip = curve.getPointAt(1); lh = G(g, [tip.x, o.h, tip.z]);
    part(lh, lathe([[0.01, 0], [34, 0], [30, 60], [26, 150], [30, 154], [30, 162], [0.01, 162]], 28), toon('#ffffff', { tint: '#c9c6d8', regions: [{ p: [0, 30, 0], r: [80, 18, 80], c: '#d9534f', w: 0 }, { p: [0, 100, 0], r: [80, 18, 80], c: '#d9534f', w: 0 }] }), 2.6);
    part(lh, tube(18, 18, 26, 16).translate(0, 190, 0), M('#fff6c8', '#e0d0a0', 0), 2, [0, 0, 0]); part(lh, lathe([[0.01, 0], [24, 0], [0.01, 22]], 16), M('#d9534f', '#b08a9a'), 2, [0, 190, 0]); }
  const api = { g, curve, L, items, lh, n,
    at: (u, off, nrm) => { const p = curve.getPointAt(cl(u, 0, 1)), tg = curve.getTangentAt(cl(u, 0, 1)), n2 = V(-tg.z, 0, tg.x); p.addScaledVector(n2, nrm || 0); p.y = (off == null ? o.h + 11 : off); return p; },
    tg: u => curve.getTangentAt(cl(u, 0, 1)),
    /* prog 0..1 = how far the wall is built; fall = length (in u) over which a fresh rock drops from the barge */
    set(prog, fall) {
      const f = fall || 0.02;
      for (const m of items) { const u = m.userData.u, vis = u <= prog; m.visible = vis; if (!vis) continue; const a = cl((prog - u) / f, 0, 1), e = 1 - (1 - a) * (1 - a);
        m.position.y = m.userData.y0 + (1 - e) * 360; m.scale.setScalar(0.4 + 0.6 * e); }
      if (lh) lh.visible = prog >= 0.999;
    } };
  return api;
}

/* ---------------------------------------------------------------- the ships (one instance each, re-parented per shot) */
export const SHIP = KT.makeContainerShip({ len: 1700 });
export const TUG = KT.makeTugboat();
export function place(o, parent) { parent.add(o); o.visible = true; return o; }

/* ---------------------------------------------------------------- A: beach */
export const beachY = (x, z) => z < 0 ? -20 : Math.min(z * 0.03, 30) + 18 * Math.sin(x * 0.004) * Math.sin(z * 0.006) * sm(z / 600);
export const beach = KT.makeBeach({ season: 'summer' }); GA.add(beach.root);
export const beachSea = beach.sea;
{
  const r = rng(515);
  for (let i = 0; i < 44; i++) { const t = KT.makeGrassTuft(i + 600, { col: i % 3 ? '#9cae5c' : '#7fb85a', h: 45 + r() * 30, n: 9 }); { const x = -1600 + r() * 3200, z = 180 + r() * 800; t.position.set(x, beachY(x, z), z); } GA.add(t); }
  for (let i = 0; i < 14; i++) { const b = KT.makeBush(i + 650, { col: '#6aa84f', s: 0.8 + r() * 0.6 }); { const x = -2600 + r() * 5200, z = 900 + r() * 700; b.position.set(x, beachY(x, z), z); } GA.add(b); }
  for (const [k, x, z, s] of [['palm', -1200, 1100, 1.0], ['palm', 1300, 1250, 1.1], ['tamarisk', -400, 1400, 1.2], ['palm', 400, 1500, 0.9], ['pine', 2300, 1500, 1.3], ['palm', -2200, 1200, 1.0]]) { const t = KT.makeTree(k, Math.floor(x + z), s); t.position.set(x, beachY(x, z), z); GA.add(t); }
  const wood = M('#9a6a3e', '#7a5a3a', 0);        // driftwood and a dinghy resting on the sand
  for (const [x, z, a] of [[-620, 260, 0.3], [690, 330, -0.5]]) { const d = part(GA, tubeAlong([V(-70, 0, 0), V(0, 9, 8), V(80, 3, -5)], 9, { segs: 10 }), wood, 2); d.position.set(x, beachY(x, z) + 6, z); d.rotation.y = a; }
  const dg = G(GA, [-1120, beachY(-1120, 420), 420]); dg.rotation.y = 0.5; part(dg, ell(120, 34, 52, 24, 12), M('#c0392b', '#a06a5a'), 2.6, [0, 16, 0]); part(dg, ell(108, 10, 44, 24, 8), M('#e8c68a', '#c9a67a'), 0, [0, 40, 0]);
  for (const [x, z, s] of [[-370, 330, 1.3], [-250, 350, 1.0], [-130, 340, 1.4], [-430, 290, 1.1], [-60, 380, 1.0]]) { const t = KT.makeGrassTuft(Math.floor(x + z), { col: '#8fb25a', h: 62 * s, n: 10 }); t.position.set(x, beachY(x, z), z); GA.add(t); }
  const seaB = KT.makeBirds({ n: 6, r: 800, y: 520, seed: 7 }); seaB.position.set(-300, 0, -700); GA.add(seaB); GA.userData.birds = seaB;
  for (let i = 0; i < 5; i++) { const c = KT.makeCloud(i + 41, { s: 3 + i * 0.3 }); c.position.set(-4200 + i * 2300, 1500 + (i % 2) * 400, -5200 - i * 300); GA.add(c); }
  GA.add(KT.makeHills({ a0: 0.2 * Math.PI, a1: 0.8 * Math.PI, dists: [7000, 9500], base: '#7fb85a', haze: '#d4e9f2', h: 900, n: 7 }));
}
export function beachTick(T, A, foam) { if (flags.collect) return; beachSea.update(T, A); beach.foam.update(T, foam == null ? 0.8 : foam); GA.userData.birds.userData.update(T); }

/* ---------------------------------------------------------------- H: harbour + growing wall + dressing */
export const harbour = KT.makeHarbour({ A: 12 }); GH.add(harbour.root); harbour.breakwater.visible = false;
export const hsea = harbour.sea;
export const BWP = [[-1000, 640], [-1020, 100], [-900, -260], [-500, -330], [0, -320], [380, -280]];
export const wall = growWall(GH, BWP);
{
  const r = rng(808), q = 55, crate = [M('#b07a45', '#8a5a3a'), M('#c89a5a', '#9a7a5a'), M('#8a5a3a', '#6a4a3a')];
  for (let i = 0; i < 26; i++) { let x = -900 + r() * 1800; if (x > -1350 && x < -420) x += 1000; const z = 790 + r() * 200, s = 34 + r() * 26; box(GH, s, s, s, crate[i % 3], [x, q + s / 2, z], 2, [0, r() * 3, 0], 3); if (i % 4 === 0) box(GH, s * 0.8, s * 0.8, s * 0.8, crate[(i + 1) % 3], [x + 6, q + s * 1.4, z], 2, [0, r(), 0], 3); }
  for (let i = 0; i < 8; i++) { let x = -1000 + i * 260 + r() * 80; if (x > -1350 && x < -420) x += 1000; const z = 800 + r() * 100; part(GH, lathe([[0.01, 0], [22, 0], [26, 20], [26, 50], [22, 62], [0.01, 62]], 14), M('#7a4a2a', '#5a3a2a'), 1.8, [x, q, z]); }
  for (let i = 0; i < 10; i++) { const x = -1100 + i * 230 + r() * 90, z = 640 + r() * 30; const rope = part(GH, new THREE.TorusGeometry(24, 6, 8, 20).rotateX(Math.PI / 2), M('#c9a46a', '#a08060', 0), 1.2, [x, q + 7, z]); }
  for (let i = 0; i < 9; i++) { const x = -1300 + r() * 2600, z = 650 + r() * 200; const pd = new THREE.Mesh(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col('#9fd0e8') })); pd.scale.set(40 + r() * 50, 1, 22 + r() * 24); pd.position.set(x, q + 0.8, z); GH.add(pd); }
  for (let i = 0; i < 7; i++) { const x = -1200 + i * 380, z = 640; part(GH, tube(5, 4, 170, 10).translate(0, 170, 0), M('#3b3532', '#5a5a6a'), 1.6, [x, q, z]); part(GH, ell(16, 10, 16, 12, 8), M('#fff0b0', '#fff0b0', 0), 1.4, [x, q + 176, z]); }
  GH.add(KT.makeHills({ a0: 0.2 * Math.PI, a1: 0.8 * Math.PI, dists: [7000, 9500], base: '#7fb85a', haze: '#d4e9f2', h: 900, n: 7, }));
  for (let i = 0; i < 5; i++) { const c = KT.makeCloud(i + 141, { s: 3 + i * 0.3 }); c.position.set(-4200 + i * 2300, 1500 + (i % 2) * 400, -5200 - i * 300); GH.add(c); }
  GH.userData.birds = KT.makeBirds({ n: 5, r: 700, y: 560, seed: 17 }); GH.userData.birds.position.set(0, 0, -300); GH.add(GH.userData.birds);
  GH.userData.lights = [];
  for (let i = 0; i < 7; i++) { const l = part(GH, ell(16, 12, 16, 10, 8), M('#ffd070', '#ffd070', 0), 0, [-1200 + i * 380, q + 176, 640]); GH.userData.lights.push(l); }
}
export function harbourTick(T, A, calmK) { if (flags.collect) return; hsea.update(T, A); if (calmK != null) hsea.setCalm(-250, 160, 700, 420, calmK); harbour.update(T); GH.userData.birds.userData.update(T); }

/* ---------------------------------------------------------------- L: long breakwater (kilometres) */
export const LSEA = KT.makeSea({ A: 26, L: 380, palette: 'harbour', pos: [3000, -4, -1700] }); GL.add(LSEA.mesh);
LSEA.setCalm(3000, 250, 3800, 520, 0.12);
export const LWP = [[-300, -300], [1500, -300], [3200, -300], [5000, -300], [6800, -300]];
export const lwall = growWall(GL, LWP, { step: 64, sc: 1.55, topW: 110, seed: 33 });
{
  box(GL, 7600, 70, 1500, M('#cfcac2', '#b9b0c4', 0), [3100, 20, 1500], 3, null, 4);   // land / quay behind
  box(GL, 900, 70, 2400, M('#cfcac2', '#b9b0c4', 0), [-700, 20, 600], 3, null, 4);
  box(GL, 7600, 12, 30, M('#2b2b30', '#555', 0), [3100, 57, 770], 0, null, 2);
  const r = rng(909);
  for (let i = 0; i < 30; i++) { const x = -300 + r() * 6400, z = 840 + r() * 500, s = 80 + r() * 90; box(GL, s * 1.3, s, s, M(['#efe2c2', '#e8d6ab', '#f3ead6'][i % 3], '#c9b08c'), [x, 55 + s / 2, z], 3, null, 6); }
  GL.add(KT.makeHills({ a0: 0.15 * Math.PI, a1: 0.85 * Math.PI, dists: [9000, 12000], base: '#7fb85a', haze: '#d4e9f2', h: 1100, n: 8 }));
  for (let i = 0; i < 5; i++) { const c = KT.makeCloud(i + 241, { s: 3.2 }); c.position.set(-3000 + i * 2400, 1600 + (i % 2) * 400, -6000 - i * 200); GL.add(c); }
  GL.userData.birds = KT.makeBirds({ n: 5, r: 900, y: 800, seed: 27 }); GL.userData.birds.position.set(1500, 0, -500); GL.add(GL.userData.birds);
}
export function lwTick(T, A) { if (flags.collect) return; LSEA.update(T, A); GL.userData.birds.userData.update(T); }
