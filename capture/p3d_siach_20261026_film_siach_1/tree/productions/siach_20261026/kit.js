// kit.js - siach_20261021 (holiness stays in a place). New helpers on top of shared.js. Everything is a pure function of t.
import { THREE, box, cyl, ball, mesh, toon, ink, canvasTex, groundTex, cloud, rng, clamp, lerp, ease, prog } from '../../lib/stage3d.js';
import * as P from '../../lib/props3d.js';
import { fbm } from '../azamra342/road.js';
import * as S from './shared.js';

const PI = Math.PI, INK = S.INK, V3 = (x, y, z) => new THREE.Vector3(x, y, z), C = h => new THREE.Color(h);
export const GOLD = 0xFFD54A;

// ---------------- looks (men and boys only, every head covered) ----------------
export const TZADDIK = { coat: '#1d1d24', skin: '#efcfb0', pants: '#15151c', hat: 'kippa', hatColor: '#3A4A7A', beard: '#F4F1EA', beardLen: .95 };
export const GRANDSON = { coat: '#1d1d24', skin: '#f0d2b4', pants: '#15151c', hat: 'kippa', hatColor: '#3A4A7A', beard: '#3a2618', beardLen: .12 };
export const GREATRAV = { coat: '#202028', skin: '#efcfb0', pants: '#15151c', hat: 'kippa', hatColor: '#3A4A7A', beard: '#F4F1EA', beardLen: 1.0, glasses: true };
export const BACHUR = { kind: 'boy', coat: '#2b3a5a', hat: 'kippa', hatColor: '#E8E0C8', beardLen: 0, skin: '#f0d2b4', pants: '#1b1d24' };
export const AVRAHAM = { coat: '#CDB68A', skin: '#dfb48c', pants: '#CDB68A', hat: 'kippa', hatColor: '#E8E0C8', beard: '#ECE9E2', beardLen: 1.0, vest: false };
export const ABROAD = { coat: '#2c2c36', skin: '#efcfb0', pants: '#1b1d24', hat: 'kippa', hatColor: '#3A4A7A', beard: '#8a8a86', beardLen: .7, glasses: true };

// black hat on the head bone (men; the engine forces a kippa underneath)
export function hatOn(Wd, Pp, o) {
  o = o || {}; let done = false;
  Wd.on(() => { if (done || !Pp.figure) return; done = true;
    const hd = Pp.figure.bones.head, m = toon(o.color || 0x1a1a22), g = new THREE.Group(), hy = .22, cr = .159;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .014, 40), m); brim.position.y = hy; g.add(brim);
    const pts = [[0, cr], [.02, cr], [.08, cr * .98], [.115, cr * .9], [.125, cr * .55], [.118, 0]].map(([y, r]) => new THREE.Vector2(r, y));
    const crown = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), m); crown.position.y = hy; crown.scale.z = 1.1; g.add(crown);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(cr * 1.01, cr * 1.02, .03, 36, 1, true), toon(0x34343f, { side: THREE.DoubleSide })); band.position.y = hy + .03; band.scale.z = 1.1; g.add(band);
    hd.add(g); });
}
// head cloth (Avraham): a light half-dome plus a brown band
export function clothOn(Wd, Pp) {
  let done = false;
  Wd.on(() => { if (done || !Pp.figure) return; done = true;
    const hd = Pp.figure.bones.head, g = new THREE.Group(), hc = .12, R = [.137, .161, .148];
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, PI * 2, 0, 1.12), toon(0xE8E0C8, { side: THREE.DoubleSide })); cap.scale.set(R[0] * 1.2, R[1] * 1.14, R[2] * 1.22); cap.position.y = hc + R[1] * .05; g.add(cap);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R[0] * 1.2 * Math.sin(1.12), .014, 8, 36), toon(0x8B6B3A)); rim.rotation.x = PI / 2; rim.scale.y = 1.1; rim.position.y = hc + R[1] * .05 + Math.cos(1.12) * R[1] * 1.14; g.add(rim);
    hd.add(g); });
}
export function staffIn(Wd, Pp, side) {
  const st = new THREE.Group(); st.add(cyl(.026, .03, 1.75, 0x7A5232, { pos: [0, -.15, 0], inkW: .006 })); st.add(ball(.05, 0x7A5232, { pos: [0, .73, 0], inkW: .005 }));
  S.holdIn(Wd, Pp, side || 'A', st, [0, -.02, .03]); return st;
}
export function packOn(Wd, Pp, col, boyScale) {
  let done = false; const k = boyScale || .8;
  Wd.on(() => { if (done || !Pp.figure) return; done = true; const ch = Pp.figure.bones.chest, g = new THREE.Group();
    g.add(box(.34 * k, .44 * k, .17 * k, col, { inkW: .008 })); g.add(box(.26 * k, .2 * k, .06 * k, 0xF2B630, { pos: [0, -.08 * k, -.1 * k], inkW: .006 }));
    g.position.set(0, -.04 * k, -.17 * k); ch.add(g); });
}
// every material of a figure -> translucent gold (a memory); k = opacity 0..1
export function ghostify(Pp, k, col) {
  if (!Pp.figure) return; const gc = C(col || GOLD);
  Pp.figure.group.traverse(m => { if (!m.isMesh) return; const ms = Array.isArray(m.material) ? m.material : [m.material];
    for (const mt of ms) { if (!mt) continue; if (!mt.userData.o) mt.userData.o = mt.color ? mt.color.clone() : null; if (mt.color && mt.userData.o) mt.color.copy(mt.userData.o).lerp(gc, .78);
      if (mt.emissive) mt.emissive.copy(gc).multiplyScalar(.55); mt.transparent = true; mt.opacity = k; mt.depthWrite = k > .98; } });
  Pp.group.visible = k > .01;
}
export function sunFollow(Wd, fn) { Wd.on(t => { const p = fn(t); Wd.sun.target.position.set(p[0], p[1], p[2]); Wd.sun.position.set(p[0] - 30, p[1] + 50, p[2] + 25); Wd.sun.target.updateMatrixWorld(); }); }

