/* film_d / d2_upper_line - test shot (film t 92.8 .. 127.8). Deterministic: every frame is a pure function of t.
   The shot EXPLAINS: a floating cut-away side view of the lake (water body, bed, dam on the south side) with rain arrows, Jordan inflow arrow, a rising level,
   the gauge pole with the level marker and the red line, the dam gate opening and the outflow arrows. Two real-lake views (establishing, shore with houses) frame it.
   Contract: window.__ready, window.__seek(t) (local t; adds window.__T0 - 92.8 offset), window.__dur = 35, window.__caption(t). Only the gauge digits are text. ASCII only. */
import { THREE, sm, cl, frac } from '../../../lib/toon3d/toon3d.js';
import * as K from '../../toldot08_kit/kit08.js';

const DUR = 35, T0 = 92.8;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.getElementById('wrap').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 5, 60000); scene.add(cam);
const CUES = [[0.8, 7.4], [8.0, 15.2], [15.8, 25.8], [26.4, 32.9]];   // local; absolute cues = T0 + local (93.6/100.2, 100.8/108.0, 108.6/118.6, 119.2/125.7)
const lerp = (a, b, u) => a + (b - a) * u;
const ease = (t, a, b) => sm(cl((t - a) / (b - a), 0, 1));
const blinkAt = (t, o) => frac(t / 3.3 + (o || 0)) < 0.045;
const talkT = (t, a, b, sd) => (t > a && t < b && frac(t * 0.8 + (sd || 0)) < 0.7) ? 'AEOX'[Math.floor(t * 8 + (sd || 0) * 5) % 4] : undefined;
const REAL_A = t => t < 2.4, REAL_B = t => t >= 15.6 && t < 20.4, inDio = t => !REAL_A(t) && !REAL_B(t);

/* ---------------------------------------------------------------- the water level (metres): smooth, monotone, never above the red line before the gate opens */
const LV = [[0, 209.50], [0.8, 209.47], [7.4, 209.20], [15.2, 209.02], [25.0, 208.885], [27.0, 208.862], [29.5, 208.84], [32.0, 208.832], [35, 208.832]];
const pl = t => { if (t <= LV[0][0]) return LV[0][1]; for (let i = 1; i < LV.length; i++) if (t <= LV[i][0]) return lerp(LV[i - 1][1], LV[i][1], (t - LV[i - 1][0]) / (LV[i][0] - LV[i - 1][0])); return LV[LV.length - 1][1]; };
const level = t => { let s = 0; for (let k = -8; k <= 8; k++) s += pl(t + k * 0.1); return s / 17; };

/* ---------------------------------------------------------------- sky, real lake, hero props */
const SKYP = { rain: ['#6f8296', '#97a8b6', '#c3ccd3'], clear: ['#5fb3e6', '#9fd4f2', '#e2f3fb'] };
const SKY = K.makeSky({ palette: 'winter' }); scene.add(SKY);
const _c = {}; const colr = h => _c[h] || (_c[h] = new THREE.Color(h));
function setSky(k) { const u = SKY.material.uniforms, A = SKYP.rain, B = SKYP.clear; u.uTop.value.copy(colr(A[0])).lerp(colr(B[0]), k); u.uMid.value.copy(colr(A[1])).lerp(colr(B[1]), k); u.uHorz.value.copy(colr(A[2])).lerp(colr(B[2]), k); return '#' + u.uHorz.value.getHexString(); }
const REAL = new THREE.Group(); scene.add(REAL);   // the real lake + stage; scaled up for the establishing shot only
const LAKE = K.makeKinneretLake({ level: 209.3 }); REAL.add(LAKE.root);
const hills = K.makeHills({ a0: 0, a1: Math.PI * 2, dists: [6200, 8600, 11500], base: '#86b35e', haze: '#cfe0e6', h: 750, n: 14 }); hills.position.y = -60; scene.add(hills);
const mkClouds = (col, tint) => { const g = new THREE.Group(); [[-2600, 1500, -6800, 3.4], [2400, 1700, -7600, 3.8], [200, 1900, -8600, 4.2], [-4200, 1400, 1800, 3.2], [4600, 1600, 2600, 3.4], [-900, 1700, 7600, 3.6]].forEach(([x, y, z, s], i) => { const c = K.makeCloud(i + 31, { s, col, tint }); c.position.set(x, y, z); g.add(c); }); scene.add(g); return g; };
const cloudsRain = mkClouds('#b3bcc8', '#8a96aa'), cloudsClear = mkClouds('#ffffff', '#dfe6f2');
const rain = K.makeRain({ n: 1300, w: 3800, d: 3600, h: 1500, col: '#dbe8f2', r: 2.0 }); rain.position.set(-100, -250, 600); scene.add(rain);
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

