/* film_z set pieces: compass rose, question mark, trash props, harbour/port/section sets, dolphin, recap veil. ASCII only. */
import { THREE, sm, cl, frac, V, D2R, part, ell, tube, tubeAlong, lathe, toon, KT, W, GB, GM, GZ, GC, GK, cam, scene, ALL, flags, lerp, ease } from './z_core.js';
import { sea, seaS, foams, birds, blow1, blow2 } from './z_beach.js';
const PI = Math.PI, M = W.M, G = W.G, col = W.col, TERR = W.TERR;

/* ------------------------------------------------------------ beach tick */
export function beachTick(T, o) {
  o = o || {};
  if (flags.collect) return;
  const A = o.A == null ? 6 : o.A;
  sea.mesh.visible = !o.dusk; seaS.mesh.visible = !!o.dusk;
  sea.update(T, A); seaS.update(T, A);
  foams.forEach(f => f.update(T, o.foam == null ? 0.8 : o.foam)); birds.userData.update(T);
  blow1.update(T, o.blow == null ? 0.25 : o.blow); blow2.mesh.visible = false;
  compass.visible = false; qGroup.visible = false; trash.visible = false; bin.visible = false; mapOpen.visible = false; fgTufts.forEach(t => { t.visible = false; }); spots.forEach(s => { s.visible = false; });
}

/* ------------------------------------------------------------ compass rose lying in the sand (no letters). N=+x, E=+z, S=-x, W=-z (sea) */
export const compass = (() => {
  const g = G(GB), base = M('#f7ecd0', '#d8caa8', 0), ink = M('#b06a3a', '#8a5a3a', 0);
  part(g, new THREE.CylinderGeometry(120, 124, 8, 48), base, 2.8, [0, 4, 0]);
  part(g, new THREE.TorusGeometry(116, 6, 8, 56).rotateX(PI / 2), ink, 1.4, [0, 9, 0]);
  const shp = (L, w) => { const s = new THREE.Shape(); s.moveTo(0, -w); s.lineTo(L, 0); s.lineTo(0, w); s.lineTo(14, 0); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: 6, bevelEnabled: false }).rotateX(-PI / 2); };
  [[0, '#c9534a'], [PI, '#5b6f9a'], [-PI / 2, '#5b6f9a']].forEach(([a, c]) => { const w = part(g, shp(168, 28), M(c, '#a09ab0', 0), 2.2, [0, 8, 0]); w.rotation.y = a; });
  const wm = new THREE.MeshBasicMaterial({ color: col('#7d8aa8') });
  const wedge = new THREE.Mesh(shp(190, 32), wm); wedge.position.y = 9; wedge.rotation.y = PI / 2; g.add(wedge);
  const wo = new THREE.Mesh(shp(190, 32), new THREE.MeshBasicMaterial({ color: col('#261c19'), side: THREE.BackSide })); wo.scale.set(1.05, 1.4, 1.1); wo.position.y = 8; wo.rotation.y = PI / 2; g.add(wo);
  part(g, ell(14, 12, 14, 12, 8), ink, 1.6, [0, 14, 0]);
  const spark = W.makeSparkle(34, '#fff6c0'); g.add(spark); spark.position.set(0, 90, -190);
  g.userData.set = (k, T) => { wm.color.copy(col('#7d8aa8')).lerp(col('#ffd23a'), k).multiplyScalar(1 + 0.12 * k * Math.sin(T * 7)); wedge.scale.setScalar(1 + 0.08 * k * Math.sin(T * 7)); spark.visible = k > 0.5; spark.scale.setScalar(Math.max(0.001, k) * (0.8 + 0.3 * Math.sin(T * 5))); spark.rotation.z = T; };
  g.visible = false; return g;
})();

/* ------------------------------------------------------------ question mark path drawn by the gull (plane facing +z) */
export const qGroup = G(GB);
export const qCurve = (() => { const h = 360, pts = [], cy = 0.70 * h, r = 0.25 * h;
  for (let i = 0; i <= 26; i++) { const a = (190 - 220 * i / 26) * PI / 180; pts.push(V(r * Math.cos(a), cy + r * Math.sin(a), 0)); }
  pts.push(V(0, 0.38 * h, 0)); pts.push(V(0, 0.24 * h, 0)); return new THREE.CatmullRomCurve3(pts); })();
