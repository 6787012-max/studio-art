// caption3d.js - real 3D captions for stage3d films (v4 house style). Reusable by every chapter.
//   const cap = caption3d(Wd, null, chapter)   // chapter = one entry of timeline.json {id,title,dur,lines:[...]}
//   cap.info(t) -> {id,text,rect:{x,y,w,h} (1920x1080 screen px),alpha,kind} | null     (used for window.__caption)
//   titleCard3d(Wd, 'T_C1', {...})              // floating world-space title panel with extruded text
// Text is NEVER written here: captions are vault ids resolved from window.CAPTIONS_VAULT (Hebrew lives only in the vault).
// Each line is laid out once (RTL, max 2 lines for narrator), painted per frame to canvas textures (face / extrusion / shadow) and shown on
// planes attached to the camera at z=-2.2, stacked in depth (bevel feel), tilted ~10deg. Words rise 18px + fade in over 0.18s in RTL order,
// spread over [t0,t1] in proportion to word length. Gold words get a light sweep; numeric words count up. Everything is a function of t.
// The planes live in scene.userData.overlay, which dof.js draws AFTER the depth-of-field pass, so captions are never blurred.
import * as THREE from 'three';

const FONT = 'Heebo, Assistant, sans-serif';
const SW = 1920, SH = 1080, DIST = 2.2, D2R = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const eo = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const vaultText = k => { const v = window.CAPTIONS_VAULT; return (v && typeof k === 'string' && Object.prototype.hasOwnProperty.call(v, k)) ? String(v[k]) : String(k); };

let MC = null; const mctx = () => MC || (MC = document.createElement('canvas').getContext('2d'));
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const mkTex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t; };

// ---- words: reveal spans in reading order (index 0 = first spoken = rightmost word), proportional to word length
export function wordSpans(line, text, spread) {
  const ws = String(text).split(/\s+/).filter(Boolean), lens = ws.map(w => w.length + 1), tot = lens.reduce((a, b) => a + b, 0) || 1;
  const dur = Math.max(.3, line.t1 - line.t0) * (spread || .94); let c = 0;
  return ws.map((w, i) => { const s = line.t0 + dur * c / tot; c += lens[i]; const wd = line.words && line.words[i];
    return { i, text: w, t0: s, t1: line.t0 + dur * c / tot, gold: !!(wd && wd.gold), num: !!(wd && wd.num) }; });
}

// ---- layout: balanced split into <= maxLines lines, shrinking the font until it fits maxW. Coordinates are relative to a line centre.
function layout(text, line, o) {
  const g = mctx(), spans = wordSpans(line, text, o.spread), n = spans.length;
  let best = null;
  const floor = Math.min(o.minPx, 40);   // long teaser lines: keep shrinking past minPx rather than spill off the frame
  for (let px = o.px; px >= floor; px -= 3) {
    if (px < o.minPx && o.maxLines < 3) o = { ...o, maxLines: 3 };
    g.font = `${o.italic ? 'italic ' : ''}700 ${px}px ${FONT}`; g.direction = 'rtl';
    const sp = g.measureText(' ').width * 1.08; spans.forEach(s => { s.w = g.measureText(s.text).width; });
    const pre = [0]; spans.forEach(s => pre.push(pre[pre.length - 1] + s.w));
    const width = (a, b) => pre[b] - pre[a] + sp * (b - a - 1);
    let sol = null;
    if (width(0, n) <= o.maxW) sol = [0, n];
    else if (o.maxLines >= 2) {
      let bestM = 1e9;
      for (let k = 1; k < n; k++) { const m = Math.max(width(0, k), width(k, n)); if (m < bestM) { bestM = m; sol = [0, k, n]; } }
      if (bestM > o.maxW) sol = null;
      if (!sol && o.maxLines >= 3) {
        bestM = 1e9; let s3 = null;
        for (let k = 1; k < n - 1; k++) for (let j = k + 1; j < n; j++) { const m = Math.max(width(0, k), width(k, j), width(j, n)); if (m < bestM) { bestM = m; s3 = [0, k, j, n]; } }
        if (s3 && bestM <= o.maxW) sol = s3;
      }
    }
    best = { px, sp, spans, sol, width, n };
    if (sol) break;
  }
  if (!best.sol) { // overflow fallback: even 3-way split at min size
    const k = Math.ceil(n / 2); best.sol = n > 1 ? [0, k, n] : [0, n];
  }
  const lh = best.px * (o.lh || 1.22), L = best.sol.length - 1, lines = [];
  for (let i = 0; i < L; i++) {
    const a = best.sol[i], b = best.sol[i + 1], lw = best.width(a, b); let xr = lw / 2; const items = [];
    for (let k = a; k < b; k++) { const s = best.spans[k]; items.push({ s, xr, w: s.w }); xr -= s.w + best.sp; }
    lines.push({ lw, items, dy: (i - (L - 1)) * lh });   // last line has dy 0 (anchored at the bottom)
  }
  const maxLW = Math.max(...lines.map(l => l.lw));
  return { px: best.px, lh, lines, maxLW, spans: best.spans, L };
}

