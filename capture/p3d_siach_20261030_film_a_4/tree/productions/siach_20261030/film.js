/* siach_20261030 - 3D cel-shaded film, 246.5 s, 15 shots. Deterministic: every frame is a pure function of t.
   Worlds: TW tower+stairs, RD road+bus, HL study hall, HS rainy street, HI hill path, MS mist meadow, DS dusk desert.
   People only through people.js. No text, letters or digits anywhere. */
import { THREE, sm, cl, kf, D2R, part, ell, lathe, RoundedBoxGeometry } from '../../lib/toon3d/toon3d.js';
import { mergeGeometries } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import * as P from './people.js';
import * as PR from './props.js';
import { M, glow, box, bas, WOOD, WOOD2, WOODD, STONE, STONE2 } from './props.js';

export const DUR = 246.5;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture') || Q.get('hq') === '1');
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;

/* ------------------------------------------------------------------ renderer, scene, camera */
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.domElement.id = 'c'; document.getElementById('wrap').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, 16 / 9, 5, 40000);
const sky = PR.makeSky(); scene.add(sky);
function mkOverlay(order) {
  const mat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, uniforms: { uC: { value: new THREE.Color('#000') }, uA: { value: 0 } },
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: 'uniform vec3 uC; uniform float uA; void main(){ gl_FragColor = vec4(uC, uA); }' });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); m.frustumCulled = false; m.renderOrder = order; scene.add(m); return mat;
}
const ovMat = mkOverlay(10), disMat = mkOverlay(40);

/* ------------------------------------------------------------------ small utils */
const lerp = (a, b, u) => a + (b - a) * u;
const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const angMix = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rise = (t, a, b) => sm((t - a) / (b - a));
const pulse = (t, a, b, c, d) => rise(t, a, b) * (1 - rise(t, c, d));
const blink = (t, seed, per) => { per = per || 3.3; const u = ((t + seed * 1.37) % per + per) % per; return u < 0.13; };
const step = (t, list) => { let v = list[0][1]; for (const e of list) if (t >= e[0]) v = e; else break; return v; };
const colK = (t, keys) => { if (t <= keys[0][0]) return new THREE.Color(keys[0][1]); for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = sm((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return new THREE.Color(keys[i - 1][1]).lerp(new THREE.Color(keys[i][1]), u); } return new THREE.Color(keys[keys.length - 1][1]); };

/* ------------------------------------------------------------------ routes (walk by distance -> planted feet) */
const YAW = (dx, dz) => Math.atan2(-dz, dx);
function chain(t0, v, pts) {            // pts: [x, z, y, {wait, yaw}] -> keys with times from distances
  const keys = []; let t = t0;
  pts.forEach((p, i) => {
    if (i > 0) { const q = pts[i - 1]; t += Math.hypot(p[0] - q[0], p[1] - q[1], (p[2] || 0) - (q[2] || 0)) / v; }
    keys.push([t, p[0], p[1], p[2] || 0, p[3] && p[3].yaw]);
    if (p[3] && p[3].wait) { t += p[3].wait; keys.push([t, p[0], p[1], p[2] || 0, p[3].yaw2 != null ? p[3].yaw2 : p[3].yaw]); }
  });
  return keys;
}
function mkRoute(keys) {
  const K = keys.map(k => ({ t: k[0], x: k[1], z: k[2], y: k[3] || 0, yaw: k[4] })), n = K.length, seg = []; let cum = 0, yawPrev = K[0].yaw != null ? K[0].yaw : 0;
  for (let i = 0; i < n - 1; i++) {
    const a = K[i], b = K[i + 1], dx = b.x - a.x, dz = b.z - a.z, dy = b.y - a.y, hl = Math.hypot(dx, dz), len = Math.hypot(hl, dy), T = b.t - a.t, stand = len < 1e-6;
    seg.push({ a, b, dx, dz, dy, hl, len, T, stand, D0: cum, stand0: stand });
    cum += len;
  }
  seg.forEach((s, i) => {
    s.ei = i === 0 || seg[i - 1].stand; s.eo = i === n - 2 || seg[i + 1].stand;
    s.tin = s.ei ? Math.min(0.45, s.T / 3) : 0; s.tout = s.eo ? Math.min(0.45, s.T / 3) : 0;
    s.V = s.stand ? 0 : s.len / (s.T - (s.tin + s.tout) / 2);
    if (s.stand) s.yaw = s.a.yaw != null ? s.a.yaw : yawPrev; else s.yaw = YAW(s.dx, s.dz);
    if (s.b.yaw != null && s.stand) s.yaw = s.b.yaw;
    yawPrev = s.yaw;
    s.slope = s.stand ? 0 : Math.atan2(s.dy, s.hl || 1e-6);
  });
  const raw = t => {
    t = cl(t, K[0].t, K[n - 1].t); let i = seg.findIndex(s => t <= s.b.t); if (i < 0) i = n - 2; const s = seg[i], u = t - s.a.t;
    if (s.stand) return { x: s.a.x, y: s.a.y, z: s.a.z, d: s.D0, sp: 0, i, ks: 0, ka: 0, Ds: s.D0, De: s.D0 };
    let d, sp; const tin = s.tin, tout = s.tout, V = s.V;
    if (tin && u < tin) { d = V * u * u / (2 * tin); sp = V * u / tin; }
    else if (tout && u > s.T - tout) { const r = s.T - u; d = s.len - V * r * r / (2 * tout); sp = V * r / tout; }
    else { d = tin ? V * tin / 2 + V * (u - tin) : V * u; sp = V; }
    const f = d / s.len, ks = s.tout && u > s.T - s.tout ? sm((u - (s.T - s.tout)) / s.tout) : 0, ka = s.tin && u < s.tin ? 1 - sm(u / s.tin) : 0;
    return { x: s.a.x + s.dx * f, y: s.a.y + s.dy * f, z: s.a.z + s.dz * f, d: s.D0 + d, sp: sp / Math.max(V, 1e-6), i, ks, ka, Ds: s.D0, De: s.D0 + s.len };
  };
  const yawAt = t => {
    const w = 0.4; let best = null;
    for (let i = 0; i < n - 2; i++) { const bt = seg[i].b.t; if (Math.abs(t - bt) < w) { best = [i, bt]; break; } }
    const r = raw(t);
    if (best) { const [i, bt] = best; return angMix(seg[i].yaw, seg[i + 1].yaw, sm((t - (bt - w)) / (2 * w))); }
    return seg[r.i].yaw;
  };
  return {
    t0: K[0].t, t1: K[n - 1].t,
    at(t) {
      const a = raw(t - 0.2), b = raw(t), c = raw(t + 0.2);
      const x = (a.x + 2 * b.x + c.x) / 4, y = (a.y + 2 * b.y + c.y) / 4, z = (a.z + 2 * b.z + c.z) / 4;
      const i = seg[b.i], moving = !i.stand && b.sp > 0.02, sl = (() => { const w = 0.3; const sA = seg[raw(t - w).i].slope, sB = seg[raw(t + w).i].slope; return (sA + sB) / 2; })();
      return { x, y, z, yaw: yawAt(t), walk: moving ? cl(b.sp * 3, 0.0, 1) : 0, D: b.d, slope: sl, ks: b.ks, ka: b.ka, Ds: b.Ds, De: b.De };
    },
  };
}

// walk phase: distance based (feet planted); within the ease-in / ease-out the phase is nudged so the stride rests on a half cycle (both feet planted) at every start and stop
const PH = (r, cyc) => { let ph = r.D / cyc; if (r.ks) ph += (Math.round(2 * r.De / cyc) / 2 - r.De / cyc) * r.ks; if (r.ka) ph += (Math.round(2 * r.Ds / cyc) / 2 - r.Ds / cyc) * r.ka; return ph; };
const faceOf = (expr, t, seed, o) => Object.assign({ expr, blink: blink(t, seed) }, o || {});
const TALK = 'AEXOAMEAXU_OAEXA_MEAOX_AEXA';
const talkAt = (t, a, b) => { if (t < a || t > b) return null; const c = TALK[Math.floor((t - a) / 0.12) % TALK.length]; return c === '_' ? null : c; };

/* ------------------------------------------------------------------ actors (created first: the stairs depend on the bochur stride) */
const ACT = {};
function addPerson(id, mk) { const o = mk(); const h = new THREE.Group(); h.rotation.order = 'YZX'; h.add(o.root); scene.add(h); ACT[id] = { o, h, cycle: o.cycle, fn: () => null, person: true }; return ACT[id]; }
function addProp(id, group) { ACT[id] = { h: group, fn: () => null, prop: true }; return ACT[id]; }
addPerson('BO', P.makeBochur); addPerson('M', P.makeMan); addPerson('RA', P.makeRabbiA); addPerson('OB', P.makeBochur);
for (let i = 1; i <= 6; i++) addPerson('C' + i, P.makeBochur);
// the farmer: straw-coloured hat instead of the dark city hat
{
  const D = window.K.MAN, tgt = [[D.hat, '#e7c65c'], [D.band, '#b4452f']];
  ACT.M.o.root.traverse(o => { const m = o.material; if (!m || !m.uniforms || !m.uniforms.uColor) return; const c = '#' + m.uniforms.uColor.value.getHexString();
    for (const [from, to] of tgt) if (from && c.toLowerCase() === from.toLowerCase()) { m.uniforms.uColor.value.set(to); break; } });
}
const BOC = ACT.BO.cycle, TREAD = BOC / 2;

/* ------------------------------------------------------------------ small builders */
const hexM = (h, t) => M(h, t);
function hill(g, x, z, rx, ry, rz, mat, ow) { return part(g, ell(rx, ry, rz, 28, 14), mat, ow == null ? 8 : ow, [x, -ry * 0.3, z]); }
function tree(g, x, z, s, y, leaf) {
  const g0 = new THREE.Group(); g0.position.set(x, y || 0, z); g0.scale.setScalar(s); g.add(g0);
  part(g0, new THREE.CylinderGeometry(18, 26, 170, 12).translate(0, 85, 0), M('#8a5a3a'), 4);
  for (const [a, b, c2, r] of [[0, 250, 0, 95], [-60, 215, 30, 70], [62, 220, -20, 74], [10, 300, -10, 70]]) part(g0, ell(r, r * 0.92, r, 14, 10), M(leaf || '#5fae4e'), 4, [a, b, c2]);
  if (g.userData.items) g.userData.items.push({ o: g0, x, z, k: 't' });
  return g0;
}
function house(g, x, z, w, h, d, c, roof, ry) {
  const h0 = new THREE.Group(); h0.position.set(x, 0, z); h0.rotation.y = ry || 0; g.add(h0);
  box(h0, w, h, d, M(c), [0, h / 2, 0], 3.4, null, 5);
  const rs = new THREE.Shape(); rs.moveTo(-d / 2 - 20, 0); rs.lineTo(d / 2 + 20, 0); rs.lineTo(0, d * 0.4); rs.lineTo(-d / 2 - 20, 0);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: w + 40, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-(w + 40) / 2, h, 0); part(h0, rg, M(roof || '#b8553c', '#8a6a78'), 3);
  for (const s of [-1, 1]) box(h0, w * 0.2, h * 0.24, 8, bas('#ffd88a'), [s * w * 0.27, h * 0.58, d / 2 + 2], 2, null, 2);
  box(h0, w * 0.16, h * 0.42, 8, M('#8f5d33'), [0, h * 0.21, d / 2 + 2], 2, null, 2);
  if (g.userData.items) g.userData.items.push({ o: h0, x, z, k: 'h' });
  return h0;
}
function ribbon(pts, w, mat, ow) {            // pts [[x,y,z]...] -> flat strip
  const n = pts.length, pos = new Float32Array(n * 6), idx = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], tz = b[2] - a[2]; const L = Math.hypot(tx, tz) || 1; tx /= L; tz /= L;
    const nx = -tz * w / 2, nz = tx * w / 2, p = pts[i];
    pos.set([p[0] + nx, p[1], p[2] + nz, p[0] - nx, p[1], p[2] - nz], i * 6);
    if (i < n - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; return m;
}
const mulb = PR.mulberry;
const soft = (parent, hex, size, pos, op, normal) => { const s = glow(parent, hex, size, pos, op); if (normal) { s.material.blending = THREE.NormalBlending; } return s; };

