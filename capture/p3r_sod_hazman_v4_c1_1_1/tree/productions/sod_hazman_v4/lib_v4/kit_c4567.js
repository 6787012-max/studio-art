// kit_c4567.js - helpers shared by chapters c4..c7 only (the frozen lib_v4 modules are NOT edited). Zero Hebrew: digits and Latin symbols only.
// Everything is a pure function of t.
import { THREE, film, world, box, cyl, ball, mesh, toon, ease, prog, clamp, lerp, rng, canvasTex } from '../../../lib/stage3d.js';
import * as O from './objects.js';
import { caption3d, wordSpans, titleCard3d, captionInfo } from './caption3d.js';
import { makeWatch } from './watch.js';
import { useDOF } from './dof.js';

export { THREE, box, cyl, ball, mesh, toon, ease, prog, clamp, lerp, rng, canvasTex, O };
export const D2R = Math.PI / 180, F = mm => 2 * Math.atan(12 / mm) / D2R;
export const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const loadJSON = url => new Promise((res, rej) => { const x = new XMLHttpRequest(); x.open('GET', url); x.onload = () => { try { res(JSON.parse(x.responseText)); } catch (e) { rej(e); } }; x.onerror = () => rej(new Error('xhr ' + url)); x.send(); });
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export { sm };

// ---------------------------------------------------------------- chapter context (timeline helpers, shot plumbing)
export function makeCtx(CH, ORDER) {
  const LN = id => CH.lines.find(l => l.id === id), T0 = id => LN(id).t0, EN = id => { const l = LN(id); return l.end !== undefined ? l.end : l.t1; };
  const vtxt = k => String(window.CAPTIONS_VAULT[k] || k);
  const gold0 = id => { const l = LN(id), s = l.cap ? wordSpans(l, vtxt(l.cap)).find(w => w.gold) : null; return s ? s.t0 : l.t0; };
  const goldSpans = id => { const l = LN(id); return l.cap ? wordSpans(l, vtxt(l.cap)).filter(w => w.gold) : []; };
  const at = (id, u) => lerp(T0(id), EN(id), u);                 // global time at fraction u of a line (t0 .. end)
  const START = { intro: 0 }; ORDER.slice(1).forEach(k => { if (CH.lines.some(l => l.id === k)) START[k] = T0(k); });
  const ENDOF = k => { const i = ORDER.indexOf(k); return i + 1 < ORDER.length ? START[ORDER[i + 1]] : CH.dur; };
  const baseCam = (Wd, near, far) => Wd.on((t, cam) => { if (cam.near !== near || cam.far !== far) { cam.near = near; cam.far = far; cam.updateProjectionMatrix(); } });
  // long narrator lines (> LONGCH chars) cannot fit two lines at the minimum caption size; they are shown as two consecutive halves (same words, same timing, no new text)
  const LONGCH = 1e9, capLines = [];
  CH.lines.forEach(l => { const text = l.cap ? vtxt(l.cap) : '';
    if (l.cap && l.kind === 'N' && text.length > LONGCH && (l.end !== undefined ? l.end : l.t1) - l.t0 >= 9 && l.words && l.words.length >= 6) {
      const tk = text.split(/\s+/).filter(Boolean); if (tk.length !== l.words.length) { capLines.push(l); return; }
      const tot = tk.reduce((a, w) => a + w.length + 1, 0); let acc = 0, k = 1; for (; k < tk.length - 1; k++) { acc += tk[k - 1].length + 1; if (acc >= tot / 2) break; }
      const before = tk.slice(0, k).reduce((a, w) => a + w.length + 1, 0), ts = l.t0 + (l.t1 - l.t0) * .94 * before / tot;
      window.CAPTIONS_VAULT[l.cap + '_a'] = tk.slice(0, k).join(' '); window.CAPTIONS_VAULT[l.cap + '_b'] = tk.slice(k).join(' ');
      capLines.push(Object.assign({}, l, { id: l.id + 'a', cap: l.cap + '_a', t1: ts, end: ts, words: l.words.slice(0, k) }), Object.assign({}, l, { id: l.id + 'b', cap: l.cap + '_b', t0: ts, words: l.words.slice(k) }));
    } else capLines.push(l); });
  const capCH = Object.assign({}, CH, { lines: capLines });
  const finish = (Wd, cam, o) => { o = o || {}; if (o.dof) useDOF(Wd, o.dof); caption3d(Wd, null, capCH); return Object.assign(Wd, { cam }); };
  return { CH, LN, T0, EN, vtxt, gold0, goldSpans, at, START, ENDOF, ORDER, baseCam, finish };
}

