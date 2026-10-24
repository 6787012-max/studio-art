// "The soup" comedy promo, coded animation, 1080x1920, 84 s, deterministic function of t. 14 shots x 6 s.
// Captions come from captions.js (built from captions.json). No Math.random / Date / rAF.
const W = 1080, H = 1920, c = document.getElementById('c'), G = c.getContext('2d');
const oc = document.createElement('canvas'); oc.width = W; oc.height = H; const OG = oc.getContext('2d');
const NAVY = '#12233F', GOLD = '#B08D3E', GOLD_LT = '#CBA75B', GOLD_PALE = '#D9BE7C', CREAM = '#F6F1E5', GOLD_DK = '#8A6D2C';
const OL = '#141c3d';
const T0 = window.__T0 || 0;
const IMG = {};
const LOGOS = { framed: 'logos/framed-light-transparent.svg', horiz: 'logos/horizontal-light-transparent.svg', halki: 'logos/kehilati_color.svg' };

// ---------- helpers ----------
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const eout = x => { x = clamp(x); return 1 - (1 - x) * (1 - x) * (1 - x); };
const ein = x => { x = clamp(x); return x * x * x; };
const back = x => { x = clamp(x); const k = 1.70158; return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
const elastic = x => { x = clamp(x); if (x === 0 || x === 1) return x; return Math.pow(2, -9 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1; };
const lerp = (a, b, k) => a + (b - a) * k;
const at = (t, a, b) => clamp((t - a) / (b - a));
const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const mix = (a, b, k) => { const A = rgb(a), B = rgb(b); k = clamp(k); return `rgb(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))})`; };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function glow(g, x, y, r, col, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function cam(g, cx, cy, z, rot) { g.translate(540, 900); if (rot) g.rotate(rot); g.scale(z, z); g.translate(-cx, -cy); }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
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
function logoFit(g, im, cx, cy, maxW, maxH, o) { if (!im || !im.naturalWidth) return; const ar = im.naturalWidth / im.naturalHeight; let w = maxW, h = w / ar; if (h > maxH) { h = maxH; w = h * ar; } const sc = (o && o.sc !== undefined) ? o.sc : 1; g.save(); g.globalAlpha *= (o && o.a !== undefined) ? clamp(o.a) : 1; g.translate(cx, cy); g.scale(sc, sc); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); }
function shake(t, a, f) { return [Math.sin(t * (f || 61)) * a, Math.cos(t * (f || 61) * 1.3 + 1) * a]; }

// ---------- seven-segment digits (clock / time chips) ----------
function seg7(g, x, y, w, h, d, col) {
  const S = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcfgd' }[d], th = w * .2;
  const r = { a: [x + th * .6, y, w - th * 1.2, th], g: [x + th * .6, y + h / 2 - th / 2, w - th * 1.2, th], d: [x + th * .6, y + h - th, w - th * 1.2, th],
    f: [x, y + th * .6, th, h / 2 - th * .9], b: [x + w - th, y + th * .6, th, h / 2 - th * .9], e: [x, y + h / 2 + th * .3, th, h / 2 - th * .9], c: [x + w - th, y + h / 2 + th * .3, th, h / 2 - th * .9] };
  g.fillStyle = col; for (const k of S) { const q = r[k]; g.beginPath(); g.roundRect(q[0], q[1], q[2], q[3], th / 2); g.fill(); }
}
// digital readout "HH:MM", centre x,y, digit height dh
function digits(g, str, cx, cy, dh, col, blink) {
  const dw = dh * .56, gap = dh * .16, cw = dh * .3; const n = str.length; let tot = 0; for (const ch of str) tot += (ch === ':' ? cw : dw) + gap; tot -= gap;
  let x = cx - tot / 2; const y = cy - dh / 2;
  for (const ch of str) { if (ch === ':') { if (blink !== false) { g.fillStyle = col; g.beginPath(); g.arc(x + cw / 2, y + dh * .3, dh * .055, 0, 6.29); g.arc(x + cw / 2, y + dh * .7, dh * .055, 0, 6.29); g.fill(); } x += cw + gap; } else { seg7(g, x, y, dw, dh, +ch, col); x += dw + gap; } }
}
function chip(g, str, cx, cy, dh, o) {
  o = o || {}; const dw = dh * .56, gap = dh * .16, cw = dh * .3; let tot = 0; for (const ch of str) tot += (ch === ':' ? cw : dw) + gap; tot -= gap;
  const pw = tot + dh * .7, ph = dh * 1.5;
  g.save(); g.translate(cx, cy); if (o.sc !== undefined) g.scale(o.sc, o.sc); g.globalAlpha *= o.a === undefined ? 1 : clamp(o.a);
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 8; g.fillStyle = o.bg || '#0b1022'; rr(g, -pw / 2, -ph / 2, pw, ph, dh * .3); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = o.rim || GOLD_LT; g.lineWidth = 4; g.stroke();
  digits(g, str, 0, 0, dh, o.col || '#ffb347', o.blink); g.restore();
}
function clockFace(g, x, y, r, hh, mm, ss, o) {
  o = o || {}; g.save(); g.translate(x, y);
  g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.fillStyle = o.rim || '#7a5b2b'; g.beginPath(); g.arc(0, 0, r, 0, 6.29); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = o.face || '#fbf6e8'; g.beginPath(); g.arc(0, 0, r * .86, 0, 6.29); g.fill();
  g.strokeStyle = '#2a2a3a'; g.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.lineWidth = i % 3 === 0 ? r * .06 : r * .03; g.beginPath(); g.moveTo(Math.sin(a) * r * .66, -Math.cos(a) * r * .66); g.lineTo(Math.sin(a) * r * .78, -Math.cos(a) * r * .78); g.stroke(); }
  const ha = ((hh % 12) + mm / 60) * Math.PI / 6, ma = (mm + ss / 60) * Math.PI / 30;
  g.lineWidth = r * .09; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(ha) * r * .46, -Math.cos(ha) * r * .46); g.stroke();
  g.lineWidth = r * .06; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(ma) * r * .7, -Math.cos(ma) * r * .7); g.stroke();
  if (ss !== undefined) { const sa = ss * Math.PI / 30; g.strokeStyle = '#d33'; g.lineWidth = r * .025; g.beginPath(); g.moveTo(-Math.sin(sa) * r * .15, Math.cos(sa) * r * .15); g.lineTo(Math.sin(sa) * r * .76, -Math.cos(sa) * r * .76); g.stroke(); }
  g.fillStyle = '#2a2a3a'; g.beginPath(); g.arc(0, 0, r * .06, 0, 6.29); g.fill(); g.restore();
}

