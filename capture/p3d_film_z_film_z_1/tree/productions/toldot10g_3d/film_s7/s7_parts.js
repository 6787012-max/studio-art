/* toldot10g film_s7 parts: sea, beach, kurkar rock, ship, crane, raft, sign, fish, kelp. ASCII only. No people, no text (digits only).
   Every function is a pure function of the time passed in. Only imports the kit; never edits it. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, phong, noiseTex, woodTex, waveTex, heightMesh, shadowable, tufts, rocks, bushes, inst } = K;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
export { BASIC };

/* ------------------------------------------------------------------ sea surface (animated grid) */
export const swellH = (x, z, t, A) =>
  A * (0.55 * Math.sin(0.34 * x + 0.05 * z - 1.5 * t) + 0.3 * Math.sin(0.21 * x - 0.31 * z - 1.05 * t + 1.3) + 0.15 * Math.sin(0.7 * x + 0.5 * z - 2.1 * t));

export function makeSwell(x0, x1, z0, z1, nx, nz, A, o) {
  o = Object.assign({ deep: '#1f78bd', light: '#63c4ee', fade: () => 1, y0: 0 }, o || {});
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const p = geo.attributes.position, col = new Float32Array(p.count * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const cd = C(o.deep), cL = C(o.light), cc = new THREE.Color();
  const mat = new THREE.MeshPhongMaterial({ color: '#ffffff', vertexColors: true, shininess: 70, specular: '#9fd8ff', transparent: o.opacity != null, opacity: o.opacity == null ? 1 : o.opacity });
  const mesh = new THREE.Mesh(geo, mat); mesh.receiveShadow = true;
  mesh.userData.update = t => {
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), f = o.fade(x, z), h = swellH(x, z, t, A) * f;
      p.setY(i, o.y0 + h);
      const k = cl(0.5 + h / (A * 2.2) + 0.12 * Math.sin(x * 0.05 + z * 0.04));
      cc.copy(cd).lerp(cL, k); col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
    }
    p.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.computeVertexNormals();
  };
  mesh.userData.update(0);
  return mesh;
}

/* flat sea (far plane + scrolling white wave lines) */
export function makeFlatSea(x0, x1, z0, z1, color, rx, ry, y) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, y || 0, (z0 + z1) / 2), lam(color));
  const wt = waveTex(7, rx, ry);
  const w = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, (y || 0) + 0.04, (z0 + z1) / 2),
    BASIC('#ffffff', { map: wt, transparent: true, depthWrite: false, opacity: 0.55 }));
  g.add(b, w); g.userData.wt = wt; return g;
}

/* ------------------------------------------------------------------ beach */
export const beachY = (x, z) => (x < 0 ? 0.075 * x : 0.8 * (1 - Math.exp(-x / 5)) + 0.03 * x + 0.3 * Math.sin(x * 0.19 + z * 0.12) * sm(x / 12) + 0.15 * Math.sin(z * 0.08) * sm(x / 6));

export function kurkarBlock(w, h, d, seed, col) {
  const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 1 + 0.22 * (hash2(Math.round(x * 9) + seed, Math.round(z * 9 + y * 7)) - 0.5);
    p.setXYZ(i, x * n * w, Math.max(-0.25, y) * n * h, z * n * d);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, lam(col || '#d9b45f', { map: noiseTex(seed + 5, 2, 2), flatShading: true }));
  m.castShadow = true; m.receiveShadow = true; return m;
}

/* layered kurkar cliff wall (strata + weathered blocks) along z, front face towards -x */
export function makeCliff(len, h, depth, seed) {
  const g = new THREE.Group(), r = rng(seed);
  const bands = ['#e2c27a', '#d3a95a', '#ecd596', '#c99a4c', '#dfbd72'];
  let y = 0, k = 0;
  while (y < h - 0.2) { const bh = 0.7 + r() * 0.9; const b = new THREE.Mesh(new THREE.BoxGeometry(depth * (0.85 + r() * 0.2), bh, len), lam(bands[k % 5], { map: noiseTex(seed + k, 3, 1) })); b.position.set((r() - 0.5) * 0.8, y + bh / 2, 0); b.castShadow = b.receiveShadow = true; g.add(b); y += bh; k++; }
  for (let i = 0; i < 26; i++) {
    const bl = kurkarBlock(1.4 + r() * 2.4, 1.0 + r() * 1.6, 1.6 + r() * 2.2, seed + i * 3, bands[i % 5]);
    bl.position.set(-depth * 0.5 - 0.3 + r() * 0.9, 0.5 + r() * (h - 1), (r() - 0.5) * len); g.add(bl);
  }
  return g;
}

