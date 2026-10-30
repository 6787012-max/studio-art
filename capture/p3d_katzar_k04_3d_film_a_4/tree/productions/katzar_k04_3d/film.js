/* katzar_k04_3d - 3D cel-shaded film, 211 s, 11 shots. Deterministic: every frame is a pure function of t.
   Sets: OUT (hill + ark + ramp + porch), ARKIN (warm barn interior), HALL (study hall, window onto OUT), STREET (night street).
   Characters: CAST animals + sefer (lib/toon3d/cast.js) and people through people.js only. */
import { THREE, sm, cl, kf, D2R, jawOf, part, ell, tube, toon, V, orbitCam } from '../../lib/toon3d/toon3d.js';
import { CAST } from '../../lib/toon3d/cast.js';
import * as P from './people.js';
import * as PR from './props.js';
import { M, glow, box } from './props.js';

export const DUR = 211;
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

// colour grade overlay (full-screen quad, drawn after the opaque scene, before the glows)
const ovMat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, uniforms: { uC: { value: new THREE.Color('#000') }, uA: { value: 0 } },
  vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: 'uniform vec3 uC; uniform float uA; void main(){ gl_FragColor = vec4(uC, uA); }' });
const ov = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ovMat); ov.frustumCulled = false; ov.renderOrder = 10; scene.add(ov);

const visMat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false,
  uniforms: { uVis: { value: 0 }, uTime: { value: 0 }, uCx: { value: 0.5 }, uY0: { value: 0.4 }, uY1: { value: 0.84 }, uW: { value: 0.2 }, uAsp: { value: 16 / 9 }, uH: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `varying vec2 vUv; uniform float uVis, uTime, uCx, uY0, uY1, uW, uAsp; uniform vec3 uH[3];
  void main(){
    vec2 p = vUv; float t = (p.y - uY0) / (uY1 - uY0); float tc = clamp(t, 0.0, 1.0);
    float hw = mix(uW, uW * 0.3, pow(tc, 0.8)); float dx = abs(p.x - uCx);
    float inside = step(0.0, t) * step(t, 1.0) * step(dx, hw);
    float d = 1.0 / (1.0 - 0.86 * tc); float fs = fract(d * 2.6);
    vec3 tread = vec3(1.0, 0.86, 0.42), riser = vec3(0.9, 0.58, 0.16);
    vec3 col = mix(riser, tread, step(0.22, fs));
    float run = exp(-pow((fract(tc * 0.9 - uTime * 0.28) - 0.5) * 5.0, 2.0));
    col += vec3(1.0, 0.95, 0.7) * run * 0.7;
    float rail = smoothstep(hw * 0.9, hw, dx) * inside;
    col = mix(col, vec3(1.0, 0.97, 0.8), rail * 0.8);
    vec2 bc = vec2(uCx, uY1 + 0.05);
    vec2 bq = (p - bc) * vec2(uAsp, 1.0);
    float book = (1.0 - smoothstep(0.14, 0.16, abs(bq.x) * 0.8 + abs(bq.y) * 3.2)) * step(-0.02, bq.y + 0.02);
    float halo = exp(-length(bq * vec2(1.0, 1.4)) * 7.0);
    float beam = exp(-pow(dx / (0.05 + 0.1 * clamp(t, 0.0, 1.2)), 2.0)) * smoothstep(-0.05, 0.2, t) * 0.25;
    float a = max(inside * 0.88, max(book, max(halo * 0.75, beam)));
    vec3 outc = col * inside + vec3(1.0, 0.95, 0.75) * (book + halo * 0.8) + vec3(1.0, 0.85, 0.5) * beam;
    outc = mix(vec3(1.0, 0.86, 0.5), outc, clamp(inside + book, 0.0, 1.0));
    for (int i = 0; i < 3; i++) { vec2 q = (p - uH[i].xy) * vec2(uAsp, 1.0); a *= mix(1.0, smoothstep(uH[i].z * 0.7, uH[i].z, length(q)), step(0.001, uH[i].z)); }
    gl_FragColor = vec4(outc, a * uVis);
  }` });
const visQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), visMat); visQuad.frustumCulled = false; visQuad.renderOrder = 11; scene.add(visQuad);
const _hv = new THREE.Vector3(), _hb = new THREE.Box3();
function holeFor(id, idx) {
  const A = ACT[id], u = visMat.uniforms.uH.value[idx];
  if (!A || !A.h.visible) { u.set(0, 0, 0); return; }
  A.h.updateMatrixWorld(true); _hb.setFromObject(A.h);
  _hv.set((_hb.min.x + _hb.max.x) / 2, _hb.max.y, (_hb.min.z + _hb.max.z) / 2).project(cam); const top = _hv.y;
  _hv.set((_hb.min.x + _hb.max.x) / 2, _hb.min.y, (_hb.min.z + _hb.max.z) / 2).project(cam); const bot = _hv.y;
  _hv.set((_hb.min.x + _hb.max.x) / 2, _hb.max.y, (_hb.min.z + _hb.max.z) / 2).project(cam);
  const hgt = Math.abs(top - bot) / 2;
  u.set(_hv.x * 0.5 + 0.5, (top * 0.5 + 0.5) - hgt * 0.28, Math.max(0.07, hgt * 0.3));
}

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

/* ------------------------------------------------------------------ worlds */
const OUT = new THREE.Group(), ARKIN = new THREE.Group(), HALL = new THREE.Group(), STREET = new THREE.Group();
scene.add(OUT, ARKIN, HALL, STREET);
const ARKIN_X = -12000, STREET_X = 14000, HZ = 800;
ARKIN.position.set(ARKIN_X, 0, 0); STREET.position.set(STREET_X, 0, 0); HALL.position.set(0, 0, HZ);

// ----- OUT: hill, valley, trees, ark, porch, clouds
const mGrass = M('#8cc068', '#c9d3bd'), mGrassD = M('#7fb85a', '#c8d6c0'), mHill1 = M('#9ccd6c', '#c8d6c0'), mHill2 = M('#6fae52', '#c8d6c0'), mTrunk = M('#8a5a3a', '#bfa'), mLeaf = M('#5fae4e', '#c4cfc0'), mPost = M('#c99a62', '#b0907a');
part(OUT, ell(5600, 900, 5600, 64, 24), mGrass, 10, [0, -900, 0]);
const valley = new THREE.Mesh(new THREE.CircleGeometry(30000, 48).rotateX(-Math.PI / 2), mGrassD); valley.position.y = -820; OUT.add(valley);
for (const [x, z, rx, ry, rz, m] of [[-3600, -7500, 3200, 1100, 1500, mHill1], [3400, -8200, 3600, 1500, 1600, mHill2], [-600, -9500, 3600, 1800, 1500, mHill1], [7600, -3500, 2400, 900, 1300, mHill1], [-8000, -3200, 2400, 1000, 1200, mHill2], [-1500, 9000, 3600, 900, 1300, mHill2], [8800, 5200, 2600, 900, 1200, mHill1]])
  part(OUT, ell(rx, ry, rz, 40, 20), m, 10, [x, -400, z]);
function tree(x, z, s, y) { const g0 = new THREE.Group(); g0.position.set(x, y || 0, z); g0.scale.setScalar(s); OUT.add(g0); part(g0, tube(18, 26, 170, 14).translate(0, 170, 0), mTrunk, 4);
  for (const [a, b, c2, r] of [[0, 250, 0, 95], [-60, 215, 30, 70], [62, 220, -20, 74], [10, 300, -10, 70]]) part(g0, ell(r, r * 0.92, r), mLeaf, 4, [a, b, c2]); return g0; }
