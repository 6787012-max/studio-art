/* film_c world: terrain (beach + hills + dune field), ripples, sand-blow particles, small props. Deterministic. ASCII only. */
import { THREE, sm, cl, frac, V, D2R, part, ell, tube, tubeAlong, lathe, toon } from '../../../lib/toon3d/toon3d.js';
import * as KT from '../../toldot07_kit/kit07.js';
export const { M, box, rockGeo, rng, makeShadow } = KT;
export const col = h => new THREE.Color(h);
export const mixc = (a, b, u) => a.clone().lerp(b, cl(u, 0, 1));
export const G = (parent, pos) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); if (parent) parent.add(g); return g; };

/* ------------------------------------------------------------------ terrain height */
export const GD = { x: 4300, z: 650 };                      // growing dune centre
const DUNES = [
  { x: -1550, z: 980, rx: 650, rz: 380, h: 120 }, { x: -2700, z: 820, rx: 520, rz: 330, h: 90 }, { x: 1750, z: 1050, rx: 620, rz: 360, h: 125 },
  { x: 2600, z: 900, rx: 520, rz: 300, h: 85 }, { x: -760, z: 700, rx: 360, rz: 230, h: 58 }, { x: 760, z: 650, rx: 330, rz: 220, h: 48 },
  { x: -3600, z: 1150, rx: 700, rz: 420, h: 135 },
  { x: 5800, z: 950, rx: 700, rz: 420, h: 135 }, { x: 3200, z: 1300, rx: 600, rz: 380, h: 105 }, { x: 5100, z: 1500, rx: 800, rz: 460, h: 170 },
  { x: 4000, z: 2000, rx: 1100, rz: 560, h: 210 }, { x: 6600, z: 1800, rx: 900, rz: 500, h: 170 }, { x: 2300, z: 1700, rx: 700, rz: 420, h: 120 },
];
const HILLS = [
  { x: -1500, z: 2700, r: 1000, h: 400 }, { x: 1700, z: 2900, r: 1100, h: 430 }, { x: -3300, z: 3600, r: 1500, h: 620 }, { x: 300, z: 4800, r: 1900, h: 760 },
  { x: -800, z: 3600, r: 800, h: 300 }, { x: 3600, z: 4300, r: 1700, h: 600 }, { x: -5200, z: 3000, r: 1500, h: 480 }, { x: 800, z: 2300, r: 560, h: 150 },
];
const bump = (x, z, d) => { let dx = (x - d.x) / d.rx, dz = (z - d.z) / d.rz; if (dz > 0) dz *= 1.45; const q = dx * dx + dz * dz; return q >= 1 ? 0 : d.h * (1 - q) * (1 - q); };
export function TERR(x, z) {
  let y;
  if (z <= -20) y = -24; else if (z < 70) y = -24 + 28 * sm((z + 20) / 90); else y = 4 + Math.min((z - 70) * 0.03, 26);
  const k = sm(z / 500);
  y += k * (7 * Math.sin(x * 0.0043 + z * 0.003) + 4 * Math.sin(x * 0.011 - z * 0.007));
  if (z > 0) { for (const d of DUNES) y += bump(x, z, d); for (const m of HILLS) { const dd = Math.hypot(x - m.x, z - m.z) / m.r; if (dd < 1) y += m.h * (1 - dd * dd) * (1 - dd * dd); } }
  return y;
}
const C = { sand: col('#f0d89c'), sandD: col('#e6c88a'), wet: col('#cdb27a'), g1: col('#86bb5c'), g2: col('#6aa84f'), white: col('#ebe8dc'), haze: col('#c4dcea'), dryg: col('#c9bb6a') };
function terrCol(x, z, h) {
  let c = C.sand.clone();
  c.lerp(C.sandD, 0.5 + 0.5 * Math.sin(x * 0.0021 + z * 0.0033 + 1.3));
  if (z < 110) c.lerp(C.wet, cl(1 - z / 110, 0, 1) * 0.9);
  const gz = x > 2500 ? sm((z - 2500) / 700) : sm((z - 1150) / 550);
  if (gz > 0) { const g = C.g1.clone().lerp(C.g2, 0.5 + 0.5 * Math.sin(x * 0.004 + z * 0.0025)); c.lerp(g, gz); }
  if (z > 1800 && x < 2300) { const n = Math.sin(x * 0.0037 + 1.1) * Math.sin(z * 0.0051 + 0.4) + 0.6 * Math.sin(x * 0.011 + z * 0.006); const w = sm((n - 0.25) / 0.35) * sm((z - 1800) / 500) * sm((h - 40) / 120); if (w > 0) c.lerp(C.white, w * 0.95); }
  const hz = sm((z - 2800) / 3600); if (hz > 0) c.lerp(C.haze, hz * 0.62);
  return c;
}
export function makeTerrain() {
  const x0 = -7000, x1 = 10000, z0 = -300, z1 = 6800, nx = 340, nz = 140;
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz).rotateX(-Math.PI / 2), p = g.attributes.position, cols = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + (x0 + x1) / 2, z = p.getZ(i) + (z0 + z1) / 2, h = TERR(x, z); p.setXYZ(i, x, h, z); const c = terrCol(x, z, h); cols[3 * i] = c.r; cols[3 * i + 1] = c.g; cols[3 * i + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals();
  return new THREE.Mesh(g, toon('#ffffff', { tint: '#d8c4b0', hi: 0, vc: true }));
}

