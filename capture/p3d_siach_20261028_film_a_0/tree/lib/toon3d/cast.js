/* cast - the approved 2D cartoon characters (productions/elements2d) as 3D cel-shaded models, built on toon3d.
   Each entry: make() -> character {root, pose(po), face.set(st), cycle, kind}. Units = the 2D body units (ground y=0).
   Faces: the 2D eyes / brows / mouth drawn symmetric on decal patches (drawing coords around the patch centre). */
import { THREE, toon, part, ell, tube, lathe, along, tubeAlong, leafGeo, bend, cone, aim, bumps, V, D2R,
  sphereDecal, planeDecal, faceRig, eyesSvg, mouthSvg, quadruped, biped, prop, RoundedBoxGeometry, taper } from './toon3d.js';
const K = window.K;
const OLc = '#261c19';

/* lion has no 2D body yet: same construction as the dog / cow specs */
if (!K.BODY.lion) K.BODY.lion = { head: 'lion', legLen: 104, hindX: -78, foreX: 70, farDx: 16, stride: 56, lift: 22, bobAmp: 4, legW: [36, 22], hoofH: 11, paw: true, knee: 3 };

export const CAST = {};

/* ================= DONKEY (the approved pilot, same numbers as productions/donkey3d) ================= */
CAST.donkey = () => {
  const C = { FUR: '#a59689', MUZ: '#e6dacb', EAR: '#d7aba3', MANE: '#3d302b', HOOF: '#3d302b', TINT: '#bfb1bb' };
  const mFur = toon(C.FUR), mMuz = toon(C.MUZ, { tint: '#cbbfc6' }), mEar = toon(C.EAR, { tint: '#c9b0b8', hi: 0 }), mMane = toon(C.MANE, { tint: '#9a8a90', hi: 0 }),
    mHoof = toon(C.HOOF, { tint: '#9a8a90' });
  const mTorso = toon(C.FUR, { regions: [{ below: -64 * 0.66, x0: 0, xHalf: 104, c: C.MUZ }] });
  return quadruped('donkey', {
    legZ: 25, legMat: mFur, hoofMat: mHoof, legR: { hind: 22, fore: 18, knee: 11.8, low0: 11.4, low1: 10.4, cap: 12.2 },
    build(c, H) {
      H.torso({ L: 236, R: 64, e: 2.5, zs: 0.8, at: [-2, 176], mat: mTorso });
      c.tail = H.bone(c.body, [-114, 196, 0]);
      part(c.tail, tube(6, 4.2, 82), mFur, 2.4, null, [0, 0, -0.32]);
      c.tailTip = new THREE.Group(); c.tailTip.position.set(-26, -76, 0); c.tail.add(c.tailTip);
      for (const [a, z, l] of [[0, 0, 30], [0.35, 3, 24], [-0.35, -3, 24], [0.1, -4, 26], [-0.1, 4, 26]]) {
        const g = new THREE.ConeGeometry(6.5, l, 10); g.translate(0, -l / 2, 0); g.rotateZ(a - 0.25); g.translate(0, 2, z); part(c.tailTip, g, mMane, 2.2);
      }
      H.neck([62, 206, 0], [76, 68, 0], [42, 37, 31, 22], 0.78, mFur);
      const NT = c.NECK_TOP, dir = NT.clone().normalize(), back = V(-dir.y, dir.x, 0);
      for (let i = 0; i < 9; i++) {
        const t = 0.02 + 0.98 * i / 8, base = dir.clone().multiplyScalar(t * (NT.length() + 6)).add(back.clone().multiplyScalar(26 - 6 * t));
        const l = 42 + 10 * Math.sin(i * 1.7) + (i === 8 ? 10 : 0), g2 = new THREE.ConeGeometry(15, l, 12);
        g2.scale(1, 1, 0.55); g2.translate(0, l / 2, 0);
        g2.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), back.clone().add(dir.clone().multiplyScalar(-0.35)).normalize()));
        g2.translate(base.x, base.y, base.z); part(c.neck, g2, mMane, 2.4);
      }
      H.head(1.4);
      const SK = [8, 47, 0, 36, 43, 37], MZ = [27, 6, 0, 33, 33, 41];
      part(c.head, ell(SK[3], SK[4], SK[5]), mFur, 2.6, SK.slice(0, 3));
      part(c.jaw, ell(MZ[3], MZ[4], MZ[5]), mMuz, 2.6, [MZ[0], MZ[1] - 20, MZ[2]]);
      part(c.head, ell(30, 26, 35), mFur, 0, [14, 24, 0]);
      const ear = side => {
        const len = 72, prof = [];
        for (let i = 0; i <= 16; i++) { const t = i / 16; prof.push([20 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.9) + 0.01, t * len]); }
        const g = lathe(prof, 20); g.scale(0.6, 1, 1);
        const gi = lathe(prof.map(p => [p[0] * 0.8, p[1] * 0.88 + 5]), 20); gi.scale(0.22, 1, 1); gi.translate(8.6, 0, 0);
        return H.ear(c.head, [-2, 80, side * 17], g, mFur, gi, mEar);
      };
      c.ears = [{ b: ear(1), rot: [-0.62, 0.75, -0.36], side: 1 }, { b: ear(-1), rot: [0.42, -0.7, -0.12], side: -0.7, k: 0.8 }];
      for (const [x, z, l, a, s] of [[14, -9, 30, 0.5, 9], [18, 4, 34, 0.75, 10], [8, 12, 26, 0.35, 8], [2, -2, 24, 0.2, 9]]) {
        const g = new THREE.ConeGeometry(s, l, 10); g.scale(1, 1, 0.6); g.translate(0, l / 2, 0); g.rotateZ(-a); g.rotateX(z * 0.02); g.translate(x, 80, z); part(c.head, g, mMane, 2.2);
      }
      const eyes = sphereDecal(c.head, SK.slice(0, 3), SK.slice(3), { phi: 1.2, th0: 0.3, th1: 1.92, cx: 162, cy: 141 });
      const mou = sphereDecal(c.jaw, [MZ[0], MZ[1] - 20, MZ[2]], MZ.slice(3), { phi: 1.3, th0: 0.45, th1: 2.75, cx: 180, cy: 206 });
      c.face = faceRig({ eyes, mou }, st => ({
        eyes: eyesSvg(st, { x: 143, y: 126, rx: 19, ry: 24, side: -1 }, { x: 181, y: 126, rx: 19, ry: 24, side: 1 }, C.FUR, 8.5),
        mou: taper([150, 196], [143, 182], [158, 180], 2, 5.5, 2) + taper([210, 196], [217, 182], [202, 180], 2, 5.5, 2) +
          mouthSvg(st, { x: 180, y: 232, w: 58, teeth: 12 }) + taper([164, 262], [180, 268], [196, 262], 1, 2.6, 1),
      }));
    },
  });
};

