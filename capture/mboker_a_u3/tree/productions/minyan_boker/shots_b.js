// ---------- shot 6: minyan in prayer, tallit, seen from behind, morning light ----------
function s6(g, lt) {
  const t = Math.max(lt, 0), p = ease(t / 6.3);
  g.save(); cam(g, 540, lerp(1060, 1010, p), lerp(1.04, 1.2, p));
  const wall = g.createLinearGradient(0, -200, 0, 1010); wall.addColorStop(0, '#d9c9a6'); wall.addColorStop(1, '#f1e1bd'); g.fillStyle = wall; g.fillRect(-400, -400, W + 800, 1410);
  const fl = g.createLinearGradient(0, 1000, 0, 1900); fl.addColorStop(0, '#8d633c'); fl.addColorStop(1, '#4e321d'); g.fillStyle = fl; g.fillRect(-400, 1000, W + 800, 1100);
  g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(-400, 1000, W + 800, 4);
  // tall windows with morning sky
  [70, 270, 700, 900].forEach(x => { g.save(); archPath(g, x, x + 110, 250, 820); g.clip(); const wk = g.createLinearGradient(0, 250, 0, 820); wk.addColorStop(0, '#7fb4e0'); wk.addColorStop(1, '#ffe7ae'); g.fillStyle = wk; g.fillRect(x - 5, 240, 125, 590); g.restore(); g.strokeStyle = '#7a5230'; g.lineWidth = 9; archPath(g, x, x + 110, 250, 820); g.stroke(); });
  // aron kodesh
  const ax = 540; g.fillStyle = '#8a6a34'; g.fillRect(ax - 190, 560, 380, 450); g.fillStyle = GOLD_LT; g.beginPath(); g.moveTo(ax - 200, 560); g.lineTo(ax, 470); g.lineTo(ax + 200, 560); g.closePath(); g.fill();
  const pg = g.createLinearGradient(0, 600, 0, 1010); pg.addColorStop(0, '#1b2f66'); pg.addColorStop(1, '#0f1d46'); g.fillStyle = pg; g.fillRect(ax - 150, 600, 300, 410);
  g.strokeStyle = GOLD_LT; g.lineWidth = 4; g.strokeRect(ax - 134, 616, 268, 378); g.beginPath(); g.moveTo(ax, 616); g.lineTo(ax, 994); g.stroke();
  star6(g, ax, 770, 44, GOLD_LT); g.fillStyle = GOLD_LT; g.beginPath(); g.moveTo(ax - 40, 560); g.lineTo(ax - 28, 520); g.lineTo(ax - 10, 546); g.lineTo(ax, 508); g.lineTo(ax + 10, 546); g.lineTo(ax + 28, 520); g.lineTo(ax + 40, 560); g.closePath(); g.fill();
  // ner tamid
  glow(g, ax, 505, 70, '255,200,100', .6); g.fillStyle = '#ffd36a'; g.beginPath(); g.arc(ax, 498, 7, 0, 6.29); g.fill();
  // light shafts
  g.save(); g.globalCompositeOperation = 'lighter';
  [[125, 1], [325, 1], [755, -1], [955, -1]].forEach(([x, sd], i) => { const a = .075 + .02 * Math.sin(t * .8 + i); const sg = g.createLinearGradient(x, 700, x + sd * -200, 1500); sg.addColorStop(0, `rgba(255,236,170,${a * 1.6})`); sg.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = sg; g.beginPath(); g.moveTo(x - 55, 760); g.lineTo(x + 55, 760); g.lineTo(x + 55 + sd * -520, 1650); g.lineTo(x - 55 + sd * -520, 1650); g.closePath(); g.fill(); });
  g.restore();
  // rows of men (far to near)
  const rows = [[1130, .56, [250, 395, 540, 685, 830]], [1290, .78, [180, 360, 540, 720, 900]], [1500, 1.02, [300, 540, 780]]];
  rows.forEach(([by, s, xs], ri) => xs.forEach((x, i) => {
    const ph = ri * 1.3 + i * .9, sw = Math.sin(t * 1.9 + ph) * .045, hz = 1 - ri * .08;
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, by + 6, 90 * s, 14 * s, 0, 0, 6.29); g.fill();
    man(g, x, by, s, { col: mix('#141e42', '#2a3560', ri === 0 ? .55 : ri === 1 ? .3 : 0), tallit: true, sway: sw, rim: 'rgba(255,225,160,.5)', tl: '#fbf3df', td: '#cdbd98', kc: '#0f1a45' });
  }));
  g.restore();
  const v = g.createRadialGradient(540, 900, 520, 540, 900, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,10,0,.28)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- shot 7: ten chairs fill up, counter 1..10 ----------
