
/* ------------------------------------------------------------------ shared props */
const RB2 = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 2, r == null ? 4 : r);
function makeFirePot() {
  const g = new THREE.Group();
  part(g, lathe([[0.1, 0], [9, 0], [15, 5], [22, 26], [24, 32], [19, 32], [0.1, 29]], 20), M('#c9824a', '#8f5a3a'), 2.2);
  part(g, ell(18, 5, 18, 12, 6), bas('#ff7a2a'), 0, [0, 29, 0]);
  const coal = part(g, ell(9, 5, 9, 8, 5), bas('#ffd060'), 0, [2, 33, 0]);
  const gl = glow(g, '#ff9a3a', 120, [0, 36, 0], 0.9);
  g.userData.gl = gl; g.userData.coal = coal;
  return g;
}
function makeKnife() {
  const g = new THREE.Group();
  part(g, RB2(5, 34, 3, 1), toon('#5c5a66', { tint: '#8a8696', hi: 0 }), 1.6, [0, -2, 0]);       // dark steel, no gloss
  part(g, RB2(7, 14, 7, 2), WOODD(), 1.6, [0, 22, 0]);
  return g;
}
function makeWoodBundle(len, n) {
  const g = new THREE.Group(), wm = [WOOD(), WOOD2(), WOODD()];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = i === 0 ? 0 : 13; part(g, new THREE.CylinderGeometry(9.5, 9.5, len * (0.92 + 0.08 * ((i * 5) % 3)), 10), wm[i % 3], 2, [Math.cos(a) * r, 0, Math.sin(a) * r]); }
  part(g, new THREE.TorusGeometry(17, 2.6, 6, 14).rotateX(Math.PI / 2), M('#b08a4e', '#8a6a4a', 0), 0, [0, len * 0.22, 0]);
  part(g, new THREE.TorusGeometry(17, 2.6, 6, 14).rotateX(Math.PI / 2), M('#b08a4e', '#8a6a4a', 0), 0, [0, -len * 0.22, 0]);
  return g;
}
function makePlate() { const g = new THREE.Group(); part(g, lathe([[0.1, 0], [22, 0], [32, 6], [34, 7], [28, 5], [0.1, 3]], 22), M('#fbf6ea', '#c9c2c0', 0), 1.4); return g; }
function makeCup() { const g = new THREE.Group(); part(g, lathe([[0.1, 0], [10, 0], [13, 22], [11, 22], [0.1, 3]], 14), M('#e8ecf2', '#b0b8c8', 0), 1.2); return g; }
function makeCandle() {
  const g = new THREE.Group();
  part(g, lathe([[0.1, 0], [16, 0], [18, 4], [8, 10], [6, 40], [10, 52], [14, 56], [0.1, 56]], 14), M('#d9b04a', '#a8884a'), 1.6);
  part(g, new THREE.CylinderGeometry(5.5, 5.5, 50, 10).translate(0, 81, 0), M('#fff8e6', '#d8d0c0', 0), 1.4);
  const fl = part(g, ell(5, 11, 5, 8, 6), bas('#ffd25a'), 0, [0, 114, 0]);
  const gl = glow(g, '#ffc860', 150, [0, 116, 0], 0.9);
  g.userData.fl = fl; g.userData.gl = gl; return g;
}

/* ------------------------------------------------------------------ WORLD SM: the summit and the altar */
const SM = new THREE.Group(); scene.add(SM);
const ALT = new THREE.Group(); SM.add(ALT);
const STN = [], WLG = [];
const SLOTS = [   // x, y, z, w(x), h, d(z)
  [0, 15, -135, 210, 30, 100], [4, 15, -45, 206, 30, 100], [-3, 15, 45, 208, 30, 100], [0, 15, 135, 210, 30, 100],
  [4, 44, 90, 176, 28, 106], [-3, 44, 0, 172, 28, 106], [3, 44, -90, 176, 28, 106]];