// camera as a sequence of cut segments in GLOBAL time. seg = {t, p:[x,y,z] | [[from],[to]], l:..., mm: n | [from,to], e:'io'|'out'|'sm'|'lin', fd: focusDistance?}
const two = v => (Array.isArray(v[0]) ? v : [v, v]);
export function camSeq(a, b, segs, mmK) {
  mmK = mmK || 1;
  const S = segs.map(s => ({ t: s.t, p: two(s.p), l: two(s.l), mm: Array.isArray(s.mm) ? s.mm : [s.mm, s.mm], e: s.e || 'io', sh: s.sh || 0 }));
  const f = t => {
    const g = t + a; let i = 0; while (i < S.length - 1 && g >= S[i + 1].t) i++;
    const s = S[i], te = i + 1 < S.length ? S[i + 1].t : b, u = prog(g, s.t, te), k = s.e === 'lin' ? u : (ease[s.e] || ease.io)(u);
    const pos = mix3(s.p[0], s.p[1], k), look = mix3(s.l[0], s.l[1], k);
    if (s.sh) { pos[0] += Math.sin(g * 13.1) * s.sh; pos[1] += Math.sin(g * 11.3 + 1) * s.sh; }
    return { pos, look, fov: F(lerp(s.mm[0], s.mm[1], k) * mmK) };
  };
  return f;
}
export const dofOf = (camF, o) => { o = o || {}; return t => { const c = camF(t), d = Math.max(.3, Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2])); return { focus: o.focus || d, ap: o.ap !== undefined ? o.ap : clamp(24 / d, 1.6, 20), maxR: o.maxR || 14, vig: o.vig === undefined ? .38 : o.vig }; }; };

// ---------------------------------------------------------------- text planes (digits and symbols only)
const TT = new Map();
export function textTex(str, o) {
  o = o || {}; const key = str + '|' + (o.fg || '') + '|' + (o.bg || '') + '|' + (o.glow || '') + '|' + (o.cw || 0);
  if (TT.has(key)) return TT.get(key);
  const cw = o.cw || 512, ch = o.ch || Math.round(cw / 2), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d');
  if (o.bg) { g.fillStyle = o.bg; const r = ch * .18; g.beginPath(); g.moveTo(r, 0); g.lineTo(cw - r, 0); g.quadraticCurveTo(cw, 0, cw, r); g.lineTo(cw, ch - r); g.quadraticCurveTo(cw, ch, cw - r, ch); g.lineTo(r, ch); g.quadraticCurveTo(0, ch, 0, ch - r); g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0); g.fill(); }
  let fs = ch * .74; g.font = `800 ${fs}px Heebo, Assistant, sans-serif`; const w = g.measureText(str).width; if (w > cw * .92) { fs *= cw * .92 / w; g.font = `800 ${fs}px Heebo, Assistant, sans-serif`; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'ltr';
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = fs * .3; }
  g.fillStyle = o.fg || '#2a1606'; g.fillText(str, cw / 2, ch * .53);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; TT.set(key, t); return t;
}
export function textPlane(w, h, o) {
  o = o || {}; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, fog: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending }));
  m.renderOrder = 5; let cur = null;
  const set = (str, st) => { const s = String(str); if (s === cur && !st) return; cur = s; m.material.map = textTex(s, Object.assign({}, o, st || {})); m.material.needsUpdate = true; m.visible = s.length > 0; };
  set(o.text === undefined ? '' : o.text); return { mesh: m, set, opacity(v) { m.material.opacity = v; m.visible = v > .01 && cur.length > 0; } };
}
export const fmtHM = h => { const t = Math.round(h * 60), hh = Math.floor(t / 60) % 24, mm = ((t % 60) + 60) % 60; return hh + ':' + String(mm).padStart(2, '0'); };

