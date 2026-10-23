// props3d.js - procedural toon + ink props for stage3d films. 1 unit = 1 metre (a person is ~1.7 high). Warm, bright, children's-film palette.
// Every prop is  fn(Wd, { pos:[x,y,z], rot: yawRadians | [rx,ry,rz], scale: number | [x,y,z], ...own options }) -> THREE.Group  (already added to Wd).
// Anything that moves is a pure function of t, driven through Wd.on (deterministic). No ritual objects here by design (supervisor decides those).
// Props face +z (front); long things (wall, fence, bench, table) run along x.
import { THREE, box, cyl, ball, mesh, toon, canvasTex, rng, clamp, lerp, D } from './stage3d.js';

export const PAL = { wood: 0xa4713f, woodD: 0x7a5232, sand: 0xeed8ac, sandD: 0xd9bd8a, stone: 0xc2baa8, stoneD: 0xa39c8b, leaf: 0x66a64a, leaf2: 0x7db551, leafD: 0x4c8a40,
  red: 0xdc5a4c, blue: 0x4a93d8, yellow: 0xffc531, white: 0xf8f2e4, cream: 0xf3e6c8, dark: 0x3b2c22, water: 0x62b6e8, gold: 0xf2b630 };
const mk = (Wd, o, f) => { o = o || {}; const g = new THREE.Group(); f(g, o);
  if (o.pos) g.position.set(...o.pos); if (o.rot !== undefined) Array.isArray(o.rot) ? g.rotation.set(...o.rot) : (g.rotation.y = o.rot);
  if (o.scale !== undefined) Array.isArray(o.scale) ? g.scale.set(...o.scale) : g.scale.setScalar(o.scale); Wd.add(g); return g; };
const glowTex = (() => { let t = null; return () => t || (t = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,236,170,1)'); r.addColorStop(.35, 'rgba(255,210,110,.5)'); r.addColorStop(1, 'rgba(255,190,80,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); })); })();
const glow = (size, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: op === undefined ? .8 : op })); s.scale.set(size, size, 1); return s; };
const solid = c => new THREE.MeshBasicMaterial({ color: c, fog: false });

// tree: kind 0 = round, kind 1 = cone/cypress. ~4.5 m high.
export const tree = (Wd, o) => mk(Wd, o, (g, o) => {
  g.add(cyl(.15, .24, 2.2, PAL.woodD, { pos: [0, 1.1, 0] }));
  if ((o.kind || 0) === 0) [[0, 3.1, 0, 1.45], [.85, 2.6, .3, 1], [-.75, 2.7, -.3, 1.1]].forEach(([x, y, z, r], i) => g.add(ball(r, [PAL.leaf, PAL.leaf2, PAL.leafD][i], { pos: [x, y, z] })));
  else [[1.6, 1.4, 2.1], [1.25, 1.3, 3.0], [.85, 1.2, 3.9]].forEach(([r, h, y], i) => g.add(mesh(new THREE.ConeGeometry(r, h * 1.5, 12), toon([PAL.leafD, PAL.leaf, PAL.leaf2][i]), { pos: [0, y, 0] })));
});
export const bush = (Wd, o) => mk(Wd, o, g => { [[0, .4, 0, .55], [.55, .3, .1, .4], [-.5, .32, -.1, .42]].forEach(([x, y, z, r], i) => g.add(ball(r, [PAL.leaf2, PAL.leaf, PAL.leafD][i], { pos: [x, y, z], scale: [1, .8, 1] }))); });
export const rock = (Wd, o) => mk(Wd, o, (g, o) => { const r = rng(o.seed || 3);
  g.add(mesh(new THREE.DodecahedronGeometry(.65, 0), toon(o.color || PAL.stone), { pos: [0, .3, 0], scale: [1.1, .65, .85], rot: [0, r() * 6, 0] }));
  g.add(mesh(new THREE.DodecahedronGeometry(.25, 0), toon(PAL.stoneD), { pos: [.8, .1, .3], scale: [1, .6, 1], rot: [0, r() * 6, 0] })); });
