/* toldot10g film_s6 parts (own folder, kit10g.js untouched). ASCII only. No people. No text except the digits 1 2 3.
   Every function is a pure function of the time passed in. */
import * as THREE from 'three';
import { ribbon } from '../../gezer_trip/film_a/gz_kit2.js';
import { ashMat, makePalm } from '../../gezer_trip/film_a/gz_kit3.js';
import * as K from '../kit10g.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, phong, heightMesh, noiseTex, woodTex, waveTex } = K;
export const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
export const ADD = (c, op) => BASIC(c, { transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/* ---------------------------------------------------------------- a water drop (blue teardrop prop) */
export function makeDrop(col, size) {
  const g = new THREE.Group(), m = phong(col, { shininess: 100, specular: '#ffffff', emissive: C(col).multiplyScalar(0.28) });
  const a = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), m), b = new THREE.Mesh(new THREE.ConeGeometry(0.87, 1.8, 20).translate(0, 1.5, 0), m);
  a.castShadow = b.castShadow = true; g.add(a, b);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6).scale(1, 1.6, 0.6), BASIC('#ffffff')); hl.position.set(-0.45, 0.35, 0.8); g.add(hl);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 12), ADD('#cfeaff', 0)); halo.position.y = 0.8; g.add(halo);
  const S = size || 1;
  g.userData.pop = u => { g.scale.setScalar(S * pop(u)); g.visible = u > 0; };
  g.userData.glow = k => { halo.material.opacity = 0.3 * cl(k); halo.scale.setScalar(0.55 + 0.45 * cl(k)); };
  return g;
}

/* ---------------------------------------------------------------- round digit badge (the only text: 1 2 3) */
export function badge(d, col, R) {
  const c = cvs(256, 256), g = c.getContext('2d');
  g.fillStyle = '#fff8e0'; g.beginPath(); g.arc(128, 128, 122, 0, 6.3); g.fill();
  g.lineWidth = 14; g.strokeStyle = col; g.stroke();
  g.fillStyle = col; g.font = 'bold 168px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(d), 128, 140);
  const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  m.renderOrder = 6; m.userData.R = R;
  m.userData.pop = u => { m.scale.setScalar(R * pop(u)); m.visible = u > 0; };
  return m;
}

/* round icon badge: 'river' (yellow land, blue river and canals) or 'cloud' (green fields, rain cloud) */
export function iconBadge(kind, R) {
  const c = cvs(256, 256), g = c.getContext('2d');
  g.save(); g.beginPath(); g.arc(128, 128, 118, 0, 6.3); g.clip();
  if (kind === 'river') {
    g.fillStyle = '#f0d27a'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#8cc45a'; g.fillRect(70, 0, 116, 256);
    g.strokeStyle = '#2f8fe8'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(128, -10); g.bezierCurveTo(70, 70, 190, 150, 128, 270); g.stroke();
    g.lineWidth = 9; for (const y of [60, 130, 195]) { g.beginPath(); g.moveTo(128, y); g.lineTo(34, y + 6); g.moveTo(128, y); g.lineTo(222, y + 6); g.stroke(); }
  } else {
    g.fillStyle = '#a8d8f0'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#7fbf4a'; g.fillRect(0, 168, 256, 90);
    g.fillStyle = '#e8c95a'; g.fillRect(0, 196, 256, 14);
    g.fillStyle = '#eef2f6'; g.strokeStyle = '#7a8ba0'; g.lineWidth = 7;
    g.beginPath(); g.arc(88, 100, 34, 0, 6.3); g.arc(128, 78, 46, 0, 6.3); g.arc(172, 102, 34, 0, 6.3); g.fill(); g.fillRect(70, 100, 120, 36); g.stroke();
    g.strokeStyle = '#1d7fe0'; g.lineWidth = 11; g.lineCap = 'round'; for (const x of [84, 128, 172]) { g.beginPath(); g.moveTo(x, 150); g.lineTo(x - 8, 184); g.stroke(); }
  }
  g.restore(); g.lineWidth = 14; g.strokeStyle = '#fff8e0'; g.beginPath(); g.arc(128, 128, 120, 0, 6.3); g.stroke();
  const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  m.renderOrder = 6;
  m.userData.pop = (u, k) => { m.scale.setScalar(R * pop(u) * (k == null ? 1 : k)); m.visible = u > 0; };
  return m;
}

