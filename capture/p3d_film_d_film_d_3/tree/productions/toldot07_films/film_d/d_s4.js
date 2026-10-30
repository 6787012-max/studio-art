/* film_d shot 4: Caesarea (136.3 - 164.7 s). ASCII only. */
import { THREE, sm, cl, frac, V, KT, GC, GU, R, B, TI, GULLS, FISH, ease, lin, lerp, blinkAt, flags, fs, pose, talkL, CAMS, skyTo, show, bFace, rFace, POST, cam } from './d_core.js';
import { port, csea, moles, towers, cShips, cBirds, build, buildTick, uw, uwTick, rowboat } from './d_w3b.js';
import { gullFly } from './d_s1.js';
const PI = Math.PI;
function setS(s, x, z, yaw, sc, roll) { if (flags.collect) return; const f = csea.float(x, z, 100); s.visible = true; s.scale.setScalar(sc); s.position.set(x, f.y - 12 * sc, z); s.rotation.order = 'YXZ'; s.rotation.set(f.rx * 0.5 + (roll || 0), yaw, f.rz * 0.5); }
let _lab = false;

export function shot4(lt, T) {
  /* ---------------------------------------------------------- c1: straight coast -> the harbour walls rise */
  if (lt < 10.11) {
    show(GC, R, B); skyTo('day'); cShips.forEach(s => { s.visible = false; }); build.g.visible = false; rowboat.visible = false;
    const rise = ease(lt, 4.2, 8.4); moles.forEach(m => { m.position.y = -420 * (1 - rise); }); towers.forEach(m => { m.position.y = -420 * (1 - rise); });
    if (!flags.collect) { csea.update(T, lerp(24, 22, rise)); csea.setCalm(-150, 180, 750, 380, lerp(1, 0.1, ease(rise, 0.5, 1))); cBirds.userData.update(T); port.update(T); }
    gullFly(GULLS[0], T, 0, 100, 700, 480, 0, 0.35);
    const sh = ease(lt, 0.7, 1.5) * (1 - ease(lt, 3.4, 4.0));
    pose(R, { t: T, x: -590, z: 650, yaw: PI / 2 - 0.2, walk: 0, headYaw: -0.1, headTilt: 6 * sh, arms: { l: { sz: 0.3, sx: 0.9 * sh + 0.1, el: 1.0 * sh + 0.3 }, r: { sz: 0.3, sx: 0.9 * sh + 0.1, el: 1.0 * sh + 0.3 } } }, 50);
    fs(R, rFace(T, { expr: lt < 4.2 ? 'explaining' : 'smile', talk: talkL(lt, 0.8, 4.0), look: [0.1, 0.1] }));
    pose(B, { t: T, x: -220, z: 680, yaw: PI / 2 + 0.35, walk: 0, headTilt: 4 * Math.sin(T * 1.4) }, 50); fs(B, bFace(T, { expr: lt < 4.2 ? 'worried' : 'smile', look: [0.1, 0.2] }));
    const ss = ease(lt, 6.6, 10.1);
    setS(cShips[0], lerp(1500, 520, ss), lerp(-900, 300, ss), lerp(-2.4, -2.5, ss), 0.8, 0.02 * Math.sin(T)); cShips[0].visible = lt > 6.6 && lt < 10.11; if (cShips[0].visible) cShips[0].userData.update(T);
    if (lt < 4.4) { R.root.visible = B.root.visible = true; return CAMS(lt, [{ t0: 0, t1: 4.4, p: [80, 225, -250], p1: [30, 226, -215], l: [-405, 185, 660], f: 34 }]); }
    if (lt < 8.3) { R.root.visible = B.root.visible = false; return CAMS(lt, [{ t0: 4.4, t1: 8.3, p: [-200, 700, -1350], p1: [450, 880, -1300], l: [-100, 0, 100], l1: [-100, 0, 150], f: 36 }]); }
    R.root.visible = B.root.visible = true;
    return CAMS(lt, [{ t0: 8.3, t1: 10.11, p: [-330, 215, -430], p1: [-340, 218, -400], l: [-405, 190, 660], f: 33 }]);
  }
  /* ---------------------------------------------------------- c2: wooden frames filled with a mix that hardens in water */
  if (lt < 19.82) {
    show(GC, TI[0]); skyTo('day'); cShips.forEach(s => { s.visible = false; }); rowboat.visible = false; build.g.visible = true;
    moles.forEach(m => { m.position.y = 0; }); towers.forEach(m => { m.position.y = 0; });
    if (!flags.collect) { csea.update(T, 18); csea.setCalm(-150, 180, 750, 380, 0.1); cBirds.userData.update(T); port.update(T); }
    const drop = ease(lt, 10.8, 13.3), pour = ease(lt, 13.8, 17.3), hard = ease(lt, 17.0, 19.4); buildTick(T, { drop, pour, hard });
    const lab = build.lab; lab.visible = lt > 16.4; lab.position.set(-40, 330, -330); lab.scale.setScalar(0.5);  POST.push(() => lab.quaternion.copy(cam.quaternion));
    const kk = lt - 10.11, point = lt < 13.6 ? 'point' : (lt < 17.0 ? 'up' : 'up');
    if (!flags.collect) { const gp = build.g.position; pose(TI[0], { t: T, x: gp.x + 150, y: gp.y + 19, z: gp.z - 90, yaw: -PI / 2 + 0.2 + 0.2 * Math.sin(T * 0.8), walk: 0, arms: lt < 13.6 ? 'point' : (lt < 17.3 ? 'down' : 'up'), shadow: true }); }
    fs(TI[0], { expr: lt < 17.0 ? 'happy' : 'cheering', blink: blinkAt(T, 0.3), talk: talkL(lt, 11, 13), look: [0.3, 0.2] });
    gullFly(GULLS[0], T, -250, 100, 650, 560, 0, 0.35);
    if (lt < 13.4) return CAMS(lt, [{ t0: 10.11, t1: 13.4, p: [-1500, 340, 330], p1: [-1400, 350, 290], l: [-250, 190, -60], f: 36 }]);
    if (lt < 16.6) return CAMS(lt, [{ t0: 13.4, t1: 16.6, p: [-650, 200, -900], p1: [-600, 230, -850], l: [-250, 200, -200], f: 34 }]);
    return CAMS(lt, [{ t0: 16.6, t1: 19.82, p: [-130, 250, -800], p1: [-190, 260, -760], l: [-170, 290, -200], f: 38 }]);
  }
  /* ---------------------------------------------------------- c3: today it lies under the sea */
  const k = lt - 19.82, uwv = lt >= 22.9 && lt < 27.3;
  if (uwv) {
    uw.visible = true; show(GU, FISH[0], FISH[1], FISH[2], FISH[3], FISH[4], FISH[5]); skyTo('deep'); uwTick(T);
    FISH.slice(0, 6).forEach((f, i) => { const a = T * (0.28 + 0.04 * i) + i * 1.3, rr = 380 + 90 * i, x = Math.cos(a) * rr, z = 100 + Math.sin(a) * rr * 0.6, dx = -Math.sin(a), dz = Math.cos(a) * 0.6; f.root.scale.setScalar(0.45); pose(f, { t: T, x: -100 + x, y: -80 + 60 * Math.sin(a * 2 + i) + 30 * i, z, yaw: Math.atan2(-dz, dx), swim: 1, shadow: false }); });
    return CAMS(lt, [{ t0: 22.9, t1: 27.3, p: [-1150, -80, 950], p1: [-420, -100, 520], l: [-100, -190, -60], l1: [200, -150, -60], f: 38 }]);
  }
  show(GC, R, B); skyTo('day'); cShips.forEach(s => { s.visible = false; }); build.g.visible = false;
  moles.forEach(m => { m.position.y = 0; }); towers.forEach(m => { m.position.y = 0; });
  if (!flags.collect) { csea.update(T, 10); csea.setCalm(-150, 180, 750, 380, 0.1); cBirds.userData.update(T); port.update(T); }
  rowboat.visible = true; const bx = -300, bz = 40;
  let rb = 0, pitch = 0, by = 0; if (!flags.collect) { const f = csea.float(bx, bz, 120); rowboat.position.set(bx, f.y - 14, bz); rowboat.rotation.set(f.rx * 0.5 + 0.03 * Math.sin(T * 1.1), 0, f.rz * 0.5, 'YXZ'); by = f.y - 14 + 74; }
  const lean = ease(k, 0.2, 1.0) * (1 - ease(lt, 27.3, 27.8)), up = ease(lt, 27.3, 28.0);
  pose(B, { t: T, x: bx + 150, z: bz - 70, yaw: PI / 2 + 0.15, walk: 0, lean: 26 * lean, headTilt: 18 * lean - 4 * up, arms: { l: { sz: 0.7 * lean + 0.2, sx: 0.2, el: 0.6 }, r: { sz: 0.7 * lean + 0.2, sx: 0.2, el: 0.6 } } }, by); fs(B, bFace(T, { expr: lt < 27.3 ? 'thinking' : 'surprised', look: [0.2, lean > 0.5 ? -0.8 : 0.1] }));
  pose(R, { t: T, x: bx - 170, z: bz - 10, yaw: PI / 2 + 0.3, walk: 0, headYaw: 0.1, arms: { r: { sz: 0.5, sx: 0.4, el: 0.7, curl: 0.8 } } }, by); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 20, 22.6), look: [0.3, -0.3] }));
  gullFly(GULLS[0], T, 100, -500, 600, 480, 0, 0.35);
  if (lt < 22.9) return CAMS(lt, [{ t0: 19.82, t1: 22.9, p: [120, 390, -820], p1: [70, 380, -790], l: [bx + 20, 165, bz - 30], f: 32 }]);
  return CAMS(lt, [{ t0: 27.3, t1: 28.4, p: [360, 300, -800], p1: [310, 305, -770], l: [bx - 10, 175, bz - 30], f: 33 }]);
}