// ================== CHARACTER RIG ==================
// Figure local space: origin = ground between the feet, +x = forward (mirrored by dir), hip is placed so the lowest foot touches y=0.
const TH = 60, SHN = 58, UA = 54, FA = 52, TOR = 122;
const LOOK = {
  hero: { skin: '#e8b48a', hair: '#5a3a24', beard: 1, kc: '#0d0f18', kp: '#ffffff', shirt: '#f8f6ee', pants: '#2d3963', shoe: '#1a1a24' },
  a: { skin: '#d79c72', hair: '#2b2420', beard: 1, kc: '#10131f', kp: '#ffffff', shirt: '#dfe9f7', pants: '#252c4a', shoe: '#1a1a24' },
  b: { skin: '#f1c9a3', hair: '#8b5a2b', beard: 0, kc: '#efe6cc', kp: '#8a6d3b', shirt: '#ffffff', pants: '#34406e', shoe: '#2a1a14' },
  c: { skin: '#c68b60', hair: '#1d1a1a', beard: 2, kc: '#7a3fd0', kp: '#ffffff', shirt: '#f6eed8', pants: '#232a46', shoe: '#1a1a24' },
  d: { skin: '#f0c39a', hair: '#5a3a22', beard: 0, kc: '#1fa070', kp: '#ffffff', shirt: '#e6f1ff', pants: '#3a456f', shoe: '#1a1a24' },
  e: { skin: '#e3ad82', hair: '#4a4a4a', beard: 1, kc: '#d4a017', kp: '#fff3c0', shirt: '#ffffff', pants: '#2a3358', shoe: '#2a1a14' },
  g: { skin: '#e0b088', hair: '#8a8a8e', beard: 1, kc: '#2a2a33', kp: '#ffffff', shirt: '#ffffff', pants: '#3a3a44', shoe: '#1a1a24', vest: '#8d929e', tall: 1.14 },
  f: { skin: '#ddA77c'.toLowerCase(), hair: '#3a2418', beard: 2, kc: '#c0392b', kp: '#ffffff', shirt: '#eef3fb', pants: '#2b3560', shoe: '#1a1a24' },
};
const POSE0 = { lean: 0, nod: 0, tilt: 0, side: 0, lift: 0, bob: 0, sq: 1, th: [0, 0], sh: [0, 0], ua: [.05, .05], la: [.15, .15], spread: .12, hands: null, torsoOnly: false,
  eye: 1, px: 0, py: 0, brow: 0, brt: 0, mo: 0, sm: .35, blink: 0, sway: 0, shadow: true, headScale: 1, hip: [0, 0], bendA: 1 };
function ik(sx, sy, tx, ty, l1, l2, bend) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy); const mx = (l1 + l2) * .998; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; } if (d < 8) d = 8;
  const a = Math.atan2(dy, dx), an = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  return [sx + Math.cos(a + bend * an) * l1, sy + Math.sin(a + bend * an) * l1, sx + dx, sy + dy];
}
function poly(g, pts, w, col) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = OL; g.lineWidth = w + 7; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
}
function shade(col, k) { const [r, gg, b] = rgb(col); return `rgb(${Math.round(r * k)},${Math.round(gg * k)},${Math.round(b * k)})`; }
function mixPose(A, B, k) { const o = {}; for (const key in A) { const a = A[key], b = B[key]; if (Array.isArray(a) && Array.isArray(b)) o[key] = a.map((v, i) => typeof v === 'number' ? lerp(v, b[i], k) : v); else if (typeof a === 'number' && typeof b === 'number') o[key] = lerp(a, b, k); else o[key] = k < .5 ? a : (b === undefined ? a : b); } return o; }
function blinkAt(t, seed) { const p = ((t + (seed || 0) * .7) % 3.1); return p < .13 ? Math.sin(p / .13 * Math.PI) : 0; }

