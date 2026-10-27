// k13fx.js - composite sets for kz_k13 ("the world BEGAN, so it has a goal"): corridor, crossroads, balance, gong, park, field, jungle, creation.
import { THREE, COL, PI, sm, sin, cos, bx, cy, bl, mm, bm, grp, rng, clamp, lerp, ease, prog, glowSprite, sparkle, gear, lamp, gate, road, pine, pines, house, elastic, pop, fadeRec, setFade, shoe } from './k13lib.js';

const BASICC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, fog: false }, o || {}));

// ---- corridor along -z : floor, two walls, doors (swing open into the corridor), lamps. z from z0 (near) to z1 (far)
export function corridor(Wd, o) {
  o = o || {}; const w = o.w || 6, z0 = o.z0 === undefined ? 6 : o.z0, z1 = o.z1 === undefined ? -60 : o.z1, len = z0 - z1, zc = (z0 + z1) / 2, g = new THREE.Group(), wg = new THREE.Group(), doors = []; g.add(wg);
  g.add(bx(w + .8, .12, len, '#F7F3EA', { pos: [0, .06, zc], inkW: .01 }));
  for (const s of [-1, 1]) {
    wg.add(bx(.3, 3.4, len, '#6B8CAE', { pos: [s * (w / 2 + .15), 1.7, zc], inkW: .015 })); wg.add(bx(.5, .2, len, '#F7F3EA', { pos: [s * (w / 2 + .15), 3.45, zc], inkW: .01 }));
    g.add(bx(.12, .5, len, '#E9B64A', { pos: [s * (w / 2 - .0), .5, zc], ink: false }));
  }
  const dz = o.doors || []; dz.forEach((z, i) => {
    const s = i % 2 ? 1 : -1, xs = s * (w / 2 - .02); const rc = bm(new THREE.PlaneGeometry(1.5, 2.5), i % 3 === 0 ? 0xFFE9B8 : i % 3 === 1 ? 0xFBD7B8 : 0xDDEBF5); rc.position.set(xs, 1.3, z); rc.rotation.y = -s * PI / 2; wg.add(rc);
    const gl = glowSprite(0xFFD27A, 3.6, 0); gl.position.set(xs - s * .4, 1.4, z); wg.add(gl);
    const pv = new THREE.Group(); pv.position.set(xs - s * .03, 0, z + .75); wg.add(pv);
    pv.add(bx(.12, 2.55, 1.5, [COL.coral, COL.sage, COL.honey][i % 3], { pos: [0, 1.28, -.75], inkW: .014 })); pv.add(bl(.07, COL.cream, { pos: [-s * .1, 1.2, -1.3], inkW: .006 }));
    const D = { pv, s, z, gl, open(k) { pv.rotation.y = s > 0 ? k * 1.75 : -k * 1.75; gl.material.opacity = .85 * clamp(k * 1.5, 0, 1); }, pos: new THREE.Vector3(xs - s * .5, 1.2, z) }; doors.push(D); D.open(0);
  });
  const lampsN = Math.floor(len / 9); for (let i = 0; i < lampsN; i++) for (const s of [-1, 1]) { const z = z0 - 4 - i * 9; wg.add(cy(.07, .09, 2.6, '#5E4B3C', { pos: [s * (w / 2 - .25), 1.3, z], inkW: .008 })); const b = bl(.2, 0xFFD27A, { pos: [s * (w / 2 - .25), 2.75, z], ink: false }); b.material = BASICC(0xFFE9A8); b.userData.keep = true; wg.add(b); const gg = glowSprite(0xFFD27A, 2.2, .5); gg.position.set(s * (w / 2 - .25), 2.75, z); wg.add(gg); }
  if (Wd) Wd.add(g); return { g, wg, doors, w, z0, z1 };
}
// ---- crossroads: hub, 9 coloured paths fan out, signpost with an arrow per path. grow(k) 0..1, lift(i,k)
const PC = ['#E9B64A', '#D9774B', '#6B8CAE', '#4E7D6A', '#B9C4DC', '#B85F37', '#8FB5A0', '#E3C48A', '#7F9BC0'];
export function crossroads(Wd, o) {
  o = o || {}; const g = new THREE.Group(), L = o.len || 20, A = [0, 40, -40, 80, -80, 120, -120, 160, -160], paths = [], arrows = [], ends = [];
  g.add(cy(2.2, 2.4, .14, '#F7F3EA', { pos: [0, .07, 0], inkW: .015 }));
  A.forEach((deg, i) => { const a = deg * PI / 180, pv = new THREE.Group(); pv.rotation.y = a; g.add(pv);
    pv.add(bx(2.2, .1, L, i === 0 ? '#F7F3EA' : PC[i], { pos: [0, .06, -L / 2 - 1.5], inkW: .012 })); pv.add(bx(.12, .12, L, '#2F3440', { pos: [1.1, .09, -L / 2 - 1.5], ink: false })); pv.add(bx(.12, .12, L, '#2F3440', { pos: [-1.1, .09, -L / 2 - 1.5], ink: false }));
    paths.push(pv); ends.push(new THREE.Vector3(-Math.sin(a) * (L + 1.5), 0, -Math.cos(a) * (L + 1.5)));
    const ap = new THREE.Group(); ap.rotation.y = a; ap.position.y = 6.2 - i * .5; g.add(ap); ap.add(bx(.14, .5, 2.2, i === 0 ? COL.honey : PC[i], { pos: [0, 0, -1.4], inkW: .014 })); ap.add(mm(new THREE.ConeGeometry(.45, .8, 4), i === 0 ? COL.honey : PC[i], { pos: [0, 0, -2.8], rot: [-PI / 2, 0, 0], inkW: .014, box: true }));
    arrows.push(ap); });
  g.add(cy(.16, .2, 6.6, COL.woodD, { pos: [0, 3.3, 0], inkW: .02 })); g.add(bl(.28, COL.cream, { pos: [0, 6.75, 0], inkW: .015 }));
  const API = { g, paths, arrows, ends, L, A, grow(k, stag) { paths.forEach((p, i) => { const kk = sm(clamp((k - i * (stag === undefined ? .06 : stag)) / .6, 0, 1)); p.scale.z = Math.max(.001, kk); }); } };
  if (Wd) Wd.add(g); return API;
}
export function trophy() { const g = new THREE.Group(); g.add(bx(.7, .12, .7, COL.woodD, { pos: [0, .06, 0] })); g.add(mm(new THREE.CylinderGeometry(.42, .26, .42, 20, 1, true), COL.honey, { mat: { side: THREE.DoubleSide }, pos: [0, .33, 0], inkW: .015 })); g.add(cy(.25, .25, .04, COL.honey, { pos: [0, .14, 0], inkW: .01 })); return g; }
export function barBlocks() { const g = new THREE.Group(); [.5, .9, 1.4].forEach((h, i) => g.add(bx(.4, h, .4, [COL.sage, COL.skyD, COL.coral][i], { pos: [(i - 1) * .5, h / 2, 0], inkW: .014 }))); return g; }

