// Morning minyan promo, version A: coded animation, 1080x1920, 60 s, deterministic function of t.
// 10 shots x 6 s. Captions come from captions.js (copied from captions.json). No Math.random / Date.
const W = 1080, H = 1920, c = document.getElementById('c'), G = c.getContext('2d');
const oc = document.createElement('canvas'); oc.width = W; oc.height = H; const OG = oc.getContext('2d');
const NAVY = '#12233F', GOLD = '#B08D3E', GOLD_LT = '#CBA75B', GOLD_PALE = '#D9BE7C', CREAM = '#F6F1E5', GOLD_DK = '#8A6D2C';
const T0 = window.__T0 || 0;
const IMG = {};
const LOGOS = { framed: 'logos/framed-light-transparent.svg', horiz: 'logos/horizontal-light-transparent.svg', halki: 'logos/kehilati_color.svg' };

// ---------- helpers ----------
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const back = x => { x = clamp(x); const k = 1.70158; return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const mix = (a, b, k) => { const A = rgb(a), B = rgb(b); k = clamp(k); return `rgb(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))})`; };
const mix3 = (a, b, d, k) => k < .5 ? mix(a, b, k * 2) : mix(b, d, (k - .5) * 2);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function glow(g, x, y, r, col, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function cam(g, cx, cy, z) { g.translate(540, 960); g.scale(z, z); g.translate(-cx, -cy); }
function rg(base, a1, f1, p1, a2, f2, p2) { return x => base + a1 * Math.sin(x * f1 + p1) + a2 * Math.sin(x * f2 + p2); }
function ridge(g, fn, col, bot) { g.fillStyle = col; g.beginPath(); g.moveTo(-200, bot || H + 300); for (let x = -200; x <= W + 200; x += 14) g.lineTo(x, fn(x)); g.lineTo(W + 200, bot || H + 300); g.closePath(); g.fill(); }
function archPath(g, x0, x1, yTop, yBot) { const r = (x1 - x0) / 2; g.beginPath(); g.moveTo(x0, yBot); g.lineTo(x0, yTop + r); g.arc((x0 + x1) / 2, yTop + r, r, Math.PI, 0); g.lineTo(x1, yBot); g.closePath(); }
const STARS = (() => { const r = rng(7); return Array.from({ length: 160 }, () => ({ x: r() * W, y: r() * 1000, s: .8 + r() * 2.2, p: r() * 6.28, f: 1.2 + r() * 2.4 })); })();
function stars(g, t, a, ymax, x0, xw) { if (a <= 0) return; for (const s of STARS) { if (s.y > ymax) continue; g.globalAlpha = a * (.4 + .6 * Math.sin(t * s.f + s.p) ** 2); g.fillStyle = '#fff'; g.beginPath(); g.arc((x0 || 0) + s.x * ((xw || W) / W), s.y, s.s, 0, 6.29); g.fill(); } g.globalAlpha = 1; }
function T(g, s, x, y, fam, size, color, o) {
  o = o || {}; const a = o.a === undefined ? 1 : o.a; if (a <= 0) return;
  g.save(); g.globalAlpha *= clamp(a); g.translate(x, y + (o.dy || 0)); if (o.rot) g.rotate(o.rot); if (o.sc !== undefined) g.scale(o.sc, o.sc);
  g.font = size + 'px ' + fam; g.fillStyle = color; g.direction = 'rtl'; g.textAlign = o.al || 'center'; g.textBaseline = 'alphabetic';
  if (o.sh) { g.shadowColor = o.sh; g.shadowBlur = o.sb || 20; g.shadowOffsetY = o.so === undefined ? 4 : o.so; }
  g.fillText(s, 0, 0); g.restore();
}
function sparkle(g, x, y, s, col, a) { if (a <= .01) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.moveTo(0, -s); g.quadraticCurveTo(s * .14, -s * .14, s, 0); g.quadraticCurveTo(s * .14, s * .14, 0, s); } g.fill(); g.restore(); }

// ---------- soft dark silhouettes (from behind / front, faceless) ----------
// origin = bottom centre of torso. height of figure ~ 305 units.
function man(g, x, y, s, o) {
  o = o || {}; const col = o.col || '#0b1330';
  g.save(); g.translate(x, y); g.scale(s, s); if (o.sway) g.rotate(o.sway); if (o.lean) { g.transform(1, 0, o.lean, 1, 0, 0); }
  g.fillStyle = col;
  g.beginPath(); g.moveTo(-88, 0); g.lineTo(-84, -150); g.quadraticCurveTo(-80, -208, -30, -216); g.lineTo(30, -216); g.quadraticCurveTo(80, -208, 84, -150); g.lineTo(88, 0); g.closePath(); g.fill();
  g.fillRect(-17, -236, 34, 30);
  g.beginPath(); g.ellipse(0, -266, 40, 46, 0, 0, 6.29); g.fill();
  if (o.tallit) {
    const tg = g.createLinearGradient(0, -216, 0, 0); tg.addColorStop(0, o.tl || '#f4ecd8'); tg.addColorStop(1, o.td || '#cdbf9f');
    g.fillStyle = tg; g.beginPath(); g.moveTo(-94, 0); g.lineTo(-90, -150); g.quadraticCurveTo(-86, -202, -34, -210); g.lineTo(34, -210); g.quadraticCurveTo(86, -202, 90, -150); g.lineTo(94, 0); g.closePath(); g.fill();
    g.fillStyle = '#16264d'; g.fillRect(-52, -212, 104, 12); g.fillStyle = GOLD_LT; g.fillRect(-52, -203, 104, 2.5);
    g.fillStyle = 'rgba(22,38,77,.8)'; for (const yy of [-36, -50]) g.fillRect(-92, yy, 184, 6);
    g.fillStyle = 'rgba(22,38,77,.35)'; for (let i = -3; i <= 3; i++) g.fillRect(i * 26 - 1.5, -196, 3, 190);
  }
  if (o.kippa !== false) { g.fillStyle = o.kc || '#1b2a5e'; g.beginPath(); g.ellipse(0, -300, 30, 15, 0, Math.PI, 0); g.fill(); }
  if (o.rim) { g.strokeStyle = o.rim; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-76, -170); g.quadraticCurveTo(-72, -208, -30, -214); g.moveTo(-34, -296); g.quadraticCurveTo(-42, -270, -38, -248); g.stroke(); }
  g.restore();
}
function legs(g, x, hipY, s, tt, col) {
  g.save(); g.fillStyle = col || '#0b1330';
  for (const sg of [-1, 1]) { g.save(); g.translate(x + sg * 24 * s, hipY - 6 * s); g.rotate(Math.sin(tt * 5.5) * .34 * sg); g.beginPath(); g.roundRect(-19 * s, 0, 38 * s, 214 * s, 12 * s); g.fill(); g.restore(); }
  g.restore();
}
function bag(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s);
  g.strokeStyle = '#05091c'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -60); g.lineTo(0, 0); g.stroke();
  g.fillStyle = '#15275c'; g.beginPath(); g.roundRect(-36, 0, 72, 92, 10); g.fill();
  g.strokeStyle = GOLD_LT; g.lineWidth = 3; g.beginPath(); g.moveTo(-36, 20); g.lineTo(36, 20); g.stroke();
  g.fillStyle = GOLD_LT; g.beginPath(); g.moveTo(-14, 62); g.lineTo(-10, 46); g.lineTo(-4, 56); g.lineTo(0, 44); g.lineTo(4, 56); g.lineTo(10, 46); g.lineTo(14, 62); g.closePath(); g.fill();
  g.restore();
}
function book(g, cx, cy, w, flip, lit) {
  g.fillStyle = '#4b2a18'; g.beginPath(); g.moveTo(cx - w / 2 - 8, cy + 20); g.lineTo(cx - w / 2 + 14, cy - 22); g.lineTo(cx + w / 2 - 14, cy - 22); g.lineTo(cx + w / 2 + 8, cy + 20); g.closePath(); g.fill();
  for (const sd of [-1, 1]) {
    g.fillStyle = sd < 0 ? '#fbf1d8' : '#efe3c4'; g.beginPath(); g.moveTo(cx, cy + 15); g.lineTo(cx, cy - 20); g.quadraticCurveTo(cx + sd * w * .25, cy - 30, cx + sd * (w / 2 - 14), cy - 20); g.lineTo(cx + sd * (w / 2 + 2), cy + 15); g.quadraticCurveTo(cx + sd * w * .25, cy + 5, cx, cy + 15); g.fill();
    g.strokeStyle = 'rgba(60,45,30,.5)'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { const yy = cy - 14 + i * 7; g.beginPath(); g.moveTo(cx + sd * 12, yy); g.lineTo(cx + sd * (w / 2 - 16 + i * 3), yy + 1); g.stroke(); }
  }
  if (flip > 0 && flip < 1) { const a = Math.PI * flip, px = cx + Math.cos(a) * (w / 2 - 8), py = cy - 2 - Math.sin(a) * 46; g.fillStyle = '#fffaf0'; g.strokeStyle = 'rgba(60,45,30,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx, cy + 15); g.lineTo(cx, cy - 20); g.quadraticCurveTo((cx + px) / 2, py - 26, px, py - 16); g.lineTo(px, py + 18); g.quadraticCurveTo((cx + px) / 2, py + 8, cx, cy + 15); g.fill(); g.stroke(); }
}
function cup(g, x, y, t) {
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 4; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const ph = (t * .55 + i * .33) % 1, yy = y - 30 - ph * 70, xx = x - 14 + i * 14; g.globalAlpha = Math.sin(ph * Math.PI) * .7; g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + 9 * Math.sin(t * 2 + i), yy - 14, xx, yy - 28); g.stroke(); } g.globalAlpha = 1;
  g.strokeStyle = '#e9e2d2'; g.lineWidth = 7; g.beginPath(); g.arc(x + 30, y - 6, 13, -1.3, 1.3); g.stroke();
  g.fillStyle = '#fbf7ee'; g.beginPath(); g.moveTo(x - 27, y - 28); g.lineTo(x + 27, y - 28); g.lineTo(x + 21, y + 16); g.quadraticCurveTo(x, y + 22, x - 21, y + 16); g.closePath(); g.fill();
  g.fillStyle = '#5a3418'; g.beginPath(); g.ellipse(x, y - 28, 25, 6, 0, 0, 6.29); g.fill(); g.fillStyle = GOLD; g.fillRect(x - 24, y - 12, 48, 5);
}

