/* film_c shot 3: the zig-zag of the waves, the wind and the dunes (84.8 - 141.3 s). ASCII only. */
import { THREE, sm, cl, frac, V, D2R, part, ell, tube, tubeAlong, lathe, toon, KT, W, GB, GZ, R, B, GH, GX, GUST, scene, sky, cam, ease, lin, lerp, lerp3, blinkAt, flags, POST, fs, pose, talkL, talkG, CAMS, skyTo, show, handPos } from './c_core.js';
import { beachTick } from './c_s1.js';
import { sea, mound, dune, gdH, blow2, rip2 } from './c_beach.js';
const PI = Math.PI, TERR = W.TERR, M = W.M, G = W.G, GD = W.GD;

/* ---------------------------------------------------------------- the top-down beach diorama */
const zsea = KT.makeSea({ A: 4, L: 300, palette: 'summer', pos: [0, -2, -2000], shore: [-40, 400] }); GZ.add(zsea.mesh);
const zfoam = [0, 6000, 12000].map(x => { const f = KT.makeFoamLine({ z0: -10, width: 90, len: 6400 }); f.mesh.position.x = x; GZ.add(f.mesh); return f; });
{
  const g = new THREE.PlaneGeometry(26000, 1900, 200, 40).rotateX(-PI / 2), p = g.attributes.position, cols = new Float32Array(p.count * 3), sand = W.col('#f0d89c'), sandD = W.col('#e6c88a'), wet = W.col('#cdb27a');
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 6000, z = p.getZ(i) + 650; let y; if (z <= -20) y = -24; else if (z < 70) y = -24 + 28 * sm((z + 20) / 90); else y = 4 + Math.min((z - 70) * 0.01, 8);
    p.setXYZ(i, x, y, z); const c = sand.clone().lerp(sandD, 0.5 + 0.5 * Math.sin(x * 0.01 + z * 0.02)); if (z < 110) c.lerp(wet, cl(1 - z / 110, 0, 1) * 0.9); cols[3 * i] = c.r; cols[3 * i + 1] = c.g; cols[3 * i + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals(); GZ.add(new THREE.Mesh(g, toon('#ffffff', { tint: '#d8c4b0', hi: 0, vc: true })));
  const rip = W.makeRipples({ x0: -600, x1: 8200, z0: 150, z1: 900, n: 150, h: (x, z) => 4 + Math.min((z - 70) * 0.01, 8), seed: 21 }); GZ.add(rip);
  const r = W.rng(5); for (let i = 0; i < 70; i++) { const x = -500 + r() * 8500, z = 160 + r() * 800; const o = i % 3 ? KT.makeShell(i % 2 ? 'fan' : 'spiral', i + 5) : KT.makeStone(i + 9, 0.6 + r()); o.position.set(x, 8, z); GZ.add(o); }
}
const swash = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1).rotateX(-PI / 2).translate(0, 0, 0.5), new THREE.MeshBasicMaterial({ color: W.col('#c9ecff'), transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); GZ.add(swash);
const arrowSw = G(GZ), arrowBw = G(GZ);
part(arrowSw, W.makeArrowGeo(1, 1).scale(1, 1, 1), M('#ffffff', '#a8c8e8', 0), 0).visible = false;
const mkArrow = (len, w, col) => { const g = G(GZ); part(g, W.makeArrowGeo(len, w), M(col, '#7aa8d0', 0), 2.4, [0, 6, 0]); return g; };
const STEP = 110, X0 = -150, Z0 = 40, Z1 = 270;
function curveArrow(pts, rad) {
  const cv = new THREE.CatmullRomCurve3(pts.map(p => V(...p))), geo = new THREE.TubeGeometry(cv, 40, rad, 10, false); geo.scale(1, 0.35, 1);
  const g = G(GZ), m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: W.col('#6fcbf5') })); g.add(m);
  const o = part(g, geo.clone(), M('#6fcbf5', '#6fcbf5', 0), 0);
  const hd = new THREE.Mesh(new THREE.ConeGeometry(rad * 2.1, rad * 3.6, 12), new THREE.MeshBasicMaterial({ color: W.col('#6fcbf5') })); hd.scale.y = 1; g.add(hd);
  const foam = []; for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(rad * 0.7, 10, 8), new THREE.MeshBasicMaterial({ color: W.col('#ffffff') })); g.add(f); foam.push(f); }
  o.visible = false;
  g.userData.set = u => { geo.setDrawRange(0, Math.floor(geo.index.count * u / 6) * 6); const uu = Math.min(0.999, Math.max(0.001, u)), p = cv.getPointAt(uu), t = cv.getTangentAt(uu);
    hd.position.copy(p); hd.quaternion.setFromUnitVectors(V(0, 1, 0), t.clone().setY(0).normalize()); hd.rotation.x += 0; hd.visible = u > 0.04;
    foam.forEach((f, i) => { const a = i / 6 * Math.PI * 2 + 1, q = cv.getPointAt(Math.max(0.001, uu - 0.04 * (i % 3))); f.position.set(q.x + Math.cos(a) * rad * 1.6, q.y + 3, q.z + Math.sin(a) * rad * 1.6); f.visible = u > 0.04; }); };
  return g;
}
const arSw = curveArrow([[X0 - 40, 11, Z0 - 25], [X0 + 10, 11, Z0 + 70], [X0 + 70, 11, Z0 + 150], [X0 + STEP + 30, 11, Z1 + 30]], 15), arBw = curveArrow([[X0 + STEP + 70, 11, Z1 + 40], [X0 + STEP + 70, 11, Z1 - 80], [X0 + STEP + 70, 11, Z0 + 50], [X0 + STEP + 70, 11, Z0 - 30]], 15); arSw.visible = arBw.visible = false;
// trail
const TR_MAX = 80, trGeo = new THREE.BufferGeometry(); trGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TR_MAX * 2 * 3), 3));
{ const I = []; for (let i = 0; i < TR_MAX - 1; i++) { const a = i * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } trGeo.setIndex(I); }
const trail = new THREE.Mesh(trGeo, new THREE.MeshBasicMaterial({ color: W.col('#b8742e'), side: THREE.DoubleSide })); trail.frustumCulled = false; GZ.add(trail);
const dots = W.makeParticles(420, '#8a4f1e'); GZ.add(dots.mesh);
const counter = W.makeLabel('0', 330, 112, 150); counter.position.set(300, 215, -900); counter.visible = false; scene.add(cam); cam.add(counter);
const bottle = KT.makeBottle(); GB.add(bottle);

