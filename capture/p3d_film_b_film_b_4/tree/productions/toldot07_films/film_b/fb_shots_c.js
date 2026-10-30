/* film_b shots b4 (sand is the border), b4b (summer / winter), b5 (recap). ASCII only. */
import { THREE, sm, cl, frac, V, KT, L, ease, lerp, lerpv, WORLD, ST, AC, put, talk, gy, PROM_Y, PROM_Z0, bottles, splash, splash2, hugeSplash, ruler, foamBig, wallWave, swell, stormCloud, rain1, hx, HUD, scr, txt, px, W, H, cam, scene, foamSoft, rainHud } from './fb_core.js';
import { AUTOHIDE } from './fb_core.js';
import { SH, mv, yawTo, fc, lk, face, bl, PI } from './fb_shots.js';
import { drawSixM } from './fb_shots_b.js';

/* ======================================================================== section 4: shoaling wave engine */
const W4 = WORLD.section4, bed4 = W4.bed, xs4 = W4.sec.xs;
const depth4 = x => Math.max(25, -bed4(x));
const cspd = x => 140 + 330 * Math.sqrt(Math.min(520, depth4(x)) / 520);
const DT = 0.02, TAB = [-2500]; for (let i = 0; i < 3200; i++) TAB.push(TAB[i] + cspd(TAB[i]) * DT);
const xAt = tau => { if (tau <= 0) return -2500 + tau * cspd(-2500); const f = tau / DT, i = Math.floor(f); if (i >= TAB.length - 1) return TAB[TAB.length - 1] + (tau - (TAB.length - 1) * DT) * 200; return lerp(TAB[i], TAB[i + 1], f - i); };
const tauAt = x => { let i = 0; while (i < TAB.length - 1 && TAB[i] < x) i++; return i * DT; };
let XB = -1500; while (depth4(XB) > 118 && XB < 900) XB += 1;
const TAU_B = tauAt(XB), TB = [4.0, 11.4, 18.8, 26.2, 33.6, 41.0, 48.4, 55.8], S0 = TB.map(tb => tb - TAU_B);
const waveX = (k, lt) => xAt(lt - S0[k]);
function hpar(X) {
  const d = depth4(X), a0 = 34 * Math.pow(520 / cl(d, 50, 520), 0.45) * (1 + 0.55 * cl((300 - d) / 180, 0, 1)), ab = X > XB ? X - XB : 0;
  const a = a0 * (1 - 0.6 * (1 - Math.exp(-ab / 200))) * (X > 1000 ? Math.max(0, 1 - (X - 1000) / 220) : 1);
  const sig = 120 + 210 * Math.sqrt(cl(d, 40, 520) / 520), sk = X < XB ? 2.4 * cl((300 - d) / (300 - 118), 0, 1) : 2.4 * Math.max(0, 1 - ab / 160);
  return { a, sig, sk };
}
const chop = (x, t) => 4 * Math.sin(x * 0.007 + t * 1.3) + 2.2 * Math.sin(x * 0.013 - t * 2.1);
function surf4(lt, t) {
  const N = xs4.length, hs = new Float32Array(N), xo = new Float32Array(N), act = [];
  TB.forEach((tb, k) => { const X = waveX(k, lt); if (X > -2450 && X < 1250) act.push(Object.assign({ X, k }, hpar(X))); });
  for (let i = 0; i < N; i++) { const x = xs4[i]; let h = 0, o = 0;
    for (const w of act) { const dx = x - w.X, s = dx < 0 ? w.sig * 1.25 : w.sig * 0.8, g = w.a * Math.exp(-(dx / s) * (dx / s)); h += g; o += w.sk * g; }
    const bd = bed4(x), dry = cl((bd + 2) / 40, 0, 1); let hh = (h + chop(x, t)) * (1 - dry); if (bd > -2) hh = Math.min(hh, bd - 1); hs[i] = hh; xo[i] = o * (1 - dry); }
  return { hs, xo, act };
}
const hAtFn = (act, x, t) => { let h = chop(x, t); for (const w of act) { const dx = x - w.X, s = dx < 0 ? w.sig * 1.25 : w.sig * 0.8; h += w.a * Math.exp(-(dx / s) * (dx / s)); } return h; };
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function updateSection4(lt, t) {
  const { sec, sparks, foam } = W4; W4.bg.update(t, 3); sec.update(t);
  const { hs, xo, act } = surf4(lt, t); sec.setSurface(hs, xo);
  foam.forEach(m => m.visible = false); sparks.forEach(m => m.visible = false);
  // thrown foam + bore foam
  TB.forEach((tb, k) => { const e = lt - tb, base = (k % 2) * 40;
    if (e > 0 && e < 1.9) for (let j = 0; j < 22; j++) { const ej = e - 0.025 * j; if (ej < 0) continue; const vx = 120 + (j * 37) % 300, vy = 60 + (j * 53) % 220, x = XB + 150 + vx * ej, y = 70 + vy * ej - 0.5 * 650 * ej * ej; if (y < -10) continue; const m = foam[base + j]; m.visible = true; m.position.set(x, y, 205); m.scale.setScalar(0.6 + 0.7 * hash(j + k)); }
    const w = act.find(q => q.k === k); if (w && w.X > XB - 60 && w.X < 1050) for (let j = 0; j < 14; j++) { const x = w.X - 150 + j * 26 + 7 * Math.sin(t * 3 + j), m = foam[base + 22 + j]; m.visible = true; m.position.set(x, hAtFn(act, x, t) + 8, 205); m.scale.set(0.9 + 0.5 * hash(j * 3), 0.55, 0.9); } });
  // wave-base drag lines: six pale streaks along the seabed under the front-most wave in the shallows
  const sh = act.filter(w => w.X > -1100 && w.X < XB + 300).sort((a, b) => b.X - a.X)[0];
  if (sh) { const q = Math.floor(t * 9); sparks.forEach((m, i) => { if (i < 6) { const x = sh.X - 20 - i * 78 + 18 * (hash(q + i) - 0.5), by = bed4(x); m.visible = true; m.position.set(x, by + 20 + 26 * hash(q * 1.7 + i) + (i % 2) * 14, 195); m.rotation.z = Math.atan2(bed4(x + 60) - bed4(x - 60), 120) * 0.9; m.scale.set(2.3 + 1.2 * hash(i * 7 + q), 0.75, 1); } }); }
  return act;
}
function depthArrows(lt) {
  const k = ease(lt, 1.2, 1.9) * (1 - ease(lt, 8.0, 8.6)); if (k <= 0.01) return;
  HUD.on = true; hx.save(); hx.globalAlpha = k; hx.lineCap = 'round'; hx.lineJoin = 'round';
  for (const x of [-1250, 380]) { const a = scr(V(x, 6, 175)), b = scr(V(x, bed4(x) + 4, 175));
    for (const [c, lw] of [['#261c19', px(15)], ['#ffd54a', px(8)]]) { hx.strokeStyle = c; hx.lineWidth = lw; hx.beginPath(); hx.moveTo(a[0], a[1] + px(6)); hx.lineTo(b[0], b[1] - px(6)); hx.stroke();
      for (const [p, d] of [[a, 1], [b, -1]]) { hx.beginPath(); hx.moveTo(p[0] - px(22), p[1] + d * px(26)); hx.lineTo(p[0], p[1]); hx.lineTo(p[0] + px(22), p[1] + d * px(26)); hx.stroke(); } } }
  hx.restore();
}

