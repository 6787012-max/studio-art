// wt.js - shared module for the stef_38 film (witness sight lines). Pure functions of t. No Hebrew anywhere.
import { THREE, ink, world, box, cyl, ball, mesh, toon, label, canvasTex, ease, prog, clamp, lerp, rng } from '../../lib/stage3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const PAL = { back: 0xE9E2D3, stone: 0xD8C9A8, wood: 0x6B4A32, red: 0xC2453A, green: 0x4FA35A, gold: 0xE8B830, fat: 0xF3EBD3, lettuce: 0x7DBA5A, sky: 0xCFE6F2, drop: 0xA8281F };
const INK = 0x8C7650, WINK = 0x2E1D12;
export const sm = (x, a, b) => { const u = clamp((x - a) / Math.max(b - a, 1e-6), 0, 1); return u * u * (3 - 2 * u); };
const fr = x => ((x % 1) + 1) % 1;
const C = h => new THREE.Color(h);
export const lp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
export const arc = (a, b, u, hgt) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + (hgt || 0) * Math.sin(Math.PI * u), lerp(a[2], b[2], u)];
const sc1 = (o, k) => o.scale.setScalar(Math.max(k, 1e-4));

// ---------------- glow sprite ----------------
let GT = null;
function glowTex() { if (GT) return GT; GT = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 2, 64, 64, 62); r.addColorStop(0, 'rgba(255,236,170,.95)'); r.addColorStop(.4, 'rgba(255,214,110,.4)'); r.addColorStop(1, 'rgba(255,214,110,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); return GT; }
export function glow(parent, size, color) {
  const m = new THREE.SpriteMaterial({ map: glowTex(), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, color: color || 0xFFFFFF });
  const s = new THREE.Sprite(m); s.scale.setScalar(size); s.renderOrder = 4; s.visible = false; parent.add(s);
  return { s, set(a) { a = clamp(a, 0, 1); m.opacity = a; s.visible = a > .01; } };
}

// ---------------- world: parchment hall, arcade backdrop, tiled floor ----------------
export function mkWorld(o) {
  o = o || {};
  const Wd = world({ ground: null, skyTop: o.skyTop === undefined ? 0xEFE9DA : o.skyTop, skyBottom: o.skyBottom === undefined ? 0xE9E2D3 : o.skyBottom, fogColor: o.fogColor === undefined ? 0xE9E2D3 : o.fogColor,
    fogNear: 38, fogFar: 110, hemi: o.hemi === undefined ? 1.45 : o.hemi, sun: o.sun === undefined ? 1.0 : o.sun, sunPos: [-6 + (o.cx || 0), 12, 8], shadowExt: o.ext || 12, hemiSky: 0xffffff, hemiGround: 0xe3d8bf, sunColor: o.sunColor || 0xFFF4E0 });
  const fc = o.floor || ['#E6DDC8', '#DDD2BA', '#E0D6BF'];
  const ft = canvasTex(128, 128, (g, w, h) => { g.fillStyle = fc[0]; g.fillRect(0, 0, w, h); g.fillStyle = fc[1]; g.fillRect(0, 0, w / 2, h / 2); g.fillRect(w / 2, h / 2, w / 2, h / 2); g.strokeStyle = fc[2]; g.lineWidth = 3; g.strokeRect(1, 1, w - 2, h - 2); }, [60, 60]);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshLambertMaterial({ map: ft })); fl.rotation.x = -Math.PI / 2; fl.position.set(o.cx || 0, 0, 0); fl.receiveShadow = true; Wd.add(fl);
  // far soft arcade
  const cx = o.cx || 0, span = o.span || 60, ac = o.arch || [0xDCD1B9, 0xD3C8AE], gl = o.glass || PAL.sky;
  for (let x = cx - span - 20, i = 0; x <= cx + span + 20; x += 10, i++) {
    const g = new THREE.Group(); g.position.set(x, 0, -26 - (i % 2) * 3); Wd.add(g); const c = ac[i % 2];
    [-3.3, 3.3].forEach(px => g.add(mesh(new THREE.BoxGeometry(1.8, 9, 1.8), toon(c), { pos: [px, 4.5, 0], ink: false, cast: false })));
    g.add(mesh(new THREE.TorusGeometry(3.3, .9, 8, 28, Math.PI), toon(c), { pos: [0, 9, 0], ink: false, cast: false }));
    const win = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 9), new THREE.MeshBasicMaterial({ color: gl })); win.position.set(0, 4.5, -.8); g.add(win);
    const wt = new THREE.Mesh(new THREE.CircleGeometry(2.7, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color: gl })); wt.position.set(0, 9, -.8); g.add(wt);
  }
  return Wd;
}
export function motes(Wd, n, seed, o) {
  o = o || {}; const r = rng(seed || 1), g = new THREE.Group(), arr = []; Wd.add(g); const geo = new THREE.SphereGeometry(1, 8, 6);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 3 ? 0xFFFFFF : 0xFFE9A0, transparent: true, opacity: .7, fog: false, depthWrite: false })); m.scale.setScalar(.03 + r() * .05); g.add(m);
    arr.push({ m, x: (o.cx || 0) + (r() - .5) * (o.w || 14), y0: r() * (o.h || 5), z: lerp(o.z0 === undefined ? -5 : o.z0, o.z1 === undefined ? 5 : o.z1, r()), sp: .05 + r() * .1, ph: r() * 6.28 });
  }
  const Hh = o.h || 5;
  Wd.on(t => arr.forEach(a => { const u = fr((a.y0 + t * a.sp) / Hh); a.m.position.set(a.x + .2 * Math.sin(t * .4 + a.ph), .3 + u * Hh, a.z); a.m.material.opacity = .7 * Math.sin(Math.PI * u); }));
  return g;
}
// foreground topiary (frame-corner parallax)
export function topiary(Wd, x, z, s) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s || 1); Wd.add(g);
  g.add(cyl(.5, .38, .7, 0xC98A5E, { pos: [0, .35, 0], inkW: .02, inkColor: 0x6A3A1E }));
  const b = ball(.72, 0x6FAE5C, { pos: [0, 1.5, 0], inkW: .03, inkColor: 0x2F6B33 }); g.add(b);
  g.add(cyl(.07, .07, .5, 0x6B4A32, { pos: [0, .95, 0], ink: false })); return { g, b };
}

