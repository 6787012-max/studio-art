/* film_e shots part A: helpers + e1 (under the ship) + e2 (deep, dark, cold). lt = seconds inside the shot. ASCII only. */
import { THREE, sm, cl, D2R, frac, V, KT, KP, L, P, ease, lerp, lerpv, blinkAt, WORLD, ST, AC, put, talk, gy, ENVP, hx, HUD, scr, txt, px, W, H, cam, tint, glowAt, cupHand, SKY } from './e_core.js';
import { buildSurf, buildBeach, buildMainSection, buildTrench, buildReef, YM, MY, YT, MT } from './e_w1.js';
import { buildNight, buildMap, buildCabin, buildCoast, buildPools, buildGas, buildTown, buildStove, PIT } from './e_w2.js';

export const ORDER = ['e1', 'e2', 'e2b', 'e3', 'e4', 'e5'];
export const DEFAULT_FOV = 32;
export const SH = {};
export const PI = Math.PI;
export function initWorlds() { buildSurf(); buildBeach(); buildMainSection(); buildTrench(); buildReef(); buildNight(); buildMap(); buildCabin(); buildCoast(); buildPools(); buildGas(); buildTown(); buildStove(); }

/* ------------------------------------------------------------ helpers */
export const mv = (p0, l0, p1, l1, f0, f1) => u => { const k = sm(u); return { p: lerpv(p0, p1, k), l: lerpv(l0, l1, k), fov: lerp(f0 || 32, f1 == null ? (f0 || 32) : f1, k) }; };
export const yawTo = (x, z, tx, tz) => Math.atan2(-(tz - z), tx - x);
export const lk = (x, y) => [x, y];
export const face = (expr, t, o, extra) => Object.assign({ expr, blink: blinkAt(t, o || 0) }, extra || {});
export const tt = (t, a, b, rate) => (t > a && t < b && frac(t * 0.9) < 0.74) ? 'AEOX'[Math.floor(t * (rate || 7)) % 4] : null;
export const env = o => { ENVP.p = Object.assign(ENVP.p || {}, o); };
export const bob = (t, ph) => 4 * Math.sin(t * 1.25 + (ph || 0));
export const roll = (t, ph) => 0.03 * Math.sin(t * 0.9 + (ph || 0));
export const boatAt = (t, x, z, yaw, ph) => [x, bob(t, ph) - 14, z, yaw, roll(t, ph)];
export const onBoat = (b, lx, lz) => { const c = Math.cos(b[3]), s = Math.sin(b[3]); return [b[0] + lx * c + lz * s, b[1] + 60, b[2] - lx * s + lz * c]; };
export const A0 = (lt, a, b, c, d) => lerp(c, d, ease(lt, a, b));
const K = () => W / 1920;