/* ================= COW ================= */
CAST.cow = () => {
  const BASE = '#f4eee4', PATCH = '#7b4e36', MUZ = '#eaa39c', HORN = '#efe0bd', TINT = '#cdbfc9', INEAR = '#e3a69e';
  const mBase = toon(BASE, { tint: TINT }), mPatch = toon(PATCH, { tint: '#b9a6ae', hi: 0 }), mMuz = toon(MUZ, { tint: '#d6b8c0' }), mHorn = toon(HORN, { tint: '#cfc0c4' }),
    mIn = toon(INEAR, { tint: '#d0b0b8', hi: 0 }), mHoof = toon('#4a3428', { tint: '#9a8a90' }), mUdder = toon('#eaa39c', { tint: '#d6b8c0', hi: 0 });
  // spots on the torso (torso-local), patch over the far eye side of the head
  const mTorso = toon(BASE, { tint: TINT, regions: [
    { p: [-52, 40, 58], r: [48, 46, 40], c: PATCH, w: 0.08 }, { p: [74, -42, 56], r: [40, 34, 40], c: PATCH, w: 0.08 }, { p: [-134, -2, 20], r: [34, 44, 70], c: PATCH, w: 0.07 },
    { p: [20, 34, -60], r: [52, 44, 40], c: PATCH, w: 0.08 }, { p: [-90, -30, -58], r: [36, 34, 40], c: PATCH, w: 0.08 }, { p: [-6, 72, 4], r: [34, 18, 26], c: PATCH, w: 0.1 }] });
  const mHead = toon(BASE, { tint: TINT, regions: [{ p: [20, 40, -34], r: [40, 34, 28], c: PATCH, w: 0.05 }, { p: [0, 80, 0], r: [26, 14, 22], c: PATCH, w: 0.1 }] });
  const mLeg = toon(BASE, { tint: TINT });
  return quadruped('cow', {
    legZ: 30, legMat: mLeg, hoofMat: mHoof, legR: { hind: 25, fore: 21, knee: 13.4, low0: 13, low1: 12, cap: 14 },
    build(c, H) {
      H.torso({ L: 262, R: 74, e: 2.6, zs: 0.84, at: [-4, 178], mat: mTorso });
      part(c.body, ell(22, 12, 20), mUdder, 2.2, [-50, 108, 0]);
      for (const [x, z] of [[-60, 8], [-44, 8], [-60, -8], [-44, -8]]) part(c.body, tube(3.4, 2.6, 9, 10), mUdder, 1.6, [x, 100, z]);
      c.tail = H.bone(c.body, [-128, 214, 0]);
      part(c.tail, tube(5, 3.6, 100), mBase, 2.2, null, [0, 0, -0.18]);
      c.tailTip = new THREE.Group(); c.tailTip.position.set(-18, -96, 0); c.tail.add(c.tailTip);
      for (const [a, z, l] of [[0, 0, 30], [0.35, 3, 24], [-0.35, -3, 24], [0.1, -4, 26]]) {
        const g = new THREE.ConeGeometry(7, l, 10); g.translate(0, -l / 2, 0); g.rotateZ(a - 0.15); g.translate(0, 2, z); part(c.tailTip, g, mPatch, 2.2);
      }
      H.neck([78, 196, 0], [58, 52, 0], [56, 52, 44, 34], 0.8, mBase);
      H.head(1.4);
      const SK = [4, 44, 0, 36, 42, 39], MZ = [26, 6, 0, 33, 30, 45];
      part(c.head, ell(SK[3], SK[4], SK[5]), mHead, 2.6, SK.slice(0, 3));
      part(c.jaw, ell(MZ[3], MZ[4], MZ[5]), mMuz, 2.6, [MZ[0], MZ[1] - 20, MZ[2]]);
      part(c.head, ell(30, 26, 37), mBase, 0, [12, 22, 0]);
      // ears: sideways leaves (near white with pink inside, far one brown)
      const ear = (side, m) => {
        const g = leafGeo(52, 17, 0.5), gi = leafGeo(44, 12, 0.22); gi.translate(5.5, 3, 0);
        return H.ear(c.head, [-6, 66, side * 34], g, m, side > 0 ? gi : null, mIn);
      };
      c.ears = [{ b: ear(1, mBase), rot: [1.75, -0.1, -0.15], side: 1, ka: 1.5 }, { b: ear(-1, mPatch), rot: [-1.75, 0.1, -0.15], side: -1, ka: 1.5 }];
      // horns: short, curving up and out
      for (const s of [1, -1]) part(c.head, tubeAlong([V(-4, 74, s * 20), V(-6, 92, s * 30), V(-2, 106, s * 32)], t => 8.5 - 5.5 * t, { segs: 20, radial: 12 }), mHorn, 2.2);
      for (const [x, z, l, a, s] of [[10, -8, 24, 0.5, 8], [14, 6, 28, 0.7, 9], [4, 12, 20, 0.3, 7], [0, -2, 20, 0.15, 8]]) {
        const g = new THREE.ConeGeometry(s, l, 10); g.scale(1, 1, 0.6); g.translate(0, l / 2, 0); g.rotateZ(-a); g.rotateX(z * 0.02); g.translate(x, 76, z); part(c.head, g, mPatch, 2.2);
      }
      const eyes = sphereDecal(c.head, SK.slice(0, 3), SK.slice(3), { phi: 1.2, th0: 0.3, th1: 1.92, cx: 162, cy: 141 });
      const mou = sphereDecal(c.jaw, [MZ[0], MZ[1] - 20, MZ[2]], MZ.slice(3), { phi: 1.3, th0: 0.45, th1: 2.75, cx: 180, cy: 206 });
      c.face = faceRig({ eyes, mou }, st => {
        const f = K.animalFace(st), e1 = { x: 142, y: 126, rx: 19, ry: 24, side: -1 }, e2 = { x: 182, y: 126, rx: 19, ry: 24, side: 1 };
        return {
          eyes: K.eyePair(f, e1, e2, BASE, 0, OLc) + K.brow(e1, Object.assign({ w: 7.5, len: 0.9 }, f.E.brow), PATCH) + K.brow(e2, Object.assign({ w: 8.5 }, f.E.brow), '#3b261b'),
          mou: `<ellipse cx="152" cy="190" rx="8" ry="11" fill="#5a2a2a" transform="rotate(-20 152 190)"/><ellipse cx="208" cy="190" rx="8" ry="11" fill="#5a2a2a" transform="rotate(20 208 190)"/>` +
            mouthSvg(st, { x: 180, y: 232, w: 64, teeth: 10 }),
        };
      });
    },
  });
};

