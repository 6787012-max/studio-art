/* film_c - "from the Kinneret to our tap" - the whole film (7 shots, 257.2 s). Deterministic: every frame is a pure function of t.
   Hero = the moving diagrams: tinted relief map with clouds / sun / houses, the lake bowl with the slope the drop cannot climb, the two-lift pumped pipe with the
   altitude pole, the hill road at the same scale, the open canal + tunnel + sedimentation pools, the giant pipe ring beside a door, the pipe drawn on the map,
   the ruler, the tear-off calendar (Hebrew year from years.json), the thin lines to many dots, the tap over a glass. The drops (guide = makeTipa big, student = makeTipa tipa)
   are talking objects. No people. No Hebrew in code. Numbers only: 250 115 370 130 (all from the shot list). ASCII only.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur = 257.2, window.__caption(t), window.__heroBox, window.__sceneHash. */
import { THREE, sm, cl, frac } from '../../../lib/toon3d/toon3d.js';
import * as K from '../../toldot08_kit/kit08.js';

const DUR = 257.2;
const O = [0, 38.2, 74.3, 111.3, 159.5, 197.2, 236.2, 257.2];
const IDS = ['c1_water_is_low', 'c2_two_pumps', 'c2b_like_the_road', 'c3_canal_and_pools', 'c4_giant_pipe', 'c4b_to_our_tap', 'c5_recap'];
const CUES = [
  [[5.4, 13.3], [13.9, 25.9], [26.5, 33.1], [33.7, 42.3], [42.9, 48.8]],
  [[39.1, 47.0], [47.6, 55.5], [56.1, 64.1], [64.7, 72.6]],
  [[75.1, 82.3], [82.9, 90.9], [91.5, 98.0], [98.6, 105.2]],
  [[112.3, 120.9], [121.5, 129.4], [130.0, 136.6], [137.2, 142.7], [143.3, 151.2], [151.8, 157.7]],
  [[160.3, 167.5], [168.1, 176.7], [177.3, 185.3], [185.9, 193.8]],
  [[198.0, 203.9], [204.5, 210.4], [211.0, 216.5], [217.1, 225.7], [226.3, 236.9]],
  []];
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.getElementById('wrap').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 5, 120000); scene.add(cam);
const cam2 = new THREE.PerspectiveCamera(34, 1.2, 5, 120000); scene.add(cam2);
const lerp = (a, b, u) => a + (b - a) * u;
const ease = (t, a, b) => sm(cl((t - a) / (b - a), 0, 1));
const U = ease;
const blinkAt = (t, o) => frac(t / 3.3 + (o || 0)) < 0.045;
const shotOf = t => { for (let i = 0; i < 7; i++) if (t < O[i + 1]) return i; return 6; };
const inCue = t => CUES[shotOf(t)].some(c => t >= c[0] && t < c[1]);
const tri = x => { const f = x - Math.floor(x); return f < 0.5 ? f * 2 : 2 - f * 2; };
const _c = {}; const colr = h => _c[h] || (_c[h] = new THREE.Color(h));

/* ---------------------------------------------------------------- sky */
const SKYP = { dusk: ['#3d4f8c', '#c88b86', '#f3bb82'], clear: ['#5fb3e6', '#9fd4f2', '#e2f3fb'], dawn: ['#6fa8e0', '#f2c98a', '#ffe9c4'], warm: ['#6fb0e8', '#ffe2a8', '#fff1cf'], gold: ['#e8905a', '#ffc27a', '#ffe3a6'], sunset: ['#5a6ab0', '#f0a070', '#ffd49a'] };
const SKY = K.makeSky({ palette: 'winter' }); scene.add(SKY);
function setSkyMix(A, B, k) { const u = SKY.material.uniforms; u.uTop.value.copy(colr(A[0])).lerp(colr(B[0]), k); u.uMid.value.copy(colr(A[1])).lerp(colr(B[1]), k); u.uHorz.value.copy(colr(A[2])).lerp(colr(B[2]), k); return '#' + u.uHorz.value.getHexString(); }

/* ---------------------------------------------------------------- stages (each diagram lives on its own table in the sky) */
const ST = { map: [0, 3600, 0], bowl: [2700, 3600, -150], slope: [-30000, 3600, 0], canal: [-60000, 3600, 0], pools: [-90000, 3600, 0], gp: [-120000, 3600, 0], tap: [-150000, 3600, 0], recap: [-180000, 3600, 0] };
const WARM = { on: false };
const setNum = (p, s) => { if (!WARM.on) p.userData.setText(s); };
const addTo = (parent, st) => { const g = new THREE.Group(); g.position.set(...ST[st]); parent.add(g); return g; };
const NP = (txt, w, h, bg, bd, fg) => { const n = K.numPlane(txt, w, h, { bg: bg === undefined ? '#fff3a0' : bg, bd: bd === undefined ? '#1d2a44' : bd, fg: fg || '#1d2a44', k: 0.8 }); scene.add(n); return n; };

/* ---- map stage */
const MAPG = addTo(scene, 'map');
const LAND_ASSETS = await K.loadLandMapAssets('./');
const LAND = K.makeLandMapA(LAND_ASSETS); MAPG.add(LAND.root);
const KC = LAND.KC, TOP = LAND.top, LY = LAND.Y;
const mwa = (x, y, z) => [ST.map[0] + x, ST.map[1] + y, ST.map[2] + z];
const mll = (lon, lat, dy) => { const p = LAND.P(lon, lat); return mwa(p[0], TOP + (dy || 0), p[1]); };
const tintTex = (r, g, b) => { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const c = cv.getContext('2d'), gr = c.createRadialGradient(64, 64, 8, 64, 64, 64);
  gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.95)'); gr.addColorStop(0.6, 'rgba(' + r + ',' + g + ',' + b + ',0.7)'); gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; return t; };
const mkBand = (lon0, lat0, lon1, lat1, rgb) => { const a = LAND.P(lon0, lat0), b = LAND.P(lon1, lat1); const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(b[0] - a[0]), Math.abs(a[1] - b[1])).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({ map: tintTex(...rgb), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -7, polygonOffsetUnits: -7 })); m.position.set((a[0] + b[0]) / 2, TOP + 2, (a[1] + b[1]) / 2); m.renderOrder = 5; MAPG.add(m); return m; };
const BANDN = mkBand(34.75, 32.45, 36.15, 33.55, [40, 190, 150]), BANDS = mkBand(34.0, 29.4, 35.6, 31.45, [244, 196, 40]);
const CLN = [[35.15, 33.25, 5], [35.55, 33.05, 7], [35.35, 32.75, 9]].map(([lo, la, sd], i) => { const c = K.makeCloud(sd, { s: 1.1, col: '#ffffff', tint: '#dfe6f2' }); const p = mll(lo, la, 520 + i * 40); c.position.set(p[0], p[1], p[2]); c.userData.base = p; scene.add(c); return c; });
const CLS = (() => { const c = K.makeCloud(12, { s: 0.7, col: '#ffffff', tint: '#dfe6f2' }); const p = mll(35.1, 30.6, 520); c.position.set(p[0], p[1], p[2]); c.userData.base = p; scene.add(c); return c; })();
const SUNO = K.makeSun({ r: 120 }); { const p = mll(34.6, 30.35, 650); SUNO.position.set(p[0], p[1], p[2]); SUNO.userData.base = p; scene.add(SUNO); }
const HCG = new THREE.Group(); { const hc = K.makeHouseCluster({ n: 9, seed: 5, cols: 3, dx: 260, dz: 240 }); hc.position.set(-260, 0, -240); HCG.add(hc); HCG.userData.hc = hc; } MAPG.add(HCG);
{ const p = LAND.P(34.95, 32.02); HCG.position.set(p[0], TOP + 1, p[1]); }
/* pipe on the map */
const PL = (a) => a.map(([lo, la]) => LAND.P(lo, la));
const PIPE_PTS = PL([[35.545, 32.745], [35.40, 32.62], [35.22, 32.47], [35.07, 32.27], [34.956, 32.096]]);
const THIN_PTS = PL([[34.956, 32.096], [34.90, 31.80], [34.83, 31.50], [34.80, 31.25]]);
const PIPE = K.makeMapLineC(PIPE_PTS, 20, '#2f9be0', TOP + 3, { flow: true }); MAPG.add(PIPE.root);
const THIN = K.makeMapLineC(THIN_PTS, 7, '#2f9be0', TOP + 3, { flow: false, ro: 14 }); MAPG.add(THIN.root);
const DOTS = [[34.99, 32.80], [34.92, 32.44], [34.86, 32.33], [34.78, 32.08], [34.87, 31.93], [34.65, 31.80], [34.57, 31.67], [34.77, 31.61], [34.79, 31.25]];
const RHA = PIPE_PTS[PIPE_PTS.length - 1];
const BR = DOTS.map(([lo, la], i) => { const e = LAND.P(lo, la), mid = [(RHA[0] + e[0]) / 2 + (i % 2 ? 14 : -14), (RHA[1] + e[1]) / 2 + (i % 3 - 1) * 10]; const L = K.makeMapLineC([RHA, mid, e], 6, '#2f9be0', TOP + 3, { flow: false, ro: 16 }); MAPG.add(L.root);
  const d = new THREE.Group(); d.position.set(e[0], TOP + 3, e[1]); K.box(d, 1, 1, 1, K.M('#ffd42a', '#d8b050'), [0, 0, 0], 0, null, 0); d.clear(); MAPG.add(d);
  const cy = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 8, 18), new THREE.MeshBasicMaterial({ color: '#ffc928' })); cy.position.y = 4; d.add(cy); const ci = new THREE.Mesh(new THREE.CylinderGeometry(19, 19, 6, 18), new THREE.MeshBasicMaterial({ color: '#261c19' })); ci.position.y = 2; d.add(ci); return { L, d, e }; });
