// objects_c9.js - builder-owned set pieces for chapter c9 (the moon, the 1080 parts, the 19-year cycle, the week ring) and reused by c10.
// Zero Hebrew, no people, Latin digits only where the picture explicitly shows a number. Pure functions of the time passed in.
import { THREE, box, cyl, ball, mesh, toon, canvasTex, rng, ease, prog, clamp, lerp } from '../../../lib/stage3d.js';
import * as O from './objects.js';
import * as P from './objects_c8.js';
const { TAU, D2R, V3 } = P;

// ================================================================== 1080 tiles (instanced), tween between layouts
export function tileField(Wd, o) {
  o = o || {}; const n = 1080, s = o.s || .13, r = rng(o.seed || 5), cache = {};
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon(0xffffff), n); im.frustumCulled = false; im.castShadow = false; im.receiveShadow = false; Wd.add(im);
  const dl = new Float32Array(n), lift = new Float32Array(n); for (let i = 0; i < n; i++) { dl[i] = r(); lift[i] = .3 + r() * 1.2; }
  const pal = [0xffc84a, 0xff8a4a, 0x4ac8ff, 0x8aff7a, 0xc07aff, 0xff6a9a, 0x4aa0ff, 0xffe08a].map(c => new THREE.Color(c));
  const mk = (name, fn, sc) => { if (cache[name]) return cache[name]; const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const p = fn(i); pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2]; const c = p[3]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    return (cache[name] = { pos, col, sc: sc || 1 }); };
  const gold = new THREE.Color(0xffc84a), dark = new THREE.Color(0xc07a1a);
  const L = {
    bar: () => mk('bar', i => { const c = i % 90, rw = Math.floor(i / 90); return [(c - 44.5) * s, (rw - 5.5) * s, 0, gold.clone().lerp(dark, .35 * ((c * 7 + rw * 3) % 5) / 4)]; }),
    scatter: seed => mk('sc' + seed, (() => { const q = rng(seed || 3); return i => { const th = q() * TAU, ph = Math.acos(2 * q() - 1), rr = 3 + q() * 4.2; return [Math.sin(ph) * Math.cos(th) * rr * 1.5, Math.cos(ph) * rr * .8, Math.sin(ph) * Math.sin(th) * rr * .7 - 1, pal[Math.floor(q() * 8)]]; }; })()),
    grid: cols => { const rows = Math.ceil(n / cols), pitch = s * 1.12, sc = Math.min(2.2, 14 / (cols * pitch), 7.2 / (rows * pitch)); return mk('g' + cols, i => { const c = i % cols, rw = Math.floor(i / cols); return [(c - (cols - 1) / 2) * pitch * sc, ((rows - 1) / 2 - rw) * pitch * sc, 0, gold.clone().lerp(pal[1], (c / cols) * .5)]; }, sc); },
    blocks: g => { const gs = n / g; let bw = 1, best = 1e9; for (let d = 1; d <= gs; d++) if (gs % d === 0) { const e = Math.abs(d - Math.sqrt(gs * 1.3)); if (e < best) { best = e; bw = d; } } const bh = gs / bw;
      const gc = Math.ceil(Math.sqrt(g * 1.78)), gr = Math.ceil(g / gc), pitch = s * 1.12, bW = bw * pitch, bH = bh * pitch, gap = pitch * 1.8, TW = gc * bW + (gc - 1) * gap, TH = gr * bH + (gr - 1) * gap, sc = Math.min(1.8, 14.5 / TW, 7.4 / TH);
      return mk('b' + g, i => { const j = Math.floor(i / gs), k = i % gs, c = j % gc, rw = Math.floor(j / gc); return [(-TW / 2 + c * (bW + gap) + (k % bw) * pitch) * sc, (TH / 2 - rw * (bH + gap) - Math.floor(k / bw) * pitch) * sc, 0, pal[j % 8]]; }, sc); } };
  const dum = new THREE.Object3D(), tc = new THREE.Color(); im.setColorAt(0, tc.set(0xffffff));
  const api = { im, L, n,
    set(A, B, k, o2) { o2 = o2 || {}; const stag = o2.stag === undefined ? .8 : o2.stag, lf = o2.lift || 0, kk = clamp(k, 0, 1);
      for (let i = 0; i < n; i++) { const e = ease.io(clamp(kk * (1 + stag) - dl[i] * stag, 0, 1)), i3 = i * 3;
        let x = lerp(A.pos[i3], B.pos[i3], e), y = lerp(A.pos[i3 + 1], B.pos[i3 + 1], e) + Math.sin(Math.PI * e) * lift[i] * lf, z = lerp(A.pos[i3 + 2], B.pos[i3 + 2], e);
        let cr = lerp(A.col[i3], B.col[i3], e), cg = lerp(A.col[i3 + 1], B.col[i3 + 1], e), cb = lerp(A.col[i3 + 2], B.col[i3 + 2], e);
        if (o2.litN !== undefined) { const m = i < o2.litN ? 1.2 : (o2.dim === undefined ? .3 : o2.dim); cr *= m; cg *= m; cb *= m; }
        if (o2.flash) { const w = Math.exp(-Math.pow((i / n - o2.flash.pos) / o2.flash.w, 2)) * o2.flash.k; cr = lerp(cr, 1.6, w); cg = lerp(cg, 1.5, w); cb = lerp(cb, 1.2, w); }
        if (o2.pulse) { const w = .5 + .5 * Math.sin(o2.pulse * 6 + i * .03); cr *= .8 + .4 * w; cg *= .8 + .4 * w; }
        dum.position.set(x, y, z); dum.scale.setScalar(lerp(A.sc, B.sc, e) * s * (o2.size || .88)); dum.updateMatrix(); im.setMatrixAt(i, dum.matrix); tc.setRGB(cr, cg, cb); im.setColorAt(i, tc); }
      im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; } };
  return api;
}

