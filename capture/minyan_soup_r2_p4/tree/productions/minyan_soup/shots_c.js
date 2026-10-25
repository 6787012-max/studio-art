// ---------- car ----------
function carBody(g, x, y, sc, o) {
  o = o || {}; const t = o.t || 0, L = LOOK.hero; g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(sc * (o.sx || 1), sc * (o.sy || 1));
  g.strokeStyle = OL; g.lineWidth = 6; g.lineJoin = 'round';
  // exhaust
  // body
  g.fillStyle = '#244fae'; g.beginPath(); g.moveTo(-262, -66); g.quadraticCurveTo(-270, -150, -226, -152); g.lineTo(-130, -152); g.lineTo(-76, -250); g.lineTo(104, -250); g.lineTo(176, -152); g.lineTo(236, -148); g.quadraticCurveTo(272, -130, 266, -66); g.closePath(); g.fill(); g.stroke();
  // window glass + interior
  g.save(); g.beginPath(); g.moveTo(-106, -154); g.lineTo(-62, -234); g.lineTo(92, -234); g.lineTo(148, -154); g.closePath(); g.clip();
  g.fillStyle = '#26304f'; g.fillRect(-120, -250, 280, 120); g.fillStyle = '#c4def5'; g.globalAlpha = .12; g.fillRect(-120, -250, 280, 120); g.globalAlpha = 1;
  // pot belted into the passenger seat
  const lidk = o.lidK === undefined ? 1 : o.lidK; if (!o.noPot) { pot(g, 92, -100, .62, { lid: o.lid || lidTalk(t, 1.5 * lidk), level: o.level === undefined ? 1 : o.level, t }); g.strokeStyle = '#1b2036'; g.lineWidth = 12; g.beginPath(); g.moveTo(66, -246); g.lineTo(116, -96); g.stroke(); g.strokeStyle = '#6d768f'; g.lineWidth = 4; g.beginPath(); g.moveTo(66, -246); g.lineTo(116, -96); g.stroke(); }
  // driver
  const P = Object.assign({}, POSE0, { torsoOnly: true, side: .8, shadow: false, lean: .1 }, o.P || {});
  const h = man(g, -26, -70, .8, 1, L, P, t);
  // steering wheel
  g.strokeStyle = OL; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(34, -176); g.lineTo(52, -128); g.stroke(); g.strokeStyle = '#3a3f5a'; g.lineWidth = 8; g.beginPath(); g.moveTo(34, -176); g.lineTo(52, -128); g.stroke();
  for (const hd of (P.hands ? h.hands : [])) { g.fillStyle = L.skin; g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.arc(hd[0], hd[1], 9, 0, 6.29); g.fill(); g.stroke(); }
  g.restore();
  g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.moveTo(-106, -154); g.lineTo(-62, -234); g.lineTo(92, -234); g.lineTo(148, -154); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(-8, -154); g.lineTo(-8, -234); g.stroke();
  g.fillStyle = '#ffe9a8'; g.beginPath(); g.ellipse(258, -112, 12, 18, 0, 0, 6.29); g.fill(); g.stroke(); glow(g, 290, -112, 160, '255,235,160', .5);
  g.fillStyle = '#d33'; g.fillRect(-268, -120, 12, 28); g.fillStyle = '#8fa6d8'; g.fillRect(-264, -76, 524, 14);
  for (const wx of [-150, 150]) { g.save(); g.translate(wx, -52); g.fillStyle = '#242838'; g.beginPath(); g.arc(0, 0, 54, 0, 6.29); g.fill(); g.stroke(); g.rotate(o.wheel || 0); g.fillStyle = '#c9cfdd'; g.beginPath(); g.arc(0, 0, 28, 0, 6.29); g.fill(); g.stroke(); g.strokeStyle = '#5a6180'; g.lineWidth = 5; for (let k = 0; k < 5; k++) { g.rotate(1.2566); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -24); g.stroke(); } g.restore(); }
  g.restore();
}
function nightRoad(g, camX, GY, t, speed) {
  skyNight(g, 1300); stars(g, t, .8, 600, 0, W); g.fillStyle = '#f4ecd2'; g.beginPath(); g.arc(840, 250, 50, 0, 6.29); g.fill(); glow(g, 840, 250, 240, '190,210,255', .2);
  skyline(g, 3, camX, .12, 1000, 200, 420, 70, 150, '#0d1534', null, t); skyline(g, 8, camX, .35, 1150, 160, 380, 80, 160, '#14204a', '#ffd27a', t);
  g.fillStyle = '#2b3558'; g.fillRect(0, GY - 6, W, 800); g.fillStyle = '#4a577f'; g.fillRect(0, GY - 6, W, 8);
  g.fillStyle = 'rgba(255,255,255,.28)'; const k0 = Math.floor(camX / 300); for (let k = k0 - 3; k < k0 + 6; k++) g.fillRect(k * 300 - camX + 540, GY + 120, 160, 12);
  g.save(); g.translate(540 - camX, 0); for (let k = Math.floor((camX - 700) / 700); k < Math.floor((camX + 700) / 700) + 1; k++) lamp(g, k * 700 + 330, GY - 4, 1.5, 1, t); g.restore();
}
function speedLines(g, t, n, sp, a) { g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 7; g.lineCap = 'round'; const r2 = rng(5); for (let i = 0; i < n; i++) { const y = 150 + r2() * 1050, v = sp * (.7 + r2() * .8), x = ((r2() * 1400 - t * v) % 1400 + 1400) % 1400 - 200, len = 160 + r2() * 220; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y); g.stroke(); } }

