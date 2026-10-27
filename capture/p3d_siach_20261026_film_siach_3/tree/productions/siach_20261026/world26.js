// world26.js - siach 26/10/2026: living room (C), bright city street + bus stop (E1/E4), bus interior (E2/E3). No text anywhere. Pure functions of t.
import { THREE, box, cyl, ball, mesh, toon, ink, canvasTex, rng, clamp, lerp, ease, prog, cloud } from '../../lib/stage3d.js';
import * as P from '../../lib/props3d.js';
import * as S from './shared.js';
import * as H from './sh26.js';

const PI = Math.PI;

// ---------------------------------------------------------------- C: the living room (x -4.5..4.5, z -4.5..4.5, front open)
export function livingRoom(Wd, o) {
  o = o || {};
  const g = new THREE.Group(); Wd.add(g);
  const piece = (x0, x1, y0, y1, z0, z1, col) => { const m = box(x1 - x0, y1 - y0, z1 - z0, col, { pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], inkW: .02 }); m.castShadow = false; g.add(m); return m; };
  const WALL = 0xF3E1C0, WALL2 = 0xEBD5AE;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshLambertMaterial({ color: 0xC89558 })); fl.rotation.x = -PI / 2; fl.position.set(0, .02, 0); fl.receiveShadow = true; g.add(fl);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.2), new THREE.MeshLambertMaterial({ color: 0xA5503A, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); rug.rotation.x = -PI / 2; rug.position.set(-.2, .035, -1.5); g.add(rug);
  const rug2 = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.4), new THREE.MeshLambertMaterial({ color: 0xE3B77A, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); rug2.rotation.x = -PI / 2; rug2.position.set(-.2, .04, -1.5); g.add(rug2);
  // back wall with the window hole
  const WX0 = 1.2, WX1 = 3.4, WY0 = 1.1, WY1 = 2.7;
  piece(-4.8, WX0, 0, 3.4, -4.8, -4.5, WALL); piece(WX1, 4.8, 0, 3.4, -4.8, -4.5, WALL); piece(WX0, WX1, 0, WY0, -4.8, -4.5, WALL); piece(WX0, WX1, WY1, 3.4, -4.8, -4.5, WALL);
  piece(-4.8, -4.5, 0, 3.4, -4.8, 4.8, WALL2); piece(4.5, 4.8, 0, 3.4, -4.8, 4.8, WALL2);
  piece(-4.8, 4.8, 3.4, 3.7, -4.8, 4.8, 0xF7EBD2);
  // window: light dusk pane (never dark), wooden frame, streaks of rain on the glass
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0), new THREE.MeshBasicMaterial({ color: 0xB9C7D6, fog: false })); pane.position.set((WX0 + WX1) / 2, (WY0 + WY1) / 2, -4.62); g.add(pane);
  const fr = 0x8A5A34, cx = (WX0 + WX1) / 2, cy = (WY0 + WY1) / 2;
  g.add(box(WX1 - WX0 + .2, .1, .3, fr, { pos: [cx, WY1 + .05, -4.55], ink: false })); g.add(box(WX1 - WX0 + .3, .12, .4, fr, { pos: [cx, WY0 - .06, -4.5], ink: false }));
  for (const x of [WX0 - .05, WX1 + .05, cx]) g.add(box(.1, WY1 - WY0 + .2, .3, fr, { pos: [x, cy, -4.55], ink: false })); g.add(box(WX1 - WX0, .06, .12, fr, { pos: [cx, cy, -4.55], ink: false }));
  const NS = 40, rr = rng(7), st = [], im = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .75, depthWrite: false }), NS), D = new THREE.Object3D();
  for (let i = 0; i < NS; i++) st.push([WX0 + .05 + (WX1 - WX0 - .1) * rr(), rr(), .25 + .6 * rr(), .08 + .22 * rr()]);
  im.frustumCulled = false; g.add(im);
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, 1.0), new THREE.MeshBasicMaterial({ color: 0xFFE2A8, transparent: true, opacity: .0 })); // reserved
  Wd.on(t => { for (let i = 0; i < NS; i++) { const [x, ph, sp, len] = st[i], u = (ph + t * sp * .35) % 1, y = WY1 - .05 - u * (WY1 - WY0 - .1); D.position.set(x, y, -4.605); D.scale.set(.014, len, 1); D.updateMatrix(); im.setMatrixAt(i, D.matrix); } im.instanceMatrix.needsUpdate = true; });
  // door on the left wall
  g.add(box(.12, 2.15, 1.15, 0x6B4423, { pos: [-4.42, 1.08, -.3], inkW: .01 })); g.add(box(.2, .1, 1.35, 0x8A5A34, { pos: [-4.4, 2.2, -.3], ink: false })); for (const z of [-.95, .35]) g.add(box(.2, 2.2, .1, 0x8A5A34, { pos: [-4.4, 1.1, z], ink: false })); g.add(ball(.05, 0xF2B630, { pos: [-4.33, 1.0, .12], ink: false }));
  // sofa (seat top .44), against the back wall
  const sofaC = 0x6F86A8, sx = -.5, sz = -3.5;
  g.add(box(2.4, .3, .9, sofaC, { pos: [sx, .3, sz], inkW: .02 })); g.add(box(2.4, .72, .22, sofaC, { pos: [sx, .78, sz - .46], inkW: .02 }));
  for (const s of [-1, 1]) g.add(box(.2, .56, .9, 0x5E759A, { pos: [sx + s * 1.2, .38, sz], inkW: .02 }));
  g.add(box(.5, .38, .14, 0xE3B77A, { pos: [sx - .85, .66, sz - .28], rot: [-.15, 0, .1], inkW: .01 })); g.add(box(.5, .38, .14, 0xC9663C, { pos: [sx + .95, .66, sz - .28], rot: [-.15, 0, -.1], inkW: .01 }));
  // side table + small lamp
  g.add(box(.7, .05, .55, 0xA4713F, { pos: [1.0, .6, -3.7], inkW: .01 })); for (const [dx, dz] of [[-.3, -.22], [.3, -.22], [-.3, .22], [.3, .22]]) g.add(box(.05, .58, .05, 0x7A5232, { pos: [1.0 + dx, .29, -3.7 + dz], ink: false }));
  g.add(cyl(.06, .08, .22, 0x3b2c22, { pos: [1.15, .74, -3.85], inkW: .008 })); const sh = new THREE.Mesh(new THREE.ConeGeometry(.16, .2, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE29A, side: THREE.DoubleSide })); sh.position.set(1.15, .96, -3.85); g.add(sh);
  const sg = H.glow(null, 2.2, .6, 0xFFC85A); sg.position.set(1.15, .9, -3.85); g.add(sg);
  // bookshelf on the right wall, shelf on the back wall
  P.bookshelf(Wd, { pos: [4.25, 0, -2.2], rot: -PI / 2, seed: 4 }); P.bookshelf(Wd, { pos: [4.25, 0, -.8], rot: -PI / 2, seed: 9 });
  // the floor lamp in the front-left corner (camera side), glowing
  const lamp = new THREE.Group(); lamp.position.set(-3.3, 0, 1.7); g.add(lamp);
  lamp.add(cyl(.2, .24, .05, 0x3b2c22, { pos: [0, .025, 0], inkW: .01 })); lamp.add(cyl(.03, .03, 1.5, 0x3b2c22, { pos: [0, .78, 0], ink: false }));
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.24, .34, .4, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE29A, side: THREE.DoubleSide })); shade.position.y = 1.7; lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 8), new THREE.MeshBasicMaterial({ color: 0xFFF6D0 })); bulb.position.y = 1.72; lamp.add(bulb);
  const lg = H.glow(null, 5.2, .75, 0xFFC27A); lg.position.set(0, 1.72, 0); lamp.add(lg); const lg2 = H.glow(null, 10, .22, 0xFFD9A0); lg2.position.set(0, 1.5, 0); lamp.add(lg2);
  Wd.on(t => { lg.material.opacity = .72 + .05 * Math.sin(t * 1.7); });
  return { g, lamp, lampPos: [-3.3, 1.72, 1.7], sofa: { x: sx, z: sz }, glowBoost: k => { lg.material.opacity = .72 + .1 * k; lg2.material.opacity = .22 + .14 * k; lg.scale.setScalar(5.2 + 2.5 * k); } };
}
export const roomSky = o => Object.assign({ ground: 'paper', skyTop: 0xC9D3E0, skyBottom: 0xF1DDBE, fogColor: 0xF1DDBE, fogNear: 60, fogFar: 200, sun: .35, sunColor: 0xFFE3BA, hemi: 1.25, hemiSky: 0xFFE9CC, hemiGround: 0xC9A074, sunPos: [-6, 14, 12], shadowExt: 12 }, o || {});

