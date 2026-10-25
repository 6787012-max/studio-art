// b_p4.js - film_b part 4: B7 (the shipwreck seen from the shore, the man on the plank who bows to each wave, the meeting on the shore). Exports `shots`.
import { THREE, box, cyl, ball, mesh, toon, person, ease, prog, clamp, lerp, D, cloud, seq } from '../../lib/stage3d.js';
import { rock } from '../../lib/props3d.js';
import { PAL, RAV, seaWorld, rav, mkShot, fly, goldLine, sm, talkF } from './shared.js';
import { sea, beach } from './sea.js';

const WOOD = 0xa4713f, WOODD = 0x7a5232;
const M = [-12, -6];                     // the man on the plank (inside the swell)
const SHIP = [-13, 1.5];                 // the wreck
const hash = (i, k) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };

const B7 = mkShot(32, ['CAP_B_18', 'CAP_B_19', 'CAP_B_20', 'CAP_B_21'], [0.5, 8.3, 16.1, 23.9], () => {
  const Wd = seaWorld({ shadowExt: 22, elev: 28, target: [0, 0, 0], fogNear: 70, fogFar: 420 });
  const S = sea(Wd, { amp: t => t < 9 ? 1.25 : (t < 22 ? .8 : .3), wavelength: 10, dir: 0 });
  const Bc = beach(Wd, { slope: .1, x0: 0, z0: -40, z1: 40, xMax: 44, xMin: -10 });
  const hAt = x => Bc.heightAt(x);

  // ---- rocky shore: rocks along the sides and a cliff backdrop
  [[5.5, 7, 1.4, 1], [8, -9, 2.2, 2], [4, -13, 1.8, 3], [12, 10, 2.6, 4], [16, -4, 3, 5], [19, 8, 3.4, 6], [24, -9, 4.4, 7], [28, 3, 5, 8], [32, -3, 5.5, 9], [14, -15, 3.2, 10], [3.5, 14, 1.6, 11], [22, 16, 3.6, 12]]
    .forEach(([x, z, s, sd]) => rock(Wd, { pos: [x, hAt(x) - .1 * s, z], scale: s, seed: sd, color: sd % 2 ? 0xc2baa8 : 0xb5ab98, rot: sd }));
  const ROCK = [7.2, -1.2], rockS = 1.7, rockTop = .72 * rockS;
  rock(Wd, { pos: [ROCK[0], hAt(ROCK[0]) - .05, ROCK[1]], scale: rockS, seed: 21, color: 0xc2baa8, rot: .6 });
  const ravOnRock = [ROCK[0], hAt(ROCK[0]) + rockTop - .08, ROCK[1]];

  // ---- the first RAV: on the rock watching (A, B), then on the sand to meet the man (C)
  const RV = [10.6, hAt(10.6), 0];
  const ravP = rav(Wd, t => t < 22
    ? { pos: ravOnRock, facing: -Math.PI / 2 - .12, gesture: 'rest', talk: 0, look: -.2 + .1 * Math.sin(t * .8), brow: .3 * sm(t, 3, 5) }
    : { pos: RV, facing: -Math.PI / 2 + .1, gesture: t < 25.2 ? 'rest' : 'explain', talk: t < 25.2 ? 0 : .35 + .35 * talkF(t) * (Math.sin(t * 1.3) > -.2 ? 1 : .2), smile: .15 });

  // ---- storm sky
  [[-32, 22, -14, 9], [-44, 26, 18, 11], [-20, 20, -34, 8]].forEach(([x, y, z, s], i) => {
    const c = cloud({ seed: i + 11, size: s, color: 0xaebbd0, inkColor: 0x7f8da4, pos: [x, y, z], cast: false }); c.scale.set(2.4, .8, 1.3); Wd.add(c); Wd.on(t => { c.position.x = x + t * .5; }); });

  // ================= the ship (A) =================
  const ship = new THREE.Group(); Wd.add(ship); ship.rotation.y = -.3; ship.scale.setScalar(1.7);
  const hullGeo = () => new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const hullMat = () => toon(WOOD, { side: THREE.DoubleSide });
  const fwd = new THREE.Group(), rear = new THREE.Group(); ship.add(fwd); ship.add(rear);
  fwd.add(mesh(hullGeo(), hullMat(), { scale: [3.0, 1.35, 1.8], pos: [0, 1.15, 0] }));
  rear.add(mesh(hullGeo(), hullMat(), { scale: [3.0, 1.35, 1.8], pos: [0, 1.15, 0] }));
  fwd.add(box(5.8, .12, .16, WOODD, { pos: [0, 1.17, 1.76], inkW: .02 })); fwd.add(box(5.8, .12, .16, WOODD, { pos: [0, 1.17, -1.76], inkW: .02 }));
  rear.add(box(5.8, .12, .16, WOODD, { pos: [0, 1.17, 1.76], inkW: .02 })); rear.add(box(5.8, .12, .16, WOODD, { pos: [0, 1.17, -1.76], inkW: .02 }));
  fwd.add(box(.5, .9, .5, 0xd9a05a, { pos: [-1.6, 1.5, 0], inkW: .02 }));         // cargo crate
  rear.add(box(1.2, .8, 1.2, WOODD, { pos: [1.2, 1.4, 0], inkW: .02 }));          // rear cabin
  // broken ribs sticking up at the split edges
  for (let i = 0; i < 6; i++) {
    const side = i < 3 ? fwd : rear, sgn = i < 3 ? -1 : 1, z = (i % 3 - 1) * 1.0;
    side.add(box(.14, 1.1 + hash(i, 5) * .9, .14, WOODD, { pos: [sgn * 2.7, 1.75, z], rot: [0, 0, sgn * (.3 + hash(i, 2) * .5)], inkW: .02 }));
  }
  // mast: stub + the snapped top piece + yard + torn sail + rags
  fwd.add(cyl(.14, .2, 1.8, WOODD, { pos: [.4, 1.9, 0], inkW: .02 }));
  const top = new THREE.Group(); top.position.set(.4, 2.8, 0); fwd.add(top);
  top.add(cyl(.1, .14, 3.4, WOODD, { pos: [0, 1.7, 0], inkW: .02 }));
  top.add(box(3.0, .1, .1, WOODD, { pos: [1.3, 3.0, 0], inkW: .015 }));
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0, 2.9); sh.lineTo(2.8, 2.9); sh.lineTo(2.3, 2.3); sh.lineTo(2.9, 1.8); sh.lineTo(1.9, 1.5); sh.lineTo(2.4, .9); sh.lineTo(1.3, .75); sh.lineTo(1.7, .15); sh.lineTo(.7, .35); sh.closePath();
  const sailG = new THREE.Group(); sailG.position.set(.1, .15, .06); top.add(sailG);
  const sailM = mesh(new THREE.ShapeGeometry(sh), toon(0xf8f2e4, { side: THREE.DoubleSide }), {}); sailG.add(sailM);
  const rags = [];
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.position.set(2.6 - i * .5, 2.2 - i * .7, .05); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .22), new THREE.MeshToonMaterial({ color: 0xf1e8d2, side: THREE.DoubleSide })); m.position.x = .65; g.add(m); sailG.add(g); rags.push(g); }
  // planks that fly off
  const PL = [];
  for (let i = 0; i < 18; i++) {
    const m = box(1.2 + hash(i, 1) * 1.2, .1, .26 + hash(i, 3) * .14, i % 3 ? WOOD : WOODD, { inkW: .02 }); m.visible = false; Wd.add(m);
    const ts = .35 + i * .43, vx = (hash(i, 7) - .3) * 6.5 + 1.2, vz = (hash(i, 9) - .5) * 7, vy = 4.5 + hash(i, 11) * 5.5, ox = (hash(i, 13) - .5) * 5, oy = 1.6 + hash(i, 15) * 1.2;
    PL.push({ m, ts, vx, vz, vy, ox, oy, sx: (hash(i, 17) - .5) * 9, sz: (hash(i, 19) - .5) * 9, sy: (hash(i, 21) - .5) * 5 });
  }
  const sc = Math.cos(-.3), sn = Math.sin(-.3);
  Wd.on(t => {
    const vis = t < 11; ship.visible = vis; PL.forEach(p => { if (!vis) p.m.visible = false; }); if (!vis) return;
    const h = S.heightAt(SHIP[0], SHIP[1], t), sl = S.slopeAt(SHIP[0], SHIP[1], t), br = sm(t, .4, 8.5);
    ship.position.set(SHIP[0], h - .75, SHIP[1]);
    ship.rotation.z = Math.atan(sl[0]) * .8 - .06 * br; ship.rotation.x = -Math.atan(sl[1]) * .8;
    fwd.position.set(2.9 + 1.4 * br, .35 * br, 0); fwd.rotation.z = .08 * Math.sin(t * 1.9) + .38 * br;
    rear.position.set(-2.9 - 1.4 * br, -1.0 * br, 0); rear.rotation.z = -.5 * br + .06 * Math.sin(t * 2.3 + 1);
    const fall = sm(t, 3.4, 6.6), drift = sm(t, 5.5, 9.5);
    top.rotation.z = .1 * Math.sin(t * 3) * (1 - fall) - 1.35 * fall; top.position.set(.4 - .9 * drift, 2.8 - 1.7 * drift - .3 * fall, 0); top.rotation.x = .25 * drift;
    sailG.rotation.y = .3 * Math.sin(t * 5.2) + .15 * Math.sin(t * 9.1); rags.forEach((g, i) => { g.rotation.z = .5 * Math.sin(t * 7 + i * 1.7); g.rotation.y = .6 * Math.sin(t * 6 + i); });
    PL.forEach(p => {
      const u = t - p.ts; if (u < 0) { p.m.visible = false; return; } p.m.visible = true;
      const sxw = SHIP[0] + sc * p.ox, szw = SHIP[1] - sn * p.ox, g = 9.8, tl = (p.vy + Math.sqrt(p.vy * p.vy + 2 * g * p.oy)) / g, uu = Math.min(u, tl), w = Math.max(u - tl, 0);
      const x = sxw + p.vx * uu + (p.vx * .12 + .6) * w, z = szw + p.vz * uu + p.vz * .08 * w, yb = p.oy + p.vy * uu - .5 * g * uu * uu, yw = S.heightAt(x, z, t) + .06;
      p.m.position.set(x, Math.max(yb, yw) + (u < tl ? 0 : 0), z);
      const k = 1 - .8 * clamp(w / 1.2, 0, 1);
      p.m.rotation.set(p.sx * uu * k * .35, p.sy * uu * k * .35, p.sz * uu * k * .35 + (w > 0 ? .08 * Math.sin(t * 2.2 + p.ts) : 0));
    });
  });

  // ================= the man on the plank (B) and on the shore (C) =================
  const WET = Object.assign({}, RAV, { coat: '#33465f', beard: '#6b5a4a' });
  const pivot = new THREE.Group(); Wd.add(pivot); pivot.rotation.order = 'YXZ';
  const walkEnd = 26.0;
  const manP = person(Wd, WET, t => {
    if (t < 22) return { pos: [0, -.5, 0], facing: 0, gesture: 'rest', talk: 0, shadow: false, look: .2 * Math.sin(t * .7), smile: 0 };
    const xx = lerp(3.4, 8.7, ease.io(prog(t, 22, walkEnd))), walking = t < walkEnd;
    return { pos: [0, 0, 0], facing: 0, gesture: walking ? null : 'explain', walk: walking ? t * 5.2 : undefined, talk: walking ? 0 : .3 + .35 * talkF(t + 1.3) * (Math.sin(t * 1.1) > -.3 ? 1 : .2), look: walking ? 0 : .2, smile: .12, shadow: true };
  }, { scale: 1 });
  pivot.add(manP.group);
  const plank = box(2.7, .12, .52, WOOD, { inkW: .02 }); Wd.add(plank);
  const wave = (S.k), gl = goldLine(Wd, { pos: [M[0], M[1]], y0: -.9, y1: 3.6, dash: .22, gap: .12, r: .022 });
  const OFFX = .95;
  Wd.on(t => {
    const inW = t >= 8.8 && t < 22; plank.visible = inW; gl.visible = inW;
    if (inW) {
      const rp = S.rideAt(M[0], M[1], t), rm = S.rideAt(M[0] + OFFX, M[1], t), sl = S.slopeAt(M[0], M[1], t);
      plank.position.set(rp.pos[0], rp.pos[1] - .02, rp.pos[2]); plank.rotation.z = Math.atan(rp.gx) * .9;
      const th = wave * (M[0] + OFFX) - wave * S.speed * t, ph = th - Math.PI / 2, bump = Math.pow(.5 + .5 * Math.cos(ph - 1.0), 3);
      const bow = .1 + .78 * bump + .45 * Math.atan(rm.gx);
      pivot.position.set(rm.pos[0], rm.pos[1] - .55, rm.pos[2]); pivot.rotation.set(clamp(bow, -.2, 1.0), -Math.PI / 2, 0);
    } else if (t >= 22) {
      const xx = lerp(3.4, 8.7, ease.io(prog(t, 22, walkEnd))); pivot.position.set(xx, hAt(xx), 0); pivot.rotation.set(0, t < walkEnd ? Math.PI / 2 : Math.PI / 2 + .05, 0);
    } else pivot.position.set(M[0], -3, M[1]);
  });
  // the pure phase check uses the same wave constants as the sea (k, speed)
  Wd.on(t => { Wd.hero = t < 9 ? ship : manP; });
  Wd.hero = ship;

  // ================= camera =================
  const camA = t => { const k = ease.io(prog(t, 0, 9));
    return { pos: [lerp(13.2, 3.6, k), lerp(6.4, 4.4, k), lerp(3.2, 6.4, k)], look: [lerp(-9, -14, k), lerp(1.6, 1.4, k), lerp(0, 1.4, k)], fov: lerp(52, 44, k) }; };
  const camB = t => { const k = ease.io(prog(t, 9, 22)), a = lerp(15, 200, k) * D, r = lerp(5.2, 3.9, k), h = lerp(1.5, 2.2, ease.sm(prog(t, 9, 22)));
    const yb = S.heightAt(M[0], M[1], t) * .35;
    return { pos: [M[0] + .35 + Math.sin(a) * r, h + yb, M[1] + Math.cos(a) * r], look: [M[0] + .4, .45 + yb, M[1]], fov: 44 }; };
  const camC = t => { const k = ease.io(prog(t, 22, 32));
    return { pos: [lerp(8.0, 9.4, k), lerp(2.55, 2.35, k), lerp(6.4, 4.8, k)], look: [9.7, 1.95, 0], fov: lerp(40, 36, k) }; };
  return Object.assign(Wd, { cam: seq([0, camA], [9, camB], [22, camC]) });
});

export const shots = [B7];
