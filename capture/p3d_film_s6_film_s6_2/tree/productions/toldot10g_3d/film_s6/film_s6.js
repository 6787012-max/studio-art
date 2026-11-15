/* toldot10g film_s6 (rain) - gezer_trip look, grey-bright winter day. 123.58 s, timing locked from the real narration.
   NO PEOPLE, NO TEXT (digits 1 2 3 only). ASCII only. Every frame is a pure function of t.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur, window.__shots, window.__events, window.__heroBox. */
import * as THREE from 'three';
import { makeSkyDome } from '../../gezer_trip/film_a/gz_kit.js';
import { ashMat } from '../../gezer_trip/film_a/gz_kit3.js';
import * as K from '../kit10g.js';
import * as P from './s6_parts.js';
const { cl, ramp, pop, C, hash2, piece, sm, rng, lam, phong, heightMesh, noiseTex, woodTex, waveTex, tufts, rocks, bushes, makeHills, makeClouds, mapY } = K;
const { BASIC, ADD } = P;

const DUR = 123.58;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#dde3e4', 220, 950);
const sky = makeSkyDome('#9db4c9', '#dde3e4'); scene.add(sky);
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000); scene.add(cam);
const hemi = new THREE.HemisphereLight('#bcd9f5', '#8a7a55', 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight('#eef2f6', 1.7); sun.castShadow = true;
sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 500 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

const MOODS = {
  sum: { top: '#79c3ee', hor: '#fbe9bd', sun: '#fff1d0', sunI: 2.1, hemI: 0.85 },
  win: { top: '#9db4c9', hor: '#dde3e4', sun: '#eef2f6', sunI: 1.7, hemI: 1.05 },
  hot: { top: '#3d97e4', hor: '#fde9b0', sun: '#fff0c8', sunI: 2.5, hemI: 0.85 },
  spr: { top: '#79c3ee', hor: '#f4f1d2', sun: '#fff3d6', sunI: 2.1, hemI: 0.95 }
};
const MC = {}; for (const k in MOODS) { const m = MOODS[k]; MC[k] = { top: C(m.top), hor: C(m.hor), sun: C(m.sun), sunI: m.sunI, hemI: m.hemI }; }
function setMood(a, b, k) {
  const A = MC[a], B = MC[b];
  sky.material.uniforms.uTop.value.copy(A.top).lerp(B.top, k); sky.material.uniforms.uHor.value.copy(A.hor).lerp(B.hor, k);
  scene.fog.color.copy(sky.material.uniforms.uHor.value);
  sun.color.copy(A.sun).lerp(B.sun, k); sun.intensity = A.sunI + (B.sunI - A.sunI) * k; hemi.intensity = A.hemI + (B.hemI - A.hemI) * k;
}

const scene2 = new THREE.Scene(); scene2.add(new THREE.HemisphereLight('#ffffff', '#9a8a70', 1.0)); const l2 = new THREE.DirectionalLight('#fff4dc', 1.3); l2.position.set(10, 20, 30); scene2.add(l2);
const comp = K.makeCompanion(cam, scene2);
const branch = K.makeBranch(); branch.position.z = -12; cam.add(branch);

/* smooth camera through keys [[t, pos, look], ...] (cubic Hermite, never stops mid-shot) */
function camAt(lt, keys) {
  let i = 0; while (i < keys.length - 2 && lt > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1], k0 = keys[Math.max(0, i - 1)], k3 = keys[Math.min(keys.length - 1, i + 2)];
  const h = b[0] - a[0], u = cl((lt - a[0]) / h), u2 = u * u, u3 = u2 * u;
  const f = j => [0, 1, 2].map(c => {
    const m0 = (b[j][c] - k0[j][c]) / ((b[0] - k0[0]) || 1) * h, m1 = (k3[j][c] - a[j][c]) / ((k3[0] - a[0]) || 1) * h;
    return (2 * u3 - 3 * u2 + 1) * a[j][c] + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * b[j][c] + (u3 - u2) * m1;
  });
  cam.position.set(...f(1)); cam.lookAt(...f(2));
}
const mkPath = pts => {
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
  const len = cum[cum.length - 1];
  return { len, at(u) { const d = cl(u) * len; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const f = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return [0, 1, 2].map(c => pts[i - 1][c] + (pts[i][c] - pts[i - 1][c]) * f); } };
};
const cr = (pts, n) => new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))).getPoints(n).map(v => [v.x, v.y, v.z]);
const T = (side, xf, expr, arms, hop, show) => ({ side, xf, size: 0.2, expr, arms, hop: hop || 0, show: show == null ? 1 : show });

const backdrop = (rotY, cols) => { const g = new THREE.Group(); cols = cols || ['#9db483', '#b2c6b4', '#d0dde0']; g.add(makeHills(lam(cols[0]), lam(cols[1]), lam(cols[2])), makeClouds(BASIC('#ffffff'))); g.rotation.y = rotY || 0; return g; };
const groundMat = (s, rx, ry) => lam('#ffffff', { vertexColors: true, map: noiseTex(s, rx, ry) });

let MAP = null, TABLE = null; const camBadges = [];
const mapRoot = new THREE.Group(); scene.add(mapRoot);
const tableRoot = new THREE.Group(); scene.add(tableRoot);

