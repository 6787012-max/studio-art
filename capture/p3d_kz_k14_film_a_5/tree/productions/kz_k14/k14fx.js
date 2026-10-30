// k14fx.js - props and composite sets for kz_k14. No characters, no faces, no text (digits only on one board).
import { THREE, COL, PI, sm, sin, cos, bx, cy, bl, mm, bm, grp, rng, clamp, lerp, ease, prog, canvasTex, glowSprite, sparkle, rrShape, dayRibbon, betHouse, dotObj } from './k14lib.js';

const ENTC = [COL.coral, COL.sky, COL.lilac, COL.leaf, COL.peach, COL.coral];
// ---------- entertainment items (origin bottom centre, ~1.3 high) ----------
export function giftBox(c, c2) { const g = new THREE.Group(); c2 = c2 || COL.cream;
  g.add(bx(.95, .8, .95, c, { pos: [0, .4, 0] })); g.add(bx(1.0, .16, 1.0, c2, { pos: [0, .8, 0], inkW: .01 })); g.add(bx(.2, .82, 1.0, c2, { pos: [0, .4, 0], ink: false })); g.add(bx(1.0, .82, .2, c2, { pos: [0, .4, 0], ink: false }));
  g.add(bl(.2, c2, { scale: [1.5, .75, .7], pos: [-.2, .98, 0], rot: [0, 0, .5], inkW: .01 })); g.add(bl(.2, c2, { scale: [1.5, .75, .7], pos: [.2, .98, 0], rot: [0, 0, -.5], inkW: .01 })); return g; }
export function suitcase(c) { const g = new THREE.Group(); c = c || COL.sky;
  g.add(bx(1.4, .95, .5, c, { pos: [0, .55, 0] })); for (const x of [-.45, .45]) g.add(bx(.12, .97, .52, COL.tealD, { pos: [x, .55, 0], ink: false }));
  g.add(mm(new THREE.TorusGeometry(.2, .045, 8, 16, PI), COL.woodD, { pos: [0, 1.03, 0], inkW: .01 })); g.add(bx(.18, .1, .06, COL.cream, { pos: [-.2, .85, .27], inkW: .008 })); g.add(bx(.18, .1, .06, COL.cream, { pos: [.2, .85, .27], inkW: .008 }));
  g.add(cy(.07, .07, .52, COL.woodD, { pos: [-.5, .04, 0], rot: [PI / 2, 0, 0], ink: false })); return g; }
export function filmReel(c) { const g = new THREE.Group(); c = c || COL.lilac;
  g.add(cy(.65, .65, .2, c, { pos: [0, .75, 0], rot: [PI / 2, 0, 0] }));
  for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2; g.add(cy(.12, .12, .22, COL.mint, { pos: [Math.sin(a) * .38, .75 + Math.cos(a) * .38, 0], rot: [PI / 2, 0, 0], inkW: .008 })); }
  g.add(cy(.14, .14, .26, COL.cream, { pos: [0, .75, 0], rot: [PI / 2, 0, 0], inkW: .01 })); g.add(bx(.7, .1, .5, COL.tealD, { pos: [0, .05, 0] })); g.add(bx(.12, .35, .12, COL.tealD, { pos: [0, .25, 0] })); return g; }
export function ticketStub(c) { const g = new THREE.Group(); c = c || COL.peach;
  g.add(bx(1.2, .6, .08, c, { pos: [0, .7, 0], rot: [0, 0, .12] })); g.add(bx(.14, .55, .1, COL.cream, { pos: [.25, .7, 0], rot: [0, 0, .12], ink: false }));
  for (const s of [-1, 1]) g.add(bl(.1, COL.cream, { pos: [s * .6 - s * .02, .7 + s * .07, 0], scale: [1, 1, .5], ink: false }));
  g.add(bx(.12, .35, .12, COL.teal, { pos: [0, .2, 0] })); return g; }
export function musicNote(c) { const g = new THREE.Group(); c = c || COL.leaf;
  g.add(bl(.3, c, { scale: [1.25, .85, .8], pos: [-.25, .35, 0], rot: [0, 0, .3] })); g.add(cy(.055, .055, 1.0, c, { pos: [.02, .9, 0] })); g.add(bx(.45, .2, .09, c, { pos: [.25, 1.28, 0], rot: [0, 0, -.55] })); return g; }
