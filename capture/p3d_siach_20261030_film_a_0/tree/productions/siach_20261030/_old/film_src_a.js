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

//@@UTILS@@
//@@FACE@@

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