const CITYP = LAND.P(34.99, 31.75);
const CITYL = K.makeMapLineC([RHA, [(RHA[0] + CITYP[0]) / 2 - 18, (RHA[1] + CITYP[1]) / 2 + 12], CITYP], 7, '#2f9be0', TOP + 3, { flow: false, ro: 16 }); MAPG.add(CITYL.root);
const CITYD = new THREE.Group(); CITYD.position.set(CITYP[0], TOP + 3, CITYP[1]); MAPG.add(CITYD);
{ const cy = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 8, 18), new THREE.MeshBasicMaterial({ color: '#ffc928' })); cy.position.y = 4; CITYD.add(cy); const ci = new THREE.Mesh(new THREE.CylinderGeometry(21, 21, 6, 18), new THREE.MeshBasicMaterial({ color: '#261c19' })); ci.position.y = 2; CITYD.add(ci); }
const CITYH = K.makeHouse(3, { garden: false }); CITYD.add(CITYH);
const ROUTE_PTS = [CITYP, [(RHA[0] + CITYP[0]) / 2 - 18, (RHA[1] + CITYP[1]) / 2 + 12], RHA, ...PIPE_PTS.slice().reverse().slice(1)];
const ROUTE = K.makeMapLineC(ROUTE_PTS, 12, '#7fe0ff', TOP + 4, { flow: true, ro: 20 }); MAPG.add(ROUTE.root);
const RUL = K.makeLongRulerA({ len: Math.hypot(RHA[0] - PIPE_PTS[0][0], RHA[1] - PIPE_PTS[0][1]), w: 26 }); const RULG = new THREE.Group(); RULG.add(RUL); RUL.rotation.x = -Math.PI / 2; MAPG.add(RULG);
const N130 = NP('130', 520, 240);
const DROPI = K.makeDropIconA(); MAPG.add(DROPI);
const GLM = K.makeGlassA({ water: '#4fb6f0' }); MAPG.add(GLM.root);

/* ---- bowl stage (same drawing as film_a a2) */
const BOWLG = addTo(scene, 'bowl'); BOWLG.position.set(...ST.bowl);
const SEC = K.makeBowlSectionA(); BOWLG.add(SEC.root);
const bw = (x, y, z) => [ST.bowl[0] + x, ST.bowl[1] + y, ST.bowl[2] + (z || 0)];
const FA_SURF = -630;

/* ---- slope stage (pumps + road) */
const SLG = addTo(scene, 'slope');
const CS = K.makeClimbSlopeC(); SLG.add(CS.root);
const RS = K.makeRoadSlopeC(); SLG.add(RS.root);
const PS1 = K.makePumpStationC(); PS1.root.position.set(570, 0, 0); SLG.add(PS1.root);
const PS2 = K.makePumpStationC({ wall: '#f2dcc4', roof: '#d6642a', accent: '#7fd05a' }); PS2.root.position.set(2750, 1500, 0); SLG.add(PS2.root);
const sw = (x, y, z) => [ST.slope[0] + x, ST.slope[1] + y, ST.slope[2] + (z || 0)];
function makeDashed(color, parent) {
  const N = 90, im = new THREE.InstancedMesh(new THREE.BoxGeometry(110, 26, 8), new THREE.MeshBasicMaterial({ color }), N), dm = new THREE.Object3D(); im.frustumCulled = false; im.renderOrder = 8;
  im.userData.set = (x0, x1, y, z, k) => { const L = Math.abs(x1 - x0), dir = x1 >= x0 ? 1 : -1; let c = 0; for (let i = 0; i < N; i++) { const d = i * 190; if (d < L * k) { dm.position.set(x0 + dir * d, y, z); dm.scale.setScalar(1); c++; } else { dm.position.set(0, 0, 0); dm.scale.setScalar(0.0001); } dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); } im.instanceMatrix.needsUpdate = true; };
  parent.add(im); return im;
}
const DSH = makeDashed('#ffd42a', SLG);
const ALMOST = new THREE.Mesh(new THREE.PlaneGeometry(900, 260), new THREE.MeshBasicMaterial({ color: '#ffd42a', transparent: true, opacity: 0, depthWrite: false })); ALMOST.position.set(-3900, 2540, 230); ALMOST.renderOrder = 6; SLG.add(ALMOST);
const DROPS = [0, 1, 2, 3].map(() => { const d = K.makeDropIconA(); d.scale.setScalar(0.9); SLG.add(d); return d; });

/* ---- canal stage */
const CNG = addTo(scene, 'canal');
K.box(CNG, 30000, 20, 5200, K.M('#79b84e', '#5f9a44'), [9000, -12, 0], 2.4, null, 4);
const CAN1 = K.makeOpenCanalC({ len: 3650 }); CNG.add(CAN1.root);
const TUN = K.makeTunnelMountainC(); TUN.root.position.set(4600, 0, 0); CNG.add(TUN.root);
const CANT = K.makeOpenCanalC({ len: 1900, braces: false }); CANT.root.position.set(3650, 0, 0); CNG.add(CANT.root);
const CAN2 = K.makeOpenCanalC({ len: 16000 }); CAN2.root.position.set(5550, 0, 0); CNG.add(CAN2.root);
{ const cols = ['#8fc65a', '#6fae45', '#c8d27a', '#a4cf6a']; for (let i = 0; i < 16; i++) for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(900, 1100 + (i % 3) * 200).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: cols[(i + (s > 0 ? 1 : 0)) % 4] })); m.position.set(6200 + i * 920, 1, s * (900 + (i % 3) * 100)); CNG.add(m); }
  for (let i = 0; i < 18; i++) { const tr = K.makeTree(i % 3 === 0 ? 'palm' : 'pine', 200 + i, 1.2); tr.position.set(300 + i * 900 + (i % 2) * 200, 0, (i % 2 ? 1 : -1) * (1700 + (i % 4) * 150)); CNG.add(tr); } }
const hillsC = K.makeHills({ a0: 0, a1: Math.PI * 2, dists: [6200, 8600, 11500], base: '#86b35e', haze: '#cfe0e6', h: 750, n: 14 }); scene.add(hillsC);
const GULL = K.makeGull(); GULL.root.scale.setScalar(2.4); scene.add(GULL.root);
const BOARD = new THREE.Group(); K.box(BOARD, 260, 22, 110, K.M('#d8923a', '#c8a08a'), [0, 11, 0], 2.2, null, 6); scene.add(BOARD);

/* ---- pools stage */
const PLG = addTo(scene, 'pools');
K.box(PLG, 24000, 20, 5200, K.M('#79b84e', '#5f9a44'), [4000, -12, 0], 2.4, null, 4);
const POOLS = K.makeSedimentPoolsC(); PLG.add(POOLS.root);
const SIGN = K.makeSignBoardC(); SIGN.root.position.set(900, 490, 0); SIGN.root.scale.set(1.25, 1, 1); PLG.add(SIGN.root);
const CAN3 = K.makeOpenCanalC({ len: 5000 }); CAN3.root.position.set(2450, 0, 0); PLG.add(CAN3.root);
for (let i = 0; i < 8; i++) { const tr = K.makeTree(i % 2 ? 'palm' : 'pine', 400 + i, 1.2); tr.position.set(-900 + i * 1000, 0, -1500 - (i % 3) * 120); PLG.add(tr); }
const hillsP = K.makeHills({ a0: 0, a1: Math.PI * 2, dists: [6200, 8600, 11500], base: '#86b35e', haze: '#cfe0e6', h: 750, n: 14 }); scene.add(hillsP);

/* ---- giant pipe + calendar stage */
const GPG = addTo(scene, 'gp');
const GP = K.makeGiantPipeC(); GPG.add(GP.root);
K.box(GPG, 3400, 1100, 40, K.M('#efe6d0', '#d8d0c0'), [6000, 550, -330], 2.4, null, 6); K.box(GPG, 3400, 30, 900, K.M('#c9b98a', '#a89868'), [6000, -15, 0], 2.4, null, 4);
const CAL = K.makeCalendar({ n: 6, texts: ['', '', '', '', '', ''] }); CAL.root.position.set(6000, 520, 0); CAL.root.scale.setScalar(2.4); CAL.root.position.y = 700; GPG.add(CAL.root);
const BANNER = new THREE.Group(); BANNER.position.set(7250, 1050, 40); GPG.add(BANNER);
{ const gm = K.M('#ffc928', '#d8a030'); K.box(BANNER, 900, 170, 30, gm, [0, -300, 0], 3, null, 8); [-1, 1].forEach(s => K.box(BANNER, 10, 300, 10, K.M('#6e4a2c', '#9a7a66', 0), [s * 380, -150, 0], 1, null, 1)); }
const YC4 = new THREE.Mesh(new THREE.PlaneGeometry(300, 204), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })); YC4.position.set(0, -10, 6); YC4.renderOrder = 10; YC4.visible = false; CAL.cards[5].np.parent.add(YC4);
function yearTex(y, w, h) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
  let big = Math.round(h * 0.42); c.font = 'bold ' + big + 'px Heebo, Arial, sans-serif'; while (c.measureText(y.he).width > w * 0.9 && big > 20) { big -= 4; c.font = 'bold ' + big + 'px Heebo, Arial, sans-serif'; }
  c.fillStyle = '#c98a1c'; c.fillText(y.he, w / 2, h * 0.36);
  const s2 = Math.round(big * 0.6); c.font = 'bold ' + s2 + 'px Heebo, Arial, sans-serif'; c.direction = 'ltr'; c.fillStyle = '#8a9098'; c.fillText(String(y.greg), w / 2, h * 0.36 + big * 0.62 + s2 * 0.5);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; return t;
}
async function loadYears() { const j = await (await fetch('../../_caps_toldot08/years.json')).json(); YC4.material.map = yearTex(j.c4_year, 512, 348); YC4.material.needsUpdate = true; }

