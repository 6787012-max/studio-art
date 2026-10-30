/* film_e worlds part 2: night beach (turtles), map, cabin, coast (desalination + village), salt pools, gas section, power town, stove. ASCII only. */
import { THREE, sm, cl, frac, V, KT, KP, L, P, toon, part, ell, tube, lathe, tubeAlong, leafGeo, cone, OL, G, bx, ease, lerp, WORLD, addWorld, gy, ST, SKY, scene, AC } from './e_core.js';
import { makeGlints, makeRowBoat } from './e_w1.js';
const { M, rng } = KT;
const ink = () => M(OL, OL, 0);
const BMt = (hex, o) => new THREE.MeshBasicMaterial(Object.assign({ color: new THREE.Color(hex), side: THREE.DoubleSide }, o || {}));
const PI = Math.PI;

/* ---------------------------------------------------------------- night / dawn beach for the sea turtles */
export const PIT = [-120, 380];
export function buildNight() {
  const g = G(), B = KT.makeBeach({ season: 'summer' }); g.add(B.root);
  g.add(KT.makeHills({ a0: 0.22, a1: PI - 0.22, dists: [5200, 7600, 10200], base: '#5f9a6a', haze: '#9ab4d8', h: 900 }));
  const r = rng(91);
  [[-1500, 1060, 'palm', 1], [1000, 1120, 'palm', 1.1], [2300, 1000, 'palm', 0.9], [-2600, 1100, 'palm', 1], [-300, 1250, 'tamarisk', 1]].forEach(([x, z, k, s], i) => { const t = KT.makeTree(k, i + 5, s); t.position.set(x, gy(x, z), z); g.add(t); });
  for (let i = 0; i < 10; i++) { const b = KT.makeBush(i + 3, { s: 0.9 + r() * 0.6 }); const x = -2600 + r() * 5200, z = 760 + r() * 400; b.position.set(x, gy(x, z), z); g.add(b); }
  const moon = G(g, [-1100, 2300, -9000]);
  part(moon, new THREE.CircleGeometry(340, 40), BMt('#fff3c4'), 0); for (const [x, y, rr] of [[-90, 70, 60], [110, -40, 44], [30, 130, 30], [-120, -90, 36]]) { const c = new THREE.Mesh(new THREE.CircleGeometry(rr, 20), BMt('#f0e0a8')); c.position.set(x, y, 2); moon.add(c); }
  const mg = L.makeGlow('#fff0b0', 1700, { alpha: 0.5 }); moon.add(mg);
  const glit = makeGlints(46, 700, 3000, 21); glit.position.set(-900, 0, 300); g.add(glit);
  // nest pit: dark hole, eggs, mound
  const gp = gy(PIT[0], PIT[1]);
  const pit = G(g, [PIT[0], gp + 1, PIT[1]]);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(78, 24).rotateX(-PI / 2), BMt('#5a4326')); hole.scale.z = 0.7; pit.add(hole); hole.position.y = 0.6;
  const rim = part(pit, new THREE.TorusGeometry(78, 12, 6, 24).rotateX(PI / 2), M('#e0c88a', '#c8b090', 0), 1.4); rim.scale.z = 0.7;
  const eggs = []; for (let i = 0; i < 16; i++) { const a = i * 2.4, rr = 12 + (i % 5) * 9; const e = part(pit, ell(11, 13, 11, 10, 8), M('#fffbe8', '#d8d0b8', 0), 1.2, [Math.cos(a) * rr * 1.5, 7 + (i % 3) * 3, Math.sin(a) * rr * 0.8]); eggs.push(e); }
  const mound = part(g, ell(110, 36, 82, 20, 10), M('#e8cf94', '#d0b890', 0), 2.4, [PIT[0], gp + 2, PIT[1]]);
  const puffs = []; for (let i = 0; i < 14; i++) { const m = part(g, ell(12, 12, 12, 8, 6), M('#e8cf94', '#d0b890', 0), 1.2); m.visible = false; puffs.push(m); }
  // flipper tracks (two rows of dents from the water to the pit)
  const tracks = []; for (let i = 0; i < 26; i++) { const u = i / 25, z = lerp(60, PIT[1] + 110, u), x = PIT[0] + 40 * Math.sin(u * 3.2) - 20 * u; for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.CircleGeometry(15, 10).rotateX(-PI / 2), BMt('#b79a64')); m.scale.set(1.5, 1, 0.55); m.position.set(x + s * 62, gy(x, z) + 0.8, z + (i % 2 ? 5 : -5) * s); m.rotation.y = 0.3 * s; g.add(m); tracks.push({ m, u }); } }
  const w = addWorld('night', g, p0 => (p0 && p0.day) ? 'dawn' : 'night', { B, sea: B.sea, moon, glit, hole, eggs, mound, puffs, tracks, pit });
  w.pitY = gp;
  w.upd = (t, lt, p) => { p = p || {}; B.update(t); B.sea.update(t, 4); B.foam.update(t, 0.5); glit.userData.update(t, p.day ? 0 : 1, B.sea); moon.visible = !p.day; moon.position.z = p.moonBack ? 9000 : -9000; w.g.userData.day = !!p.day;
    hole.visible = (p.hole == null ? 0 : p.hole) > 0.02; hole.scale.set(Math.max(0.01, p.hole || 0), 1, Math.max(0.01, 0.7 * (p.hole || 0))); rim.visible = hole.visible; rim.scale.set(Math.max(0.01, p.hole || 0), 1, Math.max(0.01, 0.7 * (p.hole || 0)));
    eggs.forEach((e, i) => { e.visible = (p.eggs || 0) > i; }); mound.visible = (p.mound || 0) > 0.02; mound.scale.set(Math.max(0.01, p.mound || 0), Math.max(0.01, p.mound || 0), Math.max(0.01, p.mound || 0));
    const bu = p.burst || 0; puffs.forEach((m, i) => { const u = cl(bu * 1.4 - (i % 5) * 0.08, 0, 1); m.visible = u > 0.01 && u < 0.99; const a = i * 0.9; m.position.set(PIT[0] + Math.cos(a) * (20 + 80 * u), gp + 14 + 100 * Math.sin(Math.PI * u) * (0.6 + (i % 3) * 0.25), PIT[1] + Math.sin(a) * (14 + 60 * u)); m.scale.setScalar(0.5 + 0.8 * (1 - u)); });
    tracks.forEach(o => { o.m.visible = (p.track || 0) >= o.u; }); };
  return w;
}

