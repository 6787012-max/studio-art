// b_p6.js - film_b part 6: B10 (border verse at dusk, line in the sand) and B11 (wave wall stops one thread before the sand). Exports `shots`.
import { THREE, toon, ink, ease, prog, clamp, lerp, D, rng } from '../../lib/stage3d.js';
import { PAL, seaWorld, mkShot, fly, sm, boy, rav } from './shared.js';
import { sea, beach } from './sea.js';

const C3 = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const mix3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---- slab: polyline pair A (top) / B (bottom) extruded across z (own copy, same technique as b_p5)
function slab(Wd, N, mat) {
  const V = 8 * N, pos = new Float32Array(V * 3), col = new Float32Array(V * 3), idx = [];
  for (let s = 0; s < 4; s++) for (let i = 0; i < N - 1; i++) { const a = s * 2 * N + 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.receiveShadow = true; Wd.add(m);
  const put = (s, i, x, y, z, c) => { const v = (s * 2 * N + i) * 3; pos[v] = x; pos[v + 1] = y; pos[v + 2] = z; col[v] = c[0]; col[v + 1] = c[1]; col[v + 2] = c[2]; };
  return { mesh: m, set(A, B, zA, zB, cA, cB) {
    for (let i = 0; i < N; i++) { const a = A[i], b = B[i], ca = cA[i], cb = cB[i];
      put(0, 2 * i, a[0], a[1], zA, ca); put(0, 2 * i + 1, b[0], b[1], zA, cb);
      put(1, 2 * i, a[0], a[1], zB, ca); put(1, 2 * i + 1, b[0], b[1], zB, cb);
      put(2, 2 * i, a[0], a[1], zA, ca); put(2, 2 * i + 1, a[0], a[1], zB, ca);
      put(3, 2 * i, b[0], b[1], zA, cb); put(3, 2 * i + 1, b[0], b[1], zB, cb); }
    g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere(); } };
}

// ------------------------------------------------------------------ B10: the border verse at dusk
const XM = 7, SL10 = .045;
const B10 = mkShot(26, ['CAP_B_29', 'CAP_B_30', 'CAP_B_31'], [0.5, 8.9, 17.3], () => {
  const Wd = seaWorld({ elev: 12, az: 8, target: [XM - 2, 0, 0], shadowExt: 26, fogNear: 50, fogFar: 380 });
  const S = sea(Wd, { amp: .2, wavelength: 11, speed: 1.9, dir: 0 });
  const Bc = beach(Wd, { slope: SL10, x0: 0, z0: -22, z1: 22, xMin: -14, xMax: 44, floor: -3, wetX: XM - 1 });
  const hAt = Bc.heightAt;
  // long low waves arriving and stopping exactly at the line
  [0.3, 5.7, 11.1, 16.5, 21.9].forEach(t0 => Bc.tongue({ t0, dur: 7.6, xBreak: .6, xMax: XM, thick: .2, z0: -22, z1: 22 }));
  // the gold dashed line in the sand, long enough to lead the eye
  const lineG = new THREE.Group(), dm = new THREE.MeshBasicMaterial({ color: PAL.gold, fog: false });
  for (let i = -22; i <= 22; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(.16, .07, .5), dm); d.position.set(XM + .14, hAt(XM + .14) + .035, i * .9); lineG.add(d);
    const k = new THREE.Mesh(new THREE.BoxGeometry(.2, .06, .56), new THREE.MeshBasicMaterial({ color: PAL.ink, fog: false })); k.position.set(XM + .14, hAt(XM + .14) + .02, i * .9); lineG.add(k); }
  Wd.add(lineG); Wd.hero = lineG;
  // dusk stones and driftwood so the sand is not empty
  const r = rng(61), stoneMat = [0x9a8f7e, 0xb3a58c, 0x8c8272].map(c => toon(c));
  for (let i = 0; i < 18; i++) {
    const x = XM + 2 + r() * 20, z = (r() - .5) * 36, s = .12 + r() * .3, m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), stoneMat[i % 3]);
    m.scale.set(s * 1.3, s * .7, s); m.position.set(x, hAt(x) + s * .3, z); m.castShadow = true; ink(m, .03, PAL.ink); Wd.add(m); }
  const wood = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, 3.2, 8), toon(0x8a6a42)); wood.rotation.set(Math.PI / 2, 0, .5); wood.position.set(XM + 5.5, hAt(XM + 5.5) + .12, 5.5); wood.castShadow = true; ink(wood, .03, PAL.ink); Wd.add(wood);
  // the two figures walk in from behind and stand at the line, both looking out to sea
  const BX = XM + .7, st = (t, x0, z0, x1, z1) => { const k = ease.sm(prog(t, 8.9, 12.6)), x = lerp(x0, x1, k), z = lerp(z0, z1, k);
    return { pos: [x, hAt(x), z], facing: -Math.PI / 2 + .12 * (1 - k) * Math.sign(z0 - z1 || 1), walk: k > .02 && k < .98 ? 1 : 0, gesture: 'rest', talk: 0, smile: .1, groundY: 0, scale: Math.max(.02, ease.out(prog(t, 8.9, 9.7))) }; };
  boy(Wd, t => { const s = st(t, XM + 6.5, 2.6, BX, .55); s.scale = s.scale * 1; return s; });
  rav(Wd, t => st(t, XM + 6.9, 1.6, BX, -.45));
  // camera: slow orbit about the line (50 degrees), then a dolly back
  const c = [XM, 0, 0];
  const cam = t => {
    const k = ease.io(prog(t, 0, 17)), a = (lerp(-62, -12, k) + lerp(0, -4, ease.io(prog(t, 17, 26)))) * D;
    const r = lerp(12, 7.6, k) + lerp(0, 7.6, ease.io(prog(t, 17, 26))), y = lerp(1.9, 1.55, k) + lerp(0, .9, ease.io(prog(t, 17, 26)));
    const ly = lerp(.35, 1.05, ease.sm(prog(t, 8.5, 12.5))), lx = XM - lerp(0, 1.4, ease.io(prog(t, 17, 26)));
    return { pos: [c[0] + Math.cos(a) * r, y + hAt(c[0] + Math.cos(a) * r), c[2] + Math.sin(a) * r], look: [lx, ly + hAt(lx), 0], fov: lerp(52, 46, k) };
  };
  return Object.assign(Wd, { cam });
});