export function balloonE(c) { const g = new THREE.Group(); c = c || COL.coral;
  g.add(bl(.45, c, { scale: [1, 1.2, 1], pos: [0, 1.5, 0] })); g.add(mm(new THREE.ConeGeometry(.08, .14, 8), c, { pos: [0, .93, 0], rot: [PI, 0, 0], inkW: .008, box: true })); g.add(cy(.014, .014, .9, COL.ink, { pos: [0, .46, 0], ink: false })); g.add(bl(.1, COL.cream, { pos: [-.17, 1.8, .3], scale: [.5, 1, .4], ink: false })); return g; }
export function entItem(i) { i = ((i % 6) + 6) % 6; return [() => giftBox(COL.coral, COL.cream), () => suitcase(COL.sky), () => filmReel(COL.lilac), () => ticketStub(COL.peach), () => musicNote(COL.leaf), () => balloonE(COL.coral)][i](); }

// ---------- tasks (s22) ----------
export function broom() { const g = new THREE.Group(); g.add(cy(.05, .05, 1.9, COL.wood, { pos: [0, 1.05, 0], inkW: .01 })); g.add(bx(.7, .22, .3, COL.peachD, { pos: [0, .22, 0] })); g.add(mm(new THREE.ConeGeometry(.4, .5, 4), COL.cream, { pos: [0, .0, 0], rot: [PI, PI / 4, 0], scale: [1, 1, .5], inkW: .01, box: true })); return g; }
export function cupC() { const g = new THREE.Group(); g.add(cy(.17, .13, .24, COL.white, { pos: [0, .12, 0], inkW: .01 })); g.add(mm(new THREE.TorusGeometry(.09, .022, 8, 14, PI), COL.white, { pos: [.19, .12, 0], rot: [0, 0, -PI / 2], inkW: .008 })); return g; }
export function trayCups() { const g = new THREE.Group(); g.add(cy(.85, .85, .08, COL.peach, { pos: [0, .04, 0] })); g.add(mm(new THREE.TorusGeometry(.85, .05, 8, 28), COL.peachD, { pos: [0, .08, 0], rot: [PI / 2, 0, 0], inkW: .01 }));
  [[-.35, .1], [.35, .1], [0, -.38]].forEach(([x, z], i) => { const c = cupC(); c.position.set(x, .08, z); c.rotation.y = i; g.add(c); }); return g; }
export function bookClosed(c) { const g = new THREE.Group(); g.add(bx(1.1, .22, .8, c || COL.teal, { pos: [0, .11, 0] })); g.add(bx(1.0, .16, .74, COL.cream, { pos: [.04, .11, .01], ink: false })); g.add(bx(.12, .24, .82, COL.tealD, { pos: [-.5, .12, 0], inkW: .008 })); return g; }
export function wateringCan() { const g = new THREE.Group(); g.add(cy(.45, .5, .8, COL.tealL, { pos: [0, .4, 0] })); g.add(cy(.07, .09, .85, COL.tealL, { pos: [.65, .7, 0], rot: [0, 0, -.9], inkW: .01 })); g.add(cy(.17, .12, .1, COL.cream, { pos: [1.0, 1.1, 0], rot: [0, 0, -.9], inkW: .01 }));
  g.add(mm(new THREE.TorusGeometry(.32, .05, 8, 18, PI), COL.teal, { pos: [-.1, .85, 0], inkW: .01 })); return g; }
export const TASKS = () => [broom(), trayCups(), bookClosed(COL.coral), giftBox(COL.lilac, COL.cream), wateringCan()];

