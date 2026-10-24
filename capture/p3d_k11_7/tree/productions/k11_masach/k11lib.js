// k11lib.js - building blocks for the k11 film ("the screen that hides the King"). Walnut and honey, cream parchment, deep plum, amber. Everything is a function of t only.
// Everything is a function of t only (rng(seed) for randomness).
import { THREE, world, box, cyl, ball, toon, ink, canvasTex, label, person, rng, clamp, lerp, ease, prog, D, cloud } from '../../lib/stage3d.js';
import { POSES } from '../../lib/figure3d.js';
import { fbm, cine, route } from '../azamra342/road.js';
export { fbm, cine, route, POSES };
export const PI = Math.PI, sm = ease.sm;

// ---------------- palette ----------------
export const SR = '#d9cdbd', SR2 = '#c5b6a2', TQ = '#2e3b7c', TQ2 = '#5566a8', WAL = '#4d4829', WAL2 = '#6e6636', COP = '#d9aa58', IVORY = '#f4e8cc', HONEY = '#f2c26b', INDIGO = '#2a3470';
// ---- dawn: p = 0 (deep indigo, before sunrise) .. 1 (full golden sunrise). Light does the colour work: materials stay ivory/olive. ----
const DW = [
  { skyTop: 0x1f2a66, skyBottom: 0x5a5fa6, sun: .30, sunColor: 0x9fb0f0, hemi: 1.25, hemiSky: 0x8892dc, hemiGround: 0x4a4668, el: 4 },
  { skyTop: 0x3d4c98, skyBottom: 0xa88ac0, sun: .55, sunColor: 0xd8a8d0, hemi: 1.3, hemiSky: 0xb0a8e0, hemiGround: 0x64506a, el: 8 },
  { skyTop: 0x7a80c0, skyBottom: 0xf4a890, sun: 1.0, sunColor: 0xffb89a, hemi: 1.35, hemiSky: 0xffd6c8, hemiGround: 0x906060, el: 13 },
  { skyTop: 0xb4b6dc, skyBottom: 0xffd09a, sun: 1.5, sunColor: 0xffd3a0, hemi: 1.45, hemiSky: 0xffe8cc, hemiGround: 0xbc8c68, el: 22 },
  { skyTop: 0xcad4f2, skyBottom: 0xffe6b4, sun: 1.9, sunColor: 0xffe4b4, hemi: 1.55, hemiSky: 0xfff2dc, hemiGround: 0xd8aa7a, el: 34 }];
const _c = new THREE.Color();
const mixHex = (a, b, k) => _c.set(a).lerp(new THREE.Color(b), k).getHex();
export function dawnCfg(p, o) {
  p = clamp(p, 0, 1) * 4; const i = Math.min(3, Math.floor(p)), k = p - i, A = DW[i], B = DW[i + 1], M = {};
  for (const key of ['skyTop', 'skyBottom', 'sunColor', 'hemiSky', 'hemiGround']) M[key] = mixHex(A[key], B[key], k);
  const el = lerp(A.el, B.el, k) * Math.PI / 180, az = (o && o.az !== undefined) ? o.az : -2.6;
  return Object.assign({ skyTop: M.skyTop, skyBottom: M.skyBottom, fogColor: M.skyBottom, fogNear: 70, fogFar: 430, sun: lerp(A.sun, B.sun, k), sunColor: M.sunColor, hemi: lerp(A.hemi, B.hemi, k), hemiSky: M.hemiSky, hemiGround: M.hemiGround,
    sunPos: [Math.sin(az) * Math.cos(el) * 80, Math.sin(el) * 80, Math.cos(az) * Math.cos(el) * 80], shadowExt: 34, skyR: 1700, paneColor: mixHex(A.skyBottom, B.skyBottom, k) }, o || {});
}
export const SUN = dawnCfg(.3);
export const INT = dawnCfg(.3, { fogNear: 60, fogFar: 300, shadowExt: 16, skyR: 900 });

export function sunWorld(o) {
  o = o || {}; const Wd = world(Object.assign({}, SUN, o)), dv = new THREE.Vector3(); Wd.dir = new THREE.Vector3(...(o.sunPos || SUN.sunPos)).normalize();
  Wd.on((t, cam) => { if (Wd.sunFn) Wd.sunFn(t, Wd); Wd.sky.position.copy(cam.position); cam.getWorldDirection(dv);
    let k = dv.y < -.08 ? cam.position.y / -dv.y : 50; k = clamp(k, 8, 80); const tx = cam.position.x + dv.x * k, tz = cam.position.z + dv.z * k;
    Wd.sun.target.position.set(tx, 0, tz); Wd.sun.position.set(tx + Wd.dir.x * 70, Wd.dir.y * 70, tz + Wd.dir.z * 70); });
  return Wd;
}

