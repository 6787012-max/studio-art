/* toldot10g film_s3 (mountains and valleys) - gezer_trip look, noon. 120.32 s, timing locked from the real narration.
   NO PEOPLE, NO TEXT (digits only where the shot list names them). ASCII only. Every frame is a pure function of t.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur, window.__shots, window.__events, window.__heroBox. */
import * as THREE from 'three';
import { makeSkyDome } from '../../gezer_trip/film_a/gz_kit.js';
import { track } from '../../gezer_trip/film_a/gz_kit2.js';
import { makePalm } from '../../gezer_trip/film_a/gz_kit3.js';
import * as K from '../kit10g.js';
import { makeDigits, makeDial, makeClock, makeCrown, makeModel } from './s3_parts.js';
const { cl, ramp, pop, C, hash2, piece, sm, rng, lam, phong, heightMesh, noiseTex, woodTex, waveTex, tufts, rocks, bushes, makeCity, makeHills, makeClouds, ll, mapY } = K;

const DUR = 120.32;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const ADD = (c, op) => BASIC(c, { transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#f4efd6', 220, 1000);
const sky = makeSkyDome('#5fb2ee', '#f4efd6'); scene.add(sky);
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000); scene.add(cam);
const hemi = new THREE.HemisphereLight('#c4e0f7', '#8a8060', 0.95); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4d8', 2.2); sun.castShadow = true;
sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 600 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

const scene2 = new THREE.Scene(); scene2.add(new THREE.HemisphereLight('#ffffff', '#9a8a70', 1.0)); const l2 = new THREE.DirectionalLight('#fff4dc', 1.3); l2.position.set(10, 20, 30); scene2.add(l2);
const comp = K.makeCompanion(cam, scene2);
const branch = K.makeBranch(); branch.position.z = -12; cam.add(branch);
const veil = K.makeCloud({ scale: 2.1 }); veil.position.set(0, 0, -30); veil.visible = false; cam.add(veil);

const backdrop = rotY => { const g = new THREE.Group(); g.add(makeHills(lam('#9db483'), lam('#b2c6b4'), lam('#d0dde0')), makeClouds(BASIC('#ffffff'))); g.rotation.y = rotY || 0; return g; };
const groundMat = (s, rx, ry) => lam('#ffffff', { vertexColors: true, map: noiseTex(s, rx, ry) });
const wood = lam('#8a5a30', { map: woodTex(3, 2, 2) });
const FIELDS = ['#8fc063', '#d9b840', '#a6c76c', '#c8a24e', '#6fa04a', '#e0cf6a'].map(C);
const slopeOf = (f, x, z) => Math.hypot(f(x + 1, z) - f(x - 1, z), f(x, z + 1) - f(x, z - 1)) / 2;
const scatterTrees = (hfn, seed, n, area, keep, sc, cols) => {
  const r = rng(seed), tl = [];
  for (let k = 0; k < n * 12 && tl.length < n; k++) { const x = area[0] + r() * (area[1] - area[0]), z = area[2] + r() * (area[3] - area[2]), y = hfn(x, z); if (!keep(x, y, z, r)) continue; tl.push([x, y, z, sc[0] + r() * (sc[1] - sc[0]), r()]); }
  return K.plantTrees(tl, cols);
};
const scatter = (fn, hfn, area, keep) => r => { const x = area[0] + r() * (area[1] - area[0]), z = area[2] + r() * (area[3] - area[2]), y = hfn(x, z); return keep(x, y, z, r) ? [x, y, z] : null; };
const EV = []; const ev = (t, kind) => EV.push({ t: +t.toFixed(2), kind });

/* ======================================================================== a: from the summit into the valley in one hour */
function buildA() {
  const grp = new THREE.Group();
  const fl = z => -8 + 38 * sm((z + 70) / 110);
  const rc = z => 9 * Math.sin(z * 0.075) + 3 * Math.sin(z * 0.2);
  const hfn = (x, z) => {
    const wallAmp = 40 * (1 - 0.9 * sm(z / 45)) * sm((z + 175) / 50);
    const wall = wallAmp * sm((Math.abs(x - rc(z) * 0.6) - 14) / 62) * (1 + 0.2 * Math.sin(z * 0.04 + x * 0.02));
    const lat = 22 * sm((Math.abs(x) - 14) / 46) * sm((z - 8) / 34);
    return fl(z) + wall - lat + 0.8 * Math.sin(x * 0.09 + z * 0.05) + 0.5 * Math.sin(x * 0.23) * Math.cos(z * 0.19);
  };
  const GR = ['#7fb157', '#8fc063', '#6fa04a', '#98bf66'].map(C), ROC = C('#b9a67c'), DIRT = C('#d6b57a'), TAN = C('#c8b27a');
  const col = (x, y, z, c) => {
    const gi = Math.floor(hash2(Math.floor(x / 4), Math.floor(z / 4)) * 4);
    c.copy(GR[gi]);
    if (z < -20 && Math.abs(x - rc(z)) < 34 && y < 6) { c.copy(FIELDS[Math.floor(hash2(Math.floor(x / 12), Math.floor(z / 16)) * 6)]); if (Math.floor(z * 0.5) % 2) c.multiplyScalar(0.94); }
    c.lerp(TAN, sm((y - 14) / 14) * 0.8);
    c.lerp(ROC, sm((slopeOf(hfn, x, z) - 0.85) / 0.6) * 0.8);
    c.lerp(C('#cbbd98'), sm((y - 26) / 6) * 0.6);
    const d = Math.abs(x - rc(z)); if (z < 40 && z > -96) c.lerp(DIRT, (1 - sm((d - 1.2) / 1.2)) * 0.95);
  };
  const g = heightMesh(-170, 170, -270, 80, 170, 175, hfn, col, groundMat(41, 24, 20)); g.castShadow = true; grp.add(g);
  grp.add(backdrop(0));
  grp.add(scatterTrees(hfn, 5, 120, [-140, 140, -150, 32], (x, y, z) => y < 22 && Math.abs(x - rc(z)) > 3.5 && slopeOf(hfn, x, z) < 0.9, [1.5, 2.6], ['#4f8a3a', '#5f9a45', '#3f7a34', '#6aa04a']));
  grp.add(rocks(70, 3, scatter(0, hfn, [-45, 45, 18, 62], (x, y, z) => Math.abs(x - rc(z)) > 3), '#b9ae98', 0.4, 1.7));
  grp.add(tufts(900, 4, scatter(0, hfn, [-60, 60, -30, 62], (x, y, z) => Math.abs(x - rc(z)) > 2.5), ['#6f9d4a', '#86b257', '#9cc56a', '#b9c46f'], 0.5, 1.3));
  grp.add(bushes(40, 6, scatter(0, hfn, [-50, 50, -10, 55], (x, y, z, r) => Math.abs(x - rc(z)) > 3 && r() < 0.8), '#7d9a4a', 0.5, 1.2));
  const vz = -104, village = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 9, midTowers: true, scale: 2.0 }); village.position.set(rc(vz) + 28, hfn(rc(vz) + 28, vz) - 0.1, vz); grp.add(village);
  grp.add(K.wheatField(-34, -78, 34, 26, hfn, 3200, 3), K.wheatField(14, -68, 30, 22, hfn, 2600, 4));
  /* summit sign board with the altimeter and the clock */
  const bx = -9, bz = 38, by = hfn(bx, bz);
  const sign = new THREE.Group(); sign.position.set(bx, by, bz); sign.rotation.y = 0.32;
  for (const dx of [-4.2, 4.2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.4, 0.5), wood); p.position.set(dx, 1.7, -0.3); p.castShadow = true; sign.add(p); }
  const bd = new THREE.Mesh(new THREE.BoxGeometry(11.2, 5.6, 0.5), wood); bd.position.set(0, 5.6, 0); bd.castShadow = true; sign.add(bd);
  const bp = new THREE.Mesh(new THREE.BoxGeometry(10.4, 4.8, 0.14), lam('#e6d7ae')); bp.position.set(0, 5.6, 0.3); sign.add(bp);
  const dial = makeDial(2.1); dial.position.set(-2.7, 5.6, 0.42); sign.add(dial);
  const clock = makeClock(1.9); clock.position.set(2.9, 5.6, 0.42); sign.add(clock);
  const upA = K.makeArrow(2.6, 0.38, lam('#e0401e', { emissive: '#400' })); upA.rotation.x = Math.PI; upA.position.set(-6.6, 8.0, 0.5); sign.add(upA);
  const vpos = new THREE.Group(); vpos.add(sign); grp.add(vpos);
  /* cart on the winding road with a glowing trail */
  const pts = []; for (let z = 38; z >= -96; z -= 3) { const x = rc(z); pts.push([x, hfn(x, z) + 0.9, z]); }
  const trail = K.makeThickLine(pts, 0.55, BASIC('#ff8a1e')); grp.add(trail);
  const cart = new THREE.Group();
  const cb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 3.0), lam('#9a5a2a')); cb.position.y = 0.9; cb.castShadow = true; cart.add(cb);
  for (const [wx, wz] of [[-1.25, -1.0], [1.25, -1.0], [-1.25, 1.0], [1.25, 1.0]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 12).rotateZ(Math.PI / 2), lam('#3a2a1a')); w.position.set(wx, 0.5, wz); cart.add(w); }
  const pf = K.makeCloud({ scale: 0.34 }); pf.position.set(0, 2.1, 0); cart.add(pf);
  const fg = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 4), lam('#e0401e')); fg.position.set(0, 3.9, 0); cart.add(fg);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 26, 8).translate(0, 13, 0), ADD('#ffd24a', 0.4)); cart.add(beam);
  cart.scale.setScalar(3.0); grp.add(cart);
  const KEYS = [[0, [9, 40, 57], [-1, 9, -80]], [9.3, [6, 39, 51], [-2, 8, -80]], [15.8, [3, 37.5, 46], [-2, 5, -76]]];
  const pz = lt => 38 - 134 * ramp(lt, 0.9, 9.3);
  const upd = (lt) => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    const pu = ramp(lt, 0.9, 9.3), z = pz(lt), x = rc(z), dz = pz(lt + 0.05), dx = rc(dz) - x;
    cart.visible = lt > 0.5; cart.scale.setScalar(3.0 * pop((lt - 0.5) / 0.5)); cart.position.set(x, hfn(x, z), z); cart.rotation.y = Math.abs(dz - z) < 1e-4 ? Math.PI : Math.atan2(dx, dz - z);
    trail.userData.setU(pu); beam.material.opacity = 0.3 + 0.12 * Math.sin(lt * 9);
    dial.userData.set(130 - 260 * pu);
    upA.userData.pop(cl((lt - 2.2) / 0.5)); upA.position.y = 8.0 + 0.2 * Math.sin(lt * 3.2);
    const cu = (lt - 9.2) / 0.5; clock.scale.setScalar(pop(cu)); clock.userData.set(0.9 * ramp(lt, 9.6, 15.0));
    dial.scale.setScalar(pop((lt - 0.2) / 0.5)); vpos.visible = lt > 0.05;
  };
  const tipa = lt => ({ side: 1, xf: 0.78, size: 0.22, expr: lt < 0.9 ? 'neutral' : lt < 9.3 ? 'surprised' : lt < 9.6 ? 'happy' : 'curious', arms: lt < 9.3 ? 'point' : 'up', hop: lt > 9.3 ? 0.4 : 0, show: cl((lt - 0.2) / 0.5) });
  ev(0.9, 'pop'); ev(2.4, 'pop'); ev(1.0, 'whoosh'); ev(9.3, 'ding'); ev(9.5, 'pop');
  return { grp, upd, tipa, branch: true, sun: lt => ({ t: [0, 20, 20], ext: 70 }) };
}

