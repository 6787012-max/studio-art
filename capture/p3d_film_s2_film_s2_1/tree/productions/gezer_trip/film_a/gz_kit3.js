/* gz_kit3 - textures, masonry, cities, instanced detail for gezer_trip film_a (s0,s1,s2,s4,s5). ASCII only. No people. */
import * as THREE from 'three';
import { rng, shadowable } from './gz_kit2.js';
import { sm } from './gz_kit.js';

export const lam = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
export const phong = (c, o) => new THREE.MeshPhongMaterial(Object.assign({ color: c }, o || {}));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function cvs(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function mk(c, rx, ry) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4;
  return t;
}

/* soft mottled noise, light grey base (multiplied by the material colour) */
export function noiseTex(seed, rx, ry, o) {
  o = Object.assign({ base: '#f1f1f1', n: 6000, blots: 16, dk: 'rgba(70,58,40,0.20)', lt: 'rgba(255,255,248,0.22)' }, o || {});
  const c = cvs(256, 256), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = o.base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < o.blots; i++) {
    const x = r() * 256, y = r() * 256, rad = 28 + r() * 60, dk = r() < 0.5;
    for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) {
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad);
      gr.addColorStop(0, dk ? 'rgba(80,65,45,0.16)' : 'rgba(255,255,245,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x + dx - rad, y + dy - rad, rad * 2, rad * 2);
    }
  }
  for (let i = 0; i < o.n; i++) { g.fillStyle = r() < 0.5 ? o.dk : o.lt; g.fillRect(r() * 256, r() * 256, 1 + r() * 2.2, 1 + r() * 2.2); }
  return mk(c, rx, ry);
}

/* ashlar masonry tile: 4 rows, irregular blocks, dark mortar */
export function ashlarTex(seed) {
  const S = 512, rows = 4, rh = S / rows, c = cvs(S, S), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = '#7d7561'; g.fillRect(0, 0, S, S);
  for (let j = 0; j < rows; j++) {
    let x = -r() * 90;
    while (x < S) {
      const w = 80 + r() * 90, tone = 218 + Math.floor(r() * 34);
      const gr = g.createLinearGradient(0, j * rh, 0, (j + 1) * rh);
      gr.addColorStop(0, 'rgb(' + (tone + 4) + ',' + (tone + 1) + ',' + (tone - 12) + ')');
      gr.addColorStop(1, 'rgb(' + (tone - 22) + ',' + (tone - 25) + ',' + (tone - 40) + ')');
      g.fillStyle = gr; g.fillRect(x + 2, j * rh + 2.5, w - 4, rh - 5);
      g.fillStyle = 'rgba(255,255,240,0.35)'; g.fillRect(x + 2, j * rh + 2.5, w - 4, 3);
      x += w;
    }
  }
  for (let i = 0; i < 5000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,50,30,0.16)' : 'rgba(255,255,245,0.16)'; g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2); }
  return mk(c, 1, 1);
}

export function woodTex(seed, rx, ry) {
  const c = cvs(256, 256), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = '#d6d0c8'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) {
    const y = r() * 256; g.strokeStyle = r() < 0.6 ? 'rgba(60,35,15,0.28)' : 'rgba(255,240,220,0.18)'; g.lineWidth = 0.6 + r() * 2;
    g.beginPath(); for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + 3 * Math.sin(x * 0.04 + i)); g.stroke();
  }
  for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(40,22,8,0.35)'; g.fillRect(0, k * 64, 256, 2); }
  return mk(c, rx, ry);
}

export function waveTex(seed, rx, ry) {
  const c = cvs(512, 512), g = c.getContext('2d'), r = rng(seed);
  g.clearRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) {
    const y = r() * 512, x0 = r() * 512, len = 90 + r() * 140;
    g.strokeStyle = 'rgba(255,255,255,' + (0.35 + r() * 0.3).toFixed(2) + ')'; g.lineWidth = 2 + r() * 2; g.lineCap = 'round';
    for (const dx of [-512, 0, 512]) { g.beginPath(); for (let k = 0; k <= 12; k++) g.lineTo(x0 + dx + k / 12 * len, y + 5 * Math.sin(k * 0.9 + i)); g.stroke(); }
  }
  return mk(c, rx, ry);
}

