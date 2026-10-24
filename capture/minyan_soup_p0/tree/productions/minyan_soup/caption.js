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
  const a = ease((lt - .35 - (window.CAPDELAY[idx] || 0)) / .45) * (hold ? 1 : 1 - ease((lt - 5.4) / .45)); if (a <= 0) return;
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
