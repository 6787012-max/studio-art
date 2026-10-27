// ps.js - shared module for the stef_35 film (disqualified consecrated animals). Pure functions of t. No Hebrew.
import { THREE, ink, world, box, cyl, ball, mesh, toon, label, canvasTex, ease, prog, clamp, lerp, rng } from '../../lib/stage3d.js';

export const PAL = { sky: 0xCFE6F2, stone: 0xE8D9B5, wood: 0x8A5A3B, trim: 0xE0B040, gold: 0xE8B830, blue: 0x3F7FD0, orange: 0xE08A3A, red: 0xC2453A, green: 0x4FA35A };
export const PY = 0.6;                     // top of the stone platform
const INK = 0x8C7650;
export const sm = (x, a, b) => { const u = clamp((x - a) / Math.max(b - a, 1e-6), 0, 1); return u * u * (3 - 2 * u); };
const fr = x => ((x % 1) + 1) % 1;
const C = h => new THREE.Color(h);
const GREYC = C(0x9A968A);

// ---------- world: soft sky, far hills, green floor, clouds ----------
export function mkWorld(o) {
  o = o || {};
  const Wd = world({ ground: null, skyTop: o.skyTop === undefined ? 0xCFE6F2 : o.skyTop, skyBottom: o.skyBottom === undefined ? 0xEAF4F8 : o.skyBottom, fogColor: o.fogColor === undefined ? 0xE3F0F4 : o.fogColor,
    fogNear: 40, fogFar: 120, hemi: o.hemi === undefined ? 1.5 : o.hemi, sun: o.sun === undefined ? 1.0 : o.sun, sunPos: [-6 + (o.sx || 0), 12, 8], shadowExt: o.ext || 12, hemiSky: 0xffffff, hemiGround: 0xcfe0b8, sunColor: o.sunColor || 0xFFF4E0 });
  const fl = new THREE.Mesh(new THREE.CircleGeometry(100, 64), new THREE.MeshLambertMaterial({ color: o.floor || 0x7DB86C })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; Wd.add(fl);
  const hc = o.hills || [0xB5D6B0, 0xA3CBA6, 0xC2DDB9, 0xA9D0B8]; const r = rng(77), cx = o.cx || 0;
  for (let i = 0; i < 9; i++) { const rad = 8 + r() * 7; const h = new THREE.Mesh(new THREE.SphereGeometry(rad, 24, 12), new THREE.MeshLambertMaterial({ color: hc[i % 4] })); h.position.set(cx - 48 + i * 12 + r() * 4, -rad * .55, -30 - r() * 12); h.scale.y = .62; Wd.add(h); }
  if (o.cx) for (let i = 0; i < 5; i++) { const rad = 8 + r() * 7; const h = new THREE.Mesh(new THREE.SphereGeometry(rad, 24, 12), new THREE.MeshLambertMaterial({ color: hc[i % 4] })); h.position.set(cx + 40 + i * 12 + r() * 4, -rad * .55, -30 - r() * 12); h.scale.y = .62; Wd.add(h); }
  const clouds = [];
  for (let i = 0; i < 5; i++) { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, fog: false })); b.position.set(k * 1.1 - 1.6, (k % 2) * .35, 0); b.scale.set(1.3 - (k % 2) * .25, .8, .8); g.add(b); }
    g.position.set(cx - 40 + i * 20, 15 + (i % 3) * 3, -48); g.userData.x0 = g.position.x; Wd.add(g); clouds.push(g); }
  Wd.on(t => clouds.forEach((g, i) => { g.position.x = g.userData.x0 + 1.2 * Math.sin(t * .05 + i); }));
  return Wd;
}

export function motes(Wd, n, seed, o) {
  o = o || {}; const r = rng(seed || 1), g = new THREE.Group(), arr = []; Wd.add(g); const geo = new THREE.SphereGeometry(1, 8, 6);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 3 ? 0xFFFFFF : 0xFFE9A0, transparent: true, opacity: .7, fog: false, depthWrite: false })); m.scale.setScalar(.03 + r() * .05); g.add(m);
    arr.push({ m, x: (o.cx || 0) + (r() - .5) * (o.w || 14), y0: r() * (o.h || 5), z: lerp(o.z0 === undefined ? -5 : o.z0, o.z1 === undefined ? 5 : o.z1, r()), sp: .05 + r() * .1, ph: r() * 6.28 });
  }
  const Hh = o.h || 5;
  Wd.on(t => arr.forEach(a => { const u = fr((a.y0 + t * a.sp) / Hh); a.m.position.set(a.x + .2 * Math.sin(t * .4 + a.ph), .3 + u * Hh, a.z); a.m.material.opacity = .7 * Math.sin(Math.PI * u); }));
  return g;
}

export function tufts(Wd, n, seed, area, o) {
  o = o || {}; const r = rng(seed || 3), arr = [], g = new THREE.Group(); Wd.add(g);
  const cols = o.cols || [0x6AA35A, 0x7FB86A, 0x8CC47A];
  for (let i = 0; i < n; i++) {
    const t0 = new THREE.Group(), sc = (o.s || 1) * (.7 + r() * .7); const col = cols[i % cols.length];
    for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.ConeGeometry(.05, o.h || .5, 5), toon(col)); b.position.set((k - 1) * .06, (o.h || .5) / 2, (k % 2) * .03); b.rotation.z = (k - 1) * .18; b.castShadow = false; t0.add(b); }
    t0.position.set(lerp(area.x0, area.x1, r()), area.y, lerp(area.z0, area.z1, r())); t0.scale.setScalar(sc); g.add(t0); arr.push({ g: t0, ph: r() * 6.28, sc });
  }
  return { g, sway(t, amp) { amp = amp === undefined ? 1 : amp; arr.forEach(a => { a.g.rotation.z = Math.sin(t * 1.3 + a.ph) * .12 * amp; a.g.rotation.x = Math.sin(t * 1.1 + a.ph * 1.7) * .06 * amp; }); } };
}

