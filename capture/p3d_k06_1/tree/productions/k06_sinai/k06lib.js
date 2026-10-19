// k06lib.js - shared building blocks for the k06 film (Maamad Har Sinai). Everything is a function of t only.
import { THREE, box, cyl, ball, toon, ink, canvasTex, label, cloud, person, world, rng, clamp, lerp, ease, prog, D, path } from '../../lib/stage3d.js';
import { fbm, cine } from '../azamra342/road.js';
export { fbm, cine };

// ---------------- characters ----------------
export const FATHER = { coat: '#17171d', beard: '#2a1c14', beardLen: .65, hat: 'kippa', hatColor: '#101014', skin: '#efcfb0' };
export const SON = { kind: 'boy', coat: '#2b3a5a', hat: 'kippa', hatColor: '#101014', beardLen: 0, skin: '#f0d2b4', pants: '#1b1d24' };
export const RAV = { coat: '#1d1d24', beard: '#a7a199', beardLen: .55, hat: 'kippa', hatColor: '#101014', skin: '#efcfb0', glasses: true };
const COATS = ['#17171d', '#1f2430', '#2a2230', '#202a24', '#26262c', '#2d2420'];
const BEARDS = ['#2a1c14', '#8d8780', '#3a2a20', '#1c1612', '#6a5a4c'];
const SKINS = ['#efcfb0', '#f0d2b4', '#e8c3a0', '#f2d6bc'];
export const fatherN = i => Object.assign({}, FATHER, { coat: COATS[i % COATS.length], beard: BEARDS[(i * 2 + 1) % BEARDS.length], beardLen: .5 + (i % 3) * .12, skin: SKINS[i % 4] });
export const sonN = i => Object.assign({}, SON, { coat: ['#2b3a5a', '#3a3a4a', '#2c4a46', '#4a3a3a', '#35405a'][i % 5], skin: SKINS[(i + 1) % 4] });
export const EFF = .95;                                  // person3d scales every figure by .95
export const ground = (x, z) => [x, 0, z];
export const holdAt = (pos, facing, sc, fwd, up) => [pos[0] + Math.sin(facing) * (fwd === undefined ? .42 : fwd) * sc * EFF, (pos[1] || 0) + (up === undefined ? .9 : up) * sc * EFF, pos[2] + Math.cos(facing) * (fwd === undefined ? .42 : fwd) * sc * EFF];
export const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const lbl = (Wd, text, pos, height, o) => label(Wd, text, Object.assign({ pos, height: height || .5, bg: 'rgba(58,36,14,.82)', color: '#ffe8b0' }, o || {}));

// camera: blend two camera functions between t0 and t1
export function mix(f1, f2, t0, t1) { return t => { if (t <= t0) return f1(t); if (t >= t1) return f2(t); const a = f1(t), b = f2(t), k = ease.sm((t - t0) / (t1 - t0));
  return { pos: a.pos.map((v, i) => lerp(v, b.pos[i], k)), look: a.look.map((v, i) => lerp(v, b.look[i], k)), fov: lerp(a.fov || 45, b.fov || 45, k) }; }; }

// ---------------- glow ----------------
let GT = null;
export function glowTex() { if (!GT) GT = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); return GT; }
export function glowSprite(color, size, opacity) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: opacity === undefined ? 1 : opacity, fog: false }));
  s.scale.set(size, size, 1); s.renderOrder = 6; return s;
}
let FT = null;
function flameTex() { if (!FT) FT = canvasTex(64, 128, (g, w, h) => { const r = g.createRadialGradient(32, 84, 2, 32, 84, 50); r.addColorStop(0, 'rgba(255,248,210,1)'); r.addColorStop(.35, 'rgba(255,190,70,.85)'); r.addColorStop(.75, 'rgba(255,100,20,.35)'); r.addColorStop(1, 'rgba(255,60,0,0)');
  g.save(); g.translate(32, 84); g.scale(.62, 1.4); g.translate(-32, -84); g.fillStyle = r; g.fillRect(0, 0, w, h); g.restore(); }); return FT; }