/* ======================================================================== a: the water cycle on a cut-away */
function buildA() {
  const cut = K.makeCutaway(), grp = cut.grp, { prof, surfH } = cut;
  const rt = rng(3), tl = [];
  for (let k = 0; k < 200 && tl.length < 70; k++) { const x = -16 + rt() * 17.5, z = (rt() - 0.5) * 11; tl.push([x, surfH(x, z), z, 0.6 + rt() * 0.55, rt()]); }
  grp.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34']));
  const rb = rng(6), rk = rng(33);
  grp.add(bushes(8, 6, () => { const x = 4 + rb() * 22, z = (rb() - 0.5) * 11; return [x, surfH(x, z), z]; }, '#a08a42', 0.3, 0.8));
  grp.add(rocks(10, 4, () => { const x = 3 + rb() * 24, z = (rb() - 0.5) * 12; return [x, surfH(x, z) - 0.05, z]; }, '#c2b090', 0.22, 0.7));
  grp.add(rocks(14, 5, () => { const x = -3 + rb() * 9, z = (rb() - 0.5) * 11; return [x, surfH(x, z) - 0.05, z]; }, '#a49a7a', 0.3, 0.9));
  grp.add(tufts(60, 7, () => { const x = 4 + rk() * 23, z = (rk() - 0.5) * 12; return [x, surfH(x, z), z]; }, ['#c9b57c', '#d6c07a', '#b8a45a'], 0.4, 0.9));
  grp.add(backdrop(0));
  /* sun over the sea */
  const sunG = new THREE.Group(); sunG.position.set(-23, 15.4, 0.5);
  sunG.add(new THREE.Mesh(new THREE.SphereGeometry(1.7, 24, 16), BASIC('#ffd84a')), new THREE.Mesh(new THREE.SphereGeometry(3.4, 16, 12), ADD('#fff2a0', 0.3)));
  const rays = new THREE.Group(); for (let i = 0; i < 12; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.6, 0.1), BASIC('#ffcf3a')); const a = i * Math.PI / 6; r.position.set(Math.sin(a) * 3.2, Math.cos(a) * 3.2, 0); r.rotation.z = -a; rays.add(r); }
  sunG.add(rays); grp.add(sunG);
  /* vapour */
  const NV = 40, vap = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 8, 6), BASIC('#ffffff', { transparent: true, opacity: 0.9 }), NV); vap.frustumCulled = false; grp.add(vap);
  const dm = new THREE.Object3D();
  const updVap = lt => {
    const act = ramp(lt, 0.5, 1.5) * (1 - ramp(lt, 8.0, 9.6)), per = 3.6;
    for (let i = 0; i < NV; i++) {
      const age = ((lt + hash2(i, 1.7) * per) % per) / per, x0 = -26 + hash2(i, 5.5) * 8, e = age * age;
      const s = act * Math.sin(Math.PI * age) * (0.7 + hash2(i, 8) * 0.8);
      dm.position.set(x0 * (1 - e) + (-20) * e + 0.5 * Math.sin(lt * 2 + i), 0.7 + age * 12.6, (hash2(i, 9) - 0.5) * 8); dm.scale.setScalar(Math.max(0.0001, s)); dm.updateMatrix(); vap.setMatrixAt(i, dm.matrix);
    }
    vap.instanceMatrix.needsUpdate = true;
  };
  /* cloud, rain, stream */
  const cloud = K.makeCloud({ scale: 1.0 }); grp.add(cloud);
  const cx = lt => piece([[0, -20], [7.84, -20], [14.2, -3.5], [24.82, -3.5]], lt);
  const surfRain = (x, z) => Math.max(0, surfH(x, z));
  const rain = K.makeRain(460, 1.0, 11, (tb, i, k) => ({ x: cx(tb) + (hash2(i, k) - 0.5) * 7, y: 12.4, z: (hash2(i * 3, k) - 0.5) * 10, p: ramp(tb, 13.4, 14.6) * (1 - ramp(tb, 22.5, 24)) }), surfRain);
  grp.add(rain);
  const sPts = []; for (let i = 0; i <= 22; i++) { const x = -3 - i * 0.66, z = 3 + 0.8 * Math.sin(x * 0.5); sPts.push([x, surfH(x, z) + 0.22, z]); }
  const stream = K.makeThickLine(sPts, 0.27, BASIC('#5ec4ff')); grp.add(stream);
  /* the thick loop arrow in four coloured segments */
  const Z0 = 8.6, V = THREE.Vector3;
  const L4 = [[-3.0, 8.9, Z0]]; for (let x = -4; x >= -17; x -= 1.6) L4.push([x, prof(x) + 1.7, Z0]); L4.push([-20, 1.9, Z0], [-22.2, 1.2, Z0]);
  const LS = [cr([[-22.5, 1.0, Z0], [-23.2, 5, Z0], [-21.5, 9.5, Z0], [-19.8, 12.0, Z0]], 14), cr([[-19.8, 12.0, Z0], [-14, 12.9, Z0], [-8, 12.6, Z0], [-3.4, 12.0, Z0]], 14),
    cr([[-3.4, 12.0, Z0], [-3.0, 10.4, Z0], [-3.0, 8.9, Z0]], 6), cr(L4, 16)];
  const COLS = ['#ff9a1a', '#7a52e0', '#1d8cf0', '#14b8a6'], WIN = [[0.6, 7.0], [8.0, 14.0], [14.2, 17.0], [18.9, 24.0]];
  const segs = LS.map((pts, i) => {
    const line = K.makeThickLine(pts, 0.34, BASIC(COLS[i])); grp.add(line);
    const e = pts[pts.length - 1], p = pts[pts.length - 3], dir = new V(e[0] - p[0], e[1] - p[1], 0).normalize();
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.3, 14).translate(0, 1.15, 0), BASIC(COLS[i])); head.position.set(e[0], e[1], e[2]); head.quaternion.setFromUnitVectors(new V(0, 1, 0), dir); grp.add(head);
    return { line, head, path: mkPath(pts) };
  });
  const allPath = mkPath([].concat(...LS));
  const rider = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 12), BASIC('#ffffff')); const rh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 10), ADD('#bfe6ff', 0.45)); rider.add(rh); grp.add(rider);
  const KEYS = [[0, [-14, 6.4, 50], [-12, 4.4, 0]], [9, [-6, 6.6, 48], [-7, 4.4, 0]], [18, [3, 6.6, 47], [1, 4.4, 0]], [24.82, [0, 6.6, 46], [-3, 4.3, 0]]];
  const upd = lt => {
    camAt(lt, KEYS); cut.wt.offset.set(lt * 0.03, 0);
    sunG.visible = true; rays.rotation.z = lt * 0.25; sunG.scale.setScalar(pop((lt - 0.2) / 0.5) * (1 + 0.04 * Math.sin(lt * 2)));
    updVap(lt);
    const cu = (lt - 3.4) / 1.2; cloud.visible = cu > 0; const sz = (0.7 + 0.45 * ramp(lt, 4, 8)) * pop(cu);
    const shake = ramp(lt, 14, 14.4) * (1 - ramp(lt, 21, 22.5)) * Math.sin(lt * 12) * 0.1;
    cloud.scale.set(sz * (1 + 0.12 * ramp(lt, 13.5, 14.5)), sz * (1 - 0.1 * ramp(lt, 13.5, 14.5)), sz); cloud.position.set(cx(lt) + shake, 14.2 + 0.2 * Math.sin(lt * 1.3), 1.5);
    cloud.userData.setTone(0.85 * ramp(lt, 9, 13)); cloud.userData.setOpacity(1 - 0.5 * ramp(lt, 21.5, 24.5));
    rain.userData.update(lt);
    stream.userData.setU(ramp(lt, 18.9, 23));
    segs.forEach((s, i) => { const p = ramp(lt, WIN[i][0], WIN[i][1]); s.line.userData.setU(p); const hu = (lt - WIN[i][1]) / 0.35; s.head.visible = hu > 0; s.head.scale.setScalar(Math.max(0.001, pop(hu))); });
    let rp;
    if (lt >= WIN[3][1]) rp = allPath.at(((lt - WIN[3][1]) * 0.15) % 1);
    else { let i = 3; while (i > 0 && lt < WIN[i][0]) i--; rp = segs[i].path.at(ramp(lt, WIN[i][0], WIN[i][1])); }
    rider.position.set(...rp); rider.visible = lt > 0.4; rider.scale.setScalar(1 + 0.15 * Math.sin(lt * 6));
  };
  const tipa = lt => lt < 7.84 ? T(-1, 0.78, 'curious', 'point', 0, cl((lt - 0.2) / 0.5)) : lt < 18.9 ? T(1, 0.78, lt < 14 ? 'surprised' : 'happy', lt < 14 ? 'up' : 'point', 0) : T(1, 0.78, 'cheering', 'up', 0.5);
  return { grp, upd, tipa, branch: true, mood: () => ['win', 'win', 0], sun: { t: [0, 0, 0], ext: 62 }, ev: [[0.5, 'pop'], [3.6, 'whoosh'], [8.0, 'whoosh'], [14.0, 'splash'], [18.9, 'splash'], [23.4, 'ding']] };
}

