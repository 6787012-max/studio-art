// mn.js - shared module for the stef_31 film (the Menorah). Pure functions of t, no Math.random/Date. No Hebrew here: digits only.
import { THREE, world, box, cyl, ball, mesh, toon, label, canvasTex, ease, prog, clamp, lerp, rng } from '../../lib/stage3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const PAL = { cream: 0xF3E6C8, gold: 0xE2B43C, goldD: 0xB8871B, flame: 0xF59A23, oil: 0xB9A53A, night: 0x24345C, red: 0x8E2B2B };
export const H = 2.0;                         // lamp-cup height of the Menorah
export const LX = [-1.2, -.8, -.4, 0, .4, .8, 1.2];   // x of the seven lamps
const INK = 0x6a4a10;
const PIV_S = 1.15;
const PAIR = [{ r: .2, hb: 1.35 }, { r: .4, hb: 1.15 }, { r: .6, hb: .95 }];   // inner -> outer
const C = h => new THREE.Color(h);
export const sm = (x, a, b) => { const u = clamp((x - a) / Math.max(b - a, 1e-6), 0, 1); return u * u * (3 - 2 * u); };
const fr = x => ((x % 1) + 1) % 1;
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

// ---------- world: cream stage, gold ring on the floor, red curtain folds at the far edges, back arch ----------
export function mkWorld(o) {
  o = o || {};
  const Wd = world({ ground: null, skyTop: o.skyTop === undefined ? 0xFBF2DA : o.skyTop, skyBottom: o.skyBottom === undefined ? 0xF3E6C8 : o.skyBottom, fogColor: o.fogColor === undefined ? 0xF3E6C8 : o.fogColor,
    fogNear: o.fogNear || 16, fogFar: o.fogFar || 60, hemi: o.hemi === undefined ? 1.1 : o.hemi, sun: o.sun === undefined ? 1.05 : o.sun, sunPos: [-4, 9, 7], shadowExt: 5, hemiSky: 0xffffff, hemiGround: 0xe0cf9f });
  const fl = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshLambertMaterial({ color: o.floor === undefined ? 0xEEDDB2 : o.floor }));
  fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; Wd.add(fl); Wd.floor = fl;
  const rg = new THREE.Mesh(new THREE.RingGeometry(2.25, 2.33, 72), new THREE.MeshBasicMaterial({ color: PAL.gold })); rg.rotation.x = -Math.PI / 2; rg.position.y = .004; Wd.add(rg); Wd.floorRing = rg;
  // plinth: a low pale-gold disc the Menorah stands on (top at y = 0)
  const pl = cyl(1.55, 1.62, .1, 0xEFD58A, { pos: [0, -.05 + .004, 0], inkW: .014, inkColor: INK }); Wd.add(pl); Wd.plinth = pl;
  if (o.curtains !== false) {
    Wd.curtains = [];
    for (const sd of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(sd * (o.cx || 4.2), 0, -2.6); Wd.add(g);
      for (let k = 0; k < 5; k++) { const f = cyl(.34, .34, 6.4, [0x8E2B2B, 0x7a2424, 0x9a3333][k % 3], { ink: false, pos: [-sd * k * .32, 3.2, 0] }); f.userData.k = k; g.add(f); }
      g.add(box(2.2, .5, .9, 0x6e1f1f, { ink: false, pos: [-sd * .64, 6.4, 0] })); Wd.curtains.push(g);
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
  const Hh = o.h || 4;
  Wd.on(t => arr.forEach(a => { const u = fr((a.y0 + t * a.sp) / Hh); a.m.position.set(a.x + .15 * Math.sin(t * .4 + a.ph), .15 + u * Hh, a.z); a.m.material.opacity = .75 * Math.sin(Math.PI * u); }));
  return g;
}

// ---------- countdown clock ring (copied from stef_30) ----------
export function makeClock(parent, o) {
  o = o || {}; const R = o.R || .6, g = new THREE.Group(); g.position.set(...(o.pos || [0, 2.3, 0])); parent.add(g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R * .95, 48), new THREE.MeshBasicMaterial({ color: 0xFFF6DC, fog: false })); disc.position.z = -.02; g.add(disc);
  g.add(mesh(new THREE.TorusGeometry(R, .035, 8, 72), toon(PAL.goldD), { ink: false }));
  const segs = [], N = 72;
  for (let i = 0; i < N; i++) { const a = i / N * 2 * Math.PI; const s = new THREE.Mesh(new THREE.BoxGeometry(.05, .1, .05), new THREE.MeshBasicMaterial({ color: i % 2 ? PAL.gold : 0xF0C44E, fog: false })); s.position.set(Math.sin(a) * R * .86, Math.cos(a) * R * .86, 0); s.rotation.z = -a; s.visible = false; g.add(s); segs.push(s); }
  const hand = new THREE.Group(); const hb = box(.035, R * .75, .02, PAL.goldD, { pos: [0, R * .375, .02], ink: false }); hand.add(hb); g.add(hand);
  const dig = []; for (let n = 1; n <= 5; n++) { const lb = label({ add: x => g.add(x) }, String(n), { size: 120, bg: null, color: '#8a5a10', height: .34, pos: [0, -.02, .05] }); lb.visible = false; dig.push(lb); }
  return { g, set(k) { const n = Math.floor(k * N + 1e-6); segs.forEach((s, i) => { s.visible = i < n; }); hand.rotation.z = -k * 2 * Math.PI; const left = k <= 0 || k >= 1 ? 0 : clamp(Math.ceil((1 - k) * 5), 1, 5); dig.forEach((d, i) => { d.visible = (i + 1) === left; }); },
    fade(a) { g.scale.setScalar(Math.max(a, .0001)); g.visible = a > .01; } };
}

