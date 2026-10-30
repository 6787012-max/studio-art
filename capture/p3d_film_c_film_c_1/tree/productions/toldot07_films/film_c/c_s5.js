/* film_c shot 4b: the kurkar cliff (188.0 - 230.9 s) and shot 5: calm recap (230.9 - 250.2 s). ASCII only. */
import { GULL, sky, THREE, sm, cl, frac, V, D2R, part, ell, tube, tubeAlong, lathe, toon, KT, W, GB, GK, R, B, GH, GX, scene, cam, ease, lin, lerp, lerp3, blinkAt, flags, POST, fs, pose, talkL, CAMS, skyTo, show, handPos } from './c_core.js';
import { beachTick } from './c_s1.js';
import { dune, gdH } from './c_beach.js';
const PI = Math.PI, TERR = W.TERR, M = W.M, G = W.G, GD = W.GD, rng = W.rng;

/* ---------------------------------------------------------------- cliff set */
const cliff = KT.makeKurkarCliff({ erosion: 0.3 }); GK.add(cliff.root);
const TOP = cliff.topY;
GK.add(KT.makeHills({ a0: 0.2 * PI, a1: 0.8 * PI, dists: [6500, 9000], base: '#7fb85a', haze: '#d4e9f2', h: 900, n: 7 }));
[[-2600, 1500, -5000, 3], [1800, 1800, -6000, 3.4], [3500, 1300, -4000, 2.6]].forEach(([x, y, z, s], i) => { const c = KT.makeCloud(i + 81, { s }); c.position.set(x, y, z); GK.add(c); });
const birdsK = KT.makeBirds({ n: 4, r: 600, y: 650, seed: 5 }); birdsK.position.set(0, 0, -500); GK.add(birdsK);
const splash = KT.makeSplash({ r: 45 }); GK.add(splash);
const block = cliff.root.children.find(c => c.isGroup && c.children.length === 1 && c.children[0].isMesh && c.position.x === 200);
// the 15-storey tower
const tower = (() => {
  const g = G(GK, [520, 0, 150]), fl = [];
  for (let i = 0; i < 15; i++) { const f = G(g, [0, i * 28, 0]); part(f, new THREE.BoxGeometry(150, 27, 120).translate(0, 14, 0), M(i % 2 ? '#d9d3c4' : '#cfc8b6', '#b0a898', 0), 2.6);
    for (let k = -2; k <= 2; k++) part(f, new THREE.BoxGeometry(18, 13, 2), M('#496a8a', '#496a8a', 0), 0, [k * 28, 15, 61]); fl.push(f); }
  g.userData.roof = part(g, new THREE.BoxGeometry(170, 8, 140).translate(0, 15 * 28 + 4, 0), M('#9a5a3a', '#7a4a3a', 0), 2.6);
  g.userData.fl = fl; return g;
})();
const label45 = W.makeLabel('45 m', 130, 50, 150); GK.add(label45); label45.position.set(520 - 130, TOP + 40, 150 + 70);
const bracket = G(GK, [520 - 95, 0, 150 + 70]); part(bracket, new THREE.BoxGeometry(5, TOP, 5).translate(0, TOP / 2, 0), M('#d9402e', '#d9402e', 0), 0);
[0, TOP].forEach(y => part(bracket, new THREE.BoxGeometry(34, 5, 5), M('#d9402e', '#d9402e', 0), 0, [0, y, 0]));
const pieces = [0, 1, 2, 3, 4, 5].map(i => { const m = part(GK, W.rockGeo(36 + (i % 3) * 10, 22, 30, i + 90, 0.18), M('#d4a068', '#b98a68', 0), 2.4); m.visible = false; return m; });
const pcl = W.makeParticles(40, '#e6c88a'); GK.add(pcl.mesh);

