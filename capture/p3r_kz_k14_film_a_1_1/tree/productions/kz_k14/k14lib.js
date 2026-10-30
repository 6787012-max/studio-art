// k14lib.js - shared world + hero objects for kz_k14 ("there is no dead time"). Teal / peach / cream, flat toon, NO characters.
// Hero objects: DAY RIBBON (24 tiles), GREY GAP (hollow wire box), BET-HOUSE (open-front house) with golden DOT, CROWN LIGHT, light threads.
// Everything is a pure function of t (rng(seed) for build-time randomness only).
import { THREE, world, box, cyl, ball, mesh, toon, canvasTex, rng, clamp, lerp, ease, prog, path, D, cloud } from '../../lib/stage3d.js';
export { THREE, rng, clamp, lerp, ease, prog, path, D, cloud, canvasTex, toon, mesh };
export const PI = Math.PI, sm = ease.sm, sin = Math.sin, cos = Math.cos;
export const COL = { teal: '#3E8E8A', tealD: '#2F706D', tealL: '#7DBFBA', peach: '#F2B48C', peachD: '#E39A6E', cream: '#FFF4E0', creamD: '#EBDDC0', mint: '#CFE8E4', mintD: '#A9D1CB',
  sun: '#F2C14E', ink: '#24414A', grey: '#A9A39A', greyL: '#CBC6BD', white: '#FFFBF2', coral: '#E8736A', sky: '#7FB6DE', lilac: '#A99BD6', leaf: '#6DB38C', wood: '#C99A6B', woodD: '#9B7048', wall: '#FBE3CF' };
export const INK = 0x24414A;
const O = (o, w) => Object.assign({ inkColor: INK, inkW: w || .014 }, o);
export const bx = (w, h, d, c, o) => box(w, h, d, c, O(o));
export const cy = (rt, rb, h, c, o) => cyl(rt, rb, h, c, O(o));
export const bl = (r, c, o) => ball(r, c, O(o));
export const mm = (geo, color, o) => mesh(geo, toon(color, o && o.mat), O(o));
export const grp = (Wd, pos, rot, sc) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); if (rot) g.rotation.set(...(Array.isArray(rot) ? rot : [0, rot, 0])); if (sc) g.scale.setScalar(sc); if (Wd) Wd.add(g); return g; };
export const pop = (t, a, b, c, d) => sm(prog(t, a, b)) * (1 - (c === undefined ? 0 : sm(prog(t, c, d))));
export const elastic = k => { k = clamp(k, 0, 1); return k <= 0 ? 0 : k >= 1 ? 1 : 1 + .45 * Math.sin((k - .1) * 11) * Math.pow(1 - k, 2) * (1 - k * .2) - .02 * (1 - k); };
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, fog: false }, o || {}));
export const bm = (geo, c, o) => { const m = new THREE.Mesh(geo, BASIC(c, o)); m.userData.keep = true; return m; };
export const cm = (dur, keys) => path(keys.map(k => [k[0] * dur, k[1], k[2], k[3]]));
export const orb = (c, r, h, a0, a1, dur, fov, ly) => t => { const u = ease.io(clamp(t / dur, 0, 1)), a = lerp(a0, a1, u) * D, hh = typeof h === 'number' ? h : lerp(h[0], h[1], u), rr = typeof r === 'number' ? r : lerp(r[0], r[1], u); return { pos: [c[0] + Math.sin(a) * rr, c[1] + hh, c[2] + Math.cos(a) * rr], look: [c[0], c[1] + (ly || 0), c[2]], fov }; };
export function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
// camera-facing helper: rotate o around y so its +z looks at the camera
export const faceCam = (o, cam) => { o.rotation.y = Math.atan2(cam.position.x - o.position.x, cam.position.z - o.position.z); };

