const NSH = 14, SHOT = 6, XF = .6, DUR = NSH * SHOT;
const CAPMODE = ['scrim', 'scrim', 'scrim', 'scrim', 'scrim', 'scrim', 'scrim', 'scrim', 'scrim', 'scrim', 'scrim', 'band', 'scrim', 'band'];
const SHOTS = [s1, s2, s3, s4, window.s5, window.s6, window.s7, window.s8, window.s9, window.s10, window.s11, window.s12, window.s13, window.s14].map(f => f || ((g, lt) => { g.fillStyle = '#12233F'; g.fillRect(0, 0, W, H); }));
window.DUR = DUR; window.CAPDELAY = { 11: 1.55 };
function drawShot(g, i, lt) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.shadowColor = 'transparent'; g.shadowBlur = 0;
  g.beginPath(); g.rect(0, 0, W, H); g.clip();
  SHOTS[i](g, lt);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.shadowColor = 'transparent';
  caption(g, i, lt, CAPMODE[i], i >= 11);
  g.restore();
}
function draw(t) {
  t = Math.max(0, Math.min(DUR - 1 / 60, t));
  const idx = Math.min(NSH - 1, Math.floor((t + XF / 2) / SHOT)), lt = t - idx * SHOT;
  G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.shadowColor = 'transparent'; G.shadowBlur = 0;
  if (idx > 0 && lt < XF / 2) {
    drawShot(G, idx - 1, t - (idx - 1) * SHOT);
    OG.setTransform(1, 0, 0, 1, 0, 0); OG.globalAlpha = 1; OG.clearRect(0, 0, W, H); drawShot(OG, idx, lt);
    G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = ease((lt + XF / 2) / XF); G.drawImage(oc, 0, 0); G.globalAlpha = 1;
  } else drawShot(G, idx, lt);
  const fo = ease((t - (DUR - .6)) / .5); if (fo > 0) { G.fillStyle = `rgba(18,35,63,${fo})`; G.fillRect(0, 0, W, H); }
  const fi = 1 - ease(t / .4); if (fi > 0) { G.fillStyle = `rgba(18,35,63,${fi})`; G.fillRect(0, 0, W, H); }
}
window.__seek = t => draw(t + T0);
const fonts = ['FrBlack', 'FrBold', 'STAM'].map(f => document.fonts.load('80px ' + f, 'אבג 05:50'));
const imgs = Object.keys(LOGOS).map(k => new Promise(res => { const im = new Image(); im.onload = im.onerror = res; im.src = LOGOS[k]; IMG[k] = im; }));
Promise.all(fonts.concat(imgs)).then(() => { draw(T0); window.__ready = true; window.__assets = Object.keys(IMG).map(k => k + ':' + IMG[k].naturalWidth + 'x' + IMG[k].naturalHeight).join(' '); });