// house: flat roof, Middle-East style, 5 x 3 x 4.2 m, door and windows on the +z face, small roof room. o.color = wall colour
export const house = (Wd, o) => mk(Wd, o, (g, o) => { const c = o.color || PAL.sand;
  g.add(box(5, 3, 4.2, c, { pos: [0, 1.5, 0] })); g.add(box(5.3, .25, 4.5, PAL.sandD, { pos: [0, 3.12, 0] }));
  [[0, 2.24, 5.3, .3, .2], [0, -2.24, 5.3, .3, .2], [2.64, 0, .2, .3, 4.5], [-2.64, 0, .2, .3, 4.5]].forEach(([x, z, w, h, d]) => g.add(box(w, h, d, PAL.sandD, { pos: [x, 3.4, z] })));
  g.add(box(1.4, .95, 1.4, c, { pos: [-1.5, 3.7, -.8] })); g.add(box(.9, 1.75, .12, PAL.wood, { pos: [0, .88, 2.13] })); g.add(box(1.1, .12, .2, PAL.sandD, { pos: [0, 1.85, 2.18] }));
  for (const x of [-1.6, 1.6]) { g.add(box(.85, .85, .1, PAL.blue, { pos: [x, 1.9, 2.12] })); g.add(box(.6, .6, .12, 0x2b3a4c, { pos: [x, 1.9, 2.14], ink: false })); } });
// tent: A-frame cloth tent 3.2 x 2.2 x 3.2, door on +z. o.color
export const tent = (Wd, o) => mk(Wd, o, (g, o) => { const s = new THREE.Shape(); s.moveTo(-1.6, 0); s.lineTo(1.6, 0); s.lineTo(0, 2.2); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 3.2, bevelEnabled: false }); geo.translate(0, 0, -1.6); g.add(mesh(geo, toon(o.color || PAL.red, { side: THREE.DoubleSide }), { box: true }));
  const d = new THREE.Shape(); d.moveTo(-.55, 0); d.lineTo(.55, 0); d.lineTo(0, 1.4); d.closePath(); const dm = new THREE.Mesh(new THREE.ShapeGeometry(d), new THREE.MeshBasicMaterial({ color: 0x3b2c22 })); dm.position.z = 1.62; g.add(dm);
  g.add(cyl(.04, .04, .9, PAL.woodD, { pos: [0, 2.6, 0], ink: false })); });
export const well = (Wd, o) => mk(Wd, o, g => {
  g.add(cyl(1, 1.05, .9, PAL.stone, { pos: [0, .45, 0] })); g.add(cyl(.82, .82, .03, PAL.water, { pos: [0, .8, 0], ink: false }));
  for (const x of [-.95, .95]) g.add(box(.14, 1.9, .14, PAL.wood, { pos: [x, 1.35, 0] }));
  g.add(cyl(.06, .06, 2.1, PAL.woodD, { pos: [0, 2.0, 0], rot: [0, 0, Math.PI / 2] })); for (const s of [-1, 1]) g.add(box(1.4, .08, 1.5, PAL.red, { pos: [s * .55, 2.35, 0], rot: [0, 0, -s * .5] }));
  g.add(cyl(.18, .15, .22, PAL.woodD, { pos: [0, 1.0, 0] })); g.add(cyl(.012, .012, .8, PAL.dark, { pos: [0, 1.6, 0], ink: false })); });
// wall: stone wall segment, length o.len (4) along x
export const wall = (Wd, o) => mk(Wd, o, (g, o) => { const L = o.len || 4; g.add(box(L, 1.2, .4, o.color || PAL.stone, { pos: [0, .6, 0] })); g.add(box(L + .1, .12, .52, PAL.stoneD, { pos: [0, 1.26, 0] }));
  for (let x = -L / 2 + .8; x < L / 2 - .3; x += 1.1) g.add(box(.02, .5, .02, PAL.stoneD, { pos: [x, .6, .21], ink: false })); });
