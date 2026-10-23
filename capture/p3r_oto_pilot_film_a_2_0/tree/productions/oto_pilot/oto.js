// oto.js - shared look constants + builders for the oto_pilot film (farm, cow + calf, signs, props). Zero Hebrew: texts come from the vault by ID.
import { THREE, world, person, box, cyl, ball, mesh, toon, canvasTex, rng, ease, prog, lerp, clamp, cloud } from '../../lib/stage3d.js';
import { preloadGLBs, glbActor } from '../../lib/glb3d.js';
import * as P from '../../lib/props3d.js';

export { THREE, world, person, box, cyl, ball, mesh, toon, canvasTex, rng, ease, prog, lerp, clamp, P };

// ---------------- look constants ----------------
export const COL = { grass: 0x7cc35b, skyTop: 0x8fd3ff, skyBot: 0xfff1cf, barn: 0xc8553d, wood: 0xb9854f, woodD: 0x8a5e34, gold: 0xf2b632, ink: 0x2a2018, cream: 0xf7ecd0, green: 0x2f9e4f };
export const INK = 0x2a2018;
export const BOY = { kind: 'boy', coat: '#2b3a5a', hat: 'kippa', hatColor: '#101014', beardLen: 0, skin: '#f0d2b4', pants: '#1b1d24' };
export const MAN1 = { coat: '#5a4636', hat: 'kippa', skin: '#e6bf9a', beard: '#3a2618', beardLen: .55, pants: '#2a2a33' };
export const MAN2 = { coat: '#2f3b4c', hat: 'kippa', skin: '#f0d2b4', beard: '#6b5a48', beardLen: .7, pants: '#22242c', glasses: true };

// ---------------- boot: vault, timeline, fonts, GLBs ----------------
const loadJSON = url => new Promise((res, rej) => {
  const xhr = () => { const r = new XMLHttpRequest(); r.open('GET', url); r.onload = () => { try { res(JSON.parse(r.responseText)); } catch (e) { rej(e); } }; r.onerror = () => rej(new Error('xhr failed ' + url)); r.send(); };
  if (location.protocol === 'file:') return xhr();
  fetch(url).then(r => r.json()).then(res, xhr);
});
export async function boot() {
  const [vault, tl] = await Promise.all([loadJSON('captions_vault.json'), loadJSON('timeline.json')]);
  window.CAPTIONS_VAULT = Object.assign(window.CAPTIONS_VAULT || {}, vault);
  try { await Promise.all([document.fonts.load('700 100px Assistant'), document.fonts.load('400 40px "Secular One"')]); } catch (e) { /* fallback font */ }
  await preloadGLBs({ cow: '../../assets_net/Cow.glb', bull: '../../assets_net/Bull.glb' });
  const T = {}; for (const s of tl.shots) T[s.id] = { dur: s.dur, capAt: s.capAt, caps: s.captions.map(c => c.id) };
  return T;
}
export const txt = id => { const v = window.CAPTIONS_VAULT; return v && Object.prototype.hasOwnProperty.call(v, id) ? String(v[id]) : id; };
export const shotCfg = (T, id, build) => ({ id, dur: T[id].dur, caps: T[id].caps, capAt: T[id].capAt, build });

