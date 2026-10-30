/* film_c: the beach world (terrain, sea, dunes, hills, dressing) + lab props + growing dune + clock + kurkar piece. ASCII only. */
import { THREE, sm, cl, frac, V, D2R, part, ell, tube, tubeAlong, lathe, toon, KT, W, GB, sky } from './c_core.js';
const { M, box, rockGeo, rng, TERR, GD, G, col } = Object.assign({}, W, KT);

export const LAB = { x: 0, z: 1750, y: TERR(0, 1750) };
export const terr = W.makeTerrain(); GB.add(terr);
export const sea = KT.makeSea({ A: 6, L: 300, palette: 'summer', pos: [0, -2, -2000], shore: [-40, 400] }); GB.add(sea.mesh);
export const foams = [0, 4300].map(x => { const f = KT.makeFoamLine({ z0: -10, width: 90, len: 6400 }); f.mesh.position.x = x; GB.add(f.mesh); return f; });
GB.add(KT.makeHills({ a0: 0.12 * Math.PI, a1: 0.88 * Math.PI, dists: [7600, 9800, 12500], base: '#7fb85a', haze: '#d4e9f2', h: 1100, n: 8 }));
for (let i = 0; i < 4; i++) { const c = KT.makeCloud(i + 41, { s: 3 + i * 0.3 }); c.position.set(-3500 + i * 2800, 1500 + (i % 2) * 400, -5200 - i * 400); GB.add(c); }
for (let i = 0; i < 3; i++) { const c = KT.makeCloud(i + 61, { s: 3.4 }); c.position.set(-2500 + i * 3000, 1800, 5200); GB.add(c); }
export const birds = KT.makeBirds({ n: 5, r: 700, y: 700, seed: 7 }); birds.position.set(-400, 0, -600); GB.add(birds);

/* ripples + wind-blown sand */
export const rip1 = W.makeRipples({ x0: -1800, x1: 1800, z0: 200, z1: 1150, n: 60, h: TERR, seed: 5 }); GB.add(rip1);
export const rip2 = W.makeRipples({ x0: 2600, x1: 6200, z0: 160, z1: 1500, n: 70, h: TERR, seed: 9 }); GB.add(rip2);
export const blow1 = W.makeBlow({ n: 90, x0: -2200, x1: 2200, z0: 150, z1: 700, len: 900, life: 5, seed: 3, size: 2.6, hgt: 55, h: TERR }); GB.add(blow1.mesh);
export const blow2 = W.makeBlow({ n: 220, x0: 3500, x1: 5100, z0: 80, z1: 330, len: 700, life: 3.6, seed: 4, size: 3.6, hgt: 190, h: TERR }); GB.add(blow2.mesh);

/* dressing */
{
  const r = rng(77), add = (o, x, z, dy) => { o.position.set(x, TERR(x, z) + (dy || 0), z); GB.add(o); return o; };
  const areas = [[-2800, 2600, 160, 1100, 46], [3000, 6400, 160, 1500, 40]];
  for (const [xa, xb, za, zb, n] of areas) for (let i = 0; i < n; i++) {
    const x = xa + r() * (xb - xa), z = za + r() * (zb - za);
    if (Math.abs(x) < 130 && z > 380 && z < 2000) continue;
    if (i % 3 === 0) add(KT.makeGrassTuft(i + 200, { col: '#9cae5c', h: 55 + r() * 30, n: 9 }), x, z);
    else if (i % 3 === 1) { const s = KT.makeShell(i % 2 ? 'fan' : 'spiral', i + 3); s.scale.setScalar(0.9 + r() * 0.6); add(s, x, Math.min(z, 520), 2); }
    else { const s = KT.makeStone(i + 40, 0.5 + r() * 0.9); add(s, x, Math.min(z, 700)); }
  }
  for (let i = 0; i < 34; i++) { const x = -3800 + r() * 7600, z = 1250 + r() * 1800; if (Math.abs(x) < 280 && z < 2100) continue; add(KT.makeBush(i + 300, { col: i % 3 ? '#6aa84f' : '#7fb85a', s: 0.8 + r() * 0.7 }), x, z); }
  for (const [kind, x, z, s] of [['palm', -1350, 1500, 0.9], ['palm', 1150, 1650, 1.0], ['palm', -1800, 1250, 0.8], ['pine', -1900, 2150, 1.4], ['tamarisk', 1900, 1750, 1.1],
    ['palm', 1650, 1400, 0.9], ['pine', 700, 3000, 1.5], ['tamarisk', -700, 2800, 1.2], ['tamarisk', -2400, 1500, 1.0], ['palm', 2500, 1300, 0.9]]) add(KT.makeTree(kind, Math.floor(x + z), s), x, z);
  // white limestone outcrops on the hills
  const lm = M('#efece0', '#c9c4b2');
  for (let i = 0; i < 30; i++) { const x = -3400 + r() * 6200, z = 1900 + r() * 1900; if (Math.abs(x) < 900 && z < 3300 && z > 1200) continue; const s = 0.9 + r() * 1.8;
    const g = part(GB, rockGeo(70 * s, 38 * s, 55 * s, i + 500, 0.18), lm, 3.4, [x, TERR(x, z) + 8 * s, z]); g.rotation.y = r() * 6; }
}

