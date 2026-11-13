/* film_s5 props (toldot10g look). ASCII only. NO PEOPLE, digits only on signs. Every function is pure in the time you pass. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
const { C, cl, sm, pop, hash2, rng, lam, phong, woodTex, noiseTex, shadowable } = K;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const M = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; };
const Y = new THREE.Vector3(0, 1, 0);
export const dropGeo = () => new THREE.LatheGeometry([[0.0, 0.55], [0.1, 0.3], [0.22, 0.0], [0.26, -0.2], [0.2, -0.38], [0.0, -0.46]].map(([x, y]) => new THREE.Vector2(x, y)), 12);

/* ------------------------------------------------------------------ sign with digits (canvas) */
export function makeSign(text, w, h, bg, fg) {
  const g = new THREE.Group(), c = document.createElement('canvas'); c.width = 256; c.height = Math.max(64, Math.round(256 * h / w)); const x = c.getContext('2d');
  x.fillStyle = bg || '#efe3c4'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = fg || '#2a5fb0'; x.font = 'bold ' + Math.round(c.height * 0.82) + 'px Arial, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, c.width / 2, c.height * 0.54);
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const dark = lam('#4a2c18', { map: woodTex(6, 3, 1) });
  g.add(M(new THREE.BoxGeometry(w + 0.9, h + 0.9, 0.5), dark));
  g.add(M(new THREE.PlaneGeometry(w, h), BASIC('#ffffff', { map: tex })));
  g.children[1].position.z = 0.27;
  g.userData.pop = u => { g.visible = u > 0; g.scale.setScalar(pop(u)); };
  return shadowable(g);
}

/* digit sample points (for dots that gather into digits): n points, board-local, centred, width ~ w */
export function digitPoints(text, n, w) {
  const c = document.createElement('canvas'); c.width = 220; c.height = 120; const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 220, 120); x.fillStyle = '#fff'; x.font = 'bold 128px Arial, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 110, 64);
  const d = x.getImageData(0, 0, 220, 120).data, pts = [];
  for (let py = 0; py < 120; py += 4) for (let px = 0; px < 220; px += 4) if (d[(py * 220 + px) * 4] > 128) pts.push([px, py]);
  const sc = w / 220, out = [];
  for (let i = 0; i < n; i++) { const p = pts[Math.min(pts.length - 1, Math.floor((i + 0.5) * pts.length / n))]; out.push([(p[0] - 110) * sc, -(p[1] - 60) * sc]); }
  return out;
}
export function makeGlowDigits(text, w, h) {
  const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * h / w); const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height); x.font = 'bold ' + Math.round(c.height * 0.95) + 'px Arial, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.shadowColor = '#ffe27a'; x.shadowBlur = 26; x.fillStyle = '#fff6c0'; x.fillText(text, c.width / 2, c.height * 0.54); x.shadowBlur = 0; x.lineWidth = 6; x.strokeStyle = '#e09a10'; x.strokeText(text, c.width / 2, c.height * 0.54);
  const m = M(new THREE.PlaneGeometry(w, h), BASIC('#ffffff', { map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: 0 }));
  m.userData.set = u => { m.visible = u > 0; m.material.opacity = cl(u); m.scale.setScalar(0.8 + 0.2 * pop(u)); };
  return m;
}

