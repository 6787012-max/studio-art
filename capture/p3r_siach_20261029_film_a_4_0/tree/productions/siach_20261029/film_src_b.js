
/* ------------------------------------------------------------------ WORLD HL: warm study hall (shtender scene + salt and honey table) */
const HL = new THREE.Group(); scene.add(HL);
const HALL_SET = PR.makeHall(); HL.add(HALL_SET);
const SHT = PR.makeShtender(); SHT.position.set(0, 0, 1250); HL.add(SHT);
{ const bk = PR.makeBook(true); bk.position.set(2, 8.5, 0); bk.scale.setScalar(0.8); SHT.userData.top.add(bk); }
const TBL = PR.makeTable(760, 160, 118); TBL.position.set(0, 0, 1060); HL.add(TBL);
const SALT = new THREE.Group(); SALT.position.set(-170, 118, 1055); HL.add(SALT);
const HONEY = new THREE.Group(); HONEY.position.set(170, 118, 1100); HL.add(HONEY);
const saltGl = [];
{
  const rnd = mulb(7), mS = M('#fbfdff', '#c4d2ec', 0);
  part(SALT, ell(86, 22, 62, 18, 10), M('#eef3fb', '#c4d2ec', 0), 2, [0, 6, 0]);
  for (let i = 0; i < 46; i++) { const r = Math.sqrt(rnd()) * 70, a = rnd() * 6.283, hh = 8 + 56 * (1 - r / 80) * (0.6 + rnd() * 0.5), s = 9 + rnd() * 10;
    const c = part(SALT, new THREE.BoxGeometry(s, s * (1.1 + rnd()), s * 0.9), mS, 1.4, [Math.cos(a) * r, hh * 0.8, Math.sin(a) * r * 0.7], [rnd(), rnd() * 3, rnd()]); }
  for (let i = 0; i < 5; i++) saltGl.push(glow(SALT, '#ffffff', 60 + i * 10, [(i - 2) * 26, 40 + (i % 3) * 14, ((i * 7) % 5 - 2) * 14], 0.0));
  // honey jar (clay)
  const jar = () => { const g = new THREE.Group(); part(g, lathe([[0.1, 0], [30, 0], [42, 20], [47, 54], [40, 82], [31, 94], [35, 101], [27, 104], [0.1, 104]], 28), M('#c9824a', '#8f5a3a'), 2.4);
    part(g, ell(30, 5, 30, 16, 6), bas('#ffbf2e'), 0, [0, 97, 0]); g.userData.gl = glow(g, '#ffb52e', 280, [0, 100, 0], 0.55); return g; };
  HONEY.add(jar()); HONEY.userData.jar = HONEY.children[0];
  part(HONEY, ell(7, 10, 7, 10, 8), bas('#ffd04a'), 0, [26, 90, 22]); HONEY.userData.drop = HONEY.children[HONEY.children.length - 1];
  ACT.BO.heldJar = jar(); ACT.BO.o.hand(1).add(ACT.BO.heldJar); ACT.BO.heldJar.position.set(0, -42, 14); ACT.BO.heldJar.scale.setScalar(0.62); ACT.BO.heldJar.visible = false;
}

