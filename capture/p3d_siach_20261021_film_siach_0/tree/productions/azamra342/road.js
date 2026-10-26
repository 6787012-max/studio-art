// road.js - THE PRAYER ROAD, shared by all azamra342 films (build once, import everywhere).
//
// USAGE (in a film page, inside shot.build()):
//   import { roadWorld, buildRoad, arrow, drop, pop, boy, route, cine, mkShot, ct } from './road.js';
//   const Wd = roadWorld();                       // world: valley sky, fog, sun+sky follow the camera
//   const R = buildRoad(Wd, { sefard:false });    // slabs, gates, markers, fields, hills, trees (adds itself to Wd)
//   R.z('tal') / R.z('ברך עלינו') -> z of a station/marker;  R.x(name) -> lane x (0, or +-1.9 in sefard);  R.pos(name, dz=0) -> [x,0,z]
//   R.highlight(name, 0..1)   glow + enlarged label (call every frame from Wd.on, deterministic)
//   R.reveal(zMax)            road "unrolls" up to zMax (default everything)
//   boy(Wd, route([[t,x,z,facing?],...]))  the hero, walks between keys (stands when two keys are equal)
//   arrow(Wd, from, to, {color, amount:t=>0..1, height})   golden arc growing from the boy to the target
//   drop(Wd, pos, t0)         THE SIGNAL: a big blue raindrop falls and splashes beside the boy at time t0
//   pop(Wd, text, pos, t0, dur, {bg,height})   a label that pops up at t0 and fades after dur
//   cine([[t,[cx,cy,cz],radius,height,angleDeg,fov,lookDy],...])   camera in polar coordinates around a moving target (smooth Hermite)
//   mkShot(dur, caps, build)  shot whose captions are spread in equal windows (>=5 s each when dur >= 5*n+.6); ct(dur,n,i) = start of caption i
// Station ids: start, barech, summer(sefard), tal(blue), barech.end(gold), barech.out, extra, teka, shma, shma.ki(blue), shma.end(gold),
//   shma.out, retze, modim, sim, yihyu, oseh, footprints. Hebrew names from the brief work too. Everything is deterministic (rng(seed)).
import { THREE, box, cyl, ball, toon, ink, canvasTex, label, cloud, rain, person, world, rng, clamp, lerp, ease, prog, D } from '../../lib/stage3d.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z), C = c => new THREE.Color(c);
const toV = p => Array.isArray(p) ? V3(p[0], p[1] || 0, p[2] || 0) : p.clone();
export const SLAB_Y = .1;             // top of the slabs: feet of the boy stand here
export const LANE = 1.9;              // sefard lane centre (summer = -LANE, winter = +LANE)
const ROAD_W = 3.3;

// ---------------- noise ----------------
function hash2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  return lerp(lerp(hash2(xi, zi), hash2(xi + 1, zi), u), lerp(hash2(xi, zi + 1), hash2(xi + 1, zi + 1), u), v); }
export function fbm(x, z) { return vnoise(x, z) * .55 + vnoise(x * 2.07 + 13.1, z * 2.07 + 7.3) * .3 + vnoise(x * 4.3 + 3.7, z * 4.3 + 19.1) * .15; }

// ---------------- stations ----------------
const Z = { start: 0, barech: 21, summer: 21, tal: 40, 'barech.end': 57, 'barech.out': 61, extra: 64.5, teka: 70, shma: 105, 'shma.ki': 123, 'shma.end': 134, 'shma.out': 138,
  retze: 146, modim: 156, sim: 166, yihyu: 176, oseh: 190, footprints: 183.2, end: 194 };
const HE = { 'תחילת התפילה': 'start', 'ברך עלינו': 'barech', 'ברכנו': 'summer', 'ותן טל ומטר': 'tal', "ברוך אתה ה'": 'barech.end', 'תקע': 'teka', 'שמע קולנו': 'shma',
  'כי אתה שומע': 'shma.ki', 'רצה': 'retze', 'מודים': 'modim', 'שים שלום': 'sim', 'יהיו לרצון': 'yihyu', 'עושה שלום': 'oseh' };
const key = n => { const k = HE[n] || n; if (Z[k] === undefined) throw new Error('road: unknown station ' + n); return k; };

// ---------------- textures ----------------
const glowT = (c0, c1) => canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, c0); r.addColorStop(1, c1); g.fillStyle = r; g.fillRect(0, 0, w, h); });
function slabTex() { const r = rng(11); return canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 520; i++) { g.globalAlpha = .06 + r() * .12; g.fillStyle = r() < .55 ? '#a58250' : '#fffaf0'; const s = 1 + r() * 7; g.beginPath(); g.ellipse(r() * w, r() * h, s, s * (.4 + r()), r() * 3, 0, 7); g.fill(); }
  g.globalAlpha = .35; g.strokeStyle = '#8a6a3a'; g.lineWidth = 1.6; for (let i = 0; i < 2; i++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - .5) * 70; y += (r() - .5) * 70; g.lineTo(x, y); } g.stroke(); }
  g.globalAlpha = .75; g.strokeStyle = '#6b4a28'; g.lineWidth = 11; g.strokeRect(0, 0, w, h); g.globalAlpha = 1; }); }
function blockTex() { const r = rng(5); return canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b79c6e'; g.fillRect(0, 0, w, h);
  for (let row = 0; row < 4; row++) { let x = -r() * 50; const y = row * 64; while (x < w) { const bw = 62 + r() * 50; g.fillStyle = ['#f3e4c2', '#ecd9b0', '#f7ebd0', '#e6d2a6'][Math.floor(r() * 4)]; g.beginPath(); g.roundRect(x + 2, y + 2, bw - 4, 60, 5); g.fill(); x += bw; } } }, [.45, .45]); }
