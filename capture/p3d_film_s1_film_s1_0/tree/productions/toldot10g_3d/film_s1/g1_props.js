/* g1_props.js - film_s1 (toldot10g): painted country maps from the real height grid, easels, brass rose, desk props, hill set.
   NO PEOPLE, NO TEXT (digits only on milestones). ASCII only. Pure functions of their arguments. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, phong, mapY, ll, noiseTex, woodTex, shadowable } = K;
export const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const ADD = (c, o) => BASIC(c, Object.assign({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }, o || {}));

/* ------------------------------------------------------------------ height grid of the table map */
export const GX0 = -20, GX1 = 22, GZ0 = -38, GZ1 = 38, GRES = 4;
const GW = (GX1 - GX0) * GRES, GHH = (GZ1 - GZ0) * GRES;
let HG = null;
function grid() {
  if (HG) return HG; HG = new Float32Array(GW * GHH);
  for (let j = 0; j < GHH; j++) for (let i = 0; i < GW; i++) HG[j * GW + i] = mapY(GX0 + (i + 0.5) / GRES, GZ0 + (j + 0.5) / GRES);
  return HG;
}
export function hAt(x, z) {
  const g = grid(); let i = Math.floor((x - GX0) * GRES), j = Math.floor((z - GZ0) * GRES);
  i = Math.max(0, Math.min(GW - 1, i)); j = Math.max(0, Math.min(GHH - 1, j)); return g[j * GW + i];
}
export const CITIES = { jer: [31.78, 35.21], tlv: [32.08, 34.78], haifa: [32.80, 34.99], bs: [31.25, 34.79], tib: [32.79, 35.53], eilat: [29.56, 34.95], safed: [32.96, 35.50], ashd: [31.80, 34.65], jericho: [31.86, 35.46] };
export const cxz = k => ll(CITIES[k][0], CITIES[k][1]);
export const ROADS = [['haifa', 'tib'], ['haifa', 'tlv'], ['tlv', 'jer'], ['jer', 'bs'], ['bs', 'eilat'], ['tib', 'safed'], ['jer', 'jericho'], ['tlv', 'ashd'], ['ashd', 'bs'], ['jericho', 'tib']];
const RIVER = [[33.15, 35.62], [32.95, 35.63], [32.86, 35.60], [32.70, 35.57], [32.45, 35.56], [32.15, 35.54], [31.95, 35.54], [31.80, 35.51]];