// ---------- glow ----------
let GT = null;
export function glowTex() { if (!GT) GT = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); return GT; }
export function glowSprite(color, size, opacity, o) {
  o = o || {};
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, blending: o.normal ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, depthTest: o.depthTest !== false, transparent: true, opacity: opacity === undefined ? 1 : opacity, fog: false }));
  s.scale.set(size, size, 1); s.renderOrder = o.order || 6; return s;
}
let ST = null;
export function starTex() { if (!ST) ST = canvasTex(128, 128, (g, w, h) => { g.translate(64, 64); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 60); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr;
  g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, r = i % 2 ? 9 : 60; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); }); return ST; }
export function sparkle(color, size, op) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex(), color, blending: THREE.NormalBlending, depthWrite: false, transparent: true, opacity: op === undefined ? 1 : op, fog: false })); s.scale.set(size, size, 1); s.renderOrder = 8; return s; }

// ---------- the world: bright cream ground, mint sky, soft pale hills ----------
function gTex() {
  const r = rng(11);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#FFF4E0'; g.fillRect(0, 0, w, h);
    const cs = ['#F6E9D0', '#ECF3E8', '#FCE7D6'];
    for (let i = 0; i < 220; i++) { g.fillStyle = cs[i % 3]; g.globalAlpha = .5; const s = 10 + r() * 34; g.beginPath(); g.ellipse(r() * w, r() * h, s, s * (.5 + r() * .5), r() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1; const dc = ['#CFE8E4', '#F2B48C', '#7DBFBA'];
    for (let i = 0; i < 40; i++) { g.fillStyle = dc[i % 3]; g.beginPath(); g.arc(r() * w, r() * h, 2.5 + r() * 2.5, 0, 7); g.fill(); }
  }, [60, 60]);
}
export function stageWorld(o) {
  o = o || {};
  const Wd = world(Object.assign({ skyTop: 0xBFE6E0, skyBottom: 0xFFFAEC, fogColor: 0xFFF4E0, hemi: 1.45, hemiSky: 0xffffff, hemiGround: 0xE9DCC4, sun: 1.5, sunColor: 0xfff3e0,
    fogNear: 70, fogFar: 320, shadowExt: 20, skyR: 800, sunPos: [-22, 42, 28] }, o.w || {}));
  const gm = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), toon(0xffffff, { map: gTex() }));
  gm.rotation.x = -PI / 2; gm.receiveShadow = true; Wd.add(gm); Wd.ground = gm;
  if (o.sunTarget) Wd.sun.target.position.set(...o.sunTarget);
  if (o.backdrop !== false) backdrop(Wd, o.seed || 3);
  return Wd;
}
export function backdrop(Wd, seed) {
  const r = rng(seed), cols = ['#BFE0DB', '#CFE8E4', '#D3ECE6', '#DCEFE9', '#E6F3EE'];
  for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2 + r() * .3, d = 90 + r() * 55, s = 18 + r() * 26;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 20, 12), toon(cols[i % cols.length])); m.scale.y = .38 + r() * .2; m.position.set(Math.sin(a) * d, -s * .1, Math.cos(a) * d); Wd.add(m); }
  for (let i = 0; i < 7; i++) { const a = r() * PI * 2, d = 120 + r() * 60; Wd.add(cloud({ seed: seed + i, size: 6 + r() * 4, puffs: 6, color: 0xffffff, inkColor: 0xbfd8d4, pos: [Math.sin(a) * d, 35 + r() * 25, Math.cos(a) * d], cast: false })); }
}
export function scatter(Wd, o) {   // little flowers on the ground (fills the frame)
  const r = rng(o.seed || 5), n = o.n || 50, a = o.area || [-12, 12, -12, 12], cols = o.cols || [COL.peach, COL.cream, COL.tealL, COL.coral, COL.lilac];
  for (let i = 0; i < n; i++) { const x = lerp(a[0], a[1], r()), z = lerp(a[2], a[3], r()); if (o.avoid && Math.hypot(x - o.avoid[0], z - o.avoid[1]) < o.avoid[2]) continue;
    const c = cols[Math.floor(r() * cols.length)], s = .09 + r() * .12, f = new THREE.Group(); f.position.set(x, 0, z);
    f.add(cy(.012, .012, s * 3, COL.leaf, { pos: [0, s * 1.5, 0], ink: false })); f.add(bl(s, c, { pos: [0, s * 3, 0], inkW: .008 })); Wd.add(f); }
}

