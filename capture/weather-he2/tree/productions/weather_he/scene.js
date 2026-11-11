// Deterministic scene: everything is a function of t. Captured via __seek(t). No people: a cartoon cloud with a face + objects + charts.
const c = document.getElementById('c'), g = c.getContext('2d'), W = 1920, H = 1080;
const TX = window.TX, TL = window.TL;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const back = x => { x = clamp(x); const k = 1.4; return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const NAVY = '#12305e', GREEN = '#1f9d6b', SLATE = '#6a7fb5', BLUE = '#2b7de9', ORANGE = '#f2a33a', RED = '#e5484d';
const FONT = 'Assistant, Arial, sans-serif';
window.__dur = TL.total;

function txt(s, x, y, size, color, al, weight, align) {
  g.save(); g.globalAlpha *= al === undefined ? 1 : al; g.font = (weight || 700) + ' ' + size + 'px ' + FONT;
  g.fillStyle = color || NAVY; g.direction = 'rtl'; g.textAlign = align || 'center'; g.textBaseline = 'middle';
  g.fillText(s, x, y); g.restore();
}
function rr(x, y, w, h, r, fill, al) {
  g.save(); g.globalAlpha *= al === undefined ? 1 : al; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore();
}
function circ(x, y, r, fill, al) { g.save(); g.globalAlpha *= al === undefined ? 1 : al; g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); g.restore(); }

function talking(t) {
  for (const s of TL.scenes) for (const q of s.cues) if (t >= q[0] && t <= q[1]) return 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3));
  return 0;
}
// cartoon cloud with a face
function cloud(x, y, s, t, mood, tint) {
  const m = talking(t), bob = Math.sin(t * 1.7) * 8 * s;
  g.save(); g.translate(x, y + bob); g.scale(s, s);
  const body = tint || '#ffffff';
  g.fillStyle = 'rgba(30,60,110,.12)'; g.beginPath(); g.ellipse(0, 120, 150, 18, 0, 0, 6.3); g.fill();
  g.lineWidth = 8; g.strokeStyle = '#9db8dd'; g.fillStyle = body;
  const blobs = [[-95, 30, 70], [-40, -30, 85], [40, -45, 95], [100, 5, 75], [0, 40, 95]];
  for (const b of blobs) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, 6.3); g.stroke(); }
  for (const b of blobs) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, 6.3); g.fill(); }
  const blink = ((t + .6) % 3.2) < .13 ? 0.15 : 1;
  for (const ex of [-38, 38]) {
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex, 10, 20, 24 * blink, 0, 0, 6.3); g.fill();
    g.lineWidth = 4; g.strokeStyle = NAVY; g.stroke();
    g.fillStyle = NAVY; g.beginPath(); g.ellipse(ex + 3, 12, 9, 11 * blink, 0, 0, 6.3); g.fill();
  }
  g.fillStyle = 'rgba(255,140,140,.45)'; g.beginPath(); g.arc(-72, 45, 14, 0, 6.3); g.arc(72, 45, 14, 0, 6.3); g.fill();
  g.strokeStyle = NAVY; g.lineWidth = 5; g.fillStyle = '#8b2f3a'; g.beginPath();
  const mo = m * 20 + 3, sm = mood === 'sad' ? -10 : 9;
  g.moveTo(-22, 58); g.quadraticCurveTo(0, 58 + sm + mo * 1.4, 22, 58); g.quadraticCurveTo(0, 58 + mo * 1.2 - (mood === 'sad' ? 0 : 0), -22, 58);
  g.fill(); g.stroke();
  g.restore();
}
function drop(x, y, s, col, al) {
  g.save(); g.globalAlpha *= al === undefined ? 1 : al; g.translate(x, y); g.scale(s, s); g.fillStyle = col || BLUE;
  g.beginPath(); g.moveTo(0, -16); g.bezierCurveTo(14, 4, 12, 16, 0, 16); g.bezierCurveTo(-12, 16, -14, 4, 0, -16); g.fill(); g.restore();
}
function bg(t, u, tone) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, tone ? tone[0] : '#cfe6ff'); gr.addColorStop(1, tone ? tone[1] : '#f6fbff');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++) { const cx = ((i * 520 + t * (14 + i * 5)) % (W + 500)) - 250; circ(cx, 120 + i * 40, 60 + i * 8, '#fff', .35); circ(cx + 60, 135 + i * 40, 48 + i * 6, '#fff', .35); circ(cx - 60, 140 + i * 40, 42, '#fff', .35); }
}
function title(s, u) { const a = ease(u / .5); txt(s, W / 2, 110 + (1 - a) * -30, 62, NAVY, a); }
function src() { txt(TX.src, W / 2, 1040, 24, '#667a99', .8, 600); }

