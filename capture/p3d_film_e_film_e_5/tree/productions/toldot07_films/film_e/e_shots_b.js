/* film_e shots part B: e2b (deepest place), e3 (full of life), e4 (three treasures), e5 (recap). ASCII only. */
import { THREE, sm, cl, frac, V, KT, KP, L, P, ease, lerp, lerpv, blinkAt, WORLD, ST, AC, put, talk, gy, ENVP, hx, HUD, scr, px, W, H, cam, tint, glowAt, cupHand, part, ell, tubeAlong, leafGeo, OL } from './e_core.js';
import { YM, MY, YT, MT } from './e_w1.js';
import { PIT } from './e_w2.js';
import { SH, PI, mv, yawTo, lk, face, tt, env, bob, roll, boatAt, onBoat, rrect, tx, fmt, hudV, depthGauge, dashLine, dblArrow, ripples, whiteFlash, bubblesHud } from './e_shots.js';
const { M } = KT;
const BOTT = YT(5109);

let chests = [], gillInit = false;
export function initB() {
  const bg = WORLD.beach.g;
  chests = ['drop', 'salt', 'flame'].map((k, i) => { const c = P.makeChest(k); c.rotation.y = PI; c.visible = false; bg.add(c); const col = ['#bfe8ff', '#ffffff', '#ffb050'][i]; const gl = L.makeGlow(col, 150, { alpha: 0.8 }); gl.position.set(0, 0, 0); c.userData.ic.add(gl); c.userData.gl = gl; return c; });
  // gills on the close-up fish f0: two arcs + a flap, both sides
  const fish = AC.f0.o.inner, ink = M(OL, OL, 0);
  const flaps = [];
  for (const s of [1, -1]) { const g = new THREE.Group(); g.position.set(18, 0, s * 51); fish.add(g);
    for (const dx of [0, -9]) part(g, tubeAlong([V(dx, 44, 0), V(dx - 12, 18, 0), V(dx - 15, -8, 0), V(dx - 8, -34, 0)], 2.3, { segs: 14, radial: 5, round: false }), ink, 0);
    const fl = new THREE.Group(); fl.position.set(10, 0, 0); g.add(fl); const lg = leafGeo(70, 24, 0.12); lg.translate(0, -34, 0); part(fl, lg, M('#6aa8e8', '#b8c0e0'), 1.4); fl.userData.s = s; flaps.push(fl); }
  AC.f0.o.gill = flaps;
  gillInit = true;
}
const gillOpen = (o) => { AC.f0.o.gill.forEach(f => { f.rotation.y = f.userData.s * o * 0.55; }); };

/* ======================================================================== e2b : the deepest place (39.1 s) */
const TS = lt => { const u = ease(lt, 16.0, 21.2), x = lerp(-640, -420, u); const SEC = WORLD.trench.SEC; return { x, y: lerp(-70, SEC.yAt(x) + 100, u), u }; };
const topY = BOTT + 2400;
SH.e2b = {
  setups: [
    { a: 0, b: 4.0, w: 'map', cam: mv([1450, 560, 900], [1450, 0, 440], [1380, 700, 960], [1360, 0, 380], 32, 32) },
    { a: 4.0, b: 9.85, w: 'map', cam: mv([1380, 700, 960], [1360, 0, 380], [120, 3500, 2700], [130, 0, 260], 32, 34) },
    { a: 9.85, b: 13.2, w: 'map', cam: mv([120, 3500, 2700], [130, 0, 260], [520, 1500, 1350], [420, 0, 110], 34, 32) },
    { a: 13.2, b: 15.57, w: 'map', cam: mv([520, 1500, 1350], [420, 0, 110], [450, 520, 780], [408, 0, 95], 32, 30) },
    { a: 15.57, b: 21.2, w: 'trench', cam: u => { const T = TS(15.57 + u * 5.63); return { p: [T.x + 520, T.y + 30, 1250], l: [T.x - 20, T.y - 70, 60], fov: 30 }; } },
    { a: 21.2, b: 23.53, w: 'trench', cam: mv([0, -1280, 4700], [0, -1280, 0], [0, -1400, 4300], [0, -1400, 0], 32, 32) },
    { a: 23.53, b: 27.5, w: 'trench', cam: mv([-100, -1750, 4300], [-100, -1750, 0], [-100, -1550, 4700], [-100, -1500, 0], 32, 32) },
    { a: 27.5, b: 31.49, w: 'trench', cam: mv([-100, -1500, 4700], [-100, -1450, 0], [-100, -1320, 5200], [-100, -1300, 0], 32, 32) },
    { a: 31.49, b: 35.3, w: 'trench', cam: mv([-330, -360, 1250], [-110, -110, 0], [-260, -300, 1100], [-110, -90, 0], 38, 36) },
    { a: 35.3, b: 38.7, w: 'trench', cam: mv([-90, 120, 1020], [-100, 235, 0], [-110, 125, 960], [-100, 235, 0], 32, 31) },
  ],
  acts(lt, S, u) {
    const t = ST.t;
    if (lt < 15.57) { env({ sI: lt < 9.85 ? ease(lt, 0.5, 1.5) : 0, sG: lt >= 9.85 ? ease(lt, 9.85, 10.8) : 0 }); return; }
    const SEC = WORLD.trench.SEC, d = [ease(lt, 23.6, 24.7), ease(lt, 24.8, 25.9), ease(lt, 26.0, 27.1), ease(lt, 27.2, 28.3)];
    const bt = boatAt(t, -100, 0, 0, 0.7), boatOn = lt > 30.5;
    env({ drop: lt < 23.53 ? [0, 0, 0, 0] : d, boat: boatOn ? bt : false });
    if (lt < 23.53) {
      const T = TS(lt), landed = lt > 21.2;
      put('tipa', { x: T.x, y: landed ? SEC.yAt(T.x) + 2 : T.y, z: 100, yaw: PI + 0.5, tilt: landed ? 0 : -24, float: landed ? 0.1 : 0.9, arms: landed ? 'wave' : 'up', feet: landed, shadow: false, scale: 0.9 }, face(landed ? 'surprised' : 'curious', t, 0.3, { look: lk(-0.3, landed ? 0.7 : -0.3), talk: tt(lt, 21.5, 23) }));
      return; }
    if (lt < 31.49) {
      put('tipa', { x: -900, y: SEC.yAt(-900) + 2, z: 200, yaw: -0.6, feet: true, shadow: false, scale: 1.0, arms: lt < 30.5 ? 'up' : 'wave' }, face('surprised', t, 0.3, { look: lk(0.5, 0.8) }));
      return; }
    // c5: Tipa on the top mountain waves to the surface; the boy (in the boat above) is amazed
    const tp = BOTT + 2400 + 4;
    put('tipa', { x: -100, y: tp, z: 20, yaw: -PI / 2 + 0.3, feet: true, shadow: false, scale: 0.42, arms: 'wave', float: 0.1 }, face('cheering', t, 0.3, { look: lk(0, 0.8), talk: tt(lt, 32.5, 34.5) }));
    const bp = onBoat(bt, 150, 40), rp = onBoat(bt, -135, -10);
    put('boy', { x: bp[0], z: bp[2], y: bp[1], yaw: -PI / 2 + 0.2, lean: 18 + 6 * ease(lt, 35.3, 36), headTilt: 3, arms: { l: { sz: 0.4, el: 0.5 }, r: { sz: 0.4 + 0.5 * ease(lt, 35.8, 36.5), sx: 0.3, el: 0.7 } } }, face('surprised', t, 0.6, { look: lk(0.1, -0.7) }));
    put('rabbi', { x: rp[0], z: rp[2], y: rp[1], yaw: -PI / 2 + 0.5, arms: { l: { sz: 0.12 }, r: { sz: 0.12 } } }, face('smile', t, 0.2, { look: lk(0.2, -0.4) }));
  },
  hud(lt, S, u, wn) {
    if (wn === 'map') {
      if (lt < 4.0) { const p = scr(WORLD.map.sI.position); ripples(p[0], p[1], ST.t, 0.9, '#ffd447'); }
      if (lt >= 4.0 && lt < 9.85) { ripples(W * 0.5, H * 0.46, ST.t * 0.8, ease(lt, 5.0, 6.0) * (1 - ease(lt, 9.0, 9.85)) * 0.7, '#ffffff'); }
      return; }
    if (lt >= 15.57 && lt < 23.53) {
      const T = TS(lt), m = lt > 21.2 ? 5109 : Math.min(5109, MT(T.y)), k = ease(lt, 15.8, 16.4);
      depthGauge(m / 5109, `${fmt(lt > 21.6 ? 5109 : m)} m`, { a: k, size: 40 });
      tint('#050f2a', cl((m - 300) / 4500, 0, 0.36));
    }
    if (lt >= 23.53 && lt < 31.49) { depthGauge(1, '5,109 m', { a: 1, size: 40 }); tint('#050f2a', 0.42 * (1 - ease(lt, 29, 31.5))); }
  },
};

