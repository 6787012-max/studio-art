// ye.js - shared module for the stef_39 film (yeush: the hope thread). Pure functions of t. No Hebrew anywhere.
import { THREE, box, cyl, ball, mesh, toon, canvasTex, ease, prog, clamp, lerp, rng } from '../../lib/stage3d.js';
import { PAL, sm, lp3, mkWorld, motes, checkMark, prohib, numberTag, pop, clockRing, heroProxy, glow, scroll, balance, topiary } from './ye_base.js';
export { PAL, sm, lp3, mkWorld, motes, checkMark, prohib, numberTag, pop, clockRing, heroProxy, glow, scroll, balance, topiary };

export const K = { crate: 0xD8B98A, wood: 0x6B4A32, cream: 0xF3EBD3, terra: 0xC9673E, gold: 0xE8B830, teal: 0x3FA7A0, water: 0x4FA8E0, sand: 0xD8C9A8,
  basket: 0xC9A15A, pouch: 0x7A5CA8, grain: 0xE2C46A, field: 0xE2B94A, soil: 0x7A5A3C, path: 0xCFC4AE, dim: 0x8FA2B8, warm: 0xFFD27A, brass: 0xC9983A };
const INK = 0x8C7650, WINK = 0x2E1D12;
const V3 = THREE.Vector3;
const fr = x => ((x % 1) + 1) % 1;
const sc1 = (o, k) => o.scale.setScalar(Math.max(k, 1e-4));
export const A3 = (a, b, u, h) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + (h || 0) * Math.sin(Math.PI * u), lerp(a[2], b[2], u)];
export const POP = (t, a, b) => ease.out(prog(t, a, b));
const wcol = (m, c) => { m.material.emissive = new THREE.Color(c); return m; };

// ---------------- ground: sand slab + paved path + soft foreground ----------------
export function ground(Wd, o) {
  o = o || {}; const cx = o.cx || 0;
  Wd.add(box(o.w || 46, .2, o.d || 20, K.sand, { pos: [cx, -.08, o.z || 0], ink: false, cast: false }));
  if (o.path !== false) Wd.add(box(o.pw || 26, .05, o.pd || 2.8, K.path, { pos: [cx + (o.px || 0), .035, o.pz === undefined ? 1.6 : o.pz], ink: false, cast: false }));
}

// ---------------- OWNER'S HOUSE: cottage, terracotta roof, ONE lit window ----------------
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
  g.add(box(.14, .14, .4, K.wood, { pos: [1.22, 1.7, 1.5], ink: false }));   // hook for the pouch
  const wg = glow(g, 3.6, 0xFFC860); wg.s.position.set(-.75, 1.3, 1.7);
  const cA = new THREE.Color(K.dim), cB = new THREE.Color(K.warm), tmp = new THREE.Color();
  const H = { g, pane, wp: [0, 1.3, 0], dp: [0, 0, 0], hp: [0, 1.6, 0], s,
    lit(k) { k = clamp(k, 0, 1); tmp.copy(cA).lerp(cB, k); pane.material.color.copy(tmp); wg.set(.85 * k * k); },
    place(x, z, ry, y) { g.position.set(x, y || 0, z); g.rotation.y = ry || 0; g.updateMatrixWorld(true);
      H.wp = g.localToWorld(new V3(-.75, 1.3, 1.65)).toArray(); H.dp = g.localToWorld(new V3(.55, 0, 1.9)).toArray(); H.hp = g.localToWorld(new V3(1.22, 1.5, 1.75)).toArray(); H.top = [x, (y || 0) + 4.9 * s, z]; return H; } };
  H.lit(1); return H;
}