/* ------------------------------------------------------------------ WORLD HS: grey rainy morning, stone house */
const HS = new THREE.Group(); scene.add(HS);
const HSDOOR = new THREE.Group();
{
  part(HS, new THREE.BoxGeometry(9000, 20, 6000).translate(0, -10, 1800), M('#8f929e', '#6f7280'), 0);
  for (const [x, z, rx, rz, c] of [[-300, 520, 110, 70, '#9fb0c6'], [820, 420, 150, 80, '#9fb0c6'], [-900, 900, 130, 90, '#a6b6ca']]) part(HS, ell(rx, 2.5, rz, 16, 4), bas(c), 0, [x, 2, z]);
  box(HS, 5600, 18, 520, M('#b9b3a6', '#8f8a82'), [0, 4, 330], 0, null, 0);
  // the house: front wall at z=0 with a door opening x -85..85, h 270
  const sM = M('#d2c3a6', '#a8967a'), sD = M('#bfae8e', '#9a8a70');
  box(HS, 560, 440, 420, sM, [-415 - 85 + 85, 220, -210], 3.2, null, 5);        // left block
  box(HS, 560, 440, 420, sM, [415 + 85 - 85, 220, -210], 3.2, null, 5);         // right block
  box(HS, 340, 170, 420, sM, [0, 355, -210], 3.2, null, 5);                       // above the door
  box(HS, 190, 270, 60, bas('#2a1d16'), [0, 135, -180], 0, null, 0);              // dark interior
  for (let i = 0; i < 4; i++) { const wx = [-640, -430, 430, 640][i]; box(HS, 90, 140, 10, M('#6f5a46'), [wx, 270, 4], 2, null, 2); box(HS, 70, 120, 8, bas(i % 2 ? '#7d8da0' : '#8d9db0'), [wx, 270, 8], 0, null, 2); }
  const rs = new THREE.Shape(); rs.moveTo(-250, 0); rs.lineTo(250, 0); rs.lineTo(0, 150); rs.lineTo(-250, 0);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: 1360, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-680, 440, -210); part(HS, rg, M('#8a5a4a', '#6a4a44'), 3);
  box(HS, 360, 26, 90, sD, [0, 13, 60], 2.4, null, 3);                            // step
  HSDOOR.position.set(-85, 0, 6); HS.add(HSDOOR); box(HSDOOR, 170, 270, 14, M('#8f5d33', '#6f4a3a'), [85, 135, 0], 2.6, null, 3); box(HSDOOR, 24, 24, 18, M('#e3b24c'), [150, 130, 10], 1.6, null, 8);
  house(HS, -1500, -150, 700, 360, 420, '#c9bda6', '#7a5a52', 0); house(HS, 1500, -150, 760, 380, 420, '#c3b7a0', '#7a5a52', 0);
  house(HS, -2700, -150, 700, 330, 420, '#cabfa8', '#7a5a52', 0); house(HS, 2800, -150, 700, 350, 420, '#c6baa2', '#7a5a52', 0);
  for (const x of [-1100, 1100]) tree(HS, x, 800, 1.5, 0, '#6a9a5a');
  hill(HS, 0, -3200, 4200, 1300, 1600, M('#8ea890', '#a6b4ac'), 14); hill(HS, -4500, -2600, 2600, 1000, 1300, M('#93ab95', '#a6b4ac'), 14);
}
const rainHS = PR.makeRain(1100, 5); scene.add(rainHS);
const rainHI = PR.makeRain(600, 9); scene.add(rainHI);