/* ---------------------------------------------------------------- map (the whole sea) */
export function buildMap() {
  const g = G(), MAP = KT.makeMedMap({ lat0: 24, segZ: 240 }); g.add(MAP.root);
  const spot = (lon, lat, col) => { const s = G(g); const p = MAP.lonlat(lon, lat, 10); s.position.set(p[0], p[1], p[2]);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(30, 28).rotateX(-PI / 2), BMt(col, { transparent: true, opacity: 0.9, depthWrite: false })); disc.renderOrder = 8; disc.position.y = 2; s.add(disc);
    const rings = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 40).rotateX(-PI / 2), BMt(col, { transparent: true, opacity: 0.8, depthWrite: false })); m.renderOrder = 8; m.position.y = 3; s.add(m); return m; });
    const gl = L.makeGlow(col, 160, { alpha: 0.7 }); gl.position.y = 40; s.add(gl); const pin = G(s); part(pin, lathe([[0.01, 0], [5, 8], [3, 60], [0.01, 60]], 10), M('#d9534f', '#c8a098'), 1.6); part(pin, ell(14, 14, 14, 14, 10), M('#e8503c', '#d8a098'), 2, [0, 70, 0]);
    s.userData = { disc, rings, gl, pin }; s.visible = false; return s; };
  const sI = spot(34.1, 32.9, '#ffd45a'), sG = spot(21.1, 36.5, '#ff9f2e');
  const w = addWorld('map', g, 'day', { MAP, sI, sG });
  const upd1 = (s, k, t, big) => { s.visible = k > 0.01; const u = s.userData; s.scale.setScalar(Math.max(0.01, k)); u.gl.userData.update(t, k); u.rings.forEach((m, i) => { const q = frac(t * 0.55 + i / 3); m.scale.setScalar((big ? 140 : 90) * (0.2 + q)); m.material.opacity = 0.8 * (1 - q) * Math.min(1, k * 2); }); u.pin.position.y = 6 * Math.sin(t * 3); };
  w.upd = (t, lt, p) => { p = p || {}; MAP.update(t); upd1(sI, p.sI == null ? 0 : p.sI, t, false); upd1(sG, p.sG == null ? 0 : p.sG, t, true); };
  return w;
}

/* ---------------------------------------------------------------- cabin (the glowing sefer on the table) */
export function buildCabin() {
  const st = L.makeRoom('study'), g = G(); g.add(st.root);
  const sh = L.makeSeferStand(KP); sh.root.position.set(330, 0, -120); sh.root.rotation.y = -1.82; g.add(sh.root);
  const glow = L.makeGlow('#ffe9a0', 100, { alpha: 0.5 }); glow.position.set(1, 8, 0); sh.root.userData.book.add(glow);
  const sp = L.makeSparkles(10, 70, 4); sp.position.set(0, 14, 0); sh.root.userData.book.add(sp);
  const table = KP.makeTableSefarim(); table.root.position.set(-650, 0, 80); table.root.rotation.y = PI / 2; table.root.scale.setScalar(0.95); g.add(table.root);
  const cand = KP.makeCandlesticks(); cand.root.position.set(-650, 99, 80); g.add(cand.root);
  const bench = KP.makeBench(); bench.root.position.set(700, 0, -300); bench.root.rotation.y = -PI / 2 + 0.2; g.add(bench.root);
  const w = addWorld('cabin', g, null, { room: st, stand: sh, glow, sp });
  w.upd = (t, lt, p) => { p = p || {}; st.update(t, 'day', 0.2, 0); glow.userData.update(t, p.glow == null ? 1 : p.glow); sp.userData.update(t, p.glow == null ? 1 : p.glow); };
  return w;
}

/* ---------------------------------------------------------------- coast: desalination plant + pipe + village with a tap */
const drop = (col) => { const prof = []; for (let i = 0; i <= 20; i++) { const u = i / 20, rr = u < 0.5 ? 20 * Math.sin(u / 0.5 * PI / 2) : 20 * Math.pow(Math.cos((u - 0.5) / 0.5 * PI / 2), 1.5); prof.push([rr + 0.01, -20 + 52 * u]); }
  return lathe(prof, 14); };
