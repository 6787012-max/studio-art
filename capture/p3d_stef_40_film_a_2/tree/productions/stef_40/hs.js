// hs.js - shared module for the stef_40 film (return the stray animal, again and again). Pure functions of t. No Hebrew anywhere.
import { THREE, box, cyl, ball, mesh, toon, label, ease, prog, clamp, lerp, rng } from '../../lib/stage3d.js';
import { PAL, sm, lp3, mkWorld, motes, checkMark, prohib, clockRing, heroProxy, glow, scroll, topiary, puff } from './hs_base.js';
export { PAL, sm, lp3, mkWorld, motes, checkMark, prohib, clockRing, heroProxy, glow, scroll, topiary, puff };

export const K = { grass: 0x9CC27A, sand: 0xD8C9A8, wood: 0x6B4A32, cream: 0xF3EBD3, terra: 0xC9673E, gold: 0xE8B830, red: 0xC2453A, green: 0x4FA35A, wool: 0xF7F4EC,
  warm: 0xFFD27A, dim: 0x8FA2B8, straw: 0xE6D6A2, fence: 0xA9794E };
const INK = 0x8C7650, WINK = 0x2E1D12;
const V3 = THREE.Vector3;
const sc1 = (o, k) => o.scale.setScalar(Math.max(k, 1e-4));
export const A3 = (a, b, u, h) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + (h || 0) * Math.sin(Math.PI * u), lerp(a[2], b[2], u)];
export const POP = (t, a, b) => ease.out(prog(t, a, b));
export const pulse = (t, a, b, c, d) => sm(t, a, b) * (1 - sm(t, c, d));
export const CAM = (p0, l0, p1, l1, dur, fov) => t => { const u = ease.io(prog(t, 0, dur)); return { pos: lp3(p0, p1, u), look: lp3(l0, l1, u), fov: fov || 44 }; };
const wrapA = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const lerpA = (a, b, u) => a + wrapA(b - a) * u;
const yawTo = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);

// ---------------- scenery ----------------
function tree(Wd, x, z, s) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); Wd.add(g);
  g.add(cyl(.22, .3, 1.7, K.wood, { pos: [0, .85, 0], ink: false }));
  g.add(ball(1.1, 0x7DBA5A, { pos: [0, 2.5, 0], inkW: .03, inkColor: 0x3F7A3A })); g.add(ball(.8, 0x6FAE5C, { pos: [.7, 3.2, .1], inkW: .03, inkColor: 0x3F7A3A }));
}
export function scenery(Wd, cx, span, seed, noFlow) {
  const r = rng(seed || 7);
  for (let x = cx - span; x <= cx + span; x += 6.5) tree(Wd, x + r() * 3, -8.5 - r() * 4, .9 + r() * .5);
  for (let i = 0; i < Math.round(span * .55); i++) { const b = ball(.55 + r() * .4, r() < .5 ? 0x6FAE5C : 0x86C068, { pos: [cx + (r() * 2 - 1) * span, .35, -5 - r() * 2.5], inkW: .025, inkColor: 0x3F7A3A }); b.scale.y = .75; Wd.add(b); }
  if (!noFlow) for (let i = 0; i < Math.round(span * 1.2); i++) {
    const z = r() < .5 ? -2.6 - r() * 4 : 5 + r() * 3.5, c = [0xF2C94C, 0xFFFFFF, 0xE48C8C][Math.floor(r() * 3)];
    Wd.add(ball(.07, c, { pos: [cx + (r() * 2 - 1) * span, .09, z], ink: false, cast: false })); }
}
export function ground(Wd, o) {
  o = o || {}; const cx = o.cx || 0, w = o.w || 80, r = rng(11);
  Wd.add(box(w, .2, 38, o.grass || K.grass, { pos: [cx, -.08, -4], ink: false, cast: false }));
  for (let i = 0; i < Math.round(w * .5); i++) { const p = cyl(.8 + r() * 1.4, .8 + r() * 1.4, .03, r() < .5 ? 0xA8CB86 : 0x8FB86F, { pos: [cx + (r() * 2 - 1) * w / 2, .03, -9 + r() * 22], ink: false, cast: false }); Wd.add(p); }
}