/* ---------------------------------------------------------------- the winter bar: wooden beam, blue fill, first and last drop */
export function makeBar(L) {
  const g = new THREE.Group(), half = L / 2;
  const wood = lam('#8a5a30', { map: woodTex(7, 6, 1) });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(L + 4, 1.6, 4.2), wood); beam.position.y = 0.8; beam.castShadow = true; beam.receiveShadow = true; g.add(beam);
  const chan = new THREE.Mesh(new THREE.BoxGeometry(L, 0.3, 2.5), lam('#2a1a0e')); chan.position.y = 1.62; g.add(chan);
  const fill = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2.3).translate(0.5, 0, 0), phong('#46a8ee', { emissive: '#0c3a6c', shininess: 90 }));
  fill.position.set(-half, 1.85, 0); g.add(fill);
  const minis = [];
  for (let k = 0; k <= 8; k++) {
    const x = -half + k * L / 8;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 8), lam('#e8d9b0')); p.position.set(x, 2.0, 1.35); g.add(p);
    if (k > 0 && k < 8) { const d = makeDrop(k < 5 ? '#7cc4f4' : '#3a8ae0', 0.5); d.position.set(x, 3.6, 0); g.add(d); minis.push([x, d]); }
  }
  const mk = (x, col, S) => {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.2, 10), lam('#6b4a2a')); st.position.set(x, 3.2, 0); g.add(st);
    const d = makeDrop(col, S); d.position.set(x, 7.2, 0); g.add(d); return [st, d];
  };
  const [st1, first] = mk(-half, '#4fa8ec', 1.9), [st2, last] = mk(half, '#1f6fd0', 2.2);
  g.userData.first = first; g.userData.last = last;
  g.userData.setPop = u => { g.visible = u > 0; g.scale.setScalar(Math.max(0.001, pop(u))); };
  g.userData.setEnds = (u1, u2) => { first.userData.pop(u1); st1.visible = u1 > 0; last.userData.pop(u2); st2.visible = u2 > 0; };
  g.userData.setFill = u => {
    fill.scale.set(Math.max(0.001, L * cl(u)), 1, 1); fill.visible = u > 0.002;
    minis.forEach(([x, d]) => d.userData.pop((cl(u) * L - (x + half)) / 1.6 + 0.4));
  };
  g.userData.setFill(0);
  return g;
}

/* ---------------------------------------------------------------- shared plinth for the two table models */
function addPlinth(g, W, D) {
  const wood = lam('#7a4a24', { map: woodTex(4, 4, 1) });
  const base = new THREE.Mesh(new THREE.BoxGeometry(W + 1, 2.2, D + 1), lam('#5a4632')); base.position.y = -1.1; base.receiveShadow = true; g.add(base);
  [[0, D / 2 + 0.5, W + 2.6, 1.0], [0, -D / 2 - 0.5, W + 2.6, 1.0], [W / 2 + 0.5, 0, 1.0, D], [-W / 2 - 0.5, 0, 1.0, D]].forEach(([x, z, sx, sz]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(sx, 2.6, sz), wood); b.position.set(x, -0.2, z); b.castShadow = true; b.receiveShadow = true; g.add(b);
  });
}
const segDist = (px, pz, a, b) => {
  const dx = b[0] - a[0], dz = b[1] - a[1], u = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - a[0] - u * dx, pz - a[1] - u * dz);
};