const STC = ['#d9ccb2', '#cbb994', '#d2c2a4', '#c4b08c', '#d6c6a6', '#cdbb9a', '#d9cbae'];
const STONE_T0 = 73.0, STONE_DT = 1.0, STONE_FLY = 0.95;
const PILE_P = [330, 0, -270];
{
  // plateau: warm rock disk that falls away on all sides, a far golden land below
  part(SM, lathe([[0.1, -1300], [2500, -1300], [2300, -800], [1700, -280], [1300, -60], [1050, 0], [0.1, 0]], 48), M('#e2bc82', '#bd957e', 0), 9);
  mkMesh(new THREE.CircleGeometry(30000, 36).rotateX(-Math.PI / 2), toon('#ecd08c', { tint: '#c9a47c', hi: 0 }), SM, [0, -1306, 0]);
  const rnd = mulb(77);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + rnd() * 0.3, R = 6500 + rnd() * 4500; part(SM, ell(2600 + rnd() * 1200, 380 + rnd() * 380, 1400 + rnd() * 700, 18, 10), M(i % 2 ? '#e3b872' : '#d9ab62', '#c19a80', 0), 0, [Math.cos(a) * R, -1300 - 80, Math.sin(a) * R]); }
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2 + rnd() * 0.2, R = 820 + rnd() * 160; if (Math.abs(Math.sin(a)) < 0.2 && Math.cos(a) > 0.7) continue; const s = 0.8 + rnd() * 1.2; part(SM, ell(90 * s, 56 * s, 80 * s, 10, 7), i % 2 ? STONE() : STONE2(), 4, [Math.cos(a) * R, 20 * s, Math.sin(a) * R], [0, rnd() * 3, 0]); }
  for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2, R = 200 + rnd() * 640; const x = Math.cos(a) * R, z = Math.sin(a) * R; if (Math.abs(x) < 190 && Math.abs(z) < 240) continue; if (x > 120 && z < -150) continue; const s = 0.3 + rnd() * 0.5; part(SM, ell(60 * s, 34 * s, 50 * s, 8, 6), STONE2(), 2.6, [x, 8, z], [0, rnd() * 3, 0]); }
  // altar: seven rough stones, placed one by one (animated in applyEnv)
  SLOTS.forEach((s, i) => {
    const m = part(ALT, RB2(s[3], s[4], s[5], 9), M(STC[i], '#a99fb2'), 3.2); m.userData.fin = new THREE.Vector3(s[0], s[1], s[2]); m.userData.ry = (i * 0.37 % 0.2) - 0.08; STN.push(m);
  });
  // wood: eleven logs along x, two layers
  for (let k = 0; k < 11; k++) {
    const lo = k < 6, z = lo ? -125 + k * 50 : -100 + (k - 6) * 50, y = lo ? 58 + 12 : 58 + 34;
    const m = part(ALT, new THREE.CylinderGeometry(12, 12, 232 - (k % 3) * 8, 10).rotateZ(Math.PI / 2), k % 3 ? WOOD() : WOOD2(), 2.4); m.userData.fin = new THREE.Vector3((k % 2) * 6 - 3, y, z); WLG.push(m);
  }
  // the pile of stones by the son + the pile of logs
  for (const [x, z, s, r] of [[0, 0, 1, 0.1], [75, 22, 0.8, 1.2], [-52, 60, 0.7, 2.0], [28, -60, 0.7, 0.5], [20, 66, 0.55, 2.6]]) part(SM, RB2(120 * s, 50 * s, 90 * s, 10), M(['#d9ccb2', '#cbb994', '#c4b08c'][Math.floor(z + 100) % 3], '#a99fb2'), 3.2, [PILE_P[0] + x, 25 * s, PILE_P[2] + z], [0, r, 0]);
}
const LOGP = new THREE.Group(); LOGP.position.set(300, 0, 150); SM.add(LOGP);
const LOGP_L = [];
for (let k = 0; k < 11; k++) { const lo = k < 6, y = lo ? 12 : 34, z = lo ? (k - 2.5) * 26 : (k - 6 - 2) * 26; const m = part(LOGP, new THREE.CylinderGeometry(12, 12, 226 - (k % 3) * 8, 10).rotateZ(Math.PI / 2), k % 3 ? WOOD() : WOOD2(), 2.4, [0, y, z]); LOGP_L.push(m); }
// thicket of bushes for the ram (west side), branches over the horns
const THK = new THREE.Group(); THK.position.set(230, 0, -520); SM.add(THK);
{
  const bm = [M('#6f9a48', '#9db078', 0), M('#85a84e', '#a8b880', 0), M('#5f8a40', '#8aa070', 0)], br = M('#7a5638', '#8a6a5a', 0);
  for (const [x, z, s] of [[-120, -60, 1.2], [-130, 70, 1.1], [-40, -120, 1.0], [-30, 130, 1.0], [-200, 0, 1.3], [-90, 10, 0.9]]) { part(THK, ell(110 * s, 78 * s, 100 * s, 12, 8), bm[(x + z) % 3 < 0 ? 0 : 1], 3.4, [x, 70 * s, z]); }
  for (const [x, z, s] of [[-50, 55, 0.5], [-45, -50, 0.5]]) part(THK, ell(70 * s, 52 * s, 66 * s, 10, 7), bm[2], 3, [x, 48, z]);
  for (let i = 0; i < 9; i++) { const a = (i - 4) * 0.28; part(THK, tubeAlong([V(-70, 40 + (i % 3) * 20, (i - 4) * 20), V(10, 100 + (i % 4) * 22, (i - 4) * 16), V(52, 150 - (i % 3) * 10, (i - 4) * 12 + a * 24)], t => 4.2 - 2.4 * t, { segs: 10, radial: 6 }), br, 1.8); }
}
// beam of light (s11) + opening sky (s09)
const BEAM = mkMesh(new THREE.CylinderGeometry(70, 150, 3000, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0b8', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), SM, [90, 1560, 0]); BEAM.renderOrder = 8;
const BEAMC = mkMesh(new THREE.CylinderGeometry(26, 60, 3000, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), SM, [90, 1560, 0]); BEAMC.renderOrder = 9;
const beamGl = glow(SM, '#fff2c0', 520, [90, 130, 0], 0);
const CL9 = [];
for (let i = 0; i < 14; i++) {
  const g = PR.makeCloudPuff('#ffffff', '#efdce4'), a = i / 14 * Math.PI * 2 + 0.2, R = 2600 + 700 * Math.sin(i * 2.1) + (i % 2) * 500;
  g.userData.p = [Math.cos(a) * R, 1900 + 420 * Math.sin(i * 1.7) + (i % 3) * 160, Math.sin(a) * R]; g.userData.s = 3 + (i % 4) * 0.7; SM.add(g); CL9.push(g);
}
const halo9 = glow(SM, '#fff0c0', 5000, [0, 2300, 0], 0);
const smDrops = []; for (let i = 0; i < 70; i++) smDrops.push(glow(SM, '#ffcf55', 90, [0, -999, 0], 0)); smDrops.forEach(m => { m.material.blending = THREE.NormalBlending; });
const KN = makeKnife(), KS = makeKnife();
const SUN = new THREE.Group(); scene.add(SUN);
const sunDisc = mkMesh(SPH, bas('#fff3b8'), SUN); sunDisc.scale.setScalar(240);
const sunGl = glow(SUN, '#ffd27a', 2800, null, 0.8);
const FPH = makeFirePot(), FPG = makeFirePot(); FPG.position.set(300, 0, 20); FPG.scale.setScalar(0.9); SM.add(FPG);
const WB = makeWoodBundle(190, 7);
const ROPE = { wl: [], wr: [], an: [] };
{
  const rm = M('#b9935a', '#8a6a4a', 0);
  for (let i = 0; i < 3; i++) for (const k of ['wl', 'wr']) { const r = part(new THREE.Group(), new THREE.TorusGeometry(14, 3.2, 6, 14).rotateX(Math.PI / 2), rm, 0); ROPE[k].push(r); }
  for (let i = 0; i < 3; i++) { const r = part(new THREE.Group(), new THREE.TorusGeometry(27, 3.4, 6, 16).rotateX(Math.PI / 2).scale(1, 1, 1.7), rm, 0); ROPE.an.push(r); }
}

/* ------------------------------------------------------------------ WORLD HL: warm study hall */
const HL = new THREE.Group(); scene.add(HL);
const HALL_SET = PR.makeHall(); HL.add(HALL_SET);
const SHT = [];
const ROWZ = [1100, 1300, 1500, 1700, 1900];
for (let i = 0; i < 5; i++) {
  const s = PR.makeShtender(); s.rotation.y = Math.PI; s.position.set(200, 0, ROWZ[i]); HL.add(s);
  const bk = PR.makeBook(true); bk.position.set(2, 8.5, 0); bk.scale.setScalar(0.8); bk.rotation.y = Math.PI; s.userData.top.add(bk); SHT.push({ s, bk });
}
const sunWin = glow(HL, '#fff0b0', 900, [0, 520, -420], 0.9);
const hallShaft = mkMesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: '#fff0b8', transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), HL);
hallShaft.frustumCulled = false; hallShaft.renderOrder = 7;
{
  const P2 = new Float32Array([-330, 760, 6, 330, 760, 6, 380, 4, 1300, -380, 4, 1300]);
  hallShaft.geometry.setAttribute('position', new THREE.BufferAttribute(P2, 3)); hallShaft.geometry.setIndex([0, 1, 2, 0, 2, 3]); hallShaft.geometry.computeBoundingSphere();
}

