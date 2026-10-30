/* film_a helper props (digits only, no letters). Deterministic. */
import { THREE, toon, part, ell, tube, lathe, tubeAlong, V, sm, cl, frac } from '../../../lib/toon3d/toon3d.js';
import * as KT from '../../toldot07_kit/kit07.js';
const { M, box } = KT;
const G = (parent, pos) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); if (parent) parent.add(g); return g; };
export { G };

/* ---- digits sprite: a plane with canvas text (digits, comma, space, "km" only), always faces the camera ---- */
export function makeNum(text, o) {
  o = Object.assign({ h: 90, col: '#fff7d6', stroke: '#261c19', bg: null }, o || {});
  const cv = document.createElement('canvas'), c = cv.getContext('2d'), fs = 150;
  c.font = `900 ${fs}px Arial, Helvetica, sans-serif`;
  const tw = Math.ceil(c.measureText(text).width) + 60; cv.width = tw; cv.height = fs + 70;
  c.font = `900 ${fs}px Arial, Helvetica, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (o.bg) { c.fillStyle = o.bg; c.beginPath(); c.roundRect(8, 8, cv.width - 16, cv.height - 16, 40); c.fill(); }
  c.lineJoin = 'round'; c.lineWidth = 26; c.strokeStyle = o.stroke; c.strokeText(text, cv.width / 2, cv.height / 2 + 6);
  c.fillStyle = o.col; c.fillText(text, cv.width / 2, cv.height / 2 + 6);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const w = o.h * cv.width / cv.height;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, o.h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  m.renderOrder = 60; return m;
}
export const faceCam = (m, cam) => { m.quaternion.copy(cam.quaternion); };

/* ---- bead line: a dotted line of n beads along fn(u) -> THREE.Vector3; set(p) reveals the first p fraction ---- */
export function makeBeads(n, r, colr, ow) {
  const root = G(), mat = M(colr, '#d8b070', 0), beads = [];
  for (let i = 0; i < n; i++) beads.push(part(root, ell(r, r, r, 10, 8), mat, ow == null ? 1.2 : ow));
  root.userData.set = (fn, prog, t, lift) => { beads.forEach((b, i) => { const u = i / (n - 1); const vis = u <= prog; b.visible = vis; if (!vis) return;
    const p = fn(u); const pop = sm((prog - u) * 14 + 0.2); b.position.set(p.x, p.y + (lift || 0) + 1.5 * Math.sin(t * 6 + i), p.z); b.scale.setScalar(pop * (1 + 0.15 * Math.sin(t * 8 + i * 0.7))); }); };
  return root;
}

/* ---- flat glow disc on the map ---- */
export function makeGlow(r, colr) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: colr, transparent: true, opacity: 0.4, depthWrite: false }));
  m.renderOrder = 8; return m;
}
export function makeRing(r, w, colr) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r - w, r, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: colr, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 9; return m;
}

/* ---- Kinneret-like pear shaped lake (flat) ---- */
export function lakeShape(s) {
  const sh = new THREE.Shape(); sh.moveTo(0, 1.0 * s); sh.bezierCurveTo(0.7 * s, 0.9 * s, 0.9 * s, 0.1 * s, 0.5 * s, -0.7 * s); sh.bezierCurveTo(0.2 * s, -1.1 * s, -0.5 * s, -0.8 * s, -0.55 * s, -0.2 * s);
  sh.bezierCurveTo(-0.6 * s, 0.5 * s, -0.4 * s, 0.9 * s, 0, 1.0 * s); return sh;
}

/* ---- compass rose lying on sand: 4 points + ring, W point lights up (no letters) ---- */
export function makeCompass(R) {
  const g = G(), base = M('#c9a46a', '#b08a60', 0), dark = M('#7a4a2a', '#7a4a2a', 0);
  part(g, new THREE.CylinderGeometry(R, R * 1.03, 5, 40), M('#ead7a6', '#d8c28c', 0), 3, [0, 2.5, 0]);
  part(g, new THREE.TorusGeometry(R * 0.82, 3.5, 6, 40).rotateX(Math.PI / 2), dark, 1.2, [0, 6, 0]);
  const pts = [];
  [0, 1, 2, 3].forEach(i => { const a = [0, -Math.PI / 2, Math.PI, Math.PI / 2][i], sh = new THREE.Shape(); const L = i === 3 ? R * 0.98 : R * 0.8;
    sh.moveTo(0, R * 0.12); sh.lineTo(L, 0); sh.lineTo(0, -R * 0.12); sh.lineTo(-R * 0.1, 0); sh.lineTo(0, R * 0.12);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 4, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
    const mat = i === 3 ? M('#ffe27a', '#e8c050', 0) : (i % 2 ? dark : M('#b5653d', '#a05030', 0));
    const m = part(g, geo, mat, 1.4, [0, 6, 0], [0, a, 0]); pts.push(m); });
  g.userData.W = pts[3]; g.userData.pts = pts;
  // glow ring under the west point
  const glow = new THREE.Mesh(new THREE.CircleGeometry(R * 0.35, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#fff0a0', transparent: true, opacity: 0, depthWrite: false }));
  glow.position.set(0, 11, -R * 0.75); g.add(glow); g.userData.glow = glow;
  return g;
}
/* the west arrow of the rose points toward -z when the rose is rotated by +PI/2 around y (rotation.y = PI/2 maps local -x ... see use) */

/* ---- cartoon fence and gate (wood), appears with u 0..1 ---- */
export function makeFence(len) {
  const g = G(), w = M('#b88650', '#c49a84'), wd = M('#8a5a3a', '#b08a7a'), n = Math.round(len / 90);
  const posts = [];
  for (let i = 0; i <= n; i++) { const x = -len / 2 + i * len / n, p = box(g, 18, 150, 18, wd, [x, 75, 0], 2.2, null, 3); posts.push(p); }
  for (const y of [60, 110]) box(g, len, 14, 8, w, [0, y, 0], 1.8, null, 2);
  // gate in the middle: two leaves with a cross brace (diagonal), arch on top
  const gate = G(g, [0, 0, 0]);
  box(gate, 170, 190, 14, wd, [0, 95, 0], 2.4, null, 3).visible = false;
  for (const s of [-1, 1]) { const leaf = G(gate, [s * 85, 0, 0]); box(leaf, 76, 170, 8, w, [-s * 40, 85, 0], 2, null, 2);
    box(leaf, 90, 8, 10, wd, [-s * 40, 85, 0], 1.4, [0, 0, s * 0.8], 1); }
  box(gate, 190, 20, 20, wd, [0, 190, 0], 2.2, null, 4);
  for (const s of [-1, 1]) box(gate, 20, 200, 20, wd, [s * 95, 100, 0], 2.2, null, 4);
  return g;
}
/* smoke poof (n puffs) u 0..1 */
export function makePoof(n, R) {
  const g = G(), m = M('#ffffff', '#d8dcee', 0), items = [];
  const r = KT.rng(5);
  for (let i = 0; i < n; i++) { const p = part(g, ell(1, 1, 1, 14, 10), m, 2.4); items.push({ p, a: r() * 6.28, d: 0.3 + r() * 0.7, y: r() * 0.8, s: 0.5 + r() * 0.7 }); }
  g.userData.set = u => { g.visible = u > 0 && u < 1; items.forEach(it => { const k = sm(u * 1.4); it.p.position.set(Math.cos(it.a) * it.d * R * k, 40 + it.y * R * 0.7 * k, Math.sin(it.a) * it.d * R * 0.5 * k); it.p.scale.setScalar(R * 0.2 * it.s * (0.4 + k) * (1 - sm((u - 0.6) / 0.4))); }); };
  return g;
}

/* ---- sun door: arched frame floating in the sea, leaf swings open ---- */
export function makeSunDoor() {
  const g = G(), fr = M('#8a5a3a', '#b08a7a'), gold = M('#e8c46a', '#c9a060', 0);
  const W = 600, H = 820;
  for (const s of [-1, 1]) box(g, 70, H, 70, fr, [s * (W / 2), H / 2, 0], 6, null, 10);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(W / 2, 35, 12, 28, Math.PI), fr); arch.position.set(0, H, 0); part(g, arch.geometry, fr, 6, [0, H, 0]);
  const leaf = G(g, [-W / 2 + 20, 0, 0]); const L = new THREE.Shape(); L.moveTo(0, 0); L.lineTo(W - 40, 0); L.lineTo(W - 40, H); L.absarc((W - 40) / 2, H, (W - 40) / 2, 0, Math.PI, false); L.lineTo(0, 0);
  const lg = new THREE.ExtrudeGeometry(L, { depth: 20, bevelEnabled: false }); part(leaf, lg, M('#c4894f', '#c49a84'), 4, [0, 0, -10]);
  part(leaf, ell(18, 18, 14, 12, 8), gold, 2, [W - 80, H * 0.45, 24]);
  g.userData.leaf = leaf; g.userData.open = u => { leaf.rotation.y = -sm(u) * 2.0; };
  return g;
}

/* ---- Mishkan model: standing gold boards with rings and a long bar sliding through their middle ---- */
export function makeMishkan() {
  const g = G(), gold = M('#e6b94a', '#c9a060'), ring = M('#a8782a', '#a8782a', 0), wd = M('#c08a54', '#b49a84');
  const N = 6, W = 22, H = 120, gap = 4; const total = N * (W + gap);
  part(g, new THREE.BoxGeometry(total + 20, 6, 30), wd, 2, [0, 3, 0]);
  const boards = [];
  for (let i = 0; i < N; i++) { const x = -total / 2 + (i + 0.5) * (W + gap); const b = box(g, W, H, 8, gold, [x, 6 + H / 2, 0], 2.2, null, 2); boards.push(b);
    for (const s of [-1, 1]) part(g, new THREE.TorusGeometry(6, 1.8, 6, 14), ring, 0, [x, 6 + H * 0.5, s * 5]); }
  const bar = part(g, tube(4.2, 4.2, total + 70, 14).rotateZ(Math.PI / 2).translate(-(total + 70) / 2, 0, 0), M('#d98a2a', '#b8782a'), 1.6, [0, 6 + H * 0.5, 8]);
  g.userData.bar = bar; g.userData.total = total;
  g.userData.slide = u => { const T = total + 70; bar.position.x = -T + T * sm(u); };
  return g;
}

/* ---- tiny cartoon plane (no flags, no markings), faces +x ---- */
export function makePlane() {
  const g = G(), white = M('#f4f6fa', '#c9d0e0'), blue = M('#3c78c8', '#8a96c8');
  part(g, ell(60, 14, 14, 24, 14), white, 2.4);
  for (const s of [-1, 1]) { part(g, ell(26, 3, 56, 16, 8), white, 2, [-4, -2, s * 44], [0, s * -0.35, 0]); part(g, ell(14, 3, 18, 10, 6), white, 1.6, [-52, 2, s * 14]); }
  part(g, ell(14, 24, 3, 12, 8), blue, 1.8, [-52, 18, 0]);
  part(g, ell(13, 8, 11, 12, 8), M('#8fd0ec', '#6fa0c8', 0), 1.4, [34, 6, 0]);
  return g;
}

/* ---- clock face (flat disc facing +z), hands from hours h (12-hour dial) ---- */
export function makeClock(R) {
  const g = G();
  part(g, new THREE.CylinderGeometry(R, R, 6, 40).rotateX(Math.PI / 2), M('#fff8e6', '#e0d4b0', 0), 3.2);
  part(g, new THREE.TorusGeometry(R, 3.4, 8, 40), M('#d98a2a', '#b8782a', 0), 1.2);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; box(g, 3, i % 3 ? 7 : 12, 2, M('#261c19', '#261c19', 0), [Math.sin(a) * R * 0.86, Math.cos(a) * R * 0.86, 4], 0, [0, 0, -a], 0.5); }
  const mh = G(g, [0, 0, 6]), hh = G(g, [0, 0, 7]);
  box(mh, 4, R * 0.78, 2, M('#261c19', '#261c19', 0), [0, R * 0.39, 0], 0, null, 0.6); box(hh, 5.5, R * 0.5, 2, M('#c0392b', '#c0392b', 0), [0, R * 0.25, 0], 0, null, 0.6);
  g.userData.set = h => { hh.rotation.z = -h / 12 * Math.PI * 2; mh.rotation.z = -h * Math.PI * 2; };
  return g;
}

/* ---- cartoon hill town: hill with tiny stone houses ---- */
export function makeHillTown(seed, s) {
  const g = G(), r = KT.rng(seed);
  part(g, ell(150 * s, 80 * s, 120 * s, 28, 14), M('#9ab864', '#c4cfc0'), 4, [0, 0, 0]);
  for (let i = 0; i < 7; i++) { const a = r() * 6.28, d = r() * 70 * s; const x = Math.cos(a) * d, z = Math.sin(a) * d * 0.8;
    box(g, 34 * s, 26 * s, 30 * s, M(['#efe2c2', '#e8d6ab', '#f3ead6'][i % 3], '#c9b08c'), [x, 66 * s * (1 - (d / (150 * s)) * 0.5), z], 2, [0, r(), 0], 3);
    part(g, new THREE.ConeGeometry(24 * s, 14 * s, 4).rotateY(Math.PI / 4), M('#c0392b', '#b08a9a'), 1.6, [x, 66 * s * (1 - (d / (150 * s)) * 0.5) + 20 * s, z]); }
  return g;
}

/* ---- notebook ---- */
export function makeNotebook() { const g = G(); box(g, 4, 34, 26, M('#2f5d8a', '#9a96b0'), [0, 0, 0], 1.6, null, 1); box(g, 1.6, 30, 22, M('#f6efdc', '#d6cbb8', 0), [2.8, 0, 0], 0.8, null, 0.5); return g; }

/* ---- flat map for the scroll: sea on the LEFT (west), land on the right, a bay-less straight coast ---- */
export function makeScrollMapTexture() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512; const c = cv.getContext('2d');
  c.fillStyle = '#f6e9c8'; c.fillRect(0, 0, 512, 512);
  c.fillStyle = '#5eb0e0'; c.beginPath(); c.moveTo(0, 0); c.lineTo(250, 0); c.bezierCurveTo(240, 90, 270, 140, 250, 220); c.bezierCurveTo(230, 300, 262, 400, 246, 512); c.lineTo(0, 512); c.fill();
  c.strokeStyle = '#2b6e9c'; c.lineWidth = 6; c.stroke();
  c.strokeStyle = '#8ad0f0'; c.lineWidth = 5; for (let y = 60; y < 512; y += 90) { c.beginPath(); c.moveTo(40, y); c.quadraticCurveTo(80, y - 18, 120, y); c.stroke(); }
  c.fillStyle = '#a9c870'; c.beginPath(); c.arc(380, 120, 52, 0, 7); c.fill(); c.fillStyle = '#c9a46a'; c.beginPath(); c.arc(360, 330, 70, 0, 7); c.fill();
  c.strokeStyle = '#7a4a2a'; c.lineWidth = 5; c.strokeRect(6, 6, 500, 500);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace; return tex;
}

/* ---- room (interior) with a window onto the sea; open on the camera side ---- */
export function makeRoom() {
  const g = G(), wall = M('#e9d9b8', '#cbb792', 0), pan = M('#a8703e', '#c49a84'), floor = M('#a9723f', '#c49a84', 0);
  // floor boards
  box(g, 900, 8, 700, floor, [0, -4, 0], 0, null, 1);
  for (let i = 0; i < 9; i++) box(g, 4, 1, 700, M('#8a5a3a', '#8a5a3a', 0), [-400 + i * 100, 1, 0], 0, null, 0.3);
  // back wall (z=-350) with window opening, window faces the sea at -z
  const wz = -350, WH = 420;
  box(g, 900, 120, 20, wall, [0, 60, wz], 0, null, 2);                       // sill part
  box(g, 900, WH - 300, 20, wall, [0, 300 + (WH - 300) / 2, wz], 0, null, 2); // lintel part
  box(g, 200, 180, 20, wall, [-350, 210, wz], 0, null, 2); box(g, 200, 180, 20, wall, [350, 210, wz], 0, null, 2);
  // window frame
  const fr = M('#7e4f2a', '#a08070');
  box(g, 500, 14, 26, fr, [0, 120, wz + 6], 1.6, null, 2); box(g, 500, 14, 26, fr, [0, 300, wz + 6], 1.6, null, 2);
  for (const x of [-250, 0, 250]) box(g, 14, 190, 26, fr, [x, 210, wz + 6], 1.6, null, 2);
  box(g, 560, 12, 70, M('#c08a54', '#b49a84'), [0, 118, wz + 30], 1.6, null, 2);
  // side walls and wainscot
  for (const s of [-1, 1]) { box(g, 20, 420, 700, wall, [s * 450, 210, 0], 0, null, 2); box(g, 24, 130, 700, pan, [s * 442, 65, 0], 0, null, 2); }
  box(g, 900, 130, 24, pan, [0, 65, wz + 6], 0, null, 2);
  // back wall behind camera (z=+350) so the room is closed in wide shots
  box(g, 900, 420, 20, wall, [0, 210, 350], 0, null, 2);
  // bookshelf left wall with coloured spines
  const sh = G(g, [-420, 0, 80]); box(sh, 30, 300, 220, M('#7e4f2a', '#a08070'), [0, 150, 0], 1.6, null, 3);
  const cols = ['#5b2a2a', '#20354f', '#3d2a1e', '#2d4a35', '#8a6a2a', '#44304f', '#7a2e2e'], rr = KT.rng(9);
  for (let rI = 0; rI < 4; rI++) { box(sh, 34, 5, 210, M('#a8703e', '#c49a84', 0), [1, 30 + rI * 70, 0], 0, null, 1);
    let z = -95; while (z < 90) { const w = 6 + rr() * 8, h = 40 + rr() * 22; box(sh, 24, h, w, M(cols[Math.floor(rr() * cols.length)], '#b09a90', 0), [4, 34 + rI * 70 + h / 2, z + w / 2], 0.8, null, 1); z += w + 1.5; } }
  // rug, hanging lamp, picture frames (no figures)
  box(g, 360, 3, 260, M('#8a2e2e', '#b07a7a', 0), [0, 2, 40], 0, null, 1); box(g, 330, 3.5, 230, M('#e8d6ab', '#cbb792', 0), [0, 2.5, 40], 0, null, 1); box(g, 280, 4, 180, M('#2a4a7a', '#7a8ab0', 0), [0, 3, 40], 0, null, 1);
  const lamp = G(g, [0, 410, 0]); part(lamp, tube(1.6, 1.6, 90, 6), M('#261c19', '#261c19', 0), 0); part(lamp, lathe([[0.01, 0], [34, 0], [30, 24], [10, 40], [0.01, 44]], 20), M('#e8c46a', '#c9a060'), 2.4, [0, -150, 0]);
  part(g, ell(14, 14, 14, 12, 8), M('#fff6c8', '#e0d0a0', 0), 0, [0, 262, 0]);
  for (const [x, y] of [[-300, 300], [300, 320]]) { box(g, 80, 56, 6, M('#7e4f2a', '#a08070'), [x, y, wz + 14], 1.4, null, 1.5); box(g, 66, 42, 4, M('#8fb8d8', '#a0c0d8', 0), [x, y, wz + 17], 0, null, 1); }
  // curtains
  for (const s of [-1, 1]) box(g, 40, 220, 14, M('#9a3a3a', '#c09090'), [s * 292, 220, wz + 16], 1.6, null, 3);
  return g;
}
export { M, box };
