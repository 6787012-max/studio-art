/* toldot08_kit - lesson 8 (the Kinneret). ES module; imports and re-exports kit07 (never edit kit07 or lib/).
   Deterministic: no Math.random (seeded rng only), everything is a function of t / explicit setters. ASCII only, no Hebrew in code.
   Units: Tipa 244, guide ~300, ground y = 0. WORLD LEVEL MAP: world y of the lake surface = (209.0 - L) * U  (L = level in metres, U = 300 units per metre)
   so a LOWER number is a HIGHER surface (the lake is below sea level; 208 at the top of the gauge, 215 at the bottom).
   Map orientation: x = EAST, -z = NORTH, west on the LEFT when the camera looks north.
   Exports: makeKinneretLake, makeGaugePole, makeDamGate, makePier, makeHouse, makeHouseCluster, makeFlowMat, KINNERET_OUTLINE, U, yOfLevel, levelOfY. */
import * as KT from '../toldot07_kit/kit07.js';
import { mergeVertices as mergeV } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import { THREE, hullMat as KT_hull, toon, part, ell, tube, tubeAlong, V, sm, cl, frac, col } from '../../lib/toon3d/toon3d.js';
export * from '../toldot07_kit/kit07.js';
const { M, box, rng, rockGeo } = KT;

export const U = 300, LEVEL_REF = 209.0;
export const yOfLevel = L => (LEVEL_REF - L) * U;
export const levelOfY = y => LEVEL_REF - y / U;
export const LAKE_PAL = { deep: '#2a8aa8', mid: '#3aa9bf', light: '#72d4cf', foam: '#ffffff', horz: '#cfeee8' };
const G = (parent, pos) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); if (parent) parent.add(g); return g; };

/* ======================================================================== outline + terrain function */
const CTRL = [[10, -1150], [140, -1080], [300, -950], [450, -780], [560, -560], [600, -300], [580, 0], [520, 300], [400, 600], [330, 800], [260, 950], [190, 1030], [100, 1060],
  [10, 1030], [-100, 950], [-250, 800], [-380, 600], [-520, 300], [-600, 0], [-640, -300], [-560, -560], [-420, -780], [-260, -950], [-100, -1080]];
export const KINNERET_OUTLINE = (() => {
  const c = new THREE.CatmullRomCurve3(CTRL.map(p => new THREE.Vector3(p[0], 0, p[1])), true, 'centripetal');
  return c.getSpacedPoints(240).slice(0, 240).map(p => [p.x, p.z]);
})();
const OL_ = KINNERET_OUTLINE, NP = OL_.length;
function sdf(x, z) {   // signed distance to the shoreline at the reference level (negative inside the lake)
  let inside = false, md = 1e18;
  for (let i = 0, j = NP - 1; i < NP; j = i++) {
    const ax = OL_[j][0], az = OL_[j][1], bx = OL_[i][0], bz = OL_[i][1];
    if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) inside = !inside;
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz; let u = L2 ? ((x - ax) * dx + (z - az) * dz) / L2 : 0; u = u < 0 ? 0 : u > 1 ? 1 : u;
    const px = ax + u * dx - x, pz = az + u * dz - z, d2 = px * px + pz * pz; if (d2 < md) md = d2;
  }
  return inside ? -Math.sqrt(md) : Math.sqrt(md);
}
function edgesAt(z) {   // [west x, east x] of the outline at z
  let a = 1e9, b = -1e9;
  for (let i = 0, j = NP - 1; i < NP; j = i++) {
    const az = OL_[j][1], bz = OL_[i][1]; if ((az > z) === (bz > z)) continue;
    const x = (OL_[i][0] - OL_[j][0]) * (z - az) / (bz - az) + OL_[j][0]; if (x < a) a = x; if (x > b) b = x;
  }
  return a > b ? [0, 0] : [a, b];
}
export const RIVER = { x0: 100, z0: 1090, amp: 90, k: 0.0032 };
export const riverX = z => RIVER.x0 + RIVER.amp * Math.sin((z - RIVER.z0) * RIVER.k) * sm(cl((z - RIVER.z0) / 400, 0, 1));
const hash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function vnoise(x, z) { const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function heightAt(x, z) {
  const d = sdf(x, z); let h;
  if (d < 0) { const e = -d; h = -(e < 150 ? 1.2 * e : 180 + 0.35 * (e - 150)); return Math.max(h, -440); }
  h = 0.5 * Math.min(d, 300) + 0.08 * cl(d - 300, 0, 600);
  const zc = cl(z, -1100, 1030), ed = edgesAt(zc), cxz = (ed[0] + ed[1]) / 2;
  const we = sm(cl((x - cxz) / 260, 0, 1)), ww = sm(cl((cxz - x) / 260, 0, 1)), en = Math.max(0, 1 - we - ww);
  const gz = (1 - sm(cl((z - 650) / 600, 0, 1))) * (1 - sm(cl((-z - 900) / 600, 0, 1)));   // Golan only along the east middle
  const f = cl((d - 150) / 760, 0, 1), g = f * 5, fl = Math.floor(Math.min(g, 4.999)), s = cl((g - fl) / 0.42, 0, 1);
  const golan = 300 * (fl + sm(s)) + (f >= 1 ? 50 * vnoise(x * 0.004, z * 0.004) + 0.05 * Math.min(d - 910, 1500) : 0);
  h += we * gz * golan + we * (1 - gz) * (110 * sm(cl((d - 300) / 1200, 0, 1)) + 40 * vnoise(x * 0.004 + 9, z * 0.004));
  h += ww * (880 * sm(cl((d - 360) / 1500, 0, 1)) * (0.6 + 0.4 * vnoise(x * 0.0018 + 3, z * 0.0021)) + 140 * vnoise(x * 0.0055, z * 0.0055) * sm(cl((d - 320) / 500, 0, 1)));
  h += en * (230 * sm(cl((d - 300) / 1400, 0, 1)) + 60 * vnoise(x * 0.005, z * 0.005)) + 900 * sm(cl((-z - 1900) / 1300, 0, 1)) + 1000 * Math.exp(-(((x - 700) ** 2 + (z + 3100) ** 2) / (2 * 700 * 700)));
  if (z > RIVER.z0) {   // the outlet channel south of the dam
    const a = Math.abs(x - riverX(z)), carve = -140 - (z - RIVER.z0) * 0.01, bl = (1 - sm(cl((a - 85) / 70, 0, 1))) * sm(cl((z - RIVER.z0) / 90, 0, 1));
    h = h * (1 - bl) + carve * bl;
  }
  return h;
}
const C_ = {}; const cc = hx => C_[hx] || (C_[hx] = col(hx));
function colorAt(x, z, h, sl, d) {
  const c0 = colorAt0(x, z, h, sl, d), r = Math.hypot(x * 0.8, z * 0.9), k = 0.55 * sm(cl((r - 1500) / 2500, 0, 1));
  return k > 0.01 ? c0.clone().lerp(cc('#d3e4e6'), k) : c0;
}
function colorAt0(x, z, h, sl, d) {
  const n1 = vnoise(x * 0.006, z * 0.006), n2 = vnoise(x * 0.02 + 5, z * 0.02);
  if (d < 0) return cc('#cdb584');
  if (z > RIVER.z0 + 20 && h < -60) return cc('#a9966c');
  if (d < 300 && h < 175) { return cc(d < 90 ? (n2 > 0.55 ? '#efdba6' : '#e8d094') : (n2 > 0.6 ? '#dfd093' : '#d9cf86')); }
  const gol = x > 250 && h > 330 && z > -1000 && z < 800;
  if (gol) { if (sl > 0.9) return cc('#3f3532'); if (sl > 0.45) return cc('#554640'); return cc(n1 > 0.55 ? '#86804c' : n1 > 0.38 ? '#6f6a46' : '#5d5240'); }
  if (z < -2300 && h > 1000) return cc('#f6f9fb');
  if (z < -2300 && h > 520) return cc(n2 > 0.5 ? '#b9bfae' : '#a2ab98');
  if (h > 520) return cc(n1 > 0.5 ? '#9ec468' : '#86b358');
  if (sl > 0.7) return cc('#7d6c58');
  return cc(n2 > 0.72 ? '#c2b366' : n1 > 0.55 ? '#8fc45e' : n1 > 0.3 ? '#7ab64f' : '#6aa845');
}

/* ======================================================================== flowing water material + ribbons */
export function makeFlowMat(o) {
  o = Object.assign({ base: '#43aed0', light: '#c4edf5', speed: 1.6, freq: 1.0 }, o || {});
  const m = new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { uT: { value: 0 }, uK: { value: 1 }, uA: { value: col(o.base) }, uB: { value: col(o.light) }, uS: { value: o.speed }, uF: { value: o.freq } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uT, uK, uS, uF; uniform vec3 uA, uB; varying vec2 vUv; void main(){ float w = fract(vUv.y * uF - uT * uS * uK + sin(vUv.x * 9.0 + vUv.y * 3.1) * 0.10); float s = step(0.66, w); float e = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x); vec3 c = mix(uA, uB, s); c = mix(uB, c, e); gl_FragColor = vec4(c, 1.0); }' });
  return m;
}
function ribbon(pts, width, vscale) {   // pts: [[x,y,z],...] -> strip geometry (u across, v along)
  const pos = [], uv = [], idx = []; let cum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], tz = b[2] - a[2]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    const sx = -tz, sz = tx, w = (typeof width === 'function' ? width(i / (pts.length - 1)) : width) / 2;
    if (i) cum += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]);
    pos.push(pts[i][0] - sx * w, pts[i][1], pts[i][2] - sz * w, pts[i][0] + sx * w, pts[i][1], pts[i][2] + sz * w);
    uv.push(0, cum / (vscale || 100), 1, cum / (vscale || 100));
    if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}

/* ======================================================================== houses */
export function makeHouse(seed, o) {
  o = Object.assign({ w: 150, d: 120, h: 100, garden: true }, o || {});
  const r = rng(seed * 7 + 1), g = G(), { w, d, h } = o;
  const wall = M(['#f4e9cf', '#efdbb4', '#ece0ca', '#f2d9ba'][seed % 4], '#cdbfb2'), roof = M(['#cf5a3c', '#bd4a30', '#d56a3f'][seed % 3], '#9c7a82'), win = M('#9fd1ee', '#7aa0c0', 0), frame = M('#ffffff', '#d8d8e0', 0), door = M('#7a4a2c', '#a07a64', 0);
  if (o.garden) { box(g, w * 1.55, 12, d * 1.7, M('#7dbb52', '#b8cfa8', 0), [0, 5, 0], 0, null, 4); }
  box(g, w, h, d, wall, [0, h / 2 + 8, 0], 2.4, null, 6);
  const rh = h * 0.62, rg = new THREE.ConeGeometry(0.7071, 1, 4, 1).rotateY(Math.PI / 4).scale(w * 1.2, rh, d * 1.2).translate(0, rh / 2, 0);
  part(g, rg, roof, 2.6, [0, h + 8, 0]);
  box(g, 22, 40, 22, wall, [w * 0.22, h + rh * 0.55 + 8, -d * 0.12], 1.8, null, 3);
  const wy = h * 0.55 + 8;   // windows on all four faces (the camera sees some of them from any side)
  for (const sx of [-1, 1]) for (const f of [-0.28, 0.28]) { box(g, 4, 30, 24, frame, [sx * (w / 2 + 1), wy, f * d], 0.8, null, 1); box(g, 5, 22, 17, win, [sx * (w / 2 + 2), wy, f * d], 0, null, 1); }
  for (const sz of [-1, 1]) for (const f of [-0.27, 0.27]) { box(g, 24, 30, 4, frame, [f * w, wy, sz * (d / 2 + 1)], 0.8, null, 1); box(g, 17, 22, 5, win, [f * w, wy, sz * (d / 2 + 2)], 0, null, 1); }
  box(g, 5, 52, 28, door, [w / 2 + 3, 34, 0], 1, null, 1);
  if (o.garden) { for (let i = 0; i < 2; i++) { const b = KT.makeBush(seed * 5 + i, { col: i ? '#5f9d46' : '#6aa84f', s: 0.5 + r() * 0.2, flowers: i ? null : '#f08aa6' }); b.position.set(w * (0.62 + 0.1 * i), 8, (i ? 1 : -1) * d * 0.55); g.add(b); } }
  return g;
}
export function makeHouseCluster(o) {
  o = Object.assign({ n: 8, seed: 3, cols: 3, dx: 260, dz: 240, yaw: 0 }, o || {});
  const g = G(), r = rng(o.seed);
  for (let i = 0; i < o.n; i++) {
    const cx = i % o.cols, cz = Math.floor(i / o.cols), hs = makeHouse(o.seed * 11 + i, { w: 130 + r() * 50, d: 105 + r() * 30, h: 88 + r() * 30 });
    hs.position.set(cx * o.dx + (r() - 0.5) * 50, 0, cz * o.dz + (r() - 0.5) * 50); hs.rotation.y = o.yaw + (r() - 0.5) * 0.5; g.add(hs);
  }
  return g;
}

/* ======================================================================== pier */
export function makePier(o) {
  o = Object.assign({ len: 440, w: 130, deckY: 100, below: 260 }, o || {});
  const g = G(), plank = [M('#b98a58', '#c8a88e'), M('#a87a4c', '#bb9a82')], post = M('#6e4a2c', '#9a7a66');
  const n = Math.round(o.len / 38);
  for (let i = 0; i < n; i++) box(g, 36, 12, o.w, plank[i % 2], [18 + i * (o.len / n), o.deckY, 0], 1.2, null, 2);
  for (const sz of [-1, 1]) box(g, o.len, 14, 12, post, [o.len / 2, o.deckY - 12, sz * (o.w / 2 - 4)], 1.4, null, 2);
  for (let i = 0; i <= 4; i++) for (const sz of [-1, 1]) box(g, 18, o.below + o.deckY, 18, post, [i * o.len / 4 - (i === 0 ? 0 : 8), o.deckY - (o.below + o.deckY) / 2 - 6, sz * (o.w / 2 - 4)], 1.6, null, 3);
  for (let i = 1; i <= 3; i++) for (const sz of [-1, 1]) { box(g, 14, 40, 14, post, [i * o.len / 4, o.deckY + 26, sz * (o.w / 2)], 1.4, null, 2); }
  for (const sz of [-1, 1]) box(g, o.len * 0.75, 8, 8, post, [o.len * 0.5, o.deckY + 42, sz * (o.w / 2)], 1.2, null, 1);
  g.userData.deckY = o.deckY; return g;
}

/* ======================================================================== the lake diorama */
export function makeKinneretLake(o) {
  o = Object.assign({ level: 209.3 }, o || {});
  const root = G(), rg = rng(8);
  /* terrain */
  const X0 = -3500, X1 = 3500, Z0 = -3600, Z1 = 3000, ST = 56, nx = Math.round((X1 - X0) / ST), nz = Math.round((Z1 - Z0) / ST);
  const geo = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, nx, nz).rotateX(-Math.PI / 2).translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2), P = geo.attributes.position, colA = new Float32Array(P.count * 3);
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), z = P.getZ(i), h = heightAt(x, z), sl = Math.hypot(heightAt(x + 14, z) - heightAt(x - 14, z), heightAt(x, z + 14) - heightAt(x, z - 14)) / 28, c = colorAt(x, z, h, sl, sdf(x, z));
    P.setY(i, h); colA[i * 3] = c.r; colA[i * 3 + 1] = c.g; colA[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colA, 3)); geo.computeVertexNormals();
  const tmat = toon('#ffffff', { vc: true, tint: '#98a28f', hi: 0, regions: [{ below: 0, c: '#bfa064' }, { below: 0, c: '#f4fbf8' }] });
  tmat.fragmentShader = tmat.fragmentShader.replace('abs(vP.x - uRp[i].x) < uRr[i].y', 'abs(vP.x - uRp[i].x) < uRr[i].y && vP.z < 1070.0 && vP.z > -1500.0');
  const terrain = new THREE.Mesh(geo, tmat); terrain.frustumCulled = false; root.add(terrain);
  { const hg = geo.clone(); for (const k of Object.keys(hg.attributes)) if (k !== 'position') hg.deleteAttribute(k); const hull = new THREE.Mesh(mergeV(hg, 1e-3), KT_hull(11)); hull.geometry.computeVertexNormals(); hull.frustumCulled = false; root.add(hull); }
  /* water: a dense grid limited to the lake box (the outlet channel south of the dam is a separate river) */
  const wmat = KT.seaMaterial({ A: 2.4, L: 240, palette: LAKE_PAL, fogN: 3200, fogF: 15000, lines: 1, F: 9000, C: [0, -200] });
  const wgeo = new THREE.PlaneGeometry(1700, 2600, 120, 186).rotateX(-Math.PI / 2).translate(0, 0, -200);
  const water = new THREE.Mesh(wgeo, wmat); water.frustumCulled = false; root.add(water);
  const st = wmat.userData.state;
  /* rain rings on the surface */
  const NR = 280, ringM = new THREE.InstancedMesh(new THREE.RingGeometry(0.76, 1, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#f1fbff', transparent: true, opacity: 0.8, depthWrite: false }), NR);
  ringM.frustumCulled = false; ringM.renderOrder = 5; root.add(ringM);
  const rings = []; { const r = rng(21); let k = 0; while (rings.length < NR && k++ < 20000) { const near = rings.length % 3 !== 0; const x = near ? -650 + r() * 1100 : -650 + r() * 1250, z = near ? 250 + r() * 800 : -1050 + r() * 2000; if (sdf(x, z) < -160) rings.push([x, z, r(), r()]); } }
  const dm = new THREE.Object3D();
  let level = o.level, rainK = 0, T = 0;
  const lake = {
    root, terrain, water, heightAt, sdf, edgesAt, outline: KINNERET_OUTLINE, level: () => level, waterY: () => yOfLevel(level), tmat, wmat,
    height: (x, z) => KT.seaHeight(st, x, z) + water.position.y,
    float: (x, z, len) => { const f = KT.floatOn(st, x, z, len); f.y += water.position.y; return f; },
    inLake: (x, z) => sdf(x, z) < 0,
    setLevel(L) { level = L; const y = yOfLevel(L); water.position.y = y; tmat.uniforms.uRp.value[0].y = y + 36; tmat.uniforms.uRp.value[1].y = y + 9; },
    setRain(k) { rainK = k; },
    setHorizon(hex) { wmat.uniforms.uHorz.value.set(hex); },
    update(t) { T = t; st.T = t; wmat.uniforms.uT.value = t; const y = water.position.y + 1.6;
      for (let i = 0; i < NR; i++) { const rr = rings[i]; const on = rr[3] < rainK, u = frac(t * 0.9 + rr[2]); const s = on ? 4 + 34 * u * (0.6 + 0.4 * rr[3]) : 0.001;
        dm.position.set(rr[0], y, rr[1]); dm.scale.set(s, 1, s); dm.updateMatrix(); ringM.setMatrixAt(i, dm.matrix); }
      ringM.instanceMatrix.needsUpdate = true; },
    anchors: { surface: [0, 0, 0], deep: [200, 0, -250], golan: [1050, 800, -150], galilee: [-1400, 400, -100], tiberias: [-760, 160, 420], hulaInlet: [10, 0, -1150], dam: [100, 0, 1080], eastShore: [600, 0, 0], westShore: [-600, 0, 0], camTop: [0, 3200, 200] },
  };
  /* placement helper */
  const put = (obj, x, z, dy, ry) => { obj.position.set(x, heightAt(x, z) + (dy || 0), z); if (ry != null) obj.rotation.y = ry; root.add(obj); return obj; };
  lake.put = put;
  /* Jordan inlet: a flowing ribbon on the delta */
  { const pts = [[10, -1150], [-10, -1400], [-90, -1800], [-130, -2250], [-60, -2700], [40, -3000]].map(p => [p[0], heightAt(p[0], p[1]) + 5, p[1]]);
    const fm = makeFlowMat({ base: '#3fa3cc', speed: 1.1, freq: 1.2 }), rb = new THREE.Mesh(ribbon(pts, p => 90 - 40 * p, 100), fm); rb.frustumCulled = false; root.add(rb); lake.jordanMat = fm;
    for (let i = 0; i < 9; i++) { const q = pts[1 + (i % 4)], x = q[0] + (i % 2 ? 1 : -1) * (70 + 30 * rg()), z = q[2] + (rg() - 0.5) * 400; put(KT.makeReeds(60 + i, { n: 9, h: 150 }), x, z, -2); } }
  /* shore: reeds and stones around the lake */
  for (let i = 0; i < 18; i++) { const k = Math.floor(i / 18 * NP + 6), p = OL_[k % NP], dx = (rg() - 0.5) * 60, dz = (rg() - 0.5) * 60; const q = [p[0] + dx, p[1] + dz]; if (sdf(q[0], q[1]) > 60 || sdf(q[0], q[1]) < -90) continue; const s = rg() < 0.5 ? 1 : 0.8; const rd = KT.makeReeds(100 + i, { n: 8, h: 150 * s }); put(rd, q[0], q[1], -3, rg() * 6); }
  for (let i = 0; i < 34; i++) { const k = Math.floor(rg() * NP), p = OL_[k], d0 = (rg() - 0.3) * 150, nx_ = p[0] > 0 ? 1 : -1, x = p[0] + nx_ * d0 * 0.8 * (rg() < 0.5 ? 1 : -1), z = p[1] + (rg() - 0.5) * 80; if (Math.abs(sdf(x, z)) > 140) continue; put(KT.makeStone(200 + i, 0.35 + rg() * 0.8), x, z, -6, rg() * 6); }
  /* west: Tiberias houses on the terrace, palms, hill trees */
  { let n = 0; for (let zi = -300; zi <= 900 && n < 18; zi += 105) { const ed = edgesAt(zi); for (const off of [370, 500]) { const x = ed[0] - off + (rg() - 0.5) * 40, z = zi + (rg() - 0.5) * 40; const d = sdf(x, z); if (d < 300 || d > 640) continue;
      const hs = makeHouse(300 + n, { w: 135 + rg() * 45, d: 105 + rg() * 28, h: 86 + rg() * 26 }); const ry_ = (rg() - 0.5) * 0.5; if (o.houses !== false) put(hs, x, z, -3, ry_); n++; } }
    lake.houseCount = n;
    for (let i = 0; i < 12; i++) { const zi = -250 + i * 95; if (zi > -60 && zi < 700) continue; const ed = edgesAt(zi), x = ed[0] - 300 - rg() * 40, z = zi + 40; put(KT.makeTree('palm', 400 + i, 0.46 + rg() * 0.12), x, z, -2, rg() * 6); }
    for (let i = 0; i < 26; i++) { const x = -1150 - rg() * 1500, z = -1200 + rg() * 2600, d = sdf(x, z); if (d < 600) continue; put(KT.makeTree(i % 3 ? 'tamarisk' : 'pine', 500 + i, 0.95 + rg() * 0.7), x, z, -4, rg() * 6); }
    for (let i = 0; i < 30; i++) { const x = -700 - rg() * 1500, z = -1300 + rg() * 2700, d = sdf(x, z); if (d < 340) continue; put(KT.makeBush(600 + i, { col: i % 2 ? '#6aa84f' : '#7ab356', s: 0.9 + rg() * 0.8 }), x, z, -2, rg() * 6); }
    for (let i = 0; i < 26; i++) { const ed = edgesAt(-300 + rg() * 1200), x = ed[0] - 320 - rg() * 120, z = -300 + rg() * 1200; put(KT.makeGrassTuft(700 + i, { h: 45 + rg() * 30, dry: i % 4 === 0 }), x, z, -3, 0); } }
  /* east: Golan basalt wall, dark rocks and scrub */
  { const bas = [M('#4a403c', '#8a8090'), M('#5a4d47', '#8a8090'), M('#3d3533', '#7a7280')];
    for (let i = 0; i < 40; i++) { const x = 760 + rg() * 1300, z = -800 + rg() * 1500, d = sdf(x, z), h = heightAt(x, z); if (d < 200 || h < 150) continue;
      const g = G(), s = 0.8 + rg() * 1.4; part(g, rockGeo(70 * s, 46 * s, 60 * s, 800 + i), bas[i % 3], 3); put(g, x, z, -10, rg() * 6); }
    for (let i = 0; i < 26; i++) { const x = 600 + rg() * 1500, z = -900 + rg() * 1800, d = sdf(x, z); if (d < 150) continue; put(KT.makeBush(900 + i, { col: i % 2 ? '#7d7e4a' : '#6e7a44', s: 0.8 + rg() * 0.7 }), x, z, -3, rg() * 6); }
    for (let i = 0; i < 14; i++) { const x = 560 + rg() * 700, z = -300 + rg() * 1000, d = sdf(x, z); if (d < 200 || d > 360) continue; put(KT.makeTree(i % 2 ? 'tamarisk' : 'palm', 950 + i, 0.5 + rg() * 0.3), x, z, -3, rg() * 6); } }
  lake.setLevel(o.level); lake.update(0);
  return lake;
}

/* ======================================================================== the gauge pole (the hero prop) */
function numTex(txt, w, h, o) {
  o = Object.assign({ bg: null, fg: '#1d2a44', font: 'bold 150px "Arial Black", Arial, sans-serif', bd: null }, o || {});
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  if (o.bg) { c.fillStyle = o.bg; c.fillRect(0, 0, w, h); } if (o.bd) { c.strokeStyle = o.bd; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); }
  c.fillStyle = o.fg; c.font = o.font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; return t;
}
export function makeGaugePole(o) {
  o = Object.assign({ lo: 208, hi: 215, red: [208.8, 213], record: 214.87 }, o || {});
  const root = G(), W = 220, Ltop = o.lo - 0.4, Lbot = o.hi + 0.2, yTop = yOfLevel(Ltop), yBot = yOfLevel(Lbot);
  const boardM = M('#fbf6e6', '#d8d4e4', 0), wood = M('#8a5a3a', '#b08a7a');
  const bd = box(root, W, yTop - yBot, 22, boardM, [0, (yTop + yBot) / 2, 0], 3, null, 4);
  box(root, 74, yTop - yBot + 60, 46, wood, [0, (yTop + yBot) / 2 - 20, -34], 2.4, null, 4);
  box(root, W + 40, 28, 48, wood, [0, yTop + 14, -6], 2.6, null, 5);
  /* tick + digit planes: one canvas for the upper 2.4 m, one coarse canvas for the rest */
  const mk = (La, Lb, cw, ch) => {
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const c = cv.getContext('2d'), py = ch / ((Lb - La)); // px per metre
    for (let k = Math.ceil(La * 10 - 1e-6); k <= Math.floor(Lb * 10 + 1e-6); k++) { const L = k / 10, y = (L - La) * py, whole = k % 10 === 0, half = k % 5 === 0;
      const len = whole ? 0.34 : half ? 0.25 : 0.15; c.fillStyle = '#1d2a44'; c.fillRect(cw * 0.06, y - (whole ? 3.5 : 2), cw * len, whole ? 7 : 4);
      if (whole) { c.fillStyle = '#d6232a'; c.font = 'bold ' + Math.round(cw * 0.27) + 'px "Arial Black", Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1d2a44'; c.fillText(String(Math.round(L)), cw * 0.70, y + 3); } }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; return t;
  };
  const planes = [[Ltop, 210.0, 0, 2048], [210.0, Lbot, 0, 2048]];
  planes.forEach(([a, b, cw0, ch]) => { const h = (b - a) * U, cw = Math.max(128, Math.min(1024, Math.round((W - 12) * ch / h))), m = new THREE.Mesh(new THREE.PlaneGeometry(W - 12, h), new THREE.MeshBasicMaterial({ map: mk(a, b, cw, ch), transparent: true })); m.position.set(0, yOfLevel(a) - h / 2, 12); root.add(m); });
  /* red lines + labels */
  const redM = [], glow = [], lab = [];
  o.red.forEach((L, i) => {
    if (L > Lbot) { redM.push(null); glow.push(null); lab.push(null); return; }
    const y = yOfLevel(L), m = new THREE.MeshBasicMaterial({ color: '#7a3a3a' }); const bar = new THREE.Mesh(new THREE.BoxGeometry(W + 30, 16, 8), m); bar.position.set(0, y, 15); root.add(bar); redM.push(m);
    const gm = new THREE.MeshBasicMaterial({ color: '#ff3d2a', transparent: true, opacity: 0, depthWrite: false }); const gl = new THREE.Mesh(new THREE.PlaneGeometry(W + 120, 64), gm); gl.position.set(0, y, 16); gl.renderOrder = 6; root.add(gl); glow.push(gm);
    const lm = new THREE.Mesh(new THREE.PlaneGeometry(160, 56), new THREE.MeshBasicMaterial({ map: numTex(L.toFixed(i ? 0 : 1), 256, 90, { bg: '#fff3a0', bd: '#d6232a', font: 'bold 62px "Arial Black", Arial', fg: '#d6232a' }) })); lm.position.set(W / 2 + 120, y, 8); lm.visible = false; root.add(lm); lab.push(lm);
  });
  /* record mark (black triangle + tag) */
  if (o.record != null && o.record <= Lbot) { const y = yOfLevel(o.record), tri = new THREE.Mesh(new THREE.ConeGeometry(26, 40, 3).rotateZ(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#111111' })); tri.position.set(-W / 2 - 18, y, 14); root.add(tri); }
  /* pointer flag + ring + lamp */
  const ptr = G(root), yel = M('#ffd42a', '#d8b050', 0);
  box(ptr, 70, 34, 16, yel, [-W / 2 - 62, 0, 14], 1.8, null, 3); part(ptr, new THREE.ConeGeometry(17, 34, 3).rotateZ(-Math.PI / 2), yel, 1.8, [-W / 2 - 8, 0, 14]);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(120, 3.2, 6, 40).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 })); root.add(ring);
  const lamp = G(root, [0, yTop + 28, -6]); box(lamp, 26, 34, 26, wood, [0, 17, 0], 2, null, 3);
  const lampM = new THREE.MeshBasicMaterial({ color: '#5a1e1e' }); const bulb = part(lamp, ell(31, 31, 31, 18, 12), lampM, 2.6, [0, 62, 0]);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(100, 28), new THREE.MeshBasicMaterial({ color: '#ff4a2a', transparent: true, opacity: 0, depthWrite: false })); halo.position.set(0, 62, 34); halo.renderOrder = 7; lamp.add(halo);
  const pole = {
    root, lamp, anchors: { top: [0, yTop, 0], red1: [0, yOfLevel(o.red[0]), 16], red2: [0, yOfLevel(o.red[1]), 16], record: [0, yOfLevel(o.record), 16], base: [0, yBot, 0], lampTop: [0, yTop + 90, 0] },
    digit: n => [0, yOfLevel(n), 14],
    setLevel(L) { const y = yOfLevel(L); ptr.position.y = y; ring.position.y = y + 2; },
    setRed(i, k) { if (!redM[i]) return; redM[i].color.set(k > 0.01 ? '#ff2a1a' : '#7a3a3a'); redM[i].color.lerp(new THREE.Color('#ffffff'), 0); glow[i].opacity = 0.55 * k; lab[i].visible = k > 0.05; },
    setLamp(k) { lampM.color.set('#5a1e1e').lerp(new THREE.Color('#ff3b22'), k); halo.material.opacity = 0.7 * k; halo.scale.setScalar(0.7 + 0.5 * k); },
    update(t) { const s = 1 + 0.05 * Math.sin(t * 3.1); ring.scale.set(s, 1, s); },
  };
  pole.setLevel(o.level || 209.3); pole.update(0); return pole;
}