/* ------------------------------------------------------------------ WORLD TW: tall stone building with an outside zigzag staircase */


/* ------------------------------------------------------------------ shared small props */
const mkMesh = (geo, mat, parent, pos) => { const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (parent) parent.add(m); return m; };
const SPH = new THREE.SphereGeometry(1, 8, 6);
const clayM = () => M('#c9824a', '#8f5a3a');
function makePot() {
  const g = new THREE.Group();
  part(g, lathe([[0.1, 0], [20, 0], [26, 6], [30, 40], [35, 46], [35, 53], [28, 53], [0.1, 53]], 22), clayM(), 2.2);
  part(g, ell(27, 3, 27, 16, 6), M('#5a3a22', '#4a3a3a', 0), 0, [0, 50, 0]);
  const stem = part(g, new THREE.CylinderGeometry(4.2, 5.6, 1, 8).translate(0, 0.5, 0), M('#5cc04a', '#9cc08a'), 0.5, [0, 51, 0]);
  const l1 = part(g, ell(20, 4.5, 8, 10, 6), M('#7fd45a', '#9cc08a'), 1.1, [12, 60, 0], [0, 0, 0.5]);
  const l2 = part(g, ell(20, 4.5, 8, 10, 6), M('#7fd45a', '#9cc08a'), 1.1, [-12, 60, 0], [0, 0, -0.5]);
  const seed = glow(g, '#ffe27a', 90, [0, 58, 0], 0);
  g.userData.set = (h, glowOp) => {
    stem.scale.y = Math.max(0.001, h); stem.visible = h > 0.6;
    const lv = cl((h - 14) / 30, 0, 1); l1.visible = l2.visible = lv > 0.02;
    l1.position.y = l2.position.y = 51 + h * 0.92; l1.scale.setScalar(Math.max(0.01, lv)); l2.scale.setScalar(Math.max(0.01, lv));
    l1.rotation.z = 0.5 - 0.35 * (1 - lv); l2.rotation.z = -0.5 + 0.35 * (1 - lv);
    seed.material.opacity = glowOp || 0; seed.position.y = 58 + Math.min(h, 30) * 0.2;
  };
  g.userData.set(0, 0);
  return g;
}
function makeCan() {
  const g = new THREE.Group(), mc = M('#4f93c9', '#3a6a96');
  part(g, lathe([[0.1, 0], [22, 0], [26, 8], [26, 34], [22, 40], [0.1, 40]], 20), mc, 2.2);
  part(g, new THREE.CylinderGeometry(4.5, 7, 54, 10).rotateZ(-1.0).translate(36, 40, 0), mc, 1.8);   // spout up and out (+x)
  part(g, new THREE.TorusGeometry(15, 2.6, 6, 16, Math.PI * 1.25).rotateZ(2.4), M('#34628a'), 0, [-24, 22, 0]);
  const tip = new THREE.Group(); tip.position.set(58, 62, 0); g.add(tip); g.userData.tip = tip;
  return { g, tip };
}

