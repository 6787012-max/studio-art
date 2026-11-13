/* gz_kit - helpers for gezer_trip film_a (no people, no text). ASCII only.
   Hedge letters are built from elul_strokes.json (copied verbatim below, world [x, z]). */
import * as THREE from 'three';

export const LETTERS = [
  { id: 'L1', strokes: [[[8.4, -6.0], [13.2, 0.0]], [[12.9, -6.0], [12.0, -3.6]], [[9.6, -3.3], [8.7, 0.0]]] },
  { id: 'L2', strokes: [[[2.2, -8.4], [2.2, -6.0], [5.8, -6.0], [5.8, -3.3], [3.1, 0.0]]] },
  { id: 'L3', strokes: [[[-2.6, -6.0], [-1.4, -6.0], [-1.4, 0.0]]] },
  { id: 'L4', strokes: [[[-8.8, -8.4], [-8.8, -6.0], [-5.2, -6.0], [-5.2, -3.3], [-7.9, 0.0]]] }
];

export const HW = 1.0;                                        // hedge width
export const HH = 1.0;                                        // hedge height
export const CLEAR = { cx: 2.0, cz: -4.0, w: 30, d: 12 };     // light-soil clearing (x -13..17, z -10..2)
export const FIELD = { x0: -31, x1: 35, z0: -27, z1: 19 };    // vineyard field
export const ROW_GAP = 1.8, PLANT_GAP = 0.9;

export const clamp01 = u => Math.min(1, Math.max(0, u));
export const sm = u => { const x = clamp01(u); return x * x * (3 - 2 * x); };
export const lerp3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
export function easeOutBack(u) {
  const x = clamp01(u), c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/* gentle roll, max about 1.0 units; flat inside the clearing so the letters stand on level soil */
export function hf(x, z) {
  const base = 0.55 * Math.sin(x * 0.071 + 0.4) * Math.cos(z * 0.053)
             + 0.35 * Math.sin(z * 0.11 + x * 0.02 + 1.3)
             + 0.12 * Math.sin(x * 0.3 + z * 0.2);
  const dx = Math.max(Math.abs(x - CLEAR.cx) - CLEAR.w / 2, 0);
  const dz = Math.max(Math.abs(z - CLEAR.cz) - CLEAR.d / 2, 0);
  return base * sm(Math.hypot(dx, dz) / 5);
}

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* soil: white base with speckle and furrow lines (the colour comes from vertex colours) */
export function soilTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
  const r = rng(7);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(90,60,30,0.12)' : 'rgba(255,250,235,0.12)';
    g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2);
  }
  for (let y = 0; y < 256; y += 32) {
    g.strokeStyle = 'rgba(80,52,24,0.20)'; g.lineWidth = 5; g.beginPath();
    for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + 4 * Math.sin(x * 0.05 + y));
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(400 / 16, 400 / 16);
  return t;
}

/* clearing: faint raked lines */
export function rakeTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) {
    g.strokeStyle = 'rgba(120,90,50,0.13)'; g.lineWidth = 2; g.beginPath();
    for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + 2 * Math.sin(x * 0.03 + y * 0.1));
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2);
  return t;
}

/* shared ground: soil inside the vineyard field, grass strip at the edges, rolling height */
export function makeGround(mat) {
  const geo = new THREE.PlaneGeometry(420, 420, 170, 170).rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const soil = new THREE.Color('#b99766'), grass = new THREE.Color('#9cc56a'), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    p.setY(i, hf(x, z));
    const dx = Math.max(FIELD.x0 - x, x - FIELD.x1, 0), dz = Math.max(FIELD.z0 - z, z - FIELD.z1, 0);
    c.copy(soil).lerp(grass, sm(Math.hypot(dx, dz) / 4));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

/* conform a flat XZ geometry to the terrain, plus a small offset above it */
function conform(geo, off) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, hf(p.getX(i), p.getZ(i)) + off);
  geo.computeVertexNormals();
  return geo;
}

