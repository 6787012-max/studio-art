/* film_e worlds part 1: row boat, sparkles, cheap fish schools, surface sea, beach, cross-section builder (shelf / slope / trench), reef. ASCII only. */
import { THREE, sm, cl, frac, V, KT, KP, L, P, toon, part, ell, tube, lathe, tubeAlong, leafGeo, cone, OL, G, bx, ease, lerp, WORLD, addWorld, gy, ST, SKY, scene, AC } from './e_core.js';
const { M, rng } = KT;
const ink = () => M(OL, OL, 0);
const BMt = (hex, o) => new THREE.MeshBasicMaterial(Object.assign({ color: new THREE.Color(hex), side: THREE.DoubleSide }, o || {}));
export const PI = Math.PI;

/* ---------------------------------------------------------------- row boat: deck y = 56, bow +x, stern -x */
export function makeRowBoat() {
  const g = G(), s = new THREE.Shape();
  s.moveTo(-210, 84); s.lineTo(-196, 14); s.quadraticCurveTo(0, -30, 200, 2); s.lineTo(252, 100); s.quadraticCurveTo(190, 60, 120, 56); s.lineTo(-100, 56); s.quadraticCurveTo(-170, 60, -210, 84);
  const eg = new THREE.ExtrudeGeometry(s, { depth: 150, bevelEnabled: false, curveSegments: 10 }); eg.translate(0, 0, -75);
  part(g, eg, toon('#f4ead2', { tint: '#c9b8b0', regions: [{ below: 38, c: '#2f6a9a', w: 2 }, { below: 16, c: '#c0392b', w: 2 }] }), 3.6);
  const wood = M('#8a5a2e', '#b09080'), woodD = M('#6a4220', '#a08070');
  for (const sz of [-1, 1]) { for (const x of [-150, -50, 50, 150]) bx(g, 9, 54, 9, woodD, [x, 84, sz * 70], 1.4, null, 2);
    part(g, tubeAlong([V(-176, 112, sz * 70), V(0, 108, sz * 72), V(190, 114, sz * 70)], 4.4, { segs: 16, radial: 6 }), woodD, 1.4); }
  bx(g, 40, 12, 140, wood, [-150, 72, 0], 1.8, null, 2);
  bx(g, 34, 34, 36, M('#2f3a4a', '#8a93a0'), [-216, 70, 0], 2, null, 3);   // little outboard motor
  const lan = G(g, [236, 112, 0]); part(lan, tube(5, 5, 30, 8).translate(0, 30, 0), woodD, 1.4); part(lan, ell(11, 13, 11, 10, 8), M('#ffe27a', '#e0c070', 0), 1.4, [0, 38, 0]);
  const cr = G(g, [-90, 56, -34]); bx(cr, 40, 30, 30, M('#c08a56', '#c49a84'), [0, 15, 0], 1.6, null, 3);
  const coil = part(g, new THREE.TorusGeometry(15, 5, 6, 14).rotateX(PI / 2), M('#d9c08a', '#c4aa80', 0), 1.2, [60, 58, 40]);
  g.userData.deck = 58; return g;
}

/* ---------------------------------------------------------------- sparkle field on the water surface */
export function makeGlints(n, w, d, seed) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
  c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(32, 2); c.lineTo(37, 27); c.lineTo(62, 32); c.lineTo(37, 37); c.lineTo(32, 62); c.lineTo(27, 37); c.lineTo(2, 32); c.lineTo(27, 27); c.closePath(); c.fill();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const g = G(), r = rng(seed || 3), it = [];
  for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 })); s.renderOrder = 7; g.add(s); it.push({ s, x: (r() - 0.5) * w, z: -r() * d, ph: r() * 6.28, sp: 0.7 + r() * 1.3, sz: 16 + r() * 34 }); }
  g.userData.update = (t, k, sea) => it.forEach(o => { const a = Math.pow(Math.max(0, Math.sin(t * o.sp + o.ph)), 6) * (k == null ? 1 : k); o.s.material.opacity = a; o.s.scale.setScalar(o.sz * (0.4 + a)); const y = sea ? sea.height(o.x, o.z) + 8 : 6; o.s.position.set(o.x, y, o.z); });
  return g;
}

