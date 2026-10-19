// k07lib.js - building blocks for the k07 film (Anshei Kodesh). Everything is a function of t only (rng(seed) for randomness).
import { THREE, box, cyl, ball, toon, ink, canvasTex, label, person, rng, clamp, lerp, ease, prog, D } from '../../lib/stage3d.js';
import { fbm, cine } from '../azamra342/road.js';
export { fbm, cine };
export const PI = Math.PI, sm = ease.sm;

// ---------------- characters ----------------
export const RAV = { coat: '#1d1d24', beard: '#a7a199', beardLen: .55, hat: 'kippa', hatColor: '#101014', skin: '#efcfb0', glasses: true };
export const BACHUR = { coat: '#17171d', hat: 'kippa', hatColor: '#101014', beard: false, beardLen: 0, skin: '#f0d2b4', pants: '#1b1d24' };
export const ELDER = { coat: '#23232b', beard: '#eceae6', beardLen: .8, hat: 'kippa', hatColor: '#101014', skin: '#e9c9a8' };
const COATS = ['#17171d', '#1f2430', '#2a2230', '#202a24', '#26262c', '#2d2420'], SKINS = ['#efcfb0', '#f0d2b4', '#e8c3a0', '#f2d6bc'], BEARDS = ['#2a1c14', '#8d8780', '#3a2a20', '#1c1612'];
export const manN = i => Object.assign({}, BACHUR, { coat: COATS[i % 6], skin: SKINS[i % 4] }, i % 3 === 0 ? { beard: BEARDS[i % 4], beardLen: .5 } : {});
export const boyN = i => ({ kind: 'boy', coat: ['#2b3a5a', '#3a3a4a', '#2c4a46', '#4a3a3a', '#35405a'][i % 5], hat: 'kippa', hatColor: '#101014', beardLen: 0, skin: SKINS[(i + 1) % 4], pants: '#1b1d24' });

export const EFF = .95;
export const holdAt = (pos, facing, sc, fwd, up) => [pos[0] + Math.sin(facing) * fwd * sc * EFF, (pos[1] || 0) + up * sc * EFF, pos[2] + Math.cos(facing) * fwd * sc * EFF];
export const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const chestPos = (pos, facing, o) => { o = o || {}; const s = (o.scale || 1) * EFF, y = (1.25 - (o.sit ? .43 : 0)) * s; return [pos[0] + Math.sin(facing) * .13 * s, (pos[1] || 0) + y, pos[2] + Math.cos(facing) * .13 * s]; };
export const lbl = (Wd, text, pos, h, o) => label(Wd, text, Object.assign({ pos, height: h || .3, bg: 'rgba(86,52,20,.88)', color: '#ffeec4' }, o || {}));
export const pf = (a, b, t0, t1, t) => lerp(a, b, sm(prog(t, t0, t1)));
export function mix(f1, f2, t0, t1) { return t => { if (t <= t0) return f1(t); if (t >= t1) return f2(t); const a = f1(t), b = f2(t), k = sm((t - t0) / (t1 - t0));
  return { pos: a.pos.map((v, i) => lerp(v, b.pos[i], k)), look: a.look.map((v, i) => lerp(v, b.look[i], k)), fov: lerp(a.fov || 45, b.fov || 45, k) }; }; }

// ---------------- palettes ----------------
export const DAWN = { skyTop: 0xf3b8b4, skyBottom: 0xffe3c6, fogColor: 0xfbdcc4, fogNear: 90, fogFar: 520, sun: 1.6, sunColor: 0xffd7a6, sunPos: [-70, 32, 45], hemi: 1.35, hemiSky: 0xfff0e0, hemiGround: 0xa3c98e, shadowExt: 34, skyR: 1700 };
export const INT = { skyTop: 0xf5c3b8, skyBottom: 0xffe6c8, fogColor: 0xfbe3c8, fogNear: 60, fogFar: 300, sun: .9, sunColor: 0xffd9a0, sunPos: [-20, 30, 30], hemi: 1.6, hemiSky: 0xfff0d6, hemiGround: 0xd9ab6c, shadowExt: 16, skyR: 900 };