// ---------------- characters ----------------
export const RAV = { coat: '#1d1d24', beard: '#a7a199', beardLen: .55, hat: 'kippa', hatColor: '#101014', skin: '#efcfb0', glasses: true };
export const EVED = { coat: '#5a3a24', beard: '#6a4528', beardLen: .05, hat: 'kippa', hatColor: '#101014', skin: '#efcfb0', pants: '#3a2c24' };
export const MASTER = { coat: '#1d2c4f', beard: '#b9b5ae', beardLen: .7, hat: 'kippa', hatColor: '#101014', skin: '#e9c9a8', pants: '#1b1d24' };
export const BACHUR = { coat: '#17171d', hat: 'kippa', hatColor: '#101014', beard: false, beardLen: 0, skin: '#f0d2b4', pants: '#1b1d24' };
const COATS = ['#17171d', '#1f2430', '#2a2230', '#202a24', '#26262c', '#2d2420'], SKINS = ['#efcfb0', '#f0d2b4', '#e8c3a0', '#f2d6bc'], BEARDS = ['#2a1c14', '#8d8780', '#3a2a20', '#1c1612'];
export const manN = i => Object.assign({}, BACHUR, { coat: COATS[i % 6], skin: SKINS[i % 4] }, i % 3 === 0 ? { beard: BEARDS[i % 4], beardLen: .5 } : {});
const LIN = ['#c9a98a', '#b89574', '#d3b799', '#a98866'];
export const workerN = i => ({ coat: LIN[i % 4], hat: 'kippa', hatColor: '#6a4a38', beard: BEARDS[i % 4], beardLen: i % 2 ? .4 : 0, skin: SKINS[(i + 2) % 4], pants: '#7a5c46' });

// quantized dynamic poses (the engine blends them over ~0.3 s)
for (let i = 0; i <= 10; i++) {
  POSES['bow' + i] = { head: [i * .055, 0, 0], chest: [i * .014, 0, 0] };
  POSES['slump' + i] = { head: [i * .05, 0, i * .01], chest: [i * .035, 0, 0], armA: [i * .01, 0, -i * .02], armB: [i * .01, 0, i * .02] };
  POSES['hit' + i] = { armB: [-.95, 0, .12], foreB: [-.35 - i * .2, 0, 0], armA: [-.5, 0, -.2], foreA: [-.9, -.3, 0], head: [.14, 0, 0], chest: [.08, 0, 0] };
}
POSES.lookup = { head: [-.45, 0, 0], chest: [-.06, 0, 0] };
POSES.lean = { chest: [.05, 0, -.16], head: [.1, .15, -.08] };
POSES.read = { head: [.2, 0, 0], chest: [.05, 0, 0], armA: [-.55, 0, -.1], foreA: [-.85, -.3, 0], armB: [-.55, 0, .1], foreB: [-.85, .3, 0] };
POSES.eat = { armB: [-.35, 0, .15], foreB: [-2.2, -.25, 0], fist: { B: .3 }, head: [.06, 0, 0] };

export const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const EFF = .95;
export const chestPos = (pos, facing, o) => { o = o || {}; const s = (o.scale || 1) * EFF, y = (1.25 - (o.sit ? .43 : 0)) * s; return [pos[0] + Math.sin(facing) * .13 * s, (pos[1] || 0) + y, pos[2] + Math.cos(facing) * .13 * s]; };
export const lbl = (Wd, text, pos, h, o) => label(Wd, text, Object.assign({ pos, height: h || .3, bg: 'rgba(24,30,78,.9)', color: '#ffecc0' }, o || {}));

const _v = new THREE.Vector3();
export const boneAt = (P, name) => () => { if (!P.figure) return [0, 1, 0]; P.group.updateMatrixWorld(true); P.figure.bones[name].getWorldPosition(_v); return [_v.x, _v.y, _v.z]; };
export function attach(Wd, P, boneName, obj, pos, rot) {   // mount an object in a hand (once the figure exists)
  let done = false; obj.visible = true;
  Wd.on(() => { if (done || !P.figure) return; done = true; const b = P.figure.bones[boneName], h = (b.userData && b.userData.hand) || b; h.add(obj); obj.position.set(...(pos || [0, -.08, 0])); if (rot) obj.rotation.set(...rot); });
}

