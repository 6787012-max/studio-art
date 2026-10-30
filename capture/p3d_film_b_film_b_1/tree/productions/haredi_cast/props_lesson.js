/* haredi cast - lesson props in the same toon style as the people (toon3d: one shadow tone, inverted-hull ink outlines).
   Units = 2D body units (the man is ~300 tall), ground y = 0, front faces +x.
   Every maker returns { root: THREE.Group, name } - place with root.position / root.rotation.y.
     makeShtender()      slanted standing lectern
     makeGemara(open)    open volume: two pages with grey line strokes (no letters), brown leather cover
     makeTableSefarim()  table with a stack of sefarim (coloured spines, plain gold bands, no letters)
     makeBench()         synagogue bench with backrest
     makeAron()          simple aron kodesh: wooden cabinet, crown moulding, curtain with a plain border (no letters, no figures)
     makeCandlesticks()  pair of silver candlesticks with lit candles
     makeStoneHouse()    Jerusalem-stone village house: stone blocks, arched window, door, small dome
   PROPS = { shtender, gemara, table, bench, aron, candles, house } -> same makers by short name. */
import { THREE, toon, part, ell, tube, lathe, tubeAlong, V, RoundedBoxGeometry } from '../../lib/toon3d/toon3d.js';

const box = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 2, r == null ? Math.min(w, h, d) * 0.12 : r);
const M = (hex, tint, hi) => toon(hex, { tint: tint || '#b9a8a0', hi: hi == null ? undefined : hi });
const WOOD = () => M('#a8703e', '#c49a84'), WOOD_D = () => M('#7e4f2a', '#b08a7a'), PAGE = () => M('#f6efdc', '#d6cbb8', 0), LINE = () => M('#8d8a86', '#8d8a86', 0);
const G = name => { const root = new THREE.Group(); return { root, name }; };

// grey text-like strokes on a page lying in the x-z plane (top face at y), lines run along z
function pageLines(parent, x0, x1, y, z0, z1, mat, n) {
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / n, len = (z1 - z0) * (i % 4 === 3 ? 0.62 : 0.94);
    part(parent, box(1.1, 0.5, len, 0.2), mat, 0, [x, y, (z0 + z1) / 2 - ((z1 - z0) - len) / 2]);
  }
}

export function makeGemara() {
  const c = G('gemara'), cover = M('#6a3a26', '#b08a7a'), pg = PAGE(), ln = LINE();
  // cover (two boards, slightly tilted like an open book), page blocks, lines
  for (const s of [-1, 1]) {
    const half = new THREE.Group(); half.rotation.x = -s * 0.1; c.root.add(half);
    part(half, box(34, 1.6, 26, 0.7), cover, 1.2, [0, 0.8, s * 13.6]);
    part(half, box(31, 3.4, 23, 1.2), pg, 1.0, [0, 3.2, s * 12.6]);
    pageLines(half, -13, 13, 5.0, s > 0 ? 3 : -22, s > 0 ? 22 : -3, ln, 11);
  }
  part(c.root, tube(1.6, 1.6, 34, 8).rotateZ(Math.PI / 2).translate(17, 3.4, 0), pg, 0);   // centre fold
  return c;
}

export function makeShtender() {
  const c = G('shtender'), w = WOOD(), wd = WOOD_D();
  part(c.root, box(46, 8, 40, 2), wd, 2.0, [0, 4, 0]);                       // foot
  part(c.root, box(30, 120, 28, 3), w, 2.4, [-2, 66, 0]);                   // column / cabinet
  part(c.root, box(20, 2, 22, 0.8), wd, 1.2, [13.2, 70, 0]);                // shelf line
  const top = new THREE.Group(); top.position.set(0, 132, 0); top.rotation.z = -0.32; c.root.add(top);
  part(top, box(46, 4, 48, 1.5), w, 2.2, [0, 0, 0]);                        // slanted desk
  part(top, box(3, 5, 48, 1), wd, 1.4, [22, 3, 0]);                         // book stop lip
  const g = makeGemara(); g.root.scale.setScalar(0.85); g.root.position.set(0, 2, 0); top.add(g.root);
  return c;
}

