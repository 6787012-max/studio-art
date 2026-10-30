/* film_d shot 5b: the giant ship (215.7 - 257.1 s). ASCII only. */
import { THREE, sm, cl, frac, V, KT, M, box, G, col, GP, GM, GJ, R, B, TI, GULLS, ease, lin, lerp, blinkAt, flags, fs, pose, talkL, CAMS, skyTo, show, bFace, rFace, POST, cam, makeLabel } from './d_core.js';
import { mport, psea, ship, portTick, makeContainer, makeBus, makeTruck, gift, giftTick } from './d_w4.js';
import { makeRope, setRope, XR, HJ, village, city } from './d_w2.js';
import { MAP, L, mapTick, setPin, pinN, pinS, HAIFA, ASHDOD } from './d_map.js';
import { setGate, portsTick, mapReset } from './d_map2.js';
import { gullFly } from './d_s1.js';
import { hideGP } from './d_s5.js';
const PI = Math.PI;
const buses = []; for (let i = 0; i < 32; i++) { const b = makeBus(i); b.scale.setScalar(0.75); b.visible = false; GP.add(b); buses.push(b); }
const lab400 = makeLabel('400 m', 700, 240, 150); lab400.visible = false; GP.add(lab400);
const brk = (() => { const g = G(GP), rm = M('#d9402e', '#d9402e', 0); box(g, 2890, 8, 8, rm, [0, 640, 120], 0); for (const x of [-1445, 1445]) box(g, 8, 80, 8, rm, [x, 640, 120], 0); g.visible = false; return g; })();
const cranesC = [0, 1, 2].map(i => makeContainer(1.8, i + 1, true)); cranesC.forEach(c => { c.visible = false; GP.add(c); });
const trucks = [0, 1, 2].map(i => { const t = makeTruck(i); t.visible = false; GP.add(t); return t; });
const cables = [0, 1, 2].map(() => { const r = makeRope(GP, 3, '#2b2b30'); r.visible = false; return r; });
const spread = [0, 1, 2].map(() => { const s = box(GP, 150, 8, 60, M('#f0c040', '#c9a080'), [0, 0, 0], 1.4, null, 2); s.visible = false; return s; });
const gtrucks = [0, 1, 2].map(i => { const t = makeTruck(i + 3); t.visible = false; GJ.add(t); return t; });
const gc = [0, 1, 2].map(i => { const c = makeContainer(1.8, i + 4, true); c.visible = false; GJ.add(c); return c; });
const CX = [-500, 20, 540];

