/* film_a - "The Great Sea: the western border" (264 s). Deterministic: every frame is a pure function of t (window.__seek(t)).
   Contract: window.__ready, window.__seek(t) (adds window.__T0||0), window.__dur = 264, window.__caption(t) -> caption ID. No text in the picture (digits only). */
import { THREE, sm, cl, kf, D2R, frac, V, part, ell, tube, tubeAlong } from '../../../lib/toon3d/toon3d.js';
import * as KT from '../../toldot07_kit/kit07.js';
import { makeRabbiA, makeBoy } from '../../haredi_cast/cast_people.js';
import { PROPS } from '../../haredi_cast/props_lesson.js';
import * as L from './a_lib.js';
const { M, box } = KT;

export const DUR = 264;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.getElementById('wrap').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(32, 16 / 9, 5, 60000); scene.add(cam);

/* ---------------------------------------------------------------- timeline (from timeline.json, absolute seconds) */
const TL = [
  ['a1_two_names', 0, 37.9, [4.5, 14.54, 22.19, 29.05], [14.54, 22.19, 29.05, 37.5]],
  ['a2_three_continents', 37.9, 32.6, [0.4, 9.31, 16.68, 24.82], [9.31, 16.68, 24.82, 32.2]],
  ['a2b_one_gate', 70.5, 42.5, [0.4, 6.93, 17.23, 26.02, 34.06], [6.93, 17.23, 26.02, 34.06, 42.1]],
  ['a3_western_border', 113, 32.7, [0.4, 7.63, 16.35, 25.07], [7.63, 16.35, 25.07, 32.3]],
  ['a3b_sunset_west', 145.7, 41, [0.4, 8.44, 16.48, 25.28, 33.32], [8.44, 16.48, 25.28, 33.32, 40.6]],
  ['a4_our_coast', 186.7, 55.2, [0.4, 7.74, 15.83, 24.69, 31.27, 39.37, 46.7], [7.74, 15.83, 24.69, 31.27, 39.37, 46.7, 54.8]],
  ['a5_recap', 241.9, 22.1, [], []],
];
const SHOTS = TL.map(([id, t0, dur], i) => ({ id, index: i, start: t0, end: t0 + dur, dur }));
const CAPS = []; TL.forEach(([id, t0, dur, st, en]) => st.forEach((s, i) => CAPS.push({ id: id + '_c' + (i + 1), a: t0 + s, b: t0 + en[i] })));
// shorthand: absolute cue times
const C = { a1: [4.5, 14.54, 22.19, 29.05, 37.9], a2: [37.9, 47.21, 54.58, 62.72, 70.5], a2b: [70.5, 77.43, 87.73, 96.52, 104.56, 113], a3: [113, 120.63, 129.35, 138.07, 145.7],
  a3b: [145.7, 154.14, 162.18, 170.98, 179.02, 186.7], a4: [186.7, 194.44, 202.53, 211.39, 217.97, 226.07, 233.4, 241.9] };

/* ---------------------------------------------------------------- helpers */
const lerp = (a, b, u) => a + (b - a) * u;
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const ease = (t, a, b) => sm(cl((t - a) / (b - a), 0, 1));
const blinkAt = (t, o) => frac(t / 3.3 + (o || 0)) < 0.045;
const talkAt = (t, a, b, sd) => (t > a && t < b && frac(t * 0.85 + (sd || 0)) < 0.74) ? 'AEOXUM'[Math.floor(t * 9 + (sd || 0) * 7) % 6] : null;
const talkT = (t, a, b, sd) => (t > a && t < b && frac(t * 0.8 + (sd || 0)) < 0.7) ? 'AEOX'[Math.floor(t * 8 + (sd || 0) * 5) % 4] : null;
const rg = KT.rng(77);
const gY = (x, z) => z < 0 ? -20 : Math.min(z * 0.03, 30) + 18 * Math.sin(x * 0.004) * Math.sin(z * 0.006) * sm(z / 600);

/* ---------------------------------------------------------------- skies, tint overlays */
const SKY = KT.makeSky({ palette: 'day' }); scene.add(SKY);           // dynamic colours
const SKYS = KT.makeSky({ palette: 'sunset', sunDir: [0, 0.3, -1] }); scene.add(SKYS);   // with the sun disc
const PAL = { day: ['#5fb3e6', '#9fd4f2', '#e2f3fb'], morn: ['#78a8dc', '#f3cfa8', '#fbe6c8'], late: ['#5a86c8', '#f0b27a', '#ffe0a8'], sunset: ['#3f5d9c', '#e48a6a', '#ffd28a'],
  dusk: ['#2b3f7a', '#b0587a', '#f0a070'], night: ['#101a40', '#1e2f66', '#3a4d86'] };
const _c = {}; const colr = h => _c[h] || (_c[h] = new THREE.Color(h));
function setSky(sky, a, b, k) { const u = sky.material.uniforms, A = PAL[a], B = PAL[b || a];
  u.uTop.value.copy(colr(A[0])).lerp(colr(B[0]), k || 0); u.uMid.value.copy(colr(A[1])).lerp(colr(B[1]), k || 0); u.uHorz.value.copy(colr(A[2])).lerp(colr(B[2]), k || 0); }

/* camera overlays: group in front of the camera (depth test off) */
const OV = new THREE.Group(); OV.position.set(0, 0, -300); cam.add(OV);
function ovFlat(o) { o.traverse(m => { if (m.material) { m.material.depthTest = false; m.material.depthWrite = false; } m.renderOrder = 58; }); return o; }
const tintMat = new THREE.MeshBasicMaterial({ color: '#ff9a50', transparent: true, opacity: 0, depthTest: false, depthWrite: false });
const TINT = new THREE.Mesh(new THREE.PlaneGeometry(520, 300), tintMat); TINT.position.z = -2; TINT.renderOrder = 57; OV.add(TINT);
const vigCv = document.createElement('canvas'); vigCv.width = 256; vigCv.height = 256; { const c = vigCv.getContext('2d'), g = c.createRadialGradient(128, 128, 6, 128, 128, 127);
  g.addColorStop(0, 'rgba(14,20,50,0.9)'); g.addColorStop(0.55, 'rgba(14,20,50,0.55)'); g.addColorStop(1, 'rgba(14,20,50,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); }
const vigTex = new THREE.CanvasTexture(vigCv); vigTex.colorSpace = THREE.NoColorSpace;
const VIG = new THREE.Mesh(new THREE.PlaneGeometry(300, 168), new THREE.MeshBasicMaterial({ map: vigTex, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); VIG.position.z = -1; VIG.renderOrder = 59; OV.add(VIG);
// numbers (digits)
const N15 = L.makeNum('15,000', { h: 64 }), N195 = L.makeNum('195 km', { h: 40 }), N3700 = L.makeNum('3,700 km', { h: 36 });
[N15, N195, N3700].forEach(n => { n.visible = false; OV.add(n); });
// clock + tally + sun/moon
const CLK = L.makeClock(30); ovFlat(CLK); CLK.position.set(112, 22, 0); CLK.visible = false; OV.add(CLK);
const TALLY = new THREE.Group(); OV.add(TALLY); TALLY.visible = false; const tallyBars = [];
for (let i = 0; i < 8; i++) { const g = new THREE.Group(); const k = i % 5, base = i < 5 ? 0 : 1;
  if (k < 4) box(g, 3.6, 30, 2, M('#fff3c8', '#fff3c8', 0), [0, 0, 0], 0, null, 1); else box(g, 3.6, 46, 2, M('#fff3c8', '#fff3c8', 0), [0, 0, 0], 0, [0, 0, 1.15], 1);
  g.position.set(-132 + (i < 5 ? i * 9 : 62 + (i - 5) * 9) - (i < 5 ? 0 : 0), 62, 0); if (i === 4) g.position.set(-132 + 18, 62, 0); if (i > 4) g.position.set(-132 + 62 + (i - 5) * 9 - 36, 62, 0); ovFlat(g); TALLY.add(g); tallyBars.push(g); }
const SUNO = new THREE.Mesh(new THREE.CircleGeometry(15, 28), new THREE.MeshBasicMaterial({ color: '#ffd84a', depthTest: false, depthWrite: false })); SUNO.renderOrder = 56;
const SUNR = new THREE.Mesh(new THREE.RingGeometry(15, 18, 28), new THREE.MeshBasicMaterial({ color: '#261c19', depthTest: false, depthWrite: false })); SUNR.renderOrder = 56; SUNO.add(SUNR);
const MOON = new THREE.Mesh(new THREE.CircleGeometry(12, 28), new THREE.MeshBasicMaterial({ color: '#f1efe0', depthTest: false, depthWrite: false })); MOON.renderOrder = 56;
const MOONR = new THREE.Mesh(new THREE.RingGeometry(12, 15, 28), new THREE.MeshBasicMaterial({ color: '#261c19', depthTest: false, depthWrite: false })); MOONR.renderOrder = 56; MOON.add(MOONR);
SUNO.visible = MOON.visible = false; OV.add(SUNO, MOON);
// map ghost (sea on the left) for the last shot of a3b
const scrollTex = L.makeScrollMapTexture();
const MAPGHOST = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshBasicMaterial({ map: scrollTex, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); MAPGHOST.renderOrder = 58; MAPGHOST.position.set(-100, 18, 0); OV.add(MAPGHOST);

/* ---------------------------------------------------------------- SCENE: day beach (+ room with window) */
const GB = new THREE.Group(); scene.add(GB);
const BE = KT.makeBeach({ season: 'summer' }); GB.add(BE.root);
function dressBeach(grp, seed, fx) {
  const r = KT.rng(seed); const clearZ = (x, z) => seed === 400 && x > -950 && x < 350 && z > 280 && z < 760;
  [[-1250, 760, 'palm', 1.0], [1150, 820, 'palm', 1.15], [-2300, 900, 'palm', 0.95], [2300, 760, 'palm', 1.05], [330, 1180, 'palm', 1.1], [-700, 1050, 'palm', 1.2]].forEach(([x, z, k, s], i) => { const tr = KT.makeTree(k, seed + i, s); tr.position.set(x, gY(x, z) - 6, z); tr.rotation.y = r() * 6; grp.add(tr); });
  for (let i = 0; i < 14; i++) { const x = -2400 + r() * 4800, z = 380 + r() * 520; if (clearZ(x, z)) continue; const b = KT.makeBush(seed + 20 + i, { flowers: i % 3 === 0 }); b.position.set(x, gY(x, z) - 4, z); b.scale.setScalar(0.8 + r() * 0.6); grp.add(b); }
  for (let i = 0; i < 28; i++) { const x = -2400 + r() * 4800, z = 120 + r() * 700; if (clearZ(x, z)) continue; const t = KT.makeGrassTuft(seed + 50 + i, { h: 50 + r() * 40, dry: i % 4 === 0 }); t.position.set(x, gY(x, z) - 3, z); grp.add(t); }
  for (let i = 0; i < 10; i++) { const x = -2200 + r() * 4400, z = 150 + r() * 600; if (clearZ(x, z)) continue; const s = KT.makeStone(seed + 90 + i, 0.5 + r() * 0.9); s.position.set(x, gY(x, z) - 6, z); grp.add(s); }
  for (let i = 0; i < 4; i++) { const x = -1500 + i * 1000 + r() * 300, z = 520 + r() * 200; if (clearZ(x, z)) continue; const rd = KT.makeReeds(seed + 120 + i, { n: 8, h: 150 }); rd.position.set(x, gY(x, z) - 3, z); grp.add(rd); }
  const dw = []; for (let i = 0; i < 3; i++) { const g = new THREE.Group(); part(g, tubeAlong([V(-70, 0, 0), V(0, 10, 12), V(80, 2, -6)], 9, { segs: 10 }), M('#a07a52', '#c0a088'), 2); const x = -900 + i * 900, z = 90 + r() * 80; g.position.set(x, gY(x, z) + 6, z); g.rotation.y = r(); grp.add(g); }
}
dressBeach(BE.root, 100);
const clouds = [[-2800, 1700, -7500, 3.2], [2200, 2000, -8200, 3.8], [-600, 2300, -9000, 4.2], [4200, 1500, -6800, 2.8]];
clouds.forEach(([x, y, z, s], i) => { const c = KT.makeCloud(i + 11, { s }); c.position.set(x, y, z); GB.add(c); });
const birdsB = KT.makeBirds({ n: 5, r: 800, y: 900 }); birdsB.position.set(-400, 0, -600); GB.add(birdsB);
const butter = KT.makeButterflies({ n: 3, r: 90, y: 90 }); butter.position.set(-250, 40, 480); GB.add(butter);
const sailB = KT.makeFishingBoat('#e8f0f4', 3); sailB.scale.setScalar(0.9); GB.add(sailB);
const fgGrass = KT.makeFgBlur('grass', { w: 300, h: 190, col: '#6f9a4a', blur: 7 }); GB.add(fgGrass);
const fgRock = KT.makeFgBlur('rock', { w: 300, h: 200, col: '#8a8478', blur: 8 }); GB.add(fgRock);
const fgLeaf = KT.makeFgBlur('leaves', { w: 340, h: 200, col: '#4f7f3a', blur: 8 }); GB.add(fgLeaf);
// the room (window on the sea) - only visible in the interior shots
const ROOM_Y = 40, ROOM_Z = 640;
const RG = new THREE.Group(); RG.position.set(0, ROOM_Y, ROOM_Z); GB.add(RG);
RG.add(L.makeRoom());
const shtender = PROPS.shtender(); { const top = shtender.root.children[shtender.root.children.length - 1]; top.remove(top.children[top.children.length - 1]);
  const sf = new THREE.Group(); box(sf, 36, 8, 28, M('#6a2c2c', '#b09090'), [0, 6, 0], 1.8, null, 2); box(sf, 38, 3, 6, M('#e6c35a', '#c9a060', 0), [0, 6, 8], 0.8, null, 1); box(sf, 38, 3, 6, M('#e6c35a', '#c9a060', 0), [0, 6, -8], 0.8, null, 1); box(sf, 2, 8.4, 28.5, M('#e6c35a', '#c9a060', 0), [-12, 6, 0], 0.8, null, 0.5); top.add(sf); shtender.top = top; }
shtender.root.position.set(-150, 0, -80); shtender.root.rotation.y = 0; RG.add(shtender.root);
const glowTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'), g = c.createRadialGradient(64, 64, 2, 64, 64, 62); g.addColorStop(0, 'rgba(255,236,160,1)'); g.addColorStop(0.4, 'rgba(255,214,110,0.55)'); g.addColorStop(1, 'rgba(255,200,90,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; return t; })();
const mkGlow = s => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, depthTest: false, opacity: 0, side: THREE.DoubleSide })); m.renderOrder = 40; return m; };
const sefGlow = mkGlow(250); sefGlow.position.set(-150, 150, -80); RG.add(sefGlow);
// table
const table = new THREE.Group(); table.position.set(0, 0, -120); RG.add(table);
box(table, 210, 7, 100, M('#a8703e', '#c49a84'), [0, 96, 0], 2.4, null, 2); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(table, 8, 94, 8, M('#7e4f2a', '#b08a7a'), [sx * 94, 47, sz * 40], 2, null, 2);
box(table, 190, 9, 4, M('#7e4f2a', '#b08a7a'), [0, 84, -42], 1.4, null, 1); box(table, 190, 9, 4, M('#7e4f2a', '#b08a7a'), [0, 84, 42], 1.4, null, 1);
const mish = L.makeMishkan(); mish.position.set(0, 99.5, 0); mish.scale.setScalar(1.15); table.add(mish);
const cupT = new THREE.Group(); box(cupT, 14, 18, 14, M('#d8d0c0', '#c0b8a8'), [0, 9, 0], 1.4, null, 2); cupT.position.set(88, 99.5, -24); table.add(cupT);
const sefTable = new THREE.Group(); sefTable.position.set(-70, 99.5, 6); table.add(sefTable);
const clBook = new THREE.Group(); box(clBook, 34, 8, 26, M('#20354f', '#9aa0b0'), [0, 4, 0], 1.8, null, 2); box(clBook, 36, 3, 6, M('#e6c35a', '#c9a060', 0), [0, 4, 7], 0.8, null, 1); sefTable.add(clBook);
const opBook = PROPS.gemara(); opBook.root.scale.setScalar(1.0); opBook.root.rotation.y = 0; sefTable.add(opBook.root);
const stack = PROPS.table(); // table with the sefarim - only borrow the stack as dressing at the right of the room
stack.root.position.set(300, 0, -190); stack.root.scale.setScalar(0.9); RG.add(stack.root);
const GL3 = mkGlow(120); GL3.position.set(-70, 130, 6); table.add(GL3);