// ---- multi-pan balance: pillar, level arms, pans, all level
export function multiBalance(n) {
  n = n || 6; const g = new THREE.Group(); g.add(cy(.6, .8, .2, COL.woodD, { pos: [0, .1, 0] })); g.add(cy(.14, .2, 3.6, COL.wood, { pos: [0, 1.9, 0], inkW: .02 })); g.add(bl(.24, COL.honey, { pos: [0, 3.8, 0], inkW: .015 }));
  const arms = new THREE.Group(); arms.position.y = 3.5; g.add(arms);
  const pans = [];
  for (let i = 0; i < n; i++) { const a = i / n * PI * 2, pv = new THREE.Group(); pv.rotation.y = a; arms.add(pv); pv.add(bx(.12, .1, 3.4, COL.wood, { pos: [0, 0, -1.7], inkW: .012 }));
    for (const s of [-.28, .28]) pv.add(cy(.014, .014, 1.3, '#6B8CAE', { pos: [s, -.65, -3.4], ink: false })); const pan = new THREE.Group(); pan.position.set(0, -1.35, -3.4); pv.add(pan); pan.add(cy(.7, .55, .1, [COL.coral, COL.sage, COL.skyD, COL.honey, COL.lilac, COL.slate][i % 6], { inkW: .014 }));
    pan.add(bl(.22, [COL.honey, COL.cream, COL.coral][i % 3], { pos: [0, .3, 0], inkW: .01 })); pans.push(pan); }
  g.userData = { arms, pans }; return g; }