/* ======================================================================== shared display stage (b, q) */
const stage = new THREE.Group(); scene.add(stage); stage.visible = false;
const TBY = 3.0;
(function buildStage() {
  const hfn = (x, z) => 0.45 * Math.sin(x * 0.05 + 0.4) * Math.cos(z * 0.045) + 0.3 * Math.sin(z * 0.1 + x * 0.03) + 22 * sm((-z - 70) / 90) * (0.6 + 0.4 * Math.sin(x * 0.03));
  const GC = ['#9cc56a', '#86b257', '#a9c46a', '#93bd5e'].map(C);
  const col = (x, y, z, c) => {
    c.copy(GC[Math.floor(hash2(Math.floor(x / 5), Math.floor(z / 5)) * 4)]);
    if (z < -34 && z > -150) { const hv = hash2(Math.floor(x / 22), Math.floor(z / 18)); if (hv > 0.5) { c.copy(FIELDS[Math.floor(hv * 6) % 6]); if (Math.floor(z * 0.45) % 2) c.multiplyScalar(0.94); } }
    c.lerp(C('#c4b078'), sm((y - 12) / 8) * 0.55);
    if (z > 12 && z < 22 && Math.abs(x) < 80) c.lerp(C('#d9c28a'), 0.5);
  };
  const g = heightMesh(-260, 260, -230, 110, 130, 85, hfn, col, groundMat(43, 26, 18)); g.castShadow = true; stage.add(g);
  stage.add(backdrop(0));
  stage.add(scatterTrees(hfn, 12, 70, [-200, 200, -110, -30], (x, y, z, r) => Math.abs(x) > 12 || z < -50, [1.1, 2.0], ['#4f8a3a', '#5f9a45', '#3f7a34', '#6aa04a']));
  stage.add(scatterTrees(hfn, 13, 14, [-90, 90, -26, -16], () => true, [1.0, 1.5], ['#6a8a3a', '#7a9a44', '#5f8a38']));
  stage.add(scatterTrees(hfn, 14, 4, [-70, 70, 28, 34], (x, y, z, r) => true, [1.0, 1.4], ['#6a8a3a', '#7a9a44']));
  stage.add(K.wheatField(-120, -60, 50, 24, hfn, 3000, 5), K.wheatField(60, -70, 50, 24, hfn, 3000, 6));
  const wl = K.stoneWall(70, 2.0, 0, null); wl.position.set(-10, hfn(-10, -18), -18); stage.add(wl);
  stage.add(rocks(60, 21, scatter(0, hfn, [-90, 90, 24, 40], () => true), '#b9ae98', 0.5, 1.9));
  stage.add(tufts(1400, 22, scatter(0, hfn, [-100, 100, -30, 40], (x, y, z) => !(Math.abs(x) < 64 && Math.abs(z) < 13)), ['#6f9d4a', '#86b257', '#9cc56a', '#b9c46f'], 0.5, 1.2));
  stage.add(bushes(40, 23, scatter(0, hfn, [-100, 100, -30, 38], (x, y, z, r) => !(Math.abs(x) < 64 && Math.abs(z) < 13) && r() < 0.7), '#7d9a4a', 0.5, 1.2));
  /* the long display table */
  const top = new THREE.Mesh(new THREE.BoxGeometry(124, 1.0, 24), wood); top.position.set(0, TBY - 0.5, 0); top.castShadow = top.receiveShadow = true; stage.add(top);
  const runner = new THREE.Mesh(new THREE.BoxGeometry(118, 0.06, 19), lam('#e9dfc4')); runner.position.set(0, TBY + 0.03, 0); runner.receiveShadow = true; stage.add(runner);
  for (const sx of [-58, 58]) for (const sz of [-10, 10]) { const l = new THREE.Mesh(new THREE.BoxGeometry(2.4, TBY - 0.9, 2.4), wood); l.position.set(sx, (TBY - 0.9) / 2, sz); l.castShadow = true; stage.add(l); }
  const ap = new THREE.Mesh(new THREE.BoxGeometry(116, 1.6, 0.8), wood); ap.position.set(0, TBY - 1.7, 11); ap.castShadow = true; stage.add(ap);
})();