/* ------------------------------------------------------------------ WORLD HI: the hill path (s08, s09, s15) */
const HI = new THREE.Group(); scene.add(HI);
const HT = 520;                                     // height of the hilltop plateau
const zc = x => 160 * Math.sin(x / 420);
const gy = x => HT * sm((x + 500) / 2000) * (1 - sm((x - 2300) / 1500));
const gdy = x => (gy(x + 2) - gy(x - 2)) / 4;
const side = d => 240 * sm((Math.abs(d) - 280) / 900);
const terr = (x, z) => gy(x) + side(z - zc(x));
const OBST = [[210, 150, 'stone'], [540, -105, 'puddle'], [920, 155, 'log'], [1270, -150, 'stones']];
const obstGlow = [];
{
  const geo = new THREE.PlaneGeometry(7600, 3600, 150, 72).rotateX(-Math.PI / 2); const Pp = geo.attributes.position;
  for (let i = 0; i < Pp.count; i++) { const x = Pp.getX(i) + 1500, z = Pp.getZ(i); Pp.setXYZ(i, x, terr(x, z), z); }
  geo.computeVertexNormals(); part(HI, geo, M('#93d36a', '#c9dcb0'), 0);
  part(HI, new THREE.CylinderGeometry(26000, 26000, 20, 40).translate(1500, -40, 0), M('#8ccd66', '#c9dcb0'), 0);
  const pp = []; for (let x = -1800; x <= 2300; x += 40) pp.push([x, terr(x, zc(x)) + 2.6, zc(x)]);
  HI.add(ribbon(pp, 210, M('#ecc98c', '#c8a574'), 0));
  HI.userData.pp = pp;
  const mSt = M('#a9a6ad', '#7d7a88'), rnd = mulb(23);
  for (const [x, dz, kind] of OBST) {
    const z = zc(x) + dz, y = terr(x, z), g = new THREE.Group(); g.position.set(x, y, z); HI.add(g);
    if (kind === 'stone') { part(g, ell(92, 74, 80, 16, 10), mSt, 3.4, [0, 40, 0]); part(g, ell(48, 38, 44, 12, 8), mSt, 2.6, [88, 18, 30]); }
    else if (kind === 'puddle') { part(g, ell(170, 3, 105, 24, 4), bas('#7fb8e8'), 0, [0, 3, 0]); part(g, new THREE.TorusGeometry(1, 0.03, 6, 30).rotateX(Math.PI / 2).scale(160, 1, 96), bas('#dff1ff'), 0, [0, 5, 0]); }
    else if (kind === 'log') { part(g, new THREE.CylinderGeometry(34, 34, 260, 14).rotateX(Math.PI / 2), M('#8a5a3a', '#6a4a3a'), 3, [0, 34, 0]); part(g, new THREE.CylinderGeometry(24, 24, 6, 12).rotateX(Math.PI / 2), M('#d8b078'), 0, [0, 34, 131]); }
    else { part(g, ell(70, 56, 64, 14, 8), mSt, 3, [-40, 28, 0]); part(g, ell(60, 46, 56, 14, 8), mSt, 3, [50, 22, 22]); part(g, ell(44, 34, 42, 12, 8), mSt, 2.6, [4, 66, -20]); }
    const gl = glow(g, '#ffd23a', 520, [0, 60, 0], 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 40).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    ring.scale.set(150, 150, 150); ring.position.y = 10; g.add(ring); obstGlow.push({ gl, ring });
  }
  // gold overlay on the path behind him
  const gpath = ribbon(pp.map(p => [p[0], p[1] + 3, p[2]]), 150, new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 0);
  gpath.renderOrder = 20; HI.add(gpath); HI.userData.gpath = gpath;
  const rr = mulb(77);
  for (let i = 0; i < 26; i++) { const x = -1700 + i * 230 + rr() * 90, sd = rr() < 0.5 ? 1 : -1, z = zc(x) + sd * (480 + rr() * 900); tree(HI, x, z, 1.1 + rr() * 0.8, terr(x, z), rr() < 0.5 ? '#5fae4e' : '#79bd54'); }
  for (const [x, z, rx, ry, rz, c] of [[-2600, -2200, 2400, 900, 1200, '#86c862'], [-1200, 2200, 2400, 700, 1000, '#8fcf68'], [2600, -2300, 2600, 900, 1100, '#78bd58'], [3600, 2000, 2600, 800, 1000, '#9bd673'], [500, -3600, 3600, 1300, 1400, '#80c25c'], [-4200, 300, 2200, 800, 1000, '#9bd673']])
    hill(HI, x, z, rx, ry, rz, M(c, '#c8d6c0'), 12);
  HI.userData.farClouds = []; for (let i = 0; i < 6; i++) { const c = PR.makeCloudPuff('#ffffff', '#cfd6e2'); c.position.set(-3000 + i * 1500, 1700 + 150 * Math.sin(i * 2.1), -4800); c.scale.setScalar(4); HI.add(c); HI.userData.farClouds.push(c); }
  // the golden staircase (s15)
  const gs = new THREE.Group(); HI.add(gs); HI.userData.gold = gs; const X0 = 1560;
  const mT = new THREE.MeshBasicMaterial({ color: '#ffe68a', transparent: true, opacity: 0.92, depthWrite: false }), mR = new THREE.MeshBasicMaterial({ color: '#ffb84a', transparent: true, opacity: 0.9, depthWrite: false });
  const tg = [], rg2 = []; for (let k = 1; k <= 46; k++) { tg.push(new THREE.BoxGeometry(TREAD + 1, 8, 170).translate(X0 + (k - 0.5) * TREAD, HT + k * RISE - 4, zc(1500))); rg2.push(new THREE.BoxGeometry(5, RISE, 168).translate(X0 + (k - 1) * TREAD, HT + (k - 0.5) * RISE, zc(1500))); }
  const m1 = new THREE.Mesh(mergeGeometries(tg), mT), m2 = new THREE.Mesh(mergeGeometries(rg2), mR); gs.add(m1, m2);
  const ex = X0 + 46 * TREAD, ey = HT + 46 * RISE; HI.userData.goldTop = [ex, ey, zc(1500)];
  HI.userData.sun = [glow(HI, '#fff2b0', 2600, [ex + 500, ey + 380, zc(1500) - 200], 0.0), glow(HI, '#ffd96a', 6000, [ex + 800, ey + 500, zc(1500) - 300], 0.0)];
  HI.userData.stairGl = glow(HI, '#ffe08a', 1400, [X0 + 700, HT + 240, zc(1500)], 0.0);
}
const sparkHI = PR.makeSparkles(40, 12); HI.add(sparkHI);

