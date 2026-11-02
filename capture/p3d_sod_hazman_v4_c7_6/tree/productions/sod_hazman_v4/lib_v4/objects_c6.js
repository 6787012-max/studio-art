// objects_c6.js - set pieces for chapter c6 only (clocks and time zones). No Hebrew, no people, digits/symbols only.
import { THREE, box, cyl, mesh, toon, ease, prog, clamp, lerp, rng, O, D2R, candle, textPlane, tube, reveal, sunBall, goldRing, ringAnim, dayBoard } from './kit_c4567.js';

// wall of many tiny town clocks, all slightly different (L00)
export function tinyClocks(Wd, o) {
  o = o || {}; const g = O.grp(Wd, { pos: o.pos }), r = rng(o.seed || 7), n = o.n || 30, W = o.w || 2.6, H = o.h || 1.3;
  g.add(box(W + .3, H + .3, .06, 0x3a2412, { pos: [0, 0, -.05], inkW: .012 })); const list = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r() * .3, rr = .55 + r() * .45, x = Math.cos(a) * W / 2 * rr + (r() - .5) * .2, y = Math.sin(a) * H / 2 * rr * 1.0 + (r() - .5) * .15;
    if (Math.abs(x) < .32 && y < .2 && y > -.5) continue; const c = O.wallClock(Wd, { r: .09 + r() * .04, S: 600 + Math.floor(r() * 40000) }); c.group.position.set(x, y, 0); c.group.rotation.z = (r() - .5) * .3; g.add(c.group); list.push({ c, S0: 3600 * 3 + Math.floor(r() * 3000), sp: .8 + r() * .5 }); }
  return { group: g, update(t) { list.forEach(it => it.c.setTime(it.S0 + t * 30 * it.sp, undefined)); } };
}
// a toy town: houses, a clock tower; the tower clock is returned
export function toyTown(Wd, o) {
  const g = O.grp(Wd, { pos: o.pos }), r = rng(o.seed || 3), cols = [0xe8d4a8, 0xd8b890, 0xc9a070, 0xe0c8a0], roofs = [0xb5473a, 0x9a3a30, 0xc45a3a];
  for (let i = 0; i < 7; i++) { const x = (i - 3) * 1.9 + (r() - .5) * .4, z = -2.2 + (i % 2) * 2.4 + (r() - .5), w = 1.2 + r() * .5, h = 1.0 + r() * .8; g.add(box(w, h, 1.2, cols[i % 4], { pos: [x, h / 2, z], inkW: .03 })); const rf = mesh(new THREE.ConeGeometry(w * .8, .8, 4), toon(roofs[i % 3]), { inkW: .03, pos: [x, h + .4, z], rot: [0, Math.PI / 4, 0] }); g.add(rf); g.add(box(.3, .45, .06, 0x4a3018, { pos: [x, .23, z + .62], ink: false })); }
  g.add(box(1.6, 5.2, 1.6, 0xd9c49a, { pos: [0, 2.6, 2.8], inkW: .04 })); g.add(mesh(new THREE.ConeGeometry(1.3, 1.6, 4), toon(0xa8403a), { inkW: .04, pos: [0, 6.0, 2.8], rot: [0, Math.PI / 4, 0] }));
  const clk = O.wallClock(Wd, { pos: [0, 4.0, 3.65], r: .62, S: o.S || 43200 }); g.add(clk.group); return { group: g, clock: clk };
}
// the globe with 24 vertical zone bands over the Earth texture
export function zoneGlobe(Wd, o) {
  o = o || {}; const R = o.R || 2.2, G = O.grp(Wd, { pos: o.pos }), E = O.earth(Wd, { R }); G.add(E); const em = E.userData.earth;
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 8; const c = cv.getContext('2d'); for (let i = 0; i < 24; i++) { c.fillStyle = `hsl(${i * 15},${i % 2 ? 70 : 85}%,${i % 2 ? 58 : 50}%)`; c.fillRect(i * 1024 / 24, 0, 1024 / 24 + 1, 8); }
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; const shell = new THREE.Mesh(new THREE.SphereGeometry(R * 1.012, 96, 48), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: .0, depthWrite: false })); em.add(shell);
  const hi = new THREE.Mesh(new THREE.SphereGeometry(R * 1.02, 48, 24, ((35.2 + 180) / 360) * Math.PI * 2 - Math.PI / 24 - Math.PI * .5 + Math.PI, Math.PI / 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); em.add(hi);
  return { group: G, E, em, shell, hi, R };
}
// simplified Israel outline, extruded, in metres (x east, z south)
export function israelMap(Wd, o) {
  o = o || {}; const K = o.k || 3.4, G = O.grp(Wd, { pos: o.pos });
  const P = [[34.27, 31.22], [34.5, 31.6], [34.65, 32.0], [34.78, 32.1], [34.95, 32.8], [35.1, 33.05], [35.5, 33.25], [35.8, 33.2], [35.85, 32.7], [35.55, 32.4], [35.55, 31.75], [35.45, 31.45], [35.4, 31.0], [35.4, 30.6], [35.0, 30.0], [34.95, 29.55], [34.9, 29.5], [34.75, 29.9], [34.4, 30.3], [34.2, 31.0]];
  const sh = new THREE.Shape(); P.forEach(([lo, la], i) => { const x = (lo - 35.0) * K * .85, y = (la - 31.3) * K; i ? sh.lineTo(x, y) : sh.moveTo(x, y); });
  const m = mesh(new THREE.ExtrudeGeometry(sh, { depth: .28, bevelEnabled: false }), toon(0xd8b878), { inkW: .04, rot: [-Math.PI / 2, 0, 0] }); G.add(m);
  const jx = (35.2 - 35.0) * K * .85, jz = -(31.8 - 31.3) * K; const pin = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 8), O.basic(0xff4a3a)); pin.position.set(jx, .45, jz); G.add(pin); const pg = O.glow(.9, 0xff6a50, .9); pg.position.copy(pin.position); G.add(pg);
  return { group: G, pin, pg, jx, jz, K };
}
// stone prayer hall seen from outside at dawn, windows lit
export function shulExterior(Wd) {
  const T = O.stoneTex(5, '#cdb98f'), g = O.grp(Wd);
  g.add(O.texBox(12, 6.4, 7, T, 0xd8d0c0, { pos: [0, 3.2, 0], inkW: .04 })); g.add(box(12.6, .4, 7.6, 0xb7a37c, { pos: [0, 6.6, 0], inkW: .03 }));
  g.add(mesh(new THREE.SphereGeometry(2.2, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xcdbb92), { inkW: .04, pos: [0, 6.8, 0] }));
  const wins = []; const arch = new THREE.Shape(); arch.moveTo(-.6, 0); arch.lineTo(.6, 0); arch.lineTo(.6, 1.9); arch.absarc(0, 1.9, .6, 0, Math.PI, false); arch.lineTo(-.6, 0);
  for (let i = 0; i < 5; i++) { const x = -4.6 + i * 2.3, w = new THREE.Mesh(new THREE.ShapeGeometry(arch, 12), O.basic(0xffc860)); w.position.set(x, 1.7, 3.52); g.add(w); wins.push(w); const gl = O.glow(3.2, 0xffb860, .55); gl.position.set(x, 3.0, 3.9); g.add(gl); wins.push(gl); }
  g.add(box(2.2, 3.2, .3, 0x5a3a1c, { pos: [0, 1.6, 3.6], inkW: .02 }));
  [-7.2, 7.2].forEach(x => { const l = new THREE.Group(); l.position.set(x, 0, 4.6); l.add(cyl(.06, .08, 3.0, 0x2c2a30, { pos: [0, 1.5, 0], inkW: .01 })); const lan = new THREE.Mesh(new THREE.BoxGeometry(.3, .4, .3), O.basic(0xffd48a)); lan.position.y = 3.1; l.add(lan); const gg = O.glow(3.5, 0xffb860, .8); gg.position.y = 3.1; l.add(gg); g.add(l); });
  return { group: g, wins };
}
// closed siddur on a shtender (white cover, gold border)
export function siddur(Wd, o) {
  const sh = O.shtender(Wd, o || {}), g = new THREE.Group(); g.add(box(.5, .07, .4, 0xf2ece0, { pos: [0, .04, 0], inkW: .006 })); g.add(box(.42, .075, .32, 0xd8b050, { pos: [0, .045, 0], ink: false })); g.add(box(.36, .08, .26, 0xf2ece0, { pos: [0, .048, 0], ink: false }));
  const star = new THREE.Mesh(new THREE.CircleGeometry(.05, 6), O.basic(0xd9a21f)); star.rotation.x = -Math.PI / 2; star.position.y = .09; g.add(star); sh.userData.slope.add(g); g.position.set(0, .04, 0);
  return { shtender: sh, book: g };
}
// shuttered window wall with a wall clock and a day bar on a table
export function shutterRoom(Wd) {
  const g = O.grp(Wd), pl = O.plasterTex('#e6d6b4');
  g.add(O.texBox(10, 4, .3, pl, 0xffffff, { pos: [0, 2, -4], k: .35, inkW: .01 })); const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), toon(0xffffff, { map: O.woodTex(6, '#9a6a3a', 128) })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, -1); g.add(fl);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.4), O.basic(0xfff0c0)); win.position.set(-2.4, 2.2, -3.82); g.add(win); const wg = O.glow(6, 0xffe090, .7); wg.position.set(-2.4, 2.2, -3.6); g.add(wg);
  const sl = []; [-1, 1].forEach(s => { const sh = new THREE.Group(); sh.position.set(-2.4 + s * 1.15, 2.2, -3.7); const pnl = new THREE.Group(); pnl.position.x = -s * .55; sh.add(pnl); pnl.add(box(1.1, 2.5, .06, 0x3f6a5a, { inkW: .01 })); for (let i = 0; i < 10; i++) pnl.add(box(1.0, .06, .09, 0x2f5a4a, { pos: [0, -1.05 + i * .23, .05], ink: false })); g.add(sh); sl.push({ sh, pnl, s }); });
  g.add(box(2.6, .14, .3, 0x6a4526, { pos: [-2.4, .98, -3.6], inkW: .01 })); const clk = O.wallClock(Wd, { pos: [1.6, 2.5, -3.8], r: .6, S: 3600 * 6 + 600 }); g.add(clk.group);
  const ring = goldRing(Wd); ring.position.set(1.6, 2.5, -3.7);
  return { group: g, win, wg, shutters: sl, clock: clk, ring };
}
// a long rail with chips (abstract notch plates) for the year timeline
export function timelineRail(Wd, n) {
  const g = O.grp(Wd), L = 14; g.add(box(L + 1, .22, .7, 0x6a4526, { pos: [0, .11, 0], inkW: .015 })); g.add(box(L + 1, .06, .1, 0xe6b84a, { pos: [0, .25, .3], ink: false }));
  for (let i = 0; i <= 14; i++) g.add(box(.05, .3, .05, 0xe9d29a, { pos: [-L / 2 + i, .38, .3], ink: false }));
  const chips = [], cols = [0xe05a4a, 0x3ab08a, 0x3a9ad0, 0xe8883a, 0x9a5ad0, 0xf0c03a]; const r = rng(4);
  for (let i = 0; i < n; i++) { const c = new THREE.Group(); const w = 1.25; c.add(box(w, .8, .22, cols[i % cols.length], { inkW: .02 })); for (let k = 0; k < 3 + (i % 3); k++) c.add(box(.1, .1 + r() * .35, .06, 0xfff0c0, { pos: [-w / 2 + .22 + k * .2, 0, .14], ink: false })); c.position.set(-L / 2 + .9 + i * (L - 1.8) / Math.max(1, n - 1), .8, .1); const gl = O.glow(2.2, cols[i % cols.length], 0); gl.position.z = .2; c.add(gl); c.userData.gl = gl; g.add(c); chips.push(c); }
  return { group: g, chips, L };
}
// wall panel with a golden home slot; the clock settles into it
export function homeSlot(Wd) {
  const g = O.grp(Wd); g.add(O.texBox(14, 6, .4, O.woodTex(9, '#6a4526', 160), 0xffffff, { pos: [0, 3, -.5], k: .25, inkW: .02 }));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.35, .12, 14, 56), O.basic(0xffc840)); rim.position.set(0, 3, -.22); g.add(rim); g.add(mesh(new THREE.CylinderGeometry(1.3, 1.3, .1, 48), toon(0x2a1a0c), { inkW: .02, rot: [Math.PI / 2, 0, 0], pos: [0, 3, -.28] }));
  const gl = O.glow(7, 0xffc840, 0); gl.position.set(0, 3, .1); g.add(gl); return { group: g, rim, gl };
}
