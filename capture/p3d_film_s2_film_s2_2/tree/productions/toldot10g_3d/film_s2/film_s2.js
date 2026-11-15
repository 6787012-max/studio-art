/* toldot10g film_s2 (borders and the three strips) - gezer_trip look. 115.50 s, timing locked from the real narration.
   NO PEOPLE, NO TEXT (digits 1,2,3 only). ASCII only. Every frame is a pure function of t.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur, window.__shots, window.__events, window.__heroBox. */
import * as THREE from 'three';
import { makeSkyDome } from '../../gezer_trip/film_a/gz_kit.js';
import * as K from '../kit10g.js';
const { cl, ramp, pop, C, hash2, piece, sm, rng, lam, phong, heightMesh, noiseTex, woodTex, waveTex, tufts, rocks, inst, makeHills, makeClouds, ll, mapY, shadowable } = K;

const DUR = 115.5;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const ADD = (c, op) => BASIC(c, { transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#fbeccb', 220, 900);
const sky = makeSkyDome('#79c3ee', '#fbeccb'); scene.add(sky);
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000); scene.add(cam);
const hemi = new THREE.HemisphereLight('#bcd9f5', '#8a7a55', 0.85); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1d0', 2.1); sun.castShadow = true;
sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 500 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

const MOODS = {
  a: { top: '#b7cde4', hor: '#eadfc4', sun: '#fff0d2', sunI: 1.9, hemI: 1.05 },
  b: { top: '#79c3ee', hor: '#fbeccb', sun: '#fff3d8', sunI: 2.1, hemI: 0.9 },
  c: { top: '#7fb0d8', hor: '#f6dcaa', sun: '#ffd49a', sunI: 1.9, hemI: 0.85 },
  d: { top: '#79c3ee', hor: '#fbeccb', sun: '#fff3d8', sunI: 2.1, hemI: 0.9 },
  x: { top: '#7ec6f0', hor: '#fdf0d4', sun: '#fff6e0', sunI: 2.1, hemI: 0.9 },
  q: { top: '#74bdea', hor: '#f4ecd6', sun: '#fff3d8', sunI: 2.1, hemI: 0.9 },
  e: { top: '#79c3ee', hor: '#fbeccb', sun: '#fff1d0', sunI: 2.1, hemI: 0.9 }
};
function setMood(m) {
  sky.material.uniforms.uTop.value.set(m.top); sky.material.uniforms.uHor.value.set(m.hor);
  scene.fog.color.set(m.hor); sun.color.set(m.sun); sun.intensity = m.sunI; hemi.intensity = m.hemI;
}

const scene2 = new THREE.Scene(); scene2.add(new THREE.HemisphereLight('#ffffff', '#9a8a70', 1.0)); const l2 = new THREE.DirectionalLight('#fff4dc', 1.3); l2.position.set(10, 20, 30); scene2.add(l2);
const comp = K.makeCompanion(cam, scene2);
const branch = K.makeBranch(); branch.position.z = -12; cam.add(branch);

const backdrop = rotY => { const g = new THREE.Group(); g.add(makeHills(lam('#9db483'), lam('#b2c6b4'), lam('#d0dde0')), makeClouds(BASIC('#ffffff'))); g.rotation.y = rotY || 0; return g; };
const groundMat = (s, rx, ry) => lam('#ffffff', { vertexColors: true, map: noiseTex(s, rx, ry) });

/* smooth camera path through keys [[t, pos, look], ...] (Catmull-Rom, never stops mid-shot) */
function path(lt, keys) {
  let i = 0; while (i < keys.length - 2 && lt > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1], u = cl((lt - a[0]) / (b[0] - a[0]));
  const p0 = keys[Math.max(0, i - 1)], p3 = keys[Math.min(keys.length - 1, i + 2)];
  const cr = (j, k) => { const v0 = p0[k][j], v1 = a[k][j], v2 = b[k][j], v3 = p3[k][j]; return 0.5 * ((2 * v1) + (-v0 + v2) * u + (2 * v0 - 5 * v1 + 4 * v2 - v3) * u * u + (-v0 + 3 * v1 - 3 * v2 + v3) * u * u * u); };
  return { p: [0, 1, 2].map(j => cr(j, 1)), l: [0, 1, 2].map(j => cr(j, 2)) };
}
const setCam = c => { cam.position.set(...c.p); cam.lookAt(...c.l); };
const lerp = (a, b, u) => a + (b - a) * u;
const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const haloTex = (() => { let t = null; return () => { if (t) return t; const c = cvs(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,170,1)'); gr.addColorStop(0.35, 'rgba(255,220,120,0.55)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); t = new THREE.CanvasTexture(c); return t; }; })();

