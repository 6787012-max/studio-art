/* film_d core: renderer, scene, groups, cast, helpers shared by all shot modules. ASCII only. */
import { THREE, sm, cl, kf, D2R, frac, V, part, ell, tube, tubeAlong, lathe, toon } from '../../../lib/toon3d/toon3d.js';
import * as KT from '../../toldot07_kit/kit07.js';
import { makeRabbiA, makeBoy } from '../../haredi_cast/cast_people.js';
export { THREE, sm, cl, kf, D2R, frac, V, part, ell, tube, tubeAlong, lathe, toon, KT };

export const Q = new URLSearchParams(location.search);
export const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
export const SW = HQ ? 1920 : 1280, SHH = HQ ? 1080 : 720;
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(SW, SHH, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);
export const scene = new THREE.Scene();
export const cam = new THREE.PerspectiveCamera(32, 16 / 9, 5, 90000);
export const sky = KT.makeSky({ palette: 'day' }); scene.add(sky); scene.add(cam);
export const { M, box, rockGeo, rng, makeShadow } = KT;
export const col = h => new THREE.Color(h);
export const G = (parent, pos) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); if (parent) parent.add(g); return g; };

/* ------------------------------------------------------------------ helpers */
export const ease = (t, a, b) => sm(cl((t - a) / (b - a), 0, 1));
export const lin = (t, a, b) => cl((t - a) / (b - a), 0, 1);
export const blinkAt = (t, o) => frac(t / 3.3 + (o || 0)) < 0.045;
export const lerp = (a, b, u) => a + (b - a) * u;
export const lerp3 = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
export const flags = { collect: false };
export const POST = [];        // callbacks run after the camera is placed (billboards)
const seen = new Set(), jobs = []; let IDN = 0;
export function fs(o, st) {           // face state: collected during warm-up, applied otherwise
  if (flags.collect) { if (o.__i == null) o.__i = ++IDN; const k = o.__i + JSON.stringify(st); if (!seen.has(k)) { seen.add(k); jobs.push([o, st]); } } else o.face.set(st);
}
export async function warmFaces() { const n = jobs.length; for (const [o, st] of jobs) await o.face.set(st); return n; }
export function pose(o, po, y) { if (flags.collect) return; o.pose(po); if (y != null) o.root.position.y = y; }
export const talkL = (t, a, b) => (t > a && t < b && frac(t * 0.8) < 0.75) ? 'AEOXUM'[Math.floor(t * 9) % 6] : null;
export const talkG = (t, a, b) => (t > a && t < b && frac(t * 0.8) < 0.75) ? 'AEOX'[Math.floor(t * 8) % 4] : null;

/* camera setups: list of {t0,t1,p,p1?,l,l1?,f,f1?,lin?} in shot-local time; returns {p,l,fov} */
export function CAMS(lt, list) {
  let s = list[list.length - 1]; for (const c of list) if (lt < c.t1) { s = c; break; }
  const u0 = lin(lt, s.t0, s.t1), u = s.lin ? u0 : sm(u0);
  return { p: lerp3(s.p, s.p1 || s.p, u), l: lerp3(s.l, s.l1 || s.l, u), fov: lerp(s.f || 32, s.f1 == null ? (s.f || 32) : s.f1, u) };
}

/* ------------------------------------------------------------------ sky */
const SK = { day: ['#5fb3e6', '#9fd4f2', '#e2f3fb'], morning: ['#7fb2dc', '#f4d7a8', '#ffe9c4'], gold: ['#6a9fd6', '#f6cf98', '#ffe8b8'], dusk: ['#4a5aa0', '#d9908a', '#f7c890'], clear: ['#4aa8e6', '#8fd0f2', '#d8f0fb'], deep: ['#1f5f8f', '#2b7fae', '#4aa0c4'] };
export function skyTo(a, b, u) { const U = sky.material.uniforms; ['uTop', 'uMid', 'uHorz'].forEach((k, i) => U[k].value.copy(col(SK[a][i])).lerp(col(SK[b || a][i]), u || 0)); }

/* ------------------------------------------------------------------ groups + cast */
export const GA = G(scene), GH = G(scene), GL = G(scene), GY = G(scene), GN = G(scene), GJ = G(scene), GC = G(scene), GU = G(scene), GP = G(scene), GM = G(scene), GI = G(scene), GR = G(scene);
export const R = makeRabbiA(), B = makeBoy();
scene.add(R.root, B.root);
export const TI = ['tipa', 'foam', 'small', 'big'].map(k => { const t = KT.makeTipa({ kind: k }); scene.add(t.root); return t; });
export const GULLS = [0, 1, 2, 3].map(() => { const g = KT.makeGull(); scene.add(g.root); return g; });
export const FISH = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const f = KT.makeFish(); scene.add(f.root); return f; });
export const ALL = [GA, GH, GL, GY, GN, GJ, GC, GU, GP, GM, GI, GR, R.root, B.root, ...TI.map(t => t.root), ...GULLS.map(t => t.root), ...FISH.map(t => t.root)];
export function hideAll() { ALL.forEach(o => { o.visible = false; }); }
export function show(...o) { o.forEach(x => { (x.root || x).visible = true; }); }
export const handPos = (person, side) => { const v = new THREE.Vector3(); person.arms[side].wr.getWorldPosition(v); return [v.x, v.y, v.z]; };
export const fwd = psi => [Math.cos(psi), -Math.sin(psi)];
export function walkAlong(o, x0, z0, psi, d) { const f = fwd(psi); return { x: x0 + f[0] * d, z: z0 + f[1] * d, ph: d / o.cycle }; }
export const bFace = (T, st, off) => Object.assign({ expr: 'smile', blink: blinkAt(T, off || 0.6), look: [0, 0] }, st);
export const rFace = (T, st) => Object.assign({ expr: 'smile', blink: blinkAt(T, 0.1), look: [0, 0] }, st);