// ================================================================== Earth + Moon + phase strip
export function moonSystem(Wd, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g);
  const earth = P.litSphere(1.5, P.earthTex(), { dark: .12 }); earth.userData.u.L.value.set(-1, 0, 0); earth.rotation.y = 1.6; g.add(earth);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1.52, 40, 20), new THREE.MeshBasicMaterial({ color: 0x0c1428, side: THREE.BackSide, fog: false })));
  const sun = P.sunBall(2.2, 20); sun.position.set(-34, 0, 0); g.add(sun);
  const RO = o.R || 5.2, moon = P.moonBall(.45); moon.userData.u.L.value.set(-1, 0, 0); g.add(moon); const mg = O.glow(2.4, 0xbfd0ff, .35); moon.add(mg);
  const beads = []; for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, m = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 5), O.basic(0x6a7aa8)); m.position.set(-Math.cos(a) * RO, 0, Math.sin(a) * RO); g.add(m); beads.push(m); }
  const posOf = al => V3(-Math.cos(al) * RO, 0, Math.sin(al) * RO);
  // phase strip: 8 icons in the camera frame (camera looks along -z), light dir (sin a, 0, -cos a): waxing = lit on the right
  const strip = new THREE.Group(); strip.position.set(0, -.9, 7.6); g.add(strip); const icons = [];
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8, m = P.moonBall(.4); m.userData.u.L.value.set(Math.sin(a), 0, -Math.cos(a)); m.position.set((i - 3.5) * 1.5, 0, 0); strip.add(m); const hl = O.glow(1.9, 0xffd36a, 0); hl.position.copy(m.position); strip.add(hl); icons.push({ m, hl, a }); }
  const api = { g, earth, moon, icons, strip, posOf, RO, sun,
    update(al, lit) { moon.position.copy(posOf(al)); moon.rotation.y = -al; beads.forEach((b, i) => { const a = i / 72 * TAU, d = ((al - a) % TAU + TAU) % TAU; b.material.color.setHex(d < 1.5 ? 0xffe9a0 : 0x6a7aa8); }); const cur = Math.round((((al % TAU) + TAU) % TAU) / (TAU / 8)) % 8;
      icons.forEach((ic, i) => { const on = lit ? (i === cur ? 1 : 0.0) : 0; ic.hl.material.opacity = on * .9; const sc = 1 + .18 * on; ic.m.scale.setScalar(sc); }); } };
  return api;
}