function drawHead(g, L, P, side) {
  const R = 40, eyeOpen = P.eye, bl = P.blink;
  // ears + neck handled by caller; head centred at 0,0
  g.fillStyle = L.skin; g.strokeStyle = OL; g.lineWidth = 4;
  const earx = lerp(-39, -12, side); g.beginPath(); g.ellipse(earx, 4, 8, 11, 0, 0, 6.29); g.fill(); g.stroke();
  if (side < .6) { g.beginPath(); g.ellipse(-earx, 4, 8, 11, 0, 0, 6.29); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(0, 0, R, R * 1.04, 0, 0, 6.29); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.ellipse(0, 0, R - 1, R * 1.04 - 1, 0, 0, 6.29); g.clip();
  // beard
  if (L.beard) { g.fillStyle = L.hair; g.beginPath(); const bw = L.beard === 2 ? 46 : 40, bt = L.beard === 2 ? 4 : 14; g.moveTo(-bw, bt); g.quadraticCurveTo(-bw, 62, 0 - side * 6, 66); g.quadraticCurveTo(bw + 4, 62, bw, bt); g.quadraticCurveTo(24 + side * 8, 12, 0, 13); g.quadraticCurveTo(-24, 12, -bw, bt); g.closePath(); g.fill(); }
  // hair over the top and the sides
  g.fillStyle = L.hair; g.beginPath(); g.moveTo(-50, -60); g.lineTo(50, -60); g.lineTo(50, -6 + side * 4); g.quadraticCurveTo(38, -26, 30 - side * 14, -26); g.lineTo(-30 - side * 6, -26); g.quadraticCurveTo(-40 + side * 2, -22, -41 + side * 4, 8); g.lineTo(-50, 8); g.closePath(); g.fill();
  // kippa
  const kx = -5 * side, ky = -35; g.fillStyle = L.kc; g.beginPath(); g.ellipse(kx, ky, 28 - 3 * side, 15, -.06 * side, 0, 6.29); g.fill();
  g.strokeStyle = L.kp; g.lineWidth = 2.4; g.beginPath(); g.ellipse(kx, ky, 27 - 3 * side, 14, -.06 * side, .15, Math.PI - .15); g.stroke();
  g.fillStyle = L.kp; for (let i = 0; i < 6; i++) { const a = -Math.PI + (i + .5) * Math.PI / 6; g.beginPath(); g.arc(kx + Math.cos(a) * 15 * (1 - .1 * side), ky + Math.sin(a) * 6 - 2, 2.2, 0, 6.29); g.fill(); }
  g.restore();
  g.strokeStyle = OL; g.lineWidth = 2.5; g.beginPath(); g.ellipse(kx, ky, 28 - 3 * side, 15, -.06 * side, Math.PI + .1, 2 * Math.PI - .1); g.stroke();
  // face features
  const fx = side * 15;
  // nose
  g.fillStyle = shade(L.skin, .86); g.strokeStyle = OL; g.lineWidth = 2.5; g.beginPath(); g.ellipse(side * 30 + 0, 8, 5 + 3 * side, 6.5, 0, 0, 6.29); g.fill(); if (side > .3) g.stroke();
  // eyes
  for (let i = 0; i < 2; i++) {
    const sg = i ? 1 : -1, ex = fx + sg * (15 - 5 * side), ey = -5; const ry = Math.max(1.2, 11 * eyeOpen * (1 - .92 * bl)), rx = 9.5 * (i === 0 && side > .5 ? .75 : 1);
    g.fillStyle = '#fff'; g.strokeStyle = OL; g.lineWidth = 2.6; g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, 6.29); g.fill(); g.stroke();
    if (bl < .6 && eyeOpen > .15) { g.save(); g.beginPath(); g.ellipse(ex, ey, rx - 1, ry - 1, 0, 0, 6.29); g.clip(); const pr = 5.2 * (eyeOpen > 1.25 ? .8 : 1); g.fillStyle = '#1b1210'; g.beginPath(); g.arc(ex + P.px * 4.2 + side * 2, ey + P.py * 4.2, pr, 0, 6.29); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + P.px * 4.2 + side * 2 + 1.8, ey + P.py * 4.2 - 2, 1.6, 0, 6.29); g.fill(); g.restore(); }
    // eyebrow
    const by = -23 - P.brow * 9 - (eyeOpen > 1 ? (eyeOpen - 1) * 8 : 0), ix = ex - sg * 11, ox = ex + sg * 11, k = P.brt * 7;
    g.strokeStyle = L.hair; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(ix, by - k); g.lineTo(ox, by + k * .8); g.stroke();
  }
  // mouth
  const mcx = fx + side * 4, mcy = 24, w = 10 + 7 * Math.max(0, P.sm) + 4 * P.mo, cy = mcy - P.sm * 5, top = cy + 13 * P.sm, bot = top + P.mo * 36;
  g.beginPath(); g.moveTo(mcx - w, cy); g.quadraticCurveTo(mcx, top, mcx + w, cy); g.quadraticCurveTo(mcx, bot, mcx - w, cy); g.closePath();
  if (P.mo > .06) { g.fillStyle = '#4d1620'; g.fill(); g.save(); g.clip(); g.fillStyle = '#e8566a'; g.beginPath(); g.ellipse(mcx, bot * .62 + cy * .38 + 6, w * .6, 7 + P.mo * 4, 0, 0, 6.29); g.fill(); g.fillStyle = '#fff'; g.fillRect(mcx - w, cy - 4, 2 * w, 6 + P.mo * 2); g.restore(); }
  g.strokeStyle = OL; g.lineWidth = 3; g.lineJoin = 'round'; if (P.mo > .06) g.stroke(); else { g.beginPath(); g.moveTo(mcx - w, cy); g.quadraticCurveTo(mcx, top, mcx + w, cy); g.stroke(); }
}

