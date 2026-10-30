/* film_z shot 1: what we found (0 - 52.8 s). Callbacks to films a-e. ASCII only. */
import { THREE, sm, cl, frac, D2R, V, part, ell, KT, W, GB, GM, GZ, GC, GK, R, B, GH, GX, TI, GUST, GULL, sky, cam, ease, lin, lerp, lerp3, blinkAt, flags, POST, fs, pose, talkL, CAMS, PAN, skyTo, show, handPos, walkAlong, fwd } from './z_core.js';
import { terr, sea, seaS, foams } from './z_beach.js';
import { beachTick, mapOpen, compass, drawQ, qCurve, HB, PORT, SEC, DOL, FISH, gasGlow } from './z_set.js';
import { MAP } from './z_map.js';
const PI = Math.PI, TERR = W.TERR;
const bF = (T, st, off) => Object.assign({ expr: 'smile', blink: blinkAt(T, off || 0.6), look: [0, 0] }, st);
const rF = (T, st) => Object.assign({ expr: 'smile', blink: blinkAt(T, 0.1), look: [0, 0] }, st);
const PH = (T, o, x, z, yaw, extra, y) => pose(o, Object.assign({ t: T, x, z, yaw, walk: 0 }, extra), y == null ? TERR(x, z) : y);

/* the map the boy holds */
const U = () => sky.material.uniforms;
function sun(y, c, x) { const u = U(); u.uHasSun.value = 1; u.uSun.value.set(c || '#ffcf3d'); u.uDir.value.set(x || 0, y, -1).normalize(); }

