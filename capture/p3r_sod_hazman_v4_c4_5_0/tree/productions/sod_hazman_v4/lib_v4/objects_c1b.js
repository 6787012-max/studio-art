// objects_c1b.js - chapter c1b set pieces + the small kit that c1b / c2 / c3 share (boot, camera cuts, glyphs, timers, table set, route map, booklet).
// No text anywhere: icons, rings, digits only where the caller asks. Every animated thing is a function of t passed in by the caller.
import { THREE, world, box, cyl, ball, mesh, toon, canvasTex, rng, ease, prog, clamp, lerp } from '../../../lib/stage3d.js';
import * as O from './objects.js';
import { caption3d, wordSpans } from './caption3d.js';
import { loadMouth, makeWatch } from './watch.js';
import { useDOF } from './dof.js';

export const D2R = Math.PI / 180, F = mm => 2 * Math.atan(12 / mm) / D2R;
export const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const backOut = k => { k = clamp(k, 0, 1); const c = k - 1; return 1 + 2.4 * c * c * c + 1.4 * c * c; };

// ---------------------------------------------------------------- chapter boot: vault + timeline + helpers bound to one chapter id
const loadJSON = url => new Promise((res, rej) => { const x = new XMLHttpRequest(); x.open('GET', url); x.onload = () => { try { res(JSON.parse(x.responseText)); } catch (e) { rej(e); } }; x.onerror = () => rej(new Error('xhr ' + url)); x.send(); });
// Long narrator lines cannot fit two lines of caption in the frame: show them as two pages (synthetic vault keys built at runtime from the original text,
// no new text is written anywhere); short last lines get a longer window so every caption stays >= 4.5 s on screen. Returns a chapter copy for caption3d only.
export function paginate(CH, vtxt) {
  const g = document.createElement('canvas').getContext('2d'); g.font = '700 74px Heebo, Assistant, sans-serif'; g.direction = 'rtl'; const sp = g.measureText(' ').width * 1.08;
  const fits = text => { const ws = String(text).split(/\s+/).filter(Boolean), w = ws.map(x => g.measureText(x).width), pre = [0]; w.forEach(x => pre.push(pre[pre.length - 1] + x)); const W = (a, b) => pre[b] - pre[a] + sp * (b - a - 1);
    if (W(0, ws.length) <= 1600) return true; let m = 1e9; for (let k = 1; k < ws.length; k++) m = Math.min(m, Math.max(W(0, k), W(k, ws.length))); return m <= 1600; };
  const out = []; const all = CH.lines;
  all.forEach((l, i) => { if (!l.cap) { out.push(l); return; }
    const text = vtxt(l.cap), ws = String(text).split(/\s+/).filter(Boolean), nxt = i + 1 < all.length ? all[i + 1].t0 : 1e9;
    if (l.kind === 'N' && l.speaker !== 'watch' && !fits(text) && ws.length >= 8) {
      const spans = wordSpans(l, text); let k = Math.round(ws.length * .6); for (let j = 3; j < ws.length - 3; j++) if (spans[j].t0 - l.t0 >= 4.8) { k = j; break; }
      k = Math.max(3, Math.min(ws.length - 3, k)); const kA = l.cap + '__a', kB = l.cap + '__b'; window.CAPTIONS_VAULT[kA] = ws.slice(0, k).join(' '); window.CAPTIONS_VAULT[kB] = ws.slice(k).join(' ');
      out.push(Object.assign({}, l, { id: l.id + 'a', cap: kA, words: (l.words || []).slice(0, k), t0: l.t0, t1: spans[k].t0, end: spans[k].t0 }));
      out.push(Object.assign({}, l, { id: l.id + 'b', cap: kB, words: (l.words || []).slice(k), t0: spans[k].t0, t1: l.t1 }));
    } else { const e = l.end || l.t1; if ((l.kind === 'N') && Math.min(e + 1, nxt - .1) - l.t0 < 4.6) out.push(Object.assign({}, l, { end: Math.min(l.t0 + 4.7, nxt - .1, CH.dur - .15) })); else out.push(l); } });
  return Object.assign({}, CH, { lines: out });
}