// ---------- houses ----------
export function smallHouse(c, rc) { const g = new THREE.Group(); g.add(bx(.9, .65, .8, c || COL.cream, { pos: [0, .33, 0], inkW: .02 })); g.add(mm(new THREE.ConeGeometry(.75, .5, 4), rc || COL.peachD, { pos: [0, .9, 0], rot: [0, PI / 4, 0], inkW: .02, box: true })); g.add(bx(.2, .34, .04, COL.teal, { pos: [0, .2, .41], ink: false })); return g; }
export function cozyHouse() { const g = new THREE.Group(), s = new THREE.Shape(); s.moveTo(-1.9, 0); s.lineTo(1.9, 0); s.lineTo(0, 1.25); s.closePath();
  g.add(bx(3.2, 2.2, 2.8, COL.cream, { pos: [0, 1.1, 0], inkW: .025 }));
  const roof = mm(new THREE.ExtrudeGeometry(s, { depth: 3.1, bevelEnabled: false }), COL.peachD, { pos: [0, 2.2, -1.55], inkW: .025, box: true }); g.add(roof);
  g.add(bx(.45, .9, .45, COL.tealD, { pos: [1.0, 3.0, -.4], inkW: .014 }));
  g.add(bx(.7, 1.3, .08, COL.teal, { pos: [-.8, .65, 1.42], inkW: .012 })); g.add(bl(.06, COL.cream, { pos: [-.62, .65, 1.48], ink: false }));
  g.add(bx(1.0, .95, .08, COL.tealD, { pos: [.85, 1.35, 1.41], inkW: .012 }));
  const win = bm(new THREE.PlaneGeometry(.8, .75), 0xFFE9A8, { transparent: true, opacity: .4 }); win.position.set(.85, 1.35, 1.46); g.add(win);
  const gl = glowSprite(0xFFD27A, 4.2, 0); gl.position.set(.85, 1.35, 1.7); g.add(gl);
  g.add(bx(.08, .95, .04, COL.tealD, { pos: [.85, 1.35, 1.47], ink: false })); g.add(bx(1.0, .08, .04, COL.tealD, { pos: [.85, 1.35, 1.47], ink: false }));
  g.userData.glow = k => { k = clamp(k, 0, 1); win.material.opacity = .4 + .6 * k; win.material.color.set(k > .5 ? 0xFFE08A : 0xFFE9A8); gl.material.opacity = .95 * k; };
  g.userData.glow(.2); return g; }
export function flower(c) { const g = new THREE.Group(); g.add(cy(.025, .025, .6, COL.leaf, { pos: [0, .3, 0], ink: false })); g.add(bl(.15, c, { pos: [0, .66, 0], inkW: .01 })); g.add(bl(.07, COL.cream, { pos: [0, .7, .1], ink: false })); return g; }
export function globeHouses(R, n, seed) { const g = new THREE.Group(), r = rng(seed || 4); g.add(bl(R, COL.mint, { inkW: .03 }));
  const up = new THREE.Vector3(0, 1, 0), houses = [];
  for (let i = 0; i < n; i++) { const y = 1 - (i + .5) / n * 2, rr = Math.sqrt(1 - y * y), a = i * 2.39996, nv = new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr);
    const h = smallHouse([COL.cream, COL.white, COL.peach][i % 3], [COL.peachD, COL.teal, COL.tealD][i % 3]); h.scale.setScalar(.4); h.position.copy(nv).multiplyScalar(R - .02); h.quaternion.setFromUnitVectors(up, nv); h.rotateY(r() * 6); g.add(h); houses.push({ h, nv }); }
  g.userData.houses = houses; return g; }

// ---------- misc props ----------
export function plinth(r, h, c) { const g = new THREE.Group(); g.add(cy(r, r * 1.08, h, c || COL.cream, { pos: [0, h / 2, 0], inkW: .02 })); g.add(cy(r * 1.12, r * 1.12, .08, COL.mint, { pos: [0, .04, 0], ink: false })); return g; }
export function toolbox() { const g = new THREE.Group(), lid = new THREE.Group(); g.add(bx(2.0, .85, 1.1, COL.teal, { pos: [0, .43, 0] })); g.add(bx(1.8, .06, .9, COL.cream, { pos: [0, .84, 0], ink: false })); lid.position.set(0, .86, -.55); g.add(lid);
  lid.add(bx(2.04, .16, 1.14, COL.tealD, { pos: [0, .08, .55] })); lid.add(mm(new THREE.TorusGeometry(.3, .05, 8, 14, PI), COL.woodD, { pos: [0, .22, .55], inkW: .01 })); g.add(bx(.3, .2, .06, COL.peach, { pos: [0, .75, .57], inkW: .008 })); g.userData.lid = lid; return g; }
