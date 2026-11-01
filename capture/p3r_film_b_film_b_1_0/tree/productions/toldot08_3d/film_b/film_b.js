/* film_b - "the bathtub: what comes in, what goes out" - the whole film (6 shots, 238.5 s). Deterministic: every frame is a pure function of t.
   Hero = the moving diagrams: a glass-front bathtub with level ruler / taps / exits / pump pipe, a relief map slab with snow Hermon + three streams + Jordan,
   a cut-away of the mountain with underground dotted paths, the lake with streams, a split-screen rainy / dry year, a calendar strip, a balance scale.
   The drops (guide = makeTipa big, student = makeTipa tipa, gust) are talking objects that point and react. No people. No Hebrew, no text except digits (38).
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur = 238.5, window.__caption(t), window.__heroBox, window.__sceneHash. ASCII only. */
import { THREE, sm, cl, frac } from '../../../lib/toon3d/toon3d.js';
import * as K from '../../toldot08_kit/kit08.js';

const DUR = 238.5;
const O = [0, 44.9, 87.6, 132.1, 179.6, 219.6, 238.5];
const IDS = ['b1_bathtub', 'b2_from_hermon', 'b3_rain_and_streams', 'b4_where_out', 'b4b_in_or_out', 'b5_recap'];
const CUES = [
  [[5.5, 12.1], [12.7, 19.2], [19.8, 27.7], [28.3, 35.6], [36.2, 42.7]],
  [[45.8, 51.7], [52.3, 58.2], [58.8, 65.3], [65.9, 72.5], [73.1, 79.0], [79.6, 85.4]],
  [[89.0, 95.6], [96.2, 102.0], [102.6, 108.1], [108.7, 116.7], [117.3, 122.8], [123.4, 129.9]],
  [[133.1, 139.7], [140.3, 146.8], [147.4, 155.3], [155.9, 163.2], [163.8, 175.1], [175.7, 182.9]],
  [[180.6, 187.8], [188.4, 194.3], [195.7, 201.6], [203.0, 209.6], [210.2, 216.8]],
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
const shotOf = t => { for (let i = 0; i < 5; i++) if (t < O[i + 1]) return i; return 5; };
const inCue = t => CUES[shotOf(t)].some(c => t >= c[0] && t < c[1]);
const kf = (A, t) => { if (t <= A[0][0]) return A[0][1]; for (let i = 1; i < A.length; i++) if (t <= A[i][0]) return lerp(A[i - 1][1], A[i][1], sm((t - A[i - 1][0]) / (A[i][0] - A[i - 1][0]))); return A[A.length - 1][1]; };
const _c = {}; const colr = h => _c[h] || (_c[h] = new THREE.Color(h));
const WARM = { on: false };
const world = f => { if (!WARM.on) f(); };

/* ---------------------------------------------------------------- sky + stages */
const SKYP = { rain: ['#6f8296', '#97a8b6', '#c3ccd3'], clear: ['#5fb3e6', '#9fd4f2', '#e2f3fb'], dusk: ['#3d4f8c', '#c88b86', '#f3bb82'] };
const SKY = K.makeSky({ palette: 'winter' }); scene.add(SKY);
function setSkyMix(A, B, k) { const u = SKY.material.uniforms; u.uTop.value.copy(colr(A[0])).lerp(colr(B[0]), k); u.uMid.value.copy(colr(A[1])).lerp(colr(B[1]), k); u.uHorz.value.copy(colr(A[2])).lerp(colr(B[2]), k); return '#' + u.uHorz.value.getHexString(); }
const ST = { room: [-9000, 3600, 0], map: [0, 3600, 0], cut: [6000, 3600, 0], secR: [12000, 3600, 0], secL: [17000, 3600, 0], strip: [-20000, 3600, 0] };
const rw = (x, y, z) => [ST.room[0] + x, ST.room[1] + y, ST.room[2] + z];
const mw = (x, y, z) => [ST.map[0] + x, ST.map[1] + y, ST.map[2] + z];
const cw = (x, y, z) => [ST.cut[0] + x, ST.cut[1] + y, ST.cut[2] + z];
const sw = (s, x, y, z) => [ST[s][0] + x, ST[s][1] + y, ST[s][2] + z];

function tex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; return t; }
const mkQ = () => { const q = K.numPlane('?', 260, 330, { fg: '#d6232a', k: 0.95 }); q.visible = false; scene.add(q); return q; };
const BILL = [];
const bill = q => { BILL.push(q); return q; };

/* bathroom-like stage: tiled floor and wall, window with a sky view, rug, baseboard */
const ROOM = new THREE.Group(); ROOM.position.set(...ST.room); scene.add(ROOM);
{
  const floorT = tex(128, 128, (c, w, h) => { c.fillStyle = '#f1e6cf'; c.fillRect(0, 0, w, h); c.fillStyle = '#e4d6b8'; c.fillRect(0, 0, w / 2, h / 2); c.fillRect(w / 2, h / 2, w / 2, h / 2); c.strokeStyle = '#c4b48e'; c.lineWidth = 4; c.strokeRect(0, 0, w, h); }, [14, 8]);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(7000, 4000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: floorT })); fl.position.set(600, 0, 700); ROOM.add(fl);
  const wallT = tex(128, 128, (c, w, h) => { c.fillStyle = '#bfe6e4'; c.fillRect(0, 0, w, h); c.fillStyle = '#d9f3f1'; c.fillRect(6, 6, w - 12, 14); c.strokeStyle = '#8fc9c8'; c.lineWidth = 5; c.strokeRect(0, 0, w, h); }, [26, 16]);
  const wl = new THREE.Mesh(new THREE.PlaneGeometry(7000, 2400), new THREE.MeshBasicMaterial({ map: wallT })); wl.position.set(600, 1200, -520); ROOM.add(wl);
  K.box(ROOM, 7000, 70, 30, K.M('#f4efe2', '#cfc8b8', 0), [600, 35, -505], 0, null, 4);
  K.box(ROOM, 760, 640, 24, K.M('#fbfbf4', '#cfd8e4'), [-1100, 1250, -508], 2.6, null, 6);
  const skyT = tex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5fb3e6'); g.addColorStop(1, '#e2f3fb'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const sk = new THREE.Mesh(new THREE.PlaneGeometry(680, 560), new THREE.MeshBasicMaterial({ map: skyT })); sk.position.set(-1100, 1250, -494); ROOM.add(sk);
  const cl1 = K.makeCloud(7, { s: 0.38, col: '#ffffff', tint: '#dfe6f2' }); cl1.position.set(-1180, 1290, -480); ROOM.add(cl1);
  K.box(ROOM, 10, 560, 14, K.M('#fbfbf4', '#cfd8e4', 0), [-1100, 1250, -490], 0, null, 2); K.box(ROOM, 680, 10, 14, K.M('#fbfbf4', '#cfd8e4', 0), [-1100, 1250, -490], 0, null, 2);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#e8706a' })); rug.position.set(0, 1.5, 330); rug.scale.set(1250, 1, 470); ROOM.add(rug);
  const rug2 = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#f7e2c0' })); rug2.position.set(0, 2.2, 330); rug2.scale.set(1100, 1, 390); ROOM.add(rug2);
}
const TUB = K.makeBathtub(); ROOM.add(TUB.root);
const PIPEG = new THREE.Group(); ROOM.add(PIPEG);
const PIPE_PTS = [[466, 325], [780, 325], [780, 1150], [1500, 1150]];
let PIPE_BLOBS, PIPE_LEN = [];
{
  const gm = () => new THREE.MeshBasicMaterial({ color: '#cfeaff', transparent: true, opacity: 0.24, depthWrite: false, side: THREE.DoubleSide });
  const seg = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const m = new THREE.Mesh(new THREE.CylinderGeometry(130, 130, L, 24, 1, true), gm()); m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 14); m.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]) - Math.PI / 2; m.renderOrder = 4; PIPEG.add(m);
    for (const s of [-1, 1]) { const nx = -(b[1] - a[1]) / L * 130 * s, ny = (b[0] - a[0]) / L * 130 * s; const e = new THREE.Mesh(new THREE.BoxGeometry(L, 7, 7), new THREE.MeshBasicMaterial({ color: '#2c3a52' })); e.position.set((a[0] + b[0]) / 2 + nx, (a[1] + b[1]) / 2 + ny, 14 + 130); e.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); PIPEG.add(e); } return L; };
  for (let i = 1; i < PIPE_PTS.length; i++) PIPE_LEN.push(seg(PIPE_PTS[i - 1], PIPE_PTS[i]));
  for (let i = 1; i < PIPE_PTS.length - 1; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(130, 20, 14), gm()); m.position.set(PIPE_PTS[i][0], PIPE_PTS[i][1], 14); m.renderOrder = 4; PIPEG.add(m); }
  PIPE_BLOBS = new THREE.InstancedMesh(new THREE.SphereGeometry(34, 10, 8), new THREE.MeshBasicMaterial({ color: '#3fb0e2' }), 22); PIPE_BLOBS.frustumCulled = false; PIPEG.add(PIPE_BLOBS);
  /* end icons: tap with glass, ear of corn */
  const board = (x, y) => { const g = new THREE.Group(); g.position.set(x, y, 14); PIPEG.add(g); K.box(g, 330, 270, 24, K.M('#fffdf5', '#d8d4e4', 0), [0, 0, 0], 2.6, null, 10); return g; };
  const b1 = board(1830, 1330), b2 = board(1830, 940);
  K.box(b1, 150, 26, 26, K.M('#5b82ad', '#8aa0c0'), [-30, 90, 20], 2, null, 6); K.box(b1, 26, 70, 26, K.M('#5b82ad', '#8aa0c0'), [30, 62, 20], 2, null, 6);
  const gl = K.makeGlassA({ water: '#58bfe8' }); gl.root.scale.setScalar(0.62); gl.root.position.set(30, -110, 24); gl.setFill(0.85); b1.add(gl.root);
  const cn = K.makeCornEar(); cn.scale.setScalar(0.85); cn.position.set(0, 0, 24); b2.add(cn);
  const pipeThin = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const m = K.box(PIPEG, L, 36, 36, K.M('#5b82ad', '#8aa0c0'), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 14], 2.4, null, 8); m.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); };
  pipeThin([1500, 1150], [1660, 1330]); pipeThin([1500, 1150], [1660, 940]);
}
const PUMP = K.makePumpIcon(); PUMP.scale.setScalar(1.3); PUMP.position.set(1090, 0, 150); ROOM.add(PUMP);
const CAL = K.makeCalendar({ n: 12, texts: ['', '', '', '', '', '', '', '', '', '', '', ''] }); CAL.root.position.set(-880, 340, 60); ROOM.add(CAL.root);
const CSTAND = new THREE.Group(); ROOM.add(CSTAND); K.box(CSTAND, 24, 300, 24, K.M('#8a5a3a', '#b08a7a'), [-1010, 150, 30], 2, [0, 0, 0.12], 3); K.box(CSTAND, 24, 300, 24, K.M('#8a5a3a', '#b08a7a'), [-750, 150, 30], 2, [0, 0, -0.12], 3);
const CLOUD1 = K.makeCloud(61, { s: 0.95, col: '#c3ccd8', tint: '#8a96aa' }); ROOM.add(CLOUD1);
const RAIN1 = K.makeRain({ n: 70, w: 300, d: 120, h: 480, r: 2.4, col: '#bfe0f5' }); ROOM.add(RAIN1);
const HALO = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: 0.4, depthWrite: false })); HALO.renderOrder = 3; ROOM.add(HALO);
const EMPTY = new THREE.Mesh(new THREE.BoxGeometry(836, 1, 322), new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: 0.0, depthWrite: false })); EMPTY.renderOrder = 5; ROOM.add(EMPTY);
const SUN = K.makeSun({ r: 130 }); ROOM.add(SUN);
const TH = K.makeThermo(); TH.scale.setScalar(1.7); ROOM.add(TH);
const N38 = K.numPlane('38', 300, 170, { bg: '#fff3a0', bd: '#1d2a44', k: 0.8 }); bill(N38); N38.visible = false; scene.add(N38);
const VAP = K.makeVapour({ n: 34, w: 760, h: 650 }); ROOM.add(VAP);
const SWEAT = new THREE.Mesh(new THREE.SphereGeometry(16, 10, 8).scale(1, 1.5, 1), new THREE.MeshBasicMaterial({ color: '#58bfe8' })); scene.add(SWEAT);
const QA = bill(mkQ()), QB = bill(mkQ()), QC = bill(mkQ()), QD = bill(mkQ()), QE = bill(mkQ()), QF = bill(mkQ());
/* balance scale + small tub + items */
const SCALE = K.makeBalanceScale(); ROOM.add(SCALE.root);
const TUB2 = K.makeBathtub(); TUB2.root.scale.setScalar(0.5); TUB2.root.position.set(0, 0, 430); ROOM.add(TUB2.root);
const ARRU = K.makeVArrowA('#e0322a', 54), ARRD = K.makeVArrowA('#2f9be0', 54); ROOM.add(ARRU, ARRD);
const mkItem = fn => { const g = new THREE.Group(); fn(g); g.visible = false; ROOM.add(g); return g; };
const ITEMS = [
  mkItem(g => { const cv = new THREE.CatmullRomCurve3([-110, -50, 0, 50, 110].map((x, i) => new THREE.Vector3(x, [20, -30, 25, -25, 20][i], 0))); const m = new THREE.Mesh(new THREE.TubeGeometry(cv, 30, 16, 8), new THREE.MeshBasicMaterial({ color: '#2f9be0' })); g.add(m); }),
  mkItem(g => { const c = K.makeCloud(63, { s: 0.42, col: '#b3bcc8', tint: '#8a96aa' }); g.add(c); }),
  mkItem(g => { const a = K.makeFlowArrow({ len: 190, w: 44, col: '#2f9be0' }); a.position.set(-95, 40, 0); a.rotation.z = -0.45; g.add(a); }),
  mkItem(g => { const s = K.makeSun({ r: 62 }); g.add(s); g.userData.sun = s; }),
  mkItem(g => { const p = K.makePumpIcon(); p.scale.setScalar(0.55); p.position.set(-40, -50, 0); g.add(p); }),
  mkItem(g => { const d = K.makeDamGate(); d.root.scale.setScalar(0.24); d.root.position.set(0, -50, 0); g.add(d.root); })];
