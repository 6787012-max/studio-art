/* gezer_trip film_a - 10 shots, 95 s, NO PEOPLE, NO ANIMALS, NO TEXT IN THE PICTURE. ASCII only.
   Built: s0 map_journey, s1 key_road, s2 time_road, s3 elul_vineyard, s4 calendar_stone, s5 water_system.
   s6-s9 are ground + sky placeholders.
   Deterministic: every frame is a pure function of t.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur = 95, window.__shots, window.__caption, window.__heroBox. */
import * as THREE from 'three';
import { CLEAR, hf, soilTexture, rakeTexture, makeGround, makeLetters, makeBorder, makeVines, makeOlive,
         makeTerrace, makeFarm, makeCrates, makeTrack, makeHills, makeClouds, makeSkyDome,
         sm, lerp3, easeOutBack } from './gz_kit.js';
import { makeShots } from './shots_a.js';
import { makeShotsB } from './shots_b.js';

const DUR = 95.0;
const O = [0, 10, 20, 32, 42, 51, 61, 69, 77, 87];
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const cl01 = u => Math.max(0, Math.min(1, u));

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#fbe9bd', 200, 900);
scene.add(makeSkyDome('#79c3ee', '#fbe9bd'));
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000);
scene.add(cam);

/* low warm sun from the south-east (elevation about 32 deg), cool sky fill */
scene.add(new THREE.HemisphereLight('#bcd9f5', '#8a7a55', 0.85));
const SUN_T = [2.2, 0, -4.2];
const sun = new THREE.DirectionalLight('#fff1d0', 2.1);
sun.target.position.set(SUN_T[0], SUN_T[1], SUN_T[2]);
sun.position.set(SUN_T[0] + 72, 63.6, SUN_T[2] + 72);
sun.castShadow = true;
sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 400 });
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

const L = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
const M = {
  vcol: new THREE.MeshLambertMaterial({ vertexColors: true }),
  ground: new THREE.MeshLambertMaterial({ map: soilTexture(), vertexColors: true }),
  clear: new THREE.MeshLambertMaterial({ map: rakeTexture(), color: '#d9c58f' }),
  stone: L('#d7c9a6'), hedge: new THREE.MeshLambertMaterial({ vertexColors: true }),
  post: L('#6b4f2e'), wire: L('#3a3a3a'), leafA: L('#5c8a3a'), leafB: L('#6fa046'), grape: L('#4a2350'),
  trunk: L('#6e5a40'), crown: L('#8a9f78'), stoneWall: L('#e9dcc0'), stoneCap: L('#cdbb95'),
  farmWall: L('#efe4cc'), roof: L('#b5452a'), wood: L('#7a5a36'), crate: L('#a7743f'),
  track: L('#a88a5c'), tyre: L('#6e5a3e'),
  hillNear: L('#7f9a6b'), hillMid: L('#97aeab'), hillFar: L('#b9cdd3'),
  cloud: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  cloudT: new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.92 }),
  slab: L('#5a4632'), navy: L('#06213c'), red: L('#c0541f'), green: L('#2e7d4f'), road: L('#e9dcc0'),
  bus: L('#ffc928'), win: L('#06213c'), gold: L('#ffd24a'), bronze: L('#b08d57'),
  clay: L('#b5673a'), flame: new THREE.MeshBasicMaterial({ color: '#ffd24a' }),
  dry: L('#c9b77a'), dryTuft: L('#b5a45a'), mound: L('#c9b28a'), soil: L('#b99766'),
  token: L('#b7aa92'), flax: L('#6f7f8f'), wheat: L('#d9a520'), barley: L('#c9a24a'),
  fig: L('#5a3a4a'), brass: L('#c9a24a'), water: new THREE.MeshBasicMaterial({ color: '#6ec6ff' }),
  sec: L('#c7a871'), step: L('#e0c9a0'), ripple: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, depthWrite: false }),
  tabl: L('#e9dcc0'), groove: L('#4a3c2a'), mtn: L('#9c8a6a'), tank: L('#8a7a5a'), sea: L('#3f86b4')
};

/* ---- shared ground (s3 and placeholders only) */
const ground = makeGround(M.ground);
scene.add(ground);

/* ---- s3 elul_vineyard set (unchanged look) */
const G3 = new THREE.Group();
scene.add(G3);
const clearing = new THREE.Mesh(new THREE.PlaneGeometry(CLEAR.w, CLEAR.d).rotateX(-Math.PI / 2), M.clear);
clearing.position.set(CLEAR.cx, 0.02, CLEAR.cz);
clearing.receiveShadow = true;
const letters = makeLetters(M.hedge);          // groups in file order: L1, L2, L3, L4
const olives = [[-36, -8], [-34, 12], [38, -20], [40, 4], [-22, -32], [22, -34]].map(([x, z]) => {
  const o = makeOlive(M.trunk, M.crown); o.position.set(x, hf(x, z), z); return o;
});
G3.add(clearing, makeBorder(M.stone), makeVines({ post: M.post, wire: M.wire, leafA: M.leafA, leafB: M.leafB, grape: M.grape }),
       letters.root, makeTerrace(M.stoneWall, M.stoneCap), makeFarm(M.farmWall, M.roof, M.wood),
       makeCrates(M.crate), makeTrack(M.track, M.tyre), makeHills(M.hillNear, M.hillMid, M.hillFar),
       makeClouds(M.cloud), ...olives);