// ---------- a rod between two points ----------
function rodMesh(a, b, r, col, o) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = Math.max(d.length(), 1e-4);
  const m = cyl(r, r, L, col, o); m.position.copy(A).add(B).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}

// ---------- flame (teardrop, orange outside, pale core) with a soft glow ----------
export function flame(parent, o) {
  o = o || {}; const g = new THREE.Group(); parent.add(g); const s = o.s || 1;
  const mo = new THREE.MeshBasicMaterial({ color: PAL.flame, fog: false }), mi = new THREE.MeshBasicMaterial({ color: 0xFFE08A, fog: false });
  const body = new THREE.Mesh(new THREE.SphereGeometry(.05, 14, 10), mo); body.position.y = .05;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(.0485, .14, 14), mo); tip.position.y = .12;
  const ib = new THREE.Mesh(new THREE.SphereGeometry(.028, 12, 8), mi); ib.position.y = .045;
  const it = new THREE.Mesh(new THREE.ConeGeometry(.0275, .08, 12), mi); it.position.y = .085;
  g.add(body, tip, ib, it); g.scale.setScalar(s); g.visible = false;
  const gl = glow(g, PAL.flame, .6); gl.position.y = .08;
  return { g, gl, set(k, t, ph) { ph = ph || 0; k = clamp(k, 0, 1); g.visible = k > .02; const f = 1 + .07 * Math.sin(t * 13 + ph) + .04 * Math.sin(t * 23 + ph * 2);
    g.scale.set(s * k * (.95 + .05 * Math.sin(t * 17 + ph)), s * k * f, s * k); gl.set(k * (.7 + .1 * Math.sin(t * 9 + ph))); } };
}

// ---------- per-vertex colour helpers (gold with a travelling light sweep) ----------
function pArr(geo, fn) {
  const pos = geo.attributes.position, n = pos.count, p = new Float32Array(n), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i] = fn(i, pos); col[i * 3] = GOLDC.r; col[i * 3 + 1] = GOLDC.g; col[i * 3 + 2] = GOLDC.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); return { geo, p };
}
const GOLDC = C(PAL.gold), SWC = C(0xFFF3B8);
function paintTube(P, base, glowK, s, w, amt) {
  const a = P.geo.attributes.color.array, n = P.p.length, br = base.r, bg = base.g, bb = base.b;
  for (let i = 0; i < n; i++) {
    let b = glowK; if (s !== null) { const d = (P.p[i] - s) / w; b = Math.max(b, amt * Math.exp(-d * d)); }
    a[i * 3] = br + (SWC.r - br) * b; a[i * 3 + 1] = bg + (SWC.g - bg) * b; a[i * 3 + 2] = bb + (SWC.b - bb) * b;
  }
  P.geo.attributes.color.needsUpdate = true;
}

