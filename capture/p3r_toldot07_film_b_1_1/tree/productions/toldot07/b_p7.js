// b_p7.js - film_b part 7: B12 (calm summer sea, chair and height pole) and B13 (winter storm at sea, buoy and the two-storey ruler). Exports `shots`.
import { THREE, box, cyl, ball, toon, ink, label, cloud, rain, ease, prog, clamp, lerp, D, rng, seq } from '../../lib/stage3d.js';
import { chair } from '../../lib/props3d.js';
import { PAL, seaWorld, boy, mkShot, vlabel, fly, sm } from './shared.js';
import { sea, beach } from './sea.js';

const C3 = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const mix3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ------------------------------------------------------------------ B12: summer sea, chair, height pole, boy at the water edge
const SL12 = .12;
function marker(Wd, base, x, z, h, hasLabels) {   // height pole standing on y = base, gold marks at .5 and 1 m
  const g = new THREE.Group(); g.position.set(x, base, z); Wd.add(g);
  g.add(cyl(.045, .045, h, 0xf6efe0, { pos: [0, h / 2, 0], inkW: .012 }));
  [.5, 1].forEach(m => g.add(box(.34, .07, .16, PAL.gold, { pos: [0, m, 0], inkW: .012 })));
  g.add(ball(.07, PAL.gold, { pos: [0, h + .04, 0] }));
  return g;
}
const B12 = mkShot(14, ['CAP_B_35', 'CAP_B_36'], [0.5, 7.1], () => {
  const Wd = seaWorld({ shadowExt: 14, elev: 30, target: [4, 0, 1], fogNear: 50, fogFar: 300 });
  const S = sea(Wd, { amp: .47, wavelength: 4.6, dir: 0, glint: 1 });
  const Bc = beach(Wd, { slope: SL12, x0: 0, z0: -26, z1: 26, xMin: -16, xMax: 40, floor: -3, wetX: 1.6 });
  const hAt = Bc.heightAt;
  // small run-ups of the gentle waves
  for (let i = 0; i < 9; i++) Bc.tongue({ t0: -2.5 + 1.75 * i, dur: 3.6, xBreak: -1.6, xMax: 1.5, z0: -18, z1: 18, thick: .18 });
  // chair (0.9 m) and the pole beside it, both on the dry sand
  const ch = chair(Wd, { pos: [6.6, hAt(6.6), -.3], rot: -Math.PI / 2 - .25, scale: .9 }); Wd.hero = ch;
  const pole = marker(Wd, hAt(8.0), 8.0, .7, 1.35);
  vlabel(Wd, 'LBL_B_09', { pos: [8.0, hAt(8.0) + .5 + .02, .7 + .0], height: .22, show: t => sm(t, 1.6, 2.4) });
  vlabel(Wd, 'LBL_B_10', { pos: [8.0, hAt(8.0) + 1.0 + .3, .7], height: .22, show: t => sm(t, 4.0, 4.8) });
  Wd.on(() => {});
  // a second pole standing in the shallows: the wave crests reach the 0.5 m mark
  marker(Wd, hAt(-3.0), -3.0, -2.2, 1.6 + 0.0).position.y = hAt(-3.0);
  // a few rocks / dry sand dressing on the beach
  { const r = rng(12); for (let i = 0; i < 7; i++) { const x = 3.5 + r() * 14, z = -9 + r() * 18; Wd.add(ball(.12 + r() * .12, 0xc9b183, { pos: [x, hAt(x) + .05, z], scale: [1.3, .6, 1] })); } }
  // the boy at the water edge: feet in the foam, calm, facing the sea
  boy(Wd, t => ({ pos: [.35 + .12 * Math.sin(t * .6), hAt(.35) , 3.4], facing: -Math.PI / 2 + .35, gesture: 'rest', talk: 0, smile: .35, look: .1 }));
  const cam = fly([[0, [9.8, hAt(6.6) + 1.9, 3.1], [6.6, hAt(6.6) + .8, -.2], 44], [7, [8.3, hAt(6.6) + .55, 2.2], [6.7, hAt(6.6) + .55, -.2], 40], [10.5, [3.4, .7, 1.7], [4.8, .8, -.1], 48], [14, [-1.6, .5, 2.2], [5.4, .9, -.1], 52]]);
  return Object.assign(Wd, { cam });
});

// ------------------------------------------------------------------ B13: winter storm at sea
const PK = t => 3.0 + 1.0 * sm(t, 10, 13) + 2.3 * sm(t, 18, 21.5);        // crest height at the ruler (m): 3, 4, then more than 6
const HGT = 11.5;                                                        // the single giant wave (m)
const BUOY = [6, 0, 7], RUL = [0, 0, 0];