function hoist(lt, k0) {
  const P = 3.6;
  CX.forEach((cx, i) => { const p = frac((lt - k0) / P + i * 0.31), c = cranesC[i], t = trucks[i];
    let z, y, tx; const lift = ease(p, 0, 0.15), mv = ease(p, 0.15, 0.55), lo = ease(p, 0.55, 0.8);
    z = lerp(120, 640, mv); y = lerp(lerp(380, 480, lift), 175, lo);
    tx = p < 0.2 ? cx - 1700 : (p < 0.55 ? lerp(cx - 1700, cx, ease(p, 0.2, 0.55)) : (p < 0.8 ? cx : lerp(cx, cx + 1800, ease(p, 0.82, 1.0))));
    t.visible = true; t.position.set(tx, 60, 640 + 10); t.rotation.y = 0;
    c.visible = true; if (p < 0.8) c.position.set(cx, y, z); else c.position.set(tx, 175, 650);
    const cz = c.position.z, cy = c.position.y, cxx = c.position.x;
    if (p < 0.8) { cables[i].visible = true; setRope(cables[i], [cxx, 535, cz], [cxx, cy + 58, cz]); spread[i].visible = true; spread[i].position.set(cxx, cy + 62, cz); } else { cables[i].visible = false; spread[i].visible = false; }
  });
}
export function shot5b(lt, T) {
  /* ---------------------------------------------------------- c1 / c2 / c3: at the port */
  if (lt < 23.67) {
    show(GP, R, B); skyTo('day'); portTick(T); GP.add(ship); ship.scale.setScalar(1.7); ship.position.set(0, -85, 120); ship.visible = true; hideGP();
    buses.forEach(b => { b.visible = false; }); lab400.visible = false; brk.visible = false; cranesC.forEach(c => { c.visible = false; }); trucks.forEach(c => { c.visible = false; }); cables.forEach(c => { c.visible = false; }); spread.forEach(c => { c.visible = false; });
    gullFly(GULLS[0], T, 800, 100, 1000, 850, 0, 0.3);
    if (lt < 6.34) {                                              /* c1: low along the hull, the boy cranes his neck */
      const k = lt - 0.4, up = ease(k, 0.6, 2.2);
      pose(B, { t: T, x: 1000, z: 570, yaw: -0.45, walk: 0, headRot: -26 * up, lean: -6 * up, arms: { l: { sz: 0.3, sx: 0.5 * up, el: 0.5 }, r: { sz: 0.3, sx: 0.5 * up, el: 0.5 } } }, 60); fs(B, bFace(T, { expr: up > 0.5 ? 'surprised' : 'smile', look: [0.4, -0.8 * up] }));
      pose(R, { t: T, x: 610, z: 620, yaw: -0.05, walk: 0, headYaw: 0.1, arms: { r: { sz: 0.7, sx: 0.3, el: 0.5 } } }, 60); fs(R, rFace(T, { expr: 'smile', look: [0.4, -0.2] }));
      return CAMS(lt, [{ t0: 0, t1: 6.34, p: [1650, 95, 900], p1: [1600, 100, 880], l: [880, 250, 400], l1: [870, 255, 400], f: 38 }]);
    }
    if (lt < 13.84) {                                             /* c2: 30+ buses against the hull, the ship is longer */
      R.root.visible = B.root.visible = false; mport.cranes.forEach(c => { c.visible = false; });
      const n = Math.floor(32 * ease(lt, 6.8, 10.4));
      buses.forEach((b, i) => { b.visible = i < n; b.position.set(-1190 + i * 78, 60, 470); b.rotation.y = 0; });
      brk.visible = lt > 10.6; lab400.visible = lt > 10.6; lab400.position.set(0, 700, 120); lab400.scale.setScalar(1.7); POST.push(() => lab400.quaternion.copy(cam.quaternion));
      if (lt < 10.4) return CAMS(lt, [{ t0: 6.34, t1: 10.4, lin: true, p: [-1700, 270, 1160], p1: [1300, 270, 1170], l: [-1100, 100, 470], l1: [1500, 100, 470], f: 36 }]);
      return CAMS(lt, [{ t0: 10.4, t1: 13.84, p: [200, 420, 1900], p1: [0, 560, 2250], l: [0, 400, 200], l1: [0, 450, 200], f: 38 }]);
    }
    R.root.visible = B.root.visible = false;                      /* c3: the giant cranes put every container on a truck */
    hoist(lt, 13.84); lab400.visible = false;
    if (lt < 18.5) return CAMS(lt, [{ t0: 13.84, t1: 18.5, p: [-250, 850, 1500], p1: [50, 780, 1350], l: [20, 200, 560], l1: [30, 210, 560], f: 38 }]);
    return CAMS(lt, [{ t0: 18.5, t1: 23.67, p: [1050, 430, 1050], p1: [900, 470, 1000], l: [140, 290, 560], f: 38 }]);
  }
  /* ---------------------------------------------------------- c4: the trucks drive away, the crate arrives at the boy's door */
  if (lt < 31.95) {
    show(GJ); skyTo('day'); const k = lt - 23.67;
    gtrucks.forEach(t => { t.visible = false; }); gc.forEach(t => { t.visible = false; }); gift.visible = false;
    if (lt < 27.2) {
      [0, 1, 2].forEach(i => { const z = 380 + k * 330 - i * 430, x = XR(z), yaw = Math.atan2(-1, (XR(z + 4) - XR(z - 4)) / 8); const t = gtrucks[i]; t.visible = true; t.position.set(x, HJ(x, z) + 6, z); t.rotation.set(0, yaw, 0, 'YXZ');
        if (!flags.collect) t.rotation.z = Math.atan2(HJ(XR(z + 60), z + 60) - HJ(XR(z - 60), z - 60), 120) * 0.9; const c = gc[i]; c.visible = true; c.position.set(x, HJ(x, z) + 6 + 112, z); c.rotation.set(0, yaw, t.rotation.z, 'YXZ'); c.translateX(40); });
      const z0 = 380 + k * 330;
      return CAMS(lt, [{ t0: 23.67, t1: 27.2, p: [XR(z0 - 1700), HJ(XR(z0 - 1700), z0 - 1700) + 300, z0 - 1700], p1: [XR(z0 - 1600), HJ(XR(z0 - 1600), z0 - 1600) + 330, z0 - 1600], l: [XR(z0 + 500), HJ(XR(z0 + 500), z0 + 500) + 80, z0 + 500], f: 36 }]);
    }
    show(R, B, gift); GJ.add(gift); gift.visible = true;
    const hg = village.children[0]; hg.updateWorldMatrix(true, false); const dp = hg.localToWorld(new THREE.Vector3(0, 0, 70)), dx = dp.x, dz = dp.z, gy = HJ(dx + 120, dz);
    const kk = lt - 27.2, slide = ease(kk, 0.2, 1.3), open = kk - 1.9;
    gtrucks[0].visible = true; const tz = dz - 100, tx = XR(tz); gtrucks[0].position.set(dx + 700, HJ(dx + 700, dz) + 6, dz - 200); gtrucks[0].rotation.set(0, PI - 1.2, 0, 'YXZ');
    gift.position.set(lerp(dx + 560, dx + 290, slide), HJ(dx + 290, dz) + 8 + 60 * Math.sin(Math.PI * slide), lerp(dz - 60, dz + 10, slide)); gift.rotation.y = -PI / 2;
    giftTick(T, Math.max(open, -1), 0);
    const bend = ease(kk, 1.3, 1.8) * (1 - ease(kk, 3.0, 3.6));
    pose(B, { t: T, x: dx + 215, z: dz + 105, yaw: 0.95, walk: 0, lean: 22 * bend, headTilt: 6 * bend, arms: { l: { sz: 0.9 * bend + 0.3, sx: 0.15, el: 0.5 }, r: { sz: 0.9 * bend + 0.3, sx: 0.15, el: 0.5 } } }, HJ(dx + 215, dz + 105)); fs(B, bFace(T, { expr: open > 0.7 ? 'laugh' : (kk > 1.3 ? 'surprised' : 'smile'), look: [-0.3, -0.5 * bend] }));
    pose(R, { t: T, x: dx + 140, z: dz - 190, yaw: -0.45, walk: 0, headYaw: 0.2, arms: { r: { sz: 0.6, sx: 0.3, el: 0.8, curl: 0.8 } } }, HJ(dx + 140, dz - 190)); fs(R, rFace(T, { expr: 'smile', talk: talkL(lt, 28, 30.5), look: [0.3, -0.2] }));
    return CAMS(lt, [{ t0: 27.2, t1: 29.2, p: [dx + 900, gy + 215, dz - 590], p1: [dx + 840, gy + 218, dz - 540], l: [dx + 190, gy + 130, dz - 30], f: 33 }, { t0: 29.2, t1: 31.95, p: [dx + 560, gy + 150, dz - 330], p1: [dx + 520, gy + 145, dz - 300], l: [dx + 250, gy + 85, dz + 30], f: 30 }]);
  }
  /* ---------------------------------------------------------- c5: the gate of the land */
  const k = lt - 31.95;
  if (lt < 37.6) {
    show(GM); skyTo('clear'); mapTick(T); mapReset(); const g = ease(k, 0.4, 1.8);
    setGate(g, T); setPin(pinN, HAIFA, 1, T); setPin(pinS, ASHDOD, 1, T); portsTick(T, 1, 1);
    return CAMS(lt, [{ t0: 31.95, t1: 37.6, p: [1000, 210, 760], p1: [1220, 190, 720], l: [1500, 0, 560], l1: [1510, 30, 560], f: 36 }]);
  }
  show(GP, R, B); skyTo('day'); portTick(T); GP.add(ship); ship.scale.setScalar(1.7); ship.position.set(0, -85, 120); ship.visible = true; hideGP();
  buses.forEach(b => { b.visible = false; }); lab400.visible = false; brk.visible = false; cranesC.forEach(c => { c.visible = false; }); trucks.forEach(c => { c.visible = false; }); cables.forEach(c => { c.visible = false; }); spread.forEach(c => { c.visible = false; });
  pose(R, { t: T, x: 150, z: 560, yaw: -PI / 2 - 0.25, walk: 0, headYaw: 0.1, arms: { l: { sz: 0.3, sx: 0.3, el: 0.6 }, r: { sz: 0.3, sx: 0.3, el: 0.6 } } }, 60); fs(R, rFace(T, { expr: 'smile', look: [0.1, 0.0] }));
  pose(B, { t: T, x: 380, z: 585, yaw: -PI / 2 + 0.3, walk: 0, headTilt: 5 * Math.sin(T * 1.4) }, 60); fs(B, bFace(T, { expr: 'smile', look: [0.1, 0.0] }));
  gullFly(GULLS[0], T, 400, 100, 1000, 700, 0, 0.3);
  return CAMS(lt, [{ t0: 37.6, t1: 41.4, p: [270, 205, 1255], p1: [310, 207, 1225], l: [265, 185, 560], f: 40 }]);
}