// ---------- flag on a pole ----------
export function flag(Wd, color, pos, h, sc) {
  sc = sc || 1; const g = new THREE.Group(); g.position.set(...pos); g.scale.setScalar(sc); Wd.add(g);
  const pole = cyl(.035, .035, h, 0xB09A74, { pos: [0, h / 2, 0], inkW: .008, inkColor: INK }); g.add(pole);
  g.add(ball(.06, 0xF2D98A, { pos: [0, h + .02, 0], ink: false }));
  const piv = new THREE.Group(); piv.position.set(0, h - .22, 0); g.add(piv); piv.add(box(.7, .4, .03, color, { pos: [.35, 0, 0], inkW: .01, inkColor: 0x1B3A6A }));
  return { g,
    pop(k) { g.scale.setScalar(Math.max(sc * ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; },
    wave(t, amp, ph) { amp = amp === undefined ? 1 : amp; piv.rotation.y = Math.sin(t * 3 + (ph || 0)) * .22 * amp; } };
}

// ---------- platform: stone slab, paving lines, low front step, corner blocks ----------
export function platform(Wd, o) {
  o = o || {}; const x0 = o.x0 === undefined ? -7 : o.x0, x1 = o.x1 === undefined ? 7 : o.x1, W = x1 - x0, cx = (x0 + x1) / 2, g = new THREE.Group(); Wd.add(g);
  g.add(box(W, PY, 8, PAL.stone, { pos: [cx, PY / 2, 0], inkW: .02, inkColor: INK }));
  g.add(box(W + .5, .3, 1.2, 0xDCCBA2, { pos: [cx, .15, 4.6], inkW: .015, inkColor: INK }));
  g.add(box(W, .06, .16, 0xF4EACB, { pos: [cx, PY + .03, 3.92], ink: false, cast: false }));
  for (let z = -3; z <= 3; z += 2) g.add(box(W - .3, .006, .03, 0xD3C196, { pos: [cx, PY + .004, z], ink: false, cast: false }));
  const tl = [0xD9C79C, 0xEFE2BF]; for (let x = x0 + 2; x < x1 - 1; x += 4) for (let z = -3; z <= 3; z += 2) if (((x - x0) / 4 + (z + 3) / 2) % 2 < 1) g.add(box(1.9, .006, 1.9, tl[0], { pos: [x, PY + .003, z], ink: false, cast: false }));
  [x0 + .7, x1 - .7].forEach((x, i) => { g.add(box(1.0, 1.1, 1.0, 0xDDCBA0, { pos: [x, PY + .55, 3.3], inkW: .02, inkColor: INK })); g.add(ball(.42, i ? 0x5BA655 : 0x4F9A4A, { pos: [x, PY + 1.35, 3.3], inkW: .02, inkColor: 0x2F6B33 })); });
  return { g, x0, x1, cx };
}

// ---------- gold gradient glow disc + ring (consecrated glow) ----------
let GTEX = null;
function glowTex() { if (GTEX) return GTEX; GTEX = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 62); r.addColorStop(0, 'rgba(255,224,120,.0)'); r.addColorStop(.55, 'rgba(255,214,90,.55)'); r.addColorStop(1, 'rgba(255,214,90,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); return GTEX; }
export function halo(Wd, R, sx) {
  const g = new THREE.Group(); Wd.add(g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 40), new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); disc.rotation.x = -Math.PI / 2; disc.position.y = .03; g.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R * .72, .045, 8, 56), new THREE.MeshBasicMaterial({ color: 0xF4C84A, transparent: true, fog: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = .06; g.add(ring);
  g.scale.set(sx || 1, 1, 1); let a = 0;
  const T = { g, disc, place(x, y, z) { g.position.set(x, y, z); }, set(k, t) { a = clamp(k, 0, 1); const pu = 1 + .06 * Math.sin((t || 0) * 3); disc.material.opacity = a * .9; ring.material.opacity = a; g.scale.set((sx || 1) * pu, 1, pu); g.visible = a > .01; } };
  T.set(0); return T;
}

// ---------- treasury chest ----------
export function chest(Wd, pos) {
  const g = new THREE.Group(); g.position.set(...pos); Wd.add(g);
  g.add(box(2.4, .9, 1.5, PAL.wood, { pos: [0, .45, 0], inkW: .02, inkColor: 0x4A2D18 }));
  [-1.0, 0, 1.0].forEach(x => g.add(box(.2, .94, 1.56, PAL.trim, { pos: [x, .47, 0], inkW: .01, inkColor: 0x7A5A10 })));
  g.add(box(2.44, .1, 1.54, PAL.trim, { pos: [0, .1, 0], inkW: .01, inkColor: 0x7A5A10 }));
  g.add(box(2.1, .02, 1.3, 0x4A2E1B, { pos: [0, .902, 0], ink: false, cast: false }));
  const piv = new THREE.Group(); piv.position.set(0, .9, -.75); g.add(piv);
  piv.add(box(2.4, .4, 1.5, PAL.wood, { pos: [0, .2, .75], inkW: .02, inkColor: 0x4A2D18 }));
  [-1.0, 0, 1.0].forEach(x => piv.add(box(.2, .44, 1.56, PAL.trim, { pos: [x, .2, .75], inkW: .01, inkColor: 0x7A5A10 })));
  piv.add(box(.34, .34, .1, 0xF2CC55, { pos: [0, .12, 1.53], inkW: .01, inkColor: 0x7A5A10 }));
  const lc = [[-.7, .78], [.2, .55], [.75, .95]].map((p, i) => { const c = cyl(.3, .3, .08, PAL.gold, { pos: [p[0], .44, p[1]], rot: [0, 0, 0], inkW: .01, inkColor: 0x7A5A10 }); piv.add(c); return c; });
  const mound = cyl(.8, 1.0, .32, PAL.gold, { pos: [0, 1.0, 0], inkW: .01, inkColor: 0x7A5A10 }); g.add(mound); mound.visible = false;
  const ring = halo(Wd, 2.6, 1.15); g.add(ring.g); ring.g.position.set(0, 0, 0);
  const sp = []; const rr = rng(21);
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xFFF2A8, transparent: true, fog: false })); s.scale.set(.11, .11, .03); s.position.set((rr() - .5) * 2.0, 1.15 + rr() * .55, (rr() - .3) * 1.1); g.add(s); sp.push({ s, ph: rr() * 6.28, f: 1.3 + rr() * 1.2 }); }
  const T = { g, pos, ring,
    top(dx) { return [pos[0] + (dx || 0), pos[1] + 1.1, pos[2]]; },
    open(k) { piv.rotation.x = -ease.io(clamp(k, 0, 1)) * 1.75; },
    fill(k) { k = clamp(k, 0, 1); mound.visible = k > .01; mound.scale.y = Math.max(k, 1e-4); mound.position.y = .9 + .16 * k; },
    sparkle(t, a) { a = a === undefined ? 1 : a; sp.forEach(q => { const u = Math.max(0, Math.sin(t * q.f + q.ph)); q.s.scale.set(.14 * u * a + 1e-4, .14 * u * a + 1e-4, .03); q.s.rotation.z = t * 1.2 + q.ph; q.s.visible = u * a > .02; }); },
    coinsOnLid(v) { lc.forEach(c => { c.visible = v; }); } };
  return T;
}


