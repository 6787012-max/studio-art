/* haredi man - 3D cel-shaded version of the 2D design (man2d.js), built like the approved donkey (lib/toon3d):
   lathe / ellipsoid / tube primitives on bones, inverted-hull ink, toon shading with one shadow tone, the 2D face
   (K.manEyesFront / K.manMouthFront) drawn live into canvas textures on the head, real walk (K.footPath + K.ik,
   feet locked while planted, heel-off / toe-up like the 2D strip), coat skirt that follows the knees, contact shadow.
   Round 2 (critic r1): small soft nose, big open eyes, hat higher and tilted back, upright flat back, head on top of
   the shoulders, beard trimmed at the cheek and peyot at the ear (readable profile), bigger hands, knotted tzitzit.

   API (units = 2D body units, ground y = 0, he faces +x; needs window.K from elements2d + man2d.js loaded first):
     import { makeMan } from './man3d.js';
     const man = makeMan();  scene.add(man.root);
     man.pose(po)            call every frame. po fields (all optional):
       t        seconds (breathing)                x, z, yaw    root position / heading (radians, 0 = facing +x)
       walk     0..1 walk weight                   ph           walk phase in cycles (use distance / man.cycle -> planted feet)
       step     in-place step phase when walk=0    lean, bob    extra body lean (deg, + forward) / vertical bob (+ = down)
       twist    torso yaw (rad)                    headYaw (rad), headRot (deg, - = chin up), headTilt (deg)
       arms     { l: {...}, r: {...} } per arm, radians: sz (forward swing), sx (out), sy, el (elbow bend), tw (forearm twist),
                wz (wrist), curl (fingers 0..1+), th (thumb), point (true = index finger straight)
     await man.face.set(st)  st = { expr, talk, blink, look:[x,y] }
       expr: 'smile' (default; 'neutral' = same) | 'laugh' | 'explaining' | 'surprised' | 'thinking' | 'proud' | 'worried'
       talk: null | 'X' | 'A' | 'E' | 'O' | 'U' | 'M'     blink: true/false
     man.cycle               walk stride length per cycle (distance units)
     man.root / man.body / man.head / man.arms / man.legs / man.hat / man.shadow   scene-graph handles */