let FT2 = null;
function flameTexSoft() { if (!FT2) FT2 = canvasTex(64, 128, (g, w, h) => { g.save(); g.translate(32, 70); g.scale(.62, 1.4); const r = g.createRadialGradient(0, 0, 1, 0, 0, 40); r.addColorStop(0, 'rgba(255,248,210,1)'); r.addColorStop(.35, 'rgba(255,190,70,.85)'); r.addColorStop(.75, 'rgba(255,110,30,.3)'); r.addColorStop(1, 'rgba(255,60,0,0)'); g.fillStyle = r; g.fillRect(-60, -60, 120, 120); g.restore(); }); return FT2; }
export function flameSprite(w, h, soft) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft ? flameTexSoft() : flameTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); s.center.set(.5, .15); s.scale.set(w, h, 1); s.renderOrder = 6; return s; }

// ---------------- THE LANTERN ----------------
// fn(t) -> {pos:[x,y,z], lit:0..1.5, scale, glow, power, visible}
export function lantern(Wd, fn, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g); const parts = new THREE.Group(); g.add(parts);
  const brass = toon(0x9a6a22), mk = (geo, mat, pos) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); parts.add(m); return m; };
  mk(new THREE.CylinderGeometry(.085, .095, .035, 16), brass, [0, -.15, 0]);
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: .92 });
  mk(new THREE.CylinderGeometry(.075, .075, .25, 16), glassMat, [0, 0, 0]);
  const flame = mk(new THREE.SphereGeometry(.05, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff2c0 }), [0, -.03, 0]);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; mk(new THREE.BoxGeometry(.014, .27, .014), brass, [Math.cos(a) * .08, 0, Math.sin(a) * .08]); }
  mk(new THREE.ConeGeometry(.105, .07, 16), brass, [0, .16, 0]); mk(new THREE.TorusGeometry(.055, .008, 6, 16), brass, [0, .225, 0]);
  const halo = glowSprite(0xffc060, 1, 1), halo2 = glowSprite(0xffeab8, 1, 1); g.add(halo); g.add(halo2);
  const light = new THREE.PointLight(0xffc46a, 0, o.dist || 16, 1.3); g.add(light); if (o.light === false) light.visible = false;
  Wd.on(t => { const s = fn(t); g.visible = s.visible !== false; if (!g.visible) return; g.position.set(...s.pos);
    const lit = s.lit === undefined ? 1 : s.lit, sc = (o.scale || 1.3) * (s.scale || 1), fl = 1 + .06 * Math.sin(t * 13 + (o.seed || 0)) + .04 * Math.sin(t * 23.7);
    parts.scale.setScalar(sc); glassMat.color.setRGB(lerp(.33, 1, Math.min(lit, 1)), lerp(.24, .82, Math.min(lit, 1)), lerp(.12, .48, Math.min(lit, 1))); flame.visible = lit > .05; flame.scale.set(lit, lit * 1.5, lit);
    halo.scale.setScalar((.2 + 1.9 * lit) * (s.glow || 1) * fl * sc); halo.material.opacity = Math.min(1, .9 * lit); halo2.scale.setScalar((.08 + .75 * lit) * (s.glow || 1) * fl * sc); halo2.material.opacity = Math.min(1, lit);
    if (light.visible) light.intensity = lit * (s.power !== undefined ? s.power : (o.power || 5)) * fl; g.rotation.z = s.swing ? s.swing : 0; });
  return g;
}

