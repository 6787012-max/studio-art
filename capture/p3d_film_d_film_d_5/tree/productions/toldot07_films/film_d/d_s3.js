/* film_d shot 3: Yafo and the cedars (81.4 - 136.3 s). ASCII only. */
import { THREE, sm, cl, frac, V, KT, part, ell, M, box, rng, G, col, GY, GN, GJ, GI, R, B, TI, GULLS, ease, lin, lerp, lerp3, blinkAt, flags, fs, pose, talkL, CAMS, skyTo, show, bFace, rFace, POST, cam, sky, makeSparkle, hullGeo } from './d_core.js';
import { HY, ysea, yTick, yQuay, yShips, yRocks, makeRope, setRope, HN, makeCedar, crown, XR, HJ, city, jTerr } from './d_w2.js';
import { seferRoom, seferTick } from './d_w3.js';
import { crateRoom } from './d_w4.js';
import { gullFly } from './d_s1.js';
const PI = Math.PI;

const rsplash = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const s = KT.makeSplash({ r: 70 + (i % 3) * 14 }); s.visible = false; GY.add(s); return s; });
const hero = [[-520, 800, 2.0], [560, 860, 2.2], [160, 1280, 1.7], [-320, 1650, 1.9], [760, 1500, 1.5], [-880, 1200, 1.6]].map(([x, z, s], i) => { const c = makeCedar(i + 300, s); c.position.set(x, HN(x, z) - 6, z); GN.add(c); return c; });
const crownSp = [0, 1, 2, 3, 4, 5].map(() => { const s = makeSparkle(70, '#fff4c0'); s.visible = false; GN.add(s); return s; });
const hook = (() => { const r = makeRope(GY, 2.4, '#6a4a2a'); return r; })();
const raftG = (() => { const g = G(GY), lm = [toon0('#8a5a3a'), M('#e3b77d', '#c9a080', 0)], rp = M('#c9a46a', '#b08a7a', 0);
  for (let layer = 0; layer < 2; layer++) for (let i = 0; i < (layer ? 5 : 6); i++) part(g, new THREE.CylinderGeometry(17, 17, 400, 14).rotateZ(Math.PI / 2), lm[(i + layer) % 2], 2.2, [0, 20 + layer * 30, (i - (layer ? 2 : 2.5)) * 34]);
  for (const x of [-130, 0, 130]) part(g, new THREE.BoxGeometry(14, 10, 190), rp, 1.4, [x, 52, 0]);
  g.visible = false; return g;
  function toon0(c) { return M(c, '#b08a7a'); } })();
const cartG = [0, 1, 2].map(i => { const g = G(GJ), wood = M('#9a6a3e', '#7a5a3a'), dk = M('#5a3a22', '#7a5a3a'); box(g, 190, 18, 112, wood, [0, 56, 0], 2.2, null, 2);
  const wheels = [[-60, 64], [-60, -64], [60, 64], [60, -64]].map(([x, z]) => { const w = G(g, [x, 42, z]); part(w, new THREE.CylinderGeometry(42, 42, 12, 18).rotateX(Math.PI / 2), dk, 2.2); for (let k = 0; k < 3; k++) part(w, new THREE.BoxGeometry(80, 6, 14), wood, 1.2, [0, 0, 0], [0, 0, k * Math.PI / 3]); return w; });
  for (let k = 0; k < 3; k++) part(g, new THREE.CylinderGeometry(15, 15, 250, 14).rotateZ(Math.PI / 2), k % 2 ? M('#e3b77d', '#c9a080', 0) : M('#8a5a3a', '#b08a7a'), 2.2, [10, 85 + (k === 2 ? 26 : 0), k === 2 ? 0 : (k ? 17 : -17)]);
  box(g, 90, 6, 6, wood, [150, 56, 0], 1.4); g.userData.wheels = wheels; g.rotation.order = 'YXZ'; g.visible = false; return g; });
const ropes = [0, 1, 2].map(() => makeRope(GJ, 2.6, '#6a4a2a'));
function setAS(s, x, z, yaw, sc, roll, dy) { if (flags.collect) return; const f = ysea.float(x, z, 100); s.visible = true; s.scale.setScalar(sc); s.position.set(x, f.y - 12 * sc + (dy || 0), z); s.rotation.order = 'YXZ'; s.rotation.set(f.rx * 0.5 + (roll || 0), yaw, f.rz * 0.5); }
const gy = (x, z) => HY(x, z);