// ---------------------------------------------------------------- E: the sunny city (street along z, right side = -x, pavement x in [-8.6,-5.2])
export function cityStreet(Wd, o) {
  o = o || {}; const L = o.len || 320;
  const rd = new THREE.Mesh(new THREE.BoxGeometry(10, .08, L), toon(0x6E747C)); rd.position.set(0, .04, 0); rd.receiveShadow = true; Wd.add(rd);
  const lm = new THREE.MeshBasicMaterial({ color: 0xF4F4F0 }), n = Math.floor(L / 8), dim = new THREE.InstancedMesh(new THREE.PlaneGeometry(.16, 3), lm, n), D = new THREE.Object3D();
  for (let i = 0; i < n; i++) { D.position.set(0, .087, -L / 2 + i * 8 + 4); D.rotation.set(-PI / 2, 0, 0); D.updateMatrix(); dim.setMatrixAt(i, D.matrix); } dim.frustumCulled = false; Wd.add(dim);
  for (const s of [-1, 1]) { const pv = new THREE.Mesh(new THREE.BoxGeometry(3.4, .14, L), toon(0xDDD6C8)); pv.position.set(s * 6.9, .07, 0); pv.receiveShadow = true; Wd.add(pv); Wd.add(box(.2, .16, L, 0xC9C2B4, { pos: [s * 5.1, .08, 0], ink: false })); }
  const r = rng(12), cols = [0xF4DFB4, 0xF0C9A0, 0xE8EEF2, 0xDDE8D0, 0xF2D6C8, 0xE9D3A1], wins = [], WC = [];
  for (const s of [-1, 1]) for (let z = -L / 2 + 8; z < L / 2 - 6; z += 13) {
    const w = 9 + r() * 2, h = 9 + r() * 14, d = 11.5, x = s * (12.5 + w / 2), z0 = z + (r() - .5);
    Wd.add(box(w, h, d, cols[Math.floor(r() * 6)], { pos: [x, h / 2, z0], inkW: .04 })); Wd.add(box(w + .4, .5, d + .4, 0xFFFFFF, { pos: [x, h + .25, z0], ink: false }));
    const fx = s * 12.5 - s * .02, rows = Math.floor(h / 3), nc = 3;
    for (let a = 0; a < rows; a++) for (let b = 0; b < nc; b++) { const wz = z0 - 3.2 + b * 3.2, wy = 2.2 + a * 3; if (wy > h - 1) continue; wins.push([fx, wy, wz, s]); }
  }
  const wm = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.5, 1.7), new THREE.MeshBasicMaterial({ color: 0x4F7CA8, side: THREE.DoubleSide }), wins.length);
  wins.forEach(([x, y, z, s], i) => { D.position.set(x, y, z); D.rotation.set(0, s * -PI / 2, 0); D.scale.set(1, 1, 1); D.updateMatrix(); wm.setMatrixAt(i, D.matrix); }); wm.frustumCulled = false; Wd.add(wm);
  for (let z = -L / 2; z < L / 2; z += 17) for (const s of [-1, 1]) { H.rtree(Wd, s * 7.6, z + r() * 4, .75, .006, z, 0); }
  for (let z = -L / 2 + 6; z < L / 2; z += 30) for (const s of [-1, 1]) { Wd.add(cyl(.07, .09, 5, 0x6a6a72, { pos: [s * 5.6, 2.5, z], inkW: .01 })); Wd.add(box(.9, .12, .2, 0x6a6a72, { pos: [s * 5.2, 5, z], ink: false })); }
  for (const [x, y, z, s, sd] of [[-40, 60, -60, 5, 3], [30, 64, -40, 6, 5], [60, 58, 80, 5, 8], [-70, 62, 60, 5.5, 12], [0, 66, 160, 6, 14]]) Wd.add(cloud({ seed: sd, size: s, pos: [x, y, z], puffs: 6, cast: false }));
  return { wins };
}
export const sunnySky = o => Object.assign({ ground: 'stone', skyTop: 0x7EC8F0, skyBottom: 0xFFF1C9, fogColor: 0xFFF1C9, fogNear: 90, fogFar: 340, sun: 2.0, hemi: 1.3, sunPos: [-30, 60, 25], shadowExt: 40, groundSize: 800, groundRep: [160, 160] }, o || {});
// bus stop: sign pole with a BLANK blue plate, small shelter, bench (no text)
export function busStop(Wd, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g);
  g.add(cyl(.05, .06, 2.7, 0x6a6a72, { pos: [0, 1.35, 0], inkW: .01 })); g.add(box(.08, .55, .5, 0x3C7FD8, { pos: [0, 2.55, 0], inkW: .015 })); g.add(box(.09, .38, .34, 0xFFFFFF, { pos: [-.0, 2.55, 0], ink: false }));
  for (const dz of [-1.6, -3.6]) g.add(box(.08, 2.4, .08, 0x6a6a72, { pos: [-1.1, 1.2, dz], ink: false }));
  g.add(box(1.5, .1, 2.4, 0xDDE3E8, { pos: [-.7, 2.45, -2.6], inkW: .015 })); g.add(box(.05, 1.6, 2.2, 0xBFD8EA, { pos: [-1.4, 1.5, -2.6], ink: false }));
  g.add(box(.5, .06, 1.8, 0xA4713F, { pos: [-1.1, .5, -2.6], inkW: .01 }));
  return g;
}

