/* film_a - "the Kinneret: the sweet lake, the deep bowl" - the whole film (7 shots, 273.8 s). Deterministic: every frame is a pure function of t.
   Hero = the moving diagrams: relief map with glowing lakes / drying Hula / gold outline, glasses with X and check, the profile bowl with arrows and counters,
   the Jerusalem mountain beside it, the long rulers on the map, the glass tank with the sinking 14-floor building. The drops (guide = makeTipa big, student = makeTipa tipa)
   are talking objects that point and react. No people. No Hebrew in code. No years on screen in this film. ASCII only.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur = 273.8, window.__caption(t), window.__heroBox, window.__sceneHash. */
import { THREE, sm, cl, frac } from '../../../lib/toon3d/toon3d.js';
import * as K from '../../toldot08_kit/kit08.js';

const DUR = 273.8;
const O = [0, 45.1, 87.1, 135.3, 174.3, 209.8, 252.2, 273.8];
const IDS = ['a1_sweet_lake', 'a1b_only_one', 'a2_deep_bowl', 'a2b_almost_a_km', 'a3_how_long', 'a4_how_deep', 'a5_recap'];
const CUES = [
  [[5.6, 11.5], [12.1, 18.6], [19.2, 27.2], [27.8, 35.0], [35.6, 42.8]],
  [[46.3, 54.2], [54.8, 61.4], [62.0, 69.2], [69.8, 77.1], [77.7, 83.5]],
  [[88.0, 95.2], [95.8, 103.1], [103.7, 109.6], [110.2, 117.4], [118.0, 124.6], [125.2, 133.1]],
  [[136.3, 142.2], [142.8, 149.3], [149.9, 155.8], [156.4, 163.0], [163.6, 170.1]],
  [[175.2, 180.7], [181.3, 187.2], [187.8, 195.0], [195.6, 201.5], [202.1, 207.6]],
  [[210.7, 216.6], [217.2, 223.7], [224.3, 230.9], [231.5, 239.4], [240.0, 247.3]],
  []];
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.getElementById('wrap').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 5, 90000); scene.add(cam);
const lerp = (a, b, u) => a + (b - a) * u;
const ease = (t, a, b) => sm(cl((t - a) / (b - a), 0, 1));
const U = ease;
const blinkAt = (t, o) => frac(t / 3.3 + (o || 0)) < 0.045;
const shotOf = t => { for (let i = 0; i < 7; i++) if (t < O[i + 1]) return i; return 6; };
const inCue = t => CUES[shotOf(t)].some(c => t >= c[0] && t < c[1]);
const _c = {}; const colr = h => _c[h] || (_c[h] = new THREE.Color(h));

/* ---------------------------------------------------------------- sky */
const SKYP = { dusk: ['#3d4f8c', '#c88b86', '#f3bb82'], clear: ['#5fb3e6', '#9fd4f2', '#e2f3fb'], dawn: ['#6fa8e0', '#f2c98a', '#ffe9c4'], warm: ['#6fb0e8', '#ffe2a8', '#fff1cf'], night: ['#0d2250', '#17386e', '#2c5a92'] };
const SKY = K.makeSky({ palette: 'winter' }); scene.add(SKY);
function setSkyMix(A, B, k) { const u = SKY.material.uniforms; u.uTop.value.copy(colr(A[0])).lerp(colr(B[0]), k); u.uMid.value.copy(colr(A[1])).lerp(colr(B[1]), k); u.uHorz.value.copy(colr(A[2])).lerp(colr(B[2]), k); return '#' + u.uHorz.value.getHexString(); }

/* ---------------------------------------------------------------- stages (each diagram lives on its own table in the sky) */
const ST = { map: [0, 3600, 0], bowl: [2700, 3600, -150], tank: [-30000, 3600, 0] };
let BS = 1;
const MAPG = new THREE.Group(); MAPG.position.set(...ST.map); scene.add(MAPG);
const LAND_ASSETS = await K.loadLandMapAssets('./');
const LAND = K.makeLandMapA(LAND_ASSETS); MAPG.add(LAND.root);
const KC = LAND.KC, TOP = LAND.top, LY = LAND.Y;
const mwa = (x, y, z) => [ST.map[0] + x, ST.map[1] + y, ST.map[2] + z];
const mw = (x, z, dy) => mwa(x, TOP + (dy || 0), z);
const CARD = K.makeCardMapA(); CARD.scale.setScalar(0.2); CARD.position.set(KC[0] - 430, 40, KC[1]); MAPG.add(CARD);
const GLG = K.makeGlassA({ water: '#8c9296' }), GLB = K.makeGlassA({ water: '#4fb6f0' });
GLG.root.position.set(455, TOP, -30); GLB.root.position.set(KC[0] + 105, TOP, KC[1] + 10); GLG.root.scale.setScalar(0.4); GLB.root.scale.setScalar(0.4); MAPG.add(GLG.root, GLB.root);
const RG1 = new THREE.Group(), RUL1 = K.makeLongRulerA({ len: LAND.kinLen, w: 7 }); RUL1.rotation.x = -Math.PI / 2; RG1.add(RUL1); MAPG.add(RG1);
const W13 = LAND.kinEastAtMid - LAND.kinWestAtMid;
const RG2 = new THREE.Group(), RUL2 = K.makeLongRulerA({ len: W13, w: 7 }); RUL2.rotation.x = -Math.PI / 2; RG2.add(RUL2); MAPG.add(RG2);
const CAL = K.makeCalendar({ n: 6, texts: ['', '', '', '', '', ''] }); CAL.root.scale.setScalar(0.1); MAPG.add(CAL.root);
const PODIUM = new THREE.Group(); { const pm = K.M('#ffc928', '#d8a030'); const cyl = new THREE.Mesh(new THREE.CylinderGeometry(120, 130, 80, 28), pm); PODIUM.add(cyl); cyl.position.y = 40;
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(120, 130, 80, 28).translate(0, 40, 0), new THREE.MeshBasicMaterial({ color: '#261c19', side: THREE.BackSide })); hull.scale.set(1.04, 1.06, 1.04); PODIUM.add(hull); } PODIUM.position.set(KC[0], LY, KC[1]); MAPG.add(PODIUM);
const DROP = K.makeDropIconA(); DROP.scale.setScalar(0.2); MAPG.add(DROP);
const SHAD = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#0b2a44', transparent: true, opacity: 0.35, depthWrite: false })); MAPG.add(SHAD);
const CALLS = [0, 1, 2, 3].map(() => { const a = K.makeVArrowA('#ffc928', 34); a.userData.setLen(-100); a.visible = false; MAPG.add(a); return a; });
const clouds = [[-1600, 4700, -400, 3.8], [3600, 4900, -1400, 4.4], [4200, 4400, 900, 3.6]].map(([x, y, z, s], i) => { const c = K.makeCloud(i + 3, { s, col: '#ffffff', tint: '#dfe6f2' }); c.position.set(x, y, z); scene.add(c); return c; });
const BOWLG = new THREE.Group(); scene.add(BOWLG);
const SEC = K.makeBowlSectionA(); BOWLG.add(SEC.root);
const MTN = K.makeMountainA(); BOWLG.add(MTN.root);
const AR_RED = K.makeVArrowA('#e0322a', 70), AR_BLUE = K.makeVArrowA('#2f9be0', 70), AR_GOLD = K.makeVArrowA('#ffc928', 80);
[AR_RED, AR_BLUE, AR_GOLD].forEach(a => BOWLG.add(a));
function makeDashed(color) {
  const N = 70, im = new THREE.InstancedMesh(new THREE.BoxGeometry(90, 24, 8), new THREE.MeshBasicMaterial({ color }), N), dm = new THREE.Object3D(); im.frustumCulled = false; im.renderOrder = 8;
  im.userData.set = (x0, y0, x1, y1, z, k) => { const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0); let c = 0; for (let i = 0; i < N; i++) { const d = i * 150; if (d < L * k) { dm.position.set(x0 + (x1 - x0) * d / L, y0 + (y1 - y0) * d / L, z); dm.rotation.set(0, 0, a); dm.scale.setScalar(1); c++; } else { dm.position.set(0, 0, 0); dm.scale.setScalar(0.0001); } dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); } im.instanceMatrix.needsUpdate = true; im.visible = c > 0; };
  BOWLG.add(im); return im;
}
const DSH1 = makeDashed('#ffd42a'), DSH2 = makeDashed('#ffffff'), DSHV = makeDashed('#ffffff');
const SPL = K.makeSplash({ r: 150 }); BOWLG.add(SPL);
const GLOWV = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: 0, depthWrite: false })); GLOWV.renderOrder = 6; BOWLG.add(GLOWV);