/* ---------------------------------------------------------------- SCENE: cliff (a3 c1) */
const GC = new THREE.Group(); scene.add(GC);
const CL = KT.makeKurkarCliff({ erosion: 0.25 }); GC.add(CL.root);
{ const r = KT.rng(31); const topY = CL.topY;
  for (let i = 0; i < 30; i++) { const x = -1700 + r() * 3400, z = 380 + r() * 700; const t = KT.makeGrassTuft(300 + i, { h: 40 + r() * 40, dry: i % 3 === 0 }); t.position.set(x, topY - 4, z); GC.add(t); }
  for (let i = 0; i < 12; i++) { const x = -1700 + r() * 3400, z = 360 + r() * 300; const s = KT.makeStone(330 + i, 0.5 + r() * 0.8); s.position.set(x, topY - 8, z); GC.add(s); }
  for (let i = 0; i < 7; i++) { const x = -1500 + i * 520, z = 700 + r() * 500; if (z < 1350 && Math.abs(x) < 1000) continue; const f = KT.makeTree(i % 2 ? 'palm' : 'tamarisk', 360 + i, 0.9); f.position.set(x, topY - 4, z); GC.add(f); }
  const hills = KT.makeHills({ a0: Math.PI * 0.12, a1: Math.PI * 0.88, h: 700, base: '#9ab864', haze: '#cfe6f2' }); hills.position.set(0, 0, 0); GC.add(hills); }
const cloudsC = [[-2400, 1800, -6500, 3.2], [2600, 2100, -7200, 3.6]].map(([x, y, z, s], i) => { const c = KT.makeCloud(i + 41, { s }); c.position.set(x, y, z); GC.add(c); return c; });
const birdsC = KT.makeBirds({ n: 5, r: 700, y: 650, seed: 5 }); birdsC.position.set(0, 0, -300); GC.add(birdsC);
const fgLeafC = KT.makeFgBlur('leaves', { w: 340, h: 200, col: '#4f7f3a', blur: 8 }); GC.add(fgLeafC);

/* ---------------------------------------------------------------- SCENE: sunset beach */
const GS = new THREE.Group(); scene.add(GS);
const BS = KT.makeBeach({ season: 'summer', seed: 45 }); GS.add(BS.root);
dressBeach(BS.root, 400);
const compass = L.makeCompass(120); compass.position.set(-60, gY(-60, 250) + 2, 250); compass.rotation.y = 0; GS.add(compass);
const shtS = PROPS.shtender(); { const top = shtS.root.children[shtS.root.children.length - 1]; top.remove(top.children[top.children.length - 1]);
  const sf = new THREE.Group(); box(sf, 36, 8, 28, M('#6a2c2c', '#b09090'), [0, 6, 0], 1.8, null, 2); box(sf, 38, 3, 6, M('#e6c35a', '#c9a060', 0), [0, 6, 8], 0.8, null, 1); box(sf, 38, 3, 6, M('#e6c35a', '#c9a060', 0), [0, 6, -8], 0.8, null, 1); top.add(sf); }
shtS.root.position.set(130, gY(130, 300) - 2, 300); shtS.root.rotation.y = Math.PI / 2; GS.add(shtS.root);
const sefGlowS = mkGlow(340); sefGlowS.position.set(130, gY(130, 300) + 135, 300); GS.add(sefGlowS);
const rockS = KT.makeStone(8, 1.6); rockS.position.set(300, gY(300, 340) - 8, 340); GS.add(rockS);
const sunDoor = L.makeSunDoor(); sunDoor.scale.setScalar(1.9); sunDoor.position.set(0, -14, -7200); GS.add(sunDoor);
const BENCH_X = 330; const bench = PROPS.bench(); bench.root.position.set(BENCH_X, gY(BENCH_X, 460) - 4, 460); bench.root.rotation.y = Math.PI / 2; GS.add(bench.root);
const cloudsS = [[-3200, 900, -8500, 3.4], [2600, 1100, -9500, 3.8], [400, 1500, -9800, 4.4], [-1200, 700, -8800, 2.6]].map(([x, y, z, s], i) => { const c = KT.makeCloud(i + 61, { s, col: '#ffe9d0', tint: '#e8b8a8' }); c.position.set(x, y, z); GS.add(c); return c; });
const birdsS = KT.makeBirds({ n: 4, r: 900, y: 700, seed: 21 }); birdsS.position.set(300, 0, -500); GS.add(birdsS);
const fgGrassS = KT.makeFgBlur('grass', { w: 300, h: 190, col: '#5d7f3a', blur: 7 }); GS.add(fgGrassS);
const sunRec = new THREE.Group(); { const g1 = mkGlow(5200); g1.material.opacity = 0.75; g1.material.depthTest = true; g1.renderOrder = -5; const d1 = new THREE.Mesh(new THREE.CircleGeometry(430, 40), new THREE.MeshBasicMaterial({ color: '#fff2c0', depthWrite: false, side: THREE.DoubleSide })); d1.renderOrder = -4; sunRec.add(g1, d1); sunRec.userData.g = g1; GS.add(sunRec); sunRec.visible = false; }
const sailS = KT.makeFishingBoat('#f6e6a8', 5); sailS.scale.setScalar(0.9); GS.add(sailS);

/* ---------------------------------------------------------------- SCENE: harbour (Haifa bay) */
const GH = new THREE.Group(); scene.add(GH);
const HB = KT.makeHarbour({ A: 10 }); GH.add(HB.root);
const cShip = KT.makeContainerShip({ len: 760 }); cShip.rotation.y = 0; GH.add(cShip);
const tug = KT.makeTugboat(); GH.add(tug);
const boatsH = [['#f6e6a8', 1, 3], ['#cfe8f4', 2, 4]].map(([c, s, sd]) => { const b = KT.makeFishingBoat(c, sd); GH.add(b); return b; });
[[-1800, 1700, -7000, 3.4], [1800, 2000, -7600, 3.8], [300, 2400, -8200, 4.0]].forEach(([x, y, z, s], i) => { const c = KT.makeCloud(i + 81, { s }); c.position.set(x, y, z); GH.add(c); });
const hillsH = KT.makeHills({ a0: Math.PI * 0.55, a1: Math.PI * 1.0, h: 800, base: '#8fb05a', haze: '#cfe6f2' }); GH.add(hillsH);
const gullH = KT.makeGull(); GH.add(gullH.root);
const birdsH = KT.makeBirds({ n: 5, r: 700, y: 800, seed: 9 }); birdsH.position.set(0, 0, -800); GH.add(birdsH);
// crates and ropes on the quay
{ const r = KT.rng(88); for (let i = 0; i < 14; i++) { const x = -900 + r() * 1800, z = 650 + r() * 260; box(GH, 50 + r() * 30, 40 + r() * 30, 50 + r() * 20, M(['#b5772e', '#8a5a3a', '#4f7ea8', '#c0392b'][i % 4], '#b09a80'), [x, 75, z], 2, [0, r(), 0], 3); }
  for (let i = 0; i < 6; i++) { const x = -800 + i * 330, z = 640; part(GH, new THREE.TorusGeometry(16, 5, 6, 16).rotateX(Math.PI / 2), M('#8a6a3a', '#a08a60', 0), 1.2, [x + 40, 63, z + 28]); } }
const fgRockH = KT.makeFgBlur('rock', { w: 300, h: 200, col: '#8a8478', blur: 8 }); GH.add(fgRockH);

