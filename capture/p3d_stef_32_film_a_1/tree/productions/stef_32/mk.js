// mk.js - shared module for the stef_32 film (the surrounded neighbour). Pure functions of t, no Math.random/Date. No Hebrew: digits only.
import { THREE, world, box, cyl, ball, mesh, toon, label, ease, prog, clamp, lerp, rng } from '../../lib/stage3d.js';

export const PAL = { sky: 0xCFE6F2, wheat: 0xE3B94A, meadow: 0x7FB86A, meadow2: 0x6AA35A, stone: 0xC9B48F, stone2: 0xD8C6A2, ink: 0x8C7650, coin: 0xF2C230, red: 0xC2453A, light: 0xFFF3C8, cream: 0xFFF6DC };
export const TO = 0.15, TI = 0.3;       // top of the outer plot / top of the inner field
const INK = 0x8C7650;
export const sm = (x, a, b) => { const u = clamp((x - a) / Math.max(b - a, 1e-6), 0, 1); return u * u * (3 - 2 * u); };
const fr = x => ((x % 1) + 1) % 1;
const C = h => new THREE.Color(h);

// ---------- soft glow sprite ----------
let GT = null;
function glowTex() {
  if (GT) return GT; const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  GT = new THREE.CanvasTexture(cv); return GT;
}
export function glow(parent, color, size) {
  const m = new THREE.SpriteMaterial({ map: glowTex(), color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, opacity: 0 });
  const s = new THREE.Sprite(m); s.scale.set(size, size, 1); s.renderOrder = 3; s.visible = false; parent.add(s);
  s.set = a => { m.opacity = clamp(a, 0, 1); s.visible = a > .01; }; return s;
}

// ---------- world: soft sky, far hills, green ground, a few clouds ----------
export function mkWorld(o) {
  o = o || {};
  const Wd = world({ ground: null, skyTop: o.skyTop === undefined ? 0xCFE6F2 : o.skyTop, skyBottom: o.skyBottom === undefined ? 0xEAF4F8 : o.skyBottom, fogColor: o.fogColor === undefined ? 0xE3F0F4 : o.fogColor,
    fogNear: o.fogNear || 30, fogFar: o.fogFar || 100, hemi: o.hemi === undefined ? 1.5 : o.hemi, sun: o.sun === undefined ? 1.0 : o.sun, sunPos: [-6, 12, 8], shadowExt: 9, hemiSky: 0xffffff, hemiGround: 0xcfe0b8, sunColor: o.sunColor || 0xFFF4E0 });
  const fl = new THREE.Mesh(new THREE.CircleGeometry(80, 64), new THREE.MeshLambertMaterial({ color: 0x7DB86C })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; Wd.add(fl); Wd.floor = fl;
  const hc = [0xB5D6B0, 0xA3CBA6, 0xC2DDB9, 0xA9D0B8]; const r = rng(77);
  for (let i = 0; i < 9; i++) { const rad = 8 + r() * 7; const h = new THREE.Mesh(new THREE.SphereGeometry(rad, 24, 12), new THREE.MeshLambertMaterial({ color: hc[i % 4] })); h.position.set(-48 + i * 12 + r() * 4, -rad * .55, -30 - r() * 12); h.scale.y = .62; Wd.add(h); }
  const clouds = [];
  for (let i = 0; i < 5; i++) { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, fog: false })); b.position.set(k * 1.1 - 1.6, (k % 2) * .35, 0); b.scale.set(1.3 - (k % 2) * .25, .8, .8); g.add(b); }
    g.position.set(-40 + i * 20, 15 + (i % 3) * 3, -48); g.userData.x0 = g.position.x; Wd.add(g); clouds.push(g); }
  Wd.on(t => clouds.forEach((g, i) => { g.position.x = g.userData.x0 + 1.2 * Math.sin(t * .05 + i); }));
  return Wd;
}