tree(-2100, -900, 1.5); tree(2300, -700, 1.7); tree(-2900, 700, 1.3); tree(3000, 900, 1.2); tree(900, -3700, 1.6); tree(-1500, -3700, 1.8); tree(1700, 2200, 1.0);
const ARK = PR.makeArk(); OUT.add(ARK); const ARK2 = ARK.clone(true); ARK2.position.set(150, 0, -2900); OUT.add(ARK2);   // ARK2 = the same ark further back, used when seen through the hall window
// porch (hill-top deck) for the reader
const PORCH = new THREE.Group(); PORCH.position.set(1900, 0, 450); OUT.add(PORCH);
box(PORCH, 640, 36, 460, M('#d8a468', '#b08a7a'), [0, 18, 0], 3, null, 3);
for (const [x, z] of [[-300, -210], [300, -210], [-300, 210], [300, 210]]) box(PORCH, 18, 90, 18, M('#8f5d33'), [x, 80, z], 2, null, 2);
box(PORCH, 620, 10, 12, M('#8f5d33'), [0, 118, -210], 2, null, 1);
// flowerpot + stool
part(PORCH, tube(22, 17, 30, 12).translate(0, 66, 0), M('#c2603a'), 2, [250, 36, 180]); part(PORCH, ell(30, 22, 30, 12, 8), M('#6fb852'), 2, [250, 90, 180]);
const PLEC = new THREE.Group(); PLEC.position.set(PORCH.position.x, 40, PORCH.position.z); PLEC.rotation.y = -0.79; OUT.add(PLEC);
{ const sh = PR.makeShtender(); sh.position.set(112, 0, 0); PLEC.add(sh); const bk = PR.makeBook(true); bk.position.set(2, 8.5, 0); bk.scale.setScalar(0.8); sh.userData.top.add(bk); }
// far grey clouds at the horizon (greyness fades as the day gets bright)
const farMat = M('#c4ccd8', '#a6aebb'), farClouds = [];
for (let i = 0; i < 7; i++) { const c = PR.makeCloudPuff('#c4ccd8', '#a6aebb'); c.position.set(-5200 + i * 1800, 1100 + 260 * Math.sin(i * 2.1), -9000); c.scale.setScalar(5.5); OUT.add(c); farClouds.push(c); }
// storm clouds circling above the ark
const stormClouds = []; for (let i = 0; i < 14; i++) { const c = PR.makeCloudPuff('#59607a', '#3d4358'); c.scale.setScalar(2.6 + (i % 3) * 0.7); OUT.add(c); stormClouds.push(c); }
const leaves = []; for (let i = 0; i < 70; i++) { const l = PR.makeLeaf(['#e0b83c', '#8dc055', '#d9803c', '#6fae52'][i % 4]); OUT.add(l); leaves.push(l); }
const arrows = []; for (let i = 0; i < 7; i++) { const a = PR.makeArrow(['#ff5a8a', '#3ac0f0', '#ffd23c', '#7dd65a', '#b36cff', '#ff8a3c', '#38e0b0'][i]); OUT.add(a); arrows.push(a); }
const rainbow = PR.makeRainbow(); rainbow.position.set(0, -450, -5200); rainbow.scale.setScalar(0.95); OUT.add(rainbow);
const sunGlow = glow(OUT, '#fff1b8', 3600, [1500, 3200, -7000], 0);
// outside-the-window street chaos: blobs and squiggles (abstract)
const blobs = []; for (let i = 0; i < 22; i++) { const g0 = new THREE.Group(); OUT.add(g0); const c = ['#ff3a6e', '#33c8ff', '#ffd31f', '#6dff5a', '#c05cff', '#ff8a2a'][i % 6]; glow(g0, c, 150 + (i % 4) * 40, null, 0.95); const core = new THREE.Mesh(new THREE.SphereGeometry(16, 10, 8), new THREE.MeshBasicMaterial({ color: c })); g0.add(core); blobs.push(g0); }
const squig = []; for (let i = 0; i < 5; i++) { const pts = []; for (let k = 0; k < 14; k++) pts.push(new THREE.Vector3(k * 26, ((k % 2) ? 1 : -1) * (14 + (k * 7) % 11), 0)); const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: ['#ff3a6e', '#33c8ff', '#ffd31f', '#c05cff', '#6dff5a'][i] })); OUT.add(l); squig.push(l); }
const rainOut = PR.makeRain(900, 11); scene.add(rainOut);
const WN = 150, wPos = new Float32Array(WN * 6), wGeo = new THREE.BufferGeometry(); wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
const wMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, depthWrite: false }), windLines = new THREE.LineSegments(wGeo, wMat); windLines.frustumCulled = false; windLines.renderOrder = 25; OUT.add(windLines);

// ----- ARKIN
const ARKIN_SET = PR.makeArkInside(); ARKIN.add(ARKIN_SET);
const pairRings = []; for (let i = 0; i < 4; i++) { const r = PR.glowRing('#ffc85a'); ARKIN.add(r); pairRings.push(r); }
const sparklesIn = PR.makeSparkles(40, 5); ARKIN.add(sparklesIn);

// ----- HALL
const HALL_SET = PR.makeHall(); HALL.add(HALL_SET);
const TABLE = PR.makeTable(960, 230, 118); TABLE.position.set(0, 0, 940); HALL.add(TABLE);   // world z = 1740
const BENCH = PR.makeBench(1000, 64); BENCH.position.set(0, 0, 720); HALL.add(BENCH);
const GEM = PR.makeBook(true); GEM.rotation.y = Math.PI / 2; GEM.position.set(-40, 118, 960); HALL.add(GEM);   // open gemara on the table
const STACK = PR.stackOf(['#2b4d8c', '#8c2b2b', '#6b3f2a', '#2b6b4d', '#4a3b7a', '#a0522d'], 88, 60, 13); STACK.position.set(420, 118, 930); HALL.add(STACK);
const STACK2 = PR.stackOf(['#6b3f2a', '#2b4d8c', '#8c2b2b'], 80, 56, 12); STACK2.position.set(-420, 118, 900); HALL.add(STACK2);
const STAIRS = PR.makeStairs(34, 70); STAIRS.rotation.y = Math.PI / 2 * 1; HALL.add(STAIRS);   // rises toward -z through the window
STAIRS.rotation.y = Math.PI / 2; STAIRS.position.set(0, 0, 700);
// shtender with book for the bochur / man in the hall
const SH1 = PR.makeShtender(), SH2 = PR.makeShtender(), SH3 = PR.makeShtender();
const BK1 = PR.makeBook(true), BK2 = PR.makeBook(true), BK3 = PR.makeBook(true);
for (const [sh, bk] of [[SH1, BK1], [SH2, BK2], [SH3, BK3]]) { const top = sh.userData.top; bk.position.set(2, 8.5, 0); top.add(bk); bk.scale.setScalar(0.62); HALL.add(sh); }
// extra table + bench for the boy
const TABLE2 = PR.makeTable(300, 160, 80); HALL.add(TABLE2); const BENCH2 = PR.makeBench(380, 46); HALL.add(BENCH2);
const BKB = PR.makeBook(true, { w: 62, h: 80, t: 12 }); HALL.add(BKB);
const ringBochur = PR.glowRing('#ffcf6a'), ringHall = [PR.glowRing('#ffcf6a'), PR.glowRing('#ffcf6a'), PR.glowRing('#ffcf6a')]; HALL.add(ringBochur); ringHall.forEach(r => HALL.add(r));
const sparkHall = PR.makeSparkles(36, 9); HALL.add(sparkHall);

// ----- STREET
const STREET_SET = PR.makeStreet(); STREET.add(STREET_SET);
const water = PR.makeWater(5200, 2000); STREET.add(water);
const blobsS = []; for (let i = 0; i < 16; i++) { const g0 = new THREE.Group(); STREET.add(g0); const c = ['#ff3a6e', '#33c8ff', '#ffd31f', '#6dff5a', '#c05cff', '#ff8a2a'][i % 6]; glow(g0, c, 170 + (i % 4) * 40, null, 1); g0.add(new THREE.Mesh(new THREE.SphereGeometry(18, 10, 8), new THREE.MeshBasicMaterial({ color: c }))); blobsS.push(g0); }
const arrowsS = []; for (let i = 0; i < 6; i++) { const a = PR.makeArrow(['#ff5a8a', '#3ac0f0', '#ffd23c', '#7dd65a', '#b36cff', '#ff8a3c'][i]); STREET.add(a); arrowsS.push(a); }
const squigS = []; for (let i = 0; i < 5; i++) { const pts = []; for (let k = 0; k < 14; k++) pts.push(new THREE.Vector3(k * 30, ((k % 2) ? 1 : -1) * (16 + (k * 7) % 11), 0)); const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: ['#ff3a6e', '#33c8ff', '#ffd31f', '#c05cff', '#6dff5a'][i] })); STREET.add(l); squigS.push(l); }
const rainStreet = PR.makeRain(1100, 23); scene.add(rainStreet);

/* ------------------------------------------------------------------ actors */
const ACT = {};
function addAnimal(id, kind) { const o = CAST[kind](); const h = new THREE.Group(); h.rotation.order = 'YZX'; h.add(o.root); scene.add(h); ACT[id] = { o, h, cycle: o.cycle, fn: () => null, anim: true }; return ACT[id]; }
function addPerson(id, mk) { const o = mk(); const h = new THREE.Group(); h.rotation.order = 'YZX'; h.add(o.root); scene.add(h); ACT[id] = { o, h, cycle: o.cycle, fn: () => null, person: true }; return ACT[id]; }
for (const [id, k] of [['D1', 'donkey'], ['D2', 'donkey'], ['S1', 'sheep'], ['S2', 'sheep'], ['S3', 'sheep'], ['S4', 'sheep'], ['C1', 'camel'], ['C2', 'camel'], ['R1', 'rooster'], ['R2', 'rooster'], ['G1', 'goat'], ['G2', 'goat'], ['SF', 'sefer']]) addAnimal(id, k);
addPerson('M', P.makeMan); addPerson('BO', P.makeBochur); addPerson('BY', P.makeBoy); addPerson('RA', P.makeRabbiA); addPerson('RB', P.makeRabbiB);
// held gemara (closed) for the bochur and the boy and the man
const HELD = {}; for (const id of ['BO', 'BY', 'M']) { const b = PR.makeBook(false, { w: id === 'BY' ? 40 : 56, h: id === 'BY' ? 64 : 84 }); b.visible = false; HELD[id] = b; ACT[id].o.hand(1).add(b); }
// pose of the closed book in the hand (tuned by eye)
for (const id of ['BO', 'BY', 'M']) { HELD[id].position.set(10, -22, -8); HELD[id].rotation.set(0, 0, Math.PI / 2); }

function walker(id, route, extra, pre) {
  const A = ACT[id];
  A.fn = t => {
    if (t < route.t0 - 1e-6 && !(pre)) return null;
    const r = route.at(t); const po = { t, x: 0, z: 0, yaw: 0, walk: r.walk, ph: PH(r, A.cycle) };
    const st = { x: r.x, y: r.y, z: r.z, yaw: r.yaw, slope: r.slope, po, r };
    if (extra) extra(t, po, st, r);
    return st;
  };
}
function stander(id, x, y, z, yaw, extra) { const A = ACT[id]; A.fn = t => { const po = { t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 }; const st = { x, y, z, yaw, slope: 0, po }; if (extra) extra(t, po, st); return st; }; }
const faceOf = (expr, t, seed, o) => Object.assign({ expr, blink: blink(t, seed) }, o || {});
const TALK = 'AEXOAMEAXU_OAEXA_MEAOX_AEXA';
const talkAt = (t, a, b) => { if (t < a || t > b) return null; const c = TALK[Math.floor((t - a) / 0.12) % TALK.length]; return c === '_' ? null : c; };