/* ======================================================================== a: globe in a study corner */
const CONT = {
  africa: [[-17, 15], [-17, 21], [-10, 30], [-6, 36], [10, 37], [11, 33], [20, 31], [32, 31], [34, 28], [35, 24], [38, 18], [43, 12], [51, 12], [45, 2], [40, -5], [39, -15], [35, -24], [33, -28], [27, -34], [20, -35], [18, -32], [12, -18], [14, -10], [9, -1], [9, 4], [5, 6], [-4, 5], [-8, 4], [-13, 8]],
  europe: [[-9, 37], [-9, 43], [-1, 44], [-4, 48], [2, 51], [5, 54], [9, 55], [8, 58], [5, 62], [14, 68], [24, 71], [33, 70], [40, 67], [60, 68], [60, 50], [48, 46], [40, 44], [30, 45], [28, 41], [23, 37], [21, 40], [16, 38], [12, 42], [8, 44], [3, 43], [-1, 37]],
  asia: [[28, 41], [40, 44], [48, 46], [60, 50], [60, 68], [80, 73], [110, 77], [140, 72], [170, 66], [160, 58], [142, 50], [135, 42], [127, 36], [121, 40], [122, 30], [119, 23], [108, 21], [106, 10], [100, 13], [104, 1], [98, 8], [93, 20], [88, 22], [80, 15], [77, 8], [73, 17], [67, 25], [57, 25], [59, 22], [52, 16], [45, 13], [43, 13], [39, 21], [35, 28], [34.5, 29.5], [34.3, 31.2], [35, 33], [36, 36], [30, 36], [27, 37]]
};
function contPoly(g, pts, w, h) { g.beginPath(); pts.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * w, y = (90 - la) / 180 * h; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); }
function globeBaseTex() {
  const w = 2048, h = 1024, c = cvs(w, h), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a86c6'); gr.addColorStop(0.5, '#2f78b8'); gr.addColorStop(1, '#3a86c6'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (const k of ['africa', 'europe', 'asia']) {
    contPoly(g, CONT[k], w, h); g.fillStyle = k === 'africa' ? '#c9b36a' : k === 'europe' ? '#86b85a' : '#a9c46a'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#4f7a3c'; g.stroke();
  }
  const r = rng(5); for (let i = 0; i < 400; i++) { const x = r() * w, y = h * 0.1 + r() * h * 0.7; g.fillStyle = 'rgba(80,110,50,0.10)'; g.beginPath(); g.arc(x, y, 6 + r() * 14, 0, 6.3); g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 2;
  for (let lo = -180; lo <= 180; lo += 30) { const x = (lo + 180) / 360 * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let la = -60; la <= 60; la += 30) { const y = (90 - la) / 180 * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
}
function contOverlayTex(k) {
  const w = 2048, h = 1024, c = cvs(w, h), g = c.getContext('2d');
  contPoly(g, CONT[k], w, h); g.fillStyle = '#ffd24a'; g.fill(); g.lineWidth = 9; g.strokeStyle = '#fff6c0'; g.stroke();
  return new THREE.CanvasTexture(c);
}

function buildA() {
  const grp = new THREE.Group();
  const R = 4.2, DY = 8.5, cy = DY + 7.4;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 100).rotateX(-Math.PI / 2), lam('#8a5a30', { map: woodTex(4, 16, 11) })); floor.receiveShadow = true; grp.add(floor);
  const wallMat = lam('#cdb58a', { map: noiseTex(23, 10, 5) });
  const bw = new THREE.Mesh(new THREE.BoxGeometry(100, 44, 1), wallMat); bw.position.set(0, 22, -15); bw.receiveShadow = true; grp.add(bw);
  const lw = new THREE.Mesh(new THREE.BoxGeometry(1, 44, 70), wallMat); lw.position.set(-26, 22, 18); lw.receiveShadow = true; grp.add(lw);
  const wood = lam('#5a3a1e', { map: woodTex(7, 3, 2) });
  const bwp = new THREE.Mesh(new THREE.BoxGeometry(100, 6, 0.6), wood); bwp.position.set(0, 3, -14.4); grp.add(bwp);
  const lwp = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6, 70), wood); lwp.position.set(-25.4, 3, 18); grp.add(lwp);
  /* bookcase with rows of books */
  const frameM = lam('#6a4423', { map: woodTex(9, 2, 6) });
  for (const sx of [-20.5, 20.5]) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.1, 28, 2.8), frameM); s.position.set(sx, 14, -13); s.castShadow = true; grp.add(s); }
  for (let r = 0; r <= 6; r++) { const b = new THREE.Mesh(new THREE.BoxGeometry(41, 0.5, 2.8), frameM); b.position.set(0, 0.55 + r * 4.35, -13); b.castShadow = true; b.receiveShadow = true; grp.add(b); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(41, 28, 0.3), lam('#3d2a18')); back.position.set(0, 14, -14.2); grp.add(back);
  const BC = ['#8a2f2a', '#2f4a7a', '#2f6a4a', '#a8782a', '#5a3a1e', '#6a2f5a', '#c9b48a', '#3a3a3a', '#7a1f1f', '#d8c9a0'].map(C);
  const rb = rng(11), bl = [];
  for (let r = 0; r < 6; r++) { let x = -19.4; const y0 = 0.8 + r * 4.35; while (x < 19) { const w = 0.45 + rb() * 0.75, h = 2.5 + rb() * 1.5; bl.push([x + w / 2, y0, w, h, rb()]); x += w + 0.04; if (rb() < 0.05) x += 1.6; } }
  const books = inst(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), lam('#ffffff'), bl.length, (i, d, col) => {
    const b = bl[i]; d.position.set(b[0], b[1], -13); d.scale.set(b[2], b[3], 2.1); if (b[4] > 0.94) d.rotation.z = 0.24;
    return col.copy(BC[Math.floor(b[4] * 10) % 10]).multiplyScalar(0.8 + 0.4 * hash2(i, 2));
  }); grp.add(books);
  /* window on the left wall */
  const winF = lam('#4a2c18');
  for (const [w, h, y, z] of [[0.7, 15, 17, 2], [0.7, 15, 17, 12], [0.7, 0.8, 24, 7], [0.7, 0.8, 10, 7]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.7, h, w === 0.7 && h === 15 ? 0.8 : 10.8), winF); f.position.set(-25.2, y, z); grp.add(f); }
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(10.2, 14.2).rotateY(Math.PI / 2), BASIC('#fff1c8')); pane.position.set(-24.9, 17, 7); grp.add(pane);
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(26, 9).rotateX(-Math.PI / 2), ADD('#ffe9a8', 0.12)); shaft.position.set(-11, 0.1, 6); shaft.rotation.y = 0.5; grp.add(shaft);
  /* rug */
  const rc = cvs(256, 160), rg = rc.getContext('2d'); rg.fillStyle = '#8a2a22'; rg.fillRect(0, 0, 256, 160); rg.strokeStyle = '#e0b84a'; rg.lineWidth = 8; rg.strokeRect(12, 12, 232, 136); rg.strokeStyle = '#2a4a6a'; rg.lineWidth = 5; rg.strokeRect(26, 26, 204, 108);
  rg.fillStyle = '#e0b84a'; for (let i = 0; i < 5; i++) { rg.beginPath(); rg.moveTo(46 + i * 40, 80); rg.lineTo(66 + i * 40, 56); rg.lineTo(86 + i * 40, 80); rg.lineTo(66 + i * 40, 104); rg.fill(); }
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(40, 25).rotateX(-Math.PI / 2), lam('#ffffff', { map: new THREE.CanvasTexture(rc) })); rug.position.set(0, 0.06, 6); rug.receiveShadow = true; grp.add(rug);
  /* desk */
  const dm = lam('#7a4a26', { map: woodTex(2, 3, 2) });
  const top = new THREE.Mesh(new THREE.BoxGeometry(32, 1, 13), dm); top.position.set(0, DY - 0.5, 0); grp.add(top);
  for (const sx of [-14.4, 14.4]) for (const sz of [-5, 5]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.6, DY - 1, 1.6), dm); l.position.set(sx, (DY - 1) / 2, sz); grp.add(l); }
  const ap = new THREE.Mesh(new THREE.BoxGeometry(28, 1.8, 0.6), dm); ap.position.set(0, DY - 1.9, 6); grp.add(ap);
  shadowable(grp);
  const stack = new THREE.Group();
  [['#8a2f2a', 5, 0.7, 3.6, 0], ['#2f4a7a', 4.6, 0.6, 3.4, 0.2], ['#a8782a', 4.2, 0.6, 3.2, -0.15], ['#2f6a4a', 3.8, 0.5, 3, 0.1]].forEach(([c, w, h, d, ry], i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(c)); b.position.set(0, 0.35 + [0, 0.7, 1.3, 1.9][i], 0); b.rotation.y = ry; b.castShadow = true; stack.add(b); });
  stack.position.set(-11, DY, 3); grp.add(stack);
  const atlas = K.makeBook(); atlas.scale.setScalar(0.5); atlas.position.set(10.5, DY + 0.1, 3); atlas.rotation.y = -0.3; grp.add(atlas);
  const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 6, 14).rotateZ(Math.PI / 2), lam('#eadcae')); scroll.position.set(5.5, DY + 0.55, 4.6); scroll.rotation.y = 0.3; scroll.castShadow = true; grp.add(scroll);
  const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.9, 16), phong('#1c1c24', { shininess: 80 })); ink.position.set(13, DY + 0.45, -1.5); ink.castShadow = true; grp.add(ink);
  const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 5, 6), lam('#f4eedc')); quill.position.set(13.4, DY + 2.7, -1.5); quill.rotation.z = -0.35; grp.add(quill);
  const lamp = new THREE.Group();
  const lb = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.5, 20), phong('#c9a24a', { shininess: 80 })); lb.position.y = 0.25; lamp.add(lb);
  const ls = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5.5, 8), phong('#c9a24a', { shininess: 80 })); ls.position.y = 3; lamp.add(ls);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(2.0, 2.2, 22, 1, true), lam('#2f6a4a', { emissive: '#1a3a28', side: THREE.DoubleSide })); shade.position.y = 6.2; lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), BASIC('#fff0b0')); bulb.position.y = 5.6; lamp.add(bulb);
  const lh = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), BASIC('#ffffff', { map: haloTex(), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); lh.position.set(0, 5.6, 0.5); lamp.add(lh);
  lamp.position.set(-12.5, DY, -2.5); grp.add(lamp);
  /* globe */
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 0.7, 28), phong('#6a4423', { shininess: 40 })); base.position.set(0, DY + 0.35, 0); grp.add(base);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, cy - R - 0.7 - DY, 12), phong('#c9a24a', { shininess: 90 })); col.position.set(0, DY + 0.7 + (cy - R - 0.7 - DY) / 2, 0); grp.add(col);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R + 0.6, 0.17, 12, 72), phong('#c9a24a', { shininess: 90 })); ring.position.set(0, cy, 0); grp.add(shadowable(ring));
  const tilt = new THREE.Group(); tilt.position.set(0, cy, 0); tilt.rotation.x = 31 * Math.PI / 180; grp.add(tilt);
  const spin = new THREE.Group(); tilt.add(spin);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(R, 72, 54), new THREE.MeshPhongMaterial({ map: globeBaseTex(), shininess: 35, specular: '#445566' })); globe.castShadow = true; spin.add(globe);
  const ovs = ['europe', 'asia', 'africa'].map(k => { const m = new THREE.Mesh(new THREE.SphereGeometry(R * 1.006, 72, 54), new THREE.MeshBasicMaterial({ map: contOverlayTex(k), transparent: true, opacity: 0, depthWrite: false })); spin.add(m); return m; });
  const LA = 31.5 * Math.PI / 180, LO = 35 * Math.PI / 180, pd = new THREE.Vector3(Math.cos(LA) * Math.cos(LO), Math.sin(LA), -Math.cos(LA) * Math.sin(LO));
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), BASIC('#ffffff')); dot.position.copy(pd).multiplyScalar(R * 1.01); spin.add(dot);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), ADD('#ffe27a', 0)); halo.position.copy(dot.position); spin.add(halo);
  const ALPHA = -(90 + 35) * Math.PI / 180;
  const P = new THREE.Vector3(0, cy, R + 0.9);
  const cols = ['#e0401e', '#2a6bd0', '#1fa05a'];
  const arrows = [[7.2, -0.6], [-5.4, -5.0], [-5.8, 4.6]].map(([ox, oy], i) => {
    const a = K.makeArrow(3.4, 0.24, phong(cols[i], { shininess: 70 })); grp.add(a);
    const d = new THREE.Vector3(-ox, -oy, 0).normalize(); a.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); a.userData.d = d; return a;
  });
  const sparks = new THREE.Group(); grp.add(sparks);
  const KEYS = [[0, [8, 14.6, 38], [0, 13.4, 0]], [8, [3.5, 14.8, 29], [0, 14.4, 0]], [17.44, [-1.2, 15.2, 21.5], [0, 14.9, 0]]];
  const upd = lt => {
    setCam(path(lt, KEYS));
    const su = cl((lt - 0.6) / 6.4), e = 1 - Math.pow(1 - su, 3);
    spin.rotation.y = ALPHA + (1 - e) * 2 * Math.PI * 1.35;
    [[8.0, 0], [10.6, 1], [12.8, 2]].forEach(([t0, i]) => { const u = cl((lt - t0) / 0.8); ovs[i].material.opacity = u * (0.82 + 0.18 * Math.sin(lt * 5 + i)) * (lt > 13.8 ? 0.8 : 1); });
    const hu = ramp(lt, 6.4, 7.2); dot.visible = halo.visible = hu > 0; halo.material.opacity = 0.4 * hu * (0.65 + 0.35 * Math.sin(lt * 5)); halo.scale.setScalar(0.8 + 0.7 * ramp(lt, 14, 16.4) + 0.1 * Math.sin(lt * 6));
    arrows.forEach((a, i) => {
      const t0 = 12.9 + i * 0.5, u = cl((lt - t0) / 1.2), d = a.userData.d;
      a.userData.pop(u);
      const off = 4.28 + 0.5 + (1 - sm(u)) * 5; a.position.set(P.x - d.x * off, P.y - d.y * off, P.z);
    });
    sparks.visible = false;
  };
  const tipa = lt => ({ side: 1, xf: 0.8, size: 0.2, expr: lt < 6.4 ? 'curious' : lt < 12.8 ? 'surprised' : lt < 15.5 ? 'happy' : 'cheering', arms: lt < 6.4 ? 'point' : lt < 15.5 ? 'down' : 'up', hop: lt > 15.5 ? 0.5 : 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, sun: { t: [0, 10, 0], ext: 40 }, mood: 'a' };
}

