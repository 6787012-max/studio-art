
/* ------------------------------------------------------------------ acting helpers */
const SEG = {};
const seg = (id, t0, t1, fn) => { (SEG[id] = SEG[id] || []).push([t0, t1, fn]); };
const mkpo = (t, o) => Object.assign({ t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 }, o || {});
const fa = (expr, t, seed, o) => faceOf(expr, t, seed, o);
const sgn = v => v < 0 ? -1 : 1;
const KFV = (t, keys) => { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = sm((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i].slice(1).map((v, k) => lerp(keys[i - 1][k + 1], v, u)); } return keys[keys.length - 1].slice(1); };
const PI = Math.PI;
const SIT = 48;
function addPropAt(id, group, t0, t1) { ACT[id] = { h: group, fn: t => (t >= t0 && t < t1 ? { x: 0, y: 0, z: 0 } : null), prop: true }; }
addPropAt('ROOTS', ROOTS, 115, 131.5);
addPropAt('POTBOX', TLONG, 212.6, 228.4);

/* ------------------------------------------------------------------ the farmer (s01, s02, s09, s10, s15) */
const FZ = -125;                                      // furrow line
const RM = mkRoute(chain(2.5, 85, [[-1300, FZ, 0, { yaw: 0 }], [100, FZ, 0], [200, -450, 0, { wait: 3.0, yaw: PI / 2 }], [1400, -450, 0]]));
seg('M', 0, 35, t => {
  const r = RM.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.M.cycle) });
  const st = { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po, r };
  po.arms = { l: { sz: 0.3, el: 1.15, curl: 0.8 } };
  if (t > 3.2 && t < 19.4) {                         // scattering seeds: the right arm swings out and forward every 0.45 s
    const p = ((t - 3.2) / 0.45) % 1, th = Math.sin(PI * Math.min(1, p * 1.5));
    po.arms.r = { sz: 0.25 + 1.2 * th, sx: 0.2 + 0.5 * th, el: 0.45, curl: 0.15 };
    po.lean = 3;
  } else if (t >= 22.6 && t < 26.4) {                // turns the valve
    const k = rise(t, 22.7, 23.4) * (1 - rise(t, 25.6, 26.4));
    po.arms.r = { sz: 1.5 * k + 0.1, sx: 0.1, el: 0.6, curl: 0.9 }; po.arms.l = { sz: 1.3 * k + 0.2, sx: 0.1, el: 0.6, curl: 0.9 };
    po.lean = 8 * k; po.headTilt = 8 * k;
  }
  po.face = fa(t > 22.5 && t < 26 ? 'proud' : 'smile', t, 61, { look: [0.4, 0.1] });
  return st;
});
seg('M', 131.5, 166.8, t => {
  const po = mkpo(t), a = rise(t, 132.5, 134.0) * (1 - rise(t, 146.5, 148.5)), b = rise(t, 150.0, 152.5);
  po.arms = { l: { sz: lerp(0.06, 0.2, a), el: 0.5, sx: 0.1 }, r: { sz: lerp(0.06, 2.3, a), el: lerp(0.36, 2.0, a), sx: 0.35 * a, curl: 0.8 } };
  if (b > 0) { po.arms = { l: { sz: lerp(0.5, 1.15, b), sx: lerp(0.1, 1.0, b), el: lerp(0.5, 0.3, b), tw: 0.9 * b, curl: 0.2 }, r: { sz: lerp(2.3, 1.15, b), sx: lerp(0.35, 1.0, b), el: lerp(2.0, 0.3, b), tw: 0.9 * b, curl: 0.2 } }; }
  po.headRot = -30 * Math.max(a, b) * 0.9; po.lean = -2 * b;
  po.face = fa(t < 134 ? 'smile' : (t < 146 ? 'thinking' : (t < 150 ? 'surprised' : 'laugh')), t, 62, { look: [0, -0.8] });
  return { x: -300, y: 0, z: 760, yaw: -PI / 2, slope: 0, po };
});
const RW = mkRoute(chain(228.4, 70, [[-700, FZ - 25, 0, { yaw: 0 }], [900, FZ - 25, 0]]));
seg('M', 228.4, 246.6, t => {
  const r = RW.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.M.cycle) });
  po.arms = { l: { sz: 0.1 }, r: { sz: 0.1 } };
  po.face = fa('smile', t, 63, { look: [0.4, 0] });
  return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po, r };
});