/* ---------------------------------------------------------------- the explaining diorama, floating over the lake */
const OX = -700, OY = 3600, OZ = -500, SC = 0.62;   // the diorama is drawn at 0.62 so that the drops (300 / 230) are about a third of the frame height
const DW = (x, y, z) => [OX + SC * x, OY + SC * y, OZ + SC * z];
const DIO = K.makeLakeSection(); DIO.root.position.set(OX, OY, OZ); DIO.root.scale.setScalar(SC); scene.add(DIO.root);
const birdsD = K.makeBirds({ n: 4, r: 420, y: 420, seed: 9 }); birdsD.position.set(OX + SC * 900, OY + 80, OZ + SC * 250); scene.add(birdsD);

/* ---------------------------------------------------------------- the cast: GUIDE = makeTipa big (~300), STUDENT = makeTipa tipa (~230) */
function makeDrop(kind, sc) {
  const d = K.makeTipa({ kind }); d.root.scale.setScalar(sc);
  return { drop: d, root: d.root, pose: po => { d.pose(Object.assign({}, po)); if (po.raw) po.raw.forEach((r, i) => { if (r) d.arms[i].rotation.set(-d.arms[i].userData.sz * (r.out || 0), -d.arms[i].userData.sz * (r.ry || 0), r.fw || 0); }); }, face: d.face };
}
const GD = makeDrop('big', 0.98), TP = makeDrop('tipa', 0.94);
scene.add(GD.root); scene.add(TP.root);
const groundY = (x, z) => LAKE.heightAt(x, z);
const dioY = x => { const Yw = 0; return Yw; };   // placeholder (kept for clarity)

