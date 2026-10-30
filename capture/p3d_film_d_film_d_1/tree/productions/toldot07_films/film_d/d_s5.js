/* film_d shot 5: Haifa and Ashdod (164.7 - 215.7 s). ASCII only. */
import { THREE, sm, cl, frac, V, KT, M, box, G, col, GP, GM, GI, R, B, TI, GULLS, ease, lin, lerp, blinkAt, flags, fs, pose, talkL, CAMS, skyTo, show, bFace, rFace, POST, cam, makeLabel } from './d_core.js';
import { MAP, L, mapTick, setRing, setDots, setPin, pinN, pinS, setBoxes, HAIFA, ASHDOD } from './d_map.js';
import { haifaPort, ashdodPort, portsTick, mapReset } from './d_map2.js';
import { seferRoom } from './d_w3.js';
import { mport, psea, ship, portTick, makeContainer, makeBigContainer, crateRoom, crateTick, crateLabels } from './d_w4.js';
import { gullFly } from './d_s1.js';
const PI = Math.PI;
ship.scale.setScalar(1.7); ship.position.set(0, -85, 120);
const bigC = makeBigContainer(0); bigC.scale.setScalar(1.5); bigC.rotation.y = PI / 2; bigC.position.set(3130, 60, 1000); GP.add(bigC);
const NL = 34, line = []; for (let i = 0; i < NL; i++) { const c = makeContainer(1.1, i, false); c.visible = false; GP.add(c); line.push(c); }
const lab20 = makeLabel('20,000', 760, 250, 150); lab20.visible = false; GP.add(lab20);
let lastN = -1;
const sorted = i => ((i * 37) % NL);