// ---- painting of one word into three canvases (face / side / shadow); (x,y) = right edge + baseline in canvas px
function paintWord(cx, s, x, y, px, t, st) {
  const p = clamp((t - s.t0) / .18, 0, 1), a = eo(p); if (a <= 0) return;
  const rise = (1 - a) * 18; let txt = s.text;
  if (s.num && /^\d+$/.test(txt)) { const q = clamp((t - s.t0) / .9, 0, 1); txt = String(Math.round(+txt * eo(q))); }
  const font = `${st.italic ? 'italic ' : ''}700 ${px}px ${FONT}`, lw = px * .13;
  const gold = s.gold || st.allGold;
  const draw = (c, mode) => {
    c.save(); c.globalAlpha = a; c.translate(x, y + rise); c.font = font; c.direction = 'rtl'; c.textAlign = 'right'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
    if (mode === 'shadow') { c.shadowColor = 'rgba(0,0,0,.95)'; c.shadowBlur = px * .42; c.shadowOffsetY = px * .2; c.fillStyle = '#000'; c.strokeStyle = '#000'; c.lineWidth = lw; c.strokeText(txt, 0, 0); c.fillText(txt, 0, 0); }
    else if (mode === 'side') { c.strokeStyle = gold ? '#6a4608' : '#5a4a38'; c.lineWidth = lw; c.strokeText(txt, 0, 0); c.fillStyle = gold ? '#8a5a0c' : '#7a6650'; c.fillText(txt, 0, 0); }
    else {
      c.strokeStyle = 'rgba(22,12,6,.92)'; c.lineWidth = lw; c.strokeText(txt, 0, 0);
      if (gold) { const w = Math.max(40, s.w), sw = ((t * .42 + s.i * .19) % 1.7) - .35, gr = c.createLinearGradient(-w, 0, 0, 0);
        const stop = v => clamp(v, 0, 1); gr.addColorStop(0, '#FFC93C'); gr.addColorStop(stop(sw - .2), '#FFC93C'); gr.addColorStop(stop(sw), '#FFF3C4'); gr.addColorStop(stop(sw + .2), '#FFC93C'); gr.addColorStop(1, '#FFC93C'); c.fillStyle = gr; }
      else if (st.watch) { c.fillStyle = '#FFE9A8'; }
      else { const gr = c.createLinearGradient(0, -px * .75, 0, px * .15); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#F6DFB8'); c.fillStyle = gr; }
      c.fillText(txt, 0, 0);
    }
    c.restore();
  };
  if (st.italic) { for (const [c, m] of [[cx.d, 'shadow'], [cx.s, 'side'], [cx.f, 'face']]) { c.save(); c.translate(x, y + rise); c.transform(1, 0, -.2, 1, 0, 0); c.translate(-x, -(y + rise)); draw(c, m); c.restore(); } }
  else { draw(cx.d, 'shadow'); draw(cx.s, 'side'); draw(cx.f, 'face'); }
}

// ---- shared GPU assets (canvases, textures, materials, geometries): created once, meshes are made per shot
const ASSETS = {};
const NLAY = 8;
function planeAssets(name, w, h) {
  if (ASSETS[name]) return ASSETS[name];
  const A = { w, h, f: mkCanvas(w, h), s: mkCanvas(w, h), d: mkCanvas(w, h) };
  A.cx = { f: A.f.getContext('2d'), s: A.s.getContext('2d'), d: A.d.getContext('2d') };
  A.tf = mkTex(A.f); A.ts = mkTex(A.s); A.td = mkTex(A.d);
  const base = { transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false };
  A.mFace = new THREE.MeshBasicMaterial(Object.assign({ map: A.tf }, base));
  A.mShad = new THREE.MeshBasicMaterial(Object.assign({ map: A.td, opacity: .75 }, base));
  A.mLay = []; for (let k = 1; k <= NLAY; k++) { const m = new THREE.MeshBasicMaterial(Object.assign({ map: A.ts }, base)); m.color.setScalar(1.0 - .075 * k); A.mLay.push(m); }
  A.geo = new THREE.PlaneGeometry(w, h); A.key = null;
  return (ASSETS[name] = A);
}
function planeMeshes(A, parent) {
  const g = new THREE.Group(); const meshes = []; let ro = 100;
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.renderOrder = ro++; m.frustumCulled = false; g.add(m); meshes.push(m); return m; };
  add(A.geo, A.mShad, 3, -20, -26);
  for (let k = NLAY; k >= 1; k--) add(A.geo, A.mLay[k - 1], k * .35, -k * 1.7, -k * 3);
  add(A.geo, A.mFace, 0, 0, 0);
  g.visible = false; parent.add(g); return g;
}

