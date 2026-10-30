/* film_z shot 2: the checklist (52.8 - 89.7 s). 0.4-13 s: the boy cleans the beach; after that a calm sunset recap (centre calm, veil). ASCII only. */
import { THREE, sm, cl, frac, D2R, V, part, ell, KT, W, GB, GK, R, B, GULL, sky, cam, ease, lin, lerp, lerp3, blinkAt, flags, fs, pose, talkL, CAMS, skyTo, show, handPos, fwd } from './z_core.js';
import { beachTick, fgTufts, mapOpen, bag, bottle, bin, CRAB } from './z_set.js';
const PI = Math.PI, TERR = W.TERR;
const bF = (T, st, off) => Object.assign({ expr: 'smile', blink: blinkAt(T, off || 0.6), look: [0, 0] }, st);
const rF = (T, st) => Object.assign({ expr: 'smile', blink: blinkAt(T, 0.1), look: [0, 0] }, st);
const PH = (T, o, x, z, yaw, extra) => pose(o, Object.assign({ t: T, x, z, yaw, walk: 0 }, extra), TERR(x, z));
const U = () => sky.material.uniforms;
function sun(y, c, x) { const u = U(); u.uHasSun.value = 1; u.uSun.value.set(c || '#fff1c2'); u.uDir.value.set(x || 0, y, -1).normalize(); }
/* walk from A to B between times t0..t1: returns {x,z,ph,psi,moving} */
function seg(A, Bp, t0, t1, lt) {
  const dx = Bp[0] - A[0], dz = Bp[1] - A[1], L = Math.hypot(dx, dz), u = cl((lt - t0) / (t1 - t0), 0, 1), e = sm(u) * 0.35 + u * 0.65;
  return { x: A[0] + dx * e, z: A[1] + dz * e, ph: L * e / 62, psi: Math.atan2(-dz, dx), moving: u > 0 && u < 1 };
}
const S = { p0: [-470, 330], bagS: [-250, 395], botS: [10, 470], binS: [300, 560], bag: [-132, 432], bot: [118, 508], bin: [430, 590] };
const reachTo = (S0, psi, d) => { const f = fwd(psi); return [S0[0] + f[0] * d, S0[1] + f[1] * d]; };

export function shot2(lt, T) {
  if (lt < 13.0) return cleaning(lt, T);
  return recap(lt, T);
}