const _f = new THREE.Vector3(), _u = new THREE.Vector3();
function labFollow() { lab20.quaternion.copy(cam.quaternion); _f.set(0, 0, -1).applyQuaternion(cam.quaternion); _u.set(0, 1, 0).applyQuaternion(cam.quaternion); lab20.position.copy(cam.position).addScaledVector(_f, 1100).addScaledVector(_u, 262); }
export function hideGP() { line.forEach(c => { c.visible = false; }); bigC.visible = false; lab20.visible = false; }
export function shot5(lt, T) {
  /* ---------------------------------------------------------- c1 / c2: the map, the two ports */
  if (lt < 18.42) {
    show(GM); skyTo('clear'); mapTick(T); mapReset();
    const a = ease(lt, 0.05, 0.6), b = ease(lt, 0.3, 0.85); setPin(pinN, [HAIFA[0], HAIFA[1], HAIFA[2]], a, T); setPin(pinS, [ASHDOD[0], ASHDOD[1], ASHDOD[2]], b, T);
    const rn = lt < 4.2 ? ease(lt, 0.5, 1.1) : 0, rs = lt >= 4.2 && lt < 8.64 ? ease(lt, 4.2, 5.0) : (lt >= 8.64 ? 0 : 0);
    if (lt < 4.2) setRing(HAIFA[0], HAIFA[2], 34, rn, T); else if (lt < 13.5) setRing(HAIFA[0], HAIFA[2], 34, lt < 8.64 ? 0 : ease(lt, 8.8, 9.6), T); else setRing(ASHDOD[0], ASHDOD[2], 34, ease(lt, 13.6, 14.4), T);
    if (lt >= 4.2 && lt < 8.64) setRing(ASHDOD[0], ASHDOD[2], 34, rs, T);
    portsTick(T, ease(lt, 8.8, 9.9), ease(lt, 13.6, 14.7));
    if (lt < 8.64) return CAMS(lt, [{ t0: 0, t1: 8.64, p: [1060, 360, 520], p1: [1190, 290, 540], l: [1520, 0, 520], l1: [1520, 0, 520], f: 34 }]);
    if (lt < 13.5) return CAMS(lt, [{ t0: 8.64, t1: 13.5, p: [1250, 230, 330], p1: [1400, 90, 400], l: [1520, 0, 470], l1: [1525, 0, 466], f: 34 }]);
    return CAMS(lt, [{ t0: 13.5, t1: 18.42, p: [1290, 220, 820], p1: [1360, 100, 650], l: [1495, 0, 575], l1: [1495, 0, 570], f: 34 }]);
  }
  /* ---------------------------------------------------------- c3: 100 crates, 98 by ship, 2 by plane */
  if (lt < 27.43) {
    show(GI); crateRoom.visible = true; seferRoom.visible = false; GI.add(ship); ship.visible = true; ship.scale.setScalar(0.5); ship.position.set(1000, 6, -200); ship.rotation.set(0, 0, 0);
    const k = lt - 18.42, [n98, n2] = crateTick(k, T); crateLabels(T, n98, n2); POST.push(() => { crateRoom.userData.l98.quaternion.copy(cam.quaternion); crateRoom.userData.l2.quaternion.copy(cam.quaternion); });
    return CAMS(lt, [{ t0: 18.42, t1: 27.43, p: [60, 760, 1700], p1: [140, 680, 1560], l: [140, 0, 30], l1: [180, 0, 50], f: 34 }]);
  }
  GP.add(ship); ship.scale.setScalar(1.7); ship.position.set(0, -85, 120); ship.visible = true;
  /* ---------------------------------------------------------- c4: the biggest ship, 20,000 containers; the boy is tiny next to one */
  if (lt < 36.45) {
    show(GP, R, B); skyTo('day'); portTick(T); line.forEach(c => { c.visible = false; }); bigC.visible = lt >= 32.2; mport.cranes.forEach(c => { c.visible = true; });
    gullFly(GULLS[0], T, 700, 100, 900, 800, 0, 0.3);
    const k = lt - 27.43, cnt = Math.floor(20000 * ease(k, 0.6, 6.8) / 10) * 10;
    if (lt < 32.2) {
      lab20.visible = true; lab20.scale.setScalar(0.9); POST.push(labFollow);
      if (cnt !== lastN) { lastN = cnt; lab20.userData.set(String(cnt).replace(/\B(?=(\d{3})+(?!\d))/g, ',')); }
      R.root.visible = B.root.visible = false;
      return CAMS(lt, [{ t0: 27.43, t1: 32.2, p: [1900, 140, 760], p1: [1500, 190, 820], l: [850, 390, 110], l1: [650, 420, 110], f: 36 }]);
    }
    lab20.visible = true; lab20.scale.setScalar(0.7); lab20.userData.set('20,000'); lastN = 20000; POST.push(labFollow);
    const kk = lt - 32.2, up = ease(kk, 1.4, 2.2);
    pose(B, { t: T, x: 2850, z: 700, yaw: PI + 0.35, walk: 0, headRot: -22 * up, headTilt: 0, arms: kk > 2.4 ? { l: { sz: 0.3, sx: 0.9, el: 0.8 }, r: { sz: 0.3, sx: 0.9, el: 0.8 } } : {} }, 60); fs(B, bFace(T, { expr: kk > 2.2 ? 'surprised' : 'smile', look: [0.2, kk > 2.2 ? -0.7 : 0.1] }));
    pose(R, { t: T, x: 2850, z: 1010, yaw: PI - 0.3, walk: 0, headYaw: -0.15, arms: { r: { sz: 0.7, sx: 0.4, el: 0.5, curl: 0.8 } } }, 60); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 33, 36), look: [0.4, -0.2] }));
    return CAMS(lt, [{ t0: 32.2, t1: 36.45, p: [1760, 265, 855], p1: [1810, 262, 855], l: [2900, 215, 855], l1: [2900, 215, 855], f: 38 }]);
  }
  /* ---------------------------------------------------------- c5: the containers in a row along the road, c6: from Ashdod to Haifa */
  if (lt < 44.68) {
    show(GP); skyTo('day'); portTick(T); bigC.visible = false; lab20.visible = false;
    const k = lt - 36.45, n = Math.floor(NL * lin(k, 0.6, 7.4));
    line.forEach((c, i) => { const ti = 0.6 + i * (6.8 / NL), kf = (k - ti) / 1.3, sx = ((i * 211) % 900) - 450, slot = [330 + i * 185, 62 + 35, 770];
      if (kf <= 0) { c.visible = false; return; } c.visible = true; const e = sm(cl(kf, 0, 1));
      c.position.set(lerp(sx, slot[0], e), lerp(330, slot[1], e) + 330 * Math.sin(Math.PI * Math.min(1, e * 1.0)) * (1 - e * 0.2), lerp(120, slot[2], e)); c.rotation.y = e * 0.0; });
    gullFly(GULLS[0], T, 1500, 300, 1200, 900, 0, 0.3);
    if (lt < 40.8) return CAMS(lt, [{ t0: 36.45, t1: 40.8, p: [-250, 175, 700], p1: [-120, 185, 700], l: [2600, 90, 790], f: 34 }]);
    return CAMS(lt, [{ t0: 40.8, t1: 44.68, p: [900, 950, -1000], p1: [1800, 800, -900], l: [2300, 60, 700], l1: [3200, 60, 760], f: 36 }]);
  }
  if (lt < 48.8) {
    show(GM); skyTo('clear'); mapTick(T); mapReset(); const k = lt - 44.68;
    setPin(pinN, [HAIFA[0], HAIFA[1], HAIFA[2]], 1, T); setPin(pinS, [ASHDOD[0], ASHDOD[1], ASHDOD[2]], 1, T); portsTick(T, 1, 1); setRing(HAIFA[0], HAIFA[2], 30, 0.0001, T);
    setDots(0, T); setBoxes(ease(k, 0.4, 3.6), T);
    return CAMS(lt, [{ t0: 44.68, t1: 48.8, p: [1000, 260, 760], p1: [1280, 240, 540], l: [1500, 0, 600], l1: [1530, 0, 470], f: 36 }]);
  }
  show(GP, B, R); skyTo('day'); portTick(T); bigC.visible = false; lab20.visible = false;
  line.forEach((c, i) => { c.visible = true; c.position.set(330 + i * 185, 97, 770); c.rotation.y = 0; });
  const k = lt - 48.8, hop = 30 * Math.abs(Math.sin(k * 6)) * ease(k, 0.1, 0.5);
  pose(B, { t: T, x: 2500, z: 700, yaw: PI + 0.3, walk: 0, headTilt: 4 * Math.sin(T * 5), arms: { l: { sz: 1.3, sx: 0.3, el: 0.2 }, r: { sz: 1.3, sx: 0.3, el: 0.2 } } }, 60 + hop); fs(B, bFace(T, { expr: 'laugh', look: [0.1, 0.2] }));
  pose(R, { t: T, x: 2500, z: 470, yaw: PI - 0.3, walk: 0, headYaw: 0.1, arms: { r: { sz: 0.6, sx: 0.3, el: 0.7, curl: 0.7 } } }, 60); fs(R, rFace(T, { expr: 'smile', look: [0.2, 0.1] }));
  return CAMS(lt, [{ t0: 48.8, t1: 50.6, p: [1620, 235, 595], p1: [1660, 237, 595], l: [2500, 190, 590], f: 33 }]);
}