// ---------------- marks ----------------
export function xMark(sz) {
  sz = sz || 1; const g = new THREE.Group(), mk = a => { const b = box(1.5, .17, .09, PAL.red, { ink: false }); b.material.emissive = C(0x6a1a14); b.material.emissiveIntensity = .5; b.rotation.z = a; g.add(b); }; mk(Math.PI / 4); mk(-Math.PI / 4);
  return { g, set(k) { sc1(g, sz * ease.out(clamp(k, 0, 1))); g.visible = k > .01; } };
}
export function checkMark(sz) {
  sz = sz || 1; const g = new THREE.Group(), a = box(.5, .17, .09, PAL.green, { ink: false, rot: [0, 0, -Math.PI / 4], pos: [-.3, -.12, 0] }), b = box(1.1, .17, .09, PAL.green, { ink: false, rot: [0, 0, Math.PI / 4], pos: [.2, .08, 0] });
  [a, b].forEach(m => { m.material.emissive = C(0x1a5a2a); m.material.emissiveIntensity = .5; g.add(m); });
  return { g, set(k) { sc1(g, sz * ease.out(clamp(k, 0, 1))); g.visible = k > .01; } };
}
// PROHIBITION ring: white translucent disc + red outline; red bar swipes over it
export function prohib(Wd, R) {
  R = R || .8; const g = new THREE.Group(); Wd.add(g); const mats = [];
  const tm = (c, op) => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, fog: false }); mats.push([m, op]); return m; };
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R * .96, 48), tm(0xFFFFFF, .26)); disc.renderOrder = 6; g.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R * .93, R * .085, 10, 56), tm(PAL.red, 1)); rim.renderOrder = 7; g.add(rim);
  const L = R * 1.72, piv = new THREE.Group(); piv.rotation.z = -Math.PI / 4; g.add(piv);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(L, R * .2, R * .05), tm(PAL.red, 1)); bar.renderOrder = 8; bar.position.z = R * .02; piv.add(bar);
  let a = 1, kp = 0;
  const T = { g, R, mats,
    pop(k) { kp = clamp(k, 0, 1); sc1(g, ease.out(kp)); g.visible = kp > .01; },
    bar(k) { k = clamp(k, 0, 1); bar.scale.x = Math.max(k, 1e-4); bar.position.x = -L / 2 + L / 2 * k; bar.visible = k > .005; },
    alpha(v) { a = v; mats.forEach(q => { q[0].opacity = q[1] * v; }); } };
  T.bar(0); T.pop(0); return T;
}
export function numberTag(Wd, txt, pos, h, o) { o = o || {}; const lb = label(Wd, txt, { size: 110, height: h || .5, bg: o.bg || 'rgba(255,248,224,.95)', color: o.color || '#6B4A32', pos }); lb.userData.s0 = lb.scale.clone(); lb.visible = false; return lb; }
export function pop(sp, k) { sp.scale.set(sp.userData.s0.x * Math.max(k, .0001), sp.userData.s0.y * Math.max(k, .0001), 1); sp.visible = k > .01; }
export function clockRing(parent, o) {
  o = o || {}; const R = o.R || .6, g = new THREE.Group(); g.position.set(...(o.pos || [0, 2.3, 0])); parent.add(g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R * .95, 48), new THREE.MeshBasicMaterial({ color: 0xFFF6DC, fog: false })); disc.position.z = -.02; g.add(disc);
  g.add(mesh(new THREE.TorusGeometry(R, .035, 8, 72), toon(0xB8871B), { ink: false }));
  const segs = [], N = 72;
  for (let i = 0; i < N; i++) { const a = i / N * 2 * Math.PI; const s = new THREE.Mesh(new THREE.BoxGeometry(.05, .1, .05), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xE2B43C : 0xF0C44E, fog: false })); s.position.set(Math.sin(a) * R * .86, Math.cos(a) * R * .86, 0); s.rotation.z = -a; s.visible = false; g.add(s); segs.push(s); }
  const hand = new THREE.Group(); hand.add(box(.035, R * .75, .02, 0xB8871B, { pos: [0, R * .375, .02], ink: false })); g.add(hand);
  const dig = []; for (let n = 1; n <= 6; n++) { const lb = label({ add: x => g.add(x) }, String(n), { size: 120, bg: null, color: '#8a5a10', height: .34, pos: [0, -.02, .05] }); lb.visible = false; dig.push(lb); }
  return { g, set(k) { const n = Math.floor(k * N + 1e-6); segs.forEach((s, i) => { s.visible = i < n; }); hand.rotation.z = -k * 2 * Math.PI; const left = k <= 0 || k >= 1 ? 0 : clamp(Math.ceil((1 - k) * 6), 1, 6); dig.forEach((d, i) => { d.visible = (i + 1) === left; }); },
    fade(a) { sc1(g, a); g.visible = a > .01; } };
}
export function heroProxy(Wd, c, sz) {
  const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), new THREE.MeshBasicMaterial()); m.visible = false; g.add(m); g.position.set(...c); Wd.add(g); return g;
}
export function puff(Wd) {
  const g = new THREE.Group(); Wd.add(g); const arr = [];
  for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0, depthWrite: false, fog: false })); g.add(m); arr.push({ m, a: i * .9, y: (i % 3) * .12 }); }
  return { g, set(k, pos) { k = clamp(k, 0, 1); g.visible = k > .005 && k < .995; if (pos) g.position.set(pos[0], pos[1], pos[2]); arr.forEach(q => { const r = .12 + .5 * ease.out(k); q.m.position.set(Math.cos(q.a) * r, q.y + .3 * k, Math.sin(q.a) * r * .6); q.m.scale.setScalar(.13 * (1 - k * .4) + 1e-4); q.m.material.opacity = .8 * (1 - k); }); } };
}
export function sparkles(Wd, n, seed) {
  const r = rng(seed || 2), arr = []; for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xFFF2A8, transparent: true, fog: false })); Wd.add(s); arr.push({ s, a: r() * 6.28, ph: i / n }); }
  return { set(pos, a, t, R) { R = R || .7; arr.forEach((q, i) => { const u = fr((t || 0) * .3 + q.ph), z = .1 * Math.sin(Math.PI * u) * a; q.s.position.set(pos[0] + Math.cos(q.a + i) * R, pos[1] + u * 1.8, pos[2] + Math.sin(q.a + i) * R * .6); q.s.scale.set(z + 1e-4, z + 1e-4, z * .3 + 1e-4); q.s.rotation.y = (t || 0) * 2 + i; q.s.visible = z > .004; }); } };
}
// thin line between two world points (grows a -> b)
export function link3(Wd, color, r) {
  const m = mesh(new THREE.CylinderGeometry(r || .03, r || .03, 1, 8), new THREE.MeshBasicMaterial({ color: color || PAL.red }), { ink: false, cast: false }); m.visible = false; Wd.add(m);
  const up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3();
  return { m, set(a, b, k) { k = clamp(k, 0, 1); d.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const L = d.length() * k; m.visible = k > .01 && L > 1e-3; if (!m.visible) return; d.normalize(); m.quaternion.setFromUnitVectors(up, d); m.scale.set(1, L, 1); m.position.set(a[0] + d.x * L / 2, a[1] + d.y * L / 2, a[2] + d.z * L / 2); } };
}

// ---------------- COURT: dais, long table, three tall chairs (empty), warm lamp ----------------
export function court(Wd, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g); const WD = PAL.wood, WD2 = 0x543823;
  g.add(box(8.4, .2, 4.4, 0xCDBD99, { pos: [0, .1, 0], inkW: .02, inkColor: INK }));
  g.add(box(7.6, .2, 3.6, PAL.stone, { pos: [0, .3, -.1], inkW: .02, inkColor: INK }));
  const TY = .4;
  g.add(box(5.6, .14, 1.2, WD, { pos: [0, TY + .95, .75], inkW: .02, inkColor: WINK }));
  [[-2.6, .38], [2.6, .38], [-2.6, 1.12], [2.6, 1.12]].forEach(p => g.add(box(.16, .95, .16, WD2, { pos: [p[0], TY + .475, p[1]], inkW: .015, inkColor: WINK })));
  g.add(box(5.2, .06, .9, 0x7D5A3E, { pos: [0, TY + 1.04, .75], ink: false, cast: false }));
  [-2.15, 0, 2.15].forEach((x, i) => {
    const h = i === 1 ? 1.14 : 1, cg = new THREE.Group(); cg.position.set(x, TY, -.95); g.add(cg);
    cg.add(box(1.15, .16, 1.0, WD, { pos: [0, .62, 0], inkW: .02, inkColor: WINK }));
    [[-.5, -.42], [.5, -.42], [-.5, .42], [.5, .42]].forEach(p => cg.add(box(.12, .62, .12, WD2, { pos: [p[0], .31, p[1]], inkW: .012, inkColor: WINK })));
    cg.add(box(1.15, 2.2 * h, .14, WD, { pos: [0, .7 + 1.1 * h, -.45], inkW: .02, inkColor: WINK }));
    cg.add(cyl(.575, .575, .14, WD, { rot: [Math.PI / 2, 0, 0], pos: [0, .7 + 2.2 * h, -.45], inkW: .02, inkColor: WINK }));
    cg.add(box(.82, 1.35 * h, .04, 0x84603F, { pos: [0, .95 + .6 * h, -.37], ink: false, cast: false }));
    [-1, 1].forEach(sd => cg.add(box(.1, .1, .9, WD2, { pos: [sd * .56, 1.05, 0], inkW: .01, inkColor: WINK })));
  });
  const lp = new THREE.Group(); lp.position.set(0, 4.3, -.1); g.add(lp);
  lp.add(cyl(.025, .025, 6, 0x4A3A2A, { pos: [0, 3.1, 0], ink: false }));
  lp.add(cyl(.18, .8, .55, 0xF3EBD3, { pos: [0, 0, 0], inkW: .02, inkColor: INK }));
  const bulb = ball(.22, 0xFFE9A0, { pos: [0, -.3, 0], ink: false }); bulb.material.emissive = C(0xFFC84A); bulb.material.emissiveIntensity = .2; lp.add(bulb);
  const gs = glow(lp, 3.4); gs.s.position.set(0, -.3, .2);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(2.9, 40), new THREE.MeshBasicMaterial({ color: 0xFFD98A, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, .405, .2); g.add(pool);
  return { g, lamp(k, t) { k = clamp(k, 0, 1); bulb.material.emissiveIntensity = .2 + 1.0 * k; gs.set(k * (.85 + .15 * Math.sin((t || 0) * 2.3))); pool.material.opacity = .32 * k; lp.rotation.z = .015 * Math.sin((t || 0) * .9); } };
}