/* ================= GOAT ================= */
CAST.goat = () => {
  const FUR = '#e9e2d6', HORN = '#9c8466', BEARD = '#d8cfc0', TINT = '#c6bccb', NOSE = '#d9b3a6', INEAR = '#d9aaa0';
  const mFur = toon(FUR, { tint: TINT }), mHorn = toon(HORN, { tint: '#b9a9a8' }), mBeard = toon(BEARD, { tint: TINT, hi: 0 }), mIn = toon(INEAR, { tint: '#d0b0b8', hi: 0 }),
    mHoof = toon('#5a4a3c', { tint: '#9a8a90' }), mTorso = toon(FUR, { tint: TINT, regions: [{ below: -55 * 0.62, x0: 0, xHalf: 82, c: BEARD }] });
  return quadruped('goat', {
    legZ: 21, legMat: mFur, hoofMat: mHoof,
    build(c, H) {
      H.torso({ L: 200, R: 55, e: 2.5, zs: 0.8, at: [-3, 169], mat: mTorso });
      c.tail = H.bone(c.body, [-96, 194, 0]);
      part(c.tail, aim(cone(9, 38, 0.6), V(0, 0, 0), V(-0.45, 1, 0)), mFur, 2.2);
      H.neck([46, 188, 0], [60, 66, 0], [34, 30, 25, 21], 0.8, mFur);
      H.head(1.32);
      const SK = [4, 46, 0, 30, 37, 31], MZ = [22, 0, 0, 25, 31, 28];
      part(c.head, ell(SK[3], SK[4], SK[5]), mFur, 2.6, SK.slice(0, 3));
      part(c.jaw, ell(MZ[3], MZ[4], MZ[5]), mFur, 2.6, [MZ[0], MZ[1] - 20, MZ[2]]);
      part(c.head, ell(24, 28, 28), mFur, 0, [12, 22, 0]);
      for (const s of [1, -1]) part(c.head, tubeAlong([V(0, 76, s * 11), V(-6, 100, s * 15), V(-26, 120, s * 20), V(-50, 116, s * 24)], t => 8.5 - 6 * t, { segs: 24, radial: 12 }), mHorn, 2.2);
      const ear = side => { const g = leafGeo(46, 14, 0.45), gi = leafGeo(38, 9.5, 0.2); gi.translate(5, 3, 0); return H.ear(c.head, [-6, 58, side * 27], g, mFur, gi, mIn); };
      c.ears = [{ b: ear(1), rot: [1.95, -0.15, -0.1], side: 1, ka: 1.5 }, { b: ear(-1), rot: [-1.95, 0.15, -0.1], side: -1, ka: 1.5 }];
      for (const [x, z, l, a] of [[30, 0, 40, 0.0], [26, 9, 32, 0.25], [26, -9, 32, -0.25], [20, 15, 24, 0.5], [20, -15, 24, -0.5]]) part(c.jaw, aim(cone(8, l, 0.7), V(x, -40, z), V(0.12, -1, a)), mBeard, 2);
      for (const [x, z, l, a] of [[18, 0, 18, 0.5], [14, 9, 15, 0.4], [14, -9, 15, 0.4]]) part(c.head, aim(cone(6, l, 0.6), V(x, 78, z), V(a, 1, z * 0.02)), mBeard, 1.8);
      const eyes = sphereDecal(c.head, SK.slice(0, 3), SK.slice(3), { phi: 1.2, th0: 0.3, th1: 1.92, cx: 162, cy: 141 });
      const mou = sphereDecal(c.jaw, [MZ[0], MZ[1] - 20, MZ[2]], MZ.slice(3), { phi: 1.3, th0: 0.45, th1: 2.75, cx: 180, cy: 206 });
      c.face = faceRig({ eyes, mou }, st => ({
        eyes: eyesSvg(st, { x: 143, y: 128, rx: 18.5, ry: 23.5, side: -1 }, { x: 181, y: 128, rx: 18.5, ry: 23.5, side: 1 }, FUR, 8, '#5a4a3c', { bar: true, iris: '#c9a23a' }),
        mou: `<ellipse cx="180" cy="196" rx="30" ry="19" fill="${NOSE}"/>` + taper([166, 198], [162, 188], [174, 186], 1.5, 4.5, 1.5) + taper([194, 198], [198, 188], [186, 186], 1.5, 4.5, 1.5) +
          mouthSvg(st, { x: 180, y: 232, w: 36, teeth: 0, lw: 3 }),
      }));
    },
  });
};

