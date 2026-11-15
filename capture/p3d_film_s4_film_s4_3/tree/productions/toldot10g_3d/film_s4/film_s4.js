/* toldot10g film_s4 (climate: two lands inside one land) - gezer_trip look. 118.32 s, timing locked from the real narration.
   NO PEOPLE, NO TEXT. ASCII only. Every frame is a pure function of t.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur, window.__shots, window.__events. */
import * as THREE from 'three';
import { makeSkyDome } from '../../gezer_trip/film_a/gz_kit.js';
import { track } from '../../gezer_trip/film_a/gz_kit2.js';
import * as K from '../kit10g.js';
const { cl, ramp, pop, C, hash2, piece, sm, rng, lam, phong, heightMesh, noiseTex, woodTex, tufts, rocks, bushes, makeCity, makeHills, makeClouds, ll, mapY } = K;

const DUR = 118.32;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#fbe9bd', 200, 900);
const sky = makeSkyDome('#79c3ee', '#fbe9bd'); scene.add(sky);
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000); scene.add(cam);
const hemi = new THREE.HemisphereLight('#bcd9f5', '#8a7a55', 0.85); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1d0', 2.1); sun.castShadow = true;
sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 500 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

/* mood: summer gold -> winter grey (used at the end of the last quiz) */
const M0 = { top: C('#79c3ee'), hor: C('#fbe9bd'), sun: C('#fff1d0'), sunI: 2.1, hemI: 0.85 };
const MG = { top: C('#8c9db2'), hor: C('#cdd0d2'), sun: C('#c9d3e0'), sunI: 1.0, hemI: 0.7 };
function setMood(k) {
  sky.material.uniforms.uTop.value.copy(M0.top).lerp(MG.top, k); sky.material.uniforms.uHor.value.copy(M0.hor).lerp(MG.hor, k);
  scene.fog.color.copy(sky.material.uniforms.uHor.value);
  sun.color.copy(M0.sun).lerp(MG.sun, k); sun.intensity = M0.sunI + (MG.sunI - M0.sunI) * k; hemi.intensity = M0.hemI + (MG.hemI - M0.hemI) * k;
}

const scene2 = new THREE.Scene(); scene2.add(new THREE.HemisphereLight('#ffffff', '#9a8a70', 1.0)); const l2 = new THREE.DirectionalLight('#fff4dc', 1.3); l2.position.set(10, 20, 30); scene2.add(l2);
const comp = K.makeCompanion(cam, scene2);
const branch = K.makeBranch(); branch.position.z = -12; cam.add(branch);

const backdrop = rotY => { const g = new THREE.Group(); g.add(makeHills(lam('#9db483'), lam('#b2c6b4'), lam('#d0dde0')), makeClouds(BASIC('#ffffff'))); g.rotation.y = rotY || 0; return g; };
const groundMat = (s, rx, ry) => lam('#ffffff', { vertexColors: true, map: noiseTex(s, rx, ry) });

/* ======================================================================== a: weather vs climate (hill set) */
function pageTex(kind) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320; const g = c.getContext('2d');
  g.fillStyle = '#fbf7ea'; g.fillRect(0, 0, 256, 320);
  g.fillStyle = '#c0392b'; g.fillRect(0, 0, 256, 54);
  g.fillStyle = '#5a1a14'; for (const x of [60, 196]) { g.beginPath(); g.arc(x, 16, 7, 0, 6.3); g.fill(); }
  g.strokeStyle = '#d8d0b8'; g.lineWidth = 3;
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) g.strokeRect(14 + i * 38, 218 + j * 32, 34, 28);
  const cloud = (x, y, s, col) => { g.fillStyle = col; g.strokeStyle = '#7a8ba0'; g.lineWidth = 4; g.beginPath(); g.arc(x - 28 * s, y + 6 * s, 20 * s, 0, 6.3); g.arc(x, y - 10 * s, 28 * s, 0, 6.3); g.arc(x + 30 * s, y + 6 * s, 20 * s, 0, 6.3); g.fill(); g.stroke(); g.fillRect(x - 46 * s, y + 6 * s, 92 * s, 20 * s); };
  const sunI = (x, y, s) => { g.fillStyle = '#ffc928'; g.strokeStyle = '#ffb000'; g.lineWidth = 6; for (let k = 0; k < 10; k++) { const a = k * 0.628; g.beginPath(); g.moveTo(x + Math.cos(a) * 34 * s, y + Math.sin(a) * 34 * s); g.lineTo(x + Math.cos(a) * 50 * s, y + Math.sin(a) * 50 * s); g.stroke(); } g.beginPath(); g.arc(x, y, 28 * s, 0, 6.3); g.fill(); };
  if (kind === 0) cloud(128, 140, 1.2, '#f2f6fa');
  if (kind === 1) sunI(128, 135, 1.2);
  if (kind === 2) { cloud(128, 120, 1.1, '#dfe6ee'); g.strokeStyle = '#3a98e0'; g.lineWidth = 7; for (const x of [88, 124, 160]) { g.beginPath(); g.moveTo(x, 168); g.lineTo(x - 8, 196); g.stroke(); } }
  if (kind === 3) { sunI(100, 120, 0.9); cloud(146, 150, 0.9, '#f2f6fa'); }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}