export function hammer() { const g = new THREE.Group(); g.add(cy(.07, .07, 1.6, COL.wood, { pos: [0, 0, 0], inkW: .01 })); g.add(bx(.7, .3, .3, COL.grey, { pos: [0, .8, 0], inkW: .012 })); g.add(bx(.18, .32, .32, COL.peachD, { pos: [.34, .8, 0], inkW: .008 })); return g; }
export function wrench() { const g = new THREE.Group(); g.add(bx(.16, 1.5, .1, COL.greyL, { pos: [0, 0, 0], inkW: .01 })); g.add(mm(new THREE.TorusGeometry(.2, .08, 8, 14, PI * 1.6), COL.greyL, { pos: [0, .78, 0], rot: [0, 0, -PI * .3], inkW: .01 })); g.add(bl(.14, COL.greyL, { pos: [0, -.78, 0], scale: [1, 1, .6], inkW: .01 })); return g; }
export function emptyFrame(w, h) { const g = new THREE.Group(), t = .3; g.add(bx(w, t, .3, COL.peach, { pos: [0, h / 2 - t / 2, 0] })); g.add(bx(w, t, .3, COL.peach, { pos: [0, -h / 2 + t / 2, 0] })); g.add(bx(t, h, .3, COL.peach, { pos: [-w / 2 + t / 2, 0, 0] })); g.add(bx(t, h, .3, COL.peach, { pos: [w / 2 - t / 2, 0, 0] }));
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) g.add(bl(.28, COL.teal, { pos: [sx * w / 2, sy * h / 2, 0], scale: [1, 1, .7], inkW: .012 })); return g; }
export function digitBoard(txt) { const g = new THREE.Group(); g.add(cy(.1, .12, 1.7, COL.woodD, { pos: [0, .85, 0], inkW: .01 })); g.add(bx(2.3, 1.1, .14, COL.cream, { pos: [0, 2.0, 0], inkW: .016 }));
  const tx = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#2F706D'; c.font = '900 92px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 4); }); const p = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.05), new THREE.MeshBasicMaterial({ map: tx, transparent: true })); p.position.set(0, 2.0, .09); p.userData.keep = true; g.add(p); return g; }
export function clockProp() { const g = new THREE.Group(), face = new THREE.Group(); face.position.y = 2.6; g.add(face);
  g.add(cy(.12, .16, 1.8, COL.woodD, { pos: [0, .9, 0] })); g.add(cy(.7, .85, .15, COL.tealD, { pos: [0, .08, 0] }));
  face.add(cy(1.25, 1.25, .26, COL.cream, { rot: [PI / 2, 0, 0], inkW: .02 })); face.add(mm(new THREE.TorusGeometry(1.25, .13, 10, 36), COL.teal, { pos: [0, 0, .08], inkW: .015 }));
  for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; face.add(bx(.1, i % 3 ? .16 : .26, .04, COL.tealD, { pos: [Math.sin(a) * 1.0, Math.cos(a) * 1.0, .15], rot: [0, 0, -a], ink: false })); }
  const hand = new THREE.Group(); hand.position.z = .2; face.add(hand); hand.add(bx(.12, .9, .05, COL.coral, { pos: [0, .45, 0], inkW: .008 })); const h2 = new THREE.Group(); h2.position.z = .17; face.add(h2); h2.add(bx(.16, .6, .05, COL.tealD, { pos: [0, .3, 0], inkW: .008 })); h2.rotation.z = -1.0;
  face.add(bl(.1, COL.ink, { pos: [0, 0, .22], ink: false })); g.userData = { hand, face }; return g; }
export function conveyor(len) { const g = new THREE.Group(), stripes = []; g.add(bx(len, .3, 1.7, COL.tealL, { pos: [0, -.15, 0] })); for (const s of [-1, 1]) g.add(bx(len, .2, .12, COL.tealD, { pos: [0, .0, s * .85], inkW: .01 }));
  for (const s of [-1, 1]) g.add(cy(.28, .28, 1.7, COL.tealD, { pos: [s * len / 2, -.15, 0], rot: [PI / 2, 0, 0], inkW: .012 }));
  for (let i = 0; i < Math.floor(len / 1.1); i++) { const b = bx(.14, .04, 1.5, COL.mint, { pos: [0, .01, 0], ink: false }); g.add(b); stripes.push(b); }
  for (const x of [-.4, -.1, .4]) for (const s of [-1, 1]) g.add(bx(.2, 3, .2, COL.tealD, { pos: [x * len, -1.65, s * .7], inkW: .01 }));
  g.userData = { stripes, L: len, move(u) { stripes.forEach((b, i) => { b.position.x = -len / 2 + 0.3 + ((i * 1.1 + u) % (stripes.length * 1.1)); }); } }; return g; }