const TANKG = new THREE.Group(); TANKG.position.set(...ST.tank); scene.add(TANKG);
const TK = K.makeKinneretTankA(); TANKG.add(TK.root);
const BLD = K.makeFloorBoxA(14); TANKG.add(BLD.root);
const FL1 = K.makeFloorBoxA(1); FL1.root.scale.setScalar(2.5); TANKG.add(FL1.root);
const BRK = new THREE.Group(); { const m = new THREE.MeshBasicMaterial({ color: '#d6232a' }); [[0, 0, 24, 220], [22, 98, 60, 24], [22, -98, 60, 24]].forEach(([x, y, w, h]) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); b.position.set(x, y, 0); BRK.add(b); }); } TANKG.add(BRK);
const FISH = [0, 1, 2].map(i => { const f = K.makeFish(); f.root.scale.setScalar(1.5); TANKG.add(f.root); return f; });
const ARR_T = K.makeVArrowA('#e0322a', 70); TANKG.add(ARR_T);

/* number planes and marks (billboards) */
const NP = (txt, w, h, bg, bd) => { const n = K.numPlane(txt, w, h, { bg: bg || '#fff3a0', bd: bd || '#1d2a44', k: 0.8 }); scene.add(n); return n; };
const N210 = NP('0', 700, 330), N770 = NP('0', 700, 330), N21 = NP('0', 360, 170), N13 = NP('13', 360, 170), N43 = NP('0', 560, 270), N14 = NP('0', 400, 200), N3 = NP('3', 300, 220), NTAG = NP('', 360, 200), N1 = K.numPlane('1', 420, 560, { fg: '#d6232a', bg: '#fff3a0', bd: '#1d2a44', k: 0.9 });
scene.add(N1);
const QM = K.numPlane('?', 260, 330, { fg: '#d6232a', k: 0.95 }); scene.add(QM);
const MX = K.makeMarkA('x'), MC = K.makeMarkA('ok'); scene.add(MX, MC);
const BILL = [N210, N770, N21, N13, N43, N14, N3, NTAG, N1, QM, MX, MC];
const WARM = { on: false };
const setNum = (p, s) => { if (!WARM.on) p.userData.setText(s); };

/* real lake for the recap */
const LAKE = K.makeKinneretLake({ level: 209.3 }); scene.add(LAKE.root);
const hills = K.makeHills({ a0: 0, a1: Math.PI * 2, dists: [6200, 8600, 11500], base: '#86b35e', haze: '#cfe0e6', h: 750, n: 14 }); hills.position.y = -60; scene.add(hills);
const PIER2 = K.makePier({ len: 700, w: 130, deckY: 100 }); PIER2.position.set(-740, 0, 250); scene.add(PIER2); PIER2.visible = false;
const GULL = K.makeGull(); GULL.root.scale.setScalar(2.4); scene.add(GULL.root);
const fgs = { grass: K.makeFgBlur('grass', { w: 300, h: 190, col: '#5e8f3c', blur: 7 }), leaves: K.makeFgBlur('leaves', { w: 340, h: 200, col: '#4f7f3a', blur: 8 }), rock: K.makeFgBlur('rock', { w: 300, h: 200, col: '#7a7468', blur: 8 }) };
Object.values(fgs).forEach(f => { f.visible = false; scene.add(f); });
const PAN = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: false }));
{ const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'), g = c.createRadialGradient(128, 128, 20, 128, 128, 128); g.addColorStop(0, 'rgba(6,16,44,0.78)'); g.addColorStop(0.55, 'rgba(6,16,44,0.52)'); g.addColorStop(1, 'rgba(6,16,44,0.14)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
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
const FACE = -1.45;

/* screen-space presenters: the drop stands upright at a fixed place of the frame (sx, bottom b in half-heights), height = hf of the frame; world presenters: auto scale from distance */
const actS = (po, f, sx, b, hf, o) => Object.assign(act(po, f, 1), { scr: [sx, b], hf }, o || {});
const actW = (po, f, hf) => Object.assign(act(po, f, 1), { hf });
const P0 = (arms, o) => po([0, 0, 0], 0, arms, o);
const callout = (i, x, z, on) => { const a = CALLS[i]; a.visible = !!on; a.userData.p = [x, z]; };

/* ---------------------------------------------------------------- cameras */
const orb = (tg, D, az, el) => [tg[0] - Math.sin(az) * Math.cos(el) * D, tg[1] + Math.sin(el) * D, tg[2] + Math.cos(az) * Math.cos(el) * D];
function camKeys(lt, keys, drop) {   // keys: [t, tg, D, az, el, fov]; eased between keys, content lifted so the lower 20 % stays free
  let i = 0; while (i < keys.length - 2 && lt > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)]; let u = b[0] > a[0] ? cl((lt - a[0]) / (b[0] - a[0]), 0, 1) : 0; u = 0.65 * sm(u) + 0.35 * u;
  const tg = [0, 1, 2].map(k => lerp(a[1][k], b[1][k], u)), D = Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), u)), az = lerp(a[3], b[3], u), el = lerp(a[4], b[4], u), fov = lerp(a[5] || 36, b[5] || 36, u);
  const p = orb(tg, D, az, el), f = new THREE.Vector3(tg[0] - p[0], tg[1] - p[1], tg[2] - p[2]).normalize(), r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(r, f);
  const s = (drop == null ? 0.11 : drop) * 2 * D * Math.tan(fov * Math.PI / 360);
  return { p: [p[0] - up.x * s, p[1] - up.y * s, p[2] - up.z * s], l: [tg[0] - up.x * s, tg[1] - up.y * s, tg[2] - up.z * s], fov };
}
const tmp = new THREE.Vector3(), QY = new THREE.Quaternion(), YAX = new THREE.Vector3(0, 1, 0);
const place = (o, dx, dy, dz) => { o.position.copy(cam.position).add(tmp.set(dx, dy, dz).applyQuaternion(cam.quaternion)); o.quaternion.copy(cam.quaternion); };

/* ---------------------------------------------------------------- bowl / tank world helpers */
const bw = (x, y, z) => [ST.bowl[0] + BS * x, ST.bowl[1] + BS * y, ST.bowl[2] + BS * (z || 0)];
const tkw = (x, y, z) => [ST.tank[0] + x, ST.tank[1] + y, ST.tank[2] + (z || 0)];
const ZF = 215;   // characters stand in front of the section / tank