export async function boot(id, order, o) {
  o = o || {}; const Q = new URLSearchParams(location.search);
  window.CAPTIONS_VAULT = Object.assign(window.CAPTIONS_VAULT || {}, await loadJSON('captions_vault.json'));
  const TL = await loadJSON('timeline.json'), CH = TL.chapters.find(c => c.id === id);
  const MOUTH = o.mouth ? await loadMouth(Q.get('mouth') || ('mouth_' + id + '.json')) : null;
  try { await Promise.all([document.fonts.load('700 40px Heebo'), document.fonts.load('700 40px Assistant')]); } catch (e) {}
  const LN = k => CH.lines.find(l => l.id === k), T0 = k => LN(k).t0, vtxt = k => String(window.CAPTIONS_VAULT[k] || k);
  const SP = k => { const l = LN(k); return wordSpans(l, vtxt(l.cap)); };
  const gold0 = k => { const s = SP(k).find(w => w.gold); return s ? s.t0 : LN(k).t0; };
  const goldN = (k, n) => { const g = SP(k).filter(w => w.gold); return g.length ? g[Math.min(n, g.length - 1)].t0 : LN(k).t0; };
  const START = { intro: 0 }; order.slice(1).forEach(k => { START[k] = T0(k); });
  const ENDOF = k => { const i = order.indexOf(k); return i + 1 < order.length ? START[order[i + 1]] : CH.dur; };
  const baseCam = (Wd, near, far) => Wd.on((t, cam) => { if (cam.near !== near || cam.far !== far) { cam.near = near; cam.far = far; cam.updateProjectionMatrix(); } });
  const CHX = paginate(CH, vtxt);
  const finish = (Wd, cam, fo) => { fo = fo || {}; if (fo.dof) useDOF(Wd, fo.dof); caption3d(Wd, null, CHX); return Object.assign(Wd, { cam }); };
  return { Q, CH, MOUTH, LN, T0, SP, gold0, goldN, START, ENDOF, baseCam, finish, vtxt };
}

// ---------------------------------------------------------------- camera kit
// view spec: {t:[x,y,z] target, d distance, el elevation deg, az azimuth deg, mm lens}
export const view = s => { const el = s.el * D2R, az = (s.az || 0) * D2R; return { pos: [s.t[0] + s.d * Math.sin(az) * Math.cos(el), s.t[1] + s.d * Math.sin(el), s.t[2] + s.d * Math.cos(az) * Math.cos(el)], look: s.t, fov: F(s.mm || 40) }; };
export const move = (a, b, ez) => u => { const k = (ez || ease.io)(clamp(u, 0, 1)); return view({ t: mix3(a.t, b.t, k), d: lerp(a.d, b.d, k), el: lerp(a.el, b.el, k), az: lerp(a.az || 0, b.az || 0, k), mm: lerp(a.mm || 40, b.mm || 40, k) }); };
// cuts: segs = [[tStart, fn(u, localSeconds)], ...] in shot-local seconds; the last one runs to `dur`
export const cuts = (dur, segs) => t => { let i = 0; while (i + 1 < segs.length && t >= segs[i + 1][0]) i++; const t0 = segs[i][0], t1 = i + 1 < segs.length ? segs[i + 1][0] : dur; return segs[i][1](prog(t, t0, t1), t - t0); };
export const camFocus = c => Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
export const dofAuto = (camFn, o) => { o = o || {}; return t => { const c = camFn(t); return { focus: Math.max(.3, camFocus(c) * (o.fk || 1) + (o.fo || 0)), ap: o.ap === undefined ? 8 : o.ap, maxR: o.maxR || 14, vig: o.vig === undefined ? .4 : o.vig }; }; };
export const goldRing = (Wd, col) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, .035, 8, 64), new THREE.MeshBasicMaterial({ color: col || 0xffc84a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); m.visible = false; Wd.add(m); return m; };
export const ringAnim = (m, cam, t, t0, dur, r0, r1, op) => { const k = (t - t0) / dur; m.visible = k > 0 && k < 1; if (!m.visible) return; const e = ease.out(k); m.scale.setScalar(lerp(r0, r1, e)); m.material.opacity = op * (1 - k) * Math.min(1, k * 8); m.quaternion.copy(cam.quaternion); };