// ---------- light motes ----------
export function motes(Wd, n, seed, o) {
  o = o || {}; const r = rng(seed || 1), g = new THREE.Group(), arr = []; Wd.add(g); const geo = new THREE.SphereGeometry(1, 8, 6);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 3 ? 0xFFFFFF : 0xFFE9A0, transparent: true, opacity: .7, fog: false, depthWrite: false })); m.scale.setScalar(.03 + r() * .05); g.add(m);
    arr.push({ m, x: (r() - .5) * (o.w || 14), y0: r() * (o.h || 5), z: lerp(o.z0 === undefined ? -5 : o.z0, o.z1 === undefined ? 5 : o.z1, r()), sp: .05 + r() * .1, ph: r() * 6.28 });
  }
  const Hh = o.h || 5;
  Wd.on(t => arr.forEach(a => { const u = fr((a.y0 + t * a.sp) / Hh); a.m.position.set(a.x + .2 * Math.sin(t * .4 + a.ph), .3 + u * Hh, a.z); a.m.material.opacity = .7 * Math.sin(Math.PI * u); }));
  return g;
}

// ---------- grass / wheat tufts that sway (function of t only) ----------
export function tufts(Wd, n, seed, area, o) {
  o = o || {}; const r = rng(seed || 3), arr = [], g = new THREE.Group(); Wd.add(g);
  const cols = o.cols || [0x6AA35A, 0x7FB86A, 0x8CC47A];
  for (let i = 0; i < n; i++) {
    const t0 = new THREE.Group(), sc = (o.s || 1) * (.7 + r() * .7); const col = cols[i % cols.length];
    for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.ConeGeometry(.05, o.h || .5, 5), toon(col)); b.position.set((k - 1) * .06, (o.h || .5) / 2, (k % 2) * .03); b.rotation.z = (k - 1) * .18; b.castShadow = false; t0.add(b);
      if (o.head) { const hd = new THREE.Mesh(new THREE.SphereGeometry(.045, 6, 5), toon(o.head)); hd.position.set((k - 1) * .06 + (k - 1) * .05, (o.h || .5) + .03, (k % 2) * .03); t0.add(hd); } }
    t0.position.set(lerp(area.x0, area.x1, r()), area.y, lerp(area.z0, area.z1, r())); t0.scale.setScalar(sc); g.add(t0); arr.push({ g: t0, ph: r() * 6.28, sc });
  }
  return { g, sway(t, amp) { amp = amp === undefined ? 1 : amp; arr.forEach(a => { a.g.rotation.z = Math.sin(t * 1.3 + a.ph) * .12 * amp; a.g.rotation.x = Math.sin(t * 1.1 + a.ph * 1.7) * .06 * amp; }); },
    grow(k) { arr.forEach((a, i) => { const u = ease.out(prog(k, (i / n) * .6, (i / n) * .6 + .4)); a.g.scale.setScalar(Math.max(a.sc * u, 1e-4)); }); g.visible = k > .01; } };
}

// ---------- flag on a pole ----------
export function flag(Wd, color, pos, h) {
  const g = new THREE.Group(); g.position.set(...pos); Wd.add(g);
  g.add(cyl(.035, .035, h, 0xB09A74, { pos: [0, h / 2, 0], inkW: .008, inkColor: INK })); g.add(ball(.06, 0xF2D98A, { pos: [0, h + .02, 0], ink: false }));
  const piv = new THREE.Group(); piv.position.set(0, h - .22, 0); g.add(piv); const cloth = box(.7, .4, .03, color, { pos: [.35, 0, 0], inkW: .01, inkColor: INK }); piv.add(cloth);
  return { g, pop(k) { g.scale.setScalar(Math.max(ease.out(k), 1e-4)); g.visible = k > .01; }, wave(t, amp, ph) { piv.rotation.y = Math.sin(t * 3 + (ph || 0)) * .22 * amp; cloth.rotation.z = Math.sin(t * 4.1 + (ph || 0)) * .06 * amp; }, dip(k) { g.rotation.x = .35 * k; } };
}