// flat radial glow on the ground
let _gd = null;
const discTex = () => _gd || (_gd = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,225,130,.95)'); r.addColorStop(.5, 'rgba(255,210,100,.5)'); r.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }));
export function groundGlow(Wd, x, y, z, size, op) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: discTex(), transparent: true, opacity: op === undefined ? 0 : op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 }));
  m.rotation.x = -PI / 2; m.position.set(x, y, z); m.renderOrder = 3; Wd.add(m); return m;
}

// ---------------- textures ----------------
function plankTex(horizontal) {
  const r = rng(31), cols = ['#d2a273', '#c8986a', '#dcae80', '#be8c60'];
  return canvasTex(256, 256, (g, w, h) => { for (let a = 0; a < 256; a += 32) { g.fillStyle = cols[Math.floor(r() * 4)]; horizontal ? g.fillRect(0, a, w, 32) : g.fillRect(a, 0, 32, h); g.fillStyle = 'rgba(60,35,15,.5)'; horizontal ? g.fillRect(0, a, w, 2) : g.fillRect(a, 0, 2, h);
    for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(60,35,15,.15)'; horizontal ? g.fillRect(r() * w, a + 6 + r() * 18, 20 + r() * 50, 2) : g.fillRect(a + 6 + r() * 18, r() * h, 2, 20 + r() * 50); } } }, [1, 1]);
}
export function stoneTexX(seed) {
  const r = rng(seed || 3), cols = ['#efe4cc', '#e8dbbf', '#f3e9d4', '#e3d4b6'];
  return canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#cdbb98'; g.fillRect(0, 0, w, h);
    for (let row = 0; row < 4; row++) { let x = -r() * 60; const y = row * 64; while (x < w) { const bw = 70 + r() * 60; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.beginPath(); g.roundRect(x + 2, y + 2, bw - 4, 60, 5); g.fill(); x += bw; } } }, [4, 2]);
}

// ---------------- A: the old wooden beit knesset ----------------
export const BX = -4.45, WX0 = -5.2, WX1 = 5.8, ZB = -4.5, ZF = 4.5, WH = 5.0, DOORX = -2.6;
export function knesset(Wd, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g); const baseV = plankTex(false);
  const tx = (rx, ry) => { const t = baseV.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return t; };
  const piece = (x0, x1, y0, y1, z0, z1) => { const w = x1 - x0, h = y1 - y0, d = z1 - z0; const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(0xffffff, { map: tx(Math.max(w, d) / 2.4, h / 2.4) }));
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = false; m.receiveShadow = true; ink(m, .025, INK, true); g.add(m); return m; };
  // floor
  const ft = plankTex(true); ft.repeat.set(5, 4); const fl = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0 + .6, ZF - ZB + .6), toon(0xffffff, { map: ft })); fl.rotation.x = -PI / 2; fl.position.set((WX0 + WX1) / 2, .02, (ZB + ZF) / 2); fl.receiveShadow = true; g.add(fl);
  // left wall (window, z -1.1..1.1, y 1.3..3.9)
  const L0 = WX0 - .3, L1 = WX0;
  piece(L0, L1, 0, WH, ZB - .3, -1.1); piece(L0, L1, 0, WH, 1.1, ZF + .3); piece(L0, L1, 0, 1.3, -1.1, 1.1); piece(L0, L1, 3.9, WH, -1.1, 1.1);
  // back wall (small window x 2.2..3.8, y 1.8..3.6)
  const B0 = ZB - .3, B1 = ZB;
  piece(WX0 - .3, 2.2, 0, WH, B0, B1); piece(3.8, WX1 + .3, 0, WH, B0, B1); piece(2.2, 3.8, 0, 1.8, B0, B1); piece(2.2, 3.8, 3.6, WH, B0, B1);
  // right wall
  piece(WX1, WX1 + .3, 0, WH, ZB - .3, ZF + .3);
  // front wall (door x -3.4..-1.8, y < 2.7)
  const F0 = ZF, F1 = ZF + .3;
  piece(WX0 - .3, -3.4, 0, WH, F0, F1); piece(-1.8, WX1 + .3, 0, WH, F0, F1); piece(-3.4, -1.8, 2.7, WH, F0, F1);
  // door frame + step
  for (const x of [-3.45, -1.75]) g.add(box(.12, 2.75, .36, 0x5e3a20, { pos: [x, 1.375, ZF + .15], ink: false })); g.add(box(1.82, .12, .36, 0x5e3a20, { pos: [DOORX, 2.76, ZF + .15], ink: false })); g.add(box(1.9, .1, .9, 0xC2BAA8, { pos: [DOORX, .05, ZF + .5], inkW: .01 }));
  // roof + beams (never cast shadows into the room)
  const roof = box(WX1 - WX0 + 1.4, .3, ZF - ZB + 1.4, 0xC9663C, { pos: [(WX0 + WX1) / 2, WH + .2, (ZB + ZF) / 2], ink: false }); roof.castShadow = false; g.add(roof);
  for (let z = ZB + 1; z <= ZF - .9; z += 1.8) { const b = box(WX1 - WX0, .26, .26, 0x5e3a20, { pos: [(WX0 + WX1) / 2, WH - .15, z], ink: false }); b.castShadow = false; g.add(b); }
  // windows
  const wl = S.windowOn(Wd, { pos: [WX0 - .1, 2.6, 0], w: 2.2, h: 2.6, color: 0xFFF1C9 }); wl.rotation.y = PI / 2;
  const wb = S.windowOn(Wd, { pos: [3.0, 2.7, ZB - .1], w: 1.6, h: 1.8, color: 0xFFF1C9 });
  const glass = wl.children[0], glass2 = wb.children[0];
  // light beam from the left window
  const A = [[WX0 + .02, 1.3, -1.1], [WX0 + .02, 3.9, -1.1], [WX0 + .02, 3.9, 1.1], [WX0 + .02, 1.3, 1.1]], Bq = [[-.9, .03, -2.0], [-.9, .03, 2.0], [-.9, .03, 2.0], [-.9, .03, -2.0]];
  Bq[0] = [-1.0, .04, -2.1]; Bq[1] = [-2.4, .04, -1.9]; Bq[2] = [-2.4, .04, 1.9]; Bq[3] = [-1.0, .04, 2.1];
  const bp = [], bi = []; for (const q of A.concat(Bq)) bp.push(...q);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; bi.push(i, j, 4 + j, i, 4 + j, 4 + i); }
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3)); bg.setIndex(bi);
  const beam = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: 0xFFE9A8, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); beam.renderOrder = 2; g.add(beam);
  // furniture
  const lampG = new THREE.Group(); lampG.add(cyl(.01, .01, 1.2, 0x333333, { pos: [0, 4.35, 0], ink: false })); lampG.add(ball(.2, 0xFFE6A8, { pos: [0, 3.7, 0], ink: false })); lampG.position.set(.8, 0, .2); g.add(lampG);
  const lg = S.glowSp(null, 2.4, .5, 0xFFD890); lg.position.set(.8, 3.7, .2); g.add(lg);
  P.table(Wd, { pos: [1.8, 0, -1.2], w: 3.4, d: 1.0 }); P.bench(Wd, { pos: [1.8, 0, -2.1], rot: 0, scale: [1.9, 1, 1] }); P.bench(Wd, { pos: [1.8, 0, -.3], rot: PI, scale: [1.9, 1, 1] });
  P.bench(Wd, { pos: [-1.0, 0, ZB + .5], rot: 0, scale: [1.5, 1, 1] }); P.bookshelf(Wd, { pos: [WX1 - .3, 0, 1.0], rot: -PI / 2, seed: 4 });
  // THE bench: faces +x, by the window; materials glow (emissive)
  const bench = new THREE.Group(); bench.position.set(BX, 0, 0); Wd.add(bench); const mats = [];
  const bm = (c, w, h, d, p, r) => { const mt = toon(c, { emissive: 0x000000 }); mats.push(mt); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt); m.position.set(...p); if (r) m.rotation.set(...r); m.castShadow = true; m.receiveShadow = true; ink(m, .012, INK, true); bench.add(m); return m; };
  bm(0xB07D50, .5, .07, 2.2, [0, .45, 0]); bm(0xA4713F, .06, .5, 2.2, [-.22, .75, 0], [-.12, 0, 0]);
  for (const z of [-.95, .95]) for (const x of [-.18, .18]) bm(0x7A5232, .08, .42, .08, [x, .21, z]);
  bm(0x7A5232, .06, .06, 2.0, [0, .18, 0]);
  const gs = S.glowSp(null, 3.4, 0, 0xFFD54A); gs.position.set(BX + .1, .85, 0); Wd.add(gs); const gg = groundGlow(Wd, BX + .3, .06, 0, 3.6, 0);
  const gold = C(GOLD);
  const api = { g, bench, glass, glass2, beam, BX, mats, level: 0,
    setGlow(l) { l = clamp(l, 0, 1.2); api.level = l; for (const mt of mats) mt.emissive.copy(gold).multiplyScalar(l * .5); gs.material.opacity = .55 * l; gg.material.opacity = .6 * l; },
    sky(c1, k) { glass.material.color.copy(C(c1)); glass2.material.color.copy(C(c1)); beam.material.opacity = k; } };
  // dust motes in the beam (amp(t) 0..1, settle(t) 0..1)
  const L = S.lightField(Wd, 50, { r: .03, glow: .5, haloOp: .35 }), dc = C(0xFFF0C0), rr = rng(9), M = [];
  for (let i = 0; i < 50; i++) M.push([rr(), rr(), rr()]);
  L.frame((t, cam, L) => { const amp = o.dust ? o.dust(t) : 1, st = o.settle ? o.settle(t) : 0; if (amp < .02) return;
    for (let i = 0; i < 50; i++) { const [a, b, c] = M[i], f = .1 + .8 * a, x = lerp(WX0 + .3, -1.6, f) + .2 * Math.sin(t * .4 + i);
      const yc = lerp(2.6, .9, f), y = yc + (b - .5) * lerp(2.2, 1.4, f) + .15 * Math.sin(t * .3 + i * 1.7) - st * (.9 + b * .6) * (yc > 1.2 ? 1 : .3), zz = (c - .5) * lerp(2.1, 3.8, f) + .2 * Math.cos(t * .35 + i);
      L.put(x, Math.max(.08, y), zz, amp * (.8 + .3 * Math.sin(t * 1.3 + i)) * (1 - .6 * st), dc); } });
  // the world outside the windows and the door
  P.tree(Wd, { pos: [-13, 0, -3], kind: 0, scale: 1.5 }); P.tree(Wd, { pos: [-17, 0, 6], kind: 1, scale: 1.4 }); P.tree(Wd, { pos: [7, 0, -12], kind: 0, scale: 1.3 }); P.tree(Wd, { pos: [-9, 0, 12], kind: 0, scale: 1.3 });
  P.pathStones(Wd, { pts: [[DOORX, 5.6], [DOORX + 1, 16]], seed: 3 });
  const dg = S.glowSp(Wd, 5.5, .35, 0xFFE9B0); dg.position.set(DOORX, 1.4, ZF + 2.4);
  return api;
}

