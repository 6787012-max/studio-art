/* film_b shots: setups (camera + world) and acts (poses) per shot. lt = seconds inside the shot. ASCII only. */
import { THREE, sm, cl, D2R, frac, V, KT, KP, L, ease, lerp, lerpv, blinkAt, WORLD, ST, AC, put, talk, REST, gy, PROM_Y, PROM_Z0, bottles, splash, splash2, hugeSplash, ruler, foamBig, wallWave, swell, stormCloud, rain1,
  hx, HUD, scr, txt, px, W, H, cam } from './fb_core.js';

export const ORDER = ['b1', 'b2', 'b3', 'b4', 'b4b', 'b5'];
export const DEFAULT_FOV = 32;
export const SH = {};
export const PI = Math.PI;
/* camera helpers: mv(p0,l0,p1,l1,fov0,fov1) eases from setup start to end */
export const mv = (p0, l0, p1, l1, f0, f1) => u => { const k = sm(u); return { p: lerpv(p0, p1, k), l: lerpv(l0, l1, k), fov: lerp(f0 || 32, f1 == null ? (f0 || 32) : f1, k) }; };
export const yawTo = (x, z, tx, tz) => Math.atan2(-(tz - z), tx - x);
export const fc = (x, z, cx, cz, o) => Math.atan2(-(cz - z), cx - x) + (o || 0);   // yaw that faces point (cx,cz), plus offset
export const lk = (x, y) => [x, y];
export const bl = (t, o) => blinkAt(t, o);
const sea = { s: () => WORLD.beachS, w: () => WORLD.beachW, o: () => WORLD.open };
export const face = (expr, t, o, extra) => Object.assign({ expr, blink: bl(t, o || 0) }, extra || {});