/* ---- tap stage */
const TPG = addTo(scene, 'tap');
const TAP = K.makeTapC(); TPG.add(TAP.root);
const GLT = K.makeGlassA({ water: '#4fb6f0' }); GLT.root.scale.setScalar(1.6); GLT.root.position.set(0, 0, 40); TPG.add(GLT.root);
const QTAP = NP('?', 260, 330, null, null, '#d6232a'); QTAP.visible = false;

/* ---- recap stage */
const RCG = addTo(scene, 'recap');
K.box(RCG, 6000, 40, 1800, K.M('#b98a58', '#c8a88e'), [0, -20, 200], 2.6, null, 4);
const GLR = K.makeGlassA({ water: '#4fb6f0' }); GLR.root.scale.setScalar(2.6); GLR.root.position.set(-520, 0, 200); RCG.add(GLR.root);
{ const bk = [[-1500, 760, -500, 160, '#ffdca0'], [-800, 1000, -560, 110, '#ffc27a'], [200, 880, -520, 190, '#ffe3b0'], [1100, 1020, -540, 130, '#ffd08a'], [1700, 740, -480, 170, '#ffcf99'], [600, 1220, -600, 100, '#ffe9c0']];
  bk.forEach(([x, y, z, r, c]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 28), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55, depthWrite: false })); m.position.set(x, y, z); RCG.add(m); });
  K.box(RCG, 5000, 700, 30, K.M('#e8c89a', '#d8b888'), [0, 330, -620], 2.6, null, 6); }

/* ---- shared billboards */
const QM = K.numPlane('?', 260, 330, { fg: '#d6232a', k: 0.95 }); scene.add(QM);
const N250 = NP('115', 460, 230), NUM2 = null;
const N115 = N250;
const QM2 = K.numPlane('?', 260, 330, { fg: '#d6232a', k: 0.95 }); scene.add(QM2);
const BILL = [QM, QM2, N130, QTAP];
const PAN = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: false }));
{ const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'), g = c.createRadialGradient(128, 128, 20, 128, 128, 128); g.addColorStop(0, 'rgba(40,18,6,0.78)'); g.addColorStop(0.55, 'rgba(40,18,6,0.52)'); g.addColorStop(1, 'rgba(40,18,6,0.12)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  PAN.material.map = new THREE.CanvasTexture(cv); PAN.renderOrder = 20; PAN.frustumCulled = false; }
cam.add(PAN); PAN.position.set(0, 0, -50); PAN.scale.setScalar(50 * Math.tan(18 * Math.PI / 180) * 1.1); PAN.scale.x *= 16 / 9; PAN.visible = false;

/* ---------------------------------------------------------------- the cast */
function makeDrop(kind, sc) {
  const d = K.makeTipa({ kind }); d.root.scale.setScalar(sc);
  return { drop: d, root: d.root, pose: po => { d.pose(Object.assign({}, po)); if (po.raw) po.raw.forEach((r, i) => { if (r) d.arms[i].rotation.set(-d.arms[i].userData.sz * (r.out || 0), -d.arms[i].userData.sz * (r.ry || 0), r.fw || 0); }); }, face: d.face };
}
const GD = makeDrop('big', 0.98), TP = makeDrop('tipa', 0.94);
scene.add(GD.root); scene.add(TP.root);
const NONE = () => ({ vis: false, po: { t: 0 }, f: { expr: 'neutral' }, sc: 1 });
const act = (po, f, sc) => ({ vis: true, po, f, sc: sc || 1 });
let CT = 0;
const po = (w, yaw, arms, o) => Object.assign({ t: CT, x: w[0], y: w[1], z: w[2], yaw, arms }, o || {});
const talkCue = sd => (inCue(CT) && frac(CT * 0.8 + sd) < 0.7) ? 'AEOX'[Math.floor(CT * 8 + sd * 5) % 4] : undefined;
const fc = (expr, o, spk, look) => { const f = { expr, blink: blinkAt(CT, o || 0.15), look: look || [0, 0] }; if (spk != null) { const tk = talkCue(spk); if (tk) f.talk = tk; } return f; };
const floatOpt = { float: 1, feet: false, shadow: false };
const yawTo = (a, b) => Math.atan2(-(b[2] - a[2]), b[0] - a[0]);
const actS = (po, f, sx, b, hf, o) => Object.assign(act(po, f, 1), { scr: [sx, b], hf }, o || {});
const actW = (po, f, hf) => Object.assign(act(po, f, 1), { hf });
const P0 = (arms, o) => po([0, 0, 0], 0, arms, o);

/* ---------------------------------------------------------------- cameras */
const orb = (tg, D, az, el) => [tg[0] - Math.sin(az) * Math.cos(el) * D, tg[1] + Math.sin(el) * D, tg[2] + Math.cos(az) * Math.cos(el) * D];
function camKeys(lt, keys, drop) {
  let i = 0; while (i < keys.length - 2 && lt > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)]; let u = b[0] > a[0] ? cl((lt - a[0]) / (b[0] - a[0]), 0, 1) : 0; u = 0.65 * sm(u) + 0.35 * u;
  const tg = [0, 1, 2].map(k => lerp(a[1][k], b[1][k], u)), D = Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), u)), az = lerp(a[3], b[3], u), el = lerp(a[4], b[4], u), fov = lerp(a[5] || 36, b[5] || 36, u);
  const p = orb(tg, D, az, el), f = new THREE.Vector3(tg[0] - p[0], tg[1] - p[1], tg[2] - p[2]).normalize(), r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(r, f);
  const s = (drop == null ? 0.11 : drop) * 2 * D * Math.tan(fov * Math.PI / 360);
  return { p: [p[0] - up.x * s, p[1] - up.y * s, p[2] - up.z * s], l: [tg[0] - up.x * s, tg[1] - up.y * s, tg[2] - up.z * s], fov };
}
const tmp = new THREE.Vector3(), QY = new THREE.Quaternion(), YAX = new THREE.Vector3(0, 1, 0);
const place = (o, dx, dy, dz) => { o.position.copy(cam.position).add(tmp.set(dx, dy, dz).applyQuaternion(cam.quaternion)); o.quaternion.copy(cam.quaternion); };

/* ---------------------------------------------------------------- pump wheel angles (integrated speeds, deterministic) */
const boostW = t => sm(cl((t - (O[2] + 24.0)) / 1.2, 0, 1)) * (1 - sm(cl((t - (O[2] + 31.0)) / 1.2, 0, 1)));
const spd1 = t => 3.0 + 6.0 * boostW(t);
const spd2 = t => (t < O[1] + 17.2 ? 0.35 : 0.35 + 3.9 * sm(cl((t - (O[1] + 17.2)) / 2.8, 0, 1))) + 5.0 * boostW(t);
function integ(fn) { const n = Math.ceil(DUR * 100) + 2, a = new Float32Array(n); for (let i = 1; i < n; i++) a[i] = a[i - 1] + 0.5 * (fn((i - 1) / 100) + fn(i / 100)) * 0.01; return a; }
const ANG1 = integ(spd1), ANG2 = integ(spd2);
const angAt = (A, t) => { const f = t * 100, i = Math.min(A.length - 2, Math.floor(f)); return A[i] + (A[i + 1] - A[i]) * (f - i); };

/* ================================================================ per-frame state */
const V0 = () => ({ map: false, bowl: false, slope: false, canal: false, pools: false, gp: false, tap: false, recap: false });
const ONOFF = [QM2, ...CLN, CLS, SUNO, HCG, PIPE.root, THIN.root, CITYL.root, CITYD, ROUTE.root, RULG, DROPI, GLM.root, QM, N130, QTAP, N250, DSH, ALMOST, GULL.root, BOARD, SIGN.root, ...DROPS, YC4, BANNER];
function resetAll() {
  ONOFF.forEach(o => { o.visible = false; });
  BR.forEach(b => { b.L.root.visible = false; b.d.visible = false; });
  BANDN.material.opacity = 0; BANDS.material.opacity = 0;
  LAND.setHula(0); LAND.setPin(0); LAND.setDim(0); LAND.setOutline(0); LAND.setGlow(0, 0); LAND.setGlow(1, 0); LAND.pondPulse(0);
  CS.setSea(0); CS.setPointer(0, false); CS.setBracket(0); CS.seaGlow(0); RS.draw(0); PS1.setGlow(0); PS2.setGlow(0); ALMOST.material.opacity = 0;
  CAL.flip(0); PAN.visible = false; TAP.setOpen(0); TAP.setStream(0, 0, 0);
  CITYH.scale.setScalar(0.001);
}
function frame(tl) {
  const t = Math.max(0, Math.min(DUR, tl)); CT = t;
  const si = shotOf(t), lt = t - O[si];
  const V = V0(), X = { cam: null, rel: [], grains: null, ins: null, sky: null, fg: null }, C = { G: NONE(), T: NONE() };
  resetAll();
  [s0, s1, s2, s3, s4, s5, s6][si](t, lt, V, X, C);
  return finish(t, lt, si, V, X, C);
}