/* ======================================================================== the dam gate (sluice) + the outlet river */
export function makeDamGate(o) {
  o = Object.assign({ open: 0, lake: 0 }, o || {});
  const root = G(), conc = M('#cfc7b6', '#b8aec0'), concD = M('#a89f90', '#9a90a4'), steel = M('#5b82ad', '#8aa0c0'), dark = M('#3a3a46', '#6a6a7a', 0), red = M('#d9442e', '#b88080', 0);
  const SILL = -60, RAISE = 340, PLATE_H = 220, PL_Z = 20;
  /* body: piers, wing walls, sill, gantry */
  for (const s of [-1, 1]) { box(root, 70, 440, 150, conc, [s * 120, 50, 20], 3, null, 5); box(root, 360, 300, 150, conc, [s * (155 + 180), -20, 20], 3, null, 5); box(root, 16, 380, 12, dark, [s * 84, 40, 20 - 18], 0, null, 1); box(root, 16, 380, 12, dark, [s * 84, 40, 20 + 18], 0, null, 1);
    box(root, 30, 520, 30, steel, [s * 120, 330, -30], 2.4, null, 3); }
  box(root, 330, 28, 100, steel, [0, 566, -30], 2.6, null, 4);
  box(root, 170, 80, 150, concD, [0, SILL - 40, 20], 3, null, 4);
  /* apron / chute slab */
  const ang = Math.atan2(70, 260); const apron = box(root, 175, 22, 275, conc, [0, SILL - 12 - 35, 20 + 75 + 130], 2.4, [ang, 0, 0], 3);
  /* gate plate + chains + winch */
  const plate = G(root, [0, 0, PL_Z]); box(plate, 164, PLATE_H, 22, steel, [0, SILL + PLATE_H / 2, 0], 2.6, null, 3); for (let i = 0; i < 3; i++) box(plate, 150, 8, 4, dark, [0, SILL + 40 + i * 70, 12], 0, null, 1); box(plate, 40, 30, 28, red, [0, SILL + PLATE_H + 15, 0], 2, null, 3);
  const chains = [-1, 1].map(s => { const c = part(root, new THREE.CylinderGeometry(4, 4, 1, 6), dark, 0); c.position.set(s * 52, 0, PL_Z - 20); return c; });
  const hut = G(root, [0, 580, -30]); box(hut, 120, 70, 90, conc, [0, 35, 0], 2.6, null, 5); part(hut, new THREE.ConeGeometry(0.7071, 1, 4).rotateY(Math.PI / 4).scale(150, 44, 120).translate(0, 22, 0), M('#c4503a', '#9c7a82'), 2.6, [0, 70, 0]);
  /* lever on the right wing wall deck (y = 130) */
  const lev = G(root, [215, 130, 40]); box(lev, 70, 40, 60, concD, [0, 20, 0], 2.4, null, 4); const arm = G(lev, [0, 42, 0]); part(arm, new THREE.CylinderGeometry(6, 6, 120, 8).translate(0, 60, 0), steel, 1.6); part(arm, ell(15, 15, 15, 12, 8), red, 1.6, [0, 124, 0]);
  /* water chute + the outlet river (local coords: lake is -z, downstream +z) */
  const flowM = makeFlowMat({ base: '#4aaed2', light: '#e4f8fb', speed: 2.6, freq: 1.4 }), riverM = makeFlowMat({ base: '#3f9fca', light: '#b8e6f1', speed: 0.5, freq: 1.0 });
  const chute = new THREE.Mesh(new THREE.BufferGeometry(), flowM); chute.frustumCulled = false; root.add(chute);
  const rp = []; for (let z = 1380; z <= 3000; z += 60) { rp.push([riverX(z) - 100, -128 - (z - 1380) * 0.002, z - 1080]); }
  const river = new THREE.Mesh(ribbon(rp, 150, 100), riverM); river.frustumCulled = false; root.add(river);
  let open = 0, lakeY = o.lake;
  const gate = {
    root, anchors: { gap: [0, SILL, PL_Z + 60], lever: [215, 190, 40], walkway: [260, 130, 40], plate: [0, SILL + PLATE_H, PL_Z], outflow: [0, -100, 260], river: [rp[0][0], -128, 300] }, lever: arm,
    get open() { return open; },
    setLake(y) { lakeY = y; this.setOpen(open); },
    setOpen(k) {
      open = k; plate.position.y = RAISE * k; arm.rotation.z = (-0.7 + 1.4 * k) * 1.0;
      const top = SILL + PLATE_H + RAISE * k; chains.forEach(c => { const len = 566 - top; c.scale.y = Math.max(1, len); c.position.y = top + len / 2; });
      const depth = Math.max(0, Math.min(lakeY - SILL, 110)) * Math.min(1, k * 3.2);   // flow depth under the raised plate
      chute.visible = depth > 1;
      if (depth > 1) { const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14, z = 32 + u * 270, top = z < 95 ? SILL : SILL - (z - 95) * 0.269, y = top + 8 + depth * (0.85 - 0.5 * u) + 5 * Math.sin(u * 9); pts.push([0, y, z]); }
        chute.geometry.dispose(); chute.geometry = ribbon(pts, u => (150 + 30 * u), 90); }
      riverM.uniforms.uK.value = 1 + 3 * Math.min(1, k * 3.2);
    },
    update(t) { flowM.uniforms.uT.value = t; riverM.uniforms.uT.value = t; },
  };
  gate.setOpen(o.open); gate.update(0); return gate;
}

/* ======================================================================== flow arrow (cel style, points to +x) */
export function makeFlowArrow(o) {
  o = Object.assign({ len: 220, w: 46, col: '#37a8e6' }, o || {});
  const g = G(), m = M(o.col, '#7ab0d8', 0), sh = o.len * 0.62;
  box(g, sh, o.w * 0.5, 16, m, [sh / 2, 0, 0], 2.4, null, 4);
  const hd = new THREE.ConeGeometry(o.w * 0.8, o.len * 0.4, 3).rotateZ(-Math.PI / 2).scale(1, 1, 0.32);
  part(g, hd, m, 2.4, [sh + o.len * 0.18, 0, 0]);
  return g;
}
function lerpN(a, b, u) { return a + (b - a) * u; }

/* ======================================================================== cut-away side view of the lake (the explaining diorama)
   Local axes: x = north (left) -> south (right), y up (same level map as the world: y = (209 - L) * 300), z = toward the viewer (front glass at z = +100).
   Parts: earth block with the lake bowl and sand bed, water body (setLevel), rain cloud + rain streaks + rain arrows + splash rings (setRain), Jordan inflow ribbon + arrow,
   dam on the south side with a gate plate (setOpen), outflow chute + river + outflow arrows, a gauge pole standing in the water (same factory). update(t). */
export function makeLakeSection(o) {
  o = Object.assign({ level: 209.4 }, o || {});
  const root = G(), D = 200;
  const BED = [[40, 170], [150, 40], [300, -200], [560, -390], [900, -440], [1180, -380], [1320, -250], [1385, -100], [1385, -60], [1420, -60]];
  const SILL = -60, HOLE = 150, XD0 = 1385, XD1 = 1485, XP = 1420;
  const ext = (shape, depth, z0) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(0, 0, z0);
  { const sh = new THREE.Shape(); sh.moveTo(-300, -800); sh.lineTo(-300, 170); BED.slice(0, 8).forEach(p => sh.lineTo(p[0], p[1])); sh.lineTo(1385, -300); sh.lineTo(1485, -300); sh.lineTo(1485, -190); sh.lineTo(2100, -190); sh.lineTo(2100, -800); sh.closePath();
    part(root, ext(sh, D, -D / 2), M('#b88c5c', '#8f6a48'), 3);
    const sand = new THREE.Shape(); BED.slice(0, 8).forEach((p, i) => i ? sand.lineTo(p[0], p[1]) : sand.moveTo(p[0], p[1])); for (let i = 7; i >= 0; i--) sand.lineTo(BED[i][0], BED[i][1] - 34); sand.closePath();
    part(root, ext(sand, D + 3, -D / 2 - 1), M('#ecd49a', '#c8b07a', 0), 0);
    const gr = new THREE.Shape(); gr.moveTo(-300, 170); gr.lineTo(40, 170); gr.lineTo(150, 40); gr.lineTo(150, 12); gr.lineTo(40, 140); gr.lineTo(-300, 140); gr.closePath();
    part(root, ext(gr, D + 3, -D / 2 - 1), M('#79b84e', '#5f9a44', 0), 0);
    const gr2 = new THREE.Shape(); gr2.moveTo(1485, -150); gr2.lineTo(2100, -150); gr2.lineTo(2100, -190); gr2.lineTo(1485, -190); gr2.closePath(); part(root, ext(gr2, D + 3, -D / 2 - 1), M('#d9c48a', '#b8a470', 0), 0); }
  const conc = M('#d4ccbb', '#b8aec0'), steel = M('#5b82ad', '#8aa0c0'), dark = M('#2a3440', '#2a3440', 0);
  box(root, XD1 - XD0, 240, D, conc, [(XD0 + XD1) / 2, SILL - 120, 0], 3, null, 4);
  box(root, XD1 - XD0, 80, D, conc, [(XD0 + XD1) / 2, HOLE + 40, 0], 3, null, 4);
  box(root, XD1 - XD0, HOLE - SILL, 10, dark, [(XD0 + XD1) / 2, (HOLE + SILL) / 2, -D / 2 + 5], 0, null, 1);
  for (const x of [XD0 + 12, XD1 - 12]) box(root, 18, 210, 18, steel, [x, 335, 60], 2.4, null, 3);
  box(root, XD1 - XD0 + 20, 20, 40, steel, [(XD0 + XD1) / 2, 440, 60], 2.4, null, 3);
  const plate = G(root, [XP, 0, 0]); box(plate, 26, HOLE - SILL + 12, D - 8, steel, [0, (HOLE + SILL) / 2 + 6, 0], 2.6, null, 3); for (let i = 0; i < 3; i++) box(plate, 6, 8, D - 20, dark, [14, SILL + 40 + i * 55, 0], 0, null, 1);
  const chains = [-1, 1].map(s_ => { const c = part(root, new THREE.CylinderGeometry(3.5, 3.5, 1, 6), dark, 0); c.position.set(XP + s_ * 8, 0, 60 + s_ * 20); return c; });
  box(root, 415, 20, D, M('#b98a58', '#c8a88e'), [1692, 225, 0], 2.4, null, 3); for (const x of [1610, 1880]) box(root, 18, 410, 18, M('#6e4a2c', '#9a7a66'), [x, 20, 88], 2, null, 3);
  const lev = G(root, [1455, 232, 100]); part(lev, new THREE.CylinderGeometry(6, 6, 100, 8).translate(0, 50, 0), steel, 1.6); part(lev, ell(14, 14, 14, 12, 8), M('#d9442e', '#b88080', 0), 1.6, [0, 104, 0]);
  const wmat = new THREE.ShaderMaterial({ uniforms: { uA: { value: col('#8fe4e2') }, uB: { value: col('#2c93b4') } }, vertexShader: 'varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 uA, uB; varying float vY; void main(){ float k = clamp((vY + 450.0) / 540.0, 0.0, 1.0); k = floor(k * 5.0) / 5.0; gl_FragColor = vec4(mix(uB, uA, k), 1.0); }' });
  const water = new THREE.Mesh(new THREE.BufferGeometry(), wmat); root.add(water);
  const foam = new THREE.Mesh(new THREE.BoxGeometry(1, 7, 3), new THREE.MeshBasicMaterial({ color: '#ffffff' })); root.add(foam);
  const jet = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#5fc4e0' })); root.add(jet);
  const flowA = makeFlowMat({ base: '#43aed0', light: '#d4f2f8', speed: 1.1, freq: 1.2 }), flowB = makeFlowMat({ base: '#43aed0', light: '#d4f2f8', speed: 0.9, freq: 1.2 });
  { const pts = []; for (let x = -280; x <= 150; x += 30) { const y = x < 40 ? 172 : 170 - (x - 40) * (130 / 110); pts.push([x, y + 4, 40]); } const rb = new THREE.Mesh(ribbon(pts, 70, 100), flowA); rb.frustumCulled = false; root.add(rb); }
  const outPts = []; for (let x = 1485; x <= 2100; x += 40) { const y = x < 1700 ? lerpN(-48, -128, (x - 1485) / 215) : -128; outPts.push([x, y, 10]); }
  const outR = new THREE.Mesh(ribbon(outPts, 150, 100), flowB); outR.frustumCulled = false; root.add(outR);
  const cloud = G(root, [480, 790, 0]); [[0, 0, 3.4, '#b3bcc8'], [-420, 40, 2.6, '#a9b3c0']].forEach(([x, y, sc, c], i) => { const c1 = KT.makeCloud(70 + i, { s: sc * 0.7, col: c, tint: '#8a96aa' }); c1.position.set(x, y, 0); cloud.add(c1); });
  const NS = 110, rs = new THREE.InstancedMesh(new THREE.BoxGeometry(4, 64, 4), new THREE.MeshBasicMaterial({ color: '#dbe8f2' }), NS); rs.frustumCulled = false; root.add(rs);
  const rr = rng(5), rain = []; for (let i = 0; i < NS; i++) rain.push([180 + rr() * 800, -90 + rr() * 180, rr(), 0.8 + rr() * 0.5]);
  const NR2 = 40, rg = new THREE.InstancedMesh(new THREE.RingGeometry(0.72, 1, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, depthWrite: false }), NR2); rg.frustumCulled = false; root.add(rg);
  const rings = []; for (let i = 0; i < NR2; i++) rings.push([250 + rr() * 950, -85 + rr() * 170, rr()]);
  const arrR = [260, 520, 780].map(x => { const a = makeFlowArrow({ len: 200, w: 52, col: '#2f9be0' }); a.rotation.z = -Math.PI / 2; a.position.set(x, 600, 104); root.add(a); return a; });
  const arrJ = makeFlowArrow({ len: 240, w: 52, col: '#2f9be0' }); arrJ.position.set(-250, 300, 104); root.add(arrJ);
  const arrO = [1620, 1780, 1930].map(x => { const a = makeFlowArrow({ len: 200, w: 52, col: '#2f9be0' }); a.position.set(x, 10, 104); root.add(a); return a; });
  const pole = makeGaugePole({ lo: 207.3, hi: 210.6, record: null, level: o.level }); pole.root.position.set(1020, 0, 40); root.add(pole.root);
  let level = o.level, rainK = 0, open = 0;
  const dm = new THREE.Object3D();
  const yw = () => yOfLevel(level);
  const ND = 36, dashNow = new THREE.InstancedMesh(new THREE.BoxGeometry(26, 6, 3), new THREE.MeshBasicMaterial({ color: '#ffd42a' }), ND), upM = new THREE.MeshBasicMaterial({ color: '#a8504a' }), dashUp = new THREE.InstancedMesh(new THREE.BoxGeometry(26, 7, 3), upM, ND);
  dashNow.frustumCulled = dashUp.frustumCulled = false; dashNow.renderOrder = dashUp.renderOrder = 8; root.add(dashNow, dashUp);
  const rise = makeFlowArrow({ len: 200, w: 40, col: '#ffd42a' }); rise.rotation.z = Math.PI / 2; rise.position.set(1190, 0, 106); root.add(rise);
  const UPY = yOfLevel(208.8);
  function buildWater() {
    const Yw = yw(); let i0 = 0; while (i0 < BED.length - 1 && !(BED[i0][1] >= Yw && BED[i0 + 1][1] < Yw)) i0++;
    const a = BED[i0], b = BED[i0 + 1], xl = a[0] + (b[0] - a[0]) * (a[1] - Yw) / (a[1] - b[1]);
    const sh = new THREE.Shape(); sh.moveTo(xl, Yw); for (let i = i0 + 1; i < BED.length; i++) sh.lineTo(BED[i][0], BED[i][1] - 4); sh.lineTo(XP, Yw); sh.closePath();
    water.geometry.dispose(); water.geometry = new THREE.ExtrudeGeometry(sh, { depth: D - 8, bevelEnabled: false }).translate(0, 0, -(D - 8) / 2);
    foam.scale.set(XP - xl, 1, 1); foam.position.set((XP + xl) / 2, Yw, (D - 8) / 2 + 0.5);
    for (let i = 0; i < ND; i++) { const x = xl + 10 + i * 36, on = x < XP - 20 ? 1 : 0.001; dm.position.set(x, Yw + 1, 102); dm.scale.set(on, on, on); dm.rotation.set(0, 0, 0); dm.updateMatrix(); dashNow.setMatrixAt(i, dm.matrix);
      const xu = 150 + i * 36, onu = xu < XP - 20 ? 1 : 0.001; dm.position.set(xu, UPY, 102); dm.scale.set(onu, onu, onu); dm.updateMatrix(); dashUp.setMatrixAt(i, dm.matrix); }
    dashNow.instanceMatrix.needsUpdate = dashUp.instanceMatrix.needsUpdate = true;
    const gap = UPY - Yw; rise.visible = gap > 24; rise.position.y = Yw + 6; rise.scale.set(Math.max(0.05, (gap - 14) / 200), 1, 1);
  }
  const sec = {
    root, pole, anchors: { surface: [700, 0, 0], poleBase: [1020, 0, 40], dam: [1435, 100, 0], plate: [XP, 100, 0], river: [1900, -128, 10], north: [-150, 170, 100], lever: [1455, 330, 100], deck: [1650, 235, 100] }, XD0, XD1, XP,
    level: () => level, surfaceY: yw,
    setLevel(L) { level = L; buildWater(); pole.setLevel(L); this.setOpen(open); },
    setRain(k) { rainK = k; },
    setUpper(k) { upM.color.set('#a8504a').lerp(new THREE.Color('#ff2a1a'), k); },
    setOpen(k) { open = k; const Yw = yw(), raise = 215 * k; plate.position.y = raise; lev.rotation.z = -0.7 + 1.4 * k;
      const top = HOLE + 12 + raise; chains.forEach(c => { const len = 440 - top; c.scale.y = Math.max(1, len); c.position.y = top + len / 2; });
      const h = Math.max(0, Math.min(Yw - SILL, raise)) * 0.85; jet.visible = h > 2; jet.scale.set(XD1 - XP - 4, Math.max(1, h), D - 14); jet.position.set((XP + XD1) / 2 + 2, SILL + h / 2, 0);
      flowB.uniforms.uK.value = 1 + 2.5 * Math.min(1, k * 3.2); },
    update(t) {
      const Yw = yw(); flowA.uniforms.uT.value = t; flowB.uniforms.uT.value = t;
      cloud.visible = rainK > 0.02; cloud.position.y = 790 + 8 * Math.sin(t * 0.7);
      for (let i = 0; i < NS; i++) { const r = rain[i], on = r[2] < rainK, u = frac(r[2] * 3 + t * r[3] * 1.3), y = lerpN(700, Yw, u), s1 = on ? 1 : 0.001; dm.position.set(r[0], y, r[1]); dm.scale.set(s1, s1, s1); dm.updateMatrix(); rs.setMatrixAt(i, dm.matrix); }
      rs.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < NR2; i++) { const r = rings[i], on = r[2] < rainK, u = frac(t * 0.9 + r[2] * 7), s_ = on ? 6 + 30 * u : 0.001; dm.position.set(r[0], Yw + 4, r[1]); dm.scale.set(s_, 1, s_); dm.updateMatrix(); rg.setMatrixAt(i, dm.matrix); }
      rg.instanceMatrix.needsUpdate = true;
      arrR.forEach((a, i) => { a.visible = rainK > 0.05; a.position.y = 570 + 35 * Math.sin(t * 3 + i * 1.7); a.scale.setScalar(0.9 + 0.12 * Math.sin(t * 3 + i)); });
      arrJ.position.x = -260 + 30 * Math.sin(t * 2.2); arrJ.scale.setScalar(0.95 + 0.08 * Math.sin(t * 2.2));
      arrO.forEach((a, i) => { a.visible = open > 0.15; a.position.x = [1620, 1780, 1930][i] + 40 * frac(t * 0.8 + i * 0.33); a.scale.setScalar(0.9); a.position.y = lerpN(-30, -90, i / 2); });
      pole.update(t);
    },
  };
  sec.setLevel(o.level); sec.update(0); return sec;
}


/* ======================================================================== FILM D ADDITIONS (appended 01/11): level tank, lake top view, classrooms, calendar, sun, glasses, desal, coast map, pump */
const MB = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const lerpK = (a, b, u) => a + (b - a) * u;
export function numPlane(txt, w, h, o) {
  o = Object.assign({ fg: '#1d2a44', bg: null, bd: null }, o || {});
  const cw = 512, ch = Math.max(64, Math.round(512 * h / w)), mk = s => numTex(s, cw, ch, Object.assign({}, o, { font: 'bold ' + Math.round(Math.min(ch * (o.k || 0.74), 560 / (0.82 * Math.max(3, s.length)))) + 'px "Arial Black", Arial, sans-serif' }));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: mk(txt), transparent: true, depthWrite: false })); m.renderOrder = 9; let cur = txt;
  m.userData.setText = s => { s = String(s); if (s === cur) return; cur = s; m.material.map.dispose(); m.material.map = mk(s); };
  return m;
}
function clipBelow(poly, Y) { const out = []; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], ia = a[1] <= Y, ib = b[1] <= Y; if (ia) out.push(a); if (ia !== ib) { const u = (Y - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * u, Y]); } } return out; }