// ---- rounded-rect extruded panel (cards): front cap gets 0..1 uvs
function panelGeo(w, h, r, depth) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 5, bevelSize: 5, bevelSegments: 2, curveSegments: 10 });
  const pos = geo.attributes.position, uv = geo.attributes.uv, nrm = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) { if (nrm.getZ(i) > .9) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h); }
  uv.needsUpdate = true; return geo;
}
const CARD_SIZE = { S: [1040, 280], A: [1100, 260], G: [1000, 640], Q: [1300, 640] };
function cardAssets(kind) {
  const key = 'card' + kind; if (ASSETS[key]) return ASSETS[key];
  const [w, h] = CARD_SIZE[kind], A = { w, h, f: mkCanvas(w, h) }; A.cx = A.f.getContext('2d'); A.tf = mkTex(A.f);
  A.geo = panelGeo(w, h, 36, 20);
  const gold = kind === 'A' ? 0x58d27a : 0xf0c04a;
  A.mFront = new THREE.MeshBasicMaterial({ map: A.tf, transparent: true, fog: false, toneMapped: false, depthTest: false });
  A.mSide = new THREE.MeshBasicMaterial({ color: gold, transparent: true, fog: false, toneMapped: false, depthTest: false });
  A.glow = mkTex((() => { const c = mkCanvas(256, 256), g = c.getContext('2d'), r = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    const col = kind === 'A' ? '120,230,150' : '255,210,110'; r.addColorStop(0, `rgba(${col},.55)`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 0, 256, 256); return c; })());
  A.mGlow = new THREE.MeshBasicMaterial({ map: A.glow, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending });
  A.gGeo = new THREE.PlaneGeometry(w * 1.5, h * 1.8);
  return (ASSETS[key] = A);
}
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

