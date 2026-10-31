
/* ------------------------------------------------------------------ shared small props */
const mkMesh = (geo, mat, parent, pos) => { const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (parent) parent.add(m); return m; };
const SPH = new THREE.SphereGeometry(1, 8, 6);
const clayM = () => M('#c9824a', '#8f5a3a');
function makePot() {
  const g = new THREE.Group();
  part(g, lathe([[0.1, 0], [20, 0], [26, 6], [30, 40], [35, 46], [35, 53], [28, 53], [0.1, 53]], 22), clayM(), 2.2);
  part(g, ell(27, 3, 27, 16, 6), M('#5a3a22', '#4a3a3a', 0), 0, [0, 50, 0]);
  const stem = part(g, new THREE.CylinderGeometry(4.2, 5.6, 1, 8).translate(0, 0.5, 0), M('#5cc04a', '#9cc08a'), 0.5, [0, 51, 0]);
  const l1 = part(g, ell(20, 4.5, 8, 10, 6), M('#7fd45a', '#9cc08a'), 1.1, [12, 60, 0], [0, 0, 0.5]);
  const l2 = part(g, ell(20, 4.5, 8, 10, 6), M('#7fd45a', '#9cc08a'), 1.1, [-12, 60, 0], [0, 0, -0.5]);
  const seed = glow(g, '#ffe27a', 90, [0, 58, 0], 0);
  g.userData.set = (h, glowOp) => {
    stem.scale.y = Math.max(0.001, h); stem.visible = h > 0.6;
    const lv = cl((h - 14) / 30, 0, 1); l1.visible = l2.visible = lv > 0.02;
    l1.position.y = l2.position.y = 51 + h * 0.92; l1.scale.setScalar(Math.max(0.01, lv)); l2.scale.setScalar(Math.max(0.01, lv));
    l1.rotation.z = 0.5 - 0.35 * (1 - lv); l2.rotation.z = -0.5 + 0.35 * (1 - lv);
    seed.material.opacity = glowOp || 0; seed.position.y = 58 + Math.min(h, 30) * 0.2;
  };
  g.userData.set(0, 0);
  return g;
}
function makeCan() {
  const g = new THREE.Group(), mc = M('#4f93c9', '#3a6a96');
  part(g, lathe([[0.1, 0], [22, 0], [26, 8], [26, 34], [22, 40], [0.1, 40]], 20), mc, 2.2);
  part(g, new THREE.CylinderGeometry(4.5, 7, 54, 10).rotateZ(-1.0).translate(36, 40, 0), mc, 1.8);   // spout up and out (+x)
  part(g, new THREE.TorusGeometry(15, 2.6, 6, 16, Math.PI * 1.25).rotateZ(2.4), M('#34628a'), 0, [-24, 22, 0]);
  const tip = new THREE.Group(); tip.position.set(58, 62, 0); g.add(tip); g.userData.tip = tip;
  return { g, tip };
}

