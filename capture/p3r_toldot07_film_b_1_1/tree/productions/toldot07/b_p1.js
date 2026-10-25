// b_p1.js - film_b part 1: B1 (hook, the mirror sea and the gust) and B2 (the bowl in the classroom). Exports `shots`.
import { THREE, box, cyl, ball, toon, ease, prog, clamp, lerp, D, cloud, seq } from '../../lib/stage3d.js';
import { table, bookshelf, tree, rock, PAL as PP } from '../../lib/props3d.js';
import { PAL, seaWorld, boy, rav, mkShot, vlabel, fly, sm, talkF } from './shared.js';
import { sea, bottle } from './sea.js';

// ------------------------------------------------------------------ B1: dawn mirror, the gust, the bottle rides the waves
const B1 = mkShot(14, ['CAP_B_01', 'CAP_B_02'], [0.5, 7.1], () => {
  const Wd = seaWorld({ shadowExt: 8, elev: 27 });
  const S = sea(Wd, { amp: .36, wavelength: 7, dir: 0, gust: { front: t => lerp(-120, 110, prog(t, 6.2, 8.9)), width: 16 } });
  const b = bottle(Wd, { sea: S, at: [0, 0], scale: 4.2, yaw: .5 }); Wd.hero = b;
  [[-150, 36, -70, 7], [-170, 52, 40, 9], [-120, 28, 60, 6], [-190, 60, -10, 10], [-100, 44, -60, 5]].forEach(([x, y, z, s], i) => {
    const c = cloud({ seed: i + 3, size: s, color: 0xfff3e0, inkColor: 0xe0bfa0, pos: [x, y, z], cast: false }); c.scale.set(2.2, .8, 1.2); c.traverse(m => { if (m.material && m.material.isMeshToonMaterial) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(0xf2c9a0); m.material.emissiveIntensity = .6; } }); Wd.add(c); Wd.on(t => { c.position.x = x + t * .6; }); });
  const cam = t => { const k = ease.io(prog(t, 0, 14)), q = Math.pow(k, 2.4);
    return { pos: [lerp(3.2, 9.8, q), lerp(.3, 8.4, q), lerp(.5, 4.6, q)], look: [lerp(0, -1.5, q), lerp(.6, .2, q), lerp(0, -.5, q)], fov: lerp(52, 44, k) }; };
  return Object.assign(Wd, { cam });
});