export const fence = (Wd, o) => mk(Wd, o, (g, o) => { const L = o.len || 4, n = Math.max(2, Math.round(L / .8) + 1);
  for (let i = 0; i < n; i++) g.add(box(.12, 1, .12, PAL.wood, { pos: [-L / 2 + i * L / (n - 1), .5, 0] }));
  for (const y of [.35, .75]) g.add(box(L, .08, .06, PAL.woodD, { pos: [0, y, .08] })); });
export const bench = (Wd, o) => mk(Wd, o, g => { g.add(box(1.6, .08, .45, PAL.wood, { pos: [0, .45, 0] })); g.add(box(1.6, .45, .06, PAL.wood, { pos: [0, .75, -.2] }));
  for (const x of [-.72, .72]) g.add(box(.08, .45, .42, PAL.woodD, { pos: [x, .22, 0] })); });
export const table = (Wd, o) => mk(Wd, o, (g, o) => { const w = o.w || 1.8, d = o.d || .9; g.add(box(w, .08, d, PAL.wood, { pos: [0, .76, 0] }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(.08, .72, .08, PAL.woodD, { pos: [sx * (w / 2 - .1), .36, sz * (d / 2 - .1)] })); });
export const chair = (Wd, o) => mk(Wd, o, g => { g.add(box(.46, .06, .46, PAL.wood, { pos: [0, .45, 0] })); g.add(box(.46, .5, .05, PAL.wood, { pos: [0, .75, -.2] }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(.05, .44, .05, PAL.woodD, { pos: [sx * .2, .22, sz * .2] })); });
// bookshelf: 1.2 x 2 x 0.35 with rows of coloured books (o.seed)
export const bookshelf = (Wd, o) => mk(Wd, o, (g, o) => { const r = rng(o.seed || 7), cols = [PAL.red, PAL.blue, PAL.yellow, PAL.leaf, 0x8a5aa8, PAL.cream, 0xe58a3c];
  for (const x of [-.6, .6]) g.add(box(.06, 2, .35, PAL.wood, { pos: [x, 1, 0] })); g.add(box(1.2, 2, .03, PAL.woodD, { pos: [0, 1, -.16], ink: false }));
  for (let s = 0; s < 5; s++) { g.add(box(1.2, .05, .35, PAL.wood, { pos: [0, .03 + s * .5, 0] }));
    if (s < 4) { let x = -.53; while (x < .5) { const w = .04 + r() * .05, h = .24 + r() * .18; g.add(box(w, h, .22, cols[Math.floor(r() * cols.length)], { pos: [x + w / 2, .06 + s * .5 + h / 2, 0], ink: false })); x += w + .005; } } } });
export const bookOpen = (Wd, o) => mk(Wd, o, (g, o) => { for (const s of [-1, 1]) { g.add(box(.3, .02, .4, o.color || PAL.red, { pos: [s * .15, .01, 0], rot: [0, 0, -s * .12], inkW: .005 })); g.add(box(.27, .03, .36, PAL.white, { pos: [s * .15, .03, 0], rot: [0, 0, -s * .12], ink: false })); } });
export const bookClosed = (Wd, o) => mk(Wd, o, (g, o) => { g.add(box(.3, .05, .4, o.color || PAL.blue, { pos: [0, .025, 0], inkW: .005 })); g.add(box(.29, .036, .385, PAL.white, { pos: [.012, .025, 0], ink: false })); g.add(box(.03, .052, .402, PAL.gold, { pos: [-.14, .026, 0], ink: false })); });
// lamp: kind 'candle' (default, 0.2 m) or 'lamp' (street lantern on a 2.2 m pole). Soft flickering glow sprite; o.light = also a real PointLight
export const lamp = (Wd, o) => mk(Wd, o, (g, o) => { const L = o.kind === 'lamp', y = L ? 2.35 : .27, fl = new THREE.Mesh(new THREE.SphereGeometry(L ? .13 : .03, 12, 8), solid(0xffd24a));
  if (L) { g.add(cyl(.05, .07, 2.1, PAL.dark, { pos: [0, 1.05, 0] })); g.add(box(.34, .34, .34, 0xffe9b0, { pos: [0, y, 0], ink: false })); g.add(box(.42, .08, .42, PAL.dark, { pos: [0, y + .21, 0] })); }
  else { g.add(cyl(.035, .035, .2, PAL.cream, { pos: [0, .1, 0], inkW: .006 })); fl.scale.y = 1.6; g.add(fl); }
  fl.position.y = y; const gl = glow(L ? 3 : 1.1); gl.position.y = y; g.add(gl);
  if (o.light) { const pl = new THREE.PointLight(0xffc880, L ? 1.2 : .6, L ? 12 : 5); pl.position.y = y; g.add(pl); }
  Wd.on(t => { const f = .86 + .09 * Math.sin(t * 9 + (o.seed || 0)) + .05 * Math.sin(t * 23 + (o.seed || 0) * 2); gl.material.opacity = .8 * f; gl.scale.setScalar((L ? 3 : 1.1) * (.95 + .05 * f)); }); });
// cart: hand cart, 2 spoked wheels; o.spin = wheel angular speed rad/s (positive when the cart rolls toward +z)
export const cart = (Wd, o) => mk(Wd, o, (g, o) => { g.add(box(1.3, .12, 2, PAL.wood, { pos: [0, .7, 0] }));
  for (const s of [-1, 1]) { g.add(box(.08, .35, 2, PAL.woodD, { pos: [s * .64, .93, 0] })); g.add(box(.05, .06, 1.2, PAL.woodD, { pos: [s * .45, .7, 1.6] }));
    const w = new THREE.Group(); w.position.set(s * .74, .45, 0); w.add(cyl(.45, .45, .08, PAL.woodD, { rot: [0, 0, Math.PI / 2] })); w.add(cyl(.12, .12, .14, PAL.dark, { rot: [0, 0, Math.PI / 2] }));
    w.add(box(.1, .9, .06, PAL.dark, { ink: false })); w.add(box(.1, .06, .9, PAL.dark, { ink: false })); g.add(w); (g.userData.wheels = g.userData.wheels || []).push(w); }
  g.add(box(1.1, .5, .7, PAL.cream, { pos: [0, 1.0, -.3] })); const sp = o.spin || 0; Wd.on(t => g.userData.wheels.forEach(w => { w.rotation.x = t * sp; })); });
// boat: small sailing boat ~2 x 5 m with a sail; bobs on the water by itself (o.bob = false to stop)
export const boat = (Wd, o) => mk(Wd, o, (g, o) => { const hull = mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon(o.color || PAL.wood, { side: THREE.DoubleSide }), { scale: [.95, .6, 2.5], pos: [0, .5, 0] }); g.add(hull);
  g.add(box(1.7, .1, .12, PAL.woodD, { pos: [0, .5, .6] })); g.add(cyl(.05, .06, 3.4, PAL.woodD, { pos: [0, 2.2, .3] }));
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0, 2.7); s.lineTo(1.5, 0); s.closePath(); const sail = new THREE.Mesh(new THREE.ShapeGeometry(s), toon(PAL.white, { side: THREE.DoubleSide })); sail.position.set(0, 1.0, .3); sail.rotation.y = Math.PI / 2; g.add(sail);
  const y0 = o.pos ? o.pos[1] : 0; if (o.bob !== false) Wd.on(t => { g.position.y = y0 + .05 * Math.sin(t * 1.6); g.rotation.z = .035 * Math.sin(t * 1.1); }); });
