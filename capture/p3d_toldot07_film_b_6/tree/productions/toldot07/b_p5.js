// b_p5.js - film_b part 5: B8 (breaking wave, glass-wall cross-section) and B9 (run-up, soaking, macro dive into the grains). Exports `shots`.
import { THREE, box, cyl, toon, ease, prog, clamp, lerp, D, rng } from '../../lib/stage3d.js';
import { PAL, seaWorld, mkShot, vlabel, fly, sm, seq } from './shared.js';
import { sea, beach } from './sea.js';

const C3 = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const mix3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---- ribbon: a flat ink line of constant width along a polyline [[x,y],..] at depth z
function ribbon(Wd, maxN, w, color) {
  const pos = new Float32Array(maxN * 6), idx = [];
  for (let i = 0; i < maxN - 1; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, fog: false })); m.frustumCulled = false; Wd.add(m);
  return { mesh: m, set(pts, z) {
    const n = pts.length;
    for (let i = 0; i < maxN; i++) { const j = Math.min(i, n - 1), p = pts[Math.max(j - 1, 0)], q = pts[Math.min(j + 1, n - 1)], c = pts[j];
      let tx = q[0] - p[0], ty = q[1] - p[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; const nx = -ty * w / 2, ny = tx * w / 2;
      pos.set([c[0] + nx, c[1] + ny, z, c[0] - nx, c[1] - ny, z], i * 6); }
    g.attributes.position.needsUpdate = true; } };
}

// ---- slab: a polyline pair A (outer) / B (inner) extruded across z (front face, back face, outer skin, inner skin)
function slab(Wd, N, mat) {
  const V = 8 * N, pos = new Float32Array(V * 3), col = new Float32Array(V * 3), idx = [];
  for (let s = 0; s < 4; s++) for (let i = 0; i < N - 1; i++) { const a = s * 2 * N + 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false; Wd.add(m);
  const put = (s, i, x, y, z, c) => { const v = (s * 2 * N + i) * 3; pos[v] = x; pos[v + 1] = y; pos[v + 2] = z; col[v] = c[0]; col[v + 1] = c[1]; col[v + 2] = c[2]; };
  return { mesh: m, geo: g, set(A, B, zA, zB, cA, cB) {
    const n = A.length;
    for (let i = 0; i < N; i++) { const j = Math.min(i, n - 1), a = A[j], b = B[j], ca = cA[j], cb = cB[j];
      put(0, 2 * i, a[0], a[1], zA, ca); put(0, 2 * i + 1, b[0], b[1], zA, cb);
      put(1, 2 * i, a[0], a[1], zB, ca); put(1, 2 * i + 1, b[0], b[1], zB, cb);
      put(2, 2 * i, a[0], a[1], zA, ca); put(2, 2 * i + 1, a[0], a[1], zB, ca);
      put(3, 2 * i, b[0], b[1], zA, cb); put(3, 2 * i + 1, b[0], b[1], zB, cb); }
    g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere(); } };
}

function arrow(Wd, len, th, color) {   // points along +x, origin at the tail
  const gp = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color, fog: false });
  const sh = new THREE.Mesh(new THREE.BoxGeometry(len * .72, th, th), mat); sh.position.x = len * .36; gp.add(sh);
  const hd = new THREE.Mesh(new THREE.ConeGeometry(th * 2.2, len * .28, 12), mat); hd.rotation.z = -Math.PI / 2; hd.position.x = len * .86; gp.add(hd);
  Wd.add(gp); return gp;
}

// ------------------------------------------------------------------ B8: the breaking wave, side cross-section
const ZA = -3, ZB = 3, SL = .15, X0 = -36, X1 = 9, DX = .1, NB = Math.round((X1 - X0) / DX) + 1;
const SHAL = C3(PAL.seaShallow), DEEP = C3(PAL.seaDeep), FOAM = [1, 1, 1], SANDC = C3(PAL.sand), SANDD = C3(0xc9a46a);

