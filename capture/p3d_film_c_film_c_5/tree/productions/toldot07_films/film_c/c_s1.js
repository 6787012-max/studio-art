/* film_c shot 1: where does the sand come from (0 - 36.8 s). ASCII only. */
import { THREE, sm, cl, frac, D2R, V, KT, W, GB, R, B, GH, GX, sky, ease, lin, lerp, lerp3, blinkAt, flags, fs, pose, talkL, talkG, CAMS, PAN, skyTo, show, handPos, walkAlong, fwd } from './c_core.js';
import { terr, sea, foams, birds, rip1, blow1, blow2, dune, tufts, clock, lab, LAB, sparkle, kurkarPiece, mound, heldLime, heldQuartz } from './c_beach.js';
const TERR = W.TERR, PI = Math.PI;

/* shared per-frame beach updates */
export const sandStream = W.makeParticles(70, '#ecd196'); GB.add(sandStream.mesh);
export function beachTick(T, o) {
  o = o || {};
  if (flags.collect) return;
  sea.update(T, o.A); foams.forEach(f => f.update(T, 0.8)); birds.userData.update(T);
  blow1.update(T, o.blow1 == null ? 0.5 : o.blow1); blow2.update(T, o.blow2 == null ? 0 : o.blow2); dune.set(o.dune == null ? 1 : o.dune);
  heldLime.visible = heldQuartz.visible = false; lab.visible = true; kurkarPiece.visible = false; mound.visible = false; tufts.set(false, 1, 0); clock.visible = false; lab.userData.sparks.forEach(s => { s.visible = false; });
}
/* sand pouring from a hand */
export function pour(T, hand, amt, n) {
  const P = sandStream; if (flags.collect) return;
  for (let i = 0; i < P.n; i++) {
    if (i / P.n > amt) { P.hide(i); continue; }
    const u = frac(T * 1.7 + i * 0.6180339), y = hand[1] - 0.5 * 1500 * u * u * 0.55 - 8 * u;
    P.set(i, hand[0] + 6 * Math.sin(i * 7.1) * (0.3 + u) + 4, Math.max(y, 6), hand[2] + 6 * Math.cos(i * 5.3) * (0.3 + u), 2.4 + 1.2 * ((i * 7) % 3) / 2);
  }
  P.commit();
}
const noPour = () => { if (!flags.collect) { sandStream.mesh.visible = true; for (let i = 0; i < sandStream.n; i++) sandStream.hide(i); sandStream.commit(); } };

/* people helpers */
const bFace = (T, st, off) => Object.assign({ expr: 'smile', blink: blinkAt(T, off || 0.6), look: [0, 0] }, st);
const GRAIN_HOME = [0, 0, 0];

