
/* ------------------------------------------------------------------ acting helpers */
const SEG = {};
const seg = (id, t0, t1, fn) => { (SEG[id] = SEG[id] || []).push([t0, t1, fn]); };
const mkpo = (t, o) => Object.assign({ t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 }, o || {});
const fa = (expr, t, seed, o) => faceOf(expr, t, seed, o);
const afa = (expr, t, seed) => ({ expr, blink: blink(t, seed) });
const KFV = (t, keys) => { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = sm((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i].slice(1).map((v, k) => lerp(keys[i - 1][k + 1], v, u)); } return keys[keys.length - 1].slice(1); };
const PI = Math.PI;
const SIT = 48;
const swingR = (ph, w, s) => 0.06 - 0.62 * w * Math.cos(2 * PI * (ph + (s > 0 ? 0 : 0.5) - 0.08));
function addPropAt(id, group, t0, t1) { ACT[id] = { h: group, fn: t => (t >= t0 && t < t1 ? { x: 0, y: 0, z: 0 } : null), prop: true }; }
addPropAt('SG', SG, 58, 72.17);
const SG_T = t => (t >= 58 && t < 72.17) || (t >= 122 && t < 132.26) || (t >= 167.52 && t < 191.73);
ACT.SG.fn = t => (SG_T(t) ? { x: 0, y: 0, z: 0 } : null);

/* ------------------------------------------------------------------ routes along the path */
function pathKeys(t0, t1, x0, x1, off) {
  const dir = x1 >= x0 ? 1 : -1, pts = [];
  for (let x = x0; dir > 0 ? x < x1 : x > x1; x += dir * 150) pts.push([x, pz(x) + off, py(x)]);
  pts.push([x1, pz(x1) + off, py(x1)]);
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
  const T = L[L.length - 1]; return pts.map((p, i) => [t0 + (t1 - t0) * L[i] / T, p[0], p[1], p[2]]);
}
const XS = 1225, XF = 1555, T_STOP = 45, T_GO = 66, T_END = 74.4;
const SR = mkRoute([].concat(pathKeys(0, T_STOP, -2600, XS, 55), [[T_GO, XS, pz(XS) + 55, py(XS), 0]], pathKeys(T_GO, T_END, XS, 1900, 55).slice(1)));
const TPX = XS + 20, TPZ = pz(TPX) - 55;
const lagF = t => 170 + 310 * sm((t - 31) / 13);
const fk = [], dk = []; for (let t = 0; t <= 45.001; t += 1.5) { const x = SR.at(Math.min(t, 45)).x - lagF(t), x2 = x - 380; fk.push([t, x, pz(x) - 60, py(x)]); dk.push([t, x2, pz(x2), py(x2)]); }
const XF45 = fk[fk.length - 1][1], XD45 = dk[dk.length - 1][1];
const FR = mkRoute([].concat(fk, [[54.5, XF45, pz(XF45) - 60, py(XF45), 0], [61.8, TPX, TPZ, py(TPX)], [T_GO, TPX, TPZ, py(TPX), -PI / 2]], pathKeys(T_GO, T_END, TPX, 1920, -55).slice(1)));
const DR = mkRoute([].concat(dk, [[58, XD45, pz(XD45), py(XD45), 0]], pathKeys(58, T_END + 2, XD45, 1100, 0).slice(1)));
const SR13 = mkRoute(pathKeys(167.52, 191.73, 3100, 1660, 50)), FR13 = mkRoute(pathKeys(167.52, 191.73, 3100, 1660, -50)), DR13 = mkRoute(pathKeys(167.52, 191.73, 3480, 2040, 0));
const walker = (route, cyc) => t => { const r = route.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, cyc) }); return { x: r.x, y: r.y, z: r.z, yaw: r.yaw, slope: r.slope * 0.8, po, r }; };