function houseOutline(Wd) {
  const g = new THREE.Group(), W = 1.7, H = 6, gm = new THREE.MeshBasicMaterial({ color: PAL.gold, fog: false });
  const edge = (a, b, r) => { const d = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)), L = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), gm);
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) edge([sx * W, 0, sz * W], [sx * W, H, sz * W], .07);
  [0, 3, H].forEach(y => { [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].forEach(([a, b, c, d]) => edge([a * W, y, b * W], [c * W, y, d * W], y === 3 ? .045 : .07)); });
  // glass walls
  const wm = new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: .11, side: THREE.DoubleSide, depthWrite: false, fog: false });
  [[0, H / 2, W, 0], [0, H / 2, -W, 0], [W, H / 2, 0, Math.PI / 2], [-W, H / 2, 0, Math.PI / 2]].forEach(([x, y, z, ry]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, H), wm); p.position.set(x, y, z); p.rotation.y = ry; g.add(p); });
  // windows + door lines on the front (+x side faces the incoming view)
  [[-.8, 1.5], [.8, 1.5], [-.8, 4.5], [.8, 4.5]].forEach(([z, y]) => { const w = new THREE.Mesh(new THREE.BoxGeometry(.05, .9, .9), gm); w.position.set(W, y, z); g.add(w); });
  Wd.add(g); return g;
}