// ---------------- glow ----------------
let GT = null;
export function glowTex() { if (!GT) GT = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); return GT; }
export function glowSprite(color, size, opacity, o) {
  o = o || {};
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, blending: o.normal ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, depthTest: o.depthTest !== false, transparent: true, opacity: opacity === undefined ? 1 : opacity, fog: false }));
  s.scale.set(size, size, 1); s.renderOrder = o.order || 6; return s;
}
export function sunGlow(Wd, pos, size, op, color) { const g = glowSprite(color || 0xffd9a8, size, op === undefined ? .8 : op); g.position.set(...pos); Wd.add(g); const c = glowSprite(0xfff4de, size * .35, .9); c.position.set(...pos); Wd.add(c); return g; }

// motes: a cloud of glowing points with per-point size and colour. m.set(i,x,y,z,size,r,g,b); m.done()
export function motes(Wd, n, o) {
  o = o || {}; const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: glowTex() } }, transparent: true, depthWrite: false, depthTest: o.depthTest !== false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float size; attribute vec3 color; varying vec3 vC; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(size*projectionMatrix[1][1]*540.0/max(gl_Position.w,0.01),0.0,300.0); }',
    fragmentShader: 'uniform sampler2D map; varying vec3 vC; void main(){ float a=texture2D(map,gl_PointCoord).a; gl_FragColor=vec4(vC,a); }' });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 7; Wd.add(pts);
  return { n, set(i, x, y, z, s, r, g, b) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; size[i] = s; col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b; }, hide(i) { size[i] = 0; },
    done() { geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.attributes.size.needsUpdate = true; } };
}

// THE INNER LIGHT: a golden-white glow in a chest. getPos(t) -> [x,y,z]; getL(t) -> 0..1.8 (brightness)
export function innerLight(Wd, getPos, getL, o) {
  o = o || {}; const halo = glowSprite(0xffc860, 1, .9, { depthTest: false, order: 6 }), core = glowSprite(0xfff4d0, 1, 1, { depthTest: false, order: 7 });
  Wd.add(halo); Wd.add(core); let L = null; if (o.light) { L = new THREE.PointLight(0xffc870, 0, o.dist || 6, 1.5); Wd.add(L); }
  const k = o.k || 1;
  Wd.on(t => { const p = getPos(t), l = getL(t), fl = 1 + .05 * Math.sin(t * 3.1 + (o.seed || 0)); halo.visible = core.visible = l > .02; halo.position.set(...p); core.position.set(...p);
    halo.scale.setScalar((.1 + .2 * Math.min(l, 1.8)) * k * fl); halo.material.opacity = Math.min(.9, .2 + .4 * l); core.scale.setScalar((.045 + .08 * Math.min(l, 1.8)) * k * fl); core.material.opacity = Math.min(1, .3 + .7 * l);
    if (L) { L.position.set(p[0], p[1] + .05, p[2]); L.intensity = l * (o.power || 3) * fl; } });
}

// ---------------- terrain ----------------
export function hills(Wd, o) {
  o = o || {}; const S = o.size || 700, N = o.N || 150, seed = o.seed || 3, fl = o.flat || [0, 0, 18, 70], amp = o.amp === undefined ? 24 : o.amp;
  const hAt = o.h || ((x, z) => { const d = Math.hypot(x - fl[0], z - fl[1]), k = ease.sm(clamp((d - fl[2]) / (fl[3] - fl[2]), 0, 1)); return k * amp * (.25 + 1.1 * fbm(x * .012 + seed, z * .012 + seed * 2)); });
  const A = [.60, .80, .57], B = [.46, .70, .48], C = [.74, .88, .62];
  const colFn = o.col || ((x, z, h) => { const n = fbm(x * .03 + 9, z * .03 + 4), m = fbm(x * .11 + 2, z * .11 + 8), k = clamp(h / Math.max(amp, 1), 0, 1);
    let c = A.map((v, i) => lerp(v, C[i], k * .7)); const kd = clamp((n - .45) * 3, 0, 1); c = c.map((v, i) => lerp(v, B[i], kd * .6)); return c.map(v => v * (.93 + .14 * m)); });
  const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-PI / 2); if (o.cx || o.cz) g.translate(o.cx || 0, 0, o.cz || 0);
  const p = g.attributes.position, cols = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = hAt(x, z), c = colFn(x, z, h); p.setY(i, h); cols[i * 3] = c[0]; cols[i * 3 + 1] = c[1]; cols[i * 3 + 2] = c[2]; }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals();
  const mat = toon(0xffffff, { vertexColors: true }), m = new THREE.Mesh(g, mat); m.receiveShadow = true; Wd.add(m);
  return { hAt, mesh: m, mat };
}
export function groundPlane(Wd, color, y) { const m = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), toon(color || 0xa4cf9e)); m.rotation.x = -PI / 2; m.position.y = y === undefined ? -.03 : y; m.receiveShadow = true; Wd.add(m); return m; }