// ---------- pawn token (board-game piece) ----------
export function pawn(Wd, color, s) {
  s = s || .7; const g = new THREE.Group(); Wd.add(g); const top = new THREE.Group(); g.add(top); const dk = C(color).multiplyScalar(.55).getHex();
  top.add(cyl(.34, .38, .12, dk, { pos: [0, .06, 0], inkW: .012, inkColor: 0x24323F }));
  top.add(cyl(.12, .27, .55, color, { pos: [0, .39, 0], inkW: .012, inkColor: 0x24323F }));
  top.add(mesh(new THREE.TorusGeometry(.2, .05, 8, 24), toon(dk), { pos: [0, .66, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  top.add(ball(.2, color, { pos: [0, .88, 0], inkW: .012, inkColor: 0x24323F }));
  g.scale.setScalar(s);
  return { g, at(x, y, z, hop, face) { g.position.set(x, y, z); top.position.y = Math.abs(Math.sin((hop || 0) * Math.PI)) * .28; top.rotation.y = face || 0; }, show(v) { g.visible = v; } };
}

// ---------- coin column (5 coins = 25), grows coin by coin; bright = the owner's fifth ----------
const TH = .16, CR = .45;
export function col(Wd, home, o) {
  o = o || {}; const s = o.s || 1, g = new THREE.Group(), cg = new THREE.Group(); g.position.set(...home); g.add(cg); Wd.add(g);
  g.add(cyl(CR * 1.3 * s, CR * 1.3 * s, .03, 0xD3C196, { pos: [0, .015, 0], ink: false, cast: false }));
  const coins = []; for (let j = 0; j < 5; j++) { const c = cyl(CR, CR, TH, PAL.gold, { pos: [0, 0, 0], inkW: .012, inkColor: 0x7A5A10 }); cg.add(c); coins.push(c); }
  cg.scale.setScalar(s);
  const hh = (TH + .015) * 5, gc = mesh(new THREE.CylinderGeometry(CR * 1.3, CR * 1.3, hh + .2, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE070, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide }), { ink: false, cast: false, pos: [0, (hh + .2) / 2, 0] }); cg.add(gc);
  const hl = halo(g, CR * 2.7 * s, 1); hl.g.position.set(0, 0, 0);
  const base = coins.map(c => c.material.color.clone()); const st = { k: 0, b: 0, gr: 0, u: 0, tgt: null, vis: 1 };
  const T = { g, home, s, height: hh * s,
    apply() {
      const k = st.k, gr = st.gr;
      coins.forEach((c, j) => { const a = j / 5 * .75, u = ease.out(prog(k, a, a + .25)); c.visible = u > .01; c.position.y = TH / 2 + j * (TH + .015) + (1 - u) * 1.3; c.scale.setScalar(Math.max(.3 + .7 * u, 1e-4));
        c.material.color.copy(base[j]).lerp(GREYC, sm(gr, 0, .6)); c.material.emissive.setHex(0xFFC83A).multiplyScalar(.45 * st.b * (1 - gr)); });
      cg.position.y = -ease.in(prog(gr, .3, 1)) * hh * s * .9; cg.scale.setScalar(s * (1 - .25 * prog(gr, .3, 1)));
      gc.material.opacity = .28 * st.b * (1 - gr) * (.85 + .15 * Math.sin(st.t || 0)); gc.visible = gc.material.opacity > .01;
      hl.set(st.b * .9 * (1 - gr) * sm(k, 0, .3), st.t || 0);
      if (st.tgt) { const u = ease.io(clamp(st.u, 0, 1)); g.position.set(lerp(home[0], st.tgt[0], u), lerp(home[1], st.tgt[1], u) + 1.4 * Math.sin(Math.PI * u), lerp(home[2], st.tgt[2], u)); g.scale.setScalar(1 - .55 * prog(st.u, .55, 1)); g.visible = st.u < .97 && k > .004; }
      else { g.position.set(...home); g.scale.setScalar(1); g.visible = k > .004 || o.padAlways !== false; }
      cg.visible = k > .004 || st.u > 0;
    },
    grow(k) { st.k = k; T.apply(); }, bright(b) { st.b = b; T.apply(); }, grey(v) { st.gr = v; T.apply(); }, time(t) { st.t = t; T.apply(); },
    go(u, tgt) { st.u = u; st.tgt = u > 0 ? tgt : null; T.apply(); }, hl };
  T.apply(); return T;
}
// row of 4 + the owner's fifth. Anchored at x0; fifth at index 4.
export function row(Wd, o) {
  const x0 = o.x0, z = o.z, y = o.y === undefined ? PY : o.y, sp = o.sp || 1.1, s = o.s || 1, g = new THREE.Group(); Wd.add(g);
  const cols = []; for (let i = 0; i < 5; i++) { const c = col(Wd, [x0 + i * sp, y, z], { s }); cols.push(c); }
  cols[4].bright(1); cols.forEach(c => g.add(c.g));
  const T = { g, cols, x0, z, sp, y, cx4: x0 + 1.5 * sp, cx5: x0 + 2 * sp,
    four(k) { cols.slice(0, 4).forEach((c, i) => c.grow(prog(k, i * .14, i * .14 + .58))); },
    fifth(k) { cols[4].grow(k); },
    time(t) { cols.forEach(c => c.time(t)); },
    pos(i) { return [x0 + i * sp, y, z]; } };
  T.into = function (chestT, t, a, d, n) { n = n || 5; cols.slice(0, n).forEach((c, i) => { const s0 = a + i * d * .22; c.go(prog(t, s0, s0 + d * .55), chestT.top((i - 2) * .38)); }); };
  return T;
}

// ---------- jar (transparent glass cylinder with 5 gold levels) ----------
export function jar(Wd, pos, o) {
  o = o || {}; const R = o.r || .75, Hh = o.h || 2.7, g = new THREE.Group(); g.position.set(...pos); Wd.add(g); const lvl = (Hh - .25) / 5;
  const layers = []; for (let i = 0; i < 5; i++) { const l = cyl(R * .86, R * .86, lvl * .96, i % 2 ? 0xEAB52C : PAL.gold, { pos: [0, .1 + lvl * (i + .5), 0], inkW: .008, inkColor: 0x7A5A10 }); g.add(l); layers.push(l); l.visible = false; }
  g.add(cyl(R * 1.05, R * 1.1, .1, 0xD7C79F, { pos: [0, .05, 0], inkW: .012, inkColor: INK }));
  const gl = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Hh, 32, 1, true), new THREE.MeshToonMaterial({ color: 0xBFE3F2, transparent: true, opacity: .22, depthWrite: false, side: THREE.DoubleSide, gradientMap: toon(0).gradientMap })); gl.position.y = .1 + Hh / 2; gl.renderOrder = 3; g.add(gl);
  const rim = mesh(new THREE.TorusGeometry(R, .045, 8, 36), toon(0xA9CCDA), { pos: [0, .1 + Hh, 0], rot: [Math.PI / 2, 0, 0], inkW: .006, inkColor: 0x5A7A8A }); g.add(rim);
  const gk = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.25, R * 1.25, Hh + .4, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE070, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide })); gk.position.y = .1 + Hh / 2; g.add(gk);
  const hl = halo(Wd, R * 2.8, 1); hl.place(pos[0], pos[1], pos[2]);
  const fall = []; for (let i = 0; i < 6; i++) { const c = cyl(.2, .2, .06, PAL.gold, { inkW: .008, inkColor: 0x7A5A10 }); c.visible = false; Wd.add(c); fall.push(c); }
  return { g, top: pos[1] + .1 + Hh, lvl, levels(k) { layers.forEach((l, i) => { const u = clamp(k - i, 0, 1); l.visible = u > .01; l.scale.y = Math.max(u, 1e-4); l.position.y = .1 + lvl * i + lvl * .48 * u; }); },
    pour(t, on) { const lv = layers.findIndex(l => !l.visible), top = pos[1] + .1 + lvl * (lv < 0 ? 5 : lv + .3); fall.forEach((c, i) => { const u = fr(t * 1.6 + i / 6); c.visible = !!on; c.position.set(pos[0] + .12 * Math.sin(i * 2.1), lerp(pos[1] + Hh + 1.6, top, u * u), pos[2]); c.rotation.set(t * 4 + i, 0, t * 3); }); },
    glow(a, t) { gk.material.opacity = .3 * a * (.8 + .2 * Math.sin((t || 0) * 4)); gk.visible = a > .01; hl.set(a, t); } };
}