/* ================================================================ per-frame state */
const V0 = () => ({ map: false, bowl: false, tank: false, real: false, mtn: false });
function resetAll() {
  [...CALLS, PIER2, RG1, RG2, CARD, GLG.root, GLB.root, CAL.root, PODIUM, DROP, SHAD, MX, MC, QM, N210, N770, N21, N13, N43, N14, N3, NTAG, N1, FL1.root, BLD.root, BRK, ARR_T, AR_RED, AR_BLUE, AR_GOLD, DSH1, DSH2, DSHV, SPL, GLOWV, GULL.root].forEach(o => { o.visible = false; });
  FISH.forEach(f => { f.root.visible = false; }); PAN.visible = false;
  LAND.setHula(0); LAND.setPin(0); LAND.setDim(0); LAND.setOutline(0); LAND.setGlow(0, 0); LAND.setGlow(1, 0); LAND.pondPulse(0); LAND.setKinColor('#2d9be6');
  SEC.setGlow(0, 0); SEC.setGlow(1, 0); SEC.setBowl(0); BS = 1; BOWLG.position.set(...ST.bowl); BOWLG.scale.setScalar(1); MTN.root.position.set(0, 0, 0); MTN.setRoad(0); MTN.pond.visible = false;
  CAL.flip(0); BLD.setDissolve(0); BLD.solid.visible = true;
}

function frame(tl) {
  const t = Math.max(0, Math.min(DUR, tl)); CT = t;
  const si = shotOf(t), lt = t - O[si];
  const V = V0(), X = { cam: null, fg: null, rel: [] }, C = { G: NONE(), T: NONE() };
  let sky = ['clear', 'clear', 0], night = 0, pan = false;
  resetAll();
  [s0, s1, s2, s3, s4, s5, s6][si](t, lt, V, X, C);
  BOWLG.scale.setScalar(BS);
  return finish(t, lt, si, V, X, C, night);
}

/* ---------------------------------------------------------------- a1 : which lake is the sweet one (true-scale relief map, oblique camera, presenters at the frame edge) */
function s0(t, lt, V, X, C) {
  V.map = true;
  const tg = (x, z) => mwa(x, TOP, z), K1 = [KC[0], KC[1]], DS = LAND.dead.c;
  const keys = [[0, tg(150, 100), 4000, 0.0, 0.6, 40], [5.4, tg(200, -100), 3800, 0.04, 0.6, 38], [5.7, tg(-800, 0), 3900, -0.17, 0.6, 36], [11.5, tg(-800, 0), 3900, 0.17, 0.6, 36], [12.1, tg(400, -640), 1900, 0.1, 0.6, 34],
    [18.6, tg(400, -560), 1750, 0.2, 0.58, 34], [19.2, tg(380, -50), 520, 0.3, 0.5, 34], [27.2, tg(395, -50), 470, 0.35, 0.48, 34], [27.8, tg(395, -50), 470, 0.3, 0.5, 34], [29.6, tg(520, -1160), 520, 0.12, 0.5, 34], [35.0, tg(520, -1160), 480, -0.15, 0.5, 34],
    [35.6, tg(K1[0], K1[1]), 520, 0.0, 0.55, 34], [42.8, tg(K1[0], K1[1]), 400, 0.0, 0.7, 34], [45.1, tg(K1[0], K1[1]), 370, 0.0, 0.7, 34]];
  X.cam = camKeys(lt, keys, 0.06);
  if (lt < 11.5 && lt > 0) { GULL.root.visible = true; GULL.pose({ t, x: lerp(-1500, 1300, lt / 11.5), y: ST.map[1] + 700 + 60 * Math.sin(lt * 0.9), z: ST.map[2] - 700 - 200 * (lt / 11.5), yaw: 0, flap: 0.5 + 0.5 * Math.sin(t * 7), fly: 1 }); }
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  if (lt >= 1.0 && lt < 12.1) { callout(0, K1[0], K1[1], true); callout(1, DS[0], DS[1], lt > 5.7); }
  if (lt >= 12.1 && lt < 19.2) { LAND.setGlow(0, ease(lt, 12.1, 12.8) * (0.55 + 0.45 * pulse)); LAND.setGlow(1, ease(lt, 12.1, 12.8) * (0.55 + 0.45 * (1 - pulse))); callout(0, K1[0], K1[1], true); callout(1, DS[0], DS[1], true); }
  if (lt >= 19.2 && lt < 27.8) LAND.setGlow(1, 0.5 + 0.3 * pulse);
  if (lt >= 27.8 && lt < 35.6) LAND.setGlow(0, 0.5 + 0.3 * pulse);
  LAND.setOutline(U(lt, 36.3, 41.6));
  const G0 = (arms, f, hf, o) => actS(P0(arms), f, -0.80, -0.56, hf || 0.36, o);
  if (lt < 5.6) {
    C.G = G0('down', fc('happy', 0.15, 0)); C.T = actS(P0('down'), fc('curious', 0.5, null, [0.3, 0.2]), 0.78, -0.56, 0.28);
  } else if (lt < 12.1) {
    C.G = G0('up', fc('happy', 0.15, 0, [0.3, 0])); C.T = actS(P0('down'), fc('curious', 0.5, null, [-0.5, 0.5]), -0.47, -0.56, 0.28);
    if (lt > 5.8 && lt < 8.9) { QM.visible = true; X.rel.push([QM, -0.47, 0.22, 0.26, 330, ease(lt, 5.8, 6.3) + 0.001]); }
  } else if (lt < 19.2) {
    C.G = G0('point', fc('happy', 0.15, 0), 0.36, { yawOff: lt < 15.3 ? 0.55 : 0.8 });
    const u = sm(0.5 + 0.5 * Math.sin(t * 0.9)), hop = 0.12 * Math.abs(Math.sin(t * 2.6));
    C.T = actS(P0('down'), fc('curious', 0.5, null, [0.3, 0.2]), lerp(-0.2, 0.7, u), -0.56, 0.28, { hop });
  } else if (lt < 27.8) {
    const rise = U(lt, 19.4, 21.2), push = U(lt, 25.0, 26.6), shrink = 1 - U(lt, 27.0, 27.8);
    GLG.root.visible = true; GLG.root.scale.setScalar(Math.max(0.001, 0.42 * rise * shrink)); GLG.setFill(U(lt, 20.6, 22.4)); GLG.root.position.set(455 + 14 * push, TOP - 100 * (1 - rise), -30);
    MX.visible = true; MX.userData.pop(U(lt, 22.4, 23.1) * (lt < 27.4 ? 1 : 0)); MX.position.set(...mwa(455, TOP + 120, -10)); MX.scale.multiplyScalar(0.22);
    const lean = U(lt, 21.4, 22.6) * (1 - U(lt, 23.9, 24.6)), ill = lt > 23.3;
    C.T = actS(P0(ill && lt < 25 ? 'down' : 'up', { tilt: 18 * lean + 12 * push }), fc(ill ? 'worried' : 'curious', 0.5, null, [-0.5, 0.0]), 0.74, -0.56, 0.3, { yawOff: 0.5 });
    C.G = G0('down', fc('worried', 0.15, 0)); X.fg = 'rock';
  } else if (lt < 35.6) {
    const rise = U(lt, 28.0, 29.6);
    GLG.root.visible = lt < 28.8; GLG.root.scale.setScalar(Math.max(0.001, 0.42 * (1 - U(lt, 27.6, 28.6))));
    GLB.root.visible = true; GLB.root.scale.setScalar(Math.max(0.001, 0.42 * rise)); GLB.setFill(U(lt, 29.0, 30.6)); GLB.root.position.set(KC[0] + 105, TOP - 100 * (1 - rise), KC[1] + 10);
    MC.visible = true; MC.userData.pop(U(lt, 30.8, 31.5)); MC.position.set(...mwa(KC[0] + 105, TOP + 120, KC[1] + 30)); MC.scale.multiplyScalar(0.22);
    const drink = lt > 32.0 ? 1 : 0;
    C.T = actS(P0('up', { tilt: drink ? -12 + 6 * Math.sin(t * 6) : 0 }), fc(drink ? 'cheering' : 'curious', 0.5, 1, [0.3, 0.2]), 0.74, -0.56, 0.3, { yawOff: 0.5 });
    C.G = G0('down', fc('happy', 0.15, 0), 0.36, { po: P0('down', { tilt: 3 * Math.sin(t * 3) }) });
  } else {
    C.G = G0('up', fc('happy', 0.15, 0), 0.34);
    const slide = U(lt, 36.2, 39.4), sx = lerp(KC[0] - 78, KC[0] + 6, slide), sz = KC[1] + 14 - 14 * slide;
    const yy = lerp(TOP, LY + 2, slide) + (slide >= 1 ? 3 * Math.sin(t * 2.4) : 0);
    C.T = actW(po(mwa(sx, yy, sz), -1.5, slide < 1 ? 'down' : 'up', slide >= 1 ? floatOpt : { shadow: false }), fc(slide >= 1 ? 'cheering' : 'happy', 0.5, 1), 0.3);
  }
}