/* ------------------------------------------------------------------ WORLD FM: farm, field, irrigation, village */
const FM = new THREE.Group(); scene.add(FM);
const furrowMat = M('#b57d46', '#8a6050'), soilMat = M('#8a5632', '#6a4a46', 0);
const FIELD_Z = i => -400 + 110 * i;
{
  part(FM, new THREE.BoxGeometry(18000, 60, 16000), M('#9ccd6c', '#c8d6c0', 0), 0, [0, -30, 0]);
  part(FM, new THREE.BoxGeometry(3500, 8, 1180), soilMat, 0, [0, 1, 105]);
  for (let i = 0; i < 10; i++) box(FM, 3400, 24, 36, furrowMat, [0, 12, FIELD_Z(i)], 0, null, 9);
  // gentle ring of hills all around
  const hm = [M('#9ccd6c', '#c8d6c0', 0), M('#7fb85a', '#c8d6c0', 0), M('#8cc068', '#c8d6c0', 0)];
  for (let i = 0; i < 14; i++) { const a = i * Math.PI * 2 / 14 + 0.2, R = 6200 + (i % 3) * 700; hill(FM, Math.cos(a) * R, Math.sin(a) * R, 2300 + (i % 4) * 300, 520 + (i % 3) * 170, 1500, hm[i % 3], 0); }
  for (const [x, z, rx, ry, rz, k] of [[-2400, -2300, 1500, 250, 600, 1], [2600, -2500, 1700, 300, 700, 2], [-600, -1900, 1200, 160, 400, 0]]) hill(FM, x, z, rx, ry, rz, hm[k], 5);
  // village on the hill crest
  hill(FM, 900, -3300, 2100, 380, 800, hm[2], 6);
  const VG = new THREE.Group(); VG.position.set(900, 232, -3300); FM.add(VG);
  const rnd = mulb(11);
  const walls = ['#f6e3c4', '#f1d2b0', '#fbefd6', '#eac9a6'];
  for (let i = 0; i < 9; i++) { const x = (i % 5 - 2) * 330 + (rnd() - 0.5) * 80, z = (i < 5 ? -140 : 150) + (rnd() - 0.5) * 60; house(VG, x, z, 190 + rnd() * 70, 130 + rnd() * 40, 150, walls[i % 4], '#c8553c', (rnd() - 0.5) * 0.3); }
  for (const [x, z, s] of [[-780, 40, 0.9], [-560, 200, 0.7], [640, 60, 1.0], [820, 190, 0.8], [90, 270, 0.7]]) tree(VG, x, z, s, 0, '#5fae4e');
  for (const [x, z, s] of [[-1300, 900, 1.5], [1500, 1000, 1.7], [2300, 700, 1.4], [-2100, 100, 1.6], [-1800, 1100, 1.3]]) tree(FM, x, z, s, 0, '#58a84a');
  // irrigation pipe along the back of the field + risers
  part(FM, new THREE.CylinderGeometry(14, 14, 3300, 12).rotateZ(Math.PI / 2), M('#5a8fc0', '#4a6a8a'), 2, [0, 16, -520]);
}
const SPR = [];
for (let k = 0; k < 10; k++) {
  const x = -1350 + k * 300, g = new THREE.Group(); g.position.set(x, 0, -520); FM.add(g);
  part(g, new THREE.CylinderGeometry(7, 7, 60, 8), M('#5a8fc0', '#4a6a8a'), 1.6, [0, 40, 0]);
  const head = part(g, ell(14, 9, 14, 10, 6), M('#e8b64a', '#a08040'), 1.6, [0, 74, 0]);
  const arm = box(g, 34, 6, 6, M('#d7a53c'), [14, 74, 0], 1.4, null, 2);
  const dr = []; for (let j = 0; j < 12; j++) { const m = mkMesh(SPH, new THREE.MeshBasicMaterial({ color: j % 3 ? '#c9ecff' : '#ffffff', transparent: true, opacity: 0.92 }), FM); m.scale.setScalar(4.4 + (j % 3)); dr.push(m); }
  SPR.push({ x, g, arm, dr });
}
const VALVE = new THREE.Group(); VALVE.position.set(200, 0, -520); FM.add(VALVE);
part(VALVE, new THREE.CylinderGeometry(9, 9, 80, 8), M('#5a8fc0', '#4a6a8a'), 1.6, [0, 50, -18]);
const VW = new THREE.Group(); VW.position.set(0, 100, -18); VALVE.add(VW);
part(VW, new THREE.TorusGeometry(26, 4, 8, 22), M('#d8432f', '#903020'), 1.6);
box(VW, 52, 5, 5, M('#d8432f'), [0, 0, 0], 1.2, null, 1); box(VW, 5, 52, 5, M('#d8432f'), [0, 0, 0], 1.2, null, 1);
// crop plants on the ridges
const PLANTS = [];
{
  const pm1 = M('#5cc04a', '#9cc08a'), pm2 = M('#86dd5e', '#9cc08a');
  for (let i = 0; i < 10; i++) for (let j = 0; j < 16; j++) {
    const g = new THREE.Group(); g.position.set(-1480 + j * 195 + (i % 2) * 95, 22, FIELD_Z(i)); FM.add(g);
    part(g, ell(7, 36, 7, 8, 6), pm1, 1.3, [0, 34, 0]);
    part(g, ell(26, 6, 10, 8, 6), pm2, 1.2, [18, 54, 0], [0, 0, 0.55]); part(g, ell(26, 6, 10, 8, 6), pm2, 1.2, [-18, 44, 0], [0, 0, -0.55]);
    g.scale.setScalar(0.001); g.visible = false; PLANTS.push({ g, d: hash(i * 17 + j * 3.1), k: i });
  }
}
// seeds in the air (s01)
const SEEDS = []; for (let k = 0; k < 18; k++) SEEDS.push(mkMesh(SPH, bas('#f2d27a'), FM));
SEEDS.forEach(m => m.scale.setScalar(5));
// sun
const SUN = new THREE.Group(); scene.add(SUN);
const sunDisc = mkMesh(SPH, bas('#fff3b8'), SUN); sunDisc.scale.setScalar(240);
const sunGl = glow(SUN, '#ffd27a', 2800, null, 0.8);
// clouds
const CLD = [], cloudM = M('#ffffff', '#cdd8ec', 0.01);
for (let i = 0; i < 11; i++) {
  const g = new THREE.Group(); const x = -2800 + i * 560 + ((i * 7) % 3) * 90, y = 1500 + ((i * 5) % 4) * 140, z = -700 - ((i * 3) % 5) * 520;
  for (const [a, b, r] of [[0, 0, 150], [-150, -30, 110], [160, -26, 118], [60, 54, 100], [-70, 48, 96]]) part(g, ell(r, r * 0.74, r * 0.62), cloudM, 5, [a, b, 0]);
  g.position.set(x, y, z); FM.add(g); CLD.push({ g, x, y, z, d: hash(i * 5.3) });
}
// rain gauge: post + clear tube + blue water (no marks)
const GAUGE = new THREE.Group(); GAUGE.position.set(-70, 0, 770); FM.add(GAUGE);
const gaugeW = mkMesh(new THREE.CylinderGeometry(12, 12, 1, 14).translate(0, 0.5, 0), bas('#3aa0ec'), GAUGE, [0, 74, 0]);
{
  box(GAUGE, 16, 150, 16, WOOD(), [0, 75, -22], 2.2, null, 2);
  mkMesh(new THREE.CylinderGeometry(15, 15, 132, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#d4eefb', transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }), GAUGE, [0, 140, 0]);
  part(GAUGE, new THREE.TorusGeometry(15, 2.4, 6, 18).rotateX(Math.PI / 2), M('#34495e'), 0, [0, 206, 0]);
  part(GAUGE, new THREE.CylinderGeometry(17, 17, 8, 14), M('#34495e'), 1.4, [0, 70, 0]);
  box(GAUGE, 6, 6, 30, WOODD(), [0, 118, -10], 1.4, null, 1);
}
const rainFM = PR.makeRain(1100, 5); rainFM.material.color.set('#fff0c8'); scene.add(rainFM);

/* ------------------------------------------------------------------ WORLD GD: garden bed (s06, s07) */
const GD = new THREE.Group(); scene.add(GD);
const BAMB = [];
{
  part(GD, new THREE.BoxGeometry(14000, 60, 12000), M('#9ccd6c', '#c8d6c0', 0), 0, [0, -30, 0]);
  const bedM = M('#7a4a2a', '#5a3a36', 0);
  box(GD, 560, 26, 320, bedM, [0, 13, 0], 0, null, 8);
  for (const [w, d, x, z] of [[600, 22, 0, -170], [600, 22, 0, 170], [22, 320, -290, 0], [22, 320, 290, 0]]) box(GD, w, 34, d, WOOD2(), [x, 17, z], 2.4, null, 3);
  // plain wooden marker stick
  const stick = box(GD, 8, 84, 8, WOODD(), [120, 62, 60], 1.8, [0, 0.3, 0.08], 2);
  // low stone wall + hedge + trees behind
  for (let i = -6; i <= 6; i++) box(GD, 230, 120 + (i % 2) * 14, 70, i % 2 ? STONE() : STONE2(), [i * 235, 60, -820], 2.6, null, 8);
  for (let i = -8; i <= 8; i++) part(GD, ell(150, 100, 100, 14, 9), M(i % 2 ? '#6fba54' : '#5fae4e', '#c4cfc0'), 3, [i * 190, 150, -920]);
  for (const [x, z, s] of [[-900, -600, 1.6], [1000, -650, 1.8], [-1500, 300, 1.4], [1500, 200, 1.5]]) tree(GD, x, z, s, 0, '#58a84a');
  for (let i = 0; i < 7; i++) part(GD, ell(54, 6, 40, 12, 6), STONE(), 1.8, [-440 - i * 90, 3, 0 + (i % 2) * 24 - 12]);
  // bamboo shoots (pure function of t)
  const bm = M('#7bc858', '#5a9a50'), bm2 = M('#a8e07a', '#7ab070'), nodeM = M('#4f9a3f', '#3a7040', 0);
  const specs = [[-60, -30, 0.95, 0.06], [20, 44, 1.0, -0.05], [76, -14, 0.82, 0.08], [-14, -66, 0.9, -0.07], [118, 56, 0.72, 0.05], [-104, 30, 0.78, -0.04], [34, -4, 1.12, 0.03]];
  specs.forEach(([x, z, hs, bend], si) => {
    const g = new THREE.Group(); g.position.set(x, 26, z); GD.add(g);
    const N = 13, segs = [];
    for (let k = 0; k < N; k++) {
      const c = part(g, new THREE.CylinderGeometry(8.5 - k * 0.32, 9.5 - k * 0.32, 1, 10).translate(0, 0.5, 0), k % 2 ? bm : bm2, 1.4);
      const r = part(g, new THREE.TorusGeometry(9 - k * 0.32, 2.2, 5, 12).rotateX(Math.PI / 2), nodeM, 0);
      segs.push({ c, r });
    }
    const leaves = []; for (let k = 6; k < N; k++) for (const s of [-1, 1]) { const l = part(g, ell(34, 3.6, 9, 10, 5), M('#5fb84a', '#4a8a40'), 1, null); leaves.push({ l, k, s }); }
    BAMB.push({ g, segs, leaves, hs, bend, d: si * 0.35 });
  });
}

/* ------------------------------------------------------------------ WORLD SL: cut-away slice of the ground (s08) */
const SL = new THREE.Group(); scene.add(SL);
const SLB = new THREE.Group(); SL.add(SLB);
const SW = 2600, SD = 300, SZ = SD / 2;
const ROOTS = new THREE.Group(); SLB.add(ROOTS);
const ROOTSEG = []; let ROOTTOTAL = 0;
{
  const layers = [[0, -26, '#8cc068', '#c4d6b8'], [-26, -230, '#7a4a2a', '#5a3a36'], [-230, -480, '#a8703f', '#8a6050'], [-480, -800, '#c9a068', '#a8886a']];
  for (const [y0, y1, c, t] of layers) box(SLB, SW, y0 - y1, SD, M(c, t, 0), [0, (y0 + y1) / 2, 0], 3, null, 2);
  const rnd = mulb(23);
  for (let i = 0; i < 12; i++) { const y = -60 - rnd() * 700, x = (rnd() - 0.5) * 900; part(SLB, ell(16 + rnd() * 22, 11 + rnd() * 14, 8, 8, 6), M(y < -450 ? '#9aa0a8' : '#b5aa98', '#8a8a96'), 1.8, [x, y, SZ + 1]); }
  box(SLB, 8, 84, 8, WOODD(), [120, 42, 40], 1.8, [0, 0.3, 0.08], 2);                        // marker stick on the bare top
  for (const x of [-900, -620, -380, -300, 320, 400, 700, 980]) part(SLB, ell(30, 18, 20, 10, 6), M('#6fba54', '#4a8a40'), 2, [x, 4, 20]);
  const gm = new THREE.MeshBasicMaterial({ color: '#ffcf2e' }), gm2 = new THREE.MeshBasicMaterial({ color: '#fff0a0' });
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 6).translate(0, 0.5, 0);
  function addRoot(p0, ang, len, r, depth, off) {
    const p1 = [p0[0] + Math.sin(ang) * len, p0[1] - Math.cos(ang) * len];
    const m = new THREE.Mesh(cyl, depth === 0 ? gm2 : gm); m.position.set(p0[0], p0[1], SZ + 3); m.rotation.z = ang - Math.PI; m.scale.set(r, 0.001, r); ROOTS.add(m);
    ROOTSEG.push({ m, len, off, r }); const o2 = off + len;
    ROOTTOTAL = Math.max(ROOTTOTAL, o2);
    if (depth < 3) {
      const kids = depth === 0 ? [-0.55, 0.0, 0.6] : [-0.7, 0.55];
      kids.forEach((da, ki) => addRoot(p1, ang + da * (0.7 + 0.3 * rnd()) * (depth === 0 ? 1 : 0.8), len * (depth === 0 ? 0.95 : 0.78), r * 0.74, depth + 1, o2 + ki * 14));
    }
  }
  // main root straight down in a few kinks, side roots branching off
  let p = [0, -26], off = 0;
  for (let k = 0; k < 6; k++) { const a = (k % 2 ? 1 : -1) * 0.1; const len = 130; addRoot(p, a, len, 7.5, 0, off); p = [p[0] + Math.sin(a) * len, p[1] - Math.cos(a) * len]; off += len; }
  for (let k = 1; k <= 4; k++) for (const s of [-1, 1]) addRoot([s * 4, -26 - k * 120], s * (1.15 + 0.1 * k * 0.3), 150, 5, 1, k * 120 + (s > 0 ? 8 : 0));
}
const rootTipGl = glow(ROOTS, '#fff0a0', 150, [0, -26, SZ + 6], 0.9);
const rootGlowAll = glow(ROOTS, '#ffcf3a', 900, [0, -330, SZ + 12], 0.0);

/* ------------------------------------------------------------------ WORLD HL: warm study hall */
const HL = new THREE.Group(); scene.add(HL);
const HALL_SET = PR.makeHall(); HL.add(HALL_SET);
// open a door in the +x wall (z 970..1190, height 390) with a clock above it
HALL_SET.children.forEach(c => { if (Math.abs(c.position.x - 1500) < 1 && Math.abs(c.position.y - 750) < 1) c.visible = false; });
{
  const wm = M('#d6ad74', '#b79583');
  box(HL, 40, 1500, 1270, wm, [1500, 750, 335], 0, null, 0);          // z -300..970
  box(HL, 40, 1500, 1010, wm, [1500, 750, 1695], 0, null, 0);         // z 1190..2200
  box(HL, 40, 1110, 220, wm, [1500, 945, 1080], 0, null, 0);          // above the door
  for (const [w, h, d, y, z] of [[24, 16, 244, 396, 1080], [24, 396, 16, 198, 972], [24, 396, 16, 198, 1188]]) box(HL, w, h, d, WOODD(), [1494, y, z], 2.2, null, 2);
  const out = mkMesh(new THREE.PlaneGeometry(260, 400), bas('#fff6d0'), HL, [1560, 200, 1080]); out.rotation.y = -Math.PI / 2;
  mkMesh(new THREE.PlaneGeometry(900, 900), bas('#d6f0c0'), HL, [1580, 0.5, 1080]).rotation.x = -Math.PI / 2;
  // wall clock: plain round dial, two hands, no numbers
  const CK = new THREE.Group(); CK.position.set(1476, 640, 1080); CK.rotation.y = -Math.PI / 2; HL.add(CK);
  part(CK, new THREE.CylinderGeometry(70, 70, 14, 28).rotateX(Math.PI / 2), M('#8f5d33', '#7a5a60'), 2.4);
  part(CK, new THREE.CylinderGeometry(60, 60, 8, 28).rotateX(Math.PI / 2), M('#fff6e0', '#ddd0c0', 0), 0, [0, 0, 5]);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; mkMesh(SPH, bas('#4a3a2a'), CK, [Math.sin(a) * 50, Math.cos(a) * 50, 10]).scale.setScalar(i % 3 ? 2.6 : 4); }
  const hh = new THREE.Group(), mh = new THREE.Group(); hh.position.z = mh.position.z = 11; CK.add(hh); CK.add(mh);
  box(hh, 6, 34, 4, M('#2a1e18'), [0, 17, 0], 0, null, 1); box(mh, 4, 50, 4, M('#2a1e18'), [0, 25, 0], 0, null, 1);
  HL.userData.hh = hh; HL.userData.mh = mh;
}
// row of shtenders (readers stand at +x of each and face -x)
const SHT = [];
for (let i = 0; i < 5; i++) {
  const s = PR.makeShtender(); s.rotation.y = Math.PI; s.position.set(200, 0, [1080, 820, 1340, 560, 1600][i]); HL.add(s);
  const bk = PR.makeBook(true); bk.position.set(2, 8.5, 0); bk.scale.setScalar(0.8); bk.rotation.y = Math.PI; s.userData.top.add(bk); SHT.push({ s, bk });
}
const bookGlow = glow(SHT[0].s.userData.top, '#ffe9a0', 200, [0, 24, 0], 0);
// study table with benches (table runs along z, x = -650)
const T1 = new THREE.Group(); T1.position.set(-300, 0, 1300); HL.add(T1);
{
  const t = PR.makeTable(760, 150, 118); t.rotation.y = Math.PI / 2; T1.add(t);
  for (const sx of [-1, 1]) { const b = PR.makeBench(720, 70); b.rotation.y = Math.PI / 2; b.position.set(sx * 150, 0, 0); T1.add(b); }
  const s1 = PR.makeSefer('#6b3f2a', 84, 60, 12), s2 = PR.makeSefer('#2b4d8c', 78, 56, 10), s3 = PR.makeSefer('#8c2b2b', 80, 54, 11);
  s1.position.set(0, 118, 200); s2.position.set(18, 130, 200); s2.rotation.y = 0.2; s3.position.set(30, 118, 280); T1.add(s1, s2, s3);
}
const TBOOK = PR.makeBook(true); TBOOK.position.set(-300 + 5, 118 + 2, 1080); TBOOK.rotation.y = Math.PI; HL.add(TBOOK);
// window sill with a row of clay pots
const SILL = new THREE.Group(); HL.add(SILL);
box(SILL, 1180, 14, 120, WOODD(), [0, 178, 70], 2.4, null, 3);
const SPOT = [];
for (let i = 0; i < 7; i++) { const p = makePot(); p.position.set(-450 + i * 150, 185, 70); SILL.add(p); SPOT.push(p); }
// time-lapse light: sun glow seen through the window + a light patch on the floor
const sunWin = glow(HL, '#fff0b0', 700, [0, 500, -500], 0.9);
const floorPatch = mkMesh(new THREE.PlaneGeometry(560, 900).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffe8a0', transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }), HL, [0, 4, 700]);
floorPatch.renderOrder = 6;
const shaft = mkMesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: '#fff0b8', transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), HL);
shaft.frustumCulled = false; shaft.renderOrder = 7;
const beam = mkMesh(new THREE.CylinderGeometry(70, 230, 1300, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0b0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), HL);
beam.renderOrder = 8;
// golden motes (seeds of light)
const MOTES = [];
for (let i = 0; i < 18; i++) MOTES.push(glow(HL, '#ffd860', 46, [0, -999, 0], 0));
// clay pots for the long table of the last hall scene
const TP = []; for (let i = 0; i < 6; i++) { const p = makePot(); HL.add(p); p.visible = false; TP.push(p); }
const TLONG = PR.makeTable(1900, 150, 118); TLONG.position.set(0, 0, 1350); HL.add(TLONG);
// held props
const POTH = makePot(); ACT.BO.o.hand(-1).add(POTH); POTH.position.set(0, -34, 14); POTH.scale.setScalar(0.55); POTH.rotation.z = Math.PI; POTH.visible = false;
const CAN = makeCan(); ACT.BO.o.hand(1).add(CAN.g); CAN.g.position.set(0, -26, 10); CAN.g.scale.setScalar(0.62); CAN.g.rotation.set(0, 0, Math.PI / 2); CAN.g.visible = false;
const POTT = makePot(); POTT.position.set(-290, 118, 1170); POTT.scale.setScalar(0.8); POTT.visible = false; HL.add(POTT);
const dropsC = []; for (let i = 0; i < 10; i++) { const m = mkMesh(SPH, new THREE.MeshBasicMaterial({ color: '#bfe8ff' }), scene); m.scale.setScalar(3.6); m.visible = false; dropsC.push(m); }
const BAGM = new THREE.Group(); part(BAGM, ell(30, 25, 14, 14, 10), M('#c9a56a', '#8a6a46'), 2.2, [0, -20, 0]); part(BAGM, new THREE.TorusGeometry(10, 1.8, 6, 14, Math.PI), M('#3b2c22'), 0, [0, -2, 0]);
ACT.M.o.hand(-1).add(BAGM); BAGM.position.set(2, -14, 8); BAGM.visible = false;
const siddur = PR.makeSefer('#2b4d8c', 70, 50, 12); ACT.OB.o.hand(-1).add(siddur); siddur.position.set(0, -26, 12); siddur.rotation.set(0, 0, Math.PI / 2); siddur.visible = false;
const bookGlow2 = glow(HL, '#ffe9a0', 260, [200, 190, 1080], 0);