// ---------------- B: the orange orchard (rows run along x, the lane is z = 0) ----------------
export function orchard(Wd, o) {
  o = o || {}; const rows = [-17.2, -10.4, -3.6, 3.6, 10.4, 17.2], X0 = -34, DX = 4.8, NX = 21, sp = o.special || null;
  const list = []; const r = rng(77);
  for (const z of rows) for (let i = 0; i < NX; i++) { const x = X0 + i * DX + (r() - .5) * .6; if (sp && z > 0 && Math.abs(x - sp[0]) < 3.4) continue; list.push([x, z + (r() - .5) * .5, 1 + r() * .15]); }
  if (sp) list.push([sp[0], sp[1], 1.4]);
  const n = list.length, D = new THREE.Object3D();
  const trunkG = new THREE.CylinderGeometry(.16, .24, 2.2, 8), fG = new THREE.SphereGeometry(1, 14, 10);
  const tr = new THREE.InstancedMesh(trunkG, toon(0x7A5232), n), fo = new THREE.InstancedMesh(fG, toon(0xffffff), n * 3), fi = new THREE.InstancedMesh(fG, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }), n * 3);
  const orG = new THREE.SphereGeometry(.11, 8, 6), NO = 9, orr = new THREE.InstancedMesh(orG, toon(0xF29A2E, { emissive: 0x3a1c00 }), n * NO);
  const SPH = [[0, 3.0, 0, 1.5], [.8, 2.55, .3, 1.05], [-.75, 2.65, -.3, 1.15]], greens = [0x4E8F3A, 0x5C9C42, 0x44823A];
  list.forEach(([x, z, s], i) => {
    D.position.set(x, 1.1 * s, z); D.rotation.set(0, 0, 0); D.scale.set(s, s, s); D.updateMatrix(); tr.setMatrixAt(i, D.matrix);
    SPH.forEach(([sx, sy, sz, sr], k) => { D.position.set(x + sx * s, sy * s, z + sz * s); D.scale.setScalar(sr * s); D.updateMatrix(); fo.setMatrixAt(i * 3 + k, D.matrix); fo.setColorAt(i * 3 + k, C(greens[(i + k) % 3])); D.scale.setScalar(sr * s * 1.045); D.updateMatrix(); fi.setMatrixAt(i * 3 + k, D.matrix); });
    for (let q = 0; q < NO; q++) { const a = r() * 6.28, b = .35 + r() * 1.0, S0 = SPH[q % 3], R0 = S0[3] * 1.03;
      D.position.set(x + (S0[0] + Math.sin(b) * Math.cos(a) * R0) * s, (S0[1] + Math.cos(b) * R0 * .85) * s, z + (S0[2] + Math.sin(b) * Math.sin(a) * R0) * s); D.scale.setScalar(s); D.updateMatrix(); orr.setMatrixAt(i * NO + q, D.matrix); } });
  for (const m of [tr, fo, fi, orr]) { m.frustumCulled = false; Wd.add(m); } fo.castShadow = true; tr.castShadow = true;
  // the lane
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(190, 3.6), new THREE.MeshLambertMaterial({ color: 0xEBD9A8, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); lane.rotation.x = -PI / 2; lane.position.set(20, .03, 0); lane.receiveShadow = true; Wd.add(lane);
  P.house(Wd, { pos: [70, 0, -3], rot: PI / 2 * -1, scale: 1.3 }); P.house(Wd, { pos: [-48, 0, 5], rot: PI / 2, scale: 1.3, color: 0xF4DFB4 });
  for (const [x, y, z, s, sd] of [[-30, 26, -60, 4, 3], [10, 30, -70, 5, 5], [50, 24, -55, 3.5, 8], [20, 28, 60, 4.5, 12]]) { const c = cloud({ seed: sd, size: s, pos: [x, y, z], puffs: 6, cast: false }); Wd.add(c); }
}