/* ======================================================================== shared table map + border lines */
const mapRoot = new THREE.Group(); scene.add(mapRoot);
let MAP = null;
const coastCache = new Map();
function coastX(z) { const k = Math.round(z * 10); if (coastCache.has(k)) return coastCache.get(k); let x = -19; while (x < 12 && mapY(x, z) < 0.13) x += 0.1; coastCache.set(k, x); return x; }
const surfY = (x, z, lo) => Math.max(mapY(x, z), lo || 0.12);
function coastPts() {
  const pts = []; for (let z = -28.7; z <= 4.9; z += 1.6) { const x = coastX(z) + 0.1; pts.push([x, surfY(x, z) + 0.5, z]); }
  const e = ll(29.58, 34.95), l = pts[pts.length - 1];
  for (let k = 1; k <= 6; k++) { const x = lerp(l[0], e[0], k / 6), z = lerp(l[2], e[1], k / 6); pts.push([x, surfY(x, z) + 0.5, z]); }
  return pts;
}
function jordanPts() {
  const src = [[33.15, 35.62], [32.95, 35.63], [32.86, 35.60], [32.70, 35.57], [32.45, 35.56], [32.15, 35.54], [31.95, 35.54], [31.80, 35.51], [31.5, 35.47], [31.0, 35.36], [30.5, 35.22], [30.0, 35.10], [29.58, 34.97]];
  return src.map(([la, lo]) => { const [x, z] = ll(la, lo); return [x, surfY(x, z, 0.14) + 0.55, z]; });
}
function makeBorderLines() {
  const mk = pts => {
    const g = new THREE.Group(), m1 = BASIC('#fff2a0', { transparent: true, opacity: 1 }), m2 = BASIC('#ffcf3a', { transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false });
    const a = K.makeThickLine(pts, 0.34, m1), b = K.makeThickLine(pts, 0.85, m2); g.add(a, b);
    g.userData.setU = u => { a.userData.setU(u); b.userData.setU(u); g.visible = u > 0; };
    g.userData.setO = o => { m1.opacity = o; m2.opacity = 0.3 * o; };
    g.userData.pts = pts; return g;
  };
  return { coast: mk(coastPts()), jordan: mk(jordanPts()) };
}

/* ======================================================================== b: the two natural borders, then the two kinds on the desk */
function tileTex() {
  const c = cvs(512, 400), g = c.getContext('2d');
  g.fillStyle = '#3d9ad6'; g.fillRect(0, 0, 256, 400); g.fillStyle = '#8fc063'; g.fillRect(256, 0, 256, 400);
  g.fillStyle = '#6fa04a'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(300 + (i * 53) % 190, 40 + (i * 97) % 330, 22, 0, 6.3); g.fill(); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.lineCap = 'round';
  for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { g.beginPath(); const x0 = 30 + k * 110, y0 = 50 + r * 95; g.moveTo(x0, y0 + 20); g.bezierCurveTo(x0 + 20, y0 - 20, x0 + 60, y0 - 20, x0 + 70, y0 + 18); g.stroke(); }
  g.fillStyle = '#ecdca8'; g.fillRect(248, 0, 16, 400);
  g.strokeStyle = '#2f8ee0'; g.lineWidth = 34; g.beginPath(); g.moveTo(386, 0); g.bezierCurveTo(330, 90, 450, 150, 380, 230); g.bezierCurveTo(330, 300, 420, 340, 390, 400); g.stroke();
  g.strokeStyle = '#8fd0ff'; g.lineWidth = 8; g.beginPath(); g.moveTo(386, 0); g.bezierCurveTo(330, 90, 450, 150, 380, 230); g.bezierCurveTo(330, 300, 420, 340, 390, 400); g.stroke();
  return new THREE.CanvasTexture(c);
}
function buildB() {
  const grp = new THREE.Group();
  const BL = makeBorderLines(); grp.add(BL.coast, BL.jordan);
  const mapPart = new THREE.Group(); grp.add(mapPart);
  const foam = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), BASIC('#ffffff', { transparent: true, opacity: 0.9 }), 26); foam.frustumCulled = false; mapPart.add(foam);
  const fz = Array.from({ length: 26 }, (_, i) => -28.7 + i * 1.3), dm = new THREE.Object3D();
  const pins = [K.makePin('#0f3d7a'), K.makePin('#1fa05a')];
  const pa = ll(33.09, 35.1), pb = ll(29.58, 34.95); pins[0].position.set(pa[0], mapY(pa[0], pa[1]) + 0.05, pa[1]); pins[1].position.set(pb[0], mapY(pb[0], pb[1]) + 0.05, pb[1]);
  pins.forEach(p => { p.userData.k = 1.4; mapPart.add(p); });
  /* desk props, far right on the table */
  const desk = new THREE.Group(); grp.add(desk);
  const tile = new THREE.Group(); desk.add(tile);
  const tf = new THREE.Mesh(new THREE.BoxGeometry(14, 11, 0.7), lam('#4a2c18', { map: woodTex(6, 2, 2) })); tile.add(tf);
  const tp = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 9.7), lam('#ffffff', { map: tileTex(), emissive: '#303030' })); tp.position.z = 0.4; tile.add(tp);
  for (const sx of [-4.5, 4.5]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8, 0.6), lam('#3a2412')); s.position.set(sx, -1.2, -2.6); s.rotation.x = 0.6; tile.add(s); }
  tile.position.set(56, 5.6 - 1.5, -9); tile.rotation.set(-0.12, 0.15, 0);
  const tglow = new THREE.Mesh(new THREE.PlaneGeometry(18, 15), BASIC('#ffffff', { map: haloTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); tglow.position.set(56, 6, -7.5); desk.add(tglow);
  const paper = new THREE.Group();
  const pc = cvs(256, 170), pg = pc.getContext('2d'); pg.fillStyle = '#fbf7ea'; pg.fillRect(0, 0, 256, 170); pg.strokeStyle = 'rgba(80,120,190,0.28)'; pg.lineWidth = 1.5; for (let y = 14; y < 170; y += 14) { pg.beginPath(); pg.moveTo(0, y); pg.lineTo(256, y); pg.stroke(); }
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(16, 0.2, 10.5), lam('#ffffff', { map: new THREE.CanvasTexture(pc) })); sheet.receiveShadow = true; sheet.castShadow = true; paper.add(sheet);
  const rc = cvs(256, 32), rg = rc.getContext('2d'); rg.fillStyle = '#d9a95a'; rg.fillRect(0, 0, 256, 32); rg.fillStyle = '#4a2c18'; for (let i = 0; i < 32; i++) rg.fillRect(i * 8, 0, 2, i % 4 === 0 ? 16 : 9);
  const ruler = new THREE.Mesh(new THREE.BoxGeometry(15, 0.3, 1.5), lam('#ffffff', { map: new THREE.CanvasTexture(rc) })); ruler.position.set(0, 0.25, 1.4); ruler.castShadow = true; paper.add(ruler);
  const dashes = Array.from({ length: 10 }, (_, i) => { const d = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.36), lam('#1c1c22')); d.position.set(-6.5 + i * 1.44, 0.2, -0.5); d.visible = false; paper.add(d); return d; });
  const pencil = new THREE.Group();
  const pbody = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 12, 6), phong('#e8a41c', { shininess: 60 })); pbody.position.y = 7.4; pencil.add(pbody);
  const ptip = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 6).rotateX(Math.PI).translate(0, 0.75, 0), lam('#d9b98a')); pencil.add(ptip);
  const pend = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.9, 6), phong('#c9a24a', { shininess: 80 })); pend.position.y = 13.8; pencil.add(pend);
  pencil.traverse(o => { if (o.isMesh) o.castShadow = true; });
  paper.add(pencil);
  paper.position.set(74, -1.45, -7); paper.rotation.y = -0.1; desk.add(paper);
  [['#8a2f2a', 6, 1.0, 4.2, 0.3], ['#2f4a7a', 5.4, 0.9, 3.8, -0.2], ['#a8782a', 5, 0.9, 3.6, 0.4]].forEach(([c, w, h, d, ry], i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(c)); b.position.set(51, -1.55 + h / 2 + [0, 1.0, 1.9][i], 2); b.rotation.y = ry; b.castShadow = true; b.receiveShadow = true; desk.add(b); });
  const inkw = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 1.2, 16), phong('#1c1c24', { shininess: 80 })); inkw.position.set(85.5, -0.95, -11); inkw.castShadow = true; desk.add(inkw);
  const qu = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 7, 6), lam('#f4eedc')); qu.position.set(86.3, 2.3, -11); qu.rotation.z = -0.3; desk.add(qu);
  const cmp = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 0.6, 24), phong('#c9a24a', { shininess: 80 })); cmp.position.set(62, -1.2, 6); cmp.castShadow = true; desk.add(cmp);
  const cmf = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.64, 24), lam('#f2ead2')); cmf.position.set(62, -1.18, 6); desk.add(cmf);
  const cmn = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 3.4), lam('#b02a1c')); cmn.position.set(62, -0.85, 6); cmn.rotation.y = 0.6; desk.add(cmn);
  const scr = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 7, 14).rotateZ(Math.PI / 2), lam('#eadcae')); scr.position.set(80, -0.9, 4.5); scr.rotation.y = 0.25; scr.castShadow = true; desk.add(scr);
  const KM = [[0, [-26, 21, 40], [-4, 0, -2]], [4, [-12, 34, 40], [-2, 0, -6]], [8.3, [3, 44, 38], [2, 0, -4]]];
  const KD = [[8.3, [48, 22, 30], [58, -1, -8]], [12, [56, 20, 27], [64, -1, -7]], [16.85, [64, 19, 25], [66, -1, -7]]];
  const upd = lt => {
    const onMap = lt < 8.33; mapPart.visible = onMap; BL.coast.visible = BL.jordan.visible = onMap; desk.visible = !onMap;
    if (onMap) {
      setCam(path(lt, KM));
      const u1 = ramp(lt, 0.5, 5.6), u2 = ramp(lt, 5.4, 8.1);
      BL.coast.userData.setU(u1); BL.jordan.userData.setU(u2); BL.coast.userData.setO(0.8 + 0.2 * Math.sin(lt * 6)); BL.jordan.userData.setO(0.8 + 0.2 * Math.sin(lt * 6 + 1));
      const zh = -28.7 + u1 * 63;
      fz.forEach((z, i) => { const f = (lt * 0.55 + hash2(i, 1)) % 1, x = coastX(Math.min(z, 4.9)) - 0.7 - 2.6 * f, s = Math.sin(Math.PI * f), vis = (z < zh && z < 5.5) ? 1 : 0.0001; dm.position.set(x, 0.14, z); dm.scale.set(1.5 * s * vis + 0.0001, 0.3 * vis, 0.8 * s * vis + 0.0001); dm.rotation.set(0, 0, 0); dm.updateMatrix(); foam.setMatrixAt(i, dm.matrix); });
      foam.instanceMatrix.needsUpdate = true;
      pins[0].userData.pop((lt - 0.3) / 0.5); pins[1].userData.pop((lt - 5.4) / 0.5); pins[0].userData.glow(0.6 * (0.7 + 0.3 * Math.sin(lt * 5))); pins[1].userData.glow(0.6 * ramp(lt, 5.4, 6) * (0.7 + 0.3 * Math.sin(lt * 5)));
    } else {
      setCam(path(lt, KD));
      const tu = (lt - 8.45) / 0.8; tile.visible = tu > 0; tile.scale.setScalar(pop(tu)); tglow.material.opacity = 0.2 * ramp(lt, 8.5, 9.2) * (1 - ramp(lt, 11.4, 12.6));
      const pu = (lt - 11.5) / 0.7; paper.visible = pu > 0; paper.scale.setScalar(pop(pu));
      const px = -7.5 + 15 * ramp(lt, 12.7, 16.2);
      pencil.position.set(px, 0.2 + 0.08 * Math.sin(lt * 14), -0.5); pencil.rotation.set(0.35, 0, -0.75);
      dashes.forEach((d, i) => { d.visible = px >= -6.5 + i * 1.44 - 0.1; });
    }
  };
  const tipa = lt => ({ side: -1, xf: 0.8, size: 0.2, expr: lt < 5.4 ? 'happy' : lt < 8.4 ? 'surprised' : lt < 12.6 ? 'curious' : 'happy', arms: lt < 8.4 ? 'point' : 'down', hop: 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, table: 'map', sun: lt => (lt < 8.33 ? { t: [0, 0, 0], ext: 80 } : { t: [64, 0, -7], ext: 40 }), mood: 'b' };
}