/* ------------------------------------------------------------ HUD kit (virtual 1920x1080 space) */
export function rrect(x, y, w, h, r) { hx.beginPath(); hx.moveTo(x + r, y); hx.arcTo(x + w, y, x + w, y + h, r); hx.arcTo(x + w, y + h, x, y + h, r); hx.arcTo(x, y + h, x, y, r); hx.arcTo(x, y, x + w, y, r); hx.closePath(); }
export function tx(s, x, y, size, col, a) { hx.save(); hx.globalAlpha = a == null ? 1 : a; hx.font = `900 ${size}px "Arial Black", Arial, sans-serif`; hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.lineJoin = 'round'; hx.lineWidth = size * 0.2; hx.strokeStyle = '#261c19'; hx.strokeText(s, x, y); hx.fillStyle = col || '#fff6d6'; hx.fillText(s, x, y); hx.restore(); }
export const fmt = n => Math.round(n).toLocaleString('en-US');
export function hudV(fn) { HUD.on = true; hx.save(); hx.scale(K(), K()); fn(); hx.restore(); }
/* depth gauge: bar with ticks (right side), marker at frac f (0..1), number badge */
export function depthGauge(f, label, o) {
  o = o || {}; const a = o.a == null ? 1 : o.a; if (a <= 0.01) return;
  hudV(() => { const x = o.x || 1700, y = o.y || 150, h = o.h || 560; hx.globalAlpha = a;
    rrect(x - 130, y - 70, 250, h + 150, 26); hx.fillStyle = 'rgba(14,52,86,0.9)'; hx.fill(); hx.lineWidth = 7; hx.strokeStyle = '#261c19'; hx.stroke();
    rrect(x + 36, y, 34, h, 12); hx.fillStyle = '#1b7fc0'; hx.fill(); hx.lineWidth = 5; hx.stroke();
    const g = hx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#9be6ff'); g.addColorStop(1, '#0b2a55'); rrect(x + 41, y + 5, 24, h - 10, 8); hx.fillStyle = g; hx.fill();
    hx.strokeStyle = '#fff6d6'; hx.lineWidth = 4; for (let i = 0; i <= 10; i++) { const yy = y + h * i / 10; hx.beginPath(); hx.moveTo(x + 10, yy); hx.lineTo(x + (i % 5 === 0 ? 34 : 24), yy); hx.stroke(); }
    const my = y + h * cl(f, 0, 1); hx.fillStyle = '#ffd447'; hx.strokeStyle = '#261c19'; hx.lineWidth = 5; hx.beginPath(); hx.moveTo(x - 4, my - 20); hx.lineTo(x + 40, my); hx.lineTo(x - 4, my + 20); hx.closePath(); hx.fill(); hx.stroke();
    tx(label, x - 28, y - 30, o.size || 50, '#fff6d6'); });
}
/* dashed world line (horizontal at yW from x0 to x1 at depth z), with a digits label at its right end */
export function dashLine(yW, x0, x1, z, label, col, a) {
  const p0 = scr([x0, yW, z]), p1 = scr([x1, yW, z]); if (a != null && a <= 0.01) return;
  HUD.on = true; hx.save(); hx.globalAlpha = a == null ? 1 : a; hx.setLineDash([px(34), px(22)]); hx.lineCap = 'round';
  for (const [c, w] of [['#261c19', 11], [col || '#fff6d6', 6]]) { hx.strokeStyle = c; hx.lineWidth = px(w); hx.beginPath(); hx.moveTo(p0[0], p0[1]); hx.lineTo(p1[0], p1[1]); hx.stroke(); }
  hx.setLineDash([]); hx.restore();
  if (label) { const lx = Math.min(W - px(150), Math.max(px(150), Math.min(p0[0], p1[0]) + px(150))); hx.save(); hx.scale(K(), K()); const k = 1 / K(); const y = p1[1] * k, xx = lx * k; rrect(xx - 125, y - 38, 250, 76, 20); hx.fillStyle = 'rgba(14,52,86,0.92)'; hx.fill(); hx.lineWidth = 6; hx.strokeStyle = '#261c19'; hx.stroke(); tx(label, xx, y + 2, 50, '#fff6d6'); hx.restore(); }
}
/* vertical double arrow between two world points */
export function dblArrow(a, b, col, k) {
  const p = scr(a), q = scr(b), kk = k == null ? 1 : k; if (kk <= 0.01) return; HUD.on = true; hx.save(); hx.globalAlpha = kk; hx.lineCap = 'round'; hx.lineJoin = 'round';
  const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, h = px(34);
  for (const [c, w] of [['#261c19', 17], [col || '#fff6d6', 9]]) { hx.strokeStyle = c; hx.fillStyle = c; hx.lineWidth = px(w);
    hx.beginPath(); hx.moveTo(p[0] + ux * h * 0.6, p[1] + uy * h * 0.6); hx.lineTo(q[0] - ux * h * 0.6, q[1] - uy * h * 0.6); hx.stroke();
    for (const [e, s] of [[p, 1], [q, -1]]) { hx.beginPath(); hx.moveTo(e[0], e[1]); hx.lineTo(e[0] + s * ux * h + uy * h * 0.55, e[1] + s * uy * h - ux * h * 0.55); hx.lineTo(e[0] + s * ux * h - uy * h * 0.55, e[1] + s * uy * h + ux * h * 0.55); hx.closePath(); hx.fill(); } }
  hx.restore();
}
/* expanding ripple rings at a screen point (the picture of a question) */
export function ripples(x, y, t, k, col) { if (k <= 0.01) return; HUD.on = true; hx.save(); hx.lineWidth = px(9); for (let i = 0; i < 3; i++) { const q = frac(t * 0.45 + i / 3); hx.globalAlpha = k * (1 - q) * 0.9; hx.strokeStyle = '#261c19'; hx.lineWidth = px(14); hx.beginPath(); hx.arc(x, y, px(40 + 260 * q), 0, 7); hx.stroke(); hx.strokeStyle = col || '#fff6d6'; hx.lineWidth = px(8); hx.stroke(); } hx.restore(); }
export function whiteFlash(a) { if (a <= 0.01) return; HUD.on = true; hx.save(); hx.globalAlpha = cl(a, 0, 1); hx.fillStyle = '#f4fdff'; hx.fillRect(0, 0, W, H); hx.restore(); }
export function bubblesHud(t, a, seed) { if (a <= 0.01) return; HUD.on = true; hx.save(); for (let i = 0; i < 46; i++) { const r0 = (Math.sin(i * 12.9898 + (seed || 0)) * 43758.5453) % 1, r1 = (Math.sin(i * 78.233 + 3.1) * 12345.678) % 1; const x = (Math.abs(r0)) * W, u = frac(t * (0.5 + Math.abs(r1) * 0.5) + Math.abs(r1) * 5); const y = H * (1.05 - u * 1.2), rr = px(8 + 26 * Math.abs(r1)); hx.globalAlpha = a * 0.8; hx.fillStyle = 'rgba(235,250,255,0.55)'; hx.strokeStyle = '#ffffff'; hx.lineWidth = px(4); hx.beginPath(); hx.arc(x + px(14) * Math.sin(u * 9 + i), y, rr, 0, 7); hx.fill(); hx.stroke(); } hx.restore(); }