/* ======================================================================== b1 : who moves the sea (46.7 s) */
const RBX = 0, RBZ = 200, BOX = 190, BOZ = 215;
const wB = (t, A) => { const w = WORLD.beachS; w.update(t, A, 0.8); w.mirror.userData.setOp(0); w.refl.forEach(e => e.material.opacity = 0); return w; };
SH.b1 = {
  setups: [
    { a: 0, b: 4.5, w: 'beachS', cam: mv([430, 46, -380], [-150, 215, -2600], [300, 60, -420], [-200, 225, -2600], 34, 34) },
    { a: 4.5, b: 8.2, w: 'beachS', cam: mv([940, 195, -120], [135, 170, 200], [900, 190, -95], [135, 170, 200], 32, 31) },
    { a: 8.2, b: 10.9, w: 'beachS', cam: mv([700, 150, 30], [170, 150, 320], [650, 152, 50], [170, 150, 320], 30, 28) },
    { a: 10.9, b: 13.65, w: 'beachS', cam: mv([420, 150, 60], [20, 105, -90], [380, 150, 30], [20, 105, -100], 32, 31) },
    { a: 13.65, b: 17.7, w: 'beachS', cam: mv([1500, 175, -235], [640, 178, -235], [1450, 172, -235], [640, 178, -235], 32, 31) },
    { a: 17.7, b: 23.58, w: 'beachS', cam: mv([1420, 190, -120], [640, 175, -245], [1380, 185, -90], [640, 175, -245], 32, 31),
      wipe: { x: lt => 1.06 * ease(lt, 18.0, 21.2) - 0.03, left: { w: 'beachS', prep: lt => { const w = WORLD.beachS; w.update(ST.t, 24, 0.8); w.mirror.userData.setOp(0); w.refl.forEach(e => e.material.opacity = 0); } },
        right: { w: 'beachS', prep: lt => { const w = WORLD.beachS; w.update(ST.t, 0.45, 0.5); w.mirror.userData.setOp(0.86); w.refl.forEach(e => e.material.opacity = 0.55); } } } },
    { a: 23.58, b: 26.4, w: 'kitchen', cam: mv([160, 200, 860], [60, 150, 60], [70, 190, 780], [60, 150, 60], 32, 32) },
    { a: 26.4, b: 29.0, w: 'kitchen', cam: mv([420, 190, 400], [-80, 168, 60], [380, 188, 360], [-80, 168, 60], 30, 28) },
    { a: 29.0, b: 31.15, w: 'kitchen', cam: mv([240, 200, 360], [20, 135, 60], [210, 205, 320], [20, 135, 60], 30, 29) },
    { a: 31.15, b: 34.8, w: 'kitchen', cam: mv([280, 350, 440], [50, 118, 80], [260, 325, 410], [50, 118, 80], 36, 36) },
    { a: 34.8, b: 37.4, w: 'kitchen', cam: mv([250, 205, 330], [10, 135, 60], [230, 200, 300], [10, 135, 60], 30, 29), fg: 'leaves' },
    { a: 37.4, b: 39.51, w: 'kitchen', cam: mv([140, 200, 820], [60, 150, 60], [120, 195, 760], [60, 150, 60], 32, 32) },
    { a: 39.51, b: 41.6, w: 'kitchen', cam: mv([60, 700, 130], [60, 131, 60], [60, 940, 134], [60, 131, 60], 30, 30) },
    { a: 41.6, b: 43.8, w: 'open', cam: mv([0, 1500, 130], [0, 0, 0], [0, 1380, 130], [0, 0, 0], 30, 30) },
    { a: 43.8, b: 46.7, w: 'open', cam: mv([0, 1380, 130], [0, 0, 0], [-680, 175, 560], [90, 170, -260], 30, 34) },
  ],
  acts(lt, S, wp) {
    const t = ST.t;
    if (lt < 23.58) {
      const sb = WORLD.beachS;
      if (!S.wipe) { wB(t, lt < 4.5 ? 12 : lt < 13.65 ? 9 : 0.45); if (lt >= 13.65 && lt < 17.7) { sb.update(t, 0.45, 0.5); sb.mirror.userData.setOp(0.86); sb.refl.forEach(e => e.material.opacity = 0.55); } }
      // gull flying across (title) and a gull on the pier post (calm)
      const gu = lt < 4.5 ? { x: -700 + 260 * lt, y: 300 + 20 * Math.sin(lt * 1.4), z: -900 } : { x: 300 + 140 * (lt % 12), y: 380 + 30 * Math.sin(lt), z: -500 };
      if (lt < 4.5 || (lt > 10.9 && lt < 13.65)) put('gull', { x: gu.x, y: gu.y, z: gu.z, yaw: 0.2, fly: true, flap: 1, shadow: false }, { expr: 'happy' });
      if (lt >= 13.65 && lt < 23.58) { const f = sb.sea.float(758, -300, 60); put('gull2', { x: 712, y: 98, z: -520, yaw: PI * 0.9 + 0.2 * Math.sin(lt * 0.5), flap: 0 }, face('curious', t, 0.4)); }
      if (lt >= 13.65) {   // c2: rabbi + boy on the pier watch the same place calm, then wavy
        const g1 = ease(lt, 14.4, 15.1) * (1 - ease(lt, 17.2, 17.8)), g2 = ease(lt, 19.0, 19.6), sp = lt > 19.3 ? 'surprised' : 'smile';
        put('rabbi', { x: 690, z: -335, y: 46, yaw: fc(690, -335, 1500, -235, -0.5), headYaw: 0.05, arms: { l: { sz: 0.45, sx: 0.1, el: 1.1, curl: 0.5 }, r: { sz: 0.08 + 0.9 * (g1 + g2 * 0.6), sx: 0.25, el: 0.5, curl: 0.3 } } }, face('explaining', t, 0.1, { look: lk(0.2, 0), talk: talk(lt, 14.0, 22.0) }));
        put('boy', { x: 690, z: -125, y: 46, yaw: fc(690, -125, 1500, -235, 0.5), headYaw: -0.05, arms: { l: { sz: 0.08 }, r: { sz: 0.08 + 0.4 * g2, sx: 0.2, el: 0.9 * g2 + 0.3 } } }, face(sp, t, 0.6, { look: lk(-0.2, 0.1) }));
      }
      // rabbi + boy + Tipa on the beach (c1): side camera, sea on the right of frame, faces 3/4 to camera
      if (lt >= 4.5 && lt < 13.65) {
        const rx = 94, rz = 136, bxx = 170, bzz = 320, CX = 900, CZ = -120;
        const pt = ease(lt, 4.7, 5.3);
        const talkR = talk(lt, 6.2, 8.1);
        const scr2 = ease(lt, 8.4, 9.0) * (1 - ease(lt, 10.2, 10.8));
        put('rabbi', { x: rx, z: rz, y: gy(rx, rz), yaw: fc(rx, rz, CX, CZ, -0.5), headYaw: 0.1 * Math.sin(lt * 0.8), arms: { l: { sz: 0.55, sx: 0.1, el: 1.15, curl: 0.5 }, r: { sz: lerp(0.08, 0.95, ease(lt, 6.0, 6.6)), sx: 0.25, el: lerp(0.3, 0.6, ease(lt, 6.0, 6.6)), curl: 0.3 } } }, face('explaining', t, 0.1, { talk: talkR, look: lk(0.2, 0) }));
        put('boy', { x: bxx, z: bzz, y: gy(bxx, bzz), yaw: fc(bxx, bzz, CX, CZ, 0.4), headYaw: -0.1 - 0.1 * scr2, headTilt: 6 * scr2, arms: { r: { sz: 0.08 }, l: { sz: lerp(0.08, 1.5, pt) * (1 - scr2) + 2.1 * scr2, sx: 0.28, el: lerp(0.3, 0.12, pt) * (1 - scr2) + 2.0 * scr2, point: pt > 0.5 && scr2 < 0.1, curl: 0.4 } } }, face('thinking', t, 0.6, { look: lk(0.5, 0.1) }));
        const tx = 10, tz = -70, f = sb.sea.float(tx, tz, 70);
        put('tipa', { x: tx, y: f.y - 46, z: tz, yaw: fc(tx, tz, CX, CZ, -0.3), tilt: f.rz * 40, float: 0.45, arms: lt > 11.5 ? 'wave' : 'down', feet: false, shadow: false }, face(lt > 11.5 ? 'happy' : 'curious', t, 0.3, { look: lk(0.4, 0) }));
      }
    } else if (lt < 39.51) {
      const kw = WORLD.kitchen;
      const blowA = ease(lt, 29.3, 31.0) * 2.4 + ease(lt, 31.2, 33.5) * 2.8;
      kw.update(t, blowA, 'day', 0.15);
      kitchenActs(lt, t);
    } else {
      if (lt < 41.6) { WORLD.kitchen.update(t, 5.2, 'day', 0.15); kitchenActs(lt, t); }
      else {
        const ow = WORLD.open, gx = lerp(-2400, -250, ease(lt, 41.8, 46.3)), calm = lt > 41.8 ? [gx + 5200, 0, 5000, 20000, 0.25] : null;
        ow.update(t, lt < 43.8 ? 14 : 10 + 24 * ease(lt, 43.8, 46.7), calm);
        if (lt >= 43.8) {
          put('gust', { x: gx, y: 330 + 24 * Math.sin(t * 1.3), z: -40, yaw: -0.12, blow: 1, scale: 2.4 }, { expr: 'happy', blow: 1, blink: bl(t, 0.2) });
          const tx = 140, tz = 120, f = ow.sea.float(tx, tz, 70);
          put('tipa', { x: tx, y: f.y - 46, z: tz, yaw: yawTo(tx, tz, -680, 560), tilt: f.rz * 40, float: 0.4, arms: lt > 45 ? 'up' : 'down', feet: false, shadow: false }, face(lt > 45 ? 'cheering' : 'surprised', t, 0.3, { look: lk(-0.5, -0.2) }));
        }
      }
    }
  },
};
function kitchenActs(lt, t) {
  const bx0 = -120, bz0 = 105, rx0 = 340, rz0 = 110;
  const inhale = ease(lt, 26.4, 28.3) * (1 - ease(lt, 28.5, 28.9)), blow = ease(lt, 28.9, 29.3) * (1 - ease(lt, 33.8, 34.4));
  const laugh = ease(lt, 34.6, 35.0);
  const lean = 8 * (1 - inhale) + 14 * blow - 6 * inhale - 10 * laugh;
  const bfx = laugh > 0.5 ? 'laugh' : blow > 0.5 ? 'explaining' : 'thinking';
  put('boy', { x: bx0, z: bz0, y: 0, yaw: -0.55, lean: lean, headRot: -14 * inhale + 10 * blow, headTilt: 10 * blow, headYaw: 0.1, arms: { l: { sz: 0.35 + 0.5 * inhale, sx: 0.2, el: 0.6 }, r: { sz: 0.35 + 0.5 * inhale + 0.9 * laugh, sx: 0.2, el: 0.6 + 0.7 * laugh } } },
    { expr: bfx, blink: inhale > 0.3 && inhale < 0.9 ? true : bl(t, 0.6), talk: blow > 0.5 ? 'O' : (inhale > 0.4 ? 'M' : null), look: lk(0.4, -0.3) });
  const rg = ease(lt, 25.0, 25.6) * (1 - ease(lt, 27.0, 27.6)) + ease(lt, 37.4, 38.0);
  put('rabbi', { x: rx0, z: rz0, y: 0, yaw: PI + 0.5, headYaw: -0.15, headTilt: 6, arms: { l: { sz: 0.45, sx: 0.1, el: 1.1, curl: 0.5 }, r: { sz: 0.08 + 0.7 * rg, sx: 0.3, el: 0.4 + 0.5 * rg, curl: 0.3 } } },
    { expr: laugh > 0.5 ? 'laugh' : 'smile', blink: bl(t, 0.1), talk: talk(lt, 24.0, 26.0) || talk(lt, 37.4, 39), look: lk(-0.4, -0.3) });
}
const stub = { setups: [{ a: 0, b: 999, w: 'beachS', cam: mv([900, 215, 380], [40, 165, 190], [800, 208, 340], [20, 172, 190], 32, 32) }], acts(lt) { WORLD.beachS.update(ST.t, 8, 0.8); } };
for (const k of ORDER) if (!SH[k]) SH[k] = stub;