/* ======================================================================== b: five landforms */
const MKB = [['peak', -32], ['ridge', -16], ['valley', 0], ['plain', 16], ['plateau', 32]];
const RISE_B = [0.7, 4.0, 7.2, 10.4, 13.9];
function buildB() {
  const grp = new THREE.Group();
  const models = MKB.map(([k, x], i) => { const m = makeModel(k, { seed: i }); m.position.set(x, TBY, 0); grp.add(m); return m; });
  const bump = (t, a, b) => ramp(t, a, a + 0.35) * (1 - ramp(t, b - 0.5, b));
  const KEYS = [[0, [-26, 14, 52], [-22, 6.5, 0]], [10, [-8, 15, 50], [-6, 7, 0]], [21.17, [20, 14, 50], [24, 6.5, 0]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    models.forEach((m, i) => {
      m.userData.rise(cl((lt - RISE_B[i]) / 1.5));
      const k = bump(lt, RISE_B[i] + 0.5, RISE_B[i] + 3.0) * (0.8 + 0.2 * Math.sin(lt * 6)) + bump(lt, 17.4 + 0.6 * i, 18.9 + 0.6 * i) * 0.8;
      m.userData.glow(k);
    });
  };
  const tipa = lt => { const near = RISE_B.some(r => lt > r && lt < r + 1.2); return { side: -1, xf: 0.78, size: 0.22, expr: lt < 0.7 ? 'curious' : near ? 'surprised' : lt > 17.4 ? 'cheering' : 'happy', arms: lt > 17.4 ? 'up' : near ? 'point' : 'down', hop: near ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) }; };
  RISE_B.forEach(t => ev(15.8 + t + 0.1, 'pop'));
  return { grp, upd, tipa, branch: true, stage: true, sun: lt => ({ t: [track(lt, KEYS).l[0], 0, 0], ext: 56 }) };
}

/* ======================================================================== c: the forms in the land (five short sets, cloud wipes) */
const CUTS = [8.2, 15.3, 19.6, 22.9];
function makeCrownBeam() { const g = new THREE.Group(); const cr = makeCrown(); g.add(cr); const bm = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 2.2, 30, 10, 1, true).translate(0, 15, 0), ADD('#fff0a0', 0.28)); bm.position.y = -1; g.add(bm); g.userData.cr = cr; return g; }

function setHermon() {
  const g = new THREE.Group();
  const hfn = (x, z) => {
    const r = Math.hypot(x * 0.85, z + 125);
    const m = 76 * Math.pow(Math.max(0, 1 - r / 135), 1.9);
    const rid = 4 * Math.sin(Math.atan2(x, z + 125) * 8 + r * 0.06) * sm((r - 12) / 36) * sm((120 - r) / 50);
    const hills = 16 * Math.exp(-Math.pow((x - 150) / 70, 2) - Math.pow((z + 40) / 60, 2)) + 12 * Math.exp(-Math.pow((x + 160) / 60, 2) - Math.pow((z + 20) / 60, 2));
    return 0.6 * Math.sin(x * 0.08) * Math.cos(z * 0.06) + m + rid + hills;
  };
  const GR = ['#7fb157', '#6a9a4a', '#8fc063', '#5f8f40'].map(C), FOR = C('#3f7438'), ROCKC = C('#9a8d78'), SNOW = C('#f7f5ee');
  const col = (x, y, z, c) => {
    c.copy(GR[Math.floor(hash2(Math.floor(x / 4), Math.floor(z / 4)) * 4)]);
    c.lerp(FOR, sm((y - 8) / 8) * (1 - sm((y - 30) / 8)) * 0.7); c.lerp(ROCKC, sm((y - 28) / 12));
    c.lerp(ROCKC, sm((slopeOf(hfn, x, z) - 1.0) / 0.5) * 0.5);
    const sl = 47 + 4 * Math.sin(x * 0.15 + z * 0.1); c.lerp(SNOW, sm((y - sl) / 3.5));
  };
  const mesh = heightMesh(-230, 230, -260, 60, 170, 160, hfn, col, groundMat(61, 24, 18)); mesh.castShadow = true; g.add(mesh);
  g.add(backdrop(0));
  g.add(scatterTrees(hfn, 31, 150, [-140, 140, -120, 34], (x, y, z) => y < 26 && Math.abs(x) + (z > 10 ? 0 : 0) > 3, [1.6, 2.8], ['#2f6a34', '#3d7a3a', '#4f8a3a']));
  g.add(rocks(50, 32, scatter(0, hfn, [-40, 40, 0, 36], () => true), '#b9ae98', 0.5, 1.9));
  g.add(tufts(1000, 33, scatter(0, hfn, [-60, 60, -10, 40], () => true), ['#6f9d4a', '#86b257', '#9cc56a', '#c4cc7a'], 0.5, 1.3));
  const w = K.stoneWall(16, 1.4, 0.3); w.position.set(-20, hfn(-20, 14), 14); g.add(w);
  const w2 = K.stoneWall(12, 1.4, -0.25); w2.position.set(24, hfn(24, 10), 10); g.add(w2);
  const crown = makeCrownBeam(); crown.scale.setScalar(4.2); g.add(crown);
  const top = hfn(0, -125);
  const KEYS = [[0, [-8, 9, 50], [0, 36, -125]], [8.2, [7, 15, 31], [0, 40, -125]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    const u = (lt - 3.4) / 0.6; crown.visible = u > 0; crown.scale.setScalar(4.2 * pop(u)); crown.position.set(0, top + 9 + 0.5 * Math.sin(lt * 2), -125); crown.userData.cr.rotation.y = lt * 1.2;
  };
  return { g, upd, tipa: lt => ({ expr: lt < 3.4 ? 'curious' : 'surprised', arms: lt < 3.4 ? 'down' : 'point', hop: 0 }) };
}

function setPlateau() {
  const g = new THREE.Group();
  const edge = x => -48 + 6 * Math.sin(x * 0.045) + 3 * Math.sin(x * 0.13);
  const hfn = (x, z) => 0.8 * Math.sin(x * 0.07) * Math.cos(z * 0.05) + 27 * sm((edge(x) - z) / 9) + 0.8 * Math.sin(x * 0.05 + z * 0.04) * sm((edge(x) - z - 9) / 8) + 1.2 * Math.sin(z * 0.3 + x * 0.2) * sm((slopeOf((a, b) => 27 * sm((edge(a) - b) / 9), x, z) - 0.5) / 1.5);
  const CL = C('#c29a66'), CL2 = C('#9a7448'), PAST = ['#b9c46f', '#a6c76c', '#c9b45a', '#9cc56a'].map(C);
  const col = (x, y, z, c) => {
    if (y > 20) { c.copy(PAST[Math.floor(hash2(Math.floor(x / 6), Math.floor(z / 6)) * 4)]); }
    else { c.copy(FIELDS[Math.floor(hash2(Math.floor(x / 14), Math.floor(z / 14)) * 6)]); if (Math.floor(z * 0.4) % 2) c.multiplyScalar(0.94); }
    const cs = sm((slopeOf((a, b) => 27 * sm((edge(a) - b) / 9), x, z) - 0.6) / 1.0); c.lerp(CL, cs); c.multiplyScalar(1 - cs * 0.14 + cs * 0.14 * Math.sin(y * 2.4));
    if (y > 24.5 && y < 27.2) c.lerp(CL2, 0.0);
  };
  g.add(Object.assign(heightMesh(-230, 230, -230, 70, 190, 150, hfn, col, groundMat(71, 24, 16)), { castShadow: true }));
  g.add(backdrop(0));
  g.add(scatterTrees(hfn, 41, 90, [-120, 120, -40, 40], (x, y, z) => y < 3, [1.2, 2.0], ['#4f8a3a', '#5f9a45', '#6a8a3a']));
  g.add(scatterTrees(hfn, 42, 30, [-100, 100, -110, -60], (x, y, z, r) => y > 20 && r() < 0.6, [1.4, 2.2], ['#4f8a3a', '#5f9a45', '#3f7a34']));
  g.add(rocks(110, 43, scatter(0, hfn, [-110, 110, -140, -56], () => true), '#5f594e', 0.5, 1.5));
  g.add(rocks(40, 44, scatter(0, hfn, [-60, 60, 0, 40], () => true), '#b9ae98', 0.5, 1.5));
  g.add(tufts(1100, 45, scatter(0, hfn, [-90, 90, -140, 40], () => true), ['#c9b57c', '#b9c46f', '#9cc56a', '#d6c07a'], 0.5, 1.2));
  g.add(K.wheatField(-60, 6, 50, 28, hfn, 3200, 9));
  const house = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 8, seed: 12, midTowers: false, scale: 1.3 }); house.position.set(30, hfn(30, -90) - 0.1, -90); g.add(house);
  const w = K.stoneWall(30, 1.5, 0.05); w.position.set(-20, hfn(-20, -75), -75); g.add(w);
  const arrowP = K.makeArrow(7, 0.9, lam('#ffd24a', { emissive: '#553' })); arrowP.rotation.x = Math.PI; g.add(arrowP);
  const KEYS = [[0, [-34, 5, 44], [8, 14, -60]], [7.1, [10, 31, -8], [0, 27, -95]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    arrowP.userData.pop(cl((lt - 4.2) / 0.5)); arrowP.position.set(12, 40 + 1.2 * Math.sin(lt * 3), -110);
  };
  return { g, upd, tipa: lt => ({ expr: lt < 4.2 ? 'curious' : 'happy', arms: lt < 4.2 ? 'down' : 'point', hop: 0 }) };
}