/* ------------------------------------------------------------------ the son (Yitzchak) */
const wS = walker(SR, ACT.S.cycle);
seg('S', 0, 72.17, t => {
  const st = wS(t), po = st.po, w = st.r.walk;
  po.lean = 4 * w;
  const g1 = pulse(t, 19.3, 20.8, 27.0, 28.6), g2 = KFV(t, [[45, 0], [46.5, 0.85], [49, 0.85], [50.8, -0.85], [53.8, -0.85], [55.4, 0.35], [57.4, 0], [58, 0]])[0];
  const rt = pulse(t, 47.0, 48.6, 55.0, 56.6);
  const sw = swingR(po.ph, w, 1);
  po.arms = { l: { sz: 0.7, el: 1.9, sx: 0.05, curl: 0.9 }, r: { sz: lerp(sw, 1.35, g1) + 1.1 * rt, sx: 0.45 * g1 + 0.9 * rt + 0.1, el: lerp(0.36 + 0.5 * w * Math.max(0, Math.sin(2 * PI * (po.ph - 0.33))), 0.7, g1 + rt), curl: 0.1 + 0.5 * (1 - g1 - rt), tw: -0.7 * (g1 + rt) } };
  po.headYaw = 0.75 * g1 + (t >= 45 && t < 58 ? g2 : 0) + 0.7 * rise(t, 59, 60.6) * (1 - rise(t, 65.4, 66.2));
  po.headTilt = 3 * g1 - 4 * rt;
  po.lean += 2 * rt;
  const ex = (t > 19 && t < 28.5) ? 'thinking' : (t > 46 && t < 57.5 ? 'surprised' : (t > 62 && t < 66 ? 'smile' : 'smile'));
  po.face = fa(ex, t, 31, { look: [0.3, 0.1] });
  return st;
});
seg('S', 72.17, 85, t => {                                                  // hands the stones and the logs to his father
  const C = STONE_DT, xx = (t - STONE_T0) / C, ph = xx < 0 ? 0 : xx - Math.floor(xx);
  const bend = t < STONE_T0 ? 0 : sm(ph / 0.4) * (1 - sm((ph - 0.4) / 0.25)), off = t < STONE_T0 ? 0 : sm((ph - 0.4) / 0.25) * (1 - sm((ph - 0.82) / 0.16));
  const po = mkpo(t), turn = t < STONE_T0 ? 1 : sm((ph - 0.3) / 0.4) * (1 - sm((ph - 0.82) / 0.16)) * 0.5 + 0.5 * (1 - 0);
  po.lean = 26 * bend + 2; po.headTilt = 18 * bend;
  po.arms = { l: { sz: lerp(0.6, 1.2, off) + 0.3 * bend, el: lerp(0.5, 0.6, off), sx: lerp(0.2, -0.25, off), curl: 0.6 }, r: { sz: lerp(0.6, 1.2, off) + 0.3 * bend, el: lerp(0.5, 0.6, off), sx: lerp(0.2, -0.25, off), curl: 0.6 } };
  po.face = fa('smile', t, 32, { look: [0.1, 0.1] });
  const yw = lerp(PI / 2, PI, sm((ph - 0.35) / 0.35) * (1 - sm((ph - 0.85) / 0.15)) );
  return { x: 360, y: 0, z: -150, yaw: t < STONE_T0 ? PI : yw, slope: 0, po };
});
seg('S', 85, 98, t => {                                                       // holds out his wrists to be tied
  const po = mkpo(t), hold = rise(t, 86.4, 88.0), nod = Math.sin((t - 96) * 3) * pulse(t, 95.6, 96.2, 97.2, 97.9);
  po.arms = { l: { sz: lerp(0.1, 0.62, hold), sx: lerp(0.1, -0.22, hold), el: lerp(0.36, 0.75, hold), curl: 0.4 }, r: { sz: lerp(0.1, 0.62, hold), sx: lerp(0.1, -0.22, hold), el: lerp(0.36, 0.75, hold), curl: 0.4 } };
  po.headRot = 3 * nod; po.headTilt = 3 * hold + 3 * nod; po.lean = 1;
  po.face = fa('smile', t, 33, { look: [0.0, 0.1] });
  return { x: 260, y: 0, z: 70, yaw: PI / 2, slope: 0, po };
});
// lying on the altar, then sitting up, standing, embracing
const HIPA = [0, 150, 0];
seg('S', 98, 167.52, t => {
  const po = mkpo(t);
  const up = sm((t - 152.4) / 2.6), stand = sm((t - 155.4) / 1.8);
  let th = lerp(PI / 2, 0.08, up), yaw = -PI / 2, x = 0, y, z;
  const H0y = lerp(150, 128, up), H0z = lerp(32, 10, up);
  y = H0y - 118 * Math.cos(th); z = H0z + 118 * Math.sin(th);
  if (t >= 155.4) { th = 0.08 * (1 - stand); x = lerp(0, 190, stand); y = lerp(10.4, 0, stand); z = lerp(19.4, 52, stand); yaw = lerp(-PI / 2, PI / 2, sm((t - 155.6) / 1.4)); }
  const emb = rise(t, 157.6, 159.4), bound = t < 147.4 ? 1 : 0, sitting = rise(t, 152.4, 154.6) * (1 - stand);
  po.bob = 14 * sitting;
  const aa = { sz: lerp(lerp(0.2, 0.55, bound), 1.5, emb), sx: lerp(lerp(0.05, -0.25, bound), -0.95, emb), el: lerp(lerp(0.4, 1.3, bound), 0.7, emb), curl: 0.4 };
  po.arms = { l: aa, r: aa };
  po.headTilt = 8 * emb * (1 - rise(t, 163, 164)) - 2; po.headYaw = 0.25 * emb;
  const ex = t < 147 ? 'smile' : (t < 157 ? 'surprised' : 'laugh');
  po.face = fa(ex, t, 34, { look: [0, t < 132.26 ? 0 : 0.15] });
  return { x, y, z, yaw, slope: th, po };
});