function wheatTex() { const r = rng(3); return canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#c89a30'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) { g.fillStyle = ['#e2b845', '#d6a937', '#ecc55a', '#b88f2c'][Math.floor(r() * 4)]; g.fillRect(x, 0, 11, h); }
  for (let i = 0; i < 300; i++) { g.globalAlpha = .25; g.fillStyle = r() < .5 ? '#fff2b0' : '#8a6a1c'; g.fillRect(r() * w, r() * h, 2, 8 + r() * 12); } g.globalAlpha = 1; }, [3, 8]); }
function decalTex(kind) { return canvasTex(256, 256, (g, w, h) => {
  if (kind === 'drop') { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(128, 28); g.bezierCurveTo(150, 80, 196, 118, 196, 160); g.bezierCurveTo(196, 202, 164, 226, 128, 226); g.bezierCurveTo(92, 226, 60, 202, 60, 160); g.bezierCurveTo(60, 118, 106, 80, 128, 28); g.fill();
    g.fillStyle = 'rgba(120,180,255,.7)'; g.beginPath(); g.ellipse(100, 170, 14, 28, .4, 0, 7); g.fill(); }
  else { g.fillStyle = '#fff6d0'; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832, rr = i % 2 ? 62 : 112; g.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } g.closePath(); g.fill(); g.fillStyle = '#e0a81e'; g.beginPath(); g.arc(128, 128, 36, 0, 7); g.fill(); } }); }
function footTex() { return canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#ffe9a0'; g.shadowColor = '#ffb020'; g.shadowBlur = 18;
  g.beginPath(); g.ellipse(64, 168, 34, 62, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(64, 84, 28, 28, 0, 0, 7); g.fill();
  [[22, 44, 11], [42, 28, 12], [64, 22, 12], [86, 28, 11], [104, 44, 9]].forEach(([x, y, rr]) => { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }); }); }
function beamTex() { return canvasTex(16, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,240,190,0)'); gr.addColorStop(1, 'rgba(255,225,140,.95)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); }