/* ------------------------------------------------------------------ the hero bochur BO */
const ROWZ = [1080, 820, 1340, 560, 1600];
function reading(t, z, seed, face) {
  const po = mkpo(t), k = Math.sin(t * 0.9 + seed);
  po.arms = { l: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 }, r: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 } };
  po.headTilt = 12 + 3 * k; po.lean = 4 + 1.3 * Math.sin(t * 1.3 + seed); po.headYaw = 0.1 * Math.sin(t * 0.5 + seed);
  po.face = face || fa('smile', t, seed, { look: [0, 0.4] });
  return { x: 312, y: 0, z, yaw: PI, slope: 0, po };
}
seg('BO', 35, 52, t => {
  const st = reading(t, ROWZ[0], 91, fa(t < 39.6 ? 'smile' : 'proud', t, 91, { look: [0.1, 0.5] }));
  const up = pulse(t, 38.2, 39.5, 40.5, 41.8); st.po.headRot = -14 * up; st.po.lean += 3 * up; return st;
});
const RDOOR = mkRoute(chain(52.4, 190, [[1640, 1080, 0, { yaw: PI }], [650, 1080, 0]]));
seg('BO', 52, 58.5, t => {
  const r = RDOOR.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.BO.cycle) });
  po.arms = { l: { sz: 1.15, el: 1.7, sx: 0.0, curl: 0.9 }, r: { sz: 0.1 } };
  po.lean = 5 * r.walk; const tired = rise(t, 57.0, 57.6);
  po.face = fa(tired > 0.5 ? 'smile' : 'worried', t, 92, { look: [0.2, 0.1] }); if (tired > 0.5) po.headRot = -3;
  return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po, r };
});
seg('BO', 58.5, 64.5, t => {
  const po = mkpo(t), u = Math.sin(t * 1.1);
  po.bob = SIT; po.lean = 12 + 2 * u; po.headTilt = 16 + 2 * u;
  po.arms = { l: { sz: 1.05, el: 0.9, curl: 0.7 }, r: { sz: lerp(1.0, 1.35, rise(t, 60, 61)) , el: 0.9, curl: 0.6 } };
  po.face = fa('thinking', t, 93, { look: [0.1, 0.7] });
  return { x: -150, y: 0, z: 1080, yaw: PI, slope: 0, po };
});
seg('BO', 64.5, 70, t => {
  const po = mkpo(t), sw = Math.sin((t - 64.5) * 2.3);
  po.arms = { l: { sz: 0.7, el: 1.5, sx: 0.0, curl: 0.9 }, r: { sz: 0.7, el: 1.5, sx: 0.0, curl: 0.9 } };
  po.lean = 6 * sw + 3; po.headTilt = 8; po.face = fa('smile', t, 94, { blink: true });
  return { x: -90, y: 0, z: 260, yaw: -2.4, slope: 0, po };
});
seg('BO', 70, 85.8, t => {
  const po = mkpo(t), pour = pulse(t, 71.0, 72.2, 82.0, 83.2), turn = sm((t - 82.3) / 1.8);
  const bend = rise(t, 79.5, 81.0);
  po.arms = { r: { sz: lerp(0.3, 1.9, pour), sx: 0.1, el: lerp(0.5, 0.45, pour), tw: 0.5, curl: 0.9 }, l: { sz: lerp(0.1, 0.5, pour), sx: 0.4, el: 0.7, curl: 0.5 } };
  po.lean = 8 * pour; po.headTilt = 14 * pour * (1 - turn);
  po.face = fa(t < 82.5 ? 'smile' : 'proud', t, 95, { look: [0, 0.5 * (1 - turn)] });
  if (turn > 0.3) po.arms = { r: { sz: lerp(1.9, 0.2, turn), el: 0.5 }, l: { sz: 0.4, sx: lerp(0.4, 0.2, turn), el: 0.7 } };
  return { x: -150, y: 0, z: 185, yaw: lerp(PI / 2, -PI / 2, turn), slope: 0, po };
});
seg('BO', 85.8, 100, t => {
  const po = mkpo(t), ph = ((t - 85.8) / 2.3) % 1, pour = Math.sin(PI * Math.min(1, ph * 1.7));
  po.bob = 62; po.lean = 22 + 4 * pour; po.headTilt = 18;
  po.arms = { r: { sz: 1.15 + 0.5 * pour, sx: 0.15, el: 0.6, tw: 0.6 * pour, curl: 0.9 }, l: { sz: 0.9, sx: 0.5, el: 0.8, curl: 0.5 } };
  const puzzled = rise(t, 93, 95);
  po.headYaw = 0.25 * Math.sin(t * 1.6) * puzzled; po.headRot = 6 * puzzled * Math.sin(t * 1.6);
  po.face = fa(puzzled > 0.4 ? 'worried' : 'thinking', t, 96, { look: [0.6, 0.6] });
  return { x: -390, y: 0, z: 0, yaw: 0, slope: 0, po };
});
seg('BO', 100, 115, t => {
  const po = mkpo(t), up = rise(t, 101.0, 103.0), fall = pulse(t, 103.4, 104.4, 106.0, 107.0), k = rise(t, 103.6, 106.4);
  po.bob = 62 * (1 - up); po.lean = lerp(22, -10, up) - 14 * fall; po.headRot = -34 * rise(t, 104.2, 105.4) * (1 - rise(t, 113, 114.6));
  po.arms = { r: { sz: lerp(1.15, 2.0, k), sx: lerp(0.15, 0.7, k), el: lerp(0.6, 0.6, k), curl: 0.3 }, l: { sz: lerp(0.9, 1.9, k), sx: lerp(0.5, 0.7, k), el: 0.6, curl: 0.3 } };
  if (t > 106.8) { const s = 0.3 * Math.sin(t * 2); po.arms.r.sz += s; po.arms.l.sz -= s; }
  po.face = fa(t < 103.4 ? 'worried' : 'surprised', t, 97, { look: [0.3, -0.9] });
  const back = sm((t - 103.4) / 3.4);
  return { x: lerp(-390, -480, back), y: 0, z: lerp(0, 60, back), yaw: lerp(0, 0.35, back), slope: 0, po };
});
const TX = i => -750 + i * 300;
seg('BO', 212.6, 228.4, t => {
  const po = mkpo(t), k = Math.sin(t * 1.0);
  po.arms = { l: { sz: 1.15, el: 0.7, sx: 0.1, curl: 0.5 }, r: { sz: 1.15, el: 0.7, sx: 0.1, curl: 0.5 } };
  po.headTilt = 10 + 4 * k; po.lean = 4; po.face = fa('smile', t, 98, { look: [0, 0.6] });
  return { x: TX(2), y: 0, z: 1540, yaw: PI / 2, slope: 0, po };
});
const RB2 = mkRoute(chain(228.4, 70, [[-700, FZ + 25, 0, { yaw: 0 }], [900, FZ + 25, 0]]));
seg('BO', 228.4, 246.6, t => {
  const r = RB2.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.BO.cycle) });
  po.arms = { l: { sz: 0.1 }, r: { sz: 0.1 } }; po.face = fa('smile', t, 99, { look: [0.4, 0] });
  return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po, r };
});