/* ------------------------------------------------------------------ WORLD MS: mist meadow (s10, s11) */
const MS = new THREE.Group(); scene.add(MS); MS.userData.items = [];
const mistPuffs = [];
{
  const c = document.createElement('canvas'); c.width = 512; c.height = 64; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 512, 0);
  gr.addColorStop(0, '#7f8c90'); gr.addColorStop(0.28, '#93a09a'); gr.addColorStop(0.46, '#cfdc82'); gr.addColorStop(0.62, '#b8dc6a'); gr.addColorStop(1, '#a8dc66'); g.fillStyle = gr; g.fillRect(0, 0, 512, 64);
  const tex = new THREE.CanvasTexture(c); const gm = new THREE.Mesh(new THREE.PlaneGeometry(7000, 5200).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex })); gm.position.set(500, -1, 0); MS.add(gm);
  part(MS, new THREE.CylinderGeometry(26000, 26000, 20, 40).translate(500, -30, 0), M('#7f8c8e'), 0);
  const rnd = mulb(31);
  for (let i = 0; i < 16; i++) { const x = -3000 + i * 330 + rnd() * 100, z = -1500 - rnd() * 800, grey = x < 100; tree(MS, x, z, 1.4 + rnd() * 0.8, 0, grey ? '#7a8a86' : '#79bd54'); }
  for (let i = 0; i < 8; i++) { const x = -2400 + i * 400, z = 900 + rnd() * 400; tree(MS, x, z, 1.3 + rnd() * 0.5, 0, x < 100 ? '#7a8a86' : '#79bd54'); }
  for (let i = 0; i < 6; i++) tree(MS, 600 + i * 320, 900 + rnd() * 500, 1.3 + rnd() * 0.6, 0, '#6fc04c');
  for (const [x, z, rx, ry, rz, c2] of [[-2800, -3000, 3200, 1100, 1400, '#8e9aa2'], [-200, -3600, 3000, 1000, 1400, '#9aa6a8'], [2400, -3400, 3200, 1100, 1400, '#a4cf70'], [4200, -2400, 2600, 900, 1200, '#93c862']]) hill(MS, x, z, rx, ry, rz, M(c2, '#c8d6c0'), 12);
  for (let i = 0; i < 20; i++) { const p = PR.makeCloudPuff('#9aa2ac', '#8a92a0'); const grey = soft(MS, '#9aa2ac', 900 + (i % 5) * 220, [0, 0, 0], 0.5, true); mistPuffs.push({ s: grey, x: -3000 + i * 150 + (i * 37 % 100), y: 90 + (i * 53) % 380, z: -900 + (i * 211) % 1800, ph: i * 1.7 }); }
  MS.userData.sun = glow(MS, '#fff0b0', 3000, [1500, 700, -1200], 0.55);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(260, 1900), new THREE.MeshBasicMaterial({ color: '#fff2b8', transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    b.position.set(500 + i * 260, 800, -500 - i * 90); b.rotation.set(0, 0, 0.5); b.renderOrder = 20; MS.add(b); (MS.userData.rays = MS.userData.rays || []).push(b); }
}
const SACK = new THREE.Group(); scene.add(SACK);
part(SACK, ell(46, 58, 40, 18, 12), M('#4a403b', '#2f2926'), 3, [0, 0, 0]); part(SACK, ell(14, 18, 14, 10, 8), M('#4a403b', '#2f2926'), 2, [0, 62, 0]);
const BOOKG = new THREE.Group(); scene.add(BOOKG);
{
  for (const s of [-1, 1]) { const pg = new THREE.Group(); pg.rotation.z = -s * 0.07; BOOKG.add(pg);
    box(pg, 6, 96, 4, M('#7a4a2a'), [0, 0, 0], 1, null, 1); box(pg, 78, 6, 100, M('#7a4a2a'), [0, 0, 0], 1.6, null, 1); }
  BOOKG.children.length = 0;
  for (const s of [-1, 1]) { const pg = new THREE.Group(); pg.rotation.x = s * 0.1; BOOKG.add(pg); box(pg, 100, 8, 86, M('#7a4a2a'), [0, 0, s * 44], 1.6, null, 1); box(pg, 92, 10, 80, bas('#fffdf2'), [0, 7, s * 44], 0.8, null, 1); }
  BOOKG.userData.gl = glow(BOOKG, '#fff6c8', 520, [0, 40, 0], 0.8);
}