const BDROPS = new THREE.InstancedMesh(new THREE.SphereGeometry(16, 10, 8).scale(1, 1.4, 1), new THREE.MeshBasicMaterial({ color: '#3fb0e2' }), 16); BDROPS.frustumCulled = false; ROOM.add(BDROPS);

/* relief map */
const MAPG = new THREE.Group(); MAPG.position.set(...ST.map); scene.add(MAPG);
const LAND_ASSETS = await K.loadLandMapAssets('../film_a/');
const LAND = K.makeLandMapA(LAND_ASSETS); MAPG.add(LAND.root);
const TOP = LAND.top, KCM = LAND.KC, KTZ = LAND.kinTopZ;
const HP = LAND.P(35.8, 33.33);
const SH = K.makeSnowHermon(); SH.root.position.set(HP[0], TOP, HP[1]); MAPG.add(SH.root);
const STREAMS = [];
{
  const mkStream = (wps, w, hexInk, hexMain) => {
    const v3 = wps.map(p => { const q = LAND.P(p[0], p[1]); return new THREE.Vector3(q[0], TOP + 2.4, q[1]); });
    const pts = new THREE.CatmullRomCurve3(v3, false, 'centripetal').getPoints(70).map(p => [p.x, p.y, p.z]);
    const ink = new THREE.Mesh(K.ribbonB(pts.map(p => [p[0], p[1] - 0.6, p[2]]), w + 3.2, 100), new THREE.MeshBasicMaterial({ color: hexInk, side: THREE.DoubleSide })); ink.frustumCulled = false; ink.renderOrder = 6; MAPG.add(ink);
    const fm = K.makeFlowMat({ base: hexMain, light: '#e4f8fb', speed: 0.9, freq: 1 });
    const m = new THREE.Mesh(K.ribbonB(pts, w, 16), fm); m.frustumCulled = false; m.renderOrder = 7; MAPG.add(m);
    const s = { pts, ink, m, fm, n: pts.length, draw(k) { const c = Math.floor(cl(k, 0, 1) * (pts.length - 1)) * 6; ink.geometry.setDrawRange(0, c); m.geometry.setDrawRange(0, c); ink.visible = m.visible = c > 0; }, at(u) { const f = cl(u, 0, 1) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), v = f - i; return [lerp(pts[i][0], pts[i + 1][0], v), pts[i][1], lerp(pts[i][2], pts[i + 1][2], v)]; } };
    s.draw(0); STREAMS.push(s); return s;
  };
  mkStream([[35.652, 33.248], [35.642, 33.222], [35.628, 33.196]], 6, '#1f6fb0', '#43aed0');
  mkStream([[35.696, 33.246], [35.676, 33.218], [35.648, 33.204], [35.628, 33.196]], 6, '#1f6fb0', '#43aed0');
  mkStream([[35.585, 33.285], [35.598, 33.24], [35.616, 33.212], [35.628, 33.196]], 6, '#1f6fb0', '#43aed0');
  const kp = LAND.P(35.6, 33.08);
  const jw = [[35.628, 33.196], [35.614, 33.15], [35.6, 33.08], [35.602, 33.02], [35.612, 32.96]]; const jv = jw.map(p => LAND.P(p[0], p[1]));
  const jv3 = jv.map(q => new THREE.Vector3(q[0], TOP + 2.4, q[1])); jv3.push(new THREE.Vector3(KCM[0] + 6, TOP + 2.4, KTZ + 3));
  const pts = new THREE.CatmullRomCurve3(jv3, false, 'centripetal').getPoints(90).map(p => [p.x, p.y, p.z]);
  const ink = new THREE.Mesh(K.ribbonB(pts.map(p => [p[0], p[1] - 0.6, p[2]]), 17, 100), new THREE.MeshBasicMaterial({ color: '#1f6fb0', side: THREE.DoubleSide })); ink.frustumCulled = false; ink.renderOrder = 6; MAPG.add(ink);
  const fm = K.makeFlowMat({ base: '#2f8fd0', light: '#bfe6f5', speed: 0.9, freq: 1 });
  const m = new THREE.Mesh(K.ribbonB(pts, 13, 20), fm); m.frustumCulled = false; m.renderOrder = 7; MAPG.add(m);
  const s = { pts, ink, m, fm, n: pts.length, draw(k) { const c = Math.floor(cl(k, 0, 1) * (pts.length - 1)) * 6; ink.geometry.setDrawRange(0, c); m.geometry.setDrawRange(0, c); ink.visible = m.visible = c > 0; }, at(u) { const f = cl(u, 0, 1) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), v = f - i; return [lerp(pts[i][0], pts[i + 1][0], v), pts[i][1], lerp(pts[i][2], pts[i + 1][2], v)]; } };
  s.draw(0); STREAMS.push(s);
}
const GLOWS = STREAMS.slice(0, 3).map(s => { const m = new THREE.Mesh(K.ribbonB(s.pts, 16, 100), new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = 5; MAPG.add(m); return m; });
const KDARK = (() => { const sh = new THREE.Shape(LAND.kinPoly.map(p => new THREE.Vector2(p[0], -p[1]))); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); g.translate(0, LAND.Y + 0.7, 0);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#0c3f78', transparent: true, opacity: 0, depthWrite: false })); m.renderOrder = 6; MAPG.add(m); return m; })();
const DX = KCM[0] - HP[0], DZ = KTZ - HP[1], ALEN = Math.hypot(DX, DZ);
const BIGARR = K.makeFlowArrow({ len: ALEN * 0.78, w: 60, col: '#2f9be0' }); BIGARR.rotation.y = Math.atan2(-DZ, DX); BIGARR.position.set(HP[0] + DX * 0.16, TOP + 22, HP[1] + DZ * 0.16); MAPG.add(BIGARR);
const KSPL = K.makeSplash({ r: 30 }); MAPG.add(KSPL);
const MCLOUD = K.makeCloud(55, { s: 0.2, col: '#ffffff', tint: '#dfe6f2' }); MAPG.add(MCLOUD);

/* mountain cut-away */
const CUTG = new THREE.Group(); CUTG.position.set(...ST.cut); scene.add(CUTG);
const SC = K.makeSpringCut(); CUTG.add(SC.root);
const PUDDLE = new THREE.Mesh(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#58bfe8' })); CUTG.add(PUDDLE);
const MARK = new THREE.Mesh(new THREE.SphereGeometry(26, 14, 10), new THREE.MeshBasicMaterial({ color: '#3fb0e2' })); CUTG.add(MARK);

/* real lake world */
const REAL = new THREE.Group(); scene.add(REAL);
const LAKE = K.makeKinneretLake({ level: 209.3 }); REAL.add(LAKE.root);
const hills = K.makeHills({ a0: 0, a1: Math.PI * 2, dists: [6200, 8600, 11500], base: '#86b35e', haze: '#cfe0e6', h: 750, n: 14 }); hills.position.y = -60; REAL.add(hills);
const PIER2 = K.makePier({ len: 700, w: 130, deckY: 100 }); PIER2.position.set(-740, 0, 250); REAL.add(PIER2);
const mkClouds = (col, tint, seed) => { const g = new THREE.Group(); [[-2600, 1500, -6800, 3.4], [2400, 1700, -7600, 3.8], [200, 1900, -8600, 4.2], [-4200, 1400, 1800, 3.2], [4600, 1600, 2600, 3.4]].forEach(([x, y, z, s], i) => { const c = K.makeCloud(i + seed, { s, col, tint }); c.position.set(x, y, z); g.add(c); }); REAL.add(g); return g; };
const cloudsRain = mkClouds('#b3bcc8', '#8a96aa', 31), cloudsClear = mkClouds('#ffffff', '#dfe6f2', 41);
const BIGCLOUD = K.makeCloud(77, { s: 4.2, col: '#aab4c2', tint: '#7e8aa0' }); BIGCLOUD.position.set(0, 1020, -150); REAL.add(BIGCLOUD);
const RAINL = K.makeRain({ n: 520, w: 1700, d: 1500, h: 1100, col: '#dbe8f2', r: 2.2, seed: 5 }); RAINL.position.set(0, -90, -150); REAL.add(RAINL);
const WAVE = new THREE.Mesh(new THREE.TorusGeometry(100, 6, 6, 56).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, depthWrite: false })); REAL.add(WAVE);
const SPL = K.makeSplash({ r: 150 }); REAL.add(SPL);
/* dry-lake dressing: pebble band, cracks, fish */
const DRY = new THREE.Group(); REAL.add(DRY);
{
  const OL = K.KINNERET_OUTLINE, rr = K.rng(91), lake = LAKE;
  const inward = (k, e) => { const p = OL[k], dx = -p[0], dz = -100 - p[1], l = Math.hypot(dx, dz) || 1; return [p[0] + dx / l * e, p[1] + dz / l * e]; };
  let n = 0; for (let k = 0; k < OL.length && n < 46; k += 3) { let e = 380; while (e < 560 && lake.sdf(...inward(k, e)) > -430) e += 10; const q = inward(k, e + rr() * 16 - 8); const st = K.makeStone(300 + k, 0.4 + rr() * 0.4); st.position.set(q[0], lake.heightAt(q[0], q[1]) - 4, q[1]); st.rotation.y = rr() * 6; DRY.add(st); n++; }
  const crackM = new THREE.MeshBasicMaterial({ color: '#5e4730', side: THREE.DoubleSide });
  for (let c = 0; c < 22; c++) { const k = Math.floor(rr() * OL.length), e = 200 + rr() * 200; let p = inward(k, e), a = rr() * 6.28; const pts = []; for (let s = 0; s < 6; s++) { pts.push([p[0], lake.heightAt(p[0], p[1]) + 2.5, p[1]]); a += (rr() - 0.5) * 1.4; const L = 40 + rr() * 50; p = [p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L]; }
    const m = new THREE.Mesh(K.ribbonB(pts, 6, 100), crackM); m.frustumCulled = false; DRY.add(m); }
}
const FISHL = [0, 1].map(i => { const f = K.makeFish(); f.root.scale.setScalar(1.1); const g = new THREE.Group(); g.add(f.root); REAL.add(g); return { f, g }; });

/* sections for the split screen */
const SECR = K.makeLakeSection({ level: 209.2 }); SECR.root.position.set(...ST.secR); scene.add(SECR.root);
const SECL = K.makeLakeSection({ level: 210.1 }); SECL.root.position.set(...ST.secL); scene.add(SECL.root);
{
  const c3 = K.makeCloud(83, { s: 1.6, col: '#b3bcc8', tint: '#8a96aa' }); c3.position.set(1050, 840, 0); SECR.root.add(c3);
  const sun = K.makeSun({ r: 150 }); sun.position.set(800, 900, 0); SECL.root.add(sun); SECL.sun = sun;
  const BED = [[40, 170], [150, 40], [300, -200], [560, -390], [900, -440]];
  const bandAt = (y) => { for (let i = 0; i < BED.length - 1; i++) if (BED[i][1] >= y && BED[i + 1][1] < y) return BED[i][0] + (BED[i + 1][0] - BED[i][0]) * (BED[i][1] - y) / (BED[i][1] - BED[i + 1][1]); return 900; };
  const yA = K.yOfLevel(209.2), yB = K.yOfLevel(210.1), x0 = bandAt(yA), x1 = bandAt(yB);
  const sh = new THREE.Shape(); const pts = []; for (let x = x0; x <= x1; x += 10) { let y = BED[0][1]; for (let i = 0; i < BED.length - 1; i++) if (x >= BED[i][0] && x <= BED[i + 1][0]) y = BED[i][1] + (BED[i + 1][1] - BED[i][1]) * (x - BED[i][0]) / (BED[i + 1][0] - BED[i][0]); pts.push([x, y + 1]); }
  pts.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])); for (let i = pts.length - 1; i >= 0; i--) sh.lineTo(pts[i][0], pts[i][1] - 30); sh.closePath();
  const wb = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: '#7a5a3a' })); wb.position.z = 103; SECL.root.add(wb);
}
/* calendar strip stage */
const STRIP = K.makeCalendarStrip(); STRIP.root.position.set(...ST.strip); scene.add(STRIP.root);
const TABLE = K.box(scene, 6200, 40, 1200, K.M('#b98a58', '#c8a88e'), [ST.strip[0] + 1760, ST.strip[1] - 22, ST.strip[2]], 2.6, null, 4);
const DROPL = null;

