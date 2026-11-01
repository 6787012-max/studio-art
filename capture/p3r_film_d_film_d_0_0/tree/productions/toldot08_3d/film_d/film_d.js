/* film_d - "the water-level ruler of the Kinneret" - the whole film (7 shots, 284.8 s). Deterministic: every frame is a pure function of t.
   Every shot EXPLAINS with a moving diagram: the cut-away lake tank with the SAME full gauge pole (level / red lines / record mark), the top view of the lake
   (sheet -> classroom boxes), a calendar, sun + vapour, glasses with salt, a desalination mechanism, a coast map with plants and lines.
   The drops (guide = makeTipa big, student = makeTipa tipa, salty variant 'sea') are talking objects that point and react. No people. ASCII only.
   Contract: window.__ready, window.__seek(t) (adds window.__T0||0), window.__dur = 284.8, window.__caption(t), window.__heroBox, window.__sceneHash. */
import { THREE, sm, cl, frac } from '../../../lib/toon3d/toon3d.js';
import * as K from '../../toldot08_kit/kit08.js';

const DUR = 284.8;
const O = [0, 46.8, 92.8, 127.8, 175.4, 221.3, 264.3, 284.8];
const IDS = ['d1_what_is_level', 'd1b_every_centimetre', 'd2_upper_line', 'd3_lower_line', 'd4_low_2001', 'd4b_water_from_the_sea', 'd5_recap'];
const CUES = [
  [[5.3, 11.2], [11.8, 19.7], [20.3, 26.9], [27.5, 34.0], [34.6, 44.6]],
  [[47.7, 54.3], [54.9, 63.5], [64.1, 72.7], [73.3, 80.5], [81.1, 89.0]],
  [[93.6, 100.2], [100.8, 108.0], [108.6, 118.6], [119.2, 125.7]],
  [[128.6, 138.6], [139.2, 147.8], [148.4, 155.6], [156.2, 164.8], [165.4, 173.3]],
  [[176.2, 182.1], [182.7, 190.6], [191.2, 197.1], [197.7, 203.6], [204.2, 212.1], [212.7, 219.2]],
  [[222.2, 229.4], [230.0, 238.6], [239.2, 244.7], [245.3, 251.2], [251.8, 263.8]],
  []];
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.getElementById('wrap').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 5, 60000); scene.add(cam);
const cam2 = new THREE.PerspectiveCamera(34, 1.2, 5, 60000); scene.add(cam2);
const lerp = (a, b, u) => a + (b - a) * u;
const ease = (t, a, b) => sm(cl((t - a) / (b - a), 0, 1));
const U = ease;
const blinkAt = (t, o) => frac(t / 3.3 + (o || 0)) < 0.045;
const talkT = (t, a, b, sd) => (t > a && t < b && frac(t * 0.8 + (sd || 0)) < 0.7) ? 'AEOX'[Math.floor(t * 8 + (sd || 0) * 5) % 4] : undefined;
const kf = (A, t) => { if (t <= A[0][0]) return A[0][1]; for (let i = 1; i < A.length; i++) if (t <= A[i][0]) return lerp(A[i - 1][1], A[i][1], sm((t - A[i - 1][0]) / (A[i][0] - A[i - 1][0]))); return A[A.length - 1][1]; };
const shotOf = t => { for (let i = 0; i < 7; i++) if (t < O[i + 1]) return i; return 6; };

/* ---------------------------------------------------------------- water levels (m): tank pole, per shot, local time */
const LV = [
  [[0, 209.3], [27.5, 209.3], [32.8, 208.55], [35.2, 208.55], [40.4, 209.85], [41.6, 209.85], [44.6, 209.2], [46.8, 209.2]],
  [[0, 209.2], [34.3, 209.2], [35.6, 209.2], [36.4, 209.15], [37.2, 209.15], [38.0, 209.1], [38.8, 209.1], [39.6, 209.06], [40.4, 209.06], [41.2, 209.02], [46, 209.02]],
  null,
  [[0, 208.83], [1.0, 208.9], [10.8, 212.2], [11.4, 212.3], [20.0, 212.85], [20.6, 212.9], [24.0, 213.5], [28.4, 213.5], [37, 213.55], [45.5, 213.6], [47.6, 213.6]],
  [[0, 212.6], [6.0, 212.6], [8.0, 212.7], [13, 214.4], [15.2, 214.6], [16.4, 214.87], [28, 214.87], [30, 214.93], [36, 215.02], [43.8, 214.96], [45.9, 214.96]],
  [[0, 214.87], [30.5, 214.87], [42.5, 214.42], [43, 214.42]],
  [[0, 212.7], [20.5, 212.5]]];
const lvT = t => { const i = shotOf(t); return LV[i] ? kf(LV[i], t - O[i]) : 209.0; };

/* ---------------------------------------------------------------- sky + real lake + dioramas */
const SKYP = { rain: ['#6f8296', '#97a8b6', '#c3ccd3'], clear: ['#5fb3e6', '#9fd4f2', '#e2f3fb'], night: ['#0d2250', '#17386e', '#2c5a92'], dawn: ['#6fa8e0', '#f2c98a', '#ffe9c4'] };
const SKY = K.makeSky({ palette: 'winter' }); scene.add(SKY);
const _c = {}; const colr = h => _c[h] || (_c[h] = new THREE.Color(h));
function setSkyMix(A, B, k) { const u = SKY.material.uniforms; u.uTop.value.copy(colr(A[0])).lerp(colr(B[0]), k); u.uMid.value.copy(colr(A[1])).lerp(colr(B[1]), k); u.uHorz.value.copy(colr(A[2])).lerp(colr(B[2]), k); return '#' + u.uHorz.value.getHexString(); }
const REAL = new THREE.Group(); scene.add(REAL);
const LAKE = K.makeKinneretLake({ level: 209.3 }); REAL.add(LAKE.root);
const hills = K.makeHills({ a0: 0, a1: Math.PI * 2, dists: [6200, 8600, 11500], base: '#86b35e', haze: '#cfe0e6', h: 750, n: 14 }); hills.position.y = -60; scene.add(hills);
const mkClouds = (col, tint) => { const g = new THREE.Group(); [[-2600, 1500, -6800, 3.4], [2400, 1700, -7600, 3.8], [200, 1900, -8600, 4.2], [-4200, 1400, 1800, 3.2], [4600, 1600, 2600, 3.4], [-900, 1700, 7600, 3.6]].forEach(([x, y, z, s], i) => { const c = K.makeCloud(i + 31, { s, col, tint }); c.position.set(x, y, z); g.add(c); }); scene.add(g); return g; };
const cloudsRain = mkClouds('#b3bcc8', '#8a96aa'), cloudsClear = mkClouds('#ffffff', '#dfe6f2');
const rain = K.makeRain({ n: 1300, w: 3800, d: 3600, h: 1500, col: '#dbe8f2', r: 2.0 }); scene.add(rain);
const rain2 = K.makeRain({ n: 360, w: 2600, d: 700, h: 1200, col: '#dbe8f2', r: 2.2, seed: 11 }); scene.add(rain2);
const birds = K.makeBirds({ n: 5, r: 500, y: 620, seed: 4 }); birds.position.set(-150, 0, 150); scene.add(birds);
const fgs = { grass: K.makeFgBlur('grass', { w: 300, h: 190, col: '#5e8f3c', blur: 7 }), leaves: K.makeFgBlur('leaves', { w: 340, h: 200, col: '#4f7f3a', blur: 8 }), rock: K.makeFgBlur('rock', { w: 300, h: 200, col: '#7a7468', blur: 8 }) };
Object.values(fgs).forEach(f => { f.visible = false; scene.add(f); });
const PX = 0, PZ = 180, PYAW = -0.35;
const POLE = K.makeGaugePole(); POLE.root.position.set(PX, 0, PZ); POLE.root.rotation.y = PYAW; REAL.add(POLE.root);
const PIER = K.makePier({ len: 700, w: 130, deckY: 100 }); PIER.position.set(-740, 0, 250); REAL.add(PIER);
const GATE = K.makeDamGate(); GATE.root.position.set(100, 0, 1080); REAL.add(GATE.root);
[[-700, 120], [-720, 340], [-690, 430]].forEach(([x, z], i) => LAKE.put(K.makeReeds(40 + i, { n: 10, h: 170 }), x, z, -4, i));
[[-690, 150], [-660, 380], [-720, 470]].forEach(([x, z], i) => LAKE.put(K.makeStone(70 + i, 0.8 + 0.2 * i), x, z, -6, i * 1.7));
for (let i = 0; i < 12; i++) LAKE.put(K.makeGrassTuft(90 + i, { h: 50 + (i % 4) * 8, dry: i % 4 === 0 }), -830 + (i % 6) * 55, 80 + Math.floor(i / 6) * 330, -3, 0);
const LAMP2 = new THREE.Group(); { const gy = LAKE.heightAt(-760, 185); LAMP2.position.set(-760, gy, 185); REAL.add(LAMP2);
  K.box(LAMP2, 18, 150, 18, K.M('#6e4a2c', '#9a7a66'), [0, 75, 0], 2, null, 3); K.box(LAMP2, 40, 40, 40, K.M('#444a58', '#808898'), [0, 170, 0], 2, null, 6);
  const m = new THREE.MeshBasicMaterial({ color: '#5a1e1e' }); const bulb = new THREE.Mesh(new THREE.SphereGeometry(21, 16, 12), m); bulb.position.set(0, 170, 0); LAMP2.add(bulb); LAMP2.userData.m = m;
  const halo = new THREE.Mesh(new THREE.CircleGeometry(80, 24), new THREE.MeshBasicMaterial({ color: '#ff4a2a', transparent: true, opacity: 0, depthWrite: false })); halo.position.set(0, 170, 30); halo.renderOrder = 7; LAMP2.add(halo); LAMP2.userData.h = halo; }