// ---------- the central layout: inner square field + outer ring + flags ----------
export function plots(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  const outer = box(9, TO, 9, PAL.meadow, { pos: [0, TO / 2, 0], inkW: .012, inkColor: 0x4F8A45 }); g.add(outer);
  const inner = new THREE.Group(); g.add(inner);
  const slab = box(4, TI, 4, PAL.wheat, { pos: [0, TI / 2, 0], inkW: .012, inkColor: INK }); inner.add(slab);
  for (let k = 0; k < 5; k++) inner.add(box(3.7, .012, .06, 0xD4A93A, { pos: [0, TI + .004, -1.6 + k * .8], ink: false, cast: false }));
  const fGold = flag(Wd, 0xF2C230, [1.5, TI, -1.5], 1.25), fGreen = flag(Wd, 0x5FAA4F, [-3.9, TO, -2.6], 1.25);
  // light overlays
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xFFD76A, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); gl.rotation.x = -Math.PI / 2; gl.position.y = TI + .02; gl.visible = false; g.add(gl);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xFFF3C8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false })); dome.position.y = TI; dome.scale.y = .75; dome.visible = false; g.add(dome);
  const ringG = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xFFE9A0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); ringG.rotation.x = -Math.PI / 2; ringG.visible = false; g.add(ringG);
  const slabMat = slab.material, wheat = C(PAL.wheat), bright = C(0xF6D470);
  return { g, outer, inner, slab, fGold, fGreen,
    rise(k) { inner.scale.y = Math.max(ease.out(k), 1e-4); inner.visible = k > .005; },
    // soft gold light that spreads from the front edge (z=+2) over the whole field
    glowFront(k, a) { const L = 4.05 * ease.out(clamp(k, 0, 1)); gl.scale.set(4.0, Math.max(L, 1e-3), 1); gl.position.z = 2 - L / 2; gl.material.opacity = (a === undefined ? .4 : a) * sm(k, 0, .15); gl.visible = k > .01; slabMat.color.copy(wheat).lerp(bright, sm(k, .3, 1) * .6); },
    // whole-field pulse
    pulse(t, a) { slab.scale.setScalar(1 + .0); gl.scale.set(4.0, 4.0, 1); gl.position.z = 0; gl.material.opacity = a * (.5 + .5 * Math.sin(t * 4)); gl.visible = a > .01; slabMat.color.copy(wheat).lerp(bright, a * (.5 + .5 * Math.sin(t * 4)) * .8); },
    shield(k) { dome.material.opacity = .22 * Math.sin(Math.PI * clamp(k, 0, 1)); dome.visible = k > .01 && k < .99; } };
}

// ---------- the 12 sections of the green ring (lit one by one) ----------
export function ringTiles(Wd) {
  const R = [], add = (x0, x1, z0, z1) => R.push([x0, x1, z0, z1]);
  add(-4.5, -2, -4.5, -2); add(-2, 0, -4.5, -2); add(0, 2, -4.5, -2); add(2, 4.5, -4.5, -2);
  add(2, 4.5, -2, 0); add(2, 4.5, 0, 2);
  add(2, 4.5, 2, 4.5); add(0, 2, 2, 4.5); add(-2, 0, 2, 4.5); add(-4.5, -2, 2, 4.5);
  add(-4.5, -2, 0, 2); add(-4.5, -2, -2, 0);
  const tiles = R.map(([x0, x1, z0, z1]) => { const m = box(x1 - x0 - .14, .05, z1 - z0 - .14, 0xB7E58F, { pos: [(x0 + x1) / 2, TO + .025, (z0 + z1) / 2], ink: false, cast: false }); m.material.emissive = C(0x7FD060); m.material.emissiveIntensity = .5; m.visible = false; Wd.add(m); return m; });
  return { tiles, set(i, k) { const m = tiles[i]; m.visible = k > .01; m.scale.set(1, .4 + .6 * k, 1); m.position.y = TO + .012 + .02 * k; } };
}

