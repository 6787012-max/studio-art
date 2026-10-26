// lp.js - shared module for the stef_30 film: golden table, loaf stacks, tubes, 7-day ring, clock, candles, steam, air, light.
// Everything is a pure function of t (no Math.random / Date). No Hebrew in this file; digits only.
import { THREE, world, box, cyl, mesh, toon, label, canvasTex, ease, prog, clamp, lerp, rng } from '../../lib/stage3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const PAL = { cream: 0xF3E6C8, gold: 0xE2B43C, goldD: 0xB8871B, loaf: 0xC98A4B, crust: 0xA4652F, red: 0x8E2B2B, air: 0x7EC8E3 };
export const TOP = 0.78;                    // table top height
export const LOAF = { w: .62, h: .085, d: .36 };
export const GAP = .07;                     // gap between loaves while tubes are inside
const INK = 0x5a3d10;
const C = h => new THREE.Color(h);
export const sm = (x, a, b) => { const u = clamp((x - a) / Math.max(b - a, 1e-6), 0, 1); return u * u * (3 - 2 * u); };
const fr = x => ((x % 1) + 1) % 1;
const bx = (w, h, d, col, o) => box(w, h, d, col, Object.assign({ inkW: .012, inkColor: INK }, o));
const cy = (rt, rb, h, col, o) => cyl(rt, rb, h, col, Object.assign({ inkW: .01, inkColor: INK }, o));
export const keyColor = (keys, t) => { let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++; const a = keys[i], b = keys[i + 1]; const u = clamp((t - a[0]) / Math.max(b[0] - a[0], 1e-6), 0, 1); return C(a[1]).lerp(C(b[1]), u * u * (3 - 2 * u)); };

// ---------- soft glow sprite ----------
let GT = null;
function glowTex() { if (GT) return GT; GT = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); return GT; }
export function glow(parent, color, size, o) {
  o = o || {};
  const m = new THREE.SpriteMaterial({ map: glowTex(), color, blending: o.normal ? THREE.NormalBlending : THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, opacity: 0 });
  const s = new THREE.Sprite(m); s.scale.set(size, size, 1); s.renderOrder = 3; s.visible = false; parent.add(s);
  s.set = a => { m.opacity = clamp(a, 0, 1); s.visible = a > .01; }; return s;
}

// ---------- world: cream stage, gold ring on the floor, red curtains, back arch ----------
export function mkWorld(o) {
  o = o || {};
  const Wd = world({ ground: null, skyTop: o.skyTop === undefined ? 0xFBF2DA : o.skyTop, skyBottom: o.skyBottom === undefined ? 0xF3E6C8 : o.skyBottom, fogColor: o.fogColor === undefined ? 0xF3E6C8 : o.fogColor,
    fogNear: o.fogNear || 16, fogFar: o.fogFar || 60, hemi: o.hemi === undefined ? 1.1 : o.hemi, sun: o.sun === undefined ? 1.05 : o.sun, sunPos: [-4, 9, 7], shadowExt: 5, hemiSky: 0xffffff, hemiGround: 0xe0cf9f });
  const fl = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshLambertMaterial({ color: o.floor === undefined ? 0xEEDDB2 : o.floor }));
  fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; Wd.add(fl); Wd.floor = fl;
  const rg = new THREE.Mesh(new THREE.RingGeometry(2.25, 2.33, 72), new THREE.MeshBasicMaterial({ color: PAL.gold })); rg.rotation.x = -Math.PI / 2; rg.position.y = .004; Wd.add(rg); Wd.floorRing = rg;
  if (o.curtains !== false) {
    Wd.curtains = [];
    for (const sd of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(sd * (o.cx || 3.9), 0, -2.6); Wd.add(g);
      for (let k = 0; k < 5; k++) { const f = cy(.34, .34, 6.4, [0x8E2B2B, 0x7a2424, 0x9a3333][k % 3], { ink: false, pos: [-sd * k * .32, 3.2, 0] }); f.userData.k = k; g.add(f); }
      g.add(bx(2.2, .5, .9, 0x6e1f1f, { ink: false, pos: [-sd * .64, 6.4, 0] })); Wd.curtains.push(g);
    }
    Wd.on(t => { Wd.curtains.forEach((g, i) => g.children.forEach(ch => { if (ch.userData.k !== undefined) ch.scale.x = 1 + .08 * Math.sin(t * .6 + ch.userData.k * 1.3 + i); })); });
  }
  if (o.arch !== false) { const a = new THREE.Mesh(new THREE.TorusGeometry(3.4, .07, 10, 72), new THREE.MeshBasicMaterial({ color: PAL.gold })); a.position.set(0, 3.0, -6); Wd.add(a); Wd.arch = a;
    const b = new THREE.Mesh(new THREE.TorusGeometry(2.6, .05, 10, 72), new THREE.MeshBasicMaterial({ color: 0xF0CD6A })); b.position.set(0, 3.0, -6.3); Wd.add(b); }
  return Wd;
}