// ---------------- Har Sinai ----------------
export function mountain(Wd, o) {
  o = o || {}; const R = o.R || 80, H = o.H || 70, X = o.x || 0, Z = o.z || 0, seed = o.seed || 3, N = o.N || 150, size = R * 2.5;
  const hAt = (x, z) => { const u = x / R, v = z / R, r = Math.hypot(u * .85, v * 1.1), e = clamp(1 - r, 0, 1); let h = Math.pow(e, 1.12) * H;
    const r2 = Math.hypot((u + .42) * 1.5, (v - .12) * 1.6); h = Math.max(h, Math.pow(clamp(1 - r2, 0, 1), 1.2) * H * .62);
    const r3 = Math.hypot((u - .4) * 1.4, (v + .1) * 1.5); h = Math.max(h, Math.pow(clamp(1 - r3, 0, 1), 1.2) * H * .5);
    const n = fbm(x * .045 + seed, z * .045 + seed * 2), rid = 1 - Math.abs(2 * fbm(x * .09 + seed * 3, z * .09) - 1);
    h *= .8 + .32 * n; h += rid * H * .1 * Math.pow(clamp(h / H, 0, 1), .7); return Math.max(0, h); };
  const geo = new THREE.PlaneGeometry(size, size, N, N); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, cols = new Float32Array(p.count * 3); let top = [0, 0, 0], hm = -1;
  const pal = [[.86, .7, .47], [.74, .5, .3], [.62, .36, .22], [.7, .45, .3]];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = hAt(x, z); p.setY(i, y); if (y > hm) { hm = y; top = [x, y, z]; }
    const hn = clamp(y / H, 0, 1), n = fbm(x * .06 + 5, z * .06 + 9), band = Math.sin(y * .5 + n * 8) * .5 + .5, sl = Math.abs(hAt(x + 1.6, z) - y) + Math.abs(hAt(x, z + 1.6) - y);
    const k = hn * 3, i0 = Math.min(2, Math.floor(k)), f = k - i0, A = pal[i0], B = pal[i0 + 1]; let c = [0, 1, 2].map(j => lerp(A[j], B[j], f));
    const sh = .9 + .14 * band - clamp(sl * .12, 0, .3); c = c.map(v => v * sh); const sand = [.92, .78, .54], ed = clamp(1 - y / 3.5, 0, 1); c = c.map((v, j) => lerp(v, sand[j], ed * .8));
    cols[i * 3] = c[0]; cols[i * 3 + 1] = c[1]; cols[i * 3 + 2] = c[2]; }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, toon(0xffffff, { vertexColors: true, flatShading: true })); m.position.set(X, .02, Z); m.receiveShadow = true; m.castShadow = false; Wd.add(m);
  const world3 = (x, z) => [X + x, hAt(x, z), Z + z];
  const topW = [X + top[0], top[1], Z + top[2]];
  // path (switchback) up to the summit: flat pale stones, no figure
  const stones = []; if (o.path !== false) { const pm = toon(0xe8d4a4); for (let i = 0; i < 70; i++) { const s = i / 69, rho = lerp(R * .78, 5, Math.pow(s, .9)), th = (o.pathStart === undefined ? Math.PI * .5 : o.pathStart) + s * 2.7 + .35 * Math.sin(s * 14);
      const lx = top[0] + Math.cos(th) * rho * .9, lz = top[2] + Math.sin(th) * rho * 1.05, y = hAt(lx, lz);
      const st = new THREE.Mesh(new THREE.BoxGeometry(1.6 + R * .008, .25, 1.1), pm); st.position.set(X + lx, y + .12, Z + lz); st.rotation.y = th + 1.57; st.castShadow = false; Wd.add(st); stones.push(st); } }
  return { mesh: m, hAt, at: world3, top: topW, X, Z, R, H, stones };
}

// ---------------- crowd (instanced simple figures) ----------------
const DUM = new THREE.Object3D();
export function crowd(Wd, o) {
  const r = rng(o.seed || 9), n = o.n || 300, items = [], face = o.face || [0, 0, -100];
  for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()), x = o.cx + Math.cos(a) * rr * o.rx, z = o.cz + Math.sin(a) * rr * o.rz; if (o.skip && o.skip(x, z)) { i--; continue; }
    items.push({ x, z, s: r() < .25 ? .74 + r() * .06 : .9 + r() * .2, ph: r() * 6.28, coat: r(), skin: r() }); }
  const bodyG = new THREE.CylinderGeometry(.2, .27, 1.2, 8); bodyG.translate(0, .6, 0); const headG = new THREE.SphereGeometry(.17, 8, 6); headG.translate(0, 1.37, 0);
  const hatG = new THREE.CylinderGeometry(.19, .19, .07, 8); hatG.translate(0, 1.52, 0);
  const mk = (geo, cf) => { const m = new THREE.InstancedMesh(geo, toon(0xffffff), n); m.frustumCulled = false; m.castShadow = false; items.forEach((it, i) => m.setColorAt(i, new THREE.Color(cf(it)))); Wd.add(m); return m; };
  const coats = ['#0c0c10', '#101014', '#14141a', '#0e0e12', '#111116', '#15151b', '#0b0b0f'], skins = ['#f4d8bc', '#f6dcc2', '#efcdb0', '#f8e0c8'];
  const mb = mk(bodyG, it => coats[Math.floor(it.coat * 7)]), mh = mk(headG, it => skins[Math.floor(it.skin * 4)]), mt = mk(hatG, () => '#0e0e12');
  const arms = o.arms || 0;
  Wd.on(t => { items.forEach((it, i) => { const yaw = Math.atan2(face[0] - it.x, face[2] - it.z), bob = Math.abs(Math.sin(t * 1.2 + it.ph)) * .02 * (1 + arms);
      DUM.position.set(it.x, (o.yAt ? o.yAt(it.x, it.z) : (o.y || 0)) + bob, it.z); DUM.rotation.set(0, yaw, .025 * Math.sin(t * .9 + it.ph)); DUM.scale.setScalar(it.s); DUM.updateMatrix();
      mb.setMatrixAt(i, DUM.matrix); mh.setMatrixAt(i, DUM.matrix); mt.setMatrixAt(i, DUM.matrix); });
    mb.instanceMatrix.needsUpdate = mh.instanceMatrix.needsUpdate = mt.instanceMatrix.needsUpdate = true; });
  return items;
}