// ---------------- LOST OBJECT: small wooden crate; optional SIGN tag ----------------
export function crate(Wd, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g);
  g.add(box(1.1, .85, .85, K.crate, { pos: [0, .425, 0], inkW: .02, inkColor: WINK }));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(box(.13, .85, .13, K.wood, { pos: [a * .5, .425, b * .37], ink: false })));
  [-1, 1].forEach(b => [.05, .8].forEach(y => g.add(box(1.1, .1, .1, K.wood, { pos: [0, y, b * .39], ink: false }))));
  [-1, 1].forEach(a => [.05, .8].forEach(y => g.add(box(.1, .1, .85, K.wood, { pos: [a * .5, y, 0], ink: false }))));
  g.add(box(1.2, .08, .05, K.wood, { pos: [0, .425, .435], rot: [0, 0, .6], ink: false })); g.add(box(1.2, .08, .05, K.wood, { pos: [0, .425, .435], rot: [0, 0, -.6], ink: false }));
  let tag = null;
  if (o.tag) {
    const cord = cyl(.015, .015, .34, 0xA88A5A, { pos: [.34, .66, .5], ink: false }); g.add(cord);
    const dm = box(.34, .34, .06, K.teal, { pos: [.34, .38, .5], rot: [0, 0, Math.PI / 4], inkW: .012, inkColor: 0x14504C }); dm.material.emissive = new THREE.Color(K.teal); dm.material.emissiveIntensity = .15; g.add(dm);
    const tg = glow(g, 1.8, 0x3FE8D8); tg.s.position.set(.34, .38, .68);
    tag = { dm, tg, glowK(k) { k = clamp(k, 0, 1); dm.material.emissiveIntensity = .15 + .85 * k; tg.set(.9 * k); }, col(m) { dm.material.color.set(m); } };
  }
  return { g, tag, top() { return [g.position.x, g.position.y + .95 * g.scale.x, g.position.z]; } };
}

// ---------------- HOPE THREAD: glowing gold line; flicker, thin, SNAP (ends curl away) ----------------
export function thread(Wd, o) {
  o = o || {}; const N = 24, H = N / 2, g = new THREE.Group(); Wd.add(g);
  const geo = new THREE.CylinderGeometry(1, 1, 1, 6), mk = (c, op) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
  const mC = mk(o.color || K.gold, 1), mA = mk(0xFFD060, .25), cs = [], as = [];
  for (let i = 0; i < N; i++) { const c = new THREE.Mesh(geo, mC), a = new THREE.Mesh(geo, mA); c.renderOrder = a.renderOrder = 3; c.visible = a.visible = false; g.add(c, a); cs.push(c); as.push(a); }
  const up = new V3(0, 1, 0), d = new V3(); let A = [0, 0, 0], B = [0, 0, 0], q = {}, tt = 0;
  const base = u => { const s = q.sag * Math.sin(Math.PI * u), w = q.wob * Math.sin(tt * 5 + u * 10) * Math.sin(Math.PI * u); return [lerp(A[0], B[0], u), lerp(A[1], B[1], u) - s + w * .5, lerp(A[2], B[2], u) + w]; };
  const vert = (j, e, R) => {   // R: right-half mapping (j in H..N), else left (j in 0..H)
    if (!R) { const uL = (j / H) * .5, p = base(uL * (1 - .92 * e)), tip = (uL / .5) * (uL / .5); return [p[0], p[1] - e * 1.3 * tip, p[2] + e * .6 * tip]; }
    const uR = .5 + ((j - H) / H) * .5, p = base(1 - (1 - uR) * (1 - .92 * e)), tip = ((1 - uR) / .5) * ((1 - uR) / .5); return [p[0], p[1] - e * 1.3 * tip, p[2] - e * .6 * tip];
  };
  const T = { g, set(a, b, p, t) {
      A = a; B = b; tt = t; q = Object.assign({ br: 1, thin: 1, snap: 0, dot: 0, flick: 0, sag: .5, vis: 1, wob: .04 }, p || {});
      const k = clamp(q.snap, 0, 1), e = ease.out(k), vis = q.vis * (k >= .999 ? 0 : 1);
      const op = (.32 + .68 * clamp(q.br, 0, 1)) * (1 - q.flick * (Math.sin(t * 23) > 0 ? .7 : 0)) * (1 - sm(k, .5, 1)) * (.88 + .12 * Math.sin(t * 7)) * vis;
      mC.opacity = clamp(op, 0, 1); mA.opacity = clamp(op * .26, 0, 1); g.visible = op > .01;
      if (!g.visible) return;
      const r = .05 * (.22 + .78 * clamp(q.thin, 0, 1));
      for (let i = 0; i < N; i++) {
        const R = i >= H, c = cs[i], a2 = as[i], a0 = vert(i, e, R), b0 = vert(i + 1, e, R);
        d.set(b0[0] - a0[0], b0[1] - a0[1], b0[2] - a0[2]); const L = d.length(); if (L < 1e-5) { c.visible = a2.visible = false; continue; }
        const lsc = (i % 2 ? 1 - q.dot : 1 - .5 * q.dot); d.normalize(); c.quaternion.setFromUnitVectors(up, d); a2.quaternion.copy(c.quaternion);
        const m = [a0[0] + (b0[0] - a0[0]) / 2, a0[1] + (b0[1] - a0[1]) / 2, a0[2] + (b0[2] - a0[2]) / 2], Ls = Math.max(L * lsc, 1e-4);
        c.position.set(m[0], m[1], m[2]); a2.position.set(m[0], m[1], m[2]); c.scale.set(r, Ls, r); a2.scale.set(r * 3.2, Ls, r * 3.2); c.visible = a2.visible = lsc > .02;
      }
    },
    at(u) { return base(clamp(u, 0, 1)); } };
  return T;
}