// =====================================================================================================
// The Menorah: base (3 legs), shaft, three U-shaped branch pairs, 22 cups / 11 knobs / 9 flowers, seven lamp cups with flames.
// state: grow 0..1 (rise out of nothing), explode 0..1 (parts hang apart), gather 0..1 (parts collapse to one point).
// =====================================================================================================
export function menorah(o) {
  o = o || {};
  const g = new THREE.Group(), st = { grow: 1, ex: 0, ga: 0 };
  const goldM = () => toon(0xffffff, { vertexColors: true });
  const parts = [], orns = [], lamps = [], armsInfo = [];
  const mkPart = (home, ex, kind) => { const pg = new THREE.Group(); pg.position.set(...home); g.add(pg); const p = { g: pg, home, ex, kind }; parts.push(p); return p; };
  // base
  const bP = mkPart([0, 0, 0], [0, -.55, 0], 'base');
  bP.g.add(cyl(.17, .21, .12, PAL.gold, { pos: [0, .3, 0], inkW: .012, inkColor: INK }));
  for (const a of [0, 120, 240]) { const r = a * Math.PI / 180, fx = Math.sin(r) * .62, fz = Math.cos(r) * .62;
    bP.g.add(rodMesh([0, .32, 0], [fx, .06, fz], .055, PAL.gold, { inkW: .012, inkColor: INK })); bP.g.add(ball(.075, PAL.gold, { pos: [fx, .06, fz], inkW: .012, inkColor: INK })); }
  // shaft
  const sP = mkPart([0, PIV_S, 0], [0, .45, 0], 'shaft');
  const sgeo = new THREE.CylinderGeometry(.062, .07, H - .3, 18, 60); sgeo.translate(0, (H - .3) / 2, 0);
  const shaftP = pArr(sgeo, (i, pos) => pos.getY(i) / (H - .3));
  const shaft = mesh(sgeo, goldM(), { pos: [0, .3 - PIV_S, 0], inkW: .012, inkColor: INK }); sP.g.add(shaft);
  // ornaments
  function mkOrn(type, host, local, uA, p, hostKey) {
    const og = new THREE.Group(); og.position.set(...local); host.g.add(og);
    const mat = toon(PAL.gold, { emissive: 0xFFC845, emissiveIntensity: 0 }); const ob = { type, g: og, mat, uA, p, hostKey, petals: null };
    if (type === 'cup') og.add(mesh(new THREE.CylinderGeometry(.075, .022, .1, 16), mat, { inkW: .01, inkColor: INK }));
    else if (type === 'knob') og.add(mesh(new THREE.SphereGeometry(.07, 16, 12), mat, { inkW: .01, inkColor: INK }));
    else {
      ob.petals = [];
      for (let k = 0; k < 6; k++) { const pp = new THREE.Group(); pp.rotation.z = k * Math.PI / 3; og.add(pp);
        const pm = mesh(new THREE.SphereGeometry(.045, 10, 8), mat, { inkW: .008, inkColor: INK, scale: [1.5, .8, .5] }); pm.position.x = .075; pp.add(pm); ob.petals.push(pp); }
      og.add(ball(.034, PAL.goldD, { pos: [0, 0, .02], inkW: .008, inkColor: INK }));
    }
    orns.push(ob); return ob;
  }
  const shaftKnob = [.38, .95, 1.15, 1.35, 1.65], shaftFlower = [.72, 1.25, 1.52], shaftCup = [.55, .84, 1.78, 1.9];
  const sU = y => (y - .3) / (H - .3);
  shaftKnob.forEach(y => mkOrn('knob', sP, [0, y - PIV_S, 0], sU(y), sU(y), 's'));
  shaftFlower.forEach(y => mkOrn('flower', sP, [0, y - PIV_S, .03], sU(y), sU(y), 's'));
  shaftCup.forEach(y => mkOrn('cup', sP, [0, y - PIV_S, 0], sU(y), sU(y), 's'));
  // lamp cups
  function mkLamp(parent, local, i) {
    const lg = new THREE.Group(); lg.position.set(...local); parent.add(lg);
    const cup = cyl(.105, .055, .12, PAL.gold, { pos: [0, .06, 0], inkW: .011, inkColor: INK }); cup.material.emissive = C(0xFFC845); cup.material.emissiveIntensity = 0; lg.add(cup);
    lg.add(cyl(.088, .088, .014, PAL.oil, { pos: [0, .118, 0], ink: false }));
    const wick = cyl(.014, .014, .1, 0xFFF6E0, { pos: [LX[i], H + .16, 0], ink: false }); g.add(wick);
    const fl = flame(lg, { s: 1 }); fl.g.position.y = .2; fl.set(0, 0);
    lamps[i] = { g: lg, fl, cup, wick, rest: [LX[i], H + .16, 0] };
  }
  mkLamp(sP.g, [0, H - PIV_S, 0], 3);
  // branch pairs
  for (let j = 0; j < 3; j++) for (const s of [-1, 1]) {
    const { r, hb } = PAIR[j], li = s < 0 ? 2 - j : 4 + j;
    const aP = mkPart([0, hb, 0], [s * (.4 + .3 * j), .25 + .12 * j, 0], 'arm');
    const pts = []; const NS = 28, NV = 10;
    for (let i = 0; i <= NS; i++) { const ph = Math.PI * i / NS; pts.push(new THREE.Vector3(s * r * (1 - Math.cos(ph)), -r * Math.sin(ph), 0)); }
    for (let i = 1; i <= NV; i++) pts.push(new THREE.Vector3(s * 2 * r, (H - hb) * i / NV, 0));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), TS = 120, RS = 10;
    const geo = new THREE.TubeGeometry(curve, TS, .042, RS, false), pa = (hb - .3) / (H - .3);
    const P = pArr(geo, i => pa + (1 - pa) * (Math.floor(i / (RS + 1)) / TS));
    const arm = mesh(geo, goldM(), { inkW: .011, inkColor: INK }); aP.g.add(arm);
    const L = curve.getLength(), Ls = Math.PI * r, uO = y => clamp((Ls + (y - hb)) / L, 0, .98);
    const info = { P, arm, part: aP, idx: li, pair: j, s, TS, RS, key: 'a' + li };
    armsInfo.push(info);
    const orn = (type, y, dz) => { const u = uO(y); mkOrn(type, aP, [s * 2 * r, y - hb, dz || 0], u, pa + (1 - pa) * u, info.key); };
    orn('knob', H - .52); orn('flower', H - .4, .03); orn('cup', H - .28); orn('cup', H - .18); orn('cup', H - .08);
    mkLamp(aP.g, [s * 2 * r, H - hb, 0], li);
  }
  // ---------- layout from state ----------
  const CT = [0, .45, 0];
  function layout() {
    const k = st.grow, e = ease.io(st.ex), ga = ease.io(st.ga);
    const gb = ease.out(prog(k, 0, .18)), gs = ease.io(prog(k, .08, .5)), ak = [0, 1, 2].map(j => ease.io(prog(k, .4 + .07 * j, .64 + .07 * j)));
    const lk = i => ease.out(prog(k, .8 + .04 * Math.abs(i - 3), .88 + .04 * Math.abs(i - 3)));
    shaft.scale.y = Math.max(gs, 1e-4);
    armsInfo.forEach(a => { const kk = ak[a.pair]; a.part.grow = kk; a.arm.geometry.setDrawRange(0, Math.floor(kk * a.TS) * a.RS * 6); a.arm.visible = kk > .001; });
    parts.forEach(p => {
      let gv = 1; if (p.kind === 'base') gv = gb; else if (p.kind === 'shaft') gv = k > .08 ? 1 : 0; else gv = p.grow > .001 ? 1 : 0;
      const sc = Math.max(gv, 1e-4) * (1 - .96 * ga);
      p.g.position.set(p.home[0] + p.ex[0] * e, p.home[1] + p.ex[1] * e, p.home[2] + p.ex[2] * e);
      p.g.position.x = lerp(p.g.position.x, CT[0], ga); p.g.position.y = lerp(p.g.position.y, CT[1], ga); p.g.position.z = lerp(p.g.position.z, CT[2], ga);
      p.g.scale.setScalar(sc); p.g.visible = gv > .001 && ga < .995;
    });
    orns.forEach(ob => { const hg = ob.hostKey === 's' ? gs : (armsInfo.find(a => a.key === ob.hostKey).part.grow || 0); ob.g.scale.setScalar(Math.max(ease.out(prog(hg, ob.uA, ob.uA + .08)), 1e-4)); });
    lamps.forEach((l, i) => { l.g.scale.setScalar(Math.max(lk(i), 1e-4)); l.wick.visible = k > .985 && st.ex < .001 && st.ga < .001 && !l.wickHide; });
  }
  const M = { g, parts, orns, lamps, st,
    grow(k) { st.grow = clamp(k, 0, 1); layout(); }, explode(e) { st.ex = clamp(e, 0, 1); layout(); }, gather(a) { st.ga = clamp(a, 0, 1); layout(); },
    lamp(i, k, t) { lamps[i].fl.set(k, t, i * 1.7); },
    lampShine(i, k) { lamps[i].cup.material.emissiveIntensity = k * .8; },
    lampTop(i) { return [LX[i], H + .2, 0]; },
    wick(i, o2) { const w = lamps[i].wick; w.visible = o2.vis !== false; w.position.set(...(o2.pos || lamps[i].rest)); w.rotation.z = o2.rot || 0; w.material.color.setHex(o2.dark ? 0x3b2a1a : 0xFFF6E0); lamps[i].wickHide = o2.vis === false; },
    orn(type, k) { orns.forEach(ob => { if (ob.type === type) ob.mat.emissiveIntensity = k * .9; }); },
    ornAll(k) { orns.forEach(ob => { ob.mat.emissiveIntensity = k * .9; }); },
    ornSweep(s, w, amt) { orns.forEach(ob => { const d = (ob.p - s) / w; ob.mat.emissiveIntensity = amt * Math.exp(-d * d) * .9; }); },
    flowerOpen(k) { k = clamp(k, 0, 1); orns.forEach(ob => { if (ob.type === 'flower') ob.petals.forEach(pp => { pp.children[0].position.x = .075 * k; pp.scale.setScalar(.25 + .75 * k); }); }); },
    ornWorld() { g.updateMatrixWorld(true); return orns.map(ob => { const v = new THREE.Vector3(); ob.g.getWorldPosition(v); return { type: ob.type, x: v.x, y: v.y, z: v.z }; }); },
    paint(o2) { o2 = o2 || {}; const s = o2.sweep === undefined ? null : o2.sweep, w = o2.w || .1, amt = o2.amt === undefined ? 1 : o2.amt, gk = o2.glow || 0, tint = o2.tint || {};
      paintTube(shaftP, tint[3] === undefined ? GOLDC : C(tint[3]), gk, s, w, amt);
      armsInfo.forEach(a => paintTube(a.P, tint[a.idx] === undefined ? GOLDC : C(tint[a.idx]), gk, s, w, amt)); },
  };
  layout(); M.paint();
  return M;
}