/* ======================================================================== c: the lectern, the open book, the land outline in gold */
function landOutlineTex() {
  const w = 252, h = 456, c = cvs(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), M = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const x = -20 + (i + 0.5) / w * 42, z = -38 + (j + 0.5) / h * 76; M[j * w + i] = mapY(x, z) > 0.125 ? 1 : 0; }
  const at = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? 0 : M[j * w + i], R = 3;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const m = M[j * w + i]; if (!m) continue;
    if (at(i - R, j) && at(i + R, j) && at(i, j - R) && at(i, j + R)) continue;
    const k = (j * w + i) * 4; im.data[k] = 255; im.data[k + 1] = 214; im.data[k + 2] = 110; im.data[k + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  const o = cvs(w, h), og = o.getContext('2d');
  og.filter = 'blur(5px)'; og.drawImage(c, 0, 0); og.drawImage(c, 0, 0); og.filter = 'none'; og.drawImage(c, 0, 0);
  const t = new THREE.CanvasTexture(o); t.anisotropy = 4; return t;
}
function buildC() {
  const grp = new THREE.Group();
  const hfn = (x, z) => 0.3 * Math.sin(x * 0.07 + 0.4) * Math.cos(z * 0.05) + 0.2 * Math.sin(z * 0.11 + x * 0.02);
  const GC = ['#9cc56a', '#86b257', '#a9c46a', '#93bd5e'].map(C);
  const g = heightMesh(-170, 170, -200, 70, 170, 135, hfn, (x, y, z, c) => { c.copy(GC[Math.floor(hash2(Math.floor(x / 3), Math.floor(z / 3)) * 4)]); c.lerp(C('#c4b078'), sm((y - 6) / 4) * 0.4); }, groundMat(41, 22, 17));
  g.position.y = -0.2; g.castShadow = true; grp.add(g);
  grp.add(backdrop(0.5));
  const STONE = C('#dccda8'), SEAM = C('#a89870');
  const floor = heightMesh(-30, 30, -18, 22, 120, 80, () => 0.05, (x, y, z, c) => {
    const tx = x / 3.4, tz = z / 3.4, fx = tx - Math.floor(tx), fz = tz - Math.floor(tz), h = hash2(Math.floor(tx), Math.floor(tz));
    c.copy(STONE).multiplyScalar(0.88 + 0.2 * h); if (fx < 0.05 || fz < 0.05) c.copy(SEAM);
  }, lam('#ffffff', { vertexColors: true, map: noiseTex(51, 14, 10) }));
  floor.receiveShadow = true; grp.add(floor);
  const stoneM = lam('#e0d2ac', { map: noiseTex(53, 3, 3) });
  /* colonnade behind */
  for (let i = 0; i < 7; i++) {
    const x = -27 + i * 9, c = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.15, 13, 16), stoneM); c.position.set(x, 6.5, -16); grp.add(c);
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.8, 3.0), stoneM); b.position.set(x, 0.4, -16); grp.add(b);
    const cp = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 3.2), stoneM); cp.position.set(x, 13.4, -16); grp.add(cp);
  }
  const arch = new THREE.Mesh(new THREE.BoxGeometry(62, 1.8, 2.8), stoneM); arch.position.set(0, 14.8, -16); grp.add(arch);
  for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 12), lam('#6a4423', { map: woodTex(8, 1, 1) })); r.position.set(-29 + i * 4.5, 15.9, -11); grp.add(r); }
  const wl = K.stoneWall(60, 3.2, 0); wl.position.set(0, -0.1, -21); grp.add(wl);
  shadowable(grp);
  /* stele with the gold outline of the land */
    const ot = landOutlineTex();
  const outline = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 19), BASIC('#ffffff', { map: ot, transparent: true, opacity: 0, depthWrite: false })); outline.position.set(0, 14.4, -8.5); grp.add(outline);
  const oglow = new THREE.Mesh(new THREE.PlaneGeometry(22, 30), BASIC('#ffffff', { map: haloTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); oglow.position.set(0, 14.4, -8.9); grp.add(oglow);
  /* lectern */
  const lec = new THREE.Group();
  const l1 = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.8, 7.5), stoneM); l1.position.y = 0.4;
  const l2b = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.8, 5.8), stoneM); l2b.position.y = 1.2;
  const pil = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.6, 3.2), stoneM); pil.position.y = 3.9;
  const sl = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.6, 4.8), stoneM); sl.position.y = 6.5; sl.rotation.x = 0.35;
  lec.add(l1, l2b, pil, sl); lec.position.set(0, 0, 2); lec.scale.setScalar(1.5); shadowable(lec); grp.add(lec);
  const book = K.makeBook(); book.scale.setScalar(1.0); book.position.set(0, 10.45, 2.1); book.rotation.x = 0.35; grp.add(book);
  const pageMats = []; book.traverse(o => { if (o.isMesh && o.material.emissive && o.material.emissive.getHex() === 0x7a7050) pageMats.push(o.material); });
  const bhalo = new THREE.Mesh(new THREE.PlaneGeometry(13, 8), BASIC('#ffffff', { map: haloTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); bhalo.position.set(0, 12.4, 3.4); grp.add(bhalo);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(7.5, 20, 24, 1, true).rotateX(Math.PI).translate(0, 10, 0), BASIC('#ffd070', { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); beam.position.set(0, 10.6, 2.1); grp.add(beam);
  const motes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 6, 5), BASIC('#fff0b0'), 70); motes.frustumCulled = false; grp.add(motes);
  const dm = new THREE.Object3D();
  /* surroundings */
  const rt = rng(61), tl = [];
  for (let k = 0; k < 400 && tl.length < 30; k++) { const x = (rt() - 0.5) * 150, z = -25 - rt() * 60; tl.push([x, hfn(x, z) - 0.2, z, 1.0 + rt() * 0.8, rt()]); }
  for (const [x, z] of [[-38, 6], [40, 4], [-34, 18], [36, 16], [-52, -2], [52, -6]]) tl.push([x, hfn(x, z) - 0.2, z, 1.6, rt()]);
  grp.add(K.plantTrees(tl, ['#6f8a4a', '#7a9a58', '#5f7a44', '#869e60']));
  const rr = rng(63), rtu = rng(64);
  grp.add(rocks(90, 66, () => { const x = (rr() - 0.5) * 120, z = 14 + rr() * 30; if (Math.abs(x) < 24 && z < 24) return null; return [x, hfn(x, z) - 0.2, z]; }, '#b9ae98', 0.25, 0.9));
  grp.add(tufts(1500, 67, () => { const x = (rtu() - 0.5) * 140, z = -14 + rtu() * 60; if (Math.abs(x) < 29 && z < 22.5 && z > -18) return null; return [x, hfn(x, z) - 0.2, z]; }, ['#6f9d4a', '#86b257', '#9cc56a', '#b9c46f'], 0.4, 1.0));
  grp.add(K.wheatField(32, -6, 28, 18, hfn, 2200, 3));
  const KEYS = [[0, [3, 8, 40], [0, 13.5, -4]], [3.8, [1.2, 9, 34], [0, 12.8, -4]], [7.49, [-1.5, 10, 28], [0, 12.4, -3]]];
  const upd = lt => {
    setCam(path(lt, KEYS));
    const k = ramp(lt, 0.45, 2.2), kg = ramp(lt, 2.6, 5.2);
    pageMats.forEach(m => { m.emissive.set('#7a7050').lerp(C('#ffd070'), k); });
    bhalo.material.opacity = 0.18 * k * (0.85 + 0.15 * Math.sin(lt * 4)); beam.material.opacity = 0.2 * k;
    outline.material.opacity = 0.9 * kg; oglow.material.opacity = 0.09 * kg * (0.8 + 0.2 * Math.sin(lt * 3));
    outline.position.y = 14.4 + 0.1 * Math.sin(lt * 1.2);
    for (let i = 0; i < 70; i++) { const ph = hash2(i, 5), f = (lt * 0.18 + ph) % 1; dm.position.set((hash2(i, 6) - 0.5) * 12 + 0.4 * Math.sin(lt + i), 10.9 + f * 14, 2.4 + (hash2(i, 7) - 0.5) * 4); const s = k * Math.sin(Math.PI * f); dm.scale.setScalar(Math.max(0.0001, s)); dm.rotation.set(0, 0, 0); dm.updateMatrix(); motes.setMatrixAt(i, dm.matrix); }
    motes.instanceMatrix.needsUpdate = true;
  };
  const tipa = lt => ({ side: 1, xf: 0.8, size: 0.2, expr: lt < 0.5 ? 'neutral' : lt < 2.6 ? 'surprised' : 'happy', arms: lt < 2.6 ? 'point' : 'up', hop: lt > 3 ? 0.4 : 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, branch: true, sun: { t: [0, 4, 0], ext: 70 }, mood: 'c' };
}

/* ======================================================================== strips: the table map cut into three lengthwise strips */
const SDEEP = C('#2a679c'), SSHAL = C('#7fd3f4'), SSAND = C('#ecdca8'), SWATER = C('#5cb8ec'), SBROWN = C('#a17c4c'), SSNOW = C('#efeadc'), STAN = C('#cdb47e');
const SGREENS = ['#8fc063', '#7fb157', '#a6c76c', '#6fa04a', '#98bf66', '#b4c874'].map(C), SGOLDS = ['#e2c070', '#d6b060', '#ecd08a', '#cfa656', '#e8c97c', '#c9a05a'].map(C);
const dryAt = z => sm((31.55 - (31.5 - z / 18)) / 0.5);
const stripDry = z => sm((z - 14) / 16);
function stripColour(x, y, z, c) {
  if (y < 0.065) {
    let n = 0; for (let k = 0; k < 5; k++) { const a = k * 1.2566; if (mapY(x + 2.4 * Math.cos(a), z + 2.4 * Math.sin(a)) > 0.1) n++; }
    c.copy(SDEEP).lerp(SSHAL, sm(n / 5 * 2.2)); return;
  }
  if (Math.abs(y - 0.1) < 0.03) { c.copy(SWATER); return; }
  const lon = 35 + x / 15.4, d = stripDry(z), gi = Math.floor(hash2(Math.floor(x / 1.7), Math.floor(z / 1.7)) * 6);
  c.copy(SGREENS[gi]).lerp(SGOLDS[(gi + 2) % 6], d);
  c.multiplyScalar(0.9 + 0.2 * hash2(Math.floor(x / 1.7) * 3, Math.floor(z / 1.7) * 5));
  { const fx = x / 1.7 - Math.floor(x / 1.7), fz = z / 1.7 - Math.floor(z / 1.7); if (fx < 0.07 || fz < 0.07) c.multiplyScalar(0.82); }
  c.lerp(STAN, sm((lon - 35.6) / 0.14) * 0.3); c.lerp(SBROWN, sm((y - 1.0) / 1.4) * 0.4); c.lerp(SSNOW, sm((y - 3.6) / 0.5));
  if (y < 0.24) c.lerp(SSAND, cl(1 - (y - 0.13) / 0.11) * 0.85);
}
function curtain(horiz, fixed, a, b) {
  const pos = [], col = [], idx = [], c = new THREE.Color(), n = Math.round((b - a) / 0.25), BR1 = C('#a9824f'), BR2 = C('#5a4632');
  for (let i = 0; i <= n; i++) {
    const s = a + i * 0.25, x = horiz ? s : fixed, z = horiz ? fixed : s, h = mapY(x, z), top = h < 0.04 ? 0.04 : h;
    stripColour(x, h, z, c);
    const rows = [[top, c.clone().multiplyScalar(0.9)], [top - 0.35, c.clone().multiplyScalar(0.72)], [-0.9, BR1], [-1.6, BR2]];
    rows.forEach(([y, cc]) => { pos.push(x, y, z); col.push(cc.r, cc.g, cc.b); });
    if (i < n) for (let r = 0; r < 3; r++) { const k = i * 4 + r; idx.push(k, k + 1, k + 4, k + 1, k + 5, k + 4); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; return m;
}
function digitTex(n) { const c = cvs(128, 128), g = c.getContext('2d'); g.fillStyle = '#fff3c8'; g.beginPath(); g.arc(64, 64, 62, 0, 6.3); g.fill(); g.fillStyle = '#8a4a10'; g.font = 'bold 92px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 70); return new THREE.CanvasTexture(c); }
function makeBadge(n) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.4, 36).rotateX(Math.PI / 2), phong('#e0a020', { shininess: 90 })));
  const f = new THREE.Mesh(new THREE.CircleGeometry(1.9, 36), BASIC('#ffffff', { map: digitTex(n) })); f.position.z = 0.22; g.add(f);
  g.userData.show = u => { g.visible = u > 0; g.scale.setScalar(pop(u)); };
  return g;
}
function makeStrips() {
  const root = new THREE.Group(); root.add(K.makeTable());
  const XS = [-13, -3.0, 6.0, 22], ZN = -38, ZS = 38;
  const strips = [];
  for (let i = 0; i < 3; i++) {
    const xa = XS[i], xb = XS[i + 1], g = new THREE.Group();
    const mat = lam('#ffffff', { vertexColors: true, map: noiseTex(5 + i, 6, 10), emissive: '#000000' });
    const mesh = heightMesh(xa, xb, ZN, ZS, Math.round((xb - xa) / 0.25), 304, mapY, stripColour, mat); mesh.castShadow = true; g.add(mesh);
    g.add(curtain(false, xa, ZN, ZS), curtain(false, xb, ZN, ZS), curtain(true, ZN, xa, xb), curtain(true, ZS, xa, xb));
    const bot = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, ZS - ZN).rotateX(Math.PI / 2), lam('#4a3626', { side: THREE.DoubleSide })); bot.position.set((xa + xb) / 2, -1.6, 0); g.add(bot);
    if (i === 0) { const wv = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, ZS - ZN).rotateX(-Math.PI / 2).translate((xa + xb) / 2, 0.04, 0), BASIC('#ffffff', { map: waveTex(3, 3, 6), transparent: true, depthWrite: false, opacity: 0.55 })); g.add(wv); }
    /* trees or shrubs */
    const r = rng(40 + i), list = [], cone = i < 2;
    for (let k = 0; k < 5000 && list.length < (cone ? 380 : 160); k++) {
      const x = xa + r() * (xb - xa), z = ZN + r() * (ZS - ZN), y = mapY(x, z), d = dryAt(z);
      if (y < 0.22 || Math.abs(y - 0.1) < 0.04 || x > 9.2) continue;
      const north = z < 4.5, keep = north ? (1 - d) * (y < 3.2 ? 1 : 0.3) : (d > 0.6 ? 0.3 : 0.12);
      if (r() > keep) continue; list.push([x, y, z, 0.7 + r() * 0.6, r()]);
    }
    const geo = cone && list.length ? new THREE.ConeGeometry(0.42, 1.2, 6).translate(0, 0.55, 0) : new THREE.IcosahedronGeometry(0.4, 1).scale(1.2, 0.55, 1);
    
    const trees = inst(geo, lam('#ffffff'), list.length, (k, d, col) => { const p = list[k]; d.position.set(p[0], p[1], p[2]); d.rotation.y = p[4] * 6; d.scale.setScalar(p[3]); return col.copy(C(p[2] < 4.5 ? (p[4] < 0.5 ? '#3f7a34' : '#58903c') : (p[4] < 0.5 ? '#6f8f3a' : '#b8a05a'))).multiplyScalar(0.85 + p[4] * 0.3); });
    g.add(trees);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, ZS - ZN).rotateX(-Math.PI / 2), ADD('#ffe27a', 0)); glow.position.set((xa + xb) / 2, 4.9, 0); g.add(glow);
    strips.push({ g, mat, glow, xc: (xa + xb) / 2 }); root.add(g);
  }
  /* Jerusalem dot (strip 2) and Dead Sea shimmer (strip 3) */
  const jp = ll(31.78, 35.22), jd = new THREE.Group(); jd.position.set(jp[0], mapY(jp[0], jp[1]) + 1.0, jp[1]);
  const jb = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 14), BASIC('#ff4a1e')); const jh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), ADD('#ffe27a', 0)); jd.add(jb, jh); strips[1].g.add(jd);
  const ds = ll(31.5, 35.47), dsh = new THREE.Mesh(new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2), ADD('#9fe4ff', 0)); dsh.scale.set(1.3, 1, 5.7); dsh.position.set(ds[0], 0.45, ds[1]); strips[2].g.add(dsh);
  const badges = [1, 2, 3].map(n => { const b = makeBadge(n); root.add(b); return b; });
  /* cut lines */
  const cutPts = x => { const p = []; for (let z = ZN; z <= ZS; z += 2) p.push([x, Math.max(mapY(x, z), 0.14) + 0.6, z]); return p; };
  const cut = [-3.0, 6.0].map(x => { const l = K.makeThickLine(cutPts(x), 0.3, BASIC('#fff2a0')), gl = K.makeThickLine(cutPts(x), 0.8, ADD('#ffcf3a', 0.3)); root.add(l, gl); return [l, gl]; });
  const api = {
    root, strips, badges, jd, jh, jb, dsh, cut,
    /* o: {sep 0..1, lit[3], raise[3], dim 0..1, cutU[2] , cutVis} */
    set(o, lt) {
      const gap = 3.4 * o.sep, any = Math.max(...o.lit);
      strips.forEach((s, i) => {
        const l = o.lit[i], dim = 1 - (o.dim || 0) * 0.30 * (1 - l);
        s.g.position.set((i - 1) * gap, (o.raise ? o.raise[i] : 0) + 0.7 * l, 0);
        s.mat.color.setScalar(dim); s.mat.emissive.setRGB(0.5 * l * 0.28, 0.42 * l * 0.28, 0.16 * l * 0.28);
        s.glow.material.opacity = 0.09 * l * (0.8 + 0.2 * Math.sin(lt * 4 + i)); s.glow.visible = l > 0.01;
        badges[i].position.set(s.xc + (i - 1) * gap, 9.2 + 0.25 * Math.sin(lt * 2 + i) + (o.raise ? o.raise[i] : 0), -6); badges[i].quaternion.copy(cam.quaternion);
      });
      cut.forEach((c, i) => { const u = o.cutU ? o.cutU[i] : 0; c[0].userData.setU(u); c[1].userData.setU(u); c[0].visible = c[1].visible = !!o.cutVis && u > 0; });
    }
  };
  return api;
}