// ---- card face painting
function paintCard(kind, A, lay, line, t, T) {
  const c = A.cx, w = A.w, h = A.h; c.clearRect(0, 0, w, h);
  const isA = kind === 'A';
  const gr = c.createLinearGradient(0, 0, 0, h);
  if (isA) { gr.addColorStop(0, '#173a26'); gr.addColorStop(1, '#0c2216'); } else { gr.addColorStop(0, '#1d2a52'); gr.addColorStop(1, '#0d1330'); }
  c.fillStyle = gr; rr(c, 0, 0, w, h, 36); c.fill();
  c.lineWidth = 7; c.strokeStyle = isA ? '#7ee89a' : '#ffd36a'; rr(c, 10, 10, w - 20, h - 20, 30); c.stroke();
  c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.35)'; rr(c, 22, 22, w - 44, h - 44, 24); c.stroke();
  const tx = isA ? w * .42 : (kind === 'S' ? w * .59 : w / 2);   // text centre (canvas x)
  const ty = kind === 'G' ? h * .8 : (kind === 'Q' ? h * .36 : h / 2 + (lay.L - 1) * lay.lh / 2 + lay.px * .3);
  const ox = tx, oy = ty;
  const sub = { f: c, s: { save() {}, restore() {} }, d: { save() {}, restore() {} } };
  // words (face only; cards are flat art on a thick panel)
  lay.lines.forEach(l => l.items.forEach(it => {
    const s = it.s, p = clamp((t - s.t0) / .18, 0, 1), a = eo(p); if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.font = `700 ${lay.px}px ${FONT}`; c.direction = 'rtl'; c.textAlign = 'right'; c.lineJoin = 'round';
    const x = ox + it.xr, y = oy + l.dy + (1 - a) * 14; c.strokeStyle = 'rgba(8,10,24,.9)'; c.lineWidth = lay.px * .12; c.strokeText(s.text, x, y);
    c.fillStyle = s.gold ? '#FFD15A' : '#FFF6E2'; c.fillText(s.text, x, y); c.restore();
  }));
  // decorations
  if (kind === 'S') { // ring timer (8 s hold) on the left
    const hold = line.hold || 8, k = clamp((t - line.t1) / hold, 0, 1), cx = 130, cy = h / 2, R = 52;
    c.lineWidth = 14; c.strokeStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    c.strokeStyle = '#ffd36a'; c.lineCap = 'round'; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (1 - k) * Math.PI * 2); c.stroke();
    c.fillStyle = '#fff6e2'; c.font = `700 48px ${FONT}`; c.direction = 'ltr'; c.textAlign = 'center'; c.fillText(String(Math.max(1, Math.ceil(hold * (1 - k)))), cx, cy + 17);
  } else if (kind === 'A') { // green check badge
    const cx = w - 130, cy = h / 2; c.fillStyle = '#3fcf6d'; c.beginPath(); c.arc(cx, cy, 68, 0, 7); c.fill(); c.strokeStyle = '#0c2216'; c.lineWidth = 6; c.stroke();
    c.strokeStyle = '#fff'; c.lineWidth = 18; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(cx - 32, cy + 2); c.lineTo(cx - 8, cy + 28); c.lineTo(cx + 36, cy - 26); c.stroke();
  } else if (kind === 'G') { // big question mark + 3 s ring
    const cx = w / 2, cy = h * .36, k = clamp((t - line.t0) / 3, 0, 1);
    c.lineWidth = 12; c.strokeStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(cx, cy, 128, 0, 7); c.stroke();
    c.strokeStyle = '#ffd36a'; c.lineCap = 'round'; c.beginPath(); c.arc(cx, cy, 128, -Math.PI / 2, -Math.PI / 2 + (1 - k) * Math.PI * 2); c.stroke();
    c.fillStyle = '#ffd36a'; c.font = `900 230px ${FONT}`; c.direction = 'ltr'; c.textAlign = 'center'; c.fillText('?', cx, cy + 82);
  } else if (kind === 'Q') { // 60 s countdown ring with digits
    const hold = line.hold || 60, k = clamp((t - line.t1) / hold, 0, 1), cx = w / 2, cy = h * .72, R = 62;
    c.lineWidth = 16; c.strokeStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    c.strokeStyle = '#ffd36a'; c.lineCap = 'round'; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (1 - k) * Math.PI * 2); c.stroke();
    c.fillStyle = '#fff6e2'; c.font = `800 74px ${FONT}`; c.direction = 'ltr'; c.textAlign = 'center'; c.fillText(String(Math.max(1, Math.ceil(hold * (1 - k)))), cx, cy + 26);
  }
  A.tf.needsUpdate = true;
}

// ---- watch thought-frame painting (frame drawn on the face canvas only, behind nothing: it is flat but glows)
function paintFrame(c, x, y, w, h, t) {
  c.save(); rr(c, x, y, w, h, 46); c.fillStyle = 'rgba(40,28,10,.34)'; c.fill();
  c.setLineDash([22, 14]); c.lineDashOffset = -t * 10; c.lineWidth = 5; c.strokeStyle = 'rgba(255,224,150,.9)'; rr(c, x, y, w, h, 46); c.stroke(); c.setLineDash([]);
  [[w + 24, h - 40, 15], [w + 56, h - 18, 10], [w + 82, h - 2, 6]].forEach(([dx, dy, r]) => { c.fillStyle = 'rgba(255,224,150,.85)'; c.beginPath(); c.arc(x + dx, y + dy, r, 0, 7); c.fill(); });
  c.restore();
}