// ---------- gold block ----------
export function goldBlock() {
  const g = new THREE.Group(); const body = mesh(new RoundedBoxGeometry(1, 1, 1, 4, .09), toon(PAL.gold, { emissive: 0xE2B43C, emissiveIntensity: .2 }), { inkW: .014, inkColor: INK });
  g.add(body); const gl = glow(g, 0xFFD060, 3.2); gl.position.y = .5; gl.renderOrder = -1;
  let hh = .9;
  return { g, body, set(w, h, d) { w = Math.max(w, 1e-4); h = Math.max(h, 1e-4); d = Math.max(d, 1e-4); body.scale.set(w, h, d); body.position.y = h / 2; gl.position.y = h / 2; hh = h; },
    emi(k) { body.material.emissiveIntensity = k; }, glow(a) { gl.set(a); }, top() { return hh; } };
}

// ---------- floating gold hammer (no hand): origin = the middle of the striking face ----------
export function hammer() {
  const g = new THREE.Group(); g.add(box(.42, .22, .24, PAL.goldD, { pos: [0, .11, 0], inkW: .012, inkColor: INK }));
  g.add(box(.46, .05, .26, PAL.gold, { pos: [0, .01, 0], inkW: .008, inkColor: INK }));
  const hd = cyl(.032, .032, .85, PAL.oil, { inkW: .01, inkColor: INK }); hd.position.set(.2, .6, 0); hd.rotation.z = -.42; g.add(hd);
  return g;
}
// ---------- spark rings ----------
export function sparks(parent, n) {
  const rings = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(.2, .018, 8, 40), new THREE.MeshBasicMaterial({ color: 0xFFE27A, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.visible = false; m.renderOrder = 4; parent.add(m);
    const fl = glow(parent, 0xFFD25A, 1.0); rings.push({ m, fl }); }
  return { update(t, hits) { rings.forEach((r, i) => { const h = hits[i]; if (!h) { r.m.visible = false; r.fl.set(0); return; } const u = (t - h.t) / .5;
    if (u < 0 || u > 1) { r.m.visible = false; r.fl.set(0); return; } r.m.visible = true; r.m.position.set(h.x, h.y, h.z); r.m.scale.setScalar(.35 + u * 1.9); r.m.material.opacity = Math.pow(1 - u, 1.4) * .95;
    r.fl.position.set(h.x, h.y, h.z + .05); r.fl.set((1 - u) * .8); }); } };
}

// ---------- the forge: block -> tall bar -> bar with arms -> full Menorah, one hammer tap per step ----------
const bdim = q => { const bar = sm(q, 0, .22), f = 1 - sm(q, .32, .5); return { w: lerp(1.0, .24, bar) * f, h: lerp(.9, 1.7, bar) * f, d: lerp(.7, .24, bar) * f, f }; };
const hitY = q => { const b = bdim(q); const shaft = q > .08 ? .3 + (H - .3) * ease.io(prog(q, .08, .5)) : 0; return Math.max(b.h, shaft) + (q > .85 ? .14 : 0); };
export function qOf(taps, t) { const n = taps.length; let q = 0; taps.forEach(T => { q += ease.out(prog(t, T, T + .28)) / n; }); return clamp(q, 0, 1); }
export function forge(o, t) {
  const taps = o.taps, n = taps.length, P = n > 1 ? taps[1] - taps[0] : 1, q = qOf(taps, t), b = bdim(q);
  const bs = o.blkScale === undefined ? 1 : o.blkScale; o.blk.set(b.w * bs, b.h * bs, b.d * bs); o.blk.g.visible = b.f * bs > .01; o.blk.glow(.5 * b.f);
  if (!o.noGrow) o.M.grow(q);
  const u = (t - taps[0]) / P; let off;
  if (u <= -.4) off = 1; else {
    let v; if (u < 0) v = u + 1; else { const last = n - 1; if (u > last) off = ease.out(clamp((u - last) / .8, 0, 1)); else v = u - Math.floor(u + 1e-9); }
    if (off === undefined) off = v < .6 ? ease.out(v / .6) : 1 - ease.in((v - .6) / .4);
  }
  const ap = ease.out(prog(t, taps[0] - 1.4, taps[0] - .8)) * (1 - ease.in(prog(t, taps[n - 1] + 1.0, taps[n - 1] + 1.8)));
  const y = hitY(q);
  o.ham.position.set(.05, y + .02 + .55 * off, .25); o.ham.rotation.z = -.3 * off + .1; o.ham.scale.setScalar(Math.max(ap, 1e-4)); o.ham.visible = ap > .01;
  o.sp.update(t, taps.map(T => ({ t: T, x: 0, y: hitY(qOf(taps, T - .01)) + .02, z: .3 })));
  return q;
}

// ---------- transparent lamp cup with olive oil, wick and flame ----------
export function lampCup(o) {
  o = o || {}; const g = new THREE.Group(), R = .5, Hc = .7;
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R * .94, Hc, 48, 1, true), toon(0xFFF6DC, { transparent: true, opacity: .26, side: THREE.DoubleSide, depthWrite: false })); wall.position.y = Hc / 2 + .06; wall.renderOrder = 2; g.add(wall);
  g.add(cyl(R * .94, R * 1.0, .06, PAL.gold, { pos: [0, .03, 0], inkW: .014, inkColor: INK }));
  const rim = mesh(new THREE.TorusGeometry(R, .028, 8, 56), toon(PAL.gold), { pos: [0, Hc + .06, 0], rot: [Math.PI / 2, 0, 0], inkW: .01, inkColor: INK }); g.add(rim);
  const og = new THREE.CylinderGeometry(R * .88, R * .84, 1, 40); og.translate(0, .5, 0);
  const oil = new THREE.Mesh(og, toon(PAL.oil, { transparent: true, opacity: .88, emissive: 0x6b5f1a, emissiveIntensity: .25 })); oil.position.y = .06; g.add(oil);
  const wick = cyl(.024, .024, Hc + .08, 0xFFF6E0, { pos: [0, .06 + (Hc + .08) / 2, 0], ink: false }); g.add(wick);
  const fl = flame(g, { s: 3.2 }); fl.g.position.y = Hc + .15;
  return { g, oil, fl, setOil(k) { k = clamp(k, 0, 1); oil.scale.y = Math.max(.02, Hc * .93 * k); }, setFlame(k, t) { fl.set(k, t, 0.4); }, topY: Hc + .15 };
}

