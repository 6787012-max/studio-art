/* film_d shot 2: the breakwater (39.5 - 81.4 s). ASCII only. */
import { Q, THREE, sm, cl, frac, V, KT, part, ell, lathe, tube, M, box, rockGeo, rng, G, col, GA, GH, GL, GM, R, B, TI, GULLS, ease, lin, lerp, lerp3, blinkAt, flags, fs, pose, talkL, CAMS, skyTo, show, bFace, rFace, POST, cam, makeLabel, sky, hullGeo, ALL, scene } from './d_core.js';
import { SHIP, place, beach, beachSea, beachTick, beachY, harbour, hsea, harbourTick, wall, lwall, LSEA, lwTick } from './d_w1.js';
import { setShip, gullFly } from './d_s1.js';
const PI = Math.PI;

/* barge with boulders */
export const barge = (() => {
  const g = G(GH), hull = M('#3b5a7a', '#a8b0c8'), red = M('#c0392b', '#b08a9a'), rk = M('#a9a39a', '#b9b0c4');
  part(g, hullGeo(360, 46, 150, { bow: 0.15, stern: 0.1, sheer: 0.05, pinch: 3 }), hull, 3);
  box(g, 340, 14, 120, red, [0, 52, 0], 2, null, 3);
  const r = rng(14); for (let i = 0; i < 9; i++) part(g, rockGeo(36 + r() * 16, 28 + r() * 10, 32 + r() * 12, i + 900), rk, 2.4, [-90 + (i % 5) * 52 + (r() - 0.5) * 10, 78 + (i > 4 ? 30 : 0), (i % 2 ? 24 : -24)]);
  box(g, 70, 70, 60, M('#f4f4f0', '#c9c6d8'), [-140, 100, 0], 2.4, null, 5); box(g, 78, 8, 68, M('#2f5d8a', '#9a96b0'), [-140, 138, 0], 2, null, 2);
  const arm = G(g, [130, 60, 0]); part(arm, tube(5, 5, 130, 8).translate(0, 130, 0), M('#f0ad4e', '#c9a080'), 1.8); part(arm, tubeLong(), M('#f0ad4e', '#c9a080'), 1.8, [0, 130, 0]);
  g.visible = false; return g;
  function tubeLong() { return new THREE.BoxGeometry(110, 8, 8).translate(60, 0, 0); }
})();
export const spl = [0, 1, 2, 3, 4].map(i => { const s = KT.makeSplash({ r: 70 + 10 * i }); s.visible = false; GH.add(s); return s; });
export const crest = KT.makeCurlWave({ w: 900, h: 150, col: '#2f7fc4', light: '#64c0ea' }); crest.rotation.y = PI / 2; crest.position.set(-300, -8, -500); GH.add(crest); crest.visible = false;
export const crest2 = KT.makeCurlWave({ w: 700, h: 120, col: '#2f7fc4', light: '#64c0ea' }); crest2.rotation.y = PI / 2; crest2.position.set(300, -8, -820); GH.add(crest2); crest2.visible = false;

/* arc-length helper: u of the wall point nearest to x on the north run */
const UX = []; for (let i = 0; i <= 400; i++) { const p = wall.curve.getPointAt(i / 400); UX.push(p.x); }
const uAtX = x => { for (let i = 1; i <= 400; i++) if (UX[i] >= x && i / 400 > 0.35) return i / 400 - (UX[i] - x) / Math.max(1e-6, UX[i] - UX[i - 1]) / 400; return 1; };
const faceDir = (a, b) => Math.atan2(-(b.z - a.z), b.x - a.x);
/* the wall seen from its own top: stand a person at u, offset nrm (+ = inside the basin) */
function onWall(o, u, nrm, yawAdd, extra, lookAt) {
  const p = wall.at(u, 81, nrm), tg = wall.tg(u); pose(o, Object.assign({ t: 0, x: p.x, z: p.z, yaw: Math.atan2(-tg.z, tg.x) + (yawAdd || 0), walk: 0 }, extra), 81); return p;
}