/* ------------------------------------------------------------------ the year wheel (faces +z, origin = wheel centre) */
const SEG = [['spring', 0, 40, '#7cc860'], ['summer', 40, 180, '#f2b827'], ['autumn', 180, 220, '#e8772a'], ['winter', 220, 360, '#3a88dc']];
export function makeWheel(R, poleH) {
  const g = new THREE.Group(), wood = lam('#8a5a30', { map: woodTex(3, 2, 2) }), dark = lam('#4a2c18', { map: woodTex(6, 3, 1) });
  g.add(M(new THREE.CylinderGeometry(R, R, 1.0, 56).rotateX(Math.PI / 2), dark));
  g.add(M(new THREE.CylinderGeometry(R * 0.93, R * 0.93, 1.1, 56).rotateX(Math.PI / 2), lam('#efe3c4')));
  g.add(M(new THREE.BoxGeometry(R * 0.16, poleH, R * 0.16), dark, 0, -poleH / 2, -0.9));
  g.add(M(new THREE.BoxGeometry(R * 1.1, 0.6, R * 0.6), wood, 0, -poleH + 0.3, -0.9));
  for (const s of [-1, 1]) { const b = M(new THREE.BoxGeometry(R * 0.08, poleH * 0.5, R * 0.08), dark, s * R * 0.26, -poleH * 0.78, -0.9); b.rotation.z = s * 0.45; g.add(b); }
  const arcs = [], icons = [], gap = 1.6, ro = [];
  SEG.forEach(([n, a0, a1, col], i) => {
    const ts = (90 - (a1 - gap)) * Math.PI / 180, tl = (a1 - a0 - 2 * gap) * Math.PI / 180;
    const m = M(new THREE.RingGeometry(R * 0.32, R * 0.86, 40, 1, ts, tl), new THREE.MeshLambertMaterial({ color: col, emissive: '#262626', side: THREE.DoubleSide }), 0, 0, 0.62); m.visible = false; arcs.push(m); g.add(m);
    const mid = (a0 + a1) / 2 * Math.PI / 180, rr = R * 0.59, s = R * 0.1, ic = new THREE.Group();
    if (n === 'summer') { ic.add(M(new THREE.SphereGeometry(s, 14, 10), BASIC('#fff2a0'))); for (let k = 0; k < 8; k++) { const ray = M(new THREE.BoxGeometry(s * 0.3, s * 0.8, s * 0.2), BASIC('#fff2a0')); const a = k * Math.PI / 4; ray.position.set(Math.sin(a) * s * 1.55, Math.cos(a) * s * 1.55, 0); ray.rotation.z = -a; ic.add(ray); } }
    if (n === 'winter') { const d = M(dropGeo().scale(s * 2.4, s * 2.4, s * 1.2), lam('#e8f6ff', { emissive: '#7fb8e8' })); ic.add(d); }
    if (n === 'autumn') { const lf = M(new THREE.SphereGeometry(s, 12, 8).scale(1.5, 0.8, 0.25), lam('#7a2f10', { emissive: '#3a1408' })); lf.rotation.z = 0.7; ic.add(lf); ic.add(M(new THREE.BoxGeometry(s * 0.12, s * 1.3, s * 0.1), lam('#5a2810'), s * 0.55, -s * 0.5, 0)); }
    if (n === 'spring') { for (let k = 0; k < 5; k++) { const a = k * 1.2566; ic.add(M(new THREE.SphereGeometry(s * 0.55, 10, 8).scale(1, 1, 0.45), lam('#ffe0ea', { emissive: '#aa6a80' }), Math.sin(a) * s * 0.75, Math.cos(a) * s * 0.75, 0)); } ic.add(M(new THREE.SphereGeometry(s * 0.35, 8, 6), BASIC('#e8a010'))); }
    ic.position.set(Math.sin(mid) * rr, Math.cos(mid) * rr, 0.78); ic.visible = false; icons.push(ic); g.add(ic);
  });
  const hand = new THREE.Group(); hand.position.z = 0.95;
  hand.add(M(new THREE.BoxGeometry(R * 0.09, R * 0.8, 0.3), lam('#b02a1c', { emissive: '#400808' }), 0, R * 0.4, 0), M(new THREE.ConeGeometry(R * 0.09, R * 0.2, 12), lam('#b02a1c', { emissive: '#400808' }), 0, R * 0.9, 0));
  hand.add(M(new THREE.SphereGeometry(R * 0.11, 14, 10), phong('#c9a24a', { shininess: 80 })));
  hand.visible = false; g.add(hand);
  g.userData = { arcs, icons, hand, R,
    setArc(i, u) { arcs[i].visible = icons[i].visible = u > 0; arcs[i].scale.setScalar(pop(u)); icons[i].scale.setScalar(pop(u - 0.25)); },
    setHand(deg, vis) { hand.visible = vis; hand.rotation.z = -deg * Math.PI / 180; },
    show(u) { g.visible = u > 0; g.scale.setScalar(pop(u)); } };
  return shadowable(g);
}