{ const turf = new THREE.Mesh(new THREE.PlaneGeometry(3600, 900, 1, 1).rotateX(-PI / 2), toon('#86bb5c', { tint: '#6f9f4c', hi: 0 })); turf.position.set(0, TOP + 2, 800); GK.add(turf);
  const r = rng(61); for (let i = 0; i < 70; i++) { const x = -1500 + r() * 3000, z = 380 + r() * 700; const t = KT.makeGrassTuft(i + 30, { col: i % 4 ? '#6aa84f' : '#9cae5c', h: 38 + r() * 20, n: 8 }); t.position.set(x, TOP + 2, z); GK.add(t); }
  for (let i = 0; i < 14; i++) { const x = -1400 + r() * 2800, z = 520 + r() * 600; if (Math.abs(x) < 200 && z < 700) continue; const b = KT.makeBush(i + 120, { col: '#6aa84f', s: 0.5 + r() * 0.3 }); b.position.set(x, TOP + 2, z); GK.add(b); }
  const wood = M('#9a6a3e', '#7a5a3a', 0); for (let i = 0; i <= 12; i++) part(GK, new THREE.BoxGeometry(12, 70, 12).translate(0, 35, 0), wood, 2.4, [-1100 + i * 100, TOP + 2, 470]);
  [28, 56].forEach(h => part(GK, new THREE.BoxGeometry(1200, 9, 7).translate(0, 0, 0), wood, 2, [-500, TOP + 2 + h, 470]));
}
const bFace = (T, st, off) => Object.assign({ expr: 'smile', blink: blinkAt(T, off || 0.6), look: [0, 0] }, st);
export function shot4b(lt, T) {
  show(GK, R, B); skyTo('day'); let cm; const e0 = 0.3;
  if (!flags.collect) { cliff.update(T); birdsK.userData.update(T); }
  tower.userData.roof.visible = false; tower.visible = label45.visible = bracket.visible = false; splash.visible = false; pieces.forEach(p => { p.visible = false; }); for (let i = 0; i < pcl.n; i++) pcl.hide(i); pcl.commit();
  let er = 0.3; if (lt >= 18.92) er = lerp(0.3, 0.62, ease(lt, 18.92, 22.2)); if (lt >= 22.2) er = lerp(0.62, 0.9, ease(lt, 22.2, 25.2)); if (lt >= 26.27) er = 0.9;
  cliff.setErosion(er);
  if (block) { block.visible = true; block.scale.setScalar(1); }
  const pr = (o, x, z, yaw, extra) => pose(o, Object.assign({ t: T, x, z, yaw, walk: 0 }, extra), 3 + z * 0.03);
  if (lt < 9.28) {                                             /* c1: the kurkar cliff above the sea, the pair far from its base */
    if (lt < 4.6) { cm = CAMS(lt, [{ t0: 0.4, t1: 4.6, p: [-1100, 150, -900], p1: [-800, 170, -600], l: [-100, 250, 300], l1: [-100, 230, 300], f: 36 }]); }
    else cm = CAMS(lt, [{ t0: 4.6, t1: 9.28, p: [-60, 190, -560], p1: [-160, 190, -470], l: [-300, 150, 100], f: 32 }]);
    pr(R, -330, 70, PI / 2 - 0.55, { headYaw: 0.2, arms: { r: { sz: 1.0, sx: 0.2, el: 0.3, point: true } } }); fs(R, { expr: 'explaining', talk: talkL(lt, 5, 9), blink: blinkAt(T, 0.1), look: [0.3, 0.2] });
    pr(B, -230, 60, PI / 2 - 0.5, { headTilt: -6 }); fs(B, bFace(T, { expr: 'surprised', look: [0.3, 0.4] }, 0.5));
  } else if (lt < 18.92) {                                     /* c2: 45 m is like a 15-storey building */
    tower.visible = label45.visible = bracket.visible = true; tower.userData.roof.visible = lt > 14.6;
    tower.userData.fl.forEach((f, i) => { const u = ease(lt, 10.4 + i * 0.28, 10.9 + i * 0.28); f.visible = u > 0.01; f.scale.y = Math.max(0.01, u); });
    label45.visible = lt > 15; label45.scale.setScalar(0.5 + 0.5 * ease(lt, 15, 15.6)); POST.push(() => label45.quaternion.copy(cam.quaternion));
    bracket.scale.y = Math.max(0.01, ease(lt, 10.4, 15));
    pr(R, 80, 40, PI / 2 - 0.9, { headTilt: -10, arms: { r: { sz: 1.3, sx: 0.1, el: 0.3, point: true } } }); fs(R, { expr: 'explaining', talk: talkL(lt, 9.5, 14), blink: blinkAt(T, 0.1), look: [0.4, 0.5] });
    pr(B, 190, 50, PI / 2 - 0.5, { headTilt: -12 }); fs(B, bFace(T, { expr: lt > 15 ? 'surprised' : 'smile', look: [0.5, 0.5] }, 0.5));
    cm = lt < 14.2 ? CAMS(lt, [{ t0: 9.28, t1: 14.2, p: [-60, 90, -520], p1: [60, 100, -420], l: [340, 190, 250], l1: [330, 230, 250], f: 36 }])
      : CAMS(lt, [{ t0: 14.2, t1: 18.92, p: [1150, 240, -150], p1: [1000, 250, -100], l: [420, 215, 200], f: 36 }]);
  } else if (lt < 26.27) {                                     /* c3: waves hit the foot of the cliff, a block falls (nobody near it) */
    R.root.visible = B.root.visible = false;
    if (!flags.collect) { splash.visible = false; splash.position.set(150 + 90 * Math.sin(T * 0.3), 6, 60); splash.visible = false; }
    cm = lt < 22.2 ? CAMS(lt, [{ t0: 18.92, t1: 22.2, p: [1000, 230, -520], p1: [880, 220, -420], l: [260, 220, 300], f: 38 }])
      : CAMS(lt, [{ t0: 22.2, t1: 26.27, p: [820, 260, -420], p1: [640, 210, -300], l: [220, 190, 160], l1: [210, 120, 80], f: 38 }]);
  } else if (lt < 33.62) {                                     /* c4: the block crumbles in the waves and becomes sand again */
    R.root.visible = B.root.visible = false; show(...GX.slice(0, 3));
    const k = lt - 26.27, cr = ease(k, 0.8, 4.2), sub = ease(k, 1.5, 6.0);
    if (block) { block.scale.setScalar(Math.max(0.01, 1 - 0.9 * sub)); block.position.y = 50 - 18 * sub; }
    pieces.forEach((p, i) => { p.visible = cr > 0.02 && sub < 0.95; const a = i * 1.1 + 0.4, d = 40 + 90 * cr; p.position.set(200 + Math.cos(a) * d * 1.4, 18, 40 - 20 * sub + Math.sin(a) * d * 0.6 - 60 * sub * (i % 2)); p.scale.setScalar(Math.max(0.01, (0.9 - 0.8 * sub)));
      p.rotation.set(cr * (i + 1) * 0.6, a, cr * 0.4); });
    for (let i = 0; i < pcl.n; i++) { const u = frac(k * 0.5 + i * 0.1618), a = i * 2.3; if (sub < 0.05) { pcl.hide(i); continue; } pcl.set(i, 200 + Math.cos(a) * 160 * u, 8 + 50 * Math.sin(Math.PI * u), 40 - 150 * u + Math.sin(a) * 70, 3.5 * (1 - u)); } pcl.commit();
    GX.slice(0, 3).forEach((g, i) => { const pop = ease(k, 0.9 + i * 0.3, 1.4 + i * 0.3), jump = Math.abs(Math.sin((k - 1.5) * 6 + i * 2)) * 26 * pop;
      pose(g, { t: T, x: 120 + i * 70, z: -20 + (i % 2) * 30, y: 6 + jump, yaw: -PI / 2 - 0.5 + 0.3 * i, walk: 0, shadow: true }); g.root.scale.setScalar(0.001 + 0.3 * pop);
      fs(g, { expr: 'cheering', blink: false, look: [0, 0] }); });
    cm = CAMS(lt, [{ t0: 26.27, t1: 33.62, p: [700, 190, -480], p1: [560, 160, -400], l: [200, 150, 120], l1: [190, 80, 60], f: 38 }]);
  } else {                                                     /* c5: stay away from the edge, do not sit under the cliff */
    const k = lt - 33.62, edge = 360, bz = lerp(560, edge + 12, ease(k, 0.3, 3.0)), hold = ease(k, 3.4, 4.2), away = ease(k, 5.4, 6.4);
    const rz = lerp(bz + 140, bz + 60, hold), step = lin(k, 0.3, 3.0) * 210;
    pose(B, { t: T, x: 0, z: bz, yaw: PI / 2 - 0.6, walk: k > 0.3 && k < 3.0 ? 1 : 0, ph: step / B.cycle, headTilt: 4 * Math.sin(T * 0.8), headYaw: 0, arms: hold > 0.5 ? { l: { sz: 0.2, sx: 0.1, el: 0.4 } } : { r: { sz: 1.3 * ease(k, 2.2, 2.7), sx: 0.1, el: 0.2, point: true } } }, TOP + 2);
    fs(B, bFace(T, { expr: k < 3.4 ? 'laugh' : (k > 6.6 ? 'proud' : 'surprised'), look: [0.2, 0.1] }, 0.5));
    pose(R, { t: T, x: 20, z: rz + (k < 3 ? 0 : 0), yaw: PI / 2 + 0.2, walk: k > 0.3 && k < 3.0 ? 1 : 0, ph: step / R.cycle + 0.2, headTilt: k > 6.6 ? 6 * Math.sin(k * 5) * 0 : 0,
      arms: { r: { sz: hold > 0.1 && away < 0.5 ? 1.45 : 0.3 + 0.9 * away, sx: away > 0.5 ? -0.6 : 0.05, el: 0.2, point: away > 0.5 } } }, TOP + 2);
    fs(R, { expr: 'explaining', talk: talkL(lt, 36.5, 41.5), blink: blinkAt(T, 0.1), look: [-0.3, 0] });
    cm = CAMS(lt, [{ t0: 33.62, t1: 42.5, p: [800, TOP + 150, 560], p1: [700, TOP + 140, 520], l: [0, TOP + 115, 440], l1: [0, TOP + 115, 430], f: 33 }]);
  }
  return cm;
}