export function shot3(lt, T) {
  /* ---------------------------------------------------------- c1 / c2 / c3 in Yafo */
  if (lt < 27.88 && !(lt >= 22.7 && lt < 25.4)) {
    show(GY, R, B); yRocks.visible = lt < 18.72 && lt >= 7.84; yShips.forEach(s => { s.visible = false; }); yQuay.userData.crate.visible = false; yQuay.userData.hook.visible = false; hook.visible = false; raftG.visible = false; rsplash.forEach(s => { s.visible = false; });
    skyTo('gold'); yTick(T); const A = lt >= 7.84 && lt < 18.72 ? 24 : 14; if (!flags.collect) ysea.update(T, A);
    yShips[0].userData.update(T); yShips[2].userData.update(T + 1);
    let cm;
    if (lt < 7.84) {                                                 /* c1: ancient Yafo, ships under tan sails */
      setAS(yShips[0], -470 + lt * 18, -420 + lt * 5, 0.15, 0.55, 0.02 * Math.sin(T)); setAS(yShips[2], 40 + lt * 12, -340, 0.3, 0.47, 0.02 * Math.sin(T * 0.8)); setAS(yShips[1], 5000, -3000, -0.2, 0.55, 0.02);
      yShips[0].userData.update(T); yShips[1].userData.update(T + 3);
      gullFly(GULLS[0], T, 200, -500, 600, 480, 0, 0.35); gullFly(GULLS[1], T, -300, -700, 500, 540, 2, 0.4);
      R.root.visible = B.root.visible = false;
      if (lt < 4.4) cm = CAMS(lt, [{ t0: 0, t1: 4.4, p: [-760, 150, -1250], p1: [-440, 175, -1050], l: [380, 300, 900], l1: [340, 310, 900], f: 32 }]);
      else {
        R.root.visible = B.root.visible = true;
        pose(R, { t: T, x: -520, z: 100, yaw: 1.55, walk: 0, headYaw: -0.1, arms: { r: { sz: 1.15, sx: 0.2, el: 0.3, point: true } } }, 42); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 4.8, 7.6), look: [0.4, 0.3] }));
        pose(B, { t: T, x: -270, z: 150, yaw: 1.8, walk: 0, headYaw: -0.1, headTilt: 3 * Math.sin(T * 1.3) }, 42); fs(B, bFace(T, { expr: 'smile', look: [0.5, 0.3] }));
        cm = CAMS(lt, [{ t0: 4.4, t1: 7.84, p: [130, 235, -700], p1: [100, 238, -670], l: [-395, 200, 125], f: 31 }]);
      }
      return cm;
    }
    if (lt < 18.72) {                                                /* c2: a natural row of rocks, calm behind it */
      setAS(yShips[2], 380, -300, 0.35, 0.5, 0.012 * Math.sin(T * 0.9)); yShips[2].userData.update(T + 1);
      rsplash.forEach((s, i) => { const xs = [-1500, -1200, -950, -640, -420, 360, 640, 1180][i], u = frac(T * 0.45 + i * 0.29); s.visible = true; s.position.set(xs, 6, -600 + 20 * Math.sin(i)); s.scale.setScalar(0.9); s.userData.update(u); });
      gullFly(GULLS[0], T, 100, -300, 700, 520, 1, 0.4);
      if (lt < 12.6) {
        R.root.visible = B.root.visible = false;
        cm = CAMS(lt, [{ t0: 7.84, t1: 12.6, p: [-2250, 150, -280], p1: [-2100, 160, -300], l: [-300, 70, -520], l1: [-100, 70, -540], f: 34 }]);
      } else {
        const px = -260, pz = 40;
        pose(R, { t: T, x: px, z: pz, yaw: PI / 2 - 0.3, walk: 0, headYaw: 0.1, arms: { r: { sz: 1.2, sx: 0.12, el: 0.25, point: true } } }, gy(px, pz)); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 13, 17.5), look: [0.2, 0.2] }));
        pose(B, { t: T, x: px + 300, z: pz + 30, yaw: PI / 2 + 0.3, walk: 0, headTilt: 4 * Math.sin(T * 1.5), arms: { l: { sz: 0.3, sx: 0.6, el: 1.4 }, r: { sz: 0.3, sx: 0.6, el: 1.4 } } }, gy(px + 140, pz + 30)); fs(B, bFace(T, { expr: 'surprised', look: [0.1, 0.2] }));
        cm = CAMS(lt, [{ t0: 12.6, t1: 18.72, p: [-105, 430, -1150], p1: [-105, 425, -1120], l: [-105, 175, 45], l1: [-105, 175, 45], f: 31 }]);
      }
      return cm;
    }
    /* c3 a: the derrick loads the ship at the quay; c: it sets sail */
    const q = yQuay.userData, A0 = PI / 2 + 2.2;
    R.root.visible = B.root.visible = false;
    if (lt < 22.7) {
      const k = lt - 18.72, per = 3.0, ph = frac(k / per), pick = [330 + Math.cos(A0) * 143, 62, 40 - Math.sin(A0) * 143];
      const ang = lerp(A0, PI / 2, ease(ph, 0.3, 0.7)), boomA = ph < 0.3 ? A0 : (ph < 0.7 ? ang : PI / 2), len = 143;
      q.boom.rotation.y = boomA; const tip = [330 + Math.cos(boomA) * len, 511, 40 - Math.sin(boomA) * len];
      const cy = ph < 0.2 ? lerp(62, 62, 0) : (ph < 0.3 ? lerp(62, 200, ease(ph, 0.2, 0.3)) : (ph < 0.7 ? 200 : lerp(200, 100, ease(ph, 0.7, 0.9)))); const cx = tip[0], cz = tip[2];
      q.crate.visible = ph < 0.92; q.crate.position.set(ph < 0.2 ? pick[0] : cx, cy, ph < 0.2 ? pick[2] : cz); setRope(q.hook, [tip[0], tip[1], tip[2]], [q.crate.position.x, cy + 20, q.crate.position.z]); q.hook.visible = true;
      setAS(yShips[0], 150, -88, 0, 0.85, 0.01 * Math.sin(T * 1.2)); yShips[0].userData.update(T);
      cm = CAMS(lt, [{ t0: 18.72, t1: 22.7, p: [-300, 210, -1050], p1: [-200, 215, -1000], l: [230, 130, -60], l1: [220, 135, -60], f: 34 }]);
      return cm;
    }
    const k = lt - 25.4, go = ease(k, 0.2, 2.4), tu = ease(k, 0.0, 1.0);
    setAS(yShips[0], 150 - 270 * go, -88 - 640 * go, lerp(0, PI / 2, tu), 0.85, 0.02 * Math.sin(T * 1.3)); yShips[0].userData.update(T);
    gullFly(GULLS[0], T, 100, -400 - 500 * go, 450, 420, 0, 0.5);
    return CAMS(lt, [{ t0: 25.4, t1: 27.88, p: [820, 190, 60], p1: [760, 200, -60], l: [20, 120, -320], l1: [-80, 120, -560], f: 36 }]);
  }
  /* ---------------------------------------------------------- c3 b: the sefer insert */
  if (lt < 25.4) {
    show(GI); seferRoom.visible = true; crateRoom.visible = false; const k = lt - 22.7, glow = ease(k, 0.2, 1.4); seferTick(T, glow);
    return CAMS(lt, [{ t0: 22.7, t1: 25.4, p: [150, 350, 330], p1: [90, 335, 250], l: [0, 325, 0], l1: [0, 325, 0], f: 30 }]);
  }
  /* ---------------------------------------------------------- c4: the cedars of Lebanon, the crown icon */
  if (lt < 37.04) {
    show(GN, R, B); skyTo('clear'); crown.visible = false; crown.userData.halo.visible = false; crownSp.forEach(s => { s.visible = false; });
    const k = lt - 27.88;
    if (!flags.collect) hero.forEach(c => { c.rotation.z = 0.01 * Math.sin(T * 0.8 + c.position.x); });
    let cm;
    const rp = [-120, 560], bp = [90, 610];
    if (lt < 31.5) {
      pose(R, { t: T, x: rp[0], z: rp[1], yaw: PI / 2 - 0.9, walk: 0, headYaw: 0.1, headRot: -14, arms: { r: { sz: 0.9, sx: 0.4, el: 0.5, curl: 0.8 } } }, HN(rp[0], rp[1])); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 28.4, 31.3), look: [0.3, -0.5] }));
      pose(B, { t: T, x: bp[0], z: bp[1], yaw: PI / 2 - 0.55, walk: 0, headRot: -18, arms: {} }, HN(bp[0], bp[1])); fs(B, bFace(T, { expr: 'surprised', look: [-0.3, -0.7] }));
      cm = CAMS(lt, [{ t0: 27.88, t1: 31.5, p: [10, HN(10, -300) + 120, -300], p1: [0, HN(0, -270) + 125, -270], l: [-10, 185, 650], l1: [-10, 215, 650], f: 34 }]);
    } else if (lt < 34.5) {
      pose(R, { t: T, x: rp[0], z: rp[1], yaw: PI / 2 - 0.4, walk: 0, headRot: -10, arms: { r: { sz: 0.5, sx: 0.5, el: 0.8 } } }, HN(rp[0], rp[1])); fs(R, rFace(T, { expr: 'smile', look: [0.3, -0.4] }));
      pose(B, { t: T, x: bp[0], z: bp[1], yaw: PI / 2 - 0.3, walk: 0, headRot: -12 }, HN(bp[0], bp[1])); fs(B, bFace(T, { expr: 'smile', look: [0.3, -0.4] }));
      cm = CAMS(lt, [{ t0: 31.5, t1: 34.5, p: [-200, 520, 60], p1: [350, 900, 360], l: [0, 450, 2800], l1: [0, 900, 3600], f: 34 }]);
    } else {
      const rise = ease(k, 6.6, 8.4);
      const cp = [0, 1700 + 120 * rise, 2500]; crown.visible = true; crown.position.set(...cp); crown.scale.setScalar(3.4); crown.rotation.y = T * 0.5; crown.position.y += 18 * Math.sin(T * 1.7);
      crown.userData.halo.visible = true; crown.userData.halo.position.set(cp[0], cp[1] + 150, cp[2] + 160); crown.userData.halo.material.depthTest = true; crown.userData.halo.scale.setScalar(1.6 + 0.12 * Math.sin(T * 2.4)); crown.userData.halo.material.opacity = 0.35 + 0.2 * rise;
      crownSp.forEach((s, i) => { const ph = frac(T * 0.5 + i / 6), on = Math.sin(Math.PI * ph) * rise; s.visible = on > 0.03; s.position.set(cp[0] + Math.cos(i * 2.3) * 420, cp[1] + 150 + Math.sin(i * 1.9) * 260 + ph * 80, cp[2] - 60); s.scale.setScalar(Math.max(0.01, on) * 2.2); POST.push(() => s.quaternion.copy(cam.quaternion)); });
      pose(R, { t: T, x: -260, z: 300, yaw: PI / 2 - 0.5, walk: 0, headRot: -22, arms: {} }, HN(-260, 300)); fs(R, rFace(T, { expr: 'smile', look: [0.4, -0.7] }));
      pose(B, { t: T, x: -90, z: 330, yaw: PI / 2 - 0.4, walk: 0, headRot: -25, arms: { r: { sz: 0.3, sx: 0.3, el: 1.2 } } }, HN(-90, 330)); fs(B, bFace(T, { expr: 'surprised', look: [0.4, -0.8] }));
      cm = CAMS(lt, [{ t0: 34.5, t1: 37.04, p: [-60, 290, 80], p1: [-30, 300, 110], l: [0, 1400, 2500], l1: [0, 1500, 2500], f: 36 }]);
    }
    return cm;
  }
  /* ---------------------------------------------------------- c5: the raft of cedar logs floats to Yafo */
  if (lt < 47.06) {
    show(GY, GULLS[0], GULLS[1], GULLS[2]); yShips.forEach(s => { s.visible = false; }); skyTo('gold'); yTick(T); if (!flags.collect) ysea.update(T, 18);
    yQuay.userData.crate.visible = false; yQuay.userData.hook.visible = false; hook.visible = true; rsplash.forEach(s => { s.visible = false; }); yRocks.visible = false;
    const k = lt - 37.04, rx = lerp(3800, 900, lin(k, 0, 10.02)), rz = -300, sx = rx - 640, sz = -300;
    setAS(yShips[0], sx, sz, PI, 0.62, 0.015 * Math.sin(T)); yShips[0].userData.update(T);
    if (!flags.collect) { const f = ysea.float(rx, rz, 120); raftG.visible = true; raftG.position.set(rx, f.y - 8, rz); raftG.rotation.set(f.rx * 0.8, 0, f.rz * 0.8, 'YXZ'); }
    setRope(hook, [sx + 150, 70, sz], [rx - 190, 36, rz]);
    GULLS.slice(0, 3).forEach((g, i) => gullFly(g, T, rx - 300 - i * 120, -420, 260, 340 + 50 * i, i * 2, 0.9, 1));
    R.root.visible = B.root.visible = false;
    if (lt < 41.6) return { p: [rx + 700, 560, -1200], l: [rx - 350, 20, -250], fov: 34 };
    if (lt < 44.6) return { p: [rx + 200, 105, -1000], l: [rx - 280, 45, -290], fov: 33 };
    return CAMS(lt, [{ t0: 44.6, t1: 47.06, p: [1500, 210, -1000], p1: [1350, 200, -900], l: [350, 190, -50], f: 36 }]);
  }
  /* ---------------------------------------------------------- c6: logs on carts climb to the golden city */
  show(GJ); skyTo('day'); raftG.visible = false; hook.visible = false;
  const k = lt - 47.06, s0 = 700 + 170 * k;
  const zAt = z => z, yawAt = z => Math.atan2(-1, (XR(z + 4) - XR(z - 4)) / 8);
  const tips = [TI[3], TI[0], TI[2]];
  [0, 1, 2].forEach(i => { const zt = s0 - i * 560, zc = zt - 300, xt = XR(zt), xc = XR(zc), yt = yawAt(zt), yc = yawAt(zc);
    show(tips[i]); fs(tips[i], { expr: 'happy', blink: blinkAt(T, i * 0.3), look: [0.2, 0.1] });
    pose(tips[i], { t: T, x: xt, z: zt, yaw: yt, walk: 1, ph: zt / tips[i].cycle, hopH: 30, arms: 'down' }, HJ(xt, zt));
    const c = cartG[i]; c.visible = true; if (!flags.collect) { const slope = Math.atan2(HJ(XR(zc + 60), zc + 60) - HJ(XR(zc - 60), zc - 60), 120); c.position.set(xc, HJ(xc, zc) + 4, zc); c.rotation.set(0, yc, slope * 0.9); c.userData.wheels.forEach(w => { w.rotation.z = -zc / 42; }); }
    if (!flags.collect) setRope(ropes[i], [xt + Math.cos(yt) * 20, HJ(xt, zt) + 56, zt - Math.sin(yt) * 20], [xc - Math.sin(0) + Math.cos(yc) * 150, HJ(xc, zc) + 64, zc - Math.sin(yc) * 150]); });
  if (!flags.collect) { city.userData.halo.material.opacity = 0.3 + 0.1 * Math.sin(T * 1.3); }
  if (lt < 50.8) return CAMS(lt, [{ t0: 47.06, t1: 50.8, p: [XR(s0 + 800) + 480, HJ(XR(s0 + 800), s0 + 800) + 190, s0 + 800], p1: [XR(s0 + 800) + 420, HJ(XR(s0 + 800), s0 + 800) + 210, s0 + 900], l: [XR(s0 - 300), HJ(XR(s0 - 300), s0 - 300) + 100, s0 - 300], f: 36 }]);
  { const cz = s0 - 1900, cx = XR(cz), cy = HJ(cx, cz) + 330; return CAMS(lt, [{ t0: 50.8, t1: 54.5, p: [cx + 90, cy, cz], p1: [cx + 60, cy + 120, cz - 200], l: [XR(s0 + 3200), HJ(XR(s0 + 3200), s0 + 3200) + 380, s0 + 3200], l1: [XR(7900), 1500, 8100], f: 36 }]); }
  function rx0(kk) { return lerp(3800, 900, lin(kk - 37.04, 0, 10.02)); }
}