/* ================= SHEEP (wool = cloud of bumps on a core, also on the crown so it is wool, not a hat) ================= */
CAST.sheep = () => {
  const WOOL = '#f6f1e6', FACE = '#3d3532', TINT = '#c9c0d2', INEAR = '#c98f8f';
  const mWool = toon(WOOL, { tint: TINT, hi: 0 }), mFace = toon(FACE, { tint: '#8f8496' }), mIn = toon(INEAR, { tint: '#b99aa0', hi: 0 }),
    mLeg = toon('#3d3532', { tint: '#8f8496' }), mHoof = toon('#1d1816', { tint: '#8f8496' });
  return quadruped('sheep', {
    legZ: 26, legMat: mLeg, hoofMat: mHoof,
    build(c, H) {
      c.torso = part(c.body, ell(102, 66, 72), mWool, 3, [0, 160, 0]);
      for (const b of bumps([0, 0, 0], [114, 76, 82], 64, 27, null, 0.3, 0.84)) part(c.torso, ell(b[3], b[3] * 0.92, b[3]), mWool, 2.4, [b[0], b[1], b[2]]);
      c.tail = H.bone(c.body, [-110, 172, 0]);
      for (const b of [[-12, 0, 0, 16], [-20, -8, 6, 12], [-18, 8, -5, 12], [-6, 10, 6, 11]]) part(c.tail, ell(b[3], b[3], b[3]), mWool, 2.2, b.slice(0, 3));
      H.neck([72, 182, 0], [34, 28, 0], [42, 38, 34, 30], 0.86, mWool);
      for (const b of bumps([16, 20, 0], [40, 38, 40], 18, 17, u => u.y > -0.3, 0.3, 0.9)) part(c.neck, ell(b[3], b[3], b[3]), mWool, 2.2, b.slice(0, 3));
      H.head(1.28);
      const SK = [6, 34, 0, 28, 40, 28], MZ = [18, 2, 0, 24, 24, 26];
      part(c.head, ell(SK[3], SK[4], SK[5]), mFace, 2.6, SK.slice(0, 3));
      part(c.jaw, ell(MZ[3], MZ[4], MZ[5]), mFace, 2.6, [MZ[0], MZ[1] - 20, MZ[2]]);
      part(c.head, ell(22, 26, 26), mFace, 0, [10, 18, 0]);
      for (const b of bumps([-6, 60, 0], [32, 22, 32], 18, 13.5, u => u.y > -0.15 && u.x < 0.75, 0.3, 0.92)) part(c.head, ell(b[3], b[3], b[3]), mWool, 2, b.slice(0, 3));
      const ear = side => { const g = leafGeo(40, 13, 0.45), gi = leafGeo(32, 8.5, 0.2); gi.translate(5, 3, 0); return H.ear(c.head, [-2, 50, side * 25], g, mFace, gi, mIn); };
      c.ears = [{ b: ear(1), rot: [1.85, -0.1, -0.2], side: 1, ka: 1.5 }, { b: ear(-1), rot: [-1.85, 0.1, -0.2], side: -1, ka: 1.5 }];
      const eyes = sphereDecal(c.head, SK.slice(0, 3), SK.slice(3), { phi: 1.2, th0: 0.45, th1: 1.95, cx: 162, cy: 141 });
      const mou = sphereDecal(c.jaw, [MZ[0], MZ[1] - 20, MZ[2]], MZ.slice(3), { phi: 1.3, th0: 0.45, th1: 2.75, cx: 180, cy: 206 });
      c.face = faceRig({ eyes, mou }, st => {
        const f = K.animalFace(st), e1 = { x: 144, y: 136, rx: 16, ry: 21, side: -1 }, e2 = { x: 180, y: 136, rx: 16, ry: 21, side: 1 };
        return {
          eyes: K.eyePair(f, e1, e2, FACE, 0, OLc) + K.brow(e1, Object.assign({ w: 6, len: 0.85 }, f.E.brow), '#9c918a') + K.brow(e2, Object.assign({ w: 6.5 }, f.E.brow), '#9c918a'),
          mou: `<ellipse cx="180" cy="212" rx="38" ry="30" fill="#554a46"/>` + taper([166, 200], [160, 190], [172, 188], 1.5, 4.5, 1.5, '#1d1613') + taper([194, 200], [200, 190], [188, 188], 1.5, 4.5, 1.5, '#1d1613') +
            mouthSvg(st, { x: 180, y: 226, w: 34, teeth: 0, lw: 3, inside: '#2a0d0f' }),
        };
      });
    },
  });
};

/* ================= CAMEL ================= */
CAST.camel = () => {
  const FUR = '#dcae6c', MUZ = '#efd29e', TUFT = '#a8703e', TINT = '#cdb3a8', INEAR = '#c98a62';
  const mFur = toon(FUR, { tint: TINT }), mMuz = toon(MUZ, { tint: '#d9c6b8' }), mTuft = toon(TUFT, { tint: '#b9a0a0', hi: 0 }), mIn = toon(INEAR, { tint: '#c9a8a8', hi: 0 }),
    mPaw = toon('#a8703e', { tint: '#b9a0a0' });
  return quadruped('camel', {
    legZ: 26, legMat: mFur, hoofMat: mPaw, legR: { hind: 21, fore: 17, knee: 10.5, low0: 10, low1: 9, cap: 13.5 },
    build(c, H) {
      H.torso({ L: 254, R: 60, e: 2.4, zs: 0.78, at: [-4, 238], nL: 64, seg: 56, mat: mFur, shape: (x, y, z, L, R) => {
        if (y > 0) y *= 0.86 + 0.06 * Math.cos(x / (L / 2) * 1.4); else y *= 1.0 + 0.08 * Math.max(0, -x / (L / 2) + 0.2);
        const hb = Math.exp(-Math.pow((x + 6) / 62, 2)), up = Math.max(0, y / R);
        y += 76 * hb * Math.pow(up, 1.1); z *= 1 - 0.22 * hb * up;
        return [x, y, z]; } });
      c.tail = H.bone(c.body, [-124, 262, 0]);
      part(c.tail, tube(5, 3.6, 70), mFur, 2.2, null, [0, 0, -0.25]);
      c.tailTip = new THREE.Group(); c.tailTip.position.set(-17, -66, 0); c.tail.add(c.tailTip);
      for (const [a, z, l] of [[0, 0, 22], [0.35, 3, 18], [-0.35, -3, 18]]) { const g = new THREE.ConeGeometry(6, l, 10); g.translate(0, -l / 2, 0); g.rotateZ(a - 0.2); g.translate(0, 2, z); part(c.tailTip, g, mTuft, 2); }
      c.neck = H.bone(c.body, [84, 250, 0]);
      const NP = [V(-8, 2, 0), V(40, -14, 0), V(80, 6, 0), V(108, 52, 0), V(124, 94, 0)];
      c.neckMesh = part(c.neck, tubeAlong(NP, t => 36 - 14 * t, { flat: 0.8, segs: 40, radial: 18, cap: 0.08 }), mFur, 3.2);
      c.NECK_TOP = V(124, 94, 0);
      H.head(1.25);
      const SK = [4, 40, 0, 31, 31, 31], MZ = [32, 6, 0, 33, 27, 30];
      part(c.head, ell(SK[3], SK[4], SK[5]), mFur, 2.6, SK.slice(0, 3));
      part(c.head, ell(30, 24, 29), mFur, 0, [18, 22, 0]);
      part(c.jaw, ell(MZ[3], MZ[4], MZ[5]), mMuz, 2.6, [MZ[0], MZ[1] - 20, MZ[2]]);
      const ear = side => { const g = leafGeo(24, 10, 0.5), gi = leafGeo(18, 6.5, 0.2); gi.translate(4, 2, 0); return H.ear(c.head, [-8, 60, side * 20], g, mFur, gi, mIn); };
      c.ears = [{ b: ear(1), rot: [0.7, -0.3, 0.2], side: 1 }, { b: ear(-1), rot: [-0.7, 0.3, 0.2], side: -1 }];
      for (const [x, z, l, a, s] of [[-2, -8, 20, 0.3, 8], [4, 4, 24, 0.5, 9], [-6, 10, 18, 0.1, 7], [10, -2, 18, 0.7, 7]]) {
        const g = new THREE.ConeGeometry(s, l, 10); g.scale(1, 1, 0.6); g.translate(0, l / 2, 0); g.rotateZ(-a); g.rotateX(z * 0.02); g.translate(x, 64, z); part(c.head, g, mTuft, 2);
      }
      const eyes = sphereDecal(c.head, SK.slice(0, 3), SK.slice(3), { phi: 1.15, th0: 0.35, th1: 1.85, cx: 162, cy: 141 });
      const mou = sphereDecal(c.jaw, [MZ[0], MZ[1] - 20, MZ[2]], MZ.slice(3), { phi: 1.25, th0: 0.5, th1: 2.7, cx: 180, cy: 206 });
      c.face = faceRig({ eyes, mou }, st => ({
        eyes: eyesSvg(st, { x: 143, y: 132, rx: 19, ry: 24, side: -1 }, { x: 181, y: 132, rx: 19, ry: 24, side: 1 }, FUR, 8.5, '#7c5230',
          { neutral: { top: 0.56, tilt: 0.18 }, angry: { top: 0.5 }, happy: {}, surprised: {} }),
        mou: taper([158, 192], [164, 182], [174, 184], 1.5, 5, 1.5) + taper([202, 192], [196, 182], [186, 184], 1.5, 5, 1.5) + taper([180, 204], [182, 212], [180, 220], 1, 3.2, 1) +
          mouthSvg(st, { x: 180, y: 232, w: 52, teeth: 9 }),
      }));
    },
  });
};

