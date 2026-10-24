// k11fx.js - props for k11 ("the screen that hides the King"): veil, wooden gears, dominoes, fog, shadows, pill, willow, steps.
// The King is NEVER drawn: only the light behind the veil, the parochet of the aron, and writing. Everything is a function of t only.
import { THREE, world, box, cyl, ball, toon, ink, canvasTex, label, rng, clamp, lerp, ease, prog } from '../../lib/stage3d.js';
import { glowSprite, motes, glowTex, WAL, WAL2, COP, IVORY, HONEY, INDIGO, PI, sm } from './k11lib.js';

// ---- timing: source second -> film second (after the four cuts); shots follow the source boundaries ----
const CUTS = [[133.30, 136.96], [267.95, 291.80], [352.78, 358.75], [485.85, 497.90]], START = 19.55;
export const CL = s => s - START - CUTS.reduce((a, [c0, c1]) => a + (c1 <= s ? c1 - c0 : (s > c0 ? s - c0 : 0)), 0);
// [source start, source end] of every shot (a shot may end exactly at a cut and the next one start right after it)
export const BND = [[19.55, 41.0], [41.0, 63.4], [63.4, 86.5], [86.5, 105.0], [105.0, 133.30], [136.96, 161.0], [161.0, 184.0], [184.0, 210.0], [210.0, 224.0], [224.0, 240.0], [240.0, 267.95], [291.80, 312.0],
  [312.0, 338.0], [338.0, 352.78], [358.75, 377.0], [377.0, 396.6], [396.6, 415.5], [415.5, 440.0], [440.0, 463.0], [463.0, 485.85], [497.90, 524.3], [524.3, 540.5], [540.5, 555.74]];
export const END_CARD = 4.8;
export const DURS = BND.map(([a, b], i) => +(CL(b) - CL(a) + (i === BND.length - 1 ? END_CARD : 0)).toFixed(3));
export const SS = DURS.reduce((acc, d, i) => (acc.push(i ? +(acc[i - 1] + DURS[i - 1]).toFixed(3) : 0), acc), []);
export const lt = (shot, src) => CL(src) - SS[shot - 1];   // local time (in shot number `shot`, 1-based) of a source second

export const PLUM = '#4a2a3e', PLUM2 = '#6a3a50', WALNUT = '#5b3a26', WALNUT2 = '#7a5035', CREAM = '#efe3c8';
export const lblIndigo = { bg: 'rgba(58,24,48,.9)', color: '#ffecc0' };

// a floating Hebrew word / plate: fn(t) -> {pos:[x,y,z], op:0..1, s:scale}
export function fw(Wd, text, fn, o) {
  o = o || {}; const sp = label(Wd, text, Object.assign({ height: o.h || .4, size: o.size || 64 }, lblIndigo, o.style || {})); const b = sp.scale.clone();
  Wd.on((t, cam) => { const r = fn(t) || {}; const op = r.op === undefined ? 1 : r.op; sp.visible = op > .01; if (r.pos) sp.position.set(...r.pos); sp.material.opacity = op; let s = r.s === undefined ? 1 : r.s;
    if (o.screen && cam) { const d = cam.position.distanceTo(sp.position), hh = o.screen * 2 * d * Math.tan(cam.fov * Math.PI / 360); s = hh / b.y; } sp.scale.set(b.x * s, b.y * s, 1); });
  return sp;
}