// ---- gong on a frame; strike(k) 0..1 swings the mallet; ringK(t) used by caller
export function gong() { const g = new THREE.Group();
  for (const s of [-1, 1]) { g.add(bx(.3, 5.2, .3, COL.woodD, { pos: [s * 2.6, 2.6, 0], inkW: .02 })); g.add(bx(.3, .2, 2, COL.woodD, { pos: [s * 2.6, .1, 0], inkW: .015 })); }
  g.add(bx(5.8, .3, .3, COL.woodD, { pos: [0, 5.1, 0], inkW: .02 }));
  const disc = new THREE.Group(); disc.position.set(0, 2.9, 0); g.add(disc); disc.add(cy(1.6, 1.6, .14, COL.honey, { rot: [PI / 2, 0, 0], inkW: .02 })); disc.add(cy(.7, .7, .18, '#F2CF7A', { rot: [PI / 2, 0, 0], inkW: .015 })); disc.add(mm(new THREE.TorusGeometry(1.55, .09, 8, 36), COL.coral, { inkW: .012 }));
  for (const s of [-1, 1]) g.add(cy(.02, .02, 2.2, COL.cream, { pos: [s * 1.0, 4.0, 0], rot: [0, 0, s * .3], ink: false }));
  const mp = new THREE.Group(); mp.position.set(2.0, 4.6, 1.6); g.add(mp); mp.add(cy(.05, .05, 2.6, COL.wood, { pos: [0, -1.3, 0], inkW: .01 })); mp.add(bl(.28, COL.coral, { pos: [0, -2.6, 0], inkW: .014 }));
  g.userData = { disc, mp }; return g; }
// expanding ring (camera-facing plane ring)
export function ringWave(col) { const m = bm(new THREE.RingGeometry(.92, 1, 48), col || 0xFFD266, { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }); return m; }

// ---- amusement park pieces
export function carousel() { const g = new THREE.Group(), top = new THREE.Group(); g.add(cy(2.5, 2.7, .3, COL.cream, { pos: [0, .15, 0], inkW: .02 })); g.add(cy(2.55, 2.55, .06, COL.coral, { pos: [0, .32, 0], ink: false })); g.add(cy(.22, .26, 3.4, COL.honey, { pos: [0, 1.9, 0], inkW: .02 }));
  g.add(top); top.add(mm(new THREE.ConeGeometry(3.0, 1.3, 16), COL.coral, { pos: [0, 4.2, 0], inkW: .025, box: true })); top.add(cy(3.0, 3.0, .12, COL.cream, { pos: [0, 3.55, 0], inkW: .015 })); top.add(bl(.18, COL.honey, { pos: [0, 4.95, 0], inkW: .01 }));
  const seats = []; for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2, s = new THREE.Group(); s.position.set(Math.sin(a) * 1.9, 0, Math.cos(a) * 1.9); top.add(s); s.add(cy(.03, .03, 3.0, '#C9D6E2', { pos: [0, 1.95, 0], ink: false })); const seat = new THREE.Group(); seat.position.y = 1.0; s.add(seat); seat.add(bl(.38, [COL.skyD, COL.sage, COL.honey, COL.coral, COL.lilac, COL.cream][i], { scale: [1, .8, 1], inkW: .014 })); seat.add(bx(.5, .06, .5, COL.cream, { pos: [0, -.25, 0], inkW: .008 })); seats.push(seat); }
  g.userData = { top, seats }; return g; }
export function ferris() { const g = new THREE.Group(), wh = new THREE.Group(); wh.position.y = 3.6; g.add(wh); wh.add(mm(new THREE.TorusGeometry(2.8, .1, 8, 40), COL.skyD, { inkW: .015 })); wh.add(mm(new THREE.TorusGeometry(1.4, .07, 8, 30), COL.skyD, { inkW: .012 })); const cab = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; wh.add(bx(.08, 2.8, .08, '#C9D6E2', { pos: [Math.sin(a) * 1.4, Math.cos(a) * 1.4, 0], rot: [0, 0, -a], ink: false })); const c = new THREE.Group(); c.position.set(Math.sin(a) * 2.8, Math.cos(a) * 2.8, 0); wh.add(c); c.add(bx(.7, .55, .6, [COL.coral, COL.honey, COL.sage, COL.cream][i % 4], { pos: [0, -.4, 0], inkW: .014 })); c.add(bx(.08, .3, .08, COL.woodD, { pos: [0, -.1, 0], ink: false })); cab.push(c); }
  wh.add(cy(.25, .25, .5, COL.honey, { rot: [PI / 2, 0, 0] }));
  for (const s of [-1, 1]) g.add(bx(.2, 4.2, .2, COL.woodD, { pos: [s * 1.2, 1.8, 0], rot: [0, 0, -s * .3], inkW: .015 })); g.add(bx(3.4, .2, 1.4, COL.woodD, { pos: [0, .1, 0], inkW: .015 }));
  g.userData = { wh, cab }; return g; }