/* the lake as a glass-front cut-away tank holding the FULL gauge pole (208 top .. 215 bottom). Local: x west->east, y = level map, z toward the viewer. */
export function makeLevelTank(o) {
  o = Object.assign({ level: 209.4 }, o || {});
  const root = G(), D = 200, BX0 = -1500, BX1 = 1750;
  const BED = [[BX0, 700], [-1100, 700], [-760, 120], [-520, -700], [-360, -1500], [-150, -1870], [180, -1930], [330, -1900], [420, -1700], [520, -1905], [760, -1800], [1000, -900], [1150, -150], [1300, 500], [BX1, 500]];
  const ext = (shape, depth, z0) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(0, 0, z0);
  { const sh = new THREE.Shape(); sh.moveTo(BX0, -2300); BED.forEach(p => sh.lineTo(p[0], p[1])); sh.lineTo(BX1, -2300); sh.closePath(); part(root, ext(sh, D, -D / 2), M('#b88c5c', '#8f6a48'), 3);
    const skin = (i0, i1, c, off) => { const s = new THREE.Shape(); for (let i = i0; i <= i1; i++) i === i0 ? s.moveTo(BED[i][0], BED[i][1]) : s.lineTo(BED[i][0], BED[i][1]); for (let i = i1; i >= i0; i--) s.lineTo(BED[i][0], BED[i][1] - off); s.closePath(); part(root, ext(s, D + 3, -D / 2 - 1), M(c, '#b8b090', 0), 0); };
    const ePoly = [[BX0, -2300]].concat(BED, [[BX1, -2300]]);
    const band = (y0, y1) => { let q = clipBelow(ePoly, y1); if (q.length < 3) return; q = clipBelow(q.map(a => [a[0], -a[1]]), -y0).map(a => [a[0], -a[1]]); if (q.length < 3) return; part(root, ext(new THREE.Shape(q.map(a => new THREE.Vector2(a[0], a[1]))), D + 2, -D / 2 - 1), M('#a2743f', '#8a6040', 0), 0); };
    for (let y = -2300; y < 700; y += 560) { band(y + 80, y + 290); }
    skin(1, BED.length - 2, '#ecd49a', 46); skin(0, 1, '#79b84e', 40); skin(BED.length - 2, BED.length - 1, '#79b84e', 40); }
  /* water */
  const wmat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uA: { value: col('#8fe4e2') }, uB: { value: col('#2c93b4') }, uS: { value: 0 }, uC: { value: col('#8a9c92') } },
    vertexShader: 'varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 uA, uB, uC; uniform float uS; varying float vY; void main(){ float k = clamp((vY + 2000.0) / 2400.0, 0.0, 1.0); k = floor(k * 6.0) / 6.0; vec3 c = mix(uB, uA, k); c = mix(c, uC, uS * 0.8); gl_FragColor = vec4(c, 0.66); }' });
  const water = new THREE.Mesh(new THREE.BufferGeometry(), wmat); water.renderOrder = 3; root.add(water);
  const foam = new THREE.Mesh(new THREE.BoxGeometry(1, 7, 3), MB('#ffffff')); foam.renderOrder = 4; root.add(foam);
  const abov = BED.concat([[BX1, 4000], [BX0, 4000]]);
  let level = o.level, lastY = 1e9;
  /* red + black dashed lines across the glass */
  const dashes = (L, c0, c1) => { const n = 58, im = new THREE.InstancedMesh(new THREE.BoxGeometry(34, 8, 4), MB(c0), n); im.frustumCulled = false; im.renderOrder = 6; const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { m4.makeTranslation(BX0 + 30 + i * 56, yOfLevel(L), 104); im.setMatrixAt(i, m4); } root.add(im); return { im, c0: col(c0), c1: col(c1) }; };
  const redD = [dashes(208.8, '#a8504a', '#ff2a1a'), dashes(213, '#a8504a', '#ff2a1a')], recD = dashes(214.87, '#555555', '#111111');
  recD.im.visible = false;
  const pole = makeGaugePole({ level: o.level }); pole.root.position.set(0, 0, 135); root.add(pole.root);
  const rtag = numPlane('214.87', 260, 80, { bg: '#fffbe0', bd: '#111111', fg: '#111111' }); rtag.position.set(360, yOfLevel(214.87), 140); rtag.visible = false; root.add(rtag);
  const read = numPlane('209.00', 250, 78, { bg: '#fff3a0', bd: '#1d2a44', fg: '#1d2a44' }); read.position.set(320, 0, 140); read.visible = false; root.add(read);
  /* two salty springs on the bed + bubbles */
  const SP = [[-330, -1500], [700, -1790]]; const spM = M('#c9cdd0', '#9aa0a8'); SP.forEach(p => part(root, new THREE.ConeGeometry(46, 56, 10).translate(0, 28, 0), spM, 2.2, [p[0], p[1] - 4, 0]));
  const NB = 44, bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), MB('#eef2f2', { transparent: true, opacity: 0.9 }), NB); bub.frustumCulled = false; bub.renderOrder = 5; root.add(bub);
  let springK = 0, saltK = 0; const dm = new THREE.Object3D();
  function build() {
    const Yw = yOfLevel(level); if (Math.abs(Yw - lastY) < 0.4) return; lastY = Yw;
    const poly = clipBelow(abov, Yw); if (poly.length < 3) { water.visible = false; return; } water.visible = true;
    const sh = new THREE.Shape(poly.map(p => new THREE.Vector2(p[0], p[1]))); water.geometry.dispose(); water.geometry = ext(sh, D - 8, -(D - 8) / 2);
    let xl = 1e9, xr = -1e9; poly.forEach(p => { if (Math.abs(p[1] - Yw) < 0.01) { xl = Math.min(xl, p[0]); xr = Math.max(xr, p[0]); } });
    foam.visible = xr > xl; foam.scale.set(Math.max(1, xr - xl), 1, 1); foam.position.set((xl + xr) / 2, Yw, (D - 8) / 2 + 1);
  }
  const tank = {
    root, pole, BED, SP, anchors: { surface: [0, 0, 0] }, level: () => level, surfaceY: () => yOfLevel(level),
    setLevel(L) { level = L; build(); pole.setLevel(L); read.position.y = yOfLevel(L) + 0; },
    setRed(i, k) { pole.setRed(i, k); const d = redD[i]; d.im.visible = k > 0.02; d.im.material.color.copy(d.c0).lerp(d.c1, k); },
    setRecord(k) { recD.im.visible = k > 0.02; rtag.visible = k > 0.02; recD.im.material.color.copy(recD.c0).lerp(recD.c1, k); },
    setReading(on) { read.visible = !!on; },
    setSprings(k) { springK = k; }, setSalt(k) { saltK = k; wmat.uniforms.uS.value = k; },
    update(t) { build(); pole.update(t); if (read.visible) read.userData.setText(level.toFixed(2));
      const Yw = yOfLevel(level);
      for (let i = 0; i < NB; i++) { const sp = SP[i % 2], ph = frac(i * 0.137 + t * 0.35 + (i % 2) * 0.4), y0 = sp[1] + 60, y = y0 + (Yw - y0) * ph, on = springK > 0.05 && y < Yw - 4 ? 1 : 0, s = on * (7 + 6 * ((i * 7) % 5) / 4) * springK;
        dm.position.set(sp[0] + 24 * Math.sin(ph * 14 + i), y, 10 * Math.sin(i * 3.1)); dm.scale.setScalar(Math.max(0.001, s)); dm.updateMatrix(); bub.setMatrixAt(i, dm.matrix); }
      bub.instanceMatrix.needsUpdate = true; },
  };
  tank.setLevel(o.level); tank.update(0); return tank;
}

/* top view of the lake (same outline as the gold outline): water shrinks with the level, bright sheet reveal north->south, islands */
export function makeLakeTop(o) {
  o = Object.assign({}, o || {}); const root = G();
  const OLN = KINNERET_OUTLINE, xy = s => OLN.map(p => new THREE.Vector2(p[0] * s, -p[1] * s));
  box(root, 24000, 40, 16000, M('#8fc45e', '#6aa845'), [4500, -24, 0], 0, null, 2);
  box(root, 2400, 40, 3400, M('#9ccd66', '#78b04c'), [0, -22, 0], 3, null, 8);
  { const r = rng(9), hm = [M('#7cb552', '#5f9a44'), M('#6aa845', '#548a3a')], pc = ['#a9d472', '#86bc58', '#c4d98a', '#7eb04e'];
    const okp = () => { let x, z, k = 0; do { x = -3800 + r() * 4600; z = -3300 + r() * 6600; k++; } while (!((x < -950) || (Math.abs(x) < 800 && Math.abs(z) > 1300)) && k < 80); return [x, z]; };
    for (let i = 0; i < 12; i++) { const p = okp(); box(root, 500 + r() * 700, 2, 260 + r() * 500, M(pc[i % 4], '#78a05a', 0), [p[0], -3, p[1]], 0, null, 1); }
    for (let i = 0; i < 26; i++) { const p = okp(), rr = 190 + r() * 280; part(root, ell(rr, rr * 0.4, rr * 0.8, 18, 10), hm[i % 2], 2.6, [p[0], -6, p[1]]); }
    for (let i = 0; i < 34; i++) { const p = okp(), tr = KT.makeTree(i % 3 ? 'pine' : 'tamarisk', 300 + i, 1.3 + r() * 0.9); tr.position.set(p[0], -4, p[1]); root.add(tr); } }
  const beach = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(xy(1.12))).rotateX(-Math.PI / 2), MB('#ecd49a')); beach.position.y = 1; root.add(beach);
  const wat = new THREE.Mesh(new THREE.BufferGeometry(), MB('#2f9cc0')); wat.position.y = 2; root.add(wat);
  const wat2 = new THREE.Mesh(new THREE.BufferGeometry(), MB('#5fbfd6')); wat2.position.y = 3; root.add(wat2);
  const edge = new THREE.Mesh(new THREE.BufferGeometry(), MB('#1d2a44')); edge.position.y = 4; root.add(edge);
  const gold = new THREE.Mesh(new THREE.BufferGeometry(), MB('#ffd42a')); gold.position.y = 5; root.add(gold); gold.visible = false;
  const sheetM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uZ: { value: -1200 }, uT: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uZ, uT; varying vec3 vP; void main(){ if (vP.z > uZ) discard; float e = smoothstep(0.0, 60.0, uZ - vP.z); float s = step(0.5, fract((vP.x + vP.z) * 0.012 - uT * 0.4)); gl_FragColor = vec4(mix(vec3(0.62, 0.93, 1.0), vec3(0.42, 0.85, 1.0), s * 0.5), 0.88); }' });
  const sheet = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(xy(0.975))).rotateX(-Math.PI / 2), sheetM); sheet.position.y = 8; sheet.visible = false; root.add(sheet);
  const ringGeo = s => { const pts = OLN.map(p => [p[0] * s, 0, p[1] * s]); pts.push(pts[0]); return ribbon(pts, 26, 100); };
  let shr = -1;
  const isl = [[-120, -120, 80], [140, -260, 62], [260, 160, 90], [-240, 320, 70], [60, 520, 76]].map((p, i) => { const g = G(root, [p[0], 3, p[1]]); part(g, ell(p[2], 20, p[2] * 0.8, 20, 10), M('#a7845a', '#7a5a3a'), 2.4); part(g, ell(p[2] * 0.7, 10, p[2] * 0.55, 16, 8), M('#8fbf5a', '#6a9a46', 0), 0, [0, 12, 0]); g.scale.setScalar(0.001); return g; });
  const top = {
    root, sheet, anchors: { north: [0, 0, -1000], south: [100, 0, 1000], center: [0, 0, 0] },
    setShrink(s) { s = Math.round(s * 500) / 500; if (s === shr) return; shr = s; const g1 = new THREE.ShapeGeometry(new THREE.Shape(xy(s))).rotateX(-Math.PI / 2), g2 = new THREE.ShapeGeometry(new THREE.Shape(xy(s * 0.78))).rotateX(-Math.PI / 2);
      wat.geometry.dispose(); wat.geometry = g1; wat2.geometry.dispose(); wat2.geometry = g2; edge.geometry.dispose(); edge.geometry = ringGeo(s); gold.geometry.dispose(); gold.geometry = ringGeo(1.01); },
    setGold(k) { gold.visible = k > 0.02; },
    setSheet(u) { sheet.visible = u > 0.001 && u < 1.5; sheetM.uniforms.uZ.value = lerpK(-1180, 1180, Math.min(1, u)); },
    setIslands(k) { isl.forEach((g, i) => g.scale.setScalar(Math.max(0.001, sm(cl(k * 1.5 - i * 0.2, 0, 1))))); },
    islandAt: i => [[-120, -120], [140, -260], [260, 160], [-240, 320], [60, 520]][i],
    update(t) { sheetM.uniforms.uT.value = t; },
  };
  top.setShrink(1); return top;
}

/* classroom: glass box with an inner water volume (fill 0..1) */
export function makeClassroom(o) {
  o = Object.assign({ w: 130, h: 80, d: 100, fill: 0 }, o || {}); const g = G(), { w, h, d } = o;
  box(g, w + 16, 8, d + 16, M('#d9cfae', '#b8b090'), [0, -4, 0], 2, null, 2);
  const wm = part(g, new THREE.BoxGeometry(w - 8, h - 8, d - 8).translate(0, (h - 8) / 2, 0), MB('#3aa9d6', { transparent: true, opacity: 0.58, depthWrite: false }), 0, [0, 2, 0]); wm.renderOrder = 4;
  const gm = new THREE.MeshBasicMaterial({ color: '#cfeaf5', transparent: true, opacity: 0.22, depthWrite: false }), ink = MB('#1d2a44'), tk = Math.max(2.5, w * 0.018);
  box(g, w, h, d, gm, [0, h / 2, 0], 0, null, 1);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(tk, h, tk), ink); e.position.set(sx * w / 2, h / 2, sz * d / 2); g.add(e); }
  for (const sy of [0, 1]) for (const sz of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(w, tk, tk), ink); e.position.set(0, sy * h, sz * d / 2); g.add(e); }
  for (const sy of [0, 1]) for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(tk, tk, d), ink); e.position.set(sx * w / 2, sy * h, 0); g.add(e); }
  box(g, 5, h * 0.56, w * 0.17, M('#7a4a2c', '#a07a64', 0), [-w * 0.29, h * 0.28, d / 2 + 3], 0, null, 1); box(g, w * 0.26, h * 0.3, 5, M('#9fd1ee', '#7aa0c0', 0), [w * 0.22, h * 0.56, d / 2 + 3], 0, null, 1);
  const r = { root: g, setFill(k) { wm.visible = k > 0.01; wm.scale.y = Math.max(0.001, cl(k, 0, 1)); } }; r.setFill(o.fill); return r;
}
export function makeClassRows(o) {
  o = Object.assign({ cols: 6, rows: 4, dx: 180, dz: 160, w: 130, h: 80, d: 100 }, o || {}); const root = G(), rooms = [];
  for (let i = 0; i < o.cols * o.rows; i++) { const c = makeClassroom(o), cx = i % o.cols, cz = Math.floor(i / o.cols); c.root.position.set((cx - (o.cols - 1) / 2) * o.dx, 0, (cz - (o.rows - 1) / 2) * o.dz); root.add(c.root); rooms.push(c); }
  return { root, rooms, n: rooms.length, setAppear(k) { rooms.forEach((c, i) => { const s = sm(cl(k - i, 0, 1)); c.root.visible = s > 0.01; c.root.scale.setScalar(Math.max(0.001, s)); }); }, setFill(k) { rooms.forEach((c, i) => c.setFill(cl(k - i, 0, 1))); }, at: i => rooms[i].root.position };
}

/* tear-off calendar: pages flip up and away; each page shows a number plane */
export function makeCalendar(o) {
  o = Object.assign({ n: 8, texts: null }, o || {}); const root = G(), N = o.n, board = M('#d9442e', '#b88080', 0);
  box(root, 380, 520, 36, board, [0, 0, -16], 3, null, 6); box(root, 60, 30, 40, M('#444a58', '#808898'), [0, 266, -12], 2, null, 4);
  const cards = [];
  for (let i = 0; i < N; i++) { const pv = G(root, [0, 215, (N - i) * 2.2]); const card = G(pv, [0, -200, 0]);
    box(card, 330, 420, 4, M('#fffdf5', '#d8d4e4', 0), [0, 0, 0], 1.6, null, 1); box(card, 330, 70, 5, M('#d6232a', '#b88080', 0), [0, 175, 1], 0, null, 1);
    const np = numPlane(o.texts ? o.texts[i] : String(i + 1), 280, 190, { k: 0.8 }); np.position.set(0, -20, 4); card.add(np); cards.push({ pv, np }); }
  return { root, cards, setTexts(a) { cards.forEach((c, i) => c.np.userData.setText(a[i] != null ? a[i] : '')); },
    flip(k) { cards.forEach((c, i) => { const u = sm(cl(k - i, 0, 1)); c.pv.rotation.x = -Math.PI * u; c.pv.position.y = 215 + 160 * u; c.pv.visible = u < 0.985; }); } };
}
export function makeSun(o) {
  o = Object.assign({ r: 150 }, o || {}); const g = G(), y = M('#ffd42a', '#e8b030', 0), o2 = M('#ff9a2a', '#d08040', 0);
  part(g, ell(o.r, o.r, o.r * 0.45, 28, 18), y, 3.4); part(g, ell(o.r * 0.72, o.r * 0.72, o.r * 0.5, 22, 14), M('#ffe468', '#e8c050', 0), 0, [0, 0, o.r * 0.12]);
  const rays = G(g); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = G(rays); r.rotation.z = a; part(r, new THREE.ConeGeometry(o.r * 0.17, o.r * 0.5, 3).translate(0, o.r * 1.32, 0), i % 2 ? o2 : y, 2.4); }
  g.userData.update = t => { rays.rotation.z = t * 0.25; }; return g;
}
export function makeVapour(o) {
  o = Object.assign({ n: 30, w: 900, h: 700, seed: 5 }, o || {}); const g = G(), r = rng(o.seed), im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), MB('#ffffff', { transparent: true, opacity: 0.55, depthWrite: false }), o.n);
  im.frustumCulled = false; im.renderOrder = 7; g.add(im); const it = []; for (let i = 0; i < o.n; i++) it.push([(r() - 0.5) * o.w, r(), r() * 6.28, 24 + r() * 30]); const dm = new THREE.Object3D(); let K = 1;
  g.userData.setK = k => { K = k; };
  g.userData.update = t => { it.forEach(([x, p, ph, s], i) => { const u = frac(p + t * 0.16), a = Math.sin(u * Math.PI); dm.position.set(x + 40 * Math.sin(u * 9 + ph), u * o.h, 30 * Math.sin(ph)); dm.scale.set(s * a * K + 0.001, s * 1.5 * a * K + 0.001, s * a * K + 0.001); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); }); im.instanceMatrix.needsUpdate = true; };
  return g;
}
export function makeSeasonCard(kind) {
  const g = G(), win = kind === 'winter'; box(g, 460, 340, 24, M(win ? '#7f96ae' : '#8fd0f2', '#6a7a92', 0), [0, 0, 0], 3, null, 8);
  if (win) { const c = KT.makeCloud(41, { s: 1.0, col: '#c8d0dc', tint: '#8a96aa' }); c.position.set(0, 40, 16); g.add(c); for (let i = 0; i < 5; i++) box(g, 6, 60, 4, M('#9fd0f5', '#7aa0c0', 0), [-130 + i * 65, -90, 16], 0.8, null, 1); }
  else { const s = makeSun({ r: 80 }); s.position.set(0, 10, 20); g.add(s); g.userData.sun = s; }
  return g;
}
export function makeThermo() {
  const g = G(); box(g, 40, 300, 22, M('#fffdf5', '#d8d4e4', 0), [0, 150, 0], 2.4, null, 8); part(g, ell(40, 40, 28, 16, 12), M('#fffdf5', '#d8d4e4', 0), 2.4, [0, 0, 0]);
  const red = M('#e23a2a', '#b06a60', 0), col_ = part(g, new THREE.BoxGeometry(14, 1, 8).translate(0, 0.5, 0), red, 0, [0, 20, 14]); part(g, ell(26, 26, 18, 14, 10), red, 0, [0, 0, 10]);
  g.userData.setTemp = k => { col_.scale.y = Math.max(1, 240 * cl(k, 0, 1)); }; g.userData.setTemp(0.3); return g;
}
export function makeSaltCube() {
  const g = G(); box(g, 70, 70, 70, M('#ffffff', '#d8dcec', 0), [0, 0, 0], 2.6, [0.4, 0.6, 0], 6);
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4, s = new THREE.Mesh(new THREE.PlaneGeometry(14, 52), MB('#fff6a0')); s.position.set(Math.cos(a) * 80, Math.sin(a) * 80, 40); s.rotation.z = a + Math.PI / 2; g.add(s); } return g;
}

/* glass pair (one full, one half empty) and a salt spoon on a holder */
export function makeSaltGlasses() {
  const g = G(), glassM = new THREE.MeshBasicMaterial({ color: '#d8eef7', transparent: true, opacity: 0.3, depthWrite: false });
  const mk = (x, fh) => { const gg = G(g, [x, 0, 0]); part(gg, new THREE.CylinderGeometry(76, 62, 250, 24).translate(0, 125, 0), glassM, 0); const rim = new THREE.Mesh(new THREE.TorusGeometry(76, 3.2, 6, 28).rotateX(Math.PI / 2), MB('#1d2a44')); rim.position.y = 250; gg.add(rim); const rb = new THREE.Mesh(new THREE.TorusGeometry(62, 3.2, 6, 28).rotateX(Math.PI / 2), MB('#1d2a44')); gg.add(rb);
    const wm = M('#5fc2e8', '#3a86a8', 0), w = part(gg, new THREE.CylinderGeometry(72, 61, fh, 24).translate(0, fh / 2, 0), wm, 0, [0, 6, 0]); return { w, wm, fh }; };
  const A = mk(-170, 215), B = mk(170, 112);
  const post = M('#6e4a2c', '#9a7a66'), steel = M('#8a9cb4', '#a8b4c8'); box(g, 36, 380, 36, post, [0, 190, -120], 2.4, null, 4); box(g, 480, 20, 20, post, [0, 380, -120], 2.2, null, 3);
  const spoon = G(g, [-170, 330, -60]); part(spoon, new THREE.CylinderGeometry(5, 5, 130, 8).translate(0, 0, 0).rotateZ(Math.PI / 2).translate(-60, 0, 0), steel, 1.6); part(spoon, ell(32, 14, 26, 14, 8), steel, 1.8, [18, 0, 0]);
  const NG = 36, gr = new THREE.InstancedMesh(new THREE.BoxGeometry(7, 7, 7), MB('#ffffff'), NG); gr.frustumCulled = false; g.add(gr); const dm = new THREE.Object3D(); let tip = 0, salt = 0, T_ = 0;
  const lo = col('#5fc2e8'), hiA = col('#7fb2c8'), hiB = col('#3a6070');
  const o = { root: g, glasses: [-170, 170],
    setTip(k) { tip = k; spoon.rotation.z = -0.9 * k; }, setSpoonX(x) { spoon.position.x = x; },
    setSalt(k) { salt = k; A.wm.uniforms.uColor.value.copy(lo).lerp(hiA, k); B.wm.uniforms.uColor.value.copy(lo).lerp(hiB, k); },
    update(t) { T_ = t; const sx = spoon.position.x; for (let i = 0; i < NG; i++) { const ph = frac(i * 0.171 + t * 0.9), on = tip > 0.45 ? 1 : 0, y = 320 - ph * (sx < 0 ? 100 : 100); dm.position.set(sx + 22 + 10 * Math.sin(i * 2.3), y, -60 + 8 * Math.cos(i * 1.7)); dm.scale.setScalar(on ? 1 : 0.001); dm.updateMatrix(); gr.setMatrixAt(i, dm.matrix); } gr.instanceMatrix.needsUpdate = true; } };
  o.setSalt(0); o.setTip(0); return o;
}

/* desalination plant as a bright cut-away mechanism: teal sea water in (left) -> amber membrane wall with pores -> clear fresh water out (right) toward a house;
   white salt leaves through a low pipe on the left and piles up outside. Local: x west->east, y up, z toward the viewer. */
export function makeDesalPlant() {
  const g = G(), W = 760, H = 420, Dp = 260, ink = MB('#1d2a44');
  box(g, W + 60, 22, Dp + 60, M('#cfc7b6', '#b8aec0'), [0, -11, 0], 2.6, null, 3);
  box(g, W + 40, H + 40, 14, MB('#fff6dc'), [0, H / 2, -Dp / 2 - 12], 0, null, 1);
  const seaW = part(g, new THREE.BoxGeometry(W / 2 - 22, H * 0.82, Dp - 14).translate(0, H * 0.41, 0), MB('#2fb4c2', { transparent: true, opacity: 0.8, depthWrite: false }), 0, [-W / 4 - 8, 4, 0]); seaW.renderOrder = 3;
  const frW = part(g, new THREE.BoxGeometry(W / 2 - 22, H * 0.82, Dp - 14).translate(0, H * 0.41, 0), MB('#9fe0ff', { transparent: true, opacity: 0.7, depthWrite: false }), 0, [W / 4 + 8, 4, 0]); frW.renderOrder = 3;
  const tk = 5;   // glass frame
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(tk, H, tk), ink); e.position.set(sx * W / 2, H / 2, sz * Dp / 2); g.add(e); }
  for (const sy of [0, 1]) for (const sz of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(W, tk, tk), ink); e.position.set(0, sy * H, sz * Dp / 2); g.add(e); }
  for (const sy of [0, 1]) for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(tk, tk, Dp), ink); e.position.set(sx * W / 2, sy * H, 0); g.add(e); }
  /* the membrane: an amber wall with light pores */
  box(g, 30, H * 0.98, Dp - 10, M('#f2a33a', '#c8803a', 0), [0, H * 0.49, 0], 2.8, null, 2);
  for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(34, 10, 4), MB('#e8fbff')); p.position.set(0, 30 + i * 42, Dp / 2 - 4); g.add(p); }
  const pipeM = M('#8a9cb4', '#a8b4c8'), cyl = (r, len, x, y, z, c) => part(g, new THREE.CylinderGeometry(r, r, len, 16).rotateZ(Math.PI / 2), c || pipeM, 2.4, [x, y, z]);
  cyl(58, 340, -W / 2 - 170, 300, 0); cyl(58, 560, W / 2 + 280, 300, 0, M('#5fb8ee', '#4a86a8')); cyl(40, 340, -W / 2 - 170, 110, 0, M('#b4b4b4', '#c8c8c8'));
  const house = makeHouse(81, { w: 130, d: 105, h: 88, garden: false }); house.scale.setScalar(1.6); house.position.set(W / 2 + 660, 0, 0); house.rotation.y = -Math.PI / 2; g.add(house);
  const a1 = makeFlowArrow({ len: 200, w: 56, col: '#1fa3b5' }), a2 = makeFlowArrow({ len: 200, w: 56, col: '#2f9be0' }), a3 = makeFlowArrow({ len: 180, w: 50, col: '#8a8a8a' });
  a1.position.set(-W / 2 - 360, 400, 70); a2.position.set(W / 2 + 200, 400, 70); a3.rotation.y = Math.PI; a3.position.set(-W / 2 - 150, 200, 70); g.add(a1, a2, a3);
  const ND = 16, sd = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8).scale(0.8, 1.15, 0.8), MB('#12939f'), ND), fd = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8).scale(0.8, 1.15, 0.8), MB('#2f9be0'), ND);
  const NG = 26, gr = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), MB('#ffffff'), NG); sd.frustumCulled = fd.frustumCulled = gr.frustumCulled = false; g.add(sd, fd, gr);
  const pile = part(g, ell(110, 46, 90, 16, 10), M('#ffffff', '#d8dcec', 0), 2.2, [-W / 2 - 330, 4, 0]); pile.scale.set(0.001, 0.001, 0.001); const dm = new THREE.Object3D();
  const o = { root: g, anchors: { in: [-W / 2 - 330, 300, 0], out: [W / 2 + 560, 300, 0], membrane: [0, 260, 0], W, H },
    setPile(k) { pile.scale.set(Math.max(0.001, k), Math.max(0.001, k), Math.max(0.001, k)); },
    update(t) {
      for (let i = 0; i < ND; i++) { const ph = frac(i / ND + t * 0.16), x = lerpK(-W / 2 - 320, -22, ph), y = lerpK(300, 70 + 280 * frac(i * 0.37), sm(cl((ph - 0.3) / 0.7, 0, 1))) + 6 * Math.sin(t * 3 + i);
        dm.position.set(x, y, (i % 5 - 2) * 36); dm.scale.setScalar(15); dm.updateMatrix(); sd.setMatrixAt(i, dm.matrix);
        const ph2 = frac(i / ND + t * 0.16 + 0.5), x2 = lerpK(22, W / 2 + 540, ph2), y2 = lerpK(70 + 280 * frac(i * 0.61), 300, sm(cl(ph2 / 0.5, 0, 1)));
        dm.position.set(x2, y2, (i % 5 - 2) * 36); dm.scale.setScalar(15); dm.updateMatrix(); fd.setMatrixAt(i, dm.matrix); }
      for (let i = 0; i < NG; i++) { const ph = frac(i / NG + t * 0.2), a = Math.min(1, ph / 0.62), fall = cl((ph - 0.62) / 0.38, 0, 1);
        const x = ph < 0.62 ? lerpK(-40, -W / 2 - 330, a) : -W / 2 - 330 + 14 * Math.sin(i * 2.1), y = ph < 0.62 ? 110 + (a < 0.3 ? 25 * Math.sin(i + t * 4) * (1 - a / 0.3) : 0) : lerpK(110, 22, fall * fall);
        dm.position.set(x, y, (i % 5 - 2) * 26); dm.scale.setScalar(10); dm.updateMatrix(); gr.setMatrixAt(i, dm.matrix); }
      sd.instanceMatrix.needsUpdate = fd.instanceMatrix.needsUpdate = gr.instanceMatrix.needsUpdate = true;
      a1.position.x = -W / 2 - 360 + 20 * Math.sin(t * 3); a2.position.x = W / 2 + 200 + 20 * Math.sin(t * 3); a3.position.x = -W / 2 - 150 - 20 * Math.sin(t * 3); } };
  return o;
}

