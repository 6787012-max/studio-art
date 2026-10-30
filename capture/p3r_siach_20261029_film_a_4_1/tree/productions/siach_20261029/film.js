/* siach_20261029 - 3D cel-shaded film, 247.3 s, 15 shots. Deterministic: every frame is a pure function of t.
   Worlds: TW tower+stairs, RD road+bus, HL study hall, HS rainy street, HI hill path, MS mist meadow, DS dusk desert.
   People only through people.js. No text, letters or digits anywhere. */
import { THREE, sm, cl, kf, D2R, part, ell, lathe, RoundedBoxGeometry } from '../../lib/toon3d/toon3d.js';
import { mergeGeometries } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import * as P from './people.js';
import * as PR from './props.js';
import { M, glow, box, bas } from './props.js';

export const DUR = 247.3;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture') || Q.get('hq') === '1');
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;

/* ------------------------------------------------------------------ renderer, scene, camera */
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.domElement.id = 'c'; document.getElementById('wrap').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, 16 / 9, 5, 40000);
const sky = PR.makeSky(); scene.add(sky);
function mkOverlay(order) {
  const mat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, uniforms: { uC: { value: new THREE.Color('#000') }, uA: { value: 0 } },
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: 'uniform vec3 uC; uniform float uA; void main(){ gl_FragColor = vec4(uC, uA); }' });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); m.frustumCulled = false; m.renderOrder = order; scene.add(m); return mat;
}
const ovMat = mkOverlay(10), disMat = mkOverlay(40);