// ---------------- WITNESSES: two stone tablets topped by an eye-like lens ----------------
export function witnesses(Wd, gap) {
  gap = gap || 1.2; const g = new THREE.Group(); Wd.add(g); const P = [];
  [-1, 1].forEach(sd => {
    const p = new THREE.Group(); p.position.x = sd * gap / 2; g.add(p);
    p.add(box(.9, 1.6, .55, PAL.stone, { pos: [0, .8, 0], inkW: .02, inkColor: INK }));
    p.add(cyl(.45, .45, .55, PAL.stone, { rot: [Math.PI / 2, 0, 0], pos: [0, 1.6, 0], inkW: .02, inkColor: INK }));
    p.add(box(1.1, .16, .75, 0xCDBD99, { pos: [0, .08, 0], inkW: .015, inkColor: INK }));
    const lens = new THREE.Group(); lens.position.set(0, 2.55, .05); p.add(lens);
    lens.add(cyl(.46, .46, .14, 0xFFF6DC, { rot: [Math.PI / 2, 0, 0], inkW: .015, inkColor: INK }));
    lens.add(mesh(new THREE.TorusGeometry(.46, .06, 8, 32), toon(PAL.gold), { pos: [0, 0, .06], ink: false }));
    const iris = ball(.24, 0x6FAAD6, { pos: [0, 0, .1], inkW: .01, inkColor: 0x1B3A6A }); iris.scale.z = .5; iris.material.emissive = C(0x9FD0FF); iris.material.emissiveIntensity = 0; lens.add(iris);
    lens.add(ball(.1, 0x1B2A3A, { pos: [0, 0, .2], ink: false }));
    const gs = glow(lens, 2.2, 0xCFE6FF); gs.s.position.z = .3;
    P.push({ p, lens, iris, gs });
  });
  return { g, posts: P, light(k, t) { k = clamp(k, 0, 1); P.forEach((q, i) => { q.iris.material.emissiveIntensity = 1.1 * k; q.gs.set(.75 * k * (.85 + .15 * Math.sin((t || 0) * 3 + i))); sc1(q.lens, 1 + .12 * k * Math.sin((t || 0) * 4 + i)); q.lens.rotation.y = .25 * Math.sin((t || 0) * .8 + i) * (1 - k * .5); }); } };
}

// ---------------- BELL on a gallows; swings; rings of light ----------------
export function bell(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(cyl(.09, .13, 3.4, PAL.wood, { pos: [0, 1.7, 0], inkW: .015, inkColor: WINK })); g.add(cyl(.5, .6, .18, PAL.stone, { pos: [0, .09, 0], inkW: .015, inkColor: INK }));
  g.add(box(1.5, .12, .12, PAL.wood, { pos: [.7, 3.4, 0], inkW: .012, inkColor: WINK }));
  const piv = new THREE.Group(); piv.position.set(1.3, 3.36, 0); g.add(piv);
  const pts = [[.52, 0], [.5, .06], [.42, .26], [.33, .56], [.24, .86], [.14, 1.0], [.04, 1.06]].map(p => new THREE.Vector2(p[0], p[1]));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), toon(PAL.gold, { side: THREE.DoubleSide, emissive: 0xFFC84A, emissiveIntensity: 0 })); body.position.y = -1.18; body.castShadow = true; ink(body, .02, 0x7A5A10); piv.add(body);
  piv.add(mesh(new THREE.TorusGeometry(.1, .035, 8, 16), toon(0x7A5A10), { pos: [0, -.08, 0], ink: false }));
  const clap = ball(.11, 0x7A5A10, { pos: [0, -1.12, 0], ink: false }); piv.add(clap);
  const fx = new THREE.Group(); fx.position.set(1.3, 2.05, .1); g.add(fx); const rings = [];
  for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(.6, .035, 8, 40), new THREE.MeshBasicMaterial({ color: 0xFFD04A, transparent: true, opacity: 0, depthWrite: false, fog: false })); m.visible = false; fx.add(m); rings.push(m); }
  return { g, piv, body,
    swing(t, amp) { piv.rotation.z = amp * Math.sin(t * 12) ; clap.position.x = -.15 * amp * Math.sin(t * 12 - 1); body.material.emissiveIntensity = Math.min(1, Math.abs(amp)) * .5; },
    ringFx(a, t) { rings.forEach((m, i) => { const u = fr(t * 1.4 + i / 3); m.scale.setScalar(.5 + 2.4 * u); m.material.opacity = .85 * a * (1 - u); m.visible = a > .02; }); },
    top() { return [g.position.x + 1.3, g.position.y + 2.1, g.position.z]; } };
}

// ---------------- 40 tally beads on a rod; the 40th pops off ----------------
export function beads(Wd, o) {
  o = o || {}; const N = 40, SP = o.sp || .2, Lr = (N - 1) * SP, g = new THREE.Group(); Wd.add(g);
  g.add(cyl(.03, .03, Lr + .9, 0xB89A5E, { rot: [0, 0, Math.PI / 2], inkW: .008, inkColor: INK }));
  [-1, 1].forEach(sd => { g.add(ball(.08, PAL.gold, { pos: [sd * (Lr / 2 + .48), 0, 0], inkW: .01, inkColor: 0x7A5A10 })); g.add(box(.14, o.leg === undefined ? 1.2 : o.leg, .14, PAL.wood, { pos: [sd * (Lr / 2 + .35), -(o.leg === undefined ? 1.2 : o.leg) / 2, 0], inkW: .01, inkColor: WINK })); });
  const B = []; for (let i = 0; i < N; i++) { const mt = toon(0xE4D6B0, { emissive: 0xE8B830, emissiveIntensity: 0 }); const b = mesh(new THREE.SphereGeometry(.088, 16, 12), mt, { pos: [-Lr / 2 + i * SP, 0, 0], inkW: .008, inkColor: INK }); g.add(b); B.push({ b, mt, x: -Lr / 2 + i * SP }); }
  const gl = glow(g, 1.1); const BASE = C(0xE4D6B0), GOLD = C(0xF2C230);
  return { g, B, Lr,
    // show k: beads appear one by one; pop k: 40th bead lifts off; gl: glow progress 0..1 across the 39; all: global glow 0..1
    set(S) { S = S || {}; const sh = S.show === undefined ? 1 : S.show, pp = S.pop || 0, gp = S.glow || 0, t = S.t || 0;
      B.forEach((q, i) => { const u = ease.out(prog(sh, i / N * .7, i / N * .7 + .3)); let vis = u > .01, px = q.x, py = 0, pz = 0, s = u;
        if (i === N - 1 && pp > 0) { const e = ease.io(pp); px = q.x + .9 * e; py = 2.6 * e + .25 * Math.sin(t * 3) * e; pz = .6 * e; s = u * (1 - .55 * e); vis = pp < .995; }
        q.b.visible = vis; q.b.position.set(px, py, pz); sc1(q.b, s * (i === N - 1 ? 1 : 1));
        const gi = i === N - 1 && pp > 0 ? Math.min(1, pp * 3) : ease.out(prog(gp, i / 39 * .75, i / 39 * .75 + .22));
        q.mt.color.copy(BASE).lerp(GOLD, gi); q.mt.emissiveIntensity = .75 * gi * (.88 + .12 * Math.sin(t * 4 + i * .6)) + (S.all || 0) * .25 * (.5 + .5 * Math.sin(t * 3 + i * .5)); });
      gl.set(0); },
    pos(i) { return [g.position.x + B[i].x * g.scale.x, g.position.y, g.position.z]; } };
}
// parchment scroll (no text) that unrolls downwards
export function scroll(Wd, w, H) {
  const g = new THREE.Group(); Wd.add(g);
  const sheet = box(w, 1, .05, 0xF6EBCB, { inkW: .015, inkColor: INK }); g.add(sheet);
  const trim = box(w - .3, 1, .01, 0xE7D5A4, { ink: false, cast: false, pos: [0, 0, .03] }); g.add(trim);
  const top = cyl(.2, .2, w + .5, 0x8A5A3B, { rot: [0, 0, Math.PI / 2], inkW: .015, inkColor: WINK }); g.add(top);
  const bot = cyl(.2, .2, w + .5, 0x8A5A3B, { rot: [0, 0, Math.PI / 2], inkW: .015, inkColor: WINK }); g.add(bot);
  [-1, 1].forEach(sd => { top.add(ball(.14, PAL.gold, { pos: [0, sd * (w + .6) / 2, 0], ink: false })); bot.add(ball(.14, PAL.gold, { pos: [0, sd * (w + .6) / 2, 0], ink: false })); });
  return { g, set(k) { k = ease.io(clamp(k, 0, 1)); const h = Math.max(H * k, .02); sheet.scale.y = h; trim.scale.y = Math.max(h - .3, .01); sheet.position.y = -h / 2; trim.position.y = -h / 2; top.position.y = 0; bot.position.y = -h; g.visible = k > .005; } };
}