/* ======================================================================== e3 : full of life (57.6 s) */
const JW = [33.78, 37.38], JP = 3.6;   // jump starts (shot time)
const jump = (lt, t0, x0, dir) => { const s = lt - t0; if (s < 0 || s > 1.9) return null; const k = s / 1.6, u = cl(k, 0, 1), X = x0 + dir * 560 * u, Y = -95 + 300 * Math.sin(PI * u), dy = 300 * PI * Math.cos(PI * u), pitch = Math.atan2(dy, 560); return { x: X, y: Y, pitch: dir > 0 ? pitch : -pitch, u: k, puff: ease(k, 0.08, 0.22) * (1 - ease(k, 0.66, 0.8)) }; };
const PX = (x, z) => gy(x, z) - 17;
const crawlX = u => PIT[0] + 40 * Math.sin(u * 3.2) - 20 * u;
const BAB = i => 53.1 + 0.14 * i;
SH.e3 = {
  setups: [
    { a: 0, b: 4.2, w: 'reef', cam: mv([-1300, 330, 520], [-100, 270, -1500], [-900, 300, 430], [-100, 260, -1500], 34, 34) },
    { a: 4.2, b: 8.41, w: 'reef', cam: mv([-120, 240, 460], [-480, 250, -400], [-200, 230, 420], [-500, 250, -400], 33, 31), fg: 'reef' },
    { a: 8.41, b: 11.9, w: 'cabin', cam: mv([440, 190, 270], [335, 150, -118], [395, 188, 236], [335, 151, -118], 26, 23) },
    { a: 11.9, b: 17.92, w: 'reef', cam: mv([-900, 300, 560], [-400, 290, -650], [300, 300, 560], [350, 290, -650], 33, 32), fg: 'weed' },
    { a: 17.92, b: 21.5, w: 'reef', cam: mv([330, 370, 640], [20, 352, -300], [270, 360, 600], [10, 350, -300], 32, 30) },
    { a: 21.5, b: 25.17, w: 'reef', cam: mv([130, 340, 640], [140, 335, -300], [80, 330, 600], [130, 335, -300], 36, 35) },
    { a: 25.17, b: 28.8, w: 'reef', cam: mv([100, 300, 640], [-100, 280, -500], [-60, 300, 560], [-120, 280, -500], 36, 34), fg: 'weed' },
    { a: 28.8, b: 33.18, w: 'reef', cam: mv([220, 300, 330], [-80, 285, -450], [160, 305, 300], [-120, 285, -450], 32, 28) },
    { a: 33.18, b: 36.8, w: 'surf', cam: mv([-540, 120, 440], [150, 205, -430], [-500, 125, 410], [130, 205, -430], 36, 35) },
    { a: 36.8, b: 40.43, w: 'surf', cam: mv([-430, 95, 340], [150, 215, -450], [-380, 100, 310], [130, 215, -450], 37, 36) },
    { a: 40.43, b: 44.6, w: 'night', cam: mv([-250, 95, 700], [-150, 135, -300], [-200, 85, 640], [-150, 125, -300], 34, 34), fg: 'grass' },
    { a: 44.6, b: 47.0, w: 'night', cam: mv([420, 80, 360], [-110, 50, 440], [370, 76, 380], [-110, 50, 440], 30, 28) },
    { a: 47.0, b: 49.19, w: 'night', cam: mv([140, 72, 300], [-120, 36, 392], [110, 66, 330], [-120, 34, 392], 27, 24) },
    { a: 49.19, b: 52.6, w: 'night', cam: mv([320, 70, 560], [-120, 60, 380], [280, 66, 530], [-120, 60, 380], 33, 32) },
    { a: 52.6, b: 54.9, w: 'night', cam: mv([130, 40, 500], [-120, 40, 385], [100, 52, 470], [-120, 52, 385], 28, 26) },
    { a: 54.9, b: 57.6, w: 'night', cam: mv([-120, 125, -330], [-120, 175, 420], [-110, 128, -290], [-120, 175, 420], 34, 33) },
  ],
  acts(lt, S, u) {
    const t = ST.t;
    // ---------------- reef part
    if (lt < 8.41 || (lt >= 11.9 && lt < 33.18)) {
      env({ gb: null });
      if (lt < 8.41) {
        const tx_ = lt < 4.2 ? lerp(-1500, -700, ease(lt, 0.4, 4.2)) : -480 + 20 * Math.sin(lt), tz = lt < 4.2 ? -900 : -400;
        put('tipa', { x: tx_, y: 250 + 12 * Math.sin(lt * 2), z: tz, yaw: lt < 4.2 ? 0.2 : -PI / 2 + 0.5, tilt: lt < 4.2 ? -6 : 0, float: 0.9, arms: lt < 4.2 ? 'wave' : 'up', feet: false, shadow: false, scale: 1 }, face(lt < 4.2 ? 'happy' : 'cheering', t, 0.3, { look: lk(0.3, 0), talk: tt(lt, 5.4, 7.8) }));
        const fx = lt < 4.2 ? 0 : 1;
        put('f0', { x: -150 + 60 * Math.sin(lt * 0.6), y: 300 + 20 * Math.sin(lt * 1.3), z: -520, yaw: 0.3, swim: 0.6, scale: 1.0 }, face('happy', t, 0.1));
        put('f1', { x: -700 + 40 * Math.sin(lt * 0.5), y: 190 + 20 * Math.sin(lt * 1.1), z: -300, yaw: PI - 0.4, swim: 0.7, scale: 0.9 }, face('cheering', t, 0.5));
        put('f2', { x: -250, y: 120 + 10 * Math.sin(lt * 1.5), z: -250, yaw: 0.4 + 0.3 * Math.sin(lt * 0.7), swim: 0.5, scale: 0.8 }, face('happy', t, 0.7));
        put('crab', { x: lerp(-700, -300, ease(lt, 3, 8.4)), y: 0, z: -180, yaw: 0, walk: 0.8, ph: lt * 0.9, arms: lt > 5 ? 'up' : 'down', scale: 1.1, shadow: false }, face('happy', t, 0.9));
        return;
      }
      if (lt < 17.92) {      // big fish and tiny fish pass
        const bx_ = lerp(-1300, 1000, ease(lt, 11.9, 17.9));
        put('f3', { x: bx_, y: 310 + 14 * Math.sin(lt * 1.2), z: -650, yaw: 0.0, swim: 0.55, scale: 2.7 }, face('happy', t, 0.2));
        put('f4', { x: bx_ + 330 + 25 * Math.sin(lt * 1.5), y: 330 + 20 * Math.sin(lt * 1.8), z: -380, yaw: 0.0, swim: 0.9, scale: 0.5 }, face('cheering', t, 0.4));
        put('f1', { x: bx_ - 480, y: 390, z: -820, yaw: 0, swim: 0.6, scale: 1.3 }, face('happy', t, 0.6));
        put('tipa', { x: -520 + 80 * ease(lt, 11.9, 17.9), y: 190 + 10 * Math.sin(lt * 2.1), z: -250, yaw: -PI / 2 + 0.2, float: 0.9, arms: 'wave', feet: false, shadow: false, scale: 0.9 }, face('happy', t, 0.3, { look: lk(0.6, 0.1) }));
        return;
      }
      if (lt < 25.17) {      // gills close-up
        const open = 0.5 + 0.5 * Math.sin(lt * 3.2); gillOpen(open);
        const fp = { x: 0, y: 262, z: -300, yaw: 0.2 };
        put('f0', Object.assign({ swim: 0.2, scale: 2.2 }, fp), face('happy', t, 0.1));
        const c = Math.cos(fp.yaw), s = Math.sin(fp.yaw), lx = 20 * 2.2, lz = 55 * 2.2;
        env({ gb: lt > 18.6 ? [fp.x + lx * c + lz * s, fp.y + 20, fp.z - lx * s + lz * c] : null });
        put('tipa', { x: lt < 21.5 ? 520 : 360, y: lt < 21.5 ? 300 : 230, z: lt < 21.5 ? -100 : -110, yaw: PI + 0.5, float: 0.9, arms: lt > 21.5 ? 'point' : 'down', feet: false, shadow: false, scale: lt < 21.5 ? 0.6 : 0.8 }, face(lt > 21.5 ? 'curious' : 'happy', t, 0.3, { look: lk(-0.5, 0), talk: tt(lt, 22, 24.5) }));
        return;
      }
      // c4 dolphin
      const dx = lerp(1700, lt < 28.8 ? 250 : 180, ease(lt, 25.2, 28.6)) - (lt > 28.8 ? 20 * (lt - 28.8) : 0);
      gillOpen(0.5 + 0.5 * Math.sin(lt * 3.2));
      put('f0', { x: -760, y: 280 + 14 * Math.sin(lt), z: -560, yaw: -0.2, swim: 0.3, scale: 1.8 }, face('happy', t, 0.1));
      put('dolphin', { x: dx, y: 300 + 12 * Math.sin(lt * 0.9), z: -480, yaw: PI, swim: 0.55 + 0.2 * (lt < 28.8 ? 1 : 0), pitch: 0.03 * Math.sin(lt), scale: 0.9, blink: blinkAt(t, 0.3), look: lk(-0.5, 0) }, {});
      put('tipa', { x: lt < 28.8 ? -300 : 20, y: 290, z: -250, yaw: lt < 28.8 ? PI + 0.7 : -PI / 2 - 0.4, float: 0.9, arms: lt > 30 ? 'point' : (lt > 28.8 ? 'wave' : 'up'), feet: false, shadow: false, scale: 0.7 },
        face(lt > 31.4 ? 'surprised' : lt > 28.8 ? 'curious' : 'happy', t, 0.3, { look: lk(0.4, 0), talk: tt(lt, 29, 31) }));
      return;
    }
    if (lt >= 8.41 && lt < 11.9) {   // sefer insert in the cabin
      env({ glow: 1.5 });
      put('rabbi', { x: 120, z: -70, y: 0, yaw: -0.55, headYaw: 0.08, arms: { l: { sz: 0.12 }, r: { sz: 0.9 * ease(lt, 8.7, 9.3), sx: 0.3, el: 0.6, curl: 0.3 } } }, face('proud', t, 0.2, { look: lk(0.4, -0.2) }));
      put('boy', { x: -80, z: -30, y: 0, yaw: -0.2, headTilt: 5, arms: { l: { sz: 0.08 }, r: { sz: 0.08 } } }, face('smile', t, 0.5, { look: lk(0.3, -0.1) }));
      return;
    }
    // ---------------- c5 dolphin jumps (surface world)
    if (lt < 40.43) {
      const j1 = jump(lt, JW[0], -280, 1), j2 = jump(lt, JW[1], 260, -1);
      env({ A: 7, boat: boatAt(t, 370, -310, 0.0, 0.4) });
      const j = j1 || j2; const s0 = lt < 36 ? JW[0] : JW[1];
      if (j) { put('dolphin', { x: j.x, y: j.y, z: -520, yaw: j === j1 ? 0 : PI, pitch: j.pitch, swim: 0.6, scale: 0.9, puff: j.puff, blink: false }, {}); }
      const sp = lt >= 35.1 && lt < 36.2 ? [-280 + 560 * 0.95, -520, (lt - 35.1) / 1.1] : (lt >= 38.7 && lt < 39.8 ? [260 - 560 * 0.95, -520, (lt - 38.7) / 1.1] : null);
      if (sp) env({ splash: sp });
      const bt = boatAt(t, 370, -310, 0.0, 0.4), rp = onBoat(bt, -135, 0), bp = onBoat(bt, 135, 30);
      put('rabbi', { x: rp[0], z: rp[2], y: rp[1], yaw: PI - 0.2, arms: { l: { sz: 0.12 }, r: { sz: 0.2 + 0.6 * ease(lt, 34, 34.6) } } }, face('smile', t, 0.2, { look: lk(-0.5, 0.3) }));
      put('boy', { x: bp[0], z: bp[2], y: bp[1], yaw: PI + 0.2, arms: { l: { sz: 0.3, el: 0.5 }, r: { sz: 0.9 * (j ? 1 : 0.3), sx: 0.3, el: 0.5 } } }, face(j ? 'surprised' : 'smile', t, 0.6, { look: lk(-0.5, 0.3) }));
      return;
    }
    // ---------------- c6 / c7 night beach and dawn
    const day = false;
    const gp = WORLD.night.pitY;
    if (lt < 49.19) {
      let q = null;
      if (lt < 44.6) { const uu = ease(lt, 40.5, 44.4), z = lerp(55, PIT[1] + 120, uu), x = crawlX(uu); q = { x, z, ph: (uu * 470) / 90, move: 1 - ease(lt, 44.2, 44.6), tr: uu, dig: 0 }; env({ track: uu }); }
      else { q = { x: crawlX(1), z: PIT[1] + 120, ph: 0, move: 0, dig: ease(lt, 44.6, 45.2) * (1 - ease(lt, 47.3, 47.8) * 0.5) }; env({ track: 1, hole: ease(lt, 44.8, 46), burst: lt < 47 ? frac(lt * 1.6) : 0, eggs: Math.floor(16 * ease(lt, 47.3, 49.0)) }); }
      put('turtle', { x: q.x, y: PX(q.x, q.z), z: q.z, yaw: -PI / 2 + (lt < 44.6 ? 0.25 : 0.1), ph: q.ph, move: q.move, dig: q.dig, pitch: lt > 47 ? 0.12 : 0, headUp: lt < 44.6 ? 0.8 : 0.2 * Math.sin(lt * 2), scale: 1.0, blink: blinkAt(t, 0.2) }, {});
      if (lt >= 44.6) { put('rabbi', { x: -850, z: 720, y: gy(-850, 720), yaw: 0.15, arms: { l: { sz: 0.12 }, r: { sz: 0.12 } } }, face('smile', t, 0.2, { look: lk(0.4, 0) })); put('boy', { x: -750, z: 740, y: gy(-750, 740), yaw: 0.3, arms: { l: { sz: 0.08 }, r: { sz: 0.08 } } }, face('smile', t, 0.5, { look: lk(0.4, 0) })); }
      return;
    }
    // c7
    env({ day, moonBack: lt >= 54.9, mound: ease(lt, 49.19, 49.6), eggs: lt < 52.9 ? 16 : 0, hole: 0, track: 1, burst: lt > 52.9 ? ease(lt, 52.9, 53.9) * (1 - ease(lt, 54.0, 54.8)) : 0 });
    if (lt >= 52.6) {
      for (let i = 0; i < 8; i++) { const ti = BAB(i); if (lt < ti) continue; const d = Math.max(0, (lt - ti - 0.5) * 120), z = Math.max(60, PIT[1] - 10 - d), x = PIT[0] + (i - 3.5) * 40 * Math.min(1, 0.4 + d / 300) + 30 * Math.sin(d * 0.01 + i);
        put('baby' + i, { x, y: PX(x, z) + 0, z, yaw: PI / 2 + 0.1 * Math.sin(d * 0.05 + i), ph: d / 22, move: lt - ti > 0.5 && z > 60 ? 1 : 0, sink: (lt - ti < 0.5 ? 10 * (1 - (lt - ti) / 0.5) : 0), scale: 1.0 }, {}); } }
    if (lt >= 54.9) {
      const pump = 0.12 * Math.sin(lt * 6);
      put('boy', { x: -330, z: 520, y: gy(-330, 520), yaw: PI / 2 - 0.5, arms: { l: { sz: 0.1 }, r: { sz: 3.05 + 0.45 * pump, sx: -0.5, el: 0.12 + 0.2 * Math.max(0, pump * 4), curl: 1.4 } } }, face('smile', t, 0.6, { look: lk(0.35, 0.1), talk: (frac(lt * 1.7) < 0.6) ? 'A' : 'E' }));
      put('rabbi', { x: 30, z: 560, y: gy(30, 560), yaw: PI / 2 + 0.55, headYaw: 0.15 * Math.sin(lt * 1.1), arms: { l: { sz: 0.12 }, r: { sz: 0.12 + 0.12 * Math.sin(lt * 2.1) } } }, face('smile', t, 0.2, { look: lk(-0.3, 0.05) }));
    }
  },
  hud(lt, S, u, wn) {
    if (wn === 'night') {
      const day = false, a = lt < 49.19 ? 0.55 : 0.46;
      if (!day) { const qx = lt < 44.6 ? crawlX(ease(lt, 40.5, 44.4)) : crawlX(1), qz = lt < 44.6 ? lerp(55, PIT[1] + 120, ease(lt, 40.5, 44.4)) : PIT[1] + 120; const sp = scr([qx, 60, qz]); tint('#06143a', a, [sp[0], sp[1], px(520), 0.7]); }
      else tint('#ff9a60', Math.max(0.02, a * 0.9));
      if (lt >= 49.19 && lt < 52.6) {   // calendar flips: 1 -> 2
        const k = ease(lt, 49.4, 50.0), f = ease(lt, 50.5, 51.3), alpha = Math.min(1, k) * (1 - ease(lt, 52.1, 52.6));
        hudV(() => { hx.globalAlpha = alpha; const x = 700, y = 150, w = 520, h = 560;
          const page = (num, sy, yy) => { hx.save(); hx.translate(x + w / 2, yy); hx.scale(1, Math.max(0.001, sy)); hx.translate(-w / 2, 0); rrect(0, 0, w, h, 34); hx.fillStyle = '#fffaf0'; hx.fill(); hx.lineWidth = 9; hx.strokeStyle = '#261c19'; hx.stroke();
            hx.save(); rrect(0, 0, w, 140, 34); hx.clip(); hx.fillStyle = '#d9534f'; hx.fillRect(0, 0, w, 140); hx.restore(); hx.lineWidth = 9; hx.strokeStyle = '#261c19'; hx.beginPath(); hx.moveTo(0, 140); hx.lineTo(w, 140); hx.stroke();
            for (const rx of [120, 400]) { hx.fillStyle = '#e8e8ea'; hx.beginPath(); hx.arc(rx, 20, 22, 0, 7); hx.fill(); hx.stroke(); }
            hx.fillStyle = '#ffe9a8'; hx.beginPath(); hx.arc(80, 82, 34, 0, 7); hx.fill(); hx.stroke(); hx.fillStyle = '#d9534f'; hx.beginPath(); hx.arc(100, 72, 28, 0, 7); hx.fill();
            hx.restore(); tx(num, x + w / 2, yy + 360 * Math.max(0.2, sy), 250 * Math.max(0.2, sy), '#261c19'); };
          if (f < 0.5) page('1', 1 - f * 2, y); else page('2', (f - 0.5) * 2, y); });
      }
    }
  },
};