export function buildCoast() {
  const g = G(), r = rng(52);
  const sea = KT.makeSea({ A: 4, L: 300, palette: 'summer', pos: [-3600, -8, 0] }); g.add(sea.mesh);
  bx(g, 800, 70, 3600, M('#e8d29a', '#c9a8a0', 0), [100, -34, 0], 0, null, 6);                        // beach (x -300 .. 500)
  bx(g, 7600, 70, 3600, M('#86bf5f', '#c4cfc0', 0), [4400, -35, 0], 0, null, 6);                      // meadow (x 600 ..)
  { const sl = new THREE.Mesh(new THREE.PlaneGeometry(700, 3600).rotateX(-PI / 2).rotateZ(0.0), M('#e8d29a', '#c9a8a0', 0)); sl.rotation.z = 0; sl.position.set(-650, -6, 0); sl.scale.set(1, 1, 1); g.add(sl); }
  const foam = KT.makeFoamLine({ len: 3600, z0: 0, width: 90 }); foam.mesh.rotation.y = PI / 2; foam.mesh.position.set(-300, 0, 0); g.add(foam.mesh);
  // ---- plant: open shed
  const wall = M('#f2efe6', '#c9c6d8'), roof = M('#d9604e', '#c4a0a0'), steel = M('#c9ccd2', '#9a9cb0'), blue = M('#3b8fd0', '#a0b8e0'), pipeM = M('#6f9fc0', '#a0b8d0');
  const X0 = 250, X1 = 1250, ZB = -190, ZF = 170;
  bx(g, X1 - X0, 16, ZF - ZB, M('#bfc4c8', '#a0a8b0', 0), [(X0 + X1) / 2, 8, (ZB + ZF) / 2], 2, null, 3);
  bx(g, X1 - X0, 360, 20, wall, [(X0 + X1) / 2, 190, ZB], 2.4, null, 4);
  bx(g, 20, 360, ZF - ZB, wall, [X0, 190, (ZB + ZF) / 2], 2.4, null, 4); bx(g, 20, 360, ZF - ZB, wall, [X1, 190, (ZB + ZF) / 2], 2.4, null, 4);
  bx(g, X1 - X0 + 60, 24, ZF - ZB + 60, roof, [(X0 + X1) / 2, 380, (ZB + ZF) / 2], 2.6, null, 5);
  for (const x of [X0 + 40, X1 - 40]) bx(g, 18, 360, 18, steel, [x, 190, ZF - 10], 1.6, null, 2);
  const tanks = []; for (const [x, z] of [[X0 + 150, ZB + 90]]) { part(g, lathe([[0.01, 0], [70, 0], [74, 6], [74, 230], [0.01, 238]], 26), steel, 3, [x, 16, z]); }
  // membrane vessels (horizontal), three stacked
  for (let i = 0; i < 3; i++) { const y = 80 + i * 92, vg = new THREE.CylinderGeometry(36, 36, 640, 22).rotateZ(PI / 2); part(g, vg, M('#f4f6f8', '#b8c0d0'), 2.6, [(X0 + X1) / 2 + 20, y, ZB + 110]);
    for (const k of [-250, -120, 120, 250]) part(g, new THREE.CylinderGeometry(38, 38, 28, 22).rotateZ(PI / 2), blue, 2, [(X0 + X1) / 2 + 20 + k, y, ZB + 110]); }
  // manifolds
  for (const sx of [-1, 1]) { const x = (X0 + X1) / 2 + 20 + sx * 340; part(g, tubeAlong([V(x, 70, ZB + 110), V(x, 170, ZB + 110), V(x, 280, ZB + 110)], 12, { segs: 6, radial: 8 }), pipeM, 1.8); }
  // intake pipe from the sea
  const intake = new THREE.CatmullRomCurve3([V(-520, -2, 90), V(-380, 40, 90), V(-100, 44, 90), V(180, 44, 90), V(X0 + 20, 70, ZB + 110), V((X0 + X1) / 2 - 320, 80, ZB + 110)]);
  part(g, tubeAlong(intake.getPoints(30), 16, { segs: 60, radial: 10 }), pipeM, 2.2);
  part(g, ell(30, 20, 30, 12, 8), M('#555e68', '#8a93a0'), 2, [-520, -4, 90]);                           // intake basket
  // outlet pipe through the right wall and along the ground to the village
  const outlet = new THREE.CatmullRomCurve3([V((X0 + X1) / 2 + 340, 280, ZB + 110), V(X1 + 20, 260, ZB + 110), V(X1 + 160, 120, -20), V(X1 + 260, 28, 0), V(1800, 22, 0), V(2500, 22, 0), V(3100, 22, 0), V(3230, 22, 250)]);
  const op = outlet.getPoints(200); part(g, tubeAlong(op, 17, { segs: 260, radial: 10 }), pipeM, 2.2);
  for (let i = 0; i < 14; i++) { const q = outlet.getPointAt(0.22 + i * 0.056); part(g, new THREE.TorusGeometry(19, 5, 6, 14), blue, 1.4, [q.x, q.y, q.z]).rotation.y = PI / 2; }
  // salt bin under the chute
  const chute = part(g, tubeAlong([V(700, 70, ZB + 110), V(700, 40, ZB + 170), V(700, 22, ZF - 40)], 14, { segs: 8, radial: 8 }), steel, 2);
  const bin = G(g, [700, 16, ZF - 40]); bx(bin, 120, 44, 80, M('#c08a56', '#c49a84'), [0, 22, 0], 2, null, 3);
  const saltHeap = part(bin, ell(48, 22, 32, 14, 8), M('#ffffff', '#c8d0e4'), 1.8, [0, 44, 0]); saltHeap.scale.setScalar(0.01);
  const crystals = []; for (let i = 0; i < 10; i++) { const m = bx(g, 11, 11, 11, M('#ffffff', '#c8d0e4'), [0, 0, 0], 1.2, null, 2); m.visible = false; crystals.push(m); }
  // drops
  const sd = [], cd = []; const sm_ = M('#2f9aa6', '#a0c8d0'), cm_ = M('#6ccaf6', '#b0d4f0');
  for (let i = 0; i < 18; i++) { const d = part(g, drop(), sm_, 1.8); d.visible = false; sd.push(d); const e = part(g, drop(), cm_, 1.8); e.visible = false; cd.push(e); }
  // flow glints on the long outlet pipe
  const flow = []; for (let i = 0; i < 22; i++) { const m = part(g, ell(20, 9, 20, 10, 6), cm_, 1.2); m.visible = false; flow.push(m); }
  // glass under a spout inside the plant's right side
  const glass = G(g, [1500, 0, 80]);
  { const gm = new THREE.MeshBasicMaterial({ color: '#dff4fc', transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false }); const gl_ = new THREE.Mesh(lathe([[0.01, 0], [40, 0], [44, 4], [54, 120], [0.01, 124]], 20), gm); gl_.renderOrder = 5; glass.add(gl_);
    const edge = [[40, 0], [44, 4], [54, 120]]; for (const s of [1, -1]) part(glass, tubeAlong(edge.map(([r, y]) => V(s * r, y, 0)), 2.6, { segs: 8, radial: 5, round: false }), ink(), 0);
    part(glass, new THREE.TorusGeometry(54, 3, 5, 24).rotateX(PI / 2), ink(), 0, [0, 120, 0]); }
  const gwater = part(glass, lathe([[0.01, 6], [38, 6], [50, 112], [0.01, 112]], 20), M('#5ec0ee', '#a8c8e8', 0), 0); gwater.scale.set(1, 0.01, 1);
  part(g, tubeAlong([V(1380, 220, -10), V(1470, 250, 30), V(1500, 220, 80), V(1500, 205, 80)], 9, { segs: 14, radial: 8 }), pipeM, 2);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 1, 8), M('#6ccaf6', '#b0d4f0', 0)); spout.visible = false; g.add(spout);
  // ---- village
  const hc = ['#f2d9a0', '#f0c8a0', '#e8e0c0', '#f4e0b8', '#e6cfa0'], rc = ['#c4623a', '#b8503a', '#d9774a'];
  for (let i = 0; i < 6; i++) { const x = 2500 + (i % 3) * 420 + (i > 2 ? 180 : 0), z = -420 - Math.floor(i / 3) * 360 + (i % 2) * 40, hg = G(g, [x, 0, z]); hg.rotation.y = (i % 2 ? 0.2 : -0.15);
    bx(hg, 250, 150, 200, M(hc[i % 5], '#d8c4b0'), [0, 75, 0], 2.4, null, 4); part(hg, cone(190, 110, 1, 4), M(rc[i % 3], '#c4a0a0'), 2.6, [0, 150, 0], [0, PI / 4, 0]);
    for (const wx of [-60, 60]) bx(hg, 44, 52, 4, M('#9ad0f0', '#a0c0e0', 0), [wx, 88, 101], 1.2, null, 1); bx(hg, 44, 86, 4, M('#7a4a2a', '#b08a7a'), [0, 43, 101], 1.4, null, 1); }
  for (let i = 0; i < 7; i++) { const x = 2300 + r() * 2200, z = -700 + r() * 1700; if (z > -200 && z < 500 && x > 2900 && x < 3500) continue; const t = KT.makeTree(i % 2 ? 'pine' : 'tamarisk', 30 + i, 0.8 + r() * 0.4); t.position.set(x, 0, z); g.add(t); }
  for (let i = 0; i < 16; i++) { const b = KT.makeBush(i + 5, { s: 0.7 + r() * 0.5 }); b.position.set(2300 + r() * 2400, 0, -250 + r() * 1100); if (Math.abs(b.position.x - 3300) < 280 && Math.abs(b.position.z - 280) < 260) b.position.x += 500; g.add(b); }
  // tap post + ledge + cup
  const tap = G(g, [3230, 0, 330]);
  bx(tap, 36, 150, 36, M('#8a5a2e', '#b09080'), [0, 75, 0], 2, null, 3);
  part(tap, tubeAlong([V(0, 150, 0), V(0, 176, 0), V(36, 176, 0), V(52, 158, 0)], 7, { segs: 12, radial: 8 }), M('#c9ccd2', '#9a9cb0'), 1.6);
  bx(tap, 16, 8, 8, M('#d9534f', '#c8a098'), [0, 190, 0], 1.2);
  const ledge = G(g, [3282, 0, 330]); bx(ledge, 96, 12, 90, M('#a8703e', '#c49a84'), [0, 70, 0], 1.8, null, 2); for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(ledge, 10, 66, 10, M('#7e4f2a', '#b08a7a'), [sx * 38, 33, sz * 34], 1.4, null, 2);
  const cup = P.makeCup(); cup.position.set(-6, 76, 0); ledge.add(cup);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 1, 8), M('#6ccaf6', '#b0d4f0', 0)); stream.visible = false; g.add(stream);
  const w = addWorld('coast', g, 'day', { sea, foam, intake, outlet, sd, cd, flow, crystals, saltHeap, cup, stream, tapPos: [3230, 0, 330], ledge, glass, gwater, spout });
  const ap = V(3230 + 52, 158, 330);
  w.upd = (t, lt, p) => { p = p || {}; sea.update(t, 4); foam.update(t, 0.5);
    // salty drops come in along the intake (p.salt = start time offset or -1), clean drops leave along the outlet
    const sn = p.salt == null ? 0 : p.salt; sd.forEach((d, i) => { const u = frac((t * 0.11) + i / 18); const on = sn > 0 && u < 0.99; d.visible = on; if (on) { const q = intake.getPointAt(u); d.position.set(q.x, q.y + 26, q.z); d.scale.setScalar(0.8 + 0.4 * sn); d.rotation.z = -0.4; } });
    const cn = p.clean == null ? 0 : p.clean; cd.forEach((d, i) => { const u = frac((t * 0.09) + i / 18); const on = cn > 0 && u > 0.02 && u < 0.5 && (p.cleanAll || u < 0.5); d.visible = on && !p.hideCd; if (on) { const q = outlet.getPointAt(u * 0.5); d.position.set(q.x, q.y + 28, q.z); d.scale.setScalar(0.8 + 0.3 * cn); } });
    flow.forEach((m, i) => { const u = (p.flowU0 == null ? 0.2 : p.flowU0) + frac(t * 0.07 + i / 22) * (p.flowU1 == null ? 0.8 : p.flowU1 - (p.flowU0 == null ? 0.2 : p.flowU0)); m.visible = !!p.flow; if (p.flow) { const q = outlet.getPointAt(Math.min(0.999, u)); m.position.set(q.x, q.y + 17, q.z); } });
    // salt crystals fall from the chute into the bin
    crystals.forEach((m, i) => { const u = frac(t * 0.5 + i / 10), on = (p.saltFall || 0) > 0; m.visible = on; if (on) m.position.set(700 + 6 * Math.sin(i * 3), lerp(46, 34, 0) + (1 - u) * 6 + 0, 130 + 0); });
    saltHeap.scale.setScalar(Math.max(0.01, p.heap || 0));
    // tap water
    const fl = p.pour || 0; stream.visible = fl > 0.02; if (stream.visible) { const top = ap.y, bot = 76 + 24 * (p.cupLevel == null ? 0 : p.cupLevel); stream.position.set(3230 + 52 - 6 + 6, (top + bot) / 2, 330); stream.scale.set(1, top - bot, 1); }
    gwater.scale.set(1, Math.max(0.01, p.glassLevel || 0), 1); spout.visible = (p.spout || 0) > 0.02; if (spout.visible) { const top = 200, bot = 6 + 106 * (p.glassLevel || 0); spout.position.set(1500, (top + bot) / 2, 80); spout.scale.set(1, top - bot, 1); }
    cup.userData.water.visible = (p.cupLevel || 0) > 0.02; cup.userData.water.scale.set(1, 0.15 + 0.85 * (p.cupLevel || 0), 1);
    cup.visible = p.cupOnLedge !== false; };
  return w;
}