/* ------------------------------------------------------------------ the row of bochurim */
[1, 2, 3, 4].forEach(i => seg('C' + i, 35, 52, t => reading(t, ROWZ[i], 100 + i, fa(t < 40 + i * 0.6 ? 'smile' : 'proud', t, 100 + i, { look: [0, 0.4] }))));
const CPERM = [0, 1, 3, 4, 5];       // table slots for C1..C5
[1, 2, 3, 4, 5].forEach(i => seg('C' + i, 212.6, 228.4, t => {
  const po = mkpo(t), k = Math.sin(t * 0.8 + i);
  po.arms = { l: { sz: 1.1, el: 0.8, sx: 0.1, curl: 0.5 }, r: { sz: 1.1 + 0.2 * Math.max(0, k), el: 0.8, sx: 0.1, curl: 0.5 } };
  po.headTilt = 9 + 3 * k; po.lean = 3; po.face = fa(i === 4 ? 'worried' : 'smile', t, 110 + i, { look: [0, 0.5] });
  return { x: TX(CPERM[i - 1]), y: 0, z: 1540, yaw: PI / 2, slope: 0, po };
}));

/* ------------------------------------------------------------------ rabbi and the older bochur */
seg('RA', 166.8, 182, t => {
  const po = mkpo(t), a = pulse(t, 168, 169, 172, 173) + pulse(t, 175, 176, 178, 179);
  po.bob = SIT; po.lean = 4; po.headTilt = 4;
  po.arms = { l: { sz: lerp(1.0, 1.35, a), sx: lerp(0.1, 0.9, a), el: lerp(0.9, 0.7, a), tw: 1.0 * a, curl: 0.2 }, r: { sz: lerp(1.0, 1.35, a), sx: lerp(0.1, 0.9, a), el: lerp(0.9, 0.7, a), tw: 1.0 * a, curl: 0.2 } };
  po.face = fa(a > 0.3 ? 'explaining' : 'smile', t, 120, { look: [0.4, 0.1] });
  return { x: -150, y: 0, z: 1190, yaw: PI, slope: 0, po };
});
seg('OB', 166.8, 182, t => {
  const po = mkpo(t), shy = rise(t, 175.0, 177.0);
  po.bob = SIT; po.lean = 6; po.headTilt = lerp(10, 18, shy); po.headYaw = 0.25 * (1 - shy);
  po.arms = { l: { sz: 1.0, el: 0.9, curl: 0.6 }, r: { sz: 1.0, el: 0.9, curl: 0.6 } };
  po.face = fa(shy > 0.5 ? 'smile' : 'thinking', t, 121, { look: [-0.4, 0.4] });
  return { x: -150, y: 0, z: 1400, yaw: PI, slope: 0, po };
});
seg('OB', 182, 199, t => {
  const po = mkpo(t), sw = Math.sin((t - 182) * 1.7);
  po.arms = { l: { sz: 0.85, el: 1.1, curl: 0.8 }, r: { sz: 0.85, el: 1.1, curl: 0.8 } };
  po.lean = 3 + 4 * sw; po.headTilt = 10; po.face = fa('smile', t, 122, { blink: true });
  return { x: 312, y: 0, z: 1080, yaw: PI, slope: 0, po };
});
seg('OB', 199, 212.6, t => {
  const po = mkpo(t), look = rise(t, 202.4, 204.4), nod = Math.sin((t - 207) * 3.4) * rise(t, 206.4, 207.4) * (1 - rise(t, 211, 212.4));
  po.arms = { l: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 }, r: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 } };
  po.lean = 4 + 4 * look; po.headTilt = lerp(8, 16, look) + 6 * nod; po.headRot = -10 * rise(t, 199.4, 201.2) * (1 - look);
  po.face = fa(t < 203.8 ? 'thinking' : (t < 206 ? 'surprised' : 'laugh'), t, 123, { look: [0, 0.5] });
  return { x: 312, y: 0, z: 1080, yaw: PI, slope: 0, po };
});