/* ======================================================================== e4 : three treasures (56.4 s) */
const CHX = [-290, 0, 290], CHZ = 250;
const chestPose = (i, lt) => { const p = ease(lt, 0.9 + 1.2 * i, 4.2 + 0.4 * i), x = CHX[i] + (i - 1) * 10, z = lerp(-240, CHZ, p), g0 = gy(x, z); const y = lerp(-110, Math.max(g0, 2), Math.min(1, p * 2.4)) + (p > 0.5 && p < 0.98 ? 16 * Math.abs(Math.sin(p * 20)) : 0); return { x, y, z, p }; };
SH.e4 = {
  setups: [
    { a: 0, b: 4.4, w: 'beach', cam: mv([-330, 170, -130], [215, 125, 380], [-300, 168, -100], [215, 125, 380], 34, 33) },
    { a: 4.4, b: 8.19, w: 'beach', cam: mv([-60, 205, -540], [0, 165, 300], [40, 195, -490], [0, 160, 300], 36, 34) },
    { a: 8.19, b: 11.8, w: 'coast', cam: mv([-900, 270, 720], [-300, 105, 90], [-800, 255, 650], [-300, 105, 90], 37, 35) },
    { a: 11.8, b: 14.8, w: 'coast', cam: mv([720, 260, 880], [720, 190, -60], [740, 250, 830], [760, 190, -60], 34, 32) },
    { a: 14.8, b: 17.59, w: 'coast', cam: mv([1310, 150, 500], [1500, 105, 80], [1360, 150, 440], [1500, 110, 80], 28, 26) },
    { a: 17.59, b: 21.5, w: 'coast', cam: mv([1750, 420, 940], [2050, 60, 0], [3000, 340, 820], [3250, 60, 200], 32, 32) },
    { a: 21.5, b: 24.5, w: 'coast', cam: mv([3430, 170, 700], [3235, 105, 350], [3400, 165, 660], [3235, 108, 350], 28, 27) },
    { a: 24.5, b: 28.6, w: 'coast', cam: mv([3490, 150, 700], [3190, 125, 370], [3440, 145, 640], [3190, 128, 370], 30, 28) },
    { a: 28.6, b: 31.8, w: 'pools', cam: mv([1300, 300, 430], [100, 40, -420], [1180, 290, 380], [40, 40, -420], 34, 33) },
    { a: 31.8, b: 35.0, w: 'pools', cam: mv([460, 210, 90], [180, 10, -330], [380, 230, 70], [150, 10, -330], 32, 30) },
    { a: 35.0, b: 38.0, w: 'pools', cam: mv([-1050, 190, 330], [-1790, 55, -300], [-1130, 180, 300], [-1790, 60, -300], 34, 32) },
    { a: 38.0, b: 41.5, w: 'gas', cam: mv([1100, 300, 1400], [720, -20, 0], [800, -200, 1300], [720, -300, 0], 34, 34) },
    { a: 41.5, b: 45.79, w: 'gas', cam: mv([860, -330, 760], [722, -430, 300], [800, -380, 690], [722, -430, 300], 28, 26) },
    { a: 45.79, b: 49.0, w: 'town', cam: mv([-2500, 170, 780], [-1500, 60, 340], [-700, 190, 640], [-300, 120, 60], 34, 34) },
    { a: 49.0, b: 51.8, w: 'stove', cam: mv([60, 610, 470], [-160, 490, 40], [20, 570, 390], [-160, 490, 40], 28, 24) },
    { a: 51.8, b: 54.2, w: 'town', cam: mv([700, 260, 900], [-180, 220, -100], [200, 250, 830], [-120, 230, -100], 36, 34) },
    { a: 54.2, b: 56.4, w: 'town', cam: mv([470, 150, 1250], [1150, 215, -120], [495, 152, 1215], [1150, 215, -120], 36, 35) },
  ],
  acts(lt, S, u) {
    const t = ST.t;
    // ---- c1 chests
    if (lt < 8.19) {
      env({ A: 4 });
      chests.forEach((c, i) => { const p = chestPose(i, lt); c.visible = true; c.position.set(p.x, p.y, p.z); const op = ease(lt, 5.0 + 0.3 * i, 5.9 + 0.3 * i); c.userData.lid.rotation.x = -1.75 * op; const ic = c.userData.ic; ic.visible = op > 0.05; ic.position.y = 130 + 70 * op + 8 * Math.sin(t * 2 + i); ic.scale.setScalar(Math.max(0.01, op)); ic.rotation.y = t * 1.6 + i; c.userData.gl.userData.update(t, op); });
      const wonder = ease(lt, 4.8, 5.4);
      put('rabbi', { x: lt < 4.4 ? 520 : 190, z: lt < 4.4 ? 390 : 580, y: gy(lt < 4.4 ? 520 : 190, lt < 4.4 ? 390 : 580), yaw: lt < 4.4 ? 1.85 : PI / 2 - 0.15, headYaw: 0.1, arms: { l: { sz: 0.12 }, r: { sz: 0.1 + 0.95 * ease(lt, 1.2, 1.8) * (1 - wonder) + 1.0 * wonder, sx: 0.3 + 0.4 * wonder, el: 0.4, point: wonder < 0.5 && lt > 1.2 } } },
        face(wonder > 0.4 ? 'laugh' : 'explaining', t, 0.2, { look: lk(-0.4, 0.1), talk: talk(lt, 0.8, 4.2) }));
      put('boy', { x: lt < 4.4 ? 160 : -170, z: lt < 4.4 ? 480 : 590, y: gy(lt < 4.4 ? 160 : -170, lt < 4.4 ? 480 : 590), yaw: lt < 4.4 ? 1.95 : PI / 2 + 0.15, arms: { l: { sz: 0.08 + 1.8 * wonder, sx: 0.3 }, r: { sz: 0.08 + 1.8 * wonder, sx: 0.3 } } }, face(lt > 3 ? 'surprised' : 'smile', t, 0.6, { look: lk(-0.4, 0.2) }));
      return;
    }
    chests.forEach(c => { c.visible = false; });
    // ---- c2 desalination
    const CO = WORLD.coast;
    if (lt < 17.59) {
      if (lt < 11.8) {
        const uu = ease(lt, 8.6, 11.6) * 0.82; const q = CO.intake.getPointAt(uu);
        env({ salt: ease(lt, 8.4, 9.2), flow: false });
        put('tipaB', { x: q.x, y: q.y + 30, z: q.z + 10, yaw: 0.2, tilt: -10, float: 0.7, arms: 'up', feet: false, shadow: false, scale: 0.42 }, face('worried', t, 0.2, { look: lk(0.4, 0.1) }));
        put('rabbi', { x: -234, y: 0, z: 212, yaw: -2.9, arms: { l: { sz: 0.12 }, r: { sz: 0.1 + 0.9 * ease(lt, 8.6, 9.3), sx: 0.3, el: 0.4, point: true } } }, face('explaining', t, 0.1, { look: lk(-0.4, 0), talk: talk(lt, 8.6, 11.2) }));
        put('boy', { x: -91, y: 0, z: 308, yaw: -2.75, arms: { l: { sz: 0.08 }, r: { sz: 0.08 } } }, face('thinking', t, 0.6, { look: lk(-0.4, 0) }));
        return; }
      if (lt < 14.8) {
        const uu = ease(lt, 11.8, 12.4), inV = lt > 12.4;
        env({ salt: 1, saltFall: lt > 12.3 ? 1 : 0, heap: ease(lt, 12.6, 14.8), clean: ease(lt, 12.8, 13.4), flow: false });
        if (!inV) { const q = CO.intake.getPointAt(0.82 + 0.18 * uu); put('tipaB', { x: q.x, y: q.y + 30, z: q.z + 10, yaw: 0.2, float: 0.7, arms: 'up', feet: false, shadow: false, scale: 0.42 * (1 - 0.6 * uu) }, face('worried', t, 0.2)); }
        const e = ease(lt, 13.2, 14.4), q2 = CO.outlet.getPointAt(0.02 + 0.1 * e);
        if (lt > 13.2) put('tipa', { x: q2.x, y: q2.y + 38, z: q2.z, yaw: 0.2, tilt: -8, float: 0.8, arms: 'wave', feet: false, shadow: false, scale: 0.4 }, face('cheering', t, 0.3, { look: lk(0.5, 0.2) }));
        return; }
      env({ salt: 0.5, clean: 1, saltFall: 1, heap: 1, spout: ease(lt, 15.0, 15.4) * (1 - ease(lt, 17.2, 17.5)), glassLevel: ease(lt, 15.4, 17.3) * 0.82, flow: false });
      const fall = ease(lt, 14.9, 15.6), py = lerp(210, 40 + 74 * ease(lt, 15.4, 17.3) * 0.82, fall);
      put('tipa', { x: 1500 + 6 * Math.sin(lt * 3), y: py, z: 80, yaw: -PI / 2 + 0.2, tilt: 4 * Math.sin(lt * 4), float: 0.4, arms: lt > 16 ? 'wave' : 'up', feet: false, shadow: false, scale: 0.33 }, face(lt > 15.8 ? 'cheering' : 'surprised', t, 0.3, { look: lk(0, 0.2) }));
      return;
    }
    // ---- c3 pipes, tap and the cup
    if (lt < 28.6) {
      env({ salt: 0, clean: 0, flow: true, flowU0: 0.25, flowU1: 0.97, heap: 1, saltFall: 0, glassLevel: 0.82 });
      if (lt < 21.5) { const uu = lerp(0.28, 0.95, ease(lt, 17.8, 21.3)), q = CO.outlet.getPointAt(uu); put('tipa', { x: q.x, y: q.y + 55, z: q.z + 0, yaw: yawTo(q.x, q.z, q.x + 100, q.z), tilt: -8, float: 0.8, arms: 'up', feet: false, shadow: false, scale: 0.42 }, face('cheering', t, 0.3, { look: lk(0.5, 0.1) })); return; }
      const pour = ease(lt, 21.8, 22.3) * (1 - ease(lt, 24.0, 24.4)), lvl = ease(lt, 22.2, 24.0);
      env({ flow: lt < 22.5, pour, cupLevel: lt < 24.4 ? lvl : 1, cupOnLedge: lt < 24.5 });
      const holding = lt >= 24.5;
      const lift = ease(lt, 24.6, 25.5), brk = ease(lt, 25.7, 26.4) * (1 - ease(lt, 27.6, 28.2)), dr = ease(lt, 26.5, 27.1) * (1 - ease(lt, 27.8, 28.3));
      const bx_ = holding ? 3195 : 3150, bz_ = holding ? 385 : 430;
      cupHand.visible = holding; if (holding) { cupHand.userData.water.visible = true; cupHand.userData.water.scale.set(1, 0.9, 1); }
      put('boy', { x: bx_, z: bz_, y: 0, yaw: lt < 24.5 ? -0.55 : -0.7, headRot: -6 * dr, arms: { l: { sz: 0.08 + 1.55 * brk, sx: 0.3 + 0.3 * brk, el: 0.3 + 0.9 * brk, curl: 0.0 }, r: { sz: holding ? (0.4 + 1.0 * lift - 0.0) : 0.08, sx: 0.12, el: holding ? (0.9 + 1.2 * lift + 0.5 * dr) : 0.2, curl: 0.5 } } },
        face(dr > 0.3 ? 'smile' : (lt > 27.8 ? 'laugh' : 'thinking'), t, 0.6, { look: lk(0.2, -0.1) }));
      put('rabbi', { x: 3060, y: 0, z: 560, yaw: -PI / 2 + 0.8, arms: { l: { sz: 0.12 }, r: { sz: 0.1 + 0.6 * ease(lt, 24.8, 25.4) * (1 - ease(lt, 27, 27.5)), sx: 0.25, el: 0.5 } } }, face('smile', t, 0.2, { look: lk(0.1, 0), talk: talk(lt, 24.6, 28) }));
      return;
    }
    // ---- c4 salt pools
    if (lt < 38.0) {
      const lv = lerp(1, 0.14, ease(lt, 29.0, 36.5)), cr = ease(lt, 33.5, 37.0), pile = 0.05 + 0.95 * ease(lt, 33.0, 38.0);
      env({ level: lv, crust: cr, pile, steam: 1, sunK: ease(lt, 28.8, 32) });
      if (lt < 31.8) {
        put('rabbi', { x: 800, y: 0, z: 170, yaw: -PI / 2 + 0.5, arms: { l: { sz: 0.12 }, r: { sz: 0.1 + 0.9 * ease(lt, 29.4, 30), sx: 0.3, el: 0.4, point: true } } }, face('explaining', t, 0.1, { look: lk(0, 0.3), talk: talk(lt, 29.2, 31.6) }));
        put('boy', { x: 690, y: 0, z: 190, yaw: -PI / 2 + 0.7, headTilt: 4, arms: { l: { sz: 0.08 }, r: { sz: 0.08 + 0.4 * ease(lt, 30.2, 30.8), sx: 0.2, el: 0.8 * ease(lt, 30.2, 30.8) } } }, face('curious', t, 0.6, { look: lk(0, 0.3) }));
      } else {
        const sc = lerp(0.55, 0.16, ease(lt, 31.8, 37.5)), up = 12 + 90 * ease(lt, 35.5, 37.8);
        put('tipaB', { x: 120, y: up, z: -150, yaw: 0.0 - 0.6, tilt: 3 * Math.sin(lt * 3), float: 0.5, arms: lt > 33 ? 'up' : 'hips', feet: true, shadow: false, scale: sc }, face(lt < 34 ? 'tired' : lt < 36.8 ? 'worried' : 'happy', t, 0.3, { look: lk(-0.2, 0.1) }));
      }
      return;
    }
    // ---- c5 gas under the seabed
    if (lt < 45.79) {
      env({ glow: ease(lt, 38.4, 40.5), pocket: ease(lt, 38.4, 40.0) });
      if (lt >= 41.5) put('tipa', { x: 880, y: -360, z: 380, yaw: PI - 0.5, tilt: -4, float: 0.7, arms: lt > 43 ? 'point' : 'up', feet: false, shadow: false, scale: 0.6 }, face(lt > 43.5 ? 'cheering' : 'surprised', t, 0.3, { look: lk(-0.5, -0.1), talk: tt(lt, 42, 43.5) }));
      return;
    }
    // ---- c6 power
    const on = [0, 1, 2, 3, 4, 5].map(i => ease(lt, 51.9 + 0.4 * i, 52.7 + 0.4 * i));
    env({ gas: lt < 54.2, on: lt < 51.8 ? null : on, smoke: lt > 50.5 ? 1 : 0.4, on_: 0, on1: 0, noBulb: lt >= 54.2 });
    if (lt < 49.0) { const q = WORLD.town.gp.getPointAt(ease(lt, 46.0, 48.6) * 0.8); put('tipa', { x: q.x, y: q.y + 70, z: q.z + 20, yaw: yawTo(q.x, q.z, q.x + 100, q.z - 40), tilt: -8, float: 0.8, arms: 'up', feet: false, shadow: false, scale: 0.5 }, face('cheering', t, 0.3, { look: lk(0.5, 0) })); return; }
    if (lt < 51.8) { env({ on: 1, steam: true, all: lt > 50 }); return; }
    if (lt >= 54.2) {
      put('boy', { x: 776, y: 0, z: 597, yaw: -1.3, arms: { l: { sz: 0.08 }, r: { sz: 0.08 } } }, face('smile', t, 0.6, { look: lk(0.6, 0.2) }));
      put('rabbi', { x: 583, y: 0, z: 442, yaw: -1.15, headYaw: 0.1 * Math.sin(lt * 1.3), arms: { l: { sz: 0.12 }, r: { sz: 0.9, sx: 0.3, el: 0.5 } } }, face('proud', t, 0.2, { look: lk(0.6, 0.2), talk: talk(lt, 54.3, 56) }));
    }
  },
  hud(lt, S, u, wn) {
    if (wn === 'gas') { tint('#061030', 0.3 * ease(lt, 38.0, 40) * (lt < 41.5 ? 1 : 0.6)); }
    if (wn === 'town') { tint('#2a1a4a', 0.12); }
    if (wn === 'pools') { tint('#ffe6a0', 0.1); }
  },
};