const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const tex = c => { const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; };
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/* style: photo | map | physical | political | rain ; region z0..z1 of the table map, full width */
export function countryTex(style, w, h, z0, z1, seed) {
  const c = mkCanvas(w, h), g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
  const X = i => GX0 + (i + 0.5) / w * (GX1 - GX0), Z = j => z0 + (j + 0.5) / h * (z1 - z0);
  const P = (x, z) => [(x - GX0) / (GX1 - GX0) * w, (z - z0) / (z1 - z0) * h];
  const Hh = new Float32Array(w * h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) Hh[j * w + i] = hAt(X(i), Z(j));
  const hh = (i, j) => Hh[Math.max(0, Math.min(h - 1, j)) * w + Math.max(0, Math.min(w - 1, i))];
  const wat = (i, j) => hh(i, j) < 0.12;
  const R = rng(seed || 1);
  const GR = ['#8fc063', '#7fb157', '#a6c76c', '#6fa04a', '#98bf66', '#b4c874'].map(hex), GO = ['#e2c070', '#d6b060', '#ecd08a', '#cfa656', '#e8c97c', '#c9a05a'].map(hex);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const y = hh(i, j), z = Z(j), x = X(i), k = (j * w + i) * 4, isW = y < 0.12;
    const shade = 1 + 0.85 * (hh(i - 1, j) - hh(i + 1, j)) + 0.4 * (hh(i, j + 1) - hh(i, j - 1));
    const coast = !isW && (wat(i - 1, j) || wat(i + 1, j) || wat(i, j - 1) || wat(i, j + 1));
    let col, n = (hash2(i, j) - 0.5) * 2;
    const dry = sm((z - 4) / 30);
    if (style === 'photo') {
      if (isW) { const dp = sm((-x - 4) / 14); col = mix(hex('#58b4dc'), hex('#25689c'), dp); col = mix(col, [255, 255, 255], 0.05 * (n + 1)); }
      else {
        const ci = Math.floor(hash2(Math.floor(i / 6), Math.floor(j / 6)) * 6); col = mix(GR[ci], GO[(ci + 2) % 6], dry);
        if (y > 1.2) col = mix(col, hex('#a89868'), sm((y - 1.2) / 1.4) * 0.8); if (y > 3.2) col = mix(col, [236, 232, 222], sm((y - 3.2) / 0.6));
        if (x > 8) col = mix(col, hex('#cdb47e'), sm((x - 8) / 3) * 0.7);
        if (i % 6 === 0 || j % 6 === 0) col = [col[0] * 0.84, col[1] * 0.84, col[2] * 0.84];
        col = [col[0] * shade + n * 9, col[1] * shade + n * 9, col[2] * shade + n * 9];
        if (coast) col = mix(col, [250, 244, 226], 0.75);
      }
    } else if (style === 'map') {
      if (isW) col = hex('#8fcbef');
      else { col = hex('#f3e9c9'); if (y > 1.5) col = hex('#dcbc84'); if (y > 2.8) col = hex('#bd9560'); if (coast) col = hex('#6b5a3a'); }
    } else if (style === 'physical') {
      if (isW) col = mix(hex('#78bde8'), hex('#3a7fc0'), sm((-x - 3) / 14));
      else {
        col = y < 0.9 ? hex('#86b45c') : y < 1.5 ? mix(hex('#86b45c'), hex('#cdc66e'), sm((y - 0.9) / 0.6)) : y < 2.4 ? mix(hex('#cdc66e'), hex('#c4965e'), sm((y - 1.5) / 0.9)) : y < 3.3 ? mix(hex('#c4965e'), hex('#8f6a46'), sm((y - 2.4) / 0.9)) : mix(hex('#8f6a46'), [240, 236, 228], sm((y - 3.3) / 0.6));
        col = [col[0] * shade, col[1] * shade, col[2] * shade];
      }
    } else if (style === 'political') {
      if (isW) col = hex('#cfe6f5');
      else { col = z < -12 ? hex('#f6dfc6') : z < 12 ? hex('#e6f0cc') : hex('#f7ecb8'); if (coast) col = hex('#7a6648'); }
    } else {
      if (isW) col = hex('#d6e6f2');
      else { const wet = Math.max(0, Math.min(1, (1 - sm((z + 32) / 62)) * 0.82 + 0.2 * sm(y / 3.2))); col = mix(hex('#e8c878'), hex('#2f78b4'), wet); if (coast) col = mix(col, [255, 255, 255], 0.4); }
    }
    d[k] = Math.max(0, Math.min(255, col[0])); d[k + 1] = Math.max(0, Math.min(255, col[1])); d[k + 2] = Math.max(0, Math.min(255, col[2])); d[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const roads = (col, wd, dash) => { g.strokeStyle = col; g.lineWidth = wd; g.setLineDash(dash || []); for (const [a, b] of ROADS) { const A = P(...cxz(a)), B = P(...cxz(b)); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo((A[0] + B[0]) / 2 + 6, (A[1] + B[1]) / 2 - 4); g.lineTo(B[0], B[1]); g.stroke(); } g.setLineDash([]); };
  const dot = (k, r, fill, ring) => { const p = P(...cxz(k)); g.fillStyle = ring; g.beginPath(); g.arc(p[0], p[1], r + 2, 0, 6.3); g.fill(); g.fillStyle = fill; g.beginPath(); g.arc(p[0], p[1], r, 0, 6.3); g.fill(); };
  const river = col => { g.strokeStyle = col; g.lineWidth = Math.max(2, w / 150); g.beginPath(); RIVER.forEach((p, i) => { const q = P(...ll(p[0], p[1])); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke(); };
  const sx = w / 360;
  if (style === 'photo') {
    roads('#e6dcb4', 1.4 * sx);
    for (let k = 0; k < 900; k++) { const x = GX0 + R() * (GX1 - GX0), z = z0 + R() * (z1 - z0), y = hAt(x, z); if (y < 0.2 || y > 3) continue; const p = P(x, z); g.fillStyle = hash2(k, 4) > 0.5 ? '#2f6a2a' : '#427c33'; g.beginPath(); g.arc(p[0], p[1], (1 + R() * 1.4) * sx, 0, 6.3); g.fill(); }
    const roofs = (px, py, n, sp) => { for (let q = 0; q < n; q++) { g.fillStyle = hash2(q, px) > 0.45 ? '#c45a3e' : '#efe4c8'; g.fillRect(px + (R() - 0.5) * sp, py + (R() - 0.5) * sp, 2.2 * sx + 1, 2.2 * sx + 1); } };
    for (const k of Object.keys(CITIES)) { const p = P(...cxz(k)); roofs(p[0], p[1], 90, 22 * sx); }
    for (let k = 0; k < 90; k++) { const x = GX0 + R() * (GX1 - GX0), z = z0 + R() * (z1 - z0), y = hAt(x, z); if (y < 0.2 || y > 2.2) continue; const p = P(x, z); roofs(p[0], p[1], 7, 8 * sx); }
  } else if (style === 'map') {
    roads('#9a5a40', 1.6 * sx, [5, 4]); river('#4a95cf');
    for (const k of ['haifa', 'tlv', 'jer', 'bs', 'tib', 'eilat']) dot(k, 2.2 * sx + 1, '#6b4a3a', '#f3e9c9');
  } else if (style === 'physical') { river('#3f8fdc'); } else if (style === 'political') {
    roads('#a63a2a', 2 * sx + 0.6); for (const k of Object.keys(CITIES)) dot(k, 3.2 * sx + 1, '#d8362a', '#ffffff');
  } else {
    for (let k = 0; k < 400; k++) {
      const x = GX0 + R() * (GX1 - GX0), z = z0 + R() * (z1 - z0), y = hAt(x, z); if (y < 0.2) continue;
      const wet = (1 - sm((z + 32) / 62)) * 0.9 + 0.1; if (R() > wet * wet) continue;
      const p = P(x, z), s = 3.2 * sx + 1.5; g.fillStyle = '#1f68c4'; g.beginPath(); g.moveTo(p[0], p[1] - s * 1.6); g.quadraticCurveTo(p[0] + s, p[1], p[0], p[1] + s * 0.8); g.quadraticCurveTo(p[0] - s, p[1], p[0], p[1] - s * 1.6); g.fill();
    }
  }
  return tex(c);
}

/* glow layer for a painted map: kind sea | mount ; RGBA, to be shown additive */
export function glowTex(kind, w, h, z0, z1) {
  const c = mkCanvas(w, h), g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const y = hAt(GX0 + (i + 0.5) / w * (GX1 - GX0), z0 + (j + 0.5) / h * (z1 - z0)), k = (j * w + i) * 4;
    const on = kind === 'sea' ? y < 0.12 : y > 1.5;
    if (!on) continue;
    d[k] = kind === 'sea' ? 70 : 255; d[k + 1] = kind === 'sea' ? 190 : 170; d[k + 2] = kind === 'sea' ? 255 : 50; d[k + 3] = kind === 'sea' ? 190 : 210;
  }
  g.putImageData(img, 0, 0); return tex(c);
}

/* an overlay mesh that follows the table map surface only where maskFn>0 ; colorFn(x,z,mask,c) ; optional rise uniform */
export function makeOverlay(maskFn, colorFn, o) {
  o = o || {}; const step = o.step || 0.4, lift = o.lift == null ? 0.1 : o.lift;
  const nx = Math.round((GX1 - GX0) / step), nz = Math.round((GZ1 - GZ0) / step), M = new Float32Array((nx + 1) * (nz + 1));
  const pos = [], col = [], msk = [], c = new THREE.Color();
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = GX0 + i * step, z = GZ0 + j * step, m = cl(maskFn(x, z)); M[j * (nx + 1) + i] = m;
    pos.push(x, mapY(x, z) + lift, z); c.setRGB(0, 0, 0); colorFn(x, z, m, c); col.push(c.r, c.g, c.b); msk.push(m);
  }
  const idx = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, cc = a + nx + 1, dd = cc + 1;
    if (Math.max(M[a], M[b], M[cc], M[dd]) < 0.02) continue; idx.push(a, cc, b, b, cc, dd);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setAttribute('aMask', new THREE.Float32BufferAttribute(msk, 1));
  geo.setIndex(idx); geo.computeVertexNormals();
  let mat; const uRise = { value: 0 };
  if (o.solid) {
    mat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#000000' });
    mat.onBeforeCompile = sh => { sh.uniforms.uRise = uRise; sh.vertexShader = 'attribute float aMask;\nuniform float uRise;\n' + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = vec3(position); transformed.y += uRise * aMask;'); };
  } else mat = ADD('#ffffff', { vertexColors: true, opacity: 0 });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 3;
  mesh.userData.uRise = uRise; return mesh;
}

/* ------------------------------------------------------------------ props */
export function makeEasel(w, h) {
  const g = new THREE.Group(), wood = lam('#8a5a30', { map: woodTex(3, 2, 2) }), dark = lam('#5e3d1e', { map: woodTex(4, 2, 2) }), gold = phong('#c9a24a', { shininess: 60, specular: '#fff0b0' });
  const box = (sx, sy, sz, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m || wood); b.position.set(x, y, z); g.add(b); return b; };
  const cy = h / 2 + 2.2;
  for (const s of [-1, 1]) { const L = box(0.4, h + 4.2, 0.4, s * (w / 2 + 0.7), (h + 4.2) / 2, -0.6); L.rotation.x = 0.08; }
  const back = box(0.36, h + 3.2, 0.36, 0, (h + 3.2) / 2, -3.2); back.rotation.x = -0.40;
  box(w + 2.1, 0.36, 0.4, 0, h + 3.1, -0.2, dark); box(w + 2.0, 0.55, 1.7, 0, 1.2, 0.5, dark);
  box(w + 1.2, h + 1.2, 0.35, 0, cy, 0.0, dark);
  const ft = 0.6, fz = 0.42;
  box(w + 1.4 + ft, ft, 0.6, 0, cy + h / 2 + ft / 2 + 0.05, fz, gold); box(w + 1.4 + ft, ft, 0.6, 0, cy - h / 2 - ft / 2 - 0.05, fz, gold);
  box(ft, h + 0.2, 0.6, -(w / 2 + ft / 2 + 0.05), cy, fz, gold); box(ft, h + 0.2, 0.6, (w / 2 + ft / 2 + 0.05), cy, fz, gold);
  const panelMat = (t) => new THREE.MeshLambertMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.4 });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), panelMat(null)); panel.position.set(0, cy, 0.3); g.add(panel);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(w + 3.4, h + 3.4), ADD('#ffe27a', { opacity: 0 })); halo.position.set(0, cy, -0.05); g.add(halo);
  g.userData = { panel, cy, w, h, halo, ft,
    setTex(t) { panel.material = panelMat(t); },
    look(k, glow) { panel.material.color.setScalar(0.58 + 0.42 * k); panel.material.emissiveIntensity = 0.22 + 0.3 * k; halo.material.opacity = 0.6 * cl(glow || 0); },
    toPanel(x, z, z0, z1) { const u = (x - GX0) / (GX1 - GX0), v = (z - z0) / (z1 - z0); return [(u - 0.5) * w, cy + (0.5 - v) * h]; } };
  return shadowable(g);
}