/* ------------------------------------------------------------------ the father (Avraham) */
const wF = walker(FR, ACT.F.cycle);
seg('F', 0, 72.17, t => {
  const st = wF(t), po = st.po, w = st.r.walk;
  po.lean = 2 * w;
  const hand = rise(t, 62.4, 63.4) * (1 - rise(t, 65.6, 66.4)), sky = rise(t, 64.0, 65.2) * (1 - rise(t, 66.0, 66.8));
  const sw = swingR(po.ph, w, 1);
  po.arms = { l: { sz: lerp(0.6, 2.5, sky), el: lerp(1.0, 0.35, sky), sx: lerp(0.05, 0.35, sky), curl: 0.8 }, r: { sz: lerp(sw, 1.25, hand), sx: lerp(0.1, 0.12, hand), el: lerp(0.36 + 0.5 * w * Math.max(0, Math.sin(2 * PI * (po.ph - 0.33))), 0.55, hand), curl: 0.5 } };
  po.headRot = -4 * rise(t, 46.8, 48) * (1 - rise(t, 56, 58)) - 20 * sky; po.headYaw = -0.45 * rise(t, 47.2, 48.5) * (1 - rise(t, 49.5, 51)) * (t >= 46 && t < 58 ? 1 : 0);
  po.headYaw += 0.35 * hand;
  po.face = fa(t > 46.5 && t < 58 ? 'thinking' : (t > 62 && t < 66.4 ? 'proud' : 'smile'), t, 41, { look: [0.3, 0.2] });
  return st;
});
const FK = [[72.17, 215, -60, 0, PI], [75.9, 215, -60, 0], [76.9, 215, 60, 0], [78.8, 215, 60, 0], [79.5, 215, 0, 0], [80.0, 215, 0, 0], [80.7, 215, -60, 0], [85.5, 215, -60, 0, PI]];
const RF6 = mkRoute(FK);
seg('F', 72.17, 85, t => {
  const r = RF6.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.F.cycle) });
  const recv = pulse(t, STONE_T0 + 0.3, STONE_T0 + 0.9, 80.2, 80.9) * 0.8, wood = pulse(t, 80.9, 81.5, 84.0, 84.8);
  const gest = 0.5 + 0.5 * Math.sin((t - 72) * 6.5);
  po.arms = { l: { sz: lerp(0.15, 1.1, recv) + 0.2 * recv * gest + 0.3 * wood, sx: 0.15, el: lerp(0.4, 0.5, recv), curl: 0.4 }, r: { sz: lerp(0.15, 1.1, recv) + 0.2 * recv * (1 - gest) + 0.3 * wood, sx: 0.15, el: lerp(0.4, 0.5, recv), curl: 0.4 } };
  po.lean = 10 * recv + 5 * wood; po.headTilt = 8 * recv;
  po.face = fa(t < 80 ? 'smile' : 'proud', t, 42, { look: [0.1, 0.1] });
  return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po };
});
seg('F', 85, 98, t => {                                                       // ties his son: wraps the rope at the wrists, then at the ankles
  const po = mkpo(t), w1 = pulse(t, 87.6, 88.4, 91.8, 92.6), w2 = pulse(t, 92.8, 93.6, 95.4, 96.2), tie = Math.sin((t - 86) * 5.2);
  po.bob = 70 * w2; po.lean = 6 * w1 + 28 * w2;
  po.arms = { l: { sz: 1.0 + 0.5 * w1 + 0.3 * w2 + 0.1 * tie * w1, sx: -0.2 * w1, el: 0.9 - 0.2 * w2, curl: 0.5 }, r: { sz: 1.0 + 0.5 * w1 + 0.3 * w2 - 0.1 * tie * w1, sx: -0.2 * w1, el: 0.9 - 0.2 * w2, curl: 0.5 } };
  po.arms.l.sz = lerp(0.1, po.arms.l.sz, rise(t, 86.4, 87.6)); po.arms.r.sz = lerp(0.1, po.arms.r.sz, rise(t, 86.4, 87.6));
  po.headTilt = 10 * w1 + 18 * w2; po.face = fa('proud', t, 43, { look: [0, 0.4] });
  return { x: 260, y: 0, z: -60, yaw: -PI / 2, slope: 0, po };
});
seg('F', 98, 132.26, t => {
  const po = mkpo(t), b = rise(t, 99, 101);
  po.arms = { l: { sz: lerp(0.1, 0.7, b), sx: lerp(0.1, -0.2, b), el: lerp(0.36, 1.25, b), curl: 0.6 }, r: { sz: lerp(0.1, 0.7, b), sx: lerp(0.1, -0.2, b), el: lerp(0.36, 1.25, b), curl: 0.6 } };
  po.headTilt = 14 * b; po.lean = 4 * b;
  po.face = fa('proud', t, 44, { look: [0, 0.5] });
  return { x: 225, y: 0, z: 40, yaw: PI, slope: 0, po };
});
seg('F', 132.26, 147, t => {                                                  // raises his hand, is stopped by the light, lowers it
  const po = mkpo(t), a = rise(t, 133.0, 135.6) * (1 - rise(t, 138.4, 141.2));
  const up = rise(t, 141.8, 144.4);
  po.arms = { l: { sz: 0.1, el: 0.5, sx: 0.1, curl: 0.5 }, r: { sz: lerp(0.5, 2.55, a), sx: lerp(0.1, 0.15, a), el: lerp(1.0, 0.25, a), curl: 0.8 } };
  po.headRot = -34 * up; po.headTilt = 6 * (1 - up) * a; po.lean = -3 * a;
  po.face = fa(up > 0.4 ? 'surprised' : 'thinking', t, 45, { look: [0, 0.3] });
  return { x: 225, y: 0, z: 40, yaw: PI, slope: 0, po };
});
seg('F', 147, 167.52, t => {
  const po = mkpo(t), un = pulse(t, 147.4, 148.2, 150.8, 151.6), emb = rise(t, 157.2, 159.0);
  const hold = t < 152 ? 1 : 0;
  po.bob = 40 * un * hold; po.lean = 22 * un * hold;
  po.arms = { l: { sz: lerp(lerp(0.2, 1.0, un), 1.5, emb), sx: lerp(0.0, -0.95, emb) - 0.2 * un, el: lerp(0.9 * un + 0.4, 0.7, emb), curl: 0.4 }, r: { sz: lerp(lerp(0.2, 1.0, un), 1.5, emb), sx: lerp(0.0, -0.95, emb) - 0.2 * un, el: lerp(0.9 * un + 0.4, 0.7, emb), curl: 0.4 } };
  po.headTilt = 8 * un + 8 * emb; po.headYaw = -0.2 * emb;
  po.face = fa(emb > 0.3 ? 'laugh' : (un > 0.3 ? 'proud' : 'surprised'), t, 46, { look: [0, 0.4] });
  const mv = rise(t, 150.2, 152.6);
  const fx = lerp(lerp(225, 150, rise(t, 146.8, 148.0)), 190, rise(t, 154.6, 156.4)), fz = lerp(lerp(40, 0, rise(t, 146.8, 148)), -38, rise(t, 154.6, 156.4));
  return { x: fx, y: 0, z: fz, yaw: angMix(PI, -PI / 2, rise(t, 153.2, 156.4)), slope: 0, po };
});
const wF13 = walker(FR13, ACT.F.cycle);
seg('F', 167.52, 191.73, t => {
  const st = wF13(t), po = st.po, w = st.r.walk;
  const sw = swingR(po.ph, w, 1);
  po.lean = 2 * w; po.arms = { l: { sz: 0.45, sx: 0.5, el: 0.6, curl: 0.5 }, r: { sz: sw, el: 0.36 + 0.5 * w * Math.max(0, Math.sin(2 * PI * (po.ph - 0.33))) } };
  po.headYaw = 0.3; po.headTilt = 3; po.face = fa('smile', t, 47, { look: [0.3, 0.2] }); return st;
});
seg('S', 167.52, 191.73, t => {
  const st = walker(SR13, ACT.S.cycle)(t), po = st.po, w = st.r.walk, sw = swingR(po.ph, w, -1);
  po.lean = 2 * w; po.arms = { r: { sz: 1.15, sx: 0.55, el: 0.7, curl: 0.5 }, l: { sz: swingR(po.ph, w, -1), el: 0.36 + 0.5 * w * Math.max(0, Math.sin(2 * PI * (po.ph + 0.5 - 0.33))) } };
  po.headYaw = -0.35; po.headTilt = 3; po.face = fa('smile', t, 35, { look: [-0.3, 0.2] }); return st;
});

/* ------------------------------------------------------------------ the donkey and the ram */
const wD = walker(DR, ACT.DK.cycle * 0.8), wD13 = walker(DR13, ACT.DK.cycle * 0.8);
const donk = (w, t) => { const st = w(t); st.scale = 0.8; st.slope = st.r.slope; st.po.face = afa('neutral', t, 51); st.po.neckPitch = -4; return st; };
seg('DK', 0, 58, t => donk(wD, t));
seg('DK', 167.52, 191.73, t => donk(wD13, t));
seg('RM', 147, 167.52, t => {
  const po = mkpo(t), tug = Math.sin(t * 3.2) * (0.5 + 0.5 * Math.sin(t * 1.1)), s = rise(t, 147, 148);
  po.step = 0.7 * t * 0.5; po.headRot = 8 * tug; po.headTilt = 3 * tug; po.neckPitch = 5 * tug; po.bob = -2 * Math.abs(tug);
  po.face = afa('surprised', t, 52);
  return { x: 230, y: 0, z: -310 + 14 * Math.max(0, tug), yaw: PI / 2, slope: 0, po, scale: 0.9 };
});

