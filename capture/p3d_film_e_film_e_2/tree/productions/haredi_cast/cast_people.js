/* haredi cast - 3D cel-shaded people for the lesson films: boy, bochur, rabbi A, rabbi B (+ the approved man re-exported).
   Built exactly like productions/haredi_man/man3d.js (toon3d primitives on bones, inverted-hull ink, one shadow tone,
   2D faces from people2d.js drawn live on decals, planted-feet walk, coat skirt that follows the knees with lag),
   but every person is generated from their own 2D design object (K.P_D.<who> in people2d.js): body scale, head scale and
   shape, beard none / short / full / pointed, glasses, hat / tall round hat / velvet kippa, coat or jacket length, shirt.

   Page must load (classic scripts, in this order): ../elements2d/core.js, animals.js, bodies.js,
   ../haredi_man/man2d.js (for makeMan), people2d.js.   Then:
     import { makeBoy, makeBochur, makeRabbiA, makeRabbiB, makeMan, makePerson } from './cast_people.js';
     const p = makeRabbiA();  scene.add(p.root);

   PUBLIC API (identical to makeMan, so a film adapter can swap characters):
     p.pose(po)            every frame. po (all optional): t (s), x, z, yaw (rad, 0 = facing +x), walk 0..1, ph (cycles;
                           use distance / p.cycle for planted feet), step (in-place step phase), lean (deg, + forward),
                           bob (+ = down), twist (rad), headYaw (rad), headRot (deg, - = chin up), headTilt (deg),
                           arms: { l: {...}, r: {...} } radians: sz forward swing, sx out, sy, el elbow bend, tw forearm
                           twist, wz wrist, curl fingers, th thumb, point (true = index straight)
     await p.face.set(st)  st = { expr: smile (default, 'neutral' = same) | laugh | explaining | surprised | thinking |
                           proud | worried, talk: null | X | A | E | O | U | M, blink: bool, look: [x, y] }
     p.cycle               world distance per walk cycle (already includes the person's body scale)
     p.root / body / head / arms / legs / hat / shadow / kind / height (approx. top of the hat, world units)
   Units = 2D body units (ground y = 0); the man is about 300 tall, the boy about 200. */
import { THREE, toon, part, ell, tube, lathe, tubeAlong, V, D2R, sphereDecal, faceRig, cfg, sm } from '../../lib/toon3d/toon3d.js';
import { mergeVertices } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
const K = window.K;
const HDU = 1 / 0.47;          // head drawing units per 3D unit (the 2D head box is drawn at scale 0.47 on the body)
const LEG = { hipY: 118, L1: 56, L2: 56, sole: 12, stride: 66, duty: 0.6, lift: 24 };

function setSeg(bone, a, b) {   // a, b in y-up coords; tube hangs along -y from the bone origin
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  bone.position.set(a[0], a[1], bone.position.z); bone.rotation.set(0, 0, Math.atan2(dx, -dy)); bone.scale.set(1, len / bone.userData.len, 1);
}
// deformable mesh: keeps the rest positions of the mesh and of its hull so a function of position can bend both
function deformable(m) {
  const g = m.geometry, h = m.userData.hull.geometry;
  m.userData.rest = [g.attributes.position.array.slice(), h.attributes.position.array.slice()];
  m.userData.apply = fn => {
    [g, h].forEach((geo, k) => {
      const P = geo.attributes.position, R = m.userData.rest[k];
      for (let i = 0; i < P.count; i++) { const o = fn(R[3 * i], R[3 * i + 1], R[3 * i + 2]); P.setXYZ(i, o[0], o[1], o[2]); }
      P.needsUpdate = true; geo.computeVertexNormals();
    });
  };
}