function cast(t) {
  const Yw = K.yOfLevel(level(t)), o = {}, dio = inDio(t);
  const bob = (x, z) => 0;   // the diorama water is flat (the level is the message)
  /* GUIDE */
  { let po, f, vis = true;
    if (!dio) { po = { t, x: -150, y: 100, z: 255, yaw: -1.35 + 0.04 * Math.sin(t * 0.7), arms: 'down', tilt: 1.5 * Math.sin(t * 1.3) }; f = { expr: 'happy', blink: blinkAt(t, 0.15), look: [0.3, 0] };
      if (t >= 15.6) { const up = ease(t, 17.0, 18.0); po.arms = up > 0.5 ? 'up' : 'hips'; po.yaw = -1.2; f = { expr: 'worried', blink: blinkAt(t, 0.15), look: [0.2, -0.1], talk: talkT(t, 16.2, 20.4, 0.1) }; } }
    else { const w = DW(1650, 235, 112), pull = ease(t, 26.6, 28.8), act = t >= 25.6;
      po = { t, x: w[0], y: w[1], z: w[2], yaw: -1.55 - 0.1, arms: 'down', tilt: act ? 3 * pull : 1.2 * Math.sin(t * 1.3) }; f = { expr: 'happy', blink: blinkAt(t, 0.15), look: [0.1, 0.2] };
      if (t < 7.4) { po.raw = [{ out: 0.25 }, { out: 1.0 + 0.1 * Math.sin(t * 2.2), fw: 0.3 }]; f = { expr: 'cheering', blink: blinkAt(t, 0.15), look: [-0.3, 0.2], talk: talkT(t, 3.0, 6.8, 0.2) }; }
      else if (t < 15.6) { po.raw = [{ out: 1.15 + 0.05 * Math.sin(t * 1.6), fw: 0.1 }, { out: 0.25 }]; f = { expr: 'happy', blink: blinkAt(t, 0.15), look: [-0.6, 0.0], talk: talkT(t, 8.2, 14.6, 0.4) }; }
      else if (t < 25.6) { const up = ease(t, 20.8, 21.8) * (1 - ease(t, 24.4, 25.4)); po.arms = up > 0.5 ? 'up' : 'hips'; f = { expr: 'worried', blink: blinkAt(t, 0.15), look: [-0.4, 0.0], talk: talkT(t, 20.6, 25.4, 0.1) }; }
      else { po.raw = [{ out: 1.2 + 0.35 * pull }, { out: 0.3 }]; f = { expr: 'happy', blink: blinkAt(t, 0.15), look: [-0.1, 0.3], talk: talkT(t, 26.6, 34.0, 0.3) }; } }
    o.G = { po, f, vis }; }
  /* STUDENT */
  { let po, f;
    if (REAL_A(t)) { const x = 95, z = 255; po = { t, x, y: Yw + LAKE.float(x, z, 60).y - LAKE.water.position.y, z, yaw: -1.9, arms: 'wave', float: 1, feet: false, shadow: false }; f = { expr: 'cheering', blink: blinkAt(t, 0.5), look: [0.3, 0.3] }; }
    else if (REAL_B(t)) { const x = -640, z = 340; po = { t, x, y: groundY(x, z), z, yaw: -1.7 + 0.1 * Math.sin(t), walk: 1, ph: t * 0.9, hopH: 34, arms: 'down' }; f = { expr: 'curious', blink: blinkAt(t, 0.5), look: [-0.4, 0.1] }; }
    else if (t < 29.4) { const w = DW(700, Yw, 150); po = { t, x: w[0], y: w[1], z: w[2], yaw: -1.5, arms: t < 7.4 ? 'wave' : t < 12 ? 'down' : t < 15.6 ? 'up' : t < 25.6 ? 'hips' : 'up', float: 1, feet: false, shadow: false };
      f = { expr: t < 7.4 ? 'cheering' : t < 12 ? 'curious' : t < 15.6 ? 'surprised' : t < 25.6 ? 'worried' : 'cheering', blink: blinkAt(t, 0.5), look: [0.0, t >= 7.4 && t < 15.6 ? 0.7 : 0.2], talk: talkT(t, 12.4, 15.0, 0.7) }; }
    else { const u = ease(t, 29.6, 33.0), x = lerp(1290, 1950, u), y = x < 1400 ? Yw : x < 1700 ? lerp(Yw, -125, sm((x - 1400) / 300)) : -125, w = DW(x, y, 150);
      po = { t, x: w[0], y: w[1] + 3 * Math.sin(t * 3), z: w[2], yaw: -1.5 + 0.1 * Math.sin(t * 0.8), arms: 'up', float: 1, feet: false, shadow: false, tilt: 4 * Math.sin(t * 2) }; f = { expr: 'cheering', blink: false, look: [0.2, 0.2], talk: talkT(t, 30, 32.8, 0.8) }; }
    o.T = { po, f }; }
  return o;
}