// ================================================================== calendar wheel assembling itself
export function calendarWheel() {
  const g = new THREE.Group(), tiles = [], R0 = 2.7, R1 = 3.9, r = rng(21);
  const cols = [0xffc84a, 0xff9a4a, 0xffd86a, 0xff8a5a, 0xe8b84a, 0xffa860, 0xffc84a, 0xff9a4a, 0xffd86a, 0xff8a5a, 0xe8b84a, 0xffa860];
  for (let i = 0; i < 12; i++) { const a1 = Math.PI / 2 - i * TAU / 12, a0 = a1 - TAU / 12 + .06, m = mesh(P.sector(R0, R1 + (i % 2) * .12, a0, a1, .5), toon(cols[i], { emissive: 0x3a2204 }), { inkW: .025 }); const h = new THREE.Group(); h.add(m); g.add(h);
    const th = r() * TAU, d = 9 + r() * 5; tiles.push({ h, from: [Math.cos(th) * d, Math.sin(th) * d * .7, 4 + r() * 6], rot: (r() - .5) * 5 }); }
  const gear = new THREE.Group(); gear.add(cyl(1.4, 1.4, .36, 0xb8892a, { rot: [Math.PI / 2, 0, 0], inkW: .03 })); for (let i = 0; i < 16; i++) { const a = i * TAU / 16; gear.add(box(.34, .42, .34, 0xb8892a, { pos: [Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0], rot: [0, 0, a], inkW: .02 })); } gear.position.z = .12; g.add(gear);
  gear.add(cyl(.5, .5, .5, 0xffe08a, { rot: [Math.PI / 2, 0, 0], inkW: .02 }));
  const sun = P.sunBall(.55, 3.2); sun.position.set(0, 0, .8); g.add(sun);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 14), O.basic(0xe6e8f8)); g.add(moon);
  const ringBeads = []; for (let i = 0; i < 30; i++) { const a = Math.PI / 2 - i * TAU / 30, m = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), O.basic(0x6a5a30)); m.position.set(Math.cos(a) * 2.2, Math.sin(a) * 2.2, .25); g.add(m); ringBeads.push(m); }
  g.userData.update = (t, t0, per) => { tiles.forEach((tl, i) => { const k = ease.out(prog(t, t0 + i * per, t0 + i * per + .9)), f = tl.from; tl.h.position.set(f[0] * (1 - k), f[1] * (1 - k), f[2] * (1 - k)); tl.h.rotation.z = tl.rot * (1 - k); tl.h.scale.setScalar(.2 + .8 * k); });
    const kg = ease.out(prog(t, t0 + 12 * per - .4, t0 + 12 * per + 1)); gear.scale.setScalar(.001 + kg); gear.rotation.z = -(t - t0) * .5; sun.scale.setScalar(.001 + kg);
    const am = (t - t0) * 1.7; moon.position.set(Math.cos(am) * 2.2, Math.sin(am) * 2.2, .5); moon.scale.setScalar(.001 + kg);
    ringBeads.forEach((b, i) => { const on = prog(t, t0 + 12 * per + .4 + i * .05, t0 + 12 * per + .6 + i * .05); b.material.color.setHex(on > .5 ? 0xffd86a : 0x6a5a30); b.scale.setScalar(1 + .6 * on); }); };
  return g;
}

// ================================================================== ring of 19 year-tiles, 7 of them glow and carry an extra month tile
export const LEAP = [2, 5, 7, 10, 13, 16, 18];
export function ring19() {
  const g = new THREE.Group(), tiles = [], RR = 4.2, cnt = P.counter(1.9, .95, {});
  cnt.position.set(0, .15, .3); g.add(cnt); const sev = P.counter(1.1, .62, { fg: '#ffe9a0' }); sev.position.set(0, -1.15, .3); g.add(sev); sev.scale.setScalar(.0001);
  for (let i = 0; i < 19; i++) { const a = Math.PI / 2 - i * TAU / 19, h = new THREE.Group(); h.position.set(Math.cos(a) * RR, Math.sin(a) * RR, 0); h.rotation.z = a - Math.PI / 2;
    const leap = LEAP.includes(i), t = cyl(.5, .5, .2, 0x4a68d0, { rot: [Math.PI / 2, 0, 0], inkW: .025 }); t.material.emissive = new THREE.Color(0x0a1230); h.add(t);
    const ex = box(.62, .26, .16, 0xffc84a, { pos: [0, .75, 0], inkW: .02 }); ex.material.emissive = new THREE.Color(0x5a3c06); ex.visible = leap; h.add(ex);
    const gl = O.glow(2.6, 0xffd070, 0); gl.position.z = .25; h.add(gl); g.add(h); tiles.push({ h, t, ex, gl, leap }); }
  g.userData.update = (t, t0, per, tGlow) => { let shown = 0;
    tiles.forEach((tl, i) => { const s = P.popS(t, t0 + i * per, .4); shown += s > .5 ? 1 : 0; tl.h.scale.setScalar(s); });
    cnt.userData.set(Math.min(19, shown), t);
    let n7 = 0; tiles.forEach((tl, i) => { if (!tl.leap) return; const j = LEAP.indexOf(i), k = prog(t, tGlow + j * .35, tGlow + j * .35 + .6); if (k > .5) n7++; tl.gl.material.opacity = .85 * k;
      tl.t.material.color.setHex(0x4a68d0).lerp(new THREE.Color(0xffd680), k); tl.t.material.emissive.setRGB(.55 * k, .4 * k, .08 * k); tl.ex.scale.setScalar(.001 + P.popS(t, tGlow + j * .35 + .2, .5)); tl.h.position.z = .35 * k; });
    sev.scale.setScalar(n7 > 0 ? P.popS(t, tGlow, .5) : .0001); sev.userData.set(n7, t); };
  return g;
}