// ---------- captions ----------
function capLines(text, maxW) {
  G.save(); G.direction = 'rtl';
  G.font = '88px FrBlack'; if (G.measureText(text).width <= maxW) { for (let size = 116; size >= 88; size -= 4) { G.font = size + 'px FrBlack'; if (G.measureText(text).width <= maxW) { G.restore(); return { lines: [text], size }; } } }
  if (text.indexOf(' · ') > 0) { const pr = text.split(' · '); for (let size = 112; size >= 64; size -= 4) { G.font = size + 'px FrBlack'; if (Math.max(G.measureText(pr[0]).width, G.measureText(pr[1]).width) <= maxW) { G.restore(); return { lines: pr, size }; } } }
  for (let size = 116; size >= 64; size -= 4) {
    G.font = size + 'px FrBlack';
    const w = text.split(' ');
    let best = null;
    for (let i = 1; i < w.length; i++) { const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '); if (a === '·' || b[0] === '·' || a.slice(-1) === '·') continue; const m = Math.max(G.measureText(a).width, G.measureText(b).width); if (!best || m < best.m) best = { m, a, b }; }
    if (best && best.m <= maxW) { G.restore(); return { lines: [best.a, best.b], size }; }
  }
  G.restore(); return { lines: [text], size: 64 };
}
const CAP_CACHE = {};
// mode: 'scrim' (gradient over a scene) | 'band' (solid navy band for the cream cards) ; hold: keep caption until the end of the shot
function caption(g, idx, lt, mode, hold) {
  const text = window.CAPS[idx]; const ci = CAP_CACHE[idx] || (CAP_CACHE[idx] = capLines(text, 930));
  const a = ease((lt - .35) / .45) * (hold ? 1 : 1 - ease((lt - 5.4) / .45)); if (a <= 0) return;
  g.save();
  if (mode === 'band') {
    const kb = ease((lt + .3) / .6) ; const top = H - 470 * kb; g.fillStyle = NAVY; g.fillRect(0, top, W, 470); g.fillStyle = GOLD; g.fillRect(0, top, W, 5);
  } else {
    const sg = g.createLinearGradient(0, 1330, 0, 1700); sg.addColorStop(0, 'rgba(10,20,42,0)'); sg.addColorStop(.55, 'rgba(10,20,42,.86)'); sg.addColorStop(1, 'rgba(10,20,42,.94)');
    g.globalAlpha = ease((lt + .2) / .4) * (hold ? 1 : 1 - ease((lt - 5.7) / .4)); g.fillStyle = sg; g.fillRect(0, 1330, W, H - 1330); g.globalAlpha = 1;
  }
  const n = ci.lines.length, lh = ci.size * 1.12, cy = 1660 + (n === 1 ? 20 : 0) - (n - 1) * lh * .35;
  g.globalAlpha = a; g.fillStyle = GOLD_LT; g.fillRect(540 - 70, cy - ci.size - 34 - (n - 1) * lh * .5 + (1 - a) * 10, 140, 4);
  ci.lines.forEach((ln, i) => T(g, ln, 540, cy + (i - (n - 1) / 2) * lh + (1 - a) * 14, 'FrBlack', ci.size, CREAM, { a: 1, sh: 'rgba(0,0,0,.55)', sb: 22, so: 4 }));
  g.restore();
}