/* ------------------------------------------------------------------ ripple lines (wind ripples, ink-brown thin ribbons) */
export function makeRipples(o) {          // o: {x0,x1,z0,z1,n, h(x,z), seed, col}
  const r = rng(o.seed || 5), segs = 18, pos = [], idx = [], lines = [];
  for (let s = 0; s < o.n; s++) {
    const cx = o.x0 + r() * (o.x1 - o.x0), cz = o.z0 + r() * (o.z1 - o.z0), len = 160 + r() * 260, rows = 3 + Math.floor(r() * 4), sp = 17 + r() * 8, ph = r() * 6.28;
    for (let k = 0; k < rows; k++) lines.push({ cx, cz: cz + k * sp, len: len * (0.7 + 0.3 * Math.sin(k * 1.7 + ph)), ph: ph + k * 0.9, w: 1.7 + r() * 1.1 });
  }
  const f = lines.length; const P = new Float32Array(f * (segs + 1) * 2 * 3), I = [];
  const fill = () => {
    let o2 = 0;
    for (const L of lines) for (let i = 0; i <= segs; i++) {
      const u = i / segs, x = L.cx + (u - 0.5) * L.len, z = L.cz + 7 * Math.sin(u * 5 + L.ph) + 3 * Math.sin(u * 12 + L.ph * 2), w = L.w * Math.sin(Math.PI * u) + 0.15;
      const y = o.h(x, z) + 2.2;
      P[o2++] = x; P[o2++] = y; P[o2++] = z - w; P[o2++] = x; P[o2++] = y; P[o2++] = z + w;
    }
  };
  fill();
  for (let l = 0; l < f; l++) for (let i = 0; i < segs; i++) { const a = (l * (segs + 1) + i) * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setIndex(I);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col(o.col || '#d2b06c'), side: THREE.DoubleSide })); m.frustumCulled = false;
  m.userData.refill = () => { fill(); geo.attributes.position.needsUpdate = true; };
  return m;
}

