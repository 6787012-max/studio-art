/* film_b helper library: section (cross-section water slab), rooms (kitchen / study with painted window view), bowl of water,
   two-storey house, ruler, pier, closed sefer, glow, mirror sheen. Deterministic; everything is a function of t. ASCII only. */
import { THREE, sm, cl, frac, V, toon, part, ell, tube, lathe, tubeAlong, RoundedBoxGeometry, OL, D2R } from '../../../lib/toon3d/toon3d.js';
import * as KT from '../../toldot07_kit/kit07.js';
const { M, rng } = KT;

export const ease = (t, a, b) => sm(cl((t - a) / (b - a), 0, 1));
export const lerp = (a, b, u) => a + (b - a) * u;
export const lerpv = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
export const blinkAt = (t, o) => frac(t / 3.3 + (o || 0)) < 0.045;
export const G = (parent, pos) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); if (parent) parent.add(g); return g; };
export const RB = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 2, r == null ? Math.min(w, h, d) * 0.12 : r);
export const bx = (parent, w, h, d, mat, pos, ow, rot, r) => part(parent, RB(w, h, d, r), mat, ow == null ? 2.2 : ow, pos, rot);
export const BM = (hex, o) => new THREE.MeshBasicMaterial(Object.assign({ color: new THREE.Color(hex), side: THREE.DoubleSide }, o || {}));
export const cyl = (r0, r1, h, seg) => new THREE.CylinderGeometry(r1, r0, h, seg || 24).translate(0, h / 2, 0);

/* ----------------------------------------------------------------- soft glow sprite */
export function makeGlow(col, r, o) {
  o = Object.assign({ alpha: 0.55 }, o || {});
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, col); g.addColorStop(0.35, col + '88'); g.addColorStop(1, col + '00');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: o.alpha }));
  s.scale.set(r * 2, r * 2, 1); s.renderOrder = 6;
  s.userData.update = (t, k) => { const kk = k == null ? 1 : k; s.material.opacity = o.alpha * kk * (0.8 + 0.2 * Math.sin(t * 2.2)); const sc = r * 2 * (1 + 0.05 * Math.sin(t * 1.7)); s.scale.set(sc, sc, 1); };
  return s;
}
export function makeSparkles(n, spread, seed) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
  c.fillStyle = '#fff6c8'; c.beginPath(); c.moveTo(32, 2); c.lineTo(38, 26); c.lineTo(62, 32); c.lineTo(38, 38); c.lineTo(32, 62); c.lineTo(26, 38); c.lineTo(2, 32); c.lineTo(26, 26); c.closePath(); c.fill();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const g = G(), r = rng(seed || 5), items = [];
  for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 })); s.renderOrder = 7; g.add(s); items.push({ s, ph: r(), x: (r() - 0.5) * spread, z: (r() - 0.5) * spread * 0.4, sp: 0.18 + r() * 0.16, sz: 7 + r() * 8 }); }
  g.userData.update = (t, k) => items.forEach(it => { const u = frac(it.ph + t * it.sp); it.s.position.set(it.x * (0.6 + u * 0.5), 10 + u * spread * 0.7, it.z); const a = Math.sin(Math.PI * u); it.s.material.opacity = 0.9 * a * (k == null ? 1 : k); it.s.scale.setScalar(it.sz * (0.5 + a)); });
  return g;
}