// dispatcher
for (const id in ACT) { const L = SEG[id]; if (!L) continue; const A = ACT[id]; A.fn = t => { for (const s of L) if (t >= s[0] && t < s[1]) return s[2](t); return null; }; }

/* ------------------------------------------------------------------ shots and cameras */
const mfx = t => { let x = 0, n = 0; for (const d of [-0.8, 0, 0.8]) { const f = ACT.M.fn(cl(t + d, 0, 34.9)); if (f) { x += f.x; n++; } } return n ? x / n : 200; };
const camS02 = t => { const cx = mfx(t); return { p: [cx - 650, 120, 420], l: [cx + 20, 150, -460], fov: 30 }; };
const camS01 = hermite([[0, [-900, 1700, 5200], [400, 300, -2200], 36], [8, [-1100, 700, 2600], [-760, 120, -200], 34], [18, [-250, 260, 1500], [40, 150, -125], 30]]);
const camS03 = hermite([[35, [-1250, 300, 1580], [312, 140, 900], 30], [52, [-760, 270, 1290], [312, 150, 1080], 30]]);
const camS04a = hermite([[52, [-600, 250, 1160], [1000, 170, 1080], 30], [58.5, [-480, 240, 1110], [650, 150, 1080], 30]]);
const camS04b = hermite([[58.5, [-1330, 260, 1340], [-160, 110, 1085], 30], [64.5, [-1230, 250, 1270], [-160, 110, 1085], 30]]);
const camS04c = hermite([[64.5, [-1080, 300, 1250], [-90, 170, 260], 30], [70, [-960, 290, 1150], [-90, 170, 260], 30]]);
const camS04 = t => t < 58.5 ? camS04a(t) : (t < 64.5 ? camS04b(t) : camS04c(t));
const camS05 = t => { const u = sm((t - 70) / 15.8), a = lerp(1.15, 0.05, u); const T = [-150, 165, 120]; return { p: [T[0] + 1300 * Math.sin(a), 300, T[2] + 1300 * Math.cos(a)], l: T, fov: 30 }; };
const camS06 = hermite([[85.8, [900, 260, 700], [-230, 120, 0], 30], [100, [760, 220, 520], [-250, 115, 0], 30]]);
const camS07 = hermite([[100, [900, 200, 760], [-200, 140, 40], 32], [106, [880, 420, 880], [-220, 260, 40], 32], [110.5, [620, 560, 1250], [-100, 450, 40], 36], [115, [660, 650, 1500], [-120, 430, 60], 42]]);
const camS08 = hermite([[115, [250, 40, 1700], [0, -150, 0], 30], [123, [150, -200, 1900], [0, -250, 0], 30], [131.5, [0, -470, 1900], [0, -480, 0], 30]]);
const camS09 = hermite([[131.5, [-150, 270, 1500], [-250, 215, 800], 30], [140, [-120, 420, 2900], [-260, 250, 500], 32], [149, [100, 700, 4200], [-100, 420, -1500], 36]]);
const camS10 = hermite([[149, [-250, 290, 1420], [-300, 215, 760], 30], [158, [150, 720, 2350], [-100, 200, 300], 34], [166.8, [700, 1500, 3500], [0, 150, 0], 40]]);
const camS11 = hermite([[166.8, [-1330, 290, 1340], [-150, 125, 1295], 30], [182, [-1180, 265, 1300], [-150, 125, 1295], 30]]);
const camS12 = hermite([[182, [-1100, 300, 1400], [312, 180, 1080], 30], [199, [-960, 285, 1290], [312, 170, 1080], 29]]);
const camS13 = t => { const u = sm((t - 199) / 13.6), th = lerp(0, 0.6, u), R = lerp(1350, 1180, u); return { p: [312 - R * Math.cos(th), 300, 1080 + R * Math.sin(th)], l: [312, 170, 1080], fov: 30 }; };
const camS14 = t => { const u = sm((t - 212.6) / 15.8), cx = lerp(-620, 620, u); return { p: [cx, 300, 250], l: [cx + 60, 175, 1540], fov: 32 }; };
const camS15 = hermite([[228.4, [1000, 250, FZ], [100, 170, FZ], 30], [242.5, [3200, 1300, FZ], [0, 150, FZ], 40], [246.5, [3260, 1330, FZ], [0, 150, FZ], 40]]);