export function makeRose(R) {
  const g = new THREE.Group(), arms = [];
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.2, R * 1.28, R * 0.07, 56), phong('#b8892f', { shininess: 70 })); base.position.y = R * 0.035; g.add(base);
  const fc = mkCanvas(512, 512), fg = fc.getContext('2d'); fg.fillStyle = '#f4ecd4'; fg.fillRect(0, 0, 512, 512);
  fg.strokeStyle = '#7a5a2a'; for (const [r, wd] of [[240, 6], [214, 3], [120, 3], [60, 2]]) { fg.lineWidth = wd; fg.beginPath(); fg.arc(256, 256, r, 0, 6.3); fg.stroke(); }
  for (let k = 0; k < 64; k++) { const a = k * 6.2832 / 64, l = k % 8 === 0 ? 34 : k % 4 === 0 ? 24 : 14; fg.lineWidth = k % 8 === 0 ? 5 : 2; fg.beginPath(); fg.moveTo(256 + Math.cos(a) * 240, 256 + Math.sin(a) * 240); fg.lineTo(256 + Math.cos(a) * (240 - l), 256 + Math.sin(a) * (240 - l)); fg.stroke(); }
  for (let k = 0; k < 16; k++) { const a = k * 6.2832 / 16; fg.lineWidth = 1.5; fg.beginPath(); fg.moveTo(256, 256); fg.lineTo(256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214); fg.stroke(); }
  const face = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.1, R * 1.1, R * 0.08, 56), [lam('#e9dcb8'), new THREE.MeshLambertMaterial({ map: tex(fc), emissive: '#555555', emissiveMap: tex(fc) }), lam('#e9dcb8')]); face.position.y = R * 0.045; g.add(face);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 1.14, R * 0.04, 8, 64).rotateX(Math.PI / 2), phong('#d9b04c', { shininess: 90 })); ring.position.y = R * 0.09; g.add(ring);
  const mk = (L, Wd, sgn) => { const s = new THREE.Shape(); s.moveTo(0, -0.18 * L); s.lineTo(sgn * Wd, 0); s.lineTo(0, L); s.lineTo(0, -0.18 * L); return new THREE.ExtrudeGeometry(s, { depth: R * 0.1, bevelEnabled: true, bevelSize: R * 0.012, bevelThickness: R * 0.02, bevelSegments: 1 }).rotateX(-Math.PI / 2); };
  for (let i = 0; i < 8; i++) {
    const main = i % 2 === 0, L = R * (main ? 1.0 : 0.66), Wd = R * (main ? 0.17 : 0.11), a = new THREE.Group();
    const cA = i === 0 ? '#d24a34' : '#e6c15e', cB = i === 0 ? '#982818' : '#a67a2a';
    const m1 = phong(cA, { shininess: 90, specular: '#fff3c0' }), m2 = phong(cB, { shininess: 70 });
    const e1 = new THREE.Mesh(mk(L, Wd, 1), m1), e2 = new THREE.Mesh(mk(L, Wd, -1), m2); e1.position.y = R * 0.1; e2.position.y = R * 0.1; a.add(e1, e2);
    const hs = new THREE.Shape(); hs.moveTo(0, -0.3 * L); hs.lineTo(Wd * 1.7, 0); hs.lineTo(0, L * 1.2); hs.lineTo(-Wd * 1.7, 0); hs.lineTo(0, -0.3 * L);
    const halo = new THREE.Mesh(new THREE.ShapeGeometry(hs).rotateX(-Math.PI / 2), ADD('#ffd24a', { opacity: 0 })); halo.position.y = R * 0.11; a.add(halo);
    a.rotation.y = -i * Math.PI / 4; g.add(a); arms.push({ m1, m2, halo, L });
  }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(R * 0.13, 20, 14), phong('#f0cf6a', { shininess: 100, specular: '#ffffff' })); hub.position.y = R * 0.26; g.add(hub);
  const ringQ = new THREE.Mesh(new THREE.TorusGeometry(R * 0.2, R * 0.035, 8, 32).rotateX(Math.PI / 2), BASIC('#ffd24a')); ringQ.position.set(0, R * 0.3, -R * 1.04); ringQ.visible = false; g.add(ringQ);
  g.userData = {
    arms, R,
    glow(i, v) { const a = arms[i]; v = cl(v); a.m1.emissive.setRGB(1.0 * v, 0.72 * v, 0.2 * v); a.m2.emissive.setRGB(0.8 * v, 0.55 * v, 0.12 * v); a.halo.material.opacity = 0.8 * v; },
    question(v, t, col) { ringQ.visible = v > 0; ringQ.scale.setScalar(pop(v) * (1 + 0.12 * Math.sin(t * 8))); ringQ.material.color.set(col || '#ffd24a'); }
  };
  return shadowable(g);
}

