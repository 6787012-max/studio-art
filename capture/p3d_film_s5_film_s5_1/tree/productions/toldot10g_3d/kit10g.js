/* kit10g - thin layer over the gezer_trip kit for the Toldot Eretz Yisrael lesson 10 films (gezer_trip look).
   No people, no text. ASCII only. Every function is a pure function of the time you pass in.
   Needs the classic scripts of kit07 on the page (see film_s4.html) because of makeTipa. */
import * as THREE from 'three';
import { sm, lerp3, easeOutBack, makeHills, makeClouds } from '../gezer_trip/film_a/gz_kit.js';
import { heightMesh, rng, shadowable } from '../gezer_trip/film_a/gz_kit2.js';
import { lam, phong, noiseTex, woodTex, waveTex, ashMat, inst, tufts, rocks, bushes, makeCity } from '../gezer_trip/film_a/gz_kit3.js';
import { makeTipa } from '../toldot07_kit/kit07.js';
import LAND from '../toldot10_kit/land_data.js';

export { THREE, sm, lerp3, rng, shadowable, lam, phong, heightMesh, noiseTex, woodTex, waveTex, tufts, rocks, bushes, inst, makeCity, makeHills, makeClouds };
export const cl = u => Math.max(0, Math.min(1, u));
export const ramp = (t, a, b) => sm((t - a) / (b - a));
export const pop = u => (u <= 0 ? 0.0001 : Math.max(0.0001, easeOutBack(cl(u))));
export const C = c => new THREE.Color(c);
export const hash2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
export const countUp = (u, n) => Math.round(cl(u) * n);
export const glowK = (t, f) => 0.5 + 0.5 * Math.sin(t * f * 6.2832);
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
export const piece = (keys, t) => {           /* 1-D smooth track: keys [[t, v], ...] */
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1]; return a[1] + (b[1] - a[1]) * sm((t - a[0]) / (b[0] - a[0]));
};

/* ========================================================================== table map */
const LKX = 15.4, LKZ = 18, LON0 = 35.0, LAT0 = 31.5;
export const ll = (lat, lon) => [(lon - LON0) * LKX, -(lat - LAT0) * LKZ];
const { rows: R, cols: NC, h: HD, latMin, latMax, lonMin, lonMax } = LAND;
function hmRaw(x, z) {
  const lon = LON0 + x / LKX, lat = LAT0 - z / LKZ;
  let fc = (lon - lonMin) / (lonMax - lonMin) * (NC - 1), fr = (latMax - lat) / (latMax - latMin) * (R - 1);
  if (fc < 0) return 0;
  fc = Math.min(NC - 1.001, fc); fr = Math.max(0, Math.min(R - 1.001, fr));
  const c0 = Math.floor(fc), r0 = Math.floor(fr), fx = fc - c0, fy = fr - r0;
  const a = HD[r0 * NC + c0], b = HD[r0 * NC + c0 + 1], c = HD[(r0 + 1) * NC + c0], d = HD[(r0 + 1) * NC + c0 + 1];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}
const hm = (x, z) => 0.4 * hmRaw(x, z) + 0.15 * (hmRaw(x + 0.4, z) + hmRaw(x - 0.4, z) + hmRaw(x, z + 0.4) + hmRaw(x, z - 0.4));
const ellipse = (x, z, cx, cz, ax, az) => { const q = Math.hypot((x - cx) / ax, (z - cz) / az); return 1 - sm((q - 0.8) / 0.4); };
const RIVER = [[33.15, 35.62], [32.95, 35.63], [32.86, 35.60], [32.70, 35.57], [32.45, 35.56], [32.15, 35.54], [31.95, 35.54], [31.80, 35.51]].map(p => ll(p[0], p[1]));
const KIN = [...ll(32.82, 35.58), 1.7, 3.0], DEAD = [...ll(31.5, 35.47), 1.6, 5.6];
function lakeMask(x, z) {
  let m = Math.max(ellipse(x, z, KIN[0], KIN[1], KIN[2], KIN[3]), ellipse(x, z, DEAD[0], DEAD[1], DEAD[2], DEAD[3]));
  let dmin = 9;
  for (let i = 0; i < RIVER.length - 1; i++) {
    const [ax, az] = RIVER[i], [bx, bz] = RIVER[i + 1], dx = bx - ax, dz = bz - az;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    dmin = Math.min(dmin, Math.hypot(x - ax - u * dx, z - az - u * dz));
  }
  return Math.max(m, 1 - sm((dmin - 0.15) / 0.2));
}
export function mapY(x, z) {
  const m = hm(x, z), s = 1 - cl(m / 4);
  const land = Math.min(4.3, 0.14 + 2.3 * Math.pow(Math.max(0, m) / 1000, 0.85));
  let y = land * (1 - s) + (-0.45) * s;
  const lk = lakeMask(x, z);
  return y * (1 - lk) + 0.1 * lk;
}
function landFrac(x, z, r) {
  let n = 0; for (let k = 0; k < 10; k++) { const a = k * 0.6283; if (hm(x + r * Math.cos(a), z + r * Math.sin(a)) > 4) n++; } return n / 10;
}

