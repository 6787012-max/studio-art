
/* ------------------------------------------------------------------ acting helpers */
const SEG = {};
const seg = (id, t0, t1, fn) => { (SEG[id] = SEG[id] || []).push([t0, t1, fn]); };
const mkpo = (t, o) => Object.assign({ t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 }, o || {});
const fa = (expr, t, seed, o) => faceOf(expr, t, seed, o);
const sgn = v => v < 0 ? -1 : 1;
function routeFn(id, route, extra, yfn) {
  const A = ACT[id];
  return t => {
    const r = route.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, A.cycle) });
    const st = { x: r.x, y: yfn ? yfn(r, t) : r.y, z: r.z, yaw: r.yaw, slope: yfn ? 0 : r.slope, po, r };
    if (extra) extra(t, po, st, r);
    return st;
  };
}
const KFV = (t, keys) => { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = sm((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i].slice(1).map((v, k) => lerp(keys[i - 1][k + 1], v, u)); } return keys[keys.length - 1].slice(1); };

/* ------------------------------------------------------------------ BO: tower (s01-s03) */
const stepf = s => s <= 0 ? 0 : s >= NST ? NST : Math.floor(s) + sm((s - Math.floor(s) - 0.25) / 0.5);
const W1 = 18 - Math.hypot(1520, 260) / 100;
const bp = [[-2000, 560, 0, { yaw: 0 }], [-480, 300, 0, { wait: W1, yaw: 0, yaw2: -1.45 }], [-XR, ZA, 0], [XR, ZA, 0], [XR + 22, ZA + 20, 0], [XR + 40, (ZA + ZB) / 2, 0], [XR + 22, ZB - 20, 0], [XR, ZB, 0], [-XR, ZB, 0], [-XR - 110, ZB, 0, { wait: 60, yaw: -1.5 }]];
const bcum = []; { let c = 0; bp.forEach((p, i) => { if (i) c += Math.hypot(p[0] - bp[i - 1][0], p[1] - bp[i - 1][1]); bcum.push(c); }); }
const boR = mkRoute(chain(0, 100, bp));
const stairY = D => RISE * (stepf((D - bcum[2]) / TREAD) + stepf((D - bcum[7]) / TREAD));
const CL = [-XR - 110, 2 * FH, ZB];
// bag in the right hand
const BAG = new THREE.Group();
part(BAG, ell(30, 25, 14, 14, 10), M('#8a5a36', '#6b4a3a'), 2.2, [0, -20, 0]); part(BAG, new THREE.TorusGeometry(10, 1.8, 6, 14, Math.PI).rotateZ(0), M('#3b2c22'), 0, [0, -2, 0]);
ACT.BO.o.hand(1).add(BAG); BAG.position.set(2, -14, 6); BAG.visible = false;
seg('BO', 0, 56.6, t => {
  const r = boR.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, BOC) });
  const st = { x: r.x, y: stairY(r.D), z: r.z, yaw: r.yaw, slope: 0, po, r };
  po.arms = { l: { sz: 0.1 }, r: { sz: 0.14, el: 0.2, curl: 1.0 } };
  if (t < 18.4) {
    const up = rise(t, 15.9, 16.9) * (1 - rise(t, 18.0, 18.6)), puff = pulse(t, 16.9, 17.2, 17.9, 18.2);
    po.headRot = -34 * up; po.lean = -2 * up;
    po.face = fa(puff > 0.5 ? 'surprised' : (up > 0.3 ? 'worried' : 'neutral'), t, 71, up > 0.3 ? { look: [0, -0.8] } : {});
    if (puff > 0.5) po.face.talk = 'O';
  } else if (t < 38.2) {
    po.headTilt = 17; po.lean = 5 * Math.min(1, r.walk);
    po.face = fa('neutral', t, 72, { look: [0, 0.85] });
  } else {
    const up = rise(t, 38.4, 39.6) * (1 - rise(t, 46.0, 47.0)), dn = rise(t, 46.6, 48.2), str = rise(t, 52.0, 54.0), sigh = pulse(t, 42.0, 43.0, 44.0, 45.0);
    po.headRot = -28 * up - 0 * dn; po.headTilt = 20 * dn * (1 - str * 0.4);
    po.lean = 7 * (1 - dn) * (up > 0 ? 1 : 0) + 3 * sigh - 3 * str;
    po.arms = { l: { sz: lerp(0.0, 0.1, dn) }, r: { sz: 0.14, el: 0.2, curl: 1.0 } };
    po.face = fa(t < 47 ? 'worried' : (t < 53 ? 'smile' : 'laugh'), t, 73, t < 47 ? { look: [0, -0.8] } : { look: [0, 0.9] });
  }
  return st;
});