// ---------------------------------------------------------------- small shared props
export const goldRing = (Wd, col) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, .035, 8, 64), new THREE.MeshBasicMaterial({ color: col || 0xffc84a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); m.visible = false; Wd.add(m); return m; };
export const ringAnim = (m, cam, t, t0, dur, r0, r1, op) => { const k = (t - t0) / dur; m.visible = k > 0 && k < 1; if (!m.visible) return; m.scale.setScalar(lerp(r0, r1, ease.out(k))); m.material.opacity = op * (1 - k) * Math.min(1, k * 8); m.quaternion.copy(cam.quaternion); };
export function sunBall(Wd, r, o) {
  o = o || {}; const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 28, 16), O.basic(o.core || 0xffe08a)));
  const g1 = O.glow(r * 5, o.halo || 0xffc060, .8), g2 = O.glow(r * 12, o.halo2 || 0xffa860, .3); g.add(g1); g.add(g2); g.userData = { g1, g2 }; (Wd.add ? Wd.add(g) : Wd.scene.add(g)); return g;
}
export function tube(pts, r, color, o) {
  o = o || {}; const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), !!o.closed, 'catmullrom', .5), geo = new THREE.TubeGeometry(curve, o.seg || 120, r, o.rs || 6, !!o.closed);
  const m = new THREE.Mesh(geo, o.toon ? toon(color) : new THREE.MeshBasicMaterial({ color, transparent: o.op !== undefined, opacity: o.op === undefined ? 1 : o.op, fog: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !o.add }));
  m.userData.total = geo.index.count; m.userData.curve = curve; m.frustumCulled = false; return m;
}
export const reveal = (m, k) => { const n = Math.floor(m.userData.total * clamp(k, 0, 1) / 3) * 3; m.geometry.setDrawRange(0, n); m.visible = n > 0; };
export function arcPts(r, a0, a1, n, plane) { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n) * D2R; p.push(plane === 'xz' ? [Math.cos(a) * r, 0, Math.sin(a) * r] : [Math.cos(a) * r, Math.sin(a) * r, 0]); } return p; }
export function candle(Wd, o) {
  o = o || {}; const g = O.grp(Wd, { pos: o.pos, scale: o.scale }), h = o.h || .3; g.add(cyl(.035, .04, h, o.wax || 0xf3e6c8, { pos: [0, h / 2, 0], inkW: .006 })); g.add(cyl(.004, .004, .04, 0x2a1a0a, { pos: [0, h + .02, 0], ink: false }));
  const fl = O.glow(.4, 0xffb050, .95), halo = O.glow(1.6, 0xffc070, .35); fl.position.y = h + .1; halo.position.y = h + .12; g.add(fl); g.add(halo);
  const core = new THREE.Mesh(new THREE.SphereGeometry(.028, 10, 8), O.basic(0xffe9a0)); core.scale.set(1, 1.9, 1); core.position.y = h + .08; g.add(core);
  return { group: g, tick(t, lit, ph) { const f = 1 + .13 * Math.sin(t * 9 + (ph || 0)) * Math.sin(t * 3.7 + (ph || 0) * 2); fl.scale.setScalar(.4 * f * lit); halo.scale.setScalar(1.6 * lit * (1 + .04 * Math.sin(t * 5 + (ph || 0)))); core.scale.set(lit, 1.9 * lit * f, lit); g.visible = true; fl.visible = halo.visible = core.visible = lit > .01; } };
}
// local sun direction (ENU mapped to world x=east, y=up, z=south). hour angle h in degrees (negative = morning)
export function sunDir(latDeg, decDeg, hDeg) {
  const p = latDeg * D2R, d = decDeg * D2R, H = hDeg * D2R, sa = Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H), alt = Math.asin(clamp(sa, -1, 1)), ca = Math.cos(alt);
  let ca2 = clamp((Math.sin(d) - Math.sin(p) * sa) / (Math.max(1e-6, Math.cos(p) * ca)), -1, 1), az = Math.acos(ca2); if (Math.sin(H) > 0) az = 2 * Math.PI - az;   // az from north, clockwise
  return { v: [Math.sin(az) * ca, Math.sin(alt), -Math.cos(az) * ca], alt: alt / D2R, az: az / D2R };
}
export const dayHalfAngle = (latDeg, decDeg) => Math.acos(clamp(-Math.tan(latDeg * D2R) * Math.tan(decDeg * D2R), -1, 1)) / D2R;