/* pump icon (plain wheel on a base) and a warning sign */
export function makePumpIcon() {
  const g = G(), st = M('#5b82ad', '#8aa0c0'), dk = M('#3a3a46', '#6a6a7a', 0);
  box(g, 260, 40, 160, M('#cfc7b6', '#b8aec0'), [0, 20, 0], 2.6, null, 5); part(g, new THREE.CylinderGeometry(88, 88, 90, 24).rotateX(Math.PI / 2), st, 2.6, [0, 140, 0]);
  const wheel = G(g, [0, 140, 52]); part(wheel, new THREE.TorusGeometry(64, 8, 8, 28), M('#d9442e', '#b88080', 0), 2); for (let i = 0; i < 6; i++) { const r = G(wheel); r.rotation.z = i * Math.PI / 3; box(r, 8, 128, 8, M('#d9442e', '#b88080', 0), [0, 0, 0], 0, null, 1); }
  part(g, new THREE.CylinderGeometry(28, 28, 260, 12), st, 2.4, [150, 170, 0]); part(g, new THREE.CylinderGeometry(28, 28, 200, 12).rotateZ(Math.PI / 2), st, 2.4, [-150, 40, 0]);
  const x = G(g, [0, 150, 90]); for (const s of [-1, 1]) { const b = box(x, 230, 26, 12, MB('#e8202a'), [0, 0, 0], 0, [0, 0, s * 0.75], 1); } x.visible = false;
  g.userData.setAngle = a => { wheel.rotation.z = a; }; g.userData.setCross = k => { x.visible = k > 0.02; x.scale.setScalar(Math.max(0.01, k)); }; return g;
}
export function makeWarnSign() {
  const g = G(); box(g, 14, 330, 14, M('#6e4a2c', '#9a7a66'), [0, 165, 0], 2, null, 3);
  const tri = new THREE.Shape(); tri.moveTo(-150, 0); tri.lineTo(150, 0); tri.lineTo(0, 260); tri.closePath();
  part(g, new THREE.ExtrudeGeometry(tri, { depth: 16, bevelEnabled: false }).translate(0, 0, -8), M('#ffd42a', '#d8b050', 0), 3.2, [0, 320, 0]);
  box(g, 26, 100, 10, MB('#1d2a44'), [0, 410, 12], 0, null, 1); box(g, 28, 28, 10, MB('#1d2a44'), [0, 360, 12], 0, null, 1); return g;
}

/* coast map: Mediterranean on the LEFT (x<0), land on the right, straight coast along z; plants on the coast, houses inland, lake inset in the NE */
export function makeCoastMap() {
  const root = G(); box(root, 4400, 30, 3000, M('#2f93c0', '#2a7ea8'), [-2200, -20, 0], 0, null, 2); box(root, 2400, 40, 3000, M('#9ccd66', '#78b04c'), [1200, -20, 0], 3, null, 8);
  box(root, 90, 40, 3000, M('#ecd49a', '#c8b07a'), [-20, -19, 0], 0, null, 2);
  const sh = new THREE.InstancedMesh(new THREE.BoxGeometry(150, 4, 7), MB('#d8f4fb'), 40); sh.frustumCulled = false; root.add(sh); const dm = new THREE.Object3D();
  const PZ = [-900, -430, 40, 520, 980], plants = PZ.map((z, i) => { const g = G(root, [150, 0, z]); box(g, 190, 70, 130, M('#d9d4c8', '#b8b2c0'), [0, 35, 0], 2.6, null, 4); box(g, 50, 140, 50, M('#8a9cb4', '#a8b4c8'), [-50, 120, 0], 2.4, null, 4);
    part(g, new THREE.CylinderGeometry(34, 34, 60, 16), M('#5fc2e8', '#4a86a8', 0), 2.4, [50, 100, 0]); const ring = new THREE.Mesh(new THREE.TorusGeometry(150, 7, 6, 36).rotateX(Math.PI / 2), MB('#ffd42a')); ring.position.y = 6; g.add(ring); ring.visible = false;
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(20, 12, 8), MB('#5a6a60')); lamp.position.set(60, 190, 0); g.add(lamp); return { g, ring, lamp }; });
  const HX = [[900, -200], [1150, 250], [1000, 760], [1350, -650], [1500, 400]]; const houses = HX.map((p, i) => { const h = makeHouse(60 + i, { w: 130, d: 105, h: 88 }); h.position.set(p[0], 0, p[1]); h.rotation.y = -1.57; root.add(h); return h; });
  const lines = []; PZ.forEach((z, i) => { const tgt = HX[i % HX.length], dx = tgt[0] - 150, dz = tgt[1] - z, L = Math.hypot(dx, dz), g = G(root, [150, 8, z]); g.rotation.y = -Math.atan2(dz, dx);
    const m = new THREE.Mesh(new THREE.BoxGeometry(L, 8, 22).translate(L / 2, 0, 0), MB('#2f9be0')); g.add(m); m.scale.x = 0.001; lines.push(m); });
  const lakeM = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(KINNERET_OUTLINE.map(p => new THREE.Vector2(p[0] * 0.28, -p[1] * 0.28)))).rotateX(-Math.PI / 2), MB('#2f9cc0')); lakeM.position.set(1450, 2, -1100); root.add(lakeM);
  const lakeSk = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(KINNERET_OUTLINE.map(p => new THREE.Vector2(p[0] * 0.32, -p[1] * 0.32)))).rotateX(-Math.PI / 2), MB('#ecd49a')); lakeSk.position.set(1450, 1, -1100); root.add(lakeSk);
  return { root, plants, houses, lakeM, lakeSk, anchors: { plant: i => [150, 0, PZ[i]], lake: [1450, 0, -1100], corner: [1850, 200, -1250], seaMid: [-700, 0, 0] }, PZ,
    setPlant(i, k) { plants[i].ring.visible = k > 0.02; plants[i].ring.scale.setScalar(0.6 + 0.4 * k); plants[i].lamp.material.color.set('#5a6a60').lerp(col('#ffd42a'), k); },
    setLines(k) { lines.forEach((m, i) => { m.scale.x = Math.max(0.001, sm(cl(k * 1.4 - i * 0.12, 0, 1))); }); },
    update(t) { for (let i = 0; i < 40; i++) { dm.position.set(-300 - ((i * 211 + 0) % 3900), -3, ((i * 397) % 2800) - 1400 + 10 * Math.sin(t + i)); dm.updateMatrix(); sh.setMatrixAt(i, dm.matrix); } sh.instanceMatrix.needsUpdate = true; } };
}


/* ======================================================================== FILM A ADDITIONS (appended 01/11 by the film_a builder)
   makeLandMapA (relief map: sea LEFT, two lakes, Hula patch, gold outline), makeCardMapA, makeGlassA, makeMarkA, makeLongRulerA, makeVArrowA,
   makeBowlSectionA + makeMountainA (the profile diorama, 3 units per metre), makeKinneretTankA + makeFloorBoxA (glass-tank side view, 20 units per metre), makeDropIconA.
   All names carry the A suffix / FA_ prefix so that the other film builders can append next to them without clashes. */
const FA_INK = '#261c19';
const FA_lin = (A, v) => { if (v <= A[0][0]) return A[0][1]; for (let i = 1; i < A.length; i++) if (v <= A[i][0]) { const u = (v - A[i - 1][0]) / (A[i][0] - A[i - 1][0]); return A[i - 1][1] + (A[i][1] - A[i - 1][1]) * u; } return A[A.length - 1][1]; };
const FA_flatGeo = (poly, y) => { const sh = new THREE.Shape(poly.map(p => new THREE.Vector2(p[0], -p[1]))); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); return g; };
function FA_ribbonXY(pts, width, z) {
  const pos = [], idx = [], n = pts.length;
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l, w = width / 2;
    pos.push(pts[i][0] - nx * w, pts[i][1] - ny * w, z, pts[i][0] + nx * w, pts[i][1] + ny * w, z); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g;
}
const FA_basic = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, side: THREE.DoubleSide }, o || {}));
const FA_glowMat = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
function FA_waterMat(cTop, cBot, y0, y1, alpha) {
  return new THREE.ShaderMaterial({ transparent: alpha != null && alpha < 1, depthWrite: !(alpha != null && alpha < 1), uniforms: { uA: { value: col(cTop) }, uB: { value: col(cBot) } },
    vertexShader: 'varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 uA, uB; varying float vY; void main(){ float k = clamp((vY - (' + y0.toFixed(1) + ')) / (' + (y1 - y0).toFixed(1) + '), 0.0, 1.0); k = floor(k * 5.0) / 5.0; gl_FragColor = vec4(mix(uB, uA, k), ' + (alpha == null ? 1 : alpha).toFixed(2) + '); }' });
}
const FA_ext = (shape, depth, z0) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(0, 0, z0);
function FA_polyShape(pts) { const sh = new THREE.Shape(); pts.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])); sh.closePath(); return sh; }

/* ------------------------------------------------------------------------ the relief map of the land (west LEFT, north up). Local axes: x = east, -z = north. */
/* the land map as a paper slab: a JPG texture of the lesson-8 2D map (map_all.jpg + two detail tiles) on a thin 3D slab, with 3D overlays at the true lon/lat (lakes, Jordan, Hula, pond, pins). */
export async function loadLandMapAssets(base) {
  base = base || '';
  const tl = new THREE.TextureLoader(), ld = n => tl.loadAsync(base + n).then(t => { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; return t; });
  const [all, n, s] = await Promise.all([ld('map_all.jpg'), ld('map_n.jpg'), ld('map_s.jpg')]);
  const geo = await (await fetch(base + 'geo_lakes.json')).json();
  return { all, n, s, geo };
}
export function makeLandMapA(A) {
  const root = G(), TOPH = 12, rad = Math.PI / 180, R = 759 / rad, MYf = lat => Math.log(Math.tan(Math.PI / 4 + lat * rad / 2)), MY0 = MYf(31.5);
  const P = (lon, lat) => [(lon - 35.0) * 759, -(MYf(lat) - MY0) * R];
  const LL = (lon, lat, up) => { const p = P(lon, lat); return new THREE.Vector3(p[0], up || 0, p[1]); };
  const B0 = [33.9, 29.3, 36.3, 33.5], a0 = P(B0[0], B0[1]), c0 = P(B0[2], B0[3]), SW = c0[0] - a0[0], SH = a0[1] - c0[1], CX = (a0[0] + c0[0]) / 2, CZ = (a0[1] + c0[1]) / 2;
  const texMat = (tex, off) => new THREE.MeshBasicMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -off, polygonOffsetUnits: -off });
  const quad = (b, tex, y, off) => { const a = P(b[0], b[1]), c = P(b[2], b[3]); const m = new THREE.Mesh(new THREE.PlaneGeometry(c[0] - a[0], a[1] - c[1]).rotateX(-Math.PI / 2), texMat(tex, off)); m.position.set((a[0] + c[0]) / 2, y, (a[1] + c[1]) / 2); root.add(m); return m; };
  /* table + soft shadow + paper slab */
  const table = new THREE.Mesh(new THREE.PlaneGeometry(26000, 26000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#b9a07a' })); table.position.set(CX, -24, CZ); root.add(table);
  { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 256; const c = cv.getContext('2d'), g = c.createRadialGradient(64, 128, 20, 64, 128, 128); g.addColorStop(0, 'rgba(40,28,12,0.55)'); g.addColorStop(0.75, 'rgba(40,28,12,0.4)'); g.addColorStop(1, 'rgba(40,28,12,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 256);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(SW + 240, SH + 240).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sh.position.set(CX + 40, -22, CZ + 60); sh.renderOrder = 1; root.add(sh); }
  part(root, new THREE.BoxGeometry(SW, TOPH + 8, SH).translate(CX, (TOPH - 8) / 2 - 0.5, CZ), M('#f3e9d2', '#d8cdb4', 0), 2.6);
  quad(B0, A.all, TOPH, 2);
  quad([35.15, 32.5, 36.0, 33.4], A.n, TOPH + 0.4, 4);
  quad([35.0, 31.0, 35.9, 31.95], A.s, TOPH + 0.4, 4);
  const Y = TOPH + 1.2;
  const flat = (poly, y, hex, o) => { const m = new THREE.Mesh(FA_flatGeo(poly, y), FA_basic(hex, Object.assign({ polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 }, o || {}))); root.add(m); return m; };
  const rib = (pts, w, y, mat) => { const m = new THREE.Mesh(ribbon(pts.map(p => [p[0], y, p[1]]), w, 100), mat); m.frustumCulled = false; m.renderOrder = 7; root.add(m); return m; };
  const loopP = poly => poly.concat([poly[0]]);
  const kinPoly = A.geo.lakes['Sea of Galilee'][0].map(p => P(p[0], p[1])), deadPolys = A.geo.lakes['Dead Sea'].map(r => r.map(p => P(p[0], p[1])));
  const bb = poly => { const xs = poly.map(p => p[0]), zs = poly.map(p => p[1]); return [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]; };
  const kb = bb(kinPoly), KC = [(kb[0] + kb[1]) / 2, (kb[2] + kb[3]) / 2], db = bb(deadPolys[0]), dsC = [(db[0] + db[1]) / 2, (db[2] + db[3]) / 2];
  const midEdges = (poly, z) => { let lo = 1e9, hi = -1e9; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; if ((a[1] > z) === (b[1] > z)) continue; const x = a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]); lo = Math.min(lo, x); hi = Math.max(hi, x); } return [lo, hi]; };
  const mid = midEdges(kinPoly, KC[1]);
  /* dim layer (everything except the Kinneret), then the Kinneret redrawn above it */
  const dimM = new THREE.MeshBasicMaterial({ color: '#d6dde1', transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 });
  const dimP = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH).rotateX(-Math.PI / 2), dimM); dimP.position.set(CX, TOPH + 0.8, CZ); dimP.renderOrder = 4; root.add(dimP);
  const kinTop = flat(kinPoly, Y, '#3D9BD9'); kinTop.renderOrder = 5; rib(loopP(kinPoly), 2.4, Y + 0.05, FA_basic('#1F6FB0')).renderOrder = 6;
  /* Hula patch (drying), Golan pond, Hermon cone */
  const HC = P(35.6, 33.08), HULA = { c: HC, rx: 20, rz: 26 }, hulaG = G(root, [HC[0], Y + 0.3, HC[1]]), hulaM = FA_basic('#3aa7c9');
  const hulaPatch = new THREE.Mesh(new THREE.CircleGeometry(1, 36).rotateX(-Math.PI / 2), hulaM); hulaPatch.scale.set(HULA.rx, 1, HULA.rz); hulaG.add(hulaPatch);
  const stripes = []; for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(HULA.rx * 2.1, 1.2, 5), FA_basic(i % 2 ? '#9fd15a' : '#7cc043')); s.position.set(0, 0.5, (i - 3) * 8); s.scale.x = 0.001; hulaG.add(s); stripes.push(s); }
  const reeds = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rd = KT.makeReeds(50 + i, { n: 7, h: 70 }); rd.scale.setScalar(0.14); rd.position.set(Math.cos(a) * (HULA.rx + 4), 0.3, Math.sin(a) * (HULA.rz + 4)); hulaG.add(rd); reeds.push(rd); }
  const PO = P(35.685, 33.253), pondG = G(root, [PO[0], Y + 0.4, PO[1]]), pondM = FA_basic('#2d9be6');
  pondG.add(new THREE.Mesh(new THREE.CircleGeometry(6, 20).rotateX(-Math.PI / 2), pondM)); pondG.add(new THREE.Mesh(new THREE.RingGeometry(6, 8.5, 20).rotateX(-Math.PI / 2), FA_basic(FA_INK)));
  { const h = P(35.8, 33.33); const c1 = part(root, new THREE.ConeGeometry(52, 34, 16), M('#a2ab98', '#80897a'), 1.8); c1.position.set(h[0], TOPH + 17, h[1]); const c2 = part(root, new THREE.ConeGeometry(28, 22, 16), M('#f6f9fb', '#cfd8e2'), 1.6); c2.position.set(h[0], TOPH + 34 + 7, h[1]); }
  /* glows + gold outline */
  const ring = (poly, w, hex) => { const m = rib(loopP(poly), w, Y + 0.6, FA_glowMat(hex)); m.renderOrder = 8; return m; };
  const glowK = ring(kinPoly, 15, '#44d6ff'), glowD = ring(deadPolys[0], 15, '#ffffff');
  const goldPts = loopP(kinPoly).map(p => [p[0], Y + 1.4, p[1]]), goldGeo = ribbon(goldPts, 6, 100), gold = new THREE.Mesh(goldGeo, FA_basic('#ffc928')); gold.frustumCulled = false; gold.renderOrder = 10; root.add(gold);
  const goldInkG = ribbon(goldPts, 10.5, 100), goldInk = new THREE.Mesh(goldInkG, FA_basic(FA_INK)); goldInk.position.y = -0.4; goldInk.frustumCulled = false; goldInk.renderOrder = 9; root.add(goldInk);
  const goldN = (goldPts.length - 1) * 6; goldGeo.setDrawRange(0, 0); goldInkG.setDrawRange(0, 0);
  const mkPin = hx => { const g = G(); part(g, new THREE.ConeGeometry(14, 60, 10).rotateX(Math.PI), M(hx), 1.2, [0, 30, 0]); part(g, ell(20, 20, 20, 14, 10), M(hx), 1.2, [0, 70, 0]); return g; };
  const kinPin = mkPin('#d6232a'); kinPin.position.set(KC[0], Y, KC[1]); root.add(kinPin);
  const jer = P(35.22, 31.78); const jerPin = mkPin('#d6232a'); jerPin.scale.setScalar(0.5); jerPin.position.set(jer[0], TOPH, jer[1]); root.add(jerPin);
  const m = {
    root, ll: LL, P, heightAt: () => TOPH, top: TOPH, Y, KC, kinPoly, kinLen: kb[3] - kb[2], kinTopZ: kb[2], kinBotZ: kb[3], kinWestAtMid: mid[0], kinEastAtMid: mid[1], hula: HULA, dead: { c: dsC }, pondPos: [PO[0], Y + 0.4, PO[1]], jerPos: [jer[0], TOPH, jer[1]],
    setHula(k) { hulaPatch.scale.set(HULA.rx * (1 - 0.92 * k) + 0.01, 1, HULA.rz * (1 - 0.92 * k) + 0.01); stripes.forEach((s, i) => { s.scale.x = Math.max(0.001, cl(k * 1.5 - i * 0.07, 0, 1)); }); reeds.forEach(r => { r.visible = k < 0.7; }); hulaPatch.visible = k < 0.97; },
    setGlow(i, k) { (i ? glowD : glowK).material.opacity = 0.8 * k; },
    setDim(k) { dimM.opacity = 0.42 * k; dimP.visible = k > 0.002; },
    setKinColor() { },
    setOutline(k) { const n = Math.floor(cl(k, 0, 1) * goldN / 6) * 6; goldGeo.setDrawRange(0, n); goldInkG.setDrawRange(0, n); gold.visible = goldInk.visible = k > 0.002; },
    setPin(k) { kinPin.visible = k > 0.01; kinPin.scale.setScalar(0.9 * k + 0.001); },
    pondPulse(k) { pondG.scale.setScalar(0.8 + 1.4 * k); },
    update() { },
  };
  m.setHula(0); m.setPin(0); m.setDim(0); return m;
}

/* the little card map with two city dots (a3): two dots exactly `dist` apart */
export function makeCardMapA(o) {
  o = Object.assign({ w: 1300, d: 760, dist: 840 }, o || {}); const g = G();
  box(g, o.w, 26, o.d, M('#f6ecd0', '#d8cfb4'), [0, 0, 0], 3, null, 8); box(g, o.w - 70, 6, o.d - 70, M('#a9d070', '#8fb85a', 0), [0, 15, 0], 0, null, 2);
  const dots = [-1, 1].map((s, i) => { const d = G(g, [s * o.dist / 2, 18, i ? -40 : 40]); part(d, new THREE.CylinderGeometry(34, 34, 14, 22), M(i ? '#d6232a' : '#2f73c9'), 2, [0, 7, 0]); part(d, ell(18, 18, 18, 12, 8), M('#ffffff', '#cccccc', 0), 0, [0, 24, 0]); return d; });
  g.userData.dots = dots; g.userData.dist = o.dist; return g;
}

/* a glass of water (a1): fill 0..1, colour of the water set by hex */
export function makeGlassA(o) {
  o = Object.assign({ water: '#8c9296' }, o || {}); const g = G(), H = 230;
  const wm = M(o.water, '#9aa0a6'); const water = part(g, new THREE.CylinderGeometry(70, 57, 200, 28).translate(0, 100, 0), wm, 1.8, [0, 12, 0]);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(78, 62, H, 28, 1, true).translate(0, H / 2 + 8, 0), FA_basic('#e6f6ff', { transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })); glass.renderOrder = 4; g.add(glass);
  part(g, new THREE.CylinderGeometry(64, 64, 14, 28).translate(0, 7, 0), M('#d6ecf8', '#a8c4d4'), 1.6);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(78, 4, 6, 32).rotateX(Math.PI / 2), FA_basic('#ffffff')); rim.position.y = H + 8; g.add(rim);
  return { root: g, setFill(k) { water.scale.y = Math.max(0.001, k); water.visible = k > 0.01; }, setWater(hx) { wm.uniforms.uColor.value.set(hx); }, height: H };
}

/* a red X or a green check mark, flat, faces +z; pop(k) 0..1 with overshoot */
export function makeMarkA(kind) {
  const g = G(), c = kind === 'x' ? '#e0322a' : '#2fb35a';
  const bar = (w, h, rz, x, y) => { const k = new THREE.Mesh(new THREE.PlaneGeometry(w + 18, h + 18), FA_basic(FA_INK)); const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), FA_basic(c)); [k, b].forEach((q, i) => { q.rotation.z = rz; q.position.set(x, y, i ? 2 : 0); g.add(q); }); };
  if (kind === 'x') { bar(300, 56, 0.785, 0, 0); bar(300, 56, -0.785, 0, 0); } else { bar(120, 56, -0.785, -60, -40); bar(250, 56, 0.9, 60, 20); }
  g.renderOrder = 10; g.traverse(q => { if (q.material) { q.material.depthTest = false; q.renderOrder = 10; } });
  g.userData.pop = k => { const s = k <= 0 ? 0.001 : (k < 0.6 ? sm(k / 0.6) * 1.25 : 1.25 - 0.25 * sm((k - 0.6) / 0.4)); g.scale.setScalar(s); g.visible = k > 0.001; }; g.userData.pop(0);
  return g;
}

/* the yellow long ruler (a3): starts at x=0 and extends along +x; grow(k) 0..1 */
export function makeLongRulerA(o) {
  o = Object.assign({ len: 840, w: 46 }, o || {}); const root = G(), g = G(root), d = Math.max(1.5, o.w * 0.25);
  box(g, o.len, o.w, d, M('#ffd42a', '#d8b050'), [o.len / 2, 0, 0], Math.max(0.8, o.w * 0.05), null, d * 0.3);
  const n = Math.max(6, Math.round(o.len / (o.w * 0.9))); for (let i = 0; i <= n; i++) { const big = i % 5 === 0; box(g, o.w * 0.1, big ? o.w * 0.62 : o.w * 0.34, d * 1.1, M('#1d2a44', '#1d2a44', 0), [i * o.len / n, o.w / 2 - (big ? o.w * 0.31 : o.w * 0.17), 0], 0, null, 0.2); }
  box(g, o.w * 0.4, o.w * 1.3, d * 1.4, M('#c98a1c', '#a87a3c'), [0, 0, 0], Math.max(0.8, o.w * 0.05), null, 0.5); box(g, o.w * 0.4, o.w * 1.3, d * 1.4, M('#c98a1c', '#a87a3c'), [o.len, 0, 0], Math.max(0.8, o.w * 0.05), null, 0.5);
  root.userData.grow = k => { g.scale.x = Math.max(0.001, k); g.visible = k > 0.001; }; root.userData.len = o.len; return root;
}

/* a vertical arrow from the origin: setLen(L) (L > 0 up, L < 0 down) */
export function makeVArrowA(hex, w) {
  w = w || 60; const g = G(), ink = FA_basic(FA_INK), mm = FA_basic(hex);
  const sh = [new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), ink), new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mm)], hd = [new THREE.Mesh(new THREE.ConeGeometry(1, 1, 3), ink), new THREE.Mesh(new THREE.ConeGeometry(1, 1, 3), mm)];
  [...sh, ...hd].forEach(q => { q.renderOrder = 8; g.add(q); });
  g.userData.setLen = L => { const a = Math.abs(L), dir = L >= 0 ? 1 : -1, hl = Math.min(a * 0.45, w * 2.2), sl = Math.max(0.01, a - hl * 0.8); g.visible = a > 2;
    sh.forEach((q, i) => { const e = i ? 0 : 12; q.scale.set(w * 0.5 + e, sl, 10); q.position.set(0, dir * sl / 2, i ? 3 : 0); });
    hd.forEach((q, i) => { const e = i ? 0 : 16; q.scale.set(w * 0.95 + e, hl, 10); q.rotation.z = L >= 0 ? 0 : Math.PI; q.position.set(0, dir * (a - hl / 2), i ? 3 : 0); }); };
  g.userData.setLen(0); return g;
}