export function coin() { const g = new THREE.Group(); g.add(cy(.3, .3, .07, COL.peach, { rot: [PI / 2, 0, 0], inkW: .01 })); g.add(cy(.2, .2, .09, COL.peachD, { rot: [PI / 2, 0, 0], ink: false })); return g; }
export function rails(len) { const g = new THREE.Group(); for (const s of [-1, 1]) g.add(bx(len, .14, .14, COL.tealD, { pos: [0, .3, s * .5], inkW: .01 }));
  for (let i = 0; i < len / 0.9; i++) g.add(bx(.3, .12, 1.7, i % 2 ? COL.peach : COL.creamD, { pos: [-len / 2 + .45 + i * .9, .08, 0], inkW: .008 })); return g; }
export function cart(c) { const g = new THREE.Group(); g.add(bx(1.7, .7, 1.05, c, { pos: [0, .95, 0] })); g.add(bx(1.5, .1, .85, COL.cream, { pos: [0, 1.33, 0], ink: false }));
  for (const x of [-.55, .55]) for (const s of [-1, 1]) { g.add(cy(.28, .28, .1, COL.peachD, { pos: [x, .42, s * .62], rot: [PI / 2, 0, 0], inkW: .01 })); g.add(cy(.1, .1, .12, COL.cream, { pos: [x, .42, s * .62], rot: [PI / 2, 0, 0], ink: false })); }
  const mark = bx(.5, .06, .5, COL.peachD, { pos: [0, 1.4, 0], inkW: .008 }); mark.visible = false; g.add(mark); g.userData.mark = mark; return g; }
export function stampPress(span) { const g = new THREE.Group(), pist = new THREE.Group(); for (const s of [-1, 1]) g.add(bx(.35, 3.6, .35, COL.tealD, { pos: [0, 1.8, s * 1.35] })); g.add(bx(.45, .4, 3.1, COL.teal, { pos: [0, 3.7, 0] }));
  pist.position.y = 3.2; g.add(pist); pist.add(cy(.16, .16, 1.2, COL.greyL, { pos: [0, .5, 0], inkW: .01 })); pist.add(bx(.8, .22, .8, COL.peachD, { pos: [0, -.12, 0] })); g.userData.pist = pist; return g; }
export function bookStand() { const g = new THREE.Group(), board = new THREE.Group(); board.position.set(0, .95, 0); board.rotation.x = .75; g.add(board);
  for (const s of [-1, 1]) g.add(cy(.05, .06, 1.1, COL.woodD, { pos: [s * .4, .5, -.1], rot: [.2, 0, 0], inkW: .008 })); g.add(bx(1.0, .06, .5, COL.woodD, { pos: [0, .03, .15], inkW: .008 }));
  board.add(bx(1.4, .06, 1.0, COL.wood, { pos: [0, 0, 0], inkW: .01 }));
  for (const s of [-1, 1]) { board.add(bx(.66, .05, .88, COL.cream, { pos: [s * .35, .06, 0], rot: [0, 0, -s * .06], inkW: .008 })); for (let i = 0; i < 5; i++) board.add(bx(.44, .01, .03, COL.mintD, { pos: [s * .36, .095, -.3 + i * .15], ink: false })); }
  board.add(bx(.06, .08, .9, COL.teal, { pos: [0, .05, 0], inkW: .006 })); g.userData.glow = glowSprite(0xFFE3A0, 3.4, .35); g.userData.glow.position.set(0, 1.4, .3); g.add(g.userData.glow); return g; }
export function candleHolder() { const g = new THREE.Group(); g.add(cy(.3, .38, .1, COL.peach, { pos: [0, .05, 0] })); g.add(cy(.08, .08, .4, COL.peachD, { pos: [0, .3, 0], inkW: .008 })); g.add(cy(.2, .14, .12, COL.peach, { pos: [0, .54, 0], inkW: .01 }));
  g.add(cy(.1, .1, .6, COL.cream, { pos: [0, .88, 0], inkW: .01 })); g.add(bl(.07, 0xFFD27A, { scale: [1, 1.6, 1], pos: [0, 1.3, 0], ink: false })); const gl = glowSprite(0xFFC24A, 1.2, .8); gl.position.set(0, 1.32, 0); g.add(gl); return g; }
export function cupWater() { const g = new THREE.Group(); g.add(mm(new THREE.CylinderGeometry(.5, .4, .95, 28, 1, true), COL.white, { mat: { side: THREE.DoubleSide }, pos: [0, .48, 0], inkW: .015 })); g.add(cy(.4, .4, .06, COL.white, { pos: [0, .03, 0], inkW: .01 }));
  g.add(cy(.46, .46, .02, COL.sky, { pos: [0, .75, 0], ink: false })); g.add(mm(new THREE.TorusGeometry(.26, .06, 10, 18, PI), COL.white, { pos: [.5, .5, 0], rot: [0, 0, -PI / 2], inkW: .01 })); return g; }