/* ---------------------------------------------------------------- cheap fish (no face) for shoals */
export function makeSchool(n, cols, seed) {
  const g = G(), r = rng(seed || 4), fl = [];
  const mats = cols.map(c => [M(c[0], '#d4a8a0'), M(c[1], '#d4a8a0', 0)]);
  for (let i = 0; i < n; i++) { const f = G(g), m = mats[i % mats.length]; part(f, ell(22, 12, 8, 14, 10), m[0], 1.6); const tl = G(f, [-20, 0, 0]); part(tl, leafGeo(15, 10, 0.3).rotateZ(PI / 2 + 0.0), m[1], 1.2, [-2, 0, 0]);
    part(f, ell(2.4, 2.4, 1.6, 6, 4), M('#1f1814', '#1f1814', 0), 0, [14, 3, 7]); part(f, ell(2.4, 2.4, 1.6, 6, 4), M('#1f1814', '#1f1814', 0), 0, [14, 3, -7]); f.userData = { tl, ph: r() * 6.28, a: r(), b: r(), c: r() }; fl.push(f); }
  /* shoal moves on a lissajous around centre (cx,cy,cz) with radius R; direction follows the motion */
  g.userData.update = (t, cx, cy, cz, R, sc, spd) => fl.forEach((f, i) => { const u = f.userData, s = (spd || 0.35), a = t * s + u.ph * 0.25 + i * 0.05, a2 = a + 0.02;
    const px = (a) => cx + R * (0.9 + 0.1 * u.a) * Math.cos(a) + 24 * u.b * Math.sin(a * 3), pz = (a) => cz + R * 0.45 * Math.sin(a * 1.0 + u.c) , py = (a) => cy + 0.22 * R * Math.sin(a * 1.7 + u.ph) + 30 * (u.c - 0.5);
    f.position.set(px(a), py(a), pz(a)); const dx = px(a2) - px(a), dz = pz(a2) - pz(a), dy = py(a2) - py(a);
    f.rotation.y = Math.atan2(-dz, dx); f.rotation.z = Math.atan2(dy, Math.hypot(dx, dz)); f.scale.setScalar(sc || 1); u.tl.rotation.y = 0.5 * Math.sin(t * 9 + u.ph); });
  return g;
}

/* ---------------------------------------------------------------- surface world: open sea, boat, glints, splash */
export function buildSurf() {
  const g = G(), OS = KT.makeOpenSea({ A0: 4 }); g.add(OS.root); OS.bottle.visible = false;
  [[-2600, 1500, -5200, 3], [1800, 1900, -6400, 3.4], [4200, 1300, -3800, 2.6], [-800, 1700, -7000, 3], [300, 2200, -8200, 3.4], [-4200, 1800, -5600, 3]].forEach(([x, y, z, s], i) => { const c = KT.makeCloud(11 + i, { s }); c.position.set(x, y, z); g.add(c); });
  const boat = makeRowBoat(); g.add(boat); const glints = makeGlints(70, 3200, 3600, 7); glints.position.z = 400; g.add(glints);
  const far = [[-2800, -3200, '#e8f0f4', 3], [2600, -4600, '#f4e3c0', 5]].map(([x, z, c, s]) => { const b = KT.makeFishingBoat(c, s); g.add(b); return { b, x, z, yaw: 0.6 + s }; });
  const birds = KT.makeBirds({ n: 4, r: 600, y: 700, seed: 6 }); birds.position.set(-300, 0, -900); g.add(birds);
  const splash = KT.makeSplash({ r: 150 }); splash.visible = false; g.add(splash);
  const w = addWorld('surf', g, 'day', { OS, sea: OS.sea, boat, glints, far, birds, splash });
  w.upd = (t, lt, p) => { p = p || {}; OS.update(t, p.A == null ? 4 : p.A); OS.bottle.visible = false; birds.userData.update(t); glints.userData.update(t, p.glint == null ? 1 : p.glint, OS.sea);
    far.forEach(o => { const f = OS.sea.float(o.x, o.z, 90); o.b.position.set(o.x, f.y - 10, o.z); o.b.rotation.set(f.rx, o.yaw, f.rz); });
    const b = p.boat; boat.visible = !!b; if (b) { boat.position.set(b[0], b[1], b[2]); boat.rotation.set(0, b[3], b[4] || 0); }
    splash.visible = !!p.splash && p.splash[2] > 0 && p.splash[2] < 1; if (splash.visible) { splash.position.set(p.splash[0], 2, p.splash[1]); splash.userData.update(p.splash[2]); } };
  return w;
}