/* ---------------------------------------------------------------- SCENE: the relief map (+ compare diorama) */
const GM = new THREE.Group(); scene.add(GM);
const MP = KT.makeMedMap(); GM.add(MP.root);
const LL = (lon, lat, up) => V(...MP.lonlat(lon, lat, up || 0));
// table under the map (no empty backdrop)
{ const tb = new THREE.Mesh(new THREE.PlaneGeometry(26000, 18000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#c9a070' })); tb.position.set(0, -72, 0); GM.add(tb);
  for (let i = -6; i <= 6; i++) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(26000, 14).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#a97c4c' })); pl.position.set(0, -71.5, i * 1100); GM.add(pl); } }
// kinneret
const kin = LL(35.55, 32.8, 2.2);
const lake = new THREE.Mesh(new THREE.ShapeGeometry(L.lakeShape(1)).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#7fd8ff', side: THREE.DoubleSide, depthWrite: false })); lake.scale.set(9, 1, 17); lake.position.copy(kin); lake.renderOrder = 7; GM.add(lake);
const lakeLine = new THREE.Mesh(new THREE.ShapeGeometry(L.lakeShape(1)).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#16405e', side: THREE.DoubleSide, depthWrite: false })); lakeLine.scale.set(11.5, 1, 21); lakeLine.position.copy(kin).add(V(0, -0.5, 0)); lakeLine.renderOrder = 6; GM.add(lakeLine);
const kinRing = L.makeRing(40, 5, '#fff3a0'); kinRing.position.copy(kin).add(V(0, 3, 0)); GM.add(kinRing);
const kinRing2 = L.makeRing(40, 3, '#ffffff'); kinRing2.position.copy(kin).add(V(0, 3.5, 0)); GM.add(kinRing2);
// stamps
const stampShape = L.lakeShape(1);
const stampFill = new THREE.InstancedMesh(new THREE.ShapeGeometry(stampShape).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#dff6ff', side: THREE.DoubleSide, depthWrite: false }), 1500);
const stampLine = new THREE.InstancedMesh(new THREE.ShapeGeometry(stampShape).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#16405e', side: THREE.DoubleSide, depthWrite: false }), 1500);
stampFill.renderOrder = 7; stampLine.renderOrder = 6; stampFill.frustumCulled = stampLine.frustumCulled = false; GM.add(stampLine, stampFill);
const STAMPS = []; { const r = KT.rng(3); for (let gz = -950; gz <= 950; gz += 50) for (let gx = -2060; gx <= 2060; gx += 40) { const lon = gx / 80 + 16, lat = 37.5 - gz / 100; if (lon < -5.6 || (lon > 27 && lat > 41) || lat > 46) continue;
  if (MP.sdSea(lon, lat) < -0.14) STAMPS.push({ x: gx + (gz / 50 % 2 ? 20 : 0) + (r() - 0.5) * 6, z: gz + (r() - 0.5) * 6, d: Math.hypot(gx - kin.x, (gz - kin.z) * 0.8) + r() * 120, rot: (r() - 0.5) * 0.5 }); } }
STAMPS.sort((a, b) => a.d - b.d);
const dumM = new THREE.Object3D();
function setStamps(prog, t) { const n = STAMPS.length, cnt = Math.floor(n * prog);
  for (let i = 0; i < n; i++) { const s = STAMPS[i], u = cl((prog * n - i) / 14, 0, 1), k = i < cnt ? sm(u) * (1 + 0.18 * (1 - u)) : 0;
    dumM.position.set(s.x, -3.4, s.z); dumM.rotation.set(0, s.rot, 0); dumM.scale.set(20 * k, 1, 32 * k); dumM.updateMatrix(); stampFill.setMatrixAt(i, dumM.matrix);
    dumM.position.y = -3.9; dumM.scale.set(24 * k, 1, 38 * k); dumM.updateMatrix(); stampLine.setMatrixAt(i, dumM.matrix); }
  stampFill.count = stampLine.count = n; stampFill.instanceMatrix.needsUpdate = stampLine.instanceMatrix.needsUpdate = true; stampFill.visible = stampLine.visible = prog > 0; }
// tipa (map explainer), pin, gulls
const tipaM = KT.makeTipa(); tipaM.root.scale.setScalar(0.3); GM.add(tipaM.root);
const pin = new THREE.Group(); { part(pin, new THREE.ConeGeometry(7, 26, 14).rotateX(Math.PI), M('#e04a3a', '#c88a8a'), 1.8, [0, 13, 0]); part(pin, ell(12, 12, 12, 16, 12), M('#e04a3a', '#c88a8a'), 2, [0, 36, 0]); part(pin, ell(4.4, 4.4, 4.4, 10, 8), M('#ffffff', '#ffffff', 0), 0, [3, 40, 6]); } GM.add(pin); pin.visible = false;
const gullM = KT.makeGull(); gullM.root.scale.setScalar(0.5); GM.add(gullM.root);
// continent glows: clean colour overlays that follow the land shapes themselves
const GLOWS = {}; const GLOWH = { eu: LL(12, 45.0, 0), af: LL(14, 29.5, 0), as: LL(38, 39.0, 0) };
{ const x0 = -10, x1 = 44, y0 = 26, y1 = 48, st = 0.2, nx = Math.round((x1 - x0) / st), ny = Math.round((y1 - y0) / st);
  const pos = new Float32Array((nx + 1) * (ny + 1) * 3);
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const q = MP.lonlat(x0 + i * st, y1 - j * st, 3), o = (j * (nx + 1) + i) * 3; pos[o] = q[0]; pos[o + 1] = q[1]; pos[o + 2] = q[2]; }
  const fAf = [[-10, 36.0], [-5.4, 36.05], [-2, 36.4], [3, 37.5], [8, 38.2], [10.8, 37.6], [11.6, 37.3], [12.0, 35.0], [24, 34.0], [26.3, 34.0], [34.3, 33.5], [60, 33.5]];
  const fOf = lon => { for (let a = 0; a < fAf.length - 1; a++) if (lon <= fAf[a + 1][0]) { const u = (lon - fAf[a][0]) / (fAf[a + 1][0] - fAf[a][0]); return fAf[a][1] + u * (fAf[a + 1][1] - fAf[a][1]); } return 33.5; };
  const idx = { eu: [], af: [], as: [] };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const lon = x0 + (i + 0.5) * st, lat = y1 - (j + 0.5) * st; if (MP.sdSea(lon, lat) < 0.02) continue;
    const asia = lon >= 34.3 || (lon >= 26.3 && lat >= 34.0); const key = asia ? 'as' : (lat < fOf(lon) ? 'af' : 'eu'); if (key === 'af' && (lat > 33.8 || lat < 27.0)) { if (lat < 27.0) continue; }
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx[key].push(a, c, b, b, c, d); }
  const cols = { eu: '#36e04a', af: '#ffa21a', as: '#b45cff' };
  for (const key of ['eu', 'af', 'as']) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx[key]);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: cols[key], transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.renderOrder = 5; m.frustumCulled = false; m.visible = false; GLOWS[key] = m; GM.add(m); } }
const ripples = [0, 1, 2].map(i => { const r = L.makeRing(200, 12, '#ffffff'); r.position.copy(LL(18, 35.0, 3)); r.visible = false; GM.add(r); return r; });
// boat with Tipa (a2b c1)
const mBoat = KT.makeFishingBoat('#f6e6a8', 3); mBoat.scale.setScalar(0.33); GM.add(mBoat);
const tipaB = KT.makeTipa(); tipaB.root.scale.setScalar(0.24); GM.add(tipaB.root);
const boatPts = [[34.2, 32.3], [34.0, 33.3], [34.2, 34.6], [33.0, 35.4], [31.0, 35.8], [29.0, 35.8], [27.0, 35.9], [24.5, 36.5], [22.0, 36.0], [20.5, 37.0], [18.0, 37.2], [15.5, 37.0], [13.0, 37.3], [10.5, 38.0], [8.0, 38.0], [5.0, 38.2], [2.0, 38.0], [-1.0, 36.2], [-3.5, 35.6]];
const boatCurve = new THREE.CatmullRomCurve3(boatPts.map(([lo, la]) => LL(lo, la, 4)));
// the gate at Gibraltar
const gate = new THREE.Group(); { const gm = new THREE.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: 0.85, depthWrite: false });
  const arch = new THREE.Mesh(new THREE.TorusGeometry(70, 8, 8, 30, Math.PI), gm); arch.position.y = 0; gate.add(arch);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 90, 10), gm); p.position.set(s * 70, -45, 0); gate.add(p); }
  const fill = new THREE.Mesh(new THREE.CircleGeometry(70, 30, 0, Math.PI), new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })); gate.add(fill); gate.userData.fill = fill; gate.userData.gm = gm; gate.userData.arch = arch; }
{ const g0 = LL(-5.62, 35.95, 70); gate.position.copy(g0); gate.rotation.y = Math.PI / 2; gate.position.y = 100; GM.add(gate); gate.visible = false; }
// dotted line and plane
const lineCurvePts = [[-5.55, 36.0], [-2.0, 36.1], [2.0, 38.0], [6.0, 38.0], [10.0, 38.0], [12.0, 37.1], [14.0, 35.8], [18.0, 35.0], [22.0, 34.5], [26.0, 34.0], [30.0, 33.5], [33.0, 33.0], [34.45, 32.3]];
const lineCurve = new THREE.CatmullRomCurve3(lineCurvePts.map(([lo, la]) => LL(lo, la, 14)));
const lineLen = lineCurve.getLength();
const beads = L.makeBeads(90, 6.5, '#ffd84a', 1.4); GM.add(beads);
const plane = L.makePlane(); plane.scale.setScalar(0.85); GM.add(plane);
// israel coast line (195 km) with bow morph
const coastPts = [[35.12, 33.08], [35.1, 32.95], [35.0, 32.8], [34.9, 32.5], [34.8, 32.1], [34.65, 31.8], [34.5, 31.6]];
const coastCurve = new THREE.CatmullRomCurve3(coastPts.map(([lo, la]) => LL(lo, la, 8)));
const bowCurve = new THREE.CatmullRomCurve3([LL(35.12, 33.08, 8), LL(34.98, 32.6, 8), LL(34.5, 31.6, 8)].map((v, i) => { if (i === 1) v.x -= 3; return v; }));
const coastBeads = L.makeBeads(42, 2.9, '#ff5a3c', 1.0); GM.add(coastBeads);
const haifa = LL(35.0, 32.8, 5);
const haifaRing = L.makeRing(14, 3, '#fff3a0'); haifaRing.position.copy(haifa).add(V(0, 3, 0)); GM.add(haifaRing);
const haifaGlow = L.makeGlow(11, '#ffffff'); haifaGlow.material.opacity = 0.5; haifaGlow.position.copy(haifa).add(V(-6, 3.5, 0)); GM.add(haifaGlow);
const pinCoast = LL(34.7, 32.2, 4);
const tipaC = KT.makeTipa(); tipaC.root.scale.setScalar(0.2); GM.add(tipaC.root);
// compare diorama (at z = 2900): split screen. left = the narrow strait, right = a plain road between two hill towns. same ruler on both.
const CMP = new THREE.Group(); CMP.position.set(0, 0, 2900); GM.add(CMP);
{ const wallM = new THREE.Mesh(new THREE.PlaneGeometry(2600, 1200), new THREE.MeshBasicMaterial({ color: '#d9eef8' })); wallM.position.set(0, 560, -420); CMP.add(wallM);
  const flo = new THREE.Mesh(new THREE.PlaneGeometry(2600, 1000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#efe3c2' })); flo.position.set(0, -20, 150); CMP.add(flo);
  for (const [cx, base] of [[-360, '#e8d6ab'], [360, '#a7cf72']]) box(CMP, 700, 26, 460, M(base, '#cbb792'), [cx, -8, 0], 3, null, 6);
  box(CMP, 14, 120, 460, M('#ffffff', '#ffffff', 0), [0, 40, 0], 1.4, null, 1);
  // left: two banks and the blue strait between them (400 wide), a boat inside
  box(CMP, 200, 70, 460, M('#9ac76a', '#c4cfc0'), [-610, 40, 0], 3, null, 8); box(CMP, 200, 60, 460, M('#e6cf8e', '#cbb792'), [-110, 35, 0], 3, null, 8);
  const strait = new THREE.Mesh(new THREE.PlaneGeometry(300, 450), new THREE.MeshBasicMaterial({ color: '#3d9ee0' })); strait.rotation.x = -Math.PI / 2; strait.position.set(-360, 5.5, 0); CMP.add(strait);
  for (let i = 0; i < 5; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(60, 5), new THREE.MeshBasicMaterial({ color: '#d8f0ff' })); w.rotation.x = -Math.PI / 2; w.position.set(-440 + (i % 3) * 80, 6.5, -160 + i * 80); CMP.add(w); }
  for (let i = 0; i < 2; i++) { const tr = KT.makeTree('tamarisk', 500 + i, 0.5); tr.position.set(-650 + i * 60, 74, -170 + i * 20); CMP.add(tr); }
  for (let i = 0; i < 2; i++) { const tr = KT.makeTree('tamarisk', 520 + i, 0.5); tr.position.set(-90 + i * 30, 64, -170 + i * 20); CMP.add(tr); }
  const bt = KT.makeFishingBoat('#f6e6a8', 8); bt.scale.setScalar(0.7); bt.position.set(-350, 6, 60); bt.rotation.y = 1.4; CMP.add(bt);
  // right: a simple road between two hill towns (400 apart)
  const rd = M('#4a4650', '#4a4650', 0); box(CMP, 330, 6, 50, rd, [360, 14, 40], 0, null, 1); for (let i = 0; i < 7; i++) box(CMP, 22, 1, 6, M('#f4e8a8', '#f4e8a8', 0), [225 + i * 40, 17.5, 40], 0, null, 0.3);
  const hA = L.makeHillTown(5, 1.0); hA.position.set(210, 13, -20); CMP.add(hA); const hB = L.makeHillTown(6, 1.0); hB.position.set(510, 13, -20); CMP.add(hB);
  // the two rulers: same width (400), same height
  for (const [cx, name] of [[-360, 'a'], [360, 'b']]) { const rl = new THREE.Group(); rl.position.set(cx, 250, 150); CMP.add(rl);
    box(rl, 300, 12, 10, M('#ffd84a', '#d8b050', 0), [0, 0, 0], 1.6, null, 2); for (let i = 0; i <= 15; i++) box(rl, 4, i % 5 ? 14 : 28, 8, M('#261c19', '#261c19', 0), [-150 + i * 20, -12, 0], 0, null, 0.6);
    for (const sg2 of [-1, 1]) box(rl, 14, 235, 14, M('#ffd84a', '#d8b050', 0), [sg2 * 150, -118, 0], 1.6, null, 2);
    const nn = L.makeNum('14 km', { h: 110 }); nn.position.set(cx, 385, 150); CMP.add(nn); CMP.userData['n' + name] = nn; } }
GM.visible = false;
const cmpNums = [CMP.userData.na, CMP.userData.nb];

/* ---------------------------------------------------------------- people (shared pair, re-parented per scene) */
const rabbi = makeRabbiA(), boy = makeBoy();
const packB = KT.makeBackpack(); packB.position.set(-18, 42, 0); packB.scale.setScalar(0.8); boy.root.add(packB); packB.visible = false;
const stick = KT.makeWalkingStick(); stick.scale.setScalar(0.78); stick.position.set(26, 0, 22); boy.root.add(stick); stick.visible = false;
const notebook = L.makeNotebook(); GB.add(notebook); notebook.visible = false;
const scrollO = KT.makeMapScroll(true); boy.root.add(scrollO); scrollO.visible = false;
{ const mp = new THREE.Mesh(new THREE.PlaneGeometry(64, 46), new THREE.MeshBasicMaterial({ map: scrollTex })); mp.rotation.y = Math.PI / 2; mp.position.set(2.2, 0, 0); mp.scale.set(1, 1, 1); scrollO.add(mp); }
// gulls and tipas used on land scenes
const gullB = KT.makeGull(); GB.add(gullB.root); const gullS = KT.makeGull(); GS.add(gullS.root); const gullC = KT.makeGull(); GC.add(gullC.root);
const tipaG = KT.makeTipa(); GB.add(tipaG.root);
const tipaS = KT.makeTipa({ kind: 'small' }); GS.add(tipaS.root);
const fence = L.makeFence(900); GB.add(fence); fence.visible = false; const poof = L.makePoof(22, 160); fence.add(poof);
const crabB = KT.makeCrab(); GB.add(crabB.root); crabB.root.scale.setScalar(0.7);
const arcBeads = L.makeBeads(40, 3.6, '#ffd84a', 1.0); GB.add(arcBeads);
for (const o of [rabbi, boy]) { o.face.set({ expr: 'smile' }); }

/* ---------------------------------------------------------------- segments: absolute time ranges, scene, camera */
const SEGS = [];
const sg = (a, b, scn, p0, l0, p1, l1, fov0, fov1, sky, fn) => SEGS.push({ a, b, scn, p0, l0, p1: p1 || p0, l1: l1 || l0, f0: fov0 || 32, f1: fov1 || fov0 || 32, sky: sky || 'day', fn });
const sgf = (a, b, scn, fn, sky) => SEGS.push({ a, b, scn, fn, sky: sky || 'day' });   // free camera function
const segAt = t => SEGS.find(s => t < s.b) || SEGS[SEGS.length - 1];
function camOf(s, t) { if (s.fn) return s.fn(t, cl((t - s.a) / (s.b - s.a), 0, 1)); const u = ease(t, s.a, s.b); const o = s.scn === 'R' ? [0, ROOM_Y, ROOM_Z] : [0, 0, 0]; const a = L3(s.p0, s.p1, u), b = L3(s.l0, s.l1, u); return { p: [a[0] + o[0], a[1] + o[1], a[2] + o[2]], l: [b[0] + o[0], b[1] + o[1], b[2] + o[2]], fov: lerp(s.f0, s.f1, u) }; }
const bx = (x, z) => [x, gY(x, z), z];

// ---- a1 (beach, morning)
sg(0, 4.5, 'B', [-100, 330, 1450], [300, 150, -300], [80, 300, 1250], [260, 140, -200], 40, 34, 'morn');
sg(4.5, 9.5, 'B', [-140, 185, -230], [30, 150, 330], [-100, 185, -210], [30, 150, 330], 38, 36, 'morn');
sg(9.5, 14.54, 'B', [90, 185, -250], [40, 150, 320], [60, 180, -200], [40, 152, 320], 36, 33, 'morn');
// ---- a1 c2-c4 (map)
sg(14.54, 18.6, 'M', [1330, 170, 700], [1540, 25, 480], [1270, 270, 880], [1500, 10, 430], 36, 36, 'day');
sg(18.6, 22.19, 'M', [1500, 250, 820], [1556, 20, 485], [1522, 190, 740], [1556, 20, 483], 34, 32, 'day');
sg(22.19, 25.8, 'M', [900, 500, 1000], [1200, 0, 300], [800, 650, 1100], [1100, 0, 250], 36, 36, 'day');
sg(25.8, 29.05, 'M', [800, 650, 1100], [1100, 0, 250], [-300, 1100, 1800], [500, 0, 50], 36, 36, 'day');
sg(29.05, 33.6, 'M', [-300, 1100, 1800], [500, 0, 50], [0, 1750, 2350], [420, 0, 0], 36, 36, 'day');
sg(33.6, 35.9, 'B', [10, 185, -200], [40, 150, 315], [30, 182, -170], [40, 152, 315], 36, 33, 'day');
sg(35.9, 37.9, 'B', [-120, 190, -210], [60, 150, 320], [-90, 188, -190], [60, 150, 320], 36, 34, 'day');
// ---- a2 (map crane out, glow, middle, mishkan)
sg(37.9, 47.21, 'M', [1360, 150, 780], [1520, 20, 520], [250, 2700, 1500], [300, 0, 0], 34, 36, 'day');
sg(47.21, 49.9, 'M', [-300, 1000, 320], [-300, 0, -520], [-100, 950, 260], [-250, 0, -520], 40, 40, 'day');
sg(49.9, 52.3, 'M', [-100, 1100, -620], [-160, 0, 330], [60, 1050, -560], [-100, 0, 340], 40, 40, 'day');
sg(52.3, 54.58, 'M', [550, 1000, 700], [1650, 0, 100], [700, 950, 620], [1700, 0, 120], 40, 40, 'day');
sg(54.58, 58.6, 'M', [100, 2600, 1500], [100, 0, -50], [100, 2200, 1100], [100, 0, -50], 34, 34, 'day');
sg(58.6, 62.72, 'B', [60, 180, -110], [20, 160, 320], [45, 178, -80], [20, 160, 320], 28, 27, 'day');
sg(62.72, 66.5, 'R', [200, 185, 320], [0, 150, -100], [170, 185, 300], [0, 150, -100], 48, 46, 'day');
sg(66.5, 70.5, 'R', [-60, 185, 250], [40, 150, -160], [-30, 185, 235], [50, 150, -160], 46, 44, 'day');
// ---- a2b
sgf(70.5, 77.43, 'M', (t, u) => { const hp = boatCurve.getPointAt(ease(t, 70.5, 77.2) * 0.999); return { p: [hp.x - 260, hp.y + 230, hp.z + 400], l: [hp.x + 100, hp.y, hp.z - 30], fov: 34 }; });
sg(77.43, 82.0, 'M', [-200, 1500, 1700], [-300, 0, 100], [-1450, 330, 650], [-1780, 40, 150], 34, 32, 'day');
sg(82.0, 87.73, 'M', [-1380, 190, 520], [-1780, 70, 140], [-1480, 150, 460], [-1860, 60, 150], 32, 34, 'day');
sg(87.73, 92.0, 'M', [0, 430, 4130], [0, 140, 2900], [0, 410, 4070], [0, 140, 2900], 36, 36, 'day');
sgf(92.0, 96.52, 'M', (t, u) => { const k = sm(u); return { p: [lerp(0, 0, k), lerp(410, 400, k), lerp(4070, 4000, k)], l: [0, 150, 2900], fov: 35 }; });
sgf(96.52, 104.56, 'M', (t, u) => { const head = lineCurve.getPointAt(cl((t - 96.6) / 7.0, 0.01, 1)); return { p: [head.x - 330, head.y + 280, head.z + 520], l: [head.x + 160, head.y - 20, head.z - 20], fov: 34 }; });
sgf(104.56, 109.5, 'M', (t, u) => { const pu = cl((t - 104.56) / 4.9, 0.02, 1), pp = lineCurve.getPointAt(pu); return { p: [pp.x - 240, pp.y + 170, pp.z + 330], l: [pp.x + 90, pp.y - 10, pp.z - 20], fov: 34 }; });
sg(109.5, 113, 'B', [30, 190, -210], [60, 150, 315], [10, 188, -180], [60, 150, 315], 36, 34, 'day');
// ---- a3 (cliff, room, fence)
sg(113, 117.5, 'C', [-300, 640, 1000], [-40, 600, 520], [-230, 635, 960], [-40, 600, 520], 38, 36, 'day');
sg(117.5, 120.63, 'C', [250, 640, 1000], [-20, 595, 520], [210, 636, 960], [-20, 595, 520], 36, 34, 'day');
sg(120.63, 125, 'R', [-120, 175, 320], [-110, 158, -80], [-90, 178, 300], [-100, 158, -80], 56, 54, 'day');
sg(125, 129.35, 'R', [-30, 180, 310], [-100, 160, -80], [-60, 178, 290], [-100, 160, -80], 52, 50, 'day');
sg(129.35, 133.5, 'R', [40, 190, 260], [-10, 175, -150], [10, 188, 225], [-10, 175, -150], 42, 40, 'day');
sg(133.5, 136.0, 'R', [60, 200, 150], [-40, 130, -130], [40, 195, 140], [-40, 130, -130], 36, 34, 'day');
sg(136.0, 138.07, 'R', [-80, 172, 250], [-90, 172, 30], [-85, 172, 230], [-90, 174, 30], 34, 32, 'day');
sg(138.07, 142.0, 'B', [-760, 215, 700], [20, 90, 130], [-560, 205, 640], [60, 90, 130], 42, 38, 'day');
sg(142.0, 145.7, 'B', [60, 170, -600], [100, 100, 80], [20, 168, -560], [90, 100, 80], 36, 35, 'day');
// ---- a3b (sunset beach)
sg(145.7, 150, 'S', [60, 230, -250], [-60, 150, 330], [20, 225, -210], [-60, 150, 330], 38, 36, 'late');
sg(150, 154.14, 'S', [-60, 195, 60], [-190, 150, 330], [-90, 192, 80], [-190, 152, 330], 40, 38, 'late');
sg(154.14, 158.4, 'S', [-120, 230, 800], [-120, 190, -300], [-100, 225, 760], [-110, 180, -300], 40, 38, 'late');
sg(158.4, 162.18, 'S', [-125, 190, -200], [-125, 140, 350], [-110, 192, -190], [-125, 142, 350], 38, 37, 'late');
sg(162.18, 166.5, 'S', [120, 195, -250], [150, 150, 330], [170, 192, -230], [155, 150, 330], 38, 36, 'late');
sg(166.5, 170.98, 'S', [170, 190, -250], [190, 150, 330], [200, 188, -220], [190, 150, 330], 38, 36, 'late');
sg(170.98, 175, 'S', [-10, 230, 880], [0, 175, -900], [-20, 228, 840], [0, 178, -900], 38, 36, 'sunset');
sg(175, 179.02, 'S', [20, 215, 900], [-30, 160, -400], [0, 212, 860], [-30, 162, -400], 38, 36, 'sunset');
sg(179.02, 183, 'S', [40, 190, -130], [20, 150, 340], [20, 188, -110], [20, 150, 340], 38, 36, 'sunset');
sgf(183, 186.7, 'S', (t, u) => { const k = sm(u); return { p: [lerp(235, -420, k), 190, 330 - 280 * Math.sin(Math.PI * k)], l: [lerp(-40, 700, k), lerp(140, 130, k), lerp(340, -120, k)], fov: lerp(30, 38, k) }; }, 'sunset');
// ---- a4
sg(186.7, 194.44, 'M', [1360, 135, 360], [1530, 20, 470], [1390, 120, 380], [1530, 20, 480], 30, 30, 'day');
sgf(194.44, 198.5, 'M', (t, u) => { const k = sm(u); return { p: [lerp(1380, 1370, k), lerp(150, 140, k), lerp(380, 520, k)], l: [1530, 20, lerp(450, 530, k)], fov: 32 }; });
sg(198.5, 202.53, 'M', [1250, 330, 800], [1500, 10, 520], [1280, 300, 790], [1500, 10, 520], 36, 34, 'day');
sgf(202.53, 207.0, 'B', (t, u) => { const bx0 = boyWalkX(t); return { p: [bx0 + 120, 175, -250], l: [bx0 + 30, 150, 320], fov: 36 }; }, 'day');
sgf(207.0, 211.39, 'B', (t, u) => { const bx0 = boyWalkX(t); return { p: [bx0 - 330, 250, 830], l: [bx0 + 120, 120, 300], fov: 38 }; }, 'day');
sg(211.39, 214.5, 'M', [1200, 260, 760], [1520, 10, 500], [1260, 240, 720], [1520, 10, 500], 34, 34, 'day');
sg(214.5, 217.97, 'B', [-120, 190, -200], [-95, 160, 335], [-100, 188, -180], [-95, 160, 335], 38, 36, 'day');
sg(217.97, 222, 'M', [1280, 105, 560], [1505, 12, 470], [1330, 85, 520], [1505, 12, 470], 30, 30, 'day');
sg(222, 226.07, 'M', [1230, 230, 650], [1500, 10, 460], [1340, 330, 620], [1500, 10, 480], 32, 34, 'day');
sg(226.07, 229.7, 'H', [900, 1150, 100], [-100, 20, 350], [450, 560, 1000], [-150, 60, 300], 36, 34, 'day');
sg(229.7, 233.4, 'H', [-200, 300, 1050], [-250, 150, 500], [-260, 260, 1000], [-300, 160, 480], 32, 30, 'day');
sgf(233.4, 237, 'M', (t, u) => { const k = sm(u); return { p: [lerp(1360, 1330, k), lerp(140, 520, k), lerp(480, 1500, k)], l: [1520, 10, lerp(440, 560, k)], fov: lerp(30, 36, k) }; });
sg(237, 241.9, 'B', [40, 190, -150], [35, 150, 325], [20, 188, -130], [35, 152, 325], 38, 36, 'day');
// ---- a5 recap
sg(241.9, 252, 'S', [-60, 270, 1000], [130, 170, 330], [-40, 270, 990], [135, 170, 330], 38, 36, 'late');
sg(252, 264, 'S', [-40, 270, 990], [135, 170, 330], [-70, 268, 1010], [128, 170, 330], 36, 36, 'late');

/* ---------------------------------------------------------------- actors per scene */
const grp = { B: GB, S: GS, C: GC, H: GH, M: GM, R: GB };
const placeIn = (o, g) => { if (o.root.parent !== g) g.add(o.root); };
function boyWalkX(t) { return -700 + 125 * (t - 202.53); }
const setP = (o, po, face, y) => { o.pose(po); if (y != null) o.root.position.y = y; if (face) o.face.set(face); };
const rpos = (x, z) => [x, ROOM_Y, ROOM_Z + z];

/* beach pair poses by time. returns {R:{po,face,y}, B:{...}} in beach coordinates (room coords are converted) */
function pairBeach(t) {
  const R = { po: { t, x: 110, z: 330, yaw: 1.2, walk: 0 }, face: { expr: 'smile', blink: blinkAt(t, 0.15) } };
  const B = { po: { t, x: -30, z: 300, yaw: Math.PI / 2 - 0.15, walk: 0 }, face: { expr: 'smile', blink: blinkAt(t, 0.55) } };
  const bR = R.po, bB = B.po;
  if (t < 4.5) { const w = ease(t, 0.0, 4.4), x0 = 700;
    const xr = lerp(x0 + 120, 110, w), xb = lerp(x0, -30, w); const rc = rabbi.cycle || 110, bc = boy.cycle || 90;
    bR.x = xr; bR.z = 330; bR.yaw = Math.PI; bR.walk = t < 4.3 ? 1 : 0; bR.ph = (x0 + 120 - xr) / rc; bB.x = xb; bB.z = 300; bB.yaw = Math.PI; bB.walk = t < 4.3 ? 1 : 0; bB.ph = (x0 - xb) / bc;
    const tr = ease(t, 3.8, 4.5); bR.yaw = lerp(Math.PI, 1.25, tr); bB.yaw = lerp(Math.PI, Math.PI / 2 - 0.1, tr); R.face.expr = 'smile'; B.face.expr = 'smile';
    bR.arms = { l: { sz: 0.1 } }; }
  else if (t < 9.5) { bB.headYaw = -0.25 + 0.15 * Math.sin(t * 0.7); bB.yaw = Math.PI / 2 - 0.15; B.face.expr = 'thinking'; B.face.look = [0.4, 0.05]; R.face.look = [-0.3, 0]; bR.headYaw = 0.1; R.face.expr = 'smile';
    bB.arms = { r: { sz: 0.1, el: 0.4 }, l: { sz: 0.1 } }; }
  else if (t < 14.54) { const tu = ease(t, 9.5, 10.3), up = ease(t, 11.2, 12.0) * (1 - ease(t, 13.8, 14.4)); bB.yaw = lerp(Math.PI / 2 - 0.15, 0.35, tu); B.face.expr = 'smile'; B.face.look = [0.35, 0]; B.face.talk = talkAt(t, 10.4, 13.4, 0.2);
    bB.arms = { r: { sz: -1.55 * up - 0.06 * (1 - up), sx: 0.1, el: 0.2 + 0.3 * (1 - up), point: true, curl: 0.9 }, l: { sz: 0.08, el: 0.4 } }; bB.headYaw = -0.1;
    bR.yaw = lerp(1.25, 3.0, tu); R.face.expr = 'explaining'; R.face.look = [-0.4, 0]; bR.headYaw = -0.15; if (t > 12.8) R.face.talk = talkAt(t, 12.8, 14.5, 0.4); bR.arms = { l: { sz: -0.2, el: 0.7 } }; }
  else if (t >= 33.6 && t < 37.9) { bB.yaw = 0.2; B.face.expr = 'surprised'; B.face.look = [0.2, -0.1]; B.face.talk = (t % 1.2 < 0.5) ? 'O' : null; bB.arms = { r: { sz: -0.5, sx: 0.5, el: 0.5 }, l: { sz: -0.5, sx: 0.5, el: 0.5 } }; bB.headTilt = -3;
    bR.yaw = 3.05; R.face.expr = 'laugh'; R.face.look = [-0.3, 0]; bR.headYaw = -0.1; bR.bob = 1.5 * Math.sin(t * 5); bR.arms = { l: { sz: -0.3, el: 0.9 }, r: { sz: 0.08 } }; }
  else if (t >= 58.6 && t < 62.72) { bB.x = 20; bB.z = 320; bB.yaw = Math.PI / 2; const g = ease(t, 59.2, 60.4), sw = 0.25 * Math.sin((t - 60.4) * 3.2) * ease(t, 60.4, 61), ap = 0.45 - 0.3 * (ease(t, 61.2, 62.0));
    B.face.expr = 'explaining'; B.face.talk = talkAt(t, 59.0, 62.3, 0.3); B.face.look = [0, 0];
    bB.arms = { r: { sz: -1.15 * g, sx: ap - sw, el: 0.9, curl: 0.2 }, l: { sz: -1.15 * g, sx: ap + sw, el: 0.9, curl: 0.2 } }; bB.headTilt = 4; bR.x = 330; bR.z = 340; bR.yaw = 2.7; }
  else if (t >= 109.5 && t < 113) { bB.yaw = Math.PI / 2 - 0.5; const wp = ease(t, 109.8, 110.6) * (1 - ease(t, 112.0, 112.8)); B.face.expr = 'worried'; B.face.look = [0.2, 0.2];
    bB.arms = { r: { sz: -2.3 * wp, sx: 0.4, el: 1.8 * wp + 0.3, curl: 0.2 }, l: { sz: 0.1, el: 0.4 } }; bB.headTilt = -5 * wp; bB.bob = 2 * Math.sin(t * 3) * wp;
    bR.yaw = 2.9; R.face.expr = 'laugh'; bR.bob = 2.5 * Math.sin(t * 6); R.face.look = [-0.3, 0.1]; bR.arms = { l: { sz: -0.15, el: 0.8 }, r: { sz: -0.2, el: 0.8 } }; bR.x = 160; bR.z = 330; bB.x = -30; bB.z = 300; }
  else if (t >= 138.07 && t < 145.7) { bB.x = -230; bB.z = 340; bB.yaw = Math.PI / 2 - 0.2; const pt = ease(t, 139, 139.8); B.face.expr = t < 142 ? 'surprised' : 'smile'; B.face.look = [0.4, 0]; bB.arms = { r: { sz: -1.35 * pt, sx: 0.15, el: 0.15, point: true } };
    bR.x = -120; bR.z = 360; bR.yaw = Math.PI / 2 + 0.1; R.face.expr = 'explaining'; R.face.talk = talkAt(t, 138.5, 145, 0.1); bR.arms = { l: { sz: -0.5, el: 0.9 } }; }
  else if (t >= 202.53 && t < 211.39) { const x = boyWalkX(t); const bc = boy.cycle || 90; bB.x = x; bB.z = 300; bB.yaw = 0; bB.walk = 1; bB.ph = (x + 700) / bc; B.face.expr = 'smile'; B.face.look = [0.3, 0]; bB.arms = { r: { sz: -0.3, el: 0.5 } };
    bR.x = x - 3000; }
  else if (t >= 214.5 && t < 217.97) { bR.x = 0; bR.z = 330; bR.yaw = Math.PI / 2; R.face.expr = 'explaining'; R.face.talk = talkAt(t, 214.6, 217.5, 0.4); const p = ease(t, 214.9, 217.2);
    const ang = lerp(2.3, 0.85, p); bR.arms = { r: { sz: -1.2 - 0.0, sx: 0.3 + 0.0, el: 0.2, point: true }, l: { sz: 0.1, el: 0.4 } }; bR.arms.r.sx = lerp(1.05, 0.0, p) ; bR.headYaw = -0.2 + 0.4 * p; R.face.look = [0.4 * (2 * p - 1), -0.3];
    bB.x = -190; bB.z = 340; bB.yaw = Math.PI / 2 - 0.4; B.face.look = [0.3, -0.3]; B.face.expr = 'smile'; }
  else if (t >= 237 && t < 241.9) { bR.x = 100; bR.z = 340; bR.yaw = 3.0; R.face.expr = 'proud'; R.face.talk = talkAt(t, 237.2, 240.5, 0.5); const fu = ease(t, 237.8, 238.6); bR.arms = { r: { sz: -2.4 * fu, sx: 0.25, el: 0.4, point: true }, l: { sz: 0.1, el: 0.5 } };
    bB.x = -30; bB.z = 310; bB.yaw = 0.15; B.face.expr = 'smile'; const wr = Math.sin(t * 9); B.face.look = [0.0, -0.4]; bB.headTilt = 10 + 2 * Math.sin(t * 2.2);
    bB.arms = { r: { sz: -1.0 + 0.05 * wr, sx: 0.55, el: 1.5 + 0.12 * wr, point: true }, l: { sz: -0.7, sx: 0.4, el: 1.7 } }; }
  else { bR.x = 3000; bB.x = 3000; }
  return { R, B };
}
/* room poses */
function pairRoom(t) {
  const R = { po: { t, walk: 0 }, face: { expr: 'smile', blink: blinkAt(t, 0.15) } }, B = { po: { t, walk: 0 }, face: { expr: 'smile', blink: blinkAt(t, 0.55) } };
  const bR = R.po, bB = B.po;
  if (t < 70.5) { bR.x = 120; bR.z = -215; bR.yaw = -Math.PI / 2 - 0.35; const pt = ease(t, 63.8, 64.8), pt2 = ease(t, 66.0, 66.8);
    R.face.expr = 'explaining'; R.face.talk = talkAt(t, 63.0, 70.0, 0.1); R.face.look = [-0.3, -0.3]; bR.arms = { r: { sz: -1.45 * pt, sx: 0.0, el: 0.25, point: true }, l: { sz: -0.35, el: 0.9 } };
    bR.arms.r.sx = -0.1 - 0.35 * pt2; bR.headYaw = 0.3;
    bB.x = -130; bB.z = 20; bB.yaw = -Math.PI / 2 + 0.75; B.face.expr = 'smile'; B.face.look = [0.3, 0.1]; bB.headYaw = 0.2; bB.arms = { r: { sz: 0.1, el: 0.4 }, l: { sz: 0.1, el: 0.4 } }; }
  else if (t < 129.35) { bR.x = -60; bR.z = -80; bR.yaw = Math.PI; const hd = ease(t, 121.0, 121.9); R.face.expr = 'explaining'; R.face.talk = talkAt(t, 121.5, 128.8, 0.3); R.face.look = [0.2, 0.2];
    bR.arms = { r: { sz: -0.95 * hd - 0.05, sx: 0.2, el: 0.95 - 0.1 * hd, curl: 0.7 }, l: { sz: -0.15, el: 0.7 } }; bR.headYaw = 0.0; bR.headTilt = 6;
    bB.x = 110; bB.z = 40; bB.yaw = 2.6; B.face.expr = 'smile'; B.face.look = [-0.3, 0.1]; bB.headYaw = -0.2; bB.arms = { r: { sz: 0.1, el: 0.4 }, l: { sz: 0.1, el: 0.4 } };
    if (t > 126 && t < 129) { B.face.expr = 'surprised'; } }
  else { const mv = ease(t, 129.35, 130.8); bR.x = lerp(-60, 30, mv); bR.z = lerp(-80, -218, mv); bR.yaw = lerp(Math.PI, -Math.PI / 2, mv); bR.walk = (mv > 0.02 && mv < 0.98) ? 1 : 0; bR.ph = mv * 1.2;
    const op = ease(t, 132.0, 132.8); R.face.expr = 'explaining'; R.face.talk = talkAt(t, 131.2, 137.5, 0.6); R.face.look = [0.0, -0.45];
    bR.arms = { r: { sz: -0.9 * ease(t, 131, 131.8) * (1 - 0.4 * op), sx: 0.1, el: 1.0, curl: 0.4 }, l: { sz: -0.9 * ease(t, 131, 131.8) * (1 - 0.4 * op), sx: 0.1, el: 1.0, curl: 0.4 } }; bR.headTilt = 8; bR.walk = bR.walk;
    if (mv >= 1) bR.arms = { r: { sz: -1.0 + 0.5 * op, sx: 0.12 + 0.3 * op, el: 1.0, curl: 0.4 }, l: { sz: -1.0 + 0.5 * op, sx: 0.12 + 0.3 * op, el: 1.0, curl: 0.4 } };
    bB.x = -90; bB.z = 30; bB.yaw = -Math.PI / 2 + 0.55; B.face.expr = 'thinking'; B.face.look = [0.3, 0.0]; bB.headYaw = 0.1; bB.headTilt = 3; bB.arms = { r: { sz: 0.08, el: 0.5 }, l: { sz: 0.08, el: 0.5 } }; }
  // convert to world (room offset)
  [R, B].forEach(o => { const p = rpos(o.po.x, o.po.z); o.po.x = p[0]; o.po.z = p[2]; o.y = ROOM_Y; });
  return { R, B };
}
function pairCliff(t) {
  const topY = CL.topY, R = { po: { t, x: 40, z: 560, yaw: Math.PI / 2 + 0.0, walk: 0 }, face: { expr: 'smile', blink: blinkAt(t, 0.15), look: [0.1, 0.0] } }, B = { po: { t, x: -90, z: 540, yaw: Math.PI / 2, walk: 0 }, face: { expr: 'smile', blink: blinkAt(t, 0.55), look: [0.1, 0.1] } };
  const pt = ease(t, 115.0, 115.9); const bR = R.po, bB = B.po;
  bB.arms = { r: { sz: -1.4 * pt, sx: 0.15, el: 0.15, point: true }, l: { sz: 0.08, el: 0.4 } }; B.face.expr = t > 115 ? 'surprised' : 'smile'; bB.headYaw = 0.0;
  R.face.expr = 'explaining'; R.face.talk = talkAt(t, 116.2, 120.2, 0.2); bR.arms = { l: { sz: -0.5, el: 0.9 } }; bR.yaw = Math.PI / 2 + 0.1; bR.headYaw = 0.1;
  if (t > 117.5) { bB.yaw = Math.PI / 2 + 0.25; bR.yaw = Math.PI / 2 + 0.15; }
  R.y = topY; B.y = topY; return { R, B };
}
function pairSun(t) {
  const R = { po: { t, x: 140, z: 380, yaw: Math.PI / 2, walk: 0 }, face: { expr: 'smile', blink: blinkAt(t, 0.15) } }, B = { po: { t, x: -20, z: 340, yaw: Math.PI / 2, walk: 0 }, face: { expr: 'smile', blink: blinkAt(t, 0.55) } };
  const bR = R.po, bB = B.po;
  if (t < 154.14) { const lk = Math.sin((t - 146) * 0.9); bB.x = -190; bB.z = 330; bB.yaw = Math.PI / 2 - 0.3 - 0.5 * Math.sin(lk * 1.6); bB.headYaw = 0.5 * lk; B.face.expr = 'thinking'; B.face.look = [0.4 * lk, 0.1]; bR.x = 80; bR.z = 400; bR.yaw = 1.9; R.face.expr = 'smile'; R.face.talk = talkAt(t, 151, 153.5, 0.3);
    bB.arms = { r: { sz: -0.5, sx: 0.4, el: 0.9 }, l: { sz: 0.05, el: 0.4 } }; bR.arms = { l: { sz: -0.2, el: 0.8 } }; }
  else if (t < 162.18) { bB.x = -190; bB.z = 340; bB.yaw = Math.PI / 2; const pt = ease(t, 155.2, 156.1); bB.arms = { r: { sz: -1.4 * pt, sx: 0.15, el: 0.15, point: true }, l: { sz: 0.08, el: 0.4 } }; B.face.expr = 'surprised'; B.face.look = [0.2, 0.2]; bR.x = -60; bR.z = 360; bR.yaw = Math.PI / 2 - 0.2; R.face.expr = 'explaining'; R.face.talk = talkAt(t, 157, 161.5, 0.5); bR.arms = { l: { sz: -0.4, el: 0.9 } }; }
  else if (t < 170.98) { bR.x = 178; bR.z = 322; bR.yaw = Math.PI; bR.arms = { r: { sz: -0.3, el: 0.9 }, l: { sz: -0.15, el: 0.8 } }; R.face.expr = 'explaining'; R.face.talk = talkAt(t, 163, 170, 0.2); R.face.look = [-0.2, 0.0]; bR.headTilt = 5;
    bB.x = 280; bB.z = 360; bB.yaw = 2.6; B.face.expr = 'smile'; B.face.look = [-0.3, 0]; bB.arms = { r: { sz: 0.08, el: 0.5 }, l: { sz: 0.08, el: 0.5 } }; }
  else if (t < 179.02) { bB.x = -80; bB.z = 340; bB.yaw = Math.PI / 2; const w = ease(t, 173.0, 175.5), dn = ease(t, 175.5, 178.0); B.face.expr = 'happy' === 'x' ? 'smile' : 'smile'; B.face.look = [0.2, 0.2];
    bB.arms = { r: { sz: -1.5, sx: lerp(0.6, 0.0, w) , el: 0.25, curl: 0.2 }, l: { sz: 0.08, el: 0.4 } }; bB.arms.r.sz = -1.45 + 0.9 * dn; bB.arms.r.sx = 0.35 - 0.5 * w + 0.0;
    bR.x = 70; bR.z = 380; bR.yaw = Math.PI / 2 - 0.1; R.face.expr = 'laugh'; bR.bob = 1.5 * Math.sin(t * 5); R.face.look = [0.1, 0.1]; bR.arms = { l: { sz: -0.2, el: 0.8 } }; }
  else if (t < 186.7) { bB.x = -60; bB.z = 340; bB.yaw = 0.0; const lf = ease(t, 179.6, 180.4); B.face.expr = 'proud'; B.face.look = [0.3, 0.2]; B.face.talk = talkAt(t, 180, 185, 0.7);
    bB.arms = { r: { sz: -1.0 * lf, sx: 0.2, el: 1.1 * lf + 0.3, curl: 0.6 }, l: { sz: -1.0 * lf, sx: 0.2, el: 1.1 * lf + 0.3, curl: 0.6 } }; bB.headTilt = -3;
    bR.x = 100; bR.z = 380; bR.yaw = 2.9; R.face.expr = 'smile'; R.face.look = [-0.3, 0.1]; bR.arms = { l: { sz: -0.3, el: 0.9 } }; }
  else { // recap: sitting on the bench
    const bz = 460; bR.x = BENCH_X + 8; bR.z = bz - 45; bR.yaw = Math.PI / 2; bR.bob = 52; bR.walk = 0; bB.x = BENCH_X + 8; bB.z = bz + 45; bB.yaw = Math.PI / 2; bB.bob = 40;
    R.face.expr = 'smile'; R.face.look = [0.1, 0]; B.face.look = [0.1, 0.05]; R.face.talk = null; bR.headYaw = 0.1 * Math.sin(t * 0.3); bB.headYaw = -0.15; B.face.expr = 'smile';
    bR.arms = { l: { sz: -0.55, el: 1.2 }, r: { sz: -0.3, el: 1.0 } }; bB.arms = { l: { sz: -0.5, el: 1.0 }, r: { sz: -0.55, el: 1.1 } };
    const sw = Math.sin((t - 241.9) * 0.18); bR.headTilt = 2 * sw; if (t > 250 && t < 252) B.face.look = [0.3, 0]; if (t > 256 && t < 259) { bR.arms = { l: { sz: -0.55, el: 1.2 }, r: { sz: -0.8, sx: 0.3, el: 0.8, point: true } }; } }
  R.y = gY(R.po.x, R.po.z) - 2; B.y = gY(B.po.x, B.po.z) - 2; if (t >= 241.9) { R.y = gY(R.po.x, R.po.z) - 4; B.y = gY(B.po.x, B.po.z) - 4; }
  return { R, B };
}

/* ---------------------------------------------------------------- per-frame update */
const tmp = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
const mapAt = (x, y, z) => ({ x, y, z });
const camPos = new THREE.Vector3();
function showOnly(k) { GB.visible = k === 'B' || k === 'R'; GS.visible = k === 'S'; GC.visible = k === 'C'; GH.visible = k === 'H'; GM.visible = k === 'M'; RG.visible = k === 'R'; }

function frame(t) {
  const s = segAt(t), k = s.scn;
  showOnly(k);
  // tint / vignette defaults
  tintMat.opacity = 0; VIG.material.opacity = 0; N15.visible = N195.visible = N3700.visible = CLK.visible = TALLY.visible = SUNO.visible = MOON.visible = false; MAPGHOST.material.opacity = 0;
  SKY.visible = s.sky !== 'sunset' && k !== 'S' || false; SKYS.visible = false;
  // sky
  if (k === 'S') { SKY.visible = false; SKYS.visible = true; }
  else { SKY.visible = true; }
  /* ---- skies */
  if (k === 'B' || k === 'R') {
    if (t < 14.54) setSky(SKY, 'morn', 'day', ease(t, 6, 14)); else setSky(SKY, 'day', 'day', 0);
    if (t >= 202.53 && t < 211.39) { /* day-night cycle set below */ }
  } else if (k === 'C' || k === 'H' || k === 'M') setSky(SKY, 'day', 'day', 0);
  /* ---- scene updates */
  if (k === 'B' || k === 'R') { BE.update(t); birdsB.userData.update(t); butter.userData.update(t);
    const f = BE.sea.float(-700 + 40 * Math.sin(t * 0.1), -1500, 100); sailB.position.set(-700 + 40 * Math.sin(t * 0.1), f.y - 8, -1500); sailB.rotation.set(f.rx, 1.4, f.rz);
    gullB.root.visible = false; crabB.root.visible = false; fence.visible = false; tipaG.root.visible = false; arcBeads.visible = false; notebook.visible = false; scrollO.visible = false;
    packB.visible = false; stick.visible = false;
    RG.visible = (k === 'R'); [fgGrass, fgRock, fgLeaf].forEach(o => o.visible = false);
  }
  if (k === 'R') { mish.visible = t < 113; mish.userData.slide(ease(t, 64.2, 68.6)); sefTable.visible = t >= 129.35; clBook.visible = t < 132.2; opBook.root.visible = t >= 132.2; opBook.root.scale.setScalar(0.5 + 0.5 * ease(t, 132.2, 133.2));
    const pulse = 0.55 + 0.25 * Math.sin(t * 2.4); sefGlow.material.opacity = (t >= 120.63 && t < 129.35) ? pulse * ease(t, 120.9, 122.5) : 0; sefGlow.visible = sefGlow.material.opacity > 0; GL3.visible = false; }
  if (k === 'B') {
    // title gull
    if (t < 14) { gullB.root.visible = true; gullB.pose({ t, x: lerp(-1600, 900, ease(t, 0, 9)), y: 520 + 40 * Math.sin(t * 0.9), z: 40, yaw: 0, fly: true, flap: 0.5 + 0.5 * Math.abs(Math.sin(t * 0.9)) > 0.8 ? 1 : 0.0, shadow: false }); gullB.face.set({ expr: 'happy', blink: false }); }
    if (t < 14.54 || (t >= 33.6 && t < 37.9)) { crabB.root.visible = true; crabB.pose({ t, x: -240, z: 150 + 30 * Math.sin(t * 0.4), y: gY(-240, 150), yaw: 0.3, walk: 0.0 }); crabB.root.position.y = gY(-240, 150); crabB.face.set({ expr: 'curious', blink: blinkAt(t, 0.9) }); }
    if (t >= 138.07 && t < 145.7) { fence.visible = true; const ap = ease(t, 138.3, 140.0); const dis = ease(t, 142.0, 142.3);
      fence.position.set(-30, gY(0, 250), 250); const pu = cl((t - 142.0) / 1.2, 0, 1); poof.userData.set(pu); fence.children.forEach(c => { if (c !== poof) c.visible = t < 142.15; });
      fence.scale.set(1, ap, 1); fence.scale.set(1, ap + 0.0001, 1); poof.scale.set(1, 1 / Math.max(ap, 0.001), 1);
      tipaG.root.visible = true; const tx = t < 142 ? 340 : 330 - 260 * ease(t, 142.5, 145.6) * 0 + 120 * Math.sin((t - 142) * 0.9);
      const wl = t < 142 ? 0 : 1, dx = (t - 142) * 0.9; const px = t < 142 ? 340 : 340 - 240 * Math.abs(Math.sin(dx * 0.6)); const ph = t < 142 ? 0 : (340 - px) / (tipaG.cycle || 120) + dx * 0.0;
      tipaG.pose({ t, x: px, z: 38, y: gY(px, 38), yaw: t < 142 ? 1.2 : (Math.cos(dx * 0.6) * Math.sin(dx * 0.6) >= 0 ? 3.1 : 0.05), arms: 'wave', walk: wl && Math.abs(Math.cos(dx * 0.6)) > 0.2 ? 1 : 0, ph: Math.abs(dx) * 1.0, hopH: 30 });
      tipaG.root.position.y = gY(px, 38) - 2; tipaG.face.set({ expr: t < 142 ? 'curious' : 'happy', look: [0.2, 0.2], talk: null, blink: blinkAt(t, 0.3) }); }
    if (t >= 202.53 && t < 211.39) { packB.visible = true; stick.visible = true; }
    if (t >= 214.5 && t < 217.97) { arcBeads.visible = true; const p = ease(t, 214.9, 217.2); const ac = u => V(-260 + 520 * u, gY(0, 300) + 250 + 120 * Math.sin(Math.PI * u), 300); arcBeads.userData.set(ac, p, t, 0); }
    if (t >= 237 && t < 241.9) { notebook.visible = true; const wr = Math.sin(t * 9); notebook.position.set(-30 + 36, gY(-30, 310) + 118, 310 - 4); notebook.rotation.set(0, 0, -0.5); }
  }
  // ---- sky cycles for a4 c3 (day-night x8)
  if (k === 'B' && t >= 202.53 && t < 211.39) { const per = (211.39 - 202.53) / 8, ph = ((t - 202.53) / per) % 1, n = Math.floor((t - 202.53) / per);
    const night = sm(cl((ph - 0.42) / 0.16, 0, 1)) * (1 - sm(cl((ph - 0.9) / 0.1, 0, 1)));
    setSky(SKY, 'day', 'night', night); tintMat.color.set('#142a6a'); tintMat.opacity = 0.46 * night;
    const dayP = cl(ph / 0.5, 0, 1), nightP = cl((ph - 0.5) / 0.5, 0, 1);
    SUNO.visible = ph < 0.55; SUNO.position.set(lerp(110, -110, dayP), 40 + 20 * Math.sin(Math.PI * dayP), 0); MOON.visible = ph > 0.45; MOON.position.set(lerp(110, -110, nightP), 40 + 18 * Math.sin(Math.PI * nightP), 0);
    TALLY.visible = true; tallyBars.forEach((b, i) => { const sh = i < n || (i === n && ph > 0.97); b.visible = i < Math.min(8, n) ; if (i === n && ph > 0.7) { b.visible = true; b.scale.setScalar(sm((ph - 0.7) / 0.3)); } else b.scale.setScalar(1); }); }
  if (k === 'B' && t >= 211.39 && t < 214.5) {}
  if (k === 'C') { CL.update(t); birdsC.userData.update(t); gullC.root.visible = true; gullC.pose({ t, x: lerp(-1200, 800, ease(t, 113, 125)), y: 780 + 30 * Math.sin(t), z: 200, yaw: 0, fly: true, flap: 1, shadow: false }); gullC.face.set({ expr: 'happy' }); gullC.root.visible = t < 121; }
  if (k === 'S') { BS.update(t); birdsS.userData.update(t);
    const lateK = t < 154.14 ? 0 : t < 162.18 ? ease(t, 154.14, 162.18) : 1;   // 0 afternoon .. 1 sunset
    const sy = t < 154.14 ? lerp(0.42, 0.34, ease(t, 145.7, 154.14)) : t < 162.18 ? lerp(0.34, 0.075, ease(t, 154.14, 160.5)) : t < 170.98 ? lerp(0.075, 0.06, ease(t, 162.18, 170.98)) : t < 179.02 ? lerp(0.06, -0.075, ease(t, 172.2, 177.8)) : t < 241.9 ? -0.085 : 0.045;
    SKYS.material.uniforms.uDir.value.set(0, sy, -1).normalize();
    let pa = 'late', pb = 'sunset', kk = lateK; if (t >= 170.98 && t < 186.7) { pa = 'sunset'; pb = 'dusk'; kk = ease(t, 174, 186.7); } else if (t >= 186.7) { pa = 'late'; pb = 'sunset'; kk = 0.55; }
    setSky(SKYS, pa, pb, kk);
    SKYS.material.uniforms.uHasSun.value = t >= 241.9 ? 0 : 1; sunRec.visible = t >= 241.9;
    tintMat.color.set('#ff8a40'); tintMat.opacity = 0.16 + 0.16 * lateK + (t >= 170.98 ? 0.05 : 0);
    // compass rose: rotated so its west point faces the sea (-z): local W point = +? (made along local +x at angle 3*PI/2) -> rotate so it points to -z
    compass.rotation.y = 0; { const g = compass.userData.glow, lit = ease(t, 156.0, 158.0); g.material.opacity = lit * (0.55 + 0.25 * Math.sin(t * 5)); g.visible = true; compass.userData.W.scale.set(1 + 0.12 * lit, 1, 1 + 0.12 * lit); }
    compass.visible = t < 186.7; sunDoor.visible = (t >= 170.98 && t < 179.02);
    if (sunDoor.visible) { sunDoor.userData.open(ease(t, 171.5, 173.2) * (1 - ease(t, 177.4, 178.8))); }
    const gl = t >= 162.18 && t < 170.98 ? 0.55 + 0.25 * Math.sin(t * 2.2) : 0; sefGlowS.material.opacity = Math.min(1, gl * 1.5) * ease(t, 162.2, 164); sefGlowS.visible = gl > 0; fgGrassS.visible = false;
    shtS.root.visible = t >= 160 && t < 241.9; rockS.visible = t >= 160 && t < 241.9; bench.root.visible = t >= 241.9;
    gullS.root.visible = t >= 241.9; if (t >= 241.9) { gullS.pose({ t, x: lerp(-1300, 1700, ((t - 241.9) / 22.1)), y: 620 + 50 * Math.sin(t * 0.7), z: -200, yaw: 0, fly: true, flap: 1, shadow: false }); gullS.face.set({ expr: 'happy' }); }
    tipaS.root.visible = t >= 241.9; if (t >= 241.9) { tipaS.pose({ t, x: -460, y: gY(-460, 390) - 2, z: 390, yaw: Math.PI / 2 - 0.3, arms: 'down' }); tipaS.root.position.y = gY(-460, 390) - 2; tipaS.face.set({ expr: 'happy', look: [0.3, 0], blink: blinkAt(t, 0.8) }); }
    const f2 = BS.sea.float(900, -1400, 100); sailS.position.set(900, f2.y - 8, -1400); sailS.rotation.set(f2.rx, 1.6, f2.rz); sailS.visible = t >= 160;
    if (t >= 179.02 && t < 186.7) { const vis = true; scrollO.visible = true; }
    if (t >= 241.9) { VIG.material.opacity = 0.0; }
    tintMat.opacity = Math.min(0.36, tintMat.opacity);
  }
  if (k === 'H') { HB.update(t); birdsH.userData.update(t);
    const p = [-420 + 0 * t, 0, 400]; const f1 = HB.sea.float(p[0], p[1] === 0 ? p[2] : 0, 400); cShip.position.set(-170, 0, 360); cShip.rotation.set(0, 0, 0); cShip.position.y = -16;
    const ft = HB.sea.float(300, 220, 100); tug.position.set(300 + 20 * Math.sin(t * 0.3), ft.y - 6, 220); tug.rotation.set(ft.rx, 0.6, ft.rz);
    boatsH.forEach((b, i) => { const x = [-760, 620][i] + 10 * Math.sin(t * 0.4 + i), z = [460, 310][i]; const f = HB.sea.float(x, z, 60); b.position.set(x, f.y - 8, z); b.rotation.set(f.rx, 1.5 + 0.2 * i, f.rz); });
    // gull lands on the container ship bridge / boat
    const ld = ease(t, 229.6, 232.4), tgt = V(-620 + 0, 112, 460);
    const fu = ease(t, 226.07, 229.6), gp = V(lerp(lerp(2400, 500, fu), tgt.x, ld), lerp(lerp(700, 480, fu), tgt.y, ld) + 70 * Math.sin(Math.PI * ld) * (1 - ld), lerp(lerp(-500, 140, fu), tgt.z, ld)); gullH.root.visible = t >= 226.07;
    gullH.pose({ t, x: gp.x, y: gp.y, z: gp.z, yaw: Math.PI + 0.3 * (1 - ld), fly: ld < 0.96, flap: ld < 0.96 ? (1 - ld * 0.8) : 0, shadow: false, headRot: 0 }); gullH.face.set({ expr: ld > 0.96 ? 'happy' : 'curious', blink: blinkAt(t, 0.3) });
    fgRockH.visible = false; }
  if (k === 'M') mapUpdate(t);
  /* ---- people */
  const showPeople = k === 'B' || k === 'R' || k === 'C' || k === 'S';
  rabbi.root.visible = boy.root.visible = showPeople;
  if (showPeople) {
    const P = k === 'B' ? pairBeach(t) : k === 'R' ? pairRoom(t) : k === 'C' ? pairCliff(t) : pairSun(t);
    const g = grp[k]; placeIn(rabbi, g); placeIn(boy, g);
    const yy = (o, q) => q.y != null ? q.y : gY(q.po.x, q.po.z) - 2;
    packB.visible = packB.visible && k === 'B'; stick.visible = stick.visible && k === 'B';
    scrollO.visible = scrollO.visible && k === 'S';
    rabbi.pose(P.R.po); rabbi.root.position.y = yy(rabbi, P.R); rabbi.face.set(P.R.face);
    boy.pose(P.B.po); boy.root.position.y = yy(boy, P.B); boy.face.set(P.B.face);
    if (k === 'S' && t >= 179.02 && t < 186.7) { scrollO.position.set(36, 118, 0); scrollO.rotation.set(0, 0, 0); scrollO.scale.setScalar(1.15); }
    if (k === 'B' && t >= 202.53 && t < 211.39) { stick.position.set(30, 0, 24); }
  } else { rabbi.root.visible = boy.root.visible = false; }
  /* ---- foreground blur elements */
  /* ---- camera */
  const c = window.__co ? (s.scn === 'R' ? { p: [window.__co.p[0], window.__co.p[1] + ROOM_Y, window.__co.p[2] + ROOM_Z], l: [window.__co.l[0], window.__co.l[1] + ROOM_Y, window.__co.l[2] + ROOM_Z], fov: window.__co.fov } : window.__co) : camOf(s, t);
  cam.fov = c.fov; cam.updateProjectionMatrix(); cam.position.set(...c.p); cam.lookAt(...c.l);
  cam.updateMatrixWorld(true);
  // gentle handheld-free: none
  const place = (o, dx, dy, dz) => { o.position.copy(cam.position).add(tmp.set(dx, dy, dz).applyQuaternion(cam.quaternion)); o.quaternion.copy(cam.quaternion); };
  if (k === 'B' && ((t >= 4.5 && t < 9.5) || (t >= 109.5 && t < 113))) { fgGrass.visible = true; place(fgGrass, -118, -66, -262); }
  if (k === 'B' && (t >= 138.07 && t < 145.7)) { fgRock.visible = false; place(fgRock, 120, -68, -250); }
  if (k === 'B' && ((t >= 58.6 && t < 62.72) || (t >= 214.5 && t < 217.97))) { fgLeaf.visible = true; place(fgLeaf, 205, 95, -262); }
  if (k === 'C') { fgLeafC.visible = false; place(fgLeafC, 124, 66, -262); }
  if (k === 'S') { fgGrassS.visible = (t >= 150 && t < 154.14) || (t >= 162.18 && t < 170.98) || t >= 241.9; place(fgGrassS, -120, -66, -262); }
  if (k === 'H') { fgRockH.visible = t >= 229.7; place(fgRockH, 124, -66, -262); }
  SKY.position.copy(cam.position); SKYS.position.copy(cam.position); if (k === 'S' && t >= 241.9) { sunRec.position.set(cam.position.x, cam.position.y + 560, cam.position.z - 9300); sunRec.quaternion.copy(cam.quaternion); }
  /* ---- overlays */
  overlays(t, k);
  if (k === 'S' && t >= 241.9) { VIG.material.opacity = 0.62; }
  renderer.render(scene, cam);
}

/* ---------------------------------------------------------------- the map shots */
function mapUpdate(t) {
  MP.update(t); MP.setSand(t, 0);
  const pop = (a, b) => ease(t, a, b);
  // kinneret pulse (a1 c2, then it is the unit of the stamps)
  const pls = 1 + 0.45 * Math.sin(t * 5), inA = t >= 14.54 && t < 29.05 + 8, kv = (t >= 14.54 && t < 26.5) || (t >= 186 && t < 187);
  lake.visible = lakeLine.visible = t < 30; kinRing.visible = kinRing2.visible = t >= 14.54 && t < 24; kinRing.scale.setScalar(pls); kinRing2.scale.setScalar(1.5 + 0.35 * Math.sin(t * 5 + 1.2)); kinRing2.material.opacity = 0.7 - 0.4 * Math.abs(Math.sin(t * 2.5));
  lake.scale.set(9 * (1 + 0.1 * Math.sin(t * 5)), 1, 17 * (1 + 0.1 * Math.sin(t * 5)));
  // stamps: 0..0.55 during c3, up to 1 in c4
  const sp = t < 22.3 ? 0 : t < 29.05 ? 0.42 * ease(t, 22.3, 29.0) + 0.0 : 0.42 + 0.58 * ease(t, 29.05, 31.6);
  setStamps(t < 22.3 ? 0 : (t < 37.9 ? sp : 0), t);
  // tipa on the map
  const tipaScale = 0.3;
  tipaM.root.visible = (t >= 14.54 && t < 29.05) || (t >= 37.9 && t < 47.21) || (t >= 186.7 && t < 202.53);
  pin.visible = t >= 37.9 && t < 47.21 || (t >= 104.56 && t < 113) || false;
  const hopTo = (o, x, y, z, yaw, ex, extra) => { o.pose(Object.assign({ t, x, y, z, yaw }, extra || {})); o.face.set(Object.assign({ expr: ex, blink: blinkAt(t, 0.3) }, {})); };
  if (t >= 14.54 && t < 29.05) { const k0 = kin.clone(); tipaM.root.scale.setScalar(lerp(0.34, 0.5, ease(t, 17, 19))); const wv = t >= 18.6;
    tipaM.pose({ t, x: k0.x + 38, y: k0.y + 1, z: k0.z + 6, yaw: Math.PI + 0.6, arms: t < 19.5 ? 'wave' : 'hips' }); tipaM.face.set({ expr: t < 22 ? 'happy' : t < 26 ? 'curious' : 'cheering', look: [-0.5, 0.1], talk: talkT(t, 18.8, 21.5, 0.3), blink: blinkAt(t, 0.3) }); }
  if (t >= 37.9 && t < 47.21) { const u = ease(t, 37.9, 47.21); tipaM.root.scale.setScalar(lerp(0.3, 0.9, u)); pin.position.set(pinCoast.x, pinCoast.y + 10 + 14 * Math.abs(Math.sin(t * 3.2)), pinCoast.z); pin.scale.setScalar(lerp(1, 2.8, u));
    tipaM.pose({ t, x: pinCoast.x - 26 * lerp(1, 2.6, u), y: pinCoast.y + 2, z: pinCoast.z - 12 * lerp(1, 2.6, u), yaw: Math.PI + 0.3, arms: 'wave' }); tipaM.face.set({ expr: 'cheering', look: [-0.4, 0.2], talk: talkT(t, 39, 46, 0.2), blink: false }); }
  // stamps hold digits (overlay below)
  // gull flying over the continents (a2 c2)
  gullM.root.visible = t >= 47.21 && t < 54.58;
  if (gullM.root.visible) { const u = (t - 47.21) / 7.37; const tp = [GLOWH.eu, GLOWH.af, GLOWH.as]; const seg = Math.min(2, Math.floor(u * 3)), su = u * 3 - seg; const a = tp[seg];
    gullM.pose({ t, x: a.x - 380 + 760 * su, y: a.y + 170 + 20 * Math.sin(t * 1.5), z: a.z + 20 * Math.sin(su * 6), yaw: 0, fly: true, flap: 1, shadow: false }); gullM.face.set({ expr: 'happy' }); }
  // continent glows (a2 c2: north, south, east in turn; c3: push to the centre)
  const tc = t - 47.21; const gl = (ph0, ph1) => ease(t, ph0, ph0 + 0.6) * (1 - ease(t, ph1 - 0.5, ph1));
  const gv = { eu: gl(47.2, 49.7), af: gl(49.5, 52.0), as: gl(51.8, 54.5) }; const push = ease(t, 54.58, 58.0), push2 = 1 - ease(t, 60.5, 62.7);
  for (const key of ['eu', 'af', 'as']) { const g = GLOWS[key]; const on = t >= 47.2 && t < 62.72; g.visible = on; let a = t < 54.58 ? gv[key] : (0.9 * Math.max(push2, 0)); g.material.opacity = (0.5 + 0.12 * Math.sin(t * 4 + key.length)) * a;
    const cen = MP.anchors.med; const mv = push * 0.1; g.position.set((cen[0] - GLOWH[key].x) * mv, 14 * a + 3 * Math.sin(t * 3 + key.length) * a, (cen[2] - GLOWH[key].z) * mv); }
  ripples.forEach((r, i) => { r.visible = t >= 54.58 && t < 62.72; const u = frac((t - 54.58) * 0.3 + i / 3); r.scale.setScalar(0.3 + 2.2 * u); r.material.opacity = 0.7 * (1 - u) * ease(t, 54.58, 56); });
  // a2b: boat with Tipa riding the shores
  const mbv = t >= 70.5 && t < 77.43; mBoat.visible = mbv; tipaB.root.visible = mbv;
  if (mbv) { const u = ease(t, 70.5, 77.2) * 0.999, p = boatCurve.getPointAt(u), tg = boatCurve.getTangentAt(u); const f = Math.sin(t * 2.1) * 0.04;
    mBoat.position.set(p.x, p.y + 1 + 1.4 * Math.sin(t * 3), p.z); mBoat.rotation.set(0.04 * Math.sin(t * 2.4), Math.atan2(-tg.z, tg.x), f);
    const shrug = t > 75.8; tipaB.pose({ t, x: p.x, y: p.y + 20, z: p.z, yaw: Math.atan2(-tg.z, tg.x) - 0.3, arms: shrug ? 'up' : 'point', feet: false, tilt: 3 * Math.sin(t * 2.4) }); tipaB.face.set({ expr: shrug ? 'worried' : 'curious', look: [0.5, 0.0], blink: blinkAt(t, 0.2) }); tipaB.root.position.set(p.x, p.y + 22, p.z); }
  // gate at Gibraltar
  gate.visible = t >= 77.43 && t < 87.73; if (gate.visible) { const g = ease(t, 79.5, 81.8); const pu = 0.5 + 0.5 * Math.sin(t * 4); gate.scale.setScalar(0.4 + 0.6 * g); gate.userData.gm.opacity = 0.5 + 0.4 * pu; gate.userData.fill.material.opacity = (0.15 + 0.35 * pu) * g; }
  // compare diorama
  CMP.visible = t >= 87.73 && t < 96.52; cmpNums.forEach((n, i) => { n.rotation.set(-0.12, 0, 0); n.scale.setScalar(0.4 + 0.6 * ease(t, 90.0 + i * 1.6, 91.4 + i * 1.6) + 0.04 * Math.sin(t * 4)); n.visible = t > 89.8 + i * 1.6; });
  // dotted line + plane + clock
  const lv = t >= 96.52 && t < 113; beads.visible = lv; plane.visible = t >= 104.56 && t < 109.6; pin.visible = pin.visible;
  if (lv) { const prog = ease(t, 96.6, 103.6); beads.userData.set(u => lineCurve.getPointAt(u), t < 104.56 ? prog : 1, t, 0); }
  if (plane.visible) { const u = cl((t - 104.56) / 4.9, 0.01, 0.995), p = lineCurve.getPointAt(u), tg = lineCurve.getTangentAt(u); plane.position.set(p.x, p.y + 18 + 4 * Math.sin(t * 5), p.z); plane.rotation.set(0, Math.atan2(-tg.z, tg.x), 0.05 * Math.sin(t * 3)); }
  if (t >= 104.56 && t < 113) { pin.visible = true; pin.position.set(pinCoast.x + 12, pinCoast.y + 10 + 8 * Math.abs(Math.sin(t * 3.2)), pinCoast.z - 10); pin.scale.setScalar(1.2); }
  // a4: tipa runs along the coast, coast line, bow, bay
  const cv0 = t >= 186.7 && t < 202.53, cv1 = t >= 186.7 && t < 241.9;
  coastBeads.visible = (t >= 194.44 && t < 226.07) || (t >= 233.4 && t < 237); haifaRing.visible = haifaGlow.visible = (t >= 217.97 && t < 226.07);
  tipaC.root.visible = false;
  if (t >= 186.7 && t < 202.53) { tipaM.root.visible = true; tipaM.root.scale.setScalar(0.17); const run = ease(t, 194.6, 201.6), pu = run * 0.995, p = coastCurve.getPointAt(pu), p0 = coastCurve.getPointAt(0.0);
    const crouch = t < 194.4 ? 1 : 0; const cs = t < 194.4 ? 0.9 + 0.05 * Math.sin(t * 6) : 1; const pp = t < 194.6 ? p0 : p; const off = V(-9, 0, 0);
    tipaM.pose({ t, x: pp.x + off.x, y: pp.y - 5, z: pp.z, yaw: t < 194.5 ? -0.4 : -Math.PI / 2 + 0.0, walk: run > 0 && run < 1 ? 1 : 0, ph: run * coastCurve.getLength() / 30, hopH: 22, squash: t < 194.4 ? 0.18 + 0.05 * Math.sin(t * 7) : 0 });
    tipaM.face.set({ expr: t < 194.4 ? 'curious' : 'cheering', look: [0.4, 0.0], blink: blinkAt(t, 0.3) }); tipaM.root.position.set(pp.x + off.x, pp.y - 4, pp.z); }
  if (coastBeads.visible) { let prog, morph = 0;
    if (t < 202.53) { prog = ease(t, 194.6, 201.6); } else prog = 1;
    morph = t < 211.39 ? 0 : t < 214.5 ? ease(t, 211.5, 213.7) : 1; if (t >= 233.4) morph = 0;
    coastBeads.userData.set(u => { const a = coastCurve.getPointAt(u), b = bowCurve.getPointAt(u); return a.clone().lerp(b, morph); }, prog, t, 0); }
  if (haifaRing.visible) { const u = frac(t * 0.9); haifaRing.scale.setScalar(0.7 + 1.5 * u); haifaRing.material.opacity = 1 - u; haifaGlow.material.opacity = 0.35 + 0.3 * Math.sin(t * 6); }
}
function overlays(t, k) {
  // 15,000 on the sea
  if (t >= 29.05 && t < 33.6) { const u = ease(t, 31.6, 32.5); N15.visible = u > 0; N15.position.set(0, 40, 0); N15.scale.setScalar(Math.max(0.01, (0.55 + 0.45 * u) * (1 + 0.06 * Math.sin(t * 7)) * 1.5)); N15.position.y = 40; }
  if (t >= 194.44 && t < 202.53 && k === 'M') { const u = ease(t, 197.6, 198.4); N195.visible = u > 0; N195.position.set(0, 52, 0); N195.scale.setScalar(Math.max(0.01, (0.6 + 0.4 * u) * (1 + 0.05 * Math.sin(t * 6)) * 1.1)); }
  if (t >= 104.56 && t < 109.6 && k === 'M') { N3700.visible = true; N3700.position.set(-60, 58, 0); N3700.scale.setScalar(1.2 * (0.8 + 0.2 * ease(t, 104.6, 105.4))); CLK.visible = true; CLK.position.set(112, 22, 0); CLK.scale.setScalar(1.3); CLK.userData.set(5 * ease(t, 104.9, 109.2)); CLK.rotation.z = 0.04 * Math.sin(t * 8); CLK.children.forEach(c => { c.renderOrder = 58; }); }
  if (t >= 179.02 && t < 186.7 && k === 'S') { const u = ease(t, 183.0, 183.9), v = 1 - ease(t, 185.8, 186.7); MAPGHOST.material.opacity = 0; MAPGHOST.position.set(-86, 6, 0); }
}

/* ---------------------------------------------------------------- warm-up of the faces */
const ACTORS = [[rabbi, t => null], [boy, t => null]];
function faceStatesAt(t) {
  const s = segAt(t), k = s.scn, out = []; const P = k === 'B' ? pairBeach(t) : k === 'R' ? pairRoom(t) : k === 'C' ? pairCliff(t) : k === 'S' ? pairSun(t) : null;
  if (P) { out.push([rabbi, P.R.face], [boy, P.B.face]); }
  const tipaFace = (o, f) => out.push([o, f]);
  if (k === 'B') { if (t < 14) out.push([gullB, { expr: 'happy', blink: false }]); if (t < 14.54 || (t >= 33.6 && t < 37.9)) out.push([crabB, { expr: 'curious', blink: blinkAt(t, 0.9) }]);
    if (t >= 138.07 && t < 145.7) out.push([tipaG, { expr: t < 142 ? 'curious' : 'happy', look: [0.2, 0.2], talk: null, blink: blinkAt(t, 0.3) }]); }
  if (k === 'C') out.push([gullC, { expr: 'happy' }]);
  if (k === 'S') { if (t >= 241.9) { out.push([gullS, { expr: 'happy' }], [tipaS, { expr: 'happy', look: [0.3, 0], blink: blinkAt(t, 0.8) }]); } }
  if (k === 'H') { const ld = ease(t, 229.6, 232.4); out.push([gullH, { expr: ld > 0.96 ? 'happy' : 'curious', blink: blinkAt(t, 0.3) }]); }
  if (k === 'M') {
    if (t >= 14.54 && t < 29.05) out.push([tipaM, { expr: t < 22 ? 'happy' : t < 26 ? 'curious' : 'cheering', look: [-0.5, 0.1], talk: talkT(t, 18.8, 21.5, 0.3), blink: blinkAt(t, 0.3) }]);
    if (t >= 37.9 && t < 47.21) out.push([tipaM, { expr: 'cheering', look: [-0.4, 0.2], talk: talkT(t, 39, 46, 0.2), blink: false }]);
    if (t >= 47.21 && t < 54.58) out.push([gullM, { expr: 'happy' }]);
    if (t >= 70.5 && t < 77.43) { const shrug = t > 75.8; out.push([tipaB, { expr: shrug ? 'worried' : 'curious', look: [0.5, 0.0], blink: blinkAt(t, 0.2) }]); }
    if (t >= 186.7 && t < 202.53) out.push([tipaM, { expr: t < 194.4 ? 'curious' : 'cheering', look: [0.4, 0.0], blink: blinkAt(t, 0.3) }]); }
  return out;
}
async function warm() {
  const seen = new Set(), jobs = []; const times = Q.has('times') ? Q.get('times').split(',').map(Number) : null; const step = times ? 0 : 1 / 30;
  const consider = t => { for (const [o, f] of faceStatesAt(t)) { const key = (o.root.uuid) + JSON.stringify(f); if (seen.has(key)) continue; seen.add(key); jobs.push([o, f]); } };
  if (times) times.forEach(t0 => { for (let d = -0.3; d <= 0.3; d += 1 / 30) consider(t0 + d); }); else for (let k = 0; k <= DUR * 30; k++) consider(k / 30);
  for (const [o, f] of jobs) await o.face.set(f);
  return jobs.length;
}
window.__o = { rabbi, boy, cam, scene };
window.__dur = DUR; window.__HQ = HQ; window.__errors = []; window.__T0 = window.__T0 || 0;
window.__shots = SHOTS;
window.__caption = t => { const c = CAPS.find(c => t >= c.a && t < c.b); return c ? c.id : null; };
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
(async () => {
  try { window.__nwarm = Q.has('nowarm') ? 0 : await warm(); frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