/* ------------------------------------------------------------------ instanced particles */
const _o = new THREE.Object3D();
export function makeParticles(n, color, geo) {
  const mesh = new THREE.InstancedMesh(geo || new THREE.SphereGeometry(1, 6, 5), new THREE.MeshBasicMaterial({ color: col(color) }), n);
  mesh.frustumCulled = false; mesh.count = n;
  const api = { mesh, n, set(i, x, y, z, s) { _o.position.set(x, y, z); _o.scale.setScalar(Math.max(s, 0.0001)); _o.updateMatrix(); mesh.setMatrixAt(i, _o.matrix); }, hide(i) { api.set(i, 0, -9999, 0, 0.0001); }, commit() { mesh.instanceMatrix.needsUpdate = true; } };
  for (let i = 0; i < n; i++) api.hide(i); api.commit();
  return api;
}
/* wind blown sand: stream of grains lifting off a region and flying in +z (inland). update(t, amount 0..1) */
export function makeBlow(o) {              // {n, x0,x1,z0,z1, len, life, seed, size, hgt, h(x,z), color}
  const P = makeParticles(o.n, o.color || '#ecd196'), r = rng(o.seed || 3), S = [];
  for (let i = 0; i < o.n; i++) S.push({ x: o.x0 + r() * (o.x1 - o.x0), z: o.z0 + r() * (o.z1 - o.z0), ph: r(), hh: 0.4 + r() * 0.8, sz: 0.6 + r() * 0.8, w: r() * 6.28, sp: 0.8 + 0.5 * r() });
  P.update = (t, amt) => {
    const a = amt == null ? 1 : amt;
    S.forEach((s, i) => {
      if (i / o.n > a) { P.hide(i); return; }
      const u = frac(t / o.life * s.sp + s.ph), z = s.z + o.len * u, x = s.x + 40 * Math.sin(s.w + t * 2) * u;
      const y = o.h(x, z) + 6 + o.hgt * s.hh * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (0.4 + u) + 3 * Math.sin(t * 9 + s.w);
      P.set(i, x, y, z, o.size * s.sz * Math.sin(Math.PI * Math.min(1, u * 1.05)));
    });
    P.commit();
  };
  return P;
}

/* ------------------------------------------------------------------ labels with digits (canvas texture on a plane) */
export function makeLabel(text, wU, hU, px) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * hU / wU);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wU, hU), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.renderOrder = 30;
  m.userData.set = (txt, o) => {
    o = o || {}; const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
    c.font = '900 ' + (o.px || px || 150) + 'px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = (o.px || px || 150) * 0.17; c.strokeStyle = '#261c19'; c.strokeText(txt, cv.width / 2, cv.height / 2 + 6);
    c.fillStyle = o.fill || '#fff7d6'; c.fillText(txt, cv.width / 2, cv.height / 2 + 6); tex.needsUpdate = true;
  };
  m.userData.set(text);
  return m;
}
/* flat arrow lying in the xz plane pointing +x. length L, width W; thickness 4 */
export function makeArrowGeo(L, W) {
  const s = new THREE.Shape(), hw = W / 2, hl = W * 1.1;
  s.moveTo(0, -hw * 0.45); s.lineTo(L - hl, -hw * 0.45); s.lineTo(L - hl, -hw); s.lineTo(L, 0); s.lineTo(L - hl, hw); s.lineTo(L - hl, hw * 0.45); s.lineTo(0, hw * 0.45); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 5, bevelEnabled: true, bevelThickness: 1.5, bevelSize: 1.5, bevelSegments: 1 });
  g.rotateX(-Math.PI / 2); return g;      // shape y -> world -z ... lies flat
}
/* four-point sparkle star billboard-free (flat quad pair) */
export function makeSparkle(sz, color) {
  const g = G(), s = new THREE.Shape(); const R = 1, r = 0.22;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r : R; if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } s.closePath();
  const geo = new THREE.ShapeGeometry(s); geo.scale(sz, sz, 1);
  const mat = new THREE.MeshBasicMaterial({ color: col(color || '#fffbe0'), side: THREE.DoubleSide, depthWrite: false, transparent: true }); mat.depthTest = false;
  const m = new THREE.Mesh(geo, mat); m.renderOrder = 40; g.add(m); g.userData.mat = mat; g.userData.mesh = m; return g;
}