// ---------- two lanes to the chest: rope posts, blue gate, orange rope ----------
export function lanes(Wd, o) {
  o = o || {}; const X = o.x || 0, z0 = o.z0 === undefined ? 3.4 : o.z0, z1 = o.z1 === undefined ? -1.1 : o.z1, zg = o.zg === undefined ? -.1 : o.zg, g = new THREE.Group(); Wd.add(g);
  const mk = (cx, color, isBlue) => {
    g.add(box(1.7, .03, z0 - z1, isBlue ? 0xDCE6F2 : 0xF2E2CC, { pos: [cx, PY + .015, (z0 + z1) / 2], ink: false, cast: false }));
    [-1, 1].forEach(sd => { g.add(box(.07, .035, z0 - z1, color, { pos: [cx + sd * .83, PY + .03, (z0 + z1) / 2], ink: false, cast: false }));
      for (let z = z1 + .1; z <= z0; z += 1.6) { g.add(cyl(.055, .07, .55, 0xB09A74, { pos: [cx + sd * .98, PY + .275, z], inkW: .008, inkColor: INK })); g.add(ball(.09, 0xF2CC55, { pos: [cx + sd * .98, PY + .6, z], ink: false })); }
      for (let z = z1 + .1; z + 1.6 <= z0 + .01; z += 1.6) g.add(cyl(.018, .018, 1.6, 0xC9A25E, { pos: [cx + sd * .98, PY + .5, z + .8], rot: [Math.PI / 2, 0, 0], ink: false })); });
  };
  mk(X - 1.7, PAL.blue, true); mk(X + 1.7, PAL.orange, false);
  // blue gate (pivot at the lane's left post)
  const cxB = X - 1.7, cxO = X + 1.7; const gp = new THREE.Group(); gp.position.set(cxB - .98, PY, zg); g.add(gp);
  gp.add(box(1.9, .1, .1, PAL.blue, { pos: [.95, .5, 0], inkW: .01, inkColor: 0x1B3A6A })); gp.add(box(1.9, .1, .1, PAL.blue, { pos: [.95, .3, 0], inkW: .01, inkColor: 0x1B3A6A }));
  g.add(cyl(.09, .1, .7, 0x6A7F9A, { pos: [cxB + .98, PY + .35, zg], inkW: .01, inkColor: 0x1B3A6A }));
  // orange: fixed rope across the lane
  g.add(cyl(.09, .1, .7, 0x9A7A5A, { pos: [cxO - .98, PY + .35, zg], inkW: .01, inkColor: INK })); g.add(cyl(.09, .1, .7, 0x9A7A5A, { pos: [cxO + .98, PY + .35, zg], inkW: .01, inkColor: INK }));
  g.add(cyl(.03, .03, 1.96, 0xD08A3A, { pos: [cxO, PY + .55, zg], rot: [0, 0, Math.PI / 2], ink: false })); g.add(cyl(.03, .03, 1.96, 0xD08A3A, { pos: [cxO, PY + .35, zg], rot: [0, 0, Math.PI / 2], ink: false }));
  return { g, cxB, cxO, zg, z0, z1, gate: { open(k) { gp.rotation.y = ease.io(clamp(k, 0, 1)) * 1.45; } } };
}

