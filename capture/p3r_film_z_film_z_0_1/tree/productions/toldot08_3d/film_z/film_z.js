/* film_z - the summary film: Tipa's whole journey (Hermon snow -> Jordan -> Kinneret -> pumps -> pipe -> gauge) and the checklist (2 shots, 89.3 s). Deterministic: every frame is a pure function of t.
   Hero = moving diagrams: the paper map with a dashed gold route, snow Hermon with flakes, the flowing Jordan line, the lake diorama with a rising level and an up arrow, the pump station with turning wheels,
   the thick pipe line drawn across the map, the gauge pole with its two red lines and a water slab that moves between them, the tap + glass, and a checklist board whose rows tick one by one.
   No people at all. NO text in code and no label file: only the digits of the gauge pole (same piece as film_d) and "?" signs. ASCII only.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur = 89.3, window.__caption(t), window.__heroBox, window.__sceneHash. */
import { THREE, sm, cl, frac, part, ell } from '../../../lib/toon3d/toon3d.js';
import * as K from '../../toldot08_kit/kit08.js';

const DUR = 89.3;
const O = [0, 47.3, 89.3];
const IDS = ['z1_journey', 'z2_checklist'];
const CUES = [[[13.8, 21.0], [21.6, 28.9], [29.5, 36.7], [37.3, 47.3]], []];
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
const lin = (t, a, b) => cl((t - a) / (b - a), 0, 1);
const blinkAt = (t, o) => frac(t / 3.3 + (o || 0)) < 0.045;
const shotOf = t => (t < O[1] ? 0 : 1);
const inCue = t => CUES[shotOf(t)].some(c => t >= c[0] && t < c[1]);
const _c = {}; const colr = h => _c[h] || (_c[h] = new THREE.Color(h));
const atXY = (L, u) => { const a = L.at(u), b = L.at(Math.min(1, u + 0.01)), c = L.at(Math.max(0, u - 0.01)); const dx = b[0] - c[0], dz = b[1] - c[1]; return { x: a[0], z: a[1], ang: Math.atan2(-dz, dx) }; };
const popS = (lt, a, b) => { const u = cl((lt - a) / (b - a), 0, 1); return u <= 0 ? 0.001 : (u < 0.6 ? sm(u / 0.6) * 1.2 : 1.2 - 0.2 * sm((u - 0.6) / 0.4)); };

const LAB = await (await fetch('../../_caps_toldot08/labels_z.json')).json();
function labelPlane(str, w, h, o) {
  o = Object.assign({ fg: '#1d2a44', bg: null, bd: '#1d2a44', pad: 0.06 }, o || {});
  const cw = 1024, ch = Math.max(64, Math.round(1024 * h / w)), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const c = cv.getContext('2d');
  if (o.bg) { const r = ch * 0.22; c.fillStyle = o.bg; c.strokeStyle = o.bd; c.lineWidth = 8; c.beginPath(); c.roundRect(5, 5, cw - 10, ch - 10, r); c.fill(); c.stroke(); }
  c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const words = String(str || '').split(/\s+/).filter(Boolean), maxW = cw * (1 - 2 * o.pad); let size = Math.round(ch * 0.7), lines = [];
  for (; size > 14; size -= 3) { c.font = 'bold ' + size + 'px Heebo, Arial, sans-serif'; lines = []; let cur = '';
    for (const wd of words) { const tr = cur ? cur + ' ' + wd : wd; if (!cur || c.measureText(tr).width <= maxW) cur = tr; else { lines.push(cur); cur = wd; } } lines.push(cur);
    if (lines.every(l => c.measureText(l).width <= maxW) && lines.length * size * 1.15 <= ch * (1 - 2 * o.pad)) break; }
  c.fillStyle = o.fg; lines.forEach((l, i) => c.fillText(l, cw / 2, ch / 2 + (i - (lines.length - 1) / 2) * size * 1.15));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.renderOrder = 12; return m;
}

/* ---------------------------------------------------------------- sky */
const SKYP = { clear: ['#5fb3e6', '#9fd4f2', '#e2f3fb'], dawn: ['#6fa8e0', '#f2c98a', '#ffe9c4'], night: ['#0d2250', '#17386e', '#2c5a92'] };
const SKY = K.makeSky({ palette: 'winter' }); scene.add(SKY);
function setSkyMix(A, B, k) { const u = SKY.material.uniforms; u.uTop.value.copy(colr(A[0])).lerp(colr(B[0]), k); u.uMid.value.copy(colr(A[1])).lerp(colr(B[1]), k); u.uHorz.value.copy(colr(A[2])).lerp(colr(B[2]), k); return '#' + u.uHorz.value.getHexString(); }

