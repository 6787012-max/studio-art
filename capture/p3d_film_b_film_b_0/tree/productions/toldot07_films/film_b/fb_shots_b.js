/* film_b shots b2 (wind lifts waves) and b3 (bottle). ASCII only. */
import { THREE, sm, cl, frac, V, KT, L, ease, lerp, lerpv, WORLD, ST, AC, put, talk, gy, PROM_Y, bottles, splash, swell, stormCloud, rain1, hx, HUD, scr, txt, px, W, H, cam, rainHud } from './fb_core.js';
import { SH, mv, yawTo, fc, lk, face, bl, PI } from './fb_shots.js';

/* ======================================================================== b2 : wind lifts waves (30.9 s) */
const gx2 = lt => lerp(-1500, 1500, ease(lt, 0.2, 5.3));
function roundRect(x, y, w, h, r) { hx.beginPath(); hx.moveTo(x + r, y); hx.arcTo(x + w, y, x + w, y + h, r); hx.arcTo(x + w, y + h, x, y + h, r); hx.arcTo(x, y + h, x, y, r); hx.arcTo(x, y, x + w, y, r); hx.closePath(); }
function counter(i, f, kind, pop) {
  const s = px(200), cx = px(170 + i * 250), cy = px(190), k = 0.4 + 0.6 * sm(pop);
  HUD.on = true; hx.save(); hx.translate(cx, cy); hx.scale(k, k);
  hx.lineWidth = px(8); hx.strokeStyle = '#261c19'; hx.fillStyle = '#fff6dc'; roundRect(-s / 2, -s / 2, s, s, px(26)); hx.fill(); hx.stroke();
  hx.lineCap = 'round'; hx.lineJoin = 'round'; hx.lineWidth = px(9);
  if (kind === 0) { // wind strength: three streaks that lengthen + swirl tips
    hx.strokeStyle = '#3f86c8';
    for (let r = 0; r < 3; r++) { const y = (r - 1) * px(38), len = px(40 + 78 * f) * (1 - 0.1 * r); hx.beginPath(); hx.moveTo(-px(80), y); hx.lineTo(-px(80) + len, y); hx.arc(-px(80) + len, y - px(12), px(12), Math.PI / 2, -Math.PI * 0.4, true); hx.stroke(); }
  } else if (kind === 1) { // clock
    hx.strokeStyle = '#261c19'; hx.fillStyle = '#ffffff'; hx.beginPath(); hx.arc(0, 0, px(72), 0, 7); hx.fill(); hx.stroke();
    for (let q = 0; q < 12; q++) { const a = q * Math.PI / 6; hx.lineWidth = px(5); hx.beginPath(); hx.moveTo(Math.sin(a) * px(58), -Math.cos(a) * px(58)); hx.lineTo(Math.sin(a) * px(67), -Math.cos(a) * px(67)); hx.stroke(); }
    hx.lineWidth = px(9); const a = f * Math.PI * 1.9; hx.beginPath(); hx.moveTo(0, 0); hx.lineTo(Math.sin(a) * px(52), -Math.cos(a) * px(52)); hx.stroke(); hx.beginPath(); hx.moveTo(0, 0); hx.lineTo(Math.sin(a / 12) * px(34), -Math.cos(a / 12) * px(34)); hx.stroke();
  } else { // distance arrow
    hx.strokeStyle = '#261c19'; hx.fillStyle = '#e8573a'; const x0 = -px(78), x1 = x0 + px(156) * (0.2 + 0.8 * f);
    hx.beginPath(); hx.arc(x0, 0, px(14), 0, 7); hx.fill(); hx.stroke(); hx.lineWidth = px(9); hx.setLineDash([px(16), px(12)]); hx.beginPath(); hx.moveTo(x0 + px(14), 0); hx.lineTo(x1 - px(20), 0); hx.stroke(); hx.setLineDash([]);
    hx.fillStyle = '#e8573a'; hx.beginPath(); hx.moveTo(x1, 0); hx.lineTo(x1 - px(30), -px(24)); hx.lineTo(x1 - px(30), px(24)); hx.closePath(); hx.fill(); hx.stroke();
  }
  hx.restore();
  // gauge bar
  hx.save(); hx.translate(cx, cy + s / 2 * k + px(30)); hx.lineWidth = px(6); hx.strokeStyle = '#261c19'; hx.fillStyle = '#fff6dc'; roundRect(-px(90), -px(14), px(180), px(28), px(14)); hx.fill(); hx.stroke();
  if (f > 0.01) { hx.fillStyle = ['#3f86c8', '#f2a33a', '#e8573a'][kind]; roundRect(-px(86), -px(10), Math.max(px(20), px(172) * f), px(20), px(10)); hx.fill(); }
  hx.restore();
}