/* ================= DOG ================= */
CAST.dog = () => {
  const FUR = '#cf914f', WHITE = '#f7efe2', EAR = '#7a4a2c', NOSE = '#2a201d', TINT = '#d1b3b4';
  const mFur = toon(FUR, { tint: TINT }), mWhite = toon(WHITE, { tint: '#d9ccd0' }), mEar = toon(EAR, { tint: '#b39a9a', hi: 0 }), mNose = toon(NOSE, { tint: '#8a7a80' });
  const mTorso = toon(FUR, { tint: TINT, regions: [{ p: [-18, 36, 0], r: [30, 14, 40], c: EAR, w: 0.1 }, { p: [74, -30, 0], r: [34, 30, 60], c: WHITE, w: 0.06 }] });
  const mNeck = toon(FUR, { tint: TINT, regions: [{ p: [26, 8, 0], r: [16, 30, 40], c: WHITE, w: 0.05 }] });
  const mHead = toon(FUR, { tint: TINT, regions: [{ p: [32, 50, 0], r: [40, 44, 6.5], c: WHITE, w: 0.03 }] });
  const mTail = toon(FUR, { tint: TINT, regions: [{ p: [-40, 74, 0], r: [12, 14, 12], c: WHITE, w: 0 }] });
  return quadruped('dog', {
    legZ: 21, legMat: mFur, hoofMat: mWhite, paw: true, tailMove: { k: 0.8, base: 0.05 },
    build(c, H) {
      H.torso({ L: 174, R: 42, e: 2.5, zs: 0.86, at: [-2, 110], mat: mTorso });
      c.tail = H.bone(c.body, [-82, 124, 0]);
      part(c.tail, tubeAlong([V(4, -4, 0), V(-14, 18, 0), V(-30, 46, 0), V(-38, 80, 0)], t => 8 - 3.5 * t, { segs: 24, radial: 12 }), mTail, 2.2);
      H.neck([44, 124, 0], [44, 44, 0], [30, 28, 24, 20], 0.84, mNeck);
      H.head(1.18);
      const SK = [0, 40, 0, 34, 34, 34], MZ = [28, 4, 0, 30, 24, 31];
      part(c.head, ell(SK[3], SK[4], SK[5]), mHead, 2.6, SK.slice(0, 3));
      part(c.head, ell(26, 24, 30), mFur, 0, [12, 24, 0]);
      part(c.jaw, ell(MZ[3], MZ[4], MZ[5]), mWhite, 2.6, [MZ[0], MZ[1] - 20, MZ[2]]);
      part(c.jaw, ell(11, 8.5, 14), mNose, 2.2, [MZ[0] + 27, MZ[1] - 20 + 9, 0]);
      const ear = side => { const g = leafGeo(58, 20, 1); g.scale(1, 1, 0.36); return H.ear(c.head, [-4, 66, side * 30], g, mEar, null, null, 2.4); };
      c.ears = [{ b: ear(1), rot: [Math.PI - 0.32, 0, 0.18], side: 1, flop: 1, tw: 0.3 }, { b: ear(-1), rot: [-(Math.PI - 0.32), 0, 0.18], side: -1, flop: -1, tw: 0.3 }];
      const eyes = sphereDecal(c.head, SK.slice(0, 3), SK.slice(3), { phi: 1.2, th0: 0.3, th1: 1.92, cx: 162, cy: 141 });
      const mou = sphereDecal(c.jaw, [MZ[0], MZ[1] - 20, MZ[2]], MZ.slice(3), { phi: 1.3, th0: 0.45, th1: 2.75, cx: 180, cy: 206 });
      c.face = faceRig({ eyes, mou }, st => {
        let s = taper([180, 196], [181, 206], [180, 214], 1, 3, 1) + mouthSvg(st, { x: 180, y: 226, w: 50, teeth: 7 }) +
          `<circle cx="150" cy="214" r="2.6" fill="#b59a84"/><circle cx="156" cy="226" r="2.6" fill="#b59a84"/><circle cx="210" cy="214" r="2.6" fill="#b59a84"/><circle cx="204" cy="226" r="2.6" fill="#b59a84"/>`;
        const m = K.animalFace(st).m;
        if (st.tongue && (m.open || 0) > 0.2) s += K.mass([K.P('M172 240C168 262 174 280 184 280C194 280 196 262 190 240Z', '#e3707c')], { tint: TINT, light: [4, -4] });
        return { eyes: eyesSvg(st, { x: 144, y: 128, rx: 17, ry: 22, side: -1 }, { x: 180, y: 128, rx: 17, ry: 22, side: 1 }, FUR, 8, '#5a3820'), mou: s };
      });
    },
  });
};