const QR = K.numPlane('?', 260, 330, { fg: '#d6232a', k: 0.95 }); QR.visible = false; scene.add(QR);   // red question mark on the real lake

/* stages in the sky (each a diagram table) */
const ST = { dio: [-700, 3600, -500], tank: [5200, 3600, -500], top: [-5200, 3600, -500], room: [-9500, 3600, -500], coast: [-13500, 3600, -500], desal: [-18500, 3600, -500], glass: [-22000, 3600, -500] };
const TSC = 0.62;
const TW = (x, y, z) => [ST.tank[0] + TSC * x, ST.tank[1] + TSC * y, ST.tank[2] + TSC * z];
const at = (s, x, y, z) => [ST[s][0] + x, ST[s][1] + y, ST[s][2] + z];
const WARM = { on: false };
const OX = ST.dio[0], OY = ST.dio[1], OZ = ST.dio[2], SC = 0.62;
const DW = (x, y, z) => [OX + SC * x, OY + SC * y, OZ + SC * z];
const DIO = K.makeLakeSection(); DIO.root.position.set(OX, OY, OZ); DIO.root.scale.setScalar(SC); scene.add(DIO.root);
const birdsD = K.makeBirds({ n: 4, r: 420, y: 420, seed: 9 }); birdsD.position.set(OX + SC * 900, OY + 80, OZ + SC * 250); scene.add(birdsD);

/* tank stage (the hero gauge pole lives here for the whole film) */
const TG = new THREE.Group(); TG.position.set(...ST.tank); TG.scale.setScalar(TSC); scene.add(TG);
const TANK = K.makeLevelTank({ level: 209.3 }); TG.add(TANK.root);
const CAL = K.makeCalendar({ n: 8, texts: ['1', '2', '3', '4', '5', '6', '7', '8'] }); CAL.root.position.set(-1180, 140, 250); CAL.root.scale.setScalar(0.9); TG.add(CAL.root);
const CARDW = K.makeSeasonCard('winter'), CARDS = K.makeSeasonCard('summer'); CARDW.position.set(-560, 480, 200); CARDS.position.set(-560, 480, 200); TG.add(CARDW, CARDS);
const SUN = K.makeSun({ r: 130 }); TG.add(SUN);
const VAP = K.makeVapour({ n: 34, w: 1100, h: 800 }); TG.add(VAP);
const TH = K.makeThermo(); TG.add(TH);
const SALT = K.makeSaltCube(); TG.add(SALT);
const PUMP = K.makePumpIcon(); PUMP.scale.setScalar(0.8); TG.add(PUMP);
const SHELF = K.box(TG, 520, 26, 260, K.M('#b98a58', '#c8a88e'), [0, 0, 0], 2.4, null, 3);
const SIGN = K.makeWarnSign(); SIGN.scale.setScalar(0.8); TG.add(SIGN);
const ARRU = K.makeFlowArrow({ len: 240, w: 56, col: '#ffd42a' }), ARRD = K.makeFlowArrow({ len: 240, w: 56, col: '#2f9be0' }); ARRU.rotation.z = Math.PI / 2; ARRD.rotation.z = -Math.PI / 2; TG.add(ARRU, ARRD);
const N208 = K.numPlane('208', 190, 80, { bg: '#fff3a0', bd: '#1d2a44', k: 0.7 }), N215 = K.numPlane('215', 190, 80, { bg: '#fff3a0', bd: '#1d2a44', k: 0.7 }); TG.add(N208, N215);
const QT = K.numPlane('?', 260, 330, { fg: '#d6232a', k: 0.95 }); TG.add(QT);
const FISH = [0, 1, 2].map(i => { const f = K.makeFish(); f.root.scale.setScalar(0.5); TG.add(f.root); return f; });
const PAN = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: '#08183a', transparent: true, opacity: 0.0, depthWrite: false, depthTest: false }));   // recap darkening
{ const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'), g = c.createRadialGradient(128, 128, 20, 128, 128, 128); g.addColorStop(0, 'rgba(6,16,44,0.62)'); g.addColorStop(0.55, 'rgba(6,16,44,0.42)'); g.addColorStop(1, 'rgba(6,16,44,0.12)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  PAN.material.map = new THREE.CanvasTexture(cv); PAN.material.opacity = 1; PAN.geometry = new THREE.PlaneGeometry(2, 2); PAN.renderOrder = 20; PAN.frustumCulled = false; }
cam.add(PAN); PAN.position.set(0, 0, -50); PAN.scale.setScalar(50 * Math.tan(18 * Math.PI / 180) * 1.1); PAN.scale.x *= 16 / 9; PAN.visible = false;

/* top stage: lake map, sheet, classroom rows, counter; room stage: one big classroom */
const TOP = K.makeLakeTop(); TOP.root.position.set(...ST.top); scene.add(TOP.root);
const ROWS = K.makeClassRows({ cols: 6, rows: 4 }); ROWS.root.position.set(ST.top[0] + 1900, ST.top[1] + 2, ST.top[2] - 100); ROWS.root.scale.setScalar(1.8); scene.add(ROWS.root);
const GN = 100, GSP = 64, GRIDG = new THREE.Group(); GRIDG.position.set(ST.top[0] + 4200, ST.top[1] + 3, ST.top[2]); scene.add(GRIDG);
const GB = new THREE.InstancedMesh(new THREE.BoxGeometry(55, 20, 50), new THREE.MeshBasicMaterial({ color: '#efe3c2' }), GN * GN), GT = new THREE.InstancedMesh(new THREE.PlaneGeometry(47, 42).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#2fa6dc' }), GN * GN);
GB.frustumCulled = GT.frustumCulled = false; GRIDG.add(GB, GT);
{ const lst = []; for (let i = 0; i < GN; i++) for (let j = 0; j < GN; j++) lst.push([i, j, Math.max(Math.abs(i - 49.5), Math.abs(j - 49.5)), Math.atan2(j - 49.5, i - 49.5)]); lst.sort((p, q) => p[2] - q[2] || p[3] - q[3]);
  const m4 = new THREE.Matrix4(); lst.forEach((p, k) => { m4.makeTranslation((p[0] - 49.5) * GSP, 10, (p[1] - 49.5) * GSP); GB.setMatrixAt(k, m4); m4.makeTranslation((p[0] - 49.5) * GSP, 20.5, (p[1] - 49.5) * GSP); GT.setMatrixAt(k, m4); }); GB.count = GT.count = 0; }
const fmtN = n => n >= 1000 ? Math.floor(n / 1000) + ',' + String(n % 1000).padStart(3, '0') : String(n);
const CNT = K.numPlane('0', 300, 140, { bg: '#fff3a0', bd: '#1d2a44', k: 0.8 }); CNT.position.set(ST.top[0] + 4200, ST.top[1] + 1300, ST.top[2] - 2300); CNT.scale.setScalar(11); scene.add(CNT);
const QTOP = K.numPlane('?', 260, 330, { fg: '#d6232a', k: 0.95 }); scene.add(QTOP);
const ROOMG = new THREE.Group(); ROOMG.position.set(...ST.room); scene.add(ROOMG);
const BIG = K.makeClassroom({ w: 560, h: 340, d: 420 }); ROOMG.add(BIG.root); K.box(ROOMG, 2600, 30, 1600, K.M('#c9b98a', '#a89868'), [0, -22, 0], 2.4, null, 4);
const TAGF = new THREE.Group(); ROOMG.add(TAGF); TAGF.position.set(0, 470, 200); { const d = new THREE.Mesh(new THREE.CircleGeometry(70, 28), new THREE.MeshBasicMaterial({ color: '#35b35a' })); TAGF.add(d);
  const mk = (x, y, w, h, r) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: '#ffffff' })); b.position.set(x, y, 2); b.rotation.z = r; TAGF.add(b); }; mk(-18, -12, 22, 56, 0.78); mk(14, 0, 22, 96, -0.78); }

/* coast stage + desal stage + glass stage */
const COAST = K.makeCoastMap(); COAST.root.position.set(...ST.coast); scene.add(COAST.root);
const Y05 = K.numPlane('', 330, 190, { bg: '#fff3a0', bd: '#1d2a44', k: 0.75 }); scene.add(Y05);
const YC4 = new THREE.Mesh(new THREE.PlaneGeometry(280, 190), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })); YC4.position.set(0, -20, 6); YC4.renderOrder = 10; YC4.visible = false; CAL.cards[2].np.parent.add(YC4);
/* Hebrew year (big, rtl) with the Gregorian year small and grey underneath; the strings are loaded at runtime from _caps_toldot08/years.json */
function yearTex(y, w, h, bg) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = '#1d2a44'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); }
  c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
  let big = Math.round(h * 0.46); c.font = 'bold ' + big + 'px Heebo, Arial, sans-serif'; while (c.measureText(y.he).width > w * 0.86 && big > 20) { big -= 4; c.font = 'bold ' + big + 'px Heebo, Arial, sans-serif'; }
  c.fillStyle = '#1d2a44'; c.fillText(y.he, w / 2, h * 0.40);
  const sm_ = Math.round(big * 0.6); c.font = 'bold ' + sm_ + 'px Heebo, Arial, sans-serif'; c.direction = 'ltr'; c.fillStyle = '#7a8088'; c.fillText(String(y.greg), w / 2, h * 0.40 + big * 0.62 + sm_ * 0.45);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; return t;
}
async function loadYears() {
  const j = await (await fetch('../../_caps_toldot08/years.json')).json();
  YC4.material.map = yearTex(j.d4_year, 512, 347, null); YC4.material.needsUpdate = true;
  Y05.material.map = yearTex(j.d4b_year, 512, 295, '#fff3a0'); Y05.material.needsUpdate = true;
}
const QCOAST = K.numPlane('?', 260, 330, { fg: '#d6232a', k: 0.95 }); scene.add(QCOAST);
const DES = K.makeDesalPlant(); const DS = 1.7; DES.root.scale.setScalar(DS); DES.root.position.set(...ST.desal); scene.add(DES.root);
const GL = K.makeSaltGlasses(); GL.root.position.set(...ST.glass); GL.root.scale.setScalar(1.5); scene.add(GL.root);
const TABLE = K.box(scene, 1800, 40, 900, K.M('#b98a58', '#c8a88e'), [ST.glass[0], ST.glass[1] - 20, ST.glass[2] + 20], 2.6, null, 4);