export function balloon(c) { const g = new THREE.Group(); g.add(bl(.45, c, { scale: [1, 1.2, 1], pos: [0, 2.0, 0], inkW: .018 })); g.add(cy(.012, .012, 1.5, COL.cream, { pos: [0, 1.0, 0], ink: false })); return g; }
export function tinyBed() { const g = new THREE.Group(); g.add(bx(1.3, .22, .8, COL.wood, { pos: [0, .3, 0] })); g.add(bx(.1, .6, .8, COL.woodD, { pos: [-.62, .5, 0] })); g.add(bx(.1, .4, .8, COL.woodD, { pos: [.62, .4, 0] })); g.add(bx(1.2, .14, .7, COL.cream, { pos: [0, .46, 0], inkW: .008 })); g.add(bl(.2, COL.white, { scale: [1.2, .45, 1], pos: [-.38, .62, 0], inkW: .008 })); g.add(bx(.7, .08, .72, COL.coral, { pos: [.25, .56, 0], inkW: .008 }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(bx(.08, .2, .08, COL.woodD, { pos: [sx * .56, .1, sz * .32], ink: false })); return g; }

// ---- field with furrows, tools
export function field(w, d) { const g = new THREE.Group(); g.add(bx(w, .12, d, '#D8C9AE', { pos: [0, .06, 0], inkW: .012 })); const rows = []; const n = Math.floor(d / 1.1);
  for (let i = 0; i < n; i++) { const z = -d / 2 + .8 + i * 1.1; const r = bx(w - .8, .34, .55, '#A98E6C', { pos: [0, .22, z], inkW: .012 }); g.add(r); rows.push(r); g.add(bx(w - 1.2, .06, .22, '#C8AE86', { pos: [0, .42, z], ink: false })); }
  g.userData.rows = rows; return g; }
export function hoe() { const g = new THREE.Group(); g.add(cy(.05, .05, 2.4, COL.wood, { pos: [0, 1.2, 0], rot: [.25, 0, 0], inkW: .01 })); g.add(bx(.6, .06, .35, COL.slateD, { pos: [0, .05, -.28], rot: [.5, 0, 0], inkW: .01 })); return g; }
export function barrow() { const g = new THREE.Group(); g.add(bx(1.0, .35, .7, COL.coral, { pos: [0, .55, 0], inkW: .014 })); g.add(cy(.28, .28, .1, COL.woodD, { pos: [0, .28, .55], rot: [0, 0, PI / 2], inkW: .01 })); for (const s of [-1, 1]) g.add(bx(1.0, .06, .06, COL.wood, { pos: [-.7, .6, s * .3], ink: false })); return g; }

// ---- jungle: dense ball-canopy trees in a disc
export function jungle(n, R, seed) { const r = rng(seed || 3), g = new THREE.Group(), cs = ['#3F6C5A', '#4E7D6A', '#5E8E7A', '#2F5A4A'];
  for (let i = 0; i < n; i++) { const a = r() * PI * 2, d = Math.sqrt(r()) * R, t = new THREE.Group(), h = 2.4 + r() * 2.4; t.position.set(Math.sin(a) * d, 0, Math.cos(a) * d); t.add(cy(.14, .2, h, COL.woodD, { pos: [0, h / 2, 0], ink: false })); t.add(bl(1.0 + r() * .7, cs[i % 4], { pos: [0, h + .4, 0], inkW: .02 })); if (r() > .5) t.add(bl(.7, cs[(i + 1) % 4], { pos: [.6, h - .1, .3], inkW: .015 })); g.add(t); }
  return g; }
export function bench() { const g = new THREE.Group(); g.add(bx(1.6, .1, .5, COL.wood, { pos: [0, .5, 0] })); g.add(bx(1.6, .5, .08, COL.wood, { pos: [0, .85, -.22] })); for (const s of [-1, 1]) g.add(bx(.1, .5, .46, COL.woodD, { pos: [s * .7, .25, 0], inkW: .008 })); return g; }
export function roundTree(h) { h = h || 2.4; const g = new THREE.Group(); g.add(cy(.14, .2, h * .5, COL.woodD, { pos: [0, h * .25, 0], inkW: .015 })); g.add(bl(h * .38, COL.pine, { pos: [0, h * .7, 0], inkW: .02 })); g.add(bl(h * .26, '#5E8E7A', { pos: [h * .22, h * .55, .1], inkW: .015 })); return g; }