// ---------------- the owner's house: cream cottage, terracotta roof, ONE lit window ----------------
export function house(Wd, s) {
  s = s || 1; const g = new THREE.Group(); g.scale.setScalar(s); Wd.add(g);
  g.add(box(3.2, 2.2, 2.6, K.cream, { pos: [0, 1.1, 0], inkW: .02, inkColor: INK }));
  const sh = new THREE.Shape(); sh.moveTo(-2.15, 0); sh.lineTo(2.15, 0); sh.lineTo(0, 1.55); sh.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(sh, { depth: 3.2, bevelEnabled: false }), toon(K.terra), { pos: [0, 2.2, -1.6], inkW: .02, inkColor: 0x6A2E18, box: true }));
  g.add(box(.5, .9, .5, K.cream, { pos: [1.0, 3.2, -.5], inkW: .015, inkColor: INK })); g.add(box(.62, .12, .62, K.wood, { pos: [1.0, 3.7, -.5], ink: false }));
  g.add(box(.8, 1.4, .08, K.wood, { pos: [.55, .7, 1.32], inkW: .012, inkColor: WINK })); g.add(ball(.05, K.gold, { pos: [.8, .7, 1.38], ink: false }));
  g.add(box(1.0, 1.0, .1, K.wood, { pos: [-.75, 1.3, 1.32], inkW: .012, inkColor: WINK }));
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(.78, .78), new THREE.MeshBasicMaterial({ color: K.warm, fog: false })); pane.position.set(-.75, 1.3, 1.385); g.add(pane);
  g.add(box(.05, .8, .03, K.wood, { pos: [-.75, 1.3, 1.4], ink: false })); g.add(box(.8, .05, .03, K.wood, { pos: [-.75, 1.3, 1.4], ink: false }));
  const wg = glow(g, 3.6, 0xFFC860); wg.s.position.set(-.75, 1.3, 1.7);
  const cA = new THREE.Color(K.dim), cB = new THREE.Color(K.warm), tmp = new THREE.Color();
  const H = { g, pane, s, lit(k) { k = clamp(k, 0, 1); tmp.copy(cA).lerp(cB, k); pane.material.color.copy(tmp); wg.set(.85 * k * k); },
    place(x, z, ry) { g.position.set(x, 0, z); g.rotation.y = ry || 0; g.updateMatrixWorld(true); return H; } };
  H.lit(1); return H;
}

// ---------------- the PEN: low round fence, straw floor, swinging gate ----------------
export function pen(Wd, pc, R) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(cyl(R + .05, R + .05, .06, K.straw, { pos: [pc[0], .03, pc[2]], ink: false, cast: false }));
  const N = 18, D = 2 * Math.PI / N, posts = [];
  for (let i = 0; i < N; i++) { const a = (i + .5) * D; if (a < .3 || a > 2 * Math.PI - .3) { posts.push(null); continue; }
    const p = [pc[0] + R * Math.cos(a), pc[2] + R * Math.sin(a)]; posts.push(a); g.add(box(.17, 1.0, .17, K.fence, { pos: [p[0], .5, p[1]], inkW: .012, inkColor: WINK })); }
  for (let i = 1; i <= N - 3; i++) { const a = (i + 1) * D, am = a, Rm = R * Math.cos(D / 2), len = 2 * R * Math.sin(D / 2), th = Math.atan2(-Math.cos(am), -Math.sin(am));
    [.38, .74].forEach(y => g.add(box(len, .09, .07, K.fence, { pos: [pc[0] + Rm * Math.cos(am), y, pc[2] + Rm * Math.sin(am)], rot: [0, th, 0], ink: false }))); }
  const ha = -.52, hx = pc[0] + R * Math.cos(ha), hz = pc[2] + R * Math.sin(ha), GL = 2 * R * Math.sin(.52) - .1;
  g.add(box(.17, 1.0, .17, K.fence, { pos: [hx, .5, hz], inkW: .012, inkColor: WINK }));
  const gate = new THREE.Group(); gate.position.set(hx, 0, hz + .05); g.add(gate);
  [.2, .48, .76].forEach(y => gate.add(box(.08, .1, GL, K.fence, { pos: [0, y, GL / 2], inkW: .01, inkColor: WINK })));
  [0, .5, 1].forEach(q => gate.add(box(.1, .95, .1, K.fence, { pos: [0, .48, GL * q], inkW: .01, inkColor: WINK })));
  const br = box(.06, .08, Math.hypot(GL, .56), K.wood, { pos: [0, .48, GL / 2], ink: false }); br.rotation.x = -Math.atan2(.56, GL); gate.add(br);
  return { g, gate, set(k) { gate.rotation.y = 1.45 * ease.io(clamp(k, 0, 1)); }, gout: [pc[0] + R + .9, 0, pc[2]] };
}