const SHOTS = [
  { id: 's01', start: 0, end: 18, wide: true, loc: 'FM', hero: ['M'], cam: camS01 },
  { id: 's02', start: 18, end: 35, wide: true, loc: 'FM', hero: ['M'], cam: camS02 },
  { id: 's03', start: 35, end: 52, loc: 'HL', hero: ['BO'], cam: camS03 },
  { id: 's04', start: 52, end: 70, loc: 'HL', hero: ['BO'], cam: camS04 },
  { id: 's05', start: 70, end: 85.8, loc: 'HL', hero: ['BO'], cam: camS05 },
  { id: 's06', start: 85.8, end: 100, wide: true, loc: 'GD', hero: ['BO'], cam: camS06 },
  { id: 's07', start: 100, end: 115, wide: true, loc: 'GD', hero: ['BO'], cam: camS07 },
  { id: 's08', start: 115, end: 131.5, wide: true, loc: 'SL', hero: ['ROOTS'], cam: camS08 },
  { id: 's09', start: 131.5, end: 149, wide: true, loc: 'FM', hero: ['M'], cam: camS09 },
  { id: 's10', start: 149, end: 166.8, wide: true, loc: 'FM', hero: ['M'], cam: camS10 },
  { id: 's11', start: 166.8, end: 182, loc: 'HL', hero: ['RA', 'OB'], cam: camS11 },
  { id: 's12', start: 182, end: 199, loc: 'HL', hero: ['OB'], cam: camS12 },
  { id: 's13', start: 199, end: 212.6, loc: 'HL', hero: ['OB'], cam: camS13 },
  { id: 's14', start: 212.6, end: 228.4, wide: true, loc: 'HL', hero: ['BO', 'C1', 'C2', 'C3', 'C4', 'C5'], cam: camS14 },
  { id: 's15', start: 228.4, end: 246.5, wide: true, loc: 'FM', hero: ['M', 'BO'], cam: camS15 },
];
SHOTS.forEach((s, i) => { s.index = i; s.dur = s.end - s.start; s.t0 = s.start; });
const shotAt = t => SHOTS.find(s => t < s.end) || SHOTS[SHOTS.length - 1];
const SEAMS = [[35, '#e4f6ff'], [58.5, '#fff6dd'], [64.5, '#fff6dd'], [85.8, '#fff6dd'], [115, '#fff6dd'], [131.5, '#ffd98a'], [166.8, '#fff6dd'], [188.4, '#fff6dd'], [194, '#fff6dd'], [212.6, '#ffffff'], [228.4, '#fff1c8']];

