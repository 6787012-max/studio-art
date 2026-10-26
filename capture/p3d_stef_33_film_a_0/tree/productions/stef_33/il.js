// il.js - shared module for the stef_33 film (three trees). Pure functions of t, no Math.random/Date. No Hebrew: ASCII digits only.
import { THREE, world, box, cyl, ball, mesh, toon, label, ease, prog, clamp, lerp, rng } from '../../lib/stage3d.js';

export const PAL = { sky: 0xCFE6F2, meadow: 0x7FB86A, crown: 0x4F9A4A, trunk: 0x8A5A3B, soil: 0xA9784F, blue: 0x3F7FD0, red: 0xC2453A, green: 0x2E8B3E };
export const GY = 1.16, ZF = 2.2, ZB = -3.2, XW = 7.4;     // top of the field, front (cut) face, back edge, half width
const INK = 0x8C7650, BLUE = 0x3F7FD0;
export const sm = (x, a, b) => { const u = clamp((x - a) / Math.max(b - a, 1e-6), 0, 1); return u * u * (3 - 2 * u); };
const fr = x => ((x % 1) + 1) % 1;
const C = h => new THREE.Color(h);

// ---------- world: soft sky, far hills, green floor, a few clouds ----------
export function mkWorld(o) {
  o = o || {};
  const Wd = world({ ground: null, skyTop: o.skyTop === undefined ? 0xCFE6F2 : o.skyTop, skyBottom: o.skyBottom === undefined ? 0xEAF4F8 : o.skyBottom, fogColor: o.fogColor === undefined ? 0xE3F0F4 : o.fogColor,
    fogNear: 30, fogFar: 100, hemi: o.hemi === undefined ? 1.5 : o.hemi, sun: o.sun === undefined ? 1.0 : o.sun, sunPos: [-6, 12, 8], shadowExt: 12, hemiSky: 0xffffff, hemiGround: 0xcfe0b8, sunColor: o.sunColor || 0xFFF4E0 });
  const fl = new THREE.Mesh(new THREE.CircleGeometry(80, 64), new THREE.MeshLambertMaterial({ color: 0x7DB86C })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; Wd.add(fl); Wd.floor = fl;
  const hc = [0xB5D6B0, 0xA3CBA6, 0xC2DDB9, 0xA9D0B8]; const r = rng(77);
  for (let i = 0; i < 9; i++) { const rad = 8 + r() * 7; const h = new THREE.Mesh(new THREE.SphereGeometry(rad, 24, 12), new THREE.MeshLambertMaterial({ color: hc[i % 4] })); h.position.set(-48 + i * 12 + r() * 4, -rad * .55, -30 - r() * 12); h.scale.y = .62; Wd.add(h); }
  const clouds = [];
  for (let i = 0; i < 5; i++) { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, fog: false })); b.position.set(k * 1.1 - 1.6, (k % 2) * .35, 0); b.scale.set(1.3 - (k % 2) * .25, .8, .8); g.add(b); }
    g.position.set(-40 + i * 20, 15 + (i % 3) * 3, -48); g.userData.x0 = g.position.x; Wd.add(g); clouds.push(g); }
  Wd.on(t => clouds.forEach((g, i) => { g.position.x = g.userData.x0 + 1.2 * Math.sin(t * .05 + i); }));
  return Wd;
}

// ---------- light motes ----------
export function motes(Wd, n, seed, o) {
  o = o || {}; const r = rng(seed || 1), g = new THREE.Group(), arr = []; Wd.add(g); const geo = new THREE.SphereGeometry(1, 8, 6);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 3 ? 0xFFFFFF : 0xFFE9A0, transparent: true, opacity: .7, fog: false, depthWrite: false })); m.scale.setScalar(.03 + r() * .05); g.add(m);
    arr.push({ m, x: (r() - .5) * (o.w || 14), y0: r() * (o.h || 5), z: lerp(o.z0 === undefined ? -5 : o.z0, o.z1 === undefined ? 5 : o.z1, r()), sp: .05 + r() * .1, ph: r() * 6.28 });
  }
  const Hh = o.h || 5;
  Wd.on(t => arr.forEach(a => { const u = fr((a.y0 + t * a.sp) / Hh); a.m.position.set(a.x + .2 * Math.sin(t * .4 + a.ph), .3 + u * Hh, a.z); a.m.material.opacity = .7 * Math.sin(Math.PI * u); }));
  return g;
}