/* ---------------------------------------------------------------- stage positions */
const ST = { map: [0, 3600, 0], ps: [9000, 3600, 0], gp: [-9000, 3600, 0], z2: [0, 9000, 0] };

/* ---------------------------------------------------------------- the paper map */
const LAND_ASSETS = await K.loadLandMapAssets('./');
const LAND = K.makeLandMapA(LAND_ASSETS); scene.add(LAND.root); LAND.root.position.set(...ST.map);
const P = LAND.P, KC = LAND.KC, TOP = LAND.top, LY = LAND.Y;
const mwa = (x, y, z) => [ST.map[0] + x, ST.map[1] + y, ST.map[2] + z];
const tgm = (x, z) => mwa(x, TOP, z);
const HP = P(35.8, 33.33), RA = P(34.96, 32.09);
const SH = K.makeSnowHermon(); SH.root.position.set(HP[0], TOP, HP[1]); SH.root.scale.setScalar(0.62); LAND.root.add(SH.root);
const JPZ = [P(35.76, 33.27), P(35.67, 33.08), P(35.63, 32.92), P(35.6, 32.8)];
const JB = K.makeMapLineC(JPZ, 15, '#3fa3cc', LY + 2.6, { flow: true }); LAND.root.add(JB.root);
const JGP = K.makePathE(JPZ, { w: 9, y: LY + 2.2, dash: 36, fill: 0.62, step: 8 });
const RT = K.makePathE([P(35.78, 33.28), P(35.62, 32.95), [KC[0], KC[1]], P(35.35, 32.45), P(35.12, 32.25), RA], { w: 11, y: LY + 2.2, dash: 40, fill: 0.62, step: 8 }); LAND.root.add(RT.root);
const PLP = [[KC[0] - 20, KC[1] + 30], P(35.33, 32.5), P(35.14, 32.27), RA];
const PL = K.makeMapLineC(PLP, 20, '#2d86c8', LY + 3, { flow: true }); LAND.root.add(PL.root);
const FARR = [0, 1, 2, 3, 4].map(() => { const w = new THREE.Group(), a = K.makeFlowArrow({ len: 70, w: 18, col: '#1f7fc4' }); a.rotation.x = -Math.PI / 2; w.add(a); LAND.root.add(w); return w; });
const RAPIN = K.makeMarkA('c'); RAPIN.scale.setScalar(0.001); RAPIN.position.set(RA[0], LY + 60, RA[1]); LAND.root.add(RAPIN);

/* ---------------------------------------------------------------- the lake diorama */
const LAKE = K.makeKinneretLake({ level: 208.0, houses: false }); scene.add(LAKE.root);
const hills = K.makeHills({ a0: 0, a1: Math.PI * 2, dists: [6200, 8600, 11500], base: '#86b35e', haze: '#cfe0e6', h: 750, n: 14 }); hills.position.y = -60; scene.add(hills);
const LOUT = K.makePathE(K.KINNERET_OUTLINE, { closed: true, smooth: false, w: 38, y: 24, dash: 90, fill: 0.72 }); scene.add(LOUT.root);
const ARRUP = K.makeFlowArrow({ len: 380, w: 100, col: '#ffd42a' }); ARRUP.rotation.z = Math.PI / 2; scene.add(ARRUP);
const SUNB = K.makeSun({ r: 150 }); scene.add(SUNB);

/* ---------------------------------------------------------------- the pump station */
const PS = K.makePumpStationC(); PS.root.position.set(...ST.ps); scene.add(PS.root);
const PSG = new THREE.Mesh(new THREE.BoxGeometry(7000, 40, 3600), new THREE.MeshBasicMaterial({ color: '#b9d9a0' })); PSG.position.set(ST.ps[0], ST.ps[1] - 20, ST.ps[2] - 300); scene.add(PSG);
const PSARR = K.makeFlowArrow({ len: 300, w: 70, col: '#2f9be0' }); scene.add(PSARR);

/* ---------------------------------------------------------------- the gauge stage = the film_d lake cut-away tank (with its own gauge pole and red dashed lines) */
const TKG = K.makeLevelTank({ level: 211 }); TKG.root.position.set(...ST.gp); scene.add(TKG.root);
const GPUP = K.makeFlowArrow({ len: 300, w: 80, col: '#ffd42a' }), GPDN = K.makeFlowArrow({ len: 300, w: 80, col: '#2f9be0' }); GPUP.rotation.z = Math.PI / 2; GPDN.rotation.z = -Math.PI / 2; scene.add(GPUP, GPDN);