export const qDots = W.makeParticles(60, '#3a2a2c'); qGroup.add(qDots.mesh);
export const qDot = part(qGroup, ell(15, 15, 15, 12, 8), M('#3a2a2c', '#3a2a2c', 0), 2.2, [0, 20, 0]);
export function drawQ(u, base) {         // base: [x,y,z] of the bottom of the "?"
  qGroup.visible = true; qGroup.position.set(...base); qGroup.scale.setScalar(1.3);
  for (let i = 0; i < qDots.n; i++) { const s = (i + 0.5) / qDots.n; if (s > u) qDots.hide(i); else { const p = qCurve.getPointAt(Math.min(0.999, s)); qDots.set(i, p.x, p.y, p.z, 9); } }
  qDots.commit(); qDot.visible = u >= 1;
}

/* ------------------------------------------------------------ trash: plastic bag, bottle, bin */
export const trash = G(GB);
export const bag = (() => { const g = G(GK), tm = new THREE.MeshBasicMaterial({ color: col('#f4fbff'), transparent: true, opacity: 0.8, depthWrite: false }), tm2 = new THREE.MeshBasicMaterial({ color: col('#ffffff'), transparent: true, opacity: 0.62, depthWrite: false });
  const lumps = [[34, 44, 24, 11, 0.5, [0, 30, 0]], [22, 26, 20, 12, 0.5, [18, 26, 10]], [20, 30, 18, 13, 0.5, [-16, 32, 6]], [18, 20, 16, 14, 0.45, [4, 14, 14]]];
  lumps.forEach(([w, h, d, sd, rg, pp], i) => { const m = part(g, W.rockGeo(w, h, d, sd, rg), i % 2 ? tm2 : tm, 1.8, pp); m.rotation.y = i * 1.3; });
  const ink = M('#5f7288', '#5f7288', 0);
  [-1, 1].forEach(sx => part(g, tubeAlong([V(sx * 6, 56, 0), V(sx * 16, 78, 3), V(sx * 6, 96, 4), V(-sx * 6, 78, 2), V(sx * 4, 58, 0)], 2.4, { segs: 14 }), ink, 1.2));
  part(g, ell(7, 6, 7, 10, 8), ink, 1.2, [0, 56, 0]);
  [[-18, 36, 22, 0.5], [10, 22, 24, -0.4], [22, 44, 14, 0.9]].forEach(([x, y, z, r]) => { const w = part(g, new THREE.CylinderGeometry(1.4, 1.4, 26, 5), ink, 0, [x, y, z]); w.rotation.z = r; });
  g.visible = false; return g; })();
export const bottle = (() => { const g = G(GK), b = KT.makeWaterBottle(); b.rotation.z = 0.0; g.add(b); g.visible = false; return g; })();
export const bin = (() => { const g = G(GK), body = M('#4f9b5e', '#8fb89a'), lid = M('#2f6f42', '#6f9a7c');
  part(g, lathe([[0.01, 0], [46, 0], [58, 110], [0.01, 110]], 28), body, 2.8);
  part(g, new THREE.TorusGeometry(58, 7, 10, 40).rotateX(PI / 2), lid, 1.6, [0, 112, 0]);
  part(g, new THREE.CylinderGeometry(52, 52, 4, 28), M('#1f1c1c', '#1f1c1c', 0), 0, [0, 108, 0]);
  for (let i = 0; i < 3; i++) part(g, new THREE.BoxGeometry(10, 60, 4), M('#c9ecd0', '#c9ecd0', 0), 0, [-24 + i * 24, 60, 54 - Math.abs(i - 1) * 4]).rotation.z = 0;
  g.visible = false; return g; })();
export const spots = [];
export const fgTufts = [[-40, 1330, 1.0], [330, 1290, 0.9], [470, 1380, 1.1]].map(([x, z, s], i) => { const t = KT.makeGrassTuft(i + 900, { col: '#9cae5c', h: 120, n: 12 }); t.position.set(x, TERR(x, z), z); t.scale.setScalar(s); t.visible = false; GB.add(t); return t; });
export const mapOpen = KT.makeMapScroll(true); mapOpen.scale.setScalar(1.25); GK.add(mapOpen);