// ---------- walls: rows of stone boxes that rise with a dust puff ----------
export function wallLine(Wd, A, B, o) {
  o = o || {}; const n = o.n || 8, h = o.h || .6, th = o.th || .22, base = o.base === undefined ? TO : o.base;
  const g = new THREE.Group(); Wd.add(g); const dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), th0 = Math.atan2(-dz, dx), nx = -dz / L, nz = dx / L;
  const segs = [], puffs = [], dc = o.dust === undefined ? 0xEFE6CF : o.dust;
  for (let j = 0; j < n; j++) {
    const cx = A[0] + dx * (j + .5) / n, cz = A[1] + dz * (j + .5) / n; const sg = new THREE.Group(); sg.position.set(cx, base, cz); sg.rotation.y = th0; g.add(sg);
    const b = box(L / n * .95, h, th, j % 2 ? PAL.stone : PAL.stone2, { pos: [0, h / 2, 0], inkW: .012, inkColor: INK }); sg.add(b);
    segs.push({ sg, b, u: 0, cx, cz }); const pf = []; for (let k = 0; k < 2; k++) { const p = ball(.13, dc, { ink: false, cast: false }); p.visible = false; g.add(p); pf.push(p); } puffs.push(pf);
  }
  const wall = { g, segs, n, h, A, B,
    set(k) {
      segs.forEach((s, j) => { const a = (j / n) * .7; const u = ease.out(prog(k, a, a + .3)); s.sg.scale.y = Math.max(u, 1e-4); s.sg.visible = u > .004;
        const q = prog(k, a, a + .4), amp = (q > 0 && q < 1) ? Math.sin(Math.PI * q) : 0; puffs[j].forEach((p, m) => { const sd = m ? 1 : -1; p.visible = amp > .02; p.scale.setScalar(Math.max(amp * (.8 + .5 * m), 1e-4)); p.position.set(s.cx + nx * sd * (.16 + q * .25), base + .1 + q * .45, s.cz + nz * sd * (.16 + q * .25)); p.material.opacity = 1; }); });
      g.visible = k > .004;
    },
    light(p, w) { segs.forEach(s => { const d = Math.abs(s.u - p), k = clamp(1 - d / w, 0, 1), e = k * k * (3 - 2 * k); const m = s.b.material; m.emissive.setRGB(e, e * .86, e * .42); }); },
    flash(c, k) { segs.forEach(s => { s.b.material.emissive.setRGB(k * (c ? 1 : 0), k * .86, k * .42); }); } };
  return wall;
}
const SIDES = [[[-2, -2], [2, -2]], [[-2, 2], [-2, -2]], [[2, -2], [2, 2]], [[2, 2], [-2, 2]]];   // back, left, right, front
const PERIM = [0, 3, 1, 2];
export function wallSide(Wd, i, o) {
  o = Object.assign({ h: .6 + i * .003 }, o || {}); const w = wallLine(Wd, SIDES[i][0], SIDES[i][1], o); w.segs.forEach((s, j) => { s.u = (PERIM[i] * w.n + j + .5) / (4 * w.n); }); return w;
}
// light that runs around the perimeter of a set of walls (p in -w .. 1+w)
export function lightRun(walls, p, w) { walls.forEach(wl => wl.light(p, w)); }

// ---------- coins ----------
const coinMesh = () => cyl(.2, .2, .06, PAL.coin, { inkW: .01, inkColor: 0x8A6A10 });
export function coinStack(Wd, n) {
  const g = new THREE.Group(); g.scale.setScalar(1.5); Wd.add(g); const cs = []; for (let i = 0; i < n; i++) { const c = coinMesh(); c.position.y = .03 + i * .065; c.rotation.y = i * .7; c.visible = false; g.add(c); cs.push(c); }
  return { g, set(k) { cs.forEach((c, i) => { const u = clamp(k * n - i, 0, 1); c.visible = u > .01; c.scale.setScalar(Math.max(ease.out(u), 1e-4)); }); g.visible = k > .005; } };
}
// n coins hop in an arc from `from` to `to` (p 0..1); they stay stacked at the target
export function coinFlight(Wd, n, o) {
  o = o || {}; const cs = []; for (let i = 0; i < n; i++) { const c = coinMesh(); c.visible = false; c.scale.setScalar(1.5); Wd.add(c); cs.push(c); }
  return { cs, set(from, to, p) { cs.forEach((c, i) => { const a = i * .07, u = prog(p, a, a + (1 - .07 * (n - 1)) * .9); if (u <= 0) { c.visible = false; return; } const e = ease.io(u);
    c.visible = true; c.position.set(lerp(from[0], to[0], e), lerp(from[1], to[1], e) + Math.sin(Math.PI * u) * (o.arc || 1.7) + (u >= 1 ? .1 * i : 0), lerp(from[2], to[2], e)); c.rotation.set(u < 1 ? u * 9 : 0, 0, u < 1 ? u * 6 : 0); }); } };
}