export function makeBeach(o) {
  o = Object.assign({ seed: 3, trees: true }, o || {});
  const grp = new THREE.Group();
  const SAND = C('#ecd7a2'), WET = C('#b9a778'), DRY = C('#c9b672'), GRS = C('#9db15a');
  const col = (x, y, z, c) => {
    const n = hash2(Math.floor(x / 2.5), Math.floor(z / 2.5));
    c.copy(SAND).multiplyScalar(0.93 + 0.12 * n);
    c.lerp(WET, 1 - sm((x + 1.5) / 3.5));
    c.lerp(DRY, sm((x - 22) / 14) * 0.7);
    c.lerp(GRS, sm((x - 36) / 22) * 0.5 * (0.5 + n));
  };
  const land = heightMesh(-70, 120, -170, 170, 95, 120, beachY, col, lam('#ffffff', { vertexColors: true, map: noiseTex(o.seed + 20, 24, 30) }));
  land.castShadow = false; grp.add(land);
  const swell = makeSwell(-130, 6, -170, 170, 58, 72, 0.85, { fade: (x, z) => sm((x + 130) / 45) * (0.35 + 0.65 * sm((-x - 0.5) / 8)) });
  grp.add(swell);
  const far = makeFlatSea(-1700, -128, -1200, 1200, '#2f8fd0', 60, 140, -0.12); grp.add(far);
  /* shore foam and wave lines */
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 340).rotateX(-Math.PI / 2), BASIC('#ffffff', { transparent: true, opacity: 0.72, depthWrite: false })); foam.position.y = 0.1; grp.add(foam);
  const foam2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 340).rotateX(-Math.PI / 2), BASIC('#ffffff', { transparent: true, opacity: 0.5, depthWrite: false })); foam2.position.y = 0.1; grp.add(foam2);
  const lines = [];
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0 + (i % 3), 340).rotateX(-Math.PI / 2), BASIC('#ffffff', { transparent: true, opacity: 0.4, depthWrite: false })); m.position.y = 0.2; lines.push(m); grp.add(m); }
  /* dressing */
  const r1 = rng(o.seed + 1), r2 = rng(o.seed + 2), r3 = rng(o.seed + 3), r4 = rng(o.seed + 4);
  grp.add(tufts(900, o.seed + 5, () => { const x = 8 + r1() * 100, z = (r1() - 0.5) * 300; return [x, beachY(x, z), z]; }, ['#a9b865', '#c4b46a', '#8fa656', '#d1c27d'], 0.45, 1.3));
  grp.add(rocks(90, o.seed + 6, () => { const x = 1 + r2() * 70, z = (r2() - 0.5) * 300; return [x, beachY(x, z) - 0.05, z]; }, '#d6c394', 0.25, 0.9));
  if (!o.noBush) grp.add(bushes(70, o.seed + 7, () => { const x = 16 + r3() * 60, z = (r3() - 0.5) * 300; return [x, beachY(x, z), z]; }, '#8a9a4e', 0.5, 1.3));
  if (o.near) { const [nx0, nx1, nz0, nz1] = o.near, rn = rng(o.seed + 30); grp.add(tufts(700, o.seed + 31, () => { const x = nx0 + rn() * (nx1 - nx0), z = nz0 + rn() * (nz1 - nz0); return [x, beachY(x, z), z]; }, ['#a9b865', '#c4b46a', '#8fa656', '#d1c27d'], 0.5, 1.5)); grp.add(rocks(45, o.seed + 32, () => { const x = nx0 + rn() * (nx1 - nx0), z = nz0 + rn() * (nz1 - nz0); return [x, beachY(x, z) - 0.05, z]; }, '#d6c394', 0.2, 0.7)); grp.add(rocks(40, o.seed + 33, () => { const x = nx0 + rn() * (nx1 - nx0), z = nz0 + rn() * (nz1 - nz0); return [x, beachY(x, z) - 0.1, z]; }, '#f4ead0', 0.1, 0.25)); }
  /* driftwood and shells (small light blobs) */
  grp.add(rocks(60, o.seed + 8, () => { const x = 0.5 + r4() * 6, z = (r4() - 0.5) * 300; return [x, beachY(x, z) - 0.1, z]; }, '#f4ead0', 0.12, 0.32));
  if (o.trees) {
    const tl = []; const r5 = rng(o.seed + 9);
    for (let k = 0; k < 400 && tl.length < 46; k++) { const x = 34 + r5() * 60, z = (r5() - 0.5) * 280; tl.push([x, beachY(x, z), z, 0.9 + r5() * 0.9, r5()]); }
    grp.add(K.plantTrees(tl, ['#6f9a4a', '#5f8a3e', '#7fa850']));
  }
  /* sailboats */
  const boats = [[-46, 30, 0.6], [-70, -40, 2.4], [-38, -95, 4.0], [-90, 60, 1.1]].map(([x, z, ry], i) => {
    const b = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.0, 1.7), lam('#f2efe6')); hull.position.y = 0.2; b.add(hull);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.6, 4).rotateZ(-Math.PI / 2).translate(3.2, 0.2, 0), lam('#f2efe6')); b.add(bow);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.5, 6), lam('#8a6a45')); mast.position.y = 3.6; b.add(mast);
    const sail = new THREE.Mesh(new THREE.ConeGeometry(2.1, 5.8, 3).scale(1, 1, 0.08), lam(i % 2 ? '#ffffff' : '#fff0d0', { emissive: '#44413a', side: THREE.DoubleSide })); sail.position.set(0.2, 3.5, 0); b.add(sail);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.25, 1.75), lam(['#e0401e', '#1f5fb0', '#1fa05a', '#e0a41e'][i])); stripe.position.y = 0.45; b.add(stripe);
    b.rotation.y = ry; b.userData.base = [x, z, ry]; grp.add(shadowable(b)); return b;
  });
  const upd = t => {
    swell.userData.update(t);
    foam.position.x = 0.9 + 0.9 * Math.sin(t * 0.95); foam2.position.x = -0.3 + 1.1 * Math.sin(t * 0.95 + 0.7);
    lines.forEach((m, i) => { const u = ((t * 0.16 + i / 6) % 1); m.position.x = -34 + 34 * u; m.material.opacity = 0.5 * Math.sin(Math.PI * u) * (u < 0.9 ? 1 : 0.5); });
    far.userData.wt.offset.set(t * 0.004, 0);
    boats.forEach((b, i) => { const [x, z, ry] = b.userData.base; b.position.set(x, swellH(x, z, t, 0.85) * sm((x + 130) / 45) * 0.9 + 0.05, z); b.rotation.set(0.04 * Math.sin(t * 1.1 + i), ry + 0.06 * Math.sin(t * 0.5 + i), 0.05 * Math.sin(t * 1.3 + i * 2)); });
  };
  upd(0);
  return { grp, upd, swell };
}