/* ------------------------------------------------------------------ 365-dot board (faces +z, origin = board centre) */
export function makeDotBoard() {
  const COLS = 37, ROWS = 10, SX = 0.8, SY = 0.8, N = 365, W = COLS * SX + 2.4, H = ROWS * SY + 2.4;
  const g = new THREE.Group(), dark = lam('#4a2c18', { map: woodTex(6, 3, 1) });
  g.add(M(new THREE.BoxGeometry(W, H, 0.8), dark));
  g.add(M(new THREE.BoxGeometry(W - 1.2, H - 1.2, 0.5), lam('#efe3c4', { map: noiseTex(9, 6, 2) }), 0, 0, 0.2));
  for (const s of [-1, 1]) g.add(M(new THREE.BoxGeometry(1.0, 8, 1.0), dark, s * W * 0.4, -H / 2 - 3, -0.6));
  const dots = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 14).rotateX(Math.PI / 2), lam('#ffffff'), N); dots.frustumCulled = false; dots.castShadow = true; g.add(dots);
  const drops = new THREE.InstancedMesh(dropGeo().scale(0.9, 0.9, 0.5), lam('#4fb0ee', { emissive: '#1a5a90' }), 42); drops.frustumCulled = false; g.add(drops);
  const pos = [], blueK = new Array(N).fill(-1), blue = [];
  for (let i = 0; i < N; i++) { const col = Math.floor(i / ROWS), row = i % ROWS; pos.push([((COLS - 1) / 2 - col) * SX, ((ROWS - 1) / 2 - row) * SY]); }
  for (let i = 20; i < N && blue.length < 42; i++) if (hash2(i, 7.7) < 0.5) { blueK[i] = blue.length; blue.push(i); }
  let mnx = 99, mxx = -99, mny = 99, mxy = -99; blue.forEach(i => { mnx = Math.min(mnx, pos[i][0]); mxx = Math.max(mxx, pos[i][0]); mny = Math.min(mny, pos[i][1]); mxy = Math.max(mxy, pos[i][1]); });
  const targets = digitPoints('42', 42, 15), d = new THREE.Object3D(), TAN = C('#b07a2a'), BLUE = C('#2f86e0'), PUL = C('#a8dcff'), col = new THREE.Color();
  const api = {
    pos, blue, blueK, targets, W, H, blueBox: { cx: (mnx + mxx) / 2, cy: (mny + mxy) / 2, rx: (mxx - mnx) / 2 + 1.2, ry: (mxy - mny) / 2 + 1.1 },
    /* o: reveal 0..1, blueU(k), dropU(k), gather(k), pulse 0..1 */
    apply(o) {
      const rv = o.reveal == null ? 1 : o.reveal;
      for (let i = 0; i < N; i++) {
        const k = blueK[i], du = cl((rv * 1.15 - i / N) / 0.15); let bu = 0, gu = 0, x = pos[i][0], y = pos[i][1], z = 0.62;
        if (k >= 0) { bu = o.blueU ? cl(o.blueU(k)) : 0; gu = o.gather ? cl(o.gather(k)) : 0; if (gu > 0) { const t = targets[k]; x += (t[0] - x) * sm(gu); y += (t[1] - y) * sm(gu); z += 1.4 * Math.sin(Math.PI * Math.min(1, gu)) + 0.6 * gu; } }
        const pl = k >= 0 && o.pulse ? 0.5 + 0.5 * Math.sin(o.pulse * 14 + k) : 0;
        d.position.set(x, y, z); d.rotation.set(0, 0, 0); d.scale.setScalar(Math.max(0.0001, du * (1 + 0.3 * bu + 0.5 * gu + 0.25 * pl))); d.updateMatrix(); dots.setMatrixAt(i, d.matrix);
        col.copy(TAN).lerp(BLUE, bu).lerp(PUL, pl * 0.5); dots.setColorAt(i, col);
      }
      dots.instanceMatrix.needsUpdate = true; dots.instanceColor.needsUpdate = true;
      for (let k = 0; k < 42; k++) { const i = blue[k], u = o.dropU && !(o.gather && o.gather(k) > 0) ? cl(o.dropU(k)) : 0; d.position.set(pos[i][0], pos[i][1] + 0.7, 0.9); d.rotation.set(0, 0, 0); d.scale.setScalar(Math.max(0.0001, pop(u))); d.updateMatrix(); drops.setMatrixAt(k, d.matrix); }
      drops.instanceMatrix.needsUpdate = true;
    }
  };
  g.userData = api; return shadowable(g);
}