// ---------------- stone textures ----------------
export function columnTex(base) { const r = rng(21); return canvasTex(256, 256, (g, w, h) => { g.fillStyle = base || '#dcc79c'; g.fillRect(0, 0, w, h);
  for (let row = 0; row < 8; row++) { const y = row * 32; g.fillStyle = ['#e3d0a6', '#d4be92', '#decaa0', '#d9c498'][row % 4]; g.fillRect(0, y + 2, w, 29); for (let i = 0; i < 40; i++) { g.globalAlpha = .12; g.fillStyle = r() < .5 ? '#8a6a3a' : '#fff4d8'; g.fillRect(r() * w, y + r() * 28, 2 + r() * 14, 1.5); } g.globalAlpha = 1;
    g.fillStyle = 'rgba(90,64,34,.55)'; g.fillRect(0, y, w, 2.5); } }, [2, 1.2]); }

// ---------------- pillar + balance (shots 3 and 5) ----------------
export function pillar(Wd, o) {
  o = o || {}; const strong = o.mode === 'strong', grp = new THREE.Group(); Wd.add(grp);
  const stoneM = toon(0xffffff, { map: columnTex() });
  grp.add(cyl(2.9, 3.3, .5, 0xcdb88e, { pos: [0, .25, 0] }));
  const pil = new THREE.Group(); grp.add(pil);
  let pivotY;
  if (!strong) { grp.add(cyl(.3, .4, 1.7, 0xb59a6c, { pos: [0, 1.35, 0] })); pivotY = 2.2; }
  else { grp.add(cyl(2.6, 6.4, 4.6, 0xffffff, { pos: [0, 2.8, 0], ink: true })); pivotY = 5.1; const rk = grp.children[grp.children.length - 1]; rk.material = toon(0xb98552, { flatShading: true }); }
  pil.position.y = pivotY;
  const PH = 8, body = new THREE.Mesh(new THREE.CylinderGeometry(.95, 1.1, PH, 28), stoneM); body.position.y = PH / 2; body.castShadow = true; ink(body, .03); pil.add(body);
  const cap = box(3.0, .45, 3.0, 0xe2cf9e, { pos: [0, PH + .22, 0] }); pil.add(cap); pil.add(box(2.4, .3, 2.4, 0xd4be92, { pos: [0, PH + .6, 0] }));
  pil.add(cyl(1.35, 1.35, .3, 0xe2cf9e, { pos: [0, .08, 0] }));
  // crack that climbs the pillar (spiral, with two branches)
  const segs = [], dk = new THREE.MeshBasicMaterial({ color: 0x2a1608 });
  if (!strong) { const NS = 34; let pa = 0.2, py = .8; for (let i = 0; i < NS; i++) { const a1 = pa + .17 + .12 * Math.sin(i * 1.9), y1 = py + .21; const rad = 1.09 - (y1 / PH) * .14;
      const p0 = new THREE.Vector3(Math.sin(pa) * rad, py, Math.cos(pa) * rad), p1 = new THREE.Vector3(Math.sin(a1) * rad, y1, Math.cos(a1) * rad), mid = p0.clone().add(p1).multiplyScalar(.5), len = p0.distanceTo(p1) + .06;
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, .17, .1), dk); m.position.copy(mid); m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), p1.clone().sub(p0).normalize()); m.visible = false; pil.add(m); segs.push(m); pa = a1; py = y1; } }
  // sparks orbiting (weak) / bouncing off (strong)
  const NSP = strong ? 48 : 40, r = rng(strong ? 5 : 11), SP = [];
  for (let i = 0; i < NSP; i++) SP.push({ a: r() * 6.283, h: 1.5 + r() * 8.5, rad: 2.4 + r() * 1.8, sp: (.5 + r() * .9) * (r() < .5 ? -1 : 1), ph: r(), per: 2.6 + r() * 2.2, col: [[1, .85, .4], [.7, .85, 1], [1, 1, .9], [1, .6, .8]][i % 4], far: 12 + r() * 10 });
  const pg = new THREE.BufferGeometry(), pp = new Float32Array(NSP * 3), pc = new Float32Array(NSP * 3); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: strong ? .55 : .5, map: glowTex(), vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, sizeAttenuation: true, fog: false })); pts.frustumCulled = false; grp.add(pts);
  Wd.on(t => {
    const grow = ease.io(prog(t, 2, 15));
    if (!strong) { pil.rotation.z = grow * .045 * Math.sin(t * 2.3 + .7 * Math.sin(t * .8)); pil.rotation.x = grow * .02 * Math.sin(t * 1.7); segs.forEach((m, i) => { m.visible = t > 5 + i * .27; }); }
    SP.forEach((s, i) => { let x, y, z, k = 1;
      if (!strong) { const a = s.a + t * s.sp * .7; x = Math.sin(a) * s.rad; z = Math.cos(a) * s.rad; y = s.h + Math.sin(t * 2.2 + s.ph * 9) * .5; k = .55 + .45 * Math.sin(t * 17 + i * 3.1) * Math.sin(t * 9.3 + i); }
      else { const u = ((t / s.per) + s.ph) % 1, hy = 3.2 + s.h * .6, hr = 1.15; const dx = Math.sin(s.a), dz = Math.cos(s.a);
        if (u < .55) { const e = ease.in(u / .55), rr = lerp(s.far, hr, e); x = dx * rr; z = dz * rr; y = lerp(hy + 3, hy, e); k = .4 + .6 * e; }
        else { const v = (u - .55) / .45, rr = hr + v * 3.5; x = dx * rr; z = dz * rr; y = hy - v * v * 3 + v * 1.4; k = Math.max(0, 1 - v * 1.3); } }
      pp[i * 3] = x; pp[i * 3 + 1] = y + (strong ? 0 : 0); pp[i * 3 + 2] = z; pc[i * 3] = s.col[0] * k; pc[i * 3 + 1] = s.col[1] * k; pc[i * 3 + 2] = s.col[2] * k; });
    pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true; });
  return { group: grp, pil };
}
export function balance(Wd, o) {
  o = o || {}; const g = new THREE.Group(); g.position.set(o.x || 6, 0, o.z || 0); Wd.add(g); const gold = 0xc9923a;
  g.add(cyl(1.5, 1.8, .35, 0xcdb88e, { pos: [0, .17, 0] })); g.add(cyl(.18, .26, 4.4, 0x8a5a2c, { pos: [0, 2.5, 0] })); g.add(ball(.3, gold, { pos: [0, 4.75, 0] }));
  const beam = new THREE.Group(); beam.position.set(0, 4.75, 0); g.add(beam); beam.add(box(4.8, .2, .22, 0x8a5a2c, { pos: [0, 0, 0] }));
  const pans = []; for (const sx of [-1, 1]) { const pg = new THREE.Group(); pg.position.set(sx * 2.4, 0, 0); beam.add(pg);
    for (const dx of [-.8, .8]) for (const dz of [0]) { const c = box(.04, 1.7, .04, 0x6a4a2a, { pos: [dx * .5, -.85, dz], rot: [0, 0, -dx * .24], ink: false }); pg.add(c); }
    pg.add(cyl(1.0, .75, .22, gold, { pos: [0, -1.75, 0] })); pans.push(pg); }
  Wd.on(t => { const a = o.strong ? .01 * Math.sin(t * .8) * Math.max(0, 1 - t / 3) : ease.io(prog(t, 2, 14)) * .3 * Math.sin(t * 1.55 + .8 * Math.sin(t * .7)) + ease.io(prog(t, 4, 15)) * .05; beam.rotation.z = a; pans.forEach(p => { p.rotation.z = -a; }); });
  return g;
}