// ------------------------------------------------------------------ B2: classroom bowl, ripples, match cut to the real sea
const FL = 6, TOP = FL + .8, C = [-1.8, TOP, 0];
function bowlWater(parent, R, level) {   // polar grid, vertex-displaced each frame
  const rings = 16, sect = 48, pos = [], idx = []; pos.push(0, 0, 0);
  for (let i = 1; i <= rings; i++) for (let j = 0; j < sect; j++) { const a = j / sect * Math.PI * 2, r = R * i / rings; pos.push(Math.cos(a) * r, 0, Math.sin(a) * r); }
  for (let j = 0; j < sect; j++) idx.push(0, 1 + (j + 1) % sect, 1 + j);
  for (let i = 0; i < rings - 1; i++) for (let j = 0; j < sect; j++) { const a = 1 + i * sect + j, b = 1 + i * sect + (j + 1) % sect, c = a + sect, d = b + sect; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, toon(PAL.seaShallow, { transparent: true, opacity: .93, side: THREE.DoubleSide })); m.position.y = level; m.receiveShadow = true; m.frustumCulled = false; parent.add(m); return m;
}
const B2 = mkShot(22, ['CAP_B_03', 'CAP_B_04', 'CAP_B_05'], [0.5, 7.57, 14.63], () => {
  const Wd = seaWorld({ shadowExt: 12, elev: 27, target: [-2, FL, 0], fogNear: 60 });
  const S = sea(Wd, { amp: .34, wavelength: 6, dir: 180 });
  // terrace + room (west wall with a big window, the sun comes in from the west)
  Wd.add(box(14, FL - .2, 14, 0xe6cf9f, { pos: [1, (FL - .2) / 2, 0], inkW: .04 }));
  Wd.add(box(6.6, .2, 5.4, 0xc79a62, { pos: [0, FL - .1, 0], inkW: .02 }));
  const wall = (w, h, d, x, y, z) => Wd.add(box(w, h, d, 0xf4e6c8, { pos: [x, FL + y, z] }));
  wall(6.6, 3.2, .16, 0, 1.6, -2.7);                                // north wall
  wall(.16, .9, 5.4, -3, .45, 0); wall(.16, .6, 5.4, -3, 2.9, 0);    // west wall below / above the window
  wall(.16, 1.7, 1.3, -3, 1.75, -2.05); wall(.16, 1.7, 1.1, -3, 1.75, 2.15);
  Wd.add(box(.34, .08, 3.2, 0xffffff, { pos: [-3, FL + .92, .1], inkW: .012 }));        // sill
  Wd.add(box(.1, 1.7, .08, 0xffffff, { pos: [-3, FL + 1.75, .1], inkW: .01 }));          // sash
  Wd.add(box(.1, .08, 3.0, 0xffffff, { pos: [-3, FL + 1.75, .1], inkW: .01 }));
  Wd.add(box(6.8, .1, .3, 0xd8c39a, { pos: [0, FL + 3.25, -2.7] }));                      // cornice
  bookshelf(Wd, { pos: [1.6, FL, -2.5], seed: 3 }); bookshelf(Wd, { pos: [.3, FL, -2.5], seed: 8 });
  Wd.add(box(1.8, .5, .5, 0x8a5c33, { pos: [2.3, FL + .25, 1.6] }));
  tree(Wd, { pos: [-4.6, FL - .2, 4.2], kind: 0 }); rock(Wd, { pos: [-5.2, FL - .2, -3], seed: 4 });
  table(Wd, { pos: [C[0], FL, 0], rot: Math.PI / 2 });
  // the bowl: glass, water with ripples running west (-x)
  const bowl = new THREE.Group(); bowl.position.set(...C); Wd.add(bowl);
  const glassProf = [[0, 0], [.2, 0], [.31, .03], [.4, .12], [.435, .3], [.44, .33]].map(p => new THREE.Vector2(p[0], p[1]));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(glassProf, 40), new THREE.MeshToonMaterial({ color: 0xd6efff, transparent: true, opacity: .26, side: THREE.DoubleSide, depthWrite: false })); bowl.add(glass);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.44, .012, 8, 48), new THREE.MeshBasicMaterial({ color: 0xffffff })); rim.rotation.x = Math.PI / 2; rim.position.y = .33; bowl.add(rim);
  const foot = new THREE.Mesh(new THREE.TorusGeometry(.2, .01, 8, 32), new THREE.MeshBasicMaterial({ color: 0xcfe6f2 })); foot.rotation.x = Math.PI / 2; foot.position.y = .01; bowl.add(foot);
  const water = bowlWater(bowl, .405, .2), wp = water.geometry.attributes.position, wl = wp.array.slice();
  const kk = Math.PI * 2 / .17, ww = kk * .38;
  const blow = t => sm(t, 1.0, 2.2) * (1 - sm(t, 14.5, 16.5));
  Wd.on(t => { const A = .0085 * blow(t) * (.7 + .3 * Math.sin(t * 2.3));
    for (let i = 0; i < wp.count; i++) { const x = wl[i * 3], z = wl[i * 3 + 2], env = clamp(.35 + .65 * (x / .4 + 1) / 2, 0, 1);
      wp.setY(i, A * env * Math.sin(kk * x + ww * t + z * 2.2 * .4) + A * .35 * Math.sin(kk * 1.7 * x + ww * 1.5 * t - z * 5)); }
    wp.needsUpdate = true; water.geometry.computeVertexNormals(); });
  // white wind ribbons from the boy's mouth over the water
  const RIB = [];
  for (let i = 0; i < 9; i++) { const L = 1.5, g = new THREE.PlaneGeometry(.55, .016, 16, 1), P = g.attributes.position;
    for (let v = 0; v < P.count; v++) { const x = P.getX(v); P.setY(v, P.getY(v) + .045 * Math.sin(x / .55 * 6.0 + i) * Math.cos(i * 1.7)); }
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.frustumCulled = false; Wd.add(m);
    RIB.push({ m, L, ph: i * .171, z: -.3 + (i % 5) * .15 + (i > 4 ? .04 : 0), y: TOP + .27 + (i % 4) * .028, v: 1.3 + (i % 3) * .25 }); }
  Wd.on(t => { const b = blow(t); RIB.forEach(r => { const s = ((t * r.v / r.L + r.ph) % 1 + 1) % 1, a = Math.sin(s * Math.PI);
    r.m.position.set(-1.12 - s * r.L, r.y, r.z + .05 * Math.sin(t * 2 + r.ph * 9)); r.m.material.opacity = .9 * b * Math.pow(a, .6) * (.75 + .25 * Math.sin(t * 7 + r.ph * 20)); }); });
  // people: the boy leans over the table and blows, the teacher stands behind him
  const bp = boy(Wd, t => ({ pos: [-.95, FL, 0], facing: -Math.PI / 2, gesture: 'rest', talk: .6 * blow(t) + .1, smile: .1, groundY: 0 }));
  Wd.on(() => { bp.group.rotation.z = .24; });
  rav(Wd, t => ({ pos: [.15, FL, -.5], facing: -Math.PI / 2 - .25, gesture: 'explain', talk: .35 + .35 * talkF(t) * sm(t, 2, 3), look: -.3, groundY: 0 }));
  const hp = new THREE.Group(), hm = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ visible: false })); hp.add(hm); Wd.add(hp); Wd.hero = hp;   // hero proxy: the bowl, then (after the match cut) the real sea ahead
  const fw = new THREE.Vector3();
  Wd.on((t, cam) => { if (t < 15.5) { hp.position.set(C[0], C[1] + .17, C[2]); hp.scale.set(.9, .4, .9); } else { cam.getWorldDirection(fw); hp.position.copy(cam.position).addScaledVector(fw, 14); hp.scale.set(8, 3, 8); } });
  vlabel(Wd, 'LBL_B_01', { pos: [C[0], C[1] + .85, C[2]], height: .2, show: t => sm(t, 3.2, 4.2) * (1 - sm(t, 13.5, 14.5)) });
  // camera: push-in 4 m -> 1.6 m, 40 degree orbit, then back through the window onto the real sea
  const polar = (t, r, a, h, fov) => { const A = a * D; return { pos: [C[0] + Math.sin(A) * r, C[1] + h, C[2] + Math.cos(A) * r], look: [C[0] + .1, C[1] + .14, C[2]], fov }; };
  const camA = t => { if (t < 9) { const k = ease.io(prog(t, 0, 9)); return polar(t, lerp(4, 1.6, k), 15, lerp(1.05, .5, k), lerp(42, 45, k)); }
    const k = ease.io(prog(t, 9, 15)); return polar(t, lerp(1.6, 1.9, k), lerp(15, -25, k), lerp(.5, .62, k), 45); };
  const P1 = camA(15).pos;
  const camB = fly([[15, P1, [C[0] + .1, C[1] + .14, C[2]], 45], [18, [-3.3, FL + 1.55, .2], [-12, FL + .6, -.2], 52], [22, [-9.5, FL + 2.6, -1.2], [-60, FL - 5.5, -6], 58]]);
  return Object.assign(Wd, { cam: seq([0, camA], [15, camB]) });
});

export const shots = [B1, B2];