function chair(g, x, y, s, k) {
  // front view; y = floor line. k = 0 empty, 1 occupied
  g.save(); g.translate(x, y); g.scale(s, s);
  const wood = mix('#35416e', '#9a6a3c', k), wd = mix('#252f58', '#6c4526', k);
  g.fillStyle = wd; for (const sx of [-52, 44]) g.fillRect(sx, -70, 9, 70);
  g.fillStyle = wood; g.beginPath(); g.roundRect(-66, -250, 132, 150, 14); g.fill(); g.fillStyle = wd; g.beginPath(); g.roundRect(-52, -234, 104, 40, 8); g.fill();
  if (k > 0) {
    const sc = back(k);
    g.save(); g.translate(0, -96); g.scale(.92 * sc, .92 * sc); man(g, 0, 0, 1, { col: '#0e1636', kc: '#1d2d66', rim: 'rgba(255,214,140,' + (.6 * k) + ')' }); g.restore();
  }
  g.fillStyle = wood; g.beginPath(); g.roundRect(-72, -100, 144, 32, 10); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(-70, -100, 140, 4);
  g.restore();
}
function s7(g, lt) {
  const t = Math.max(lt, 0), p = ease(t / 6.3);
  g.save(); cam(g, 540, lerp(900, 960, p), lerp(1.08, 1.0, p));
  const bg = g.createLinearGradient(0, -300, 0, 1700); bg.addColorStop(0, '#0b1636'); bg.addColorStop(1, '#1f3162'); g.fillStyle = bg; g.fillRect(-400, -400, W + 800, 2400);
  const fl = g.createLinearGradient(0, 850, 0, 1700); fl.addColorStop(0, '#2c2548'); fl.addColorStop(1, '#17132c'); g.fillStyle = fl; g.fillRect(-400, 850, W + 800, 1000);
  glow(g, 540, 1050, 760, '255,200,120', .22);
  const order = [0, 5, 1, 6, 2, 7, 3, 8, 4, 9]; // alternate back/front, left to right
  const when = Array(10); order.forEach((c, n) => when[c] = .9 + n * .5);
  const back5 = (i) => ({ x: 215 + i * 162, y: 880, s: .8 }), front5 = (i) => ({ x: 140 + i * 200, y: 1230, s: 1.1 });
  for (let i = 0; i < 5; i++) { const q = back5(i), k = ease((t - when[i]) / .5); glow(g, q.x, q.y - 120, 190 * k, '255,200,110', .4 * k); chair(g, q.x, q.y, q.s, k); }
  for (let i = 0; i < 5; i++) { const q = front5(i), k = ease((t - when[5 + i]) / .5); glow(g, q.x, q.y - 120, 220 * k, '255,200,110', .4 * k); chair(g, q.x, q.y, q.s, k); }
  // little numerals pulsing above each newly seated man
  order.forEach((c, n) => { const q = c < 5 ? back5(c) : front5(c - 5), a = clamp((t - when[c]) / .2) * (1 - clamp((t - when[c] - .9) / .4)); if (a > 0) T(g, String(n + 1), q.x, q.y - 330 * q.s - 20 - (1 - a) * 0 - (t - when[c]) * 24, 'FrBlack', 64, GOLD_LT, { a, sh: 'rgba(0,0,0,.5)', sb: 12 }); });
  g.restore();
  // counter (screen space)
  const cnt = order.reduce((s, c, n) => s + (t >= when[c] ? 1 : 0), 0), last = Math.max(0, ...order.map(c => when[c]).filter(w => w <= t)), pop = clamp((t - last) / .4);
  g.save(); g.translate(540, 360); g.scale(1 + .1 * (1 - back(pop)) * (cnt > 0 ? 1 : 0), 1 + .1 * (1 - back(pop)) * (cnt > 0 ? 1 : 0));
  glow(g, 0, 0, 330, '255,205,130', .22 + (cnt === 10 ? .3 * Math.sin(Math.min(1, (t - when[9]) / .6) * 3.14) + .1 : 0));
  g.strokeStyle = 'rgba(203,167,91,.28)'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 210, 0, 6.29); g.stroke();
  g.strokeStyle = GOLD_LT; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 210, -Math.PI / 2, -Math.PI / 2 + 6.283 * (cnt / 10)); g.stroke();
  g.restore();
  T(g, cnt > 0 ? String(cnt) : '0', 540, 360 + 100, 'FrBlack', 300, CREAM, { sh: 'rgba(255,214,140,.5)', sb: 40, so: 0, sc: 1 + .06 * (1 - back(pop)) });
  if (cnt === 10) { const a = ease((t - when[9] - .1) / .6); for (let i = 0; i < 14; i++) { const ang = i / 14 * 6.283 + .3, r = 250 + 90 * ease((t - when[9]) / 1.2) + (i % 3) * 20; sparkle(g, 540 + Math.cos(ang) * r, 360 + Math.sin(ang) * r, 16 + (i % 3) * 6, GOLD_PALE, a * (.5 + .5 * Math.sin(t * 4 + i))); } }
  const v = g.createRadialGradient(540, 900, 520, 540, 900, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,10,.4)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- shot 8: after the prayer: handshake, coffee, bright morning ----------