// ---------- drifting gold motes (parallax depth) ----------
export function motes(Wd, n, seed, o) {
  o = o || {}; const r = rng(seed || 1), g = new THREE.Group(), arr = []; Wd.add(g);
  const geo = new THREE.SphereGeometry(1, 8, 6);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 3 ? 0xE9C25A : 0xFFF1B8, transparent: true, opacity: .7, fog: false, depthWrite: false })); m.scale.setScalar(.02 + r() * .035); g.add(m);
    arr.push({ m, x: (r() - .5) * (o.w || 9), y0: r() * (o.h || 4), z: lerp(o.z0 === undefined ? -4 : o.z0, o.z1 === undefined ? 2.5 : o.z1, r()), sp: .05 + r() * .1, ph: r() * 6.28 });
  }
  const H = o.h || 4;
  Wd.on(t => arr.forEach(a => { const u = fr((a.y0 + t * a.sp) / H); a.m.position.set(a.x + .15 * Math.sin(t * .4 + a.ph), .15 + u * H, a.z); a.m.material.opacity = .75 * Math.sin(Math.PI * u); }));
  return g;
}

// ---------- table ----------
export function makeTable(parent) {
  const g = new THREE.Group(); parent.add(g);
  g.add(bx(2.0, .08, 1.0, PAL.gold, { pos: [0, TOP - .04, 0] }));
  g.add(bx(1.9, .006, .9, 0xEBC85A, { pos: [0, TOP + .002, 0], ink: false }));
  for (const z of [-.48, .48]) g.add(bx(2.0, .035, .04, PAL.goldD, { pos: [0, TOP + .0175, z] }));
  for (const x of [-.98, .98]) g.add(bx(.04, .035, .92, PAL.goldD, { pos: [x, TOP + .0175, 0] }));
  for (const x of [-.88, .88]) for (const z of [-.38, .38]) g.add(bx(.1, TOP - .08, .1, PAL.goldD, { pos: [x, (TOP - .08) / 2, z] }));
  return g;
}
export function sideSlabs(parent, len) {
  len = len || 6; const g = new THREE.Group(); parent.add(g);
  for (const sd of [-1, 1]) { g.add(bx(len, .08, .9, 0xEBCB6E, { pos: [sd * (1.04 + len / 2), TOP - .04, 0] })); g.add(bx(.1, TOP - .08, .1, PAL.goldD, { pos: [sd * 1.15, (TOP - .08) / 2, 0] })); g.add(bx(.1, TOP - .08, .1, PAL.goldD, { pos: [sd * (len + .9), (TOP - .08) / 2, 0] })); }
  return g;
}