function setValley() {
  const g = new THREE.Group();
  const sx = z => 8 * Math.sin(z * 0.04);
  const hfn = (x, z) => 0.6 * Math.sin(x * 0.08 + z * 0.05) + 46 * sm((Math.abs(x) - 52) / 70) * (1 + 0.15 * Math.sin(z * 0.05)) + 38 * sm((-z - 170) / 50) + 1.4 * Math.exp(-Math.pow((x + 20) / 10, 2) - Math.pow((z + 40) / 12, 2));
  const OL = C('#9c9a5a'), TANH = C('#c8b680');
  const col = (x, y, z, c) => {
    if (y < 8) { c.copy(FIELDS[Math.floor(hash2(Math.floor(x / 10), Math.floor(z / 14)) * 6)]); if (Math.floor(z * 0.5) % 2) c.multiplyScalar(0.93); c.lerp(C('#8fc063'), 0.0); }
    else c.copy(C('#86b257'));
    c.lerp(OL, sm((y - 6) / 16) * 0.7); c.lerp(TANH, sm((y - 34) / 14) * 0.8);
    c.lerp(C('#4aa0e0'), 1 - sm((Math.abs(x - sx(z)) - 1.4) / 1.0));
  };
  g.add(Object.assign(heightMesh(-250, 250, -260, 90, 170, 160, hfn, col, groundMat(81, 24, 18)), { castShadow: true }));
  g.add(backdrop(0));
  g.add(scatterTrees(hfn, 51, 170, [-150, 150, -150, 60], (x, y, z, r) => (y < 5 && Math.abs(x - sx(z)) < 9) || (y < 22 && r() < 0.35) || (y < 5 && r() < 0.12), [1.2, 2.2], ['#4f8a3a', '#5f9a45', '#3f7a34', '#6aa04a', '#7a9a44']));
  g.add(bushes(150, 52, scatter(0, hfn, [-120, 120, -140, 60], (x, y, z, r) => y > 5 && y < 30 && r() < 0.7), '#8a9a4a', 0.5, 1.3));
  g.add(rocks(60, 53, scatter(0, hfn, [-100, 100, -120, 60], (x, y, z, r) => y > 4 && r() < 0.6), '#b9ae98', 0.5, 1.7));
  g.add(tufts(900, 54, scatter(0, hfn, [-70, 70, -100, 50], () => true), ['#6f9d4a', '#86b257', '#9cc56a', '#c4cc7a'], 0.5, 1.2));
  g.add(K.wheatField(-50, -30, 34, 24, hfn, 2800, 10), K.wheatField(24, -100, 34, 26, hfn, 2800, 11));
  const vil = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 21, midTowers: true, scale: 1.4 }); vil.position.set(-26, hfn(-26, -66) - 0.1, -66); g.add(vil);
  for (let i = 0; i < 4; i++) { const w = K.stoneWall(14, 1.2, 0.1 * i); w.position.set(30 + i * 3, hfn(30, 6 - i * 14), 6 - i * 14); g.add(w); }
  const KEYS = [[0, [-4, 15, 76], [0, 6, -110]], [4.3, [12, 11, 56], [0, 5, -110]]];
  const upd = lt => { const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l); };
  return { g, upd, tipa: lt => ({ expr: 'happy', arms: lt < 2 ? 'point' : 'up', hop: 0 }) };
}