function buildD(ST) {
  const grp = new THREE.Group();
  const KEYS = [[0, [3, 46, 50], [0, 0, -2]], [6, [-4, 40, 46], [-2, 0, -3]], [12, [-9, 38, 42], [-5, 0, -3]], [17.5, [0, 36, 42], [2, 0, -4]], [22, [10, 38, 44], [7, 0, -3]], [25.75, [2, 46, 50], [0, 0, -2]]];
  const litOf = (lt, on, next) => ramp(lt, on, on + 0.7) * (1 - 0.55 * (next ? ramp(lt, next, next + 0.7) : 0)) * (1 - ramp(lt, 23.4, 25));
  const upd = lt => {
    setCam(path(lt, KEYS));
    const sep = ramp(lt, 4.0, 6.8) * (1 - ramp(lt, 23.2, 25.3));
    const l1 = litOf(lt, 7.9, 13.1), l2 = litOf(lt, 13.1, 18.6), l3 = litOf(lt, 18.6, 0);
    ST.set({ sep, lit: [l1, l2, l3], raise: [0, 0.8 * l2, 0], dim: ramp(lt, 7.9, 8.6) * (1 - ramp(lt, 23.4, 25)), cutU: [ramp(lt, 0.4, 2.6), ramp(lt, 1.8, 3.9)], cutVis: lt < 4.9 }, lt);
    ST.badges[0].userData.show(cl((lt - 8.2) / 0.5)); ST.badges[1].userData.show(cl((lt - 13.4) / 0.5)); ST.badges[2].userData.show(cl((lt - 18.9) / 0.5));
    ST.badges.forEach(b => { if (lt > 24.0) b.userData.show(1 - cl((lt - 24.0) / 0.6)); });
    const jp = cl((lt - 13.4) / 0.5); ST.jd.visible = jp > 0; ST.jd.scale.setScalar(pop(jp)); ST.jh.material.opacity = 0.4 * ramp(lt, 13.6, 14.4) * (0.6 + 0.4 * Math.sin(lt * 6));
    ST.dsh.material.opacity = 0.55 * l3 * (0.7 + 0.3 * Math.sin(lt * 3)); ST.dsh.visible = l3 > 0.01;
  };
  const tipa = lt => ({ side: -1, xf: 0.8, size: 0.2, expr: lt < 4 ? 'curious' : lt < 7.9 ? 'surprised' : lt < 23.4 ? 'happy' : 'cheering', arms: lt < 7.9 ? 'point' : lt < 23.4 ? 'down' : 'up', hop: lt > 23.4 ? 0.4 : 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, table: 'strips', sun: { t: [0, 0, 0], ext: 80 }, mood: 'd' };
}

/* ======================================================================== e: quiz, which strip */
function buildE(ST) {
  const grp = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.38, 10, 56).rotateX(Math.PI / 2), BASIC('#ffd24a')); grp.add(ring);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 22, 24, 1, true).translate(0, 11, 0), ADD('#ffe27a', 0)); grp.add(tower);
  const GAP = 3.4, cx = [-8 - GAP, 1.5, 14 + GAP], JZ = -5.0;
  const hops = [[1.0, 2.3, 0, 2], [2.3, 3.6, 2, 0], [3.6, 4.7, 0, 2], [4.7, 5.6, 2, 1]];
  const KEYS = [[0, [4, 36, 46], [2, 0, -4]], [7.0, [2, 33, 44], [3, 1, -5]], [11.6, [1, 34, 48], [2, 3, -5]], [15.5, [2, 35, 50], [2, 4, -5]], [19.87, [3, 36, 52], [2, 4, -5]]];
  const upd = lt => {
    setCam(path(lt, KEYS));
    const bl = ramp(lt, 0.4, 0.9) * (1 - ramp(lt, 5.4, 5.9)), ans = ramp(lt, 7.05, 8.6), cd = lt > 6.75 ? 1 : 0;
    const q = i => (lt < 5.6 ? bl * 0.5 * (0.5 + 0.5 * Math.sign(Math.sin(lt * 5.2 + i * 2.1))) : 0);
    const lit = [q(0), q(1) + (lt >= 5.6 && lt < 7.05 ? 0.25 * (0.6 + 0.4 * Math.sin(lt * 6)) : 0) + ans, q(2)];
    ST.set({ sep: 1, lit, raise: [0, 8.5 * ans, 0], dim: ans }, lt);
    /* ring path */
    let rx = cx[1], ry = 6.2; const sx = i => cx[i];
    if (lt < 5.6) { let seg = hops[0]; for (const h of hops) if (lt >= h[0]) seg = h; const p = cl((lt - seg[0]) / (seg[1] - seg[0])); rx = lt < hops[0][0] ? cx[0] : lerp(sx(seg[2]), sx(seg[3]), sm(p)); ry = 6.2 + 4.0 * Math.sin(Math.PI * p) * (lt < hops[0][0] ? 0 : 1); }
    ring.visible = lt > 0.7; ring.scale.setScalar(pop((lt - 0.7) / 0.4) * (1 + 0.05 * Math.sin(lt * (cd ? 10 : 4))));
    const up = 8.5 * ans; ring.position.set(rx, ry + (lt >= 5.6 ? up + 0.3 * Math.sin(lt * 4) : 0), JZ);
    ring.material.color.set(lt > 7.3 ? '#7be08a' : '#ffd24a');
    tower.position.set(cx[1], 8.5 * ans - 1, JZ); tower.material.opacity = 0.09 * ans * (0.8 + 0.2 * Math.sin(lt * 4)); tower.visible = ans > 0.01;
    const jp = ramp(lt, 5.6, 6.1); ST.jd.visible = jp > 0; ST.jd.scale.setScalar(pop(jp) * (1 + 0.25 * Math.max(0, Math.sin(lt * 7)) * (lt >= 5.6 ? 1 : 0))); ST.jh.material.opacity = 0.4 * jp * (0.6 + 0.4 * Math.sin(lt * 7));
    ST.dsh.visible = false;
    ST.badges.forEach((b, i) => { b.userData.show(i === 1 ? ramp(lt, 7.6, 8.2) : 0); });
  };
  const tipa = lt => ({ side: 1, xf: 0.8, size: 0.2, expr: lt < 5.6 ? 'curious' : lt < 7.05 ? 'worried' : lt < 11.6 ? 'cheering' : 'happy', arms: lt < 7.05 ? 'down' : lt < 11.6 ? 'up' : 'point', hop: lt > 7.2 && lt < 11.6 ? 0.5 : 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, table: 'strips', sun: { t: [0, 0, 0], ext: 80 }, mood: 'e' };
}