/* foreground blur pieces */
const fgs = { grass: K.makeFgBlur('grass', { w: 300, h: 190, col: '#5e8f3c', blur: 7 }), leaves: K.makeFgBlur('leaves', { w: 340, h: 200, col: '#4f7f3a', blur: 8 }), rock: K.makeFgBlur('rock', { w: 300, h: 200, col: '#7a7468', blur: 8 }), soap: K.makeFgBlur('rock', { w: 300, h: 190, col: '#f6a9c2', blur: 8 }) };
Object.values(fgs).forEach(f => { f.visible = false; scene.add(f); });
const PAN = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: false }));
{ const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'), g = c.createRadialGradient(128, 128, 20, 128, 128, 128); g.addColorStop(0, 'rgba(6,16,44,0.74)'); g.addColorStop(0.55, 'rgba(6,16,44,0.5)'); g.addColorStop(1, 'rgba(6,16,44,0.12)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  PAN.material.map = new THREE.CanvasTexture(cv); PAN.renderOrder = 20; PAN.frustumCulled = false; }
cam.add(PAN); PAN.position.set(0, 0, -50); PAN.scale.setScalar(50 * Math.tan(18 * Math.PI / 180) * 1.1); PAN.scale.x *= 16 / 9; PAN.visible = false;

/* ---------------------------------------------------------------- the cast */
function makeDrop(kind, sc) {
  const d = K.makeTipa({ kind }); d.root.scale.setScalar(sc);
  return { drop: d, root: d.root, base: sc, pose: po => { d.pose(Object.assign({}, po)); if (po.raw) po.raw.forEach((r, i) => { if (r) d.arms[i].rotation.set(-d.arms[i].userData.sz * (r.out || 0), -d.arms[i].userData.sz * (r.ry || 0), r.fw || 0); }); }, face: d.face };
}
const GD = makeDrop('big', 0.98), TP = makeDrop('tipa', 0.94);
const GU = (() => { const d = K.makeGust(); d.root.scale.setScalar(1.3); return { drop: d, root: d.root, base: 1.3, pose: po => d.pose(Object.assign({}, po)), face: d.face }; })();
scene.add(GD.root, TP.root, GU.root);
const TP_COL0 = TP.drop.mat.uniforms.uColor.value.clone(), TP_TNT0 = TP.drop.mat.uniforms.uTint.value.clone();
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
function camKeys(lt, keys, drop) {   // keys: [t, tg, D, az, el, fov]; content lifted so the lower 20 % stays free
  let i = 0; while (i < keys.length - 2 && lt > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)]; let u = b[0] > a[0] ? cl((lt - a[0]) / (b[0] - a[0]), 0, 1) : 0; u = 0.65 * sm(u) + 0.35 * u;
  const tg = [0, 1, 2].map(k => lerp(a[1][k], b[1][k], u)), D = Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), u)), az = lerp(a[3], b[3], u), el = lerp(a[4], b[4], u), fov = lerp(a[5] || 36, b[5] || 36, u);
  const p = orb(tg, D, az, el), f = new THREE.Vector3(tg[0] - p[0], tg[1] - p[1], tg[2] - p[2]).normalize(), r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(r, f);
  const s = (drop == null ? 0.11 : drop) * 2 * D * Math.tan(fov * Math.PI / 360);
  return { p: [p[0] - up.x * s, p[1] - up.y * s, p[2] - up.z * s], l: [tg[0] - up.x * s, tg[1] - up.y * s, tg[2] - up.z * s], fov };
}
const tmp = new THREE.Vector3(), QY = new THREE.Quaternion(), YAX = new THREE.Vector3(0, 1, 0);
const place = (o, dx, dy, dz) => { o.position.copy(cam.position).add(tmp.set(dx, dy, dz).applyQuaternion(cam.quaternion)); o.quaternion.copy(cam.quaternion); };