const DUM = new THREE.Object3D();
function inst(Wd, geo, items, mat) {
  const m = new THREE.InstancedMesh(geo, mat || toon(0xffffff), items.length);
  items.forEach((s, i) => { DUM.position.set(s.x, s.y, s.z); DUM.rotation.set(0, s.ry || 0, 0); DUM.scale.set(s.sx, s.sy, s.sz); DUM.updateMatrix(); m.setMatrixAt(i, DUM.matrix); if (s.col !== undefined) m.setColorAt(i, new THREE.Color(s.col)); });
  m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; Wd.add(m); return m;
}
export function trees(Wd, hAt, o) {
  const r = rng(o.seed || 5), tr = [], cr = [], cy = [], a = o.area, G = ['#6fa05a', '#7cb066', '#5e9250', '#86b86c'];
  for (let i = 0; i < (o.n || 40); i++) { const x = a[0] + r() * (a[1] - a[0]), z = a[2] + r() * (a[3] - a[2]); if (o.skip && o.skip(x, z)) continue; const y = hAt(x, z), s = .8 + r() * .8;
    if (r() < (o.cypress === undefined ? .25 : o.cypress)) cy.push({ x, y, z, sx: .7 * s, sy: 3.6 * s, sz: .7 * s, col: '#4f8a52' });
    else { tr.push({ x, y, z, sx: .22 * s, sy: 1.7 * s, sz: .22 * s, col: '#7a5a3a' }); cr.push({ x, y: y + 1.9 * s, z, sx: 1.7 * s, sy: 1.15 * s, sz: 1.7 * s, col: G[i % 4], ry: r() * 3 }); } }
  const tg = new THREE.CylinderGeometry(.7, 1, 1, 6); tg.translate(0, .5, 0); const cg = new THREE.IcosahedronGeometry(1, 1), kg = new THREE.ConeGeometry(1, 1, 8); kg.translate(0, .5, 0);
  if (tr.length) { inst(Wd, tg, tr); inst(Wd, cg, cr); } if (cy.length) inst(Wd, kg, cy);
}

