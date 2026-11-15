/* film_s3 (toldot10g) - film-specific props: digit boards, altimeter dial, clock, crown, landform models, icon plaques.
   NO PEOPLE, NO TEXT (digits only). ASCII only. Pure functions of the values passed in. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, phong, heightMesh, noiseTex, woodTex, makeCity, rocks } = K;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));

const rrect = (g, x, y, w, h, r) => {
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
};

/* a wooden-framed board showing digits */
export function makeDigits(w, h, fg, bg) {
  const c = document.createElement('canvas'); c.width = 320; c.height = Math.round(320 * h / w);
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
  let last = null;
  m.userData.set = s => {
    if (s === last) return; last = s; g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = '#5a3a1c'; rrect(g, 2, 2, c.width - 4, c.height - 4, 30); g.fill();
    g.fillStyle = bg; rrect(g, 14, 14, c.width - 28, c.height - 28, 22); g.fill();
    g.fillStyle = fg; g.font = 'bold ' + Math.round(c.height * 0.7) + 'px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, c.width / 2, c.height / 2 + 6);
    tex.needsUpdate = true;
  };
  m.userData.set('0');
  return m;
}

/* round altimeter dial: needle angle theta in screen terms (0 = up, + = clockwise), high end at +130deg */
export function makeDial(R) {
  const g = new THREE.Group();
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
  x.fillStyle = '#f6efd8'; x.beginPath(); x.arc(128, 128, 126, 0, 6.3); x.fill();
  for (let k = 0; k <= 26; k++) {
    const th = (-130 + k * 10) * Math.PI / 180, long = k % 5 === 0;
    x.strokeStyle = k < 9 ? '#2f8a3a' : k > 17 ? '#8a5a2a' : '#b08a20'; x.lineWidth = long ? 9 : 5;
    x.beginPath(); x.moveTo(128 + Math.sin(th) * (long ? 88 : 98), 128 - Math.cos(th) * (long ? 88 : 98)); x.lineTo(128 + Math.sin(th) * 112, 128 - Math.cos(th) * 112); x.stroke();
  }
  x.fillStyle = '#7d7d82'; x.beginPath(); x.moveTo(190, 138); x.lineTo(214, 176); x.lineTo(166, 176); x.closePath(); x.fill();
  x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(190, 138); x.lineTo(198, 152); x.lineTo(182, 152); x.closePath(); x.fill();
  x.fillStyle = '#3f9a3a'; x.beginPath(); x.moveTo(40, 178); x.lineTo(66, 150); x.lineTo(92, 178); x.closePath(); x.fill();
  x.strokeStyle = '#3a98e0'; x.lineWidth = 7; x.beginPath(); x.moveTo(50, 176); x.quadraticCurveTo(66, 160, 84, 176); x.stroke();
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  const face = new THREE.Mesh(new THREE.CircleGeometry(R, 48), BASIC('#ffffff', { map: tex })); g.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, R * 0.09, 10, 48), phong('#c9a24a', { shininess: 90 })); rim.position.z = 0.05; g.add(rim);
  const piv = new THREE.Group(); piv.position.z = 0.12; g.add(piv);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(R * 0.1, R * 0.82, R * 0.04), BASIC('#d9302a')); nd.position.y = R * 0.34; piv.add(nd);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(R * 0.1, R * 0.2, R * 0.04), BASIC('#d9302a')); tail.position.y = -R * 0.1; piv.add(tail);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(R * 0.1, 14, 10), phong('#3a2a1a')); hub.position.z = 0.16; g.add(hub);
  g.userData.set = thetaDeg => { piv.rotation.z = -thetaDeg * Math.PI / 180; };
  g.userData.set(130);
  return g;
}