// ---- candles / lantern ----
export function candle(Wd, x, y, z, o) {   // o.k(t) flame level 0..1.6 (0 = out), o.h candle height, o.light = PointLight power
  o = o || {}; const h = o.h || .22, g = new THREE.Group(); g.position.set(x, y, z); Wd.add(g);
  g.add(cyl(.032, .036, h, IVORY, { pos: [0, h / 2, 0], ink: false })); g.add(cyl(.004, .004, .03, '#2a2018', { pos: [0, h + .012, 0], ink: false }));
  const fl = glowSprite(0xffb458, .1, 0), co = glowSprite(0xfff2cc, .05, 0), ha = glowSprite(0xffc878, .5, 0); fl.position.set(x, y + h + .045, z); co.position.set(x, y + h + .04, z); ha.position.set(x, y + h + .05, z); Wd.add(fl); Wd.add(co); Wd.add(ha);
  let L = null; if (o.light) { L = new THREE.PointLight(0xffc27a, 0, o.dist || 7, 1.5); L.position.set(x, y + h + .1, z); Wd.add(L); }
  const kf = o.k || (() => 1), sd = o.seed || 0;
  Wd.on(t => { const k = kf(t), f = 1 + .12 * Math.sin(t * 11 + sd * 3) + .06 * Math.sin(t * 23 + sd), on = k > .02; fl.visible = co.visible = ha.visible = on;
    fl.scale.set(.05 + .12 * k, (.08 + .2 * k) * f, 1); fl.material.opacity = Math.min(1, .5 + .5 * k); co.scale.setScalar((.03 + .05 * k) * f); co.material.opacity = Math.min(1, .5 + .5 * k);
    ha.scale.setScalar((.3 + 1.3 * k) * (o.halo || 1) * f); ha.material.opacity = Math.min(.55, .12 + .3 * k); if (L) L.intensity = k * (o.light) * f; });
  return g;
}
export function lantern(Wd, pos, o) {   // the lantern (uvvasa): base, brass posts, glass, candle inside. o.k(t)
  o = o || {}; const g = new THREE.Group(); g.position.set(...pos); Wd.add(g); const s = o.s || 1;
  g.add(box(.34 * s, .05 * s, .34 * s, WAL, { pos: [0, .025 * s, 0] }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(.012 * s, .012 * s, .62 * s, COP, { pos: [sx * .15 * s, .33 * s, sz * .15 * s], ink: false }));
  g.add(box(.36 * s, .04 * s, .36 * s, COP, { pos: [0, .65 * s, 0] })); g.add(cyl(.0, .16 * s, .16 * s, COP, { pos: [0, .75 * s, 0] })); g.add(ball(.03 * s, COP, { pos: [0, .85 * s, 0], ink: false }));
  const gl = new THREE.Mesh(new THREE.BoxGeometry(.3 * s, .58 * s, .3 * s), new THREE.MeshBasicMaterial({ color: 0xdfe8ff, transparent: true, opacity: .1, depthWrite: false })); gl.position.set(0, .34 * s, 0); g.add(gl);
  candle(Wd, pos[0], pos[1] + .05 * s, pos[2], Object.assign({ h: .26 * s, light: o.light || 6, halo: o.halo || s }, o, o.halo ? { halo: o.halo } : {}));
  return g;
}

// ---- aron kodesh with its parochet; o.k(t) = light 0..1 leaking from behind the curtain ----
let FT = null;
export function aron(Wd, x, z, ry, o) {
  o = o || {}; const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; Wd.add(g); const kf = o.k || (() => .3);
  g.add(box(3.0, .35, .9, WAL, { pos: [0, .175, 0] })); g.add(box(.28, 3.5, .8, WAL2, { pos: [-1.36, 1.75, 0] })); g.add(box(.28, 3.5, .8, WAL2, { pos: [1.36, 1.75, 0] })); g.add(box(3.0, .4, .86, WAL2, { pos: [0, 3.7, 0] })); g.add(box(1.0, .5, .5, WAL, { pos: [0, 4.15, 0] }));
  g.add(box(.4, .26, .06, '#d9aa58', { pos: [0, 4.2, .27], ink: false })); g.add(ball(.09, '#d9aa58', { pos: [0, 4.5, .1], ink: false })); for (const sx of [-1, 1]) g.add(cyl(.05, .06, .5, '#d9aa58', { pos: [sx * .5, 4.4, .1], ink: false }));
  g.add(box(2.45, 3.2, .06, '#171d48', { pos: [0, 1.95, -.2], ink: false }));   // dark recess
  const GD = '#d9aa58', pkc = ['#f1e6ca', '#e4d6b3'];   // the parochet: ivory velvet folds, an indigo panel with a gold frame and crown
  for (let i = 0; i < 10; i++) g.add(box(.23, 3.05, .05, pkc[i % 2], { pos: [-1.035 + i * .23, 1.97, .12], ink: false }));
  g.add(box(1.1, 1.7, .03, INDIGO, { pos: [0, 2.0, .16], ink: false }));
  for (const [w, h, x, y] of [[1.2, .06, 0, 2.88], [1.2, .06, 0, 1.12], [.06, 1.82, -.6, 2.0], [.06, 1.82, .6, 2.0]]) g.add(box(w, h, .03, GD, { pos: [x, y, .18], ink: false }));
  for (const sx of [-1, 1]) { g.add(box(.26, .5, .03, GD, { pos: [sx * .17, 1.95, .19], ink: false })); g.add(ball(.13, GD, { pos: [sx * .17, 2.2, .19], scale: [1, .7, .25], ink: false })); }
  g.add(box(.5, .12, .03, GD, { pos: [0, 3.05, .18], ink: false })); for (const sx of [-1, 0, 1]) g.add(ball(.06, GD, { pos: [sx * .2, 3.17, .18], ink: false }));
  g.add(box(2.3, .07, .03, GD, { pos: [0, 3.46, .16], ink: false })); g.add(box(2.3, .07, .03, GD, { pos: [0, .5, .16], ink: false }));
  for (let i = 0; i < 20; i++) g.add(box(.07, .2, .02, '#e2bd6a', { pos: [-1.0 + i * .105, .4, .16], ink: false }));
  const edge = []; for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, 3.1), new THREE.MeshBasicMaterial({ color: 0xffd48a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); m.position.set(sx * 1.17, 1.95, .17); g.add(m); edge.push(m); }
  const gs = glowSprite(0xffcf86, 5.5, 0); gs.position.set(0, 2.0, .35); g.add(gs);
  if (!FT) FT = canvasTex(64, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(w * .25, 0); c.lineTo(w * .75, 0); c.lineTo(w, h); c.lineTo(0, h); c.fill(); });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 5), new THREE.MeshBasicMaterial({ map: FT, color: 0xffd48a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, fog: false })); sp.rotation.x = -PI / 2; sp.position.set(0, .12, 2.8); g.add(sp);
  const L = new THREE.PointLight(0xffc880, 0, 12, 1.4); L.position.set(0, 2.2, 1.4); g.add(L);
  Wd.on(t => { const k = kf(t), f = 1 + .05 * Math.sin(t * 2.3); edge.forEach(m => m.material.opacity = .85 * k); gs.material.opacity = .55 * k * f; sp.material.opacity = .5 * k; L.intensity = 9 * k * f; });
  return g;
}