// ---------------- instancing helpers ----------------
const DUM = new THREE.Object3D();
function inst(geo, mat, items, o) {   // items: [{x,y,z,sx,sy,sz,ry,col}]
  o = o || {}; const m = new THREE.InstancedMesh(geo, mat, items.length);
  items.forEach((s, i) => { DUM.position.set(s.x, s.y, s.z); DUM.rotation.set(s.rx || 0, s.ry || 0, s.rz || 0); DUM.scale.set(s.sx, s.sy, s.sz); DUM.updateMatrix(); m.setMatrixAt(i, DUM.matrix); if (s.col !== undefined) m.setColorAt(i, C(s.col)); });
  m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.frustumCulled = false; m.castShadow = !!o.cast; m.receiveShadow = o.receive !== false; return m;
}
function hullMat(w, col) { const m = new THREE.MeshBasicMaterial({ color: col || 0x16301a, side: THREE.BackSide });
  m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normalize(normal) * ' + w.toFixed(3) + ';'); }; m.customProgramCacheKey = () => 'hull' + w.toFixed(3); return m; }
function instInk(parent, geo, items, w, col) { const m = new THREE.InstancedMesh(geo, hullMat(w, col), items.length);
  items.forEach((s, i) => { DUM.position.set(s.x, s.y, s.z); DUM.rotation.set(0, s.ry || 0, 0); DUM.scale.set(s.sx, s.sy, s.sz); DUM.updateMatrix(); m.setMatrixAt(i, DUM.matrix); }); m.frustumCulled = false; parent.add(m); }

// ---------------- slabs and curbs ----------------
const BASE = ['#e2c697', '#d9ba88', '#e9d0a2', '#d3b27c'], GOLD = ['#f2dc9a', '#eed28b', '#f7e6b4', '#e8cb7e'], COOL = ['#dad3bd', '#cfc7b0', '#e3dcc7', '#c9c1aa'],
  SUM = ['#f6dd84', '#f1d478', '#fae79f'], WIN = ['#cfdfec', '#c3d6e8', '#dbe7f1'];
function fillSlabs(out, z0, z1, xc, w, tone, seed) {
  const r = rng(seed), cols = Math.max(1, Math.round(w / 1.5)), cw = w / cols;
  for (let c = 0; c < cols; c++) { let z = z0 - (c % 2 ? 1.2 : 0);
    while (z < z1 - .01) { const len = 2.1 + r() * .8, a = Math.max(z, z0), b = Math.min(z + len, z1); if (b - a > .45) out.push({ x: xc - w / 2 + cw * (c + .5), z: (a + b) / 2, w: cw - .06, l: b - a - .06, col: tone[Math.floor(r() * tone.length)] }); z += len; } }
}
function fillCurb(out, z0, z1, x, col, w) { for (let z = z0; z < z1 - .01; z += 2.4) { const b = Math.min(z + 2.4, z1); out.push({ x, z: (z + b) / 2, w: w || .5, l: b - z - .05, col }); } }

// ---------------- arch (one extruded outline: two pillars + semicircle) ----------------
export function archGeo(wi, hs, th, d) {
  const ri = wi / 2, ro = ri + th, sh = new THREE.Shape(), N = 22;
  sh.moveTo(-ro, 0); sh.lineTo(-ri, 0); sh.lineTo(-ri, hs);
  for (let i = 0; i <= N; i++) { const a = Math.PI - i / N * Math.PI; sh.lineTo(Math.cos(a) * ri, hs + Math.sin(a) * ri); }
  sh.lineTo(ri, 0); sh.lineTo(ro, 0); sh.lineTo(ro, hs);
  for (let i = 0; i <= N; i++) { const a = i / N * Math.PI; sh.lineTo(Math.cos(a) * ro, hs + Math.sin(a) * ro); }
  sh.lineTo(-ro, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g;
}

export function roadWorld(o) {
  o = o || {};
  const dir = V3(...(o.sunPos || [-30, 50, 25])).normalize(), dv = V3(0, 0, 0);
  const Wd = world(Object.assign({ skyTop: 0x5aa5ee, skyBottom: 0xfbeacb, fogColor: 0xeaeedd, fogNear: 120, fogFar: 460, sun: 1.95, sunPos: [-30, 50, 25], hemi: 1.3, hemiSky: 0xfffbf0, hemiGround: 0x8a7a52, shadowExt: 34, skyR: 900 }, o));
  Wd.on((t, cam) => { Wd.sky.position.copy(cam.position); cam.getWorldDirection(dv);
    let k = dv.y < -.08 ? cam.position.y / -dv.y : 50; k = clamp(k, 8, 80); const tx = cam.position.x + dv.x * k, tz = cam.position.z + dv.z * k;
    Wd.sun.target.position.set(tx, 0, tz); Wd.sun.position.set(tx + dir.x * 70, dir.y * 70, tz + dir.z * 70); });
  return Wd;
}

// ====================================================================================
export function buildRoad(Wd, opts) {
  opts = opts || {}; const sef = !!opts.sefard, G = new THREE.Group(); Wd.add(G);
  const S = {};                 // station objects by id: {z, x, group, set(a)}
  const ups = [];               // per-frame updaters (t)
  const revealables = [];       // {z, group}
  const laneX = id => sef && ['tal', 'barech.end', 'barech'].includes(id) ? LANE : sef && id === 'summer' ? -LANE : 0;

  // ---- scenery: terrain valley, trees, flowers, sky clouds ----
  if (opts.scenery !== false) {
    const hillH = (x, z) => { const kx = ease.sm(clamp((Math.abs(x) - 18) / 90, 0, 1)), kz = Math.max(ease.sm(clamp((z - 215) / 70, 0, 1)), ease.sm(clamp((-60 - z) / 60, 0, 1)));
      return Math.max(kx, kz) * (6 + 30 * fbm(x * .011 + 3, z * .011)); };
    const gt = canvasTex(512, 512, (g, w, h) => { const r = rng(7); g.fillStyle = '#86a95c'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1500; i++) { g.globalAlpha = .25 + r() * .3; g.fillStyle = r() < .5 ? '#739a4b' : '#97b96a'; const s = 2 + r() * 9; g.beginPath(); g.ellipse(r() * w, r() * h, s, s * (.4 + r() * .6), r() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; }, [56, 78]);
    const tg = new THREE.PlaneGeometry(340, 470, 136, 188); tg.rotateX(-Math.PI / 2); tg.translate(0, 0, 100);
    const p = tg.attributes.position, cols = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = hillH(x, z); p.setY(i, h); const n = fbm(x * .05, z * .05), hk = clamp(h / 30, 0, 1);
      c.setRGB(.9 + .2 * n + hk * .1, .96 + .12 * n - hk * .03, .86 + .1 * n - hk * .2); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
    tg.setAttribute('color', new THREE.BufferAttribute(cols, 3)); tg.computeVertexNormals();
    const terr = new THREE.Mesh(tg, new THREE.MeshLambertMaterial({ map: gt, vertexColors: true })); terr.receiveShadow = true; G.add(terr);
    // trees: round and cypress
    const tr = rng(21), trunk = [], crown = [], cyp = [], greens = ['#5f8f3e', '#6f9c47', '#4f8040', '#7da64c'];
    for (let i = 0; i < 150; i++) { const near = i < 50, x = (tr() < .5 ? -1 : 1) * (near ? 9 + tr() * 8 : 20 + tr() * 55), z = -30 + tr() * 250;
      if (near && z > 18 && z < 64) continue; const y = hillH(x, z), s = .8 + tr() * .9;
      if (tr() < .3) cyp.push({ x, y: y + 2.4 * s, z, sx: .9 * s, sy: 2.4 * s, sz: .9 * s, col: '#3f7a3a' });
      else { trunk.push({ x, y: y + .8 * s, z, sx: s, sy: s, sz: s }); crown.push({ x, y: y + 2.3 * s, z, sx: 1.7 * s, sy: 1.5 * s, sz: 1.7 * s, col: greens[Math.floor(tr() * 4)] }); } }
    const cg = new THREE.IcosahedronGeometry(1, 1), kg = new THREE.ConeGeometry(1, 2, 8);
    G.add(inst(new THREE.CylinderGeometry(.16, .24, 1.6, 6), toon(0x7a5232), trunk, { cast: true }));
    const cm = inst(cg, toon(0xffffff), crown, { cast: true }); G.add(cm); instInk(G, cg, crown, .05);
    const km = inst(kg, toon(0xffffff), cyp, { cast: true }); G.add(km); instInk(G, kg, cyp, .05);
    const fr = rng(33), fl = [], fcol = ['#ff7a8a', '#ffd23a', '#ffffff', '#b58cff', '#ff9a3c'];
    for (let i = 0; i < 420; i++) { const x = (fr() < .5 ? -1 : 1) * (4.3 + fr() * 9), z = -8 + fr() * 200; if (z > 18 && z < 64) continue; fl.push({ x, y: .16, z, sx: .16, sy: .16, sz: .16, col: fcol[Math.floor(fr() * 5)] }); }
    G.add(inst(new THREE.SphereGeometry(1, 6, 4), toon(0xffffff), fl, { receive: false }));
    const cr = rng(41); for (let i = 0; i < 9; i++) { const sx = i % 2 ? 1 : -1, cl = cloud({ seed: 40 + i, size: 5 + cr() * 3, pos: [sx * (55 + cr() * 60), 52 + cr() * 24, -40 + i * 28], puffs: 6, cast: false }); G.add(cl); }
  }

  // ---- slabs + curbs ----
  const slabs = [], curbs = [], piece = (z0, z1, xc, w, tone, seed, cl, cr, cc) => { fillSlabs(slabs, z0, z1, xc, w, tone, seed); if (cl !== false) fillCurb(curbs, z0, z1, xc - w / 2 - .28, cc || '#d8bd8a'); if (cr !== false) fillCurb(curbs, z0, z1, xc + w / 2 + .28, cc || '#d8bd8a'); };
  if (!sef) { piece(-6, 21, 0, ROAD_W, BASE, 1); piece(21, 61, 0, ROAD_W, GOLD, 2, true, true, '#e8c35c'); piece(61, 105, 0, ROAD_W, BASE, 3); }
  else { piece(-6, 15, 0, ROAD_W, BASE, 1); piece(15, 21, 0, 6.7, BASE, 4); piece(21, 61, -LANE, 2.9, SUM, 5, true, false, '#e8c35c'); piece(21, 61, LANE, 2.9, WIN, 6, false, true, '#8fb4d8');
    fillCurb(curbs, 21, 27.5, 0, '#cdbd9c', .6); fillCurb(curbs, 30.5, 61, 0, '#cdbd9c', .6); slabs.push({ x: 0, z: 29, w: .84, l: 2.9, col: '#e6d6b0' });
    piece(61, 66, 0, 6.7, BASE, 7); piece(66, 105, 0, ROAD_W, BASE, 3); }
  piece(105, 137, 0, ROAD_W, COOL, 8, true, true, '#8fb4d8'); piece(137, 196, 0, ROAD_W, BASE, 9);
  slabs.sort((a, b) => a.z - b.z); curbs.sort((a, b) => a.z - b.z);
  const slabM = inst(new THREE.BoxGeometry(1, 1, 1), toon(0xffffff, { map: slabTex() }), slabs.map(s => ({ x: s.x, y: SLAB_Y - .15, z: s.z, sx: s.w, sy: .3, sz: s.l, col: s.col })));
  const curbM = inst(new THREE.BoxGeometry(1, 1, 1), toon(0xffffff), curbs.map(s => ({ x: s.x, y: .12, z: s.z, sx: s.w, sy: .44, sz: s.l, col: s.col })), { cast: true });
  G.add(slabM); G.add(curbM); instInk(G, new THREE.BoxGeometry(1, 1, 1), curbs.map(s => ({ x: s.x, y: .12, z: s.z, sx: s.w, sy: .44, sz: s.l })), .02, 0x3a2a18);
  const slabZ = slabs.map(s => s.z), curbZ = curbs.map(s => s.z), cnt = (arr, z) => { let n = 0; while (n < arr.length && arr[n] <= z) n++; return n; };

  // ---- stations ----
  const LBL = { bg: 'rgba(70,44,14,.94)', color: '#ffeab8' };
  function addGlow(g, w, d, st) { const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: glowT('rgba(255,215,110,.95)', 'rgba(255,200,80,0)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
    gl.rotation.x = -Math.PI / 2; gl.position.y = SLAB_Y + .03; g.add(gl); st.glow = gl;
    const bm = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.5, 44, 20, 1, true), new THREE.MeshBasicMaterial({ map: beamTex(), color: 0xffd36a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, opacity: 0 }));
    bm.position.y = 22; g.add(bm); st.beam = bm; }
  function finish(id, st, labelSp, lh, lbY) {
    st.label = labelSp; st.lh = lh; st.lbY = lbY; st.base = labelSp ? labelSp.scale.clone() : null;
    st.set = a => { a = clamp(a || 0, 0, 1); st.glow.material.opacity = .95 * a; st.beam.material.opacity = .55 * a; st.beam.visible = a > .01;
      if (st.mats) for (const m of st.mats) m.emissive.setRGB(.5 * a, .36 * a, .06 * a);
      if (st.plate) { const k = 1 + .18 * a; st.plate.scale.set(k, 1, k); }
      if (st.label) { const k = 1 + .5 * a; st.label.scale.set(st.base.x * k, st.base.y * k, 1); st.label.position.y = st.lbY + (k - 1) * st.lh * .5; }
      if (st.extra) st.extra(a); };
    S[id] = st; revealables.push({ z: st.z, group: st.group });
  }
  function gate(id, o) {   // o: {z,x,wi,hs,th,d,text,lh,tone}
    const g = new THREE.Group(); g.position.set(o.x || 0, 0, o.z); G.add(g);
    const wi = o.wi, hs = o.hs, th = o.th, d = o.d, st = { z: o.z, x: o.x || 0, group: g, mats: [] };
    const sm = toon(o.tone || 0xffffff, { map: blockTex() }); st.mats.push(sm);
    const am = new THREE.Mesh(archGeo(wi, hs, th, d), sm); am.castShadow = am.receiveShadow = true; ink(am, .035, 0x3a2a18); g.add(am);
    const ro = wi / 2 + th, ks = box(th * 1.15, th * 1.5, d + .12, 0xe2b13a, { pos: [0, hs + wi / 2 + th * .5, 0] }); g.add(ks);
    for (const sx of [-1, 1]) { const x = sx * (wi / 2 + th / 2); g.add(box(th + .22, .26, d + .2, 0xcfb078, { pos: [x, .13, 0] })); g.add(box(th + .16, .2, d + .14, 0xcfb078, { pos: [x, hs - .1, 0] })); }
    addGlow(g, wi + th * 2 + 2.6, 6.2, st);
    let sp = null, y = 0; if (o.text) { y = hs + ro + .75 + (o.lh || 1.5) * .45; sp = label(Wd, o.text, Object.assign({ pos: [o.lx || 0, y, 0], height: o.lh || 1.5 }, LBL)); g.add(sp); }
    finish(id, st, sp, o.lh || 1.5, y); return st;
  }
  const BIG = { wi: 5, hs: 3.3, th: .75, d: .9, lh: 2.3, tone: 0xfff3dc }, SMALL = { wi: 4.2, hs: 1.9, th: .45, d: .5 };
  gate('start', Object.assign({ z: 0, text: 'תחילת התפילה' }, BIG));
  [6, 10, 13.5].forEach((z, i) => gate('a' + i, Object.assign({ z }, SMALL, { tone: 0xffeed0 })));
  if (!sef) gate('barech', Object.assign({ z: 21, text: 'ברך עלינו' }, BIG));
  else { const L = { wi: 2.8, hs: 3.0, th: .6, d: .9, lh: 1.85, tone: 0xfff3dc };
    gate('summer', Object.assign({ z: 21, x: -LANE, text: 'ברכנו', lx: -.75 }, L)); gate('barech', Object.assign({ z: 21, x: LANE, text: 'ברך עלינו', lx: 1.1 }, L)); }
  for (const [id, z] of [['barech.out', 61], ['shma.out', 138]]) { const g = new THREE.Group(); g.position.z = z; G.add(g); for (const sx of [-1, 1]) g.add(box(.7, 1.5, .7, 0xe6cd98, { pos: [sx * 2.25, .75, 0] }));
    const st = { z, x: 0, group: g }; addGlow(g, 6, 3, st); finish(id, st, null, 0, 0); }
  gate('teka', Object.assign({ z: 70, text: 'תקע' }, BIG));
  [77, 82, 87, 92, 97].forEach((z, i) => gate('b' + i, Object.assign({ z }, SMALL, { tone: 0xffeed0 })));
  gate('shma', Object.assign({ z: 105, text: 'שמע קולנו' }, BIG));
  gate('retze', Object.assign({ z: 146, text: 'רצה' }, BIG)); gate('modim', Object.assign({ z: 156, text: 'מודים' }, BIG));
  gate('sim', Object.assign({ z: 166, text: 'שים שלום' }, BIG)); gate('yihyu', Object.assign({ z: 176, text: 'יהיו לרצון' }, BIG, { hs: 3.7, wi: 5.4 }));
  gate('oseh', Object.assign({ z: 190, text: 'עושה שלום' }, BIG));

  function marker(id, z, kind, text) {   // floor plate + sign
    const x = laneX(id), g = new THREE.Group(); g.position.set(x, SLAB_Y, z); G.add(g); const st = { z, x, group: g };
    const blue = kind === 'blue', plate = new THREE.Group(); g.add(plate); st.plate = plate;
    plate.add(cyl(1.25, 1.3, .12, blue ? 0x2f7fd6 : 0xe0a81e, { pos: [0, .06, 0] })); plate.add(cyl(.98, .98, .03, blue ? 0x8ec5ff : 0xffe08a, { pos: [0, .135, 0], ink: false }));
    const dc = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshBasicMaterial({ map: decalTex(blue ? 'drop' : 'star'), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, color: blue ? 0x2f7fd6 : 0xffffff }));
    dc.rotation.x = -Math.PI / 2; dc.position.y = .16; plate.add(dc); if (blue) dc.material.color.set(0xffffff);
    g.add(cyl(.05, .05, 2.3, 0xcaa24a, { pos: [1.15, 1.15, 0], ink: false }));
    const sp = label(Wd, text, { pos: [1.15, 2.7, 0], height: 1.35, bg: blue ? 'rgba(24,96,176,.95)' : 'rgba(176,122,8,.97)', color: '#fff' }); g.add(sp);
    addGlow(g, 7, 6, st); st.glow.position.y = .06; st.beam.scale.set(.6, .8, .6);
    finish(id, st, sp, 1.35, 2.7); }
  marker('tal', 40, 'blue', 'ותן טל ומטר'); marker('barech.end', 57, 'gold', "ברוך אתה ה'");
  marker('shma.ki', 123, 'blue', 'כי אתה שומע'); marker('shma.end', 134, 'gold', "ברוך אתה ה'");

  // extra glowing slab between ברך עלינו and תקע (hidden until highlighted)
  { const g = new THREE.Group(); g.position.set(0, 0, 64.5); G.add(g); const st = { z: 64.5, x: 0, group: g }, slab = box(3.0, .26, 2.2, 0xffe08a, { pos: [0, .1, 0] }); g.add(slab); st.mats = [slab.material];
    addGlow(g, 6.5, 5, st); st.extra = a => { slab.visible = a > .01; slab.position.y = lerp(-.2, .15, ease.out(a)); }; finish('extra', st, null, 0, 0); slab.visible = false; }
  // three footprints (toes point backwards)
  { const g = new THREE.Group(); G.add(g); [[-.3, 181.2], [.3, 183.2], [-.3, 185.2]].forEach(([x, z]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.62, 1.24), new THREE.MeshBasicMaterial({ map: footTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, SLAB_Y + .02, z); g.add(m); }); const st = { z: 183.2, x: 0, group: g }; addGlow(g, 4, 8, st); st.glow.position.set(0, SLAB_Y + .03, 183.2); st.beam.position.set(0, 22, 183.2); finish('footprints', st, null, 0, 0); }

  // ---- fields + clouds beside ברך עלינו; blue banners beside שמע קולנו ----
  if (opts.fields !== false) {
    const wr = rng(51), wheat = [], wcol = ['#e0b840', '#d4a634', '#ecc858', '#c99a2c'];
    for (const sx of [-1, 1]) { const fg = new THREE.Group(); const pl = new THREE.Mesh(new THREE.PlaneGeometry(11, 38), new THREE.MeshLambertMaterial({ map: wheatTex(), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
      pl.rotation.x = -Math.PI / 2; pl.position.set(sx * 10.1, .05, 41); pl.receiveShadow = true; fg.add(pl); G.add(fg); revealables.push({ z: 21, group: fg, keep: true });
      for (let i = 0; i < 2100; i++) wheat.push({ x: sx * (4.6 + wr() * 11), z: 22 + wr() * 38, s: .8 + wr() * .6, ph: wr() * 6.28, col: wcol[Math.floor(wr() * 4)] }); }
    const wm = inst(new THREE.ConeGeometry(.075, .95, 4), toon(0xffffff), wheat.map(w => ({ x: w.x, y: .6, z: w.z, sx: w.s, sy: w.s, sz: w.s, col: w.col })), { receive: false }); G.add(wm);
    ups.push(t => { wheat.forEach((w, i) => { DUM.position.set(w.x, .05 + .48 * w.s, w.z); DUM.rotation.set(Math.sin(t * 1.7 + w.ph + w.x * .3) * .13, 0, Math.sin(t * 1.3 + w.ph * 2 + w.z * .2) * .13); DUM.scale.set(w.s, w.s, w.s); DUM.updateMatrix(); wm.setMatrixAt(i, DUM.matrix); }); wm.instanceMatrix.needsUpdate = true; });
    const cls = []; [[-17, 12, 26, 4.5], [18, 13, 33, 5], [-24, 15, 44, 5.5], [14, 11.5, 52, 4.2], [-15, 12.5, 58, 4.6], [24, 14, 37, 5]].forEach(([x, y, z, s], i) => { const cl = cloud({ seed: 60 + i, size: s, pos: [x, y, z], puffs: 6, cast: false }); G.add(cl); cls.push([cl, x, z]); });
    ups.push(t => cls.forEach(([cl, x, z], i) => { cl.position.z = z + Math.sin(t * .2 + i) * 1.2 + t * .25; cl.position.x = x + Math.cos(t * .17 + i * 2) * 1.2; }));
    const fb = new THREE.Group(), flagM = new THREE.MeshLambertMaterial({ color: 0x4a93d8, side: THREE.DoubleSide }), flags = [];
    for (let z = 108; z <= 133; z += 6.2) for (const sx of [-1, 1]) { const pole = cyl(.05, .05, 3.6, 0xb89a5a, { pos: [sx * 3.4, 1.8, z], ink: false }); fb.add(pole);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .7), flagM); f.position.set(sx * 3.4, 3.2, z + .55); fb.add(f); flags.push([f, z, sx]); }
    G.add(fb); revealables.push({ z: 108, group: fb, keep: true }); ups.push(t => flags.forEach(([f, z, sx], i) => { f.rotation.y = Math.sin(t * 2.2 + i) * .35; }));
  }
  // sefard decor: a sun over the summer lane and a raining cloud over the winter lane
  let sunSet = () => {}, cloudSet = () => {};
  if (sef) {
    const sg = new THREE.Group(); sg.position.set(-LANE, 8.2, 33); G.add(sg);
    sg.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffd23a, fog: false })));
    const gs = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT('rgba(255,225,110,.95)', 'rgba(255,200,60,0)'), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })); gs.scale.set(8, 8, 1); sg.add(gs);
    const rays = new THREE.Group(); sg.add(rays); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832, r = new THREE.Mesh(new THREE.ConeGeometry(.2, 1, 4), new THREE.MeshBasicMaterial({ color: 0xffc21a, fog: false })); r.position.set(Math.cos(a) * 1.95, Math.sin(a) * 1.95, 0); r.rotation.z = a - Math.PI / 2; rays.add(r); }
    ups.push(t => { rays.rotation.z = t * .25; });
    const cg = new THREE.Group(); cg.position.set(LANE, 8, 33); G.add(cg); const wc = cloud({ seed: 77, size: 1.7, color: 0xb9c3cf, puffs: 6, cast: false }); cg.add(wc);
    rain(Wd, { x0: .6, x1: 3.2, z0: 27, z1: 39, top: 7.2, bottom: 0, count: 500, speed: 11, color: 0x6fa8e6, opacity: .9, seed: 9 });
    ups.push(t => { cg.position.y = 8 + Math.sin(t * .8) * .15; });
    sunSet = a => { const k = 1 + .5 * a; sg.scale.set(k, k, k); }; cloudSet = a => { const k = 1 + .5 * a; cg.scale.set(k, k, k); };
    revealables.push({ z: 21, group: sg, keep: true }, { z: 21, group: cg, keep: true });
    S.summer.extra = sunSet; S.barech.extra = cloudSet;
  }

  // ---- per-frame ----
  Wd.on(t => { for (const u of ups) u(t); });

  // ---- API ----
  const api = { group: G, stations: S, lane: LANE,
    z: n => Z[key(n)], x: n => laneX(key(n)), pos: (n, dz) => [laneX(key(n)), 0, Z[key(n)] + (dz || 0)],
    highlight: (n, a) => { const st = S[key(n)]; if (st) st.set(a); },
    reveal: zMax => { slabM.count = cnt(slabZ, zMax); curbM.count = cnt(curbZ, zMax);
      for (const r of revealables) { const on = zMax >= r.z - .5; r.group.visible = on; if (on && !r.keep) { const k = ease.out(clamp((zMax - r.z + .5) / 7, 0, 1)); r.group.scale.set(1, Math.max(.001, k), 1); } } } };
  api.reveal(1e9); return api;
}