// ---------- loaf / stack / pair ----------
const RB = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, r);
export function loaf(o) {
  o = o || {}; const g = new THREE.Group(), W = LOAF.w, H = LOAF.h, D = LOAF.d;
  const body = mesh(RB(W, H * .8, D, .028), toon(PAL.loaf), { pos: [0, -H * .1, 0], inkW: .008, inkColor: INK });
  const cap = mesh(RB(W * .97, H * .46, D * .95, .028), toon(PAL.crust), { pos: [0, H * .27, 0], inkW: .008, inkColor: INK });
  g.add(body, cap); const spots = [], r = rng((o.seed || 1) * 31 + 7);
  if (o.spots) for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x3f5a2a : 0x2f3f22, fog: false })); s.position.set((r() - .5) * W * .8, (r() - .4) * H * .6, D / 2 + .004); s.userData.r = .018 + r() * .02; s.scale.setScalar(.0001); g.add(s); spots.push(s); }
  g.userData = { body, cap, spots, base: [C(PAL.loaf), C(PAL.crust)], dy: 0 };
  return g;
}
export function paint(l, o) {
  const u = l.userData; o = o || {};
  [u.body, u.cap].forEach((m, i) => { m.material.color.copy(u.base[i]).lerp(C(o.mixCol === undefined ? 0x888888 : o.mixCol), o.mix || 0); m.material.emissive.setHex(o.emiCol === undefined ? 0xffb347 : o.emiCol); m.material.emissiveIntensity = o.emi || 0; });
}
export function mold(l, k) { l.userData.spots.forEach((s, i) => { const q = clamp(k * 1.6 - i * .12, 0, 1); s.scale.set(.0001 + q * s.userData.r * 1.3, .0001 + q * s.userData.r, .0001 + q * s.userData.r * .4); }); }
export function ghostify(l, op) { [l.userData.body, l.userData.cap].forEach(m => { m.material.transparent = true; m.material.opacity = op; }); }
export function makeStack(parent, o) {
  o = o || {}; const g = new THREE.Group(); g.position.set(o.x || 0, o.y || 0, o.z || 0); parent.add(g); const loaves = [];
  for (let i = 0; i < (o.n || 6); i++) { const l = loaf({ spots: o.spots, seed: i + (o.seed || 0) }); g.add(l); loaves.push(l); }
  const s = { g, loaves, base: o.base || 0, layout(gap) { gap = gap || 0; loaves.forEach((l, i) => { l.position.y = s.base + LOAF.h / 2 + i * (LOAF.h + gap) + (l.userData.dy || 0); }); } };
  s.layout(0); return s;
}
export function makePair(parent, o) {
  o = o || {}; const g = new THREE.Group(); parent.add(g); g.position.set(o.x || 0, o.y === undefined ? TOP : o.y, 0); const stacks = [], trays = [], sx = o.sx || .52;
  for (const sd of [-1, 1]) {
    if (o.trays) { const t = bx(.78, .03, .46, PAL.goldD, { pos: [sd * sx, .015, 0] }); g.add(t); trays.push(t); }
    stacks.push(makeStack(g, { x: sd * sx, base: o.trays ? .03 : 0, spots: o.spots, seed: sd * 7 }));
  }
  return { g, stacks, trays, sx };
}

// ---------- hollow gold tubes + rig (slide in/out of the stacks, lie in a lane between the stacks) ----------
export function makeTube(parent) {
  const g = new THREE.Group(), L = .52;
  g.add(cy(.03, .03, L, PAL.gold, { rot: [Math.PI / 2, 0, 0] }));
  g.add(cy(.019, .019, L + .004, 0x6b4a10, { rot: [Math.PI / 2, 0, 0], ink: false }));
  parent.add(g); return g;
}
const ZO = .78;
function tpos(tb, k) {
  let x = tb.sx, y = tb.sy, z = 0;
  if (k < .35) z = ZO * ease.io(k / .35);
  else if (k < .7) { const u = ease.io((k - .35) / .35); z = ZO; x = lerp(tb.sx, tb.lx, u); y = lerp(tb.sy, tb.ly, u); }
  else { x = tb.lx; y = tb.ly; z = lerp(ZO, 0, ease.io((k - .7) / .3)); }
  return [x, y, z];
}
export function makeRig(pair, o) {
  o = o || {}; const tubes = [], base = pair.trays.length ? .03 : 0; let j = 0;
  pair.stacks.forEach((s, si) => {
    if (o.only !== undefined && o.only !== si) return;
    for (let i = 0; i < 5; i++) { const t = makeTube(pair.g); tubes.push({ t, sx: s.g.position.x, sy: base + (i + 1) * LOAF.h + i * GAP + GAP / 2, lx: -.19 + j * .0422, ly: .033 }); j++; }
  });
  return { tubes, pair,
    update(kfn, gapOverride) {
      let mn = 1; tubes.forEach((tb, i) => { const k = clamp(kfn(i), 0, 1); mn = Math.min(mn, k); const p = tpos(tb, k); tb.t.position.set(p[0], p[1], p[2]); });
      const gap = gapOverride !== undefined ? gapOverride : GAP * (1 - sm(mn, .32, .52));
      pair.stacks.forEach(s => s.layout(gap)); return gap;
    } };
}

