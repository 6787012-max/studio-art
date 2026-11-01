/* siach_20261028 - 3D cel-shaded film, 240.9 s, 16 shots. Deterministic: every frame is a pure function of t.
   Worlds: DS desert path + lone mountain, SM summit + altar, HL study hall, HM home (interior + exterior).
   People only through people.js. No text, letters or digits anywhere. */
import { THREE, sm, cl, kf, D2R, part, ell, lathe, tube, tubeAlong, V, toon, RoundedBoxGeometry } from '../../lib/toon3d/toon3d.js';
import { CAST } from '../../lib/toon3d/cast.js';
import { mergeGeometries } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import * as P from './people.js';
import * as PR from './props.js';
import { M, glow, box, bas, WOOD, WOOD2, WOODD, STONE, STONE2 } from './props.js';

export const DUR = 240.9;
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

/* ------------------------------------------------------------------ actors */
const ACT = {};
function addPerson(id, mk) { const o = mk(); const h = new THREE.Group(); h.rotation.order = 'YZX'; h.add(o.root); scene.add(h); ACT[id] = { o, h, cycle: o.cycle, fn: () => null, person: true }; return ACT[id]; }
function addAnimal(id, kind) { const o = CAST[kind](); const h = new THREE.Group(); h.rotation.order = 'YZX'; h.add(o.root); scene.add(h); ACT[id] = { o, h, cycle: o.cycle, fn: () => null, anim: true }; return ACT[id]; }
function addProp(id, group) { ACT[id] = { h: group, fn: () => null, prop: true }; return ACT[id]; }
addPerson('S', P.makeMan); addPerson('F', P.makeRabbiB); addPerson('RA', P.makeRabbiA); addPerson('BO', P.makeBochur); addPerson('HD', P.makeMan);
for (let i = 1; i <= 4; i++) addPerson('C' + i, P.makeBochur);
addAnimal('DK', 'donkey'); addAnimal('RM', 'sheep');
// the ram: darker wool + curled horns
{
  const wool = new THREE.Color('#f6f1e6');
  ACT.RM.o.root.traverse(o => { const m = o.material; if (!m || !m.uniforms || !m.uniforms.uColor) return; if (Math.abs(m.uniforms.uColor.value.r - wool.r) < 0.02 && Math.abs(m.uniforms.uColor.value.g - wool.g) < 0.02) m.uniforms.uColor.value.set('#a58a6e'); });
  const hornM = toon('#7a5a38', { tint: '#a08a7a', hi: 0 });
  for (const s of [1, -1]) {
    const pts = [V(2, 56, s * 20), V(-14, 74, s * 32), V(-40, 72, s * 44), V(-52, 50, s * 46), V(-38, 34, s * 42), V(-22, 40, s * 40)];
    part(ACT.RM.o.head, tubeAlong(pts, t => 9 - 5.5 * t, { segs: 32, radial: 10 }), hornM, 2.2);
  }
}
// the home father: warmer brown coat so he is not the same man as the son
{
  const D = window.K.MAN, tgt = [[D.coat, '#6a5546'], [D.coatT, '#b8a090'], [D.coatHi, '#8a7260'], [D.coatFar, '#4e3e32']];
  ACT.HD.o.root.traverse(o => { const m = o.material; if (!m || !m.uniforms || !m.uniforms.uColor) return; const c = '#' + m.uniforms.uColor.value.getHexString();
    for (const [from, to] of tgt) if (from && c.toLowerCase() === from.toLowerCase()) { m.uniforms.uColor.value.set(to); break; } });
}