const TGT3 = [2.2, 0, -4.2], OFF3 = [0, 26.2, 18.4];
const P0 = [-30, 0, 6.3], P1 = [-16, 0, 6.3];
const LOOK_OPEN = p => [p[0] + 30, 1.0, p[2] - 4];
function cam3(lt) {
  let p, l;
  if (lt < 3.5) {
    p = lerp3(P0, P1, sm(lt / 3.5)); p[1] = hf(p[0], p[2]) + 0.9; l = LOOK_OPEN(p);
  } else if (lt < 6.5) {
    const from = [P1[0], hf(P1[0], P1[2]) + 0.9, P1[2]];
    const u = sm((lt - 3.5) / 3.0);
    p = lerp3(from, [TGT3[0] + OFF3[0], TGT3[1] + OFF3[1], TGT3[2] + OFF3[2]], u);
    l = lerp3(LOOK_OPEN(from), TGT3, u);
  } else {
    const phi = (8 * Math.PI / 180) * sm((Math.min(lt, 10) - 6.5) / 3.5);
    p = [TGT3[0] + OFF3[0] * Math.cos(phi) + OFF3[2] * Math.sin(phi), TGT3[1] + OFF3[1],
         TGT3[2] - OFF3[0] * Math.sin(phi) + OFF3[2] * Math.cos(phi)];
    l = TGT3;
  }
  cam.position.set(p[0], p[1], p[2]);
  cam.lookAt(l[0], l[1], l[2]);
}
function upd3(t, lt) {
  letters.groups.forEach((g, k) => {
    const u = (lt - (4.0 + 0.5 * k)) / 0.6;   // L1 at 4.0, L2 4.5, L3 5.0, L4 5.5 (local)
    g.scale.y = Math.max(0.05, easeOutBack(u));
  });
  cam3(lt);
}

/* ================= placeholders (s6-s9): ground and sky, slow drift ================= */
function placeholder(t, si) {
  const k = (t - O[si]) / 10;
  cam.position.set(0, 14 + 4 * k, 60 - 12 * k);
  cam.lookAt(0, 0, 0);
}

const { S0, S1, S2, S4, S5 } = makeShots(cam);
const { S6, S7, S8, S9 } = makeShotsB(cam);
[S0, S1, S2, S4, S5, S6, S7, S8, S9].forEach(s => { scene.add(s.grp); s.grp.visible = false; });
G3.visible = false;
const SHOTS = [S0, S1, S2, { grp: G3, upd: upd3 }, S4, S5,
               S6, S7, S8, S9];

function frame(tl) {
  const t = Math.max(0, Math.min(DUR, tl));
  let si = 0;
  for (let i = 0; i < O.length; i++) if (t >= O[i]) si = i;
  const lt = t - O[si];
  SHOTS.forEach((s, i) => { if (s.grp) s.grp.visible = i === si; });
  ground.visible = si === 3 || si >= 6;
  const sc = SHOTS[si].sun || { t: SUN_T, ext: 90 };
  sun.target.position.set(sc.t[0], sc.t[1], sc.t[2]); const so = sc.off || [72, 63.6, 72]; sun.position.set(sc.t[0] + so[0], sc.t[1] + so[1], sc.t[2] + so[2]);
  if (sun.shadow.camera.right !== sc.ext) { Object.assign(sun.shadow.camera, { left: -sc.ext, right: sc.ext, top: sc.ext, bottom: -sc.ext }); sun.shadow.camera.updateProjectionMatrix(); }
  SHOTS[si].upd(t, lt, si);
  renderer.render(scene, cam);
}

/* ---- contract */
window.__dur = DUR;
window.__shots = [['s0_map_journey', 10], ['s1_key_road', 10], ['s2_time_road', 12], ['s3_elul_vineyard', 10], ['s4_calendar_stone', 9],
                  ['s5_water_system', 10], ['s6_solomon_gate', 8], ['s7_standing_stones', 8], ['s8_dan_camp', 10], ['s9_forest_clearing', 8]]
  .map(([id, dur], i) => ({ id, index: i, t0: O[i], dur }));
window.__caption = () => null;
window.__heroBox = () => null;
window.__sceneHash = () => 'gezer-film-a-v5';
window.__errors = [];
window.__seek = t => frame(t + (window.__T0 || 0));

/* warm-up: one frame of every shot before ready (deferred so the page load event is not blocked) */
setTimeout(() => { for (const o of O) frame(o + 0.5); frame(0); window.__ready = true; }, 0);