// returns { head:[x,y], hands:[[x,y],[x,y]], hip:[x,y] } in canvas coordinates
function man(g, x, y, s, dir, L, P0, t) {
  if (L.tall) s *= L.tall;
  const P = Object.assign({}, POSE0, P0), side = P.side, hs = lerp(21, 4, side), sw = lerp(34, 3, side), t_ = t || 0;
  const kx = 1 + (1 - P.sq) * .5, ky = P.sq;
  const hipX = P.hip[0];
  // legs
  const legs = [0, 1].map(i => { const hx = hipX + (i ? 1 : -1) * hs, a = P.th[i], kn = [hx + Math.sin(a) * TH, Math.cos(a) * TH], b = a + P.sh[i], ft = [kn[0] + Math.sin(b) * SHN, kn[1] + Math.cos(b) * SHN]; return { hx, kn, ft, b }; });
  let fy = P.torsoOnly ? 0 : Math.max(legs[0].ft[1], legs[1].ft[1]);
  const hipY = -fy - P.lift - P.bob + P.hip[1];
  if (P.shadow && !P.torsoOnly) { g.save(); g.globalAlpha *= clamp(.34 - P.lift / 600); g.fillStyle = '#000'; g.beginPath(); g.ellipse(x + dir * s * (hipX + 14), y + 4, 62 * s, 12 * s, 0, 0, 6.29); g.fill(); g.restore(); }
  g.save(); g.translate(x, y); g.scale(kx * s * dir, ky * s);
  const cl = Math.cos(P.lean), sl = Math.sin(P.lean), rot = (px, py) => [hipX + px * cl - py * sl, hipY + px * sl + py * cl];
  const shoul = [0, 1].map(i => rot((i ? 1 : -1) * sw, -TOR + 6));
  const neck = rot(0, -TOR - 2);
  const arms = [0, 1].map(i => {
    const S = shoul[i]; let el, hd;
    if (P.hands && P.hands[i]) { const r = ik(S[0], S[1], hipX + P.hands[i][0], hipY + P.hands[i][1], UA, FA, P.bendA); el = [r[0], r[1]]; hd = [r[2], r[3]]; }
    else { const a = P.ua[i] + (i ? 1 : -1) * P.spread * (1 - side), b = a + P.la[i]; el = [S[0] + Math.sin(a) * UA, S[1] + Math.cos(a) * UA]; hd = [el[0] + Math.sin(b) * FA, el[1] + Math.cos(b) * FA]; }
    return { S, el, hd };
  });
  const drawArm = i => { const A = arms[i], sh = i ? L.shirt : shade(L.shirt, .86);
    poly(g, [A.S, A.el], 25, sh);
    const ux = A.hd[0] - A.el[0], uy = A.hd[1] - A.el[1], ul = Math.hypot(ux, uy) || 1;
    poly(g, [[A.el[0] + ux / ul * 4, A.el[1] + uy / ul * 4], A.hd], 19, i ? L.skin : shade(L.skin, .9));
    g.fillStyle = i ? L.skin : shade(L.skin, .9); g.strokeStyle = OL; g.lineWidth = 3.5; g.beginPath(); g.arc(A.hd[0], A.hd[1], 12, 0, 6.29); g.fill(); g.stroke(); };
  const drawLeg = i => { const lg = legs[i], col = i ? L.pants : shade(L.pants, .8);
    poly(g, [[lg.hx, hipY + 4], lg.kn, lg.ft], 29, col);
    g.save(); g.translate(lg.ft[0], lg.ft[1]); g.rotate(lg.b * .35 - .1); g.fillStyle = L.shoe; g.strokeStyle = OL; g.lineWidth = 3.5; g.beginPath(); g.roundRect(-14, -9, 46, 20, [8, 12, 6, 6]); g.fill(); g.stroke(); g.fillStyle = '#e8e8ee'; g.fillRect(-12, 6, 42, 3); g.restore(); };
  if (!P.torsoOnly) { drawLeg(0); drawLeg(1); }
  drawArm(0);
  const hr = P.lean + P.tilt, hc = [neck[0] + Math.sin(hr) * 50, neck[1] - Math.cos(hr) * 50 + P.nod];
  poly(g, [[neck[0], neck[1] + 8], [neck[0] + Math.sin(hr) * 24, neck[1] - Math.cos(hr) * 24 + P.nod * .5]], 32, shade(L.skin, .92));
  // torso
  g.save(); g.translate(hipX, hipY); g.rotate(P.lean);
  const hw = lerp(76, 52, side), shw = lerp(92, 58, side);
  g.fillStyle = L.shirt; g.strokeStyle = OL; g.lineWidth = 4; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-hw / 2, 8); g.lineTo(-shw / 2, -TOR + 30); g.quadraticCurveTo(-shw / 2 - 2, -TOR + 2, -shw / 2 + 24, -TOR); g.lineTo(shw / 2 - 24, -TOR); g.quadraticCurveTo(shw / 2 + 2, -TOR + 2, shw / 2, -TOR + 30); g.lineTo(hw / 2, 8); g.quadraticCurveTo(0, 26, -hw / 2, 8); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(40,50,90,.28)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-shw * .2, -TOR + 24); g.quadraticCurveTo(-shw * .26, -50, -hw * .3, -14); g.stroke();
  g.fillStyle = '#c9ccd8'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(side * 14, -TOR + 38 + i * 26, 3, 0, 6.29); g.fill(); }
  if (L.vest) { g.save(); g.beginPath(); g.moveTo(-hw / 2, 8); g.lineTo(-shw / 2, -TOR + 30); g.quadraticCurveTo(-shw / 2 - 2, -TOR + 2, -shw / 2 + 24, -TOR); g.lineTo(shw / 2 - 24, -TOR); g.quadraticCurveTo(shw / 2 + 2, -TOR + 2, shw / 2, -TOR + 30); g.lineTo(hw / 2, 8); g.quadraticCurveTo(0, 26, -hw / 2, 8); g.closePath(); g.clip(); g.fillStyle = L.vest; g.fillRect(-60, -TOR + 20, 120, 200); g.fillStyle = L.shirt; g.beginPath(); g.moveTo(side * 8 - 20, -TOR + 18); g.lineTo(side * 8 + 20, -TOR + 18); g.lineTo(side * 8, -34); g.closePath(); g.fill(); g.strokeStyle = OL; g.lineWidth = 3; g.stroke(); g.fillStyle = '#44484f'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(side * 8, -24 + i * 14, 3.2, 0, 6.29); g.fill(); } g.restore(); g.strokeStyle = OL; g.lineWidth = 4; }
  g.fillStyle = '#fff'; g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(side * 14 - 20, -TOR + 2); g.lineTo(side * 14, -TOR + 28); g.lineTo(side * 14 + 20, -TOR + 2); g.closePath(); g.fill(); g.stroke();
  if (!P.torsoOnly) { g.strokeStyle = '#fff'; g.lineWidth = 2.4; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const sx = hw / 2 - 4 - i * 3, sy = 14, sw2 = Math.sin(t_ * 5 + i + P.sway * 3) * 5 + P.sway * 14 - P.lean * 6; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + sw2 * .5, sy + 16, sx + sw2, sy + 34); g.stroke(); } }
  g.restore();
  // head
  g.save(); g.translate(hc[0], hc[1]); g.rotate(hr * .6 + P.tilt * .4); if (P.headScale !== 1) g.scale(P.headScale, P.headScale); drawHead(g, L, P, side); g.restore();
  drawArm(1);
  g.restore();
  const wx = p => [x + dir * kx * s * p[0], y + ky * s * p[1]];
  return { head: wx(hc), hands: [wx(arms[0].hd), wx(arms[1].hd)], hip: wx([hipX, hipY]), feet: [wx(legs[0].ft), wx(legs[1].ft)], neck: wx(neck) };
}