export function makeTable() {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.PlaneGeometry(300, 250).rotateX(-Math.PI / 2), lam('#6b4020', { map: woodTex(2, 14, 9) }));
  top.position.y = -1.55; top.receiveShadow = true; g.add(top);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000).rotateX(-Math.PI / 2), lam('#4b3a28')); floor.position.y = -40; g.add(floor);
  const pen = new THREE.Group();
  pen.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 15, 6).rotateZ(Math.PI / 2), phong('#e8a41c')));
  const pt = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 6).rotateZ(-Math.PI / 2), lam('#d9b98a')); pt.position.x = 8.3; pen.add(pt);
  pen.position.set(40, -1.0, 12); pen.rotation.y = 1.25; g.add(shadowable(pen));
  const comp = new THREE.Group();
  comp.add(new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.7, 28), phong('#c9a24a', { shininess: 80 })));
  const cf = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.74, 28), lam('#f2ead2')); cf.position.y = 0.02; comp.add(cf);
  const cn = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 4.6), lam('#b02a1c')); cn.position.y = 0.42; cn.rotation.y = 0.5; comp.add(cn);
  comp.position.set(-46, -1.1, -20); g.add(shadowable(comp));
  return g;
}

export function makeTableMap() {
  const grp = new THREE.Group();
  const X0 = -13, X1 = 18, ZN = -38, ZS = 38, ZSP = ll(31.25, 34.79)[1], STEP = 0.25;
  const DEEP = C('#2a679c'), SHAL = C('#7fd3f4'), SAND = C('#ecdca8'), WATER = C('#2f9ae8'), BROWN = C('#a17c4c'), SNOW = C('#efeadc'), TAN = C('#cdb47e');
  const GREENS = ['#78b848', '#68aa3c', '#8cc455', '#58983a', '#80bc4c', '#9cca5c'].map(C);
  const GOLDS = ['#eec35a', '#e2b048', '#f2d27a', '#d9a63e', '#ecc868', '#d6a64c'].map(C);
  const BEIGE = C('#cdbf90');
  const dryAt = z => sm((31.55 - (LAT0 - z / LKZ)) / 0.5);
  const mat = lam('#ffffff', { vertexColors: true, map: noiseTex(5, 8, 11) });
  const halves = [];
  const build = (z0, z1, north) => {
    const flags = [];
    const colour = (x, y, z, c) => {
      const m = hm(x, z), lk = lakeMask(x, z), lat = LAT0 - z / LKZ, lon = LON0 + x / LKX;
      if (m < 3 && lk < 0.5) {
        flags.push(0);
        c.copy(DEEP).lerp(SHAL, sm(landFrac(x, z, 2.6) * 2.4));
        return;
      }
      flags.push(lk < 0.5 ? 1 : 0);
      const d = dryAt(z), gi = Math.floor(hash2(Math.floor(x / 1.7), Math.floor(z / 1.7)) * 6);
      c.copy(GREENS[gi]).lerp(GOLDS[(gi + 2) % 6], d);
      c.multiplyScalar(0.9 + 0.2 * hash2(Math.floor(x / 1.7) * 3, Math.floor(z / 1.7) * 5));
      { const fx = x / 1.7 - Math.floor(x / 1.7), fz = z / 1.7 - Math.floor(z / 1.7); if (fx < 0.07 || fz < 0.07) c.multiplyScalar(0.82); }
      c.lerp(TAN, sm((lon - 35.6) / 0.14) * 0.4);
      c.lerp(BROWN, sm((y - 1.0) / 1.4) * 0.5);
      c.lerp(SNOW, sm((y - 3.6) / 0.5));
      const near = 1 - landFrac(x, z, 1.1);
      if (near > 0) c.lerp(SAND, Math.min(1, near * 1.4) * 0.85);
      if (lk > 0.35) c.lerp(WATER, sm((lk - 0.35) / 0.3));
    };
    const len = z1 - z0, nz = Math.round(len / STEP), nx = Math.round((X1 - X0) / STEP);
    const mesh = heightMesh(X0, X1, z0, z1, nx, nz, mapY, colour, mat);
    mesh.castShadow = true;
    const col = mesh.geometry.attributes.color, B = Float32Array.from(col.array), A = Float32Array.from(col.array);
    for (let i = 0; i < flags.length; i++) if (flags[i]) { A[i * 3] = B[i * 3] * 0.25 + BEIGE.r * 0.75; A[i * 3 + 1] = B[i * 3 + 1] * 0.25 + BEIGE.g * 0.75; A[i * 3 + 2] = B[i * 3 + 2] * 0.25 + BEIGE.b * 0.75; }
    const h = new THREE.Group(); h.add(mesh);
    const wt = waveTex(3, 4, len / 13);
    const waves = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, len).rotateX(-Math.PI / 2).translate((X0 + X1) / 2, 0.04, (z0 + z1) / 2),
      BASIC('#ffffff', { map: wt, transparent: true, depthWrite: false, opacity: 0.55 }));
    h.add(waves);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 1.2, len), lam('#5a4632')); slab.position.set((X0 + X1) / 2, -1.05, (z0 + z1) / 2); h.add(slab);
    const fr = lam('#4a2c18', { map: woodTex(6, 3, 1) });
    const bar = (cx, cz, sx, sz) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, 3.1, sz), fr); b.position.set(cx, 0.0, cz); b.castShadow = true; b.receiveShadow = true; h.add(b); };
    bar(X0 - 0.8, (z0 + z1) / 2, 1.6, len); bar(X1 + 0.8, (z0 + z1) / 2, 1.6, len);
    if (north) bar((X0 + X1) / 2, z0 - 0.8, X1 - X0 + 3.2, 1.6); else bar((X0 + X1) / 2, z1 + 0.8, X1 - X0 + 3.2, 1.6);
    /* trees (north and centre) or dry shrubs (south) */
    const r = rng(north ? 31 : 77), list = [];
    for (let k = 0; k < 4000 && list.length < (north ? 900 : 240); k++) {
      const x = X0 + r() * (X1 - X0), z = z0 + r() * len, m = hm(x, z), d = dryAt(z), lon = LON0 + x / LKX;
      if (m < 6 || lakeMask(x, z) > 0.1 || lon > 35.6) continue;
      const keep = north ? (1 - d) * (m < 900 ? 1 : 0.3) : (d > 0.6 ? 0.55 : 0);
      if (r() > keep) continue;
      list.push([x, mapY(x, z), z, 0.7 + r() * 0.6, r()]);
    }
    const gcol = north ? ['#3f7a34', '#58903c'] : ['#b8a05a', '#cdb36a'];
    const geo = north ? new THREE.ConeGeometry(0.42, 1.2, 6).translate(0, 0.55, 0) : new THREE.IcosahedronGeometry(0.4, 1).scale(1.2, 0.55, 1);
    const trees = new THREE.InstancedMesh(geo, lam('#ffffff'), list.length), d0 = new THREE.Object3D();
    list.forEach((p, i) => trees.setColorAt(i, C(gcol[p[4] < 0.5 ? 0 : 1]).multiplyScalar(0.85 + p[4] * 0.3)));
    trees.castShadow = true; trees.frustumCulled = false; h.add(trees);
    const applyTrees = u => {
      list.forEach((p, i) => { const k = cl(u * 1.5 - p[4] * 0.5); d0.position.set(p[0], p[1] + (north ? 0 : 0.1), p[2]); d0.rotation.set(0, p[4] * 6, 0); d0.scale.setScalar(Math.max(0.001, p[3] * k)); d0.updateMatrix(); trees.setMatrixAt(i, d0.matrix); });
      trees.instanceMatrix.needsUpdate = true;
    };
    applyTrees(1);
    const o = { grp: h, mesh, A, B, col, applyTrees };
    halves.push(o); grp.add(h);
    return o;
  };
  const N = build(ZN, ZSP, true), S = build(ZSP, ZS, false);
  let lastU = -1;
  return {
    grp, north: N.grp, south: S.grp, bs: [...ll(31.25, 34.79)], zsplit: ZSP, X0, X1, ZN, ZS,
    paint(u) {
      u = cl(u); if (Math.abs(u - lastU) < 1e-4) return; lastU = u;
      halves.forEach(h => { const a = h.col.array; for (let i = 0; i < a.length; i++) a[i] = h.A[i] + (h.B[i] - h.A[i]) * u; h.col.needsUpdate = true; h.applyTrees(u); });
    },
    slide(s) { N.grp.position.z = -s; S.grp.position.z = s; },
    at(lat, lon, lift) { const [x, z] = ll(lat, lon); return [x, mapY(x, z) + (lift || 0), z]; }
  };
}