// ---------------- animals ----------------
function legSwing(legs, ph, w, air, amp) { legs.forEach((l, i) => { const s = (i === 0 || i === 3) ? 0 : Math.PI; l.rotation.x = Math.sin(ph + s) * amp * w * (1 - air) - air * .7; }); }
export function sheep(Wd) {
  const g = new THREE.Group(), body = new THREE.Group(); Wd.add(g); g.add(body); g.scale.setScalar(1.35); const dark = 0x4D4A52;
  const core = ball(.52, K.wool, { pos: [0, .78, 0], inkW: .02, inkColor: INK }); core.scale.set(1, .92, 1.3); body.add(core);
  [[.34, .96, .2], [-.34, .96, .2], [.32, .92, -.42], [-.32, .92, -.42], [0, 1.17, -.1], [0, 1.1, .38], [.4, .66, .5], [-.4, .66, .5], [.36, .66, -.45], [-.36, .66, -.45]].forEach(p => body.add(ball(.28, K.wool, { pos: p, ink: false })));
  body.add(ball(.13, K.wool, { pos: [0, .86, -.74], ink: false }));
  const head = new THREE.Group(); head.position.set(0, .98, .7); body.add(head);
  const hb = ball(.25, dark, { inkW: .015, inkColor: 0x222222 }); hb.scale.set(.9, 1, 1.2); head.add(hb);
  [-1, 1].forEach(s => { const e = ball(.09, dark, { pos: [s * .25, .02, -.05], ink: false }); e.scale.set(1.7, .5, .9); head.add(e);
    head.add(ball(.05, 0xFFFFFF, { pos: [s * .1, .07, .2], ink: false })); head.add(ball(.026, 0x111111, { pos: [s * .1, .07, .24], ink: false })); });
  head.add(ball(.17, K.wool, { pos: [0, .22, -.08], ink: false }));
  const legs = [[.24, .4], [-.24, .4], [.24, -.4], [-.24, -.4]].map(p => { const pv = new THREE.Group(); pv.position.set(p[0], .5, p[1]); body.add(pv); pv.add(cyl(.065, .055, .5, dark, { pos: [0, -.25, 0], ink: false })); return pv; });
  return { g, kind: 'sheep', set(pos, yaw, o) { o = o || {}; const w = o.walk || 0, ph = o.ph || 0, air = o.air || 0; g.position.set(pos[0], pos[1], pos[2]); g.rotation.y = yaw;
      body.position.y = .08 * w * Math.abs(Math.sin(ph)) + .1 * air; body.rotation.x = -.3 * air; legSwing(legs, ph, w, air, .6); head.rotation.x = (o.nod || 0) * .7 + .06 * Math.sin(ph) * w; } };
}
export function cow(Wd) {
  const g = new THREE.Group(), body = new THREE.Group(); Wd.add(g); g.add(body); g.scale.setScalar(1.1); const br = 0x8A5A3A;
  const core = ball(.72, br, { pos: [0, 1.05, 0], inkW: .02, inkColor: 0x3A2414 }); core.scale.set(.95, .85, 1.6); body.add(core);
  [[-.6, 1.18, -.15], [.55, 1.0, .5]].forEach(p => { const q = ball(.3, 0xF3EBD3, { pos: p, ink: false }); q.scale.set(.5, 1, 1.1); body.add(q); });
  const head = new THREE.Group(); head.position.set(0, 1.3, 1.2); body.add(head);
  const hb = ball(.38, 0x9B6A48, { inkW: .015, inkColor: 0x3A2414 }); hb.scale.set(.9, .95, 1.1); head.add(hb);
  const sn = ball(.22, 0xF0B9A8, { pos: [0, -.1, .3], ink: false }); sn.scale.set(1, .8, .9); head.add(sn);
  [-1, 1].forEach(s => { head.add(cyl(0, .06, .3, 0xF3EBD3, { pos: [s * .22, .36, -.02], rot: [0, 0, -s * .5], ink: false }));
    const e = ball(.1, br, { pos: [s * .4, .14, -.05], ink: false }); e.scale.set(1.6, .5, .9); head.add(e);
    head.add(ball(.05, 0xFFFFFF, { pos: [s * .17, .12, .26], ink: false })); head.add(ball(.026, 0x111111, { pos: [s * .17, .12, .3], ink: false })); });
  const legs = [[.4, .7], [-.4, .7], [.4, -.7], [-.4, -.7]].map(p => { const pv = new THREE.Group(); pv.position.set(p[0], .8, p[1]); body.add(pv); pv.add(cyl(.1, .09, .8, br, { pos: [0, -.4, 0], inkW: .01, inkColor: 0x3A2414 })); return pv; });
  const tail = cyl(.03, .03, .85, br, { pos: [0, 1.0, -1.18], rot: [.35, 0, 0], ink: false }); body.add(tail); body.add(ball(.1, 0x3A2414, { pos: [0, .6, -1.3], ink: false }));
  return { g, kind: 'cow', set(pos, yaw, o) { o = o || {}; const w = o.walk || 0, ph = o.ph || 0, air = o.air || 0; g.position.set(pos[0], pos[1], pos[2]); g.rotation.y = yaw;
      body.position.y = .05 * w * Math.abs(Math.sin(ph)); legSwing(legs, ph, w, air, .5); head.rotation.x = (o.nod || 0) * .6; tail.rotation.z = .12 * Math.sin(ph * .5); } };
}

