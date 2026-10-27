// k12lib.js - building blocks for kz_k12 ("the yesh we stop seeing"). Early-spring palette, flat toon, no characters.
// Everything is a pure function of t (rng(seed) for randomness).
import { THREE, world, box, cyl, ball, mesh, toon, canvasTex, rng, clamp, lerp, ease, prog, path, D, cloud, rain } from '../../lib/stage3d.js';
export { THREE, rng, clamp, lerp, ease, prog, path, D, cloud, rain, canvasTex, toon, mesh };
export const PI = Math.PI, sm = ease.sm, sin = Math.sin, cos = Math.cos;
export const COL = { sage: '#4E7D6A', sageD: '#3A6454', sageL: '#9DBFAE', coral: '#D9774B', coralD: '#B85F37', cream: '#F7F3EA', creamD: '#E3DAC6', sky: '#BFD6EA', skyD: '#6B8CAE',
  honey: '#E9B64A', wood: '#8A6F58', woodD: '#5E4B3C', woodL: '#B89B7E', haze: '#DCE6F0', white: '#FBF9F4', grey: '#BDC3CC', greyD: '#8E97A4', red: '#D9774B', blue: '#2A4A7F', blueL: '#6B8CAE', lilac: '#B9C4DC',
  slate: '#6B8CAE', slateD: '#4F6F94', void: '#34465E', pine: '#4E7D6A', terra: '#D9774B', mustard: '#E9B64A', frame: '#27457A' };
export const INK = 0x2F3440;
const O = (o, w) => Object.assign({ inkColor: INK, inkW: w || .012 }, o);
export const bx = (w, h, d, c, o) => box(w, h, d, c, O(o));
export const cy = (rt, rb, h, c, o) => cyl(rt, rb, h, c, O(o));
export const bl = (r, c, o) => ball(r, c, O(o));
export const mm = (geo, color, o) => mesh(geo, toon(color, o && o.mat), O(o));
export const grp = (Wd, pos, rot, sc) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); if (rot) g.rotation.set(...(Array.isArray(rot) ? rot : [0, rot, 0])); if (sc) g.scale.setScalar(sc); if (Wd) Wd.add(g); return g; };
export const put = (Wd, g, pos, ry, sc) => { if (pos) g.position.set(...pos); if (ry) g.rotation.y = ry; if (sc) g.scale.setScalar(sc); Wd.add(g); return g; };
export const pop = (t, a, b, c, d) => sm(prog(t, a, b)) * (1 - (c === undefined ? 0 : sm(prog(t, c, d))));
export const elastic = k => { k = clamp(k, 0, 1); return k <= 0 ? 0 : k >= 1 ? 1 : 1 + .45 * Math.sin((k - .1) * 11) * Math.pow(1 - k, 2) * (1 - k * .2) - .02 * (1 - k); };

// ---------- glow ----------
let GT = null;
export function glowTex() { if (!GT) GT = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); return GT; }
export function glowSprite(color, size, opacity, o) {
  o = o || {};
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, blending: o.normal ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, depthTest: o.depthTest !== false, transparent: true, opacity: opacity === undefined ? 1 : opacity, fog: false }));
  s.scale.set(size, size, 1); s.renderOrder = o.order || 6; return s;
}
let ST = null;
export function starTex() { if (!ST) ST = canvasTex(128, 128, (g, w, h) => { g.translate(64, 64); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 60); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr;
  g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, r = i % 2 ? 9 : 60; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); }); return ST; }
export function sparkle(color, size, op) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex(), color, blending: THREE.NormalBlending, depthWrite: false, transparent: true, opacity: op === undefined ? 1 : op, fog: false })); s.scale.set(size, size, 1); s.renderOrder = 8; return s; }

// ---------- the world ----------
function gTex(base, a, b, dots, rep) {
  const r = rng(11);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.fillStyle = r() < .5 ? a : b; g.globalAlpha = .35 + r() * .35; const s = 10 + r() * 34; g.beginPath(); g.ellipse(r() * w, r() * h, s, s * (.5 + r() * .5), r() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    for (let i = 0; i < (dots ? dots.length * 7 : 0); i++) { g.fillStyle = dots[i % dots.length]; const x = r() * w, y = r() * h; g.beginPath(); g.arc(x, y, 3 + r() * 3, 0, 7); g.fill(); }
  }, rep || [34, 34]);
}
const GR = { meadow: ['#F1EEE4', '#E3E9EC', '#FAF7EE', ['#6B8CAE', '#4E7D6A', '#D9774B']], room: ['#F3EEE2', '#E6DFCD', '#FAF6EC', null], dry: ['#E9E2D0', '#DCD3BC', '#F4EEDF', ['#9DB5CC']], slate: ['#C9D8E6', '#B5C8DB', '#DCE7F0', ['#F7F3EA']], path: ['#F3EDDD', '#E4DAC2', '#FAF5E8', null] };
export function stageWorld(o) {
  o = o || {}; const kind = o.kind || 'meadow', pur = kind === 'purim';
  const cfg = { skyTop: 0xBFD6EA, skyBottom: 0xF7F3EA, fogColor: 0xF7F3EA, hemi: 1.4, hemiSky: 0xffffff, hemiGround: 0xc4d3e2, sun: 1.6, sunColor: 0xfff3e0 };
  const Wd = world(Object.assign({ fogNear: 60, fogFar: 300, shadowExt: 18, skyR: 800, sunPos: [-22, 42, 28] }, cfg, o.w || {}));
  const gk = GR[kind === 'room' ? 'room' : kind] || GR.meadow;
  const gm = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), toon(0xffffff, { map: gTex(gk[0], gk[1], gk[2], gk[3], [60, 60]) }));
  gm.rotation.x = -PI / 2; gm.receiveShadow = true; Wd.add(gm); Wd.ground = gm;
  if (o.sunTarget) Wd.sun.target.position.set(...o.sunTarget);
  if (o.backdrop !== false) backdrop(Wd, o.seed || 3, kind);
  return Wd;
}
export function backdrop(Wd, seed, kind) {
  const r = rng(seed), pur = false, dry = kind === 'dry';
  const cols = ['#B7CBDD', '#9FB8CF', '#CBDAE7', '#DCE7F0', '#A9C2B8'];
  for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2 + r() * .3, d = 85 + r() * 55, s = 18 + r() * 26;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 20, 12), toon(cols[i % cols.length])); m.scale.y = .38 + r() * .2; m.position.set(Math.sin(a) * d, -s * .1, Math.cos(a) * d); Wd.add(m); }
  for (let i = 0; i < 7; i++) { const a = r() * PI * 2, d = 120 + r() * 60; Wd.add(cloud({ seed: seed + i, size: 6 + r() * 4, puffs: 6, color: pur ? 0xdfe9fb : 0xffffff, inkColor: pur ? 0x6a80b0 : 0xb8c2cc, pos: [Math.sin(a) * d, 35 + r() * 25, Math.cos(a) * d], cast: false })); }
}
export function scatter(Wd, o) {   // little flowers / pebbles on the ground (fills the frame)
  const r = rng(o.seed || 5), n = o.n || 50, a = o.area || [-12, 12, -12, 12], cols = o.cols || [COL.coral, COL.cream, COL.honey, COL.sageD, COL.sky];
  for (let i = 0; i < n; i++) { const x = lerp(a[0], a[1], r()), z = lerp(a[2], a[3], r()); if (o.avoid && Math.hypot(x - o.avoid[0], z - o.avoid[1]) < o.avoid[2]) continue;
    const c = cols[Math.floor(r() * cols.length)], s = .09 + r() * .12;
    if (o.rocks) Wd.add(mm(new THREE.DodecahedronGeometry(s * 2.2, 0), c, { pos: [x, s, z], scale: [1, .6, .85], rot: [0, r() * 6, 0], inkW: .01, box: true }));
    else { const f = new THREE.Group(); f.position.set(x, 0, z); f.add(cy(.012, .012, s * 3, COL.sageD, { pos: [0, s * 1.5, 0], ink: false })); f.add(bl(s, c, { pos: [0, s * 3, 0], inkW: .008 })); Wd.add(f); } }
}