/* ---------------------------------------------------------------- the checklist stage */
const ZG = new THREE.Group(); ZG.position.set(...ST.z2); scene.add(ZG);
const TAP = K.makeTapC(); ZG.add(TAP.root);
const GLS = K.makeGlassA({ water: '#4fb6f0' }); GLS.root.scale.setScalar(1.6); GLS.root.position.set(0, 0, 40); ZG.add(GLS.root);
K.box(ZG, 1500, 900, 40, K.M('#f1ece0', '#d8d0c0'), [1500, 450, -170], 2.6, null, 6); K.box(ZG, 1500, 36, 380, K.M('#b98a58', '#c8a88e'), [1500, -18, 0], 2.6, null, 4);
const BD = new THREE.Group(); BD.position.set(760, 400, 60); ZG.add(BD);
K.box(BD, 1100, 560, 24, K.M('#fbf6e6', '#d8d4e4', 0), [0, 0, 0], 3, null, 4);
const ROWY = [220, 110, 0, -110, -220], CHK = [], BARS = [];
const ICONS = [];
{
  const holder = (i, o, s) => { const h = new THREE.Group(); h.position.set(-465, ROWY[i] - 55, 22); h.scale.setScalar(s * 1.15); h.add(o); BD.add(h); return h; };
  const sh2 = K.makeSnowHermon(); sh2.setCloud(0); ICONS.push(holder(0, sh2.root, 0.85));
  ICONS.push(holder(1, K.makeDropIconA(), 0.62));
  ICONS.push(holder(2, K.makePumpIcon(), 0.42));
  const pipe = new THREE.Group(); part(pipe, new THREE.CylinderGeometry(34, 34, 260, 20).rotateZ(Math.PI / 2), K.M('#6a7ea0', '#9aa6c0'), 2.4, [0, 70, 0]); part(pipe, new THREE.CylinderGeometry(26, 26, 200, 16), K.M('#6a7ea0', '#9aa6c0'), 2.4, [100, 150, 0]); ICONS.push(holder(3, pipe, 0.45));
  ICONS.push(holder(4, K.makeWarnSign(), 0.2));
  ROWY.forEach((y, i) => {
    const bar = K.box(BD, 250, 40, 8, K.M('#d9d3c4', '#c8c0b0', 0), [10, y, 20], 1.4, null, 3); BARS.push(bar);
    const bar2 = K.box(BD, 170, 20, 8, K.M('#e6e0d2', '#d0c8b8', 0), [-30, y - 38, 20], 0, null, 2); BD.add(bar2); BARS.push(bar2);
    const h = new THREE.Group(); h.position.set(485, y, 40); h.scale.setScalar(0.34); const m = K.makeMarkA('c'); h.add(m); BD.add(h); CHK.push(m);
  });
}
const STREAM = K.makeMapLineC([[-760, 230], [-300, 215], [200, 245], [700, 215], [1250, 230]], 90, '#3fa3cc', 3, { flow: true }); ZG.add(STREAM.root);
const QM = labelPlane(LAB.z1_question, 900, 330, { bg: '#ffffff' }); scene.add(QM);
const QZ2 = labelPlane(LAB.z2_question, 1600, 280, { fg: '#e6a817', bg: 'rgba(10,28,70,0.55)', bd: '#e6a817' }); scene.add(QZ2); const QZ = QZ2;
const PLC = [LAB.z1_place1, LAB.z1_place2, LAB.z1_place3, LAB.z1_place4].map(l => { const m = labelPlane(l, 320, 100, { bg: '#fff3a0', bd: '#d6232a' }); m.visible = false; scene.add(m); return m; });
const PLPOS = [[HP[0], HP[1]], P(35.63, 32.92), [KC[0], KC[1]], RA].map(p => [ST.map[0] + p[0], ST.map[1] + TOP + 150, ST.map[2] + p[1]]);
const CAPS = labelPlane(LAB.z2_caption, 1000, 170, { bg: '#ffffff' }); CAPS.position.set(ST.z2[0] + 640, ST.z2[1] + 25, ST.z2[2] + 330); CAPS.visible = false; scene.add(CAPS);
const LINES = [1, 2, 3, 4, 5].map((n, i) => { const m = labelPlane(LAB['z2_line' + n], 760, 100, { fg: '#1d2a44' }); m.position.set(0, ROWY[i], 22); m.visible = false; BD.add(m); return m; });
const PAN = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: false }));
{ const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'), g = c.createRadialGradient(128, 128, 20, 128, 128, 128); g.addColorStop(0, 'rgba(6,16,44,0.78)'); g.addColorStop(0.55, 'rgba(6,16,44,0.52)'); g.addColorStop(1, 'rgba(6,16,44,0.14)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  PAN.material.map = new THREE.CanvasTexture(cv); PAN.renderOrder = 20; PAN.frustumCulled = false; }
cam.add(PAN); PAN.position.set(0, 0, -50); PAN.scale.setScalar(50 * Math.tan(18 * Math.PI / 180) * 1.1); PAN.scale.x *= 16 / 9; PAN.visible = false;