// ---- wall clock (no numerals): o.a(t) = minute-hand angle in radians ----
export function clock(Wd, pos, ry, o) {
  o = o || {}; const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = ry || 0; Wd.add(g); const R = o.r || .38;
  const face = cyl(R, R, .05, IVORY, {}); face.rotation.x = PI / 2; g.add(face); const rim = cyl(R * 1.1, R * 1.1, .035, COP, { ink: false }); rim.rotation.x = PI / 2; rim.position.z = -.012; g.add(rim);
  for (let i = 0; i < 12; i++) { const a = i * PI / 6, m = box(.02, i % 3 === 0 ? .08 : .045, .01, '#3a3020', { pos: [Math.sin(a) * R * .82, Math.cos(a) * R * .82, .03], rot: [0, 0, -a], ink: false }); g.add(m); }
  const mh = new THREE.Group(), hh = new THREE.Group(); mh.position.z = .045; hh.position.z = .04; g.add(mh); g.add(hh);
  mh.add(box(.018, R * .78, .01, '#2a2018', { pos: [0, R * .39, 0], ink: false })); hh.add(box(.026, R * .5, .01, '#2a2018', { pos: [0, R * .25, 0], ink: false })); g.add(ball(.025, COP, { pos: [0, 0, .06], ink: false }));
  Wd.on(t => { const a = (o.a ? o.a(t) : 0); mh.rotation.z = -a; hh.rotation.z = -a / 12; });
  return g;
}

// ---- hourglass (the thirty seconds): o.f(t) = fraction of sand fallen 0..1 ----
export function hourglass(Wd, pos, o) {
  o = o || {}; const g = new THREE.Group(); g.position.set(...pos); Wd.add(g); const s = o.s || 1, ff = o.f || (() => 0);
  g.add(cyl(.2 * s, .2 * s, .035 * s, WAL, { pos: [0, .0175 * s, 0] })); g.add(cyl(.2 * s, .2 * s, .035 * s, WAL, { pos: [0, .7 * s, 0] }));
  for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3; g.add(cyl(.012 * s, .012 * s, .68 * s, COP, { pos: [Math.sin(a) * .17 * s, .36 * s, Math.cos(a) * .17 * s], ink: false })); }
  const gm = new THREE.MeshBasicMaterial({ color: 0xdfe8ff, transparent: true, opacity: .13, depthWrite: false }), ctop = new THREE.Mesh(new THREE.CylinderGeometry(.16 * s, .012 * s, .3 * s, 20), gm), cbot = new THREE.Mesh(new THREE.CylinderGeometry(.012 * s, .16 * s, .3 * s, 20), gm);
  ctop.position.y = .525 * s; cbot.position.y = .195 * s; g.add(ctop); g.add(cbot);
  const sandM = toon('#e8c070'), top = new THREE.Group(), tm = new THREE.Mesh(new THREE.CylinderGeometry(.15 * s, .012 * s, .28 * s, 18), sandM); top.position.set(0, .375 * s, 0); tm.position.y = .14 * s; top.add(tm); g.add(top);
  const bot = new THREE.Group(), bm = new THREE.Mesh(new THREE.SphereGeometry(.15 * s, 18, 10), sandM); bot.position.set(0, .05 * s, 0); bm.scale.set(1, .9, 1); bot.add(bm); g.add(bot);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(.006 * s, .006 * s, .3 * s, 6), sandM); st.position.y = .24 * s; g.add(st);
  Wd.on(t => { const f = clamp(ff(t), 0, 1); top.scale.set(1, Math.max(.001, 1 - f), 1); top.visible = f < .995; bot.scale.set(Math.max(.2, .35 + .65 * f), Math.max(.02, f), Math.max(.2, .35 + .65 * f)); bot.visible = f > .005; st.visible = f > .005 && f < .995; });
  return g;
}

// ---- lake: waves with amplitude o.amp(t) (0 = glass), sunrise streak around x = o.sx ----
export function lake(Wd, o) {
  o = o || {}; const W = o.w || 120, D = o.d || 90, nx = W > 300 ? 260 : 110, nz = W > 300 ? 170 : 70, g = new THREE.PlaneGeometry(W, D, nx, nz); g.rotateX(-PI / 2); const p = g.attributes.position, col = new Float32Array(p.count * 3), bx = [], bz = [];
  for (let i = 0; i < p.count; i++) { bx.push(p.getX(i)); bz.push(p.getZ(i)); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true })); m.position.set(0, 0, o.z0 || -30); Wd.add(m);
  const ampf = o.amp || (() => 0), sx = o.sx || 0;
  Wd.on(t => { const A = ampf(t), gl = o.glow ? o.glow(t) : .5;
    for (let i = 0; i < p.count; i++) { const x = bx[i], z = bz[i], w = A * (.22 * Math.sin(x * .5 + t * 2.2 + z * .35) + .12 * Math.sin(x * 1.3 - t * 3.1 + z * .7)) + .01 * Math.sin(x * .9 + t * .8);
      p.setY(i, w); const far = clamp(-z / (D * .5), 0, 1), k = Math.exp(-Math.pow((x - sx) / (5 + 12 * far), 2)) * (.25 + .75 * far), sh = A > .02 ? .5 + .5 * Math.sin(x * 2.1 + z * 1.6 + t * 4) : 1, hz = .55 * Math.pow(far, 1.4), st = k * gl * (.55 + .45 * sh), fm = A > .05 ? A * .35 * Math.max(0, Math.sin(x * 2.3 + z * 1.7 + t * 3.1) * Math.sin(x * .9 - z * 1.3 + t * 2.2)) : 0;
      col[i * 3] = lerp(.1, .62, hz) + st * .9 + fm; col[i * 3 + 1] = lerp(.15, .55, hz) + st * .62 + fm; col[i * 3 + 2] = lerp(.38, .8, hz) + st * .3 + fm; }
    p.needsUpdate = true; g.attributes.color.needsUpdate = true; });
  return m;
}