/* ======================================================================== b4 : sand is the border (58 s) */
const foamEdge = (x, t) => { const uT = t * 1.1, run = 0.5 + 0.5 * Math.sin(uT * 1.1), W_ = 300; return -10 - 0.5 * W_ + W_ * (0.25 + 0.6 * run * 1.6) + 10 * Math.sin(x * 0.035 + uT * 0.8) + 6 * Math.sin(x * 0.11 - uT); };
const GRX = i => -330 + 110 * i;
let handsMade = false; const hands = [];
function makeHands() { if (handsMade) return; handsMade = true; const m = KT.M('#e9c987', '#d1b4a4'); for (let i = 0; i < 6; i++) { const g = new THREE.Group(); const geo = new THREE.CylinderGeometry(7, 7, 118, 12).rotateZ(Math.PI / 2); const me = new THREE.Mesh(geo, m); g.add(me); const o = new THREE.Mesh(geo.clone().scale(1.12, 1.9, 1.9), new THREE.MeshBasicMaterial({ color: '#261c19', side: THREE.BackSide })); g.add(o); g.visible = false; WORLD.beachS.g.add(g); hands.push(g); AUTOHIDE.push(g); } }
const SD = { a: 0 };
SH.b4 = {
  setups: [
    { a: 0, b: 4.4, w: 'section4', cam: mv([-500, -230, 1800], [-500, -230, 0], [-420, -225, 1750], [-420, -230, 0], 22, 22), fg: 'rock' },
    { a: 4.4, b: 8.78, w: 'section4', cam: mv([-300, -200, 1700], [-300, -200, 0], [-150, -190, 1650], [-150, -195, 0], 22, 22) },
    { a: 8.78, b: 11.0, w: 'section4', cam: (u, lt) => { const X = waveX(1, lt); return { p: [X - 260, -210, 1000], l: [X - 40, -230, 0], fov: 30 }; } },
    { a: 11.0, b: 14.2, w: 'section4', cam: (u, lt) => { const X = Math.min(waveX(1, lt), XB + 220); return { p: [X + 30, -15, 640], l: [X + 110, 12, 0], fov: 22 }; } },
    { a: 14.2, b: 18.89, w: 'section4', cam: mv([-200, -220, 1800], [-200, -225, 0], [-60, -215, 1750], [-60, -220, 0], 24, 24), fg: 'rock' },
    { a: 18.89, b: 22.4, w: 'beachS', cam: (u, lt) => { const z = -300 + 150 * ease(lt, 19.0, 22.3); return { p: [4300 - 150 * sm(u), 120, z], l: [0, 112, z + 10], fov: 8.6 }; } },
    { a: 22.4, b: 24.6, w: 'study', cam: mv([440, 190, 270], [335, 150, -118], [400, 188, 240], [335, 151, -118], 26, 24) },
    { a: 24.6, b: 29.0, w: 'beachS', cam: (u, lt) => { const z = -330 + 130 * ease(lt, 25.0, 28.6); return { p: [4300 - 200 * sm(u), 95 + 30 * sm(u), z + 25], l: [0, 108, z + 10], fov: 8.6 }; } },
    { a: 29.0, b: 32.5, w: 'beachS', cam: (u, lt) => { const z = foamEdge(-40, ST.t); return { p: [-900, 115, z - 380], l: [-40, 75, z + 10], fov: 32 }; } },
    { a: 32.5, b: 35.3, w: 'beachS', cam: (u, lt) => { const z = foamEdge(-40, ST.t); return { p: [-640, 105, z - 330], l: [-40, 80, z + 5], fov: 30 }; } },
    { a: 35.3, b: 37.38, w: 'beachS', cam: mv([300, 560, 520], [0, 0, 60], [330, 520, 470], [0, 0, 60], 32, 32) },
    { a: 37.38, b: 41.6, w: 'beachS', cam: mv([30, 270, 612], [0, 70, 60], [10, 265, 590], [0, 70, 60], 44, 42) },
    { a: 41.6, b: 44.0, w: 'beachS', cam: mv([20, 230, 520], [0, 75, 55], [0, 225, 495], [0, 75, 55], 40, 38) },
    { a: 44.0, b: 48.36, w: 'beachS', cam: mv([-20, 270, 612], [0, 70, 60], [10, 265, 590], [0, 70, 60], 44, 42) },
    { a: 48.36, b: 52.3, w: 'beachS', cam: mv([940, 195, -120], [135, 185, 200], [900, 190, -95], [135, 185, 200], 33, 32) },
    { a: 52.3, b: 55.0, w: 'beachS', cam: mv([780, 175, 10], [140, 165, 260], [740, 172, 30], [140, 165, 260], 34, 32) },
    { a: 55.0, b: 58.0, w: 'beachS', cam: mv([940, 195, -90], [135, 190, 200], [900, 192, -60], [135, 190, 200], 35, 33) },
  ],
  acts(lt, S) {
    const t = ST.t;
    if (lt < 18.89) {
      const act = updateSection4(lt, t); depthArrows(lt);
      for (let i = 0; i < 2; i++) { const x = -2200 + 3000 * frac(t / (30 + 7 * i) + i * 0.4), y = -230 - 60 * i; if (bed4(x) < y - 40) put('fish' + i, { x, y, z: -20 - 40 * i, yaw: 0, swim: 0.55 + 0.4 * Math.sin(t * 0.4) }, { expr: 'happy', blink: bl(t, i * 0.3) }); }
      return;
    }
    const sb = WORLD.beachS;
    if (lt < 22.4) { sb.update(t, 8, 0.8);
      const u = ease(lt, 18.9, 21.2), col = ease(lt, 21.2, 22.3);
      wallWave.visible = true; wallWave.scale.setScalar(2.0); wallWave.position.set(0, -10, -300 + 150 * ease(lt, 19.0, 22.3)); wallWave.rotation.y = -PI / 2; wallWave.userData.update(t, (0.45 + 0.55 * u) * (1 - 0.85 * col));
      foamSoft.visible = col > 0.02; foamSoft.material.opacity = 0.95 * col; foamSoft.position.set(0, 7, -300 + 150 * ease(lt, 19.0, 22.3) + 330);
      return; }
    if (lt < 24.6) { WORLD.study.update(t, 'day', 0.5, 0, 1); put('rabbi', { x: 120, z: -60, y: 0, yaw: PI / 2 - 0.62, headRot: -10, arms: { l: { sz: 0.45, sx: 0.1, el: 1.1 }, r: { sz: 0.08 } } }, face('smile', t, 0.1, { look: lk(0.1, -0.7) })); return; }
    if (lt < 29.0) { sb.update(t, 8, 1.0);
      const u = ease(lt, 24.8, 27.4), col = ease(lt, 27.4, 28.6);
      foamSoft.visible = col > 0.02; foamSoft.material.opacity = 0.95 * col; foamSoft.position.set(0, 7, -330 + 130 * ease(lt, 25.0, 28.6) + 330);
      wallWave.visible = true; wallWave.scale.setScalar(2.1); wallWave.position.set(0, -10, -330 + 130 * ease(lt, 25.0, 28.6)); wallWave.rotation.y = -PI / 2; wallWave.userData.update(t, (0.4 + 0.6 * u) * (1 - 0.85 * col));
      put('gull', { x: -200 + 90 * (lt - 24.6), y: 420, z: -200, yaw: 0.2, fly: true, flap: 1, shadow: false }, { expr: 'happy' }); return; }
    if (lt < 37.38) { sb.update(t, 7, 0.9); foamBig.mesh.visible = true; foamBig.update(t, 1.6);
      const z = foamEdge(-40, t) - 28, z2 = foamEdge(-40, t + 0.15), vel = (z2 - foamEdge(-40, t)) / 0.15;
      put('tipa', { x: -40, y: gy(-40, z) + 4, z, yaw: yawTo(-40, z, 520, z + 300) * 1 - 0.1, tilt: cl(vel * 0.06, -20, 20), squash: 0.05 * Math.sin(t * 7), arms: vel > 0 ? 'up' : 'wave', feet: false, shadow: false }, face('cheering', t, 0.3, { talk: talk(lt, 31.5, 36.5, 7) }));
      put('crab', { x: 360, z: 150, y: gy(360, 150), yaw: -0.3, arms: lt > 33 ? 'up' : 'down', walk: 0 }, face('curious', t, 0.9));
      return; }
    if (lt < 48.36) { makeHands(); sb.update(t, 6, 0.9);
      const cyc = lt < 43.6 ? 0 : 1, a0 = cyc ? 44.0 : 38.2, u = cl((lt - a0) / 3.4, 0, 1);
      const wz = lerp(-1250, -40, 1 - Math.pow(1 - u, 2.2)), hit = ease(lt, a0 + 3.0, a0 + 3.5), size = (0.35 + 0.65 * sm(u / 0.7)) * (1 - 0.9 * hit);
      if (lt > a0 && lt < a0 + 6.2) { wallWave.visible = true; wallWave.scale.set(1.7, 1.7, 0.62); wallWave.position.set(0, -10, wz); wallWave.rotation.y = -PI / 2; wallWave.userData.update(t, Math.max(0.05, size)); }
      foamBig.mesh.visible = true; foamBig.update(t, 0.6 + 1.0 * hit * (1 - ease(lt, a0 + 5.0, a0 + 6.0)));
      const brace = lt > a0 + 1.6 && lt < a0 + 3.2 ? 1 : 0, win = lt > a0 + 3.4 && lt < a0 + 6.0 ? 1 : 0;
      const GX = i => -200 + 100 * i, GZ = 52, CXg = 20, CZg = 520;
      for (let i = 0; i < 5; i++) put('grain' + i, { x: GX(i), z: GZ, y: gy(GX(i), GZ) + 1, yaw: fc(GX(i), GZ, CXg, CZg, 0), scale: 0.55, arms: 'down', squash: brace * 0.05 * Math.sin(t * 30 + i), shadow: true }, face(win ? 'cheering' : brace ? 'worried' : 'curious', t, i * 0.37 + 0.13, { look: lk(0, 0) }));
      hands.forEach((h, i) => { h.visible = i < 4; h.position.set((GX(i) + GX(i + 1)) / 2, gy(GX(i), GZ) + 50, GZ + 34); h.scale.set(0.7, 1.4, 1.4); });
      return; }
    // c6
    sb.update(t, 8, 0.9); foamBig.mesh.visible = true; foamBig.update(t, 1.4);
    const smile = ease(lt, 53.0, 53.8);
    const rx = 94, rz = 136, bxx = 170, bzz = 320, CX = 900, CZ = -120;
    put('rabbi', { x: rx, z: rz, y: gy(rx, rz), yaw: fc(rx, rz, CX, CZ, -0.5), headYaw: 0.1 * Math.sin(lt * 0.7), arms: { l: { sz: 0.5, sx: 0.1, el: 1.1 }, r: { sz: 0.08 + 0.85 * ease(lt, 49.0, 49.8), sx: 0.25, el: 0.5 } } }, face('smile', t, 0.1, { look: lk(0.2, 0), talk: talk(lt, 49.0, 52.0) }));
    put('boy', { x: bxx, z: bzz, y: gy(bxx, bzz), yaw: fc(bxx, bzz, CX, CZ, 0.4), headYaw: -0.1 + 0.15 * smile, arms: { r: { sz: 0.08 }, l: { sz: 0.08 + 0.5 * ease(lt, 55.0, 55.6), sx: 0.1, el: 0.6 } } }, face(lt > 53.0 ? 'proud' : 'smile', t, 0.6, { look: lk(0.4 * smile, 0) }));
    const tx = 60, tz = -10, f = sb.sea.float(tx, tz, 60);
    put('tipa', { x: tx, y: f.y - 46, z: tz, yaw: fc(tx, tz, CX, CZ, -0.3), tilt: f.rz * 40, float: 0.4, arms: 'wave', feet: false, shadow: false }, face('happy', t, 0.3, { look: lk(0.4, 0) }));
  },
  hud(lt, S) { },
};