/* ---------------------------------------------------------------- the cast */
function makeDrop(kind, sc) {
  const d = K.makeTipa({ kind }); d.root.scale.setScalar(sc);
  return { drop: d, root: d.root, pose: po => { d.pose(Object.assign({}, po)); if (po.raw) po.raw.forEach((r, i) => { if (r) d.arms[i].rotation.set(-d.arms[i].userData.sz * (r.out || 0), -d.arms[i].userData.sz * (r.ry || 0), r.fw || 0); }); }, face: d.face };
}
const GD = makeDrop('big', 0.98), TP = makeDrop('tipa', 0.94), TS = makeDrop('sea', 0.94);
scene.add(GD.root); scene.add(TP.root); scene.add(TS.root);
const NONE = () => ({ vis: false, po: { t: 0 }, f: { expr: 'neutral' }, sc: 1 });
const act = (po, f, sc) => ({ vis: true, po, f, sc: sc || 1 });
const groundY = (x, z) => LAKE.heightAt(x, z);

/* ---------------------------------------------------------------- shot d2 (the approved test shot, ported) */
const LVD2 = [[0, 209.50], [0.8, 209.47], [7.4, 209.20], [15.2, 209.02], [25.0, 208.885], [27.0, 208.862], [29.5, 208.84], [32.0, 208.832], [35, 208.832]];
const pl2 = t => { if (t <= LVD2[0][0]) return LVD2[0][1]; for (let i = 1; i < LVD2.length; i++) if (t <= LVD2[i][0]) return lerp(LVD2[i - 1][1], LVD2[i][1], (t - LVD2[i - 1][0]) / (LVD2[i][0] - LVD2[i - 1][0])); return LVD2[LVD2.length - 1][1]; };
const levelD2 = t => { let s = 0; for (let k = -8; k <= 8; k++) s += pl2(t + k * 0.1); return s / 17; };
const REAL_A2 = t => t < 2.4, REAL_B2 = t => t >= 15.6 && t < 20.4;

/* ---------------------------------------------------------------- cameras */
const orb = (tg, D, az, el) => [tg[0] - Math.sin(az) * Math.cos(el) * D, tg[1] + Math.sin(el) * D, tg[2] + Math.cos(az) * Math.cos(el) * D];
const cam2k = (A, B, u) => { const tg = [0, 1, 2].map(i => lerp(A[0][i], B[0][i], u)), D = lerp(A[1], B[1], u), az = lerp(A[2], B[2], u), el = lerp(A[3], B[3], u); return { p: orb(tg, D, az, el), l: tg, fov: lerp(A[4], B[4], u) }; };
const tk = (x, y, z, D, az, el, fov) => [TW(x, y, z), D, az || 0, el == null ? 0.04 : el, fov || 36];
const tmp = new THREE.Vector3();
const place = (o, dx, dy, dz) => { o.position.copy(cam.position).add(tmp.set(dx, dy, dz).applyQuaternion(cam.quaternion)); o.quaternion.copy(cam.quaternion); };

/* ---------------------------------------------------------------- per-frame state */
let CT = 0;
const po = (w, yaw, arms, o) => Object.assign({ t: CT, x: w[0], y: w[1], z: w[2], yaw, arms }, o || {});
const fc = (expr, o, tk0, tk1, sd) => Object.assign({ expr, blink: blinkAt(CT, o || 0.15), look: [0, 0] }, tk0 != null ? { talk: talkT(CT, tk0, tk1, sd) } : {});
const floatOpt = { float: 1, feet: false, shadow: false };
const FACE_G = -1.45;   // guide faces the camera, a little to the left