function buildA() {
  const grp = new THREE.Group();
  const hill = (x, z) => 13 * Math.exp(-Math.pow(x / 55, 2) - Math.pow((z + 88) / 38, 2)) + 6 * Math.exp(-Math.pow((x - 85) / 30, 2) - Math.pow((z + 40) / 30, 2));
  const hfn = (x, z) => 0.45 * Math.sin(x * 0.07 + 0.4) * Math.cos(z * 0.05) + 0.3 * Math.sin(z * 0.11 + x * 0.02 + 1.3) + hill(x, z);
  const GC = ['#9cc56a', '#86b257', '#a9c46a', '#93bd5e'].map(C), WH = C('#d6a93a'), DIRT = C('#b99766');
  const col = (x, y, z, c) => {
    c.copy(GC[Math.floor(hash2(Math.floor(x / 3), Math.floor(z / 3)) * 4)]);
    c.lerp(WH, sm((x - 28) / 3) * sm((72 - x) / 3) * sm((z + 34) / 3) * sm((-4 - z) / 3));
    const px = x - 2 * Math.sin(z * 0.04); c.lerp(DIRT, (1 - sm((Math.abs(px) - 1.6) / 1.4)) * sm((z + 75) / 6) * sm((34 - z) / 6) * 0.9);
    c.lerp(C('#c4b078'), sm((y - 8) / 4) * 0.5);
  };
  const g = heightMesh(-170, 170, -200, 70, 170, 135, hfn, col, groundMat(21, 22, 17)); g.castShadow = true; grp.add(g);
  grp.add(backdrop(0));
  const r = rng(4), tl = [];
  for (let k = 0; k < 400 && tl.length < 38; k++) { const x = (r() - 0.5) * 200, z = -12 - r() * 100; if (Math.abs(x) < 16 && z > -26) continue; tl.push([x, hfn(x, z), z, 0.8 + r() * 0.7, r()]); }
  for (let i = 0; i < 12; i++) { const x = -92 + i * 6.5, z = -24 + Math.sin(i) * 1.5; tl.push([x, hfn(x, z), z, 1.0, 0.3 + (i % 3) * 0.2]); }
  grp.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34', '#6aa04a']));
  const city = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 5, midTowers: true, scale: 2.2 }); city.position.set(0, hfn(0, -88) - 0.1, -88); grp.add(city);
  grp.add(K.wheatField(28, -34, 44, 30, hfn, 3500, 3));
  [[-22, -15, 0.1, 14], [-37, -13, 0.3, 12], [24, -12, -0.2, 10]].forEach(([x, z, ry, l]) => { const w = K.stoneWall(l, 1.3, ry); w.position.set(x, hfn(x, z) - 0.1, z); grp.add(w); });
  const rr = rng(8), rt = rng(10);
  grp.add(rocks(80, 2, () => [(rr() - 0.5) * 70, 0.1, -10 + rr() * 38], '#b9ae98', 0.25, 0.9));
  grp.add(tufts(1200, 3, () => { const x = (rt() - 0.5) * 70, z = -12 + rt() * 44; return [x, hfn(x, z), z]; }, ['#6f9d4a', '#86b257', '#9cc56a', '#b9c46f'], 0.4, 1.0));
  /* boards */
  const wood = lam('#8a5a30', { map: woodTex(3, 2, 2) });
  const board = (cx) => {
    const b = new THREE.Group();
    for (const dx of [-3.0, 3.0]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.38, 4.6, 0.38), wood); p.position.set(cx + dx, 2.3, -0.3); b.add(p); }
    const f = new THREE.Mesh(new THREE.BoxGeometry(7.6, 6.9, 0.3), wood); f.position.set(cx, 5.4, 0); b.add(f);
    const pn = new THREE.Mesh(new THREE.BoxGeometry(6.8, 6.1, 0.12), lam('#d9c9a0')); pn.position.set(cx, 5.4, 0.2); b.add(pn);
    return K.shadowable(b);
  };
  grp.add(board(-5.4), board(5.4));
  const pageGeo = new THREE.PlaneGeometry(3.6, 4.4).translate(0, -2.2, 0);
  const pageMat = k => new THREE.MeshLambertMaterial({ map: pageTex(k), side: THREE.DoubleSide, emissive: '#2a2a2a' });
  const L = new THREE.Group(); L.position.set(-5.4, 7.6, 0.3); const lp = new THREE.Mesh(pageGeo, pageMat(0)); lp.castShadow = true; L.add(lp); grp.add(L);
  const lcloud = K.makeCloud({ scale: 0.2 }); grp.add(lcloud);
  const arrow = K.makeArrow(1.6, 0.28, lam('#e0401e', { emissive: '#400' })); arrow.rotation.x = Math.PI; grp.add(arrow);
  const sf = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.4), pageMat(3)); grp.add(sf);
  const stack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.4, 1), lam('#f1ead6')); stack.castShadow = true; grp.add(stack);
  const NP = 16, ps = [], tst = []; let tt = 8.5;
  for (let i = 0; i < NP; i++) {
    tst.push(tt); tt += 0.34 * Math.pow(0.82, i);
    const pv = new THREE.Group(); pv.position.set(5.4, 7.6, 0.3 + 0.07 * (i + 1) + 0.02);
    const m = new THREE.Mesh(pageGeo, pageMat(i % 4)); pv.add(m); pv.visible = false; grp.add(pv); ps.push(pv);
  }
  const sunB = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 14), BASIC('#ffc928')); grp.add(sunB);
  const cB = K.makeCloud({ scale: 0.2 }); grp.add(cB);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.1, 8, 40), BASIC('#fff2a0', { transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false })); grp.add(ring);
  const KEYS = [[0, [0, 3.4, 46], [0, 5, 0]], [13.44, [0, 4.6, 27.5], [0, 5.2, 0]]];
  const upd = (lt, t) => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    const u = cl((lt - 0.7) / 0.8); L.rotation.x = -3.0 * (1 - sm(u)); L.visible = lt > 0.65;
    const cu = (lt - 1.7) / 0.6; lcloud.visible = cu > 0; lcloud.scale.setScalar(0.2 * pop(cu)); lcloud.position.set(-5.4 + 0.15 * Math.sin(lt * 1.3), 5.5 + 0.1 * Math.sin(lt * 1.7), 0.75);
    arrow.userData.pop(cl((lt - 3.0) / 0.5)); arrow.position.set(-5.4, 10.6 + 0.25 * Math.sin(lt * 3), 0.6);
    let landed = 0;
    ps.forEach((pv, i) => { const uu = cl((lt - tst[i]) / 0.55); pv.visible = lt >= tst[i]; pv.rotation.x = -3.0 * (1 - sm(uu)); if (uu >= 1) landed++; });
    const th = 0.04 + 0.07 * landed; stack.visible = lt > 2.0; stack.scale.set(pop((lt - 2.0) / 0.5), pop((lt - 2.0) / 0.5), th); sf.visible = stack.visible; sf.scale.setScalar(pop((lt - 2.0) / 0.5)); sf.position.set(5.4, 5.4, 0.3 + th + 0.01); stack.position.set(5.4, 5.4, 0.25 + th / 2);
    const su = (lt - 11.2) / 0.6; sunB.visible = cB.visible = su > 0;
    sunB.scale.setScalar(pop(su)); sunB.position.set(5.0, 5.9, 2.3); cB.scale.setScalar(0.2 * pop(su)); cB.position.set(5.9, 5.0, 2.7);
    ring.material.opacity = 0.8 * cl(su) * (0.6 + 0.4 * Math.sin(lt * 4)); ring.position.set(5.4, 5.4, 2.4);
  };
  const tipa = lt => ({ side: 1, xf: 0.76, size: 0.2, expr: lt < 1.2 ? 'neutral' : lt < 8.4 ? 'curious' : lt < 11.2 ? 'surprised' : 'cheering', arms: lt < 8.4 ? 'point' : lt < 11.2 ? 'down' : 'up', hop: lt > 11.2 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, branch: true, sun: { t: [0, 0, -4], ext: 90 } };
}