// ---------------------------------------------------------------- canvas helpers: timer ring, extruded glyph, live plane
export function ringTimer(size, color, o) {
  o = o || {}; const cw = 256, cv = document.createElement('canvas'); cv.width = cv.height = cw; const c = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, toneMapped: false }));
  let last = -9;
  const hex = '#' + new THREE.Color(color || 0xffc84a).getHexString();
  m.userData.set = (frac, tickN) => { frac = clamp(frac, 0, 1); const key = Math.round(frac * 400) + '|' + (tickN || 0); if (key === last) return; last = key;
    c.clearRect(0, 0, cw, cw); c.lineCap = 'round'; c.lineWidth = 16; c.strokeStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.arc(128, 128, 104, 0, 7); c.stroke();
    if (frac > 0) { c.shadowColor = hex; c.shadowBlur = 22; c.strokeStyle = hex; c.lineWidth = 16; c.beginPath(); c.arc(128, 128, 104, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); c.stroke(); c.shadowBlur = 0; }
    if (tickN) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; for (let i = 0; i < tickN; i++) { const a = i / tickN * Math.PI * 2; c.beginPath(); c.moveTo(128 + Math.sin(a) * 120, 128 - Math.cos(a) * 120); c.lineTo(128 + Math.sin(a) * 128, 128 - Math.cos(a) * 128); c.stroke(); } }
    tex.needsUpdate = true; };
  m.userData.set(0); return m;
}
// extruded look: front plane + stacked darker copies behind it. draw(ctx,w,h) paints on a 512x512 transparent canvas.
export function glyph3d(size, draw, o) {
  o = o || {}; const layers = o.layers || 7, step = o.step || size * .018, g = new THREE.Group();
  const tex = canvasTex(512, 512, (c, w, h) => draw(c, w, h));
  for (let i = layers; i >= 0; i--) { const front = i === 0, k = front ? 1 : (.28 + .22 * (1 - i / layers));
    const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, color: front ? 0xffffff : new THREE.Color(k * .9, k * .55, k * .12) }));
    p.position.z = -i * step; p.renderOrder = 10 - i; g.add(p); }
  g.userData.tex = tex; return g;
}
export const qMarkDraw = (c, w, h) => { const gr = c.createLinearGradient(0, 80, 0, 440); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(.5, '#ffc84a'); gr.addColorStop(1, '#e08a10'); c.fillStyle = gr; c.shadowColor = 'rgba(255,190,60,.9)'; c.shadowBlur = 36; c.font = '900 440px Heebo, Assistant, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'ltr'; c.fillText('?', 256, 276); };
export const checkDraw = (c, w, h) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = 'rgba(80,255,140,.95)'; c.shadowBlur = 36; const gr = c.createLinearGradient(0, 120, 0, 420); gr.addColorStop(0, '#c9ffd8'); gr.addColorStop(1, '#3fd47a'); c.strokeStyle = gr; c.lineWidth = 70; c.beginPath(); c.moveTo(96, 276); c.lineTo(214, 392); c.lineTo(420, 128); c.stroke(); };
// a plane whose canvas is redrawn by the caller (live texture)
export function livePlane(w, h, cw, ch, opts) {
  opts = opts || {}; const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const c = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, toneMapped: false, side: opts.double ? THREE.DoubleSide : THREE.FrontSide }));
  return { mesh: m, c, cv, tex, w: cw, h: ch, touch() { tex.needsUpdate = true; } };
}