/* ---------------------------------------------------------------- salt pools (Atlit) */
export function buildPools() {
  const g = G(), r = rng(66);
  bx(g, 9000, 40, 6000, M('#d8c48e', '#c9b090', 0), [0, -20, -1200], 0, null, 4);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(14000, 3000).rotateX(-PI / 2), BMt('#5ab8e6')); sea.position.set(0, -4, -5200); g.add(sea);
  const sf = new THREE.Mesh(new THREE.PlaneGeometry(14000, 90).rotateX(-PI / 2), BMt('#ffffff')); sf.position.set(0, -2, -3720); g.add(sf);
  g.add(KT.makeHills({ a0: 1.95, a1: 3.2, dists: [7000, 9000, 11500], base: '#a8b878', haze: '#e6e2c8', h: 700 }));
  const pools = [], dykeM = M('#b08a58', '#c4a880');
  const PW = 980, PD = 440, nx = 3, nz = 3;
  for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) { const x = (a - 1) * (PW + 90), z = -b * (PD + 80) - 150, pg = G(g, [x, 0, z]);
    bx(pg, PW + 100, 22, 36, dykeM, [0, 11, PD / 2 + 18], 1.6, null, 4); bx(pg, PW + 100, 22, 36, dykeM, [0, 11, -PD / 2 - 18], 1.6, null, 4); bx(pg, 36, 22, PD + 72, dykeM, [PW / 2 + 18, 11, 0], 1.6, null, 4); bx(pg, 36, 22, PD + 72, dykeM, [-PW / 2 - 18, 11, 0], 1.6, null, 4);
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD).rotateX(-PI / 2), BMt('#d99a8a')); bed.position.y = 2; pg.add(bed);
    const shal = new THREE.Mesh(new THREE.PlaneGeometry(PW - 24, PD - 24).rotateX(-PI / 2), BMt('#f2aebb')); shal.position.y = 5; pg.add(shal);
    for (const sz of [-1, 1]) { const rm = new THREE.Mesh(new THREE.PlaneGeometry(PW, 26).rotateX(-PI / 2), BMt('#fbf0f0')); rm.position.set(0, 6, sz * (PD / 2 - 13)); pg.add(rm); }
    for (const sx of [-1, 1]) { const rm = new THREE.Mesh(new THREE.PlaneGeometry(26, PD).rotateX(-PI / 2), BMt('#fbf0f0')); rm.position.set(sx * (PW / 2 - 13), 6, 0); pg.add(rm); }
    const crust = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD).rotateX(-PI / 2), BMt('#ffffff', { transparent: true, opacity: 0 })); crust.position.y = 4; pg.add(crust);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD).rotateX(-PI / 2), BMt('#f08aa8', { transparent: true, opacity: 0.85, depthWrite: false })); water.position.y = 10; water.renderOrder = 2; pg.add(water);
    pools.push({ bed, crust, water, x, z, ph: r() }); }
  const saltM = M('#f6f9fc', '#a8b8dc'), saltD = M('#e8eef8', '#9aaed4');
  const mkHeap = (x, z, s, seed) => { const h = G(g, [x, 0, z]), rr = rng(seed);
    [[0, 0, 0, 175, 86, 128], [-95, 0, 38, 104, 58, 82], [86, 0, -34, 112, 64, 86], [22, 0, 70, 84, 44, 64], [-34, 0, -64, 88, 48, 62]].forEach(([dx, dy, dz, rx, ry, rz], i) => part(h, ell(rx * s, ry * s, rz * s, 30, 14), i % 2 ? saltD : saltM, 2.6, [dx * s, 0, dz * s]));
    for (let i = 0; i < 9; i++) { const a = rr() * 6.28, d = rr() * 110 * s; bx(h, 13, 11, 13, saltM, [Math.cos(a) * d, 70 * s * (1 - d / (150 * s)) + 2, Math.sin(a) * d * 0.7], 1, [rr(), rr() * 3, rr()], 2); }
    return h; };
  const piles = [[-1790, -250, 1, 3], [-2020, -430, 0.8, 4], [-1640, -480, 0.9, 5]].map(([x, z, s, sd]) => { const m = mkHeap(x, z, s, sd); m.userData.s = s; return m; });
  // small conveyor: from the pool bank up to the first heap
  const cv = G(g, [-1648, 62, -168]); { const S = V(-1520, 22, -90), E = V(-1770, 112, -238), dx = E.x - S.x, dz = E.z - S.z, L = Math.hypot(dx, dz, E.y - S.y); cv.position.set((S.x + E.x) / 2, (S.y + E.y) / 2, (S.z + E.z) / 2); cv.rotation.y = Math.atan2(-dz, dx);
    const inn = G(cv); inn.rotation.z = Math.atan2(E.y - S.y, Math.hypot(dx, dz)); cv.userData.inn = inn; cv.userData.L = L;
    bx(inn, L, 10, 44, M('#3d4350', '#8a93a0', 0), [0, 0, 0], 2, null, 2);
    for (const sz of [-1, 1]) bx(inn, L, 16, 7, M('#e6b030', '#e0c070'), [0, 8, sz * 24], 1.6, null, 2);
    for (const sx of [-1, 1]) part(inn, new THREE.CylinderGeometry(12, 12, 54, 14).rotateX(PI / 2), M('#6a7280', '#a0a8b8'), 1.6, [sx * L / 2, 0, 0]);
    for (const [fx, hh] of [[-0.32, 70], [0.3, 96]]) for (const sz of [-1, 1]) bx(cv, 8, hh + 20, 8, M('#8a93a0', '#b0b8c8'), [fx * L * 0.96 * 0.9, -(hh + 20) / 2 + (fx < 0 ? -6 : 6) - 6, sz * 22], 1.4, null, 2);
    const lumps = []; for (let i = 0; i < 7; i++) lumps.push(bx(inn, 22, 16, 22, saltM, [0, 14, 0], 1.2, [0.1 * i, i, 0.2], 2)); cv.userData.lumps = lumps; }
  const bankM = BMt('#f4b6c2', { transparent: true, opacity: 0.9, depthWrite: false });
  const hut = KP.makeStoneHouse ? KP.makeStoneHouse() : null; if (hut) { const hr = hut.root || hut; hr.position.set(-2100, 0, -700); hr.scale.setScalar(1.2); g.add(hr); }
  const sun = G(g, [1500, 900, -3000]); part(sun, new THREE.CircleGeometry(190, 36), BMt('#ffd447'), 0); sun.add(L.makeGlow('#fff0a0', 900, { alpha: 0.7 }));
  const rays = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.ShapeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-24, 210); s.lineTo(24, 210); s.lineTo(0, 330); s.lineTo(-24, 210); return s; })()), BMt('#ffcf3a')); m.rotation.z = i / 12 * 6.283; sun.add(m); rays.push(m); }
  const steam = []; const stM = BMt('#ffffff', { transparent: true, opacity: 0.45, depthWrite: false });
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), stM); m.renderOrder = 3; g.add(m); steam.push({ m, pi: i % 9, ph: r(), sx: (r() - 0.5) * 0.8, sz: (r() - 0.5) * 0.8 }); }
  const birds = KT.makeBirds({ n: 4, r: 800, y: 900, seed: 8 }); birds.position.set(-800, 0, -1200); g.add(birds);
  [[-2600, 1500, -5200, 3], [1800, 1900, -6400, 3.4], [500, 1300, -4000, 2.6]].forEach(([x, y, z, s], i) => { const c = KT.makeCloud(60 + i, { s }); c.position.set(x, y, z); g.add(c); });
  const w = addWorld('pools', g, 'day', { pools, piles, sun, birds });
  w.upd = (t, lt, p) => { p = p || {}; birds.userData.update(t); const lv = p.level == null ? 1 : p.level, cr = p.crust || 0;
    sun.children.forEach(() => 0); rays.forEach((m, i) => { m.scale.setScalar(1 + 0.08 * Math.sin(t * 3 + i)); }); sun.rotation.z = t * 0.05; sun.scale.setScalar(1 + (p.sunK || 0) * 0.2);
    pools.forEach((o, i) => { const l = cl(lv * (1 + 0.05 * Math.sin(i)), 0.03, 1); o.water.scale.set(Math.max(0.02, 0.3 + 0.7 * l), 1, Math.max(0.02, 0.3 + 0.7 * l)); o.water.material.opacity = 0.2 + 0.7 * l; o.water.material.color.set(l > 0.6 ? '#f08aa8' : '#e8607c'); o.water.visible = l > 0.05;
      o.crust.material.opacity = cl(cr, 0, 1); o.bed.material.color.set(cr > 0.5 ? '#ece4dc' : '#d99a8a'); });
    steam.forEach(s => { const o = pools[s.pi], u = frac(s.ph + t * 0.18), on = (p.steam == null ? 1 : p.steam) * lv > 0.05 && (s.ph * 7 % 1) < Math.min(1, lv * 1.2 + 0.1); s.m.visible = on; if (on) { s.m.position.set(o.x + s.sx * 300, 30 + u * 380, o.z + s.sz * 200); s.m.scale.setScalar(14 + 40 * u); } });
    piles.forEach((m, i) => { const k = Math.max(0.02, p.pile == null ? 1 : p.pile); m.scale.setScalar(k); });
    const L = cv.userData.L, pk = p.pile == null ? 1 : p.pile; cv.userData.lumps.forEach((m, i) => { const u = frac(t * 0.22 + i / 7); m.visible = pk > 0.25; m.position.set(-L / 2 + 30 + u * (L - 60), 16, 0); }); };
  return w;
}