// sunDisc: o.r (2) radius, flat bright disc with soft glow and slowly turning rays; faces +z (rotate with rot)
export const sunDisc = (Wd, o) => mk(Wd, o, (g, o) => { const r = o.r || 2, rays = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 28, 16), solid(0xffd23a))); const gl = glow(r * 7, .9); g.add(gl);
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.2832, c = new THREE.Mesh(new THREE.ConeGeometry(r * .13, r * .7, 4), solid(0xffc21a)); c.position.set(Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35, 0); c.rotation.z = a - Math.PI / 2; rays.add(c); }
  g.add(rays); Wd.on(t => { rays.rotation.z = t * .2; }); });
// star: 5-point gold star (o.r = 0.5), extruded, twinkling glow
export const star = (Wd, o) => mk(Wd, o, (g, o) => { const R = o.r || .5, s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * .45 : R; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: R * .25, bevelEnabled: false }); geo.translate(0, 0, -R * .125); const m = mesh(geo, toon(PAL.gold, { emissive: 0x6a4a00 }), { box: true, inkW: R * .05 }); g.add(m);
  const gl = glow(R * 5, .7); g.add(gl); Wd.on(t => { gl.material.opacity = .55 + .25 * Math.sin(t * 3 + (o.seed || 0)); m.rotation.y = .25 * Math.sin(t * .8 + (o.seed || 0)); }); });