function s8(g, lt) {
  const t = Math.max(lt, 0), p = ease(t / 6.3);
  g.save(); cam(g, lerp(500, 560, p), 1000, lerp(1.06, 1.18, p));
  const sky = g.createLinearGradient(0, -300, 0, 1300); sky.addColorStop(0, '#8fc6ee'); sky.addColorStop(.6, '#cfe6f2'); sky.addColorStop(1, '#fff0cc'); g.fillStyle = sky; g.fillRect(-500, -500, W + 1000, 1900);
  glow(g, 880, 360, 900, '255,236,170', .7);
  g.save(); g.translate(880, 360); g.rotate(t * .06); g.fillStyle = 'rgba(255,248,210,.2)'; for (let i = 0; i < 12; i++) { g.rotate(6.283 / 12); g.beginPath(); g.moveTo(0, 0); g.lineTo(-50, -1400); g.lineTo(50, -1400); g.closePath(); g.fill(); } g.restore();
  g.fillStyle = '#fff8dc'; g.beginPath(); g.arc(880, 360, 80, 0, 6.29); g.fill();
  ridge(g, rg(930, 26, .006, .3, 10, .02, 1), '#bcd0b8', 1400); ridge(g, rg(990, 22, .008, 2, 8, .025, 3), '#a2b99a', 1400);
  // wall / ground
  const gr = g.createLinearGradient(0, 1040, 0, 1700); gr.addColorStop(0, '#e6d3a8'); gr.addColorStop(1, '#bda070'); g.fillStyle = gr; g.fillRect(-500, 1040, W + 1000, 900); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-500, 1040, W + 1000, 5);
  // tree
  g.fillStyle = '#8c6a3e'; g.fillRect(96, 640, 22, 400); g.fillStyle = '#7ea36b'; for (const [x, y, r] of [[107, 600, 110], [50, 660, 80], [170, 650, 84]]) { g.beginPath(); g.arc(x, y, r, 0, 6.29); g.fill(); }
  // three friends
  const shake = Math.sin(t * 9) * 8 * ease((t - 1.2) / .4) * (1 - ease((t - 4.4) / .5)), approach = ease((t - .2) / 1.0);
  const lx = lerp(120, 320, approach), rx = lerp(960, 760, approach);
  const skin = '#c58f6e';
  man(g, lx, 1130, 1.18, { col: '#22335f', kc: '#2c4286', rim: 'rgba(255,240,190,.8)', lean: .06 * approach });
  man(g, rx, 1130, 1.18, { col: '#2b3a68', kc: '#38529a', rim: 'rgba(255,240,190,.8)', lean: -.06 * approach });
  // arms + clasped hands
  const hx = 540, hy = 960 + shake;
  g.lineCap = 'round'; g.strokeStyle = '#22335f'; g.lineWidth = 62; g.beginPath(); g.moveTo(lx + 60, 930); g.lineTo(hx - 36, hy); g.stroke(); g.strokeStyle = '#2b3a68'; g.beginPath(); g.moveTo(rx - 60, 930); g.lineTo(hx + 36, hy); g.stroke();
  g.fillStyle = skin; g.beginPath(); g.ellipse(hx, hy, 58, 36, 0, 0, 6.29); g.fill(); g.strokeStyle = '#a9755a'; g.lineWidth = 4; g.beginPath(); g.moveTo(hx - 30, hy - 6); g.lineTo(hx + 28, hy + 6); g.stroke();
  // third friend raising a cup
  const th = Math.sin(t * 1.6) * 6; man(g, 540, 1100, .8, { col: '#34457a', kc: '#415aa6', rim: 'rgba(255,240,190,.8)' });
  g.save(); g.translate(0, th - 20 - 20 * ease((t - 2.5) / .6)); cup(g, 620, 900, t); g.restore();
  // table with cups (front-left)
  g.fillStyle = '#9b6a3a'; g.beginPath(); g.ellipse(250, 1330, 190, 40, 0, 0, 6.29); g.fill(); g.fillStyle = '#7a5230'; g.fillRect(238, 1330, 24, 190);
  cup(g, 190, 1316, t + .2); cup(g, 310, 1318, t + .7);
  // bokeh + sparkles
  const r = rng(17); for (let i = 0; i < 16; i++) { const x = r() * W, y = 300 + r() * 900, rr = 20 + r() * 40, ph = r() * 6.28; g.globalAlpha = .12 + .08 * Math.sin(t * .8 + ph); g.fillStyle = '#fff4c8'; g.beginPath(); g.arc(x + 20 * Math.sin(t * .3 + ph), y - ((t * 8) % 60), rr, 0, 6.29); g.fill(); } g.globalAlpha = 1;
  for (let i = 0; i < 8; i++) { const a = ease((t - 1.3 - i * .1) / .3) * (1 - ease((t - 2.4 - i * .1) / .6)); sparkle(g, 540 + Math.cos(i * .8) * 130, 940 + Math.sin(i * .8) * 100, 14, '#fff7d0', a); }
  g.restore();
}