/* ---------------------------------------------------------------- the cast */
function makeDrop(kind, sc) {
  const d = K.makeTipa({ kind }); d.root.scale.setScalar(sc);
  return { drop: d, root: d.root, pose: po => { d.pose(Object.assign({}, po)); if (po.raw) po.raw.forEach((r, i) => { if (r) d.arms[i].rotation.set(-d.arms[i].userData.sz * (r.out || 0), -d.arms[i].userData.sz * (r.ry || 0), r.fw || 0); }); }, face: d.face };
}
const GD = makeDrop('big', 0.98), TP = makeDrop('tipa', 0.94), TPS = makeDrop('sea', 0.94);
scene.add(GD.root); scene.add(TP.root); scene.add(TPS.root);
const NONE = () => ({ vis: false, po: { t: 0 }, f: { expr: 'neutral' }, sc: 1 });
const act = (po, f, sc) => ({ vis: true, po, f, sc: sc || 1 });
let CT = 0;
const po = (w, yaw, arms, o) => Object.assign({ t: CT, x: w[0], y: w[1], z: w[2], yaw, arms }, o || {});
const talkCue = sd => (inCue(CT) && frac(CT * 0.8 + sd) < 0.7) ? 'AEOX'[Math.floor(CT * 8 + sd * 5) % 4] : undefined;
const fc = (expr, o, spk, look) => { const f = { expr, blink: blinkAt(CT, o || 0.15), look: look || [0, 0] }; if (spk != null) { const tk = talkCue(spk); if (tk) f.talk = tk; } return f; };
const floatOpt = { float: 1, feet: false, shadow: false };
const actS = (p, f, sx, b, hf, o) => Object.assign(act(p, f, 1), { scr: [sx, b], hf }, o || {});
const actW = (p, f, hf, o) => Object.assign(act(p, f, 1), { hf }, o || {});
const P0 = (arms, o) => po([0, 0, 0], 0, arms, o);
const hopO = (t, k, h) => ({ walk: 1, ph: t * k, hopH: h });

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
const camOne = (tg, D, az, el, fov) => camKeys(0, [[0, tg, D, az, el, fov], [99, tg, D, az, el, fov]]);
const tmp = new THREE.Vector3(), QY = new THREE.Quaternion(), YAX = new THREE.Vector3(0, 1, 0);
const place = (o, dx, dy, dz) => { o.position.copy(cam.position).add(tmp.set(dx, dy, dz).applyQuaternion(cam.quaternion)); o.quaternion.copy(cam.quaternion); };

/* ================================================================ per-frame state */
const WARM = { on: false };
const V0 = () => ({ map: false, lake: false, ps: false, gp: false, z2: false });
const HIDE = [SUNB, LOUT.root, ARRUP, QM, QZ, ...PLC, CAPS, PSARR, GPUP, GPDN, RAPIN, ...FARR, RT.root, JB.root, PL.root, SH.root];
function resetAll() {
  HIDE.forEach(o => { o.visible = false; });
  LAND.setHula(0); LAND.setPin(0); LAND.setDim(0); LAND.setOutline(0); LAND.setGlow(0, 0); LAND.setGlow(1, 0); LAND.pondPulse(0);
  PAN.visible = false; hills.visible = false;
}
function frame(tl) {
  const t = Math.max(0, Math.min(DUR, tl)); CT = t;
  const si = shotOf(t), lt = t - O[si];
  const V = V0(), X = { cam: null, rel: [], sky: 'clear' }, C = { G: NONE(), T: NONE(), S: NONE() };
  resetAll();
  [s0, s1][si](t, lt, V, X, C);
  return finish(t, lt, si, V, X, C);
}