// ---------- small measure jug (half measure). size 1 = half, ~1.45 = full ----------
export function halfMeasure(o) {
  o = o || {}; const g = new THREE.Group();
  const prof = [[0, 0], [.1, 0], [.125, .04], [.13, .14], [.11, .22], [.06, .27], [.05, .33], [.075, .36]].map(a => new THREE.Vector2(a[0], a[1]));
  g.add(mesh(new THREE.LatheGeometry(prof, 28), toon(PAL.gold, { side: THREE.DoubleSide }), { inkW: .01, inkColor: INK }));
  g.add(mesh(new THREE.TorusGeometry(.075, .016, 8, 20, Math.PI), toon(PAL.goldD), { pos: [.14, .2, 0], rot: [0, 0, -Math.PI / 2], inkW: .008, inkColor: INK }));
  const bar = box(.06, 1, .012, PAL.oil, { pos: [0, 0, .132], ink: false }); g.add(bar);
  const api = { g, setFill(f) { f = clamp(f, 0, 1); bar.scale.y = Math.max(.001, .2 * f); bar.position.y = .03 + .1 * f; bar.visible = f > .01; } };
  api.setFill(o.fill === undefined ? .5 : o.fill); return api;
}

// ---------- a dull "wrong" Menorah built from separate pieces with gaps and bolts ----------
export function ghostMenorah() {
  const g = new THREE.Group(), pcs = [], r = rng(77), mats = [];
  const dm = () => { const m = toon(0xA79F7E); mats.push(m); return m; };
  const bm = toon(0x5a4f35);
  const addP = (obj, home, dirK) => { obj.position.set(...home); g.add(obj); pcs.push({ obj, home, dir: [(r() - .5) * 2 * (dirK || 1), (r() - .25) * 1.6 * (dirK || 1), (r() - .5) * 1.4 * (dirK || 1)], spin: [(r() - .5) * 1.4, (r() - .5) * 1.4, (r() - .5) * 1.4] }); };
  const rodP = (a, b, rad, shrink) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = Math.max(d.length(), 1e-4); const w = new THREE.Group();
    const m = mesh(new THREE.CylinderGeometry(rad, rad, L * shrink, 14), dm(), { inkW: .01, inkColor: 0x4a4430 }); w.add(m); w.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); addP(w, A.clone().add(B).multiplyScalar(.5).toArray()); };
  const bolt = p => addP(mesh(new THREE.SphereGeometry(.05, 10, 8), bm, { inkW: .006, inkColor: 0x2a2418 }), p, .6);
  // base
  addP(mesh(new THREE.CylinderGeometry(.17, .21, .12, 16), dm(), { inkW: .01, inkColor: 0x4a4430 }), [0, .3, 0]);
  for (const a of [0, 120, 240]) { const q = a * Math.PI / 180, fx = Math.sin(q) * .62, fz = Math.cos(q) * .62; rodP([0, .3, 0], [fx, .06, fz], .055, .8); bolt([fx * .5, .18, fz * .5]); }
  // shaft: 7 pieces
  const SL = (H - .3) / 7; for (let i = 0; i < 7; i++) { addP(mesh(new THREE.CylinderGeometry(.062, .07, SL * .78, 14), dm(), { inkW: .01, inkColor: 0x4a4430 }), [0, .3 + SL * (i + .5), 0]); if (i < 6) bolt([0, .3 + SL * (i + 1), .05]); }
  // arms: 8 chunks each
  PAIR.forEach(({ r: rr, hb }) => { for (const s of [-1, 1]) {
    const pts = []; for (let i = 0; i <= 24; i++) { const ph = Math.PI * i / 24; pts.push([s * rr * (1 - Math.cos(ph)), hb - rr * Math.sin(ph), 0]); }
    for (let i = 1; i <= 8; i++) pts.push([s * 2 * rr, hb + (H - hb) * i / 8, 0]);
    for (let c = 0; c < 8; c++) { rodP(pts[c * 4], pts[c * 4 + 4], .042, .74); if (c < 7) bolt(pts[c * 4 + 4]); }
    bolt([s * .03, hb, .03]);
  } });
  for (let i = 0; i < 7; i++) addP(mesh(new THREE.CylinderGeometry(.105, .055, .11, 14), dm(), { inkW: .01, inkColor: 0x4a4430 }), [LX[i], H + .13, 0]);
  return { g, set(drift, shrink) { const sc = Math.max(1 - clamp(shrink, 0, 1), 1e-4); pcs.forEach(p => { const d = ease.io(clamp(drift, 0, 1)); p.obj.position.set(p.home[0] + p.dir[0] * d * .9, p.home[1] + p.dir[1] * d * .9, p.home[2] + p.dir[2] * d * .9);
    p.obj.rotation.set(p.spin[0] * d, p.spin[1] * d, p.spin[2] * d); p.obj.scale.setScalar(sc); }); g.visible = shrink < .995; } };
}
// red cross made of two thin red boxes
export function redX() {
  const g = new THREE.Group(); const mk = a => { const b = box(2.2, .16, .08, PAL.red, { ink: false }); b.material.emissive = C(0x5a1010); b.material.emissiveIntensity = .5; b.rotation.z = a; g.add(b); };
  mk(Math.PI / 4); mk(-Math.PI / 4); return { g, set(k) { g.scale.setScalar(Math.max(ease.out(k), 1e-4)); g.visible = k > .01; } };
}