/* ------------------------------------------------------------------ bus people (s04-s06) */
const inBus = (t, lx, lz, yawOff, extra, ly) => {
  const b = busPose(t), c = Math.cos(b.yaw), sn = Math.sin(b.yaw), po = mkpo(t);
  const st = { x: b.x + lx * c + lz * sn, y: (ly == null ? 62 : ly) + 1.8 * Math.sin(t * 9 + lx), z: b.z - lx * sn + lz * c, yaw: b.yaw + yawOff, slope: 0, po };
  if (extra) extra(t, po, st); return st;
};
const bounce = (i, k) => (t, po) => {
  const f = 1.55, ph = i * 1.7, s = Math.sin(t * 2 * Math.PI * f + ph);
  po.bob = SIT * 0.92 + 9 * Math.abs(s) * k; po.lean = 4 * s * k; po.headRot = 5 * Math.sin(t * 3.1 + ph);
  po.arms = { l: { sz: 1.4 + 0.9 * Math.sin(t * 5 + ph), el: 0.5, curl: 0.8 }, r: { sz: 1.4 + 0.9 * Math.sin(t * 5 + ph + 2), el: 0.5, curl: 0.8 } };
  po.face = fa(Math.sin(t * 1.3 + ph) > 0 ? 'laugh' : 'smile', t, 80 + i);
};
// man (driver / teacher)
seg('M', 56.6, 104.4, t => inBus(t, 150, 62, 0, (t, po, st) => {
  po.bob = SIT * 1.0; po.lean = -1;
  const tug = pulse(t, 76.0, 77.5, 87.0, 88.5), turn = pulse(t, 75.4, 77.0, 87.5, 89.0);
  po.arms = { l: { sz: 0.8, el: 0.7, curl: 0.9 }, r: { sz: lerp(0.8, 0.5, tug), el: lerp(0.7, 1.0, tug), sx: lerp(0, 0.3, tug), curl: 0.9 } };
  po.headYaw = -0.75 * turn; po.headRot = 2 * Math.sin(t * 1.1);
  po.face = fa(t < 75.4 ? 'smile' : (t > 88.5 ? 'smile' : 'surprised'), t, 55, t >= 75.4 && t <= 88.5 ? { look: [0.5, 0] } : {});
  if (t > 77.4 && t < 82) po.face.talk = talkAt(t, 77.4, 82);
}, 72));
// little boy B1: bounces seated (s04), stands and tugs the man's sleeve (s05), settles (s06), grows and becomes the bochur
seg('B1', 56.6, 98.6, t => {
  if (t < 73.8) return inBus(t, 30, 62, 0, bounce(1, 1), 62);
  if (t < 91.0) {
    const k = rise(t, 73.8, 75.6) * (1 - rise(t, 89.6, 91.0)); const x = lerp(30, 84, k);
    return inBus(t, x, 62, 0, (t, po, st) => {
      const tug = pulse(t, 76.0, 77.2, 88.0, 89.4); po.bob = SIT * 0.92 * (1 - k) + 0; po.lean = 16 * k;
      po.arms = { l: { sz: lerp(1.4, 0.4, k), el: 0.5, curl: 0.8 }, r: { sz: lerp(1.4, 1.35, k), el: lerp(0.5, 0.18, k), sx: 0.1, curl: 1.1 } };
      po.headTilt = -8 * k; po.headRot = 3 * Math.sin(t * 2.3);
      po.face = fa(k > 0.5 ? 'surprised' : 'smile', t, 81, k > 0.5 ? { look: [0.5, -0.2] } : {});
      if (k > 0.5 && t > 77 && t < 87.5) po.face.talk = talkAt(t, 77, 87.5);
    }, 62);
  }
  const sc = 1 + 0.32 * rise(t, 94.0, 98.0);
  const st = inBus(t, 30, 62, 0, (t, po) => { po.bob = SIT * 0.92; po.lean = 2; po.arms = { l: { sz: 0.5, el: 0.8 }, r: { sz: 0.5, el: 0.8 } }; po.face = fa('smile', t, 81); }, 62);
  st.scale = sc; return st;
});
for (const [i, lx, lz] of [[2, -90, 62], [3, -210, 62], [4, 30, -62], [5, -150, -62]]) seg('B' + i, 56.6, 104.4, t => inBus(t, lx, lz, 0, bounce(i, 1), 62));
// the bochur (older) in the bus window seat, looking back at the glowing road
seg('BO', 98.6, 104.4, t => inBus(t, 30, 62, Math.PI, (t, po) => {
  const u = rise(t, 98.6, 100.2); po.bob = SIT * 0.92; po.lean = 2; po.headTilt = -3; po.headYaw = 0.12 * Math.sin(t * 0.8);
  po.arms = { l: { sz: 0.5, el: 0.9 }, r: { sz: 0.7, el: 1.0 } };
  po.face = fa('smile', t, 74, { look: [0.4, 0.1] });
}, 62));

/* ------------------------------------------------------------------ BO: hall (s07a), rainy street (s07b) */
seg('BO', 104.4, 114.0, t => {
  const po = mkpo(t), k = Math.sin(t * 1.7);
  const hand = rise(t, 106.0, 107.2);
  po.arms = { l: { sz: 0.82, sx: 0, el: 1.32, tw: 0, curl: 0.55 }, r: { sz: lerp(0.82, 2.45, hand), el: lerp(1.32, 1.75, hand), sx: lerp(0, 0.7, hand), tw: lerp(0, 0.4, hand), curl: lerp(0.55, 1.0, hand) } };
  po.headTilt = 16 + 3 * k * 0.5; po.headYaw = 0.12 * Math.sin(t * 0.9); po.headRot = 4 * Math.sin(t * 0.6); po.lean = 6 + 1.5 * Math.sin(t * 0.7);
  po.face = fa('worried', t, 91, { look: [0.3, 0.9] });
  return { x: -112, y: 0, z: 1250, yaw: 0, slope: 0, po };
});
const rainR = mkRoute(chain(115.0, 78, [[0, 70, 0], [0, 255, 0], [330, 310, 0]]));
seg('BO', 114.0, 122.0, routeFn('BO', rainR, (t, po, st, r) => {
  po.arms = { l: { sz: 0.1 }, r: { sz: 0.12, el: 0.2, curl: 1.0 } };
  po.lean = 9 * Math.min(1, r.walk + 0.4); po.headTilt = 22; po.headRot = 2 * Math.sin(t * 0.7);
  po.face = fa('worried', t, 92, { look: [0, 0.9] });
}));