/* ------------------------------------------------------------------ small utils */
const lerp = (a, b, u) => a + (b - a) * u;
const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const angMix = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rise = (t, a, b) => sm((t - a) / (b - a));
const pulse = (t, a, b, c, d) => rise(t, a, b) * (1 - rise(t, c, d));
const blink = (t, seed, per) => { per = per || 3.3; const u = ((t + seed * 1.37) % per + per) % per; return u < 0.13; };
const step = (t, list) => { let v = list[0][1]; for (const e of list) if (t >= e[0]) v = e; else break; return v; };
const colK = (t, keys) => { if (t <= keys[0][0]) return new THREE.Color(keys[0][1]); for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = sm((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return new THREE.Color(keys[i - 1][1]).lerp(new THREE.Color(keys[i][1]), u); } return new THREE.Color(keys[keys.length - 1][1]); };

/* ------------------------------------------------------------------ routes (walk by distance -> planted feet) */
const YAW = (dx, dz) => Math.atan2(-dz, dx);
function chain(t0, v, pts) {            // pts: [x, z, y, {wait, yaw}] -> keys with times from distances
  const keys = []; let t = t0;
  pts.forEach((p, i) => {
    if (i > 0) { const q = pts[i - 1]; t += Math.hypot(p[0] - q[0], p[1] - q[1], (p[2] || 0) - (q[2] || 0)) / v; }
    keys.push([t, p[0], p[1], p[2] || 0, p[3] && p[3].yaw]);
    if (p[3] && p[3].wait) { t += p[3].wait; keys.push([t, p[0], p[1], p[2] || 0, p[3].yaw2 != null ? p[3].yaw2 : p[3].yaw]); }
  });
  return keys;
}
function mkRoute(keys) {
  const K = keys.map(k => ({ t: k[0], x: k[1], z: k[2], y: k[3] || 0, yaw: k[4] })), n = K.length, seg = []; let cum = 0, yawPrev = K[0].yaw != null ? K[0].yaw : 0;
  for (let i = 0; i < n - 1; i++) {
    const a = K[i], b = K[i + 1], dx = b.x - a.x, dz = b.z - a.z, dy = b.y - a.y, hl = Math.hypot(dx, dz), len = Math.hypot(hl, dy), T = b.t - a.t, stand = len < 1e-6;
    seg.push({ a, b, dx, dz, dy, hl, len, T, stand, D0: cum, stand0: stand });
    cum += len;
  }
  seg.forEach((s, i) => {
    s.ei = i === 0 || seg[i - 1].stand; s.eo = i === n - 2 || seg[i + 1].stand;
    s.tin = s.ei ? Math.min(0.45, s.T / 3) : 0; s.tout = s.eo ? Math.min(0.45, s.T / 3) : 0;
    s.V = s.stand ? 0 : s.len / (s.T - (s.tin + s.tout) / 2);
    if (s.stand) s.yaw = s.a.yaw != null ? s.a.yaw : yawPrev; else s.yaw = YAW(s.dx, s.dz);
    if (s.b.yaw != null && s.stand) s.yaw = s.b.yaw;
    yawPrev = s.yaw;
    s.slope = s.stand ? 0 : Math.atan2(s.dy, s.hl || 1e-6);
  });
  const raw = t => {
    t = cl(t, K[0].t, K[n - 1].t); let i = seg.findIndex(s => t <= s.b.t); if (i < 0) i = n - 2; const s = seg[i], u = t - s.a.t;
    if (s.stand) return { x: s.a.x, y: s.a.y, z: s.a.z, d: s.D0, sp: 0, i, ks: 0, ka: 0, Ds: s.D0, De: s.D0 };
    let d, sp; const tin = s.tin, tout = s.tout, V = s.V;
    if (tin && u < tin) { d = V * u * u / (2 * tin); sp = V * u / tin; }
    else if (tout && u > s.T - tout) { const r = s.T - u; d = s.len - V * r * r / (2 * tout); sp = V * r / tout; }
    else { d = tin ? V * tin / 2 + V * (u - tin) : V * u; sp = V; }
    const f = d / s.len, ks = s.tout && u > s.T - s.tout ? sm((u - (s.T - s.tout)) / s.tout) : 0, ka = s.tin && u < s.tin ? 1 - sm(u / s.tin) : 0;
    return { x: s.a.x + s.dx * f, y: s.a.y + s.dy * f, z: s.a.z + s.dz * f, d: s.D0 + d, sp: sp / Math.max(V, 1e-6), i, ks, ka, Ds: s.D0, De: s.D0 + s.len };
  };
  const yawAt = t => {
    const w = 0.4; let best = null;
    for (let i = 0; i < n - 2; i++) { const bt = seg[i].b.t; if (Math.abs(t - bt) < w) { best = [i, bt]; break; } }
    const r = raw(t);
    if (best) { const [i, bt] = best; return angMix(seg[i].yaw, seg[i + 1].yaw, sm((t - (bt - w)) / (2 * w))); }
    return seg[r.i].yaw;
  };
  return {
    t0: K[0].t, t1: K[n - 1].t,
    at(t) {
      const a = raw(t - 0.2), b = raw(t), c = raw(t + 0.2);
      const x = (a.x + 2 * b.x + c.x) / 4, y = (a.y + 2 * b.y + c.y) / 4, z = (a.z + 2 * b.z + c.z) / 4;
      const i = seg[b.i], moving = !i.stand && b.sp > 0.02, sl = (() => { const w = 0.3; const sA = seg[raw(t - w).i].slope, sB = seg[raw(t + w).i].slope; return (sA + sB) / 2; })();
      return { x, y, z, yaw: yawAt(t), walk: moving ? cl(b.sp * 3, 0.0, 1) : 0, D: b.d, slope: sl, ks: b.ks, ka: b.ka, Ds: b.Ds, De: b.De };
    },
  };
}

// walk phase: distance based (feet planted); within the ease-in / ease-out the phase is nudged so the stride rests on a half cycle (both feet planted) at every start and stop
const PH = (r, cyc) => { let ph = r.D / cyc; if (r.ks) ph += (Math.round(2 * r.De / cyc) / 2 - r.De / cyc) * r.ks; if (r.ka) ph += (Math.round(2 * r.Ds / cyc) / 2 - r.Ds / cyc) * r.ka; return ph; };
const faceOf = (expr, t, seed, o) => Object.assign({ expr, blink: blink(t, seed) }, o || {});
const TALK = 'AEXOAMEAXU_OAEXA_MEAOX_AEXA';
const talkAt = (t, a, b) => { if (t < a || t > b) return null; const c = TALK[Math.floor((t - a) / 0.12) % TALK.length]; return c === '_' ? null : c; };

/* ------------------------------------------------------------------ actors (created first: the stairs depend on the bochur stride) */
const ACT = {};
function addPerson(id, mk) { const o = mk(); const h = new THREE.Group(); h.rotation.order = 'YZX'; h.add(o.root); scene.add(h); ACT[id] = { o, h, cycle: o.cycle, fn: () => null, person: true }; return ACT[id]; }
function addProp(id, group) { ACT[id] = { h: group, fn: () => null, prop: true }; return ACT[id]; }
addPerson('BO', P.makeBochur); addPerson('M', P.makeMan); addPerson('RA', P.makeRabbiA); addPerson('RB', P.makeRabbiB);
for (let i = 1; i <= 5; i++) addPerson('B' + i, P.makeBoy);
// Lot: recolour the coat of rabbi B to sand, the hat to a cream head cloth
{
  const D = window.K.P_D.rabbiB, tgt = [[D.coat, '#CDB68A'], [D.coatHi, '#e0d0a4'], [D.hat, '#efe4c8'], [D.band, '#a8884e'], [D.pants, '#b79f70']];
  ACT.RB.o.root.traverse(o => { const m = o.material; if (!m || !m.uniforms || !m.uniforms.uColor) return; const c = '#' + m.uniforms.uColor.value.getHexString();
    for (const [from, to] of tgt) if (from && c.toLowerCase() === from.toLowerCase()) { m.uniforms.uColor.value.set(to); break; } });
}
const BOC = ACT.BO.cycle, TREAD = BOC / 2;

/* ------------------------------------------------------------------ small builders */
const hexM = (h, t) => M(h, t);
function hill(g, x, z, rx, ry, rz, mat, ow) { return part(g, ell(rx, ry, rz, 28, 14), mat, ow == null ? 8 : ow, [x, -ry * 0.3, z]); }
function tree(g, x, z, s, y, leaf) {
  const g0 = new THREE.Group(); g0.position.set(x, y || 0, z); g0.scale.setScalar(s); g.add(g0);
  part(g0, new THREE.CylinderGeometry(18, 26, 170, 12).translate(0, 85, 0), M('#8a5a3a'), 4);
  for (const [a, b, c2, r] of [[0, 250, 0, 95], [-60, 215, 30, 70], [62, 220, -20, 74], [10, 300, -10, 70]]) part(g0, ell(r, r * 0.92, r, 14, 10), M(leaf || '#5fae4e'), 4, [a, b, c2]);
  if (g.userData.items) g.userData.items.push({ o: g0, x, z, k: 't' });
  return g0;
}
function house(g, x, z, w, h, d, c, roof, ry) {
  const h0 = new THREE.Group(); h0.position.set(x, 0, z); h0.rotation.y = ry || 0; g.add(h0);
  box(h0, w, h, d, M(c), [0, h / 2, 0], 3.4, null, 5);
  const rs = new THREE.Shape(); rs.moveTo(-d / 2 - 20, 0); rs.lineTo(d / 2 + 20, 0); rs.lineTo(0, d * 0.4); rs.lineTo(-d / 2 - 20, 0);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: w + 40, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-(w + 40) / 2, h, 0); part(h0, rg, M(roof || '#b8553c', '#8a6a78'), 3);
  for (const s of [-1, 1]) box(h0, w * 0.2, h * 0.24, 8, bas('#ffd88a'), [s * w * 0.27, h * 0.58, d / 2 + 2], 2, null, 2);
  box(h0, w * 0.16, h * 0.42, 8, M('#8f5d33'), [0, h * 0.21, d / 2 + 2], 2, null, 2);
  if (g.userData.items) g.userData.items.push({ o: h0, x, z, k: 'h' });
  return h0;
}
function ribbon(pts, w, mat, ow) {            // pts [[x,y,z]...] -> flat strip
  const n = pts.length, pos = new Float32Array(n * 6), idx = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], tz = b[2] - a[2]; const L = Math.hypot(tx, tz) || 1; tx /= L; tz /= L;
    const nx = -tz * w / 2, nz = tx * w / 2, p = pts[i];
    pos.set([p[0] + nx, p[1], p[2] + nz, p[0] - nx, p[1], p[2] - nz], i * 6);
    if (i < n - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; return m;
}
const mulb = PR.mulberry;
const soft = (parent, hex, size, pos, op, normal) => { const s = glow(parent, hex, size, pos, op); if (normal) { s.material.blending = THREE.NormalBlending; } return s; };