// ---------------------------------------------------------------- the day board: 24h rail, sky strip, 4 slabs / 12 blocks between sunrise and sunset
export function dayBoard(Wd, o) {
  o = o || {}; const HW = o.hw || .5, W = 24 * HW, H = o.h || 2.1, G = O.grp(Wd, { pos: o.pos, rot: o.rot, scale: o.scale }), X = h => (h - 12) * HW, wood = 0x6a4526;
  G.add(box(W + .6, .28, .9, wood, { pos: [0, .14, .1], inkW: .012 })); G.add(box(W + .6, .12, .18, 0x8a5a30, { pos: [0, .34, .56], inkW: .008 }));
  G.add(box(W + .6, .16, .5, wood, { pos: [0, H + .45, -.25], inkW: .01 })); [-1, 1].forEach(s => G.add(box(.18, H + .3, .5, wood, { pos: [s * (W / 2 + .2), (H + .3) / 2 + .2, -.25], inkW: .01 })));
  for (let i = 0; i <= 24; i++) G.add(box(.035, i % 6 === 0 ? .16 : .08, .03, 0xe9d29a, { pos: [X(i), .28 + (i % 6 === 0 ? .08 : .04), .56], ink: false }));
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 2; const cx = cv.getContext('2d'), stex = new THREE.CanvasTexture(cv); stex.colorSpace = THREE.SRGBColorSpace;
  const skyM = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: stex, toneMapped: false, fog: false })); skyM.position.set(0, .35 + H / 2, -.1); G.add(skyM);
  let last = { sr: -1, ss: -1 };
  const NI = [8, 16, 50], DA = [255, 232, 168], PI_ = [236, 118, 84];
  function paint(sr, ss) { for (let i = 0; i < 1024; i++) { const h = i / 1023 * 24, d = sm(sr - 1.1, sr + .9, h) * (1 - sm(ss - .9, ss + 1.1, h)), p = Math.exp(-Math.pow((h - sr) / .8, 2)) + Math.exp(-Math.pow((h - ss) / .8, 2));
      for (let r = 0; r < 2; r++) { const k = r === 0 ? .78 : 1.0, c = [0, 1, 2].map(j => { let v = lerp(NI[j], DA[j], d); v = lerp(v, PI_[j], clamp(p, 0, 1) * .55 * (1 - d * .4)); return Math.round(clamp(v * k, 0, 255)); }); cx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; cx.fillRect(i, r, 1, 1); } } stex.needsUpdate = true; }
  // blocks / slabs
  const gold = [0xf2b83a, 0xe89f2a], teal = [0x3aa6a0, 0x2d8a98], blocks = [], slabs = [], labels = [];
  for (let i = 0; i < 12; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1, .85, .5), toon(gold[i % 2], { emissive: 0xffa010, emissiveIntensity: .3 })); b.castShadow = true; b.add(new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: 0x3a2208 }))); b.position.y = .72; G.add(b); blocks.push(b);
    const lp = textPlane(.6, .36, { fg: '#2a1606' }); lp.mesh.position.set(0, .72, .27); G.add(lp.mesh); labels.push(lp); }
  for (let j = 0; j < 4; j++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1.0, .56), toon(teal[j % 2], { emissive: 0x20c0b0, emissiveIntensity: .25 })); b.add(new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: 0x0a2a30 }))); b.position.y = .8; b.castShadow = true; G.add(b); slabs.push(b); }
  // sunrise / sunset posts + suns + time tags
  const post = [0, 1].map(i => { const p = box(.05, H - .1, .05, 0xe6b84a, { pos: [0, .35 + H / 2, .1], inkW: .008 }); G.add(p); const s = sunBall(G, .2, i ? { core: 0xff9a50, halo: 0xff8040, halo2: 0xe06030 } : {}); const tg = textPlane(1.3, .65, { fg: '#ffe9b0', glow: 'rgba(255,200,90,.9)' }); tg.mesh.position.y = H + .95; G.add(tg.mesh); return { p, s, tg }; });
  const marks = [];
  const api = { group: G, X, xr: h => X(h), blocks, slabs, labels, marks, post, W, H, HW };
  api.addMark = (col, fracFn) => { const g = new THREE.Group(), stem = box(.06, 1.5, .06, col || 0xffd070, { pos: [0, .75, 0], inkW: .008 }), hd = new THREE.Mesh(new THREE.SphereGeometry(.14, 14, 10), O.basic(col || 0xffd070)), gl = O.glow(1.3, col || 0xffd070, .9); hd.position.y = 1.55; gl.position.y = 1.55; g.add(stem); g.add(hd); g.add(gl); g.position.z = .5; G.add(g); const m = { g, frac: fracFn, k: 0 }; marks.push(m); return m; };
  api.set = S => {
    S = S || {}; const sr = S.sr === undefined ? 6 : S.sr, ss = S.ss === undefined ? 18 : S.ss, span = ss - sr, bw = span / 12 * HW, q = S.q || 0, s12 = S.s === undefined ? 0 : S.s, pulse = S.pulse || 0, lit = S.lit === undefined ? 12 : S.lit, hi = S.hi || null;
    if (Math.abs(sr - last.sr) > 1e-3 || Math.abs(ss - last.ss) > 1e-3) { paint(sr, ss); last = { sr, ss }; }
    post.forEach((pp, i) => { const hh = i ? ss : sr, x = X(hh), k = S.suns === undefined ? 1 : S.suns; pp.p.position.x = x; pp.p.visible = k > .02; pp.s.position.set(x, .35 + H * (i ? .3 : .3), .2); pp.s.scale.setScalar(Math.max(.001, k)); pp.s.visible = k > .02;
      pp.tg.mesh.position.x = x; const tt = i ? S.tr : S.tl; pp.tg.set(tt === undefined || tt === null ? '' : tt); pp.tg.opacity(S.tagK === undefined ? 1 : S.tagK); });
    for (let j = 0; j < 4; j++) { const k = ease.out(clamp(q * 1.5 - j * .15, 0, 1)) * (1 - ease.sm(clamp(s12 * 2, 0, 1))); const b = slabs[j]; b.visible = k > .01; b.position.x = X(sr + (3 * j + 1.5) * span / 12); b.scale.set(Math.max(.001, 3 * bw * .965 * k), k, k); b.material.emissiveIntensity = .25 + .6 * pulse; }
    for (let i = 0; i < 12; i++) { const k = ease.out(clamp(s12 * 1.7 - i / 11 * .7, 0, 1)), b = blocks[i], l = clamp(lit - i, 0, 1), hl = hi ? (hi.indexOf(i) >= 0 ? 1 : 0) : 0; b.visible = k > .01; b.position.x = X(sr + (i + .5) * span / 12); b.scale.set(Math.max(.001, bw * .92 * k), k * (1 + .16 * pulse + .22 * hl), k);
      b.material.emissiveIntensity = .12 + .55 * l + .9 * pulse * l + .8 * hl; const lb = labels[i], on = S.label !== undefined && S.label !== null && k > .6 ? (S.labelK === undefined ? 1 : S.labelK) : 0;
      lb.mesh.position.x = b.position.x; lb.mesh.scale.setScalar(Math.min(1, bw * .9 / .6)); lb.set(on > .02 ? String(S.label) : ''); lb.opacity(on); lb.mesh.position.y = .72 + (b.scale.y - 1) * .4; }
    marks.forEach(m => { const x = X(sr + m.frac() * span); m.g.position.x = x; m.g.visible = m.k > .01; m.g.scale.set(1, Math.max(.001, ease.out(m.k)), 1); });
    return api;
  };
  api.set({}); return api;
}