/* ---------------------------------------------------------------- beach world (calm) */
export function buildBeach() {
  const g = G(), B = KT.makeBeach({ season: 'summer' }); g.add(B.root);
  g.add(KT.makeHills({ a0: 0.22, a1: PI - 0.22, dists: [5200, 7600, 10200], base: '#7fb85a', haze: '#cfe6f2', h: 900 }));
  const r = rng(77);
  [[-1300, 1060, 'palm', 1], [900, 1120, 'palm', 1.1], [2100, 1000, 'palm', 0.9], [-2400, 1100, 'palm', 1], [100, 1250, 'tamarisk', 1], [-700, 1180, 'pine', 1.1], [1500, 1220, 'pine', 0.9]].forEach(([x, z, k, s], i) => { const t = KT.makeTree(k, i + 5, s); t.position.set(x, gy(x, z), z); g.add(t); });
  for (let i = 0; i < 14; i++) { const b = KT.makeBush(i + 3, { flowers: i % 3 ? null : '#f6a8c0', s: 0.9 + r() * 0.6 }); const x = -2600 + r() * 5200, z = 700 + r() * 500; b.position.set(x, gy(x, z), z); g.add(b); }
  [[-2600, 1500, -6200, 3], [1800, 1900, -7000, 3.4], [4200, 1300, -4800, 2.6], [-700, 1700, -5200, 2.4], [300, 2100, -8000, 3.6]].forEach(([x, y, z, s], i) => { const c = KT.makeCloud(40 + i, { s }); c.position.set(x, y, z); g.add(c); });
  const birds = KT.makeBirds({ n: 5, r: 700, y: 760, seed: 4 }); birds.position.set(-500, 0, -700); g.add(birds);
  const glints = makeGlints(60, 3000, 2600, 9); g.add(glints);
  const boats = [[-1100, -900, '#e8f0f4', 3], [-300, -1500, '#f4e3c0', 4]].map(([x, z, c, sd]) => { const b = KT.makeFishingBoat(c, sd); g.add(b); return { b, x, z, yaw: 0.4 + sd * 0.5 }; });
  // a few crates and rocks on the sand for the front layer
  const rocks = []; for (let i = 0; i < 7; i++) { const s = KT.makeStone(120 + i, 0.8 + r() * 0.9); const x = -900 + i * 330 + r() * 120, z = 300 + r() * 160; s.position.set(x, gy(x, z), z); g.add(s); }
  const w = addWorld('beach', g, 'day', { B, sea: B.sea, birds, boats });
  w.upd = (t, lt, p) => { p = p || {}; B.update(t); B.sea.update(t, p.A == null ? 4 : p.A); B.foam.update(t, p.foam == null ? 0.6 : p.foam); birds.userData.update(t); glints.userData.update(t, 0.9, B.sea);
    boats.forEach(o => { const f = B.sea.float(o.x, o.z, 90); o.b.position.set(o.x, f.y - 10, o.z); o.b.rotation.set(f.rx, o.yaw, f.rz); }); };
  return w;
}