// ---------------- camera ----------------
// kf: keyframes [[t, pos, look, fov], ...] smooth monotone Hermite (zero velocity at both ends)
export function kf(keys) {
  const K = keys.map(k => ({ t: k[0], v: [...k[1], ...k[2], k[3] || 45] })), n = K.length;
  const dd = (i, j) => (K[i + 1].v[j] - K[i].v[j]) / (K[i + 1].t - K[i].t);
  const tn = K.map((k, i) => k.v.map((_, j) => { if (i === 0 || i === n - 1) return 0; const a = dd(i - 1, j), b = dd(i, j); return a * b > 0 ? 2 * a * b / (a + b) : 0; }));
  return t => { let i = 0; while (i < n - 2 && t > K[i + 1].t) i++; const dt = K[i + 1].t - K[i].t, s = clamp((t - K[i].t) / dt, 0, 1), s2 = s * s, s3 = s2 * s;
    const v = K[i].v.map((_, j) => (2 * s3 - 3 * s2 + 1) * K[i].v[j] + (s3 - 2 * s2 + s) * dt * tn[i][j] + (-2 * s3 + 3 * s2) * K[i + 1].v[j] + (s3 - s2) * dt * tn[i + 1][j]);
    return { pos: [v[0], v[1], v[2]], look: [v[3], v[4], v[5]], fov: v[6] }; };
}
// ground point at normalized screen x (nx in -1..1) at `dist` along the camera's horizontal forward
export function onScreen(cam, t, nx, dist) {
  const c = cam(t), fx = c.look[0] - c.pos[0], fz = c.look[2] - c.pos[2], L = Math.hypot(fx, fz) || 1, ux = fx / L, uz = fz / L;
  const hw = Math.tan((c.fov || 45) * Math.PI / 360) * (1920 / 1080) * dist;
  return [c.pos[0] + ux * dist + (-uz) * nx * hw, c.pos[2] + uz * dist + ux * nx * hw];
}

// ---------------- world ----------------
export function farm(o) {
  o = o || {};
  const Wd = world({ ground: false, skyTop: o.skyTop || COL.skyTop, skyBottom: o.skyBot || COL.skyBot, fogColor: o.fogColor || o.skyBot || COL.skyBot, fogNear: o.fogNear || 45, fogFar: o.fogFar || 190,
    hemi: o.hemi === undefined ? 1.15 : o.hemi, hemiSky: o.hemiSky || 0xfff6e4, hemiGround: o.hemiGround || 0x8a9a60, sun: o.sun === undefined ? 1.9 : o.sun, sunColor: o.sunColor || 0xfff0d0,
    sunPos: o.sunPos || [-30, 50, 25], shadowExt: o.shadowExt || 30 });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), toon(o.grass || COL.grass)); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; Wd.add(g);
  const r = rng(o.seed || 7), shades = o.patches || [0x6fb454, 0x8ad066];
  for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(new THREE.CircleGeometry(2 + r() * 5, 20), toon(shades[i % shades.length])); d.rotation.x = -Math.PI / 2; d.position.set((r() - .5) * 70, .012 + i * .0004, (r() - .5) * 60 - 8); d.receiveShadow = true; Wd.add(d); }
  if (o.clouds !== false) { const cc = o.cloudColor || 0xffffff; [[-60, 42, -130, 1], [40, 50, -140, 2], [95, 38, -120, 3], [-110, 52, -110, 4]].forEach(([x, y, z, s]) => { const c = cloud({ pos: [x, y, z], size: 9, seed: s, color: cc, cast: false }); Wd.add(c); }); }
  return Wd;
}

