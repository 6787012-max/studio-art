/* film_s3 landform dioramas: har / reches / emek / mishor / rama on a wooden plinth with an icon tile. ASCII only, no text. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
import { ctex, BASIC } from './common.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, phong, heightMesh, noiseTex, woodTex, tufts, rocks } = K;

const HALF = 6.8, TOP = -1.55;
function icon(kind) {
  return ctex(256, 256, (g, w, h) => {
    g.fillStyle = '#f3e7c6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#bfe3f4'; g.fillRect(14, 14, w - 28, 150);
    g.fillStyle = '#7a5a34'; g.fillRect(14, 164, w - 28, 78);
    g.fillStyle = '#ffc928'; g.beginPath(); g.arc(200, 52, 20, 0, 6.3); g.fill();
    const tri = (x, base, wd, ht, col, snow) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - wd / 2, base); g.lineTo(x, base - ht); g.lineTo(x + wd / 2, base); g.closePath(); g.fill();
      if (snow) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x - wd * 0.14, base - ht * 0.72); g.lineTo(x, base - ht); g.lineTo(x + wd * 0.14, base - ht * 0.72); g.closePath(); g.fill(); } };
    if (kind === 'har') tri(128, 164, 170, 130, '#8a7050', true);
    if (kind === 'reches') { tri(52, 164, 90, 80, '#8a7050'); tri(104, 164, 100, 120, '#7a6040', true); tri(160, 164, 100, 100, '#8a7050'); tri(210, 164, 80, 70, '#7a6040'); }
    if (kind === 'emek') { tri(60, 164, 130, 130, '#8a7050', true); tri(196, 164, 130, 130, '#8a7050', true); g.fillStyle = '#3a98e0'; g.fillRect(112, 164, 32, 78); g.fillStyle = '#8fc063'; g.fillRect(86, 150, 84, 14); }
    if (kind === 'mishor') { g.fillStyle = '#8fc063'; g.fillRect(14, 130, w - 28, 112); g.fillStyle = '#d6b060'; for (let i = 0; i < 4; i++) g.fillRect(24 + i * 58, 150, 40, 80); }
    if (kind === 'rama') { g.fillStyle = '#8fc063'; g.fillRect(34, 70, 188, 28); g.fillStyle = '#cdb384'; g.fillRect(34, 98, 188, 18); g.fillStyle = '#8a5a30'; for (const x of [44, 196]) g.fillRect(x, 116, 16, 100); g.fillStyle = '#4f8a3a'; g.beginPath(); g.arc(90, 56, 18, 0, 6.3); g.arc(150, 58, 14, 0, 6.3); g.fill(); }
    g.strokeStyle = '#5a3a18'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  });
}

const SPEC = {
  har: { hfn: (x, z, w) => (10.5 * Math.exp(-(x * x + z * z) / (2 * 3.0 * 3.0)) * (1 + 0.09 * Math.sin(x * 2.3) * Math.cos(z * 1.9)) + 0.5) * w, snow: 7.6 },
  reches: { hfn: (x, z, w) => { let s = 0; [[-4.6, 5.0], [-1.6, 7.6], [1.6, 6.4], [4.6, 4.6]].forEach(([xi, a], i) => { s += a * Math.exp(-Math.pow(x - xi, 2) / (2 * 1.35 * 1.35)); });
      return (3.2 * Math.exp(-z * z / (2 * 2.4 * 2.4)) + s * Math.exp(-Math.pow(z - 0.5 * Math.sin(x * 0.8), 2) / (2 * 2.0 * 2.0)) + 0.4) * w; }, snow: 7.6 },
  emek: { hfn: (x, z, w) => { const m = (cx) => 8.2 * Math.exp(-Math.pow(x - cx, 2) / (2 * 1.8 * 1.8)) * (0.75 + 0.25 * Math.cos(z * 0.55 + cx)); return (m(-4.8) + m(4.8) + 0.4 + 0.25 * sm((Math.abs(x) - 0.9) / 1.2)) * w; }, snow: 99 },
  mishor: { hfn: (x, z, w) => (0.45 + 0.14 * Math.sin(x * 0.9) * Math.sin(z * 0.8)) * w, snow: 99 },
};

function terrainCol(kind) {
  const spec = SPEC[kind], G = ['#8fc063', '#7fb157', '#a6c76c', '#6fa04a'].map(C), GO = ['#e2c070', '#d6b060', '#ecd08a', '#cfa656'].map(C);
  return (x, y, z, c) => {
    const gi = Math.floor(hash2(Math.floor(x / 1.5), Math.floor(z / 1.5)) * 4);
    c.copy(G[gi]);
    if (kind === 'mishor') { const k = (Math.floor((x + 8) / 2.2) + Math.floor((z + 8) / 2.2)) & 1; c.copy(k ? G[gi] : GO[gi]); c.multiplyScalar(0.92 + 0.14 * hash2(Math.floor(x * 2), Math.floor(z * 2))); return; }
    const e = 0.06, hx = spec.hfn(x + e, z, 1) - spec.hfn(x - e, z, 1), hz = spec.hfn(x, z + e, 1) - spec.hfn(x, z - e, 1), sl = Math.hypot(hx, hz) / (2 * e);
    c.lerp(C('#c9b57c'), sm((y - 2.2) / 3) * 0.7);
    c.lerp(C('#9a8f78'), sm((sl - 0.9) / 1.1) * 0.85);
    c.lerp(C('#f0ede2'), sm((y - spec.snow) / 0.8));
    if (kind === 'emek') c.lerp(C('#4aa5e8'), (1 - sm((Math.abs(x - 0.5 * Math.sin(z * 0.8)) - 0.35) / 0.35)) * (1 - sm((y - 0.7) / 0.3)));
    c.multiplyScalar(0.9 + 0.2 * hash2(Math.floor(x * 3), Math.floor(z * 3)));
  };
}

export function makeForm(kind, seed) {
  const grp = new THREE.Group(), model = new THREE.Group();
  const wood = lam('#8a5a30', { map: woodTex(3, 2, 2) });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(15, 1.2, 15), wood); plinth.position.y = TOP + 0.6; plinth.castShadow = plinth.receiveShadow = true; grp.add(plinth);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.5, 16.4), lam('#5a3a1c', { map: woodTex(3, 2, 2) })); foot.position.y = TOP + 0.25; foot.receiveShadow = true; grp.add(foot);
  const tile = new THREE.Group();
  const tb = new THREE.Mesh(new THREE.BoxGeometry(4.6, 4.6, 0.35), wood); tb.castShadow = true; tile.add(tb);
  const tf = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 4.0), new THREE.MeshBasicMaterial({ map: icon(kind) })); tf.position.z = 0.19; tile.add(tf);
  tile.position.set(0, TOP + 2.2, 9.6); tile.rotation.x = -0.28; grp.add(tile);
  model.position.y = TOP + 1.2; grp.add(model);
  const r = rng(seed || 3);
  if (kind === 'rama') {
    const side = lam('#cdb384', { map: noiseTex(41, 3, 1) }), topm = lam('#7fb157', { map: noiseTex(43, 6, 6) });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.9, 13.2), [side, side, topm, side, side, side]); slab.position.y = 9.1; slab.castShadow = slab.receiveShadow = true; model.add(slab);
    const leg = lam('#a98a5a', { map: noiseTex(45, 1, 4) });
    for (const sx of [-5.4, 5.4]) for (const sz of [-5.4, 5.4]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.5, 9.0, 1.5), leg); l.position.set(sx, 4.5, sz); l.castShadow = l.receiveShadow = true; model.add(l); }
    const hf = (x, z) => 9.55 + 0.05 * Math.sin(x * 2) * Math.cos(z * 2);
    const tl = []; for (let k = 0; k < 200 && tl.length < 16; k++) { const x = (r() - 0.5) * 11, z = (r() - 0.5) * 11; if (Math.hypot(x - 1, z) < 3.2) continue; tl.push([x, 9.55, z, 0.3 + r() * 0.15, r()]); }
    model.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34']));
    model.add(K.wheatField(-1.2, -2.5, 5.2, 5.0, hf, 900, seed || 3));
    const rr = rng(9); model.add(rocks(10, 4, () => [(rr() - 0.5) * 11, 9.55, (rr() - 0.5) * 11], '#b9ae98', 0.15, 0.4));
  } else {
    const spec = SPEC[kind], w = (x, z) => sm((HALF - Math.abs(x)) / 1.3) * sm((HALF - Math.abs(z)) / 1.3);
    const hfn = (x, z) => spec.hfn(x, z, w(x, z));
    const mesh = heightMesh(-HALF, HALF, -HALF, HALF, 72, 72, hfn, terrainCol(kind), lam('#ffffff', { vertexColors: true, map: noiseTex(51 + (seed || 0), 6, 6) }));
    mesh.castShadow = true; model.add(mesh);
    const tl = []; for (let k = 0; k < 600 && tl.length < (kind === 'mishor' ? 8 : 34); k++) {
      const x = (r() - 0.5) * 12, z = (r() - 0.5) * 12, y = hfn(x, z); if (y > 4.2 || (kind === 'emek' && Math.abs(x) < 1.1)) continue;
      const e = 0.1, sl = Math.hypot(hfn(x + e, z) - hfn(x - e, z), hfn(x, z + e) - hfn(x, z - e)) / (2 * e); if (sl > 1.1) continue; tl.push([x, y, z, 0.28 + r() * 0.14, r()]); }
    model.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34']));
    const rr = rng(11 + (seed || 0)); model.add(rocks(kind === 'mishor' ? 6 : 22, 5, () => { const x = (rr() - 0.5) * 12, z = (rr() - 0.5) * 12; return [x, hfn(x, z), z]; }, '#a49a7a', 0.14, 0.45));
    if (kind === 'mishor') { model.add(K.wheatField(-5, -5, 4, 4, hfn, 700, 5)); const ct = K.makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 5, midTowers: true, scale: 0.28 }); ct.position.set(2.6, hfn(2.6, 2.4), 2.4); model.add(ct); }
  }
  const mats = []; model.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.color && mats.indexOf(m) < 0) { m.userData.c0 = m.color.clone(); mats.push(m); } }); });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(8.7, 0.22, 8, 56).rotateX(Math.PI / 2), BASIC('#ffe27a', { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  ring.position.y = TOP + 1.25; grp.add(ring);
  const api = {
    grp, model, kind,
    rise(u) { model.visible = u > 0; model.scale.set(1, Math.max(0.001, pop(u)), 1); },
    look(dim, glow, t) {
      mats.forEach(m => { m.color.copy(m.userData.c0).multiplyScalar(1 - 0.42 * dim); if (m.emissive) m.emissive.set('#ffd878').multiplyScalar(0.22 * glow); });
      ring.material.opacity = 0.95 * glow * (0.65 + 0.35 * Math.sin((t || 0) * 6)); ring.visible = glow > 0.01; ring.scale.setScalar(1 + 0.03 * Math.sin((t || 0) * 5));
    }
  };
  api.rise(0);
  return api;
}