// ---- spring: an upwelling of water out of rock; o.a(t) = strength 0..1 ----
export function spring(Wd, pos, o) {
  o = o || {}; const N = 150, mt = motes(Wd, N), r = rng(o.seed || 7), PR = []; for (let i = 0; i < N; i++) PR.push([r(), (r() - .5) * 2, (r() - .5) * 2, .7 + r() * .6, r()]);
  const af = o.a || (() => 1), pool = cyl(1.6, 1.8, .22, '#6d6a86', { pos: [pos[0], pos[1] + .11, pos[2]] }); Wd.add(pool);
  const wt = new THREE.Mesh(new THREE.CircleGeometry(1.45, 36), new THREE.MeshBasicMaterial({ color: 0x8fd6e6, transparent: true, opacity: .9 })); wt.rotation.x = -PI / 2; wt.position.set(pos[0], pos[1] + .23, pos[2]); Wd.add(wt);
  for (let i = 0; i < 7; i++) { const a = i / 7 * PI * 2; Wd.add(ball(.55 + (i % 3) * .12, i % 2 ? '#7a7690' : '#8a8498', { pos: [pos[0] + Math.sin(a) * 1.9, pos[1] + .3, pos[2] + Math.cos(a) * 1.9], scale: [1, .8, 1] })); }
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(.1, .22, 1, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xc8f0f8, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); Wd.add(jet);
  Wd.on(t => { const a = af(t); for (let i = 0; i < N; i++) { const [ph, vx, vz, hh, sd] = PR[i], u = ((t * .55 * hh + ph) % 1), h = (o.h || 3.2) * 4 * u * (1 - u) * a, sp = .9 * u * a;
      mt.set(i, pos[0] + vx * sp, pos[1] + .3 + h, pos[2] + vz * sp, a > .02 ? (.14 + .1 * sd) * (u < .05 ? u * 20 : 1) : 0, .8, .95, 1); } mt.done();
    jet.visible = a > .02; jet.scale.set(1, Math.max(.01, (o.h || 3.2) * .55 * a), 1); jet.position.set(pos[0], pos[1] + .3 + (o.h || 3.2) * .275 * a, pos[2]); wt.material.opacity = .85 + .1 * Math.sin(t * 3); });
}

// ---- strata: a cut-away block of earth. returns {top: y of surface} ----
export function strata(Wd, x, z, w, o) {
  o = o || {}; const lay = [['#8d9a58', .35], ['#94704c', .9], ['#a88a62', 1.0], ['#7a7686', 1.1], ['#4a4876', 1.3]]; let y = 0; const d = o.d || 2.6, tot = lay.reduce((a, l) => a + l[1], 0);
  for (const [c, h] of lay) { y += h; Wd.add(box(w, h, d, c, { pos: [x, tot - y + h / 2, z], inkW: .01 })); }
  return { top: tot, bottom: 0, x, z, w, d };
}
// a vertical column of light: from y0 down to y1 (grows with k 0..1)
export function lightShaft(Wd, x, z, yTop, yBot, rad, kf, o) {
  o = o || {}; if (o.flat) return flatShaft(Wd, x, z, yTop, yBot, rad, kf); const g = new THREE.Group(); Wd.add(g); const mk = (r, c, op) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * .8, 1, 20, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.userData.op = op; g.add(m); return m; };
  const a = mk(rad, 0xffcf80, .35), b = mk(rad * .5, 0xfff0c6, .5), tip = glowSprite(0xffe0a0, rad * 6, .7); g.add(tip);
  Wd.on(t => { const k = clamp(kf(t), 0, 1), len = Math.max(.001, (yTop - yBot) * k); for (const m of [a, b]) { m.scale.set(1, len, 1); m.position.set(x, yTop - len / 2, z); m.material.opacity = m.userData.op * (.9 + .1 * Math.sin(t * 2)); } tip.position.set(x, yTop - len, z); tip.visible = k > .01; g.visible = k > .005; });
  return g;
}

let HT = null;
// a glowing band painted on a flat face (for the cut-away block): grows downward with kf 0..1
export function flatShaft(Wd, x, z, yTop, yBot, rad, kf) {
  if (!HT) HT = canvasTex(64, 8, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.3, 'rgba(255,255,255,.7)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(.7, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(rad * 2.4, 1), new THREE.MeshBasicMaterial({ map: HT, color: 0xffd890, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); Wd.add(m);
  const tip = glowSprite(0xffe6b0, rad * 3, .8); Wd.add(tip);
  Wd.on(t => { const k = clamp(kf(t), 0, 1), len = Math.max(.001, (yTop - yBot) * k); m.visible = k > .005; m.scale.set(1, len, 1); m.position.set(x, yTop - len / 2, z); tip.position.set(x, yTop - len, z + .05); tip.visible = k > .01; });
}

// =====================  k11 new props  =====================
// ---- the stage: a dark plum theatre with a walnut plank floor ----
let FLT = null;
function floorTex() {
  if (FLT) return FLT; const r = rng(77);
  FLT = canvasTex(256, 256, (g, w, h) => { const cols = ['#5c3a28', '#503120', '#684330', '#47291b'];
    for (let y = 0; y < h; y += 32) { let x = -r() * 120; while (x < w) { const bw = 110 + r() * 140; g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(x, y, bw, 32); g.fillStyle = 'rgba(20,8,2,.5)'; g.fillRect(x, y, 2, 32); x += bw; } g.fillStyle = 'rgba(20,8,2,.55)'; g.fillRect(0, y, w, 2); } }, [60, 60]);
  return FLT;
}
export function stageWorld(o) {
  o = o || {};
  const Wd = world(Object.assign({ skyTop: 0x2a1434, skyBottom: 0x6e3c40, fogColor: 0x52303a, fogNear: 34, fogFar: 120, sun: 1.2, sunColor: 0xffd7a6, hemi: 1.2, hemiSky: 0xf2d9c6, hemiGround: 0x5a382e, sunPos: [-14, 22, 16], shadowExt: 26, skyR: 900 }, o));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), toon(0xffffff, { map: floorTex() })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; Wd.add(fl);
  if (o.pillars !== false) for (const [x, z] of [[-11, -5], [11, -5], [-14, 4], [14, 4], [-8, 14], [8, 14]]) { Wd.add(cyl(.55, .65, 11, WALNUT2, { pos: [x, 5.5, z] })); Wd.add(box(1.7, .5, 1.7, WALNUT, { pos: [x, 11.2, z] })); Wd.add(box(1.5, .45, 1.5, WALNUT, { pos: [x, .22, z] })); }
  return Wd;
}