/* ------------------------------------------------------------------ squill (chatzav) */
export function makeSquill(H) {
  const g = new THREE.Group(), s = H / 9, NF = 64;
  const bulb = M(new THREE.SphereGeometry(H * 0.1, 14, 10).scale(1, 0.8, 1), lam('#a98a6a', { map: noiseTex(5, 3, 3) }), 0, H * 0.03, 0); g.add(bulb);
  const stalk = M(new THREE.CylinderGeometry(H * 0.012, H * 0.02, 1, 8).translate(0, 0.5, 0), lam('#cfe0a0')); g.add(stalk);
  const pet = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6).scale(0.1 * s, 0.3 * s, 0.05 * s).translate(0, 0.0, 0), lam('#ffffff', { emissive: '#303030' }), NF * 6); pet.frustumCulled = false;
  const cen = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07 * s, 6, 5), BASIC('#e3b020'), NF); cen.frustumCulled = false; g.add(pet, cen);
  const FL = [], q = new THREE.Quaternion(), d = new THREE.Object3D();
  for (let i = 0; i < NF; i++) {
    const t = i / (NF - 1), a = i * 2.4, n = new THREE.Vector3(Math.cos(a), 0.45, Math.sin(a)).normalize(), u = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)), v = new THREE.Vector3().crossVectors(n, u).normalize();
    const dirs = []; for (let j = 0; j < 6; j++) { const th = j * Math.PI / 3; dirs.push(u.clone().multiplyScalar(Math.cos(th)).add(v.clone().multiplyScalar(Math.sin(th))).normalize()); }
    FL.push({ t, a, dirs, qs: dirs.map(dv => new THREE.Quaternion().setFromUnitVectors(Y, dv)) });
  }
  const halo = M(new THREE.SphereGeometry(1, 16, 12), BASIC('#fff6b0', { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); halo.visible = false; g.add(halo);
  g.userData.grow = u => {
    u = cl(u); stalk.scale.y = Math.max(0.001, H * u * 0.99); stalk.visible = u > 0.001;
    for (let i = 0; i < NF; i++) {
      const f = FL[i], fo = cl((u - (0.4 + 0.55 * f.t)) / 0.12), y = (0.4 + 0.58 * f.t) * H * u, rr = 0.33 * s * (1 - 0.6 * f.t), sz = fo * (1 - 0.35 * f.t) * (0.8 + 0.2 * pop(fo));
      const px = Math.cos(f.a) * rr, pz = Math.sin(f.a) * rr;
      for (let j = 0; j < 6; j++) { d.position.set(px + f.dirs[j].x * 0.17 * s * sz, y + f.dirs[j].y * 0.17 * s * sz, pz + f.dirs[j].z * 0.17 * s * sz); d.quaternion.copy(f.qs[j]); d.scale.setScalar(Math.max(0.0001, sz)); d.updateMatrix(); pet.setMatrixAt(i * 6 + j, d.matrix); }
      d.position.set(px, y, pz); d.quaternion.identity(); d.scale.setScalar(Math.max(0.0001, sz)); d.updateMatrix(); cen.setMatrixAt(i, d.matrix);
    }
    pet.instanceMatrix.needsUpdate = true; cen.instanceMatrix.needsUpdate = true;
  };
  g.userData.glow = (k, u) => { halo.visible = k > 0.01; halo.material.opacity = 0.25 * cl(k); halo.position.y = H * 0.72 * cl(u); halo.scale.set(H * 0.3, H * 0.5 * cl(u) + 0.01, H * 0.3); };
  g.userData.grow(0);
  return shadowable(g);
}

/* ------------------------------------------------------------------ wagtail (faces +x, feet at y=0) */
export function makeWagtail() {
  const g = new THREE.Group(), grey = lam('#7d8791'), white = lam('#f4f4f0', { emissive: '#303030' }), black = lam('#1d1d20');
  g.add(M(new THREE.SphereGeometry(0.5, 16, 12).scale(1.35, 0.78, 0.85), grey, 0, 0.95, 0), M(new THREE.SphereGeometry(0.46, 14, 10).scale(1.25, 0.6, 0.8), white, 0.05, 0.8, 0), M(new THREE.SphereGeometry(0.3, 12, 8).scale(0.8, 0.9, 0.9), black, 0.55, 0.98, 0));
  g.add(M(new THREE.SphereGeometry(0.3, 14, 10), white, 0.72, 1.3, 0), M(new THREE.SphereGeometry(0.31, 14, 8, 0, 6.3, 0, 1.15), black, 0.72, 1.3, 0));
  g.add(M(new THREE.ConeGeometry(0.06, 0.3, 8).rotateZ(-Math.PI / 2), black, 1.1, 1.27, 0));
  for (const s of [-1, 1]) g.add(M(new THREE.SphereGeometry(0.05, 6, 5), BASIC('#000000'), 0.88, 1.37, s * 0.2));
  const tail = new THREE.Group(); tail.position.set(-0.6, 1.0, 0); tail.add(M(new THREE.BoxGeometry(1.6, 0.05, 0.26), black, -0.8, 0, 0), M(new THREE.BoxGeometry(0.5, 0.055, 0.28), white, -1.4, 0, 0)); g.add(tail);
  for (const s of [-1, 1]) g.add(M(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 5), lam('#33261f'), 0.12, 0.32, s * 0.12));
  const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(0, 1.1, s * 0.4); w.add(M(new THREE.SphereGeometry(0.5, 12, 8).scale(1.1, 0.1, 0.55), grey, -0.45, 0, s * 0.25)); w.add(M(new THREE.SphereGeometry(0.4, 10, 6).scale(0.9, 0.11, 0.4), white, -0.5, 0.02, s * 0.3)); g.add(w); return w; });
  g.userData.pose = o => { g.position.set(o.x, o.y, o.z); g.rotation.set(0, o.yaw || 0, o.tilt || 0); tail.rotation.z = o.wag || 0; wings[0].rotation.x = (o.flap || 0); wings[1].rotation.x = -(o.flap || 0); };
  g.scale.setScalar(1.7);
  return shadowable(g);
}