/* the dune that grows (and later carries grass) */
const gdBump = (x, z, k) => { const rx = 560 + 380 * k, rz = 330 + 230 * k, h = 14 + 200 * k; let dx = (x - GD.x) / rx, dz = (z - GD.z) / rz; if (dz > 0) dz *= 1.45; const q = dx * dx + dz * dz; return q >= 1 ? 0 : h * (1 - q) * (1 - q); };
export const gdH = (x, z, k) => TERR(x, z) + gdBump(x, z, k);
export const dune = (() => {
  const nx = 90, nz = 70, x0 = GD.x - 960, x1 = GD.x + 960, z0 = GD.z - 570, z1 = GD.z + 400;
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz).rotateX(-Math.PI / 2), p = geo.attributes.position;
  const mat = toon('#f3dc9e', { tint: '#dcc08a', hi: 0 }); mat.polygonOffset = true; mat.polygonOffsetFactor = -3; mat.polygonOffsetUnits = -3;
  let curK = 0;
  const mesh = new THREE.Mesh(geo, mat); GB.add(mesh);
  const rip = W.makeRipples({ x0: GD.x - 700, x1: GD.x + 600, z0: GD.z - 420, z1: GD.z + 260, n: 46, h: (x, z) => gdH(x, z, curK), seed: 12, col: '#d4b06a' }); GB.add(rip);
  const api = { mesh, rip, k: -1 };
  // geometry positions are absolute after the first set (PlaneGeometry is centred at the origin) -> store the centre once
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, base = Float32Array.from(p.array);
  api.set = k => { if (Math.abs(k - api.k) < 0.002) return; api.k = k; curK = k;
    for (let i = 0; i < p.count; i++) { const x = base[3 * i] + cx, z = base[3 * i + 2] + cz; p.setXYZ(i, x, gdH(x, z, k) + 0.8, z); }
    p.needsUpdate = true; geo.computeVertexNormals(); rip.userData.refill(); };
  return api;
})();
/* grass tufts on the old dune (c4) with materials we can recolour */
export const tufts = (() => {
  const r = rng(91), list = [], mats = [];
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = r() * 0.8, x = GD.x - 120 + Math.cos(a) * 520 * d, z = GD.z + 20 + Math.sin(a) * 300 * d;
    const t = KT.makeGrassTuft(i + 700, { col: '#7fb85a', h: 70 + r() * 30, n: 9 }); t.position.set(x, gdH(x, z, 1), z); t.userData.s = 0.6 + r() * 0.6; t.userData.ph = r() * 6.28; GB.add(t); list.push(t);
    t.traverse(o => { if (o.material && o.material.uniforms && o.material.uniforms.uColor && !mats.includes(o.material)) mats.push(o.material); }); }
  return { list, mats, set(g, grow, dry) { list.forEach(t => { t.visible = g; const s = Math.max(0.05, grow * t.userData.s); t.scale.set(s * 0.9, s, s * 0.9); });
    const c = col('#7fb85a').lerp(col('#cdbd6a'), dry); mats.forEach(m => m.uniforms.uColor.value.copy(c)); } };
})();

