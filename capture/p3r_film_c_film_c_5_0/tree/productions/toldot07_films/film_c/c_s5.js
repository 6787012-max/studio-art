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
// the 15-storey tower (windows on both long faces, warm colours)
const tower = (() => {
  const g = G(GK, [560, 0, 160]), fl = [];
  for (let i = 0; i < 15; i++) { const f = G(g, [0, i * 28, 0]); part(f, new THREE.BoxGeometry(150, 27, 120).translate(0, 14, 0), M(i % 2 ? '#f2e7cb' : '#e6d3a8', '#b0a898', 0), 2.6);
    for (let k = -2; k <= 2; k++) for (const zz of [-61, 61]) part(f, new THREE.BoxGeometry(18, 14, 2), M('#3f6f9a', '#3f6f9a', 0), 0, [k * 28, 15, zz]); fl.push(f); }
  g.userData.roof = part(g, new THREE.BoxGeometry(170, 8, 140).translate(0, 15 * 28 + 4, 0), M('#b5653d', '#7a4a3a', 0), 2.6);
  g.userData.fl = fl; return g;
})();
const label45 = W.makeLabel('45 m', 130, 50, 150); GK.add(label45); label45.position.set(560 - 150, TOP + 60, 150 - 120);
const bracket = G(GK, [560 - 95, 0, 150 - 90]); part(bracket, new THREE.BoxGeometry(5, TOP, 5).translate(0, TOP / 2, 0), M('#d9402e', '#d9402e', 0), 0);
[0, TOP].forEach(y => part(bracket, new THREE.BoxGeometry(34, 5, 5), M('#d9402e', '#d9402e', 0), 0, [0, y, 0]));
const face0 = x => 300 + 26 * Math.sin(x * 0.005) + 12 * Math.sin(x * 0.013) + 34;
const notch2 = (() => { const geo = new THREE.PlaneGeometry(640, 64, 64, 1), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 200, y = p.getY(i), k = Math.sqrt(Math.max(0, 1 - Math.pow(p.getX(i) / 320, 2))); p.setXYZ(i, x, 30 + y * k * 1.0, face0(x) - 6); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: W.col('#4a2a1c'), side: THREE.DoubleSide })); m.frustumCulled = false;
  const geo2 = geo.clone(); const m2 = new THREE.Mesh(geo2, new THREE.MeshBasicMaterial({ color: W.col('#7a4a30'), side: THREE.DoubleSide })); m2.frustumCulled = false;
  const g = G(GK); g.add(m2, m); g.userData = { m, m2, set(e) { const sy = 0.55 + 1.1 * e; m.scale.y = sy; m.position.y = 30 - 30 * sy; m2.scale.y = sy * 1.35; m2.position.y = 30 - 30 * sy * 1.35; m2.position.z = -3; } }; return g; })();
const swash = new THREE.Mesh(new THREE.PlaneGeometry(900, 80).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: W.col('#cdeefc'), transparent: true, opacity: 0.8, depthWrite: false })); swash.position.set(200, 4, 300); GK.add(swash);
const spray = W.makeParticles(60, '#ffffff'); GK.add(spray.mesh);
const topDress = cliff.root.children.filter(c => c.isGroup && Math.abs(c.position.y - TOP) < 1 && c.position.z >= 400);
const pieces = [0, 1, 2, 3, 4, 5].map(i => { const m = part(GK, W.rockGeo(36 + (i % 3) * 10, 22, 30, i + 90, 0.18), M('#d4a068', '#b98a68', 0), 2.4); m.visible = false; return m; });
const pcl = W.makeParticles(40, '#e6c88a'); GK.add(pcl.mesh);