/* ---------------------------------------------------------------- gas section (kit cross-section + pocket under the seabed) */
export function buildGas() {
  const g = G(), K = KT.makeSeaSection({ depthZ: 600 }); g.add(K.root);
  const pocket = G(g, [720, -430, 303]);
  const pg = new THREE.Mesh(new THREE.CircleGeometry(1, 40), BMt('#ffcf5a')); pg.scale.set(150, 74, 1); pg.position.z = 0; pocket.add(pg);
  const pg2 = new THREE.Mesh(new THREE.CircleGeometry(1, 40), BMt('#fff0a0')); pg2.scale.set(100, 44, 1); pg2.position.z = 1; pocket.add(pg2);
  part(pocket, tubeAlong(Array.from({ length: 41 }, (_, i) => { const a = i / 40 * 6.283; return V(Math.cos(a) * 151, Math.sin(a) * 75, 2); }), 4.2, { segs: 80, radial: 6, round: false }), ink(), 0);
  const gl = L.makeGlow('#ffcf5a', 330, { alpha: 0.75 }); gl.position.z = 4; pocket.add(gl);
  const bub = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 14), BMt('#ffffff', { transparent: true, opacity: 0.85 })); m.position.z = 3; pocket.add(m); bub.push({ m, ph: i / 14, x: (i * 53 % 100 - 50) / 50 * 110, s: 6 + (i % 4) * 3 }); }
  // drill pipe from the platform down to the pocket
  part(g, tubeAlong([V(748, 150, 306), V(748, -100, 306), V(722, -330, 306), V(722, -420, 306)], 9, { segs: 30, radial: 8 }), M('#aeb4bc', '#8a93a0'), 1.8);
  const ring = []; for (let i = 0; i < 7; i++) ring.push(part(g, new THREE.TorusGeometry(11, 3.4, 6, 12), M('#f0c040', '#d4b070', 0), 1, [740, 100 - i * 80, 306]));
  [[-1000, 800, -2600, 3], [200, 1000, -3200, 3.4], [1400, 700, -2400, 2.6]].forEach(([x, y, z, s], i) => { const c = KT.makeCloud(70 + i, { s }); c.position.set(x, y, z); g.add(c); });
  const w = addWorld('gas', g, 'day', { K, pocket });
  w.upd = (t, lt, p) => { p = p || {}; K.update(t); const k = p.glow == null ? 1 : p.glow; gl.userData.update(t, k); pocket.scale.setScalar(Math.max(0.01, p.pocket == null ? 1 : p.pocket));
    bub.forEach(b => { const u = frac(b.ph + t * 0.22); b.m.position.set(b.x * (0.9 - 0.2 * u) + 10 * Math.sin(u * 9 + b.ph * 8), -60 + u * 120, 3); b.m.scale.setScalar(b.s * (0.7 + 0.5 * Math.sin(Math.PI * u))); b.m.visible = u > 0.02 && u < 0.98; }); };
  return w;
}