/* hedge: capsule 1.0 wide, 1.0 high, top lighter than sides, leafy bump */
function hedgeColours(geo, top, side) {
  const p = geo.attributes.position, n = geo.attributes.normal;
  const col = new Float32Array(p.count * 3);
  const ct = new THREE.Color(top), cs = new THREE.Color(side), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const px = p.getX(i), py = p.getY(i), pz = p.getZ(i);
    const nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i);
    const d = 0.035 * (Math.sin(px * 7.1 + pz * 3.3) + Math.sin(py * 11.7 + px * 2.1)) * 0.5;
    p.setXYZ(i, px + nx * d, py + ny * d, pz + nz * d);
    c.copy(cs).lerp(ct, sm((ny - 0.1) / 0.7));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

/* letters: each polyline segment = one rounded hedge. Groups keep origin on the soil; scale.y grows them. */
export function makeLetters(mat) {
  const root = new THREE.Group();
  const groups = [];
  for (const L of LETTERS) {
    const g = new THREE.Group();
    g.scale.y = 0.05;
    for (const s of L.strokes) {
      for (let i = 0; i < s.length - 1; i++) {
        const [x0, z0] = s[i], [x1, z1] = s[i + 1];
        const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
        const geo = hedgeColours(new THREE.CapsuleGeometry(HW / 2, Math.max(0.01, len - HW), 6, 12).rotateZ(Math.PI / 2),
                                 '#2f7d32', '#1f5a22');
        const m = new THREE.Mesh(geo, mat);
        m.position.set((x0 + x1) / 2, HH / 2, (z0 + z1) / 2);
        m.rotation.y = Math.atan2(-dz, dx);
        m.castShadow = true; m.receiveShadow = true;
        g.add(m);
      }
    }
    groups.push(g);
    root.add(g);
  }
  return { root, groups };
}

/* low stone border around the clearing */
export function makeBorder(mat) {
  const g = new THREE.Group();
  const cx = CLEAR.cx, cz = CLEAR.cz, hw = CLEAR.w / 2 + 0.25, hd = CLEAR.d / 2 + 0.25;
  const bars = [
    [cx, cz - hd, CLEAR.w + 0.5, 0.5], [cx, cz + hd, CLEAR.w + 0.5, 0.5],
    [cx - hw, cz, 0.5, CLEAR.d + 0.5], [cx + hw, cz, 0.5, CLEAR.d + 0.5]
  ];
  for (const [x, z, w, d] of bars) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.36, d), mat);
    b.position.set(x, 0.18, z);
    b.castShadow = true; b.receiveShadow = true;
    g.add(b);
  }
  return g;
}

