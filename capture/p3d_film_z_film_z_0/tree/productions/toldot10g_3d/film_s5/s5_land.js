/* film_s5 landscape builder (toldot10g look). ASCII only. NO PEOPLE, NO TEXT. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
const { C, hash2, sm, rng, lam, heightMesh, noiseTex, tufts, rocks, bushes, makeHills, makeClouds } = K;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));

export function backdrop(rotY) {
  const g = new THREE.Group();
  g.add(makeHills(lam('#9db483'), lam('#b2c6b4'), lam('#d0dde0')), makeClouds(BASIC('#ffffff')));
  g.rotation.y = rotY || 0; return g;
}

/* a height mesh with two colour sets (k=0 and k=1), blended with set(u) */
export function seasonMesh(x0, x1, z0, z1, nx, nz, hfn, colFn, mat) {
  const m = heightMesh(x0, x1, z0, z1, nx, nz, hfn, (x, y, z, c) => colFn(x, y, z, c, 0), mat);
  const p = m.geometry.attributes.position, a = m.geometry.attributes.color, A = Float32Array.from(a.array), B = new Float32Array(a.array.length), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { colFn(p.getX(i), p.getY(i), p.getZ(i), c, 1); B[i * 3] = c.r; B[i * 3 + 1] = c.g; B[i * 3 + 2] = c.b; }
  let last = -1;
  m.userData.set = u => {
    u = Math.max(0, Math.min(1, u)); if (Math.abs(u - last) < 1e-3) return; last = u;
    const arr = a.array; for (let i = 0; i < arr.length; i++) arr[i] = A[i] + (B[i] - A[i]) * u; a.needsUpdate = true;
  };
  return m;
}

/* o: {seed, hill(x,z), plaza:[cx,cz,r], clear(x,z), trees, treeCols, walls:[[x,z,ry,len]], rocksN, tuftsN, bushesN, bushCol, gold:[c0..c3] green:[..], city:[x,z,scale]} */
export function landscape(o) {
  const grp = new THREE.Group(), hill = o.hill || (() => 0), pl = o.plaza;
  const hfn = (x, z) => {
    let u = 0.45 * Math.sin(x * 0.07 + 0.4) * Math.cos(z * 0.05) + 0.3 * Math.sin(z * 0.11 + x * 0.02 + 1.3);
    if (pl) { const d = Math.hypot(x - pl[0], z - pl[1]); u *= 0.05 + 0.95 * sm((d - pl[2]) / pl[2]); }
    return u + hill(x, z);
  };
  const GC = (o.green || ['#9cc56a', '#86b257', '#a9c46a', '#93bd5e']).map(C), GD = (o.gold || ['#e2c070', '#d6b060', '#ecd08a', '#cfa656']).map(C), RK = C('#c4b078');
  const col = (x, y, z, c, k) => {
    const gi = Math.floor(hash2(Math.floor(x / 3), Math.floor(z / 3)) * 4);
    c.copy(GC[gi]).lerp(GD[gi], k); c.lerp(RK, sm((y - 8) / 4) * 0.5);
    c.multiplyScalar(0.92 + 0.16 * hash2(Math.floor(x * 1.7), Math.floor(z * 1.7)));
  };
  const far = seasonMesh(-300, 300, -300, 120, 200, 140, hfn, col, lam('#ffffff', { vertexColors: true, map: noiseTex(21, 40, 25) })); far.position.y = -0.2; grp.add(far);
  const near = seasonMesh(-60, 60, -45, 60, 200, 175, hfn, col, lam('#ffffff', { vertexColors: true, map: noiseTex(22, 10, 8) })); near.castShadow = true; grp.add(near);
  grp.add(backdrop(0));
  const r = rng(o.seed || 4), tl = [];
  for (let k = 0; k < 1500 && tl.length < (o.trees == null ? 30 : o.trees); k++) {
    const x = (r() - 0.5) * 220, z = -100 + r() * 150; if (o.clear && o.clear(x, z)) continue;
    tl.push([x, hfn(x, z), z, 0.8 + r() * 0.7, r()]);
  }
  const trees = K.plantTrees(tl, o.treeCols || ['#4f8a3a', '#5f9a45', '#3f7a34', '#6aa04a']); grp.add(trees);
  (o.walls || []).forEach(([x, z, ry, l]) => { const w = K.stoneWall(l, 1.3, ry); w.position.set(x, hfn(x, z) - 0.1, z); grp.add(w); });
  if (o.city) { const [cx, cz, sc] = o.city; const city = K.makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 5, midTowers: true, scale: sc }); city.position.set(cx, hfn(cx, cz) - 0.1, cz); grp.add(city); }
  const rr = rng((o.seed || 4) + 3), rt = rng((o.seed || 4) + 5), rb = rng((o.seed || 4) + 7);
  const free = (x, z) => !(o.clear && o.clear(x, z));
  grp.add(rocks(o.rocksN || 70, 2, () => { let x, z, n = 0; do { x = (rr() - 0.5) * 110; z = -30 + rr() * 80; n++; } while (!free(x, z) && n < 20); return [x, hfn(x, z), z]; }, '#b9ae98', 0.25, 0.9));
  grp.add(tufts(o.tuftsN || 1200, 3, () => { let x, z, n = 0; do { x = (rt() - 0.5) * 100; z = -30 + rt() * 80; n++; } while (!free(x, z) && n < 20); return [x, hfn(x, z), z]; }, o.tuftCols || ['#6f9d4a', '#86b257', '#9cc56a', '#b9c46f'], 0.4, 1.0));
  if (o.bushesN) grp.add(bushes(o.bushesN, 6, () => { let x, z, n = 0; do { x = (rb() - 0.5) * 120; z = -40 + rb() * 80; n++; } while (!free(x, z) && n < 20); return [x, hfn(x, z), z]; }, o.bushCol || '#b8a55a', 0.4, 1.0));
  return { grp, hfn, trees, set(k) { far.userData.set(k); near.userData.set(k); } };
}