/* ------------------------------------------------------------------ the hall: the rabbi and the bochurim */
const ROWZ2 = [1100, 1300, 1500, 1700, 1900];
seg('RA', 191.73, 200.71, t => {
  const po = mkpo(t), a = pulse(t, 192.4, 193.2, 195.0, 195.8) + pulse(t, 196.4, 197.2, 199.2, 200.0);
  po.arms = { l: { sz: lerp(0.5, 1.3, a), sx: lerp(0.25, 0.8, a), el: lerp(0.9, 0.7, a), tw: 1.0 * a, curl: 0.2 }, r: { sz: lerp(0.5, 1.3, a), sx: lerp(0.25, 0.8, a), el: lerp(0.9, 0.7, a), tw: 1.0 * a, curl: 0.2 } };
  po.lean = 2; po.headTilt = 2; po.headYaw = 0.1 * Math.sin(t * 0.8);
  po.face = fa(a > 0.3 ? 'explaining' : 'smile', t, 120, { look: [0.4, 0.1], talk: talkAt(t, 192.0, 200.4) });
  return { x: -260, y: 0, z: 1100, yaw: 0, slope: 0, po };
});
function listener(t, z, seed, hero) {
  const po = mkpo(t), k = Math.sin(t * 0.9 + seed), nod = Math.sin((t - 196) * 3.2) * pulse(t, 195.6, 196.2, 198, 198.8) * 0.5;
  po.arms = { l: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 }, r: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 } };
  po.headTilt = 3 + 2 * k + 5 * nod; po.lean = 3 + 1.2 * Math.sin(t * 1.3 + seed);
  po.face = fa(hero ? 'proud' : 'smile', t, seed, { look: [0, 0.2] });
  return { x: 312, y: 0, z, yaw: PI, slope: 0, po };
}
seg('BO', 191.73, 200.71, t => listener(t, ROWZ2[2], 91, true));
[0, 1, 3, 4].forEach((zi, k) => seg('C' + (k + 1), 191.73, 200.71, t => listener(t, ROWZ2[zi], 100 + k, false)));

/* ------------------------------------------------------------------ the home: the bochur, the father of the house */
const PICK = [201.7, 202.4, 203.1, 203.8];
const RB_ = mkRoute([[200.71, 0, 455, 0, PI / 2], [204.2, 0, 455, 0, PI / 2], [209.0, -480, 455, 0], [210.2, -480, 455, 0, PI / 2], [214.0, -850, 500, 0], [218, -850, 500, 0, PI / 2]]);
const lifting = t => pulse(t, 214.7, 215.9, 216.4, 217.3);
seg('BO', 200.71, 218, t => {
  const r = RB_.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.BO.cycle) });
  let bend = 0; for (const p of PICK) bend = Math.max(bend, pulse(t, p - 0.5, p, p + 0.1, p + 0.5));
  const carry = rise(t, 201.9, 202.4) * (1 - rise(t, 209.4, 210.2)), place = pulse(t, 209.0, 209.5, 209.9, 210.4);
  const lf = lifting(t), prep = rise(t, 214.0, 214.5) * (1 - rise(t, 217.3, 217.8));
  po.lean = 22 * bend + 6 * place + 26 * prep - 8 * lf; po.bob = 20 * bend + 70 * prep * (1 - lf * 0.75);
  const sw = swingR(po.ph, r.walk, 1);
  const car = { sz: 1.25, sx: -0.15, el: 1.25, curl: 0.4 }, empty = { sz: sw, el: 0.4 }, grip = { sz: lerp(0.8, 1.35, lf) + 0.2 * prep, sx: -0.1, el: lerp(0.35, 0.9, lf), curl: 0.6 };
  po.arms = prep > 0.1 ? { l: grip, r: grip } : (carry > 0.1 ? { l: Object.assign({}, car, { sz: lerp(sw, 1.25, carry) }), r: Object.assign({}, car, { sz: lerp(sw, 1.25, carry) }) } : { l: { sz: lerp(0.8, 1.25, bend), el: 0.5 }, r: { sz: lerp(0.8, 1.25, bend), el: 0.5 } });
  if (bend > 0.1 && carry < 0.9) po.arms = { l: { sz: lerp(0.3, 1.45, bend), sx: -0.1, el: 0.5, curl: 0.4 }, r: { sz: lerp(0.3, 1.45, bend), sx: -0.1, el: 0.5, curl: 0.4 } };
  po.headTilt = 8 * bend + 10 * prep;
  po.face = fa(t > 214 && t < 217 ? 'worried' : (t > 217 ? 'smile' : 'smile'), t, 98, { look: [0, 0.5] });
  return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po, r };
});
seg('HD', 200.71, 218, t => {
  const po = mkpo(t), prep = rise(t, 214.0, 214.5) * (1 - rise(t, 217.3, 217.8)), lf = lifting(t), hint = pulse(t, 205, 206, 207.2, 208.2) + pulse(t, 210.4, 211.2, 212.2, 213);
  po.bob = 60 * prep * (1 - lf * 0.75); po.lean = 24 * prep - 6 * lf;
  const grip = { sz: lerp(0.8, 1.35, lf), sx: -0.1, el: lerp(0.35, 0.9, lf), curl: 0.6 };
  po.arms = prep > 0.1 ? { l: grip, r: grip } : { l: { sz: 0.15 + 0.5 * hint, el: 0.5 + 0.4 * hint, curl: 0.5 }, r: { sz: 0.2 + 1.1 * hint, sx: 0.3 * hint, el: 0.4, curl: 0.2 } };
  po.headTilt = 6 * prep; po.headYaw = 0.35 * hint * 0 - 0.3 * rise(t, 209.6, 211.0) * (1 - rise(t, 213, 214));
  po.face = fa(t > 215 && t < 217.6 ? 'laugh' : (t > 209 ? 'smile' : 'proud'), t, 140, { look: [0.1, 0.2] });
  return { x: -850, y: 0, z: 160, yaw: -PI / 2, slope: 0, po };
});
seg('HD', 218, 240.9, t => {
  const po = mkpo(t), blessing = rise(t, 223.0, 225.2);
  po.bob = SIT; po.lean = 3; po.headTilt = 3 + 3 * blessing; po.headYaw = 0.25 * blessing;
  po.arms = { r: { sz: 0.9, sx: 0.08, el: 1.2, curl: 0.5 }, l: { sz: lerp(0.9, 0.35, blessing), sx: lerp(0.1, 1.95, blessing), el: lerp(1.2, 0.45, blessing), curl: lerp(0.5, 0.2, blessing) } };
  po.face = fa(blessing > 0.5 ? 'laugh' : 'smile', t, 141, { look: [0.5 * blessing, 0.2] });
  return { x: -75, y: 0, z: 138, yaw: -PI / 2 + 0.45 * blessing, slope: 0, po };
});
seg('BO', 218, 240.9, t => {
  const po = mkpo(t), blessing = rise(t, 223.0, 225.2);
  po.bob = SIT; po.lean = 3 + 6 * blessing; po.headTilt = 6 + 14 * blessing; po.headYaw = -0.3 * blessing;
  po.arms = { l: { sz: 0.9, sx: 0.08, el: 1.25, curl: 0.5 }, r: { sz: 0.9, sx: 0.08, el: 1.25, curl: 0.5 } };
  po.face = fa(blessing > 0.4 ? 'laugh' : 'smile', t, 99, { look: [-0.4 * blessing, 0.2] });
  return { x: 75, y: 0, z: 138, yaw: -PI / 2, slope: 0, po };
});