// ====================================================================================
// arrow: a golden arc that grows from the boy to the target
export function arrow(Wd, from, to, o) {
  o = o || {}; const f = toV(from), tt = toV(to), dist = f.distanceTo(tt); f.y += o.fromY === undefined ? 1.5 : o.fromY; tt.y += o.toY === undefined ? .6 : o.toY;
  const h = o.height === undefined ? clamp(1.4 + dist * .33, 2.5, 64) : o.height, mid = f.clone().lerp(tt, .5); mid.y += h * 2;
  const curve = new THREE.QuadraticBezierCurve3(f, mid, tt), SEG = 140, rad = clamp(.09 + dist * .0045, .1, .8), col = o.color === undefined ? 0xffc531 : o.color;
  const core = new THREE.Mesh(new THREE.TubeGeometry(curve, SEG, rad, 8, false), new THREE.MeshBasicMaterial({ color: col, fog: false }));
  const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, SEG, rad * 2.6, 8, false), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  const head = new THREE.Mesh(new THREE.ConeGeometry(rad * 3.4, rad * 9, 12), new THREE.MeshBasicMaterial({ color: col, fog: false }));
  const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT('rgba(255,215,110,.95)', 'rgba(255,200,80,0)'), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })); ring.position.copy(tt);
  const g = new THREE.Group(); g.add(core, glow, head, ring); g.renderOrder = 4; core.frustumCulled = glow.frustumCulled = false; Wd.add(g);
  const Y = V3(0, 1, 0), tan = V3(), pt = V3(), q = new THREE.Quaternion(), per = 8 * 6;
  Wd.on(t => { const a = clamp(o.amount ? o.amount(t) : 1, 0, 1); g.visible = a > .004; const n = Math.floor(a * SEG);
    core.geometry.setDrawRange(0, n * per); glow.geometry.setDrawRange(0, n * per);
    curve.getPoint(a, pt); curve.getTangent(a, tan); q.setFromUnitVectors(Y, tan); head.quaternion.copy(q); head.position.copy(pt).addScaledVector(tan, rad * 3.5); head.visible = a > .01;
    const k = prog(a, .92, 1); ring.visible = k > 0; const s = Math.max(3, rad * 14) * (1 + .12 * Math.sin(t * 7)); ring.scale.set(s, s, 1); ring.material.opacity = .85 * k; });
  return g;
}