// ---------------------------------------------------------------- E2/E3: inside the bright bus. axis z (front +z), width 2.8, floor y=0 (the ground is at y=-.9), roof 2.3.
export const BUS_BENCH_Z = [-3.2, -2.2, -1.2, -.2, .8, 1.8, 2.8];
export function busInterior(Wd, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g); const DS = THREE.DoubleSide, H_ = 2.3, X = 1.4;
  const sl = (w, h, d, col, pos, mat) => { const m = H.slab(w, h, d, col, pos, { mat, inkW: .012 }); g.add(m); return m; };
  sl(2.8, .06, 8.2, 0x8A93A0, [0, -.03, 0]); sl(.5, .01, 8.1, 0xE8C96A, [0, .01, 0], { }).material.color.set(0xE8C96A);
  for (const s of [-1, 1]) { sl(.06, .95, 8.2, 0xDDE4EA, [s * X, .475, 0]); sl(.06, .35, 8.2, 0xDDE4EA, [s * X, H_ - .175, 0]); }
  sl(2.8, .08, 8.2, 0xF4F6F8, [0, H_ + .04, 0]); sl(2.8, H_, .06, 0xDDE4EA, [0, H_ / 2, -4.1]);
  // side window glass (the street shows through)
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(8.0, H_ - 1.3), H.glassMat(.10)); w.rotation.y = PI / 2; w.position.set(s * X, .95 + (H_ - 1.3) / 2, 0); w.renderOrder = 6; g.add(w);
    for (let z = -3.6; z <= 3.7; z += 1.0) g.add(box(.05, H_ - 1.25, .06, 0xDDE4EA, { pos: [s * X, .95 + (H_ - 1.25) / 2, z], ink: false })); }
  // windshield, dash
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.2), H.glassMat(.16)); ws.position.set(0, 1.5, 4.08); ws.renderOrder = 6; g.add(ws); sl(2.8, .9, .06, 0xDDE4EA, [0, .45, 4.1]); g.add(box(1.0, .16, .3, 0x2B3340, { pos: [-.6, 1.0, 3.85], inkW: .01 }));
  // ceiling light strips
  for (const s of [-.7, .7]) { const ls = new THREE.Mesh(new THREE.PlaneGeometry(.2, 7.4), new THREE.MeshBasicMaterial({ color: 0xFFFFFF })); ls.rotation.x = PI / 2; ls.position.set(s, H_ - .0, 0); g.add(ls); }
  // benches (2 + 2): cushion top y=.5
  const BLUE = 0x4A7DB8, BLUE2 = 0x6A98CF;
  for (const z of BUS_BENCH_Z) for (const s of [-1, 1]) { if (s > 0 && z > 1.5) continue; const x = s * .8;
    g.add(box(1.0, .14, .62, BLUE, { pos: [x, .45, z], inkW: .01 })); g.add(box(1.0, .72, .1, BLUE2, { pos: [x, .85, z - .34], rot: [-.08, 0, 0], inkW: .01 })); g.add(box(1.0, .4, .5, 0x3C5E8A, { pos: [x, .2, z], ink: false })); }
  // poles
  for (const z of [-2.7, -.7, 1.3, 3.3]) for (const s of [-1, 1]) if (!(s > 0 && z > 1)) g.add(cyl(.022, .022, H_, 0xF5B820, { pos: [s * .32, H_ / 2, z], ink: false }));
  for (const s of [-1, 1]) g.add(cyl(.02, .02, 8.0, 0xF5B820, { pos: [s * .32, H_ - .12, 0], rot: [PI / 2, 0, 0], ink: false }));
  // the world outside, scrolling past (street furniture + buildings), ground below the windows
  const out = new THREE.Group(); Wd.add(out); const rr = rng(15), cols = [0xF4DFB4, 0xF0C9A0, 0xE8EEF2, 0xDDE8D0, 0xF2D6C8, 0xE9D3A1];
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(60, 400), toon(0x6E747C)); gr.rotation.x = -PI / 2; gr.position.set(0, -.9, 0); Wd.add(gr);
  for (const s of [-1, 1]) { const pv = new THREE.Mesh(new THREE.PlaneGeometry(4, 400), toon(0xDDD6C8)); pv.rotation.x = -PI / 2; pv.position.set(s * 6.5, -.8, 0); Wd.add(pv); }
  for (let i = 0; i < 16; i++) for (const s of [-1, 1]) { const z = -30 + i * 10 + (i % 3) * .8, w = 8, h = 8 + rr() * 8; out.add(box(w, h, 9, cols[(i + (s > 0 ? 3 : 0)) % 6], { pos: [s * (11 + w / 2 - 2), h / 2 - .9, z], inkW: .04 }));
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.6), new THREE.MeshBasicMaterial({ color: 0x4F7CA8 })); wn.position.set(s * 9.97, 1 + a * 3, z - 2 + b * 3.4); wn.rotation.y = -s * PI / 2; out.add(wn); } }
  for (let i = 0; i < 10; i++) for (const s of [-1, 1]) { const z = -30 + i * 15 + (s > 0 ? 6 : 0); H.rtree(out, s * 7.2, z, .8, 0, 0, 0).position.y = -.8; }
  for (let i = 0; i < 16; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.2, 3), new THREE.MeshBasicMaterial({ color: 0xF4F4F0 })); d.rotation.x = -PI / 2; d.position.set(0, -.88, -30 + i * 10 + 5); out.add(d); }
  const sp = o.speed === undefined ? 6 : o.speed;
  Wd.on(t => { out.position.z = -t * sp; });
  return { g, out };
}