/* ================= LION ================= */
CAST.lion = () => {
  const FUR = '#eaa94a', MANE = '#b5521f', MANE2 = '#d9772e', MUZ = '#f8e6c4', NOSE = '#6b3424', TINT = '#d3b7b0';
  const mFur = toon(FUR, { tint: TINT }), mMane = toon(MANE, { tint: '#c4a4a4', hi: 0 }), mMane2 = toon(MANE2, { tint: '#c9aaa6', hi: 0 }), mMuz = toon(MUZ, { tint: '#ddc9c4' }),
    mNose = toon(NOSE, { tint: '#9a8080' }), mIn = toon('#c76b4c', { tint: '#c9a8a8', hi: 0 }), mPaw = toon('#e09a3e', { tint: TINT });
  const mTorso = toon(FUR, { tint: TINT, regions: [{ below: -58 * 0.62, x0: 0, xHalf: 96, c: MUZ }] });
  return quadruped('lion', {
    legZ: 28, legMat: mFur, hoofMat: mPaw, paw: true, legR: { hind: 23, fore: 19, knee: 13.4, low0: 13, low1: 12.4, cap: 14 }, tailMove: { k: 0.9, base: -0.02 },
    build(c, H) {
      H.torso({ L: 236, R: 58, e: 2.5, zs: 0.84, at: [-6, 162], mat: mTorso });
      c.tail = H.bone(c.body, [-118, 196, 0]);
      part(c.tail, tubeAlong([V(4, 0, 0), V(-22, -26, 0), V(-36, -70, 0), V(-30, -110, 0), V(-16, -126, 0)], 5.2, { segs: 30, radial: 10, tip: 0.8 }), mFur, 2.2);
      c.tailTip = new THREE.Group(); c.tailTip.position.set(-16, -126, 0); c.tail.add(c.tailTip);
      for (const [a, z, l] of [[0, 0, 22], [0.5, 3, 18], [-0.5, -3, 18], [1.0, 0, 16]]) { const g = new THREE.ConeGeometry(7, l, 10); g.translate(0, l / 2, 0); g.rotateZ(a - 0.6); g.translate(0, -2, z); part(c.tailTip, g, mMane, 2); }
      H.neck([74, 184, 0], [50, 54, 0], [50, 46, 40, 34], 0.82, mFur);
      const NT = c.NECK_TOP, dir = NT.clone().normalize();
      for (let i = 0; i < 4; i++) for (let j = -3; j <= 3; j++) {
        const t = 0.15 + 0.25 * i, a = j * 0.42, base = dir.clone().multiplyScalar(t * NT.length());
        const out = V(-dir.y * Math.cos(a), dir.x * Math.cos(a), Math.sin(a)).normalize();
        base.addScaledVector(out, 36 - 6 * t);
        part(c.neck, aim(cone(20, 36 - 5 * i, 0.75), base, out.clone().addScaledVector(dir, -0.5)), (i + j) % 2 ? mMane : mMane2, 2.2);
      }
      H.head(1.42);
      const SK = [0, 40, 0, 35, 37, 37], MZ = [24, 6, 0, 24, 21, 30];
      part(c.head, ell(SK[3], SK[4], SK[5]), mFur, 2.6, SK.slice(0, 3));
      part(c.head, ell(22, 22, 30), mFur, 0, [12, 22, 0]);
      part(c.jaw, ell(MZ[3], MZ[4], MZ[5]), mMuz, 2.6, [MZ[0], MZ[1] - 20, MZ[2]]);
      part(c.jaw, ell(9, 7, 13), mNose, 2, [MZ[0] + 21, MZ[1] - 20 + 12, 0]);
      const MC = [-30, 34, 0], MR = [46, 62, 64];
      part(c.head, ell(MR[0] * 0.86, MR[1] * 0.86, MR[2] * 0.86), mMane, 3, MC);
      bumps(MC, MR, 64, 1, u => u.x < 0.42, 0, 0.9).forEach((b, i) => {
        const n = V(b[0] - MC[0], b[1] - MC[1], b[2] - MC[2]).normalize();
        part(c.head, aim(cone(19, 26 + 6 * Math.sin(i * 2.3), 0.8), V(b[0], b[1], b[2]), n.clone().add(V(-0.25, 0, 0))), (n.x > 0.15 && i % 2) ? mMane2 : mMane, 2.3);
      });
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2 + 0.3, o = V(0, Math.cos(a), Math.sin(a)), rr = 40;
        part(c.head, aim(cone(17, 22 + 4 * Math.sin(i * 2.3), 0.7), V(-8, 36 + o.y * rr, o.z * rr), o.clone().add(V(-0.35, 0, 0))), mMane2, 2.2);
      }
      const ear = side => { const g = ell(12, 12, 6, 16, 12); const gi = ell(7, 7, 2, 12, 8); gi.translate(0, 0, 4.5); return H.ear(c.head, [-2, 70, side * 26], g, mFur, gi, mIn); };
      c.ears = [{ b: ear(1), rot: [0.4, 1.3, 0], side: 1, ka: 0.6 }, { b: ear(-1), rot: [-0.4, -1.3, 0], side: -1, ka: 0.6 }];
      const eyes = sphereDecal(c.head, SK.slice(0, 3), SK.slice(3), { phi: 1.15, th0: 0.32, th1: 1.9, cx: 162, cy: 141 });
      const mou = sphereDecal(c.jaw, [MZ[0], MZ[1] - 20, MZ[2]], MZ.slice(3), { phi: 1.3, th0: 0.45, th1: 2.75, cx: 180, cy: 206 });
      c.face = faceRig({ eyes, mou }, st => ({
        eyes: eyesSvg(st, { x: 143, y: 130, rx: 18.5, ry: 22.5, side: -1 }, { x: 181, y: 130, rx: 18.5, ry: 22.5, side: 1 }, FUR, 8.5, '#7a3418', { iris: '#d9a02a' }),
        mou: taper([180, 200], [181, 210], [180, 218], 0.5, 3, 1) + mouthSvg(st, { x: 180, y: 228, w: 46, teeth: 8, skewN: -3 }) +
          `<circle cx="152" cy="214" r="2.4" fill="#a36a40"/><circle cx="148" cy="224" r="2.4" fill="#a36a40"/><circle cx="208" cy="214" r="2.4" fill="#a36a40"/><circle cx="212" cy="224" r="2.4" fill="#a36a40"/>`,
      }));
    },
  });
};