/* vineyard: posts, one trellis wire per plant, three leafy lobes (two greens), grape clusters. All instanced. */
export function makeVines(M) {
  const root = new THREE.Group();
  const inClear = (x, z) => x > CLEAR.cx - CLEAR.w / 2 - 1.5 && x < CLEAR.cx + CLEAR.w / 2 + 1.5 &&
                            z > CLEAR.cz - CLEAR.d / 2 - 1.5 && z < CLEAR.cz + CLEAR.d / 2 + 1.5;
  const plants = [];
  for (let k = 0; FIELD.z0 + k * ROW_GAP <= FIELD.z1; k++) {
    const z = FIELD.z0 + k * ROW_GAP;
    for (let x = FIELD.x0; x <= FIELD.x1; x += PLANT_GAP) if (!inClear(x, z)) plants.push([x, z]);
  }
  const P = plants.length;
  const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.045, 1.1, 5).translate(0, 0.55, 0), M.post, P);
  const wire = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.025, 0.025), M.wire, P);
  const lA = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.30, 1), M.leafA, P * 2);
  const lB = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.30, 1), M.leafB, P);
  const grape = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.05, 1), M.grape, P * 2);
  const d = new THREE.Object3D();
  const put = (mesh, idx, x, y, z, sx, sy, sz) => {
    d.position.set(x, y, z); d.rotation.set(0, 0, 0); d.scale.set(sx, sy, sz);
    d.updateMatrix(); mesh.setMatrixAt(idx, d.matrix);
  };
  let nA = 0, nB = 0, nG = 0;
  plants.forEach(([x, z], i) => {
    const j = Math.sin(x * 3.1 + z * 5.3) * 0.08, b = hf(x, z);
    put(post, i, x, b, z, 1, 1, 1);
    put(wire, i, x + 0.45, b + 1.0, z, 0.92, 1, 1);
    put(lA, nA++, x - 0.12 + j, b + 0.85, z + 0.08, 1, 0.8, 0.9);
    put(lA, nA++, x + 0.25, b + 0.95, z - 0.1, 0.95, 0.8, 0.9);
    put(lB, nB++, x + 0.07 - j, b + 0.62, z - 0.05, 1, 0.8, 0.95);
    if (i % 5 < 2) {
      put(grape, nG++, x + 0.3, b + 0.55, z + 0.25, 1, 1, 1);
      put(grape, nG++, x + 0.37, b + 0.5, z + 0.3, 1, 1, 1);
    }
  });
  for (const [m, n] of [[post, P], [wire, P], [lA, nA], [lB, nB], [grape, nG]]) {
    m.count = n; m.instanceMatrix.needsUpdate = true;
    m.castShadow = true; m.receiveShadow = true;
  }
  root.add(post, wire, lA, lB, grape);
  return root;
}

export function makeOlive(trunkMat, crownMat) {
  const g = new THREE.Group();
  const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.35, 0.9, 0.15),
               new THREE.Vector3(-0.3, 1.8, -0.1), new THREE.Vector3(0.25, 2.6, 0.2)];
  const tr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.24, 7, false), trunkMat);
  const pts2 = pts.map(p => p.clone().add(new THREE.Vector3(0.14, 0, -0.1)));
  const tr2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 24, 0.15, 6, false), trunkMat);
  tr.castShadow = true; tr2.castShadow = true;
  g.add(tr, tr2);
  [[0.2, 3.2, 0.1, 1.25], [-0.6, 3.0, 0.3, 0.95], [0.5, 3.6, -0.4, 0.9], [-0.1, 3.9, -0.2, 0.85]].forEach(([x, y, z, r]) => {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), crownMat);
    c.position.set(x, y, z); c.scale.set(1, 0.8, 1); c.castShadow = true; c.receiveShadow = true;
    g.add(c);
  });
  return g;
}

/* stone terrace wall on the north side, segments follow the ground */
export function makeTerrace(stone, shade) {
  const g = new THREE.Group();
  for (let s = -30; s < 30; s += 12) {
    const xc = s + 6, yb = hf(xc, -40) - 0.25;
    const b = new THREE.Mesh(new THREE.BoxGeometry(12, 2.2, 1.2), stone);
    b.position.set(xc, yb + 1.1, -40); b.castShadow = true; b.receiveShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.3, 1.5), shade);
    cap.position.set(xc, yb + 2.35, -40); cap.castShadow = true;
    g.add(b, cap);
  }
  return g;
}

/* one small farm building with a red tiled roof, and a wooden gate on the east edge of the field */
export function makeFarm(wall, roof, wood) {
  const g = new THREE.Group();
  const yb = hf(44, -14);
  const b = new THREE.Mesh(new THREE.BoxGeometry(6, 3.2, 5), wall);
  b.position.set(44, yb + 1.6, -14); b.castShadow = true; b.receiveShadow = true;
  const r = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.4, 2.2, 4, 1).rotateY(Math.PI / 4), roof);
  r.position.set(44, yb + 4.3, -14); r.castShadow = true;
  g.add(b, r);
  const gy = hf(35.8, -5.5);
  [-8.2, -2.8].forEach(z => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.0, 0.25), wood);
    p.position.set(35.8, gy + 1.0, z); p.castShadow = true; g.add(p);
  });
  [0.8, 1.5].forEach(y => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 5.2), wood);
    rail.position.set(35.8, gy + y, -5.5); rail.castShadow = true; g.add(rail);
  });
  return g;
}