/* ------------------------------------------------------------------ signs (digits only) */
export function digitTex(txt, bg, fg) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = bg || '#eadba8'; g.fillRect(0, 0, 256, 128);
  g.strokeStyle = '#5a3a1a'; g.lineWidth = 10; g.strokeRect(5, 5, 246, 118);
  g.fillStyle = fg || '#3a2410'; g.font = 'bold 92px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(txt), 128, 70);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
export function makeSignPost(txt, h, big) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, h, 8), lam('#7a5530', { map: woodTex(4, 1, 3) })); post.position.y = h / 2; g.add(post);
  const sw = big ? 4.4 : 3.0, sh = sw / 2;
  const board = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, 0.18), lam('#ffffff', { map: digitTex(txt, big ? '#f6d86a' : '#eadba8') })); board.position.y = h + sh * 0.1; g.add(board);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), BASIC('#ffd24a')); lamp.position.y = h + sh * 0.1 + sh / 2 + 0.4; g.add(lamp);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), BASIC('#fff2a0', { transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })); halo.position.copy(lamp.position); g.add(halo);
  g.userData.pop = u => { g.scale.setScalar(pop(u)); g.visible = u > 0; };
  return shadowable(g);
}

/* ------------------------------------------------------------------ ship, crane, raft */
export function makeShip(len, hullCol, cargo, seed) {
  const g = new THREE.Group(), w = len * 0.2, h = len * 0.1;
  const sh = new THREE.Shape(); sh.moveTo(-len / 2, -w / 2); sh.lineTo(len * 0.28, -w / 2); sh.quadraticCurveTo(len * 0.5, -w * 0.25, len * 0.5, 0); sh.quadraticCurveTo(len * 0.5, w * 0.25, len * 0.28, w / 2); sh.lineTo(-len / 2, w / 2); sh.closePath();
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -h * 0.45, 0), lam(hullCol, { map: noiseTex(seed, 3, 1) })); g.add(hull);
  const red = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: h * 0.22, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -h * 0.45, 0), lam('#9a2a22')); red.scale.set(1.002, 1, 1.02); g.add(red);
  const deck = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, h * 0.55, 0), lam('#7a6a52')); deck.scale.set(0.97, 1, 0.9); g.add(deck);
  const r = rng(seed);
  const cg = new THREE.BoxGeometry(len * 0.056, h * 0.42, w * 0.21);
  const list = [];
  for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) { const hh = 1 + Math.floor(r() * 3); for (let k = 0; k < hh; k++) list.push([-len * 0.2 + i * len * 0.062, h * 0.55 + 0.12 + h * 0.21 + k * h * 0.42, (j - 1) * w * 0.25, cargo[Math.floor(r() * cargo.length)]]); }
  g.add(inst(cg, lam('#ffffff'), list.length, (i, d, col) => { d.position.set(list[i][0], list[i][1], list[i][2]); return col.set(list[i][3]).multiplyScalar(0.85 + r() * 0.3); }));
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(len * 0.1, h * 1.1, w * 0.8), lam('#f2f0e6')); bridge.position.set(-len * 0.36, h * 0.55 + h * 0.55, 0); g.add(bridge);
  const win = new THREE.Mesh(new THREE.BoxGeometry(len * 0.101, h * 0.18, w * 0.82), lam('#203a55')); win.position.set(-len * 0.36, h * 1.35, 0); g.add(win);
  const fun = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.12, w * 0.14, h * 0.9, 12), lam('#e0401e')); fun.position.set(-len * 0.4, h * 1.7, 0); g.add(fun);
  return shadowable(g);
}
export function makeCrane(hh) {
  const g = new THREE.Group(), m = lam('#e8a41c'), d = lam('#555a60');
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.5, hh, 0.5), m); l.position.set(sx * 3, hh / 2, sz * 2.4); g.add(l); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.7, 6.3), m); top.position.y = hh; g.add(top);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(2, 0.7, 26), m); boom.position.set(0, hh + 0.2, -9); g.add(boom);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2, 2.4), d); cab.position.set(0, hh - 1.2, -14); g.add(cab);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, hh * 0.6, 5), d); cable.position.set(0, hh * 0.7, -14); g.add(cable);
  const spreader = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 5), lam('#c0392b')); spreader.position.set(0, hh * 0.4, -14); g.add(spreader);
  return shadowable(g);
}
export function makeRaft(n) {
  const g = new THREE.Group(), cols = ['#9a5b34', '#7d4527', '#a86a3c'];
  for (let i = 0; i < (n || 7); i++) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 5.6 - (i % 2) * 0.4, 10).rotateZ(Math.PI / 2), lam(cols[i % 3], { map: woodTex(i + 2, 3, 1) }));
    l.position.set(0, 0.1 + (i % 2) * 0.08, (i - ((n || 7) - 1) / 2) * 0.58); g.add(l);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.28, 10).rotateY(Math.PI / 2), lam('#e6c48a')); cap.position.set(2.82 - (i % 2) * 0.2, l.position.y, l.position.z); g.add(cap);
  }
  for (const x of [-1.3, 1.3]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 4.4), lam('#5d4630')); c.position.set(x, 0.5, 0); g.add(c); }
  return shadowable(g);
}