export function shot1(lt, T) {
  show(GB, R, B);
  const gold = 1 - ease(lt, 11, 15); skyTo('gold', 'day', 1 - gold);
  beachTick(T, { blow1: lt < 12.3 ? 0.55 : 0.25 });
  let cam, handB = null;
  const PH = (o, x, z, yaw, extra) => pose(o, Object.assign({ t: T, x, z, yaw, walk: 0 }, extra), TERR(x, z));

  if (lt < 4.5) {                                     /* ---- S1a title: calm establishing, the pair strolls along the shore */
    const d = 135 * lt, psi = -0.2, wr = walkAlong(R, -760, 330, psi, d + 90), wb = walkAlong(B, -930, 300, psi, d);
    PH(R, wr.x, wr.z, psi, { walk: 1, ph: wr.ph, headYaw: 0.25 }); PH(B, wb.x, wb.z, psi - 0.45, { walk: 1, ph: wb.ph, headYaw: -0.2 });
    fs(R, { expr: 'smile', blink: blinkAt(T, 0.1), look: [0.4, 0] }); fs(B, bFace(T, { look: [0.4, 0] }, 0.5));
    cam = CAMS(lt, [{ t0: 0, t1: 4.5, p: [-420, 235, 1320], p1: [-230, 222, 1230], l: [-420, 105, 0], l1: [-140, 105, 0], f: 34 }]);
    noPour();
  } else if (lt < 12.27) {
    const yawB = -PI / 2 + 1.0, bx = 80, bz = 430, f = fwd(yawB);
    mound.visible = true; mound.position.set(bx + f[0] * 92, TERR(bx, bz) - 6, bz + f[1] * 92);
    if (lt < 8.5) {                                   /* ---- S1b MS: the boy bends, scoops and lifts a handful */
      const u1 = ease(lt, 4.7, 5.8), u2 = ease(lt, 6.6, 7.8), lean = 36 * u1 * (1 - u2) + 4 * u2;
      const sz = lerp(0.12, 0.62, u1) * (1 - u2) + 0.5 * u2, el = lerp(0.36, 0.2, u1) * (1 - u2) + 0.85 * u2;
      PH(B, bx, bz, yawB, { lean, headTilt: 10 * u2, arms: { r: { sz, sx: 0.12, el, curl: 0.3 + 0.5 * u1 * (1 - u2) } } });
      fs(B, bFace(T, { expr: lt > 7.4 ? 'thinking' : 'smile', look: [0.3, lt > 7.2 ? -0.5 : -0.2] }, 0.6));
      PH(R, bx - 300, bz + 120, -PI / 2 + 0.45, { headYaw: 0.1, headTilt: 4 * Math.sin(T * 1.6) });
      fs(R, { expr: 'smile', blink: blinkAt(T, 0.1), look: [0.3, 0] });
      cam = CAMS(lt, [{ t0: 4.5, t1: 8.5, p: [250, 160, 1250], p1: [210, 150, 1150], l: [bx + 10, 125, bz], f: 32 }]);
      noPour();
    } else {                                          /* ---- S1c CU: the sand runs through the fingers, the grain pops up and waves */
      PH(B, bx, bz, yawB, { lean: 4, headTilt: 10, arms: { r: { sz: 0.5, sx: 0.12, el: 0.85, curl: 0.2 } } });
      fs(B, bFace(T, { expr: lt > 10 ? 'surprised' : 'thinking', look: [0.1, -0.5] }, 0.6));
      PH(R, bx - 300, bz + 120, -PI / 2 + 0.45, { headYaw: 0.1 });
      fs(R, { expr: lt > 10 ? 'laugh' : 'smile', blink: blinkAt(T, 0.1), look: [0.3, 0] });
      B.root.updateMatrixWorld(true); handB = handPos(B, 1);
      pour(T, [handB[0], handB[1] - 4, handB[2]], 1 - ease(lt, 11.4, 12.2));
      show(GH);
      const pop = ease(lt, 9.6, 10.2), wv = Math.sin((lt - 10.2) * 9);
      pose(GH, { t: T, x: handB[0] + 4, y: handB[1] + 6 + 10 * pop, z: handB[2], yaw: yawB, walk: lt > 10.4 ? 1 : 0, ph: (lt - 10.4) * 1.3, hopH: 60, squash: lt > 9.6 && lt < 10.1 ? 0.2 * Math.sin((lt - 9.6) * 6) : 0, shadow: false, tilt: lt > 10.3 ? 10 * wv : 0 });
      if (!flags.collect) GH.root.scale.setScalar(0.001 + 0.33 * pop);
      fs(GH, { expr: lt > 10.6 ? 'cheering' : 'surprised', blink: false, look: [0.2, 0.2] });
      cam = CAMS(lt, [{ t0: 8.5, t1: 12.27, p: [handB[0] + 120, handB[1] + 60, handB[2] + 420], p1: [handB[0] + 80, handB[1] + 70, handB[2] + 340], l: [handB[0] + 6, handB[1] + 70, handB[2]], f: 32 }]);
    }
  } else if (lt < 18.44) {
    noPour();
    if (lt < 13.7) {                                  /* ---- S1d the camera turns east: sea -> land, the pair stands ready (seen from behind) */
      const u = ease(lt, 12.27, 13.5);
      PH(R, -110, 900, -PI / 2, { headYaw: 0.1, arms: { r: { sz: 0.5 + 0.9 * ease(lt, 13.1, 13.7), sx: 0.1, el: 0.2, point: lt > 13.3 } } });
      PH(B, 90, 880, -PI / 2 + 0.1, { headYaw: -0.15 });
      fs(R, { expr: 'explaining', talk: talkL(lt, 12.5, 13.7), blink: blinkAt(T, 0.1), look: [0.2, 0] }); fs(B, bFace(T, {}, 0.5));
      const c = PAN([-30, 190, 150], 0.72 * PI, PI, u, 150 + 40 * u, 1600); cam = { p: c.p, l: c.l, fov: 32 };
    } else {
      const d = lin(lt, 13.7, 17.0) * 560, hold = lt > 17.0, dd = hold ? 560 : d;
      const wr = walkAlong(R, -120, 900, -PI / 2, dd), wb = walkAlong(B, 80, 860, -PI / 2, dd);
      if (lt < 17.0) {
        PH(R, wr.x, wr.z, -PI / 2, { walk: 1, ph: wr.ph, headYaw: 0.35 * Math.sin(T * 0.9), arms: { r: { sz: 1.35, sx: 0.1, el: 0.2, point: true } } });
        PH(B, wb.x, wb.z, -PI / 2 + 0.2, { walk: 1, ph: wb.ph + 0.3, headYaw: -0.2 });
        fs(R, { expr: 'explaining', talk: talkL(lt, 13.7, 16.5), blink: blinkAt(T, 0.1), look: [0.3, 0.1] }); fs(B, bFace(T, { look: [0.3, 0.2] }, 0.5));
        const cz = wr.z - 560 + 15 * Math.sin(lt);
        cam = CAMS(lt, [{ t0: 13.7, t1: 17.0, lin: true, p: [330, 175, wr.z - 520], p1: [330, 175, wr.z - 520 + 560 * 0.0], l: [-20, 150, wr.z + 380], f: 33 }]);
        cam.p = [300 + 40 * Math.sin(lt * 0.4), 170, wr.z - 560]; cam.l = [-20, 160, wr.z + 420];
      } else {                                        /* ---- S1f they arrive: turn toward us, the white hills behind them */
        const tu = ease(lt, 17.0, 17.7), z1 = 900 + 560, yawR = lerp(-PI / 2, 0.5, tu), yawB = lerp(-PI / 2 + 0.2, 0.3, tu);
        PH(R, wr.x, z1 + 10, yawR, { headYaw: 0.1, arms: { r: { sz: lerp(1.35, -0.9, tu), sx: 0.2, el: 0.3, point: true } } });
        PH(B, wb.x + 50, z1 - 40, yawB, { headYaw: -0.15, headTilt: 3 });
        fs(R, { expr: 'explaining', talk: talkL(lt, 17.3, 18.4), blink: blinkAt(T, 0.1), look: [0.3, 0] }); fs(B, bFace(T, { expr: 'smile', look: [-0.3, 0.2] }, 0.5));
        cam = CAMS(lt, [{ t0: 17.0, t1: 18.44, p: [760, 190, z1 - 560], p1: [700, 185, z1 - 520], l: [0, 190, z1 + 20], f: 34 }]);
      }
    }
  } else if (lt < 29.43) {                            /* ---- c3: MCU - the rabbi holds white limestone and sparkling quartz, the boy leans in; inserts on each */
    noPour(); lab.visible = false;
    const { x, y, z } = LAB, rx = x - 20, rz = z + 300, k = lt - 18.44, up = ease(k, 0.4, 1.4);
    show(GH, R, B);
    const hold = { sz: 0.3 + 0.06 * Math.sin(T * 1.3), sx: 0.85, el: 0.75, curl: 0.7 };
    PH(R, rx, rz, -PI / 2 + 0.3, { headYaw: -0.1, headTilt: 3, arms: { l: Object.assign({}, hold), r: Object.assign({}, hold, { sz: 0.3 - 0.06 * Math.sin(T * 1.3) }) } });
    fs(R, { expr: 'explaining', talk: talkL(lt, 19, 21.8) || talkL(lt, 27.8, 29.2), blink: blinkAt(T, 0.1), look: [0.2, -0.2] });
    PH(B, rx + 190, rz - 20, -PI / 2 - 0.5, { lean: 14, headTilt: 10, headYaw: 0.15 });
    fs(B, bFace(T, { expr: lt < 22 ? 'thinking' : 'surprised', look: [-0.5, -0.2] }, 0.4));
    R.root.updateMatrixWorld(true); const hl = handPos(R, 0), hr = handPos(R, 1);
    if (!flags.collect) { heldLime.visible = true; heldLime.position.set(hl[0] + 4, hl[1] + 14, hl[2] + 6); heldLime.rotation.y = T * 0.3;
      heldQuartz.visible = true; heldQuartz.position.set(hr[0] + 4, hr[1] + 8, hr[2] + 6); heldQuartz.rotation.y = -0.4; }
    const ins = lt >= 22.0 && lt < 27.6, onLime = lt < 25.0;
    const fx = ins ? (onLime ? hl : hr) : hl;
    pose(GH, { t: T, x: ins ? fx[0] - 100 : rx + 60, y: ins ? fx[1] - 70 : TERR(rx + 60, rz + 110), z: ins ? fx[2] + 30 : rz + 110, yaw: -PI / 2 + 0.3, walk: 0, shadow: !ins }); GH.root.scale.setScalar(ins ? 0.42 : 0.5);
    fs(GH, { expr: onLime && ins ? 'curious' : 'happy', blink: blinkAt(T, 0.3), look: [0.5, 0.3] });
    if (lt >= 25.0) sparkle(lab, hr[0], hr[1] + 40, hr[2], T, 1, 0.8);
    if (lt >= 27.6) sparkle(lab, rx + 60, TERR(rx + 60, rz + 110) + 90, rz + 110, T, 1, 0.7);
    if (!ins) cam = CAMS(lt, [{ t0: 18.44, t1: 22.0, p: [x + 50, y + 170, rz + 760], p1: [x + 60, y + 165, rz + 650], l: [x + 60, y + 150, rz], f: 32 }, { t0: 27.6, t1: 29.43, p: [x + 60, y + 170, rz + 700], p1: [x + 60, y + 165, rz + 620], l: [x + 60, y + 150, rz], f: 32 }]);
    else if (onLime) cam = CAMS(lt, [{ t0: 22.0, t1: 25.0, p: [hl[0] + 80, hl[1] + 30, hl[2] + 330], p1: [hl[0] + 50, hl[1] + 25, hl[2] + 250], l: [hl[0] - 30, hl[1] - 15, hl[2]], f: 32 }]);
    else cam = CAMS(lt, [{ t0: 25.0, t1: 27.6, p: [hr[0] - 100, hr[1] + 30, hr[2] + 330], p1: [hr[0] - 60, hr[1] + 25, hr[2] + 250], l: [hr[0] - 40, hr[1] - 15, hr[2]], f: 32 }]);
  } else {                                            /* ---- c4: not from our mountains! the grain shakes its head, the boy shrugs, the rabbi unrolls the map */
    noPour(); lab.visible = false;
    const { x, y, z } = LAB, k = lt - 29.43;
    show(GH, R, B);
    const sh = k > 0.5 && k < 2.6 ? 14 * Math.sin((k - 0.5) * 13) * (1 - ease(k, 2.0, 2.6)) : 0;
    pose(GH, { t: T, x: x, z: z + 130, y: y + 22, yaw: -PI / 2 + 0.25, walk: 0, tilt: sh, shadow: true });
    GH.root.scale.setScalar(0.55);
    fs(GH, { expr: k < 3.2 ? 'worried' : 'happy', blink: blinkAt(T, 0.3), look: [-0.5, 0.1] });
    const sr = ease(k, 2.8, 3.6), sw = ease(k, 4.6, 5.4), shr = ease(k, 1, 1.5) * (1 - ease(k, 3, 3.6));
    PH(B, x + 300, z + 100, -PI / 2 - 0.35, { headTilt: 6 * Math.sin(k * 3) * (k > 1 && k < 2.6 ? 1 : 0), arms: { l: { sz: 0.3, sx: 0.7 * shr, el: 1.2 * shr + 0.3 }, r: { sz: 0.3, sx: 0.7 * shr, el: 1.2 * shr + 0.3 } } });
    fs(B, bFace(T, { expr: k < 3 ? 'worried' : 'smile', look: [-0.3, 0.1] }, 0.4));
    PH(R, x - 300, z + 110, -PI / 2 + 0.35, { headYaw: 0, arms: { r: { sz: 0.6 + 0.5 * sr, sx: 0.2, el: 1.3 - 0.4 * sr, curl: 0.9 }, l: { sz: 0.2, sx: 0.2, el: 0.5 } } });
    fs(R, { expr: k < 2.8 ? 'smile' : 'explaining', talk: talkL(lt, 33, 35.6), blink: blinkAt(T, 0.1), look: [0.1, 0] });
    if (!flags.collect) {
      const sc = scrollClosed(), so = scrollOpen(); R.root.updateMatrixWorld(true); const h = handPos(R, 1);
      sc.visible = k >= 2.6 && k < 4.6; so.visible = k >= 4.6;
      sc.position.set(h[0] + 16, h[1] + 4, h[2] + 10); sc.rotation.set(0, -PI / 2 + 0.35, 0.3); sc.scale.setScalar(2.0);
      so.position.set(x - 300 + 120, y + 150, z + 150); so.rotation.set(0, PI / 2, 0); so.scale.set(2.1, 2.1, 0.3 + 1.8 * sw);
    }
    cam = CAMS(lt, [{ t0: 29.43, t1: 32.4, p: [x + 20, y + 140, z + 1000], p1: [x + 10, y + 140, z + 880], l: [x, y + 130, z + 60], f: 32 },
      { t0: 32.4, t1: 36.8, p: [x - 100, y + 170, z + 760], p1: [x - 150, y + 180, z + 640], l: [x - 200, y + 150, z + 110], l1: [x - 190, y + 150, z + 110], f: 32 }]);
  }
  return cam;
}
let _sc = null, _so = null;
function scrollClosed() { if (!_sc) { _sc = KT.makeMapScroll(false); GB.add(_sc); } return _sc; }
function scrollOpen() { if (!_so) { _so = KT.makeMapScroll(true); GB.add(_so); } return _so; }
export const scrolls = () => [scrollClosed(), scrollOpen()];