/* the clock (faces +z) */
export const clock = (() => {
  const g = G(GB), face = M('#fff8e4', '#e6dcc0', 0), rim = M('#c8742e', '#a86a40');
  part(g, new THREE.CylinderGeometry(150, 150, 22, 40).rotateX(Math.PI / 2), face, 3.4);
  part(g, new THREE.TorusGeometry(150, 12, 12, 48), rim, 3);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; part(g, new THREE.BoxGeometry(i % 3 ? 7 : 11, i % 3 ? 22 : 32, 6), M('#2b2626', '#2b2626', 0), 0, [Math.sin(a) * 120, Math.cos(a) * 120, 14], [0, 0, -a]); }
  const hh = G(g, [0, 0, 18]), mh = G(g, [0, 0, 24]);
  part(hh, new THREE.BoxGeometry(14, 80, 6).translate(0, 30, 0), M('#2b2626', '#2b2626', 0), 0); part(mh, new THREE.BoxGeometry(9, 118, 6).translate(0, 44, 0), M('#d9402e', '#d9402e', 0), 0);
  part(g, ell(14, 14, 10, 12, 8), M('#2b2626', '#2b2626', 0), 0, [0, 0, 28]);
  g.userData.set = (hours) => { hh.rotation.z = -hours / 12 * Math.PI * 2; mh.rotation.z = -hours * Math.PI * 2; };
  g.visible = false; return g;
})();

/* ---- lab: limestone, quartz, slab ---- */
export const lab = (() => {
  const g = G(GB, [LAB.x, LAB.y, LAB.z]);
  part(g, rockGeo(340, 38, 120, 33, 0.1), M('#b9ae9c', '#9c93a6'), 4, [0, 6, 0]);
  part(g, rockGeo(120, 40, 100, 71, 0.2), M('#a89d8c', '#9c93a6'), 3, [-360, 8, 60]); part(g, rockGeo(100, 34, 90, 72, 0.2), M('#a89d8c', '#9c93a6'), 3, [330, 6, 80]);
  // limestone: chalky white lump with pores
  const lime = G(g, [-120, 40, 0]);
  part(lime, rockGeo(78, 52, 66, 12, 0.2), M('#f6f3ea', '#cfc9b6', 0), 3.6, [0, 36, 0]);
  const rr = rng(8); for (let i = 0; i < 16; i++) { const a = rr() * 6.28, b = (rr() - 0.2) * 1.8, rx = 78, ry = 52; part(lime, ell(5.5, 3.5, 3, 8, 6), M('#b7ae9a', '#b7ae9a', 0), 0, [Math.cos(a) * Math.cos(b) * rx * 0.97, 36 + Math.sin(b) * ry * 0.95, Math.sin(a) * Math.cos(b) * 66 * 0.97]); }
  part(lime, rockGeo(34, 22, 30, 15, 0.2), M('#f0ede2', '#cfc9b6', 0), 3, [74, 14, 24]);
  // quartz: hexagonal prisms with a pointed top, glassy
  const q = G(g, [120, 28, 0]), qm = toon('#f1ebff', { tint: '#a9bdf0', hi: 1 }), qm2 = toon('#fff4fb', { tint: '#b9c2f6', hi: 1 });
  [[0, 0, 1, 0], [58, 10, 0.72, 0.35], [-52, 14, 0.62, -0.4], [22, -50, 0.5, 0.15]].forEach(([x, z, s, tl], i) => {
    const c = G(q, [x, 6, z]); c.rotation.z = -tl;
    part(c, new THREE.CylinderGeometry(30 * s, 34 * s, 130 * s, 6).translate(0, 65 * s, 0), i % 2 ? qm2 : qm, 3.4);
    part(c, new THREE.CylinderGeometry(1, 30 * s, 40 * s, 6).translate(0, 150 * s, 0), i % 2 ? qm2 : qm, 3.4);
    part(c, new THREE.BoxGeometry(5, 100 * s, 3).translate(-18 * s, 70 * s, 28 * s), M('#ffffff', '#ffffff', 0), 0);
  });
  g.userData.lime = lime; g.userData.quartz = q;
  g.userData.sparks = [0, 1, 2, 3, 4, 5].map(() => { const s = W.makeSparkle(16); g.add(s); return s; });
  return g;
})();
/* sparkle stars around world point (x,y,z) with phase t */
export function sparkle(group, cx, cy, cz, t, amt, scale) {
  const sp = group.userData.sparks;
  sp.forEach((s, i) => { const ph = frac(t * 0.9 + i / sp.length), on = Math.sin(Math.PI * ph) * amt;
    s.position.set(cx - group.position.x + 70 * Math.cos(i * 2.4 + 1) * (scale || 1), cy - group.position.y + 60 * Math.sin(i * 1.7 + 0.5) * (scale || 1) + 30, cz - group.position.z + 30 + 20 * Math.sin(i)); s.scale.setScalar(Math.max(0.001, on * (scale || 1)) * (0.8 + 0.5 * Math.sin(i * 3.1)));
    s.rotation.z = ph * 1.5; s.visible = amt > 0.01; });
}