function setCoast() {
  const g = new THREE.Group();
  const xs = z => -34 + 6 * Math.sin(z * 0.03);
  const hfn = (x, z) => 0.5 + 0.5 * Math.sin(x * 0.05) * Math.cos(z * 0.04) - 3.6 * sm((xs(z) - x) / 14) + 1.3 * Math.exp(-Math.pow((x - (xs(z) + 9)) / 7, 2)) * (0.6 + 0.4 * Math.sin(z * 0.1)) + 18 * sm((x - 150) / 70);
  const SAND = C('#ecdca8'), SEAF = C('#cdbb82');
  const col = (x, y, z, c) => {
    const d = x - xs(z);
    c.copy(FIELDS[Math.floor(hash2(Math.floor(x / 14), Math.floor(z / 18)) * 6)]); if (Math.floor(x * 0.35) % 2) c.multiplyScalar(0.93);
    c.lerp(C('#8fc063'), 0.25);
    c.lerp(SAND, 1 - sm((d - 20) / 6)); c.lerp(SEAF, sm((-d - 2) / 6));
    c.lerp(C('#c8b27a'), sm((x - 140) / 40) * 0.7);
  };
  g.add(Object.assign(heightMesh(-230, 230, -260, 100, 170, 160, hfn, col, groundMat(91, 24, 18)), { castShadow: true }));
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(520, 420).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#3d9ad6', transparent: true, opacity: 0.78, depthWrite: false })); sea.position.set(-290, -0.4, -80); g.add(sea);
  const wt = waveTex(7, 4, 6), wv = new THREE.Mesh(new THREE.PlaneGeometry(520, 420).rotateX(-Math.PI / 2), BASIC('#ffffff', { map: wt, transparent: true, depthWrite: false, opacity: 0.8 })); wv.position.set(-290, -0.34, -80); g.add(wv);
  g.add(backdrop(0));
  const tl = []; const rr = rng(61);
  for (let i = 0; i < 7; i++) for (let k = 0; k < 24; k++) { const x = 8 + i * 16 + (rr() - 0.5) * 2, z = 60 - k * 7.5 + (rr() - 0.5) * 2, y = hfn(x, z); if (rr() < 0.9) tl.push([x, y, z, 0.9 + rr() * 0.4, rr()]); }
  g.add(K.plantTrees(tl, ['#5f9a45', '#4f8a3a', '#6aa04a', '#3f7a34']));
  g.add(scatterTrees(hfn, 62, 40, [-20, 150, -160, 60], (x, y, z, r) => x > xs(z) + 26 && r() < 0.6, [1.2, 2.0], ['#4f8a3a', '#5f9a45']));
  for (let i = 0; i < 9; i++) { const z = 56 - i * 16, x = xs(z) + 18 + (i % 3) * 3, p = makePalm(6 + (i % 3), 70 + i); p.position.set(x, hfn(x, z), z); p.scale.setScalar(1.3); g.add(p); }
  g.add(tufts(900, 63, scatter(0, hfn, [-30, 100, -120, 60], (x, y, z) => x > xs(z) + 14 && y > 0), ['#9cc56a', '#c4cc7a', '#6f9d4a'], 0.5, 1.1));
  g.add(rocks(40, 64, scatter(0, hfn, [-40, 40, -100, 60], (x, y, z) => Math.abs(x - xs(z)) < 12), '#c2b090', 0.4, 1.3));
  const house = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 33, midTowers: true, scale: 1.3 }); house.position.set(70, hfn(70, -70) - 0.1, -70); g.add(house);
  g.add(K.wheatField(90, -30, 40, 26, hfn, 2800, 12));
  const boats = [[-60, -20], [-85, -90]].map(([x, z]) => { const b = new THREE.Group(); const h = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 1.4), lam('#e8e0d0')); h.position.y = 0.5; b.add(h); const s = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4.2, 3), lam('#ffffff')); s.position.set(0, 3.0, 0); s.scale.z = 0.12; b.add(s); b.userData.p = [x, z]; b.scale.setScalar(2.0); g.add(b); return b; });
  const KEYS = [[0, [20, 5.5, 74], [-14, 3, -100]], [3.3, [12, 7, 58], [-18, 3, -100]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    wt.offset.set(lt * 0.02, lt * 0.03); boats.forEach((b, i) => b.position.set(b.userData.p[0] + 3 * Math.sin(lt * 0.5 + i), -0.2 + 0.25 * Math.sin(lt * 1.4 + i), b.userData.p[1] + lt * 1.5));
  };
  return { g, upd, tipa: lt => ({ expr: 'happy', arms: 'down', hop: 0 }) };
}

function setRift() {
  const g = new THREE.Group();
  const xr = z => 5 * Math.sin(z * 0.05);
  const fz = z => -10 - 14 * sm((-z - 20) / 160);
  const hfn = (x, z) => fz(z) + 64 * sm((Math.abs(x) - 20 - 4 * Math.sin(z * 0.03)) / 40) + 5 * Math.sin(x * 0.06 + z * 0.04) * sm((Math.abs(x) - 70) / 20) + 0.6 * Math.sin(x * 0.3 + z * 0.2);
  const STR = ['#c49a62', '#a8794a', '#d9bd86', '#b88a56'].map(C), GRN = C('#7fb157'), TANF = C('#d8c48a');
  const col = (x, y, z, c) => {
    const rel = y - fz(z), sl = slopeOf(hfn, x, z);
    c.copy(TANF); c.lerp(GRN, 1 - sm((Math.abs(x - xr(z)) - 6) / 8));
    c.lerp(STR[Math.floor(hash2(Math.floor(y / 3), 3) * 4)], sm((rel - 3) / 5));
    c.multiplyScalar(0.9 + 0.12 * Math.sin(y * 1.1));
    if (rel > 58) { c.copy(x < 0 ? C('#8fb060') : C('#d6c48c')); c.lerp(STR[1], sm((sl - 1.0) / 0.8) * 0.6); }
  };
  g.add(Object.assign(heightMesh(-200, 200, -300, 120, 170, 200, hfn, col, groundMat(101, 24, 24)), { castShadow: true }));
  g.add(backdrop(0));
  const rp = []; for (let z = 100; z >= -160; z -= 6) rp.push([xr(z), fz(z) + 0.5, z]);
  g.add(K.makeThickLine(rp, 1.5, BASIC('#3a9ae0'))); g.children[g.children.length - 1].userData.setU(1);
  const lake = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), BASIC('#3a9ae0')); lake.scale.set(18, 1, 34); lake.position.set(2, fz(-215) + 0.4, -215); g.add(lake);
  g.add(scatterTrees(hfn, 71, 140, [-30, 30, -150, 100], (x, y, z, r) => Math.abs(x - xr(z)) < 12 && y < fz(z) + 3 && Math.abs(x - xr(z)) > 2.4, [1.0, 1.8], ['#3f7a34', '#4f8a3a', '#5f9a45']));
  g.add(scatterTrees(hfn, 72, 60, [-140, -60, -150, 100], (x, y, z, r) => y > 40 && y < 60 && r() < 0.5, [1.4, 2.2], ['#4f8a3a', '#5f9a45']));
  g.add(tufts(900, 73, scatter(0, hfn, [-50, 50, -180, 100], (x, y, z) => y < fz(z) + 4), ['#6f9d4a', '#9cc56a', '#c4b57c'], 0.5, 1.2));
  g.add(rocks(80, 74, scatter(0, hfn, [-60, 60, -160, 100], (x, y, z, r) => y < fz(z) + 14 && r() < 0.7), '#c2a070', 0.5, 2.0));
  const KEYS = [[0, [-62, 74, 90], [4, -12, -150]], [3.9, [-44, 62, 60], [2, -12, -160]]];
  const upd = lt => { const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l); };
  return { g, upd, tipa: lt => ({ expr: 'surprised', arms: 'point', hop: 0 }) };
}

function buildC() {
  const grp = new THREE.Group();
  const sets = [setHermon(), setPlateau(), setValley(), setCoast(), setRift()];
  const T0 = [0, ...CUTS], T1 = [...CUTS, 26.77];
  sets.forEach(s => grp.add(s.g));
  const idxAt = lt => { let i = 0; for (let k = 0; k < T0.length; k++) if (lt >= T0[k]) i = k; return i; };
  const upd = lt => {
    const i = idxAt(lt); sets.forEach((s, k) => { s.g.visible = k === i; });
    sets[i].upd(lt - T0[i]);
    let vz = false; CUTS.forEach(tc => { const u = (lt - (tc - 0.75)) / 1.5; if (u > 0 && u < 1) { vz = true; veil.position.set(-24 + 48 * u, 2.5 * Math.sin(u * 3.1) - 2, -30); veil.scale.setScalar(2.1); } });
    veil.visible = vz;
  };
  const tipa = lt => { const i = idxAt(lt), t = sets[i].tipa(lt - T0[i]); return Object.assign({ side: 1, xf: 0.78, size: 0.22, show: 1 }, t); };
  CUTS.forEach(tc => ev(36.97 + tc, 'whoosh')); ev(36.97 + 3.4, 'pop'); ev(36.97 + 11.3, 'pop');
  return { grp, upd, tipa, branch: true, hideVeil: true, sun: lt => ({ t: [0, 10, -20], ext: 100 }) };
}