// banner: pole 3.6 m + striped cloth 1.7 x 1.1 m that waves as a pure function of t. o.color, o.color2
export const banner = (Wd, o) => mk(Wd, o, (g, o) => { g.add(cyl(.04, .05, 3.6, PAL.woodD, { pos: [0, 1.8, 0] })); g.add(ball(.08, PAL.gold, { pos: [0, 3.65, 0] }));
  const geo = new THREE.PlaneGeometry(1.7, 1.1, 16, 6); geo.translate(.85, 0, 0); const P = geo.attributes.position, base = P.array.slice(), c1 = new THREE.Color(o.color || PAL.red), c2 = new THREE.Color(o.color2 || PAL.cream), col = [];
  for (let i = 0; i < P.count; i++) { const c = Math.floor((P.getY(i) + .55) / .37) % 2 ? c2 : c1; col.push(c.r, c.g, c.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const cloth = new THREE.Mesh(geo, toon(0xffffff, { vertexColors: true, side: THREE.DoubleSide })); cloth.position.set(.05, 3.0, 0); cloth.castShadow = true; g.add(cloth);
  Wd.on(t => { for (let i = 0; i < P.count; i++) { const x = base[i * 3], k = x / 1.7; P.setZ(i, k * .28 * Math.sin(x * 4.2 - t * 4.5 + (o.seed || 0)) + k * .06 * Math.sin(x * 9 - t * 7)); P.setY(i, base[i * 3 + 1] - k * k * .06 * Math.sin(t * 3)); } P.needsUpdate = true; geo.computeVertexNormals(); }); });
// fountain: 2.4 m radius basin, tiered, with water jets (droplets on parabolas, pure function of t)
export const fountain = (Wd, o) => mk(Wd, o, g => { g.add(cyl(2.3, 2.45, .55, PAL.stone, { pos: [0, .27, 0] })); g.add(cyl(2.0, 2.0, .04, PAL.water, { pos: [0, .52, 0], ink: false }));
  g.add(cyl(.28, .38, 1.3, PAL.stoneD, { pos: [0, 1.1, 0] })); g.add(cyl(.95, .55, .3, PAL.stone, { pos: [0, 1.8, 0] })); const dm = new THREE.MeshBasicMaterial({ color: 0xbfe6ff, fog: false }), D2 = [];
  for (let j = 0; j < 18; j++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), dm); g.add(m); D2.push(m); }
  Wd.on(t => D2.forEach((m, j) => { const a = (j % 6) / 6 * 6.2832 + Math.floor(j / 6) * .5, s = (t * .8 + j / 18) % 1, y = 1.95 + 2.1 * s - 4.6 * s * s, r = 1.7 * s; m.position.set(Math.cos(a) * r, y, Math.sin(a) * r); m.visible = y > .56; })); });