// ---------------------------------------------------------------- hourglass
export function hourglass(Wd, o) {
  o = o || {}; const G = O.grp(Wd, { pos: o.pos, scale: o.scale || 1 }), sand = o.sand || 0xf2c25a, wd = 0x7a4a24;
  [-1, 1].forEach(s => G.add(cyl(.62, .62, .1, wd, { pos: [0, s * 1.05, 0], inkW: .02 }))); [-1, 1].forEach(a => [-1, 1].forEach(b => G.add(cyl(.04, .04, 2.1, 0x9a6a3a, { pos: [a * .5, 0, b * .5], inkW: .01 }))));
  const glassM = () => new THREE.MeshToonMaterial({ color: 0xbfe4ff, transparent: true, opacity: .22, depthWrite: false });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(.52, .06, .95, 28, 1, true), glassM()), bot = new THREE.Mesh(new THREE.CylinderGeometry(.06, .52, .95, 28, 1, true), glassM()); top.position.y = .5; bot.position.y = -.5; G.add(top); G.add(bot);
  const topS = new THREE.Mesh(new THREE.CylinderGeometry(.5, .06, .9, 24), toon(sand)), botS = new THREE.Mesh(new THREE.CylinderGeometry(.04, .5, .9, 24), toon(sand)), flow = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1, 6), O.basic(sand));
  G.add(topS); G.add(botS); G.add(flow);
  const lb = textPlane(1.6, .8, { fg: '#ffe9b0', glow: 'rgba(255,200,90,.9)' }); lb.mesh.position.set(0, 1.8, .3); G.add(lb.mesh);
  const api = { group: G, label: lb, set(fill, text, textK) { // fill 0 = all sand in the top glass, 1 = all in the bottom
    const f = clamp(fill, 0, 1), st = Math.max(.001, 1 - f), sb = Math.max(.001, f);
    topS.scale.set(1, st, 1); topS.position.y = .05 + .45 * st; topS.visible = f < .995;
    botS.scale.set(1, sb, 1); botS.position.y = -1.0 + .45 * sb; botS.visible = f > .005;
    const yb = -1.0 + .9 * sb, L = Math.max(.01, .05 - yb); flow.visible = f > .01 && f < .99; flow.scale.set(1, L, 1); flow.position.y = (.05 + yb) / 2;
    lb.set(text === undefined ? '' : text); lb.opacity(textK === undefined ? 1 : textK); } };
  api.set(0); return api;
}

// ---------------------------------------------------------------- tiles (calendar), pennant marker
export function tileStrip(Wd, o) {
  const n = o.n, cols = o.cols || n, tw = o.tw || .4, th = o.th || .5, gap = o.gap || .05, G = O.grp(Wd, { pos: o.pos, rot: o.rot, scale: o.scale }), tiles = [];
  for (let i = 0; i < n; i++) {
    const cI = i % cols, rI = Math.floor(i / cols), t = new THREE.Group(); t.position.set((cI - (cols - 1) / 2) * (tw + gap), -rI * (th + gap), 0);
    t.add(box(tw, th, .06, 0x8a6a3a, { inkW: .008 })); const f = new THREE.Mesh(new THREE.PlaneGeometry(tw * .92, th * .92), toon(o.front || 0xf1e3c2)); f.position.z = .032; t.add(f);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(tw * .92, th * .92), toon(o.back || 0xe8a830, { emissive: 0xc07010, emissiveIntensity: .45 })); b.position.z = -.032; b.rotation.y = Math.PI; t.add(b);
    const gl = O.glow(Math.max(tw, th) * 3, 0xffc860, 0); gl.position.z = .2; t.add(gl); t.userData.gl = gl; G.add(t); tiles.push(t);
  }
  return { group: G, tiles, flip(i, k) { tiles[i].rotation.x = Math.PI * clamp(k, 0, 1); }, glow(i, v) { tiles[i].userData.gl.material.opacity = v; tiles[i].userData.gl.visible = v > .01; }, pos(i) { return [tiles[i].position.x, tiles[i].position.y]; } };
}
export function pennant(Wd, col) {
  const g = new THREE.Group(); g.add(box(.05, 1.0, .05, 0x5a3416, { pos: [0, .5, 0], inkW: .008 }));
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(.5, .15); sh.lineTo(0, .3); sh.lineTo(0, 0); const fl = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: col || 0xffc030, side: THREE.DoubleSide })); fl.position.set(.025, .72, 0); g.add(fl);
  const gl = O.glow(1.2, col || 0xffc030, .8); gl.position.set(.2, .85, .05); g.add(gl); g.userData.fl = fl; (Wd.add ? Wd.add(g) : Wd.scene.add(g)); return g;
}