/* ======================================================================== shared table map (d, e) */
const mapRoot = new THREE.Group(); scene.add(mapRoot); mapRoot.visible = false;
const TABLE = K.makeTable(), MAP = K.makeTableMap();
mapRoot.add(TABLE, MAP.grp);
const MM = [MAP.north.children[0], MAP.south.children[0]];
const ORIG = MM.map(m => Float32Array.from(m.geometry.attributes.color.array));
const LOW = C('#6fb04a'), MID = C('#e6c440'), HIGH = C('#9b6a3a'), PALE = C('#e3d6b6'), HOT = C('#fff4a8');
let lastRC = '';
function recolor(k, band) {
  const key = k.toFixed(3) + '_' + band.toFixed(3); if (key === lastRC) return; lastRC = key;
  const c = new THREE.Color(), o = new THREE.Color();
  MM.forEach((m, mi) => {
    const col = m.geometry.attributes.color, pos = m.geometry.attributes.position, a = col.array, B = ORIG[mi];
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i); o.setRGB(B[i * 3], B[i * 3 + 1], B[i * 3 + 2]);
      if (y > 0.28 && k > 0) {
        c.copy(LOW).lerp(MID, sm((y - 0.8) / 0.35)).lerp(HIGH, sm((y - 1.95) / 0.35)).lerp(PALE, sm((y - 3.55) / 0.35));
        if (band >= 0) { const w = 1 - sm((Math.abs(y - band) - 0.2) / 0.28); c.lerp(HOT, 0.65 * w); c.multiplyScalar(0.88 + 0.12 * w); }
        o.lerp(c, k);
      }
      a[i * 3] = o.r; a[i * 3 + 1] = o.g; a[i * 3 + 2] = o.b;
    }
    col.needsUpdate = true;
  });
}

/* ======================================================================== d: height colours */
function buildD() {
  const grp = new THREE.Group();
  const BX = 31, BZ = -6, HB = 22, SEG = [[0.8, '#6fb04a'], [2.0, '#e6c440'], [3.6, '#9b6a3a'], [4.3, '#e3d6b6']];
  const barG = new THREE.Group(); barG.position.set(BX, -1.5, BZ); grp.add(barG);
  const back = new THREE.Mesh(new THREE.BoxGeometry(5.0, HB + 2.2, 0.7), wood); back.position.set(0, (HB + 2.2) / 2 - 0.8, -0.6); back.castShadow = true; barG.add(back);
  let prev = 0; SEG.forEach(([h, c]) => { const y0 = prev / 4.3 * HB, y1 = h / 4.3 * HB; const b = new THREE.Mesh(new THREE.BoxGeometry(3.4, y1 - y0, 1.2), lam(c, { emissive: '#222' })); b.position.set(0, (y0 + y1) / 2, 0); b.castShadow = true; barG.add(b); prev = h; });
  const mk = new THREE.Group(); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 4).rotateZ(Math.PI / 2), lam('#e0401e', { emissive: '#500' })); cone.position.set(-3.1, 0, 0.6); mk.add(cone);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 10), ADD('#fff2a0', 0.9)); orb.position.set(-4.5, 0, 0.6); mk.add(orb);
  const line = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.14, 0.14), ADD('#fff2a0', 0.8)); line.position.set(0, 0, 0.7); mk.add(line); barG.add(mk);
  const KEYS = [[0, [2, 38, 52], [3, 0, -6]], [8.99, [-2, 34, 45], [3, 0, -6]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    const kk = ramp(lt, 0.3, 2.4); const hh = 0.2 + 4.0 * ramp(lt, 2.0, 7.6);
    const sl = lt > 2.0 && lt < 8.2; recolor(kk, sl ? hh : -1);
    barG.scale.setScalar(pop((lt - 0.3) / 0.6)); barG.visible = lt > 0.3;
    mk.position.y = hh / 4.3 * HB; mk.visible = lt > 1.6; const mp = 0.8 + 0.2 * Math.sin(lt * 6); orb.scale.setScalar(mp);
  };
  const tipa = lt => ({ side: -1, xf: 0.8, size: 0.22, expr: lt < 2 ? 'curious' : lt < 7.6 ? 'happy' : 'cheering', arms: lt < 7.6 ? 'point' : 'up', hop: lt > 7.6 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) });
  ev(63.74 + 0.4, 'pop'); ev(63.74 + 2.0, 'whoosh'); ev(63.74 + 7.6, 'ding');
  return { grp, upd, tipa, map: true, sun: { t: [0, 0, 0], ext: 80 } };
}

