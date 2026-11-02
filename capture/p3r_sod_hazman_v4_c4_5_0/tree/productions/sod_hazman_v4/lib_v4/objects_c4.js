// objects_c4.js - set pieces for chapter c4 only (study corner, board room, red X, tilting Earth hook). Digits/symbols only, no Hebrew, no people.
import { THREE, box, cyl, mesh, toon, ease, prog, clamp, lerp, rng, O, D2R, candle, textPlane, studioBackdrop, bigSefer, rack, tube, reveal, arcPts, sunBall } from './kit_c4567.js';

// warm study lighting shared by the board room shots
export function boardLights(Wd, o) {
  o = o || {};
  O.lighting(Wd, { key: [0xffd9a0, o.key || 1.05, [-6, 9, 12]], hemi: [0xd8b890, 0x3a2a1a, o.hemi || .8], fill: [0x7a96d8, .35, [6, 3, 8]], rim: [0xffe0b0, .6, [0, 6, -6]], target: [0, 1.8, 0], shadowExt: 13, shadowMap: 1024, fog: null,
    points: [[0xffc070, 8, [0, 5, 5], 16], [0xffb868, 5, [5.8, 1.6, 4.2], 8]] });
}
// dark warm study with a side table (open sefer) and a candle stool in the foreground: the 3 depth layers for every board shot
export function boardRoom(Wd, o) {
  o = o || {}; O.skyDome(Wd, { top: 0x0a0806, mid: 0x14100c, bot: 0x241a12, stars: 0 }); studioBackdrop(Wd); boardLights(Wd, o);
  if (!o.rack) Wd.add(box(14.6, .9, 2.6, 0x6a4526, { pos: [0, .45, .1], inkW: .015 })); else rack(Wd, { ys: [0, 2.7] });
  Wd.add(box(2.6, .7, 1.5, 0x5a3416, { pos: [-6.4, .35, 3.9], inkW: .012 })); bigSefer(Wd, [-6.4, .7, 3.9], 2.3, .35);
  Wd.add(box(1.1, .7, 1.1, 0x5a3416, { pos: [6.0, .35, 3.9], inkW: .012 }));
  const cs = [candle(Wd, { pos: [5.8, .7, 3.9], h: .5, scale: 1.5 }), candle(Wd, { pos: [6.3, .7, 4.2], h: .36, scale: 1.4 })];
  Wd.on(t => cs.forEach((c, i) => c.tick(t, 1, i * 2.1)));
  O.motes(Wd, { n: 34, area: [-8, 8, .5, 5, -2, 7], size: .2, color: 0xffd890, op: .5, seed: 41, rise: .05 });
  return { candles: cs };
}
// the open sefer on a shtender (L00)
export function studyCorner(Wd) {
  O.skyDome(Wd, { top: 0x0a0806, mid: 0x14100c, bot: 0x241a12, stars: 0 }); studioBackdrop(Wd);
  O.lighting(Wd, { key: [0xffc58a, .95, [1, 4, 3]], hemi: [0x5a4030, 0x1a1008, .65], fill: [0x6a5a80, .22, [-3, 1, 3]], rim: [0xffb070, .55, [-1, 3, -3]], target: [0, 1.1, 0], shadowExt: 4, fog: null,
    points: [[0xffc070, 7, [0, 2.3, .6], 6], [0xffd090, 3, [.7, 1.4, .9], 4]] });
  const sh = O.shtender(Wd, {}), se = O.sefer(Wd, { pos: [0, .035, 0], bright: 1.05 }); sh.userData.slope.add(se);
  const c1 = candle(Wd, { pos: [.95, .93, -.2], h: .26 }); Wd.add(box(.8, .05, .5, 0x5a3416, { pos: [.95, .9, -.2], inkW: .005 }));
  const c2 = candle(Wd, { pos: [-.9, .93, .3], h: .2 }); Wd.add(box(.7, .05, .45, 0x5a3416, { pos: [-.9, .9, .3], inkW: .005 }));
  // foreground stack of books (soft blur) at the lower left
  [[-.75, .1, .8, 0x8a2f2a], [-.78, .17, .82, 0x24407a], [-.7, .24, .78, 0x2f5d3a]].forEach(([x, y, z, c], i) => Wd.add(box(.5, .07, .36, c, { pos: [x, y, z], rot: [0, .2 - i * .15, 0], inkW: .006 })));
  const pg = O.glow(2.2, 0xffd890, .4); pg.position.set(0, 1.55, .35); Wd.add(pg);
  O.motes(Wd, { n: 36, area: [-1.8, 1.8, .6, 2.6, -2.5, 1.4], size: .07, color: 0xffd890, op: .6, seed: 45, rise: .05 });
  const tag = textPlane(.36, .18, { fg: '#ffe9b0', glow: 'rgba(255,200,90,.9)', bg: 'rgba(70,40,10,.9)', text: '' }); tag.mesh.position.set(.5, 1.5, .25); Wd.add(tag.mesh);
  Wd.on((t, cam) => { c1.tick(t, 1, 0); c2.tick(t, 1, 1.7); pg.material.opacity = .4 + .06 * Math.sin(t * 5.3); tag.mesh.quaternion.copy(cam.quaternion); });
  return { sh, se, tag, hero: sh };
}
// big red X (two bars drawn one after the other)
export function redX(Wd, pos, w) {
  const g = O.grp(Wd, { pos }), a = box(w, .2, .12, 0xd2301e, { rot: [0, 0, .62], inkW: .02 }), b = box(w, .2, .12, 0xd2301e, { rot: [0, 0, -.62], inkW: .02 }); g.add(a); g.add(b);
  const gl = O.glow(w * 1.6, 0xff4030, 0); g.add(gl);
  return { group: g, set(k1, k2, vis) { a.scale.x = Math.max(.001, ease.out(k1)); b.scale.x = Math.max(.001, ease.out(k2)); g.scale.setScalar(Math.max(.001, vis === undefined ? 1 : vis)); g.visible = (vis === undefined ? 1 : vis) > .01 && k1 > 0; gl.material.opacity = .5 * Math.exp(-Math.pow((k2 - .6) / .2, 2)); } };
}
// the Earth with a gold axis, tilting from 0 to 23.5 degrees (chapter hook)
export function earthHook(Wd) {
  O.skyDome(Wd, { top: 0x01030a, mid: 0x02061a, bot: 0x061030, stars: 1 });
  O.lighting(Wd, { key: [0xfff0d8, 2.2, [-30, 8, 12]], hemi: [0x4a6aa8, 0x101830, .55], fill: [0x5a7ad0, .25, [10, 0, 10]], rim: [0xffb070, .5, [20, 10, -20]], target: [0, 0, 0], noShadow: true, fog: null });
  const E = O.earth(Wd, { R: 1.5, pos: [0, 0, 0] }), em = E.userData.earth;
  const axis = cyl(.03, .03, 4.8, 0xffc84a, { ink: false }); axis.material = new THREE.MeshBasicMaterial({ color: 0xffd060 }); E.add(axis);
  const tip = O.glow(.7, 0xffd060, .9); tip.position.y = 2.4; E.add(tip); const tip2 = O.glow(.7, 0xffd060, .5); tip2.position.y = -2.4; E.add(tip2);
  const ref = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 5.2, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45 })); Wd.add(ref);
  const arc = tube(arcPts(2.9, 90, 66.5, 24), .028, 0xffe08a, { seg: 24, rs: 5 }); Wd.add(arc); reveal(arc, 0);
  const orbit = tube((() => { const p = []; for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; p.push([Math.cos(a) * 9, -3.2, Math.sin(a) * 9 - 6]); } return p; })(), .03, 0x6a8ad0, { closed: true, seg: 96, op: .5 }); Wd.add(orbit);
  const sun = sunBall(Wd, 1.4); sun.position.set(-18, 3, -8);
  return { E, em, axis, arc, tip, tip2, sun, setTilt(deg, k) { E.rotation.z = -deg * D2R; reveal(arc, k); } };
}