/* ----------------------------------------------------------------- section: cross-section water slab with a bed */
export function makeSection(o) {
  o = Object.assign({ x0: -2600, x1: 2600, nx: 200, zf: 170, zb: -170, bed: () => -520, bottom: -1000, topCol: '#7dd3f2', deepCol: '#2a73b8', seed: 3 }, o || {});
  const root = G(), nx = o.nx, N = nx + 1;
  const xs = Array.from({ length: N }, (_, i) => o.x0 + (o.x1 - o.x0) * i / nx);
  const bedY = xs.map(x => o.bed(x));
  // ---- water: front face + top surface + outline ribbon (dynamic)
  const mk = (verts, cols, idx, mat, ro) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(verts, 3)); if (cols) g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = ro || 0; root.add(m); return m; };
  const strip = n => { const idx = []; for (let i = 0; i < n - 1; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } return idx; };
  const cTop = new THREE.Color(o.topCol), cDeep = new THREE.Color(o.deepCol), cSurf = new THREE.Color('#b4ecfb');
  const fcol = new Float32Array(N * 6); for (let i = 0; i < N; i++) { fcol.set([cTop.r, cTop.g, cTop.b, cDeep.r, cDeep.g, cDeep.b], i * 6); }
  const front = mk(new Float32Array(N * 6), fcol, strip(N), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  const scol = new Float32Array(N * 6); for (let i = 0; i < N; i++) { scol.set([cSurf.r, cSurf.g, cSurf.b, cSurf.r, cSurf.g, cSurf.b], i * 6); }
  const topS = mk(new Float32Array(N * 6), scol, strip(N), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  const outl = mk(new Float32Array(N * 6), null, strip(N), BM(OL), 3);
  // light band (a second lighter ribbon just under the surface)
  const band = mk(new Float32Array(N * 6), null, strip(N), BM('#a6e4f8', { transparent: true, opacity: 0.55 }), 1);
  // ---- bed (static)
  const bpos = new Float32Array(N * 6), bcol = new Float32Array(N * 6), cs0 = new THREE.Color('#f0d99f'), cs1 = new THREE.Color('#c4a05e');
  for (let i = 0; i < N; i++) { bpos.set([xs[i], bedY[i], o.zf, xs[i], o.bottom, o.zf], i * 6); bcol.set([cs0.r, cs0.g, cs0.b, cs1.r, cs1.g, cs1.b], i * 6); }
  mk(bpos, bcol, strip(N), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }), 2);
  const tpos = new Float32Array(N * 6); for (let i = 0; i < N; i++) tpos.set([xs[i], bedY[i], o.zf, xs[i], bedY[i], o.zb], i * 6);
  mk(tpos, null, strip(N), BM('#f4e2b0'), 2);
  const opos = new Float32Array(N * 6); for (let i = 0; i < N; i++) opos.set([xs[i], bedY[i] + 3, o.zf + 1.5, xs[i], bedY[i] - 4, o.zf + 1.5], i * 6);
  mk(opos, null, strip(N), BM(OL), 3);
  // sand speckles on the front face (small darker dots) - deterministic
  const r = rng(o.seed), dots = G(root);
  for (let i = 0; i < 70; i++) { const x = o.x0 + r() * (o.x1 - o.x0), b = o.bed(x), y = b - 30 - r() * 200; const d = new THREE.Mesh(new THREE.CircleGeometry(5 + r() * 6, 8), BM('#b48d4e')); d.position.set(x, y, o.zf + 0.8); d.renderOrder = 2; dots.add(d); }
  // seaweed + shells + stones along the bed (dressing)
  const weeds = [];
  for (let i = 0; i < 30; i++) { const x = o.x0 + 120 + r() * (o.x1 - o.x0 - 240), b = o.bed(x); if (b > -60) continue;
    const g = G(root, [x, b, o.zf - 30 - r() * 90]); const hh = 90 + r() * 120, n = 2 + Math.floor(r() * 2);
    for (let k = 0; k < n; k++) { const a = (k - n / 2) * 20; part(g, tubeAlong([V(a, 0, 0), V(a + 12, hh * 0.5, 0), V(a - 6, hh, 0)], t => 9 * (1 - t) + 2, { segs: 12, radial: 6, flat: 0.5 }), M(['#4f9a4a', '#6fae4a', '#3f8a5a'][k % 3], '#a8c0b0', 0), 1.6); }
    g.userData.ph = r() * 6; weeds.push(g); }
  for (let i = 0; i < 12; i++) { const x = o.x0 + 100 + r() * (o.x1 - o.x0 - 200), b = o.bed(x); const s = KT.makeStone(i + 70, 0.6 + r() * 0.5); s.position.set(x, b, o.zf - 60 - r() * 80); root.add(s); }
  for (let i = 0; i < 8; i++) { const x = o.x0 + 100 + r() * (o.x1 - o.x0 - 200), b = o.bed(x); const s = KT.makeShell(i % 2 ? 'fan' : 'spiral', i + 9); s.position.set(x, b + 1, o.zf - 20); s.scale.setScalar(1.2); root.add(s); }
  // bubbles
  const bub = [], bm = M('#e8f8ff', '#cfe0f0', 0);
  for (let i = 0; i < 14; i++) { const m = part(root, ell(7, 7, 7, 8, 6), bm, 1.2); bub.push({ m, x: o.x0 + 200 + r() * (o.x1 - o.x0 - 400), ph: r(), sp: 0.12 + r() * 0.1, z: o.zf - 60 - r() * 60 }); }
  const sec = { root, xs, o, bedY: x => o.bed(x), N, front, topS, outl, band };
  /* hs[i] = surface height at xs[i]; xo[i] = optional x offset (steepening) */
  sec.setSurface = (hs, xo) => {
    const P = front.geometry.attributes.position.array, T = topS.geometry.attributes.position.array, O = outl.geometry.attributes.position.array, B = band.geometry.attributes.position.array;
    for (let i = 0; i < N; i++) {
      const h = hs[i], x = xs[i] + (xo ? xo[i] : 0), bt = Math.min(bedY[i], h - 0.5);
      P.set([x, h, o.zf, xs[i], bt, o.zf], i * 6); T.set([x, h, o.zf, x, h, o.zb], i * 6);
      O.set([x, h + 3.5, o.zf + 1.4, x, h - 4.5, o.zf + 1.4], i * 6);
      B.set([x, h - 3, o.zf + 0.6, x, Math.max(bt, h - 46), o.zf + 0.6], i * 6);
    }
    [front, topS, outl, band].forEach(m => { m.geometry.attributes.position.needsUpdate = true; });
  };
  sec.update = t => {
    weeds.forEach(g => { g.rotation.z = 0.16 * Math.sin(t * 1.3 + g.userData.ph); });
    bub.forEach(b => { const u = frac(b.ph + t * b.sp); const bd = o.bed(b.x); b.m.position.set(b.x + 14 * Math.sin(u * 14 + b.ph * 9), bd + 40 + u * Math.max(0, -bd - 60), b.z); b.m.scale.setScalar(0.6 + 0.8 * u); b.m.visible = bd < -100; });
  };
  sec.setSurface(xs.map(() => 0));
  return sec;
}