// ---------- fading (the "pale outline" look) ----------
const PALE_FILL = new THREE.Color('#F4EBEC'), PALE_INK = new THREE.Color('#CDBCC2');
export function fadeRec(g, pal) {
  const rec = []; g.traverse(o => { if (o.isMesh && o.material && !o.userData.keep) { for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (m.color && !rec.some(q => q.m === m)) rec.push({ m, c: m.color.clone(), ink: m.isMeshBasicMaterial && m.side === THREE.BackSide, emi: m.emissive ? m.emissive.clone() : null, o0: m.opacity, t0: m.transparent }); } });
  return { g, rec, k: -1, pal: pal || null, op: .55 };
}
export function setFade(f, k) {
  k = clamp(k, 0, 1); if (Math.abs(k - f.k) < .003) return; f.k = k;
  const pf = f.pal ? new THREE.Color(f.pal[0]) : PALE_FILL, pi = f.pal ? new THREE.Color(f.pal[1]) : PALE_INK;
  for (const r of f.rec) {
    if (r.ink) r.m.color.copy(r.c).lerp(pi, k); else { r.m.color.copy(r.c).lerp(pf, k * .82); if (r.emi) r.m.emissive.copy(r.emi).multiplyScalar(1 - k); }
    r.m.opacity = r.o0 * (1 - f.op * k); r.m.transparent = r.t0 || k > .004;
  }
}

// ---------- THE GLASSES (hero prop) ----------
let HZ = null;
function hazeTex() { if (!HZ) HZ = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,.78)'); r.addColorStop(.7, 'rgba(255,255,255,.92)'); r.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); return HZ; }
export function glasses(Wd, o) {
  o = o || {}; const R = .5, gap = .16, g = new THREE.Group(), lensObjs = [], hazes = [], tints = [];
  for (const s of [-1, 1]) {
    const cx = s * (R + gap / 2), lens = new THREE.Group(); lens.position.set(cx, 0, 0); g.add(lens); lensObjs.push(lens);
    lens.add(mm(new THREE.TorusGeometry(R, .06, 14, 44), COL.wood, { inkW: .014 }));
    const tint = new THREE.Mesh(new THREE.CircleGeometry(R - .01, 40), new THREE.MeshBasicMaterial({ color: 0xDDF0FA, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide, fog: false })); tint.userData.keep = true; lens.add(tint); tints.push(tint);
    const hz = new THREE.Mesh(new THREE.CircleGeometry(R - .01, 40), new THREE.MeshBasicMaterial({ color: COL.haze, map: hazeTex(), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false })); hz.position.z = .004; hz.renderOrder = 4; hz.userData.keep = true; lens.add(hz); hazes.push(hz);
    const gl = new THREE.Mesh(new THREE.TorusGeometry(R * .72, .02, 6, 16, .8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .6, fog: false })); gl.rotation.z = 1.9; gl.position.z = .01; gl.userData.keep = true; lens.add(gl);
    const arm = cy(.028, .028, 1.0, COL.woodD, { pos: [s * (2 * R + gap / 2 + .02), .1, .5], rot: [PI / 2, 0, 0], inkW: .008 }); g.add(arm);
    g.add(bl(.05, COL.woodD, { pos: [s * (2 * R + gap / 2 + .02), .1, 0], inkW: .008 }));
  }
  g.add(mm(new THREE.TorusGeometry(.13, .035, 8, 16, PI), COL.wood, { pos: [0, .06, 0], inkW: .01 }));
  const info = { g, R, lensObjs, haze: 0 };
  Wd.on(t => { const h = clamp(o.haze ? o.haze(t) : 0, 0, 1); info.haze = h; for (const z of hazes) { z.material.opacity = h * .9; z.visible = h > .005; } for (const q of tints) q.material.opacity = .16 - .12 * h; });
  g.traverse(q => { if (q.isMesh) q.castShadow = false; });
  if (o.pos) g.position.set(...o.pos); if (o.rot) g.rotation.set(...(Array.isArray(o.rot) ? o.rot : [0, o.rot, 0])); if (o.scale) g.scale.setScalar(o.scale);
  if (o.add !== false) Wd.add(g);
  return info;
}
// objects behind a lens turn pale in proportion to the lens haze. items: [{f: fadeRec, obj|pos, dy, extra(t)}]
export function lensFader(Wd, gl, items) {
  const c = new THREE.Vector3(), e = new THREE.Vector3(), p = new THREE.Vector3(), vc = new THREE.Vector3(), vp = new THREE.Vector3(), up = new THREE.Vector3(), cp = new THREE.Vector3();
  Wd.on((t, cam) => {
    cam.updateMatrixWorld(true); cam.matrixWorldInverse.copy(cam.matrixWorld).invert(); gl.g.updateMatrixWorld(true);
    const asp = 16 / 9, h = gl.haze, sc = gl.g.scale.x * gl.g.parent.scale.x; const lenses = gl.lensObjs.map(L => { L.getWorldPosition(c); const cw = c.clone(); vc.copy(c).applyMatrix4(cam.matrixWorldInverse);
      up.set(0, 1, 0).applyQuaternion(cam.quaternion); e.copy(c).addScaledVector(up, gl.R * sc); const n0 = c.clone().project(cam), n1 = e.clone().project(cam); return { n: n0, rad: Math.abs(n1.y - n0.y), z: vc.z }; });
    for (const it of items) {
      let k = 0; if (h > .01) { if (it.obj) it.obj.getWorldPosition(p); else p.set(...it.pos); p.y += it.dy || 0; vp.copy(p).applyMatrix4(cam.matrixWorldInverse); cp.copy(p).project(cam);
        for (const L of lenses) { if (vp.z > L.z) continue; const d = Math.hypot((cp.x - L.n.x) * asp, cp.y - L.n.y), kk = 1 - sm(clamp((d - L.rad * .72) / (L.rad * .4), 0, 1)); k = Math.max(k, kk); } }
      setFade(it.f, Math.max(k * h * 1.05, it.extra ? it.extra(t) : 0));
    }
  });
}

// ---------- paper confetti ----------
export function confetti(Wd, o) {
  const r = rng(o.seed || 1), n = o.n || 30, cols = [COL.sage, COL.coral, COL.cream, COL.sky, COL.honey], P = [], g = new THREE.Group(); Wd.add(g);
  for (let i = 0; i < n; i++) { const m = mm(new THREE.BoxGeometry(.2 * (o.size || 1), .02, .13 * (o.size || 1)), cols[i % 5], { inkW: .005, box: true, cast: false }); g.add(m); P.push({ m, ph: r(), dx: (r() - .5) * (o.spread || 3), dz: (r() - .5) * (o.spread || 3), sp: 2 + r() * 4, a: r() * 6 }); }
  const [x0, y0, z0] = o.pos;
  Wd.on(t => { for (const p of P) { const u = (t - o.t0 - p.ph * (o.stagger === undefined ? 1.5 : o.stagger)) / (o.life || 4); if (u < 0 || u > 1) { p.m.visible = false; continue; } p.m.visible = true;
    const s = Math.min(1, u * 8) * Math.min(1, (1 - u) * 5); p.m.scale.setScalar(Math.max(.001, s));
    p.m.position.set(x0 + p.dx * u + Math.sin(u * 7 + p.a) * .25, y0 + (o.rise || 3) * (1 - Math.pow(1 - u, 1.6)) + (o.fall ? -o.fall * u * u : 0), z0 + p.dz * u); p.m.rotation.set(u * p.sp + p.a, u * p.sp * .7, u * p.sp * .5); } });
  return g;
}
// a chain of glowing beads along pt(t,u); range(t)->[u0,u1]; a(t) 0..1
export function lightLine(Wd, o) {
  const n = o.n || 30, B = [], g = new THREE.Group(); Wd.add(g);
  for (let i = 0; i < n; i++) { const b = new THREE.Group(); b.add(new THREE.Mesh(new THREE.SphereGeometry((o.r || .07), 10, 8), new THREE.MeshBasicMaterial({ color: i % 3 ? 0xFFD266 : 0xFFF4C8, fog: false }))); const h = glowSprite(0xFFC24A, (o.r || .07) * 7, .55); b.add(h); g.add(b); B.push([b, h]); }
  Wd.on(t => { const [u0, u1] = o.range(t), a = o.a ? o.a(t) : 1; g.visible = a > .01 && u1 > u0 + 1e-3; if (!g.visible) return;
    for (let i = 0; i < n; i++) { const f = i / (n - 1), u = lerp(u0, u1, f), p = o.pt(t, u), env = Math.min(1, f * 5 + .15) * Math.min(1, (1 - f) * 2 + .5); B[i][0].position.set(p[0], p[1], p[2]); const s = (.4 + .6 * Math.min(1, f * 3 + .3)) * a * (.85 + .15 * Math.sin(t * 6 + i)); B[i][0].scale.setScalar(Math.max(.001, s * env)); } });
  return g;
}