/* ---------------------------------------------------------------- z1 : the whole journey */
function s0(t, lt, V, X, C) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const gG = (arms, ex, o) => actS(P0(arms), fc(ex || 'happy', 0.15, 0, [0.3, 0]), -0.80, -0.56, 0.36, o);
  const hop = k => ({ hop: 0.04 * Math.abs(Math.sin(t * k)) });
  if (lt < 13.8) {
    V.map = true; LAND.setDim(0.9 * (1 - U(lt, 0.4, 4.6)));
    const hcx = HP[0], hcz = HP[1];
    if (lt < 6) X.cam = camKeys(lt, [[0, tgm(60, -1000), 3300, 0, 0.8, 36], [6, tgm(60, -1100), 2800, 0, 0.78, 36]]);
    else X.cam = camKeys(lt, [[6, tgm(60, -1100), 2800, 0, 0.78, 36], [13.8, tgm(hcx - 150, hcz + 150), 3000, 0, 0.74, 36]]);
    if (lt >= 5.6) { RT.root.visible = true; RT.setLen(RT.len * U(lt, 6.4, 13.4)); LAND.setPin(U(lt, 6.4, 7.4)); }
    if (lt >= 6.2) { QM.visible = true; X.rel.push([QM, -0.5, 0.4, 0.26, 330, popS(lt, 6.2, 6.9)]); }
    { const sh = lt >= 6.2 ? [0, 1, 2, 3] : []; sh.forEach(i => { PLC[i].visible = true; }); }
    if (lt < 6) { C.G = gG('down'); C.T = actS(P0('wave'), fc('happy', 0.5), 0.78, -0.56, 0.28, hop(3)); }
    else { C.G = gG('wave'); C.T = actS(P0('down'), fc('curious', 0.5, null, [-0.4, 0.3]), 0.78, -0.56, 0.28, hop(2.4)); }
  } else if (lt < 21.6) {
    V.map = true; SH.root.visible = true; SH.setFlakes(1); SH.setCloud(1); SH.snow(t);
    const k = U(lt, 15.0, 19.4); JB.root.visible = true; JB.setDraw(k); JB.update(t); RT.root.visible = true; RT.setLen(RT.len * 0.06);
    FARR.forEach((a, i) => { const u = frac(t * 0.16 + i / 5) * k, p = atXY(JB, u); a.visible = i < 4 && k > 0.4; a.position.set(p.x, LY + 6, p.z); a.rotation.y = p.ang; });
    X.cam = camKeys(lt, [[13.8, tgm(HP[0] - 150, HP[1] + 150), 3000, 0, 0.74, 36], [16, tgm(HP[0] - 20, HP[1] + 220), 1250, 0.05, 0.6, 34], [21.6, tgm(HP[0] - 60, HP[1] + 300), 1150, 0.18, 0.6, 34]]);
    PLC[0].visible = true; PLC[1].visible = k > 0.3;
    C.G = gG('point', 'happy', { yawOff: 0.5 });
    C.T = actW(po(mwa(HP[0] + 12, TOP + 66, HP[1] + 48), 0.2, 'wave', { shadow: false }), fc('happy', 0.5), 0.12);
  } else if (lt < 29.5) {
    V.lake = true; const L = lerp(208.0, 209.4, U(lt, 22.0, 28.0)); LAKE.setLevel(L);
    const ol = U(lt, 22.2, 26.5); LOUT.root.visible = true; LOUT.setLen(LOUT.len * ol); SUNB.visible = false;
    ARRUP.visible = true; ARRUP.position.set(-250, LAKE.waterY() + 120 + 120 * Math.sin(t * 2.4), 650);
    X.cam = camKeys(lt, [[21.6, [0, -150, -150], 3500, -0.3, 0.42, 36], [29.5, [0, -150, -150], 3000, 0.35, 0.36, 36]]);
    const fl = LAKE.float(380, 80, 200);
    C.G = gG('wave', 'happy', { yawOff: 0.2 });
    C.T = actW(po([380, fl.y + 6, 80], -1.2, 'up', floatOpt), fc('cheering', 0.5), 0.12);
  } else if (lt < 33.2) {
    V.ps = true; PS.setSpin(t * 3.2); PS.setGlow(0.5 + 0.5 * pulse);
    PSARR.visible = true; PSARR.position.set(ST.ps[0] - 420 + 60 * frac(t * 0.7), ST.ps[1] + 90, ST.ps[2] + 205); PSARR.rotation.set(0, 0, 0);
    X.cam = camKeys(lt, [[29.5, [ST.ps[0], ST.ps[1] + 330, 0], 2000, 0.25, 0.14, 34], [33.2, [ST.ps[0], ST.ps[1] + 330, 0], 1500, 0.1, 0.16, 34]]);
    C.G = gG('point', 'happy', { yawOff: 0.5 });
    C.T = actW(po([ST.ps[0] + 360, ST.ps[1] + 30, ST.ps[2] + 230], -0.1, 'wave', hopO(t, 1.8, 24)), fc('cheering', 0.5), 0.16);
  } else if (lt < 37.3) {
    V.map = true; const k = U(lt, 33.8, 36.4);
    PL.root.visible = true; PL.setDraw(k); PL.update(t); RT.root.visible = true; RT.setLen(RT.len); LAND.setGlow(0, 0.4 + 0.4 * pulse);
    const hd = PL.at(k); const hx = hd[0], hz = hd[1];
    FARR.forEach((a, i) => { const u = frac(t * 0.18 + i / 5) * k, p = atXY(PL, u); a.visible = k > 0.3; a.position.set(p.x, LY + 7, p.z); a.rotation.y = p.ang; });
    X.cam = camKeys(lt, [[33.2, tgm(KC[0] - 150, KC[1] + 150), 1700, 0, 0.74, 36], [37.3, tgm((KC[0] + RA[0]) / 2 - 120, (KC[1] + RA[1]) / 2), 2300, 0, 0.78, 36]]);
    if (k > 0.97) { RAPIN.visible = true; RAPIN.scale.setScalar(0.001); }
    PLC[2].visible = true; PLC[3].visible = k > 0.9;
    C.G = actW(po(mwa(KC[0] + 70, LY + 2, KC[1] + 40), 0.3, 'point'), fc('happy', 0.15, 0), 0.2);
    C.T = actW(po(mwa(hx, LY + 8, hz), -0.3, 'up', Object.assign({ shadow: false }, hopO(t, 2.2, 14))), fc('cheering', 0.5), 0.11);
  } else {
    V.gp = true; const g0 = ST.gp;
    const Lv = 211 - 2.0 * Math.sin((lt - 38.6) * 0.75) * U(lt, 38.6, 39.2);
    TKG.setLevel(Lv); TKG.setRed(0, U(lt, 39.5, 41)); TKG.setRed(1, U(lt, 40.5, 42)); TKG.update(t);
    TKG.root.scale.setScalar(Math.max(0.001, popS(lt, 37.3, 38.4)));
    const yy = g0[1] + (209 - Lv) * 300;
    GPUP.visible = Math.cos((lt - 38.6) * 0.75) > 0.25 && lt > 38.8; GPDN.visible = Math.cos((lt - 38.6) * 0.75) < -0.25 && lt > 38.8;
    GPUP.position.set(g0[0] + 420, yy - 80, g0[2] + 150); GPDN.position.set(g0[0] + 420, yy + 80, g0[2] + 150);
    X.cam = camOne([g0[0] - 1000, g0[1] - 900, g0[2]], 4600, 0.04, 0.08, 36);
    C.G = gG('point', 'happy', { yawOff: 0.4 });
    C.T = actW(po([g0[0] - 215, yy - 40, g0[2] + 175], 0, 'wave', {}), fc('cheering', 0.5), 0.14);
  }
}