/* ----------------------------------------------------------------- painted window view (canvas) */
export function makeWindowView(w, h) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * h / w); const c = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  const W = cv.width, H = cv.height;
  /* mode 'day' | 'storm'; amp 0..1 wave height; rain 0..1 */
  mesh.userData.draw = (t, mode, amp, rain) => {
    const S = mode === 'storm';
    const sky = c.createLinearGradient(0, 0, 0, H * 0.6); sky.addColorStop(0, S ? '#39444f' : '#7cc8ee'); sky.addColorStop(1, S ? '#8793a0' : '#e4f4fb');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    // clouds
    c.lineWidth = 3; c.strokeStyle = '#261c19';
    const clouds = S ? [[90, 60, 90, '#56616d'], [260, 40, 120, '#4a545f'], [420, 80, 100, '#5d6873']] : [[110, 70, 60, '#ffffff'], [380, 50, 50, '#ffffff']];
    clouds.forEach(([x, y, r, col]) => { const xx = (x + t * (S ? 14 : 5)) % (W + 200) - 100; c.fillStyle = col; c.beginPath(); c.ellipse(xx, y, r, r * 0.42, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(xx - r * 0.5, y + 8, r * 0.6, r * 0.3, 0, 0, 7); c.fill(); });
    // sea
    const hz = H * 0.5;
    const rows = 9;
    for (let k = 0; k < rows; k++) {
      const u = k / (rows - 1), y0 = hz + (H - hz) * (u * u * 0.9 + 0.02), a = (3 + 40 * amp) * (0.25 + u * 1.2), wl = 90 + u * 200;
      c.fillStyle = S ? ['#2e5672', '#3a6787', '#2b4f6e'][k % 3] : ['#3e9ad6', '#4fa9e0', '#64c0ea'][k % 3];
      c.beginPath(); c.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) { const yy = y0 + a * Math.sin(x / wl * 6.283 - t * (1.2 + 0.4 * u) * (0.6 + amp) + k) * (0.5 + 0.5 * amp); c.lineTo(x, yy); }
      c.lineTo(W, H); c.closePath(); c.fill();
      c.strokeStyle = S ? '#1f3446' : '#2f7fc4'; c.lineWidth = 2; c.stroke();
      if (amp > 0.25 && k > 2) { c.fillStyle = '#ffffff'; for (let x = 0; x <= W; x += 32) { const phase = x / wl * 6.283 - t * (1.2 + 0.4 * u) * (0.6 + amp) + k; if (Math.sin(phase) > 0.93) { const yy = y0 + a * Math.sin(phase) * (0.5 + 0.5 * amp); c.beginPath(); c.ellipse(x, yy, 9 + 8 * u, 4 + 3 * u, 0, 0, 7); c.fill(); } } }
    }
    c.fillStyle = S ? '#7f8d99' : '#cfeaf6'; c.fillRect(0, hz - 2, W, 4);
    if (rain > 0) { c.strokeStyle = 'rgba(225,238,248,0.8)'; c.lineWidth = 2; const n = Math.floor(70 * rain); for (let i = 0; i < n; i++) { const x = (i * 97.3 + 31) % W, y = ((i * 53.7 + t * 520 * (0.8 + (i % 3) * 0.2)) % (H + 40)) - 20; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 10, y + 28); c.stroke(); } }
    tex.needsUpdate = true;
  };
  return mesh;
}