/* ------------------------------------------------------------------ WORLD TW: tall stone building with an outside zigzag staircase */
const TW = new THREE.Group(); scene.add(TW);
const FLOORS = 10, NST = 13, RISE = 24, FH = NST * RISE, XR = NST * TREAD / 2, ZA = 110, ZB = 250, BW = 1300;
const levelY = (L, S) => L <= 2 ? L * FH : 2 * FH + (L - 2) * FH * S;
const FL = [], LAMPS = [];
const LAMPC = ['#ff5a6a', '#ff9a3a', '#5acd6a', '#4aa8f0', '#b070e8', '#f0d03a'];
{
  const mWallA = M('#f5e6c2', '#cdb48e'), mWallB = M('#f0deb4', '#c8ae88'), mBand = M('#d9ae72', '#a98a74'), mTread = M('#f7dc92', '#c9a96a'), mRiser = M('#e38d5a', '#a8684a'),
    mStr = M('#c4b08e', '#8f7d68'), mRail = M('#8a5a36', '#6b4a3a'), mWin = bas('#ffdc90'), mFrame = M('#9a6a42', '#7a5a46');
  // ground, plaza, surroundings
  part(TW, new THREE.BoxGeometry(9000, 20, 7000).translate(0, -10, 1200), M('#e2cfa4', '#bfa98a'), 0);
  part(TW, new THREE.CylinderGeometry(22000, 22000, 20, 40).translate(0, -30, 0), M('#9ad070', '#c9d8b0'), 0);
  for (const [x, z, rx, ry, rz, c] of [[-3600, -5200, 3400, 1400, 1400, '#8fcf68'], [3200, -6200, 3800, 1800, 1500, '#78bd58'], [-9000, -3000, 3000, 1100, 1500, '#9bd673'], [8200, -2500, 3200, 1200, 1500, '#86c862'], [0, -9000, 5200, 2300, 1800, '#7ec05e'], [-6500, 4500, 3000, 900, 1200, '#92d06a'], [7000, 5000, 3000, 900, 1200, '#8ccb66']])
    hill(TW, x, z, rx, ry, rz, M(c, '#c8d6c0'), 12);
  house(TW, -1900, -200, 600, 300, 420, '#ead9b0', '#b8553c', 0); house(TW, 1950, -150, 640, 340, 420, '#f0e0b8', '#c0603f', 0);
  house(TW, -3100, 600, 520, 280, 400, '#e6d3a8', '#a8503a', 0.3); house(TW, 3200, 700, 560, 300, 400, '#ecd9ae', '#b45a3c', -0.3);
  tree(TW, -1300, 900, 1.5); tree(TW, 1350, 950, 1.6); tree(TW, -2500, 1400, 1.3, 0, '#79bd54'); tree(TW, 2600, 1500, 1.4, 0, '#79bd54'); tree(TW, -800, 1900, 1.1); tree(TW, 900, 2100, 1.2);
  tree(TW, -4200, 1800, 1.6); tree(TW, 4300, 1900, 1.7); tree(TW, -5200, 400, 1.8); tree(TW, 5400, 300, 1.7);
  // planter bushes at the foot
  for (const x of [-600, -400, 420, 640]) part(TW, ell(55, 42, 55, 14, 10), M('#5fae4e'), 3, [x, 20, 420]);
  for (let f = 0; f < FLOORS; f++) {
    const g = new THREE.Group(); TW.add(g); FL.push(g);
    box(g, BW, FH, 700, f % 2 ? mWallB : mWallA, [0, FH / 2, -350], 3.2, null, 4);
    box(g, BW + 60, 18, 760, mBand, [0, FH - 9, -340], 2.6, null, 3);
    for (let i = 0; i < 4; i++) { const wx = -495 + i * 330; box(g, 124, 170, 12, mFrame, [wx, FH * 0.58, 6], 2, null, 3); box(g, 98, 144, 8, mWin, [wx, FH * 0.58, 10], 0, null, 2); box(g, 140, 12, 30, mBand, [wx, FH * 0.58 - 90, 18], 1.6, null, 2); }
    const d = f % 2 === 0 ? 1 : -1, xs = d > 0 ? -XR : XR, z = f % 2 === 0 ? ZA : ZB, run = NST * TREAD, ang = Math.atan2(NST * RISE, run), Ls = Math.hypot(run, NST * RISE);
    const tr = [], ri = [], rl = [];
    for (let k = 1; k <= NST; k++) {
      tr.push(new RoundedBoxGeometry(TREAD + 1, 9, 150, 2, 2).translate(xs + d * (k - 0.5) * TREAD, k * RISE - 4.5, z));
      ri.push(new RoundedBoxGeometry(6, RISE, 146, 2, 2).translate(xs + d * (k - 1) * TREAD, (k - 0.5) * RISE, z));
      if (k % 3 === 1) rl.push(new THREE.BoxGeometry(6, 96, 6).translate(xs + d * (k - 0.5) * TREAD, k * RISE + 48, z + 78));
    }
    rl.push(new THREE.BoxGeometry(Ls, 7, 7).rotateZ(d > 0 ? ang : -ang).translate(xs + d * run / 2, NST * RISE / 2 + 96, z + 78));
    part(g, mergeGeometries(tr), mTread, 1.6); part(g, mergeGeometries(ri), mRiser, 1.2);
    part(g, new THREE.BoxGeometry(Ls, 18, 120).rotateZ(d > 0 ? ang : -ang).translate(xs + d * run / 2, NST * RISE / 2 - 14, z), mStr, 0);
    part(g, mergeGeometries(rl), mRail, 0.8);
    const xe = xs + d * run;
    box(g, 210, 14, 300, mStr, [xe + d * 105, FH - 7, 185], 2, null, 2);                 // landing at level f+1
    box(g, 14, FH, 14, mStr, [xe + d * 200, FH / 2, 320], 1.6, null, 2);                  // support post
    box(g, 12, 70, 300, mRail, [xe + d * 205, FH + 35, 185], 1.4, null, 1);               // landing end rail
    LAMPS[f + 1] = { x: xe + d * 190, z: 318 };
  }
  LAMPS[0] = { x: -XR - 190, z: 318 };
  LAMPS.forEach((p, L) => {
    const g = new THREE.Group(); TW.add(g); p.g = g; g.position.x = p.x; g.position.z = p.z;
    part(g, new THREE.CylinderGeometry(5, 7, 130, 10).translate(0, 65, 0), M('#3b2c22'), 1.6);
    p.mat = new THREE.MeshBasicMaterial({ color: LAMPC[L % 6] }); part(g, new THREE.SphereGeometry(30, 18, 12).translate(0, 160, 0), p.mat, 2.2);
    p.gl = glow(g, LAMPC[L % 6], 230, [0, 160, 0], 0.55); p.base = new THREE.Color(LAMPC[L % 6]);
  });
  // roof
  const RF = new THREE.Group(); TW.add(RF); FL.roof = RF;
  box(RF, BW + 90, 30, 790, mBand, [0, 15, -340], 2.6, null, 4); box(RF, 200, 160, 200, mWallA, [-300, 110, -350], 2.6, null, 4);
  part(RF, new THREE.CylinderGeometry(70, 80, 150, 16).translate(0, 75, 0), M('#9a7a5a'), 3, [260, 30, -330]); part(RF, new THREE.ConeGeometry(86, 70, 16).translate(0, 35, 0), M('#b8553c'), 3, [260, 180, -330]);
  part(RF, new THREE.CylinderGeometry(4, 4, 260, 6).translate(0, 130, 0), M('#3b2c22'), 1, [-300, 190, -350]);
}
const GOLD = new THREE.Color('#ffd23a');