// ---------- pose generators ----------
function runPose(ph, o) {
  o = o || {}; const A = (o.amp === undefined ? 1 : o.amp), th = ph * 2 * Math.PI, P = {};
  const leg = a => { const sn = Math.sin(a), cn = Math.cos(a); return [.95 * A * sn + .12, -(.35 + 1.0 * A * Math.max(0, cn)) * (A > .3 ? 1 : 1)]; };
  const l0 = leg(th + Math.PI), l1 = leg(th);
  P.th = [l0[0], l1[0]]; P.sh = [l0[1], l1[1]];
  P.ua = [.95 * A * Math.sin(th) * (o.armK === undefined ? 1 : o.armK) - .05, -.95 * A * Math.sin(th) * (o.armK === undefined ? 1 : o.armK) - .05];
  P.la = [1.25, 1.25]; P.lean = (o.lean === undefined ? .3 : o.lean) * Math.min(1, A + .2); P.side = 1; P.spread = 0; P.sway = .8;
  P.bob = Math.abs(Math.sin(th)) * 0; P.lift = Math.max(0, Math.abs(Math.sin(th + .6)) - .55) * 30 * A;
  P.sq = 1 - Math.max(0, Math.cos(th * 2 + .3) - .6) * .09 * A;
  return Object.assign(P, o.extra || {});
}
function walkPose(ph, o) {
  o = o || {}; const th = ph * 2 * Math.PI, P = {}, A = o.amp || 1; const leg = a => [.5 * A * Math.sin(a), -.1 - .55 * A * Math.max(0, Math.cos(a))];
  const l0 = leg(th + Math.PI), l1 = leg(th); P.th = [l0[0], l1[0]]; P.sh = [l0[1], l1[1]];
  P.ua = [.4 * A * Math.sin(th), -.4 * A * Math.sin(th)]; P.la = [.35, .35]; P.lean = .06; P.side = 1; P.spread = 0; P.lift = 0; P.bob = Math.abs(Math.sin(th)) * 4; P.sway = .2;
  return Object.assign(P, o.extra || {});
}
const SIT = { th: [1.5, 1.5], sh: [-1.45, -1.45], lean: .02, ua: [.1, .1], la: [.4, .4] };