/* ================================================================ SHOT b1 : the bathtub */
function s0(t, lt, V, X, C) {
  V.room = V.tub = true;
  const k = kf([[0, 0.46], [5.6, 0.46], [12.0, 0.78], [28.3, 0.78], [35.6, 0.52], [60, 0.52]], lt);
  const flow = kf([[0, 0], [5.4, 0], [6.0, 1], [13.0, 1], [14.3, 0], [60, 0]], lt);
  const valve = kf([[0, 0], [12.7, 0], [14.3, 3.14], [60, 3.14]], lt);
  const drip = lt > 14.4 && lt < 17.8 ? 1 : 0;
  const cloudK = lt < 15.4 ? 1 : lt < 36.2 ? 1 - U(lt, 15.4, 18.4) : 0.8 * U(lt, 36.4, 37.2);
  const c5 = lt >= 36.2, pulse = 0.5 + 0.5 * Math.sin(t * 6);
  world(() => {
    TUB.root.scale.setScalar(Math.max(0.001, U(lt, 0, 1.0)));
    TUB.setLevel(k); TUB.showTaps([0, 1, 0]); TUB.setTap(1, flow); TUB.setValve(1, valve); TUB.setDrip(1, drip); TUB.setGlow(1, c5 ? 0.4 + 0.6 * pulse : 0); TUB.setExits(0, 0, 0); TUB.setGate(0); TUB.setMark(true);
    TUB.setDrop(0.78, k, lt > 28.6); TUB.update(t);
    CLOUD1.visible = cloudK > 0.02; CLOUD1.position.set(-150, 1180, -90); CLOUD1.scale.setScalar(Math.max(0.001, cloudK));
    RAIN1.visible = lt < 15.2 && cloudK > 0.5; RAIN1.position.set(-150, 720, -90); if (RAIN1.visible) RAIN1.userData.update(t);
    HALO.visible = c5; HALO.position.set(-150, 1180, -100); HALO.scale.set(330, 200, 1); HALO.material.opacity = 0.2 + 0.25 * pulse;
    EMPTY.visible = c5 && lt < 42.2; const top = TUB.levelY(k), hh = Math.max(1, TUB.RIM - top - 4); EMPTY.scale.y = hh; EMPTY.position.set(0, top + hh / 2, TUB.anchors.water()[2]); EMPTY.material.opacity = c5 ? 0.3 * (0.5 + 0.5 * Math.sin(lt * 5)) : 0;
    CAL.root.visible = lt >= 17; CSTAND.visible = lt >= 17; CAL.flip(kf([[19.8, 0], [26.8, 12], [99, 12]], lt));
    const q1 = lt > 20.6 && lt < 27.7; QA.visible = q1; QA.position.set(...rw(-880, 760, 90)); QA.scale.setScalar(0.9 * U(lt, 20.6, 21.3) + 0.001);
    QB.visible = c5 && lt < 42.4; QB.position.set(...rw(-150, 1470, -60)); QB.scale.setScalar(0.8 * U(lt, 36.8, 37.5) + 0.001);
    QC.visible = c5 && lt < 42.4; QC.position.set(...rw(0, 1010, 60)); QC.scale.setScalar(0.8 * U(lt, 37.2, 37.9) + 0.001);
  });
  const wy = TUB.levelY(k), tb = Math.max(TUB.FLOOR, wy - 45);
  const lookT = lt < 12.7 ? [0.3, 0.2] : lt < 19.8 ? [0.0, 0.9] : lt < 28.3 ? [-0.8, 0.2] : lt < 36.2 ? [0.8, 0.1] : [0, 0.9];
  C.T = act(po(rw(-90, tb, 14), -1.5, c5 && lt > 38.5 ? 'up' : 'down', floatOpt), fc(lt < 21.5 ? 'happy' : 'curious', 0.5, 1, lookT));
  const gp = rw(200, TUB.rimTop, -165);
  const g_up = lt >= 12.7 && lt < 15.5, g_pt = lt >= 24 && lt < 27.7;
  C.G = act(po(gp, g_up ? -2.87 : g_pt ? -2.93 : -1.7, g_up ? 'up' : g_pt ? 'point' : 'down', {}), fc('happy', 0.15, 0, c5 ? [-0.2, 0.9] : [0, 0]));
  C.G.vis = lt > 1.0;
  C.T.vis = lt > 0.35;
  X.cam = camKeys(lt, [[0, rw(0, 440, 0), 1800, 0.12, 0.10, 36], [5.5, rw(0, 420, 0), 1700, 0.15, 0.10, 36], [12.1, rw(40, 360, 0), 1350, 0.2, 0.02, 36], [12.7, rw(-40, 640, -40), 1300, 0.12, 0.06, 36], [19.2, rw(-40, 640, -40), 1250, 0.12, 0.06, 36],
    [19.8, rw(-400, 420, 0), 2000, -0.1, 0.08, 36], [27.7, rw(-380, 420, 0), 1900, -0.12, 0.08, 36], [28.3, rw(-160, 300, 0), 1000, 0.05, 0.04, 36], [35.6, rw(-160, 250, 0), 900, 0.05, 0.04, 36], [36.2, rw(-80, 640, 0), 2300, 0.1, 0.1, 38], [44.9, rw(-60, 640, 0), 2500, 0.08, 0.1, 38]]);
  if (lt >= 5.5 && lt < 12.1) X.fg = 'soap';
}

/* ================================================================ SHOT b2 : from Hermon */
const SNOWTINT = { c: colr('#cfe8ff'), t: colr('#9bbbe0') };
function s1(t, lt, V, X, C) {
  const tint = lt < 13.6 ? 1 : 1 - U(lt, 13.8, 15.6);
  world(() => { TP.drop.mat.uniforms.uColor.value.copy(TP_COL0).lerp(SNOWTINT.c, tint); TP.drop.mat.uniforms.uTint.value.copy(TP_TNT0).lerp(SNOWTINT.t, tint); });
  const G0 = (arms, f, hf, o) => actS(P0(arms), f, -0.80, -0.56, hf || 0.34, o);
  const mid = [(HP[0] + KCM[0]) / 2, (HP[1] + KTZ) / 2];
  if (lt < 7.1) {   // c1 : snow on Hermon
    V.map = true;
    world(() => { SH.setFlakes(1); SH.setCloud(1); SH.snow(t); LAND.setHula(0); STREAMS.forEach(s => s.draw(0)); GLOWS.forEach(g => { g.material.opacity = 0; }); BIGARR.visible = false; KSPL.visible = false; MCLOUD.visible = false; KDARK.material.opacity = 0; });
    const gp = LAND.P(35.735, 33.2);
    C.T = actW(po(mw(HP[0], TOP + SH.height + 6, HP[1]), -1.5, 'wave', { shadow: false }), fc('happy', 0.5, 1, [0.1, 0.3]), 0.12);
    C.G = actW(po(mw(gp[0], TOP, gp[1]), yawTo(mw(gp[0], 0, gp[1]), mw(HP[0], 0, HP[1])), 'point', {}), fc('happy', 0.15, 0, [0, 0.3]), 0.14);
    X.cam = camKeys(lt, [[0, mw(mid[0] + 40, TOP + 20, mid[1] + 20), 1050, 0.0, 0.72, 38], [7.1, mw(mid[0] + 60, TOP + 40, mid[1] - 10), 820, 0.1, 0.7, 36]]);
  } else if (lt < 13.6) {   // c2 : melt, underground, spring mouths
    V.cut = true; const l2 = lt - 7.4;
    const melt = U(lt, 7.6, 9.4), pathK = U(lt, 9.4, 11.8), mu = U(lt, 9.6, 12.2), emerge = U(lt, 12.3, 13.3);
    const topY = SC.yAt(-760) + 34;
    world(() => { SC.setMelt(melt); SC.snow(t); [0, 1, 2].forEach(i => SC.setPath(i, pathK)); SC.setMouth(0, U(lt, 12.0, 12.8)); SC.setMouth(1, U(lt, 12.0, 12.8)); SC.setMouth(2, U(lt, 12.1, 12.9));
      PUDDLE.visible = lt > 8.4 && lt < 10.2; PUDDLE.position.set(...[-760, topY + 2, 60]); PUDDLE.scale.set(60 * U(lt, 8.4, 9.4) * (1 - U(lt, 9.6, 10.2)) + 0.01, 1, 40 * U(lt, 8.4, 9.4) + 0.01);
      const pp = SC.pathPoint(0, mu); MARK.visible = lt > 9.5 && lt < 12.6; MARK.position.set(pp[0], pp[1], pp[2] + 6); });
    const sq = lt < 8.4 ? 1 : 1 - U(lt, 8.4, 9.6);
    const tpos = lt < 12.3 ? [-760, topY, 60] : [lerp(520, 540, emerge), SC.yAt(540) + 0, SC.FZ + 70];
    C.T = act(po(cw(...tpos), -1.5, lt < 8.4 ? 'wave' : 'up', { shadow: false, squash: 0.2 * (1 - sq) }), fc(lt < 9 ? 'surprised' : 'happy', 0.5, 1, [0.2, 0.2]), lt < 8.4 ? 1 : lt < 12.3 ? 0.001 : Math.max(0.001, emerge));
    if (lt >= 8.4 && lt < 9.6) C.T.sc = Math.max(0.001, sq);
    C.G = G0('down', fc('happy', 0.15, 0, [0.5, 0.2]), 0.3);
    X.cam = camKeys(lt, [[7.1, cw(-700, topY + 60, 40), 1100, 0.05, 0.05, 36], [9.4, cw(-300, 330, 40), 1550, 0.0, 0.05, 36], [12.0, cw(520, 170, 40), 1150, 0.0, 0.05, 36], [13.6, cw(540, 170, 40), 1050, 0.0, 0.05, 36]]);
  } else if (lt < 20.7) {   // c3 : three streams light up one by one
    V.map = true; const st0 = [14.2, 16.4, 18.6];
    world(() => { SH.setFlakes(0.3); SH.setCloud(0.6); SH.snow(t); LAND.setHula(0); STREAMS.slice(0, 3).forEach((s, i) => s.draw(U(lt, st0[i], st0[i] + 1.9))); STREAMS[3].draw(0);
      GLOWS.forEach((g, i) => { const on = lt >= st0[i] && lt < st0[i] + 2.4 ? 1 - U(lt, st0[i] + 1.2, st0[i] + 2.4) : 0; g.material.opacity = 0.7 * on; });
      BIGARR.visible = false; KSPL.visible = false; MCLOUD.visible = false; KDARK.material.opacity = 0; });
    const ai = lt < 16.4 ? 0 : lt < 18.6 ? 1 : 2, u = U(lt, st0[ai], st0[ai] + 1.9), pp = STREAMS[ai].at(u);
    C.T = actW(po(mw(pp[0], pp[1] + 4, pp[2]), -1.5, 'down', { shadow: false, tilt: 78 }), fc('happy', 0.5, 1, [0.2, 0.3]), 0.1);
    C.G = G0('point', fc('happy', 0.15, 0, [0, 0]), 0.34, { yawOff: 0.6 });
    const cs = i => { const q = STREAMS[i].at(0.55); return mw(q[0], TOP, q[2]); };
    X.cam = camKeys(lt, [[13.6, cs(0), 320, 0.0, 0.85, 34], [15.8, cs(0), 300, 0.0, 0.85, 34], [16.6, cs(1), 300, 0.0, 0.85, 34], [18.0, cs(1), 300, 0.0, 0.85, 34], [18.8, cs(2), 300, 0.0, 0.85, 34], [20.7, mw(STREAMS[0].pts[70][0], TOP, STREAMS[0].pts[70][2] + 40), 420, 0.0, 0.8, 34]]);
  } else if (lt < 27.9) {   // c4 : the Hula, the Jordan
    V.map = true; const jk = U(lt, 21.4, 27.0);
    world(() => { LAND.setHula(0); STREAMS.slice(0, 3).forEach(s => s.draw(1)); STREAMS[3].draw(jk); GLOWS.forEach(g => { g.material.opacity = 0; }); SH.setFlakes(0.2); SH.setCloud(0.4); SH.snow(t); BIGARR.visible = false; KSPL.visible = false; MCLOUD.visible = false; KDARK.material.opacity = 0; });
    const pp = STREAMS[3].at(U(lt, 21.4, 27.4));
    C.T = actW(po(mw(pp[0], pp[1] + 6, pp[2]), -1.5, 'up', { shadow: false, float: 1, feet: false }), fc('happy', 0.5, 1, [0.1, 0.3]), 0.1);
    C.G = G0('down', fc('happy', 0.15, 0, [0.4, 0.2]), 0.34);
    const m0 = STREAMS[3].at(0.0), m1 = STREAMS[3].at(0.55);
    X.cam = camKeys(lt, [[20.7, mw(m0[0], TOP, m0[2] + 40), 560, -0.55, 0.95, 36], [27.9, mw(m1[0], TOP, m1[2]), 620, -0.5, 0.5, 36]]);
  } else if (lt < 34.4) {   // c5 : pours into the Kinneret
    V.map = true; const dark = U(lt, 29.4, 33.8);
    world(() => { LAND.setHula(0); STREAMS.slice(0, 3).forEach(s => s.draw(1)); STREAMS[3].draw(1); GLOWS.forEach(g => { g.material.opacity = 0; }); SH.setFlakes(0.2); SH.setCloud(0.4); SH.snow(t); BIGARR.visible = false; MCLOUD.visible = false; KDARK.material.opacity = 0.34 * dark;
      KSPL.visible = lt > 31.0 && lt < 33.4; KSPL.position.set(KCM[0] + 6, LAND.Y + 2, KTZ + 20); KSPL.userData.update(U(lt, 31.0, 33.4)); });
    const run = U(lt, 28.4, 31.0), pp = STREAMS[3].at(run);
    const inLake = lt >= 31.0, tpos = inLake ? [KCM[0] + 6, LAND.Y + 3, KTZ + 24 + 4 * Math.sin(t * 2)] : [pp[0], pp[1] + 6, pp[2]];
    C.T = actW(po(mw(...tpos), -1.5, inLake ? 'up' : 'down', { shadow: false, float: 1, feet: false }), fc(inLake ? 'cheering' : 'happy', 0.5, 1, [0.1, 0.3]), 0.1);
    const wp = [LAND.kinWestAtMid - 36, TOP, KCM[1] - 40];
    C.G = actW(po(mw(...wp), yawTo(mw(...wp), mw(KCM[0], 0, KTZ)), 'down', {}), fc('happy', 0.15, 0, [0.5, 0.1]), 0.1);
    X.cam = camKeys(lt, [[27.9, mw(KCM[0] - 30, TOP, KTZ + 60), 470, -0.2, 0.6, 34], [34.4, mw(KCM[0] - 20, TOP, KTZ + 70), 430, 0.0, 0.62, 34]]);
  } else {   // c6 : the huge arrow
    V.map = true; const grow = U(lt, 35.0, 36.8);
    world(() => { LAND.setHula(0); STREAMS.slice(0, 4).forEach(s => s.draw(1)); GLOWS.forEach(g => { g.material.opacity = 0; }); SH.setFlakes(0.6); SH.setCloud(0.8); SH.snow(t); KSPL.visible = false; MCLOUD.visible = false; KDARK.material.opacity = 0.34;
      BIGARR.visible = grow > 0.01; BIGARR.scale.set(Math.max(0.001, grow), 1, 1); });
    const tip = [HP[0] + DX * (0.16 + 0.78 * 0.92), TOP + 62, HP[1] + DZ * (0.16 + 0.78 * 0.92)];
    C.T = actW(po(mw(...tip), -1.5, 'up', { shadow: false }), fc('cheering', 0.5, 1, [0.1, 0.2]), 0.1); C.T.vis = grow > 0.7;
    C.G = G0('down', fc('happy', 0.15, 0, [0.4, 0.2]), 0.34, {}); C.G.po.tilt = 6 * Math.sin(t * 2.2) * (lt > 38);
    X.cam = camKeys(lt, [[34.4, mw(mid[0], TOP, mid[1]), 700, 0.0, 0.7, 36], [42.7, mw(mid[0] + 30, TOP, mid[1] + 20), 1850, 0.0, 0.75, 38]]);
  }
}