// ===================================================================== main
let CUR = null;
export const captionInfo = t => (CUR ? CUR.info(t) : null);
export function caption3d(Wd, cam, chapter, opts) {
  opts = opts || {};
  const lines = (chapter.lines || []).filter(l => l.cap);
  const nextT0 = i => (i + 1 < lines.length ? lines[i + 1].t0 : 1e9);
  const win = lines.map((l, i) => ({ l, i, a: l.t0, b: l.kind === 'S' ? l.end : Math.max(l.end || l.t1, Math.min((l.end || l.t1) + (l.kind === 'A' ? 2.2 : 1.0), nextT0(i) - .1)) }));
  const FADE = .25;
  const layouts = {};
  const layOf = (l) => {
    if (layouts[l.id]) return layouts[l.id];
    const text = vaultText(l.cap), watch = l.speaker === 'watch', k = l.kind;
    let o;
    if (k === 'S') o = { px: 58, minPx: 50, maxW: 700, maxLines: 2, spread: .94 };
    else if (k === 'A') o = { px: 62, minPx: 52, maxW: 760, maxLines: 2, spread: .94 };
    else if (k === 'G' || k === 'Q') o = { px: 60, minPx: 52, maxW: k === 'Q' ? 1100 : 860, maxLines: 2, spread: .94 };
    else if (watch) o = { px: 68, minPx: 44, maxW: 700, maxLines: 3, italic: true, lh: 1.2, spread: .94 };
    else o = { px: 96, minPx: 70, maxW: 1700, maxLines: 2, spread: .94 };
    const lay = layout(text, l, o); lay.text = text; lay.watch = watch; return (layouts[l.id] = lay);
  };
  // geometry of each presentation in screen px (rect used by window.__caption)
  const NAR_Y = 1000;   // last baseline
  const rectOf = (l, lay) => {
    const k = l.kind;
    if (k === 'S' || k === 'A' || k === 'G' || k === 'Q') {
      const [w, h] = CARD_SIZE[k], cx = 960, cy = k === 'S' ? 270 : (k === 'G' ? 390 : 540); return { x: cx - w / 2, y: cy - h / 2, w, h };
    }
    if (lay.watch) { const w = lay.maxLW + 100, h = (lay.L - 1) * lay.lh + lay.px * 1.2 + 70, x = 880 - w, y = 1020 - h; return { x, y, w, h }; }
    return { x: 960 - lay.maxLW / 2, y: NAR_Y - (lay.L - 1) * lay.lh - lay.px * .86, w: lay.maxLW, h: (lay.L - 1) * lay.lh + lay.px * 1.1 };
  };
  const at = t => { let pick = null; for (const w of win) if (t >= w.a && t < w.b + FADE) pick = w; return pick; };
  const alphaOf = (w, t) => clamp((w.b + FADE - t) / FADE, 0, 1) * (w.l.kind === 'S' || w.l.kind === 'A' || w.l.kind === 'G' || w.l.kind === 'Q' ? 1 : 1);
  const info = t => {
    const w = at(t); if (!w) return null; const lay = layOf(w.l);
    return { id: w.l.cap, text: lay.text, rect: rectOf(w.l, lay), alpha: alphaOf(w, t), kind: w.l.kind, lineId: w.l.id };
  };

  // ---- per-shot meshes
  const overlay = Wd.scene.userData.overlay || (Wd.scene.userData.overlay = new THREE.Scene());
  const root = new THREE.Group(); overlay.add(root);
  const NA = planeAssets('nar', 2048, 380), WA = planeAssets('wat', 1000, 460);
  const nar = new THREE.Group(), wat = new THREE.Group(); root.add(nar); root.add(wat);
  const narG = planeMeshes(NA, nar), watG = planeMeshes(WA, wat);
  // dark gradient band behind narrator text (not a box)
  const BA = ASSETS.band || (ASSETS.band = (() => { const c = mkCanvas(8, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, 'rgba(8,5,14,0)'); gr.addColorStop(.55, 'rgba(8,5,14,.5)'); gr.addColorStop(1, 'rgba(8,5,14,.78)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256);
    const t = mkTex(c); return { tex: t, mat: new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }), geo: new THREE.PlaneGeometry(SW * 1.3, 560) }; })());
  const band = new THREE.Mesh(BA.geo, BA.mat); band.renderOrder = 50; band.frustumCulled = false; band.visible = false; root.add(band);
  const bandMat = BA.mat;
  const cards = {}; // kind -> {grp, panel, glow}
  for (const k of ['S', 'A', 'G', 'Q']) {
    if (!lines.some(l => l.kind === k)) continue;
    const CA = cardAssets(k), grp = new THREE.Group(); grp.visible = false;
    const panel = new THREE.Mesh(CA.geo, [CA.mFront, CA.mSide]); panel.renderOrder = 200; panel.frustumCulled = false; panel.position.z = -10;
    const glow = new THREE.Mesh(CA.gGeo, CA.mGlow); glow.renderOrder = 190; glow.frustumCulled = false; glow.position.z = -30;
    grp.add(glow); grp.add(panel); root.add(grp); cards[k] = { grp, CA, panel, glow };
  }

  let stamp = '';
  function update(lt, camera) {
    const t = lt + (Wd.t0 || 0);
    camera.updateMatrixWorld();
    root.position.copy(camera.position); root.quaternion.copy(camera.quaternion);
    const g = 2 * DIST * Math.tan(camera.fov * D2R / 2) / SH;   // metres per screen px at the caption distance
    narG.visible = watG.visible = band.visible = false; for (const k in cards) cards[k].grp.visible = false;
    const w = at(t); if (!w) return;
    const l = w.l, lay = layOf(l), a = alphaOf(w, t), k = l.kind;
    const place = (grp, sx, sy, tiltDeg) => { grp.position.set((sx - SW / 2) * g, (SH / 2 - sy) * g, -DIST); grp.scale.setScalar(g); grp.rotation.set(-tiltDeg * D2R, 0, 0); };
    if (k === 'S' || k === 'A' || k === 'G' || k === 'Q') {
      const C = cards[k], CA = C.CA, r = rectOf(l, lay), e = eo((t - l.t0) / .38);
      const key = l.id + '|' + t.toFixed(4); if (stamp !== key) { paintCard(k, CA, lay, l, t, t); stamp = key; }
      C.grp.visible = true; place(C.grp, r.x + r.w / 2, r.y + r.h / 2, k === 'S' ? 7 : 6);
      C.grp.position.z = -DIST - (1 - e) * .9; C.grp.rotation.y = (k === 'S' ? -5 : 4) * D2R * (1 - .3 * e);
      CA.mFront.opacity = CA.mSide.opacity = CA.mGlow.opacity = a * e; return;
    }
    const watch = lay.watch, A = watch ? WA : NA, grp = watch ? watG : narG, holder = watch ? wat : nar;
    const key = l.id + '|' + t.toFixed(4) + '|' + (watch ? 'w' : 'n');
    if (A.key !== key) {
      A.key = key; for (const c of [A.cx.f, A.cx.s, A.cx.d]) c.clearRect(0, 0, A.w, A.h);
      const r = rectOf(l, lay);
      // canvas origin in screen px
      const ox = watch ? 0 : -64, oy = watch ? 600 : 680;
      if (watch) paintFrame(A.cx.f, r.x - ox, r.y - oy, r.w, r.h, t);
      const cxs = watch ? r.x + r.w / 2 : 960, base = NAR_Y;
      const bl = watch ? (r.y + r.h - 35 - lay.px * .22) : base;
      lay.lines.forEach(ln => ln.items.forEach(it => paintWord({ f: A.cx.f, s: A.cx.s, d: A.cx.d }, it.s, cxs + it.xr - ox, bl + ln.dy - oy, lay.px, t, { italic: watch, watch })));
      A.tf.needsUpdate = A.ts.needsUpdate = A.td.needsUpdate = true;
    }
    grp.visible = true;
    const ox = watch ? 0 : -64, oy = watch ? 600 : 680;
    place(holder, ox + A.w / 2, oy + A.h / 2, 10);
    A.mFace.opacity = a; A.mShad.opacity = .75 * a; A.mLay.forEach(m => { m.opacity = a; });
    if (!watch) { band.visible = true; band.position.set(0, (SH / 2 - (SH - 280)) * g, -DIST - .05); band.scale.setScalar(g); band.rotation.set(0, 0, 0); band.position.z = -DIST - .04; bandMat.opacity = a;
      band.position.x = 0; }
  }
  const api = { update, info, root, overlay, lines, layOf, rectOf }; CUR = api;
  Wd.on((lt, camera) => update(lt, camera));
  // the band lives in camera space too (it was added to root, which follows the camera)
  return api;
}