/* ======================================================================== e5 : recap (20 s) */
/* two calm set-ups: A boat in the upper-left, B boat in the upper-right; the water surface sits at ~58% of the frame height,
   so the burned-in lines (centre band) fall on plain water; every creature lives in the lower third. */
const RC = lt => lt < 10 ? { xb: -1353, xc: -650, ph: 0.5 } : { xb: -97, xc: -800, ph: 1.1 };
SH.e5 = {
  setups: [
    { a: 0, b: 10, w: 'sec', cam: mv([-650, 172, 2060], [-650, 172, 0], [-670, 176, 1930], [-670, 174, 0], 30, 30) },
    { a: 10, b: 20, w: 'sec', cam: mv([-800, 172, 1930], [-800, 172, 0], [-770, 170, 2050], [-770, 172, 0], 30, 30) },
  ],
  acts(lt, S, u) {
    const t = ST.t, sec = WORLD.sec.SEC, R = RC(lt), A = lt < 10, bt = boatAt(t, R.xb, 0, 0.0, R.ph);
    env({ boat: bt, deep: false, noSchool: false, birds: true });
    const rp = onBoat(bt, A ? -130 : 150, -6), bp = onBoat(bt, A ? 160 : -130, 24), g1 = frac(lt * 0.33), g2 = frac(lt * 0.27 + 0.4);
    put('rabbi', { x: rp[0], z: rp[2], y: rp[1], yaw: A ? -PI / 2 + 0.6 : -PI / 2 - 0.6, headYaw: 0.28 * Math.sin(lt * 0.9), arms: { l: { sz: 0.12 }, r: { sz: 0.15 + 0.7 * Math.pow(Math.max(0, Math.sin(lt * 0.65)), 3) , sx: 0.3, el: 0.5 } } }, face('smile', t, 0.2, { look: lk(0.3 * Math.sin(lt * 0.5), -0.1) }));
    put('boy', { x: bp[0], z: bp[2], y: bp[1], yaw: A ? -PI / 2 + 0.3 : -PI / 2 - 0.3, headYaw: 0.25 * Math.sin(lt * 0.8 + 1), headTilt: 3 * Math.sin(lt * 0.7), arms: { l: { sz: 0.08 }, r: { sz: 0.1 + 0.5 * Math.pow(Math.max(0, Math.sin(lt * 0.8 + 2)), 4), sx: 0.25, el: 0.5 } } }, face(g1 > 0.5 ? 'smile' : 'surprised', t, 0.6, { look: lk(0.4 * Math.sin(lt * 0.6), -0.5) }));
    const tx_ = (A ? -330 : -1300) + 170 * Math.sin(lt * 0.33), ty = -140 + 10 * Math.sin(lt * 0.9);
    put('tipa', { x: tx_, y: ty, z: 150, yaw: Math.cos(lt * 0.33) > 0 ? -PI / 2 + 0.2 : PI + 0.2, tilt: -4, float: 0.8, arms: 'wave', feet: false, shadow: false, scale: 0.4 }, face('happy', t, 0.3, { look: lk(0.3, 0) }));
    const fx0 = (A ? -560 : -1000) + 150 * Math.sin(lt * 0.4), fx2 = (A ? -90 : -600) + 110 * Math.sin(lt * 0.3 + 2);
    put('f0', { x: fx0, y: -95 + 14 * Math.sin(lt * 1.2), z: -40, yaw: Math.cos(lt * 0.4) > 0 ? 0.2 : PI + 0.2, swim: 0.5, scale: 0.5 }, face('happy', t, 0.5));
    put('f2', { x: fx2, y: -65 + 12 * Math.sin(lt * 1.5), z: -200, yaw: Math.cos(lt * 0.3 + 2) > 0 ? 0.2 : PI + 0.2, swim: 0.5, scale: 0.4 }, face('happy', t, 0.8));
  },
  hud(lt, S, u) {
    // light vignette + a gentle darker band in the centre for the three burned-in lines
    HUD.on = true; hx.save();
    const g = hx.createRadialGradient(W / 2, H / 2, px(420), W / 2, H / 2, px(1150)); g.addColorStop(0, 'rgba(10,36,70,0)'); g.addColorStop(1, 'rgba(10,36,70,0.30)'); hx.fillStyle = g; hx.fillRect(0, 0, W, H);
    const b = hx.createLinearGradient(0, H * 0.3, 0, H * 0.7); b.addColorStop(0, 'rgba(10,36,70,0)'); b.addColorStop(0.5, 'rgba(10,36,70,0.16)'); b.addColorStop(1, 'rgba(10,36,70,0)'); hx.fillStyle = b; hx.fillRect(0, H * 0.3, W, H * 0.4); hx.restore();
  },
};