/* mortar-lined cache: ashlar material for a face of len x h world units */
const ashCache = {};
let ashBase = null;
export function ashMat(color, len, h) {
  if (!ashBase) ashBase = ashlarTex(41);
  const rx = Math.max(0.5, Math.round(len / 3.2 * 2) / 2), ry = Math.max(0.5, Math.round(h / 1.6 * 2) / 2);
  const key = color + rx + '_' + ry;
  if (!ashCache[key]) { const t = ashBase.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); ashCache[key] = lam(color, { map: t }); }
  return ashCache[key];
}

/* instanced helpers */
const D0 = new THREE.Object3D();
export function inst(geo, mat, n, fn) {
  const m = new THREE.InstancedMesh(geo, mat, n), col = new THREE.Color();
  let k = 0;
  for (let i = 0; i < n; i++) {
    D0.position.set(0, 0, 0); D0.rotation.set(0, 0, 0); D0.scale.set(1, 1, 1);
    const c = fn(i, D0, col);
    if (c === false) continue;
    D0.updateMatrix(); m.setMatrixAt(k, D0.matrix);
    if (c) m.setColorAt(k, c);
    k++;
  }
  m.count = k; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
  return m;
}

/* dry-grass or green tufts: 3 blades per tuft; place(r) -> [x,y,z] or null */
export function tufts(n, seed, place, palette, hmin, hmax) {
  const geo = new THREE.ConeGeometry(0.06, 1, 4, 1).translate(0, 0.5, 0);
  const r = rng(seed), pal = palette.map(c => new THREE.Color(c)), st = {};
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  const mm = inst(geo, mat, n * 3, (i, d, col) => {
    if (i % 3 === 0) { st.p = place(r); st.h = hmin + r() * (hmax - hmin); st.c = pal[Math.floor(r() * pal.length)]; }
    const p = st.p; if (!p) return false;
    const a = (i % 3) * 2.1 + r() * 0.6, h = st.h * (0.7 + r() * 0.5);
    d.position.set(p[0] + Math.cos(a) * 0.08, p[1], p[2] + Math.sin(a) * 0.08);
    d.rotation.set(Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35);
    d.scale.set(1, h, 1);
    col.copy(st.c).multiplyScalar(0.85 + r() * 0.3); return col;
  });
  mm.castShadow = false;
  return mm;
}

const rockGeo = (() => {
  const geo = new THREE.IcosahedronGeometry(1, 1), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + 0.18 * Math.sin(x * 5.1 + y * 3.7) * Math.cos(z * 4.3 + 1.2);
    p.setXYZ(i, x * k, y * k, z * k);
  }
  geo.computeVertexNormals(); return geo;
})();
export function rocks(n, seed, place, color, smin, smax) {
  const r = rng(seed), mat = new THREE.MeshLambertMaterial({ color: '#ffffff', map: noiseTex(seed + 3, 1, 1) });
  const base = new THREE.Color(color);
  return inst(rockGeo, mat, n, (i, d, col) => {
    const p = place(r); if (!p) return false;
    const s = smin + r() * (smax - smin);
    d.position.set(p[0], p[1] + s * 0.25, p[2]); d.rotation.set(0, r() * 6, 0); d.scale.set(s * (0.9 + r() * 0.5), s * (0.55 + r() * 0.25), s * (0.8 + r() * 0.4));
    col.copy(base).multiplyScalar(0.8 + r() * 0.35); return col;
  });
}

export function bushes(n, seed, place, color, smin, smax) {
  const r = rng(seed), base = new THREE.Color(color);
  const geo = new THREE.IcosahedronGeometry(1, 1);
  return inst(geo, new THREE.MeshLambertMaterial({ color: '#ffffff', map: noiseTex(seed + 9, 1, 1) }), n, (i, d, col) => {
    const p = place(r); if (!p) return false;
    const s = smin + r() * (smax - smin);
    d.position.set(p[0], p[1] + s * 0.55, p[2]); d.rotation.set(0, r() * 6, 0); d.scale.set(s * 1.1, s * 0.75, s);
    col.copy(base).multiplyScalar(0.75 + r() * 0.5); return col;
  });
}