/* ======================================================================== b: rain gauge and one metre tile on a stone wall */
function gaugeBoard() {
  const c = cvs(128, 512), g = c.getContext('2d'); g.fillStyle = '#f7f1dc'; g.fillRect(0, 0, 128, 512);
  g.fillStyle = '#2a2a2a'; for (let k = 1; k <= 6; k++) { const y = 512 * (1 - (0.3 + 1.2 * k) / 8.6); g.fillRect(k === 1 ? 20 : 44, y - 3, k === 1 ? 88 : 64, k === 1 ? 7 : 5); }
  g.fillStyle = '#c0392b'; g.fillRect(14, 512 * (1 - 1.5 / 8.6) - 5, 100, 3);
  return new THREE.CanvasTexture(c);
}
function buildB() {
  const grp = new THREE.Group(), gg = new THREE.Group(); gg.position.y = -5.2; grp.add(gg);
  const hfG = (x, z) => 0.2 * Math.sin(x * 0.12) * Math.cos(z * 0.1) + 0.15 * Math.sin(z * 0.07 + x * 0.03) + 5.0 * sm((-z - 30) / 40);
  const GC = ['#88b058', '#7aa04e', '#9cb860', '#6e964a', '#a8b868'].map(C), SO = C('#b09a6e');
  gg.add(heightMesh(-130, 130, -150, 70, 130, 110, hfG, (x, y, z, c) => { c.copy(GC[Math.floor(hash2(Math.floor(x / 5), Math.floor(z / 5)) * 5)]); c.lerp(SO, sm(hash2(Math.floor(x / 11), Math.floor(z / 9) + 3) - 0.75) * 0.8); }, groundMat(41, 40, 30)));
  gg.add(backdrop(0, ['#8fae7c', '#a9bdb0', '#cfdadd']));
  const wall = K.stoneWall(40, 5, 0); wall.scale.z = 9; wall.position.set(-13, 0, 0); gg.add(wall);
  const rs = rng(51), tl = [];
  for (let k = 0; k < 300 && tl.length < 26; k++) { const x = -60 + rs() * 110, z = -12 - rs() * 40; tl.push([x, hfG(x, z), z, 1.2 + rs() * 0.8, rs()]); }
  gg.add(K.plantTrees(tl, ['#5b7f42', '#6a8c4a', '#4e7a3c']));
  const rr = rng(52);
  gg.add(rocks(40, 12, () => [-34 + rr() * 52, 0.1, 5.6 + rr() * 5], '#bdb29a', 0.25, 0.9));
  gg.add(tufts(500, 13, () => { const x = -38 + rr() * 60, z = 5.2 + rr() * 16; return [x, hfG(x, z), z]; }, ['#6f9d4a', '#86b257', '#9cc56a'], 0.4, 1.0));
  gg.add(K.inst(new THREE.SphereGeometry(0.2, 6, 5), lam('#ffffff'), 90, (i, d, col) => { const x = -38 + rr() * 62, z = 5.4 + rr() * 14; d.position.set(x, hfG(x, z) + 0.35, z); d.scale.set(1, 0.6, 1); return col.set(i % 3 ? '#e8504a' : '#f3d24a'); }));
  grp.add(K.inst(new THREE.SphereGeometry(0.24, 6, 5), lam('#ffffff'), 24, (i, d, col) => { d.position.set(-26 + rr() * 38, 5.45 + 0.1 - 5.2 + 0.05, (rr() - 0.5) * 7.5); d.scale.set(1.3, 0.6, 1.3); return col.set(i % 2 ? '#7aa04e' : '#8fb05a'); }));
  /* pedestal and gauge */
  const gx = -9.5, y0 = 2.0;
  const ped = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.0, 3.8), ashMat('#d8cdb0', 3.8, 2)); ped.position.set(gx, 1.0, 0); ped.castShadow = ped.receiveShadow = true; grp.add(ped);
  const gauge = new THREE.Group(); gauge.position.set(gx, y0, 0); grp.add(gauge);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 8.6), new THREE.MeshBasicMaterial({ map: gaugeBoard() })); board.position.set(0, 4.3, -0.8); gauge.add(board);
  const glassM = new THREE.MeshPhongMaterial({ color: '#d4eef8', transparent: true, opacity: 0.3, shininess: 120, specular: '#ffffff', side: THREE.DoubleSide, depthWrite: false });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 8.0, 20, 1, true).translate(0, 4.3, 0), glassM); tube.renderOrder = 3; gauge.add(tube);
  const baseP = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 0.3, 20), phong('#8a8f96', { shininess: 70 })); baseP.position.y = 0.15; gauge.add(baseP);
  const fn = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 0.7, 1.3, 24, 1, true).translate(0, 8.95, 0), glassM); fn.renderOrder = 3; gauge.add(fn);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.1, 8, 28).rotateX(Math.PI / 2), phong('#9aa0a8')); rim.position.y = 9.6; gauge.add(rim);
  const gw = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 16).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: '#4fb0ee', emissive: '#0c3a5c' })); gw.position.y = 0.3; gw.scale.y = 0.001; gauge.add(gw);
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.09, 8, 24).rotateX(Math.PI / 2), BASIC('#ffcf3a')); ring1.position.y = 1.5; gauge.add(ring1);
  const bd1 = P.badge(1, '#c0392b', 1.0); bd1.position.set(gx + 2.5, y0 + 1.6, 0.9); grp.add(bd1);
  /* tile, sheet, bottle */
  const tileG = new THREE.Group(); tileG.position.set(5, 0, 0); grp.add(tileG);
  const tile = new THREE.Mesh(new THREE.BoxGeometry(6, 0.35, 6).translate(-3, 0.175, 0), ashMat('#e2d7ba', 6, 0.35)); tile.castShadow = tile.receiveShadow = true; tileG.add(tile);
  const edge = (cx, cz, sx, sz) => { const e = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.14, sz), BASIC('#ffcf3a')); e.position.set(cx, 0.4, cz); tileG.add(e); return e; };
  const edges = [edge(-3, 3.05, 6.2, 0.18), edge(-3, -3.05, 6.2, 0.18), edge(0.05, 0, 0.18, 6.2), edge(-6.05, 0, 0.18, 6.2)];
  const bd2 = P.badge(1, '#1d6fd0', 1.8); bd2.rotation.x = -Math.PI / 2; bd2.position.set(-3, 0.45, 0); tileG.add(bd2);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.14, 5.8).translate(-2.95, 0.07, 0), new THREE.MeshPhongMaterial({ color: '#58b8ff', transparent: true, opacity: 0.72, shininess: 100, specular: '#ffffff', depthWrite: false })); sheet.position.set(-0.05, 0.36, 0); tileG.add(sheet);
  const pr = [[5.25, 0.3, 0], [6.2, 0.15, 0], [7.0, -0.7, 0], [7.5, -2.0, 0]];
  const pour = K.makeThickLine(pr, 0.2, BASIC('#5ec4ff')); grp.add(pour);
  const bottle = new THREE.Group(); bottle.position.set(7.5, -5.2, 0); grp.add(bottle);
  const bG = new THREE.MeshPhongMaterial({ color: '#d4eef8', transparent: true, opacity: 0.34, shininess: 120, specular: '#ffffff', side: THREE.DoubleSide, depthWrite: false });
  const parts = [new THREE.CylinderGeometry(1.5, 1.5, 2.2, 24).translate(0, 1.1, 0), new THREE.CylinderGeometry(0.55, 1.5, 0.9, 24).translate(0, 2.65, 0), new THREE.CylinderGeometry(0.55, 0.55, 0.3, 16).translate(0, 3.25, 0)];
  parts.forEach(gm => { const m = new THREE.Mesh(gm, bG); m.renderOrder = 3; bottle.add(m); });
  const bw = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.38, 1, 24).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: '#4fb0ee', emissive: '#0c3a5c' })); bw.position.y = 0.1; bw.scale.y = 0.001; bottle.add(bw);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.07, 8, 28).rotateX(Math.PI / 2), BASIC('#ffcf3a')); ring2.position.y = 1.75; bottle.add(ring2);
  const bd3 = P.badge(1, '#1d6fd0', 0.95); bd3.position.set(10.1, -5.2 + 1.75, 0.9); grp.add(bd3);
  const cloud = K.makeCloud({ scale: 1.5 }); cloud.position.set(-3, 17.5, -9); cloud.userData.setTone(0.7); grp.add(cloud);
  const rain = K.makeRain(220, 1.0, 17, (tb, i, k) => ({ x: -17 + hash2(i, k) * 27, y: 19, z: (hash2(i * 3, k) - 0.5) * 7, p: ramp(tb, 0.2, 0.8) * (0.9 - 0.7 * ramp(tb, 7.8, 8.6)) }), (x, z) => (x < 7.2 ? 0 : -5.2));
  grp.add(rain);
  const KEYS = [[0, [-8.5, 6.4, 28], [-9, 5.4, 0]], [4.4, [-4, 5.6, 27], [-5.5, 3.6, 0]], [6.4, [2.8, 4.6, 26], [2.6, 0.2, 0]], [14.85, [6.0, 5.0, 27], [5.4, -1.8, 0]]];
  const upd = lt => {
    camAt(lt, KEYS); cloud.position.x = -3 + 0.6 * Math.sin(lt * 0.3); rain.userData.update(lt);
    const fl = ramp(lt, 1.4, 3.6); gw.scale.y = Math.max(0.001, 1.2 * fl); gw.visible = fl > 0.003;
    ring1.visible = lt > 3.5; ring1.scale.setScalar(1 + 0.12 * Math.sin(lt * 7)); bd1.userData.pop((lt - 3.7) / 0.4);
    const sh = ramp(lt, 4.8, 7.8) * (1 - ramp(lt, 9.0, 12.8)); sheet.visible = sh > 0.003;
    const spread = ramp(lt, 4.8, 7.8), pu = ramp(lt, 9.0, 12.8);
    sheet.scale.set(Math.max(0.001, spread * (1 - pu)), 1, Math.max(0.001, spread));
    const tu = ramp(lt, 8.2, 9.6) * (1 - ramp(lt, 13.2, 14.4) * 0.4); tileG.rotation.z = -0.15 * tu;
    edges.forEach(e => { e.visible = lt > 5.6; e.material.color.set(Math.sin(lt * 6) > 0 ? '#ffcf3a' : '#fff0a0'); }); bd2.userData.pop((lt - 5.8) / 0.5);
    pour.userData.setU(ramp(lt, 9.2, 9.8)); pour.visible = lt > 9.2 && lt < 13.0;
    const bf = ramp(lt, 9.6, 12.9); bw.scale.y = Math.max(0.001, 1.65 * bf); bw.visible = bf > 0.003;
    ring2.visible = lt > 9.0; ring2.scale.setScalar(1 + 0.1 * Math.sin(lt * 6)); bd3.userData.pop((lt - 12.9) / 0.4);
  };
  const tipa = lt => lt < 5.8 ? T(1, 0.86, lt < 3.7 ? 'curious' : 'happy', lt < 3.7 ? 'point' : 'up', 0, cl((lt - 0.2) / 0.5)) : T(-1, 0.86, lt < 12.9 ? 'surprised' : 'cheering', lt < 12.9 ? 'point' : 'up', lt > 12.9 ? 0.5 : 0);
  return { grp, upd, tipa, branch: false, mood: () => ['win', 'win', 0], sun: { t: [-2, 0, 0], ext: 60 }, ev: [[0.6, 'splash'], [3.7, 'ding'], [5.8, 'pop'], [8.6, 'whoosh'], [9.4, 'splash'], [12.9, 'ding']] };
}