/* ---------------------------------------------------------------- a1b : the only one (Hula dries, the Golan pond, the number one) */
function s1(t, lt, V, X, C) {
  V.map = true;
  const HC = LAND.hula.c, PO = LAND.pondPos, tg = (x, z) => mwa(x, TOP, z);
  const keys = [[0, tg(455, -1500), 2600, 0.0, 0.62, 36], [1.2, tg(455, -1480), 2100, 0.0, 0.62, 36], [8.6, tg(HC[0], HC[1] + 10), 430, 0.05, 0.55, 36], [9.7, tg(HC[0] + 20, HC[1]), 330, 0.1, 0.5, 34], [16.3, tg(HC[0] + 20, HC[1]), 330, 0.1, 0.5, 34],
    [16.9, tg(PO[0] - 60, PO[2] + 190), 700, -0.3, 0.55, 34], [24.1, tg(PO[0] - 60, PO[2] + 190), 640, -0.3, 0.5, 34], [24.7, tg(KC[0], KC[1]), 540, 0.0, 0.6, 34], [32.0, tg(KC[0], KC[1]), 500, 0.0, 0.6, 34], [32.6, tg(KC[0] - 8, KC[1]), 440, 0.0, 0.55, 34], [42.0, tg(KC[0] - 8, KC[1]), 400, 0.05, 0.55, 34]];
  X.cam = camKeys(lt, keys, 0.06);
  LAND.setHula(U(lt, 10.0, 15.8));
  if (lt >= 9.7 && lt < 17.2) { CAL.root.visible = true; CAL.root.position.set(HC[0] + 62, TOP, HC[1] + 4); CAL.flip(U(lt, 10.4, 15.6) * 5.2); }
  if (lt >= 15.5) LAND.pondPulse(lt >= 16.9 && lt < 24.7 ? 0.5 + 0.5 * Math.sin(t * 6) : 0);
  const G0 = (arms, f, hf, o) => actS(P0(arms), f, -0.80, -0.56, hf || 0.34, o);
  if (lt < 16.9) {
    callout(2, HC[0], HC[1], lt < 9.7);
    const hop = lt >= 11.0 && lt < 14.0 ? 7 * Math.abs(Math.sin(t * 5)) : 0;
    C.T = actW(po(mw(HC[0] + 42, HC[1] + 6, hop), -1.3, 'down', { walk: 0 }), fc(lt < 9.7 ? 'curious' : 'surprised', 0.5, null, [-0.4, -0.2]), 0.3);
    C.G = G0(lt < 9.7 ? 'point' : 'up', fc(lt < 9.7 ? 'happy' : 'worried', 0.15, 0), 0.34, { yawOff: 0.7 }); X.fg = 'grass';
  } else if (lt < 24.7) {
    callout(3, PO[0], PO[2], true);
    C.G = G0('point', fc('happy', 0.15, 0), 0.34, { yawOff: 0.7 });
    C.T = actS(P0('down', {}), fc('curious', 0.5, null, [0.5, -0.1]), 0.76, -0.56, 0.2, { sz: 1 - 0.18 * Math.abs(Math.sin(t * 6)) });
  } else if (lt < 32.6) {
    LAND.setDim(U(lt, 24.8, 26.4)); LAND.setOutline(U(lt, 25.0, 26.8)); LAND.setGlow(0, 0.4 + 0.3 * Math.sin(t * 5));
    PODIUM.visible = true; const rise = U(lt, 26.0, 28.6); PODIUM.scale.setScalar(Math.max(0.001, 0.2 * rise)); PODIUM.position.set(KC[0], LY, KC[1]);
    const hopY = lt > 28.8 ? 8 * Math.abs(Math.sin(t * 3.2)) : 0;
    C.T = actW(po(mwa(KC[0], LY + 16 * rise + hopY, KC[1]), -1.5, 'up', { walk: 0, shadow: false }), fc('cheering', 0.5, 1), 0.27);
    C.G = G0(Math.sin(t * 9) > 0 ? 'up' : 'wave', fc('happy', 0.15, 0), 0.34);
    N1.visible = true; X.rel.push([N1, 0.62, 0.12, 0.34, 560, rise + 0.001]);
  } else {
    LAND.setDim(1); LAND.setOutline(1); LAND.setGlow(0, 0.35 + 0.15 * Math.sin(t * 3));
    const wy = LY + 1 + 3 * Math.sin(t * 2.4);
    C.T = actW(po(mwa(KC[0] - 6, wy, KC[1] + 14), -1.5, 'up', floatOpt), fc('cheering', 0.5, 1), 0.3);
    DROP.visible = true; DROP.position.set(KC[0] - 6, LY + 52, KC[1] + 14); DROP.userData.update(t);
    C.G = G0('down', fc('happy', 0.15, 0), 0.34, { po: P0('down', { tilt: 6 * Math.sin(t * 2.2) }) });
    SHAD.visible = true; SHAD.position.set(KC[0] - 70, LY + 0.8, KC[1] + 20); SHAD.scale.set(130, 1, 14);
  }
}

