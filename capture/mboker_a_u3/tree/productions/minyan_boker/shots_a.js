// ---------- shot 1: night bedroom, alarm clock 05:40, hand taps it off ----------
function seg7(g, x, y, w, h, d, col) {
  const S = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcfgd' }[d], th = w * .2;
  const r = { a: [x + th * .6, y, w - th * 1.2, th], g: [x + th * .6, y + h / 2 - th / 2, w - th * 1.2, th], d: [x + th * .6, y + h - th, w - th * 1.2, th],
    f: [x, y + th * .6, th, h / 2 - th * .9], b: [x + w - th, y + th * .6, th, h / 2 - th * .9], e: [x, y + h / 2 + th * .3, th, h / 2 - th * .9], c: [x + w - th, y + h / 2 + th * .3, th, h / 2 - th * .9] };
  g.fillStyle = col; for (const k of S) { const q = r[k]; g.beginPath(); g.roundRect(q[0], q[1], q[2], q[3], th / 2); g.fill(); }
}
function s1(g, lt) {
  const t = Math.max(lt, 0), p = ease(t / 6.3);
  g.save(); cam(g, lerp(540, 575, p), lerp(790, 1075, p), lerp(1.06, 1.3, p));
  let bg = g.createLinearGradient(0, -300, 0, 1700); bg.addColorStop(0, '#060b1d'); bg.addColorStop(1, '#131d3c'); g.fillStyle = bg; g.fillRect(-500, -500, W + 1000, H + 1000);
  // window
  g.save(); archPath(g, 300, 780, 170, 900); g.clip();
  const sk = g.createLinearGradient(0, 170, 0, 900); sk.addColorStop(0, '#040818'); sk.addColorStop(1, '#1b2d5e'); g.fillStyle = sk; g.fillRect(280, 150, 520, 780);
  stars(g, t, 1, 780, 300, 480);
  g.fillStyle = '#f4ecd2'; g.beginPath(); g.arc(660, 330, 38, 0, 6.29); g.fill(); g.fillStyle = '#0a1230'; g.beginPath(); g.arc(644, 320, 34, 0, 6.29); g.fill();
  glow(g, 660, 330, 150, '190,210,255', .18);
  ridge(g, rg(790, 22, .012, 1, 10, .03, 2), '#0a1230', 960);
  ridge(g, rg(850, 16, .02, 3, 8, .05, 1), '#070d22', 960);
  const lights = [[350, 838], [412, 830], [575, 826], [700, 842], [745, 834]];
  lights.forEach((l, i) => { const on = clamp((t - (.4 + i * .55)) / .3) * (i === 2 ? 1 : .8 + .2 * Math.sin(t * 2 + i)); g.fillStyle = `rgba(255,200,110,${on * (i < 2 ? 1 : .0) + (i >= 2 ? on * .9 : 0)})`; g.fillRect(l[0], l[1], 7, 8); });
  g.restore();
  g.strokeStyle = '#2c2a4e'; g.lineWidth = 16; g.lineJoin = 'round'; archPath(g, 300, 780, 170, 900); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(540, 170); g.lineTo(540, 900); g.moveTo(300, 560); g.lineTo(780, 560); g.stroke();
  g.fillStyle = '#3a3558'; g.fillRect(262, 900, 556, 28);
  // curtains
  const sw = Math.sin(t * .6) * 4;
  for (const sd of [1, -1]) { const x0 = sd > 0 ? 300 : 780; const cg = g.createLinearGradient(x0 - sd * 200, 0, x0 + sd * 90, 0); cg.addColorStop(0, '#1b2a58'); cg.addColorStop(.5, '#13204a'); cg.addColorStop(1, '#0f1a3c'); g.fillStyle = cg;
    g.beginPath(); g.moveTo(x0 + sd * 40, 120); g.lineTo(x0 - sd * 220, 120); g.lineTo(x0 - sd * 250 + sw, 930); g.quadraticCurveTo(x0 - sd * 60, 880, x0 + sd * 4 + sw, 930); g.quadraticCurveTo(x0 - sd * 20, 520, x0 + sd * 40, 120); g.fill();
    g.strokeStyle = 'rgba(120,150,220,.10)'; g.lineWidth = 6; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x0 - sd * (50 + i * 55), 130); g.quadraticCurveTo(x0 - sd * (60 + i * 55) + sw, 520, x0 - sd * (55 + i * 55) + sw, 900); g.stroke(); } }
  g.fillStyle = '#2a2748'; g.fillRect(0, 108, W, 16);
  // moonlight shaft
  const ms = g.createLinearGradient(0, 900, 0, 1500); ms.addColorStop(0, 'rgba(150,180,235,.13)'); ms.addColorStop(1, 'rgba(150,180,235,0)');
  g.fillStyle = ms; g.beginPath(); g.moveTo(310, 928); g.lineTo(770, 928); g.lineTo(980, 1520); g.lineTo(120, 1520); g.closePath(); g.fill();
  // nightstand
  g.fillStyle = '#2d2442'; g.fillRect(-300, 1228, W + 600, 34); g.fillStyle = '#1d1731'; g.fillRect(-300, 1262, W + 600, 700);
  g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(-300, 1228, W + 600, 4);
  // objects: siddur and kippa
  g.fillStyle = '#5a3a24'; g.beginPath(); g.roundRect(150, 1160, 160, 68, 6); g.fill(); g.fillStyle = GOLD_LT; g.fillRect(160, 1172, 140, 3); g.fillRect(160, 1214, 140, 3);
  g.fillStyle = '#16275a'; g.beginPath(); g.ellipse(880, 1228, 78, 26, 0, Math.PI, 0); g.fill();
  // clock
  const ring = t < 3.55, press = clamp(1 - Math.abs(t - 3.62) / .16), lvl = t < 3.55 ? 1 : lerp(1, .45, ease((t - 3.55) / .4));
  const sx = ring ? Math.sin(t * 70) * 3.5 : 0, cx = 540 + sx, cb = 1228;
  glow(g, 540, 1120, 520, '255,170,80', .30 * lvl);
  if (ring) for (let i = 0; i < 3; i++) { const ph = ((t * 2.2 + i / 3) % 1), r = 235 + ph * 90; g.strokeStyle = `rgba(255,190,110,${(1 - ph) * .55})`; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(540, 1120, r, Math.PI - .55, Math.PI + .55); g.stroke(); g.beginPath(); g.arc(540, 1120, r, -.55, .55); g.stroke(); }
  g.save(); g.translate(cx, cb); g.scale(1 + press * .02, 1 - press * .06);
  g.fillStyle = '#1b1b2a'; g.beginPath(); g.roundRect(-195, -176, 390, 176, 28); g.fill(); g.fillStyle = '#2a2a3d'; g.beginPath(); g.roundRect(-195, -176, 390, 18, [28, 28, 0, 0]); g.fill();
  g.fillStyle = '#05060c'; g.beginPath(); g.roundRect(-165, -146, 330, 116, 12); g.fill();
  const dc = `rgba(255,${Math.round(168 * lvl + 30)},${Math.round(70 * lvl + 20)},${.35 + .65 * lvl})`;
  const dw = 54, dh = 84, gap = 16, tot = 4 * dw + 3 * gap + 36; let x = -tot / 2; const ds = [0, 5, 4, 0];
  ds.forEach((d, i) => { seg7(g, x, -128, dw, dh, d, dc); x += dw + gap; if (i === 1) { const on = Math.floor(t * 2) % 2 === 0 || !ring; g.fillStyle = on ? dc : 'rgba(255,170,70,.12)'; g.beginPath(); g.arc(x - gap + 10, -102, 6, 0, 6.29); g.arc(x - gap + 10, -66, 6, 0, 6.29); g.fill(); x += 20; } });
  g.fillStyle = ring ? `rgba(255,120,80,${.5 + .5 * Math.sin(t * 14)})` : 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(-146, -36, 5, 0, 6.29); g.fill();
  g.fillStyle = '#0d0d18'; g.fillRect(-160, 0, 26, 12); g.fillRect(134, 0, 26, 12);
  g.fillStyle = '#2f2f46'; g.beginPath(); g.arc(-150, -178, 12, Math.PI, 0); g.arc(150, -178, 12, Math.PI, 0); g.fill();
  g.restore();
  // hand taps the clock
  const ap = ease((t - 2.5) / .95), rt = ease((t - 3.85) / .9), k = ap * (1 - rt), tapY = 1010 + press * 26;
  if (k > 0) {
    const sxp = 1330, syp = 1480, tx = 590, ty = tapY, X = lerp(sxp, tx, k), Y = lerp(syp, ty, k), dx = sxp - tx, dy = syp - 1010, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    g.save(); g.lineCap = 'round';
    g.strokeStyle = '#1f2f62'; g.lineWidth = 112; g.beginPath(); g.moveTo(X + ux * 170, Y + uy * 170); g.lineTo(X + ux * 620, Y + uy * 620); g.stroke();
    g.strokeStyle = '#85604a'; g.lineWidth = 86; g.beginPath(); g.moveTo(X, Y); g.lineTo(X + ux * 190, Y + uy * 190); g.stroke();
    g.strokeStyle = '#966f56'; g.lineWidth = 36; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(X + i * 26, Y - 14); g.lineTo(X + i * 26 - ux * 20, Y - 14 - uy * 20); g.stroke(); }
    glow(g, X, Y, 140, '255,170,80', .22 * lvl);
    g.restore();
  }
  g.restore();
  // vignette
  const v = g.createRadialGradient(540, 900, 500, 540, 900, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,10,.45)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- shot 2: empty street before dawn, a young man with a tallit bag ----------