// ---------------- routes + the gold RETURN ARROW (dotted, additive shimmer) ----------------
export function route(A, B, c) {
  c = c || [0, 0, 0]; const C = [(A[0] + B[0]) / 2 + c[0], (A[1] + B[1]) / 2 + c[1], (A[2] + B[2]) / 2 + c[2]];
  const at = u => { u = clamp(u, 0, 1); const a = 1 - u; return [a * a * A[0] + 2 * a * u * C[0] + u * u * B[0], a * a * A[1] + 2 * a * u * C[1] + u * u * B[1], a * a * A[2] + 2 * a * u * C[2] + u * u * B[2]]; };
  const tan = u => { u = clamp(u, 0, 1); const a = 1 - u; return [2 * a * (C[0] - A[0]) + 2 * u * (B[0] - C[0]), 2 * a * (C[1] - A[1]) + 2 * u * (B[1] - C[1]), 2 * a * (C[2] - A[2]) + 2 * u * (B[2] - C[2])]; };
  return { A, B, C, at, tan, yaw(u) { const d = tan(u); return Math.atan2(d[0], d[2]); } };
}
export function goldArrow(Wd, o) {
  o = o || {}; const N = o.n || 32, g = new THREE.Group(); Wd.add(g); const add = o.add !== false;
  const mk = (c, op) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, fog: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
  const mC = mk(o.color || K.gold, 1), mA = mk(o.halo || 0xFFD060, .26), gs = new THREE.SphereGeometry(1, 10, 8), cs = [], as = [];
  for (let i = 0; i < N; i++) { const c = new THREE.Mesh(gs, mC), a = new THREE.Mesh(gs, mA); c.renderOrder = a.renderOrder = 3; c.visible = a.visible = false; g.add(c, a); cs.push(c); as.push(a); }
  const hc = new THREE.Mesh(new THREE.ConeGeometry(.42, .9, 14), mC), ha = new THREE.Mesh(new THREE.ConeGeometry(.75, 1.4, 14), mA); hc.renderOrder = ha.renderOrder = 3; g.add(hc, ha); hc.visible = ha.visible = false;
  const up = new V3(0, 1, 0), d = new V3(), rd = o.r || .15;
  return { g, set(rt, from, draw, alpha, t, y) {
      alpha = clamp(alpha, 0, 1); g.visible = alpha > .01 && draw > from + .01; if (!g.visible) return; mC.opacity = alpha; mA.opacity = .26 * alpha; y = y || 0;
      for (let i = 0; i < N; i++) { const u = (i + .5) / N, on = u >= from && u <= draw - .03, p = rt.at(u), s = rd * (.78 + .3 * Math.sin(t * 6 - i * .7));
        cs[i].visible = as[i].visible = on; if (on) { cs[i].position.set(p[0], p[1] + y, p[2]); as[i].position.copy(cs[i].position); cs[i].scale.setScalar(s); as[i].scale.setScalar(s * 2.3); } }
      const hv = draw > from + .07; hc.visible = ha.visible = hv;
      if (hv) { const p = rt.at(draw), tg = rt.tan(Math.min(draw, .999)); d.set(tg[0], tg[1], tg[2]).normalize(); hc.position.set(p[0], p[1] + y, p[2]); ha.position.copy(hc.position); hc.quaternion.setFromUnitVectors(up, d); ha.quaternion.copy(hc.quaternion); const k = 1 + .12 * Math.sin(t * 7); hc.scale.setScalar(k * (o.hs || 1)); ha.scale.setScalar(k * (o.hs || 1)); }
    } };
}