/* ----------------------------------------------------------------- rooms: back wall z=-450, left wall x=-1000, floor y=0, open to +z and +x */
export function makeRoom(kind) {
  const root = G(), r = rng(kind === 'kitchen' ? 4 : 9), K = kind === 'kitchen';
  const wallC = K ? '#f2d9a6' : '#e9d3a8', wainC = K ? '#4f8a8c' : '#6b4a32', floorC = K ? '#b9814d' : '#a8703e';
  const wall = M(wallC, '#cdb89a', 0), wain = M(wainC, '#8aa8a4'), woodD = M('#7e4f2a', '#b08a7a'), wood = M('#a8703e', '#c49a84');
  // floor planks (canvas texture)
  const fc = document.createElement('canvas'); fc.width = 512; fc.height = 512; const f = fc.getContext('2d');
  for (let i = 0; i < 12; i++) { f.fillStyle = ['#b8804c', '#a8723f', '#c08a56', '#af7745'][i % 4]; f.fillRect(0, i * 43, 512, 43); f.fillStyle = '#6a4326'; f.fillRect(0, i * 43, 512, 3);
    for (let k = 0; k < 3; k++) f.fillRect(((i * 211 + k * 170) % 512), i * 43, 3, 43); }
  const ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.NoColorSpace; ftex.wrapS = ftex.wrapT = THREE.RepeatWrapping; ftex.repeat.set(3, 2);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(3000, 1500).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: ftex })); floor.position.set(300, 0, 300); root.add(floor);
  // rug
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(900, 520, 1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: K ? '#c45a4a' : '#7a2e3a' })); rug.position.set(100, 1.2, 40); root.add(rug);
  const rug2 = new THREE.Mesh(new THREE.PlaneGeometry(820, 440, 1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: K ? '#f0d6a0' : '#d9b36a' })); rug2.position.set(100, 1.6, 40); root.add(rug2);
  const rug3 = new THREE.Mesh(new THREE.PlaneGeometry(740, 360, 1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: K ? '#c45a4a' : '#7a2e3a' })); rug3.position.set(100, 2.0, 40); root.add(rug3);
  // back wall with a window opening x -330..330, y 190..560
  const WZ = -450, wt = 40;
  const bw = (w, h, x, y) => bx(root, w, h, wt, wall, [x, y, WZ], 0);
  bw(2420, 190, 190, 95);                  // below the window
  bw(2420, 160, 190, 640);                 // above the window (ceiling 720)
  bw(660, 370, -670, 375);                 // left of the window
  bw(1060, 370, 870, 375);                 // right of the window
  // left wall
  bx(root, wt, 720, 1400, wall, [-1000, 360, 250], 0);
  // wainscot (lower panel) on both walls + baseboard
  bx(root, 2400, 150, 14, wain, [190, 75, WZ + 26], 1.6); bx(root, 14, 150, 1400, wain, [-980, 75, 250], 1.6);
  bx(root, 2400, 12, 20, woodD, [190, 150, WZ + 28], 1.4); bx(root, 20, 12, 1400, woodD, [-978, 150, 250], 1.4);
  bx(root, 2400, 20, 22, woodD, [190, 10, WZ + 30], 1.4); bx(root, 22, 20, 1400, woodD, [-976, 10, 250], 1.4);
  for (let i = 0; i < 12; i++) bx(root, 8, 120, 6, M(wainC, '#8aa8a4'), [-900 + i * 200, 75, WZ + 34], 1.2);
  // window frame, sill, mullions, view
  const fr = M('#f6efdc', '#d6cbb8', 0), win = makeWindowView(660, 370); win.position.set(0, 375, WZ + 22); root.add(win);
  bx(root, 700, 20, 30, fr, [0, 565, WZ + 24], 1.6); bx(root, 20, 390, 30, fr, [-340, 375, WZ + 24], 1.6); bx(root, 20, 390, 30, fr, [340, 375, WZ + 24], 1.6);
  bx(root, 760, 18, 70, fr, [0, 186, WZ + 40], 1.8);
  bx(root, 10, 370, 14, fr, [0, 375, WZ + 30], 1.2); bx(root, 660, 10, 14, fr, [0, 375, WZ + 30], 1.2);
  // curtains (plain) at the window sides
  const cur = M(K ? '#59a0a6' : '#8a3a3a', '#b8c0c8', 0); bx(root, 70, 400, 22, cur, [-385, 395, WZ + 52], 1.8, [0, 0, 0.03]); bx(root, 70, 400, 22, cur, [385, 395, WZ + 52], 1.8, [0, 0, -0.03]);
  bx(root, 880, 14, 14, woodD, [0, 600, WZ + 56], 1.4);
  // hanging lamp
  const lamp = G(root, [K ? 150 : 100, 0, -60]);
  part(lamp, tube(2.6, 2.6, 170, 8).translate(0, 600, 0), M('#2e2a28', '#2e2a28', 0), 0);
  part(lamp, lathe([[0.01, 0], [44, 0], [58, -14], [8, -52], [0.01, -52]], 24).translate(0, 600, 0), M('#d9a441', '#d8c4a0'), 2.2);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(13, 12, 10), new THREE.MeshBasicMaterial({ color: '#fff4c2' })); bulb.position.set(0, 568, 0); lamp.add(bulb);
  const glow = makeGlow('#ffd98a', 150, { alpha: 0.32 }); glow.position.set(0, 560, 0); lamp.add(glow);
  // wall decorations (no letters): framed pictures, clock
  const frame = (x, y, w, h, c1, c2) => { bx(root, w, h, 12, woodD, [x, y, WZ + 26], 1.6); bx(root, w - 20, h - 20, 8, M(c1, '#c8d0d8', 0), [x, y, WZ + 31], 0); part(root, ell((w - 40) * 0.3, (h - 40) * 0.25, 3, 14, 8), M(c2, '#c8d0d8', 0), 0, [x + 6, y - 6, WZ + 36]); };
  frame(-610, 420, 130, 100, '#a8d8ef', '#f4f0e0'); frame(640, 430, 110, 140, '#f0d9a0', '#7aa66a');
  const clk = G(root, [-760, 520, WZ + 30]); part(clk, tube(46, 46, 14, 32).rotateX(Math.PI / 2), M('#f6efdc', '#d6cbb8', 0), 2.4); clk.userData.h1 = bx(clk, 4, 28, 3, M('#261c19', '#261c19', 0), [0, 12, 10], 0); clk.userData.h2 = bx(clk, 3, 38, 3, M('#261c19', '#261c19', 0), [8, 8, 10], 0, [0, 0, -1]);
  // shelf with spines / jars on the left wall (z axis along the wall)
  const shelf = (y, items) => { bx(root, 120, 12, 700, wood, [-930, y, 150], 1.6); items(y); };
  if (K) {
    shelf(300, y => { for (let i = 0; i < 7; i++) { const jc = ['#e4a43a', '#8ab45a', '#d9604e', '#f0e0b0', '#7aa0c8'][i % 5]; part(root, cyl(18, 16, 40 + (i % 3) * 8, 14), M(jc, '#c8c0b0', 0), 1.6, [-930, y + 6, -130 + i * 90]); part(root, cyl(14, 14, 7, 12), M('#8a5a3a', '#b08a7a', 0), 1.2, [-930, y + 46 + (i % 3) * 8, -130 + i * 90]); } });
    shelf(430, y => { for (let i = 0; i < 4; i++) part(root, lathe([[0.01, 0], [30, 0], [34, 20], [30, 44], [20, 52], [0.01, 52]], 16), M(['#d9604e', '#f0e0b0', '#7aa0c8', '#e4a43a'][i], '#c8c0b0', 0), 2, [-930, y + 6, -90 + i * 150]); });
    // counter + cabinet along the back wall (left of the window)
    bx(root, 640, 150, 90, wood, [-640, 75, WZ + 70], 2); bx(root, 660, 16, 100, woodD, [-640, 158, WZ + 70], 2);
    for (let i = 0; i < 3; i++) { bx(root, 190, 120, 6, M('#c08a56', '#c49a84'), [-880 + i * 215, 78, WZ + 118], 1.4); part(root, ell(7, 7, 4, 8, 6), M('#d6b25a', '#d6b25a', 0), 1, [-840 + i * 215, 86, WZ + 124]); }
    const kettle = G(root, [-760, 166, WZ + 70]); part(kettle, lathe([[0.01, 0], [34, 0], [40, 30], [30, 54], [12, 62], [0.01, 62]], 20), M('#c9ced6', '#c0b8c8'), 2.2); part(kettle, tubeAlong([V(-32, 34, 0), V(-58, 52, 0), V(-62, 34, 0), V(-34, 26, 0)], 5, { segs: 12 }), M('#c9ced6', '#c0b8c8'), 1.4); part(kettle, tubeAlong([V(-24, 58, 0), V(0, 90, 0), V(24, 58, 0)], 4, { segs: 12 }), M('#2e2a28', '#2e2a28', 0), 1.2);
    for (let i = 0; i < 3; i++) part(root, lathe([[0.01, 0], [26, 0], [30, 30], [28, 36], [0.01, 36]], 16), M(['#d9604e', '#59a0a6', '#e4a43a'][i], '#c8c0b0'), 2, [-560 + i * 80, 166, WZ + 70]);
    // sacks, crate, stool, bucket
    part(root, ell(60, 56, 46, 18, 12), M('#d9c08a', '#c4aa80'), 2.2, [900, 56, -250]); part(root, ell(46, 50, 40, 18, 12), M('#cdb078', '#c4aa80'), 2.2, [830, 50, -330]);
    bx(root, 110, 80, 110, wood, [760, 40, -360], 2); bx(root, 110, 10, 110, woodD, [760, 84, -360], 2);
    const st = G(root, [-300, 0, 120]); part(st, cyl(34, 34, 8, 20), wood, 2, [0, 76, 0]); for (let a = 0; a < 3; a++) part(st, tube(4, 4, 76, 8), woodD, 1.2, [Math.cos(a * 2.1) * 24, 0, Math.sin(a * 2.1) * 24]);
    const pail = G(root, [-840, 0, 330]); part(pail, lathe([[0.01, 0], [30, 0], [36, 60], [0.01, 60]], 18), M('#8aa6bc', '#b0b8c8'), 2.2);
    // bread basket + onion string on the wall
    part(root, lathe([[0.01, 0], [30, 0], [44, 24], [0.01, 24]], 16), M('#c4965a', '#b08a7a'), 2, [-500, 166, WZ + 100]); part(root, ell(26, 12, 14, 14, 8), M('#d9a55a', '#c4aa80'), 1.6, [-500, 188, WZ + 100]);
  } else {
    // bookshelves flanking the window (colour spines)
    const shelfUnit = (cx) => { bx(root, 330, 600, 80, wood, [cx, 330, WZ + 50], 2); for (let s = 0; s < 4; s++) { const yy = 120 + s * 132; bx(root, 310, 10, 84, woodD, [cx, yy, WZ + 52], 1.2);
      let x = cx - 148; while (x < cx + 140) { const w = 12 + r() * 14, h = 70 + r() * 40; bx(root, w, h, 54, M(['#5b2a2a', '#20354f', '#3d2a1e', '#2d4a35', '#6a3a26', '#7a5a2a'][Math.floor(r() * 6)], '#b0a0a0', 0), [x + w / 2, yy + 5 + h / 2, WZ + 62], 0); x += w + 1; } } };
    shelfUnit(-740); shelfUnit(820);
    shelf(360, y => { for (let i = 0; i < 12; i++) bx(root, 36 + (i % 3) * 8, 70 + (i % 4) * 10, 20, M(['#5b2a2a', '#20354f', '#3d2a1e', '#2d4a35'][i % 4], '#b0a0a0', 0), [-930, y + 40, -130 + i * 55], 0); });
    // bench along the left wall + table with sefarim far left
    const bch = G(root, [-880, 0, 330]); bch.rotation.y = Math.PI / 2; bx(bch, 300, 14, 70, wood, [0, 80, 0], 2); bx(bch, 300, 90, 12, wood, [0, 130, -32], 2); for (const sx of [-1, 1]) bx(bch, 14, 80, 60, woodD, [sx * 130, 40, 0], 1.6);
  }
  // window sill props (small plant / two jars)
  part(root, lathe([[0.01, 0], [18, 0], [22, 30], [0.01, 30]], 14), M('#c4623a', '#c4aa80'), 1.6, [-250, 196, WZ + 40]);
  for (let i = 0; i < 5; i++) part(root, ell(18, 8, 8, 10, 6).rotateZ(i * 0.7), M('#4f9a4a', '#a8c0b0', 0), 1, [-250 + (i - 2) * 11, 232 + (i % 2) * 10, WZ + 40]);
  const room = { root, win, lamp, clock: clk, kind };
  room.update = (t, mode, amp, rain) => { win.userData.draw(t, mode, amp, rain); glow.userData.update(t); clk.userData.h2.rotation.z = -t * 0.3; };
  return room;
}