/* ------------------------------------------------------------------ small builders */
function tree(g, x, y, z, s, leaf) {                       // flat-topped desert tree
  const g0 = new THREE.Group(); g0.position.set(x, y, z); g0.scale.setScalar(s); g.add(g0);
  part(g0, new THREE.CylinderGeometry(14, 22, 190, 10).translate(0, 95, 0), M('#8a5a3a'), 4);
  for (const [a, b, c2, r, ry] of [[0, 230, 0, 120, 40], [-80, 200, 30, 80, 32], [84, 206, -24, 86, 34]]) part(g0, ell(r, ry, r * 0.9, 14, 8), M(leaf || '#8fae4e', '#b8c08a', 0), 4, [a, b, c2]);
  return g0;
}
function ribbon(pts, w, mat) {            // pts [[x,y,z]...] -> flat strip
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
const mkMesh = (geo, mat, parent, pos) => { const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (parent) parent.add(m); return m; };
const SPH = new THREE.SphereGeometry(1, 8, 6);
const cc = h => new THREE.Color(h);

/* ------------------------------------------------------------------ WORLD DS: golden desert hills, the path, the lone mountain */
const MC = [7800, -2600], MR = 5600, MH = 4000;
const pz = x => -100 + 240 * Math.sin(x / 1100);
const py = x => 260 * sm((x - 100) / 1400) + 520 * sm((x - 1700) / 2600);
function hillsF(x, z) {
  const far = 1 + 2.4 * sm((-z - 500) / 3000);
  return far * (120 * Math.sin(x / 1500 + 0.7) * Math.sin(z / 1300 + 0.2) + 60 * Math.sin(x / 640 + z / 880) + 40 * Math.sin(x / 310 - z / 270)) + py(x);
}
function mtn(x, z) {
  const dx = (x - MC[0]) * 0.85, dz = z - MC[1], r = Math.sqrt(dx * dx + dz * dz + 160 * 160), a = Math.atan2(dz, dx), k = Math.max(0, 1 - r / MR);
  return MH * Math.pow(k, 1.7) * (1 + 0.1 * Math.sin(6 * a + r / 500) + 0.05 * Math.sin(11 * a - r / 300));
}
function terr(x, z) { const d = Math.abs(z - pz(x)), w = sm((d - 220) / 520); return lerp(py(x), hillsF(x, z) + mtn(x, z), w); }
const DS = new THREE.Group(); scene.add(DS);
const SUMMIT = [MC[0], terr(MC[0], MC[1]), MC[1]];
{
  const axis = (a, b, c0, c1, m0, m1, mf) => { const o = []; let v = a; while (v < b) { o.push(v); const d = v < m0 ? m0 - v : v > m1 ? v - m1 : 0; v += (v > c0 && v < c1) ? 150 : Math.min(1400, mf + d * 0.2); } o.push(b); return o; };
  const xs = axis(-14000, 24000, -4200, 4600, -4200, 12500, 330), zs = axis(-24000, 16000, -1500, 1500, -7000, 9500, 330);
  const nx = xs.length, nz = zs.length, pos = new Float32Array(nx * nz * 3), colr = new Float32Array(nx * nz * 3), idx = [];
  const nse = (x, z) => 0.5 + 0.25 * Math.sin(x / 210 + z / 330) + 0.25 * Math.sin(x / 97 - z / 140 + 1.3);
  const cA = cc('#efca82'), cB = cc('#e3b86c'), cD = cc('#cdbb6a'), cR = cc('#c3895a'), cR2 = cc('#a96f48'), cT = cc('#ecd2a8'), tmp = new THREE.Color();
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const x = xs[i], z = zs[j], y = terr(x, z), k = (j * nx + i) * 3; pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
    const sx = (terr(x + 80, z) - terr(x - 80, z)) / 160, sz = (terr(x, z + 80) - terr(x, z - 80)) / 160, sl = Math.hypot(sx, sz);
    tmp.copy(cA).lerp(cB, cl(nse(x, z), 0, 1)); tmp.lerp(cD, 0.55 * sm((nse(x * 1.7, z * 1.3 + 90) - 0.62) / 0.25));
    const rk = sm((sl - 0.22) / 0.3); tmp.lerp(cR, rk); tmp.lerp(cR2, sm((y - 1200) / 1600) * 0.8); tmp.lerp(cT, sm((y - 2700) / 500) * 0.8);
    colr[k] = tmp.r; colr[k + 1] = tmp.g; colr[k + 2] = tmp.b;
  }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const tm = toon('#ffffff', { tint: '#c79a84', hi: 0, vc: true }); tm.side = THREE.DoubleSide;
  const ter = new THREE.Mesh(geo, tm); ter.frustumCulled = false; DS.add(ter);
  // the path
  const pts = []; for (let x = -3400; x <= 4400; x += 100) pts.push([x, py(x) + 5, pz(x)]);
  const pm = toon('#f8e2ae', { tint: '#dcbf90', hi: 0 }); pm.side = THREE.DoubleSide;
  DS.add(ribbon(pts, 240, pm));
  const pm2 = toon('#e9cd96', { tint: '#c9a97c', hi: 0 }); pm2.side = THREE.DoubleSide;
  const pr = []; for (let x = -3400; x <= 4400; x += 100) pr.push([x, py(x) + 6.5, pz(x) + 22]); DS.add(ribbon(pr, 26, pm2));
  const pr2 = []; for (let x = -3400; x <= 4400; x += 100) pr2.push([x, py(x) + 6.5, pz(x) - 40]); DS.add(ribbon(pr2, 26, pm2));
  // shrubs, rocks and a few trees (seeded)
  const rnd = mulb(41), shrubs = [M('#a9a652', '#c8c490', 0), M('#8fae4e', '#b8c88a', 0), M('#c4a64e', '#d8c490', 0)], rocks = [M('#d7c1a0', '#b09a8c'), M('#c4a37c', '#a68a84')];
  let n = 0;
  while (n < 230) {
    const x = -4200 + rnd() * 8400, z = -3600 + rnd() * 5600; if (Math.abs(z - pz(x)) < 330) continue; if (x > -900 && x < 1900 && z > pz(x) + 330 && z < pz(x) + 1450) continue; n++;
    const y = terr(x, z), kind = rnd(), s = 0.7 + rnd() * 1.1;
    if (kind < 0.42) { const sh = shrubs[Math.floor(rnd() * 3)]; part(DS, ell(70 * s, 38 * s, 62 * s, 10, 7), sh, 3, [x, y + 14 * s, z]); part(DS, ell(46 * s, 28 * s, 42 * s, 9, 6), sh, 2.5, [x + 44 * s, y + 8 * s, z + 20 * s]); }
    else if (kind < 0.88) { part(DS, ell(60 * s, 40 * s, 52 * s, 9, 6), rocks[n % 2], 3, [x, y + 14 * s, z], [0, rnd() * 3, 0]); if (rnd() < 0.5) part(DS, ell(30 * s, 22 * s, 28 * s, 8, 6), rocks[(n + 1) % 2], 2.6, [x + 70 * s, y + 6, z + 24 * s]); }
    else if (Math.abs(z - pz(x)) < 1600) part(DS, ell(50 * s, 30 * s, 44 * s, 8, 6), shrubs[n % 3], 2.4, [x, y + 10 * s, z]);
    else tree(DS, x, y, z, 0.9 + rnd() * 0.7);
  }
  n = 0;
  while (n < 36) {                                          // boulders on the mountain flank
    const x = 3400 + rnd() * 6400, z = -5200 + rnd() * 4400; const y = terr(x, z); if (y < 500 || Math.hypot(x - MC[0], z - MC[1]) < 1500) continue; n++;
    const s = 2 + rnd() * 2.5; part(DS, ell(60 * s, 40 * s, 52 * s, 9, 6), rocks[n % 2], 3.5, [x, y + 20 * s, z], [0, rnd() * 3, 0]);
  }
  // a few tufts on the path edge
  for (let i = 0; i < 40; i++) { const x = -3200 + rnd() * 5600, s = rnd() > 0.5 ? 1 : -1; part(DS, ell(18, 12, 16, 8, 5), shrubs[i % 3], 2, [x, py(x) + 8, pz(x) + s * (150 + rnd() * 70)]); }
}
// glowing summit: soft shaft + halo (sprite)
const SG = new THREE.Group(); SG.position.set(...SUMMIT); DS.add(SG);
const sgShaft = mkMesh(new THREE.CylinderGeometry(120, 520, 2600, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe2a0', transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), SG, [0, 1300, 0]); sgShaft.renderOrder = 8;
const sgHalo = glow(SG, '#ffe2a0', 2600, [0, 250, 0], 0.0);
// clouds around the summit (s10) and birds
const DCL = [];
for (let i = 0; i < 9; i++) { const g = PR.makeCloudPuff('#ffffff', '#e8d8e0'); const a = i / 9 * Math.PI * 2, R = 1500 + 400 * Math.sin(i * 2.3); g.userData.p = [SUMMIT[0] + Math.cos(a) * R, SUMMIT[1] + 900 + 220 * Math.sin(i * 1.9), SUMMIT[2] + Math.sin(a) * R * 0.8]; g.userData.s = 5 + (i % 3) * 1.2; DS.add(g); DCL.push(g); }
const BIRDS = [];
for (let i = 0; i < 6; i++) {
  const g = new THREE.Group(); const bm = bas('#4a3f4a');
  mkMesh(new THREE.SphereGeometry(1, 8, 6).scale(16, 6, 6), bm, g);
  const wl = mkMesh(new THREE.SphereGeometry(1, 8, 6).scale(5, 1.6, 26), bm, g, [0, 0, 20]), wr = mkMesh(new THREE.SphereGeometry(1, 8, 6).scale(5, 1.6, 26), bm, g, [0, 0, -20]);
  g.scale.setScalar(10); DS.add(g); BIRDS.push({ g, wl, wr, p: [SUMMIT[0] - 1900 + (i % 3) * 700 + (i * 137) % 400, SUMMIT[1] + 500 + ((i * 211) % 900), SUMMIT[2] + 2300 + (i % 2) * 500 - (i * 90) % 400], d: i * 0.7 });
}
const dsDrops = []; for (let i = 0; i < 90; i++) { const g = glow(DS, '#ffd060', 150, [0, -999, 0], 0); g.material.blending = THREE.NormalBlending; dsDrops.push(g); }


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


/* ------------------------------------------------------------------ render + contract */
let cur_t = 0;
function frame(t) {
  t = cl(t, 0, DUR); cur_t = t;
  const s = shotAt(t);
  const c = s.cam(t);
  cam.fov = c.fov || 30; cam.updateProjectionMatrix(); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
  cam.updateMatrixWorld(true);
  applyActors(t); applyEnv(t);
  sky.position.copy(cam.position);
  renderer.render(scene, cam);
}
async function warm() {
  const seen = new Set(); const jobs = [];
  for (let k = 0; k <= DUR * 30; k++) {
    const t = k / 30; cur_t = t;
    for (const id in ACT) { const A = ACT[id]; if (!A.person && !A.anim) continue; let st; try { st = A.fn(t); } catch (e) { continue; } if (!st || !st.po.face) continue; const key = id + JSON.stringify(st.po.face); if (seen.has(key)) continue; seen.add(key); jobs.push([A, st.po.face]); }
  }
  for (const [A, f] of jobs) await (A.o.warm ? A.o.warm(f) : A.o.face.set(f));
  return jobs.length;
}
window.__ACT = ACT; window.__scene = scene; window.__dur = DUR; window.__HQ = HQ; window.__errors = [];
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