// ---------------- glow / motes ----------------
let GT = null;
export function glowTex() { if (!GT) GT = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); return GT; }
export function glowSprite(color, size, opacity, o) {
  o = o || {};
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, blending: o.normal ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, depthTest: o.depthTest !== false, transparent: true, opacity: opacity === undefined ? 1 : opacity, fog: false }));
  s.scale.set(size, size, 1); s.renderOrder = o.order || 6; return s;
}
export function sunGlow(Wd, pos, size, op, color) { const g = glowSprite(color || 0xffc79a, size, op === undefined ? .8 : op); g.position.set(...pos); Wd.add(g); const c = glowSprite(0xfff1d8, size * .3, .9); c.position.set(...pos); Wd.add(c); return g; }
export function skyGlows(Wd, dir, big) {   // sunset glow on the horizon in the sun direction and straight ahead (-z)
  const d = dir.clone().normalize(); sunGlow(Wd, [d.x * 900, Math.max(60, d.y * 900), d.z * 900], big || 1100, .75);
  const h = glowSprite(0xffb48a, 1400, .45); h.position.set(0, 40, -900); Wd.add(h);
}
export function motes(Wd, n, o) {
  o = o || {}; const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: glowTex() } }, transparent: true, depthWrite: false, depthTest: o.depthTest !== false, blending: o.normal ? THREE.NormalBlending : THREE.AdditiveBlending,
    vertexShader: 'attribute float size; attribute vec3 color; varying vec3 vC; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(size*projectionMatrix[1][1]*540.0/max(gl_Position.w,0.01),0.0,300.0); }',
    fragmentShader: 'uniform sampler2D map; varying vec3 vC; void main(){ float a=texture2D(map,gl_PointCoord).a; gl_FragColor=vec4(vC,a); }' });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 7; Wd.add(pts);
  return { n, set(i, x, y, z, s, r, g, b) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; size[i] = s; col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b; }, hide(i) { size[i] = 0; },
    done() { geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.attributes.size.needsUpdate = true; } };
}

// THE INNER LIGHT: a small warm golden-white glow in the chest. getPos(t) -> [x,y,z]; getL(t) -> 0..1.8
export function innerLight(Wd, getPos, getL, o) {
  o = o || {}; const halo = glowSprite(0xffc860, 1, .9, { depthTest: false, order: 6 }), core = glowSprite(0xfff4d0, 1, 1, { depthTest: false, order: 7 });
  Wd.add(halo); Wd.add(core); let L = null; if (o.light) { L = new THREE.PointLight(0xffc870, 0, o.dist || 6, 1.5); Wd.add(L); }
  const k = o.k || 1;
  Wd.on(t => { const p = getPos(t), l = getL(t), fl = 1 + .05 * Math.sin(t * 3.1 + (o.seed || 0)); halo.visible = core.visible = l > .02; halo.position.set(...p); core.position.set(...p);
    halo.scale.setScalar((.1 + .2 * Math.min(l, 1.8)) * k * fl); halo.material.opacity = Math.min(.5, .1 + .22 * l); core.scale.setScalar((.045 + .08 * Math.min(l, 1.8)) * k * fl); core.material.opacity = Math.min(.55, .15 + .3 * l);
    if (L) { L.position.set(p[0], p[1] + .05, p[2]); L.intensity = l * (o.power || 3) * fl; } });
}

// THE GOLDEN BEAM: ONE broad warm column from above. getPos(t)->[x,y,z] ; getA(t)->0..1
let BT = null;
export function beam(Wd, getPos, getA, o) {
  o = o || {}; const H = o.h || 34, r = o.r || 1.15, g = new THREE.Group(); Wd.add(g);
  if (!BT) BT = canvasTex(8, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.6, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,.55)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const mk = (r0, col, op) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0 * 1.7, r0, H, 32, 1, true), new THREE.MeshBasicMaterial({ map: BT, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.y = H / 2; m.userData.op = op; m.renderOrder = 4; g.add(m); return m; };
  const a = mk(r, 0xffcf80, .26), b = mk(r * .55, 0xfff0c6, .3);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(r * 1.5, 32), new THREE.MeshBasicMaterial({ map: glowTex(), color: 0xffd890, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); pool.rotation.x = -PI / 2; pool.position.y = .06; g.add(pool);
  const top = glowSprite(0xffe2a0, r * 9, .5); top.position.y = H; g.add(top);
  Wd.on(t => { const p = getPos(t), k = getA(t); g.visible = k > .01; g.position.set(p[0], p[1] || 0, p[2]); for (const m of [a, b]) m.material.opacity = m.userData.op * k * (.93 + .07 * Math.sin(t * 2.1)); pool.material.opacity = .8 * k; top.material.opacity = .5 * k; });
  return g;
}

// THREADS: thin grey-violet strings. o.n, o.anchor(i,t)->[x,y,z] (top), o.target(i,t)->[x,y,z], o.a(i,t) attach 0..1, o.d(t) dissolve 0..1
export function threadSet(Wd, o) {
  const n = o.n, r = o.r || .012, UP = new THREE.Vector3(0, 1, 0), geo = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true), ms = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: o.color || 0x9988bf, transparent: true, opacity: .95 })); m.renderOrder = 3; Wd.add(m); ms.push(m); }
  const SP = 10, sp = motes(Wd, n * SP), A = new THREE.Vector3(), E = new THREE.Vector3(), dir = new THREE.Vector3();
  Wd.on(t => { const d = o.d ? o.d(t) : 0;
    for (let i = 0; i < n; i++) { const a0 = o.anchor(i, t), T = o.target(i, t), a = o.a ? o.a(i, t) : 1, m = ms[i];
      if (a < .005 || d >= 1) { m.visible = false; for (let k = 0; k < SP; k++) sp.hide(i * SP + k); continue; }
      A.set(...a0); E.set(a0[0] + (T[0] - a0[0]) * a, a0[1] + (T[1] - a0[1]) * a, a0[2] + (T[2] - a0[2]) * a); dir.subVectors(E, A); const len = dir.length();
      m.visible = d < .98; m.position.copy(A).addScaledVector(dir, .5); const rr = r * (1 - .7 * d); m.scale.set(rr, Math.max(len, .001), rr); m.quaternion.setFromUnitVectors(UP, dir.clone().divideScalar(Math.max(len, 1e-4))); m.material.opacity = .95 * (1 - d);
      for (let k = 0; k < SP; k++) { if (d <= 0 || d >= 1) { sp.hide(i * SP + k); continue; } const s = (k + .5) / SP, f = Math.sin(PI * d), j = Math.sin(i * 7.3 + k * 3.1);
        sp.set(i * SP + k, A.x + dir.x * s + j * .25 * d, A.y + dir.y * s + d * (.5 + .4 * ((k * 5) % 3)), A.z + dir.z * s + Math.cos(k * 2.3 + i) * .25 * d, .1 * f, 1, .86, .5); } }
    sp.done(); });
}