// ---------- shot 9: two big time cards ----------
function creamBg(g) { g.fillStyle = CREAM; g.fillRect(0, 0, W, H); const v = g.createRadialGradient(540, 900, 300, 540, 900, 1300); v.addColorStop(0, 'rgba(255,255,255,.5)'); v.addColorStop(1, 'rgba(176,141,62,.10)'); g.fillStyle = v; g.fillRect(0, 0, W, H); }
function frame(g, y0, y1, k) { g.save(); g.globalAlpha = k; g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(40, y0, W - 80, y1 - y0); g.strokeStyle = GOLD_PALE; g.lineWidth = 1.5; g.strokeRect(54, y0 + 14, W - 108, y1 - y0 - 28); g.restore(); }
function logoFit(g, im, cx, cy, maxW, maxH, o) { if (!im || !im.naturalWidth) return; const ar = im.naturalWidth / im.naturalHeight; let w = maxW, h = w / ar; if (h > maxH) { h = maxH; w = h * ar; } const sc = (o && o.sc !== undefined) ? o.sc : 1; g.save(); g.globalAlpha *= (o && o.a !== undefined) ? clamp(o.a) : 1; g.translate(cx, cy); g.scale(sc, sc); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); }
function diamond(g, x, y, s, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath(); g.fill(); }
function sunIcon(g, x, y, r, t, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = GOLD_LT; g.lineWidth = 8; g.lineCap = 'round'; g.save(); g.rotate(t * .5); for (let i = 0; i < 10; i++) { g.rotate(6.283 / 10); g.beginPath(); g.moveTo(0, -r - 14); g.lineTo(0, -r - 34); g.stroke(); } g.restore(); const sg = g.createRadialGradient(-r * .3, -r * .3, 4, 0, 0, r); sg.addColorStop(0, '#ffe9a6'); sg.addColorStop(1, GOLD_LT); g.fillStyle = sg; g.beginPath(); g.arc(0, 0, r, 0, 6.29); g.fill(); g.restore(); }
function s9(g, lt) {
  const t = Math.max(lt, 0);
  creamBg(g); frame(g, 40, 1440, ease((t + .3) / .6));
  const sp = ease((t + .2) / .6) * 1; logoFit(g, IMG.horiz, 540, 170, 520, 200, { a: sp });
  // card 1 (navy)
  const k1 = back((t - .35) / .6), x1 = lerp(W + 500, 540, clamp(k1)), cy1 = 300;
  g.save(); g.translate(x1 - 540, 0); g.shadowColor = 'rgba(18,35,63,.28)'; g.shadowBlur = 40; g.shadowOffsetY = 16; g.fillStyle = NAVY; g.beginPath(); g.roundRect(96, cy1, 888, 460, 36); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.roundRect(112, cy1 + 16, 856, 428, 26); g.stroke();
  T(g, '05:50', 540, cy1 + 270, 'FrBlack', 250, CREAM); T(g, 'דף היומי', 540, cy1 + 392, 'FrBlack', 100, GOLD_PALE); g.restore();
  const kc = ease((t - 1.3) / .4); g.save(); g.globalAlpha = kc; g.fillStyle = GOLD; g.fillRect(537, 774, 6, 40 * kc); diamond(g, 540, 836, 16, GOLD); g.restore();
  // card 2 (cream)
  const k2 = back((t - 1.5) / .6), x2 = lerp(-500, 540, clamp(k2)), cy2 = 880;
  g.save(); g.translate(x2 - 540, 0); g.shadowColor = 'rgba(18,35,63,.2)'; g.shadowBlur = 40; g.shadowOffsetY = 16; g.fillStyle = '#fffaf0'; g.beginPath(); g.roundRect(96, cy2, 888, 460, 36); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = GOLD; g.lineWidth = 4; g.beginPath(); g.roundRect(96, cy2, 888, 460, 36); g.stroke();
  sunIcon(g, 200, cy2 + 130, 44, t, 1);
  T(g, '06:30', 600, cy2 + 270, 'FrBlack', 250, NAVY); T(g, 'שחרית', 600, cy2 + 392, 'FrBlack', 100, GOLD_DK); g.restore();
  caption(g, 8, lt, 'band', false);
}