/* ------------------------------------------------------------------ BO: hill path (s08, s09) */
const hp = []; for (let x = 60; x <= 1430; x += 70) hp.push([x, zc(x), gy(x)]);
hp.push([1430, zc(1430), gy(1430), { wait: 40, yaw: 0 }]);
const hillR = mkRoute(chain(122, 108, hp));
seg('BO', 122, 145, routeFn('BO', hillR, (t, po, st, r) => {
  const turn = rise(t, 136.0, 138.2); st.yaw = angMix(st.yaw, Math.PI, turn);
  const fist = rise(t, 139.0, 140.2) * (1 - rise(t, 143.0, 144.2)), glad = rise(t, 138.0, 139.0);
  po.arms = { l: { sz: 0.1 }, r: { sz: lerp(0.1, 1.95, fist), el: lerp(0.3, 1.7, fist), sx: lerp(0, 0.2, fist), curl: lerp(0.5, 1.5, fist) } };
  po.lean = (t < 126 ? 8 : (t < 135 ? 5 : 0)) * (1 - glad) + 3 * Math.min(1, r.walk) * 0;
  po.headTilt = t < 127 ? 12 : (t < 135.5 ? 4 : -6 * glad);
  const ex = t < 126.5 ? 'worried' : t < 135.8 ? 'neutral' : t < 138.2 ? 'surprised' : (t < 144 ? 'laugh' : 'smile');
  po.face = fa(ex, t, 93, t < 126.5 ? { look: [0, 0.8] } : (t >= 136 && t < 138.4 ? { look: [0.6, 0.5] } : {}));
  st.slope = turn > 0.01 ? 0 : st.slope;
}));

/* ------------------------------------------------------------------ man, rabbi A: mist meadow (s10, s11) */
const manR = mkRoute(chain(145, 100, [[-1500, -30, 0, { yaw: 0 }], [0, 0, 0, { wait: 40, yaw: 0 }], [560, 0, 0]]));
{
  const manR2 = mkRoute(chain(145, 100, [[-1500, -30, 0, { yaw: 0 }], [0, 0, 0, { wait: 172.4 - (145 + Math.hypot(1500, 30) / 100), yaw: 0 }], [560, 0, 0]]));
  ACT.M.route = manR2;
  seg('M', 145, 176.6, routeFn('M', manR2, (t, po, st, r) => {
    const rel = rise(t, 161.5, 165.5), face2 = rise(t, 167.2, 168.8) * (1 - rise(t, 171.4, 172.6));
    st.yaw = angMix(st.yaw, Math.PI, face2);
    const inL = rise(t, 150, 158);
    po.arms = { l: { sz: lerp(-0.5, 0.15, rel), el: lerp(1.2, 0.3, rel), curl: 1.0 }, r: { sz: lerp(-0.5, 0.15, rel), el: lerp(1.2, 0.3, rel), curl: 1.0 } };
    po.lean = lerp(12, 1, rel) - 2 * inL * (1 - rel) ; po.headTilt = lerp(14, 0, rel) * (1 - 0.4 * inL); po.headRot = 2 * Math.sin(t * 0.6);
    const ex = t < 154 ? 'worried' : t < 164 ? 'neutral' : t < 172 ? 'smile' : 'laugh';
    po.face = fa(ex, t, 95, t < 154 ? { look: [0, 0.8] } : {});
    st.y = 0 + (rel < 1 && r.walk > 0.3 ? 0 : 0);
  }));
  const raR = mkRoute(chain(145, 90, [[300, -20, 0, { wait: 11, yaw: Math.PI, yaw2: Math.PI }], [200, -100, 0], [-80, -100, 0], [-80, -8, 0, { wait: 172.4 - 157.9 - 5.5, yaw: 0, yaw2: 0 }], [40, -115, 0], [600, -115, 0]]));
  ACT.RA.route = raR;
  seg('RA', 145, 176.6, routeFn('RA', raR, (t, po, st, r) => {
    const lift = pulse(t, 161.0, 162.0, 164.2, 165.2), hold = rise(t, 166.0, 167.4);
    po.arms = { l: { sz: lerp(0.1, 1.3, Math.max(lift, hold * 0.9)), el: lerp(0.3, 0.7 + 0.6 * hold, Math.max(lift, hold)), curl: 0.9, sx: 0.05 }, r: { sz: lerp(0.1, 1.3, Math.max(lift, hold * 0.9)), el: lerp(0.3, 0.7 + 0.6 * hold, Math.max(lift, hold)), curl: 0.9 } };
    po.headTilt = 4 * lift; po.lean = 2 * lift;
    po.face = fa(t < 157 ? 'smile' : (t < 164 ? 'explaining' : 'smile'), t, 96);
    if (t > 168.5 && t < 171.5) po.face.talk = talkAt(t, 168.5, 171.5);
  }));
}
const manPos = t => ACT.M.fn(t);
SACK.visible = false;
const sackAt = t => {
  const m = manPos(t) || { x: 0, y: 0, z: 0, yaw: 0 }, c = Math.cos(m.yaw), sn = Math.sin(m.yaw);
  const back = [m.x - 34 * c, 128 + (m.po && m.po.bob ? 0 : 0) + 3 * Math.abs(Math.sin(t * 3.1)) * (m.r ? m.r.walk : 0), m.z + 34 * sn];
  const G = [-215, 52, -36], u = sm((t - 161.6) / 3.4), arc = 150 * Math.sin(Math.PI * u);
  let p = [lerp(back[0], G[0], u), lerp(back[1], G[1], u) + arc, lerp(back[2], G[2], u)];
  if (t < 161.6) p = back;
  const fade = 1 - sm((t - 166.0) / 3.6);
  return { p, s: t < 161.6 ? 1 : (u < 1 ? 1 : fade), yaw: m.yaw, tilt: t < 161.6 ? 0.25 : 0.25 * (1 - u) };
};