// drop: THE SIGNAL "he remembered" (identical in every film)
export function drop(Wd, pos, t0, o) {
  o = o || {}; const p = toV(pos); p.x += o.dx === undefined ? 1.0 : o.dx; p.z += o.dz === undefined ? .15 : o.dz; p.y = SLAB_Y;
  const T = 1.15, H = 16, prof = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI / 2; prof.push(new THREE.Vector2(.5 * Math.sin(a), -.5 * Math.cos(a))); }
  for (let i = 1; i <= 14; i++) { const y = i / 14; prof.push(new THREE.Vector2(.5 * Math.pow(1 - y, 1.7), y * 1.05)); }
  const dm = toon(0x2f93f0, { emissive: 0x0a3a7a }), dr = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), dm); dr.castShadow = true; ink(dr, .03, 0x0d2f5e); dr.scale.setScalar(1.15);
  const streak = new THREE.Mesh(new THREE.ConeGeometry(.3, 6, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); streak.position.y = 3.6;
  const fall = new THREE.Group(); fall.add(dr); fall.add(streak); Wd.add(fall);
  const ringM = new THREE.MeshBasicMaterial({ color: 0xbfe2ff, transparent: true, depthWrite: false, side: THREE.DoubleSide }), ring = new THREE.Mesh(new THREE.RingGeometry(.86, 1, 40), ringM); ring.rotation.x = -Math.PI / 2; Wd.add(ring);
  const pud = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x7cc0f5, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); pud.rotation.x = -Math.PI / 2; Wd.add(pud);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT('rgba(180,225,255,.95)', 'rgba(120,190,255,0)'), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })); Wd.add(flash);
  const rr = rng(5), sp = [], bm = toon(0x4aa6f5); for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.1 + rr() * .06, 8, 6), bm); Wd.add(m); sp.push({ m, a: i / 12 * 6.2832 + rr(), v: 1.6 + rr() * 1.8, w: 3.4 + rr() * 2.6 }); }
  Wd.on(t => { const u = t - t0, s = u - T; fall.visible = u >= 0 && u < T; ring.visible = flash.visible = s >= 0 && s < 1.4; pud.visible = s >= 0;
    if (fall.visible) { const k = u / T; fall.position.set(p.x, p.y + .55 + (H - .55) * (1 - k * k), p.z); dr.scale.set(1.15, 1.15 * (1 + .3 * k), 1.15); }
    if (s >= 0) { const e = clamp(s / .9, 0, 1), so = ease.out(e); ring.position.set(p.x, p.y + .03, p.z); ring.scale.setScalar(.3 + 2.9 * so); ringM.opacity = .9 * (1 - e);
      pud.position.set(p.x, p.y + .025, p.z); pud.scale.setScalar(.2 + .85 * ease.out(clamp(s / .35, 0, 1))); pud.material.opacity = s < 5 ? .55 : .55 * (1 - clamp((s - 5) / 3, 0, 1));
      flash.position.set(p.x, p.y + .8, p.z); flash.scale.setScalar(5 * (1 - clamp(s / 1.4, 0, 1)) + .01); flash.material.opacity = 1 - clamp(s / 1.4, 0, 1); }
    sp.forEach(q => { const on = s >= 0 && s < 1.2, y = p.y + q.v * s * 2.1 - 4.9 * s * s; q.m.visible = on && y > p.y; if (q.m.visible) q.m.position.set(p.x + Math.cos(q.a) * q.w * s * .55, y, p.z + Math.sin(q.a) * q.w * s * .55); }); });
  return fall;
}