/* ======================================================================== c: three rules on the rain map */
function buildC() {
  const grp = new THREE.Group();
  const LKX = 15.4, LKZ = 18, LON0 = 35.0, LAT0 = 31.5;
  const wetR = [(x, z, h) => sm((LAT0 - z / LKZ - 31.0) / 2.0), (x, z, h) => sm((h - 0.9) / 1.6), (x, z, h) => 1 - sm((LON0 + x / LKX - 34.95) / 0.85)];
  const R = [[], [], []];
  const ovMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false });
  const ov = heightMesh(MAP.X0, MAP.X1, MAP.ZN, MAP.ZS, 62, 152, (x, z) => { const y = mapY(x, z); return y < 0.05 ? -2.5 : y + 0.09; }, (x, y, z, c) => {
    const h = mapY(x, z); for (let k = 0; k < 3; k++) R[k].push(wetR[k](x, z, h)); c.set('#ffffff');
  }, ovMat);
  ov.receiveShadow = false; grp.add(ov);
  const oc = ov.geometry.attributes.color, DRY = [0.95, 0.76, 0.19], WET = [0.1, 0.42, 0.9]; let okey = '';
  const setOv = w => {
    const sum = w[0] + w[1] + w[2], key = w.map(v => v.toFixed(2)).join('_'); ov.visible = sum > 0.01; ovMat.opacity = 0.55 * Math.min(1, sum);
    if (key === okey || sum <= 0.01) return; okey = key; const a = oc.array, n = R[0].length;
    for (let i = 0; i < n; i++) {
      const wet = (w[0] * R[0][i] + w[1] * R[1][i] + w[2] * R[2][i]) / sum;
      for (let c = 0; c < 3; c++) a[i * 3 + c] = DRY[c] + (WET[c] - DRY[c]) * wet;
    }
    oc.needsUpdate = true;
  };
  const wetAt = (rule, x, z) => wetR[rule](x, z, mapY(x, z));
  const arrow = (len, r, col, rx) => { const a = K.makeArrow(len, r, lam(col, { emissive: C(col).multiplyScalar(0.35) })); a.rotation.x = rx || 0; grp.add(a); return a; };
  const WETC = '#1d8cf0', DRYC = '#e8a418', DN = Math.PI;
  const rules = [
    { t0: 0.3, t1: 3.2, wet: arrow(8, 0.6, WETC, -Math.PI / 2), dry: arrow(7, 0.6, DRYC, Math.PI / 2), wp: [4, 6, -16], dp: [4, 6, 4] },
    { t0: 3.4, t1: 6.5, wet: arrow(5, 0.6, WETC, DN), dry: arrow(5, 0.6, DRYC, DN), wp: [1, 10, -14], dp: [8, 9, -14] },
    { t0: 6.7, t1: 99, wet: arrow(5, 0.6, WETC, DN), dry: arrow(5, 0.6, DRYC, DN), wp: [-2, 9, -4], dp: [9, 9, -4] }
  ];
  rules.forEach(r => { r.wet.position.set(...r.wp); r.dry.position.set(...r.dp); });
  const slots = [8, 1.5, -5];
  const plaques = [1, 2, 3].map((d, i) => { const b = P.badge(d, '#c0392b', 0.78); b.position.set(-5.7, slots[i] * 0.3, -12); cam.add(b); camBadges.push(b); return b; });
  const KEYS = [[0, [3, 32, 28], [4, 0, -6]], [9.69, [6, 30, 26], [5, 0, -7]]];
  const upd = lt => {
    camAt(lt, KEYS);
    const w = rules.map(r => ramp(lt, r.t0, r.t0 + 0.7) * (1 - ramp(lt, r.t1, r.t1 + 0.5)));
    setOv(w);
    rules.forEach((r, i) => {
      const on = (lt - r.t0) / 0.6, off = 1 - ramp(lt, r.t1, r.t1 + 0.5), pul = lt > r.t0 + 0.9 && lt < r.t1 ? 1 + 0.16 * Math.sin((lt - r.t0 - 0.9) * 8) : 1;
      r.wet.userData.pop(Math.min(on, off * 1.2)); r.wet.scale.multiplyScalar(pul); r.dry.userData.pop(Math.min(on - 0.25, off * 1.2));
    });
    const fin = lt > 7.6;
    plaques[0].userData.pop(fin ? (lt - 7.6) / 0.4 : Math.min((lt - 0.4) / 0.4, 1 - ramp(lt, 3.2, 3.5)));
    plaques[1].userData.pop(fin ? (lt - 7.8) / 0.4 : Math.min((lt - 3.6) / 0.4, 1 - ramp(lt, 6.5, 6.8)));
    plaques[2].userData.pop((lt - 6.9) / 0.4);
  };
  const tipa = lt => T(1, 0.78, lt < 3.4 ? 'curious' : lt < 6.7 ? 'happy' : 'surprised', lt < 3.4 ? 'point' : lt < 6.7 ? 'up' : 'point', 0, cl((lt - 0.2) / 0.5));
  return { grp, upd, tipa, map: true, table: true, mood: () => ['win', 'win', 0], sun: { t: [0, 0, 0], ext: 80 }, ev: [[0.5, 'pop'], [3.6, 'pop'], [6.9, 'pop'], [7.8, 'ding']] };
}