/* ======================================================================== b4b : summer / winter (48.2 s) */
function drawCalendar(k, t) {  // k seconds since the card appeared
  const x = px(430), y = px(520), w = px(500), h = px(560), pop = sm(cl(k / 0.4, 0, 1)); if (pop <= 0) return;
  HUD.on = true; hx.save(); hx.translate(x, y); hx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop); hx.rotate(-0.06); hx.lineJoin = 'round'; hx.lineCap = 'round';
  hx.fillStyle = 'rgba(0,0,0,0.25)'; roundR(-w / 2 + px(14), -h / 2 + px(18), w, h, px(30)); hx.fill();
  hx.lineWidth = px(10); hx.strokeStyle = '#261c19'; hx.fillStyle = '#c8402e'; roundR(-w / 2, -h / 2, w, h, px(30)); hx.fill(); hx.stroke();
  for (let i = -2; i <= 2; i++) { hx.fillStyle = '#f6efdc'; hx.beginPath(); hx.arc(i * px(80), -h / 2 + px(10), px(14), 0, 7); hx.fill(); hx.stroke(); }
  const pages = 3, flipT = 0.9, k0 = 0.9;
  const idx = cl(Math.floor((k - k0) / flipT) + 1, 0, pages - 1), pf = cl(((k - k0) % flipT) / (flipT * 0.7), 0, 1), flipping = k > k0 && Math.floor((k - k0) / flipT) < pages - 1;
  const page = (i, sy) => { hx.save(); hx.translate(0, -h / 2 + px(70)); hx.scale(1, sy); hx.lineWidth = px(8); hx.strokeStyle = '#261c19'; hx.fillStyle = '#fff8e6'; roundR(-w / 2 + px(22), 0, w - px(44), h - px(100), px(18)); hx.fill(); hx.stroke(); hx.translate(0, (h - px(100)) / 2); drawIcon(i, t); hx.restore(); };
  page(Math.min(pages - 1, idx + (flipping ? 1 : 0)), 1);
  if (flipping) page(idx, Math.max(0.02, 1 - sm(pf)));
  hx.restore();
}
function roundR(x, y, w, h, r) { hx.beginPath(); hx.moveTo(x + r, y); hx.arcTo(x + w, y, x + w, y + h, r); hx.arcTo(x + w, y + h, x, y + h, r); hx.arcTo(x, y + h, x, y, r); hx.arcTo(x, y, x + w, y, r); hx.closePath(); }
function drawIcon(i, t) {
  hx.lineWidth = px(9); hx.strokeStyle = '#261c19'; hx.lineJoin = 'round'; hx.lineCap = 'round';
  if (i === 0) { hx.fillStyle = '#ffd54a'; hx.beginPath(); hx.arc(0, 0, px(78), 0, 7); hx.fill(); hx.stroke(); for (let r = 0; r < 10; r++) { const a = r * Math.PI / 5 + t * 0.5; hx.beginPath(); hx.moveTo(Math.cos(a) * px(104), Math.sin(a) * px(104)); hx.lineTo(Math.cos(a) * px(142), Math.sin(a) * px(142)); hx.stroke(); } }
  else if (i === 1) { hx.fillStyle = '#ffd54a'; hx.beginPath(); hx.arc(-px(40), -px(30), px(60), 0, 7); hx.fill(); hx.stroke(); cloud(px(30), px(30), 1.0, '#ffffff'); }
  else { cloud(0, -px(30), 1.15, '#8c97a3'); hx.strokeStyle = '#3f86c8'; for (let r = -2; r <= 2; r++) { hx.beginPath(); hx.moveTo(r * px(44), px(60)); hx.lineTo(r * px(44) - px(16), px(112)); hx.stroke(); } }
}
function cloud(cx, cy, s, col) { hx.fillStyle = col; hx.beginPath(); hx.arc(cx - px(50) * s, cy + px(10) * s, px(42) * s, Math.PI * 0.5, Math.PI * 1.5); hx.arc(cx - px(8) * s, cy - px(28) * s, px(52) * s, Math.PI, Math.PI * 1.95); hx.arc(cx + px(46) * s, cy + px(6) * s, px(40) * s, Math.PI * 1.5, Math.PI * 0.5); hx.closePath(); hx.fill(); hx.stroke(); }
const promPeople = (t, lt, o) => { o = o || {};
  put('boy', { x: o.bx == null ? 0 : o.bx, z: 380, y: PROM_Y, yaw: PI / 2 - 0.7, headYaw: o.hy || 0, headRot: o.hr || 0, arms: o.arms || { l: { sz: 0.7, sx: 0.25, el: 0.3 }, r: { sz: 0.7, sx: 0.25, el: 0.3 } } }, face(o.expr || 'thinking', t, 0.6, { look: lk(o.lx == null ? -0.5 : o.lx, 0.1), talk: o.talk })); };