// ---------------------------------------------------------------- luach page (rows light up one by one), page turn
export function pageRows(w, h, rows, seed) {
  const g = new THREE.Group(), r = rng(seed || 4), paper = box(w, h, .03, 0xf4e6c2, { inkW: .01 }); g.add(paper); g.add(box(w * .94, h * .94, .012, 0xe6d3a0, { pos: [0, 0, .018], ink: false }));
  const rr = []; const rh = h * .84 / rows;
  for (let i = 0; i < rows; i++) {
    const y = h * .42 - (i + .5) * rh, gl = new THREE.Mesh(new THREE.PlaneGeometry(w * .9, rh * .86), new THREE.MeshBasicMaterial({ color: 0xffc040, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); gl.position.set(0, y, .04); g.add(gl);
    const ic = new THREE.Mesh(new THREE.CircleGeometry(rh * .3, 20), toon(0xa86a2a)); ic.position.set(w * .38, y, .034); g.add(ic);
    const b1 = box(w * (.3 + r() * .2), rh * .16, .01, 0x5a3a1c, { pos: [w * .1 + (w * .15), y + rh * .1, .034], ink: false }); const b2 = box(w * (.15 + r() * .15), rh * .12, .01, 0x8a6a3a, { pos: [-w * .1, y - rh * .14, .034], ink: false }); g.add(b1); g.add(b2);
    rr.push({ gl, ic });
  }
  g.userData.rows = rr; return g;
}
export function luachBook(Wd, o) {
  o = o || {}; const G = O.grp(Wd, { pos: o.pos, rot: o.rot, scale: o.scale }), w = o.w || 2.4, h = o.h || 3.2, rows = o.rows || 10;
  G.add(box(w + .2, h + .2, .08, 0x5a1f1a, { pos: [0, 0, -.06], inkW: .012 }));
  const under = pageRows(w, h, rows, 11); G.add(under); const pivot = new THREE.Group(); pivot.position.x = -w / 2; G.add(pivot); const top = pageRows(w, h, rows, 5); top.position.x = w / 2; top.position.z = .03; pivot.add(top);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon(0xe9d6a4)); back.position.set(w / 2, 0, .0); back.rotation.y = Math.PI; pivot.add(back);
  return { group: G, top, under, pivot, setLit(lit, page) { const rr = (page || top).userData.rows; rr.forEach((r, i) => { const v = clamp(lit - i, 0, 1); r.gl.material.opacity = .62 * v; r.ic.material.color.setHex(v > .5 ? 0xffd060 : 0xa86a2a); }); }, turn(k) { pivot.rotation.y = -Math.PI * ease.io(clamp(k, 0, 1)) * .98; pivot.position.z = Math.sin(Math.PI * clamp(k, 0, 1)) * .25; } };
}

// ---------------------------------------------------------------- steam train (front faces +x, travels along x)
export function steamTrain(Wd, o) {
  o = o || {}; const G = O.grp(Wd, { pos: o.pos, scale: o.scale }), body = new THREE.Group(); G.add(body); const wheels = [];
  body.add(mesh(new THREE.CylinderGeometry(.45, .45, 2.4, 20), toon(0x2c3a4a), { inkW: .03, rot: [0, 0, Math.PI / 2], pos: [.5, .95, 0] }));
  body.add(mesh(new THREE.CylinderGeometry(.47, .47, .12, 20), toon(0xc99a35), { inkW: .02, rot: [0, 0, Math.PI / 2], pos: [1.72, .95, 0] }));
  body.add(box(1.0, 1.35, 1.0, 0x9a2f2a, { pos: [-1.0, 1.2, 0], inkW: .03 })); body.add(box(1.14, .1, 1.14, 0x3a2a1a, { pos: [-1.0, 1.92, 0], inkW: .02 }));
  body.add(mesh(new THREE.CylinderGeometry(.14, .22, .55, 14), toon(0x20262e), { inkW: .025, pos: [1.35, 1.55, 0] })); body.add(mesh(new THREE.CylinderGeometry(.27, .14, .2, 14), toon(0x20262e), { inkW: .02, pos: [1.35, 1.9, 0] }));
  body.add(mesh(new THREE.SphereGeometry(.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xc99a35), { inkW: .015, pos: [.4, 1.38, 0] }));
  body.add(box(2.4, .22, .9, 0x20262e, { pos: [.4, .35, 0], inkW: .02 })); body.add(box(.5, .5, .9, 0x3a3a44, { pos: [2.0, .38, 0], rot: [0, 0, .5], inkW: .02 }));
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 8), O.basic(0xfff0b0)); lamp.position.set(1.8, 1.1, 0); body.add(lamp); const lg = O.glow(2.2, 0xffe0a0, .7); lg.position.copy(lamp.position); body.add(lg);
  [[1.2, .5], [.45, .5], [-.3, .5], [-1.1, .42], [-1.7, .42]].forEach(([x, r]) => [-.52, .52].forEach(z => { const w = new THREE.Group(); w.position.set(x, r, z); w.add(mesh(new THREE.CylinderGeometry(r, r, .1, 22), toon(0x2a1c1c), { inkW: .02, rot: [Math.PI / 2, 0, 0] })); w.add(mesh(new THREE.CylinderGeometry(r * .72, r * .72, .12, 18), toon(0xb8923a), { ink: false, rot: [Math.PI / 2, 0, 0] })); for (let s = 0; s < 4; s++) w.add(box(r * 1.5, .05, .14, 0x2a1c1c, { rot: [0, 0, s * Math.PI / 4], ink: false })); body.add(w); wheels.push([w, r]); }));
  const tender = new THREE.Group(); tender.add(box(1.3, .8, .96, 0x3a2a1a, { pos: [-3.0, .9, 0], inkW: .03 })); tender.add(box(1.1, .3, .8, 0x15100c, { pos: [-3.0, 1.4, 0], inkW: .02 })); [-3.4, -2.6].forEach(x => [-.5, .5].forEach(z => { const w = mesh(new THREE.CylinderGeometry(.32, .32, .1, 18), toon(0x2a1c1c), { inkW: .02, rot: [Math.PI / 2, 0, 0], pos: [x, .32, z] }); tender.add(w); wheels.push([w, .32]); })); body.add(tender);
  const puffs = [], N = 16; for (let i = 0; i < N; i++) { const s = O.glow(1, 0xf2f2f2, .7); s.visible = false; Wd.add(s); puffs.push(s); }
  const api = { group: G, body, wheels, chimney: [1.35, 2.0, 0],
    update(t, x, dir, rate) { // x(t) handled by caller: pass current x; smoke trail uses xAt
      G.position.x = x; wheels.forEach(([w, r]) => { w.rotation.z = -x / r * (dir || 1); }); },
    smoke(t, xAt, y0, z0, life) { const L = life || 2.4; puffs.forEach((p, i) => { const age = ((t / L + i / N) % 1), tt = t - age * L, cxp = xAt(tt) + 1.35 * (o.scale || 1), k = age; p.visible = true; p.position.set(cxp - 0 + age * 1.2, y0 + 2.0 * (o.scale || 1) + age * 3.2, z0 + Math.sin(i * 2.1) * .3); const s = (.6 + k * 3.4) * (o.scale || 1); p.scale.set(s, s, 1); p.material.opacity = .75 * (1 - k) * Math.min(1, k * 6); }); } };
  return api;
}