/* ========================================================================== small props */
export function makePin(color) {
  const g = new THREE.Group();
  const nd = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.6, 6), phong('#d0d0d0', { shininess: 90 })); nd.position.y = 1.8; g.add(nd);
  const bl = new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 14), phong(color, { shininess: 80, specular: '#ffffff' })); bl.position.y = 3.7; g.add(bl);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 12), BASIC('#fff2a0', { transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.position.y = 3.7; g.add(halo);
  g.userData.k = 1;
  g.userData.pop = u => { g.scale.setScalar(pop(u) * g.userData.k); g.visible = u > 0; };
  g.userData.glow = k => { halo.material.opacity = 0.75 * cl(k); halo.scale.setScalar(1.0 + 0.7 * cl(k)); };
  return shadowable(g);
}

export function makeThickLine(pts, r, mat) {
  const g = new THREE.Group(), V = pts.map(p => new THREE.Vector3(...p)), segs = [], joints = [];
  let total = 0;
  for (let i = 0; i < V.length - 1; i++) {
    const d = V[i + 1].clone().sub(V[i]), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 10).translate(0, 0.5, 0), mat);
    m.position.copy(V[i]); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    segs.push({ m, len, start: total }); total += len; g.add(m);
  }
  for (const v of V) { const j = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat); j.position.copy(v); joints.push(j); g.add(j); }
  g.userData.setU = u => {
    const T = cl(u) * total;
    segs.forEach(s => { const f = cl((T - s.start) / s.len); s.m.visible = f > 0; s.m.scale.set(1, Math.max(1e-3, s.len * f), 1); });
    joints.forEach((j, i) => { j.visible = i === 0 ? u > 0 : (i - 1 < segs.length && T >= segs[i - 1].start + segs[i - 1].len - 1e-6); });
  };
  g.userData.setU(0);
  return g;
}

