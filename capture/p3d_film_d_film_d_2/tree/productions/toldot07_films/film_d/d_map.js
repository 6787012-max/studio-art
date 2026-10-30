/* film_d: relief map of the Mediterranean (GM) with glow rings, coast dots, port pins and a line of containers. ASCII only. */
import { THREE, sm, cl, frac, V, part, ell, tube, lathe, toon, KT, M, box, rng, G, col, GM, makeHalo, lerp, ease, lin, flags } from './d_core.js';

export const MAP = KT.makeMedMap({ lat0: 24, segZ: 240 }); GM.add(MAP.root);
export const L = (lon, lat, up) => MAP.lonlat(lon, lat, up);
const COASTLL = [[35.0, 32.83], [34.95, 32.62], [34.9, 32.46], [34.82, 32.1], [34.74, 31.9], [34.64, 31.75], [34.52, 31.6], [34.4, 31.45], [34.3, 31.33]];
export const coastCurve = new THREE.CatmullRomCurve3(COASTLL.map(([lo, la]) => { const p = L(lo - 0.07, la, 7); return V(p[0], p[1], p[2]); }));
export const HAIFA = L(35.03, 32.82, 0), ASHDOD = L(34.62, 31.8, 0);

/* glow ring + soft halo (Haifa bay) */
const gold = new THREE.MeshBasicMaterial({ color: col('#ffd23a'), transparent: true, opacity: 0.95 });
export const ring = (() => { const g = G(GM); part(g, new THREE.TorusGeometry(1, 0.11, 8, 48).rotateX(Math.PI / 2), gold, 0); const h = makeHalo(2.8, '#ffe070', 0.65); h.rotation.x = -Math.PI / 2; h.material.depthTest = true; h.renderOrder = 5; g.add(h); g.userData.halo = h; return g; })();
export function setRing(x, z, r, k, t) { ring.visible = k > 0.01; ring.position.set(x, 12, z); const s = r * (1 + 0.09 * Math.sin((t || 0) * 5)); ring.scale.setScalar(Math.max(0.01, s * Math.min(1, k * 1.5))); ring.userData.halo.material.opacity = 0.55 + 0.2 * Math.sin((t || 0) * 5); }

/* dots along the coast */
const DOTN = 46, dots = [];
for (let i = 0; i < DOTN; i++) { const m = part(GM, ell(3.2, 3.2, 3.2, 10, 8), new THREE.MeshBasicMaterial({ color: col('#ffe46a') }), 0); dots.push(m); }
export function setDots(amount, t) { dots.forEach((d, i) => { const u = i / (DOTN - 1), on = u <= amount; d.visible = on; if (!on) return; const p = coastCurve.getPointAt(u); d.position.set(p.x, p.y + 1.5 * Math.sin(t * 6 + i), p.z); d.scale.setScalar(1 + 0.35 * Math.sin(t * 7 - i * 0.5)); }); }

/* pins */
function makePin(c) { const g = G(GM); const m = M(c, '#c9a0a0'); part(g, new THREE.ConeGeometry(5, 26, 14).rotateX(Math.PI).translate(0, 13, 0), m, 1.4); part(g, ell(8, 8, 8, 14, 10), m, 1.6, [0, 32, 0]); part(g, ell(3, 3, 3, 8, 6), M('#ffffff', '#ffffff', 0), 0, [-2, 35, 4]); g.visible = false; return g; }
export const pinN = makePin('#e0453a'), pinS = makePin('#2e86c1');
export function setPin(p, at, k, t) { p.visible = k > 0.01; if (!p.visible) return; const e = k + 0.25 * Math.sin(Math.PI * Math.min(1, k)) * (1 - k); p.scale.setScalar(Math.max(0.01, 1.3 * e)); p.position.set(at[0], at[1] + 2 + 3 * Math.sin(t * 4 + at[0]), at[2]); }

/* containers on the map: a line from the south pin to the north pin */
const CN = 40, cmat = ['#d9534f', '#2e86c1', '#f0ad4e', '#5cb85c', '#8e6c8a', '#e8e8e8'].map(c => M(c, '#b0a8c4', 0)), cbox = [];
for (let i = 0; i < CN; i++) cbox.push(box(GM, 11, 6, 6, cmat[i % 6], [0, 0, 0], 1, null, 1));
export function setBoxes(amount, t) { cbox.forEach((b, i) => { const u = i / (CN - 1), on = u <= amount; b.visible = on; if (!on) return; const p = coastCurve.getPointAt(1 - u); const tg = coastCurve.getTangentAt(1 - u); b.position.set(p.x - 2, 8 + Math.abs(Math.sin(t * 3 + i)) * 1.5, p.z); b.rotation.y = Math.atan2(tg.x, tg.z) + Math.PI / 2; b.scale.setScalar(1.1); }); }
export function mapTick(T) { if (flags.collect) return; MAP.update(T); }
