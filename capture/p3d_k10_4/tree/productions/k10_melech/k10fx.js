// k10fx.js - extra props for k10 ("Before whom do I stand?"): candles, lantern, aron kodesh + parochet, clock, hourglass, lake, strata, spring, floating words.
// Everything is a function of t only. The King is NEVER drawn: only light, the parochet of the aron, and writing.
import { THREE, box, cyl, ball, toon, canvasTex, label, rng, clamp, lerp, ease, prog } from '../../lib/stage3d.js';
import { glowSprite, motes, glowTex, WAL, WAL2, COP, IVORY, HONEY, INDIGO, PI, sm } from './k10lib.js';

// ---- timing: source second -> film second (after the four cuts); SS = film start of each shot ----
const CUTS = [[123.2, 133.6], [361.5, 365.0], [390.0, 398.2], [509.7, 512.03]], START = 23.7;
export const CL = s => s - START - CUTS.reduce((a, [c0, c1]) => a + (c1 <= s ? c1 - c0 : (s > c0 ? s - c0 : 0)), 0);
export const SS = [0, 29.3, 51.3, 76.3, 92.3, 120.5, 147.4, 180.4, 195.9, 218.4, 233.9, 249.9, 273.9, 295.9, 322.9, 346.4, 370.7, 390.2, 416.2, 434.2, 463.9, 487.87];
export const lt = (shot, src) => CL(src) - SS[shot - 1];   // local time (in shot number `shot`, 1-based) of a source second

export const lblIndigo = { bg: 'rgba(24,30,78,.88)', color: '#ffecc0' };

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