import { THREE, toon, part, ell, tube, lathe, tubeAlong, V, D2R, sphereDecal, faceRig, cfg, sm } from '../../lib/toon3d/toon3d.js';
import { mergeVertices } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
const K = window.K;
const D = K.MAN;
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
export function makeMan() {
  const c = { kind: 'man' };
  const mSkin = toon(D.skin, { tint: D.skinT }), mBeard = toon(D.beard, { tint: D.beardT, hi: 0 }), mHair = toon(D.hair, { tint: D.beardT, hi: 0 }),
    mHat = toon(D.hat, { tint: D.hatT }), mBand = toon(D.band, { tint: '#8f8aa0', hi: 0 }), mCoatHi = toon(D.coatHi, { hi: 0 }),
    mPants = toon(D.pants, { tint: D.coatT }), mShoe = toon(D.shoe, { tint: D.hatT }), mShirt = toon(D.shirt, { tint: D.shirtT }),
    mLip = toon(D.lip, { tint: D.skinT, hi: 0 }), mBtn = toon('#18161c', { tint: '#8f8aa0' });
  const mCoat = toon(D.coat, { tint: D.coatT, regions: [{ p: [42, 86, 0], r: [20, 30, 11], c: D.shirt, w: 0 }] });
  mCoat.side = THREE.DoubleSide;
  const mArm = toon(D.coat, { tint: D.coatT });
  c.root = new THREE.Group();
  c.body = new THREE.Bone(); c.body.position.set(0, LEG.hipY, 0); c.root.add(c.body);

  /* ---------- coat: one lathe from hem to collar, belly pushed forward, flattened in depth ---------- */
  const prof = [[46, -51], [46, -42], [42, -24], [40, -4], [40, 14], [43, 34], [47, 54], [47, 72], [40, 86], [26, 97], [12, 103], [2, 105]];
  const cg = lathe(prof, 56);
  { const P = cg.attributes.position;
    for (let i = 0; i < P.count; i++) {
      let x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const bel = Math.exp(-Math.pow((y - 26) / 34, 2)) * 0.0 * D.belly;
      if (x > 0) x *= (1 + bel) * (1 - 0.3 * sm((y - 50) / 50)); else x *= 0.9 - 0.26 * sm((y - 10) / 60);
      z *= 0.84 * D.bodyW;
      P.setXYZ(i, x + 4, y, z);
    }
    cg.computeVertexNormals(); }
  c.coat = part(c.body, cg, mCoat, 3.2);
  deformable(c.coat);
  const surf = (y, a) => {           // approx point on the coat surface at height y, angle a (0 = front)
    let r0 = 0; for (let i = 1; i < prof.length; i++) if (y <= prof[i][1]) { const t = (y - prof[i - 1][1]) / (prof[i][1] - prof[i - 1][1]); r0 = prof[i - 1][0] + (prof[i][0] - prof[i - 1][0]) * t; break; }
    let x = Math.cos(a) * r0, z = Math.sin(a) * r0; const bel = Math.exp(-Math.pow((y - 26) / 34, 2)) * 0.0 * D.belly;
    if (x > 0) x *= (1 + bel) * (1 - 0.3 * sm((y - 50) / 50)); else x *= 0.9 - 0.26 * sm((y - 10) / 60); return V(x + 4, y, z * 0.84 * D.bodyW);
  };
  // lapels, front opening, buttons, back seam (ink-light lines lying on the coat)
  const lineOn = (pts, w) => { const g = tubeAlong(pts.map(([y, a]) => surf(y, a).multiplyScalar(1.012)), w, { segs: 30, radial: 6 }); part(c.body, g, mCoatHi, 0); };
  lineOn([[100, 0.38], [84, 0.24], [64, 0.08], [50, 0.02]], 1.3); lineOn([[100, -0.38], [84, -0.24], [64, -0.08], [50, 0.02]], 1.3);
  lineOn([[50, 0.03], [30, 0.04], [6, 0.04]], 1.1);
  for (const y of [44, 28, 12]) part(c.body, ell(3, 3, 3, 12, 8), mBtn, 1.2, surf(y, 0.16).multiplyScalar(1.02).toArray());
  lineOn([[96, Math.PI], [60, Math.PI], [20, Math.PI]], 1.0);
  for (const s of [-1, 1]) part(c.body, ell(3, 3, 3, 12, 8), mBtn, 1.2, surf(16, Math.PI - s * 0.5).multiplyScalar(1.02).toArray());
  // collar (white) around the neck
  part(c.body, lathe([[17, 96], [18, 104], [16, 108]], 28).scale(1, 1, 0.9).translate(6, 0, 0), mShirt, 2.2);
  // tzitzit: white strings hanging below the hem at both sides
  c.tz = [];
  for (const s of [-1, 1]) {
    const g0 = new THREE.Group(); g0.position.set(2, -44, s * 36); c.body.add(g0); c.tz.push(g0);
    for (let i = 0; i < 4; i++) { const l = 30 + 8 * Math.sin(i * 2.1 + 0.6); const g = tube(1.1, 0.9, l, 8); g.translate((i - 1.5) * 2.2, 0, 0); part(g0, g, mShirt, 1.2); }
    for (let j = 0; j < 3; j++) part(g0, ell(4, 2.6, 3.2, 12, 8), mShirt, 1.2, [0, -3 - j * 5.5, 0]);   // knots
  }

  /* ---------- head ---------- */
  c.head = new THREE.Bone(); c.head.position.set(0, 106, 0); c.head.scale.setScalar(1.1); c.body.add(c.head);
  part(c.head, tube(13, 14, 22, 16).translate(0, 18, 0), mSkin, 0);              // neck (inside)
  const F = [1, 30, 0], FR = [26, 30, 24.5];                                       // face ellipsoid
  part(c.head, ell(...FR), mSkin, 2.6, F);
  for (const s of [-1, 1]) part(c.head, ell(3.6, 7.5, 3, 16, 12), mSkin, 2.0, [-4, 28, s * 24.5], [0, 0, 0.1]);
  // hair at the back under the hat: one cap + many small curls
  part(c.head, ell(18, 24, 22.5, 32, 24), mHair, 2.4, [-13, 35, 0]);
  for (const [x, y, z, r] of bumpsList()) part(c.head, ell(r, r, r, 12, 8), mHair, 1.6, [x, y, z]);
  // beard: core + clumps, measured from the 2D front head (eyes at y 30, mouth 37 units below the eyes, bottom 71 below)
  const BC = [10, -13, 0], BR = [21, 31 * D.bLen, 22 * D.bW];
  part(c.head, ell(...BR, 32, 24), mBeard, 2.6, BC);
  for (const [x, y, z, r] of [[15, -7, 15, 8.5], [15, -7, -15, 8.5], [19, -16, 11, 10], [19, -16, -11, 10], [21, -27, 4, 10], [21, -27, -4, 10],
    [18, -35, 9, 9.5], [18, -35, -9, 9.5], [12, -42, 0, 10], [5, -24, 18, 9], [5, -24, -18, 9], [-4, -14, 17, 8], [-4, -14, -17, 8],
    [10, -40, 13, 8.5], [10, -40, -13, 8.5], [0, -38, 6, 8.5], [0, -38, -6, 8.5]]) {
    part(c.head, ell(r, r * 1.08, r, 16, 12), mBeard, 1.9, [x + Math.max(0, -y - 10) * 0.32, y * D.bLen, z * D.bW]);
  }
  // lip / mouth plate (the 2D mouth is drawn on it) and the mustache
  const MP = [24.5, -4.5, 0], MR = [7.5, 9, 13];
  part(c.head, ell(...MR, 24, 16), mLip, 1.4, MP);
  for (const s of [-1, 1]) {   // mustache with lifted corners
    const g = tubeAlong([V(27.5, 6, s * 1), V(27, 5, s * 7), V(24.5, 3.5, s * 12), V(21.5, 5.5, s * 15)], t => 4.2 - 1.6 * t, { segs: 20, radial: 12 });
    part(c.head, g, mBeard, 1.8);
  }
  // nose: small soft button, inside the face silhouette (profile bump about 1/5 of the head depth)
  part(c.head, ell(5.6, 5.8, 6.4, 20, 14), mSkin, 1.7, [23.5, 14, 0]);
  // pe'ot: corkscrews in front of the ears
  for (const s of [-1, 1]) {
    const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * Math.PI * 2 * 4.2; pts.push(V(-8 + Math.cos(a) * 2.6 + t * 2, 33 - t * 33, s * (24 + Math.sin(a) * 2.6 + t * 1.5))); }
    part(c.head, tubeAlong(pts, t => 2.7 - 0.9 * t, { segs: 120, radial: 8 }), mHair, 1.4);
  }
  // hat: brim (thin lathe with a rolled edge), crown with the centre dent, band
  c.hat = new THREE.Group(); c.hat.position.set(-2, 58, 0); c.hat.rotation.z = 0.11; c.head.add(c.hat);
  const brim = lathe([[0.1, -0.6], [44, -1.4], [49, -0.6], [50, 1.4], [48, 2.0], [26, 1.6], [0.1, 1.4]], 64); brim.scale(0.96, 1, 0.9);
  part(c.hat, brim, mHat, 2.2);
  const crown = lathe([[25.5, 0], [25.8, 14], [25, 28], [21.5, 35.5], [12, 38], [0.1, 38]], 48); crown.scale(1.06, 1, 1);
  { const P = crown.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i), z = P.getZ(i), x = P.getX(i);
      if (y > 24) P.setY(i, y - 9 * Math.exp(-Math.pow(z / 9, 2)) * sm((y - 24) / 14) * (0.6 + 0.4 * Math.min(1, Math.abs(x) / 20))); }
    crown.computeVertexNormals(); }
  part(c.hat, crown, mHat, 2.4);
  part(c.hat, lathe([[26.4, 0.5], [26.6, 8], [26.3, 8.4]], 48).scale(1.06, 1, 1), mBand, 0);
  // face decals: eyes + brows on the face ellipsoid, mouth on the lip plate
  const eyes = sphereDecal(c.head, F, FR, { phi: 1.5, th0: 0.32, th1: 1.95, cx: 150, cy: 136, du: HDU, cw: 900 });
  const mou = sphereDecal(c.head, MP, MR, { phi: 1.25, th0: 0.55, th1: 2.55, cx: 150, cy: 207, du: HDU, k: 1.02 });
  c.face = faceRig({ eyes, mou }, st => ({ eyes: `<g transform="translate(150 139) scale(1.32) translate(-150 -133)">${K.manEyesFront(st, D)}</g>`, mou: K.manMouthFront(st, D) }));

  /* ---------- arms ---------- */
  c.arms = [-1, 1].map(s => {
    const sh = new THREE.Bone(); sh.position.set(2, 78, s * 44); c.body.add(sh);
    part(sh, ell(12, 12, 12, 20, 14), mArm, 2.6);
    part(sh, tube(12.6, 11, 46, 20), mArm, 2.6);
    const el = new THREE.Bone(); el.position.set(0, -46, 0); sh.add(el);
    part(el, ell(11, 11, 11, 16, 12), mArm, 2.4);
    part(el, tube(11, 11.8, 38, 20), mArm, 2.6);
    part(el, tube(10.4, 10.2, 7, 18).translate(0, -35, 0), mShirt, 2.0);
    const wr = new THREE.Bone(); wr.position.set(0, -42, 0); wr.scale.setScalar(1.3); el.add(wr);
    // hand: palm faces the body (-s*z), thumb forward (+x); fingers are bones that curl toward the palm
    part(wr, ell(7, 8.5, 4.2, 18, 12), mSkin, 2.0, [0, -8, 0]);
    const fingers = [-4.2, 0, 4.2].map((x, i) => { const b = new THREE.Bone(); b.position.set(x, -14, 0); wr.add(b);
      part(b, tube(3.1, 2.8, i === 1 ? 11.5 : 10.5, 10), mSkin, 1.7); return b; });
    const th = new THREE.Bone(); th.position.set(7, -5, -s * 2.5); wr.add(th); part(th, tube(3.6, 3.1, 12, 10), mSkin, 1.7); th.rotation.z = 0.9;
    return { s, sh, el, wr, fingers, th };
  });

  /* ---------- legs ---------- */
  c.legs = [{ o: 0, z: 15 }, { o: 0.5, z: -15 }].map(L => {
    const up = new THREE.Bone(), lo = new THREE.Bone(), ft = new THREE.Bone();
    c.root.add(up); c.root.add(lo); c.root.add(ft);
    up.userData.len = LEG.L1; lo.userData.len = LEG.L2;
    part(up, tube(13.5, 12, LEG.L1, 18), mPants, 2.6); part(lo, ell(12, 12, 12, 16, 12), mPants, 2.4);
    part(lo, tube(12, 10.5, LEG.L2, 18), mPants, 2.6);
    const sg = lathe([[0.1, -11], [9, -10], [11.5, -4], [10.5, 3], [7, 7], [0.1, 8]], 24); sg.rotateZ(-Math.PI / 2); sg.scale(1, 0.78, 0.6);
    sg.scale(1.25, 1.15, 1.25); sg.translate(13, -6, 0); part(ft, sg, mShoe, 2.4);
    part(ft, ell(9, 6, 9, 14, 10).translate(-4, -5, 0), mShoe, 2.2);
    up.position.z = lo.position.z = ft.position.z = L.z;
    return Object.assign(L, { up, lo, ft });
  });
  c.cycle = LEG.stride / LEG.duty;
  // contact shadow under the feet
  c.shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: 0x2c3a18, transparent: true, opacity: 0.28, depthWrite: false }));
  c.shadow.rotation.x = -Math.PI / 2; c.shadow.position.set(6, 0.7, 0); c.shadow.scale.set(58, 34, 1); c.root.add(c.shadow);

  /* ---------- pose ----------
     po: {t, x, z, yaw, walk, ph, step, lean, headYaw, headRot, headTilt, arms: {l:{sz,sx,el,tw,curl,th}, r:{...}} (radians), face} */
  c.pose = po => {
    const walk = po.walk || 0, ph = po.ph || 0, t = po.t || 0;
    const bob = 3.6 * walk * Math.cos(4 * Math.PI * (ph - 0.04)) + (po.bob || 0);     // + = down (2D convention)
    const breathe = Math.sin(t * 2.1);
    c.root.position.set(po.x || 0, 0, po.z || 0); c.root.rotation.set(0, po.yaw || 0, 0);
    const lean = ((po.lean || 0) + 2 * walk) * D2R;
    c.body.position.set(0, LEG.hipY - bob, 0); c.body.rotation.set(0, (po.twist || 0) + 0.03 * walk * Math.sin(2 * Math.PI * ph), -lean);
    c.coat.scale.set(1, 1 + 0.008 * breathe, 1 + 0.012 * breathe);
    const knees = [];
    for (const L of c.legs) {
      const hip = [L.z > 0 ? 4 : -4, -LEG.hipY + bob];
      const f0 = K.footPath(ph + L.o, LEG.stride, LEG.duty, LEG.lift);
      const g = { x: f0.x * walk + (L.z > 0 ? 6 : -6) * (1 - walk), y: f0.y * walk, st: walk > 0.05 ? f0.st : 0, q: walk > 0.05 ? f0.q : -1 };
      if (po.step && walk <= 0.05) { const s2 = K.footPath(po.step + L.o, 0, 0.6, 10); g.y = s2.y; g.q = s2.q; g.st = s2.st; }
      const ang = K.manShoeAng(g);
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
    const lagK = c.legs.map(L => { const f0 = K.footPath(ph - 0.07 + L.o, LEG.stride, LEG.duty, LEG.lift);
      const ank = [f0.x * walk + (L.z > 0 ? 6 : -6) * (1 - walk), f0.y * walk - LEG.sole]; return K.ik([L.z > 0 ? 4 : -4, -LEG.hipY + bob], ank, LEG.L1, LEG.L2, 1)[0]; });
    void knees;
    const kmax = Math.max(...lagK), kmin = Math.min(...lagK), kav = (kmax + kmin) / 2;
    c.coat.userData.apply((x, y, z) => {
      if (y > 0) return [x, y, z];
      const u = Math.min(1, -y / 50), u2 = u * u;
      let dx = kav * 0.35 * u2;
      if (x > 4) dx += Math.max(0, kmax - 8) * 0.55 * u2; else dx += Math.min(0, kmin + 8) * 0.55 * u2;
      return [x + dx, y + (x > 4 ? 6 : 2) * walk * u2 * Math.max(0, (kmax - 10) / 30), z];
    });
    c.tz.forEach((g0, i) => { g0.rotation.set(0, 0, -0.12 * walk * Math.sin(2 * Math.PI * (ph - 0.2 + i * 0.5)) - 0.04); g0.position.x = 2 + kav * 0.3; });
    // arms: walk swing + pose overrides
    const A = po.arms || {};
    for (const a of c.arms) {
      const o = a.s > 0 ? 0 : 0.5, P = (a.s > 0 ? A.r : A.l) || {};
      const swing = -0.62 * walk * Math.cos(2 * Math.PI * (ph + o - 0.08));
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