// ---------- bowl on a pedestal (for the dark wicks) ----------
export function bowl() {
  const g = new THREE.Group(); g.add(cyl(.1, .2, .85, PAL.gold, { pos: [0, .425, 0], inkW: .012, inkColor: INK })); g.add(cyl(.28, .28, .04, PAL.goldD, { pos: [0, .02, 0], inkW: .012, inkColor: INK }));
  const prof = [[0, 0], [.12, 0], [.27, .07], [.34, .2], [.31, .2], [.25, .16], [.1, .06], [0, .06]].map(a => new THREE.Vector2(a[0], a[1]));
  const b = mesh(new THREE.LatheGeometry(prof, 32), toon(PAL.gold, { side: THREE.DoubleSide }), { pos: [0, .85, 0], inkW: .012, inkColor: INK }); g.add(b);
  const pile = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), toon(0x3b2a1a)); pile.position.y = .96; pile.scale.set(1, .3, 1); g.add(pile);
  return { g, topY: .98, setPile(k) { pile.scale.set(Math.max(k, .01), .3 * Math.max(k, .01), Math.max(k, .01)); pile.visible = k > .01; } };
}

// ---------- sky dome: phase 0 day, 1 dusk, 2 night (stars), 3 dawn, 4 day again ----------
const SPH = [
  { top: 0xFBF2DA, bot: 0xF3E6C8, fl: 0xEEDDB2, hemi: 1.1, sun: 1.05, hc: 0xffffff, sc: 0xFFF1DC },
  { top: 0xE9A672, bot: 0xF8D9A0, fl: 0xE0BF8E, hemi: .95, sun: .85, hc: 0xFFE2C0, sc: 0xFFC890 },
  { top: 0x24345C, bot: 0x3A4A78, fl: 0x5a6590, hemi: .66, sun: .3, hc: 0x9fb0e8, sc: 0x9fb0e8 },
  { top: 0xF2B98F, bot: 0xFFE6B8, fl: 0xF0D9A8, hemi: 1.0, sun: .9, hc: 0xFFE9CC, sc: 0xFFD9A8 },
];
export function skyDome(Wd) {
  const stars = []; const gs = new THREE.Group(); Wd.add(gs);
  for (let i = 0; i < 120; i++) { const a = (Math.sin(i * 12.9898) * 43758.5453) % 1, b = (Math.sin(i * 78.233) * 24634.6345) % 1, m = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 5), new THREE.MeshBasicMaterial({ color: 0xFFF6D0, transparent: true, opacity: 0, fog: false }));
    m.position.set(Math.abs(a) * 110 - 55, 5 + Math.abs(b) * 30, -58); m.scale.setScalar(.1 + Math.abs(a * b) * .45); gs.add(m); stars.push(m); }
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1.7, 24, 16), new THREE.MeshBasicMaterial({ color: 0xFFF4D0, fog: false })); moon.visible = false; Wd.add(moon);
  const mg = glow(Wd, 0xFFF0C0, 9); mg.visible = false;
  const col = (ph, key) => { const i = Math.floor(ph) % 4, j = (i + 1) % 4, u = ph - Math.floor(ph), e = u * u * (3 - 2 * u); return C(SPH[i][key]).lerp(C(SPH[j][key]), e); };
  const num = (ph, key) => { const i = Math.floor(ph) % 4, j = (i + 1) % 4, u = ph - Math.floor(ph), e = u * u * (3 - 2 * u); return lerp(SPH[i][key], SPH[j][key], e); };
  return { night: ph => sm(ph, 1.4, 2.0) * (1 - sm(ph, 2.6, 3.3)),
    set(ph, t, moonU) {
      const top = col(ph, 'top'), bot = col(ph, 'bot'); Wd.sky.material.uniforms.top.value.copy(top); Wd.sky.material.uniforms.bot.value.copy(bot); Wd.scene.fog.color.copy(bot); Wd.floor.material.color.copy(col(ph, 'fl'));
      Wd.hemi.intensity = num(ph, 'hemi'); Wd.hemi.color.copy(col(ph, 'hc')); Wd.sun.intensity = num(ph, 'sun'); Wd.sun.color.copy(col(ph, 'sc'));
      const ns = sm(ph, 1.4, 2.0) * (1 - sm(ph, 2.6, 3.3)); stars.forEach((m, i) => { m.material.opacity = ns * (.6 + .4 * Math.sin(t * 2 + i)); m.visible = ns > .01; });
      if (moonU === undefined || moonU === null) { moon.visible = false; mg.visible = false; }
      else { const a = Math.PI * (1 - moonU), x = Math.cos(a) * 24, y = 4 + Math.sin(a) * 18; moon.position.set(x, y, -50); moon.visible = true; mg.position.set(x, y, -49); mg.set(.6 * Math.max(ns, .3)); }
    } };
}
// ---------- snowflakes ----------
export function snow(Wd, n, seed) {
  const r = rng(seed || 3), g = new THREE.Group(), arr = []; Wd.add(g); const geo = new THREE.SphereGeometry(1, 6, 5);
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0, depthWrite: false, fog: false })); m.scale.setScalar(.025 + r() * .035); g.add(m);
    arr.push({ m, x: (r() - .5) * 11, z: lerp(-5, 1.5, r()), sp: .1 + r() * .08, ph: r(), sw: r() * 6 }); }
  return { update(t, gain) { arr.forEach(a => { const u = fr(t * a.sp + a.ph); a.m.position.set(a.x + .25 * Math.sin(t * .8 + a.sw), 5.6 - u * 6, a.z); a.m.material.opacity = gain * .85 * Math.sin(Math.PI * clamp(u, 0, 1)); a.m.visible = gain > .01; }); } };
}