function hermite(keys) {
  const n = keys.length, T = keys.map(k => k[0]);
  return t => {
    t = cl(t, T[0], T[n - 1]); let i = 0; while (i < n - 2 && t > T[i + 1]) i++;
    const a = keys[i], b = keys[i + 1], dt = b[0] - a[0], u = (t - a[0]) / dt;
    const prev = keys[Math.max(0, i - 1)], next = keys[Math.min(n - 1, i + 2)];
    const out = { p: [0, 0, 0], l: [0, 0, 0], fov: 30, roll: 0 };
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    const ch = (A, B, P, N, tin0, tout0) => {
      const m0 = i === 0 ? 0 : (B - P) / (b[0] - prev[0]) * dt * 1, m1 = i + 1 === n - 1 ? 0 : (N - A) / (next[0] - a[0]) * dt * 1;
      return h00 * A + h10 * m0 + h01 * B + h11 * m1;
    };
    for (let k = 0; k < 3; k++) { out.p[k] = ch(a[1][k], b[1][k], prev[1][k], next[1][k]); out.l[k] = ch(a[2][k], b[2][k], prev[2][k], next[2][k]); }
    out.fov = ch(a[3] || 30, b[3] || 30, prev[3] || 30, next[3] || 30);
    return out;
  };
}

/* ------------------------------------------------------------------ acting helpers */
const SEG = {};
const seg = (id, t0, t1, fn) => { (SEG[id] = SEG[id] || []).push([t0, t1, fn]); };
const mkpo = (t, o) => Object.assign({ t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 }, o || {});
const fa = (expr, t, seed, o) => faceOf(expr, t, seed, o);
const sgn = v => v < 0 ? -1 : 1;
const KFV = (t, keys) => { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = sm((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i].slice(1).map((v, k) => lerp(keys[i - 1][k + 1], v, u)); } return keys[keys.length - 1].slice(1); };
const PI = Math.PI;
const SIT = 48;
function addPropAt(id, group, t0, t1) { ACT[id] = { h: group, fn: t => (t >= t0 && t < t1 ? { x: 0, y: 0, z: 0 } : null), prop: true }; }
addPropAt('ROOTS', ROOTS, 115, 131.5);
addPropAt('POTBOX', TLONG, 212.6, 228.4);

/* ------------------------------------------------------------------ the farmer (s01, s02, s09, s10, s15) */
const FZ = -125;                                      // furrow line
const RM = mkRoute(chain(2.5, 85, [[-1300, FZ, 0, { yaw: 0 }], [100, FZ, 0], [200, -450, 0, { wait: 3.0, yaw: PI / 2 }], [1400, -450, 0]]));
seg('M', 0, 35, t => {
  const r = RM.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.M.cycle) });
  const st = { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po, r };
  po.arms = { l: { sz: 0.3, el: 1.15, curl: 0.8 } };
  if (t > 3.2 && t < 19.4) {                         // scattering seeds: the right arm swings out and forward every 0.45 s
    const p = ((t - 3.2) / 0.45) % 1, th = Math.sin(PI * Math.min(1, p * 1.5));
    po.arms.r = { sz: 0.25 + 1.2 * th, sx: 0.2 + 0.5 * th, el: 0.45, curl: 0.15 };
    po.lean = 3;
  } else if (t >= 22.6 && t < 26.4) {                // turns the valve
    const k = rise(t, 22.7, 23.4) * (1 - rise(t, 25.6, 26.4));
    po.arms.r = { sz: 1.5 * k + 0.1, sx: 0.1, el: 0.6, curl: 0.9 }; po.arms.l = { sz: 1.3 * k + 0.2, sx: 0.1, el: 0.6, curl: 0.9 };
    po.lean = 8 * k; po.headTilt = 8 * k;
  }
  po.face = fa(t > 22.5 && t < 26 ? 'proud' : 'smile', t, 61, { look: [0.4, 0.1] });
  return st;
});
seg('M', 131.5, 166.8, t => {
  const po = mkpo(t), a = rise(t, 132.5, 134.0) * (1 - rise(t, 146.5, 148.5)), b = rise(t, 150.0, 152.5);
  po.arms = { l: { sz: lerp(0.06, 0.2, a), el: 0.5, sx: 0.1 }, r: { sz: lerp(0.06, 2.3, a), el: lerp(0.36, 2.0, a), sx: 0.35 * a, curl: 0.8 } };
  if (b > 0) { po.arms = { l: { sz: lerp(0.5, 1.15, b), sx: lerp(0.1, 1.0, b), el: lerp(0.5, 0.3, b), tw: 0.9 * b, curl: 0.2 }, r: { sz: lerp(2.3, 1.15, b), sx: lerp(0.35, 1.0, b), el: lerp(2.0, 0.3, b), tw: 0.9 * b, curl: 0.2 } }; }
  po.headRot = -30 * Math.max(a, b) * 0.9; po.lean = -2 * b;
  po.face = fa(t < 134 ? 'smile' : (t < 146 ? 'thinking' : (t < 150 ? 'surprised' : 'laugh')), t, 62, { look: [0, -0.8] });
  return { x: -300, y: 0, z: 760, yaw: -PI / 2, slope: 0, po };
});
const RW = mkRoute(chain(228.4, 70, [[-700, FZ - 25, 0, { yaw: 0 }], [900, FZ - 25, 0]]));
seg('M', 228.4, 246.6, t => {
  const r = RW.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.M.cycle) });
  po.arms = { l: { sz: 0.1 }, r: { sz: 0.1 } };
  po.face = fa('smile', t, 63, { look: [0.4, 0] });
  return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po, r };
});