/* palm: curved trunk and drooping fronds */
export function makePalm(h, seed) {
  const g = new THREE.Group(), r = rng(seed);
  const bend = (r() - 0.5) * 1.4;
  const pts = [0, 1, 2, 3].map(i => new THREE.Vector3(bend * (i / 3) * (i / 3), h * i / 3, 0.2 * i));
  const tr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.2, 6, false), lam('#8a6a45', { map: noiseTex(5, 1, 4) }));
  tr.castShadow = true; g.add(tr);
  const top = pts[3];
  for (let k = 0; k < 9; k++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.42, 3.4, 4, 1).translate(0, 1.7, 0), lam(k % 2 ? '#5f8f3c' : '#4f7d33'));
    f.scale.z = 0.12; f.castShadow = true;
    const pv = new THREE.Group(); pv.position.copy(top);
    pv.rotation.set(0, k * 0.7 + r(), 0); f.rotation.z = -1.25 - r() * 0.25; f.position.y = 0;
    pv.add(f); g.add(pv);
  }
  return g;
}

/* crenellations: instanced merlons along (x0,z0)->(x1,z1) at height y */
export function merlons(list, mat, size) {
  const n = list.length;
  return inst(new THREE.BoxGeometry(size, size * 0.9, size), mat, n, (i, d) => {
    const q = list[i]; d.position.set(q[0], q[1], q[2]); d.rotation.y = q[3] || 0;
  });
}

/* walled city on a flat top. origin = ground centre. gate on the +z side. */
export function makeCity(o) {
  const W = o.W || 11, D = o.D || 7.5, wallH = o.wallH || 1.9, towerH = o.towerH || 3.4, nh = o.houses || 14;
  const seed = o.seed || 3, col = o.color || '#e6d8b8', mids = !!o.midTowers, tw = 2.2;
  const g = new THREE.Group(), r = rng(seed), mer = [], T = 0.9;
  const box = (x, y, z, sx, sy, sz, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); m.position.set(x, y, z); g.add(m); return m; };
  const wall = (cx, cz, lx, lz) => {
    const len = Math.max(lx, lz);
    const mt = ashMat(col, len, wallH);
    box(cx, wallH / 2, cz, lx, wallH, lz, mt);
    const n = Math.floor(len / 0.95);
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n - 0.5;
      if (lx > lz) mer.push([cx + u * lx, wallH + 0.2, cz]); else mer.push([cx, wallH + 0.2, cz + u * lz]);
    }
  };
  const gap = 3.6;
  wall(-(W / 4 + gap / 4), D / 2, W / 2 - gap / 2, T); wall((W / 4 + gap / 4), D / 2, W / 2 - gap / 2, T);
  wall(0, -D / 2, W, T); wall(-W / 2, 0, T, D); wall(W / 2, 0, T, D);
  const tower = (x, z, hh) => {
    box(x, hh / 2, z, tw, hh, tw, ashMat(col, tw, hh));
    box(x, hh + 0.1, z, tw + 0.3, 0.2, tw + 0.3, lam('#cdbd98'));
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) mer.push([x + dx * (tw / 2 + 0.05), hh + 0.45, z + dz * (tw / 2 + 0.05)]);
    box(x, hh * 0.62, z + tw / 2 + 0.02, 0.22, 0.75, 0.1, new THREE.MeshBasicMaterial({ color: '#1a120c' }));
  };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tower(sx * W / 2, sz * D / 2, towerH);
  if (mids) { tower(0, -D / 2, towerH * 0.95); tower(-W / 2, 0, towerH * 0.9); tower(W / 2, 0, towerH * 0.9); tower(-W / 4 - 0.6, D / 2, towerH * 0.9); tower(W / 4 + 0.6, D / 2, towerH * 0.9); }
  /* gate: two pylons, lintel, dark opening, wooden doors */
  const gh = towerH + 0.5, zg = D / 2 + 0.2;
  for (const s of [-1, 1]) {
    box(s * (gap / 2 + 0.7), gh / 2, zg, 1.4, gh, 2.3, ashMat(col, 2.3, gh));
    box(s * (gap / 2 + 0.7), gh + 0.1, zg, 1.7, 0.2, 2.6, lam('#cdbd98'));
    for (let k = 0; k < 3; k++) mer.push([s * (gap / 2 + 0.7) + (k - 1) * 0.55, gh + 0.45, zg + 1.0]);
  }
  box(0, gh - 0.8, zg, gap, 1.6, 2.3, ashMat(col, gap, 1.6));
  box(0, gh - 0.8 + 0.9, zg, gap + 0.4, 0.2, 2.6, lam('#cdbd98'));
  for (let k = 0; k < 6; k++) mer.push([(k - 2.5) * 0.62, gh + 0.1 + 0.45 + 0.1, zg + 1.0]);
  const gw = gap - 0.4, ohh = gh - 1.6;
  box(0, ohh / 2, zg - 0.3, gw, ohh, 0.2, new THREE.MeshBasicMaterial({ color: '#150e09' }));
  box(0, ohh / 2, zg + 0.9, gw + 0.2, ohh, 0.05, new THREE.MeshBasicMaterial({ color: '#150e09' }));
  const wood = lam('#9a6a38', { map: woodTex(8, 1, 1) });
  for (const s of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(s * gw / 2, 0, zg + 1.12); pv.rotation.y = s * 1.15;
    const dm = new THREE.Mesh(new THREE.BoxGeometry(gw / 2, ohh * 0.96, 0.12), wood); dm.position.set(-s * gw / 4, ohh * 0.48, 0); pv.add(dm);
    for (const y of [0.35, 0.8]) { const st = new THREE.Mesh(new THREE.BoxGeometry(gw / 2, 0.1, 0.16), lam('#3a2a18')); st.position.set(-s * gw / 4, y * ohh, 0); pv.add(st); }
    g.add(pv);
  }
  g.add(merlons(mer, lam('#d8caa6'), 0.5));
  /* ground and houses */
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.8, D - 0.8).rotateX(-Math.PI / 2), lam('#c9b384')); fl.position.y = 0.04; fl.receiveShadow = true; g.add(fl);
  const hc = ['#e8d9b6', '#d9c294', '#efe4cc', '#cdb184', '#e1ccA0'];
  const placed = [];
  for (let tries = 0, n = 0; n < nh && tries < 300; tries++) {
    const w = 1.1 + r() * 1.0, d = 0.9 + r() * 0.8, x = (r() - 0.5) * (W - 2.6), z = -D / 2 + 1.3 + r() * (D - 3.6);
    if (placed.some(p => Math.abs(p[0] - x) < (p[2] + w) / 2 + 0.15 && Math.abs(p[1] - z) < (p[3] + d) / 2 + 0.15)) continue;
    if (Math.abs(x) < 1.0 && z > D / 2 - 3.2) continue;
    const h = 0.9 + r() * 1.0 + (1 - (z + D / 2) / D) * 0.9;
    const c = hc[n % hc.length];
    box(x, h / 2, z, w, h, d, lam(c, { map: noiseTex(4 + n, 1, 1) }));
    box(x, h + 0.05, z, w + 0.12, 0.1, d + 0.12, lam('#f1e7d0'));
    box(x + (r() - 0.5) * w * 0.4, 0.4, z + d / 2 + 0.01, 0.3, 0.7, 0.06, new THREE.MeshBasicMaterial({ color: '#2a1d12' }));
    placed.push([x, z, w, d]); n++;
  }
  g.scale.setScalar(o.scale || 1);
  return shadowable(g);
}