// ---------- house / field with a blue flag ----------
export function house(Wd, pos, sc) {
  sc = sc || 1; const g = new THREE.Group(); g.position.set(...pos); Wd.add(g); const b = new THREE.Group(); g.add(b);
  b.add(box(2.2, 1.3, 1.8, 0xF2E3C0, { pos: [0, .65, 0], inkW: .02, inkColor: INK }));
  const roof = mesh(new THREE.ConeGeometry(1.75, 1.05, 4), toon(0xB5533C), { pos: [0, 1.82, 0], rot: [0, Math.PI / 4, 0], inkW: .02, inkColor: 0x6A2A1A }); roof.scale.set(1.0, 1, .82); b.add(roof);
  b.add(box(.5, .8, .06, 0x8A5A3B, { pos: [0, .4, .92], inkW: .01, inkColor: 0x4A2D18 })); b.add(box(.42, .42, .06, 0xBFE3F2, { pos: [-.7, .8, .92], inkW: .01, inkColor: 0x4A2D18 })); b.add(box(.42, .42, .06, 0xBFE3F2, { pos: [.7, .8, .92], inkW: .01, inkColor: 0x4A2D18 }));
  b.add(box(.3, .6, .3, 0xC98A6A, { pos: [.65, 2.0, -.2], inkW: .015, inkColor: INK }));
  const fl = flag(g, PAL.blue, [1.35, 0, .9], 1.4); g.scale.setScalar(sc);
  return { g, flag: fl, pop(k) { b.scale.setScalar(Math.max(ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; } };
}
export function fieldPlot(Wd, pos, sc) {
  sc = sc || 1; const g = new THREE.Group(); g.position.set(...pos); Wd.add(g); const b = new THREE.Group(); g.add(b);
  b.add(box(3.4, .14, 2.4, 0x8A6A44, { pos: [0, .07, 0], inkW: .02, inkColor: 0x4A3320 }));
  for (let i = 0; i < 5; i++) { b.add(box(3.1, .08, .26, i % 2 ? 0x6FA85A : 0x7DB86C, { pos: [0, .17, -.9 + i * .45], inkW: .008, inkColor: 0x3F7A3A })); for (let k = 0; k < 6; k++) b.add(ball(.09, 0x4F9A4A, { pos: [-1.3 + k * .52, .3, -.9 + i * .45], ink: false })); }
  const fl = flag(g, PAL.blue, [1.55, 0, 1.0], 1.4); g.scale.setScalar(sc);
  return { g, flag: fl, pop(k) { b.scale.setScalar(Math.max(ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; } };
}

// ---------- fraction bar: 5 segments, the fifth lit ----------
export function fractionBar(Wd, x0, y, z, sp) {
  const g = new THREE.Group(); g.position.set(0, y, z); Wd.add(g); const segs = [];
  for (let i = 0; i < 5; i++) { const s = box(sp - .12, .14, .08, i === 4 ? 0xFFD24A : 0xBFD4E6, { pos: [x0 + i * sp, 0, 0], inkW: .01, inkColor: 0x4A5A6A }); g.add(s); segs.push(s); }
  segs[4].material.emissive = C(0xFFB830); segs[4].material.emissiveIntensity = .4;
  return { g, set(k) { segs.forEach((s, i) => { const u = ease.out(prog(k, i * .12, i * .12 + .4)); s.scale.set(Math.max(u, 1e-4), 1, 1); s.visible = u > .01; }); g.visible = k > .01; },
    lit(k, t) { segs.forEach((s, i) => { if (i < 4) s.material.color.setHex(0xBFD4E6).lerp(C(0x8FA6BC), k); }); segs[4].scale.y = 1 + .9 * k * (.9 + .1 * Math.sin(t * 6)); segs[4].material.emissiveIntensity = .4 + .5 * k; } };
}

// ---------- marks ----------
export function xMark(sz) {
  sz = sz || 1; const g = new THREE.Group(), mk = a => { const b = box(1.5, .17, .09, PAL.red, { ink: false }); b.material.emissive = C(0x6a1a14); b.material.emissiveIntensity = .5; b.rotation.z = a; g.add(b); }; mk(Math.PI / 4); mk(-Math.PI / 4);
  return { g, set(k) { g.scale.setScalar(sz * Math.max(ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; } };
}
export function checkMark(sz) {
  sz = sz || 1; const g = new THREE.Group(), a = box(.5, .17, .09, PAL.green, { ink: false, rot: [0, 0, -Math.PI / 4], pos: [-.3, -.12, 0] }), b = box(1.1, .17, .09, PAL.green, { ink: false, rot: [0, 0, Math.PI / 4], pos: [.2, .08, 0] });
  [a, b].forEach(m => { m.material.emissive = C(0x1a5a2a); m.material.emissiveIntensity = .5; g.add(m); });
  return { g, set(k) { g.scale.setScalar(sz * Math.max(ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; } };
}

// ---------- digit tag (ASCII only) ----------
export function numberTag(Wd, txt, pos, h, o) { o = o || {}; const lb = label(Wd, txt, { size: 110, height: h || .5, bg: o.bg || 'rgba(255,248,224,.95)', color: o.color || '#2a5a8a', pos }); lb.userData.s0 = lb.scale.clone(); lb.visible = false; return lb; }
export function pop(sp, k) { sp.scale.set(sp.userData.s0.x * Math.max(k, .0001), sp.userData.s0.y * Math.max(k, .0001), 1); sp.visible = k > .01; }

// ---------- countdown clock ring ----------
export function clockRing(parent, o) {
  o = o || {}; const R = o.R || .6, g = new THREE.Group(); g.position.set(...(o.pos || [0, 2.3, 0])); parent.add(g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R * .95, 48), new THREE.MeshBasicMaterial({ color: 0xFFF6DC, fog: false })); disc.position.z = -.02; g.add(disc);
  g.add(mesh(new THREE.TorusGeometry(R, .035, 8, 72), toon(0xB8871B), { ink: false }));
  const segs = [], N = 72;
  for (let i = 0; i < N; i++) { const a = i / N * 2 * Math.PI; const s = new THREE.Mesh(new THREE.BoxGeometry(.05, .1, .05), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xE2B43C : 0xF0C44E, fog: false })); s.position.set(Math.sin(a) * R * .86, Math.cos(a) * R * .86, 0); s.rotation.z = -a; s.visible = false; g.add(s); segs.push(s); }
  const hand = new THREE.Group(); hand.add(box(.035, R * .75, .02, 0xB8871B, { pos: [0, R * .375, .02], ink: false })); g.add(hand);
  const dig = []; for (let n = 1; n <= 5; n++) { const lb = label({ add: x => g.add(x) }, String(n), { size: 120, bg: null, color: '#8a5a10', height: .34, pos: [0, -.02, .05] }); lb.visible = false; dig.push(lb); }
  return { g, set(k) { const n = Math.floor(k * N + 1e-6); segs.forEach((s, i) => { s.visible = i < n; }); hand.rotation.z = -k * 2 * Math.PI; const left = k <= 0 || k >= 1 ? 0 : clamp(Math.ceil((1 - k) * 5), 1, 5); dig.forEach((d, i) => { d.visible = (i + 1) === left; }); },
    fade(a) { g.scale.setScalar(Math.max(a, .0001)); g.visible = a > .01; } };
}

// ---------- invisible hero proxy: a group whose (hidden) box is the focal area of the shot ----------
export function heroProxy(Wd, c, sz) {
  const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), new THREE.MeshBasicMaterial()); m.visible = false; g.add(m); g.position.set(...c); Wd.add(g); return g;
}


// =====================================================================
// stef_35 additions: sheep, dog, altar, barrier, stepping stones, tokens, props
// =====================================================================
const STONE = 0xE8D9B5, WOOL = 0xF6F2E8;
const sph = (r, ws, hs) => new THREE.SphereGeometry(r, ws || 14, hs || 10);

// ---------- sheep: wool-ball body, dark head, four legs; breathing, walk swing, graze ----------
export function sheep(Wd, o) {
  o = o || {}; const base = o.s || 1, g = new THREE.Group(); g.rotation.order = 'YXZ'; Wd.add(g);
  const wm = toon(WOOL, { emissive: 0xE8B830, emissiveIntensity: 0 }); const body = new THREE.Group(); g.add(body);
  const bl = [[0, 1.05, 0, .58], [0, 1.1, .45, .5], [0, 1.08, -.45, .5], [.32, .98, .2, .42], [-.32, .98, .2, .42], [.32, .98, -.25, .42], [-.32, .98, -.25, .42], [0, 1.4, .1, .46], [0, 1.34, -.38, .4], [.26, 1.3, .38, .36], [-.26, 1.3, .38, .36], [0, .86, .1, .4]];
  bl.forEach(b => body.add(mesh(sph(b[3]), wm, { pos: [b[0], b[1], b[2]], inkW: .02, inkColor: 0x8A8478 })));
  body.add(mesh(sph(.17), wm, { pos: [0, 1.15, -.98], inkW: .015, inkColor: 0x8A8478 }));
  const legs = [[-.3, .5], [.3, .5], [-.3, -.5], [.3, -.5]].map(p => { const pv = new THREE.Group(); pv.position.set(p[0], .74, p[1]); g.add(pv);
    pv.add(cyl(.075, .065, .66, 0x3A3A42, { pos: [0, -.33, 0], inkW: .01, inkColor: 0x1A1A20 })); pv.add(cyl(.088, .088, .07, 0x1E1E24, { pos: [0, -.67, 0], inkW: .008, inkColor: 0x000000 })); return pv; });
  const band = cyl(.105, .105, .18, PAL.red, { pos: [0, -.3, 0], inkW: .008, inkColor: 0x6A1A14 }); band.material.emissive = C(0x6A1A14); band.material.emissiveIntensity = .3; band.visible = false; legs[0].add(band);
  const head = new THREE.Group(); head.position.set(0, 1.18, .78); g.add(head);
  head.add(mesh(sph(.3), toon(0x4A4A52), { pos: [0, 0, .32], scale: [.95, 1, 1.1], inkW: .015, inkColor: 0x1A1A20 }));
  head.add(mesh(sph(.17), toon(0x5E5E68), { pos: [0, -.1, .6], inkW: .01, inkColor: 0x1A1A20 })); head.add(ball(.05, 0x15151A, { pos: [0, -.06, .76], ink: false }));
  [-1, 1].forEach(sd => { head.add(ball(.065, 0xFFFFFF, { pos: [sd * .15, .09, .52], ink: false })); head.add(ball(.032, 0x101014, { pos: [sd * .16, .09, .575], ink: false }));
    head.add(mesh(sph(.13), toon(0x4A4A52), { pos: [sd * .33, .1, .26], scale: [1, .38, .6], rot: [0, 0, sd * -.35], inkW: .01, inkColor: 0x1A1A20 })); });
  head.add(mesh(sph(.19), wm, { pos: [0, .3, .28], inkW: .012, inkColor: 0x8A8478 }));
  const dot = ball(.16, PAL.red, { pos: [-1.05, .95, .6], ink: false }); dot.material.emissive = C(0xC2453A); dot.material.emissiveIntensity = .7; dot.visible = false; g.add(dot);
  const gsp = []; const rr = rng(o.seed || 5);
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xFFF2A8, transparent: true, fog: false })); s.scale.setScalar(1e-4); Wd.add(s); gsp.push({ s, a: rr() * 6.28, ph: i / 6 }); }
  const gl = []; for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xFFE9A0, transparent: true, fog: false })); s.scale.set(1e-4, 1e-4, 1e-4); s.position.set((rr() - .5) * .9, 1.55 + rr() * .3, (rr() - .5) * 1.2); body.add(s); gl.push({ s, ph: rr() * 6.28, f: 2 + rr() }); }
  const ring = halo(Wd, 1.75 * base, 1);
  const S = { g, wool: wm, ring, px: 0, py: 0, pz: 0, base, head,
    set(p, t) { t = t || 0; const sc = (p.sc === undefined ? 1 : p.sc) * base; S.px = p.x; S.py = p.y || 0; S.pz = p.z;
      g.position.set(p.x, p.y || 0, p.z); g.rotation.set(-(p.pitch || 0), p.f || 0, 0); g.scale.setScalar(Math.max(sc, 1e-4)); g.visible = sc > .02;
      const w = p.walk || 0, wa = p.wa || 0, sw = Math.sin(w * Math.PI * 2) * .5 * wa; legs[0].rotation.x = sw; legs[3].rotation.x = sw; legs[1].rotation.x = -sw; legs[2].rotation.x = -sw;
      body.position.y = .025 * Math.sin(t * 1.7) + wa * .05 * Math.abs(Math.sin(w * Math.PI * 2)); body.scale.setScalar(1 + .012 * Math.sin(t * 1.7 + 1));
      const gz = p.graze || 0; head.rotation.x = gz * (.95 + .12 * Math.sin(t * 2.3)) + .04 * Math.sin(t * 1.1); head.position.y = 1.18 - .22 * gz; head.rotation.y = .12 * Math.sin(t * .8) * (1 - gz); },
    bandage(k, t, d) { k = clamp(k, 0, 1); band.visible = k > .01; band.scale.set(1, Math.max(ease.out(k), 1e-4), 1); d = clamp(d || 0, 0, 1); dot.visible = d > .01; dot.scale.setScalar(Math.max(d * (1 + .3 * Math.sin((t || 0) * 7)), 1e-4)); },
    gold(k, t, dx, dy, dz, thin) { k = clamp(k, 0, 1); ring.place(S.px + (dx || 0), S.py + (dy || 0), S.pz + (dz || 0)); ring.set(k, t); if (thin) ring.disc.material.opacity *= (1 - thin);
      gsp.forEach((q, i) => { const u = fr((t || 0) * .3 + q.ph), r = .95 * base; q.s.position.set(S.px + (dx || 0) + Math.cos(q.a + i) * r, S.py + (dy || 0) + .2 + u * 1.9 * base, S.pz + (dz || 0) + Math.sin(q.a + i) * r * .8); const z = .1 * Math.sin(Math.PI * u) * k * base; q.s.scale.set(z + 1e-4, z + 1e-4, z * .3 + 1e-4); q.s.rotation.y = (t || 0) * 2 + i; q.s.visible = z > .004; }); },
    glint(k, t) { k = clamp(k, 0, 1); wm.emissiveIntensity = .32 * k; gl.forEach(q => { const u = Math.max(0, Math.sin((t || 0) * q.f + q.ph)) * k; q.s.scale.set(.13 * u + 1e-4, .13 * u + 1e-4, .04); q.s.rotation.z = (t || 0) * 1.5 + q.ph; q.s.visible = u > .03; }); } };
  S.bandage(0); S.gold(0, 0); S.glint(0, 0);
  return S;
}