/* ---------------------------------------------------------------- c1 : the water is low (map -> bowl) */
function s0(t, lt, V, X, C) {
  const KN = mll(35.55, 32.8), HQ_ = mll(34.95, 32.02), tgN = mll(35.45, 32.95), tgC = mll(35.0, 31.75), NEG = mll(34.85, 30.55);
  if (lt < 26.5) {
    V.map = true; LAND.setPin(U(lt, 0.4, 1.2));
    const keys = [[0, tgN, 2900, 0.05, 0.55, 38], [5.4, tgN, 2450, 0.05, 0.55, 38], [6.6, tgC, 4900, 0.08, 0.78, 38], [13.3, tgC, 4800, 0.1, 0.78, 38], [14.6, HQ_, 3400, 0.0, 0.62, 36], [18.6, KN, 3300, 0.05, 0.62, 36], [22.5, KN, 3300, 0.0, 0.62, 36], [25.9, HQ_, 3400, 0.0, 0.62, 36], [26.5, HQ_, 3400, 0.0, 0.62, 36]];
    X.cam = camKeys(lt, keys, 0.07);
    const fl = (p, k) => [p[0] + 0, p[1] + k, p[2] + 0];
    const bandK = ease(lt, 5.6, 7.4), bandS = ease(lt, 8.0, 9.6);
    BANDN.material.opacity = 0.75 * bandK * (1 - U(lt, 13.4, 15.0)); BANDS.material.opacity = 0.8 * bandS * (1 - U(lt, 13.4, 15.0));
    CLN.forEach((c, i) => { c.visible = lt > 5.6; c.scale.setScalar(Math.max(0.001, 1.9 * U(lt, 5.8 + i * 0.5, 7.0 + i * 0.5) * (1 - U(lt, 13.4, 14.2)))); c.position.set(c.userData.base[0], c.userData.base[1] + 30 * Math.sin(t * 0.9 + i * 2), c.userData.base[2]); });
    CLS.visible = lt > 9.0; CLS.scale.setScalar(Math.max(0.001, 1.0 * U(lt, 9.2, 10.0) * (1 - U(lt, 13.4, 14.2)))); CLS.position.set(CLS.userData.base[0], CLS.userData.base[1] + 20 * Math.sin(t * 0.8), CLS.userData.base[2]);
    SUNO.visible = lt > 8.4; SUNO.scale.setScalar(Math.max(0.001, 1.6 * U(lt, 8.6, 9.6) * (1 - U(lt, 13.4, 14.2)))); SUNO.userData.update(t);
    if (lt > 13.9) { HCG.visible = true; const hc = HCG.userData.hc; hc.children.forEach((h, i) => { h.scale.setScalar(Math.max(0.001, U(lt, 14.3 + i * 0.45, 15.2 + i * 0.45))); }); HCG.scale.setScalar(0.42); }
    if (lt > 14.0) { LAND.setGlow(0, (0.5 + 0.5 * Math.sin(t * 7)) * (lt < 25 ? 1 : 0.3)); }
    if (lt < 5.4) {
      C.G = actS(P0('hips', { tilt: 1.5 * Math.sin(t * 1.3) }), fc('happy', 0.15, 0), -0.78, -0.56, 0.3);
      C.T = actS(P0('down'), fc('happy', 0.5, null, [0.3, 0.2]), 0.74, -0.56, 0.24);
    } else if (lt < 13.9) {
      C.G = actS(P0('point', { tilt: 1 }), fc('happy', 0.15, 0), -0.8, -0.56, 0.3, { yawOff: lt < 9.5 ? 0.9 : 0.5 });
      const u = U(lt, 8.6, 12.8), a = KN, b = NEG, hop = lt > 8.6 && lt < 12.8 ? 0.35 * Math.abs(Math.sin(u * 26)) : 0;
      const pos = [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + hop * 90, lerp(a[2], b[2], u)];
      const tired = lt > 12.8;
      C.T = actW(po(pos, yawTo(a, b), tired ? 'hips' : 'down', { walk: 0, tilt: tired ? 5 * Math.sin(t * 6) : 0 }), fc(tired ? 'tired' : 'happy', 0.5, null, [0, 0.1]), 0.075);
    } else {
      const gp = mll(34.80, 32.0), g2 = [gp[0], gp[1], gp[2]];
      C.G = actW(po(g2, -1.4, 'hips', { tilt: 3 * Math.sin(t * 2) }), fc(lt > 20 ? 'worried' : 'curious', 0.15, 0), 0.24);
      const cyc = (lt - 14.0) / 5.2, w = tri(cyc), a = HQ_, b = KN;
      const pos = [lerp(a[0], b[0], w), lerp(a[1], b[1], w) + 40 * Math.abs(Math.sin(cyc * 38)), lerp(a[2], b[2], w)];
      C.T = actW(po(pos, yawTo(a, b) + (frac(cyc) > 0.5 ? Math.PI : 0), 'down', { walk: 0 }), fc('happy', 0.5, null, [0, 0.1]), 0.18);
    }
    return;
  }
  /* bowl */
  V.bowl = true; const surf = FA_SURF, yS = SEC.yAt, SF = 2.3, ZF = 215, tgB = (x, y) => bw(x, y, 0);
  if (lt < 33.7) {
    X.cam = camKeys(lt, [[26.5, tgB(1900, 600), 6000, 0.0, 0.0, 36], [33.7, tgB(1900, 620), 5600, 0.04, -0.04, 36]], 0.04);
    C.T = act(po(bw(2270, surf + 6, ZF), -1.0, 'down', floatOpt), fc('curious', 0.5, 1, [-0.8, 0.5]), SF);
    C.G = act(po(bw(700, 1250, ZF), -1.7, 'down'), fc('happy', 0.15, 0), SF * 1.05);
    return;
  }
  X.cam = camKeys(lt, [[33.7, tgB(1500, 520), 5400, 0.0, 0.03, 36], [38.2, tgB(1450, 600), 5300, 0.0, 0.03, 36]], 0.0);
  let x, tilt = 0, face = 'worried';
  const A1 = [33.9, 35.0, 35.8], B1 = [35.9, 36.9, 37.6];
  if (lt < 35.0) { x = lerp(1680, 1230, U(lt, 33.9, 35.0)); } else if (lt < 35.8) { x = lerp(1230, 1680, U(lt, 35.0, 35.8)); face = 'surprised'; } else if (lt < 36.9) { x = lerp(1680, 1180, U(lt, 35.9, 36.9)); } else { x = lerp(1180, 1700, U(lt, 36.9, 37.7)); face = 'tired'; }
  const climbing = (lt >= 33.9 && lt < 35.0) || (lt >= 35.9 && lt < 36.9), hop = climbing ? 70 * Math.abs(Math.sin(lt * 12)) : 0;
  const lying = lt > 37.7;
  C.T = act(po(bw(x, yS(x) + 8 + hop, ZF), -2.5, 'down', { walk: 0, tilt: lying ? 70 : -climbing * 6, shadow: false }), fc(face, 0.5, 1), SF);
  C.G = act(po(bw(700, 1250, ZF), -1.7, 'hips', { tilt: 2 }), fc('curious', 0.15, 0), SF * 1.05);
  if (lt > 36.2) { QM.visible = true; QM.position.set(...bw(1050, 1050, 260)); QM.scale.setScalar(5.2 * U(lt, 36.2, 36.9) + 0.001); }
}