// small curls over the back of the head (below the hat, behind the ears)
function bumpsList() {
  const out = [], ga = Math.PI * (3 - Math.sqrt(5)), n = 90;
  for (let i = 0; i < n; i++) {
    const y = 1 - 2 * (i + 0.5) / n, rr = Math.sqrt(1 - y * y), a = i * ga, u = [Math.cos(a) * rr, y, Math.sin(a) * rr];
    if (u[0] > -0.35 || u[1] > 0.75 || u[1] < -0.55) continue;
    out.push([-13 + u[0] * 18, 35 + u[1] * 24, u[2] * 22.5, 5.5 + 1.2 * Math.sin(i * 7.1)]);
  }
  return out;
}
export { makeMan } from '../haredi_man/man3d.js';
export const makeBoy = () => makePerson(K.P_D.boy, 'boy');
export const makeBochur = () => makePerson(K.P_D.bochur, 'bochur');
export const makeRabbiA = () => makePerson(K.P_D.rabbiA, 'rabbiA');
export const makeRabbiB = () => makePerson(K.P_D.rabbiB, 'rabbiB');
const RING = new THREE.TorusGeometry(11.2, 0.55, 8, 40);
export function makePerson(D, kind) {
  const c = { kind: kind || 'person' };
  const bx = D.bx || 1, by = D.by || 1, hk = D.hk || 1, hsx = D.hsx || 1, hsy = D.hsy || 1;
  const armK = D.armK || 1, handK = D.handK || 1, footK = D.footK || 1, shW = D.shW || 1, stance = D.stance || 1, STR = LEG.stride * (D.strideK || 1), jawW = D.jawW || 1;
  const hem2 = D.hem == null ? -58 : D.hem, hem3 = (-hem2 - 118) + 7, beard = D.beardK || 'full', shortCoat = hem2 > -70;
  const mSkin = toon(D.skin, { tint: D.skinT }), mBeard = toon(D.beard, { tint: D.beardT, hi: 0 }), mHair = toon(D.hair, { tint: D.beardT, hi: 0 }),
    mHat = toon(D.hat, { tint: D.hatT }), mBand = toon(D.band, { tint: '#8f8aa0', hi: 0 }), mCoatHi = toon(D.coatHi, { hi: 0 }),
    mPants = toon(D.pants, { tint: D.coatT }), mShoe = toon(D.shoe, { tint: D.hatT }), mShirt = toon(D.shirt, { tint: D.shirtT }),
    mLip = toon(D.lip, { tint: D.skinT, hi: 0 }), mBtn = D.lapels === false ? toon('#ffffff', { tint: '#c9c6d4' }) : toon('#18161c', { tint: '#8f8aa0' }), mGl = toon('#2b2626', { tint: '#8f8aa0', hi: 0 });
  const mCoat = toon(D.coat, D.lapels === false ? { tint: D.coatT } : { tint: D.coatT, regions: [{ p: [42, 86, 0], r: [20, 30, 11], c: D.shirt, w: 0 }] });
  mCoat.side = THREE.DoubleSide;
  const mArm = toon(D.coat, { tint: D.coatT });
  c.root = new THREE.Group();
  c.fig = new THREE.Group(); c.fig.scale.set(bx, by, bx); c.root.add(c.fig);     // body scale of this person
  c.body = new THREE.Bone(); c.body.position.set(0, LEG.hipY, 0); c.fig.add(c.body);

  /* ---------- coat: one lathe from hem to collar, belly pushed forward, flattened in depth ---------- */
  const prof = [[46, -51], [46, -42], [42, -24], [40, -4], [40, 14], [43, 34], [47, 54], [47, 72], [40, 86], [26, 97], [12, 103], [2, 105]]
    .map(([r0, y]) => y >= 14 ? [r0 * (D.lapels === false ? 0.9 : 1), y] : [shortCoat ? Math.min(r0 * (D.lapels === false ? 0.9 : 1), D.lapels === false ? 37 : 41) : r0, 14 + (y - 14) * (14 - hem3) / 65]);
  const cg = lathe(prof, 56);
  { const P = cg.attributes.position;
    for (let i = 0; i < P.count; i++) {
      let x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const bel = Math.exp(-Math.pow((y - 26) / 34, 2)) * Math.max(0, (D.belly || 1) - 1) * 0.9;
      if (x > 0) x *= (1 + bel) * (1 - 0.3 * sm((y - 50) / 50)); else x *= 0.9 - 0.26 * sm((y - 10) / 60);
      z *= 0.84 * D.bodyW;
      P.setXYZ(i, x + 4, y, z);
    }
    cg.computeVertexNormals(); }
  c.coat = part(c.body, cg, mCoat, 3.2);
  deformable(c.coat);
  const surf = (y, a) => {           // approx point on the coat surface at height y, angle a (0 = front)
    let r0 = 0; for (let i = 1; i < prof.length; i++) if (y <= prof[i][1]) { const t = (y - prof[i - 1][1]) / (prof[i][1] - prof[i - 1][1]); r0 = prof[i - 1][0] + (prof[i][0] - prof[i - 1][0]) * t; break; }
    let x = Math.cos(a) * r0, z = Math.sin(a) * r0; const bel = Math.exp(-Math.pow((y - 26) / 34, 2)) * Math.max(0, (D.belly || 1) - 1) * 0.9;
    if (x > 0) x *= (1 + bel) * (1 - 0.3 * sm((y - 50) / 50)); else x *= 0.9 - 0.26 * sm((y - 10) / 60); return V(x + 4, y, z * 0.84 * D.bodyW);
  };
  // lapels, front opening, buttons, back seam (ink-light lines lying on the coat)
  const lineOn = (pts, w) => { const g = tubeAlong(pts.map(([y, a]) => surf(y, a).multiplyScalar(1.012)), w, { segs: 30, radial: 6 }); part(c.body, g, mCoatHi, 0); };
  if (D.lapels === false) {   // plain shirt: placket + small white buttons
    lineOn([[100, 0.05], [60, 0.05], [Math.max(hem3 + 4, 0), 0.05]], 1.0);
    for (let y = 90; y > hem3 + 6; y -= 16) part(c.body, ell(1.5, 1.5, 1.2, 10, 8), mBtn, 0.6, surf(y, 0.06).multiplyScalar(1.015).toArray());
    for (const s of [-1, 1]) {   // pointed shirt collar
      const g = new THREE.ConeGeometry(5, 13, 3); g.scale(1, 1, 0.35); g.rotateX(Math.PI); g.rotateZ(-0.5); g.rotateY(-s * 0.35);
      part(c.body, g, mShirt, 1.0, [19, 101, s * 7]);
    }
  } else {
    lineOn([[100, 0.38], [84, 0.24], [64, 0.08], [50, 0.02]], 1.3); lineOn([[100, -0.38], [84, -0.24], [64, -0.08], [50, 0.02]], 1.3);
    lineOn([[50, 0.03], [30, 0.04], [Math.max(hem3 + 6, 6), 0.04]], 1.1);
    for (const y of [44, 28, 12].filter(v => v > hem3 + 8)) part(c.body, ell(3, 3, 3, 12, 8), mBtn, 1.2, surf(y, 0.16).multiplyScalar(1.02).toArray());
  }
  lineOn([[96, Math.PI], [60, Math.PI], [Math.max(hem3 + 6, 20), Math.PI]], 1.0);
  if (!shortCoat) for (const s of [-1, 1]) part(c.body, ell(3, 3, 3, 12, 8), mBtn, 1.2, surf(16, Math.PI - s * 0.5).multiplyScalar(1.02).toArray());
  // collar (white) around the neck
  part(c.body, lathe([[17, 96], [18, 104], [16, 108]], 28).scale(1, 1, 0.9).translate(6, 0, 0), mShirt, 2.2);
  // tzitzit: white strings hanging below the hem at both sides
  c.tz = [];
  for (const s of [-1, 1]) {
    const g0 = new THREE.Group(); g0.position.set(2, hem3 + 7, s * 36); c.body.add(g0); c.tz.push(g0);
    for (let i = 0; i < 4; i++) { const l = 30 + 8 * Math.sin(i * 2.1 + 0.6); const g = tube(1.1, 0.9, l, 8); g.translate((i - 1.5) * 2.2, 0, 0); part(g0, g, mShirt, 1.2); }
    for (let j = 0; j < 3; j++) part(g0, ell(4, 2.6, 3.2, 12, 8), mShirt, 1.2, [0, -3 - j * 5.5, 0]);   // knots
  }

  /* ---------- head ---------- */
  c.head = new THREE.Bone(); c.head.position.set(0, 106, 0); c.head.scale.set(1.1 * hk * hsx / bx, 1.1 * hk * hsy / by, 1.1 * hk * hsx / bx); c.body.add(c.head);
  part(c.head, tube(13, 14, 22, 16).translate(0, 18, 0), mSkin, 0);              // neck (inside)
  const F = [1, 30, 0], FR = [26 * (jawW > 1 ? 1.03 : 1), 30, 24.5 * jawW];                                       // face ellipsoid
  part(c.head, ell(...FR), mSkin, 2.6, F);
  for (const s of [-1, 1]) part(c.head, ell(3.6, 7.5, 3, 16, 12), mSkin, 2.0, [-4, 28, s * 24.5], [0, 0, 0.1]);
  // hair at the back under the hat: one cap + many small curls
  if (!D.crop) part(c.head, ell(18, 24, 22.5, 32, 24), mHair, 2.4, [-13, 35, 0]);
  if (!D.crop) for (const [x, y, z, r] of bumpsList()) part(c.head, ell(r, r, r, 12, 8), mHair, 1.6, [x, y, z]);
  if (D.hatK === 'kippa') {   // short hair over the whole top + a velvet kippa clearly on top of it
    part(c.head, ell(25.2, 15, 25.6, 32, 20), mHair, 1.4, [-4, 49, 0]);   // short crop: thin cap, ends above the ears and at the nape
    part(c.head, ell(14, 13, 21.5, 24, 14), mHair, 1.2, [-17.5, 36, 0]);   // nape
    c.hat = new THREE.Group(); c.hat.position.set(-6, 59.5, 0); c.hat.rotation.z = 0.3; c.head.add(c.hat);
    part(c.hat, ell(20, 6.5, 20, 32, 16), mHat, 2.2);
    part(c.hat, new THREE.TorusGeometry(19.2, 1.0, 8, 48).rotateX(Math.PI / 2).translate(0, -0.6, 0), toon('#6a7cc4', { tint: '#8a90b8', hi: 0 }), 0);
  }
  // beard: core + clumps, measured from the 2D front head (eyes at y 30, mouth 37 units below the eyes, bottom 71 below)
  if (beard !== 'none') {
    const pt = y => D.bPoint ? 1 - D.bPoint * Math.min(1, Math.max(0, -y / 45)) : 1;
    const BC = [10, -13, 0], BR = [21, 31 * D.bLen, 22 * D.bW * (D.bPoint ? 0.85 : 1)];
    part(c.head, ell(...BR, 32, 24), mBeard, 2.6, BC);
    for (const [x, y, z, r] of [[15, -7, 15, 8.5], [15, -7, -15, 8.5], [19, -16, 11, 10], [19, -16, -11, 10], [21, -27, 4, 10], [21, -27, -4, 10],
      [18, -35, 9, 9.5], [18, -35, -9, 9.5], [12, -42, 0, 10], [5, -24, 18, 9], [5, -24, -18, 9], [-4, -14, 17, 8], [-4, -14, -17, 8],
      [10, -40, 13, 8.5], [10, -40, -13, 8.5], [0, -38, 6, 8.5], [0, -38, -6, 8.5]]) {
      const rr = r * (beard === 'short' ? 0.8 : 1) * (D.bPoint ? 0.6 + 0.4 * pt(y) : 1);
      part(c.head, ell(rr, rr * 1.08, rr, 16, 12), mBeard, 1.9, [x + Math.max(0, -y - 10) * 0.32, y * D.bLen, z * D.bW * pt(y)]);
    }
    if (D.bPoint) part(c.head, ell(6, 9, 6, 16, 12), mBeard, 1.8, [16, -56 * D.bLen, 0]);   // pointed tip
    // lip / mouth plate (the 2D mouth is drawn on it) and the mustache
    var MP = [24.5, -4.5, 0], MR = [7.5, 9, 13];
    part(c.head, ell(6.5, 7.5, 11, 24, 16), mBeard, 1.2, MP);
    const mw = beard === 'short' ? 0.85 : 1;
    for (const s of [-1, 1]) {   // mustache with lifted corners
      const g = tubeAlong([V(27.5, 6, s * 1), V(27, 5, s * 7 * mw), V(24.5, 3.5, s * 12 * mw), V(21.5, 5.5, s * 15 * mw)], t => (4.2 - 1.6 * t) * mw, { segs: 20, radial: 12 });
      part(c.head, g, mBeard, 1.8);
    }
  }
  // nose: small soft button, inside the face silhouette (profile bump about 1/5 of the head depth)
  part(c.head, ell(5.6, 5.8, 6.4, 20, 14), mSkin, 1.7, [23.5, beard === 'none' ? 17 : 14, 0]);
  // pe'ot: corkscrews in front of the ears
  for (const s of [-1, 1]) {
    const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * Math.PI * 2 * 4.2; pts.push(D.crop ? V(1.5 + Math.cos(a) * 1.7 + t * 1.5, 33 - t * 28, s * (25.5 + Math.sin(a) * 1.7 + t * 1.5))
      : V(-8 + Math.cos(a) * 2.6 * (D.peyR || 1) + t * 2, 33 - t * 33 * (D.pey || 1), s * (24 + Math.sin(a) * 2.6 * (D.peyR || 1) + t * 1.5))); }
    part(c.head, tubeAlong(pts, t => D.crop ? 1.5 - 0.4 * t : (2.7 - 0.9 * t) * (D.peyR || 1), { segs: 120, radial: 8 }), mHair, 1.4);
  }
  // hat: brim (thin lathe with a rolled edge), crown with the centre dent, band
  if (D.hatK !== 'kippa') {
    if (D.hatK === 'hat2') for (const s of [-1, 1]) { part(c.head, ell(9, 11, 5, 16, 12), mHair, 1.4, [-6, 41, s * 21]); part(c.head, ell(8, 8, 5, 14, 10), mHair, 1.2, [-14, 36, s * 18]); }
  c.hat = new THREE.Group(); c.hat.position.set(-2, D.hatK === 'hat2' ? 51 : 58, 0); c.hat.rotation.z = D.hatK === 'hat2' ? 0.06 : 0.11; c.head.add(c.hat);
  const brim = lathe([[0.1, -0.6], [44, -1.4], [49, -0.6], [50, 1.4], [48, 2.0], [26, 1.6], [0.1, 1.4]], 64); brim.scale(0.96 * (D.brimW || 1), 1, 0.9 * (D.brimW || 1));
  if (D.hatK === 'hat2') { const P = brim.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), rr = Math.hypot(x / 1.0, z / 0.9);
      P.setY(i, P.getY(i) + 7 * Math.pow(Math.max(0, rr - 30) / 16, 2) * (0.45 + 0.55 * Math.abs(z) / (rr + 1e-3))); } brim.computeVertexNormals(); }
  part(c.hat, brim, mHat, 2.2);
  const crown = lathe([[25.5, 0], [25.8, 14], [25, 28], [21.5, 35.5], [12, 38], [0.1, 38]], 48); crown.scale(1.06, D.crownH || 0.86, 1);
  { const P = crown.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i), z = P.getZ(i), x = P.getX(i);
      if (y > 24) P.setY(i, y - 9 * Math.exp(-Math.pow(z / 9, 2)) * sm((y - 24) / 14) * (0.6 + 0.4 * Math.min(1, Math.abs(x) / 20))); }
    crown.computeVertexNormals(); }
  part(c.hat, crown, mHat, 2.4);
  part(c.hat, lathe([[26.4, 0.5], [26.6, 8], [26.3, 8.4]], 48).scale(1.06, 1, 1), mBand, 0);
  }
  if (D.glasses) {   // round glasses in front of the eye decals
    for (const s of [-1, 1]) {
      const m = part(c.head, RING, mGl, 0, [24.8, 27.5, s * 13.4], [0, Math.PI / 2 - s * 0.5, 0]);
      part(c.head, tubeAlong([V(20.5, 29, s * 22.5), V(8, 30, s * 25.5), V(-6, 29, s * 25.5)], 0.9, { segs: 12, radial: 6 }), mGl, 0.6);
      void m;
    }
    part(c.head, tubeAlong([V(27.5, 28.5, -4), V(29.2, 30.5, 0), V(27.5, 28.5, 4)], 0.9, { segs: 12, radial: 6 }), mGl, 0.6);
  }
  // face decals: eyes + brows on the face ellipsoid, mouth on the lip plate
  const eyes = sphereDecal(c.head, F, FR, { phi: 1.5, th0: 0.32, th1: 1.95, cx: 150, cy: 136, du: HDU, cw: 900 });
  const mou = beard !== 'none' ? sphereDecal(c.head, MP, MR, { phi: 1.25, th0: 0.55, th1: 2.55, cx: 150, cy: 207, du: HDU, k: 1.02 })
    : sphereDecal(c.head, F, FR, { phi: 0.9, th0: 2.02, th1: 2.85, cx: 150, cy: 136, du: HDU, k: 1.016 });
  const mdy = beard !== 'none' ? 0 : 198 - 204;
  c.face = faceRig({ eyes, mou }, st => ({ eyes: `<g transform="translate(150 139) scale(${1.0 * (D.eyeK || 1)}) translate(-150 -134)">${K.pEyesFront(st, D)}</g>`,
    mou: `<g transform="translate(0 ${mdy})">${K.pMouthFront(st, D)}</g>` }));

  /* ---------- arms ---------- */
  c.arms = [-1, 1].map(s => {
    const sh = new THREE.Bone(); sh.position.set(2, 78, s * 44 * shW); sh.scale.set(armK, 1, armK); c.body.add(sh);
    part(sh, ell(12, 12, 12, 20, 14), mArm, 2.6);
    part(sh, tube(12.6, 11, 46, 20), mArm, 2.6);
    const el = new THREE.Bone(); el.position.set(0, -46, 0); sh.add(el);
    part(el, ell(11, 11, 11, 16, 12), mArm, 2.4);
    part(el, tube(11, 11.8, 38, 20), mArm, 2.6);
    part(el, tube(10.4, 10.2, 7, 18).translate(0, -35, 0), mShirt, 2.0);
    const wr = new THREE.Bone(); wr.position.set(0, -42, 0); wr.scale.set(1.3 * handK / armK, 1.3 * handK, 1.3 * handK / armK); el.add(wr);
    // hand: palm faces the body (-s*z), thumb forward (+x); fingers are bones that curl toward the palm
    part(wr, ell(7, 8.5, 4.2, 18, 12), mSkin, 2.0, [0, -8, 0]);
    const fingers = [-4.2, 0, 4.2].map((x, i) => { const b = new THREE.Bone(); b.position.set(x, -14, 0); wr.add(b);
      part(b, tube(3.1, 2.8, i === 1 ? 11.5 : 10.5, 10), mSkin, 1.7); return b; });
    const th = new THREE.Bone(); th.position.set(7, -5, -s * 2.5); wr.add(th); part(th, tube(3.6, 3.1, 12, 10), mSkin, 1.7); th.rotation.z = 0.9;
    return { s, sh, el, wr, fingers, th };
  });

  /* ---------- legs ---------- */
  c.legs = [{ o: 0, z: 15 * stance }, { o: 0.5, z: -15 * stance }].map(L => {
    const up = new THREE.Bone(), lo = new THREE.Bone(), ft = new THREE.Bone();
    c.fig.add(up); c.fig.add(lo); c.fig.add(ft);
    up.userData.len = LEG.L1; lo.userData.len = LEG.L2;
    part(up, tube(13.5, 12, LEG.L1, 18), mPants, 2.6); part(lo, ell(12, 12, 12, 16, 12), mPants, 2.4);
    part(lo, tube(12, 10.5, LEG.L2, 18), mPants, 2.6);
    const sg = lathe([[0.1, -11], [9, -10], [11.5, -4], [10.5, 3], [7, 7], [0.1, 8]], 24); sg.rotateZ(-Math.PI / 2); sg.scale(1, 0.78, 0.6);
    sg.scale(1.25, 1.15, 1.25); sg.translate(13, -6, 0); part(ft, sg, mShoe, 2.4);
    part(ft, ell(9, 6, 9, 14, 10).translate(-4, -5, 0), mShoe, 2.2);
    up.position.z = lo.position.z = ft.position.z = L.z; ft.scale.setScalar(footK);
    return Object.assign(L, { up, lo, ft });
  });
  c.cycle = STR / LEG.duty * bx;
  c.height = (D.hatK === 'kippa' ? 300 : 330) * by;
  // contact shadow under the feet
  c.shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: 0x2c3a18, transparent: true, opacity: 0.28, depthWrite: false }));
  c.shadow.rotation.x = -Math.PI / 2; c.shadow.position.set(6, 0.7, 0); c.shadow.scale.set(58 * bx, 34 * bx, 1); c.root.add(c.shadow);

  /* ---------- pose ----------
     po: {t, x, z, yaw, walk, ph, step, lean, headYaw, headRot, headTilt, arms: {l:{sz,sx,el,tw,curl,th}, r:{...}} (radians), face} */
  c.pose = po => {
    const walk = po.walk || 0, ph = po.ph || 0, t = po.t || 0;
    const bob = 3.6 * (D.bounce || 1) * walk * Math.cos(4 * Math.PI * (ph - 0.04)) + (po.bob || 0);     // + = down (2D convention)
    const breathe = Math.sin(t * 2.1);
    c.root.position.set(po.x || 0, 0, po.z || 0); c.root.rotation.set(0, po.yaw || 0, 0);
    const lean = ((po.lean || 0) + 2 * walk) * D2R;
    c.body.position.set(0, LEG.hipY - bob, 0); c.body.rotation.set(0, (po.twist || 0) + 0.03 * walk * Math.sin(2 * Math.PI * ph), -lean);
    c.coat.scale.set(1, 1 + 0.008 * breathe, 1 + 0.012 * breathe);
    const knees = [];
    for (const L of c.legs) {
      const hip = [L.z > 0 ? 4 : -4, -LEG.hipY + bob];
      const f0 = K.footPath(ph + L.o, STR, LEG.duty, LEG.lift * Math.min(1.3, D.bounce || 1));
      const g = { x: f0.x * walk + (L.z > 0 ? 6 : -6) * (1 - walk), y: f0.y * walk, st: walk > 0.05 ? f0.st : 0, q: walk > 0.05 ? f0.q : -1 };
      if (po.step && walk <= 0.05) { const s2 = K.footPath(po.step + L.o, 0, 0.6, 10); g.y = s2.y; g.q = s2.q; g.st = s2.st; }
      const ang = K.pShoeAng(g);
      let ank;
      if (g.q < 0 && ang > 0.01) { const a = ang * D2R, tx = 24, ty = LEG.sole; ank = [g.x + tx - (tx * Math.cos(a) - ty * Math.sin(a)), g.y - (tx * Math.sin(a) + ty * Math.cos(a))]; }
      else ank = [g.x, g.y - LEG.sole];
      const kn = K.ik(hip, ank, LEG.L1, LEG.L2, 1);
      const to3 = p => [p[0], -p[1]];
      setSeg(L.up, to3(hip), to3(kn)); setSeg(L.lo, to3(kn), to3(ank));
      L.ft.position.set(ank[0], -ank[1], L.z); L.ft.rotation.set(0, 0, -ang * D2R);
      knees.push(kn[0]);
    }
    // coat skirt follows the knees (front edge forward with the leading knee, back edge with the trailing one)
    // hem lag: the skirt follows the knees of ~2 frames earlier (secondary motion)
    const lagK = c.legs.map(L => { const f0 = K.footPath(ph - 0.07 + L.o, STR, LEG.duty, LEG.lift);
      const ank = [f0.x * walk + (L.z > 0 ? 6 : -6) * (1 - walk), f0.y * walk - LEG.sole]; return K.ik([L.z > 0 ? 4 : -4, -LEG.hipY + bob], ank, LEG.L1, LEG.L2, 1)[0]; });
    void knees;
    const kmax = Math.max(...lagK), kmin = Math.min(...lagK), kav = (kmax + kmin) / 2;
    c.coat.userData.apply((x, y, z) => {
      if (y > 0) return [x, y, z];
      const u = Math.min(1, -y / Math.max(8, -hem3)), u2 = u * u;
      let dx = kav * 0.35 * u2;
      if (x > 4) dx += Math.max(0, kmax - 8) * 0.55 * u2; else dx += Math.min(0, kmin + 8) * 0.55 * u2;
      return [x + dx, y + (x > 4 ? 6 : 2) * walk * u2 * Math.max(0, (kmax - 10) / 30), z];
    });
    c.tz.forEach((g0, i) => { g0.rotation.set(0, 0, -0.12 * walk * Math.sin(2 * Math.PI * (ph - 0.2 + i * 0.5)) - 0.04); g0.position.x = 2 + kav * 0.3; });
    // arms: walk swing + pose overrides
    const A = po.arms || {};
    for (const a of c.arms) {
      const o = a.s > 0 ? 0 : 0.5, P = (a.s > 0 ? A.r : A.l) || {};
      const swing = -0.62 * (D.swing || 1) * walk * Math.cos(2 * Math.PI * (ph + o - 0.08));
      a.sh.rotation.set((P.sx == null ? 0.1 : P.sx) * -a.s, P.sy || 0, (P.sz == null ? 0.06 + swing : P.sz));
      a.el.rotation.set(0, 0, P.el == null ? 0.36 + 0.5 * walk * Math.max(0, Math.sin(2 * Math.PI * (ph + o - 0.33))) : P.el);
      a.wr.rotation.set(0, (P.tw || 0) * a.s, P.wz || 0);
      const curl = P.curl == null ? 0.5 : P.curl;
      a.fingers.forEach((f, i) => f.rotation.set(curl * a.s * (i === 2 && P.point ? 0 : 1) * 1.3, 0, 0));
      a.th.rotation.set((P.th == null ? 0.3 : P.th) * a.s, 0, 0.7);
    }
    const nod = -2.2 * walk * Math.cos(4 * Math.PI * (ph - 0.1));
    c.head.rotation.set((po.headTilt || 0) * D2R, po.headYaw || 0, (-(po.headRot || 0) - nod + 0.6 * breathe) * D2R + lean * 0.6);
  };
  return c;
}