// ---------- toon dog (sitting), wag ----------
export function dog(Wd, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g); const tan = 0xC8955A, dk = 0x7A5230;
  g.add(mesh(sph(.5), toon(tan), { pos: [0, .62, -.1], scale: [.85, .95, 1.0], rot: [-.5, 0, 0], inkW: .02, inkColor: 0x5A3A1A }));
  g.add(mesh(sph(.34), toon(tan), { pos: [0, .38, -.35], scale: [1.1, .9, 1.0], inkW: .02, inkColor: 0x5A3A1A }));
  g.add(mesh(sph(.3), toon(tan), { pos: [0, 1.18, .28], inkW: .02, inkColor: 0x5A3A1A })); g.add(mesh(sph(.17), toon(0xE6C79A), { pos: [0, 1.08, .55], scale: [1, .85, 1.1], inkW: .012, inkColor: 0x5A3A1A })); g.add(ball(.065, 0x15151A, { pos: [0, 1.14, .7], ink: false }));
  [-1, 1].forEach(sd => { g.add(ball(.055, 0xFFFFFF, { pos: [sd * .13, 1.27, .5], ink: false })); g.add(ball(.028, 0x101014, { pos: [sd * .14, 1.27, .545], ink: false }));
    g.add(mesh(sph(.14), toon(dk), { pos: [sd * .27, 1.28, .2], scale: [.5, 1, .8], rot: [0, 0, sd * -.2], inkW: .01, inkColor: 0x3A2210 }));
    g.add(cyl(.09, .08, .5, tan, { pos: [sd * .17, .27, .22], inkW: .01, inkColor: 0x5A3A1A })); g.add(mesh(sph(.1), toon(0xE6C79A), { pos: [sd * .17, .04, .3], scale: [1, .5, 1.3], inkW: .008, inkColor: 0x5A3A1A })); });
  const tail = new THREE.Group(); tail.position.set(0, .3, -.7); g.add(tail); tail.add(mesh(new THREE.ConeGeometry(.08, .55, 8), toon(tan), { pos: [0, .22, -.05], rot: [-.4, 0, 0], inkW: .01, inkColor: 0x5A3A1A }));
  return { g, set(x, y, z, f, s, t, wag) { g.position.set(x, y, z); g.rotation.y = f; g.scale.setScalar(s); tail.rotation.z = Math.sin(t * 9) * .55 * (wag === undefined ? 1 : wag); } };
}