/* the profile diorama (a2, a2b): west LEFT, 3 units per metre, sea level y = 0, the lake surface y = -630, depth D = 320 */
export const FA_BOWL = { S: 3, D: 320, surfY: -630, lakeX0: 1818, lakeX1: 2727, galTop: [700, 1250], golTop: [3800, 1150] };
export function makeBowlSectionA() {
  const root = G(), D = FA_BOWL.D, SURF = FA_BOWL.surfY;
  const KEYS = [[-1100, -300], [-700, -300], [-520, -110], [-440, 0], [-100, 120], [250, 600], [700, 1250], [1100, 700], [1400, 0], [1650, -420], [1850, -700], [2150, -760], [2450, -760], [2700, -680], [2900, -300], [3100, 300], [3300, 800], [3500, 1100], [3800, 1150], [4400, 1200]];
  const curve = new THREE.CatmullRomCurve3(KEYS.map(p => new THREE.Vector3(p[0], p[1], 0)), false, 'centripetal'); const SM = curve.getSpacedPoints(220).map(p => [p.x, p.y]);
  SM.sort((a, b) => a[0] - b[0]); const yAt = x => FA_lin(SM, x);
  const sub = (x0, x1) => { const a = [[x0, yAt(x0)]]; SM.forEach(p => { if (p[0] > x0 && p[0] < x1) a.push(p); }); a.push([x1, yAt(x1)]); return a; };
  const body = new THREE.Mesh(FA_ext(FA_polyShape([...SM, [4400, -1100], [-1100, -1100]]), D, -D / 2), M('#b88c5c', '#8f6a48')); root.add(body);
  { const h = body.geometry.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); const hull = new THREE.Mesh(mergeV(h, 1e-3), KT_hull(5)); hull.geometry.computeVertexNormals(); root.add(hull); }
  const strip = (x0, x1, th, hx, tint, dz) => { const top = sub(x0, x1), bot = top.slice().reverse().map(p => [p[0], p[1] - th]); const m_ = new THREE.Mesh(FA_ext(FA_polyShape([...top, ...bot]), D + 4 + (dz || 0), -D / 2 - 2), M(hx, tint || '#b9b0c4', 0)); root.add(m_); return m_; };
  strip(-1100, -440, 40, '#e8d094'); strip(-440, 1400, 80, '#79b84e'); strip(1400, 1830, 60, '#a9c25c'); strip(1818, 2727, 50, '#ecd49a'); strip(2727, 3300, 70, '#a9a060'); strip(3300, 4400, 100, '#6f6a46'); strip(3300, 4400, 24, '#8a8454', 2);
  /* waters */
  const xe = (() => { let x = -520; while (yAt(x) < 0 && x < 0) x += 2; return x; })();
  const seaPoly = [[-1100, 0], [xe, 0], ...sub(-1100, xe).reverse().filter(p => p[1] < 0)]; const sea = new THREE.Mesh(FA_ext(FA_polyShape([[-1100, 0], [xe, 0], ...sub(-1100, xe).slice().reverse()]), D - 8, -(D - 8) / 2), FA_waterMat('#7fd8e6', '#2c93b4', -300, 0)); root.add(sea);
  const lk = sub(FA_BOWL.lakeX0 - 30, FA_BOWL.lakeX1 + 30).filter(p => p[1] < SURF); const xl = FA_BOWL.lakeX0, xr = FA_BOWL.lakeX1;
  const lakePoly = [[xl, SURF], [xr, SURF], ...lk.slice().reverse().filter(p => p[0] > xl && p[0] < xr), ...lk.filter(p => p[0] > xl && p[0] < xr).slice(0, 0)];
  const lakeM = FA_waterMat('#8fe4e2', '#2c93b4', -760, SURF); const lake = new THREE.Mesh(FA_ext(FA_polyShape([[xl, SURF], [xr, SURF], ...sub(xl, xr).slice().reverse().map(p => [p[0], Math.min(p[1], SURF) - 2])]), D - 8, -(D - 8) / 2), lakeM); root.add(lake);
  [[-1100, xe, 0], [xl, xr, SURF]].forEach(([a, b, y]) => { const f = new THREE.Mesh(new THREE.BoxGeometry(b - a, 8, 3), FA_basic('#ffffff')); f.position.set((a + b) / 2, y, D / 2 - 3); root.add(f); });
  /* sea level dashes */
  const ND = 40, dash = new THREE.InstancedMesh(new THREE.BoxGeometry(76, 12, 6), FA_basic('#ffd42a'), ND), dm = new THREE.Object3D(); dash.frustumCulled = false; dash.renderOrder = 8; root.add(dash);
  for (let i = 0; i < ND; i++) { dm.position.set(-1060 + i * 140, 0, D / 2 + 10); dm.updateMatrix(); dash.setMatrixAt(i, dm.matrix); }
  /* glows (galilee side, golan side), gold bowl curve + highlight */
  const bandGeo = (x0, x1) => { const top = sub(x0, x1).map(p => [p[0], p[1] + 230]), bot = sub(x0, x1).slice().reverse().map(p => [p[0], p[1] - 170]); return new THREE.ShapeGeometry(FA_polyShape([...top, ...bot])); };
  const glows = [bandGeo(-300, 1500), bandGeo(2850, 4300)].map((gg, i) => { const q = new THREE.Mesh(gg, FA_glowMat('#ffd42a')); q.position.z = D / 2 + 6; q.renderOrder = 6; root.add(q); return q; });
  const UPT = []; for (let i = 0; i <= 60; i++) { const u = i / 60; UPT.push([lerpN(-200, 4000, u), -1000 + 2050 * (2 * u - 1) ** 2]); }
  const uGeo = FA_ribbonXY(UPT, 70, D / 2 + 14), uM = FA_basic('#ffc928'); const uCurve = new THREE.Mesh(uGeo, uM); uCurve.renderOrder = 9; root.add(uCurve);
  const uInkGeo = FA_ribbonXY(UPT, 96, D / 2 + 12), uInk = new THREE.Mesh(uInkGeo, FA_basic(FA_INK)); uInk.renderOrder = 8; root.add(uInk);
  const fillGeo = new THREE.ShapeGeometry(FA_polyShape([...UPT, [UPT[UPT.length - 1][0], 1500], [UPT[0][0], 1500]])); const fill = new THREE.Mesh(fillGeo, FA_glowMat('#ffd96a')); fill.position.z = D / 2 + 16; fill.renderOrder = 5; root.add(fill);
  uGeo.setDrawRange(0, 0); uInkGeo.setDrawRange(0, 0);
  const sec = {
    root, yAt, SM, xe, anchors: { sea: [-800, 0], lake: [2270, SURF], galilee: FA_BOWL.galTop, golan: FA_BOWL.golTop, bowlBottom: [2300, -760] },
    setGlow(i, k) { glows[i].material.opacity = 0.78 * k; glows[i].visible = k > 0.01; },
    setBowl(k) { const n = Math.floor(cl(k, 0, 1) * (UPT.length - 1)) * 6; uGeo.setDrawRange(0, n); uInkGeo.setDrawRange(0, n); fill.material.opacity = 0.2 * sm(cl((k - 0.7) / 0.3, 0, 1)); },
    update(t) { },
  };
  sec.setBowl(0); return sec;
}

/* the Jerusalem mountain (same vertical scale as the bowl section): peak at (cx, h) */
export function makeMountainA(o) {
  o = Object.assign({ h: 2310, cx: -2700, x0: -4300, x1: -1100, w: 720 }, o || {}); const root = G(), D = FA_BOWL.D;
  const yAt = x => o.h * Math.exp(-(((x - o.cx) / o.w) ** 2)) * (1 + 0.04 * Math.sin(x * 0.011)) + 0;
  const top = []; for (let x = o.x0; x <= o.x1; x += 40) top.push([x, Math.max(0, yAt(x))]);
  const body = new THREE.Mesh(FA_ext(FA_polyShape([...top, [o.x1, -1100], [o.x0, -1100]]), D, -D / 2), M('#cdb98a', '#a89868')); root.add(body);
  { const h = body.geometry.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); const hull = new THREE.Mesh(mergeV(h, 1e-3), KT_hull(5)); hull.geometry.computeVertexNormals(); root.add(hull); }
  const gt = top.slice(), gb = top.slice().reverse().map(p => [p[0], p[1] - 90]); root.add(new THREE.Mesh(FA_ext(FA_polyShape([...gt, ...gb]), D + 4, -D / 2 - 2), M('#79b84e', '#5f9a44', 0)));
  /* houses and a flag on the top */
  [[-150, 0.9, 4], [10, 1.1, 5], [150, 0.8, 6], [-40, 0.7, 7]].forEach(([dx, sc, sd], i) => { const hs = makeHouse(sd, { garden: false }); hs.scale.setScalar(2.3 * sc); hs.position.set(o.cx + dx, yAt(o.cx + dx) - 8, i % 2 ? 40 : -20); root.add(hs); });
  const flag = G(root, [o.cx, o.h + 20, 0]); box(flag, 12, 260, 12, M('#6e4a2c', '#9a7a66'), [0, 130, 0], 2, null, 3); box(flag, 150, 90, 8, M('#d6232a', '#b88080'), [80, 215, 0], 2, null, 2);
  /* road: zigzag on the front face, from the foot of the mountain at lake level up to the peak */
  const SURF = FA_BOWL.surfY, lv = [SURF, 0, 520, 1020, 1500, 1930, o.h - 40];
  const half = y => o.w * Math.sqrt(Math.max(0.02, Math.log(o.h / Math.max(y, 40))));
  const way = []; lv.forEach((y, i) => { const hw = Math.min(1500, half(Math.max(y, 40))) - 150; way.push([o.cx + (i === lv.length - 1 ? 0 : (i % 2 ? hw : -hw)), y]); });
  const rc = new THREE.CatmullRomCurve3(way.map(p => new THREE.Vector3(p[0], p[1], 0)), false, 'centripetal'); const RP = rc.getSpacedPoints(120).map(p => [p.x, p.y]);
  const rGeo = FA_ribbonXY(RP, 64, D / 2 + 8), rIn = FA_ribbonXY(RP, 38, D / 2 + 10), rInk = FA_ribbonXY(RP, 84, D / 2 + 6);
  [[rInk, FA_INK], [rGeo, '#8a8f9a'], [rIn, '#b7bcc6']].forEach(([g_, c], i) => { const q = new THREE.Mesh(g_, FA_basic(c)); q.renderOrder = 7 + i; root.add(q); });
  const pond = new THREE.Mesh(new THREE.CircleGeometry(150, 28), FA_basic('#2d9be6')); pond.position.set(way[0][0] - 60, SURF - 10, D / 2 + 12); pond.scale.set(1, 0.5, 1); pond.renderOrder = 7; root.add(pond);
  const rings = [rGeo, rIn, rInk]; const NR = RP.length - 1;
  const mt = { root, yAt, peak: [o.cx, o.h], roadPts: RP, flag, pond,
    roadAt(u) { const f = cl(u, 0, 1) * NR, i = Math.min(NR - 1, Math.floor(f)), r = f - i; return [RP[i][0] + (RP[i + 1][0] - RP[i][0]) * r, RP[i][1] + (RP[i + 1][1] - RP[i][1]) * r]; },
    setRoad(k) { const n = Math.floor(cl(k, 0, 1) * NR) * 6; rings.forEach(g_ => g_.setDrawRange(0, n)); pond.visible = k > 0.001; } };
  mt.setRoad(0); return mt;
}

/* the glass tank (a4): side view of the lake, 20 units per metre, surface y = 0, the deep dip (43 m = 860 units) right of centre, front glass off */
export const FA_TANK = { W: 1500, D: 240, dipX0: 400, dipX1: 780, dipBot: -860 };
export function makeKinneretTankA() {
  const root = G(), D = FA_TANK.D, W = FA_TANK.W;
  const BED = [[-W, -250], [-1100, -320], [-600, -420], [-100, -440], [250, -470], [400, -860], [590, -880], [780, -860], [900, -440], [1200, -330], [W, -250]];
  const curve = new THREE.CatmullRomCurve3(BED.map(p => new THREE.Vector3(p[0], p[1], 0)), false, 'centripetal'); const SM = curve.getSpacedPoints(160).map(p => [p.x, p.y]); SM.sort((a, b) => a[0] - b[0]);
  const bedAt = x => FA_lin(SM, x);
  const earth = new THREE.Mesh(FA_ext(FA_polyShape([[-W - 1400, 110], [-W, 110], ...SM.filter(p => p[0] > -W && p[0] < W), [W, 110], [W + 1400, 110], [W + 1400, -1200], [-W - 1400, -1200]]), D, -D / 2), M('#b88c5c', '#8f6a48')); root.add(earth);
  { const h = earth.geometry.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); const hull = new THREE.Mesh(mergeV(h, 1e-3), KT_hull(6)); hull.geometry.computeVertexNormals(); root.add(hull); }
  const sand = SM.filter(p => p[0] > -W && p[0] < W); root.add(new THREE.Mesh(FA_ext(FA_polyShape([...sand, ...sand.slice().reverse().map(p => [p[0], p[1] - 50])]), D + 4, -D / 2 - 2), M('#ecd49a', '#c8b07a', 0)));
  root.add(new THREE.Mesh(FA_ext(FA_polyShape([[-W - 1400, 110], [-W, 110], [-W, 70], [-W - 1400, 70]]), D + 4, -D / 2 - 2), M('#79b84e', '#5f9a44', 0)));
  root.add(new THREE.Mesh(FA_ext(FA_polyShape([[W, 110], [W + 1400, 110], [W + 1400, 70], [W, 70]]), D + 4, -D / 2 - 2), M('#79b84e', '#5f9a44', 0)));
  const wPoly = [[-W, 0], [W, 0], ...sand.slice().reverse().map(p => [p[0], p[1] + 2])];
  const waterM = FA_waterMat('#8fe4e2', '#2c93b4', -880, 0, 0.58); const water = new THREE.Mesh(FA_ext(FA_polyShape(wPoly), D - 8, -(D - 8) / 2), waterM); water.renderOrder = 3; root.add(water);
  const foam = new THREE.Mesh(new THREE.BoxGeometry(2 * W, 8, 3), FA_basic('#ffffff')); foam.position.set(0, 0, D / 2 - 3); foam.renderOrder = 4; root.add(foam);
  const frm = M('#3a4a62', '#6a7a92'); box(root, 16, 150, D + 20, frm, [-W, 40, 0], 2, null, 3); box(root, 16, 150, D + 20, frm, [W, 40, 0], 2, null, 3);
  return { root, bedAt, SM, W, D, waterM, anchors: { surface: [0, 0], dip: [590, -860], rimL: [-W - 350, 110], rimR: [W + 350, 110] } };
}

/* a building of n floors (3 m each = 60 units), origin at the base centre; floors[] for the per-floor effects, outline for the dissolve end state */
export function makeFloorBoxA(n) {
  const root = G(), solid = G(root), FH = 60, W = 260, Dp = 200, floors = [];
  for (let i = 0; i < n; i++) { const f = G(solid, [0, i * FH, 0]); box(f, W, FH - 2, Dp, M(i % 2 ? '#f2e4c4' : '#e8d6b0', '#cdbfb2'), [0, FH / 2, 0], 1.8, null, 4);
    for (const x of [-80, 0, 80]) { box(f, 52, 28, 5, M('#9fd1ee', '#7aa0c0', 0), [x, FH / 2 + 2, Dp / 2 + 2], 0, null, 1); }
    floors.push(f); }
  box(solid, W + 24, 16, Dp + 24, M('#cf5a3c', '#9c7a82'), [0, n * FH + 8, 0], 2, null, 3);
  const outline = G(root); const eg = new THREE.EdgesGeometry(new THREE.BoxGeometry(W, n * FH, Dp)); const ls = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: '#ffe9a0' })); ls.position.y = n * FH / 2; outline.add(ls);
  for (let i = 1; i < n; i++) { const l2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W, 1, Dp)), new THREE.LineBasicMaterial({ color: '#ffe9a0' })); l2.position.y = i * FH; outline.add(l2); }
  outline.visible = false;
  return { root, solid, outline, floors, FH, W, Dp, height: n * FH + 16, setDissolve(k) { floors.forEach((f, i) => { const u = cl(k * (n + 3) - (n - 1 - i), 0, 1); f.scale.setScalar(Math.max(0.001, 1 - u)); f.visible = u < 0.99; }); solid.children[solid.children.length - 1].visible = k < 0.05; outline.visible = k > 0.02; } };
}

/* a water drop icon with sparkles (a1b) */
export function makeDropIconA() {
  const g = G(), bl = M('#2f9be0', '#8ab0d8'); part(g, ell(70, 70, 40, 28, 20), bl, 2.4, [0, 70, 0]); part(g, new THREE.ConeGeometry(52, 110, 20).scale(1, 1, 0.58).translate(0, 55, 0), bl, 2.4, [0, 108, 0]);
  const hi = new THREE.Mesh(new THREE.CircleGeometry(15, 12), FA_basic('#ffffff')); hi.position.set(-26, 84, 42); g.add(hi);
  const sp = [[-130, 190, 1.0], [140, 120, 0.8], [90, 260, 0.9], [-100, 40, 0.7]].map(([x, y, s]) => { const q = G(g, [x, y, 30]); [0, 1].forEach(a => { const b = new THREE.Mesh(new THREE.PlaneGeometry(a ? 14 : 56, a ? 56 : 14), FA_basic('#fff3a0')); q.add(b); }); q.userData.s = s; return q; });
  g.userData.update = t => sp.forEach((q, i) => { const k = 0.5 + 0.5 * Math.sin(t * 3.2 + i * 1.7); q.scale.setScalar(Math.max(0.001, k * q.userData.s)); q.rotation.z = t * 0.8 + i; });
  g.userData.update(0); return g;
}


/* ======================================================================== FILM B ADDITIONS (appended 01/11 by the film_b builder): bathtub, balance scale, snow Hermon, spring cut-away, calendar strip, corn ear.
   All deterministic (functions of t / setters), ASCII only, no Hebrew. Toy scale: Tipa 244, tub 900 x 460. */
export const ribbonB = ribbon;
const B_INK = '#2c3a52';
function B_bar(parent, w, h, d, hex, pos, o) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MB(hex, o)); m.position.set(pos[0], pos[1], pos[2]); parent.add(m); return m; }
function B_str(m, p0, p1) { const dx = p1[0] - p0[0], dy = p1[1] - p0[1]; m.position.set((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, p0[2] || 0); m.rotation.z = Math.atan2(dy, dx); m.scale.x = Math.max(0.001, Math.hypot(dx, dy)); }

/* the big white bathtub with a glass front, 3 taps, ruler with red marker, level-drop bracket, exits (sun / pipe / bottom gate). level k 0..1 (1 = brim) */
export function makeBathtub(o) {
  o = Object.assign({}, o || {});
  const root = G(), RIM = 460, FLOOR = 90, HIN = 350, HEAD = 700, ZW = 14;
  const white = M('#fbfbf4', '#c4d0e4'), feet = M('#7fa6d0', '#5a80aa'), steel = M('#5b82ad', '#8aa0c0'), red = M('#d9442e', '#b88080', 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(root, 60, 66, 60, feet, [sx * 370, 33, sz * 110], 2.6, null, 16);
  box(root, 900, 30, 360, white, [0, 75, 0], 3, null, 10);
  box(root, 900, RIM - 90, 30, white, [0, (RIM + 90) / 2, -165], 3, null, 8);
  box(root, 30, RIM - 90, 360, white, [-435, (RIM + 90) / 2, 0], 3, null, 8);
  box(root, 30, RIM - 90, 360, white, [435, (RIM + 90) / 2, 0], 3, null, 8);
  box(root, 910, 30, 40, white, [0, RIM - 8, 168], 3, null, 12);
  box(root, 936, 22, 60, white, [0, RIM + 6, -165], 3, null, 10);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(840, RIM - 110, 6), MB('#cfeaff', { transparent: true, opacity: 0.2, depthWrite: false })); glass.position.set(0, (RIM + 100) / 2 + 4, 184); glass.renderOrder = 4; root.add(glass);
  /* water */
  const water = new THREE.Mesh(new THREE.BoxGeometry(840, 1, 326).translate(0, 0.5, 0), MB('#3fb0e2')); water.position.set(0, FLOOR, ZW); root.add(water);
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(840, 326).rotateX(-Math.PI / 2), MB('#9fe4f7')); root.add(surf);
  const rip = [0, 1, 2, 3].map(i => B_bar(root, 130, 2.5, 7, '#ffffff', [0, 0, ZW - 90 + i * 60]));
  /* ruler on the left of the front glass */
  const ruler = G(root, [-395, 0, 215]);
  box(ruler, 76, 380, 10, M('#ffffff', '#d8d8e4', 0), [0, 265, 0], 2.4, null, 3);
  for (let i = 0; i <= 10; i++) B_bar(ruler, i % 5 === 0 ? 46 : 28, 5, 4, B_INK, [16, FLOOR + HIN * i / 10, 7]);
  const marker = G(ruler); B_bar(marker, 84, 12, 14, '#e0322a', [0, 0, 9]); part(marker, new THREE.ConeGeometry(16, 34, 3).rotateZ(-Math.PI / 2), red, 1.6, [64, 0, 9]);
  const wline = B_bar(root, 836, 4, 4, '#e0322a', [0, 0, 190]);
  /* level-drop bracket + ghost line of the old level */
  const drop = G(root); const ghost = G(drop); for (let i = 0; i < 14; i++) B_bar(ghost, 40, 5, 4, '#ffd42a', [-400 + i * 62, 0, 192]);
  const brk = G(drop); const bv = B_bar(brk, 10, 1, 8, '#e0322a', [-318, 0, 205]), bc1 = B_bar(brk, 58, 9, 8, '#e0322a', [-318, 0, 205]), bc2 = B_bar(brk, 58, 9, 8, '#e0322a', [-318, 0, 205]);
  const ba = part(brk, new THREE.ConeGeometry(22, 40, 3).rotateZ(Math.PI), red, 1.6, [-318, 0, 205]);
  drop.visible = false;
  /* taps */
  const flow = [0, 0, 0], valve = [0, 0, 0], dripK = [0, 0, 0], glowK = [0, 0, 0];
  const taps = [-260, 0, 260].map((x, i) => {
    const g = G(root, [x, 0, 0]);
    box(g, 38, HEAD - RIM, 38, steel, [0, (RIM + HEAD) / 2, -150], 2.4, null, 8);
    box(g, 44, 46, 200, steel, [0, HEAD, -50], 2.4, null, 8);
    box(g, 58, 72, 58, steel, [0, HEAD - 40, 30], 2.4, null, 10);
    const vg = G(g, [0, HEAD + 23, -110]); box(vg, 14, 40, 14, steel, [0, 20, 0], 1.6, null, 3); box(vg, 100, 14, 14, red, [0, 42, 0], 1.6, null, 4); box(vg, 14, 14, 100, red, [0, 42, 0], 1.6, null, 4);
    const fm = makeFlowMat({ base: '#3fb0e2', light: '#d4f2f8', speed: 2.2, freq: 5 });
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10).translate(0, -0.5, 0), fm); stream.position.set(0, HEAD - 76, 30); stream.frustumCulled = false; g.add(stream);
    const dp = new THREE.Mesh(new THREE.SphereGeometry(13, 10, 8).scale(1, 1.4, 1), MB('#3fb0e2')); dp.position.set(0, HEAD - 80, 30); g.add(dp);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(70, 7, 8, 30), MB('#fff3a0', { transparent: true, opacity: 0, depthWrite: false })); ring.position.set(0, HEAD - 40, 30); ring.renderOrder = 8; g.add(ring);
    return { g, vg, stream, dp, ring, fm };
  });
  /* exits: dark outlines (sun above, pipe on the right, gate at the bottom) */
  const outl = [G(root), G(root), G(root)], outM = [[], [], []];
  const ob = (k, w, h, x, y) => { const m = B_bar(outl[k], w, h, 8, B_INK, [x, y, 0], { transparent: true, opacity: 1, depthWrite: false }); outM[k].push(m.material); return m; };
  { const sg = outl[0]; sg.position.set(500, 830, 0); const r = new THREE.Mesh(new THREE.TorusGeometry(95, 6, 8, 36), MB(B_INK, { transparent: true, opacity: 1 })); sg.add(r); outM[0].push(r.material);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, m = B_bar(sg, 60, 10, 8, B_INK, [Math.cos(a) * 150, Math.sin(a) * 150, 0], { transparent: true, opacity: 1 }); m.rotation.z = a; outM[0].push(m.material); } }
  ob(1, 324, 8, 628, 455); ob(1, 324, 8, 628, 195); ob(1, 8, 260, 790, 325);
  ob(2, 234, 8, 583, 190); ob(2, 234, 8, 583, 90); ob(2, 8, 100, 700, 140);
  /* real bottom gate */
  const gate = G(root); box(gate, 6, 100, 200, MB('#262d3a'), [466, 140, 0], 0, null, 1);
  const plate = G(gate, [474, 140, 0]); box(plate, 14, 104, 214, steel, [0, 0, 0], 2.6, null, 3); box(plate, 10, 22, 24, red, [8, 70, 0], 1.6, null, 3);
  const gfm = makeFlowMat({ base: '#3fb0e2', light: '#d4f2f8', speed: 1.8, freq: 1.2 });
  const chute = new THREE.Mesh(ribbon([[466, 118, ZW], [560, 108, ZW], [700, 82, ZW], [820, 36, ZW], [920, 6, ZW]], 196, 100), gfm); chute.frustumCulled = false; gate.add(chute); chute.visible = false;
  let level = 0.5, T = 0, gOpen = 0;
  const api = {
    root, RIM, FLOOR, HIN, HEAD, rimTop: RIM + 17, levelY: k => FLOOR + HIN * k, waterY: () => FLOOR + HIN * level, get level() { return level; },
    anchors: { tap: i => [[-260, 0, 260][i], HEAD - 40, 30], valve: i => [[-260, 0, 260][i], HEAD + 66, -110], pipeMouth: [466, 325, 0], gate: [466, 140, 0], sun: [500, 830, 0], ruler: [-395, 280, 215], water: () => [0, FLOOR + HIN * level, ZW], rimBack: [0, RIM + 17, -165] },
    setLevel(k) { level = k; const y = FLOOR + HIN * k; water.scale.y = Math.max(0.001, HIN * k); surf.position.set(0, y + 0.8, ZW); marker.position.y = y; wline.position.y = y;
      rip.forEach(r => { r.position.y = y + 2.2; r.visible = k > 0.03; }); surf.visible = k > 0.01; water.visible = k > 0.005; },
    setMark(v) { marker.visible = v; wline.visible = v; },
    setDrop(kOld, kNew, vis) { drop.visible = !!vis; if (!vis) return; const yo = FLOOR + HIN * kOld, yn = FLOOR + HIN * kNew; ghost.position.y = yo; const h = Math.max(1, yo - yn);
      bv.scale.y = h; bv.position.y = (yo + yn) / 2; bc1.position.y = yo; bc2.position.y = yn; ba.position.y = yn - 30; },
    setTap(i, k) { flow[i] = k; }, setValve(i, a) { taps[i].vg.rotation.y = a; }, setDrip(i, k) { dripK[i] = k; }, setGlow(i, k) { glowK[i] = k; taps[i].ring.material.opacity = 0.9 * k; },
    showTaps(a) { taps.forEach((tp, i) => { tp.g.visible = !!a[i]; }); },
    setExits(a, b, c) { [a, b, c].forEach((k, i) => { outl[i].visible = k > 0.01; outM[i].forEach(m => { m.opacity = k; }); }); },
    setGate(k) { gOpen = k; plate.position.y = 140 + 108 * k; chute.visible = k > 0.05; gfm.uniforms.uK.value = 0.4 + 1.6 * k; gate.visible = true; },
    update(t) { T = t; const y = FLOOR + HIN * level;
      rip.forEach((r, i) => { r.position.x = ((i * 233 + t * 36) % 700) - 350; r.scale.x = 0.6 + 0.4 * Math.sin(t * 2 + i); });
      taps.forEach((tp, i) => { const f = flow[i], top = HEAD - 76, len = Math.max(1, top - y); tp.stream.visible = f > 0.02 && tp.g.visible; tp.stream.scale.set(14 * f, len, 14 * f); tp.fm.uniforms.uT.value = t;
        const dk = dripK[i], u = (t * 1.3 + i * 0.37) % 1; tp.dp.visible = dk > 0.02 && f < 0.02 && tp.g.visible; tp.dp.position.y = HEAD - 80 - u * u * (top - y); tp.dp.scale.setScalar(0.5 + 0.5 * Math.min(1, u * 3)); });
      gfm.uniforms.uT.value = t; },
  };
  api.setLevel(0.5); api.setMark(true); api.setExits(0, 0, 0); api.setGate(0); api.update(0); return api;
}

