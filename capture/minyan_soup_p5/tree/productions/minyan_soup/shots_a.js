// ---------- shared hebrew bits (escaped, never typed) ----------
const HE = {
  title: 'תורנות מרק', day: 'יום', who: 'שם', today: 'היום',
  days: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'],
  names: ['דוד', 'משה', 'אברהם', 'שמואל', 'נתי', 'דובי', 'יוסי', 'דני'],
};
// ---------- shot 1: night flat, the hero yawns at the laptop, a mail pops up, he clicks the link ----------
function potIcon(g, x, y, s, a) { g.save(); g.globalAlpha *= a === undefined ? 1 : a; g.translate(x, y); g.scale(s, s); g.fillStyle = '#e1584a'; g.strokeStyle = '#3a2410'; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.roundRect(-40, -22, 80, 52, [6, 6, 20, 20]); g.fill(); g.stroke(); g.fillStyle = '#c3cbdb'; g.beginPath(); g.roundRect(-46, -34, 92, 16, 8); g.fill(); g.stroke(); g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.85)'; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 20, -48); g.quadraticCurveTo(i * 20 + 8, -62, i * 20, -76); g.stroke(); } g.restore(); }
function sheetScreen(g, scroll, o) {
  o = o || {}; const hl = o.hl === undefined ? -1 : o.hl, hk = o.hk || 0, t = o.t || 0;
  g.fillStyle = '#f2f5fa'; g.fillRect(0, 0, W, H);
  // browser bar
  g.fillStyle = '#d7dfeb'; g.fillRect(0, 0, W, 170); g.fillStyle = '#c3cddd'; g.fillRect(0, 168, W, 4);
  for (let i = 0; i < 3; i++) { g.fillStyle = ['#ff6b5e', '#ffc23d', '#3fc95a'][i]; g.beginPath(); g.arc(70 + i * 46, 56, 14, 0, 6.29); g.fill(); }
  g.fillStyle = '#fff'; rr(g, 70, 96, 940, 56, 28); g.fill(); g.fillStyle = '#3fa86a'; g.beginPath(); g.arc(110, 124, 11, 0, 6.29); g.fill(); g.fillStyle = '#b8c2d3'; rr(g, 140, 116, 420, 16, 8); g.fill();
  if (o.load !== undefined) { g.fillStyle = '#2d6bd6'; g.fillRect(0, 164, W * o.load, 8); }
  // sheet header
  g.fillStyle = '#fff'; g.fillRect(0, 172, W, 170); g.fillStyle = '#1e9e5a'; rr(g, 60, 214, 86, 100, 14); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(80, 246, 46, 50); g.beginPath(); g.moveTo(80, 262); g.lineTo(126, 262); g.moveTo(80, 279); g.lineTo(126, 279); g.moveTo(103, 246); g.lineTo(103, 296); g.stroke();
  potIcon(g, 220, 276, .8); T(g, HE.title, 960, 296, 'FrBlack', 86, '#1d2b48', { al: 'right' });
  // column header
  g.fillStyle = '#dfe8f3'; g.fillRect(0, 342, W, 86); T(g, HE.day, 960, 400, 'FrBold', 50, '#52627f', { al: 'right' }); T(g, HE.who, 560, 400, 'FrBold', 50, '#52627f'); potIcon(g, 150, 396, .42);
  g.save(); g.beginPath(); g.rect(0, 428, W, H - 428); g.clip();
  const RH = 190, sy = 428 - scroll;
  for (let i = 0; i < 10; i++) {
    const y = sy + i * RH; if (y > H || y < 428 - RH) continue; const today = i === 5, hov = i === hl;
    g.fillStyle = today && hk > 0 ? mix('#ffffff', '#ffe27a', hk) : hov ? '#dcebff' : (i % 2 ? '#eef3fa' : '#ffffff'); g.fillRect(0, y, W, RH);
    g.fillStyle = 'rgba(80,100,140,.18)'; g.fillRect(0, y + RH - 2, W, 2);
    const col = today && hk > .5 ? '#3a2200' : '#1d2b48';
    T(g, HE.days[i % 5], 960, y + 118, 'FrBold', 72, col, { al: 'right' }); { const bl = !(today && hk > 0); if (bl) g.filter = 'blur(7px)'; T(g, HE.names[i % 8 === 5 && i !== 5 ? 6 : (i === 5 ? 5 : (i % 8))], 560, y + 118, 'FrBlack', 76 + (today ? hk * 14 : 0), today && hk > .5 ? '#9a1d10' : col); g.filter = 'none'; }
    if (i % 5 !== 2 || today) { const k = today && hk > 0 ? 1 + .55 * elastic(hk) * 1 + .1 * Math.sin(t * 9) * hk : (hov && o.pulse ? 1 + .22 * Math.sin(t * 10) : 1); potIcon(g, 150, y + 100, .95 * k); }
  }
  g.restore();
}
function s1(g, lt) {
  const t = Math.max(lt, 0), L = LOOK.hero;
  g.save(); const zoom = lerp(1, 1.07, ease(t / 3)); cam(g, 540, 900, zoom);
  // room
  const wg = g.createLinearGradient(0, 0, 0, 1200); wg.addColorStop(0, '#16224a'); wg.addColorStop(1, '#25356a'); g.fillStyle = wg; g.fillRect(-100, -100, W + 200, 1300);
  g.fillStyle = '#3a2a22'; g.fillRect(-100, 1170, W + 200, 800); g.fillStyle = '#4a372c'; g.fillRect(-100, 1170, W + 200, 10);
  g.fillStyle = 'rgba(255,255,255,.04)'; for (let i = 0; i < 9; i++) g.fillRect(-100, 1230 + i * 70, W + 200, 3);
  // window
  g.save(); archPath(g, 70, 360, 190, 760); g.clip(); const sk = g.createLinearGradient(0, 190, 0, 760); sk.addColorStop(0, '#040818'); sk.addColorStop(1, '#22397a'); g.fillStyle = sk; g.fillRect(60, 180, 310, 590); stars(g, t, 1, 560, 70, 290);
  g.fillStyle = '#f4ecd2'; g.beginPath(); g.arc(270, 330, 34, 0, 6.29); g.fill(); g.fillStyle = '#0a1230'; g.beginPath(); g.arc(256, 321, 31, 0, 6.29); g.fill();
  g.fillStyle = '#0a1230'; g.fillRect(60, 650, 310, 120); for (let i = 0; i < 6; i++) { g.fillStyle = '#ffd07a'; g.fillRect(90 + i * 46, 668 + (i % 3) * 14, 8, 10); } g.restore();
  g.strokeStyle = '#8b7ab0'; g.lineWidth = 12; archPath(g, 70, 360, 190, 760); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(215, 190); g.lineTo(215, 760); g.moveTo(70, 470); g.lineTo(360, 470); g.stroke(); g.fillStyle = '#6a5a94'; g.fillRect(50, 760, 330, 22);
  // bookshelf
  g.fillStyle = '#4a3023'; g.fillRect(790, 300, 250, 760); g.fillStyle = '#2a1a12'; g.fillRect(804, 314, 222, 732);
  const rb = rng(11); for (let sh = 0; sh < 4; sh++) { const by = 314 + (sh + 1) * 183; let bx = 810; while (bx < 1010) { const bw = 14 + rb() * 14, bh = 110 + rb() * 55; g.fillStyle = ['#7a2a2a', '#1f3f7a', '#2a6a4a', '#8a6a2a', '#5a2a6a', '#3a3a3a'][Math.floor(rb() * 6)]; g.fillRect(bx, by - bh, bw, bh); g.fillStyle = GOLD_LT; g.fillRect(bx + 2, by - bh + 14, bw - 4, 3); bx += bw + 2; } g.fillStyle = '#4a3023'; g.fillRect(804, by, 222, 10); }
  // wall clock 20:40
  clockFace(g, 790, 175, 92, 8, 40, 20 + t); chip(g, '20:40', 790, 290, 34, { sc: 1, col: '#ffb347' });
  // lamp glow
  glow(g, 210, 900, 360, '255,200,120', .16);
  // chair back + hero
  g.fillStyle = '#2f3d78'; g.strokeStyle = OL; g.lineWidth = 5; rr(g, 400, 720, 280, 420, 50); g.fill(); g.stroke();
  const yawn = at(t, .2, .6) * (1 - at(t, 1.5, 1.8)), ding = at(t, 2.0, 2.1), read = at(t, 2.6, 2.8) * (1 - at(t, 4.0, 4.3)), sc = 2.5;
  const P = Object.assign({}, POSE0, SIT, { side: 0, shadow: false, torsoOnly: true });
  const lean = -.16 * (at(t, 2.0, 2.1) - at(t, 2.1, 2.14)) + .2 * at(t, 2.1, 2.42) * (1 - at(t, 4.0, 4.5) * .7);
  P.lean = lean + Math.sin(t * 2.1) * .01; P.tilt = -.14 * yawn + .1 * read * Math.sin(t * 3) * .3;
  P.eye = lerp(lerp(1, .22, yawn), 1.55, ding) * (1 - read * .35 * (1 - ding)) + (1 - read) * 0; if (t > 2.4) P.eye = lerp(1.55, 1.15, at(t, 2.4, 3.0));
  P.mo = yawn * .95 + ding * (1 - at(t, 2.4, 2.7)) * .55; P.sm = lerp(.1, .8, at(t, 2.8, 3.3)); P.brow = ding * (1 - at(t, 2.6, 3.2) * .5); P.brt = ding * .5;
  P.px = at(t, 2.5, 4.0) * Math.sin((t - 2.5) * 6) * .9; P.py = .6 * at(t, 2.3, 2.7); P.blink = blinkAt(t, 1) * (1 - yawn) * (1 - ding);
  const up = yawn * (1 - at(t, 1.4, 1.7)); P.hands = [[lerp(-48, -76, up), lerp(-52, -300, up)], [48, -52 + Math.sin(t * 9) * 3 * ding * (1 - at(t, 2.3, 2.5))]];
  man(g, 540, 1090, sc, 1, L, P, t);
  glow(g, 540, 900, 420, '120,175,255', .12 + .10 * at(t, 1.2, 1.4));
  // desk + laptop
  g.fillStyle = '#7a4e2a'; g.strokeStyle = OL; g.lineWidth = 5; rr(g, 120, 1005, 840, 44, 10); g.fill(); g.stroke(); g.fillStyle = '#9c6a3c'; g.fillRect(130, 1010, 820, 8);
  g.fillStyle = '#5c3a1f'; rr(g, 150, 1049, 780, 130, 8); g.fill(); g.stroke(); g.fillStyle = '#3a2412'; g.fillRect(240, 1076, 270, 70); g.fillRect(570, 1076, 270, 70); g.fillStyle = GOLD_LT; g.fillRect(360, 1106, 30, 8); g.fillRect(690, 1106, 30, 8);
  g.fillStyle = '#4a4f66'; rr(g, 385, 878, 310, 136, 14); g.fill(); g.stroke(); g.fillStyle = '#c9d3ea'; g.beginPath(); g.arc(540, 946, 15, 0, 6.29); g.fill(); glow(g, 540, 946, 80, '190,215,255', .5);
  g.fillStyle = '#2c2f40'; g.beginPath(); g.moveTo(375, 1004); g.lineTo(705, 1004); g.lineTo(725, 1016); g.lineTo(355, 1016); g.closePath(); g.fill(); g.stroke();
  // soup bowl on the desk (foreshadowing)
  g.fillStyle = '#f2f2f6'; g.beginPath(); g.moveTo(790, 972); g.lineTo(900, 972); g.quadraticCurveTo(895, 1010, 845, 1008); g.quadraticCurveTo(795, 1010, 790, 972); g.fill(); g.stroke(); g.fillStyle = '#f4b73c'; g.beginPath(); g.ellipse(845, 972, 55, 9, 0, 0, 6.29); g.fill(); g.stroke(); steam(g, 845, 962, t, 3, .6, 1);
  // desk lamp
  g.strokeStyle = '#d0d6e6'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(200, 1004); g.lineTo(230, 900); g.lineTo(290, 860); g.stroke(); g.fillStyle = '#ffd77a'; g.beginPath(); g.moveTo(270, 850); g.lineTo(330, 872); g.lineTo(300, 900); g.closePath(); g.fill();
  // mail pop
  const pk = back((t - 2.05) / .5), f = Math.sin(t * 4) * 8;
  if (t > 2.0 && t < 4.8) {
    for (let i = 0; i < 3; i++) { const rk = ((t - 2.05 - i * .22) / .9); if (rk > 0 && rk < 1) { g.strokeStyle = `rgba(255,220,120,${1 - rk})`; g.lineWidth = 8; g.beginPath(); g.arc(540, 410, 120 + rk * 240, 0, 6.29); g.stroke(); } }
    const open = at(t, 3.5, 4.0), fl = at(t, 3.5, 3.9);
    g.save(); g.translate(540, lerp(870, 410, eout(at(t, 2.05, 2.5))) + f); g.scale(pk * 1.1, pk * 1.1); g.rotate(Math.sin(t * 5) * .04 * (1 - open));
    g.strokeStyle = OL; g.lineWidth = 6; g.lineJoin = 'round'; g.fillStyle = '#fffaf0'; rr(g, -130, -86, 260, 172, 14); g.fill(); g.stroke();
    // letter sliding out
    if (open > 0) { g.save(); g.translate(0, -120 * open); g.fillStyle = '#fff'; rr(g, -92, -80, 184, 150, 8); g.fill(); g.stroke(); g.fillStyle = '#2d6bd6'; rr(g, -66, -40, 132, 26, 13); g.fill(); g.fillStyle = '#b8c2d3'; rr(g, -66, 4, 132, 12, 6); g.fill(); rr(g, -66, 26, 90, 12, 6); g.fill(); g.restore(); }
    g.fillStyle = '#f0e6cf'; g.beginPath(); g.moveTo(-130, 86); g.lineTo(0, 0); g.lineTo(130, 86); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-130, -86); g.lineTo(0, 10); g.lineTo(130, -86); g.stroke();
    g.fillStyle = '#e8c9c0'; g.beginPath(); g.moveTo(-130, -86); g.lineTo(0, 10 - 100 * fl * 0); g.lineTo(130, -86); g.closePath(); if (open < .05) { g.fill(); g.stroke(); }
    // link badge
    g.fillStyle = '#2d6bd6'; g.beginPath(); g.arc(100, 70, 34, 0, 6.29); g.fill(); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 7; g.beginPath(); g.arc(88, 70, 11, 2.3, 5.2); g.arc(112, 70, 11, 5.4, 8.3); g.stroke();
    g.restore();
    // cursor + click
    const ck = at(t, 2.6, 3.4), cx = lerp(800, 590, eout(ck)), cy = lerp(900, 470 + f, eout(ck)), press = at(t, 3.4, 3.5) * (1 - at(t, 3.5, 3.62));
    if (t > 2.5 && open < 1) { g.save(); g.translate(cx, cy); g.scale(1 - press * .12, 1 - press * .12); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 46); g.lineTo(13, 35); g.lineTo(23, 56); g.lineTo(33, 51); g.lineTo(23, 31); g.lineTo(40, 29); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    const rk2 = (t - 3.45) / .45; if (rk2 > 0 && rk2 < 1) { g.strokeStyle = `rgba(255,255,255,${1 - rk2})`; g.lineWidth = 7; g.beginPath(); g.arc(590, 470 + f, 20 + rk2 * 90, 0, 6.29); g.stroke(); }
  }
  g.restore();
  // page opens full screen
  const zp = at(t, 4.3, 5.85);
  if (zp > 0) {
    const e = ein(zp) * .15 + ease(zp) * .85, sc2 = lerp(.16, 1, e), cx = lerp(540, 540, e), cy = lerp(380, 960, e); g.save(); g.translate(cx - 540 * sc2, cy - 960 * sc2); g.scale(sc2, sc2);
    g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 40; g.fillStyle = '#f2f5fa'; g.fillRect(0, 0, W, H); g.shadowColor = 'transparent'; g.beginPath(); g.rect(0, 0, W, H); g.clip(); sheetScreen(g, 0, { load: at(t, 4.6, 5.95), t }); g.restore();
    if (zp < 1) { g.fillStyle = `rgba(255,255,255,${.25 * Math.sin(zp * Math.PI)})`; g.fillRect(0, 0, W, H); }
  }
}