SH.b2 = {
  setups: [
    { a: 0, b: 2.7, w: 'open', cam: (u, lt) => { const g = gx2(lt); return { p: [g + 1250, 250, 800], l: [g + 40, 290, -60], fov: 30 }; } },
    { a: 2.7, b: 5.35, w: 'open', cam: (u, lt) => { const g = gx2(lt); return { p: [g - 250, 600, 1300], l: [g + 320, 110, -160], fov: 32 }; } },
    { a: 5.35, b: 8.1, w: 'open', cam: mv([-330, 250, 1150], [-20, 300, -60], [-260, 262, 1080], [-20, 300, -60], 30, 29) },
    { a: 8.1, b: 10.72, w: 'open', cam: mv([1000, 210, 800], [330, 160, 40], [900, 200, 700], [330, 170, 40], 32, 32) },
    { a: 10.72, b: 12.8, w: 'study', cam: mv([760, 215, 520], [210, 185, -110], [700, 212, 480], [210, 185, -110], 32, 32) },
    { a: 12.8, b: 14.5, w: 'study', cam: mv([470, 190, 330], [335, 150, -115], [420, 188, 270], [335, 152, -115], 28, 24) },
    { a: 14.5, b: 15.66, w: 'study', cam: mv([420, 215, 60], [130, 200, -60], [380, 213, 40], [130, 200, -60], 30, 29) },
    { a: 15.66, b: 17.9, w: 'beachS', cam: mv([880, 200, 40], [60, 160, 190], [800, 195, 20], [60, 162, 190], 32, 32), fg: 'grass' },
    { a: 17.9, b: 21.03, w: 'beachS', cam: mv([350, 230, 520], [0, 130, -700], [60, 300, -3300], [0, 360, -8400], 32, 36) },
    { a: 21.03, b: 23.6, w: 'beachW', cam: mv([2250, 240, -60], [0, 330, -60], [2350, 260, -60], [0, 340, -60], 38, 38) },
    { a: 23.6, b: 26.83, w: 'beachW', cam: mv([2350, 260, -60], [0, 340, -60], [3100, 330, -40], [0, 380, -60], 38, 40) },
    { a: 26.83, b: 28.7, w: 'beachW', cam: mv([40, 240, 1060], [45, 232, 385], [35, 236, 1020], [45, 232, 385], 44, 42) },
    { a: 28.7, b: 30.9, w: 'beachW', cam: mv([55, 236, 990], [55, 228, 385], [75, 232, 950], [55, 228, 385], 42, 40) },
  ],
  acts(lt, S) {
    const t = ST.t;
    if (lt < 10.72) {
      const ow = WORLD.open;
      if (lt < 5.35) {
        const g = gx2(lt);
        ow.update(t, 30, [g + 5160, 0, 5000, 20000, 0.12]);
        put('gust', { x: g, y: 335 + 24 * Math.sin(t * 1.3), z: -60, yaw: -0.1, blow: 1, scale: 2.2 }, { expr: 'happy', blow: 1, blink: bl(t, 0.2) });
        const tx = 820, tz = 70, f = ow.sea.float(tx, tz, 70), hit = ease(g, 380, 700);
        put('tipa', { x: tx, y: f.y - 46, z: tz, yaw: yawTo(tx, tz, g, 600) - 0.3, tilt: f.rz * 40, float: 0.4, arms: hit > 0.6 ? 'up' : 'down', feet: false, shadow: false }, face(hit > 0.6 ? 'cheering' : hit > 0.05 ? 'surprised' : 'curious', t, 0.3, { look: lk(-0.5, 0) }));
        put('gull', { x: g + 300 - 60 * lt, y: 470 + 20 * Math.sin(lt * 1.5), z: 260, yaw: 0.3, fly: true, flap: 1, shadow: false }, { expr: 'happy' });
      } else {
        const f1 = ease(lt, 5.6, 7.2), f2 = ease(lt, 7.2, 9.0), f3 = ease(lt, 9.0, 10.6), A = 8 + 12 * f1 + 12 * f2 + 14 * f3;
        ow.update(t, A, null);
        put('gust', { x: -120, y: 340 + 22 * Math.sin(t * 1.3), z: -60, yaw: -0.05, blow: 1, scale: 2.2 }, { expr: lt < 6.4 ? 'happy' : 'neutral', blow: 1, blink: bl(t, 0.2) });
        const tx = 430, tz = 60, f = ow.sea.float(tx, tz, 80);
        put('tipa', { x: tx, y: f.y - 46, z: tz, yaw: yawTo(tx, tz, 600, 400) - 0.1, tilt: f.rz * 40, float: 0.4, arms: f3 > 0.5 ? 'up' : lt > 7 ? 'wave' : 'down', feet: false, shadow: false }, face(f3 > 0.5 ? 'cheering' : f2 > 0.3 ? 'surprised' : 'happy', t, 0.3, { look: lk(-0.4, -0.2) }));
      }
    } else if (lt < 15.66) {
      const sw = WORLD.study; sw.update(t, 'day', 0.12 + 0.85 * ease(lt, 10.8, 15.0), 0, 1);
      const up = ease(lt, 10.9, 11.6);
      put('rabbi', { x: 120, z: -70, y: 0, yaw: -0.55, headRot: -12 * up, headYaw: 0.08, arms: { l: { sz: 0.45, sx: 0.12, el: 1.15, curl: 0.5 }, r: { sz: 0.08 + 0.35 * ease(lt, 13.2, 13.9), sx: 0.2, el: 0.5 + 0.5 * ease(lt, 13.2, 13.9), curl: 0.4 } } },
        face('smile', t, 0.1, { look: lk(0.1, -0.7), talk: talk(lt, 10.9, 12.6) }));
      put('boy', { x: -80, z: -30, y: 0, yaw: -0.2, headRot: -6 * up, headTilt: 4 * Math.sin(lt * 1.3) * ease(lt, 12.0, 12.6), arms: { l: { sz: 0.08 }, r: { sz: 0.08 } } }, face('thinking', t, 0.7, { look: lk(0.2, -0.5) }));
    } else if (lt < 21.03) {
      const sb = WORLD.beachS; sb.update(t, lt < 17.9 ? 3 : 3 + 20 * ease(lt, 18.5, 21), 0.4);
      stormCloud.visible = lt >= 17.9; stormCloud.scale.setScalar(1.7); stormCloud.position.set(0, 1050, -8300); rain1.visible = lt >= 17.9; rain1.scale.setScalar(2.2); rain1.position.set(0, 0, -8200); rain1.userData.update(t);
      if (false) swell.forEach((w, i) => { w.visible = true; const z = -6500 + 520 * i + 520 * (lt - 15.66); w.position.set((i % 2 ? 450 : -450) + (i - 2) * 80, -8, z); w.userData.update(t + i * 1.7, 1); });
      if (lt < 17.9) {
        put('rabbi', { x: -40, z: 190, y: gy(-40, 190), yaw: PI / 2 - 0.55, headYaw: 0.12, arms: { l: { sz: 0.5, sx: 0.1, el: 1.1 }, r: { sz: 0.08 + 0.8 * ease(lt, 16.2, 16.8), sx: 0.25, el: 0.4 } } }, face('smile', t, 0.1, { look: lk(0.3, 0), talk: talk(lt, 15.9, 17.6) }));
        put('boy', { x: 150, z: 205, y: gy(150, 205), yaw: PI / 2 - 0.85, arms: { l: { sz: 0.08 }, r: { sz: 0.08 } } }, face('thinking', t, 0.6, { look: lk(-0.5, 0.1) }));
        const tx = -170, tz = -120, f = sb.sea.float(tx, tz, 60);
        put('tipa', { x: tx, y: f.y - 46, z: tz, yaw: yawTo(tx, tz, 880, 40), tilt: f.rz * 40, float: 0.4, arms: 'wave', feet: false, shadow: false }, face('happy', t, 0.3, { look: lk(0.4, 0) }));
        put('gull', { x: 300 + 70 * lt, y: 420, z: -300, yaw: 0.2, fly: true, flap: 1, shadow: false }, { expr: 'happy' });
      }
      if (lt >= 17.9) { const gz = -5700 + 120 * (lt - 17.9);
        put('gust', { x: 0, y: 560 + 30 * Math.sin(t * 1.3), z: gz, yaw: -1.57, blow: 1, scale: 6.4 }, { expr: 'happy', blow: 1, blink: bl(t, 0.2) }); }
    } else if (lt < 26.83) {
      const wb = WORLD.beachW; wb.update(t, 52, 1.6);
      wb.giants.forEach(g => g.w.visible = false);
      wb.hero.visible = true; wb.hero.userData.update(t, 0.35 + 0.65 * ease(lt, 21.1, 24.4)); wb.house.visible = true;
    } else {
      const wb = WORLD.beachW; wb.update(t, 52, 1.6); wb.giants.forEach((g, i) => { g.w.visible = true; g.w.userData.update(t + i * 2.3, 0.7 + 0.3 * Math.sin(t * 0.6 + i)); });
      const no = ease(lt, 28.5, 28.9), shake = Math.sin(lt * 9) * no, step = ease(lt, 28.9, 29.7);
      const CX = 45, CZ = 1050;
      put('rabbi', { x: 115, z: 385, y: PROM_Y, yaw: fc(115, 385, CX, CZ, -0.4), headYaw: 0.1, arms: { l: { sz: 0.5, sx: 0.1, el: 1.1 }, r: { sz: 0.08 + 0.92 * no, sx: 0.2 + 0.08 * shake, el: 0.1 + 1.1 * no, curl: 0, tw: 0 } } }, face('explaining', t, 0.1, { look: lk(-0.2, 0), talk: talk(lt, 26.9, 30.2) }));
      put('boy', { x: -30, z: 385 + 60 * step, y: PROM_Y, yaw: fc(-30, 385, CX, CZ, 0.4), step: lt * 2, headYaw: -0.1, arms: { l: { sz: 0.08 }, r: { sz: 0.08 } } }, face(step > 0.5 ? 'worried' : 'surprised', t, 0.6, { look: lk(0.4, 0) }));
    }
  },
  hud(lt, S) {
    if (lt >= 5.35 && lt < 10.72) { counter(0, ease(lt, 5.6, 7.2), 0, ease(lt, 5.4, 5.9)); counter(1, ease(lt, 7.2, 9.0), 1, ease(lt, 7.0, 7.5)); counter(2, ease(lt, 9.0, 10.6), 2, ease(lt, 8.8, 9.3)); }
    if (lt >= 21.03 && lt < 26.83) drawSixM(lt, 21.4, 'beachW');
    if (lt >= 21.03) rainHud(lt);
    if (lt >= 18.3 && lt < 21.03) chevrons(lt);
  },
};
// "six metres" bracket + digits (shared with b4b): house roof and wave crest at the same height
export function drawSixM(lt, t0, w) {
  const k = ease(lt, t0, t0 + 0.5); if (k <= 0) return; const wb = WORLD[w]; const yTop = PROM_Y + 768;
  const p0 = scr(V(0, PROM_Y, 250)), p1 = scr(V(0, yTop, 250)), q0 = scr(V(0, yTop, -520)), q1 = scr(V(0, yTop, 520));
  HUD.on = true; hx.save(); hx.globalAlpha = k; hx.lineCap = 'round'; hx.lineJoin = 'round';
  hx.setLineDash([px(18), px(14)]); hx.lineWidth = px(7); hx.strokeStyle = '#261c19'; hx.beginPath(); hx.moveTo(q0[0], q0[1]); hx.lineTo(q1[0], q1[1]); hx.stroke(); hx.lineWidth = px(3.5); hx.strokeStyle = '#fff6d6'; hx.beginPath(); hx.moveTo(q0[0], q0[1]); hx.lineTo(q1[0], q1[1]); hx.stroke(); hx.setLineDash([]);
  const y0 = p0[1], y1 = lerp(p0[1], p1[1], sm(k)), x = p0[0];
  for (const [cc, lw] of [['#261c19', px(14)], ['#ffd54a', px(7)]]) { hx.strokeStyle = cc; hx.lineWidth = lw; hx.beginPath(); hx.moveTo(x, y0); hx.lineTo(x, y1); hx.stroke(); hx.beginPath(); hx.moveTo(x - px(24), y0); hx.lineTo(x + px(24), y0); hx.stroke(); hx.beginPath(); hx.moveTo(x - px(24), y1); hx.lineTo(x + px(24), y1); hx.stroke(); }
  hx.restore(); txt('6 m', x - px(150), (y0 + y1) / 2, px(92), { k: 0.5 + 0.5 * sm(ease(lt, t0 + 0.2, t0 + 0.8)), col: '#ffd54a' });
}