export function bedEmpty() { const g = new THREE.Group(); g.add(bx(2.6, .3, 1.5, COL.wood, { pos: [0, .5, 0] })); g.add(bx(.18, 1.1, 1.5, COL.woodD, { pos: [-1.3, .8, 0] })); g.add(bx(.18, .7, 1.5, COL.woodD, { pos: [1.3, .6, 0] })); g.add(bx(2.35, .24, 1.35, COL.cream, { pos: [0, .79, 0], inkW: .01 }));
  g.add(bl(.4, COL.white, { scale: [1.2, .5, 1.6], pos: [-.78, 1.05, 0], inkW: .01 })); g.add(bx(1.5, .2, 1.42, COL.teal, { pos: [.45, .98, 0], inkW: .012 })); g.add(bx(1.5, .2, .3, COL.tealL, { pos: [.45, .99, .66], ink: false })); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(bx(.14, .4, .14, COL.woodD, { pos: [sx * 1.15, .2, sz * .62], ink: false })); return g; }
export function nightStand() { const g = new THREE.Group(); g.add(bx(2.2, 1.5, 1.4, COL.wood, { pos: [0, .75, 0] })); g.add(bx(2.34, .12, 1.52, COL.woodD, { pos: [0, 1.52, 0], inkW: .01 })); g.add(bx(1.9, .55, .06, COL.woodD, { pos: [0, 1.05, .72], inkW: .008 })); g.add(bl(.09, COL.cream, { pos: [0, 1.05, .78], ink: false })); g.add(bx(1.9, .55, .06, COL.woodD, { pos: [0, .4, .72], inkW: .008 })); return g; }
export function thermometer() { const g = new THREE.Group(); g.add(cy(.07, .07, 1.5, COL.white, { rot: [0, 0, PI / 2], inkW: .01 })); g.add(bl(.14, COL.coral, { pos: [-.78, 0, 0], inkW: .01 })); for (let i = 0; i < 6; i++) g.add(bx(.02, .1, .02, COL.ink, { pos: [-.2 + i * .2, .08, 0], ink: false })); return g; }
export function pillBottle(c, h) { h = h || .7; const g = new THREE.Group(); g.add(cy(.26, .26, h, c, { pos: [0, h / 2, 0] })); g.add(cy(.28, .28, .16, COL.cream, { pos: [0, h + .08, 0], inkW: .01 })); g.add(bx(.46, h * .4, .05, COL.cream, { pos: [0, h * .5, .27], ink: false })); return g; }
export function medBox() { const g = new THREE.Group(); g.add(bx(1.1, .38, .7, COL.cream, { pos: [0, .19, 0] })); g.add(bx(.9, .1, .72, COL.teal, { pos: [0, .2, 0], ink: false })); g.add(bx(.2, .4, .72, COL.coral, { pos: [.3, .2, 0], ink: false })); return g; }
export function pill(c) { const g = new THREE.Group(); g.add(cy(.07, .07, .22, c, { rot: [0, 0, PI / 2], inkW: .008 })); return g; }
export function purse() { const g = new THREE.Group(); g.add(bl(.6, COL.peachD, { scale: [1, .9, 1], pos: [0, .55, 0] })); g.add(cy(.2, .3, .3, COL.peachD, { pos: [0, 1.1, 0], inkW: .012 })); g.add(mm(new THREE.TorusGeometry(.22, .05, 8, 16), COL.teal, { pos: [0, 1.0, 0], rot: [PI / 2, 0, 0], inkW: .01 })); g.add(cy(.22, .1, .12, COL.peach, { pos: [0, 1.32, 0], inkW: .01 })); g.add(coin()); g.children[g.children.length - 1].position.set(.3, .65, .52); return g; }
export function fence(n) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(bx(.2, 1.0, .1, COL.cream, { pos: [0, .5, -n * .45 + i * .9], rot: [0, PI / 2, 0], inkW: .008 })); g.add(bx(.08, .1, n * .9, COL.woodD, { pos: [0, .75, 0], ink: false })); g.add(bx(.08, .1, n * .9, COL.woodD, { pos: [0, .3, 0], ink: false })); return g; }
export function weightObj() { const g = new THREE.Group(); g.add(bx(1.3, 1.0, 1.0, COL.tealD, { pos: [0, .5, 0], inkW: .02 })); g.add(mm(new THREE.TorusGeometry(.3, .07, 8, 16, PI), COL.tealD, { pos: [0, 1.0, 0], inkW: .014 })); g.add(bx(1.32, .1, 1.02, COL.peachD, { pos: [0, .32, 0], ink: false })); return g; }
export function deskLamp() { const g = new THREE.Group(); g.add(cy(.5, .55, .12, COL.peachD, { pos: [0, .06, 0] })); g.add(cy(.06, .06, 1.9, COL.tealD, { pos: [0, 1.0, 0], inkW: .01 })); g.add(bl(.12, COL.cream, { pos: [0, 1.95, 0], inkW: .01 }));
  const sh = mm(new THREE.CylinderGeometry(.18, .6, .7, 22, 1, true), COL.peach, { mat: { side: THREE.DoubleSide }, pos: [.5, 2.05, 0], rot: [0, 0, 1.0], inkW: .014 }); g.add(sh);
  const bulb = bm(new THREE.SphereGeometry(.18, 12, 10), 0xFFE3A0); bulb.position.set(.55, 1.88, 0); g.add(bulb); const gl = glowSprite(0xFFD27A, 4, 0); gl.position.set(.75, 1.6, 0); g.add(gl);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(.35, 1.6, 2.0, 22, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE3A0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); cone.position.set(.9, .95, 0); cone.rotation.z = .5; cone.userData.keep = true; g.add(cone);
  g.userData.set = k => { k = clamp(k, 0, 1); gl.material.opacity = .9 * k; cone.material.opacity = .1 * k; bulb.material.color.set(k > .4 ? 0xFFE08A : 0xE8DCC0); }; g.userData.set(0); return g; }