/* ---------------------------------------------------------------- a2 : the deep bowl */
function s2(t, lt, V, X, C) {
  const tgB = (x, y) => bw(x, y, 0);
  /* c1 on the map (left third), then the whip pan to the bowl */
  if (lt < 9.9) {
    V.map = true; V.bowl = true; LAND.setPin(U(lt, 0.9, 1.6)); callout(0, KC[0], KC[1], lt > 1.0 && lt < 8.7);
    const keys = [[0, mwa(2000, TOP, -800), 5800, 0.0, 0.52, 38], [8.0, mwa(1950, TOP, -760), 5300, 0.03, 0.5, 38]];
    const K1 = camKeys(Math.min(lt, 8.0), keys, 0.04), bp = bw(1650, 150);
    const K2 = { p: [bp[0], bp[1] - 150, bp[2] + 5200], l: [bp[0], bp[1] - 330, ST.bowl[2]], fov: 36 };
    const w = U(lt, 8.7, 9.9); X.cam = { p: [0, 1, 2].map(k => lerp(K1.p[k], K2.p[k], w)), l: [0, 1, 2].map(k => lerp(K1.l[k], K2.l[k], w)), fov: lerp(K1.fov, K2.fov, w) };
    if (lt < 9.0) { C.G = actS(P0('hips'), fc('happy', 0.15, 0), -0.1, -0.56, 0.32); C.T = actS(P0('wave'), fc('happy', 0.5, null, [0.2, 0.3]), 0.2, -0.56, 0.26); }
    else { C.T = act(po(bw(-700, 0, ZF), -1.3, 'down'), fc('curious', 0.5), 2.2); }
    return;
  }
  V.bowl = true;
  const keys = [[9.9, tgB(1700, 420), 4900, 0.0, 0.03, 36], [16.0, tgB(2000, 450), 5200, -0.02, 0.03, 36], [16.6, tgB(1900, 480), 5400, 0.0, 0.03, 36], [22.5, tgB(1900, 480), 5400, 0.0, 0.03, 36], [23.1, tgB(2200, 150), 3700, 0.0, 0.03, 36], [30.3, tgB(2250, -100), 3700, 0.0, 0.03, 36],
    [30.9, tgB(700, 600), 4800, 0.0, 0.03, 36], [34.2, tgB(1000, 600), 4800, 0.0, 0.03, 36], [34.6, tgB(3300, 560), 4800, 0.0, 0.03, 36], [37.5, tgB(3300, 560), 4800, 0.0, 0.03, 36], [38.1, tgB(1900, 420), 6000, 0.0, 0.03, 36], [46.0, tgB(1900, 420), 6300, 0.0, 0.03, 36], [48.2, tgB(1900, 420), 6400, 0.0, 0.03, 36]];
  X.cam = camKeys(lt, keys, 0.0);
  const SF = 2.2, surf = FA_BOWL_SURF, yS = SEC.yAt;
  if (lt < 16.6) {
    /* T hops from the sea up the Galilee slope and down into the bowl */
    const u = U(lt, 10.0, 15.2), x = lerp(-800, 2230, u), ground = x < -440 ? 0 : Math.max(yS(x), x > 1818 && x < 2727 ? surf : -9999);
    const hop = 160 * Math.abs(Math.sin(u * 40)) * (u > 0 && u < 1 ? 1 : 0);
    C.T = act(po(bw(x, ground + hop, ZF), 0.2, 'down', { walk: 0, ph: u * 20, float: x > 1818 && x < 2727 ? 1 : 0, feet: !(x > 1818 && x < 2727) }), fc('happy', 0.5, 1), SF);
    C.G = act(po(bw(700, 1250, ZF), -1.7, 'down'), fc('happy', 0.15, 0), SF * 1.05);
  } else if (lt < 23.1) {
    QM.visible = lt < 19.8 || true; QM.visible = lt > 16.8 && lt < 20.0; QM.position.set(...bw(2270, 600, 260)); QM.scale.setScalar(5.2 * ease(lt, 16.8, 17.4) + 0.001);
    C.T = act(po(bw(1500, yS(1500) + 20, ZF), -1.3, 'up', { walk: 0 }), fc('curious', 0.5, null, [0.5, 0.4]), SF);
    C.G = act(po(bw(3300, 800, ZF), -1.8, 'hips', { tilt: 4 }), fc('happy', 0.15, 0, [-0.4, 0.2]), SF * 1.05);
  } else if (lt < 30.9) {
    const L = U(lt, 23.4, 28.4); AR_RED.visible = true; AR_RED.position.set(2270, 0, 200);     AR_RED.userData.setLen(surf * L);
    DSH1.visible = true; DSH1.userData.set(-1060, 0, 4380, 0, 190, 1);
    N210.visible = true; setNum(N210, String(Math.round(210 * L))); N210.position.set(...bw(2270 + 760, -330, 230)); N210.scale.setScalar(BS * 1.0);
    const fall = U(lt, 23.4, 28.4), landed = lt > 28.4, ty = landed ? surf + 60 : lerp(0, surf, fall * fall) + 120 * (1 - fall);
    C.T = act(po(bw(2270, ty, ZF), -1.5, 'up', landed ? floatOpt : { shadow: false, float: 0 }), fc(landed ? 'surprised' : 'worried', 0.5, 1), 3.0);
    C.T.sz = landed ? 1 - 0.28 * Math.max(0, Math.sin((lt - 28.4) * 8)) * Math.exp(-(lt - 28.4) * 2.5) : 1;
    if (landed) { SPL.visible = true; SPL.position.set(2270, surf + 6, 190); SPL.scale.setScalar(2.2); SPL.userData.update(cl((lt - 28.4) / 1.6, 0, 1)); }
    C.G = act(po(bw(3150, 300, ZF), yawTo(bw(3150, 0, 0), bw(2270, 0, 0)) - 0.2, 'point'), fc('happy', 0.15, 0), SF * 1.05);
  } else if (lt < 38.1) {
    const first = lt < 34.2; SEC.setGlow(0, first ? (0.6 + 0.4 * Math.sin(t * 6)) * ease(lt, 30.9, 31.4) : 0.2 * (1 - ease(lt, 34.2, 34.8))); SEC.setGlow(1, !first ? (0.6 + 0.4 * Math.sin(t * 6)) * ease(lt, 34.4, 34.9) : 0);
    DSH1.visible = true; DSH1.userData.set(-1060, 0, 4380, 0, 190, 1);
    const tx = first ? 700 : 3800, ty = first ? 1250 : 1150; C.T = act(po(bw(tx, ty, ZF), -1.4, 'up', { walk: 0 }), fc('cheering', 0.5, 1), SF);
    const wy = bw(2270, surf + 40, ZF); C.G = act(po(wy, yawTo(bw(2270, 0, 0), bw(tx, 0, 0)), 'point', floatOpt), fc('happy', 0.15, 0), SF * 1.05);
    C.G.po.yaw = first ? -2.7 : -0.5;
  } else {
    DSH1.visible = true; DSH1.userData.set(-1060, 0, 4380, 0, 190, 1);
    SEC.setBowl(U(lt, 38.4, 43.5));
    const wy = bw(2270, surf + 60 + 8 * Math.sin(t * 2.3), ZF);
    C.T = act(po(wy, -1.5, 'up', floatOpt), fc('cheering', 0.5, 1), SF);
    C.G = act(po(bw(700, 1250, ZF), -1.5, 'up'), fc('happy', 0.15, 0), SF * 1.05);
    sky_warm = U(lt, 40, 46);
  }
}
let sky_warm = 0;
const FA_BOWL_SURF = -630;