/* ---------------------------------------------------------------- cross-section builder (aquarium cut: back water wall, solid seabed, translucent surface) */
export function buildSection(name, o) {
  const Z = o.Z, root = G(), r = rng(o.seed || 5);
  const pts = o.prof.map(([x, m]) => V(x, o.Y(m), 0)), curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), samp = curve.getPoints(o.ns || 260);
  const x0 = o.x0, x1 = o.x1, bottom = o.bottom;
  const yAt = x => { if (x <= samp[0].x) return samp[0].y; for (let i = 1; i < samp.length; i++) if (x <= samp[i].x) { const a = samp[i - 1], b = samp[i], u = (x - a.x) / Math.max(1e-6, b.x - a.x); return a.y + (b.y - a.y) * u; } return samp[samp.length - 1].y; };
  // seabed solid
  const s = new THREE.Shape(); s.moveTo(x0, bottom); samp.forEach(p => s.lineTo(p.x, p.y)); s.lineTo(x1, bottom); s.lineTo(x0, bottom);
  const sg = new THREE.ExtrudeGeometry(s, { depth: Z, bevelEnabled: false, curveSegments: 4 }); sg.translate(0, 0, -Z / 2);
  part(root, sg, toon(o.sand || '#e6cf98', { tint: '#c9a8a0', hi: 0, regions: o.bands }), 5);
  // grass cap over the land part (y > 0)
  { const land = samp.filter(p => p.y > -4); if (land.length > 3) { const gs = new THREE.Shape(); gs.moveTo(land[0].x, land[0].y - 2); land.forEach(p => gs.lineTo(p.x, p.y + 1)); for (let i = land.length - 1; i >= 0; i--) gs.lineTo(land[i].x, land[i].y - 26); gs.lineTo(land[0].x, land[0].y - 2);
    const gg = new THREE.ExtrudeGeometry(gs, { depth: Z + 8, bevelEnabled: false, curveSegments: 3 }); gg.translate(0, 0, -Z / 2 - 4); const lg = part(root, gg, M('#7fb85a', '#c4cfc0', 0), 3); lg.position.z = 0; } }
  // water back wall with depth gradient (vertex colours)
  const rows = o.wallRows, N = rows.length, vx = [], vc = [], idx = [], xe = Math.min(o.coastX + 60, x1);
  rows.forEach((y, i) => { const c = o.colAt(y); vx.push(x0, y, -Z / 2 + 1, xe, y, -Z / 2 + 1); vc.push(c.r, c.g, c.b, c.r, c.g, c.b); if (i > 0) { const a = 2 * (i - 1); idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
  { const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(vx, 3)); wg.setAttribute('color', new THREE.Float32BufferAttribute(vc, 3)); wg.setIndex(idx); const wm = new THREE.Mesh(wg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })); wm.frustumCulled = false; root.add(wm); }
  // surface (waves seen from the side)
  const sea = KT.makeSea({ A: o.A || 4, L: 260, palette: 'summer', size: 4000, seg: 160, k: 1.5, F: 1e6 }); root.add(sea.mesh);
  sea.mesh.geometry = new THREE.PlaneGeometry(xe - x0 + 100, Z, 240, 24).rotateX(-PI / 2).translate((x0 + xe) / 2, 0, 0);
  // ink: seabed profile on the front cut + waterline
  part(root, tubeAlong(samp.filter((p, i) => i % 2 === 0 || i === samp.length - 1).map(p => V(p.x, p.y, Z / 2 + 1)), 4.5, { segs: 160, radial: 6 }), ink(), 0);
  part(root, tubeAlong([V(x0, 0, Z / 2 + 1), V(x0, bottom, Z / 2 + 1)], 3.4, { segs: 4, radial: 6 }), ink(), 0);
  // light rays on the wall (top part)
  const rays = []; const rayMat = BMt('#ffffff', { transparent: true, opacity: 0.1, depthWrite: false });
  for (let i = 0; i < 9; i++) { const sh = new THREE.Shape(), w = 50 + (i % 3) * 36, h = o.rayH || 900; sh.moveTo(0, 0); sh.lineTo(w, 0); sh.lineTo(w - 130 + w * 0.7, -h); sh.lineTo(-130, -h); sh.lineTo(0, 0);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), rayMat); m.position.set(lerp(x0 + 400, xe - 300, i / 8), 0, -Z / 2 + 3); m.renderOrder = 1; root.add(m); rays.push(m); }
  // seabed life: weeds, stones, shells on the part with depth < o.lifeDepth
  const weeds = [], stones = [];
  for (let i = 0; i < (o.nWeeds || 20); i++) { const x = (o.lifeX0 || 100) + r() * ((o.lifeX1 || 1400) - (o.lifeX0 || 100)), y = yAt(x); if (y < (o.lifeMinY || -300)) continue;
    const gw = G(root, [x, y, -Z * 0.3 + r() * Z * 0.5]), hh = (o.weedH || 90) + r() * 70, n = 2 + Math.floor(r() * 2);
    for (let k = 0; k < n; k++) { const a = (k - n / 2) * 20; part(gw, tubeAlong([V(a, 0, 0), V(a + 12, hh * 0.5, 0), V(a - 6, hh, 0)], t => 7 * (1 - t) + 2, { segs: 12, radial: 6, flat: 0.5 }), M(['#4f9a4a', '#6fae4a', '#3f8a5a'][k % 3], '#a8c0b0', 0), 1.6); }
    gw.userData.ph = r() * 6; weeds.push(gw); }
  for (let i = 0; i < (o.nStones || 10); i++) { const x = x0 + 400 + r() * (xe - x0 - 800), st = KT.makeStone(i + 200, (o.stoneK || 1) * (0.9 + r() * 0.7)); st.position.set(x, yAt(x) - 4, -Z * 0.3 + r() * Z * 0.6); root.add(st); stones.push(st); }
  for (let i = 0; i < 8; i++) { const x = (o.lifeX0 || 100) + r() * ((o.lifeX1 || 1400) - (o.lifeX0 || 100)); if (yAt(x) < (o.lifeMinY || -300)) continue; const sh = KT.makeShell(i % 2 ? 'fan' : 'spiral', i + 9); sh.position.set(x, yAt(x) + 1, Z * 0.3 - r() * 100); sh.scale.setScalar(1.6); root.add(sh); }
  const bub = [], bm = M('#e8f8ff', '#cfe0f0', 0);
  for (let i = 0; i < 14; i++) { const m = part(root, ell(7, 7, 7, 8, 6), bm, 1.2); bub.push({ m, x: x0 + 400 + r() * (xe - x0 - 800), ph: r(), sp: 0.1 + r() * 0.08, z: -Z * 0.3 + r() * Z * 0.4 }); }
  const api = { root, sea, yAt, Z, x0, x1, xe, samp, weeds, curve };
  api.update = (t, p) => { sea.update(t, o.A || 4); weeds.forEach(w => { w.rotation.z = 0.16 * Math.sin(t * 1.3 + w.userData.ph); });
    bub.forEach(b => { const u = frac(b.ph + t * b.sp), by = yAt(b.x); b.m.position.set(b.x + 14 * Math.sin(u * 14 + b.ph * 9), by + 20 + u * Math.max(0, -by - 40), b.z); b.m.scale.setScalar(0.6 + 0.8 * u); b.m.visible = by < -120; });
    rays.forEach((m, i) => { m.position.x = lerp(x0 + 400, xe - 300, i / 8) + 60 * Math.sin(t * 0.25 + i * 1.7); rayMat.opacity = 0.09 + 0.02 * Math.sin(t * 0.6); }); };
  return api;
}