// ---------------------------------------------------------------- the wooden table room (night, warm lamp): table top at y=0, back wall + shelves + bokeh
export function tableSet(Wd, o) {
  o = o || {}; const R = {}, g = O.grp(Wd);
  const tex = O.woodTex(11, '#a67845', 160).clone(); tex.needsUpdate = true; tex.repeat.set(3, 3);
  const tb = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), toon(0xffffff, { map: tex })); tb.rotation.x = -Math.PI / 2; tb.receiveShadow = true; g.add(tb);
  g.add(O.texBox(18, 8, .3, O.plasterTex(o.wall || '#c9b690'), 0xffffff, { pos: [0, 3.6, -5.2], k: .3, inkW: .01 }));
  [-1.6, 1.4, 3.8, -4.2].forEach((x, i) => { const sh = O.grp(Wd, { pos: [x, 0, -4.8] }); sh.add(box(1.7, 2.6, .4, 0x7a5232, { pos: [0, 1.3, 0], inkW: .01 })); const r = rng(70 + i);
    for (let row = 0; row < 4; row++) { let bx = -.76; while (bx < .74) { const bw = .08 + r() * .1, bh = .3 + r() * .18; sh.add(box(bw, bh, .28, [0xdc5a4c, 0x4a93d8, 0xffc531, 0x66a64a, 0x8a5aa8, 0xe58a3c][Math.floor(r() * 6)], { pos: [bx + bw / 2, .45 + row * .6 + bh / 2, .05], inkW: .004 })); bx += bw + .005; } } g.add(sh); });
  [[-2.4, 1.9, -4.4, 1.3], [2.2, 1.4, -4.5, 1.0], [.4, 2.6, -4.5, 1.2], [-4.6, 1.1, -4.2, 1.0], [5, 2.2, -4.2, 1.1]].forEach(([x, y, z, s]) => { const gl = O.glow(s, 0xffc070, .8); gl.position.set(x, y, z); g.add(gl); });
  R.group = g; return R;
}
export const tableLights = (Wd, o) => { o = o || {}; O.lighting(Wd, { key: [0xffd9a0, 1.0, [-1.5, 4, 3.5]], hemi: [0xd8b890, 0x3a2a1a, .72], fill: [0x7a96d8, .3, [4, 2, 3]], rim: [0xffe0b0, .8, [1.5, 2.5, -3]], target: [0, 0, 0], shadowExt: 6, fog: null,
  points: o.points || [[0xffc070, 6, [0, 1.7, .8], 8]] }); };