/* ------------------------------------------------------------------ the cast of the story (acting) */
const LANE_A = -215, LANE_B = -85, DOORX = { A: 520, B: 640 };
function pairChain(t0, v, xs, lane, hide) {
  const dx = DOORX[lane === LANE_A ? 'A' : 'B'];
  return chain(t0, v, [[xs, lane, 0], [RAMP_X0, lane, 0], [250, lane, 200], [dx, lane, 200], [dx, hide || -300, 200]]);
}
const RAMP_X0 = -1150;
// s02: pairs walk up the ramp (one behind the other), each pair side by side with a small stagger
const spd = 215;
const rt = {};
rt.D1 = mkRoute(pairChain(13.6, spd, -1750, LANE_A)); rt.D2 = mkRoute(pairChain(14.05, spd * 0.98, -1750, LANE_B));
rt.C1 = mkRoute(pairChain(14.6, spd * 0.9, -2300, LANE_A)); rt.C2 = mkRoute(pairChain(15.2, spd * 0.9, -2300, LANE_B));
rt.R1 = mkRoute(pairChain(18.2, spd * 0.95, -2200, LANE_A)); rt.R2 = mkRoute(pairChain(18.7, spd * 0.95, -2200, LANE_B));
rt.S1 = mkRoute(pairChain(20.6, spd * 0.9, -2300, LANE_A)); rt.S2 = mkRoute(pairChain(21.1, spd * 0.9, -2300, LANE_B));
const hideAfter = (rtn, id, extra) => { const A = ACT[id]; walker(id, rtn, extra); const f = A.fn; A.fn = t => (t > rtn.t1 - 0.05 || t < rtn.t0 - 1e-6) ? null : f(t); };
const animalFace = (id, seed, exprFn) => (t, po) => { po.face = faceOf(exprFn ? exprFn(t) : 'neutral', t, seed); };
for (const [id, seed] of [['D1', 1], ['D2', 2], ['C1', 3], ['C2', 4], ['R1', 5], ['R2', 6], ['S1', 7], ['S2', 8]]) hideAfter(rt[id], id, animalFace(id, seed, t => (t > 14 && t < 30) ? 'neutral' : 'neutral'));

// s03: sheep pair S3,S4 wait at the ramp foot; goat G2 stands; G1 wanders to the sheep and back
const SHX = -1360;
{
  const rs3 = mkRoute(chain(26.0, 215, [[-2300, LANE_A, 0], [SHX, LANE_A, 0, { yaw: -0.25 }]])), rs4 = mkRoute(chain(26.4, 215, [[-2300, LANE_B, 0], [SHX + 30, LANE_B, 0, { yaw: 0.35 }]]));
  const sheepFace = (seed) => (t, po) => { po.face = faceOf(t > 34 && t < 36 ? 'surprised' : 'neutral', t, seed); };
  walker('S3', rs3, sheepFace(9)); walker('S4', rs4, sheepFace(10));
  const g2 = mkRoute(chain(27.5, 215, [[-3000, LANE_B, 0], [-1900, LANE_B, 0, { yaw: 0.2 }]]));
  walker('G2', g2, (t, po, st) => { po.face = faceOf('neutral', t, 11); if (t > 38) { po.headYaw = 0.3 * sm((t - 38) / 1); } });
  // G1: arrives, drifts to the sheep (sniff), returns to its partner
  const g1 = mkRoute(chain(27.0, 215, [[-3000, LANE_A, 0], [-1980, LANE_A, 0, { yaw: 0.0 }], [-1980, LANE_A, 0, { wait: 4.2, yaw: 0.0 }],
    [SHX - 150, LANE_A - 40, 0, { wait: 3.0 }], [SHX - 150, LANE_A - 40, 0, { yaw: 0.0 }], [-1930, LANE_A - 20, 0, { wait: 99, yaw: 0.5 }]]));
  walker('G1', g1, (t, po) => { po.face = faceOf(t > 33 && t < 36.5 ? 'surprised' : t > 36.5 ? 'happy' : 'neutral', t, 12); if (t > 33 && t < 37) po.neckPitch = 14 * pulse(t, 33, 34, 36, 37); });
}
ACT.G1.fn0 = ACT.G1.fn; ACT.G1.fn = t => (t < 27 || t > 63.2 - 20.5) ? (t > 27 ? ACT.G1.fn0(t) : null) : ACT.G1.fn0(t);

// s04 chaos: every animal runs in confused zig-zags 42.4 -> 52, then pairs regroup and walk calmly to the ark
function wander(id, seed, t0, t1) {
  const idx = Object.keys(CHAOS).indexOf(id);
  let x = -2100 + idx * 260 + (hash(seed) - 0.5) * 120, z = [300, 820, 560, 1020][idx % 4] + (hash(seed + 1) - 0.5) * 100;
  const keys = [[t0, x, z, 0]], n = Math.floor((t1 - t0) / 1.4);
  for (let i = 1; i <= n; i++) {
    const out = Math.atan2(-(z - 600), x + 700), ang = i === 1 ? out + (hash(seed + 7) - 0.5) * 1.0 : hash(seed + i * 3) * 6.283, d = i === 1 ? 700 : 420 + hash(seed + i * 5) * 260;
    x = cl(x + Math.cos(ang) * d, -2300, 900); z = cl(z - Math.sin(ang) * d * 0.7, 220, 1200); keys.push([t0 + i * (t1 - t0) / n, x, z, 0]);
  }
  return keys;
}
const CHAOS = { D1: 40, D2: 41, S3: 42, S4: 43, C1: 44, C2: 45, R1: 46, R2: 47, G1: 48, G2: 49, S1: 50, S2: 51 };
const GATHER = { D1: [-1650, LANE_A], D2: [-1650, LANE_B], C1: [-2200, LANE_A], C2: [-2200, LANE_B], R1: [-2650, LANE_A], R2: [-2650, LANE_B], S1: [-3000, LANE_A], S2: [-3000, LANE_B], S3: [-3350, LANE_A], S4: [-3350, LANE_B], G1: [-3700, LANE_A], G2: [-3700, LANE_B] };
const finalChaos = {};
for (const id of Object.keys(CHAOS)) {
  const base = ACT[id].fn, a = ACT[id];
  const g = GATHER[id], lane = g[1] === LANE_A ? LANE_A : LANE_B;
  let keys;
  const w = wander(id, CHAOS[id], 42.4, 48.0);
  keys = w.map(k => k.slice());
  // calm walk: from the last chaos point to the gather spot, then up the ramp and in (only pairs that go in: D, C, R, S1/S2)
  const t0 = 48.0; const arrive = chain(t0, 620, [[keys[keys.length - 1][1], keys[keys.length - 1][2], 0], [g[0], lane, 0]]);
  keys = keys.concat(arrive.slice(1));
  const tA = keys[keys.length - 1][0];
  const goes = ['D1', 'D2', 'C1', 'C2', 'R1', 'R2'].includes(id);
  if (goes) {
    const order = { D1: 0, D2: 0.45, C1: 3.2, C2: 3.7, R1: 6.0, R2: 6.5 }[id];
    const vv = id[0] === 'D' ? 245 : 260, pts = [[g[0], lane, 0], [RAMP_X0, lane, 0], [250, lane, 200], [DOORX[lane === LANE_A ? 'A' : 'B'], lane, 200], [DOORX[lane === LANE_A ? 'A' : 'B'], -300, 200]];
    const dur = chain(0, vv, pts)[4][0];
    const ride = chain(id[0] === 'D' ? Math.max(tA, 63.75 - dur + (id === 'D2' ? 0.4 : 0)) : Math.max(tA, 52.0) + order, vv, pts);
    keys = keys.concat(ride);   // stand at the gather point until the ride starts
  }
  const rtn = mkRoute(keys);
  const prevFn = a.fn;
  const speedUp = id;
  a.fn2 = t => {
    const r = rtn.at(t); const po = { t, x: 0, z: 0, yaw: 0, walk: r.walk, ph: PH(r, a.cycle) };
    const chaos = t < 48.4;
    po.face = faceOf(chaos ? 'surprised' : 'neutral', t, CHAOS[id], chaos ? { look: [0.1, 0.0] } : {});
    if (!chaos) po.face = faceOf('neutral', t, CHAOS[id]);
    if (chaos) { po.headRot = 6 * Math.sin(t * 9 + CHAOS[id]); po.tail = 12 * Math.sin(t * 10); }
    else po.headYaw = 0.08 * Math.sin(t * 1.3);
    return { x: r.x, y: r.y, z: r.z, yaw: r.yaw, slope: r.slope, po, r };
  };
  a.t2 = [42.4, goes ? rtn.t1 - 0.05 : 63.4]; a.fn1 = a.fn;
  a.fn = t => { if (t >= 42.4 && t <= a.t2[1]) return a.fn2(t); return a.fn1(t); };
}
// ---- g1/g2/s3/s4 tail: after 63.2 nothing
// sefer: hops in at ~20, puzzled 21-26, again 36-42
{
  const rs = mkRoute(chain(18.2, 200, [[-1300, 560, 0, { yaw: -0.4 }], [-540, 560, 0, { wait: 6.6, yaw: -1.2 }], [-1300, 560, 0]]));
  const rs2 = mkRoute(chain(35.2, 150, [[-2100, 120, 0, { yaw: -0.9 }], [-1130, 240, 0, { wait: 20, yaw: -1.2 }]]));
  const A = ACT.SF;
  A.fn = t => {
    let r, which;
    if (t >= 18.2 && t < 29.6) { r = rs.at(t); which = 1; }
    else if (t >= 35.2 && t < 42.6) { r = rs2.at(t); which = 2; }
    else return null;
    const q = which === 1 ? (t > 21.2 && t < 27.0) : (t > 36.6 && t < 42.4);
    const po = { t, x: 0, z: 0, yaw: 0, walk: r.walk, ph: PH(r, A.cycle) };
    const brow = { top: 0.5, tilt: 0.1, pr: 0.5, look: [0.4, -0.5], brow: { raise: 16, inRaise: -6, arch: 12, gap: 4 }, m: { open: 0, smile: -0.2 } };
    po.face = faceOf(q ? 'neutral' : 'happy', t, 20, q ? { eye: brow, mo: { open: 0, smile: -0.25 } } : {});
    if (q) { po.headTilt = 8 * Math.sin(t * 1.2); po.headRot = -9 + 4 * Math.sin(t * 2.3); po.squash = 0.02 * Math.sin(t * 3); po.tilt = 5 * Math.sin(t * 1.1); }
    return { x: r.x, y: r.y, z: r.z, yaw: r.yaw, slope: 0, po };
  };
}