/* ------------------------------------------------------------------ WORLD RD: hills, winding road, town, minibus */
const RD = new THREE.Group(); scene.add(RD); RD.userData.items = [];
const roadZ = s => 700 * Math.sin(s / 1500) + 260 * Math.sin(s / 620);
const roadAt = s => { const e = 2; return { x: s, z: roadZ(s), yaw: Math.atan2(-(roadZ(s + e) - roadZ(s - e)), 2 * e) }; };
const RS0 = -1500, RSTEP = 40, RN = 360;
const roadPts = []; for (let i = 0; i < RN; i++) { const s = RS0 + i * RSTEP; roadPts.push([s, 3, roadZ(s)]); }
const goldMat = new THREE.MeshBasicMaterial({ color: '#ffc830', side: THREE.DoubleSide }), goldSoftMat = new THREE.MeshBasicMaterial({ color: '#ffe38a', transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
let goldLine, goldSoft, goldHead, wheelsRD = [], busG;
{
  part(RD, new THREE.CylinderGeometry(26000, 26000, 20, 40).translate(6000, -14, 0), M('#8fd06a', '#c9d8b0'), 0);
  const r1 = ribbon(roadPts, 230, M('#8e8b9c', '#6f6c80'), 0); r1.position.y = 0; RD.add(r1);
  const r2 = ribbon(roadPts.map(p => [p[0], 4.5, p[2]]), 250, M('#f1ead6', '#cfc8b6'), 0); r2.scale.set(1, 1, 1); r2.position.y = -2.5; RD.add(r2);
  const dg = []; for (let i = 0; i < RN - 1; i += 2) { const a = roadAt(RS0 + i * RSTEP); dg.push(new THREE.BoxGeometry(46, 2, 10).rotateY(a.yaw).translate(a.x, 5.5, a.z)); }
  part(RD, mergeGeometries(dg), bas('#fff7de'), 0);
  goldLine = ribbon(roadPts.map(p => [p[0], 9, p[2]]), 120, goldMat, 0); RD.add(goldLine);
  goldSoft = ribbon(roadPts.map(p => [p[0], 8, p[2]]), 340, goldSoftMat, 0); goldSoft.renderOrder = 20; RD.add(goldSoft);
  goldHead = glow(RD, '#ffe08a', 900, [0, 120, 0], 0.7);
  const rnd = mulb(41), hc = ['#8fcf68', '#78bd58', '#9bd673', '#86c862'];
  for (let i = 0; i < 46; i++) {
    const s = -1800 + i * 300 + rnd() * 120, side = i % 2 ? 1 : -1, off = side * (2300 + rnd() * 2600);
    hill(RD, s, roadZ(s) + off, 600 + rnd() * 700, 220 + rnd() * 420, 520 + rnd() * 300, M(hc[i % 4], '#c8d6c0'), 12);
  }
  for (let i = 0; i < 60; i++) { const s = -1500 + i * 230 + rnd() * 100, side = rnd() < 0.5 ? 1 : -1; tree(RD, s, roadZ(s) + side * (420 + rnd() * 900), 1.0 + rnd() * 0.8, 0, rnd() < 0.5 ? '#5fae4e' : '#79bd54'); }
  for (const s of [-900, 4000, 7000, 9800]) for (let j = 0; j < 2; j++) hill(RD, s + j * 900, roadZ(s) + (j ? 5200 : -5600), 2600, 1400, 1500, M('#86c862', '#c8d6c0'), 14);
  // the town (behind the bus)
  const hs = [[-300, -620, 560, 330, 400, '#ecdcb4', '#b8553c'], [250, 640, 600, 380, 420, '#f2e2ba', '#c0603f'], [700, -700, 540, 300, 400, '#e4d2a6', '#a8503a'], [1150, 560, 620, 360, 420, '#efdfb7', '#b45a3c'],
    [1600, -620, 560, 420, 420, '#f0e0b8', '#b8553c'], [2050, 680, 600, 320, 400, '#e8d6ac', '#c0603f'], [2400, -580, 520, 300, 400, '#ecdcb4', '#a8503a'], [-800, 700, 520, 280, 380, '#ead8ae', '#b45a3c'],
    [900, -1300, 640, 400, 420, '#f2e2ba', '#c0603f'], [1700, 1300, 640, 360, 420, '#efdfb7', '#b8553c']];
  for (const [s, off, w, h, d, c, r] of hs) house(RD, s, roadZ(s) + off, w, h, d, c, r, off < 0 ? 0 : Math.PI);
  // minibus (faces +x, open sided so the children can be seen)
  busG = new THREE.Group(); RD.add(busG);
  const white = M('#fbfbf6', '#c9cad8'), blue = M('#3b8fd9', '#2a6aa8'), glassM = new THREE.MeshBasicMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
  box(busG, 640, 20, 250, M('#ced2dc'), [0, 50, 0], 2.4, null, 3);
  for (const s of [-1, 1]) { box(busG, 640, 72, 10, white, [0, 100, s * 120], 2.8, null, 3); box(busG, 640, 14, 12, blue, [0, 84, s * 121.5], 0, null, 1); }
  box(busG, 10, 72, 250, white, [-315, 100, 0], 2.8, null, 3);
  box(busG, 680, 16, 280, white, [10, 296, 0], 2.8, null, 5); box(busG, 680, 8, 282, blue, [10, 286, 0], 0, null, 2);
  for (const x of [-305, 300]) for (const s of [-1, 1]) box(busG, 12, 160, 12, white, [x, 210, s * 122], 2, null, 2);
  box(busG, 100, 86, 250, white, [372, 105, 0], 2.8, null, 5); box(busG, 8, 40, 200, bas('#bfe6ff'), [424, 120, 0], 1.2, null, 1);
  for (const s of [-1, 1]) part(busG, ell(14, 14, 8, 10, 8), bas('#fff2a8'), 1.2, [422, 90, s * 80]);
  const wg = new THREE.Mesh(new THREE.PlaneGeometry(250, 150), glassM); wg.rotation.y = Math.PI / 2; wg.position.set(336, 220, 0); busG.add(wg);
  for (const x of [-210, 230]) for (const s of [-1, 1]) {
    const wh = new THREE.Group(); wh.position.set(x, 52, s * 130); busG.add(wh); wheelsRD.push(wh);
    part(wh, new THREE.CylinderGeometry(52, 52, 36, 24).rotateX(Math.PI / 2), M('#2d2d36', '#55556a'), 2.4); part(wh, new THREE.CylinderGeometry(26, 26, 40, 14).rotateX(Math.PI / 2), M('#cfd2dc'), 1.4);
    box(wh, 14, 80, 42, M('#cfd2dc'), [0, 0, 0], 1, null, 1);
  }
  const seat = M('#e8a33c', '#a8702a');
  for (const [x, hy] of [[150, 0], [30, 0], [-90, 0], [-210, 0]]) for (const s of [-1, 1]) {
    box(busG, 72, hy ? 0 : 46, 104, seat, [x, 83, s * 62], 2, null, 3); box(busG, 12, 100, 104, seat, [x - 34, 120, s * 62], 2, null, 3);
  }
  box(busG, 70, 70, 100, seat, [150, 95, 62], 2, null, 3);
}
const SIT = 48;
// bus distance along the road: speed profile integrated once
const busTab = (() => { const a = [], dt = 0.05; let s = 600; for (let t = 0; t <= 247.4; t += dt) { a.push(s);
  const v = t < 56.6 ? 0 : (t < 90 ? 172 + (56 - 172) * sm((t - 73.5) / 2.5) : 56 + 430 * sm((t - 89.5) / 7.5)); s += v * dt; } return a; })();
const busS = t => { const u = cl(t, 0, 247.3) / 0.05, i = Math.floor(u), f = u - i; return busTab[i] + ((busTab[Math.min(i + 1, busTab.length - 1)] - busTab[i]) * f); };
const busPose = t => { const s = busS(t), r = roadAt(s); return { s, x: r.x, z: r.z, yaw: r.yaw }; };
const busLocal = (t, lx, ly, lz) => { const b = busPose(t), c = Math.cos(b.yaw), sn = Math.sin(b.yaw); return [b.x + lx * c + lz * sn, ly, b.z - lx * sn + lz * c]; };


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

function hermite(keys) {
  const n = keys.length, T = keys.map(k => k[0]);
  return t => {
    t = cl(t, T[0], T[n - 1]); let i = 0; while (i < n - 2 && t > T[i + 1]) i++;
    const a = keys[i], b = keys[i + 1], dt = b[0] - a[0], u = (t - a[0]) / dt;
    const prev = keys[Math.max(0, i - 1)], next = keys[Math.min(n - 1, i + 2)];
    const out = { p: [0, 0, 0], l: [0, 0, 0], fov: 30, roll: 0 };
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    const ch = (A, B, P, N, tin0, tout0) => {
      const m0 = i === 0 ? 0 : (B - P) / (b[0] - prev[0]) * dt * 1, m1 = i + 1 === n - 1 ? 0 : (N - A) / (next[0] - a[0]) * dt * 1;
      return h00 * A + h10 * m0 + h01 * B + h11 * m1;
    };
    for (let k = 0; k < 3; k++) { out.p[k] = ch(a[1][k], b[1][k], prev[1][k], next[1][k]); out.l[k] = ch(a[2][k], b[2][k], prev[2][k], next[2][k]); }
    out.fov = ch(a[3] || 30, b[3] || 30, prev[3] || 30, next[3] || 30);
    return out;
  };
}

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


/* ------------------------------------------------------------------ render + contract */
let cur_t = 0;
function frame(t) {
  t = cl(t, 0, DUR); cur_t = t;
  const s = shotAt(t);
  applyEnv(t); applyActors(t);
  const c = s.cam(t);
  cam.fov = c.fov || 30; cam.updateProjectionMatrix(); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
  cam.updateMatrixWorld(true);
  sky.position.copy(cam.position);
  renderer.render(scene, cam);
}
async function warm() {
  const seen = new Set(); const jobs = [];
  for (let k = 0; k <= DUR * 30; k++) {
    const t = k / 30; cur_t = t;
    for (const id in ACT) { const A = ACT[id]; if (!A.person) continue; let st; try { st = A.fn(t); } catch (e) { continue; } if (!st || !st.po.face) continue; const key = id + JSON.stringify(st.po.face); if (seen.has(key)) continue; seen.add(key); jobs.push([A, st.po.face]); }
  }
  for (const [A, f] of jobs) await (A.o.warm ? A.o.warm(f) : A.o.face.set(f));
  return jobs.length;
}
window.__ACT = ACT; window.__dur = DUR; window.__HQ = HQ; window.__errors = [];
window.__shots = SHOTS.map(s => ({ id: s.id, index: s.index, start: s.start, dur: s.dur, end: s.end, wide: !!s.wide }));
window.__caption = () => null;
const _box = new THREE.Box3(), _pv = new THREE.Vector3();
window.__heroBox = t => {
  const s = shotAt(t); cur_t = t; const ids = s.hero || []; let n = 0;
  _box.makeEmpty();
  for (const id of ids) { const A = ACT[id]; if (A && A.h.visible) { A.h.updateMatrixWorld(true); _box.expandByObject(A.h); n++; } }
  if (!n || _box.isEmpty()) return null;
  const mn = [1e9, 1e9], mx = [-1e9, -1e9]; let behind = true;
  for (const x of [_box.min.x, _box.max.x]) for (const y of [_box.min.y, _box.max.y]) for (const z of [_box.min.z, _box.max.z]) {
    _pv.set(x, y, z).project(cam); const cz = _pv.z; if (cz < 1) behind = false;
    mn[0] = Math.min(mn[0], _pv.x); mn[1] = Math.min(mn[1], _pv.y); mx[0] = Math.max(mx[0], _pv.x); mx[1] = Math.max(mx[1], _pv.y);
  }
  const vis = !behind && mx[0] > -1 && mn[0] < 1 && mx[1] > -1 && mn[1] < 1;
  return { visible: vis, behindCamera: behind, heightFrac: (mx[1] - mn[1]) / 2, bottomFrac: (1 - (mn[1] + 1) / 2), box: [mn, mx] };
};
window.__sceneHash = () => { let h = 0; scene.traverse(o => { if (o.visible !== false) { const e = o.matrixWorld.elements; h = (h * 31 + Math.round(e[12] * 10) + Math.round(e[13] * 10) * 7 + Math.round(e[14] * 10) * 13 + Math.round(e[0] * 100) * 3) | 0; } }); return h + '|' + cam.position.x.toFixed(2) + '|' + cam.position.y.toFixed(2); };
const _OFF = window.__T0 || 0;
window.__seek = t => { try { frame(Math.max(0, +t || 0) + _OFF); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

(async () => {
  try {
    if (Q.has('nowarm')) { window.__nwarm = 0; } else window.__nwarm = await warm();
    frame(Q.has('t') ? +Q.get('t') : 0);
    window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
})();