/* ---------------------------------------------------------------- our hilly land (dry brown -> lush green), 30 x 24 */
export function makeLandModel(seed, S) {
  const W = 30, D = 24, grp = new THREE.Group(), inner = new THREE.Group(); grp.add(inner); S = S || 1;
  addPlinth(inner, W, D);
  const hill = (x, z) => 4.4 * Math.exp(-Math.pow(x / 6.5, 2) - Math.pow((z + 3) / 6, 2)) + 3.0 * Math.exp(-Math.pow((x - 9) / 4.5, 2) - Math.pow((z - 4) / 6, 2))
    + 1.8 * Math.exp(-Math.pow((x + 5) / 4, 2) - Math.pow((z - 6) / 4, 2)) + 1.2 * Math.exp(-Math.pow((x - 4) / 5, 2) - Math.pow((z + 8) / 3, 2));
  const hfn = (x, z) => { const y0 = 0.9 + hill(x, z) + 0.14 * Math.sin(x * 0.8 + 1) * Math.cos(z * 0.7); return 0.22 + (y0 - 0.22) * sm((x + 13) / 5.5); };
  const GB = ['#78b848', '#68aa3c', '#8cc455', '#58983a', '#9cca5c'].map(C), GA = ['#d9c47c', '#cdb36a', '#e2cd8a', '#c4a95e', '#d2bd72'].map(C);
  const WH = C('#d9b13e'), WA = C('#c9a24a'), ROCK = C('#a49a7a'), SANDC = C('#ecdca8');
  const A = [], PX = [];
  const colour = (x, y, z, c) => {
    const gi = Math.floor(hash2(Math.floor(x / 2.4) + seed, Math.floor(z / 2.4)) * 5), wh = hash2(Math.floor(x / 4.8) * 3 + seed, Math.floor(z / 4.8) * 5 + 2) > 0.7 && y < 3.2;
    const a = GA[gi].clone(); if (wh) a.lerp(WA, 0.6);
    c.copy(GB[gi]); if (wh) c.lerp(WH, 0.8);
    const kr = sm((y - 4.6) / 1.2) * 0.6, ks = sm((-9 - x) / 3) * 0.9;
    c.lerp(ROCK, kr).lerp(SANDC, ks); a.lerp(ROCK, kr).lerp(SANDC, ks);
    A.push(a.r, a.g, a.b); PX.push(x);
  };
  const mesh = heightMesh(-W / 2, W / 2, -D / 2, D / 2, 75, 60, hfn, colour, lam('#ffffff', { vertexColors: true, map: noiseTex(23 + seed, 18, 14) }));
  mesh.castShadow = true; inner.add(mesh);
  const colA = mesh.geometry.attributes.color, Bc = Float32Array.from(colA.array), Ac = Float32Array.from(A);
  /* sea strip */
  const sea = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.8, D), new THREE.MeshLambertMaterial({ color: '#3d9ad6', transparent: true, opacity: 0.8, depthWrite: false }));
  sea.position.set(-W / 2 + 2.6, 0.1, 0); sea.renderOrder = 2; inner.add(sea);
  const wt = waveTex(5 + seed, 2, 3);
  const wave = new THREE.Mesh(new THREE.PlaneGeometry(5.2, D).rotateX(-Math.PI / 2), BASIC('#ffffff', { map: wt, transparent: true, depthWrite: false, opacity: 0.7 }));
  wave.position.set(-W / 2 + 2.6, 0.52, 0); wave.renderOrder = 3; inner.add(wave);
  /* trees, houses, walls */
  const r = rng(40 + seed), tl = [];
  for (let k = 0; k < 600 && tl.length < 34; k++) { const x = -9 + r() * 24, z = (r() - 0.5) * 21; const y = hfn(x, z); if (y < 1.1 || hash2(Math.floor(x / 4.8) * 3 + seed, Math.floor(z / 4.8) * 5 + 2) > 0.7) continue; tl.push([x, y, z, 0.3 + r() * 0.2, r()]); }
  const trees = K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34']); inner.add(trees);
  [[1.2, -3.6], [3.0, -2.2], [-1.2, -2.4], [8.5, 5.2]].forEach(([x, z], i) => {
    const h = new THREE.Group(), y = hfn(x, z);
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, 1.1), lam('#efe3c4')); b.position.y = 0.45; b.castShadow = true;
    const ro = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.7, 4).rotateY(Math.PI / 4), lam('#c0502e')); ro.position.y = 1.25; ro.scale.z = 0.8; ro.castShadow = true;
    h.add(b, ro); h.position.set(x, y - 0.05, z); h.rotation.y = 0.3 * i; inner.add(h);
  });
  [[-3, 6.5, 0.1, 6], [6, -6, -0.3, 5]].forEach(([x, z, ry, l]) => { const w = K.stoneWall(l, 0.45, ry); w.position.set(x, hfn(x, z) - 0.05, z); inner.add(w); });
  const rg = rng(60 + seed);
  inner.add(K.rocks(26, 6 + seed, () => { const x = -10 + rg() * 24, z = (rg() - 0.5) * 21; return [x, hfn(x, z), z]; }, '#b9ae98', 0.12, 0.4));
  inner.add(K.tufts(220, 8 + seed, () => { const x = -10 + rg() * 24, z = (rg() - 0.5) * 21; return [x, hfn(x, z), z]; }, ['#6f9d4a', '#86b257', '#9cc56a', '#b9c46f'], 0.25, 0.6));
  /* stream from the hills west to the sea */
  const sp = []; for (let i = 0; i <= 18; i++) { const x = 1.5 - i * 0.92, z = 1.2 + 0.9 * Math.sin(x * 0.5); sp.push([x, hfn(x, z) + 0.22, z]); }
  const stream = K.makeThickLine(sp, 0.2, BASIC('#58b8ff')); inner.add(stream);
  grp.position.y = 0.7; let key = '';
  const api = {
    grp, inner, hfn, W, D, stream, sea: [-W / 2 + 2.6, 0.6, 0], streamPts: sp, S, wt,
    upd(o) {
      grp.visible = o.pop > 0; grp.scale.setScalar(S * Math.max(0.001, pop(o.pop)));
      const u = cl(o.paint || 0), x0 = o.x0 == null ? 15 : o.x0, k = u.toFixed(3) + '_' + x0.toFixed(1);
      if (k !== key) {
        key = k; const R = 44, a = colA.array;
        for (let i = 0; i < PX.length; i++) {
          const w = sm((u * (R + 10) - Math.abs(PX[i] - x0)) / 10);
          a[i * 3] = Ac[i * 3] + (Bc[i * 3] - Ac[i * 3]) * w; a[i * 3 + 1] = Ac[i * 3 + 1] + (Bc[i * 3 + 1] - Ac[i * 3 + 1]) * w; a[i * 3 + 2] = Ac[i * 3 + 2] + (Bc[i * 3 + 2] - Ac[i * 3 + 2]) * w;
        }
        colA.needsUpdate = true; trees.userData.apply(0.72 + 0.28 * u);
      }
      stream.userData.setU(o.stream || 0); wt.offset.set((o.t || 0) * 0.03, 0);
    }
  };
  return api;
}