// ---------------- FOODS ----------------
export function fatSlab(Wd, s) {
  const g = new THREE.Group(); g.scale.setScalar(s || 1); Wd.add(g);
  const m = mesh(new RoundedBoxGeometry(1.7, .62, 1.15, 4, .16), toon(PAL.fat, { emissive: 0x4A4020, emissiveIntensity: .14 }), { pos: [0, .31, 0], inkW: .02, inkColor: 0xB7A57A }); g.add(m);
  for (let i = 0; i < 3; i++) g.add(mesh(new THREE.SphereGeometry(.09 - i * .01, 10, 8), toon(0xFFFFFF), { pos: [-.5 + i * .1, .62, .2 - i * .2], scale: [1.6, .5, 1], ink: false, cast: false }));
  return { g, wob(t) { const w = Math.sin(t * 2.4); m.scale.set(1 + .035 * w, 1 - .05 * w, 1 + .03 * w); m.position.y = .31 - .015 * w; } };
}
export function meat(Wd, s) {
  const g = new THREE.Group(); g.scale.setScalar(s || 1); Wd.add(g);
  g.add(mesh(new RoundedBoxGeometry(1.5, .5, 1.0, 4, .16), toon(0x9A4B3C), { pos: [0, .25, 0], inkW: .02, inkColor: 0x4A1E14 }));
  g.add(mesh(new RoundedBoxGeometry(1.0, .1, .4, 3, .05), toon(0xC1705C), { pos: [-.05, .5, .1], ink: false, cast: false }));
  return { g };
}
export function board(Wd, w, d) { const g = new THREE.Group(); Wd.add(g); g.add(box(w, .2, d, 0xB58A5A, { pos: [0, .1, 0], inkW: .02, inkColor: WINK })); g.add(box(w - .4, .02, d - .4, 0xC49A68, { pos: [0, .205, 0], ink: false, cast: false })); return { g, top: .21 }; }
export function milk(Wd, s) {
  const g = new THREE.Group(); g.scale.setScalar(s || 1); Wd.add(g);
  g.add(cyl(.4, .4, .08, 0xBBD6E4, { pos: [0, .04, 0], inkW: .01, inkColor: 0x5A7A8A }));
  g.add(cyl(.44, .38, 1.25, 0xFFFFFF, { pos: [0, .7, 0], inkW: .012, inkColor: 0x9AA5AD }));
  const gl = new THREE.Mesh(new THREE.CylinderGeometry(.5, .42, 1.75, 28, 1, true), new THREE.MeshToonMaterial({ color: 0xDDEFF7, transparent: true, opacity: .26, depthWrite: false, side: THREE.DoubleSide })); gl.position.y = .92; gl.renderOrder = 3; g.add(gl);
  g.add(mesh(new THREE.TorusGeometry(.5, .04, 8, 28), toon(0xBBD6E4), { pos: [0, 1.8, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  return { g };
}
export function bowl(Wd, s) {
  const g = new THREE.Group(); g.scale.setScalar(s || 1); Wd.add(g);
  const pts = [[.01, 0], [.7, 0], [1.2, .35], [1.45, .85], [1.38, .9], [1.12, .45], [.01, .3]].map(p => new THREE.Vector2(p[0], p[1]));
  const b = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), toon(PAL.fat, { side: THREE.DoubleSide })); b.castShadow = true; b.receiveShadow = true; ink(b, .02, 0xB7A57A); g.add(b);
  const fl = new THREE.Mesh(new THREE.CircleGeometry(1.2, 36), toon(PAL.drop)); fl.rotation.x = -Math.PI / 2; fl.position.y = .55; g.add(fl);
  return { g, fl };
}
export function dropShape(Wd, s) {
  const g = new THREE.Group(); g.scale.setScalar(s || 1); Wd.add(g);
  const pts = []; for (let i = 0; i <= 28; i++) { const u = i / 28; pts.push(new THREE.Vector2(.42 * Math.sin(Math.PI * Math.pow(u, .62)) * (1 - .08 * u), u * 1.35 - .65)); }
  pts[pts.length - 1].x = 0;
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), toon(PAL.drop, { emissive: 0x5A0E08, emissiveIntensity: .35 })); m.castShadow = true; ink(m, .025, 0x4A0E08); g.add(m);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), new THREE.MeshBasicMaterial({ color: 0xFFE3DE })); hl.scale.set(.7, 1.6, .6); hl.position.set(-.18, -.25, .33); g.add(hl);
  return { g, wob(t) { const w = Math.sin(t * 2.6); m.scale.set(1 + .04 * w, 1 - .03 * w, 1 + .04 * w); } };
}
// simple icons on a round plate: cow head, antlers, bird (silhouettes)
export function animalIcon(Wd, kind) {
  const g = new THREE.Group(); Wd.add(g); const D = 0x4A4A55;
  g.add(cyl(.62, .62, .1, 0xFFF6DC, { rot: [Math.PI / 2, 0, 0], inkW: .02, inkColor: INK }));
  const f = new THREE.Group(); f.position.z = .08; g.add(f);
  const e = (r, sx, sy, p, c) => { const m = ball(r, c || D, { pos: p, inkW: .012, inkColor: 0x1A1A20 }); m.scale.set(sx, sy, .4); f.add(m); return m; };
  const cn = (r, h, p, rz, c) => f.add(mesh(new THREE.ConeGeometry(r, h, 8), toon(c || D), { pos: p, rot: [0, 0, rz], inkW: .01, inkColor: 0x1A1A20 }));
  if (kind === 'cow') { e(.26, 1, 1.2, [0, -.04, 0]); e(.11, 1.6, .8, [-.34, .08, 0]); e(.11, 1.6, .8, [.34, .08, 0]); cn(.06, .26, [-.2, .32, 0], .5, 0xE8DCC0); cn(.06, .26, [.2, .32, 0], -.5, 0xE8DCC0); e(.16, 1.2, .8, [0, -.22, .05], 0xD9A9A0); }
  else if (kind === 'deer') { e(.2, 1, 1.25, [0, -.14, 0]); e(.08, 1.3, .8, [-.24, -.04, 0]); e(.08, 1.3, .8, [.24, -.04, 0]);
    [-1, 1].forEach(sd => { f.add(mesh(new THREE.CylinderGeometry(.03, .03, .5, 6), toon(0x8A5A3B), { pos: [sd * .2, .2, 0], rot: [0, 0, sd * -.35], inkW: .008, inkColor: 0x2E1D12 })); f.add(mesh(new THREE.CylinderGeometry(.025, .025, .3, 6), toon(0x8A5A3B), { pos: [sd * .38, .3, 0], rot: [0, 0, sd * -.9], inkW: .008, inkColor: 0x2E1D12 })); f.add(mesh(new THREE.CylinderGeometry(.025, .025, .28, 6), toon(0x8A5A3B), { pos: [sd * .3, .46, 0], rot: [0, 0, sd * .1], inkW: .008, inkColor: 0x2E1D12 })); }); }
  else { e(.3, 1.2, .85, [-.04, -.05, 0]); e(.14, 1, 1, [.22, .13, 0]); cn(.06, .2, [.4, .12, 0], -Math.PI / 2, 0xE8A23A); e(.17, 1.5, .6, [-.08, -.02, .02], 0x6B4A32); cn(.08, .3, [-.4, -.12, 0], Math.PI / 2 + .3, 0x6B4A32); }
  return { g };
}