/* ------------------------------------------------------------------ almond tree / bare tree */
export function makeAlmond(seed, sc) {
  const g = new THREE.Group(), bark = lam('#4e3d33'), r = rng(seed), V = (x, y, z) => new THREE.Vector3(x, y, z);
  const trunk = new THREE.CatmullRomCurve3([V(0, 0, 0), V(0.2, 2.2, 0), V(-0.3, 4.4, 0.1), V(0.1, 6.4, 0)]); g.add(M(new THREE.TubeGeometry(trunk, 16, 0.55, 7, false), bark));
  const sampl = [], addTube = (cv, rad) => g.add(M(new THREE.TubeGeometry(cv, 14, rad, 5, false), bark));
  for (let j = 0; j < 7; j++) {
    const h = 3.0 + j * 0.55, p0 = trunk.getPoint(h / 6.4), a = j * 1.1 + seed * 0.3, ox = Math.cos(a), oz = Math.sin(a), len = 5.5 + r() * 1.5;
    const cv = new THREE.CatmullRomCurve3([p0, V(p0.x + ox * len * 0.3, p0.y + 0.6, p0.z + oz * len * 0.3), V(p0.x + ox * len * 0.65, p0.y + 1.6, p0.z + oz * len * 0.65), V(p0.x + ox * len, p0.y + 2.7, p0.z + oz * len)]);
    addTube(cv, 0.2); for (let u = 0.35; u < 1; u += 0.12) sampl.push(cv.getPoint(u));
    for (let k = 0; k < 3; k++) {
      const pt = cv.getPoint(0.45 + k * 0.2), b = a + (k - 1) * 0.9, bx = Math.cos(b), bz = Math.sin(b), tl = 2.6 + r() * 1.2;
      const tw = new THREE.CatmullRomCurve3([pt, V(pt.x + bx * tl * 0.4, pt.y + 0.8, pt.z + bz * tl * 0.4), V(pt.x + bx * tl, pt.y + 1.8 + r(), pt.z + bz * tl)]);
      addTube(tw, 0.07); for (let u = 0.15; u <= 1.0; u += 0.085) sampl.push(tw.getPoint(u));
    }
  }
  const NB = sampl.length, bl = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6).scale(1, 0.6, 1), lam('#ffffff', { emissive: '#402030' }), NB); bl.frustumCulled = false; bl.castShadow = true; g.add(bl);
  const PAL = ['#ffffff', '#ffe6ee', '#ffd0df', '#fff2f6'].map(C), BUD = C('#b0405e'), d = new THREE.Object3D(), cc = new THREE.Color();
  const info = sampl.map((p, i) => ({ p: p.clone().add(V((r() - 0.5) * 0.4, (r() - 0.5) * 0.4, (r() - 0.5) * 0.4)), key: r(), sz: 0.2 + r() * 0.12, pal: PAL[i % 4] }));
  g.userData.bloom = u => {
    for (let i = 0; i < NB; i++) { const f = info[i], bu = cl(u * 1.5 - f.key * 0.5); d.position.copy(f.p); d.rotation.set(0.3 * i, 0.7 * i, 0); d.scale.setScalar(Math.max(0.0001, f.sz * (0.35 + 1.15 * sm(bu) + 0.25 * Math.sin(Math.PI * bu)) * (u > 0 ? 1 : 0))); d.updateMatrix(); bl.setMatrixAt(i, d.matrix); cc.copy(BUD).lerp(f.pal, sm(bu * 1.6)); bl.setColorAt(i, cc); }
    bl.instanceMatrix.needsUpdate = true; bl.instanceColor.needsUpdate = true;
  };
  g.userData.bloom(0); g.scale.setScalar(sc || 1);
  return shadowable(g);
}
export function makeBareTree(seed, sc) {
  const g = new THREE.Group(), bark = lam('#6a5a4a'), r = rng(seed);
  g.add(M(new THREE.CylinderGeometry(0.25, 0.45, 4.4, 6).translate(0, 2.2, 0), bark));
  for (let j = 0; j < 7; j++) { const a = j * 0.9 + r(), len = 2.4 + r() * 1.6, m = M(new THREE.CylinderGeometry(0.05, 0.16, len, 5).translate(0, len / 2, 0), bark, 0, 2.6 + (j % 4) * 0.7, 0); m.rotation.set(Math.sin(a) * 0.9, a, Math.cos(a) * 0.9); g.add(m);
    const t = M(new THREE.CylinderGeometry(0.02, 0.06, 1.6, 4).translate(0, 0.8, 0), bark, 0, len * 0.8, 0); t.rotation.z = 0.8 * (j % 2 ? 1 : -1); m.add(t); }
  g.scale.setScalar(sc || 1); return shadowable(g);
}