// ---------- THE DOT (the dagesh): golden glowing ball ----------
export function dotObj(r) {
  r = r || .3; const g = new THREE.Group(), core = bm(new THREE.SphereGeometry(r, 18, 14), 0xFFD266), gl = glowSprite(0xFFC24A, r * 9, .8), gl2 = glowSprite(0xFFE9A8, r * 4, .9);
  g.add(core); g.add(gl); g.add(gl2); g.userData = { core, set(k) { k = clamp(k, 0, 1.4); core.scale.setScalar(.45 + .55 * Math.min(k, 1) + .1 * Math.max(0, k - 1)); gl.material.opacity = .85 * Math.min(k, 1); gl2.material.opacity = .9 * Math.min(k, 1); core.material.color.set(k < .5 ? 0xF3E1B0 : 0xFFD266); g.visible = k > .01; } };
  return g;
}

// ---------- BET-HOUSE: open-front house shape (roof bar, back wall, floor bar extending forward) + the dot inside ----------
export function betHouse(o) {
  o = o || {}; const g = new THREE.Group(), w = 2.8, h = 2.9, d = 2.2, ext = 1.3;
  g.add(bx(w, .28, d + ext, COL.teal, { pos: [0, .14, ext / 2], inkW: .018 }));                      // floor bar, extends forward (+z)
  g.add(bx(w, h, .3, COL.teal, { pos: [0, h / 2, -d / 2 + .15], inkW: .018 }));                       // back wall
  g.add(bx(w - .5, h - .6, .06, COL.cream, { pos: [0, h / 2 + .1, -d / 2 + .33], inkW: .006 }));      // cream inside
  g.add(bx(w - .5, .04, d - .45, COL.cream, { pos: [0, .3, -.1], ink: false }));
  g.add(bx(w + .6, .32, d + .3, COL.peach, { pos: [0, h + .16, .05], inkW: .018 }));                  // roof bar
  g.add(bx(.22, .9, .22, COL.tealD, { pos: [.8, h + .75, -.5], inkW: .012 }));                        // chimney
  for (const s of [-1, 1]) g.add(bx(.18, h - .02, .18, COL.tealL, { pos: [s * (w / 2 - .1), h / 2, d / 2 - .05], inkW: .012 }));   // slim front posts
  const dot = dotObj(o.dr || .3); dot.position.set(0, 1.55, 0); g.add(dot); dot.userData.set(o.k === undefined ? 1 : o.k);
  g.userData = { dot, dotAt(x, y, z) { dot.position.set(x, y, z); } };
  if (o.scale) g.scale.setScalar(o.scale);
  return g;
}