/* ------------------------------------------------------------ harbour, modern port, sea section */
export const HB = KT.makeHarbour({ A: 20 }); GZ.add(HB.root);
export const PORT = KT.makeModernPort(); GZ.add(PORT.root);
{ const r = W.rng(12);
  for (const root of [HB.root, PORT.root]) { for (let i = 0; i < 4; i++) { const c = KT.makeCloud(i + 301, { s: 3 + i * 0.3 }); c.position.set(-3500 + i * 2600, 1500 + (i % 2) * 400, -5200 - i * 300); root.add(c); }
    root.add(KT.makeHills({ a0: 0.2 * PI, a1: 0.8 * PI, dists: [7600, 9800], base: '#7fb85a', haze: '#d4e9f2', h: 900, n: 7 })); }
  // dressing for the bare quay (bollards done by the kit): crates, barrels, ropes on the modern quay
  const crate = [M('#b07a45', '#8a5a3a'), M('#c89a5a', '#9a7a5a'), M('#8a5a3a', '#6a4a3a')];
  for (let i = 0; i < 18; i++) { const x = -1700 + r() * 3400, z = 470 + r() * 110, s = 30 + r() * 22; W.box(PORT.root, s, s, s, crate[i % 3], [x, 80 + s / 2, z], 2, [0, r() * 3, 0], 3); }
  for (let i = 0; i < 7; i++) { const x = -1500 + i * 480 + r() * 80; part(PORT.root, lathe([[0.01, 0], [18, 0], [22, 18], [22, 44], [18, 54], [0.01, 54]], 14), M('#7a4a2a', '#5a3a2a'), 1.8, [x, 80, 452]); }
  for (let i = 0; i < 9; i++) part(PORT.root, new THREE.TorusGeometry(20, 5, 8, 18).rotateX(PI / 2), M('#c9a46a', '#a08060', 0), 1.2, [-1700 + i * 400 + r() * 60, 84, 436]);
  // crates and barrels on the harbour quay too
  for (let i = 0; i < 16; i++) { const x = -1200 + r() * 2600, z = 700 + r() * 140, s = 30 + r() * 24; W.box(HB.root, s, s, s, crate[i % 3], [x, 55 + s / 2, z], 2, [0, r() * 3, 0], 3); }
  for (let i = 0; i < 6; i++) { const x = -900 + i * 420 + r() * 60; part(HB.root, lathe([[0.01, 0], [18, 0], [22, 18], [22, 44], [18, 54], [0.01, 54]], 14), M('#7a4a2a', '#5a3a2a'), 1.8, [x, 55, 680]); }
}
export const SEC = KT.makeSeaSection(); GC.add(SEC.root);
for (let i = 0; i < 5; i++) { const c = KT.makeCloud(i + 401, { s: 2.4 }); c.position.set(-1800 + i * 1000, 900 + (i % 2) * 150, -1500); GC.add(c); }