// ---------------- C: the boy's room (x -4..4, z -4.5..4.5) with a window hole in the back wall ----------------
export const RWIN = { x0: .6, x1: 2.6, y0: 1.2, y1: 3.0 };
export function room(Wd, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g);
  const piece = (x0, x1, y0, y1, z0, z1, col) => { const m = box(x1 - x0, y1 - y0, z1 - z0, col || 0xF3E6C8, { pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], inkW: .02 }); m.castShadow = false; g.add(m); return m; };
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(8, 9), new THREE.MeshLambertMaterial({ color: 0xD2A66C })); fl.rotation.x = -PI / 2; fl.position.set(0, .02, 0); fl.receiveShadow = true; g.add(fl);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), new THREE.MeshLambertMaterial({ color: 0x9C4A36, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); rug.rotation.x = -PI / 2; rug.position.set(.3, .035, .6); g.add(rug);
  piece(-4.3, 4.3, 0, 3.6, 4.5, 4.8); // front wall
  piece(-4.3, -4, 0, 3.6, -4.8, 4.8, 0xE9D3A1); piece(4, 4.3, 0, 3.6, -4.8, 4.8, 0xE9D3A1);
  const W = RWIN; piece(-4.3, W.x0, 0, 3.6, -4.8, -4.5); piece(W.x1, 4.3, 0, 3.6, -4.8, -4.5); piece(W.x0, W.x1, 0, W.y0, -4.8, -4.5); piece(W.x0, W.x1, W.y1, 3.6, -4.8, -4.5);
  // window frame (wood) around the hole, glass pane (hidden when the camera flies through)
  const fr = 0x8A5A34; g.add(box(2.2, .1, .3, fr, { pos: [(W.x0 + W.x1) / 2, W.y1 + .05, -4.65], ink: false })); g.add(box(2.2, .1, .3, fr, { pos: [(W.x0 + W.x1) / 2, W.y0 - .05, -4.65], ink: false }));
  for (const x of [W.x0 - .05, W.x1 + .05]) g.add(box(.1, W.y1 - W.y0 + .2, .3, fr, { pos: [x, (W.y0 + W.y1) / 2, -4.65], ink: false }));
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(W.x1 - W.x0, W.y1 - W.y0), new THREE.MeshBasicMaterial({ color: 0xCFEAFF, fog: false })); pane.position.set((W.x0 + W.x1) / 2, (W.y0 + W.y1) / 2, -4.64); pane.visible = !o.open; g.add(pane);
  const mull = new THREE.Group(); mull.add(box(.06, W.y1 - W.y0, .1, fr, { ink: false })); mull.add(box(W.x1 - W.x0, .06, .1, fr, { ink: false })); mull.position.set((W.x0 + W.x1) / 2, (W.y0 + W.y1) / 2, -4.6); mull.visible = !o.open; g.add(mull);
  // stone wall behind the desk (left) with the glow overlay, plank shelf with books
  const st = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.6), toon(0xffffff, { map: stoneTexX(5) })); st.rotation.y = PI / 2; st.position.set(-3.98, 1.8, 0); st.receiveShadow = true; g.add(st);
  const stGlow = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 3.2), new THREE.MeshBasicMaterial({ map: discTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); stGlow.rotation.y = PI / 2; stGlow.position.set(-3.94, 1.9, 0); stGlow.renderOrder = 3; g.add(stGlow);
  const shelf = new THREE.Group(); shelf.position.set(-3.86, 2.35, -.1); g.add(shelf);
  shelf.add(box(.36, .06, 2.3, 0xA4713F, { inkW: .008 })); for (const z of [-.9, .9]) shelf.add(box(.3, .3, .05, 0x7A5232, { pos: [0, -.18, z], inkW: .006 }));
  const bcol = [0x7a1f1f, 0x1f3b6b, 0x2f5a2f, 0x22222c, 0x8a6a2a], rb = rng(4); let zz = -1.0; for (let i = 0; i < 9; i++) { const bw = .1 + rb() * .08, bh = .26 + rb() * .1; shelf.add(box(.2, bh, bw, bcol[i % 5], { pos: [-.04, .03 + bh / 2, zz + bw / 2], inkW: .004 })); zz += bw + .02; }
  const shGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.7), new THREE.MeshBasicMaterial({ map: discTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); shGlow.rotation.y = PI / 2; shGlow.position.set(-3.8, 2.5, -.1); shGlow.renderOrder = 3; g.add(shGlow);
  // desk + chair
  P.table(Wd, { pos: [-3.2, 0, 0], rot: PI / 2, w: 2.2, d: .9 }); P.chair(Wd, { pos: [-2.3, 0, 0], rot: -PI / 2 });
  P.bookOpen(Wd, { pos: [-3.2, .8, -.55], rot: PI / 2 });
  // flat or pitched roof
  if (o.roof === 'flat') { const rf = box(9.2, .3, 10.2, 0xE9D3A1, { pos: [0, 3.75, 0], ink: false }); rf.castShadow = false; g.add(rf); }
  if (o.roof === 'pitched') { const tri = new THREE.Shape(); tri.moveTo(-4.9, 0); tri.lineTo(4.9, 0); tri.lineTo(0, 2.4);
    const rf = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 10.6, bevelEnabled: false }), toon(0xC9663C)); rf.position.set(0, 3.6, -5.3); ink(rf, .03, INK); rf.castShadow = false; g.add(rf);
    const fl2 = box(9.2, .2, 10.2, 0xE9D3A1, { pos: [0, 3.55, 0], ink: false }); fl2.castShadow = false; g.add(fl2); }
  // outside
  P.tree(Wd, { pos: [-10, 0, -9], kind: 0, scale: 1.5 }); P.tree(Wd, { pos: [9, 0, -12], kind: 1, scale: 1.4 }); P.tree(Wd, { pos: [14, 0, -7], kind: 0, scale: 1.3 }); P.house(Wd, { pos: [-14, 0, -18], rot: .3 }); P.house(Wd, { pos: [16, 0, -20], rot: -.3, color: 0xF4DFB4 }); P.bush(Wd, { pos: [-5.5, 0, -6], scale: 1.3 }); P.bush(Wd, { pos: [5.5, 0, -6.5], scale: 1.4 });
  for (const [x, y, z, s, sd] of [[-30, 24, -50, 4, 3], [10, 28, -60, 5, 5], [38, 22, -45, 3.5, 8]]) Wd.add(cloud({ seed: sd, size: s, pos: [x, y, z], puffs: 6, cast: false }));
  return { g, pane, mull, stGlow, shGlow, shelf };
}
// the memory stick (long axis z, plug toward +z), on the desk top
export function stick(Wd, pos) {
  const g = new THREE.Group(); g.position.set(...pos); Wd.add(g);
  g.add(box(.075, .035, .17, 0x3C7FD8, { pos: [0, .018, -.02], inkW: .006 })); g.add(box(.05, .022, .09, 0xD9DDE3, { pos: [0, .014, .125], inkW: .005 })); g.add(box(.06, .036, .03, 0x2B5FAE, { pos: [0, .018, -.115], inkW: .005 }));
  const led = ball(.011, 0xFFE27A, { pos: [0, .04, .02], ink: false }); g.add(led); const gl = S.glowSp(null, .5, .5, 0xFFD54A); gl.position.set(0, .06, .02); g.add(gl);
  return { g, led, gl };
}