// pop: a label that pops up at t0 and fades after dur
export function pop(Wd, text, pos, t0, dur, o) {
  o = o || {}; const sp = label(Wd, text, { pos: [pos[0], pos[1], pos[2]], height: o.height || .9, bg: o.bg || 'rgba(24,96,176,.95)', color: o.color || '#fff' }), b = sp.scale.clone(), y0 = pos[1];
  Wd.on(t => { const u = t - t0, k = ease.out(prog(u, 0, .45)) * (1 - ease.in(prog(u, dur, dur + .5))); sp.visible = k > .01; sp.scale.set(b.x * k, b.y * k, 1); sp.position.y = y0 + .7 * ease.out(prog(u, 0, .8)); });
  return sp;
}

// ====================================================================================
export const BOY = { kind: 'boy', coat: '#2b3a5a', hat: 'kippa', hatColor: '#101014', beardLen: 0, skin: '#f0d2b4', pants: '#1b1d24' };
export function route(keys, o) {   // keys: [[t, x, z, facing?], ...] -> t => {pos, facing, walk?}
  o = o || {}; const y = o.y === undefined ? SLAB_Y : o.y, K = keys.map(k => ({ t: k[0], x: k[1], z: k[2], f: k[3] })), n = K.length, seg = [];
  let ph = 0, head = K[0].f !== undefined ? K[0].f : (o.facing || 0);
  for (let i = 0; i < n - 1; i++) { const dx = K[i + 1].x - K[i].x, dz = K[i + 1].z - K[i].z, dist = Math.hypot(dx, dz), dt = Math.max(K[i + 1].t - K[i].t, 1e-3), mv = dist > .05, sp = dist / dt, rate = clamp(sp * 6.3, 3, 10);
    head = mv ? Math.atan2(dx, dz) : (K[i].f !== undefined ? K[i].f : head); seg.push({ mv, h: head, ph0: ph, rate }); if (mv) ph += rate * dt; }
  return t => { let i = 0; while (i < n - 2 && t > K[i + 1].t) i++; const l = clamp((t - K[i].t) / (K[i + 1].t - K[i].t || 1), 0, 1), s = seg[i];
    let h = s.h; if (i > 0) { const hp = seg[i - 1].h, d = Math.atan2(Math.sin(h - hp), Math.cos(h - hp)); h = hp + d * ease.sm(clamp((t - K[i].t) / .5, 0, 1)); }
    const out = { pos: [lerp(K[i].x, K[i + 1].x, l), y, lerp(K[i].z, K[i + 1].z, l)], facing: h }; if (s.mv && t < K[i + 1].t + 1e-6 && t >= K[0].t) { out.walk = s.ph0 + s.rate * (clamp(t, K[i].t, K[i + 1].t) - K[i].t); } return out; };
}
export function boy(Wd, fn, o) {
  const P = person(Wd, BOY, t => Object.assign({ groundY: SLAB_Y }, fn(t)), Object.assign({ scale: 1 }, o)); let done = false;
  Wd.on(() => { if (done || !P.figure) return; done = true; const h = P.figure.bones.handA.userData.hand, sd = new THREE.Group(); h.add(sd);
    const cov = box(.032, .15, .11, 0x5b1f2a, { pos: [0, 0, 0], inkW: .006 }), pg = box(.024, .138, .098, 0xf4ecd8, { pos: [-.004, 0, .004], ink: false }), sp = box(.036, .15, .014, 0xd9a63a, { pos: [0, 0, -.052], ink: false });
    sd.add(cov, pg, sp); sd.position.set(0, -.1, .0); sd.rotation.set(0, 0, 0); });
  return P;
}