/* ======================================================================== b3 : bottle (41.1 s) */
const PIER = { x: 650, z0: 40, len: 700 };
const FLIGHT = { t0: 4.3, t1: 5.7, end: [585, 0, -1250] };
function handPos(x, y, z, yaw, lx, ly, lz) { return [x + lx * Math.cos(yaw) + lz * Math.sin(yaw), y + ly, z - lx * Math.sin(yaw) + lz * Math.cos(yaw)]; }
const RP = { x: 665, z: -565, yaw: PI / 2 - 0.55 };
function bottlePier(lt) {   // returns {pos, rot:[rx,ry,rz], mode}
  const sb = WORLD.beachS;
  if (lt < FLIGHT.t0) { const h = handPos(RP.x, 46, RP.z, RP.yaw, 62, 150 + 22 * ease(lt, 3.2, 3.9) - 40 * ease(lt, 3.9, 4.3), 42); return { pos: h, rot: [0, RP.yaw, PI / 2 - 0.2 * ease(lt, 3.8, 4.3)], mode: 'hand' }; }
  if (lt < FLIGHT.t1) { const u = (lt - FLIGHT.t0) / (FLIGHT.t1 - FLIGHT.t0), s0 = handPos(RP.x, 46, RP.z, RP.yaw, 70, 190, 42), e = FLIGHT.end;
    const ef = sb.sea.float(e[0], e[2], 50);
    return { pos: [lerp(s0[0], e[0], u), lerp(s0[1], ef.y + 4, u) + 280 * 4 * u * (1 - u), lerp(s0[2], e[2], u)], rot: [0, 0.3, PI / 2 - 0.4 + 9.5 * u], mode: 'air' }; }
  const e = FLIGHT.end, x = e[0] + 14 * Math.sin(lt * 0.4), z = e[2] + 8 * Math.sin(lt * 0.33), f = sb.sea.float(x, z, 60);
  const sink = 40 * Math.exp(-(lt - FLIGHT.t1) * 3.5) * Math.cos((lt - FLIGHT.t1) * 9);
  return { pos: [x, f.y + 6 - sink, z], rot: [f.rx, 0.4, f.rz + 0.05], mode: 'float' };
}
/* section3 wave field: humps travelling +x */
const HUMP_T = [15.9, 19.3, 22.7, 26.1, 29.5, 35.3, 39.6], HC = 300, HS = 330, HA = 92;
const hump3 = (x, lt) => { let h = 0; for (const T of HUMP_T) { const X = HC * (lt - T), d = (x - X) / (x < X ? HS * 1.25 : HS * 0.85); h += HA * Math.exp(-d * d); } return h; };
const slope3 = (x, lt) => (hump3(x + 8, lt) - hump3(x - 8, lt)) / 16;
function secBottle(i, x, lt, sc) {
  const b = bottles[i], y = hump3(x, lt); b.visible = true; b.scale.setScalar(sc || 1);
  b.position.set(x, y + 8 * (sc || 1), 20); b.rotation.set(0, 0, Math.atan(slope3(x, lt)) * 0.9); return y;
}
const SEC3_BG = (lt) => WORLD.section3.sec.setSurface(WORLD.section3.sec.xs.map(x => hump3(x, lt)));
function dockPeople(lt, t, boyFx, rabbiFx) {
  put('boy', { x: 1740, z: 15, y: 161, yaw: fc(1740, 15, 1850, 900, 0.4), headYaw: 0.05, arms: boyFx.arms || { l: { sz: 0.08 }, r: { sz: 0.08 } } }, Object.assign({ expr: 'thinking', blink: bl(t, 0.6), look: lk(0.4, 0.1) }, boyFx.face || {}));
  put('rabbi', { x: 1960, z: 10, y: 161, yaw: fc(1960, 10, 1850, 900, -0.4), headYaw: -0.05, arms: rabbiFx.arms || { l: { sz: 0.45, sx: 0.1, el: 1.1 }, r: { sz: 0.08 } } }, Object.assign({ expr: 'smile', blink: bl(t, 0.1), look: lk(-0.3, 0) }, rabbiFx.face || {}));
}
function fishLife(t) {
  for (let i = 0; i < 3; i++) { const x = -2300 + 4600 * frac(t / (15 + 2 * i) + i * 0.31), y = [-220, -300, -160][i] - 14 * Math.sin(t * 0.9 + i), f = AC['fish' + i];
    put('fish' + i, { x, y, z: -20 - 40 * i, yaw: 0, swim: 0.5 + 0.5 * Math.sin(t * 0.5 + i) }, { expr: 'happy', blink: bl(t, i * 0.3) }); }
}
function guide(lt, x, t) {   // dotted vertical guide + marker arrow at the bottle
  const top = scr(V(x, 300, 190)), bot = scr(V(x, -300, 190)), y = hump3(x, lt), vy = (hump3(x, lt + 0.05) - hump3(x, lt - 0.05)) / 0.1, m = scr(V(x + 285, y + 8, 190));
  HUD.on = true; hx.save(); hx.setLineDash([px(14), px(12)]); hx.lineCap = 'round'; hx.lineWidth = px(7); hx.strokeStyle = '#261c19'; hx.beginPath(); hx.moveTo(top[0], top[1]); hx.lineTo(bot[0], bot[1]); hx.stroke();
  hx.lineWidth = px(3.5); hx.strokeStyle = '#fff6d6'; hx.beginPath(); hx.moveTo(top[0], top[1]); hx.lineTo(bot[0], bot[1]); hx.stroke(); hx.setLineDash([]);
  const dir = Math.abs(vy) < 6 ? 0 : (vy > 0 ? -1 : 1); // screen y grows downwards
  for (const [col, lw] of [['#261c19', px(11)], ['#ffd54a', px(5)]]) { hx.strokeStyle = col; hx.fillStyle = col; hx.lineWidth = lw; const ax = m[0], ay = m[1];
    if (dir !== 0) { hx.beginPath(); hx.moveTo(ax, ay - dir * px(44)); hx.lineTo(ax, ay + dir * px(44)); hx.stroke(); hx.beginPath(); hx.moveTo(ax - px(20), ay + dir * px(20)); hx.lineTo(ax, ay + dir * px(48)); hx.lineTo(ax + px(20), ay + dir * px(20)); hx.stroke(); }
    else { hx.beginPath(); hx.arc(ax, ay, px(20), 0, 7); hx.fill(); } }
  hx.restore();
}
function crossedArrow(x, y, k) {
  HUD.on = true; hx.save(); hx.globalAlpha = k; hx.lineCap = 'round'; hx.lineJoin = 'round';
  for (const [col, lw] of [['#261c19', px(15)], ['#ffffff', px(8)]]) { hx.strokeStyle = col; hx.lineWidth = lw; hx.beginPath(); hx.moveTo(x - px(70), y); hx.lineTo(x + px(60), y); hx.stroke(); hx.beginPath(); hx.moveTo(x + px(30), y - px(30)); hx.lineTo(x + px(66), y); hx.lineTo(x + px(30), y + px(30)); hx.stroke(); }
  for (const [col, lw] of [['#261c19', px(18)], ['#e8402a', px(10)]]) { hx.strokeStyle = col; hx.lineWidth = lw; hx.beginPath(); hx.moveTo(x - px(50), y - px(50)); hx.lineTo(x + px(50), y + px(50)); hx.stroke(); hx.beginPath(); hx.moveTo(x + px(50), y - px(50)); hx.lineTo(x - px(50), y + px(50)); hx.stroke(); }
  hx.restore();
}