/* ------------------------------------------------------------------ environment per frame */
const cc = h => new THREE.Color(h);
function skyFor(t, loc) {
  if (loc === 'FM') {
    if (t < 18) return { top: cc('#86b8ee'), bot: cc('#ffd8a0'), oc: cc('#ff9a50'), oa: 0.07 };
    if (t < 60) return { top: cc('#7cc0f0'), bot: cc('#fff0d0'), oc: cc('#ffb060'), oa: 0.04 };
    if (t < 149) { const e = rise(t, 131.5, 146); return { top: cc('#7cc0f0').lerp(cc('#8d9db6'), e), bot: cc('#fff0d0').lerp(cc('#d6dbe2'), e), oc: cc('#b0b8c8'), oa: 0.05 * e }; }
    if (t < 228) { const e = rise(t, 149, 154); return { top: cc('#8d9db6').lerp(cc('#86c0f0'), e), bot: cc('#d6dbe2').lerp(cc('#ffe2a8'), e), oc: cc('#ffc060'), oa: 0.08 * e }; }
    return { top: cc('#86bcee'), bot: cc('#ffd890'), oc: cc('#ffa040'), oa: 0.1 };
  }
  if (loc === 'GD') {
    if (t < 100) { const ph = (t - 85.8) / 14.2 * 3, day = 0.5 + 0.5 * Math.cos(2 * PI * ph); return { top: cc('#1a2a5a').lerp(cc('#79c0ea'), day), bot: cc('#6a5a8a').lerp(cc('#fdf3dc'), day), oc: cc('#10183c'), oa: 0.26 * (1 - day) }; }
    return { top: cc('#6ec2f4'), bot: cc('#fffbe6'), oc: cc('#ffb060'), oa: 0.03 };
  }
  if (loc === 'SL') return { top: cc('#8fd0f6'), bot: cc('#fff6dc'), oc: cc('#ffb060'), oa: 0.03 };
  // hall: sky behind the window
  if (t >= 70 && t < 85.8) { const u = (t - 70) / 15.8, m = 1 - Math.abs(2 * u - 1); return { top: cc('#a8c8e8').lerp(cc('#79c0ea'), m), bot: cc('#ffd0a0').lerp(cc('#fff3d8'), m), oc: cc('#ff9a50'), oa: 0.14 * (1 - m) + 0.02 }; }
  if (t >= 182 && t < 199) return { top: cc('#a9cdea'), bot: cc('#ffe6c0'), oc: cc('#ffb878'), oa: 0.08 };
  return { top: cc('#8fc4e8'), bot: cc('#fff0d0'), oc: cc('#ffa850'), oa: 0.07 };
}
const SUNDIR = t => KFV(t, [[0, -0.3, 0.055, -0.95], [18, -0.3, 0.14, -0.94], [60, -0.3, 0.3, -0.9], [149, -0.5, 0.4, -0.7], [166, -0.5, 0.35, -0.8], [228, -0.97, 0.05, -0.2], [246, -0.97, 0.05, -0.2]]);
function applyEnv(t) {
  const s = shotAt(t), loc = s.loc;
  FM.visible = loc === 'FM'; HL.visible = loc === 'HL'; GD.visible = loc === 'GD'; SL.visible = loc === 'SL';
  const sk = skyFor(t, loc);
  sky.material.uniforms.uTop.value.copy(sk.top); sky.material.uniforms.uBot.value.copy(sk.bot);
  ovMat.uniforms.uC.value.copy(sk.oc); ovMat.uniforms.uA.value = sk.oa;
  let va = 0, vc = '#fff6dd';
  for (const [tb, c] of SEAMS) { const a = 0.62 * (1 - Math.abs(t - tb) / 0.75); if (a > va) { va = a; vc = c; } }
  disMat.uniforms.uC.value.set(vc); disMat.uniforms.uA.value = Math.max(0, va);
  // sun (outdoors): a direction from the camera
  const sunOn = loc === 'FM' || loc === 'GD';
  SUN.visible = sunOn;
  if (sunOn) {
    let d = SUNDIR(t), op = 1, col = '#ffd27a';
    if (loc === 'GD') { const ph = (t - 85.8) / 14.2 * 3, day = t < 100 ? 0.5 + 0.5 * Math.cos(2 * PI * ph) : 1; d = [-0.55, 0.12 + 0.5 * day, -0.8]; col = day > 0.4 ? '#ffdc8a' : '#cfe0ff'; op = t < 100 ? 0.4 + 0.6 * day : 1; }
    else if (t >= 131.5 && t < 149) op = 1 - rise(t, 132, 144) * 0.9;
    else if (t >= 149 && t < 166.8) op = 0.35 + 0.65 * rise(t, 150, 156);
    const L = Math.hypot(d[0], d[1], d[2]);
    SUN.position.set(cam.position.x + d[0] / L * 12000, cam.position.y + d[1] / L * 12000, cam.position.z + d[2] / L * 12000);
    sunGl.material.color.set(col); sunGl.material.opacity = 0.7 * op; sunDisc.visible = op > 0.3; sunDisc.scale.setScalar(420);
  }
  const lerpHex = (a, b, k) => cc(a).lerp(cc(b), k);
  /* ---------------- farm */
  if (loc === 'FM') {
    const wet = rise(t, 21.5, 34) * (1 - rise(t, 34, 36)) + rise(t, 150, 158) * 0.9;
    furrowMat.uniforms.uColor.value.copy(lerpHex('#b57d46', '#6e4528', cl(wet, 0, 1)));
    // sprinklers
    const spOn = rise(t, 24.4, 26.0) * (1 - rise(t, 34.2, 35));
    VW.rotation.z = -7 * rise(t, 23.0, 25.4);
    SPR.forEach((S, k) => {
      const amt = cl(spOn * 1.4 - k * 0.04, 0, 1) * (t < 36 ? 1 : 0);
      S.arm.rotation.y = -(t * 2.4 + k); S.arm.position.x = Math.cos(t * 2.4 + k) * 14; S.arm.position.z = Math.sin(t * 2.4 + k) * 14;
      S.dr.forEach((m, j) => {
        m.visible = amt > 0.03;
        if (!m.visible) return;
        const ph = ((t * 1.15 + j / 12 + k * 0.13) % 1 + 1) % 1, a = 0.95 * Math.sin(t * 1.3 + k) + (j % 5 - 2) * 0.11, R = 70 + 360 * ph * (0.7 + 0.3 * ((j * 7) % 5) / 4);
        m.position.set(S.x + Math.sin(a) * R, 74 + 230 * 4 * ph * (1 - ph) * (0.8 + 0.2 * (j % 3)) , -520 + Math.cos(a) * R);
        m.scale.setScalar((3.6 + (j % 3)) * (0.5 + 0.5 * amt));
      });
    });
    // seeds thrown by the farmer
    SEEDS.forEach((m, k) => {
      const q = (t - 3.4) / 0.45, n = q < k ? -1 : k + 6 * Math.floor((q - k) / 6), ts = 3.4 + 0.45 * n, age = t - ts;
      m.visible = n >= 0 && ts < 19.2 && age >= 0 && age < 1.0;
      if (!m.visible) return;
      const r = RM.at(ts), u = age / 1.0;
      m.position.set(r.x + 30 + 200 * u, 150 + 130 * u - 280 * u * u, r.z + 45 + 25 * u);
    });
    BAGM.visible = t < 35 && ACT.M.h.visible;
    // plants
    PLANTS.forEach(P => {
      const g = sm((t - (152 + P.d * 6)) / 7), sc = g * (1 + 0.45 * rise(t, 166.8, 228.4)) * (0.85 + 0.3 * hash(P.k * 3 + P.d * 9));
      P.g.visible = sc > 0.02; P.g.scale.setScalar(Math.max(0.001, sc));
    });
    // clouds gather
    const G = rise(t, 131, 146), Gd = rise(t, 131.5, 144) * (1 - rise(t, 152, 166)), afterCl = t > 150 ? 0.55 : 1;
    cloudM.uniforms.uColor.value.copy(lerpHex('#ffffff', '#8e9bb2', Gd));
    CLD.forEach(C => { const sc = (0.42 + 0.7 * G) * afterCl * (t > 228 ? 0.8 : 1); C.g.scale.setScalar(sc); C.g.position.set(C.x * lerp(1, 0.55, G) + 60 * Math.sin(t * 0.05 + C.d * 6), C.y, C.z); C.g.visible = !(t >= 149 && t < 228 && C.d > 0.55) && !(t < 18 && Math.abs(C.x) < 1300); });
    // gauge fills
    GAUGE.visible = t >= 131 && t < 166.8;
    const lev = 112 * cl((t - 132) / 28, 0, 1); gaugeW.scale.y = Math.max(0.001, lev); gaugeW.visible = lev > 0.5;
    // rain
    let ramt = rise(t, 143, 149) * 0.25 + rise(t, 149, 152.5) * 0.75; if (t >= 160 && t < 228) ramt = 0.75 * (1 - rise(t, 163, 166.5)); if (t >= 228) ramt = 0.38;
    if (t < 131) ramt = 0;
    const wx = t >= 228 ? RW.at(t).x : -300;
    rainFM.userData.update(t, { x: wx, y: -50, z: t >= 228 ? FZ : 700 }, ramt, 0.14, { w: t >= 228 ? 1600 : 2200, h: 1800, d: t >= 228 ? 800 : 1500 });
  } else rainFM.visible = false;
  /* ---------------- garden + bamboo */
  if (loc === 'GD') {
    BAMB.forEach(B => {
      const u = cl((t - (100.8 + B.d)) / 8.4, 0, 1); let gg = u <= 0 ? 0 : Math.pow(u, 2.2); if (t > 100.5) gg = Math.max(gg, 0.03 * rise(t, 100.5, 101.2) * B.hs);
      B.g.visible = gg > 0.004;
      const L = 60 * B.hs * gg, unf = rise(t, 108.2 + B.d, 112.4 + B.d);
      for (let k = 0; k < B.segs.length; k++) {
        const h0 = k * L, h1 = (k + 1) * L, x0 = B.bend * h0 * h0 / 800, x1 = B.bend * h1 * h1 / 800, S = B.segs[k];
        S.c.position.set(x0, h0, 0); S.c.scale.set(1, Math.max(0.001, Math.hypot(h1 - h0, x1 - x0)), 1); S.c.rotation.z = -Math.atan2(x1 - x0, h1 - h0);
        S.r.position.set(x1, h1, 0);
      }
      B.leaves.forEach(Lf => { const h = (Lf.k + 1) * L, x = B.bend * h * h / 800; Lf.l.position.set(x + Lf.s * 18 * unf, h, 0); Lf.l.rotation.z = Lf.s * (1.25 - 0.55 * unf); Lf.l.scale.setScalar(Math.max(0.001, unf * (0.7 + 0.3 * gg))); Lf.l.visible = unf > 0.02; });
    });
  }
  /* ---------------- cut-away */
  if (loc === 'SL') {
    SLB.position.y = -260 * (1 - sm((t - 115) / 2.4)); SLB.position.x = 0;
    const G = (ROOTTOTAL + 60) * sm((t - 116.0) / 13.5);
    ROOTSEG.forEach(R => { const f = cl((G - R.off) / R.len, 0, 1); R.m.scale.y = Math.max(0.001, R.len * f); R.m.visible = f > 0.002; });
    rootTipGl.position.y = -26 - Math.min(G, 780) * 0.97; rootTipGl.material.opacity = 0.8 * (1 - rise(t, 129, 131));
    rootGlowAll.material.opacity = 0.35 * rise(t, 119, 128);
  }
  /* ---------------- hall */
  if (loc === 'HL') {
    HL.userData.hh.rotation.z = 0.17 * (1 - rise(t, 52.4, 55.4)); HL.userData.mh.rotation.z = 1.0 * (1 - rise(t, 52.4, 55.4));
    const s14 = t >= 212.6 && t < 228.4;
    const shOn = t < 52 || (t >= 182 && t < 212.6);
    SHT.forEach((S, i) => { S.s.visible = shOn; });
    T1.visible = (t >= 58.5 && t < 64.5) || (t >= 166.8 && t < 182); TBOOK.visible = T1.visible;
    TLONG.visible = s14;
    SHT[0].bk.visible = !(t >= 182 && t < 202.8);
    SHT[0].bk.scale.setScalar(t >= 202.8 ? 0.8 * (0.35 + 0.65 * sm((t - 202.8) / 1.0)) : 0.8);
    // pots on the sill
    const BASEH = [16, 34, 0, 22, 8, 40, 28];
    SPOT.forEach((p, i) => {
      if (i === 2) {
        p.visible = t >= 66;
        const sh = 74 * sm((t - 73) / 11.5), gl = (rise(t, 66, 67.5) * 0.9) * (1 - rise(t, 75, 79));
        p.userData.set(t >= 70 ? sh : 0, gl + (t < 70 ? 0 : 0));
      } else p.userData.set(BASEH[i] * (1 + 0.8 * sm((t - 72) / 14)), 0);
    });
    // pot carried by the hero (a), the pot on the study table (b)
    POTH.visible = t >= 52 && t < 58.5; POTH.userData.set(0, 0.9);
    POTT.visible = t >= 58.5 && t < 64.5; POTT.userData.set(0, rise(t, 59.5, 61) * 0.9);
    // watering can
    // long table pots
    TP.forEach((p, i) => {
      p.visible = s14; p.position.set(TX(i), 118, 1372);
      const H = [64, 22, 90, 38, 0, 52][i], h = H * (0.58 + 0.42 * rise(t, 213, 227));
      p.userData.set(h, H === 0 ? 0.8 : 0);
    });
    // light: sun seen through the window + a slanted light shaft
    let sx = 0, sy = 520, lo = 0.0, lc = '#fff0b0';
    if (t >= 70 && t < 85.8) { const u = (t - 70) / 15.8; sx = lerp(-720, 720, u); sy = 340 + 420 * Math.sin(PI * u); lo = 0.15 + 0.06 * Math.sin(PI * u); }
    else if (t >= 182 && t < 199) { const d = t < 188.4 ? 0 : (t < 194 ? 1 : 2); sx = [-380, 0, 360][d]; sy = [420, 640, 480][d]; lo = [0.14, 0.2, 0.13][d]; lc = ['#ffd9a0', '#fff4cc', '#ffe3a8'][d]; }
    else if (t >= 35 && t < 70) { sx = -200; sy = 560; lo = 0.1; }
    else if (t >= 199 && t < 228.4) { sx = 200; sy = 600; lo = 0.1; }
    else if (t >= 166.8 && t < 182) { sx = 100; sy = 600; lo = 0.1; }
    sunWin.position.set(sx, sy, -520); sunWin.material.opacity = 0.9; sunWin.material.color.set(lc);
    shaft.material.color.set(lc); shaft.material.opacity = lo;
    const P = new Float32Array([sx - 330, 760, 6, sx + 330, 760, 6, sx * -0.9 + 380, 4, 1300, sx * -0.9 - 380, 4, 1300]);
    shaft.geometry.setAttribute('position', new THREE.BufferAttribute(P, 3)); shaft.geometry.setIndex([0, 1, 2, 0, 2, 3]); shaft.geometry.computeBoundingSphere();
    floorPatch.material.opacity = 0;
    // golden motes settling into the chests (s03)
    const rowZ = ROWZ;
    MOTES.forEach((m, n) => {
      const bi = n % 5, j = Math.floor(n / 5), tl = 36.0 + bi * 1.25 + j * 1.6, u = (t - tl) / 3.0;
      const on = t >= 35 && t < 52 && u >= 0 && u < 1; m.visible = on; if (!on) return;
      const e = u * u * (3 - 2 * u);
      m.position.set(312 - 40 * (1 - e) + 14 * Math.sin(u * 7 + j), lerp(760, 205, e), rowZ[bi] + 12 * Math.cos(u * 5 + bi));
      m.material.opacity = Math.sin(PI * Math.min(1, u * 1.1)) * 0.95; m.scale.setScalar(46 * (1 - 0.5 * u) + 16 * Math.sin(u * 9));
    });
    // beam from above + glowing page (s13)
    beam.position.set(300, 650, 1080); beam.material.opacity = 0.11 * rise(t, 199.4, 202.0) * (1 - rise(t, 211.0, 212.6)); beam.visible = beam.material.opacity > 0.005;
    bookGlow2.position.set(236, 196, 1080); bookGlow2.material.opacity = 0.75 * rise(t, 203.4, 206.6) * (1 - rise(t, 211, 212.6)); bookGlow2.visible = bookGlow2.material.opacity > 0.01;
  }
  POTH.visible = POTH.visible && loc === 'HL';
}
function applyActors(t) {
  for (const id in ACT) {
    const A = ACT[id], st = A.fn(t);
    if (!st) { A.h.visible = false; continue; }
    A.h.visible = true;
    if (A.prop) continue;
    A.h.position.set(st.x, st.y, st.z); A.h.rotation.set(0, st.yaw, st.slope); A.h.scale.setScalar(st.scale || 1);
    A.o.set(st.po);
  }
  siddur.visible = t >= 182 && t < 202.8;
  CAN.g.visible = (t >= 70.2 && t < 85.2) || (t >= 85.8 && t < 99.6);
  CAN.g.rotation.z = PI / 2 - 0.2 - 0.9 * (t < 85.8 ? pulse(t, 71.0, 72.2, 82.0, 83.2) : pulse(t, 86.5, 87.3, 98.5, 99.4));
  // water drops from the can (after the pose, so they are a pure function of t)
  const loc = shotAt(t).loc, tipW = new THREE.Vector3();
  const inHall = loc === 'HL' && t < 85.8, inGar = loc === 'GD' && t < 100;
  if (inHall || inGar) { CAN.tip.updateWorldMatrix(true, false); CAN.tip.getWorldPosition(tipW); }
  const ph0 = ((t - 85.8) / 2.3) % 1, pourG = inGar ? Math.sin(PI * Math.min(1, ph0 * 1.7)) : 0;
  const pourH = inHall ? pulse(t, 71.0, 72.2, 82.0, 83.2) : 0;
  dropsC.forEach((m, i) => {
    const on = (inHall && pourH > 0.6 && CAN.g.visible) || (inGar && pourG > 0.5 && t < 99.8); m.visible = on; if (!on) return;
    const ph = ((t * 1.6 + i / 10) % 1 + 1) % 1; m.position.set(tipW.x, lerp(tipW.y, inGar ? 34 : 240, ph), tipW.z); m.scale.setScalar(3.4);
  });
}