// ---------- air streaks (blue) flowing through the tubes ----------
export function makeAir(parent, pair) {
  const g = new THREE.Group(); parent.add(g); const items = [], geo = new THREE.BoxGeometry(1, 1, 1), base = pair.trays.length ? .03 : 0;
  pair.stacks.forEach(s => { for (let i = 0; i < 5; i++) for (let k = 0; k < 2; k++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: k ? 0xBFE8F5 : 0x7EC8E3, transparent: true, opacity: 0, depthWrite: false, fog: false })); m.scale.set(.05, .05, .24); g.add(m);
    items.push({ m, x: s.g.position.x + (k ? .006 : -.006), y: base + (i + 1) * LOAF.h + i * GAP + GAP / 2, ph: k * .5 + i * .13 }); } });
  return { g, update(t, gain, speed) { speed = speed || .5; items.forEach(a => { const u = fr(t * speed + a.ph); a.m.position.set(a.x, a.y, lerp(.78, -.78, u)); a.m.material.opacity = gain * Math.sin(Math.PI * u) * .9; a.m.visible = gain > .01; }); } };
}

// ---------- seven-day ring (tiles with digits 1-7) ----------
export function sevenDays(parent, o) {
  o = o || {}; const g = new THREE.Group(), R = o.R || 1.1; g.position.set(...(o.pos || [0, 2.2, -1.5])); parent.add(g);
  g.add(mesh(new THREE.TorusGeometry(R, .025, 8, 72), toon(PAL.goldD), { ink: false }));
  const tiles = [];
  for (let i = 0; i < 7; i++) {
    const a = i * 2 * Math.PI / 7, t = new THREE.Group(); t.position.set(Math.sin(a) * R, Math.cos(a) * R, 0); g.add(t);
    const body = bx(.5, .5, .1, PAL.gold); t.add(body);
    label({ add: x => t.add(x) }, String(i + 1), { size: 90, bg: null, color: '#4a300a', height: .34, pos: [0, 0, .07] });
    tiles.push({ t, body });
  }
  const run = glow(g, 0xFFE27A, 1.1);
  return { g, tiles, R,
    lit(i, k) { const tl = tiles[i]; tl.body.material.color.copy(C(PAL.gold)).lerp(C(0xFFF0A0), k); tl.body.material.emissive.setHex(0xFFD84A); tl.body.material.emissiveIntensity = k * .7; tl.t.scale.setScalar(1 + .22 * k); },
    runner(pos, gain) { const a = pos * 2 * Math.PI / 7; run.position.set(Math.sin(a) * R, Math.cos(a) * R, .15); run.set(gain); } };
}

// ---------- countdown clock ring ----------
export function makeClock(parent, o) {
  o = o || {}; const R = o.R || .6, g = new THREE.Group(); g.position.set(...(o.pos || [0, 2.3, 0])); parent.add(g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R * .95, 48), new THREE.MeshBasicMaterial({ color: 0xFFF6DC, fog: false })); disc.position.z = -.02; g.add(disc);
  g.add(mesh(new THREE.TorusGeometry(R, .035, 8, 72), toon(PAL.goldD), { ink: false }));
  const segs = [], N = 72;
  for (let i = 0; i < N; i++) { const a = i / N * 2 * Math.PI; const s = new THREE.Mesh(new THREE.BoxGeometry(.05, .1, .05), new THREE.MeshBasicMaterial({ color: i % 2 ? PAL.gold : 0xF0C44E, fog: false })); s.position.set(Math.sin(a) * R * .86, Math.cos(a) * R * .86, 0); s.rotation.z = -a; s.visible = false; g.add(s); segs.push(s); }
  const hand = new THREE.Group(); const hb = bx(.035, R * .75, .02, PAL.goldD, { pos: [0, R * .375, .02], ink: false }); hand.add(hb); g.add(hand);
  const dig = []; for (let n = 1; n <= 5; n++) { const lb = label({ add: x => g.add(x) }, String(n), { size: 120, bg: null, color: '#8a5a10', height: .34, pos: [0, -.02, .05] }); lb.visible = false; dig.push(lb); }
  return { g, set(k) { const n = Math.floor(k * N + 1e-6); segs.forEach((s, i) => { s.visible = i < n; }); hand.rotation.z = -k * 2 * Math.PI; const left = k <= 0 || k >= 1 ? 0 : clamp(Math.ceil((1 - k) * 5), 1, 5); dig.forEach((d, i) => { d.visible = (i + 1) === left; }); },
    fade(a) { g.scale.setScalar(Math.max(a, .0001)); g.visible = a > .01; } };
}