/* ------------------------------------------------------------------ Lot (rabbi B) on the desert road, s12-s13 */
const lp = []; for (let z = -1600; z <= 2100; z += 100) lp.push([40 * Math.sin(z / 900), z, 0]);
const lotR = mkRoute(chain(176.6, 100, lp));
seg('RB', 176.6, 212, routeFn('RB', lotR, (t, po, st, r) => {
  po.arms = { l: { sz: 0.1 }, r: { sz: 0.1 } };
  po.lean = 3; po.headTilt = -2; po.headYaw = 0.05 * Math.sin(t * 0.7);
  po.face = fa(t < 194 ? 'worried' : 'neutral', t, 97, { look: [0, -0.1] });
}));
const pilP = [40 * Math.sin(-700 / 900), 0, -700]; PILLAR.position.set(pilP[0], 0, pilP[2]);

/* ------------------------------------------------------------------ BO: salt and honey (s14), the golden stairs (s15) */
seg('BO', 212, 227.6, t => {
  const po = mkpo(t);
  const toHoney = rise(t, 218.0, 219.4), take = rise(t, 220.6, 221.8), lift = rise(t, 222.4, 223.8), glanceSalt = pulse(t, 213.0, 214.0, 216.6, 217.6);
  po.headYaw = 0.6 * glanceSalt - 0.55 * toHoney; po.headTilt = 14 + 4 * Math.sin(t * 0.8) - 6 * lift; po.lean = 4 - 2 * lift;
  po.arms = { l: { sz: 0.45, el: 0.7, curl: 0.5 }, r: { sz: lerp(0.45, 1.4, toHoney) - 0.4 * lift, el: lerp(0.7, 0.45, toHoney) + 1.0 * lift, sx: lerp(0, -0.12, toHoney), curl: lerp(0.5, 1.1, take) } };
  const ex = t < 217.8 ? 'thinking' : (t < 221 ? 'neutral' : (t < 224 ? 'smile' : 'laugh'));
  po.face = fa(ex, t, 98, t < 217.8 ? { look: [0.5, 0.4] } : (t < 221 ? { look: [-0.5, 0.4] } : {}));
  return { x: 110, y: 0, z: 1215, yaw: Math.PI / 2, slope: 0, po };
});
const zq = zc(1500), X0 = 1560;
const climbR = mkRoute(chain(234.0, 100, [[1500, zq, 0, { yaw: 0 }], [3300, zq, 0]]));
const stairY2 = x => HT + RISE * stepf2((x - X0) / TREAD);
function stepf2(s) { return s <= 0 ? 0 : (s >= 46 ? 46 : Math.floor(s) + sm((s - Math.floor(s) - 0.25) / 0.5)); }
seg('BO', 227.6, 247.31, t => {
  const r = climbR.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, BOC) });
  const glance = 1 - rise(t, 231.4, 233.4);
  const st = { x: r.x, y: stairY2(r.x), z: r.z, yaw: angMix(0, Math.PI, glance), slope: 0, po, r };
  if (t < 233.9) st.y = HT;
  po.arms = { l: { sz: 0.1 }, r: { sz: 0.1 } };
  po.lean = 2 + 3 * (1 - glance) * Math.min(1, r.walk + 0.2); po.headTilt = -3 * glance; po.headYaw = 0.1 * Math.sin(t * 0.6);
  po.face = fa(t < 233 ? 'smile' : 'neutral', t, 99, t < 233 ? { look: [0.3, 0.1] } : { look: [0.4, -0.2] });
  return st;
});

/* ------------------------------------------------------------------ props as actors */
addProp('BUS', busG); ACT.BUS.fn = t => (t >= 56.6 && t <= 104.4) ? { x: 0, y: 0, z: 0, yaw: 0, slope: 0 } : null;
addProp('PILLAR', PILLAR); ACT.PILLAR.fn = t => (t >= 194 && t <= 212) ? { x: pilP[0], y: 0, z: pilP[2], yaw: 0, slope: 0 } : null;
// dispatcher
for (const id in ACT) { const L = SEG[id]; if (!L) continue; const A = ACT[id]; A.fn = t => { for (const s of L) if (t >= s[0] && t < s[1]) return s[2](t); return null; }; }