/* the main section: 1.5 units per metre below 100 m, 2.6 above (so a 100 m shelf is readable) */
export const YM = m => m <= 100 ? -3.5 * m : -350 - 1.5 * (m - 100);
export const MY = y => y >= -350 ? -y / 3.5 : 100 + (-350 - y) / 1.5;
const dc = (m) => { // water colour by depth in metres
  const st = [[0, '#74d8f2'], [40, '#4fb8e6'], [100, '#3a98d6'], [200, '#2a74b8'], [400, '#1d4f8e'], [800, '#12306a'], [1300, '#0a1c46'], [1700, '#050c24']];
  let i = 1; while (i < st.length - 1 && m > st[i][0]) i++; const a = st[i - 1], b = st[i], u = cl((m - a[0]) / (b[0] - a[0]), 0, 1); return new THREE.Color(a[1]).lerp(new THREE.Color(b[1]), u); };
export function buildMainSection() {
  const g = G();
  const SEC = buildSection('sec', { Z: 1100, x0: -5400, x1: 2000, bottom: -3300, coastX: 1500, Y: YM, A: 3.5, rayH: 900,
    prof: [[-5400, 1713], [-3400, 1708], [-2600, 1700], [-2300, 1685], [-2050, 1500], [-1750, 1250], [-1400, 880], [-1050, 460], [-760, 210], [-560, 108], [-470, 100], [-160, 80], [250, 50], [700, 26], [1100, 10], [1450, 0], [1530, -12], [1640, -70], [1760, -130], [2000, -190]],
    bands: [{ below: -350, c: '#c4a876', w: 6 }, { below: -900, c: '#9a8468', w: 6 }, { below: -1700, c: '#76665a', w: 6 }, { below: -2600, c: '#5a4c46', w: 6 }],
    wallRows: [0, -30, -90, -180, -260, -350, -480, -700, -1000, -1400, -1900, -2400, -2900, -3300], colAt: y => dc(MY(y)),
    nWeeds: 22, lifeX0: 0, lifeX1: 1450, lifeMinY: -230, nStones: 12, stoneK: 1.1, weedH: 100 });
  g.add(SEC.root);
  // dressing on the coast: palm + grass tufts + stones on the land cap
  const palm = KT.makeTree('palm', 11, 0.9); palm.position.set(1900, SEC.yAt(1900) - 6, 0); g.add(palm);
  for (let i = 0; i < 8; i++) { const x = 1620 + i * 46, tf = KT.makeGrassTuft(i + 20, { h: 46, n: 8 }); tf.position.set(x, SEC.yAt(x) - 4, 160 + (i % 3) * 40); g.add(tf); }
  // far sea + sky behind the cut
  [[-2200, 1000, -3800, 2.6], [1700, 1250, -4400, 3], [200, 1500, -5400, 3.4], [-3600, 1300, -4800, 3]].forEach(([x, y, z, s], i) => { const c = KT.makeCloud(120 + i, { s }); c.position.set(x, y, z); g.add(c); });
  const boat = makeRowBoat(); g.add(boat);
  const splash = KT.makeSplash({ r: 600 }); splash.visible = false; splash.position.set(-3700, 0, 300); g.add(splash);
  const meron = P.makeMeron({ R: 600, H: 1200, top: 0, seed: 7 }); meron.scale.set(1.5, 1.5, 0.9); meron.position.set(-3700, -2754, 0); meron.visible = false; g.add(meron);
  // glowing deep-sea creatures (positions fixed, glow drawn in HUD)
  const ang = [[-2650, -2470, 120], [-3350, -2290, 60], [-2900, -2090, 300]].map(([x, y, z], i) => { const a = P.makeAngler(i + 1); a.position.set(x, y, z); a.rotation.y = i % 2 ? PI : 0; a.scale.setScalar(1.7); g.add(a); return a; });
  const jel = [[-3700, -2390, 200], [-2450, -1790, 20], [-3050, -2540, -120]].map(([x, y, z], i) => { const a = P.makeJelly(i + 3); a.position.set(x, y, z); a.scale.setScalar(1.9); g.add(a); return a; });
  const school = makeSchool(16, [['#f49a3c', '#ff6a3c'], ['#ffd45a', '#f0b030'], ['#9ad0ff', '#6aa8f0']], 8); g.add(school);
  const school2 = makeSchool(10, [['#7ad0a0', '#4aa070'], ['#e8f0ff', '#a0c0f0']], 9); g.add(school2);
  const w = addWorld('sec', g, 'day', { SEC, boat, ang, jel, school, school2, meron, splash });
  w.upd = (t, lt, p) => { p = p || {}; SEC.update(t);
    const b = p.boat; boat.visible = !!b; if (b) { boat.position.set(b[0], b[1], b[2]); boat.rotation.set(0, b[3], b[4] || 0); }
    school.userData.update(t, 650, -130, 60, 330, 1.2, 0.32); school2.userData.update(t, 1000, -50, -80, 200, 1.0, 0.4);
    school.visible = school2.visible = !p.noSchool; meron.visible = p.meronY != null; if (p.meronY != null) meron.position.y = p.meronY; splash.visible = p.splashU != null && p.splashU > 0 && p.splashU < 1; if (splash.visible) splash.userData.update(p.splashU);
    ang.forEach((a, i) => { a.userData.lure.scale.setScalar(1 + 0.18 * Math.sin(t * 3 + i)); a.position.x = [-2650, -3350, -2900][i] + 40 * Math.sin(t * 0.4 + i); });
    jel.forEach((a, i) => { a.position.y = [-2390, -1790, -2540][i] + 40 * Math.sin(t * 0.7 + i * 2); a.scale.set(1.9 * (1 + 0.08 * Math.sin(t * 2 + i)), 1.9 * (1 - 0.06 * Math.sin(t * 2 + i)), 1.9 * (1 + 0.08 * Math.sin(t * 2 + i))); });
    ang.concat(jel).forEach(a => a.visible = p.deep !== false); };
  return w;
}