/* ======================================================================== shared table map */
const mapRoot = new THREE.Group(); scene.add(mapRoot);
const TABLE = K.makeTable(), MAP = K.makeTableMap();
mapRoot.add(TABLE, MAP.grp);
const BS = [MAP.bs[0], MAP.bs[1]];
const PLACES = { safed: ll(32.95, 35.50), centre: ll(31.78, 35.20), bs: ll(31.25, 34.79), eilat: ll(29.58, 34.95) };

function buildB() {
  const grp = new THREE.Group(); mapRoot.userData = mapRoot.userData || {};
  const clouds = [[-6, 9, -26, 0.55], [8, 10, -14, 0.5], [-9, 9, -6, 0.45]].map(([x, y, z, s]) => { const c = K.makeCloud({ scale: s }); c.position.set(x, y, z); c.userData.s = s; grp.add(c); return c; });
  const pin = K.makePin('#e0401e'); pin.userData.k = 2; pin.position.set(BS[0], mapY(BS[0], BS[1]) + 0.05, BS[1]); grp.add(pin);
  const line = new THREE.Mesh(new THREE.BoxGeometry(1, 0.28, 0.6), BASIC('#fff2a0', { transparent: true, opacity: 0.95 })); line.position.set(-2, 3.3, BS[1]); grp.add(line);
  const lineGlow = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 2.2), BASIC('#ffe27a', { transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })); lineGlow.position.copy(line.position); grp.add(lineGlow);
  const aN = K.makeArrow(5, 0.55, lam('#e0401e')), aS = K.makeArrow(5, 0.55, lam('#e0401e'));
  aN.rotation.x = -Math.PI / 2; aS.rotation.x = Math.PI / 2; grp.add(aN, aS);
  const KEYS = [[0, [2, 30, 36], [2, 0, -8]], [6, [1, 28, 32], [2, 0, -5]], [10, [-8, 26, 22], [-1, 0.5, 2]], [14, [-8, 25, 20], [-1, 0.5, 2]], [19.7, [2, 30, 36], [2, 0, -8]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    MAP.paint(ramp(lt, 0.3, 6.0));
    const sl = 3.2 * ramp(lt, 10.4, 12.6) * (1 - ramp(lt, 15.4, 17.6)); MAP.slide(sl);
    clouds.forEach((cd, i) => { const u = (lt - (1.0 + i * 0.8)) / 0.8; cd.visible = u > 0; cd.scale.setScalar(cd.userData.s * pop(u)); cd.position.x += 0; });
    pin.userData.pop(cl((lt - 6.2) / 0.6)); pin.userData.glow(ramp(lt, 7, 8) * (0.7 + 0.3 * Math.sin(lt * 5)));
    const lu = ramp(lt, 6.6, 8.6); line.visible = lineGlow.visible = lu > 0; line.scale.x = lineGlow.scale.x = Math.max(0.01, 52 * lu); line.position.x = lineGlow.position.x = -2;
    lineGlow.material.opacity = 0.22 + 0.12 * Math.sin(lt * 6);
    const au = cl((lt - 10.6) / 0.6) * (1 - ramp(lt, 15.4, 16.6)); aN.userData.pop(au); aS.userData.pop(au);
    aN.position.set(MAP.X1 + 5, 1.5, BS[1] - 3 - sl); aS.position.set(MAP.X1 + 5, 1.5, BS[1] + 3 + sl);
  };
  const tipa = lt => ({ side: 1, xf: 0.78, size: 0.2, expr: lt < 6.2 ? 'curious' : lt < 10.3 ? 'happy' : lt < 15.4 ? 'surprised' : 'happy', arms: lt < 6.2 ? 'down' : lt < 10.3 ? 'point' : 'up', hop: 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, map: true, sun: { t: [0, 0, 0], ext: 80 } };
}

function buildC() {
  const grp = new THREE.Group();
  const spec = [[PLACES.safed, 0.92], [PLACES.centre, 0.55], [PLACES.bs, 0.22], [PLACES.eilat, 0.04]];
  const tubes = [], rains = [], clouds = [], tops = [];
  spec.forEach(([p, lvl], i) => {
    const y0 = mapY(p[0], p[1]) + 0.1, t = K.makeTube(14, 2.3); t.position.set(p[0], y0, p[1]); grp.add(t); tubes.push(t);
    const c = K.makeCloud({ scale: 0.7 }); c.position.set(p[0], y0 + 22, p[1]); grp.add(c); clouds.push(c);
    const rn = K.makeRain(50, 1.0, 9, (tb, k) => { const f = ramp(tb, 2.0 + 0.55 * i, 3.2 + 0.55 * i) * (1 - ramp(tb, 6.5 + 0.55 * i, 7.5 + 0.55 * i)); return { x: p[0] + (hash2(k, i) - 0.5) * 3.0, y: y0 + 21, z: p[1] + (hash2(k * 2.3, i + 7) - 0.5) * 3.0, p: f * Math.min(1, lvl * 1.6 + 0.12) }; }, () => y0 + 14.3);
    grp.add(rn); rains.push(rn); tops.push([p[0] - 3.2, y0 + 0.2 + lvl * 13.6, p[1]]);
  });
  const pts = [tops[0]]; for (let i = 1; i < 4; i++) { pts.push([tops[i - 1][0], tops[i - 1][1], tops[i][2]]); pts.push(tops[i]); }
  const stair = K.makeThickLine(pts, 0.3, BASIC('#ffcf3a')); grp.add(stair);
  const KEYS = [[0, [-52, 52, 36], [2, 2, 4]], [12.9, [-46, 42, 26], [2, 2, 3]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    tubes.forEach((t, i) => {
      t.userData.grow(cl((lt - (0.4 + 0.5 * i)) / 0.6));
      t.userData.setFill(spec[i][1] * ramp(lt, 2.0 + 0.55 * i, 6.8 + 0.55 * i));
      const cu = (lt - (1.2 + 0.5 * i)) / 0.6; clouds[i].visible = cu > 0; clouds[i].scale.setScalar(0.7 * pop(cu));
      rains[i].userData.update(lt);
    });
    stair.userData.setU(ramp(lt, 8.4, 11.6));
  };
  const tipa = lt => ({ side: 1, xf: 0.78, size: 0.2, expr: lt < 8.4 ? 'curious' : lt < 11.6 ? 'surprised' : 'cheering', arms: lt < 8.4 ? 'point' : 'up', hop: lt > 11.6 ? 0.5 : 0, show: 1 });
  return { grp, upd, tipa, map: true, sun: { t: [0, 0, 0], ext: 80 } };
}

/* ======================================================================== d / e : the cut-away mountain */
function buildCut(kind) {
  const cut = K.makeCutaway(), grp = cut.grp, { prof, surfH } = cut;
  const rt = rng(kind === 'd' ? 3 : 13), tl = [];
  for (let k = 0; k < 200 && tl.length < 70; k++) { const x = -16 + rt() * 17.5, z = (rt() - 0.5) * 11; tl.push([x, surfH(x, z), z, 0.6 + rt() * 0.55, rt()]); }
  const trees = K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34']); grp.add(trees);
  const rb = rng(6);
  grp.add(bushes(4, 6, () => { const x = 4 + rb() * 22, z = (rb() - 0.5) * 11; return [x, surfH(x, z), z]; }, '#b89a4c', 0.3, 0.8));
  grp.add(rocks(10, 4, () => { const x = 3 + rb() * 24, z = (rb() - 0.5) * 12; return [x, surfH(x, z) - 0.05, z]; }, '#c2b090', 0.22, 0.7));
  grp.add(rocks(14, 5, () => { const x = -3 + rb() * 9, z = (rb() - 0.5) * 11; return [x, surfH(x, z) - 0.05, z]; }, '#a49a7a', 0.3, 0.9));
  const rtf = rng(33);
  grp.add(tufts(40, 7, () => { const x = 4 + rtf() * 23, z = (rtf() - 0.5) * 12; return [x, surfH(x, z), z]; }, ['#c9b57c', '#d6c07a', '#b8a45a'], 0.4, 0.9));
  grp.add(backdrop(0));
  const cloudA = K.makeCloud({ scale: 1.1 }); cloudA.userData.base = 1.35; grp.add(cloudA);
  const SX = 14;
  const pg = new THREE.PlaneGeometry(14, 10, 28, 20).rotateX(-Math.PI / 2).translate(SX, 0, 0), pp = pg.attributes.position;
  for (let i = 0; i < pp.count; i++) pp.setY(i, surfH(pp.getX(i), pp.getZ(i)) + 0.7);
  pg.computeVertexNormals();
  const ac = document.createElement('canvas'); ac.width = ac.height = 128; { const g = ac.getContext('2d'), gr = g.createRadialGradient(64, 64, 8, 64, 64, 62); gr.addColorStop(0, '#fff'); gr.addColorStop(0.6, '#d0d0d0'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  const shadow = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ color: '#3d4652', transparent: true, opacity: 0, depthWrite: false, alphaMap: new THREE.CanvasTexture(ac) }));
  shadow.renderOrder = 4; shadow.material.depthTest = false; shadow.material.polygonOffset = true; grp.add(shadow);
  /* curtain draped on the cut face along the eastern slope line (face is what the camera sees) */
  const cp = [], ci = [], X0s = 7.5, X1s = 24.5, NS = 34;
  for (let i = 0; i <= NS; i++) { const x = X0s + (X1s - X0s) * i / NS, y = prof(x); cp.push(x, y + 0.05, 7.05, x, y - 2.6, 7.05); if (i < NS) { const k = i * 2; ci.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3));
  const cuv = []; for (let i = 0; i <= NS; i++) cuv.push(i / NS, 1, i / NS, 0); cg.setAttribute('uv', new THREE.Float32BufferAttribute(cuv, 2)); cg.setIndex(ci);
  const cc = document.createElement('canvas'); cc.width = 64; cc.height = 64; { const g = cc.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
  const curtain = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: '#4a5260', transparent: true, opacity: 0, depthWrite: false, depthTest: false, side: THREE.DoubleSide, alphaMap: new THREE.CanvasTexture(cc) }));
  curtain.renderOrder = 5; grp.add(curtain);
  const place = (lt, base) => { const u = cl((lt - base) / 1.2); shadow.visible = curtain.visible = u > 0; shadow.material.opacity = 0.75 * sm(u); curtain.material.opacity = 0.85 * sm(u); };
  const KEYS = [[0, [-3, 5.2, 47], [-3, 3.0, 0]], [12, [2, 5.0, 43], [0, 3.2, 0]], [kind === 'd' ? 24.97 : 21.15, [8, 5.0, 44], [5, 3.0, 0]]];
  const surfRain = (x, z) => Math.max(0, surfH(x, z));
  if (kind === 'd') {
    const cx = lt => piece([[0, -32], [9.6, -6], [16.8, 2.5], [24.97, 29]], lt), cy = lt => Math.max(prof(cx(lt)) + 4.4, 7.6) + 0.4 * ramp(lt, 17, 24);
    const szf = lt => 1.45 * (1 - 0.4 * ramp(lt, 9.8, 14.5)) * (1 - 0.45 * ramp(lt, 16.6, 19));
    const inten = tb => ramp(tb, 3.5, 7) * (1 - ramp(tb, 16.2, 17.0)) * (0.3 + 0.7 * ramp(tb, 9.5, 12));
    const rain = K.makeRain(520, 1.0, 11, (tb, i, k) => { const s = szf(tb); return { x: cx(tb) + (hash2(i, k) - 0.5) * 3.4 * s, y: cy(tb) - 1.2 * s, z: (hash2(i * 3, k) - 0.5) * 9, p: inten(tb) }; }, surfRain);
    grp.add(rain);
    const sPts = []; for (let i = 0; i <= 16; i++) { const x = 1 - i, z = 3 + 0.8 * Math.sin(x * 0.5); sPts.push([x, surfH(x, z) + 0.18, z]); }
    const stream = K.makeThickLine(sPts, 0.2, BASIC('#6ec6ff')); grp.add(stream);
    const upd = lt => {
      const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
      cut.wt.offset.set(lt * 0.03, 0);
      const sq = ramp(lt, 10, 13) * (1 - ramp(lt, 16.4, 17.2)) * (0.75 + 0.25 * Math.sin(lt * 5)), s = szf(lt);
      cloudA.visible = lt > 0.15; cloudA.scale.set(s * (1 + 0.22 * sq), s * (1 - 0.32 * sq) * (1 - 0.4 * ramp(lt, 16.6, 18)), s);
      cloudA.position.set(cx(lt), cy(lt), 1.5);
      cloudA.userData.setTone(ramp(lt, 5, 13) * (1 - ramp(lt, 16.6, 18.5))); cloudA.userData.setOpacity(1 - 0.4 * ramp(lt, 16.6, 18));
      rain.userData.update(lt);
      trees.userData.apply(0.7 + 0.3 * ramp(lt, 6, 18));
      stream.userData.setU(ramp(lt, 12.5, 17.5));
      place(lt, 17.2);
    };
    const tipa = lt => ({ side: -1, xf: 0.8, size: 0.2, expr: lt < 9.8 ? 'worried' : lt < 16.6 ? 'surprised' : lt < 20 ? 'curious' : 'happy', arms: lt < 9.8 ? 'down' : lt < 16.6 ? 'up' : 'point', hop: 0, show: cl((lt - 0.2) / 0.5) });
    return { grp, upd, tipa, branch: true, sun: { t: [0, 0, 0], ext: 62 } };
  }
  /* e: quiz, two clouds, ring over the east */
  trees.userData.apply(1);
  const cW = K.makeCloud({ scale: 1.2 }), cE = K.makeCloud({ scale: 1.2 }); grp.add(cW, cE);
  cE.userData.setTone(0); cE.userData.setOpacity(0.55); cW.userData.setTone(0);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.3, 10, 48), BASIC('#ffd24a', { transparent: true, opacity: 0.95 })); grp.add(ring);
  const wx = -9, ex = 13.5, wy = prof(wx) + 4.6, ey = prof(ex) + 4.8;
  const rain = K.makeRain(260, 1.0, 11, (tb, i, k) => ({ x: wx + (hash2(i, k) - 0.5) * 3.6, y: wy - 1.4, z: (hash2(i * 3, k) - 0.5) * 8, p: ramp(tb, 7.5, 9.5) }), surfRain);
  grp.add(rain);
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    cut.wt.offset.set(lt * 0.03, 0);
    const u1 = (lt - 0.35) / 0.7, u2 = (lt - 0.8) / 0.7;
    cW.visible = u1 > 0; cW.scale.setScalar(1.2 * pop(u1)); cW.position.set(wx + 0.4 * Math.sin(lt * 0.8), wy + 0.2 * Math.sin(lt * 1.1), 1.5);
    const shake = ramp(lt, 7.5, 7.7) * (1 - ramp(lt, 9.5, 10)) * Math.sin(lt * 14) * 0.12;
    cE.visible = u2 > 0; cE.scale.set(1.2 * pop(u2), 0.7 * pop(u2), 1.2 * pop(u2)); cE.position.set(ex + shake + 0.4 * Math.sin(lt * 0.9), ey + 0.2 * Math.sin(lt * 1.3), 1.5);
    const ru = (lt - 2.8) / 0.6, cd = lt > 7.15 ? 1 : 0; ring.visible = ru > 0; ring.scale.setScalar(pop(ru) * (1 + 0.06 * Math.sin(lt * (cd ? 9 : 3)))); ring.position.set(ex, ey, 2.4);
    ring.material.color.set(lt > 7.45 ? '#7be08a' : '#ffd24a');
    rain.userData.update(lt);
    place(lt, 7.6); if (lt > 8.8) { const q = 0.8 * (0.8 + 0.2 * Math.sin(lt * 4)); shadow.material.opacity = q; curtain.material.opacity = q; }
  };
  const tipa = lt => ({ side: -1, xf: 0.8, size: 0.2, expr: lt < 2.8 ? 'curious' : lt < 7.15 ? 'worried' : lt < 10.43 ? 'surprised' : 'cheering', arms: lt < 7.15 ? 'down' : lt < 10.43 ? 'point' : 'up', hop: lt > 10.43 ? 0.6 : 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, mood: lt => ramp(lt, 10.43, 21), sun: { t: [0, 0, 0], ext: 62 } };
}