function frame(tl) {
  const t = Math.max(0, Math.min(DUR, tl)); CT = t;
  const si = shotOf(t), lt = t - O[si]; const L = lvT(t); const Yloc = K.yOfLevel(L);
  const V = { real: false, dio: false, tank: false, top: false, room: false, coast: false, desal: false, glass: false };
  const X = { cam: null, fg: null, inset: null };
  const C = { G: NONE(), T: NONE(), S: NONE() };
  let sky = 1, night = 0;
  /* reset every tank extra */
  [CAL.root, CARDW, CARDS, SUN, VAP, TH, SALT, PUMP, SHELF, SIGN, ARRU, ARRD, N208, N215, QT, QR, QTOP, QCOAST, Y05, CNT, TAGF, YC4].forEach(o => { o.visible = false; });
  FISH.forEach(f => { f.root.visible = false; });
  rain.visible = false; rain2.visible = false; PAN.visible = false; GB.count = GT.count = 0;
  TANK.setRed(0, 0); TANK.setRed(1, 0); TANK.setRecord(0); TANK.setReading(false); TANK.setSprings(0); TANK.setSalt(0); TANK.pole.root.position.y = 0;
  TG.position.set(...ST.tank); TG.scale.setScalar(TSC);
  const tw = (x, dy, z) => [TW(x, 0, z)[0], TW(0, Yloc, 0)[1] + TSC * dy, TW(x, 0, z)[2]];   // a point on the tank water surface (+dy local)

  if (si === 0) {
    if (lt < 11.2) {
      V.real = true; X.cam = lt < 5.3 ? { p: [lerp(-900, -760, lt / 5.3), lerp(820, 700, lt / 5.3), lerp(2500, 2250, lt / 5.3)], l: [-120, 40, 100], fov: 46 } : cam2k([[-40, 215, 195], 1750, 0.35, 0.22, 30], [[-440, 230, 290], 1650, -0.2, 0.24, 28], U(lt, 5.3, 11.2));
      LAKE.setLevel(L); LAKE.update(t); const x = 95, z = 255, Yw = K.yOfLevel(L);
      C.G = act(po([-150, 100, 255], -1.35 + 0.04 * Math.sin(t * 0.7), 'down', { tilt: 1.5 * Math.sin(t * 1.3), raw: lt >= 5.3 ? [{ out: 0.25 }, { out: 1.2 + 0.05 * Math.sin(t * 3), fw: 0.15 }] : null }), fc('happy', 0.15, 3.5, 5.0, 0.2));
      C.G.f.look = [0.3, 0];
      C.T = act(po([x, Yw + LAKE.float(x, z, 60).y - LAKE.water.position.y, z], lt < 5.3 ? -1.9 : -1.7, 'down', floatOpt), Object.assign(fc(lt < 5.3 ? 'happy' : 'curious', 0.5), { look: lt < 8 ? [0.2, 0.2] : [-0.5, 0.2] }));
      QR.visible = lt > 5.6 && lt < 8.9; QR.position.set(300, 330 + 10 * Math.sin(t * 2), 330); QR.scale.setScalar(ease(lt, 5.6, 6.2) * 0.9 + 0.001);
    } else {
      V.tank = true; const Yw = TW(0, Yloc, 0)[1];
      if (lt < 19.7) {
        const lift = lerp(1500, 0, U(lt, 12.0, 15.6)); TANK.pole.root.position.y = lift; TANK.pole.update(t);
        X.cam = cam2k([TW(0, 700, 140), 1500, 0.1, 0.05, 36], [TW(60, Yloc + 130, 140), 800, 0.08, 0.05, 36], U(lt, 11.2, 16.2)); X.fg = 'leaves';
        C.G = act(po(tw(560, 0, 170), -1.9, 'down', Object.assign({ raw: [{ out: 1.2 + 0.08 * Math.sin(t * 2), fw: 0.1 }, { out: 0.25 }] }, floatOpt)), fc('happy', 0.15, 12.2, 19.0, 0.3));
        C.T = act(po(tw(-380, 0, 170), -1.3, 'point', floatOpt), Object.assign(fc('curious', 0.5, 16.4, 19.2, 0.7), { look: [0.5, 0.2] }));
      } else if (lt < 26.9) {
        X.cam = cam2k([TW(-120, Yloc + 40, 160), 600, 0.22, 0.05, 36], [TW(-120, Yloc + 40, 160), 480, 0.3, 0.05, 36], U(lt, 19.7, 26.9)); X.fg = 'grass';
        C.T = act(po([TW(-215, 0, 175)[0], Yw + TSC * 20, TW(0, 0, 175)[2]], -1.5, 'down', { shadow: false }), Object.assign(fc('happy', 0.5, 21.0, 25.0, 0.7), { look: [-0.2, 0.3] }));
        C.G = act(po(tw(-640, 0, 215), -1.2, 'down', Object.assign({ tilt: 5 }, floatOpt)), fc('happy', 0.15, 20.4, 26.0, 0.3));
      } else if (lt < 34.6) {
        CARDW.visible = true; rain2.visible = true; rain2.position.set(...TW(-300, 500, 250)); rain2.userData.update(t);
        X.cam = cam2k([TW(0, 120, 120), 900, 0.0, 0.04, 36], [TW(0, Yloc + 140, 120), 800, 0.0, 0.04, 36], U(lt, 26.9, 34.6)); X.fg = 'leaves';
        C.T = act(po(tw(-170, 0, 170), -1.5, 'up', floatOpt), Object.assign(fc('cheering', 0.5, 28.0, 33.5, 0.8), { look: [0.2, 0.3] }));
        C.G = act(po(tw(560, 0, 170), -1.9, 'down', Object.assign({ raw: [{ out: 1.15 }, { out: 0.3 }] }, floatOpt)), fc('happy', 0.15, 27.6, 33.5, 0.3));
      } else {
        CARDS.visible = true; CARDS.userData.sun && 0; X.cam = cam2k([TW(-50, 120, 120), 900, 0.0, 0.04, 36], [TW(80, 100, 120), 800, 0.0, 0.04, 36], U(lt, 34.6, 44.6)); X.fg = 'grass';
        const arr = lt >= 40.2; ARRU.visible = ARRD.visible = N208.visible = N215.visible = arr; ARRU.position.set(420, 60, 150); ARRD.position.set(660, 380, 150); N208.position.set(420, 380, 150); N215.position.set(660, 90, 150);
        TANK.setReading(lt >= 40.2);
        const hopL = lt >= 41 ? 150 * Math.abs(Math.sin(lt * 2.3)) : 0, hx = lt >= 41 ? lerp(420, 660, sm(0.5 + 0.5 * Math.sin(lt * 1.15))) : -170;
        C.T = act(po(tw(hx, hopL, 170), -1.5, lt < 40.2 ? 'down' : 'up', lt < 41 ? floatOpt : { shadow: false }), Object.assign(fc(lt < 40.2 ? 'tired' : 'cheering', 0.5, 41, 44, 0.8), { look: [0.1, 0.2] }));
        C.G = act(po(tw(lt < 40.2 ? 560 : -60, 0, 170), -1.9, 'down', Object.assign({ raw: lt < 40.2 ? [{ out: 1.9 + 0.1 * Math.sin(t * 5), fw: 0.9 }, { out: 0.2 }] : [{ out: 1.1 }, { out: 0.3 }] }, floatOpt)), fc('happy', 0.15, 36, 44, 0.3));
      }
    }
  } else if (si === 1) {
    if (lt < 7.5 || lt >= 34.3) {
      V.tank = true; const Yw = TW(0, Yloc, 0)[1];
      if (lt < 7.5) {
        const u = U(lt, 0.8, 5.6), D = Math.exp(lerp(Math.log(1250), Math.log(105), u)); X.cam = { p: orb(TW(lerp(0, -80, u), lerp(Yloc + 120, K.yOfLevel(209.2) + 55, u), 150), D, 0.02, 0.0), l: TW(lerp(0, -80, u), lerp(Yloc + 120, K.yOfLevel(209.2) + 55, u), 150), fov: 36 };
        QT.visible = lt > 2.6; QT.position.set(-205, K.yOfLevel(209.2) + 6, 170); QT.scale.setScalar(0.11 * ease(lt, 2.6, 3.4) + 0.001); QT.quaternion.copy(cam.quaternion);
        C.G = act(po(tw(560, 0, 170), -1.9, 'down', Object.assign({ raw: [{ out: 1.2, fw: 0.1 }, { out: 0.25 }] }, floatOpt)), fc('happy', 0.15)); C.G.vis = lt < 4;
        C.T = act(po(tw(-380, 0, 170), -1.5, 'down', floatOpt), Object.assign(fc('curious', 0.5), { look: [0.3, 0.3] })); C.T.camRel = lt >= 3.4 ? 1 : 0; C.T.vis = true;
        if (lt < 3.4) C.T.po = po(tw(-380, 0, 170), -1.5, 'down', floatOpt);
      } else {
        CAL.root.position.set(-1180, 140, 250); CAL.root.visible = true; CAL.setTexts(['1', '2', '3', '4', '5', '6', '7', '8']); const k = kf([[34.3, 0], [35.0, 0], [36.2, 1], [37.0, 1], [38.0, 2], [38.8, 2], [39.6, 3], [40.4, 3], [41.2, 4], [46, 4]], lt); CAL.flip(k);
        X.cam = cam2k([TW(-250, 160, 160), 1600, 0.0, 0.04, 36], [TW(-120, 60, 160), 1400, 0.0, 0.04, 36], U(lt, 34.3, 42)); X.fg = 'grass';
        C.T = act(po([TW(-205, 0, 190)[0], Yw + TSC * 24, TW(0, 0, 190)[2]], -1.5, 'down', { shadow: false }), Object.assign(fc('happy', 0.5), { look: [-0.3, 0.2] }));
        C.G = act(po(tw(560, 0, 170), -1.9, 'point', floatOpt), fc('happy', 0.15, 35, 41, 0.3));
      }
    } else if (lt < 26.5) {
      V.top = true; const sh = U(lt, 8.8, 14.8);
      TOP.setShrink(1); TOP.setSheet(lt < 17.8 ? sh : 1.0); TOP.setGold(1); TOP.update(t); CNT.visible = false; ROWS.setAppear(0); ROWS.setFill(0);
      const lift = U(lt, 17.8, 19.6), fly = U(lt, 19.6, 22.2);
      TOP.sheet.visible = lt < 22.4 && lt >= 8.8; if (lt >= 17.8) { TOP.sheet.position.set(lerp(0, 4200, fly), 8 + 380 * Math.sin(Math.PI * Math.min(1, lift * 0.5 + fly * 0.5)) + 40 * lift, lerp(0, -100, fly)); TOP.sheet.scale.set(lerp(1, 0.4, fly), 1, lerp(1, 0.22, fly)); } else { TOP.sheet.position.set(0, 8, 0); TOP.sheet.scale.set(1, 1, 1); }
      const gn = Math.round(10000 * Math.pow(U(lt, 21.0, 25.6), 1.7)); GB.count = GT.count = gn;
      if (lt >= 21.4) { CNT.visible = true; CNT.userData.setText(fmtN(gn)); }
      if (lt < 17.3) X.cam = cam2k([at('top', 0, 0, -140), 4700, 0, 1.22, 34], [at('top', 0, 0, -60), 4500, 0, 1.2, 34], U(lt, 7.5, 17.3));
      else X.cam = cam2k([at('top', 0, 0, 0), 3300, 0, 1.2, 34], [at('top', 3800, 0, 100), 11800, 0, 1.12, 34], U(lt, 17.3, 25.5));
      const zf = lerp(-1000, 1000, sh);
      if (lt < 17.3) { C.G = act(po(at('top', -560, 10, -900), FACE_G, 'down', { raw: [{ out: 1.15 }, { out: 0.3 }] }), fc('happy', 0.15, 9.0, 16.5, 0.3), 2.8); C.G.f.look = [0.1, 0.1];
        C.T = act(po(at('top', 120, 14, zf), -1.5, 'up', floatOpt), fc('cheering', 0.5), 2.8); }
      else { const rx = 4200 + 2000 * Math.sin(lt * 0.5);
        C.T = act(po(at('top', rx, 10 + 500 * Math.abs(Math.sin(lt * 2.4)), 2700), -1.5, 'down', { walk: 0 }), fc('curious', 0.5), 6.0); C.T.po.walk = 0; C.T.po.ph = lt * 0.9;
        C.G = act(po(at('top', 1500, 10, 2500), -1.9, 'down', { raw: [{ out: 1.0 + 0.5 * Math.sin(lt * 3), fw: 0.4 }, { out: 0.25 }] }), fc('happy', 0.15, 17.6, 25.5, 0.3), 6.5); }
    } else {
      V.room = true; const fill = U(lt, 27.6, 31.8);
      BIG.setFill(fill); TAGF.visible = lt > 32.4; TAGF.scale.setScalar(ease(lt, 32.4, 33.0) + 0.001);
      X.cam = cam2k([at('room', 60, 190, 100), 1250, 0.15, 0.06, 36], [at('room', 100, 200, 100), 1050, 0.1, 0.05, 36], U(lt, 26.5, 33.7)); X.fg = 'rock';
      const ty = lerp(30, 340 - 250, fill) + 6 * Math.sin(t * 2.2), tx = 40 + 25 * Math.sin(t * 0.7);
      C.T = act(po(at('room', tx, ty, 20), -1.5, 'up', { float: fill > 0.2 ? 1 : 0, feet: fill < 0.2, shadow: fill < 0.2 }), Object.assign(fc(lt > 31 ? 'cheering' : 'surprised', 0.5), { look: [0.2, 0.2] }));
      C.G = act(po(at('room', 470, 0, 280), -2.1, 'down', { raw: [{ out: 0.3 }, { out: 1.2 + 0.05 * Math.sin(t * 2) }] }), Object.assign(fc('curious', 0.15, 28, 33, 0.4), { look: [-0.7, 0.1] }));
    }
  } else if (si === 2) {
    V.dio = true; const tl2 = lt, Lq = levelD2(tl2), Y = K.yOfLevel(Lq), A = REAL_A2(tl2), B = REAL_B2(tl2); V.real = A || B; V.dio = !A && !B;
    const k = ease(tl2, 25.4, 26.4); sky = k;
    LAKE.setLevel(Lq); LAKE.update(t); POLE.setLevel(Lq);
    return d2(t, lt, Lq, Y, A, B, V, X, C, k);
  } else if (si === 3) {
    V.tank = true; const Yw = TW(0, Yloc, 0)[1];
    if (lt < 11.4) {
      SUN.visible = true; SUN.position.set(900, 540, -60); SUN.userData.update(t); TANK.setRed(0, 0.18);
      X.cam = cam2k([TW(300, 300, 150), 2600, 0.0, 0.04, 36], [TW(150, Yloc + 80, 150), 1500, 0.0, 0.05, 36], U(lt, 0.8, 10.8)); X.fg = 'leaves';
      C.T = act(po(tw(-420, 0, 170), -1.5, 'wave', floatOpt), Object.assign(fc('tired', 0.5), { look: [0.1, 0.2] }));
      C.G = act(po(tw(560, 0, 170), -1.9, 'down', Object.assign({ raw: lt > 5 ? [{ out: 2.2 + 0.1 * Math.sin(t * 4), fw: 0.9 }, { out: 0.2 }] : [{ out: 0.2 }, { out: 0.2 }] }, floatOpt)), fc('worried', 0.15, 1.0, 8.0, 0.3));
    } else if (lt < 20.6) {
      TANK.setRed(0, 0.18); const lit = ease(lt, 11.6, 12.2); TANK.setRed(1, lit * (lt < 17 ? 0.75 + 0.25 * Math.sin(lt * 9) ** 2 : 1)); TANK.pole.setLamp(lt < 17 ? 0.5 + 0.5 * Math.sin(lt * 9) : 0);
      X.cam = cam2k([TW(0, Yloc + 60, 150), 1300, 0.0, 0.04, 36], [TW(0, K.yOfLevel(213) + 40, 150), 1000, 0.06, 0.04, 36], U(lt, 11.4, 16)); X.fg = 'grass';
      C.T = act(po(tw(lt < 15 ? -420 : -250, 0, 170), -1.4, 'point', floatOpt), Object.assign(fc('surprised', 0.5, 16.0, 20, 0.8), { look: [0.4, 0.2] }));
      C.G = act(po(tw(520, 0, 170), -1.9, 'down', Object.assign({ raw: [{ out: 0.2 }, { out: 1.5 + 0.1 * Math.sin(t * 2), fw: 0.7 }] }, floatOpt)), fc('happy', 0.15, 12.5, 20.0, 0.3));
    } else if (lt < 28.4) {
      TANK.setRed(0, 0.15); TANK.setRed(1, 1); TH.visible = true; TH.position.set(420, Yloc - 40 + 0, 170); TH.userData.setTemp(ease(lt, 21.0, 27.5)); SALT.visible = lt > 22.5; SALT.position.set(-100, Yloc + 520 + 20 * Math.sin(t * 3), 170); SALT.scale.setScalar(ease(lt, 22.5, 23.4) + 0.001);
      X.cam = cam2k([TW(0, Yloc + 250, 150), 1400, 0.0, 0.04, 36], [TW(150, Yloc + 220, 150), 1300, -0.05, 0.04, 36], U(lt, 20.6, 27.8)); X.fg = 'leaves';
      C.T = act(po(tw(-420, 0, 170), -1.5, 'down', floatOpt), Object.assign(fc('worried', 0.5, 24, 27.5, 0.8), { look: [0.2, 0.3] }));
      C.G = act(po(tw(640, 0, 170), -1.9, 'down', Object.assign({ raw: [{ out: 0.2 }, { out: 1.35 + 0.15 * Math.sin(t * 6), fw: 0.5 }] }, floatOpt)), fc('happy', 0.15, 21.5, 27.5, 0.3));
    } else if (lt < 37.6) {
      TANK.setRed(0, 0.15); TANK.setRed(1, 1); TANK.setSprings(ease(lt, 28.6, 30.0));
      X.cam = cam2k([TW(0, -1380, 150), 1500, 0.0, 0.04, 36], [TW(-100, -1480, 150), 1050, 0.05, 0.03, 36], U(lt, 28.4, 37)); X.fg = 'rock';
      FISH.forEach((f, i) => { f.root.visible = true; const u = ease(lt, 29.5 + i * 0.5, 34.0 + i * 0.4), x = lerp(-60 + i * 120, 880, u), y = -1600 - i * 60 + 20 * Math.sin(t * 2 + i), z = lerp(40, -60, u); f.pose({ t, x, y, z, yaw: u < 0.99 ? 0 : 0, swim: 1, shadow: false }); f.root.scale.setScalar(0.5 * (1 - 0.6 * u)); f.root.visible = u < 0.98; });
      const dive = U(lt, 31, 33.5);
      C.T = act(po(tw(lerp(-100, -330, dive), lerp(0, -140, dive), 170), -1.3, 'down', Object.assign({ tilt: 18 * dive }, floatOpt)), Object.assign(fc(dive > 0.8 ? 'surprised' : 'curious', 0.5, 34, 37, 0.8), { look: [0.2, -0.5] }));
      C.G = act(po(tw(-520, 0, 170), -1.7, 'point', floatOpt), fc('happy', 0.15, 29, 36, 0.3));
    } else if (lt < 45.5) {
      V.tank = false; V.glass = true; 
      GL.setSpoonX(lerp(-170, 170, U(lt, 40.6, 41.8))); GL.setTip(Math.max(U(lt, 38.6, 39.3) * (1 - U(lt, 40.0, 40.6)), U(lt, 42.0, 42.7) * (1 - U(lt, 44.2, 44.8))));
      GL.setSalt(U(lt, 39.0, 44.8)); GL.update(t);
      X.cam = cam2k([at('glass', 0, 260, 0), 1700, 0.0, 0.1, 36], [at('glass', 40, 250, 0), 1500, 0.03, 0.08, 36], U(lt, 37.6, 45.5)); X.fg = 'leaves';
      C.T = act(po(at('glass', -520, 0, 120), -1.0, 'down', { walk: 0 }), Object.assign(fc('curious', 0.5, 38, 45, 0.8), { look: [lt < 41 ? 0.3 : 0.6, 0.0] }), 1.2);
      C.G = act(po(at('glass', 640, 0, 120), -2.1, 'up', {}), fc('happy', 0.15, 38, 45, 0.3), 1.15);
    } else {
      PUMP.visible = SIGN.visible = SHELF.visible = true; const sp = 1 - 0.9 * U(lt, 45.5, 47.6);
      SHELF.position.set(330, Yloc + 150, 170); PUMP.position.set(330, Yloc + 163, 170); SIGN.position.set(60, Yloc + 163, 170);
      PUMP.userData.setAngle(6 * (lt - 45.5) * (1 - 0.45 * (lt - 45.5) / 2.1)); PUMP.userData.setCross(0);
      X.cam = cam2k([TW(150, Yloc + 300, 150), 1250, 0.0, 0.04, 36], [TW(150, Yloc + 300, 150), 1100, 0.0, 0.04, 36], U(lt, 45.5, 47.6)); X.fg = 'grass';
      C.T = act(po(tw(-250, 0, 170), -1.5, 'down', floatOpt), Object.assign(fc('worried', 0.5), { look: [-0.5, 0.2] }));
      C.G = act(po(tw(850, 0, 190), -2.1, 'down', Object.assign({ raw: [{ out: 1.5 }, { out: 0.25 }] }, floatOpt)), fc('worried', 0.15, 45.6, 47.4, 0.3));
    }
  } else if (si === 4) {
    V.tank = true; const Yw = TW(0, Yloc, 0)[1]; TANK.setRed(0, 0.85); TANK.setRed(1, 0.85);
    const yMark = K.yOfLevel(214.87);
    if (lt < 7.3) {
      QT.visible = true; QT.position.set(300, Yloc + 330, 170); QT.scale.setScalar(0.7 * ease(lt, 1.4, 2.2) + 0.001); QT.quaternion.copy(cam.quaternion);
      X.cam = cam2k([TW(0, -420, 150), 1900, 0.0, 0.04, 36], [TW(-120, Yloc + 40, 150), 800, 0.1, 0.04, 36], U(lt, 0.8, 6.7)); X.fg = 'leaves';
      C.T = act(po(tw(-330, 0, 170), -1.3, 'point', floatOpt), Object.assign(fc('curious', 0.5, 4.5, 6.5, 0.8), { look: [0.5, 0.1] }));
      C.G = act(po(tw(520, 0, 170), -1.9, 'down', floatOpt), fc('happy', 0.15, 1.0, 6.5, 0.3));
    } else if (lt < 15.8) {
      CAL.root.position.set(520, Yloc + 330, 260); CAL.root.visible = true; CAL.setTexts(['', '', '', '', '', '', '', '']); YC4.visible = true; CAL.flip(kf([[7.4, 0], [8.4, 0], [9.6, 1], [10.6, 1], [11.8, 2], [12.4, 2]], lt));
      X.cam = cam2k([TW(0, -400, 150), 2000, 0.0, 0.04, 36], [TW(180, Yloc - 60, 150), 1500, 0.0, 0.04, 36], U(lt, 7.3, 15.2)); X.fg = 'grass';
      C.T = act(po(tw(-250, 0, 170), -1.5, 'down', floatOpt), Object.assign(fc(lt > 11 ? 'surprised' : 'curious', 0.5, 13, 15.5, 0.8), { look: [0.3, 0.4] }));
      C.G = act(po(tw(-560, 0, 170), -1.2, 'down', Object.assign({ raw: [{ out: 0.2 }, { out: 1.4 }] }, floatOpt)), fc('worried', 0.15, 7.5, 15.5, 0.3));
    } else if (lt < 22.3) {
      TANK.setRecord(ease(lt, 16.4, 17.2) * (0.7 + 0.3 * Math.sin(t * 6) ** 2));
      X.cam = cam2k([TW(-100, -1300, 150), 1900, 0.0, 0.04, 36], [TW(-200, yMark + 90, 150), 800, 0.12, 0.04, 36], U(lt, 15.8, 19.6)); X.fg = 'rock';
      const land = U(lt, 16.8, 18.4);
      C.T = act(po(tw(-250 - 120 * (1 - land), (1 - land) * 600, 170), -1.5, 'down', floatOpt), Object.assign(fc(lt < 18 ? 'surprised' : 'tired', 0.5, 19, 21.5, 0.8), { look: [0.4, 0.1] }));
      C.G = act(po(tw(560, 0, 170), -1.9, 'point', floatOpt), fc('worried', 0.15, 16, 21.5, 0.3));
    } else if (lt < 28.8) {
      TANK.setRecord(1); const isl = U(lt, 22.6, 27.0); X.inset = true; V.top = true; ROWS.setAppear(0); CNT.visible = false;
      TOP.setShrink(1 - 0.1 * isl); TOP.setSheet(0); TOP.setGold(0); TOP.setIslands(isl); TOP.update(t);
      X.cam = cam2k([TW(-100, yMark + 200, 150), 1300, 0.1, 0.05, 36], [TW(-100, yMark + 200, 150), 1200, 0.1, 0.05, 36], U(lt, 22.3, 28.8)); X.fg = null;
      const ia = TOP.islandAt(2), ib = TOP.islandAt(1);
      C.G = act(po(at('top', ia[0] - 330, 8, ia[1] + 60), -1.2, 'down', { raw: [{ out: 1.9, fw: 1.0 }, { out: 0.2 }] }), Object.assign(fc('happy', 0.15, 23, 28, 0.3), { look: [0.4, 0] }), 2.4);
      C.T = act(po(at('top', ib[0] + 20 * Math.sin(t), 40 + 30 * Math.abs(Math.sin(t * 2.2)), ib[1] + 10), -1.4, 'up', { shadow: false }), fc('cheering', 0.5, 25, 28, 0.8), 2.4);
    } else if (lt < 37.3) {
      SUN.visible = true; SUN.scale.setScalar(1.2); SUN.position.set(-250, Yloc + 780, -60); SUN.userData.update(t);
      VAP.visible = true; VAP.position.set(500, Yloc + 6, 60); VAP.userData.update(t); VAP.userData.setK(ease(lt, 28.8, 30.2));
      PUMP.visible = SHELF.visible = true; SHELF.position.set(520, Yloc + 150, 170); PUMP.position.set(520, Yloc + 163, 170); PUMP.userData.setAngle(0.8); PUMP.userData.setCross(ease(lt, 30, 31));
      X.cam = cam2k([TW(100, yMark + 300, 150), 1700, 0.0, 0.04, 36], [TW(50, yMark + 260, 150), 1500, 0.0, 0.04, 36], U(lt, 28.8, 36.7)); X.fg = 'leaves';
      C.T = act(po(tw(-120, 0, 190), -1.5, 'down', Object.assign({ tilt: -78 }, floatOpt)), Object.assign(fc('tired', 0.5), { look: [0.0, 0.5] }));
      C.G = act(po(tw(-420, 0, 190), -1.0, 'down', Object.assign({ raw: [{ out: 1.0 + 0.5 * Math.sin(t * 6), fw: 0.5 }, { out: 0.25 }] }, floatOpt)), fc('worried', 0.15, 29, 36, 0.3));
    } else {
      TANK.setRecord(0.55 + 0.45 * Math.sin(t * 2.6) ** 2);
      X.cam = cam2k([TW(-100, yMark + 160, 150), 850, 0.2, 0.05, 36], [TW(0, yMark + 400, 150), 1550, 0.0, 0.05, 36], U(lt, 37.3, 45.9)); X.fg = 'grass';
      C.T = act(po(tw(-270, 0, 190), -1.4, 'down', floatOpt), Object.assign(fc('tired', 0.5), { look: [0.5, 0.2] }));
      C.G = act(po(tw(-560, 0, 190), -1.2, 'down', Object.assign({ tilt: 3 }, floatOpt)), Object.assign(fc('worried', 0.15), { look: [0.6, 0.2] }));
    }
  } else if (si === 5) {
    const yMark = K.yOfLevel(214.87); TANK.setRed(0, 0.7); TANK.setRed(1, 0.7);
    if (lt < 8.7) {
      V.coast = true; COAST.setLines(0); for (let i = 0; i < 5; i++) COAST.setPlant(i, 0); COAST.update(t);
      X.cam = cam2k([at('coast', 400, 0, 0), 3500, 0, 0.78, 36], [at('coast', 300, 0, 0), 3300, 0, 0.72, 36], U(lt, 0.9, 8.1));
      QCOAST.visible = lt > 3.0; QCOAST.position.set(ST.coast[0] - 120, ST.coast[1] + 420 + 14 * Math.sin(t * 2), ST.coast[2] + 100); QCOAST.scale.setScalar(1.3 * ease(lt, 3.0, 3.8) + 0.001); 
      C.T = act(po(at('coast', -70, 4, 130), Math.PI, 'down', { walk: 0 }), Object.assign(fc('curious', 0.5, 4, 8, 0.8), { look: [0.4, 0.2] }), 1.5);
      C.G = act(po(at('coast', 260, 4, 230), Math.PI - 0.6, 'down', {}), Object.assign(fc('happy', 0.15, 5, 8, 0.3), { look: [0.3, 0] }), 1.6);
    } else if (lt < 17.9) {
      V.desal = true; DES.update(t); DES.setPile(U(lt, 9.4, 17.3));
      const mac = lt < 12.5, W2 = DES.anchors.W, ty = DS * 300;
      X.cam = mac ? cam2k([at('desal', 0, DS * 250, 0), 1800, 0.12, 0.04, 36], [at('desal', 0, DS * 250, 0), 1150, 0.05, 0.04, 36], U(lt, 8.7, 12.5)) : cam2k([at('desal', DS * 150, DS * 220, 0), 3000, 0.1, 0.06, 36], [at('desal', DS * 150, DS * 220, 0), 2850, 0.0, 0.05, 36], U(lt, 12.5, 17.9));
      const x0 = DS * (-W2 / 2 - 250), cc = U(lt, 15.0, 16.4);
      const tx = lt < 10.5 ? x0 : lt < 15.0 ? lerp(x0, -DS * 20, U(lt, 10.5, 15.0)) : lt < 16.4 ? lerp(-DS * 20, DS * 20, cc) : lerp(DS * 20, DS * (W2 / 2 + 420), U(lt, 16.4, 17.9));
      const dpo = () => po(at('desal', tx, ty + 6 * Math.sin(t * 3), 0), -1.5, 'down', Object.assign({ walk: 0 }, floatOpt));
      if (cc < 0.999) { C.S = act(dpo(), Object.assign(fc('worried', 0.5, 9, 15, 0.8), { look: [0.3, 0.2] }), 0.9); C.S.sz = 1 - 0.85 * cc; }
      if (cc > 0.001) { C.T = act(dpo(), Object.assign(fc(cc > 0.6 ? 'cheering' : 'surprised', 0.5, 16, 17.5, 0.8), { look: [0.3, 0.2] }), 0.9); C.T.sz = 0.15 + 0.85 * cc; }
      const gp = lt < 13.5 ? -1 : 1;
      C.G = act(po(at('desal', DS * 40, 0, 560), -1.57 + 0.5 * gp, 'down', { raw: [{ out: 0.2 }, { out: 1.4, fw: 0.5 }] }), fc('happy', 0.15, 9, 17.5, 0.3), 1.2);
    } else {
      V.coast = true; COAST.update(t); { const ks = lerp(0.9, 1.0, U(lt, 31, 42)); COAST.lakeM.scale.set(ks, 1, ks); }
      const seq = [4, 3, 2, 1, 0], tt = [24.4, 25.8, 27.2, 28.6];
      if (lt < 23.5) { COAST.setPlant(4, ease(lt, 18.4, 19.2)); for (let i = 0; i < 4; i++) COAST.setPlant(i, 0); Y05.visible = lt > 19.0; const pa = COAST.anchors.plant(4); Y05.position.set(ST.coast[0] + pa[0] - 230, ST.coast[1] + 230, ST.coast[2] + pa[2]); Y05.scale.setScalar(ease(lt, 19.0, 19.8) * 1.3 + 0.001); }
      else { COAST.setPlant(4, 1); Y05.visible = false; for (let i = 0; i < 4; i++) COAST.setPlant(3 - i, ease(lt, tt[i], tt[i] + 0.6)); }
      const lines = U(lt, 31.0, 36.0); COAST.setLines(lt > 29.9 ? lines : 0);
      if (lt < 23.5) X.cam = cam2k([at('coast', 200, 0, 940), 1500, 0.1, 0.55, 36], [at('coast', 200, 0, 900), 1100, 0.2, 0.5, 36], U(lt, 17.9, 23.4));
      else if (lt < 29.9) X.cam = cam2k([at('coast', 200, 0, 900), 1700, 0.0, 0.6, 36], [at('coast', 200, 0, -800), 1700, 0.0, 0.6, 36], U(lt, 23.6, 29.5));
      else if (lt < 38) X.cam = cam2k([at('coast', 300, 0, -300), 3200, 0, 0.72, 36], [at('coast', 900, 0, -700), 2500, 0, 0.7, 36], U(lt, 29.9, 38));
      else X.cam = cam2k([at('coast', 900, 0, -700), 2500, 0, 0.7, 36], [at('coast', 1300, 0, -1000), 1300, 0.1, 0.5, 36], U(lt, 38, 42.5));
      if (lt < 23.5) { const pa = COAST.anchors.plant(4); C.T = act(po(at('coast', pa[0], 78 + 70 * Math.abs(Math.sin(lt * 2.6)), pa[2] + 30), -1.5, 'up', { shadow: false }), fc('cheering', 0.5, 19.5, 23, 0.8), 0.9); C.G = act(po(at('coast', pa[0] + 330, 0, pa[2] + 60), -1.9, 'up', {}), fc('happy', 0.15, 19, 23, 0.3), 1.2); }
      else if (lt < 29.9) { const u = U(lt, 23.6, 29.5), z = lerp(900, -800, u);
        C.T = act(po(at('coast', 20, 6, z), Math.PI / 2, 'down', { walk: 1, ph: lt * 1.3, hopH: 50 }), fc('cheering', 0.5), 1.0);
        C.G = act(po(at('coast', 380, 0, lerp(900, -800, Math.max(0, u - 0.08))), Math.PI / 2 + 0.5, 'down', { walk: 1, ph: lt * 0.9, hopH: 30 }), fc('happy', 0.15), 1.2); }
      else { const lk = COAST.anchors.lake; C.T = act(po([ST.coast[0] + lk[0] + 40, ST.coast[1] + 24, ST.coast[2] + lk[2] + 80], -1.5, 'up', floatOpt), fc('happy', 0.5, 33, 41, 0.8), 0.55); C.G = act(po(at('coast', 1050, 0, -700), -1.5, 'up', {}), Object.assign(fc('happy', 0.15, 31, 41, 0.3), { look: [0.2, 0.2] }), 1.1); }
    }
  } else {
    V.tank = true; night = 1; sky = 1; PAN.visible = true; TANK.setRed(0, 0.55); TANK.setRed(1, 0.55);
    X.cam = cam2k([TW(0, -640, 150), 2050, 0.0, 0.05, 36], [TW(0, -620, 150), 1650, 0.0, 0.05, 36], U(lt, 0, 20.5));
    C.T = act(po(tw(-640, 0, 190), -1.4, 'down', Object.assign({ tilt: 2 }, floatOpt)), Object.assign(fc('happy', 0.5), { look: [0.4, 0.1] }), 1.95);
    C.G = act(po(tw(640, 0, 190), -1.75, 'down', Object.assign({ tilt: 2 }, floatOpt)), Object.assign(fc('happy', 0.15), { look: [-0.4, 0.1] }), 1.95);
  }
  return finish(t, lt, si, V, X, C, sky, night, L);
}

