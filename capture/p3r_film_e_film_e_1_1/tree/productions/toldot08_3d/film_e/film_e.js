/* film_e - "the Kinneret in the Torah and in Tiberias" - the whole film (7 shots, 237.0 s). Deterministic: every frame is a pure function of t.
   Hero = moving diagrams: the paper map with a gold dashed border line, parchment cards (abstract text lines, no letters), a compass, the Jordan with flowing water,
   the lake diorama with hanging name tags, the walled town of Tiberias (houses only), a scroll carried by a gull, an opening book, a cave mouth in the hills,
   the plan sketch with two gates, a grey doubt area, a magnifier, a green sweep and a short gold path. The drops (guide = makeTipa big, student = makeTipa tipa) are talking objects.
   No people at all. No Hebrew in code, no years on screen (no matching key in years.json). ASCII only.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur = 237.0, window.__caption(t), window.__heroBox, window.__sceneHash. */
import { THREE, sm, cl, frac } from '../../../lib/toon3d/toon3d.js';
import * as K from '../../toldot08_kit/kit08.js';

const DUR = 237.0;
const O = [0, 45.0, 74.0, 113.0, 145.0, 175.0, 216.0, 237.0];
const IDS = ['e1_border_in_torah', 'e2_kinneret_to_dead_sea', 'e3_many_names', 'e4_tiberias', 'e5_rashbi_comes', 'e5b_the_short_way', 'e6_recap'];
const CUES = [
  [[5.6, 11.1], [11.7, 18.9], [19.5, 26.1], [26.7, 32.2], [32.8, 40.0]],
  [[46.2, 52.8], [53.4, 61.3], [61.9, 69.8]],
  [[75.2, 81.8], [82.4, 87.9], [88.5, 94.3], [94.9, 100.8], [101.4, 106.9]],
  [[114.4, 121.6], [122.2, 130.2], [130.8, 137.3], [137.9, 143.8]],
  [[146.2, 154.1], [154.7, 162.0], [162.6, 171.2]],
  [[176.2, 182.8], [183.4, 192.6], [193.2, 198.7], [199.3, 205.9], [206.5, 212.4]],
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
const lin = (t, a, b) => cl((t - a) / (b - a), 0, 1);
const blinkAt = (t, o) => frac(t / 3.3 + (o || 0)) < 0.045;
const shotOf = t => { for (let i = 0; i < 7; i++) if (t < O[i + 1]) return i; return 6; };
const inCue = t => CUES[shotOf(t)].some(c => t >= c[0] && t < c[1]);
const kfl = (A, t) => { if (t <= A[0][0]) return A[0][1]; for (let i = 1; i < A.length; i++) if (t <= A[i][0]) return lerp(A[i - 1][1], A[i][1], (t - A[i - 1][0]) / (A[i][0] - A[i - 1][0])); return A[A.length - 1][1]; };
const _c = {}; const colr = h => _c[h] || (_c[h] = new THREE.Color(h));
/* the label strings come from labels_e.json at runtime (no Hebrew in code) */
const LAB = await (await fetch('../../_caps_toldot08/labels_e.json')).json();
function txtTex(str, w, h, o) {
  o = Object.assign({ fg: '#1d2a44', pad: 0.05, bold: true, lh: 1.12 }, o || {});
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const words = String(str || '').split(/\s+/).filter(Boolean), maxW = w * (1 - 2 * o.pad); let size = Math.round(h * 0.8), lines = [];
  for (; size > 16; size -= 4) { c.font = (o.bold ? 'bold ' : '') + size + 'px Heebo, Arial, sans-serif'; lines = []; let cur = '';
    for (const wd of words) { const tr = cur ? cur + ' ' + wd : wd; if (!cur || c.measureText(tr).width <= maxW) cur = tr; else { lines.push(cur); cur = wd; } } lines.push(cur);
    if (lines.every(l => c.measureText(l).width <= maxW) && lines.length * size * o.lh <= h * (1 - 2 * o.pad)) break; }
  c.fillStyle = o.fg; lines.forEach((l, i) => c.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * o.lh));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; return t;
}
const revMat = tex => new THREE.ShaderMaterial({ side: THREE.DoubleSide, transparent: true, depthWrite: false, uniforms: { uR: { value: 1 }, uM: { value: tex } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform float uR; uniform sampler2D uM; varying vec2 vUv; void main(){ vec4 c = texture2D(uM, vUv); if (vUv.x < 1.0 - uR) discard; gl_FragColor = c; }' });
function textPlane(parent, str, w, h, x, y, z, o) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), revMat(txtTex(str, 1024, Math.max(64, Math.round(1024 * h / w)), o))); m.position.set(x, y, z); m.renderOrder = 10; parent.add(m); return m; }
function setupCard(PC, hiKey, refKey, o) {
  o = Object.assign({ gw: 0.78, gh: 0.46, tw: 0.76, th: 0.42, ty: 0.06, fg: '#2a1c10' }, o || {}); const W = PC.W, H = PC.H;
  PC.glow.scale.set(W * o.gw, H * o.gh, 1); PC.glow.position.set(0, H * o.ty, 7);
  PC.hi = textPlane(PC.body, LAB[hiKey], W * o.tw, H * o.th, 0, H * o.ty, 9, { fg: o.fg });
  if (refKey) PC.rf = textPlane(PC.body, LAB[refKey], W * 0.56, H * 0.13, 0, -H / 2 + 105, 9, { fg: '#5a3a1a' });
  PC.setReveal = k => { PC.hi.material.uniforms.uR.value = cl(k * 1.25, 0, 1); PC.hi.visible = k > 0.001; if (PC.rf) { PC.rf.material.uniforms.uR.value = cl((k - 0.75) * 4, 0, 1); PC.rf.visible = k > 0.76; } };
  PC.setReveal(0);
}

/* ---------------------------------------------------------------- sky */
const SKYP = { dusk: ['#3d4f8c', '#c88b86', '#f3bb82'], clear: ['#5fb3e6', '#9fd4f2', '#e2f3fb'], dawn: ['#6fa8e0', '#f2c98a', '#ffe9c4'], night: ['#0d2250', '#17386e', '#2c5a92'] };
const SKY = K.makeSky({ palette: 'winter' }); scene.add(SKY);
function setSkyMix(A, B, k) { const u = SKY.material.uniforms; u.uTop.value.copy(colr(A[0])).lerp(colr(B[0]), k); u.uMid.value.copy(colr(A[1])).lerp(colr(B[1]), k); u.uHorz.value.copy(colr(A[2])).lerp(colr(B[2]), k); return '#' + u.uHorz.value.getHexString(); }

/* ---------------------------------------------------------------- the paper map */
const ST = { map: [0, 3600, 0], ts: [-9000, 3600, 0] };
const LAND_ASSETS = await K.loadLandMapAssets('./');
const LAND = K.makeLandMapA(LAND_ASSETS); scene.add(LAND.root); LAND.root.position.set(...ST.map);
const P = LAND.P, KC = LAND.KC, TOP = LAND.top, LY = LAND.Y, DSC = LAND.dead.c;
const mwa = (x, y, z) => [ST.map[0] + x, ST.map[1] + y, ST.map[2] + z];
const tgm = (x, z) => mwa(x, TOP, z);
const geoK = LAND_ASSETS.geo.lakes['Sea of Galilee'][0];
const kEast = geoK.slice(0, 11).map(p => P(p[0], p[1]));
const BP = [[34.25, 31.3], [34.45, 31.75], [34.7, 32.2], [34.95, 32.65], [35.1, 33.05], [35.35, 33.25], [35.62, 33.28], [35.68, 33.05]].map(p => P(p[0], p[1])).concat(kEast)
  .concat([[35.62, 32.55], [35.57, 32.1], [35.55, 31.7], [35.52, 31.4], [35.5, 31.05], [35.15, 30.7], [34.75, 30.55], [34.4, 30.8]].map(p => P(p[0], p[1])));