/* ======================================================================== x: the transition belt + the book */
function buildX() {
  const grp = new THREE.Group();
  const hf = (x, z) => 0.5 * Math.sin(x * 0.05 + z * 0.03) + 0.35 * Math.sin(z * 0.07 + 1) + 0.18 * Math.sin(x * 0.2 + z * 0.1);
  const dry = z => sm((z + 70) / 130);
  const GCs = ['#8fc063', '#7fb157', '#a6c76c', '#6fa04a'].map(C), GDs = ['#e2c070', '#d6b060', '#ecd08a', '#cfa656'].map(C);
  const col = (x, y, z, c) => { const gi = Math.floor(hash2(Math.floor(x / 4), Math.floor(z / 4)) * 4), d = dry(z); c.copy(GCs[gi]).lerp(GDs[gi], d); c.lerp(C('#e6d29a'), sm((z - 60) / 80) * 0.7); };
  grp.add(heightMesh(-180, 180, -170, 200, 190, 190, hf, col, groundMat(31, 24, 24)));
  const far = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), lam('#d8c58a')); far.position.y = -0.4; grp.add(far);
  grp.add(backdrop(Math.PI));
  const r = rng(12), tl = [];
  for (let k = 0; k < 6000 && tl.length < 240; k++) { const x = (r() - 0.5) * 240, z = -120 + r() * 200; if (Math.abs(x) < 7) continue; if (r() > 0.6 * Math.pow(1 - dry(z), 1.3)) continue; tl.push([x, hf(x, z), z, 0.8 + r() * 0.7, r()]); }
  for (let i = 0; i < 9; i++) for (const sx of [-18, 19]) tl.push([sx, hf(sx, -100 + i * 7), -100 + i * 7, 1.1, 0.4]);
  grp.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34']));
  const rb = rng(14), rt = rng(15), rg = rng(16);
  grp.add(bushes(200, 12, () => { const z = -40 + rb() * 140; if (rb() > dry(z)) return null; return [(rb() - 0.5) * 200, hf(0, z), z]; }, '#b8a55a', 0.4, 1.1));
  grp.add(tufts(900, 14, () => { const z = -110 + rt() * 150, x = (rt() - 0.5) * 120; if (rt() > 1 - dry(z)) return null; return [x, hf(x, z), z]; }, ['#6f9d4a', '#86b257', '#9cc56a'], 0.5, 1.1));
  grp.add(tufts(900, 15, () => { const z = -80 + rg() * 150, x = (rg() - 0.5) * 120; if (rg() > dry(z)) return null; return [x, hf(x, z), z]; }, ['#c9b57c', '#d6c07a', '#b8a45a'], 0.5, 1.1));
  grp.add(rocks(60, 16, () => [(rg() - 0.5) * 120, 0.1, -60 + rg() * 120], '#c2b090', 0.3, 1.0));
  grp.add(K.wheatField(-48, -52, 30, 26, hf, 2600, 3), K.wheatField(20, -34, 32, 26, hf, 2600, 4));
  const w = K.stoneWall(14, 1.3, 0.2); w.position.set(-14, hf(-14, -30), -30); grp.add(w);
  const city = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 7, midTowers: true, scale: 1.6 }); city.position.set(34, hf(34, 30), 30); city.rotation.y = Math.PI; grp.add(city);
  const book = K.makeBook(); book.scale.setScalar(1.7); grp.add(book);
  const swirl = K.makeSwirl(); grp.add(swirl);
  const rc = K.makeCloud({ scale: 0.6 }); grp.add(rc);
  const BK = [0, 8, -18];
  const rain = K.makeRain(16, 2.4, 8, (tb, i, k) => ({ x: BK[0] + (hash2(i, k) - 0.5) * 8, y: 16.5, z: BK[2] - 1 + (hash2(i * 3, k) - 0.5) * 3, p: 0.95 * ramp(tb, 10.2, 11.5), vx: (hash2(i, k + 5) - 0.5) * 2, vz: -3.5 }), (x, z) => hf(x, z) + 0.2);
  grp.add(rain);
  const camPos = lt => { const z = -95 + 2.3 * lt, y = 3.0 + 0.9 * sm((lt - 7) / 6); return [Math.sin(lt * 0.35) * 1.2, y, z]; };
  const sunFn = lt => ({ t: [0, 0, camPos(lt)[2] + 25], ext: 70 });
  const upd = lt => {
    const p = camPos(lt); cam.position.set(...p);
    cam.lookAt(0, p[1] + 0.8 + 6.0 * sm((lt - 8) / 6), p[2] + 40);
    const bu = (lt - 8.5) / 0.9; book.visible = bu > 0; book.scale.setScalar(1.7 * pop(bu)); book.position.set(BK[0], BK[1] + 0.35 * Math.sin(lt * 1.4), BK[2]); book.rotation.set(-0.95, 0.15 * Math.sin(lt * 0.6), 0, 'YXZ');
    swirl.position.set(BK[0] + 4, BK[1] + 1, BK[2]); swirl.userData.set(ramp(lt, 9.0, 10.5), lt); swirl.rotation.z = -1.1;
    const ru = (lt - 9.6) / 0.8; rc.visible = ru > 0; rc.scale.setScalar(0.6 * pop(ru)); rc.setRotationFromEuler(new THREE.Euler()); rc.position.set(BK[0], 17.6 + 0.2 * Math.sin(lt * 1.2), BK[2] - 1); rc.userData.setTone(0.75);
    rain.userData.update(lt);
  };
  const tipa = lt => ({ side: 1, xf: 0.78, size: 0.2, expr: lt < 8.4 ? 'happy' : 'surprised', arms: lt < 8.4 ? 'down' : 'point', hop: 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, branch: true, sun: sunFn };
}