/* ======================================================================== x: the climb 300 -> 800 */
function buildX() {
  const cut = K.makeCutaway(), grp = cut.grp, { prof, surfH } = cut;
  const rt = rng(23), tl = [];
  for (let k = 0; k < 300 && tl.length < 60; k++) { const x = -16 + rt() * 17.5, z = (rt() - 0.5) * 11; if (Math.abs(z - 3.4) < 1.6 && x > -15) continue; tl.push([x, surfH(x, z), z, 0.6 + rt() * 0.5, rt()]); }
  grp.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34']));
  const rb = rng(26);
  grp.add(bushes(50, 27, () => { const x = 3 + rb() * 22, z = (rb() - 0.5) * 11; return [x, surfH(x, z), z]; }, '#b8a55a', 0.3, 0.8));
  grp.add(rocks(30, 28, () => { const x = -16 + rb() * 40, z = (rb() - 0.5) * 12; return [x, surfH(x, z) - 0.05, z]; }, '#c2b090', 0.2, 0.6));
  grp.add(tufts(420, 29, () => { const x = -16 + rb() * 42, z = (rb() - 0.5) * 12; return [x, surfH(x, z), z]; }, ['#6f9d4a', '#86b257', '#c9b57c'], 0.4, 0.9));
  grp.add(backdrop(0));
  /* the road: from the town at the foot to the city on the top */
  const N = 15, rp = []; for (let i = 0; i <= N; i++) { const x = -14.2 + i * (15.4 / N), z = 3.3 + 1.7 * Math.sin(i * 0.95); rp.push([x, surfH(x, z) + 0.2, z]); }
  const road = K.makeThickLine(rp, 0.24, BASIC('#f1d28a')); grp.add(road);
  const tip = new THREE.Group(); const tb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), BASIC('#ff7a1e')); tip.add(tb); const th = new THREE.Mesh(new THREE.SphereGeometry(1.0, 14, 10), ADD('#ffcf6a', 0.5)); tip.add(th);
  const cb = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.8), lam('#9a5a2a')); cb.position.y = 0.35; tip.add(cb); grp.add(tip);
  /* town at the foot (marker) and the city on the hill */
  const town = new THREE.Group(); for (const [dx, dz, s] of [[0, 0, 1], [1.6, 1.0, 0.9], [-1.4, 1.5, 0.8], [0.6, -1.6, 0.9]]) { const hb = new THREE.Mesh(new THREE.BoxGeometry(1.2 * s, 0.9 * s, 1.1 * s), lam('#efe0b8')); hb.position.set(dx, 0.45 * s, dz); hb.castShadow = true; town.add(hb); const rf = new THREE.Mesh(new THREE.ConeGeometry(0.95 * s, 0.7 * s, 4).rotateY(Math.PI / 4), lam('#c0502a')); rf.position.set(dx, 1.2 * s, dz); town.add(rf); }
  town.position.set(-15.2, surfH(-15.2, 3.0), 3.0); grp.add(town);
  const pinA = K.makePin('#1fa05a'); pinA.userData.k = 0.9; pinA.position.set(-15.2, surfH(-15.2, 3.0) + 0.1, 5.4); grp.add(pinA);
  const city = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 5, midTowers: true, scale: 0.5 }); city.position.set(0.8, surfH(0.8, 1.5) - 0.12, 1.5); grp.add(city);
  const pinB = K.makePin('#e0401e'); pinB.userData.k = 1.0; pinB.position.set(0.8, surfH(0.8, 5.0) + 0.1, 5.0); grp.add(pinB);
  /* altimeter board that rides beside the tip, bracket + 500 */
  const alt = makeDigits(7.6, 3.2, '#222222', '#f6efd8'); grp.add(alt);
  const y300 = surfH(-14.2, 3.3), y800 = surfH(0.8, 1.5);
  const brk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), lam('#ffd24a', { emissive: '#553' })); grp.add(brk);
  const gl1 = new THREE.Mesh(new THREE.BoxGeometry(24, 0.12, 0.12), ADD('#fff2a0', 0.7)); gl1.position.set(-5, y300, 8.4); grp.add(gl1);
  const gl2 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.12, 0.12), ADD('#fff2a0', 0.7)); gl2.position.set(-0.5, y800, 8.4); grp.add(gl2);
  const d500 = makeDigits(5.4, 2.6, '#1f7a3a', '#f6efd8'); d500.userData.set('500'); grp.add(d500);
  const tipAt = u => { const f = cl(u) * N, i = Math.min(N - 1, Math.floor(f)), r = f - i; return [0, 1, 2].map(j => rp[i][j] + (rp[i + 1][j] - rp[i][j]) * r); };
  const KEYS = [[0, [-6, 15, 43], [-5, 4.5, 0]], [14.29, [-2, 14, 35], [-3, 5.5, 0]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    cut.wt.offset.set(lt * 0.03, 0);
    const pu = ramp(lt, 0.9, 7.6), tp = tipAt(pu);
    road.userData.setU(pu); tip.visible = lt > 0.5; tip.position.set(tp[0], tp[1] + 0.3, tp[2]); tip.scale.setScalar(pop((lt - 0.5) / 0.4) * (1 + 0.1 * Math.sin(lt * 8)));
    alt.visible = lt > 0.5; alt.scale.setScalar(pop((lt - 0.5) / 0.5)); alt.position.set(tp[0] - 5.2, Math.min(tp[1] + 3.6, 12.6), 6.0);
    alt.userData.set(String(Math.round((300 + 500 * pu) / 10) * 10));
    pinA.userData.pop(cl((lt - 0.3) / 0.5)); pinB.userData.pop(cl((lt - 0.3) / 0.5));
    const bu = ramp(lt, 8.1, 10.2); brk.visible = gl1.visible = gl2.visible = bu > 0.01; brk.position.set(6.6, y300 + (y800 - y300) * bu * 0.5, 8.4); brk.scale.set(1, Math.max(0.01, (y800 - y300) * bu), 1);
    gl1.scale.x = Math.max(0.01, bu); gl2.visible = bu > 0.4; gl2.scale.x = Math.max(0.01, bu);
    const du = (lt - 10.3) / 0.5; d500.visible = du > 0; d500.scale.setScalar(pop(du)); d500.position.set(6.6, y800 + 2.4, 8.4);
  };
  const tipa = lt => ({ side: 1, xf: 0.78, size: 0.22, expr: lt < 0.8 ? 'neutral' : lt < 7.8 ? 'curious' : lt < 10.3 ? 'surprised' : 'cheering', arms: lt < 7.8 ? 'point' : lt < 10.3 ? 'down' : 'up', hop: lt > 10.3 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) });
  ev(72.73 + 0.4, 'pop'); ev(72.73 + 8.2, 'pop'); ev(72.73 + 10.4, 'ding');
  return { grp, upd, tipa, branch: true, sun: { t: [0, 0, 0], ext: 62 } };
}

/* ======================================================================== q: the tallest of three mountains */
const QM = [[-18, 0.64], [0, 0.86], [18, 1.2]];
function buildQ() {
  const grp = new THREE.Group();
  const models = QM.map(([x, a], i) => { const m = makeModel('peak', { amp: a, seed: 20 + i }); m.position.set(x, TBY, 0); grp.add(m); return m; });
  const tops = QM.map(([x, a], i) => TBY + models[i].userData.topH);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.3, 10, 48).rotateX(Math.PI / 2), BASIC('#ffd24a')); grp.add(ring);
  const crown = makeCrown(); crown.scale.setScalar(2.6); grp.add(crown);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(3.4, 16, 12), ADD('#fff6c0', 0.5)); grp.add(halo);
  const bm = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 2.6, 24, 12, 1, true).translate(0, 12, 0), ADD('#fff0a0', 0.3)); grp.add(bm);
  const KEYS = [[0, [-38, 11, 40], [3, 9, 0]], [8.29, [-28, 12, 38], [4, 9.5, 0]]];
  const hop = [[0, 0], [1.0, 0], [1.7, 1], [2.5, 1], [3.2, 2], [3.9, 2], [4.4, 1], [4.8, 1], [5.2, 2]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    models.forEach((m, i) => m.userData.rise(cl((lt - (0.4 + 0.5 * i)) / 1.2)));
    const ix = piece(hop.map(([t, i]) => [t, QM[i][0]]), lt), iy = piece(hop.map(([t, i]) => [t, tops[i]]), lt);
    ring.visible = lt > 1.0 && lt < 5.63; ring.position.set(ix, iy + 2.6 + 0.4 * Math.sin(lt * 5), 0); const cd = lt > 5.33; ring.scale.setScalar(pop((lt - 1.0) / 0.4) * (1 + 0.08 * Math.sin(lt * (cd ? 11 : 4))));
    const ans = ramp(lt, 5.63, 6.4);
    models[2].userData.white(ans); crown.visible = ans > 0.02; crown.scale.setScalar(2.6 * pop((lt - 5.7) / 0.5)); crown.position.set(18, tops[2] + 2.4 + 0.3 * Math.sin(lt * 3), 0); crown.rotation.y = lt * 1.5;
    halo.visible = bm.visible = ans > 0.02; halo.position.set(18, tops[2] + 0.2, 0); halo.scale.setScalar(0.7 + 0.5 * ans + 0.1 * Math.sin(lt * 6)); bm.position.set(18, tops[2], 0); bm.material.opacity = 0.3 * ans;
  };
  const tipa = lt => ({ side: -1, xf: 0.78, size: 0.22, expr: lt < 1.0 ? 'neutral' : lt < 5.33 ? 'curious' : lt < 5.63 ? 'worried' : 'cheering', arms: lt < 5.63 ? 'down' : 'up', hop: lt > 5.63 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) });
  [0.4, 0.9, 1.4].forEach(t => ev(87.02 + t + 0.1, 'pop')); ev(92.35, 'countdown'); ev(92.65, 'answer'); ev(92.65, 'ding'); ev(94.0, 'stamp');
  return { grp, upd, tipa, branch: true, stage: true, sun: lt => ({ t: [0, 0, 0], ext: 56 }) };
}