/* ---------------------------------------------------------------- d2: the approved shot */
function d2(t, lt, Lq, Y, A, B, V, X, C, k) {
  const inDio = V.dio;
  const o = {};
  /* GUIDE */
  { let p, f;
    if (!inDio) { p = { t, x: -150, y: 100, z: 255, yaw: -1.35 + 0.04 * Math.sin(t * 0.7), arms: 'down', tilt: 1.5 * Math.sin(t * 1.3) }; f = { expr: 'happy', blink: blinkAt(t, 0.15), look: [0.3, 0] };
      if (lt >= 15.6) { const up = ease(lt, 17.0, 18.0); p.arms = up > 0.5 ? 'up' : 'hips'; p.yaw = -1.2; f = { expr: 'worried', blink: blinkAt(t, 0.15), look: [0.2, -0.1], talk: talkT(lt, 16.2, 20.4, 0.1) }; } }
    else { const w = DW(1650, 235, 112), pull = ease(lt, 26.6, 28.8), actv = lt >= 25.6;
      p = { t, x: w[0], y: w[1], z: w[2], yaw: -1.65, arms: 'down', tilt: actv ? 3 * pull : 1.2 * Math.sin(t * 1.3) }; f = { expr: 'happy', blink: blinkAt(t, 0.15), look: [0.1, 0.2] };
      if (lt < 7.4) { p.raw = [{ out: 0.25 }, { out: 1.0 + 0.1 * Math.sin(t * 2.2), fw: 0.3 }]; f = { expr: 'cheering', blink: blinkAt(t, 0.15), look: [-0.3, 0.2], talk: talkT(lt, 3.0, 6.8, 0.2) }; }
      else if (lt < 15.6) { p.raw = [{ out: 1.15 + 0.05 * Math.sin(t * 1.6), fw: 0.1 }, { out: 0.25 }]; f = { expr: 'happy', blink: blinkAt(t, 0.15), look: [-0.6, 0.0], talk: talkT(lt, 8.2, 14.6, 0.4) }; }
      else if (lt < 25.6) { const up = ease(lt, 20.8, 21.8) * (1 - ease(lt, 24.4, 25.4)); p.arms = up > 0.5 ? 'up' : 'hips'; f = { expr: 'worried', blink: blinkAt(t, 0.15), look: [-0.4, 0.0], talk: talkT(lt, 20.6, 25.4, 0.1) }; }
      else { p.raw = [{ out: 1.2 + 0.35 * pull }, { out: 0.3 }]; f = { expr: 'happy', blink: blinkAt(t, 0.15), look: [-0.1, 0.3], talk: talkT(lt, 26.6, 34.0, 0.3) }; } }
    o.G = act(p, f); o.G.vis = !(lt >= 29.4 && lt < 33.0) && !(lt < 2.4); }
  /* STUDENT */
  { let p, f;
    if (A) { o.T = NONE(); }
    else if (B) { const x = -640, z = 340; p = { t, x, y: groundY(x, z), z, yaw: -1.7 + 0.1 * Math.sin(t), walk: 1, ph: t * 0.9, hopH: 34, arms: 'down' }; f = { expr: 'curious', blink: blinkAt(t, 0.5), look: [-0.4, 0.1] }; o.T = act(p, f); }
    else if (lt < 29.4) { const w = DW(700, Y, 150); p = { t, x: w[0], y: w[1], z: w[2], yaw: -1.5, arms: lt < 7.4 ? 'wave' : lt < 12 ? 'down' : lt < 15.6 ? 'up' : lt < 25.6 ? 'hips' : 'up', float: 1, feet: false, shadow: false };
      f = { expr: lt < 7.4 ? 'cheering' : lt < 12 ? 'curious' : lt < 15.6 ? 'surprised' : lt < 25.6 ? 'worried' : 'cheering', blink: blinkAt(t, 0.5), look: [0.0, lt >= 7.4 && lt < 15.6 ? 0.7 : 0.2], talk: talkT(lt, 12.4, 15.0, 0.7) }; o.T = act(p, f); }
    else { const u = ease(lt, 29.6, 33.0), x = lerp(1290, 1950, u), y = x < 1400 ? Y : x < 1700 ? lerp(Y, -125, sm((x - 1400) / 300)) : -125, w = DW(x, y, 150);
      p = { t, x: w[0], y: w[1] + 3 * Math.sin(t * 3), z: w[2], yaw: -1.5 + 0.1 * Math.sin(t * 0.8), arms: 'up', float: 1, feet: false, shadow: false, tilt: 4 * Math.sin(t * 2) }; f = { expr: 'cheering', blink: false, look: [0.2, 0.2], talk: talkT(lt, 30, 32.8, 0.8) }; o.T = act(p, f); } }
  C.G = o.G; C.T = o.T;
  if (WARM.on) return finish(t, lt, 2, V, X, C, k, 0, Lq);
  /* the shot's own world */
  const open = ease(lt, 27.0, 29.4);
  REAL.scale.setScalar(A ? 3 : 1); GATE.root.scale.setScalar(A ? 0.5 : 1); [POLE.root, PIER, LAMP2].forEach(q => q.scale.setScalar(A ? 1 / 3 : 1));
  LAKE.setRain(1 - ease(lt, 25.0, 27.6));
  POLE.setLevel(Lq); GATE.setLake(Y); GATE.setOpen(open); GATE.update(t);
  DIO.setLevel(Lq); DIO.setRain(1 - ease(lt, 25.0, 27.6)); DIO.setOpen(open); DIO.setUpper(ease(lt, 8.6, 9.4) * (lt < 14 ? 0.6 + 0.4 * Math.sin(lt * 9) ** 2 : 1)); DIO.update(t);
  const red = ease(lt, 8.6, 9.4); const near = cl((209.1 - Lq) / 0.26, 0, 1), blink = (lt >= 15.6 && lt < 27.0) ? (Math.sin(lt * (4 + 8 * near)) > 0.1 ? 1 : 0) : 0;
  const flash = (lt >= 8.8 && lt < 14) ? (0.55 + 0.45 * Math.sin(lt * 9)) : 0;
  POLE.setLamp(Math.max(blink, flash)); DIO.pole.setLamp(Math.max(blink, flash)); DIO.pole.setRed(0, red * (lt < 14 ? 0.7 + 0.3 * Math.sin(lt * 9) ** 2 : 1)); POLE.setRed(0, red);
  LAMP2.userData.m.color.set('#5a1e1e').lerp(colr('#ff3b22'), blink); LAMP2.userData.h.material.opacity = 0.7 * blink;
  rain.visible = lt < 28; rain.position.set(-100, -250, 600); if (rain.visible) rain.userData.update(t);
  /* camera segments (local) */
  const dk = (x, y, z, D, az, el, fov) => [DW(x, y, z), D, az, el, fov];
  const SG = [[0, 2.6, null], [2.6, 7.4, [dk(900, 200, 60, 1600, 0, 0.03, 36), dk(900, 200, 60, 1450, 0, 0.03, 36), 'leaves']], [7.4, 9.4, [dk(1100, 300, 60, 950, 0, 0.03, 36), dk(1100, 300, 60, 900, 0, 0.03, 36), null]],
    [9.4, 11.8, [dk(1000, 200, 60, 1200, 0, 0.03, 36), dk(1000, 200, 60, 1150, 0, 0.03, 36), 'grass']], [11.8, 15.6, [dk(1100, 270, 60, 1000, 0, 0.03, 36), dk(1100, 270, 60, 950, 0, 0.03, 36), null]],
    [15.6, 18.4, [[[-40, 215, 195], 1000, 0.35, 0.22, 30], [[-440, 230, 290], 1050, -0.2, 0.24, 28], null]], [18.4, 20.4, [[[-440, 230, 290], 1050, -0.2, 0.24, 28], [[-440, 230, 290], 1000, -0.22, 0.24, 28], 'grass']],
    [20.4, 25.6, [dk(900, 200, 60, 1550, 0, 0.03, 36), dk(900, 200, 60, 1450, 0, 0.03, 36), 'leaves']], [25.6, 29.4, [dk(1500, 200, 60, 1250, 0, 0.03, 36), dk(1500, 200, 60, 1150, 0, 0.03, 36), 'grass']],
    [29.4, 33.0, 'fol'], [33.0, 35.01, [dk(950, 200, 60, 1500, 0, 0.03, 36), dk(950, 200, 60, 1450, 0, 0.03, 36), 'leaves']]];
  const s = SG.find(q => lt < q[1]) || SG[SG.length - 1];
  if (lt < 2.6) X.cam = { p: [lerp(-500, -450, lt / 2.6), lerp(2600, 2500, lt / 2.6), lerp(4400, 4250, lt / 2.6)], l: [300, 450, -1200], fov: 64 };
  else if (s[2] === 'fol') { const x = lerp(1290, 1950, ease(lt, 29.6, 33.0)), y = x < 1400 ? 0 : x < 1700 ? lerp(0, -125, sm((x - 1400) / 300)) : -125; X.cam = { p: DW(x + 30, y + 160, 60 + 1250), l: DW(x, y + 120, 60), fov: 34 }; X.fg = 'rock'; }
  else { X.cam = cam2k(s[2][0], s[2][1], ease(lt, s[0], s[1])); X.fg = s[2][2]; }
  V.dioOn = true;
  return finish(t, lt, 2, V, X, C, k, 0, Lq);
}