/* ---------------------------------------------------------------- Egypt: flat yellow land, wide river, canals, 30 x 24 */
export function makeEgyptModel() {
  const W = 30, D = 24, grp = new THREE.Group(), inner = new THREE.Group(); grp.add(inner);
  addPlinth(inner, W, D);
  const Y = 0.7, xr = z => 1.8 * Math.sin(z * 0.26) - 0.8;
  const SAND = ['#ecd088', '#e2c274', '#f0d898'].map(C);
  const mesh = heightMesh(-W / 2, W / 2, -D / 2, D / 2, 60, 48, () => Y, (x, y, z, c) => {
    c.copy(SAND[Math.floor(hash2(Math.floor(x / 1.8), Math.floor(z / 1.8)) * 3)]).multiplyScalar(0.94 + 0.1 * hash2(x * 3, z * 5));
  }, lam('#ffffff', { vertexColors: true, map: noiseTex(31, 16, 12) }));
  inner.add(mesh);
  const rr = rng(77);
  for (let i = 0; i < 9; i++) { const x = (rr() - 0.5) * 26, z = (rr() - 0.5) * 20; if (Math.abs(x - xr(z)) < 6) continue; const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1).scale(1.8 + rr(), 0.35, 1.3 + rr()), lam('#e6c883')); m.position.set(x, Y, z); m.receiveShadow = true; inner.add(m); }
  /* pyramids */
  [[11, -9.6, 2.6], [8.2, -10.2, 1.9], [13, -7.4, 1.5]].forEach(([x, z, s]) => { const p = new THREE.Mesh(new THREE.ConeGeometry(s, s * 0.95, 4).rotateY(Math.PI / 4), lam('#d2a95a', { map: noiseTex(9, 2, 2) })); p.position.set(x, Y + s * 0.47, z); p.castShadow = true; inner.add(p); });
  /* river and canals */
  const rp = []; for (let i = 0; i <= 24; i++) { const z = -12 + i; rp.push([xr(z), Y + 0.06, z]); }
  const rGreen = ribbon(rp, 9.6, lam('#86be5e')), rBlue = ribbon(rp.map(p => [p[0], p[1] + 0.06, p[2]]), 5.0, lam('#2f8fe8', { emissive: '#0a3a6a' })), rShine = ribbon(rp.map(p => [p[0] + 0.5, p[1] + 0.1, p[2]]), 1.2, BASIC('#9ad8ff', { transparent: true, opacity: 0.7 }));
  [rGreen, rBlue, rShine].forEach(m => inner.add(m));
  const CAN = [[[xr(-8) - 2.4, -8], [-8, -8.2], [-12.5, -8.4]], [[-8, -8.2], [-8.4, -3], [-8.6, 0.5]], [[xr(3) - 2.4, 3], [-7, 3.4], [-12.5, 4.2]],
    [[xr(-6) + 2.4, -6], [6, -6.2], [12.5, -6.6]], [[8, -6.2], [8.4, -1.5], [11.5, 0.6]], [[xr(6.5) + 2.4, 6.5], [7.5, 7.2], [12.5, 8.6]]];
  const cans = CAN.map(pl => {
    const g = new THREE.Group(), pts = pl.map(p => [p[0], Y + 0.12, p[1]]);
    const gp = ribbon(pts.map(p => [p[0], Y + 0.07, p[2]]), 3.0, lam('#86be5e')), bl = K.makeThickLine(pts, 0.3, BASIC('#3a9aee'));
    g.add(gp, bl); g.userData.setU = u => { gp.userData.setU(u); bl.userData.setU(u); }; g.userData.setU(0); inner.add(g); return g;
  });
  /* palms */
  const pr = rng(88);
  for (let i = 0; i < 14; i++) { const z = -11 + i * 1.6 + pr() * 0.6, side = i % 2 ? 1 : -1, x = xr(z) + side * (3.3 + pr() * 1.4); const pm = makePalm(2.4 + pr() * 1.2, 100 + i); pm.scale.setScalar(0.5); pm.position.set(x, Y, z); inner.add(pm); }
  /* boats */
  const boats = [0, 1, 2].map(k => {
    const b = new THREE.Group();
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.32, 1.7), lam('#6b4a2a')); h.position.y = 0.16;
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.8, 3).scale(0.12, 1, 1), lam('#fff7e6', { side: THREE.DoubleSide })); s.position.set(0, 1.1, 0); s.rotation.set(0, 0, 0);
    b.add(h, s); b.traverse(o => { if (o.isMesh) o.castShadow = true; }); inner.add(b); return b;
  });
  grp.position.y = 0.7;
  return {
    grp, W, D, xr,
    upd(o) {
      grp.visible = o.pop > 0; grp.scale.setScalar(Math.max(0.001, pop(o.pop)));
      const u = cl(o.river || 0); rGreen.userData.setU(u); rBlue.userData.setU(u); rShine.userData.setU(u);
      cans.forEach((c, i) => c.userData.setU((o.can || [])[i] || 0));
      boats.forEach((b, k) => { const z = -11 + 22 * (((o.t || 0) * 0.05 + k / 3) % 1); b.position.set(xr(z) + (k - 1) * 0.9, Y + 0.12, z); b.visible = (o.boats || 0) > 0; b.scale.setScalar(Math.max(0.001, pop(o.boats || 0))); });
    }
  };
}