// ---------- CROWN LIGHT: golden ring with 5 rounded points, soft glow ----------
export function crown(o) {
  o = o || {}; const g = new THREE.Group(), gold = { emissive: new THREE.Color(COL.sun).multiplyScalar(.55) };
  const gm = () => ({ emissive: new THREE.Color(0xF2C14E), emissiveIntensity: .55 });
  const ring = mm(new THREE.TorusGeometry(1, .17, 12, 40), COL.sun, { mat: gm(), rot: [PI / 2, 0, 0], inkW: .02 }); g.add(ring);
  const band = mm(new THREE.CylinderGeometry(1, 1, .42, 36, 1, true), COL.sun, { mat: Object.assign(gm(), { side: THREE.DoubleSide }), pos: [0, .28, 0], inkW: .015, ink: false }); g.add(band);
  for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2; g.add(mm(new THREE.ConeGeometry(.24, 1.0, 14), COL.sun, { mat: gm(), pos: [Math.sin(a), .95, Math.cos(a)], inkW: .016, box: true })); g.add(bl(.16, '#FFE08A', { pos: [Math.sin(a), 1.5, Math.cos(a)], inkW: .01 })); }
  const gl = glowSprite(0xFFD27A, 10, .75), gl2 = glowSprite(0xFFF0C0, 4.5, .8); gl.position.y = .6; gl2.position.y = .7; g.add(gl); g.add(gl2);
  g.userData = { set(k) { k = clamp(k, 0, 1.3); gl.material.opacity = .42 * Math.min(k, 1) + .1 * Math.max(0, k - 1); gl2.material.opacity = .5 * Math.min(k, 1); gl.scale.setScalar(10 * (.85 + .15 * k)); } };
  if (o.scale) g.scale.setScalar(o.scale);
  return g;
}
// translucent light cone (apex up). set(k) opacity
export function lightBeam(h, r1, o) {
  o = o || {}; const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r0 || .3, r1, h, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0xE9C566, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.userData.keep = true; m.renderOrder = 4; m.userData.set = k => { m.material.opacity = .09 * clamp(k, 0, 1); m.visible = k > .01; }; m.userData.set(0); return m;
}
// a chain of golden beads between a(t) and b(t); k(t) 0..1 how far it has grown; alpha(t)
export function thread(Wd, o) {
  const n = o.n || 24, B = [], g = new THREE.Group(); Wd.add(g);
  for (let i = 0; i < n; i++) { const b = new THREE.Group(); b.add(bm(new THREE.SphereGeometry(.075, 8, 6), i % 3 ? 0xFFD266 : 0xFFF0C0)); b.add(glowSprite(0xFFC24A, .6, .6)); g.add(b); B.push(b); }
  Wd.on(t => { const A = o.a(t), Bp = o.b(t), k = o.k ? o.k(t) : 1; g.visible = k > .01; if (!g.visible) return;
    for (let i = 0; i < n; i++) { const f = i / (n - 1) * k, wob = Math.sin(f * 7 + t * 1.6 + (o.ph || 0)) * (o.wob === undefined ? .22 : o.wob) * Math.sin(PI * Math.min(1, f * 1.1));
      B[i].position.set(lerp(A[0], Bp[0], f) + wob, lerp(A[1], Bp[1], f), lerp(A[2], Bp[2], f) + wob * .5); B[i].scale.setScalar(Math.max(.001, (.55 + .45 * Math.sin(t * 5 + i)) * Math.min(1, (1 - i / n) * 3 + .5))); } });
  return g;
}

// ---------- DAY RIBBON: 24 equal rounded tiles (teal / peach), 2 tiles replaced by the GREY GAP ----------
export const TILE_P = 1.5;
let TG = null;
function tileGeo() { if (!TG) { TG = new THREE.ExtrudeGeometry(rrShape(1.4, 2.4, .35), { depth: .16, bevelEnabled: true, bevelSize: .05, bevelThickness: .04, bevelSegments: 2, curveSegments: 6 }); TG.rotateX(-PI / 2); } return TG; }
export function dayRibbon(o) {
  o = o || {}; const g = new THREE.Group(), tiles = [], glows = [], noGap = o.gap === false, gi = o.gap === undefined ? 11 : o.gap, GOLD = new THREE.Color(COL.sun);
  for (let i = 0; i < 24; i++) {
    const x = (i - 11.5) * TILE_P, gl = glowSprite(0xFFD27A, 3.2, 0); gl.position.set(x, .9, 0); g.add(gl); glows.push(gl);
    if (!noGap && (i === gi || i === gi + 1)) { tiles.push(null); continue; }
    const c = i % 2 ? COL.peach : COL.teal, t = mm(tileGeo(), c, { box: true, inkW: .03 }); t.position.set(x, 0, 0); t.userData.c0 = new THREE.Color(c); g.add(t); tiles.push(t);
  }
  let gap = null; if (!noGap) { gap = greyGap(); gap.g.position.set((gi + .5 - 11.5) * TILE_P, 0, 0); g.add(gap.g); }
  return { g, tiles, gap, glows, gi, P: TILE_P, x: i => (i - 11.5) * TILE_P,
    light(i, k) { k = clamp(k, 0, 1); const t = tiles[i]; if (t) { t.material.color.copy(t.userData.c0).lerp(GOLD, k * .75); t.material.emissive.copy(GOLD).multiplyScalar(.5 * k); } glows[i].material.opacity = .6 * k; },
    pop(i, k) { const t = tiles[i]; if (t) t.scale.setScalar(Math.max(.001, k)); } };
}