// ---------------- houses, fences, objects ----------------
export function house(Wd, o) {
  const w = o.w || 5, d = o.d || 4.5, h = o.h || 3.4, g = new THREE.Group(); g.position.set(o.x, o.y || 0, o.z); g.rotation.y = o.ry || 0; Wd.add(g);
  g.add(box(w, h, d, o.wall || '#f2e6cc', { pos: [0, h / 2, 0], inkW: .02 }));
  if (o.flat) { g.add(box(w + .3, .3, d + .3, o.roof || '#b3ab9c', { pos: [0, h + .15, 0] })); }
  else { const a = .42, rise = (w / 2) * Math.tan(a), sl = (w / 2) / Math.cos(a) + .35; for (const sx of [-1, 1]) g.add(box(sl, .2, d + .5, o.roof || '#d98a5e', { pos: [sx * w / 4, h + rise / 2 + .08, 0], rot: [0, 0, -sx * a] })); g.add(box(.3, .22, d + .55, '#c4724a', { pos: [0, h + rise + .1, 0], ink: false })); }
  const wm = o.glow ? new THREE.MeshBasicMaterial({ color: 0xffd98a }) : toon(o.win || '#5a7694');
  for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.6, .8, .1), wm); m.position.set(sx * w * .26, h * .6, d / 2 + .02); g.add(m); }
  g.add(box(.9, 1.75, .12, '#7a5030', { pos: [0, .88, d / 2 + .03], ink: false })); return g;
}
export function fence(Wd, o) {   // along x at z, from x0 to x1, with a gate gap [g0,g1]
  const WD = 0x9a6a3e, n = Math.round((o.x1 - o.x0) / 1.3);
  for (let i = 0; i <= n; i++) { const x = o.x0 + i * (o.x1 - o.x0) / n; if (o.gate && x > o.gate[0] - .01 && x < o.gate[1] + .01 && i > 0 && i < n) continue; Wd.add(box(.12, 1.2, .12, WD, { pos: [x, .6, o.z], ink: false })); }
  const rail = (a, b, y) => Wd.add(box(b - a, .08, .06, '#b27c48', { pos: [(a + b) / 2, y, o.z], ink: false }));
  for (const y of [.5, .95]) if (o.gate) { rail(o.x0, o.gate[0], y); rail(o.gate[1], o.x1, y); } else rail(o.x0, o.x1, y);
  if (o.gate) { for (const x of [o.gate[0], o.gate[1]]) Wd.add(box(.16, 1.4, .16, '#7a4e2a', { pos: [x, .7, o.z] })); }
}
export function dog(Wd, o) {   // a calm friendly shepherd dog sitting, front toward +z (rotate with ry)
  const g = new THREE.Group(); g.position.set(...o.pos); g.rotation.y = o.ry || 0; Wd.add(g); const T = '#c88f52', C = '#f1dcb4', E = '#8a5a30', K = '#1a1410';
  g.add(ball(1, T, { pos: [0, .2, -.2], scale: [.2, .18, .24] })); g.add(ball(1, T, { pos: [0, .4, -.04], scale: [.17, .25, .17] })); g.add(ball(1, C, { pos: [0, .38, .08], scale: [.12, .2, .09], ink: false }));
  for (const sx of [-1, 1]) { g.add(cyl(.045, .05, .36, T, { pos: [sx * .075, .19, .08] })); g.add(ball(1, C, { pos: [sx * .075, .025, .13], scale: [.055, .03, .075], ink: false })); g.add(ball(1, T, { pos: [sx * .17, .06, -.28], scale: [.07, .06, .13] })); }
  g.add(ball(.13, T, { pos: [0, .68, .06] })); g.add(ball(1, '#ddb47c', { pos: [0, .63, .2], scale: [.065, .055, .1] })); g.add(ball(.022, K, { pos: [0, .66, .295], ink: false }));
  for (const sx of [-1, 1]) { g.add(ball(1, E, { pos: [sx * .1, .76, .03], scale: [.04, .11, .06], rot: [.1, 0, sx * .25] })); g.add(ball(.02, K, { pos: [sx * .055, .70, .17], ink: false })); }
  const tail = new THREE.Group(); tail.position.set(0, .1, -.42); g.add(tail); tail.add(ball(1, T, { pos: [0, .02, -.14], scale: [.05, .04, .17] }));
  Wd.on(t => { tail.rotation.y = .5 * Math.sin(t * 4.2); }); return g;
}
export function bowl(Wd, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); Wd.add(g); g.add(cyl(.2, .17, .09, '#d9c9aa', { pos: [0, .045, 0] })); g.add(ball(1, '#efe3c8', { pos: [0, .09, 0], scale: [.2, .13, .2] })); g.add(ball(.035, '#b89a6a', { pos: [0, .225, 0] })); return g; }
export function table(Wd, o) {
  const x = o.x || 0, z = o.z || 0, w = o.w || 2, d = o.d || 1, h = o.h || .78; Wd.add(box(w, .07, d, o.col || 0x8f5d33, { pos: [x, h - .035, z], inkW: .012 }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) Wd.add(box(.08, h - .07, .08, 0x5e3a20, { pos: [x + sx * (w / 2 - .1), (h - .07) / 2, z + sz * (d / 2 - .1)], ink: false }));
}
export function bench(Wd, x, z, w, ry, h) { Wd.add(box(w, h || .46, .4, 0x7a4a2a, { pos: [x, (h || .46) / 2, z], rot: [0, ry || 0, 0], inkW: .012 })); }
const SPINE = [0x7a1f2a, 0x1f3b6b, 0x2f5a3a, 0x5a3a1f, 0x6b3a52, 0x3a3340, 0x8a6a2a];
export function sefer(Wd, pos, o) { o = o || {}; const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = o.ry || 0; Wd.add(g); const c = o.color || SPINE[(o.i || 0) % 7], w = o.w || .3, d = o.d || .22, h = o.h || .07;
  g.add(box(w, h, d, c, { pos: [0, h / 2, 0] })); g.add(box(w - .03, h - .03, d + .01, '#f1e6c8', { pos: [.01, h / 2, 0], ink: false })); g.add(box(.012, h + .005, d + .005, '#d9a63a', { pos: [-w / 2 + .01, h / 2, 0], ink: false })); return g; }
export function stack(Wd, pos, n, ry) { const g = new THREE.Group(); g.position.set(...pos); Wd.add(g); for (let i = 0; i < n; i++) { const s = sefer(Wd, [0, i * .075, 0], { i: i + 2, ry: ry + (i % 2 ? .12 : -.1), w: .3 - i * .02 }); Wd.scene.remove(s); g.add(s); } return g; }
// an open book lying on a surface. openFn(t) -> 0..1 (0 closed-ish, 1 open). glowFn(t) -> 0..1 page glow. returns group
export function book(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); g.rotation.set(o.rx || 0, o.ry || 0, 0); Wd.add(g); const w = o.w || .5, d = o.d || .34, cov = o.color || 0x6a2030;
  const mkHalf = s => { const h = new THREE.Group(); h.position.set(0, .02, 0); g.add(h); h.add(box(w / 2, .03, d, cov, { pos: [s * w / 4, 0, 0] })); const pg = box(w / 2 - .03, .04, d - .04, '#f6ecd0', { pos: [s * (w / 4 + .005), .032, 0], ink: false }); pg.material = toon('#f6ecd0', { emissive: 0xffd890, emissiveIntensity: 0 }); h.add(pg); h.userData.pg = pg; return h; };
  const L = mkHalf(-1), R = mkHalf(1); g.add(box(.035, .06, d + .01, cov, { pos: [0, .03, 0], ink: false }));
  const closed = box(w / 2, .09, d, cov, { pos: [0, .045, 0] }); g.add(closed);
  Wd.on(t => { const op = o.open ? o.open(t) : 1, th = lerp(1.35, .1, sm(op)); L.rotation.z = -th; R.rotation.z = th; closed.visible = op < .08; L.visible = R.visible = op >= .08;
    const gl = o.glow ? o.glow(t) : 0; for (const h of [L, R]) h.userData.pg.material.emissiveIntensity = gl * .9; });
  return g;
}
export function loaf(Wd, o) {   // THE LOAF: a round golden challah-like loaf on a wooden board. posFn(t) optional; glow(t) 0..1
  const g = new THREE.Group(); Wd.add(g); g.add(box(.6, .04, .4, '#8f5d33', { pos: [0, .02, 0] })); const main = ball(1, '#dc9c3a', { pos: [0, .13, 0], scale: [.25, .1, .17] }); g.add(main);
  for (let i = -2; i <= 2; i++) g.add(ball(1, '#eeb858', { pos: [i * .07, .2, 0], scale: [.045, .05, .15], rot: [0, i % 2 ? .6 : -.6, 0], ink: false }));
  const halo = glowSprite(0xffc866, 1.1, 0); halo.position.y = .25; g.add(halo);
  Wd.on(t => { const p = o.posFn ? o.posFn(t) : o.pos; g.position.set(...p); if (o.hidden) g.visible = !o.hidden(t); const l = o.glow ? o.glow(t) : 0; halo.visible = l > .02; halo.scale.setScalar((.4 + 1.1 * l) * (1 + .05 * Math.sin(t * 3))); halo.material.opacity = .85 * l; });
  g.userData.main = main; return g;
}
export function plate(Wd, pos, kind) {
  const g = new THREE.Group(); g.position.set(...pos); Wd.add(g);
  if (kind === 'grey') { g.add(cyl(.2, .16, .03, '#7d7a80', { pos: [0, .015, 0] })); for (let i = 0; i < 5; i++) g.add(ball(1, ['#6d6560', '#5c5760', '#76706a'][i % 3], { pos: [Math.cos(i * 1.3) * .08, .06, Math.sin(i * 1.3) * .08], scale: [.07, .045, .06], ink: false })); return g; }
  g.add(cyl(.2, .16, .03, '#f9f2e4', { pos: [0, .015, 0] }));
  g.add(ball(1, '#dba04a', { pos: [-.07, .08, .03], scale: [.1, .05, .065], rot: [0, .4, 0] })); g.add(ball(1, '#e9b660', { pos: [-.04, .12, -.02], scale: [.08, .035, .055], rot: [0, -.3, 0], ink: false }));
  g.add(ball(.05, '#d8503c', { pos: [.07, .08, -.05] })); g.add(ball(.045, '#cdd35a', { pos: [.08, .075, .06] }));
  for (let i = 0; i < 5; i++) g.add(ball(.022, '#6b3f86', { pos: [.0 + (i % 3) * .035, .06 + Math.floor(i / 3) * .03, .1 - (i % 2) * .03], ink: false })); return g;
}
export function scaleObj(Wd) {   // a little balance: = laws
  const g = new THREE.Group(); Wd.add(g); const gold = '#d2a040'; g.add(cyl(.12, .15, .04, '#b08a50', { pos: [0, .02, 0] })); g.add(cyl(.018, .025, .38, '#8a5a2c', { pos: [0, .21, 0] })); g.add(ball(.03, gold, { pos: [0, .41, 0] }));
  g.add(box(.46, .02, .02, '#8a5a2c', { pos: [0, .41, 0], ink: false })); for (const sx of [-1, 1]) { g.add(box(.006, .2, .006, '#6a4a2a', { pos: [sx * .22, .31, 0], ink: false })); g.add(cyl(.09, .07, .015, gold, { pos: [sx * .22, .2, 0] })); } return g;
}
export function doorObj(Wd) {   // a little closed door = forbidden deeds
  const g = new THREE.Group(); Wd.add(g); g.add(box(.34, .5, .05, '#6a4426', { pos: [0, .25, 0] })); g.add(box(.26, .43, .06, '#9a6a3e', { pos: [0, .24, 0], ink: false })); g.add(ball(.025, '#d2a040', { pos: [.08, .24, .045], ink: false })); g.add(box(.05, .06, .07, '#3a2a1a', { pos: [.08, .19, .02], ink: false })); return g;
}
export function shtender(Wd, o) {
  const g = new THREE.Group(); g.position.set(o.x || 0, 0, o.z || 0); Wd.add(g); g.add(box(.56, .04, .5, '#5e3a20', { pos: [0, .02, 0] })); g.add(box(.1, .9, .1, '#5e3a20', { pos: [0, .47, 0], ink: false }));
  g.add(box(.62, .05, .46, '#8a5a34', { pos: [0, 1.0, 0], rot: [-.42, 0, 0] })); g.add(box(.5, .02, .38, '#f6ecd4', { pos: [0, 1.04, -.005], rot: [-.42, 0, 0], ink: false })); g.add(box(.62, .34, .04, '#8a5a34', { pos: [0, .83, .22] }));
  if (o.label) lbl(Wd, o.label, [(o.x || 0), .83, (o.z || 0) + .32], .15, { size: 60 }); return g;
}
export function geniza(Wd, o) {   // a wooden box with its lid open (old pages are laid inside)
  const g = new THREE.Group(); g.position.set(...o.pos); g.rotation.y = o.ry || 0; Wd.add(g); const w = .66, d = .44, h = .26, T = .035, wd = '#a06a38', wi = '#5a3a1e';
  g.add(box(w, T, d, wd, { pos: [0, T / 2, 0], ink: false })); g.add(box(w - .02, .004, d - .02, wi, { pos: [0, T + .002, 0], ink: false }));
  g.add(box(w, h, T, wd, { pos: [0, h / 2, d / 2 - T / 2], ink: false })); g.add(box(w, h, T, wd, { pos: [0, h / 2, -d / 2 + T / 2], ink: false })); for (const sx of [-1, 1]) g.add(box(T, h, d, wd, { pos: [sx * (w / 2 - T / 2), h / 2, 0], ink: false }));
  g.add(box(w + .02, .02, .02, '#d2a040', { pos: [0, h, d / 2], ink: false }));
  const lid = new THREE.Group(); lid.position.set(0, h, -d / 2); lid.rotation.x = -1.75; g.add(lid); lid.add(box(w + .02, .03, d, '#b87a42', { pos: [0, 0, d / 2], ink: false })); lid.add(box(w - .06, .004, d - .06, wi, { pos: [0, -.017, d / 2], ink: false })); return g;
}