/* ---------------------------------------------------------------- common finish: visibility, sky, cast poses, camera, render */
const GROUPS = () => [[REAL, 'real'], [DIO.root, 'dio'], [TG, 'tank'], [TOP.root, 'top'], [ROWS.root, 'top'], [GRIDG, 'top'], [ROOMG, 'room'], [COAST.root, 'coast'], [DES.root, 'desal'], [GL.root, 'glass'], [TABLE, 'glass']];
function finish(t, lt, si, V, X, C, sky, night, L) {
  window.__lastC = C; if (WARM.on) return;
  GROUPS().forEach(([g, k]) => { g.visible = !!V[k]; });
  birdsD.visible = !!V.dio; hills.visible = !(si === 2 && REAL_A2(lt));
  if (V.real) { REAL.scale.setScalar(si === 2 && REAL_A2(lt) ? 3 : 1); }
  if (si === 0 && V.real) { LAKE.setLevel(L); POLE.setLevel(L); LAKE.setRain(0.0); [POLE.root, PIER, LAMP2].forEach(q => q.scale.setScalar(1)); GATE.root.scale.setScalar(1); POLE.setRed(0, 0); POLE.setLamp(0); LAMP2.userData.h.material.opacity = 0; }
  if (V.real) { LAKE.update(t); POLE.update(t); }
  const rainWin = si === 0 && lt >= 26.9 && lt < 34.6;
  const horz = night ? setSkyMix(SKYP.night, SKYP.night, 0) : si === 0 ? (rainWin ? setSkyMix(SKYP.rain, SKYP.rain, 0) : lt < 26.9 ? setSkyMix(SKYP.dawn, SKYP.clear, ease(lt, 0, 20)) : setSkyMix(SKYP.clear, SKYP.clear, 0)) : setSkyMix(SKYP.rain, SKYP.clear, sky);
  LAKE.setHorizon(horz); TANK.setLevel(L);
  if (V.tank) { TANK.update(t); TANK.root.updateMatrixWorld(true); }
  const rainy = (si === 2 && lt < 26.4 && !REAL_A2(lt)) || rainWin;
  cloudsRain.visible = rainy; cloudsClear.visible = !night && !rainy && !(si === 2 && lt < 26.4);
  if (si === 2 && lt < 2.4) cloudsClear.visible = cloudsRain.visible = false;
  rain.visible = si === 2 && lt < 28; birds.visible = !night; birds.userData.update(t); birdsD.userData.update(t);
  /* cast */
  const ds = [[GD, C.G], [TP, C.T], [TS, C.S]];
  ds.forEach(([o, c]) => { o.root.visible = c.vis; if (c.vis) { o.root.scale.setScalar(c.sc * (o === GD ? 0.98 : 0.94)); o.pose(c.po); if (c.sz) o.root.scale.z *= c.sz; o.face.set(c.f); } });
  const c = window.__co || X.cam;
  if (!window.__co && V.real && c.p[1] < 3000) c.p[1] = Math.max(c.p[1], LAKE.heightAt(c.p[0], c.p[2]) + 150);
  cam.fov = c.fov; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l); cam.updateMatrixWorld(true); SKY.position.copy(cam.position);
  /* the student peering into the macro shot: placed relative to the camera */
  if (C.T.camRel && C.T.vis) { const dz = 200, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; TP.root.position.copy(tmp.set(0.62 * hw, -1.45 * hh, -dz).applyQuaternion(cam.quaternion).add(cam.position));
    TP.root.rotation.set(0, Math.atan2(-(cam.position.z - TP.root.position.z), cam.position.x - TP.root.position.x), 0); }
  Object.values(fgs).forEach(f => { f.visible = false; });
  if (X.fg && !window.__co) { const f = fgs[X.fg], dz = 420, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; f.visible = true; f.scale.setScalar(0.5);
    if (X.fg === 'grass') place(f, -0.9 * hw, -0.82 * hh, -dz); else if (X.fg === 'leaves') place(f, -0.9 * hw, 0.8 * hh, -dz); else place(f, 0.9 * hw, -0.82 * hh, -dz); }
  if (V.top && !V.tank) { /* top shots use the world sky behind the map */ }
  QT.quaternion.copy(cam.quaternion); QR.quaternion.copy(cam.quaternion); QTOP.quaternion.copy(cam.quaternion); QCOAST.quaternion.copy(cam.quaternion); Y05.quaternion.copy(cam.quaternion);
  renderer.render(scene, cam);
  window.__inset = !!X.inset;
  if (X.inset) {
    const bw = Math.round(W * 0.40), bh = Math.round(H * 0.58), bx = Math.round(W * 0.025), by = Math.round(H * 0.22);
    const p2 = [ST.top[0] + 50, ST.top[1] + 3000, ST.top[2] + 520]; cam2.aspect = bw / bh; cam2.fov = 34; cam2.updateProjectionMatrix(); cam2.position.set(p2[0], p2[1], p2[2]); cam2.lookAt(ST.top[0] + 50, ST.top[1], ST.top[2] - 10); cam2.updateMatrixWorld(true); SKY.position.copy(cam2.position);
    renderer.setScissorTest(true); renderer.setViewport(bx - 8, by - 8, bw + 16, bh + 16); renderer.setScissor(bx - 8, by - 8, bw + 16, bh + 16); renderer.setClearColor('#1d2a44', 1); renderer.clear();
    renderer.setViewport(bx, by, bw, bh); renderer.setScissor(bx, by, bw, bh); renderer.render(scene, cam2);
    renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H); renderer.setClearColor('#000000', 1); window.__cam2 = cam2;
  }
}