// ---------- altar: light stone, ramp, calm flame ----------
export function altar(Wd, pos, sc) {
  sc = sc || 1; const g = new THREE.Group(); g.position.set(...pos); g.scale.setScalar(sc); Wd.add(g); const INKS = 0x8C7650;
  g.add(box(2.6, 1.1, 2.4, STONE, { pos: [0, .55, 0], inkW: .02, inkColor: INKS })); g.add(box(2.9, .18, 2.7, 0xF1E6C8, { pos: [0, 1.19, 0], inkW: .02, inkColor: INKS })); g.add(box(1.5, .42, 1.3, 0xDDCBA0, { pos: [0, 1.49, 0], inkW: .02, inkColor: INKS }));
  g.add(box(2.9, .16, 1.5, 0xE2D4AE, { pos: [-2.75, .66, 0], rot: [0, 0, .4575], inkW: .02, inkColor: INKS }));
  const fl = new THREE.Group(); fl.position.set(0, 1.7, 0); g.add(fl);
  const mk = (r, h, c, y) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), new THREE.MeshBasicMaterial({ color: c, fog: false })); m.position.y = y; fl.add(m); return m; };
  const f1 = mk(.4, .95, 0xF08A2A, .3), f2 = mk(.28, .72, 0xF8B93A, .25), f3 = mk(.16, .46, 0xFFE9A0, .18);
  const glow = new THREE.Mesh(sph(.85), new THREE.MeshBasicMaterial({ color: 0xFFD27A, transparent: true, opacity: .16, depthWrite: false, fog: false })); glow.position.y = .3; fl.add(glow);
  Wd.on(t => { [f1, f2, f3].forEach((m, i) => { m.scale.set(1 + .08 * Math.sin(t * (7 + i * 2) + i), 1 + .14 * Math.sin(t * (9 + i * 3) + i * 2), 1 + .08 * Math.sin(t * (7 + i * 2) + 1 + i)); m.rotation.y = t * (1 + i); }); glow.material.opacity = .14 + .04 * Math.sin(t * 5); });
  const foot = pos[0] - (1.45 + 2.6) * sc, topY = 1.28 * sc, run = 2.6 * sc;
  return { g, foot, topY, run, pos, flameY: pos[1] + 1.7 * sc, hAt(x) { return clamp((x - foot) / run, 0, 1) * topY; }, onRamp(x) { return x > foot && x < foot + run; } };
}

// ---------- barrier: translucent red dome + X at the ramp foot ----------
export function barrier(Wd, x, z, R) {
  R = R || 1.5; const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xC2453A, transparent: true, opacity: .27, depthWrite: false, side: THREE.DoubleSide, fog: false })); g.add(dome);
  const rg = new THREE.Mesh(new THREE.TorusGeometry(R, .05, 8, 48), new THREE.MeshBasicMaterial({ color: 0xC2453A, fog: false })); rg.rotation.x = Math.PI / 2; rg.position.y = .05; g.add(rg);
  const xm = xMark(.7); xm.g.position.set(0, R * .75, R * .55); g.add(xm.g);
  return { g, set(k, op) { k = clamp(k, 0, 1); g.scale.set(Math.max(ease.out(k), 1e-4), Math.max(ease.out(k), 1e-4), Math.max(ease.out(k), 1e-4)); g.visible = k > .01; dome.material.opacity = .27 * (op === undefined ? 1 : op); xm.set(k); } };
}

// ---------- props ----------
export function shears(Wd, sc) {
  sc = sc || 1; const g = new THREE.Group(); Wd.add(g); const cr = new THREE.Group(); cr.scale.setScalar(sc); g.add(cr); const hv = [];
  [1, -1].forEach(s => { const pv = new THREE.Group(); cr.add(pv); pv.add(box(.14, 1.05, .04, 0xCFD6DD, { pos: [0, .55, 0], inkW: .012, inkColor: 0x4A5560 })); pv.add(mesh(new THREE.TorusGeometry(.2, .05, 8, 20), toon(0xE08A3A), { pos: [0, -.3, 0], inkW: .01, inkColor: 0x6A3A10 })); hv.push([pv, s]); });
  cr.add(ball(.06, 0x6A7580, { pos: [0, 0, .04], ink: false }));
  return { g, snip(t, rate, open) { const a = .05 + .22 * (open === undefined ? .5 + .5 * Math.sin(t * rate) : open); hv.forEach(h => { h[0].rotation.z = h[1] * a; }); }, hover(t) { cr.rotation.z = .35 + .08 * Math.sin(t * 1.5); cr.position.y = .06 * Math.sin(t * 2); } };
}
export function pail(Wd, sc) {
  sc = sc || 1; const g = new THREE.Group(); Wd.add(g); const p = new THREE.Group(); p.scale.setScalar(sc); g.add(p);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(.52, .46, .7, 24, 1, true), new THREE.MeshToonMaterial({ color: 0x9AA2AA, side: THREE.DoubleSide, gradientMap: toon(0).gradientMap })); wall.position.y = .35; wall.castShadow = true; p.add(wall); ink(wall, .02, 0x3A4048);
  p.add(cyl(.46, .46, .05, 0x7C848C, { pos: [0, .025, 0], inkW: .01, inkColor: 0x3A4048 })); p.add(mesh(new THREE.TorusGeometry(.52, .035, 6, 24), toon(0x7C848C), { pos: [0, .7, 0], rot: [Math.PI / 2, 0, 0], ink: false }));
  const han = new THREE.Mesh(new THREE.TorusGeometry(.5, .03, 6, 20, Math.PI), toon(0x6A727A)); han.position.y = .7; han.rotation.y = 0; p.add(han);
  const milk = cyl(.44, .44, .6, 0xFFFFFF, { pos: [0, .3, 0], ink: false }); milk.material.emissive = C(0x222222); p.add(milk);
  const gk = new THREE.Mesh(sph(1.0), new THREE.MeshBasicMaterial({ color: 0xFFE070, transparent: true, opacity: 0, depthWrite: false, fog: false })); gk.position.y = .5; gk.scale.set(.9, .8, .9); p.add(gk);
  const T = { g, level(k) { k = clamp(k, 0, 1); const h = .05 + .62 * k; milk.scale.y = Math.max(h / .6, 1e-4); milk.position.y = h / 2 + .04; milk.visible = k > .005; },
    glint(k, t) { k = clamp(k, 0, 1); milk.material.color.setHex(0xFFFFFF).lerp(C(0xFFE08A), k); milk.material.emissive.setHex(0xFFC83A).multiplyScalar(.5 * k); gk.material.opacity = .22 * k * (.85 + .15 * Math.sin((t || 0) * 5)); gk.visible = k > .01; } };
  T.level(0); return T;
}
export function plough(Wd, sc) {
  sc = sc || 1; const g = new THREE.Group(); Wd.add(g); const p = new THREE.Group(); p.scale.setScalar(sc); g.add(p); const W = PAL.wood, I = 0x4A2D18;
  p.add(box(1.7, .13, .13, W, { pos: [0, .5, 0], rot: [0, 0, .14], inkW: .012, inkColor: I })); p.add(mesh(new THREE.ConeGeometry(.2, .6, 8), toon(0x8A939B), { pos: [-.98, .22, 0], rot: [0, 0, Math.PI / 2 + .3], inkW: .012, inkColor: 0x3A4048 }));
  [-1, 1].forEach(sd => p.add(box(.1, 1.0, .1, W, { pos: [.9, .8, sd * .22], rot: [0, 0, -.35], inkW: .01, inkColor: I }))); p.add(box(.1, .1, .6, W, { pos: [1.08, 1.25, 0], inkW: .01, inkColor: I }));
  p.add(mesh(new THREE.CylinderGeometry(.28, .28, .1, 14), toon(W), { pos: [-.5, .28, 0], rot: [Math.PI / 2, 0, 0], inkW: .012, inkColor: I })); return { g };
}
export function bowl(Wd, sc) {
  sc = sc || 1; const g = new THREE.Group(); Wd.add(g); const p = new THREE.Group(); p.scale.setScalar(sc); g.add(p);
  p.add(cyl(.55, .36, .34, PAL.red, { pos: [0, .17, 0], inkW: .015, inkColor: 0x6A1A14 })); p.add(cyl(.46, .46, .03, 0x5A2A22, { pos: [0, .34, 0], ink: false }));
  [[-.15, .08], [.12, -.1], [.02, .15]].forEach(q => p.add(ball(.1, 0xC9A06A, { pos: [q[0], .4, q[1]], ink: false }))); return { g };
}
export function kit(Wd, xs, z, which) {
  const o = {}, g = new THREE.Group(); Wd.add(g);
  const mk = (n, f, sc, y) => { const i = which.indexOf(n); if (i < 0) return; const h = f(Wd, sc); h.g.position.set(xs[i], y || 0, z); o[n] = h; o[n].x = xs[i]; };
  mk('shears', shears, .85, .62); mk('pail', pail, .9, 0); mk('plough', plough, .85, 0); mk('bowl', bowl, .95, 0);
  if (o.shears) o.shears.g.rotation.y = 0;
  o.marks = (kind, k0, k1, t, yy) => { };
  return o;
}