/* ---------------------------------------------------------------- cameras */
const SEG = [];
const orb = (tg, D, az, el) => [tg[0] - Math.sin(az) * Math.cos(el) * D, tg[1] + Math.sin(el) * D, tg[2] + Math.cos(az) * Math.cos(el) * D];   // az 0 = camera south of the target (or in front of the diorama)
const sg = (a, b, k0, k1, fg) => SEG.push({ a, b, k0, k1, fg });
const sgf = (a, b, fn, fg) => SEG.push({ a, b, fn, fg });
const dk = (x, y, z, D, az, el, fov) => [DW(x, y, z), D, az, el, fov];
sgf(0, 2.6, (t, u) => ({ p: [lerp(-500, -450, u), lerp(2600, 2500, u), lerp(4400, 4250, u)], l: [300, 450, -1200], fov: 64 }), null);
sg(2.6, 7.4, dk(900, 200, 60, 1600, 0.0, 0.03, 36), dk(900, 200, 60, 1450, 0.0, 0.03, 36), 'leaves');
sg(7.4, 9.4, dk(1100, 300, 60, 950, 0.0, 0.03, 36), dk(1100, 300, 60, 900, 0.0, 0.03, 36), null);
sg(9.4, 11.8, dk(1000, 200, 60, 1200, 0.0, 0.03, 36), dk(1000, 200, 60, 1150, 0.0, 0.03, 36), 'grass');
sg(11.8, 15.6, dk(1100, 270, 60, 1000, 0.0, 0.03, 36), dk(1100, 270, 60, 950, 0.0, 0.03, 36), null);
sg(15.6, 18.4, [[-40, 215, 195], 1000, 0.35, 0.22, 30], [[-440, 230, 290], 1050, -0.2, 0.24, 28], null);
sg(18.4, 20.4, [[-440, 230, 290], 1050, -0.2, 0.24, 28], [[-440, 230, 290], 1000, -0.22, 0.24, 28], 'grass');
sg(20.4, 25.6, dk(900, 200, 60, 1550, 0.0, 0.03, 36), dk(900, 200, 60, 1450, 0.0, 0.03, 36), 'leaves');
sg(25.6, 29.4, dk(1500, 200, 60, 1250, 0.0, 0.03, 36), dk(1500, 200, 60, 1150, 0.0, 0.03, 36), 'grass');
sgf(29.4, 33.0, (t, u) => { const x = lerp(1290, 1950, ease(t, 29.6, 33.0)), y = x < 1400 ? 0 : x < 1700 ? lerp(0, -125, sm((x - 1400) / 300)) : -125; return { p: DW(x + 30, y + 160, 60 + 1250), l: DW(x, y + 120, 60), fov: 34 }; }, 'rock');
sg(33.0, 35.01, dk(950, 200, 60, 1500, 0.0, 0.03, 36), dk(950, 200, 60, 1450, 0.0, 0.03, 36), 'leaves');
const segAt = t => SEG.find(s => t < s.b) || SEG[SEG.length - 1];
function camOf(s, t) { if (s.fn) return s.fn(t, cl((t - s.a) / (s.b - s.a), 0, 1)); const u = ease(t, s.a, s.b), a = s.k0, b = s.k1; const tg = [0, 1, 2].map(i => lerp(a[0][i], b[0][i], u)); const D = lerp(a[1], b[1], u), az = lerp(a[2], b[2], u), el = lerp(a[3], b[3], u); return { p: orb(tg, D, az, el), l: tg, fov: lerp(a[4], b[4], u) }; }
const tmp = new THREE.Vector3();
const place = (o, dx, dy, dz) => { o.position.copy(cam.position).add(tmp.set(dx, dy, dz).applyQuaternion(cam.quaternion)); o.quaternion.copy(cam.quaternion); };

/* ---------------------------------------------------------------- the frame */
function frame(tl) {
  const t = Math.max(0, Math.min(DUR, tl)), L = level(t), Y = K.yOfLevel(L);
  REAL.scale.setScalar(REAL_A(t) ? 3 : 1); hills.visible = !REAL_A(t); DIO.root.visible = birdsD.visible = !REAL_A(t); GATE.root.scale.setScalar(REAL_A(t) ? 0.5 : 1); [POLE.root, PIER, LAMP2].forEach(o => o.scale.setScalar(REAL_A(t) ? 1 / 3 : 1));
  LAKE.setLevel(L); LAKE.setRain(1 - ease(t, 25.0, 27.6)); LAKE.update(t);
  POLE.setLevel(L); POLE.update(t); GATE.setLake(Y); const open = ease(t, 27.0, 29.4); GATE.setOpen(open); GATE.update(t);
  DIO.setLevel(L); DIO.setRain(1 - ease(t, 25.0, 27.6)); DIO.setOpen(open); DIO.setUpper(ease(t, 8.6, 9.4) * (t < 14 ? 0.6 + 0.4 * Math.sin(t * 9) ** 2 : 1)); DIO.update(t);
  const red = ease(t, 8.6, 9.4); POLE.setRed(0, red); DIO.pole.setRed(0, red);
  const near = cl((209.1 - L) / 0.26, 0, 1), blink = (t >= 15.6 && t < 27.0) ? (Math.sin(t * (4 + 8 * near)) > 0.1 ? 1 : 0) : 0;
  const flash = (t >= 8.8 && t < 14) ? (0.55 + 0.45 * Math.sin(t * 9)) : 0;   // the red line flashes when it lights
  POLE.setLamp(Math.max(blink, flash)); DIO.pole.setLamp(Math.max(blink, flash)); DIO.pole.setRed(0, red * (t < 14 ? 0.7 + 0.3 * Math.sin(t * 9) ** 2 : 1)); POLE.setRed(0, red);
  LAMP2.userData.m.color.set('#5a1e1e').lerp(colr('#ff3b22'), blink); LAMP2.userData.h.material.opacity = 0.7 * blink;
  const k = ease(t, 25.4, 26.4), horz = setSky(k); LAKE.setHorizon(horz);
  rain.visible = t < 28; if (rain.visible) rain.userData.update(t);
  cloudsRain.visible = t < 26.4 && !REAL_A(t); cloudsClear.visible = t >= 26.4 && !REAL_A(t); birds.userData.update(t); birdsD.userData.update(t);
  const C = cast(t);
  GD.root.visible = C.G.vis && !REAL_A(t) && !(t >= 29.4 && t < 33.0); TP.root.visible = !REAL_A(t); GD.pose(C.G.po); GD.face.set(C.G.f); TP.pose(C.T.po); TP.face.set(C.T.f);
  const s = segAt(t), c = window.__co || camOf(s, t); if (!window.__co && !REAL_A(t) && c.p[1] < 3000) c.p[1] = Math.max(c.p[1], LAKE.heightAt(c.p[0], c.p[2]) + 150);
  cam.fov = c.fov; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l); cam.updateMatrixWorld(true);
  SKY.position.copy(cam.position);
  Object.values(fgs).forEach(f => { f.visible = false; });
  if (s.fg && !window.__co) { const f = fgs[s.fg], dz = 420, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; f.visible = true; f.scale.setScalar(0.5);
    if (s.fg === 'grass') place(f, -0.9 * hw, -0.82 * hh, -dz); else if (s.fg === 'leaves') place(f, -0.9 * hw, 0.8 * hh, -dz); else place(f, 0.9 * hw, -0.82 * hh, -dz); }
  renderer.render(scene, cam);
}