const BORD = K.makePathE(BP, { closed: true, w: 12, y: LY + 2.2, dash: 40, fill: 0.62, step: 8 }); BORD.root.position.set(...ST.map); scene.add(BORD.root);
const dNE = BORD.nearest(kEast[0][0], kEast[0][1]), dSE = BORD.nearest(kEast[10][0], kEast[10][1]);
const JP = [[35.5994, 32.7178], [35.58, 32.6], [35.56, 32.45], [35.55, 32.25], [35.545, 32.05], [35.54, 31.9], [35.545, 31.78]].map(p => P(p[0], p[1]));
const JG = K.makePathE(JP, { w: 11, y: LY + 2.2, dash: 36, fill: 0.62, step: 8 }); JG.root.position.set(...ST.map); scene.add(JG.root);
const JB = K.makeMapLineC(JP, 15, '#3fa3cc', LY + 2.6, { flow: true }); JB.root.position.set(...ST.map); scene.add(JB.root);
const FARR = [0, 1, 2, 3].map(() => { const w = new THREE.Group(), a = K.makeFlowArrow({ len: 80, w: 20, col: '#1f7fc4' }); a.rotation.x = -Math.PI / 2; w.add(a); scene.add(w); return w; });
const SPATH = K.makePathE([[34.9, 29.6], [35.1, 30.6], [35.0, 31.6], [35.3, 32.3], [35.52, 32.79]].map(p => P(p[0], p[1])), { w: 9, y: LY + 2.2, dash: 34, fill: 0.62, step: 8 }); SPATH.root.position.set(...ST.map); scene.add(SPATH.root);
const WIPE = new THREE.Mesh(new THREE.PlaneGeometry(420, 4600).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffe9a8', transparent: true, opacity: 0.5, depthWrite: false })); WIPE.renderOrder = 15; scene.add(WIPE);
const COMP = K.makeCompassE({ r: 130 }); scene.add(COMP.root);
const CHIP = K.makeChipE(); scene.add(CHIP); { CHIP.children[CHIP.children.length - 1].visible = false; const m = new THREE.Mesh(new THREE.PlaneGeometry(214, 70), new THREE.MeshBasicMaterial({ map: txtTex(LAB.e1_kedma, 1024, 335), transparent: true, depthWrite: false })); m.position.set(0, -6, 8); m.renderOrder = 11; CHIP.add(m); }
const SEF = K.makeSefarimE(); SEF.root.scale.setScalar(2.2); SEF.root.position.set(...mwa(1330, -20, 300)); SEF.root.rotation.y = -0.4; scene.add(SEF.root);
const SEF2 = K.makeSefarimE({ n: 5, seed: 7 }); SEF2.root.scale.setScalar(1.4); scene.add(SEF2.root);
const PC1 = K.makeParchmentE({ lines: 0, seed: 4 }), PC2 = K.makeParchmentE({ lines: 0, seed: 9 }), PC3 = K.makeParchmentE({ lines: 0, seed: 12, w: 760, h: 420 }); scene.add(PC1.root, PC2.root, PC3.root);
setupCard(PC1, 'e1_highlight', 'e1_ref'); setupCard(PC2, 'e5_verse', null, { gw: 0.0, gh: 0.0, tw: 0.84, th: 0.66, ty: 0.0 }); setupCard(PC3, 'e5_years', null, { gw: 0.0, gh: 0.0, tw: 0.8, th: 0.56, ty: 0.0, fg: '#9a6400' });
const SCR = K.makeScrollIconE(); scene.add(SCR.root);
const SCR2 = K.makeScrollIconE(); scene.add(SCR2.root);
const QM = K.numPlane('?', 260, 330, { fg: '#d6232a', k: 0.95 }); scene.add(QM);
const mkTags = (n, acc, pole) => Array.from({ length: n }, (_, i) => { const t = K.makeNameTagE({ accent: acc ? acc[i] : '#2f9be0', pole: pole || 520 }); t.root.visible = false; scene.add(t.root); return t; });
const TAGM = mkTags(3), TAGL = mkTags(4, null, 400), TAGV = mkTags(1, ['#2fb35a'], 200), TAGE = mkTags(3, ['#2f9be0', '#e0a020', '#8a5ac0'], 280), TAGT = mkTags(5, ['#e0a020', '#e0322a', '#2fb35a', '#9aa0a8', '#ffc928'], 300);
const tagTx = (tg, nk, sk) => { const hs = !!sk, nw = tg.W * 0.9; tg.setTexts(txtTex(LAB[nk], 1024, Math.round(1024 * (hs ? 118 : 150) / nw)), sk ? txtTex(LAB[sk], 1024, Math.round(1024 * 50 / nw), { fg: '#5a5f6a', bold: false }) : null); };
tagTx(TAGM[1], 'e1_marker'); tagTx(TAGM[2], 'e1_east'); TAGL.forEach((g, i) => tagTx(g, 'e3_name' + (i + 1), 'e3_src' + (i + 1))); tagTx(TAGV[0], 'e3_valley');
['e4_city', 'e4_last', 'e4_yerushalmi'].forEach((k, i) => tagTx(TAGE[i], k)); ['e5b_doubt', 'e5b_long', 'e5b_clean', 'e5b_marked', 'e5b_short'].forEach((k, i) => tagTx(TAGT[i], k));
const GULL = K.makeGull(); scene.add(GULL.root);

/* ---------------------------------------------------------------- the lake diorama (real) + Tiberias */
const LAKE = K.makeKinneretLake({ level: 209.3, houses: false }); scene.add(LAKE.root);
const hills = K.makeHills({ a0: 0, a1: Math.PI * 2, dists: [6200, 8600, 11500], base: '#86b35e', haze: '#cfe0e6', h: 750, n: 14 }); hills.position.y = -60; scene.add(hills);
const HG = (x, z) => LAKE.heightAt(x, z);
const TBC = [-1000, 250], TBY = HG(-800, 250) + 20;
const TB = K.makeTiberiasE({ w: 420, d: 400, baseY: TBY, skirt: 300, fore: 210 }); TB.root.position.set(TBC[0], 0, TBC[1]); scene.add(TB.root);
const onPlat = (x, z) => x > -1230 && x < -575 && z > 22 && z < 478;
const yPath = (x, z) => (onPlat(x, z) ? TBY + 8 : HG(x, z) + 8);
const LOUT = K.makePathE(K.KINNERET_OUTLINE, { closed: true, smooth: false, w: 34, y: 24, dash: 90, fill: 0.72 }); scene.add(LOUT.root);
const ORCH = K.makeOrchardE(); { const x = -560, z = -760; ORCH.root.position.set(x, HG(x, z) - 4, z); scene.add(ORCH.root); }
const BOAT = K.makeFishingBoat('#e8f0f4', 3); BOAT.scale.setScalar(0.9); BOAT.rotation.y = 0.5; scene.add(BOAT);
const TAGPOS = [[140, -1330], [640, 60], [-480, -1010], [-640, -110]];
const CV = K.makeCaveE(); const CX = -1650, CZ = -350, CYG = Math.min(HG(CX, CZ), HG(CX + 250, CZ)) - 10;
CV.root.scale.setScalar(0.9); CV.root.rotation.y = Math.PI / 2; CV.root.position.set(CX, CYG, CZ); scene.add(CV.root);
const APRON = new THREE.Group(); scene.add(APRON); { const m = K.M('#b9a888', '#9a8a70'); K.box(APRON, 700, 260, 820, m, [CX + 330, CYG - 120, CZ], 3, null, 6); APRON.userData.m = m; }
const SUNB = K.makeSun({ r: 150 }); scene.add(SUNB);
const MOON = new THREE.Group(); { const a = new THREE.Mesh(new THREE.CircleGeometry(120, 28), new THREE.MeshBasicMaterial({ color: '#eef0e0' })); MOON.add(a); [[-30, 30, 22], [35, -20, 16], [20, 45, 12]].forEach(([x, y, r]) => { const c = new THREE.Mesh(new THREE.CircleGeometry(r, 14), new THREE.MeshBasicMaterial({ color: '#c8cbb8' })); c.position.set(x, y, 1); MOON.add(c); }); scene.add(MOON); }
const PIER = K.makePier({ len: 520, w: 130, deckY: 100 }); PIER.position.set(-480, 0, 640); scene.add(PIER);
const SEF3 = K.makeSefarimE({ n: 5, seed: 5 }); SEF3.root.scale.setScalar(0.45); SEF3.root.position.set(-200, 106, 700); SEF3.root.rotation.y = 0.5; scene.add(SEF3.root);
const BOOK = K.makeBookOpenE(); scene.add(BOOK.root);
const GATH = new THREE.Group(); scene.add(GATH);
const GL4 = K.makePathE([[-750, 250], [-700, 120], [-650, 0], [-640, -110]], { w: 20, y: yPath, dash: 50, fill: 0.6, step: 14 }); scene.add(GL4.root);
const CPATH = K.makePathE([[-1400, -340], [-1300, -200], [-1160, -90], [-1020, -30], [-860, -30], [-700, -20], [-610, 90], [-590, 250], [-700, 250], [-790, 250]], { w: 16, y: yPath, dash: 28, fill: 0.36, step: 14 }); scene.add(CPATH.root);

/* ---------------------------------------------------------------- the plan sketch */
const TSK = K.makeTiberiasSketchE(); TSK.root.position.set(...ST.ts); scene.add(TSK.root);
const tsw = (x, y, z) => [ST.ts[0] + x, ST.ts[1] + y, ST.ts[2] + z];
{ const rq = (i, m) => ((i * 9301 + 49297) % 233280) / 233280 * m;
  for (let i = 0; i < 26; i++) { const x = -2200 + rq(i, 4400), z = (i % 2 ? 1 : -1) * (760 + rq(i + 7, 600)); if (Math.abs(x) > 1500 && Math.abs(z) < 700) continue; const tr = i % 3 ? K.makeTree('pine', 800 + i, 1.2 + rq(i + 3, 0.8)) : K.makeBush(850 + i, { s: 1.6 }); tr.position.set(ST.ts[0] + x, ST.ts[1], ST.ts[2] + z); scene.add(tr); } }
const MAG = K.makeMagnifierE(); scene.add(MAG.root);
const RPTH = K.makePathE([[1180, 0], [1060, -380], [640, -640], [0, -720], [-640, -640], [-1060, -380], [-1180, 0]], { w: 30, y: 14, color: '#e0322a', dash: 80, fill: 0.62, step: 14 }); RPTH.root.position.set(...ST.ts); scene.add(RPTH.root);
const GPTH = K.makePathE([[-1180, 0], [0, 0], [1180, 0]], { w: 30, y: 14, dash: 70, fill: 0.62, smooth: false }); GPTH.root.position.set(...ST.ts); scene.add(GPTH.root);

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
const yawTo = (a, b) => Math.atan2(-(b[2] - a[2]), b[0] - a[0]);
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
const V0 = () => ({ map: false, lake: false, ts: false });
const HIDE = [BORD.root, JG.root, JB.root, ...FARR, SPATH.root, WIPE, COMP.root, CHIP, SEF.root, SEF2.root, PC1.root, PC2.root, PC3.root, SCR.root, SCR2.root, QM, GULL.root, ORCH.root, BOAT, CV.root, APRON, SUNB, MOON, PIER, SEF3.root, BOOK.root, GL4.root, CPATH.root, LOUT.root, MAG.root, RPTH.root, GPTH.root, TB.root,
  ...TAGM.map(t => t.root), ...TAGL.map(t => t.root), ...TAGV.map(t => t.root), ...TAGE.map(t => t.root), ...TAGT.map(t => t.root)];
function resetAll() {
  HIDE.forEach(o => { o.visible = false; });
  LAND.setHula(0); LAND.setPin(0); LAND.setDim(0); LAND.setOutline(0); LAND.setGlow(0, 0); LAND.setGlow(1, 0); LAND.pondPulse(0); LAND.setKinColor('#2d9be6');
  PAN.visible = false; hills.visible = false;
}
const tagAt = (tg, x, y, z, s, fill, sw) => { tg.root.visible = true; tg.root.position.set(x, y, z); tg.root.scale.setScalar(s); tg.setFill(fill); tg.setSwing(sw || 0); };
const swingOf = (lt, t0) => lt > t0 ? 0.3 * Math.exp(-(lt - t0) * 1.1) * Math.sin((lt - t0) * 7) : 0;
const popS = (lt, a, b) => { const u = cl((lt - a) / (b - a), 0, 1); return u <= 0 ? 0.001 : (u < 0.6 ? sm(u / 0.6) * 1.2 : 1.2 - 0.2 * sm((u - 0.6) / 0.4)); };

function frame(tl) {
  const t = Math.max(0, Math.min(DUR, tl)); CT = t;
  const si = shotOf(t), lt = t - O[si];
  const V = V0(), X = { cam: null, fg: null, rel: [], chip: null, sky: 'clear' }, C = { G: NONE(), T: NONE(), S: NONE() };
  resetAll();
  [s0, s1, s2, s3, s4, s5, s6][si](t, lt, V, X, C);
  return finish(t, lt, si, V, X, C);
}

/* ---------------------------------------------------------------- e1 : the border in the Torah */
function s0(t, lt, V, X, C) {
  V.map = true; SEF.root.visible = true;
  const gal = P(35.3, 32.9), EK = P(35.64, 32.8), CP = [EK[0] + 330, EK[1] + 40];
  const bl = kfl([[0, 0], [11.7, 0], [18.9, dNE], [19.5, dNE], [24.9, dSE], [26.7, dSE], [40, BORD.len]], lt); BORD.setLen(bl); BORD.root.visible = bl > 1;
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const head = BORD.at(Math.max(0, bl - 100));
  if (lt < 11.4) X.cam = camKeys(lt, [[0, tgm(60, -250), 6000, 0, 0.8, 36], [5.4, tgm(60, -250), 5400, 0, 0.78, 36], [5.7, tgm(gal[0], gal[1]), 6000, 0, 0.78, 36], [11.1, tgm(gal[0], gal[1]), 3800, 0, 0.74, 36], [11.4, tgm(gal[0], gal[1]), 3800, 0, 0.74, 36]]);
  else if (lt < 19.3) X.cam = camOne(tgm(head.x, head.z), 1900, 0, 0.62, 34);
  else X.cam = camKeys(lt, [[19.5, tgm(EK[0] + 110, EK[1]), 700, 0.1, 0.62, 34], [26.1, tgm(EK[0] + 110, EK[1] + 20), 560, 0.2, 0.6, 34], [26.7, tgm(EK[0] + 330, EK[1] + 20), 800, 0.1, 0.62, 34], [32.2, tgm(EK[0] + 330, EK[1] + 20), 700, 0.1, 0.62, 34],
    [32.8, tgm(KC[0], KC[1]), 620, 0, 0.7, 34], [40, tgm(KC[0], KC[1]), 430, 0, 0.7, 34], [45, tgm(KC[0], KC[1]), 400, 0, 0.7, 34]]);
  if (lt < 5.6) {
    LAND.setDim(1 - U(lt, 0.4, 4.6)); WIPE.visible = lt > 0.2 && lt < 5.4; WIPE.position.set(...mwa(lerp(-1500, 1700, lin(lt, 0.3, 5.2)), TOP + 20, 0));
    if (lt > 0.2) { GULL.root.visible = true; GULL.pose({ t, x: lerp(-2400, 2600, lt / 5.6), y: ST.map[1] + 1100 + 60 * Math.sin(lt * 0.9), z: ST.map[2] - 900, yaw: 0, flap: 0.5 + 0.5 * Math.sin(t * 7), fly: 1 }); GULL.root.scale.setScalar(3.4); }
    SCR.root.visible = true; X.rel.push([SCR.root, -0.52, -0.18, 0.2, 300, 1]); SCR.setUnroll(0);
    C.G = actS(P0('down'), fc('happy', 0.15, 0), -0.80, -0.56, 0.36); C.T = actS(P0('wave'), fc('happy', 0.5), 0.78, -0.56, 0.28, { hop: 0.03 * Math.abs(Math.sin(t * 3)) });
  } else if (lt < 11.7) {
    QM.visible = true; X.rel.push([QM, -0.5, 0.3, 0.3, 330, popS(lt, 5.8, 6.4)]);
    SCR.root.visible = true; X.rel.push([SCR.root, -0.52, -0.18, 0.2, 300, 1]);
    C.G = actS(P0('wave'), fc('happy', 0.15, 0), -0.80, -0.56, 0.36, { yawOff: 0.2 }); C.T = actS(P0('down'), fc('curious', 0.5, null, [-0.4, 0.3]), 0.78, -0.56, 0.28, { hop: 0.05 * Math.abs(Math.sin(t * 2.6)) });
  } else if (lt < 19.5) {
    SCR.root.visible = true; SCR.setUnroll(U(lt, 12.6, 15.6)); X.rel.push([SCR.root, -0.5, 0.42, 0.36, 450, 1]);
    C.G = actS(P0('up'), fc('happy', 0.15, 0, [0.3, 0]), -0.84, -0.56, 0.36, { yawOff: 0.5 });
    C.T = actW(po(mwa(head.x, LY + 2, head.z), head.ang, 'down', hopO(t, 1.5, 28)), fc('cheering', 0.5), 0.13);
  } else if (lt < 26.7) {
    X.rel.push([PC1.root, 0.44, 0.04, 0.66, 700, 1, 340]); PC1.root.visible = true; PC1.setOpen(U(lt, 19.6, 20.9)); PC1.setReveal(U(lt, 21.0, 25.4)); PC1.setGlow(lt > 25.0 ? 0.6 + 0.4 * pulse : 0);
    C.G = actS(P0('point'), fc('happy', 0.15, 0), -0.84, -0.56, 0.36, { yawOff: 0.7 }); C.T = actS(P0('down'), fc('curious', 0.5, null, [0.4, 0.3]), 0.9, -0.56, 0.26, { hop: 0.05 * Math.abs(Math.sin(t * 3)) });
  } else if (lt < 32.8) {
    PC1.root.visible = true; PC1.setOpen(1 - U(lt, 30.6, 31.8)); PC1.setReveal(1); PC1.setGlow(lt < 29.2 ? 0.7 : 0); X.rel.push([PC1.root, 0.58, 0.0, 0.44, 700, 1, 340]);
    COMP.root.visible = true; COMP.root.position.set(...mwa(CP[0], LY + 3, CP[1])); COMP.setAppear(U(lt, 26.9, 27.8)); COMP.setLit(U(lt, 29.4, 30.2)); tagAt(TAGM[2], ST.map[0] + CP[0] + 205, ST.map[1] + LY, ST.map[2] + CP[1] - 10, Math.max(0.001, 0.3 * popS(lt, 30.0, 30.8)), 1, swingOf(lt, 30.4));
    const eT = [ST.map[0] + CP[0] + COMP.east[0], ST.map[1] + LY + 6, ST.map[2] + CP[1]];
    const cu = lin(lt, 27.4, 29.6); if (lt >= 27.4 && lt < 30.8) X.chip = { from: [0.58, 0.72], u: sm(cu), target: eT, hfr: 0.15, k: lt < 30.2 ? 1 : 1 - U(lt, 30.2, 30.8) };
    const tu = U(lt, 29.8, 31.2);
    C.T = actW(po([lerp(ST.map[0] + CP[0], eT[0] - 12, tu), eT[1] + 30 * Math.abs(Math.sin(t * 3)) * (tu < 1 ? 1 : 0.3), eT[2]], 0.3, 'up', { shadow: false }), fc('cheering', 0.5), 0.12);
    C.G = actS(P0('point'), fc('happy', 0.15, 0), -0.84, -0.56, 0.36, { yawOff: 0.85 });
  } else {
    const k = U(lt, 32.9, 33.6); LAND.setGlow(0, (0.45 + 0.4 * pulse) * k); LAND.setPin(k); LAND.setDim(0.25 * k);
    tagAt(TAGM[1], ST.map[0] + KC[0] + 70, ST.map[1] + LY, ST.map[2] + KC[1] - 30, Math.max(0.001, 0.2 * popS(lt, 33.8, 34.6)), 1, swingOf(lt, 34.4));
    C.T = actW(po(mwa(KC[0] - 6, LY + 7 + 6 * Math.sin(t * 2.2), KC[1] + 40), -1.5, 'down', floatOpt), fc('happy', 0.5, 0.8), 0.12);
    C.G = actS(P0('down', { tilt: 6 * Math.sin(t * 2.2) }), fc('happy', 0.15, 0), -0.82, -0.56, 0.36);
  }
}

/* ---------------------------------------------------------------- e2 : from the Kinneret to the Dead Sea */
function s1(t, lt, V, X, C) {
  V.map = true; const mid = [(KC[0] + DSC[0]) / 2, (KC[1] + DSC[1]) / 2], pulse = 0.5 + 0.5 * Math.sin(t * 5);
  BORD.root.visible = false;
  if (lt < 8.2) X.cam = camKeys(lt, [[0, tgm(mid[0] - 380, mid[1]), 2900, 0, 0.72, 36], [8.2, tgm(mid[0] - 380, mid[1]), 2600, 0, 0.72, 36]]);
  else if (lt < 16.8) { const d = U(lt, 8.6, 15.6) * JG.len, h = JG.at(d); X.cam = camOne(tgm(h.x, h.z), 1300, 0, 0.66, 34); }
  else X.cam = camKeys(lt, [[16.8, tgm(mid[0], mid[1]), 1900, 0, 0.7, 36], [24.8, tgm(mid[0], mid[1]), 1700, 0, 0.7, 36]]);
  if (lt < 8.2) {
    PC1.root.visible = true; PC1.setOpen(U(lt, 1.3, 2.4)); PC1.setReveal(U(lt, 2.5, 6.4)); PC1.setGlow(lt > 6.2 ? 0.6 + 0.4 * pulse : 0); X.rel.push([PC1.root, -0.30, 0.04, 0.62, 700, 1, 340]);
    LAND.setGlow(0, lt > 6.6 ? 0.5 : 0); LAND.setGlow(1, lt > 6.6 ? 0.5 : 0);
    C.G = actS(P0('point', { }), fc('happy', 0.15, 0, [0.3, 0]), -0.92, -0.56, 0.36, { yawOff: 0.8 }); C.T = actS(P0('down'), fc('curious', 0.5, null, [-0.5, 0.2]), 0.84, -0.56, 0.28, { hop: 0.03 * Math.abs(Math.sin(t * 2.4)) });
  } else if (lt < 16.8) {
    const d = U(lt, 8.6, 15.6) * JG.len, h = JG.at(d); JG.setLen(d); LAND.setGlow(0, 0.3 + 0.6 * pulse); LAND.setGlow(1, 0.3 + 0.6 * (1 - pulse));
    C.G = actS(P0('wave'), fc('happy', 0.15, 0), -0.82, -0.56, 0.36); C.T = actW(po(mwa(h.x, LY + 2, h.z), h.ang, 'down', hopO(t, 1.6, 26)), fc('cheering', 0.5), 0.14);
  } else {
    const f = U(lt, 17.0, 18.2); JB.root.visible = true; JB.setDraw(f); JB.update(t); LAND.setGlow(0, 0.25); LAND.setGlow(1, 0.25);
    FARR.forEach((a, i) => { const u = frac(t * 0.14 + i / 4) * f, p = JG.at(u * JG.len); a.visible = f > 0.5; a.position.set(...mwa(p.x, LY + 6, p.z)); a.rotation.y = p.ang; a.scale.setScalar(1); });
    const u = U(lt, 17.8, 23.0), p = JG.at(u * JG.len), arrived = lt > 23.0;
    const wp = po(mwa(p.x, LY + 9 + (arrived ? 40 * Math.abs(Math.sin((lt - 23.0) * 5)) * Math.exp(-(lt - 23.0)) : 5 * Math.sin(t * 3)), p.z), -1.5, arrived ? 'up' : 'down', arrived ? { shadow: false } : floatOpt);
    if (!arrived) C.T = actW(wp, fc('happy', 0.5), 0.17); else C.S = actW(wp, fc('cheering', 0.5), 0.17);
    C.G = actS(P0('wave'), fc('happy', 0.15, 0), -0.82, -0.56, 0.36);
  }
}

/* ---------------------------------------------------------------- e3 : the many names */
function s2(t, lt, V, X, C) {
  V.lake = true; X.sky = 'clear'; TB.root.visible = true; ORCH.root.visible = true; LOUT.root.visible = true; BOAT.visible = false;
  const g3 = (x, z, dy) => [x, HG(x, z) + (dy || 0), z], F = [1.2, 8.4, 14.5, 20.9, 27.4];
  LOUT.setK(U(lt, 0.8, 4.8)); LOUT.mat.uniforms.uA.value.set(lt > 5 && lt < 8 ? '#fff3a0' : '#ffc928');
  const cs = [8.4, 14.5, 20.9, 27.4];
  TAGPOS.forEach((p, i) => { let sc;
    if (lt < 8.4) sc = lt > 1.5 ? 1.9 * popS(lt, 1.5 + i * 0.25, 2.3 + i * 0.25) : 0;
    else sc = lt < cs[i] ? 0 : 1.3 * popS(lt, cs[i], cs[i] + 0.7) * (i < 3 ? 1 - 0.58 * U(lt, cs[i + 1], cs[i + 1] + 0.8) : 1);
    tagAt(TAGL[i], p[0], HG(p[0], p[1]), p[1], Math.max(0.001, sc), lt < 8.4 ? 0 : (lt < cs[i] ? 0 : U(lt, cs[i] + 0.4, cs[i] + 1.2)), swingOf(lt, cs[i] + 0.5)); TAGL[i].root.visible = sc > 0.01; });
  { const vs = lt >= 21.8 ? 0.9 * popS(lt, 21.8, 22.6) * (1 - 0.4 * U(lt, 27.4, 28.2)) : 0; tagAt(TAGV[0], -700, HG(-700, -700), -700, Math.max(0.001, vs), 1, swingOf(lt, 22.2)); TAGV[0].root.visible = vs > 0.01; }
  ORCH.setGrow(U(lt, 21.4, 25.6)); TB.setGrow(U(lt, 27.8, 31.8));
  GL4.root.visible = lt > 30; GL4.setK(U(lt, 30.2, 32.2));
  const cams = [[1.2, [0, 0, -100], 4300, 0, 1.15], [7.8, [0, 0, -100], 3900, 0, 1.15], [8.4, [140, 0, -900], 2600, -0.15, 0.7], [13.9, [140, 0, -900], 2400, -0.15, 0.7], [14.5, [560, HG(560, 40), 40], 2700, 0.35, 0.72], [20.3, [560, HG(560, 40), 40], 2500, 0.35, 0.72],
    [20.9, [-450, HG(-450, -800), -800], 2600, -0.2, 0.68], [26.8, [-450, HG(-450, -800), -800], 2400, -0.2, 0.68], [27.4, [-760, TBY, 120], 2600, -0.9, 0.55], [32.9, [-760, TBY, 120], 2300, -0.9, 0.55], [39, [-760, TBY, 120], 2200, -0.9, 0.55]];
  X.cam = camKeys(lt, cams.map(c => [c[0], c[1], c[2], c[3], c[4], 36]));
  const qf = 0, spin = Math.sin(t * 2.2);
  if (lt < 8.4) {
    const fy = LAKE.float(0, 0, 60).y;
    C.G = actW(po(g3(150, 1250), -1.55, 'down', { }), fc('happy', 0.15, 0, [0, 0]), 0.2); C.T = actW(po([60 * Math.sin(t * 0.7), fy, 40], -1.5, 'up', floatOpt), fc('curious', 0.5, null, [0.3, 0.3]), 0.12);
  } else if (lt < 14.5) {
    C.G = actS(P0('point'), fc('happy', 0.15, 0, [0.3, 0.2]), -0.84, -0.56, 0.34, { yawOff: 0.6 }); C.T = actS(P0('down'), fc('curious', 0.5, null, [0.4, 0.3]), 0.82, -0.56, 0.26, { hop: 0.03 * Math.abs(Math.sin(t * 2.6)) });
  } else if (lt < 20.9) {
    const u = U(lt, 15.0, 19.0), x = lerp(120, 700, u), z = lerp(40, 80, u), inL = LAKE.inLake(x, z);
    C.T = actW(po([x, inL ? LAKE.float(x, z, 60).y : HG(x, z), z], 0.0, 'down', inL ? floatOpt : Object.assign({ shadow: true }, hopO(t, 1.5, 40 * (u < 1 ? 1 : 0)))), fc('cheering', 0.5), 0.13);
    C.G = actS(P0('down'), fc('happy', 0.15, 0), -0.84, -0.56, 0.34);
  } else if (lt < 27.4) {
    const u = U(lt, 21.3, 26.0), x = lerp(-380, -560, u), z = lerp(-560, -780, u);
    C.T = actW(po([x, HG(x, z), z], yawTo([-380, 0, -560], [-560, 0, -780]), 'down', hopO(t, 1.7, 36)), fc('cheering', 0.5), 0.14);
    C.G = actS(P0('wave'), fc('happy', 0.15, 0), -0.84, -0.56, 0.34);
  } else {
    C.G = actW(po([-690, TBY, 330], -0.4, 'down', { raw: [{ out: 0.25 }, { out: 1.3 }] }), fc('happy', 0.15, 0), 0.22); C.T = actW(po([-612, TBY, 120], -0.7, 'down', { }), fc('curious', 0.5, null, [0.4, 0.2]), 0.16);
  }
}

/* ---------------------------------------------------------------- e4 : Tiberias */
function s3(t, lt, V, X, C) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  if (lt < 9.0) {
    V.lake = true; TB.root.visible = true; BOAT.visible = true; TB.setGrow(U(lt, 1.4, 7.0)); ORCH.root.visible = true; ORCH.setGrow(1);
    const bx = -380, bz = 350; BOAT.position.set(bx, LAKE.float(bx, bz, 200).y, bz);
    const u = U(lt, 0.4, 8.6); X.cam = { p: [lerp(300, -330, u), lerp(600, TBY + 170, u), lerp(800, 560, u)], l: [lerp(-900, -760, u), lerp(TBY, TBY + 40, u), lerp(250, 240, u)], fov: 36 };
    tagAt(TAGE[0], -585, TBY, 45, Math.max(0.001, 0.5 * popS(lt, 5.0, 5.8)), 1, swingOf(lt, 5.6));
    const cp = X.cam.p; C.G = actW(po([-690, TBY, 360], yawTo([-690, 0, 360], [cp[0], 0, cp[2]]), 'down', { raw: [{ out: 0.25 }, { out: 1.2 }] }), fc('happy', 0.15, 0), 0.26);
    C.T = actW(po([-680, TBY, 170], yawTo([-680, 0, 170], [cp[0], 0, cp[2]]), 'down', { }), fc('curious', 0.5, null, [0.3, 0.2]), 0.19);
  } else if (lt < 17.7) {
    V.map = true; SPATH.root.visible = true; X.sky = 'clear';
    const u = U(lt, 10.0, 16.8), d = u * SPATH.len, p = SPATH.at(d); SPATH.setLen(d); LAND.setPin(U(lt, 16.0, 17.0)); LAND.setDim(0.25);
    const hu = frac(u * 4), arc = Math.sin(Math.PI * hu);
    const cu = U(lt, 9.4, 11.8), ov = [(BP[0][0] + KC[0]) / 2, (JP[3][1] + 30)];
    const ctg = [lerp(ov[0], p.x, cu), lerp(ov[1], p.z, cu)], D = lerp(4200, lerp(1500, 1100, U(lt, 12, 17)), cu);
    X.cam = camOne(tgm(ctg[0], ctg[1]), D, 0, lerp(0.8, 0.68, cu), 36);
    const gs = D / 700, sy = ST.map[1] + LY + 120 * gs * (0.6 + arc);
    GULL.root.visible = true; GULL.root.scale.setScalar(gs); GULL.pose({ t, x: ST.map[0] + p.x, y: sy + 60 * gs, z: ST.map[2] + p.z, yaw: p.ang, flap: 0.5 + 0.5 * Math.sin(t * 9), fly: 1 });
    SCR.root.visible = true; SCR.root.scale.setScalar(D / 1800); SCR.root.position.set(ST.map[0] + p.x, sy - 20 * gs, ST.map[2] + p.z); SCR.root.rotation.y = -p.ang; SCR.setUnroll(0);
    const q = SPATH.at(Math.max(0, d - 90));
    C.T = actW(po(mwa(q.x, LY + 2, q.z), q.ang, 'down', hopO(t, 1.8, 26)), fc('cheering', 0.5), 0.12);
    C.G = actS(P0('wave'), fc('happy', 0.15, 0), -0.84, -0.56, 0.34);
  } else if (lt < 24.9) {
    V.lake = true; TB.root.visible = true; TB.setGrow(1); ORCH.root.visible = true; ORCH.setGrow(1); BOAT.visible = true; BOAT.position.set(-380, LAKE.float(-380, 350, 200).y, 350);
    const drop = 1 - U(lt, 17.8, 19.6); SCR.root.visible = true; SCR.root.scale.setScalar(1.1); SCR.root.position.set(TBC[0], TBY + 36 + 600 * drop * drop, TBC[1]); SCR.root.rotation.y = 0.5; SCR.setUnroll(0);
    const gl = 1 - U(lt, 19.2, 20.6); GULL.root.visible = true; GULL.root.scale.setScalar(1.4);
    GULL.pose({ t, x: lerp(-790, -790, 1) + gl * 400, y: TBY + 180 + gl * (200 + 60 * Math.sin(lt * 3)) + 20 * drop, z: lerp(250, 250, 1) + gl * -200, yaw: gl > 0.02 ? 2.6 : 0, flap: gl > 0.02 ? 0.5 + 0.5 * Math.sin(t * 9) : 0, fly: gl > 0.02 ? 1 : 0 });
    tagAt(TAGE[1], -740, TBY, 35, Math.max(0.001, popS(lt, 20.0, 20.8)), 1, swingOf(lt, 20.5)); tagAt(TAGE[0], -585, TBY, 45, 0.55, 1, 0);
    X.cam = camOne([TBC[0] + 80, TBY + 80, 250], 1500 - 200 * U(lt, 17.8, 24.3), -0.8, 0.42, 36);
    const bow = U(lt, 21.0, 22.0) * (1 - U(lt, 23.2, 24.0));
    C.G = actW(po([-690, TBY, 360], -0.5, 'down', { raw: [{ out: 0.25 }, { out: 1.6, fw: 0.5 }] }), fc('happy', 0.15, 0), 0.26);
    C.T = actW(po([-680, TBY, 170], -0.7, 'down', { tilt: 24 * bow }), fc('happy', 0.5), 0.19);
  } else {
    V.lake = true; TB.root.visible = true; TB.setGrow(1); ORCH.root.visible = true; ORCH.setGrow(1); BOAT.visible = true; BOAT.position.set(-380, LAKE.float(-380, 350, 200).y, 350);
    SCR.root.visible = true; SCR.root.scale.setScalar(1.1); SCR.root.position.set(TBC[0], TBY + 36, TBC[1]); SCR.root.rotation.y = 0.5;
    BOOK.root.visible = true; BOOK.root.position.set(TBC[0] + 20, TBY + 520, TBC[1]); BOOK.root.scale.setScalar(0.9); BOOK.root.rotation.set(0, 0, -0.9); BOOK.setOpen(U(lt, 25.2, 27.0)); BOOK.turn(U(lt, 27.2, 30.4) * 8);
    tagAt(TAGE[2], -900, TBY, 30, Math.max(0.001, popS(lt, 25.4, 26.2)), 1, swingOf(lt, 25.8)); tagAt(TAGE[1], -740, TBY, 35, 0.55, 1, 0); tagAt(TAGE[0], -585, TBY, 45, 0.55, 1, 0);
    GULL.root.visible = true; GULL.root.scale.setScalar(1.4); GULL.pose({ t, x: -790, y: TBY + 192, z: 250, yaw: 2.6, flap: 0, fly: 0 });
    X.cam = camOne([TBC[0] + 40, TBY + 150, 250], 1500, -0.8, 0.4, 36);
    C.G = actW(po([-690, TBY, 360], -0.5, 'up', { }), fc('happy', 0.15, 0), 0.26); C.T = actW(po([-680, TBY, 170], -0.7, 'down', { tilt: -8 }), fc('curious', 0.5, null, [0, 0.6]), 0.19);
  }
}