// cine: camera in polar coordinates around a moving target (monotone Hermite: no overshoot, zero velocity at both ends)
export function cine(keys) {
  const K = keys.map(k => ({ t: k[0], v: [k[1][0], k[1][1], k[1][2], k[2], k[3], k[4], k[5] === undefined ? 45 : k[5], k[6] || 0] })), n = K.length;
  const dd = (i, j) => (K[i + 1].v[j] - K[i].v[j]) / (K[i + 1].t - K[i].t), tn = K.map((k, i) => k.v.map((_, j) => { if (i === 0 || i === n - 1) return 0; const a = dd(i - 1, j), b = dd(i, j); return a * b > 0 ? 2 * a * b / (a + b) : 0; }));
  return t => { let i = 0; while (i < n - 2 && t > K[i + 1].t) i++; const dt = K[i + 1].t - K[i].t, s = clamp((t - K[i].t) / dt, 0, 1), s2 = s * s, s3 = s2 * s;
    const v = K[i].v.map((_, j) => (2 * s3 - 3 * s2 + 1) * K[i].v[j] + (s3 - 2 * s2 + s) * dt * tn[i][j] + (-2 * s3 + 3 * s2) * K[i + 1].v[j] + (s3 - s2) * dt * tn[i + 1][j]), a = v[5] * D;
    return { pos: [v[0] + Math.sin(a) * v[3], v[1] + v[4], v[2] + Math.cos(a) * v[3]], look: [v[0], v[1] + v[7], v[2]], fov: v[6] }; };
}

// shots: captions spread in equal windows; ct(dur,n,i) = start second of caption i
export const ct = (dur, n, i) => .3 + i * (dur - .6) / n;
export function mkShot(dur, caps, build) { return { dur, caps, capAt: caps.map((_, i) => ct(dur, caps.length, i)), build }; }