/* ---------------------------------------------------------------- z2 : the checklist */
function s1(t, lt, V, X, C) {
  V.z2 = true; X.sky = 'night';
  const z = ST.z2, pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const TK = [6.6, 9.0, 11.4, 13.8, 16.2]; // five ticks, stagger 2.4
  const ticks = TK.map(a => U(lt, a, a + 0.5));
  CHK.forEach((m, i) => m.userData.pop(ticks[i])); LINES.forEach((m, i) => { m.visible = lt >= TK[i] - 0.2; }); BARS.forEach(b => { b.visible = false; });
  CAPS.visible = lt > TK[4] + 1.0 && lt < 36.5;
  const upto = TK.filter(a => lt >= a).length, last = upto ? TK[upto - 1] : -9;
  const hopT = lt >= TK[0] && lt < 24 ? 36 * Math.abs(Math.sin(cl((lt - last) / 0.9, 0, 1) * Math.PI)) * (lt - last < 0.9 ? 1 : 0) : 0;
  ICONS.forEach((h, i) => { h.scale.setScalar(h.userData.s0 || (h.userData.s0 = h.scale.x)); const pk = 1 + 0.18 * Math.sin(cl((lt - TK[i]) / 0.6, 0, 1) * Math.PI); h.scale.setScalar(h.userData.s0 * pk); });
  STREAM.root.visible = lt > TK[4] - 0.4 && lt < 36; STREAM.update(t); STREAM.setDraw(U(lt, TK[4] - 0.3, TK[4] + 1.6));
  const outro = U(lt, 30, 31.5);
  const water = U(lt, 31.5, 38.5);
  GLS.setFill(0.1 + 0.8 * water); const wtop = 1.6 * (12 + 200 * (0.1 + 0.8 * water));
  TAP.setOpen(lt > 30.5 ? 1 : 0); TAP.setStream(430, wtop, lt > 30.8 ? 16 : 0);
  if (lt < 6) { QZ.visible = true; X.rel.push([QZ, 0, 0.8, 0.17, 280, popS(lt, 0.4, 1.4) * (lt > 4.4 ? 1 - U(lt, 4.4, 5.4) : 1)]); }
  const TG0 = [z[0] + 380, z[1] + 250, z[2]];
  if (lt < 38.5) X.cam = camKeys(lt, [[0, TG0, 2000, 0, 0.08, 36], [6, TG0, 1700, 0.02, 0.08, 36], [38.5, TG0, 1700, -0.02, 0.08, 36]], 0);
  else X.cam = camKeys(lt, [[38.5, TG0, 1700, -0.02, 0.08, 36], [42, [z[0] + 400, z[1] + 300, z[2]], 2300, 0, 0.1, 36]], 0);
  const vig = U(lt, 36.5, 39.0) * 0.8; if (vig > 0.01) { PAN.visible = true; PAN.material.opacity = vig; }
  if (lt < 39) {
    const wave = lt >= 24 && lt < 30 ? 'up' : (lt >= 30 ? 'point' : 'down');
    C.G = actS(P0(wave), fc('happy', 0.15, lt >= 30 ? 0 : null, [0.5, 0]), -0.86, -0.2, 0.34, { yawOff: 0.3 });
    if (lt < 33.0 || lt >= 34.6) { const inG = lt >= 34.6; C.T = actS(P0(inG ? 'up' : 'down'), fc(upto > 0 || inG ? 'cheering' : 'curious', 0.5, null, [0.2, 0.5]), -0.62, -0.28, 0.17, { hop: hopT / 500 }); if (inG) C.T.wp = [z[0], z[1] + wtop + 30, z[2] + 40]; }
    else { const dp = U(lt, 33.0, 34.6); C.T = actS(P0('wave'), fc('cheering', 0.5), -0.62, -0.28, 0.17, {}); C.T.wp = [z[0], z[1] + wtop + 40, z[2] + 40]; C.T.mix = dp; }
  } else {
    C.G = actS(P0('wave'), fc('happy', 0.15), -0.78, -0.5, 0.4, {});
    C.T = actS(P0('wave'), fc('cheering', 0.5), 0.78, -0.5, 0.3, { hop: 0.03 * Math.abs(Math.sin(t * 3)) });
  }
}