// ================================================================== week ring: seven day tiles, three get a gold seal
export function weekRing() {
  const g = new THREE.Group(), RR = 3.4, tiles = [], SEAL = [0, 3, 5];
  for (let i = 0; i < 7; i++) { const a = Math.PI / 2 - i * TAU / 7, h = new THREE.Group(); h.position.set(Math.cos(a) * RR, Math.sin(a) * RR, 0); h.rotation.z = a - Math.PI / 2;
    const t = box(1.35, .8, .2, 0xf3e6c8, { inkW: .025 }); h.add(t);
    for (let k = 0; k <= i; k++) { const row = k < 4 ? 0 : 1, col = row ? k - 4 : k, nn = row ? i - 3 : Math.min(4, i + 1); h.add(ball(.075, 0x3a2812, { pos: [(col - (nn - 1) / 2) * .26, row ? -.18 : .12, .12], ink: false })); }
    const seal = new THREE.Group(); seal.position.set(0, 0, .22); seal.add(cyl(.46, .46, .08, 0xd8a21f, { rot: [Math.PI / 2, 0, 0], inkW: .02 })); seal.add(mesh(new THREE.TorusGeometry(.32, .04, 8, 28), toon(0xffe08a), { pos: [0, 0, .06], ink: false })); seal.add(ball(.14, 0xc0392b, { pos: [0, 0, .09], inkW: .01 }));
    seal.add(box(.2, .5, .04, 0xc0392b, { pos: [-.22, -.5, -.02], rot: [0, 0, .25], ink: false })); seal.add(box(.2, .5, .04, 0xa02a1e, { pos: [.22, -.5, -.02], rot: [0, 0, -.25], ink: false })); seal.visible = false; h.add(seal);
    const gl = O.glow(2.8, 0xffd070, 0); gl.position.z = .3; h.add(gl); g.add(h); tiles.push({ h, t, seal, gl, sealed: SEAL.includes(i), a }); }
  const mk = ball(.22, 0xffd36a, { inkW: .02 }); g.add(mk); const mgl = O.glow(1.6, 0xffd070, .8); mk.add(mgl);
  g.userData.update = (t, t0, per, tSeal, gap, tRun) => {
    tiles.forEach((tl, i) => { tl.h.scale.setScalar(P.popS(t, t0 + i * per, .4)); const j = SEAL.indexOf(tl.i === undefined ? i : i); if (tl.sealed) { const k = SEAL.indexOf(i), ts = tSeal + k * gap, s = P.popS(t, ts, .45); tl.seal.visible = t > ts; tl.seal.scale.setScalar(.001 + s * (t > ts ? 1 : 0)); tl.gl.material.opacity = .8 * Math.exp(-Math.pow((t - ts - .2) / .5, 2)) + (t > ts ? .15 : 0); tl.t.material.color.setHex(t > ts + .3 ? 0x6a5a3a : 0xf3e6c8); } });
    // the marker walks the ring and skips the sealed tiles (jumps over them with a hop)
    const open = [1, 2, 4, 6], seq = [], u = (t - tRun) * .9; let idx = Math.floor(u), f = u - idx;
    const order = [1, 2, 4, 6, 1, 2, 4, 6], cur = order[((idx % 8) + 8) % 8], nxt = order[(((idx + 1) % 8) + 8) % 8], A = tiles[cur].h.position, B = tiles[nxt].h.position;
    const hop = Math.sin(Math.PI * clamp(f, 0, 1)); mk.visible = t > tRun; mk.position.set(lerp(A.x, B.x, ease.io(f)) * 1.0, lerp(A.y, B.y, ease.io(f)) + hop * .5, .6 + hop * .4); };
  return g;
}