/* ---------------------------------------------------------------- recap: golden dunes, centre calm and darker */
const vig = (() => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 144; const c = cv.getContext('2d'), g = c.createRadialGradient(128, 72, 6, 128, 72, 120);
  g.addColorStop(0, 'rgba(40,24,10,0.34)'); g.addColorStop(0.55, 'rgba(40,24,10,0.22)'); g.addColorStop(1, 'rgba(40,24,10,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 144);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })); m.position.set(0, 0, -50); m.renderOrder = 100; m.visible = false; cam.add(m); return m; })();
const rprops = (() => { const g = G(GB), r = rng(44);
  for (let i = 0; i < 9; i++) { const x = GD.x - 760 + r() * 200, z = GD.z - 420 + r() * 200; const t = KT.makeGrassTuft(i + 300, { col: '#8fb55a', h: 45 + r() * 25, n: 10 }); t.position.set(x, gdH(x, z, 1), z); g.add(t); }
  for (let i = 0; i < 8; i++) { const x = GD.x - 700 + r() * 500, z = GD.z - 100 + r() * 400; const sh = KT.makeShell(i % 2 ? 'fan' : 'spiral', i + 9); sh.position.set(x, gdH(x, z, 1) + 2, z); sh.scale.setScalar(1.2); g.add(sh); }
  g.visible = false; return g; })();
const fgb = KT.makeFgBlur('grass', { w: 380, h: 240, col: '#7e9a4a', blur: 7 }); fgb.visible = false; scene.add(fgb);
export function shot5(lt, T) {
  show(GB, R, B, GULL); skyTo('gold'); beachTick(T, { blow1: 0, blow2: 0.5, dune: 1 }); vig.visible = true; rprops.visible = true; fgb.visible = true;
  const U = sky.material.uniforms; U.uHasSun.value = 1; U.uSun.value.set(1, 0.93, 0.74); U.uDir.value.set(0.93, 0.1, -0.3).normalize();
  const px = GD.x + 140, pz = GD.z + 20, pz2 = GD.z + 130;
  pose(R, { t: T, x: px, z: pz, yaw: 2.5, walk: 0, headYaw: 0.3, headTilt: 3 * Math.sin(T * 0.6) }, gdH(px, pz, 1)); fs(R, { expr: 'smile', blink: blinkAt(T, 0.1), look: [-0.4, 0] });
  pose(B, { t: T, x: px + 20, z: pz2, yaw: 2.65, walk: 0, headYaw: 0.3 }, gdH(px + 20, pz2, 1)); fs(B, bFace(T, { look: [-0.4, 0.1] }, 0.4));
  const a = T * 0.45; pose(GULL, { t: T, x: GD.x + 300 + 420 * Math.cos(a), y: 430 + 40 * Math.sin(a * 2), z: GD.z - 250 + 300 * Math.sin(a), yaw: -Math.atan2(Math.cos(a), -Math.sin(a)), fly: true, flap: 1, shadow: false }); fs(GULL, { expr: 'happy' });
  const c = CAMS(lt, [{ t0: 0, t1: 19.3, p: [GD.x - 950, 330, GD.z - 260], p1: [GD.x - 880, 335, GD.z - 240], l: [GD.x + 150, 215, GD.z - 360], l1: [GD.x + 150, 215, GD.z - 340], f: 33 }]);
  POST.push(() => { fgb.position.copy(cam.position).add(V(-120, -66, -260).applyQuaternion(cam.quaternion)); fgb.quaternion.copy(cam.quaternion); });
  return c;
}
export const recapOff = () => { vig.visible = false; rprops.visible = false; fgb.visible = false; };