// ------------------------------------------------------------------ B11: the wall of water stops one thread before the sand
const ZA = -20, ZB = 20, G = .05, NB = 44, NF = 40, NTOT = NB + NF;
const WALL_D = C3(0x0b2f55), WALL_0 = C3(0x0e3d6e), WALL_1 = C3(0x14568f), WALL_2 = C3(0x1f78b4), FOAMC = [1, 1, 1];
const B11 = mkShot(23, ['CAP_B_32', 'CAP_B_33', 'CAP_B_34'], [0.5, 7.9, 15.3], () => {
  const Wd = seaWorld({ elev: 24, az: 8, target: [-3, 0, 0], shadowExt: 26, fogNear: 55, fogFar: 380 });
  const S = sea(Wd, { amp: .12, wavelength: 9, speed: 1.6, dir: 0 });
  const Bc = beach(Wd, { slope: .08, x0: 0, z0: -22, z1: 22, xMin: -6, xMax: 30, floor: -3, wetX: 2 });
  // wet-sand shelf in the gap, the glowing sand line, a gold thread lying in the gap
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(G + .004, .03, 44), new THREE.MeshBasicMaterial({ color: 0xc9a46a })); shelf.position.set(-G / 2, -.003, 0); Wd.add(shelf);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(.1, .07, 44), new THREE.MeshBasicMaterial({ color: 0xf2c14e, fog: false })); ridge.position.set(.05, .035, 0); Wd.add(ridge);
  const glow = new THREE.Mesh(new THREE.BoxGeometry(.7, .01, 44), new THREE.MeshBasicMaterial({ color: 0xffd774, transparent: true, opacity: .1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); glow.position.set(.05, .085, 0); Wd.add(glow);
  const thread = new THREE.Mesh(new THREE.CylinderGeometry(G / 2 - .004, G / 2 - .004, 44, 12), new THREE.MeshBasicMaterial({ color: PAL.gold, fog: false })); thread.rotation.x = Math.PI / 2; thread.position.set(-G / 2, G / 2 + .012, 0); Wd.add(thread);
  const tInk = new THREE.Mesh(new THREE.CylinderGeometry(G / 2 + .002, G / 2 + .002, 44, 12), new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide })); tInk.rotation.x = Math.PI / 2; tInk.position.copy(thread.position); Wd.add(tInk);
  // two walls: the front one that stops, and the one behind that leans in
  const mat = () => toon(0xffffff, { vertexColors: true, side: THREE.DoubleSide });
  const W = [slab(Wd, NTOT, mat()), slab(Wd, NTOT, mat())];
  const trem = t => sm(t, 4.4, 5.2) * (1 - sm(t, 9.4, 10));
  const P1 = t => ({ xf: -G - 2.4 * (1 - ease.out(prog(t, 0, 4.4))) + .009 * Math.sin(t * 41) * trem(t) - 5 * ease.in(prog(t, 10, 15)),
    Hc: lerp(5.5, 8, ease.sm(prog(t, 0, 4))) * (1 - .88 * ease.in(prog(t, 10.5, 15))) + .05 * trem(t) * Math.sin(t * 29), lean: .6 * (1 - .7 * prog(t, 10, 15)), Lb: 14, ph: 0 });
  const P2 = t => ({ xf: -G - 7.9 - 2.4 * (1 - ease.out(prog(t, 0, 4.4))) + 5.3 * ease.io(prog(t, 11, 21)), Hc: lerp(5.5, 7, ease.sm(prog(t, 0, 8))), lean: lerp(.2, 1.3, ease.sm(prog(t, 2, 14))), Lb: 16, ph: 2.3 });
  const shape = (p, t) => {
    const A = [], B = [], cA = [], cB = [], xcr = p.xf + p.lean, amp = .07 * p.Hc / 8;
    for (let i = 0; i < NB; i++) { const u = i / (NB - 1), x = xcr - p.Lb * (1 - u), y = p.Hc * Math.pow(.5 - .5 * Math.cos(Math.PI * u), 1.1) + amp * Math.sin(x * 1.6 + t * 1.3 + p.ph) * u * (1 - u) * 4;
      const h = clamp(y / p.Hc, 0, 1), band = Math.floor(h * 4) / 4; let c = mix3(WALL_0, WALL_2, band); if (u > .93) c = mix3(c, FOAMC, .75);
      A.push([x, y]); B.push([Math.min(x, p.xf), -.05]); cA.push(c); cB.push(WALL_D); }
    for (let j = 1; j <= NF; j++) { const v = j / NF, y = p.Hc * (1 - v), h = 1 - v, x = p.xf + p.lean * Math.pow(h, 2.2);
      const band = Math.floor(h * 4) / 4; let c = mix3(WALL_0, WALL_1, band); c = mix3(c, WALL_2, Math.pow(h, 3) * .6); if ((h * 8) % 1 < .16 && h > .15) c = mix3(c, WALL_2, .8); if (h > .9) c = mix3(c, FOAMC, .85); else if (h < .08) c = mix3(c, FOAMC, .55);
      A.push([x, y]); B.push([p.xf, -.05]); cA.push(c); cB.push(WALL_D); }
    return [A, B, cA, cB];
  };
  // foam at the foot of the front wall: it shakes while the wall trembles
  const NP = 240, rr = rng(33), part = [];
  for (let i = 0; i < NP; i++) part.push({ z: (rr() - .5) * 30, dx: -.08 - rr() * .6, y: .1 + rr() * rr() * .8, r: .1 + rr() * .17, ph: rr() * 6.3 });
  const fi = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), NP), fk = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide, fog: false }), NP);
  fi.frustumCulled = fk.frustumCulled = false; Wd.add(fi); Wd.add(fk);
  const mt = new THREE.Matrix4(), q0 = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  Wd.hero = W[0].mesh;
  Wd.on(t => {
    [P1(t), P2(t)].forEach((p, k) => { const s = shape(p, t); W[k].set(s[0], s[1], ZA, ZB, s[2], s[3]); });
    const p1 = P1(t), tr = trem(t), vis = sm(t, 2.8, 4.2) * (1 - sm(t, 10.4, 12.2));
    for (let i = 0; i < NP; i++) { const q = part[i], s = q.r * vis * (1 + .15 * tr * Math.sin(t * 37 + q.ph));
      ps.set(p1.xf + q.dx + .05 * tr * Math.sin(t * 43 + q.ph), q.y * (1 + .6 * tr) + .22 * tr * Math.abs(Math.sin(t * 19 + q.ph)), q.z);
      sc.set(s, s, s); mt.compose(ps, q0, sc); fi.setMatrixAt(i, mt); sc.setScalar(s * 1.2); mt.compose(ps, q0, sc); fk.setMatrixAt(i, mt); }
    fi.instanceMatrix.needsUpdate = true; fk.instanceMatrix.needsUpdate = true;
    const tk = ease.out(prog(t, 16.2, 17.4)); thread.scale.set(Math.max(tk, .01), 1, 1); tInk.scale.copy(thread.scale); thread.visible = tInk.visible = tk > .02;
  });
  const cam = fly([
    [0, [8, .6, -3.5], [-.4, 2.6, 0], 62], [3, [6.5, .8, -1.5], [-.4, 3.6, 0], 60], [6, [4.6, 1.0, .6], [-.5, 5, 0], 56],
    [8.5, [2.8, 9.8, -1.6], [-.3, 1, 0], 52], [11, [-1.5, 12, -5.5], [1.2, 0, 0], 50], [16, [2.2, 3.2, -3.4], [-.02, .05, 0], 40],
    [19.5, [.62, .3, .9], [-.03, .03, 0], 32], [23, [.55, .2, .8], [-.03, .03, 0], 30]]);
  return Object.assign(Wd, { cam });
});

export const shots = [B10, B11];