// ---------------- terrain / town ----------------
export function terrain(Wd, o) {
  const S = o.size || 600, N = o.N || 140, g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-PI / 2); if (o.cx || o.cz) g.translate(o.cx || 0, 0, o.cz || 0);
  const p = g.attributes.position, cols = new Float32Array(p.count * 3);
  const A = o.A || [.86, .6, .5], B = o.B || [.78, .5, .43], C = o.C || [.8, .72, .5];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = o.h(x, z), n = fbm(x * .05 + 9, z * .05 + 4), m = fbm(x * .2 + 2, z * .2 + 8);
    let c = A.map((v, k) => lerp(v, B[k], clamp((n - .4) * 2.5, 0, 1))); c = c.map((v, k) => lerp(v, C[k], clamp((m - .55) * 3, 0, .6))); if (o.col) c = o.col(x, z, h, c);
    p.setY(i, h); cols[i * 3] = c[0] * (.94 + .1 * m); cols[i * 3 + 1] = c[1] * (.94 + .1 * m); cols[i * 3 + 2] = c[2] * (.94 + .1 * m); }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, toon(0xffffff, { vertexColors: true })); m.receiveShadow = true; Wd.add(m); return { hAt: o.h, mesh: m };
}
export function groundPlane(Wd, color, y) { const m = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), toon(color || 0xe0ab94)); m.rotation.x = -PI / 2; m.position.y = y === undefined ? -.03 : y; m.receiveShadow = true; Wd.add(m); return m; }
const WALLS = ['#e6dcc8', '#dcd0ba', '#ece2cc', '#d4c8b0', '#e2d6c0'];
export function house8(Wd, o) {
  const w = o.w || 5, d = o.d || 4.5, h = o.h || 3.4, g = new THREE.Group(); g.position.set(o.x, o.y || 0, o.z); g.rotation.y = o.ry || 0; Wd.add(g);
  g.add(box(w, h, d, o.wall || WALLS[(o.i || 0) % 5], { pos: [0, h / 2, 0], inkW: .02 }));
  g.add(box(w + .24, .2, d + .24, o.roof || '#a8998a', { pos: [0, h + .1, 0] }));
  if (o.tank) g.add(cyl(.4, .4, .7, '#bfc8c4', { pos: [-w * .25, h + .55, -d * .2] }));
  const wm = o.glow ? new THREE.MeshBasicMaterial({ color: 0xffcf86 }) : toon('#4d6f86');
  for (const sx of [-1, 1]) { const win = new THREE.Mesh(new THREE.BoxGeometry(.5, .7, .08), wm); win.position.set(sx * w * .27, h * .62, d / 2 + .02); g.add(win);
    g.add(box(.22, .72, .06, o.sh || TQ, { pos: [sx * w * .27 - .36, h * .62, d / 2 + .04], ink: false })); g.add(box(.22, .72, .06, o.sh || TQ, { pos: [sx * w * .27 + .36, h * .62, d / 2 + .04], ink: false })); }
  g.add(box(.85, 1.7, .1, o.door || TQ, { pos: [0, .85, d / 2 + .04], ink: false }));
  if (o.awn) g.add(box(1.6, .08, .7, o.awn, { pos: [0, 2.0, d / 2 + .35], rot: [.25, 0, 0], ink: false }));
  return g;
}
// a hill town: houses on the slope (z < -10 rising), on both sides of a plateau. skip(x,z) excludes areas.
export function townOn(Wd, hAt, o) {
  const r = rng(o.seed || 3), n = o.n || 40, a = o.area || [-60, 60, -75, -12];
  for (let i = 0; i < n; i++) { const x = a[0] + r() * (a[1] - a[0]), z = a[2] + r() * (a[3] - a[2]); if (o.skip && o.skip(x, z)) continue;
    house8(Wd, { x, y: hAt(x, z) - .1, z, ry: (r() - .5) * .5 + (x > 0 ? -.3 : .3), w: 4 + r() * 3, d: 4 + r() * 2.5, h: 2.8 + r() * 2.6, i, glow: r() < .35, tank: r() < .25, awn: r() < .2 ? (r() < .5 ? TQ : '#e07a6a') : null }); }
}
export function ridge(Wd, o) {   // distant lilac mountains along a line
  const r = rng(o.seed || 4), g = new THREE.Group(); Wd.add(g);
  for (let i = 0; i < (o.n || 16); i++) { const x = o.x0 + (o.x1 - o.x0) * (i / ((o.n || 16) - 1)) + (r() - .5) * 20, z = o.z0 + (o.z1 - o.z0) * (i / ((o.n || 16) - 1)) + (r() - .5) * 20, hh = (o.h || 60) * (.5 + r()), rr = hh * (1.1 + r() * .7);
    const m = new THREE.Mesh(new THREE.ConeGeometry(rr, hh, 7), toon(r() < .5 ? '#b99bc9' : '#cc9fb9')); m.position.set(x, hh / 2 - 2, z); m.rotation.y = r() * 3; g.add(m); }
  return g;
}
export function skyClouds(Wd, n, seed) { for (let i = 0; i < n; i++) { const a = i / n * PI * 2 + seed, rr = 330 + (i % 3) * 40; Wd.add(cloud({ seed: seed + i, size: 9, color: 0xe6d6f4, inkColor: 0xc3a8dc, pos: [Math.sin(a) * rr, 70 + (i % 4) * 14, Math.cos(a) * rr], puffs: 6, cast: false })); } }
export function trees8(Wd, hAt, o) {   // simple olive / pomegranate-like trees
  const r = rng(o.seed || 5), a = o.area, G = ['#9aa45e', '#8a9a55', '#a8a864', '#c08a58'];
  for (let i = 0; i < (o.n || 20); i++) { const x = a[0] + r() * (a[1] - a[0]), z = a[2] + r() * (a[3] - a[2]); if (o.skip && o.skip(x, z)) continue; const y = hAt(x, z), s = .8 + r() * .7;
    Wd.add(cyl(.12 * s, .17 * s, 1.5 * s, '#6e4a30', { pos: [x, y + .75 * s, z], ink: false })); Wd.add(ball(1.2 * s, G[i % 4], { pos: [x, y + 1.9 * s, z], scale: [1, .8, 1], ink: false })); }
}