/* ---------------------------------------------------------------- c2 : the two pumps */
const PA = CS.PR;
function slopeCam(lt, keys, drop) { return camKeys(lt, keys, drop); }
const UA = CS.uOfX(-1000), UB = CS.uOfX(1100), UC = CS.uOfX(2250), UD = CS.uOfX(2700), UE = CS.uOfX(3070), UF = CS.uOfX(3950), UG = 1;
function rideAt(u, o) { const p = CS.pipeAt(u); return [ST.slope[0] + p[0], ST.slope[1] + p[1], ST.slope[2] + 14]; }
function altOf(y) { return Math.max(0, Math.round((y - CS.PR) / 6)); }
function s1(t, lt, V, X, C) {
  V.slope = true; RS.draw(1); PS1.setSpin(angAt(ANG1, t)); PS2.setSpin(angAt(ANG2, t));
  const tgS = (x, y) => sw(x, y, 0), SC = 1.3;
  let u = UA, pip = false;
  if (lt < 9.4) {
    u = lerp(UA, UB, U(lt, 1.0, 8.6)); pip = true;
    const px = CS.pipeAt(u);
    X.cam = camKeys(0, [[0, tgS(px[0] + 700, px[1] + 250), 3900, 0.0, 0.04, 36]], 0.1);
    C.G = actS(P0('point'), fc('happy', 0.15, 0), -0.8, -0.56, 0.3, { yawOff: 0.6 });
  } else if (lt < 17.9) {
    u = lerp(UB, UC, U(lt, 9.6, 16.0)); pip = true;
    X.cam = slopeCam(lt, [[9.4, tgS(2300, 1000), 5600, 0.0, 0.04, 36], [17.3, tgS(2900, 1300), 5400, 0.0, 0.04, 36], [17.9, tgS(3000, 1500), 4800, 0.0, 0.04, 36]], 0.1);
    const kS = U(lt, 9.5, 11.0); CS.setSea(kS);
    const yy = CS.pipeAt(u)[1]; CS.setPointer(yy - CS.PR, true);
    setNum(CS.digits, String(Math.min(250, altOf(yy)))); CS.seaGlow(lt > 12 && lt < 15 ? 0.5 + 0.5 * Math.sin(t * 6) : 0);
    C.G = actS(P0('down'), fc('curious', 0.15, 0, [0.5, 0.9]), 0.8, -0.56, 0.3);
  } else if (lt < 26.5) {
    CS.setSea(1);
    X.cam = slopeCam(lt, [[17.9, tgS(3000, 1500), 4800, 0.0, 0.04, 36], [21.5, tgS(3100, 1700), 4600, 0.0, 0.04, 36], [26.5, tgS(3600, 1900), 4700, 0.0, 0.04, 36]], 0.1);
    pip = true; let hopY = 0, sz = 1;
    if (lt < 20.4) u = lerp(UC, UD, U(lt, 17.9, 20.4)); else if (lt < 21.8) u = UD; else { u = lerp(UE, UF, U(lt, 21.8, 26.2)); const h = lt - 21.8; hopY = h < 0.9 ? 160 * Math.sin(h / 0.9 * Math.PI) : 0; sz = h < 0.9 ? 1 + 0.12 * Math.sin(h / 0.9 * Math.PI) : 1 - 0.1 * Math.exp(-(h - 0.9) * 6) * Math.abs(Math.sin((h - 0.9) * 14)); }
    PS2.setGlow(U(lt, 18.0, 19.5) * (lt < 25 ? 1 : 0.4)); PS1.setGlow(0);
    N115.visible = lt > 18.3; N115.position.set(...sw(3550, 2500, 260)); N115.scale.setScalar(1.7 * (0.6 + 0.4 * U(lt, 18.3, 19.0)));
    const yy = CS.pipeAt(u)[1]; CS.setPointer(yy - CS.PR, true); setNum(CS.digits, '250');
    C.G = actS(P0('down'), fc('curious', 0.15, 0, [0.5, 0.9]), 0.8, -0.56, 0.3);
    if (pip) { const pp = rideAt(u); C.T = act(po([pp[0], pp[1] + hopY, pp[2]], -0.9, 'up', floatOpt), fc('cheering', 0.5, 1), SC); C.T.sz = sz; }
    if (lt < 21.8 && lt > 20.4) { /* hidden inside the wheels hall: nothing extra */ }
    return;
  } else {
    /* c4 : the question, then the total */
    CS.setSea(1); CS.setPointer(CS.PP[CS.PP.length - 1][1] - CS.PR, false);
    const q = lt < 29.8;
    X.cam = slopeCam(lt, [[26.5, tgS(1500, 1150), 8200, 0.0, 0.05, 36], [29.8, tgS(1500, 1150), 8200, 0.0, 0.05, 36], [31.0, tgS(3100, 1250), 6800, 0.0, 0.05, 36], [36.1, tgS(3300, 1250), 6600, 0.0, 0.05, 36]], 0.1);
    if (q) { QM.visible = true; QM.position.set(...sw(1300, 2050, 330)); QM.scale.setScalar(8.0 * U(lt, 26.6, 27.3) + 0.001); }
    CS.setBracket(U(lt, 30.2, 32.6));
    C.T = actW(po(sw(4560, 2236, 230), -1.5, lt < 29.8 ? 'down' : 'up', { walk: 0 }), fc(lt < 29.8 ? 'curious' : 'cheering', 0.5, 1, lt < 29.8 ? [-0.2, -0.9] : [0, 0]), 0.1);
    C.G = actW(po(sw(130, 6, 250), -1.2, lt < 29.8 ? 'down' : 'hips', { tilt: lt > 31 ? 4 * Math.sin(t * 5) : 0 }), fc(lt < 29.8 ? 'curious' : 'happy', 0.15, 0, lt < 29.8 ? [0.4, 0.9] : [0, 0]), 0.15);
    return;
  }
  const pp = rideAt(u), ang = CS.pipeAt(u)[2];
  let sq = 1;
  if (lt >= 12 && lt < 14.5) { const yy = CS.pipeAt(u)[1]; const d = Math.abs(yy - CS.SEA); if (d < 130) sq = 1 - 0.18 * (1 - d / 130); }
  C.T = act(po(pp, -0.9, 'up', floatOpt), fc(lt > 16 ? 'cheering' : 'happy', 0.5, 1), SC); C.T.sz = sq;
}

/* ---------------------------------------------------------------- c2b : like the road */
function s2(t, lt, V, X, C) {
  V.slope = true; PS1.setSpin(angAt(ANG1, t)); PS2.setSpin(angAt(ANG2, t)); const tgS = (x, y) => sw(x, y, 0), SC = 1.35;
  CS.setSea(0); const WIDE = [tgS(-250, 1000), 9000, 0.0, 0.05, 36];
  const dash = (x0, x1, y, k) => { DSH.visible = k > 0.01; DSH.userData.set(x0, x1, y, 220, k); };
  if (lt < 8.6) {
    RS.draw(0);
    X.cam = camKeys(lt, [[0, WIDE[0], 9000, 0, 0.05, 36], [8.6, WIDE[0], 8800, 0, 0.05, 36]], 0.12);
    QM.visible = true; QM.position.set(...sw(-3900, 1500, 330)); QM.scale.setScalar(6.0 * U(lt, 0.9, 1.6) + 0.001); QM2.visible = true; QM2.position.set(...sw(2300, 2300, 330)); QM2.scale.setScalar(6.0 * U(lt, 1.4, 2.1) + 0.001);
    C.G = actS(P0('hips', { tilt: 2 }), fc('happy', 0.15, 0), 0.0, -0.56, 0.28);
    return;
  }
  if (lt < 17.2) {
    const k = U(lt, 9.2, 15.0); RS.draw(k);
    X.cam = camKeys(lt, [[8.6, WIDE[0], 8800, 0, 0.05, 36], [10.4, tgS(-3500, 1300), 6200, 0.0, 0.04, 36], [17.2, tgS(-3600, 1350), 6000, 0.0, 0.04, 36]], 0.11);
    const rp = RS.roadAt(k), segs = 7, hop = 130 * Math.abs(Math.sin(k * segs * Math.PI));
    C.T = act(po(sw(rp[0], rp[1] + 6 + (k > 0 && k < 1 ? hop : 0), RS.D / 2 + 90), k < 0.5 ? -0.6 : -1.2, 'down', { walk: 0 }), fc('happy', 0.5, 1), 1.5);
    C.G = actS(P0('point'), fc('happy', 0.15, 0), 0.8, -0.56, 0.3, { yawOff: -0.6 });
    return;
  }
  RS.draw(1);
  if (lt < 24.3) {
    const s = U(lt, 17.5, 20.2), steps = 5, q = Math.floor(s * steps), fr = s * steps - q, uu = lerp(UE, UG, (q + sm(cl(fr * 1.6, 0, 1))) / steps);
    const pp = rideAt(Math.min(1, uu)), hop = fr < 0.6 ? 60 * Math.sin(fr / 0.6 * Math.PI) : 0;
    const wide = lt > 20.4;
    X.cam = camKeys(lt, [[17.2, tgS(3300, 1500), 5200, 0, 0.04, 36], [20.2, tgS(3500, 1900), 5200, 0, 0.04, 36], [21.6, tgS(-250, 1500), 9000, 0, 0.05, 36], [24.3, tgS(-250, 1500), 8800, 0, 0.05, 36]], 0.11);
    if (lt > 20.2) { const kk = U(lt, 20.4, 22.4); dash(CS.PP[CS.PP.length - 1][0] + ST.slope[0] - ST.slope[0], -3300, 2420, kk); }
    ALMOST.material.opacity = lt > 22.4 ? (0.35 + 0.35 * Math.sin(t * 6)) * U(lt, 22.4, 23.0) : 0;
    const topT = lt > 20.2;
    C.T = act(po([pp[0], pp[1] + hop, pp[2]], -0.9, topT ? 'up' : 'up', floatOpt), fc(topT ? 'worried' : 'happy', 0.5, 1), SC); if (topT) C.T.sz = 1.08 + 0.03 * Math.sin(t * 8);
    C.G = actS(P0('point', { tilt: 2 }), fc('curious', 0.15, 0), -0.12, -0.56, 0.26);
    return;
  }
  /* c4 : wheels fast, drops loop, whip pans */
  const ph = (lt - 24.3) / 2.2, pass = Math.floor(ph), fr = ph - pass;
  const uu = lerp(UA + 0.04, UG, cl(fr, 0, 1)), pp = rideAt(Math.min(1, Math.max(0, uu)));
  const cams = [[24.3, tgS(900, 600), 4800, 0, 0.04, 36], [26.0, tgS(1500, 900), 4800, 0, 0.04, 36], [26.5, tgS(-3500, 1300), 6200, 0, 0.04, 36], [28.3, tgS(-3600, 1350), 6200, 0, 0.04, 36], [28.8, tgS(2800, 1300), 5400, 0, 0.04, 36], [31.0, tgS(3400, 1700), 5400, 0, 0.04, 36], [37.0, tgS(-250, 1500), 8800, 0, 0.05, 36]];
  X.cam = camKeys(lt, cams, 0.11);
  if (lt > 31.0) { const kk = 1; dash(CS.PP[CS.PP.length - 1][0], -3300, 2420, kk); ALMOST.material.opacity = 0.35 + 0.3 * Math.sin(t * 5); X.cam = camKeys(lt, [[31.0, tgS(3400, 1700), 5400, 0, 0.04, 36], [33.0, tgS(-250, 1500), 8800, 0, 0.05, 36], [37.0, tgS(-250, 1500), 8800, 0, 0.05, 36]], 0.11); }
  DROPS.forEach((d, i) => { const uq = ((ph * 0.8 + i * 0.22) % 1); const p = CS.pipeAt(cl(uq, 0, 1)); d.visible = lt < 31; d.position.set(ST.slope[0] + p[0], ST.slope[1] + p[1] - 100, ST.slope[2] + 40); });
  if (lt < 31) C.T = act(po([pp[0], pp[1], pp[2]], -0.9, 'up', floatOpt), fc('cheering', 0.5, 1), SC);
  else { C.T = act(po(sw(4560, 2236, 230), -1.5, 'up', { walk: 0 }), fc('cheering', 0.5, 1), 1.55); }
  C.G = actS(P0('hips', { tilt: 2 }), fc('happy', 0.15, 0), -0.12, -0.56, 0.26);
}