/* clock: set(turns) minute hand turns, a green wedge grows behind it */
export function makeClock(R) {
  const g = new THREE.Group();
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
  x.fillStyle = '#f9f4e4'; x.beginPath(); x.arc(128, 128, 126, 0, 6.3); x.fill();
  for (let k = 0; k < 12; k++) { const th = k * Math.PI / 6, long = k % 3 === 0; x.strokeStyle = '#3a2a1a'; x.lineWidth = long ? 11 : 6; x.beginPath(); x.moveTo(128 + Math.sin(th) * (long ? 84 : 98), 128 - Math.cos(th) * (long ? 84 : 98)); x.lineTo(128 + Math.sin(th) * 116, 128 - Math.cos(th) * 116); x.stroke(); }
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  g.add(new THREE.Mesh(new THREE.CircleGeometry(R, 48), BASIC('#ffffff', { map: tex })));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, R * 0.09, 10, 48), phong('#c9a24a', { shininess: 90 })); rim.position.z = 0.05; g.add(rim);
  const wedge = new THREE.Mesh(new THREE.CircleGeometry(R * 0.78, 40, 0, 0.01), BASIC('#7fd06a', { transparent: true, opacity: 0.7, side: THREE.DoubleSide })); wedge.position.z = 0.04; g.add(wedge);
  const mh = new THREE.Group(); mh.position.z = 0.1; g.add(mh);
  const m1 = new THREE.Mesh(new THREE.BoxGeometry(R * 0.09, R * 0.82, R * 0.04), BASIC('#222222')); m1.position.y = R * 0.38; mh.add(m1);
  const hh = new THREE.Group(); hh.position.z = 0.12; g.add(hh);
  const h1 = new THREE.Mesh(new THREE.BoxGeometry(R * 0.13, R * 0.5, R * 0.04), BASIC('#222222')); h1.position.y = R * 0.22; hh.add(h1);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(R * 0.1, 14, 10), phong('#3a2a1a')); hub.position.z = 0.16; g.add(hub);
  g.userData.set = turns => {
    const a = turns * 2 * Math.PI; mh.rotation.z = -a; hh.rotation.z = -a / 12;
    wedge.visible = turns > 0.002; wedge.geometry.dispose(); wedge.geometry = new THREE.CircleGeometry(R * 0.78, 40, Math.PI / 2 - Math.max(0.01, a), Math.max(0.01, a));
  };
  g.userData.set(0);
  return g;
}

export function makeCrown() {
  const g = new THREE.Group(), gold = phong('#ffcf3a', { shininess: 100, emissive: '#6a4a00' });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.4, 0.8, 20, 1, true), Object.assign(gold.clone(), { side: THREE.DoubleSide })));
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.12, 8, 24).rotateX(Math.PI / 2), gold); band.position.y = -0.4; g.add(band);
  for (let k = 0; k < 5; k++) {
    const a = k * 2 * Math.PI / 5, sp = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.3, 6), gold); sp.position.set(Math.cos(a) * 1.5, 0.95, Math.sin(a) * 1.5); g.add(sp);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), phong('#ff4a3a', { emissive: '#400', shininess: 90 })); b.position.set(Math.cos(a) * 1.5, 1.65, Math.sin(a) * 1.5); g.add(b);
  }
  return g;
}

/* ---------- icon plaques (pictures only) ---------- */
function iconTex(kind) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const g = c.getContext('2d');
  g.fillStyle = '#efe3c4'; g.fillRect(0, 0, 256, 160);
  g.fillStyle = '#9ad0f0'; g.fillRect(0, 0, 256, 78);
  g.fillStyle = '#ffd24a'; g.beginPath(); g.arc(214, 30, 15, 0, 6.3); g.fill();
  const tri = (x, y, w, h, col, snow) => { g.fillStyle = col; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w / 2, y - h); g.lineTo(x + w, y); g.closePath(); g.fill(); if (snow) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x + w / 2, y - h); g.lineTo(x + w / 2 + w * 0.17, y - h + h * 0.28); g.lineTo(x + w / 2 - w * 0.17, y - h + h * 0.28); g.closePath(); g.fill(); } };
  const grass = (y0) => { g.fillStyle = '#6fa84a'; g.fillRect(0, y0, 256, 160 - y0); };
  if (kind === 'peak') { grass(118); tri(60, 122, 136, 100, '#8a7a62', true); }
  if (kind === 'ridge') { grass(118); tri(10, 122, 100, 62, '#8a7a62', true); tri(80, 122, 110, 90, '#7d6f58', true); tri(160, 122, 96, 66, '#8a7a62', true); }
  if (kind === 'valley') { grass(118); g.fillStyle = '#8a7a62'; g.beginPath(); g.moveTo(0, 122); g.lineTo(0, 40); g.lineTo(95, 118); g.lineTo(100, 122); g.closePath(); g.fill(); g.beginPath(); g.moveTo(256, 122); g.lineTo(256, 40); g.lineTo(161, 118); g.lineTo(156, 122); g.closePath(); g.fill(); g.strokeStyle = '#3a98e0'; g.lineWidth = 8; g.beginPath(); g.moveTo(128, 120); g.quadraticCurveTo(112, 140, 128, 158); g.stroke(); }
  if (kind === 'plain') { grass(96); g.fillStyle = '#d9b840'; g.fillRect(20, 110, 100, 36); g.fillStyle = '#8fc063'; g.fillRect(130, 110, 100, 36); g.fillStyle = '#c8a24e'; g.fillRect(60, 130, 140, 24); }
  if (kind === 'plateau') { grass(130); g.fillStyle = '#b98f5e'; g.fillRect(52, 70, 152, 62); g.fillStyle = '#8fc063'; g.fillRect(48, 62, 160, 14); g.fillStyle = '#8a6a40'; for (const x of [70, 108, 146, 184]) g.fillRect(x, 80, 6, 50); }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}