// ---------- props ----------
function steam(g, x, y, t, n, sc, a) {
  g.save(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 7 * sc; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ph = (t * .6 + i / n) % 1, yy = y - ph * 130 * sc, xx = x + (i - (n - 1) / 2) * 24 * sc; g.globalAlpha = Math.sin(ph * Math.PI) * .6 * a; g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + 16 * sc * Math.sin(t * 2.2 + i * 2), yy - 20 * sc, xx, yy - 40 * sc); g.stroke(); }
  g.restore();
}
// soup pot: (cx, cy) = bottom centre. o: rot, lid:{lift, dx, rot} or lid:null (off), level 0..1, t (bubbles), sc
function pot(g, cx, cy, sc, o) {
  o = o || {}; const w = 104, h = 86, t = o.t || 0; g.save(); g.translate(cx, cy); g.scale(sc, sc); if (o.rot) g.rotate(o.rot);
  const body = () => { g.beginPath(); g.moveTo(-w / 2 + 4, 0); g.quadraticCurveTo(0, 12, w / 2 - 4, 0); g.lineTo(w / 2 + 3, -h); g.lineTo(-w / 2 - 3, -h); g.closePath(); };
  for (const sd of [-1, 1]) { g.strokeStyle = OL; g.lineWidth = 15; g.lineCap = 'round'; g.beginPath(); g.moveTo(sd * (w / 2 + 2), -h + 20); g.lineTo(sd * (w / 2 + 30), -h + 24); g.stroke(); g.strokeStyle = '#3a3f52'; g.lineWidth = 8; g.beginPath(); g.moveTo(sd * (w / 2 + 2), -h + 20); g.lineTo(sd * (w / 2 + 30), -h + 24); g.stroke(); }
  const bg = g.createLinearGradient(-w / 2, 0, w / 2, 0); bg.addColorStop(0, '#8f9ab0'); bg.addColorStop(.3, '#dfe6f2'); bg.addColorStop(1, '#8591a8'); g.fillStyle = bg; g.strokeStyle = OL; g.lineWidth = 5; body(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-w / 2 + 14, -h + 12, 7, h - 30);
  g.fillStyle = '#e1584a'; g.fillRect(-w / 2 - 1, -h * .42, w + 2, 9);
  // rim + soup
  g.fillStyle = '#c3cbdb'; g.strokeStyle = OL; g.lineWidth = 4.5; g.beginPath(); g.ellipse(0, -h, w / 2 + 3, 13, 0, 0, 6.29); g.fill(); g.stroke();
  const open = !o.lid || o.lid.lift > 6;
  if (open) {
    g.fillStyle = '#3a2410'; g.beginPath(); g.ellipse(0, -h, w / 2 - 2, 10.5, 0, 0, 6.29); g.fill();
    const lv = o.level === undefined ? 1 : o.level, sy = -h + 3 + (1 - lv) * 8; g.fillStyle = '#f4b73c'; g.beginPath(); g.ellipse(0, sy, (w / 2 - 3) * (1 - (1 - lv) * .35), 10.5 * (1 - (1 - lv) * .3) + 1, 0, 0, 6.29); g.fill();
    g.fillStyle = '#e07a1c'; for (let i = 0; i < 5; i++) { const bx = Math.sin(i * 2.3 + 1) * 28, by = Math.cos(i * 1.7) * 3; g.beginPath(); g.ellipse(bx, sy + by, 6, 2.6, 0, 0, 6.29); g.fill(); }
    g.fillStyle = 'rgba(255,240,170,.9)'; for (let i = 0; i < 4; i++) { const ph = (t * 1.5 + i * .27) % 1; g.globalAlpha = Math.sin(ph * Math.PI); g.beginPath(); g.arc(Math.sin(i * 3.1 + t) * 26, sy + Math.cos(i * 2.1) * 3 - ph * 6, 3 + ph * 2, 0, 6.29); g.fill(); } g.globalAlpha = 1;
  }
  if (o.lid) {
    g.save(); g.translate(o.lid.dx || 0, -h - (o.lid.lift || 0)); g.rotate(o.lid.rot || 0);
    g.fillStyle = '#b6c0d2'; g.strokeStyle = OL; g.lineWidth = 4.5; g.beginPath(); g.moveTo(-w / 2 - 6, 0); g.quadraticCurveTo(-w / 2 + 4, -30, 0, -32); g.quadraticCurveTo(w / 2 - 4, -30, w / 2 + 6, 0); g.quadraticCurveTo(0, 14, -w / 2 - 6, 0); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-18, -18, 16, 5, -.4, 0, 6.29); g.fill();
    g.fillStyle = '#e1584a'; g.strokeStyle = OL; g.lineWidth = 3.5; g.beginPath(); g.arc(0, -38, 9, 0, 6.29); g.fill(); g.stroke();
    g.restore();
  }
  g.restore();
}
// chair (side view), falls with angle f (0 upright .. 1.45 fallen), pivot at the back foot
function chair(g, x, y, s, dir, f, col) {
  g.save(); g.translate(x, y); g.scale(s * dir, s); g.translate(-34, 0); g.rotate(-f); g.translate(34, 0); col = col || '#6d4a2b';
  g.strokeStyle = OL; g.lineWidth = 4; g.fillStyle = col; g.lineJoin = 'round';
  for (const lx of [-34, 34]) { g.beginPath(); g.roundRect(lx - 6, -78, 12, 78, 4); g.fill(); g.stroke(); }
  g.beginPath(); g.roundRect(-44, -84, 100, 16, 6); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(-46, -190, 14, 112, 6); g.fill(); g.stroke(); g.beginPath(); g.roundRect(-50, -200, 22, 22, 8); g.fill(); g.stroke();
  g.restore();
}
function cone(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s); g.strokeStyle = OL; g.lineWidth = 4; g.lineJoin = 'round';
  g.fillStyle = '#2b2f40'; g.beginPath(); g.roundRect(-46, -12, 92, 14, 5); g.fill(); g.stroke();
  g.fillStyle = '#ff7a1a'; g.beginPath(); g.moveTo(-34, -12); g.lineTo(-8, -122); g.quadraticCurveTo(0, -130, 8, -122); g.lineTo(34, -12); g.closePath(); g.fill(); g.stroke();
  g.save(); g.clip(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-26, -50); g.lineTo(26, -50); g.lineTo(21, -76); g.lineTo(-21, -76); g.fill(); g.restore();
  g.beginPath(); g.moveTo(-34, -12); g.lineTo(-8, -122); g.quadraticCurveTo(0, -130, 8, -122); g.lineTo(34, -12); g.closePath(); g.stroke();
  g.restore();
}
function paperCup(g, x, y, sc, col) {
  g.save(); g.translate(x, y); g.scale(sc, sc); g.strokeStyle = OL; g.lineWidth = 3; g.lineJoin = 'round';
  g.fillStyle = '#fbf7ee'; g.beginPath(); g.moveTo(-17, -42); g.lineTo(17, -42); g.lineTo(12, 0); g.lineTo(-12, 0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = col || '#b9722e'; g.fillRect(-14.6, -28, 29.2, 16); g.beginPath(); g.moveTo(-14.6, -28); g.lineTo(14.6, -28); g.moveTo(-13, -12); g.lineTo(13, -12); g.stroke();
  g.fillStyle = '#e9e2d2'; g.beginPath(); g.roundRect(-20, -49, 40, 9, 4); g.fill(); g.stroke(); g.restore();
}
// tray of 4x5 cups (pop-in per cup via k(i) in 0..1)
function tray(g, cx, cy, sc, t, kf) {
  g.save(); g.translate(cx, cy); g.scale(sc, sc); g.strokeStyle = OL; g.lineWidth = 4; g.fillStyle = '#c9a36a';
  g.beginPath(); g.moveTo(-250, 8); g.lineTo(250, 8); g.lineTo(272, -52); g.lineTo(-272, -52); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#9d7a46'; g.beginPath(); g.roundRect(-250, 8, 500, 18, 6); g.fill(); g.stroke();
  const cols = ['#b9722e', '#2d6bd6', '#d4a017', '#1fa070', '#c0392b'];
  let n = 0; const items = [];
  for (let r = 0; r < 4; r++) for (let cI = 0; cI < 5; cI++) { const i = r * 5 + cI; items.push({ i, r, cI }); }
  for (const it of items) { const k = kf ? kf(it.i) : 1; if (k <= 0) continue; const x = (it.cI - 2) * 98 + (it.r % 2 ? 0 : 0) + (3 - it.r) * 0, y = -40 + it.r * 16 + (1 - clamp(k)) * -150 * 0; const kk = back(k); paperCup(g, x + (it.r - 1.5) * 7, y + (1 - kk) * -90, 1.25 + it.r * .06, cols[(it.cI + it.r) % 5]); }
  g.restore();
}
function bookOpen(g, x, y, w, o, col) { // lying book seen from the front-top; o 1=open .. 0=closed
  g.save(); g.translate(x, y); g.strokeStyle = OL; g.lineWidth = 3; g.lineJoin = 'round';
  const hw = w / 2 * (.28 + .72 * o);
  if (o > .12) { g.fillStyle = '#fbf3d8'; g.beginPath(); g.moveTo(0, 6); g.lineTo(-hw, 0); g.lineTo(-hw + 4, -26); g.lineTo(0, -20); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(0, 6); g.lineTo(hw, 0); g.lineTo(hw - 4, -26); g.lineTo(0, -20); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = 'rgba(80,60,40,.5)'; g.lineWidth = 1.6; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-hw * .86, -3 - i * 5); g.lineTo(-8, -1 - i * 4.5); g.moveTo(8, -1 - i * 4.5); g.lineTo(hw * .86, -3 - i * 5); g.stroke(); } }
  else { g.fillStyle = col || '#5b2f1c'; g.beginPath(); g.roundRect(-w * .16, -22, w * .32, 28, 4); g.fill(); g.stroke(); g.fillStyle = GOLD_LT; g.fillRect(-w * .16 + 5, -14, w * .32 - 10, 3); }
  g.restore();
}
// handheld pointing hand (index finger up-left), tip at (0,0)
function pointHand(g, x, y, sc, rot, press) {
  g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(sc, sc); g.strokeStyle = OL; g.lineWidth = 5; g.lineJoin = 'round'; g.lineCap = 'round'; g.fillStyle = '#e8b48a';
  g.beginPath(); g.roundRect(-14, 0, 28, 120, 14); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(-14 + 22, 80, 24, 56, 12); g.fill(); g.stroke(); g.beginPath(); g.roundRect(-14 + 42, 90, 22, 54, 11); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(-34, 96, 90, 120, 34); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(-52, 112, 34, 70, 16); g.fill(); g.stroke();
  g.fillStyle = '#f7f5ee'; g.beginPath(); g.roundRect(-36, 200, 94, 120, 8); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.roundRect(-6, 8, 8, 70, 4); g.fill();
  g.restore();
}
function dust(g, x, y, t0, t, sc, col) { const a = t - t0; if (a < 0 || a > .7) return; const k = a / .7; g.save(); g.globalAlpha = (1 - k) * .55; g.fillStyle = col || '#cfc7b8'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x + (i - 1) * 22 * sc * (.5 + k) - k * 18 * sc, y - k * 26 * sc * (.6 + i * .3), (12 + 18 * k) * sc * (1 - i * .15), 0, 6.29); g.fill(); } g.restore(); }
function sweatDrops(g, t, hx, hy, s, dir, amt, t0) { for (let i = 0; i < 3; i++) { const ph = ((t * 1.8 + i / 3 + (t0 || 0)) % 1), a = Math.sin(ph * Math.PI) * amt; if (a <= 0) continue; const ox = (i - 1) * 46 * s * dir + Math.sin(i * 5) * 8 * s, oy = -34 * s + ph * 70 * s - i * 14 * s; g.save(); g.globalAlpha = a; g.fillStyle = '#9fd8ff'; g.strokeStyle = '#3a78b0'; g.lineWidth = 2; g.translate(hx + ox, hy + oy); g.scale(s * .9, s * .9); g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(10, 0, 0, 9); g.quadraticCurveTo(-10, 0, 0, -14); g.fill(); g.stroke(); g.restore(); } }
// soup droplets: spawn(i) -> {t: spawn time, x, y, vx, vy}; ground yG; draws airborne drops + splats
function soupDrops(g, t, n, spawn, yG, o) {
  o = o || {}; const gr = o.g || 2700, life = o.life || 3.2; g.save();
  for (let i = 0; i < n; i++) {
    const p = spawn(i), age = t - p.t; if (age < 0) continue;
    const disc = p.vy * p.vy + 2 * gr * Math.max(1, yG - p.y), tf = (p.vy + Math.sqrt(disc)) / gr, lx = p.x + p.vx * tf;
    const r = (p.r || 8);
    if (age < tf) { const yy = p.y + p.vy * age * -1 * -1; const px = p.x + p.vx * age, py = p.y - p.vy * age + .5 * gr * age * age; g.fillStyle = '#f4b73c'; g.strokeStyle = '#a8590e'; g.lineWidth = 2; g.beginPath(); g.ellipse(px, py, r * .8, r * 1.15, Math.atan2(gr * age - p.vy, p.vx) - Math.PI / 2, 0, 6.29); g.fill(); g.stroke(); }
    else { const a2 = age - tf; if (a2 < life) { const k = Math.min(1, a2 / .12); g.globalAlpha = a2 < .5 ? 1 : 1 - clamp((a2 - .5) / (life - .5)); g.fillStyle = '#f4b73c'; g.beginPath(); g.ellipse(lx, yG + 3, r * (1.6 + k * 1.4), r * (.35 + k * .2), 0, 0, 6.29); g.fill(); if (a2 < .35) { g.globalAlpha = 1 - a2 / .35; for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(lx + (j - 1) * r * (1 + a2 * 6), yG - Math.sin(a2 / .35 * Math.PI) * r * (1.5 + j % 2), r * .35, 0, 6.29); g.fill(); } } g.globalAlpha = 1; } }
  }
  g.restore();
}