/* ------------------------------------------------------------------ the hero bochur BO */
const ROWZ = [1080, 820, 1340, 560, 1600];
function reading(t, z, seed, face) {
  const po = mkpo(t), k = Math.sin(t * 0.9 + seed);
  po.arms = { l: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 }, r: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 } };
  po.headTilt = 12 + 3 * k; po.lean = 4 + 1.3 * Math.sin(t * 1.3 + seed); po.headYaw = 0.1 * Math.sin(t * 0.5 + seed);
  po.face = face || fa('smile', t, seed, { look: [0, 0.4] });
  return { x: 312, y: 0, z, yaw: PI, slope: 0, po };
}
seg('BO', 35, 52, t => {
  const st = reading(t, ROWZ[0], 91, fa(t < 39.6 ? 'smile' : 'proud', t, 91, { look: [0.1, 0.5] }));
  const up = pulse(t, 38.2, 39.5, 40.5, 41.8); st.po.headRot = -14 * up; st.po.lean += 3 * up; return st;
});
const RDOOR = mkRoute(chain(52.4, 190, [[1640, 1080, 0, { yaw: PI }], [650, 1080, 0]]));
seg('BO', 52, 58.5, t => {
  const r = RDOOR.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.BO.cycle) });
  po.arms = { l: { sz: 1.15, el: 1.7, sx: 0.0, curl: 0.9 }, r: { sz: 0.1 } };
  po.lean = 5 * r.walk; const tired = rise(t, 57.0, 57.6);
  po.face = fa(tired > 0.5 ? 'smile' : 'worried', t, 92, { look: [0.2, 0.1] }); if (tired > 0.5) po.headRot = -3;
  return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po, r };
});
seg('BO', 58.5, 64.5, t => {
  const po = mkpo(t), u = Math.sin(t * 1.1);
  po.bob = SIT; po.lean = 12 + 2 * u; po.headTilt = 16 + 2 * u;
  po.arms = { l: { sz: 1.05, el: 0.9, curl: 0.7 }, r: { sz: lerp(1.0, 1.35, rise(t, 60, 61)) , el: 0.9, curl: 0.6 } };
  po.face = fa('thinking', t, 93, { look: [0.1, 0.7] });
  return { x: -150, y: 0, z: 1080, yaw: PI, slope: 0, po };
});
seg('BO', 64.5, 70, t => {
  const po = mkpo(t), sw = Math.sin((t - 64.5) * 2.3);
  po.arms = { l: { sz: 0.7, el: 1.5, sx: 0.0, curl: 0.9 }, r: { sz: 0.7, el: 1.5, sx: 0.0, curl: 0.9 } };
  po.lean = 6 * sw + 3; po.headTilt = 8; po.face = fa('smile', t, 94, { blink: true });
  return { x: -90, y: 0, z: 260, yaw: -2.4, slope: 0, po };
});
seg('BO', 70, 85.8, t => {
  const po = mkpo(t), pour = pulse(t, 71.0, 72.2, 82.0, 83.2), turn = sm((t - 82.3) / 1.8);
  const bend = rise(t, 79.5, 81.0);
  po.arms = { r: { sz: lerp(0.3, 1.9, pour), sx: 0.1, el: lerp(0.5, 0.45, pour), tw: 0.5, curl: 0.9 }, l: { sz: lerp(0.1, 0.5, pour), sx: 0.4, el: 0.7, curl: 0.5 } };
  po.lean = 8 * pour; po.headTilt = 14 * pour * (1 - turn);
  po.face = fa(t < 82.5 ? 'smile' : 'proud', t, 95, { look: [0, 0.5 * (1 - turn)] });
  if (turn > 0.3) po.arms = { r: { sz: lerp(1.9, 0.2, turn), el: 0.5 }, l: { sz: 0.4, sx: lerp(0.4, 0.2, turn), el: 0.7 } };
  return { x: -150, y: 0, z: 185, yaw: lerp(PI / 2, -PI / 2, turn), slope: 0, po };
});
seg('BO', 85.8, 100, t => {
  const po = mkpo(t), ph = ((t - 85.8) / 2.3) % 1, pour = Math.sin(PI * Math.min(1, ph * 1.7));
  po.bob = 62; po.lean = 22 + 4 * pour; po.headTilt = 18;
  po.arms = { r: { sz: 1.15 + 0.5 * pour, sx: 0.15, el: 0.6, tw: 0.6 * pour, curl: 0.9 }, l: { sz: 0.9, sx: 0.5, el: 0.8, curl: 0.5 } };
  const puzzled = rise(t, 93, 95);
  po.headYaw = 0.25 * Math.sin(t * 1.6) * puzzled; po.headRot = 6 * puzzled * Math.sin(t * 1.6);
  po.face = fa(puzzled > 0.4 ? 'worried' : 'thinking', t, 96, { look: [0.6, 0.6] });
  return { x: -390, y: 0, z: 0, yaw: 0, slope: 0, po };
});
seg('BO', 100, 115, t => {
  const po = mkpo(t), up = rise(t, 101.0, 103.0), fall = pulse(t, 103.4, 104.4, 106.0, 107.0), k = rise(t, 103.6, 106.4);
  po.bob = 62 * (1 - up); po.lean = lerp(22, -10, up) - 14 * fall; po.headRot = -34 * rise(t, 104.2, 105.4) * (1 - rise(t, 113, 114.6));
  po.arms = { r: { sz: lerp(1.15, 2.0, k), sx: lerp(0.15, 0.7, k), el: lerp(0.6, 0.6, k), curl: 0.3 }, l: { sz: lerp(0.9, 1.9, k), sx: lerp(0.5, 0.7, k), el: 0.6, curl: 0.3 } };
  if (t > 106.8) { const s = 0.3 * Math.sin(t * 2); po.arms.r.sz += s; po.arms.l.sz -= s; }
  po.face = fa(t < 103.4 ? 'worried' : 'surprised', t, 97, { look: [0.3, -0.9] });
  const back = sm((t - 103.4) / 3.4);
  return { x: lerp(-390, -480, back), y: 0, z: lerp(0, 60, back), yaw: lerp(0, 0.35, back), slope: 0, po };
});
const TX = i => -750 + i * 300;
seg('BO', 212.6, 228.4, t => {
  const po = mkpo(t), k = Math.sin(t * 1.0);
  po.arms = { l: { sz: 1.15, el: 0.7, sx: 0.1, curl: 0.5 }, r: { sz: 1.15, el: 0.7, sx: 0.1, curl: 0.5 } };
  po.headTilt = 10 + 4 * k; po.lean = 4; po.face = fa('smile', t, 98, { look: [0, 0.6] });
  return { x: TX(2), y: 0, z: 1540, yaw: PI / 2, slope: 0, po };
});
const RB2 = mkRoute(chain(228.4, 70, [[-700, FZ + 25, 0, { yaw: 0 }], [900, FZ + 25, 0]]));
seg('BO', 228.4, 246.6, t => {
  const r = RB2.at(t), po = mkpo(t, { walk: r.walk, ph: PH(r, ACT.BO.cycle) });
  po.arms = { l: { sz: 0.1 }, r: { sz: 0.1 } }; po.face = fa('smile', t, 99, { look: [0.4, 0] });
  return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po, r };
});

/* ------------------------------------------------------------------ the row of bochurim */
[1, 2, 3, 4].forEach(i => seg('C' + i, 35, 52, t => reading(t, ROWZ[i], 100 + i, fa(t < 40 + i * 0.6 ? 'smile' : 'proud', t, 100 + i, { look: [0, 0.4] }))));
const CPERM = [0, 1, 3, 4, 5];       // table slots for C1..C5
[1, 2, 3, 4, 5].forEach(i => seg('C' + i, 212.6, 228.4, t => {
  const po = mkpo(t), k = Math.sin(t * 0.8 + i);
  po.arms = { l: { sz: 1.1, el: 0.8, sx: 0.1, curl: 0.5 }, r: { sz: 1.1 + 0.2 * Math.max(0, k), el: 0.8, sx: 0.1, curl: 0.5 } };
  po.headTilt = 9 + 3 * k; po.lean = 3; po.face = fa(i === 4 ? 'worried' : 'smile', t, 110 + i, { look: [0, 0.5] });
  return { x: TX(CPERM[i - 1]), y: 0, z: 1540, yaw: PI / 2, slope: 0, po };
}));