function waveObj(ts, hAt) {
  const P = t => {
    const tau = t - ts, u = prog(tau, 0, 10); let xc, Hc, Lb, Lf;
    if (tau <= 10) xc = -22 + 10.5 * (1 - Math.pow(1 - u, 1.7)); else if (tau <= 20) xc = -11.5 + .12 * (tau - 10); else { const a = tau - 20; xc = -10.3 + .5 * a + .04 * a * a; }
    if (tau <= 10) Hc = lerp(.9, 1.9, ease.sm(u)); else if (tau <= 20) Hc = 1.9; else Hc = lerp(1.9, .95, ease.sm(prog(tau, 20, 22.5))) * (1 - .25 * prog(tau, 22.5, 34));
    Hc *= 1.35; if (ts > 0) Hc *= prog(tau, 0, 1.5);
    Lb = tau <= 20 ? lerp(4.5, 3.2, ease.sm(u)) : lerp(3.2, 5.5, ease.sm(prog(tau, 20, 24)));
    Lf = tau <= 10 ? lerp(3, 1.1, ease.sm(u)) : lerp(1.1, .3, ease.sm(prog(tau, 10, 18)));
    return { tau, xc, Hc, Lb, Lf, al: 1.83 * ease.sm(prog(tau, 10, 17)), k: prog(tau, 20, 21.5) };
  };
  const level = (x, p) => { const s = x - p.xc; if (p.Hc <= 0) return 0;
    if (s < 0) return s > -p.Lb ? p.Hc * .5 * (1 + Math.cos(Math.PI * s / p.Lb)) : 0;
    return s < p.Lf ? p.Hc * .5 * (1 + Math.cos(Math.PI * s / p.Lf)) : 0; };
  const foam = (x, p) => { const s = x - p.xc, tau = p.tau; let f = 0;
    if (tau < 20 && tau > 8 && Math.abs(s) < .45) f = .85 * ease.sm(prog(tau, 8, 12));
    const b = ease.sm(prog(tau, 21, 22.2)) * (1 - .5 * prog(tau, 24, 34));
    if (b > 0 && s < p.Lf + .2 && s > -3.8) { const q = s > 0 ? 1 : 1 - prog(-s, 0, 3.8), nz = .5 + .5 * Math.sin(x * 6.3 + tau * 2.1) * Math.sin(x * 2.7 - tau * 1.3);
      f = Math.max(f, q > .12 ? b * (q * 1.2 + nz * .45 > .62 ? 1 : .4) : 0); }
    return f; };
  const lip = p => {   // [outer pts, inner pts] or null
    if (p.al < .03 || p.k >= 1) return null;
    const n = 26, R = .5 * p.Hc, A = [], B = [], e = ease.in(p.k);
    for (let j = 0; j < n; j++) { const f = j / (n - 1), ph = p.al * f, d = R * lerp(.3, .07, f), cy = p.Hc - R;
      let ox = p.xc + R * Math.sin(ph), oy = cy + R * Math.cos(ph), ix = p.xc + (R - d) * Math.sin(ph), iy = cy + (R - d) * Math.cos(ph);
      ox += .7 * R * p.k; ix += .7 * R * p.k; oy = oy * (1 - e) + .1 * e; iy = iy * (1 - e) + .09 * e; A.push([ox, oy]); B.push([ix, iy]); }
    return [A, B];
  };
  return { P, level, foam, lip };
}