// the far city: many pastel blocks beyond the main street (E4), with window positions for gold glows
export function farCity(Wd) {
  const r = rng(41), cols = [0xF4DFB4, 0xF0C9A0, 0xE8EEF2, 0xDDE8D0, 0xF2D6C8, 0xE9D3A1], wins = [];
  for (const s of [-1, 1]) for (let xi = 0; xi < 6; xi++) for (let z = -220; z < 220; z += 16) {
    if (r() < .12) continue; const w = 9 + r() * 4, h = 7 + r() * 20, d = 11, x = s * (34 + xi * 17 + r() * 3), z0 = z + (r() - .5) * 2;
    Wd.add(box(w, h, d, cols[Math.floor(r() * 6)], { pos: [x, h / 2, z0], inkW: .05 })); Wd.add(box(w + .4, .5, d + .4, 0xFFFFFF, { pos: [x, h + .25, z0], ink: false }));
    if (xi < 3) for (let k = 0; k < 2; k++) wins.push([x - s * (w / 2 + .02), 2 + r() * (h - 3), z0 - 2.5 + k * 5, s]);
  }
  for (const s of [-1, 1]) for (const x of [26, 60, 94]) { const st = new THREE.Mesh(new THREE.BoxGeometry(5, .06, 460), toon(0x6E747C)); st.position.set(s * x - s * 6, .04, 0); Wd.add(st); }
  return { wins };
}