// ---------------- doors, courtyard ----------------
let SPT = null;
export function doorWall(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); g.rotation.y = o.ry || 0; Wd.add(g);
  const W = o.W || 8, H = o.H || 3.6, dw = 1.35, dh = 2.45, T = .5, dx = o.doorX || 0, wall = o.wall || SR, L = -W / 2, R = W / 2, a = dx - dw / 2, b = dx + dw / 2;
  g.add(box(a - L, H, T, wall, { pos: [(L + a) / 2, H / 2, 0], inkW: .02 })); g.add(box(R - b, H, T, wall, { pos: [(b + R) / 2, H / 2, 0], inkW: .02 })); g.add(box(dw, H - dh, T, wall, { pos: [dx, dh + (H - dh) / 2, 0], inkW: .02 }));
  g.add(box(W + .2, .2, T + .2, SR2, { pos: [0, H + .1, 0] }));
  g.add(box(.1, dh, T + .08, TQ2, { pos: [a + .05, dh / 2, 0], ink: false })); g.add(box(.1, dh, T + .08, TQ2, { pos: [b - .05, dh / 2, 0], ink: false })); g.add(box(dw, .1, T + .08, TQ2, { pos: [dx, dh - .05, 0], ink: false }));
  g.add(box(dw + .5, .12, T + .9, '#cfa088', { pos: [dx, .06, .2] }));
  const piv = new THREE.Group(); piv.position.set(a + .1, 0, .02); g.add(piv); const lw = dw - .2;
  piv.add(box(lw, dh - .12, .09, TQ, { pos: [lw / 2, (dh - .12) / 2, 0], inkW: .012 }));
  for (const [py, ph] of [[.62, .8], [1.62, .8]]) piv.add(box(lw * .66, ph, .035, TQ2, { pos: [lw / 2, py, .06], ink: false }));
  piv.add(ball(.045, '#d8a24a', { pos: [lw - .12, 1.1, .08], ink: false }));
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(dw, dh), new THREE.MeshBasicMaterial({ color: 0xffe2aa, fog: false })); bg.position.set(dx, dh / 2, -T / 2 + .02); if (o.bgPlane !== false) g.add(bg);
  if (!SPT) SPT = canvasTex(64, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(w * .3, 0); c.lineTo(w * .7, 0); c.lineTo(w, h); c.lineTo(0, h); c.fill(); });
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(dw * 2.6, 3.4), new THREE.MeshBasicMaterial({ map: SPT, color: 0xffd48a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, fog: false })); spill.rotation.x = -PI / 2; spill.position.set(dx, .14, T / 2 + 1.8); g.add(spill);
  const mz = new THREE.Group(); mz.position.set(b + .13, 1.62, T / 2 + .05); mz.rotation.z = -.12; g.add(mz);
  mz.add(box(.075, .24, .06, '#b4713a', { inkW: .006 })); mz.add(box(.03, .17, .065, '#f3d9a0', { ink: false }));
  const mg = glowSprite(0xffcf80, .9, .6); mg.position.set(b + .13, 1.62, T / 2 + .12); g.add(mg);
  Wd.on(t => { const op = o.open ? o.open(t) : 0; piv.rotation.y = op * 1.75; bg.visible = op > .02; spill.material.opacity = .6 * op; const gl = o.mez ? o.mez(t) : 1; mg.material.opacity = (.45 + .2 * Math.sin(t * 2.2)) * gl; mg.scale.setScalar(.9 * (1 + .1 * Math.sin(t * 2.2))); });
  return { g, mezWorld: () => g.localToWorld(new THREE.Vector3(b + .13, 1.62, T / 2 + .1)), dx, dw, T };
}
function tileTex() { const r = rng(21); return canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e6b9a2'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = r() < .5 ? '#dfae97' : '#ebc2ab'; g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); if ((x + y) % 4 === 1) { g.fillStyle = '#38b8ae'; g.fillRect(x * 64 + 24, y * 64 + 24, 16, 16); } }
  g.strokeStyle = 'rgba(120,70,50,.4)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, [7, 6]); }
export function lamp(Wd, x, y, z, light, o) {   // hanging copper lamp
  o = o || {}; const top = o.top || 3.9; Wd.add(cyl(.01, .01, top - y, '#3a2a1a', { pos: [x, y + (top - y) / 2, z], ink: false }));
  Wd.add(cyl(.05, .19, .17, COP, { pos: [x, y + .08, z] })); const m = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 9), new THREE.MeshBasicMaterial({ color: 0xffe6a8 })); m.position.set(x, y - .02, z); Wd.add(m);
  const s = glowSprite(0xffcf80, o.glow || 2.2, .5); s.position.set(x, y - .05, z); Wd.add(s); let L = null; if (light) { L = new THREE.PointLight(0xffcc80, light, 13, 1.5); L.position.set(x, y - .3, z); Wd.add(L); } return L;
}
export function courtyard(Wd, o) {   // x in [-7,7], z in [-6,6]; back wall (z=-6) with THE TURQUOISE DOOR at x=3.5; shtender spot near (-3,0,-2)
  o = o || {};
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), toon(0xffffff, { map: tileTex() })); fl.rotation.x = -PI / 2; fl.position.y = .1; fl.receiveShadow = true; Wd.add(fl);
  Wd.add(box(14.4, .2, 12.4, '#d3a089', { pos: [0, 0, 0], ink: false }));
  const door = doorWall(Wd, { pos: [0, 0, -6], W: 14.4, H: 4.2, doorX: 3.5, open: o.open, mez: o.mez });
  // left wall with turquoise shutters
  Wd.add(box(.5, 4.0, 12.4, SR, { pos: [-7.1, 2, 0], inkW: .02 })); Wd.add(box(.7, .2, 12.6, SR2, { pos: [-7.1, 4.1, 0] }));
  for (const z of [-3.2, 1.2]) { Wd.add(box(.1, 1.4, 1.0, '#ffd08a', { pos: [-6.82, 2.2, z], ink: false, cast: false })); Wd.add(box(.12, 1.5, .35, TQ, { pos: [-6.8, 2.2, z - .7], ink: false })); Wd.add(box(.12, 1.5, .35, TQ, { pos: [-6.8, 2.2, z + .7], ink: false })); }
  // right wall (low) and front low walls with a gate
  Wd.add(box(.5, 2.4, 12.4, SR, { pos: [7.1, 1.2, 0], inkW: .02 })); Wd.add(box(.7, .18, 12.6, SR2, { pos: [7.1, 2.45, 0] }));
  for (const sx of [-1, 1]) { Wd.add(box(5.6, 1.1, .5, SR, { pos: [sx * 4.5, .55, 6.1], inkW: .02 })); Wd.add(box(5.8, .15, .7, SR2, { pos: [sx * 4.5, 1.15, 6.1] })); }
  for (const sx of [-1, 1]) Wd.add(box(.5, 1.8, .5, SR2, { pos: [sx * 1.55, .9, 6.1] }));
  // portico along the back-left
  for (const x of [-6.2, -3.4, -.6]) Wd.add(cyl(.2, .24, 3.3, '#ebc2ab', { pos: [x, 1.65, -3.5] }));
  Wd.add(box(7.6, .28, 3.2, '#c98770', { pos: [-3.4, 3.4, -4.4], cast: true })); Wd.add(box(7.8, .12, .4, TQ, { pos: [-3.4, 3.2, -2.85], ink: false }));
  lamp(Wd, -5, 2.7, -3.2, 0, { top: 3.3 }); lamp(Wd, -1.8, 2.7, -3.2, 0, { top: 3.3 });
  // pomegranate tree, planters, bench
  Wd.add(cyl(.12, .2, 1.4, '#6e4a30', { pos: [5.2, .8, 3.2], ink: false })); for (const [dx, dy, dz, r] of [[0, 2.0, 0, 1.0], [.6, 1.7, .4, .7], [-.6, 1.8, -.3, .75]]) Wd.add(ball(r, '#9aa45e', { pos: [5.2 + dx, dy, 3.2 + dz], scale: [1, .8, 1], ink: false }));
  for (const [dx, dy, dz] of [[.5, 1.9, .8], [-.4, 2.3, .2], [.1, 1.6, -.8], [-.8, 1.7, .6]]) Wd.add(ball(.11, '#e0584c', { pos: [5.2 + dx, dy, 3.2 + dz], ink: false }));
  for (const z of [-4.2, 3.4]) { Wd.add(cyl(.34, .26, .5, TQ, { pos: [-6.3, .35, z] })); Wd.add(ball(.42, '#8aa05a', { pos: [-6.3, .85, z], scale: [1, .8, 1], ink: false })); }
  Wd.add(box(1.8, .45, .5, SR2, { pos: [-6.4, .32, -.8] }));
  return { door };
}