/* ------------------------------------------------------------ dolphin (same outline style, simple) */
export const DOL = (() => {
  const root = G(), body = G(root), gm = M('#7f98b0', '#a8b6d0'), bm = M('#eaf0f4', '#c8d0dc', 0), tail = G(body, [-120, 0, 0]), ink = M('#261c19', '#261c19', 0);
  part(body, ell(130, 44, 40, 30, 20), gm, 3, [0, 0, 0]); part(body, ell(100, 24, 34, 20, 12), bm, 0, [14, -16, 0]);
  part(body, ell(48, 15, 16, 16, 10), gm, 2.4, [150, -4, 0]);
  const df = part(body, new THREE.ConeGeometry(20, 58, 8).translate(0, 29, 0), gm, 2.2, [-10, 36, 0]); df.rotation.z = 0.7;
  part(tail, ell(70, 17, 15, 18, 10), gm, 2.4, [-40, 0, 0]);
  part(tail, ell(26, 5, 64, 16, 8), gm, 2.4, [-96, 0, 0]);
  [1, -1].forEach(s => { const f = part(body, ell(36, 6, 15, 12, 8), gm, 2, [34, -34, s * 40]); f.rotation.set(s * 0.5, 0, -0.5);
    part(body, ell(13, 15, 4, 12, 8), M('#ffffff', '#ffffff', 0), 0, [112, 12, s * 33]); part(body, ell(6, 8, 3, 10, 6), ink, 0, [116, 12, s * 36]);
    part(body, tubeAlong([V(190, -10, s * 24), V(160, -14, s * 30), V(126, -2, s * 34)], 2.3, { segs: 12 }), ink, 0); });
  root.userData.update = (t) => { body.rotation.z = 0.06 * Math.sin(t * 4); tail.rotation.z = 0.42 * Math.sin(t * 4 + 1); };
  root.visible = false; scene.add(root); ALL.push(root); return root;
})();
export const FISH = [['#4f9fe0', '#ffd45a', '#f08a3c'], ['#f08a3c', '#ffe08a', '#e0453a'], ['#6fc27a', '#eaf6c4', '#3f8f5a'], ['#e0653a', '#ffd45a', '#4f9fe0'], ['#9a7fd0', '#f1e6ff', '#e07ab0']].map(([b, bl, f]) => {
  const x = KT.makeFish({ body: b, belly: bl, fin: f }); scene.add(x.root); ALL.push(x.root); return x; });
export const CRAB = KT.makeCrab(); scene.add(CRAB.root); ALL.push(CRAB.root);
export const gasGlow = (() => { const g = G(GC);
  const mk = (a) => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); const gr = c.createRadialGradient(64, 64, 2, 64, 64, 62);
    gr.addColorStop(0, 'rgba(255,240,150,' + a + ')'); gr.addColorStop(0.35, 'rgba(255,205,60,' + a * 0.6 + ')'); gr.addColorStop(1, 'rgba(255,170,30,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; return t; };
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: mk(0.9), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.set(520, 420, 1); halo.position.set(0, 90, 6); g.add(halo);
  const core = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: mk(1), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); core.scale.set(190, 130, 1); core.position.set(0, 10, 8); g.add(core);
  const bub = W.makeParticles(46, '#fff7b8'); g.add(bub.mesh);
  g.userData.update = (T, k) => { halo.material.opacity = 0.5 + 0.5 * k * (0.75 + 0.25 * Math.sin(T * 4)); halo.scale.set(520 * (0.85 + 0.15 * k), 420 * (0.85 + 0.15 * k), 1); core.scale.set(190 * (0.85 + 0.2 * k), 130 * (0.85 + 0.2 * k), 1);
    for (let i = 0; i < bub.n; i++) { const u = frac(T * 0.22 + i * 0.173); bub.set(i, -70 + ((i * 53) % 140) + 22 * Math.sin(T * 1.7 + i), -10 + u * 520, 10, (7 + (i % 4) * 3) * (0.5 + 0.8 * k)); } bub.commit(); };
  g.position.set(560, -430, 304); g.visible = true; return g; })();

/* ------------------------------------------------------------ recap veil: a soft dark ellipse fixed to the camera (centre calm for 3 burned lines) */
export const veil = (() => {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 288; const c = cv.getContext('2d');
  const gr = c.createRadialGradient(256, 144, 20, 256, 144, 250); gr.addColorStop(0, 'rgba(14,20,44,0.20)'); gr.addColorStop(0.55, 'rgba(14,20,44,0.14)'); gr.addColorStop(1, 'rgba(14,20,44,0)');
  c.save(); c.translate(256, 144); c.scale(1, 0.5); c.translate(-256, -144); c.fillStyle = gr; c.fillRect(-100, -300, 712, 900); c.restore();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  m.renderOrder = 100; m.visible = false; cam.add(m); return m;
})();
export function veilUpdate(on) { veil.visible = !!on; if (on) { const d = 60, h = 2 * d * Math.tan(cam.fov * D2R / 2), w = h * 16 / 9; veil.position.set(0, 0, -d); veil.scale.set(w * 0.9, h * 0.9, 1); } }

window.__z = { fgTufts, compass };