/* ---------------------------------------------------------------- c3 : canal, tunnel, pools */
const cw = (x, y, z) => [ST.canal[0] + x, ST.canal[1] + y, ST.canal[2] + (z || 0)];
const pw = (x, y, z) => [ST.pools[0] + x, ST.pools[1] + y, ST.pools[2] + (z || 0)];
function s3(t, lt, V, X, C) {
  if (lt < 18.7) {
    V.canal = true; [CAN1, CANT, CAN2].forEach(c => c.update(t));
    if (lt < 10.2) {
      const x = lerp(300, 8300, U(lt, 1.0, 10.0) * 0.5 + 0.5 * U(lt, 1.0, 10.0)), tx = lerp(300, 7300, U(lt, 1.0, 10.0));
      const xx = tx, inTun = xx > 3650 && xx < 5550;
      const az = lt < 5.2 ? 0.45 : lt < 6.4 ? lerp(0.45, 1.5, U(lt, 5.2, 6.4)) : lt < 8.6 ? 1.5 : lerp(1.5, 0.45, U(lt, 8.6, 9.8));
      const camX = lt >= 5.8 && lt < 8.8 ? xx - 150 : xx + 250;
      X.cam = camKeys(lt, [[0, cw(xx + 250, 160), 1900, az, 0.2, 36], [10.2, cw(xx + 250, 160), 1900, az, 0.2, 36]], 0.1);
      X.cam.p = orb(cw(xx + (lt >= 5.8 && lt < 8.8 ? 450 : 250), 160), lt >= 5.8 && lt < 8.8 ? 2100 : 1900, az, lt >= 5.8 && lt < 8.8 ? 0.06 : 0.2).map((v, i) => v); X.cam.l = cw(xx + (lt >= 5.8 && lt < 8.8 ? 450 : 250), 160);
      C.T = act(po(cw(xx, 80, 0), -0.4, 'down', { float: 1, feet: false, shadow: false, tilt: -20 }), fc('happy', 0.5, 1), 1.4);
      C.G = act(po(cw(4600, TUN.topY + 4, 0), -1.5, 'wave'), fc('happy', 0.15, 0), 2.0);
      if (lt < 5.0) C.G = act(po(cw(xx + 1500, 0, 520), -1.4, 'wave'), fc('happy', 0.15, 0), 1.5);
      return;
    }
    /* valley, aerial dolly */
    const k = U(lt, 10.2, 18.6), xx = lerp(6600, 13400, k), gx = xx + 360;
    X.cam = { p: cw(xx - 700, 1100, 2300), l: cw(xx + 500, 60, 0), fov: 38 };
    X.cam.p = [X.cam.p[0], X.cam.p[1], X.cam.p[2]]; X.cam.l = [X.cam.l[0], X.cam.l[1] + 260, X.cam.l[2]];
    BOARD.visible = true; BOARD.position.set(...cw(xx, 78, 0)); BOARD.rotation.y = 0.1 * Math.sin(t * 2);
    C.T = act(po(cw(xx, 100 + 6 * Math.sin(t * 3), 0), -0.7, 'wave', { walk: 0, tilt: 6 * Math.sin(t * 2) }), fc('cheering', 0.5, 1), 1.6);
    GULL.root.visible = true; GULL.pose({ t, x: cw(xx + 800, 0, 0)[0], y: cw(0, 520 + 60 * Math.sin(t * 1.3), 0)[1], z: cw(0, 0, 360 + 60 * Math.sin(t * 0.9))[2], yaw: 0, flap: 0.5 + 0.5 * Math.sin(t * 9), fly: 1 });
    C.G = act(po(cw(gx + 500, 6, 480), -0.7, 'hips', { walk: 1, ph: gx / 300 }), fc('happy', 0.15, 0), 1.6);
    return;
  }
  V.pools = true; const WH = POOLS.WH;
  const s0t = lt - 18.7;
  const clr = [U(lt, 19.0, 27.0) * 0.9 + (lt > 32 ? 0.0 : 0), 0.15 * U(lt, 19, 30), 0.1 * U(lt, 19, 30)];
  const clr1 = lt < 32 ? clr[0] : lerp(0.9, 0.97, U(lt, 32, 40));
  const ck = [clr1, clr[1], clr[2]]; X.grains = [Math.max(0, s0t) + 5, lt < 32 ? 1 : lerp(1, 0.3, U(lt, 32, 34)), ck]; for (let i = 0; i < 3; i++) POOLS.setClear(i, ck[i]);
  if (lt < 25.9) {
    X.cam = camKeys(lt, [[18.7, pw(700, 400), 2700, 0, 0.06, 36], [25.9, pw(700, 420), 2700, 0.05, 0.08, 36]], 0.06);
    C.T = act(po(pw(0, 24 + 160 + 8 * Math.sin(t * 2), 40), -1.0, 'down', floatOpt), fc('happy', 0.5, 1), 1.25);
    C.G = act(po(pw(450, 490, 0), -1.4, 'hips'), fc('happy', 0.15, 0), 1.0);
  } else if (lt < 32.0) {
    SIGN.root.visible = true; X.cam = camKeys(lt, [[25.9, pw(1000, 560), 3300, 0.0, 0.06, 36], [32.0, pw(1000, 560), 3100, 0.0, 0.06, 36]], 0.06);
    C.G = act(po(pw(1560, 490, 40), -2.3, 'point'), fc('happy', 0.15, 0), 1.0);
    C.T = act(po(pw(1180, 936, 20), -1.3, 'down', { walk: 0 }), fc('happy', 0.5, 1), 1.2);
  } else if (lt < 40.5) {
    X.cam = camKeys(lt, [[32.0, pw(900, 380), 3600, 0, 0.06, 36], [34.0, pw(0, 230), 1500, 0, 0.02, 36], [40.5, pw(10, 220), 1400, 0, 0.02, 36]], 0.04);
    C.T = act(po(pw(0, 24 + 70, 60), -1.57, 'down', { walk: 0, tilt: 82, float: 0, shadow: false }), fc('tired', 0.5, null, [0, -0.2]), 1.0);
    C.G = act(po(pw(450, 490, 0), -1.4, 'down'), fc('curious', 0.15, 0), 1.0);
  } else {
    const sk = U(lt, 41.0, 45.5);
    X.cam = camKeys(lt, [[40.5, pw(10, 220), 1400, 0, 0.02, 36], [46.4, pw(1100, 700), 4800, 0.0, 0.2, 36]], 0.06);
    const seg = cl((lt - 41.0) / 1.5, 0, 2.999), si_ = Math.floor(seg), f = seg - si_, xs = [0, 900, 1800, 2900];
    const x0 = xs[Math.min(3, si_)], x1 = xs[Math.min(3, si_ + 1)], yy = (si_ === 2 ? 24 : 490) + 0;
    const yA = si_ === 0 ? 100 : 490, yB = si_ === 2 ? 90 : 490;
    const px = lerp(x0, x1, sm(f)), py = lerp(yA, yB, f) + 460 * Math.sin(f * Math.PI);
    if (lt < 41.0) C.T = act(po(pw(0, 24 + 70, 60), -1.57, 'down', { walk: 0, tilt: 82 - 82 * U(lt, 40.5, 41.0), shadow: false }), fc('happy', 0.5, 1), 1.0);
    else C.T = act(po(pw(px, lt > 44.4 ? 90 : py, 40), -0.5, 'up', { walk: 0 }), fc('cheering', 0.5, 1), 1.0);
    C.G = act(po(pw(450, 490, 0), -1.3, 'wave'), fc('happy', 0.15, 0), 1.0);
    X.sky = [SKYP.clear, SKYP.sunset, U(lt, 41, 46.4)];
  }
}