function backHead(g, x, y, sc, t) {
  g.save(); g.translate(x + Math.sin(t * 1.3) * 4, y); g.scale(sc, sc); g.strokeStyle = OL; g.lineWidth = 6; g.lineJoin = 'round';
  g.fillStyle = '#f8f6ee'; g.beginPath(); g.moveTo(-300, 700); g.quadraticCurveTo(-310, 230, -150, 200); g.lineTo(150, 200); g.quadraticCurveTo(310, 230, 300, 700); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#d9a073'; rr(g, -48, 100, 96, 120, 30); g.fill(); g.stroke();
  g.fillStyle = '#e8b48a'; g.beginPath(); g.ellipse(-122, 20, 22, 36, 0, 0, 6.29); g.ellipse(122, 20, 22, 36, 0, 0, 6.29); g.fill(); g.stroke();
  g.fillStyle = '#5a3a24'; g.beginPath(); g.ellipse(0, 0, 128, 140, 0, 0, 6.29); g.fill(); g.stroke();
  g.fillStyle = '#0d0f18'; g.beginPath(); g.ellipse(0, -62, 92, 64, 0, 0, 6.29); g.fill(); g.stroke(); g.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { const a = Math.PI + (i + .5) * Math.PI / 9; g.beginPath(); g.arc(Math.cos(a) * 76, -62 + Math.sin(a) * 52 * -1 * -1 + 40 * 0, 4, 0, 6.29); g.fill(); }
  g.restore();
}
// ---------- shot 2: the rota table, a finger travels along the rows ----------
function s2(g, lt) {
  const t = Math.max(lt, 0), sc = ease(at(t, 1.0, 4.0)) * 640, hl = Math.floor((428 + 100 + sc * 0 + (t * 0)) * 0);
  const tipY = lerp(1500, 930, eout(at(t, .2, 1.5))) + Math.sin(t * 3) * 38 * at(t, 1.5, 4.0) * (1 - at(t, 4.0, 4.6) * .9); const tipX = lerp(820, 640, at(t, .2, 1.5)) + Math.sin(t * 2.1) * 60 * at(t, 1.4, 4.0) * (1 - at(t, 4.0, 4.6) * .9);
  const rowI = Math.floor((tipY - (428 - sc)) / 190);
  sheetScreen(g, sc, { hl: rowI, t, pulse: t > 4.0 });
  // finger
  const [sx, sy] = shake(t, 2, 40); pointHand(g, tipX + sx * 0, tipY + 6 + sy * 0, 1.15, -.28 + Math.sin(t * 3) * .02, 0);
  backHead(g, 140, 1250, .78, t); g.fillStyle = 'rgba(40,70,150,.0)';
  // dust motion lines for scroll
  g.strokeStyle = 'rgba(60,100,180,.22)'; g.lineWidth = 8; g.lineCap = 'round'; const spd = Math.sin(at(t, 1.0, 4.0) * Math.PI); for (let i = 0; i < 4; i++) { const x = 100 + i * 290, y0 = 560 + ((t * 700 + i * 220) % 900); g.globalAlpha = spd * .8; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + 110); g.stroke(); } g.globalAlpha = 1;
}
// ---------- shot 3: the finger lands on TODAY, the hero's face goes wide ----------
function burstBg(g, t, c1, c2, cx, cy) { g.fillStyle = c1; g.fillRect(0, 0, W, H); g.save(); g.translate(cx, cy); g.rotate(t * .12); g.fillStyle = c2; const n = 20; for (let i = 0; i < n; i += 2) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 2400, i * 2 * Math.PI / n, (i + 1) * 2 * Math.PI / n); g.closePath(); g.fill(); } g.restore(); }
function s3(g, lt) {
  const t = Math.max(lt, 0);
  if (t < 1.8) {
    const hk = at(t, .4, .8), land = eout(at(t, 0, .5)); const sc = 640; const rowY = 428 - sc + 5 * 190 + 95;
    const zz = 1 + at(t, .5, 1.7) * .2; g.save(); cam(g, 540, rowY + 60, zz); g.translate(0, 0);
    sheetScreen(g, sc, { hl: hk > 0 ? -1 : 5, hk, t });
    // today tag
    const tg = back((t - .8) / .4); if (tg > 0) { g.save(); g.translate(820, rowY - 150 + Math.sin(t * 8) * 4); g.scale(tg, tg); g.rotate(-.1); g.fillStyle = '#e63a2a'; g.strokeStyle = '#fff'; g.lineWidth = 6; rr(g, -140, -50, 280, 100, 30); g.fill(); g.stroke(); T(g, HE.today, 0, 28, 'FrBlack', 80, '#fff'); g.restore(); }
    for (let i = 0; i < 5; i++) sparkle(g, 160 + Math.cos(t * 4 + i * 1.3) * 90, rowY + Math.sin(t * 3 + i) * 50, 22 + i * 3, '#fff6c0', hk * (.5 + .5 * Math.sin(t * 9 + i)));
    pointHand(g, lerp(640, 560, land), lerp(rowY + 480, rowY - 4, land) + Math.sin(at(t, .35, .6) * 3.14) * 18, 1.15, -.28, 0);
    g.restore();
    const fl = Math.sin(at(t, 1.25, 1.75) * Math.PI); if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl * .9})`; g.fillRect(0, 0, W, H); }
  }
  if (t >= 1.5) {
    const u = t - 1.5, L = LOOK.hero;
    burstBg(g, t, '#1d3d8a', '#2a4fa6', 540, 700);
    const zoom = lerp(5.2, 6.6, at(u, 0, 3.9)) + .55 * (1 - elastic(at(u, 0, .6))) * 1; const sh = shake(u, 5 * (1 - at(u, .3, 1.2)) + 1.2, 53);
    g.save(); g.translate(sh[0], sh[1]);
    const gasp = at(u, .05, .3), dt = at(u, 1.15, 1.5) * (1 - at(u, 2.7, 3.0));
    const P = Object.assign({}, POSE0, { torsoOnly: true, side: 0, shadow: false });
    P.eye = lerp(1, 1.75, gasp) + Math.sin(u * 27) * .03 * gasp; P.mo = gasp * (.85 + Math.sin(u * 30) * .04) * (1 - at(u, 2.8, 3.5) * .4); P.sm = 0; P.brow = gasp * 1.2; P.brt = .7 * gasp; P.tilt = -.04 * gasp + Math.sin(u * 40) * .004;
    // double take: pupils dart left, right, centre
    const dtk = at(u, .55, .95); P.px = (u < .5) ? 0 : (u < 1.1 ? -1.1 : (u < 1.7 ? 1.1 : (u < 2.4 ? -1 : 0))); P.py = .9 * (1 - at(u, 2.4, 2.8)) * (u < 2.4 ? 1 : 0) + .3; if (u > 2.5) { P.px = Math.sin(u * 30) * .3; P.py = 0; }
    P.lean = .0; P.nod = -8 * gasp + 14 * at(u, 2.6, 3.4); P.hip = [0, 0];
    const turn = ease(at(u, 3.0, 3.3)); if (u > 3.0) { P.side = .85 * turn; P.px = 1; P.py = 0; P.eye = 1.3; P.mo = .2; }
    const kick = ease(at(u, 4.0, 4.45)); g.save(); g.translate(540, 1500); g.rotate(-.32 * kick); g.scale(1 - .25 * kick, 1 - .25 * kick); g.translate(-540 - 300 * kick * 0, -1500);
    man(g, 540, 700 + 174 * zoom, zoom, 1, L, P, u);
    g.restore();
    if (u > 3.0 && u < 4.4) { const ck = back((u - 3.0) / .35); g.save(); g.translate(830, 470); g.scale(ck, ck); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 196, 0, 6.29); g.fill(); g.strokeStyle = '#e63a2a'; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 196 + Math.sin(u * 12) * 6, 0, 6.29); g.stroke(); clockFace(g, 0, 0, 180, 8, 45, 10 + u * 3); chip(g, '20:45', 0, 230, 46, { col: '#ff7a5a' }); g.restore(); }
    glow(g, 540, 1180, 760, '120,180,255', .18);
    g.restore();
    // sweat + radiating lines
    sweatDrops(g, u, 540 - 190, 560, 2.4, 1, at(u, 1.2, 1.6), 0); sweatDrops(g, u, 540 + 190, 560, 2.2, -1, at(u, 1.6, 2.0), .5);
    g.strokeStyle = '#fff'; g.lineWidth = 12; g.lineCap = 'round'; const gk = at(u, 0, .12) * (1 - at(u, .12, .9)); g.globalAlpha = gk; for (let i = 0; i < 14; i++) { const a = i * 2 * Math.PI / 14 + .1, r0 = 380 + at(u, 0, .4) * 200; g.beginPath(); g.moveTo(540 + Math.cos(a) * r0, 640 + Math.sin(a) * r0 * 1.2); g.lineTo(540 + Math.cos(a) * (r0 + 160), 640 + Math.sin(a) * (r0 + 160) * 1.2); g.stroke(); } g.globalAlpha = 1;
    const ex = 540 + 250, ey = 340; if (u > .1 && u < 3.0) T(g, '!?', ex + 120, ey + 90, 'FrBlack', 250, '#ffe27a', { rot: .2, sc: back((u - .1) / .4), sh: 'rgba(0,0,0,.4)' });
  }
}
// ---------- shot 4: kitchen: the pot with the talking lid, he lifts it 2 cm, mitts, slips, shoulders the door ----------
function s4(g, lt) {
  const t = Math.max(lt, 0), L = LOOK.hero, GY = 1180, s = 1.5, wp = eout(at(t, 0, .45));
  const zk = ease(at(t, 1.3, 2.0)) * (1 - ease(at(t, 2.6, 3.0)) * .6);
  g.save(); g.translate(lerp(900, 0, wp), 0); cam(g, lerp(540, 600, zk), 900, 1 + zk * .22);
  const wg = g.createLinearGradient(0, 0, 0, 1200); wg.addColorStop(0, '#16224a'); wg.addColorStop(1, '#2a3a70'); g.fillStyle = wg; g.fillRect(-1200, -300, 3400, 1500);
  g.fillStyle = '#d9d2c0'; g.fillRect(-1200, 600, 3400, 460); g.strokeStyle = 'rgba(80,70,50,.22)'; g.lineWidth = 2; for (let i = -24; i < 44; i++) { g.beginPath(); g.moveTo(i * 52, 600); g.lineTo(i * 52, 1060); g.stroke(); } for (let j = 0; j < 9; j++) { g.beginPath(); g.moveTo(-1200, 600 + j * 52); g.lineTo(2200, 600 + j * 52); g.stroke(); }
  g.fillStyle = '#3a2a22'; g.fillRect(-1200, GY, 3400, 900); g.fillStyle = '#4a372c'; g.fillRect(-1200, GY, 3400, 10);
  g.fillStyle = '#3d5f8f'; g.strokeStyle = OL; g.lineWidth = 5; rr(g, 60, 170, 330, 300, 14); g.fill(); g.stroke(); g.fillStyle = '#ffe9a8'; g.fillRect(84, 194, 134, 252); g.fillRect(232, 194, 134, 252); g.strokeRect(84, 194, 134, 252); g.strokeRect(232, 194, 134, 252);
  clockFace(g, 500, 300, 82, 8, 47, 20 + t * 2); chip(g, '20:47', 500, 415, 28, { col: '#ffb347' });
  g.fillStyle = '#6a4a35'; rr(g, 640, 130, 440, 360, 12); g.fill(); g.stroke(); g.beginPath(); g.moveTo(860, 130); g.lineTo(860, 490); g.stroke(); g.fillStyle = GOLD_LT; g.fillRect(840, 300, 12, 50); g.fillRect(868, 300, 12, 50);
  g.fillStyle = '#7a8aa8'; rr(g, -1200, 1050, 3400, 130, 6); g.fill(); g.stroke(); g.fillStyle = '#c7cfdf'; g.fillRect(-1200, 1040, 3400, 14); g.fillStyle = '#5a6788'; for (let i = -6; i < 12; i++) g.fillRect(i * 195, 1075, 170, 90);
  g.fillStyle = '#2b2f40'; rr(g, 470, 1040, 340, 140, 8); g.fill(); g.stroke(); g.fillStyle = '#e8ebf2'; rr(g, 470, 1010, 340, 36, 8); g.fill(); g.stroke(); g.fillStyle = '#c33'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(505 + i * 75, 1118, 14, 0, 6.29); g.fill(); }
  for (let i = 0; i < 5; i++) { const fh = 22 + Math.sin(t * 17 + i * 2) * 6; g.fillStyle = i % 2 ? '#ff9a3a' : '#4aa8ff'; g.beginPath(); g.moveTo(580 + i * 24, 1010); g.quadraticCurveTo(586 + i * 24, 1010 - fh, 590 + i * 24, 1010 - fh - 6); g.quadraticCurveTo(594 + i * 24, 1010 - fh, 600 + i * 24, 1010); g.fill(); }
  // exit door (hinged at the right edge)
  const dopen = at(t, 4.5, 5.5), da = elastic(dopen) * 1.25, dw = Math.max(30, 190 * Math.cos(da));
  g.fillStyle = '#0c1530'; g.fillRect(890, 330, 190, 850); glow(g, 980, 800, 260, '255,200,120', .12 * dopen); g.strokeStyle = OL; g.lineWidth = 6; g.strokeRect(890, 330, 190, 850);
  g.fillStyle = '#7a5236'; g.beginPath(); g.moveTo(1080 - dw, 340 + (1 - dw / 190) * 40); g.lineTo(1080, 330); g.lineTo(1080, 1180); g.lineTo(1080 - dw, 1180 - (1 - dw / 190) * 30); g.closePath(); g.fill(); g.stroke(); g.fillStyle = GOLD_LT; g.beginPath(); g.arc(1080 - dw + 24, 780, 12, 0, 6.29); g.fill();
  // hero
  const run = at(t, .12, 1.05), brake = at(t, .78, 1.25);
  let x = lerp(-170, 560, ease(run)); let P;
  const Pr = runPose(t * 2.6 * (1 - brake * .8), { amp: 1 - brake * .6, lean: .3 }), Ps = Object.assign({}, POSE0, { th: [.5, .4], sh: [-.2, -.1], lean: -.15, side: 1, ua: [.2, .4], la: [.5, .5], spread: 0 }), stand = Object.assign({}, POSE0, { th: [.12, .2], sh: [-.1, -.2], lean: .1, side: 1, spread: 0 });
  P = mixPose(Pr, Ps, ease(brake)); P = mixPose(P, stand, ease(at(t, 1.2, 1.5)));
  const lid = ease(at(t, 1.5, 1.7)) * (1 - ease(at(t, 2.2, 2.35))), potUp = ease(at(t, 3.0, 3.5)), slip = Math.sin(at(t, 3.65, 4.3) * Math.PI);
  const hipWY = GY - 117 * s, potFix = [640, 1030];
  if (t >= 1.2) {
    x = 560 + 20 * slip; if (t >= 4.1) x = lerp(560, 905, ease(at(t, 4.1, 4.75))) + 330 * ease(at(t, 4.9, 5.5));
    const Pw = runPose(t * 2.2, { amp: .55, lean: .38 }); if (t >= 4.1) P = mixPose(P, Pw, ease(at(t, 4.1, 4.4)));
    P.lean += .2 * slip * Math.sin(t * 12) - .08 * at(t, 3.0, 3.5) * (1 - at(t, 3.5, 3.9)); if (t > 3.6 && t < 4.4) { P.th = [P.th[0] + .5 * slip, P.th[1] - .5 * slip]; }
    P.eye = lerp(1.3, 1.55, lid); if (t > 2.9) P.eye = lerp(1.2, .4, at(t, 3.0, 3.4)); if (t > 4.3) P.eye = lerp(.4, 1.2, at(t, 4.3, 4.5));
    P.mo = lid * .6 + at(t, 3.0, 3.4) * .5 * (1 - at(t, 4.3, 4.5)); P.brt = at(t, 3.0, 3.4) * -.6; P.brow = lid * .9; P.sm = lid * .9 - at(t, 3.0, 3.4) * 1.2; P.px = 1; P.py = lid * .4; P.shadow = true; P.blink = 0;
    const handleFar = [(536 - x) / s, (950 - hipWY) / s], handleNear = [(744 - x) / s, (950 - hipWY) / s], held = [[34, -50], [138, -52]], lidH = [(640 - x) / s, (865 - hipWY - lid * 22 * 1.3) / s];
    const gr = at(t, 2.4, 2.9); let h0 = [lerp(60, handleFar[0], gr), lerp(-50, handleFar[1], gr)], h1 = [lerp(70, handleNear[0], gr), lerp(-60, handleNear[1], gr)];
    if (t < 2.4) h1 = [lerp(90, lidH[0], at(t, 1.2, 1.6)), lerp(-80, lidH[1], at(t, 1.2, 1.6))];
    if (t >= 3.0) { h0 = [lerp(handleFar[0], held[0][0], potUp), lerp(handleFar[1], held[0][1], potUp)]; h1 = [lerp(handleNear[0], held[1][0], potUp), lerp(handleNear[1], held[1][1], potUp)]; }
    P.hands = [h0, h1];
  } else { P.hands = [[34, -50], [100, -80]]; }
  const info = man(g, x, GY, s, 1, L, P, t);
  const heldPos = [info.hip[0] + s * 66, info.hip[1] + s * 8]; let pp = [lerp(potFix[0], heldPos[0], potUp), lerp(potFix[1], heldPos[1], potUp) - Math.sin(potUp * Math.PI) * 30];
  if (t >= 3.5) pp = heldPos; const talk = t < 1.5 ? lidTalk(t, 1) : lidTalk(t, .5, .5);
  const lidO = { lift: Math.max(lid * 22, talk.lift * (1 - lid)), dx: talk.dx + 14 * lid, rot: talk.rot + .25 * lid };
  if (lid > .05) glow(g, pp[0], pp[1] - 100, 200, '255,200,90', .5 * lid);
  const psc = lerp(1.3, .95 * s, potUp);
  pot(g, pp[0], pp[1] + (t < 3.0 ? 4 : 0), psc, { rot: Math.sin(t * 14) * .05 * (slip + (t > 4.1 ? 1 : 0)), lid: lidO, level: 1, t });
  steam(g, pp[0], pp[1] - 130, t * 2, 4, 1.3, lid > .1 ? 1 : .5);
  if (t > 2.5) { for (const h of info.hands) { g.fillStyle = '#d94c3d'; g.strokeStyle = OL; g.lineWidth = 4; g.beginPath(); g.arc(h[0], h[1], 21, 0, 6.29); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(h[0] - 5, h[1] - 5, 4, 0, 6.29); g.fill(); } }
  dust(g, 480, GY, 1.05, t, 1.5); dust(g, 560, GY, 3.8, t, 1.3);
  if (t > 1.2) sweatDrops(g, t, info.head[0], info.head[1], 1, 1, at(t, 3.2, 3.5) * (1 - at(t, 4.4, 4.7)), 0);
  const sp = i => ({ t: 3.7 + i * .09, x: 640 + 30 * Math.sin(i), y: 960, vx: 120 + i * 40, vy: 300 + (i % 3) * 120, r: 8 });
  soupDrops(g, t, 8, sp, GY + 10, { life: 30 }); splats(g, 580, 880, GY, 4, 10, at(t, 3.9, 5.0), 1.2);
  const bg2 = (t - 5.5) / .35; if (bg2 > 0 && bg2 < 1) { g.strokeStyle = `rgba(255,255,255,${1 - bg2})`; g.lineWidth = 10; g.lineCap = 'round'; for (let k = 0; k < 10; k++) { const a = k * .63; g.beginPath(); g.moveTo(1000 + Math.cos(a) * (50 + bg2 * 60), 800 + Math.sin(a) * (70 + bg2 * 90)); g.lineTo(1000 + Math.cos(a) * (100 + bg2 * 120), 800 + Math.sin(a) * (140 + bg2 * 180)); g.stroke(); } }
  g.restore();
}