{ const turf = new THREE.Mesh(new THREE.PlaneGeometry(3600, 920, 1, 1).rotateX(-PI / 2), toon('#86bb5c', { tint: '#6f9f4c', hi: 0 })); turf.position.set(0, TOP + 9, 770); GK.add(turf);
  const r = rng(61); for (let i = 0; i < 70; i++) { const x = -1500 + r() * 3000, z = 380 + r() * 700; const t = KT.makeGrassTuft(i + 30, { col: i % 4 ? '#6aa84f' : '#9cae5c', h: 38 + r() * 20, n: 8 }); t.position.set(x, TOP + 9, z); GK.add(t); }
  for (let i = 0; i < 14; i++) { const x = -1400 + r() * 2800, z = 520 + r() * 600; if (Math.abs(x) < 200 && z < 700) continue; const b = KT.makeBush(i + 120, { col: '#6aa84f', s: 0.5 + r() * 0.3 }); b.position.set(x, TOP + 9, z); GK.add(b); }
  const wood = M('#9a6a3e', '#7a5a3a', 0), cap = M('#e0702e', '#a04a2a', 0); for (let i = 0; i <= 12; i++) { part(GK, new THREE.BoxGeometry(12, 46, 12).translate(0, 23, 0), wood, 2.4, [-1100 + i * 200, TOP + 9, 520]); part(GK, ell(9, 7, 9, 8, 6), cap, 0, [-1100 + i * 200, TOP + 57, 520]); }
}
const bFace = (T, st, off) => Object.assign({ expr: 'smile', blink: blinkAt(T, off || 0.6), look: [0, 0] }, st);
export function shot4b(lt, T) {
  show(GK, R, B); skyTo('day'); let cm; topDress.forEach(v => { v.visible = lt < 33.62; });
  if (!flags.collect) { cliff.update(T); birdsK.userData.update(T); }
  tower.userData.roof.visible = false; tower.visible = label45.visible = bracket.visible = false; splash.visible = false; pieces.forEach(p => { p.visible = false; }); for (let i = 0; i < pcl.n; i++) pcl.hide(i); pcl.commit();
  for (let i = 0; i < spray.n; i++) spray.hide(i); spray.commit(); swash.visible = false;
  let er = 0.3; if (lt >= 18.92) er = lerp(0.3, 0.55, ease(lt, 18.92, 21.2)); if (lt >= 21.2) er = lerp(0.55, 0.9, ease(lt, 21.2, 24.6)); if (lt >= 24.6) er = 0.9;
  cliff.setErosion(er); notch2.userData.set(er); notch2.visible = true;
  { const u = cl((er - 0.55) / 0.35, 0, 1), fall = u * u; if (block) { block.visible = true; block.scale.setScalar(1); block.position.set(200, (TOP - 60) * (1 - fall) + 50 * fall, 352 - 312 * u); } }
  const pr = (o, x, z, yaw, extra) => pose(o, Object.assign({ t: T, x, z, yaw, walk: 0 }, extra), 3 + z * 0.03);
  if (lt < 9.28) {                                             /* c1: the kurkar cliff above the sea, the pair far from its base (clear sand gap) */
    if (lt < 4.6) { cm = CAMS(lt, [{ t0: 0.4, t1: 4.6, p: [-1000, 330, -950], p1: [-760, 320, -820], l: [-120, 190, 200], l1: [-120, 180, 200], f: 36 }]); }
    else cm = CAMS(lt, [{ t0: 4.6, t1: 9.28, p: [-200, 210, -820], p1: [-250, 210, -760], l: [-270, 165, 30], f: 32 }]);
    pr(R, -130, 20, PI / 2 - 0.5, { headYaw: 0.2, arms: { r: { sz: 1.0, sx: 0.2, el: 0.3, point: true } } }); fs(R, { expr: 'explaining', talk: talkL(lt, 5, 9), blink: blinkAt(T, 0.1), look: [0.3, 0.2] });
    pr(B, -420, 10, PI / 2 - 0.5, { headTilt: -4 }); fs(B, bFace(T, { expr: 'surprised', look: [0.3, 0.4] }, 0.5));
  } else if (lt < 18.92) {                                     /* c2: 45 m is like a 15-storey building */
    tower.visible = label45.visible = bracket.visible = true; tower.userData.roof.visible = lt > 14.6;
    tower.userData.fl.forEach((f, i) => { const u = ease(lt, 10.4 + i * 0.28, 10.9 + i * 0.28); f.visible = u > 0.01; f.scale.y = Math.max(0.01, u); });
    label45.visible = lt > 12.4; label45.scale.setScalar(0.5 + 0.5 * ease(lt, 12.4, 13.0)); POST.push(() => label45.quaternion.copy(cam.quaternion));
    bracket.scale.y = Math.max(0.01, ease(lt, 10.4, 15));
    pr(R, 250, 10, PI / 2 - 0.2, { headTilt: -4, arms: { r: { sz: 1.3, sx: 0.1, el: 0.3, point: true } } }); fs(R, { expr: 'explaining', talk: talkL(lt, 9.5, 14), blink: blinkAt(T, 0.1), look: [0.4, 0.5] });
    pr(B, -10, 10, PI / 2 - 0.5, { headTilt: -6 }); fs(B, bFace(T, { expr: lt > 15 ? 'surprised' : 'smile', look: [0.5, 0.5] }, 0.5));
    cm = lt < 14.2 ? CAMS(lt, [{ t0: 9.28, t1: 14.2, p: [-260, 190, -860], p1: [-160, 195, -820], l: [310, 190, 150], l1: [320, 200, 150], f: 38 }])
      : CAMS(lt, [{ t0: 14.2, t1: 18.92, p: [-60, 215, -980], p1: [60, 220, -940], l: [330, 205, 140], f: 40 }]);
  } else if (lt < 26.27) {                                     /* c3: waves hit the foot of the cliff, the notch deepens, a block falls (nobody near it) */
    R.root.visible = B.root.visible = false;
    const wv = frac(T / 2.4), wu = Math.sin(Math.PI * Math.min(1, wv * 1.25));
    swash.visible = true; swash.position.set(200 + 40 * Math.sin(T * 0.4), 4, face0(200) - 6 - 30 * (1 - wu)); swash.scale.set(1, 0.4 + 1.4 * wu, 1);
    for (let i = 0; i < spray.n; i++) { const hit = wv > 0.28 && wv < 0.9 ? 1 : 0; if (!hit) { spray.hide(i); continue; } const h1 = frac(Math.sin(i * 12.9898) * 43758.5453), h2 = frac(Math.sin(i * 78.233) * 12345.678), uu = (wv - 0.28) / 0.62;
      spray.set(i, 200 + (h1 - 0.5) * 520, 12 + 150 * 4 * uu * (1 - uu) * (0.3 + h2), face0(200 + (h1 - 0.5) * 520) - 14 - 40 * uu * h2, (6 + 7 * h2) * (1 - 0.5 * uu)); } spray.commit();
    if (!flags.collect) { const lu = (lt - 24.5) / 1.7; if (lu > 0 && lu < 1) { splash.position.set(200, 8, 40); splash.scale.setScalar(0.8); splash.userData.update(lu); } }
    cm = lt < 21.2 ? CAMS(lt, [{ t0: 18.92, t1: 21.2, p: [760, 170, -130], p1: [660, 160, -70], l: [200, 70, 340], f: 38 }])
      : CAMS(lt, [{ t0: 21.2, t1: 26.27, p: [820, 280, -420], p1: [700, 240, -330], l: [210, 230, 300], l1: [200, 90, 120], f: 40 }]);
  } else if (lt < 33.62) {                                     /* c4: the block crumbles in the waves and becomes sand again */
    R.root.visible = B.root.visible = false; show(...GX.slice(0, 3));
    notch2.userData.set(0.9); swash.visible = true; { const wv = frac(T / 2.0); swash.position.set(200, 4, 120 + 120 * Math.sin(Math.PI * wv)); swash.scale.set(1, 1.2, 1); }
    const k = lt - 26.27, cr = ease(k, 0.8, 4.2), sub = ease(k, 1.5, 6.0);
    if (block) { block.scale.setScalar(Math.max(0.01, 1 - 0.9 * sub)); block.position.y = 50 - 18 * sub; }
    pieces.forEach((p, i) => { p.visible = cr > 0.02 && sub < 0.95; const a = i * 1.1 + 0.4, d = 40 + 90 * cr; p.position.set(200 + Math.cos(a) * d * 1.4, 18, 40 - 20 * sub + Math.sin(a) * d * 0.6 - 60 * sub * (i % 2)); p.scale.setScalar(Math.max(0.01, (0.9 - 0.8 * sub)));
      p.rotation.set(cr * (i + 1) * 0.6, a, cr * 0.4); });
    for (let i = 0; i < pcl.n; i++) { const u = frac(k * 0.5 + i * 0.1618), a = i * 2.3; if (sub < 0.05) { pcl.hide(i); continue; } pcl.set(i, 200 + Math.cos(a) * 160 * u, 8 + 50 * Math.sin(Math.PI * u), 40 - 150 * u + Math.sin(a) * 70, 3.5 * (1 - u)); } pcl.commit();
    GX.slice(0, 3).forEach((g, i) => { const pop = ease(k, 0.9 + i * 0.3, 1.4 + i * 0.3), jump = Math.abs(Math.sin((k - 1.5) * 6 + i * 2)) * 26 * pop;
      pose(g, { t: T, x: 120 + i * 70, z: -20 + (i % 2) * 30, y: 6 + jump, yaw: -PI / 2 - 0.5 + 0.3 * i, walk: 0, shadow: true }); g.root.scale.setScalar(0.001 + 0.3 * pop);
      fs(g, { expr: 'cheering', blink: false, look: [0, 0] }); });
    cm = CAMS(lt, [{ t0: 26.27, t1: 33.62, p: [700, 190, -480], p1: [560, 160, -400], l: [200, 150, 120], l1: [190, 80, 60], f: 38 }]);
  } else {                                                     /* c5: OTS behind the rabbi: his arm holds the boy back from the edge, then points away */
    notch2.visible = false;
    const k = lt - 33.62, zE = 330, step = ease(k, 0.2, 3.0);
    const bz = k < 3.2 ? lerp(zE + 150, zE + 44, step) : lerp(zE + 44, zE + 132, ease(k, 3.7, 5.0));
    const hold = ease(k, 3.0, 3.8), away = ease(k, 6.0, 6.9);
    const rz = k < 3.4 ? lerp(zE + 380, zE + 330, step) : lerp(zE + 330, zE + 180, ease(k, 3.4, 4.2));
    const bWalk = k > 0.2 && k < 3.0;
    pose(B, { t: T, x: lerp(-190, -170, ease(k, 3.7, 5.0)), z: bz, yaw: PI / 2 + 0.3 + lerp(0, 1.61, ease(k, 3.2, 3.9)), walk: bWalk ? 1 : 0, ph: step * 120 / B.cycle, lean: k > 3.0 && k < 3.8 ? -6 : 0, headYaw: k > 3.2 ? 0.0 : 0.3, headTilt: 3 * Math.sin(T * 0.8) }, TOP + 9);
    fs(B, bFace(T, { expr: k < 3.0 ? 'laugh' : (k > 6.4 ? 'proud' : 'worried'), look: [0.3, 0.1] }, 0.5));
    pose(R, { t: T, x: -72, z: rz, yaw: PI / 2 + lerp(0.1, 1.2, hold) - 0.5 * away, walk: (k < 3.4 && k > 0.4) || (k > 3.4 && k < 4.2) ? 1 : 0, ph: (k < 3.4 ? step * 50 : 50 + ease(k, 3.4, 4.2) * 108) / R.cycle, headYaw: 0.2 * Math.sin(T * 0.6),
      arms: { r: { sz: k < 3.0 ? 0.3 : (away > 0.5 ? 0.3 + 0.9 * away : 1.4 * hold + 0.1), sx: away > 0.5 ? -0.6 : -0.15 * hold, el: 0.2, point: away > 0.5 } } }, TOP + 9);
    fs(R, { expr: 'explaining', talk: talkL(lt, 36.5, 41.5), blink: blinkAt(T, 0.1), look: [-0.3, 0] });
    cm = CAMS(lt, [{ t0: 33.62, t1: 42.5, p: [-560, TOP + 200, zE + 1050], p1: [-500, TOP + 190, zE + 990], l: [-90, TOP + 110, zE + 160], l1: [-80, TOP + 110, zE + 160], f: 33 }]);
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
  show(GB, R, B, GULL); skyTo('gold'); beachTick(T, { blow1: 0, blow2: 0.5, dune: 1 }); vig.visible = true; rprops.visible = true; fgb.visible = false;
  const U = sky.material.uniforms; U.uHasSun.value = 1; U.uSun.value.set(1.0, 0.80, 0.30); U.uDir.value.set(0.93, 0.12, -0.34).normalize();
  const P0 = [GD.x - 950, 300, GD.z - 260], F = [0.996, -0.09], RT = [0.09, 0.996];
  const at = (d, lat) => [P0[0] + F[0] * d + RT[0] * lat, P0[2] + F[1] * d + RT[1] * lat];
  const [rx, rz] = at(800, 120), [bx, bz] = at(790, 290), SIT = 55;
  const breathe = 1.2 * Math.sin(T * 1.7);
  const look = Math.sin(T * 0.45), turnR = 0.35 * look, turnB = 0.35 * Math.sin(T * 0.45 + 1.4);
  const pointB = ease(lt, 5.0, 6.0) * (1 - ease(lt, 10.5, 11.5)) + ease(lt, 14.5, 15.3) * (1 - ease(lt, 17.5, 18.4));
  R.root.scale.setScalar(0.6); B.root.scale.setScalar(0.6);
  pose(R, { t: T, x: rx, z: rz, yaw: 2.3, walk: 0, headYaw: turnR, headTilt: 3 * Math.sin(T * 0.6), bob: breathe * 0.5 }, gdH(rx, rz, 1) - SIT); fs(R, { expr: lt > 8 && lt < 12 ? 'explaining' : 'smile', talk: talkL(lt, 8, 12), blink: blinkAt(T, 0.1), look: [-0.4 + 0.3 * look, 0] });
  pose(B, { t: T, x: bx, z: bz, yaw: 2.2, walk: 0, headYaw: turnB, bob: breathe * 0.5, arms: { r: { sz: 0.2 + 1.2 * pointB, sx: 0.2, el: 0.3, point: pointB > 0.5 } } }, gdH(bx, bz, 1) - SIT); fs(B, bFace(T, { expr: pointB > 0.5 ? 'surprised' : 'smile', look: [-0.4 + 0.3 * Math.sin(T * 0.45 + 1.4), 0.1] }, 0.4));
  const a = T * 0.45; pose(GULL, { t: T, x: GD.x + 300 + 420 * Math.cos(a), y: 430 + 40 * Math.sin(a * 2), z: GD.z - 250 + 300 * Math.sin(a), yaw: -Math.atan2(Math.cos(a), -Math.sin(a)), fly: true, flap: 1, shadow: false }); fs(GULL, { expr: 'happy' });
  const c = CAMS(lt, [{ t0: 0, t1: 19.3, p: P0, p1: [GD.x - 840, 306, GD.z - 235], l: [GD.x + 150, 360, GD.z - 360], l1: [GD.x + 150, 365, GD.z - 340], f: 33 }]);
  POST.push(() => { fgb.position.copy(cam.position).add(V(-120, -66, -260).applyQuaternion(cam.quaternion)); fgb.quaternion.copy(cam.quaternion); });
  return c;
}
export const recapOff = () => { vig.visible = false; rprops.visible = false; fgb.visible = false; };