const F2 = 720, HY2 = 985, CH2 = 1.6;
function s2(g, lt) {
  const t = Math.max(lt, 0), cz = t * .95, k = .13 + .05 * clamp(t / 6);
  const PX = (X, Z, cx) => 540 + (X - cx) * F2 / Z, PY = Z => HY2 + CH2 * F2 / Z;
  const camx = Math.sin(t * .35) * .18, bob = Math.sin(t * 5.5) * 3;
  g.save(); g.translate(0, bob); g.translate(540, 985); g.scale(1.04, 1.04); g.translate(-540, -985);
  const sky = g.createLinearGradient(0, -200, 0, HY2); sky.addColorStop(0, '#050a1e'); sky.addColorStop(.6, mix('#13244f', '#3b5f98', k)); sky.addColorStop(1, mix('#2a3f70', '#e49a68', k * 1.6));
  g.fillStyle = sky; g.fillRect(-300, -300, W + 600, HY2 + 300);
  stars(g, t, 1 - k * 2.2, 700);
  g.fillStyle = '#f4ecd2'; g.beginPath(); g.arc(210, 210, 40, 0, 6.29); g.fill(); g.fillStyle = '#0c1634'; g.beginPath(); g.arc(194, 198, 35, 0, 6.29); g.fill();
  glow(g, 560, HY2, 700, '255,170,110', .28 + k);
  ridge(g, rg(900, 36, .006, .5, 14, .017, 2), mix('#14214a', '#4a4f82', k), HY2 + 10);
  ridge(g, rg(950, 26, .005, 2.1, 12, .02, .4), mix('#0f1a3f', '#383f70', k), HY2 + 10);
  // distant houses on the far ridge
  for (let i = 0; i < 9; i++) { const hx = 40 + i * 118 + (i % 3) * 14, hy = 962 + (i % 2) * 6; g.fillStyle = '#0a1330'; g.fillRect(hx, hy - 24, 34, 24); g.beginPath(); g.moveTo(hx - 4, hy - 24); g.lineTo(hx + 17, hy - 40); g.lineTo(hx + 38, hy - 24); g.fill(); if (i % 3 === 1) { g.fillStyle = `rgba(255,205,120,${clamp((t - .3 * i) / .5) * .9})`; g.fillRect(hx + 12, hy - 18, 8, 9); } }
  // ground
  g.fillStyle = '#0a1228'; g.fillRect(-300, HY2, W + 600, 1200);
  const road = g.createLinearGradient(0, HY2, 0, 1960); road.addColorStop(0, '#2a3a66'); road.addColorStop(1, '#161f3c');
  g.fillStyle = road; g.beginPath(); g.moveTo(PX(-1.9, 400, camx), PY(400)); g.lineTo(PX(1.9, 400, camx), PY(400)); g.lineTo(PX(1.9, 1.1, camx), PY(1.1)); g.lineTo(PX(-1.9, 1.1, camx), PY(1.1)); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(160,180,230,.18)'; g.lineWidth = 3; for (const X of [-1.9, 1.9]) { g.beginPath(); g.moveTo(PX(X, 400, camx), PY(400)); g.lineTo(PX(X, 1.1, camx), PY(1.1)); g.stroke(); }
  // dashes
  for (let i = 0; i < 14; i++) { const Z = 1.6 + i * 2.2 - (cz % 2.2); if (Z < 1.2) continue; const a = PX(-.07, Z, camx), b = PX(.07, Z, camx), Z2 = Z + .9; g.fillStyle = 'rgba(190,200,235,.16)'; g.beginPath(); g.moveTo(a, PY(Z)); g.lineTo(b, PY(Z)); g.lineTo(PX(.07, Z2, camx), PY(Z2)); g.lineTo(PX(-.07, Z2, camx), PY(Z2)); g.closePath(); g.fill(); }
  // scenery items far -> near
  const items = [];
  for (let i = 0; i < 9; i++) { const Z = 3.2 + i * 4.4 - (cz % 4.4); if (Z > 1.5) { items.push({ Z, t: 'lamp', X: -2.5 }); items.push({ Z: Z + 2.2, t: 'lamp', X: 2.55 }); } }
  for (let i = 0; i < 6; i++) { const Z = 4 + i * 7 - (cz % 7); if (Z > 1.6) { items.push({ Z, t: 'house', X: -6.2, id: Math.round((cz - cz % 7) / 7) + i }); items.push({ Z: Z + 3.5, t: 'house', X: 6.4, id: 100 + Math.round((cz - cz % 7) / 7) + i }); } }
  const Zw = 3.4 + t * .1; items.push({ Z: Zw, t: 'walker' });
  items.sort((a, b) => b.Z - a.Z);
  for (const it of items) {
    const Z = it.Z, sc = F2 / Z, gy = PY(Z);
    if (it.t === 'lamp') {
      const x = PX(it.X, Z, camx), hgt = 4.3 * sc, sg = it.X < 0 ? 1 : -1; g.strokeStyle = '#05091c'; g.lineWidth = Math.max(3, .13 * sc); g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, gy); g.lineTo(x, gy - hgt); g.quadraticCurveTo(x, gy - hgt - .35 * sc, x + sg * .6 * sc, gy - hgt - .3 * sc); g.stroke();
      const lx = x + sg * .62 * sc, ly = gy - hgt - .22 * sc;
      glow(g, lx, ly, 3.2 * sc, '255,196,110', .55); g.fillStyle = '#ffe3a0'; g.beginPath(); g.ellipse(lx, ly, .22 * sc, .09 * sc, 0, 0, 6.29); g.fill();
      g.save(); g.translate(lx, gy); g.scale(1, .22); glow(g, 0, 0, 2.6 * sc, '255,190,100', .38); g.restore();
    } else if (it.t === 'house') {
      const x0 = PX(it.X - 1.9, Z, camx), x1 = PX(it.X + 1.9, Z, camx), hgt = 3.2 * sc, r = rng(it.id * 13 + 5);
      g.fillStyle = '#0c1531'; g.fillRect(x0, gy - hgt, x1 - x0, hgt); g.fillStyle = '#080f27'; g.beginPath(); g.moveTo(x0 - 6, gy - hgt); g.lineTo((x0 + x1) / 2, gy - hgt - 1.2 * sc); g.lineTo(x1 + 6, gy - hgt); g.closePath(); g.fill();
      for (let w = 0; w < 2; w++) { const lit = r() > .55; g.fillStyle = lit ? 'rgba(255,200,110,.9)' : '#0a1230'; g.fillRect(x0 + (.5 + w * 2.0) * sc * .95, gy - 2.4 * sc, .8 * sc, 1.0 * sc); }
      g.fillStyle = '#070d22'; g.fillRect((x0 + x1) / 2 - .35 * sc, gy - 1.5 * sc, .7 * sc, 1.5 * sc);
    } else {
      const s = (1.75 * sc) / 505, x = PX(.35, Z, camx) , hip = gy - 205 * s, ph = t;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, gy, 60 * s, 12 * s, 0, 0, 6.29); g.fill();
      legs(g, x, hip, s, ph, '#070c1e');
      bag(g, x + 98 * s, hip - 170 * s, s * 1.0, Math.sin(ph * 5.5) * .12);
      man(g, x, hip, s, { col: '#0a1129', kc: '#0f1b45', rim: 'rgba(255,196,120,.35)', sway: Math.sin(ph * 5.5) * .018 });
    }
  }
  // mist
  const mg = g.createLinearGradient(0, HY2 - 80, 0, HY2 + 140); mg.addColorStop(0, 'rgba(140,170,220,0)'); mg.addColorStop(.5, 'rgba(160,185,230,.14)'); mg.addColorStop(1, 'rgba(140,170,220,0)'); g.fillStyle = mg; g.fillRect(-300, HY2 - 80, W + 600, 220);
  g.restore();
  const v = g.createRadialGradient(540, 900, 500, 540, 900, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,10,.4)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- shot 3: small synagogue, windows glowing, door opens, light spills ----------