/* wave-cycle schedule (shot-local seconds): {t0, swash duration, hold, back duration} */
const CY = [{ t0: 9.4, s: 5.0, h: 2.9, b: 5.0 }, { t0: 24.2, s: 1.1, h: 0.5, b: 1.1 }, { t0: 27.0, s: 1.1, h: 0.5, b: 1.1 }, { t0: 29.8, s: 1.1, h: 0.5, b: 1.1 }];
for (let t = 33.0, i = 0; t < 40.2; t += 0.46, i++) CY.push({ t0: t, s: 0.2, h: 0.04, b: 0.2 });
function cyc(lt) {                      /* grain state at shot-local time lt */
  let n = 0; for (let i = 0; i < CY.length; i++) if (lt >= CY[i].t0) n = i + 1;
  if (n === 0) return { x: X0, z: Z0, ph: 'rest', u: 0, n: 0, done: 0 };
  const i = n - 1, c = CY[i], x0 = X0 + STEP * i, k = lt - c.t0;
  if (k < c.s) { const u = sm(k / c.s); return { x: x0 + STEP * u, z: Z0 + (Z1 - Z0) * u, ph: 'sw', u, n: i, done: i + u * 0.5 }; }
  if (k < c.s + c.h) return { x: x0 + STEP, z: Z1, ph: 'hold', u: 1, n: i, done: i + 0.5 };
  const u = sm(cl((k - c.s - c.h) / c.b, 0, 1)); return { x: x0 + STEP, z: Z1 + (Z0 - Z1) * u, ph: u >= 1 ? 'end' : 'bw', u, n: i, done: i + 0.5 + 0.5 * u };
}
function updTrail(lt, gs) {
  const pts = [[X0, Z0]]; const nDone = Math.min(CY.length, gs.ph === 'rest' ? 0 : gs.n);
  for (let i = 0; i < nDone; i++) { pts.push([X0 + STEP * i + STEP, Z1]); pts.push([X0 + STEP * (i + 1), Z0]); }
  if (gs.ph !== 'rest') { if (gs.ph === 'sw') pts.push([gs.x, gs.z]); else if (gs.ph === 'hold') pts.push([gs.x, gs.z]); else { pts.push([X0 + STEP * (gs.n + 1), Z1]); pts.push([gs.x, gs.z]); } }
  trail.visible = false; let di = 0;
  for (let i = 1; i < pts.length && di < dots.n; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.floor(L / 20)); for (let k = 0; k < n && di < dots.n; k++) { const u = k / n; dots.set(di++, lerp(a[0], b[0], u), 10, lerp(a[1], b[1], u), 5.5); } }
  for (; di < dots.n; di++) dots.hide(di); dots.commit();
}