/* a small sand pile the boy scoops from */
export const mound = (() => { const g = G(GB); part(g, ell(110, 70, 100, 28, 16), M('#f3dc9e', '#dcc08a', 0), 3.2, [0, 0, 0]);
  for (let i = 0; i < 12; i++) part(g, ell(5, 3, 4, 8, 6), M('#e6c88a', '#e6c88a', 0), 0, [Math.cos(i * 2.1) * 70, 50 + Math.sin(i) * 14, Math.sin(i * 2.1) * 60]); return g; })();
/* hand-held kurkar piece */
export const kurkarPiece = (() => {
  const g = G(), m = toon('#dba76c', { tint: '#b98a68', hi: 0, regions: [{ below: 4, c: '#c98a55', x0: 0, xHalf: 1e4 }, { below: -10, c: '#b5653d', x0: 0, xHalf: 1e4 }] });
  part(g, rockGeo(30, 20, 24, 21, 0.14), m, 2.4);
  for (let i = 0; i < 7; i++) part(g, ell(3.2, 2.6, 2, 8, 6), M('#8a5a3a', '#8a5a3a', 0), 0, [Math.cos(i * 2.2) * 25, Math.sin(i * 1.3) * 12, Math.sin(i * 2.2) * 19]);
  g.visible = false; return g;
})();

/* props held by the rabbi in c3 */
export const heldLime = (() => { const g = G(GB); part(g, rockGeo(30, 22, 26, 12, 0.2), M('#f6f3ea', '#cfc9b6', 0), 2.6);
  for (let i = 0; i < 9; i++) part(g, ell(3, 2, 2, 8, 6), M('#b7ae9a', '#b7ae9a', 0), 0, [Math.cos(i * 2.3) * 24, 4 + Math.sin(i * 1.7) * 12, Math.sin(i * 2.3) * 20]); g.visible = false; return g; })();
export const heldQuartz = (() => { const g = G(GB), q = toon('#f1ebff', { tint: '#a9bdf0', hi: 1 });
  [[0, 0, 1, 0], [20, 5, 0.65, 0.4], [-18, 6, 0.55, -0.4]].forEach(([x, z, s, tl]) => { const c = G(g, [x, 0, z]); c.rotation.z = -tl;
    part(c, new THREE.CylinderGeometry(9 * s, 11 * s, 40 * s, 6).translate(0, 20 * s, 0), q, 2.2); part(c, new THREE.CylinderGeometry(0.5, 9 * s, 13 * s, 6).translate(0, 46 * s, 0), q, 2.2); });
  g.scale.setScalar(1.5); g.visible = false; return g; })();