export function makeArrow(len, r, mat) {
  const g = new THREE.Group();
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12).translate(0, len / 2, 0), mat);
  const hd = new THREE.Mesh(new THREE.ConeGeometry(r * 2.2, r * 4, 14).translate(0, len + r * 2, 0), mat);
  g.add(sh, hd); g.userData.pop = u => { g.scale.setScalar(pop(u)); g.visible = u > 0; };
  return shadowable(g);
}

export function makeCloud(o) {
  o = o || {};
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#4a4a4a', transparent: true, opacity: 1 });
  const S = [[-3.2, 0, 0, 1.5], [-1.4, 0.7, 0.3, 2.0], [0.8, 1.0, 0, 2.3], [2.9, 0.4, 0.2, 1.7], [4.3, -0.1, 0, 1.2], [0.2, 0.2, 1.1, 1.8], [-1.0, 0.1, -1.0, 1.7], [2.0, 0.2, -1.0, 1.6]];
  S.forEach(([x, y, z, r]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat); m.position.set(x - 0.6, y, z); m.scale.set(1, 0.78, 1); g.add(m); });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.5, 20).scale(1, 1, 0.55), mat); base.position.set(0.3, -1.1, 0); g.add(base);
  g.scale.setScalar(o.scale || 1);
  g.userData.setTone = u => { mat.color.set('#ffffff').lerp(C('#7c8896'), cl(u)); mat.emissive.set('#4a4a4a').lerp(C('#1c222a'), cl(u)); };
  g.userData.setOpacity = a => { mat.opacity = a; g.visible = a > 0.01; };
  return shadowable(g);
}