/* ---------------------------------------------------------------- a2b : almost a kilometre */
function s3(t, lt, V, X, C) {
  V.bowl = true; V.mtn = true;
  const SF = 3.2, surf = FA_BOWL_SURF, tgB = (x, y) => bw(x, y, 0), peak = MTN.peak;
  const rise = U(lt, 1.0, 5.2); MTN.root.position.y = -3600 * (1 - rise);
  DSH1.visible = true; DSH1.userData.set(-4300, 0, 4380, 0, 190, 1);
  const keys = [[0, tgB(1700, 120), 4300, 0.0, 0.03, 36], [3.4, tgB(-250, 800), 8800, 0.0, 0.03, 36], [14.0, tgB(-250, 800), 8800, 0.0, 0.03, 36], [14.8, tgB(900, 500), 7200, 0.0, 0.03, 36], [20.5, tgB(900, 500), 7200, 0.0, 0.03, 36],
    [21.1, tgB(-250, 800), 8800, 0.0, 0.03, 36], [27.7, tgB(-250, 800), 8800, 0.0, 0.03, 36], [28.3, tgB(-2600, 700), 5400, 0.28, 0.05, 36], [34.8, tgB(-2600, 900), 4600, 0.3, 0.06, 36], [39.0, tgB(-2600, 900), 4400, 0.3, 0.06, 36]];
  X.cam = camKeys(lt, keys, 0.0);
  const lake = bw(2270, surf + 60, ZF);
  if (lt < 7.5) {
    C.G = act(po(bw(-3300, MTN.yAt(-3300) + MTN.root.position.y, ZF), -1.5, 'wave'), fc('happy', 0.15, 0), SF * 0.95); C.T = act(po(lake, -1.6, 'down', floatOpt), fc('happy', 0.5), SF);
  } else if (lt < 14.6) {
    const L = U(lt, 8.0, 12.6) * 770 * 3 / 3; AR_GOLD.visible = true; AR_GOLD.position.set(-1850, 0, 200); AR_GOLD.userData.setLen(MTN.peak[1] * U(lt, 8.0, 12.6));
    N770.visible = true; setNum(N770, String(Math.round(770 * U(lt, 8.0, 12.6)))); N770.position.set(...bw(-1000, 1500, 230)); N770.scale.setScalar(2.0);
    const m = U(lt, 8.0, 12.6), lift = U(lt, 12.7, 13.7);
    C.T = act(po(bw(lerp(-1850, peak[0] + 40, lift), peak[1] * m + 40 * lift, ZF), -1.5, 'up', { walk: 0, shadow: lift > 0.9 }), fc('cheering', 0.5, 1), SF);
    C.G = act(po(bw(-3300, MTN.yAt(-3300), ZF), -1.5, 'down'), fc('happy', 0.15, 0), SF * 0.95);
  } else if (lt < 21.1) {
    const m = U(lt, 15.0, 19.0); AR_BLUE.visible = true; AR_BLUE.position.set(2270, 0, 200); AR_BLUE.userData.setLen(surf * m);
    N210.visible = true; setNum(N210, '210'); N210.position.set(...bw(2270 + 900, -330, 230)); N210.scale.setScalar(2.0);
    const ty = m < 1 ? surf * m + 100 * (1 - m) : surf + 60, landed = m >= 1;
    C.T = act(po(bw(2270, ty, ZF), -1.5, 'up', landed ? floatOpt : { shadow: false }), fc(landed ? 'surprised' : 'cheering', 0.5, 1), SF); if (landed) { SPL.visible = true; SPL.position.set(2270, surf + 6, 190); SPL.scale.setScalar(2.6); SPL.userData.update(cl((lt - 19.0) / 1.6, 0, 1)); }
    C.G = act(po(bw(3150, 300, ZF), -2.5, 'point'), fc('happy', 0.15, 0), SF * 1.0);
    AR_GOLD.visible = true; AR_GOLD.position.set(-1850, 0, 200); AR_GOLD.userData.setLen(peak[1]);
  } else if (lt < 28.3) {
    const k = U(lt, 21.3, 24.4); DSH2.visible = true; DSH2.userData.set(1818, surf, peak[0], surf, 200, k); DSHV.visible = true; DSHV.userData.set(peak[0], surf, peak[0], peak[1], 200, U(lt, 23.6, 26.0));
    NTAG.visible = lt > 25.4; NTAG.position.set(...bw(peak[0] + 700, 900, 240)); NTAG.scale.setScalar(2.4 * ease(lt, 25.4, 26.2) + 0.001);
    AR_GOLD.visible = true; AR_GOLD.position.set(-1850, 0, 200); AR_GOLD.userData.setLen(peak[1]); AR_BLUE.visible = true; AR_BLUE.position.set(2270, 0, 200); AR_BLUE.userData.setLen(surf);
    C.T = act(po(lake, -1.5, 'down', floatOpt), fc('curious', 0.5, null, [-0.7, 0.8]), SF);
    C.G = act(po(bw(peak[0] + 220, peak[1] + 20, ZF), -1.6, 'down'), fc('curious', 0.15, 0, [0.6, -0.7]), SF * 0.95);
    if (lt > 24.4) { GLOWV.visible = true; GLOWV.position.set(peak[0], (surf + peak[1]) / 2, 215); GLOWV.scale.set(150, peak[1] - surf, 1); GLOWV.material.opacity = 0.35 * (0.6 + 0.4 * Math.sin(t * 6)); }
  } else {
    DSH2.visible = DSHV.visible = false; const rk = U(lt, 28.6, 33.2); MTN.setRoad(rk);
    const rp = MTN.roadAt(rk); AR_GOLD.visible = false;
    NTAG.visible = lt > 33.4; NTAG.position.set(...bw(peak[0] + 760, 1200, 240)); NTAG.scale.setScalar(2.0 * ease(lt, 33.4, 34.0) + 0.001);
    C.T = act(po(bw(rp[0], rp[1] + 40 + (rk < 1 ? 70 * Math.abs(Math.sin(t * 5)) : 0), ZF - 60), -1.4, 'down', { walk: 0 }), fc(rk > 0.6 ? 'tired' : 'happy', 0.5, null, [0.3, 0.3]), SF * 0.85);
    C.G = act(po(bw(peak[0] + 130, peak[1] + 20, ZF), -1.9, rk > 0.85 ? 'point' : 'down'), fc('happy', 0.15, 0), SF * 0.95); C.G.po.tilt = rk > 0.85 ? 8 : 0;
  }
}