/* far backdrop: hills in three value steps, clouds, giant ground plane, sky handled by caller */
export function farGround(color, y) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), lam(color));
  m.position.y = y; m.receiveShadow = false; return m;
}

/* wheel with 6 spokes, axis along z */
export function makeWheel(R, mat) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.06, 6, 18), mat); g.add(rim);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 8).rotateX(Math.PI / 2), mat); g.add(hub);
  for (let k = 0; k < 6; k++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.06, R * 2 - 0.08, 0.06), mat); sp.rotation.z = k * Math.PI / 6; g.add(sp);
  }
  return g;
}

/* ox-cart (no animal): bed with sides, two spoked wheels, axle, long shaft. long axis +x, base on ground */
export function makeCart2(wood, dark) {
  const g = new THREE.Group(), R = 0.55, wheels = [];
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 1.1), wood); bed.position.y = 0.85; g.add(bed);
  for (const z of [-0.55, 0.55]) { const s = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.08), wood); s.position.set(0, 1.1, z); g.add(s); }
  for (const x of [-1.0, 1.0]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 1.1), wood); s.position.set(x, 1.1, 0); g.add(s); }
  const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6).rotateX(Math.PI / 2), dark); ax.position.set(0, R, 0); g.add(ax);
  for (const z of [-0.72, 0.72]) { const w = makeWheel(R, dark); w.position.set(0, R, z); g.add(w); wheels.push(w); }
  const sh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.09, 0.09), dark); sh.position.set(2.0, 0.8, 0.0); sh.rotation.z = 0.14; g.add(sh);
  const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.9), dark); yoke.position.set(3.2, 0.96, 0); g.add(yoke);
  g.userData.wheels = wheels; g.userData.R = R;
  return shadowable(g);
}