// ---------------------------------------------------------------- study backdrop (wall, shelves, bokeh), table
export function studioBackdrop(Wd, o) {
  o = o || {}; const g = O.grp(Wd), wl = o.wall || '#cdb487';
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(70, 40), toon(0xffffff, { map: (() => { const t = O.woodTex(6, '#8a5a30', 128).clone(); t.needsUpdate = true; t.repeat.set(6, 4); return t; })() })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, -4); fl.receiveShadow = true; g.add(fl);
  g.add(O.texBox(70, 12, .4, O.plasterTex(wl), o.wallTint || 0x9a8a78, { pos: [0, 5.8, -9.5], k: .3, inkW: .01 }));
  [-14, -7.5, 7.5, 14].forEach((x, i) => { const s = new THREE.Group(); s.position.set(x, 0, -8.8); s.add(box(3.2, 6.4, .9, 0x4a3018, { pos: [0, 3.2, 0], inkW: .012 })); const r = rng(70 + i); for (let row = 0; row < 6; row++) { let bx = -1.45; while (bx < 1.4) { const bw = .1 + r() * .16, bh = .6 + r() * .3; s.add(box(bw, bh, .6, [0x6a2a24, 0x24407a, 0x2f5d3a, 0x6a4a1c, 0x5a2f6a, 0x8a5a2a][Math.floor(r() * 6)], { pos: [bx + bw / 2, .35 + row * 1.0 + bh / 2, .1], inkW: .005 })); bx += bw + .01; } } g.add(s); });
  const r = rng(90); for (let i = 0; i < 16; i++) { const s = O.glow(1.2 + r() * 2.2, [0xffc070, 0xffd890, 0xffb050][i % 3], .5 + r() * .4); s.position.set(-22 + r() * 44, 1.5 + r() * 6.5, -8 + r() * 1.5); g.add(s); }
  return g;
}
// open sefer (scaled) lying on the table: a foreground piece
export function bigSefer(Wd, pos, sc, rotY) { const s = O.sefer(Wd, { pos, scale: sc || 2.2, bright: .9 }); s.rotation.y = rotY || 0; return s; }

// ---------------------------------------------------------------- watch scene (shared by every W line of c4..c7)
// o: { sun (0..1 window glow), windowColor, mouth, lightKey, extras(Wd,R,W,a,b), over(g,W,R) -> overrides for W.auto (+ yaw/roll/lift), cam: segs (global time) , focus }
export function watchScene(C, id, o) {
  o = o || {}; const a = C.START[id], b = C.ENDOF(id), dur = b - a;
  const Wd = world({ fog: false }); C.baseCam(Wd, .03, 120); O.skyDome(Wd, { top: 0x1c2848, mid: 0x3a3a58, bot: 0x6a5a58, stars: 0 });
  const R = O.watchTable(Wd, { windowColor: o.windowColor || 0x2a3a70 });
  O.lighting(Wd, { key: [o.keyColor || 0xffd9a0, 1.0, [1.5, 3.5, 3]], hemi: [0xd8b890, 0x3a2a1a, o.hemi || .75], fill: [o.fillColor || 0x7a96d8, .3, [-4, 1.5, 2]], rim: [0xffe0b0, .8, [-1.5, 2.5, -2]], target: [0, .2, 0], shadowExt: 3, fog: null,
    points: [[0xffc070, o.lamp === undefined ? 6 : o.lamp, [.9, 1.6, 1.2], 7], [0xffd890, (o.sun || 0) * 18, [2.7, 1.5, -3.2], 9]] });
  R.winGlow.material.opacity = .85 * (o.sun || 0);
  const W = makeWatch(Wd, { scale: .24, lines: C.CH.lines, mouth: o.mouth || null }); W.obj.position.set(0, .122, 0); W.obj.rotation.x = -.18; Wd.add(W.obj); Wd.hero = W.obj;
  O.motes(Wd, { n: 22, area: [-.8, 1.4, .1, 1.2, -1.5, 1.0], size: .035, color: 0xffe3a8, op: .6, seed: 33, rise: .04 });
  const X = o.extras ? o.extras(Wd, R, W, a, b) : null;
  Wd.on((t, cam) => {
    const g = t + a, ov = Object.assign({ lid: 1, eyes: 1, look: [0, 0] }, o.over ? o.over(g, W, R, X) : {});
    const yaw = ov.yaw || 0, roll = ov.roll || 0, lift = ov.lift || 0; delete ov.yaw; delete ov.roll; delete ov.lift;
    W.obj.rotation.y = yaw; W.obj.rotation.z = roll; W.obj.position.y = .122 + lift; W.auto(g, ov);
  });
  const segs = o.cam || [{ t: a, p: [[0, .42, 1.5], [0, .40, 1.2]], l: [[-.17, .3, 0], [-.2, .3, 0]], mm: 50 }];
  const camF = camSeq(a, b, segs);
  return C.finish(Wd, camF, { dof: t => ({ focus: o.focus || 1.3, ap: 20, maxR: 18, vig: .42 }) });
}