/* rain streaks, thinned by intensity. spawn(tb, i, k) -> {x, y, z, p (0..1 probability), vx, vz} ; surf(x, z) -> ground y */
export function makeRain(n, period, fall, spawn, surf) {
  const geo = new THREE.CylinderGeometry(0.09, 0.09, 1.6, 4);
  const mesh = new THREE.InstancedMesh(geo, BASIC('#8fd3ff', { transparent: true, opacity: 0.9 }), n);
  mesh.frustumCulled = false;
  const d = new THREE.Object3D(), ph = Array.from({ length: n }, (_, i) => hash2(i, 3.3) * period);
  const hide = i => { d.scale.set(0, 0, 0); d.position.set(0, -999, 0); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); };
  mesh.userData.update = t => {
    for (let i = 0; i < n; i++) {
      const k = Math.floor((t - ph[i]) / period), tb = ph[i] + k * period, age = t - tb;
      if (k < 0 || age < 0) { hide(i); continue; }
      const s = spawn(tb, i, k);
      if (!s || hash2(i, k * 1.7) > s.p) { hide(i); continue; }
      const x = s.x + (s.vx || 0) * age, z = s.z + (s.vz || 0) * age, y = s.y - fall * age, gy = surf(x, z);
      if (y < gy) { hide(i); continue; }
      d.position.set(x, y, z); d.scale.set(1, 0.9 + 0.5 * hash2(i, 9), 1); d.rotation.set(0, 0, (s.vx || 0) * 0.04); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  return mesh;
}

export function makeTube(h, r) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28, 1, true).translate(0, h / 2, 0),
    new THREE.MeshPhongMaterial({ color: '#d4eef8', transparent: true, opacity: 0.26, shininess: 120, specular: '#ffffff', side: THREE.DoubleSide, depthWrite: false }));
  glass.renderOrder = 3; g.add(glass);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.93, r * 0.93, 1, 28).translate(0, 0.5, 0),
    new THREE.MeshLambertMaterial({ color: '#4fb0ee', emissive: '#0c3a5c', transparent: true, opacity: 0.92 }));
  water.position.y = 0.2; water.scale.y = 0.001; g.add(water);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.15, r * 1.25, 0.4, 28), lam('#8a6a40')); base.position.y = 0.2; g.add(base);
  for (let k = 1; k <= 4; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(r * 1.01, 0.06, 6, 28).rotateX(Math.PI / 2), BASIC('#5b6f7a')); t.position.y = k * h / 5; g.add(t); }
  g.userData.setFill = f => { water.scale.y = Math.max(0.001, cl(f) * (h - 0.4)); water.visible = f > 0.002; };
  g.userData.grow = u => { g.scale.set(1, Math.max(0.001, pop(u)), 1); g.visible = u > 0; };
  g.userData.top = f => 0.2 + cl(f) * (h - 0.4);
  return g;
}

export function makeBook() {
  const g = new THREE.Group();
  const cover = lam('#8a2f2a'), page = lam('#f6efdb', { emissive: '#7a7050' }), edge = lam('#d9cfb2');
  const halves = [1, -1].map(s => {
    const p = new THREE.Group();
    const c = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.16, 5.8), cover); c.position.set(-s * 2.15, 0, 0);
    const pg = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.36, 5.3), page); pg.position.set(-s * 2.15, 0.26, 0);
    const ed = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 5.3), edge); ed.position.set(-s * 4.07, 0.24, 0);
    for (let k = 0; k < 5; k++) { const ln = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.012, 0.06), lam('#b9ad90')); ln.position.set(-s * 2.2, 0.45, -1.8 + k * 0.9); p.add(ln); }
    p.add(c, pg, ed); g.add(p); return p;
  });
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 5.8), cover); spine.position.y = -0.02; g.add(spine);
  g.userData.setOpen = u => { halves[0].rotation.z = 0.22 * cl(u); halves[1].rotation.z = -0.22 * cl(u); };
  g.userData.setOpen(1);
  return shadowable(g);
}

export function makeSwirl() {
  const g = new THREE.Group(), mats = [];
  for (let s = 0; s < 3; s++) {
    const pts = []; for (let k = 0; k <= 60; k++) { const u = k / 60, a = u * 6.3 * 1.1 + s * 2.1, rr = 1.2 + 3.2 * u; pts.push(new THREE.Vector3(rr * Math.cos(a), 0.5 + u * 5, rr * Math.sin(a) * 0.6)); }
    const m = BASIC('#ffffff', { transparent: true, opacity: 0.5 }); mats.push(m);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.28 - s * 0.05, 8, false), m));
  }
  g.userData.set = (u, t) => { g.visible = u > 0; g.scale.set(1, Math.max(0.001, cl(u)), 1); g.rotation.y = t * 1.2; mats.forEach(m => { m.opacity = 0.5 * cl(u * 2); }); };
  return g;
}