// ---- the veil: a big translucent cloth on a walnut frame, a warm light behind it ----
let WVT = null, WGT = null;
function weaveTex() {
  if (WVT) return WVT;
  WVT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f1e5ca'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(160,120,70,.16)'; g.lineWidth = 1; for (let i = 0; i < w; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
    for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(150,100,60,' + (.03 + .04 * ((i * 7) % 5) / 5) + ')'; g.fillRect((i * 53) % w, (i * 97) % h, 20 + (i * 13) % 40, 2); } }, [10, 4]);
  return WVT;
}
function wideGlowTex() {
  if (WGT) return WGT;
  WGT = canvasTex(256, 128, (g, w, h) => { const r = g.createRadialGradient(w / 2, h * .55, 0, w / 2, h * .55, w * .5); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  return WGT;
}
// o: {x,z,w,h, op(t) cloth opacity, glow(t) backlight 0..1.2, wave(t) amplitude, lift(t) 0..1 (the cloth is drawn up and aside), cx (light x)}
export function veil(Wd, o) {
  o = o || {}; const W = o.w || 26, H = o.h || 10, z = o.z === undefined ? -9 : o.z, g = new THREE.Group(); g.position.set(o.x || 0, 0, z); Wd.add(g);
  g.add(box(.5, H + .7, .5, WALNUT, { pos: [-W / 2 - .3, (H + .7) / 2, 0] })); g.add(box(.5, H + .7, .5, WALNUT, { pos: [W / 2 + .3, (H + .7) / 2, 0] }));
  g.add(box(W + 1.4, .5, .55, WALNUT2, { pos: [0, H + .45, 0] })); g.add(box(W + 1.4, .3, .7, WALNUT2, { pos: [0, .15, 0] }));
  const hh = H - .3, nx = 56, ny = 28, geo = new THREE.PlaneGeometry(W, hh, nx, ny), pa = geo.attributes.position, base = Float32Array.from(pa.array);
  const mat = new THREE.MeshBasicMaterial({ map: weaveTex(), transparent: true, opacity: .95, side: THREE.DoubleSide, depthWrite: false, fog: false });
  mat.color.setHex(0xb59a76); const cloth = new THREE.Mesh(geo, mat); cloth.position.set(0, .3 + hh / 2, 0); cloth.renderOrder = 9; g.add(cloth);
  const glowM = new THREE.MeshBasicMaterial({ map: wideGlowTex(), color: 0xffb860, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.05, hh * 1.15), glowM); gl.position.set(o.cx || 0, .3 + hh * .55, .05); gl.renderOrder = 10; g.add(gl);
  const back = glowSprite(0xffc070, W * 1.1, 0); back.position.set(o.cx || 0, H * .5, -3.2); back.renderOrder = 5; g.add(back);
  const core = glowSprite(0xfff0cc, H * .55, 0); core.position.set(o.cx || 0, H * .52, -2.4); core.renderOrder = 5; g.add(core);
  const smoothstep = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  Wd.on(t => {
    const op = o.op ? o.op(t) : .95, gl_ = o.glow ? o.glow(t) : .5, A = o.wave ? o.wave(t) : .1, L = o.lift ? o.lift(t) : 0;
    mat.opacity = op; glowM.opacity = clamp(.5 * gl_ * (op * .5 + .5), 0, 1); back.material.opacity = clamp(.85 * gl_, 0, 1); core.material.opacity = clamp(.9 * gl_, 0, 1); core.scale.setScalar(H * .55 * (1 + .3 * gl_));
    for (let i = 0; i < pa.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], u = x / W + .5, v = y / hh + .5;
      let zz = A * (.55 * Math.sin(x * .45 + t * 1.1 + y * .3) + .3 * Math.sin(x * .9 - t * .8 + y * .5) + .15 * Math.sin(y * 1.4 + t * 1.7)), xx = x, yy = y;
      if (L > 0) { const w = smoothstep(0, 1, (u * .75 + (1 - v) * .55 - .3) / .8); yy += L * hh * .78 * w; xx -= L * W * .3 * w; zz += L * 2.4 * Math.sin(w * PI) + L * .6 * w; }
      pa.setXYZ(i, xx, yy, zz);
    }
    pa.needsUpdate = true;
  });
  return { g, mat, W, H, z, hh, frontZ: z + .07, cloth };
}

// ---- silhouette decals painted on the cloth (the shadows of the mechanisms) ----
const SILT = {};
function silTex(kind) {
  if (SILT[kind]) return SILT[kind];
  SILT[kind] = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = 'rgba(46,18,50,.92)'; g.strokeStyle = 'rgba(46,18,50,.92)'; const cx = w / 2, cy = h / 2;
    if (kind === 'gear') { const n = 12, R = 110, ri = 92; g.beginPath(); for (let k = 0; k < n; k++) { const a = k * PI * 2 / n, p = PI * 2 / n; for (const [rr, aa] of [[ri, a - .3 * p], [R, a - .15 * p], [R, a + .15 * p], [ri, a + .3 * p]]) g.lineTo(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr); } g.closePath(); g.fill();
      g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(cx, cy, 20, 0, 7); g.fill(); for (let k = 0; k < 5; k++) { const a = k * PI * 2 / 5; g.beginPath(); g.arc(cx + Math.cos(a) * 55, cy + Math.sin(a) * 55, 18, 0, 7); g.fill(); } g.globalCompositeOperation = 'source-over'; }
    else if (kind === 'man') { g.beginPath(); g.arc(cx, 60, 26, 0, 7); g.fill(); g.beginPath(); g.moveTo(cx - 40, 98); g.lineTo(cx + 40, 98); g.lineTo(cx + 46, 190); g.lineTo(cx + 20, 190); g.lineTo(cx + 18, 250); g.lineTo(cx - 18, 250); g.lineTo(cx - 20, 190); g.lineTo(cx - 46, 190); g.closePath(); g.fill(); }
    else if (kind === 'house') { g.fillRect(40, 110, 176, 120); g.beginPath(); g.moveTo(26, 112); g.lineTo(cx, 40); g.lineTo(230, 112); g.closePath(); g.fill(); g.globalCompositeOperation = 'destination-out'; g.fillRect(70, 140, 34, 36); g.fillRect(150, 140, 34, 36); g.fillRect(112, 180, 32, 50); g.globalCompositeOperation = 'source-over'; }
    else if (kind === 'pipe') { g.fillRect(20, 100, 216, 36); g.fillRect(200, 100, 36, 130); g.beginPath(); g.arc(218, 232, 26, 0, 7); g.fill(); g.fillRect(8, 90, 24, 56); }
    else if (kind === 'blob') { const r = g.createRadialGradient(cx, cy, 6, cx, cy, 120); r.addColorStop(0, 'rgba(46,18,50,.95)'); r.addColorStop(.6, 'rgba(46,18,50,.7)'); r.addColorStop(1, 'rgba(46,18,50,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }
    else if (kind === 'tower') { g.fillRect(100, 40, 56, 200); g.fillRect(84, 30, 88, 22); g.beginPath(); g.moveTo(88, 30); g.lineTo(cx, 6); g.lineTo(168, 30); g.closePath(); g.fill(); }
  });
  return SILT[kind];
}
// items: [{kind, x, y, s, spin?, rot?, k?}] in veil-local coordinates (y up from the floor). fn(t) -> {op, grow, spinMul}
export function shadows(Wd, V, items, fn) {
  const ms = items.map(it => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: silTex(it.kind), transparent: true, opacity: 0, depthWrite: false, fog: false })); m.renderOrder = 11; m.position.set(it.x, it.y, V.frontZ + .02); V.g.add(m); return m; });
  Wd.on(t => { const f = fn ? fn(t) : { op: .8 }; items.forEach((it, i) => { const m = ms[i]; m.material.opacity = clamp(f.op * (it.k === undefined ? 1 : it.k), 0, 1); const s = it.s * (f.grow === undefined ? 1 : f.grow); m.scale.set(s, s * (it.kind === 'gear' || it.kind === 'blob' ? 1 : 1), 1); m.rotation.z = (it.rot || 0) + (it.spin || 0) * t * (f.spinMul === undefined ? 1 : f.spinMul); m.visible = f.op > .01; }); });
  return ms;
}