// ---------- candle ----------
export function makeCandle(parent, o) {
  o = o || {}; const g = new THREE.Group(); g.position.set(...(o.pos || [0, 0, 0])); g.scale.setScalar(o.s || 1); parent.add(g);
  g.add(cy(.045, .06, .04, PAL.goldD, { pos: [0, .02, 0] })); g.add(cy(.028, .028, .26, 0xFFF6DF, { pos: [0, .17, 0] }));
  const fl = new THREE.Mesh(new THREE.SphereGeometry(.03, 12, 10), new THREE.MeshBasicMaterial({ color: 0xFFC23A, fog: false })); fl.position.set(0, .35, 0); fl.visible = false; g.add(fl);
  const gl = glow(g, 0xFFB347, .6); gl.position.set(0, .36, 0); const ph = o.ph || 0;
  return { g, set(k, t) { fl.visible = k > .02; fl.scale.set(.8 * k, (1.5 + .2 * Math.sin(t * 13 + ph)) * k, .8 * k); gl.set(k * (.75 + .1 * Math.sin(t * 9 + ph))); } };
}

// ---------- steam wisps ----------
export function makeSteam(parent, o) {
  o = o || {}; const g = new THREE.Group(); g.position.set(...(o.pos || [0, 0, 0])); parent.add(g); const n = o.n || 9, r = rng(o.seed || 5), w = [];
  for (let i = 0; i < n; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: o.color || 0xFFFFFF, transparent: true, depthWrite: false, opacity: 0, fog: false })); sp.renderOrder = 4; g.add(sp);
    w.push({ sp, ph: i / n, x: (r() - .5) * (o.w || .5), z: (r() - .5) * (o.d || .25), sp2: .22 + r() * .12, sw: r() * 6 }); }
  return { g, update(t, gain) { w.forEach(a => { const u = fr(t * a.sp2 + a.ph); a.sp.position.set(a.x + .06 * Math.sin(t * 1.3 + a.sw + u * 5), u * (o.h || .8), a.z); const s = (o.size || .28) * (.5 + u * 1.1); a.sp.scale.set(s, s, 1); a.sp.material.opacity = gain * .8 * Math.sin(Math.PI * u); a.sp.visible = gain > .01; }); } };
}

// ---------- descending beam of light ----------
export function makeBeam(parent) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(.5, 1.5, 3.2, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE9A0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
  m.visible = false; parent.add(m);
  m.set = a => { a = clamp(a, 0, 1); m.visible = a > .01; m.scale.y = Math.max(a, .001); m.position.set(0, TOP + 3.2 - 1.6 * a, 0); m.material.opacity = .32 * Math.min(1, a * 1.5); }; return m;
}

// ---------- circling light ring ("always") ----------
export function lightRing(parent, o) {
  o = o || {}; const g = new THREE.Group(); g.position.y = TOP + .06; parent.add(g); const n = 64, rx = o.rx || .94, rz = o.rz || .42, pts = [], geo = new THREE.SphereGeometry(1, 8, 6);
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xFFE27A, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); const a = i / n * 2 * Math.PI; m.position.set(Math.sin(a) * rx, 0, Math.cos(a) * rz); g.add(m); pts.push(m); }
  const hg = glow(g, 0xFFD25A, .9);
  return { g, update(t, gain, speed) { const head = fr(t * speed); pts.forEach((m, i) => { const d = fr(head - i / n), b = Math.exp(-d * 7); m.scale.setScalar(.016 + .03 * b); m.material.opacity = gain * (.25 + .75 * b); m.visible = gain > .01; });
    const a = head * 2 * Math.PI; hg.position.set(Math.sin(a) * rx, 0, Math.cos(a) * rz); hg.set(gain * .8); } };
}

// ---------- glowing outline on the table top (never off) ----------
export function makeOutline(parent) {
  const g = new THREE.Group(); g.position.y = TOP + .012; parent.add(g); const mats = [], mk = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, .008, d), new THREE.MeshBasicMaterial({ color: 0xFFF3B0, transparent: true, opacity: .9, fog: false })); m.position.set(x, 0, z); g.add(m); mats.push(m.material); };
  mk(1.78, .035, 0, -.4); mk(1.78, .035, 0, .4); mk(.035, .835, -.89, 0); mk(.035, .835, .89, 0);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.78, .8), new THREE.MeshBasicMaterial({ color: 0xFFE27A, transparent: true, opacity: .25, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); pl.rotation.x = -Math.PI / 2; g.add(pl); mats.push(pl.material);
  return { g, update(t) { const p = .8 + .2 * Math.sin(t * 2.2); mats.forEach((m, i) => { m.opacity = (i < 4 ? .9 : .25) * p; }); } };
}