/* ------------------------------------------------------------------ shots and cameras */
const avgPos = (t, w) => { let x = 0, y = 0, z = 0, n = 0; for (const d of [-w, -w / 2, 0, w / 2, w]) { const f = ACT.BO.fn(cl(t + d, 0, 56.5)); if (f) { x += f.x; y += f.y; z += f.z; n++; } } return n ? [x / n, y / n, z / n] : [0, 0, 0]; };
const camS02 = t => {
  const c = avgPos(t, 0.6), f = ACT.BO.fn(t), dx = f ? sgn(Math.cos(f.yaw)) : 1;
  return { p: [c[0] + 60 * dx, c[1] + 235, 1050], l: [c[0] + 70 * dx, c[1] + 140, c[2]], fov: 30 };
};
const camS03 = t => {
  const k = KFV(t, [[38, 950, 200, 0, 150, 30], [41, 1000, 215, 0, 160, 30], [44.5, 2100, 430, 0, 330, 34], [47.3, 1100, 200, 0, 150, 30], [50, 1600, 160, 250, -90, 38], [56.6, 1100, 200, 120, 130, 32]]);
  const a = lerp(0.5, -0.4, sm((t - 38) / 18.6));
  return { p: [CL[0] + k[0] * Math.sin(a), CL[1] + k[1], CL[2] + k[0] * Math.cos(a)], l: [CL[0] + k[2], CL[1] + k[3], CL[2]], fov: k[4] };
};
const bus3 = (t, off) => { const b = busPose(t); return [b.x + off[0], off[1], b.z + off[2]]; };
const camS04 = t => { const u = (t - 56.6) / 17.4; return { p: busLocal(t, lerp(-160, 160, u), 215 + 20 * Math.sin(u * 3), 1180 - 120 * u), l: busLocal(t, lerp(-60, 50, u), 165, 0), fov: 34 }; };
const camS05 = t => { const u = (t - 74) / 16; return { p: busLocal(t, lerp(330, 270, u), lerp(190, 180, u), lerp(900, 640, u)), l: busLocal(t, lerp(90, 105, u), 165, 40), fov: lerp(36, 32, u) }; };
const camS06 = t => {
  const u = sm((t - 98.4) / 5.2), w = sm((t - 90) / 6.5) * (1 - u);
  const b = busPose(t);
  const near1 = busLocal(t, 330, 210, 780), far = [b.x - 1400, 3300, b.z + 3500], near2 = busLocal(t, -430, 190, 640);
  const pA = lerp3(near1, far, sm((t - 90) / 6.5)), p = lerp3(pA, near2, u);
  const lA = lerp3(busLocal(t, 90, 165, 40), [b.x - 2100, 0, b.z - 300], sm((t - 90) / 6.5)), l = lerp3(lA, busLocal(t, 40, 175, 55), u);
  return { p, l, fov: lerp(lerp(34, 40, sm((t - 90) / 6.5)), 28, u) };
};
const camS07a = t => { const u = (t - 104.4) / 9.6; return { p: [lerp(-130, -40, u), 200, lerp(2070, 1850, u)], l: [-70, 188, 1250], fov: 30 }; };
const camS07b = t => { const f = ACT.BO.fn(t); const c = f ? [f.x, f.y, f.z] : [0, 0, 100]; return { p: [c[0] * 0.5 - 300 - 80 * (t - 114) / 8, 200, 950], l: [c[0] * 0.8 + 20, 135, c[2] - 20], fov: 32 }; };
const camS08 = t => { const f = ACT.BO.fn(t); const c = f ? [f.x, f.y, f.z] : [0, 0, 0]; return { p: [c[0] + 380, c[1] + 330, c[2] + 1250 - 80 * (t - 122) / 13], l: [c[0] + 160, c[1] + 120, c[2]], fov: 34 }; };
const camS09 = t => {
  const f = ACT.BO.fn(145 - 0.01), c = [1430, HT + 135, zc(1430)], u = sm((t - 135) / 10);
  const a = lerp(Math.PI * 1.02, 0.05, u), R = lerp(1050, 1150, u), h = 0;
  const look = [c[0] - 380 * u, lerp(700, 560, u), c[2] + 0];
  return { p: [c[0] + R * Math.cos(a) - 10 * 0, lerp(720, 950, u * u), c[2] + R * Math.sin(a) * 0.9], l: look, fov: lerp(32, 38, u) };
};
const camS10 = t => { const m = ACT.M.fn(t); const mx = m ? m.x : 0; const w = rise(t, 147, 153), cx = lerp(mx + 30, (mx + 300) / 2, w), dT = Math.max(1040, (Math.abs(300 - mx) / 2 + 260) / 0.477);
  return { p: [cx + 110, 290, lerp(1040, dT, w)], l: [cx, 200, 0], fov: 30 }; };
const camS11 = t => {
  const u = (t - 160) / 16.6, lx = lerp(150, 380, sm((t - 170) / 6.6));
  return { p: [lx + lerp(110, 40, u), lerp(290, 320, u), lerp(1040, 1250, sm(u))], l: [lx, 205, -10], fov: lerp(30, 32, u) };
};
const camS12 = t => { const f = ACT.RB.fn(t); const c = f || { x: 0, y: 0, z: 0 }; const u = (t - 176.6) / 17.4; return { p: [c.x - 220 + 380 * u, lerp(190, 215, u), c.z + 1000], l: [c.x - 20, 170, c.z], fov: 32 }; };
const camS13 = t => { const u = sm((t - 194) / 18), a = lerp(Math.PI - 0.7, Math.PI + 0.9, u), R = lerp(1700, 1500, u), h = lerp(170, 330, u);
  return { p: [pilP[0] + R * Math.sin(a), h, pilP[2] + R * Math.cos(a)], l: [pilP[0], 300, pilP[2] + 40], fov: 34 }; };
const camS14 = t => { const u = (t - 212) / 15.6; return { p: [lerp(40, 120, u), lerp(270, 235, u), lerp(110, 470, sm(u))], l: [lerp(60, 110, u), 175, 1150], fov: lerp(32, 33, u) }; };
const camS15 = hermite([[227.6, [850, HT + 200, zq + 430], [1500, HT + 160, zq], 32], [232, [900, HT + 220, zq + 500], [1560, HT + 170, zq], 32], [236.5, [820, HT + 300, zq + 560], [1800, HT + 230, zq], 30],
  [240, [250, HT + 700, zq + 1500], [2150, HT + 420, zq], 38], [243.3, [-500, HT + 1500, zq + 2200], [2300, HT + 700, zq], 46], [247.3, [-560, HT + 1580, zq + 2300], [2330, HT + 720, zq], 46.5]]);