/* ======================================================================== q : quiz on the map */
function buildQ() {
  const grp = new THREE.Group();
  const P = [[ll(32.9, 35.4), '#0f3d7a'], [ll(31.78, 35.2), '#e0401e'], [ll(31.25, 34.79), '#1fa05a']];
  const pins = P.map(([p, c]) => { const pn = K.makePin(c); pn.userData.k = 2; pn.position.set(p[0], mapY(p[0], p[1]) + 0.05, p[1]); grp.add(pn); return pn; });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(54, 0.3, 1.0), BASIC('#fff2a0', { transparent: true, opacity: 0.9 })); grp.add(bar);
  const barG = new THREE.Mesh(new THREE.BoxGeometry(54, 1.0, 3.0), BASIC('#ffe27a', { transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })); grp.add(barG);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.25, 10, 48).rotateX(Math.PI / 2), BASIC('#ffd24a')); grp.add(ring);
  const pts = []; for (let i = 0; i <= 30; i++) { const x = -13 + i * 0.95, z = BS[1] + 0.6 * Math.sin(i * 0.4); pts.push([x, mapY(x, z) + 0.5, z]); }
  const line = K.makeThickLine(pts, 0.34, BASIC('#ff8a1e')); grp.add(line);
  const bz = BS[1], KEYS = [[0, [3, 31, 36], [2, 0, -6]], [8.6, [2, 29, 34], [2, 0, -6]]];
  const upd = lt => {
    const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    pins.forEach((pn, i) => pn.userData.pop(cl((lt - (0.5 + 0.5 * i)) / 0.6)));
    const z = -36 + (bz + 36) * ramp(lt, 2.0, 4.6);
    bar.visible = barG.visible = lt > 2.0 && lt < 5.0; bar.position.set(-2, 3.4, z); barG.position.set(-2, 3.4, z);
    ring.visible = lt > 2.0; ring.position.set(BS[0], 3.0 + 0.4 * Math.sin(lt * 4), z); const cd = lt > 5.43;
    ring.scale.setScalar(pop((lt - 2.0) / 0.4) * (1 + 0.1 * Math.sin(lt * (cd ? 10 : 4)))); ring.position.x = BS[0] + (-BS[0] + 0) * (1 - ramp(lt, 2.0, 4.6)) * 0;
    pins[2].userData.glow(ramp(lt, 5.73, 6.1) * (0.7 + 0.3 * Math.sin(lt * 6)));
    line.userData.setU(ramp(lt, 5.8, 7.6));
  };
  const tipa = lt => ({ side: 1, xf: 0.78, size: 0.2, expr: lt < 2 ? 'neutral' : lt < 5.43 ? 'curious' : lt < 5.73 ? 'worried' : 'cheering', arms: lt < 5.73 ? 'down' : 'up', hop: lt > 5.73 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, map: true, sun: { t: [0, 0, 0], ext: 80 } };
}