SH.b4b = {
  setups: [
    { a: 0, b: 3.2, w: 'beachS', cam: mv([720, 215, 150], [0, 205, 380], [680, 212, 170], [0, 205, 380], 30, 29) },
    { a: 3.2, b: 6.45, w: 'beachS', cam: mv([640, 205, 130], [-40, 205, 380], [600, 205, 150], [-40, 205, 380], 30, 29) },
    { a: 6.45, b: 9.8, w: 'beachS', cam: mv([-40, 330, 565], [-20, 110, 20], [-20, 326, 545], [-20, 110, 20], 30, 29) },
    { a: 9.8, b: 13.3, w: 'beachS', cam: mv([150, 330, 520], [-35, 108, 20], [110, 324, 500], [-35, 108, 20], 32, 30) },
    { a: 13.3, b: 16.4, w: 'beachS', cam: mv([900, 190, 300], [20, 165, 380], [850, 190, 300], [20, 165, 380], 31, 31),
      wipe: { x: lt => 1.06 * ease(lt, 13.7, 16.0) - 0.03, left: { w: 'beachW', prep: lt => { const w = WORLD.beachW; w.update(ST.t, 52, 1.6); w.giants.forEach(g => g.w.visible = false); } }, right: { w: 'beachS', prep: lt => { WORLD.beachS.update(ST.t, 8, 0.8); WORLD.beachS.mirror.userData.setOp(0); } } } },
    { a: 16.4, b: 19.4, w: 'beachW', cam: mv([3600, 260, -500], [0, 300, -1800], [3300, 300, -800], [0, 330, -1950], 26, 24) },
    { a: 19.4, b: 22.52, w: 'beachW', cam: mv([880, 190, -1150], [110, 190, -1750], [820, 200, -1180], [100, 220, -1780], 32, 31) },
    { a: 22.52, b: 26.2, w: 'beachW', cam: mv([2200, 245, -50], [0, 330, -60], [2300, 255, -50], [0, 340, -60], 38, 38) },
    { a: 26.2, b: 30.94, w: 'beachW', cam: mv([2050, 220, 300], [320, 300, -150], [2000, 215, 280], [320, 310, -150], 36, 36) },
    { a: 30.94, b: 34.5, w: 'beachW', cam: mv([820, 150, -300], [-200, 430, -1100], [760, 160, -350], [-100, 450, -1100], 34, 34) },
    { a: 34.5, b: 36.8, w: 'study', cam: mv([440, 190, 270], [335, 150, -118], [400, 188, 240], [335, 151, -118], 26, 24) },
    { a: 36.8, b: 40.16, w: 'beachW', cam: (u, lt) => { const sh = Math.sin(lt * 31) * 4 * sm(u); return { p: [420 + sh, 250 + sh, -650], l: [-300, 470, -1500], fov: 34 }; } },
    { a: 40.16, b: 43.3, w: 'study', cam: mv([520, 200, 330], [30, 185, -130], [470, 198, 300], [30, 185, -130], 32, 31) },
    { a: 43.3, b: 45.7, w: 'study', cam: mv([290, 195, 120], [-30, 192, -150], [260, 193, 90], [-30, 192, -150], 27, 26) },
    { a: 45.7, b: 48.2, w: 'study', cam: mv([360, 205, 380], [30, 190, -140], [620, 215, 640], [30, 188, -140], 30, 33) },
  ],
  acts(lt, S, wp) {
    const t = ST.t;
    const sb = WORLD.beachS, wb = WORLD.beachW;
    if (lt < 13.3) {
      sb.update(t, lt < 6.45 ? 7 : 18, 0.8); sb.mirror.userData.setOp(0); sb.refl.forEach(e => e.material.opacity = 0);
      if (lt < 6.45) {
        const look = ease(lt, 3.3, 3.9), back = ease(lt, 5.6, 6.2);
        promPeople(t, lt, { hy: -0.5 * look * (1 - back) + 0.1 * back, expr: back > 0.5 ? 'worried' : look > 0.5 ? 'surprised' : 'smile', lx: look > 0.5 && back < 0.5 ? 0.8 : -0.5, talk: talk(lt, 0.5, 2.8) });
        put('gull', { x: 300 + 80 * lt, y: 460, z: -200, yaw: 0.2, fly: true, flap: 1, shadow: false }, { expr: 'happy' });
      } else {
        ruler.visible = true; ruler.position.set(-110, 1, 12);
        const bx0 = 30, bz0 = 28;
        const pt = ease(lt, 7.4, 8.0) * (1 - ease(lt, 9.4, 9.8));
        put('boy', { x: bx0, z: bz0, y: gy(bx0, bz0) + 1, yaw: fc(bx0, bz0, -30, 560, 0.25), headYaw: -0.15 * pt, arms: { l: { sz: 0.08 }, r: { sz: 0.35 + 0.5 * pt, sx: 0.15 + 0.85 * pt, el: 0.4, point: pt > 0.5 } } }, face(lt > 11 ? 'smile' : 'thinking', t, 0.6, { look: lk(-0.5 * pt, 0.1), talk: talk(lt, 7.0, 8.6) }));
        const tx = 130, tz = -70, f = sb.sea.float(tx, tz, 60);
        put('tipa', { x: tx, y: f.y - 46, z: tz, yaw: fc(tx, tz, -30, 560, 0.2), tilt: f.rz * 40, float: 0.4, arms: lt > 10 ? 'wave' : 'down', feet: false, shadow: false }, face('happy', t, 0.3, { look: lk(-0.3, 0) }));
      }
    } else if (lt < 16.4) {
      wp = wp || { x: 0 };
      promPeople(t, lt, { expr: 'surprised', lx: 0.8, hr: -4 });
    } else if (lt < 22.52) {
      wb.update(t, 52, 1.6); wb.giants.forEach((g, i) => { g.w.visible = true; g.w.userData.update(t + i * 2.3, 0.75 + 0.25 * Math.sin(t * 0.6 + i)); });
      if (lt >= 19.4) { const tx = 120, tz = -1750, f = wb.sea.float(tx, tz, 90);
        put('tipaB', { x: tx, y: f.y - 40, z: tz, yaw: yawTo(tx, tz, 560, -1500), tilt: f.rz * 40, float: 0.8, arms: 'up', feet: false, shadow: false }, face('surprised', t, 0.3, { look: lk(0.2, -0.3) })); }
    } else if (lt < 30.94) {
      wb.update(t, 52, 1.6); wb.giants.forEach(g => g.w.visible = false);
      wb.hero.visible = true; wb.hero.userData.update(t, 0.4 + 0.6 * ease(lt, 22.6, 25.2)); wb.house.visible = true;
      if (lt >= 26.2) {
        const lookUp = ease(lt, 26.4, 27.2);
        put('boy', { x: 1180, z: 395, y: PROM_Y, yaw: PI / 2 - 0.5, headRot: -14 * lookUp, arms: { l: { sz: 0.08 }, r: { sz: 0.08 } } }, face('surprised', t, 0.6, { look: lk(-0.2, -0.6) }));
        put('rabbi', { x: 1020, z: 400, y: PROM_Y, yaw: PI / 2 - 0.45, headRot: -10 * lookUp, arms: { l: { sz: 0.5, sx: 0.1, el: 1.1 }, r: { sz: 0.08 + 0.8 * ease(lt, 27.5, 28.2), sx: 0.2, el: 0.5 } } }, face('smile', t, 0.1, { look: lk(-0.2, -0.5), talk: talk(lt, 27.4, 30.0) }));
      }
    } else if (lt < 40.16) {
      if (lt < 34.5 || lt >= 36.8) {
        wb.update(t, 52, 1.6); wb.giants.forEach((g, i) => { g.w.visible = true; g.w.userData.update(t + i * 2.3, 0.9); });
        const e1 = ease(lt, 30.94, 34.5), e2 = ease(lt, 36.8, 40.0);
        const gz = lt < 34.5 ? lerp(-2100, -1550, e1) : lerp(-2200, -1250, e2), gxx = lt < 34.5 ? lerp(-1100, -450, e1) : lerp(-800, -250, e2), gyy = lt < 34.5 ? 560 : 520;
        const cx = lt < 34.5 ? 820 : 420, cz = lt < 34.5 ? -300 : -650;
        put('gustD', { x: gxx, y: gyy + 30 * Math.sin(t * 1.3), z: gz, yaw: yawTo(gxx, gz, cx, cz) + 0.35, blow: 1, scale: 3.3 }, { expr: 'neutral', blow: 1, blink: bl(t, 0.2) });
      } else { WORLD.study.update(t, 'storm', 0.95, 1, 1);
        put('rabbi', { x: 120, z: -70, y: 0, yaw: PI / 2 - 0.62, headRot: -10, arms: { l: { sz: 0.45, sx: 0.12, el: 1.15 }, r: { sz: 0.08 } } }, face('smile', t, 0.1, { look: lk(0.1, -0.5) })); }
    } else {
      WORLD.study.update(t, 'storm', 0.95, 1, 0.5);
      const nod = ease(lt, 45.9, 46.3) * (1 - ease(lt, 46.3, 46.8)), wob = Math.sin(lt * 1.3);
      put('boy', { x: -30, z: -150, y: 0, yaw: PI / 2 - 0.5, lean: 4, headYaw: 0.15 + 0.05 * wob, arms: { l: { sz: 0.08 }, r: { sz: 0.08 + 0.35 * ease(lt, 43.4, 44.0), sx: 0.1, el: 0.9 } } }, face(lt > 45 ? 'smile' : lt > 43.3 ? 'surprised' : 'worried', t, 0.6, { look: lk(0.3, 0.1) }));
      put('rabbi', { x: 130, z: -160, y: 0, yaw: PI / 2 - 0.7, headYaw: 0.1, headTilt: 4 * nod, arms: { l: { sz: 0.5, sx: 0.1, el: 1.1 }, r: { sz: 0.08 + 0.9 * ease(lt, 41.4, 42.0) * (1 - ease(lt, 44.6, 45.2)), sx: 0.2, el: 0.5 } } }, face('explaining', t, 0.1, { look: lk(0.3, 0), talk: talk(lt, 40.4, 44.4) }));
    }
  },
  hud(lt, S) {
    if (lt >= 3.2 && lt < 6.45) drawCalendar(lt - 3.2, lt);
    if (lt >= 6.45 && lt < 13.3) { const k = ease(lt, 7.0, 7.5); if (k > 0) { const p = scr(V(-110, 108, 12)); txt('0.5 m', p[0], p[1] - px(24), px(76), { k: 0.5 + 0.5 * k, col: '#ffd54a' });
      const a = scr(V(-96, 66, 20)), b2 = scr(V(8, 66, 28)); hx.save(); hx.globalAlpha = k; hx.lineCap = 'round'; hx.setLineDash([px(16), px(12)]); for (const [c, lw] of [['#261c19', px(9)], ['#ffd54a', px(4.5)]]) { hx.strokeStyle = c; hx.lineWidth = lw; hx.beginPath(); hx.moveTo(a[0], a[1]); hx.lineTo(b2[0], b2[1]); hx.stroke(); } hx.restore(); } }
    if (S.w === 'beachW') rainHud(lt);
    if (lt >= 19.6 && lt < 22.52) { const k = ease(lt, 19.6, 20.2); HUD.on = true; hx.save(); hx.globalAlpha = k; hx.lineCap = 'round'; const bx = W * 0.9, y0 = H * 0.78, y1 = H * (0.78 - 0.5 * k);
      for (const [c, lw] of [['#261c19', px(14)], ['#ffd54a', px(7)]]) { hx.strokeStyle = c; hx.lineWidth = lw; hx.beginPath(); hx.moveTo(bx, y0); hx.lineTo(bx, y1); hx.stroke(); for (const yy of [y0, y1]) { hx.beginPath(); hx.moveTo(bx - px(24), yy); hx.lineTo(bx + px(24), yy); hx.stroke(); } }
      hx.restore(); txt('6 m +', bx - px(150), (y0 + y1) / 2, px(84), { k: 0.5 + 0.5 * k, col: '#ffd54a' }); }
    if (lt >= 22.52 && lt < 30.94) drawSixM(lt, 22.7, 'beachW');
  },
};

