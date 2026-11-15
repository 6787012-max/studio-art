/* props - film_s2 pieces: map paths (coast, Jordan, outline), glowing tubes, brass clock, digit plaques, big table globe, lectern + book, icon board.
   ASCII only. No people, no text (digits only on plaques). Pure functions of their arguments. */
import * as K from '../toldot10g_kit/kit10g.js';
const { THREE } = K;

export function densify(wps, step) {
  const out = [];
  for (let i = 0; i < wps.length - 1; i++) {
    const a = wps[i], b = wps[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  out.push(wps[wps.length - 1]); return out;
}
/* west coast: for each latitude the first land longitude (bisection on the sea mask) */
export function coastWps(latA, latB, n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const lat = latA + (latB - latA) * i / n; let lo = 34.05, hi = 35.5;
    for (let k = 0; k < 16; k++) { const mid = (lo + hi) / 2; if (K.surf(lat, mid).sea > 0.5) lo = mid; else hi = mid; }
    out.push([lat, hi]);
  }
  return out;
}
export const JORDAN = [[33.20, 35.62], [33.05, 35.62], [32.92, 35.60], [32.80, 35.60], [32.69, 35.57], [32.50, 35.55], [32.30, 35.55], [32.00, 35.55], [31.80, 35.54], [31.55, 35.47], [31.25, 35.47], [31.00, 35.40], [30.60, 35.15], [30.00, 35.00], [29.55, 34.95]];
export const NORTHB = [[33.09, 35.10], [33.10, 35.35], [33.20, 35.62]];
export const EGYPT = [[29.55, 34.95], [31.25, 34.27]];
export function outlineWps() {
  const c = coastWps(31.25, 33.09, 50);
  return densify(c.concat(NORTHB.slice(1)).concat(JORDAN.slice(1)).concat(EGYPT.slice(1)), 0.05);
}
export const toPts = (wps, lift) => wps.map(([la, lo]) => K.pointOf(la, lo, lift));

/* glowing tube along points; set(u, op) draws the first u of the path. group holds core + soft halo + a glow at the tip */
export function makeGlowTube(pts, r, core, halo) {
  const g = new THREE.Group(), curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3), seg = Math.max(8, pts.length), RAD = 8;
  const g1 = new THREE.TubeGeometry(curve, seg, r, RAD, false), g2 = new THREE.TubeGeometry(curve, seg, r * 3, RAD, false);
  const m1 = new THREE.MeshBasicMaterial({ color: core, transparent: true, opacity: 0, depthWrite: false });
  const m2 = new THREE.MeshBasicMaterial({ color: halo, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const a = new THREE.Mesh(g1, m1), b = new THREE.Mesh(g2, m2); a.frustumCulled = b.frustumCulled = false; g.add(a, b);
  const head = K.glowSprite(halo, r * 16, 0); g.add(head);
  const api = {
    group: g, curve, head,
    set(u, op) {
      u = K.clamp(u); const n = Math.ceil(seg * u) * RAD * 6; g1.setDrawRange(0, n); g2.setDrawRange(0, n);
      m1.opacity = op; m2.opacity = 0.42 * op; g.visible = op > 0.003 && u > 0.002;
      head.position.copy(curve.getPoint(u)); head.material.opacity = op * 0.85 * (u < 0.999 ? 1 : 0.5);
    }
  };
  api.set(0, 0); return api;
}

/* brass alarm clock standing on y = 0, face toward +z. setTurns(m): minute hand turns m times */
export function makeClock(R) {
  const g = new THREE.Group(), brass = K.phong('#c9a24a', { shininess: 90, specular: '#fff2c0' }), cy = R + 2.5;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 4, 40).rotateX(Math.PI / 2), brass); body.position.y = cy; g.add(K.shadowable(body));
  const c = K.cvs(256, 256), x = c.getContext('2d'); x.fillStyle = '#f6efd9'; x.beginPath(); x.arc(128, 128, 127, 0, 7); x.fill();
  x.strokeStyle = '#2a1c08'; x.lineCap = 'round';
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, big = i % 5 === 0; x.lineWidth = big ? 8 : 3; x.beginPath();
    x.moveTo(128 + Math.sin(a) * (big ? 92 : 108), 128 - Math.cos(a) * (big ? 92 : 108)); x.lineTo(128 + Math.sin(a) * 120, 128 - Math.cos(a) * 120); x.stroke(); }
  const face = new THREE.Mesh(new THREE.CircleGeometry(R * 0.92, 48), new THREE.MeshLambertMaterial({ map: K.ctex(c) })); face.position.set(0, cy, 2.05); g.add(face);
  const hands = new THREE.Group(); hands.position.set(0, cy, 2.5); g.add(hands);
  const dark = K.lam('#2a1c08');
  const mh = new THREE.Group(), hh = new THREE.Group(); hands.add(hh, mh);
  const mb = new THREE.Mesh(new THREE.BoxGeometry(R * 0.09, R * 0.78, 0.5), dark); mb.position.y = R * 0.34; mh.add(mb);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(R * 0.12, R * 0.5, 0.5), dark); hb.position.y = R * 0.22; hh.add(hb);
  const pv = new THREE.Mesh(new THREE.SphereGeometry(R * 0.08, 12, 8), brass); pv.position.z = 0.4; hands.add(pv);
  [-1, 1].forEach(s => {
    const bell = new THREE.Mesh(new THREE.SphereGeometry(R * 0.3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), brass); bell.position.set(s * R * 0.62, cy + R * 0.78, 0); bell.rotation.z = -s * 0.6; g.add(K.shadowable(bell));
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.07, R * 0.1, R * 0.5, 8), brass); leg.position.set(s * R * 0.62, R * 0.2, 0); leg.rotation.z = s * 0.35; g.add(K.shadowable(leg));
  });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(R * 0.1, 10, 8), brass); knob.position.set(0, cy + R + 2.4, 0); g.add(knob);
  g.userData.setTurns = m => { mh.rotation.z = -Math.PI * 2 * m; hh.rotation.z = -Math.PI * 2 * m / 12; };
  g.userData.setTurns(0);
  return g;
}