/* ================================================================ SHOT b3 : rain and streams */
const gY = (x, z) => LAKE.heightAt(x, z);
const LSTREAMS = (() => {
  const out = []; const mat = K.makeFlowMat({ base: '#43aed0', light: '#e4f8fb', speed: 1.3, freq: 1 });
  [-520, -80, 330, 700].forEach(z => { const ed = LAKE.edgesAt(z); for (const sd of [-1, 1]) { const x0 = (sd < 0 ? ed[0] : ed[1]) + sd * 560, x1 = (sd < 0 ? ed[0] : ed[1]) - sd * 20; const pts = []; for (let i = 0; i <= 18; i++) { const x = lerp(x0, x1, i / 18), zz = z + 30 * Math.sin(i * 0.7 + z); pts.push([x, gY(x, zz) + 6, zz]); }
      const m = new THREE.Mesh(K.ribbonB(pts, 26, 50), mat); m.frustumCulled = false; m.renderOrder = 5; REAL.add(m); const a = K.makeFlowArrow({ len: 150, w: 34, col: '#2f9be0' }); REAL.add(a); out.push({ pts, m, a }); } });
  out.mat = mat; return out;
})();
const tanAt = (pts, u) => { const f = cl(u, 0, 0.999) * (pts.length - 1), i = Math.floor(f), v = f - i, a = pts[i], b = pts[i + 1]; return { p: [lerp(a[0], b[0], v), lerp(a[1], b[1], v) + 14, lerp(a[2], b[2], v)], d: new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize() }; };
const lakeWorld = (L, rainK) => { LAKE.setLevel(L); LAKE.setRain(rainK); LAKE.update(CT); };
function s2(t, lt, V, X, C) {
  const Gs = (arms, f, hf, o) => actS(P0(arms), f, 0.8, -0.56, hf || 0.3, o);
  if (lt < 14.7) {   // c1 + c2 : real lake, rain
    V.real = true; V.rainSky = true; world(() => { lakeWorld(209.3, 1); BIGCLOUD.visible = true; RAINL.visible = true; RAINL.userData.update(t); WAVE.visible = false; SPL.visible = false; DRY.visible = false; FISHL.forEach(f => { f.g.visible = false; }); });
    const Yw = K.yOfLevel(209.3);
    if (lt < 8.3) {
      const x = -90, z = 520, y = Yw + LAKE.float(x, z, 60).y - LAKE.water.position.y;
      C.T = actW(po([x, y, z], -1.45, 'down', floatOpt), fc('happy', 0.5, 1, [0.2, 0.9]), 0.17); C.T.f.talk = (lt > 3 && frac(t * 1.7) < 0.6) ? 'A' : undefined;
      const gp = [-780, gY(-780, 260), 260]; C.G = actW(po(gp, -0.6, 'down', {}), fc('happy', 0.15, 0, [0.3, 0.2]), 0.17);
      X.cam = camKeys(lt, [[0, [-120, 40, 100], 2600, 0.32, 0.3, 46], [8.3, [-120, 40, 100], 2450, 0.36, 0.3, 46]], 0.04);
    } else {
      const tt = cl((lt - 8.6) / 5.8, 0, 0.999), hop = Math.min(3, Math.floor(tt * 4)), xs = [-640, -380, 360, 640].map((v, i) => v), zi = [-80, 330, -80, 330];
      const sx = (a, b, u) => lerp(a, b, sm(cl(u, 0, 1))), u = frac(tt * 4), i0 = Math.min(3, hop), i1 = Math.min(3, hop + 1);
      const x = sx(LSTREAMS[0 + i0 * 2].pts[18][0] + 40, LSTREAMS[0 + i1 * 2].pts[18][0] + 40, cl((u - 0.2) / 0.6, 0, 1)), z = sx(LSTREAMS[0 + i0 * 2].pts[18][2], LSTREAMS[0 + i1 * 2].pts[18][2], cl((u - 0.2) / 0.6, 0, 1));
      C.T = actW(po([x, gY(x, z), z], -1.5, 'down', { walk: 1, ph: tt * 4, hopH: 60 }), fc('happy', 0.5, 1, [0.3, 0.3]), 0.17);
      C.G = Gs('down', fc('happy', 0.15, 0, [-0.5, 0.2]), 0.3);
      X.cam = camKeys(lt, [[8.3, [0, 150, -420], 1100, 0.0, 0.14, 62], [14.7, [0, 150, -380], 1000, 0.05, 0.14, 62]]);
    }
    world(() => { LSTREAMS.forEach((s, i) => { s.m.visible = lt >= 8.3; s.a.visible = lt >= 8.3; const r = tanAt(s.pts, frac(t * 0.22 + i * 0.13)); s.a.position.set(...r.p); s.a.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), r.d); }); LSTREAMS.mat.uniforms.uT.value = t; });
  } else if (lt < 20.8) {   // c3 : split screen
    V.secs = true; world(() => { SECR.setLevel(209.2); SECR.setRain(1); SECR.update(t); SECL.setLevel(210.1); SECL.setRain(0); SECL.update(t); SECL.sun.userData.update(t); });
    X.split = [{ p: sw('secL', 520, 380, 2750), l: sw('secL', 520, 120, 0), fov: 40 }, { p: sw('secR', 840, 380, 2750), l: sw('secR', 840, 120, 0), fov: 40 }];
    C.T = act(po(sw('secL', -120, 172, 120), -1.3, 'down', { tilt: 6 }), fc('tired', 0.5, 1, [0.5, 0.3]), 1.4);
    C.G = act(po(sw('secR', 1560, 235, 120), -2.1, 'point', {}), fc('happy', 0.15, 0, [-0.4, 0.1]), 1.4); C.G.po.yaw = -2.2;
  } else if (lt < 29.4) {   // c4 : the dry lake
    V.real = true; world(() => { lakeWorld(209.95, 0); BIGCLOUD.visible = false; RAINL.visible = false; WAVE.visible = false; SPL.visible = false; DRY.visible = true; LSTREAMS.forEach(s => { s.m.visible = false; s.a.visible = false; });
      FISHL.forEach((f, i) => { f.g.visible = true; const p = [-120 + i * 40, 150 - i * 170]; f.g.position.set(p[0] - 350, gY(p[0] - 350, p[1] + 360) + 10, p[1] + 360); f.g.rotation.set(1.45, 0.5 * i, 0.3 * Math.sin(t * 9 + i * 2)); f.f.pose({ t, x: 0, y: 0, z: 0, yaw: 0, swim: 1, shadow: false }); }); });
    const tx = -250, tz = 300; C.T = actW(po([tx, gY(tx, tz) + 4, tz], -1.4, 'down', { tilt: 8 }), fc('tired', 0.5, 1, [0.4, -0.2]), 0.2);
    const gx = -60, gz = 330; C.G = actW(po([gx, gY(gx, gz) + 4, gz], -2.1, 'down', { raw: [{ out: 0.25 }, { out: 1.35, fw: 0.9 }] }), fc('worried', 0.15, 0, [-0.5, -0.1]), 0.22);
    X.cam = camKeys(lt, [[20.8, [-300, -250, 300], 1300, -0.75, 0.3, 40], [29.4, [-300, -255, 300], 1000, -0.6, 0.26, 40]]);
  } else if (lt < 35.5) {   // c5 : the calendar strip
    V.strip = true; const fly = U(lt, 29.7, 31.4), hopU = U(lt, 31.2, 34.8);
    world(() => { STRIP.setGlow(0.4 + 0.6 * U(lt, 30.2, 31.6) * (0.7 + 0.3 * Math.sin(t * 5))); });
    const tx = lerp(STRIP.tileX(4), STRIP.tileX(8), hopU), ph = hopU * 4.0;
    C.T = act(po(sw('strip', tx, STRIP.topY, 0), -1.1, 'down', { walk: hopU > 0 && hopU < 1 ? 1 : 0, ph, hopH: 70 }), fc('happy', 0.5, 1, [0.4, 0.2]), 1.2);
    C.G = Gs('point', fc('happy', 0.15, 0, [0, 0]), 0.3, { yawOff: 0.6 });
    const cx = lt < 31.4 ? lerp(STRIP.tileX(0), STRIP.tileX(4), fly) : tx - 100;
    X.cam = camKeys(lt, [[29.4, sw('strip', STRIP.tileX(0), 0, 0), 1500, 0.0, 0.6, 36], [31.4, sw('strip', STRIP.tileX(4) - 150, 0, 0), 1500, 0.0, 0.6, 36], [35.5, sw('strip', STRIP.tileX(8) - 100, 0, 0), 1500, 0.0, 0.6, 36]], 0.0);
  } else {   // c6 : the huge drop
    V.real = true; const fall = U(lt, 36.2, 40.0), imp = lt >= 40.0, ui = U(lt, 40.0, 42.4);
    world(() => { lakeWorld(209.2, imp ? 0.6 : 0); BIGCLOUD.visible = false; RAINL.visible = false; DRY.visible = false; FISHL.forEach(f => { f.g.visible = false; }); LSTREAMS.forEach(s => { s.m.visible = false; s.a.visible = false; });
      const Yw = K.yOfLevel(209.2); SPL.visible = imp; SPL.position.set(0, Yw + 4, 100); SPL.userData.update(Math.min(0.999, ui * 1.2)); WAVE.visible = imp; WAVE.position.set(0, Yw + 5, 100); WAVE.scale.setScalar(0.3 + 11 * ui); WAVE.material.opacity = 0.75 * (1 - ui); });
    const Yw = K.yOfLevel(209.2), y = lt < 40 ? lerp(Yw + 1900, Yw - 20, fall * fall) : Yw - 20 + 6 * Math.sin(t * 2.3);
    C.T = act(po([0, y, 100], -1.5, lt < 40 ? 'up' : 'up', { squash: imp ? 0.3 * (1 - ui) : -0.1, shadow: false }), fc('happy', 0.5, 1, [0.1, 0.3]), lt < 40 ? 1.8 : lerp(1.8, 1.0, U(lt, 40.0, 41.6)));
    const gp = [-760, gY(-760, 260), 260]; C.G = actW(po(gp, -0.7, 'up', { raw: [{ out: 1.0 + 0.4 * Math.sin(t * 9) }, { out: 1.0 - 0.4 * Math.sin(t * 9) }] }), fc('cheering', 0.15, 0, [0.3, 0.3]), 0.17);
    X.cam = camKeys(lt, [[35.5, [0, 700, 50], 2700, 0.1, 0.2, 40], [40.0, [0, 100, 90], 2400, 0.06, 0.18, 40], [44.5, [0, 120, 90], 2500, 0.1, 0.2, 40]]);
  }
}