/* ---------------------------------------------------------------- shot 3 */
const bFace = (T, st, off) => Object.assign({ expr: 'smile', blink: blinkAt(T, off || 0.6), look: [0, 0] }, st);
export function shot3(lt, T) {
  let cm; counter.visible = false;
  const yawB = -PI / 2 + 1.0, bx = 80, bz = 430;
  if (lt < 9.22) {                                        /* c1: a bottle and a grain: how can a wave move sand? */
    show(GB, B, GH); skyTo('day'); beachTick(T, { A: lt > 5.2 ? 14 : 6, blow1: 0.3 }); mound.visible = false;
    if (lt < 5.2) {
      pose(B, { t: T, x: bx, z: bz, yaw: yawB, walk: 0, headTilt: 12 + 4 * Math.sin(T * 1.3), arms: { r: { sz: 0.5, sx: 0.12, el: 0.85, curl: 0.8 }, l: { sz: 0.5, sx: 0.12, el: 0.85, curl: 0.2 } } }, TERR(bx, bz));
      fs(B, bFace(T, { expr: 'thinking', look: [0.3, -0.3] }, 0.6));
      B.root.updateMatrixWorld(true); const hr = handPos(B, 1), hl = handPos(B, 0);
      pose(GH, { t: T, x: hl[0] + 3, y: hl[1] + 6, z: hl[2], yaw: yawB, walk: 0, shadow: false }); GH.root.scale.setScalar(0.3);
      fs(GH, { expr: 'curious', blink: blinkAt(T, 0.3), look: [0.4, 0.2] });
      if (!flags.collect) { bottle.visible = true; bottle.scale.setScalar(0.55); bottle.position.set(hr[0] + 6, hr[1] + 40, hr[2]); bottle.rotation.set(0, 0.4, PI / 2 - 0.2); }
      cm = CAMS(lt, [{ t0: 0.4, t1: 5.2, p: [260, 170, 1120], p1: [200, 165, 1020], l: [bx + 10, 150, bz], f: 32 }]);
    } else {                                              /* insert: the bottle just bobs in the same place, the wave passes under it */
      GH.root.visible = false; B.root.visible = false;
      if (!flags.collect) { const f = sea.float(60, -230, 90); bottle.visible = true; bottle.scale.setScalar(1.6); bottle.position.set(60, f.y + 10, -230); bottle.rotation.set(f.rx, 0.5, f.rz + 0.05); }
      cm = CAMS(lt, [{ t0: 5.2, t1: 9.22, p: [-380, 110, 160], p1: [-300, 100, 110], l: [60, 25, -230], f: 32 }]);
    }
  } else if (lt < 39.97) {                                /* c2 - c5: top-down beach: swash runs up at a slant, backwash straight down, each wave a small step sideways */
    show(GZ, GH); skyTo('day'); bottle.visible = false;
    if (!flags.collect) { zsea.update(T, 4); zfoam.forEach(f => f.update(T, 0.8)); }
    const gs = cyc(lt); const fast = lt >= 33;
    pose(GH, { t: T, x: gs.x, z: gs.z, y: TERR(0, 0) * 0 + 6 + (gs.z - Z0) * 0.01, yaw: -PI / 2 + 0.2 + (gs.ph === 'sw' ? 0.5 : gs.ph === 'bw' ? -0.5 : 0), walk: 0, tilt: gs.ph === 'sw' ? -10 : gs.ph === 'bw' ? 10 : 0, shadow: true, squash: gs.ph === 'sw' || gs.ph === 'bw' ? 0.05 : 0 });
    GH.root.scale.setScalar(fast ? 0.7 : 0.65);
    fs(GH, { expr: gs.ph === 'bw' ? 'surprised' : gs.ph === 'hold' ? 'worried' : gs.ph === 'sw' ? 'happy' : 'curious', blink: !fast && blinkAt(T, 0.3), look: [0.3, 0.3] });
    // water sheet and arrows
    const c = CY[Math.max(0, gs.n)]; const sx = gs.x;
    let edge = 0; if (gs.ph === 'sw') edge = Z0 + (Z1 - Z0 + 30) * gs.u; else if (gs.ph === 'hold') edge = Z1 + 30; else if (gs.ph === 'bw') edge = Z1 + 30 + (Z0 - Z1 - 30 + 0) * gs.u;
    swash.visible = edge > 5; swash.scale.set(1, Math.max(1, edge + 20), 1); swash.position.set(sx, 9.4, -20);
    const labelA = lt < 24, showSw = labelA ? (lt > 9.4 && lt < 15.8) : false, showBw = labelA ? (lt > 17.3 && lt < 23.2) : false;
    arSw.visible = showSw; arBw.visible = showBw;
    const x0 = X0 + STEP * Math.max(0, gs.n), ang = Math.atan2(Z1 - Z0, STEP);
    arSw.position.set(x0 - X0, 0, 0); arSw.userData.set(Math.max(0.001, ease(lt, 9.5, 12.5)));
    arBw.position.set(x0 - X0, 0, 0); arBw.userData.set(Math.max(0.001, ease(lt, 17.5, 20.5)));
    updTrail(lt, gs);
    counter.visible = lt >= 33;
    if (counter.visible && !flags.collect) { const n = Math.floor(lerp(120, 9400, Math.pow(lin(lt, 33, 39.8), 1.2))); counter.userData.set(n.toLocaleString('en-US'), { px: 150 }); }
    const gxx = gs.x;
    if (lt < 9.22 + 0.01) cm = null;
    if (lt < 24) cm = CAMS(lt, [{ t0: 9.22, t1: 17.29, p: [gxx - 80, 560, 470], p1: [gxx + 20, 540, 470], l: [gxx - 30, 0, 140], l1: [gxx + 40, 0, 150], f: 34 },
      { t0: 17.29, t1: 24, p: [X0 + 110 + 20, 560, 480], p1: [X0 + 110 + 60, 540, 470], l: [X0 + 150, 0, 150], l1: [X0 + 170, 0, 150], f: 34 }]);
    else if (lt < 32.66) cm = CAMS(lt, [{ t0: 24, t1: 32.66, p: [gxx - 100, 580, 480], p1: [gxx + 60, 600, 490], l: [gxx - 20, 0, 150], l1: [gxx + 60, 0, 150], f: 34 }]);
    else { const u = ease(lt, 32.66, 39.9); cm = { p: [gxx - 100 + 500 * u, lerp(900, 2800, u), lerp(860, 1700, u)], l: [gxx + 400 * u, 0, lerp(150, 120, u)], fov: 34 }; }
    if (lt >= 9.22) { if (typeof cm === 'object' && cm.fov == null) cm.fov = cm.fov || 34; }
  } else {                                                /* c6 - c7: the wind lifts sand off the dry beach and piles it into dunes */
    show(GB, GUST); skyTo('day'); bottle.visible = false; counter.visible = false;
    const k0 = lt - 39.97, gk = lt < 48.79 ? 0.05 + 0.15 * lin(lt, 40, 48.79) : 0.2 + 0.8 * ease(lt, 48.79, 54);
    beachTick(T, { blow1: 0, blow2: ease(lt, 41, 43) * (lt < 48.79 ? 1 : 1 - 0.3 * ease(lt, 50, 56)), dune: gk });
    const gx = GD.x - 300 + 60 * Math.sin(T * 0.7);
    pose(GUST, { t: T, x: gx, y: 270 + 25 * Math.sin(T * 1.3), z: 90 + 160 * ease(lt, 40, 44), yaw: -PI / 2, blow: 1, shadow: false }); GUST.root.scale.setScalar(1.1);
    fs(GUST, { expr: 'happy', blow: 1, blink: blinkAt(T, 0.2) });
    if (lt < 48.79) {
      cm = CAMS(lt, [{ t0: 39.97, t1: 44.5, p: [GD.x - 1300, 220, 520], p1: [GD.x - 1150, 240, 520], l: [GD.x + 60, 110, 180], l1: [GD.x + 200, 110, 260], f: 34 },
        { t0: 44.5, t1: 48.79, p: [GD.x - 800, 340, -150], p1: [GD.x - 500, 300, 40], l: [GD.x + 200, 80, 650], l1: [GD.x + 250, 90, 700], f: 34 }]);
    } else {                                              /* c7: the boy climbs a dune and slides down, the rabbi laughs */
      show(B, R);
      const k = lt - 48.79, kk = gk;
      const zc = GD.z - 330 + 700 * 0 , climbU = ease(lt, 49.3, 52.4), z = lerp(GD.z - 480, GD.z + 90, climbU), slideU = lin(lt, 52.7, 54.6), zz = lt < 52.7 ? z : lerp(GD.z + 90, GD.z + 360, slideU);
      const by = gdH(GD.x, zz, kk), slope = (gdH(GD.x, zz + 20, kk) - gdH(GD.x, zz - 20, kk)) / 40;
      const walking = lt < 52.6, sliding = lt >= 52.7 && lt < 54.9;
      const d0 = 170 * Math.max(0, lt - 49.3);
      pose(B, { t: T, x: GD.x, z: zz, yaw: -PI / 2 + 0.3, walk: (walking && lt > 49.3) || sliding ? 1 : 0, ph: sliding ? (d0 + 380 * (lt - 52.7)) / B.cycle : d0 / B.cycle, lean: walking ? 14 : 8, arms: sliding || lt > 54.9 ? { l: { sz: 2.7, sx: 0.3, el: 0.2 }, r: { sz: 2.7, sx: 0.3, el: 0.2 } } : undefined }, by);
      fs(B, bFace(T, { expr: sliding || lt > 54.9 ? 'laugh' : 'smile', look: [0.3, 0.2] }, 0.6));
      const rz = GD.z + 600, rx = GD.x + 150; pose(R, { t: T, x: rx, z: rz, yaw: -PI / 2 - 0.5, walk: 0, headTilt: sliding ? 8 * Math.sin(T * 12) : 0, arms: sliding ? { r: { sz: 0.9, sx: 0.2, el: 1.2 }, l: { sz: 0.9, sx: 0.2, el: 1.2 } } : undefined }, gdH(rx, rz, kk));
      fs(R, { expr: sliding || lt > 54.9 ? 'laugh' : 'smile', blink: blinkAt(T, 0.1), look: [-0.3, 0.1] });
      cm = CAMS(lt, [{ t0: 48.79, t1: 52.7, p: [GD.x - 1000, 230, GD.z - 120], p1: [GD.x - 950, 240, GD.z + 60], l: [GD.x, 150, GD.z - 20], l1: [GD.x, 170, GD.z + 120], f: 32 },
        { t0: 52.7, t1: 56.5, p: [GD.x - 760, 130, GD.z + 700], p1: [GD.x - 700, 140, GD.z + 700], l: [GD.x, 90, GD.z + 360], l1: [GD.x + 30, 100, GD.z + 380], f: 33 }]);
    }
  }
  if (!cm.fov) cm.fov = 32;
  return cm;
}