/* ---------- landform models (14 x 14 units, local u,v in -7..7) ---------- */
const MODEL_FN = {
  peak: a => (u, v) => { const r = Math.hypot(u, v); return 0.45 + a * (11.0 * Math.exp(-Math.pow(r / 3.7, 2)) * (1 + 0.07 * Math.sin(u * 2.3 + v) * Math.cos(v * 2.1)) + 0.9 * Math.exp(-Math.pow(r / 8.5, 2))); },
  ridge: a => (u, v) => { const prof = 0.58 + 0.42 * Math.cos(u * 1.2 + 0.5) * Math.cos(u * 0.45) + 0.1 * Math.sin(u * 3.0); return 0.45 + a * (9.0 * Math.exp(-Math.pow((v + 0.4 * Math.sin(u * 0.8)) / 2.5, 2)) * Math.max(0.3, prof) + 0.5 * Math.exp(-Math.pow(v / 7, 2))); },
  valley: a => (u, v) => 0.45 + a * (8.6 * sm((Math.abs(u) - 1.0) / 4.2) * (0.78 + 0.22 * Math.cos(v * 0.8 + u * 0.3)) * (1 - 0.3 * sm((Math.abs(v) - 4) / 3)) + 0.18 * Math.sin(v * 1.1)),
  plain: a => (u, v) => 0.45 + 0.1 * Math.sin(u * 0.9 + v * 0.5) + 0.07 * Math.cos(v * 1.3 - u * 0.4),
  plateau: a => (u, v) => { const e = Math.max(Math.abs(u), Math.abs(v)) / 6.3; return 0.45 + 6.2 * sm((1 - e) / 0.13) + 0.1 * Math.sin(u * 1.3) * Math.cos(v * 1.1) * sm((1 - e) / 0.2); }
};
const GC4 = ['#8fc063', '#7fb157', '#a6c76c', '#6fa04a'].map(C), FIELD5 = ['#8fc063', '#d9b840', '#a6c76c', '#c8a24e', '#6fa04a'].map(C);
const ROCKC = C('#a89878'), ROCK2 = C('#8c7e66'), SNOWC = C('#f4f1e6'), CLIFFC = C('#b98f5e'), WATERC = C('#4fa8e8'), OLIVEC = C('#9fa85a'), GOLDC = C('#c9b45a');