/* ------------------------------------------------------------------ rabbi and the older bochur */
seg('RA', 166.8, 182, t => {
  const po = mkpo(t), a = pulse(t, 168, 169, 172, 173) + pulse(t, 175, 176, 178, 179);
  po.bob = SIT; po.lean = 4; po.headTilt = 4;
  po.arms = { l: { sz: lerp(1.0, 1.35, a), sx: lerp(0.1, 0.9, a), el: lerp(0.9, 0.7, a), tw: 1.0 * a, curl: 0.2 }, r: { sz: lerp(1.0, 1.35, a), sx: lerp(0.1, 0.9, a), el: lerp(0.9, 0.7, a), tw: 1.0 * a, curl: 0.2 } };
  po.face = fa(a > 0.3 ? 'explaining' : 'smile', t, 120, { look: [0.4, 0.1] });
  return { x: -150, y: 0, z: 1190, yaw: PI, slope: 0, po };
});
seg('OB', 166.8, 182, t => {
  const po = mkpo(t), shy = rise(t, 175.0, 177.0);
  po.bob = SIT; po.lean = 6; po.headTilt = lerp(10, 18, shy); po.headYaw = 0.25 * (1 - shy);
  po.arms = { l: { sz: 1.0, el: 0.9, curl: 0.6 }, r: { sz: 1.0, el: 0.9, curl: 0.6 } };
  po.face = fa(shy > 0.5 ? 'smile' : 'thinking', t, 121, { look: [-0.4, 0.4] });
  return { x: -150, y: 0, z: 1400, yaw: PI, slope: 0, po };
});
seg('OB', 182, 199, t => {
  const po = mkpo(t), sw = Math.sin((t - 182) * 1.7);
  po.arms = { l: { sz: 0.85, el: 1.1, curl: 0.8 }, r: { sz: 0.85, el: 1.1, curl: 0.8 } };
  po.lean = 3 + 4 * sw; po.headTilt = 10; po.face = fa('smile', t, 122, { blink: true });
  return { x: 312, y: 0, z: 1080, yaw: PI, slope: 0, po };
});
seg('OB', 199, 212.6, t => {
  const po = mkpo(t), look = rise(t, 202.4, 204.4), nod = Math.sin((t - 207) * 3.4) * rise(t, 206.4, 207.4) * (1 - rise(t, 211, 212.4));
  po.arms = { l: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 }, r: { sz: 0.95, el: 0.9, sx: 0.12, curl: 0.7 } };
  po.lean = 4 + 4 * look; po.headTilt = lerp(8, 16, look) + 6 * nod; po.headRot = -10 * rise(t, 199.4, 201.2) * (1 - look);
  po.face = fa(t < 203.8 ? 'thinking' : (t < 206 ? 'surprised' : 'laugh'), t, 123, { look: [0, 0.5] });
  return { x: 312, y: 0, z: 1080, yaw: PI, slope: 0, po };
});

// dispatcher
for (const id in ACT) { const L = SEG[id]; if (!L) continue; const A = ACT[id]; A.fn = t => { for (const s of L) if (t >= s[0] && t < s[1]) return s[2](t); return null; }; }

/* ------------------------------------------------------------------ shots and cameras */
const mfx = t => { let x = 0, n = 0; for (const d of [-0.8, 0, 0.8]) { const f = ACT.M.fn(cl(t + d, 0, 34.9)); if (f) { x += f.x; n++; } } return n ? x / n : 200; };
const camS02 = t => { const cx = mfx(t); return { p: [cx - 650, 120, 420], l: [cx + 20, 150, -460], fov: 30 }; };
const camS01 = hermite([[0, [-900, 1700, 5200], [400, 300, -2200], 36], [8, [-1100, 700, 2600], [-760, 120, -200], 34], [18, [-250, 260, 1500], [40, 150, -125], 30]]);
const camS03 = hermite([[35, [-1250, 300, 1580], [312, 140, 900], 30], [52, [-760, 270, 1290], [312, 150, 1080], 30]]);
const camS04a = hermite([[52, [-600, 250, 1160], [1000, 170, 1080], 30], [58.5, [-480, 240, 1110], [650, 150, 1080], 30]]);
const camS04b = hermite([[58.5, [-1330, 260, 1340], [-160, 110, 1085], 30], [64.5, [-1230, 250, 1270], [-160, 110, 1085], 30]]);
const camS04c = hermite([[64.5, [-1080, 300, 1250], [-90, 170, 260], 30], [70, [-960, 290, 1150], [-90, 170, 260], 30]]);
const camS04 = t => t < 58.5 ? camS04a(t) : (t < 64.5 ? camS04b(t) : camS04c(t));
const camS05 = t => { const u = sm((t - 70) / 15.8), a = lerp(1.15, 0.05, u); const T = [-150, 165, 120]; return { p: [T[0] + 1300 * Math.sin(a), 300, T[2] + 1300 * Math.cos(a)], l: T, fov: 30 }; };
const camS06 = hermite([[85.8, [900, 260, 700], [-230, 120, 0], 30], [100, [760, 220, 520], [-250, 115, 0], 30]]);
const camS07 = hermite([[100, [900, 200, 760], [-200, 140, 40], 32], [106, [880, 420, 880], [-220, 260, 40], 32], [110.5, [620, 560, 1250], [-100, 450, 40], 36], [115, [660, 650, 1500], [-120, 430, 60], 42]]);
const camS08 = hermite([[115, [250, 40, 1700], [0, -150, 0], 30], [123, [150, -200, 1900], [0, -250, 0], 30], [131.5, [0, -470, 1900], [0, -480, 0], 30]]);
const camS09 = hermite([[131.5, [-150, 270, 1500], [-250, 215, 800], 30], [140, [-120, 420, 2900], [-260, 250, 500], 32], [149, [100, 700, 4200], [-100, 420, -1500], 36]]);
const camS10 = hermite([[149, [-250, 290, 1420], [-300, 215, 760], 30], [158, [150, 720, 2350], [-100, 200, 300], 34], [166.8, [700, 1500, 3500], [0, 150, 0], 40]]);
const camS11 = hermite([[166.8, [-1330, 290, 1340], [-150, 125, 1295], 30], [182, [-1180, 265, 1300], [-150, 125, 1295], 30]]);
const camS12 = hermite([[182, [-1100, 300, 1400], [312, 180, 1080], 30], [199, [-960, 285, 1290], [312, 170, 1080], 29]]);
const camS13 = t => { const u = sm((t - 199) / 13.6), th = lerp(0, 0.6, u), R = lerp(1350, 1180, u); return { p: [312 - R * Math.cos(th), 300, 1080 + R * Math.sin(th)], l: [312, 170, 1080], fov: 30 }; };
const camS14 = t => { const u = sm((t - 212.6) / 15.8), cx = lerp(-620, 620, u); return { p: [cx, 300, 250], l: [cx + 60, 175, 1540], fov: 32 }; };
const camS15 = hermite([[228.4, [1000, 250, FZ], [100, 170, FZ], 30], [242.5, [3200, 1300, FZ], [0, 150, FZ], 40], [246.5, [3260, 1330, FZ], [0, 150, FZ], 40]]);

const SHOTS = [
  { id: 's01', start: 0, end: 18, wide: true, loc: 'FM', hero: ['M'], cam: camS01 },
  { id: 's02', start: 18, end: 35, wide: true, loc: 'FM', hero: ['M'], cam: camS02 },
  { id: 's03', start: 35, end: 52, loc: 'HL', hero: ['BO'], cam: camS03 },
  { id: 's04', start: 52, end: 70, loc: 'HL', hero: ['BO'], cam: camS04 },
  { id: 's05', start: 70, end: 85.8, loc: 'HL', hero: ['BO'], cam: camS05 },
  { id: 's06', start: 85.8, end: 100, wide: true, loc: 'GD', hero: ['BO'], cam: camS06 },
  { id: 's07', start: 100, end: 115, wide: true, loc: 'GD', hero: ['BO'], cam: camS07 },
  { id: 's08', start: 115, end: 131.5, wide: true, loc: 'SL', hero: ['ROOTS'], cam: camS08 },
  { id: 's09', start: 131.5, end: 149, wide: true, loc: 'FM', hero: ['M'], cam: camS09 },
  { id: 's10', start: 149, end: 166.8, wide: true, loc: 'FM', hero: ['M'], cam: camS10 },
  { id: 's11', start: 166.8, end: 182, loc: 'HL', hero: ['RA', 'OB'], cam: camS11 },
  { id: 's12', start: 182, end: 199, loc: 'HL', hero: ['OB'], cam: camS12 },
  { id: 's13', start: 199, end: 212.6, loc: 'HL', hero: ['OB'], cam: camS13 },
  { id: 's14', start: 212.6, end: 228.4, wide: true, loc: 'HL', hero: ['BO', 'C1', 'C2', 'C3', 'C4', 'C5'], cam: camS14 },
  { id: 's15', start: 228.4, end: 246.5, wide: true, loc: 'FM', hero: ['M', 'BO'], cam: camS15 },
];
SHOTS.forEach((s, i) => { s.index = i; s.dur = s.end - s.start; s.t0 = s.start; });
const shotAt = t => SHOTS.find(s => t < s.end) || SHOTS[SHOTS.length - 1];
const SEAMS = [[35, '#e4f6ff'], [58.5, '#fff6dd'], [64.5, '#fff6dd'], [85.8, '#fff6dd'], [115, '#fff6dd'], [131.5, '#ffd98a'], [166.8, '#fff6dd'], [188.4, '#fff6dd'], [194, '#fff6dd'], [212.6, '#ffffff'], [228.4, '#fff1c8']];