const B8 = mkShot(30, ['CAP_B_22', 'CAP_B_23', 'CAP_B_24', 'CAP_B_25'], [0.5, 7.8, 15.1, 22.4], () => {
  const Wd = seaWorld({ shadowExt: 22, elev: 30, target: [-11, 0, 0], fogNear: 60, fogFar: 400 });
  const Bc = beach(Wd, { slope: SL, x0: 0, z0: ZA, z1: ZB, xMin: X0, xMax: X1, floor: -4, wetX: -2 });
  const hAt = Bc.heightAt;
  Wd.add(box(220, .4, 70, 0xf4ead2, { pos: [-20, -5.2, 0] }));
  // sand cut-face (glass wall section): light sand over a darker bed
  const sand = slab(Wd, 91, toon(0xffffff, { vertexColors: true, side: THREE.DoubleSide }));
  { const A = [], Bn = [], cA = [], cB = []; for (let i = 0; i < 91; i++) { const x = X0 + (X1 - X0) * i / 90; A.push([x, hAt(x) - .004]); Bn.push([x, -4.9]); cA.push(SANDC); cB.push(SANDD); } sand.set(A, Bn, ZA, ZB, cA, cB); }
  const sandLine = []; for (let i = 0; i < 91; i++) { const x = X0 + (X1 - X0) * i / 90; sandLine.push([x, hAt(x)]); }
  const rbS = ribbon(Wd, 91, .05, PAL.ink); rbS.set(sandLine, ZB + .004);
  const rbB = ribbon(Wd, 2, .05, PAL.ink); rbB.set([[X0, -4.9], [X1, -4.9]], ZB + .004);
  // a few dots of grain on the cut face
  { const r = rng(8); for (let i = 0; i < 90; i++) { const x = X0 + 4 + r() * (X1 - X0 - 4), yb = hAt(x) - .25 - r() * (hAt(x) + 4.5 - .3); if (yb < -4.6) continue;
      const dot = new THREE.Mesh(new THREE.CircleGeometry(.05 + r() * .06, 8), new THREE.MeshBasicMaterial({ color: 0xb8925a })); dot.position.set(x, yb, ZB + .006); Wd.add(dot); } }
  // water
  const W1 = waveObj(0, hAt), W2 = waveObj(14, hAt);
  const body = slab(Wd, NB, toon(0xffffff, { vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: .93 }));
  const rbT = ribbon(Wd, NB, .05, PAL.ink);
  const lips = [W1, W2].map(() => ({ s: slab(Wd, 26, toon(0xffffff, { vertexColors: true, side: THREE.DoubleSide })), r: ribbon(Wd, 52, .05, PAL.ink) }));
  Wd.hero = body.mesh;
  // spray / foam particles, pure function of t
  const NP = 220, rr = rng(21), part = [];
  for (let i = 0; i < NP; i++) { const burst = i >= 80, z = ZA + .2 + rr() * (ZB - ZA - .4);
    part.push(burst ? { te: 21 + rr() * .5, vx: -1 + rr() * 4.5, vy: 2 + rr() * 3.8, vz: (rr() - .5) * 3, life: 1.4 + rr() * 1.2, r: .06 + rr() * .1, z, burst }
                    : { te: 13.5 + rr() * 7.2, vx: .5 + rr() * 1.4, vy: .2 + rr() * 1.1, vz: (rr() - .5) * .8, life: 1 + rr() * 1, r: .05 + rr() * .07, z, burst }); }
  const inst = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), NP); inst.frustumCulled = false; Wd.add(inst);
  const inkI = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide, fog: false }), NP); inkI.frustumCulled = false; Wd.add(inkI);
  const mt = new THREE.Matrix4(), q0 = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  // gold arrows: bottom drags (short, slow), top keeps going (long)
  const aDrag = arrow(Wd, 1.3, .08, PAL.gold), aTop = arrow(Wd, 2.6, .08, PAL.gold); aDrag.rotation.z = Math.PI;
  Wd.on(t => {
    const p1 = W1.P(t), p2 = W2.P(t), xs = [], A = [], Bn = [], cA = [], cB = [];
    for (let i = 0; i < NB; i++) { const x = X0 + i * DX, hs = hAt(x), lv = Math.max(W1.level(x, p1), W2.level(x, p2)), f = Math.max(W1.foam(x, p1), W2.foam(x, p2));
      const ytop = Math.max(0, hs) + lv + (lv < .004 ? .014 : 0); A.push([x, ytop]); Bn.push([x, hs]);
      cA.push(mix3(SHAL, FOAM, f)); cB.push(mix3(DEEP, FOAM, f * .5)); }
    body.set(A, Bn, ZA, ZB, cA, cB); rbT.set(A, ZB + .006);
    [[W1, p1], [W2, p2]].forEach(([W, p], k) => { const L = W.lip(p), o = lips[k];
      if (!L) { o.s.mesh.visible = false; o.r.mesh.visible = false; return; }
      o.s.mesh.visible = true; o.r.mesh.visible = true; const n = L[0].length, ca = [], cb = [];
      for (let j = 0; j < n; j++) { const f = j / (n - 1); ca.push(mix3(SHAL, FOAM, clamp((f - .55) * 2.2, 0, 1) * .9)); cb.push(mix3(DEEP, SHAL, .35)); }
      o.s.set(L[0], L[1], ZA, ZB, ca, cb); o.r.set(L[0].concat(L[1].slice().reverse()), ZB + .008); });
    // particles
    const lt = W1.lip(W1.P(Math.max(t, 0)));
    for (let i = 0; i < NP; i++) { const q = part[i], age = t - q.te; let s = 0;
      if (age > 0 && age < q.life) {
        const pe = W1.P(q.te), R = .5 * pe.Hc; let ox, oy;
        if (q.burst) { ox = pe.xc + .9 * R; oy = .25; } else { const a = Math.min(pe.al, 1.83); ox = pe.xc + R * Math.sin(a); oy = pe.Hc - R + R * Math.cos(a); }
        const x = ox + q.vx * age, y = oy + q.vy * age - 4.9 * age * age, z = q.z + q.vz * age; s = q.r * (1 - prog(age, q.life * .7, q.life)) * (y > .02 ? 1 : 0);
        ps.set(x, y, z); }
      else ps.set(0, -50, 0);
      sc.set(s, s, s); mt.compose(ps, q0, sc); inst.setMatrixAt(i, mt); sc.setScalar(s * 1.2); mt.compose(ps, q0, sc); inkI.setMatrixAt(i, mt); }
    inst.instanceMatrix.needsUpdate = true; inkI.instanceMatrix.needsUpdate = true;
    // arrows follow the first wave
    const ka = ease.out(prog(p1.tau, 1.5, 2.6)) * (1 - ease.in(prog(p1.tau, 8.5, 10)));
    aDrag.visible = aTop.visible = ka > .02;
    aDrag.scale.setScalar(Math.max(ka, .01)); aTop.scale.setScalar(Math.max(ka, .01));
    aDrag.position.set(p1.xc + .6, hAt(p1.xc) + .38, ZB + .2); aTop.position.set(p1.xc - .2, p1.Hc + .75, ZB + .2);
  });
  vlabel(Wd, 'LBL_B_07', { pos: [-10.2, 4.3, 0], height: .8, show: t => sm(t, 15.8, 17) * (1 - sm(t, 28.3, 29.6)) });
  // camera: locked side view, 90 degree orbit to the front, then round the open end of the second wave into its curl
  const CEN = [-11, 1.4, 0], side = t => { const k = prog(t, 0, 8); return { pos: [lerp(-13, -11, k), lerp(3.4, 2.8, k), 14], look: [-11.5 + 1.2 * k, 1, 0], fov: 50 }; };
  const sA = side(8), orb = t => { const k = ease.io(prog(t, 8, 24)), a = lerp(0, -65, k) * D, r = lerp(14, 9.5, k);
    return { pos: [CEN[0] + Math.sin(a) * r, lerp(sA.pos[1], 3, k), CEN[2] + Math.cos(a) * r], look: [lerp(sA.look[0], CEN[0], k), lerp(1, CEN[1], k), 0], fov: lerp(50, 46, k) }; };
  const o24 = orb(24);
  const into = fly([[24, o24.pos, o24.look, 46], [27, [-19, 2.4, 9.5], [-11, 1.2, 0], 52], [29.2, [-10.5, .6, 6.5], [-10.2, .9, 1], 64], [30, [-10.15, .45, 1.0], [-6.5, 1.1, -.5], 78]]);
  return Object.assign(Wd, { cam: seq([0, side], [8, orb], [24, into]) });
});