/* balance scale: beam rocks with setTilt(a) (a > 0 = the IN pan on the right goes down), pans hang from the ends. panTop(side) = top centre of a pan in local coords. */
export function makeBalanceScale() {
  const root = G(), PIV = 720, ARM = 430, HANG = 380, PR = 190;
  const wood = M('#b98a58', '#c8a88e'), steel = M('#5b82ad', '#8aa0c0'), gold = M('#e8b830', '#b8902a', 0), blue = M('#2f9be0', '#8ab0d8'), orange = M('#e8903a', '#c8a080');
  part(root, new THREE.CylinderGeometry(200, 220, 40, 32).translate(0, 20, 0), wood, 3);
  part(root, new THREE.CylinderGeometry(24, 32, PIV - 40, 14).translate(0, (PIV + 40) / 2, 0), steel, 2.6);
  part(root, ell(46, 46, 46, 16, 12), gold, 2.4, [0, PIV, 0]);
  const beam = G(root, [0, PIV, 0]); box(beam, 2 * ARM + 70, 30, 38, steel, [0, 0, 0], 2.6, null, 8); part(beam, ell(24, 24, 24, 12, 8), gold, 2, [-ARM, 0, 0]); part(beam, ell(24, 24, 24, 12, 8), gold, 2, [ARM, 0, 0]);
  const mkPan = m => { const g = G(root); part(g, new THREE.CylinderGeometry(PR, PR * 0.8, 30, 32).translate(0, -15, 0), m, 3); part(g, new THREE.TorusGeometry(PR, 8, 8, 36).rotateX(Math.PI / 2), m, 2.4, [0, 0, 0]); return g; };
  const pans = { in: mkPan(blue), out: mkPan(orange) };
  const sMat = MB(B_INK), strs = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 5, 5), sMat); root.add(m); return m; });
  let tilt = 0;
  const endPt = s => [s * ARM * Math.cos(tilt), PIV - s * ARM * Math.sin(tilt), 0];
  const api = { root, PIV, ARM, PR,
    panTop(side) { const e = endPt(side === 'in' ? 1 : -1); return [e[0], e[1] - HANG, 0]; },
    setTilt(a) { tilt = a; beam.rotation.z = -a;
      [['in', 1], ['out', -1]].forEach(([k, s], j) => { const e = endPt(s), p = [e[0], e[1] - HANG, 0]; pans[k].position.set(p[0], p[1], 0);
        B_str(strs[j * 2], [e[0], e[1], 0], [p[0] - PR * 0.9, p[1], 0]); B_str(strs[j * 2 + 1], [e[0], e[1], 0], [p[0] + PR * 0.9, p[1], 0]); }); },
  };
  api.setTilt(0); return api;
}

/* ear of corn (icon), faces +z */
export function makeCornEar() {
  const g = G(), y = M('#f2c230', '#c8a020', 0), dk = M('#d79a1a', '#a87a14', 0), gr = M('#5aa63a', '#3f7f2a');
  part(g, ell(44, 112, 44, 18, 14), y, 3, [0, 0, 0]);
  for (let i = 0; i < 7; i++) B_bar(g, 74, 4, 4, '#b8861a', [0, -80 + i * 26, 40]).scale.x = 1 - Math.abs(i - 3) * 0.12;
  for (let i = 0; i < 4; i++) B_bar(g, 4, 190, 4, '#b8861a', [-26 + i * 17, 0, 38]).scale.y = 0.9;
  for (const s of [-1, 1]) { const l = part(g, new THREE.ConeGeometry(34, 190, 4).scale(1, 1, 0.3).translate(0, 95, 0), gr, 2.6, [s * 30, -110, 10]); l.rotation.z = -s * 0.28; }
  return g;
}

/* Mount Hermon for the relief map (toy mountain, base radius 110, height 124): snow cap, falling flakes, a snow cloud. units = map units */
export function makeSnowHermon() {
  const root = G(), H = 124;
  const prof = [[110, 0], [92, 18], [70, 45], [48, 78], [30, 102], [12, 118], [0.01, H]];
  part(root, new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 28), M('#8d9872', '#6c7658'), 2.6);
  const cap = prof.filter(p => p[1] >= 62).map(p => new THREE.Vector2(p[0] * 1.03 + 1.5, p[1] + 1.5)); cap.unshift(new THREE.Vector2(53, 62));
  part(root, new THREE.LatheGeometry(cap, 28), M('#f6f9fb', '#cfd8e2'), 2.2);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 0.3; part(root, ell(16, 9, 12, 12, 8), M('#f6f9fb', '#cfd8e2', 0), 1.6, [Math.cos(a) * 52, 58, Math.sin(a) * 52]); }
  const cloud = KT.makeCloud(53, { s: 0.55, col: '#e8eef6', tint: '#a8b4c6' }); cloud.position.set(0, 285, 0); root.add(cloud);
  const N = 90, r = rng(17), fl = new THREE.InstancedMesh(new THREE.OctahedronGeometry(4.5, 0), MB('#ffffff'), N); fl.frustumCulled = false; fl.renderOrder = 6; root.add(fl);
  const it = []; for (let i = 0; i < N; i++) it.push([(r() - 0.5) * 360, (r() - 0.5) * 360, r(), 0.7 + r() * 0.6]); const dm = new THREE.Object3D(); let fk = 1;
  return { root, cloud, height: H, summit: [0, H, 0], setFlakes(k) { fk = k; }, setCloud(k) { cloud.visible = k > 0.02; cloud.scale.setScalar(Math.max(0.001, k)); },
    snow(t) { for (let i = 0; i < N; i++) { const p = it[i], on = p[2] < fk, u = (p[2] * 3 + t * 0.2 * p[3]) % 1; dm.position.set(p[0] + 10 * Math.sin(t * 1.3 + i), 270 * (1 - u) + 6, p[1]); const s = on ? 1 : 0.001; dm.scale.set(s, s, s); dm.rotation.set(t * 0.8 + i, t * 0.5, 0); dm.updateMatrix(); fl.setMatrixAt(i, dm.matrix); } fl.instanceMatrix.needsUpdate = true; } };
}

/* cut-away of the Hermon slope: snow on the high left, layered rock, three dotted underground paths that end at three spring mouths (x = 540, 700, 860) */
export function makeSpringCut() {
  const root = G(), D = 260, FZ = D / 2;
  const PR = [[-1000, 600], [-700, 590], [-200, 380], [300, 150], [1000, 120]];
  const yAt = x => { if (x <= PR[0][0]) return PR[0][1]; for (let i = 1; i < PR.length; i++) if (x <= PR[i][0]) { const u = (x - PR[i - 1][0]) / (PR[i][0] - PR[i - 1][0]); return PR[i - 1][1] + (PR[i][1] - PR[i - 1][1]) * u; } return PR[PR.length - 1][1]; };
  const xs = []; for (let x = -1000; x <= 1000; x += 100) xs.push(x);
  const ext = (shape, depth, z0) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(0, 0, z0);
  { const sh = new THREE.Shape(); sh.moveTo(-1000, -250); xs.forEach(x => sh.lineTo(x, yAt(x))); sh.lineTo(1000, -250); sh.closePath(); part(root, ext(sh, D, -FZ), M('#a98a66', '#8a6c4c'), 3.2); }
  const band = (a, h, hex) => { const sh = new THREE.Shape(); xs.forEach((x, i) => { const y = Math.max(-240, yAt(x) - a); i ? sh.lineTo(x, y) : sh.moveTo(x, y); }); for (let i = xs.length - 1; i >= 0; i--) sh.lineTo(xs[i], Math.max(-245, yAt(xs[i]) - a - h)); sh.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), MB(hex)); m.position.z = FZ + 1.5; root.add(m); return m; };
  band(70, 46, '#c7a97b'); band(190, 70, '#8e7155'); band(330, 50, '#c7a97b'); band(450, 80, '#8e7155');
  const layer = (x0, x1, th, hex, hi) => { const sh = new THREE.Shape(), q = xs.filter(x => x >= x0 && x <= x1); q.forEach((x, i) => { const y = yAt(x) + th; i ? sh.lineTo(x, y) : sh.moveTo(x, y); }); for (let i = q.length - 1; i >= 0; i--) sh.lineTo(q[i], yAt(q[i]) - 2); sh.closePath();
    part(root, ext(sh, D + 8, -FZ - 4), M(hex, hi), 2.4); };
  layer(-1000, -200, 38, '#f6f9fb', '#cfd8e2'); layer(-200, 1000, 18, '#79b84e', '#5f9a44');
  const mx = [540, 700, 860];
  const mouths = mx.map(x => { const g = G(root, [x, yAt(x), FZ]); part(g, new THREE.TorusGeometry(44, 10, 8, 20, Math.PI), M('#8d9098', '#6a6e78'), 2.4, [0, -6, 4]); part(g, new THREE.CircleGeometry(36, 20, 0, Math.PI), MB('#1c2430'), 0, [0, -6, 6]);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2), MB('#3fb0e2')); pool.position.set(0, 3, 70); pool.scale.set(60, 1, 52); g.add(pool);
    const blob = part(g, ell(20, 20, 20, 14, 10), M('#3fb0e2', '#2d8bc4', 0), 2, [0, 16, 40]); return { g, pool, blob }; });
  const S = [-760, 540], com = [S, [-600, 440], [-420, 330]];
  const paths = [[...com, [-250, 240], [-60, 160], [150, 90], [350, 50], [540, 45], [540, 128]], [...com, [-250, 260], [-60, 190], [150, 125], [350, 95], [700, 92], [700, 121]], [...com, [-250, 285], [-60, 232], [150, 158], [320, 122], [860, 108], [860, 116]]];
  const lens = paths.map(p => { const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return c; });
  const ptAt = (i, u) => { const p = paths[i], c = lens[i], d = u * c[c.length - 1]; let j = 1; while (j < c.length - 1 && d > c[j]) j++; const v = Math.min(1, Math.max(0, (d - c[j - 1]) / Math.max(1e-6, c[j] - c[j - 1]))); return [p[j - 1][0] + (p[j][0] - p[j - 1][0]) * v, p[j - 1][1] + (p[j][1] - p[j - 1][1]) * v, FZ + 18]; };
  const NP2 = 64, dm = new THREE.Object3D();
  const dots = paths.map((p, i) => { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(9, 8, 6), MB('#7fd4ff'), NP2); im.frustumCulled = false; im.renderOrder = 7; root.add(im);
    for (let k = 0; k < NP2; k++) { const q = ptAt(i, k / (NP2 - 1)); dm.position.set(q[0], q[1], q[2]); dm.scale.setScalar(1); dm.rotation.set(0, 0, 0); dm.updateMatrix(); im.setMatrixAt(k, dm.matrix); } im.count = 0; return im; });
  const N = 70, r = rng(23), fl = new THREE.InstancedMesh(new THREE.OctahedronGeometry(6, 0), MB('#ffffff'), N), dr = new THREE.InstancedMesh(new THREE.SphereGeometry(7, 8, 6).scale(1, 1.5, 1), MB('#3fb0e2'), N); [fl, dr].forEach(m => { m.frustumCulled = false; m.renderOrder = 6; root.add(m); });
  const it = []; for (let i = 0; i < N; i++) it.push([-950 + r() * 820, r(), 0.7 + r() * 0.6, r() * 100]); let melt = 0;
  return { root, yAt, mouthX: mx, FZ, setPath(i, k) { dots[i].count = Math.round(NP2 * Math.min(1, Math.max(0, k))); }, pathPoint: ptAt, mouthPos: i => [mx[i], yAt(mx[i]), FZ + 40],
    setMouth(i, k) { mouths[i].pool.visible = mouths[i].blob.visible = k > 0.02; mouths[i].pool.scale.set(60 * k + 0.01, 1, 52 * k + 0.01); mouths[i].blob.scale.setScalar(Math.max(0.001, k)); },
    setMelt(k) { melt = k; },
    snow(t) { for (let i = 0; i < N; i++) { const p = it[i], u = (p[1] * 3 + t * 0.16 * p[2]) % 1, x = p[0] + 12 * Math.sin(t * 1.2 + i), y = yAt(p[0]) + 40 + 380 * (1 - u);
        dm.position.set(x, y, p[3] - 50); dm.rotation.set(t + i, t * 0.6, 0); dm.scale.setScalar(Math.max(0.001, 1 - melt * 1.6)); dm.updateMatrix(); fl.setMatrixAt(i, dm.matrix);
        dm.rotation.set(0, 0, 0); dm.scale.setScalar(Math.max(0.001, melt * 1.6 > 1 ? 1 : melt * 1.6)); dm.updateMatrix(); dr.setMatrixAt(i, dm.matrix); }
      fl.instanceMatrix.needsUpdate = dr.instanceMatrix.needsUpdate = true; } };
}

/* a row of stepping-stone month slabs (flat), winter ones blue with three drops, the others with a sun; setGlow(k) pulses the winter ones */
export function makeCalendarStrip(o) {
  o = Object.assign({ n: 12, winter: [4, 5, 6, 7, 8], gap: 320 }, o || {});
  const root = G(), tiles = [], glows = [];
  for (let i = 0; i < o.n; i++) {
    const w = o.winter.indexOf(i) >= 0, g = G(root, [i * o.gap, 0, 0]);
    box(g, 280, 44, 220, M(w ? '#bfe3f7' : '#fffdf5', w ? '#8ab0d0' : '#d8d4e4', 0), [0, 22, 0], 3, null, 8);
    box(g, 280, 46, 50, M('#d6232a', '#b88080', 0), [0, 23, -85], 0, null, 8);
    const ic = G(g, [0, 46, 25]);
    if (w) { for (let k = 0; k < 3; k++) { const d = G(ic, [(k - 1) * 70, 0, 0]); const c = new THREE.Mesh(new THREE.CircleGeometry(26, 20).rotateX(-Math.PI / 2), MB('#2f9be0')); c.position.y = 1; d.add(c);
        const tr = new THREE.Mesh(new THREE.CircleGeometry(26, 3).rotateX(-Math.PI / 2).rotateY(Math.PI), MB('#2f9be0')); tr.position.set(0, 1.2, -34); tr.scale.set(0.8, 1, 1.3); d.add(tr); } }
    else { const s = new THREE.Mesh(new THREE.CircleGeometry(30, 20).rotateX(-Math.PI / 2), MB('#ffd42a')); s.position.y = 1; ic.add(s); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, rr = new THREE.Mesh(new THREE.PlaneGeometry(26, 8).rotateX(-Math.PI / 2), MB('#ff9a2a')); rr.position.set(Math.cos(a) * 50, 1, Math.sin(a) * 50); rr.rotation.y = -a; ic.add(rr); } }
    if (w) { const gl = new THREE.Mesh(new THREE.PlaneGeometry(350, 290).rotateX(-Math.PI / 2), MB('#7fd0ff', { transparent: true, opacity: 0.5, depthWrite: false })); gl.position.set(0, 1, 0); gl.renderOrder = 3; g.add(gl); glows.push(gl); }
    tiles.push(g);
  }
  return { root, tiles, topY: 46, tileX: i => i * o.gap, setGlow(k) { glows.forEach(g => { g.material.opacity = 0.12 + 0.55 * k; }); } };
}


/* ======================================================================== FILM C ADDITIONS (appended 01/11 by the film_c builder)
   makePumpStationC, makeClimbSlopeC (+ pipe, altitude pole, sea-level plane, bracket), makeRoadSlopeC, makeOpenCanalC, makeTunnelMountainC, makeSedimentPoolsC,
   makeGiantPipeC, makeTapC, makeSignBoardC, makeMapLineC. All deterministic (functions of t / setters), ASCII only, no Hebrew. Names carry the C suffix / FC_ prefix. */
const FC_INK = '#261c19';
export const FC_S = 6;   // units per metre in the climb slope / road slope
function FC_ribUV(pts, width, z, vs) {   // XY ribbon with uv (u across, v along)
  const pos = [], uv = [], idx = [], n = pts.length; let cum = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l, w = width / 2;
    if (i) cum += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    pos.push(pts[i][0] - nx * w, pts[i][1] - ny * w, z, pts[i][0] + nx * w, pts[i][1] + ny * w, z); uv.push(0, cum / (vs || 100), 1, cum / (vs || 100));
    if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}
const FC_basic = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, side: THREE.DoubleSide }, o || {}));
const FC_offs = (pts, d) => pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1; return [p[0] - ty / l * d, p[1] + tx / l * d]; });

/* ---- pump station: concrete hall with the front wall cut away, two flywheels, a piston rod, a pump casing on the pipe. Faces +z. Pipe centre is 170 above the root. */
export function makePumpStationC(o) {
  o = Object.assign({ wall: '#efe2c4', roof: '#3f7fc4', accent: '#ffd42a' }, o || {});
  const root = G(), W = 640, Hh = 600, Dp = 320, T = 26, PY = 170;
  const wallM = M(o.wall, '#cdbfb2'), inM = M('#51627c', '#7a8aa4', 0), roofM = M(o.roof, '#8aa0c0'), fl = M('#9a9fa8', '#b8bcc6'), metal = M('#c7ccd6', '#9aa0b0'), dark = M('#3a4254', '#6a7080', 0);
  box(root, W + 80, 30, Dp + 80, fl, [0, 15, 0], 2.4, null, 4);
  box(root, W, Hh, T, wallM, [0, 30 + Hh / 2, -Dp / 2], 2.4, null, 4);
  box(root, W - 80, Hh - 80, 6, inM, [0, 30 + Hh / 2, -Dp / 2 + T / 2 + 3], 0, null, 1);
  [-1, 1].forEach(s => box(root, T, Hh, Dp, wallM, [s * (W / 2 - T / 2), 30 + Hh / 2, 0], 2.4, null, 4));
  box(root, W + 90, 46, Dp + 90, roofM, [0, 30 + Hh + 23, 0], 2.6, null, 8);
  box(root, W - 2 * T, 36, T, wallM, [0, 30 + Hh - 18, Dp / 2 - T / 2], 2.2, null, 3);
  const sign = G(root, [0, 30 + Hh + 46 + 70, Dp / 2 - 30]);
  box(sign, 250, 120, 24, M(o.accent, '#d8b050', 0), [0, 0, 0], 2.6, null, 6);
  part(sign, ell(34, 34, 14, 18, 12), M('#2f9be0', '#8ab0d8'), 1.6, [0, -8, 16]); part(sign, new THREE.ConeGeometry(26, 44, 14).scale(1, 1, 0.5).translate(0, 22, 0), M('#2f9be0', '#8ab0d8'), 1.6, [0, 18, 16]);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(520, 300), FC_basic('#fff3a0', { transparent: true, opacity: 0, depthWrite: false })); halo.position.set(0, 30 + Hh + 120, Dp / 2 + 40); halo.renderOrder = 6; root.add(halo);
  const wy = 30 + Hh - 135, wz = -Dp / 2 + 75, wheels = [];
  [-150, 150].forEach(x => { const w = G(root, [x, wy, wz]); part(w, new THREE.TorusGeometry(105, 15, 8, 30), metal, 2.2); part(w, ell(30, 30, 18, 14, 10), dark, 1.6, [0, 0, 6]);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; const sp = box(w, 200, 14, 12, metal, [0, 0, 0], 1.2, null, 2); sp.rotation.z = a; }
    part(w, ell(12, 12, 12, 8, 6), M('#d6232a', '#b88080', 0), 0, [70, 0, 14]); wheels.push(w); });
  box(root, 300, 10, 10, dark, [0, wy + 108, wz + 4], 0, null, 1); box(root, 300, 10, 10, dark, [0, wy - 108, wz + 4], 0, null, 1);
  const casing = part(root, new THREE.CylinderGeometry(190, 190, 150, 24).rotateZ(Math.PI / 2), M('#8fa4bd', '#aab6c8'), 2.4, [-150, PY, 0]);
  const rod = box(root, 18, 150, 14, metal, [-150, PY + 190 + 40, wz + 20], 1.4, null, 2);
  const m = { root, PY, W, setSpin(a) { wheels.forEach((w, i) => { w.rotation.z = i ? -a : a; }); rod.position.y = PY + 190 + 40 + 40 * Math.sin(a); }, setGlow(k) { halo.material.opacity = 0.55 * k; halo.visible = k > 0.01; }, anchors: { inL: [-W / 2 - 40, PY, 0], outR: [W / 2 + 40, PY, 0], sign: [0, 30 + Hh + 116, Dp / 2] } };
  m.setSpin(0); m.setGlow(0); return m;
}

/* ---- the climb: lake + terraced slope (cut-away block), glass pipe from the lake up in two lifts, sea-level plane, altitude pole with a pointer and digits, bracket with a huge number.
   Local: x right (east), y up, 6 units per metre, lake surface y = 0, z toward the viewer (front face at z = D/2). */
export function makeClimbSlopeC() {
  const root = G(), D = 360, S = FC_S, SEA = 210 * S, PR = 170;
  const GT = [[-1700, -380], [-1200, -380], [-600, -300], [-100, -120], [200, -10], [950, 0], [1250, 310], [1600, 760], [1950, 1180], [2250, 1500], [3250, 1500], [3600, 1820], [3950, 2220], [5000, 2220]];
  const yAt = x => FA_lin(GT, x);
  const body = new THREE.Mesh(FA_ext(FA_polyShape([...GT, [5000, -900], [-1700, -900]]), D, -D / 2), M('#b88c5c', '#8f6a48')); root.add(body);
  { const h = body.geometry.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); const hull = new THREE.Mesh(mergeV(h, 1e-3), KT_hull(5)); hull.geometry.computeVertexNormals(); root.add(hull); }
  { const top = GT.slice(1), bot = top.slice().reverse().map(p => [p[0], p[1] - 70]); root.add(new THREE.Mesh(FA_ext(FA_polyShape([...top.filter(p => p[0] >= 200), ...bot.filter(p => p[0] >= 200)]), D + 4, -D / 2 - 2), M('#79b84e', '#5f9a44', 0))); }
  { const top = GT.filter(p => p[0] <= 200), bot = top.slice().reverse().map(p => [p[0], p[1] - 40]); root.add(new THREE.Mesh(FA_ext(FA_polyShape([...top, ...bot]), D + 4, -D / 2 - 2), M('#d8c594', '#b9b0c4', 0))); }
  const lakePoly = [[-1700, 0], [200, 0], [200, -10], [-100, -120], [-600, -300], [-1200, -380], [-1700, -380]];
  const lake = new THREE.Mesh(FA_ext(FA_polyShape(lakePoly), D - 8, -(D - 8) / 2), FA_waterMat('#8fe4e2', '#2c93b4', -380, 0)); root.add(lake);
  { const f = new THREE.Mesh(new THREE.BoxGeometry(1900, 8, 3), FA_basic('#ffffff')); f.position.set(-750, 0, D / 2 - 3); root.add(f); }
  /* sea level: dashes + a faint plane */
  const ND = 50, dash = new THREE.InstancedMesh(new THREE.BoxGeometry(80, 14, 6), FA_basic('#ffd42a'), ND), dm = new THREE.Object3D(); dash.frustumCulled = false; dash.renderOrder = 8;
  const seaG = G(root, [-1700, SEA, 0]); seaG.add(dash);
  for (let i = 0; i < ND; i++) { dm.position.set(i * 140 + 40, 0, D / 2 + 12); dm.updateMatrix(); dash.setMatrixAt(i, dm.matrix); }
  const seaPl = new THREE.Mesh(new THREE.BoxGeometry(6900, 10, D + 30), FA_basic('#fff3a0', { transparent: true, opacity: 0.28, depthWrite: false })); seaPl.position.set(3450, 0, 0); seaPl.renderOrder = 5; seaG.add(seaPl);
  const seaGlow = new THREE.Mesh(new THREE.PlaneGeometry(6900, 120), FA_basic('#ffd42a', { transparent: true, opacity: 0, depthWrite: false })); seaGlow.position.set(3450, 0, D / 2 + 14); seaGlow.renderOrder = 6; seaG.add(seaGlow);
  /* the pipe */
  const PP = [[-1300, -150], [-650, -90], [-150, 60], [200, 170], [950, 170], [1250, 480], [1600, 930], [1950, 1350], [2250, 1670], [3250, 1670], [3600, 1990], [3950, 2390], [4350, 2390]];
  const curve = new THREE.CatmullRomCurve3(PP.map(p => new THREE.Vector3(p[0], p[1], 0)), false, 'centripetal'), SP = curve.getSpacedPoints(260).map(p => [p.x, p.y]);
  const NPP = SP.length - 1, flowM = makeFlowMat({ base: '#43aed0', light: '#bfeaf4', speed: 1.8, freq: 1.0 });
  const flow = new THREE.Mesh(FC_ribUV(SP, 2 * PR - 24, -30, 100), flowM); flow.renderOrder = 2; root.add(flow);
  [-1, 1].forEach(s => { const w = new THREE.Mesh(FC_ribUV(FC_offs(SP, s * PR), 16, 4, 100), FA_basic(FC_INK)); w.renderOrder = 3; root.add(w); });
  [[-1, 1], [1, 1]].forEach(([s]) => { const w = new THREE.Mesh(FC_ribUV(FC_offs(SP, s * (PR - 14)), 8, 5, 100), FA_basic('#e6f6ff')); w.renderOrder = 3; root.add(w); });
  const glass = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, PR, 14, false), FA_basic('#cfeeff', { transparent: true, opacity: 0.2, depthWrite: false })); glass.renderOrder = 4; root.add(glass);
  const cum = [0]; for (let i = 1; i < SP.length; i++) cum.push(cum[i - 1] + Math.hypot(SP[i][0] - SP[i - 1][0], SP[i][1] - SP[i - 1][1])); const LEN = cum[cum.length - 1];
  const pipeAt = u => { const d = cl(u, 0, 1) * LEN; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const r = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return [SP[i - 1][0] + (SP[i][0] - SP[i - 1][0]) * r, SP[i - 1][1] + (SP[i][1] - SP[i - 1][1]) * r, Math.atan2(SP[i][1] - SP[i - 1][1], SP[i][0] - SP[i - 1][0])]; };
  const uOfX = x => { let lo = 0, hi = 1; for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if (pipeAt(mid)[0] < x) lo = mid; else hi = mid; } return (lo + hi) / 2; };
  /* altitude pole at the right edge, in front of the cut face */
  const PX = 4700, pole = G(root, [PX, 0, D / 2 + 50]);
  box(pole, 90, 2560, 30, M('#fbf6e6', '#d8d4e4', 0), [0, 1230, 0], 3, null, 4);
  for (let i = 0; i <= 8; i++) box(pole, i % 2 ? 50 : 70, 10, 34, M('#1d2a44', '#1d2a44', 0), [-70, i * 300, 0], 0, null, 1);
  const flag = G(pole, [60, 0, 24]); part(flag, new THREE.ConeGeometry(46, 100, 3).rotateZ(Math.PI / 2), M('#ffd42a', '#d8b050', 0), 2.4, [50, 0, 0]);
  const dig = numPlane('0', 380, 180, { bg: '#fff3a0', bd: '#1d2a44', k: 0.8 }); dig.position.set(-420, 0, 30); dig.scale.setScalar(1.5); pole.add(dig);
  const brk = G(pole, [260, 0, 10]); const bm = FA_basic('#d6232a');
  const bb = [new THREE.Mesh(new THREE.PlaneGeometry(40, 1), bm), new THREE.Mesh(new THREE.PlaneGeometry(110, 40), bm), new THREE.Mesh(new THREE.PlaneGeometry(110, 40), bm)]; bb.forEach(q => { q.renderOrder = 9; brk.add(q); });
  const big = numPlane('370', 1500, 640, { fg: '#d6232a', bg: '#fff3a0', bd: '#1d2a44', k: 0.9 }); big.position.set(1180, 1110, 40); pole.add(big);
  const m = {
    root, D, S, SEA, PR, yAt, pipeAt, uOfX, LEN, flowM, GT, PP, poleX: PX, digits: dig, big, anchors: { lake: [-700, 0], st1: [570, 0], st2: [2750, 1500], top: [4350, 2390], poleX: PX },
    setSea(k) { dash.count = Math.floor(ND * cl(k, 0, 1)); seaPl.visible = k > 0.02; seaPl.scale.x = Math.max(0.001, k); seaPl.position.x = 3450 * k; seaG.visible = k > 0.01; },
    seaGlow(k) { seaGlow.material.opacity = 0.7 * k; seaGlow.visible = k > 0.01; },
    setPointer(y, show) { flag.position.y = y; dig.position.y = y; flag.visible = dig.visible = !!show; },
    setBracket(k) { const h = 2220 * cl(k, 0, 1); brk.visible = k > 0.01; bb[0].scale.y = Math.max(1, h); bb[0].position.set(0, h / 2, 0); bb[1].position.set(-35, 0, 0); bb[2].position.set(-35, h, 0); big.visible = k > 0.5; big.scale.setScalar(Math.max(0.001, sm(cl((k - 0.55) / 0.35, 0, 1)))); },
    update(t) { flowM.uniforms.uT.value = t; },
  };
  m.setSea(0); m.setPointer(0, false); m.setBracket(0); return m;
}