export function makeRuler(L, Wd) {
  const c = mkCanvas(1024, 96), g = c.getContext('2d'); g.fillStyle = '#e9d194'; g.fillRect(0, 0, 1024, 96); g.fillStyle = '#2b2118';
  for (let k = 0; k <= 60; k++) { const x = 10 + k * (1004 / 60), l = k % 10 === 0 ? 46 : k % 5 === 0 ? 34 : 20; g.fillRect(x - 1.5, 0, 3, l); }
  const top = new THREE.MeshLambertMaterial({ map: tex(c), emissive: '#444444', emissiveMap: tex(c) }), side = lam('#c9a866');
  const m = new THREE.Mesh(new THREE.BoxGeometry(L, 0.4, Wd), [side, side, top, side, side, side]); return shadowable(m);
}

export const digitTex = txt => {
  const c = mkCanvas(128, 128), g = c.getContext('2d'); g.fillStyle = '#f3ead2'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#5a4630'; g.lineWidth = 8; g.strokeRect(6, 6, 116, 116);
  g.fillStyle = '#2b2118'; g.font = 'bold ' + (txt.length > 1 ? 66 : 92) + 'px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 64, 68); return tex(c);
};
export function makeMilestone(txt) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.7, 4.2, 1.2), lam('#d9d0b8', { map: noiseTex(41, 3, 3) })); b.position.y = 2.1; g.add(b);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 1.5), lam('#bfb594')); cap.position.y = 4.4; g.add(cap);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshLambertMaterial({ map: digitTex(txt), emissive: '#ffffff', emissiveMap: digitTex(txt), emissiveIntensity: 0.5 })); pl.position.set(0, 2.9, 0.61); g.add(pl);
  g.userData.pop = (u, s) => { g.visible = u > 0; g.scale.setScalar((s || 1) * pop(u)); };
  return shadowable(g);
}

