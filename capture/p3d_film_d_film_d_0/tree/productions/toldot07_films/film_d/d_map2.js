/* film_d: map extras - port markers (Haifa bay arc, Ashdod long breakwater), the gate of the land, goods flowing in. ASCII only. */
import { THREE, sm, cl, frac, V, part, ell, tubeAlong, KT, M, box, G, col, GM, lerp, ease, flags } from './d_core.js';
import { L, setDots, setBoxes, setPin, setRing, pinN, pinS } from './d_map.js';

const rockM = M('#8a857c', '#b9b0c4'), shipM = [M('#ffffff', '#c9c6d8'), M('#d9534f', '#b08a9a'), M('#2e86c1', '#b0a8c4')];
function pts(a) { return a.map(([lo, la]) => { const p = L(lo, la, 6); return V(p[0], p[1], p[2]); }); }
function miniShips(g, list) { return list.map(([lo, la, ry], i) => { const s = G(g), p = L(lo, la, 3); s.position.set(p[0], p[1], p[2]); s.rotation.y = ry; box(s, 14, 4, 6, shipM[i % 3], [0, 3, 0], 1.2, null, 1.5); box(s, 5, 5, 5, M('#ffffff', '#c9c6d8'), [-4, 7, 0], 1, null, 1); return s; }); }
export const haifaPort = (() => { const g = G(GM);
  part(g, tubeAlong(pts([[35.02, 32.85], [34.97, 32.87], [34.93, 32.84], [34.92, 32.79]]), 3.4, { segs: 24, radial: 8 }), rockM, 1.6);
  g.userData.ships = miniShips(g, [[34.98, 32.82, 0.3], [34.955, 32.8, 1.1], [34.96, 32.84, 2.0]]); g.visible = false; return g; })();
export const ashdodPort = (() => { const g = G(GM);
  part(g, tubeAlong(pts([[34.62, 31.81], [34.53, 31.83], [34.5, 31.88], [34.5, 31.95]]), 3.6, { segs: 24, radial: 8 }), rockM, 1.6);
  g.userData.ships = miniShips(g, [[34.57, 31.86, 0.4], [34.55, 31.9, 1.4], [34.58, 31.83, 2.3]]); g.visible = false; return g; })();
export function mapReset() { setGate(0, 0); setDots(0, 0); setBoxes(0, 0); setPin(pinN, [0, 0, 0], 0, 0); setPin(pinS, [0, 0, 0], 0, 0); setRing(0, 0, 1, 0); portsTick(0, 0, 0); }
export function portsTick(T, a, b) { [[haifaPort, a], [ashdodPort, b]].forEach(([g, k]) => { g.visible = k > 0.01; g.scale.setScalar(Math.max(0.01, k)); g.userData.ships.forEach((s, i) => { s.position.y += 0; s.rotation.y += 0; }); }); }
/* the gate of the land (a big golden frame on the coast) and boxes that flow through it from the sea */
export const gateG = (() => { const g = G(GM), gold = M('#f2c040', '#c9a030'), p0 = L(34.67, 31.98, 0);
  g.position.set(p0[0], p0[1], p0[2]);
  for (const z of [-24, 24]) box(g, 9, 54, 9, gold, [0, 27, z], 2, null, 3); box(g, 10, 10, 66, gold, [0, 58, 0], 2, null, 3); part(g, new THREE.TorusGeometry(24, 4, 8, 16, Math.PI).rotateY(Math.PI / 2), gold, 1.8, [0, 54, 0]);
  g.visible = false; return g; })();
const flow = []; for (let i = 0; i < 16; i++) flow.push(box(GM, 11, 7, 7, M(['#d9534f', '#2e86c1', '#f0ad4e', '#5cb85c', '#8e6c8a'][i % 5], '#b0a8c4', 0), [0, 0, 0], 1.2, null, 1));
export function setGate(k, t) { gateG.visible = k > 0.01; gateG.scale.setScalar(Math.max(0.01, k)); const p0 = L(34.67, 31.98, 0);
  flow.forEach((b, i) => { b.visible = k > 0.5; const u = frac(t * 0.22 + i / 16), x = lerp(p0[0] - 260, p0[0] + 230, u); const lat = (i % 4 - 1.5) * 9; b.position.set(x, L(34.67, 31.98, 0)[1] + 12 + 3 * Math.abs(Math.sin(t * 5 + i)), p0[2] + lat); }); }