// ---------- grass tufts that sway ----------
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
  sc = sc || 1; const g = new THREE.Group(); g.position.set(...pos); g.scale.setScalar(sc); Wd.add(g); const base = pos[1];
  const pole = cyl(.035, .035, h, 0xB09A74, { pos: [0, h / 2, 0], inkW: .008, inkColor: INK }); g.add(pole);
  const cap = ball(.06, 0xF2D98A, { pos: [0, h + .02, 0], ink: false }); g.add(cap);
  const piv = new THREE.Group(); piv.position.set(0, h - .22, 0); g.add(piv); const cloth = box(.7, .4, .03, color, { pos: [.35, 0, 0], inkW: .01, inkColor: 0x1B3A6A }); piv.add(cloth);
  return { g,
    pop(k) { g.scale.setScalar(Math.max(sc * ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; },
    plant(k) { g.position.y = base + 3.4 * (1 - ease.out(clamp(k, 0, 1))); g.visible = k > .01; },
    wave(t, amp, ph) { amp = amp === undefined ? 1 : amp; piv.rotation.y = Math.sin(t * 3 + (ph || 0)) * .22 * amp; cloth.rotation.z = Math.sin(t * 4.1 + (ph || 0)) * .06 * amp; },
    tall(k) { const H = h * (1 + .55 * clamp(k, 0, 1)); pole.scale.y = H / h; pole.position.y = H / 2; cap.position.y = H + .02; piv.position.y = H - .22; } };
}

// ---------- the field: raised meadow slab, cut at the front to show soil ----------
export function field(Wd) {
  const g = new THREE.Group(); Wd.add(g); const zc = (ZF + ZB) / 2, D = ZF - ZB;
  g.add(box(2 * XW, 1.0, D, PAL.soil, { pos: [0, .5, zc], inkW: .015, inkColor: 0x6A4526 }));
  g.add(box(2 * XW + .12, GY - 1.0, D + .12, PAL.meadow, { pos: [0, 1.0 + (GY - 1.0) / 2, zc + .03], inkW: .012, inkColor: 0x4F8A45 }));
  // soil strata + pebbles on the cut face
  [[.25, 0x946440], [.55, 0xB68758], [.8, 0x946440]].forEach(([y, c], i) => g.add(box(2 * XW - .3, .035, .02, c, { pos: [i % 2 ? .4 : -.3, y, ZF + .012], ink: false, cast: false })));
  const r = rng(5); for (let i = 0; i < 18; i++) { const p = ball(.05 + r() * .06, i % 2 ? 0x8A5E3A : 0xC49A6C, { pos: [(r() - .5) * 2 * (XW - .4), .1 + r() * .8, ZF + .02], scale: [1, .8, .25], ink: false, cast: false }); g.add(p); }
  // mown stripes on the grass
  for (let k = 0; k < 6; k++) g.add(box(2 * XW - .2, .006, .55, 0x8CC47A, { pos: [0, GY + .006, ZB + .6 + k * 0.95], ink: false, cast: false }));
  return { g };
}

// ---------- tree: trunk + 3 crown balls; grow / wither / ribbon / sway ----------
const CROWN = [0x4F9A4A, 0x5BA655, 0x47904A], GREY = C(0x9A9686);
export function tree(Wd, x, z, o) {
  o = o || {}; const s = o.s || 1, y0 = o.y === undefined ? GY : o.y, H = 1.3 * s;
  const g = new THREE.Group(); g.position.set(x, y0, z); if (o.rotZ) g.rotation.z = o.rotZ; Wd.add(g);
  const body = new THREE.Group(); g.add(body);
  const trunk = cyl(.1 * s, .16 * s, H, PAL.trunk, { pos: [0, H / 2, 0], inkW: .012 * Math.max(s, .5), inkColor: 0x4A2D18 }); body.add(trunk);
  const crown = new THREE.Group(); body.add(crown);
  const defs = [[0, .55, 0, .62], [-.42, .3, .12, .46], [.44, .28, -.06, .48]];
  const cm = defs.map((d, i) => { const m = ball(d[3] * s, CROWN[i], { pos: [d[0] * s, d[1] * s, d[2] * s], inkW: .02 * Math.max(s, .5), inkColor: 0x2F6B33 }); crown.add(m); return m; });
  const rb = new THREE.Group(); g.add(rb); const rr = .165 * s;
  const ring = mesh(new THREE.TorusGeometry(rr, .045 * s + .008, 10, 28), toon(BLUE), { rot: [Math.PI / 2, 0, 0], inkW: .008, inkColor: 0x1B3A6A }); rb.add(ring);
  rb.add(box(.07 * s + .01, .24 * s, .03, BLUE, { pos: [0, -.12 * s, rr + .02], rot: [.15, 0, .1], inkW: .006, inkColor: 0x1B3A6A }));
  rb.visible = false;
  const ph = x * 3.1 + z * 1.7; const base = cm.map(m => m.material.color.clone());
  const st = { k: 0, p: 0, rk: 0, rd: 0, t: 0 };
  const T = { g, s, crown, cm,
    apply() {
      const u1 = ease.out(prog(st.k, 0, .55)), u2 = ease.out(prog(st.k, .4, 1)), p = st.p, w = sm(p, .25, .8);
      trunk.scale.y = Math.max(u1, 1e-4); trunk.position.y = H / 2 * u1;
      crown.position.y = H * u1 - ease.in(prog(p, .3, .85)) * .9 * s;
      crown.scale.setScalar(Math.max(u2 * (1 - ease.in(prog(p, .3, .85)) * .85), 1e-4));
      const sw = (1 - sm(p, 0, .3)) * .035;
      crown.rotation.z = sw * Math.sin(st.t * 1.3 + ph) + .5 * sm(p, .2, .7); crown.rotation.x = sw * .7 * Math.sin(st.t * 1.1 + ph * 1.7);
      cm.forEach((m, i) => m.material.color.copy(base[i]).lerp(GREY, sm(p, 0, .45)));
      if (o.rotZ) { const b = Math.max(1 - ease.in(prog(p, .5, 1)), 1e-4); body.scale.setScalar(b); body.position.y = 0; } else { body.position.y = -(H + .4) * ease.in(prog(p, .55, 1)); }
      g.visible = st.k > .004 && p < .995;
      const ry = .5 * s * u1, k = clamp(st.rk, 0, 1), d = st.rd;
      const y = lerp(ry + (1 - ease.out(k)) * .9, .06, ease.in(prog(d, 0, .6)));
      rb.position.y = y; rb.scale.setScalar(Math.max(lerp(2.4, 1, ease.out(k)) * lerp(1, 1.5, ease.in(prog(d, 0, .6))) * (1 - prog(d, .75, 1)), 1e-4));
      rb.visible = k > .01 && d < .995;
    },
    set(k) { st.k = k; T.apply(); }, wither(p) { st.p = p; T.apply(); }, rib(k) { st.rk = k; T.apply(); }, ribDrop(d) { st.rd = d; T.apply(); }, sway(t) { st.t = t; T.apply(); } };
  T.apply(); return T;
}

// ---------- roots in the cutaway front face ----------
const ROOT = 0x8A5A3B;
export function roots(Wd, x, o) {
  o = o || {}; const L = o.left || 0, R = o.right || 0, z = ZF + .035, segs = [];
  const add = (x0, y0, x1, y1, w, a, b) => {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), gp = new THREE.Group(); gp.position.set(x + x0, GY - .03 + y0, z); gp.rotation.z = Math.atan2(-dx, dy); Wd.add(gp);
    gp.add(cyl(w * .75, w, len, ROOT, { pos: [0, len / 2, 0], inkW: .008, inkColor: 0x4A2D18, cast: false })); gp.add(ball(w * 1.05, ROOT, { pos: [0, len, 0], ink: false, cast: false }));
    segs.push({ gp, a, b });
  };
  add(0, 0, 0, -.5, .06, 0, .25); add(0, -.5, .07, -.88, .05, .2, .4);
  [[R, 1], [-L, -1]].forEach(([ext, sgn]) => { if (!ext) return; const e = Math.abs(ext) * sgn;
    add(0, -.12, e * .35, -.4, .05, .1, .45); add(e * .35, -.4, e * .7, -.56, .045, .4, .75); add(e * .7, -.56, e, -.5, .04, .7, 1); add(e * .5, -.5, e * .58, -.86, .03, .55, .85); });
  return { set(k) { segs.forEach(s => { const u = prog(k, s.a, s.b); s.gp.scale.y = Math.max(u, 1e-4); s.gp.visible = u > .005; }); } };
}