// ---------- GREY GAP: hollow wire-frame box (warm grey). state(): lift, tilt (lean back), open (lid hinge), glow (bars -> gold), fill (inner light) ----------
export function greyGap() {
  const w = 2.9, h = 1.1, d = 2.3, t = .11, g = new THREE.Group(), body = new THREE.Group(), lid = new THREE.Group(), bars = [], faces = [], GR = new THREE.Color(COL.grey), GOLD = new THREE.Color(COL.sun);
  g.add(body); lid.position.set(0, h, -d / 2); body.add(lid);
  const add = (sx, sy, sz, x, y, z, P) => { const b = bx(sx, sy, sz, COL.grey, { pos: [x, y, z], inkW: .014 }); (P || body).add(b); bars.push(b); return b; };
  for (const s of [-1, 1]) { add(w, t, t, 0, 0, s * d / 2); add(t, t, d, s * w / 2, 0, 0); for (const q of [-1, 1]) add(t, h, t, s * w / 2, h / 2, q * d / 2); }
  add(w, t, t, 0, 0, d, lid); add(w, t, t, 0, 0, 0, lid); for (const s of [-1, 1]) add(t, t, d, s * w / 2, 0, d / 2, lid);
  const fm = () => new THREE.MeshBasicMaterial({ color: COL.grey, transparent: true, opacity: .15, side: THREE.DoubleSide, depthWrite: false, fog: false });
  const fc = (pw, ph, x, y, z, rx, ry, P) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), fm()); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.userData.keep = true; (P || body).add(m); faces.push(m); return m; };
  fc(w, h, 0, h / 2, -d / 2, 0, 0); fc(w, h, 0, h / 2, d / 2, 0, 0); fc(d, h, -w / 2, h / 2, 0, 0, PI / 2); fc(d, h, w / 2, h / 2, 0, 0, PI / 2); fc(w, d, 0, .02, 0, -PI / 2, 0); fc(w, d, 0, 0, d / 2, -PI / 2, 0, lid);
  const fill = bm(new THREE.BoxGeometry(w - .2, h - .1, d - .2), 0xFFD266, { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }); fill.position.y = h / 2; body.add(fill);
  const glow = glowSprite(0xFFC24A, 6, 0); glow.position.y = h / 2; body.add(glow);
  const inner = new THREE.Group(); inner.position.set(0, .12, 0); body.add(inner);
  const API = { g, body, lid, inner, w, h, d, bars, faces,
    state(s) { s = s || {}; body.position.y = s.lift || 0; body.rotation.x = -(s.tilt || 0); lid.rotation.x = -(s.open || 0) * 1.9;
      const gk = clamp(s.glow || 0, 0, 1), fk = clamp(s.fill || 0, 0, 1);
      for (const b of bars) { b.material.color.copy(GR).lerp(GOLD, gk); b.material.emissive.copy(GOLD).multiplyScalar(.5 * gk); }
      for (const f of faces) { f.material.opacity = .15 + .15 * gk; f.material.color.copy(GR).lerp(GOLD, gk); }
      fill.material.opacity = .26 * fk; fill.visible = fk > .01; fill.scale.set(.25 + .75 * fk, .25 + .75 * fk, .25 + .75 * fk); glow.material.opacity = .55 * Math.max(fk, gk * .6); glow.scale.setScalar(4.5 + 2 * fk); } };
  API.state({}); return API;
}