const B13 = mkShot(36, ['CAP_B_37', 'CAP_B_38', 'CAP_B_39', 'CAP_B_40'], [0.5, 9.3, 18.1, 26.9], () => {
  const Wd = seaWorld({ shadowExt: 16, elev: 24, az: 70, target: [0, 0, 0], fogNear: 30, fogFar: 300, sun: 1.5, hemi: .95, glow: .22 });
  // dark teal sky with a bright rim light
  const sk = Wd.sky.material.uniforms; sk.top.value.set(0x1d4a58); sk.bot.value.set(0x7fb0b4); Wd.scene.fog.color.set(0x7fb0b4);
  const rim = new THREE.DirectionalLight(0xdff6ff, 1.25); rim.position.set(40, 22, -40); Wd.add(rim);
  const S = sea(Wd, { amp: t => PK(t) * 1.25, wavelength: 60, dir: 0, deep: 0x11506a, shallow: 0x3da0ae, glint: .5 });
  // storm cloud ceiling (a ring with a clear hole over the ruler)
  const rr = rng(77), CL = [];
  for (let i = 0; i < 16; i++) { const a = rr() * Math.PI * 2, d = 24 + rr() * 60, y = 21 + rr() * 5, s = 6 + rr() * 5;
    const c = cloud({ seed: i + 4, size: s, color: 0x4f7681, inkColor: 0x27424d, pos: [Math.cos(a) * d, y, Math.sin(a) * d], puffs: 8, cast: false });
    c.scale.set(2.2, .9, 1.4); c.traverse(m => { if (m.material && m.material.isMeshToonMaterial) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(0x2d5560); m.material.emissiveIntensity = .55; } });
    Wd.add(c); CL.push([c, Math.cos(a) * d, Math.sin(a) * d]); }
  Wd.on(t => CL.forEach(([c, x, z]) => { c.position.x = x + t * .9; c.position.z = z; }));
  rain(Wd, { x0: -17, x1: 17, z0: -17, z1: 17, top: 24, bottom: -3, count: 1200, speed: 18, len: .9, seed: 31, color: 0xcfe6f0, opacity: .75 });
  // platform + the two-storey ruler
  Wd.add(box(5.6, 1.2, 5.6, 0xf4e6c8, { pos: [0, -.2, 0], inkW: .04 }));
  [0, 1].forEach(i => Wd.add(box(5.7, .22, 5.7, i ? PAL.gold : 0xe5473c, { pos: [0, .05 - i * .6, 0], ink: false })));
  houseOutline(Wd);
  // ruler post with ticks and 3D digits at 3, 4, 6
  Wd.add(cyl(.09, .09, 6.6, 0xffffff, { pos: [2.5, 3.3, 0], inkW: .02 }));
  [[3, '3'], [4, '4'], [6, '6']].forEach(([m, txt]) => {
    Wd.add(box(.9, .12, .22, PAL.gold, { pos: [2.5, m, 0], inkW: .02 }));
    const lb = label(Wd, txt, { height: 1.3, color: '#ffe9a8', bg: null, stroke: '#1c2b3a', size: 110, weight: 900 }); lb.position.set(3.7, m, 0);
    const k = m === 3 ? 4 : m === 4 ? 10 : 18.5, b0 = lb.scale.clone(); Wd.on(t => { const q = sm(t, k - .2, k + .6); lb.visible = q > .01; lb.scale.set(b0.x * Math.max(q, .001), b0.y * Math.max(q, .001), 1); });
  });
  // the buoy (yellow wave-buoy) and a second one far behind
  const mkBuoy = (sc) => { const g = new THREE.Group();
    g.add(ball(.8, 0xffd23a, { pos: [0, .25, 0], scale: [1, .62, 1], inkW: .04 })); g.add(cyl(.9, .9, .16, 0xe5473c, { pos: [0, .38, 0], inkW: .03 }));
    g.add(cyl(.09, .12, 2.2, 0xdcdcdc, { pos: [0, 1.5, 0], inkW: .02 })); g.add(ball(.2, 0xff5a2c, { pos: [0, 2.7, 0], inkW: .02 }));
    g.add(box(.9, .06, .06, 0x1c2b3a, { pos: [0, 2.1, 0], ink: false })); g.scale.setScalar(sc); Wd.add(g); return g; };
  const b1 = mkBuoy(2.1), b2 = mkBuoy(3.2); Wd.hero = b1;
  const B2P = [70, 0, -45];
  Wd.on(t => { const r = S.rideAt(BUOY[0], BUOY[2], t, .5); b1.position.set(r.pos[0], r.pos[1] - .15, r.pos[2]); b1.rotation.set(-Math.atan(r.gz) * .7, 0, Math.atan(r.gx) * .7);
    const q = S.rideAt(B2P[0], B2P[2], t, .5); b2.position.set(q.pos[0], q.pos[1] - .3, q.pos[2]); b2.rotation.set(-Math.atan(q.gz) * .7, 0, Math.atan(q.gx) * .7); });
  vlabel(Wd, 'LBL_B_11', { pos: t => [b1.position.x, b1.position.y + 5.2, b1.position.z], height: .9, show: t => sm(t, 2.2, 3.2) * (1 - sm(t, 8.5, 9.5)) });
  // the giant wave: a bump on top of the sea surface, vertex colours (deep -> foam), faded at its edges
  const NXs = 96, NZs = 56, SX0 = -34, SX1 = 14, ZH = 28, pos = new Float32Array((NXs + 1) * (NZs + 1) * 3), col = new Float32Array((NXs + 1) * (NZs + 1) * 4), idx = [];
  for (let i = 0; i < NXs; i++) for (let j = 0; j < NZs; j++) { const a = i * (NZs + 1) + j, b = a + 1, c = a + NZs + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gg.setAttribute('color', new THREE.BufferAttribute(col, 4)); gg.setIndex(idx);
  const gm = new THREE.Mesh(gg, toon(0xffffff, { vertexColors: true, transparent: true, side: THREE.DoubleSide })); gm.frustumCulled = false; gm.renderOrder = 2; Wd.add(gm);
  const DEEPc = C3(0x155a73), SHc = C3(0x44a8b6), FOAMc = [1, 1, 1];
  const prof = s => s < 0 ? .5 * (1 + Math.cos(Math.PI * clamp(s / -30, 0, 1))) : .5 * (1 + Math.cos(Math.PI * clamp(s / 9, 0, 1)));
  Wd.on(t => {
    const xc = lerp(-80, -9.5, ease.out(prog(t, 24, 35))), H = HGT * sm(t, 24, 31), vis = H > .05; gm.visible = vis; if (!vis) return;
    for (let i = 0; i <= NXs; i++) { const x = SX0 + (SX1 - SX0) * i / NXs + xc, s = x - xc;
      for (let j = 0; j <= NZs; j++) { const z = -ZH + 2 * ZH * j / NZs, e = .5 * (1 + Math.cos(Math.PI * clamp(Math.abs(z) / ZH, 0, 1))), ez = Math.pow(e, .6) * (1 + .07 * Math.sin(z * .7 + 1)),
          pf = prof(s), bump = H * pf * ez, v = (i * (NZs + 1) + j);
        pos[v * 3] = x; pos[v * 3 + 1] = S.heightAt(x, z, t) + bump + .04; pos[v * 3 + 2] = z;
        const hr = clamp(bump / Math.max(H, .1), 0, 1), crest = clamp((hr - .72) * 5 + .6 * Math.max(0, Math.sin(z * 1.9 + s * 2.3)) * (hr > .5 ? 1 : 0), 0, 1) * (hr > .45 ? 1 : 0);
        const c = mix3(mix3(DEEPc, SHc, hr * 1.3), FOAMc, crest); col[v * 4] = c[0]; col[v * 4 + 1] = c[1]; col[v * 4 + 2] = c[2]; col[v * 4 + 3] = clamp(bump / 1.2, 0, 1); } }
    gg.attributes.position.needsUpdate = true; gg.attributes.color.needsUpdate = true; gg.computeVertexNormals();
  });
  // camera: above the clouds looking down, drop to the buoy, orbit 120 degrees around the ruler, end with the giant wave over the house
  const C = [0, 0, 0];
  const camA = fly([[0, [-14, 33, 20], [-3, 0, -3], 58], [3.4, [-22, 15, 17], [-3, 1, -4], 54], [7, [-18.2, 3.4, 5.6], [0, 3.2, 0], 52]]);
  const orb = t => { const k = ease.io(prog(t, 7, 29)), a = lerp(-73, 47, k) * D, r = lerp(19, 17.5, k), h = lerp(3.4, 4.6, k);
    return { pos: [C[0] + Math.sin(a) * r, h, C[2] + Math.cos(a) * r], look: [0, lerp(3.2, 5.2, k), 0], fov: lerp(52, 56, k) }; };
  const P29 = orb(29).pos;
  const camC = fly([[29, P29, [0, 5.2, 0], 56], [36, [P29[0] + 1.5, 2.6, P29[2] + .5], [-5, 6.5, -.5], 60]]);
  return Object.assign(Wd, { cam: seq([0, camA], [7, orb], [29, camC]) });
});

export const shots = [B12, B13];