// ---------- tables, rooms ----------
export function table(o) {
  o = o || {}; const w = o.w || 4, d = o.d || 1.8, h = o.h || .8, g = new THREE.Group(), round = o.round;
  g.add(round ? cy(w / 2, w / 2, .1, o.top || COL.woodL, { pos: [0, h - .05, 0] }) : bx(w, .1, d, o.top || COL.woodL, { pos: [0, h - .05, 0] }));
  if (o.cloth) g.add(round ? cy(w / 2 * 1.01, w / 2 * 1.01, .03, o.cloth, { pos: [0, h + .015, 0], inkW: .008 }) : bx(w * 1.01, .03, d * 1.01, o.cloth, { pos: [0, h + .015, 0], inkW: .008 }));
  if (round) g.add(cy(.22, .3, h - .1, COL.woodD, { pos: [0, (h - .1) / 2, 0] })), g.add(cy(w * .3, w * .32, .08, COL.woodD, { pos: [0, .04, 0] }));
  else for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(bx(.12, h - .1, .12, COL.woodD, { pos: [sx * (w / 2 - .12), (h - .1) / 2, sz * (d / 2 - .12)] }));
  g.userData.top = h + (o.cloth ? .03 : 0); return g;
}
export function roomBack(Wd, z, w) {
  w = w || 30; const g = new THREE.Group(); g.position.z = z;
  g.add(bx(w, 5, .3, '#F8EAD0', { pos: [0, 2.5, 0], inkW: .01 })); g.add(bx(w, 1.1, .34, COL.sageL, { pos: [0, .55, .02], inkW: .01 })); g.add(bx(w, .12, .4, COL.wood, { pos: [0, 1.12, .04], inkW: .008 }));
  for (const x of [-4, 4]) { g.add(bx(2.2, 2.4, .12, COL.sky, { pos: [x, 2.7, .18], inkW: .01 })); g.add(bx(2.5, .12, .2, COL.wood, { pos: [x, 3.95, .2] })); g.add(bx(2.5, .12, .2, COL.wood, { pos: [x, 1.45, .2] })); g.add(bx(.1, 2.4, .2, COL.wood, { pos: [x, 2.7, .2] }));
    g.add(bx(.7, 2.6, .14, COL.coral, { pos: [x - 1.5, 2.7, .26], inkW: .01 })); g.add(bx(.7, 2.6, .14, COL.coral, { pos: [x + 1.5, 2.7, .26], inkW: .01 })); }
  Wd.add(g); return g;
}

// ---------- everyday objects ----------
export function bread(o) { o = o || {}; const g = new THREE.Group(); g.add(bl(.22, '#E8B26A', { scale: [1.5, .75, .85], pos: [0, .16, 0] })); for (const x of [-.13, 0, .13]) g.add(bx(.03, .02, .2, '#C58840', { pos: [x, .31, 0], rot: [0, 0, x * 2], ink: false })); return g; }
export function fruitBowl() { const g = new THREE.Group(); g.add(mm(new THREE.SphereGeometry(.3, 24, 12, 0, PI * 2, PI / 2, PI / 2), COL.sky, { mat: { side: THREE.DoubleSide }, pos: [0, .3, 0] })); g.add(cy(.12, .14, .05, COL.skyD, { pos: [0, .025, 0] }));
  [[0, COL.coral], [.14, COL.honey], [-.14, COL.sage], [.06, COL.coral]].forEach(([x, c], i) => g.add(bl(.1, c, { pos: [x, .28 + (i > 2 ? .08 : 0), i % 2 ? .08 : -.06], inkW: .01 }))); return g; }
export function bookStack(n, seed) { const g = new THREE.Group(), r = rng(seed || 2), cs = [COL.coral, COL.sky, COL.honey, COL.sage, COL.lilac]; for (let i = 0; i < (n || 3); i++) { const b = bx(.4 - r() * .06, .08, .28, cs[i % 5], { pos: [(r() - .5) * .06, .04 + i * .085, 0], rot: [0, (r() - .5) * .3, 0] }); g.add(b); g.add(bx(.37, .05, .26, COL.cream, { pos: [.015, .04 + i * .085, 0], rot: [0, (r() - .5) * .0, 0], ink: false })); } return g; }
export function cup() { const g = new THREE.Group(); g.add(cy(.1, .075, .15, COL.white, { pos: [0, .075, 0] })); g.add(mm(new THREE.TorusGeometry(.055, .014, 8, 16, PI), COL.white, { pos: [.1, .08, 0], rot: [0, 0, -PI / 2], inkW: .008 })); return g; }
export function vase() { const g = new THREE.Group(); g.add(cy(.1, .13, .3, COL.sky, { pos: [0, .15, 0] })); [[-.1, .55, COL.coral], [.08, .62, COL.cream], [0, .7, COL.honey]].forEach(([x, y, c]) => { g.add(cy(.01, .01, y - .25, COL.sageD, { pos: [x * .5, (y + .25) / 2, 0], rot: [0, 0, -x * .6], ink: false })); g.add(bl(.07, c, { pos: [x, y, 0], inkW: .008 })); }); return g; }
export function honeyJar() { const g = new THREE.Group(); g.add(cy(.17, .17, .3, COL.honey, { pos: [0, .15, 0] })); g.add(cy(.18, .18, .06, COL.wood, { pos: [0, .33, 0] })); g.add(bx(.18, .12, .01, COL.cream, { pos: [0, .15, .17], ink: false })); return g; }
export function candle() { const g = new THREE.Group(); g.add(cy(.05, .05, .22, COL.cream, { pos: [0, .11, 0] })); g.add(bl(.03, COL.honey, { pos: [0, .26, 0], scale: [1, 1.6, 1], ink: false })); return g; }
// slipper (colour c) : length ~.5, toe towards +z
export function slipper(c) { const g = new THREE.Group();
  g.add(cy(.15, .15, .04, COL.cream, { scale: [1, 1, 2.3], pos: [0, .02, 0], inkW: .012 }));
  g.add(mm(new THREE.SphereGeometry(.125, 22, 12, 0, PI * 2, 0, PI / 2), c, { mat: { side: THREE.DoubleSide }, scale: [1, .5, 1.15], pos: [0, .04, .19], inkW: .012 }));
  g.add(bx(.2, .035, .035, COL.cream, { pos: [0, .045, .03], inkW: .006, ink: false })); return g; }