/* ======================================================================== d / e: two models on the table */
function buildTwo(kind) {
  const grp = new THREE.Group(), D = kind === 'd';
  const EG = P.makeEgyptModel(), LD = P.makeLandModel(D ? 3 : 8, 1);
  EG.grp.position.x = -17.5; LD.grp.position.x = 17.5; grp.add(EG.grp, LD.grp);
  /* props around */
  const bk = (x, z, c, w, h2, d2, ry) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h2, d2), lam(c)); b.position.set(x, -1.55 + h2 / 2, z); b.rotation.y = ry; b.castShadow = b.receiveShadow = true; grp.add(b); };
  bk(-44, 14, '#8a2f2a', 9, 1.6, 6.5, 0.2); bk(-44.2, 14, '#2f5a8a', 8.4, 1.4, 6.0, -0.1); bk(-43.8, 14, '#c9a24a', 8, 1.2, 5.8, 0.35);
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.1, 5, 16), phong('#2a5a8a', { shininess: 60 })); jar.position.set(40, -1.55 + 2.5, -26); jar.castShadow = true; grp.add(jar);
  for (let i = 0; i < 5; i++) { const pn = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 11, 6), phong(['#e8a41c', '#c0392b', '#2f8a4a', '#3a6ab0', '#e8a41c'][i])); pn.position.set(40 + (i - 2) * 0.8, -1.55 + 8.5, -26 + (i % 2) * 0.6); pn.rotation.set((i - 2) * 0.12, 0, (i - 2) * 0.16); pn.castShadow = true; grp.add(pn); }
  const gl = new THREE.Group(); gl.add(new THREE.Mesh(new THREE.SphereGeometry(5.5, 24, 16), lam('#3f86c8')), new THREE.Mesh(new THREE.TorusGeometry(5.9, 0.25, 8, 36), phong('#c9a24a', { shininess: 80 })), new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.0, 1.2, 18).translate(0, -6.3, 0), phong('#c9a24a', { shininess: 80 }))); gl.position.set(-42, -1.55 + 7.4, -26); gl.rotation.z = 0.3; gl.children.forEach(o => { o.castShadow = true; }); grp.add(gl);
  bk(-30, -30, '#2f5a8a', 9, 1.6, 6, 0.1); bk(-30.2, -30, '#8a2f2a', 8.4, 1.4, 5.6, -0.15);
  const cloud = K.makeCloud({ scale: 0.55 }); LD.inner.add(cloud);
  const lcx = lt => D ? -2.5 + 8 * sm((lt - 14.4) / 3.5) : -1 + 5 * sm((lt - 9.5) / 4);
  const rs = D ? [15.4, 21.0] : [9.4, 15.5];
  const rain = K.makeRain(210, 1.0, 8, (tb, i, k) => ({ x: lcx(tb) + (hash2(i, k) - 0.5) * 9, y: 9.0, z: (hash2(i * 3, k) - 0.5) * 10, p: ramp(tb, rs[0], rs[0] + 1.1) * (1 - ramp(tb, rs[1], rs[1] + 1.2)) }), (x, z) => LD.hfn(x, z));
  LD.inner.add(rain);
  const droplet = P.makeDrop('#58b8ff', 0.5); LD.inner.add(droplet);
  const ripple = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 24).rotateX(Math.PI / 2), BASIC('#ffffff', { transparent: true, opacity: 0.8 })); LD.inner.add(ripple);
  if (D) {
    const book = K.makeBook(); book.scale.setScalar(1.5); grp.add(book);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(4.0, 20, 14), ADD('#fff2b0', 0.2)); grp.add(glow);
    const rays = new THREE.Group(); for (let i = 0; i < 10; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 0.1), ADD('#fff2b0', 0.16)); const a = i * Math.PI / 5; r.position.set(Math.sin(a) * 6, Math.cos(a) * 6, 0); r.rotation.z = -a; rays.add(r); } grp.add(rays);
    const bar = P.makeBar(40); bar.position.set(0, -1.55, 18); grp.add(bar);
    const KEYS = [[0, [-26, 22, 42], [-20, 1, 0]], [6, [-20, 20, 37], [-17, 1, 0]], [12.8, [-2, 26, 48], [0, 1, 0]], [17, [22, 22, 40], [19, 3, 0]], [21.0, [19, 21, 39], [17, 3, 0]], [22.4, [0, 25, 66], [0, 1, 13]], [28.19, [0, 23, 62], [0, 0, 13]]];
    const upd = lt => {
      camAt(lt, KEYS);
      EG.upd({ pop: (lt - 0.3) / 0.9, river: ramp(lt, 1.2, 3.6), can: [0, 1, 2, 3, 4, 5].map(i => ramp(lt, 4.0 + i * 1.1, 5.4 + i * 1.1)), boats: (lt - 3.8) / 0.8, t: lt });
      LD.upd({ pop: (lt - 0.7) / 0.9, paint: ramp(lt, 15.8, 21.0), x0: lcx(lt), stream: ramp(lt, 17.5, 20.5), t: lt });
      const cu = (lt - 13.9) / 0.7; cloud.visible = cu > 0; cloud.scale.setScalar(0.55 * pop(cu)); cloud.position.set(lcx(lt), 9.4 + 0.2 * Math.sin(lt * 1.3), 0); cloud.userData.setTone(0.75 * ramp(lt, 14.5, 17)); cloud.userData.setOpacity(1 - ramp(lt, 21.2, 22.0));
      rain.userData.update(lt); droplet.visible = false; ripple.visible = false;
      const bu = (lt - 17.2) / 0.9 * (1 - ramp(lt, 20.8, 21.6)) + 0 * lt, bp = [LD.grp.position.x + 3, 16 + 0.4 * Math.sin(lt * 1.4), 4];
      const bv = lt > 17.2 && lt < 21.8; book.visible = glow.visible = rays.visible = bv;
      book.scale.setScalar(1.5 * pop(Math.min((lt - 17.2) / 0.9, 1 - ramp(lt, 20.8, 21.6)))); book.position.set(...bp); book.rotation.set(0.85, 0.2 * Math.sin(lt * 0.6), 0, 'YXZ'); book.userData.setOpen(ramp(lt, 17.4, 18.9));
      glow.position.set(...bp); glow.material.opacity = 0.2 + 0.06 * Math.sin(lt * 3); rays.position.set(...bp); rays.rotation.z = lt * 0.2;
      const bo = (lt - 21.8) / 0.7; bar.userData.setPop(bo); bar.userData.setEnds((lt - 22.3) / 0.5, (lt - 26.4) / 0.5);
      bar.userData.setFill(ramp(lt, 22.9, 26.2)); bar.userData.first.userData.glow(ramp(lt, 22.4, 23.0)); bar.userData.last.userData.glow(ramp(lt, 26.5, 27.1) * (0.8 + 0.2 * Math.sin(lt * 6)));
      void bu;
    };
    const tipa = lt => lt < 13.41 ? T(1, 0.8, lt < 5 ? 'curious' : 'happy', lt < 5 ? 'point' : 'down', 0, cl((lt - 0.2) / 0.5)) : lt < 21.61 ? T(-1, 0.8, lt < 17.2 ? 'surprised' : 'cheering', lt < 17.2 ? 'point' : 'up', lt > 17.2 ? 0.4 : 0) : T(1, 0.82, lt < 26.4 ? 'curious' : 'cheering', lt < 26.4 ? 'point' : 'up', lt > 26.4 ? 0.5 : 0);
    return { grp, upd, tipa, table: true, mood: lt => ['win', 'spr', ramp(lt, 17, 22) * 0.5], sun: { t: [0, 0, 6], ext: 80 }, ev: [[0.5, 'pop'], [1.2, 'whoosh'], [4.0, 'splash'], [13.9, 'pop'], [15.4, 'splash'], [17.2, 'ding'], [22.3, 'ding'], [26.4, 'ding']] };
  }
  /* e: quiz */
  const rIc = P.iconBadge('river', 4.2), cIc = P.iconBadge('cloud', 4.2); rIc.position.set(-17.5, 12.5, 0); cIc.position.set(17.5, 12.5, 0); grp.add(rIc, cIc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 10, 56), BASIC('#ffd24a')); ring.position.copy(cIc.position); grp.add(ring);
  const sp = LD.streamPts; const sPath = mkPath(sp.map(p => [p[0], p[1] + 0.35, p[2]]));
  const KEYS = [[0, [0, 27, 57], [0, 4, -2]], [8.3, [3, 26, 53], [3, 4, -2]], [12, [10, 24, 48], [9, 3, 0]], [21.17, [6, 22, 45], [5, 3, 0]]];
  const upd = lt => {
    camAt(lt, KEYS);
    EG.upd({ pop: (lt - 0.3) / 0.9, river: ramp(lt, 0.6, 2.0), can: [0, 1, 2, 3, 4, 5].map(i => ramp(lt, 1.2 + i * 0.35, 2.4 + i * 0.35)), boats: (lt - 2.0) / 0.8, t: lt });
    const pa = ramp(lt, 9.8, 14.8);
    LD.upd({ pop: (lt - 0.7) / 0.9, paint: pa, x0: lcx(lt), stream: ramp(lt, 11.0, 15.0), t: lt });
    const cu = (lt - 8.7) / 0.7; cloud.visible = cu > 0; cloud.scale.setScalar(0.55 * pop(cu)); cloud.position.set(lcx(lt), 9.4 + 0.2 * Math.sin(lt * 1.3), 0); cloud.userData.setTone(0.7 * ramp(lt, 9, 11.5));
    rain.userData.update(lt);
    const dv = ramp(lt, 12.0, 19.0); droplet.visible = lt > 12.0 && lt < 19.4; if (droplet.visible) { const p = sPath.at(dv); droplet.position.set(p[0], p[1], p[2]); droplet.userData.pop(1); }
    const rpu = (lt - 19.0) / 1.6; ripple.visible = rpu > 0 && rpu < 1; ripple.position.set(LD.sea[0] - 1, 0.7, sp[sp.length - 1][2]); ripple.scale.setScalar(0.5 + 3 * cl(rpu)); ripple.material.opacity = 0.8 * (1 - cl(rpu));
    const dim = 1 - 0.35 * ramp(lt, 8.6, 9.6);
    rIc.userData.pop((lt - 1.0) / 0.6, dim); cIc.userData.pop((lt - 2.2) / 0.6, 1 + 0.12 * ramp(lt, 8.6, 9.2)); rIc.lookAt(cam.position); cIc.lookAt(cam.position);
    const ru = (lt - 4.0) / 0.5, cd = lt > 8.29, an = lt > 8.59; ring.visible = ru > 0; ring.scale.setScalar(Math.max(0.01, 5.4 * pop(ru) * (1 + (an ? 0.05 : 0.07) * Math.sin(lt * (cd ? 11 : 3.5))))); ring.lookAt(cam.position);
    ring.material.color.set(an ? '#7be08a' : '#ffd24a');
  };
  const slide = lt => piece([[0, 0.8], [10.95, 0.8], [19.5, 0.22]], lt);
  const tipa = lt => lt < 8.59 ? T(-1, 0.8, lt < 4 ? 'curious' : lt < 8.29 ? 'worried' : 'surprised', lt < 8.29 ? 'down' : 'point', 0, cl((lt - 0.2) / 0.5)) : lt < 10.95 ? T(1, 0.8, 'surprised', 'point', 0) : T(1, slide(lt), 'cheering', 'up', 0.7);
  return { grp, upd, tipa, table: true, mood: lt => ['win', 'spr', ramp(lt, 8.6, 14)], sun: { t: [0, 0, 0], ext: 80 }, ev: [[0.5, 'pop'], [1.0, 'pop'], [2.2, 'pop'], [4.0, 'pop'], [8.29, 'countdown'], [8.59, 'answer'], [9.5, 'splash'], [10.95, 'stamp'], [19.0, 'splash']] };
}