// ---------------- ANT ----------------
export function ant(Wd, s) {
  s = s || 1; const g = new THREE.Group(); g.rotation.order = 'YXZ'; Wd.add(g); const body = new THREE.Group(); g.add(body);
  const col = 0x3B2A22, ic = 0x120C08;
  const mk = (r, sx, sy, sz, pos) => { const m = ball(r, col, { pos, inkW: .014, inkColor: ic }); m.scale.set(sx, sy, sz); body.add(m); return m; };
  mk(.22, 1, .9, 1.25, [0, .3, -.38]); mk(.14, 1, .9, 1.1, [0, .3, -.02]); mk(.15, 1, .95, 1, [0, .32, .26]);
  [-1, 1].forEach(sd => { body.add(ball(.04, 0xFFFFFF, { pos: [sd * .08, .37, .37], ink: false })); body.add(cyl(.012, .012, .3, col, { pos: [sd * .11, .52, .4], rot: [.9, 0, sd * -.4], ink: false })); });
  const legs = []; for (let i = 0; i < 6; i++) { const side = i < 3 ? -1 : 1, k = i % 3, pv = new THREE.Group(); pv.position.set(0, .28, -.14 + k * .13); body.add(pv);
    pv.add(cyl(.014, .014, .4, col, { pos: [side * .156, -.124, 0], rot: [0, 0, side * .9], ink: false })); legs.push({ pv, ph: ((i + k) % 2) * Math.PI }); }
  body.scale.setScalar(s);
  return { g, body, s, set(t, walk, k) { k = k === undefined ? 1 : k; sc1(body, s * k); g.visible = k > .01; legs.forEach(l => { l.pv.rotation.y = walk * .55 * Math.sin(t * 11 + l.ph); }); body.position.y = Math.abs(Math.sin(t * 11)) * .015 * walk * s; } };
}

// ---------------- LETTUCE head (layered leaves) ----------------
const LEAFC = [0x7DBA5A, 0x8CC96A, 0x6BAA4C, 0x93D070];
export function lettuce(Wd, o) {
  o = o || {}; const s = o.s || 1, g = new THREE.Group(); g.scale.setScalar(s); Wd.add(g); const r = rng(o.seed || 5), leaves = [];
  g.add(ball(.42, 0xCFE69A, { pos: [0, .5, 0], inkW: .02, inkColor: 0x4F7A2E }));
  [[7, .32, 1.15], [5, .9, 1.0], [4, 1.3, .85]].forEach((rg, ri) => { for (let k = 0; k < rg[0]; k++) {
    const pv = new THREE.Group(); pv.rotation.order = 'YXZ'; pv.position.set(0, .12 + ri * .1, 0); pv.rotation.y = k / rg[0] * Math.PI * 2 + ri * .55; pv.rotation.x = -rg[1]; g.add(pv); const L = rg[2];
    const lf = ball(1, LEAFC[(k + ri) % 4], { pos: [0, .05, L * .62], inkW: .03, inkColor: 0x3F7A2E }); lf.scale.set(L * .44, .07, L * .62); pv.add(lf);
    pv.add(box(.04, .03, L * 1.0, 0xC9E8A0, { pos: [0, .12, L * .6], ink: false, cast: false }));
    leaves.push({ pv, tilt: rg[1], ph: r() * 6.28, L }); } });
  const T = { g, leaves, s, sway(t, a) { a = a === undefined ? 1 : a; leaves.forEach(l => { l.pv.rotation.x = -l.tilt + .035 * a * Math.sin(t * 1.2 + l.ph); }); },
    // world point on leaf i, distance d along it, up above the surface
    leafPoint(i, d, up) { const l = leaves[i], v = new THREE.Vector3(0, up, d).applyEuler(l.pv.rotation).add(l.pv.position).multiplyScalar(s).add(g.position); return { pos: [v.x, v.y, v.z], rot: [l.pv.rotation.x, l.pv.rotation.y, 0] }; } };
  return T;
}
// flat standing leaf for the fan (s14): group pivot at base, rotation.z = fan angle
export function fanLeaf(parent, color, seed) {
  const pv = new THREE.Group(); parent.add(pv);
  const lf = ball(1, color, { pos: [0, 1.75, 0], inkW: .03, inkColor: 0x3F7A2E }); lf.scale.set(.85, 1.75, .07); pv.add(lf);
  pv.add(box(.05, 3.0, .03, 0xC9E8A0, { pos: [0, 1.75, .08], ink: false, cast: false }));
  return pv;
}
export function lens(Wd, R) {
  R = R || .6; const g = new THREE.Group(); Wd.add(g);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(R * .95, 36), new THREE.MeshBasicMaterial({ color: 0xCFE6F2, transparent: true, opacity: .32, depthWrite: false, fog: false })); glass.renderOrder = 6; g.add(glass);
  g.add(mesh(new THREE.TorusGeometry(R, R * .12, 10, 40), toon(PAL.gold), { inkW: .015, inkColor: 0x7A5A10 }));
  g.add(cyl(R * .1, R * .1, R * 1.2, PAL.wood, { pos: [R * 1.2, -R * 1.2, 0], rot: [0, 0, Math.PI / 4], inkW: .012, inkColor: WINK }));
  const sh = new THREE.Mesh(new THREE.CircleGeometry(R * .22, 12), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .55, depthWrite: false, fog: false })); sh.position.set(-R * .4, R * .42, .01); sh.scale.set(1.5, .5, 1); sh.rotation.z = .6; g.add(sh);
  return { g, R, pop(k) { sc1(g, ease.out(clamp(k, 0, 1))); g.visible = k > .01; } };
}