// ---------------- rooms ----------------
function planksTex() { const r = rng(31); return canvasTex(256, 256, (g, w, h) => { const cols = ['#c8955a', '#bd8a50', '#d2a066', '#b58248'];
  for (let y = 0; y < h; y += 32) { let x = -r() * 120; while (x < w) { const bw = 120 + r() * 140; g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(x, y, bw, 32); g.fillStyle = 'rgba(80,45,15,.4)'; g.fillRect(x, y, 2, 32); x += bw; } g.fillStyle = 'rgba(80,45,15,.45)'; g.fillRect(0, y, w, 2); } }, [8, 6]); }
function spineTex(seed) { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#6a4224'; g.fillRect(0, 0, w, h); const rows = 6, rh = (h - 16) / rows, pal = ['#7a1f2a', '#1f3b6b', '#2f5a3a', '#6a4426', '#6b3a52', '#3a3340', '#8a6a2a', '#9a4a2a'];
  for (let i = 0; i < rows; i++) { const y0 = 8 + i * rh; g.fillStyle = '#3a2210'; g.fillRect(10, y0, w - 20, rh - 10); let x = 12; while (x < w - 16) { const bw = 9 + r() * 15, bh = (rh - 14) * (.72 + r() * .26); if (x + bw > w - 12) break; g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x, y0 + rh - 10 - bh, bw - 1.5, bh); g.fillStyle = '#e3bd5a'; g.fillRect(x + 1, y0 + rh - 10 - bh + bh * .12, bw - 3.5, 2.2); x += bw; } g.fillStyle = '#8a5a30'; g.fillRect(0, y0 + rh - 10, w, 10); } }); }