/* ---------------------------------------------------------------- common finish */
function finish(t, lt, si, V, X, C) {
  window.__lastC = C; if (WARM.on) return;
  LAND.root.visible = V.map; LAKE.root.visible = V.lake; hills.visible = V.lake; LOUT.root.visible = V.lake && LOUT.root.visible;
  PS.root.visible = V.ps; PSG.visible = V.ps; PSARR.visible = V.ps && PSARR.visible;
  TKG.root.visible = V.gp; GPUP.visible = V.gp && GPUP.visible; GPDN.visible = V.gp && GPDN.visible;
  ZG.visible = V.z2;
  if (V.map) LAND.update(t);
  if (V.lake) LAKE.update(t);
  let horz;
  if (X.sky === 'night' || V.gp) horz = setSkyMix(SKYP.night, SKYP.night, 0); else if (V.map && lt < 14 && si === 0) horz = setSkyMix(SKYP.dawn, SKYP.clear, U(lt, 0, 14)); else horz = setSkyMix(SKYP.clear, SKYP.clear, 1);
  LAKE.setHorizon(horz);
  const c = X.cam;
  if (V.lake && c.p[1] < 3000) c.p[1] = Math.max(c.p[1], LAKE.heightAt(c.p[0], c.p[2]) + 150);
  cam.fov = c.fov; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l); cam.updateMatrixWorld(true); SKY.position.copy(cam.position);
  const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
  X.rel.forEach(([o, sx, sy, hfr, bh, k, dz]) => { dz = dz || 320; const hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; place(o, sx * hw, sy * hh, -dz); o.scale.setScalar(Math.max(0.001, hfr * 2 * hh / bh * k)); });
  if (SUNB.visible) { SUNB.quaternion.copy(cam.quaternion); SUNB.userData.update(t); }
  if (QM.visible) QM.quaternion.copy(cam.quaternion);
  PLC.forEach((m, i) => { if (!m.visible) return; const q = new THREE.Vector3(...PLPOS[i]), d = q.distanceTo(cam.position); m.position.copy(q); m.quaternion.copy(cam.quaternion); m.scale.setScalar(d * 0.17 / 320); });
  CAPS.quaternion.identity();
  if (RAPIN.visible) { const rk = U(lt, 36.4, 37.0); RAPIN.scale.setScalar(Math.max(0.001, 0.4 * rk)); }
  const ds = [[GD, C.G], [TP, C.T], [TPS, C.S]];
  ds.forEach(([o, cc]) => { o.root.visible = cc.vis; if (!cc.vis) return;
    const base = o === GD ? 0.98 : 0.94, H0 = o.drop.height || 244; let po0 = cc.po, sc = cc.sc;
    if (cc.wp) { const v = new THREE.Vector3(...cc.wp).project(cam), m = cc.mix == null ? 1 : cc.mix; cc.scr = [lerp(cc.scr[0], v.x / 0.95, m), lerp(cc.scr[1], v.y, m)]; }
    if (cc.scr) { const dz = 320, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; sc = 0.86 * cc.hf * 2 * hh / (H0 * base); const p = new THREE.Vector3(cc.scr[0] * 0.95 * hw, (cc.scr[1] + (cc.hop || 0)) * hh, -dz).applyQuaternion(cam.quaternion).add(cam.position);
      po0 = Object.assign({}, cc.po, { x: p.x, y: p.y, z: p.z, yaw: Math.atan2(-(cam.position.z - p.z), cam.position.x - p.x) + (cc.yawOff || 0) }); }
    else if (cc.hf) { const p = new THREE.Vector3(cc.po.x, cc.po.y, cc.po.z).sub(cam.position); sc = cc.hf * 2 * p.dot(fwd) * Math.tan(cam.fov * Math.PI / 360) / (H0 * base); }
    o.root.scale.setScalar(Math.max(0.0001, sc * base)); o.pose(po0); if (cc.scr) o.root.quaternion.copy(cam.quaternion).multiply(QY.setFromAxisAngle(YAX, -Math.PI / 2 + (cc.yawOff || 0))); o.face.set(cc.f); });
  renderer.render(scene, cam);
}