// ---------------- barn ----------------
export function barn(Wd, o) {
  o = o || {}; const g = new THREE.Group(), W = 10, Dp = 7, wallH = 4, sh = new THREE.Shape();
  sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, wallH); sh.lineTo(0, 6.6); sh.lineTo(-W / 2, wallH); sh.closePath();
  const body = mesh(new THREE.ExtrudeGeometry(sh, { depth: Dp, bevelEnabled: false }), toon(o.color || COL.barn), { box: true, inkW: .05, pos: [0, 0, -Dp / 2] }); g.add(body);
  const roofL = Math.hypot(W / 2, 6.6 - wallH) + .5, ang = Math.atan2(6.6 - wallH, W / 2);
  g.add(box(roofL, .26, Dp + 1.0, 0x6b3a2a, { pos: [-W / 4 - .1, wallH + (6.6 - wallH) / 2 + .15, 0], rot: [0, 0, ang], inkW: .03 }));
  g.add(box(roofL, .26, Dp + 1.0, 0x6b3a2a, { pos: [W / 4 + .1, wallH + (6.6 - wallH) / 2 + .15, 0], rot: [0, 0, -ang], inkW: .03 }));
  const z = Dp / 2;   // front face
  g.add(box(3.8, 3.4, .12, COL.wood, { pos: [0, 1.7, z + .04], inkW: .025 }));
  for (const s of [-1, 1]) { g.add(box(.14, 3.4, .1, 0xf7ecd0, { pos: [s * 1.9, 1.7, z + .12], ink: false })); }
  g.add(box(3.8, .14, .1, 0xf7ecd0, { pos: [0, 3.4, z + .12], ink: false }));
  // BANNED: cross-shaped window (no plus mullion, no X door braces, no crossing bars anywhere on the barn). Plain square window + plain door only.
  g.add(box(3.8, .14, .1, 0xf7ecd0, { pos: [0, .07, z + .12], ink: false }));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ color: o.lit ? 0xffd27a : 0x4a3426, fog: false })); win.position.set(0, 5.0, z + .02); g.add(win);
  g.add(box(1.6, 1.6, .06, 0xf7ecd0, { pos: [0, 5.0, z - .01], ink: false }));
  for (const s of [-1, 1]) { const w2 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshBasicMaterial({ color: o.lit ? 0xffd27a : 0x4a3426, fog: false })); w2.position.set(s * 3.5, 2.2, z + .02); g.add(w2); g.add(box(1.2, 1.2, .08, 0xf7ecd0, { pos: [s * 3.5, 2.2, z - .02], ink: false })); }
  if (o.pos) g.position.set(...o.pos); if (o.rot) g.rotation.y = o.rot; if (o.scale) g.scale.setScalar(o.scale);
  Wd.add(g); g.userData.front = z; return g;
}

// ---------------- signs (text = vault ID) ----------------
function signTex(text, o) {
  const fs = o.fs || 150, font = `700 ${fs}px Assistant, Heebo, sans-serif`, m0 = document.createElement('canvas').getContext('2d'); m0.font = font;
  const words = text.split(' '), maxW = o.maxW || 1500, lines = []; let cur = '';
  for (const w of words) { const t2 = cur ? cur + ' ' + w : w; if (cur && m0.measureText(t2).width > maxW) { lines.push(cur); cur = w; } else cur = t2; }
  if (cur) lines.push(cur);
  const lw = Math.max(...lines.map(l => m0.measureText(l).width)), padX = fs * .55, padY = fs * .42, w = Math.ceil(lw + padX * 2), h = Math.ceil(lines.length * fs * 1.22 + padY * 2);
  const tex = canvasTex(w, h, (g, w, h) => {
    g.fillStyle = o.bg || '#f7ecd0'; g.beginPath(); g.roundRect(0, 0, w, h, fs * .22); g.fill();
    if (o.edge) { g.strokeStyle = o.edge; g.lineWidth = fs * .11; g.beginPath(); g.roundRect(fs * .08, fs * .08, w - fs * .16, h - fs * .16, fs * .18); g.stroke(); }
    g.font = font; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    lines.forEach((l, i) => { const y = padY + fs * .61 + i * fs * 1.22; if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = fs * .1; g.strokeText(l, w / 2, y); } g.fillStyle = o.color || '#3b2410'; g.fillText(l, w / 2, y); });
  });
  return { tex, aspect: w / h };
}
// sign(Wd, id, {pos:[x,groundY,z], y: boardCentreHeight, w: boardWidth, rot, posts, bg, color, edge, frame, at: popTime})
export function sign(Wd, id, o) {
  o = o || {}; const T = signTex(txt(id), o), w = o.w || 3, h = w / T.aspect, g = new THREE.Group(), y = o.y === undefined ? 2.2 : o.y, fr = o.frame === undefined ? COL.wood : o.frame;
  const bd = box(w + .3, h + .3, .14, fr, { pos: [0, y, 0], inkW: .03 }); g.add(bd);
  if (o.gold) g.add(box(w + .5, h + .5, .1, COL.gold, { pos: [0, y, -.03], inkW: .03 }));
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: T.tex, fog: false })); pl.position.set(0, y, .075); g.add(pl);
  if (o.posts) for (const s of [-1, 1]) g.add(cyl(.09, .11, y + h / 2, COL.woodD, { pos: [s * (w / 2 + .05), (y + h / 2) / 2 - .02, -.12], inkW: .025 }));
  if (o.pos) g.position.set(...o.pos); if (o.rot) g.rotation.y = o.rot;
  if (o.at !== undefined) Wd.on(t => { const k = ease.out(prog(t, o.at, o.at + .55)), ov = 1 + .12 * Math.sin(Math.PI * clamp((t - o.at) / .55, 0, 1)); g.visible = k > .01; g.scale.setScalar(Math.max(.001, k * ov)); });
  Wd.add(g); g.userData.h = h; return g;
}