/* ======================================================================== e: the plateau settles on the Golan */
function buildE() {
  const grp = new THREE.Group();
  const GY = -1.5, mp = makeModel('plateau', { seed: 31 }), mt = makeModel('peak', { amp: 0.95, seed: 32 });
  const P0 = [-16, GY, 54], tgt = (() => { const p = MAP.at(32.9, 35.78, 0); return [p[0], p[1], p[2]]; })();
  mt.position.set(2, GY, 54); grp.add(mp, mt);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.34, 10, 48).rotateX(Math.PI / 2), BASIC('#ffd24a')); grp.add(ring);
  const rip = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.0, 40).rotateX(-Math.PI / 2), ADD('#fff2a0', 0.8)); grp.add(rip);
  const gl = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 10), ADD('#ffe27a', 0.35)); gl.scale.y = 0.5; grp.add(gl);
  const clouds = [[-4, 12, -34], [6, 13, -26], [14, 11, -36]].map(([x, y, z]) => { const c = K.makeCloud({ scale: 0.8 }); c.position.set(x, y, z); grp.add(c); return c; });
  const sunB = new THREE.Mesh(new THREE.SphereGeometry(2.4, 18, 14), BASIC('#ffd24a')); sunB.position.set(14, 20, 30); grp.add(sunB);
  const sunH = new THREE.Mesh(new THREE.SphereGeometry(4.2, 18, 14), ADD('#ffe27a', 0.35)); sunH.position.copy(sunB.position); grp.add(sunH);
  const fly = lt => cl((lt - 8.1) / 4.6);
  const KEYS = [[0, [-8, 22, 94], [-7, 3.5, 44]], [7.9, [-8, 24, 90], [-6, 3.5, 44]], [14.5, [0, 40, 66], [6, 0, -4]], [25.01, [-2, 46, 52], [5, 0, -12]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    mt.userData.rise(cl((lt - 0.4) / 1.3)); mp.userData.rise(cl((lt - 1.0) / 1.3));
    const u = fly(lt), e = sm(u);
    const sc = 1 + (0.36 - 1) * e, lift = 26 * Math.sin(Math.PI * u) * (u > 0 && u < 1 ? 1 : 0);
    const land = ramp(lt, 12.5, 12.9) * (1 - ramp(lt, 14.8, 15.4)), sq = 1 + 0.1 * Math.sin((lt - 12.7) * 14) * Math.exp(-(lt - 12.7) * 2.4) * (lt > 12.7 ? 1 : 0);
    mp.position.set(P0[0] + (tgt[0] - P0[0]) * e, P0[1] + (tgt[1] + 0.25 - P0[1]) * e + lift, P0[2] + (tgt[2] - P0[2]) * e); mp.scale.set(sc * sq, sc / sq, sc * sq); mp.rotation.y = 6.283 * 0.5 * e;
    mp.userData.glow(0.8 * land + (lt > 7.87 && lt < 8.4 ? 0.7 : 0));
    const ru = (lt - 2.6) / 0.5, cd = lt > 7.57;
    ring.visible = ru > 0 && lt < 8.1; ring.scale.setScalar(pop(ru) * (1 + 0.07 * Math.sin(lt * (cd ? 10 : 4)))); ring.position.set(P0[0], GY + 7.2 + 0.4 * Math.sin(lt * 4), P0[2]);
    ring.material.color.set(lt > 7.87 ? '#7be08a' : '#ffd24a');
    const ru2 = cl((lt - 12.6) / 2.0); rip.visible = ru2 > 0 && ru2 < 1; rip.position.set(tgt[0], tgt[1] + 0.4, tgt[2]); rip.scale.setScalar(2 + 7 * ru2); rip.material.opacity = 0.8 * (1 - ru2);
    gl.visible = land > 0.02; gl.position.set(tgt[0], tgt[1] + 1.4, tgt[2]); gl.material.opacity = 0.35 * land * (0.8 + 0.2 * Math.sin(lt * 6));
    clouds.forEach((cd2, i) => { const cu = (lt - (17.5 + i * 0.9)) / 0.9; cd2.visible = cu > 0; cd2.scale.setScalar(0.8 * pop(cu)); cd2.position.x += 0; });
    const su = (lt - 19.0) / 1.0; sunB.visible = sunH.visible = su > 0; sunB.scale.setScalar(pop(su)); sunH.scale.setScalar(pop(su) * (1 + 0.06 * Math.sin(lt * 3)));
    recolor(0, -1);
  };
  const tipa = lt => ({ side: 1, xf: 0.8, size: 0.22, expr: lt < 2.6 ? 'curious' : lt < 7.57 ? 'worried' : lt < 8.1 ? 'surprised' : lt < 12.6 ? 'surprised' : 'cheering', arms: lt < 7.87 ? 'down' : lt < 12.6 ? 'point' : 'up', hop: lt > 12.6 ? 0.6 : 0, show: cl((lt - 0.2) / 0.5) });
  ev(95.31 + 0.5, 'pop'); ev(95.31 + 1.1, 'pop'); ev(102.88, 'countdown'); ev(103.18, 'answer'); ev(103.18, 'whoosh'); ev(95.31 + 12.6, 'ding'); ev(106.84, 'stamp');
  return { grp, upd, tipa, map: true, sun: { t: [0, 0, 20], ext: 90 } };
}

/* ======================================================================== assembly */
const SH = [['a', 0, 15.8, buildA], ['b', 15.8, 36.97, buildB], ['c', 36.97, 63.74, buildC], ['d', 63.74, 72.73, buildD],
            ['x', 72.73, 87.02, buildX], ['q', 87.02, 95.31, buildQ], ['e', 95.31, DUR, buildE]].map(([id, t0, t1, fn]) => Object.assign({ id, t0, t1 }, fn()));
SH.forEach(s => { scene.add(s.grp); s.grp.visible = false; });
const isMap = s => !!s.map;
let HERO = null;

function frame(tl) {
  const t = Math.max(0, Math.min(DUR - 0.001, tl));
  let si = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i].t0) si = i;
  const s = SH[si], lt = t - s.t0;
  SH.forEach((o, i) => { o.grp.visible = i === si; });
  stage.visible = !!s.stage;
  mapRoot.visible = isMap(s); if (isMap(s)) { MAP.slide(0); MAP.paint(1); }
  branch.visible = !!s.branch; veil.visible = false;
  const sc = typeof s.sun === 'function' ? s.sun(lt) : s.sun, so = [38, 96, 48];
  sun.target.position.set(...sc.t); sun.position.set(sc.t[0] + so[0], sc.t[1] + so[1], sc.t[2] + so[2]);
  if (sun.shadow.camera.right !== sc.ext) { Object.assign(sun.shadow.camera, { left: -sc.ext, right: sc.ext, top: sc.ext, bottom: -sc.ext }); sun.shadow.camera.updateProjectionMatrix(); }
  s.upd(lt, t);
  cam.updateMatrixWorld();
  const tp = s.tipa(lt);
  comp.place(Object.assign({ t }, tp)); comp.sync();
  const shw = tp.show == null ? 1 : tp.show;
  HERO = { visible: shw > 0.5, behindCamera: false, heightFrac: tp.size || 0.22, cx: 0.5 + 0.5 * (tp.side || 1) * (tp.xf || 0.78), cy: 0.74 };
  renderer.autoClear = false; renderer.clear(); renderer.render(scene, cam); renderer.clearDepth(); renderer.render(scene2, cam);
}

window.__dur = DUR;
window.__shots = SH.map((s, i) => ({ id: 's3' + s.id, index: i, t0: s.t0, dur: +(s.t1 - s.t0).toFixed(2) }));
window.__events = EV.sort((a, b) => a.t - b.t);
window.__caption = () => null; window.__heroBox = () => HERO; window.__sceneHash = () => 'toldot10g-s3-v1';
window.__errors = [];
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

setTimeout(async () => {
  try {
    await comp.warm();
    for (const s of SH) { frame(s.t0 + 0.5); frame(s.t0 + (s.t1 - s.t0) * 0.5); }
    frame(0); window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
}, 0);