// ---------------- OWNERLESS halo ring ----------------
export function halo(Wd, R) {
  R = R || 1.1; const g = new THREE.Group(); Wd.add(g); const mats = [];
  const mk = (op) => { const m = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide }); mats.push([m, op]); return m; };
  const rings = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(R, .07, 8, 48), mk(.9)); m.rotation.x = Math.PI / 2; m.renderOrder = 4; g.add(m); rings.push(m); }
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R * .95, 40), mk(.2)); disc.rotation.x = -Math.PI / 2; disc.renderOrder = 3; g.add(disc);
  return { g, set(a, t, pos) { a = clamp(a, 0, 1); g.visible = a > .01; if (!g.visible) return; if (pos) g.position.set(pos[0], (pos[1] || 0) + .08, pos[2]);
      rings.forEach((m, i) => { const u = fr(t * .7 + i / 3); m.scale.setScalar(.7 + .75 * u); m.material.opacity = .85 * a * (1 - u) * (i === 0 ? 1 : .8); });
      disc.material.opacity = .22 * a * (.75 + .25 * Math.sin(t * 4)); } };
}

// ---------------- FINDER: woven basket ----------------
export function fbasket(Wd, s) {
  s = s || 1.3; const g = new THREE.Group(); g.scale.setScalar(s); Wd.add(g);
  g.add(mesh(new THREE.CylinderGeometry(.95, .72, .8, 28, 1, true), toon(K.basket, { side: THREE.DoubleSide }), { pos: [0, .4, 0], inkW: .02, inkColor: 0x6A4A18 }));
  g.add(cyl(.7, .7, .04, 0x8A6A3A, { pos: [0, .1, 0], ink: false }));
  [.14, .42, .68].forEach(y => g.add(mesh(new THREE.TorusGeometry(.72 + (y / .8) * .23 + .01, .045, 8, 36), toon(0xAD8440), { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], ink: false })));
  g.add(mesh(new THREE.TorusGeometry(.95, .07, 8, 36), toon(0xB08940), { pos: [0, .8, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  g.add(mesh(new THREE.TorusGeometry(.95, .07, 8, 36, Math.PI), toon(0xB08940), { pos: [0, .8, 0], inkW: .01, inkColor: 0x6A4A18 }));
  return { g, s, rim() { return [g.position.x, g.position.y + .8 * s, g.position.z]; }, inside() { return [g.position.x, g.position.y + .22 * s, g.position.z]; } };
}

// ---------------- ANNOUNCE: brass horn on a post, gold rings ----------------
export function horn(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(cyl(.55, .65, .18, PAL.stone, { pos: [0, .09, 0], inkW: .015, inkColor: INK })); g.add(cyl(.1, .14, 2.4, K.wood, { pos: [0, 1.3, 0], inkW: .015, inkColor: WINK }));
  const hg = new THREE.Group(); hg.position.set(0, 2.6, 0); g.add(hg);
  hg.add(cyl(.62, .14, 1.5, K.brass, { rot: [0, 0, -Math.PI / 2], pos: [.75, 0, 0], inkW: .02, inkColor: 0x6A4A10 }));
  hg.add(mesh(new THREE.TorusGeometry(.62, .06, 8, 28), toon(0xE0B050), { pos: [1.5, 0, 0], rot: [0, Math.PI / 2, 0], ink: false })); hg.add(ball(.16, K.brass, { pos: [-.1, 0, 0], ink: false }));
  const fx = new THREE.Group(); fx.position.set(1.6, 0, 0); hg.add(fx); const rings = [];
  for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(.6, .045, 8, 40), new THREE.MeshBasicMaterial({ color: 0xFFD04A, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); m.rotation.y = Math.PI / 2; m.visible = false; fx.add(m); rings.push(m); }
  return { g, hg, ringFx(a, t) { a = clamp(a, 0, 1); rings.forEach((m, i) => { const u = fr(t * .8 + i / 3); m.position.x = .1 + 3.2 * u; m.scale.setScalar(.5 + 1.5 * u); m.material.opacity = .95 * a * (1 - u); m.visible = a > .02; }); hg.rotation.z = .03 * a * Math.sin(t * 14); },
    mouth() { const v = new V3(1.7, 0, 0); hg.localToWorld(v); return v.toArray(); } };
}

// ---------------- RIVER: moving water plane ----------------
export function river(Wd, len, w) {
  const tex = canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = '#6CC0F2'; c.fillRect(0, 0, W, Hh); const r = rng(5);
    for (let i = 0; i < 26; i++) { c.fillStyle = r() < .5 ? 'rgba(215,240,255,.95)' : 'rgba(255,255,255,.8)'; const x = r() * (W - 80) + 20, y = r() * Hh, l = 30 + r() * 60; c.beginPath(); c.ellipse(x + l / 2, y, l / 2, 4 + r() * 3, 0, 0, 7); c.fill(); } },
    [Math.max(1, len / 10), Math.max(1, w / 6)]);
  const g = new THREE.Group(); Wd.add(g);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(len, w), new THREE.MeshBasicMaterial({ map: tex, fog: false })); top.rotation.x = -Math.PI / 2; top.position.y = .42; g.add(top);
  g.add(box(len, .45, w, 0x3A86BD, { pos: [0, .2, 0], ink: false, cast: false }));
  return { g, top, level(k, t) { k = clamp(k, 0, 1); g.scale.set(1, 1 + .55 * k, 1 + .3 * k); tex.offset.x = -t * .1; } };
}