// ---------- scenes ----------
function israelShape(x, y, s, fill, al) {
  g.save(); g.globalAlpha *= al === undefined ? 1 : al; g.translate(x, y); g.scale(s, s); g.fillStyle = fill; g.strokeStyle = '#fff'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(-30, -150); g.lineTo(25, -160); g.lineTo(40, -110); g.lineTo(20, -40); g.lineTo(45, 30); g.lineTo(60, 120); g.lineTo(35, 160);
  g.lineTo(0, 200); g.lineTo(-30, 80); g.lineTo(-55, -20); g.lineTo(-40, -90); g.closePath(); g.fill(); g.stroke(); g.restore();
}
function umbrella(x, y, s, open, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = NAVY; g.lineWidth = 8; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -10); g.lineTo(0, 110); g.quadraticCurveTo(0, 135, 22, 128); g.stroke();
  const r = 150 * open; g.fillStyle = col || RED; g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(-r * .9, -r * .95, 0, -r * 1.05); g.quadraticCurveTo(r * .9, -r * .95, r, 0);
  g.quadraticCurveTo(r * .5, -22, 0, 0); g.quadraticCurveTo(-r * .5, -22, -r, 0); g.fill(); g.restore();
}
function sc1(t, u) {
  bg(t, u);
  const a = ease(u / .6);
  israelShape(1330, 560, 2.6, '#8fd1ad', a);
  // rain over the map, then an umbrella
  for (let i = 0; i < 26; i++) { const px = 1120 + (i * 83) % 420, py = ((u * 260 + i * 97) % 700) + 220; drop(px, py, .9, BLUE, a * .8); }
  cloud(560, 560, 2.3 * back(u / .9), t, 'happy');
  const q = ease((u - 1.2) / .7);
  txt('?', 1330, 520, 360, '#e7a223', q * .9);
  txt(TX.q, W / 2, 130, 70, NAVY, ease(u / .7));
}
function sc2(t, u) {
  bg(t, u);
  title(TX.q2, u);
  txt(TX.s2a, W / 2, 200, 40, '#445a7e', ease((u - .4) / .6), 600);
  const places = [[TX.jer, 1], [TX.bs, 1], [TX.ma, 1], [TX.ta, 1], [TX.lon, 0], [TX.ny, 0], [TX.ath, 0], [TX.mad, 0], [TX.tok, 0]];
  for (let i = 0; i < 9; i++) {
    const k = back((u - .9 - i * .28) / .5), x = 150 + i * 205, y = 520;
    if (k <= 0) continue;
    const col = places[i][1] ? GREEN : SLATE;
    g.save(); g.translate(x, y - (1 - k) * -80); g.scale(k, k);
    g.fillStyle = col; g.beginPath(); g.arc(0, -40, 46, Math.PI, 0); g.lineTo(0, 40); g.closePath(); g.fill(); circ(0, -40, 17, '#fff');
    g.restore();
    txt(places[i][0], x, 640, 34, col, k, 700);
  }
  // forecast vs actual cards
  const k2 = ease((u - 3.2) / .8);
  rr(380, 720, 520, 220, 28, '#fff', k2); rr(1020, 720, 520, 220, 28, '#fff', k2);
  txt(TX.fc, 640, 770, 46, BLUE, k2); txt(TX.act, 1280, 770, 46, GREEN, k2);
  const sw = ease((u - 4.2) / 1.2);
  circ(640, 860, 38, ORANGE, k2); for (let i = 0; i < 4; i++) { const a = i * 1.5708 + u; g.save(); g.globalAlpha *= k2; g.strokeStyle = ORANGE; g.lineWidth = 6; g.beginPath(); g.moveTo(640 + Math.cos(a) * 52, 860 + Math.sin(a) * 52); g.lineTo(640 + Math.cos(a) * 70, 860 + Math.sin(a) * 70); g.stroke(); g.restore(); }
  cloud(1280, 880, .38, t, 'happy'); for (let i = 0; i < 3; i++) drop(1250 + i * 30, 940 + ((u * 120 + i * 40) % 40), .7, BLUE, k2 * sw);
  txt('=?', 960, 835, 80, NAVY, k2);
  src();
}
function bars(items, x0, baseY, bw, gap, maxV, maxH, u, delay, unit) {
  items.forEach((it, i) => {
    const k = ease((u - delay - i * .25) / .9), h = maxH * it.v / maxV * k, x = x0 + i * (bw + gap);
    rr(x, baseY - h, bw, Math.max(h, 2), 18, it.c);
    txt((it.fmt ? it.fmt(it.v * k) : Math.round(it.v * k)) + (unit || ''), x + bw / 2, baseY - h - 34, 54, it.c, k);
    txt(it.l, x + bw / 2, baseY + 44, 40, NAVY, 1);
  });
}
function thermo(x, y, h, v, c, u) {
  rr(x - 22, y - h, 44, h, 22, '#fff'); const k = ease(u / 1.2);
  rr(x - 14, y - h * v * k, 28, h * v * k + 10, 14, c); circ(x, y + 18, 44, c); circ(x, y + 18, 44, 'rgba(255,255,255,.18)');
}
function sc3(t, u) {
  bg(t, u); title(TX.s3t, u);
  const d = 0.9;
  bars([{ v: 0.9, c: GREEN, l: TX.il, fmt: v => v.toFixed(1) }, { v: 1.0, c: SLATE, l: TX.world, fmt: v => v.toFixed(1) }], 620, 860, 300, 80, 2, 520, u, 1.0, '°');
  thermo(380, 760, 420, .46, GREEN, u - .5); thermo(1540, 760, 420, .5, SLATE, u - .5);
  txt(TX.deg, 960, 970, 36, '#445a7e', ease((u - 2) / .6), 600);
  cloud(960, 300, .55 * back((u - .3) / .6), t, 'happy');
  src();
}
function dotGrid(cx, cy, n, size, gap, color, u, delay, label, lblColor) {
  // 100 dots, n filled
  const cols = 10, w = cols * (size + gap);
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / cols), cc = i % cols, x = cx - w / 2 + cc * (size + gap) + size / 2, y = cy + r * (size + gap);
    const on = i < n * ease((u - delay) / 1.8) - .01 ? 1 : 0, pop = on ? back((u - delay - i * .012) / .4) : 0;
    circ(x, y, size / 2, 'rgba(120,150,190,.25)'); if (on) circ(x, y, size / 2 * Math.min(1, pop), color);
  }
  const k = Math.round(n * ease((u - delay) / 1.8));
  txt(k + '%', cx, cy - 60, 90, color, 1);
  txt(label, cx, cy + 10 * (size + gap) + 30, 46, color, 1);
}
function sc4(t, u, T) {
  bg(t, u); title(TX.s4t, u);
  const w2 = T.cues[1][0] - T.t0;  // winter starts at second cue
  const sw = ease((u - (w2 - .4)) / .7);
  const A = 1 - sw, B = sw;
  g.save(); g.globalAlpha *= A;
  dotGrid(560, 360, 52, 40, 12, GREEN, u, .8, TX.il, GREEN); dotGrid(1360, 360, 68, 40, 12, SLATE, u, 1.0, TX.world, SLATE);
  txt(TX.allyear, 960, 1000, 38, '#445a7e', 1, 600); g.restore();
  g.save(); g.globalAlpha *= B;
  dotGrid(560, 360, 63, 40, 12, GREEN, u, w2 + .2, TX.il, GREEN); dotGrid(1360, 360, 76, 40, 12, SLATE, u, w2 + .3, TX.world, SLATE);
  txt(TX.winter, 960, 1000, 38, '#445a7e', 1, 600); g.restore();
}
function sc5(t, u) {
  bg(t, u, ['#bfe0ff', '#f8efd6']); title(TX.r1, u);
  // sea (left in the picture = west) and desert (right)
  const fx = 960 + Math.sin(u * .9) * 150;
  g.fillStyle = '#4aa3e8'; g.fillRect(0, 400, fx, 560);
  g.fillStyle = '#e8c27a'; g.fillRect(fx, 400, W - fx, 560);
  g.save(); g.globalAlpha *= .35; g.strokeStyle = '#fff'; g.lineWidth = 6; for (let r = 0; r < 5; r++) { g.beginPath(); for (let x = 0; x <= fx; x += 20) { const y = 460 + r * 80 + Math.sin(x / 55 + u * 2 + r) * 9; x === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } g.restore();
  for (let i = 0; i < 7; i++) { const x = fx + 90 + i * 190; if (x < W) { g.fillStyle = '#d3a85c'; g.beginPath(); g.ellipse(x, 960 - (i % 3) * 40, 160, 45, 0, Math.PI, 0); g.fill(); } }
  g.save(); g.strokeStyle = RED; g.lineWidth = 10; g.setLineDash([26, 18]); g.lineDashOffset = -u * 40; g.beginPath(); g.moveTo(fx, 400); g.lineTo(fx, 960); g.stroke(); g.restore();
  txt(TX.sea, 330, 700, 56, '#fff'); txt(TX.desert, 1560, 700, 56, '#8a5a12');
  const k = ease((u - 5) / .6); txt(TX.front, fx, 1010, 46, RED, k);
  // cloud rains only left of the front
  const cx = 500 + Math.sin(u * .9) * 120 + 250; cloud(cx, 290, .7, t, 'happy');
  for (let i = 0; i < 12; i++) { const px = cx - 120 + i * 22, py = 360 + ((u * 260 + i * 53) % 560); if (px < fx - 20 && py < 960) drop(px, py, .7, '#cfe8ff', .95); }
}
function sc6(t, u) {
  bg(t, u, ['#c6e2ff', '#f1f6e9']); title(TX.r2, u);
  g.fillStyle = '#4aa3e8'; g.fillRect(0, 760, 520, 280);
  g.fillStyle = '#7fb069'; g.beginPath(); g.moveTo(520, 760); g.lineTo(980, 330); g.lineTo(1440, 760); g.lineTo(1920, 760); g.lineTo(1920, 1040); g.lineTo(520, 1040); g.closePath(); g.fill();
  g.fillStyle = '#5d8a4b'; g.beginPath(); g.moveTo(980, 330); g.lineTo(1100, 440); g.lineTo(900, 520); g.closePath(); g.fill();
  g.fillStyle = '#d6b36a'; g.fillRect(1440, 760, 480, 280);
  const p = ease((u - 1) / 5);  // cloud climbing
  const cx = lerp(250, 860, p), cy = lerp(520, 360, p);
  cloud(cx, cy, .7, t, 'happy');
  if (p > .6) for (let i = 0; i < 12; i++) { const px = 700 + i * 24, py = 430 + ((u * 250 + i * 57) % 360); drop(px, py, .7, BLUE, ease((p - .6) / .3)); }
  const k2 = ease((u - 6.8) / .6);
  circ(1650, 520, 70, '#ffc83d', k2); txt(TX.dry, 1650, 680, 52, '#8a5a12', k2); txt(TX.rain, 760, 920, 52, '#fff', k2);
  txt(TX.mount, 980, 870, 52, '#fff', ease((u - 2) / .6));
}
function sc7(t, u, T) {
  bg(t, u); title(TX.r3, u);
  const x0 = 360, y0 = 260, cs = 200, nx = 6, ny = 3;
  // simple coast: sea west, land east
  g.fillStyle = '#4aa3e8'; g.fillRect(x0, y0, cs * 2.4, cs * ny); g.fillStyle = '#9ac27a'; g.fillRect(x0 + cs * 2.4, y0, cs * (nx - 2.4), cs * ny);
  g.fillStyle = '#6f9a58'; g.beginPath(); g.moveTo(x0 + cs * 3.6, y0 + cs * ny); g.lineTo(x0 + cs * 4.2, y0 + 60); g.lineTo(x0 + cs * 4.8, y0 + cs * ny); g.fill();
  const ga = ease((u - .8) / 1.2);
  g.save(); g.globalAlpha *= ga; g.strokeStyle = NAVY; g.lineWidth = 4; for (let i = 0; i <= nx; i++) { g.beginPath(); g.moveTo(x0 + i * cs, y0); g.lineTo(x0 + i * cs, y0 + ny * cs); g.stroke(); }
  for (let j = 0; j <= ny; j++) { g.beginPath(); g.moveTo(x0, y0 + j * cs); g.lineTo(x0 + nx * cs, y0 + j * cs); g.stroke(); } g.restore();
  const hl = ease((u - 3) / .6); g.save(); g.globalAlpha *= hl * (.6 + .3 * Math.sin(u * 5)); g.strokeStyle = RED; g.lineWidth = 12; g.strokeRect(x0 + cs * 2, y0 + cs, cs, cs); g.restore();
  txt(TX.cell, x0 + cs * 2.5, y0 + cs * ny + 70, 44, RED, hl);
  // second cue: stations (dots) sparse at sea, many on land
  const sw = ease((u - (T.cues[1][0] - T.t0 - .2)) / .7);
  const rnd = i => { const x = Math.sin(i * 91.7) * 43758.5453; return x - Math.floor(x); };
  for (let i = 0; i < 40; i++) {
    const land = i >= 6, x = land ? x0 + cs * 2.4 + rnd(i) * cs * 3.5 : x0 + rnd(i + 5) * cs * 2.2, y = y0 + 20 + rnd(i * 3) * (cs * ny - 40);
    const kk = ease((sw * 40 - i) / 3); if (kk > 0) { circ(x, y, 11 * kk, land ? '#fff' : ORANGE); circ(x, y, 5 * kk, land ? GREEN : RED); }
  }
  txt(TX.land, x0 + cs * 4.6, y0 - 50, 42, GREEN, sw); txt(TX.buoy, x0 + cs * 1.2, y0 - 50, 42, '#a55a00', sw);
  cloud(1650, 520, .6, t, 'happy');
}
function sc8(t, u, T) {
  bg(t, u); title(TX.s8t, u);
  const data = [[TX.lon, 80, 0], [TX.mad, 77, 0], [TX.ta, 70, 1], [TX.ny, 69, 0], [TX.tok, 68, 0], [TX.bs, 61, 1], [TX.ath, 47, 0], [TX.ma, 40, 1], [TX.jer, 36, 1]];
  const sw = ease((u - (T.cues[1][0] - T.t0 - .3)) / .7), A = 1 - sw;
  g.save(); g.globalAlpha *= A;
  data.forEach((d, i) => {
    const k = ease((u - .6 - i * .3) / .8), y = 250 + i * 80, len = 1000 * d[1] / 100 * k, col = d[2] ? GREEN : SLATE;
    rr(1550 - len, y, len, 56, 14, col); txt(d[0], 1690, y + 30, 40, col, 1, 700); txt(Math.round(d[1] * k) + '%', 1550 - len - 60, y + 30, 38, NAVY, k);
  }); g.restore();
  g.save(); g.globalAlpha *= sw;
  txt(TX.s8b, 960, 240, 48, NAVY, 1);
  const k = ease((u - (T.cues[1][0] - T.t0) - .3) / 1.2);
  rr(520, 800 - 480 * .80 * k, 260, 480 * .80 * k, 18, GREEN); rr(1140, 800 - 480 * .84 * k, 260, 480 * .84 * k, 18, SLATE);
  txt(Math.round(80 * k) + '%', 650, 800 - 480 * .80 * k - 40, 66, GREEN, 1); txt(Math.round(84 * k) + '%', 1270, 800 - 480 * .84 * k - 40, 66, SLATE, 1);
  txt(TX.jer, 650, 850, 46, GREEN, 1); txt(TX.lon, 1270, 850, 46, SLATE, 1); g.restore();
}
function sc9(t, u, T) {
  bg(t, u, ['#d3e9ff', '#fdf6e3']);
  const items = [[TX.s9a, GREEN], [TX.s9b, ORANGE], [TX.s9c, SLATE]];
  items.forEach((it, i) => {
    const k = back((u - .5 - i * .9) / .6), y = 240 + i * 150;
    g.save(); g.globalAlpha *= clamp(k); rr(420 + (1 - k) * 200, y - 55, 1080, 110, 30, '#fff'); circ(1430 + (1 - k) * 200, y, 28, it[1]); g.restore();
    txt(it[0], 930 + (1 - k) * 200, y, 54, NAVY, clamp(k));
  });
  const ck = ease((u - (T.cues[1][0] - T.t0 - .3)) / 1);
  cloud(560 + (1 - ck) * -0, 800, .8, t, 'happy');
  umbrella(1220, 930, 1.3 * ck, ease((u - (T.cues[1][0] - T.t0) - .3) / .9), RED);
  txt(TX.s9d, 1500, 900, 70, RED, ck);
  for (let i = 0; i < 18; i++) { const px = 1100 + (i * 41) % 240, py = 720 + ((u * 200 + i * 71) % 120); if (ck > .5) drop(px, py, .6, BLUE, .5); }
}
const SC = { s1: sc1, s2: sc2, s3: sc3, s4: sc4, s5: sc5, s6: sc6, s7: sc7, s8: sc8, s9: sc9 };

function draw(t) {
  g.clearRect(0, 0, W, H);
  for (const T of TL.scenes) {
    if (t < T.t0 - .001 || t > T.t1 + .4) continue;
    const u = t - T.t0, fin = T.id === 's1' ? 1 : ease(u / .4), fout = T.id === 's9' ? 1 : 1 - ease((t - T.t1) / .4);
    g.save(); g.globalAlpha = Math.min(fin, fout); SC[T.id](t, u, T); g.restore();
    if (T.id !== 's1' && T.id !== 's2') { /* nothing */ }
  }
  if (t > TL.total - 1.2) { g.fillStyle = 'rgba(234,244,255,' + ease((t - (TL.total - 1.2)) / 1.2) * .0 + ')'; g.fillRect(0, 0, W, H); }
}
window.__seek = t => draw(t);
document.fonts.load('700 40px Assistant').then(() => document.fonts.ready).then(() => { draw(0); window.__ready = true; }).catch(() => { draw(0); window.__ready = true; });