function cleaning(lt, T) {
  show(GB, R, B, GK); skyTo('gold', 'dusk', 0.15); beachTick(T, { dusk: true, A: 5, blow: 0.2 }); sun(0.09, '#ffcf3d', 0.5);
  const psiB = Math.atan2(-(S.bagS[1] - S.p0[1]), S.bagS[0] - S.p0[0]);
  let bx, bz, ph = 0, walk = 0, yaw, lean = 0, headTilt = 0, arms = {}, face = {}, hasBag = false, hasBot = false;
  const bendAmt = (a, b, c, d) => ease(lt, a, b) * (1 - ease(lt, c, d));
  if (lt < 3.4) { const s = seg(S.p0, S.bagS, 1.4, 3.4, lt); bx = s.x; bz = s.z; ph = s.ph; walk = s.moving ? 1 : 0; yaw = s.psi - 0.45; face = { look: [0.3, -0.2] }; }
  else if (lt < 4.9) { bx = S.bagS[0]; bz = S.bagS[1]; yaw = psiB - 0.45; const b = bendAmt(3.4, 4.0, 4.4, 4.9); lean = 40 * b; arms = { r: { sz: 0.35 + 0.55 * b, sx: 0.1, el: 0.3, curl: 0.2 + 0.6 * ease(lt, 4.2, 4.5) } }; hasBag = lt > 4.45; face = { look: [0.3, -0.5] }; }
  else if (lt < 6.3) { const s = seg(S.bagS, S.botS, 4.9, 6.3, lt), psi = s.psi; bx = s.x; bz = s.z; ph = s.ph; walk = s.moving ? 1 : 0; yaw = psi - 0.45; hasBag = true; arms = { r: { sz: 0.5, sx: 0.1, el: 0.8, curl: 0.8 } }; face = { look: [0.3, -0.2] }; }
  else if (lt < 7.7) { bx = S.botS[0]; bz = S.botS[1]; yaw = Math.atan2(-(S.bot[1] - S.botS[1]), S.bot[0] - S.botS[0]) - 0.45; const b = bendAmt(6.3, 6.9, 7.2, 7.7); lean = 40 * b; hasBag = true;
    arms = { r: { sz: 0.5, sx: 0.1, el: 0.8, curl: 0.8 }, l: { sz: 0.35 + 0.55 * b, sx: 0.1, el: 0.3, curl: 0.2 + 0.6 * ease(lt, 6.9, 7.2) } }; hasBot = lt > 7.0; face = { look: [0.3, -0.5] }; }
  else if (lt < 9.6) { const s = seg(S.botS, S.binS, 7.7, 9.6, lt); bx = s.x; bz = s.z; ph = s.ph; walk = s.moving ? 1 : 0; yaw = s.psi - 0.45; hasBag = hasBot = true; arms = { r: { sz: 0.5, sx: 0.1, el: 0.8, curl: 0.8 }, l: { sz: 0.5, sx: 0.1, el: 0.8, curl: 0.8 } }; }
  else { bx = S.binS[0]; bz = S.binS[1]; const tu = ease(lt, 11.2, 11.9); yaw = lerp(-0.2, -PI / 2 + 0.45, tu); hasBag = lt < 10.6; hasBot = lt < 11.0;
    const o = ease(lt, 9.6, 10.2) * (1 - ease(lt, 11.0, 11.6)), cheer = ease(lt, 11.3, 11.8);
    arms = { r: { sz: lerp(0.5 + 0.8 * o, 1.5, cheer), sx: lerp(0.1, 0.5, cheer), el: lerp(0.8 - 0.4 * o, 0.3, cheer), curl: 0.6 }, l: { sz: lerp(0.5 + 0.7 * o, 1.5, cheer), sx: lerp(0.1, 0.5, cheer), el: lerp(0.8 - 0.4 * o, 0.3, cheer), curl: 0.6 } }; face = { expr: lt > 11.2 ? 'laugh' : 'smile', look: [0.3, 0.1] }; }
  PH(T, B, bx, bz, yaw, { walk, ph, lean, headTilt: 4, arms, headYaw: 0.1 * Math.sin(T * 1.4) }); fs(B, bF(T, face, 0.5));
  B.root.updateMatrixWorld(true); const hl = handPos(B, 0), hr = handPos(B, 1);
  /* the bag */
  bag.visible = true; bottle.visible = true; bottle.scale.setScalar(1.5); bag.scale.setScalar(0.8); bin.visible = true; bin.position.set(S.bin[0], TERR(S.bin[0], S.bin[1]), S.bin[1]);
  const fb = reachTo(S.bagS, psiB - 0.45, 120), fo = reachTo(S.botS, Math.atan2(-(S.bot[1] - S.botS[1]), S.bot[0] - S.botS[0]) - 0.45, 120);
  const binTop = [S.bin[0], TERR(S.bin[0], S.bin[1]) + 112, S.bin[1]];
  if (!hasBag) { if (lt < 4.45) bag.position.set(fb[0], TERR(fb[0], fb[1]) + 2, fb[1]); else { const k = ease(lt, 10.2, 10.85); bag.position.set(lerp(hr[0], binTop[0], k), lerp(hr[1], binTop[1] - 70 * k * k - 30 * k, k), lerp(hr[2], binTop[2], k)); if (k >= 1) bag.visible = false; } }
  else bag.position.set(hr[0], hr[1] - 74, hr[2] + 10);
  if (lt >= 10.6) { const k = ease(lt, 10.2, 10.85); if (lt > 10.85) bag.visible = false; }
  if (!hasBot) { if (lt < 7.0) { bottle.position.set(fo[0], TERR(fo[0], fo[1]) + 8, fo[1]); bottle.rotation.z = PI / 2; } else { const k = ease(lt, 10.6, 11.25); bottle.rotation.z = lerp(0, PI / 2, k) * 0; bottle.position.set(lerp(hl[0], binTop[0], k), lerp(hl[1], binTop[1] - 60 * k, k), lerp(hl[2], binTop[2], k)); if (lt > 11.25) bottle.visible = false; } }
  else { bottle.position.set(hl[0], hl[1] - 4, hl[2]); bottle.rotation.z = 0; }
  if (lt >= 4.45 && lt < 4.46) { /* no-op marker */ }
  /* the rabbi follows and finally pats the boy's shoulder */
  const R1 = [-170, 200], R2 = [160, 255], R3 = [205, 470];
  const ra = lt < 4.9 ? { x: R1[0], z: R1[1], ph: 0, moving: false, psi: 0 } : lt < 7.0 ? seg(R1, R2, 4.9, 7.0, lt) : lt < 7.4 ? { x: R2[0], z: R2[1], ph: 0, moving: false, psi: 0 } : seg(R2, R3, 7.4, 10.6, lt), rx = ra.x, rz = ra.z, rwalk = ra.moving ? 1 : 0;
  const rph = lt < 4.9 ? 0 : lt < 7.0 ? ra.ph : lt < 7.4 ? seg(R1, R2, 4.9, 7.0, 7.0).ph : seg(R1, R2, 4.9, 7.0, 7.0).ph + ra.ph;
  const pat = ease(lt, 11.7, 12.2) * (0.8 + 0.2 * Math.sin((lt - 12) * 9));
  PH(T, R, rx, rz, rwalk ? ra.psi - 0.4 : -PI / 2 + 0.35, { walk: rwalk, ph: rph, headYaw: -0.15, headTilt: 3, arms: { l: { sz: 0.2 + 0.9 * pat, sx: 0.2 + 0.5 * pat, el: 0.6 - 0.2 * pat, curl: 0.3 } } });
  fs(R, rF(T, { expr: 'smile', look: [0.4, 0.1] }));
  /* crab and gull cheer */
  if (lt >= 9.0) { show(CRAB); const cu = ease(lt, 9.0, 10.6), cx = lerp(640, 520, cu), cz = 640 - 30 * cu; pose(CRAB, { t: T, x: cx, z: cz, yaw: PI / 2 - 0.5, walk: cu > 0 && cu < 1 ? 1 : 0, ph: cu * 4, arms: lt > 11.3 ? 'up' : 'down', shadow: true }, TERR(cx, cz)); CRAB.root.scale.setScalar(0.8); fs(CRAB, { expr: lt > 11.3 ? 'cheering' : 'happy', blink: blinkAt(T, 0.2), look: [0.2, 0.2] }); }
  if (lt >= 8.8) { show(GULL); GULL.root.scale.setScalar(0.8); const gu = ease(lt, 8.8, 11.0), fly = gu < 1;
    const gx = lerp(950, 478, gu), gy = lerp(520, 112 + TERR(430, 590) + 6, gu) + (fly ? 60 * Math.sin(gu * PI) : 0), gz = lerp(300, 604, gu);
    pose(GULL, { t: T, x: gx, y: gy, z: gz, yaw: PI - 0.2 * (1 - gu) , flap: fly ? 0.5 + 0.5 * Math.sin(T * 10) : 0.15 * Math.sin(T * 8) * (lt > 11.3 ? 1 : 0), fly, shadow: !fly }); fs(GULL, { expr: lt > 11.3 ? 'cheering' : 'happy', blink: blinkAt(T, 0.4), look: [0, 0] }); }
  /* cameras: ahead of the walk so the boy is seen in 3/4 */
  if (lt < 4.9) return CAMS(lt, [{ t0: 0, t1: 4.9, p: [S.bagS[0] + 250, 185, S.bagS[1] + 500], p1: [S.bagS[0] + 230, 170, S.bagS[1] + 470], l: [-300, 185, 400], l1: [-220, 180, 420], f: 34 }]);
  if (lt < 8.4) return CAMS(lt, [{ t0: 4.9, t1: 8.4, p: [S.botS[0] + 270, 185, S.botS[1] + 520], p1: [S.botS[0] + 230, 170, S.botS[1] + 480], l: [-100, 185, 430], l1: [20, 180, 480], f: 34 }]);
  return CAMS(lt, [{ t0: 8.4, t1: 13.0, p: [110, 215, 1400], p1: [120, 210, 1360], l: [110, 160, 520], l1: [120, 160, 520], f: 38 }]);
}

