/* film_z: the beach world (terrain, sea, dunes, hills, dressing) + lab props + growing dune + clock + kurkar piece. ASCII only. */
import { THREE, sm, cl, frac, V, D2R, part, ell, tube, tubeAlong, lathe, toon, KT, W, GB, sky } from './z_core.js';
const { M, box, rockGeo, rng, TERR, GD, G, col } = Object.assign({}, W, KT);

export const LAB = { x: 0, z: 1750, y: TERR(0, 1750) };
export const terr = W.makeTerrain(); GB.add(terr);
export const sea = KT.makeSea({ A: 6, L: 300, palette: 'summer', pos: [0, -2, -2000], shore: [-40, 400] }); GB.add(sea.mesh);
export const foams = [0, 4300].map(x => { const f = KT.makeFoamLine({ z0: -10, width: 90, len: 6400 }); f.mesh.position.x = x; GB.add(f.mesh); return f; });
GB.add(KT.makeHills({ a0: 0.12 * Math.PI, a1: 0.88 * Math.PI, dists: [7600, 9800, 12500], base: '#7fb85a', haze: '#d4e9f2', h: 1100, n: 8 }));
for (let i = 0; i < 4; i++) { const c = KT.makeCloud(i + 41, { s: 3 + i * 0.3 }); c.position.set(-3500 + i * 2800, 2100 + (i % 2) * 400, -5200 - i * 400); GB.add(c); }
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


/* film_z extras: sunset-palette sea (toggle with the summer sea) */
export const seaS = KT.makeSea({ A: 5, L: 300, palette: 'sunset', pos: [0, -2, -2000], shore: [-40, 400] }); GB.add(seaS.mesh);