// ------------------------------------------------------------------ B9: run-up, soaking, macro dive
const MX = 400, MY = 200, MZ = 0, SP = .42;
const B9 = mkShot(23, ['CAP_B_26', 'CAP_B_27', 'CAP_B_28'], [0.5, 7.9, 15.3], () => {
  const Wd = seaWorld({ shadowExt: 18, elev: 30, target: [3, 0, 0], fogNear: 50, fogFar: 380 });
  const S = sea(Wd, { amp: .2, wavelength: 6, dir: 0 });
  const Bc = beach(Wd, { slope: .1, x0: 0, z0: -16, z1: 16, xMin: -18, xMax: 60, floor: -3, wetX: -1 });
  const T0 = -1.1, DUR = 15, XB = -2.5, XM = 8.5;
  const n0 = Wd.scene.children.length; Bc.tongue({ t0: T0, dur: DUR, xBreak: XB, xMax: XM, thick: .6 }); const tongueWater = Wd.scene.children[n0];
  // gold dashed line at the highest point reached, drawn from the middle outwards
  const dm = new THREE.MeshBasicMaterial({ color: PAL.gold, fog: false }), dashes = [];
  for (let i = -26; i <= 26; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.09, .05, .38), dm); m.position.set(XM + .1, Bc.heightAt(XM + .1) + .03, i * .6); Wd.add(m); dashes.push([m, Math.abs(i) / 26]); }
  Wd.on(t => { const k = prog(t, 5.0, 7.4); dashes.forEach(([m, d]) => { m.visible = k > d * .9 + .02; }); });
  vlabel(Wd, 'LBL_B_08', { pos: [XM + .1, 1.7, 0], height: .62, show: t => sm(t, 5.6, 6.6) * (1 - sm(t, 9, 10)) });

  // ----- macro world (far away, lifted): grains 0.3 m wide, a cave under a lid of grains, drops sinking
  const NXg = 14, NZg = 8, NYg = 7, grains = [], r = rng(5), cols = [0xf0d9a8, 0xe3c48c, 0xd9b97a, 0xefcf9a, 0xc9a46a, 0xf6e3b8].map(C3);
  for (let l = 0; l < NYg; l++) for (let k = 0; k < NZg; k++) for (let i = -NXg / 2; i < NXg / 2; i++) {
    const x = i * SP, inCave = Math.abs(x) < .9 && k < 2 && l >= 1 && l <= NYg - 2; if (inCave) { r(); r(); r(); r(); r(); continue; }
    grains.push({ p: [MX + x + (r() - .5) * .05, MY - l * .4 + (r() - .5) * .05, MZ - k * SP + (r() - .5) * .05], s: [.14 + r() * .035, .13 + r() * .03, .14 + r() * .035], c: cols[Math.floor(r() * cols.length)], rot: r() * 6 }); }
  const G = grains.length, gi = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), toon(0xffffff), G), gk = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide, fog: false }), G);
  gi.frustumCulled = gk.frustumCulled = false; Wd.add(gi); Wd.add(gk);
  const mt = new THREE.Matrix4(), qq = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  grains.forEach((g, i) => { qq.setFromEuler(new THREE.Euler(g.rot, g.rot * 1.7, g.rot * .6)); ps.set(...g.p); sc.set(...g.s); mt.compose(ps, qq, sc); gi.setMatrixAt(i, mt);
    sc.set(g.s[0] * 1.12 + .008, g.s[1] * 1.12 + .008, g.s[2] * 1.12 + .008); mt.compose(ps, qq, sc); gk.setMatrixAt(i, mt); });
  const WET = C3(0x8f7248), tmp = new THREE.Color();
  gi.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(G * 3), 3);
  Wd.add(box(10, 6, .3, 0x5e4426, { pos: [MX, MY - 1, MZ - 3.7] }));
  Wd.add(box(10, .4, 6, 0x8a6a42, { pos: [MX, MY - 2.78, MZ - 1.3] }));
  Wd.add(box(.3, 6, 6, 0x5e4426, { pos: [MX - 5.2, MY - 1, MZ - 1.3] })); Wd.add(box(.3, 6, 6, 0x5e4426, { pos: [MX + 5.2, MY - 1, MZ - 1.3] }));
  const pl = new THREE.PointLight(0xffe2a6, 2.4, 22, 0); pl.position.set(MX - 3, MY + 4.5, MZ + 4); Wd.add(pl);
  const film = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.6), new THREE.MeshBasicMaterial({ color: PAL.seaShallow, transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  film.rotation.x = -Math.PI / 2; film.position.set(MX, MY + .15, MZ - 1.3); Wd.add(film);
  // drops
  const ND = 90, drops = [], gx = [-2, -1, 0, 1].map(i => (i + .5) * SP), rd = rng(77);
  for (let i = 0; i < ND; i++) drops.push({ te: 10.9 + rd() * 9.5, x: gx[i % gx.length] + (rd() - .5) * .02, z: MZ - SP / 2 - (i % 2 === 0 ? 0 : 0), r: .045 + rd() * .03, ph: rd() * 6 });
  const dm2 = new THREE.MeshToonMaterial({ color: PAL.seaShallow, emissive: 0x1f78b4, emissiveIntensity: .45, gradientMap: null });
  const dI = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), dm2, ND); dI.frustumCulled = false; Wd.add(dI);
  const dK = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide, fog: false }), ND); dK.frustumCulled = false; Wd.add(dK);
  Wd.hero = tongueWater;
  // sand-coloured veil for the dive (hides the jump to the macro world)
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: 0xb08c55, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false })); veil.renderOrder = 20; veil.frustumCulled = false; Wd.add(veil);
  const fw = new THREE.Vector3();
  Wd.on((t, cam) => {
    const macro = t >= 10.6; S.mesh.visible = !macro; Wd.hero = macro ? gi : tongueWater;
    const wd = 3.2 * ease.sm(prog(t, 11.5, 22)), c = new THREE.Color();
    for (let i = 0; i < G; i++) { const g = grains[i], dep = MY - g.p[1], w = clamp((wd - dep) / .5, 0, 1) * .85; const cc = mix3(g.c, WET, w); gi.instanceColor.setXYZ(i, cc[0], cc[1], cc[2]); }
    gi.instanceColor.needsUpdate = true;
    film.position.y = MY + lerp(.2, .0, ease.sm(prog(t, 11.3, 17))); film.material.opacity = .55 * (1 - ease.sm(prog(t, 17, 22)));
    for (let i = 0; i < ND; i++) { const d = drops[i], age = t - d.te; let s = 0, y = -50;
      if (age > 0) { const fall = 1.0 * age * age * .5 + .22 * age, yy = MY + .1 - fall, yl = MY - 2.22; y = Math.max(yy, yl); const landed = yy < yl; s = d.r * (landed ? 1 - prog(yy, yl, yl - .35) : 1) * (1 - ease.sm(prog(age, 0, .5)) * 0 );
        if (yy > MY - .02) s = d.r * .7; }
      ps.set(MX + d.x + .015 * Math.sin(age * 3 + d.ph), y, d.z); qq.identity(); sc.set(s, s * (yy_stretch(age)), s); mt.compose(ps, qq, sc); dI.setMatrixAt(i, mt); sc.multiplyScalar(1.18); mt.compose(ps, qq, sc); dK.setMatrixAt(i, mt); }
    dI.instanceMatrix.needsUpdate = true; dK.instanceMatrix.needsUpdate = true;
    const vo = ease.sm(prog(t, 9.2, 10.2)) * (1 - ease.sm(prog(t, 10.7, 11.4)));
    veil.visible = vo > .01; veil.material.opacity = vo; cam.getWorldDirection(fw); veil.position.copy(cam.position).addScaledVector(fw, .35); veil.quaternion.copy(cam.quaternion);
  });
  function yy_stretch(a) { return 1.2 + .25 * Math.min(a, 1.5); }
  const beachCam = fly([[0, [-7, 4.2, 7.5], [1.5, .2, 0], 52], [4, [-1, 3.8, 7], [5, .3, 0], 50], [8.5, [4.5, 2.8, 5.5], [8.2, .2, 0], 45], [10.6, [7.4, .7, 2.0], [8.4, 0, .9], 38]]);
  const macroCam = fly([[10.6, [MX + 2.8, MY + 2.4, MZ + 3.8], [MX - .2, MY - .1, MZ - .5], 50], [16, [MX + 1.6, MY + .5, MZ + 2.6], [MX, MY - .9, MZ - .5], 48], [23, [MX + .2, MY - 1.0, MZ + 1.6], [MX, MY - 1.35, MZ - .5], 56]]);
  return Object.assign(Wd, { cam: seq([0, beachCam], [10.6, macroCam]) });
});

export const shots = [B8, B9];