/* ======================================================================== b5 : recap (19.1 s) */
SH.b5 = {
  setups: [
    { a: 0, b: 9.5, w: 'sunset', cam: mv([-500, 420, 900], [269, 350, -947], [-440, 414, 850], [285, 348, -925], 32, 32), fg: 'leaves' },
    { a: 9.5, b: 19.1, w: 'sunset', cam: mv([-440, 414, 850], [285, 348, -925], [-380, 405, 790], [305, 346, -900], 32, 31) },
  ],
  acts(lt, S) {
    const t = ST.t, ss = WORLD.sunset; ss.update(t, 9, 0.8);
    const CX = -500, CZ = 900, rx = 700, rz = -420, bx = 600, bz = -503;
    const g1 = ease(lt, 2.6, 3.2) * (1 - ease(lt, 5.0, 5.6)), g2 = ease(lt, 8.0, 8.6) * (1 - ease(lt, 10.2, 10.8)), g3 = ease(lt, 13.0, 13.6) * (1 - ease(lt, 15.4, 16.0));
    const gs = Math.max(g1, g2, g3);
    put('rabbi', { x: rx, z: rz, y: 46, yaw: fc(rx, rz, CX, CZ, 0.3) + 0.2 * Math.sin(lt * 0.4), headYaw: 0.18 * Math.sin(lt * 0.55), headTilt: 2 * Math.sin(lt * 0.9), arms: { l: { sz: 0.5, sx: 0.1, el: 1.1 }, r: { sz: 0.08 + 0.85 * gs, sx: 0.25, el: 0.5 + 0.2 * Math.sin(lt * 3) * gs, curl: 0.3 } } }, face('smile', t, 0.1, { look: lk(-0.3 + 0.2 * Math.sin(lt * 0.5), 0), talk: talk(lt, 2.7, 5.4) || talk(lt, 8.1, 10.4) || talk(lt, 13.1, 15.8) }));
    const nod = Math.max(0, Math.sin(lt * 1.1)) * (ease(lt, 6, 6.5) * (1 - ease(lt, 7.5, 8)) + ease(lt, 11.4, 11.9) * (1 - ease(lt, 12.9, 13.4)));
    put('boy', { x: bx, z: bz, y: 46, yaw: fc(bx, bz, CX, CZ, -0.3), headYaw: 0.12 * Math.sin(lt * 0.7 + 1), headTilt: 5 * nod, arms: { l: { sz: 0.08 }, r: { sz: 0.08 + 0.7 * ease(lt, 16.2, 16.8) * (1 - ease(lt, 18.2, 18.8)), sx: 0.1, el: 0.6 } } }, face(lt > 16.2 && lt < 18.8 ? 'laugh' : 'proud', t, 0.6, { look: lk(0.4 * Math.sin(lt * 0.5), 0) }));
    const tx = 480, tz = -595, f = ss.sea.float(tx, tz, 60);
    put('tipa', { x: tx, y: f.y - 46, z: tz, yaw: fc(tx, tz, CX, CZ, -0.2), tilt: f.rz * 40, float: 0.4, arms: (lt > 7 && lt < 9.2) || (lt > 15 && lt < 17.5) ? 'wave' : 'down', feet: false, shadow: false }, face('happy', t, 0.3, { look: lk(0.3, 0) }));
    // seagull passes high along the top band (never through the centre)
    const gu = lt < 9.5 ? lt / 9.5 : (lt - 9.5) / 9.6;
    put('gull', { x: lerp(lt < 9.5 ? -300 : 1200, lt < 9.5 ? 1200 : -300, gu), y: 760 + 20 * Math.sin(lt * 1.2), z: -700, yaw: lt < 9.5 ? 0.2 : PI + 0.2, fly: true, flap: 1, shadow: false }, { expr: 'happy' });
  },
  hud(lt, S) {
    HUD.on = true; const g = hx.createRadialGradient(W / 2, H * 0.5, px(120), W / 2, H * 0.5, px(1150)); g.addColorStop(0, 'rgba(24,20,40,0.30)'); g.addColorStop(0.45, 'rgba(24,20,40,0.12)'); g.addColorStop(0.8, 'rgba(24,20,40,0.16)'); g.addColorStop(1, 'rgba(24,20,40,0.34)'); hx.fillStyle = g; hx.fillRect(0, 0, W, H);
  },
};