/* ================= ROOSTER (biped) ================= */
CAST.rooster = () => {
  const BODY = '#c8522c', HACK = '#eea23c', HACK2 = '#d77a2c', COMB = '#d8343a', BEAK = '#f2be3c', BEAK2 = '#d9962a', TINT = '#d6b6c0', FACEC = '#e9673f';
  const mBody = toon(BODY, { tint: TINT, regions: [{ p: [34, -40, 0], r: [56, 34, 60], c: '#a8401f', w: 0.05 }] }), mWing = toon('#a8401f', { tint: TINT }),
    mHack = toon(HACK, { tint: TINT, hi: 0 }), mHack2 = toon(HACK2, { tint: TINT, hi: 0 }), mComb = toon(COMB, { tint: TINT }), mBeak = toon(BEAK, { tint: '#d9c0b0' }),
    mBeak2 = toon(BEAK2, { tint: '#d9c0b0' }), mFace = toon(FACEC, { tint: TINT }), mT1 = toon('#2f5a4a', { tint: '#a9b4c4' }), mT2 = toon('#3a6b58', { tint: '#a9b4c4' }),
    mLeg = toon('#e8ad38', { tint: '#d6bcae' });
  return biped('rooster', {
    stride: 34, legMat: mLeg, legLen: 62,
    build(c, H) {
      c.torso = part(c.body, ell(64, 52, 44), mBody, 3, [6, 108, 0], [0, 0, 0.14]);
      c.wings = [1, -1].map(s => {
        const w = H.bone(c.body, [34, 128, s * 38]);
        const g = ell(44, 25, 9); g.rotateZ(0.12); part(w, g, mWing, 2.4, [-34, -12, s * 2]);
        for (const [y, l] of [[-22, 30], [-30, 26]]) { const g2 = cone(7, l, 0.4); g2.rotateZ(Math.PI / 2 + 0.2); part(w, g2, mWing, 1.6, [-70, y + 12, s * 2]); }
        return w;
      });
      c.tail = H.bone(c.body, [-46, 124, 0]);
      for (const [a, len, w, z, m] of [[0.15, 150, 21, 0, mT1], [0.65, 138, 20, 6, mT2], [1.1, 116, 18, -6, mT1], [0.4, 120, 16, 10, mT2], [0.9, 104, 15, -10, mT2]]) {
        const g = leafGeo(len, w, 1, 0.5); g.scale(1, 1, 0.3); bend(g, -1.1, len); g.rotateZ(a); g.translate(0, 0, z);
        part(c.tail, g, m, 2.2);
      }
      c.neckB = H.bone(c.body, [44, 150, 0]); c.neckB.userData.x0 = 44; c.neckB.userData.y0 = 150;
      part(c.neckB, ell(26, 40, 26), mFace, 2.4, [-4, 4, 0]);
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2, o = V(Math.cos(a), 0, Math.sin(a));
        part(c.neckB, aim(cone(13, 44 + 8 * Math.sin(i * 1.3), 0.5), V(o.x * 24 - 4, 14, o.z * 24), V(o.x * 0.55, -1, o.z * 0.55)), i % 2 ? mHack : mHack2, 2.2);
      }
      c.head = H.bone(c.neckB, [0, 40, 0]);
      const SK = [0, 10, 0, 30, 33, 30];
      part(c.head, ell(SK[3], SK[4], SK[5]), mFace, 2.6, SK.slice(0, 3));
      c.comb = H.bone(c.head, [0, 38, 0]);
      for (const [x, y, r] of [[-20, -2, 11], [-10, 8, 13], [2, 12, 14], [14, 9, 13], [23, 0, 10]]) part(c.comb, ell(r, r * 1.1, r * 0.45, 20, 14), mComb, 2.2, [x, y, 0]);
      const ub = cone(11, 34, 0.8); ub.rotateZ(-Math.PI / 2 - 0.12); part(c.head, ub, mBeak, 2.2, [24, 6, 0]);
      c.jaw = H.bone(c.head, [22, 0, 0]);
      const lb = cone(7.5, 24, 0.8); lb.rotateZ(-Math.PI / 2 - 0.3); part(c.jaw, lb, mBeak2, 2);
      part(c.head, ell(8, 15, 6), mComb, 2, [20, -18, 0]);
      const eyes = sphereDecal(c.head, SK.slice(0, 3), SK.slice(3), { phi: 1.2, th0: 0.25, th1: 1.6, cx: 162, cy: 141 });
      c.face = faceRig({ eyes }, st => ({ eyes: eyesSvg(st, { x: 144, y: 114, rx: 17.5, ry: 22.5, side: -1 }, { x: 180, y: 114, rx: 17.5, ry: 22.5, side: 1 }, FACEC, 8) }));
    },
  });
};