/* ---------------------------------------------------------------- face warm-up + contract */
async function warm() {
  const seen = new Set(), jobs = [];
  WARM.on = true; for (let k = 0; k <= DUR * 30; k++) { frame(k / 30); for (const [o, c] of [[GD, window.__lastC.G], [TP, window.__lastC.T], [TS, window.__lastC.S]]) { if (!c.vis) continue; const key = o.root.uuid + JSON.stringify(c.f); if (!seen.has(key)) { seen.add(key); jobs.push([o, c.f]); } } }
  WARM.on = false; for (const [o, f] of jobs) await o.face.set(f);
  return jobs.length;
}
const _hb = new THREE.Box3(), _hv = new THREE.Vector3();
window.__heroBox = t => { const ids = [TP, GD, TS].filter(o => o.root.visible); if (!ids.length) return null; _hb.makeEmpty(); ids.forEach(o => { o.root.updateMatrixWorld(true); _hb.expandByObject(o.drop.inner); });
  const cm = window.__inset ? cam2 : cam; const mn = [1e9, 1e9], mx = [-1e9, -1e9]; let behind = true; for (const x of [_hb.min.x, _hb.max.x]) for (const y of [_hb.min.y, _hb.max.y]) for (const z of [_hb.min.z, _hb.max.z]) { _hv.set(x, y, z).project(cm); if (_hv.z < 1) behind = false; mn[0] = Math.min(mn[0], _hv.x); mn[1] = Math.min(mn[1], _hv.y); mx[0] = Math.max(mx[0], _hv.x); mx[1] = Math.max(mx[1], _hv.y); }
  const fr = (mx[1] - mn[1]) / 2 * (window.__inset ? 1 : 1); return { visible: !behind && mx[0] > -1 && mn[0] < 1 && mx[1] > -1 && mn[1] < 1, behindCamera: behind, heightFrac: fr, bottomFrac: (1 - (mn[1] + 1) / 2), box: [mn, mx] }; };