// ---------------- TEVEL: cart with a heap of red fruit ----------------
const DULL = C(0xA8584E), RED = C(PAL.red), DULLC = C(0x7A3A34), CROWN = C(0x7A2018);
export function fruit(r, color) {
  const g = new THREE.Group(); const m = ball(r, color || PAL.red, { inkW: .018, inkColor: 0x5A1A12 }); g.add(m);
  const c = mesh(new THREE.ConeGeometry(r * .3, r * .38, 8), toon(0x7A2018), { pos: [0, r * .95, 0], ink: false }); g.add(c);
  return { g, m, c, set(k) { m.material.color.copy(DULL).lerp(RED, k); m.material.emissive.setHex(0x8A1A10); m.material.emissiveIntensity = .22 * k; c.material.color.copy(DULLC).lerp(CROWN, k); } };
}
export function cart(Wd, n) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(box(3.7, .3, 2.1, PAL.wood, { pos: [0, .75, 0], inkW: .02, inkColor: WINK }));
  [[0, 1.0, 1.05, 3.7, .5, .08], [0, 1.0, -1.05, 3.7, .5, .08]].forEach(p => g.add(box(p[3], p[4], p[5], 0x84603F, { pos: [p[0], p[1], p[2]], inkW: .015, inkColor: WINK })));
  [[-1.85, 0], [1.85, 0]].forEach(p => g.add(box(.08, .5, 2.1, 0x84603F, { pos: [p[0], 1.0, 0], inkW: .015, inkColor: WINK })));
  [-1.2, 1.2].forEach(x => [-1.15, 1.15].forEach(z => { g.add(cyl(.6, .6, .16, 0x5A3C28, { rot: [Math.PI / 2, 0, 0], pos: [x, .6, z], inkW: .02, inkColor: WINK })); g.add(cyl(.12, .12, .2, PAL.gold, { rot: [Math.PI / 2, 0, 0], pos: [x, .6, z], ink: false })); }));
  g.add(box(.12, .12, 1.4, 0x84603F, { pos: [-2.4, .95, 0], rot: [0, 0, .25], inkW: .012, inkColor: WINK }));
  const F = []; const lay = [[4, 3, .74, 1.38], [3, 2, .74, 2.0], [2, 1, .74, 2.6], [1, 1, 0, 3.1]];
  lay.forEach(L => { for (let ix = 0; ix < L[0]; ix++) for (let iz = 0; iz < L[1]; iz++) { const f = fruit(.4); f.g.position.set((ix - (L[0] - 1) / 2) * L[2], L[3], (iz - (L[1] - 1) / 2) * L[2] * .95); g.add(f.g); F.push(f); } });
  return { g, F, bright(k, t) { F.forEach(f => f.set(k)); } };
}
export function pile(Wd, s, n) {
  const g = new THREE.Group(); g.scale.setScalar(s || 1); Wd.add(g); const F = []; const P = [[-.4, .4, .1], [.4, .4, -.05], [0, .4, .5], [0, .4, -.5], [0, 1.0, 0]];
  P.slice(0, n || 5).forEach(p => { const f = fruit(.4); f.g.position.set(p[0], p[1], p[2]); g.add(f.g); F.push(f); });
  return { g, F, bright(k) { F.forEach(f => f.set(k)); } };
}
export function pedestal(Wd, x, z, h) { h = h || 1.0; const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g); g.add(cyl(.85, 1.0, h, PAL.stone, { pos: [0, h / 2, 0], inkW: .02, inkColor: INK })); g.add(cyl(1.0, 1.0, .1, 0xCDBD99, { pos: [0, h + .05, 0], inkW: .015, inkColor: INK })); const b = cyl(1.0, 1.0, .1, 0xCDBD99, { pos: [0, .05, 0], inkW: .015, inkColor: INK }); g.add(b); return { g, top: h + .1, x, z }; }
export function basket(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(cyl(.95, .72, .8, 0xF6F3EA, { pos: [0, .4, 0], inkW: .02, inkColor: 0x8A8478 }));
  [.12, .46, .78].forEach((y, i) => g.add(mesh(new THREE.TorusGeometry(.72 + (y / .8) * .23, .05, 8, 36), toon(0x3F7FD0), { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], ink: false })));
  g.add(mesh(new THREE.TorusGeometry(.95, .09, 8, 36, Math.PI), toon(0x3F7FD0), { pos: [0, .8, 0], rot: [0, 0, 0], inkW: .01, inkColor: 0x1B3A6A }));
  return { g };
}
export function tray(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(cyl(1.0, .85, .14, 0xFAF7EE, { pos: [0, .07, 0], inkW: .015, inkColor: 0x8A8478 }));
  g.add(mesh(new THREE.TorusGeometry(1.0, .06, 8, 40), toon(PAL.gold), { pos: [0, .14, 0], rot: [Math.PI / 2, 0, 0], inkW: .008, inkColor: 0x7A5A10 }));
  return { g };
}
export function hatPeg(Wd, pos) {
  const g = new THREE.Group(); g.position.set(...pos); Wd.add(g);
  g.add(cyl(.5, .6, .14, PAL.stone, { pos: [0, .07, 0], inkW: .015, inkColor: INK })); g.add(cyl(.07, .07, 2.0, PAL.wood, { pos: [0, 1.0, 0], inkW: .01, inkColor: WINK }));
  const h = new THREE.Group(); h.position.set(0, 2.1, 0); g.add(h); h.add(cyl(.7, .7, .05, 0xE3C46A, { inkW: .012, inkColor: 0x8A6A1A }));
  h.add(mesh(new THREE.SphereGeometry(.4, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xEBD07E), { pos: [0, .02, 0], inkW: .012, inkColor: 0x8A6A1A }));
  h.add(mesh(new THREE.TorusGeometry(.41, .05, 8, 28), toon(0x8A5A3B), { pos: [0, .08, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  return { g };
}
// tithe rig: basket on pedestal with 10 fruits, tray on pedestal
export function tithe(Wd, bx, tx, z) {
  const pb = pedestal(Wd, bx, z, 1.0), pt = pedestal(Wd, tx, z, 1.0), bk = basket(Wd), tr = tray(Wd); bk.g.position.set(bx, pb.top, z); tr.g.position.set(tx, pt.top, z);
  const P = [[.5, .5, 0], [.25, .5, .43], [-.25, .5, .43], [-.5, .5, 0], [-.25, .5, -.43], [.25, .5, -.43], [.18, .78, .1], [-.18, .78, -.05], [0, .78, .22], [0, 1.0, 0]];
  const F = P.map(p => { const f = fruit(.27); f.g.position.set(bx + p[0], pb.top + p[1], z + p[2]); Wd.add(f.g); f.home = [bx + p[0], pb.top + p[1], z + p[2]]; return f; });
  return { pb, pt, bk, tr, F, trayTop: [tx, pt.top + .38, z], basketTop: [bx, pb.top + 1.0, z] };
}
// dome table (s05)
export function domeTable(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(box(13.0, .24, 2.8, PAL.wood, { pos: [0, 1.0, 0], inkW: .02, inkColor: WINK })); g.add(box(12.6, .06, 2.4, 0x7D5A3E, { pos: [0, 1.13, 0], ink: false, cast: false }));
  [-6.0, 6.0].forEach(x => [-1.0, 1.0].forEach(z => g.add(box(.3, 1.0, .3, 0x543823, { pos: [x, .5, z], inkW: .015, inkColor: WINK }))));
  const slots = [-5.0, -3.0, -1.0, 1.0, 3.0, 5.0]; const D = [];
  slots.forEach((x, i) => { g.add(cyl(.95, .95, .06, 0xF6F3EA, { pos: [x, 1.18, .0], inkW: .01, inkColor: 0x8A8478 }));
    const d = new THREE.Group(); d.position.set(x, 1.2, 0); g.add(d);
    d.add(mesh(new THREE.SphereGeometry(.88, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xD5DCE2, { emissive: 0x405060, emissiveIntensity: .06 }), { inkW: .02, inkColor: 0x5A6A7A })); d.add(ball(.1, 0xB8C2CC, { pos: [0, .95, 0], inkW: .01, inkColor: 0x5A6A7A }));
    D.push({ d, x, i }); });
  return { g, D, slots };
}
// BALANCE scale
export function balance(Wd, s) {
  const g = new THREE.Group(); g.scale.setScalar(s || 1); Wd.add(g);
  g.add(cyl(1.1, 1.3, .22, PAL.stone, { pos: [0, .11, 0], inkW: .02, inkColor: INK })); g.add(cyl(.1, .14, 3.2, PAL.wood, { pos: [0, 1.7, 0], inkW: .015, inkColor: WINK })); g.add(ball(.2, PAL.gold, { pos: [0, 3.35, 0], inkW: .012, inkColor: 0x7A5A10 }));
  const beam = new THREE.Group(); beam.position.set(0, 3.2, 0); g.add(beam); beam.add(box(3.6, .12, .14, PAL.gold, { inkW: .012, inkColor: 0x7A5A10 }));
  const mkPan = () => { const p = new THREE.Group(); g.add(p); p.add(cyl(.72, .62, .1, 0xFAF7EE, { pos: [0, 0, 0], inkW: .012, inkColor: 0x8A8478 })); p.add(mesh(new THREE.TorusGeometry(.72, .045, 8, 32), toon(PAL.gold), { pos: [0, .05, 0], rot: [Math.PI / 2, 0, 0], ink: false })); return p; };
  const pans = [mkPan(), mkPan()]; const strs = [0, 1].map(() => { const c = cyl(.015, .015, 1, 0x8A6A3A, { ink: false, cast: false }); g.add(c); return c; });
  const T = { g, pans, beam, set(tilt) { beam.rotation.z = tilt; [-1, 1].forEach((sd, i) => { const ex = sd * 1.7 * Math.cos(tilt), ey = 3.2 + sd * 1.7 * Math.sin(tilt); pans[i].position.set(ex, ey - 1.3, 0); strs[i].scale.y = 1.25; strs[i].position.set(ex, ey - .68, 0); }); },
    panTop(i) { const p = pans[i].position; return [g.position.x + p.x * g.scale.x, g.position.y + (p.y + .1) * g.scale.y, g.position.z]; } };
  T.set(0); return T;
}
export function olive(parent, p) { const o = ball(.28, 0x4F6B2A, { pos: p, inkW: .015, inkColor: 0x1E2E10 }); o.scale.set(1.3, .95, .95); parent.add(o); const h = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xDCEBB0 })); h.position.set(-.1, .15, .2); o.add(h); return o; }
export function bread(parent, p) { const b = mesh(new RoundedBoxGeometry(.6, .45, .5, 3, .12), toon(0xE8C98A), { pos: p, inkW: .015, inkColor: 0x8A6A1A }); parent.add(b); return b; }

// ---------------- edge decor for the calm clip backdrop (visible only in the 160 px side margins) ----------------
export function edgeDecor(Wd, kind, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z || 0); Wd.add(g); let anim = () => {};
  if (kind === 'column') { g.add(cyl(.5, .6, 3.4, PAL.stone, { pos: [0, 1.7, 0], inkW: .02, inkColor: INK })); g.add(cyl(.7, .6, .25, 0xCDBD99, { pos: [0, 3.5, 0], inkW: .02, inkColor: INK })); const b = ball(.28, 0xFFE9A0, { pos: [0, 4.0, 0], ink: false }); b.material.emissive = C(0xFFC84A); b.material.emissiveIntensity = .9; g.add(b); const gs = glow(g, 3.0); gs.s.position.set(0, 4.0, .2); anim = t => gs.set(.7 + .15 * Math.sin(t * 1.7)); }
  else if (kind === 'bell') { const bl = bell(g); bl.g.position.set(-.9, 0, 0); anim = t => { bl.swing(t, .06 * Math.sin(t * .5)); }; }
  else if (kind === 'lettuce') { g.add(cyl(.7, .8, 1.0, PAL.stone, { pos: [0, .5, 0], inkW: .02, inkColor: INK })); const L = lettuce(g, { s: .6, seed: 8 }); L.g.position.y = 1.0; anim = t => L.sway(t, 1); }
  else if (kind === 'fruit') { g.add(cyl(.7, .8, 1.0, PAL.stone, { pos: [0, .5, 0], inkW: .02, inkColor: INK })); const P = pile(g, .8, 5); P.g.position.y = 1.0; P.bright(1); }
  else { g.add(cyl(.7, .8, 1.0, PAL.stone, { pos: [0, .5, 0], inkW: .02, inkColor: INK })); const P = prohib(g, .6); P.g.position.y = 2.4; P.pop(1); P.bar(1); anim = t => { P.g.position.y = 2.4 + .08 * Math.sin(t * 1.3); }; }
  Wd.on(t => anim(t)); return { g };
}