export function hourglassK() { const g = new THREE.Group(), glassM = { transparent: true, opacity: .32, side: THREE.DoubleSide };
  g.add(cy(.45, .45, .08, COL.teal, { pos: [0, .04, 0] })); g.add(cy(.45, .45, .08, COL.teal, { pos: [0, 1.56, 0] }));
  for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3; g.add(cy(.03, .03, 1.5, COL.tealD, { pos: [Math.sin(a) * .4, .8, Math.cos(a) * .4], ink: false })); }
  g.add(mm(new THREE.ConeGeometry(.36, .7, 20, 1, true), COL.mint, { mat: glassM, pos: [0, 1.18, 0], rot: [PI, 0, 0], inkW: .01 })); g.add(mm(new THREE.ConeGeometry(.36, .7, 20, 1, true), COL.mint, { mat: glassM, pos: [0, .42, 0], inkW: .01 }));
  const top = mm(new THREE.ConeGeometry(.32, .62, 18), COL.peach, { pos: [0, 1.2, 0], rot: [PI, 0, 0], ink: false }), bot = mm(new THREE.ConeGeometry(.32, .62, 18), COL.peach, { pos: [0, .36, 0], ink: false }), st = cy(.018, .018, .6, COL.peach, { pos: [0, .8, 0], ink: false });
  g.add(top); g.add(bot); g.add(st);
  g.userData.set = k => { k = clamp(k, 0, 1); top.scale.setScalar(Math.max(.01, 1 - k)); top.position.y = 1.55 - .35 * (1 - k) - .01; bot.scale.setScalar(Math.max(.01, k * .95 + .05)); bot.position.y = .08 + .31 * (k * .95 + .05); st.visible = k > .01 && k < .99; }; g.userData.set(0); return g; }
export function keyObj(c, len, teeth) { const g = new THREE.Group(); g.add(mm(new THREE.TorusGeometry(.26, .08, 10, 20), c, { pos: [0, len / 2 + .28, 0], inkW: .014 })); g.add(cy(.07, .07, len, c, { inkW: .012 }));
  for (let i = 0; i < teeth; i++) g.add(bx(.26 + (i % 2) * .12, .1, .08, c, { pos: [.14 + (i % 2) * .06, -len / 2 + .1 + i * .2, 0], inkW: .008 })); return g; }