// ---------- marks ----------
export function xMark() {
  const g = new THREE.Group(), mk = a => { const b = box(1.5, .17, .09, PAL.red, { ink: false }); b.material.emissive = C(0x6a1a14); b.material.emissiveIntensity = .5; b.rotation.z = a; g.add(b); }; mk(Math.PI / 4); mk(-Math.PI / 4);
  return { g, set(k) { g.scale.setScalar(1.5 * Math.max(ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; } };
}
export function checkMark() {
  const g = new THREE.Group(), a = box(.5, .17, .09, 0x3E9B4F, { ink: false, rot: [0, 0, -Math.PI / 4], pos: [-.3, -.12, 0] }), b = box(1.1, .17, .09, 0x3E9B4F, { ink: false, rot: [0, 0, Math.PI / 4], pos: [.2, .08, 0] });
  [a, b].forEach(m => { m.material.emissive = C(0x1a5a2a); m.material.emissiveIntensity = .5; g.add(m); });
  return { g, set(k) { g.scale.setScalar(1.5 * Math.max(ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; } };
}

// ---------- digit tile (ASCII digits only) ----------
export function tile(Wd, txt, pos, h) { const lb = label(Wd, txt, { size: 110, height: h || .5, bg: 'rgba(255,248,224,.95)', color: '#7a4a10', pos }); lb.userData.s0 = lb.scale.clone(); lb.visible = false; return lb; }
export function pop(sp, k) { sp.scale.set(sp.userData.s0.x * Math.max(k, .0001), sp.userData.s0.y * Math.max(k, .0001), 1); sp.visible = k > .01; }

// ---------- countdown clock ring (from stef_31) ----------
export function makeClock(parent, o) {
  o = o || {}; const R = o.R || .6, g = new THREE.Group(); g.position.set(...(o.pos || [0, 2.3, 0])); parent.add(g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R * .95, 48), new THREE.MeshBasicMaterial({ color: 0xFFF6DC, fog: false })); disc.position.z = -.02; g.add(disc);
  g.add(mesh(new THREE.TorusGeometry(R, .035, 8, 72), toon(0xB8871B), { ink: false }));
  const segs = [], N = 72;
  for (let i = 0; i < N; i++) { const a = i / N * 2 * Math.PI; const s = new THREE.Mesh(new THREE.BoxGeometry(.05, .1, .05), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xE2B43C : 0xF0C44E, fog: false })); s.position.set(Math.sin(a) * R * .86, Math.cos(a) * R * .86, 0); s.rotation.z = -a; s.visible = false; g.add(s); segs.push(s); }
  const hand = new THREE.Group(); hand.add(box(.035, R * .75, .02, 0xB8871B, { pos: [0, R * .375, .02], ink: false })); g.add(hand);
  const dig = []; for (let n = 1; n <= 5; n++) { const lb = label({ add: x => g.add(x) }, String(n), { size: 120, bg: null, color: '#8a5a10', height: .34, pos: [0, -.02, .05] }); lb.visible = false; dig.push(lb); }
  return { g, set(k) { const n = Math.floor(k * N + 1e-6); segs.forEach((s, i) => { s.visible = i < n; }); hand.rotation.z = -k * 2 * Math.PI; const left = k <= 0 || k >= 1 ? 0 : clamp(Math.ceil((1 - k) * 5), 1, 5); dig.forEach((d, i) => { d.visible = (i + 1) === left; }); },
    fade(a) { g.scale.setScalar(Math.max(a, .0001)); g.visible = a > .01; } };
}

// ---------- s08: two paved courtyards with one shared wall ----------
export function courtyard(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(box(10, TO, 6.4, PAL.meadow, { pos: [0, TO / 2, 0], inkW: .012, inkColor: 0x4F8A45 }));
  for (const sx of [-1, 1]) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) g.add(box(.98, .06, .98, (a + b) % 2 ? 0xE3D6B6 : 0xD6C6A0, { pos: [sx * 1.8 + (a - 1), TO + .03, b - 1], ink: false }));
  for (const sx of [-1, 1]) { g.add(box(3.3, .12, .1, PAL.stone, { pos: [sx * 1.8, TO + .06, -1.6], inkW: .008, inkColor: INK })); g.add(box(3.3, .12, .1, PAL.stone, { pos: [sx * 1.8, TO + .06, 1.6], inkW: .008, inkColor: INK })); }
  const shared = wallLine(Wd, [0, -1.5], [0, 1.5], { n: 6, h: 1.1, th: .26 }); shared.set(1);
  const joint = wallLine(Wd, [0.12, -1.5], [3.0, -1.5], { n: 6, h: 1.1, th: .26, dust: 0xEFE6CF });
  const fl = glow(Wd, 0xFFFFFF, 1.6); fl.position.set(.15, .75, -1.5);
  return { g, shared, joint, flash(k) { fl.set(k); }, left: [-1.8, TO, .5], right: [1.8, TO, .5] };
}