/* ========================================================================== dressing */
export function plantTrees(list, colors) {
  const grp = new THREE.Group(), n = list.length, d = new THREE.Object3D();
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.2, 1.7, 6).translate(0, 0.85, 0), lam('#6e5a40'), n);
  const c1 = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.25, 1).scale(1, 0.85, 1).translate(0, 2.5, 0), lam('#ffffff'), n);
  const c2 = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.85, 1).translate(0.3, 3.4, 0.1), lam('#ffffff'), n);
  const apply = k => {
    list.forEach((p, i) => {
      const kk = typeof k === 'function' ? k(i) : (k == null ? 1 : k), s = p[3] * Math.max(0.001, kk);
      d.position.set(p[0], p[1], p[2]); d.rotation.set(0, p[4] * 6, 0); d.scale.setScalar(s); d.updateMatrix();
      trunk.setMatrixAt(i, d.matrix); c1.setMatrixAt(i, d.matrix); c2.setMatrixAt(i, d.matrix);
    });
    [trunk, c1, c2].forEach(m => { m.instanceMatrix.needsUpdate = true; });
  };
  list.forEach((p, i) => { const col = C(colors[Math.floor(p[4] * colors.length) % colors.length]).multiplyScalar(0.85 + hash2(i, 1) * 0.3); c1.setColorAt(i, col); c2.setColorAt(i, col.clone().multiplyScalar(1.08)); });
  [trunk, c1, c2].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; grp.add(m); });
  apply(1); grp.userData.apply = apply;
  return grp;
}

export function wheatField(x0, z0, w, d, hfn, n, seed) {
  const r = rng(seed), geo = new THREE.ConeGeometry(0.06, 1, 4).translate(0, 0.5, 0), pal = ['#d9a520', '#c9922a', '#e6b83a'].map(C);
  return inst(geo, lam('#ffffff'), n, (i, dd, col) => {
    const x = x0 + r() * w, z = z0 + r() * d, h = 0.7 + r() * 0.45;
    dd.position.set(x, hfn(x, z), z); dd.scale.set(1, h, 1); dd.rotation.set((r() - 0.5) * 0.25, 0, (r() - 0.5) * 0.25);
    return col.copy(pal[Math.floor(r() * 3)]).multiplyScalar(0.9 + r() * 0.2);
  });
}

export function stoneWall(len, h, rotY, mat) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(len, h, 0.9), ashMat('#e6d8b8', len, h)); b.position.y = h / 2; g.add(b);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(len + 0.1, 0.2, 1.1), lam('#cdbb95')); cap.position.y = h + 0.1; g.add(cap);
  g.rotation.y = rotY || 0; return shadowable(g);
}

export function makeBranch() {
  const g = new THREE.Group();
  const tr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-9, 4.3, 0), new THREE.Vector3(-7, 3.6, 0), new THREE.Vector3(-5.2, 3.7, 0.2), new THREE.Vector3(-3.4, 3.1, 0)]), 20, 0.09, 6, false), lam('#5d4630'));
  g.add(tr);
  [[-6.8, 3.2, 0.9], [-5.6, 3.2, 0.7], [-4.4, 3.4, 0.9], [-3.7, 2.7, 0.8], [-6.2, 4.0, 0.6], [-5.0, 4.1, 0.8]].forEach(([x, y, r], i) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r * 0.55, 1).scale(1.2, 0.8, 0.5), lam(i % 2 ? '#5c8a3a' : '#6fa046'));
    m.position.set(x, y, (i % 3) * 0.1); m.rotation.z = (i - 3) * 0.3; g.add(m);
  });
  g.position.set(0, 0, 0);
  return g;
}