const SHOTS = [
  { id: 's01', start: 0, end: 18, wide: true, loc: 'TW', hero: ['BO'], cam: hermite([[0, [0, 2150, 9600], [0, 1850, 0], 36], [9, [-500, 650, 2900], [-900, 450, 300], 34], [18, [-470, 215, 1150], [-440, 150, 300], 30]]) },
  { id: 's02', start: 18, end: 38, loc: 'TW', hero: ['BO'], cam: camS02 },
  { id: 's03', start: 38, end: 56.6, wide: true, loc: 'TW', hero: ['BO'], cam: camS03 },
  { id: 's04', start: 56.6, end: 74, wide: true, loc: 'RD', hero: ['B1', 'B2', 'B3', 'B4', 'B5'], cam: camS04 },
  { id: 's05', start: 74, end: 90, loc: 'RD', hero: ['M', 'B1'], cam: camS05 },
  { id: 's06', start: 90, end: 104.4, wide: true, loc: 'RD', hero: ['BUS'], cam: camS06 },
  { id: 's07', start: 104.4, end: 122, loc: 'HL', hero: ['BO'], cam: t => t < 114 ? camS07a(t) : camS07b(t) },
  { id: 's08', start: 122, end: 135, wide: true, loc: 'HI', hero: ['BO'], cam: camS08 },
  { id: 's09', start: 135, end: 145, loc: 'HI', hero: ['BO'], cam: camS09 },
  { id: 's10', start: 145, end: 160, wide: true, loc: 'MS', hero: ['M', 'RA'], cam: camS10 },
  { id: 's11', start: 160, end: 176.6, wide: true, loc: 'MS', hero: ['M', 'RA'], cam: camS11 },
  { id: 's12', start: 176.6, end: 194, loc: 'DS', hero: ['RB'], cam: camS12 },
  { id: 's13', start: 194, end: 212, wide: true, loc: 'DS', hero: ['PILLAR'], cam: camS13 },
  { id: 's14', start: 212, end: 227.6, loc: 'HL', hero: ['BO'], cam: camS14 },
  { id: 's15', start: 227.6, end: 247.3, wide: true, loc: 'HI', hero: ['BO'], cam: camS15 },
];
SHOTS.forEach((s, i) => { s.index = i; s.dur = s.end - s.start; s.t0 = s.start; });
const shotAt = t => SHOTS.find(s => t < s.end) || SHOTS[SHOTS.length - 1];
const locOf = t => { const s = shotAt(t); return s.id === 's07' && t >= 114 ? 'HS' : s.loc; };
const SEAMS = [[56.6, '#fff6dd'], [104.4, '#fff6dd'], [145, '#fff6dd'], [176.6, '#ffdca0'], [212, '#ffffff'], [227.6, '#fff1c8']];