/* ======================================================================== e1 : under the ship (36.3 s) */
const T1 = { x0: 1350, x1: -300 };
const tipaE1 = lt => { // swims down along the shelf from the beach end to the middle of the shelf
  const u = ease(lt, 19.2, 26.4), x = lerp(850, -140, u), SEC = WORLD.sec.SEC; return { x, y: SEC.yAt(x) + 62 + 14 * Math.sin(lt * 2.1), u }; };
SH.e1 = {
  setups: [
    { a: 0, b: 4.5, w: 'surf', cam: mv([-420, 230, 640], [380, 470, -1500], [-140, 140, 360], [420, 330, -1500], 34, 34) },
    { a: 4.5, b: 8.0, w: 'beach', cam: mv([880, 195, 262], [20, 172, 250], [800, 192, 250], [30, 172, 250], 29, 28) },
    { a: 8.0, b: 10.4, w: 'beach', cam: mv([-40, 300, 1000], [0, 140, -300], [-60, 270, 940], [0, 140, -300], 30, 30) },
    { a: 10.4, b: 12.15, w: 'beach', cam: mv([700, 175, -420], [-30, 210, 270], [660, 175, -380], [-30, 210, 270], 31, 30) },
    { a: 12.15, b: 15.0, w: 'surf', cam: mv([620, 290, 330], [10, 205, -515], [560, 280, 270], [10, 205, -515], 31, 30) },
    { a: 15.0, b: 17.2, w: 'surf', cam: mv([250, 250, 50], [95, 228, -494], [215, 242, 20], [95, 224, -494], 36, 34) },
    { a: 17.2, b: 18.5, w: 'surf', cam: mv([160, 220, -235], [95, 150, -494], [330, 16, -200], [350, -30, -620], 34, 40) },
    { a: 18.5, b: 19.01, w: 'sec', cam: mv([1100, -30, 900], [900, -160, 0], [1050, -60, 860], [850, -170, 0], 40, 38) },
    { a: 19.01, b: 22.6, w: 'sec', cam: u => { const T = tipaE1(19.01 + u * 3.59); return { p: [T.x + 260, T.y + 25, 720], l: [T.x - 50, T.y - 10, 60], fov: 28 }; } },
    { a: 22.6, b: 26.66, w: 'sec', cam: u => { const T = tipaE1(22.6 + u * 4.06); return { p: [T.x + 460 - 160 * u, T.y + 90, 900], l: [T.x - 160, T.y - 40, 40], fov: 30 }; }, fg: 'weed' },
    { a: 26.66, b: 30.0, w: 'sec', cam: mv([700, -170, 1250], [-100, -230, 0], [420, -190, 1150], [-250, -250, 0], 28, 26) },
    { a: 30.0, b: 33.0, w: 'sec', cam: mv([250, -90, 720], [-170, -160, 60], [200, -110, 700], [-190, -170, 60], 28, 27) },
    { a: 33.0, b: 36.3, w: 'sec', cam: mv([-200, -200, 1100], [-420, -250, 0], [-620, -380, 1700], [-1000, -700, 0], 33, 36), fg: 'weed' },
  ],
  acts(lt, S, u) {
    const t = ST.t;
    if (lt < 4.5) { env({ boat: boatAt(t, 360, -1000, 0.5, 0.2), glint: 1.2 }); return; }
    if (lt < 12.15) {
      env({ A: 3, foam: 0.35 });
      const near = lt >= 10.4;
      const RB = near ? [90, 255] : [40, 170], BO = near ? [-150, 135] : [-120, 300], ry = near ? PI / 2 - 0.45 : PI / 2 - 0.5, by = near ? PI / 2 - 0.25 : PI / 2 - 0.35;
      const sw = ease(lt, 5.4, 6.1), swp = lt > 6.1 ? 0.3 * Math.sin((lt - 6.1) * 1.4) : 0;
      put('rabbi', { x: RB[0], z: RB[1], y: gy(...RB), yaw: ry, headYaw: 0.18 + 0.05 * Math.sin(lt * 0.8), arms: { l: { sz: 0.55, sx: 0.1, el: 1.15, curl: 0.5 }, r: { sz: lerp(0.08, 0.95, sw), sx: 0.25 + swp, el: lerp(0.3, 0.5, sw), curl: 0.3 } } },
        face('explaining', t, 0.1, { look: lk(0.4, 0), talk: talk(lt, 5.0, 11.4) }));
      const ben = lt > 10.4 ? 'thinking' : 'smile';
      put('boy', { x: BO[0], z: BO[1], y: gy(...BO), yaw: by, headYaw: 0.1 + 0.08 * Math.sin(lt * 0.7), headTilt: lt > 10.4 ? 8 : 0, arms: { l: { sz: 0.08 }, r: { sz: 0.08 + 0.5 * ease(lt, 7.0, 7.5) * (1 - ease(lt, 9.4, 9.9)), sx: 0.2, el: 0.8 * ease(lt, 7.0, 7.5) } } },
        face(ben, t, 0.6, { look: lk(lt > 10.4 ? 0.3 : 0.5, lt > 10.4 ? -0.2 : 0.05) }));
      return;
    }
    if (lt < 18.5) {
      const b = boatAt(t, 0, -520, 0.15, 0.4); env({ boat: b, glint: 0.8 });
      const rp = onBoat(b, -70, -4), bp = onBoat(b, 88, 40);
      const lean = ease(lt, 13.0, 14.0) * 24 + ease(lt, 15.0, 16.0) * 10, up = ease(lt, 12.15, 12.6);
      put('rabbi', { x: rp[0], z: rp[2], y: rp[1], yaw: -PI / 2 + 0.55, headYaw: -0.1, arms: { l: { sz: 0.12 }, r: { sz: 0.1 + 0.9 * ease(lt, 12.6, 13.2) * (1 - ease(lt, 16.0, 16.8)), sx: 0.3, el: 0.4, point: lt > 12.6 && lt < 16.4 } } },
        face(lt > 16.2 ? 'smile' : 'explaining', t, 0.2, { look: lk(0.2, -0.3), talk: talk(lt, 12.3, 15.8) }));
      put('boy', { x: bp[0], z: bp[2], y: bp[1], yaw: -PI / 2 + 0.25, lean, headRot: 0, headTilt: 4, arms: { l: { sz: 0.35 + 0.3 * ease(lt, 13, 14), sx: 0.1, el: 0.5 }, r: { sz: 0.3 + 0.4 * ease(lt, 13, 14), sx: 0.12, el: 0.5 } } },
        face(lt > 16.6 ? 'surprised' : 'thinking', t, 0.6, { look: lk(0.1, -0.6) }));
      return;
    }
    // underwater (sec)
    const sec = WORLD.sec.SEC, T = tipaE1(lt);
    const bt = boatAt(t, 1250, 0, 0.05, 0.3); env({ boat: bt });
    const rp = onBoat(bt, -70, -4), bp = onBoat(bt, 88, 40);
    if (lt < 24.5) {
      put('rabbi', { x: rp[0], z: rp[2], y: rp[1], yaw: -PI / 2 + 0.55, arms: { l: { sz: 0.12 }, r: { sz: 0.12 } } }, face('smile', t, 0.2, { look: lk(0, -0.4) }));
      put('boy', { x: bp[0], z: bp[2], y: bp[1], yaw: -PI / 2 + 0.25, lean: 14, arms: { l: { sz: 0.35, el: 0.5 }, r: { sz: 0.3, el: 0.5 } } }, face('smile', t, 0.6, { look: lk(0.1, -0.6) }));
    }
    if (lt < 19.01) { put('tipa', { x: 1100, y: -14, z: 80, yaw: PI + 0.6, tilt: 0, float: 0.6, arms: 'up', feet: false, shadow: false, scale: 0.4 }, face('happy', t, 0.3, { look: lk(-0.3, 0) })); return; }
    if (lt < 26.66) {
      const dir = lt < 24 ? 1 : 0;
      put('tipa', { x: T.x, y: T.y, z: 80, yaw: PI + 0.6, tilt: -18, float: 0.8, arms: lt > 23.5 ? 'wave' : 'up', feet: false, shadow: false, scale: 0.45 }, face(lt > 23.5 ? 'happy' : 'curious', t, 0.3, { look: lk(-0.4, -0.2), talk: tt(lt, 21, 23) }));
      env({ deep: false }); return;
    }
    // c4: Tipa near the shelf edge, bright water
    const tx0 = lt < 30 ? -330 : lt < 33 ? -300 : -420 - 80 * ease(lt, 33, 36), ty0 = sec.yAt(tx0) + 95 + 12 * Math.sin(lt * 1.7);
    const pt = ease(lt, 30.6, 31.2) * (1 - ease(lt, 33.0, 33.4));
    put('tipa', { x: tx0, y: ty0, z: 100, yaw: lt < 30 ? PI + 0.5 : PI + 0.9, tilt: -6, float: 0.8, arms: pt > 0.5 ? 'point' : (lt > 33.2 ? 'up' : 'wave'), feet: false, shadow: false, scale: 0.6 },
      face(lt > 30.4 && lt < 33.4 ? 'surprised' : lt > 33.4 ? 'worried' : 'happy', t, 0.3, { look: lk(lt > 33.4 ? -0.5 : 0.5, -0.1), talk: tt(lt, 29.2, 30.4) }));
    env({ deep: false });
  },
  hud(lt, S, u) {
    if (lt < 4.5) return;
    if (lt >= 17.0 && lt < 19.4) { const f = ease(lt, 17.5, 18.4) * (1 - ease(lt, 18.55, 19.3)); whiteFlash(Math.min(1, 1.35 * Math.sin(PI * ease(lt, 17.9, 19.1)))); bubblesHud(ST.t, ease(lt, 17.2, 17.8) * (1 - ease(lt, 18.8, 19.4)), 1.0); }
    if (lt >= 19.01 && lt < 26.66) { const T = tipaE1(lt); depthGauge(MY(T.y + 74 - 74) / 100, `${Math.round(Math.max(0, MY(T.y)))} m`, { a: ease(lt, 19.2, 19.8), size: 46 }); }
    if (lt >= 26.66) {
      const sec = WORLD.sec.SEC, y100 = YM(100);
      const k = ease(lt, 27.0, 27.8);
      dashLine(y100, 1380, -520, 330, null, '#ffd447', k);
      dblArrow([1390, 0, 330], [1390, y100, 330], '#ffd447', k);
      // many km: a long ruler along the surface
      if (k > 0.01) { const a = scr([1380, 70, 330]), b = scr([-520, 70, 330]); HUD.on = true; hx.save(); hx.globalAlpha = k; hx.lineCap = 'round'; for (const [c, w] of [['#261c19', 13], ['#ffffff', 7]]) { hx.strokeStyle = c; hx.lineWidth = px(w); hx.beginPath(); hx.moveTo(a[0], a[1]); hx.lineTo(b[0], b[1]); hx.stroke(); } for (let i = 0; i <= 8; i++) { const q = i / 8, x = lerp(a[0], b[0], q), y = lerp(a[1], b[1], q); hx.strokeStyle = '#261c19'; hx.lineWidth = px(8); hx.beginPath(); hx.moveTo(x, y - px(18)); hx.lineTo(x, y + px(18)); hx.stroke(); hx.strokeStyle = '#fff'; hx.lineWidth = px(4); hx.stroke(); } hx.restore(); }
      depthGauge(0.97, '100 m', { a: 1, size: 46 });
    }
  },
};