export function shelf(Wd, x, z, ry, w) { const wm = toon('#8a5a30'), m = new THREE.Mesh(new THREE.BoxGeometry(w || 3.6, 3.4, .45), [wm, wm, wm, wm, toon(0xffffff, { map: spineTex(Math.round(x * 7 + z * 3 + 5)) }), wm]); m.position.set(x, 1.7, z); m.rotation.y = ry || 0; m.castShadow = true; Wd.add(m); return m; }
export function lamp(Wd, x, y, z, light) {
  Wd.add(cyl(.01, .01, 3.9 - y, '#3a2a1a', { pos: [x, y + (3.9 - y) / 2, z], ink: false })); const m = new THREE.Mesh(new THREE.SphereGeometry(.17, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffe6a8 })); m.position.set(x, y, z); Wd.add(m);
  const s = glowSprite(0xffcf80, 2.4, .5); s.position.set(x, y, z); Wd.add(s); let L = null; if (light) { L = new THREE.PointLight(0xffcc80, light, 13, 1.5); L.position.set(x, y - .2, z); Wd.add(L); } return L;
}
export function room(Wd, o) {
  const W = o.W, Dp = o.D, H = o.H, T = .4, wc = o.wall || 0xf4e6c8, holes = o.holes || {};
  const seg = (ax, c, a0, a1, y0, y1) => { if (a1 - a0 < 1e-3 || y1 - y0 < 1e-3) return; const w = a1 - a0, h = y1 - y0, m = (a0 + a1) / 2, ym = (y0 + y1) / 2; Wd.add(ax === 'x' ? box(w, h, T, wc, { pos: [m, ym, c], ink: false }) : box(T, h, w, wc, { pos: [c, ym, m], ink: false })); };
  const wall = (ax, c, L, hs) => { hs = (hs || []).slice().sort((a, b) => a.c0 - b.c0); let cur = -L / 2; for (const h of hs) { seg(ax, c, cur, h.c0, 0, H); seg(ax, c, h.c0, h.c1, 0, h.y0); seg(ax, c, h.c0, h.c1, h.y1, H); cur = h.c1; } seg(ax, c, cur, L / 2, 0, H);
    for (const h of hs) { const m = (h.c0 + h.c1) / 2, w = h.c1 - h.c0, hh = h.y1 - h.y0, fw = '#a8743f';
      const fb = (a, b, c2, d2, e) => Wd.add(box(a, b, c2, fw, { pos: ax === 'x' ? [d2, e, c] : [c, e, d2], ink: false }));
      if (ax === 'x') { fb(w + .1, .1, T + .1, m, h.y1); fb(w + .1, .1, T + .1, m, h.y0); fb(.1, hh, T + .1, h.c0, (h.y0 + h.y1) / 2); fb(.1, hh, T + .1, h.c1, (h.y0 + h.y1) / 2); Wd.add(box(w + .3, .08, .3, '#cdb88e', { pos: [m, h.y0 - .04, c + Math.sign(c) * (T / 2 + .1)], ink: false })); }
      else { Wd.add(box(T + .1, .1, w + .1, fw, { pos: [c, h.y1, m], ink: false })); Wd.add(box(T + .1, .1, w + .1, fw, { pos: [c, h.y0, m], ink: false })); Wd.add(box(T + .1, hh, .1, fw, { pos: [c, (h.y0 + h.y1) / 2, h.c0], ink: false })); Wd.add(box(T + .1, hh, .1, fw, { pos: [c, (h.y0 + h.y1) / 2, h.c1], ink: false })); }
      if (h.pane) { const pm = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: .55 })); if (ax === 'x') pm.position.set(m, (h.y0 + h.y1) / 2, c); else { pm.position.set(c, (h.y0 + h.y1) / 2, m); pm.rotation.y = PI / 2; } Wd.add(pm); } } };
  wall('x', Dp / 2 + T / 2, W + 2 * T, holes.front); wall('x', -Dp / 2 - T / 2, W + 2 * T, holes.back); wall('z', W / 2 + T / 2, Dp, holes.right); wall('z', -W / 2 - T / 2, Dp, holes.left);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, Dp), toon(0xffffff, { map: planksTex() })); fl.rotation.x = -PI / 2; fl.position.y = .012; fl.receiveShadow = true; Wd.add(fl);
  Wd.add(box(W + 2 * T, .3, Dp + 2 * T, '#efe0bf', { pos: [0, H + .15, 0], ink: false, cast: false }));
  for (let x = -W / 2 + 1; x < W / 2; x += 2.2) Wd.add(box(.26, .28, Dp, '#7a4a2a', { pos: [x, H - .14, 0], ink: false, cast: false }));
  const ws = (ax, c, L, hs) => { if (hs && hs.length) return; Wd.add(ax === 'x' ? box(L, 1.0, .05, '#b98a52', { pos: [0, .5, c], ink: false }) : box(.05, 1.0, L, '#b98a52', { pos: [c, .5, 0], ink: false })); };
  ws('x', Dp / 2 - .03, W, holes.front); ws('x', -Dp / 2 + .03, W, holes.back); ws('z', W / 2 - .03, Dp, holes.right); ws('z', -W / 2 + .03, Dp, holes.left);
  if (o.roof) { const a = .38, hz = Dp / 2 + T + .35, sl = hz / Math.cos(a), rise = hz * Math.tan(a);
    for (const s of [-1, 1]) Wd.add(box(W + 1.2, .25, sl, '#d98a5e', { pos: [0, H + .3 + rise / 2, s * hz / 2], rot: [s * a, 0, 0] })); Wd.add(box(W + 1.3, .28, .3, '#c4724a', { pos: [0, H + .3 + rise + .08, 0], ink: false }));
    const tri = new THREE.Shape(); tri.moveTo(-Dp / 2 - T, 0); tri.lineTo(Dp / 2 + T, 0); tri.lineTo(0, rise); for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: .3, bevelEnabled: false }), toon('#f4e6c8')); m.rotation.y = PI / 2; m.position.set(s * (W / 2 + T) - (s > 0 ? 0 : .3), H + .3, 0); Wd.add(m); } }
}
// the yeshiva building (shots 1 and 15): 8 x 6 interior, big opening in the front (+z) wall
export function yeshiva(Wd) {
  room(Wd, { W: 8, D: 6, H: 3.6, roof: true, holes: { front: [{ c0: -1.6, c1: 1.6, y0: .95, y1: 2.7 }], left: [{ c0: -1.6, c1: 1.6, y0: 1.2, y1: 2.8, pane: true }], right: [{ c0: -1.6, c1: 1.6, y0: 1.2, y1: 2.8, pane: true }] } });
  shelf(Wd, -2.2, -2.75, 0, 3.4); shelf(Wd, 2.2, -2.75, 0, 3.4); shelf(Wd, -3.75, -1.5, PI / 2, 2.6);
  Wd.add(box(1.1, 2.1, .14, '#7a5030', { pos: [-3.0, 1.05, 3.5] })); lamp(Wd, -2.2, 2.8, 0, 7); lamp(Wd, 2.2, 2.8, 0, 7);
}