/* ======================================================================== x: drought */
function crackTex(rx, ry) {
  const c = cvs(512, 512), g = c.getContext('2d'); g.fillStyle = '#dcbc7c'; g.fillRect(0, 0, 512, 512);
  const r = rng(5); g.strokeStyle = 'rgba(80,52,22,0.85)'; g.lineCap = 'round';
  for (let i = 0; i < 80; i++) { let x = r() * 512, y = r() * 512, a = r() * 6.28; g.lineWidth = 1.5 + r() * 2.5; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { a += (r() - 0.5) * 1.3; x += Math.cos(a) * (16 + r() * 26); y += Math.sin(a) * (16 + r() * 26); g.lineTo(x, y); } g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t;
}
function strataTex() {
  const c = cvs(512, 512), g = c.getContext('2d'), r = rng(9);
  [[0, 0.04, '#cdb37a'], [0.04, 0.3, '#9b7446'], [0.3, 0.6, '#85603a'], [0.6, 0.85, '#6f4d2d'], [0.85, 1, '#5e4025']].forEach(([a, b, col]) => { g.fillStyle = col; g.fillRect(0, a * 512, 512, (b - a) * 512 + 1); });
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? 'rgba(40,24,10,0.25)' : 'rgba(230,200,150,0.2)'; g.fillRect(r() * 512, r() * 512, 2 + r() * 4, 2 + r() * 3); }
  for (let i = 0; i < 40; i++) { g.fillStyle = '#b9a47c'; g.beginPath(); g.ellipse(r() * 512, 40 + r() * 460, 4 + r() * 8, 3 + r() * 5, r() * 3, 0, 6.3); g.fill(); }
  g.strokeStyle = 'rgba(60,36,16,0.6)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { let x = r() * 512, y = 14; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 24; y += 20 + r() * 20; g.lineTo(x, y); } g.stroke(); }
  return new THREE.CanvasTexture(c);
}
function wetTex() {
  const c = cvs(256, 256), g = c.getContext('2d'); const r = rng(14);
  g.fillStyle = '#2e1b0c'; g.beginPath(); g.moveTo(0, 0); g.lineTo(256, 0);
  for (let x = 256; x >= 0; x -= 8) g.lineTo(x, 236 + 14 * Math.sin(x * 0.11) + 6 * r()); g.closePath(); g.fill();
  for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(120,84,48,0.25)'; g.fillRect(r() * 256, r() * 230, 3, 2); }
  return new THREE.CanvasTexture(c);
}
function rulerTex() {
  const c = cvs(64, 512), g = c.getContext('2d'); g.fillStyle = '#e6c27a'; g.fillRect(0, 0, 64, 512);
  g.fillStyle = '#3a2a14'; for (let k = 0; k <= 22; k++) { const y = 512 * (1 - k / 22.0 * 1.0) - 2; g.fillRect(0, y, k % 5 === 0 ? 42 : 24, k % 5 === 0 ? 5 : 3); }
  g.fillStyle = '#c0392b'; g.fillRect(0, 512 * 0.409 - 3, 64, 6);
  return new THREE.CanvasTexture(c);
}
function deadTree(h, seed) {
  const g = new THREE.Group(), r = rng(seed), m = lam('#6b5a44');
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, h, 7).translate(0, h / 2, 0), m); tr.castShadow = true; g.add(tr);
  for (let i = 0; i < 6; i++) { const L = h * (0.35 + r() * 0.3), b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.14, L, 5).translate(0, L / 2, 0), m); b.position.y = h * (0.45 + 0.09 * i); b.rotation.set((r() - 0.5) * 1.2, r() * 6, 0.7 + r() * 0.6); b.castShadow = true; g.add(b); }
  return g;
}
function buildX() {
  const grp = new THREE.Group(), P1 = new THREE.Group(), P2 = new THREE.Group(); grp.add(P1, P2);
  /* ---- part 1: the dry field */
  const hf = (x, z) => 0.35 * Math.sin(x * 0.05 + z * 0.04) + 0.25 * Math.sin(z * 0.09 + 1) + 0.1 * Math.sin(x * 0.3 + z * 0.2);
  const DC = ['#e2c070', '#d6b060', '#ecd08a', '#cfa656'].map(C);
  const gm = lam('#ffffff', { vertexColors: true, map: crackTex(34, 26) });
  const gr = heightMesh(-130, 130, -120, 60, 130, 90, hf, (x, y, z, c) => { c.copy(DC[Math.floor(hash2(Math.floor(x / 5), Math.floor(z / 5)) * 4)]); }, gm); P1.add(gr);
  P1.add(backdrop(0, ['#d3b57e', '#dcc597', '#e6d8b6']));
  const r = rng(61);
  P1.add(bushes(46, 17, () => { const x = (r() - 0.5) * 110, z = -60 + r() * 70; if (Math.abs(x) < 9 && z > -10) return null; return [x, hf(x, z), z]; }, '#b8a55a', 0.4, 1.1));
  P1.add(tufts(500, 18, () => { const x = (r() - 0.5) * 100, z = -50 + r() * 80; return [x, hf(x, z), z]; }, ['#c9b57c', '#d6c07a', '#b8a45a'], 0.4, 0.9));
  P1.add(rocks(60, 19, () => [(r() - 0.5) * 100, 0.1, -50 + r() * 80], '#c2b090', 0.3, 1.1));
  P1.add(K.wheatField(-40, -34, 28, 16, hf, 1800, 5));
  [[10, -12, 7.5, 61], [-18, -24, 6, 62], [24, -30, 8.5, 63]].forEach(([x, z, h, s]) => { const t = deadTree(h, s); t.position.set(x, hf(x, z), z); P1.add(t); });
  const wl = K.stoneWall(16, 1.3, 0.15); wl.position.set(-16, hf(-16, -14), -14); P1.add(wl);
  const hot = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 16), BASIC('#fff4c0')); hot.position.set(46, 58, -150); const hh = new THREE.Mesh(new THREE.SphereGeometry(16, 20, 14), ADD('#fff0b0', 0.3)); hh.position.copy(hot.position); P1.add(hot, hh);
  /* trough */
  const tr = new THREE.Group(); tr.position.set(-3.4, hf(-3.4, -3), -3); P1.add(tr);
  const tm = ashMat('#d8c9a2', 11, 1.6);
  const wallBox = (x, z, sx, sz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, 1.6, sz), tm); m.position.set(x, 0.8, z); m.castShadow = m.receiveShadow = true; tr.add(m); };
  wallBox(0, 1.35, 11, 0.5); wallBox(0, -1.35, 11, 0.5); wallBox(-5.25, 0, 0.5, 2.2); wallBox(5.25, 0, 0.5, 2.2);
  const tb = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.35, 2.3), lam('#3a342a')); tb.position.y = 0.175; tr.add(tb);
  const tw = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 2.2).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: '#3c9ee6', emissive: '#0c3a5c' })); tw.position.y = 0.35; tr.add(tw);
  /* tap on a post */
  const tapG = new THREE.Group(); tapG.position.set(3.2, hf(3.2, -3), -3); P1.add(tapG);
  const metal = phong('#9aa0a8', { shininess: 80 });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.6, 12).translate(0, 1.8, 0), metal); const elb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), metal); elb.position.y = 3.6;
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.3, 12).rotateZ(Math.PI / 2), metal); spout.position.set(-1.15, 3.6, 0);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.0, 0.7), lam('#7a5a36', { map: woodTex(3, 1, 2) })); post.position.set(0.5, 2.0, -0.2);
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 16).rotateX(Math.PI / 2), phong('#b83a2a')); wheel.position.set(0, 2.4, 0.3);
  const spoke = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.2), phong('#8a2a1e')); wheel.add(spoke);
  tapG.add(pipe, elb, spout, post, wheel); tapG.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8).translate(0, -0.5, 0), BASIC('#6ccaff')); jet.position.set(-2.2, 3.6, 0); tapG.add(jet);
  const drop = P.makeDrop('#58b8ff', 0.4); tapG.add(drop);
  /* level gauge */
  const gauge = K.makeTube(7, 0.5); gauge.position.set(-13.5, hf(-13.5, -2.5), -2.5); P1.add(gauge);
  const gb = new THREE.Mesh(new THREE.BoxGeometry(2.0, 7.4, 0.2), lam('#e8dfc4')); gb.position.set(-13.5, hf(-13.5, -2.5) + 3.7, -3.1); P1.add(gb);
  const mark = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.4), BASIC('#e03a2a')); P1.add(mark);
  /* the book, light and sparkles */
  const book = K.makeBook(); book.scale.setScalar(1.9); P1.add(book);
  const bglow = new THREE.Mesh(new THREE.SphereGeometry(6.5, 20, 14), ADD('#fff2b0', 0.0)); P1.add(bglow);
  const beams = new THREE.Group(); for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 2.2, 46, 10, 1, true).translate(0, 23, 0), ADD('#fff2b0', 0.0)); b.position.set(-9 + i * 3, hf(0, -16), -16 + (i % 2) * 2); b.rotation.set(0, 0, (i - 3) * 0.04); beams.add(b); } P1.add(beams);
  const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 6, 5), BASIC('#fff6c8'), 40); sparks.frustumCulled = false; P1.add(sparks); const dm = new THREE.Object3D();
  /* ---- part 2: soil cut-away standing on the dry plain */
  P2.position.x = 300;
  P2.add(heightMesh(-90, 90, -100, 50, 60, 50, (x, z) => -9 + 0.2 * Math.sin(x * 0.2 + z * 0.1), (x, y, z, c) => { c.copy(DC[Math.floor(hash2(Math.floor(x / 5), Math.floor(z / 5)) * 4)]); }, lam('#ffffff', { vertexColors: true, map: crackTex(14, 12) })));
  P2.add(backdrop(0, ['#d3b57e', '#dcc597', '#e6d8b6']));
  const side = lam('#6a482a', { map: noiseTex(11, 3, 3) }), topM = lam('#ffffff', { map: crackTex(3, 2) }), front = new THREE.MeshLambertMaterial({ map: strataTex() });
  const block = new THREE.Mesh(new THREE.BoxGeometry(18, 9, 10), [side, side, topM, side, front, side]); block.position.set(0, -4.5, 0); block.castShadow = block.receiveShadow = true; P2.add(block);
  const fr = lam('#6b4a2a', { map: woodTex(6, 4, 1) });
  [[0, 0.1, 5.15, 18.6, 0.4, 0.3], [0, -9.0, 5.15, 18.6, 0.4, 0.3], [-9.2, -4.5, 5.15, 0.4, 9.4, 0.3], [9.2, -4.5, 5.15, 0.4, 9.4, 0.3]].forEach(([x, y, z, sx, sy, sz]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), fr); b.position.set(x, y, z); b.castShadow = true; P2.add(b); });
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(17.9, 1).translate(0, -0.5, 0), new THREE.MeshBasicMaterial({ map: wetTex(), transparent: true, opacity: 0.93, depthWrite: false })); wet.position.set(0, 0, 5.04); wet.renderOrder = 4; P2.add(wet);
  const wtop = new THREE.Mesh(new THREE.PlaneGeometry(17.9, 9.9).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#3a2412', transparent: true, opacity: 0, depthWrite: false })); wtop.position.set(0, 0.03, 0); P2.add(wtop);
  const ruler = new THREE.Mesh(new THREE.BoxGeometry(1.5, 11, 0.35), [lam('#caa05a'), lam('#caa05a'), lam('#caa05a'), lam('#caa05a'), new THREE.MeshLambertMaterial({ map: rulerTex() }), lam('#caa05a')]); ruler.castShadow = true; P2.add(ruler);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 0.2), BASIC('#ffcf3a')); P2.add(flag);
  const fcone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 10).rotateZ(-Math.PI / 2), BASIC('#ffcf3a')); P2.add(fcone);
  const rc = K.makeCloud({ scale: 0.7 }); rc.userData.setTone(0.55); rc.position.set(0, 9.2, -1); P2.add(rc);
  const prain = K.makeRain(150, 1.0, 12, (tb, i, k) => ({ x: (hash2(i, k) - 0.5) * 12, y: 8.2, z: (hash2(i * 3, k) - 0.5) * 6, p: ramp(tb, 10.4, 11.2) * (1 - ramp(tb, 14.6, 15.4)) }), () => 0); P2.add(prain);
  const r2 = rng(71);
  P2.add(rocks(30, 21, () => [(r2() - 0.5) * 50, -8.9, -2 + r2() * 30], '#c2b090', 0.3, 1.0));
  P2.add(tufts(260, 22, () => [(r2() - 0.5) * 60, -9, -6 + r2() * 34], ['#c9b57c', '#d6c07a', '#b8a45a'], 0.4, 1.0));
  P2.add(bushes(10, 23, () => { const s = r2() < 0.5 ? -1 : 1; return [s * (14 + r2() * 20), -9, -4 + r2() * 14]; }, '#b8a55a', 0.5, 1.2));
  const KEYS1 = [[0, [9, 4.0, 22], [-4, 2.6, -4]], [5, [3, 3.6, 19], [-2, 3.2, -8]], [10.0, [-1, 3.8, 17], [0, 6.0, -12]]];
  const KEYS2 = [[10.01, [300, 7.2, 29], [300, -1.8, 0]], [16.23, [300.8, 6.4, 24], [300, -2.4, 0]]];
  const BKP = [0, 9.5, -16];
  const upd = lt => {
    const p2 = lt >= 10.01; P1.visible = !p2; P2.visible = p2;
    if (!p2) {
      camAt(lt, KEYS1);
      const lev = piece([[0, 0.26], [1.0, 0.26], [8.5, 0.04]], lt); tw.scale.y = Math.max(0.01, lev * 2.4); gauge.userData.setFill(lev * 2.2);
      mark.position.set(-12.2, hf(-13.5, -2.5) + 0.2 + lev * 2.2 * 6.6, -2.4);
      const cl1 = ramp(lt, 0.8, 4.0); wheel.rotation.z = -cl1 * 7;
      const jr = 0.17 * (1 - cl1); jet.visible = jr > 0.012; jet.scale.set(Math.max(0.01, jr), Math.max(0.1, 3.2 - lev * 2.4), Math.max(0.01, jr));
      const dp = ((lt - 4.0) / 1.7) % 1, dsh = lt > 4.0;
      drop.visible = dsh; if (dsh) { const g = cl(dp / 0.4), f = cl((dp - 0.4) / 0.4); drop.position.set(-2.2, 3.35 - f * f * 2.9, 0); drop.userData.pop(0.2 + g * 0.8); if (dp > 0.8) drop.visible = false; }
      const bu = (lt - 4.6) / 1.2; book.visible = bglow.visible = bu > 0; book.scale.setScalar(1.9 * pop(bu)); const by = BKP[1] + 0.35 * Math.sin(lt * 1.4); book.position.set(BKP[0], by, BKP[2]); book.rotation.set(0.95, 0.15 * Math.sin(lt * 0.6), 0, 'YXZ'); book.userData.setOpen(ramp(lt, 5.0, 7.4));
      bglow.position.set(BKP[0], by, BKP[2]); bglow.material.opacity = 0.2 * ramp(lt, 6.0, 8.0) * (0.85 + 0.15 * Math.sin(lt * 3));
      beams.children.forEach((b, i) => { b.material.opacity = 0.11 * ramp(lt, 6.4, 8.6) * (0.8 + 0.2 * Math.sin(lt * 2 + i)); });
      for (let i = 0; i < 40; i++) { const age = ((lt * 0.3 + hash2(i, 2.2)) % 1), s = ramp(lt, 6.4, 8.0) * Math.sin(Math.PI * age); dm.position.set(BKP[0] + (hash2(i, 3.3) - 0.5) * 22, hf(0, -16) + age * 34, BKP[2] + (hash2(i, 4.4) - 0.5) * 8); dm.scale.setScalar(Math.max(0.0001, s)); dm.updateMatrix(); sparks.setMatrixAt(i, dm.matrix); } sparks.instanceMatrix.needsUpdate = true;
    } else {
      camAt(lt, KEYS2);
      const dep = 3.1 * ramp(lt, 10.9, 15.8); wet.scale.y = Math.max(0.001, dep); wet.visible = dep > 0.01; wtop.material.opacity = 0.45 * ramp(lt, 10.6, 12.6);
      const ry = 6.5 * (1 - ramp(lt, 10.1, 11.4)); ruler.position.set(5.8, -0.9 + ry, 5.48); ruler.visible = true;
      flag.position.set(3.7, -dep, 5.5); fcone.position.set(5.2 + 0.05 * Math.sin(lt * 6), -dep, 5.5); flag.visible = fcone.visible = dep > 0.05;
      const cu = (lt - 10.2) / 0.7; rc.visible = cu > 0; rc.scale.setScalar(0.7 * pop(cu)); rc.position.y = 9.2 + 0.2 * Math.sin(lt * 1.2) + 0.0; prain.userData.update(lt);
    }
  };
  const tipa = lt => lt < 10.01 ? T(1, 0.8, lt < 4 ? 'worried' : lt < 5.2 ? 'curious' : 'surprised', lt < 4 ? 'down' : 'point', 0, cl((lt - 0.2) / 0.5)) : T(-1, 0.8, lt < 15 ? 'curious' : 'happy', lt < 15 ? 'point' : 'up', 0);
  return {
    grp, upd, tipa, mood: () => ['hot', 'hot', 0], branch: false,
    sun: lt => (lt >= 10.01 ? { t: [300, -3, 0], ext: 50 } : { t: [0, 0, -4], ext: 70 }), ev: [[1.0, 'tick'], [4.0, 'tick'], [4.9, 'splash'], [5.0, 'ding'], [10.1, 'whoosh'], [11.0, 'splash']]
  };
}