// ---------------- D / F: the land ----------------
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const bump = (x, z, cx, cz, r, h) => h * Math.exp(-((x - cx) * (x - cx) + (z - cz) * (z - cz)) / (2 * r * r));
// the ancient trail (xz polyline through Catmull-Rom, arc-length parameterised)
const A_PTS = [[2, 3], [12, 9], [26, 6], [40, -4], [55, -2], [70, 12], [88, 22], [108, 14], [125, -2], [140, -14], [160, -10]];
function mkTrail(pts) {
  const cv = new THREE.CatmullRomCurve3(pts.map(p => V3(p[0], 0, p[1])), false, 'centripetal'), len = cv.getLength(), q = V3(0, 0, 0);
  return { len, at(d) { cv.getPointAt(clamp(d / len, 0, 1), q); return [q.x, q.z]; },
    tan(d) { const a = this.at(Math.max(0, d - .4)), b = this.at(Math.min(len, d + .4)); const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l]; } };
}
export const TRAIL_A = mkTrail(A_PTS);
const JD = TRAIL_A.len * .6, JP = TRAIL_A.at(JD);
export const JX = JP[0], JZ = JP[1];
// the boys' trail: ends on the ancient one at J
export const TRAIL_B = mkTrail([[JX + 27, JZ + 18], [JX + 19, JZ + 12], [JX + 9, JZ + 5], [JX, JZ]]);
export function hY(x, z) {
  let y = 7 * (fbm(x * .016 + 4, z * .016 + 9) - .45) + 1.6 * (fbm(x * .06 + 1, z * .06 + 2) - .5);
  y *= sm(8, 22, Math.hypot(x, z));
  y += bump(x, z, 50, 12, 5.2, 12) + bump(x, z, JX + 14, JZ + 9, 16, 9);
  return y;
}
export function land(Wd) {
  const g = new THREE.PlaneGeometry(280, 200, 232, 166); g.rotateX(-PI / 2); g.translate(70, 0, 25);
  const p = g.attributes.position, cols = new Float32Array(p.count * 3), c = new THREE.Color(), c1 = C(0xDCC884), c2 = C(0x9DB85C), c3 = C(0xE9D3A1);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = hY(x, z), n = fbm(x * .035, z * .035); p.setY(i, h);
    c.copy(c1).lerp(c2, sm(.3, .62, n)).lerp(c3, clamp(h / 18, 0, .55)); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals();
  const terr = new THREE.Mesh(g, toon(0xffffff, { vertexColors: true })); terr.receiveShadow = true; Wd.add(terr);
  const r = rng(21), D = new THREE.Object3D(), NB = 150, NR = 70;
  const bu = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), toon(0xffffff), NB), rk = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), toon(0xffffff), NR);
  for (let i = 0; i < NB; i++) { const x = -40 + r() * 190, z = -50 + r() * 140, s = .5 + r() * .9; D.position.set(x, hY(x, z) + .25 * s, z); D.scale.set(s, s * .6, s); D.rotation.set(0, r() * 3, 0); D.updateMatrix(); bu.setMatrixAt(i, D.matrix); bu.setColorAt(i, C([0x8aa05a, 0x7b9450, 0x9db06a, 0x6e8a4a][i % 4])); }
  for (let i = 0; i < NR; i++) { const x = -40 + r() * 190, z = -50 + r() * 140, s = .5 + r() * .8; D.position.set(x, hY(x, z) + .2 * s, z); D.scale.set(s * .9, s * .55, s * .9); D.rotation.set(0, r() * 3, 0); D.updateMatrix(); rk.setMatrixAt(i, D.matrix); rk.setColorAt(i, C([0xc4ab86, 0xb59c78, 0xd0b894][i % 3])); }
  bu.frustumCulled = rk.frustumCulled = false; Wd.add(bu); Wd.add(rk);
  // olive-like trees
  for (let i = 0; i < 26; i++) { const x = -30 + r() * 170, z = -45 + r() * 130; if (Math.hypot(x, z) < 14 || Math.hypot(x - 50, z - 12) < 16) continue; const y = hY(x, z), s = .8 + r() * .6;
    Wd.add(cyl(.12 * s, .2 * s, 1.5 * s, 0x6b4a30, { pos: [x, y + .75 * s, z], inkW: .01 })); Wd.add(ball(1.2 * s, [0x7c9a58, 0x8aa862][i % 2], { pos: [x, y + 2.0 * s, z], scale: [1.3, .85, 1.3], inkW: .02 })); }
  // stone hill towns (no labels)
  const towns = [[30, 22], [64, -18], [104, -8], [150, 58], [76, 52], [158, 14]];
  towns.forEach(([cx, cz], k) => { const rt = rng(40 + k); for (let i = 0; i < 7; i++) { const a = rt() * 6.28, rr = 2 + rt() * 7, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr, w = 2.4 + rt() * 2.2, d = 2.4 + rt() * 2, h = 2 + rt() * 2.2;
    Wd.add(box(w, h, d, [0xF0E2C0, 0xE9D3A1, 0xF4EAD0][i % 3], { pos: [x, hY(x, z) + h / 2 - .1, z], rot: [0, rt() * 3, 0], inkW: .03 })); } });
  for (const [x, y, z, s, sd] of [[-20, 40, -90, 6, 3], [60, 46, -100, 7, 5], [130, 38, -80, 5, 8], [10, 44, 120, 6, 12], [110, 50, 110, 6, 14]]) Wd.add(cloud({ seed: sd, size: s, pos: [x, y, z], puffs: 6, cast: false }));
}
// flat gold ribbon along a trail, optionally growing (reveal 0..1)
export function ribbon(Wd, trail, o) {
  const step = o.step || .9, n = Math.ceil(trail.len / step), pos = new Float32Array((n + 1) * 6), idx = [], w = o.w || 1.2;
  for (let i = 0; i <= n; i++) { const d = i * trail.len / n, a = trail.at(d), tn = trail.tan(d), nx = -tn[1], nz = tn[0];
    for (const s of [-1, 1]) { const x = a[0] + nx * w / 2 * s, z = a[1] + nz * w / 2 * s; pos.set([x, o.y !== undefined ? o.y : hY(x, z) + .34, z], (i * 2 + (s > 0 ? 1 : 0)) * 3); } }
  for (let i = 0; i < n; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: o.op || .85, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 }));
  m.frustumCulled = false; m.renderOrder = 2; Wd.add(m);
  return { mesh: m, reveal(u) { const k = Math.floor(clamp(u, 0, 1) * n) * 6; geo.setDrawRange(0, k); m.visible = k > 0; } };
}
// glowing footprints along a trail, popping in as `cur(t)` (distance travelled) passes them
export function prints(Wd, trail, o) {
  const sp = o.spacing || .9, n = Math.floor((o.d1 - o.d0) / sp), r = o.r || .2, D = new THREE.Object3D(), ys = o.y;
  const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, .04, 12), new THREE.MeshBasicMaterial({ color: 0xFFE27A, fog: false }), Math.max(1, n));
  const ik = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, .03, 12), new THREE.MeshBasicMaterial({ color: INK, fog: false }), Math.max(1, n));
  const hl = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: discTex(), transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), Math.max(1, n));
  im.frustumCulled = ik.frustumCulled = hl.frustumCulled = false; hl.renderOrder = 3; for (const m of [ik, im, hl]) Wd.add(m);
  const items = []; for (let i = 0; i < n; i++) { const d = o.d0 + i * sp, a = trail.at(d), tn = trail.tan(d), side = i % 2 ? 1 : -1, x = a[0] - tn[1] * .17 * side, z = a[1] + tn[0] * .17 * side; items.push([d, x, ys !== undefined ? ys : hY(x, z) + .1, z]); }
  Wd.on(t => { const cur = o.cur(t);
    items.forEach(([d, x, y, z], i) => { const k = ease.out(prog(cur - d, 0, .9)), s = Math.max(.0001, k) * (o.scale || 1);
      D.position.set(x, y, z); D.rotation.set(0, 0, 0); D.scale.setScalar(s); D.updateMatrix(); im.setMatrixAt(i, D.matrix); D.scale.set(s * 1.28, s * 1.28, s * 1.28); D.position.y = y - .005; D.updateMatrix(); ik.setMatrixAt(i, D.matrix);
      D.position.y = y + .03; D.rotation.set(-PI / 2, 0, 0); D.scale.setScalar(Math.max(.0001, k) * r * 7); D.updateMatrix(); hl.setMatrixAt(i, D.matrix); });
    im.instanceMatrix.needsUpdate = ik.instanceMatrix.needsUpdate = hl.instanceMatrix.needsUpdate = true; });
  return im;
}
// a person-position on a trail at distance d, lateral offset lat: {pos, facing, walk}
export function onTrail(trail, d, lat, moving) {
  const dd = clamp(d, 0, trail.len), a = trail.at(dd), tn = trail.tan(dd), x = a[0] - tn[1] * (lat || 0), z = a[1] + tn[0] * (lat || 0), o = { pos: [x, hY(x, z), z], groundY: hY(x, z), facing: Math.atan2(tn[0], tn[1]) };
  if (moving) o.walk = dd * 6.3; return o;
}
export const camAbove = (p, h) => [p[0], Math.max(p[1], hY(p[0], p[2]) + h), p[2]];