/* ---------------------------------------------------------------- power town (gas pipe -> power station -> houses) */
export function buildTown() {
  const g = G(), r = rng(81);
  bx(g, 9000, 60, 4000, M('#7fb85a', '#c4cfc0', 0), [0, -30, 0], 0, null, 6);
  g.add(KT.makeHills({ a0: 1.95, a1: 3.2, dists: [6000, 8200, 10400], base: '#6f9a5a', haze: '#d8b8a8', h: 800 }));
  // power station
  const ps = G(g, [-300, 0, -100]);
  bx(ps, 620, 260, 360, M('#e6e0d4', '#c8c0d8'), [0, 130, 0], 3, null, 5); bx(ps, 660, 24, 400, M('#8a93a0', '#a0a8b8'), [0, 270, 0], 2.6, null, 4);
  for (let i = 0; i < 4; i++) bx(ps, 70, 150, 6, M('#9ad0f0', '#a0c0e0', 0), [-210 + i * 140, 140, 182], 1, null, 1);
  bx(ps, 140, 190, 8, M('#6a7a8a', '#9aa8b8'), [0, 95, 183], 1.6, null, 2);
  for (const x of [-200, 40]) part(ps, lathe([[0.01, 0], [34, 0], [26, 360], [30, 372], [0.01, 372]], 16), toon('#f4f0e6', { tint: '#c9c6d8', regions: [{ p: [0, 330, 0], r: [80, 18, 80], c: '#d9534f', w: 0 }, { p: [0, 290, 0], r: [80, 12, 80], c: '#d9534f', w: 0 }] }), 2.6, [x, 270, -60]);
  const smoke = []; for (let i = 0; i < 8; i++) { const m = part(g, ell(30, 24, 30, 10, 8), M('#e8eaee', '#c8ccd8', 0), 1.4); smoke.push({ m, ph: i / 8, x: i % 2 ? -200 : 40 }); }
  part(ps, lathe([[110, 0], [80, 150], [64, 270], [78, 360], [0.01, 360]].map(([a, b]) => [a, b]), 24), M('#d8d2c4', '#c0b8c8'), 3, [300, 0, 60]);
  // gas pipe from the left (yellow) into the station
  const gp = new THREE.CatmullRomCurve3([V(-3400, 24, 360), V(-2000, 24, 360), V(-1000, 24, 300), V(-640, 24, 120), V(-560, 24, 40), V(-420, 70, 30)]);
  part(g, tubeAlong(gp.getPoints(100), 24, { segs: 160, radial: 10 }), M('#f0c040', '#d4b070'), 2.4);
  for (let i = 0; i < 16; i++) { const q = gp.getPointAt(0.05 + i * 0.056); part(g, new THREE.TorusGeometry(27, 6, 6, 14), M('#d9534f', '#c8a098', 0), 1.2, [q.x, q.y, q.z]).rotation.y = PI / 2 - 0.2; }
  const gbub = []; for (let i = 0; i < 14; i++) { const m = part(g, ell(20, 13, 20, 10, 6), M('#fff4b8', '#e8d890', 0), 1.2); m.visible = false; gbub.push(m); }
  // houses + poles + wires + bulbs
  const hc = ['#f2d9a0', '#f0c8a0', '#e8e0c0', '#f4e0b8', '#e6cfa0', '#f0d0b0'], rc = ['#c4623a', '#b8503a', '#d9774a'];
  const houses = []; for (let i = 0; i < 6; i++) { const x = 900 + i * 300, z = -200 + (i % 2) * 180 + (i === 2 ? -80 : 0), hg = G(g, [x, 0, z]);
    bx(hg, 210, 150, 180, M(hc[i], '#d8c4b0'), [0, 75, 0], 2.4, null, 4); part(hg, cone(160, 100, 1, 4), M(rc[i % 3], '#c4a0a0'), 2.6, [0, 150, 0], [0, PI / 4, 0]);
    const wm = [], wg = []; for (const wx of [-50, 50]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(44, 52), BMt('#44506e')); m.position.set(wx, 90, 91); hg.add(m); wm.push(m); const wgl = L.makeGlow('#ffe27a', 130, { alpha: 0.8 }); wgl.position.set(wx, 90, 98); hg.add(wgl); wg.push(wgl); } bx(hg, 40, 80, 4, M('#7a4a2a', '#b08a7a'), [0, 40, 91], 1.4, null, 1);
    const bulb = G(g, [x, 360, z + 60]); part(bulb, lathe([[0.01, -26], [10, -22], [10, -14], [24, 6], [26, 22], [18, 40], [0.01, 46]], 16), M('#fff6c8', '#e8d890', 0), 2); part(bulb, tube(9, 9, 18, 10).translate(0, -22, 0), M('#8a93a0', '#a0a8b8'), 1.6);
    const glow = L.makeGlow('#ffe27a', 150, { alpha: 0.8 }); glow.position.set(0, 14, 0); bulb.add(glow); bulb.scale.setScalar(1.5);
    houses.push({ hg, wm, wg, bulb, glow, x, z }); }
  const poles = []; for (let i = 0; i < 9; i++) { const x = -60 + i * 190, z = 190 - (i % 2) * 8; poles.push([x, z]); const pg = G(g, [x, 0, z]); part(pg, tube(7, 8, 260, 8).translate(0, 260, 0), M('#7e4f2a', '#b08a7a'), 1.6); bx(pg, 8, 8, 90, M('#7e4f2a', '#b08a7a'), [0, 250, 0], 1.2, null, 2); }
  for (const dz of [-40, 40]) part(g, tubeAlong(poles.map(([x, z], i) => V(x, 252 - (i % 2) * 2, z + dz)).flatMap((v, i, a) => i < a.length - 1 ? [v, V((v.x + a[i + 1].x) / 2, 240, (v.z + a[i + 1].z) / 2)] : [v]), 1.8, { segs: 120, radial: 4, round: false }), ink(), 0);
  for (let i = 0; i < 10; i++) { const x = -1800 + r() * 5400, z = 500 + r() * 800; const t = KT.makeTree(i % 2 ? 'pine' : 'tamarisk', 40 + i, 0.8 + r() * 0.4); t.position.set(x, 0, z); g.add(t); }
  for (let i = 0; i < 14; i++) { const b = KT.makeBush(i + 9, { s: 0.7 + r() * 0.5 }); b.position.set(-1500 + r() * 5200, 0, 380 + r() * 900); if (b.position.x > 100 && b.position.x < 1250 && b.position.z < 1250) b.position.x += 1500; g.add(b); }
  const w = addWorld('town', g, 'dusk', { gp, houses, ps });
  w.upd = (t, lt, p) => { p = p || {}; smoke.forEach((s, i) => { const u = frac(s.ph + t * 0.15); s.m.position.set(s.x + 30 * u, 640 + u * 280, -60); s.m.scale.setScalar(0.6 + 1.2 * u); s.m.visible = (p.smoke == null ? 1 : p.smoke) > 0.1; });
    gbub.forEach((m, i) => { const u = frac(t * 0.06 + i / 14); m.visible = !!p.gas; if (p.gas) { const q = gp.getPointAt(u * 0.95); m.position.set(q.x, q.y + 20, q.z); } });
    houses.forEach((h, i) => { const k = cl(p.on ? p.on[i] : 0, 0, 1); h.wm.forEach(m => m.material.color.set(k > 0.5 ? '#ffe27a' : '#44506e')); h.bulb.visible = k > 0.02 && !p.noBulb; h.bulb.scale.setScalar(Math.max(0.01, 1.5 * (k + 0.2 * Math.sin(Math.PI * k) * (1 - k)))); h.glow.userData.update(t, k); h.wg.forEach(s => { s.visible = k > 0.05; s.userData.update(t, k); }); h.bulb.position.y = 340 + 14 * Math.sin(t * 2 + i); }); };
  return w;
}