export function shot1(lt, T) {
  skyTo('gold');
  let cam2;
  if (lt < 4.5) {                                     /* ---- title: the pair strolls along the shore at golden hour (callback to film c) */
    show(GB, R, B); beachTick(T, { dusk: true, A: 5, blow: 0.2 });
    const d = 130 * lt, psi = -0.6, wr = walkAlong(R, -640, 180, psi, d), wb = walkAlong(B, -860, 290, psi - 0.1, d);
    PH(T, R, wr.x, wr.z, psi, { walk: 1, ph: wr.ph, headYaw: 0.3 }); PH(T, B, wb.x, wb.z, psi - 0.1, { walk: 1, ph: wb.ph, headYaw: -0.2 });
    fs(R, rF(T, { look: [0.4, 0] })); fs(B, bF(T, { look: [0.4, 0] }, 0.5));
    cam2 = CAMS(lt, [{ t0: 0, t1: 4.5, p: [-600, 130, 1120], p1: [-260, 130, 1080], l: [-640, 188, 0], l1: [-300, 188, 0], f: 34, lin: true }]);
    sun(0.12, '#ffcf3d', 0.3);
  } else if (lt < 11.85) {                            /* ---- c1: the boy holds up the map scroll, the rabbi smiles, a gull draws a question mark */
    show(GB, R, B); beachTick(T, { dusk: true, A: 5, blow: 0.2 });
    const k = lt - 4.5, up = ease(k, 0.3, 1.3), bx = -80, bz = 520;
    PH(T, B, bx, bz, -PI / 2 + 0.3, { headYaw: -0.12 + 0.1 * Math.sin(T * 1.3), headTilt: 4, arms: { l: { sz: 0.55 + 0.6 * up, sx: 0.05, el: 0.4 + 0.5 * up, curl: 0.6 }, r: { sz: 0.55 + 0.6 * up, sx: 0.05, el: 0.4 + 0.5 * up, curl: 0.6 } } });
    fs(B, bF(T, { expr: lt > 7.3 ? 'surprised' : 'smile', look: [0.2, -0.3] }, 0.6));
    PH(T, R, 170, 548, -PI / 2 - 0.35, { headYaw: -0.2 + 0.1 * Math.sin(T * 0.9), headTilt: 3, arms: { r: { sz: lt > 9.2 ? 0.7 : 0.2, sx: 0.2, el: 0.6, curl: 0.4 } } });
    fs(R, rF(T, { expr: 'smile', look: [-0.4, 0.1] }));
    B.root.updateMatrixWorld(true); const hl = handPos(B, 0), hr = handPos(B, 1);
    show(GK); mapOpen.visible = true; mapOpen.position.set((hl[0] + hr[0]) / 2 + 26, (hl[1] + hr[1]) / 2 - 24, (hl[2] + hr[2]) / 2 + 10);
    mapOpen.rotation.y = Math.atan2(-(cam.position.z - mapOpen.position.z), cam.position.x - mapOpen.position.x);
    const qu = ease(lt, 6.2, 10.2); drawQ(qu, [420, 190, 60]);
    const gp = qCurve.getPointAt(Math.min(0.999, qu)), gq = qCurve.getPointAt(Math.min(0.999, qu + 0.01)); show(GULL);
    GULL.root.scale.setScalar(0.8);
    pose(GULL, { t: T, x: 420 + gp.x * 1.3, y: 190 + gp.y * 1.3, z: 60, yaw: gq.x - gp.x >= 0 ? 0 : PI, flap: 0.5 + 0.5 * Math.sin(T * 9), fly: true, shadow: false });
    fs(GULL, { expr: 'happy', blink: false, look: [0.2, 0] });
    if (lt < 8.4) cam2 = CAMS(lt, [{ t0: 4.5, t1: 8.4, p: [60, 150, 1240], p1: [30, 150, 1180], l: [20, 175, 520], l1: [40, 185, 440], f: 32 }]);
    else cam2 = CAMS(lt, [{ t0: 8.4, t1: 11.85, p: [60, 160, 1330], p1: [100, 165, 1270], l: [120, 235, 300], l1: [150, 245, 300], f: 36 }]);
  } else if (lt < 20.72) {                            /* ---- c2: the sun sets into the sea, the W point of the compass lights */
    const k = lt - 11.85, sy = lerp(0.115, -0.012, ease(lt, 12.3, 19.2)); skyTo('gold', 'dusk', ease(lt, 11.85, 18.5));
    show(GB, R, B); beachTick(T, { dusk: true, A: 5, blow: 0.2 }); sun(sy, '#ffcf3d');
    compass.visible = true; compass.position.set(0, TERR(0, 400) + 2, 400); compass.userData.set(ease(lt, 15.8, 17.0), T);
    const wave = lt > 17 ? 0.35 * Math.sin(T * 5) : 0;
    const sideA = lt < 14.6;
    if (sideA) { /* front 3/4 of both, sunset warm on their faces */
      PH(T, R, -130, 310, PI / 2 - 0.5, { headYaw: -0.25, headTilt: 3, arms: { r: { sz: 0.2, sx: 0.2, el: 0.5, curl: 0.4 } } }); fs(R, rF(T, { expr: 'smile', talk: talkL(lt, 12.2, 14.2), look: [-0.3, 0.1] }));
      PH(T, B, 130, 320, PI / 2 + 0.45, { headYaw: 0.25, headTilt: 2, arms: { r: { sz: 0.25, sx: 0.12, el: 0.3, curl: 0.4 } } }); fs(B, bF(T, { look: [-0.4, 0.2] }, 0.5));
      cam2 = CAMS(lt, [{ t0: 11.85, t1: 14.6, p: [-80, 105, -360], p1: [-30, 110, -330], l: [0, 135, 300], l1: [0, 135, 300], f: 36 }]);
    } else {
      PH(T, R, -270, 330, -0.5, { headYaw: 0.35, headTilt: 3, arms: { r: { sz: 0.25, sx: 0.2, el: 0.5, curl: 0.4 } } }); fs(R, rF(T, { look: [0.4, 0] }));
      PH(T, B, 270, 340, PI + 0.5, { headYaw: -0.35, headTilt: 2, arms: { r: { sz: lt > 15.2 ? 1.35 : 0.3, sx: 0.12, el: 0.2, point: lt > 15.2 } } });
      fs(B, bF(T, { expr: lt > 16 ? 'surprised' : 'smile', look: [-0.3, 0.2] }, 0.5));
      cam2 = CAMS(lt, [{ t0: 14.6, t1: 20.72, p: [-20, 200, 1060], p1: [0, 185, 1000], l: [0, 190, 100], l1: [0, 175, 100], f: 38 }]);
    }
  } else if (lt < 28.83) {                            /* ---- c3: the wind gust blows, waves rise, the sand grains at the waterline stop them (callback to film b) */
    show(GB, R, B); skyTo('day'); const A = lerp(5, 40, ease(lt, 21.3, 25.0)); beachTick(T, { A, foam: lt < 24.6 ? 0.8 : 0.9 + 0.7 * (0.5 + 0.5 * Math.sin((lt - 24.6) * 2.2)), blow: 0.4 });
    const gu = lin(lt, 20.8, 28.2); show(GUST);
    const early = lt < 24.9, gx = early ? lerp(60, 520, gu / 0.55) : lerp(500, 1000, (lt - 24.9) / 3.9), gz = early ? -330 : -260;
    pose(GUST, { t: T, x: gx, y: early ? 380 + 20 * Math.sin(T * 2) : 300 + 15 * Math.sin(T * 2), z: gz, yaw: -0.7, blow: 1, shadow: false }); GUST.root.scale.setScalar(early ? 1.5 : 1.3); fs(GUST, { expr: 'happy', blink: false, look: [0.3, 0], blow: 1 });
    show(R, B);
    PH(T, R, -330, 230, -PI / 2 + 0.55, { headYaw: -0.4, arms: { r: { sz: 0.2, sx: 0.2, el: 0.5, curl: 0.4 } } }); fs(R, rF(T, { expr: 'surprised', look: [0.5, 0.2] }));
    PH(T, B, -140, 255, -PI / 2 - 0.4, { headYaw: -0.4 }); fs(B, bF(T, { expr: 'surprised', look: [0.5, 0.2] }, 0.5));
    if (!early) { R.root.visible = B.root.visible = false; }
    GX.forEach((g, i) => { show(g); const x = 40 + i * 120, push = lt > 25 ? 0.07 * Math.max(0, Math.sin((lt - 24.6) * 2.2 + i * 0.2)) : 0;
      pose(g, { t: T, x, z: 70 + 4 * Math.sin(i * 2.3), yaw: -PI / 2 + 0.5, walk: 0, squash: push, tilt: 0 }, TERR(x, 70)); g.root.scale.setScalar(early ? 0.8 : 0.95);
      fs(g, { expr: lt > 25 ? 'cheering' : 'curious', blink: blinkAt(T, i * 0.13), look: [0, 0.2] }); });
    if (early) cam2 = CAMS(lt, [{ t0: 20.72, t1: 24.9, p: [-300, 140, 960], p1: [-230, 140, 900], l: [20, 215, -200], l1: [80, 215, -200], f: 38 }]);
    else cam2 = CAMS(lt, [{ t0: 24.9, t1: 28.83, p: [-250, 120, 540], p1: [-120, 120, 480], l: [250, 110, 50], l1: [330, 110, 50], f: 42 }]);
  } else if (lt < 36.94) {                            /* ---- c4: a chain of grains travels north along the coast on the map (callback to film c) */
    show(GM, GH, ...GX.slice(0, 3)); hideSeas(); skyTo('day'); MAP.update(T); MAP.setSand(T, 1);
    const SC = MAP.sandCurve, len = SC.getLength(), u = 0.04 + 0.58 * ease(lt, 29.4, 36.4);
    [GH, GX[0], GX[1], GX[2]].forEach((g, i) => { const uu = Math.max(0.0005, u - i * 62 / len), p = SC.getPointAt(uu), tg = SC.getTangentAt(uu);
      pose(g, { t: T, x: p.x, y: -4, z: p.z, yaw: -Math.atan2(tg.z, tg.x), walk: 1, ph: (uu * len) / 38 + i * 0.3, hopH: 46, shadow: false }); g.root.scale.setScalar(0.27);
      fs(g, { expr: lt < 32 ? 'curious' : (lt > 35 ? 'cheering' : 'happy'), blink: blinkAt(T, 0.5 + i * 0.1), look: [0.4, 0] }); });
    const p = SC.getPointAt(u);
    if (lt < 33.2) cam2 = CAMS(lt, [{ t0: 28.83, t1: 33.2, p: [760, 380, 1180], p1: [1000, 300, 980], l: [1250, 0, 640], l1: [1340, 0, 600], f: 34 }]);
    else cam2 = { p: [p.x + 230, 175, p.z + 260], l: [p.x - 40, 0, p.z - 70], fov: 34 };
  } else if (lt < 44.29) {                            /* ---- c5: breakwater and a calm harbour, then the container port (callback to film d) */
    show(GZ); skyTo('day'); const h = lt < 40.5; HB.root.visible = h; PORT.root.visible = !h; GZ.visible = true;
    if (!flags.collect) { HB.sea.update(T, 22); HB.update(T); PORT.update(T); }
    if (h) {
      const tp = HB.sea.float(-330, 190, 70); show(TI[0]);
      pose(TI[0], { t: T, x: -330, y: tp.y - 6, z: 190, yaw: 0.6, float: 1, feet: false, tilt: 3 * Math.sin(T * 1.5), shadow: false }); TI[0].root.scale.setScalar(0.6); fs(TI[0], { expr: 'happy', blink: blinkAt(T, 0.3), look: [0.3, 0.2] });
      if (lt < 38.9) cam2 = CAMS(lt, [{ t0: 36.94, t1: 38.9, p: [-60, 400, -1380], p1: [220, 360, -1080], l: [-250, 40, 220], l1: [-220, 40, 200], f: 34 }]);
      else cam2 = CAMS(lt, [{ t0: 38.9, t1: 40.5, p: [-420, 120, -880], p1: [-300, 130, -820], l: [-250, 60, -330], l1: [-200, 60, -330], f: 38 }]);
    } else {
      show(R, B); const bx = -235, bz = 435;
      PH(T, R, bx - 95, bz, -PI / 2 + 0.55, { headYaw: -0.35, arms: { r: { sz: lt > 41.4 ? 0.95 : 0.2, sx: lt > 41.4 ? 0.9 : 0.2, el: 0.4, curl: 0.3 } } }, 60); fs(R, rF(T, { expr: 'explaining', talk: talkL(lt, 40.6, 43.5), look: [-0.4, 0.1] }));
      PH(T, B, bx + 95, bz + 10, -PI / 2 - 0.45, { headYaw: 0.35, headTilt: 2 }, 60); fs(B, bF(T, { expr: 'surprised', look: [-0.4, 0.4] }, 0.5));
      cam2 = CAMS(lt, [{ t0: 40.5, t1: 44.29, p: [-235, 210, 1150], p1: [-235, 195, 1040], l: [-235, 235, 300], l1: [-235, 235, 300], f: 33 }]);
    }
  } else {                                            /* ---- c6: the deep: dark water full of life, a dolphin, a glowing gas pocket (callback to film e) */
    show(GC); hideSeas(); skyTo('deep'); SEC.update(T); const d1 = lt < 48.6;
    FISH.forEach((f, i) => { show(f); const a = T * (0.5 + 0.07 * i) + i * 1.9, cx = [-500, 150, 650, -150, 300][i], cy = [-250, -520, -120, -760, -380][i];
      pose(f, { t: T, x: cx + 220 * Math.cos(a), y: cy + 40 * Math.sin(a * 2), z: 60 + 70 * Math.sin(a), yaw: Math.atan2(-70 * Math.cos(a), -220 * Math.sin(a)), swim: 0.8, shadow: false }); f.root.scale.setScalar(0.85); });
    DOL.visible = true; const du = lin(lt, 46.4, 50.2); DOL.scale.setScalar(1.1); DOL.position.set(lerp(-1250, 950, du), -540 + 90 * Math.sin(du * 7), 800); DOL.rotation.set(0, 0, 0.18 * Math.cos(du * 7)); DOL.userData.update(T);
    gasGlow.userData.update(T, ease(lt, 48.3, 50));
    if (lt < 47) cam2 = CAMS(lt, [{ t0: 44.29, t1: 47, p: [200, -420, 3100], p1: [0, -560, 2300], l: [0, -450, 0], l1: [-100, -620, 0], f: 34 }]);
    else if (lt < 50) cam2 = CAMS(lt, [{ t0: 47, t1: 50, p: [-250, -640, 1500], p1: [-100, -680, 1350], l: [-350, -760, 0], l1: [-150, -780, 0], f: 34 }]);
    else cam2 = CAMS(lt, [{ t0: 50, t1: 52.8, p: [480, -320, 1200], p1: [540, -320, 1080], l: [560, -400, 0], l1: [580, -400, 0], f: 33 }]);
  }
  return cam2;
}
function hideSeas() { sea.mesh.visible = false; seaS.mesh.visible = false; }