/* ========================================================================== cut-away mountain (the main set) */
export function makeCutaway() {
  const grp = new THREE.Group();
  const D = 14, X0 = -30, X1 = 28, BOT = -8, step = 0.4;
  const prof = x => {
    let y;
    if (x < -18) y = -2.2 + 2.1 * sm((x - X0) / 12);
    else if (x <= 2) y = -0.1 + 0.9 * cl((x + 18) / 4) + 8.5 * sm((x + 14) / 16);
    else y = 9.3 - 8.4 * sm((x - 2) / 24);
    if (x > -17) y += (0.22 * Math.sin(x * 1.3) + 0.12 * Math.sin(x * 3.1)) * sm((x + 17) / 3) * (1 - 0.7 * sm((x - 2) / 6));
    return y;
  };
  const GR = ['#79ad52', '#6aa04a', '#86b85a', '#5f9a45'].map(C), GD = ['#ecca62', '#e4c050', '#f2d87c', '#dcb44a'].map(C), SANDC = C('#d8c58f'), DUST = C('#e6bf6c');
  const cover = (x, z, c) => {
    const gi = Math.floor(hash2(Math.floor(x / 1.3), Math.floor(z / 1.3)) * 4);
    if (x < -17.5) { c.copy(SANDC).lerp(C('#c9b57c'), hash2(x, z) * 0.4); return; }
    const e = sm((x - 0.5) / 2.5), f = sm((x - 6) / 5);
    c.copy(GR[gi]).lerp(GD[gi], e).lerp(DUST, f * 0.9);
    c.lerp(C('#a49a7a'), sm((prof(x) - 8.3) / 1.0) * 0.5);
  };
  const LAY = [[0, 0.5, null], [0.5, 0.58, '#3e2a18'], [0.58, 1.8, '#6a482a'], [1.8, 1.88, '#3e2a18'], [1.88, 3.6, '#b4814b'], [3.6, 3.68, '#3e2a18'],
    [3.68, 5.6, '#e6d7ae'], [5.6, 5.68, '#3e2a18'], [5.68, 7.2, '#c9a46c'], [7.2, 7.28, '#3e2a18'], [7.28, 99, '#8a7050']];
  const wmat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, map: noiseTex(11, 10, 3) });
  const nx = Math.round((X1 - X0) / step);
  LAY.forEach(([d0, d1, hex]) => {
    const pos = [], col = [], idx = [], c = new THREE.Color();
    for (let i = 0; i <= nx; i++) {
      const x = X0 + i * step, top = Math.max(BOT, prof(x) - d0), bot = Math.max(BOT, prof(x) - d1);
      pos.push(x, top, D / 2, x, bot, D / 2);
      const ek = sm((x - 2.5) / 3.5);
      if (hex) { c.set(hex); const pale = { '#3e2a18': '#b39656', '#6a482a': '#ecd088', '#b4814b': '#dcbc7c', '#e6d7ae': '#efe0b0' }[hex]; if (pale) c.lerp(C(pale), ek * (hex === '#b4814b' || hex === '#e6d7ae' ? 0.6 : 1)); } else { cover(x, D / 2, c); c.multiplyScalar(0.88 + 0.12 * ek); }
      if (hex === '#6a482a' || hex === '#b4814b' || hex === '#e6d7ae' || hex === '#c9a46c' || hex === '#8a7050') c.multiplyScalar(0.92 + 0.16 * hash2(x * 3.1, d0));
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
      if (i < nx) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(pos.filter((_, j) => j % 3 < 2).map((v, j) => v * 0.1), 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, wmat); m.castShadow = true; m.receiveShadow = true; grp.add(m);
  });
  /* back and sides in plain colour (never really seen) */
  const back = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 6, 0.2), lam('#6a482a')); back.position.set((X0 + X1) / 2, -5.3, -D / 2 - 0.1); grp.add(back);
  /* top surface */
  const topMat = lam('#ffffff', { vertexColors: true, map: noiseTex(13, 24, 3) });
  const surfH = (x, z) => prof(x) + 0.18 * Math.sin(x * 0.9 + z * 1.7) * (1 - Math.pow(Math.abs(z) / (D / 2), 2)) * (x > -17 ? 1 : 0);
  const top = heightMesh(X0, X1, -D / 2, D / 2, 145, 28, surfH, (x, y, z, c) => cover(x, z, c), topMat);
  top.castShadow = true; grp.add(top);
  /* sea */
  const seaW = -16.4 - X0;
  const sea = new THREE.Mesh(new THREE.BoxGeometry(seaW, 2.35, D + 0.1), new THREE.MeshLambertMaterial({ color: '#3d9ad6', transparent: true, opacity: 0.74, depthWrite: false }));
  sea.position.set(X0 + seaW / 2, -1.18, 0); sea.renderOrder = 2; grp.add(sea);
  const wt = waveTex(7, 3, 2);
  const wave = new THREE.Mesh(new THREE.PlaneGeometry(seaW, D + 0.1).rotateX(-Math.PI / 2), BASIC('#ffffff', { map: wt, transparent: true, depthWrite: false, opacity: 0.85 }));
  wave.position.set(X0 + seaW / 2, 0.03, 0); wave.renderOrder = 3; grp.add(wave);
  /* pebbles in the cut face */
  const r = rng(21);
  grp.add(rocks(150, 5, () => { const x = X0 + 2 + r() * (X1 - X0 - 4), dep = 0.9 + r() * 5.6; return [x, Math.max(BOT + 0.4, prof(x) - dep), D / 2 + 0.02]; }, '#cdb88c', 0.14, 0.42));
  /* ground the model stands on */
  const gd = new THREE.Mesh(new THREE.PlaneGeometry(400, 300).rotateX(-Math.PI / 2), lam('#8fb860', { map: noiseTex(15, 40, 30) }));
  gd.position.set(0, BOT - 0.02, 0); gd.receiveShadow = true; grp.add(gd);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 + 3, 0.5, D + 3), lam('#b5a07a', { map: noiseTex(17, 8, 2) })); rim.position.set((X0 + X1) / 2, BOT + 0.2, 0); rim.receiveShadow = true; grp.add(rim);
  const rg = rng(5);
  grp.add(rocks(70, 8, () => { const a = rg() * 6.28, rr = 1 + rg() * 1; const x = (rg() - 0.5) * 120, z = 10 + rg() * 20 * rr; return [x, BOT, z]; }, '#b9ae98', 0.3, 1.1));
  const gt = rng(9);
  grp.add(tufts(500, 4, () => [(gt() - 0.5) * 120, BOT, 9 + gt() * 40], ['#6f9d4a', '#86b257', '#9cc56a'], 0.5, 1.3));
  return { grp, prof, surfH, X0, X1, D, BOT, wt, wave };
}