export function makeChip(color, r) {
  const g = new THREE.Group(), R = r || 4;
  const face = new THREE.Mesh(new THREE.CylinderGeometry(R, R, R * 0.28, 40).rotateX(Math.PI / 2), phong(color, { shininess: 70, specular: '#ffffff' }));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, R * 0.09, 10, 48), phong('#d9b04c', { shininess: 90 })); const inner = new THREE.Mesh(new THREE.CircleGeometry(R * 0.72, 32), lam('#ffffff', { transparent: true, opacity: 0.18 })); inner.position.z = R * 0.15;
  const halo = new THREE.Mesh(new THREE.CircleGeometry(R * 1.5, 40), ADD('#fff2a0', { opacity: 0 })); halo.position.z = -R * 0.2;
  g.add(face, rim, inner, halo);
  g.userData.glow = v => { halo.material.opacity = 0.8 * cl(v); face.material.emissive.setRGB(0.5 * v, 0.45 * v, 0.2 * v); };
  g.userData.R = R; return shadowable(g);
}

export function makeScroll(w, rad) {
  const g = new THREE.Group();
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, w, 24).rotateZ(Math.PI / 2), lam('#f1e6c6')); g.add(cyl);
  for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.45, rad * 0.45, 0.5, 14).rotateZ(Math.PI / 2), phong('#8a5a30')); k.position.x = s * (w / 2 + 0.2); g.add(k); }
  g.userData.cyl = cyl; return shadowable(g);
}