/* ======================================================================== x: short arrow, long arrow, two clocks */
function arrowTrail(pts, r, hex) {
  const g = new THREE.Group(), line = K.makeThickLine(pts, r, phong(hex, { shininess: 70 })); g.add(line);
  const head = new THREE.Mesh(new THREE.ConeGeometry(r * 2.8, r * 6.5, 18).translate(0, r * 3.2, 0), phong(hex, { shininess: 70 })); head.castShadow = true; g.add(head);
  const V = pts.map(p => new THREE.Vector3(...p)), cum = [0]; for (let i = 1; i < V.length; i++) cum.push(cum[i - 1] + V[i].distanceTo(V[i - 1]));
  const total = cum[cum.length - 1];
  const at = d => { let i = 0; while (i < V.length - 2 && d > cum[i + 1]) i++; const u = cl((d - cum[i]) / (cum[i + 1] - cum[i])); return { p: V[i].clone().lerp(V[i + 1], u), t: V[i + 1].clone().sub(V[i]).normalize() }; };
  g.userData.at = at; g.userData.total = total;
  g.userData.set = u => { line.userData.setU(u); head.visible = u > 0.005; const a = at(u * total); head.position.copy(a.p); head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a.t); g.visible = u > 0.005; };
  g.userData.set(0); return g;
}
function makeClock(hex) {
  const g = new THREE.Group(), c = cvs(256, 256), x = c.getContext('2d');
  x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(128, 128, 124, 0, 6.3); x.fill(); x.strokeStyle = '#33302a'; x.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.lineWidth = i % 3 === 0 ? 10 : 5; x.beginPath(); x.moveTo(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); x.lineTo(128 + Math.sin(a) * 116, 128 - Math.cos(a) * 116); x.stroke(); }
  const R = 2.7; g.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.3, 10, 40), phong(hex, { shininess: 80 })));
  const f = new THREE.Mesh(new THREE.CircleGeometry(R, 40), BASIC('#ffffff', { map: new THREE.CanvasTexture(c) })); f.position.z = -0.02; g.add(f);
  const mh = new THREE.Mesh(new THREE.BoxGeometry(0.22, R * 0.82, 0.12).translate(0, R * 0.41, 0), BASIC('#c0301c')), hh = new THREE.Mesh(new THREE.BoxGeometry(0.3, R * 0.55, 0.12).translate(0, R * 0.27, 0), BASIC('#222222'));
  mh.position.z = 0.1; hh.position.z = 0.08; g.add(mh, hh); const kn = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), BASIC('#222222')); kn.position.z = 0.12; g.add(kn);
  g.userData.set = th => { mh.rotation.z = -th; hh.rotation.z = -th / 12; };
  return g;
}
function buildX() {
  const grp = new THREE.Group();
  const hp = ll(33.42, 35.8), ep = ll(29.58, 34.95);
  const pinH = K.makePin('#0f3d7a'), pinE = K.makePin('#1fa05a');
  [[pinH, hp], [pinE, ep]].forEach(([p, q]) => { p.userData.k = 1.6; p.position.set(q[0], mapY(q[0], q[1]) + 0.05, q[1]); grp.add(p); });
  const zS = -(32.05 - 31.5) * 18, shortPts = [[-6.5, 5.0, zS], [8.6, 5.0, zS]];
  const shortA = arrowTrail(shortPts, 0.42, '#e0401e'); grp.add(shortA);
  for (const x of [-6.5, 8.6]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 5.6, 8).translate(0, 2.8, 0), phong('#c9a24a', { shininess: 80 })); p.position.set(x, 0.1, zS); grp.add(p); }
  const longPts = [[hp[0], 5.8, hp[1]], [8.5, 5.8, -22], [5.2, 5.8, -6], [4.0, 5.8, 10], [1.6, 5.8, 23], [ep[0], 5.8, ep[1]]];
  const longA = arrowTrail(longPts, 0.5, '#1f6fd0'); grp.add(longA);
  const clS = makeClock('#e0401e'), clL = makeClock('#1f6fd0'); grp.add(clS, clL);
  const sparkle = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.25), BASIC('#ffffff'), 60); sparkle.frustumCulled = false; grp.add(sparkle);
  const dm = new THREE.Object3D();
  const headZ = u => longA.userData.at(u * longA.userData.total).p;
  const upd = lt => {
    const uS = ramp(lt, 0.5, 2.3), uL = cl((lt - 6.3) / 12.7);
    const lz = lt < 6.3 ? piece([[0, -9], [2.8, -9], [6.3, -28]], lt) : -28 + 48 * uL;
    const lx = lt < 6.3 ? piece([[0, 1.5], [2.8, 1.5], [6.3, 7]], lt) : lerp(7, 1, uL);
    const high = 34 + 10 * ramp(lt, 18.2, 19.97);
    setCam({ p: [lx - 5, high, lz + 31], l: [lx, 0, lz] });
    pinH.userData.pop((lt - 0.2) / 0.5); pinE.userData.pop((lt - 0.4) / 0.5); pinH.userData.glow(ramp(lt, 5.8, 6.4) * 0.7 * (0.7 + 0.3 * Math.sin(lt * 5))); pinE.userData.glow(ramp(lt, 18.4, 19) * 0.7 * (0.7 + 0.3 * Math.sin(lt * 5)));
    shortA.userData.set(uS); longA.userData.set(uL);
    clS.position.set(-10, 7.0, zS + 5); clS.quaternion.copy(cam.quaternion); clS.userData.set(uS * Math.PI * 0.6); clS.scale.setScalar(pop((lt - 0.3) / 0.5));
    const hz = headZ(uL).z; clL.position.set(headZ(uL).x + 7, 7.4, lt < 6.3 ? -34 : hz); clL.quaternion.copy(cam.quaternion); clL.userData.set(uL * Math.PI * 2 * 7); clL.scale.setScalar(pop((lt - 5.8) / 0.5));
    for (let i = 0; i < 60; i++) { const a = headZ(uL), f = (lt * 0.9 + hash2(i, 4)) % 1; dm.position.set(a.x + (hash2(i, 5) - 0.5) * 1.6, a.y + (hash2(i, 6) - 0.5) * 1.6 - f * 1.2, a.z + (hash2(i, 7) - 0.5) * 1.6 - f * 1.5); dm.scale.setScalar(Math.max(0.0001, (uL > 0.01 && uL < 0.99 ? 1 : 0) * Math.sin(Math.PI * f))); dm.rotation.set(f * 6, f * 4, 0); dm.updateMatrix(); sparkle.setMatrixAt(i, dm.matrix); }
    sparkle.instanceMatrix.needsUpdate = true;
  };
  const tipa = lt => ({ side: 1, xf: 0.8, size: 0.2, expr: lt < 0.5 ? 'neutral' : lt < 2.4 ? 'cheering' : lt < 6.3 ? 'curious' : lt < 18.5 ? 'worried' : 'surprised', arms: lt < 6.3 ? 'point' : 'down', hop: lt < 2.4 && lt > 0.5 ? 0.5 : 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, table: 'map', sun: { t: [0, 0, 0], ext: 80 }, mood: 'x' };
}