// ---------------- the olive tree + rock of Sinai (shots 10, 11) ----------------
function instGroup(Wd, geo, mat, items, outline) {
  const mk = (mt, k, back) => { const m = new THREE.InstancedMesh(geo, mt, items.length); items.forEach((s, i) => { DUM.position.set(s.x, s.y, s.z); DUM.rotation.set(0, s.ry || 0, 0); DUM.scale.set(s.sx * k, s.sy * k, s.sz * k); DUM.updateMatrix(); m.setMatrixAt(i, DUM.matrix); if (s.col !== undefined && !back) m.setColorAt(i, new THREE.Color(s.col)); });
    m.frustumCulled = false; m.castShadow = !back; m.receiveShadow = !back; Wd.add(m); return m; };
  mk(mat, 1); if (outline) mk(new THREE.MeshBasicMaterial({ color: outline, side: THREE.BackSide }), 1.07, true);
}
export function sinaiRock(Wd, o) {
  const s = o.s || 2.4, g = new THREE.Group(); g.position.set(...o.pos); Wd.add(g); const geo = new THREE.IcosahedronGeometry(1, 3), p = geo.attributes.position, cols = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = fbm(x * 1.7 + 4, z * 1.7 + y * 1.3), k = .82 + .38 * n; p.setXYZ(i, x * k, y * k * .8, z * k); const b = .8 + .3 * fbm(x * 3 + 1, y * 3); cols[i * 3] = .78 * b; cols[i * 3 + 1] = .5 * b; cols[i * 3 + 2] = .3 * b; }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const rock = new THREE.Mesh(geo, toon(0xffffff, { vertexColors: true, flatShading: true })); rock.scale.setScalar(s); rock.position.y = s * .45; rock.castShadow = true; ink(rock, .02); g.add(rock);
  const gm = new THREE.MeshBasicMaterial({ color: 0xffd57a });
  for (let k = 0; k < 4; k++) { const pts = []; const a0 = k * 1.7 + .4; for (let j = 0; j <= 8; j++) { const a = a0 + j * .22 + .1 * Math.sin(j * 2.3), el = .15 + j * .11 + .1 * Math.sin(j * 1.7 + k); pts.push(new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el) * .8, Math.sin(a) * Math.cos(el)).multiplyScalar(s * 1.02)); }
    const tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, s * .035, 5), gm); tb.position.y = s * .45; g.add(tb); }
  const halo = glowSprite(0xffb84a, s * 5, .8); halo.position.y = s * .8; g.add(halo); const li = new THREE.PointLight(0xffc060, 3, 14, 1.4); li.position.set(0, s * .9, s * .5); g.add(li);
  Wd.on(t => { const f = 1 + .08 * Math.sin(t * 2.1); halo.scale.setScalar(s * 5 * f); li.intensity = (o.power || 4) * f; });
  return { group: g, rock };
}
export function oliveTree(Wd, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g); const by = o.y || 0, trunkM = toon(0x7d6a48);
  const bend = y => ({ x: .5 * Math.sin(y * .5) + .08 * y, z: .3 * Math.cos(y * .6) });
  for (let i = 0; i < 6; i++) { const y0 = i * 1.1, y1 = y0 + 1.15, r0 = 1.25 - i * .13, r1 = 1.25 - (i + 1) * .13, b0 = bend(y0), b1 = bend(y1); const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, 1.2, 14), trunkM); m.position.set((b0.x + b1.x) / 2, by + (y0 + y1) / 2, (b0.z + b1.z) / 2); m.rotation.z = -(b1.x - b0.x) / 1.2; m.rotation.x = (b1.z - b0.z) / 1.2; m.castShadow = true; ink(m, .025); g.add(m); }
  const tb = bend(6.4), r = rng(7);
  for (let i = 0; i < 6; i++) { const a = i * 1.047 + .3, L = 4.2 + r() * 1.4, tilt = .75 + r() * .3; const m = new THREE.Mesh(new THREE.CylinderGeometry(.18, .42, L, 8), trunkM); m.position.set(tb.x + Math.sin(a) * Math.sin(tilt) * L / 2, by + 6.4 + Math.cos(tilt) * L / 2, tb.z + Math.cos(a) * Math.sin(tilt) * L / 2); m.rotation.set(0, a, 0); m.rotateX(tilt); m.castShadow = true; ink(m, .02); g.add(m); }
  const cl = [], greens = ['#6f8f3a', '#7fa046', '#5f8232', '#8aa84f', '#78903f', '#93a86a'];
  for (let i = 0; i < 90; i++) { const a = r() * 6.283, el = Math.acos(1 - r() * .95), R = 8.2, rr = R * (.55 + .45 * Math.sqrt(r())), x = Math.sin(el) * Math.cos(a) * rr + tb.x, z = Math.sin(el) * Math.sin(a) * rr + tb.z, y = by + 9.2 + Math.cos(el) * 4.6 * (rr / R) - (1 - Math.cos(el)) * 1.2, s = 2 + r() * 1.7;
    cl.push({ x, y, z, sx: s, sy: s * .62, sz: s, ry: r() * 3, col: greens[i % 6] }); }
  instGroup(Wd, new THREE.IcosahedronGeometry(1, 1), toon(0xffffff, { flatShading: true }), cl, 0x2f4a22);
  return { group: g, trunkTop: tb };
}
export function roots(Wd, from, to, o) {
  o = o || {}; const rm = toon(0x6e5c3e), r = rng(o.seed || 3);
  for (let k = 0; k < (o.n || 5); k++) { const spread = (k - ((o.n || 5) - 1) / 2) * .55, A = new THREE.Vector3(...from), B = new THREE.Vector3(...to), d = B.clone().sub(A).setY(0), nx = new THREE.Vector3(-d.z, 0, d.x).normalize();
    const pts = [A.clone().add(new THREE.Vector3(0, .9, 0))]; for (let j = 1; j <= 6; j++) { const u = j / 6, q = A.clone().lerp(B, u).add(nx.clone().multiplyScalar(spread * (1 - u * .6) + Math.sin(u * 7 + k * 2) * .3)); q.y = (o.y || 0) + (j === 1 ? .55 : .16) * (1 - u * .6) + (u > .85 ? .5 * (u - .85) * 6 : 0); pts.push(q); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .26 - k % 2 * .06, 7), rm); m.castShadow = true; ink(m, .02); Wd.add(m); }
  // short roots on the other sides
  for (let k = 0; k < 5; k++) { const a = 2.2 + k * 1.0; const A = new THREE.Vector3(Math.cos(a) * .9 + (o.cx || 0), (o.y || 0) + .7, Math.sin(a) * .9 + (o.cz || 0)); const pts = [A, A.clone().add(new THREE.Vector3(Math.cos(a) * 1.2, -.5, Math.sin(a) * 1.2)), A.clone().add(new THREE.Vector3(Math.cos(a) * 2.6, -.62, Math.sin(a) * 2.6)), A.clone().add(new THREE.Vector3(Math.cos(a + .3) * 3.6, -.9, Math.sin(a + .3) * 3.6))];
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, .2, 6), rm); ink(m, .02); Wd.add(m); }
}
export function tablets(Wd, pos, o) {   // two stone luchot, rounded tops, no writing
  o = o || {}; const g = new THREE.Group(); g.position.set(...pos); if (o.ry) g.rotation.y = o.ry; Wd.add(g); const mat = toon(0xe6dcc4);
  for (const x of [-.34, .34]) { const sh = new THREE.Shape(); sh.moveTo(-.3, 0); sh.lineTo(.3, 0); sh.lineTo(.3, .7); sh.absarc(0, .7, .3, 0, Math.PI, false); sh.lineTo(-.3, 0);
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .12, bevelEnabled: false }), mat); m.position.set(x, 0, 0); m.rotation.y = x * .5; m.castShadow = true; ink(m, .015); g.add(m); }
  return g;
}
export function sitter(Wd, look, pos, facing, o) {   // a seated man/boy on a low stone block
  o = o || {}; const sc = o.scale || 1, bh = (o.block === undefined ? .5 : o.block) * sc;
  if (bh > 0) { Wd.add(box(.7 * sc, bh, .55 * sc, 0xc9b690, { pos: [pos[0], pos[1] + bh / 2, pos[2]], rot: [0, facing, 0] })); }
  return person(Wd, look, t => Object.assign({ pos: [pos[0], pos[1], pos[2]], facing, sit: true, gesture: (o.gestures || ['explain', 'finger', 'explainA', 'rest', 'point'])[Math.floor(((t + (o.seed || 0) * 4.1) / 3.3)) % 5], talk: o.talk ? .45 + .4 * Math.sin(t * 8 + (o.seed || 0)) : 0, seed: o.seed || .3, look: .1 }, o.fn ? o.fn(t) : {}), { scale: sc });
}