/* ------------------------------------------------------------------ WORLD HM: the home (kitchen + dining room) and the house from outside */
const HM = new THREE.Group(); scene.add(HM);
const HX = 1200, HZ0 = -500, HZ1 = 1500, HWH = 760;
const WINDOW = { x0: -380, x1: 380, y0: 190, y1: 610 };
{
  const fl = M('#d9a566', '#b88a78'), wl = M('#f3dcb0', '#cdb090'), wl2 = M('#ead0a0', '#c4a488'), trim = WOODD();
  mkMesh(new THREE.BoxGeometry(HX * 2, 20, HZ1 - HZ0), fl, HM, [0, -10, (HZ0 + HZ1) / 2]);
  for (let i = -7; i <= 7; i++) mkMesh(new THREE.BoxGeometry(3, 1.2, HZ1 - HZ0), M('#b27a45', '#9a7a7a'), HM, [i * 160, 0.8, (HZ0 + HZ1) / 2]);
  const wallBox = (w, h, d, x, y, z, m) => box(HM, w, h, d, m || wl, [x, y, z], 0, null, 0);
  wallBox(HX * 2, HWH, 40, 0, HWH / 2, HZ0, wl);                                         // back wall
  wallBox(40, HWH, HZ1 - HZ0, -HX, HWH / 2, (HZ0 + HZ1) / 2, wl2); wallBox(40, HWH, HZ1 - HZ0, HX, HWH / 2, (HZ0 + HZ1) / 2, wl2);
  // front wall with the window opening
  const fw = (w, h, x, y) => wallBox(w, h, 40, x, y, HZ1, wl);
  fw(HX - WINDOW.x1, HWH, (HX + WINDOW.x1) / 2, HWH / 2); fw(HX + WINDOW.x0, HWH, (-HX + WINDOW.x0) / 2, HWH / 2);
  fw(WINDOW.x1 - WINDOW.x0, WINDOW.y0, 0, WINDOW.y0 / 2); fw(WINDOW.x1 - WINDOW.x0, HWH - WINDOW.y1, 0, (HWH + WINDOW.y1) / 2);
  for (const [w, h, x, y] of [[WINDOW.x1 - WINDOW.x0 + 60, 26, 0, WINDOW.y0 - 8], [WINDOW.x1 - WINDOW.x0 + 60, 26, 0, WINDOW.y1 + 8], [26, WINDOW.y1 - WINDOW.y0 + 40, WINDOW.x0 - 10, (WINDOW.y0 + WINDOW.y1) / 2], [26, WINDOW.y1 - WINDOW.y0 + 40, WINDOW.x1 + 10, (WINDOW.y0 + WINDOW.y1) / 2]]) box(HM, w, h, 58, trim, [x, y, HZ1 + 4], 2.2, null, 3);
  for (const s of [-1, 1]) box(HM, 90, 380, 14, M('#fff8ea', '#d8cfc4', 0), [s * (WINDOW.x1 - 40), 400, HZ1 - 40], 1.6, null, 5);   // curtains
  mkMesh(new THREE.BoxGeometry(HX * 2 + 60, 30, HZ1 - HZ0 + 60), wl2, HM, [0, HWH + 15, (HZ0 + HZ1) / 2]);   // ceiling slab
  // gable roof (seen from outside)
  const rs = new THREE.Shape(); rs.moveTo(-(HZ1 - HZ0) / 2 - 80, 0); rs.lineTo((HZ1 - HZ0) / 2 + 80, 0); rs.lineTo(0, 330); rs.lineTo(-(HZ1 - HZ0) / 2 - 80, 0);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: HX * 2 + 140, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-HX - 70, HWH + 30, (HZ0 + HZ1) / 2); part(HM, rg, M('#c8553c', '#8a6a78'), 4);
  box(HM, 120, 300, 120, M('#e0b890', '#b89a86'), [-620, HWH + 220, 500], 3, null, 3);                    // chimney
  // door in the front wall (outside, east end) + step
  box(HM, 200, 520, 12, M('#8f5d33'), [900, 260, HZ1 + 22], 2.4, null, 3); box(HM, 300, 14, 120, STONE(), [900, 7, HZ1 + 80], 2.4, null, 3);
  // ground outside: golden grass, soft hills, trees, a path to the door
  mkMesh(new THREE.CircleGeometry(30000, 36).rotateX(-Math.PI / 2), toon('#d8c47a', { tint: '#b8a47c', hi: 0 }), HM, [0, -8, 0]);
  const rnd = mulb(19);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, R = 7000 + rnd() * 2500; part(HM, ell(2600 + rnd() * 1200, 420 + rnd() * 380, 1600, 18, 10), M(i % 2 ? '#c9b46a' : '#b8c071', '#b8a890', 0), 0, [Math.cos(a) * R, -120, Math.sin(a) * R]); }
  const pp = []; for (let k = 0; k <= 14; k++) pp.push([900 + 520 * Math.sin(k * 0.5) * (k / 14), -1, HZ1 + 140 + k * 230]);
  const pmat = toon('#f3dcaa', { tint: '#d8bd90', hi: 0 }); pmat.side = THREE.DoubleSide; HM.add(ribbon(pp, 200, pmat));
  for (const [x, z, s] of [[-1700, 2200, 1.8], [1900, 1800, 1.6], [-2600, 400, 1.7], [2700, 600, 2.0], [-900, 3200, 1.4], [400, 4300, 1.5]]) tree(HM, x, 0, z, s, '#8aa850');
  for (let i = 0; i < 24; i++) { const x = -3500 + rnd() * 7000, z = 1900 + rnd() * 2400; if (Math.abs(x - 900) < 500 && z < 3300) continue; part(HM, ell(60, 36, 52, 8, 6), M(['#a9a652', '#8fae4e'][i % 2], '#c8c490', 0), 2.6, [x, 18, z]); }
}
const WLIGHT = glow(HM, '#ffd27a', 1500, [0, 400, HZ1 + 220], 0.0);
// interior furniture
const TBL = new THREE.Group(); TBL.position.set(0, 0, 300); HM.add(TBL);
{
  const t = PR.makeTable(780, 200, 118); TBL.add(t);
}
const BEN1 = PR.makeBench(660, 70); BEN1.position.set(0, 0, 130); HM.add(BEN1);
const BEN2 = PR.makeBench(660, 70); BEN2.position.set(0, 0, 470); HM.add(BEN2);
const CLOTH = new THREE.Group(); CLOTH.position.set(0, 119, 300); TBL.add(CLOTH); CLOTH.position.set(0, 119, 0);
{
  const cm = M('#ffffff', '#d6d2de', 0);
  box(CLOTH, 840, 5, 250, cm, [0, 0, 0], 1.4, null, 2);
  box(CLOTH, 840, 70, 5, cm, [0, -32, 124], 1.2, null, 1); box(CLOTH, 840, 70, 5, cm, [0, -32, -124], 1.2, null, 1);
  box(CLOTH, 5, 70, 250, cm, [-420, -32, 0], 1.2, null, 1); box(CLOTH, 5, 70, 250, cm, [420, -32, 0], 1.2, null, 1);
}
const CANDL = []; for (const x of [-320, 320]) { const c = makeCandle(); c.position.set(x, 0, -10); c.scale.setScalar(0.75); CLOTH.add(c); c.position.y = 3; CANDL.push(c); }
const CUPS = []; for (const [x, z] of [[-210, -50], [-40, 60], [170, 50], [260, -30]]) { const c = makeCup(); c.position.set(x, 3, z); CLOTH.add(c); CUPS.push(c); }
const PLATES = [], PLATEPOS = [[-250, 40], [-90, 60], [90, 55], [250, 35], [-170, -45], [170, -45]];
PLATEPOS.forEach(([x, z]) => { const p = makePlate(); p.position.set(x, 118, 300 + z); HM.add(p); PLATES.push(p); });
const TCUPS = []; for (const [x, z] of [[-30, 20], [30, 0]]) { const c = makeCup(); c.position.set(x, 118, 300 + z); HM.add(c); TCUPS.push(c); }
const STACK = new THREE.Group(); HM.add(STACK);
for (let i = 0; i < 6; i++) { const p = makePlate(); p.position.y = i * 7; STACK.add(p); }
// kitchen: counter, cupboards, shelf, lamp, rug, pots
{
  const cm = M('#c68a50', '#a87a74'), ct = M('#efe2c6', '#cdbfa8', 0);
  box(HM, 1500, 190, 130, cm, [-300, 95, HZ0 + 100], 2.6, null, 3); box(HM, 1540, 18, 150, ct, [-300, 199, HZ0 + 100], 2.2, null, 3);
  for (let i = -3; i <= 3; i++) box(HM, 4, 150, 4, WOODD(), [-300 + i * 200, 100, HZ0 + 168], 0, null, 1);
  box(HM, 300, 60, 100, M('#bcd6e6', '#8ea8b8', 0), [-720, 214, HZ0 + 100], 1.6, null, 3);
  for (const x of [-700, -300, 100]) box(HM, 360, 220, 90, cm, [x, 560, HZ0 + 70], 2.6, null, 3);
  box(HM, 1200, 14, 120, WOODD(), [-300, 400, HZ0 + 110], 2.2, null, 2);
  for (let i = 0; i < 5; i++) { const p = makePlate(); p.position.set(-760 + i * 90, 414, HZ0 + 110); p.rotation.x = Math.PI / 2; p.position.z += 24; HM.add(p); }
  part(HM, lathe([[0.1, 0], [30, 0], [36, 6], [38, 40], [30, 46], [0.1, 40]], 20), M('#7a8a98', '#5a6a78'), 2, [-80, 218, HZ0 + 100]);
  part(HM, lathe([[0.1, 0], [26, 0], [32, 6], [34, 34], [26, 40], [0.1, 34]], 20), M('#c9824a', '#8f5a3a'), 2, [-420, 218, HZ0 + 100]);
  mkMesh(new THREE.BoxGeometry(1100, 2, 700), M('#d86a4a', '#a8584a', 0), HM, [0, 1, 300]);               // rug
  mkMesh(new THREE.BoxGeometry(1000, 2.4, 560), M('#f3d49a', '#c8a878', 0), HM, [0, 1.6, 300]);
}
const LAMPH = PR.makeLamp(300); LAMPH.position.set(0, 760, 300); HM.add(LAMPH);
const SIDEB = new THREE.Group(); HM.add(SIDEB);
box(HM, 260, 190, 160, M('#c68a50', '#a87a74'), [-540, 95, 300], 2.6, null, 3); box(HM, 280, 16, 180, M('#efe2c6', '#cdbfa8', 0), [-540, 198, 300], 2.2, null, 3);
box(SIDEB, 420, 120, 140, M('#c68a50', '#a87a74'), [820, 60, 40], 2.6, null, 3);
const CRATE = new THREE.Group(); HM.add(CRATE);
{
  box(CRATE, 220, 110, 130, M('#c9955a', '#a87a74'), [0, 55, 0], 2.8, null, 4);
  box(CRATE, 232, 14, 142, WOODD(), [0, 104, 0], 2.2, null, 3); box(CRATE, 232, 14, 142, WOODD(), [0, 8, 0], 2.2, null, 3);
  for (const s of [-1, 1]) box(CRATE, 14, 100, 142, WOODD(), [s * 108, 55, 0], 2, null, 2);
}