// ---------------------------------------------------------------- route map: parchment that unrolls, a winding gold path and 9 station pedestals with little 3D icons
let _ET = null;
export const ST9 = [[-2.4, .8], [-1.85, -.55], [-1.15, .55], [-.45, -.7], [.25, .6], [.9, -.6], [1.5, .55], [2.05, -.5], [2.5, .5]];
export function routeMap(Wd, o) {
  o = o || {}; const W = 5.8, D = 3.0, R = { W, D, st: ST9.map(p => [p[0], 0, p[1]]) };
  const root = O.grp(Wd), parch = canvasTex(1024, 540, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#ead7a6'); gr.addColorStop(.5, '#f2e2b8'); gr.addColorStop(1, '#e2c88e'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const r = rng(31); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(150,110,50,${.03 + r() * .05})`; c.beginPath(); c.ellipse(r() * w, r() * h, 20 + r() * 90, 10 + r() * 50, r() * 3, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(110,80,40,.45)'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.beginPath(); let x = r() * 200, y = r() * h; c.moveTo(x, y); for (let k = 0; k < 14; k++) { x += 50 + r() * 40; y += (r() - .5) * 60; c.lineTo(x, y); } c.stroke(); }
    c.strokeStyle = 'rgba(90,60,25,.8)'; c.lineWidth = 8; c.strokeRect(14, 14, w - 28, h - 28); c.lineWidth = 2; c.strokeRect(30, 30, w - 60, h - 60); });
  const pg = new THREE.Group(); pg.position.set(-W / 2, 0, 0); root.add(pg);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(W, D), toon(0xffffff, { map: parch })); paper.rotation.x = -Math.PI / 2; paper.position.set(W / 2, .006, 0); paper.receiveShadow = true; pg.add(paper);
  const edgeRoll = cyl(.06, .06, D + .1, 0x6a4526, { rot: [Math.PI / 2, 0, 0], pos: [0, .06, 0], inkW: .01 }); root.add(edgeRoll);
  const endRoll = cyl(.07, .07, D + .12, 0x5a3a1c, { rot: [Math.PI / 2, 0, 0], pos: [-W / 2 - .02, .07, 0], inkW: .01 }); root.add(endRoll);
  // path
  const pts = R.st.map(p => new THREE.Vector3(p[0], .03, p[2])), curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), SEG = 260;
  const tg = new THREE.TubeGeometry(curve, SEG, .03, 8, false), tg2 = new THREE.TubeGeometry(curve, SEG, .036, 8, false), per = 8 * 6;
  const base = new THREE.Mesh(tg, toon(0x7a6a52)); base.receiveShadow = true; root.add(base);
  const lit = new THREE.Mesh(tg2, new THREE.MeshBasicMaterial({ color: 0xffc43a, fog: false })); root.add(lit);
  const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, SEG, .075, 8, false), new THREE.MeshBasicMaterial({ color: 0xffa81a, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); root.add(halo);
  R.curve = curve; R.root = root;
  // arc-length fractions of the stations
  const samp = curve.getPoints(800); const cum = [0]; for (let i = 1; i < samp.length; i++) cum.push(cum[i - 1] + samp[i].distanceTo(samp[i - 1]));
  R.fr = pts.map(p => { let bi = 0, bd = 1e9; samp.forEach((s, i) => { const d = s.distanceTo(p); if (d < bd) { bd = d; bi = i; } }); return cum[bi] / cum[cum.length - 1]; });
  // stations
  const earthTex = _ET || (_ET = O.earthTexture()); R.sts = [];
  const mk = (i) => { const p = R.st[i], G = new THREE.Group(); G.position.set(p[0], 0, p[2]); root.add(G);
    const disc = cyl(.2, .22, .035, 0x6a6a72, { pos: [0, .02, 0], inkW: .008 }); G.add(disc); const ringG = new THREE.Mesh(new THREE.TorusGeometry(.2, .012, 8, 40), new THREE.MeshBasicMaterial({ color: 0xffc84a, transparent: true, opacity: 0, fog: false })); ringG.rotation.x = Math.PI / 2; ringG.position.y = .04; G.add(ringG);
    const icon = new THREE.Group(); icon.position.y = .04; G.add(icon); const gl = O.glow(1.2, 0xffc060, 0); gl.position.y = .3; G.add(gl);
    const upd = R.icons[i](icon, earthTex); return { G, disc, ringG, icon, gl, upd }; };
  R.icons = [];
  // 1 sefer
  R.icons[0] = icon => { const s = O.sefer(Wd, { bright: 1.0 }); s.scale.setScalar(.4); s.position.y = .16; s.rotation.x = .22; icon.add(s); const stand = box(.3, .06, .22, 0x5a3416, { pos: [0, .07, 0], inkW: .006 }); icon.add(stand); return t => { s.position.y = .17 + Math.sin(t * 1.6) * .012; }; };
  // 2 rotating earth
  R.icons[1] = (icon, tex) => { const e = new THREE.Mesh(new THREE.SphereGeometry(.17, 32, 20), toon(0xffffff, { map: tex })); e.position.y = .28; icon.add(e); const ax = cyl(.008, .008, .46, 0xcfcfd8, { pos: [0, .28, 0], rot: [0, 0, -23.5 * D2R], ink: false }); icon.add(ax); return t => { e.rotation.y = t * 1.1; e.rotation.z = -23.5 * D2R; }; };
  // 3 tilted orbit
  R.icons[2] = icon => { const sun = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), O.basic(0xffd23a)); sun.position.y = .26; icon.add(sun); const tilt = new THREE.Group(); tilt.position.y = .26; tilt.rotation.x = 18 * D2R; icon.add(tilt);
    const orb = new THREE.Mesh(new THREE.TorusGeometry(.19, .006, 6, 56), O.basic(0xcfe0ff)); orb.rotation.x = Math.PI / 2; tilt.add(orb); const pl = new THREE.Group(); tilt.add(pl); const pb = ball(.045, 0x3a8ae0, { pos: [.19, 0, 0], inkW: .006 }); pl.add(pb); pb.add(cyl(.004, .004, .14, 0xffffff, { rot: [0, 0, 23.5 * D2R], ink: false }));
    return t => { pl.rotation.y = -t * 1.3; sun.scale.setScalar(1 + .06 * Math.sin(t * 3)); }; };
  // 4 day bar, 12 segments
  R.icons[3] = icon => { const bars = []; for (let i = 0; i < 12; i++) { const b = box(.034, .05, .09, 0xffc84a, { pos: [(i - 5.5) * .038, .1, 0], inkW: .004 }); b.material = b.material.clone(); icon.add(b); bars.push(b); } icon.add(box(.5, .02, .12, 0x5a3416, { pos: [0, .07, 0], inkW: .005 }));
    return t => { bars.forEach((b, i) => { const k = (Math.sin(t * 2.2 - i * .5) + 1) / 2; b.material.color.setRGB(lerp(.55, 1, k), lerp(.38, .8, k), lerp(.12, .25, k)); b.scale.y = 1 + k * .8; b.position.y = .095 + .025 * k; }); }; };
  // 5 wall clock
  R.icons[4] = icon => { const c = O.wallClock(Wd, { r: .16 }); c.group.parent && c.group.parent.remove(c.group); c.group.position.y = .25; icon.add(c.group); return t => { c.setTime(t * 900, Math.floor(t * 3) * Math.PI / 30); }; };
  // 6 clock + two curved arrows + siddur
  R.icons[5] = icon => { const c = O.wallClock(Wd, { r: .11 }); c.group.parent && c.group.parent.remove(c.group); c.group.position.set(-.1, .26, 0); icon.add(c.group);
    const arrow = (flip) => { const g = new THREE.Group(); const arc = new THREE.Mesh(new THREE.TorusGeometry(.17, .014, 8, 24, Math.PI * .85), O.basic(0xffd060)); g.add(arc); const cone = new THREE.Mesh(new THREE.ConeGeometry(.04, .09, 10), O.basic(0xffd060)); const a = Math.PI * .85; cone.position.set(Math.cos(a) * .17, Math.sin(a) * .17, 0); cone.rotation.z = a - Math.PI / 2 + Math.PI; g.add(cone); if (flip) g.rotation.z = Math.PI; g.position.set(-.1, .26, .02); return g; };
    const a1 = arrow(false), a2 = arrow(true); icon.add(a1); icon.add(a2); const sid = box(.13, .17, .035, 0x1f2f5a, { pos: [.2, .13, 0], rot: [0, -.3, 0], inkW: .006 }); icon.add(sid); sid.add(box(.02, .17, .04, 0xffc84a, { pos: [-.05, 0, 0], ink: false })); sid.add(box(.06, .06, .04, 0xffc84a, { pos: [.015, .02, .002], ink: false }));
    return t => { c.setTime(7200 - ((t * 400) % 3600), Math.floor(t * 3) * Math.PI / 30); a1.rotation.z = t * 1.2; a2.rotation.z = Math.PI + t * 1.2; }; };
  // 7 sunrise
  R.icons[6] = icon => { icon.add(box(.5, .02, .2, 0x3a4a30, { pos: [0, .09, 0], inkW: .005 })); const sun = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 14), O.basic(0xffd23a)); icon.add(sun); const rays = new THREE.Group(); icon.add(rays); for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI; const rr = new THREE.Mesh(new THREE.BoxGeometry(.02, .08, .01), O.basic(0xffe08a)); rr.position.set(Math.cos(a) * .17, Math.sin(a) * .17, 0); rr.rotation.z = a - Math.PI / 2; rays.add(rr); }
    const hz = box(.52, .12, .22, 0x2a3a58, { pos: [0, .03, .0], inkW: .005 }); icon.add(hz); hz.visible = false; return t => { const k = (Math.sin(t * 1.1) + 1) / 2; sun.position.set(0, .06 + k * .22, -.02); rays.position.set(0, sun.position.y, -.02); rays.scale.setScalar(.7 + .5 * k); }; };
  // 8 polar sun circle: sun circles above the horizon, never sets
  R.icons[7] = icon => { const hz = cyl(.24, .24, .02, 0xeaf2ff, { pos: [0, .07, 0], inkW: .005 }); icon.add(hz); const ring = new THREE.Mesh(new THREE.TorusGeometry(.2, .006, 6, 56), O.basic(0xffd060)); ring.rotation.x = Math.PI / 2; ring.position.y = .13; icon.add(ring);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), O.basic(0xffd23a)); icon.add(sun); return t => { sun.position.set(Math.cos(t * 1.3) * .2, .13, Math.sin(t * 1.3) * .2); }; };
  // 9 moon phases
  R.icons[8] = icon => { icon.add(box(.5, .02, .1, 0x5a3416, { pos: [0, .08, 0], inkW: .005 })); const dxs = [-.03, -.052, -.085, null]; dxs.forEach((dx, i) => { const x = (i - 1.5) * .12; const m = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), O.basic(0xf4efd8)); m.position.set(x, .16, 0); icon.add(m);
      if (dx !== null) { const d = new THREE.Mesh(new THREE.SphereGeometry(.052, 16, 12), O.basic(0x0c1226)); d.position.set(x + dx, .16, .02); icon.add(d); } }); return t => { icon.rotation.y = Math.sin(t * .8) * .25; }; };
  for (let i = 0; i < 9; i++) R.sts.push(mk(i));
  const col0 = new THREE.Color(0x6a6a72), col1 = new THREE.Color(0xffc84a);
  // state: u = unroll 0..1, kst[i] = station lit progress 0..1, pf = path fraction lit, t = seconds (icons idle motion)
  R.set = (u, kst, pf, t) => {
    const ex = -W / 2 + W * u; pg.scale.x = Math.max(.001, u); edgeRoll.position.x = ex; edgeRoll.visible = u < 1; edgeRoll.rotation.z = 0; endRoll.visible = u > 0;
    const vis = ex + .05; base.visible = u > .02; tg.setDrawRange(0, Math.floor(clamp((ex + W / 2 - .0) / W, 0, 1) * SEG) * per); base.geometry = tg;
    const n = Math.floor(clamp(pf, 0, 1) * SEG) * per; tg2.setDrawRange(0, n); tg.setDrawRange(0, Math.floor(clamp((vis + W / 2) / W * 1.0, 0, 1) * SEG) * per); halo.geometry.setDrawRange(0, n);
    lit.visible = halo.visible = n > 0;
    R.sts.forEach((s, i) => { const shown = R.st[i][0] < vis - .15, k = clamp(kst[i] || 0, 0, 1); s.G.visible = shown; if (!shown) return;
      const sc = k > 0 ? backOut(k) : .001; s.icon.scale.setScalar(Math.max(.001, sc)); s.disc.material.color.copy(col0).lerp(col1, ease.sm(k)); s.ringG.material.opacity = k > 0 ? .9 * Math.sin(Math.PI * Math.min(1, k * 1.6)) * .7 + .25 * k : 0; s.ringG.scale.setScalar(1 + (1 - ease.out(k)) * .8);
      s.gl.material.opacity = k > 0 ? .85 * Math.sin(Math.PI * clamp(k * .8, 0, 1)) + .3 * k : 0; s.gl.scale.setScalar(lerp(2.2, 1.0, ease.out(k))); s.upd(t); });
  };
  return R;
}