/* ------------------------------------------------------------------ environment per frame */
const cc = h => new THREE.Color(h);
function skyFor(t, loc) {
  if (loc === 'FM') {
    if (t < 18) return { top: cc('#86b8ee'), bot: cc('#ffd8a0'), oc: cc('#ff9a50'), oa: 0.07 };
    if (t < 60) return { top: cc('#7cc0f0'), bot: cc('#fff0d0'), oc: cc('#ffb060'), oa: 0.04 };
    if (t < 149) { const e = rise(t, 131.5, 146); return { top: cc('#7cc0f0').lerp(cc('#8d9db6'), e), bot: cc('#fff0d0').lerp(cc('#d6dbe2'), e), oc: cc('#b0b8c8'), oa: 0.05 * e }; }
    if (t < 228) { const e = rise(t, 149, 154); return { top: cc('#8d9db6').lerp(cc('#86c0f0'), e), bot: cc('#d6dbe2').lerp(cc('#ffe2a8'), e), oc: cc('#ffc060'), oa: 0.08 * e }; }
    return { top: cc('#86bcee'), bot: cc('#ffd890'), oc: cc('#ffa040'), oa: 0.1 };
  }
  if (loc === 'GD') {
    if (t < 100) { const ph = (t - 85.8) / 14.2 * 3, day = 0.5 + 0.5 * Math.cos(2 * PI * ph); return { top: cc('#1a2a5a').lerp(cc('#79c0ea'), day), bot: cc('#6a5a8a').lerp(cc('#fdf3dc'), day), oc: cc('#10183c'), oa: 0.26 * (1 - day) }; }
    return { top: cc('#6ec2f4'), bot: cc('#fffbe6'), oc: cc('#ffb060'), oa: 0.03 };
  }
  if (loc === 'SL') return { top: cc('#8fd0f6'), bot: cc('#fff6dc'), oc: cc('#ffb060'), oa: 0.03 };
  // hall: sky behind the window
  if (t >= 70 && t < 85.8) { const u = (t - 70) / 15.8, m = 1 - Math.abs(2 * u - 1); return { top: cc('#a8c8e8').lerp(cc('#79c0ea'), m), bot: cc('#ffd0a0').lerp(cc('#fff3d8'), m), oc: cc('#ff9a50'), oa: 0.14 * (1 - m) + 0.02 }; }
  if (t >= 182 && t < 199) return { top: cc('#a9cdea'), bot: cc('#ffe6c0'), oc: cc('#ffb878'), oa: 0.08 };
  return { top: cc('#8fc4e8'), bot: cc('#fff0d0'), oc: cc('#ffa850'), oa: 0.07 };
}
const SUNDIR = t => KFV(t, [[0, -0.3, 0.055, -0.95], [18, -0.3, 0.14, -0.94], [60, -0.3, 0.3, -0.9], [149, -0.5, 0.4, -0.7], [166, -0.5, 0.35, -0.8], [228, -0.97, 0.05, -0.2], [246, -0.97, 0.05, -0.2]]);
function applyEnv(t) {
  const s = shotAt(t), loc = s.loc;
  FM.visible = loc === 'FM'; HL.visible = loc === 'HL'; GD.visible = loc === 'GD'; SL.visible = loc === 'SL';
  const sk = skyFor(t, loc);
  sky.material.uniforms.uTop.value.copy(sk.top); sky.material.uniforms.uBot.value.copy(sk.bot);
  ovMat.uniforms.uC.value.copy(sk.oc); ovMat.uniforms.uA.value = sk.oa;
  let va = 0, vc = '#fff6dd';
  for (const [tb, c] of SEAMS) { const a = 0.62 * (1 - Math.abs(t - tb) / 0.75); if (a > va) { va = a; vc = c; } }
  disMat.uniforms.uC.value.set(vc); disMat.uniforms.uA.value = Math.max(0, va);
  // sun (outdoors): a direction from the camera
  const sunOn = loc === 'FM' || loc === 'GD';
  SUN.visible = sunOn;
  if (sunOn) {
    let d = SUNDIR(t), op = 1, col = '#ffd27a';
    if (loc === 'GD') { const ph = (t - 85.8) / 14.2 * 3, day = t < 100 ? 0.5 + 0.5 * Math.cos(2 * PI * ph) : 1; d = [-0.55, 0.12 + 0.5 * day, -0.8]; col = day > 0.4 ? '#ffdc8a' : '#cfe0ff'; op = t < 100 ? 0.4 + 0.6 * day : 1; }
    else if (t >= 131.5 && t < 149) op = 1 - rise(t, 132, 144) * 0.9;
    else if (t >= 149 && t < 166.8) op = 0.35 + 0.65 * rise(t, 150, 156);
    const L = Math.hypot(d[0], d[1], d[2]);
    SUN.position.set(cam.position.x + d[0] / L * 12000, cam.position.y + d[1] / L * 12000, cam.position.z + d[2] / L * 12000);
    sunGl.material.color.set(col); sunGl.material.opacity = 0.7 * op; sunDisc.visible = op > 0.3; sunDisc.scale.setScalar(420);
  }
  const lerpHex = (a, b, k) => cc(a).lerp(cc(b), k);
  /* ---------------- farm */
  if (loc === 'FM') {
    const wet = rise(t, 21.5, 34) * (1 - rise(t, 34, 36)) + rise(t, 150, 158) * 0.9;
    furrowMat.uniforms.uColor.value.copy(lerpHex('#b57d46', '#6e4528', cl(wet, 0, 1)));
    // sprinklers
    const spOn = rise(t, 24.4, 26.0) * (1 - rise(t, 34.2, 35));
    VW.rotation.z = -7 * rise(t, 23.0, 25.4);
    SPR.forEach((S, k) => {
      const amt = cl(spOn * 1.4 - k * 0.04, 0, 1) * (t < 36 ? 1 : 0);
      S.arm.rotation.y = -(t * 2.4 + k); S.arm.position.x = Math.cos(t * 2.4 + k) * 14; S.arm.position.z = Math.sin(t * 2.4 + k) * 14;
      S.dr.forEach((m, j) => {
        m.visible = amt > 0.03;
        if (!m.visible) return;
        const ph = ((t * 1.15 + j / 12 + k * 0.13) % 1 + 1) % 1, a = 0.95 * Math.sin(t * 1.3 + k) + (j % 5 - 2) * 0.11, R = 70 + 360 * ph * (0.7 + 0.3 * ((j * 7) % 5) / 4);
        m.position.set(S.x + Math.sin(a) * R, 74 + 230 * 4 * ph * (1 - ph) * (0.8 + 0.2 * (j % 3)) , -520 + Math.cos(a) * R);
        m.scale.setScalar((3.6 + (j % 3)) * (0.5 + 0.5 * amt));
      });
    });
    // seeds thrown by the farmer
    SEEDS.forEach((m, k) => {
      const q = (t - 3.4) / 0.45, n = q < k ? -1 : k + 6 * Math.floor((q - k) / 6), ts = 3.4 + 0.45 * n, age = t - ts;
      m.visible = n >= 0 && ts < 19.2 && age >= 0 && age < 1.0;
      if (!m.visible) return;
      const r = RM.at(ts), u = age / 1.0;
      m.position.set(r.x + 30 + 200 * u, 150 + 130 * u - 280 * u * u, r.z + 45 + 25 * u);
    });
    BAGM.visible = t < 35 && ACT.M.h.visible;
    // plants
    PLANTS.forEach(P => {
      const g = sm((t - (152 + P.d * 6)) / 7), sc = g * (1 + 0.45 * rise(t, 166.8, 228.4)) * (0.85 + 0.3 * hash(P.k * 3 + P.d * 9));
      P.g.visible = sc > 0.02; P.g.scale.setScalar(Math.max(0.001, sc));
    });
    // clouds gather
    const G = rise(t, 131, 146), Gd = rise(t, 131.5, 144) * (1 - rise(t, 152, 166)), afterCl = t > 150 ? 0.55 : 1;
    cloudM.uniforms.uColor.value.copy(lerpHex('#ffffff', '#8e9bb2', Gd));
    CLD.forEach(C => { const sc = (0.42 + 0.7 * G) * afterCl * (t > 228 ? 0.8 : 1); C.g.scale.setScalar(sc); C.g.position.set(C.x * lerp(1, 0.55, G) + 60 * Math.sin(t * 0.05 + C.d * 6), C.y, C.z); C.g.visible = !(t >= 149 && t < 228 && C.d > 0.55) && !(t < 18 && Math.abs(C.x) < 1300); });
    // gauge fills
    GAUGE.visible = t >= 131 && t < 166.8;
    const lev = 112 * cl((t - 132) / 28, 0, 1); gaugeW.scale.y = Math.max(0.001, lev); gaugeW.visible = lev > 0.5;
    // rain
    let ramt = rise(t, 143, 149) * 0.25 + rise(t, 149, 152.5) * 0.75; if (t >= 160 && t < 228) ramt = 0.75 * (1 - rise(t, 163, 166.5)); if (t >= 228) ramt = 0.38;
    if (t < 131) ramt = 0;
    const wx = t >= 228 ? RW.at(t).x : -300;
    rainFM.userData.update(t, { x: wx, y: -50, z: t >= 228 ? FZ : 700 }, ramt, 0.14, { w: t >= 228 ? 1600 : 2200, h: 1800, d: t >= 228 ? 800 : 1500 });
  } else rainFM.visible = false;
  /* ---------------- garden + bamboo */
  if (loc === 'GD') {
    BAMB.forEach(B => {
      const u = cl((t - (100.8 + B.d)) / 8.4, 0, 1); let gg = u <= 0 ? 0 : Math.pow(u, 2.2); if (t > 100.5) gg = Math.max(gg, 0.03 * rise(t, 100.5, 101.2) * B.hs);
      B.g.visible = gg > 0.004;
      const L = 60 * B.hs * gg, unf = rise(t, 108.2 + B.d, 112.4 + B.d);
      for (let k = 0; k < B.segs.length; k++) {
        const h0 = k * L, h1 = (k + 1) * L, x0 = B.bend * h0 * h0 / 800, x1 = B.bend * h1 * h1 / 800, S = B.segs[k];
        S.c.position.set(x0, h0, 0); S.c.scale.set(1, Math.max(0.001, Math.hypot(h1 - h0, x1 - x0)), 1); S.c.rotation.z = -Math.atan2(x1 - x0, h1 - h0);
        S.r.position.set(x1, h1, 0);
      }
      B.leaves.forEach(Lf => { const h = (Lf.k + 1) * L, x = B.bend * h * h / 800; Lf.l.position.set(x + Lf.s * 18 * unf, h, 0); Lf.l.rotation.z = Lf.s * (1.25 - 0.55 * unf); Lf.l.scale.setScalar(Math.max(0.001, unf * (0.7 + 0.3 * gg))); Lf.l.visible = unf > 0.02; });
    });
  }
  /* ---------------- cut-away */
  if (loc === 'SL') {
    SLB.position.y = -260 * (1 - sm((t - 115) / 2.4)); SLB.position.x = 0;
    const G = (ROOTTOTAL + 60) * sm((t - 116.0) / 13.5);
    ROOTSEG.forEach(R => { const f = cl((G - R.off) / R.len, 0, 1); R.m.scale.y = Math.max(0.001, R.len * f); R.m.visible = f > 0.002; });
    rootTipGl.position.y = -26 - Math.min(G, 780) * 0.97; rootTipGl.material.opacity = 0.8 * (1 - rise(t, 129, 131));
    rootGlowAll.material.opacity = 0.35 * rise(t, 119, 128);
  }
  /* ---------------- hall */
  if (loc === 'HL') {
    HL.userData.hh.rotation.z = 0.17 * (1 - rise(t, 52.4, 55.4)); HL.userData.mh.rotation.z = 1.0 * (1 - rise(t, 52.4, 55.4));
    const s14 = t >= 212.6 && t < 228.4;
    const shOn = t < 52 || (t >= 182 && t < 212.6);
    SHT.forEach((S, i) => { S.s.visible = shOn; });
    T1.visible = (t >= 58.5 && t < 64.5) || (t >= 166.8 && t < 182); TBOOK.visible = T1.visible;
    TLONG.visible = s14;
    SHT[0].bk.visible = !(t >= 182 && t < 202.8);
    SHT[0].bk.scale.setScalar(t >= 202.8 ? 0.8 * (0.35 + 0.65 * sm((t - 202.8) / 1.0)) : 0.8);
    // pots on the sill
    const BASEH = [16, 34, 0, 22, 8, 40, 28];
    SPOT.forEach((p, i) => {
      if (i === 2) {
        p.visible = t >= 66;
        const sh = 74 * sm((t - 73) / 11.5), gl = (rise(t, 66, 67.5) * 0.9) * (1 - rise(t, 75, 79));
        p.userData.set(t >= 70 ? sh : 0, gl + (t < 70 ? 0 : 0));
      } else p.userData.set(BASEH[i] * (1 + 0.8 * sm((t - 72) / 14)), 0);
    });
    // pot carried by the hero (a), the pot on the study table (b)
    POTH.visible = t >= 52 && t < 58.5; POTH.userData.set(0, 0.9);
    POTT.visible = t >= 58.5 && t < 64.5; POTT.userData.set(0, rise(t, 59.5, 61) * 0.9);
    // watering can
    // long table pots
    TP.forEach((p, i) => {
      p.visible = s14; p.position.set(TX(i), 118, 1372);
      const H = [64, 22, 90, 38, 0, 52][i], h = H * (0.58 + 0.42 * rise(t, 213, 227));
      p.userData.set(h, H === 0 ? 0.8 : 0);
    });
    // light: sun seen through the window + a slanted light shaft
    let sx = 0, sy = 520, lo = 0.0, lc = '#fff0b0';
    if (t >= 70 && t < 85.8) { const u = (t - 70) / 15.8; sx = lerp(-720, 720, u); sy = 340 + 420 * Math.sin(PI * u); lo = 0.15 + 0.06 * Math.sin(PI * u); }
    else if (t >= 182 && t < 199) { const d = t < 188.4 ? 0 : (t < 194 ? 1 : 2); sx = [-380, 0, 360][d]; sy = [420, 640, 480][d]; lo = [0.14, 0.2, 0.13][d]; lc = ['#ffd9a0', '#fff4cc', '#ffe3a8'][d]; }
    else if (t >= 35 && t < 70) { sx = -200; sy = 560; lo = 0.1; }
    else if (t >= 199 && t < 228.4) { sx = 200; sy = 600; lo = 0.1; }
    else if (t >= 166.8 && t < 182) { sx = 100; sy = 600; lo = 0.1; }
    sunWin.position.set(sx, sy, -520); sunWin.material.opacity = 0.9; sunWin.material.color.set(lc);
    shaft.material.color.set(lc); shaft.material.opacity = lo;
    const P = new Float32Array([sx - 330, 760, 6, sx + 330, 760, 6, sx * -0.9 + 380, 4, 1300, sx * -0.9 - 380, 4, 1300]);
    shaft.geometry.setAttribute('position', new THREE.BufferAttribute(P, 3)); shaft.geometry.setIndex([0, 1, 2, 0, 2, 3]); shaft.geometry.computeBoundingSphere();
    floorPatch.material.opacity = 0;
    // golden motes settling into the chests (s03)
    const rowZ = ROWZ;
    MOTES.forEach((m, n) => {
      const bi = n % 5, j = Math.floor(n / 5), tl = 36.0 + bi * 1.25 + j * 1.6, u = (t - tl) / 3.0;
      const on = t >= 35 && t < 52 && u >= 0 && u < 1; m.visible = on; if (!on) return;
      const e = u * u * (3 - 2 * u);
      m.position.set(312 - 40 * (1 - e) + 14 * Math.sin(u * 7 + j), lerp(760, 205, e), rowZ[bi] + 12 * Math.cos(u * 5 + bi));
      m.material.opacity = Math.sin(PI * Math.min(1, u * 1.1)) * 0.95; m.scale.setScalar(46 * (1 - 0.5 * u) + 16 * Math.sin(u * 9));
    });
    // beam from above + glowing page (s13)
    beam.position.set(300, 650, 1080); beam.material.opacity = 0.11 * rise(t, 199.4, 202.0) * (1 - rise(t, 211.0, 212.6)); beam.visible = beam.material.opacity > 0.005;
    bookGlow2.position.set(236, 196, 1080); bookGlow2.material.opacity = 0.75 * rise(t, 203.4, 206.6) * (1 - rise(t, 211, 212.6)); bookGlow2.visible = bookGlow2.material.opacity > 0.01;
  }
  POTH.visible = POTH.visible && loc === 'HL';
}
function applyActors(t) {
  for (const id in ACT) {
    const A = ACT[id], st = A.fn(t);
    if (!st) { A.h.visible = false; continue; }
    A.h.visible = true;
    if (A.prop) continue;
    A.h.position.set(st.x, st.y, st.z); A.h.rotation.set(0, st.yaw, st.slope); A.h.scale.setScalar(st.scale || 1);
    A.o.set(st.po);
  }
  siddur.visible = t >= 182 && t < 202.8;
  CAN.g.visible = (t >= 70.2 && t < 85.2) || (t >= 85.8 && t < 99.6);
  CAN.g.rotation.z = PI / 2 - 0.2 - 0.9 * (t < 85.8 ? pulse(t, 71.0, 72.2, 82.0, 83.2) : pulse(t, 86.5, 87.3, 98.5, 99.4));
  // water drops from the can (after the pose, so they are a pure function of t)
  const loc = shotAt(t).loc, tipW = new THREE.Vector3();
  const inHall = loc === 'HL' && t < 85.8, inGar = loc === 'GD' && t < 100;
  if (inHall || inGar) { CAN.tip.updateWorldMatrix(true, false); CAN.tip.getWorldPosition(tipW); }
  const ph0 = ((t - 85.8) / 2.3) % 1, pourG = inGar ? Math.sin(PI * Math.min(1, ph0 * 1.7)) : 0;
  const pourH = inHall ? pulse(t, 71.0, 72.2, 82.0, 83.2) : 0;
  dropsC.forEach((m, i) => {
    const on = (inHall && pourH > 0.6 && CAN.g.visible) || (inGar && pourG > 0.5 && t < 99.8); m.visible = on; if (!on) return;
    const ph = ((t * 1.6 + i / 10) % 1 + 1) % 1; m.position.set(tipW.x, lerp(tipW.y, inGar ? 34 : 240, ph), tipW.z); m.scale.setScalar(3.4);
  });
}