/* ---------------------------------------------------------------- a3 : how long */
function s4(t, lt, V, X, C) {
  V.map = true; const top = LAND.kinTopZ, bot = LAND.kinBotZ, L = LAND.kinLen, tg = (x, z) => mwa(x, TOP, z);
  const keys = [[0, tg(KC[0] - 95, KC[1]), 520, 0.0, 0.75, 34], [6.4, tg(KC[0] - 95, KC[1]), 480, 0.0, 0.75, 34], [7.0, tg(KC[0] - 95, KC[1]), 470, 0.0, 0.72, 34], [12.9, tg(KC[0] - 95, KC[1]), 470, 0.0, 0.72, 34],
    [13.5, tg(KC[0] - 95, KC[1]), 440, 0.1, 0.7, 34], [20.7, tg(KC[0] - 95, KC[1]), 420, 0.1, 0.7, 34], [21.3, tg(KC[0] - 130, KC[1]), 900, 0.0, 0.62, 34], [27.2, tg(KC[0] - 130, KC[1]), 900, 0.0, 0.62, 34],
    [27.8, tg(KC[0] - 40, KC[1]), 430, 0.0, 0.72, 34], [35.5, tg(KC[0] - 40, KC[1]), 400, 0.0, 0.72, 34]];
  X.cam = camKeys(lt, keys, 0.06);
  const flat = (g, x, y, z, yaw) => { g.visible = true; g.position.set(x, y, z); g.rotation.y = yaw; };
  const G0 = (arms, f, o) => actS(P0(arms), f, -0.80, -0.56, 0.34, o);
  const rz = KC[0] + 2;
  if (lt < 7.0) {
    C.G = G0('down', fc('happy', 0.15, 0)); C.T = actS(P0('down'), fc('curious', 0.5, null, [0.5, 0.3]), -0.47, -0.56, 0.27);
    if (lt > 1.2 && lt < 4.3) { QM.visible = true; X.rel.push([QM, 0.6, 0.26, 0.26, 330, ease(lt, 1.2, 1.7) + 0.001]); }
  } else if (lt < 13.5) {
    const g = ease(lt, 7.4, 11.4); flat(RG1, rz, LY + 1.5, top, -Math.PI / 2); RUL1.userData.grow(g);
    N21.visible = true; setNum(N21, String(Math.round(21 * g))); X.rel.push([N21, 0.68, 0.0, 0.16, 170, 1]);
    const u = ease(lt, 7.6, 12.0), z = lerp(top + 8, bot - 8, u);
    C.T = actW(po(mwa(rz, LY + 4 + 9 * Math.abs(Math.sin(u * 30)), z), -1.57, 'down', { walk: 0 }), fc('happy', 0.5, null, [0, 0.2]), 0.26);
    C.G = G0('point', fc('happy', 0.15, 0), { yawOff: 0.7 });
  } else if (lt < 21.3) {
    flat(RG1, rz, LY + 1.5, top, -Math.PI / 2); RUL1.userData.grow(1);
    N21.visible = true; setNum(N21, '21'); X.rel.push([N21, 0.68, 0.0, 0.16, 170, 1]);
    if (lt > 14.2 && lt < 17.4) { QM.visible = true; X.rel.push([QM, 0.68, 0.34, 0.26, 330, ease(lt, 14.2, 14.7) + 0.001]); }
    C.G = actS(P0(lt > 17.5 ? 'up' : 'down', { tilt: 2 }), fc('happy', 0.15, 0), -0.62, -0.56, 0.34);
    C.T = actS(P0('down'), fc('curious', 0.5, null, [-0.6, 0.7]), -0.3, -0.56, 0.26, { yawOff: -0.5 });
  } else if (lt < 27.8) {
    const k = U(lt, 22.0, 26.2); CARD.visible = true; CARD.scale.setScalar(Math.max(0.001, 0.2 * ease(lt, 21.4, 22.2)));
    const ax = CARD.position.x - 84, az = CARD.position.z + 8, ay = CARD.position.y + 14, sx = rz, sy = LY + 1.5, sz = top;
    const px = lerp(sx, ax, k), py = lerp(sy, ay, k) + 40 * Math.sin(Math.PI * k), pz = lerp(sz, az, k), yaw = lerp(-Math.PI / 2, 0, sm(k));
    flat(RG1, px, py, pz, yaw); RUL1.userData.grow(1);
    C.G = G0('up', fc('happy', 0.15, 0), { po: P0('up', { tilt: 4 }) });
    C.T = actS(P0('wave'), fc('curious', 0.5, 1, [-0.4, 0.2]), 0.74, -0.56, 0.3);
  } else {
    CARD.visible = true; CARD.scale.setScalar(0.2);
    const k2 = ease(lt, 28.4, 29.8); flat(RG2, LAND.kinWestAtMid, LY + 1.5 + 30 * (1 - k2), KC[1] + 4, 0); RUL2.userData.grow(k2);
    LAND.setGlow(0, 0.35 + 0.3 * Math.sin(t * 4)); LAND.setOutline(U(lt, 27.9, 29.0));
    N13.visible = lt > 29.6; setNum(N13, '13'); X.rel.push([N13, 0.68, 0.0, 0.16, 170, ease(lt, 29.6, 30.2) + 0.001]);
    const bal = Math.sin(t * 3.4) * 7;
    C.T = actW(po(mwa(KC[0], LY + 4, KC[1] + 4), -1.5, 'up', { walk: 0, tilt: bal, shadow: false }), fc('surprised', 0.5, null, [0, 0.2]), 0.28);
    C.G = G0('up', fc('happy', 0.15, 0), { po: P0('up', { raw: [{ out: 1.0 + 0.5 * Math.sin(t * 2.8), fw: 0.5 }, { out: 0.3 }] }) });
  }
}

/* ---------------------------------------------------------------- a4 : how deep */
function s5(t, lt, V, X, C) {
  V.tank = true; const SF = 1.7;
  const keys = [[0, tkw(300, -330), 4500, 0.0, 0.02, 36], [6.8, tkw(300, -330), 4400, 0.0, 0.02, 36], [7.4, tkw(500, -380), 3300, 0.0, 0.02, 36], [13.9, tkw(560, -400), 3000, 0.0, 0.02, 36], [14.5, tkw(1800, -100), 2500, 0.0, 0.02, 36], [21.1, tkw(1900, -60), 2300, 0.0, 0.02, 36],
    [21.7, tkw(590, 250), 3400, 0.0, 0.02, 36], [29.6, tkw(590, -330), 3400, 0.0, 0.02, 36], [30.2, tkw(590, -100), 4300, 0.0, 0.02, 36], [37.5, tkw(300, 800), 6000, 0.0, 0.05, 36], [42.4, tkw(300, 950), 6200, 0.0, 0.05, 36]];
  X.cam = camKeys(lt, keys, 0.1);
  const dipX = 590, ZT = 140;
  FISH.forEach((f, i) => { f.root.visible = false; });
  const fish = (i, x, y, yaw) => { const f = FISH[i]; f.root.visible = true; f.pose({ t, x, y, z: 60, yaw, swim: 1, shadow: false }); };
  if (lt < 7.4) {
    QM.visible = lt > 1.0 && lt < 4.2; QM.position.set(...tkw(dipX, 330, 200)); QM.scale.setScalar(2.4 * ease(lt, 1.0, 1.5) + 0.001);
    const fx = lerp(-1300, 480, U(lt, 0.5, 5.5)); fish(0, fx, -330 - 30 * Math.sin(t), 0);
    C.G = act(po(tkw(-TK.W - 280, 110, ZT), -1.2, 'down'), fc('happy', 0.15, 0), SF * 1.0); C.T = act(po(tkw(TK.W + 300, 110, ZT), -1.8, 'down'), fc('curious', 0.5, null, [-0.4, 0.2]), SF * 0.95);
  } else if (lt < 14.5) {
    const k = U(lt, 8.2, 13.0); ARR_T.visible = true; ARR_T.position.set(dipX + 190, 0, 150); ARR_T.userData.setLen(-860 * k);
    N43.visible = true; setNum(N43, String(Math.round(43 * k))); N43.position.set(...tkw(dipX + 760, -300, 200)); N43.scale.setScalar(1.4);
    C.T = act(po(tkw(dipX + 190, -860 * k + 160 * (1 - k) * 0, 130), -1.5, 'down', Object.assign({ float: 1, feet: false, shadow: false, tilt: 8 })), fc('surprised', 0.5, 1, [0, -0.4]), SF);
    fish(0, dipX - 300 + 50 * Math.sin(t), -860 * k + 60, 0); fish(1, dipX + 500, -860 * k - 100, Math.PI);
    C.G = act(po(tkw(-TK.W - 280, 110, ZT), -1.2, 'down'), fc('happy', 0.15, 0), SF);
  } else if (lt < 21.7) {
    FL1.root.visible = true; const pop = ease(lt, 14.9, 15.9); FL1.root.scale.setScalar(2.5 * pop + 0.001); FL1.root.position.set(2250, 110, 0);
    BRK.visible = pop > 0.5; BRK.position.set(1850, 195, 30);
    N3.visible = pop > 0.5; setNum(N3, '3'); N3.position.set(...tkw(1700, 330, 140)); N3.scale.setScalar(1.2);
    C.G = act(po(tkw(2650, 110, ZT), -2.3, 'down', { raw: [{ out: 1.1, fw: 0.7 }, { out: 0.2 }] }), fc('happy', 0.15, 0), 2.1);
    C.T = act(po(tkw(1590, 110, ZT + 120), -1.7, 'up', { walk: 0 }), fc('curious', 0.5, 1, [-0.4, 0.4]), 1.8);
    fish(0, 200 + 120 * Math.sin(t * 0.7), -250, Math.sin(t * 0.7) > 0 ? 0 : Math.PI);
  } else if (lt < 30.2) {
    const k = U(lt, 22.4, 28.8), base = lerp(420, -840, k); BLD.root.visible = true; BLD.root.position.set(dipX, base, 0);
    const n = cl(Math.floor((0 - base) / 60), 0, 14); N14.visible = true; setNum(N14, String(Math.max(1, n))); N14.position.set(...tkw(dipX + 760, -260, 200)); N14.scale.setScalar(1.4);
    const top = base + BLD.height;
    C.T = act(po(tkw(dipX, top + 10 + (k < 1 ? 14 * Math.abs(Math.sin(t * 9)) : 0), 150), -1.5, 'up', { walk: 0, shadow: false }), fc('cheering', 0.5, 1), 2.4);
    fish(0, dipX - 520 + 40 * Math.sin(t), -320, 0); fish(1, dipX + 600, -520, Math.PI);
    C.G = act(po(tkw(-TK.W - 280, 110, ZT), -1.2, 'down'), fc('happy', 0.15, 0), SF);
  } else {
    const d = U(lt, 30.4, 33.0); BLD.root.visible = true; BLD.root.position.set(dipX, -840, 0); BLD.setDissolve(d); N14.visible = lt < 31.5; setNum(N14, '14'); N14.position.set(...tkw(dipX + 760, -260, 200)); N14.scale.setScalar(1.4);
    V.bowl = true; const up = U(lt, 31.0, 34.5); BS = 0.3; BOWLG.position.set(ST.tank[0] - 700, ST.tank[1] + lerp(900, 1500, up), ST.tank[2] - 30);
    C.G = act(po(tkw(-TK.W - 280, 110, ZT), -1.2, 'point'), fc('happy', 0.15, 0), SF); C.G.po.yaw = -0.9 + 0.0; C.T = act(po(tkw(-TK.W - 600, 110, ZT + 20), -1.3, 'up'), fc('curious', 0.5, 1, [0.2, 0.6]), SF * 0.95);
    fish(0, 200 + 100 * Math.sin(t * 0.7), -300, 0);
  }
}