function star6(g, x, y, r, col) { g.fillStyle = col; for (const d of [0, 1]) { g.beginPath(); for (let i = 0; i < 3; i++) { const a = (i * 2 * Math.PI) / 3 + (d ? Math.PI / 3 : 0) - Math.PI / 2; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fill(); } }
function s3(g, lt) {
  const t = Math.max(lt, 0), p = ease(t / 6.3), k = .16 + .06 * p, GY = 1300, open = ease((t - 2.1) / .9);
  g.save(); cam(g, lerp(540, 540, p), lerp(1020, 1130, p), lerp(1.04, 1.24, p));
  const sky = g.createLinearGradient(0, -300, 0, GY); sky.addColorStop(0, '#050a1e'); sky.addColorStop(.6, mix('#13244f', '#40649c', k)); sky.addColorStop(1, mix('#2a3f70', '#f0a572', k * 1.5));
  g.fillStyle = sky; g.fillRect(-400, -500, W + 800, GY + 500);
  stars(g, t, 1 - k * 2.6, 760);
  glow(g, 300, GY, 800, '255,170,110', .22 + k * .6);
  ridge(g, rg(1010, 40, .005, .5, 16, .015, 2), mix('#14214a', '#4d527f', k), GY + 30);
  ridge(g, rg(1100, 30, .006, 2.1, 12, .02, .4), mix('#0e1a3e', '#363e70', k), GY + 30);
  // cypress trees
  for (const [x, h, id] of [[110, 330, 1], [960, 380, 2], [60, 240, 3]]) { g.fillStyle = '#071029'; g.beginPath(); g.moveTo(x, GY); g.quadraticCurveTo(x - 46, GY - h * .5, x, GY - h); g.quadraticCurveTo(x + 46, GY - h * .5, x, GY); g.fill(); }
  g.fillStyle = '#09112a'; g.fillRect(-400, GY, W + 800, 900);
  // path
  const pg = g.createLinearGradient(0, GY, 0, 1700); pg.addColorStop(0, '#2c3a68'); pg.addColorStop(1, '#1a2447');
  g.fillStyle = pg; g.beginPath(); g.moveTo(490, GY); g.lineTo(590, GY); g.lineTo(980, 1800); g.lineTo(100, 1800); g.closePath(); g.fill();
  // building
  const wall = mix('#1a2757', '#4b5483', k);
  g.fillStyle = wall; g.fillRect(220, 880, 640, 420);
  g.fillStyle = mix('#0f1a3e', '#352f58', k); g.beginPath(); g.moveTo(186, 884); g.lineTo(540, 700); g.lineTo(894, 884); g.lineTo(860, 900); g.lineTo(540, 748); g.lineTo(240, 900); g.closePath(); g.fill();
  g.fillStyle = mix('#243263', '#575b8a', k); g.beginPath(); g.moveTo(240, 884); g.lineTo(540, 728); g.lineTo(840, 884); g.closePath(); g.fill();
  star6(g, 540, 810, 30, GOLD_LT);
  g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(220, 880, 640, 8); g.fillStyle = '#0c1534'; g.fillRect(205, 1290, 670, 20);
  // windows
  [290, 410, 670, 790].forEach((wx, i) => {
    const on = back((t - (.5 + i * .35)) / .5), al = clamp(on); const x0 = wx - 38, x1 = wx + 38;
    glow(g, wx, 1060, 220 * al, '255,200,110', .55 * al);
    g.fillStyle = mix('#0b1230', '#ffd988', al); archPath(g, x0, x1, 950, 1150); g.fill();
    g.fillStyle = mix('#0b1230', '#ffc260', al); g.fillRect(x0, 1060, x1 - x0, 90);
    g.strokeStyle = '#0c1534'; g.lineWidth = 6; archPath(g, x0, x1, 950, 1150); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(wx, 960); g.lineTo(wx, 1150); g.moveTo(x0, 1070); g.lineTo(x1, 1070); g.stroke();
  });
  // door + spill
  const dx0 = 478, dx1 = 602, dtop = 1060;
  const spill = g.createLinearGradient(0, GY, 0, 1700); spill.addColorStop(0, `rgba(255,214,130,${.75 * open})`); spill.addColorStop(1, 'rgba(255,214,130,0)');
  g.fillStyle = spill; g.beginPath(); g.moveTo(dx0 + 6, GY); g.lineTo(dx1 - 6, GY); g.lineTo(540 + 330 * open, 1700); g.lineTo(540 - 330 * open, 1700); g.closePath(); g.fill();
  const ig = g.createLinearGradient(0, dtop, 0, GY); ig.addColorStop(0, mix('#0a1030', '#ffe7a8', open)); ig.addColorStop(1, mix('#0a1030', '#ffc060', open));
  g.fillStyle = ig; archPath(g, dx0, dx1, dtop, GY); g.fill();
  // person walks in
  const w1 = clamp((t - .3) / 3.5), w2 = clamp((t - 3.9) / 2.2);
  const manAt = (u, fromX, fromY, toX, toY, sc0, sc1, a) => { const x = lerp(fromX, toX, u), y = lerp(fromY, toY, u), s = lerp(sc0, sc1, u); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x, y, 40 * s, 9 * s, 0, 0, 6.29); g.fill(); legs(g, x, y - 205 * s, s, t, '#05091c'); bag(g, x + 98 * s, y - 375 * s, s, Math.sin(t * 5.5) * .1); man(g, x, y - 205 * s, s, { col: '#060b20', kc: '#0d1642', rim: 'rgba(255,205,120,.45)' }); g.restore(); };
  manAt(w1, 150, 1620, 530, 1310, .62, .30, (1 - ease((t - 3.5) / .5)) * ease(t / .5));
  manAt(w2, 960, 1560, 560, 1310, .58, .30, (1 - ease((t - 6.0) / .5)) * ease((t - 3.9) / .4));
  // door panel (swings open, left hinge)
  const pw = (dx1 - dx0) * Math.cos(open * 1.25);
  g.fillStyle = '#3a2a24'; g.beginPath(); g.moveTo(dx0, GY); g.lineTo(dx0, dtop + 62); g.arc(dx0 + (dx1 - dx0) / 2 * Math.cos(open * 1.25) , dtop + 62, (dx1 - dx0) / 2 * Math.cos(open * 1.25), Math.PI, 0); g.lineTo(dx0 + pw, GY); g.closePath(); g.fill();
  g.strokeStyle = GOLD_LT; g.lineWidth = 6; archPath(g, dx0 - 3, dx1 + 3, dtop - 3, GY); g.stroke();
  // light rays
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,205,120,${.05 * open})`; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(540 + i * 6, GY - 80); g.lineTo(540 + i * 150, 1750); g.lineTo(540 + i * 150 + 60, 1750); g.lineTo(540 + i * 6 + 12, GY - 80); g.fill(); } g.restore();
  // foreground bushes
  g.fillStyle = '#050a1d'; for (const [x, r] of [[40, 130], [150, 90], [930, 120], [1050, 140]]) { g.beginPath(); g.ellipse(x, 1520, r, r * .6, 0, Math.PI, 0); g.fill(); g.fillRect(x - r, 1520, 2 * r, 300); }
  g.restore();
  const v = g.createRadialGradient(540, 900, 500, 540, 900, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,10,.4)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- shot 4: table, open Gemaras, coffee, finger on the page ----------
function s4(g, lt) {
  const t = Math.max(lt, 0), p = ease(t / 6.3);
  g.save(); cam(g, lerp(470, 610, p), 1030, lerp(1.08, 1.2, p));
  const wallg = g.createLinearGradient(0, -200, 0, 1100); wallg.addColorStop(0, '#2a2140'); wallg.addColorStop(1, '#4a3550'); g.fillStyle = wallg; g.fillRect(-400, -400, W + 800, 1500);
  // window with dawn
  g.save(); archPath(g, 760, 980, 260, 820); g.clip(); const wk = g.createLinearGradient(0, 260, 0, 820); wk.addColorStop(0, '#1d3466'); wk.addColorStop(1, '#e8a06c'); g.fillStyle = wk; g.fillRect(740, 240, 260, 600);
  ridge(g, rg(790, 14, .03, 1, 6, .08, 2), '#241f45', 840); g.restore();
  g.strokeStyle = '#6b4a34'; g.lineWidth = 14; archPath(g, 760, 980, 260, 820); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(870, 260); g.lineTo(870, 820); g.moveTo(760, 560); g.lineTo(980, 560); g.stroke();
  glow(g, 870, 700, 520, '255,170,110', .22);
  // bookshelf left
  g.fillStyle = '#3a2413'; g.fillRect(40, 220, 380, 560); const r = rng(11), pal = ['#5b2a2a', '#1c2f55', '#3d4a2a', '#6b4a1f', '#2a3558', '#7a1f2b', '#4a3524'];
  for (let j = 0; j < 4; j++) { let x = 54; const base = 360 + j * 140; while (x < 400) { const w = 20 + r() * 20, h = 90 + r() * 30; g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x, base - h, w, h); g.fillStyle = GOLD_LT; g.fillRect(x + 3, base - h + 12, w - 6, 3); x += w + 2; } g.fillStyle = '#6b4526'; g.fillRect(40, base, 380, 12); }
  // lamp
  g.strokeStyle = '#2a1d14'; g.lineWidth = 5; g.beginPath(); g.moveTo(540, -200); g.lineTo(540, 330); g.stroke();
  glow(g, 540, 420, 760, '255,205,130', .5 + .02 * Math.sin(t * 9));
  g.fillStyle = GOLD; g.beginPath(); g.moveTo(480, 410); g.lineTo(512, 330); g.lineTo(568, 330); g.lineTo(600, 410); g.closePath(); g.fill(); g.fillStyle = '#fff1be'; g.beginPath(); g.ellipse(540, 412, 58, 11, 0, 0, 6.29); g.fill();
  // men across the table (soft silhouettes, bowing over the books)
  [[230, 1.0, 0], [540, 1.12, 1.7], [850, 1.0, 3.1]].forEach(([x, s, ph]) => {
    const bow = (Math.sin(t * 1.1 + ph) * .5 + .5) * .09; man(g, x, 1010, s * 1.05, { col: '#150f2a', kc: '#241a4a', rim: 'rgba(255,205,130,.55)', lean: bow * (x < 540 ? -1 : 1) * 1, sway: 0 });
  });
  // table
  const tg = g.createLinearGradient(0, 1000, 0, 1600); tg.addColorStop(0, '#7b5130'); tg.addColorStop(1, '#4e311c');
  g.fillStyle = tg; g.beginPath(); g.moveTo(-60, 1006); g.lineTo(1140, 1006); g.lineTo(1320, 1700); g.lineTo(-240, 1700); g.closePath(); g.fill();
  g.fillStyle = '#9a6a3f'; g.fillRect(-60, 1000, 1200, 10);
  glow(g, 540, 1260, 640, '255,215,150', .38);
  // books
  const fl = t0 => (t - t0) / .8;
  g.save(); g.translate(540, 1300); g.scale(1.9, 1.9); g.translate(-540, -1300); book(g, 540, 1300, 230, fl(2.4) < 1 ? fl(2.4) : fl(5.0)); g.restore();
  g.save(); g.translate(250, 1190); g.scale(1.5, 1.5); g.translate(-250, -1190); book(g, 250, 1190, 200, fl(1.0) < 1 ? fl(1.0) : fl(3.8)); g.restore();
  g.save(); g.translate(830, 1180); g.scale(1.5, 1.5); g.translate(-830, -1180); book(g, 830, 1180, 200, fl(3.2) < 1 ? fl(3.2) : fl(5.4)); g.restore();
  g.save(); g.translate(130, 1130); g.scale(1.5, 1.5); g.translate(-130, -1130); cup(g, 130, 1130, t); g.restore();
  g.save(); g.translate(950, 1118); g.scale(1.5, 1.5); g.translate(-950, -1118); cup(g, 950, 1118, t + .4); g.restore();
  // pointing hand along the lines
  const hp = (t * .35) % 1, fx = lerp(640, 450, ease(hp)), fy = 1256 + Math.sin(hp * 12.5) * 4 + hp * 28, ha = ease((t - .3) / .8);
  if (ha > 0) { g.save(); g.globalAlpha = ha; g.lineCap = 'round';
    g.strokeStyle = '#f2ead8'; g.lineWidth = 112; g.beginPath(); g.moveTo(fx + 260, fy + 330); g.lineTo(fx + 380, fy + 760); g.stroke();
    g.strokeStyle = '#c8987a'; g.lineWidth = 92; g.beginPath(); g.moveTo(fx + 215, fy + 230); g.lineTo(fx + 250, fy + 340); g.stroke();
    g.beginPath(); g.fillStyle = '#c8987a'; g.ellipse(fx + 190, fy + 190, 66, 78, .35, 0, 6.29); g.fill();
    g.lineWidth = 30; g.strokeStyle = '#d3a587'; g.beginPath(); g.moveTo(fx + 170, fy + 130); g.lineTo(fx + 6, fy + 6); g.stroke(); g.restore(); }
  g.restore();
  const v = g.createRadialGradient(540, 900, 500, 540, 900, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,10,.4)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- shot 5: first sun rays over the Judean desert hills ----------
function s5(g, lt) {
  const t = Math.max(lt, 0), p = ease(t / 6.3), k = lerp(.3, 1, ease(t / 5.6));
  g.save(); cam(g, 540, lerp(1000, 880, p), lerp(1.06, 1.22, p));
  const sky = g.createLinearGradient(0, -400, 0, 1250); sky.addColorStop(0, mix3('#08122e', '#27407a', '#5fa4e0', k)); sky.addColorStop(.6, mix3('#1b2d5d', '#c9788a', '#f6c98a', k)); sky.addColorStop(1, mix3('#2c3b6c', '#f5a05f', '#ffe39a', k));
  g.fillStyle = sky; g.fillRect(-500, -600, W + 1000, 1900);
  stars(g, t, clamp(1 - k * 3), 700);
  const sp = ease((t - .2) / 5.5), sx = 640, sy = lerp(1160, 850, sp);
  glow(g, sx, sy, 1050, '255,205,130', .55 * clamp((k - .2) * 2));
  g.save(); g.translate(sx, sy); g.rotate(t * .08); g.fillStyle = `rgba(255,236,170,${.14 * sp})`; for (let i = 0; i < 16; i++) { g.rotate(6.283 / 16); g.beginPath(); g.moveTo(0, 0); g.lineTo(-40, -1500); g.lineTo(40, -1500); g.closePath(); g.fill(); } g.restore();
  const sg = g.createRadialGradient(sx - 20, sy - 20, 8, sx, sy, 120); sg.addColorStop(0, '#fffbe6'); sg.addColorStop(1, '#ffc94f'); g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, 110, 0, 6.29); g.fill();
  // desert ridges (sun rises behind the farthest ones)
  const L = [[1040, 42, .0055, .4, '#2a3568', '#d58f66'], [1090, 34, .0068, 1.9, '#1f2a59', '#c27a58'], [1160, 40, .0048, 3.1, '#18224b', '#a8604a'], [1240, 36, .0062, 4.4, '#111a3b', '#8a4a40'], [1340, 30, .0075, .8, '#0b1330', '#5c3338']];
  L.forEach(([b, a, f, ph, c0, c1], i) => { ridge(g, rg(b - sp * 18 * (i === 0), a, f, ph, a * .35, f * 2.7, ph + 1), mix(c0, c1, clamp((k - .15) * 1.15)), 1700);
    if (i < 4) { g.save(); g.globalCompositeOperation = 'lighter'; ridge(g, rg(b + 2, a, f, ph, a * .35, f * 2.7, ph + 1), `rgba(255,190,110,${.05 * k})`, 1700); g.restore(); } });
  // shul on the ridge + a few palms
  g.fillStyle = mix('#0e1738', '#5a3a3c', k); g.fillRect(180, 1120, 64, 36); g.beginPath(); g.moveTo(172, 1120); g.lineTo(212, 1094); g.lineTo(252, 1120); g.fill(); g.fillStyle = `rgba(255,205,120,${1 - k * .6})`; g.fillRect(200, 1130, 8, 14);
  for (const x of [820, 870, 905]) { g.strokeStyle = mix('#0b1330', '#3f2a30', k); g.lineWidth = 6; g.beginPath(); g.moveTo(x, 1240); g.quadraticCurveTo(x + 6, 1190, x, 1150); g.stroke(); g.fillStyle = g.strokeStyle; g.beginPath(); g.ellipse(x, 1150, 30, 11, 0, 0, 6.29); g.fill(); }
  // birds
  if (k > .6) { g.strokeStyle = `rgba(18,35,63,${.8 * clamp((k - .6) * 5)})`; g.lineWidth = 4; g.lineCap = 'round'; for (let i = 0; i < 5; i++) { const bx = ((t * (40 + i * 8) + i * 230) % (W + 240)) - 120, by = 520 + i * 52 + 14 * Math.sin(t * 1.3 + i), f = 10 * Math.sin(t * 7 + i * 2), z = 16 + i * 2; g.beginPath(); g.moveTo(bx - z, by - f); g.quadraticCurveTo(bx - z / 2, by - 8, bx, by); g.quadraticCurveTo(bx + z / 2, by - 8, bx + z, by - f); g.stroke(); } }
  // dust motes
  const r = rng(3); for (let i = 0; i < 26; i++) { const x = r() * W, y = 700 + r() * 800, ph = r() * 6.28; g.globalAlpha = .35 * clamp((k - .3) * 2) * (.5 + .5 * Math.sin(t * 1.3 + ph)); g.fillStyle = '#ffe9b0'; g.beginPath(); g.arc(x + 20 * Math.sin(t * .4 + ph), y - ((t * 14 + i * 30) % 120), 2.5, 0, 6.29); g.fill(); } g.globalAlpha = 1;
  g.restore();
}
