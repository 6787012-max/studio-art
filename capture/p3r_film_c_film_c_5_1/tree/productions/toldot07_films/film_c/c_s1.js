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

const titleGrass = (() => { const g = W.G(GB); [[-930, 1330, 2.4], [-620, 1290, 2.0], [-300, 1360, 2.6], [-60, 1300, 2.1]].forEach(([x, z, k], i) => { const t = KT.makeGrassTuft(i + 510, { col: '#8fae56', h: 60, n: 9 }); t.position.set(x, TERR(x, z), z); t.scale.setScalar(k); g.add(t); }); g.visible = false; return g; })();
/* footprints of the walk (c2) */
const prints = W.makeParticles(80, '#b99556', new THREE.SphereGeometry(1, 6, 4).scale(0.55, 0.12, 1)); GB.add(prints.mesh);
export const s1Off = () => { titleGrass.visible = false; prints.mesh.visible = false; };
export function shot1(lt, T) {
  show(GB, R, B); titleGrass.visible = false; prints.mesh.visible = false;
  const gold = 1 - ease(lt, 11, 15); skyTo('gold', 'day', 1 - gold);
  beachTick(T, { blow1: lt < 12.3 ? 0.55 : 0.25 });
  lab.visible = false;
  let cam, handB = null;
  const PH = (o, x, z, yaw, extra) => pose(o, Object.assign({ t: T, x, z, yaw, walk: 0 }, extra), TERR(x, z));

  if (lt < 4.5) {                                     /* ---- S1a title: calm establishing, the pair strolls along the shore */
    const d = 135 * lt, psi = -0.2, wr = walkAlong(R, -760, 330, psi, d + 90), wb = walkAlong(B, -930, 300, psi, d);
    PH(R, wr.x, wr.z, psi, { walk: 1, ph: wr.ph, headYaw: 0.25 }); PH(B, wb.x, wb.z, psi - 0.45, { walk: 1, ph: wb.ph, headYaw: -0.2 });
    fs(R, { expr: 'smile', blink: blinkAt(T, 0.1), look: [0.4, 0] }); fs(B, bFace(T, { look: [0.4, 0] }, 0.5));
    const lx = -1040 + 119 * lt; cam = { p: [lx, 238, 1700], l: [lx, 118, 0], fov: 34 };
    titleGrass.visible = true;
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
    {
      const u = lin(lt, 12.27, 17.0), dd = 900 * (u * u * (3 - 2 * u));
      const wr = walkAlong(R, -120, 560, -PI / 2, dd), wb = walkAlong(B, 80, 540, -PI / 2, dd);
      prints.mesh.visible = true;
      for (let i = 0; i < prints.n; i++) { const k = Math.floor(i / 2), side = i % 2, d = 18 + k * 36; if (d > dd - 40) { prints.hide(i); continue; }
        const x = side ? -120 + 14 * (k % 2 ? 1 : -1) : 80 + 14 * (k % 2 ? 1 : -1), z = (side ? 560 : 540) + d; prints.set(i, x, TERR(x, z) + 2.4, z, 13); }
      prints.commit();
      if (lt < 17.0) {
        PH(R, wr.x, wr.z, -PI / 2, { walk: 1, ph: wr.ph, headYaw: 0.35 * Math.sin(T * 0.9), arms: { r: { sz: 1.35, sx: 0.1, el: 0.2, point: true } } });
        PH(B, wb.x, wb.z, -PI / 2 + 0.2, { walk: 1, ph: wb.ph + 0.3, headYaw: -0.2 });
        fs(R, { expr: 'explaining', talk: talkL(lt, 12.5, 16.5), blink: blinkAt(T, 0.1), look: [0.3, 0.1] }); fs(B, bFace(T, { look: [0.3, 0.2] }, 0.5));
        if (lt < 14.9) cam = { p: [620 - 40 * (lt - 12.27), 300, -330], l: [-20, 140, 900 + 60 * (lt - 12.27)], fov: 34 };
        else cam = { p: [820, 215, wr.z + 640], l: [-10, 165, wr.z - 20], fov: 34 };
      } else {                                        /* ---- S1f they arrive: turn toward us, the white hills behind them */
        const tu = ease(lt, 17.0, 17.7), z1 = 900 + 560, yawR = lerp(-PI / 2, 0.5, tu), yawB = lerp(-PI / 2 + 0.2, 0.3, tu);
        PH(R, wr.x, z1 + 10, yawR, { headYaw: 0.1, arms: { r: { sz: lerp(1.35, -0.9, tu), sx: 0.2, el: 0.3, point: true } } });
        PH(B, wb.x + 50, z1 - 40, yawB, { headYaw: -0.15, headTilt: 3 });
        fs(R, { expr: 'explaining', talk: talkL(lt, 17.3, 18.4), blink: blinkAt(T, 0.1), look: [0.3, 0] }); fs(B, bFace(T, { expr: 'smile', look: [-0.3, 0.2] }, 0.5));
        cam = CAMS(lt, [{ t0: 17.0, t1: 18.44, p: [900, 220, z1 - 760], p1: [850, 215, z1 - 720], l: [0, 170, z1 + 20], f: 34 }]);
      }
    }
  } else if (lt < 29.43) {                            /* ---- c3: MCU of the pair with both stones; inserts: chalky limestone, then the sparkling quartz */
    noPour();
    const { x, y, z } = LAB, rx = x - 20, rz = z + 300, k = lt - 18.44;
    show(GH);
    const ins = lt >= 22.0 && lt < 27.6;
    lab.visible = ins;
    if (!ins) {
      show(R, B);
      const hold = { sz: 0.3 + 0.06 * Math.sin(T * 1.3), sx: 0.85, el: 0.75, curl: 0.7 };
      PH(R, rx, rz, -PI / 2 + 0.3, { headYaw: -0.1, headTilt: 3, arms: { l: Object.assign({}, hold), r: Object.assign({}, hold, { sz: 0.3 - 0.06 * Math.sin(T * 1.3) }) } });
      fs(R, { expr: 'explaining', talk: talkL(lt, 19, 21.8) || talkL(lt, 27.8, 29.2), blink: blinkAt(T, 0.1), look: [0.2, -0.2] });
      PH(B, rx + 250, rz - 20, -PI / 2 - 0.5, { lean: 10, headTilt: 8, headYaw: 0.15 });
      fs(B, bFace(T, { expr: lt < 22 ? 'thinking' : 'surprised', look: [-0.5, -0.2] }, 0.4));
      R.root.updateMatrixWorld(true); const hl = handPos(R, 0), hr = handPos(R, 1);
      if (!flags.collect) { heldLime.visible = true; heldLime.position.set(hl[0] + 4, hl[1] + 14, hl[2] + 6); heldLime.rotation.y = T * 0.3;
        heldQuartz.visible = true; heldQuartz.position.set(hr[0] + 4, hr[1] + 8, hr[2] + 6); heldQuartz.rotation.y = -0.4; }
      pose(GH, { t: T, x: rx + 110, z: rz + 120, y: TERR(rx + 110, rz + 120), yaw: -PI / 2 + 0.3, walk: 0, shadow: true }); GH.root.scale.setScalar(0.5);
      fs(GH, { expr: 'happy', blink: blinkAt(T, 0.3), look: [0.5, 0.3] });
      if (lt >= 27.6) sparkle(lab, hr[0], hr[1] + 40, hr[2], T, 1, 0.8);
      cam = CAMS(lt, [{ t0: 18.44, t1: 22.0, p: [x + 70, y + 190, rz + 880], p1: [x + 80, y + 185, rz + 800], l: [x + 70, y + 150, rz], f: 32 }, { t0: 27.6, t1: 29.43, p: [x + 80, y + 190, rz + 840], p1: [x + 80, y + 185, rz + 780], l: [x + 70, y + 150, rz], f: 32 }]);
    } else {
      R.root.visible = false; B.root.visible = false;
      const lime = lt < 24.6, q = [x + 120, y + 110, z];
      const gxx = lime ? x + 10 : x + 20;
      pose(GH, { t: T, x: gxx, z: z + 80, y: y + 44, yaw: -PI / 2 + 0.25, walk: 0, shadow: false, squash: 0.03 * Math.sin(T * 3) }); GH.root.scale.setScalar(0.4);
      fs(GH, { expr: lime ? 'curious' : 'cheering', blink: blinkAt(T, 0.3), look: [0.5, 0.3] });
      if (!lime) sparkle(lab, q[0], q[1], q[2] + 40, T, 1, 1.5);
      else sparkle(lab, x - 120, y + 90, z + 20, T, 0.0, 0.5);
      const u = ease(lt, 24.0, 25.2);
      cam = { p: [lerp(x - 30, x + 60, u), y + lerp(130, 150, u), z + lerp(560, 620, u)], l: [lerp(x - 70, x + 70, u), y + lerp(80, 105, u), z], fov: 32 };
    }
  } else {                                            /* ---- c4: not from our mountains! the grain shakes its head, the boy shrugs, the rabbi unrolls the map */
    noPour(); lab.visible = false;
    const { x, y, z } = LAB, k = lt - 29.43;
    show(GH, R, B);
    const sh = k > 0.5 && k < 2.6 ? 14 * Math.sin((k - 0.5) * 13) * (1 - ease(k, 2.0, 2.6)) : 0;
    pose(GH, { t: T, x: x + 20, z: z + 110, y: y + 22, yaw: -PI / 2 + 0.25, walk: 0, tilt: sh, shadow: true }, undefined);
    GH.root.scale.setScalar(0.5);
    fs(GH, { expr: k < 3.2 ? 'worried' : 'happy', blink: blinkAt(T, 0.3), look: [-0.5, 0.1] });
    const sr = ease(k, 2.8, 3.6), sw = ease(k, 4.6, 5.4), shr = ease(k, 1, 1.5) * (1 - ease(k, 3, 3.6));
    PH(B, x + 240, z + 80, -PI / 2 - 0.35, { headTilt: 6 * Math.sin(k * 3) * (k > 1 && k < 2.6 ? 1 : 0), arms: { l: { sz: 0.3, sx: 0.7 * shr, el: 1.2 * shr + 0.3 }, r: { sz: 0.3, sx: 0.7 * shr, el: 1.2 * shr + 0.3 } } });
    fs(B, bFace(T, { expr: k < 3 ? 'worried' : 'smile', look: [-0.3, 0.1] }, 0.4));
    PH(R, x - 230, z + 100, -PI / 2 + 0.35, { headYaw: 0, arms: { r: { sz: 0.6 + 0.1 * sr - 0.1 * ease(k, 4.4, 4.8), sx: 0.2 + 0.3 * ease(k, 4.4, 4.8), el: 1.3 - 0.3 * sr - 0.1 * ease(k, 4.4, 4.8), curl: 0.9 }, l: { sz: 0.2 + 0.4 * ease(k, 4.4, 4.8), sx: 0.2 + 0.3 * ease(k, 4.4, 4.8), el: 0.5 + 0.6 * ease(k, 4.4, 4.8) } } });
    fs(R, { expr: k < 2.8 ? 'smile' : 'explaining', talk: talkL(lt, 33, 35.6), blink: blinkAt(T, 0.1), look: [0.1, 0] });
    if (!flags.collect) {
      const sc = scrollClosed(), so = scrollOpen(); R.root.updateMatrixWorld(true); const h = handPos(R, 1), hl2 = handPos(R, 0);
      sc.visible = k >= 2.6 && k < 4.6; so.visible = k >= 4.6;
      sc.position.set(h[0] + 10, h[1] + 4, h[2] + 14); sc.rotation.set(0, 0.25, 0.12); sc.scale.setScalar(1.7);
      const mx = (h[0] + hl2[0]) / 2, my = (h[1] + hl2[1]) / 2, mz = (h[2] + hl2[2]) / 2;
      so.position.set(mx, my - 34, mz + 20); so.rotation.set(0, 0.2, 0); so.scale.set(Math.max(0.05, 0.62 * (0.35 + 0.65 * sw)), 0.62, 1);
    }
    cam = CAMS(lt, [{ t0: 29.43, t1: 32.4, p: [x + 10, y + 190, z + 1180], p1: [x + 10, y + 185, z + 1060], l: [x + 10, y + 130, z + 60], f: 32 },
      { t0: 32.4, t1: 36.8, p: [x - 40, y + 190, z + 960], p1: [x - 60, y + 185, z + 880], l: [x - 60, y + 135, z + 60], f: 32 }]);
  }
  return cam;
}
let _sc = null, _so = null;
function scrollClosed() { if (!_sc) { _sc = KT.makeMapScroll(false); GB.add(_sc); } return _sc; }
function scrollOpen() { if (!_so) { _so = makeNileScroll(); GB.add(_so); } return _so; }
function makeNileScroll() {
  const g = new THREE.Group(), cv = document.createElement('canvas'); cv.width = 512; cv.height = 360; const c = cv.getContext('2d');
  c.fillStyle = '#f3e4bb'; c.fillRect(0, 0, 512, 360);
  c.fillStyle = '#e7cf93'; c.fillRect(0, 150, 512, 210);                                   // desert
  c.fillStyle = '#6fb7e6'; c.beginPath(); c.moveTo(0, 0); c.lineTo(512, 0); c.lineTo(512, 120); for (let x = 512; x >= 0; x -= 16) c.lineTo(x, 112 + 10 * Math.sin(x * 0.03) + (x < 300 ? 0 : (x - 300) * 0.25)); c.closePath(); c.fill();
  c.fillStyle = '#9bd0f0'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(60 + i * 80, 40 + (i % 2) * 24, 22, 4, 0, 0, 7); c.fill(); }
  c.strokeStyle = '#4f9fe0'; c.lineWidth = 24; c.lineCap = 'round'; c.lineJoin = 'round';                 // the Nile, south to the delta
  const nile = [[250, 360], [235, 300], [270, 240], [248, 190], [256, 150], [258, 128]];
  c.strokeStyle = '#6aa84f'; c.lineWidth = 46; c.beginPath(); nile.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
  c.strokeStyle = '#4f9fe0'; c.lineWidth = 20; c.beginPath(); nile.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
  c.lineWidth = 12; [[-70, 0], [-34, 12], [0, 18], [36, 12], [70, 0]].forEach(([dx, dy]) => { c.strokeStyle = '#4f9fe0'; c.beginPath(); c.moveTo(258, 130); c.lineTo(258 + dx, 108 + dy); c.stroke(); c.strokeStyle = '#6aa84f'; });
  c.fillStyle = '#a9835a'; [[110, 330, 46], [160, 345, 36], [380, 335, 50], [330, 350, 34]].forEach(([mx, my, r]) => { c.beginPath(); c.moveTo(mx - r, my + 30); c.lineTo(mx, my - r * 0.9); c.lineTo(mx + r, my + 30); c.closePath(); c.fill(); });
  c.fillStyle = '#f7f4ec'; [[110, 330, 46], [380, 335, 50]].forEach(([mx, my, r]) => { c.beginPath(); c.moveTo(mx - r * 0.3, my - r * 0.6); c.lineTo(mx, my - r * 0.9); c.lineTo(mx + r * 0.3, my - r * 0.6); c.closePath(); c.fill(); });
  c.fillStyle = '#e9c987'; c.strokeStyle = '#261c19'; c.lineWidth = 3; c.beginPath(); c.arc(440, 120, 15, 0, 7); c.fill(); c.stroke();        // a grain at the Israeli coast
  c.strokeStyle = '#261c19'; c.lineWidth = 8; c.strokeRect(4, 4, 504, 352);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(190, 133), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); g.add(pl);
  const wood = KT.M('#8a5a3a', '#b08a7a');
  [-1, 1].forEach(sg => { const r = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 206, 14).rotateZ(Math.PI / 2), wood); r.position.set(0, sg * 69, 3); g.add(r); });
  g.visible = false; return g;
}
export const scrolls = () => [scrollClosed(), scrollOpen()];