/* ----------------------------------------------------------------- bowl of water with ripples + cork */
export function makeBowl() {
  const root = G();
  const shell = lathe([[0.01, 0], [70, 0], [96, 14], [132, 60], [152, 100], [146, 100], [136, 72], [100, 26], [0.01, 18]], 48);
  part(root, shell, toon('#f6efdc', { tint: '#c8c4d8', regions: [{ below: 112, x0: 0, c: '#f6efdc', w: 0 }] }), 2.6);
  part(root, new THREE.TorusGeometry(149, 5.5, 8, 48).rotateX(Math.PI / 2), M('#4f86c8', '#9aa8d0', 0), 2, [0, 100, 0]);
  part(root, new THREE.TorusGeometry(116, 3, 6, 40).rotateX(Math.PI / 2), M('#4f86c8', '#9aa8d0', 0), 0, [0, 54, 0]);
  const yw = 84;
  const mat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uA: { value: 0 } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uT, uA; varying vec2 vP;
      float hf(vec2 p){ float k = 0.0698; return uA * (0.55 * sin(k * p.x - 3.4 * uT) + 0.35 * sin(-0.9 * k * p.x - 3.7 * uT + 1.3) + 0.22 * sin(0.7 * k * p.y + 2.6 * uT + 0.6 * sin(k * p.x))); }
      void main(){ float h = hf(vP) / 5.0; vec3 c = vec3(0.37, 0.71, 0.91);
        if (h > 0.35) c = vec3(0.70, 0.89, 0.98); if (h < -0.35) c = vec3(0.24, 0.58, 0.82);
        float r = length(vP); c = mix(c, vec3(0.15, 0.11, 0.10), smoothstep(133.0, 136.0, r));
        gl_FragColor = vec4(c, 1.0); }` });
  const water = new THREE.Mesh(new THREE.CircleGeometry(137, 64).rotateX(-Math.PI / 2), mat); water.position.y = yw; root.add(water);
  const cork = G(root); part(cork, cyl(11, 11, 18, 14), M('#c9985a', '#b08a7a'), 1.6); part(cork, cyl(8, 8, 3, 12), M('#e6c07f', '#b08a7a', 0), 0, [0, 18.2, 0]);
  const A_MAX = 5.2;
  const hf = (x, z, t, A) => { const k = 0.0698; return A * (0.55 * Math.sin(k * x - 3.4 * t) + 0.35 * Math.sin(-0.9 * k * x - 3.7 * t + 1.3) + 0.22 * Math.sin(0.7 * k * z + 2.6 * t + 0.6 * Math.sin(k * x))); };
  root.userData.update = (t, A) => { mat.uniforms.uT.value = t; mat.uniforms.uA.value = A; const cx = -22 + 18 * Math.sin(t * 0.7) * Math.min(1, A / 2), cz = 14; const h = hf(cx, cz, t, A), e = 8, sx = (hf(cx + e, cz, t, A) - hf(cx - e, cz, t, A)) / (2 * e);
    cork.position.set(cx, yw + h - 6, cz); cork.rotation.set(0, 0.5, -Math.atan(sx) * 1.2); };
  root.userData.cork = cork; root.userData.yw = yw; root.userData.hf = hf;
  return root;
}

/* ----------------------------------------------------------------- two-storey house (front faces +z), 6 m = 768 units */
export function makeHouse() {
  const root = G(), W = 520, D = 380, H = 640;
  const wall = M('#f1e0b8', '#cdb89a', 0), band = M('#d8c08a', '#b8a078', 0), roof = M('#b4513a', '#c09090'), frame = M('#f6efdc', '#d6cbb8', 0);
  bx(root, W, H, D, wall, [0, H / 2, 0], 2.6, null, 6);
  bx(root, W + 14, 22, D + 14, band, [0, 318, 0], 2, null, 4);                       // floor band
  bx(root, W + 24, 16, D + 24, band, [0, 4, 0], 2, null, 4);
  // gable roof: prism along x
  const sh = new THREE.Shape(); sh.moveTo(-D / 2 - 40, 0); sh.lineTo(0, 128); sh.lineTo(D / 2 + 40, 0); sh.closePath();
  const rg = new THREE.ExtrudeGeometry(sh, { depth: W + 80, bevelEnabled: true, bevelThickness: 6, bevelSize: 6, bevelSegments: 2 }); rg.translate(0, 0, -(W + 80) / 2); rg.rotateY(Math.PI / 2);
  part(root, rg, roof, 3, [0, H, 0]);
  bx(root, 60, 100, 60, M('#c9a98a', '#b08a7a'), [150, H + 110, -30], 2.2);
  const win = (x, y) => { bx(root, 92, 130, 14, frame, [x, y, D / 2 + 4], 1.8); bx(root, 70, 108, 8, M('#8fc4e4', '#a8b8d0', 0), [x, y, D / 2 + 10], 0); bx(root, 6, 108, 6, frame, [x, y, D / 2 + 14], 0); bx(root, 70, 6, 6, frame, [x, y, D / 2 + 14], 0); bx(root, 30, 134, 10, M('#3f7f9a', '#a0b4c0'), [x - 62, y, D / 2 + 8], 1.4); bx(root, 30, 134, 10, M('#3f7f9a', '#a0b4c0'), [x + 62, y, D / 2 + 8], 1.4); };
  win(-150, 470); win(150, 470); win(-170, 180);
  bx(root, 110, 200, 14, M('#8a5a3a', '#b08a7a'), [130, 100, D / 2 + 6], 2); part(root, ell(7, 7, 7, 8, 6), M('#d6b25a', '#d6b25a', 0), 1, [100, 100, D / 2 + 18]);
  bx(root, 150, 12, 70, M('#cfc6b4', '#b0a898'), [130, 6, D / 2 + 40], 1.6);
  return root;
}

/* ----------------------------------------------------------------- ruler post (0.5 m = 64 units) */
export function makeRuler(h) {
  h = h || 64; const root = G();
  bx(root, 18, h, 6, M('#f4d44a', '#c8b060', 0), [0, h / 2 + 4, 0], 2.2, null, 2);
  for (let i = 1; i <= 8; i++) { const y = 4 + i * h / 8; bx(root, i % 2 ? 9 : 14, 2, 8, M('#261c19', '#261c19', 0), [i % 2 ? -4.5 : -2, y, 3.5], 0); }
  bx(root, 40, 8, 30, M('#7e4f2a', '#b08a7a'), [0, 4, 0], 1.8);
  root.userData.top = h + 4;
  return root;
}

/* ----------------------------------------------------------------- pier (origin = land end, runs toward -z, deck top y=46) */
export function makePier(len) {
  len = len || 700; const root = G(), plank = M('#b98350', '#c49a84'), post = M('#6a4326', '#a08070');
  const nP = Math.floor(len / 40);
  for (let i = 0; i < nP; i++) bx(root, 230, 10, 36, i % 2 ? plank : M('#a8723f', '#c49a84'), [0, 41, -i * 40 - 20], 1.4, null, 2);
  for (const sx of [-1, 1]) bx(root, 12, 8, len, M('#7e4f2a', '#b08a7a'), [sx * 108, 34, -len / 2], 1.4, null, 2);
  for (let i = 0; i <= Math.floor(len / 140); i++) for (const sx of [-1, 1]) { part(root, tube(11, 11, 130, 10), post, 1.8, [sx * 108, -70, -i * 140]); bx(root, 20, 16, 20, post, [sx * 108, 52, -i * 140], 1.4); }
  // railing on both sides near the land end, bollards, lamp
  for (const sx of [-1, 1]) { bx(root, 6, 6, len * 0.55, post, [sx * 108, 98, -len * 0.28], 1.2); for (let i = 0; i < 5; i++) bx(root, 8, 52, 8, post, [sx * 108, 74, -i * 95], 1.2); }
  for (const z of [-len + 30, -len + 30]) for (const sx of [-1, 1]) part(root, cyl(12, 9, 26, 12), M('#3a3f48', '#8a8f98', 0), 1.6, [sx * 90, 46, z]);
  const rope = tubeAlong([V(-60, 52, -len + 90), V(-30, 56, -len + 100), V(0, 52, -len + 80), V(-30, 50, -len + 66), V(-50, 52, -len + 80)], 5, { segs: 24 }); part(root, rope, M('#d9c08a', '#c4aa80', 0), 1.2);
  bx(root, 54, 40, 54, M('#c08a56', '#c49a84'), [60, 66, -len + 130], 1.8); bx(root, 46, 34, 46, M('#d9a55a', '#c49a84'), [66, 100, -len + 128], 1.8, [0, 0.4, 0]);
  const stair = bx(root, 230, 20, 50, plank, [0, 20, 30], 1.4); bx(root, 230, 10, 40, plank, [0, 10, 65], 1.4);
  return root;
}

/* ----------------------------------------------------------------- shtender + closed sefer (glowing handled by caller) */
export function makeSeferStand(KP) {
  const sh = KP.makeShtender(); const top = sh.root.children[sh.root.children.length - 1]; top.children[top.children.length - 1].visible = false;
  const book = G(top, [2, 4, 0]);
  const cov = M('#5b2a2a', '#a88080'), pg = M('#f6efdc', '#d6cbb8', 0), gold = M('#d6b25a', '#b89a70', 0);
  bx(book, 28, 6, 40, cov, [0, 3, 0], 1.8, null, 2); bx(book, 24, 4, 36, pg, [0.5, 8, 0.5], 1.2, null, 1); bx(book, 28, 5, 40, cov, [0, 13, 0], 1.8, null, 2);
  bx(book, 20, 1.2, 3, gold, [0, 15.8, -8], 0); bx(book, 20, 1.2, 3, gold, [0, 15.8, 8], 0); bx(book, 1.2, 1.2, 26, gold, [-9, 15.8, 0], 0); bx(book, 1.2, 1.2, 26, gold, [9, 15.8, 0], 0);
  part(book, ell(5, 1.2, 5, 10, 6), gold, 0, [0, 16, 0]);
  sh.root.userData.book = book; return sh;
}

/* ----------------------------------------------------------------- mirror sheen (calm sea): painted sky + reflected clouds/boats, flat on the water */
export function makeMirror(boats) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024; const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 1024); g.addColorStop(0, '#d8f0fb'); g.addColorStop(0.5, '#9fd8f2'); g.addColorStop(1, '#62bde8'); c.fillStyle = g; c.fillRect(0, 0, 1024, 1024);
  c.fillStyle = '#ffffff'; [[150, 140, 120], [620, 260, 160], [880, 90, 90], [300, 520, 140], [760, 640, 120]].forEach(([x, y, r]) => { c.beginPath(); c.ellipse(x, y, r, r * 0.3, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + r * 0.4, y - r * 0.1, r * 0.6, r * 0.22, 0, 0, 7); c.fill(); });
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3; for (let i = 0; i < 26; i++) { const y = 20 + i * 39; c.beginPath(); c.moveTo(60 + (i * 83) % 300, y); c.lineTo(160 + (i * 83) % 300 + 120, y); c.stroke(); }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1 }));
  tex.repeat.set(2.2, 2.2); m.renderOrder = 1; m.position.y = 0.6;
  m.userData.setOp = (o) => { m.material.opacity = o; m.visible = o > 0.01; };
  return m;
}