function carInterior(g, t, k) {
  if (k <= 0) return; g.save(); g.globalAlpha = k;
  const L = LOOK.hero; g.fillStyle = '#0d1530'; g.fillRect(0, 420, W, 940);
  // windshield / side window with the night racing past
  g.save(); g.beginPath(); g.moveTo(420, 460); g.lineTo(1080, 460); g.lineTo(1080, 960); g.lineTo(520, 960); g.closePath(); g.clip(); const sg = g.createLinearGradient(0, 460, 0, 960); sg.addColorStop(0, '#0a1230'); sg.addColorStop(1, '#25397a'); g.fillStyle = sg; g.fillRect(400, 440, 700, 540);
  for (let i = 0; i < 6; i++) { const x = ((i * 190 - t * 1800) % 1140 + 1140) % 1140 - 40; g.fillStyle = 'rgba(255,214,130,.9)'; g.fillRect(x, 560 + (i % 3) * 60, 90, 8); glow(g, x + 20, 564 + (i % 3) * 60, 90, '255,210,120', .5); }
  g.fillStyle = 'rgba(255,255,255,.2)'; for (let i = 0; i < 8; i++) { const x = ((i * 130 - t * 2600) % 1200 + 1200) % 1200 - 60; g.fillRect(x, 870 + (i % 2) * 24, 150, 6); } g.restore();
  g.strokeStyle = OL; g.lineWidth = 10; g.beginPath(); g.moveTo(420, 460); g.lineTo(520, 960); g.stroke();
  // headrest + Dovi, large
  g.fillStyle = '#16275c'; rr(g, 70, 560, 360, 800, 60); g.fill(); g.stroke();
  const grip = at(t, 2.0, 2.4), sh = shake(t, 3 * grip, 55);
  const P = { torsoOnly: true, side: .55, shadow: false, spread: 0, lean: .12 + .05 * grip, eye: 1.55, brt: -.7 * grip + .2, brow: -.4 * grip, mo: .25 + .1 * Math.sin(t * 20) * grip, sm: -.4, px: 1, py: 0, tilt: .04 * Math.sin(t * 30) * grip, blink: 0, hands: [[72, -88], [108, -64]] };
  const info = man(g, 250 + sh[0], 1340, 3.5, 1, L, P, t);
  // steering wheel
  g.save(); g.translate(610 + sh[0], 1060 + sh[1]); g.rotate(Math.sin(t * 5) * .06 * grip); g.strokeStyle = OL; g.lineWidth = 50; g.beginPath(); g.ellipse(0, 0, 150, 190, .3, 0, 6.29); g.stroke(); g.strokeStyle = '#3a3f5a'; g.lineWidth = 34; g.beginPath(); g.ellipse(0, 0, 150, 190, .3, 0, 6.29); g.stroke(); g.restore();
  for (const hd of info.hands) { g.fillStyle = '#fff3e6'; g.strokeStyle = OL; g.lineWidth = 5; g.beginPath(); g.arc(hd[0], hd[1], 30, 0, 6.29); g.fill(); g.stroke(); }
  if (grip > .4) { g.strokeStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = -2.4 + i * .5 + Math.sin(t * 40) * .1, hx = info.hands[0][0], hy = info.hands[0][1]; g.beginPath(); g.moveTo(hx + Math.cos(a) * 44, hy + Math.sin(a) * 44); g.lineTo(hx + Math.cos(a) * 74, hy + Math.sin(a) * 74); g.stroke(); } }
  sweatDrops(g, t, info.head[0], info.head[1], 2.2, 1, grip, 0);
  // the pot belted into the passenger seat, large
  g.fillStyle = '#16275c'; rr(g, 790, 930, 330, 500, 40); g.fill(); g.stroke();
  pot(g, 930, 1290, 2.7, { lid: lidTalk(t, 2.2 + .5 * Math.sin(t * 3)), level: 1, t });
  g.strokeStyle = '#0d1226'; g.lineWidth = 46; g.lineCap = 'butt'; g.beginPath(); g.moveTo(790, 830); g.lineTo(1050, 1380); g.stroke(); g.strokeStyle = '#7a84a6'; g.lineWidth = 8; g.beginPath(); g.moveTo(810, 826); g.lineTo(1070, 1376); g.stroke(); g.fillStyle = GOLD_LT; g.strokeStyle = OL; g.lineWidth = 4; rr(g, 898, 1090, 54, 44, 6); g.fill(); g.stroke();
  steam(g, 930, 1050, t * 2, 3, 1.5, 1);
  // dashboard
  g.fillStyle = '#05091c'; g.fillRect(0, 1290, W, 120); g.restore();
}
// ---------- shot 9: the next evening, the car, the belted pot, the clock ----------
function s9(g, lt) {
  const t = Math.max(lt, 0), GY = 1190, V = 1500, camX = 540 + V * t;
  nightRoad(g, camX, GY, t, V);
  const bob = Math.sin(t * 24) * 4, wheel = t * 38;
  // exhaust puffs
  for (let i = 0; i < 6; i++) { const ph = (t * 3 + i / 6) % 1; g.fillStyle = `rgba(200,205,225,${(1 - ph) * .5})`; g.beginPath(); g.arc(250 - ph * 330, GY - 70 - ph * 60, 16 + ph * 36, 0, 6.29); g.fill(); }
  const grip = at(t, 1.8, 2.3), pan = ease(at(t, 4.0, 4.4));
  const P = { lean: .1 + .1 * grip, eye: lerp(1.2, 1.6, grip), brt: -.7 * grip, brow: -.3 * grip, mo: .1, sm: lerp(.3, -.5, grip), px: 1, py: 0, hands: [[60, -34], [70, -26]], tilt: 0 };
  carBody(g, 540, GY + bob * .5, 1.75, { t, wheel, P, rot: Math.sin(t * 17) * .008, lidK: 1 + at(t, 3.5, 5) * 1.5 });
  // knuckle shake lines at the wheel
  if (grip > .5) { g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round'; for (let k = 0; k < 3; k++) { const a = k * .8 - .8 + Math.sin(t * 40) * .1; g.beginPath(); g.moveTo(640 + Math.cos(a) * 36, 880 + Math.sin(a) * 36); g.lineTo(640 + Math.cos(a) * 62, 880 + Math.sin(a) * 62); g.stroke(); } }
  speedLines(g, t, 11, 3200, .3);
  carInterior(g, t, ease(at(t, 1.85, 2.1)) * (1 - ease(at(t, 3.9, 4.15))));
  // dashboard clock
  const m = t < 4.0 ? 50 : (t < 5.0 ? 55 : 60), hh = m === 60 ? 21 : 20, mm = m === 60 ? 0 : m; const jump = Math.max(0, 1 - (t - (t < 5 ? 4.0 : 5.0)) * 6) * (t >= 4.0 ? 1 : 0);
  const tickHz = lerp(2, 9, at(t, 0, 6)), ts = (Math.floor(t * tickHz) % 2) ? 1.05 : 1; const col = mix('#ffb347', '#ff3b30', at(t, 3.8, 5.2));
  const sh = shake(t, 3 * jump + 1.2 * at(t, 4, 6), 70); chip(g, pad2(hh) + ':' + pad2(mm), 540 + sh[0], 330 + sh[1], 120, { sc: ts * (1 + .22 * jump), col, rim: '#ff3b30' });
  const rr2 = (Math.floor(t * tickHz) % 2) ? 1 : .4; g.strokeStyle = `rgba(255,60,50,${.5 * rr2 * at(t, 3, 5)})`; g.lineWidth = 12; rr(g, 40, 40, W - 80, 1260, 40); g.stroke();
}
// ---------- shot 10: the swerve, the cone, the soup fountain, giant clock 22:00 ----------
function s10(g, lt) {
  const t = Math.max(lt, 0), GY = 1190, frz = t > 5.0 ? 5.0 : t, tt = t > 5.0 && t < 5.4 ? 5.0 : t;
  nightRoad(g, 540, GY, 0, 0);
  // giant clock behind
  const ck = at(t, 2.9, 3.4); if (ck > 0) { const spin = (t - 3.0) * 1200, fin = t >= 4.6; g.save(); g.globalAlpha = ck * .92; g.translate(540, 560); g.scale(1 + .05 * Math.sin(t * 20) * (fin ? 0 : 1), 1 + .05 * Math.sin(t * 20) * (fin ? 0 : 1)); const mm = fin ? 0 : (spin % 3600) / 60, hh = fin ? 22 : spin / 3600 * 12 + 9; clockFace(g, 0, 0, 400, hh, mm, undefined, { rim: '#c02a2a' }); g.restore(); if (fin) { const pk = back((t - 4.6) / .35); chip(g, '22:00', 540, 560, 150, { sc: pk, col: '#ff3b30', rim: '#fff' }); } }
  // cone, car
  const bump = 1.5, tau = Math.max(0, t - bump), xc = t < bump ? -520 + 590 * t + 80 * Math.sin(t * 2.6) * 0 : 365 + 70 * (1 - Math.exp(-tau * 3.5));
  const sw = t < bump ? Math.sin(t * 4.2) * .09 * (1 - t / bump) : 0, swy = t < bump ? Math.sin(t * 4.2 + 1) * 24 * (1 - t / bump) : 0;
  const sq = t >= bump ? Math.exp(-tau * 7) * Math.sin(tau * 40) : 0; const wheel = t < bump ? t * 38 : 57 + tau * 38 * Math.exp(-tau * 1.2);
  // cone on the road before the hit
  if (t < bump + .02) cone(g, 835, GY, 1.7, 0);
  else { const u = clamp(tau / 1.2); const cx2 = lerp(835, xc + 40, u), cy2 = lerp(GY - 20, GY - 450 * 1.75 + 10, u * u * (3 - 2 * u)) - Math.sin(u * Math.PI) * 800; const rot = u < 1 ? 14 * u : .15 * Math.sin((tau - 1.2) * 18) * Math.exp(-(tau - 1.2) * 3); cone(g, cx2, cy2, 1.7, rot); }
  const P = { lean: -.1, eye: t < bump ? 1.5 : 1.7 + .2 * Math.sin(tau * 30), brt: .5, mo: t < bump ? .3 : .7, sm: 0, px: t < bump ? 1 : Math.cos(tau * 12) * 1, py: t < bump ? 0 : Math.sin(tau * 12) * 1, hands: [[60, -34], [70, -26]], tilt: t < bump ? 0 : -.35 * Math.exp(-tau * 4) * Math.sin(tau * 14) };
  const poplid = t >= bump ? { lift: 40 + 60 * Math.min(1, tau * 4), dx: 0, rot: 0 } : lidTalk(t, 2.5);
  carBody(g, xc, GY + swy * .3, 1.75, { t, wheel, P, rot: sw + (t >= bump ? -.05 * Math.exp(-tau * 5) * Math.sin(tau * 10) : 0), sx: 1 - .1 * Math.max(0, sq), sy: 1 + .08 * Math.max(0, sq), lid: poplid, lidK: 1, level: t >= bump + .5 ? .6 : 1 });
  // flying lid
  if (t >= bump) { const lx = xc + 150 + tau * 120, ly = GY - 300 - 900 * tau + 1150 * tau * tau; if (tau < 1.6) { g.save(); g.translate(lx, ly); g.rotate(tau * 14); g.fillStyle = '#b6c0d2'; g.strokeStyle = OL; g.lineWidth = 5; g.beginPath(); g.ellipse(0, 0, 60, 20, 0, 0, 6.29); g.fill(); g.stroke(); g.fillStyle = '#e1584a'; g.beginPath(); g.arc(0, -14, 9, 0, 6.29); g.fill(); g.restore(); } }
  // soup fountain
  const sp = i => { const r = rng(i * 7 + 1), a = r(), b = r(), c3 = r(); return { t: bump + .02 + i * .025, x: xc + 150 + (a - .5) * 40, y: GY - 330, vx: (b - .5) * 520, vy: 1000 + 800 * c3, r: 8 + 6 * a }; };
  soupDrops(g, t, 46, sp, GY - 10, { life: 60, g: 2400 });
  // bump impact burst
  const bb = (t - bump) / .35; if (bb > 0 && bb < 1) { g.strokeStyle = `rgba(255,255,255,${1 - bb})`; g.lineWidth = 10; g.lineCap = 'round'; for (let k = 0; k < 12; k++) { const a = k * .52; g.beginPath(); g.moveTo(840 + Math.cos(a) * (40 + bb * 60), GY - 100 + Math.sin(a) * (40 + bb * 60)); g.lineTo(840 + Math.cos(a) * (100 + bb * 130), GY - 100 + Math.sin(a) * (100 + bb * 130)); g.stroke(); } }
  if (t < bump) speedLines(g, t, 8, 3000, .25);
  // trail leaks from before + flash + silence beat
  const fl = Math.sin(at(t, 4.6, 4.9) * Math.PI); if (fl > 0) { g.fillStyle = `rgba(255,255,255,${.6 * fl})`; g.fillRect(0, 0, W, H); }
  if (t > 5.0 && t < 5.45) { g.fillStyle = 'rgba(8,14,34,.45)'; g.fillRect(0, 0, W, H); }
}
// ---------- shot 11: the hall is empty and dark; the grey-vest friend locks up; Dovi slumps on the floor ----------
function chairStack(g, x, y, n, s) { g.strokeStyle = OL; g.lineWidth = 4; g.fillStyle = '#6d4a2b'; g.lineJoin = 'round'; for (let k = 0; k < n; k++) { g.save(); g.translate(x + (k % 2 ? 5 : -4) * s, y - k * 46 * s); g.scale(s, s); g.beginPath(); g.roundRect(-40, -34, 80, 12, 4); g.fill(); g.stroke(); g.beginPath(); g.roundRect(26, -112, 12, 82, 4); g.fill(); g.stroke(); g.fillRect(-36, -22, 8, 22); g.fillRect(24, -22, 8, 22); g.restore(); } }
function s11(g, lt) {
  const t = Math.max(lt, 0), L = LOOK.hero, GY = 1390, s = 2.3;
  hallBack(g, t, 900, false);
  chairStack(g, 110, 960, 5, 1.5); chairStack(g, 270, 960, 4, 1.5); chairStack(g, 850, 960, 6, 1.5); chairStack(g, 700, 960, 3, 1.4);
  const dk = lerp(0, .74, ease(at(t, .45, 1.0))); g.fillStyle = `rgba(6,10,30,${dk})`; g.fillRect(-100, -100, W + 200, 2200);
  // wall clock: always 5 minutes late
  clockFace(g, 760, 330, 84, 10, 5, 20 + t * 3); chip(g, '22:05', 760, 470, 36, { col: '#ff7a5a' });
  // the grey-vest friend locks up
  const a2 = at(t, 2.0, 2.4), shr = Math.sin(at(t, 2.6, 3.4) * Math.PI), ptr = at(t, 3.0, 3.35);
  const F = Object.assign({}, POSE0, { side: .8, spread: 0, shadow: true, th: [.04, .08], sh: [-.02, -.04], lean: .02 });
  F.eye = 1.1; F.sm = -.1 + .3 * a2; F.brt = .5 * shr; F.brow = .5 * shr; F.px = t < 2.0 ? -.6 : 1; F.py = .2; F.tilt = .08 * shr; F.blink = blinkAt(t, 4);
  F.hands = [[lerp(30, 70, ptr), lerp(-60, -100, ptr) - 20 * shr * (1 - ptr)], [lerp(60, 66, ptr) + (t < 2 ? Math.sin(t * 14) * 5 : 0), lerp(-60, -104, ptr) - 25 * shr * (1 - ptr)]];
  const fi = man(g, 420, 1130, 1.6, 1, LOOK.g, F, t);
  g.fillStyle = GOLD_LT; g.strokeStyle = OL; g.lineWidth = 4; if (t < 2.6) { const kx = fi.hands[1][0] + 8, ky = fi.hands[1][1] + 30 + Math.sin(t * 20) * 4; g.beginPath(); g.arc(kx, ky, 18, 0, 6.29); g.stroke(); for (let k = 0; k < 3; k++) { g.save(); g.translate(kx, ky); g.rotate(k * 1.1 + Math.sin(t * 20 + k)); g.fillRect(-3, 14, 6, 34); g.restore(); } }
  if (ptr > 0) { g.fillStyle = '#fff'; g.strokeStyle = OL; g.lineWidth = 4; g.beginPath(); g.arc(fi.hands[0][0], fi.hands[0][1] + 8, 24, 0, 6.29); g.fill(); g.stroke(); g.fillStyle = '#e63a2a'; g.fillRect(fi.hands[0][0] - 2, fi.hands[0][1] - 8, 4, 16); }
  g.fillStyle = 'rgba(6,10,30,.22)'; g.fillRect(150, 500, 560, 800);
  // one lamp
  lamp(g, 130, 1330, 2.3, ease(at(t, .6, 1.1)), t); glow(g, 190, 440, 520, '255,210,130', .38 * ease(at(t, .6, 1.1)));
  const mx = 240 + Math.cos(t * 5) * 90, my = 450 + Math.sin(t * 7) * 50; g.fillStyle = '#ddd'; g.beginPath(); g.ellipse(mx, my, 10, 5, Math.sin(t * 40) * .6, 0, 6.29); g.fill();
  // the soup trail across the floor
  splats(g, 740, 1160, GY + 14, 31, 40, at(t, 1.0, 2.0), 1.8);
  // door + Dovi
  const door = ease(at(t, 0, .25)); g.fillStyle = '#0c1530'; g.fillRect(960, 380, 140, 1150); g.fillStyle = '#7a5236'; const dw = 140 * (1 - door * .9); g.fillRect(1100 - dw, 380, dw, 1150);
  const run = at(t, .1, .9), brake = at(t, .6, 1.05); const x = lerp(1550, 760, ease(run));
  const Pr = runPose(t * 2.8 * (1 - brake * .85), { amp: 1 - brake * .6, lean: .3 }), Ps = Object.assign({}, POSE0, { th: [.55, .45], sh: [-.2, -.1], lean: -.18, side: 1, ua: [.2, .5], la: [.5, .5], spread: 0 }), stand = Object.assign({}, POSE0, { th: [.02, .08], sh: [-.02, -.06], lean: .04, side: 1, spread: 0 });
  const sit = Object.assign({}, POSE0, { th: [1.5, 1.5], sh: [-.05, -.05], lean: -.14, side: 1, spread: 0, ua: [.3, .3], la: [.5, .5] });
  let P = mixPose(Pr, Ps, ease(brake)); P = mixPose(P, stand, ease(at(t, 1.0, 1.4))); P = mixPose(P, sit, ease(at(t, 3.4, 4.1)));
  const sad = at(t, 1.4, 2.2), seat = at(t, 3.4, 4.1);
  P.eye = lerp(1.4, 1.0, sad) * lerp(1, .6, seat); P.sm = lerp(-.2, -1, sad); P.brt = lerp(.4, 1, sad); P.nod = 12 * sad + 14 * seat; P.px = lerp(1, -1, at(t, 1.0, 1.4)); P.py = .6 * seat; P.mo = (1 - brake) * .5; P.shadow = true; P.blink = 0;
  P.hands = [[34, -50], [138, -52]]; if (seat > 0) P.hands = [[lerp(34, 40, seat), lerp(-50, -20, seat)], [lerp(138, 100, seat), lerp(-52, -30, seat)]];
  const info = man(g, x, GY, s, -1, L, P, t);
  const pp = holdPot(g, info, s, -1, { px: lerp(70, 60, seat), sc: .8, lid: seat > 0 ? null : lidTalk(t, .6), level: lerp(.35, 0, at(t, 3.3, 3.6)), t }); handDot(g, info.hands[1], L, 18);
  dust(g, 960, GY, .85, t, 2.2); dust(g, 820, GY, 1.0, t, 1.8);
  const drip = i => ({ t: 3.6 + i * .6, x: pp.cx, y: pp.cy, vx: 0, vy: -10, r: 9 }); soupDrops(g, t, 4, drip, GY + 14, { life: 40 });
}
// ---------- shot 12: navy card, the alarm clock rings, the tray of coffee ----------
function bell(g, x, y, r, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = GOLD_LT; g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, r, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = GOLD; g.beginPath(); g.arc(0, -r - 8, 10, 0, 6.29); g.fill(); g.stroke(); g.restore(); }
function s12(g, lt) {
  const t = Math.max(lt, 0), bg = g.createLinearGradient(0, 0, 0, 1500); bg.addColorStop(0, '#0e1c38'); bg.addColorStop(1, '#183057'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const warm = ease(at(t, 4.8, 6)); glow(g, 540, 1350, 900, '255,190,90', .32 * warm); g.save(); g.translate(540, 1350); g.rotate(t * .1); g.fillStyle = `rgba(255,214,120,${.1 * warm})`; for (let i = 0; i < 16; i += 2) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 1400, i * Math.PI / 8, (i + 1) * Math.PI / 8); g.closePath(); g.fill(); } g.restore();
  const ring = t > .05 && t < 3.9 ? 1 : 0, shk = ring * Math.sin(t * 70) * .05, pop = back((t + .1) / .4);
  g.save(); g.translate(540, 560); g.scale(pop, pop); g.rotate(shk); g.translate(0, ring * Math.sin(t * 83) * 4);
  // feet + bells + hammer
  g.strokeStyle = OL; g.lineWidth = 6; g.fillStyle = '#c8921e'; g.beginPath(); g.moveTo(-150, 250); g.lineTo(-210, 330); g.lineTo(-170, 340); g.lineTo(-110, 270); g.fill(); g.stroke(); g.beginPath(); g.moveTo(150, 250); g.lineTo(210, 330); g.lineTo(170, 340); g.lineTo(110, 270); g.fill(); g.stroke();
  bell(g, -150, -230, 90, -.5 + shk * 3); bell(g, 150, -230, 90, .5 - shk * 3);
  g.fillStyle = '#d93b3b'; g.beginPath(); g.arc(0, 0, 280, 0, 6.29); g.fill(); g.stroke(); g.fillStyle = '#fbf6e8'; g.beginPath(); g.arc(0, 0, 232, 0, 6.29); g.fill(); g.stroke();
  const prog = ease(at(t, 5.0, 5.9)), m = lerp(0, 40, prog) + 10 * 0, mm = prog > 0 ? m : 10, hh = prog > 0 ? lerp(10, 5, prog) + 40 / 60 * prog : 10;
  g.strokeStyle = '#2a2a3a'; g.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.lineWidth = i % 3 === 0 ? 12 : 6; g.beginPath(); g.moveTo(Math.sin(a) * 180, -Math.cos(a) * 180); g.lineTo(Math.sin(a) * 210, -Math.cos(a) * 210); g.stroke(); }
  const ha = (hh % 12) * Math.PI / 6, ma = mm * Math.PI / 30; g.lineWidth = 18; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(ha) * 110, -Math.cos(ha) * 110); g.stroke(); g.lineWidth = 11; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(ma) * 168, -Math.cos(ma) * 168); g.stroke(); g.fillStyle = '#2a2a3a'; g.beginPath(); g.arc(0, 0, 14, 0, 6.29); g.fill();
  g.restore();
  // ring arcs
  if (ring) for (let i = 0; i < 3; i++) { const ph = (t * 3 + i / 3) % 1; g.strokeStyle = `rgba(255,220,120,${(1 - ph) * .8})`; g.lineWidth = 9; g.lineCap = 'round'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(540 + sd * 100, 340, 300 + ph * 150, sd < 0 ? Math.PI * 1.1 : Math.PI * 1.65, sd < 0 ? Math.PI * 1.35 : Math.PI * 1.9); g.stroke(); } }
  // tray slides in with a clink
  const sl = ease(at(t, 3.5, 4.1)); if (sl > 0) { tray(g, lerp(1500, 540, sl), 1300 + Math.sin(sl * Math.PI) * -20, 1.0, t, i => at(t, 3.9 + i * .04, 4.2 + i * .04)); }
  for (let i = 0; i < 5; i++) steam(g, 300 + i * 120, 1180, t + i * .2, 1, .9, at(t, 4.4, 5));
  if (t > 5.9) chip(g, '05:40', 540, 1130, 60, { col: '#ffd27a', sc: back((t - 5.9) / .1) });
}
// ---------- shot 13: the golden morning ----------
function s13(g, lt) {
  const tt = Math.min(Math.max(lt, 0), 5.5), t = Math.max(lt, 0), L = LOOK.hero, GY = 1200, s = 1.5;
  const x = t < 1.0 ? 170 : lerp(170, 1150, at(t, 1.0, 3.0)) + (t > 3.0 ? 0 : 0), xx = Math.min(x, 1150), camX = Math.min(Math.max(xx + 230, 540), 1380);
  const sk = g.createLinearGradient(0, 0, 0, 1250); sk.addColorStop(0, '#f2a15a'); sk.addColorStop(.55, '#ffd48a'); sk.addColorStop(1, '#fff0c4'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
  const sunY = lerp(1100, 780, ease(at(t, 0, 4))); glow(g, 1000 - (camX - 540) * .1, sunY, 700, '255,230,150', .8); g.fillStyle = '#fff6d0'; g.beginPath(); g.arc(1000 - (camX - 540) * .1, sunY, 130, 0, 6.29); g.fill();
  skyline(g, 4, camX, .12, 1100, 160, 330, 80, 160, '#d9a070', null, t); skyline(g, 9, camX, .35, 1180, 130, 300, 90, 170, '#b8805a', '#fff2b0', t);
  g.save(); g.translate(540 - camX, 0);
  // his building with the door
  g.fillStyle = '#d8b48a'; g.strokeStyle = OL; g.lineWidth = 5; g.fillRect(-100, GY - 640, 520, 640); g.strokeRect(-100, GY - 640, 520, 640); g.fillStyle = '#ffe9a8'; for (const wx of [-40, 250]) { g.fillRect(wx, GY - 520, 120, 140); g.strokeRect(wx, GY - 520, 120, 140); }
  const dopen = ease(at(t, .5, 1.0)); g.fillStyle = '#3a2418'; g.fillRect(100, GY - 300, 120, 300); g.strokeRect(100, GY - 300, 120, 300); g.fillStyle = '#c28a52'; g.fillRect(100, GY - 300, 120 * (1 - dopen * .85), 300); clockFace(g, 160, GY - 520, 50, 5, 40, 0);
  g.fillStyle = '#c9b48a'; g.fillRect(-300, GY, 3600, 700); g.fillStyle = '#e6d1a4'; g.fillRect(-300, GY, 3600, 12);
  // the shul, lit, door wide open at 3.0
  shulFacade(g, 1560, GY, 900, true, t);
  // friends pour out
  const fr = [{ x: 1500, L: LOOK.a }, { x: 1640, L: LOOK.g }, { x: 1780, L: LOOK.d }, { x: 1920, L: LOOK.b }];
  for (let i = 0; i < 4; i++) { const f = fr[i], k = ease(at(t, 3.0 + i * .12, 3.5 + i * .12)); if (k <= 0) continue; const ch = at(t, 3.6, 3.9), cup = at(t, 4.5 + i * .1, 4.9 + i * .1); const bounce = Math.abs(Math.sin((t - 3.5) * 9 + i)) * 28 * ch * (t < 5.5 ? 1 : 0);
    const P = Object.assign({}, POSE0, { side: .35, spread: .2, shadow: true, lift: bounce, th: [.05, .05], sh: [-.02, -.02], sm: 1, eye: .9, mo: .7 * ch, brow: .5, brt: 0, lean: 0 });
    P.hands = [[-40, lerp(-60, -230, ch)], [40, lerp(-60, lerp(-230, -210, cup), ch)]];
    const fx = lerp(1560, f.x - 240 + i * 40, k) - 20 * Math.sin(k * 3) , finf = man(g, lerp(1560, f.x - 150, k), GY, 1.35, -1, f.L, P, tt);
    if (cup > 0) { paperCup(g, finf.hands[1][0], finf.hands[1][1] + 10, 1.0, ['#b9722e', '#2d6bd6', '#d4a017', '#1fa070'][i]); } }
  // Dovi
  const P = runPose(0, {}); const wk = walkPose(tt * 1.9, { amp: 1 }); Object.assign(P, wk); P.lean = .08; P.hands = [[34, -38], [126, -40]]; P.sm = 1; P.eye = .9; P.brow = .3; P.mo = at(t, 3.3, 3.6) * .6; P.px = 1; P.shadow = true; P.blink = 0; P.sway = 0;
  if (t >= 3.0) { P.th = [0, 0]; P.sh = [0, 0]; P.bob = 0; }
  let dx = t < 1.0 ? 170 : lerp(170, 1150, ease(at(t, 1.0, 3.1)) ); if (t < 1.0) { P.th = [0, 0]; P.sh = [0, 0]; } if (t > 3.1) dx = 1150;
  const wm = t >= 1.0 && t < 3.1 ? walkPose((t - 1.0) * 1.9, { amp: 1 }) : null; if (wm) { P.th = wm.th; P.sh = wm.sh; P.bob = wm.bob; }
  const dinf = man(g, dx, GY, s, 1, L, P, tt);
  tray(g, dinf.hip[0] + s * 74, dinf.hip[1] + s * 2, .6, tt, null); handDot(g, dinf.hands[1], L, 13);
  for (let i = 0; i < 4; i++) steam(g, dinf.hip[0] + s * 74 + (i - 1.5) * 52, dinf.hip[1] - 70, tt + i * .3, 1, .8, .9);
  g.restore();
  // confetti from the cheer
  const cf = at(t, 3.6, 3.8); if (cf > 0) { const r2 = rng(9); for (let i = 0; i < 60; i++) { const px = 300 + r2() * 700, spd = 200 + r2() * 240, ph = ((tt - 3.6) * spd / 900 + r2()) % 1.2, py = -80 + ph * 1300; g.save(); g.translate(px + Math.sin(tt * 4 + i) * 20, py); g.rotate(tt * 3 + i); g.fillStyle = ['#e63a2a', '#2d6bd6', '#f2b134', '#1fa070', '#fff'][i % 5]; g.fillRect(-6, -3, 12, 6); g.restore(); } }
  // freeze-frame
  if (t >= 5.5) { const fz = at(t, 5.5, 5.6); g.fillStyle = `rgba(255,255,255,${.55 * (1 - fz)})`; g.fillRect(0, 0, W, H); g.strokeStyle = '#fff'; g.lineWidth = 28; g.strokeRect(14, 14, W - 28, 1330); }
}
// ---------- shot 14: end card ----------
function sunIcon(g, x, y, r, t, k) { g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = GOLD_LT; g.lineWidth = 8; g.lineCap = 'round'; g.save(); g.rotate(t * .5); for (let i = 0; i < 10; i++) { g.rotate(6.283 / 10); g.beginPath(); g.moveTo(0, -r - 12); g.lineTo(0, -r - 30); g.stroke(); } g.restore(); g.fillStyle = '#ffd35a'; g.strokeStyle = GOLD; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, r, 0, 6.29); g.fill(); g.stroke(); g.restore(); }
function s14(g, lt) {
  const t = Math.max(lt, 0), bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#12233F'); bg.addColorStop(1, '#1d3a66'); g.fillStyle = bg; g.fillRect(0, 0, W, H); glow(g, 540, 900, 900, '255,200,110', .18);
  const SP = [[160, 220, 17, 2, 1.6], [900, 300, 12, 3, 2], [110, 800, 10, 1, 1.9], [980, 860, 14, 2, 1.7], [220, 1280, 12, 4, 2.2], [880, 1300, 16, 5, 1.5], [540, 120, 10, 6, 1.8]];
  for (const [x, y, s, ph, f] of SP) sparkle(g, x, y, s, GOLD_LT, Math.max(0, Math.sin(t * f + ph)) ** 3 * ease((t - .8) / .6) * .9);
  // logo panel
  const pk = back((t - .1) / .6); g.save(); g.translate(540, 480); g.scale(pk, pk); g.fillStyle = CREAM; g.strokeStyle = GOLD; g.lineWidth = 6; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 40; g.shadowOffsetY = 14; rr(g, -470, -350, 940, 700, 40); g.fill(); g.shadowColor = 'transparent'; g.stroke(); g.restore();
  if (pk > .5) { logoFit(g, IMG.framed, 540, 400, 700, 470, { a: at(t, .3, .7) }); logoFit(g, IMG.halki, 540, 700, 520, 140, { a: at(t, .9, 1.4) }); }
  // time chips
  for (let i = 0; i < 2; i++) { const k = back((t - 1.4 - i * .35) / .55), cx = i ? 790 : 290, x = lerp(i ? 1500 : -500, cx, clamp(k)); if (k <= 0) continue;
    g.save(); g.translate(x, 1120); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30; g.shadowOffsetY = 12; g.fillStyle = i ? '#fffaf0' : '#0b1630'; g.strokeStyle = GOLD; g.lineWidth = 5; rr(g, -230, -170, 460, 340, 36); g.fill(); g.shadowColor = 'transparent'; g.stroke();
    if (i) sunIcon(g, 0, -90, 34, t, 1); else { g.save(); g.translate(0, -90); g.scale(1.1, 1.1); bookOpen(g, 0, 10, 130, 1, '#5b2f1c'); g.restore(); }
    digits(g, i ? '06:30' : '05:50', 0, 62, 100, i ? '#12233F' : '#ffd27a', true); g.restore(); }
}