// pathStones: flat stepping stones along a polyline o.pts [[x,z],...] (default: 6 m along +z), spacing o.step (.9)
export const pathStones = (Wd, o) => mk(Wd, o, (g, o) => { const pts = o.pts || [[0, 0], [0, 6]], r = rng(o.seed || 5), cols = [PAL.stone, PAL.stoneD, 0xd3c8b0];
  for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / (o.step || .9));
    for (let k = 0; k <= n; k++) { const u = k / Math.max(n, 1), px = lerp(x0, x1, u) + (r() - .5) * .3, pz = lerp(z0, z1, u) + (r() - .5) * .3;
      g.add(cyl(.34 + r() * .1, .38 + r() * .1, .07, cols[Math.floor(r() * 3)], { pos: [px, .035, pz], scale: [1, 1, .8 + r() * .3], rot: [0, r() * 3, 0], inkW: .008, cast: false })); } } });
// bird: small bird facing +z with flapping wings. Static: bird(Wd,{pos,flap}); moving: o.fn = t => ({pos, facing, flap}) . o.color
export const bird = (Wd, o) => mk(Wd, o, (g, o) => { const c = o.color || 0xf4f0e6, body = new THREE.Group(); g.add(body);
  body.add(ball(.12, c, { scale: [1, .8, 1.6], inkW: .008 })); body.add(ball(.075, c, { pos: [0, .07, .2], inkW: .006 }));
  body.add(mesh(new THREE.ConeGeometry(.03, .09, 6), toon(0xf0a030), { pos: [0, .06, .29], rot: [Math.PI / 2, 0, 0], ink: false })); body.add(box(.1, .015, .22, c, { pos: [0, .02, -.3], ink: false }));
  const wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * .08, .06, 0); p.add(box(.4, .015, .2, o.wing || 0xd8d2c4, { pos: [s * .2, 0, 0], inkW: .005 })); body.add(p); return [p, s]; });
  Wd.on(t => { const st = o.fn ? o.fn(t) : {}, f = st.flap !== undefined ? st.flap : (o.flap || 3), ph = (o.seed || 0) * 2;
    if (o.fn) { g.position.set(...st.pos); g.rotation.y = st.facing || 0; body.position.y = .03 * Math.sin(t * f * 6.28 + ph); }
    wings.forEach(([p, s]) => { p.rotation.z = s * .75 * Math.sin(t * f * 6.28 + ph); }); }); });
// flock(Wd, n, center, radius, height, seed): n birds circling together (varied radius/phase/speed); returns the birds
export const flock = (Wd, n, center, radius, height, seed, o) => { const r = rng(seed || 1), out = []; o = o || {};
  for (let i = 0; i < n; i++) { const R = radius * (.75 + r() * .5), ph = r() * 6.28, w = (o.speed || .25) * (.9 + r() * .2), h = height + (r() - .5) * 2.5, dir = o.dir || 1;
    out.push(bird(Wd, { color: o.color, scale: o.scale, seed: i, flap: 2.2 + r() * 1.2, fn: t => { const a = ph + dir * w * t; return { pos: [center[0] + Math.cos(a) * R, center[1] + h + Math.sin(t * .8 + ph) * .4, center[2] + Math.sin(a) * R], facing: Math.atan2(-Math.sin(a) * dir, Math.cos(a) * dir) }; } })); } return out; };
// signpost: 2.2 m post with a board carrying o.label (plain text drawn into a texture, readable from the +z side)
export const signpost = (Wd, o) => mk(Wd, o, (g, o) => { g.add(cyl(.06, .08, 2.3, PAL.woodD, { pos: [0, 1.15, 0] })); g.add(box(1.5, .4, .07, PAL.wood, { pos: [.1, 1.85, 0] }));
  const tx = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#e9cf9b'; c.fillRect(0, 0, w, h); c.fillStyle = '#3b2c22'; c.font = '700 70px Assistant, Heebo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; if (/[֐-׿]/.test(o.label || '')) c.direction = 'rtl'; c.fillText(o.label || '', w / 2, h / 2 + 4); });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .35), new THREE.MeshBasicMaterial({ map: tx })); pl.position.set(.1, 1.85, .04); g.add(pl); });