/* ================================================================ SHOT b4 : where does it go out */
const LV4 = [[0, 0.5], [1.0, 0.5], [7.0, 0.74], [14.7, 0.74], [15.3, 0.74], [23.2, 0.64], [23.8, 0.64], [31.0, 0.42], [31.7, 0.42], [40.5, 0.36], [41.4, 0.36], [45.2, 1.0], [47.5, 0.93]];
const pathAt = u => { const tot = PIPE_LEN.reduce((a, b) => a + b, 0); let d = cl(u, 0, 1) * tot, i = 0; while (i < PIPE_LEN.length - 1 && d > PIPE_LEN[i]) { d -= PIPE_LEN[i]; i++; } const v = d / PIPE_LEN[i], a = PIPE_PTS[i], b = PIPE_PTS[i + 1]; return [lerp(a[0], b[0], v), lerp(a[1], b[1], v)]; };
function s3(t, lt, V, X, C) {
  V.room = V.tub = true;
  const k = kf(LV4, lt);
  const flow = kf([[0, 0], [1.0, 0], [1.4, 1], [7.4, 1], [8.2, 0], [41.0, 0], [41.4, 1], [45.4, 1], [46.0, 0], [60, 0]], lt);
  const c1 = lt < 8, ex = [U(lt, 8.4, 9.0), U(lt, 9.6, 10.2) * (lt < 31.5 ? 1 : 0), U(lt, 10.8, 11.4)];
  const sunOut = lt < 15.3 ? ex[0] : 0, pipeOut = lt < 31.7 ? ex[1] : 0, gateOut = lt < 46.0 ? ex[2] : 0;
  const gateK = kf([[0, 0], [46.0, 0], [47.0, 1], [60, 1]], lt);
  const c3 = lt >= 15.3 && lt < 23.8, c5 = lt >= 31.7 && lt < 43.6, c6 = lt >= 43.6;
  const temp = U(lt, 16.5, 22.0);
  world(() => {
    TUB.root.scale.setScalar(1); TUB.setLevel(k); TUB.showTaps([1, 1, 1]); for (let i = 0; i < 3; i++) { TUB.setTap(i, flow); TUB.setValve(i, 0); TUB.setDrip(i, 0); TUB.setGlow(i, lt >= 1.4 + 0.8 * i && lt < 7.4 ? 0.5 + 0.5 * Math.sin(t * 6 + i) : (lt >= 41.4 && lt < 45.6 ? 0.5 : 0)); }
    TUB.setExits(sunOut, pipeOut, gateOut); TUB.setGate(gateK); TUB.setMark(true); TUB.setDrop(0.64, k, lt >= 24.4 && lt < 31.6); TUB.update(t);
    CLOUD1.visible = false; RAIN1.visible = false; HALO.visible = false; EMPTY.visible = false; CAL.root.visible = false;
    SUN.visible = c3 || (lt >= 23.8 && lt < 31.6); SUN.position.set(560, 900, -60); SUN.scale.setScalar(1.7 * (c3 ? U(lt, 15.4, 16.4) : 1) + 0.001); SUN.userData.update(t);
    TH.visible = c3 || (lt >= 23.8 && lt < 31.6); TH.position.set(-720, 40, 260); TH.userData.setTemp(c3 ? temp : 1);
    N38.visible = c3 && temp > 0.97; N38.position.set(...rw(-720, 700, 280)); N38.scale.setScalar(1.3);
    VAP.visible = (c3 && lt > 17) || (lt >= 23.8 && lt < 31.6); VAP.position.set(0, TUB.levelY(k), 14); VAP.userData.setK(c3 ? U(lt, 16.8, 19) : 1); VAP.userData.update(t);
    PIPEG.visible = c5; PUMP.visible = c5; if (c5) { PUMP.userData.setAngle(t * 5); PUMP.userData.setCross(0);
      const tot = PIPE_LEN.reduce((a, b) => a + b, 0); const d = new THREE.Object3D(); for (let i = 0; i < 22; i++) { const u = frac(i / 22 + t * 0.07), p = pathAt(u); d.position.set(p[0], p[1], 14); d.scale.setScalar(u < 0.02 ? 0.001 : 0.6 + 0.2 * Math.sin(i)); d.updateMatrix(); PIPE_BLOBS.setMatrixAt(i, d.matrix); } PIPE_BLOBS.instanceMatrix.needsUpdate = true; }
    const q1 = lt > 11.5 && lt < 14.5; QD.visible = q1; QD.position.set(...rw(150, 1250, 80)); QD.scale.setScalar(0.9 * U(lt, 11.5, 12.1) + 0.001);
    const sweat = c3 && lt > 18.5 ? frac((lt - 18.5) * 0.9) : -1; SWEAT.visible = sweat >= 0 && lt < 23.5; SWEAT.position.set(...rw(-40, Math.max(TUB.FLOOR, TUB.levelY(k) - 150) + 190 - sweat * 70, 90));
  });
  const wy = TUB.levelY(k);
  /* the student */
  let tpos = [-90, Math.max(TUB.FLOOR, wy - 45), 14], tarms = 'down', texp = 'happy', tlook = [0, 0.7];
  if (c3) { texp = 'tired'; tlook = [0.2, 0.5]; }
  if (lt >= 23.8 && lt < 31.7) { texp = 'curious'; tlook = [0.8, 0.1]; }
  if (c5) { texp = 'cheering'; tarms = 'up'; const into = U(lt, 31.7, 33.4), ride = U(lt, 33.6, 41.5); if (ride <= 0) tpos = [lerp(-90, 466, into), Math.max(TUB.FLOOR, wy - 45), 14]; else { const pp = pathAt(ride); tpos = [pp[0], pp[1] - 118, 14]; } tlook = [0.3, 0.3]; }
  if (c6) { texp = lt >= 46 ? 'cheering' : 'curious'; tarms = lt >= 46 ? 'up' : 'down'; tpos = [-90, Math.max(TUB.FLOOR, wy - 45), 14]; tlook = [0.5, 0.2]; }
  C.T = act(po(rw(...tpos), -1.5, tarms, c5 ? { shadow: false } : floatOpt), fc(texp, 0.5, 1, tlook));
  /* the guide */
  let gp = [200, TUB.rimTop, -165], gyaw = -1.7, garms = 'down', gexp = 'happy', graw = null;
  if (lt < 8) { const ti = lt < 3.2 ? 0 : lt < 5.4 ? 1 : 2; const tx = [-260, 0, 260][ti]; gp = [120, TUB.rimTop, -165]; gyaw = yawTo([120, 0, -165], [tx, 0, 30]); garms = 'point'; }
  else if (lt < 15.3) { gp = [120, TUB.rimTop, -165]; garms = 'up'; gyaw = -1.6; }
  else if (c3) { gexp = 'tired'; garms = 'up'; graw = [{ out: 2.35, fw: 1.0 + 0.2 * Math.sin(t * 6) }, { out: 0.2 }]; gyaw = -1.8; }
  else if (c5) { gp = [1290, 0, 150]; gyaw = -2.2; graw = [{ out: 0.25 }, { out: 1.2 + 0.4 * Math.sin(t * 5), fw: 0.4 }]; }
  else if (c6) { const aside = U(lt, 45.6, 46.4); gp = [lerp(330, 100, aside), TUB.rimTop, -165]; if (aside < 0.5) { graw = [{ out: 1.55 }, { out: 0.2 }]; gexp = 'worried'; } gyaw = -1.8; }
  C.G = act(po(rw(...gp), gyaw, garms, graw ? { raw: graw } : {}), fc(gexp, 0.15, 0, [0, 0.1]));
  if (c3) { C.S = act(po(rw(lerp(-1300, 1300, U(lt, 18.0, 23.0)), 700, 130), 0, 'down', { blow: 1 }), { expr: 'neutral', blink: false, blow: 1 }); C.S.vis = lt > 18.0 && lt < 23.6; }
  X.cam = camKeys(lt, [[0, rw(0, 560, 0), 1900, 0.1, 0.1, 36], [1.0, rw(0, 560, 0), 1800, 0.1, 0.1, 36], [7.6, rw(0, 580, 0), 1700, 0.0, 0.08, 36], [8.2, rw(300, 600, 0), 2500, 0.0, 0.08, 36], [14.7, rw(300, 620, 0), 2500, 0.04, 0.08, 36], [15.3, rw(80, 620, 0), 2700, 0.0, 0.08, 36], [23.2, rw(80, 620, 0), 2800, 0.0, 0.08, 36],
    [23.8, rw(-200, wy, 0), 950, 0.08, 0.04, 36], [31.1, rw(-200, TUB.levelY(0.42), 0), 900, 0.08, 0.04, 36], [31.7, rw(800, 640, 0), 3900, 0.0, 0.06, 36], [43.0, rw(800, 640, 0), 3800, 0.0, 0.06, 36], [43.6, rw(380, 430, 0), 2600, 0.12, 0.06, 36], [47.5, rw(400, 380, 0), 2300, 0.14, 0.06, 36]]);
}