// s05 inside the ark: pairs settle (walk in from the right, then stand side by side, breathing)
const INX = ARKIN_X;
{
  const spots = { D1: [-870, 150], D2: [-630, 150], S1: [-370, 130], S2: [-130, 130], C1: [140, 110], C2: [380, 110], R1: [640, 150], R2: [860, 150] };
  const pairIdx = { D: 0, S: 1, C: 2, R: 3 };
  for (const id of Object.keys(spots)) {
    const [sx0, sz0] = spots[id], sx = sx0 * 0.86, sz = sz0 + (id[1] === '2' ? 75 : -35), k = pairIdx[id[0]], t0 = 62.2 + k * 0.45 + (id[1] === '2' ? 0.2 : 0);
    const fy = id[1] === '1' ? -1.0 : -1.35;
    const keys = chain(t0, 190, [[INX + sx + 520, sz - 70, 0], [INX + sx, sz, 0, { yaw: fy }]]);
    keys.push([keys[keys.length - 1][0] + 40, INX + sx, sz, 0, fy]);
    const rtn = mkRoute(keys), A = ACT[id], prev = A.fn;
    A.fn_in = t => { const r = rtn.at(t); const po = { t, x: 0, z: 0, yaw: 0, walk: r.walk, ph: PH(r, A.cycle) }; const glowOn = t > 72; po.face = faceOf(t > 79.5 && t < 84 ? 'happy' : (glowOn ? 'happy' : 'neutral'), t, 30 + k * 2 + (id[1] === '2' ? 1 : 0)); if (t > 72) { po.headYaw = 0.15 * Math.sin(t * 0.9 + k) + 0.18 * (id[1] === '1' ? -1 : 1); po.headRot = 3 * Math.sin(t * 1.3 + k); } return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po }; };
    A.prev = prev; A.fn = t => (t >= 63.2 && t < 84.2) ? A.fn_in(t) : (t >= 84.2 ? null : prev(t));
  }
}
// goats and spare sheep do not appear in the ark scene: fine (hidden after s04 by fn1 range)
for (const id of ['G1', 'G2', 'S3', 'S4']) { const A = ACT[id], f = A.fn; A.fn = t => t > 63.4 ? null : f(t); }
// the outdoor animals come back after the flood, s11: pairs outside the window
{
  const spots = { D1: [-420, 220], D2: [-330, 340], S1: [-110, 200], S2: [-40, 310], C1: [210, 170], C2: [330, 290], R1: [470, 240], R2: [540, 350], S3: [-600, 340], S4: [-520, 220], G1: [640, 170], G2: [700, 300] };
  for (const id of Object.keys(spots)) {
    const A = ACT[id], prev = A.fn, [sx, sz] = spots[id];
    const idx = Object.keys(spots).indexOf(id), walkIn = (id === 'C1' || id === 'C2');
    A.fn11 = t => {
      const po = { t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 };
      po.face = faceOf(t > 199 ? 'happy' : 'neutral', t, 40 + idx);
      po.headYaw = 0.12 * Math.sin(t * 0.7 + idx); po.tail = 6 * Math.sin(t * 1.9 + idx);
      let x = sx, z = sz, yaw = -1.1 + 0.15 * (idx % 3), walk = 0, ph = 0;
      if (walkIn) { const off = (id === 'C2' ? 0.25 : 0), u = ((t - 193 - off) / 18); const dist = 180 * (t - 193); x = sx - 160 + dist * 0.0 + 0; const xx = sx - 300 + (t - 193) * 36; po.walk = 1; po.ph = (t - 193) * 36 / A.cycle; x = xx; z = sz; yaw = 0; }
      return { x, y: 0, z, yaw, slope: 0, po };
    };
    A.fn = t => t >= 193 ? A.fn11(t) : prev(t);
  }
}

/* ---------- PEOPLE ---------- */
const MAN_YAW = -0.79, PORCHP = [1900, 40, 450];
// s01: reads at the shtender, looks up surprised, ponders, scratches his head
const LEC = { l: { sz: 0.82, sx: 0.0, el: 1.32, tw: 0.0, curl: 0.55 }, r: { sz: 0.82, sx: 0.0, el: 1.32, tw: 0.0, curl: 0.55 } };
const REST = { l: { sz: 0.06 }, r: { sz: 0.06 } };
function manS01(t, po, st) {
  const read = 1 - rise(t, 4.9, 5.6), look = rise(t, 4.9, 5.7) * (1 - rise(t, 11.6, 12.6));
  po.headTilt = 16 * read - 4 * (1 - read) + 3 * Math.sin(t * 1.4) * read; po.headYaw = (0.0) * read + 0.35 * (1 - read) * (1 - rise(t, 11.6, 12.8));
  po.headRot = 3 * Math.sin(t * 0.9) * read; po.lean = 4 * read;
  const sc = pulse(t, 8.3, 9.0, 11.4, 12.2), sw = Math.sin(t * 14) * 0.18 * sc;
  const aL = Object.assign({}, LEC.l), aR = Object.assign({}, LEC.r);
  // right hand to the head to scratch
  aR.sz = lerp(LEC.r.sz, 2.45, sc); aR.el = lerp(LEC.r.el, 1.75 + sw, sc); aR.sx = lerp(0, 0.7, sc); aR.tw = lerp(0, 0.4, sc); aR.curl = lerp(0.55, 1.0, sc);
  const free = rise(t, 4.9, 5.7); aL.sz = lerp(LEC.l.sz, 0.55, free * 0.5); aL.el = lerp(LEC.l.el, 1.1, free * 0.5);
  po.arms = { l: aL, r: aR };
  const ex = t < 4.9 ? 'neutral' : t < 7.0 ? 'surprised' : t < 11.8 ? 'thinking' : 'smile';
  po.face = faceOf(ex, t, 51, ex === 'thinking' ? { look: [0.55, -0.85] } : (read > 0.5 ? { look: [0.3, 0.9] } : {}));
  st.y = 40;
}
ACT.M.fn0 = t => { const po = { t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 }; const st = { x: PORCHP[0], y: 40, z: PORCHP[2], yaw: MAN_YAW, slope: 0, po }; manS01(t, po, st); return st; };
ACT.M.fn = t => t < 13.6 ? ACT.M.fn0(t) : null;

// RB seated (older rabbi) + RA enters, sits (s06); s07 reactions; both vanish after s07 (cut to the street)
const SEATB = { x: -155, z: 1590 }, SEATA = { x: 155, z: 1590 };
const SIT = 48;
function sit(po, k) { po.bob = SIT * k; }
{
  // RB
  ACT.RB.fn = t => {
    if (t < 83.5 || t > 129.4) return null;
    const po = { t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 }; sit(po, 1); po.lean = -2;
    const y = -1.25;
    // gestures: listens, nods, then (125.9+) smiles and nods, hand on the gemara
    const hand = pulse(t, 126.1, 126.9, 129.0, 129.4);
    const gem = { sz: 1.0, sx: 0.0, el: 1.15, tw: 0.2, curl: 0.4 };
    po.arms = { l: { sz: 0.35, el: 1.5, curl: 0.6 }, r: { sz: lerp(0.55, gem.sz, hand), el: lerp(1.2, gem.el, hand), sx: lerp(-0.1, 0, hand), curl: lerp(0.6, 0.35, hand), tw: lerp(0.3, 0.2, hand) } };
    const lst = t < 125.9;
    let ex = 'neutral'; if (t > 100 && t < 104) ex = 'smile'; if (t > 110 && t < 124) ex = 'thinking'; if (t >= 125.9) ex = 'smile';
    if (t > 107 && t < 109) po.headTilt = 3;
    po.headYaw = lst ? 0.28 + 0.06 * Math.sin(t * 0.8) : 0.15; po.headRot = lst ? 2 * Math.sin(t * 0.6) : -3 + 3 * Math.sin(t * 5.5) * pulse(t, 126, 126.5, 128.5, 129);
    po.headTilt = (lst ? 0 : 6) + (t >= 125.9 ? 6 * Math.sin(t * 5.5) * pulse(t, 126, 126.5, 128.5, 129.2) : 0);
    po.face = faceOf(ex, t, 60, ex === 'thinking' ? { look: [0.5, -0.4] } : {});
    return { x: SEATB.x, y: 0, z: SEATB.z, yaw: y, slope: 0, po };
  };
  // RA: walks in from the right behind the table, turns, sits; speaks with gestures (no lip-sync of the rabbi's words: small background mouth only in short beats)
  const ra = mkRoute(chain(85.0, 190, [[1450, 1360, 0, { yaw: Math.PI }], [SEATA.x + 80, 1360, 0], [SEATA.x, 1440, 0, { yaw: -1.65 }], [SEATA.x, SEATA.z, 0, { yaw: -1.9 }]]));
  ACT.RA.fn = t => {
    if (t < 84.0 || t > 129.4) return null;
    const r = ra.at(t); const po = { t, x: 0, z: 0, yaw: 0, walk: r.walk, ph: PH(r, ACT.RA.cycle) };
    const sk = rise(t, 91.0, 92.4); sit(po, sk);
    const y = r.yaw;
    // gestures
    const up = pulse(t, 97.0, 98.2, 103.2, 104.4), shake = Math.sin(t * 6.5) * 0.28 * pulse(t, 99.8, 100.4, 103.0, 103.6);
    const toWin = pulse(t, 106.0, 107.0, 114.0, 115.4), ask = pulse(t, 116.5, 117.6, 124.0, 125.2), talkBeat = pulse(t, 91.5, 92.5, 96.5, 97.2) + pulse(t, 104.8, 105.5, 106.5, 107) * 0.5;
    const a = { l: { sz: 0.1 }, r: { sz: 0.1 } };
    if (!(t > 91)) { /* walking */ }
    // right arm: points up/back (staircase), then points at the window, then both hands open (asking)
    a.r = { sz: lerp(0.1, 2.3, up) + 0.6 * toWin + 0.5 * ask, sx: 0.0 + 0.5 * up + 0.3 * toWin, sy: -0.6 * toWin, el: lerp(0.25, 0.3, up) + 0.9 * toWin + 1.1 * ask, tw: 1.0 * ask, curl: lerp(0.5, 0.15, Math.max(up, toWin)) + 0.0, point: Math.max(up, toWin) > 0.4 };
    a.l = { sz: 0.1 + 0.55 * ask + 0.2 * talkBeat, sx: 0.3 * ask, el: 0.3 + 1.4 * ask + 0.4 * talkBeat, tw: 1.2 * ask, curl: 0.5 - 0.4 * ask, th: 0.3 - 0.6 * ask };
    if (t > 126) { a.l = { sz: 0.2, el: 0.5 }; a.r = { sz: 0.15, el: 0.4 }; }
    po.arms = a;
    po.headYaw = 0.0 + 0.6 * up * 0 + shake; po.headRot = 3 * Math.sin(t * 5.2) * talkBeat; po.headTilt = -6 * up;
    let ex = 'neutral'; if (t > 92 && t < 97) ex = 'smile'; if (t > 97 && t < 105) ex = 'worried'; if (t > 105 && t < 116) ex = 'worried'; if (t > 116 && t < 126) ex = 'thinking'; if (t >= 126) ex = 'smile';
    if (t >= 128.0) ex = 'laugh';
    po.face = faceOf(ex, t, 61, (ex === 'worried' || ex === 'thinking') ? { look: [0.1, -0.2] } : {});
    if (t > 91.5 && t < 97.3) po.face.talk = talkAt(t, 91.5, 97.3);
    if (t > 116.8 && t < 123.5) po.face.talk = talkAt(t, 116.8, 123.5);
    return { x: r.x, y: 0, z: r.z, yaw: y, slope: 0, po };
  };
}