// ---------------- COUNTER: wooden sign on a post, big ASCII number, gold pulse ----------------
export function counter(Wd, pos, s) {
  const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g); const sg = new THREE.Group(); sc1(sg, s || 1); g.add(sg);
  sg.add(cyl(.14, .17, 2.6, K.wood, { pos: [0, 1.3, 0], inkW: .015, inkColor: WINK }));
  const bd = new THREE.Group(); bd.position.set(0, 3.0, 0); sg.add(bd);
  bd.add(box(2.9, 1.7, .18, K.cream, { inkW: .02, inkColor: INK }));
  [-1, 1].forEach(q => { bd.add(box(3.1, .14, .22, K.wood, { pos: [0, q * .85, 0], inkW: .01, inkColor: WINK })); bd.add(box(.14, 1.7, .22, K.wood, { pos: [q * 1.5, 0, 0], inkW: .01, inkColor: WINK })); });
  const gl = glow(bd, 5.6, 0xFFC040); gl.s.position.set(0, 0, .2);
  const dg = new THREE.Group(); dg.position.set(0, 0, .55); bd.add(dg);
  const slots = [0, 1, 2].map(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => { const sp = label(dg, String(d), { size: 100, bg: null, color: '#6B4A32', height: 1.7, depthTest: true }); sp.visible = false; return sp; }));
  return { g, sg, top: [pos[0], pos[1] + 3.0 * (s || 1), pos[2]], set(n, k) { const str = String(Math.max(0, Math.min(999, Math.round(n)))), L = str.length;
      slots.forEach((sl, i) => sl.forEach((sp, d) => { const on = i < L && +str[i] === d; sp.visible = on; if (on) sp.position.x = (i - (L - 1) / 2) * .66; }));
      sc1(dg, 1 + .35 * clamp(k, 0, 1)); gl.set(.9 * clamp(k, 0, 1)); } };
}
// n increments at each time in `times`; returns {n, k} (k = gold pulse 0..1)
export function tally(t, times, base) { let n = base || 0, k = 0; times.forEach(d => { if (t >= d) n++; k = Math.max(k, sm(t, d, d + .1) * (1 - sm(t, d + .1, d + .85))); }); return { n, k }; }
// green-check window: 0..1 pop after each time, fades after `hold` unless sticky
export function ckWin(t, times, hold, sticky) { let k = 0; times.forEach((d, i) => { const last = sticky && i === times.length - 1; k = Math.max(k, POP(t, d + .1, d + .5) * (last ? 1 : 1 - sm(t, d + hold, d + hold + .4))); }); return k; }