/* ================================================================ SHOT b4b : the balance-scale game */
const ITEM_T0 = [8.9, 10.7, 12.5, 16.3, 18.1, 19.9];
const STAGE_X = [150, 300, 450, -150, -300, -450];
function s4(t, lt, V, X, C) {
  V.room = V.scale = true;
  let tilt = 0;
  const landT = i => ITEM_T0[i] + 2.1;
  for (let i = 0; i < 3; i++) if (lt >= landT(i)) tilt += 0.05; for (let i = 3; i < 6; i++) if (lt >= landT(i)) tilt -= 0.05;
  tilt += 0.2 * U(lt, 23.4, 28.6) - 0.0; if (lt >= 30.6) tilt = lerp(0.2 + 0, -0.22, U(lt, 30.6, 35.6)) + 0; else if (lt >= 23.4) tilt = 0.2 * U(lt, 23.4, 28.6);
  const lvl = lt < 23.4 ? 0.5 : lt < 30.6 ? lerp(0.5, 0.78, U(lt, 23.4, 29.0)) : lerp(0.78, 0.28, U(lt, 30.6, 36.0));
  world(() => {
    SCALE.setTilt(tilt); TUB.root.visible = false; TUB2.root.visible = true; TUB2.setLevel(lvl); TUB2.showTaps([0, 0, 0]); TUB2.setMark(true); TUB2.setExits(0, 0, 0); TUB2.setGate(0); TUB2.setDrop(0, 0, false); TUB2.update(t);
    CLOUD1.visible = RAIN1.visible = HALO.visible = EMPTY.visible = CAL.root.visible = false;
    ITEMS.forEach((g, i) => { const t0 = ITEM_T0[i], land = landT(i), pin = i < 3, pan = SCALE.panTop(pin ? 'in' : 'out'), k = i % 3, st = [STAGE_X[i], 190, 330];
      g.visible = lt >= t0; if (!g.visible) return; let p;
      if (lt < t0 + 1.5) p = st; else if (lt < land) { const u = (lt - (t0 + 1.5)) / (land - t0 - 1.5), s0 = [st[0], st[1], st[2]]; p = [lerp(s0[0], pan[0], u), lerp(s0[1], pan[1] + 40, u) + 320 * Math.sin(Math.PI * u), lerp(s0[2], 0, u)]; } else p = [pan[0] + (k - 1) * 70, pan[1] + 50, 0];
      g.position.set(p[0], p[1], p[2]); g.rotation.y = 0; if (g.userData.sun) g.userData.sun.userData.update(t);
      const q = i === 0 ? QE : i === 1 ? QF : i === 2 ? QD : null; });
    BDROPS.visible = lt >= 23.4 && lt < 30.6; if (BDROPS.visible) { const pan = SCALE.panTop('in'), d = new THREE.Object3D(); for (let i = 0; i < 16; i++) { const u = frac(i * 0.137 + t * 0.9); d.position.set(pan[0] + ((i * 53) % 220) - 110, pan[1] + 900 * (1 - u) + 20, ((i * 37) % 100) - 50); d.scale.setScalar(u > 0.97 ? 0.001 : 1); d.updateMatrix(); BDROPS.setMatrixAt(i, d.matrix); } BDROPS.instanceMatrix.needsUpdate = true; }
    ARRU.visible = lt >= 24.6 && lt < 30.6; ARRD.visible = lt >= 31.2; ARRU.position.set(420, 80, 470); ARRD.position.set(420, 400, 470);
    if (ARRU.visible) ARRU.userData.setLen(260 * U(lt, 24.6, 26.0)); if (ARRD.visible) ARRD.userData.setLen(-260 * U(lt, 31.2, 32.6));
    QE.visible = lt > 1.2 && lt < 4.2; QE.position.set(...rw(0, 1250, 0)); QE.scale.setScalar(0.9 * U(lt, 1.2, 1.8) + 0.001);
    [[QF, 0], [QD, 1]].forEach(([q, ki], j) => { q.visible = false; });
    ITEMS.forEach((g, i) => { if (lt >= ITEM_T0[i] && lt < ITEM_T0[i] + 1.5) { const q = [QF, QD, QC, QB, QA, QC][i]; q.visible = true; q.position.set(...rw(STAGE_X[i], 470, 330)); q.scale.setScalar(0.5 * U(lt, ITEM_T0[i] + 0.2, ITEM_T0[i] + 0.7) + 0.001); } });
  });
  /* student */
  let tp, tarms = 'down', texp = 'curious', tsc = 1, tlook = [0, 0.4], hop = {};
  const runI = ITEM_T0.findIndex((t0, i) => lt >= t0 + 0.9 && lt < t0 + 2.1 + 0.6);
  if (lt < 8.8) { tp = [-60 + 40 * Math.sin(t * 1.5), 0, 400]; hop = { walk: 1, ph: t * 0.8, hopH: 40 }; texp = 'surprised'; tarms = 'up'; }
  else if (lt < 23.4) { const near = ITEM_T0.reduce((b, t0, i) => (lt >= t0 - 0.3 ? i : b), 0); const sx = STAGE_X[near] + (near < 3 ? -170 : 170); tp = [sx, 0, 400]; hop = { walk: 1, ph: lt * 0.9, hopH: 40 }; texp = 'cheering'; tarms = lt - ITEM_T0[near] > 1.2 ? 'up' : 'down'; }
  else { const wy2 = TUB2.levelY(lvl); tp = [-20, 0.5 * Math.max(TUB2.FLOOR, wy2 - 150), 430]; tsc = 0.5; hop = floatOpt; texp = lt < 30.6 ? 'happy' : 'tired'; tlook = [0, lt < 30.6 ? 0.9 : -0.2]; tarms = lt < 30.6 ? 'up' : 'down'; }
  C.T = act(po(rw(...tp), -1.5, tarms, hop), fc(texp, 0.5, 1, tlook), tsc);
  const gpt = lt >= 30.6 ? 'point' : 'up';
  C.G = act(po(rw(lt < 23.4 ? 720 : 760, 0, lt < 23.4 ? -120 : 100), lt >= 30.6 ? yawTo([760, 0, 100], [420, 300, 470]) : -1.75, lt >= 23.4 && lt < 30.6 ? 'down' : gpt, {}), fc('happy', 0.15, 0, [-0.4, 0.2]));
  X.cam = camKeys(lt, [[0, rw(80, 430, 100), 2300, 0.0, 0.1, 36], [8.8, rw(40, 430, 100), 1800, 0.0, 0.1, 36], [16.1, rw(0, 430, 100), 1800, 0.0, 0.1, 36], [22.0, rw(0, 430, 100), 1800, 0.0, 0.1, 36], [23.4, rw(120, 330, 250), 2000, -0.1, 0.1, 36], [30.0, rw(160, 320, 250), 1950, -0.1, 0.1, 36], [30.6, rw(160, 320, 250), 1950, -0.1, 0.1, 36], [40, rw(120, 330, 250), 2100, 0.0, 0.1, 36]]);
}