/* ---------------------------------------------------------------- c4 : the giant pipe, the pipe on the map, the year */
const gw = (x, y, z) => [ST.gp[0] + x, ST.gp[1] + y, ST.gp[2] + (z || 0)];
function s4(t, lt, V, X, C) {
  if (lt < 8.6) {
    V.gp = true; const a = lt / 8.6;
    X.cam = camKeys(lt, [[0, gw(-120, 330), 2500, 0.35, 0.05, 36], [8.6, gw(-100, 330), 2300, -0.15, 0.05, 36]], 0.06);
    C.T = act(po(gw(520, 4, 0), -1.4, 'up', { walk: 0 }), fc('happy', 0.5, 1, [-0.4, 0.4]), 1.0);
    C.G = act(po(gw(-760, 0, -130), -1.45, 'hips'), fc('happy', 0.15, 0), 1.0);
    return;
  }
  if (lt < 26.4) {
    V.map = true; const KNp = PIPE_PTS[0], mid = mll(35.2, 32.35);
    const keys = [[8.6, mll(35.25, 32.4), 3300, 0.0, 0.66, 36], [17.7, mll(35.2, 32.2), 3200, 0.0, 0.66, 36], [26.4, mll(35.1, 32.0), 3300, 0.0, 0.66, 36]];
    X.cam = camKeys(lt, keys, 0.07);
    const dk = U(lt, 9.2, 14.0), th = U(lt, 14.0, 16.6);
    PIPE.root.visible = true; PIPE.setDraw(dk); THIN.root.visible = true; THIN.setDraw(th);
    LAND.setPin(1);
    const Tp = lt < 17.8 ? PIPE.at(cl(dk, 0, 1)) : PIPE.at(cl(U(lt, 18.2, 25.5), 0, 1));
    const tu = lt < 17.8 ? dk : U(lt, 18.2, 25.5), hop = lt > 9.2 ? 26 * Math.abs(Math.sin((lt < 17.8 ? dk : tu) * 60)) : 0;
    const tp = mwa(Tp[0], TOP + 4 + hop, Tp[1]);
    const nxt = PIPE.at(cl((lt < 17.8 ? dk : tu) + 0.03, 0, 1)), dir = [nxt[0] - Tp[0], nxt[1] - Tp[1]];
    C.T = actW(po(tp, Math.atan2(-dir[1], dir[0]), 'down', { walk: 0 }), fc('happy', 0.5, 1), 0.06);
    if (lt >= 17.8) {
      const k = U(lt, 18.0, 20.0); RULG.visible = true; const a = PIPE_PTS[0], b = RHA, ang = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
      RULG.position.set(a[0] + 18 * Math.sin(ang), TOP + 7, a[1] + 18 * Math.cos(ang)); RULG.rotation.y = ang; RUL.userData.grow(k);
      N130.visible = k > 0.9; N130.position.copy(new THREE.Vector3(...mwa((a[0] + b[0]) / 2 + 60, TOP + 160, (a[1] + b[1]) / 2 - 20))); N130.scale.setScalar(2.6 * U(lt, 20.0, 20.8) + 0.001);
    }
    if (lt < 17.8) C.G = actS(P0('down', { tilt: 1.5 * Math.sin(t * 1.3) }), fc('happy', 0.15, 0), -0.8, -0.56, 0.3);
    else C.G = actS(P0('point'), fc('happy', 0.15, 0), -0.8, -0.56, 0.3, { yawOff: 0.7 });
    return;
  }
  V.gp = true; const k = U(lt, 27.4, 31.8);
  X.cam = camKeys(lt, [[26.4, gw(6350, 760), 3700, 0.0, 0.03, 36], [37.7, gw(6250, 760), 3300, 0.0, 0.03, 36]], 0.06);
  CAL.flip(k * 5); YC4.visible = k > 0.98; const pop = 1 + 0.08 * Math.exp(-(lt - 31.8) * 3) * Math.sin((lt - 31.8) * 9); if (YC4.visible) YC4.scale.setScalar(Math.max(0.1, pop));
  BANNER.visible = lt > 32.0; const sw_ = lt > 32.0 ? Math.exp(-(lt - 32.0) * 0.5) * 0.45 * Math.cos((lt - 32.0) * 3.2) : 0; BANNER.rotation.z = sw_; BANNER.position.y = 1050 + 300 * (1 - U(lt, 32.0, 32.8));
  C.G = act(po(gw(5000, 4, 160), -1.3, lt > 32 ? 'up' : 'hips', { raw: lt > 32.2 && lt < 35.5 ? [{ out: 0.2 }, { out: 2.4, fw: 0.3 }] : null }), fc('happy', 0.15, 0), 1.3);
  C.T = act(po(gw(7250, 4, 200), -1.6, 'up', { walk: 0 }), fc('cheering', 0.5, 1), 1.2);
}

/* ---------------------------------------------------------------- c4b : to our tap */
const tw = (x, y, z) => [ST.tap[0] + x, ST.tap[1] + y, ST.tap[2] + (z || 0)];
function s5(t, lt, V, X, C) {
  const dots = k => BR.forEach((b, i) => { const kk = cl(k * BR.length - i, 0, 1); b.L.root.visible = kk > 0.001; b.L.setDraw(kk); b.d.visible = kk > 0.9; b.d.scale.setScalar(kk > 0.9 ? 0.4 + 0.6 * Math.min(1, (kk - 0.9) * 10) : 1); });
  const fullMap = () => { PIPE.root.visible = true; PIPE.setDraw(1); THIN.root.visible = true; THIN.setDraw(1); LAND.setPin(1); };
  const mapShot = lt < 19.9 || lt >= 25.4;
  if (mapShot) V.map = true;
  if (lt < 19.9) {
    fullMap();
    const KNp = mll(35.1, 32.2), cityw = mll(34.99, 31.75);
    if (lt < 7.3) {
      dots(U(lt, 0.8, 6.0)); X.cam = camKeys(lt, [[0, mll(35.0, 32.1), 3500, 0.0, 0.64, 36], [7.3, mll(35.0, 32.1), 3300, 0.0, 0.64, 36]], 0.07);
      const k = U(lt, 0.8, 6.0) * BR.length, bi = Math.min(BR.length - 1, Math.floor(k)), f = k - bi, b = BR[bi];
      const p = b.L.at(f), tp = mwa(p[0], TOP + 5 + 14 * Math.abs(Math.sin(f * 22)), p[1]);
      C.T = actW(po(tp, 0.5, 'down', { walk: 0 }), fc('happy', 0.5, 1), 0.05);
      C.G = actS(P0('hips'), fc('happy', 0.15, 0), -0.8, -0.56, 0.3);
    } else {
      dots(1); const z = U(lt, 7.3, 11.5);
      CITYL.root.visible = true; CITYL.setDraw(U(lt, 7.5, 10.5)); CITYD.visible = lt > 10.0; CITYH.scale.setScalar(Math.max(0.001, 0.55 * U(lt, 10.8, 12.4)));
      X.cam = camKeys(lt, [[7.3, mll(35.0, 32.1), 3300, 0.0, 0.64, 36], [11.8, cityw, 1250, 0.0, 0.6, 36], [19.9, cityw, 1150, 0.0, 0.6, 36]], 0.07);
      if (lt < 13.8) { const cp = CITYL.at(U(lt, 7.5, 10.5)); C.T = actW(po(mwa(cp[0], TOP + 5 + 14 * Math.abs(Math.sin(U(lt, 7.5, 10.5) * 40)), cp[1]), -0.6, 'down', { walk: 0 }), fc('happy', 0.5, 1), lerp(0.05, 0.1, z)); }
      C.G = actS(P0('down'), fc('happy', 0.15, 0), -0.8, -0.56, 0.3);
      if (lt >= 13.8) { X.ins = { tg: tw(-200, 300, 0), D: 2300 }; C.T = NONE(); C.G = NONE(); QTAP.visible = true; QTAP.position.set(...tw(520, 420, 120)); QTAP.scale.setScalar(2.4 * U(lt, 14.2, 14.8) + 0.001); }
    }
    CITYL.root.visible = lt >= 7.3; CITYD.visible = lt > 10.0;
    if (lt >= 13.8) {
      /* the cast lives in the tap inset */
      V.tap = true; TAP.setOpen(0); GLT.setFill(0.0);
      C.G = act(po(tw(-470, 4, 60), -0.7, 'point', {}), fc('happy', 0.15, 0), 1.7); C.T = NONE(); C.G.ins = true;
    } else V.tap = false;
    return;
  }
  if (lt < 25.4) {
    V.tap = true; fullMapOff(); const a = lt - 19.9;
    X.cam = camKeys(lt, [[19.9, tw(0, 300, 0), 2300, 0.0, 0.04, 36], [25.4, tw(0, 270, 0), 2000, 0.0, 0.04, 36]], 0.06);
    const open = U(lt, 20.2, 21.2); TAP.setOpen(open);
    const fall = U(lt, 21.4, 22.6), ty = lerp(440, 215, fall * fall), inGlass = lt > 22.6;
    TAP.setStream(430, inGlass ? 130 : 430 - 300 * 0, open > 0.5 && lt < 24.2 ? 26 * (1 - U(lt, 23.8, 24.2)) : 0);
    TAP.setStream(430, 150, open > 0.5 && lt < 24.2 && lt > 22.4 ? 24 : 0);
    GLT.setFill(U(lt, 22.4, 25.0) * 0.32);
    C.T = act(po(tw(0, ty + (inGlass ? 20 * Math.sin(t * 2) : 0), 40), -1.5, 'up', inGlass ? floatOpt : { shadow: false }), fc(inGlass ? 'cheering' : 'surprised', 0.5, 1), inGlass ? 0.75 : 0.62);
    if (lt > 22.6) C.T.po.float = 1;
    C.G = act(po(tw(-420, 4, -80), -1.5, 'hips'), fc('happy', 0.15, 0), 1.2);
    return;
  }
  /* match cut to the map: the blue line glows back from the glass to the Kinneret */
  fullMap(); dots(1); CITYL.root.visible = true; CITYL.setDraw(1); CITYD.visible = true; CITYH.scale.setScalar(0.55);
  const cityw = mll(34.99, 31.75);
  const rk = U(lt, 25.6, 29.0); ROUTE.root.visible = true; ROUTE.setDraw(rk); ROUTE.setGlow(0.6 + 0.4 * Math.sin(t * 5));
  DROPI.visible = lt < 29.6 && lt > 25.6; { const p = ROUTE.at(rk); DROPI.position.set(p[0], TOP + 6, p[1]); DROPI.scale.setScalar(0.3); DROPI.userData.update(t); }
  if (lt >= 29.1) { const z = U(lt, 29.1, 33.0); X.cam = camKeys(lt, [[29.1, cityw, 1300, 0.0, 0.6, 36], [33.0, mll(35.0, 32.0), 5200, 0.0, 0.75, 36], [39.0, mll(35.0, 32.0), 5400, 0.0, 0.75, 36]], 0.06); }
  else X.cam = camKeys(lt, [[25.4, cityw, 1150, 0.0, 0.6, 36], [29.0, mll(35.15, 32.1), 3300, 0.0, 0.62, 36], [29.1, cityw, 1300, 0.0, 0.6, 36]], 0.07);
  if (lt >= 29.1) {
    const gl = U(lt, 29.1, 31.0); THIN.setGlowAll && 0; BR.forEach(b => b.L.setGlow(gl * (0.6 + 0.4 * Math.sin(t * 4)))); CITYL.setGlow(gl); THIN.setGlow(gl); PIPE.setGlow(gl);
    GLM.root.visible = true; GLM.root.position.set(CITYP[0] + 10, TOP + 6, CITYP[1] + 5); GLM.root.scale.setScalar(1.9); GLM.setFill(0.3);
    ROUTE.setGlow(0.7);
    const gp = mwa(CITYP[0] + 10, TOP + 6 + 140 + 6 * Math.sin(t * 2), CITYP[1] + 5);
    C.T = act(po(gp, -1.5, 'wave', floatOpt), fc('cheering', 0.5, 1), 0.55);
    C.G = actS(P0('point'), fc('happy', 0.15, 0), 0.74, -0.56, 0.3, { yawOff: -0.6 });
  } else {
    C.G = actS(P0('hips'), fc('happy', 0.15, 0), -0.8, -0.56, 0.3);
  }
}
function fullMapOff() { }