SH.b3 = {
  setups: [
    { a: 0, b: 3.6, w: 'beachS', cam: mv([1600, 185, -480], [650, 175, -480], [1540, 182, -480], [650, 175, -480], 32, 31) },
    { a: 3.6, b: 5.7, w: 'beachS', cam: (u, lt) => { const b = bottlePier(Math.min(lt + 0.12, 9)).pos; return { p: [1280, 205, -300], l: [lerp(640, b[0], sm(u)), lerp(160, b[1] * 0.5 + 40, sm(u)), lerp(-520, b[2], sm(u))], fov: 30 }; } },
    { a: 5.7, b: 7.6, w: 'beachS', cam: mv([760, 70, -980], [585, 30, -1260], [730, 60, -1010], [585, 28, -1260], 28, 26) },
    { a: 7.6, b: 9.74, w: 'beachS', cam: mv([1560, 185, -480], [650, 175, -480], [1500, 182, -480], [650, 175, -480], 32, 31) },
    { a: 9.74, b: 12.6, w: 'section3', cam: mv([-40, -150, 1250], [0, -150, 0], [20, -145, 1190], [0, -150, 0], 32, 32), fg: 'rock' },
    { a: 12.6, b: 14.2, w: 'section3', cam: mv([1850, 292, 900], [1850, 285, 0], [1830, 296, 860], [1850, 283, 0], 32, 31) },
    { a: 14.2, b: 15.88, w: 'section3', cam: mv([-120, -40, 900], [-60, -50, 0], [-30, -40, 860], [0, -50, 0], 28, 27) },
    { a: 15.88, b: 18.5, w: 'section3', cam: mv([0, -150, 1250], [0, -150, 0], [30, -145, 1190], [0, -150, 0], 32, 31) },
    { a: 18.5, b: 21.4, w: 'section3', cam: mv([360, -60, 900], [20, -50, 0], [320, -55, 860], [20, -50, 0], 28, 26), fg: 'rock' },
    { a: 21.4, b: 24.42, w: 'section3', cam: mv([60, -150, 1250], [0, -150, 0], [20, -150, 1190], [0, -150, 0], 32, 32) },
    { a: 24.42, b: 27.5, w: 'section3', cam: mv([-120, -150, 1200], [60, -150, 0], [-60, -150, 1160], [60, -150, 0], 32, 32), fg: 'rock' },
    { a: 27.5, b: 29.7, w: 'section3', cam: mv([1850, 292, 900], [1850, 285, 0], [1830, 296, 860], [1850, 283, 0], 32, 31) },
    { a: 29.7, b: 32.16, w: 'section3', cam: mv([300, -60, 900], [160, -50, 0], [270, -60, 860], [160, -50, 0], 28, 27) },
    { a: 32.16, b: 34.6, w: 'section3', cam: mv([0, -170, 1550], [0, -170, 0], [0, -170, 1450], [0, -170, 0], 32, 32), fg: 'rock' },
    { a: 34.6, b: 36.0, w: 'section3', cam: mv([1850, 292, 900], [1850, 285, 0], [1830, 296, 860], [1850, 283, 0], 32, 31) },
    { a: 36.0, b: 38.5, w: 'section3', cam: mv([-420, -110, 1100], [-100, -140, 0], [-140, -110, 1100], [140, -140, 0], 30, 30) },
    { a: 38.5, b: 41.1, w: 'section3', cam: mv([0, -170, 1450], [0, -170, 0], [0, -170, 1550], [0, -170, 0], 32, 32) },
  ],
  acts(lt, S) {
    const t = ST.t;
    if (lt < 9.74) {
      const sb = WORLD.beachS; sb.update(t, 5, 0.8); sb.mirror.userData.setOp(0); sb.refl.forEach(e => e.material.opacity = 0);
      const bp = bottlePier(lt); const bt = bottles[0]; bt.visible = true; bt.position.set(...bp.pos); bt.rotation.set(...bp.rot); bt.scale.setScalar(0.9);
      if (lt >= FLIGHT.t1 && lt < FLIGHT.t1 + 1.1) { splash.position.set(FLIGHT.end[0], 0, FLIGHT.end[2]); splash.userData.update((lt - FLIGHT.t1) / 1.1); }
      const show = ease(lt, 0.5, 1.0), wind = ease(lt, 3.1, 3.9), swing = ease(lt, 3.9, 4.3), relax = ease(lt, 5.0, 5.6);
      const rsz = lt < 3.1 ? 0.95 + 0.1 * show : lerp(0.95, -0.75, wind) * (1 - swing) + 2.0 * swing;
      put('rabbi', { x: RP.x, z: RP.z, y: 46, yaw: RP.yaw, lean: 4 * wind - 8 * swing, twist: 0.25 * wind - 0.4 * swing, headYaw: 0.1, arms: { l: { sz: 0.45, sx: 0.1, el: 1.1 }, r: { sz: (lt < 4.3 ? rsz : lerp(2.0, 0.08, relax)), sx: 0.1, el: (lt < 3.1 ? 1.15 : lerp(1.15, 0.9, wind) * (1 - swing) + 0.2 * swing) * (1 - relax) + 0.4 * relax, curl: lt < 4.3 ? 0.9 : 0.1 } } },
        face('smile', t, 0.1, { look: lk(0.3, 0), talk: talk(lt, 0.5, 3.4) }));
      const surp = ease(lt, 5.7, 6.0);
      put('boy', { x: 640, z: -395, y: 46, yaw: PI / 2 - 0.9, headYaw: -0.1, arms: { l: { sz: 0.08 }, r: { sz: 0.08 + 1.4 * ease(lt, 7.6, 8.2), sx: 0.25, el: 0.2, point: lt > 7.9 } } }, face(surp > 0.5 ? 'surprised' : 'thinking', t, 0.6, { look: lk(-0.5, 0.1) }));
      put('gull', { x: 690, y: 98, z: 40 - 80, yaw: 2.6 + 0.2 * Math.sin(lt * 0.4), flap: 0 }, face('curious', t, 0.4));
    } else {
      const w3 = WORLD.section3, sec = w3.sec; w3.bg.update(t, 3); sec.update(t); SEC3_BG(lt); sec.setSurface(sec.xs.map(x => hump3(x, lt)));
      fishLife(t); w3.post.visible = lt < 32.16; w3.post.position.set(330, 0, 40); w3.post.scale.set(1.7, 1, 1.7);
      const hold = ease(lt, 11.4, 12.2) * (1 - ease(lt, 15.2, 15.9));
      dockPeople(lt, t, { arms: { l: { sz: 0.08 + 1.8 * hold, sx: 0.2, el: 0.2 + 2.0 * hold }, r: { sz: 0.08 + 1.8 * hold, sx: 0.2, el: 0.2 + 2.0 * hold } }, face: { expr: lt < 24.42 ? (hold > 0.5 ? 'surprised' : 'thinking') : lt < 32.16 ? 'surprised' : 'laugh', talk: hold > 0.5 ? 'M' : null } }, { face: { expr: lt > 32 ? 'laugh' : 'smile', talk: talk(lt, 9.9, 11.4) } });
      if (lt < 32.16) {
        const y = secBottle(0, 0, lt, 2.4);
        if (lt >= 15.88 && lt < 24.42) guide(lt, 0, t);
        if (lt >= 24.42 && lt < 32.16 && (S.a === 24.42 || S.a === 29.7)) crossedArrow(scr(V(-60, 210, 190))[0], scr(V(-60, 210, 190))[1], ease(lt, 25.2, 25.8));
      } else {
        const hump = x => hump3(x, lt);
        for (let i = 0; i < 6; i++) { const x = -550 + 220 * i; secBottle(i, x, lt, 1.5); }
        const tx = 110, ty = hump3(tx, lt), sl = Math.atan(slope3(tx, lt));
        put('tipaS', { x: tx - 6, y: ty + 74, z: 24, yaw: PI * 0.0 - 0.15, tilt: -sl * 25, float: 0.3, arms: lt > 36.5 ? 'up' : 'wave', shadow: false, feet: false }, face(lt > 36.4 ? 'cheering' : 'happy', t, 0.2, { look: lk(0.3, 0) }));
      }
    }
  },
  hud(lt, S) { },
};

function chevrons(lt) {   // wave-travel arrows running from the far storm toward the beach
  const k = ease(lt, 18.3, 19.0) * (1 - ease(lt, 20.6, 21.03)); HUD.on = true; hx.save(); hx.globalAlpha = k; hx.lineCap = 'round'; hx.lineJoin = 'round';
  for (let i = 0; i < 4; i++) { const f = frac((lt - 18.3) * 0.32 + i / 4), y = H * (0.58 + 0.34 * f * f), sz = px(40 + 120 * f * f), x = W * (0.5 + 0.12 * (i % 2 ? 1 : -1) * f);
    for (const [c, lw] of [['#261c19', px(22) * (0.4 + f)], ['#ffffff', px(11) * (0.4 + f)]]) { hx.strokeStyle = c; hx.lineWidth = lw; hx.beginPath(); hx.moveTo(x - sz, y - sz * 0.5); hx.lineTo(x, y + sz * 0.15); hx.lineTo(x + sz, y - sz * 0.5); hx.stroke(); } }
  hx.restore();
}