export function shoe(c, c2) { const g = new THREE.Group(); g.add(bl(.09, COL.woodD, { scale: [1, .22, 2.0], pos: [0, .02, .02], inkW: .008 })); g.add(bl(.085, c, { scale: [1, .75, 1.3], pos: [0, .08, .05], inkW: .008 })); g.add(cy(.055, .06, .1, c, { pos: [0, .15, -.07], inkW: .008 })); g.add(bx(.12, .025, .03, c2 || COL.cream, { pos: [0, .1, .06], inkW: .006, ink: false })); return g; }
export function glove(c) { const g = new THREE.Group(); g.add(bx(.2, .22, .08, c, { pos: [0, .11, 0], inkW: .01 })); for (let i = 0; i < 4; i++) g.add(cy(.032, .03, .16, c, { pos: [-.075 + i * .05, .29 - (i === 1 || i === 2 ? .02 : 0) * -1, 0], inkW: .008 })); g.add(cy(.035, .033, .13, c, { pos: [.14, .17, 0], rot: [0, 0, -.9], inkW: .008 })); g.add(bx(.22, .05, .09, COL.cream, { pos: [0, .02, 0], inkW: .008 })); return g; }
export function speechBubble() { const g = new THREE.Group(); g.add(bl(.4, COL.white, { scale: [1.35, .85, .3], pos: [0, .5, 0] })); g.add(mm(new THREE.ConeGeometry(.12, .3, 4), COL.white, { pos: [-.22, .15, 0], rot: [PI, 0, .3], scale: [1, 1, .5], box: true })); for (let i = 0; i < 3; i++) g.add(bl(.045, [COL.coral, COL.honey, COL.sage][i], { pos: [-.2 + i * .2, .5, .1], inkW: .006 })); return g; }
export function fridge() { const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(bx(.9, .06, .7, COL.sageL, { pos: [0, .03, 0] })); body.add(bx(.9, .06, .7, COL.sageL, { pos: [0, 1.02, 0] })); body.add(bx(.06, 1.0, .7, COL.sageL, { pos: [-.42, .52, 0] })); body.add(bx(.06, 1.0, .7, COL.sageL, { pos: [.42, .52, 0] })); body.add(bx(.9, 1.0, .05, COL.cream, { pos: [0, .52, -.33], ink: false }));
  body.add(bx(.78, .04, .6, COL.white, { pos: [0, .52, 0], inkW: .008 })); const b = bread(); b.scale.setScalar(.7); b.position.set(-.18, .54, 0); body.add(b); const f = fruitBowl(); f.scale.setScalar(.6); f.position.set(.2, .54, .02); body.add(f);
  const b2 = bread(); b2.scale.setScalar(.6); b2.position.set(-.1, .06, 0); body.add(b2); body.add(bl(.09, COL.coral, { pos: [.2, .15, .04], inkW: .008 })); const gl = glowSprite(0xFFE3A0, 1.8, 0); gl.position.set(0, .55, .1); g.add(gl);
  const door = new THREE.Group(); door.position.set(-.45, 0, .36); g.add(door); door.add(bx(.9, 1.08, .06, COL.sage, { pos: [.45, .54, 0] })); door.add(bx(.05, .32, .05, COL.coral, { pos: [.8, .66, .06], inkW: .008 }));
  g.userData = { door, glow: gl }; return g; }
export function eyeLamp() { const g = new THREE.Group(); g.add(cy(.08, .14, .3, COL.woodD, { pos: [0, .15, 0] })); g.add(bl(.3, COL.white, { scale: [1.35, .9, .55], pos: [0, .6, 0] })); g.add(cy(.17, .17, .05, COL.sky, { pos: [0, .6, .17], rot: [PI / 2, 0, 0], inkW: .008 })); g.add(cy(.08, .08, .05, 0x3A2E28, { pos: [0, .6, .2], rot: [PI / 2, 0, 0], ink: false })); g.add(bl(.03, COL.white, { pos: [.05, .66, .23], ink: false })); const gl = glowSprite(0xFFE3A0, 1.6, .35); gl.position.set(0, .6, -.1); g.add(gl); return g; }
export function earShell() { const g = new THREE.Group(); g.add(cy(.08, .14, .12, COL.woodD, { pos: [0, .06, 0] })); g.add(mm(new THREE.TorusGeometry(.3, .08, 10, 28, 4.6), '#F6B49C', { pos: [0, .55, 0], rot: [0, 0, 1.2], inkW: .012 })); g.add(mm(new THREE.TorusGeometry(.17, .06, 10, 24, 3.6), '#F4A488', { pos: [0, .53, .02], rot: [0, 0, 1.6], inkW: .01 })); g.add(bl(.09, '#F6B49C', { pos: [-.04, .22, 0], inkW: .01 })); return g; }
export function heart(c) { const s = new THREE.Shape(); s.moveTo(0, -.3); s.bezierCurveTo(-.5, .05, -.3, .4, 0, .2); s.bezierCurveTo(.3, .4, .5, .05, 0, -.3); const geo = new THREE.ExtrudeGeometry(s, { depth: .16, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 2 }); geo.translate(0, 0, -.08);
  const g = new THREE.Group(), h = mm(geo, c || COL.red, { inkW: .015, box: true }); h.position.y = .55; g.add(h); g.add(cy(.08, .14, .3, COL.woodD, { pos: [0, .15, 0] })); g.userData.h = h; return g; }