/* ---------------------------------------------------------------- e5 : Rashbi comes */
function s4(t, lt, V, X, C) {
  V.lake = true; TB.root.visible = true; TB.setGrow(1); ORCH.root.visible = true; ORCH.setGrow(1); CV.root.visible = true; APRON.visible = true;
  const pulse = 0.5 + 0.5 * Math.sin(t * 5), cfy = CYG + 0.9 * 440;
  if (lt < 9.4) {
    const th = lt / 4.5 * Math.PI * 2, sy = Math.sin(th);
    SUNB.visible = sy > 0.08; MOON.visible = sy < -0.08; SUNB.position.set(CX - 1500, CYG + 200 + 1500 * Math.abs(sy), CZ + 1900 * Math.cos(th)); MOON.position.set(CX - 1500, CYG + 200 + 1500 * Math.abs(sy), CZ + 1900 * Math.cos(th));
    X.skyK = cl(0.5 - sy * 1.4, 0, 1); X.sky = 'cyc';
    PC3.root.visible = true; PC3.setOpen(U(lt, 1.4, 2.4)); PC3.setReveal(U(lt, 2.6, 6.2)); PC3.setGlow(0); X.rel.push([PC3.root, 0.5, 0.32, 0.36, 480, 1, 340]);
    X.cam = camKeys(lt, [[0, [CX + 150, CYG + 220, CZ], 2300, -1.3, 0.2, 36], [9.4, [CX + 150, CYG + 200, CZ], 1250, -1.3, 0.16, 36]], 0.08);
    C.G = actW(po([CX + 330, CYG + 30, CZ + 330], -1.0, 'down', { raw: [{ out: 0.25 }, { out: 1.0 }] }), fc('worried', 0.15, 0), 0.3);
    C.T = actW(po([CX + 90, cfy - 20, CZ - 135], -0.9, 'down', { shadow: false, squash: 0.92 }), fc('curious', 0.5, null, [0.3, 0.1]), 0.17);
  } else if (lt < 17.3) {
    CPATH.root.visible = true; const d = U(lt, 9.9, 16.6) * CPATH.len, h = CPATH.at(d); CPATH.setLen(d);
    const cu = U(lt, 9.8, 16.6); X.cam = camOne([lerp(CX + 150, h.x, 0.5 + 0.5 * cu), lerp(CYG, TBY, cu) + 60, lerp(CZ, h.z, 0.5 + 0.5 * cu)], 2300, -0.6, 0.75, 36);
    C.G = actW(po([CX + 330, CYG + 30, CZ + 330], -1.0, 'down', { raw: [{ out: 0.25 }, { out: 1.0 }] }), fc('happy', 0.15, 0), 0.2);
    C.T = actW(po([h.x, h.y, h.z], h.ang, 'down', hopO(t, 1.6, 40)), fc('cheering', 0.5), 0.12);
  } else {
    X.cam = camKeys(lt, [[17.6, [TBC[0] + 100, TBY + 120, 250], 2400, -0.9, 0.45, 36], [30, [TBC[0] + 100, TBY + 120, 250], 2000, -0.6, 0.4, 36]]);
    PC2.root.visible = true; PC2.setOpen(U(lt, 17.7, 19.0)); PC2.setReveal(U(lt, 18.6, 21.4)); PC2.setGlow(lt > 23.4 ? 0.6 + 0.4 * pulse : 0); X.rel.push([PC2.root, 0.46, 0.04, 0.64, 700, 1, 340]);
    C.G = actS(P0('point'), fc('happy', 0.15, 0, [0.3, 0.2]), -0.80, -0.56, 0.36, { yawOff: 0.5 }); C.T = actS(P0('down', { tilt: 6 * Math.sin(t * 3) }), fc('happy', 0.5, null, [0.4, 0.2]), -0.34, -0.56, 0.28, { yawOff: 0.4, hop: 0.02 * Math.abs(Math.sin(t * 3)) });
  }
}