// s08 street: the bochur walks, hesitates at the crossroads, turns to the lit hall, door closes behind him
const SX = STREET_X;
{
  const hallDoor = [SX + 560, -1030 + 246 + 40];
  const keys = chain(129.2, 150, [[SX - 1900, 140, 0, { yaw: 0 }], [SX - 260, 140, 0, { wait: 4.6, yaw: 0 }], [SX - 260, 140, 0, { yaw: -0.5 }]]);
  // keys: stop at crossroads ~ 140.3 .. 144 ; look both ways 137-140 (set below), then leave
  const kk = chain(129.4, 175, [[SX - 1900, 130, 0, { yaw: 0 }], [SX - 330, 130, 0, { wait: 7.4, yaw: 0, yaw2: 0 }], [SX + 520, -640, 0], [SX + 560, -770, 0, { wait: 1.0 }], [SX + 560, -1000, 0]]);
  const rtn = mkRoute(kk);
  ACT.BO.fn_st = t => {
    const r = rtn.at(t); const po = { t, x: 0, z: 0, yaw: 0, walk: r.walk, ph: PH(r, ACT.BO.cycle) };
    const lookAround = pulse(t, 135.6, 136.4, 139.6, 140.4);
    const dirL = Math.sin((t - 136.4) * 1.9) , tgt = t < 138.0 ? -1 : 1;
    po.headYaw = lookAround * (t < 138.0 ? 0.9 : -0.9) * (Math.abs(Math.sin((t - 136.2) * 1.2)) > 0 ? 1 : 1);
    po.arms = { l: { sz: 0.1 }, r: { sz: 0.35, sx: 0.0, el: 1.45, curl: 0.5 } };   // right arm: holds the book at the hip
    po.arms = { l: { sz: 0.12 + 0.2 * Math.max(0, r.walk) * 0 }, r: { sz: 0.55, el: 1.4, curl: 0.7, sx: -0.1 } };
    po.face = faceOf(lookAround > 0.3 ? 'worried' : (t > 141 ? 'neutral' : 'neutral'), t, 71, lookAround > 0.3 ? { look: [0.6 * (t < 138 ? -1 : 1), 0] } : {});
    po.lean = 3 * Math.min(1, r.walk);
    return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po };
  };
  ACT.BO.t8 = rtn.t1;
}
// bochur in the hall (s08 end -> s09): sits at the table-bench, opens the gemara, learns; looks up peacefully at ~170
const BOH = { x: -60, z: 1570 };
ACT.BO.fn_hall = t => {
  const po = { t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 };
  const sk = rise(t, 153.2, 154.2); sit(po, sk);
  const learn = rise(t, 154, 155), up = pulse(t, 169.5, 171, 176, 177);
  po.arms = { l: { sz: lerp(0.1, 0.9, learn), sx: 0.0, el: lerp(0.25, 1.15, learn), curl: 0.5 }, r: { sz: lerp(0.1, 0.9, learn), el: lerp(0.25, 1.15, learn), curl: 0.5 } };
  po.headTilt = lerp(0, 14, learn) * (1 - up) - 6 * up; po.headRot = 2 * Math.sin(t * 1.1) * (1 - up); po.lean = 3;
  po.headYaw = 0.0;
  const ex = up > 0.5 ? 'smile' : (t > 154 ? 'neutral' : 'neutral');
  po.face = faceOf(ex, t, 72, up > 0.3 ? { look: [0.0, -0.8] } : { look: [0.3, 0.8] });
  return { x: BOH.x, y: 0, z: BOH.z, yaw: -1.3, slope: 0, po };
};
ACT.BO.fn = t => {
  if (t < 129.2) return null;
  if (t < 152.0) { if (t > ACT.BO.t8 - 0.05) return null; return ACT.BO.fn_st(t); }
  if (t < 176) return ACT.BO.fn_hall(t);
  return t >= 193 ? ACT.BO.fn_end(t) : null;
};
ACT.BO.fn_end = t => {
  const po = { t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 };
  po.arms = { l: { sz: 0.8, el: 1.3, curl: 0.5 }, r: { sz: 0.8, el: 1.3, curl: 0.5 } }; po.headTilt = 12 + 2 * Math.sin(t * 1.3); po.lean = 3;
  po.face = faceOf(t > 198 ? 'smile' : 'neutral', t, 73, { look: [0.3, 0.8] });
  return { x: 270, y: 0, z: 1500, yaw: -1.45, slope: 0, po };
};

// s10: the boy slumps on the bench, the man comes, hand on shoulder, boy straightens and smiles, holds his gemara proudly
const BOYP = { x: -560, z: 1700 };
ACT.BY.fn = t => {
  if (t >= 176 && t < 193.3) {
    const po = { t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 }; sit(po, 1);
    const sad = 1 - rise(t, 186.4, 188.2), prou = rise(t, 189.5, 190.6);
    po.headTilt = 9 * sad - 4 * (1 - sad); po.lean = 10 * sad - 2 * (1 - sad); po.headRot = 2 * Math.sin(t * 0.8) * sad;
    po.arms = { l: { sz: lerp(0.5, 0.9, 1 - sad), el: 1.0 }, r: { sz: lerp(0.5, 1.0, 1 - sad), el: lerp(1.0, 1.4, prou), curl: 0.5 } };
    const ex = t < 184 ? 'worried' : t < 186.4 ? 'worried' : t < 188.2 ? 'neutral' : 'smile';
    po.face = faceOf(ex, t, 80, sad > 0.6 ? { look: [0.1, 0.9] } : { look: [0.1, -0.3] });
    return { x: BOYP.x, y: 0, z: BOYP.z, yaw: -1.35, slope: 0, po };
  }
  if (t >= 193.3) {
    const po = { t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 };
    po.arms = { l: { sz: 0.8, el: 1.3, curl: 0.5 }, r: { sz: 0.8, el: 1.3, curl: 0.5 } }; po.headTilt = 8; po.lean = -1;
    po.face = faceOf('smile', t, 81, { look: [0.3, 0.6] });
    return { x: -270, y: 0, z: 1500, yaw: -1.7, slope: 0, po };
  }
  return null;
};
{
  const mk = mkRoute(chain(179.6, 180, [[500, 1780, 0, { yaw: Math.PI }], [-440, 1760, 0], [-450, 1745, 0, { wait: 20, yaw: -2.3 }]]));
  const T0 = mk.t0;
  const mfn = t => {
    const r = mk.at(t); const po = { t, x: 0, z: 0, yaw: 0, walk: r.walk, ph: PH(r, ACT.M.cycle) };
    const put = pulse(t, 186.0, 186.8, 189.8, 190.6);
    po.arms = { l: { sz: 0.1 }, r: { sz: lerp(0.1, 0.04, put), sx: lerp(0, 0.52, put), el: lerp(0.25, 0.04, put), curl: lerp(0.5, 0.2, put), th: 0.3 } };
    po.headTilt = 8 * put; po.headYaw = 0.35 * put;
    const talk = pulse(t, 184, 184.6, 188, 188.8);
    po.face = faceOf(t < 184 ? 'neutral' : t < 190 ? 'smile' : 'smile', t, 90);
    if (t > 184.2 && t < 188.2) po.face.talk = talkAt(t, 184.2, 188.2);
    return { x: r.x, y: 0, z: r.z, yaw: r.yaw, slope: 0, po };
  };
  const fn0 = ACT.M.fn;
  ACT.M.fn = t => { if (t < 13.6) return fn0(t); if (t >= T0 - 0.01 && t < 193.0) return mfn(t); if (t >= 193) return ACT.M.fn_end(t); return null; };
  ACT.M.fn_end = t => {
    const po = { t, x: 0, z: 0, yaw: 0, walk: 0, ph: 0 };
    po.arms = { l: { sz: 0.8, el: 1.3, curl: 0.5 }, r: { sz: 0.8, el: 1.3, curl: 0.5 } }; po.headTilt = 10 + Math.sin(t * 0.9); po.lean = 2;
    po.face = faceOf(t > 200 ? 'smile' : 'neutral', t, 91, { look: [0.3, 0.7] });
    return { x: 0, y: 0, z: 1480, yaw: -1.55, slope: 0, po };
  };
}