// ---------------------------------------------------------------- chapter boot, intro shot, film launcher
export async function boot(chId, ORDER, starts) {
  window.CAPTIONS_VAULT = Object.assign(window.CAPTIONS_VAULT || {}, await loadJSON('captions_vault.json'));
  const TL = await loadJSON('timeline.json'), CH = TL.chapters.find(c => c.id === chId), Q = new URLSearchParams(location.search);
  const { loadMouth } = await import('./watch.js'); const MOUTH = await loadMouth(Q.get('mouth') || ('mouth_' + chId + '.json'));
  try { await Promise.all([document.fonts.load('700 40px Heebo'), document.fonts.load('700 40px Assistant')]); } catch (e) {}
  const C = makeCtx(CH, ORDER); Object.keys(starts || {}).forEach(k => { C.START[k] = C.T0(starts[k]); });
  return { C, MOUTH, CH };
}
export function introShot(C, key) {
  const Wd = world({ fog: false }); C.baseCam(Wd, .1, 800); O.skyDome(Wd, { top: 0x03061a, mid: 0x0a1844, bot: 0x2a4a86 });
  O.lighting(Wd, { key: [0xffffff, .2, [5, 8, 8]], hemi: [0x6a80c0, 0x101830, .6], noShadow: true });
  [[-30, 8, -60, 40, 0x2a5aa8, .22], [26, -6, -80, 55, 0x4a3a9a, .18], [0, 20, -50, 34, 0x2a6a9a, .14], [-10, -14, -40, 30, 0x5a3a88, .12]].forEach(([x, y, z, s, c, o]) => { const g = O.glow(s, c, o); g.position.set(x, y, z); Wd.add(g); });
  titleCard3d(Wd, key, { pos: [0, 0, 0], width: 7.2, line: { t0: .6, t1: 2.5 } });
  O.motes(Wd, { n: 36, area: [-6, 6, -3, 3, 1, 7], size: .22, color: 0xffd98a, op: .55, seed: 3 }); O.motes(Wd, { n: 20, area: [-8, 8, -4, 4, -6, -1], size: .3, color: 0x9ab8ff, op: .35, seed: 8 });
  const cam = camSeq(0, C.ENDOF('intro'), [{ t: 0, p: [[0, .35, 13], [0, .1, 9.8]], l: [0, 0, 0], mm: 40, e: 'sm' }]);
  return C.finish(Wd, cam, { dof: (t, c) => ({ focus: Math.hypot(c.position.x, c.position.y, c.position.z), ap: 7, maxR: 12, vig: .38 }) });
}
export function runFilm(C, BUILD, WIDE) {
  film({ W: 1920, H: 1080, fadeIn: true, shots: C.ORDER.map(k => ({ id: k, dur: C.ENDOF(k) - C.START[k], caps: [], wide: !!(WIDE || {})[k], build: BUILD[k] })) });
  const main = document.getElementById('c'), cssScale = () => { const r = main.getBoundingClientRect(); return { k: (r.width || 1920) / 1920, cw: r.width || 1920, ch: r.height || 1080 }; };
  window.__caption = t => { t = Math.max(0, (+t || 0) + (window.__T0 || 0)); const c = captionInfo(t); if (!c) return null; const { k, cw, ch } = cssScale();
    return { id: c.id, text: c.text, rect: { x: c.rect.x * k, y: c.rect.y * k, w: c.rect.w * k, h: c.rect.h * k }, canvasW: cw, canvasH: ch, dir: 'rtl', lang: 'he', alpha: c.alpha }; };
  window.__chapter = C.CH;
}
// rack with two shelves (two boards live on it), table
export function rack(Wd, o) {
  o = o || {}; const g = O.grp(Wd), w = o.w || 15.5, ys = o.ys || [0, 2.7];
  [-1, 1].forEach(s => g.add(box(.34, ys[1] + 3.4, 1.4, 0x4a3018, { pos: [s * (w / 2 + .1), (ys[1] + 3.4) / 2, 0], inkW: .015 })));
  ys.forEach(y => g.add(box(w, .22, 1.5, 0x6a4526, { pos: [0, y - .11 + (y === 0 ? .55 : 0), .0], inkW: .012 })));
  return g;
}