// ---------- stepping stones + symbol tokens ----------
export function stones(Wd, xs, z, r) {
  r = r || .62; xs.forEach(x => { Wd.add(cyl(r, r * 1.05, .16, 0xCFC3A6, { pos: [x, .08, z], inkW: .015, inkColor: 0x8C7650 })); Wd.add(cyl(r * .8, r * .8, .02, 0xE3D9BF, { pos: [x, .17, z], ink: false, cast: false })); });
  return { xs, z };
}
export function token(Wd, kind, pos, sc) {
  sc = sc || 1; const g = new THREE.Group(); g.position.set(...pos); Wd.add(g); const y0 = pos[1], ph = pos[0] * 1.7; let m;
  if (kind === 'gold') m = mesh(new THREE.TorusGeometry(.34, .1, 12, 32), toon(0xE8B830, { emissive: 0x8A6A10, emissiveIntensity: .5 }), { inkW: .012, inkColor: 0x7A5A10 });
  else if (kind === 'red') m = ball(.3, 0xC2453A, { inkW: .012, inkColor: 0x6A1A14 });
  else { m = cyl(.36, .36, .1, 0xE8B830, { rot: [Math.PI / 2, 0, 0], inkW: .012, inkColor: 0x7A5A10 }); m.material.emissive = C(0x8A6A10); m.material.emissiveIntensity = .4; }
  if (kind === 'red') { m.material.emissive = C(0xC2453A); m.material.emissiveIntensity = .4; } g.add(m);
  const hl = new THREE.Mesh(new THREE.CircleGeometry(.7, 24), new THREE.MeshBasicMaterial({ color: kind === 'red' ? 0xFF8A7A : 0xFFE070, transparent: true, opacity: .0, depthWrite: false, fog: false })); hl.position.z = -.05; g.add(hl);
  return { g, set(k, t) { k = clamp(k, 0, 1); const s = sc * Math.max(ease.out(k), 1e-4); g.scale.setScalar(s * (kind === 'red' ? 1 + .08 * Math.sin((t || 0) * 6) : 1)); g.visible = k > .01; g.position.y = y0 + .09 * Math.sin((t || 0) * 2 + ph); if (kind !== 'red') m.rotation.y = Math.sin((t || 0) * 1.5 + ph) * .6; hl.material.opacity = .22 * ease.out(k); } };
}

// ---------- gold motes that orbit a point; soft spotlight cone ----------
export function swirl(Wd, n, R, seed) {
  const r = rng(seed || 3), arr = []; for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xFFE9A0 : 0xF4C84A, transparent: true, opacity: .85, fog: false })); s.scale.setScalar(.06 + r() * .05); Wd.add(s); arr.push({ s, a: r() * 6.28, y: r() * 2, sp: .25 + r() * .2, rr: R * (.7 + r() * .5) }); }
  return { set(cx, cy, cz, t, a) { arr.forEach((q, i) => { const an = q.a + t * q.sp; q.s.position.set(cx + Math.cos(an) * q.rr, cy + .3 + q.y * .8 + .15 * Math.sin(t * 1.3 + i), cz + Math.sin(an) * q.rr * .7); q.s.rotation.y = t * 2 + i; q.s.visible = a > .02; }); } };
}
export function spot(Wd, x, z, h, R) {
  const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g); const c = new THREE.Mesh(new THREE.ConeGeometry(R || 2.2, h, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFF6DC, transparent: true, opacity: .13, depthWrite: false, side: THREE.DoubleSide, fog: false })); c.position.y = h / 2; g.add(c);
  const d = new THREE.Mesh(new THREE.CircleGeometry(R || 2.2, 32), new THREE.MeshBasicMaterial({ color: 0xFFF6DC, transparent: true, opacity: .2, depthWrite: false, fog: false })); d.rotation.x = -Math.PI / 2; d.position.y = .03; g.add(d);
  return { g, set(a) { g.visible = a > .01; c.material.opacity = .13 * a; d.material.opacity = .2 * a; } };
}
// arc position between two points (u 0..1)
export function arc(a, b, u, hgt) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + (hgt || 0) * Math.sin(Math.PI * u), lerp(a[2], b[2], u)]; }
