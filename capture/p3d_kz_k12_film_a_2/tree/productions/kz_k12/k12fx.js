// k12fx.js - composite sets and effects for kz_k12 (street, ring of houses, thanks table, lantern field, glowing ribbon).
import { THREE, COL, PI, sm, sin, cos, bx, cy, bl, mm, grp, put, rng, clamp, lerp, ease, prog, house, lantern, glowSprite, sparkle, table, slipper, speechBubble, fridge, glove,
  glasses, fadeRec, setFade, lensFader, bread, fruitBowl, elastic, pop } from './k12lib.js';

const HC = [COL.cream, COL.sageL, COL.sky, '#FBD3C2', '#F7E2A8', '#D8EAD9'], RC = [COL.coral, COL.sageD, COL.skyD, COL.honey, COL.coralD];
// a street along -z: houses on both sides. returns {g, houses[], wins[] (world positions)}
export function street(Wd, o) {
  o = o || {}; const g = grp(Wd), N = o.n || 7, r = rng(o.seed || 4), houses = [], wins = [];
  const road = bx(5.2, .06, 60, COL.path || '#EFE6D0', { pos: [0, .03, -14], inkW: .008 }); g.add(road);
  for (const s of [-1, 1]) { g.add(bx(1.6, .12, 60, '#E4D9BF', { pos: [s * 3.4, .06, -14], inkW: .008 }));
    for (let i = 0; i < N; i++) { const sc = 2.1 + r() * .3, hh = 1.0 + r() * .55, h = house({ col: HC[Math.floor(r() * HC.length)], roof: RC[Math.floor(r() * RC.length)], h: hh, nw: 2 });
      h.position.set(s * 5.6, 0, 2 - i * 5.0); h.rotation.y = s < 0 ? PI / 2 : -PI / 2; h.scale.setScalar(sc); g.add(h); houses.push(h); h.updateMatrixWorld(true);
      h.userData.wins.forEach((w, k) => wins.push({ h, k, pos: w.getWorldPosition(new THREE.Vector3()) })); }
    for (let i = 0; i < N * 2; i++) { const t = new THREE.Group(); t.position.set(s * 3.9, 0, 4 - i * 2.6 + r()); t.add(bx(.12, 1.2, .12, COL.woodD, { pos: [0, .6, 0], ink: false })); t.add(bl(.55 + r() * .15, [COL.sageD, '#86BC96', COL.sage][i % 3], { pos: [0, 1.5, 0], inkW: .015 })); g.add(t); } }
  return { g, houses, wins, setLit(k, from) { houses.forEach((h, i) => h.userData.setLit(typeof k === 'function' ? k(i) : k)); } };
}
// ring of n houses around a centre; returns {g, houses, winPos[]}
export function houseRing(Wd, o) {
  o = o || {}; const n = o.n || 14, R = o.R || 7.5, g = grp(Wd), r = rng(o.seed || 8), houses = [], wins = [];
  for (let i = 0; i < n; i++) { const a = i / n * PI * 2, sc = 1.7 + r() * .3, h = house({ col: HC[i % HC.length], roof: RC[(i * 2) % RC.length], h: 1.0 + r() * .4, nw: 1 });
    h.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); h.rotation.y = a + PI; h.scale.setScalar(sc); g.add(h); houses.push(h); h.updateMatrixWorld(true); wins.push(h.userData.wins[0].getWorldPosition(new THREE.Vector3())); }
  for (let i = 0; i < 26; i++) { const a = r() * PI * 2, d = R + 2.2 + r() * 4; const t = new THREE.Group(); t.position.set(Math.sin(a) * d, 0, Math.cos(a) * d); t.add(bx(.14, 1.4, .14, COL.woodD, { pos: [0, .7, 0], ink: false })); t.add(bl(.7 + r() * .3, [COL.sageD, '#86BC96', COL.sage][i % 3], { pos: [0, 1.8, 0], inkW: .015 })); g.add(t); }
  g.add(cy(R - 2.5, R - 2.5, .05, '#F4EBD2', { pos: [0, .03, 0], inkW: .008 }));
  return { g, houses, wins };
}
// beams from points to a target growing with u(t,i)
export function rayBeams(Wd, from, to, u, o) {
  o = o || {}; const g = new THREE.Group(), B = []; Wd.add(g); const up = new THREE.Vector3(0, 1, 0);
  from.forEach((f, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: o.color || 0xFFD266, transparent: true, opacity: .0, depthWrite: false, fog: false })); m.renderOrder = 6; m.userData.keep = true; g.add(m); B.push(m); });
  Wd.on(t => { from.forEach((f, i) => { const a = new THREE.Vector3(...f), b = new THREE.Vector3(...to); const dir = b.clone().sub(a), L = dir.length(), k = clamp(u(t, i), 0, 1), m = B[i]; m.visible = k > .003; if (!m.visible) return;
    m.scale.set(o.r || .06, L * k, o.r || .06); m.position.copy(a).addScaledVector(dir, k / 2); m.quaternion.setFromUnitVectors(up, dir.normalize()); m.material.opacity = (o.op || .7) * (.8 + .2 * sin(t * 4 + i)); }); });
  return g;
}
// the thanks table. returns controls; lit(name,k) via setLit
export function thanksSet(Wd, o) {
  o = o || {}; const g = grp(Wd), R = 2.5, h = .8; const tb = table({ w: 6.8, round: true, cloth: COL.cream, h }); g.add(tb);
  const at = a => [R * sin(a * PI / 180), h + .03, -R * cos(a * PI / 180)];
  const bub = speechBubble(), sl = new THREE.Group(), fr = fridge(), gv = new THREE.Group(), sp = grp(null);
  const bp = at(-78); bub.position.set(...bp); bub.scale.setScalar(1.5); g.add(bub);
  const sp0 = at(-39); sp.position.set(sp0[0], sp0[1], sp0[2]); g.add(sp);
  const s1 = slipper(COL.coral), s2 = slipper(COL.coral); s1.position.set(-.3, 0, 0); s2.position.set(.3, 0, 0); sl.add(s1); sl.add(s2); sl.scale.setScalar(2.2); const spos = at(0); sl.position.set(...spos); g.add(sl);
  const fp = at(39); fr.position.set(fp[0], fp[1], fp[2]); fr.rotation.y = -.5; fr.scale.setScalar(1.35); g.add(fr);
  const g1 = glove(COL.coral), g2 = glove(COL.sage); g1.position.set(-.3, 0, 0); g2.position.set(.3, 0, 0); g2.scale.x = -1; gv.add(g1); gv.add(g2); gv.scale.setScalar(2.2); const gp = at(78); gv.position.set(...gp); g.add(gv);
  const st = { bubble: bub, slippers: sl, fridge: fr, gloves: gv };
  const F = {}; for (const k of Object.keys(st)) F[k] = fadeRec(st[k]);
  const glows = {}; for (const [k, p] of [['bubble', bp], ['spark', sp0], ['slippers', spos], ['fridge', fp], ['gloves', gp]]) { const gl = glowSprite(0xFFD27A, 3.4, 0); gl.position.set(p[0], p[1] + .8, p[2] + .2); g.add(gl); glows[k] = gl; }
  // generic soft sparkle (no object): a few stars and a ring
  const sparks = []; for (let i = 0; i < 6; i++) { const s = sparkle(i % 2 ? 0xFFD266 : 0xFFFFFF, .5, 0); g.add(s); sparks.push(s); }
  const sparkG = sparks; const ring = new THREE.Mesh(new THREE.TorusGeometry(.7, .03, 6, 36), new THREE.MeshBasicMaterial({ color: 0xFFD266, transparent: true, opacity: 0, fog: false })); ring.position.set(sp0[0], sp0[1] + 1.1, sp0[2]); ring.userData.keep = true; g.add(ring);
  const gl = glasses(Wd, { pos: [0, h + 1.12 - .8 + .03 - .03, 1.55], rot: [-1.1, 0, 0], scale: 1.15, haze: o.haze, add: false }); g.add(gl.g);
  const API = { g, tb, st, F, gl, glows, bp, sp0, spos, fp, gp, h, litAt: {}, ring, sparks };
  // lit state: o.lit(name, t) -> 0..1 (1 = lit, full colour)
  Wd.on(t => {
    for (const k of Object.keys(st)) { const L = o.lit ? o.lit(k, t) : 1; setFade(F[k], 1 - L); const sc = L <= 0 ? .0001 : (o.pop === false ? 1 : elastic(L)); st[k].scale.setScalar((k === 'slippers' || k === 'gloves' ? 2.2 : k === 'fridge' ? 1.35 : 1.5) * Math.max(.001, o.pop === false ? 1 : Math.max(.78, .78 + .22 * sc)));
      glows[k].material.opacity = .0 + (o.glow === false ? 0 : .7 * Math.max(0, Math.min(L, 1 - 0)) * (o.lit ? (1 - sm(prog(L, .6, 1))) + .25 * sm(prog(L, .6, 1)) : .25)); glows[k].scale.setScalar(2.6 + 1.4 * L); }
    const dr = fr.userData.door; dr.rotation.y = -(o.fridgeOpen ? o.fridgeOpen(t) : 1.6) * 1.0; fr.userData.glow.material.opacity = .6 * clamp((o.fridgeOpen ? o.fridgeOpen(t) : 1.6) / 1.6, 0, 1);
    const sk = o.spark ? o.spark(t) : 1; sparks.forEach((s, i) => { const a = i / 6 * PI * 2 + t * .8, rr = .5 + .3 * sin(t * 2 + i); s.position.set(sp0[0] + cos(a) * rr, sp0[1] + 1.1 + sin(a) * rr * .8, sp0[2] + .1); s.material.opacity = sk * (.5 + .5 * sin(t * 5 + i * 2)); s.scale.setScalar(.35 + .3 * sk); s.visible = sk > .01; });
    ring.visible = o.sparkRing ? o.sparkRing(t) > .01 : sk > .01 && sk < .99; const u = o.sparkRing ? o.sparkRing(t) : 0; ring.scale.setScalar(.3 + 1.6 * u); ring.material.opacity = .8 * (1 - u) * (u > 0 ? 1 : 0);
  });
  return API;
}
// field of lanterns on a plain: returns {g, L[], set(k)}
export function lanternField(Wd, o) {
  const r = rng(o.seed || 12), n = o.n || 28, L = [], g = grp(Wd);
  for (let i = 0; i < n; i++) { const a = r() * PI * 2, d = Math.sqrt(r()) * (o.R || 3.6), l = lantern(); l.position.set(o.c[0] + Math.sin(a) * d, 0, o.c[2] + Math.cos(a) * d); l.rotation.y = r() * 6; const s = 1.3 + r() * .5; l.scale.setScalar(s); l.userData.s0 = s; g.add(l); L.push(l); }
  return { g, L };
}