/* ---------------------------------------------------------------- face warm-up + contract */
async function warm() {
  const seen = new Set(), jobs = [];
  WARM.on = true; for (let k = 0; k <= DUR * 30; k++) { frame(k / 30); for (const [o, c] of [[GD, window.__lastC.G], [TP, window.__lastC.T], [TPS, window.__lastC.S]]) { if (!c.vis) continue; const key = o.root.uuid + JSON.stringify(c.f); if (!seen.has(key)) { seen.add(key); jobs.push([o, c.f]); } } }
  WARM.on = false; for (const [o, f] of jobs) await o.face.set(f);
  return jobs.length;
}
const _hb = new THREE.Box3(), _hv = new THREE.Vector3();
window.__heroBox = t => { const ids = [TP, GD, TPS].filter(o => o.root.visible); if (!ids.length) return null; _hb.makeEmpty(); ids.forEach(o => { o.root.updateMatrixWorld(true); _hb.expandByObject(o.drop.inner); });
  const mn = [1e9, 1e9], mx = [-1e9, -1e9]; let behind = true; for (const x of [_hb.min.x, _hb.max.x]) for (const y of [_hb.min.y, _hb.max.y]) for (const z of [_hb.min.z, _hb.max.z]) { _hv.set(x, y, z).project(cam); if (_hv.z < 1) behind = false; mn[0] = Math.min(mn[0], _hv.x); mn[1] = Math.min(mn[1], _hv.y); mx[0] = Math.max(mx[0], _hv.x); mx[1] = Math.max(mx[1], _hv.y); }
  return { visible: !behind && mx[0] > -1 && mn[0] < 1 && mx[1] > -1 && mn[1] < 1, behindCamera: behind, heightFrac: (mx[1] - mn[1]) / 2, bottomFrac: (1 - (mn[1] + 1) / 2), box: [mn, mx] }; };
window.__sceneHash = () => { let h = 0; scene.traverse(o => { if (o.visible !== false) { const e = o.matrixWorld.elements; h = (h * 31 + Math.round(e[12] * 10) + Math.round(e[13] * 10) * 7 + Math.round(e[14] * 10) * 13 + Math.round(e[0] * 100) * 3) | 0; } }); return h + '|' + cam.position.x.toFixed(2) + ',' + cam.position.y.toFixed(2) + ',' + cam.position.z.toFixed(2); };
window.__dur = DUR; window.__HQ = HQ; window.__errors = []; window.__T0 = window.__T0 != null ? window.__T0 : 0;
window.__shots = IDS.map((id, i) => ({ id, index: i, start: O[i], end: O[i + 1], dur: +(O[i + 1] - O[i]).toFixed(2) }));
window.__caption = t => { const si = shotOf(t); const i = CUES[si].findIndex(c => t >= c[0] && t < c[1]); return i < 0 ? null : IDS[si] + '_c' + (i + 1); };
window.__o = { cam, scene, GD, TP };
const _frame = frame;
window.__lastC = { G: NONE(), T: NONE(), S: NONE() };
window.__seek = t => { try { _frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
(async () => {
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm(); for (const tt of [0.5, 7, 14.5, 22.5, 30.5, 34.5, 38.5, 47.8, 55, 80, 88]) _frame(tt); _frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