export function shot2(lt, T) {
  const k = lt;
  /* ======================================================= c1: the wall grows (0.4 - 9.39) */
  if (lt < 9.39) {
    show(GH, R, B); skyTo('day'); const prog = lin(lt, 0.4, 8.7) * 1.0, pg = ease(lt, 0.4, 8.7) * 0.4 + prog * 0.6;
    wall.set(Math.min(1, pg), 0.05); harbourTick(T, 22, lerp(1, 0.08, ease(pg, 0.45, 0.98)));
    const tip = wall.at(Math.min(pg, 1), 0), tg = wall.tg(Math.min(pg, 0.999)), nrmV = V(-tg.z, 0, tg.x);
    barge.visible = pg < 1.0 || lt < 9; const bp = tip.clone().addScaledVector(nrmV, -150);
    if (!flags.collect) { const f = hsea.float(bp.x, bp.z, 60); barge.position.set(bp.x, f.y - 25, bp.z); barge.rotation.set(f.rx * 0.5, Math.atan2(-tg.z, tg.x), f.rz * 0.5, 'YXZ'); barge.rotation.order = 'YXZ'; barge.visible = true; barge.scale.setScalar(1.15); }
    spl.forEach(s => { s.visible = false; });
    gullFly(GULLS[0], T, tip.x + 400, tip.z - 300, 380, 520, 0, 0.5); gullFly(GULLS[1], T, tip.x + 500, tip.z - 100, 300, 600, 2, 0.6);
    crest.visible = crest2.visible = false;
    let cm;
    if (lt < 6.4) {                                                 /* barge at a quarter distance, boulders drop, the wall grows */
      const hh = lerp(560, 300, ease(lt, 0, 5)), dd = lerp(1350, 900, ease(lt, 0, 5));
      const opt = +(Q.get('opt') || 0);
      if (opt === 1) cm = { p: [tip.x + nrmV.x * dd * 0.9 + 150, hh, tip.z + nrmV.z * dd * 0.9 + 300], l: [bp.x, 60, bp.z], fov: 34 };
      else if (opt === 2) cm = { p: [tip.x - nrmV.x * dd * 0.5 - 350, hh * 1.6, tip.z - nrmV.z * dd * 0.5 - 500], l: [bp.x, 40, bp.z], fov: 34 };
      else cm = { p: [tip.x - nrmV.x * dd + 230, hh, tip.z - nrmV.z * dd - 520], l: [bp.x + nrmV.x * 60, 70, bp.z + nrmV.z * 60], fov: 34 };
      R.root.visible = B.root.visible = false;
    } else {                                                        /* the pair on the quay watches */
      pose(R, { t: T, x: -1010, z: 715, yaw: -0.2, walk: 0, headYaw: 0.5, arms: { r: { sz: 1.2, sx: 0.15, el: 0.3, point: true } } }, 55); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 6.6, 9), look: [0.3, 0.1] }));
      pose(B, { t: T, x: -740, z: 765, yaw: -0.45, walk: 0, headYaw: 0.6 }, 55); fs(B, bFace(T, { expr: 'surprised', look: [0.3, 0.1] }));
      cm = CAMS(lt, [{ t0: 6.4, t1: 9.39, p: [-200, 215, 1500], p1: [-230, 213, 1470], l: [-880, 180, 740], f: 33 }]);
    }
    return cm;
  }
  /* ======================================================= c2: waves break outside, calm inside (9.39 - 17.61) */
  if (lt < 17.61) {
    show(GH, R, B, TI[0], TI[1]); skyTo('day'); wall.set(1, 0.05); harbourTick(T, 36, 0.05); barge.visible = false;
    crest.visible = crest2.visible = true; if (!flags.collect) { crest.userData.update(T, 0.8 + 0.2 * Math.sin(T * 0.9)); crest2.userData.update(T + 1.7, 0.7 + 0.2 * Math.sin(T * 0.7)); }
    // splashes on the boulders (outside face)
    spl.forEach((s, i) => { const uu = 0.5 + i * 0.07, p = wall.at(uu, 30, -105); const vis = i % 2 === 0 && lt < 13.3; s.position.set(p.x, 20, p.z); s.userData.update(frac(T * 0.5 + i * 0.37)); s.scale.setScalar(0.45); s.visible = s.visible && vis; });
    // Tipa outside rides a wave, Tipa inside floats peacefully
    const uo = 0.47, po = wall.at(uo, 0, -420), pi = wall.at(0.52, 0, 280), kk = lt - 9.39;
    if (!flags.collect) {
      const fo = hsea.float(po.x, po.z, 80); pose(TI[1], { t: T, x: po.x, y: fo.y + 20 + 25 * Math.abs(Math.sin(T * 1.6)), z: po.z, yaw: lt < 13.3 ? 2.4 : -0.78, walk: 0.8, ph: T * 0.9, hopH: 90, tilt: 12 * Math.sin(T * 1.6), arms: 'up', feet: false, shadow: false });
      const fi = hsea.float(pi.x, pi.z, 80); pose(TI[0], { t: T, x: pi.x, y: fi.y - 70, z: pi.z, yaw: PI / 2 - 0.5, walk: 0, tilt: 3 * Math.sin(T * 0.7), arms: 'down', feet: false, shadow: false });
    }
    fs(TI[1], { expr: 'cheering', blink: false, look: [0.2, 0.1] }); fs(TI[0], { expr: 'happy', blink: blinkAt(T, 0.3), look: [0.3, 0.1] });
    gullFly(GULLS[0], T, -100, -200, 500, 360, 1, 0.4);
    let cm;
    if (lt < 13.3) {
      R.root.visible = B.root.visible = false;
      cm = CAMS(lt, [{ t0: 9.39, t1: 13.3, p: [-1000, 200, -1150], p1: [-860, 220, -1100], l: [-400, 120, -520], l1: [-380, 120, -510], f: 34 }]);
    } else {
      const ur = uAtX(-330), ub = uAtX(-70), pr = wall.at(ur, 81, 20), ppb = wall.at(ub, 81, 30);
      onWall(R, ur, 20, PI / 2 - 0.3, { headYaw: 0.1, arms: { r: { sz: 1.05, sx: 0.15, el: 0.3, point: true } } }); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 13.5, 17), look: [0.3, 0.2] }));
      onWall(B, ub, 30, PI / 2 + 0.25, { headTilt: 4 * Math.sin(T * 1.7), arms: { l: { sz: 0.3, sx: 0.6, el: 1.4 }, r: { sz: 0.3, sx: 0.6, el: 1.4 } } }); fs(B, bFace(T, { expr: 'surprised', look: [0.4, 0.2] }));
      cm = CAMS(lt, [{ t0: 13.3, t1: 17.61, p: [-130, 330, -1290], p1: [-160, 335, -1260], l: [-200, 215, -330], l1: [-200, 215, -330], f: 34 }]);
    }
    return cm;
  }
  /* ======================================================= c3: along the top, the lighthouse, a gull (17.61 - 23.52) */
  if (lt < 23.52) {
    show(GH, R, B, GULLS[3]); skyTo('day'); wall.set(1, 0.05); harbourTick(T, 22, 0.06); barge.visible = false; spl.forEach(s => { s.visible = false; }); crest.visible = crest2.visible = false;
    const gg = GULLS[3], ug = 0.935, pg = wall.at(ug, 81, -45); gg.root.scale.setScalar(0.6);
    const tk = lt - 17.61, takeoff = ease(tk, 4.3, 5.4);
    if (!flags.collect) { pose(gg, { t: T, x: pg.x, y: 81 + 160 * takeoff * takeoff + 2, z: pg.z + 0, yaw: PI + 0.5 - 1.2 * takeoff, walk: 0, flap: takeoff, fly: takeoff > 0.2, headRot: 15 * Math.sin(T * 1.7), shadow: takeoff < 0.1 }); }
    fs(gg, { expr: 'happy', blink: blinkAt(T, 0.2), talk: tk > 2.4 && tk < 3.5 ? 'A' : null });
    gg.root.visible = true;
    let cm;
    if (lt < 20.5) {
      R.root.visible = B.root.visible = false;
      const u = lerp(0.5, 0.74, ease(lt, 17.61, 20.5)), ph = wall.at(u, 215, -20), pl = wall.at(Math.min(1, u + 0.14), 150, 0);
      cm = { p: [ph.x, ph.y, ph.z], l: [pl.x, pl.y, pl.z], fov: 34 };
    } else {
      const du = 250 / wall.L, uR = 0.955, uB = uR - du;
      onWall(R, uR, 12, -PI / 2 + 0.45, { headYaw: -0.1, arms: { r: { sz: 0.9, sx: 0.5, el: 0.7, curl: 0.8 } } }); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 20.6, 23.2), look: [0.3, 0.1] }));
      onWall(B, uB, 14, -PI / 2 + 0.85, { headTilt: 3 * Math.sin(T * 1.5) }); fs(B, bFace(T, { expr: 'smile', look: [0.3, 0.1] }));
      const mid = wall.at(uR - du * 0.5, 0, 0);
      cm = CAMS(lt, [{ t0: 20.5, t1: 23.52, p: [mid.x + 80, 290, mid.z + 960], p1: [mid.x + 40, 287, mid.z + 930], l: [mid.x + 70, 215, mid.z], f: 32 }]);
    }
    return cm;
  }
  /* ======================================================= c4: the Haifa breakwater is long (23.52 - 32.51) */
  if (lt < 32.51) {
    show(GL, R, B, SHIP); place(SHIP, GL); skyTo('day'); lwall.set(1, 0.05); lwTick(T, 24);
    const tk = lt - 23.52, bz = -300;
    // protected ships inside
    setShip(LSEA, 1500, 130, PI, 0.5, 0.01 * Math.sin(T), 0, 0);
    gullFly(GULLS[0], T, 1500, -200, 800, 700, 0, 0.3);
    let cm;
    const lab = labelMesh();
    lab.visible = lt < 28 || lt > 31.4; bracket.visible = lt < 27.2;
    if (lt < 27.2) {                                                /* aerial along the wall */
      R.root.visible = B.root.visible = false;
      cm = CAMS(lt, [{ t0: 23.52, t1: 27.2, p: [-1400, 1250, 1900], p1: [-900, 1150, 1700], l: [3000, 0, -250], l1: [3200, 0, -260], f: 38 }]);
      lab.position.set(2300, 520, -300); lab.scale.setScalar(2.4);
    } else if (lt < 31.0) {                                         /* the boy walks and it keeps going */
      const w = lin(lt, 27.2, 31.0), d = 700 + w * 520, ps = d;
      pose(B, { t: T, x: ps, z: bz, yaw: 0, walk: 1, ph: d / B.cycle, headYaw: 0.6 + 0.1 * Math.sin(T * 0.8), arms: {} }, 81); fs(B, bFace(T, { expr: lt > 29.2 ? 'surprised' : 'smile', look: [0.3, 0.1] }));
      pose(R, { t: T, x: ps - 330, z: bz + 10, yaw: 0, walk: 1, ph: (d - 400) / R.cycle, headYaw: 0.55, arms: { r: { sz: 1.0, sx: 0.2, el: 0.3, point: true } } }, 81); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 27.4, 31), look: [0.4, 0.1] }));
      cm = { p: [ps + 140, 285, bz - 960], l: [ps - 170, 195, bz], fov: 34 };
      lab.position.set(2300, 520, -300); lab.scale.setScalar(2.4);
    } else {                                                        /* the boy turns, amazed */
      const bx = 1000, rr = ease(lt, 31.0, 31.6);
      pose(B, { t: T, x: bx, z: bz - 5, yaw: PI / 2 - 0.9 * (1 - rr) - 0.4, walk: 0, headTilt: 4, arms: { l: { sz: 0.3, sx: 0.6, el: 1.4 }, r: { sz: 0.3, sx: 0.6, el: 1.4 } } }, 81); fs(B, bFace(T, { expr: 'surprised', look: [0.1, 0.1] }));
      pose(R, { t: T, x: bx - 250, z: bz + 10, yaw: PI / 2 + 0.45, walk: 0, headYaw: 0.1, arms: { r: { sz: 0.4, sx: 0.4, el: 0.9, curl: 0.8 } } }, 81); fs(R, rFace(T, { expr: 'smile', look: [0.2, 0.1] }));
      cm = CAMS(lt, [{ t0: 31.0, t1: 32.51, p: [bx + 60, 275, bz - 950], p1: [bx + 30, 278, bz - 920], l: [bx - 120, 195, bz], f: 31 }]);
      lab.position.set(bx + 900, 420, bz); lab.scale.setScalar(1.2);
    }
    return cm;
  }
  /* ======================================================= c5: beach vs wall, split (32.51 - 41.5), then the pair on the wall */
  const tk = lt - 32.51; if (_lab) { _lab.visible = false; bracket.visible = false; }
  if (lt < 38.4) {
    show(GA, GL, R, B, SHIP); place(SHIP, GL); skyTo('day'); lwall.set(1, 0.05); lwTick(T, 30); beachTick(T, 4, 0.8);
    setShip(LSEA, 1900, 140, 0.1, 0.5, 0.012 * Math.sin(T * 1.1), 0, 0);
    // left: soft beach, the boy at the water line, small waves die on the sand
    pose(B, { t: T, x: 40, z: 135, yaw: PI / 2 + 0.55, walk: 0, headTilt: 4 * Math.sin(T * 1.2), arms: { r: { sz: 0.3, sx: 0.4 + 0.1 * Math.sin(T * 2), el: 0.5 } } }, beachY(40, 135)); fs(B, bFace(T, { expr: 'smile', look: [-0.3, 0.3] }));
    // right: the rabbi on the long wall explains
    pose(R, { t: T, x: 1000, z: -300, yaw: -PI / 2 + 0.45, walk: 0, headYaw: 0.1, arms: { r: { sz: 0.9 + 0.3 * ease(tk, 1, 2), sx: 0.4, el: 0.5, curl: 0.8 } } }, 81); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 33, 38), look: [0.3, 0.1] }));
    const gl = () => { GA.visible = true; GL.visible = false; R.root.visible = false; B.root.visible = true; SHIP.visible = false; };
    const gr = () => { GA.visible = false; GL.visible = true; R.root.visible = true; B.root.visible = false; SHIP.visible = true; };
    gullFly(GULLS[0], T, 800, -100, 400, 420, 0, 0.4);
    return { p: [0, 100, 100], l: [0, 100, 0], parts: [
      { vp: [0, 0, 0.5, 1], setup: gl, cam: CAMS(lt, [{ t0: 32.51, t1: 38.4, p: [300, 190, -560], p1: [260, 192, -530], l: [40, 165, 135], f: 33 }]) },
      { vp: [0.5, 0, 0.5, 1], setup: gr, cam: CAMS(lt, [{ t0: 32.51, t1: 38.4, p: [1180, 260, 560], p1: [1130, 262, 540], l: [1000, 205, -300], l1: [1005, 205, -300], f: 34 }]) } ] };
  }
  show(GL, R, B); skyTo('day'); lwall.set(1, 0.05); lwTick(T, 28);
  const bx = 1800;
  pose(R, { t: T, x: bx, z: -300, yaw: -1.15, walk: 0, headYaw: 0.1, arms: { l: { sz: 0.4, sx: 0.5, el: 0.9 }, r: { sz: 0.4, sx: 0.5, el: 0.9 } } }, 81); fs(R, rFace(T, { expr: 'smile', look: [0.3, 0.1] }));
  pose(B, { t: T, x: bx - 340, z: -265, yaw: -0.5, walk: 0, headTilt: 5 * Math.sin(T * 1.5) }, 81); fs(B, bFace(T, { expr: 'smile', look: [0.3, 0.1] }));
  return CAMS(lt, [{ t0: 38.4, t1: 41.9, p: [bx + 420, 390, 470], p1: [bx + 390, 392, 445], l: [bx - 150, 190, -285], f: 31 }]);
}
/* floating "3 km" label + a red bracket over the long wall */
let _lab = null, bracket = null;
function labelMesh() {
  if (_lab) { POST.push(() => _lab.quaternion.copy(cam.quaternion)); return _lab; }
  _lab = makeLabel('3 km', 560, 210, 150); GL.add(_lab);
  bracket = G(GL); const redm = M('#d9402e', '#d9402e', 0); box(bracket, 7100, 8, 8, redm, [3250, 175, -300], 0); for (const x of [-300, 6800]) box(bracket, 8, 70, 8, redm, [x, 175, -300], 0);
  POST.push(() => _lab.quaternion.copy(cam.quaternion)); return _lab;
}