// ---------------------------------------------------------------- an open booklet on the table + a pencil that writes progressively (live canvas strokes on the right page)
export function booklet(Wd, o) {
  o = o || {}; const g = O.grp(Wd, o), pt = O.pageTex(14), cov = 0x1f2f5a;
  const mk = (tex) => new THREE.MeshBasicMaterial({ map: tex, fog: false, color: new THREE.Color(.95, .93, .84) });
  const L = new THREE.Mesh(new THREE.PlaneGeometry(.4, .54), mk(pt)); L.rotation.x = -Math.PI / 2; L.position.set(-.21, .013, 0); g.add(L); g.add(box(.42, .012, .56, cov, { pos: [-.215, .006, 0], inkW: .004 }));
  const pivot = new THREE.Group(); pivot.position.set(0, .006, 0); g.add(pivot);
  const Rp = new THREE.Mesh(new THREE.PlaneGeometry(.4, .54), mk(O.pageTex(15))); Rp.rotation.x = -Math.PI / 2; Rp.position.set(.21, .008, 0); pivot.add(Rp); pivot.add(box(.42, .012, .56, cov, { pos: [.215, 0, 0], inkW: .004 }));
  const back = new THREE.Mesh(new THREE.PlaneGeometry(.4, .54), mk(pt)); back.rotation.x = Math.PI / 2; back.position.set(.21, -.004, 0); pivot.add(back);
  g.add(box(.02, .016, .56, 0x142040, { pos: [0, .008, 0], inkW: .003 }));
  const wr = livePlane(.38, .52, 380, 520); wr.mesh.rotation.x = -Math.PI / 2; wr.mesh.position.set(.21, .0105, 0); pivot.add(wr.mesh);
  // pencil (tip placed at page coordinates)
  const pen = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(.0065, .0065, .17, 6), toon(0xf5c431)); body.position.y = .085 + .012; pen.add(body);
  const tipc = new THREE.Mesh(new THREE.ConeGeometry(.0065, .022, 6), toon(0xe2c28a)); tipc.rotation.x = Math.PI; tipc.position.y = .006; pen.add(tipc); const lead = new THREE.Mesh(new THREE.ConeGeometry(.0026, .008, 6), toon(0x2a2a2a)); lead.rotation.x = Math.PI; lead.position.y = -.001; pen.add(lead);
  const er = new THREE.Mesh(new THREE.CylinderGeometry(.0068, .0068, .016, 6), toon(0xe0707a)); er.position.y = .182; pen.add(er); const fer = new THREE.Mesh(new THREE.CylinderGeometry(.0069, .0069, .012, 6), toon(0xc9c9d2)); fer.position.y = .17; pen.add(fer);
  pen.children.forEach(m => { m.castShadow = true; }); const penG = new THREE.Group(); penG.add(pen); g.add(penG); pen.rotation.z = -.9;
  const NL = 11, lineY = j => 70 + j * 38, scrib = (j, x) => lineY(j) + Math.sin(x * .33 + j * 1.7) * 3.4 + Math.sin(x * .09 + j) * 2;
  const api = { group: g, pen: penG, write(p) { // p 0..1 total writing progress
    const c = wr.c; c.clearRect(0, 0, 380, 520); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#1a2a6a'; c.lineWidth = 3.2; const tot = p * NL; let tx = 0, ty = 0, any = false;
    for (let j = 0; j < NL; j++) { const f = clamp(tot - j, 0, 1); if (f <= 0) break; const xe = 40 + f * 300; c.beginPath(); for (let x = 40; x <= xe; x += 6) { const y = scrib(j, x) + ((x * 7 + j * 13) % 11 > 6 ? -5 : 0); x === 40 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); tx = xe; ty = scrib(j, xe); any = true; }
    wr.touch(); const lx = .21 + (tx - 190) * .001, lz = (ty - 260) * .001; api.tip = [lx, .0115, lz]; penG.position.set(lx, .0115, lz); penG.visible = any; pen.position.y = Math.abs(Math.sin(p * 90)) * .002; },
    open(k) { pivot.rotation.z = Math.PI * (1 - ease.io(clamp(k, 0, 1))); wr.mesh.visible = k >= 1; Rp.visible = true; } };
  api.open(1); api.write(0); return api;
}

// ---------------------------------------------------------------- watch stage: the table room + the pocket watch (every W line), same composition as c1 (watch right of centre, ~50 % frame height)
export function watchStage(Wd, B, o) {
  o = o || {}; const wp = o.pos || [0, .122, 0];
  tableSet(Wd, o); tableLights(Wd, { points: o.points });
  const W = makeWatch(Wd, { scale: .24, lines: B.CH.lines, mouth: B.MOUTH }); W.obj.position.set(...wp); W.obj.rotation.set(-.18, 0, 0); Wd.add(W.obj); Wd.hero = W.obj;
  return { W, wp };
}
export const watchCam = (wp, dur, o) => { o = o || {}; return t => { const k = ease.io(prog(t, 0, dur)); return { pos: [wp[0] + (o.dx || 0), wp[1] + .3, wp[2] + lerp(o.z0 || 1.34, o.z1 || 1.18, k)], look: [wp[0] - (o.lx === undefined ? .1 : o.lx), wp[1] + .17, wp[2]], fov: F(50) }; }; };