/* ---------------------------------------------------------------- e5b : the short way */
function s5(t, lt, V, X, C) {
  V.ts = true; const pulse = 0.5 + 0.5 * Math.sin(t * 5), A = TSK.anchors;
  X.cam = camKeys(lt, [[0, tsw(0, 0, -100), 2700, 0, 0.95, 36], [40, tsw(0, 0, -100), 2500, 0, 0.92, 36]], 0.1);
  TSK.setClean(U(lt, 24.8, 29.6)); TSK.setStones(U(lt, 25.0, 27.4));
  const gA = tsw(-1020, 0, 0), gB = tsw(1020, 0, 0), faceE = 0, faceW = Math.PI;
  tagAt(TAGT[0], ...tsw(0, 0, -560), Math.max(0.001, 1.5 * popS(lt, 2.0, 2.8) * (1 - 0.5 * U(lt, 8.4, 9.2))), 1, swingOf(lt, 2.4)); TAGT[0].root.visible = lt > 1.8;
  if (lt < 8.4) {
    QM.visible = true; QM.position.set(...tsw(40, 330, -40)); QM.scale.setScalar(2.6 * popS(lt, 3.2, 4.0) * (1 + 0.06 * Math.sin(t * 4)));
    C.G = actW(po(gA, faceE, 'down', { raw: [{ out: 0.25 }, { out: 1.0 }] }), fc('curious', 0.15, 0), 0.26); C.T = actW(po(gB, faceW, 'down', { }), fc('curious', 0.5, null, [-0.5, 0.2]), 0.2);
  } else if (lt < 18.2) {
    QM.visible = lt < 14; QM.position.set(...tsw(40, 330, -40)); QM.scale.setScalar(2.6);
    const d = U(lt, 8.8, 17.4) * RPTH.len, h = RPTH.at(d); RPTH.setLen(d);
    tagAt(TAGT[1], ...tsw(0, 0, -860), Math.max(0.001, 1.5 * popS(lt, 9.0, 9.8)), 1, swingOf(lt, 9.4));
    C.G = actW(po(gA, faceE, 'down', { }), fc('worried', 0.15, 0), 0.26); C.T = actW(po([ST.ts[0] + h.x, ST.ts[1] + 6, ST.ts[2] + h.z], h.ang, 'down', hopO(t, 1.7, 50)), fc('cheering', 0.5), 0.2);
  } else if (lt < 24.3) {
    RPTH.setLen(RPTH.len); tagAt(TAGT[1], ...tsw(0, 0, -860), 0.75, 1, 0);
    const u = lin(lt, 18.4, 23.4), mx = lerp(-520, 520, sm(u)), mz = -80 + 170 * Math.sin(u * 7);
    MAG.root.visible = true; MAG.root.scale.setScalar(1.3); MAG.root.position.set(...tsw(mx, 70, mz));
    QM.visible = lt < 23; QM.position.set(...tsw(40, 330, -40)); QM.scale.setScalar(2.6 * (1 - U(lt, 22.2, 23.4)));
    C.T = actW(po(tsw(mx + 640, 0, mz), faceW, 'down', { raw: [{ out: 1.1 }, { out: 1.1 }], tilt: -6 + 6 * Math.sin(t * 6) }), fc('curious', 0.5, null, [-0.6, 0.1]), 0.2);
    C.G = actW(po(tsw(0, 0, -680), -1.55, 'down', { }), fc('curious', 0.15, 0), 0.22);
  } else if (lt < 31.5) {
    RPTH.setLen(RPTH.len); tagAt(TAGT[1], ...tsw(0, 0, -860), 0.75, 1, 0);
    tagAt(TAGT[2], ...tsw(-520, 0, -300), Math.max(0.001, 1.5 * popS(lt, 27.0, 27.8)), 1, swingOf(lt, 27.4)); tagAt(TAGT[3], ...tsw(170, 0, 520), Math.max(0.001, 1.5 * popS(lt, 28.4, 29.2)), 1, swingOf(lt, 28.8));
    C.T = actW(po(tsw(560, 0, -60), -1.4, 'up', { }), fc('cheering', 0.5, 0.8), 0.2); C.G = actW(po(tsw(0, 0, -680), -1.55, 'down', { }), fc('happy', 0.15, 0.3), 0.22);
  } else {
    RPTH.setLen(RPTH.len); tagAt(TAGT[1], ...tsw(0, 0, -860), 0.75, 1, 0); tagAt(TAGT[2], ...tsw(-520, 0, -300), 0.75, 1, 0); tagAt(TAGT[3], ...tsw(170, 0, 520), 0.75, 1, 0);
    const d = U(lt, 31.8, 36.4) * GPTH.len; GPTH.setLen(d); tagAt(TAGT[4], ...tsw(150, 0, -250), Math.max(0.001, 1.5 * popS(lt, 32.0, 32.8)), 1, swingOf(lt, 32.4));
    const x = -1180 + d, sit = U(lt, 36.4, 37.2);
    C.T = actW(po(tsw(Math.min(x, 1090), 0, 0), 0, 'down', (sit < 0.01 ? hopO(t, 1.7, 46) : {})), fc('cheering', 0.5), 0.2 * (1 - 0.15 * sit));
    C.G = actW(po(tsw(Math.min(Math.max(x - 300, -1180), 1000), 0, 60), 0, 'down', sit < 0.01 ? hopO(t, 1.2, 24) : {}), fc('happy', 0.15, 0), 0.24);
  }
}

