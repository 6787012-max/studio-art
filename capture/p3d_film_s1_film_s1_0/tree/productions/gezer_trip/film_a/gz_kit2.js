/* gz_kit2 - helpers for gezer_trip film_a shots s0, s1, s2, s4, s5. No people, no text, no animals. ASCII only. */
import * as THREE from 'three';
import { sm, easeOutBack } from './gz_kit.js';

export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export const shadowable = g => { g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; };

/* height-field mesh with vertex colours; colour(x, y, z, colorOut) */
export function heightMesh(x0, x1, z0, z1, nx, nz, hfn, colour, mat) {
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz)
    .rotateX(-Math.PI / 2).translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = hfn(x, z);
    p.setY(i, y);
    colour(x, y, z, c);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

/* polyline -> flat strip (route ribbon). setU(u) reveals the first part of the route. */
export function ribbon(pts, width, mat) {
  const n = pts.length, v = [], up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < n - 1; i++) {
    const a = new THREE.Vector3(...pts[i]), b = new THREE.Vector3(...pts[i + 1]);
    const t = b.clone().sub(a).normalize();
    const s = new THREE.Vector3().crossVectors(t, up).normalize().multiplyScalar(width / 2);
    const A = a.clone().sub(s), B = a.clone().add(s), C = b.clone().sub(s), D = b.clone().add(s);
    v.push(A.x, A.y, A.z, B.x, B.y, B.z, C.x, C.y, C.z, B.x, B.y, B.z, D.x, D.y, D.z, C.x, C.y, C.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  geo.computeVertexNormals();
  geo.setDrawRange(0, 0);
  mat.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.userData.setU = u => {
    const k = Math.max(0, Math.min(n - 1, Math.round(u * (n - 1))));
    geo.setDrawRange(0, k * 6);
  };
  return mesh;
}

/* sample a piecewise-linear polyline of waypoints into n points; hfn lifts them onto the ground */
export function sampleWP(wps, n, hfn, lift) {
  const out = [];
  const segs = wps.length - 1;
  for (let i = 0; i < n; i++) {
    const f = (i / (n - 1)) * segs;
    const k = Math.min(segs - 1, Math.floor(f)), u = f - k;
    const x = wps[k][0] + (wps[k + 1][0] - wps[k][0]) * u;
    const z = wps[k][1] + (wps[k + 1][1] - wps[k][1]) * u;
    out.push([x, hfn(x, z) + lift, z]);
  }
  return out;
}

export function pathAt(pts, u) {
  const f = Math.max(0, Math.min(1, u)) * (pts.length - 1);
  const k = Math.min(pts.length - 2, Math.floor(f)), r = f - k;
  return [0, 1, 2].map(j => pts[k][j] + (pts[k + 1][j] - pts[k][j]) * r);
}

/* pin: head and point, tip on the ground. pop(u) scales it in. */
export function makePin(mat) {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), mat); head.position.y = 1.8;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 10), mat); tip.rotation.x = Math.PI; tip.position.y = 0.6;
  g.add(head, tip);
  g.userData.pop = u => { const s = Math.max(0.001, easeOutBack(u)); g.scale.setScalar(s); g.visible = u > 0; };
  return shadowable(g);
}

/* small bus, base on the ground, long axis along +x */
export function makeBus(M) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.1), M.bus); body.position.y = 0.95;
  const win = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.42, 1.12), M.win); win.position.y = 1.25;
  g.add(body, win);
  for (const [x, z] of [[0.7, 0.6], [0.7, -0.6], [-0.7, 0.6], [-0.7, -0.6]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 12), M.tyre);
    w.rotation.x = Math.PI / 2; w.position.set(x, 0.3, z); g.add(w);
  }
  return shadowable(g);
}

/* dust puff: setU(u) grows and fades; invisible outside 0..1 */
export function makePuff(colour) {
  const mat = new THREE.MeshLambertMaterial({ color: colour, transparent: true, opacity: 0, depthWrite: false });
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat);
  m.visible = false;
  m.userData.setU = u => {
    if (u <= 0 || u >= 1) { m.visible = false; return; }
    m.visible = true; m.scale.setScalar(0.3 + 1.6 * u); m.material.opacity = 0.55 * (1 - u);
  };
  return m;
}

/* rounded rock; the jitter is a function of position so seams match */
export function makeRock(mat, sx, sy, sz, seed) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + 0.16 * Math.sin(x * 5.1 + y * 3.7 + seed) * Math.cos(z * 4.3 + seed);
    p.setXYZ(i, x * k, y * k, z * k);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.scale.set(sx, sy, sz);
  m.position.y = sy * 0.3;
  return shadowable(m);
}

/* ring wall on the ground (y0), gap at segment gi, towers at the indices in towers */
export function wallRing(cx, y0, cz, r, h, segs, gi, towers, stone) {
  const g = new THREE.Group();
  const L = 2 * Math.PI * r / segs + 0.2;
  for (let i = 0; i < segs; i++) {
    if (i === gi) continue;
    const a = i * 2 * Math.PI / segs;
    const x = cx + r * Math.cos(a), z = cz + r * Math.sin(a);
    const w = new THREE.Mesh(new THREE.BoxGeometry(L, h, 0.9), stone);
    w.position.set(x, y0 + h / 2, z); w.rotation.y = -(a + Math.PI / 2);
    g.add(w);
    if (towers.includes(i)) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, h + 1.2, 10), stone);
      t.position.set(x, y0 + (h + 1.2) / 2, z);
      g.add(t);
    }
  }
  return shadowable(g);
}

/* cart on two wheels, no animal; base on the ground */
export function makeCart(M) {
  const g = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.0), M.wood); bed.position.y = 0.9;
  g.add(bed);
  for (const z of [0.6, -0.6]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 12), M.wood);
    w.rotation.x = Math.PI / 2; w.position.set(0, 0.5, z); g.add(w);
  }
  return shadowable(g);
}

/* soft white cloud (cluster of spheres) */
export function makeCloudCluster(mat, scale) {
  const g = new THREE.Group();
  for (let k = 0; k < 6; k++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(4 + (k % 2) * 2, 10, 8), mat);
    p.position.set((k - 2.5) * 4.2, Math.sin(k * 2.1) * 1.2, (k % 3 - 1) * 2.5);
    p.scale.set(1.5, 0.6, 1);
    g.add(p);
  }
  g.scale.setScalar(scale);
  return g;
}

/* sample a camera track: keys = [[t, pos, look], ...], smoothstep between keys */
export function track(lt, keys) {
  let i = 0;
  while (i < keys.length - 2 && lt > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1];
  const u = b[0] > a[0] ? sm((lt - a[0]) / (b[0] - a[0])) : 1;
  return {
    p: [0, 1, 2].map(j => a[1][j] + (b[1][j] - a[1][j]) * u),
    l: [0, 1, 2].map(j => a[2][j] + (b[2][j] - a[2][j]) * u)
  };
}