/* ------------------------------------------------------------------ environment as a function of t */
const LOC = t => t < 63.2 ? 'out' : t < 84 ? 'arkin' : t < 129.2 ? 'hall' : t < 152 ? 'street' : t < 193 ? 'hall' : 'hall';
const E = t => {
  const e = {};
  e.storm = Math.max(kf(t, [[41.9, 0], [42.0, 0.6], [45, 1], [62, 0.85], [63.2, 0.5], [64.5, 0], [200, 0]]), kf(t, [[103, 0], [106.5, 1], [123, 0.9], [127.5, 0.0]]), pulse(t, 129.2, 131, 150, 152));
  e.night = Math.max(pulse(t, 129.0, 130.5, 168, 173), 0);
  e.grey = 1 - rise(t, 0.5, 12);
  e.rainWin = kf(t, [[103.5, 0], [106.5, 1], [123, 1], [127.5, 0]]);
  e.rainSt = pulse(t, 129.2, 130.5, 151.5, 152.0);
  e.vision = Math.max(pulse(t, 96.5, 99.0, 108, 111), pulse(t, 160, 164.5, 172.5, 175.6) * 0.75);
  e.rainbow = rise(t, 193.5, 200);
  e.wind = Math.max(pulse(t, 42.4, 44, 62, 64), pulse(t, 104, 106, 124, 127));
  e.flood = rise(t, 139, 151);
  return e;
};

/* ------------------------------------------------------------------ cameras */
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
const SHOTS = [
  { id: 's01', start: 0, end: 13.6, wide: true, loc: 'out', hero: ['M'], cam: hermite([[0, [900, 1850, 3300], [950, 330, 100], 34], [2.6, [1000, 700, 2200], [1500, 260, 350], 32], [5.0, [1390, 320, 1230], [1880, 285, 450], 30], [13.6, [1420, 320, 1180], [1900, 280, 450], 30]]) },
  { id: 's02', start: 13.6, end: 29.8, wide: true, loc: 'out', hero: ['D1', 'D2', 'C1', 'C2', 'R1', 'R2', 'S1', 'S2', 'SF'], cam: hermite([[13.6, [-1000, 330, 1750], [-780, 110, -150], 36], [22, [-440, 330, 1650], [-300, 130, -120], 34], [29.8, [-80, 340, 1650], [60, 150, -110], 36]]) },
  { id: 's03', start: 29.8, end: 42.4, loc: 'out', hero: ['S3', 'S4', 'G1', 'SF'], cam: hermite([[29.8, [-1180, 290, 1550], [-1480, 150, -150], 34], [36, [-1230, 280, 1450], [-1500, 150, -130], 34], [42.4, [-1260, 270, 1400], [-1520, 150, -140], 34]]) },
  { id: 's04', start: 42.4, end: 63.2, wide: true, loc: 'out', hero: ['D1', 'D2', 'C1', 'C2', 'R1', 'R2'], cam: null },
  { id: 's05', start: 63.2, end: 84.0, wide: true, loc: 'arkin', hero: ['D1', 'D2', 'S1', 'S2', 'C1', 'C2', 'R1', 'R2'], cam: hermite([[63.2, [ARKIN_X - 150, 520, 2300], [ARKIN_X, 250, 120], 32], [84, [ARKIN_X, 380, 1850], [ARKIN_X, 230, 120], 36]]) },
  { id: 's06', start: 84.0, end: 125.9, loc: 'hall', hero: ['RA', 'RB'], cam: null },
  { id: 's07', start: 125.9, end: 129.2, loc: 'hall', hero: ['RB'], cam: hermite([[125.9, [30, 410, 2250], [10, 160, 1580], 30], [129.2, [10, 390, 2100], [-40, 175, 1580], 29]]) },
  { id: 's08', start: 129.2, end: 159.0, loc: 'street', hero: ['BO'], cam: null },
  { id: 's09', start: 159.0, end: 176.0, loc: 'hall', hero: ['BO'], cam: null },
  { id: 's10', start: 176.0, end: 193.0, loc: 'hall', hero: ['BY'], cam: null },
  { id: 's11', start: 193.0, end: 211.0, wide: true, loc: 'hall', hero: ['M', 'BO', 'BY'], cam: null },
];
SHOTS.forEach((s, i) => { s.index = i; s.dur = s.end - s.start; s.t0 = s.start; });
const shotAt = t => SHOTS.find(s => t < s.end) || SHOTS[SHOTS.length - 1];
const posOf = id => { const f = ACT[id].fn(cur_t); return f ? [f.x, f.y, f.z] : null; };
let cur_t = 0;

// s04: camera follows chaos then the donkey pair
SHOTS[3].cam = t => {
  const grp = [['D1', 'D2', 'S3'], ['C1', 'C2', 'R1'], ['G1', 'G2', 'S4'], ['R2', 'S1', 'S2'], ['D1', 'D2', 'C1']];
  const cen = ids => { let x = 0, z = 0, n = 0; for (const id of ids) { const q = ACT[id].fn2(t); x += q.x; z += q.z; n++; } return [x / n, z / n]; };
  const wide = { p: [-700 + 60 * Math.sin(t * 0.7), 520, 3000], l: [-700, 140, 520], fov: 38 };
  const pans = (() => {
    const u = t - 45.2, seg = Math.max(0, Math.floor(u / 1.9)), f = u / 1.9 - seg, g0 = grp[seg % 4], g1 = grp[(seg + 1) % 4], wp = sm(cl((f - 0.8) / 0.2, 0, 1));
    const c0 = cen(g0), c1 = cen(g1), c = [lerp(c0[0], c1[0], wp), lerp(c0[1], c1[1], wp)], sw = lerp(0.35 * (seg % 2 ? -1 : 1), 0.35 * ((seg + 1) % 2 ? -1 : 1), wp);
    return { p: [c[0] + 900 * sw, 330 + 60 * Math.sin(seg), c[1] + 1500], l: [c[0], 150, c[1]], fov: 34 };
  })();
  const dn = (() => {
    const a = ACT.D1.fn2(t), b = ACT.D2.fn2(t), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, mz = (a.z + b.z) / 2, k = rise(t, 59.5, 62.5);
    return { p: [mx + lerp(650, 520, k), my + 190, mz + 1300], l: [mx + 120, my + 150 + 25 * k, mz - 40 * k], fov: 30 };
  })();
  const mixC = (A, B, u) => ({ p: lerp3(A.p, B.p, u), l: lerp3(A.l, B.l, u), fov: lerp(A.fov, B.fov, u) });
  if (t < 45.2) return mixC(wide, wide, 0);
  const toD = rise(t, 50.8, 53.4);
  return toD <= 0 ? pans : mixC(pans, dn, toD);
};
// s06: staged for the two rabbis; push-in, tilt up for the vision, then to the window, then back to the pair
SHOTS[5].cam = hermite([
  [84, [-200, 400, 2330], [0, 150, 1580], 30],
  [92, [-60, 410, 2260], [10, 155, 1580], 30],
  [97, [-30, 420, 2330], [10, 215, 1580], 32],
  [101, [0, 430, 2400], [0, 260, 1500], 34],
  [105, [0, 420, 2330], [0, 225, 1560], 32],
  [110.5, [40, 410, 2270], [0, 165, 1580], 31],
  [116, [60, 410, 2260], [0, 160, 1580], 30],
  [125.9, [30, 410, 2250], [10, 160, 1580], 30]]);
// s08: street tracking, crossroads close, door, flood
SHOTS[7].cam = hermite([
  [129.2, [SX - 2300, 330, 900], [SX - 1500, 230, 130], 30],
  [136.0, [SX - 780, 300, 760], [SX - 300, 250, 130], 28],
  [140.5, [SX - 560, 270, 640], [SX - 300, 260, 130], 28],
  [145.0, [SX + 40, 240, 700], [SX + 360, 220, -500], 30],
  [150.0, [SX + 360, 200, 330], [SX + 560, 230, -800], 30],
  [152.0, [SX + 470, 240, -300], [SX + 560, 250, -940], 30],
  [159.0, [SX + 470, 240, -300], [SX + 560, 250, -940], 30]]);
