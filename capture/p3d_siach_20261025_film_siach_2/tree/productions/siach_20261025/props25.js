// props25.js - siach 25/10/2026 (choosing to grow). Looks, hall wrapper, notes, envelopes, booth, kitchen bits. No letters/numbers anywhere. Pure functions of t.
import { THREE, box, cyl, ball, mesh, toon, ink, canvasTex, rng, clamp, lerp, ease, prog } from '../../lib/stage3d.js';
import * as S from './shared.js';
import * as K from './kit.js';
import { buildShul } from './shul.js';

export const PI = Math.PI, C = h => new THREE.Color(h);
export const GOLDE = 0xF5B820, GREENE = 0x5CAA4A, GREY = 0x8A9099, PAPER = 0xFFF8E6;

// ---------------- looks (kippa forced by the engine on every figure) ----------------
export const BOY = { kind: 'boy', coat: '#F7F6F2', skin: '#f0d2b4', pants: '#1B1D24', hat: 'kippa', hatColor: '#2A4A8A', beardLen: 0 };
export const LONELY = { kind: 'boy', coat: '#EEF1F4', skin: '#e2b896', pants: '#2A2E3A', hat: 'kippa', hatColor: '#E8E0C8', beardLen: 0 };
export const TEACHER = { coat: '#1d1d24', skin: '#efcfb0', pants: '#15151c', hat: 'kippa', hatColor: '#2A4A8A', beard: '#2a2018', beardLen: .25, vest: false };
export const DRIVER = { coat: '#1d1d24', skin: '#efcfb0', pants: '#15151c', hat: 'kippa', hatColor: '#2A4A8A', beard: '#2a2018', beardLen: .2, vest: false };
const SHIRTS = ['#F7F6F2', '#EEF1F4', '#F4EFE4', '#E9EEF4'];
export const bl = i => Object.assign({}, S.boyLook(i + 2), { coat: SHIRTS[i % 4], hatColor: i % 3 === 0 ? '#E8E0C8' : (i % 3 === 1 ? '#2A4A8A' : '#5AA0E8') });

// ---------------- seat slots: idx = table*10 + side*5 + zi ; table 0 = x -5.4, 1 = x +5.4 ----------------
export const SLOT = [];
for (const tx of [-5.4, 5.4]) for (const side of [-1, 1]) for (const z of [-2.4, -1.2, 0, 1.2, 2.4]) SLOT.push({ x: tx + side * .88, z, f: side > 0 ? -PI / 2 : PI / 2 });
export const SEATY = .15;
export function seatedBoys(Wd, list, o) {
  o = o || {}; return list.map((idx, k) => { const s = SLOT[idx];
    return S.man(Wd, bl(idx + (o.shift || 0)), t => ({ pos: [s.x, SEATY, s.z], facing: s.f, sit: true, groundY: 0, gesture: (k + idx) % 5 === 0 ? 'think' : 'rest', smile: .45, seed: .2 + idx * .037, look: .5 * Math.sin(t * .5 + idx) })); });
}
export function heroGroup(Wd, parts) { const g = new THREE.Group(); Wd.add(g); for (const p of parts) g.add(p.group || p); return g; }
export function proxy(Wd, c, d) { const m = new THREE.Mesh(new THREE.BoxGeometry(d[0], d[1], d[2]), new THREE.MeshBasicMaterial({ visible: false })); m.position.set(c[0], c[1], c[2]); Wd.add(m); return m; }

// ---------------- hall: shul + big table + bima ----------------
export function hall(Wd, o) {
  o = o || {}; const Hl = buildShul(Wd, {});
  const bt = new THREE.Group(); Wd.add(bt);
  bt.add(box(2.8, .08, 1.5, 0xB98A5A, { pos: [0, .78, -.8] }));
  for (const dx of [-1.25, 1.25]) for (const dz of [-1.4, -.2]) bt.add(box(.08, .74, .08, 0x7a4a2a, { pos: [dx, .4, dz], ink: false }));
  // bima (platform + lectern)
  Wd.add(box(3.2, .2, 1.9, 0xC9A06A, { pos: [0, .1, 4.75] }));
  Wd.add(box(1.0, .9, .6, 0xB98A5A, { pos: [0, .65, 4.3] })); Wd.add(box(1.1, .05, .7, 0x9A6A3C, { pos: [0, 1.12, 4.3], rot: [.12, 0, 0] }));
  Hl.stool = () => Wd.add(cyl(.22, .22, .45, 0x6F8F5A, { pos: [0, .225, -1.95], inkW: .02 }));
  Hl.glow = (k, nk) => Hl.WIN.forEach((_, i) => Hl.setWin(i, i % 2 === 0 ? k : 0, i % 2 ? (nk === undefined ? k : nk) : 0));
  return Hl;
}
export function teacher(Wd, fn) { const Tp = S.man(Wd, TEACHER, t => Object.assign({ pos: [0, .2, 4.95], facing: PI, groundY: .2, smile: .4, seed: .3 }, fn(t))); K.hatOn(Wd, Tp); return Tp; }