/* ---- the hill road: a winding ribbon on a hill whose top is 2660 high (same vertical scale as the pipe slope); draw(k) reveals it segment by segment. Local: x right, y up. */
export function makeRoadSlopeC(o) {
  o = Object.assign({ h: 2660, cx: -3900, w: 1250, x0: -5800, x1: -1700 }, o || {}); const root = G(), D = 360;
  const yAt = x => o.h * Math.exp(-(((x - o.cx) / o.w) ** 2)) * (1 + 0.03 * Math.sin(x * 0.01));
  const top = []; for (let x = o.x0; x <= -2300; x += 80) top.push([x, Math.max(-380, yAt(x))]); top.push([-1700, -380]);
  const body = new THREE.Mesh(FA_ext(FA_polyShape([...top, [-1700, -900], [o.x0, -900]]), D, -D / 2), M('#b88c5c', '#8f6a48')); root.add(body);
  { const h = body.geometry.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); const hull = new THREE.Mesh(mergeV(h, 1e-3), KT_hull(5)); hull.geometry.computeVertexNormals(); root.add(hull); }
  { const gt = top.slice(), gb = top.slice().reverse().map(p => [p[0], p[1] - 80]); root.add(new THREE.Mesh(FA_ext(FA_polyShape([...gt, ...gb]), D + 4, -D / 2 - 2), M('#79b84e', '#5f9a44', 0))); }
  [[-300, 0.9, 4], [-120, 1.1, 5], [160, 0.8, 6]].forEach(([dx, sc, sd], i) => { const hs = makeHouse(sd, { garden: false }); hs.scale.setScalar(2.2 * sc); const x = -2150 + dx * 0.0 - i * 330; hs.position.set(x, Math.max(0, yAt(x)) + 4, 70); root.add(hs); });
  const flag = G(root, [o.cx, o.h - 10, 0]); box(flag, 14, 300, 14, M('#6e4a2c', '#9a7a66'), [0, 150, 0], 2, null, 3); box(flag, 170, 100, 8, M('#d6232a', '#b88080'), [92, 250, 0], 2, null, 2);
  const lv = [-40, 360, 800, 1240, 1680, 2100, 2460, o.h - 40], half = y => o.w * Math.sqrt(Math.max(0.02, Math.log(o.h / Math.max(y, 40))));
  const way = lv.map((y, i) => { const hw = Math.min(1150, half(Math.max(y, 40))) - 150; return [o.cx + (i === lv.length - 1 ? 0 : (i % 2 ? hw : -hw)), y]; });
  const rc = new THREE.CatmullRomCurve3(way.map(p => new THREE.Vector3(p[0], p[1], 0)), false, 'centripetal'), RP = rc.getSpacedPoints(140).map(p => [p.x, p.y]), NR = RP.length - 1;
  const mk = (w, c, z, ro) => { const g = FC_ribUV(RP, w, z, 100); const q = new THREE.Mesh(g, FA_basic(c)); q.renderOrder = ro; root.add(q); return g; };
  const gs = [mk(190, FC_INK, D / 2 + 8, 7), mk(140, '#8a8f9a', D / 2 + 10, 8), mk(100, '#b7bcc6', D / 2 + 12, 9)];
  const mid = new THREE.Mesh(FC_ribUV(RP, 10, 1, 100), new THREE.ShaderMaterial({ side: THREE.DoubleSide, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'varying vec2 vUv; void main(){ if (fract(vUv.y * 0.8) > 0.5) discard; gl_FragColor = vec4(1.0, 0.95, 0.6, 1.0); }' })); mid.position.z = D / 2 + 14; mid.renderOrder = 10; root.add(mid); gs.push(mid.geometry);
  const roadAt = u => { const f = cl(u, 0, 1) * NR, i = Math.min(NR - 1, Math.floor(f)), r = f - i; return [RP[i][0] + (RP[i + 1][0] - RP[i][0]) * r, RP[i][1] + (RP[i + 1][1] - RP[i][1]) * r]; };
  const m = { root, yAt, top: o.h, peak: [o.cx, o.h], roadAt, flag, NR, D, draw(k) { const n = Math.floor(cl(k, 0, 1) * NR) * 6; gs.forEach(g => g.setDrawRange(0, n)); flag.visible = k > 0.98; } };
  m.draw(0); return m;
}

/* ---- open canal on a plain (concrete trough, flowing water stripes along +x). Local: canal along x from 0 to len, water surface y = 80, z toward the viewer. */
export function makeOpenCanalC(o) {
  o = Object.assign({ len: 3500, w: 560, x0: 0, braces: true }, o || {}); const root = G(), { len, w } = o;
  const wallM = M('#d9d6cf', '#b9b0c4'), flowM = makeFlowMat({ base: '#43aed0', light: '#c4edf5', speed: 2.4, freq: 1.0 });
  box(root, len, 130, 44, wallM, [len / 2, 65, -w / 2 - 22], 2.4, null, 4); box(root, len, 130, 44, wallM, [len / 2, 65, w / 2 + 22], 2.4, null, 4); box(root, len, 30, w + 88, M('#a8a59e', '#9a9aa8'), [len / 2, 15, 0], 2.2, null, 4);
  const g = new THREE.BufferGeometry(), pos = [], uv = [], idx = []; const NS = Math.max(2, Math.round(len / 100));
  for (let i = 0; i <= NS; i++) { const x = len * i / NS; pos.push(x, 80, -w / 2, x, 80, w / 2); uv.push(0, x / 100, 1, x / 100); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  const water = new THREE.Mesh(g, flowM); water.renderOrder = 2; root.add(water);
  for (let x = 120; x < len && o.braces; x += 400) box(root, 36, 50, w + 100, wallM, [x, 140, 0], 1.6, null, 3);
  return { root, len, w, flowM, update(t) { flowM.uniforms.uT.value = t; } };
}

/* ---- a ridge-shaped dark mountain along x with a short tunnel through it (arch 560 wide, 420 high), portals with concrete rims, dark liner inside. Local: x along the tunnel, centred on x = 0. */
export function makeTunnelMountainC(o) {
  o = Object.assign({ len: 1900, h: 980, hw: 1200 }, o || {}); const root = G(), AR = 280, AH = 420;
  const outline = []; for (let z = -o.hw; z <= o.hw; z += 60) outline.push([z, Math.max(0, o.h * Math.exp(-((z / 560) ** 2)) * (1 + 0.04 * Math.sin(z * 0.02)))]);
  const sh = new THREE.Shape(); sh.moveTo(-o.hw, -100); outline.forEach(p => sh.lineTo(p[0], p[1])); sh.lineTo(o.hw, -100); sh.closePath();
  const arch = new THREE.Path(); arch.moveTo(-AR, 0); arch.lineTo(-AR, AH - AR); arch.absarc(0, AH - AR, AR, Math.PI, 0, true); arch.lineTo(AR, 0); arch.closePath(); sh.holes.push(arch);
  const fix = g => { g.rotateY(-Math.PI / 2); g.translate(o.len / 2, 0, 0); return g; };
  const rock = new THREE.Mesh(fix(new THREE.ExtrudeGeometry(sh, { depth: o.len, bevelEnabled: false })), M('#7c6a5a', '#8f8aa0')); root.add(rock);
  { const h = rock.geometry.clone(); for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k); const hull = new THREE.Mesh(mergeV(h, 1e-3), KT_hull(5)); hull.geometry.computeVertexNormals(); root.add(hull); }
  const gt = outline.map(p => [p[0], p[1]]), gb = outline.slice().reverse().map(p => [p[0], p[1] - 70]); const gsh = new THREE.Shape(); [...gt, ...gb].forEach((p, i) => i ? gsh.lineTo(p[0], p[1]) : gsh.moveTo(p[0], p[1])); gsh.closePath();
  const grass = new THREE.Mesh(fix(new THREE.ExtrudeGeometry(gsh, { depth: o.len + 4, bevelEnabled: false }).translate(0, 0, -2)), M('#5f9a44', '#4a7f38', 0)); root.add(grass);
  const archSh = new THREE.Shape(); archSh.moveTo(-AR + 6, 0); archSh.lineTo(-AR + 6, AH - AR); archSh.absarc(0, AH - AR, AR - 6, Math.PI, 0, true); archSh.lineTo(AR - 6, 0); archSh.closePath();
  const liner = new THREE.Mesh(fix(new THREE.ExtrudeGeometry(archSh, { depth: o.len + 2, bevelEnabled: false }).translate(0, 0, -1)), FA_basic('#3a4160', { side: THREE.BackSide })); root.add(liner);
  [-1, 1].forEach(s => { const rim = new THREE.Shape(); rim.moveTo(-AR - 40, 0); rim.lineTo(-AR - 40, AH - AR); rim.absarc(0, AH - AR, AR + 40, Math.PI, 0, true); rim.lineTo(AR + 40, 0); rim.closePath();
    const hole = new THREE.Path(); hole.moveTo(-AR, 0); hole.lineTo(-AR, AH - AR); hole.absarc(0, AH - AR, AR, Math.PI, 0, true); hole.lineTo(AR, 0); hole.closePath(); rim.holes.push(hole);
    part(root, fix(new THREE.ExtrudeGeometry(rim, { depth: 40, bevelEnabled: false })).translate(s * (o.len / 2 + (s > 0 ? 0 : 0)) - (s > 0 ? 40 : 0), 0, 0), M('#d9d6cf', '#b9b0c4'), 2.2); });
  const flag = G(root, [0, o.h - 6, 0]); box(flag, 12, 240, 12, M('#6e4a2c', '#9a7a66'), [0, 120, 0], 2, null, 3); box(flag, 130, 80, 8, M('#d6232a', '#b88080'), [72, 200, 0], 2, null, 2);
  return { root, len: o.len, AR, AH, topY: o.h, hw: o.hw, hillAt: z => Math.max(0, o.h * Math.exp(-((z / 560) ** 2))) };
}

/* ---- three square pools in cut-away: glass front, murky water that clears from the top down (setClear), brown grains that sink. Local: pools along x (gap 900), floor y = 0, water top y = 420, front z = +250. */
export function makeSedimentPoolsC(o) {
  o = Object.assign({ n: 3, gap: 900, grains: 130 }, o || {}); const root = G(), PW = 700, PD = 500, WH = 420, n = o.n;
  const concrete = M('#d9d6cf', '#b9b0c4'), mudM = M('#7a5630', '#9a7a56', 0), waters = [];
  box(root, (n - 1) * o.gap + PW + 260, 40, PD + 260, M('#a8a59e', '#9a9aa8'), [(n - 1) * o.gap / 2, -20, 0], 2.4, null, 4);
  for (let i = 0; i < n; i++) {
    const cx = i * o.gap;
    box(root, PW, 24, PD, M('#8f8a80', '#a8a0b0'), [cx, 12, 0], 1.6, null, 3);
    [-1, 1].forEach(s => box(root, 50, WH + 70, PD + 60, concrete, [cx + s * (PW / 2 + 25), (WH + 70) / 2, 0], 2.4, null, 4));
    box(root, PW, WH + 70, 50, concrete, [cx, (WH + 70) / 2, -PD / 2 - 25], 2.4, null, 4);
    const wm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uK: { value: 0 }, uB: { value: col('#8a6a3c') }, uC: { value: col('#4fb6f0') }, uCl: { value: col('#a8e4f6') } },
      vertexShader: 'varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform float uK; uniform vec3 uB, uC, uCl; varying float vY; void main(){ float h = vY / ' + WH.toFixed(1) + '; float line = 1.0 - uK * 1.05; float c = smoothstep(line - 0.08, line + 0.04, h); vec3 clear = mix(uC, uCl, h); vec3 mud = mix(uB * 0.8, uB, h); gl_FragColor = vec4(mix(mud, clear, c), mix(0.86, 0.5, c * 0.7)); }' });
    const wmesh = new THREE.Mesh(new THREE.BoxGeometry(PW, WH, PD).translate(0, WH / 2, 0), wm); wmesh.position.set(cx, 24, 0); wmesh.renderOrder = 5; root.add(wmesh);
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD).rotateX(-Math.PI / 2), FA_basic('#cfeef8', { transparent: true, opacity: 0.55, depthWrite: false })); surf.position.set(cx, 24 + WH + 1, 0); surf.renderOrder = 6; root.add(surf);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(PW + 2, WH + 40), FA_basic('#e6f6ff', { transparent: true, opacity: 0.1, depthWrite: false })); gl.position.set(cx, 24 + WH / 2, PD / 2 + 2); gl.renderOrder = 7; root.add(gl);
    waters.push({ wm, surf, cx });
  }
  const NG = o.grains, im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: '#6b4a26' }), NG * n), dm = new THREE.Object3D(); im.frustumCulled = false; im.renderOrder = 4; root.add(im);
  const rnd = rng(77), G0 = []; for (let i = 0; i < NG * n; i++) G0.push({ x: (rnd() - 0.5) * (PW - 90), z: (rnd() - 0.5) * (PD - 90), y0: rnd(), v: 18 + rnd() * 26, r: 9 + rnd() * 12, rel: rnd() < 0.5 ? 0 : rnd() * 30 });
  const m = { root, PW, PD, WH, gap: o.gap, waters, floorY: 24,
    setClear(i, k) { waters[i].wm.uniforms.uK.value = k; },
    /* ts: seconds since the grains started falling; speed: global factor (slow motion < 1); clearK per pool decides which grains are still visible (only below the clear line) */
    setGrains(ts, speed, clearK) {
      let c = 0; const sp = speed == null ? 1 : speed;
      for (let p = 0; p < n; p++) { const kk = clearK ? clearK[p] || 0 : 0, line = 1 - kk * 1.05;
        for (let i = 0; i < NG; i++) { const g = G0[p * NG + i], startY = 24 + WH * g.y0 + (g.rel > 0 ? WH - WH * g.y0 : 0), tt = Math.max(0, ts - g.rel) * sp;
          let y = startY - g.v * tt; const floor = 24 + g.r * 0.7 + 0.0; if (y < floor) y = floor + (g.r * 0.2) * ((i * 7) % 5) / 5; const hh = (y - 24) / WH;
          const vis = hh < line + 0.02 || y <= floor + 4;
          dm.position.set(waters[p].cx + g.x, y, g.z); dm.scale.setScalar(vis ? g.r : 0.001); dm.rotation.set(i, i * 2, 0); dm.updateMatrix(); im.setMatrixAt(c++, dm.matrix); } }
      im.instanceMatrix.needsUpdate = true;
    } };
  m.setGrains(0, 1, null); return m;
}

/* ---- the giant pipe cross-section ring beside a door frame (the ring is clearly taller). Local: ground y = 0, door at x = -760, ring centred at x = 520. Faces +z. */
export function makeGiantPipeC() {
  const root = G(), R = 440, r = 372, RD = 170;
  box(root, 3400, 30, 900, M('#c9b98a', '#a89868'), [0, -15, 0], 2.4, null, 4);
  box(root, 3400, 1100, 40, M('#efe6d0', '#d8d0c0'), [0, 550, -330], 2.4, null, 6);
  const rs = new THREE.Shape(); rs.absarc(0, 0, R, 0, Math.PI * 2, false); const hole = new THREE.Path(); hole.absarc(0, 0, r, 0, Math.PI * 2, true); rs.holes.push(hole);
  const ringG = G(root, [520, R, 0]);
  part(ringG, new THREE.ExtrudeGeometry(rs, { depth: RD, bevelEnabled: false, curveSegments: 48 }).translate(0, 0, -RD / 2), M('#6a7ea0', '#9aa6c0'), 4);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(r, r, RD - 6, 48, 1, true).rotateX(Math.PI / 2), FA_basic('#2b3b58', { side: THREE.BackSide })); ringG.add(inner);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), FA_basic('#2d86c8', { transparent: true, opacity: 0.4, depthWrite: false })); disc.position.z = -RD / 2 + 4; ringG.add(disc);
  box(ringG, r * 2, 10, 20, M('#8f8a80', '#a8a0b0', 0), [0, -r + 5, 0], 0, null, 1);
  const DH = 400, DW = 240, door = G(root, [-760, 0, 0]);
  box(door, DW + 80, DH + 50, 50, M('#8a5a3a', '#b08a7a'), [0, (DH + 50) / 2, -240], 2.4, null, 5);
  box(door, DW, DH, 54, M('#26233a', '#3a3a52', 0), [0, DH / 2, -236], 0, null, 1);
  box(door, 16, 16, 12, M('#ffd42a', '#d8b050', 0), [DW / 2 - 36, DH / 2, -206], 0, null, 1);
  return { root, ring: ringG, door, R, r, DH, DW, ringX: 520, doorX: -760, doorZ: -200, anchors: { ring: [520, R, 0], door: [-760, DH / 2, -200] } };
}

/* ---- tap over a glass (the same set the old deck opened with). Local: wall at the back, spout at (0, 520), glass on the floor at x = 0. setOpen(k): handle turns and the stream appears; stream length set by setStream(len). */
export function makeTapC() {
  const root = G(), metal = M('#c7ccd6', '#9aa0b0'), redM = M('#d6232a', '#b88080');
  box(root, 1500, 900, 40, M('#f1ece0', '#d8d0c0'), [0, 450, -170], 2.6, null, 6); box(root, 1500, 36, 380, M('#b98a58', '#c8a88e'), [0, -18, 0], 2.6, null, 4);
  for (let i = -3; i <= 3; i++) box(root, 6, 900, 4, M('#d9d3c4', '#c8c0b0', 0), [i * 200, 450, -148], 0, null, 1);
  part(root, new THREE.CylinderGeometry(44, 44, 330, 18).rotateZ(Math.PI / 2), metal, 2.4, [-150, 560, -40]);
  part(root, new THREE.CylinderGeometry(44, 44, 120, 18), metal, 2.4, [0, 520, -40]); part(root, ell(52, 52, 52, 14, 10), metal, 2.4, [0, 560, -40]);
  part(root, new THREE.CylinderGeometry(30, 38, 70, 16), metal, 2.4, [0, 450, -40]);
  part(root, new THREE.CylinderGeometry(20, 20, 70, 12), metal, 2, [-150, 615, -40]);
  const handle = G(root, [-150, 650, -40]); part(handle, new THREE.CylinderGeometry(8, 8, 150, 8).rotateZ(Math.PI / 2), redM, 2); part(handle, ell(28, 28, 28, 12, 8), redM, 2, [75, 0, 0]); part(handle, ell(28, 28, 28, 12, 8), redM, 2, [-75, 0, 0]);
  const stream = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), FA_basic('#4fb6f0', { transparent: true, opacity: 0.9 })); stream.renderOrder = 5; root.add(stream);
  const g = { root, spout: [0, 430, -40], handle, stream, setOpen(k) { handle.rotation.y = k * Math.PI / 2; }, setStream(top, bot, wdt) { const L = Math.max(0.01, top - bot); stream.visible = L > 1 && wdt > 0.5; stream.scale.set(wdt, L, wdt); stream.position.set(0, bot + L / 2, -40); } };
  g.setOpen(0); g.setStream(0, 0, 0); return g;
}

/* ---- a plank sign on two posts (blank board for the overlay text). Local: posts on y = 0, board centre at y = 330. */
export function makeSignBoardC() {
  const root = G(), wood = M('#a8744a', '#c8a08a');
  [-1, 1].forEach(s => box(root, 36, 330, 36, M('#6e4a2c', '#9a7a66'), [s * 300, 165, 0], 2.2, null, 4));
  const board = G(root, [0, 330, 40]); box(board, 760, 220, 34, wood, [0, 0, 0], 2.6, null, 6); for (let i = -1; i <= 1; i++) box(board, 740, 4, 4, M('#6e4a2c', '#9a7a66', 0), [0, i * 62, 19], 0, null, 1);
  return { root, board, topY: 440 };
}

/* ---- a thick map line (pipe on the paper map): points on the XZ plane at height y; draw-on with setDraw(k), flowing stripes, optional glow. */
export function makeMapLineC(pts, w, hex, y, o) {
  o = Object.assign({ flow: true, ink: true, ro: 12 }, o || {}); const root = G();
  const P3 = pts.map(p => [p[0], y, p[1]]), N = pts.length - 1;
  const po = { polygonOffset: true, polygonOffsetFactor: -9, polygonOffsetUnits: -9 };
  const gi = ribbon(P3, w + Math.max(3, w * 0.45), 100), gm = ribbon(P3.map(p => [p[0], p[1] + 0.3, p[2]]), w, 100);
  const mi = new THREE.Mesh(gi, new THREE.MeshBasicMaterial(Object.assign({ color: FC_INK, side: THREE.DoubleSide }, po))); mi.renderOrder = o.ro; mi.frustumCulled = false; if (o.ink) root.add(mi);
  let mat; if (o.flow) { mat = makeFlowMat({ base: hex, light: '#d4f2fa', speed: 1.6, freq: 0.8 }); } else mat = new THREE.MeshBasicMaterial(Object.assign({ color: hex, side: THREE.DoubleSide }, po));
  if (mat.polygonOffset !== undefined) { mat.polygonOffset = true; mat.polygonOffsetFactor = -10; mat.polygonOffsetUnits = -10; }
  const mm = new THREE.Mesh(gm, mat); mm.renderOrder = o.ro + 1; mm.frustumCulled = false; root.add(mm);
  const gg = ribbon(P3.map(p => [p[0], p[1] + 0.6, p[2]]), w * 2.6, 100), glow = new THREE.Mesh(gg, new THREE.MeshBasicMaterial(Object.assign({ color: '#bff3ff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }, po))); glow.renderOrder = o.ro - 1; glow.frustumCulled = false; root.add(glow);
  const len = pts.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
  const at = u => { const d = cl(u, 0, 1) * len; let acc = 0; for (let i = 1; i < pts.length; i++) { const sl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + sl >= d || i === pts.length - 1) { const r = sl > 0 ? (d - acc) / sl : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * r, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * r]; } acc += sl; } return pts[pts.length - 1]; };
  const L = { root, len, at, mat, N, setDraw(k) { const n = Math.max(0, Math.min(N, Math.floor(cl(k, 0, 1) * N * 6) / 6)); const c = Math.floor(cl(k, 0, 1) * N * 6) * 6; [gi, gm, gg].forEach(g => g.setDrawRange(0, Math.min(c, N * 6))); root.visible = k > 0.001; },
    setGlow(k) { glow.material.opacity = 0.8 * k; }, update(t) { if (mat.uniforms) mat.uniforms.uT.value = t; } };
  L.setDraw(1); return L;
}


/* ======================================================================== FILM E ADDITIONS (appended 01/11 by the film_e builder)
   makePathE (dashed / dotted draw-on path ribbon), makeParchmentE (parchment card, abstract text lines, no letters), makeCompassE (flat compass rose, east arrow lights),
   makeNameTagE (hanging name tag: '?' -> filled bars), makeScrollIconE, makeBookOpenE (page turning), makeMagnifierE, makeCaveE (arched rock mouth),
   makeTiberiasE (walled town on a terrace, houses only), makeTiberiasSketchE (plan view with two gates, grey doubt area, green sweep, marker stones),
   makeOrchardE, makeSefarimE (books + scrolls), makeChipE (flying word chip). Names end with E, helpers FE_. No text, no Hebrew in code. */
const FE_INK = '#261c19';
const FE_mb = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, side: THREE.DoubleSide }, o || {}));
const FE_po = { polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -8 };
function FE_flat(poly, y, hex, ro, o) {   // poly [[x,z],...] -> flat filled mesh in the XZ plane
  const sh = new THREE.Shape(poly.map(p => new THREE.Vector2(p[0], -p[1]))); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
  const m = new THREE.Mesh(g, FE_mb(hex, Object.assign({}, FE_po, o || {}))); m.renderOrder = ro || 6; return m;
}