/* ======================================================================== q: the winter bar, last drop */
function buildQ() {
  const grp = new THREE.Group();
  const LD = P.makeLandModel(5, 2.0); LD.grp.position.set(0, 0.7, -30); grp.add(LD.grp);
  const bar = P.makeBar(40); bar.position.set(0, -1.55, 8); grp.add(bar);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 10, 56), BASIC('#ffd24a')); grp.add(ring);
  const fl = K.inst(new THREE.SphereGeometry(0.3, 6, 5), lam('#ffffff'), 60, (i, d, col) => { const x = -13 + hash2(i, 1.1) * 26, z = -10 + hash2(i, 2.2) * 20; const y = LD.hfn(x, z); if (y < 1.2) { d.scale.set(0, 0, 0); return col.set('#fff'); } d.position.set(x, y + 0.2, z); return col.set(i % 3 ? '#f3d24a' : i % 3 === 1 ? '#ffffff' : '#f07aa0'); });
  fl.scale.setScalar(0.001); LD.inner.add(fl);
  const KEYS = [[0, [0, 36, 61], [0, 0, -6]], [8.63, [2, 34, 58], [1, 0, -6]]];
  const upd = lt => {
    camAt(lt, KEYS);
    const an = lt > 6.09, pa = ramp(lt, 6.1, 8.3);
    LD.upd({ pop: (lt - 0.1) / 0.6, paint: pa, x0: 15, stream: 0, t: lt }); LD.grp.scale.setScalar(2.0 * Math.max(0.001, pop((lt - 0.1) / 0.6)));
    fl.scale.setScalar(Math.max(0.001, pop((lt - 6.9) / 0.9)));
    bar.userData.setPop((lt - 0.2) / 0.6); bar.userData.setEnds((lt - 0.7) / 0.5, (lt - 3.8) / 0.5); bar.userData.setFill(ramp(lt, 1.2, 3.6));
    bar.userData.first.userData.glow(ramp(lt, 0.9, 1.5) * 0.7); bar.userData.last.userData.glow(an ? ramp(lt, 6.09, 6.9) * (0.85 + 0.15 * Math.sin(lt * 7)) : 0);
    const lp = bar.position, lx = 20, ru = (lt - 4.2) / 0.5, cd = lt > 5.79;
    ring.visible = ru > 0; ring.position.set(lx, lp.y + 7.2 + 0.8, lp.z); ring.scale.setScalar(Math.max(0.01, 4.4 * pop(ru) * (1 + (an ? 0.05 : 0.08) * Math.sin(lt * (cd ? 11 : 3.5))))); ring.lookAt(cam.position);
    ring.material.color.set(an ? '#7be08a' : '#ffd24a');
  };
  const tipa = lt => T(-1, 0.8, lt < 3.8 ? 'curious' : lt < 6.09 ? 'worried' : 'cheering', lt < 6.09 ? 'down' : 'up', lt > 6.09 ? 0.5 : 0, cl((lt - 0.2) / 0.5));
  return { grp, upd, tipa, table: true, mood: lt => ['win', 'spr', ramp(lt, 6.1, 8)], sun: { t: [0, 0, -6], ext: 80 }, ev: [[0.3, 'pop'], [0.8, 'ding'], [3.9, 'ding'], [5.79, 'countdown'], [6.09, 'answer'], [6.9, 'pop']] };
}