export function makeTableSefarim() {
  const c = G('table'), w = WOOD(), wd = WOOD_D();
  part(c.root, box(90, 6, 150, 2), w, 2.4, [0, 96, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(c.root, box(7, 93, 7, 2), wd, 2.0, [sx * 38, 47, sz * 66]);
  part(c.root, box(78, 8, 4, 1.5), wd, 1.4, [0, 88, -70]); part(c.root, box(78, 8, 4, 1.5), wd, 1.4, [0, 88, 70]);
  // stack of sefarim (spines face +x), plain gold bands
  const cols = ['#5b2a2a', '#20354f', '#3d2a1e', '#2d4a35', '#5b2a2a'], gold = M('#d6b25a', '#b89a70', 0), pg = PAGE();
  let y = 99;
  cols.forEach((col, i) => {
    const h = 7 + (i % 2) * 2, wv = 40 - i * 3, dv = 52 - i * 4, rot = (i % 2 ? 0.12 : -0.08);
    const b = new THREE.Group(); b.position.set(-4 + (i % 2) * 3, y + h / 2, 30); b.rotation.y = rot; c.root.add(b);
    part(b, box(wv, h, dv, 1.2), M(col, '#b49aa8'), 1.4);
    part(b, box(wv - 3, h - 2.2, dv - 1, 0.6), pg, 0, [-1.8, 0, 0]);
    for (const zz of [-dv * 0.3, dv * 0.3]) part(b, box(0.8, h * 0.7, 2.2, 0.3), gold, 0, [wv / 2 + 0.2, 0, zz]);
    y += h;
  });
  const g = makeGemara(); g.root.position.set(4, 99, -34); g.root.rotation.y = 0.15; c.root.add(g.root);
  return c;
}

export function makeBench() {
  const c = G('bench'), w = WOOD(), wd = WOOD_D();
  part(c.root, box(34, 5, 170, 1.5), w, 2.2, [0, 52, 0]);                    // seat
  part(c.root, box(5, 44, 170, 1.5), w, 2.2, [-18, 82, 0]);                  // backrest
  part(c.root, box(4, 4, 164, 1), wd, 1.2, [-18, 104, 0]);
  for (const sz of [-1, 0, 1]) { part(c.root, box(30, 50, 5, 1.5), wd, 2.0, [0, 25, sz * 78]); part(c.root, box(5, 104, 5, 1.5), wd, 1.6, [-18, 52, sz * 78]); }
  return c;
}

export function makeAron() {
  const c = G('aron'); c.root.scale.set(1.15, 0.9, 1.15); const _u = 0, w = WOOD(), wd = WOOD_D(), gold = M('#d9b860', '#b89a70', 0), cloth = M('#6b2233', '#b08a9a'), border = M('#d9b860', '#b89a70', 0);
  part(c.root, box(30, 14, 150, 2), wd, 2.2, [0, 7, 0]);                     // step
  part(c.root, box(26, 10, 140, 2), wd, 2.0, [-4, 19, 0]);
  part(c.root, box(40, 230, 150, 3), w, 2.6, [-12, 139, 0]);                // cabinet
  part(c.root, box(48, 14, 164, 3), wd, 2.4, [-10, 260, 0]);               // crown moulding
  part(c.root, box(42, 8, 156, 2), w, 2.0, [-10, 271, 0]);
  // arched top piece (plain, no symbols)
  part(c.root, new THREE.CylinderGeometry(46, 46, 10, 48).rotateZ(Math.PI / 2), w, 2.2, [-12, 266, 0]);   // plain arched top
  // curtain: wavy cloth in front of the doors, plain gold border
  const cg = new THREE.PlaneGeometry(126, 190, 40, 8); { const P = cg.attributes.position; for (let i = 0; i < P.count; i++) P.setZ(i, 1.2 * Math.sin(P.getX(i) * 0.16)); cg.computeVertexNormals(); }
  cg.rotateY(Math.PI / 2); part(c.root, cg, cloth, 0, [9.5, 140, 0]);
  part(c.root, box(2.4, 6, 126, 1), border, 0.8, [11, 232, 0]); part(c.root, box(2.4, 6, 126, 1), border, 0.8, [11, 48, 0]);
  for (const s of [-1, 1]) part(c.root, box(2.4, 190, 5, 1), border, 0.8, [11, 140, s * 61]);
  part(c.root, box(2.4, 150, 1.6, 0.5), M('#521826', '#b08a9a', 0), 0, [11.5, 140, 0]);   // centre parting fold
  for (const s of [-1, 1]) part(c.root, box(10, 10, 10, 3), gold, 1.2, [-12, 284, s * 70]);  // finials
  for (let z = -60; z <= 60; z += 6) part(c.root, box(1.6, 7, 3, 0.6), gold, 0, [12, 42, z]);          // parochet fringe
  part(c.root, new THREE.OctahedronGeometry(9, 0), gold, 1.2, [10, 205, 0]);                              // abstract gold ornament (no letters, no figures)
  part(c.root, box(2, 2, 60, 0.6), gold, 0, [11.5, 205, 0]);
  return c;
}

export function makeCandlesticks() {
  const c = G('candles'), silver = M('#d9dbe2', '#a8acc0'), wax = M('#fbf8ee', '#d8d2c4'), flame = toon('#ffd35a', { tint: '#ffb040', hi: 0 }), core = toon('#fff4c8', { tint: '#ffe08a', hi: 0 });
  for (const s of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(0, 0, s * 18); c.root.add(g);
    part(g, lathe([[0.1, 0], [11, 0], [11, 2.5], [7, 4.5], [3, 8], [2.6, 26], [4.5, 28], [2.4, 30], [2.4, 44], [6, 47], [6.2, 50], [0.1, 50]], 32), silver, 1.6);
    part(g, tube(2.1, 2.1, 22, 14).translate(0, 72, 0), wax, 1.2);
    part(g, ell(2.4, 4.6, 2.4, 14, 10), flame, 0.8, [0, 77, 0]);
    part(g, ell(1.1, 2.3, 1.1, 10, 8), core, 0, [0.6, 76, 0]);
  }
  return c;
}

export function makeStoneHouse() {
  const c = G('house'), stone = M('#e8d6ab', '#c9b08c'), stoneD = M('#d4bf91', '#bba07c', 0), dark = M('#4a3a30', '#8a7a70'), wood = WOOD(), dome = M('#e2cfa2', '#c9b08c');
  part(c.root, box(160, 150, 200, 3), stone, 2.8, [0, 75, 0]);
  part(c.root, box(170, 8, 210, 2), stoneD, 2.2, [0, 154, 0]);                // roof parapet
  part(c.root, ell(40, 32, 40, 32, 16).translate(0, 0, 0), dome, 2.4, [-20, 158, 30]);
  // stone block joints on the front face (+x)
  for (let row = 0; row < 7; row++) for (let k = 0; k < 6; k++) {
    const y = 12 + row * 21, z = -100 + (k + (row % 2) * 0.5) * 38;
    if (z > 96 || z < -96) continue;
    part(c.root, box(1, 1.2, 34, 0.3), stoneD, 0, [80.6, y + 9, z]);
    part(c.root, box(1, 19, 1.2, 0.3), stoneD, 0, [80.6, y, z + 18]);
  }
  // arched window + door (dark openings with wooden frames)
  const archShape = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(-w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true); s.lineTo(w / 2, 0); s.lineTo(-w / 2, 0); return new THREE.ShapeGeometry(s, 16); };
  for (const [z, w, h, y0, mat] of [[-46, 36, 54, 60, dark], [40, 44, 84, 0, wood]]) {
    const g = archShape(w, h).rotateY(Math.PI / 2); part(c.root, g, mat, 1.6, [81, y0, z]);
  }
  part(c.root, box(3, 3, 44, 1), dark, 0, [82, 40, 40]);                   // door rail
  part(c.root, box(10, 4, 46, 1.5), stoneD, 1.4, [84, 58, -46]);           // window sill
  return c;
}

export const PROPS = { shtender: makeShtender, gemara: makeGemara, table: makeTableSefarim, bench: makeBench, aron: makeAron, candles: makeCandlesticks, house: makeStoneHouse };