/* ---------------------------------------------------------------- warm-up of the faces, contract */
async function warm() {
  const seen = new Set(), jobs = [];
  for (let k = 0; k <= DUR * 30; k++) { const C = cast(k / 30); for (const [o, f] of [[GD, C.G.f], [TP, C.T.f]]) { const key = o.root.uuid + JSON.stringify(f); if (!seen.has(key)) { seen.add(key); jobs.push([o, f]); } } }
  for (const [o, f] of jobs) await o.face.set(f);
  return jobs.length;
}
const _hb = new THREE.Box3(), _hv = new THREE.Vector3();
window.__heroBox = t => { const ids = [TP, GD].filter(o => o.root.visible); if (!ids.length) return null; _hb.makeEmpty(); ids.forEach(o => { o.root.updateMatrixWorld(true); _hb.expandByObject(o.drop.inner); });
  const mn = [1e9, 1e9], mx = [-1e9, -1e9]; let behind = true; for (const x of [_hb.min.x, _hb.max.x]) for (const y of [_hb.min.y, _hb.max.y]) for (const z of [_hb.min.z, _hb.max.z]) { _hv.set(x, y, z).project(cam); if (_hv.z < 1) behind = false; mn[0] = Math.min(mn[0], _hv.x); mn[1] = Math.min(mn[1], _hv.y); mx[0] = Math.max(mx[0], _hv.x); mx[1] = Math.max(mx[1], _hv.y); }
  return { visible: !behind && mx[0] > -1 && mn[0] < 1 && mx[1] > -1 && mn[1] < 1, behindCamera: behind, heightFrac: (mx[1] - mn[1]) / 2, bottomFrac: (1 - (mn[1] + 1) / 2), box: [mn, mx] }; };
window.__sceneHash = () => { let h = 0; scene.traverse(o => { if (o.visible !== false) { const e = o.matrixWorld.elements; h = (h * 31 + Math.round(e[12] * 10) + Math.round(e[13] * 10) * 7 + Math.round(e[14] * 10) * 13 + Math.round(e[0] * 100) * 3) | 0; } }); return h + '|' + cam.position.x.toFixed(2) + ',' + cam.position.y.toFixed(2) + ',' + cam.position.z.toFixed(2); };
window.__dur = DUR; window.__HQ = HQ; window.__errors = []; window.__T0 = window.__T0 != null ? window.__T0 : T0;
window.__shots = [{ id: 'd2_upper_line', index: 0, start: 0, end: DUR, dur: DUR }];
window.__caption = t => { const i = CUES.findIndex(c => t >= c[0] && t < c[1]); return i < 0 ? null : 'd2_upper_line_c' + (i + 1); };
window.__o = { cam, scene, LAKE, POLE, GATE, DIO, GD, TP };
window.__seek = t => { try { frame(t + (window.__T0 || 0) - T0); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
(async () => {
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm(); frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