/* ======================================================================== assembly */
let SH = [], lastTipa = null;
function build() {
  TABLE = K.makeTable(); tableRoot.add(TABLE);
  MAP = K.makeTableMap(); mapRoot.add(MAP.grp);
  SH = [['s6a_cycle', 0, 24.82, buildA], ['s6b_gauge', 24.82, 39.67, buildB], ['s6c_rules', 39.67, 49.36, buildC], ['s6d_sky', 49.36, 77.55, () => buildTwo('d')],
    ['s6x_drought', 77.55, 93.78, buildX], ['s6q_quiz2', 93.78, 102.41, buildQ], ['s6e_quiz', 102.41, DUR, () => buildTwo('e')]].map(([id, t0, t1, fn]) => Object.assign({ id, t0, t1 }, fn()));
  SH.forEach(s => { scene.add(s.grp); s.grp.visible = false; });
  window.__shots = SH.map((s, i) => ({ id: s.id, index: i, t0: s.t0, dur: +(s.t1 - s.t0).toFixed(2) }));
  const ev = [];
  SH.forEach(s => (s.ev || []).forEach(([lt, kind]) => { if (kind !== 'countdown' && kind !== 'answer' && kind !== 'stamp') ev.push({ t: +(s.t0 + lt).toFixed(2), kind }); }));
  ev.push({ t: 99.57, kind: 'countdown' }, { t: 99.87, kind: 'answer' }, { t: 110.7, kind: 'countdown' }, { t: 111.0, kind: 'answer' }, { t: 113.36, kind: 'stamp' });
  window.__events = ev.sort((x, y) => x.t - y.t);
}

function frame(tl) {
  const t = Math.max(0, Math.min(DUR - 0.001, tl));
  let si = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i].t0) si = i;
  const s = SH[si], lt = t - s.t0;
  SH.forEach((o, i) => { o.grp.visible = i === si; });
  tableRoot.visible = !!s.table; mapRoot.visible = !!s.map; if (s.map) { MAP.slide(0); MAP.paint(1); }
  branch.visible = !!s.branch; camBadges.forEach(b => { b.visible = false; });
  const m = s.mood(lt); setMood(m[0], m[1], m[2]);
  const sc = typeof s.sun === 'function' ? s.sun(lt) : s.sun, so = [72, 63.6, 72];
  sun.target.position.set(...sc.t); sun.position.set(sc.t[0] + so[0], sc.t[1] + so[1], sc.t[2] + so[2]);
  if (sun.shadow.camera.right !== sc.ext) { Object.assign(sun.shadow.camera, { left: -sc.ext, right: sc.ext, top: sc.ext, bottom: -sc.ext }); sun.shadow.camera.updateProjectionMatrix(); }
  s.upd(lt, t);
  cam.updateMatrixWorld();
  lastTipa = s.tipa(lt); comp.place(Object.assign({ t }, lastTipa)); comp.sync();
  renderer.autoClear = false; renderer.clear(); renderer.render(scene, cam); renderer.clearDepth(); renderer.render(scene2, cam);
}

window.__dur = DUR; window.__shots = []; window.__events = [];
window.__caption = () => null; window.__heroBox = () => (lastTipa && lastTipa.show > 0.05 ? { visible: true, behindCamera: false, heightFrac: lastTipa.size || 0.2 } : null); window.__sceneHash = () => 'toldot10g-s6-v1';
window.__errors = [];
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

async function main() {
  try {
    build();
    await comp.warm();
    for (const s of SH) { frame(s.t0 + 0.5); frame(s.t0 + (s.t1 - s.t0) * 0.5); }
    frame(0); window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
}
setTimeout(main, 0);