/* ------------------------------------------------------------------ render + contract */
let cur_t = 0;
function frame(t) {
  t = cl(t, 0, DUR); cur_t = t;
  const s = shotAt(t);
  const c = s.cam(t);
  cam.fov = c.fov || 30; cam.updateProjectionMatrix(); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
  cam.updateMatrixWorld(true);
  applyEnv(t); applyActors(t);
  sky.position.copy(cam.position);
  renderer.render(scene, cam);
}
async function warm() {
  const seen = new Set(); const jobs = [];
  for (let k = 0; k <= DUR * 30; k++) {
    const t = k / 30; cur_t = t;
    for (const id in ACT) { const A = ACT[id]; if (!A.person) continue; let st; try { st = A.fn(t); } catch (e) { continue; } if (!st || !st.po.face) continue; const key = id + JSON.stringify(st.po.face); if (seen.has(key)) continue; seen.add(key); jobs.push([A, st.po.face]); }
  }
  for (const [A, f] of jobs) await (A.o.warm ? A.o.warm(f) : A.o.face.set(f));
  return jobs.length;
}
window.__ACT = ACT; window.__scene = scene; window.__dur = DUR; window.__HQ = HQ; window.__errors = [];
window.__shots = SHOTS.map(s => ({ id: s.id, index: s.index, start: s.start, dur: s.dur, end: s.end, wide: !!s.wide }));
window.__caption = () => null;
const _box = new THREE.Box3(), _pv = new THREE.Vector3();
window.__heroBox = t => {
  const s = shotAt(t); cur_t = t; const ids = s.hero || []; let n = 0;
  _box.makeEmpty();
  for (const id of ids) { const A = ACT[id]; if (A && A.h.visible) { A.h.updateMatrixWorld(true); _box.expandByObject(A.h); n++; } }
  if (!n || _box.isEmpty()) return null;
  const mn = [1e9, 1e9], mx = [-1e9, -1e9]; let behind = true;
  for (const x of [_box.min.x, _box.max.x]) for (const y of [_box.min.y, _box.max.y]) for (const z of [_box.min.z, _box.max.z]) {
    _pv.set(x, y, z).project(cam); const cz = _pv.z; if (cz < 1) behind = false;
    mn[0] = Math.min(mn[0], _pv.x); mn[1] = Math.min(mn[1], _pv.y); mx[0] = Math.max(mx[0], _pv.x); mx[1] = Math.max(mx[1], _pv.y);
  }
  const vis = !behind && mx[0] > -1 && mn[0] < 1 && mx[1] > -1 && mn[1] < 1;
  return { visible: vis, behindCamera: behind, heightFrac: (mx[1] - mn[1]) / 2, bottomFrac: (1 - (mn[1] + 1) / 2), box: [mn, mx] };
};
window.__sceneHash = () => { let h = 0; scene.traverse(o => { if (o.visible !== false) { const e = o.matrixWorld.elements; h = (h * 31 + Math.round(e[12] * 10) + Math.round(e[13] * 10) * 7 + Math.round(e[14] * 10) * 13 + Math.round(e[0] * 100) * 3) | 0; } }); return h + '|' + cam.position.x.toFixed(2) + '|' + cam.position.y.toFixed(2); };
const _OFF = window.__T0 || 0;
window.__seek = t => { try { frame(Math.max(0, +t || 0) + _OFF); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

(async () => {
  try {
    if (Q.has('nowarm')) { window.__nwarm = 0; } else window.__nwarm = await warm();
    frame(Q.has('t') ? +Q.get('t') : 0);
    window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
})();