export function makeModel(kind, o) {
  o = o || {}; const a = o.amp || 1, fn = MODEL_FN[kind](a), grp = new THREE.Group();
  const slab = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.7, 15.4), lam('#6b4020', { map: woodTex(2, 2, 2) })); slab.position.y = -0.2; slab.castShadow = true; slab.receiveShadow = true; grp.add(slab);
  const slope = (u, v) => Math.hypot(fn(u + 0.25, v) - fn(u - 0.25, v), fn(u, v + 0.25) - fn(u, v - 0.25)) / 0.5;
  const topH = kind === 'peak' ? 11.4 * a + 0.5 : kind === 'ridge' ? 9.5 * a + 0.5 : kind === 'valley' ? 8.8 * a : 6.7;
  const riv = v => 0.4 * Math.sin(v * 0.6);
  const col = (u, y, v, c) => {
    const sl = slope(u, v);
    if (kind === 'plain') {
      c.copy(FIELD5[Math.floor(hash2(Math.floor((u + 7) / 2.4), Math.floor((v + 7) / 3.0)) * 5)]); if (Math.floor((v + 7) * 2.4) % 2) c.multiplyScalar(0.92);
      c.lerp(WATERC, 1 - sm((Math.abs(u - riv(v) - 4.2) - 0.45) / 0.3)); return;
    }
    c.copy(GC4[Math.floor(hash2(Math.floor(u / 1.5), Math.floor(v / 1.5)) * 4)]);
    if (kind === 'plateau') {
      if (y > 3) c.lerp(GOLDC, 0.45 * hash2(Math.floor(u / 1.2), Math.floor(v / 1.2)));
      const cl2 = sm((sl - 1.2) / 1.5); c.lerp(CLIFFC, cl2); c.multiplyScalar(1 - cl2 * 0.12 + cl2 * 0.1 * Math.sin(y * 5)); return;
    }
    c.lerp(OLIVEC, sm((y - 2.0) / 2.5)); c.lerp(ROCKC, sm((y - 0.5 * topH) / (0.14 * topH))); c.lerp(ROCK2, sm((sl - 0.95) / 0.7) * 0.7);
    c.lerp(SNOWC, sm((y - (kind === 'valley' ? 0.9 : 0.76) * topH) / (0.07 * topH)));
    if (kind === 'valley' && y < 1.4) c.lerp(WATERC, 1 - sm((Math.abs(u - 0.5 * Math.sin(v * 0.5)) - 0.45) / 0.3));
  };
  const mat = lam('#ffffff', { vertexColors: true, map: noiseTex(5 + (o.seed || 0), 6, 6) });
  const mesh = heightMesh(-7, 7, -7, 7, 64, 64, fn, col, mat); mesh.castShadow = true; mesh.receiveShadow = true;
  const body = new THREE.Group(); body.add(mesh); grp.add(body);
  const rr = rng(11 + (o.seed || 0)), tl = [];
  for (let k = 0; k < 700 && tl.length < 30; k++) {
    const u = (rr() - 0.5) * 12.4, v = (rr() - 0.5) * 12.4, y = fn(u, v), sl = slope(u, v), q = rr();
    const ok = kind === 'plain' ? q < 0.8 && Math.abs(u - riv(v) - 4.2) > 0.9 && !(Math.abs(u - 2.5) < 2 && Math.abs(v + 2.5) < 2)
      : kind === 'plateau' ? ((y > 5 && q < 0.3 && Math.max(Math.abs(u), Math.abs(v)) < 5.3) || (y < 1.2 && q < 0.5 && Math.max(Math.abs(u), Math.abs(v)) > 6.9))
      : (y > 0.7 && y < 0.38 * topH && sl < 1.0);
    if (ok) tl.push([u, y, v, 0.2 + rr() * 0.12, rr()]);
  }
  body.add(K.plantTrees(tl, ['#3f7a34', '#58903c', '#4f8a3a']));
  if (kind === 'plain') { const town = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 3, midTowers: true, scale: 0.3 }); town.position.set(2.5, 0.45, -2.5); body.add(town); }
  if (kind === 'plateau') { const rk = rng(7); body.add(rocks(10, 8, () => { const u = (rk() - 0.5) * 9, v = (rk() - 0.5) * 9; return [u, fn(u, v), v]; }, '#6a6358', 0.25, 0.5)); }
  const pl = new THREE.Group(); pl.position.set(0, 0.5, 9.1); pl.rotation.x = -0.5;
  const board = new THREE.Mesh(new THREE.BoxGeometry(6.4, 4.2, 0.4), lam('#8a5a30', { map: woodTex(3, 2, 2) })); board.castShadow = true; pl.add(board);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.5), BASIC('#ffffff', { map: iconTex(kind) })); face.position.z = 0.22; pl.add(face);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), lam('#6b4020')); leg.position.set(0, -2.4, -0.2); pl.add(leg);
  grp.add(pl);
  const ringG = new THREE.Mesh(new THREE.RingGeometry(8.4, 9.8, 48).rotateX(-Math.PI / 2), BASIC('#ffe27a', { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); ringG.position.y = 0.2; grp.add(ringG);
  grp.userData = {
    fn, topH, body, mesh, mat,
    rise(u) {
      grp.visible = u > 0; const su = pop(u / 0.45); slab.scale.set(su, 1, su); pl.scale.setScalar(pop((u - 0.1) / 0.45));
      body.visible = u > 0.25; body.scale.y = Math.max(0.001, pop((u - 0.25) / 0.75)); ringG.visible = u > 0.3;
    },
    glow(k) { k = cl(k); mat.emissive.setRGB(0.42 * k, 0.36 * k, 0.1 * k); ringG.material.opacity = 0.75 * k; ringG.scale.setScalar(1 + 0.05 * k); },
    white(k) { k = cl(k); mat.emissive.setRGB(0.55 * k, 0.55 * k, 0.5 * k); }
  };
  return grp;
}