// ---------------- COINS, POUCH ----------------
export function coin(Wd) {
  const g = new THREE.Group(), tg = new THREE.Group(), rg = new THREE.Group(); Wd.add(g); g.add(tg); tg.add(rg);
  rg.add(cyl(.34, .34, .07, K.gold, { pos: [0, 0, 0], inkW: .012, inkColor: 0x7A5A10 }));
  rg.add(mesh(new THREE.TorusGeometry(.34, .03, 6, 24), toon(0xB8871B), { pos: [0, .035, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  rg.add(box(.38, .02, .07, 0xB8871B, { pos: [0, .042, 0], ink: false }));
  return { g, rg, set(pos, up, roll, s) { g.position.set(pos[0], pos[1] + .035 + .3 * up * (s === undefined ? 1 : s), pos[2]); tg.rotation.x = Math.PI / 2 * up; rg.rotation.y = roll; sc1(g, s === undefined ? 1 : s); g.visible = (s === undefined ? 1 : s) > .01; } };
}
export function pouch(parent) {
  const g = new THREE.Group(); parent.add(g);
  const body = ball(.38, K.pouch, { pos: [0, -.58, 0], inkW: .015, inkColor: 0x3A2A5A }); body.scale.set(1, 1.1, .9); g.add(body);
  g.add(cyl(.1, .18, .22, K.pouch, { pos: [0, -.2, 0], ink: false })); g.add(mesh(new THREE.TorusGeometry(.14, .035, 6, 14), toon(K.gold), { pos: [0, -.26, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  g.add(mesh(new THREE.TorusGeometry(.12, .02, 6, 14, Math.PI), toon(0xA88A5A), { pos: [0, -.02, 0], ink: false }));
  return { g, shake(k, t) { k = clamp(k, 0, 1); g.rotation.z = .5 * k * Math.sin(t * 26) * (1 - .0); g.rotation.x = .2 * k * Math.sin(t * 19 + 1); body.scale.set(1 + .06 * k * Math.sin(t * 40), 1.1 - .06 * k * Math.sin(t * 40), .9); } };
}

// ---------------- SACK + GRAIN + FOUR-CUBIT SQUARE ----------------
export function sack(Wd) {
  const g = new THREE.Group(); Wd.add(g); const piv = new THREE.Group(); g.add(piv);
  const body = ball(.78, 0xC9A978, { pos: [0, .8, 0], inkW: .02, inkColor: 0x6A4A18 }); body.scale.set(1, 1.1, .85); piv.add(body);
  piv.add(cyl(.28, .46, .4, 0xC9A978, { pos: [0, 1.62, 0], inkW: .015, inkColor: 0x6A4A18 })); piv.add(mesh(new THREE.TorusGeometry(.3, .05, 6, 16), toon(0x8A6A3A), { pos: [0, 1.5, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  const dark = new THREE.Mesh(new THREE.CircleGeometry(.26, 16), new THREE.MeshBasicMaterial({ color: 0x4A3820 })); dark.rotation.x = -Math.PI / 2; dark.position.y = 1.83; piv.add(dark);
  return { g, piv, mouth() { const v = new V3(0, 1.85, 0); piv.localToWorld(v); return v.toArray(); }, tilt(a) { piv.rotation.z = a; piv.position.x = -Math.sin(a) * .0; g.updateMatrixWorld(true); } };
}
export function grain(Wd, n, seed) {
  const r = rng(seed || 3), im = new THREE.InstancedMesh(new THREE.SphereGeometry(.1, 10, 8), toon(K.grain), n); im.castShadow = false; im.frustumCulled = false; Wd.add(im);
  const L = []; for (let i = 0; i < n; i++) L.push({ x: 0, z: 0, ts: 0, r1: r(), r2: r(), r3: r() });
  const dm = new THREE.Object3D();
  return { im, L, setup(cx, cz, half, ts0, ts1) { L.forEach((q, i) => { q.x = cx + (q.r1 * 2 - 1) * half * .94; q.z = cz + (q.r2 * 2 - 1) * half * .94; q.ts = lerp(ts0, ts1, i / (n - 1)) + q.r3 * .15; }); },
    set(t, mouthAt, glowK) { L.forEach((q, i) => { const u = clamp((t - q.ts) / .9, 0, 1), m = mouthAt(q.ts);
        const x = lerp(m[0], q.x, ease.out(u)), z = lerp(m[2], q.z, u), y = lerp(m[1], .12, u * u) + 1.6 * Math.sin(Math.PI * u) * (1 - u * .3);
        dm.position.set(x, y, z); dm.scale.setScalar(u > 0 ? (1 + .5 * (glowK || 0) * Math.sin(t * 5 + i)) : 1e-4); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); }); im.instanceMatrix.needsUpdate = true; } };
}
export function square4(Wd, cx, cz, half) {
  const g = new THREE.Group(); Wd.add(g); const pg = [];
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { const p = box(.26, 1.0, .26, K.wood, { pos: [cx + a * half, .5, cz + b * half], inkW: .015, inkColor: WINK }); g.add(p); pg.push(p); });
  const rope = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0); const c = cyl(.035, .035, L, 0xE6D2A0, { ink: false, cast: false, pos: [(x0 + x1) / 2, .62, (z0 + z1) / 2], rot: [Math.PI / 2, 0, Math.atan2(x1 - x0, z1 - z0) * 0 ] }); c.rotation.set(Math.PI / 2, 0, 0); c.rotation.order = 'YXZ'; c.rotation.y = Math.atan2(x1 - x0, z1 - z0); c.rotation.x = Math.PI / 2; g.add(c); };
  rope(cx - half, cz - half, cx + half, cz - half); rope(cx + half, cz - half, cx + half, cz + half); rope(cx + half, cz + half, cx - half, cz + half); rope(cx - half, cz + half, cx - half, cz - half);
  const four = numberTag(Wd, '4', [cx, 2.6, cz + half], 1.3);
  return { g, four, set(k, t) { g.visible = k > .01; sc1(g, k); g.scale.set(Math.max(k, 1e-4), Math.max(k, 1e-4), Math.max(k, 1e-4)); pop(four, k); four.position.y = 2.6 + .1 * Math.sin(t * 1.6); } };
}

// ---------------- FIELD, GLEANINGS ----------------
export function field(Wd, x0, x1, z0, z1, seed) {
  const r = rng(seed || 4), pts = []; for (let x = x0; x <= x1; x += .75) for (let z = z0; z <= z1; z += .8) pts.push([x + (r() - .5) * .4, z + (r() - .5) * .35, r() * 6.28]);
  const n = pts.length, st = new THREE.InstancedMesh(new THREE.CylinderGeometry(.025, .035, 1.4, 5), toon(K.field), n), hd = new THREE.InstancedMesh(new THREE.SphereGeometry(.1, 8, 6), toon(0xD4A62F), n);
  st.castShadow = hd.castShadow = false; st.frustumCulled = hd.frustumCulled = false; Wd.add(st, hd);
  Wd.add(box(x1 - x0 + 3, .12, z1 - z0 + 3, K.soil, { pos: [(x0 + x1) / 2, .02, (z0 + z1) / 2], ink: false, cast: false }));
  const dm = new THREE.Object3D(), dh = new THREE.Object3D();
  return { n, set(t) { pts.forEach((p, i) => { const sw = .06 * Math.sin(t * 1.3 + p[0] * .7 + p[2]); dm.position.set(p[0], .75, p[1]); dm.rotation.set(0, 0, sw); dm.updateMatrix(); st.setMatrixAt(i, dm.matrix);
        dh.position.set(p[0] + Math.sin(sw) * -.7, 1.5, p[1]); dh.scale.set(1, 2.4, 1); dh.rotation.set(0, 0, sw); dh.updateMatrix(); hd.setMatrixAt(i, dh.matrix); }); st.instanceMatrix.needsUpdate = hd.instanceMatrix.needsUpdate = true; } };
}
export function bundle(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  [[0, 0, .05], [.05, .09, -.1], [-.04, -.1, .12]].forEach(([a, z, rt], i) => { const s = cyl(.03, .03, 1.2, K.field, { rot: [0, 0, Math.PI / 2 + rt], pos: [a, .1 + .02 * i, z], ink: false }); g.add(s); g.add(ball(.09, 0xD4A62F, { pos: [.62, .1 + .02 * i + rt * .6, z], ink: false })); });
  g.add(mesh(new THREE.TorusGeometry(.09, .025, 6, 14), toon(0x8A6A3A), { pos: [0, .12, 0], rot: [0, Math.PI / 2, 0], ink: false }));
  return { g };
}

// ---------------- SHEAF with teal knot, FOOTPRINTS ----------------
export function sheaf(Wd) {
  const g = new THREE.Group(); Wd.add(g); const r = rng(8), q = new THREE.Group(); g.add(q);
  for (let i = 0; i < 11; i++) { const a = i / 11 * 6.28, tl = .14; const s = cyl(.04, .05, 1.5, K.field, { pos: [Math.cos(a) * .12, .78, Math.sin(a) * .12], rot: [Math.sin(a) * tl, 0, -Math.cos(a) * tl], ink: false }); q.add(s);
    q.add(ball(.09, 0xD4A62F, { pos: [Math.cos(a) * (.12 + .2), 1.55, Math.sin(a) * (.12 + .2)], ink: false })); }
  q.add(mesh(new THREE.TorusGeometry(.25, .05, 8, 20), toon(0x8A6A3A), { pos: [0, .75, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  const knot = ball(.13, K.teal, { pos: [0, .75, .27], inkW: .012, inkColor: 0x14504C }); q.add(knot);
  const cT = new THREE.Color(K.teal), cD = new THREE.Color(0x35504E);
  return { g, knot, trample(k) { k = clamp(k, 0, 1); q.scale.set(1 + .45 * k, 1 - .72 * k, 1 + .3 * k); knot.material.color.copy(cT).lerp(cD, k); knot.scale.setScalar(1 - .45 * k); } };
}
export function fprint(Wd) {
  const m = mesh(new THREE.CylinderGeometry(.42, .42, .06, 20), toon(0x5A4E40), { ink: false, cast: false }); m.scale.set(.62, 1, 1); m.visible = false; Wd.add(m);
  return { m, set(x, z, k, ry) { m.visible = k > .01; m.position.set(x, .08 + (1 - ease.in(clamp(k, 0, 1))) * 2.4, z); m.rotation.y = ry || 0; m.material.opacity = 1; } };
}

// ---------------- UNIT: house + crate + thread + halo + basket + checks (declarative draw(S,t)) ----------------
export function unit(Wd, o) {
  o = o || {};
  const hs = o.house || house(Wd, o.hs || 1); if (!o.house) hs.place(o.hx === undefined ? -7.5 : o.hx, o.hz === undefined ? -1.5 : o.hz, o.hry === undefined ? .45 : o.hry);
  const c = crate(Wd, { tag: !!o.tag }), th = thread(Wd), ha = halo(Wd, (o.hr || 1.1) * (o.cs || 1));
  const bk = o.noBasket ? null : (o.basket || fbasket(Wd, o.bs || 1.3)); if (bk && !o.basket) bk.g.position.set(o.bx === undefined ? 7.5 : o.bx, 0, o.bz === undefined ? 1.7 : o.bz);
  const ckH = checkMark(o.ck || 1.4), ckB = checkMark(o.ck || 1.4); Wd.add(ckH.g); Wd.add(ckB.g);
  const D = { lit: 1, cp: [o.cx === undefined ? 0 : o.cx, .06, o.cz === undefined ? 1.6 : o.cz], cs: 1, cry: 0, br: 1, thin: 1, snap: 0, dot: 0, flick: 0, sag: .5, halo: 0, ckH: 0, ckB: 0, tagG: 0, b: null, thr: 1 };
  const U = { h: hs, c, th, ha, bk, ckH, ckB,
    home() { return [hs.dp[0] + .9, .06, hs.dp[2] + .6]; },
    draw(t, S) { S = Object.assign({}, D, S); hs.lit(S.lit);
      c.g.position.set(S.cp[0], S.cp[1], S.cp[2]); sc1(c.g, S.cs); c.g.rotation.y = S.cry; c.g.visible = S.cs > .01;
      const b = S.b || [S.cp[0], S.cp[1] + .92 * S.cs, S.cp[2]];
      th.set(hs.wp, b, { br: S.br, thin: S.thin, snap: S.snap, dot: S.dot, flick: S.flick, sag: S.sag, vis: S.thr }, t);
      ha.set(S.halo, t, S.hp || S.cp); if (c.tag) c.tag.glowK(S.tagG);
      ckH.set(S.ckH); ckH.g.position.set(hs.top[0], hs.top[1] + 1.2 + .06 * Math.sin(t * 1.8), hs.top[2] + .5);
      if (bk) { ckB.set(S.ckB); const r = bk.rim(); ckB.g.position.set(r[0], r[1] + 1.9 + .06 * Math.sin(t * 1.8), r[2] + .3); } else ckB.set(0); } };
  return U;
}

// camera helper
export const CAM = (p0, l0, p1, l1, dur, fov) => t => { const u = ease.io(prog(t, 0, dur)); return { pos: lp3(p0, p1, u), look: lp3(l0, l1, u), fov: fov || 44 }; };