/* ---------------------------------------------------------------- c5 : recap */
function s6(t, lt, V, X, C) {
  V.recap = true; const rg = (x, y, z) => [ST.recap[0] + x, ST.recap[1] + y, ST.recap[2] + (z || 0)];
  X.cam = { p: rg(lerp(-60, 60, lt / 21), 520, 2100), l: rg(lerp(-60, 60, lt / 21), 470, 0), fov: 34 };
  GLR.setFill(0.3);
  C.T = act(po(rg(-520, 190 + 8 * Math.sin(t * 1.5), 200), -1.0, 'down', floatOpt), fc('happy', 0.5, null, [0.6, 0.2]), 1.25);
  C.G = act(po(rg(950, 4, 220), -1.6, 'hips', { tilt: 1.5 * Math.sin(t) }), fc('happy', 0.15, null), 1.3);
  X.sky = [SKYP.gold, SKYP.gold, 0];
}

/* ---------------------------------------------------------------- common finish */
function finish(t, lt, si, V, X, C) {
  window.__lastC = C; if (WARM.on) return;
  MAPG.visible = V.map; BOWLG.visible = V.bowl; SLG.visible = V.slope; CNG.visible = V.canal; PLG.visible = V.pools; GPG.visible = V.gp; TPG.visible = V.tap || !!X.ins; RCG.visible = V.recap;
  hillsC.visible = V.canal; hillsP.visible = V.pools;
  if (V.map) LAND.update(t); if (V.slope) CS.update(t); PIPE.update(t); ROUTE.update(t);
  if (X.grains && V.pools) POOLS.setGrains(X.grains[0], X.grains[1], X.grains[2]);
  let horz;
  if (X.sky) horz = setSkyMix(X.sky[0], X.sky[1], X.sky[2]); else if (si === 0 && lt < 26.5) horz = setSkyMix(SKYP.dawn, SKYP.clear, ease(lt, 0, 12)); else horz = setSkyMix(SKYP.clear, SKYP.clear, 1);
  PAN.visible = si === 6;
  const c = window.__co || X.cam;
  cam.fov = c.fov; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l); cam.updateMatrixWorld(true); SKY.position.copy(cam.position);
  if (V.canal) { hillsC.position.set(cam.position.x, ST.canal[1] - 60, cam.position.z); }
  if (V.pools) { hillsP.position.set(cam.position.x, ST.pools[1] - 60, cam.position.z); }
  const Dc = Math.hypot(c.p[0] - c.l[0], c.p[1] - c.l[1], c.p[2] - c.l[2]), fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
  X.rel.forEach(([o, sx, sy, hfr, bh, k]) => { const dz = 320, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; place(o, sx * hw, sy * hh, -dz); o.scale.setScalar(Math.max(0.001, hfr * 2 * hh / bh * k)); });
  const ds = [[GD, C.G], [TP, C.T]];
  ds.forEach(([o, cc]) => { o.root.visible = cc.vis; if (!cc.vis) return;
    const base = o === GD ? 0.98 : 0.94, H0 = o.drop.height || 244; let po0 = cc.po, sc = cc.sc;
    if (cc.scr) { const dz = 320, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; sc = 0.86 * cc.hf * 2 * hh / (H0 * base); const p = new THREE.Vector3(cc.scr[0] * 0.95 * hw, (cc.scr[1] + (cc.hop || 0)) * hh, -dz).applyQuaternion(cam.quaternion).add(cam.position);
      po0 = Object.assign({}, cc.po, { x: p.x, y: p.y, z: p.z, yaw: Math.atan2(-(cam.position.z - p.z), cam.position.x - p.x) + (cc.yawOff || 0) }); }
    else if (cc.hf) { const p = new THREE.Vector3(cc.po.x, cc.po.y, cc.po.z).sub(cam.position); sc = cc.hf * 2 * p.dot(fwd) * Math.tan(cam.fov * Math.PI / 360) / (H0 * base); }
    o.root.scale.setScalar(sc * base); o.pose(po0); if (cc.scr) o.root.quaternion.copy(cam.quaternion).multiply(QY.setFromAxisAngle(YAX, -Math.PI / 2 + (cc.yawOff || 0))); if (cc.sz) o.root.scale.y *= cc.sz; o.face.set(cc.f); });
  BILL.forEach(b => { if (b.visible) b.quaternion.copy(cam.quaternion); });
  N250.quaternion.copy(cam.quaternion);
  if (X.ins) { /* the inset shows the tap stage: hide the main-view cast during the inset render below */ }
  const insCast = X.ins ? [C.G.ins ? GD : null, C.T.ins ? TP : null] : [];
  if (X.ins) { GD.root.visible = false; TP.root.visible = false; }
  renderer.render(scene, cam);
  window.__inset = !!X.ins;
  if (X.ins) {
    const bw_ = Math.round(W * 0.38), bh_ = Math.round(H * 0.56), bx = Math.round(W * 0.58), by = Math.round(H * 0.24);
    GD.root.visible = !!C.G.vis; TP.root.visible = !!C.T.vis; const sa = [MAPG.visible]; MAPG.visible = false;
    cam2.aspect = bw_ / bh_; cam2.fov = 34; cam2.updateProjectionMatrix(); const pp = orb(X.ins.tg, X.ins.D, 0.0, 0.05); cam2.position.set(...pp); cam2.lookAt(...X.ins.tg); cam2.updateMatrixWorld(true); SKY.position.copy(cam2.position);
    renderer.setScissorTest(true); renderer.setViewport(bx - 8, by - 8, bw_ + 16, bh_ + 16); renderer.setScissor(bx - 8, by - 8, bw_ + 16, bh_ + 16); renderer.setClearColor('#261c19', 1); renderer.clear();
    renderer.setViewport(bx, by, bw_, bh_); renderer.setScissor(bx, by, bw_, bh_); renderer.render(scene, cam2);
    renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H); renderer.setClearColor('#000000', 1); MAPG.visible = sa[0]; window.__cam2 = cam2;
  }
}

/* ---------------------------------------------------------------- face warm-up + contract */
async function warm() {
  const seen = new Set(), jobs = [];
  WARM.on = true; for (let k = 0; k <= DUR * 30; k++) { frame(k / 30); for (const [o, c] of [[GD, window.__lastC.G], [TP, window.__lastC.T]]) { if (!c.vis) continue; const key = o.root.uuid + JSON.stringify(c.f); if (!seen.has(key)) { seen.add(key); jobs.push([o, c.f]); } } }
  WARM.on = false; for (const [o, f] of jobs) await o.face.set(f);
  return jobs.length;
}
const _hb = new THREE.Box3(), _hv = new THREE.Vector3();
window.__heroBox = t => { const ids = [TP, GD].filter(o => o.root.visible); if (!ids.length) return null; _hb.makeEmpty(); ids.forEach(o => { o.root.updateMatrixWorld(true); _hb.expandByObject(o.drop.inner); });
  const mn = [1e9, 1e9], mx = [-1e9, -1e9]; let behind = true; for (const x of [_hb.min.x, _hb.max.x]) for (const y of [_hb.min.y, _hb.max.y]) for (const z of [_hb.min.z, _hb.max.z]) { _hv.set(x, y, z).project(window.__inset ? cam2 : cam); if (_hv.z < 1) behind = false; mn[0] = Math.min(mn[0], _hv.x); mn[1] = Math.min(mn[1], _hv.y); mx[0] = Math.max(mx[0], _hv.x); mx[1] = Math.max(mx[1], _hv.y); }
  return { visible: !behind && mx[0] > -1 && mn[0] < 1 && mx[1] > -1 && mn[1] < 1, behindCamera: behind, heightFrac: (mx[1] - mn[1]) / 2, bottomFrac: (1 - (mn[1] + 1) / 2), box: [mn, mx] }; };
window.__sceneHash = () => { let h = 0; scene.traverse(o => { if (o.visible !== false) { const e = o.matrixWorld.elements; h = (h * 31 + Math.round(e[12] * 10) + Math.round(e[13] * 10) * 7 + Math.round(e[14] * 10) * 13 + Math.round(e[0] * 100) * 3) | 0; } }); return h + '|' + cam.position.x.toFixed(2) + ',' + cam.position.y.toFixed(2) + ',' + cam.position.z.toFixed(2); };
window.__dur = DUR; window.__HQ = HQ; window.__errors = []; window.__T0 = window.__T0 != null ? window.__T0 : 0;
window.__shots = IDS.map((id, i) => ({ id, index: i, start: O[i], end: O[i + 1], dur: +(O[i + 1] - O[i]).toFixed(2) }));
window.__caption = t => { const si = shotOf(t); const i = CUES[si].findIndex(c => t >= c[0] && t < c[1]); return i < 0 ? null : IDS[si] + '_c' + (i + 1); };
window.__o = { cam, scene, GD, TP };
const _frame = frame;
window.__lastC = { G: NONE(), T: NONE() };
window.__seek = t => { try { _frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
(async () => {
  try { await loadYears(); window.__nwarm = Q.has('nowarm') ? 0 : await warm(); if (!Q.has('nopre')) for (let i = 0; i < 7; i++) { _frame(O[i] + 0.5); } _frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