/* ------------------------------------------------------------------ WORLD FM: farm, field, irrigation, village */
const FM = new THREE.Group(); scene.add(FM);
const furrowMat = M('#b57d46', '#8a6050'), soilMat = M('#8a5632', '#6a4a46', 0);
const FIELD_Z = i => -400 + 110 * i;
{
  part(FM, new THREE.BoxGeometry(18000, 60, 16000), M('#9ccd6c', '#c8d6c0', 0), 0, [0, -30, 0]);
  part(FM, new THREE.BoxGeometry(3500, 8, 1180), soilMat, 0, [0, 1, 105]);
  for (let i = 0; i < 10; i++) box(FM, 3400, 24, 36, furrowMat, [0, 12, FIELD_Z(i)], 0, null, 9);
  // gentle ring of hills all around
  const hm = [M('#9ccd6c', '#c8d6c0', 0), M('#7fb85a', '#c8d6c0', 0), M('#8cc068', '#c8d6c0', 0)];
  for (let i = 0; i < 14; i++) { const a = i * Math.PI * 2 / 14 + 0.2, R = 6200 + (i % 3) * 700; hill(FM, Math.cos(a) * R, Math.sin(a) * R, 2300 + (i % 4) * 300, 520 + (i % 3) * 170, 1500, hm[i % 3], 0); }
  for (const [x, z, rx, ry, rz, k] of [[-2400, -2300, 1500, 250, 600, 1], [2600, -2500, 1700, 300, 700, 2], [-600, -1900, 1200, 160, 400, 0]]) hill(FM, x, z, rx, ry, rz, hm[k], 5);
  // village on the hill crest
  hill(FM, 900, -3300, 2100, 380, 800, hm[2], 6);
  const VG = new THREE.Group(); VG.position.set(900, 232, -3300); FM.add(VG);
  const rnd = mulb(11);
  const walls = ['#f6e3c4', '#f1d2b0', '#fbefd6', '#eac9a6'];
  for (let i = 0; i < 9; i++) { const x = (i % 5 - 2) * 330 + (rnd() - 0.5) * 80, z = (i < 5 ? -140 : 150) + (rnd() - 0.5) * 60; house(VG, x, z, 190 + rnd() * 70, 130 + rnd() * 40, 150, walls[i % 4], '#c8553c', (rnd() - 0.5) * 0.3); }
  for (const [x, z, s] of [[-780, 40, 0.9], [-560, 200, 0.7], [640, 60, 1.0], [820, 190, 0.8], [90, 270, 0.7]]) tree(VG, x, z, s, 0, '#5fae4e');
  for (const [x, z, s] of [[-1300, 900, 1.5], [1500, 1000, 1.7], [2300, 700, 1.4], [-2100, 100, 1.6], [-1800, 1100, 1.3]]) tree(FM, x, z, s, 0, '#58a84a');
  // irrigation pipe along the back of the field + risers
  part(FM, new THREE.CylinderGeometry(14, 14, 3300, 12).rotateZ(Math.PI / 2), M('#5a8fc0', '#4a6a8a'), 2, [0, 16, -520]);
}
const SPR = [];
for (let k = 0; k < 10; k++) {
  const x = -1350 + k * 300, g = new THREE.Group(); g.position.set(x, 0, -520); FM.add(g);
  part(g, new THREE.CylinderGeometry(7, 7, 60, 8), M('#5a8fc0', '#4a6a8a'), 1.6, [0, 40, 0]);
  const head = part(g, ell(14, 9, 14, 10, 6), M('#e8b64a', '#a08040'), 1.6, [0, 74, 0]);
  const arm = box(g, 34, 6, 6, M('#d7a53c'), [14, 74, 0], 1.4, null, 2);
  const dr = []; for (let j = 0; j < 12; j++) { const m = mkMesh(SPH, new THREE.MeshBasicMaterial({ color: j % 3 ? '#c9ecff' : '#ffffff', transparent: true, opacity: 0.92 }), FM); m.scale.setScalar(4.4 + (j % 3)); dr.push(m); }
  SPR.push({ x, g, arm, dr });
}
const VALVE = new THREE.Group(); VALVE.position.set(200, 0, -520); FM.add(VALVE);
part(VALVE, new THREE.CylinderGeometry(9, 9, 80, 8), M('#5a8fc0', '#4a6a8a'), 1.6, [0, 50, -18]);
const VW = new THREE.Group(); VW.position.set(0, 100, -18); VALVE.add(VW);
part(VW, new THREE.TorusGeometry(26, 4, 8, 22), M('#d8432f', '#903020'), 1.6);
box(VW, 52, 5, 5, M('#d8432f'), [0, 0, 0], 1.2, null, 1); box(VW, 5, 52, 5, M('#d8432f'), [0, 0, 0], 1.2, null, 1);
// crop plants on the ridges
const PLANTS = [];
{
  const pm1 = M('#5cc04a', '#9cc08a'), pm2 = M('#86dd5e', '#9cc08a');
  for (let i = 0; i < 10; i++) for (let j = 0; j < 16; j++) {
    const g = new THREE.Group(); g.position.set(-1480 + j * 195 + (i % 2) * 95, 22, FIELD_Z(i)); FM.add(g);
    part(g, ell(7, 36, 7, 8, 6), pm1, 1.3, [0, 34, 0]);
    part(g, ell(26, 6, 10, 8, 6), pm2, 1.2, [18, 54, 0], [0, 0, 0.55]); part(g, ell(26, 6, 10, 8, 6), pm2, 1.2, [-18, 44, 0], [0, 0, -0.55]);
    g.scale.setScalar(0.001); g.visible = false; PLANTS.push({ g, d: hash(i * 17 + j * 3.1), k: i });
  }
}
// seeds in the air (s01)
const SEEDS = []; for (let k = 0; k < 18; k++) SEEDS.push(mkMesh(SPH, bas('#f2d27a'), FM));
SEEDS.forEach(m => m.scale.setScalar(5));
// sun
const SUN = new THREE.Group(); scene.add(SUN);
const sunDisc = mkMesh(SPH, bas('#fff3b8'), SUN); sunDisc.scale.setScalar(240);
const sunGl = glow(SUN, '#ffd27a', 2800, null, 0.8);
// clouds
const CLD = [], cloudM = M('#ffffff', '#cdd8ec', 0.01);
for (let i = 0; i < 11; i++) {
  const g = new THREE.Group(); const x = -2800 + i * 560 + ((i * 7) % 3) * 90, y = 1500 + ((i * 5) % 4) * 140, z = -700 - ((i * 3) % 5) * 520;
  for (const [a, b, r] of [[0, 0, 150], [-150, -30, 110], [160, -26, 118], [60, 54, 100], [-70, 48, 96]]) part(g, ell(r, r * 0.74, r * 0.62), cloudM, 5, [a, b, 0]);
  g.position.set(x, y, z); FM.add(g); CLD.push({ g, x, y, z, d: hash(i * 5.3) });
}
// rain gauge: post + clear tube + blue water (no marks)
const GAUGE = new THREE.Group(); GAUGE.position.set(-70, 0, 770); FM.add(GAUGE);
const gaugeW = mkMesh(new THREE.CylinderGeometry(12, 12, 1, 14).translate(0, 0.5, 0), bas('#3aa0ec'), GAUGE, [0, 74, 0]);
{
  box(GAUGE, 16, 150, 16, WOOD(), [0, 75, -22], 2.2, null, 2);
  mkMesh(new THREE.CylinderGeometry(15, 15, 132, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#d4eefb', transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }), GAUGE, [0, 140, 0]);
  part(GAUGE, new THREE.TorusGeometry(15, 2.4, 6, 18).rotateX(Math.PI / 2), M('#34495e'), 0, [0, 206, 0]);
  part(GAUGE, new THREE.CylinderGeometry(17, 17, 8, 14), M('#34495e'), 1.4, [0, 70, 0]);
  box(GAUGE, 6, 6, 30, WOODD(), [0, 118, -10], 1.4, null, 1);
}
const rainFM = PR.makeRain(1100, 5); rainFM.material.color.set('#fff0c8'); scene.add(rainFM);

/* ------------------------------------------------------------------ WORLD GD: garden bed (s06, s07) */
const GD = new THREE.Group(); scene.add(GD);
const BAMB = [];
{
  part(GD, new THREE.BoxGeometry(14000, 60, 12000), M('#9ccd6c', '#c8d6c0', 0), 0, [0, -30, 0]);
  const bedM = M('#7a4a2a', '#5a3a36', 0);
  box(GD, 560, 26, 320, bedM, [0, 13, 0], 0, null, 8);
  for (const [w, d, x, z] of [[600, 22, 0, -170], [600, 22, 0, 170], [22, 320, -290, 0], [22, 320, 290, 0]]) box(GD, w, 34, d, WOOD2(), [x, 17, z], 2.4, null, 3);
  // plain wooden marker stick
  const stick = box(GD, 8, 84, 8, WOODD(), [120, 62, 60], 1.8, [0, 0.3, 0.08], 2);
  // low stone wall + hedge + trees behind
  for (let i = -6; i <= 6; i++) box(GD, 230, 120 + (i % 2) * 14, 70, i % 2 ? STONE() : STONE2(), [i * 235, 60, -820], 2.6, null, 8);
  for (let i = -8; i <= 8; i++) part(GD, ell(150, 100, 100, 14, 9), M(i % 2 ? '#6fba54' : '#5fae4e', '#c4cfc0'), 3, [i * 190, 150, -920]);
  for (const [x, z, s] of [[-900, -600, 1.6], [1000, -650, 1.8], [-1500, 300, 1.4], [1500, 200, 1.5]]) tree(GD, x, z, s, 0, '#58a84a');
  for (let i = 0; i < 7; i++) part(GD, ell(54, 6, 40, 12, 6), STONE(), 1.8, [-440 - i * 90, 3, 0 + (i % 2) * 24 - 12]);
  // bamboo shoots (pure function of t)
  const bm = M('#7bc858', '#5a9a50'), bm2 = M('#a8e07a', '#7ab070'), nodeM = M('#4f9a3f', '#3a7040', 0);
  const specs = [[-60, -30, 0.95, 0.06], [20, 44, 1.0, -0.05], [76, -14, 0.82, 0.08], [-14, -66, 0.9, -0.07], [118, 56, 0.72, 0.05], [-104, 30, 0.78, -0.04], [34, -4, 1.12, 0.03]];
  specs.forEach(([x, z, hs, bend], si) => {
    const g = new THREE.Group(); g.position.set(x, 26, z); GD.add(g);
    const N = 13, segs = [];
    for (let k = 0; k < N; k++) {
      const c = part(g, new THREE.CylinderGeometry(8.5 - k * 0.32, 9.5 - k * 0.32, 1, 10).translate(0, 0.5, 0), k % 2 ? bm : bm2, 1.4);
      const r = part(g, new THREE.TorusGeometry(9 - k * 0.32, 2.2, 5, 12).rotateX(Math.PI / 2), nodeM, 0);
      segs.push({ c, r });
    }
    const leaves = []; for (let k = 6; k < N; k++) for (const s of [-1, 1]) { const l = part(g, ell(34, 3.6, 9, 10, 5), M('#5fb84a', '#4a8a40'), 1, null); leaves.push({ l, k, s }); }
    BAMB.push({ g, segs, leaves, hs, bend, d: si * 0.35 });
  });
}

/* ------------------------------------------------------------------ WORLD SL: cut-away slice of the ground (s08) */
const SL = new THREE.Group(); scene.add(SL);
const SLB = new THREE.Group(); SL.add(SLB);
const SW = 2600, SD = 300, SZ = SD / 2;
const ROOTS = new THREE.Group(); SLB.add(ROOTS);
const ROOTSEG = []; let ROOTTOTAL = 0;
{
  const layers = [[0, -26, '#8cc068', '#c4d6b8'], [-26, -230, '#7a4a2a', '#5a3a36'], [-230, -480, '#a8703f', '#8a6050'], [-480, -800, '#c9a068', '#a8886a']];
  for (const [y0, y1, c, t] of layers) box(SLB, SW, y0 - y1, SD, M(c, t, 0), [0, (y0 + y1) / 2, 0], 3, null, 2);
  const rnd = mulb(23);
  for (let i = 0; i < 12; i++) { const y = -60 - rnd() * 700, x = (rnd() - 0.5) * 900; part(SLB, ell(16 + rnd() * 22, 11 + rnd() * 14, 8, 8, 6), M(y < -450 ? '#9aa0a8' : '#b5aa98', '#8a8a96'), 1.8, [x, y, SZ + 1]); }
  box(SLB, 8, 84, 8, WOODD(), [120, 42, 40], 1.8, [0, 0.3, 0.08], 2);                        // marker stick on the bare top
  for (const x of [-900, -620, -380, -300, 320, 400, 700, 980]) part(SLB, ell(30, 18, 20, 10, 6), M('#6fba54', '#4a8a40'), 2, [x, 4, 20]);
  const gm = new THREE.MeshBasicMaterial({ color: '#ffcf2e' }), gm2 = new THREE.MeshBasicMaterial({ color: '#fff0a0' });
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 6).translate(0, 0.5, 0);
  function addRoot(p0, ang, len, r, depth, off) {
    const p1 = [p0[0] + Math.sin(ang) * len, p0[1] - Math.cos(ang) * len];
    const m = new THREE.Mesh(cyl, depth === 0 ? gm2 : gm); m.position.set(p0[0], p0[1], SZ + 3); m.rotation.z = ang - Math.PI; m.scale.set(r, 0.001, r); ROOTS.add(m);
    ROOTSEG.push({ m, len, off, r }); const o2 = off + len;
    ROOTTOTAL = Math.max(ROOTTOTAL, o2);
    if (depth < 3) {
      const kids = depth === 0 ? [-0.55, 0.0, 0.6] : [-0.7, 0.55];
      kids.forEach((da, ki) => addRoot(p1, ang + da * (0.7 + 0.3 * rnd()) * (depth === 0 ? 1 : 0.8), len * (depth === 0 ? 0.95 : 0.78), r * 0.74, depth + 1, o2 + ki * 14));
    }
  }
  // main root straight down in a few kinks, side roots branching off
  let p = [0, -26], off = 0;
  for (let k = 0; k < 6; k++) { const a = (k % 2 ? 1 : -1) * 0.1; const len = 130; addRoot(p, a, len, 7.5, 0, off); p = [p[0] + Math.sin(a) * len, p[1] - Math.cos(a) * len]; off += len; }
  for (let k = 1; k <= 4; k++) for (const s of [-1, 1]) addRoot([s * 4, -26 - k * 120], s * (1.15 + 0.1 * k * 0.3), 150, 5, 1, k * 120 + (s > 0 ? 8 : 0));
}
const rootTipGl = glow(ROOTS, '#fff0a0', 150, [0, -26, SZ + 6], 0.9);
const rootGlowAll = glow(ROOTS, '#ffcf3a', 900, [0, -330, SZ + 12], 0.0);

/* ------------------------------------------------------------------ WORLD HL: warm study hall */
const HL = new THREE.Group(); scene.add(HL);
const HALL_SET = PR.makeHall(); HL.add(HALL_SET);
// open a door in the +x wall (z 970..1190, height 390) with a clock above it
HALL_SET.children.forEach(c => { if (Math.abs(c.position.x - 1500) < 1 && Math.abs(c.position.y - 750) < 1) c.visible = false; });
{
  const wm = M('#d6ad74', '#b79583');
  box(HL, 40, 1500, 1270, wm, [1500, 750, 335], 0, null, 0);          // z -300..970
  box(HL, 40, 1500, 1010, wm, [1500, 750, 1695], 0, null, 0);         // z 1190..2200
  box(HL, 40, 1110, 220, wm, [1500, 945, 1080], 0, null, 0);          // above the door
  for (const [w, h, d, y, z] of [[24, 16, 244, 396, 1080], [24, 396, 16, 198, 972], [24, 396, 16, 198, 1188]]) box(HL, w, h, d, WOODD(), [1494, y, z], 2.2, null, 2);
  const out = mkMesh(new THREE.PlaneGeometry(260, 400), bas('#fff6d0'), HL, [1560, 200, 1080]); out.rotation.y = -Math.PI / 2;
  mkMesh(new THREE.PlaneGeometry(900, 900), bas('#d6f0c0'), HL, [1580, 0.5, 1080]).rotation.x = -Math.PI / 2;
  // wall clock: plain round dial, two hands, no numbers
  const CK = new THREE.Group(); CK.position.set(1476, 640, 1080); CK.rotation.y = -Math.PI / 2; HL.add(CK);
  part(CK, new THREE.CylinderGeometry(70, 70, 14, 28).rotateX(Math.PI / 2), M('#8f5d33', '#7a5a60'), 2.4);
  part(CK, new THREE.CylinderGeometry(60, 60, 8, 28).rotateX(Math.PI / 2), M('#fff6e0', '#ddd0c0', 0), 0, [0, 0, 5]);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; mkMesh(SPH, bas('#4a3a2a'), CK, [Math.sin(a) * 50, Math.cos(a) * 50, 10]).scale.setScalar(i % 3 ? 2.6 : 4); }
  const hh = new THREE.Group(), mh = new THREE.Group(); hh.position.z = mh.position.z = 11; CK.add(hh); CK.add(mh);
  box(hh, 6, 34, 4, M('#2a1e18'), [0, 17, 0], 0, null, 1); box(mh, 4, 50, 4, M('#2a1e18'), [0, 25, 0], 0, null, 1);
  HL.userData.hh = hh; HL.userData.mh = mh;
}
// row of shtenders (readers stand at +x of each and face -x)
const SHT = [];
for (let i = 0; i < 5; i++) {
  const s = PR.makeShtender(); s.rotation.y = Math.PI; s.position.set(200, 0, [1080, 820, 1340, 560, 1600][i]); HL.add(s);
  const bk = PR.makeBook(true); bk.position.set(2, 8.5, 0); bk.scale.setScalar(0.8); bk.rotation.y = Math.PI; s.userData.top.add(bk); SHT.push({ s, bk });
}
const bookGlow = glow(SHT[0].s.userData.top, '#ffe9a0', 200, [0, 24, 0], 0);
// study table with benches (table runs along z, x = -650)
const T1 = new THREE.Group(); T1.position.set(-300, 0, 1300); HL.add(T1);
{
  const t = PR.makeTable(760, 150, 118); t.rotation.y = Math.PI / 2; T1.add(t);
  for (const sx of [-1, 1]) { const b = PR.makeBench(720, 70); b.rotation.y = Math.PI / 2; b.position.set(sx * 150, 0, 0); T1.add(b); }
  const s1 = PR.makeSefer('#6b3f2a', 84, 60, 12), s2 = PR.makeSefer('#2b4d8c', 78, 56, 10), s3 = PR.makeSefer('#8c2b2b', 80, 54, 11);
  s1.position.set(0, 118, 200); s2.position.set(18, 130, 200); s2.rotation.y = 0.2; s3.position.set(30, 118, 280); T1.add(s1, s2, s3);
}
const TBOOK = PR.makeBook(true); TBOOK.position.set(-300 + 5, 118 + 2, 1080); TBOOK.rotation.y = Math.PI; HL.add(TBOOK);
// window sill with a row of clay pots
const SILL = new THREE.Group(); HL.add(SILL);
box(SILL, 1180, 14, 120, WOODD(), [0, 178, 70], 2.4, null, 3);
const SPOT = [];
for (let i = 0; i < 7; i++) { const p = makePot(); p.position.set(-450 + i * 150, 185, 70); SILL.add(p); SPOT.push(p); }
// time-lapse light: sun glow seen through the window + a light patch on the floor
const sunWin = glow(HL, '#fff0b0', 700, [0, 500, -500], 0.9);
const floorPatch = mkMesh(new THREE.PlaneGeometry(560, 900).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffe8a0', transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }), HL, [0, 4, 700]);
floorPatch.renderOrder = 6;
const shaft = mkMesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: '#fff0b8', transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), HL);
shaft.frustumCulled = false; shaft.renderOrder = 7;
const beam = mkMesh(new THREE.CylinderGeometry(70, 230, 1300, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0b0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), HL);
beam.renderOrder = 8;
// golden motes (seeds of light)
const MOTES = [];
for (let i = 0; i < 18; i++) MOTES.push(glow(HL, '#ffd860', 46, [0, -999, 0], 0));
// clay pots for the long table of the last hall scene
const TP = []; for (let i = 0; i < 6; i++) { const p = makePot(); HL.add(p); p.visible = false; TP.push(p); }
const TLONG = PR.makeTable(1900, 150, 118); TLONG.position.set(0, 0, 1350); HL.add(TLONG);
// held props
const POTH = makePot(); ACT.BO.o.hand(-1).add(POTH); POTH.position.set(0, -34, 14); POTH.scale.setScalar(0.55); POTH.rotation.z = Math.PI; POTH.visible = false;
const CAN = makeCan(); ACT.BO.o.hand(1).add(CAN.g); CAN.g.position.set(0, -26, 10); CAN.g.scale.setScalar(0.62); CAN.g.rotation.set(0, 0, Math.PI / 2); CAN.g.visible = false;
const POTT = makePot(); POTT.position.set(-290, 118, 1170); POTT.scale.setScalar(0.8); POTT.visible = false; HL.add(POTT);
const dropsC = []; for (let i = 0; i < 10; i++) { const m = mkMesh(SPH, new THREE.MeshBasicMaterial({ color: '#bfe8ff' }), scene); m.scale.setScalar(3.6); m.visible = false; dropsC.push(m); }
const BAGM = new THREE.Group(); part(BAGM, ell(30, 25, 14, 14, 10), M('#c9a56a', '#8a6a46'), 2.2, [0, -20, 0]); part(BAGM, new THREE.TorusGeometry(10, 1.8, 6, 14, Math.PI), M('#3b2c22'), 0, [0, -2, 0]);
ACT.M.o.hand(-1).add(BAGM); BAGM.position.set(2, -14, 8); BAGM.visible = false;
const siddur = PR.makeSefer('#2b4d8c', 70, 50, 12); ACT.OB.o.hand(-1).add(siddur); siddur.position.set(0, -26, 12); siddur.rotation.set(0, 0, Math.PI / 2); siddur.visible = false;
const bookGlow2 = glow(HL, '#ffe9a0', 260, [200, 190, 1080], 0);