/* ---------------------------------------------------------------- stove close-up */
export function buildStove() {
  const g = G();
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512; const c = cv.getContext('2d'); c.fillStyle = '#f0e6cf'; c.fillRect(0, 0, 512, 512); c.strokeStyle = '#cdbf9f'; c.lineWidth = 4;
  for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, 512); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(512, i * 64); c.stroke(); }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(5, 3);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1000), new THREE.MeshBasicMaterial({ map: tex })); wall.position.set(0, 400, -140); g.add(wall);
  bx(g, 760, 420, 330, M('#f4f4f2', '#c9c6d8'), [0, 210, 40], 3, null, 8);
  bx(g, 700, 26, 300, M('#3a3f48', '#8a8f98'), [0, 433, 40], 2.4, null, 4);
  for (let i = 0; i < 4; i++) bx(g, 40, 40, 14, M('#9aa2ac', '#c0c8d0'), [-240 + i * 160, 330, 216], 1.8, null, 4);
  const flames = [], rings = [[-160, 96], [160, 96], [-160, -10], [160, -10]];
  rings.forEach(([x, z], k) => { part(g, new THREE.TorusGeometry(46, 8, 6, 20).rotateX(PI / 2), M('#2b2e34', '#555a64', 0), 1.6, [x, 456, z]); part(g, new THREE.CylinderGeometry(22, 26, 14, 14), M('#4a4e58', '#707580', 0), 1.6, [x, 452, z]);
    const fg = G(g, [x, 462, z]); fg.visible = false; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283, cc = part(fg, cone(8, 36, 1, 8), M('#4aa0ff', '#a0c8ff', 0), 1.2, [Math.cos(a) * 34, 0, Math.sin(a) * 34]); part(fg, cone(4.4, 22, 1, 6), M('#e8f4ff', '#fff', 0), 0, [Math.cos(a) * 34, 0, Math.sin(a) * 34]); } flames.push(fg); });
  const pot = G(g, [-160, 470, -10]); part(pot, lathe([[0.01, 0], [60, 0], [64, 6], [64, 96], [0.01, 96]], 22), M('#c9ccd2', '#9a9cb0'), 2.6); part(pot, new THREE.TorusGeometry(64, 6, 6, 22).rotateX(PI / 2), M('#aeb4bc', '#8a93a0'), 1.6, [0, 96, 0]);
  const kettleSteam = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), BMt('#ffffff', { transparent: true, opacity: 0.5, depthWrite: false })); g.add(m); kettleSteam.push(m); }
  const w = addWorld('stove', g, 'day', { flames });
  w.upd = (t, lt, p) => { p = p || {}; const on = p.on == null ? 1 : p.on; flames.forEach((f, k) => { f.visible = on > 0.02 && (k !== 1 && k !== 3 || p.all); f.scale.set(1, Math.max(0.01, on * (1 + 0.12 * Math.sin(t * 17 + k))), 1); f.children.forEach((c, i) => { c.scale.y = 1 + 0.25 * Math.sin(t * 21 + i * 1.7 + k); }); });
    kettleSteam.forEach((m, i) => { const u = frac(t * 0.5 + i / 6); m.position.set(-160 + 10 * Math.sin(u * 6 + i), 590 + u * 220, -10); m.scale.setScalar(10 + 28 * u); m.visible = on > 0.4 && (p.steam !== false); }); };
  return w;
}