// ---------------- rooms (sea-blue plaster, walnut, copper) ----------------
function planks() { const r = rng(41); return canvasTex(256, 256, (g, w, h) => { const cols = ['#5e5632', '#524b2b', '#6a6238', '#4a4426'];
  for (let y = 0; y < h; y += 32) { let x = -r() * 120; while (x < w) { const bw = 120 + r() * 140; g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(x, y, bw, 32); g.fillStyle = 'rgba(30,14,4,.45)'; g.fillRect(x, y, 2, 32); x += bw; } g.fillStyle = 'rgba(30,14,4,.5)'; g.fillRect(0, y, w, 2); } }, [8, 6]); }
function spines(seed) { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#5e3a22'; g.fillRect(0, 0, w, h); const rows = 6, rh = (h - 16) / rows, pal = ['#7a1f2a', '#1f3b6b', '#2f5a3a', '#6a4426', '#6b3a52', '#3a3340', '#8a6a2a', '#9a4a2a'];
  for (let i = 0; i < rows; i++) { const y0 = 8 + i * rh; g.fillStyle = '#3a2210'; g.fillRect(10, y0, w - 20, rh - 10); let x = 12; while (x < w - 16) { const bw = 9 + r() * 15, bh = (rh - 14) * (.72 + r() * .26); if (x + bw > w - 12) break; g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x, y0 + rh - 10 - bh, bw - 1.5, bh); g.fillStyle = '#e3bd5a'; g.fillRect(x + 1, y0 + rh - 10 - bh + bh * .12, bw - 3.5, 2.2); x += bw; } g.fillStyle = '#7a4a28'; g.fillRect(0, y0 + rh - 10, w, 10); } }); }