// ===================================================================== title card (world space)
// titleCard3d(Wd, 'T_C1', {pos:[x,y,z], width: metres, line:{t0,t1}}): floating panel + extruded gold text. Time base = shot-local t + Wd.t0.
export function titleCard3d(Wd, key, o) {
  o = o || {};
  const text = vaultText(key), line = Object.assign({ t0: .5, t1: 2.4, words: [] }, o.line || {});
  const lay = layout(text, line, { px: 190, minPx: 120, maxW: 1450, maxLines: 2, lh: 1.18, spread: .92 });
  const PW = 1700, PH = 560;
  const A = { f: mkCanvas(PW, PH), s: mkCanvas(PW, PH), d: mkCanvas(PW, PH) }; A.cx = { f: A.f.getContext('2d'), s: A.s.getContext('2d'), d: A.d.getContext('2d') };
  const tf = mkTex(A.f), ts = mkTex(A.s), td = mkTex(A.d);
  const base = { transparent: true, fog: false, toneMapped: false };
  const grp = new THREE.Group(), K = (o.width || 7.2) / PW;
  // panel
  const pw = 1900, ph = 700, pc = mkCanvas(pw, ph), pg = pc.getContext('2d');
  const gr = pg.createLinearGradient(0, 0, 0, ph); gr.addColorStop(0, '#1b2a5c'); gr.addColorStop(1, '#0a1230'); pg.fillStyle = gr; pg.fillRect(0, 0, pw, ph);
  const rg = pg.createRadialGradient(pw / 2, ph * .45, 20, pw / 2, ph * .45, 900); rg.addColorStop(0, 'rgba(255,214,120,.22)'); rg.addColorStop(1, 'rgba(255,214,120,0)'); pg.fillStyle = rg; pg.fillRect(0, 0, pw, ph);
  pg.strokeStyle = '#ffd36a'; pg.lineWidth = 10; pg.strokeRect(34, 34, pw - 68, ph - 68); pg.lineWidth = 3; pg.strokeRect(56, 56, pw - 112, ph - 112);
  [[90, 90], [pw - 90, 90], [90, ph - 90], [pw - 90, ph - 90]].forEach(([x, y]) => { pg.fillStyle = '#ffd36a'; pg.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 9 : 26; pg.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } pg.closePath(); pg.fill(); });
  const ptex = mkTex(pc);
  const geo = panelGeo(pw, ph, 60, 60);
  const mFront = new THREE.MeshBasicMaterial(Object.assign({ map: ptex }, base)), mSide = new THREE.MeshBasicMaterial(Object.assign({ color: 0xc99a35 }, base));
  const panel = new THREE.Mesh(geo, [mFront, mSide]); panel.position.z = -.6 / K * 0; grp.add(panel);
  const gGeo = new THREE.PlaneGeometry(PW, PH);
  const meshes = [];
  const add = (mat, x, y, z) => { const m = new THREE.Mesh(gGeo, mat); m.position.set(x, y, z); grp.add(m); meshes.push(m); return m; };
  const mS = new THREE.MeshBasicMaterial(Object.assign({ map: td, opacity: .7 }, base)); mS.depthWrite = false; add(mS, 4, -22, 40);
  const mL = []; for (let k = NLAY; k >= 1; k--) { const m = new THREE.MeshBasicMaterial(Object.assign({ map: ts }, base)); m.color.setScalar(1 - .07 * k); m.depthWrite = false; mL.push(m); add(m, k * .5, -k * 2.2, 80 + (NLAY - k) * 6); }
  const mF = new THREE.MeshBasicMaterial(Object.assign({ map: tf }, base)); mF.depthWrite = false; add(mF, 0, 0, 140);
  grp.scale.setScalar(K); if (o.pos) grp.position.set(...o.pos); grp.rotation.x = -.05; Wd.add(grp);
  let stamp = -1;
  Wd.on((lt) => {
    const t = lt + (Wd.t0 || 0);
    if (stamp !== t) { stamp = t; for (const c of [A.cx.f, A.cx.s, A.cx.d]) c.clearRect(0, 0, PW, PH);
      lay.lines.forEach(ln => ln.items.forEach(it => paintWord(A.cx, it.s, PW / 2 + it.xr, PH / 2 + lay.px * .3 + ln.dy, lay.px, t, { allGold: true })));
      tf.needsUpdate = ts.needsUpdate = td.needsUpdate = true; }
    grp.position.y = (o.pos ? o.pos[1] : 0) + Math.sin(t * .9) * .07; grp.rotation.y = Math.sin(t * .45) * .05;
    const e = eo((t - .1) / .8); mFront.opacity = mSide.opacity = e; mF.opacity = e; mS.opacity = .7 * e; mL.forEach(m => { m.opacity = e; });
  });
  return grp;
}