// the hall part of s08 (152-159) uses another camera
const camS8hall = hermite([[152, [-380, 320, 2500], [-60, 170, 1580], 30], [159, [-200, 300, 2330], [-60, 175, 1580], 29]]);
SHOTS[7].cam0 = SHOTS[7].cam;
SHOTS[7].cam = t => {
  if (t >= 152) return camS8hall(t);
  const f = ACT.BO.fn_st(Math.min(t, ACT.BO.t8 - 0.1)); const close = pulse(t, 134.5, 136.5, 140.5, 143.0);
  return { p: [f.x + 150 - 150 * close + 200 * rise(t, 143.5, 147), 300 - 30 * close, lerp(1250, 950, close) - 150 * rise(t, 143.5, 147)], l: [f.x + 40, 220 - 70 * close, f.z], fov: 30 };
};
// s09: slow orbit around the bochur
SHOTS[8].cam = t => {
  const u = (t - 159) / 17, a = lerp(0.72, -0.55, sm(u)), R = lerp(980, 800, u), c = [BOH.x, 150, BOH.z];
  return { p: [c[0] + Math.sin(a) * R, lerp(230, 320, u), c[2] + Math.cos(a) * R], l: [c[0], c[1] + lerp(0, 25, u), c[2]], fov: 30 };
};
// s10: high above the boy, swings down to eye level at 184-188, then holds on boy + man
SHOTS[9].cam = t => {
  const down = sm((t - 183.8) / 4.4), a = lerp(0.62, -0.05, down) , R = lerp(780, 1050, down), c = [BOYP.x + lerp(0, 60, down), lerp(110, 160, down), BOYP.z];
  const hy = lerp(700, 250, down), look = [c[0], lerp(90, 215, down), c[2]];
  const hold = rise(t, 189, 192);
  return { p: [c[0] + Math.sin(a) * R, hy, c[2] + Math.cos(a) * R], l: look, fov: 30 + 4 * Math.sin(Math.PI * down) };
};
// s11: from medium on the three to the wide, crane up and hold
SHOTS[10].cam = hermite([[193, [0, 300, 2300], [0, 120, 1500], 30], [198, [0, 340, 2420], [0, 140, 1400], 31], [203, [0, 480, 2680], [0, 200, 1000], 38], [207, [0, 650, 2800], [0, 150, 800], 46], [211, [0, 650, 2800], [0, 150, 800], 46]]);

/* ------------------------------------------------------------------ per-frame state application */
const _v = new THREE.Vector3(), _b = new THREE.Box3();
function applyEnv(t) {
  const e = E(t), loc = LOC(t);
  OUT.visible = loc === 'out' || loc === 'hall'; ARK.visible = loc === 'out'; ARK2.visible = loc === 'hall'; ARKIN.visible = loc === 'arkin'; HALL.visible = loc === 'hall'; STREET.visible = loc === 'street';
  // sky + overlay
  const dayTop = colK(t, [[0, '#9db4cc'], [12, '#6db8ea']]), dayBot = colK(t, [[0, '#f4e4d2'], [12, '#fdf2da']]);
  const stTop = new THREE.Color('#46546f'), stBot = new THREE.Color('#9aa0b8'), nTop = new THREE.Color('#141c3e'), nBot = new THREE.Color('#38477a');
  let top = dayTop.clone().lerp(stTop, e.storm), bot = dayBot.clone().lerp(stBot, e.storm);
  if (loc === 'street') { top = nTop.clone().lerp(new THREE.Color('#1f2a52'), 0.3); bot = nBot.clone(); }
  else if (e.night > 0) { top.lerp(nTop, e.night); bot.lerp(nBot, e.night); }
  if (e.vision > 0.01) { top.lerp(new THREE.Color('#f6d26a'), e.vision * 0.55); bot.lerp(new THREE.Color('#fff0b0'), e.vision * 0.7); }
  sky.material.uniforms.uTop.value.copy(top); sky.material.uniforms.uBot.value.copy(bot);
  let oc = new THREE.Color('#000'), oa = 0;
  if (loc === 'out') { oc = new THREE.Color('#1c2850'); oa = 0.3 * e.storm; }
  else if (loc === 'arkin') { oc = new THREE.Color('#ff9a30'); oa = 0.1; }
  else if (loc === 'hall') { oc = new THREE.Color('#ffa850'); oa = 0.09; if (e.night > 0.01) { oc = oc.clone().lerp(new THREE.Color('#101c48'), e.night * 0.7); oa = lerp(oa, 0.2, e.night); } }
  else { oc = new THREE.Color('#121c48'); oa = 0.34; }
  ovMat.uniforms.uC.value.copy(oc); ovMat.uniforms.uA.value = oa;
  // far clouds grey -> white
  farMat.uniforms.uColor.value.set('#ffffff').lerp(new THREE.Color('#aab3c2'), e.grey);
  // storm clouds
  stormClouds.forEach((c, i) => { const a = t * (0.16 + 0.02 * (i % 3)) + i * 0.45, R = 1100 + (i % 5) * 380; c.position.set(Math.cos(a) * R, 1250 + 160 * Math.sin(i * 1.3 + t * 0.4), -1100 + Math.sin(a) * R * 0.7); c.scale.setScalar(Math.max(0.001, (2.4 + (i % 3) * 0.7) * e.storm)); c.rotation.y = -a; });
  // leaves + wind arrows (OUT)
  leaves.forEach((l, i) => { const a = t * (1.1 + hash(i) * 0.9) + i * 2.4, R = 500 + hash(i + 9) * 1900, cx = Math.sin(t * 0.6 + i) * 300; l.visible = e.wind > 0.02; l.position.set(cx + Math.cos(a) * R, 120 + hash(i + 3) * 900 + 140 * Math.sin(t * 2.3 + i), 250 + Math.sin(a) * R * 0.45); l.rotation.set(t * 3 + i, a, t * 2.2 + i * 0.5); l.scale.setScalar(1.3); });
  const chaosK = pulse(t, 43.0, 44.5, 47.2, 48.8);
  arrows.forEach((a, i) => { const aa = t * 1.4 + i * 0.9, R = 700 + i * 160; a.visible = chaosK > 0.02; a.position.set(Math.sin(i * 2.3) * 900 + Math.cos(aa) * R * 0.4, 100 + (i % 3) * 120, 500 + Math.sin(aa) * R * 0.3); a.rotation.y = -aa * 1.2; a.scale.setScalar(Math.max(0.001, 1.5 * chaosK)); });
  windLines.visible = e.wind > 0.02; wMat.opacity = 0.75 * Math.min(1, e.wind);
  for (let i = 0; i < WN; i++) { const r3 = hash(i + 600), len = 180 + r3 * 260, x = ((hash(i) * 5600 + t * (2300 + r3 * 900)) % 5600) - 2800, y = 60 + hash(i + 300) * 900, z = -400 + hash(i + 900) * 2300, w = 30 * Math.sin(t * 4 + i);
    wPos[i * 6] = x; wPos[i * 6 + 1] = y; wPos[i * 6 + 2] = z; wPos[i * 6 + 3] = x + len; wPos[i * 6 + 4] = y + w; wPos[i * 6 + 5] = z; }
  wGeo.attributes.position.needsUpdate = true;
  rainbow.visible = e.rainbow > 0.01; rainbow.userData.mats.forEach(m => m.opacity = 0.9 * e.rainbow);
  sunGlow.material.opacity = 0.5 * e.rainbow;
  // street chaos seen from the window (blobs in the sky/air beyond the glass)
  const bk = pulse(t, 104.5, 106.0, 123.5, 125.8);
  blobs.forEach((b, i) => { b.visible = bk > 0.02; const a = t * (0.5 + hash(i) * 0.8) + i * 1.9; b.position.set(Math.sin(a * 1.3 + i) * 900, 200 + hash(i + 2) * 700 + 90 * Math.sin(t * 3 + i), -300 - hash(i + 5) * 1500 + 120 * Math.cos(a)); const f = 0.35 + 0.65 * (Math.sin(t * (4 + (i % 5) * 1.3) + i * 2) > -0.2 ? 1 : 0.15); b.scale.setScalar(Math.max(0.001, f * bk)); });
  squig.forEach((s, i) => { s.visible = bk > 0.02; s.position.set(-700 + i * 350 + 100 * Math.sin(t * 2 + i), 400 + i * 80 + 60 * Math.sin(t * 3 + i), -700 - i * 150); s.rotation.z = Math.sin(t * 1.5 + i) * 0.5; s.scale.setScalar(Math.max(0.001, bk)); });
  rainOut.userData.update(t, { x: 0, y: -100, z: -1000 }, e.rainWin * (loc === 'hall' ? 1 : 0), 0.35, { w: 2400, h: 1800, d: 2000 });
  rainStreet.userData.update(t, { x: STREET_X - 400, y: -100, z: 0 }, e.rainSt * (loc === 'street' ? 1 : 0), 0.3, { w: 2400, h: 1700, d: 1800 });
  // hall: casements open at the end; glass fades; staircase vision
  const open = rise(t, 193.5, 198.5);
  HALL_SET.userData.sashes.forEach(s => { s.hinge.rotation.y = s.s * -1.7 * open * (s.s > 0 ? -1 : -1) * -1; s.glass.visible = open < 0.05; });
  HALL_SET.userData.sashes.forEach(s => { s.hinge.rotation.y = (s.s > 0 ? 1 : -1) * 1.75 * open; });
  const vis = e.vision; STAIRS.userData.steps.forEach((m, i) => { const run = 0.5 + 0.5 * Math.sin(t * 5 - i * 0.55); m.material.opacity = m.geometry.parameters.height > 10 ? vis * (0.28 + 0.2 * run) : vis * (0.6 + 0.4 * run); });
  STAIRS.userData.glows.forEach((g, i) => g.material.opacity = vis * (i ? 0.45 : 0.9)); STAIRS.visible = false; STAIRS.userData.book.rotation.y = t * 0.6;
  HALL_SET.userData.lamps.forEach((l, i) => { l.rotation.z = 0.02 * Math.sin(t * 0.9 + i); });
  // flood
  water.position.set(0, -60 + 120 * e.flood, 0); water.visible = e.flood > 0.01;
  water.userData.crests.forEach((c, i) => { c.position.set(-1700 + hash(i) * 3400 + Math.sin(t * 0.8 + i) * 80, 6 + 10 * Math.sin(t * 2 + i), -700 + hash(i + 7) * 1500); c.rotation.z = Math.sin(t * 0.7 + i) * 0.4; c.scale.setScalar(0.6 + 0.5 * e.flood); });
  // street chaos at the crossroads
  const sk = pulse(t, 131, 133, 147, 150);
  blobsS.forEach((b, i) => { b.visible = sk > 0.02; const side = i % 2 ? 1 : -1, a = t * (0.7 + hash(i) * 0.9) + i; b.position.set(-100 + Math.sin(a) * 400 + (i % 4) * 30, 180 + hash(i + 4) * 420 + 70 * Math.sin(t * 3 + i), (side > 0 ? 300 + hash(i + 8) * 220 : -(500 + hash(i + 8) * 700)) + 80 * Math.cos(a)); const f = 0.4 + 0.6 * (Math.sin(t * (4 + (i % 5) * 1.3) + i * 2) > -0.1 ? 1 : 0.1); b.scale.setScalar(Math.max(0.001, f * sk)); });
  arrowsS.forEach((a, i) => { const side = i % 2 ? 1 : -1, aa = t * 1.5 + i; a.visible = sk > 0.02; a.position.set(-60 + 90 * Math.cos(aa), 120 + (i % 3) * 70, (side > 0 ? 420 + 30 * (i % 3) : -(600 + 80 * (i % 3)))); a.rotation.y = -aa; a.scale.setScalar(Math.max(0.001, 0.32 * sk)); });
  squigS.forEach((s, i) => { s.visible = sk > 0.02; s.position.set(-300 + i * 130, 260 + i * 70 + 50 * Math.sin(t * 3 + i), (i % 2 ? 260 + i * 20 : -(360 + i * 70))); s.rotation.y = Math.sin(t * 1.5 + i) * 0.8; s.scale.setScalar(Math.max(0.001, sk)); });
  // street door: closes behind the bochur at ~150.6-151.6
  const dOpen = pulse(t, 146.5, 148.0, 150.6, 151.8); STREET_SET.userData.door.rotation.y = -1.45 * dOpen;
  // glow rings
  const R1 = rise(t, 154.8, 156), ringK = (t >= 154 && t < 177) ? R1 * (1 - rise(t, 176, 177)) : 0;
  const setRing = (r, k) => { r.visible = k > 0.01; r.userData.mats[0].opacity = 0.75 * k; r.userData.mats[1].opacity = 0.16 * k; r.userData.mats[2].opacity = 0.2 * k; };
  setRing(ringBochur, ringK); ringBochur.position.set(BOH.x + 10, 150, 1665 - HZ); ringBochur.rotation.set(0, Math.PI / 2, 0); ringBochur.scale.setScalar(95);
  const rk = rise(t, 195.5, 198);
  [[-135, 1495], [135, 1490]].forEach((p, i) => { const r = ringHall[i]; setRing(r, rk); r.position.set(p[0], 150, p[1] - HZ); r.rotation.set(0, 0, 0); r.scale.set(122, 70, 122); });
  ringHall[2].visible = false;
  const spotC = [[-645, 150], [-215, 130], [225, 110], [645, 150]], ringY = [110, 85, 125, 62];
  pairRings.forEach((r, i) => { const on = rise(t, 70.5 + i * 0.8, 73 + i * 0.8) * (1 - rise(t, 83.8, 84.2)), bright = 1 + 0.8 * rise(t, 79.0, 80.5); setRing(r, Math.min(1.5, on * bright)); r.position.set(spotC[i][0], ringY[i], spotC[i][1]); r.rotation.set(0, 0, 0); r.scale.set(118, 72, 118); });
  // sparkles
  sparkles(sparklesIn, t, e => 0, 0);
  const spK = Math.max(pulse(t, 79.0, 80.0, 83.6, 84.0), 0.35 * rise(t, 71, 74) * (1 - rise(t, 83.8, 84.2)));
  sparklesIn.userData.items.forEach((m, i) => { const d = m.userData, ph = (t * 0.35 + d.a * 3) % 1; m.visible = spK > 0.02; m.position.set(-900 + d.b * 1800, 40 + ph * 520, 20 + d.c * 260); m.scale.setScalar((10 + 22 * d.d) * Math.sin(ph * Math.PI) * spK); m.rotation.z = t * (1 + d.a); m.material.opacity = spK * Math.sin(ph * Math.PI); m.quaternion.copy(cam.quaternion); m.rotateZ(t * (1 + d.a)); });
  const spH = Math.max(pulse(t, 195.5, 197, 205, 208), pulse(t, 156, 157, 170, 172) * 0.5);
  sparkHall.userData.items.forEach((m, i) => { const d = m.userData, ph = (t * 0.3 + d.a * 3) % 1; m.visible = spH > 0.02; const base = t < 180 ? [BOH.x, BOH.z] : [(d.b - 0.5) * 900, 1700]; m.position.set(base[0] + (d.b - 0.5) * 520, 80 + ph * 460, base[1] + (d.c - 0.5) * 160 - 20); m.scale.setScalar((9 + 20 * d.d) * Math.sin(ph * Math.PI) * spH); m.material.opacity = spH * Math.sin(ph * Math.PI); m.quaternion.copy(cam.quaternion); m.rotateZ(t * (1 + d.a)); });
  // hall props placement by time
  const bkOn = t >= 153.5 && t < 176 ;
  const early = t < 129.2; TABLE.position.z = early ? 830 : 940; GEM.visible = !(t >= 129.2 && t < 153.5) || bkOn; GEM.position.set(t >= 153.5 && t < 176 ? -60 : -40, 118, early ? 850 : 960);
  STACK.visible = true;
  // shtenders: SH1 for the bochur at the end (330,1720), SH2 (man) (0,1650), SH3 boy (-330,1720)
  SH1.position.set(270 + 22, 0, 1500 - 800); SH2.position.set(22, 0, 1480 - 800); SH3.position.set(-270 + 22, 0, 1500 - 800);
  SH1.rotation.y = -1.45 - Math.PI / 2 * 0 + 0; SH2.rotation.y = -1.55; SH3.rotation.y = -1.7;
  [SH1, SH2, SH3].forEach((s, i) => { s.visible = t >= 192.9; });
  TABLE2.position.set(BOYP.x + 10, 0, BOYP.z - HZ + 150); BENCH2.position.set(BOYP.x, 0, BOYP.z - HZ - 40); BKB.position.set(BOYP.x + 6, 80, BOYP.z - HZ + 150); BKB.rotation.y = Math.PI / 2;
  TABLE2.visible = BENCH2.visible = BKB.visible = t >= 175.5 && t < 193.3;
  // held books
  HELD.BO.visible = t >= 129.2 && t < 152; HELD.BY.visible = false; HELD.M.visible = false;
}
function sparkles() { }