/* nine wooden crates stacked near the farm */
export function makeCrates(mat) {
  const g = new THREE.Group();
  const spots = [[38.6, -11.2, 0], [38.6, -9.8, 0], [40.1, -11.2, 0], [40.1, -9.8, 0], [38.6, -11.2, 1],
                 [38.6, -9.8, 1], [40.1, -11.2, 1], [41.6, -10.5, 0], [41.6, -10.5, 1]];
  for (const [x, z, lvl] of spots) {
    const y = hf(x, z) + 0.45 + lvl * 0.9;
    const c = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), mat);
    c.position.set(x, y, z); c.rotation.y = lvl * 0.08;
    c.castShadow = true; c.receiveShadow = true;
    g.add(c);
  }
  return g;
}

/* dirt track along the south edge with two tyre lines (terrain-conformed) */
export function makeTrack(trackMat, tyreMat) {
  const g = new THREE.Group();
  const tr = new THREE.Mesh(conform(new THREE.PlaneGeometry(90, 3, 60, 1).rotateX(-Math.PI / 2).translate(0, 0, 22.5), 0.05), trackMat);
  tr.receiveShadow = true;
  g.add(tr);
  [-0.8, 0.8].forEach(o => {
    const t = new THREE.Mesh(conform(new THREE.PlaneGeometry(90, 0.45, 60, 1).rotateX(-Math.PI / 2).translate(0, 0, 22.5 + o), 0.07), tyreMat);
    t.receiveShadow = true;
    g.add(t);
  });
  return g;
}

/* far hills in three value steps: nearest darkest and greenest, farthest palest and bluest */
export function makeHills(matNear, matMid, matFar) {
  const g = new THREE.Group();
  const layers = [[-330, 60, 190, 48, matFar, 6], [-240, 50, 160, 36, matMid, 5], [-170, 40, 130, 26, matNear, 5]];
  for (const [z, sz, sx, sy, mat, n] of layers) {
    for (let i = 0; i < n; i++) {
      const h = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10), mat);
      h.scale.set(sx * (0.8 + 0.25 * ((i * 37) % 5) / 4), sy * (0.8 + 0.3 * ((i * 53) % 4) / 3), sz);
      h.position.set(-300 + i * 120 + ((i * 17) % 7) * 6, 0, z + ((i * 11) % 5) * 4);
      g.add(h);
    }
  }
  return g;
}

/* small white clouds, high and far to the north */
export function makeClouds(mat) {
  const g = new THREE.Group();
  [[-120, 66, -250], [60, 74, -290], [190, 60, -230]].forEach(([x, y, z], i) => {
    for (let k = 0; k < 5; k++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(5 + (k % 2) * 2.5, 10, 8), mat);
      p.position.set(x + (k - 2) * 7, y + Math.sin(k * 2.1 + i) * 2, z + (k % 3) * 4);
      p.scale.set(1.6, 0.6, 1);
      g.add(p);
    }
  });
  return g;
}

/* vertical sky gradient on a big inside-out sphere (no fog, no depth write) */
export function makeSkyDome(top, horizon) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTop: { value: new THREE.Color(top) }, uHor: { value: new THREE.Color(horizon) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uTop; uniform vec3 uHor; varying vec3 vP; void main(){ float h = normalize(vP).y; float t = smoothstep(0.0, 0.5, h); gl_FragColor = vec4(mix(uHor, uTop, t), 1.0); }',
    side: THREE.BackSide, depthWrite: false
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(2500, 32, 16), mat);
  m.renderOrder = -1; m.frustumCulled = false;
  return m;
}