// ======================= stef_38 additions: windows, witness posts, sight lines, rings =======================
export const TINT = { L: 0xC77DD8, R: 0x4FA8E0, gold: 0xE8B830, green: 0x4FA35A, red: 0xC2453A };
const GREY = C(0x9A9A94), v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
export const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

// small cream house-wall section with ONE square window (dark wood frame, sky glass)
export function windowWall(Wd, w) {
  w = w || 3.6; const H = 4.4, g = new THREE.Group(); Wd.add(g); const cream = 0xF3EBD3, ci = { inkW: .02, inkColor: INK }, y0 = 1.9, y1 = 3.7, sideW = (w - 1.8) / 2;
  g.add(box(w, y0, .3, cream, Object.assign({ pos: [0, y0 / 2, 0] }, ci)));
  g.add(box(w, H - y1, .3, cream, Object.assign({ pos: [0, y1 + (H - y1) / 2, 0] }, ci)));
  [-1, 1].forEach(s => g.add(box(sideW, y1 - y0, .3, cream, Object.assign({ pos: [s * (.9 + sideW / 2), (y0 + y1) / 2, 0] }, ci))));
  const fr = (bw, bh, x, y) => g.add(box(bw, bh, .22, PAL.wood, { pos: [x, y, .06], inkW: .012, inkColor: WINK }));
  fr(1.96, .16, 0, y1); fr(1.96, .16, 0, y0); fr(.16, 1.8, -.9, (y0 + y1) / 2); fr(.16, 1.8, .9, (y0 + y1) / 2);
  g.add(box(2.3, .12, .5, PAL.wood, { pos: [0, y0 - .06, .26], inkW: .012, inkColor: WINK }));
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ color: 0x9FD0F0, transparent: true, opacity: .8, fog: false })); gl.position.set(0, (y0 + y1) / 2, -.02); g.add(gl);
  g.add(box(w + .3, .22, .55, 0xB5835A, { pos: [0, H + .1, .05], inkW: .015, inkColor: WINK }));
  return { g, glass: gl };
}

// witness post: stone tablet + eye-lens disc, tinted rim/iris
export function wpost(Wd, tint) {
  const g = new THREE.Group(); Wd.add(g); const b = new THREE.Group(); g.add(b); const bodies = [];
  const bd = m => { bodies.push([m.material, m.material.color.clone()]); b.add(m); return m; };
  bd(box(.9, 1.6, .55, PAL.stone, { pos: [0, .8, 0], inkW: .02, inkColor: INK }));
  bd(cyl(.45, .45, .55, PAL.stone, { rot: [Math.PI / 2, 0, 0], pos: [0, 1.6, 0], inkW: .02, inkColor: INK }));
  bd(box(1.1, .16, .75, 0xCDBD99, { pos: [0, .08, 0], inkW: .015, inkColor: INK }));
  const lens = new THREE.Group(); lens.position.set(0, 2.55, .05); b.add(lens);
  lens.add(cyl(.46, .46, .14, 0xFFF6DC, { rot: [Math.PI / 2, 0, 0], inkW: .015, inkColor: INK }));
  const rim = mesh(new THREE.TorusGeometry(.46, .07, 8, 32), toon(tint), { pos: [0, 0, .06], ink: false }); lens.add(rim);
  const iris = ball(.25, tint, { pos: [0, 0, .1], inkW: .01, inkColor: 0x2A2A4A }); iris.scale.z = .5; iris.material.emissive = C(tint); iris.material.emissiveIntensity = 0; lens.add(iris);
  lens.add(ball(.1, 0x1B2A3A, { pos: [0, 0, .2], ink: false }));
  const gs = glow(lens, 2.4, tint); gs.s.position.z = .3;
  const crk = new THREE.Group(); crk.position.set(0, 0, .26); lens.add(crk); crk.visible = false;
  [[.0, .0, .62, .5], [.12, -.18, .4, -.4]].forEach(q => crk.add(box(.05, q[2], .03, 0x1A1A1A, { pos: [q[0], q[1], 0], rot: [0, 0, q[3]], ink: false })));
  const irisC = C(tint), rimC = C(tint);
  const P = { g, b, lens, tint, home: [0, 0, 0],
    show(k) { sc1(g, ease.out(clamp(k, 0, 1))); g.visible = k > .01; },
    light(k, t) { k = clamp(k, 0, 1); iris.material.emissiveIntensity = 1.1 * k; gs.set(.7 * k * (.85 + .15 * Math.sin((t || 0) * 3 + g.position.x))); sc1(lens, 1 + .1 * k * Math.sin((t || 0) * 4 + g.position.x)); },
    dull(k) { k = clamp(k, 0, 1); bodies.forEach(q => q[0].color.copy(q[1]).lerp(GREY, k * .8)); iris.material.color.copy(irisC).lerp(GREY, k); rim.material.color.copy(rimC).lerp(GREY, k); iris.material.emissive.copy(irisC).lerp(GREY, k); },
    crack(k) { crk.visible = k > .01; sc1(crk, clamp(k, 0, 1)); },
    relax(t, a) { b.position.y = .09 * a * Math.sin(t * 2.2 + g.position.x); b.rotation.z = .03 * a * Math.sin(t * 1.7 + g.position.x); },
    lensPos() { return [g.position.x, g.position.y + 2.55 * g.scale.y, g.position.z + .05]; } };
  return P;
}

// sight line: thin glowing tube, shimmer, draws a -> b
export function beam3(Wd, color, r) {
  r = r || .05; const g = new THREE.Group(); g.visible = false; Wd.add(g);
  const mk = (rad, op) => { const m = mesh(new THREE.CylinderGeometry(rad, rad, 1, 10), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, fog: false }), { ink: false, cast: false }); m.renderOrder = 5; g.add(m); return m; };
  const core = mk(r, .95), halo = mk(r * 3.2, .22), up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3(), ph = r * 100;
  return { g, set(a, bb, k, t, alpha) { k = clamp(k, 0, 1); d.set(bb[0] - a[0], bb[1] - a[1], bb[2] - a[2]); const L = d.length() * k, al = alpha === undefined ? 1 : alpha; g.visible = k > .01 && L > 1e-3 && al > .01; if (!g.visible) return;
      d.normalize(); g.quaternion.setFromUnitVectors(up, d); g.scale.set(1, L, 1); g.position.set(a[0] + d.x * L / 2, a[1] + d.y * L / 2, a[2] + d.z * L / 2);
      core.material.opacity = al * (.78 + .2 * Math.sin((t || 0) * 9 + ph)); halo.material.opacity = al * (.2 + .08 * Math.sin((t || 0) * 5 + ph)); const s = 1 + .18 * Math.sin((t || 0) * 7 + ph); halo.scale.set(s, 1, s); } };
}

// flat elliptical ring on the floor (+ faint fill)
export function floorRing(Wd, o) {
  const g = new THREE.Group(); g.position.set(o.cx, .07, o.cz); Wd.add(g); const pts = []; const rx = o.rx, rz = o.rz;
  for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz)); }
  const tm = new THREE.MeshBasicMaterial({ color: o.color, transparent: true, opacity: 1, depthWrite: false, fog: false });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, o.tube || .12, 8, true), tm); tube.renderOrder = 3; g.add(tube);
  const fm = new THREE.MeshBasicMaterial({ color: o.color, transparent: true, opacity: .14, depthWrite: false, fog: false });
  const fill = new THREE.Mesh(new THREE.CircleGeometry(1, 48), fm); fill.rotation.x = -Math.PI / 2; fill.scale.set(rx, rz, 1); fill.position.y = -.01; fill.renderOrder = 2; g.add(fill);
  g.visible = false;
  return { g, color(hex) { tm.color.set(hex); fm.color.set(hex); }, colorMix(h1, h2, u) { tm.color.set(h1).lerp(C(h2), clamp(u, 0, 1)); fm.color.copy(tm.color); },
    set(k, a) { a = a === undefined ? 1 : clamp(a, 0, 1); sc1(g, ease.out(clamp(k, 0, 1))); tm.opacity = a; fm.opacity = .15 * a; g.visible = k > .01 && a > .01; } };
}