function recap(lt, T) {
  const k = lt - 13.0, e = ease(lt, 13, 36.9);
  show(GB, R, B, GULL, CRAB); skyTo('dusk', 'late', e); beachTick(T, { dusk: true, A: 4, blow: 0.15, foam: 0.6 }); sun(lerp(0.07, -0.015, ease(lt, 14, 34)), '#ffcf3d', 0.38);
  fgTufts.forEach(t => { t.visible = false; });
  const rx = -612, rz = 480, bx = -316, bz = 492, br = Math.sin(T * 1.9) * 0.5 + 0.5;
  const gest = Math.max(0, Math.sin(T * 0.8)), nod = Math.max(0, Math.sin(T * 1.1 + 1));
  PH(T, R, rx, rz, -0.5, { headYaw: 0.35 + 0.2 * Math.sin(T * 0.5), headTilt: 2 + 2 * br, arms: { r: { sz: 0.2 + 0.8 * gest, sx: 0.2, el: 0.5, curl: 0.4 } } }); fs(R, rF(T, { look: [0.4 * Math.sin(T * 0.6), 0.1], talk: talkL(lt, 15, 34) }));
  PH(T, B, bx, bz, PI + 0.5, { headYaw: -0.3 + 0.18 * Math.sin(T * 0.7 + 1), headTilt: 3 + 4 * nod, arms: { r: { sz: lt > 24 && lt < 27 ? 1.2 : 0.15, sx: 0.12, el: 0.3, point: lt > 24 && lt < 27 } } }); fs(B, bF(T, { look: [-0.2 + 0.3 * Math.sin(T * 0.9), 0.2] }, 0.5));
  const cx = 560 + 30 * Math.sin(T * 0.25); show(CRAB); pose(CRAB, { t: T, x: cx, z: 430, yaw: PI / 2 - 0.4, walk: 0, arms: Math.sin(T * 0.9) > 0.5 ? 'up' : 'down' }, TERR(cx, 430)); CRAB.root.scale.setScalar(0.8); fs(CRAB, { expr: 'happy', blink: blinkAt(T, 0.2), look: [0.2, 0] });
  GULL.root.scale.setScalar(0.8); const pass = lin(lt, 21, 27), flying = pass > 0 && pass < 1;
  if (flying) pose(GULL, { t: T, x: lerp(-700, 900, pass), y: 520 + 40 * Math.sin(pass * 9), z: 300, yaw: 0, flap: 0.5 + 0.5 * Math.sin(T * 9), fly: true, shadow: false });
  else pose(GULL, { t: T, x: 700, y: TERR(700, 470) + 4, z: 470, yaw: PI / 2 - 0.3, flap: 0, fly: false, shadow: true });
  fs(GULL, { expr: 'happy', blink: blinkAt(T, 0.4), look: [0, 0] });
  /* slow 4 percent dolly; horizon at 46 percent, people small in the lower-left third, centre = sea and sky band only */
  const p = [lerp(150, 170, e), lerp(440, 430, e), lerp(2030, 1980, e)];
  return { p, l: [lerp(150, 170, e), 387, 670], fov: 36, veil: true };
}