/* ======================================================================== q: quiz, west edge */
function buildQ() {
  const grp = new THREE.Group();
  const BL = makeBorderLines(); grp.add(BL.coast, BL.jordan); BL.coast.userData.setU(1); BL.jordan.userData.setU(1);
  const RZ = -2.0, rcx = coastX(RZ);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.34, 10, 48).rotateX(Math.PI / 2), BASIC('#ffd24a')); grp.add(ring);
  const NS = 34, wave = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), lam('#3d9ad6', { emissive: '#14507a' }), NS), foamW = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), BASIC('#ffffff'), NS);
  wave.frustumCulled = foamW.frustumCulled = false; grp.add(wave, foamW);
  const wz = Array.from({ length: NS }, (_, i) => -30 + i * 1.05), dm = new THREE.Object3D();
  const SP = 150, r = rng(77), sp = []; for (let k = 0; k < 3000 && sp.length < SP; k++) { const x = -19 + r() * 18, z = -37 + r() * 74; if (mapY(x, z) < -0.2) sp.push([x, z, r() * 6.3]); }
  const spark = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.28), BASIC('#ffffff'), sp.length); spark.frustumCulled = false; grp.add(spark);
  const KEYS = [[0, [-10, 30, 50], [-1, 0, -6]], [4, [-6, 34, 48], [0, 0, -6]], [8.13, [-3, 38, 46], [1, 0, -5]]];
  const upd = lt => {
    setCam(path(lt, KEYS));
    const bl = ramp(lt, 0.4, 0.8) * (1 - ramp(lt, 5.1, 5.4));
    const west = lt < 5.1 ? 0.25 + 0.75 * (0.5 + 0.5 * Math.sign(Math.sin(lt * 6.0))) : 0.85 + 0.15 * Math.sin(lt * 8), east = lt < 5.1 ? 0.25 + 0.75 * (0.5 + 0.5 * Math.sign(Math.sin(lt * 6.0 + 3.14))) : 0.4;
    BL.coast.userData.setO(lt < 0.4 ? 0.5 : west); BL.jordan.userData.setO(lt < 0.4 ? 0.5 : east);
    const cd = lt > 5.31 ? 1 : 0; ring.visible = lt > 0.8; ring.scale.setScalar(pop((lt - 0.8) / 0.4) * (1 + 0.06 * Math.sin(lt * (cd ? 10 : 4)))); ring.position.set(rcx - 1.0, 2.6 + 0.3 * Math.sin(lt * 4), RZ);
    ring.material.color.set(lt > 5.61 ? '#7be08a' : '#ffd24a');
    const an = ramp(lt, 5.61, 6.4), wd = 15 * (1 - ramp(lt, 5.7, 7.9)) + 0.5, amp = lt < 5.7 ? 0.001 : (0.35 + 1.8 * ramp(lt, 5.7, 7.6)) * (1 - 0.8 * ramp(lt, 7.9, 8.13));
    wz.forEach((z, i) => { const cxx = coastX(Math.min(z, 4.8)) - wd - 0.5 * Math.sin(i * 0.7), env = Math.sin(Math.PI * Math.min(1, (i + 0.5) / NS)) ** 0.5; const A = amp * (0.7 + 0.3 * env);
      dm.position.set(cxx, 0.2 + 0.35 * A, z); dm.scale.set(1.5 * A + 0.001, 0.9 * A + 0.001, 1.1); dm.rotation.set(0, 0, 0); dm.updateMatrix(); wave.setMatrixAt(i, dm.matrix);
      dm.position.set(cxx + 0.8 * A, 0.2 + 0.95 * A, z); dm.scale.set(0.8 * A + 0.001, 0.4 * A + 0.001, 0.9); dm.updateMatrix(); foamW.setMatrixAt(i, dm.matrix); });
    wave.instanceMatrix.needsUpdate = foamW.instanceMatrix.needsUpdate = true;
    sp.forEach((s, i) => { const v = Math.max(0, Math.sin(lt * 7 + s[2] * 3)); const k = an * v * v * (1 + 0.5 * Math.sin(i)); dm.position.set(s[0], 0.2, s[1]); dm.scale.setScalar(Math.max(0.0001, k)); dm.rotation.set(0, lt * 2, 0); dm.updateMatrix(); spark.setMatrixAt(i, dm.matrix); });
    spark.instanceMatrix.needsUpdate = true;
  };
  const tipa = lt => ({ side: -1, xf: 0.8, size: 0.2, expr: lt < 0.8 ? 'neutral' : lt < 5.31 ? 'curious' : lt < 5.61 ? 'worried' : 'cheering', arms: lt < 5.61 ? 'down' : 'up', hop: lt > 5.61 ? 0.5 : 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, table: 'map', sun: { t: [0, 0, 0], ext: 80 }, mood: 'q' };
}