// deed token: glossy red rounded cube on a stone plinth, pulsing red floor rings, seal
export function token(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(cyl(1.0, 1.15, .4, PAL.stone, { pos: [0, .2, 0], inkW: .02, inkColor: INK }));
  const cube = mesh(new RoundedBoxGeometry(1.2, 1.2, 1.2, 4, .22), toon(PAL.red, { emissive: 0x6A1A14, emissiveIntensity: .3 }), { pos: [0, 1.15, 0], inkW: .025, inkColor: 0x5A1A12 }); g.add(cube);
  const hi = new THREE.Mesh(new THREE.CircleGeometry(.12, 12), new THREE.MeshBasicMaterial({ color: 0xFFE4DC, transparent: true, opacity: .55, fog: false })); hi.position.set(-.3, 1.5, .62); g.add(hi);
  const rings = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, .06, 8, 56), new THREE.MeshBasicMaterial({ color: PAL.red, transparent: true, opacity: 0, depthWrite: false, fog: false })); m.rotation.x = -Math.PI / 2; m.position.y = .06; m.renderOrder = 3; m.visible = false; g.add(m); return m; });
  const sealG = new THREE.Group(); sealG.visible = false; g.add(sealG);
  sealG.add(cyl(.5, .5, .1, 0x9A2418, { inkW: .015, inkColor: 0x4A0E08 })); sealG.add(mesh(new THREE.TorusGeometry(.38, .04, 6, 28), toon(0xE8B8A8), { rot: [Math.PI / 2, 0, 0], pos: [0, .07, 0], ink: false }));
  return { g, cube, update(t, amp) { amp = amp === undefined ? .6 : amp; cube.rotation.y = t * .4; cube.position.y = 1.15 + .06 * Math.sin(t * 1.6); cube.material.emissiveIntensity = .22 + .35 * amp * (.5 + .5 * Math.sin(t * 3));
      rings.forEach((m, i) => { const u = fr(t * .55 + i * .5); m.scale.setScalar(1.1 + 1.9 * u); m.material.opacity = .65 * amp * (1 - u); m.visible = amp > .02; }); },
    seal(k) { k = clamp(k, 0, 1); sealG.visible = k > .01; sealG.position.set(0, 1.78 + (1 - ease.out(k)) * 2.4, 0); sc1(sealG, 1 - .0 * k); },
    aim() { return [g.position.x, 1.3, g.position.z]; } };
}

// opaque blocking wall that slides up out of the floor
export function blocker(Wd) {
  const g = new THREE.Group(); Wd.add(g); g.add(box(.6, 5.8, 3.8, PAL.stone, { pos: [0, 2.9, 0], inkW: .025, inkColor: INK })); g.add(box(.75, .25, 3.95, 0xCDBD99, { pos: [0, 5.85, 0], inkW: .02, inkColor: INK }));
  return { g, set(k) { k = clamp(k, 0, 1); g.position.y = -6.4 + 6.4 * ease.io(k); g.visible = k > .005; } };
}

// red stamp seal that drops onto something
export function stamp(Wd, R) {
  R = R || .5; const g = new THREE.Group(); g.visible = false; Wd.add(g);
  g.add(cyl(R, R, .12, 0x9A2418, { inkW: .015, inkColor: 0x4A0E08 })); g.add(mesh(new THREE.TorusGeometry(R * .74, .045, 6, 28), toon(0xE8B8A8), { rot: [Math.PI / 2, 0, 0], pos: [0, .08, 0], ink: false }));
  return { g, set(k, pos) { k = clamp(k, 0, 1); g.visible = k > .01; g.position.set(pos[0], pos[1] + (1 - ease.out(k)) * 2.6, pos[2]); } };
}

// the full stage: two windows, posts, token, bell, wall, rings, digits, marks
export function rig(Wd, o) {
  o = o || {}; const cx = o.cx || 0, X = o.X || 4.2, nL = o.nL === undefined ? 2 : o.nL, nR = o.nR === undefined ? 2 : o.nR, ws = o.ws || 1, sp = o.spread || 1.7, tz = o.tokZ === undefined ? 1.8 : o.tokZ, ZP = -.9;
  const R = { cx, X, tz };
  R.wl = windowWall(Wd, 3.6); R.wr = windowWall(Wd, 3.6); [R.wl, R.wr].forEach(w => w.g.scale.setScalar(ws));
  R.wl.g.position.set(cx - X, 0, -2.5); R.wl.g.rotation.y = .4; R.wr.g.position.set(cx + X, 0, -2.5); R.wr.g.rotation.y = -.4;
  R.L = []; R.R = [];
  for (let i = 0; i < nL; i++) { const p = wpost(Wd, TINT.L); p.home = [cx - X + (nL === 1 ? 0 : (i - (nL - 1) / 2) * sp), 0, ZP]; p.g.position.set(...p.home); p.g.rotation.y = .7; R.L.push(p); }
  for (let i = 0; i < nR; i++) { const p = wpost(Wd, TINT.R); p.home = [cx + X + (nR === 1 ? 0 : (i - (nR - 1) / 2) * sp), 0, ZP]; p.g.position.set(...p.home); p.g.rotation.y = -.7; R.R.push(p); }
  R.posts = R.L.concat(R.R);
  if (o.token !== false) { R.tok = token(Wd); R.tok.g.position.set(cx, 0, tz); } R.tokAim = [cx, 1.3, tz];
  if (o.bell !== false) { const s = .8; R.bl = bell(Wd); R.bl.g.scale.setScalar(s); R.bl.g.position.set(cx - 1.3 * s, 0, 4.0); R.bellAim = [cx, 2.2, 4.0]; R.bellS = s; } else R.bellAim = [cx, 2.2, 4.0];
  R.beams = R.posts.map(p => beam3(Wd, p.tint, .05));
  R.bK = beam3(Wd, TINT.gold, .07);
  R.wall = blocker(Wd); R.wall.g.position.set(cx, 0, -1.2); R.wall.set(0);
  R.ring1 = floorRing(Wd, { cx, cz: ZP, rx: X + 2.9, rz: 2.5, color: TINT.gold, tube: .14 });
  R.rL = floorRing(Wd, { cx: cx - X, cz: ZP, rx: 2.3, rz: 1.7, color: TINT.L }); R.rR = floorRing(Wd, { cx: cx + X, cz: ZP, rx: 2.3, rz: 1.7, color: TINT.R });
  R.d1 = numberTag(Wd, '1', [cx, 5.2, .4], 1.4); R.d2 = numberTag(Wd, '2', [cx, 5.2, .4], 1.4);
  R.redL = prohib(Wd, .85); R.redR = prohib(Wd, .85); R.okL = checkMark(1.0); R.okR = checkMark(1.0);
  R.redL.g.position.set(cx - X, 4.9, ZP); R.redR.g.position.set(cx + X, 4.9, ZP); R.okL.g.position.set(cx - X, 4.9, ZP); R.okR.g.position.set(cx + X, 4.9, ZP); Wd.add(R.okL.g); Wd.add(R.okR.g); R.okL.g.visible = R.okR.g.visible = false;
  R.lensL = () => R.L[R.L.length - 1].lensPos(); R.lensR = () => R.R[0].lensPos();
  // beam of post i toward the token (m=0) .. the bell (m=1)
  R.aim = (i, k, t, m, al) => { R.beams[i].set(R.posts[i].lensPos(), lerp3(R.tokAim, R.bellAim, m || 0), k, t, al); };
  R.aimAll = (k, t, m, al) => R.posts.forEach((p, i) => R.aim(i, k, t, m, al));
  R.hero = heroProxy(Wd, [cx, 2.2, 0], [10, 4.4, 3]);
  return R;
}

// calm backdrop under a clip: soft parchment hall, two windows at the far edges, drifting motes
export function calmEdges(Wd, cx, ws, X) {
  const a = windowWall(Wd, 3.6), b = windowWall(Wd, 3.6); a.g.scale.setScalar(ws || 1); b.g.scale.setScalar(ws || 1);
  a.g.position.set(cx - (X || 9), 0, -3); a.g.rotation.y = .45; b.g.position.set(cx + (X || 9), 0, -3); b.g.rotation.y = -.45; return [a, b];
}