/* ======================================================================== assembly */
const SH = [['a', 0, 13.44, buildA], ['b', 13.44, 33.13, buildB], ['c', 33.13, 46.04, buildC], ['d', 46.04, 71.01, () => buildCut('d')],
            ['x', 71.01, 88.56, buildX], ['q', 88.56, 97.17, buildQ], ['e', 97.17, DUR, () => buildCut('e')]].map(([id, t0, t1, fn]) => Object.assign({ id, t0, t1 }, fn()));
SH.forEach(s => { scene.add(s.grp); s.grp.visible = false; });
let lastTipa = null;
const isMap = s => !!s.map;

function frame(tl) {
  const t = Math.max(0, Math.min(DUR - 0.001, tl));
  let si = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i].t0) si = i;
  const s = SH[si], lt = t - s.t0;
  SH.forEach((o, i) => { o.grp.visible = i === si; });
  mapRoot.visible = isMap(s); if (isMap(s)) { MAP.slide(0); MAP.paint(1); }
  branch.visible = !!s.branch;
  setMood(s.mood ? s.mood(lt) : 0);
  const sc = typeof s.sun === 'function' ? s.sun(lt) : s.sun, so = [72, 63.6, 72];
  sun.target.position.set(...sc.t); sun.position.set(sc.t[0] + so[0], sc.t[1] + so[1], sc.t[2] + so[2]);
  if (sun.shadow.camera.right !== sc.ext) { Object.assign(sun.shadow.camera, { left: -sc.ext, right: sc.ext, top: sc.ext, bottom: -sc.ext }); sun.shadow.camera.updateProjectionMatrix(); }
  s.upd(lt, t);
  cam.updateMatrixWorld();
  lastTipa = s.tipa(lt); comp.place(Object.assign({ t }, lastTipa)); comp.sync();
  renderer.autoClear = false; renderer.clear(); renderer.render(scene, cam); renderer.clearDepth(); renderer.render(scene2, cam);
}

window.__dur = DUR;
window.__shots = SH.map((s, i) => ({ id: 's4' + s.id, index: i, t0: s.t0, dur: +(s.t1 - s.t0).toFixed(2) }));
window.__events = { q: { t0: 88.56, countdown: 93.99, answer: 94.29 }, e: { t0: 97.17, countdown: 104.32, answer: 104.62, stamp: 107.6 } };
window.__caption = () => null; window.__heroBox = () => (lastTipa && lastTipa.show > 0.05 ? { visible: true, behindCamera: false, heightFrac: lastTipa.size || 0.2 } : null); window.__sceneHash = () => 'toldot10g-s4-v1';
window.__errors = [];
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

(async () => {
  try {
    await comp.warm();
    for (const s of SH) { frame(s.t0 + 0.5); frame(s.t0 + (s.t1 - s.t0) * 0.5); }
    frame(0); window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
})();
