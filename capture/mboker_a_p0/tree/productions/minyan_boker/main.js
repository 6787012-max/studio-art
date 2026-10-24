const SHOTS = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10], SHOT = 6, XF = .7, DUR = 60;
window.DUR = DUR;
function drawShot(g, i, lt) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.shadowColor = 'transparent'; g.shadowBlur = 0;
  g.beginPath(); g.rect(0, 0, W, H); g.clip();
  SHOTS[i](g, lt);
  if (i < 8) caption(g, i, lt, 'scrim', false);
  g.restore();
}
function draw(t) {
  t = Math.max(0, Math.min(DUR - 1 / 60, t));
  const idx = Math.min(9, Math.floor((t + XF / 2) / SHOT)), lt = t - idx * SHOT;
  G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.shadowColor = 'transparent'; G.shadowBlur = 0;
  if (idx > 0 && lt < XF / 2) {
    drawShot(G, idx - 1, t - (idx - 1) * SHOT);
    OG.setTransform(1, 0, 0, 1, 0, 0); OG.globalAlpha = 1; OG.clearRect(0, 0, W, H); drawShot(OG, idx, lt);
    G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = ease((lt + XF / 2) / XF); G.drawImage(oc, 0, 0); G.globalAlpha = 1;
  } else drawShot(G, idx, lt);
  const fo = ease((t - (DUR - .7)) / .6); if (fo > 0) { G.fillStyle = `rgba(18,35,63,${fo})`; G.fillRect(0, 0, W, H); }
}
window.__seek = t => draw(t + T0);
const fonts = ['FrBlack', 'FrBold', 'STAM'].map(f => document.fonts.load('80px ' + f, 'אבג 05:50'));
const imgs = Object.keys(LOGOS).map(k => new Promise(res => { const im = new Image(); im.onload = im.onerror = res; im.src = LOGOS[k]; IMG[k] = im; }));
Promise.all(fonts.concat(imgs)).then(() => { draw(T0); window.__ready = true; window.__assets = Object.keys(IMG).map(k => k + ':' + IMG[k].naturalWidth + 'x' + IMG[k].naturalHeight).join(' '); });
