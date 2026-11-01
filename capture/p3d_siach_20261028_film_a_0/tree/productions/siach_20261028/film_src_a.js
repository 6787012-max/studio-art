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

//@@UTILS@@
//@@FACE@@

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