/* round plaque with one digit, a sprite */
export function makePlaque(n, size) {
  const c = K.cvs(128, 128), g = c.getContext('2d');
  g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#f6efdc'; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill();
  g.fillStyle = '#7a2a1a'; g.font = 'bold 84px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 70);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: K.ctex(c), transparent: true, depthWrite: false })); s.scale.set(size, size, 1); return s;
}

/* ---- big table globe. Afro-Eurasia painted with three continents; overlays light up one by one. mesh-local direction for lat/lon: dirLocal */
const POLY = {
  asia: [[26, 41], [28, 45], [38, 47], [40, 56], [40, 67], [60, 70], [80, 73], [100, 78], [120, 73], [140, 72], [160, 70], [180, 66], [180, 64], [160, 58], [155, 52], [142, 48], [140, 40], [130, 34], [122, 30], [120, 24], [110, 20], [108, 12], [106, 9], [100, 14], [100, 6], [103, 1.5], [98, 8], [94, 17], [88, 22], [80, 15], [78, 8], [73, 17], [68, 23], [62, 25], [57, 26], [56, 23], [59, 22], [55, 17], [44, 13], [43, 17], [39, 22], [35, 28], [34, 31], [36, 36], [30, 36]],
  africa: [[-17, 21], [-13, 28], [-6, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32.5, 31.2], [33.5, 28], [37, 21], [43, 12], [51, 12], [48, 5], [40, -3], [40, -15], [35, -24], [32, -29], [26, -34], [20, -35], [18, -32], [12, -17], [13, -8], [9, -1], [9, 4], [5, 6], [-4, 5], [-8, 4], [-13, 8], [-17, 14]],
  europe: [[-9, 37], [-9, 43], [-2, 43.5], [-4, 48], [2, 51], [8, 54], [9, 57], [5, 60], [5, 63], [14, 68], [25, 71], [32, 70], [40, 67], [40, 56], [38, 47], [28, 45], [26, 41], [24, 37], [22, 37], [19, 41], [16, 38], [12, 38], [8, 44], [3, 43], [-2, 37]]
};
const OTHER = [
  [[-168, 66], [-140, 70], [-100, 72], [-80, 70], [-60, 60], [-55, 50], [-70, 42], [-80, 30], [-82, 25], [-97, 26], [-95, 18], [-85, 12], [-78, 8], [-80, -2], [-70, -18], [-72, -40], [-70, -54], [-60, -52], [-50, -28], [-40, -22], [-35, -7], [-50, 0], [-62, 10], [-78, 8], [-90, 15], [-105, 22], [-118, 33], [-124, 45], [-135, 58], [-160, 60]],
  [[114, -22], [122, -17], [136, -12], [142, -11], [146, -19], [153, -27], [150, -37], [140, -38], [130, -32], [115, -34]],
  [[-60, 82], [-30, 83], [-20, 72], [-42, 60], [-55, 66]], [[-180, -70], [180, -70], [180, -90], [-180, -90]]
];
export function makeBigGlobe(R) {
  const root = new THREE.Group(), W = 2048, H = 1024;
  const px = lon => (lon + 180) / 360 * W, py = lat => (90 - lat) / 180 * H;
  const poly = (g, pts) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(px(p[0]), py(p[1])) : g.moveTo(px(p[0]), py(p[1])))); g.closePath(); g.fill(); };
  const cv = K.cvs(W, H), g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#5a9ac4'); gr.addColorStop(0.5, '#3f86b4'); gr.addColorStop(1, '#5a9ac4'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2; for (let lo = -180; lo <= 180; lo += 30) { g.beginPath(); g.moveTo(px(lo), 0); g.lineTo(px(lo), H); g.stroke(); } for (let la = -60; la <= 60; la += 30) { g.beginPath(); g.moveTo(0, py(la)); g.lineTo(W, py(la)); g.stroke(); }
  g.fillStyle = '#9cc07a'; OTHER.forEach(p => poly(g, p));
  g.fillStyle = '#c9b676'; poly(g, POLY.africa); g.fillStyle = '#8fb86a'; poly(g, POLY.europe); g.fillStyle = '#b3b878'; poly(g, POLY.asia);
  g.fillStyle = 'rgba(210,190,120,0.55)'; [[10, 22, 160, 40], [48, 24, 60, 30], [90, 40, 90, 24]].forEach(([lo, la, w, h]) => { g.beginPath(); g.ellipse(px(lo), py(la), w / 2, h / 2, 0, 0, 7); g.fill(); });
  const mk = (pts, col) => { const c = K.cvs(1024, 512), x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.scale(0.5, 0.5);
    x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(px(p[0]), py(p[1])) : x.moveTo(px(p[0]), py(p[1])))); x.closePath(); x.fill();
    return new THREE.MeshBasicMaterial({ map: K.ctex(c), color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }); };
  const brass = K.phong('#c9a24a', { shininess: 90, specular: '#fff2c0' });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.42, R * 0.5, 3, 32), K.lam('#4a2c15', { map: K.woodTex(3, 1, 1) })); base.position.y = 1.5; root.add(K.shadowable(base));
  const post = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.07, R * 0.12, 11, 14), brass); post.position.y = 8.5; root.add(K.shadowable(post));
  const cy = R + 13, axis = new THREE.Group(); axis.position.y = cy; root.add(axis);
  const tilt = new THREE.Group(); axis.add(tilt);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.MeshPhongMaterial({ map: K.ctex(cv), shininess: 22, specular: '#445566' })); mesh.castShadow = true; tilt.add(mesh);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(R * 1.12, 0.9, 10, 80, Math.PI), brass); arc.position.y = cy; arc.rotation.y = 0.0; root.add(K.shadowable(arc));
  const dirLocal = (lat, lon) => { const ph = (lon + 180) / 360 * Math.PI * 2, la = lat * Math.PI / 180; return new THREE.Vector3(-Math.cos(ph) * Math.cos(la), Math.sin(la), Math.sin(ph) * Math.cos(la)); };
  const dI = dirLocal(31.7, 35.0); mesh.rotation.y = Math.atan2(-dI.x, dI.z); tilt.rotation.x = 31.7 * Math.PI / 180 * 0.6;
  const over = [mk(POLY.asia, '#ff9a3a'), mk(POLY.africa, '#ffe03a'), mk(POLY.europe, '#ff6a8a')].map(m => { const o = new THREE.Mesh(new THREE.SphereGeometry(R * 1.006, 64, 40), m); mesh.add(o); return o; });
  const israel = new THREE.Object3D(); israel.position.copy(dI).multiplyScalar(R * 1.01); israel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dI.clone().normalize()); mesh.add(israel);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(R * 0.032, 16, 10), new THREE.MeshBasicMaterial({ color: '#fff0a0' })); israel.add(dot);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.075, R * 0.011, 8, 40), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.9, depthWrite: false })); israel.add(ring);
  const halo = K.glowSprite('#ffe27a', R * 0.42, 0); israel.add(halo);
  return { root, axis, tilt, mesh, over, israel, dot, ring, halo, dirLocal, R, cy };
}
/* arc on the globe surface (mesh-local) from lat/lon A to B, lifted in the middle */
export function globeArcPts(gl, a, b, lift) {
  const A = gl.dirLocal(a[0], a[1]).normalize(), B = gl.dirLocal(b[0], b[1]).normalize(), om = Math.acos(Math.min(1, A.dot(B))), pts = [];
  for (let i = 0; i <= 44; i++) { const u = i / 44, p = A.clone().multiplyScalar(Math.sin((1 - u) * om)).add(B.clone().multiplyScalar(Math.sin(u * om))).multiplyScalar(1 / Math.sin(om));
    pts.push(p.multiplyScalar(gl.R * (1.012 + lift * Math.sin(Math.PI * u)))); }
  return pts;
}