/* ---------------------------------------------------------------- e6 : recap */
function s6(t, lt, V, X, C) {
  V.lake = true; X.sky = 'soft'; PAN.material.opacity = 0.5; TB.root.visible = true; TB.setGrow(1); ORCH.root.visible = true; ORCH.setGrow(1); PIER.visible = true; SEF3.root.visible = true; PAN.visible = true; BOAT.visible = true;
  BOAT.position.set(-300, LAKE.float(-300, 880, 200).y, 880);
  const u = U(lt, 0, 21);
  X.cam = { p: [lerp(-700, -1050, u), lerp(330, 600, u), lerp(1180, 1700, u)], l: [lerp(-60, 0, u), lerp(140, 120, u), lerp(520, 440, u)], fov: 36 };
  C.G = actW(po([-390, 106, 640], 0.15, 'down', { tilt: 1.5 * Math.sin(t * 0.8) }), fc('happy', 0.15, null, [0.8, 0.1]), 0.22, { sc: 1 });
  C.T = actW(po([-300, 106, 650], 0.1, 'down', { tilt: 2 * Math.sin(t * 0.9 + 1) }), fc('happy', 0.5, null, [0.8, 0.1]), 0.16);
}

/* ---------------------------------------------------------------- common finish */
let skyCfg = null;
function finish(t, lt, si, V, X, C) {
  window.__lastC = C; if (WARM.on) return;
  LAND.root.visible = V.map; TSK.root.visible = V.ts; LAKE.root.visible = V.lake; hills.visible = V.lake; LOUT.root.visible = V.lake && LOUT.root.visible;
  if (V.map) LAND.update(t);
  if (V.lake) LAKE.update(t);
  let horz;
  if (X.sky === 'dusk') horz = setSkyMix(SKYP.dusk, SKYP.dusk, 0); else if (X.sky === 'soft') horz = setSkyMix(SKYP.dawn, SKYP.dusk, 0.3); else if (X.sky === 'cyc') horz = setSkyMix(SKYP.clear, SKYP.night, X.skyK); else if (si === 0) horz = setSkyMix(SKYP.dawn, SKYP.clear, U(lt, 0, 20)); else horz = setSkyMix(SKYP.clear, SKYP.clear, 1);
  LAKE.setHorizon(horz);
  const c = window.__co || X.cam;
  if (V.lake && c.p[1] < 3000) c.p[1] = Math.max(c.p[1], LAKE.heightAt(c.p[0], c.p[2]) + 150);
  cam.fov = c.fov; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l); cam.updateMatrixWorld(true); SKY.position.copy(cam.position);
  const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
  X.rel.forEach(([o, sx, sy, hfr, bh, k, dz]) => { dz = dz || 320; const hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; place(o, sx * hw, sy * hh, -dz); o.scale.setScalar(Math.max(0.001, hfr * 2 * hh / bh * k)); });
  if (X.chip) { const ch = X.chip, v = new THREE.Vector3(...ch.target).project(cam); v.x -= 0.24; const _v0 = v, dz = 300, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9;
    CHIP.visible = true; place(CHIP, lerp(ch.from[0], v.x, ch.u) * hw, (lerp(ch.from[1], v.y, ch.u) + 0.22 * Math.sin(Math.PI * ch.u)) * hh, -dz); CHIP.scale.setScalar(Math.max(0.001, ch.hfr * 2 * hh / 90 * ch.k)); }
  const sunQ = o => { if (o.visible) o.quaternion.copy(cam.quaternion); }; sunQ(SUNB); sunQ(MOON);
  if (SUNB.visible) SUNB.userData.update(t);
  [TAGM, TAGL, TAGV, TAGE, TAGT].forEach(a => a.forEach(g => { if (g.root.visible) g.root.rotation.y = Math.atan2(cam.position.x - g.root.position.x, cam.position.z - g.root.position.z); }));
  { const rv = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), pv = new THREE.Vector3();
    [TAGM, TAGL, TAGV, TAGE, TAGT].forEach(a => a.forEach(g => { if (!g.root.visible) return; const sc = g.root.scale.x, r = g.root.position, cy = g.topY - 90 - g.H / 2; let ok = true;
      for (const [dx, dy] of [[0, 0], [-0.55, 0], [0.55, 0], [0, -0.55], [0, 0.55]]) { pv.set(r.x + rv.x * g.W * dx * sc, r.y + (cy + g.H * dy) * sc, r.z + rv.z * g.W * dx * sc).project(cam); if (pv.z > 1 || Math.abs(pv.x) > 0.97 || Math.abs(pv.y) > 0.97) ok = false; }
      if (!ok) g.root.visible = false; })); }
  if (QM.visible) QM.quaternion.copy(cam.quaternion);
  const ds = [[GD, C.G], [TP, C.T], [TPS, C.S]];
  ds.forEach(([o, cc]) => { o.root.visible = cc.vis; if (!cc.vis) return;
    const base = o === GD ? 0.98 : 0.94, H0 = o.drop.height || 244; let po0 = cc.po, sc = cc.sc;
    if (cc.scr) { const dz = 320, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * 16 / 9; sc = 0.86 * cc.hf * 2 * hh / (H0 * base); const p = new THREE.Vector3(cc.scr[0] * 0.95 * hw, (cc.scr[1] + (cc.hop || 0)) * hh, -dz).applyQuaternion(cam.quaternion).add(cam.position);
      po0 = Object.assign({}, cc.po, { x: p.x, y: p.y, z: p.z, yaw: Math.atan2(-(cam.position.z - p.z), cam.position.x - p.x) + (cc.yawOff || 0) }); }
    else if (cc.hf) { const p = new THREE.Vector3(cc.po.x, cc.po.y, cc.po.z).sub(cam.position); sc = cc.hf * 2 * p.dot(fwd) * Math.tan(cam.fov * Math.PI / 360) / (H0 * base); }
    o.root.scale.setScalar(Math.max(0.0001, sc * base)); o.pose(po0); if (cc.scr) o.root.quaternion.copy(cam.quaternion).multiply(QY.setFromAxisAngle(YAX, -Math.PI / 2 + (cc.yawOff || 0))); o.face.set(cc.f); });
  Object.values(fgs).forEach(f => { f.visible = false; });
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
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm(); for (let i = 0; i < 7; i++) { _frame(O[i] + 0.5); _frame(O[i] + 12); } _frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