export function makePathE(pts, o) {
  o = Object.assign({ w: 22, color: '#ffc928', ink: FE_INK, y: 0, dash: 70, fill: 0.62, smooth: true, step: 18, ro: 12, closed: false, offset: true }, o || {});
  let P = pts.map(p => new THREE.Vector3(p[0], 0, p[1]));
  if (o.smooth && P.length > 2) { const c = new THREE.CatmullRomCurve3(P, o.closed, 'centripetal'); P = c.getSpacedPoints(Math.max(8, Math.round(c.getLength() / o.step))); }
  if (o.closed) P.push(P[0].clone());
  const yf = typeof o.y === 'function' ? o.y : (() => o.y);
  const P3 = P.map(p => [p.x, yf(p.x, p.z), p.z]), cum = [0];
  for (let i = 1; i < P3.length; i++) cum.push(cum[i - 1] + Math.hypot(P3[i][0] - P3[i - 1][0], P3[i][2] - P3[i - 1][2]));
  const len = cum[cum.length - 1], root = G();
  const mat = new THREE.ShaderMaterial({ side: THREE.DoubleSide, polygonOffset: o.offset, polygonOffsetFactor: -12, polygonOffsetUnits: -12,
    uniforms: { uLen: { value: 0 }, uP: { value: o.dash }, uF: { value: o.fill }, uA: { value: col(o.color) }, uB: { value: col(o.ink) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uLen, uP, uF; uniform vec3 uA, uB; varying vec2 vUv; void main(){ float d = vUv.y * 100.0; if (d > uLen) discard; if (mod(d, uP) > uP * uF) discard; float e = abs(vUv.x - 0.5) * 2.0; gl_FragColor = vec4(e > 0.68 ? uB : uA, 1.0); }' });
  const mesh = new THREE.Mesh(ribbon(P3, o.w, 100), mat); mesh.frustumCulled = false; mesh.renderOrder = o.ro; root.add(mesh);
  const at = d => { d = cl(d, 0, len); let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= d) lo = m; else hi = m; }
    const s = cum[hi] - cum[lo], u = s > 0 ? (d - cum[lo]) / s : 0, a = P3[lo], b = P3[hi]; return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, z: a[2] + (b[2] - a[2]) * u, ang: Math.atan2(-(b[2] - a[2]), b[0] - a[0]) }; };
  const nearest = (x, z) => { let bi = 0, bd = 1e18; for (let i = 0; i < P3.length; i++) { const d = (P3[i][0] - x) ** 2 + (P3[i][2] - z) ** 2; if (d < bd) { bd = d; bi = i; } } return cum[bi]; };
  return { root, len, at, nearest, mat, setLen(d) { mat.uniforms.uLen.value = d; root.visible = d > 0.5; }, setK(k) { this.setLen(cl(k, 0, 1) * len); } };
}

function FE_lineTex(seed, w, h) {
  const r = rng(seed), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.fillStyle = '#3d2a1a'; let x = 4;
  while (x < w - 20) { const ww = 30 + r() * 80; c.beginPath(); c.roundRect ? c.roundRect(x, 4, Math.min(ww, w - x - 4), h - 8, 6) : c.rect(x, 4, Math.min(ww, w - x - 4), h - 8); c.fill(); x += ww + 14 + r() * 8; }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; return t;
}
function FE_revealMat(seed) {
  return new THREE.ShaderMaterial({ side: THREE.DoubleSide, transparent: true, depthWrite: false, uniforms: { uR: { value: 1 }, uM: { value: FE_lineTex(seed, 512, 40) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uR; uniform sampler2D uM; varying vec2 vUv; void main(){ vec4 c = texture2D(uM, vUv); if (c.a < 0.5 || vUv.x < 1.0 - uR) discard; gl_FragColor = vec4(c.rgb, 1.0); }' });
}
export function makeParchmentE(o) {
  o = Object.assign({ w: 900, h: 640, lines: 6, ref: false, seed: 4 }, o || {});
  const root = G(), body = G(root), W = o.w, H = o.h, r = rng(o.seed);
  box(body, W, H, 8, M('#f1dca4', '#cdb98a'), [0, 0, 0], 4, null, 5);
  box(body, W - 40, H - 40, 2, M('#f7e8bc', '#e0cf9c', 0), [0, 0, 5], 0, null, 0);
  const rollM = M('#9a6a3c', '#bb9a82'), gold = M('#c98a1c', '#d8b050', 0), top = G(root, [0, H / 2, 6]), bot = G(root, [0, -H / 2, 6]);
  [top, bot].forEach(g => { part(g, new THREE.CylinderGeometry(30, 30, W + 80, 18).rotateZ(Math.PI / 2), rollM, 3); [-1, 1].forEach(s => part(g, ell(40, 40, 40, 14, 10), gold, 2.4, [s * (W + 100) / 2, 0, 0])); });
  const lens = [0.9, 0.96, 0.92, 0.8, 0.94, 0.62, 0.9, 0.7], rows = o.lines, y0 = H / 2 - 120, dy = (H - 240 - (o.ref ? 90 : 0)) / (rows - 1), bars = [];
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), FE_mb('#ffd42a', { transparent: true, opacity: 0, depthWrite: false })); glow.renderOrder = 8; body.add(glow);
  for (let i = 0; i < rows; i++) { const L = (W - 160) * lens[i % lens.length], m = new THREE.Mesh(new THREE.PlaneGeometry(L, 30), FE_revealMat(o.seed * 10 + i)); m.position.set(W / 2 - 80 - L / 2, y0 - i * dy, 8); m.renderOrder = 9; body.add(m); bars.push({ m, L }); }
  const GI = 2; glow.scale.set((W - 160) * 0.55, 56, 1); glow.position.set(W / 2 - 80 - (W - 160) * 0.55 / 2 - 10, y0 - GI * dy, 7);
  let refBar = null; if (o.ref) { const L = (W - 160) * 0.32, m = new THREE.Mesh(new THREE.PlaneGeometry(L, 26), FE_revealMat(o.seed * 10 + 77)); m.material.uniforms.uM.value = FE_lineTex(o.seed * 10 + 91, 512, 40); m.position.set(W / 2 - 80 - L / 2, -H / 2 + 100, 8); m.renderOrder = 9; body.add(m); refBar = m; }
  return { root, body, glow, W, H, bars, setOpen(k) { k = cl(k, 0, 1); root.visible = k > 0.01; body.scale.y = Math.max(0.001, k); body.position.y = H / 2 * (1 - k); bot.position.y = H / 2 - H * k; },
    setReveal(k) { const n = bars.length; bars.forEach((b, i) => { b.m.material.uniforms.uR.value = cl(k * (n + 0.4) - i, 0, 1); b.m.visible = b.m.material.uniforms.uR.value > 0.001; }); if (refBar) { refBar.material.uniforms.uR.value = cl(k * 4 - 3, 0, 1); refBar.visible = k > 0.76; } },
    setGlow(k) { glow.material.opacity = 0.85 * k; glow.visible = k > 0.01; }, anchors: { rollL: [-W / 2 - 50, H / 2, 20], rollB: [-W / 2 - 50, -H / 2, 20] } };
}

export function makeCompassE(o) {
  o = Object.assign({ r: 200 }, o || {}); const root = G(), r = o.r, g = G(root);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r * 1.08, 40).rotateX(-Math.PI / 2), FE_mb(FE_INK, FE_po)); disc.position.y = 1; disc.renderOrder = 10; g.add(disc);
  const d2 = new THREE.Mesh(new THREE.CircleGeometry(r * 1.0, 40).rotateX(-Math.PI / 2), FE_mb('#fff3d0', FE_po)); d2.position.y = 1.6; d2.renderOrder = 11; g.add(d2);
  const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.88, r * 0.95, 40).rotateX(-Math.PI / 2), FE_mb('#c98a1c', FE_po)); ring.position.y = 2.2; ring.renderOrder = 12; g.add(ring);
  const kite = (L, w) => [[L, 0], [L * 0.26, w], [-L * 0.1, 0], [L * 0.26, -w]];
  const arrows = [0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a, i) => { const ag = G(g); ag.rotation.y = a; const ink = FE_flat(kite(r * 0.9, r * 0.2).map(p => [p[0] * 1.07 + 4, p[1] * 1.25]), 2.8, FE_INK, 13); const m = FE_flat(kite(r * 0.9, r * 0.17), 3.2, i === 0 ? '#8a7a5a' : '#6d7a8c', 14); ag.add(ink, m); return { ag, m }; });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(r * 0.55, 24).rotateX(-Math.PI / 2), FE_mb('#ffe266', { transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -7, polygonOffsetUnits: -7 })); glow.position.set(r * 0.78, 2.5, 0); glow.renderOrder = 11; g.add(glow);
  const dim = col('#8a7a5a'), lit = col('#ffc928');
  return { root, r, east: [r * 0.95, 3, 0], setAppear(k) { root.visible = k > 0.01; root.scale.setScalar(Math.max(0.001, k < 0.6 ? sm(k / 0.6) * 1.15 : 1.15 - 0.15 * sm((k - 0.6) / 0.4))); },
    setLit(k) { arrows[0].m.material.color.copy(dim).lerp(lit, k); arrows[0].ag.scale.set(1 + 0.12 * k, 1, 1 + 0.25 * k); glow.material.opacity = 0.6 * k; } };
}

export function makeNameTagE(o) {
  o = Object.assign({ w: 440, h: 190, pole: 520, accent: '#2f9be0' }, o || {}); const root = G(), wood = M('#8a5a30', '#b08a60'), W = o.w, H = o.h;
  box(root, 26, o.pole, 26, wood, [0, o.pole / 2, 0], 2, null, 4); box(root, W * 0.9, 22, 26, wood, [0, o.pole, 0], 2, null, 4);
  const sw = G(root, [0, o.pole, 14]);
  [-1, 1].forEach(s => box(sw, 6, 90, 6, M('#5a4028', '#8a7a68', 0), [s * W * 0.33, -45, 0], 0, null, 1));
  const board = G(sw, [0, -90 - H / 2, 0]);
  box(board, W, H, 18, M('#fff0c8', '#d8c8a0'), [0, 0, 0], 5, null, 5); box(board, W, 26, 22, M(o.accent, '#8aa0b0', 0), [0, H / 2 - 13, 0], 3, null, 2);
  const q = numPlane('?', W * 0.5, H * 0.78, { fg: '#d6232a', k: 0.95 }); q.position.set(0, -8, 12); board.add(q);
  const nb = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), FE_mb('#2a2a44')), sb = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), FE_mb('#8a8f9a'));
  [nb, sb].forEach(m => { m.renderOrder = 9; board.add(m); }); const NL = W * 0.78, SL = W * 0.5;
  let tx = false, hasSrc = false;
  const set = (m, L, h, y, k) => { m.scale.set(Math.max(0.001, L * k), h, 1); m.position.set(W / 2 - 34 - L * k / 2, y, 11.5); };
  return { root, sw, board, W, H, setTexts(a, b) { tx = true; hasSrc = !!b; nb.material = FE_mb('#ffffff', { map: a, transparent: true, depthWrite: false }); if (b) sb.material = FE_mb('#ffffff', { map: b, transparent: true, depthWrite: false }); },
    setFill(k) { k = cl(k, 0, 1); q.visible = k < 0.02; nb.visible = k >= 0.02; sb.visible = k >= 0.02 && (!tx || hasSrc);
      if (tx) { const pu = Math.max(0.001, sm(k)); nb.scale.set(W * 0.9 * pu, (hasSrc ? 118 : 150) * pu, 1); nb.position.set(0, hasSrc ? 18 : -4, 11.5); sb.scale.set(W * 0.9 * pu, 50 * pu, 1); sb.position.set(0, -58, 11.5); } else { set(nb, NL, 42, -4, cl(k * 2, 0, 1)); set(sb, SL, 22, -52, cl(k * 2 - 1, 0, 1)); } },
    setSwing(a) { sw.rotation.z = a; }, setAccent(hex) { board.children[1].material.uniforms.uColor.value.set(hex); }, topY: o.pole };
}

export function makeScrollIconE(o) {
  o = Object.assign({}, o || {}); const root = G(), par = M('#f3e2b0', '#d6c394'), wood = M('#8a5a30', '#b08a60'), red = M('#d6232a', '#b88080', 0);
  part(root, new THREE.CylinderGeometry(46, 46, 300, 18).rotateZ(Math.PI / 2), par, 3);
  [-1, 1].forEach(s => { part(root, new THREE.CylinderGeometry(30, 30, 40, 12).rotateZ(Math.PI / 2), wood, 2.4, [s * 168, 0, 0]); part(root, ell(36, 36, 36, 12, 8), wood, 2.4, [s * 196, 0, 0]); });
  part(root, new THREE.CylinderGeometry(50, 50, 34, 16).rotateZ(Math.PI / 2), red, 2.4, [-40, 0, 0]);
  const sheet = G(root, [0, -30, 40]), sg = box(sheet, 268, 420, 5, M('#f7e8bc', '#e0cf9c', 0), [0, -210, 0], 1.6, null, 3);
  const lines = []; for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(i === 4 ? 120 : 190, 22), FE_mb('#4a3420')); m.position.set(i === 4 ? 40 : 18, -70 - i * 62, 4); sheet.add(m); lines.push(m); }
  return { root, setUnroll(k) { k = cl(k, 0, 1); sheet.visible = k > 0.01; sheet.scale.y = Math.max(0.001, k); lines.forEach((m, i) => { m.visible = k > 0.25 + i * 0.12; }); }, glowRing: null };
}

export function makeBookOpenE(o) {
  o = Object.assign({ pages: 8 }, o || {}); const root = G(), lea = M('#6e3d22', '#a07a64'), pg = M('#f7ecd0', '#ddd2b4', 0), gold = M('#c98a1c', '#d8b050', 0);
  const CW = 340, CD = 460; box(root, 30, 22, CD, lea, [0, 6, 0], 2, null, 4);
  box(root, CW, 14, CD, lea, [CW / 2 + 12, 0, 0], 2.4, null, 5); box(root, CW - 60, 4, CD - 70, gold, [CW / 2 + 12, 8, 0], 0, null, 0);
  const lc = G(root, [0, 0, 0]); const lcb = G(lc); box(lcb, CW, 14, CD, lea, [CW / 2 + 12, 0, 0], 2.4, null, 5); box(lcb, CW - 60, 4, CD - 70, gold, [CW / 2 + 12, 8, 0], 0, null, 0);
  const pages = []; for (let i = 0; i < o.pages; i++) { const pv = G(root, [0, 12 + (o.pages - i) * 2.6, 0]); box(pv, CW - 20, 3, CD - 30, pg, [(CW - 20) / 2 + 12, 0, 0], 0.6, null, 1); const ln = new THREE.Mesh(new THREE.PlaneGeometry(CW - 110, 5), FE_mb('#6a5a48')); ln.rotation.x = -Math.PI / 2; ln.position.set(CW / 2 + 12, 2.2, -60 + (i % 3) * 40); pv.add(ln); pages.push(pv); }
  const N = o.pages;
  return { root, setOpen(k) { k = cl(k, 0, 1); lc.rotation.z = Math.PI * (1 - sm(k)); lc.position.y = 14 * (1 - sm(k)) + 2; pages.forEach(p => { p.visible = k > 0.3; }); },
    turn(k) { pages.forEach((p, i) => { const u = sm(cl(k - i, 0, 1)); p.rotation.z = Math.PI * u * 0.96; p.position.y = 12 + (N - i) * 2.6 * (1 - u) + (i + 1) * 2.6 * u + 26 * Math.sin(Math.PI * u); }); } };
}

export function makeMagnifierE() {
  const root = G(), wood = M('#8a5a30', '#b08a60'), gold = M('#c98a1c', '#d8b050', 0);
  const ring = part(root, new THREE.TorusGeometry(150, 17, 10, 36).rotateX(Math.PI / 2), gold, 3);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(146, 32).rotateX(-Math.PI / 2), FE_mb('#cfeeff', { transparent: true, opacity: 0.38, depthWrite: false })); glass.position.y = 2; glass.renderOrder = 15; root.add(glass);
  part(root, new THREE.CylinderGeometry(20, 24, 280, 12).rotateZ(Math.PI / 2), wood, 3, [290, 0, 0]);
  part(root, ell(30, 30, 30, 10, 8), wood, 2.4, [440, 0, 0]);
  return { root, handle: [440, 0, 0] };
}

export function makeCaveE(o) {
  o = Object.assign({ seed: 6 }, o || {}); const root = G(), rock = M('#a89880', '#86786a'), dark = M('#7a6d5a', '#6a5e50');
  const sh = new THREE.Shape(); sh.moveTo(-450, 0); sh.lineTo(-470, 110); sh.quadraticCurveTo(-440, 330, -250, 430); sh.quadraticCurveTo(-60, 520, 150, 470); sh.quadraticCurveTo(380, 410, 440, 200); sh.lineTo(450, 0);
  sh.lineTo(135, 0); sh.lineTo(135, 150); sh.quadraticCurveTo(135, 335, 0, 335); sh.quadraticCurveTo(-135, 335, -135, 150); sh.lineTo(-135, 0); sh.lineTo(-450, 0);
  part(root, new THREE.ExtrudeGeometry(sh, { depth: 230, bevelEnabled: false }), rock, 3.4);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(272, 340), new THREE.MeshBasicMaterial({ color: '#050408' })); back.position.set(0, 168, 20); root.add(back);
  const lft = new THREE.Mesh(new THREE.PlaneGeometry(230, 340), new THREE.MeshBasicMaterial({ color: '#100c10' })); lft.rotation.y = Math.PI / 2; lft.position.set(-134, 168, 115); root.add(lft);
  const rgt = lft.clone(); rgt.position.x = 134; root.add(rgt);
  const rr = rng(o.seed); for (let i = 0; i < 4; i++) { const b = box(root, 150 - i * 15, 22, 60, i % 2 ? dark : rock, [(i % 2 ? 1 : -1) * (300 + rr() * 60), 100 + i * 80, 236], 2, null, 3); b.rotation.z = (rr() - 0.5) * 0.14; }
  for (let i = 0; i < 6; i++) { const s = KT.makeStone(o.seed * 5 + i, 1.2 + rr()); s.position.set(-420 + i * 170 + rr() * 40, 0, 270 + rr() * 90); root.add(s); }
  for (let i = 0; i < 3; i++) { const b = KT.makeBush(o.seed * 7 + i, { s: 0.9 }); b.position.set(-330 + i * 330, 410 - i * 20, 90); root.add(b); }
  return { root, topY: 480, mouth: [0, 0, 240] };
}

export function makeTiberiasE(o) {
  o = Object.assign({ w: 420, d: 400, baseY: 0, skirt: 220, fore: 210, seed: 5 }, o || {}); const root = G(), c = G(root, [0, o.baseY, 0]), r = rng(o.seed), W = o.w, D = o.d;
  const stone = M('#d8c9a4', '#b8aa88'), wallM = M('#e6d8b4', '#c4b692');
  const px0 = -W / 2 - 30, px1 = W / 2 + o.fore;
  box(c, px1 - px0, o.skirt, D + 60, M('#bda27a', '#a28c6a'), [(px0 + px1) / 2, -o.skirt / 2, 0], 3, null, 8); box(c, px1 - px0 - 20, 8, D + 40, M('#e0cfa0', '#c8b88a', 0), [(px0 + px1) / 2, 4, 0], 0, null, 0);
  const parts = [], wall = (w, d, x, z, h) => { const b = box(c, w, h || 92, d, wallM, [x, (h || 92) / 2 + 4, z], 2.4, null, 5); parts.push(b); b.userData.h = 1; return b; };
  const GAP = 120;
  wall(W, 32, 0, -D / 2); wall(W, 32, 0, D / 2); wall(32, (D - GAP) / 2, W / 2, -(D + GAP) / 4); wall(32, (D - GAP) / 2, W / 2, (D + GAP) / 4);
  wall(32, (D - GAP) / 2, -W / 2, -(D + GAP) / 4); wall(32, (D - GAP) / 2, -W / 2, (D + GAP) / 4);
  [[W / 2, 1], [-W / 2, -1]].forEach(([gx, s]) => { [-1, 1].forEach(q => parts.push(box(c, 50, 130, 50, stone, [gx, 69, q * (GAP / 2 + 6)], 2.4, null, 5))); parts.push(box(c, 56, 34, GAP + 80, stone, [gx, 148, 0], 2.4, null, 5));
    const dk = new THREE.Mesh(new THREE.PlaneGeometry(GAP, 110), new THREE.MeshBasicMaterial({ color: '#2a1c14' })); dk.rotation.y = Math.PI / 2; dk.position.set(gx + 2 * s, 59, 0); c.add(dk); });
  const hs = [], cols = [-150, -50, 50, 150], rows = [-150, -75, 75, 150];
  rows.forEach((z, ri) => cols.forEach((x, ci) => { if (r() < 0.12) return; const h = makeHouse(o.seed * 13 + ri * 4 + ci, { w: 130 + r() * 30, d: 105 + r() * 20, h: 82 + r() * 24, garden: false }); h.scale.setScalar(0.62); h.position.set(x + (r() - 0.5) * 16, 4, z + (r() - 0.5) * 12); h.rotation.y = (r() - 0.5) * 0.3; c.add(h); hs.push({ h, d: Math.hypot(x, z) }); }));
  hs.sort((a, b) => b.d - a.d);
  const dais = part(c, new THREE.CylinderGeometry(46, 54, 22, 18).translate(0, 11, 0), stone, 2.6, [0, 4, 0]);
  const pal = []; [[W / 2 + 80, -170], [W / 2 + 120, 150], [W / 2 + 60, 190], [-W / 2 - 20, -230]].forEach(([x, z], i) => { const t = KT.makeTree('palm', o.seed * 9 + i, 0.42 + r() * 0.1); t.position.set(x, 4, z); c.add(t); pal.push(t); });
  return { root, c, dais, daisTop: [0, o.baseY + 26, 0], gateE: [W / 2 + 40, o.baseY, 0], gateW: [-W / 2 - 40, o.baseY, 0], wallTopY: o.baseY + 140, w: W, d: D,
    setGrow(k) { k = cl(k, 0, 1); const wk = sm(cl(k / 0.4, 0, 1)); parts.forEach(p => { p.scale.y = Math.max(0.001, wk); p.position.y = (p.geometry.parameters.height * wk) / 2 + 4; }); dais.visible = k > 0.35;
      hs.forEach((e, i) => { const u = sm(cl((k - 0.3) / 0.7 * (hs.length + 3) - i, 0, 1)); e.h.scale.setScalar(Math.max(0.001, 0.62 * u)); }); pal.forEach((t, i) => { t.scale.setScalar(Math.max(0.001, sm(cl(k * 2 - 0.5 - i * 0.1, 0, 1)))); }); } };
}

export function makeTiberiasSketchE() {
  const root = G(), rr = rng(11);
  box(root, 4600, 30, 3000, M('#d9e2b0', '#b8c88a'), [0, -15, 0], 3, null, 8);
  const blob = [[-760, -60], [-650, -330], [-340, -450], [0, -490], [390, -430], [700, -300], [800, -50], [710, 260], [430, 430], [80, 480], [-300, 430], [-630, 310], [-790, 110]];
  const grey = FE_flat(blob, 4, '#9aa0a8', 5); root.add(grey);
  const edge = new THREE.Mesh(ribbon(blob.concat([blob[0]]).map(p => [p[0], 5, p[1]]), 14, 100), FE_mb('#4a4f58', FE_po)); edge.renderOrder = 6; root.add(edge);
  const markZ = [[-120, 150], [400, 150], [460, 300], [300, 410], [-60, 390]];
  const sh = new THREE.Shape(blob.map(p => new THREE.Vector2(p[0], -p[1]))); sh.holes.push(new THREE.Path(markZ.map(p => new THREE.Vector2(p[0], -p[1]))));
  const gg = new THREE.ShapeGeometry(sh); gg.rotateX(-Math.PI / 2); gg.translate(0, 6, 0);
  const gm = new THREE.ShaderMaterial({ side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -9, polygonOffsetUnits: -9, uniforms: { uK: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uK; varying vec3 vP; void main(){ float x = mix(-820.0, 840.0, uK); if (vP.x > x) discard; float s = step(0.5, fract((vP.x + vP.z) * 0.02)); gl_FragColor = vec4(mix(vec3(0.45, 0.78, 0.30), vec3(0.40, 0.72, 0.27), s), 1.0); }' });
  const green = new THREE.Mesh(gg, gm); green.renderOrder = 7; root.add(green);
  const mk = FE_flat(markZ, 5, '#bcc2c8', 6); root.add(mk);
  const stones = []; for (let i = 0; i < 9; i++) { const s = box(root, 34, 46, 28, M('#ffffff', '#cfd2d8'), [-40 + i * 46, 24, 270 + 10 * Math.sin(i * 1.7)], 2.4, null, 4); stones.push(s); }
  const gate = (x, hex) => { const g = G(root, [x, 0, 0]); [-1, 1].forEach(s => box(g, 56, 150, 56, M('#d8c9a4', '#b8aa88'), [0, 75, s * 90], 2.4, null, 5)); box(g, 62, 40, 260, M('#e6d8b4', '#c4b692'), [0, 168, 0], 2.4, null, 5);
    const dk = new THREE.Mesh(new THREE.PlaneGeometry(124, 120), new THREE.MeshBasicMaterial({ color: '#2a1c14' })); dk.rotation.y = Math.PI / 2; dk.position.set(0, 62, 0); g.add(dk);
    box(g, 8, 150, 8, M('#6e4a2c', '#9a7a66'), [0, 255, -120], 1, null, 1); const fl = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0, -60), new THREE.Vector2(90, -30)])), FE_mb(hex)); fl.position.set(4, 330, -120); fl.rotation.y = -Math.PI / 2; g.add(fl);
    [-1, 1].forEach(s => { for (let k = 0; k < 4; k++) box(g, 56, 80, 130, M('#e6d8b4', '#c4b692'), [0, 44, s * (250 + k * 130)], 2.4, null, 4); }); return g; };
  gate(-1180, '#2f73c9'); gate(1180, '#d6232a');
  [[-1180, 1], [1180, -1]].forEach(([gx, s]) => { for (let i = 0; i < 7; i++) { const h = makeHouse(60 + i + (s > 0 ? 0 : 9), { w: 140, d: 110, h: 90, garden: false }); h.scale.setScalar(0.62); const zz = [-330, -200, 200, 330, -460, 460, 0][i]; h.position.set(gx - s * (200 + 60 * (i % 3)), 0, zz * (i === 6 ? 1 : 1) + (i === 6 ? 0 : 0)); h.rotation.y = (rr() - 0.5) * 0.4; if (i === 6) h.position.z = 380 * (s); root.add(h); } });
  return { root, grey, stones, setClean(k) { gm.uniforms.uK.value = cl(k, 0, 1); green.visible = k > 0.001; }, setStones(k) { stones.forEach((s, i) => { s.scale.setScalar(Math.max(0.001, sm(cl(k * 1.6 - i * 0.07, 0, 1)))); }); },
    anchors: { gateA: [-1180, 0, 0], gateB: [1180, 0, 0], center: [0, 0, 0], mark: [170, 0, 280], north: [0, 0, -700] }, blob, markZ };
}

export function makeOrchardE(o) {
  o = Object.assign({ n: 9, seed: 3 }, o || {}); const root = G(), r = rng(o.seed), trees = [];
  for (let i = 0; i < o.n; i++) { const t = G(root, [(i % 3) * 150 - 150 + (r() - 0.5) * 20, 0, Math.floor(i / 3) * 140 - 140 + (r() - 0.5) * 20]);
    part(t, new THREE.CylinderGeometry(9, 13, 80, 8).translate(0, 40, 0), M('#7a4f2e', '#a88a70'), 2); part(t, ell(62, 48, 62, 14, 10), M(i % 2 ? '#5fa046' : '#6fb04c', '#a0c090'), 2.6, [0, 108, 0]); part(t, ell(40, 34, 40, 12, 8), M('#79bc54', '#a8cf98'), 2, [24, 140, -10]);
    for (let k = 0; k < 6; k++) { const a = k * 1.05 + i, f = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 8), FE_mb(['#e8602a', '#d6232a', '#f2a03a'][(i + k) % 3])); f.position.set(Math.cos(a) * 58, 100 + (k % 3) * 18, Math.sin(a) * 58); t.add(f); }
    trees.push(t); }
  return { root, setGrow(k) { trees.forEach((t, i) => { t.scale.setScalar(Math.max(0.001, sm(cl(k * 1.8 - i * 0.1, 0, 1)))); }); } };
}

export function makeSefarimE(o) {
  o = Object.assign({ n: 6, seed: 2 }, o || {}); const root = G(), r = rng(o.seed), pal = ['#6e3d22', '#2a4a7a', '#7a2a2a', '#3a5a3a', '#5a3a6a', '#8a6a2a'];
  box(root, 20 + o.n * 48, 14, 170, M('#8a5a30', '#b08a60'), [0, 7, 0], 2, null, 3);
  for (let i = 0; i < o.n; i++) { const h = 190 + r() * 50, w = 36 + r() * 12, b = G(root, [-(o.n - 1) * 24 + i * 48, 14, 0]); if (i === o.n - 1) b.rotation.z = -0.22;
    box(b, w, h, 140, M(pal[i % pal.length], '#a090a0'), [0, h / 2, 0], 2.4, null, 4); [0.22, 0.5, 0.8].forEach(f => box(b, w + 2, 9, 142, M('#d9a62a', '#e8c870', 0), [0, h * f, 0], 0, null, 0)); }
  box(root, 150, 28, 120, M('#7a2a2a', '#b08080'), [-30, 14 + 220 + 14, 0], 2.4, null, 4);
  const sc = G(root, [30, 14 + 220 + 56, 0]); part(sc, new THREE.CylinderGeometry(24, 24, 150, 14).rotateZ(Math.PI / 2), M('#f3e2b0', '#d6c394'), 2.6); [-1, 1].forEach(s => part(sc, ell(18, 18, 18, 10, 8), M('#8a5a30', '#b08a60'), 2, [s * 84, 0, 0]));
  return { root };
}

export function makeChipE() {
  const root = G(); box(root, 230, 90, 10, M('#fff0c8', '#d8c8a0'), [0, 0, 0], 4, null, 4); box(root, 230, 14, 12, M('#c98a1c', '#d8b050', 0), [0, 38, 0], 0, null, 0);
  const a = new THREE.Mesh(new THREE.PlaneGeometry(150, 22), FE_mb('#2a2a44')); a.position.set(20, -8, 7); root.add(a); return root;
}