// ---------------- notes (plain cards + one coloured icon, no letters) ----------------
function icon(kind, col) {
  const g = new THREE.Group(), m = () => new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
  if (kind === 0) { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = PI / 2 + i * PI / 5, r = i % 2 ? .02 : .045; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } sh.closePath(); g.add(new THREE.Mesh(new THREE.ShapeGeometry(sh), m())); }
  else if (kind === 1) { const sh = new THREE.Shape(); sh.moveTo(0, -.04); sh.bezierCurveTo(-.07, .01, -.04, .06, 0, .025); sh.bezierCurveTo(.04, .06, .07, .01, 0, -.04); g.add(new THREE.Mesh(new THREE.ShapeGeometry(sh), m())); }
  else if (kind === 2) { g.add(new THREE.Mesh(new THREE.CircleGeometry(.045, 20), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }))); g.add(new THREE.Mesh(new THREE.RingGeometry(.038, .048, 20), m())); const a = new THREE.Mesh(new THREE.PlaneGeometry(.006, .034), m()); a.position.set(0, .017, .001); g.add(a); const b = new THREE.Mesh(new THREE.PlaneGeometry(.026, .006), m()); b.position.set(.013, 0, .001); g.add(b); }
  else if (kind === 3) { const a = new THREE.Mesh(new THREE.PlaneGeometry(.085, .06), m()); g.add(a); const b = new THREE.Mesh(new THREE.PlaneGeometry(.07, .045), new THREE.MeshBasicMaterial({ color: 0xFFFFFF })); b.position.z = .001; g.add(b); const c = new THREE.Mesh(new THREE.PlaneGeometry(.006, .06), m()); c.position.z = .002; g.add(c); }
  else if (kind === 4) { const p = new THREE.Mesh(new THREE.CircleGeometry(.028, 16), m()); p.position.y = -.01; g.add(p); for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(.011, .035), m()); f.position.set(-.024 + i * .016, .025, 0); g.add(f); } }
  else { const s = new THREE.Mesh(new THREE.PlaneGeometry(.008, .06), m()); s.position.y = -.01; g.add(s); for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.CircleGeometry(.024, 14), m()); l.scale.set(1.4, .8, 1); l.position.set(sx * .026, .028, 0); l.rotation.z = sx * .5; g.add(l); } }
  g.position.z = .006; return g;
}
export function note(kind, col, strip) {
  const g = new THREE.Group(); g.add(box(.2, .14, .008, PAPER, { inkW: .004 }));
  const st = new THREE.Mesh(new THREE.PlaneGeometry(.2, .018), new THREE.MeshBasicMaterial({ color: strip === undefined ? col : strip })); st.position.set(0, -.061, .0045); g.add(st);
  g.add(icon(kind % 6, col)); return g;
}
export const ICOL = [0xF5B820, 0xE8453C, 0x3C7FD8, 0x5CAA4A, 0xF28A30, 0x8A5AC8];

// ---------------- envelope (standing, open at the top) ----------------
export function envelope(col, dark) {
  const g = new THREE.Group(); g.add(box(.30, .22, .05, col, { pos: [0, .11, 0], inkW: .008 }));
  g.add(box(.30, .13, .012, dark, { pos: [0, .065, .03], inkW: .006 })); g.add(box(.30, .02, .06, dark, { pos: [0, .225, 0], ink: false }));
  g.userData.top = .22; return g;
}
export function ballotBox(open) {
  const g = new THREE.Group(); const c = 0xB98A5A;
  if (!open) { g.add(box(.5, .5, .4, c, { pos: [0, .25, 0] })); g.add(box(.24, .014, .035, 0x3A2A12, { pos: [0, .508, 0], ink: false })); }
  else { g.add(box(.5, .02, .4, c, { pos: [0, .01, 0] })); for (const sx of [-1, 1]) g.add(box(.02, .3, .4, c, { pos: [sx * .24, .15, 0] })); for (const sz of [-1, 1]) g.add(box(.5, .3, .02, c, { pos: [0, .15, sz * .19] })); const lid = box(.5, .02, .4, 0x9A6A3C, { pos: [0, .46, -.28], rot: [-1.2, 0, 0] }); g.add(lid); }
  return g;
}
export function glassCup() { const g = new THREE.Group(); const m = toon(0xCFE8F8, { transparent: true, opacity: .62 }); const c = new THREE.Mesh(new THREE.CylinderGeometry(.045, .036, .09, 16, 1, true), m); c.material.side = THREE.DoubleSide; c.position.y = .045; g.add(c);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(.036, .036, .008, 16), m); b.position.y = .004; g.add(b); const r = new THREE.Mesh(new THREE.TorusGeometry(.045, .003, 6, 20), new THREE.MeshBasicMaterial({ color: 0xFFFFFF })); r.rotation.x = PI / 2; r.position.y = .09; g.add(r); return g; }
export function openBook() { const g = new THREE.Group(); for (const s of [-1, 1]) { g.add(box(.17, .015, .22, 0xD84A3C, { pos: [s * .085, 0, 0], rot: [0, 0, -s * .1], inkW: .004 })); g.add(box(.15, .018, .2, 0xFFF8E6, { pos: [s * .085, .01, 0], rot: [0, 0, -s * .1], ink: false })); } return g; }