// ---------------- cow, calf, bull ----------------
const CLIP = { walk: 'AnimalArmature|Walk', stand: 'AnimalArmature|Idle', stand2: 'AnimalArmature|Idle_2', eat: 'AnimalArmature|Eating', low: 'AnimalArmature|Idle_Headlow' };
export function animal(Wd, fn, o) {
  o = o || {};
  return glbActor(Wd, o.name || 'cow', t => { const s = fn(t); return { pos: s.pos, facing: s.facing, scale: s.scale, hidden: s.hidden, clip: CLIP[s.mode || 'stand'], speed: s.speed === undefined ? 1 : s.speed }; },
    { height: o.height || 1.55, tint: o.tint, yaw: o.yaw || 0, inkColor: INK, ink: o.ink });
}
// pair(Wd, fn(t)->{pos:[x,y,z], facing, mode}) : cow + calf close to her flank
export function pair(Wd, fn, o) {
  o = o || {}; const side = o.side || 1, sc = o.scale || 1;
  const cow = animal(Wd, t => Object.assign({}, fn(t)), { height: 1.55 * sc, tint: o.tint, yaw: o.yaw, ink: o.ink });
  const calf = animal(Wd, t => { const s = fn(t - .35), f = s.facing || 0, fx = Math.sin(f), fz = Math.cos(f), rx = fz, rz = -fx; return Object.assign({}, s, { pos: [s.pos[0] + rx * side * 1.0 * sc - fx * .3 * sc, s.pos[1] || 0, s.pos[2] + rz * side * 1.0 * sc - fz * .3 * sc], facing: f + side * .06 }); }, { height: .85 * sc, tint: o.tint, yaw: o.yaw, ink: o.ink });
  return { cow, calf };
}