/* ------------------------------------------------------------------ WORLD DS: dusk desert road (s12, s13) */
const DS = new THREE.Group(); scene.add(DS);
const PILLAR = new THREE.Group(); DS.add(PILLAR);
const ORB = new THREE.Group(); scene.add(ORB);
const smoke = [];
{
  part(DS, new THREE.CylinderGeometry(26000, 26000, 20, 40).translate(0, -20, 0), M('#dba66a', '#a8744e'), 0);
  const rd = []; for (let z = -9000; z <= 3200; z += 60) rd.push([40 * Math.sin(z / 900), 2, z]); DS.add(ribbon(rd, 300, M('#c58f58', '#9a6a46'), 0));
  const rnd = mulb(55), dc = ['#e2b074', '#d99a5c', '#e8bd82', '#cf8f55'];
  for (let i = 0; i < 40; i++) { const z = -7800 + i * 330 + rnd() * 120, sd = i % 2 ? 1 : -1; hill(DS, sd * (700 + rnd() * 1800), z, 700 + rnd() * 700, 90 + rnd() * 200, 600 + rnd() * 500, M(dc[i % 4], '#a8744e'), 10); }
  for (const [x, z, rx, ry, rz, c] of [[-4200, -6000, 3000, 1500, 1500, '#9a6a8a'], [3600, -7000, 3400, 1800, 1500, '#8a6288'], [0, -9400, 6000, 1600, 1500, '#a07090']]) hill(DS, x, z, rx, ry, rz, M(c, '#7a5a78'), 12);
  // small rocks and dry shrubs along the road
  for (let i = 0; i < 26; i++) { const z = -1500 + i * 190 + rnd() * 60, sd = i % 2 ? 1 : -1, x = sd * (330 + rnd() * 500); part(DS, ell(40 + rnd() * 40, 24 + rnd() * 20, 34 + rnd() * 30, 12, 8), M('#b88a5a', '#8a5a3a'), 3, [x, 14, z]);
    if (i % 3 === 0) part(DS, ell(36, 26, 36, 10, 8), M('#8a8a4a', '#6a6a3a'), 3, [x * 1.4, 18, z + 60]); }
  // the far city: low boxes, orange glow, soft smoke (no detail)
  const cg = new THREE.Group(); cg.position.set(0, 0, -8300); DS.add(cg);
  for (let i = 0; i < 18; i++) { const w = 120 + (i * 53) % 160, h = 90 + (i * 91) % 220; box(cg, w, h, 120, M(i % 3 ? '#d98a50' : '#c2703f', '#7a4a38'), [-1000 + i * 118 + (i % 2) * 30, h / 2, -(i % 4) * 60], 3, null, 3); }
  glow(cg, '#ff8a34', 4200, [0, 220, 40], 0.85); glow(cg, '#ffb060', 2200, [0, 140, 60], 0.8);
  for (let i = 0; i < 7; i++) { const s = soft(cg, '#6a5048', 700 + (i % 3) * 160, [0, 0, 0], 0.4, true); smoke.push({ s, x: -500 + i * 170, y: 420 + i * 90, z: -150 - i * 40, ph: i * 1.3 }); }
  // a bright dawn ahead (for the walk toward the light)
  DS.userData.light = glow(DS, '#fff0c0', 5200, [0, 360, 7500], 0.0); DS.userData.light2 = glow(DS, '#ffd88a', 9000, [0, 420, 7500], 0.0);
  // the pillar of salt: rough white crystal column, no human shape
  const mS = M('#f7faff', '#bccae6', 0), rr = mulb(88);
  const stack = [[0, 0, 0, 150, 130, 140], [6, 120, -4, 130, 140, 124], [-8, 250, 6, 118, 130, 112], [10, 372, -4, 100, 120, 96], [-4, 480, 4, 80, 100, 78]];
  for (const [x, y, z, w, h, d] of stack) part(PILLAR, new THREE.BoxGeometry(w, h, d), mS, 3, [x, y + h / 2, z], [0.05 * (rr() - 0.5), rr() * 1.2, 0.07 * (rr() - 0.5)]);
  for (let i = 0; i < 26; i++) { const a = rr() * 6.283, yy = 40 + rr() * 480, rad = 52 + (1 - yy / 560) * 40; const cone = new THREE.ConeGeometry(14 + rr() * 14, 50 + rr() * 70, 5); const m = part(PILLAR, cone, mS, 1.8, [Math.cos(a) * rad, yy, Math.sin(a) * rad]);
    m.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1); }
  for (let i = 0; i < 5; i++) part(PILLAR, new THREE.ConeGeometry(18 + i * 4, 90 + i * 26, 5), mS, 2, [(i - 2) * 26, 570 + (i % 2) * 22, (i % 3 - 1) * 18], [(i % 3 - 1) * 0.2, i, (i - 2) * 0.12]);
  PILLAR.userData.gl = [glow(PILLAR, '#ffffff', 700, [0, 300, 0], 0.32), glow(PILLAR, '#e8f0ff', 1500, [0, 300, 0], 0.22)];
  PILLAR.userData.spark = PR.makeSparkles(44, 21); PILLAR.add(PILLAR.userData.spark);
  // the angel: only a glowing orb
  part(ORB, new THREE.SphereGeometry(26, 20, 14), bas('#fffbe8'), 0); ORB.userData.gl = [glow(ORB, '#fff2c0', 360, [0, 0, 0], 0.9), glow(ORB, '#ffd88a', 900, [0, 0, 0], 0.5)];
}
const vSpark = PR.makeSparkles(46, 99); scene.add(vSpark);