// ---------- backgrounds ----------
function skyNight(g, y1) { const bg = g.createLinearGradient(0, -200, 0, y1 || 1300); bg.addColorStop(0, '#050a1c'); bg.addColorStop(1, '#1d2d5c'); g.fillStyle = bg; g.fillRect(-1500, -300, 4000, (y1 || 1300) + 300); }
// parallax skyline: world x range, deterministic buildings
function skyline(g, seed, camX, par, base, hMin, hMax, wMin, wMax, col, winCol, t) {
  const r = rng(seed); let x = -200; const off = camX * par;
  const lo = off - 700, hi = off + 1800; while (x < 9000) { const w = wMin + r() * (wMax - wMin), h = hMin + r() * (hMax - hMin), wn = r(), rw = r(); const sx = x - off + 540;
    if (sx > -w - 20 && sx < W + 20 + 700) { g.fillStyle = col; g.fillRect(sx, base - h, w + 1, h + 400); if (winCol) { const cols = Math.max(1, Math.floor(w / 46)); for (let a = 0; a < cols; a++) for (let b = 0; b < Math.floor(h / 60); b++) { const q = Math.sin((a * 7.1 + b * 3.7 + seed + wn * 9)) * 43758.5; if ((q - Math.floor(q)) > .68) { g.fillStyle = winCol; g.fillRect(sx + 12 + a * 46, base - h + 20 + b * 60, 20, 28); } } } }
    x += w + 2 + r() * 10; if (x - off > 3000) break; }
}
function lamp(g, x, y, s, on, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (on > 0) { glow(g, 38, -378, 300, '255,205,120', .38 * on); const cg = g.createLinearGradient(0, -370, 0, 0); cg.addColorStop(0, `rgba(255,210,130,${.16 * on})`); cg.addColorStop(1, 'rgba(255,210,130,0)'); g.fillStyle = cg; g.beginPath(); g.moveTo(14, -366); g.lineTo(62, -366); g.lineTo(190, 0); g.lineTo(-110, 0); g.closePath(); g.fill(); }
  g.strokeStyle = OL; g.lineWidth = 3; g.fillStyle = '#2a2d44'; g.beginPath(); g.roundRect(-7, -380, 14, 380, 4); g.fill(); g.stroke(); g.beginPath(); g.roundRect(-18, -12, 36, 14, 4); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-3, -372); g.quadraticCurveTo(10, -400, 38, -394); g.lineTo(38, -386); g.quadraticCurveTo(14, -388, 4, -366); g.fill(); g.stroke();
  g.fillStyle = '#ffe9a8'; g.beginPath(); g.ellipse(38, -384, 22, 10, 0, 0, 6.29); g.fill(); g.stroke(); g.restore();
}
// synagogue facade: base centre bx, ground gy, width w (no symbols other than two plain tablets)
function shulFacade(g, bx, gy, w, lit, t) {
  const h = w * .92, x0 = bx - w / 2;
  g.save(); g.strokeStyle = OL; g.lineWidth = 5; g.lineJoin = 'round';
  const wg = g.createLinearGradient(0, gy - h, 0, gy); wg.addColorStop(0, '#d9c9a2'); wg.addColorStop(1, '#bfa981'); g.fillStyle = wg; g.fillRect(x0, gy - h, w, h); g.strokeRect(x0, gy - h, w, h);
  g.fillStyle = '#a69069'; g.fillRect(x0 - 14, gy - h - 26, w + 28, 30); g.strokeRect(x0 - 14, gy - h - 26, w + 28, 30);
  g.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 12; i++) g.fillRect(x0 + 6, gy - h + 30 + i * (h - 60) / 12, w - 12, 3);
  // tablets relief
  g.fillStyle = '#efe3c3'; for (const dx of [-24, 24]) { g.beginPath(); g.moveTo(bx + dx - 20, gy - h * .79); g.lineTo(bx + dx - 20, gy - h * .9 + 14); g.arc(bx + dx, gy - h * .9 + 14, 20, Math.PI, 0); g.lineTo(bx + dx + 20, gy - h * .79); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = 'rgba(80,60,40,.5)'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(bx + dx - 11, gy - h * .86 + i * 11); g.lineTo(bx + dx + 11, gy - h * .86 + i * 11); g.stroke(); } g.strokeStyle = OL; g.lineWidth = 5; }
  // windows
  const wy0 = gy - h * .68, wy1 = gy - h * .34;
  for (const wx of [-.36, -.2, .2, .36]) { const cx = bx + wx * w, ww = w * .1; archPath(g, cx - ww, cx + ww, wy0, wy1); g.fillStyle = lit ? '#ffcf70' : '#1d2a52'; g.fill(); g.stroke(); if (lit) { glow(g, cx, (wy0 + wy1) / 2, 150, '255,200,100', .25); g.strokeStyle = 'rgba(120,80,20,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, wy0 + ww); g.lineTo(cx, wy1); g.moveTo(cx - ww, (wy0 + wy1) / 2 + 10); g.lineTo(cx + ww, (wy0 + wy1) / 2 + 10); g.stroke(); g.strokeStyle = OL; g.lineWidth = 5; } }
  // door
  const dw = w * .2, dx0 = bx - dw, dy0 = gy - h * .42;
  if (lit) glow(g, bx, gy - 60, 330, '255,190,90', .38);
  archPath(g, dx0, bx + dw, dy0, gy); g.fillStyle = lit ? '#ffd37a' : '#4a3020'; g.fill(); g.stroke();
  g.save(); archPath(g, dx0, bx + dw, dy0, gy); g.clip(); g.fillStyle = '#5a3a22'; g.fillRect(dx0, dy0, dw * .62 * (lit ? .35 : 1), h); g.fillRect(bx + dw - dw * .62 * (lit ? .35 : 1), dy0, dw * .62, h); g.restore();
  g.strokeStyle = OL; g.lineWidth = 5; archPath(g, dx0, bx + dw, dy0, gy); g.stroke();
  g.fillStyle = '#9a8660'; g.fillRect(dx0 - 40, gy, dw * 2 + 80, 16); g.strokeRect(dx0 - 40, gy, dw * 2 + 80, 16); g.fillRect(dx0 - 70, gy + 16, dw * 2 + 140, 16); g.strokeRect(dx0 - 70, gy + 16, dw * 2 + 140, 16);
  g.restore();
}
function roadGround(g, camX, gy, par) {
  g.fillStyle = '#2b3550'; g.fillRect(-1500, gy, 4000, 700); g.fillStyle = '#3b4670'; g.fillRect(-1500, gy, 4000, 14); g.fillStyle = 'rgba(255,255,255,.18)';
  const off = camX % 240; for (let i = -6; i < 12; i++) g.fillRect(i * 240 - off + 540 - 540 + 0, gy + 150, 120, 10);
}

// lid that rattles like a talking mouth: returns {lift, dx, rot}
function lidTalk(t, k, ph) { k = k === undefined ? 1 : k; const a = Math.max(0, Math.sin(t * 13 + (ph || 0))) * Math.max(.2, Math.sin(t * 3.1 + 1) * .5 + .6), b = Math.sin(t * 13 + (ph || 0)); return { lift: a * 9 * k, dx: b * 5 * k, rot: b * .09 * k }; }
// persistent soup splats along the ground between x0..x1; k in 0..1 how much of the trail exists
function splats(g, x0, x1, y, seed, n, k, sc) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), rx = (7 + r() * 16) * (sc || 1), yy = y + 4 + r() * 16 * (sc || 1), q = r(); if (q > k) continue; g.fillStyle = '#f4b73c'; g.globalAlpha = .9; g.beginPath(); g.ellipse(x, yy, rx, rx * .28, 0, 0, 6.29); g.fill(); if (i % 3 === 0) { g.fillStyle = '#e07a1c'; g.beginPath(); g.ellipse(x + rx * .3, yy, rx * .4, rx * .12, 0, 0, 6.29); g.fill(); } } g.globalAlpha = 1; }