/* ================================================================ SHOT b5 : recap */
function s5(t, lt, V, X, C) {
  V.real = true; V.pier = true; const u = lt / 18.9;
  world(() => { lakeWorld(209.3, 0); BIGCLOUD.visible = false; RAINL.visible = false; DRY.visible = false; WAVE.visible = false; SPL.visible = false; FISHL.forEach(f => { f.g.visible = false; }); LSTREAMS.forEach(s => { s.m.visible = false; s.a.visible = false; }); });
  X.cam = { p: [lerp(-980, -860, u), lerp(700, 620, u), lerp(2000, 1700, u)], l: [60, 130, 60], fov: 36 };
  C.G = actS(P0('down'), fc('happy', 0.15, null, [0.3, 0.1]), -0.86, -0.26, 0.2); C.T = actS(P0('down'), fc('happy', 0.5, null, [-0.3, 0.1]), 0.86, -0.26, 0.17);
  X.pan = true;
}

/* ================================================================ frame + finish */
const SHOTS = [s0, s1, s2, s3, s4, s5];
function frame(tl) {
  const t = Math.max(0, Math.min(DUR, tl)); CT = t;
  const si = shotOf(t), lt = t - O[si];
  const V = {}, X = { cam: null, fg: null, split: null, pan: false }, C = { G: NONE(), T: NONE(), S: NONE() };
  if (!WARM.on) { [SUN, TH, VAP, SWEAT, N38, PIPEG, PUMP, HALO, EMPTY, CLOUD1, RAIN1, CAL.root, CSTAND, BDROPS, ARRU, ARRD, ...BILL, ...ITEMS].forEach(o => { o.visible = false; });
    TP.drop.mat.uniforms.uColor.value.copy(TP_COL0); TP.drop.mat.uniforms.uTint.value.copy(TP_TNT0); }
  SHOTS[si](t, lt, V, X, C);
  finish(t, lt, si, V, X, C);
}
function finish(t, lt, si, V, X, C) {
  window.__lastC = C; if (WARM.on) return;
  ROOM.visible = !!V.room; TUB.root.visible = !!V.tub; SCALE.root.visible = !!V.scale; TUB2.root.visible = !!V.scale; PIPEG.visible = PIPEG.visible && !!V.tub; PUMP.visible = PUMP.visible && !!V.tub; TH.visible = TH.visible && !!V.tub; SUN.visible = SUN.visible && !!V.tub;
  if (!V.tub) { VAP.visible = false; SWEAT.visible = false; N38.visible = false; }
  if (V.tub) { QA.visible = QA.visible; }
  if (!V.room) { [QA, QB, QC, QD, QE, QF].forEach(q => { q.visible = false; }); ITEMS.forEach(g => { g.visible = false; }); BDROPS.visible = false; ARRU.visible = ARRD.visible = false; }
  if (V.room && !V.scale) { ITEMS.forEach(g => { g.visible = false; }); BDROPS.visible = false; ARRU.visible = ARRD.visible = false; }
  if (V.scale) { TUB.root.visible = false; }
  MAPG.visible = !!V.map; CUTG.visible = !!V.cut; REAL.visible = !!V.real; SECR.root.visible = SECL.root.visible = !!V.secs; STRIP.root.visible = !!V.strip; TABLE.visible = !!V.strip;
  PIER2.visible = !!V.pier; hills.visible = !!V.real;
  const rainSky = !!V.rainSky;
  cloudsRain.visible = rainSky; cloudsClear.visible = !!V.real && !rainSky && si !== 5;
  if (V.map) { LAND.update(t); STREAMS.forEach(s => { s.fm.uniforms.uT.value = t; }); }
  const horz = si === 5 ? setSkyMix(SKYP.dusk, SKYP.dusk, 0) : rainSky ? setSkyMix(SKYP.rain, SKYP.rain, 0) : setSkyMix(SKYP.clear, SKYP.clear, 0);
  LAKE.setHorizon(horz);
  PAN.visible = !!X.pan;
  const c = window.__co || X.cam;
  if (X.split) {
    const hw = Math.floor(W / 2) - 6; renderer.setScissorTest(true); renderer.setClearColor('#1d2a44', 1); renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.clear();
    [[X.split[0], 0, SKYP.clear], [X.split[1], W - hw, SKYP.rain]].forEach(([cc, x0, sk]) => { setSkyMix(sk, sk, 0); cam.aspect = hw / H; cam.fov = cc.fov; cam.updateProjectionMatrix(); cam.position.set(...cc.p); cam.lookAt(...cc.l); cam.updateMatrixWorld(true); SKY.position.copy(cam.position);
      castPlace(C); renderer.setViewport(x0, 0, hw, H); renderer.setScissor(x0, 0, hw, H); renderer.render(scene, cam); });
    renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H); renderer.setClearColor('#000000', 1); cam.aspect = 16 / 9; cam.updateProjectionMatrix(); window.__split = true; return;
  }
  window.__split = false;
  if (V.real && c.p[1] < 3000 && !window.__co) c.p[1] = Math.max(c.p[1], LAKE.heightAt(c.p[0], c.p[2]) + 150);
  cam.aspect = 16 / 9; cam.fov = c.fov; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l); cam.updateMatrixWorld(true); SKY.position.copy(cam.position);
  castPlace(C);
  Object.values(fgs).forEach(f => { f.visible = false; });
  if (X.fg && !window.__co) { const f = fgs[X.fg], dz = 420, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw2 = hh * 16 / 9; f.visible = true; f.scale.setScalar(0.5); if (X.fg === 'soap' || X.fg === 'grass') place(f, -0.9 * hw2, -0.82 * hh, -dz); else if (X.fg === 'leaves') place(f, -0.9 * hw2, 0.8 * hh, -dz); else place(f, 0.9 * hw2, -0.82 * hh, -dz); }
  BILL.forEach(b => { if (b.visible) b.quaternion.copy(cam.quaternion); });
  renderer.render(scene, cam);
}
function castPlace(C) {
  const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
  const ds = [[GD, C.G], [TP, C.T], [GU, C.S]];
  ds.forEach(([o, cc]) => { o.root.visible = cc.vis; if (!cc.vis) return;
    const base = o.base, H0 = o.drop.height || 244; let po0 = cc.po, sc = cc.sc;
    if (cc.scr) { const dz = 320, hh = dz * Math.tan(cam.fov * Math.PI / 360), hw = hh * cam.aspect; sc = 0.86 * cc.hf * 2 * hh / (H0 * base); const p = new THREE.Vector3(cc.scr[0] * 0.95 * hw, (cc.scr[1] + (cc.hop || 0)) * hh, -dz).applyQuaternion(cam.quaternion).add(cam.position);
      po0 = Object.assign({}, cc.po, { x: p.x, y: p.y, z: p.z, yaw: Math.atan2(-(cam.position.z - p.z), cam.position.x - p.x) + (cc.yawOff || 0) }); }
    else if (cc.hf) { const p = new THREE.Vector3(cc.po.x, cc.po.y, cc.po.z).sub(cam.position); sc = cc.hf * 2 * p.dot(fwd) * Math.tan(cam.fov * Math.PI / 360) / (H0 * base); }
    o.root.scale.setScalar(Math.max(0.001, sc * base)); o.pose(po0); if (cc.scr) o.root.quaternion.copy(cam.quaternion).multiply(QY.setFromAxisAngle(YAX, -Math.PI / 2 + (cc.yawOff || 0))); o.face.set(cc.f); });
}

/* ---------------------------------------------------------------- face warm-up + contract */
async function warm() {
  const seen = new Set(), jobs = [];
  WARM.on = true; for (let k = 0; k <= DUR * 30; k++) { frame(k / 30); for (const [o, c] of [[GD, window.__lastC.G], [TP, window.__lastC.T], [GU, window.__lastC.S]]) { if (!c.vis) continue; const key = o.root.uuid + JSON.stringify(c.f); if (!seen.has(key)) { seen.add(key); jobs.push([o, c.f]); } } }
  WARM.on = false; for (const [o, f] of jobs) await o.face.set(f);
  return jobs.length;
}
const _hb = new THREE.Box3(), _hv = new THREE.Vector3();
window.__heroBox = t => { const ids = [TP, GD, GU].filter(o => o.root.visible); if (!ids.length) return null; _hb.makeEmpty(); ids.forEach(o => { o.root.updateMatrixWorld(true); _hb.expandByObject(o.drop.inner); });
  const mn = [1e9, 1e9], mx = [-1e9, -1e9]; let behind = true; for (const x of [_hb.min.x, _hb.max.x]) for (const y of [_hb.min.y, _hb.max.y]) for (const z of [_hb.min.z, _hb.max.z]) { _hv.set(x, y, z).project(cam); if (_hv.z < 1) behind = false; mn[0] = Math.min(mn[0], _hv.x); mn[1] = Math.min(mn[1], _hv.y); mx[0] = Math.max(mx[0], _hv.x); mx[1] = Math.max(mx[1], _hv.y); }
  return { visible: !behind && mx[0] > -1 && mn[0] < 1 && mx[1] > -1 && mn[1] < 1, behindCamera: behind, heightFrac: (mx[1] - mn[1]) / 2, bottomFrac: (1 - (mn[1] + 1) / 2), box: [mn, mx] }; };
window.__sceneHash = () => { let h = 0; scene.traverse(o => { if (o.visible !== false) { const e = o.matrixWorld.elements; h = (h * 31 + Math.round(e[12] * 10) + Math.round(e[13] * 10) * 7 + Math.round(e[14] * 10) * 13 + Math.round(e[0] * 100) * 3) | 0; } }); return h + '|' + cam.position.x.toFixed(2) + ',' + cam.position.y.toFixed(2) + ',' + cam.position.z.toFixed(2); };
window.__dur = DUR; window.__HQ = HQ; window.__errors = []; window.__T0 = window.__T0 != null ? window.__T0 : 0;
window.__shots = IDS.map((id, i) => ({ id, index: i, start: O[i], end: O[i + 1], dur: +(O[i + 1] - O[i]).toFixed(2) }));
window.__caption = t => { const si = shotOf(t); const i = CUES[si].findIndex(c => t >= c[0] && t < c[1]); return i < 0 ? null : IDS[si] + '_c' + (i + 1); };
window.__o = { cam, scene, TUB, GD, TP };
window.__lastC = { G: NONE(), T: NONE(), S: NONE() };
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
(async () => {
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm();
    for (let i = 0; i < 6; i++) { frame(O[i] + 0.5); frame((O[i] + O[i + 1]) / 2); frame(O[i + 1] - 0.5); }
    frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
