/* film_z core: renderer, scene, groups, cast, helpers shared by all shot modules. ASCII only. */
import { THREE, sm, cl, kf, D2R, frac, V, part, ell, tube, tubeAlong, lathe, toon } from '../../../lib/toon3d/toon3d.js';
import * as KT from '../../toldot07_kit/kit07.js';
import { makeRabbiA, makeBoy } from '../../haredi_cast/cast_people.js';
import * as W from './z_world.js';
export { THREE, sm, cl, kf, D2R, frac, V, part, ell, tube, tubeAlong, lathe, toon, KT, W };

export const Q = new URLSearchParams(location.search);
export const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
export const SW = HQ ? 1920 : 1280, SHH = HQ ? 1080 : 720;
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(SW, SHH, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);
export const scene = new THREE.Scene();
export const cam = new THREE.PerspectiveCamera(32, 16 / 9, 5, 60000);
export const sky = KT.makeSky({ palette: 'day' }); scene.add(sky);

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
/* camera that stays at p and turns its look direction around the vertical axis from yaw a0 to a1 (a=0 looks -z, +pi/2 looks +x) */
export function PAN(p, a0, a1, u, pitchY, dist) { const a = lerp(a0, a1, u); return { p, l: [p[0] + Math.sin(a) * (dist || 1500), pitchY, p[2] - Math.cos(a) * (dist || 1500)] }; }

/* ------------------------------------------------------------------ sky */
const SK = { day: ['#5fb3e6', '#9fd4f2', '#e2f3fb'], gold: ['#6a9fd6', '#f6cf98', '#ffe8b8'], dusk: ['#5a6cae', '#e8a07a', '#ffd9a0'], dry: ['#7fb6da', '#cfe3ea', '#f6eed2'], lab: ['#78bde8', '#b4dff4', '#eaf6fb'] };
export function skyTo(a, b, u) { const U = sky.material.uniforms; ['uTop', 'uMid', 'uHorz'].forEach((k, i) => U[k].value.copy(W.col(SK[a][i])).lerp(W.col(SK[b || a][i]), u || 0)); }

/* ------------------------------------------------------------------ groups + cast */
export const GB = new THREE.Group(), GM = new THREE.Group(), GZ = new THREE.Group(), GC = new THREE.Group(), GK = new THREE.Group();
scene.add(GB, GM, GZ, GC, GK);
export const R = makeRabbiA(), B = makeBoy();
scene.add(R.root, B.root);
export const GH = KT.makeGrain(); scene.add(GH.root);                                  // hero grain
export const GX = [0, 1, 2, 3, 4, 5].map(() => { const g = KT.makeGrain(); scene.add(g.root); return g; });   // extra grains
export const TI = [0, 1, 2].map(i => { const t = KT.makeTipa({ kind: i === 1 ? 'small' : 'tipa' }); scene.add(t.root); return t; });
export const GUST = KT.makeGust(); scene.add(GUST.root);
export const GULL = KT.makeGull(); scene.add(GULL.root);
export const ALL = [GB, GM, GZ, GC, GK, R.root, B.root, GH.root, ...GX.map(g => g.root), ...TI.map(t => t.root), GUST.root, GULL.root];
export function hideAll() { ALL.forEach(o => { o.visible = false; }); }
export function show(...o) { o.forEach(x => { (x.root || x).visible = true; }); }
export const handPos = (person, side) => { const v = new THREE.Vector3(); person.arms[side].wr.getWorldPosition(v); return [v.x, v.y, v.z]; };

/* rotate a vector (x,z) by heading psi (0 = +x, +pi/2 = -z): forward vector */
export const fwd = psi => [Math.cos(psi), -Math.sin(psi)];
/* walking person: distance d along heading psi from start; returns pose {x,z,ph} */
export function walkAlong(o, x0, z0, psi, d) { const f = fwd(psi); return { x: x0 + f[0] * d, z: z0 + f[1] * d, ph: d / o.cycle }; }

/* film_z additions: deep sky palette, camera in the scene (for the recap veil) */
SK.deep = ['#1f5f8f', '#2b7fae', '#4aa0c4']; SK.sunset = ['#3f5d9c', '#e48a6a', '#ffd28a']; SK.late = ['#2d3f7c', '#c2708a', '#f4b27a'];
scene.add(cam);