/* lectern with a big open book on its slanted board; faces +z. returns { root, book, bookC (world-local centre) } */
export function makeLectern() {
  const root = new THREE.Group(), wood = K.lam('#6b4020', { map: K.woodTex(81, 2, 1) }), dark = K.lam('#4a2c15', { map: K.woodTex(82, 2, 2) });
  const base = new THREE.Mesh(new THREE.BoxGeometry(46, 3, 30), dark); base.position.y = 1.5; root.add(K.shadowable(base));
  const post = new THREE.Mesh(new THREE.BoxGeometry(10, 22, 8), wood); post.position.y = 14; root.add(K.shadowable(post));
  const board = new THREE.Group(); board.position.set(0, 27, 0); board.rotation.x = 0.95; root.add(board);
  const bd = new THREE.Mesh(new THREE.BoxGeometry(66, 2, 46), wood); bd.position.y = 0; board.add(K.shadowable(bd));
  const lip = new THREE.Mesh(new THREE.BoxGeometry(66, 3, 2.4), dark); lip.position.set(0, 1.4, 22); board.add(K.shadowable(lip));
  const book = K.makeBookOpen(); book.scale.setScalar(2.05); book.position.set(0, 1.0, -1); board.add(book);
  return { root, board, book };
}

/* wooden stand with a card showing two icons (waves, river). no text. */
export function makeIconBoard() {
  const stand = new THREE.Group(), wood = K.lam('#6b4020', { map: K.woodTex(61, 2, 1) });
  const bs = new THREE.Mesh(new THREE.BoxGeometry(34, 2.2, 14), wood); bs.position.y = 1.1; stand.add(K.shadowable(bs));
  const board = new THREE.Group(); board.position.set(0, 2.2, -1); board.rotation.x = -0.18; stand.add(board);
  const bd = new THREE.Mesh(new THREE.BoxGeometry(36, 46, 1.4), wood); bd.position.y = 23; board.add(K.shadowable(bd));
  const cc = K.cvs(460, 600), g = cc.getContext('2d'); g.fillStyle = '#f6efd9'; g.fillRect(0, 0, 460, 600); g.strokeStyle = '#7a5a2a'; g.lineWidth = 8; g.strokeRect(14, 14, 432, 572); g.strokeStyle = '#c9a24a'; g.lineWidth = 3; g.strokeRect(28, 28, 404, 544);
  g.fillStyle = '#bfe3f2'; g.fillRect(44, 44, 372, 250); g.strokeStyle = '#2a78c8'; g.lineWidth = 16; g.lineCap = 'round';
  for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = 60; x <= 400; x += 6) { const y = 110 + k * 62 + Math.sin(x / 34 + k) * 22; if (x === 60) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = '#9cc07a'; g.fillRect(44, 306, 372, 250);
  g.strokeStyle = '#3a90d8'; g.lineWidth = 46; g.lineJoin = 'round'; g.beginPath(); g.moveTo(90, 540); g.bezierCurveTo(60, 470, 360, 470, 330, 410); g.bezierCurveTo(300, 350, 120, 380, 190, 322); g.stroke();
  g.strokeStyle = '#9fd4f5'; g.lineWidth = 14; g.stroke();
  const card = new THREE.Mesh(new THREE.PlaneGeometry(32, 41.6), new THREE.MeshLambertMaterial({ map: K.ctex(cc) })); card.position.set(0, 23, 0.75); card.receiveShadow = true; board.add(card);
  const halo = K.glowSprite('#ffe6a0', 70, 0); halo.position.set(0, 23, 1.6); board.add(halo);
  return { stand, halo };
}