/* ------------------------------------------------------------------ small shared builders */
export function makeLabel(text, wU, hU, px) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * hU / wU);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wU, hU), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.renderOrder = 30;
  m.userData.set = (txt, o) => {
    o = o || {}; const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
    c.font = '900 ' + (o.px || px || 150) + 'px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = (o.px || px || 150) * 0.17; c.strokeStyle = '#261c19'; c.strokeText(txt, cv.width / 2, cv.height / 2 + 6);
    c.fillStyle = o.fill || '#fff7d6'; c.fillText(txt, cv.width / 2, cv.height / 2 + 6); tex.needsUpdate = true;
  };
  m.userData.set(text);
  return m;
}
/* hull from a side profile (copied from kit07: not exported there) */
export function hullGeo(L, Hh, w, o) {
  o = Object.assign({ sheer: 0.25, bow: 0.5, stern: 0.35, pinch: 2.2 }, o || {});
  const s = new THREE.Shape(), h2 = L / 2;
  s.moveTo(-h2 * 0.86, 0); s.quadraticCurveTo(0, -Hh * 0.18, h2 * 0.8, 0);
  s.quadraticCurveTo(h2 * 1.0, Hh * 0.4, h2 * (1 + o.bow * 0.12), Hh * (1 + o.sheer));
  s.quadraticCurveTo(0, Hh * 0.92, -h2 * (1 + o.stern * 0.1), Hh * (1 + o.sheer * 0.8));
  s.quadraticCurveTo(-h2, Hh * 0.4, -h2 * 0.86, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, curveSegments: 20, steps: 8 });
  g.translate(0, 0, -w / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), u = Math.min(1, Math.abs(x) / (h2 * 1.08)); const k = Math.pow(Math.max(0.02, 1 - Math.pow(u, o.pinch)), 0.55) * (0.72 + 0.28 * Math.min(1, y / Hh + 0.2)); p.setZ(i, z * k); }
  g.computeVertexNormals(); return g;
}
/* soft radial halo billboard (use sparingly) */
export function makeHalo(sz, color, op) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'), g = c.createRadialGradient(64, 64, 2, 64, 64, 62);
  const cc = col(color || '#ffe9a0'), r = Math.round(cc.r * 255), gg = Math.round(cc.g * 255), b = Math.round(cc.b * 255);
  g.addColorStop(0, `rgba(${r},${gg},${b},${op == null ? 0.55 : op})`); g.addColorStop(1, `rgba(${r},${gg},${b},0)`); c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide })); m.renderOrder = 35; return m;
}
export function makeSparkle(sz, color) {
  const g = G(), s = new THREE.Shape(); const Rr = 1, r = 0.22;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r : Rr; if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } s.closePath();
  const geo = new THREE.ShapeGeometry(s); geo.scale(sz, sz, 1);
  const mat = new THREE.MeshBasicMaterial({ color: col(color || '#fffbe0'), side: THREE.DoubleSide, depthWrite: false, transparent: true }); mat.depthTest = false;
  const m = new THREE.Mesh(geo, mat); m.renderOrder = 40; g.add(m); g.userData.mat = mat; g.userData.mesh = m; return g;
}
const _o = new THREE.Object3D();
export function makeParticles(n, color, geo) {
  const mesh = new THREE.InstancedMesh(geo || new THREE.SphereGeometry(1, 6, 5), new THREE.MeshBasicMaterial({ color: col(color) }), n);
  mesh.frustumCulled = false; mesh.count = n;
  const api = { mesh, n, set(i, x, y, z, s) { _o.position.set(x, y, z); _o.scale.setScalar(Math.max(s, 0.0001)); _o.updateMatrix(); mesh.setMatrixAt(i, _o.matrix); }, hide(i) { api.set(i, 0, -9999, 0, 0.0001); }, commit() { mesh.instanceMatrix.needsUpdate = true; } };
  for (let i = 0; i < n; i++) api.hide(i); api.commit();
  return api;
}
export const wob = (t, a, f, p) => a * Math.sin(t * f + (p || 0));