/* ------------------------------------------------------------------ sun model with rays */
export function makeSunModel(R) {
  const g = new THREE.Group(); g.add(M(new THREE.SphereGeometry(R, 24, 16), BASIC('#ffc928')));
  const halo = M(new THREE.SphereGeometry(R * 1.55, 20, 14), BASIC('#fff0a0', { transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(halo);
  const rays = new THREE.Group(); for (let k = 0; k < 14; k++) { const a = k * Math.PI * 2 / 14, ray = M(new THREE.BoxGeometry(R * 0.2, R * 0.75, R * 0.2), BASIC('#ffb000')); ray.position.set(Math.cos(a) * R * 1.55, Math.sin(a) * R * 1.55, 0); ray.rotation.z = a - Math.PI / 2; rays.add(ray); } g.add(rays);
  g.userData.spin = t => { rays.rotation.z = t * 0.4; halo.scale.setScalar(1 + 0.06 * Math.sin(t * 2)); };
  return g;
}

/* ------------------------------------------------------------------ field props */
export function makePlough() {
  const g = new THREE.Group(), wood = lam('#8a5a30', { map: woodTex(3, 2, 2) }), iron = phong('#4a4e55', { shininess: 40 });
  g.add(M(new THREE.BoxGeometry(5.2, 0.3, 0.3), wood, 0.5, 1.5, 0)); const sk = M(new THREE.BoxGeometry(2.8, 0.18, 0.5), wood, -0.4, 0.15, 0); g.add(sk);
  g.add(M(new THREE.BoxGeometry(1.5, 0.22, 0.9).translate(0.5, 0, 0), iron, 0.4, 0.05, 0));
  const sh = M(new THREE.ConeGeometry(0.45, 1.3, 4).rotateZ(-Math.PI / 2), iron, 1.8, 0.05, 0); g.add(sh);
  for (const s of [-1, 1]) { const h = M(new THREE.BoxGeometry(0.16, 2.8, 0.16), wood, -1.8, 1.4, s * 0.45); h.rotation.z = 0.5; g.add(h); }
  g.add(M(new THREE.BoxGeometry(0.16, 0.16, 1.3), wood, -2.45, 2.5, 0));
  const wh = M(new THREE.CylinderGeometry(0.55, 0.55, 0.16, 16).rotateX(Math.PI / 2), wood, 2.4, 0.6, 0); g.add(wh);
  g.add(M(new THREE.BoxGeometry(0.14, 1.1, 0.14), wood, 2.4, 1.1, 0));
  return shadowable(g);
}
export function makeSheaf() {
  const g = new THREE.Group(), gold = lam('#d9a520', { emissive: '#3a2a00' });
  g.add(M(new THREE.CylinderGeometry(0.28, 0.6, 1.2, 12).translate(0, 0.6, 0), gold), M(new THREE.CylinderGeometry(0.55, 0.28, 1.1, 12).translate(0, 1.75, 0), lam('#e6b83a', { emissive: '#3a2a00' })));
  g.add(M(new THREE.TorusGeometry(0.3, 0.07, 6, 14).rotateX(Math.PI / 2), lam('#7a4a20'), 0, 1.2, 0));
  return shadowable(g);
}
export function makeBasket(seed) {
  const g = new THREE.Group(), wick = lam('#a8773c', { map: woodTex(4, 3, 2), side: THREE.DoubleSide }), r = rng(seed);
  g.add(M(new THREE.CylinderGeometry(0.95, 0.72, 0.95, 16, 1, true).translate(0, 0.48, 0), wick), M(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 16), wick, 0, 0.03, 0), M(new THREE.TorusGeometry(0.95, 0.06, 6, 18).rotateX(Math.PI / 2), lam('#7a5224'), 0, 0.96, 0));
  const cols = ['#d63a2a', '#e8892a', '#7a2a6a', '#e0c22a', '#c0302a'];
  for (let i = 0; i < 12; i++) { const a = r() * 6.28, rr = Math.sqrt(r()) * 0.7; g.add(M(new THREE.SphereGeometry(0.3, 10, 8), phong(cols[i % 5], { shininess: 50 }), Math.cos(a) * rr, 1.0 + 0.3 * (1 - rr), Math.sin(a) * rr)); }
  return shadowable(g);
}
export function makeSack() {
  const g = new THREE.Group(), cream = lam('#e0cfa0', { map: noiseTex(7, 3, 3) });
  g.add(M(new THREE.SphereGeometry(0.85, 14, 10).scale(1, 1.1, 0.8), cream, 0, 0.85, 0), M(new THREE.CylinderGeometry(0.28, 0.4, 0.5, 10), cream, 0, 1.85, 0), M(new THREE.TorusGeometry(0.3, 0.06, 6, 12).rotateX(Math.PI / 2), lam('#7a4a20'), 0, 1.75, 0));
  return shadowable(g);
}