/* ------------------------------------------------------------------ environment per frame */
const cc = h => new THREE.Color(h);
function skyFor(t, loc, sid) {
  let top = '#6db8ea', bot = '#fdf2da', oc = '#ffb060', oa = 0.04;
  if (loc === 'RD') { top = '#74c3f0'; bot = '#fdf6e4'; oa = 0.03; }
  else if (loc === 'HL') { top = '#8fc4e8'; bot = '#fff0d0'; oc = '#ffa850'; oa = 0.09; }
  else if (loc === 'HS') { top = '#7b8494'; bot = '#c3c8d0'; oc = '#1c2850'; oa = 0.14; }
  else if (loc === 'HI') {
    const e = t < 135 ? rise(t, 122, 134) : 1;
    const a = cc('#7b8494').lerp(cc('#6db8ea'), e), b = cc('#c3c8d0').lerp(cc('#fdf2da'), e);
    return { top: a, bot: b, oc: cc('#1c2850').lerp(cc('#ffb060'), e), oa: lerp(0.16, 0.03, e) + (t > 227 ? 0.02 : 0) };
  }
  else if (loc === 'MS') { const e = rise(t, 146, 156); return { top: cc('#a6bad0').lerp(cc('#74c3f0'), e), bot: cc('#e2ddd0').lerp(cc('#fff2d4'), e), oc: cc('#ffb060'), oa: 0.04 }; }
  else if (loc === 'DS') { const e = rise(t, 196, 211); return { top: cc('#3a3772').lerp(cc('#6a5aa0'), e), bot: cc('#ff8f50').lerp(cc('#ffc080'), e), oc: cc('#ff7a30'), oa: 0.1 }; }
  return { top: cc(top), bot: cc(bot), oc: cc(oc), oa };
}
const _hn = {};
function hideNear(list, rng, camFn, rad, key) {
  if (!rng) { for (const it of list) it.o.visible = true; return; }
  if (!_hn[key]) { const ids = new Set(); for (let tt = rng[0]; tt <= rng[1]; tt += 0.5) { const c = camFn(tt); for (let i = 0; i < list.length; i++) { const it = list[i]; if (Math.hypot(it.x - c.p[0], it.z - c.p[2]) < (it.k === 'h' ? rad : rad * 0.5) || Math.hypot(it.x - c.l[0], it.z - c.l[2]) < 0) ids.add(i); } } _hn[key] = ids; }
  list.forEach((it, i) => { it.o.visible = !_hn[key].has(i); });
}
function applyEnv(t) {
  const s = shotAt(t), loc = locOf(t);
  TW.visible = loc === 'TW'; RD.visible = loc === 'RD'; HL.visible = loc === 'HL'; HS.visible = loc === 'HS'; HI.visible = loc === 'HI'; MS.visible = loc === 'MS'; DS.visible = loc === 'DS';
  const sk = skyFor(t, loc, s.id);
  sky.material.uniforms.uTop.value.copy(sk.top); sky.material.uniforms.uBot.value.copy(sk.bot);
  ovMat.uniforms.uC.value.copy(sk.oc); ovMat.uniforms.uA.value = sk.oa;
  // dissolve veil at the seams
  let va = 0, vc = '#fff6dd';
  for (const [tb, c] of SEAMS) { const a = 0.62 * (1 - Math.abs(t - tb) / 0.75); if (a > va) { va = a; vc = c; } }
  disMat.uniforms.uC.value.set(vc); disMat.uniforms.uA.value = Math.max(0, va);
  // --- tower
  if (loc === 'TW') {
    const S = 1 + 1.6 * pulse(t, 39, 42, 46, 48.5);
    FL.forEach((g, f) => { if (f < 2) { g.position.y = f * FH; g.scale.y = 1; } else { g.position.y = levelY(f, S); g.scale.y = S; } });
    FL.roof.position.y = levelY(FLOORS, S);
    const gt = [rise(t, 48, 49.2), rise(t, 50, 51.2), rise(t, 52, 53.2)];
    LAMPS.forEach((p, L) => { p.g.position.y = levelY(L, S); const g = L < 3 ? gt[L] : 0; p.mat.color.copy(p.base).lerp(GOLD, g); p.gl.material.color.copy(p.base).lerp(GOLD, g); p.gl.material.opacity = 0.5 + 0.45 * g; p.gl.scale.setScalar(230 + 190 * g * (1 + 0.2 * Math.sin(t * 3 + L))); });
  }
  // --- road: gold line behind the bus
  if (loc === 'RD') {
    hideNear(RD.userData.items, t < 74 ? [56.6, 74] : null, camS04, 1700, 'RD04');
    const b = busPose(t), iB = Math.floor((b.s - RS0) / RSTEP), iT = Math.floor((2300 - RS0) / RSTEP);
    const reveal = cl((t - 90.3) * 1100, 0, 1e9), iS = Math.max(iT, iB - Math.floor(reveal / RSTEP)), n = Math.max(0, iB - iS);
    const on = t >= 90.3 ? 1 : 0;
    goldLine.geometry.setDrawRange(iS * 6, on * n * 6); goldSoft.geometry.setDrawRange(iS * 6, on * n * 6);
    goldSoft.material.opacity = 0.32 + 0.12 * Math.sin(t * 3); goldHead.visible = on > 0; goldHead.position.set(b.x - 60, 140, b.z); goldHead.material.opacity = 0.45 * on * (1 - rise(t, 99, 103) * 0.5);
    const sp = (b.s - (t > 0.05 ? busS(t - 0.05) : b.s)) / 0.05;
    wheelsRD.forEach(w => { w.rotation.z = -b.s / 52; });
    const bb = roadAt(b.s); busG.position.set(bb.x, 0, bb.z); busG.rotation.y = bb.yaw;
  }
  // --- rain
  rainHS.userData.update(t, { x: 0, y: -50, z: 600 }, loc === 'HS' ? 1 : 0, 0.3, { w: 2200, h: 1500, d: 1600 });
  rainHI.userData.update(t, { x: 600, y: -50, z: 0 }, loc === 'HI' && t < 131 ? 0.6 * (1 - rise(t, 122, 131)) : 0, 0.25, { w: 2200, h: 1500, d: 1500 });
  HSDOOR.rotation.y = -1.45 * rise(t, 114.3, 115.5);
  // --- hall
  if (loc === 'HL') {
    const s14 = t >= 212;
    SHT.visible = !s14; TBL.visible = SALT.visible = HONEY.visible = s14;
    const take = t >= 221.4;
    HONEY.userData.jar.visible = !take; ACT.BO.heldJar.visible = take; HONEY.userData.drop.visible = !take;
    ACT.BO.heldJar.userData.gl.material.opacity = 0.5 + 0.2 * Math.sin(t * 2.2);
    HONEY.userData.jar.userData.gl.material.opacity = 0.45 + 0.15 * Math.sin(t * 2.2);
    const dr = ((t - 214) % 4.5 + 4.5) % 4.5 / 4.5; HONEY.userData.drop.position.set(26, 90 - 22 * dr * dr, 22); HONEY.userData.drop.scale.setScalar(0.4 + 0.6 * Math.sin(dr * Math.PI));
    saltGl.forEach((g, i) => { g.material.opacity = 0.35 * Math.max(0, Math.sin(t * 2.4 + i * 1.9)); });
  }
  // --- bag
  BAG.visible = (t < 56.6) || (t >= 114 && t < 122);
  // --- tower step glow
  // --- hill
  if (loc === 'HI') {
    const lights = [rise(t, 137.8, 138.8), rise(t, 139.3, 140.3), rise(t, 140.8, 141.8), rise(t, 142.3, 143.3)];
    obstGlow.forEach((o, i) => { const k = (t >= 145 ? 1 : lights[i]) * (t >= 227 ? 0.75 : 1) ; o.gl.material.opacity = 0.85 * k * (0.85 + 0.15 * Math.sin(t * 3 + i)); o.ring.material.opacity = 0.7 * k; o.ring.scale.setScalar(150 + 12 * Math.sin(t * 2 + i)); });
    HI.userData.gpath.material.opacity = 0.75 * rise(t, 141, 144) * (t > 200 ? 1 : 1);
    const gs = HI.userData.gold; gs.visible = t >= 227;
    const k15 = rise(t, 227.6, 230); HI.userData.stairGl.material.opacity = 0.5 * k15; HI.userData.sun[0].material.opacity = 0.8 * k15; HI.userData.sun[1].material.opacity = 0.45 * k15;
    HI.userData.farClouds.forEach((c, i) => { c.position.x = -3000 + i * 1500 + 40 * Math.sin(t * 0.1 + i); });
    const spK = Math.max(pulse(t, 138, 140, 144, 145), rise(t, 228, 231)); sparkHI.visible = spK > 0.02;
    sparkHI.userData.items.forEach((m, i) => { const d = m.userData, ph = (t * 0.28 + d.a * 3) % 1; m.visible = spK > 0.02; const base = t < 200 ? [800, HT * 0.3, zc(800)] : [2000, HT + 300, zc(1500)];
      m.position.set(base[0] + (d.b - 0.5) * (t < 200 ? 1400 : 2200), base[1] + ph * 420 + (t < 200 ? 0 : (d.c - 0.3) * 500), base[2] + (d.c - 0.5) * 300); m.scale.setScalar((9 + 18 * d.d) * Math.sin(ph * Math.PI) * spK); m.material.opacity = spK * Math.sin(ph * Math.PI); m.quaternion.copy(cam.quaternion); m.rotateZ(t * (1 + d.a)); });
  }
  // --- mist meadow
  if (loc === 'MS') {
    for (const it of MS.userData.items) if (it.k === 't' && it.z > 200) it.o.visible = false;
    const clear = rise(t, 163, 172);
    mistPuffs.forEach((m, i) => { const x = m.x + 40 * Math.sin(t * 0.18 + m.ph) + 700 * clear * (i % 3 === 0 ? 0 : 1) * -0; m.s.position.set(x, m.y * 0.8 + 18 * Math.sin(t * 0.3 + m.ph), -650 - (m.z + 900) * 0.5); const left = x < -250 ? 1 : 0.0; m.s.material.opacity = 0.34 * left * (1 - 0.6 * clear); m.s.material.opacity = Math.max(0, m.s.material.opacity); });
    MS.userData.sun.material.opacity = 0.35 + 0.35 * rise(t, 150, 170);
    MS.userData.rays.forEach((b, i) => { b.material.opacity = 0.14 * rise(t, 152, 168) * (0.7 + 0.3 * Math.sin(t * 0.7 + i)); });
    const sk2 = sackAt(t); SACK.visible = t < 170.5; SACK.position.set(sk2.p[0], sk2.p[1] * (t < 161.6 ? 1 : 1), sk2.p[2]); SACK.rotation.set(0, -sk2.yaw, sk2.tilt); SACK.scale.setScalar(Math.max(0.001, sk2.s));
    // the book
    const bk = rise(t, 166.2, 167.8), ra = ACT.RA.fn(t);
    BOOKG.visible = t >= 166.2 && ra; if (ra) { const c = Math.cos(ra.yaw), sn = Math.sin(ra.yaw), off = 62 + 28 * pulse(t, 168.6, 169.6, 171.6, 172.4);
      BOOKG.position.set(ra.x + off * c, 150 + 6 * Math.sin(t * 1.6), ra.z - off * sn); BOOKG.rotation.set(0, -ra.yaw + Math.PI / 2, 0); BOOKG.rotation.z = 0; BOOKG.scale.setScalar(Math.max(0.001, bk * 0.9));
      BOOKG.rotateX(0.55); BOOKG.userData.gl.material.opacity = 0.75 * bk * (0.85 + 0.15 * Math.sin(t * 2.4)); BOOKG.userData.gl.scale.setScalar(380 + 140 * bk); }
  } else { SACK.visible = false; BOOKG.visible = false; }
  // --- desert
  if (loc === 'DS') {
    const f = ACT.RB.fn(t), e = rise(t, 196, 211);
    ORB.visible = !!f; if (f) { ORB.position.set(f.x + 30 + 20 * Math.sin(t * 0.9), 330 + 18 * Math.sin(t * 1.7), f.z + 300 + 20 * Math.cos(t * 0.8)); ORB.userData.gl[0].material.opacity = 0.9; ORB.userData.gl[1].material.opacity = 0.5 + 0.1 * Math.sin(t * 2); }
    DS.userData.light.material.opacity = 0.0 + 0.7 * rise(t, 192, 205); DS.userData.light2.material.opacity = 0.35 * rise(t, 192, 205);
    smoke.forEach((m, i) => { const u = ((t * 0.04 + m.ph) % 1); m.s.position.set(m.x + 90 * Math.sin(t * 0.2 + m.ph), m.y + 160 * u, m.z); m.s.material.opacity = 0.34 * Math.sin(u * Math.PI); });
    const pk = rise(t, 194, 196), sp = PILLAR.userData.spark; PILLAR.visible = t >= 194;
    sp.userData.items.forEach((m, i) => { const d = m.userData, ph = (t * 0.45 + d.a * 3) % 1; m.visible = t >= 194; const ang = d.b * 6.283 + t * 0.3; m.position.set(Math.cos(ang) * (70 + d.c * 90), 30 + ph * 560 * (0.5 + d.d), Math.sin(ang) * (70 + d.c * 90));
      m.scale.setScalar((10 + 26 * d.d) * Math.max(0, Math.sin((ph + t * 1.3 * d.a) % 1 * Math.PI))); m.material.opacity = 1; m.quaternion.copy(cam.quaternion); m.rotateZ(t * (1 + d.a)); });
    sp.position.set(0, 0, 0); sp.visible = true; PILLAR.userData.gl[0].material.opacity = 0.25 + 0.15 * Math.sin(t * 2.6);
  } else { ORB.visible = false; }
  // --- sparkle veil at 212
  const vk = Math.max(0, 1 - Math.abs(t - 212) / 1.4);
  vSpark.visible = vk > 0.02;
  vSpark.userData.items.forEach((m, i) => { const d = m.userData, ph = (t * 0.6 + d.a * 3) % 1; m.visible = vk > 0.02; const q = new THREE.Vector3((d.b - 0.5) * 900, (d.c - 0.5) * 520, -900).applyQuaternion(cam.quaternion).add(cam.position);
    m.position.copy(q); m.scale.setScalar((16 + 34 * d.d) * vk * Math.sin(ph * Math.PI)); m.material.opacity = vk; m.quaternion.copy(cam.quaternion); m.rotateZ(t * (1 + d.a)); });
}
// tower step glow
const STEPGL = glow(TW, '#ffe27a', 200, [0, 0, 0], 0);
function applyActors(t) {
  for (const id in ACT) {
    const A = ACT[id], st = A.fn(t);
    if (!st) { A.h.visible = false; continue; }
    A.h.visible = true;
    if (A.prop) continue;
    A.h.position.set(st.x, st.y, st.z); A.h.rotation.set(0, st.yaw, st.slope); A.h.scale.setScalar(st.scale || 1);
    A.o.set(st.po);
  }
  const f = ACT.BO.fn(t);
  STEPGL.visible = !!f && t >= 20 && t < 38 && TW.visible; if (STEPGL.visible) { STEPGL.position.set(f.x, f.y + 8, f.z); STEPGL.material.opacity = 0.55 * rise(t, 20, 21.5) * (0.8 + 0.2 * Math.sin(t * 6)); }
}