function applyActors(t) {
  for (const id in ACT) {
    const A = ACT[id], st = A.fn(t);
    if (!st) { A.h.visible = false; continue; }
    A.h.visible = true; A.h.position.set(st.x, st.y, st.z); A.h.rotation.set(0, st.yaw, st.slope);
    if (A.person) A.o.set(st.po); else { A.o.pose(st.po); if (st.po.face) A.o.face.set(st.po.face); }
  }
}

/* ------------------------------------------------------------------ render + contract */
const camState = { p: [0, 0, 0], l: [0, 0, 0] };
function frame(t) {
  t = cl(t, 0, DUR); cur_t = t;
  const s = shotAt(t);
  applyEnv(t); applyActors(t);
  const c = s.cam(t);
  cam.fov = c.fov || 30; cam.updateProjectionMatrix(); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
  // small deterministic handheld breathing
  cam.updateMatrixWorld(true);
  sky.position.copy(cam.position);
  camState.p = c.p; camState.l = c.l;
  { const e = E(t), ve = e.vision; visMat.uniforms.uVis.value = Math.min(1, ve * 1.25); visMat.uniforms.uTime.value = t; visQuad.visible = ve > 0.01;
    const s6 = t < 130; visMat.uniforms.uCx.value = s6 ? 0.5 : 0.74; visMat.uniforms.uY0.value = s6 ? 0.2 : 0.14; visMat.uniforms.uY1.value = s6 ? 0.8 : 0.78; visMat.uniforms.uW.value = s6 ? 0.36 : 0.3;
    if (visQuad.visible) { if (s6) { holeFor('RA', 0); holeFor('RB', 1); visMat.uniforms.uH.value[2].set(0, 0, 0); } else { holeFor('BO', 0); visMat.uniforms.uH.value[1].set(0, 0, 0); visMat.uniforms.uH.value[2].set(0, 0, 0); } } }
  renderer.render(scene, cam);
}

/* warm every face variant that the film will ask for, so that __seek stays synchronous */
async function warm() {
  const seen = new Set(); const jobs = [];
  for (let k = 0; k <= DUR * 30; k++) {
    const t = k / 30; cur_t = t;
    for (const id in ACT) { const A = ACT[id]; let st; try { st = A.fn(t); } catch (e) { continue; } if (!st || !st.po.face) continue; const key = id + JSON.stringify(st.po.face); if (seen.has(key)) continue; seen.add(key); jobs.push([A, st.po.face]); }
  }
  for (const [A, f] of jobs) await (A.o.warm ? A.o.warm(f) : A.o.face.set(f));
  return jobs.length;
}

window.__ACT = ACT; window.__dur = DUR; window.__HQ = HQ; window.__errors = [];
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
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

(async () => {
  try {
    if (Q.has('nowarm')) { window.__nwarm = 0; } else window.__nwarm = await warm();
    frame(Q.has('t') ? +Q.get('t') : 0);
    window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
})();