/* ========================================================================== companion (Tipa) */
export function makeCompanion(cam, scene2) {
  const anchor = new THREE.Group(); anchor.matrixAutoUpdate = false; scene2.add(anchor);
  const holder = new THREE.Group(); anchor.add(holder);
  const tipa = makeTipa({ kind: 'tipa' });
  const inner = new THREE.Group(); inner.add(tipa.root); holder.add(inner);
  const puff = new THREE.Group();
  const pm = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#555555' });
  [[0, 0, 0, 1.15], [-1.2, -0.1, 0.1, 0.8], [1.2, -0.05, 0, 0.85], [-0.5, 0.1, 0.6, 0.8], [0.6, 0.0, 0.6, 0.7], [0, -0.1, -0.5, 0.9]].forEach(([x, y, z, r]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), pm); m.position.set(x, y, z); m.scale.y = 0.55; puff.add(m);
  });
  holder.add(puff);
  const DEPTH = 30, HH = DEPTH * Math.tan(18 * Math.PI / 180), HW = HH * 16 / 9;
  const EXPR = ['neutral', 'happy', 'curious', 'surprised', 'worried', 'cheering'];
  const look = side => [-0.5 * side, 0.1];
  const api = {
    tipa, holder,
    sync() { cam.updateMatrixWorld(); anchor.matrix.copy(cam.matrixWorld); anchor.matrixWorldNeedsUpdate = true; },
    async warm() { for (const side of [-1, 1]) for (const e of EXPR) await tipa.face.set({ expr: e, look: look(side), talk: null, blink: false }); },
    /* o: {side -1|1, xf (fraction of half width), size (fraction of frame height), expr, arms, t, hop (0..1), show (0..1)} */
    place(o) {
      const side = o.side || 1, size = o.size || 0.21, s = size * 2 * HH / 244, fy = -HH * 0.52;
      holder.visible = (o.show == null ? 1 : o.show) > 0.001;
      const k = o.show == null ? 1 : pop(o.show);
      holder.position.set(side * (o.xf || 0.7) * HW, fy, -DEPTH);
      holder.scale.setScalar(k);
      inner.scale.setScalar(s);
      const bob = 0.10 * Math.sin((o.t || 0) * 1.7);
      puff.position.set(0, bob - 0.12, 0); puff.scale.setScalar(1.0);
      inner.position.set(0, bob + 0.28, 0);
      const dx = -0.55 * side, dz = 0.83, yaw = Math.atan2(-dz, dx);
      tipa.pose({ t: o.t || 0, x: 0, y: 0, z: 0, yaw, walk: o.hop || 0, ph: (o.t || 0) * 1.6, arms: o.arms || 'down' });
      tipa.face.set({ expr: o.expr || 'neutral', look: look(side), talk: null, blink: false });
    }
  };
  return api;
}