// dispatcher
for (const id in ACT) { const L = SEG[id]; if (!L) continue; const A = ACT[id]; A.fn = t => { for (const s of L) if (t >= s[0] && t < s[1]) return s[2](t); return null; }; }

/* ------------------------------------------------------------------ cameras */
const ctr = (t) => { const a = SR.at(t), b = FR.at(t); return [(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2]; };
const camS01 = hermite([[0, [1300, 1500, 9500], [1500, 600, 0], 34], [8.5, [-1300, 560, 2500], [-1650, 190, -300], 32], [17, [-590, 190, 720], [-1010, 190, -300], 30]]);
const camS02 = t => { const c = ctr(t); return { p: [c[0] + 560, c[1] + 150, c[2] + 1250], l: [c[0] + 20, c[1] + 150, c[2] - 20], fov: 30 }; };
const camS03 = t => { const a = SR.at(t), u = sm((t - 31.66) / 13.34), xc = a.x + lerp(650, 430, u), zc = a.z + lerp(950, 640, u); return { p: [xc, Math.max(py(xc) + 20, terr(xc, zc) + 45), zc], l: [a.x, a.y + lerp(150, 205, u), a.z], fov: 30 }; };
const camS04 = t => { const a = SR.at(t), u = sm((t - 45) / 13), th = lerp(0.65, 1.55, u), R = lerp(1050, 880, u); return { p: [a.x + R * Math.cos(th), a.y + 230, a.z + R * Math.sin(th)], l: [a.x + 40, a.y + 190, a.z], fov: 30 }; };
const camS05 = t => {
  const u = sm((t - 58) / 14.17), a = SR.at(t), b = FR.at(t), cx = (a.x + b.x) / 2, cz = (a.z + b.z) / 2, cy = (a.y + b.y) / 2;
  return { p: [cx - lerp(1300, 2300, u), cy + lerp(250, 560, u), cz + 250], l: [lerp(cx + 100, cx + 4200, u), lerp(cy + 200, cy + 1450, u * u), lerp(cz, cz - 900, u)], fov: lerp(32, 42, u) };
};
const camS06 = t => { const u = sm((t - 72.17) / 12.83), th = lerp(0.95, 2.2, u), R = 1350; return { p: [150 + R * Math.cos(th), lerp(300, 360, u), -20 + R * Math.sin(th)], l: [150, 170, -20], fov: 32 }; };
const camS07 = hermite([[85, [1550, 270, 40], [260, 185, 0], 30], [98, [1200, 250, 20], [260, 190, 5], 30]]);
const camS08 = hermite([[98, [1000, 330, 1050], [0, 130, 0], 34], [104.5, [700, 800, 800], [0, 110, 0], 34], [110.9, [200, 1700, 300], [0, 100, 0], 36]]);
const camS09 = hermite([[110.9, [-560, 80, 360], [0, 380, -130], 48], [122, [-470, 80, 300], [0, 410, -130], 46]]);
const camS10 = hermite([[122, [3800, 1300, 5200], [7000, 2300, -2200], 34], [132.26, [1500, 1500, 8200], [6800, 2200, -2400], 38]]);
const camS11 = hermite([[132.26, [1120, 290, 160], [40, 230, -20], 30], [147, [830, 250, 100], [60, 230, -10], 30]]);
const camS12 = t => { const u = sm((t - 147) / 20.52), th = lerp(-0.5, 0.8, u), R = 1000; return { p: [150 + R * Math.cos(th), 260 + 60 * u, 0 + R * Math.sin(th)], l: [150, 195, -80 + 80 * u], fov: 30 }; };
const camS13 = t => {
  const a = SR13.at(t), b = FR13.at(t), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, cz = (a.z + b.z) / 2;
  const o = hermite([[167.52, [-520, 210, 780], [0, 190, 0], 30], [177, [200, 520, 1500], [-300, 180, -60], 32], [191.73, [1700, 1500, 3200], [-1800, 100, -300], 38]])(t);
  return { p: [cx + o.p[0], cy + o.p[1], cz + o.p[2]], l: [cx + o.l[0], cy + o.l[1], cz + o.l[2]], fov: o.fov };
};
const camS14 = hermite([[191.73, [60, 265, 120], [-60, 200, 1250], 30], [200.71, [40, 255, 360], [-80, 205, 1290], 30]]);
const camS15 = hermite([[200.71, [200, 270, 1200], [0, 190, 430], 30], [206, [-100, 270, 1200], [-300, 190, 420], 30], [210, [-450, 270, 1250], [-550, 190, 400], 30], [218, [-620, 262, 1150], [-820, 185, 300], 30]]);
const camS16 = hermite([[218, [0, 230, 1060], [0, 170, 130], 30], [230, [0, 230, 1000], [0, 175, 140], 30], [233.2, [0, 270, 1500], [0, 300, 600], 30], [236.9, [300, 560, 4300], [0, 420, 0], 32], [240.9, [420, 600, 4500], [0, 420, 0], 32]]);

const SHOTS = [
  { id: 's01', start: 0, end: 17, wide: true, loc: 'DS', hero: ['S', 'F'], cam: camS01 },
  { id: 's02', start: 17, end: 31.66, loc: 'DS', hero: ['S', 'F'], cam: camS02 },
  { id: 's03', start: 31.66, end: 45, loc: 'DS', hero: ['S'], cam: camS03 },
  { id: 's04', start: 45, end: 58, loc: 'DS', hero: ['S'], cam: camS04 },
  { id: 's05', start: 58, end: 72.17, wide: true, loc: 'DS', hero: ['S', 'F'], cam: camS05 },
  { id: 's06', start: 72.17, end: 85, loc: 'SM', hero: ['F', 'S'], cam: camS06 },
  { id: 's07', start: 85, end: 98, loc: 'SM', hero: ['S', 'F'], cam: camS07 },
  { id: 's08', start: 98, end: 110.9, wide: true, loc: 'SM', hero: ['S', 'F'], cam: camS08 },
  { id: 's09', start: 110.9, end: 122, wide: true, loc: 'SM', hero: ['S'], cam: camS09 },
  { id: 's10', start: 122, end: 132.26, wide: true, loc: 'DS', hero: ['SG'], cam: camS10 },
  { id: 's11', start: 132.26, end: 147, loc: 'SM', hero: ['F'], cam: camS11 },
  { id: 's12', start: 147, end: 167.52, loc: 'SM', hero: ['S', 'F'], cam: camS12 },
  { id: 's13', start: 167.52, end: 191.73, wide: true, loc: 'DS', hero: ['S', 'F'], cam: camS13 },
  { id: 's14', start: 191.73, end: 200.71, loc: 'HL', hero: ['RA'], cam: camS14 },
  { id: 's15', start: 200.71, end: 218, loc: 'HM', hero: ['BO', 'HD'], cam: camS15 },
  { id: 's16', start: 218, end: 240.9, loc: 'HM', hero: ['BO', 'HD'], cam: camS16 },
];
SHOTS.forEach((s, i) => { s.index = i; s.dur = s.end - s.start; s.t0 = s.start; });
const shotAt = t => SHOTS.find(s => t < s.end) || SHOTS[SHOTS.length - 1];
const SEAMS = [[72.17, '#ffe9a8'], [98, '#fff6dd'], [110.9, '#fff6dd'], [191.73, '#ffd98a'], [200.71, '#fff6dd'], [218, '#ffe3b0']];

/* ------------------------------------------------------------------ environment per frame */
function skyFor(t, loc) {
  if (loc === 'DS') {
    if (t < 17) return { top: cc('#86b8ee'), bot: cc('#ffd8a0'), oc: cc('#ff9a50'), oa: 0.07 };
    if (t < 72.17) return { top: cc('#7cc0f0'), bot: cc('#fff0d0'), oc: cc('#ffb060'), oa: 0.04 };
    if (t < 132.26) return { top: cc('#a9d6f4'), bot: cc('#fff2cc'), oc: cc('#ffe0a0'), oa: 0.05 };
    return { top: cc('#8ab0e0').lerp(cc('#e9a070'), rise(t, 170, 190) * 0.6), bot: cc('#ffd08a'), oc: cc('#ffa040'), oa: 0.1 };
  }
  if (loc === 'SM') {
    if (t >= 110.9 && t < 122) { const e = rise(t, 111, 116); return { top: cc('#79c0ea').lerp(cc('#a4d4f2'), e), bot: cc('#fdf3dc').lerp(cc('#ffe6b0'), e), oc: cc('#ffe8a0'), oa: 0.04 * e }; }
    if (t >= 132.26 && t < 147) return { top: cc('#86c4f0'), bot: cc('#fff4d8'), oc: cc('#ffe0a0'), oa: 0.05 };
    if (t >= 147) return { top: cc('#98c8f0'), bot: cc('#ffe6b8'), oc: cc('#ffc070'), oa: 0.06 };
    return { top: cc('#79c0ea'), bot: cc('#fdf3dc'), oc: cc('#ffb060'), oa: 0.03 };
  }
  if (loc === 'HM') { if (t < 218) return { top: cc('#8fc4e8'), bot: cc('#fff0d0'), oc: cc('#ffa850'), oa: 0.05 }; const e = rise(t, 218, 220); return { top: cc('#8fc4e8').lerp(cc('#6f7cc4'), e), bot: cc('#fff0d0').lerp(cc('#ffb888'), e), oc: cc('#ff8a5a'), oa: 0.02 + 0.07 * e }; }
  return { top: cc('#8fc4e8'), bot: cc('#fff0d0'), oc: cc('#ffa850'), oa: 0.07 };
}
const SUNDIR = t => KFV(t, [[0, 0.25, 0.06, -0.96], [17, 0.25, 0.14, -0.95], [60, 0.4, 0.3, -0.85], [72, 0.4, 0.3, -0.85], [100, -0.55, 0.45, -0.7], [147, -0.55, 0.35, -0.75], [167, -0.6, 0.12, -0.78], [192, -0.6, 0.1, -0.78], [218, -0.45, 0.07, -0.88], [241, -0.45, 0.07, -0.88]]);
const _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3();
const frac = x => x - Math.floor(x);
function applyEnv(t) {
  const s = shotAt(t), loc = s.loc;
  DS.visible = loc === 'DS'; SM.visible = loc === 'SM'; HL.visible = loc === 'HL'; HM.visible = loc === 'HM';
  const sk = skyFor(t, loc);
  sky.material.uniforms.uTop.value.copy(sk.top); sky.material.uniforms.uBot.value.copy(sk.bot);
  ovMat.uniforms.uC.value.copy(sk.oc); ovMat.uniforms.uA.value = sk.oa;
  let va = 0, vc = '#fff6dd';
  for (const [tb, c] of SEAMS) { const a = 0.62 * (1 - Math.abs(t - tb) / 0.75); if (a > va) { va = a; vc = c; } }
  disMat.uniforms.uC.value.set(vc); disMat.uniforms.uA.value = Math.max(0, va);
  const sunOn = loc === 'DS' || loc === 'SM' || (loc === 'HM' && t >= 218);
  SUN.visible = sunOn;
  if (sunOn) {
    let d = SUNDIR(t), op = 1, col = '#ffd27a';
    if (t >= 110.9 && t < 122) op = 0.2; if (loc === 'DS' && t >= 122 && t < 132.26) op = 0.5;
    if (loc === 'HM') { d = [-0.5, 0.06, -0.86]; col = '#ff9a50'; op = 0.9; }
    const L = Math.hypot(d[0], d[1], d[2]);
    SUN.position.set(cam.position.x + d[0] / L * 12000, cam.position.y + d[1] / L * 12000, cam.position.z + d[2] / L * 12000);
    sunGl.material.color.set(col); sunGl.material.opacity = 0.7 * op; sunDisc.visible = op > 0.3; sunDisc.scale.setScalar(420);
  }
  /* ---------------- desert + mountain */
  if (loc === 'DS') {
    const g5 = rise(t, 60, 66) * (1 - rise(t, 71, 72.17)), g10 = t >= 122 ? rise(t, 122, 124.5) : 0, g13 = t >= 167 ? 0.35 : 0;
    const gl = t < 100 ? g5 : (t < 150 ? g10 : g13);
    sgShaft.material.opacity = 0.26 * gl; sgHalo.material.opacity = 0.9 * gl; sgHalo.scale.set(2600 + 500 * gl, 2600 + 500 * gl, 1);
    const on10 = t >= 122 && t < 132.26, k10 = rise(t, 122, 126);
    DCL.forEach((g, i) => { g.visible = on10; if (!on10) return; const s2 = g.userData.s * (0.2 + 0.8 * k10); g.scale.setScalar(s2); g.position.set(g.userData.p[0] + 40 * Math.sin(t * 0.2 + i), g.userData.p[1], g.userData.p[2]); });
    BIRDS.forEach((B, i) => { B.g.visible = on10; if (!on10) return; const f = 0.35 * Math.sin(t * 3.2 + B.d * 5); B.wl.rotation.x = f; B.wr.rotation.x = -f; B.g.position.set(B.p[0] + 30 * Math.sin(t * 0.3 + B.d), B.p[1] + 24 * Math.sin(t * 0.5 + B.d * 2), B.p[2]); B.g.rotation.y = 0.4 + 0.1 * Math.sin(B.d); });
    dsDrops.forEach((m, i) => {
      m.visible = on10; if (!on10) return;
      const h1 = hash(i * 3.1), h2 = hash(i * 7.7 + 1), h3 = hash(i * 1.9 + 5), ph = frac(t * (0.07 + 0.05 * h1) + h2), a = h3 * PI * 2, r = 300 + 2300 * Math.sqrt(hash(i * 5.3 + 2));
      const x = SUMMIT[0] + Math.cos(a) * r, z = SUMMIT[2] + Math.sin(a) * r * 0.8, yb = terr(x, z) + 60, yt = SUMMIT[1] + 2900;
      m.position.set(x + 70 * Math.sin(t * 0.8 + i), lerp(yt, yb, ph), z); const sz = (150 + 130 * h1) * sm(ph * 6); m.scale.set(sz, sz, 1);
      m.material.opacity = 0.9 * sm(ph * 7) * (1 - sm((ph - 0.9) / 0.1)) * k10;
    });
  } else { sgShaft.material.opacity = 0; }
  /* ---------------- the summit */
  if (loc === 'SM') {
    STN.forEach((m, i) => {
      const ts = STONE_T0 + i * STONE_DT, tp = ts + 0.42 * STONE_DT, tr = ts + 0.8 * STONE_DT, tl = tr + STONE_FLY;
      m.visible = t >= tp;
      if (t < tp) return;
      const fin = m.userData.fin;
      if (t < tr) { ACT.S.o.hand(1).getWorldPosition(_v); m.position.set(_v.x, _v.y + 12, _v.z); m.rotation.set(0.3, 0.6, 0.2); }
      else if (t < tl) { const e = sm((t - tr) / STONE_FLY); m.position.set(lerp(HSTAR.x, fin.x, e), lerp(HSTAR.y, fin.y, e) + 90 * Math.sin(PI * e), lerp(HSTAR.z, fin.z, e)); m.rotation.set(0.3 * (1 - e), lerp(0.6, m.userData.ry, e), 0.2 * (1 - e)); }
      else { m.position.copy(fin); m.rotation.set(0, m.userData.ry, 0); }
    });
    WLG.forEach((m, k) => {
      const tl = 80.9 + 0.27 * k, e = (t - tl) / 0.8, fin = m.userData.fin; LOGP_L[k].visible = t < tl;
      m.visible = t >= tl; if (t < tl) return;
      if (e >= 1) { m.position.copy(fin); m.rotation.set(0, 0, 0); return; }
      const u = sm(e), s0 = LOGP_L[k].position;
      m.position.set(lerp(LOGP.position.x + s0.x, fin.x, u), lerp(s0.y, fin.y, u) + 140 * Math.sin(PI * u), lerp(LOGP.position.z + s0.z, fin.z, u)); m.rotation.set(0, 0.8 * (1 - u), 0);
    });
    LOGP.visible = t < 85;
    // sky opening (s09)
    const o9 = t >= 110.9 && t < 122, k9 = rise(t, 110.9, 116) * (o9 ? 1 : 0);
    CL9.forEach((g, i) => { g.visible = o9; if (!o9) return; g.scale.setScalar(g.userData.s * (0.35 + 0.65 * k9)); g.position.set(g.userData.p[0] * lerp(1.5, 1, k9), g.userData.p[1], g.userData.p[2] * lerp(1.5, 1, k9)); });
    halo9.visible = o9; halo9.material.opacity = 0.55 * k9;
    smDrops.forEach((m, i) => {
      m.visible = o9; if (!o9) return;
      const h1 = hash(i * 3.3 + 1), h2 = hash(i * 7.1), h3 = hash(i * 2.9 + 3), ph = frac((t - 111) * (0.1 + 0.03 * h1) + h2), a = h3 * PI * 2, r = 80 + 650 * Math.sqrt(hash(i * 4.7 + 9)), k = Math.pow(1 - ph, 1.4);
      const FP = FACEP;
      m.position.set(FP[0] + Math.cos(a) * r * k + 24 * Math.sin(t + i), lerp(2300, FP[1] + 40, ph), FP[2] + Math.sin(a) * r * k);
      const sz = (70 + 60 * h1) * sm(ph * 5); m.scale.set(sz, sz, 1); m.material.opacity = 0.95 * sm(ph * 6) * (1 - sm((ph - 0.93) / 0.07)) * rise(t, 111.2, 113.5);
    });
    // the beam (s11)
    const bo = rise(t, 134.6, 137.0) * (1 - rise(t, 143.0, 146.6));
    BEAM.material.opacity = 0.2 * bo; BEAMC.material.opacity = 0.3 * bo; BEAM.visible = BEAMC.visible = bo > 0.01;
    beamGl.material.opacity = 0.45 * bo; beamGl.visible = bo > 0.01;
    // knife
    KS.visible = t < 132.5 || t >= 143.6; KN.visible = t >= 132.5 && t < 143.6;
    FPG.visible = t >= 72.17 && t < 100; FPG.userData.gl && 0;
    FPG.children.forEach(c => { if (c.isSprite) c.material.opacity = 0.7 + 0.2 * Math.sin(t * 7); });
    // rope
  }
  { const rl = [88.2, 89.6, 91.0], ra = [93.2, 94.2, 95.2], ul = [149.0, 149.7, 150.4], ua = [147.4, 147.9, 148.4];
    for (let i = 0; i < 3; i++) { const vw = t >= rl[i] && t < ul[i], va2 = t >= ra[i] && t < ua[i]; ROPE.wl[i].visible = ROPE.wr[i].visible = vw; ROPE.an[i].visible = va2; } }
  /* ---------------- hall */
  if (loc === 'HL') {
    const shOn = true; SHT.forEach(S => { S.s.visible = shOn; });
    sunWin.position.set(60 * Math.sin((t - 191) * 0.3), 560, -900); sunWin.material.opacity = 0.8;
  }
  /* ---------------- the home */
  if (loc === 'HM') {
    const s15 = t < 218, s16 = !s15;
    CLOTH.visible = s16; BEN1.visible = s16; BEN2.visible = false; CANDL.forEach(c => { c.visible = s16; c.userData.gl.material.opacity = 0.7 + 0.25 * Math.sin(t * 8 + c.position.x); c.userData.fl.scale.set(1, 1 + 0.12 * Math.sin(t * 9 + c.position.x), 1); });
    CUPS.forEach(c => c.visible = s16); TCUPS.forEach(c => c.visible = s15 && t < 204);
    let cnt = 0; PLATES.forEach((p, i) => { p.visible = s15 && i < 4 && t < PICK[i] - 0.1; if (i < 4 && t >= PICK[i]) cnt++; });
    STACK.visible = cnt > 0 && s15; STACK.children.forEach((p, i) => { p.visible = i < cnt; });
    // stack carried in front of the bochur, then set on the counter
    const A = ACT.BO, st0 = A.fn(cl(t, 200.8, 217.9));
    if (st0 && s15) {
      const k = rise(t, 209.4, 210.4), fx = st0.x + 78 * Math.cos(st0.yaw), fz = st0.z - 78 * Math.sin(st0.yaw), fy = 150;
      STACK.position.set(lerp(fx, -500, k), lerp(fy, 208, k), lerp(fz, 300, k)); STACK.rotation.y = 0;
    }
    const lf = lifting(t); CRATE.position.set(-850, 96 * lf, 330);
    CRATE.visible = s15;
    WLIGHT.material.opacity = s16 ? 0.4 * rise(t, 232, 236) : 0; WLIGHT.visible = s16;
    LAMPH.visible = true;
  }
  // pot of the father (world placement, always upright) and the knife on the hip
  ACT.F.o.hand(-1).getWorldPosition(_v);
  FPH.visible = ACT.F.h.visible && t < 72.17;
  if (FPH.visible) {
    ACT.F.o.hand(-1).getWorldQuaternion(_q); _v2.set(0, -1, 0).applyQuaternion(_q); const k = sm((_v2.y + 0.2) / 0.6);
    FPH.position.set(_v.x, _v.y + lerp(-36, 6, k), _v.z + 4); FPH.quaternion.identity();
    FPH.userData.gl.material.opacity = 0.75 + 0.2 * Math.sin(t * 6);
  }
  WB.visible = ACT.S.h.visible && t < 72.17;
}
function placeActor(A, st) {
  A.h.visible = true;
  A.h.position.set(st.x, st.y, st.z); A.h.rotation.set(0, st.yaw, st.slope); A.h.scale.setScalar(st.scale || 1);
  if (A.person) A.o.set(st.po); else { A.o.pose(st.po); if (st.po.face) A.o.face.set(st.po.face); }
  A.h.updateMatrixWorld(true);
}
function applyActors(t) {
  for (const id in ACT) {
    const A = ACT[id], st = A.fn(t);
    if (!st) { A.h.visible = false; continue; }
    if (A.prop) { A.h.visible = true; continue; }
    placeActor(A, st);
  }
}
// calibration (pure, fixed): where the son's hand is at the moment each stone is let go
const HSTAR = new THREE.Vector3();
{
  const tr = STONE_T0 + 0.8 * STONE_DT, A = ACT.S, st = A.fn(tr); placeActor(A, st); A.o.hand(1).getWorldPosition(HSTAR); HSTAR.y += 12;
}
// attachments (held things and rope loops)
ACT.F.o.hand(1).add(KN); KN.position.set(0, -12, 6); KN.visible = false;
ACT.F.o.root.add(KS); KS.position.set(6, 116, 44); KS.rotation.z = 0.12; part(KS, RB2(11, 40, 9, 3), M('#4a3326', '#6a5a5a', 0), 1.6, [0, -6, 0]);
scene.add(FPH);
ACT.S.o.body.body.add(WB); WB.position.set(-62, 78, 0); WB.rotation.z = 0.55;
ROPE.wl.forEach((r, i) => { const g = r.parent; ACT.S.o.hand(-1).add(g); g.position.set(0, 8 - i * 7, 0); });
ROPE.wr.forEach((r, i) => { const g = r.parent; ACT.S.o.hand(1).add(g); g.position.set(0, 8 - i * 7, 0); });
ROPE.an.forEach((r, i) => { const g = r.parent; ACT.S.o.root.add(g); g.position.set(0, 24 + i * 7, 0); });
const FACEP = [0, 215, -105];