// ---------------- concentric faint gold loops (a hundred times) ----------------
export function loops(Wd, pc, n, r0, dr) {
  const g = new THREE.Group(); g.position.set(pc[0], .09, pc[2]); Wd.add(g); const rs = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(r0 + dr * i, .06, 8, 72), new THREE.MeshBasicMaterial({ color: K.gold, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); m.rotation.x = Math.PI / 2; m.renderOrder = 2; g.add(m); rs.push(m); }
  return { g, set(k, t, a) { rs.forEach((m, i) => { const u = clamp(k - i, 0, 1); m.visible = u > .01; m.scale.setScalar(.6 + .4 * ease.out(u)); m.material.opacity = (a === undefined ? 1 : a) * .55 * u * (.6 + .4 * Math.sin(t * 2.2 - i * .8)) * (1 - .45 * i / n); }); } };
}

// ---------------- world + FARM (house + pen + counter + sheep [+ cow] + gate + check + red bar) ----------------
export function mkS(o) {
  o = o || {}; const cx = o.cx || 0, Wd = mkWorld(Object.assign({ cx, ext: o.ext || 18, span: o.span }, o.world));
  ground(Wd, { cx, w: o.gw || 80, grass: o.grass }); scenery(Wd, cx, o.sspan || 30, o.seed || 1);
  motes(Wd, o.motes || 36, o.seed || 1, Object.assign({ cx, w: 28, z0: -6, z1: 7 }, o.moteO));
  if (!o.noTop) { topiary(Wd, cx - 11.5, 6.5, 1.15); topiary(Wd, cx + 11.8, 7.2, 1.3); }
  return Wd;
}
export function farm(Wd, o) {
  o = o || {}; const ox = o.ox || 0, R = 2.1, pc = [ox - 4, 0, 1.4];
  const hs = house(Wd, 1.1); hs.place(ox - 11.6, -2.3, .35); const pn = pen(Wd, pc, R);
  Wd.add(box(14, .05, 1.8, K.sand, { pos: [pc[0] + R + 7.2, .035, pc[2]], ink: false, cast: false }));
  const ct = counter(Wd, [ox - 7.7, 0, 2.7], o.cs || .8), sh = sheep(Wd), cw = o.cow ? cow(Wd) : null;
  const ck = checkMark(o.ck || 1.5); Wd.add(ck.g); ck.g.position.set(pc[0], 3.5, pc[2] + .3); const rb = prohib(Wd, .9), dust = puff(Wd);
  const th = .85, dir = [Math.cos(th), Math.sin(th)];
  const F = { Wd, hs, pn, ct, sheep: sh, cow: cw, ck, rb, dust, pc, R, gout: pn.gout, ox,
    rin: [pc[0] + dir[0] * 1.2, 0, pc[2] + dir[1] * 1.2], E: [pc[0] + dir[0] * (R + 1.3), 0, pc[2] + dir[1] * (R + 1.3)],
    rest: { sheep: [pc[0] - .5, .06, pc[2] - .35], cow: [pc[0] + .6, .06, pc[2] + .5] }, ckPos() { ck.g.position.set(pc[0], 3.5 + .06 * Math.sin(F.t * 1.8), pc[2] + .3); } };
  F.t = 0; return F;
}
export function heroOn(Wd, obj, w, h) { w = w || 8; h = h || 5.6; const p = heroProxy(Wd, [0, h / 2, 0], [w, h, 2]); Wd.on(() => { p.position.set(obj.g.position.x, h / 2, obj.g.position.z); }); Wd.hero = p; return p; }