// ---------------- props ----------------
export function fireflies(Wd, n, area, seed, o) {
  o = o || {}; const r = rng(seed || 3), tex = canvasTex(64, 64, (g, w, h) => { const q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,245,170,1)'); q.addColorStop(.3, 'rgba(255,220,100,.55)'); q.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = q; g.fillRect(0, 0, w, h); }), out = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }), s = new THREE.Sprite(m), b = [lerp(area.x0, area.x1, r()), lerp(area.y0, area.y1, r()), lerp(area.z0, area.z1, r())], ph = r() * 6.28, fq = .25 + r() * .4, sz = (o.size || .35) * (.6 + r() * .8);
    s.scale.set(sz, sz, 1); Wd.add(s); out.push(s);
    Wd.on(t => { s.position.set(b[0] + Math.sin(t * fq + ph) * 1.4, b[1] + Math.sin(t * fq * 1.3 + ph * 2) * .5, b[2] + Math.cos(t * fq * .8 + ph) * 1.2); m.opacity = clamp(.15 + .85 * Math.max(0, Math.sin(t * (1.1 + fq) + ph * 3)), 0, 1); });
  }
  return out;
}
function gridTex(marks, o) {
  o = o || {}; const rowsN = 5, colsN = 4;
  return canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = '#fbf3da'; g.fillRect(0, 0, w, h); g.fillStyle = o.head || '#d9533f'; g.fillRect(0, 0, w, 62);
    for (let r = 0; r < rowsN; r++) for (let c = 0; c < colsN; c++) { const x = 20 + c * 54, y = 84 + r * 46, i = r * colsN + c; g.strokeStyle = '#c9b88e'; g.lineWidth = 3; g.strokeRect(x, y, 46, 38);
      const m = marks.indexOf(i); if (m >= 0) { if (o.stars) { g.fillStyle = '#f2b632'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 7 : 16; g.lineTo(x + 23 + Math.cos(a) * rr, y + 19 + Math.sin(a) * rr); } g.closePath(); g.fill(); } else { g.strokeStyle = '#d9533f'; g.lineWidth = 6; g.beginPath(); g.arc(x + 23, y + 19, 15, 0, 7); g.stroke(); } } }
  });
}
function iconTex(kind) {
  return canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = kind === 'today' ? '#fff1c4' : '#d8efff'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9533f'; g.fillRect(0, 0, w, 62);
    if (kind === 'today') { g.fillStyle = '#f2b632'; g.beginPath(); g.arc(128, 190, 58, 0, 7); g.fill(); g.strokeStyle = '#f2b632'; g.lineWidth = 12; g.lineCap = 'round'; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(128 + Math.cos(a) * 76, 190 + Math.sin(a) * 76); g.lineTo(128 + Math.cos(a) * 100, 190 + Math.sin(a) * 100); g.stroke(); } }
    else { g.fillStyle = '#f2b632'; g.beginPath(); g.arc(128, 210, 62, Math.PI, 0); g.fill(); g.fillStyle = '#7cc35b'; g.beginPath(); g.moveTo(0, 320); g.lineTo(0, 232); g.quadraticCurveTo(128, 190, 256, 232); g.lineTo(256, 320); g.fill(); g.strokeStyle = '#f2b632'; g.lineWidth = 12; g.lineCap = 'round'; for (let k = 1; k < 6; k++) { const a = Math.PI + k * Math.PI / 6; g.beginPath(); g.moveTo(128 + Math.cos(a) * 82, 210 + Math.sin(a) * 82); g.lineTo(128 + Math.cos(a) * 108, 210 + Math.sin(a) * 108); g.stroke(); } }
  });
}
// calendar(Wd, {pos, rot, scale, w, h, marks, stars, flip: t=>0..1 (today page flips away to the tomorrow page)})
export function calendar(Wd, o) {
  o = o || {}; const w = o.w || 2, h = o.h || 2.5, g = new THREE.Group();
  g.add(box(w + .3, h + .3, .16, COL.wood, { pos: [0, h / 2, 0], inkW: .03 }));
  const mk = tex => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, fog: false }));
  let page = null;
  if (o.flip) {
    const under = mk(iconTex('tomorrow')); under.position.set(0, h / 2, .09); g.add(under);
    const piv = new THREE.Group(); piv.position.set(0, h, .11); g.add(piv); page = mk(iconTex('today')); page.position.set(0, -h / 2, 0); piv.add(page);
    Wd.on(t => { const k = ease.io(clamp(o.flip(t), 0, 1)); piv.rotation.x = -k * Math.PI * .98; piv.position.z = .11 + .25 * Math.sin(k * Math.PI); piv.visible = k < .985; });
  } else { const pg = mk(gridTex(o.marks || [], { stars: o.stars })); pg.position.set(0, h / 2, .09); g.add(pg); g.userData.page = pg; }
  for (let i = 0; i < 4; i++) g.add(cyl(.04, .04, .12, 0x555555, { pos: [-w * .3 + i * w * .2, h + .02, .1], rot: [Math.PI / 2, 0, 0], ink: false }));
  if (o.pos) g.position.set(...o.pos); if (o.rot) g.rotation.y = o.rot; if (o.scale) g.scale.setScalar(o.scale);
  Wd.add(g); return g;
}
// clock(Wd, {pos, scale, hand: t=>angle radians clockwise from 12})
export function clock(Wd, o) {
  o = o || {}; const R = o.r || 1.4, by = o.by === undefined ? 1.6 : o.by, g = new THREE.Group();
  g.add(cyl(.12, .16, by + .1, COL.woodD, { pos: [0, (by + .1) / 2, -.12], inkW: .03 }));
  const rim = cyl(R + .12, R + .12, .18, COL.gold, { pos: [0, R + by, 0], rot: [Math.PI / 2, 0, 0], inkW: .035 }); g.add(rim);
  const tex = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#fffaf0'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.strokeStyle = '#3b2410'; c.lineCap = 'round';
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, big = k % 3 === 0; c.lineWidth = big ? 20 : 10; c.beginPath(); c.moveTo(256 + Math.sin(a) * (big ? 190 : 205), 256 - Math.cos(a) * (big ? 190 : 205)); c.lineTo(256 + Math.sin(a) * 232, 256 - Math.cos(a) * 232); c.stroke(); } });
  const face = new THREE.Mesh(new THREE.CircleGeometry(R, 40), new THREE.MeshBasicMaterial({ map: tex, fog: false })); face.position.set(0, R + by, .1); g.add(face);
  const hp = new THREE.Group(); hp.position.set(0, R + by, .16); g.add(hp); hp.add(box(.16, R * .82, .05, 0xd9533f, { pos: [0, R * .36, 0], inkW: .012 })); hp.add(ball(.14, 0x3b2410, { ink: false }));
  const sw = new THREE.Mesh(new THREE.CircleGeometry(R * .9, 40, Math.PI / 2, 0.01), new THREE.MeshBasicMaterial({ color: 0xf2b632, transparent: true, opacity: .55, fog: false })); sw.position.set(0, R + by, .12); g.add(sw);
  Wd.on(t => { const a = o.hand ? o.hand(t) : 0; hp.rotation.z = -a; sw.geometry.dispose(); sw.geometry = new THREE.CircleGeometry(R * .9, 40, Math.PI / 2 - Math.max(.02, a), Math.max(.02, a)); });
  if (o.pos) g.position.set(...o.pos); if (o.rot) g.rotation.y = o.rot; if (o.scale) g.scale.setScalar(o.scale);
  Wd.add(g); return g;
}
// scrollProp(Wd, id, {pos, rot, sunset}) : open scroll on a stone stand; returns the group (hero)
export function scrollProp(Wd, id, o) {
  o = o || {}; const g = new THREE.Group(), T = signTex(txt(id), { fs: 130, maxW: 900, bg: '#f6e7bd', color: '#4a2c10', edge: '#a9803a' }), w = 2.6, h = w / T.aspect;
  g.add(box(1.5, .9, 1.0, 0xc2baa8, { pos: [0, .45, 0], inkW: .03 })); g.add(box(1.7, .14, 1.2, 0xa39c8b, { pos: [0, .96, 0], inkW: .03 }));
  const sc = new THREE.Group(); sc.position.set(0, 1.04 + h * .5 * Math.sin(.6), .05); sc.rotation.x = -.6; g.add(sc);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: T.tex, fog: false, side: THREE.DoubleSide })); sc.add(pl);
  for (const s of [-1, 1]) { sc.add(cyl(.11, .11, h + .25, 0x7a4a2a, { pos: [s * (w / 2 + .04), 0, .02], inkW: .02 })); sc.add(ball(.15, COL.gold, { pos: [s * (w / 2 + .04), h / 2 + .15, .02], inkW: .02 })); sc.add(ball(.15, COL.gold, { pos: [s * (w / 2 + .04), -h / 2 - .15, .02], inkW: .02 })); }
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (c, ww, hh) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, o.sunset ? 'rgba(255,170,90,.75)' : 'rgba(255,225,130,.7)'); r.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = r; c.fillRect(0, 0, ww, hh); }), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  gl.scale.set(6, 4.6, 1); gl.position.set(0, 1.9, -.2); g.add(gl); gl.visible = !o.noGlow; Wd.on(t => { gl.material.opacity = (o.sunset ? .52 : .75) + .2 * Math.sin(t * 1.6) * (o.sunset ? .7 : 1); });
  if (o.pos) g.position.set(...o.pos); if (o.rot) g.rotation.y = o.rot; Wd.add(g); return g;
}
// crossing flock of birds (x travel)
export function birdsCross(Wd, n, y, z, x0, x1, t0, t1, seed) {
  const r = rng(seed || 4);
  for (let i = 0; i < n; i++) { const dy = (r() - .5) * 2.4, dz = (r() - .5) * 4, dx = (r() - .5) * 4, ph = r() * 6, dir = Math.sign(x1 - x0) || 1;
    P.bird(Wd, { color: i % 3 ? 0xf4f0e6 : 0xe9c88a, seed: i, fn: t => { const k = clamp((t - t0) / (t1 - t0), 0, 1); return { pos: [lerp(x0, x1, k) + dx, y + dy + Math.sin(t * 1.4 + ph) * .3, z + dz], facing: dir * Math.PI / 2, flap: 2.4 + (i % 3) * .3 }; } }); }
}
// dressing: fences, trees, bushes around a yard
export function yard(Wd, o) {
  o = o || {}; const z = o.fenceZ === undefined ? -8 : o.fenceZ;
  P.fence(Wd, { pos: [-14, 0, z], len: 10 }); P.fence(Wd, { pos: [4, 0, z], len: 10 });
  P.tree(Wd, { pos: [-13, 0, z - 4], kind: 0, scale: 1.5 }); P.tree(Wd, { pos: [15, 0, z - 5], kind: 0, scale: 1.7 }); P.tree(Wd, { pos: [-22, 0, z + 6], kind: 1, scale: 1.4 }); P.tree(Wd, { pos: [24, 0, z + 4], kind: 1, scale: 1.5 });
  P.bush(Wd, { pos: [-7, 0, z + 1], scale: 1.2 }); P.bush(Wd, { pos: [9, 0, z + 1.5], scale: 1.4 }); P.rock(Wd, { pos: [-9, 0, 4], seed: 4 }); P.rock(Wd, { pos: [10, 0, 6], seed: 9, scale: 1.2 });
}
// thin rope between two points, updated per frame
export function rope(Wd, fn, color) {
  const m = box(1, .05, .05, color || 0x7a5a30, { ink: false }); Wd.add(m);
  Wd.on(t => { const [a, b] = fn(t), dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || .01; m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.scale.x = L;
    m.rotation.set(0, 0, 0); m.rotation.y = -Math.atan2(dz, dx); m.rotation.z = Math.asin(clamp(dy / L, -1, 1)); m.rotation.order = 'YZX'; });
  return m;
}
// lantern (lit at tLit)
export function lantern(Wd, pos, tLit, pips) {
  const g = new THREE.Group(), body = box(.55, .7, .55, 0x4a3a30, { pos: [0, 0, 0], inkW: .02 }); g.add(body);
  const core = ball(.22, 0xfff0a8, { ink: false }); core.material = new THREE.MeshBasicMaterial({ color: 0xfff0a8, fog: false }); g.add(core);
  g.add(box(.7, .1, .7, COL.gold, { pos: [0, .4, 0], inkW: .015 })); g.add(box(.7, .1, .7, COL.gold, { pos: [0, -.4, 0], inkW: .015 })); g.add(cyl(.015, .015, .9, 0x3b2c22, { pos: [0, .9, 0], ink: false }));
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,230,140,.95)'); r.addColorStop(1, 'rgba(255,190,70,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); }), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); g.add(gl);
  const pp = []; for (let i = 0; i < pips; i++) { const b = ball(.07, 0xf2b632, { pos: [(i - (pips - 1) / 2) * .2, -.65, 0], ink: false }); b.material = new THREE.MeshBasicMaterial({ color: 0x6b5a48, fog: false }); g.add(b); pp.push(b); }
  g.position.set(...pos); Wd.add(g);
  Wd.on(t => { const k = ease.out(prog(t, tLit, tLit + .6)), lit = t >= tLit; core.visible = lit; gl.visible = lit; gl.scale.setScalar(.01 + 2.6 * k * (1 + .06 * Math.sin(t * 5))); core.scale.setScalar(.6 + .4 * k); pp.forEach(b => b.material.color.setHex(lit ? 0xf2b632 : 0x6b5a48)); body.material.color.setHex(lit ? 0x8a6a3a : 0x4a3a30); g.rotation.z = Math.sin(t * 1.3 + pos[0]) * .03; });
  return g;
}