/* ---------------------------------------------------------------- a5 : recap (calm dusk, dark centre for the three lines) */
function s6(t, lt, V, X, C) {
  V.real = true; night = 0.0;
  LAKE.setLevel(209.3); LAKE.update(t);
  const u = lt / 21.6, gp = [-420, 100, 250], tp = [-330, 100, 262];
  X.cam = { p: [lerp(-980, -860, u), lerp(700, 620, u), lerp(2000, 1700, u)], l: [60, 130, 60], fov: 36 };
  PIER2.visible = true;
  pan = true;
}
let night = 0, pan = false;

/* ---------------------------------------------------------------- common finish */
function finish(t, lt, si, V, X, C, nightK) {
  window.__lastC = C; if (WARM.on) return;
  MAPG.visible = V.map; BOWLG.visible = V.bowl; SEC.root.visible = V.bowl; MTN.root.visible = V.mtn; TANKG.visible = V.tank; LAKE.root.visible = V.real; hills.visible = V.real; clouds.forEach(c => { c.visible = V.map && si < 3; });
  if (V.map) LAND.update(t);
  if (V.real) LAKE.update(t);
  let horz;
  if (si === 6) horz = setSkyMix(SKYP.dusk, SKYP.dusk, 0); else if (si === 2 && lt > 38) horz = setSkyMix(SKYP.clear, SKYP.warm, sky_warm); else horz = setSkyMix(si === 0 ? SKYP.dawn : SKYP.clear, SKYP.clear, si === 0 ? ease(lt, 0, 20) : 1);
  LAKE.setHorizon(horz);
  PAN.visible = si === 6;
  const c = window.__co || X.cam;
  if (V.real && c.p[1] < 3000) c.p[1] = Math.max(c.p[1], LAKE.heightAt(c.p[0], c.p[2]) + 150);
  cam.fov = c.fov; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l); cam.updateMatrixWorld(true); SKY.position.copy(cam.position);
  const Dc = Math.hypot(c.p[0] - c.l[0], c.p[1] - c.l[1], c.p[2] - c.l[2]), fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
  CALLS.forEach(a => { if (!a.visible) return; const sc = Dc / 1800, p = a.userData.p; a.scale.setScalar(sc); a.position.set(p[0], LY + (112 + 14 * Math.sin(t * 5)) * sc, p[1]); });
  X.rel.forEach(([o, sx, sy, hfr, bh, k]) => { const dz = 320, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; place(o, sx * hw, sy * hh, -dz); o.scale.setScalar(Math.max(0.001, hfr * 2 * hh / bh * k)); });
  const ds = [[GD, C.G], [TP, C.T]];
  ds.forEach(([o, cc]) => { o.root.visible = cc.vis; if (!cc.vis) return;
    const base = o === GD ? 0.98 : 0.94, H0 = o.drop.height || 244; let po0 = cc.po, sc = cc.sc;
    if (cc.scr) { const dz = 320, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; sc = 0.86 * cc.hf * 2 * hh / (H0 * base); const p = new THREE.Vector3(cc.scr[0] * 0.95 * hw, (cc.scr[1] + (cc.hop || 0)) * hh, -dz).applyQuaternion(cam.quaternion).add(cam.position);
      po0 = Object.assign({}, cc.po, { x: p.x, y: p.y, z: p.z, yaw: Math.atan2(-(cam.position.z - p.z), cam.position.x - p.x) + (cc.yawOff || 0) }); }
    else if (cc.hf) { const p = new THREE.Vector3(cc.po.x, cc.po.y, cc.po.z).sub(cam.position); sc = cc.hf * 2 * p.dot(fwd) * Math.tan(cam.fov * Math.PI / 360) / (H0 * base); }
    o.root.scale.setScalar(sc * base); o.pose(po0); if (cc.scr) o.root.quaternion.copy(cam.quaternion).multiply(QY.setFromAxisAngle(YAX, -Math.PI / 2 + (cc.yawOff || 0))); if (cc.sz) o.root.scale.y *= cc.sz; o.face.set(cc.f); });
  BILL.forEach(b => { if (b.visible) b.quaternion.copy(cam.quaternion); });
  if (N1.visible) N1.quaternion.copy(cam.quaternion);
  Object.values(fgs).forEach(f => { f.visible = false; });
  if (X.fg && !window.__co) { const f = fgs[X.fg], dz = 420, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; f.visible = true; f.scale.setScalar(0.5);
    if (X.fg === 'grass') place(f, -0.9 * hw, -0.82 * hh, -dz); else if (X.fg === 'leaves') place(f, -0.9 * hw, 0.8 * hh, -dz); else place(f, 0.9 * hw, -0.82 * hh, -dz); }
  renderer.render(scene, cam);
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
  const mn = [1e9, 1e9], mx = [-1e9, -1e9]; let behind = true; for (const x of [_hb.min.x, _hb.max.x]) for (const y of [_hb.min.y, _hb.max.y]) for (const z of [_hb.min.z, _hb.max.z]) { _hv.set(x, y, z).project(cam); if (_hv.z < 1) behind = false; mn[0] = Math.min(mn[0], _hv.x); mn[1] = Math.min(mn[1], _hv.y); mx[0] = Math.max(mx[0], _hv.x); mx[1] = Math.max(mx[1], _hv.y); }
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
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm(); if (!Q.has("nopre")) for (let i = 0; i < 7; i++) { _frame(O[i] + 0.5); } _frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