// ---------------- TRIPS: hop out -> trot to stray spot -> gold arrow -> trot home -> gate -> counter ----------------
// phases (fraction f of L): hop 0-.2, trot out .2-.4, idle .4-.56 (arrow draws .46-.62), trot home .56-.86, into pen .86-.96, done .96
export function mkTrip(F, o) {
  const S = o.S, tr = Object.assign({ hopOut: false, L: 5, ph0: 0, rin: F.rin, E: F.E, restYaw: 2.2 }, o);
  tr.rest = o.rest || F.rest[(o.an && o.an.kind) || 'sheep']; tr.rt = route(S, F.gout, o.c || [0, 0, 1.0]); tr.done = tr.t0 + .96 * tr.L; return tr;
}
function tripPose(F, t, tr) {
  const f0 = (t - tr.t0) / tr.L, f = tr.hopOut ? f0 : Math.max(f0, .4), S = tr.S, ph = t * 12, rt = tr.rt, z = [0, 0, 0];
  const idleP = k => [S[0] + .5 * Math.sin(.7 * t + tr.ph0) * k, 0, S[2] + .3 * Math.cos(.5 * t + tr.ph0) * k];
  const idleY = () => Math.atan2(.35 * Math.cos(.7 * t + tr.ph0), -.15 * Math.sin(.5 * t + tr.ph0));
  const graze = Math.max(0, Math.sin(t * .9 + tr.ph0)), nod = graze;
  if (f < 0) return { p: tr.rest, yaw: tr.restYaw, walk: 0, nod };
  if (f < .2) { const u = f / .2; const p = A3(tr.rin, tr.E, ease.io(u), 1.7); return { p, yaw: yawTo(tr.rin, tr.E), walk: 0, air: 1 }; }
  if (f < .4) { const u = ease.io(prog(f, .2, .4)); return { p: lp3(tr.E, S, u), yaw: yawTo(tr.E, S), walk: 1, ph }; }
  if (tr.noReturn || f < .56) { const k = tr.noReturn ? 1 : 1 - sm(f, .46, .54), arr = tr.noReturn ? 0 : sm(f, .48, .56); const p = idleP(k);
    return { p, yaw: lerpA(idleY(), rt.yaw(0), arr), walk: .5 * k, ph: ph * .5, nod: nod * (1 - arr) }; }
  if (f < .86) { const u = ease.io(prog(f, .56, .86)); return { p: rt.at(u), yaw: rt.yaw(u), walk: 1, ph }; }
  if (f < .96) { const u = ease.io(prog(f, .86, .96)); return { p: lp3(F.gout, tr.rest, u), yaw: lerpA(rt.yaw(1), yawTo(F.gout, tr.rest), .8), walk: 1, ph }; }
  return { p: tr.rest, yaw: tr.restYaw, walk: 0, nod };
}
// applies pose of the active trip to tr.an, updates every trip's arrow; returns {gate, dust}
export function playTrips(F, t, an, trips) {
  let act = trips[0]; trips.forEach(tr => { if (t >= tr.t0) act = tr; });
  const s = tripPose(F, t, act); an.set(s.p, s.yaw, { walk: s.walk, ph: s.ph, air: s.air, nod: s.nod });
  let gate = 0, dust = null;
  trips.forEach(tr => { const f0 = (t - tr.t0) / tr.L;
    gate = Math.max(gate, tr.noReturn ? 0 : sm(f0, .5, .58) * (1 - sm(f0, .9, .99)));
    if (tr.hopOut && f0 > .2 && f0 < .36) dust = { k: prog(f0, .2, .36), pos: tr.E };
    if (tr.arrow) { const draw = tr.noReturn ? 0 : ease.io(prog(f0, .46, .62)), from = f0 < .56 ? 0 : (f0 < .86 ? ease.io(prog(f0, .56, .86)) : 1);
      tr.arrow.set(tr.rt, from, draw, tr.noReturn ? 0 : 1 - sm(f0, .9, 1.0), t, .15); } });
  return { gate, dust };
}
// counter + check + gate + dust in one call
export function farmFx(F, t, o) {
  F.t = t; const y = tally(t, o.times || [], o.base || 0); F.ct.set(o.n === undefined ? y.n : o.n, o.k === undefined ? y.k : o.k);
  F.pn.set(o.gate || 0); if (o.dust) F.dust.set(o.dust.k, o.dust.pos); else F.dust.set(0, [0, -9, 0]);
  F.ck.set(o.ck || 0); F.ckPos(); return y;
}
// a resting animal inside the pen (grazing)
export function restAt(F, t, an, which, ph) { an.set(F.rest[which], which === 'cow' ? 1.0 : 2.2, { nod: Math.max(0, Math.sin(t * .9 + (ph || 0))) }); }