export function coinStack(n, c, r) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(cy(r || .45, r || .45, .08, c || COL.honey, { pos: [Math.sin(i * 2.3) * .015, .04 + i * .085, Math.cos(i * 1.7) * .015], inkW: .008 })); g.userData.h = n * .085; return g; }
export function digitDisc(txt, color, r) { r = r || .55; const g = new THREE.Group(); g.add(cy(r, r, .08, COL.cream, { rot: [PI / 2, 0, 0] }));
  const tx = canvasTex(256, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = color || COL.coralD; c.font = '900 92px Assistant, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 4); });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(r * 1.7, r * .85), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false })); p.position.z = .05; p.userData.keep = true; g.add(p); return g; }
export function chest() { const g = new THREE.Group(); g.add(bx(1.0, .5, .62, COL.wood, { pos: [0, .25, 0] })); for (const x of [-.36, .36]) g.add(bx(.08, .52, .66, COL.honey, { pos: [x, .26, 0], inkW: .01 }));
  const lid = new THREE.Group(); lid.position.set(0, .5, -.31); g.add(lid); const lg = new THREE.CylinderGeometry(.31, .31, 1.0, 24, 1, false, 0, PI); const lm = mm(lg, COL.woodL, { mat: { side: THREE.DoubleSide }, rot: [0, 0, PI / 2], pos: [0, 0, .31], inkW: .012 }); lid.add(lm);
  for (const x of [-.36, .36]) lid.add(mm(new THREE.CylinderGeometry(.325, .325, .08, 24, 1, false, 0, PI), COL.honey, { rot: [0, 0, PI / 2], pos: [x, 0, .31], inkW: .008 }));
  const inner = bx(.9, .06, .52, COL.honey, { pos: [0, .5, 0], inkW: .006 }); g.add(inner); for (let i = 0; i < 8; i++) g.add(bl(.08, i % 2 ? COL.honey : COL.cream, { pos: [-.3 + (i % 4) * .2, .56 + (i > 3 ? .04 : 0), -.1 + (i > 3 ? .15 : 0)], inkW: .006 }));
  g.userData.lid = lid; return g; }
export function lantern() { const g = new THREE.Group(), WD = '#5A3A22';
  g.add(bx(.26, .045, .26, WD, { pos: [0, .022, 0], inkW: .01 }));
  const body = bx(.19, .3, .19, '#C9B58A', { pos: [0, .2, 0], inkW: .01 }); const mat = toon('#C9B58A', { emissive: 0x000000 }); body.material = mat; g.add(body);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(bx(.03, .32, .03, WD, { pos: [sx * .1, .2, sz * .1], inkW: .006, ink: false }));
  g.add(bx(.27, .05, .27, WD, { pos: [0, .385, 0], inkW: .01 })); g.add(mm(new THREE.ConeGeometry(.15, .1, 4), WD, { pos: [0, .46, 0], rot: [0, PI / 4, 0], box: true, inkW: .01 }));
  g.add(mm(new THREE.TorusGeometry(.07, .014, 8, 18), WD, { pos: [0, .56, 0], inkW: .008 }));
  const gl = glowSprite(0xFFC860, 1.4, 0); gl.position.y = .2; g.add(gl); const c0 = new THREE.Color('#D9C9A0'), c1 = new THREE.Color('#FFE08A'), e1 = new THREE.Color('#FFB84A');
  g.userData.set = k => { k = clamp(k, 0, 1.3); const m = Math.min(1, k); mat.color.copy(c0).lerp(c1, m); mat.emissive.copy(e1).multiplyScalar(.28 + .62 * m); gl.material.opacity = .15 + .7 * m; gl.scale.setScalar(.5 + 1.1 * Math.min(1.3, k)); };
  g.userData.set(0); return g; }
// a small house with 1-2 windows on +z; setLit(k)
export function house(o) {
  o = o || {}; const w = o.w || 1.6, d = o.d || 1.3, h = o.h || 1.2, g = new THREE.Group(), wins = [], glows = [];
  g.add(bx(w, h, d, o.col || COL.cream, { pos: [0, h / 2, 0] }));
  const s = new THREE.Shape(); s.moveTo(-w / 2 - .12, 0); s.lineTo(w / 2 + .12, 0); s.lineTo(0, h * .45); s.closePath(); const rg = new THREE.ExtrudeGeometry(s, { depth: d + .2, bevelEnabled: false }); rg.translate(0, 0, -(d + .2) / 2);
  g.add(mm(rg, o.roof || COL.coral, { pos: [0, h, 0], box: true, inkW: .015 }));
  const nW = o.nw || 2; g.add(bx(.28, .5, .05, COL.wood, { pos: [nW === 1 ? -w * .25 : 0, .25, d / 2 + .01], inkW: .008 }));
  for (let i = 0; i < nW; i++) { const x = nW === 1 ? w * .22 : (i - .5) * w * .52 * (nW === 2 ? 1 : 1) + (nW === 2 ? 0 : 0); const px = nW === 2 ? (i ? w * .27 : -w * .27) : w * .22, py = h * .62;
    g.add(bx(.36, .36, .04, COL.wood, { pos: [px, py, d / 2 + .02], inkW: .008 })); const wm = new THREE.Mesh(new THREE.PlaneGeometry(.28, .28), new THREE.MeshBasicMaterial({ color: '#C9D6DE', fog: false })); wm.position.set(px, py, d / 2 + .05); wm.userData.keep = true; g.add(wm); wins.push(wm);
    const gl = glowSprite(0xFFC860, 1.1, 0); gl.position.set(px, py, d / 2 + .15); g.add(gl); glows.push(gl); }
  const c0 = new THREE.Color('#C9D6DE'), c1 = new THREE.Color('#FFD36E');
  g.userData = { wins, setLit(k) { k = clamp(k, 0, 1); for (const m of wins) m.material.color.copy(c0).lerp(c1, k); for (const q of glows) { q.material.opacity = .75 * k; } }, winPos(i) { const m = wins[i]; return m.getWorldPosition(new THREE.Vector3()); } };
  return g;
}
// open book on a stand; open k 0..1 (cover opens), flip(t) handled by caller via pages[]
export function bookStand(o) {
  o = o || {}; const g = new THREE.Group(), s = o.scale || 1; g.add(cy(.12, .2, 1.0 * s, COL.woodD, { pos: [0, .5 * s, 0] })); g.add(cy(.45 * s, .5 * s, .08, COL.woodD, { pos: [0, .04, 0] }));
  const top = new THREE.Group(); top.position.set(0, 1.02 * s, 0); top.rotation.x = .42; g.add(top); top.add(bx(1.5 * s, .06, .95 * s, COL.wood, { pos: [0, 0, 0] })); top.add(bx(1.5 * s, .05, .06, COL.woodD, { pos: [0, .05, .45 * s], inkW: .008 }));
  const bk = new THREE.Group(); bk.position.y = .045; top.add(bk); const BW = .62 * s, BD = .84 * s, cover = o.cover || '#8C5A3C';
  bk.add(bx(BW * 2 + .06, .04, BD + .06, cover, { pos: [0, 0, 0], inkW: .01 })); const rb = bx(BW, .07, BD, COL.cream, { pos: [BW / 2, .055, 0], inkW: .008 }); bk.add(rb);
  const lf = new THREE.Group(); lf.position.set(0, .03, 0); bk.add(lf); const lpage = bx(BW, .07, BD, COL.cream, { pos: [-BW / 2, .035, 0], inkW: .008 }); lf.add(lpage); const lcov = bx(BW + .03, .03, BD + .06, cover, { pos: [-BW / 2, -.005, 0], inkW: .01 }); lf.add(lcov);
  const tx = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#FFF8EA'; c.fillRect(0, 0, w, h); c.strokeStyle = '#B8A584'; c.lineWidth = 3; const r = rng(7); for (let y = 24; y < h - 20; y += 16) { let x = 22; while (x < w - 30) { const L = 10 + r() * 28; c.beginPath(); c.moveTo(x, y); c.lineTo(Math.min(w - 22, x + L), y); c.stroke(); x += L + 8; } } });
  for (const sx of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(BW * .92, BD * .92), new THREE.MeshBasicMaterial({ map: tx })); pl.rotation.x = -PI / 2; pl.position.set(0, .075, 0); pl.userData.keep = true; (sx > 0 ? rb : lpage).add(pl); pl.position.set(0, .037, 0); }
  const pages = []; for (let i = 0; i < 5; i++) { const pv = new THREE.Group(); pv.position.set(0, .07 + i * .004, 0); bk.add(pv); pv.add(bx(BW * .98, .006, BD * .94, COL.cream, { pos: [BW / 2, 0, 0], inkW: .004, ink: true })); pages.push(pv); }
  const glow = glowSprite(0xFFD27A, 2.4 * s, 0); glow.position.set(0, .3, 0); bk.add(glow);
  g.userData = { lf, pages, glow, top, bk, BW };
  g.userData.setOpen = k => { lf.rotation.z = lerp(PI * .985, .03, k); for (let i = 0; i < 5; i++) pages[i].visible = true; };
  g.userData.setFlip = (i, k) => { pages[i].rotation.z = lerp(0, PI * .97 - .0, k) + (k > 0 && k < 1 ? 0 : 0); pages[i].position.y = .07 + (k < 1 ? .0 : 0) + i * .004 + sin(PI * k) * .02; };
  return g;
}
export function scrollObj(o) {   // rolled scroll along z-width; set(k): 0 closed roll .. 1 fully open
  o = o || {}; const g = new THREE.Group(), W = o.w || .9, L0 = o.len || 2.3;
  const tx = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#FFF4DA'; c.fillRect(0, 0, w, h); c.strokeStyle = '#B49A70'; c.lineWidth = 3; const r = rng(9); for (let y = 16; y < h; y += 14) { let x = 14; while (x < w - 14) { const l = 12 + r() * 40; c.beginPath(); c.moveTo(x, y); c.lineTo(Math.min(w - 14, x + l), y); c.stroke(); x += l + 8; } } });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(1, .012, W), [0, 1, 2, 3, 4, 5].map(i => i === 2 ? new THREE.MeshToonMaterial({ map: tx }) : toon('#FFF4DA'))); sheet.castShadow = true; g.add(sheet);
  const rl = cy(.12, .12, W + .06, COL.creamD, { rot: [PI / 2, 0, 0], inkW: .012 }), rr = cy(.12, .12, W + .06, COL.creamD, { rot: [PI / 2, 0, 0], inkW: .012 }); g.add(rl); g.add(rr);
  const knobs = [[-1, 1], [-1, -1], [1, 1], [1, -1]].map(q => { const kn = bl(.07, COL.wood, { inkW: .008 }); g.add(kn); return kn; });
  const rib = cy(.135, .135, .1, COL.coral, { rot: [PI / 2, 0, 0], inkW: .01 }); g.add(rib);
  const API = { g, set(k) { k = clamp(k, 0, 1); const L = lerp(.02, L0, k), rad = lerp(.16, .1, k), sc = rad / .12;
    sheet.scale.x = Math.max(.001, L); sheet.visible = k > .02; sheet.position.y = .006;
    rl.scale.set(sc, 1, sc); rr.scale.set(sc, 1, sc); rl.position.set(-L / 2, rad, 0); rr.position.set(L / 2, rad, 0); rr.visible = k > .02;
    [[-1, 1], [-1, -1], [1, 1], [1, -1]].forEach((q, i) => { knobs[i].position.set(q[0] * L / 2, rad, q[1] * (W / 2 + .1)); knobs[i].visible = q[0] < 0 || k > .02; });
    rib.position.set(-L / 2, rad, 0); rib.visible = k < .3; rib.scale.set(1.1 * sc, 1, 1.1 * sc); } };
  API.set(o.k || 0); return API;
}
export function questionMark(c) { const g = new THREE.Group(), col = c || COL.coral;
  g.add(mm(new THREE.TorusGeometry(.4, .1, 12, 32, 4.36), col, { rot: [0, 0, -PI / 2], pos: [0, 1.15, 0], inkW: .02 }));
  g.add(cy(.1, .1, .3, col, { pos: [0, .62, 0], inkW: .02 })); g.add(bl(.13, col, { pos: [0, .22, 0], inkW: .02 })); return g; }
export function stormCloud(o) { o = o || {}; const g = new THREE.Group(), r = rng(o.seed || 3), P = [], s = o.size || 2.6; for (let i = 0; i < (o.n || 11); i++) { const b = bl(s * (.5 + r() * .35), o.col || '#A9A4AE', { inkW: .03, pos: [(i - 5) * s * .62 + (r() - .5) * s * .3, (r() - .4) * s * .5, (r() - .5) * s * 1.6] }); b.userData.s0 = b.scale.x; g.add(b); P.push(b); } g.userData.P = P; return g; }
export function rainCloud(Wd, pos, size, col) { const c = stormCloud({ n: 7, size, seed: 5, col: col || '#B6B2BC' }); c.position.set(...pos); Wd.add(c); return c; }
export function gauge() { const g = new THREE.Group(); g.add(cy(.07, .1, 1.5, COL.woodD, { pos: [0, .75, 0] })); g.add(cy(.4, .45, .08, COL.woodD, { pos: [0, .04, 0] })); const face = new THREE.Group(); face.position.set(0, 1.9, 0); g.add(face);
  face.add(cy(1.05, 1.05, .12, COL.wood, { rot: [PI / 2, 0, 0] })); face.add(cy(.95, .95, .14, COL.cream, { rot: [PI / 2, 0, 0], inkW: .008 }));
  for (let i = 0; i <= 10; i++) { const a = lerp(PI * .8, PI * .2, i / 10) , c = i < 4 ? COL.sage : i < 8 ? COL.honey : COL.coral; face.add(bx(.07, .22, .03, c, { pos: [Math.cos(a) * .75, Math.sin(a) * .75, .09], rot: [0, 0, a - PI / 2], inkW: .006 })); }
  const needle = new THREE.Group(); needle.position.z = .13; face.add(needle); needle.add(bx(.06, .8, .03, COL.coralD, { pos: [0, .4, 0], inkW: .008 })); face.add(bl(.08, COL.ink, { pos: [0, 0, .14], ink: false }));
  const tx = canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#3A2E28'; c.font = '900 52px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('0', 32, 34); }); const zero = new THREE.Mesh(new THREE.PlaneGeometry(.26, .26), new THREE.MeshBasicMaterial({ map: tx, transparent: true })); zero.position.set(Math.cos(PI * .8) * .5, Math.sin(PI * .8) * .5 - .02, .1); zero.userData.keep = true; face.add(zero);
  g.userData = { needle }; needle.rotation.z = PI * .3 + PI / 2 - PI / 2; return g; }

// ---------- cameras ----------
// keys: [[frac 0..1, pos, look, fov], ...] spread over dur
export const cm = (dur, keys) => path(keys.map(k => [k[0] * dur, k[1], k[2], k[3]]));
export const orb = (c, r, h, a0, a1, dur, fov, ly) => t => { const u = ease.io(clamp(t / dur, 0, 1)), a = lerp(a0, a1, u) * D, hh = typeof h === 'number' ? h : lerp(h[0], h[1], u), rr = typeof r === 'number' ? r : lerp(r[0], r[1], u); return { pos: [c[0] + Math.sin(a) * rr, c[1] + hh, c[2] + Math.cos(a) * rr], look: [c[0], c[1] + (ly || 0), c[2]], fov }; };


// =====================================================================================
// k13 hero objects: TRACK (ring <-> road), BALL, START line, GATE, ROAD, LAMP (the person), GLASSES (slim), pines, gear, hourglass
// =====================================================================================
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, fog: false }, o || {}));
export const bm = (geo, c, o) => { const m = new THREE.Mesh(geo, BASIC(c, o)); m.userData.keep = true; return m; };
export const cmp = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), clamp(k, 0, 1));
export function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}