export function makeKey() {
  const g = new THREE.Group(), m = phong('#d9b04c', { shininess: 100, specular: '#fff6c8' });
  const bow = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.28, 10, 24).rotateX(Math.PI / 2), m); bow.position.x = -3; g.add(bow);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 5, 10).rotateZ(Math.PI / 2), m); sh.position.x = 0.1; g.add(sh);
  for (const x of [1.4, 2.3]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 1.0), m); t.position.set(x, 0, 0.55); g.add(t); }
  return shadowable(g);
}

export function bookStack(n, seed) {
  const g = new THREE.Group(), r = rng(seed); let y = 0;
  for (let i = 0; i < n; i++) { const h = 0.8 + r() * 0.7, b = new THREE.Mesh(new THREE.BoxGeometry(6 + r() * 2, h, 4.4 + r() * 1.2), lam(['#8a2f2a', '#2f5f8a', '#3f7a45', '#7a5a2a', '#5a3a6a'][i % 5])); b.position.set((r() - 0.5) * 0.8, y + h / 2, 0); b.rotation.y = (r() - 0.5) * 0.5; g.add(b); y += h; }
  return shadowable(g);
}
export function inkwell() {
  const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 2.0, 20), phong('#23303c', { shininess: 80 })); b.position.y = 1.0; g.add(b);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 9, 8), lam('#f2ead2')); p.position.set(1.5, 5.5, 0); p.rotation.z = -0.28; g.add(p);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.0, 8), lam('#f2ead2')); tip.position.set(2.6, 10.1, 0); tip.rotation.z = -0.28; tip.scale.set(0.5, 0.5, 0.5); g.add(tip); return shadowable(g);
}
export function magnifier() {
  const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.TorusGeometry(3, 0.3, 10, 36), phong('#c9a24a', { shininess: 80 })); r.rotation.x = Math.PI / 2; r.position.y = 0.4; g.add(r);
  const gl = new THREE.Mesh(new THREE.CircleGeometry(2.9, 32).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ color: '#cfe8f4', transparent: true, opacity: 0.35, shininess: 120 })); gl.position.y = 0.4; g.add(gl);
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 5, 10).rotateZ(Math.PI / 2), lam('#6b4020')); h.position.set(5.6, 0.4, 0); g.add(h); return shadowable(g);
}
export function penCup() {
  const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 3.2, 18), phong('#9a3a2a', { shininess: 50 })); c.position.y = 1.6; g.add(c);
  ['#e8a41c', '#2f5f8a', '#3f7a45', '#b02a1c'].forEach((col, i) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 5.5, 6), lam(col)); p.position.set(-0.6 + i * 0.4, 4.0, 0.3 * (i % 2)); p.rotation.z = (i - 1.5) * 0.12; g.add(p); }); return shadowable(g);
}
export function paperSheet(w, d, t) {
  const side = lam('#efe3c3'), top = new THREE.MeshLambertMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.35 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, d), [side, side, top, side, side, side]); m.castShadow = true; m.receiveShadow = true; return m;
}