// ---------- blue (or white) ground patch with soft outline, spreads in ----------
function hull(P) {
  P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = []; for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  const up = []; for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  up.pop(); lo.pop(); return lo.concat(up);
}
export function blueGround(Wd, pts, o) {
  o = o || {}; const r = o.r || 1.2, col = o.color === undefined ? BLUE : o.color, opa = o.opacity === undefined ? .5 : o.opacity;
  const P = []; pts.forEach(p => { for (let i = 0; i < 20; i++) { const a = i / 20 * 2 * Math.PI; P.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r]); } });
  const H = hull(P); let cx = 0, cz = 0; H.forEach(p => { cx += p[0]; cz += p[1]; }); cx /= H.length; cz /= H.length;
  const loc = H.map(p => [p[0] - cx, -(p[1] - cz)]), N = loc.length;
  const sh = new THREE.Shape(); loc.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])); sh.closePath();
  const g = new THREE.Group(); g.position.set(cx, GY + .02, cz); Wd.add(g);
  const bm = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const fill = new THREE.Mesh(new THREE.ShapeGeometry(sh), bm(col)); fill.rotation.x = -Math.PI / 2; g.add(fill);
  const w = o.lw || .1, pos = [], idx = [];
  for (let i = 0; i < N; i++) { const pv = loc[(i - 1 + N) % N], nx = loc[(i + 1) % N], tx = nx[0] - pv[0], ty = nx[1] - pv[1], ln = Math.hypot(tx, ty) || 1; let n = [ty / ln, -tx / ln]; if (n[0] * loc[i][0] + n[1] * loc[i][1] < 0) n = [-n[0], -n[1]];
    pos.push(loc[i][0] - n[0] * w * .3, loc[i][1] - n[1] * w * .3, 0, loc[i][0] + n[0] * w * .7, loc[i][1] + n[1] * w * .7, 0);
    const a = 2 * i, b = a + 1, c = 2 * ((i + 1) % N), d = c + 1; idx.push(a, b, c, b, d, c); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); lg.setIndex(idx);
  const line = new THREE.Mesh(lg, bm(o.lineColor || 0x2557A8)); line.rotation.x = -Math.PI / 2; line.position.z = .004; line.material.opacity = 1; line.visible = false; if (o.line !== false) g.add(line);
  const c0 = C(col), cG = C(0xBFDFFF); let pp = 0, fm = 1, gl = 0;
  const T = { g, center: [cx, cz],
    apply() { g.scale.setScalar(Math.max(ease.out(clamp(pp, 0, 1)), 1e-4)); g.visible = pp > .005 && fm > .005;
      fill.material.opacity = Math.min(1, opa + .3 * gl) * sm(pp, 0, .3) * fm; fill.material.color.copy(c0).lerp(cG, gl * .6);
      const d = Math.floor(prog(pp, .35, 1) * N) * 6; lg.setDrawRange(0, d); line.visible = d > 0; line.material.opacity = fm; },
    set(p) { pp = p; T.apply(); }, fade(a) { fm = a; T.apply(); }, glow(a) { gl = a; T.apply(); } };
  T.apply(); return T;
}