// ---- wooden gears that really mesh ----
export function gearGeo(n, m, depth) {
  const r = n * m / 2, h = m * 1.05, ro = r + h * .45, ri = r - h * .55, sh = new THREE.Shape(), p = PI * 2 / n;
  for (let k = 0; k < n; k++) { const a = k * p; [[ri, a - .3 * p], [ro, a - .14 * p], [ro, a + .14 * p], [ri, a + .3 * p]].forEach(([rr, aa], j) => { const x = Math.cos(aa) * rr, y = Math.sin(aa) * rr; if (k === 0 && j === 0) sh.moveTo(x, y); else sh.lineTo(x, y); }); }
  sh.closePath();
  const hub = new THREE.Path(); hub.absarc(0, 0, ri * .2, 0, PI * 2, true); sh.holes.push(hub);
  if (n >= 14) for (let k = 0; k < 5; k++) { const a = k * PI * 2 / 5 + .3, c = new THREE.Path(); c.absarc(Math.cos(a) * ri * .6, Math.sin(a) * ri * .6, ri * .18, 0, PI * 2, true); sh.holes.push(c); }
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 8 }); g.translate(0, 0, -depth / 2); return g;
}
const GCOL = ['#a8733f', '#8a5a36', '#c08a52', '#7a4d2e', '#b88a5a'];
// o: {list:[n..], m, start:[x,y,z], dirs:[angle of each link (rad, 0 = +x)], depth, drive(t)->angle, speed, ry (rotate the whole train about y), skipInk}
export function gearChain(Wd, o) {
  const m = o.m || .12, L = o.list, g = new THREE.Group(); g.position.set(...(o.start || [0, 0, 0])); g.rotation.y = o.ry || 0; Wd.add(g);
  const P = [[0, 0]]; for (let i = 1; i < L.length; i++) { const d = (L[i - 1] + L[i]) * m / 2, a = o.dirs[i - 1]; P.push([P[i - 1][0] + Math.cos(a) * d, P[i - 1][1] + Math.sin(a) * d]); }
  const ms = L.map((n, i) => { const mesh = new THREE.Mesh(gearGeo(n, m, o.depth || .22), toon(GCOL[((o.c0 || 0) + i % 5) % 5])); mesh.castShadow = true; mesh.receiveShadow = true; if (!o.skipInk) ink(mesh, .018); mesh.position.set(P[i][0], P[i][1], 0); g.add(mesh); return mesh; });
  const phi = i => Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]);
  Wd.on(t => { const th = [(o.drive ? o.drive(t) : t * (o.speed || .5)) + (o.a0 || 0)]; ms[0].rotation.z = th[0];
    for (let i = 1; i < L.length; i++) { const f = phi(i), tp = th[i - 1]; th[i] = f + PI - ((f - tp) * L[i - 1] + PI) / L[i]; ms[i].rotation.z = th[i]; } });
  return { g, ms, P, last: P[P.length - 1] };
}