/* ------------------------------------------------------------------ eye level hill set */
export function backdrop(rotY) { const g = new THREE.Group(); g.add(K.makeHills(lam('#9db483'), lam('#b2c6b4'), lam('#d0dde0')), K.makeClouds(BASIC('#ffffff'))); g.rotation.y = rotY || 0; return g; }
export function hillSet(o) {
  const grp = new THREE.Group(), hfn = o.hfn, seed = o.seed || 1;
  const GC = ['#9cc56a', '#86b257', '#a9c46a', '#93bd5e'].map(C);
  const colr = (x, y, z, c) => { c.copy(GC[Math.floor(hash2(Math.floor(x / 3), Math.floor(z / 3)) * 4)]); if (o.paint) o.paint(x, y, z, c); c.lerp(C('#c4b078'), sm((y - 9) / 5) * 0.5); };
  const gm = K.heightMesh(-170, 170, -200, 70, 170, 135, hfn, colr, lam('#ffffff', { vertexColors: true, map: noiseTex(seed + 20, 22, 17) })); gm.castShadow = true; grp.add(gm);
  if (o.backdrop !== false) grp.add(backdrop(0));
  const r = rng(seed * 3 + 1), tl = [];
  for (let k = 0; k < 800 && tl.length < (o.trees || 40); k++) { const x = (r() - 0.5) * 200, z = -10 - r() * 110; if (o.clear && o.clear(x, z)) continue; tl.push([x, hfn(x, z), z, 0.8 + r() * 0.7, r()]); }
  for (let i = 0; i < (o.row || 0); i++) { const x = -92 + i * 6.5, z = o.rowZ || -24; tl.push([x, hfn(x, z), z, 1.0, 0.3 + (i % 3) * 0.2]); }
  grp.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34', '#6aa04a']));
  const rr = rng(seed + 8), rt = rng(seed + 10), zr = o.zr || [-12, 32];
  grp.add(K.rocks(80, 2 + seed, () => [(rr() - 0.5) * 70, 0.1, zr[0] + rr() * (zr[1] - zr[0])], '#b9ae98', 0.25, 0.9));
  grp.add(K.tufts(1200, 3 + seed, () => { const x = (rt() - 0.5) * 70, z = zr[0] + rt() * (zr[1] - zr[0]); return [x, hfn(x, z), z]; }, ['#6f9d4a', '#86b257', '#9cc56a', '#b9c46f'], 0.4, 1.0));
  return { grp, hfn };
}