/* ======================================================================== assembly */
let SH = null, ST = null;
const TL = [['a', 's2a_continents', 0, 17.44], ['b', 's2b_borders', 17.44, 34.29], ['c', 's2c_torah', 34.29, 41.78], ['d', 's2d_strips', 41.78, 67.53], ['x', 's2x_shape', 67.53, 87.5], ['q', 's2q_quiz2', 87.5, 95.63], ['e', 's2e_quiz', 95.63, DUR]];
const stripRoot = new THREE.Group(); scene.add(stripRoot);

function frame(tl) {
  if (!SH) return;
  const t = Math.max(0, Math.min(DUR - 0.001, tl));
  let si = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i].t0) si = i;
  const s = SH[si], lt = t - s.t0;
  SH.forEach((o, i) => { o.grp.visible = i === si; });
  mapRoot.visible = s.table === 'map'; stripRoot.visible = s.table === 'strips';
  if (mapRoot.visible) { MAP.slide(0); MAP.paint(1); }
  branch.visible = !!s.branch;
  setMood(MOODS[s.mood]);
  const sc = typeof s.sun === 'function' ? s.sun(lt) : s.sun, so = [72, 63.6, 72];
  sun.target.position.set(...sc.t); sun.position.set(sc.t[0] + so[0], sc.t[1] + so[1], sc.t[2] + so[2]);
  if (sun.shadow.camera.right !== sc.ext) { Object.assign(sun.shadow.camera, { left: -sc.ext, right: sc.ext, top: sc.ext, bottom: -sc.ext }); sun.shadow.camera.updateProjectionMatrix(); }
  s.upd(lt, t);
  cam.updateMatrixWorld();
  comp.place(Object.assign({ t }, s.tipa(lt))); comp.sync();
  renderer.autoClear = false; renderer.clear(); renderer.render(scene, cam); renderer.clearDepth(); renderer.render(scene2, cam);
}

window.__dur = DUR;
window.__shots = TL.map(([, id, t0, t1], i) => ({ id, index: i, t0, dur: +(t1 - t0).toFixed(2) }));
window.__events = [
  { t: 0.9, kind: 'whoosh' }, { t: 6.9, kind: 'ding' }, { t: 8.0, kind: 'pop' }, { t: 10.6, kind: 'pop' }, { t: 12.8, kind: 'pop' }, { t: 13.4, kind: 'whoosh' }, { t: 14.5, kind: 'ding' },
  { t: 17.94, kind: 'whoosh' }, { t: 23.0, kind: 'whoosh' }, { t: 25.9, kind: 'pop' }, { t: 25.9 + 0.1, kind: 'ding' }, { t: 17.44 + 8.45, kind: 'pop' }, { t: 17.44 + 11.5, kind: 'pop' },
  { t: 34.74, kind: 'ding' }, { t: 36.5, kind: 'whoosh' },
  { t: 42.2, kind: 'whoosh' }, { t: 43.8, kind: 'whoosh' }, { t: 45.8, kind: 'whoosh' }, { t: 49.7, kind: 'pop' }, { t: 55.2, kind: 'pop' }, { t: 60.7, kind: 'pop' }, { t: 65.0, kind: 'whoosh' },
  { t: 68.0, kind: 'whoosh' }, { t: 68.5, kind: 'pop' }, { t: 73.8, kind: 'pop' }, { t: 79.5, kind: 'tick' }, { t: 83.0, kind: 'tick' },
  { t: 92.81, kind: 'countdown' }, { t: 93.11, kind: 'answer' }, { t: 93.5, kind: 'whoosh' }, { t: 95.3, kind: 'splash' },
  { t: 96.7, kind: 'pop' }, { t: 99.3, kind: 'pop' }, { t: 102.38, kind: 'countdown' }, { t: 102.68, kind: 'answer' }, { t: 102.9, kind: 'whoosh' }, { t: 103.5, kind: 'ding' }, { t: 110.5, kind: 'stamp' }
];
window.__caption = () => null; window.__heroBox = () => null; window.__sceneHash = () => 'toldot10g-s2-v1';
window.__errors = [];
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

async function main() {
  try {
    const TABLE = K.makeTable(); MAP = K.makeTableMap(); mapRoot.add(TABLE, MAP.grp);
    ST = makeStrips(); stripRoot.add(ST.root);
    const builders = { a: buildA, b: buildB, c: buildC, d: () => buildD(ST), x: buildX, q: buildQ, e: () => buildE(ST) };
    SH = TL.map(([id, , t0, t1]) => Object.assign({ id, t0, t1 }, builders[id]()));
    SH.forEach(s => { scene.add(s.grp); s.grp.visible = false; });
    await comp.warm();
    for (const s of SH) { frame(s.t0 + 0.5); frame(s.t0 + (s.t1 - s.t0) * 0.5); }
    frame(0); window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
}
setTimeout(main, 0);
