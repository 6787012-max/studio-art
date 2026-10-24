// ---------- helpers for carrying the pot ----------
// draws the pot in the hands of a figure returned by man(); local pot bottom centre (px,8) in figure units
function holdPot(g, info, s, dir, o) {
  o = o || {}; const px = o.px === undefined ? 66 : o.px, sc = (o.sc || .95) * s;
  const cx = info.hip[0] + dir * s * px, cy = info.hip[1] + s * 8;
  pot(g, cx, cy, sc, { rot: (o.rot || 0), lid: o.lid, level: o.level === undefined ? 1 : o.level, t: o.t });
  return { cx, cy, rim: [cx, cy - 86 * sc], top: [cx, cy - 86 * sc - (o.lid ? o.lid.lift || 0 : 0) * sc] };
}
function handDot(g, p, L, r) { g.fillStyle = L.skin; g.strokeStyle = OL; g.lineWidth = 3.5; g.beginPath(); g.arc(p[0], p[1], r || 13, 0, 6.29); g.fill(); g.stroke(); }
function clockMins(t, m0, span, dur) { const M = m0 + span * ease(t / dur); return [20 + Math.floor(M / 60), Math.floor(M % 60), (M * 60) % 60, M]; }
const pad2 = n => (n < 10 ? '0' : '') + n;
// ---------- shot 5: the night run, pot in both hands, soup sloshing out behind him ----------
function houses(g, camX, gy) {
  const r0 = Math.floor((camX - 900) / 640); for (let k = r0; k < r0 + 4; k++) {
    const x = k * 640, rr_ = rng(k * 17 + 5), h = 380 + Math.floor(rr_() * 120); g.fillStyle = k % 2 ? '#202c5e' : '#2a3870'; g.strokeStyle = OL; g.lineWidth = 4; g.fillRect(x, gy - h, 610, h); g.strokeRect(x, gy - h, 610, h);
    g.fillStyle = '#1a244e'; g.fillRect(x - 6, gy - h - 16, 622, 20);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) { const on = rr_() > .45; g.fillStyle = on ? '#ffd27a' : '#141d42'; g.fillRect(x + 50 + a * 180, gy - h + 60 + b * 140, 100, 88); g.strokeRect(x + 50 + a * 180, gy - h + 60 + b * 140, 100, 88); if (on) glow(g, x + 100 + a * 180, gy - h + 100 + b * 140, 130, '255,200,100', .12); }
    g.fillStyle = '#4a3020'; g.fillRect(x + 290, gy - 150, 80, 150); g.strokeRect(x + 290, gy - 150, 80, 150);
  }
}
function s5(g, lt) {
  const t = Math.max(lt, 0), L = LOOK.hero, GY = 1215, s = 1.5, V = 880, xw = 300 + V * t, camX = xw + 250;
  skyNight(g, 1300); stars(g, t, .8, 600, 0, W); g.fillStyle = '#f4ecd2'; g.beginPath(); g.arc(840, 250, 54, 0, 6.29); g.fill(); glow(g, 840, 250, 260, '190,210,255', .22);
  skyline(g, 3, camX, .12, 1010, 200, 420, 70, 150, '#0d1534', null, t); skyline(g, 8, camX, .35, 1150, 160, 380, 80, 160, '#14204a', '#ffd27a', t);
  g.save(); const sh = shake(t, 2.2, 47); cam(g, camX + sh[0], 900 + sh[1], 1);
  houses(g, camX, GY - 30);
  // pavement + road
  g.fillStyle = '#39456f'; g.fillRect(camX - 800, GY - 30, 1600, 34); g.fillStyle = '#2b3558'; g.fillRect(camX - 800, GY + 4, 1600, 600); g.fillStyle = '#4a577f'; g.fillRect(camX - 800, GY + 4, 1600, 8);
  g.fillStyle = 'rgba(255,255,255,.2)'; const k0 = Math.floor((camX - 800) / 300); for (let k = k0; k < k0 + 7; k++) g.fillRect(k * 300, GY + 150, 150, 12);
  for (let k = Math.floor((camX - 900) / 700) - 1; k < Math.floor((camX + 900) / 700) + 1; k++) lamp(g, k * 700 + 330, GY - 30, 1.5, 1, t);
  // the synagogue shows up at the end
  shulFacade(g, 6300, GY - 30, 900, true, t);
  // soup drops (world coordinates)
  const spawn = i => { const ts = .3 + i * .095, r = rng(i * 13 + 7), a = r(), b = r(), c2 = r(), d = r(); return { t: ts, x: 300 + V * ts + 190 + a * 30, y: GY - 300 - b * 25, vx: 520 - 900 * c2, vy: 380 + 520 * d, r: 6 + 6 * a }; };
  soupDrops(g, t, 60, spawn, GY - 28, { life: 60 });
  // runner
  const ph = t * 2.5; const P = runPose(ph, { amp: 1, lean: .3 }); const slosh = Math.sin(t * 17) * .06;
  P.hands = [[34, -50], [138, -52]]; P.bendA = 1; P.eye = 1.45; P.brow = .8; P.brt = .85; P.mo = .5 + Math.abs(Math.sin(t * 9)) * .3; P.sm = -.2; P.px = 1; P.py = .3; P.blink = 0; P.sway = 1;
  const info = man(g, xw, GY, s, 1, L, P, t);
  holdPot(g, info, s, 1, { px: 70, rot: slosh, lid: lidTalk(t, 1.3), level: .96, t });
  handDot(g, info.hands[1], L, 14);
  sweatDrops(g, t, info.head[0], info.head[1], 1.1, 1, 1, 0);
  g.restore();
  // speed lines
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 6; g.lineCap = 'round'; const r2 = rng(5); for (let i = 0; i < 9; i++) { const y = 200 + r2() * 900, sp = 2600 + r2() * 1500, x = ((r2() * 1400 - t * sp) % 1400 + 1400) % 1400 - 160, len = 140 + r2() * 160; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y); g.stroke(); }
  // clock overlay
  const [hh, mm, ss, M] = clockMins(t, 52, 4, 6); const pc = back((t - .1) / .5), pulse = 1 + Math.sin(t * 8) * .02;
  g.save(); g.translate(880, 215); g.scale(pc * pulse, pc * pulse); clockFace(g, 0, 0, 105, hh, mm, ss); g.restore(); chip(g, pad2(hh) + ':' + pad2(mm), 300, 215, 52, { sc: pc, col: '#ff7a5a' });
}
// ---------- shot 6: the synagogue entrance, he lifts the lid, the pot is half empty ----------
function s6(g, lt) {
  const t = Math.max(lt, 0), L = LOOK.hero, GY = 1215, s = 1.5, zk = ease(at(t, 1.4, 2.2)) * (1 - ease(at(t, 3.0, 3.6))), panL = ease(at(t, 3.0, 3.8)), dirv = t < 3.0 ? 1 : -1;
  skyNight(g, 1300); stars(g, t, .8, 500, 0, W);
  g.save(); cam(g, lerp(lerp(540, 520, zk), 120, panL), lerp(900, 980, zk), 1 + zk * .38);
  shulFacade(g, 660, GY, 980, true, t);
  g.fillStyle = '#39456f'; g.fillRect(-300, GY + 32, 1700, 900); g.fillStyle = '#4a577f'; g.fillRect(-300, GY + 32, 1700, 8);
  lamp(g, 80, GY, 1.5, 1, t); lamp(g, 1010, GY, 1.5, 1, t); lamp(g, -620, GY, 1.5, 1, t);
  splats(g, -1800, 340, GY + 6, 21, 70, 1, 1.7);
  clockFace(g, 660, 330, 62, 9, 52, 10 + t); 
  // arrival + skid
  const arr = ease(at(t, 0, 1.05)), x = lerp(-180, 360, arr) + 70 * at(t, 1.05, 1.5) * (1 - at(t, 1.5, 1.9)) * 0 + 0;
  const brake = at(t, .78, 1.3); let P;
  const Pr = runPose(t * 2.5 * (1 - brake * .8), { amp: 1 - brake * .7, lean: .3 });
  const Ps = Object.assign({}, POSE0, { th: [.5, .4], sh: [-.2, -.1], lean: -.15, side: 1, ua: [.2, .4], la: [.5, .5], spread: 0 });
  const stand = Object.assign({}, POSE0, { th: [.02, .08], sh: [-.02, -.06], lean: .02, side: 1, spread: 0 });
  P = mixPose(Pr, Ps, ease(brake)); P = mixPose(P, stand, ease(at(t, 1.3, 1.7)));
  const lidK = ease(at(t, 1.5, 2.0)) * (1 - ease(at(t, 2.6, 3.0))); const lift = 80 * lidK;
  const dis = at(t, 1.8, 2.3), droop = at(t, 2.2, 3.0);
  P.px = 1; P.py = lerp(.0, .9, at(t, 2.6, 3.3)); P.eye = lerp(lerp(1.35, 1.0, at(t, 1.5, 2.0)), lerp(1.6, .85, droop), dis); P.brow = lerp(.6, .5 - droop * 1.2, dis); P.brt = lerp(0, 1, dis) * 1; P.mo = lerp(.4, 0, at(t, 1.2, 1.8)) + .5 * at(t, 2.6, 2.8) * (1 - at(t, 2.8, 3.2)); P.sm = lerp(.4, -1, droop) * (t > 1.3 ? 1 : 0) + (t <= 1.3 ? -.2 : 0);
  P.nod = 16 * droop + 12 * at(t, 4.5, 5.2); P.lean = P.lean + .14 * at(t, 2.0, 2.6) * (1 - at(t, 2.9, 3.4)) - .05 * droop; P.shadow = true; P.blink = 0;
  // hands: left under the pot, right on the lid
  const k1 = at(t, 1.3, 1.7);
  P.hands = [[lerp(40, 44, k1), lerp(-40, -26, k1)], [lerp(138, 66 + 18 * lidK, k1), lerp(-52, -150 - lift * .55 + 70 * 0, k1) + lerp(0, 0, 0)]];
  P.hands[1] = [lerp(138, 104, k1) - lerp(0, 8, lidK), lerp(-52, -58 - 86 * 0, k1) - lidK * 120];
  if (t < 1.3) P.hands = [[34, -50], [138, -52]];
  const info = man(g, x, GY, s, dirv, L, P, t);
  const pc = holdPot(g, info, s, dirv, { px: 70, lid: { lift: lift + (t < 1.5 ? lidTalk(t, 1.2).lift : 0), dx: 14 * lidK, rot: .5 * lidK }, level: lerp(.96, .35, ease(at(t, 1.8, 1.95))), t });
  handDot(g, info.hands[1], L, 14); if (t > 1.3) handDot(g, info.hands[0], L, 14);
  dust(g, 330, GY + 6, 1.0, t, 1.6); dust(g, 300, GY + 6, 1.15, t, 1.2);
  if (lidK > .1 && t < 3.0) steam(g, pc.cx, pc.cy - 150, t * 2, 4, 1.4, lidK * .8);
  // drips from the pot bottom + tear
  const drip = i => ({ t: 3.6 + i * .55, x: pc.cx - 8 + (i % 3) * 8, y: pc.cy + 4, vx: 0, vy: -20, r: 7 });
  soupDrops(g, t, 6, drip, GY + 40, { life: 2.5 });
  const tr = at(t, 3.3, 3.7); if (tr > 0) { const ty = info.head[1] + 4 + ((t - 3.3) * 120) % 70, tx = info.head[0] + 24 * s * dirv; g.save(); g.globalAlpha = tr * (1 - (((t - 3.3) * 120) % 70) / 90); g.fillStyle = '#9fd8ff'; g.strokeStyle = '#3a78b0'; g.lineWidth = 3; g.translate(tx, ty); g.scale(1.3, 1.3); g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(10, 0, 0, 9); g.quadraticCurveTo(-10, 0, 0, -14); g.fill(); g.stroke(); g.restore(); }
  g.restore();
  // inset: the pot cross-section, half empty
  const ik = back((t - 1.95) / .45) * (1 - ease(at(t, 3.3, 3.7)));
  if (ik > 0.01) {
    g.save(); g.translate(790, 330); g.scale(ik, ik); g.fillStyle = '#e9edf6'; g.strokeStyle = '#fff'; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 215, 0, 6.29); g.fill(); g.stroke(); g.strokeStyle = GOLD; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 228, 0, 6.29); g.stroke();
    g.save(); g.beginPath(); g.arc(0, 0, 203, 0, 6.29); g.clip(); g.fillStyle = '#cfd8ea'; g.fillRect(-220, -220, 440, 440);
    g.fillStyle = '#9aa7c2'; rr(g, -120, -120, 240, 230, 16); g.fill(); g.strokeStyle = OL; g.lineWidth = 7; g.stroke(); g.fillStyle = '#f6f8fc'; g.fillRect(-106, -112, 212, 216);
    const lv = .5, wy = lerp(-104, 100, 1 - lv); g.fillStyle = '#f4b73c'; g.beginPath(); g.moveTo(-106, wy); for (let i = 0; i <= 12; i++) g.lineTo(-106 + i * 17.7, wy + Math.sin(i * 1.4 + t * 5) * 5); g.lineTo(106, 104); g.lineTo(-106, 104); g.closePath(); g.fill();
    g.fillStyle = '#e07a1c'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-60 + i * 40, wy + 32 + (i % 2) * 24, 9, 0, 6.29); g.fill(); }
    g.setLineDash([14, 10]); g.strokeStyle = '#e63a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(-132, -104); g.lineTo(132, -104); g.stroke(); g.setLineDash([]);
    g.strokeStyle = '#e63a2a'; g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round'; const ay = Math.sin(t * 6) * 6; g.beginPath(); g.moveTo(0, -86 + ay); g.lineTo(0, wy - 18 + ay); g.moveTo(-26, wy - 44 + ay); g.lineTo(0, wy - 16 + ay); g.lineTo(26, wy - 44 + ay); g.stroke();
    g.restore(); g.restore();
  }
}
// ---------- shot 7: inside the synagogue, 21:55, everyone closes their gemaras ----------
function hallBack(g, t) {
  const wg = g.createLinearGradient(0, 0, 0, 840); wg.addColorStop(0, '#8d6340'); wg.addColorStop(1, '#6c4a30'); g.fillStyle = wg; g.fillRect(-100, -100, W + 200, 940);
  g.fillStyle = '#4a3022'; g.fillRect(-100, 600, W + 200, 240); g.fillStyle = '#5c3d2a'; for (let i = 0; i < 8; i++) g.fillRect(40 + i * 140, 620, 100, 200);
  const fg = g.createLinearGradient(0, 840, 0, 1920); fg.addColorStop(0, '#8a6038'); fg.addColorStop(1, '#4a3020'); g.fillStyle = fg; g.fillRect(-100, 840, W + 200, 1200); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; for (let i = -6; i < 14; i++) { g.beginPath(); g.moveTo(540 + (i - 4) * 50, 840); g.lineTo(540 + (i - 4) * 220, 1920); g.stroke(); }
  // arched windows
  for (const x0 of [80, 830]) { archPath(g, x0, x0 + 170, 120, 430); g.fillStyle = '#16264f'; g.fill(); g.strokeStyle = OL; g.lineWidth = 6; g.stroke(); glow(g, x0 + 85, 260, 190, '255,205,120', .16); g.strokeStyle = '#d9b87a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x0 + 85, 205); g.lineTo(x0 + 85, 430); g.moveTo(x0, 300); g.lineTo(x0 + 170, 300); g.stroke(); }
  // ark
  g.fillStyle = '#4a2f1c'; g.strokeStyle = OL; g.lineWidth = 6; rr(g, 330, 260, 420, 580, 14); g.fill(); g.stroke(); g.fillStyle = '#23397a'; rr(g, 370, 310, 340, 520, 8); g.fill(); g.stroke();
  g.fillStyle = GOLD; g.fillRect(540 - 3, 310, 6, 520); g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 8; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(400 + i * 65, 320); g.lineTo(400 + i * 65, 820); g.stroke(); }
  g.fillStyle = GOLD_LT; g.strokeStyle = OL; g.lineWidth = 4; g.beginPath(); g.moveTo(470, 300); g.lineTo(480, 262); g.lineTo(510, 285); g.lineTo(540, 252); g.lineTo(570, 285); g.lineTo(600, 262); g.lineTo(610, 300); g.closePath(); g.fill(); g.stroke();
  for (const dx of [-18, 18]) { g.fillStyle = '#efe3c3'; g.beginPath(); g.moveTo(540 + dx - 18, 460); g.lineTo(540 + dx - 18, 400); g.arc(540 + dx, 400, 18, Math.PI, 0); g.lineTo(540 + dx + 18, 460); g.closePath(); g.fill(); g.stroke(); }
  // banner with the logo
  g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.fillStyle = CREAM; rr(g, 240, 60, 600, 190, 20); g.fill(); g.restore(); g.strokeStyle = GOLD; g.lineWidth = 5; rr(g, 240, 60, 600, 190, 20); g.stroke(); g.strokeStyle = GOLD_LT; g.lineWidth = 2; rr(g, 252, 72, 576, 166, 14); g.stroke();
  logoFit(g, IMG.horiz, 540, 156, 500, 150);
  g.strokeStyle = '#5a3d2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(300, 60); g.lineTo(300, 40); g.moveTo(780, 60); g.lineTo(780, 40); g.stroke();
}
function tableFront(g, x0, x1, y, h) { g.fillStyle = '#a06e3c'; g.strokeStyle = OL; g.lineWidth = 5; rr(g, x0, y, x1 - x0, 34, 10); g.fill(); g.stroke(); g.fillStyle = '#7a5028'; g.fillRect(x0 + 12, y + 34, x1 - x0 - 24, h); g.strokeRect(x0 + 12, y + 34, x1 - x0 - 24, h); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x0 + 6, y + 5, x1 - x0 - 12, 6); }
function s7(g, lt) {
  const t = Math.max(lt, 0), L = LOOK.hero; const zk = ease(at(t, 4.4, 6));
  g.save(); cam(g, lerp(540, 800, zk), lerp(900, 1010, zk), 1 + zk * .38);
  hallBack(g, t); { const pk = 1 + .18 * Math.sin(at(t, 1.5, 2.3) * Math.PI); g.save(); g.translate(925, 590); g.scale(pk, pk); clockFace(g, 0, -70, 88, 9, 55, 20 + t * 4); chip(g, '21:55', 0, 65, 34, { col: '#ff7a5a' }); g.restore(); }
  const men = [{ x: 250, y: 905, s: .66, L: LOOK.e, tc: 1.25 }, { x: 470, y: 905, s: .66, L: LOOK.f, tc: 1.5 }, { x: 690, y: 905, s: .66, L: LOOK.b, tc: 1.35 },
    { x: 140, y: 1100, s: .95, L: LOOK.a, tc: 1.0 }, { x: 340, y: 1100, s: .95, L: LOOK.b, tc: 1.4 }, { x: 540, y: 1100, s: .95, L: LOOK.g, tc: 1.15 }, { x: 740, y: 1100, s: .95, L: LOOK.d, tc: 1.6 }];
  men.forEach(m => { m.tc = 2.5 + Math.abs(m.x - 540) / 600 * 1.1 + (m.y < 1000 ? .3 : 0); });
  const row = (idxs, ty, x0, x1, tableH) => { for (const i of idxs) { const m = men[i], s = m.s, o = 1 - ease(at(t, m.tc, m.tc + .18)), after = ease(at(t, m.tc + .25, m.tc + .7)), glance = at(t, 4.6 + i * .06, 5.0 + i * .06);
      const P = Object.assign({}, POSE0, { torsoOnly: true, side: 0, shadow: false });
      P.lean = -.1 * after + Math.sin(t * 2 + i) * .01; P.eye = lerp(.9, 1.15, after) * (1 - blinkAt(t, i) * .9); P.sm = lerp(.15, .7, after) * (1 - glance * 1.1) + (glance * -.3); P.brt = glance * .5; P.px = lerp(-.3 + Math.sin(t + i) * .3, 0, after) + glance * 1; P.py = lerp(.8, 0, after); P.mo = 0; P.tilt = .06 * Math.sin(t * 1.3 + i);
      const arms = after; P.hands = [[lerp(-62, -34, arms), lerp(-28 - 4 * o, -150, arms)], [lerp(62, 34, arms), lerp(-28 - 4 * o, -150, arms)]]; P.spread = 0;
      man(g, m.x, ty + 24 * s, s, 1, m.L, P, t); } };
  row([0, 1, 2], 905, 0, 0, 0); tableFront(g, 90, 880, 935, 70);
  for (const i of [0, 1, 2]) { const m = men[i], o = 1 - ease(at(t, m.tc, m.tc + .18)); bookOpen(g, m.x, 960, 150 * .75, o, '#5b2f1c'); const bt = (t - m.tc - .15) / .5; if (bt > 0 && bt < 1) { g.strokeStyle = `rgba(255,255,255,${1 - bt})`; g.lineWidth = 5; g.lineCap = 'round'; for (let k = 0; k < 6; k++) { const a = k * 1.05 + .3; g.beginPath(); g.moveTo(m.x + Math.cos(a) * (30 + bt * 40), 940 + Math.sin(a) * (20 + bt * 25)); g.lineTo(m.x + Math.cos(a) * (46 + bt * 60), 940 + Math.sin(a) * (30 + bt * 38)); g.stroke(); } } }
  row([3, 4, 5, 6], 1100, 0, 0, 0); tableFront(g, 40, 880, 1150, 120);
  for (const i of [3, 4, 5, 6]) { const m = men[i], o = 1 - ease(at(t, m.tc, m.tc + .18)); bookOpen(g, m.x, 1190, 150, o, '#5b2f1c'); const bt = (t - m.tc - .15) / .5; if (bt > 0 && bt < 1) { g.strokeStyle = `rgba(255,255,255,${1 - bt})`; g.lineWidth = 6; g.lineCap = 'round'; for (let k = 0; k < 6; k++) { const a = k * 1.05 + .3; g.beginPath(); g.moveTo(m.x + Math.cos(a) * (40 + bt * 50), 1160 + Math.sin(a) * (24 + bt * 30)); g.lineTo(m.x + Math.cos(a) * (60 + bt * 80), 1160 + Math.sin(a) * (36 + bt * 46)); g.stroke(); } } }
  // doorway + hero
  g.fillStyle = '#0c1530'; g.strokeStyle = OL; g.lineWidth = 6; g.fillRect(900, 330, 220, 1000); g.strokeRect(900, 330, 220, 1000); glow(g, 1000, 1100, 300, '255,200,120', .1 + .15 * at(t, 0, .7));
  { const dw = 220 * (1 - ease(at(t, 0, .7)) * .85); g.fillStyle = '#7a5236'; g.fillRect(1120 - dw, 330, dw, 1000); g.strokeRect(1120 - dw, 330, dw, 1000); g.fillStyle = GOLD_LT; g.beginPath(); g.arc(1120 - dw + 20, 860, 11, 0, 6.29); g.fill(); }
  const heroX = 960, GY = 1310, sc = 1.4;
  const P = Object.assign({}, POSE0, { th: [.03, .08], sh: [-.02, -.06], lean: .04, side: 1, spread: 0, shadow: true, sway: 0 });
  const wf = at(t, 4.5, 5.2), sad = at(t, 5.0, 5.9), hv = back((t - 4.5) / .4);
  P.eye = lerp(1.25, 1.1, wf) * (1 - sad * .2); P.sm = lerp(.9, .1, wf) * (1 - sad) - sad; P.brow = 0; P.brt = lerp(0, .5, wf) + sad * .5; P.brow = lerp(.4, 0, wf); P.mo = at(t, 3.0, 3.2) * (1 - at(t, 3.2, 3.6)) * .5; P.px = -1; P.py = lerp(0, .5, sad); P.nod = 14 * sad; P.lean += .06 * sad;
  P.blink = 0; P.hands = [[44, -26], [104, -58]]; P.bendA = 1;
  if (t > 4.5) { const info = man(g, heroX + 40 * (1 - eout(at(t, 4.5, 5.0))), GY, sc * clamp(hv), -1, L, P, t);
  const pp = holdPot(g, info, sc * clamp(hv), -1, { px: 70, level: .45, t, lid: lidTalk(t, 1) }); handDot(g, info.hands[1], L, 13);
  steam(g, pp.cx, pp.cy - 120 * sc, t, 2, 1.1, 1 - sad * .8);
  sweatDrops(g, t, info.head[0], info.head[1], 1, -1, wf * (1 - at(t, 5.4, 5.9)), 0); }
  g.restore();
}
// ---------- shot 8: close up, shoulders drop, a friend pats him, small rain cloud ----------
function cloud(g, x, y, sc, t) { g.save(); g.translate(x, y); g.scale(sc, sc); g.fillStyle = '#7889aa'; g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.arc(-70, 10, 52, Math.PI * .5, Math.PI * 1.5); g.arc(-26, -34, 62, Math.PI, Math.PI * 1.9); g.arc(46, -26, 52, Math.PI * 1.2, Math.PI * 2.1); g.arc(86, 14, 44, Math.PI * 1.5, Math.PI * .5); g.closePath(); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-30, -34, 36, 16, -.2, 0, 6.29); g.fill(); g.restore(); }
function s8(g, lt) {
  const t = Math.max(lt, 0), L = LOOK.hero, HY = 1456, hx = 480, S = 4.0;
  const wg = g.createLinearGradient(0, 0, 0, 1500); wg.addColorStop(0, '#6a4630'); wg.addColorStop(1, '#3a281e'); g.fillStyle = wg; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i < 5; i++) { g.fillRect(40 + i * 220, 140, 160, 900); } const rb = rng(3); for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) { g.fillStyle = ['#7a2a2a', '#1f3f7a', '#2a6a4a', '#8a6a2a'][Math.floor(rb() * 4)]; g.globalAlpha = .45; g.fillRect(60 + i * 220, 200 + j * 220, 120, 150); } g.globalAlpha = 1;
  // gemara slams shut in the background
  const bo = 1 - ease(at(t, .22, .42)); g.save(); g.translate(250, 880); g.scale(2.4, 2.4); bookOpen(g, 0, 0, 150, bo, '#5b2f1c'); g.restore();
  const cb = (t - .4) / .6; if (cb > 0 && cb < 1) { g.strokeStyle = `rgba(255,255,255,${1 - cb})`; g.lineWidth = 12; g.lineCap = 'round'; for (let k = 0; k < 10; k++) { const a = k * .63; g.beginPath(); g.moveTo(250 + Math.cos(a) * (130 + cb * 80), 820 + Math.sin(a) * (80 + cb * 50)); g.lineTo(250 + Math.cos(a) * (200 + cb * 150), 820 + Math.sin(a) * (120 + cb * 90)); g.stroke(); } }
  const sad = ease(at(t, .25, 1.5)), react = Math.sin(at(t, .22, .6) * Math.PI);
  // hero
  const P = Object.assign({}, POSE0, { torsoOnly: true, side: 0, shadow: false }); const wob = Math.sin(t * 1.6) * .008;
  P.eye = lerp(1.1, .6, sad) + react * .4; P.px = lerp(-1, 0, at(t, .6, 1.0)) * (t < 2.6 ? 1 : 0) + (t >= 2.6 ? Math.min(1, (t - 2.6) * 2) * 1 * (t < 4.6 ? 1 : 0) : 0); P.py = .9 * sad * (t < 2.6 ? 1 : .2); P.brow = -.3 * sad; P.brt = .9 * sad; P.sm = lerp(.5, -1, sad); if (t > 3.0 && t < 4.7) P.sm = lerp(-1, .15, at(t, 3.0, 3.6));
  P.mo = react * .5 + (Math.sin(at(t, 3.4, 4.0) * Math.PI) * .4) ; P.nod = 26 * sad; P.tilt = .1 * sad + wob; P.lean = .0 + .0; P.blink = blinkAt(t, 3) * (1 - sad * .7); P.hip = [0, 0 + 18 * sad];
  P.hands = [[-78, -34], [78, -34]];
  const info = man(g, hx, HY, S, 1, L, P, t);
  // pot in his hands
  const potX = hx, potB = HY + 30 * S + 18 * sad * S * .0 + 18 * sad; pot(g, potX, potB, S * .95, { lid: lidTalk(t, 1.4), level: .5, t }); handDot(g, info.hands[0], L, 40); handDot(g, info.hands[1], L, 40);
  steam(g, potX, potB - 86 * S * .95 - 6, t, 2, 3, .22);
  // sigh puff
  const sg = at(t, 3.4, 4.4); if (sg > 0 && sg < 1) { g.save(); g.globalAlpha = Math.sin(sg * Math.PI) * .6; g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(info.head[0] + 40 + sg * 150 + i * 28, info.head[1] + 120 + sg * 40 + i * 6, 22 + sg * 30 - i * 3, 0, 6.29); g.fill(); } g.restore(); }
  // friend patting
  const F = Object.assign({}, POSE0, { torsoOnly: true, side: 0, shadow: false }); const FY = HY + 30, fx = 975, FS = 3.6;
  const pat = at(t, 1.5, 3.2), pk = pat > 0 && pat < 1 ? Math.abs(Math.sin(pat * Math.PI * 3)) : 0, comeIn = ease(at(t, 1.0, 1.5));
  const tx = hx + 34 * S + 14, ty = HY - 122 * S - 30 + 6;
  const hand = [lerp(1500, tx + 30, comeIn), lerp(ty - 90, ty - 80 + pk * 70, comeIn)];
  F.hands = [[0, 0], [(fx - hand[0]) / FS, (hand[1] - FY) / FS]]; F.hands[0] = [-34, -30];
  F.eye = 1; F.sm = .25; F.brt = .6; F.px = -1; F.py = .2; F.tilt = -.06; F.blink = blinkAt(t, 5); F.lean = -.04;
  man(g, fx + 40 * (1 - comeIn) * 0 + 120 * (1 - comeIn), FY, FS, -1, LOOK.g, F, t);
  // rain cloud + rain on his head
  const ck = back((t - 1.6) / .5), cy = info.head[1] - 250 + Math.sin(t * 2) * 8;
  const mv = ease(at(t, 4.1, 4.8)), cxx = lerp(info.head[0] - 10, hx - 160, mv), cyy = lerp(cy, 1060, mv);
  if (ck > 0) { cloud(g, cxx, cyy, lerp(1.5, 1.1, mv) * ck, t); const dp = at(t, 4.85, 5.2); if (dp > 0 && dp < 1) { g.fillStyle = '#7fb4ff'; g.strokeStyle = '#3a78b0'; g.lineWidth = 3; g.beginPath(); g.ellipse(cxx + 10, lerp(cyy + 70, potB - 86 * S * .95, dp * dp), 12, 18, 0, 0, 6.29); g.fill(); g.stroke(); } const rp = at(t, 5.2, 5.7); if (rp > 0 && rp < 1) { g.strokeStyle = `rgba(255,255,255,${1 - rp})`; g.lineWidth = 6; g.beginPath(); g.ellipse(cxx + 10, potB - 86 * S * .95 + 4, 20 + rp * 90, 8 + rp * 18, 0, 0, 6.29); g.stroke(); } g.strokeStyle = '#7fb4ff'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < 9 && t < 4.4; i++) { const ph = ((t * 1.7 + i * .37) % 1), xx = info.head[0] - 170 + i * 42, y0 = cy + 90, y1 = info.head[1] - 150; const yy = lerp(y0, y1 + 40, ph); g.globalAlpha = Math.sin(ph * Math.PI) * ck; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx - 8, yy + 40); g.stroke(); } g.globalAlpha = 1; }
}