// ---------- shot 10: end card with the real logos ----------
function s10(g, lt) {
  const t = Math.max(lt, 0);
  creamBg(g); frame(g, 40, 1440, ease((t + .3) / .6));
  const SP = [[160, 220, 17, 2, 1.6], [900, 300, 12, 3, 2], [110, 700, 10, 1, 1.9], [980, 760, 14, 2, 1.7], [220, 1180, 12, 4, 2.2], [880, 1220, 16, 5, 1.5], [540, 120, 10, 6, 1.8]];
  for (const [x, y, s, ph, f] of SP) sparkle(g, x, y, s, GOLD_LT, Math.max(0, Math.sin(t * f + ph)) ** 3 * ease((t - .8) / .6) * .85);
  const k = back((t - .15) / .8); logoFit(g, IMG.framed, 540, 560, 760, 700, { a: clamp((t + .3) / .4), sc: lerp(.9, 1, clamp(k)) });
  const dk = ease((t - 1.0) / .5); g.save(); g.globalAlpha = dk; g.fillStyle = GOLD; g.fillRect(300, 984, 480, 3); diamond(g, 540, 985, 15, GOLD); g.restore();
  const hk = ease((t - 1.3) / .6); logoFit(g, IMG.halki, 540, 1180, 640, 230, { a: hk, sc: lerp(.96, 1, hk) });
  caption(g, 9, lt, 'band', true);
}