// ---------- marks ----------
export function xMark(sz) {
  sz = sz || 1; const g = new THREE.Group(), mk = a => { const b = box(1.5, .17, .09, PAL.red, { ink: false }); b.material.emissive = C(0x6a1a14); b.material.emissiveIntensity = .5; b.rotation.z = a; g.add(b); }; mk(Math.PI / 4); mk(-Math.PI / 4);
  return { g, set(k) { g.scale.setScalar(sz * Math.max(ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; } };
}
export function checkMark(sz) {
  sz = sz || 1; const g = new THREE.Group(), a = box(.5, .17, .09, 0x3E9B4F, { ink: false, rot: [0, 0, -Math.PI / 4], pos: [-.3, -.12, 0] }), b = box(1.1, .17, .09, 0x3E9B4F, { ink: false, rot: [0, 0, Math.PI / 4], pos: [.2, .08, 0] });
  [a, b].forEach(m => { m.material.emissive = C(0x1a5a2a); m.material.emissiveIntensity = .5; g.add(m); });
  return { g, set(k) { g.scale.setScalar(sz * Math.max(ease.out(clamp(k, 0, 1)), 1e-4)); g.visible = k > .01; } };
}

// ---------- digit tile (ASCII digits only) ----------
export function tile(Wd, txt, pos, h) { const lb = label(Wd, txt, { size: 110, height: h || .5, bg: 'rgba(255,248,224,.95)', color: '#2a5a8a', pos }); lb.userData.s0 = lb.scale.clone(); lb.visible = false; return lb; }
export function pop(sp, k) { sp.scale.set(sp.userData.s0.x * Math.max(k, .0001), sp.userData.s0.y * Math.max(k, .0001), 1); sp.visible = k > .01; }

// ---------- countdown clock ring (from stef_32) ----------
export function makeClock(parent, o) {
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