// ---- dominoes in a row; each falls at t0 + i*dt ----
export function dominoes(Wd, o) {
  const g = new THREE.Group(); g.position.set(o.x0, 0, o.z); g.rotation.y = o.ry || 0; Wd.add(g); const th = .13, w = o.w || .55, h = o.h || 1.0, cols = ['#efe3c8', '#b88a52', '#d9b46a', '#8a5a36'], P = [];
  for (let i = 0; i < o.n; i++) { const pv = new THREE.Group(); pv.position.set(i * o.gap + th / 2, 0, 0); g.add(pv); pv.add(box(th, h, w, cols[i % 4], { pos: [-th / 2, h / 2, 0], inkW: .012 })); P.push(pv); }
  Wd.on(t => { P.forEach((pv, i) => { const u = ease.in(prog(t, o.t0 + i * o.dt, o.t0 + i * o.dt + (o.fall || .55))); pv.rotation.z = -u * (i === o.n - 1 ? 1.45 : 1.02); }); });
  return { g, P };
}

// ---- a pill ----
export function pill(r, l) {
  const g = new THREE.Group(); g.add(cyl(r, r, l / 2, '#f4ecd8', { pos: [0, l / 4, 0], inkW: .008 })); g.add(cyl(r, r, l / 2, '#c44a40', { pos: [0, -l / 4, 0], inkW: .008 }));
  g.add(ball(r, '#f4ecd8', { pos: [0, l / 2, 0], inkW: .008 })); g.add(ball(r, '#c44a40', { pos: [0, -l / 2, 0], inkW: .008 })); return g;
}

// ---- dark fog (the sitra achra is only mist and shadow, never a figure) ----
// o: {n, area:[x0,x1,y0,y1,z0,z1], seed, size:[a,b], a(t) 0..1, target(t)->[x,y,z] or null, pull(t) 0..1, kill(t, x,y,z)->0..1 (dispersal by light)}
export function fogBank(Wd, o) {
  const r = rng(o.seed || 5), N = o.n || 20, A = o.area, S = [], sz = o.size || [4, 8];
  for (let i = 0; i < N; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: o.color || 0x1d0c28, transparent: true, opacity: 0, depthWrite: false, fog: false })); sp.renderOrder = 12;
    const b = [lerp(A[0], A[1], r()), lerp(A[2], A[3], r()), lerp(A[4], A[5], r())]; S.push({ sp, b, s: lerp(sz[0], sz[1], r()), k: .45 + .45 * r(), ph: r() * 6.28, w: .15 + .25 * r() }); Wd.add(sp); }
  Wd.on(t => { const a = o.a ? o.a(t) : 1, pull = o.pull ? o.pull(t) : 0, tg = o.target ? o.target(t) : null;
    for (const q of S) { let x = q.b[0] + 1.3 * Math.sin(t * q.w + q.ph), y = q.b[1] + .7 * Math.sin(t * q.w * 1.3 + q.ph * 2), z = q.b[2] + .9 * Math.cos(t * q.w + q.ph);
      if (tg && pull > 0) { const u = pull * q.k; x = lerp(x, tg[0], u); y = lerp(y, tg[1], u); z = lerp(z, tg[2], u); }
      const kill = o.kill ? o.kill(t, x, y, z) : 0; q.sp.position.set(x, y, z); q.sp.scale.setScalar(q.s * (1 + .12 * Math.sin(t * q.w * 2 + q.ph)) * (1 - .35 * kill));
      q.sp.material.opacity = clamp(a * (.28 + .3 * q.k) * (1 - kill), 0, 1); q.sp.visible = q.sp.material.opacity > .01; } });
  return S;
}

// warm dust floating upward in a region
export function dust(Wd, n, area, seed, a) {
  const r = rng(seed || 3), mt = motes(Wd, n), P = []; for (let i = 0; i < n; i++) P.push([lerp(area[0], area[1], r()), lerp(area[2], area[3], r()), lerp(area[4], area[5], r()), r(), .05 + .09 * r()]);
  Wd.on(t => { const k = a ? a(t) : 1; for (let i = 0; i < n; i++) { const [x, y, z, ph, s] = P[i], u = (t * .05 + ph) % 1; mt.set(i, x + .5 * Math.sin(t * .3 + ph * 9), area[2] + (y - area[2] + u * 6) % (area[3] - area[2] || 1), z, s * k * Math.sin(PI * u), 1, .8, .5); } mt.done(); });
  return mt;
}