/* trench section for the 5,109 m scene: 0.5 units per metre */
export const YT = m => -0.5 * m;
export const MT = y => -y / 0.5;
const dcT = (m) => { const st = [[0, '#74d8f2'], [60, '#4fb8e6'], [200, '#2a74b8'], [600, '#1d4f8e'], [1500, '#12306a'], [3000, '#0a1c46'], [5200, '#050c24']];
  let i = 1; while (i < st.length - 1 && m > st[i][0]) i++; const a = st[i - 1], b = st[i], u = cl((m - a[0]) / (b[0] - a[0]), 0, 1); return new THREE.Color(a[1]).lerp(new THREE.Color(b[1]), u); };
export function buildTrench() {
  const g = G();
  const SEC = buildSection('trench', { Z: 1000, x0: -2400, x1: 2400, bottom: -3000, coastX: 2400, Y: YT, A: 3, seed: 8, rayH: 700, ns: 300,
    prof: [[-2400, 3200], [-1700, 3300], [-1200, 3600], [-900, 4300], [-600, 5000], [-300, 5105], [0, 5109], [300, 5090], [600, 4800], [900, 4000], [1200, 3000], [1500, 2100], [1800, 1500], [2100, 1300], [2400, 1200]],
    bands: [{ below: -900, c: '#b49a70', w: 6 }, { below: -1700, c: '#8f7a66', w: 6 }, { below: -2300, c: '#6f6058', w: 6 }, { below: -2600, c: '#4a3f3c', w: 6 }],
    wallRows: [0, -30, -90, -200, -400, -700, -1100, -1600, -2100, -2700, -3000], colAt: y => dcT(MT(y)), nWeeds: 0, nStones: 8, stoneK: 1.8, sand: '#d2b98a' });
  g.add(SEC.root);
  const mer = [0, 1, 2, 3].map(i => { const m = P.makeMeron({ R: 1100, H: 1200, top: [0.8, 0.8, 0.8, 0.4][i], seed: 20 + i }); g.add(m); return m; });
  const boat = makeRowBoat(); g.add(boat);
  [[-1600, 1100, -3800, 2.6], [900, 1250, -4400, 3], [200, 1500, -5400, 3.4]].forEach(([x, y, z, s], i) => { const c = KT.makeCloud(150 + i, { s }); c.position.set(x, y, z); g.add(c); });
  const w = addWorld('trench', g, 'day', { SEC, mer, boat });
  // stack positions: base y of mountain i = -2554.5 + 1200*0.5*i ... each next mountain is scaled 0.5 in xz (sits on the plateau)
  w.upd = (t, lt, p) => { p = p || {}; SEC.update(t);
    const bottomY = YT(5109), H = 600, rad = [0.5, 0.3, 0.2, 0.14]; // scale in xz relative to R=600*0.5
    const sc = [1, 0.8, 0.64, 0.512];
    mer.forEach((m, i) => { const drop = p.drop ? p.drop[i] : 1; const baseY = bottomY + H * i; m.visible = drop > 0.001; const lift = (1 - drop) * 2600;
      m.position.set(-100, baseY + lift - 2, 0); m.scale.set(0.5 * sc[i], 0.5, 0.5 * sc[i] * 0.8); });
    const b = p.boat; boat.visible = !!b; if (b) { boat.position.set(b[0], b[1], b[2]); boat.rotation.set(0, b[3], b[4] || 0); } };
  return w;
}