window.__sceneHash = () => { let h = 0; scene.traverse(o => { if (o.visible !== false) { const e = o.matrixWorld.elements; h = (h * 31 + Math.round(e[12] * 10) + Math.round(e[13] * 10) * 7 + Math.round(e[14] * 10) * 13 + Math.round(e[0] * 100) * 3) | 0; } }); return h + '|' + cam.position.x.toFixed(2) + ',' + cam.position.y.toFixed(2) + ',' + cam.position.z.toFixed(2); };
window.__dur = DUR; window.__HQ = HQ; window.__errors = []; window.__T0 = window.__T0 != null ? window.__T0 : 0;
window.__shots = IDS.map((id, i) => ({ id, index: i, start: O[i], end: O[i + 1], dur: +(O[i + 1] - O[i]).toFixed(2) }));
window.__caption = t => { const si = shotOf(t); const i = CUES[si].findIndex(c => t >= c[0] && t < c[1]); return i < 0 ? null : IDS[si] + '_c' + (i + 1); };
window.__o = { cam, scene, TANK, GD, TP, TS };
const _frame = frame;
window.__lastC = { G: NONE(), T: NONE(), S: NONE() };
window.__seek = t => { try { _frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
(async () => {
  try { await loadYears(); window.__nwarm = Q.has('nowarm') ? 0 : await warm(); for (let i = 0; i < 7; i++) { _frame(O[i] + 0.5); } _frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