/* ======================================================================== e2 : deep, dark, cold (49.5 s) */
const SLOPE = lt => { const u = ease(lt, 8.2, 13.6), x = lerp(-470, -2300, Math.pow(u, 0.92)), SEC = WORLD.sec.SEC; return { x, y: SEC.yAt(x) + 120 + 30 * Math.sin(lt * 2.2) * (1 - u * 0.5), u }; };
const MERON_X = -3700;
const meronY = lt => lerp(-330, -2754, ease(lt, 17.2, 23.8));
const T4 = lt => { const u = ease(lt, 26.3, 36.2), x = lerp(-1380, -1500, u), y = lerp(-90, -900, u) ; return { x, y, u }; };
SH.e2 = {
  setups: [
    { a: 0, b: 3.8, w: 'sec', cam: mv([-170, -150, 720], [-470, -210, 60], [-250, -170, 640], [-480, -215, 60], 30, 28) },
    { a: 3.8, b: 7.87, w: 'sec', cam: mv([-560, -330, 1000], [-700, -330, 60], [-1500, -1150, 2600], [-1250, -1150, 0], 32, 34) },
    { a: 7.87, b: 12.2, w: 'sec', cam: u => { const T = SLOPE(7.87 + u * 4.33); return { p: [T.x + 330, T.y + 20, 760], l: [T.x - 60, T.y - 50, 60], fov: 32 }; } },
    { a: 12.2, b: 16.12, w: 'sec', cam: mv([-1900, -2240, 2900], [-2300, -2390, 0], [-2400, -2420, 1800], [-2400, -2490, 0], 34, 34) },
    { a: 16.12, b: 19.4, w: 'sec', cam: mv([-3600, 650, 6200], [-3600, 650, 0], [-3600, 500, 6600], [-3600, 300, 0], 32, 32) },
    { a: 19.4, b: 25.91, w: 'sec', cam: mv([-3600, 300, 6600], [-3600, 100, 0], [-3600, -1000, 7200], [-3600, -1000, 0], 32, 32) },
    { a: 25.91, b: 30.2, w: 'sec', cam: mv([-1050, -250, 1700], [-1400, -330, 0], [-1000, -450, 1500], [-1400, -450, 0], 32, 32) },
    { a: 30.2, b: 34.93, w: 'sec', cam: u => { const T = T4(30.2 + u * 4.73); return { p: [T.x + 380, T.y + 60, 800], l: [T.x, T.y - 50, 60], fov: 32 }; } },
    { a: 34.93, b: 38.6, w: 'sec', cam: mv([-2700, -2560, 760], [-2830, -2630, 100], [-2740, -2570, 700], [-2830, -2635, 100], 32, 31) },
    { a: 38.6, b: 41.2, w: 'sec', cam: mv([-2300, -2420, 1000], [-2800, -2560, 100], [-2500, -2470, 900], [-2850, -2600, 100], 33, 33), fg: 'dark' },
    { a: 41.2, b: 43.18, w: 'sec', cam: mv([-2860, -2610, 440], [-2840, -2610, 100], [-2850, -2600, 390], [-2840, -2612, 100], 28, 26) },
    { a: 43.18, b: 46.5, w: 'cabin', cam: mv([440, 190, 270], [335, 150, -118], [400, 188, 240], [335, 151, -118], 26, 24) },
    { a: 46.5, b: 49.5, w: 'sec', cam: mv([-2780, -2570, 860], [-2840, -2640, 100], [-2790, -2570, 800], [-2840, -2560, 100], 32, 32) },
  ],
  acts(lt, S, u) {
    const t = ST.t, sec = WORLD.sec.SEC; env({ boat: false, deep: lt > 7 });
    // ---- c1 shelf edge
    if (lt < 7.87) {
      const lean = ease(lt, 0.8, 1.8) * 16; const x = -470, y = sec.yAt(x);
      put('tipa', { x, y: y + 2, z: 120, yaw: PI + 0.35, tilt: -lean, walk: 0, float: 0, arms: lt > 3.6 ? 'up' : 'hips', feet: true, shadow: false, scale: 0.75 }, face(lt > 5.8 ? 'surprised' : 'worried', t, 0.3, { look: lk(-0.6, -0.5), talk: tt(lt, 5.5, 7.4) }));
      return;
    }
    // ---- c2 sinking to the bottom
    if (lt < 16.12) {
      const T = SLOPE(lt), d = lt > 13.6;
      put('tipa', { x: T.x, y: d ? sec.yAt(T.x) + 2 : T.y, z: 120, yaw: PI + 0.5, tilt: d ? 0 : -26, float: d ? 0.2 : 0.9, arms: d ? 'wave' : 'up', feet: d, shadow: false, scale: 0.75 }, face(d ? 'curious' : 'surprised', t, 0.3, { look: lk(d ? -0.1 : -0.3, d ? 0.7 : -0.3) }));
      return;
    }
    // ---- c3 Meron
    if (lt < 25.91) { env({ meronY: meronY(lt), splashU: lt > 20.3 ? (lt - 20.3) / 2.6 : null, noSchool: true });
      put('tipa', { x: -2650, y: sec.yAt(-2650) + 2, z: 300, yaw: -0.1, scale: 0.75, feet: true, shadow: false, arms: lt > 23.6 ? 'wave' : 'point', float: 0 }, face(lt > 23.6 ? 'surprised' : 'curious', t, 0.3, { look: lk(-0.4, 0.5) })); return; }
    // ---- c4 light and dark
    if (lt < 34.93) { const T = T4(lt); env({ noSchool: false });
      put('tipa', { x: T.x, y: T.y, z: 150, yaw: PI + 0.4, tilt: -10, float: 0.8, arms: lt < 29 ? 'up' : 'down', feet: false, shadow: false, scale: 0.7 }, face(lt < 30 ? 'happy' : lt < 32 ? 'curious' : 'worried', t, 0.3, { look: lk(-0.4, -0.2), talk: tt(lt, 26.5, 29) })); AC.tipa.o.scarf.visible = lt > 31.2; return; }
    // ---- c5 black depth, cold
    if (lt < 43.18) { env({ deep: true });
      const x = -2830, y = sec.yAt(x) + 2, sh = 0.04 * Math.sin(lt * 34) * (lt > 36 ? 1 : 0.3);
      put('tipa', { x: x + 14 * Math.sin(lt * 31) * 0.3, y, z: 100, yaw: PI + 0.5 - 0.0 + 0.04 * Math.sin(lt * 33), tilt: 3 * Math.sin(lt * 29), squash: 0.03 + sh, feet: true, shadow: false, scale: 0.8, arms: lt > 38 ? 'hips' : 'down' }, face('worried', t, 0.3, { look: lk(-0.3, 0.1), talk: tt(lt, 41.8, 42.4) }));
      AC.tipa.o.scarf.visible = true; return; }
    if (lt < 46.5) { // cabin insert: the closed glowing sefer
      env({ glow: 1.5 });
      put('rabbi', { x: 120, z: -70, y: 0, yaw: -0.55, headYaw: 0.08, arms: { l: { sz: 0.12 }, r: { sz: 0.9 * ease(lt, 43.4, 44.0), sx: 0.3, el: 0.6, curl: 0.3 } } }, face('proud', t, 0.2, { look: lk(0.4, -0.2) }));
      put('boy', { x: -80, z: -30, y: 0, yaw: -0.2, headTilt: 5, arms: { l: { sz: 0.08 }, r: { sz: 0.08 } } }, face('smile', t, 0.5, { look: lk(0.3, -0.1) }));
      return; }
    env({ deep: true });
    put('tipa', { x: -2830, y: sec.yAt(-2830) + 2, z: 100, yaw: PI + 0.4, tilt: -6, squash: 0.02, feet: true, shadow: false, scale: 0.8, arms: 'up' }, face(lt > 47.4 ? 'happy' : 'curious', t, 0.3, { look: lk(-0.1, -0.8) }));
    AC.tipa.o.scarf.visible = true;
  },
  hud(lt, S, u, wn) {
    const sec = WORLD.sec.SEC; const meterOf = y => MY(y);
    if (wn === 'cabin') { tint('#ffdf90', 0.0); return; }
    if (lt < 3.8) { ripples(...(scr([-2300, -2750, 300]).slice(0, 2)), ST.t, ease(lt, 2.4, 3.2) * 0.8, '#ffd447'); }
    if (lt >= 3.8 && lt < 7.87) { const p = scr([-2300, -2730, 300]); ripples(p[0], p[1], ST.t, ease(lt, 4.2, 5.0), '#ffd447'); }
    if (lt >= 7.87 && lt < 16.12) {
      const T = SLOPE(lt), m = lt > 13.6 ? 1700 : Math.min(1700, MY(T.y)); const spin = lt > 13.6 ? 1700 : m;
      depthGauge(m / 1700, `${fmt(spin)} m`, { a: ease(lt, 8.0, 8.6), size: 44 });
      // 130 km bar
      const k = ease(lt, 11.2, 12.0) * 1;
      if (k > 0.01) hudV(() => { hx.globalAlpha = k; const x0 = 330, x1 = 1350, y = 120; hx.lineCap = 'round'; for (const [c, w] of [['#261c19', 18], ['#ffd447', 10]]) { hx.strokeStyle = c; hx.lineWidth = w; hx.beginPath(); hx.moveTo(x0, y); hx.lineTo(x1, y); hx.stroke(); }
        for (const [x, s] of [[x0, 1], [x1, -1]]) for (const [c, w] of [['#261c19', 18], ['#ffd447', 10]]) { hx.strokeStyle = c; hx.lineWidth = w; hx.beginPath(); hx.moveTo(x + s * 40, y - 34); hx.lineTo(x, y); hx.lineTo(x + s * 40, y + 34); hx.stroke(); }
        rrect(690, 70, 300, 100, 26); hx.fillStyle = 'rgba(14,52,86,0.94)'; hx.fill(); hx.lineWidth = 7; hx.strokeStyle = '#261c19'; hx.stroke(); tx('130 km', 840, 122, 60, '#fff6d6');
        // small coast icon (right) and drop icon (left)
        hx.fillStyle = '#e8c96a'; hx.strokeStyle = '#261c19'; hx.lineWidth = 6; hx.beginPath(); hx.moveTo(1400, 150); hx.lineTo(1460, 80); hx.lineTo(1520, 150); hx.closePath(); hx.fill(); hx.stroke();
        hx.fillStyle = '#5ec0ee'; hx.beginPath(); hx.moveTo(250, 70); hx.quadraticCurveTo(300, 130, 250, 160); hx.quadraticCurveTo(200, 130, 250, 70); hx.fill(); hx.stroke(); });
    }
    if (lt >= 16.12 && lt < 25.91) {
      const my = meronY(lt); const top = my + 1800;
      const k = ease(lt, 22.6, 23.6);
      if (lt > 23.4) { dblArrow([-3700, 0, 830], [-3700, -950, 830], '#ffd447', ease(lt, 23.6, 24.4)); }
      if (lt > 21 && lt < 23.5) { }
    }
    if (lt >= 25.91 && lt < 34.93) {
      const y200 = YM(200), k = ease(lt, 26.3, 27.0);
      dashLine(y200, -2000, -300, 400, '200 m', '#ffd447', k);
      const T = T4(lt), m = Math.max(0, MY(T.y));
      depthGauge(m / 1700, `${fmt(m)} m`, { a: ease(lt, 26.3, 26.9), size: 44 });
      tint('#050f2a', cl((m - 200) / 800, 0, 0.42), null);
    }
    if (lt >= 7.87 && lt < 16.12) tint('#050f2a', cl((MY(SLOPE(lt).y) - 200) / 1500, 0, 0.5));
    if (lt >= 34.93 && wn === 'sec') {
      // total darkness with soft pools of light around Tipa and the glowing creatures
      const tp = scr([-2830, WORLD.sec.SEC.yAt(-2830) + 90, 100]);
      const dark = ease(lt, 34.93, 36.0) * 0.46;
      tint('#0a2650', dark, [tp[0], tp[1], px(560), 0.6 + 0.25 * ease(lt, 36, 37)]);
      for (let i = 0; i < 34; i++) { const h1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, h2 = Math.abs(Math.sin(i * 78.233 + 1.7) * 12345.678) % 1, tw = Math.max(0, Math.sin(ST.t * (0.8 + h1) + i * 2.3)); const s = scr([-3700 + h1 * 1900, -2750 + h2 * 900, 100 + 80 * h1]); if (s[2] < 1 && tw > 0.05) glowAt(s[0], s[1], px(16 + 14 * h2), 'rgba(150,235,255,0.9)', 0.75 * tw * dark / 0.46); }
      WORLD.sec.ang.forEach((a, i) => { const q = new THREE.Vector3(); a.userData.lure.getWorldPosition(q); const s = scr(q); if (s[2] < 1) glowAt(s[0], s[1], px(190), 'rgba(255,240,150,0.95)', 0.95 * dark / 0.46); });
      WORLD.sec.jel.forEach((a, i) => { const q = new THREE.Vector3(); a.getWorldPosition(q); const s = scr(q); if (s[2] < 1) glowAt(s[0], s[1], px(230), 'rgba(190,150,255,0.8)', 0.6 * dark / 0.46); });
      if (lt > 36.5) { // frost breath
        const q = frac((lt - 36.5) * 0.6); const s = scr([-2830 - 70, WORLD.sec.SEC.yAt(-2830) + 104, 150]); HUD.on = true; hx.save(); for (let i = 0; i < 4; i++) { const qq = frac(q + i / 4); hx.globalAlpha = 0.85 * (1 - qq); hx.fillStyle = '#e8f6ff'; hx.strokeStyle = '#8fb8d8'; hx.lineWidth = px(4); hx.beginPath(); hx.arc(s[0] - px(30 + 140 * qq), s[1] - px(10 + 60 * qq) - px(8 * i), px(14 + 30 * qq), 0, 7); hx.fill(); hx.stroke(); } hx.restore(); }
      if (lt > 45.5) { // a warm glimmer comes down from above (the verse reaches the depths)
        const s = scr([-2830, WORLD.sec.SEC.yAt(-2830) + 330 - 0, 100]); for (let i = 0; i < 7; i++) { const q = frac((lt - 45.5) * 0.4 + i / 7); glowAt(s[0] + px(80 * Math.sin(i * 2.1)), s[1] - px(560) * (1 - q) * 0.8 + px(40), px(40 + 40 * Math.sin(Math.PI * q)), 'rgba(255,225,130,0.95)', 0.9 * Math.sin(Math.PI * q)); } }
    }
  },
};