// ---- TRACK: ring (k=0) that unrolls into a straight road along -z (k=1) ----
export function track(o) {
  o = o || {}; const R = o.R || 4, n = o.n || 72, w = o.w || 1.2, L = 2 * PI * R, ds = L / n, g = new THREE.Group(), tiles = [], marks = [], cols = o.cols || ['#F7F3EA', '#E3DAC6'];
  for (let i = 0; i < n; i++) {
    const t = new THREE.Group(); t.add(bx(w, .12, ds * 1.05, cols[i % 2], { pos: [0, .06, 0], inkW: .008 }));
    const mk = bm(new THREE.BoxGeometry(w * .72, .02, ds * .22), 0xE9B64A); mk.position.set(0, .13, 0); t.add(mk); marks.push(mk);
    g.add(t); tiles.push(t);
  }
  const edge = []; for (const s of [-1, 1]) { const e = []; for (let i = 0; i < n; i++) { const m = bx(.08, .1, ds * 1.05, '#6B8CAE', { pos: [s * (w / 2 + .04), .1, 0], ink: false }); tiles[i].add(m); e.push(m); } edge.push(e); }
  const API = { g, R, L, n, w, B: [], marks, tiles, k: 0 };
  API.set = function (k) {
    k = clamp(k, 0, 1); API.k = k; const kap = (1 - k) / R; let x = 0, z = 0, ph = 0; const B = [[0, 0, 0]];
    for (let i = 0; i < n; i++) { const pm = ph + kap * ds / 2; x += ds * Math.sin(pm); z -= ds * Math.cos(pm); ph += kap * ds; B.push([x, z, ph]); }
    for (let i = 0; i < n; i++) { const a = B[i], b = B[i + 1]; tiles[i].position.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2); tiles[i].rotation.y = -(a[2] + b[2]) / 2; }
    API.B = B; return API;
  };
  API.at = function (s, wrap) {
    const B = API.B; if (wrap) s = ((s % L) + L) % L; const f = clamp(s / ds, 0, n - 1e-6), i = Math.floor(f), u = f - i;
    if (s > L) { const e = B[n], ph = e[2], d = s - L; return { x: e[0] + d * Math.sin(ph), z: e[1] - d * Math.cos(ph), ph }; }
    const a = B[i], b = B[i + 1]; return { x: lerp(a[0], b[0], u), z: lerp(a[1], b[1], u), ph: lerp(a[2], b[2], u) };
  };
  API.set(o.k || 0); return API;
}
// glowing rolling ball (stripe bands show the roll)
export function ballHero(r) {
  r = r || .4; const g = new THREE.Group(), roll = new THREE.Group(); g.add(roll);
  roll.add(mm(new THREE.SphereGeometry(r, 28, 18), '#F2C25C', { mat: { emissive: new THREE.Color(0x6B4A10) }, inkW: .02 }));
  roll.add(mm(new THREE.TorusGeometry(r * .98, r * .09, 8, 28), COL.coral, { rot: [0, PI / 2, 0], inkW: .008 }));
  roll.add(mm(new THREE.TorusGeometry(r * .98, r * .09, 8, 28), COL.coral, { rot: [0, 0, 0], inkW: .008 }));
  const gl = glowSprite(0xFFD27A, r * 7, .6); g.add(gl); g.userData = { roll, gl, r };
  g.userData.on = (tr, s, wrap, lift) => { const p = tr.at(s, wrap); g.position.set(p.x + tr.g.position.x, r + .12 + (lift || 0), p.z + tr.g.position.z); g.rotation.y = -p.ph; roll.rotation.x = -s / r; };
  return g;
}
// START line: checker bar across the track, glow param
export function startLine(w, o) {
  o = o || {}; w = w || 1.8; const g = new THREE.Group(), n = 8, cw = w / n;
  for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) g.add(bx(cw, .04, .22, (i + r) % 2 ? '#2F3440' : '#F7F3EA', { pos: [-w / 2 + cw * (i + .5), .15, (r - .5) * .22], ink: false }));
  g.add(bx(.12, 1.5, .12, COL.coral, { pos: [-w / 2 - .1, .75, 0], inkW: .012 })); g.add(bx(.12, 1.5, .12, COL.coral, { pos: [w / 2 + .1, .75, 0], inkW: .012 }));
  const banner = bx(w + .32, .3, .1, COL.honey, { pos: [0, 1.5, 0], inkW: .012 }); g.add(banner);
  const gl = glowSprite(0xFFD27A, w * 3.4, 0); gl.position.set(0, .8, 0); g.add(gl); const beam = bm(new THREE.PlaneGeometry(w, 4), 0xFFE9A8, { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }); beam.position.y = 2.2; g.add(beam);
  g.userData.set = k => { gl.material.opacity = .4 * k; beam.material.opacity = .12 * k; gl.scale.setScalar(w * (1.8 + 1.2 * k)); };
  return g;
}
// GATE: arch of light. s = scale. set(k) 0..1 brightness
export function gate(o) {
  o = o || {}; const s = o.s || 1, g = new THREE.Group(), inner = new THREE.Group(); inner.scale.setScalar(s); g.add(inner);
  for (const x of [-5, 5]) inner.add(bx(1.2, 9, 1.2, COL.cream, { pos: [x, 4.5, 0], inkW: .02 }));
  inner.add(mm(new THREE.TorusGeometry(5, .6, 12, 40, PI), COL.honey, { pos: [0, 9, 0], inkW: .03, mat: { emissive: new THREE.Color(0x3A2A08) } }));
  inner.add(bx(14, .7, 1.8, COL.cream, { pos: [0, .35, .2], inkW: .02 }));
  const sh = new THREE.Shape(); sh.moveTo(-4.5, 0); sh.lineTo(4.5, 0); sh.lineTo(4.5, 9); sh.absarc(0, 9, 4.5, 0, PI, false); sh.lineTo(-4.5, 0);
  const pl = bm(new THREE.ShapeGeometry(sh, 24), 0xFFF3CF, { transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide }); pl.position.z = .05; inner.add(pl);
  const gl = glowSprite(0xFFD27A, 17 * s, .4); gl.position.set(0, 7 * s, .6 * s); g.add(gl);
  const rays = []; for (let i = 0; i < 5; i++) { const r = bm(new THREE.PlaneGeometry(1, 1), 0xFFE9A8, { transparent: true, opacity: .1, depthWrite: false, side: THREE.DoubleSide }); r.scale.set(2 * s, 26 * s, 1); r.position.set((i - 2) * 2.4 * s, 12 * s, .8 * s); r.rotation.z = (i - 2) * .12; g.add(r); rays.push(r); }
  g.userData = { pl, gl, rays, inner };
  g.userData.set = k => { k = clamp(k, 0, 1.2); pl.material.opacity = .55 * Math.min(1, k); gl.material.opacity = .38 * k; rays.forEach((r, i) => r.material.opacity = (.035 + .015 * Math.sin(i * 2)) * k); };
  return g;
}
// ROAD: long slab along -z with edge lines and dashes
export function road(Wd, o) {
  o = o || {}; const w = o.w || 3.6, z0 = o.z0 === undefined ? 4 : o.z0, z1 = o.z1 === undefined ? -90 : o.z1, len = z0 - z1, x = o.x || 0, g = new THREE.Group(); g.position.set(x, 0, (z0 + z1) / 2);
  g.add(bx(w, .1, len, '#F7F3EA', { pos: [0, .05, 0], inkW: .01 }));
  for (const s of [-1, 1]) g.add(bx(.14, .12, len, '#6B8CAE', { pos: [s * (w / 2 - .12), .1, 0], ink: false }));
  const nd = Math.floor(len / 3); for (let i = 0; i < nd; i++) g.add(bx(.18, .02, 1.2, i % 2 ? '#E9B64A' : '#F0CD7E', { pos: [0, .11, len / 2 - 1.5 - i * 3], ink: false }));
  if (Wd) Wd.add(g); return g;
}
// pines: snowy cone trees
export function pine(h, c) {
  h = h || 3; const g = new THREE.Group(); g.add(cy(.12, .16, h * .25, COL.woodD, { pos: [0, h * .125, 0], inkW: .015 }));
  for (let i = 0; i < 3; i++) { const r = h * (.42 - i * .1), y = h * (.3 + i * .22); g.add(mm(new THREE.ConeGeometry(r, h * .36, 7), c || COL.pine, { pos: [0, y + h * .13, 0], inkW: .02, box: true })); g.add(mm(new THREE.ConeGeometry(r * .55, h * .13, 7), '#F7F3EA', { pos: [0, y + h * .25, 0], inkW: .01, box: true })); }
  return g;
}
export function pines(Wd, o) {
  const r = rng(o.seed || 3), n = o.n || 30, a = o.area || [-20, 20, -20, 20], out = [];
  for (let i = 0; i < n; i++) { const x = lerp(a[0], a[1], r()), z = lerp(a[2], a[3], r()); if (o.avoid && Math.hypot(x - o.avoid[0], z - o.avoid[1]) < o.avoid[2]) continue; if (o.clear && Math.abs(x - (o.clear[0] || 0)) < o.clear[1]) continue;
    const p = pine((o.h || 2.6) * (.75 + r() * .6), [COL.pine, '#5E8E7A', '#3F6C5A'][i % 3]); p.position.set(x, 0, z); p.rotation.y = r() * 6; Wd.add(p); out.push(p); }
  return out;
}
// LAMP = the person (terracotta body, mustard glow). set(k) 0..1.3
export function lamp(o) {
  o = o || {}; const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(cy(.22, .26, .1, COL.coral, { pos: [0, .05, 0], inkW: .015 }));
  const gm = toon('#F9D98A', { emissive: new THREE.Color(0xE9A82A) }); const gl3 = mm(new THREE.CylinderGeometry(.19, .21, .46, 20), '#F9D98A', { pos: [0, .33, 0], inkW: .015 }); gl3.material = gm; body.add(gl3);
  for (let i = 0; i < 4; i++) { const a = i * PI / 2 + PI / 4; body.add(bx(.04, .5, .04, COL.coral, { pos: [Math.sin(a) * .2, .33, Math.cos(a) * .2], rot: [0, a, 0], inkW: .008 })); }
  body.add(cy(.25, .22, .08, COL.coral, { pos: [0, .6, 0], inkW: .015 })); body.add(mm(new THREE.ConeGeometry(.22, .18, 20), COL.coral, { pos: [0, .73, 0], inkW: .015, box: true }));
  body.add(mm(new THREE.TorusGeometry(.1, .02, 8, 18), COL.coralD, { pos: [0, .88, 0], inkW: .008 }));
  const core = bl(.1, '#FFF1C0', { pos: [0, .33, 0], ink: false }); core.material = BASIC(0xFFF6D4); core.userData.keep = true; body.add(core);
  const glow = glowSprite(0xFFC860, 2.2, .5); glow.position.y = .33; g.add(glow);
  g.userData = { body, glow, core, gm, s0: o.s || 1 };
  g.userData.set = k => { k = clamp(k, 0, 1.4); gm.emissive.set(0xE9A82A).multiplyScalar(.35 + .65 * Math.min(1, k)); glow.material.opacity = .25 + .55 * Math.min(1.2, k); glow.scale.setScalar(1.5 + 1.6 * k); core.scale.setScalar(.8 + .5 * k); };
  g.userData.set(o.k === undefined ? 1 : o.k); if (o.s) g.scale.setScalar(o.s); return g;
}
// GLASSES: SLIM, dark-blue, rectangular-rounded frames. set haze via o.haze(t)
export function glassesK(Wd, o) {
  o = o || {}; const LW = .95, LH = .56, gap = .2, g = new THREE.Group(), hazes = [], tints = [], lensObjs = [], R = LH / 2 + .05;
  const hz = canvasTex(64, 64, (c, w, h) => { const q = c.createRadialGradient(32, 32, 4, 32, 32, 32); q.addColorStop(0, 'rgba(255,255,255,.85)'); q.addColorStop(1, 'rgba(255,255,255,1)'); c.fillStyle = q; c.fillRect(0, 0, w, h); });
  for (const s of [-1, 1]) {
    const lens = new THREE.Group(); lens.position.set(s * (LW / 2 + gap / 2), 0, 0); g.add(lens); lensObjs.push(lens);
    const outer = rrShape(LW + .09, LH + .09, .2), hole = rrShape(LW, LH, .17); outer.holes.push(new THREE.Path(hole.getPoints(14)));
    const geo = new THREE.ExtrudeGeometry(outer, { depth: .07, bevelEnabled: false, curveSegments: 10 }); geo.translate(0, 0, -.035); lens.add(mm(geo, COL.frame, { box: true, inkW: .012 }));
    const tint = bm(new THREE.ShapeGeometry(rrShape(LW, LH, .17), 10), 0xE8F3FC, { transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide }); lens.add(tint); tints.push(tint);
    const hzm = bm(new THREE.ShapeGeometry(rrShape(LW, LH, .17), 10), COL.haze, { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, map: hz }); hzm.position.z = .01; hzm.renderOrder = 4; lens.add(hzm); hazes.push(hzm);
    const sh = bm(new THREE.PlaneGeometry(.34, .03), 0xFFFFFF, { transparent: true, opacity: .55 }); sh.position.set(-LW * .22, LH * .28, .02); sh.rotation.z = .5; lens.add(sh);
    g.add(bx(.05, .05, 1.0, COL.frame, { pos: [s * (LW + gap / 2 + .06), .12, -.5], inkW: .006 }));
  }
  g.add(bx(gap + .06, .05, .06, COL.frame, { pos: [0, .13, 0], inkW: .008 }));
  const info = { g, R, lensObjs, haze: 0, LW, LH };
  const upd = t => { const h = clamp(o.haze ? o.haze(t) : 0, 0, 1); info.haze = h; for (const z of hazes) { z.material.opacity = h * .9; z.visible = h > .005; } for (const q of tints) q.material.opacity = .14 - .1 * h; };
  if (Wd) Wd.on(upd); g.traverse(q => { if (q.isMesh) q.castShadow = false; });
  if (o.pos) g.position.set(...o.pos); if (o.scale) g.scale.setScalar(o.scale);
  if (Wd && o.add !== false) Wd.add(g); return info;
}
// GEAR: axis = z. teeth around.
export function gear(r, teeth, thick, col, o) {
  o = o || {}; const g = new THREE.Group(); g.add(cy(r, r, thick, col, { rot: [PI / 2, 0, 0], inkW: .014 }));
  const tw = 2 * PI * r / teeth * .5; for (let i = 0; i < teeth; i++) { const a = i / teeth * PI * 2; g.add(bx(tw, r * .22, thick, col, { pos: [Math.cos(a) * (r + r * .09), Math.sin(a) * (r + r * .09), 0], rot: [0, 0, a + PI / 2], inkW: .008 })); }
  g.add(cy(r * .3, r * .3, thick * 1.5, o.hub || COL.honey, { rot: [PI / 2, 0, 0], inkW: .012 }));
  for (let i = 0; i < 4; i++) { const a = i * PI / 2; g.add(bx(r * .5, r * .12, thick * 1.1, o.hub || COL.honey, { pos: [Math.cos(a) * r * .6, Math.sin(a) * r * .6, 0], rot: [0, 0, a], ink: false })); }
  g.userData.r = r; g.userData.teeth = teeth; return g;
}
// HOURGLASS: set(k) 0 = full top .. 1 = empty top
export function hourglass(o) {
  o = o || {}; const g = new THREE.Group(), glassM = { transparent: true, opacity: .32, side: THREE.DoubleSide };
  g.add(cy(.45, .45, .08, COL.coral, { pos: [0, .04, 0] })); g.add(cy(.45, .45, .08, COL.coral, { pos: [0, 1.56, 0] }));
  for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3; g.add(cy(.03, .03, 1.5, COL.coralD, { pos: [Math.sin(a) * .4, .8, Math.cos(a) * .4], ink: false })); }
  g.add(mm(new THREE.ConeGeometry(.36, .7, 20, 1, true), COL.sky, { mat: glassM, pos: [0, 1.18, 0], rot: [PI, 0, 0], inkW: .01 })); g.add(mm(new THREE.ConeGeometry(.36, .7, 20, 1, true), COL.sky, { mat: glassM, pos: [0, .42, 0], inkW: .01 }));
  const top = mm(new THREE.ConeGeometry(.32, .62, 18), COL.honey, { pos: [0, 1.2, 0], rot: [PI, 0, 0], ink: false }), bot = mm(new THREE.ConeGeometry(.32, .62, 18), COL.honey, { pos: [0, .36, 0], ink: false }), st = cy(.018, .018, .6, COL.honey, { pos: [0, .8, 0], ink: false });
  g.add(top); g.add(bot); g.add(st);
  g.userData.set = k => { k = clamp(k, 0, 1); top.scale.set(Math.max(.01, 1 - k), Math.max(.01, 1 - k), Math.max(.01, 1 - k)); top.position.y = 1.55 - .35 * (1 - k) - .01; bot.scale.setScalar(Math.max(.01, k * .95 + .05)); bot.position.y = .08 + .31 * (k * .95 + .05); st.visible = k > .01 && k < .99; };
  g.userData.set(o.k || 0); return g;
}
// a small flame-lamp (old oil lamp)
export function oilLamp() { const g = new THREE.Group(); g.add(bl(.28, COL.coral, { scale: [1.1, .8, 1.1], pos: [0, .24, 0], inkW: .015 })); g.add(cy(.12, .2, .1, COL.coralD, { pos: [0, .05, 0] })); g.add(cy(.07, .09, .18, COL.coralD, { pos: [0, .52, 0] })); g.add(mm(new THREE.ConeGeometry(.04, .3, 6), COL.coralD, { pos: [.36, .32, 0], rot: [0, 0, -PI / 2.6], inkW: .008 }));
  const f = bl(.07, 0xFFD27A, { scale: [1, 1.7, 1], pos: [0, .72, 0], ink: false }); f.material = BASIC(0xFFD97A); g.add(f); const gl = glowSprite(0xFFC860, 1.6, .6); gl.position.y = .72; g.add(gl); g.userData = { f, gl }; return g; }
// telescope on a tripod, pointing along +z by default (rotate group to aim)
export function telescope() { const g = new THREE.Group(), tube = new THREE.Group(); tube.position.y = 1.15; g.add(tube);
  tube.add(cy(.1, .1, 1.1, COL.skyD, { pos: [0, 0, 0], rot: [PI / 2, 0, 0] })); tube.add(cy(.14, .14, .3, COL.slateD, { pos: [0, 0, .65], rot: [PI / 2, 0, 0] })); tube.add(cy(.06, .06, .2, COL.slateD, { pos: [0, 0, -.6], rot: [PI / 2, 0, 0] })); tube.add(cy(.15, .15, .04, COL.honey, { pos: [0, 0, .81], rot: [PI / 2, 0, 0], inkW: .008 }));
  for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3 + .4; g.add(cy(.025, .03, 1.2, COL.woodD, { pos: [Math.sin(a) * .22, .56, Math.cos(a) * .22], rot: [Math.cos(a) * .3, 0, -Math.sin(a) * .3], ink: false })); }
  g.userData.tube = tube; return g; }