/* ------------------------------------------------------------------ underwater: fish school, kelp */
export function makeSchool(n, seed, c1, c2) {
  const body = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 10, 8).scale(1.7, 0.75, 0.42), lam('#ffffff'), n);
  const tail = new THREE.InstancedMesh(new THREE.ConeGeometry(0.34, 0.7, 4).rotateZ(Math.PI / 2).translate(-1.05, 0, 0).scale(1, 1, 0.2), lam('#ffffff'), n);
  body.frustumCulled = tail.frustumCulled = false;
  const a1 = C(c1), a2 = C(c2), tmp = new THREE.Object3D(), off = [];
  for (let i = 0; i < n; i++) { off.push([(hash2(i, seed) - 0.5) * 9, (hash2(i, seed + 1) - 0.5) * 4, (hash2(i, seed + 2) - 0.5) * 7, hash2(i, seed + 3)]); const c = a1.clone().lerp(a2, hash2(i, seed + 4)); body.setColorAt(i, c); tail.setColorAt(i, c.clone().multiplyScalar(0.85)); }
  const grp = new THREE.Group(); grp.add(body, tail);
  grp.userData.update = (t, cx, cy, cz, R, w, sc, yo) => {
    const px = tt => cx + R * Math.cos(w * tt), pz = tt => cz + R * 0.7 * Math.sin(w * tt), py = tt => cy + 1.3 * Math.sin(0.7 * tt + seed);
    const vx = (px(t + 0.05) - px(t)), vz = (pz(t + 0.05) - pz(t)), yaw = yo != null ? yo : Math.atan2(-vz, vx);
    for (let i = 0; i < n; i++) {
      const o = off[i], wob = 0.5 * Math.sin(t * 1.6 + o[3] * 6.3);
      tmp.position.set(px(t) + o[0] * 0.8 + wob, py(t) + o[1] + 0.3 * Math.sin(t * 2.1 + o[3] * 9), pz(t) + o[2] * 0.8);
      tmp.rotation.set(0, yaw + 0.22 * Math.sin(t * 8 + o[3] * 6), 0); tmp.scale.setScalar((sc || 1) * (0.8 + 0.5 * o[3])); tmp.updateMatrix(); body.setMatrixAt(i, tmp.matrix);
      tmp.rotation.y += 0.35 * Math.sin(t * 11 + o[3] * 8); tmp.updateMatrix(); tail.setMatrixAt(i, tmp.matrix);
    }
    body.instanceMatrix.needsUpdate = tail.instanceMatrix.needsUpdate = true;
  };
  return grp;
}
export function makeKelp(list, colors) {
  const n = list.length, lo = new THREE.InstancedMesh(new THREE.ConeGeometry(0.28, 3.2, 5).translate(0, 1.6, 0), lam('#ffffff'), n), up = new THREE.InstancedMesh(new THREE.ConeGeometry(0.2, 3.0, 5).translate(0, 1.5, 0), lam('#ffffff'), n);
  lo.frustumCulled = up.frustumCulled = false;
  list.forEach((p, i) => { const c = C(colors[i % colors.length]).multiplyScalar(0.8 + hash2(i, 2) * 0.4); lo.setColorAt(i, c); up.setColorAt(i, c.clone().multiplyScalar(1.12)); });
  const d = new THREE.Object3D(), e = new THREE.Euler(), v = new THREE.Vector3();
  const grp = new THREE.Group(); grp.add(lo, up);
  grp.userData.update = t => {
    list.forEach((p, i) => {
      const s = p[3], a = 0.18 * Math.sin(t * 1.3 + i * 1.7), b = 0.26 * Math.sin(t * 1.3 + i * 1.7 + 0.9);
      d.position.set(p[0], p[1], p[2]); d.rotation.set(a * 0.6, 0, a); d.scale.setScalar(s); d.updateMatrix(); lo.setMatrixAt(i, d.matrix);
      v.set(0, 3.2 * s, 0).applyEuler(d.rotation); d.position.set(p[0] + v.x, p[1] + v.y, p[2] + v.z); d.rotation.set(b * 0.8, 0, b + a); d.updateMatrix(); up.setMatrixAt(i, d.matrix);
    });
    lo.instanceMatrix.needsUpdate = up.instanceMatrix.needsUpdate = true;
  };
  grp.userData.update(0);
  return grp;
}

/* smooth path along a polyline of [x,y,z]; u in 0..1 */
export function pathPts(pts, u) {
  let tot = 0; const L = []; for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1], pts[i + 1][2] - pts[i][2]); L.push(l); tot += l; }
  let s = cl(u) * tot, i = 0; while (i < L.length - 1 && s > L[i]) { s -= L[i]; i++; }
  const f = L[i] > 0 ? s / L[i] : 0, a = pts[i], b = pts[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
export function arrowHead(color) { const m = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.6, 14), BASIC(color)); return m; }
export function placeHead(head, pts, u, s) {
  const a = pathPts(pts, Math.max(0, u - 0.02)), b = pathPts(pts, u);
  head.position.set(...b); head.visible = u > 0.02; head.scale.setScalar(s || 1);
  head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize());
}