export function lockObj(c, w, h) { const g = new THREE.Group(); g.add(bx(w, h, .45, c, { pos: [0, h / 2, 0], inkW: .016 })); g.add(mm(new THREE.TorusGeometry(w * .32, .08, 10, 18, PI), COL.greyL, { pos: [0, h, 0], inkW: .012 })); g.add(cy(.08, .08, .08, COL.cream, { pos: [0, h * .55, .24], rot: [PI / 2, 0, 0], inkW: .008 })); g.add(bx(.06, h * .28, .06, COL.cream, { pos: [0, h * .4, .25], ink: false })); return g; }
export function plant() { const g = new THREE.Group(); g.add(cy(.45, .35, .7, COL.peach, { pos: [0, .35, 0] })); for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2; g.add(bl(.32, i % 2 ? COL.leaf : COL.teal, { scale: [.6, 1.7, .6], pos: [Math.sin(a) * .3, 1.1, Math.cos(a) * .3], rot: [Math.cos(a) * .4, 0, -Math.sin(a) * .4], inkW: .01 })); } return g; }
export function fruitBowlK() { const g = new THREE.Group(); g.add(mm(new THREE.SphereGeometry(.45, 22, 12, 0, PI * 2, PI / 2, PI / 2), COL.mint, { mat: { side: THREE.DoubleSide }, pos: [0, .45, 0], inkW: .012 })); [[0, COL.coral], [.2, COL.peach], [-.2, COL.leaf], [.08, COL.coral]].forEach(([x, c], i) => g.add(bl(.15, c, { pos: [x, .5 + (i > 2 ? .12 : 0), i % 2 ? .1 : -.08], inkW: .01 }))); return g; }

// ---------- kitchen corner (no people, no screens). dx shifts it along x ----------
export function kitchen(Wd, dx, o) {
  o = o || {}; const g = new THREE.Group(); Wd.add(g); g.position.x = dx || 0;
  g.add(bx(46, 12, .4, COL.wall, { pos: [0, 6, -3], inkW: .01 })); g.add(bx(46, 2.6, .44, COL.mint, { pos: [0, 1.3, -2.99], inkW: .01 })); g.add(bx(46, .16, .5, COL.cream, { pos: [0, 2.65, -2.95], inkW: .008 }));
  g.add(bx(12, 2.0, 2.4, COL.cream, { pos: [-1, 1.0, -1.7], inkW: .012 })); g.add(bx(12.2, .18, 2.5, COL.wood, { pos: [-1, 2.05, -1.7], inkW: .012 }));
  const fr = new THREE.Group(); fr.position.set(-8.2, 0, -1.2); g.add(fr); fr.add(bx(2.8, 6.4, 2.2, COL.mint, { pos: [0, 3.2, 0], inkW: .02 })); fr.add(bx(2.7, .08, .06, COL.mintD, { pos: [0, 4.4, 1.12], ink: false })); fr.add(bx(.16, 1.4, .2, COL.teal, { pos: [1.1, 5.4, 1.2], inkW: .01 })); fr.add(bx(.16, 1.4, .2, COL.teal, { pos: [1.1, 3.5, 1.2], inkW: .01 }));
  const fb = fruitBowlK(); fb.position.set(-4.6, 2.14, -1.4); fb.scale.setScalar(1.5); g.add(fb);
  const fruitTop = fruitBowlK(); fruitTop.position.set(-8.2, 6.4, -1.2); fruitTop.scale.setScalar(1.3); g.add(fruitTop);
  const pl = plant(); pl.position.set(1.6, 2.14, -1.9); pl.scale.setScalar(1.7); g.add(pl);
  const wf = new THREE.Group(); wf.position.set(6.2, 5.0, -2.75); g.add(wf); wf.add(bx(4.4, 3.8, .22, COL.cream, { inkW: .014 })); wf.add(bx(3.8, 3.2, .1, COL.sky, { pos: [0, 0, .08], ink: false }));
  wf.add(bx(.14, 3.4, .14, COL.cream, { pos: [0, 0, .16], ink: false })); wf.add(bx(4.0, .14, .14, COL.cream, { pos: [0, 0, .16], ink: false })); const sg = glowSprite(0xFFE3A0, 9, .5); sg.position.set(0, 0, .5); wf.add(sg);
  const sun = bm(new THREE.CircleGeometry(.5, 20), 0xFFF0C0); sun.position.set(-.9, .7, .15); wf.add(sun);
  const rb = dayRibbon(); rb.g.scale.setScalar(o.rs || .7); rb.g.position.set(0, o.ry || 8.4, -2.7); g.add(rb.g);
  return { g, rb, fb, fridge: fr, gapWorld: new THREE.Vector3((dx || 0), o.ry || 8.4, -2.7) };
}