// a lectern (shtender) with an open book
export function shtender(Wd, o) {
  const g = new THREE.Group(); g.position.set(o.x || 0, .012, o.z || 0); g.rotation.y = o.ry || 0; Wd.add(g); g.add(box(.56, .04, .5, WAL, { pos: [0, .02, 0] })); g.add(box(.1, .9, .1, WAL, { pos: [0, .47, 0], ink: false }));
  g.add(box(.62, .05, .46, WAL2, { pos: [0, 1.0, 0], rot: [-.42, 0, 0] })); const pg = box(.5, .02, .38, '#f6ecd4', { pos: [0, 1.04, -.005], rot: [-.42, 0, 0], ink: false }); g.add(pg); g.add(box(.62, .34, .04, WAL2, { pos: [0, .83, .22] })); return g;
}
// a table with a cloth-less top (for lab / willow / water)
export function bench(Wd, x, z, w, d, h, col) {
  h = h || .85; Wd.add(box(w, .08, d, col || WALNUT2, { pos: [x, h - .04, z], inkW: .012 })); for (const sx of [-1, 1]) for (const sz of [-1, 1]) Wd.add(box(.1, h - .08, .1, WALNUT, { pos: [x + sx * (w / 2 - .12), (h - .08) / 2, z + sz * (d / 2 - .12)], ink: false }));
}
// a glass vessel with coloured liquid: kind 'tube' | 'flask' | 'cup'
export function vessel(Wd, pos, kind, liquid, s) {
  s = s || 1; const g = new THREE.Group(); g.position.set(...pos); Wd.add(g); const gm = new THREE.MeshBasicMaterial({ color: 0xdfe8ff, transparent: true, opacity: .2, depthWrite: false });
  if (kind === 'tube') { const m = new THREE.Mesh(new THREE.CylinderGeometry(.045 * s, .045 * s, .32 * s, 14), gm); m.position.y = .16 * s; g.add(m); const l = new THREE.Mesh(new THREE.CylinderGeometry(.038 * s, .038 * s, .15 * s, 12), new THREE.MeshBasicMaterial({ color: liquid })); l.position.y = .09 * s; g.add(l); }
  else if (kind === 'flask') { const m = new THREE.Mesh(new THREE.SphereGeometry(.12 * s, 16, 12), gm); m.position.y = .13 * s; g.add(m); const n = new THREE.Mesh(new THREE.CylinderGeometry(.03 * s, .03 * s, .16 * s, 12), gm); n.position.y = .3 * s; g.add(n); const l = new THREE.Mesh(new THREE.SphereGeometry(.1 * s, 14, 10, 0, PI * 2, PI * .35, PI * .65), new THREE.MeshBasicMaterial({ color: liquid })); l.position.y = .12 * s; g.add(l); }
  else { const m = new THREE.Mesh(new THREE.CylinderGeometry(.06 * s, .05 * s, .12 * s, 16), gm); m.position.y = .06 * s; g.add(m); const l = new THREE.Mesh(new THREE.CylinderGeometry(.052 * s, .046 * s, .08 * s, 14), new THREE.MeshBasicMaterial({ color: liquid })); l.position.y = .045 * s; g.add(l); }
  return g;
}
// willow branches (aravot) tied in a bundle
export function willow(Wd, pos, o) {
  o = o || {}; const g = new THREE.Group(); g.position.set(...pos); g.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0); Wd.add(g); const r = rng(9), sc = o.s || 1;
  for (let i = 0; i < 7; i++) { const a = i / 7 * PI * 2, tilt = .12 + .06 * r(); const st = new THREE.Group(); st.rotation.set(Math.sin(a) * tilt, 0, Math.cos(a) * tilt); g.add(st);
    st.add(cyl(.012 * sc, .016 * sc, 1.2 * sc, '#8a7a4c', { pos: [0, .6 * sc, 0], ink: false }));
    for (let k = 0; k < 11; k++) { const side = k % 2 ? 1 : -1, y = (.18 + k * .09) * sc; st.add(ball(1, k % 3 ? '#6f8a56' : '#8aa064', { pos: [side * .045 * sc, y, 0], scale: [.07 * sc, .018 * sc, .035 * sc], rot: [0, 0, side * .5], ink: false })); } }
  g.add(cyl(.07 * sc, .07 * sc, .09 * sc, '#c9a35a', { pos: [0, .22 * sc, 0] })); return g;
}
// steps of light (S22): n steps climbing toward -z; k(i,t) 0..1 lights step i
export function stairs(Wd, o) {
  const n = o.n, w = o.w || 6, d = o.d || 2.4, h = o.h || .5, g = new THREE.Group(); g.position.set(...o.pos); Wd.add(g); const tops = [];
  for (let i = 0; i < n; i++) { g.add(box(w, h * (i + 1), d, i % 2 ? '#cdb38a' : '#d9c29c', { pos: [0, h * (i + 1) / 2, -i * d], inkW: .02 }));
    const gm = new THREE.MeshBasicMaterial({ map: wideGlowTex(), color: 0xffcf80, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }); const p = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.1, d * 1.5), gm); p.rotation.x = -PI / 2; p.position.set(0, h * (i + 1) + .02, -i * d); g.add(p); tops.push(gm); }
  Wd.on(t => { tops.forEach((m, i) => { m.opacity = .85 * o.k(i, t); }); });
  return { g, topY: i => h * (i + 1), zAt: i => o.pos[2] - i * d };
}