/* ---------------------------------------------------------------- reef: free 3D underwater set */
function coralBranch(parent, col, seed, s) {
  const r = rng(seed), mat = M(col, '#d8b0b0'), g = G(parent);
  const rec = (pos, dir, len, rad, d) => { const end = V(pos.x + dir.x * len, pos.y + dir.y * len, pos.z + dir.z * len); part(g, tubeAlong([pos, V((pos.x + end.x) / 2 + (r() - 0.5) * 8, (pos.y + end.y) / 2, (pos.z + end.z) / 2 + (r() - 0.5) * 8), end], rad, { segs: 6, radial: 6 }), mat, 1.8);
    if (d > 0) for (let k = 0; k < 2; k++) { const a = (k ? 1 : -1) * (0.45 + r() * 0.3), nd = V(dir.x * Math.cos(a) - dir.y * Math.sin(a) * 0 + (k ? 0.5 : -0.5) * r(), dir.y * 0.9 + 0.35, dir.z + (r() - 0.5) * 0.5).normalize(); rec(end, nd, len * 0.72, rad * 0.72, d - 1); } };
  rec(V(0, 0, 0), V(0, 1, 0), 56 * s, 9 * s, 2); return g;
}
export function buildReef() {
  const g = G(), r = rng(31);
  const sandM = toon('#ecd6a0', { tint: '#c9a8a0', hi: 0, regions: [] });
  bx(g, 9000, 60, 5200, M('#ecd6a0', '#c9a8a0', 0), [0, -30, -400], 0, null, 4);
  // sand ripples + dunes
  for (let i = 0; i < 14; i++) { const x = -3400 + i * 520 + r() * 200, z = -300 - r() * 2600; part(g, ell(420 + r() * 200, 40 + r() * 30, 160 + r() * 90, 24, 10), M(i % 2 ? '#e6cd96' : '#f0dba8', '#c9a8a0', 0), 3, [x, -8, z]); }
  // distant reef mounds (aerial perspective: lighter blue with distance)
  [[-3400, -4600, 900, 300, '#4aa0b8'], [-1400, -5200, 1100, 360, '#4aa0b8'], [900, -4800, 1000, 340, '#58aec4'], [3000, -5400, 1200, 400, '#58aec4'], [-2400, -7200, 1500, 500, '#7cc4d8'], [600, -7600, 1600, 520, '#7cc4d8'], [3200, -7200, 1500, 480, '#7cc4d8']]
    .forEach(([x, z, rx, ry, c]) => part(g, ell(rx, ry, 300, 22, 12), M(c, '#a8d4e0', 0), 0, [x, ry * 0.2, z]));
  // mid reef: corals, rocks, weeds
  const cols = ['#e6607e', '#f08a3c', '#f0c040', '#b46ad8', '#e8505a'];
  for (let i = 0; i < 16; i++) { const x = -2200 + (i % 8) * 560 + r() * 200, z = -900 - Math.floor(i / 8) * 900 - r() * 500; const c = coralBranch(g, cols[i % 5], 100 + i, 1.4 + r() * 1.2); c.position.set(x, 0, z); c.rotation.y = r() * 6; }
  for (let i = 0; i < 7; i++) { const x = -2400 + i * 760 + r() * 200, z = -300 - r() * 1400, st = KT.makeStone(300 + i, 1.8 + r() * 1.6); st.position.set(x, -2, z); g.add(st); }
  const weeds = [];
  for (let i = 0; i < 34; i++) { const x = -2800 + r() * 5600, z = -200 - r() * 2600, hh = 160 + r() * 240, gw = G(g, [x, 0, z]);
    for (let k = 0; k < 3; k++) part(gw, tubeAlong([V((k - 1) * 22, 0, 0), V((k - 1) * 22 + 20, hh * 0.5, 0), V((k - 1) * 22 - 10, hh, 0)], t => 12 * (1 - t) + 3, { segs: 12, radial: 6, flat: 0.5 }), M(['#3f9a5a', '#5fb85a', '#2f8a6a'][k], '#a8c0b0', 0), 1.8);
    gw.userData.ph = r() * 6; weeds.push(gw); }
  // shells + sea urchins + starfish
  for (let i = 0; i < 10; i++) { const sh = KT.makeShell(i % 2 ? 'fan' : 'spiral', i + 40); sh.position.set(-1800 + r() * 3600, 1, -200 - r() * 1200); sh.scale.setScalar(2.2); g.add(sh); }
  for (let i = 0; i < 6; i++) { const sg = G(g, [-1400 + r() * 2800, 6, -250 - r() * 900]); for (let k = 0; k < 5; k++) { const a = k * 6.283 / 5; part(sg, leafGeo(46, 13, 0.3).rotateZ(-PI / 2).rotateY(-a), M('#f08a3c', '#e0b090'), 1.6); } part(sg, ell(13, 7, 13, 10, 6), M('#f6a45a', '#e0b090'), 1.6, [0, 3, 0]); }
  // light shafts + surface
  const rayMat = BMt('#ffffff', { transparent: true, opacity: 0.12, depthWrite: false }), rays = [];
  for (let i = 0; i < 11; i++) { const sh = new THREE.Shape(), w = 90 + (i % 4) * 50; sh.moveTo(0, 0); sh.lineTo(w, 0); sh.lineTo(w - 380 + w * 0.6, -1400); sh.lineTo(-380, -1400); sh.lineTo(0, 0); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), rayMat); m.position.set(-3200 + i * 620, 1400, -2400 - (i % 3) * 700); m.renderOrder = 1; g.add(m); rays.push(m); }
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(14000, 9000).rotateX(PI / 2), BMt('#c9f4ff', { transparent: true, opacity: 0.5, depthWrite: false })); surf.position.set(0, 1500, -2500); g.add(surf);
  const bub = [], bm = M('#e8f8ff', '#cfe0f0', 0);
  for (let i = 0; i < 24; i++) { const m = part(g, ell(9, 9, 9, 8, 6), bm, 1.2); bub.push({ m, x: -1800 + r() * 3600, z: -200 - r() * 1800, ph: r(), sp: 0.07 + r() * 0.07 }); }
  const gb = []; for (let i = 0; i < 9; i++) { const m = part(g, ell(7, 7, 7, 8, 6), M('#e8f8ff', '#cfe0f0', 0), 1.2); m.visible = false; gb.push(m); }
  const shoals = [makeSchool(18, [['#ffd45a', '#f0b030'], ['#ffe9a0', '#f0c860']], 11), makeSchool(18, [['#7ad8e8', '#38a8c8'], ['#a0e8f0', '#58b8d0']], 12), makeSchool(16, [['#f48aa0', '#d85a78'], ['#f8b0c0', '#e07890']], 13), makeSchool(14, [['#9a8ae8', '#6a5ac8']], 14)];
  shoals.forEach(s => g.add(s));
  const w = addWorld('reef', g, 'under', { weeds, shoals });
  w.upd = (t, lt, p) => { p = p || {}; weeds.forEach(o => { o.rotation.z = 0.14 * Math.sin(t * 1.2 + o.userData.ph); });
    bub.forEach(b => { const u = frac(b.ph + t * b.sp); b.m.position.set(b.x + 18 * Math.sin(u * 14 + b.ph * 9), 10 + u * 900, b.z); b.m.scale.setScalar(0.6 + 0.9 * u); });
    rays.forEach((m, i) => { m.position.x = -3200 + i * 620 + 80 * Math.sin(t * 0.2 + i * 1.3); }); rayMat.opacity = 0.1 + 0.03 * Math.sin(t * 0.5);
    gb.forEach((m, i) => { const u = frac(t * 0.8 + i / 9); m.visible = !!p.gb; if (p.gb) { m.position.set(p.gb[0] - 20 * u + 8 * Math.sin(u * 12 + i), p.gb[1] + 20 + 150 * u, p.gb[2] + 40 + 6 * Math.sin(i)); m.scale.setScalar(0.7 + 0.9 * u * (1 - 0.3 * (i % 3))); } });
    const sp = p.shoal || [[-900, 330, -1100, 380], [800, 200, -1500, 420], [-300, 480, -2100, 360], [1700, 280, -900, 300]];
    shoals.forEach((s, i) => s.userData.update(t, sp[i][0], sp[i][1], sp[i][2], sp[i][3], 1.5, 0.28 + 0.04 * i)); };
  return w;
}