/* ================= OBJECTS WITH FACES ================= */
CAST.sefer = () => {
  const COV = '#2b4d8c', SPINE = '#1f3a6d', PAGE = '#f3e7cc', GOLD = '#e3b24c', TINT = '#b9b2cf';
  const mCov = toon(COV, { tint: TINT }), mPage = toon(PAGE, { tint: '#d6cbc0', hi: 0 });
  const mSpine = toon(SPINE, { tint: TINT, regions: [30, 54, 160, 184].map(y => ({ p: [0, y - 107, 0], r: [60, 6, 60], c: GOLD, w: 0 })) });
  return prop('sefer', {
    hopLen: 80, hopH: 40,
    build(c) {
      const T = 40, HH = 214, WD = 132, g = c.inner;
      part(g, new RoundedBoxGeometry(7, HH, WD, 2, 2.5), mCov, 2.6, [T / 2 - 3.5, HH / 2, 0]);
      part(g, new RoundedBoxGeometry(7, HH, WD, 2, 2.5), mCov, 2.6, [-T / 2 + 3.5, HH / 2, 0]);
      part(g, new RoundedBoxGeometry(T - 10, HH - 10, WD - 6, 2, 2), mPage, 2, [0, HH / 2, -4]);
      const sg = new THREE.CylinderGeometry(T / 2, T / 2, HH, 24, 1, false, -Math.PI / 2, Math.PI); part(g, sg, mSpine, 2.6, [0, HH / 2, WD / 2 - 3]);
      const dec = planeDecal(g, [T / 2 + 0.4, HH / 2, -2], WD - 10, HH - 6, { cx: 160, cy: 162, du: 0.95 });
      c.face = faceRig({ cover: dec }, st => {
        const fr = `<path d="M116 66L204 66L204 258L116 258Z" fill="none" stroke="${GOLD}" stroke-width="3.4" stroke-linejoin="round"/>` +
          `<path d="M123 73L197 73L197 251L123 251Z" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity=".8"/>` +
          [[116, 66], [204, 66], [204, 258], [116, 258]].map(p => `<path d="M${p[0]} ${p[1] - 7}L${p[0] + 7} ${p[1]}L${p[0]} ${p[1] + 7}L${p[0] - 7} ${p[1]}Z" fill="${GOLD}"/>`).join('');
        return { cover: fr + eyesSvg(st, { x: 141, y: 134, rx: 20, ry: 25, side: -1 }, { x: 179, y: 134, rx: 20, ry: 25, side: 1 }, COV, 8) + mouthSvg(st, { x: 160, y: 202, w: 52, teeth: 9, skewN: -3 }) };
      });
    },
  });
};
CAST.kettle = () => {
  const BODY = '#e0613e', LID = '#f2ead8', DARK = '#3b3532', TINT = '#d4b4bf';
  const mBody = toon(BODY, { tint: TINT }), mLid = toon(LID, { tint: '#d6cbd0' }), mDark = toon(DARK, { tint: '#9a8a90' });
  return prop('kettle', {
    hopLen: 90, hopH: 44,
    build(c) {
      const g = c.inner, B = [0, 74, 0], R = [90, 70, 90];
      part(g, ell(...R, 48, 32), mBody, 3, B);
      part(g, new THREE.CylinderGeometry(80, 74, 14, 48).translate(0, 7, 0), mDark, 2.6);
      c.lid = new THREE.Group(); c.lid.position.set(0, 136, 0); g.add(c.lid);
      part(c.lid, lathe([[0.01, 16], [26, 12], [42, 4], [48, -2], [0.01, -2]], 40), mLid, 2.4);
      part(c.lid, ell(9, 9, 9, 16, 12), mDark, 2, [0, 22, 0]);
      const hg = new THREE.TorusGeometry(54, 7, 12, 36, Math.PI); hg.rotateY(Math.PI / 2); part(g, hg, mDark, 2.4, [0, 140, 0]);
      const sd = (x, y, z) => V(x * 0.5, y, z), sp2 = [V(30, 52, -68), V(44, 78, -96), V(56, 112, -116), V(60, 128, -126)];
      part(g, tubeAlong(sp2, t => 16 - 8 * t, { segs: 24, radial: 14, round: false, cap: 0.04 }), mBody, 2.6);
      const dec = sphereDecal(g, B, R, { phi: 1.05, th0: 0.55, th1: 2.25, cx: 152, cy: 206, du: 1.0 });
      c.face = faceRig({ f: dec }, st => ({ f: eyesSvg(st, { x: 133, y: 186, rx: 19, ry: 23, side: -1 }, { x: 171, y: 186, rx: 19, ry: 23, side: 1 }, BODY, 8) +
        mouthSvg(st, { x: 152, y: 236, w: 44, teeth: 7, skewN: -3 }) }));
    },
    extra(c, po) { const ex = po.face && po.face.expr, tk = po.face && po.face.talk; c.lid.position.y = 136 + (ex === 'surprised' ? 12 : ex === 'happy' ? 3 : 0) + (tk ? 3 * (po.jaw || 0) : 0); c.lid.rotation.z = tk ? 0.07 * (po.jaw || 0) : 0; },
  });
};
CAST.stone = () => {
  const ROCK = '#aaa49a', TINT = '#b9b0c4', MOSS = '#7f9a52';
  const dots = [[50, 60, 66], [-40, 80, 80], [64, 40, -64], [-80, 50, -50], [30, 110, 60]].map(p => ({ p, r: [6, 6, 6], c: '#8d877d', w: 0 }));
  const mRock = toon(ROCK, { tint: TINT, regions: [{ p: [-10, 132, 0], r: [58, 24, 52], c: MOSS, w: 0.12 }, ...dots] });
  return prop('stone', {
    hopLen: 70, hopH: 22, tiltK: 0.5,
    build(c) {
      const g = c.inner, R = [124, 132, 104];
      const geo = ell(...R, 56, 36), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (x < 40) { const k = 1 + 0.05 * Math.sin(x * 0.05 + z * 0.04) * Math.sin(y * 0.06); p.setXYZ(i, x * k, y * k, z * k); } }
      geo.computeVertexNormals();
      part(g, geo, mRock, 3.2);
      for (const [x, y, z, r] of [[-62, 60, 64, 30], [-84, 40, -52, 28], [-6, 100, -66, 26]]) part(g, ell(r, r * 0.8, r), mRock, 2.4, [x, y, z]);
      const dec = sphereDecal(g, [0, 0, 0], R, { phi: 1.0, th0: 0.25, th1: 1.55, cx: 152, cy: 266, du: 0.74 });
      c.face = faceRig({ f: dec }, st => ({ f: eyesSvg(st, { x: 132, y: 168, rx: 20, ry: 24, side: -1 }, { x: 172, y: 168, rx: 20, ry: 24, side: 1 }, ROCK, 9) +
        mouthSvg(st, { x: 152, y: 222, w: 52, teeth: 8 }) }));
    },
  });
};
CAST.coin = () => {
  const GOLD = '#f2c14a', EDGE = '#c98a22', RIM = '#d99d2c', TINT = '#d9c0a8';
  const mEdge = toon(EDGE, { tint: TINT, stripes: 72 }), mGold = toon(GOLD, { tint: TINT });
  return prop('coin', {
    hopLen: 100, hopH: 50, tiltK: 1.4,
    build(c) {
      const g = c.inner, R = 96, T = 22;
      const geo = new THREE.CylinderGeometry(R, R, T, 96, 1); geo.rotateZ(Math.PI / 2);
      part(g, geo, [mEdge, mGold, mGold], 3, [0, R + 2, 0]);
      const dec = planeDecal(g, [T / 2 + 0.5, R + 2, 0], 2 * R - 4, 2 * R - 4, { cx: 159, cy: 151, du: 1.0 });
      c.face = faceRig({ f: dec }, st => {
        let rim = `<circle cx="159" cy="151" r="78" fill="none" stroke="${RIM}" stroke-width="5"/>`;
        for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2; rim += `<circle cx="${(159 + Math.cos(a) * 86).toFixed(1)}" cy="${(151 + Math.sin(a) * 86).toFixed(1)}" r="2.3" fill="${RIM}"/>`; }
        rim += taper([196, 84], [222, 108], [228, 150], 1, 6, 1, '#fff2c4');
        return { f: rim + eyesSvg(st, { x: 139, y: 132, rx: 20, ry: 24, side: -1 }, { x: 179, y: 132, rx: 20, ry: 24, side: 1 }, GOLD, 8) + mouthSvg(st, { x: 159, y: 190, w: 50, teeth: 8, skewN: -3 }) };
      });
    },
  });
};
export const ORDER = ['donkey', 'cow', 'goat', 'sheep', 'camel', 'dog', 'rooster', 'lion', 'sefer', 'kettle', 'stone', 'coin'];