export function shelf(Wd, x, z, ry, w) { const wm = toon(WAL2), m = new THREE.Mesh(new THREE.BoxGeometry(w || 3.6, 3.2, .45), [wm, wm, wm, wm, toon(0xffffff, { map: spines(Math.round(x * 7 + z * 3 + 5)) }), wm]); m.position.set(x, 1.6, z); m.rotation.y = ry || 0; m.castShadow = true; Wd.add(m); return m; }
export function seaRoom(Wd, o) {
  const W = o.W, Dp = o.D, H = o.H, T = .4, wc = o.wall || '#45569a', holes = o.holes || {}, skip = o.skip || [];
  const seg = (ax, c, a0, a1, y0, y1) => { if (a1 - a0 < 1e-3 || y1 - y0 < 1e-3) return; const w = a1 - a0, h = y1 - y0, m = (a0 + a1) / 2, ym = (y0 + y1) / 2; Wd.add(ax === 'x' ? box(w, h, T, wc, { pos: [m, ym, c], ink: false }) : box(T, h, w, wc, { pos: [c, ym, m], ink: false })); };
  const wall = (name, ax, c, L, hs) => { if (skip.includes(name)) return; hs = (hs || []).slice().sort((a, b) => a.c0 - b.c0); let cur = -L / 2;
    for (const h of hs) { seg(ax, c, cur, h.c0, 0, H); seg(ax, c, h.c0, h.c1, 0, h.y0); seg(ax, c, h.c0, h.c1, h.y1, H); cur = h.c1; } seg(ax, c, cur, L / 2, 0, H);
    for (const h of hs) { const m = (h.c0 + h.c1) / 2, w = h.c1 - h.c0, hh = h.y1 - h.y0, fw = WAL2;
      const fb = (a, b, c2, d2, e) => Wd.add(box(a, b, c2, fw, { pos: ax === 'x' ? [d2, e, c] : [c, e, d2], ink: false }));
      if (ax === 'x') { fb(w + .1, .1, T + .1, m, h.y1); fb(w + .1, .1, T + .1, m, h.y0); fb(.1, hh, T + .1, h.c0, (h.y0 + h.y1) / 2); fb(.1, hh, T + .1, h.c1, (h.y0 + h.y1) / 2); }
      else { Wd.add(box(T + .1, .1, w + .1, fw, { pos: [c, h.y1, m], ink: false })); Wd.add(box(T + .1, .1, w + .1, fw, { pos: [c, h.y0, m], ink: false })); Wd.add(box(T + .1, hh, .1, fw, { pos: [c, (h.y0 + h.y1) / 2, h.c0], ink: false })); Wd.add(box(T + .1, hh, .1, fw, { pos: [c, (h.y0 + h.y1) / 2, h.c1], ink: false })); }
      if (h.pane) { const pm = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ color: o.pane || 0x7a86d0, transparent: true, opacity: .95, fog: false })); if (ax === 'x') pm.position.set(m, (h.y0 + h.y1) / 2, c); else { pm.position.set(c, (h.y0 + h.y1) / 2, m); pm.rotation.y = PI / 2; } Wd.add(pm); } } };
  wall('front', 'x', Dp / 2 + T / 2, W + 2 * T, holes.front); wall('back', 'x', -Dp / 2 - T / 2, W + 2 * T, holes.back); wall('right', 'z', W / 2 + T / 2, Dp, holes.right); wall('left', 'z', -W / 2 - T / 2, Dp, holes.left);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, Dp), toon(0xffffff, { map: planks() })); fl.rotation.x = -PI / 2; fl.position.y = .012; fl.receiveShadow = true; Wd.add(fl);
  if (o.ceil !== false) { Wd.add(box(W + 2 * T, .3, Dp + 2 * T, '#e9d3b8', { pos: [0, H + .15, 0], ink: false, cast: false })); for (let x = -W / 2 + 1; x < W / 2; x += 2.2) Wd.add(box(.26, .28, Dp, WAL, { pos: [x, H - .14, 0], ink: false, cast: false })); }
  const ws = (name, ax, c, L, hs) => { if (skip.includes(name) || (hs && hs.length)) return; Wd.add(ax === 'x' ? box(L, 1.0, .05, WAL2, { pos: [0, .5, c], ink: false }) : box(.05, 1.0, L, WAL2, { pos: [c, .5, 0], ink: false })); };
  ws('front', 'x', Dp / 2 - .03, W, holes.front); ws('back', 'x', -Dp / 2 + .03, W, holes.back); ws('right', 'z', W / 2 - .03, Dp, holes.right); ws('left', 'z', -W / 2 + .03, Dp, holes.left);
}
export function table(Wd, o) { const x = o.x || 0, z = o.z || 0, w = o.w || 2, d = o.d || 1, h = o.h || .78; Wd.add(box(w, .07, d, o.col || WAL2, { pos: [x, h - .035, z], inkW: .012 }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) Wd.add(box(.08, h - .07, .08, WAL, { pos: [x + sx * (w / 2 - .1), (h - .07) / 2, z + sz * (d / 2 - .1)], ink: false })); }
export function stool(Wd, x, z, h, col) { Wd.add(box(.46, h || .46, .42, col || WAL, { pos: [x, (h || .46) / 2, z], inkW: .012 })); }
export function bread(Wd, pos) { const g = new THREE.Group(); g.position.set(...pos); Wd.add(g); g.add(cyl(.2, .17, .03, '#f6e8d4', { pos: [0, .015, 0] })); g.add(ball(1, '#d9953c', { pos: [-.06, .08, .02], scale: [.11, .055, .07], rot: [0, .4, 0] })); g.add(ball(1, '#e7ad55', { pos: [-.03, .12, -.02], scale: [.08, .035, .055], ink: false })); g.add(ball(.05, '#d8503c', { pos: [.08, .08, -.05] })); g.add(ball(.05, '#f0a23c', { pos: [.09, .075, .06] })); return g; }
export function sefer(Wd, pos, o) {   // an open book lying on a surface
  o = o || {}; const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = o.ry || 0; Wd.add(g); const w = o.w || .5, d = o.d || .34, cov = o.color || '#6a2030';
  g.add(box(w, .03, d, cov, { pos: [0, .015, 0] })); for (const s of [-1, 1]) { const pg = box(w / 2 - .03, .04, d - .04, '#f6ecd0', { pos: [s * (w / 4), .05, 0], rot: [0, 0, -s * .08], ink: false }); pg.material = toon('#f6ecd0', { emissive: 0xffd890, emissiveIntensity: o.glow || 0 }); g.add(pg); }
  g.add(box(.03, .06, d + .01, cov, { pos: [0, .04, 0], ink: false })); return g;
}