// ================================================================== a stone hall with hanging lamps (no people)
export function stoneHall(Wd, x0) {
  const g = new THREE.Group(); g.position.set(x0, 0, 0); Wd.add(g); const T = [O.stoneTex(3, '#d9c9a4'), O.stoneTex(5, '#cdb98f')], tint = 0xd4c8b0;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(16, 22), toon(0xffffff, { map: O.stoneTex(9, '#b8a888') })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, -4); fl.receiveShadow = true; g.add(fl);
  g.add(O.texBox(16, 6.5, .5, T[0], tint, { pos: [0, 3.25, -14.5], inkW: .03 })); [-1, 1].forEach(s => g.add(O.texBox(.5, 6.5, 22, T[1], tint, { pos: [s * 8, 3.25, -4], inkW: .03 })));
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(16, 22), toon(0xcbbf9f)); ce.rotation.x = Math.PI / 2; ce.position.set(0, 6.5, -4); g.add(ce);
  for (let i = 0; i < 4; i++) [-1, 1].forEach(s => { g.add(cyl(.5, .55, 6.5, 0xd8c9a8, { pos: [s * 4.2, 3.25, -1 - i * 3.6], inkW: .04 })); g.add(box(1.3, .35, 1.3, 0xc8b898, { pos: [s * 4.2, 6.3, -1 - i * 3.6], inkW: .03 })); g.add(box(1.3, .4, 1.3, 0xc8b898, { pos: [s * 4.2, .2, -1 - i * 3.6], inkW: .03 })); });
  const archShape = () => { const sh = new THREE.Shape(); sh.moveTo(-2.2, 0); sh.lineTo(2.2, 0); sh.lineTo(2.2, 5); sh.lineTo(-2.2, 5); sh.lineTo(-2.2, 0); const h = new THREE.Path(); h.moveTo(-1.5, 0); h.lineTo(1.5, 0); h.lineTo(1.5, 2.6); h.absarc(0, 2.6, 1.5, 0, Math.PI, false); h.lineTo(-1.5, 0); sh.holes.push(h); return sh; };
  const win = new THREE.Mesh(new THREE.PlaneGeometry(3, 4.1), O.basic(0x16204a)); win.position.set(0, 2.55, -14.2); g.add(win);
  g.add(mesh(new THREE.ExtrudeGeometry(archShape(), { depth: .6, bevelEnabled: false, curveSegments: 20 }), toon(0xcbbf9f), { pos: [0, 0, -14.4], inkW: .03 }));
  g.add(box(2.4, .12, 7.6, 0x6a4526, { pos: [0, .95, -4.5], inkW: .02 })); [-3, 3].forEach(z => [-1, 1].forEach(sx => g.add(box(.2, .9, .2, 0x5a3a1c, { pos: [sx * 1.0, .45, -4.5 + z], inkW: .015 }))));
  [-1, 1].forEach(s => { g.add(box(.6, .5, 7, 0x7a5232, { pos: [s * 1.9, .25, -4.5], inkW: .02 })); });
  const lamps = [], lc = [[-2.2, -2], [2.2, -2], [-2.2, -7], [2.2, -7], [0, -11], [0, 1.5]];
  lc.forEach(([x, z], i) => { const lp = new THREE.Group(); lp.position.set(x, 6.5, z); lp.add(cyl(.02, .02, 2.2, 0x3a2a1a, { pos: [0, -1.1, 0], ink: false })); const bowl = mesh(new THREE.SphereGeometry(.34, 18, 10, 0, TAU, Math.PI / 2, Math.PI / 2), toon(0xc99a35), { pos: [0, -2.3, 0], inkW: .02 }); lp.add(bowl);
    const fl2 = O.glow(1.7, 0xffb050, .95); fl2.position.y = -2.15; lp.add(fl2); const co = O.glow(.5, 0xfff2c0, 1); co.position.y = -2.1; lp.add(co); g.add(lp); lamps.push({ lp, fl2, i });
    const pl = new THREE.PointLight(0xffb868, 5, 12, 2); pl.position.set(x0 + x, 4.3, z); Wd.scene.add(pl); });
  const moonI = new THREE.Mesh(new THREE.SphereGeometry(.5, 20, 14), O.basic(0xf2eedc)); moonI.position.set(.8, 3.2, -14.1); g.add(moonI); const cut = new THREE.Mesh(new THREE.SphereGeometry(.46, 20, 14), O.basic(0x16204a)); cut.position.set(1.1, 3.28, -14.05); g.add(cut);
  const lg = O.glow(3, 0xaec4ff, .5); lg.position.set(.8, 3.2, -14); g.add(lg);
  g.userData.tick = t => lamps.forEach(l => { l.fl2.scale.setScalar(1.7 * (1 + .1 * Math.sin(t * 7 + l.i * 2) * Math.sin(t * 2.9 + l.i))); l.lp.rotation.z = Math.sin(t * .8 + l.i) * .012; });
  return g;
}
