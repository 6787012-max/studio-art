/* toldot07_kit - characters, water, sets and dressing for lesson 7 (the Mediterranean Sea and the coast of the Land of Israel).
   Approved method: toon3d (one shadow tone, inverted-hull ink outline) + the 2D face from sea2d.js drawn live on decals.
   Deterministic: no Math.random (seeded mulberry32 only); every animation is a pure function of t (update(t) / pose(po)).
   Units: the haredi man is ~300 tall; ground y = 0; characters face +x. Coast sets: sea toward -z (= WEST), land toward +z.
   Page must load (classic): ../elements2d/core.js, ../elements2d/animals.js, sea2d.js (+ people scripts if people are used).
   Full list of exports and parameters: README_kit07.md. */
import { mergeVertices } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import { THREE, toon, part, ell, tube, lathe, tubeAlong, leafGeo, bend, V, D2R, sm, cl, frac, kf, sphereDecal, faceRig, cfg, RoundedBoxGeometry, OL } from '../../lib/toon3d/toon3d.js';
const K = window.K, T7 = K.T7;

/* ======================================================================== utilities */
export function rng(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const M = (hex, tint, hi) => toon(hex, { tint: tint || '#b9b0c4', hi });
const RB = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 2, r == null ? Math.min(w, h, d) * 0.12 : r);
export const box = (parent, w, h, d, mat, pos, ow, rot, r) => part(parent, RB(w, h, d, r), mat, ow == null ? 2.4 : ow, pos, rot);
const G = (parent, pos) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); if (parent) parent.add(g); return g; };
const hexc = h => new THREE.Color(h);
export const SUN = new THREE.Vector3(0.35, 0.8, 0.45).normalize();     // world light for the water / map shaders

/* bumpy rock geometry (deterministic) */
export function rockGeo(rx, ry, rz, seed, amt) {
  const g = ell(rx, ry, rz, 20, 14), p = g.attributes.position, r = rng(seed || 1), a = amt == null ? 0.16 : amt;
  const f = [r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + a * Math.sin(x / rx * 2.3 + f[0]) * Math.sin(y / ry * 2.9 + f[1]) + a * 0.6 * Math.sin(z / rz * 3.1 + f[2]);
    p.setXYZ(i, x * k, Math.max(y * k, -ry * 0.35), z * k);
  }
  g.computeVertexNormals(); return g;
}
/* soft contact shadow (add under characters and props) */
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1a1430, transparent: true, opacity: 0.22, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
export function makeShadow(rx, rz) { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), shadowMat); m.scale.set(rx, 1, rz || rx); m.position.y = 0.8; m.renderOrder = 2; return m; }

/* ======================================================================== WATER: shared wave function (JS mirror of the GLSL) */
const WD = [[0.984, 0.177, 1.0, 0.55, 1.5, 0.0], [0.778, -0.628, 1.7, 0.30, 2.1, 1.3], [0.362, 0.932, 2.9, 0.15, 2.8, 2.1]];
/* sea state object o = {A (wave height), L (wavelength), T (time), C [x,z] fade centre, F fade radius, calm [cx,cz,hx,hz] or null, calmK} */
export function seaAmp(o, x, z) {
  let a = o.A * (1 - sm((Math.hypot(x - o.C[0], z - o.C[1]) - o.F * 0.5) / (o.F * 0.5)));
  if (o.calm) { const qx = Math.abs(x - o.calm[0]) - o.calm[2], qz = Math.abs(z - o.calm[1]) - o.calm[3];
    const d = Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0); a *= o.calmK + (1 - o.calmK) * sm((d + 60) / 140); }
  if (o.shore) a *= 1 - sm((z - (o.shore[0] - o.shore[1])) / o.shore[1]);
  return a;
}
export function seaHeight(o, x, z) {
  const k = 2 * Math.PI / o.L; let h = 0; const x0 = x; x += 60 * Math.sin(z * 0.0031 + 1.7); z += 60 * Math.sin(x0 * 0.0027 + 0.4);
  for (const [dx, dz, km, w, sp, ph] of WD) h += w * (2 * Math.pow(0.5 + 0.5 * Math.sin(k * km * (dx * x + dz * z) - sp * o.T + ph), 1.8) - 0.75);
  return seaAmp(o, x0, z - 60 * Math.sin(x0 * 0.0027 + 0.4)) * h;
}
/* float an object on the sea: returns {y, rx, rz} (pitch / roll from the slope) */
export function floatOn(o, x, z, len) {
  const e = len || 30, h = seaHeight(o, x, z);
  return { y: h, rz: Math.atan2(seaHeight(o, x + e, z) - seaHeight(o, x - e, z), 2 * e) * 0.8, rx: -Math.atan2(seaHeight(o, x, z + e) - seaHeight(o, x, z - e), 2 * e) * 0.8 };
}
const GL_WAVES = `
uniform float uT, uA, uL, uF, uCalmK; uniform vec2 uC; uniform vec4 uCalm; uniform vec2 uShore;
float wv(vec2 p){ float k = 6.2831853 / uL; float h = 0.0; p += vec2(60.0 * sin(p.y * 0.0031 + 1.7), 60.0 * sin(p.x * 0.0027 + 0.4));
  h += 0.55 * (2.0 * pow(0.5 + 0.5 * sin(k * 1.0 * dot(p, vec2(0.984, 0.177)) - 1.5 * uT + 0.0), 1.8) - 0.75);
  h += 0.30 * (2.0 * pow(0.5 + 0.5 * sin(k * 1.7 * dot(p, vec2(0.778, -0.628)) - 2.1 * uT + 1.3), 1.8) - 0.75);
  h += 0.15 * (2.0 * pow(0.5 + 0.5 * sin(k * 2.9 * dot(p, vec2(0.362, 0.932)) - 2.8 * uT + 2.1), 1.8) - 0.75);
  return h; }
float amp(vec2 p){ float a = uA * (1.0 - smoothstep(uF * 0.5, uF, length(p - uC)));
  if (uCalm.z > 0.0) { vec2 q = abs(p - uCalm.xy) - uCalm.zw; float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0); a *= mix(uCalmK, 1.0, smoothstep(-60.0, 80.0, d)); }
  if (uShore.y > 0.0) a *= 1.0 - smoothstep(uShore.x - uShore.y, uShore.x, p.y);
  return a; }
float H(vec2 p){ return amp(p) * wv(p); }`;
const seaVS = GL_WAVES + `
varying vec3 vN; varying float vH; varying float vA; varying vec2 vW; varying float vD;
void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vec2 p = w.xz; float h = H(p); float e = 6.0;
  vN = normalize(vec3(H(p - vec2(e, 0.0)) - H(p + vec2(e, 0.0)), 2.0 * e, H(p - vec2(0.0, e)) - H(p + vec2(0.0, e))));
  vH = h; vA = amp(p); vW = p; w.y += h; vD = length(w.xyz - cameraPosition);
  gl_Position = projectionMatrix * viewMatrix * w; }`;
const seaFS = `uniform vec3 uDeep, uMid, uLight, uFoam, uHorz, uSun; uniform float uFogN, uFogF, uT, uLines, uStorm;
varying vec3 vN; varying float vH; varying float vA; varying vec2 vW; varying float vD;
void main(){ vec3 n = normalize(vN); float hr = vH / max(vA, 0.5);
  vec3 c = mix(uMid, uLight, step(0.32, hr));
  if (hr < -0.35) c = uDeep;
  float lit = step(0.0, dot(n, uSun) - 0.62 - 0.08 * uStorm);
  c = mix(c * vec3(0.78, 0.82, 0.92), c, lit);
  float crest = smoothstep(0.80, 0.86, hr + 0.04 * sin(vW.x * 0.09 + vW.y * 0.05) - 0.12 * uStorm);
  c = mix(c, uFoam, crest * step(4.0, vA));
  float ln = sin(vW.x * 0.021 + 1.7 * sin(vW.y * 0.013 + uT * 0.4)) * sin(vW.y * 0.037 - uT * 0.3 + vW.x * 0.004);
  c = mix(c, uLight * 1.12, uLines * step(0.965, ln) * lit);
  c = mix(c, uMid, smoothstep(uFogN * 0.35, uFogN * 1.2, vD) * 0.75);
  float fog = smoothstep(uFogN, uFogF, vD);
  gl_FragColor = vec4(mix(c, uHorz, fog), 1.0); }`;
const SEA_PAL = {
  summer: { deep: '#2f7fc4', mid: '#3e9ad6', light: '#64c0ea', foam: '#ffffff', horz: '#bfe6f7' },
  winter: { deep: '#2b4f6e', mid: '#3a6787', light: '#5b88a3', foam: '#eef3f6', horz: '#9fb1bd' },
  sunset: { deep: '#2c5c95', mid: '#3e74ad', light: '#f0a46a', foam: '#fff2e0', horz: '#f6c48e' },
  harbour: { deep: '#2a7aa8', mid: '#3592bf', light: '#5bb6d8', foam: '#ffffff', horz: '#c4e7f5' },
};
/* sea material. o: {A, L, palette:'summer'|'winter'|'sunset'|'harbour' or {deep,mid,light,foam,horz}, fogN, fogF, lines, storm, F (fade radius), C} */
export function seaMaterial(o) {
  o = Object.assign({ A: 14, L: 420, palette: 'summer', fogN: 2200, fogF: 9000, lines: 1, storm: 0, F: 6000, C: [0, 0] }, o || {});
  const P = typeof o.palette === 'string' ? SEA_PAL[o.palette] : o.palette;
  const m = new THREE.ShaderMaterial({ vertexShader: seaVS, fragmentShader: seaFS, uniforms: {
    uT: { value: 0 }, uA: { value: o.A }, uL: { value: o.L }, uF: { value: o.F }, uC: { value: new THREE.Vector2(...o.C) }, uCalm: { value: new THREE.Vector4(0, 0, 0, 0) }, uCalmK: { value: 0.15 }, uShore: { value: new THREE.Vector2(...(o.shore || [0, 0])) },
    uDeep: { value: hexc(P.deep) }, uMid: { value: hexc(P.mid) }, uLight: { value: hexc(P.light) }, uFoam: { value: hexc(P.foam) }, uHorz: { value: hexc(P.horz) }, uSun: { value: SUN },
    uFogN: { value: o.fogN }, uFogF: { value: o.fogF }, uLines: { value: o.lines }, uStorm: { value: o.storm } } });
  m.userData.state = { A: o.A, L: o.L, T: 0, C: o.C.slice(), F: o.F, calm: null, calmK: 0.15, shore: o.shore || null };
  return m;
}
/* the sea surface: dense in the middle, sparse to the horizon (one mesh). Returns {mesh, mat, state, update(t, A?), height(x,z), float(x,z,len)} */
export function makeSea(o) {
  o = Object.assign({ size: 24000, seg: 220, k: 5 }, o || {});
  const g = new THREE.PlaneGeometry(2, 2, o.seg, o.seg).rotateX(-Math.PI / 2), p = g.attributes.position, S = o.size / 2, sk = Math.sinh(o.k);
  for (let i = 0; i < p.count; i++) p.setXYZ(i, S * Math.sinh(o.k * p.getX(i)) / sk, 0, S * Math.sinh(o.k * p.getZ(i)) / sk);
  const mat = seaMaterial(o), mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false;
  if (o.pos) mesh.position.set(...o.pos);
  const st = mat.userData.state;
  st.C = [mesh.position.x, mesh.position.z]; mat.uniforms.uC.value.set(...st.C);
  const sea = {
    mesh, mat, state: st,
    update(t, A) { st.T = t; mat.uniforms.uT.value = t; if (A != null) { st.A = A; mat.uniforms.uA.value = A; } },
    setCalm(cx, cz, hx, hz, k) { st.calm = [cx, cz, hx, hz]; st.calmK = k == null ? 0.15 : k; mat.uniforms.uCalm.value.set(cx, cz, hx, hz); mat.uniforms.uCalmK.value = st.calmK; },
    height: (x, z) => seaHeight(st, x, z) + mesh.position.y,
    float: (x, z, len) => { const f = floatOn(st, x, z, len); f.y += mesh.position.y; return f; },
  };
  return sea;
}

/* foam line on a beach: white scalloped ribbon along x at z0 that runs up and back. update(t, strength) */
export function makeFoamLine(o) {
  o = Object.assign({ len: 6000, z0: 0, y: 1.5, width: 90, speed: 0.55 }, o || {});
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
    uniforms: { uT: { value: 0 }, uS: { value: 1 }, uW: { value: o.width } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uT, uS, uW; varying vec2 vP;
      void main(){ float run = 0.5 + 0.5 * sin(uT * 1.1);
        float edge = uW * (0.25 + 0.6 * run * uS) + 10.0 * sin(vP.x * 0.035 + uT * 0.8) + 6.0 * sin(vP.x * 0.11 - uT);
        float z = vP.y + uW * 0.5;           // 0 at the sea side
        if (z > edge) discard;
        float band = step(edge - 9.0, z);
        vec2 q = vec2(vP.x * 0.06, z * 0.09 - uT * 0.6); vec2 f = fract(q) - 0.5; float hole = step(length(f), 0.18) * step(z, edge - 16.0) * step(0.5, fract(floor(q.x) * 0.37 + floor(q.y) * 0.61));
        vec3 c = mix(vec3(0.86, 0.95, 1.0), vec3(1.0), band);
        if (hole > 0.5) discard;
        gl_FragColor = vec4(mix(c, vec3(0.15, 0.11, 0.1), step(edge - 3.0, z) * 0.85), 0.92); }` });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(o.len, o.width * 1.6, 200, 4).rotateX(-Math.PI / 2), mat);
  m.position.set(0, o.y, o.z0); m.renderOrder = 3;
  return { mesh: m, update(t, s) { mat.uniforms.uT.value = t * o.speed * 2; if (s != null) mat.uniforms.uS.value = s; } };
}

/* cartoon curling wave crest (hero wave). update(t, size 0..1) */
export function makeCurlWave(o) {
  o = Object.assign({ w: 700, h: 180, col: '#3e9ad6', light: '#64c0ea' }, o || {});
  const root = G(), inner = G(root);
  const s = new THREE.Shape(); const H0 = o.h;
  s.moveTo(-H0 * 1.6, 0); s.bezierCurveTo(-H0 * 0.9, H0 * 0.1, -H0 * 0.5, H0 * 0.7, 0, H0); s.bezierCurveTo(H0 * 0.35, H0 * 1.08, H0 * 0.7, H0 * 0.86, H0 * 0.72, H0 * 0.62);
  s.bezierCurveTo(H0 * 0.55, H0 * 0.72, H0 * 0.35, H0 * 0.66, H0 * 0.32, H0 * 0.42); s.bezierCurveTo(H0 * 0.3, H0 * 0.2, H0 * 0.5, H0 * 0.05, H0 * 0.9, 0); s.lineTo(-H0 * 1.6, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: o.w, bevelEnabled: true, bevelThickness: 8, bevelSize: 6, bevelSegments: 3, curveSegments: 24 });
  g.translate(0, 0, -o.w / 2);
  const mat = toon(o.col, { tint: '#9aaed0', regions: [{ p: [-H0 * 0.4, H0 * 0.75, 0], r: [H0 * 0.7, H0 * 0.35, o.w], c: o.light, w: 0.05 }] });
  part(inner, g, mat, 4);
  const foam = M('#ffffff', '#cfd8ea', 0);
  const lip = [V(-H0 * 0.3, H0 * 0.86, 0), V(0.05 * H0, H0 * 1.04, 0), V(H0 * 0.45, H0 * 0.98, 0), V(H0 * 0.74, H0 * 0.66, 0)];
  for (let i = 0; i < 6; i++) { const z = -o.w / 2 + o.w * (i + 0.5) / 6; part(inner, tubeAlong(lip.map(v => V(v.x, v.y, z)), t => 22 * Math.sin(Math.PI * Math.min(1, t * 1.2)) + 4, { segs: 20 }), foam, 2.4); }
  for (let i = 0; i < 9; i++) part(inner, ell(14, 14, 14, 12, 8), foam, 2, [H0 * 0.78 + (i % 3) * 18, H0 * 0.5 - Math.floor(i / 3) * 16, -o.w / 2 + o.w * ((i * 0.37) % 1)]);
  root.userData.update = (t, size) => { const k = size == null ? 1 : size; inner.scale.set(1, Math.max(0.01, k), 1); inner.position.y = -6 + 3 * Math.sin(t * 2); inner.position.x = 8 * Math.sin(t * 1.3); };
  return root;
}

/* splash: ring + droplets. update(u 0..1) */
export function makeSplash(o) {
  o = Object.assign({ r: 60, col: '#86cff3', n: 9 }, o || {});
  const root = G(), mat = M(o.col, '#a8b6e6'), foam = M('#ffffff', '#cfd8ea', 0), drops = [];
  const ring = part(root, new THREE.TorusGeometry(o.r, o.r * 0.12, 10, 40).rotateX(Math.PI / 2), foam, 2);
  for (let i = 0; i < o.n; i++) { const d = new THREE.Group(); root.add(d); part(d, lathe([[0.01, 0], [8, 3], [11, 11], [8, 19], [0.01, 26]], 16), mat, 2); drops.push(d); }
  root.userData.update = u => {
    root.visible = u > 0 && u < 1;
    ring.scale.setScalar(0.3 + 1.4 * u); ring.position.y = 2;
    drops.forEach((d, i) => { const a = i / o.n * Math.PI * 2 + 0.3, sp = o.r * (1.2 + 0.4 * ((i * 7) % 3)), up = o.r * (2.2 + 0.6 * ((i * 5) % 3));
      d.position.set(Math.cos(a) * sp * u, up * 4 * u * (1 - u), Math.sin(a) * sp * u); d.scale.setScalar(1 - 0.6 * u); d.rotation.z = -Math.cos(a) * u; d.rotation.x = Math.sin(a) * u; });
  };
  return root;
}

/* rain: cartoon streaks inside a box, deterministic. update(t) */
export function makeRain(o) {
  o = Object.assign({ n: 260, w: 3000, d: 3000, h: 1400, seed: 7, col: '#cfe0ee' }, o || {});
  const r = rng(o.seed), mat = new THREE.MeshBasicMaterial({ color: o.col }), geo = tube(o.r || 3.2, (o.r || 3.2) * 0.7, 110, 6), root = G(), items = [];
  const im = new THREE.InstancedMesh(geo, mat, o.n); root.add(im);
  for (let i = 0; i < o.n; i++) items.push([r() * o.w - o.w / 2, r() * o.d - o.d / 2, r(), 0.8 + r() * 0.5]);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, 0, 0.18));
  root.userData.update = t => { items.forEach(([x, z, ph, sp], i) => { const y = o.h * (1 - frac(ph + t * sp * 1.4)); m4.compose(V(x + 0.18 * (o.h - y) * 0.3, y, z), q, V(1, 1, 1)); im.setMatrixAt(i, m4); }); im.instanceMatrix.needsUpdate = true; };
  return root;
}

/* glass bottle with a rolled letter inside, for floating. */
export function makeBottle() {
  const root = G(), body = G(root);
  const glass = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uC: { value: hexc('#7fd19a') } },
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 uC; varying vec3 vN; void main(){ float f = 1.0 - abs(vN.z); vec3 c = mix(uC, vec3(0.92, 1.0, 0.95), step(0.82, vN.y * 0.5 + vN.x * 0.5 + 0.5) * 0.7); gl_FragColor = vec4(c, 0.38 + 0.45 * f); }' });
  const prof = [[0.01, 0], [22, 0], [26, 6], [26, 70], [22, 84], [10, 96], [9, 122], [11, 126], [11, 130], [0.01, 130]];
  const gg = lathe(prof, 32); gg.rotateZ(-Math.PI / 2); gg.translate(-60, 0, 0);
  const m = new THREE.Mesh(gg, glass); m.renderOrder = 4; body.add(m);
  const hull = new THREE.Mesh(gg.clone(), new THREE.ShaderMaterial({ vertexShader: 'void main(){ vec3 p = position + normal * 2.2; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }', fragmentShader: `void main(){ gl_FragColor = vec4(${new THREE.Color(OL).toArray().map(v => v.toFixed(3)).join(',')}, 1.0); }`, side: THREE.BackSide }));
  body.add(hull);
  part(body, tube(9, 8.5, 18, 14).rotateZ(Math.PI / 2).translate(62, 0, 0), M('#b8834c', '#b08a7a'), 1.6);
  part(body, tube(13, 13, 64, 16).rotateZ(Math.PI / 2).translate(-56 + 64, 0, 0), M('#f3e7cc', '#d6cbb8', 0), 1.4, [-14, -2, 0]);
  part(body, tube(13.4, 13.4, 6, 16).rotateZ(Math.PI / 2), M('#c0392b', '#b08a9a', 0), 0, [-20, -2, 0]);
  root.userData.body = body;
  return root;
}

/* ======================================================================== CHARACTERS */
/* shared hopping / squash rig. c.root > c.bounce > c.sq (scale from the ground) > c.roll (pivot at rollY) > c.inner.
   po: {t, x, y, z, yaw, walk 0..1 (hop amount), ph (hop phase, drive from distance / c.cycle), hopH, squash, tilt (deg), roll (rad),
        float 0..1 (bob in water), arms ('down'|'up'|'wave'|'point'|'hips'), face {..} (face.set separately)} */
function hopRig(name, rollY, build, opt) {
  opt = opt || {};
  const c = { name, kind: 'hop' };
  c.root = G(); c.bounce = G(c.root); c.sq = G(c.bounce); c.roll = G(c.sq, [0, rollY, 0]); c.inner = G(c.roll, [0, -rollY, 0]);
  c.shadow = makeShadow(opt.shadow || 80, (opt.shadow || 80) * 0.8); c.root.add(c.shadow);
  build(c);
  c.cycle = opt.hopLen || 110;
  c.pose = po => {
    const t = po.t || 0, walk = po.walk || 0, hp = frac(po.ph || 0), H0 = po.hopH || opt.hopH || 60;
    let y = 0, sq = 0, tilt = po.tilt || 0;
    if (walk > 0.01) {
      if (hp < 0.18) sq = -0.14 * Math.sin(Math.PI * hp / 0.18);
      else if (hp < 0.82) { const u = (hp - 0.18) / 0.64; y = H0 * 4 * u * (1 - u); sq = 0.1 * Math.sin(Math.PI * u); tilt += -7 * Math.sin(Math.PI * 2 * u); }
      else sq = -0.2 * Math.sin(Math.PI * (hp - 0.82) / 0.18);
      y *= walk; sq *= walk;
    }
    if (po.float) { y += po.float * 5 * Math.sin(t * 2.3); tilt += po.float * 4 * Math.sin(t * 1.7); }
    sq += (po.squash || 0) + 0.014 * Math.sin(t * 2.2);
    c.root.position.set(po.x || 0, po.y || 0, po.z || 0); c.root.rotation.set(0, po.yaw || 0, 0);
    c.bounce.position.y = y; c.bounce.rotation.set(0, 0, -tilt * D2R);
    c.sq.scale.set(1 - sq * 0.5, 1 + sq, 1 - sq * 0.5);
    c.roll.rotation.set(po.rollX || 0, 0, -(po.roll || 0));
    c.shadow.visible = po.shadow !== false; const sc = 1 / (1 + y / 200); c.shadow.scale.set((opt.shadow || 80) * sc, 1, (opt.shadow || 80) * 0.8 * sc); c.shadow.position.y = 0.8 - (po.y || 0) * 0 ;
    if (c.extra) c.extra(po, { t, y, hp, walk });
  };
  c.warm = async list => { for (const st of list) await c.face.set(st); };
  return c;
}
// cubic bezier helper for the drop profile
const bez = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
const DROP_PROF = (() => { const D = T7.DROP, pts = [];
  for (let i = 0; i <= 26; i++) { const p = bez(D.bot, D.c4, D.c3, D.mid, i / 26); pts.push([p[0] - 150, 278 - p[1]]); }
  for (let i = 1; i <= 30; i++) { const p = bez(D.mid, D.c2, D.c1, D.tip, i / 30); pts.push([p[0] - 150, 278 - p[1]]); }
  return pts; })();
export function dropRadius(h) { const P = DROP_PROF; if (h <= 0) return 0; for (let i = 1; i < P.length; i++) if (h <= P[i][1]) { const a = P[i - 1], b = P[i], u = (h - a[1]) / Math.max(1e-6, b[1] - a[1]); return a[0] + (b[0] - a[0]) * u; } return 0; }
// re-seat a sphere decal on any surface of revolution r(h) (h = local y + cy)
function seatDecal(dec, rOf, cy, out) {
  const P = dec.mesh.geometry.attributes.position;
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), d = Math.hypot(x, z) || 1, r = rOf(y + cy) * (out || 1.015) + 0.6; P.setXYZ(i, x / d * r, y, z / d * r); }
  P.needsUpdate = true; dec.mesh.geometry.computeVertexNormals();
}
const ARM_ANG = { down: [20, 20], up: [150, 150], wave: [20, 140], point: [20, 0], hips: [60, 60] };

/* TIPA the water drop. v: {kind:'tipa'|'small'|'big'|'sea'|'foam'} -> same variants as the 2D sheet. Height ~244 * sc (tipa: 244). */
export function makeTipa(v) {
  v = Object.assign({}, T7.VAR[(v && v.kind) || 'tipa'], v || {});
  const c = hopRig('tipa', 93, c => {
    c.inner.scale.setScalar(v.sc);
    const mat = toon(v.col, { tint: v.tint, regions: [{ p: [70, 48, 0], r: [62, 46, 74], c: v.belly, w: 0.04 }] });
    c.mat = mat;
    c.body = part(c.inner, lathe(DROP_PROF, 56), mat, 3.4);
    const surf = (dx, yd, out) => { const h = 278 - yd, r = dropRadius(h) + (out || 0), zz = -(dx - 150); return V(Math.sqrt(Math.max(1, r * r - zz * zz)), h, zz); };
    const white = M('#ffffff', '#ffffff', 0);
    part(c.inner, tubeAlong([surf(92, 132, 1), surf(98, 104, 1), surf(112, 84, 1), surf(126, 72, 1)], 4.6, { segs: 24 }), white, 0);
    part(c.inner, ell(5.5, 5.5, 5.5, 12, 8), white, 0, surf(84, 152, 2).toArray());
    part(c.inner, tubeAlong([surf(212, 250, 1), surf(226, 232, 1), surf(232, 208, 1)], 2.2, { segs: 16 }), white, 0);
    if (v.salt) for (const [x, y] of [[96, 140], [206, 214], [108, 236], [190, 120], [80, 196]]) part(c.inner, new THREE.OctahedronGeometry(5, 0), white, 0, surf(x, y, 1).toArray());
    if (v.bubbles) for (const [x, y, r] of [[92, 150, 9], [206, 136, 7], [214, 232, 10], [84, 226, 6]]) { const p = surf(x, y, 1); const m = part(c.inner, new THREE.TorusGeometry(r, 1.6, 6, 18), M('#b7d4ea', '#b7d4ea', 0), 0, p.toArray()); m.lookAt(p.clone().multiplyScalar(2)); }
    if (v.kippa) { const pr = []; for (let h = 172; h <= 206; h += 3) pr.push([dropRadius(h) + 2.4, h]);
      const kg = new THREE.LatheGeometry(pr.map(p => new THREE.Vector2(p[0], p[1])), 28, Math.PI / 2 - 1.25, 2.5); part(c.inner, kg, M('#2a2f4a', '#9a9ab8'), 2.2); }
    // arms (shoulders on the sides = +-z) and feet
    c.arms = [1, -1].map(sz => { const b = G(c.inner, [6, 74, sz * (dropRadius(74) - 8)]);
      part(b, tube(10, 9, 30, 14), mat, 2.6); part(b, ell(12, 12, 12, 16, 12), mat, 2.6, [0, -36, 0]); b.userData.sz = sz; return b; });
    c.feet = [1, -1].map(sz => part(c.inner, ell(22, 10, 18, 20, 12), mat, 2.6, [14, 6, sz * 32]));
    const dec = sphereDecal(c.inner, [0, 93, 0], [95, 93, 95], { phi: 1.15, th0: 0.42, th1: 2.55, cx: 150, cy: 185, du: 1, cw: 768 });
    seatDecal(dec, dropRadius, 93);
    const L = Object.assign({}, T7.TIPA_L, { lid: v.lid, bw: v.bw || T7.TIPA_L.bw });
    if (v.eyeK) { L.e1 = Object.assign({}, L.e1, { rx: L.e1.rx * v.eyeK, ry: L.e1.ry * v.eyeK }); L.e2 = Object.assign({}, L.e2, { rx: L.e2.rx * v.eyeK, ry: L.e2.ry * v.eyeK }); }
    c.face = faceRig({ f: dec }, st => ({ f: T7.face(st, L) }));
  }, { shadow: 86 * v.sc, hopH: 70, hopLen: 120 * v.sc });
  c.height = 244 * v.sc;
  c.extra = (po, s) => {
    const mode = po.arms || 'down', A = ARM_ANG[mode] || ARM_ANG.down, t = s.t;
    c.arms.forEach((b, i) => {   // i 0 = +z (drawing left), 1 = -z (drawing right)
      let out = A[i] * D2R, fw = 0;
      if (mode === 'wave' && i === 1) out += 0.3 * Math.sin(t * 9);
      if (mode === 'up') out += 0.12 * Math.sin(t * 8 + i * 2);
      if (mode === 'point' && i === 1) { fw = 1.45; out = 0.35; }
      if (mode === 'down' && s.walk > 0.01) out += 0.5 * Math.sin(Math.PI * s.hp) * s.walk;
      b.rotation.set(-b.userData.sz * out, 0, fw);
    });
    c.feet.forEach(f => { f.visible = po.feet !== false; });
  };
  return c;
}

/* SAND GRAIN from the Nile (~170 tall) */
export const GRAIN_SHAPE = (() => { const r = rng(42); return Array.from({ length: 5 }, () => [r() * 6, r() * 6]); })();
export function makeGrain() {
  const c = hopRig('grain', 94, c => {
    const COL = '#e9c987', R = [82, 90, 80];
    const specks = [[40, 120, 60], [-30, 140, -50], [50, 60, -66], [-40, 50, 70], [60, 150, 20]].map(p => ({ p, r: [5, 5, 5], c: '#c79a58', w: 0 }));
    const mat = toon(COL, { tint: '#d1b4a4', regions: specks });
    const g = ell(...R, 48, 32), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (x < 30) { const k = 1 + 0.07 * Math.sin(y * 0.05 + GRAIN_SHAPE[0][0]) * Math.sin(z * 0.06 + GRAIN_SHAPE[1][1]) + 0.04 * Math.sin(x * 0.08 + GRAIN_SHAPE[2][0]); p.setXYZ(i, x * k, y * k, z * k); } }
    g.computeVertexNormals(); part(c.inner, g, mat, 3.2, [0, 94, 0]);
    part(c.inner, tubeAlong([V(40, 160, 52), V(56, 172, 30), V(66, 176, 6)], 4, { segs: 12 }), M('#fff3d0', '#fff3d0', 0), 0);
    const dec = sphereDecal(c.inner, [0, 94, 0], R, { phi: 1.1, th0: 0.35, th1: 2.4, cx: 152, cy: 176, du: 1, cw: 640 });
    c.face = faceRig({ f: dec }, st => ({ f: T7.face(st, Object.assign({ lid: COL }, T7.GRAIN_L)) }));
  }, { shadow: 76, hopH: 50, hopLen: 100 });
  c.height = 184;
  return c;
}

/* FISH (~200 long). po.swim 0..1 (tail beat), po.y = swim height */
const FISH3D_L = { e1: { x: 128, y: 136, rx: 16, ry: 20 }, e2: { x: 172, y: 136, rx: 16, ry: 20 }, mo: { x: 150, y: 178, w: 28, teeth: 5 }, bw: 6.5 };
export function makeFish(o) {
  o = Object.assign({ body: '#4f9fe0', belly: '#ffd45a', fin: '#f08a3c' }, o || {});
  const c = hopRig('fish', 0, c => {
    const mat = toon(o.body, { tint: '#aab0d8', regions: [{ below: -14, c: o.belly, w: 0.6 }, { p: [-36, 0, 0], r: [9, 90, 90], c: '#ffffff', w: 0 }] });
    const fin = M(o.fin, '#d4a8a0');
    part(c.inner, ell(84, 68, 54, 40, 28), mat, 3);
    part(c.inner, tubeAlong([V(-20, 2, 0), V(-70, 0, 0), V(-112, -2, 0)], t => 52 - 38 * t, { segs: 20, flat: 0.75, round: false }), mat, 3);
    c.tail = G(c.inner, [-112, 0, 0]);
    for (const s of [1, -1]) { const g = leafGeo(62, 26, 0.3); g.rotateZ(Math.PI / 2 + s * 0.55); part(c.tail, g, fin, 2.4); }
    const dg = leafGeo(56, 30, 0.25); dg.rotateZ(0.5); part(c.inner, dg, fin, 2.4, [-10, 58, 0]);
    c.fins = [1, -1].map(s => { const b = G(c.inner, [10, -24, s * 44]); const g = leafGeo(34, 16, 0.3); g.rotateX(s * 1.9); part(b, g, fin, 2); return b; });
    const dec = sphereDecal(c.inner, [0, 0, 0], [84, 68, 54], { phi: 1.05, th0: 0.6, th1: 2.4, cx: 150, cy: 150, du: 1, cw: 640 });
    c.face = faceRig({ f: dec }, st => ({ f: T7.face(st, Object.assign({ lid: o.body }, FISH3D_L)) }));
  }, { shadow: 1 });
  c.shadow.visible = false;
  c.extra = (po, s) => { const sw = po.swim == null ? 0.5 : po.swim; c.tail.rotation.y = (0.15 + 0.4 * sw) * Math.sin(s.t * (5 + 6 * sw)); c.inner.rotation.y = -0.06 * sw * Math.sin(s.t * (5 + 6 * sw));
    c.fins.forEach((f, i) => { f.rotation.x = (i ? -1 : 1) * 0.3 * Math.sin(s.t * 4 + i); }); c.shadow.visible = false; };
  return c;
}

/* SEAGULL (~160 tall standing). po.flap 0..1, po.fly (legs tucked), po.beak 0..1 */
const GULL3D_L = { e1: { x: 133, y: 140, rx: 13, ry: 17 }, e2: { x: 167, y: 140, rx: 13, ry: 17 }, mo: { x: 150, y: 196, w: 0.01, teeth: 0 }, bw: 6, browCol: '#5d6470' };
export function makeGull() {
  const c = hopRig('gull', 80, c => {
    const W = M('#fbfbf7', '#c3c3d6'), Gr = toon('#a9b4c2', { tint: '#b9b2cf', regions: [{ p: [0, 76, 0], r: [40, 22, 40], c: '#454b56', w: 0 }] }), Y = M('#f6c23a', '#d9b07a'), O = M('#ef8a3a', '#d4a8a0');
    c.body = part(c.inner, ell(62, 42, 40, 32, 24), W, 3, [0, 82, 0]); c.body.rotation.z = 0.18;
    part(c.inner, tubeAlong([V(-40, 86, 0), V(-80, 96, 0), V(-104, 104, 0)], t => 26 - 18 * t, { flat: 0.4, segs: 14 }), Gr, 2.4);
    c.neck = G(c.inner, [44, 104, 0]);
    part(c.neck, ell(34, 34, 32, 28, 20), W, 3, [8, 22, 0]);
    c.beakU = G(c.neck, [36, 20, 0]); c.beakL = G(c.neck, [34, 14, 0]);
    part(c.beakU, tubeAlong([V(0, 2, 0), V(18, 0, 0), V(34, -6, 0)], t => 9 - 6 * t, { segs: 12 }), Y, 2);
    part(c.beakL, tubeAlong([V(0, 0, 0), V(16, -2, 0), V(28, -4, 0)], t => 6 - 4 * t, { segs: 12 }), Y, 1.8);
    part(c.beakU, ell(2.6, 2.6, 2.6, 8, 6), M('#e2483a', '#e2483a', 0), 0, [26, -6, 0]);
    c.wings = [1, -1].map(s => { const b = G(c.inner, [26, 104, s * 30]); const g = leafGeo(96, 30, 0.28); g.rotateZ(Math.PI / 2 + 0.25); g.rotateX(s * -0.25); part(b, g, Gr, 2.4); b.userData.s = s; return b; });
    c.legs = [1, -1].map(s => { const b = G(c.inner, [4, 48, s * 14]); part(b, tube(4.4, 3.6, 46, 8), O, 1.8); part(b, ell(13, 3, 9, 12, 8), O, 1.6, [8, -46, 0]); return b; });
    const dec = sphereDecal(c.neck, [8, 22, 0], [34, 34, 32], { phi: 1.15, th0: 0.4, th1: 2.0, cx: 150, cy: 150, du: 1.0, cw: 512 });
    c.face = faceRig({ f: dec }, st => ({ f: T7.face(st, Object.assign({ lid: '#fbfbf7' }, GULL3D_L)) }));
  }, { shadow: 54, hopH: 30, hopLen: 70 });
  c.height = 165;
  c.extra = (po, s) => {
    const fl = po.flap || 0, t = s.t;
    c.wings.forEach(b => { b.rotation.set(-b.userData.s * (fl * (0.9 + 0.7 * Math.sin(t * 10))), 0, fl * 0.2); });
    c.legs.forEach(l => { l.visible = !po.fly; });
    const bk = po.beak != null ? po.beak : (po.face && po.face.talk ? 0.5 + 0.4 * Math.sin(t * 14) : 0);
    c.beakL.rotation.z = -0.5 * bk; c.neck.rotation.z = 0.08 * Math.sin(t * 1.6) + (po.headRot || 0) * D2R;
  };
  return c;
}

/* CRAB (~110 tall). po.arms 'down'|'up'; po.walk scuttles sideways (move along z) */
export function makeCrab() {
  const c = hopRig('crab', 44, c => {
    const R = toon('#e8573a', { tint: '#d9a7b0', regions: [{ p: [40, 30, 0], r: [30, 22, 60], c: '#f07a5c', w: 0.05 }] }), RD = M('#c13f2a', '#d9a7b0');
    part(c.inner, ell(58, 40, 84, 40, 28), R, 3.2, [0, 46, 0]);
    c.eyes = [1, -1].map(s => { const b = G(c.inner, [22, 70, s * 26]); part(b, tube(6, 5, 24, 10).rotateZ(Math.PI), R, 2); part(b, ell(19, 21, 19, 24, 18), R, 2.6, [0, 32, 0]); return b; });
    c.claws = [1, -1].map(s => { const sh = G(c.inner, [30, 46, s * 66]); const arm = G(sh);
      part(arm, tube(9, 8, 46, 10).rotateZ(Math.PI), R, 2.4);
      const cl = G(arm, [0, 54, 0]); part(cl, ell(26, 30, 18, 20, 14), R, 2.8, [0, 8, 0]); part(cl, ell(10, 20, 9, 12, 10), R, 2.2, [10, 36, 0]); c['cl' + s] = cl; sh.userData.s = s; return sh; });
    c.legs = [];
    for (const s of [1, -1]) for (let i = 0; i < 3; i++) { const b = G(c.inner, [-22 + i * 18, 34, s * 70]);
      part(b, tubeAlong([V(0, 0, 0), V(-4, 12, s * 22), V(-8, -32, s * 34)], 5.5, { segs: 12 }), RD, 2.2); b.userData = { s, i }; c.legs.push(b); }
    const dec = sphereDecal(c.inner, [0, 46, 0], [58, 40, 84], { phi: 0.85, th0: 1.2, th1: 2.4, cx: 150, cy: 186, du: 1.15, cw: 512 });
    const deL = sphereDecal(c.eyes[0], [0, 32, 0], [19, 21, 19], { phi: 1.2, th0: 0.1, th1: 2.5, cx: 118, cy: 92, du: 1.27, cw: 256 });
    const deR = sphereDecal(c.eyes[1], [0, 32, 0], [19, 21, 19], { phi: 1.2, th0: 0.1, th1: 2.5, cx: 182, cy: 92, du: 1.27, cw: 256 });
    c.face = faceRig({ f: dec, l: deL, r: deR }, st => { const s = T7.face(st, Object.assign({ lid: '#e8573a' }, T7.CRAB_L)); return { f: s, l: s, r: s }; });
  }, { shadow: 90, hopH: 26, hopLen: 60 });
  c.height = 125;
  c.extra = (po, s) => {
    const up = po.arms === 'up', t = s.t, w = po.walk || 0;
    c.claws.forEach(sh => { const k = sh.userData.s; sh.rotation.set(k * (up ? 0.3 : 0.75) + (up ? 0.12 * Math.sin(t * 8 + k) : 0), 0, up ? 0.15 : -0.7); c['cl' + k].rotation.set(0, 0, 0.2 * Math.sin(t * (up ? 9 : 2) + k)); });
    c.legs.forEach(l => { const { s: k, i } = l.userData; l.rotation.x = k * 0.25 * w * Math.sin(t * 14 + i * 2.1 + (k > 0 ? 0 : Math.PI)); });
    c.eyes.forEach((e, i) => { e.rotation.x = 0.06 * Math.sin(t * 2.3 + i); });
  };
  return c;
}

/* WIND GUST (a cloud puff that blows toward +x). po.blow 0..1 drives cheeks + streaks */
const GUST3D_L = { e1: { x: 130, y: 132, rx: 16, ry: 20 }, e2: { x: 170, y: 132, rx: 16, ry: 20 }, mo: { x: 150, y: 176, w: 26, teeth: 0 }, bw: 7.5 };
export function makeGust() {
  const c = hopRig('gust', 0, c => {
    const C = M('#eaf5fd', '#b8c6e2', 0);
    part(c.inner, ell(76, 64, 66, 36, 26), C, 3.2);
    for (const [x, y, z, r] of [[-50, 26, 40, 44], [-56, -18, -38, 40], [-30, 40, -30, 40], [-74, 6, 4, 38], [-20, -40, 36, 34]]) part(c.inner, ell(r, r * 0.9, r, 20, 14), C, 3, [x, y, z]);
    const sm2 = M('#9dc4e2', '#9dc4e2', 0);
    c.streaks = [0, 1, 2].map(i => { const b = G(c.inner, [-80, (i - 1) * 40, (i - 1) * 20]);
      part(b, tubeAlong([V(0, 0, 0), V(-60, 18, 0), V(-120, -6, 0), V(-170, 10, 0)], t => 5 * (1 - t) + 1.2, { segs: 24 }), sm2, 0); return b; });
    const dec = sphereDecal(c.inner, [0, 0, 0], [76, 64, 66], { phi: 1.0, th0: 0.55, th1: 2.3, cx: 150, cy: 150, du: 1, cw: 640 });
    c.face = faceRig({ f: dec }, st => { const b = st.blow == null ? 1 : st.blow;
      const F = Object.assign({}, st, st.talk ? {} : { mo: { open: 0.34 + 0.34 * b, round: 1, smile: 0 } });
      return { f: `<ellipse cx="112" cy="168" rx="${12 + 6 * b}" ry="${9 + 5 * b}" fill="#f7c6cf" opacity=".75"/><ellipse cx="188" cy="168" rx="${12 + 6 * b}" ry="${9 + 5 * b}" fill="#f7c6cf" opacity=".75"/>` + T7.face(F, Object.assign({ lid: '#eaf5fd' }, GUST3D_L)) }; });
  }, { shadow: 1 });
  c.shadow.visible = false;
  c.extra = (po, s) => { const b = po.blow == null ? 1 : po.blow; c.sq.scale.multiplyScalar(1 + 0.05 * b * Math.sin(s.t * 6)); c.streaks.forEach((st, i) => { st.rotation.x = s.t * 2 + i * 2; st.scale.x = 0.6 + 0.6 * b; }); c.shadow.visible = false; };
  return c;
}

/* ======================================================================== SKY, CLOUDS, BACKDROP */
const SKY_PAL = {
  day: { top: '#5fb3e6', mid: '#9fd4f2', horz: '#e2f3fb', sun: null },
  winter: { top: '#6e8394', mid: '#95a6b2', horz: '#c4ccd2', sun: null },
  sunset: { top: '#3f5d9c', mid: '#e48a6a', horz: '#ffd28a', sun: '#fff1c2' },
};
/* painted sky dome. o: {palette, sunDir: [x,y,z] (sunset: west = -z), r} */
export function makeSky(o) {
  o = Object.assign({ palette: 'day', r: 30000, sunDir: [0.0, 0.06, -1] }, o || {});
  const P = typeof o.palette === 'string' ? SKY_PAL[o.palette] : o.palette;
  const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, depthTest: false, uniforms: {
    uTop: { value: hexc(P.top) }, uMid: { value: hexc(P.mid) }, uHorz: { value: hexc(P.horz) }, uSun: { value: hexc(P.sun || '#ffffff') }, uHasSun: { value: P.sun ? 1 : 0 }, uDir: { value: V(...o.sunDir).normalize() } },
    vertexShader: 'varying vec3 vD0; void main(){ vD0 = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 uTop, uMid, uHorz, uSun, uDir; uniform float uHasSun; varying vec3 vD0;
      void main(){ vec3 vD = normalize(vD0); float y = max(vD.y, 0.0); vec3 c = mix(uHorz, uMid, smoothstep(0.0, 0.18, y)); c = mix(c, uTop, smoothstep(0.18, 0.6, y));
        if (vD.y < 0.0) c = uHorz;
        if (uHasSun > 0.5) { float a = dot(vD, uDir); c = mix(c, mix(uHorz, uSun, 0.6), smoothstep(0.88, 1.0, a) * 0.5);
          float disc = smoothstep(0.9985, 0.9988, a); c = mix(c, vec3(0.15, 0.11, 0.1), smoothstep(0.9979, 0.9981, a) * (1.0 - disc)); c = mix(c, uSun, disc);
        }
        gl_FragColor = vec4(c, 1.0); }` });
  const m = new THREE.Mesh(new THREE.SphereGeometry(o.r, 48, 24), mat); m.frustumCulled = false; m.renderOrder = -10;
  return m;
}
/* toon cloud puff cluster (flat-bottomed) */
export function makeCloud(seed, o) {
  o = Object.assign({ col: '#ffffff', tint: '#dfe6f2', s: 1 }, o || {});
  const r = rng(seed || 3), g = G(), m = M(o.col, o.tint, 0), n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) { const rr = (60 + r() * 50) * o.s; part(g, ell(rr * 1.2, rr * 0.8, rr * 0.7, 20, 12), m, 6 * o.s, [(i - n / 2) * 70 * o.s + r() * 20, (r() * 30 - 10) * o.s + (i === 1 || i === 2 ? 30 * o.s : 0), r() * 30]); }
  return g;
}
/* three value steps of distant hills on an arc (aerial perspective toward the haze colour). o: {a0, a1 (radians, 0 = +x), dists, base, haze, h, seed} */
export function makeHills(o) {
  o = Object.assign({ a0: 0, a1: Math.PI, dists: [5200, 7800, 10500], base: '#7fb85a', haze: '#cfe6f2', h: 900, seed: 11, n: 9 }, o || {});
  const g = G(), r = rng(o.seed), base = hexc(o.base), haze = hexc(o.haze);
  o.dists.forEach((d, k) => {
    const col = base.clone().lerp(haze, 0.25 + 0.27 * k), mat = toon('#' + col.getHexString(), { tint: '#' + col.clone().lerp(hexc('#b0b8d8'), 0.4).getHexString(), hi: 0 });
    for (let i = 0; i < o.n; i++) { const a = o.a0 + (o.a1 - o.a0) * (i + r() * 0.6) / o.n, rx = 1300 + r() * 900 + k * 500, ry = o.h * (0.45 + r() * 0.5) * (1 + 0.35 * k);
      part(g, ell(rx, ry, rx * 0.6, 40, 16), mat, k === 0 ? 8 : 0, [Math.cos(a) * d, -ry * 0.2, Math.sin(a) * d]); }
  });
  return g;
}

/* ======================================================================== DRESSING KIT */
const C_GRASS = '#7fb85a', C_GRASS_D = '#5f9a44', C_SAND = '#ecd49a';
export function makeGrassTuft(seed, o) {
  o = Object.assign({ col: C_GRASS, h: 40, n: 7, dry: false }, o || {});
  const r = rng(seed || 1), g = G(), m = M(o.dry ? '#c8b46a' : o.col, '#c4cfc0', 0);
  for (let i = 0; i < o.n; i++) { const a = i / o.n * Math.PI * 2 + r(), lean = 0.25 + r() * 0.35, hh = o.h * (0.6 + r() * 0.6);
    const tip = V(Math.cos(a) * hh * lean, hh, Math.sin(a) * hh * lean), mid = V(Math.cos(a) * hh * lean * 0.3, hh * 0.55, Math.sin(a) * hh * lean * 0.3);
    part(g, tubeAlong([V(Math.cos(a) * 3, 0, Math.sin(a) * 3), mid, tip], t => 4.5 * (1 - t) + 0.6, { segs: 10, radial: 6, flat: 0.5 }), m, 1.4); }
  return g;
}
export function makeStone(seed, s) { const g = G(), r = rng(seed || 2), sc = s || 1; part(g, rockGeo(40 * sc, 26 * sc, 34 * sc, seed), M(['#b5aea2', '#a69f94', '#c2b8a6'][Math.floor(r() * 3)], '#b9b0c4'), 2.4 * Math.sqrt(sc), [0, 8 * sc, 0]); return g; }
/* shells: kind 'fan' (scallop) or 'spiral' (cone snail) */
export function makeShell(kind, seed) {
  const g = G(), r = rng(seed || 5);
  if (kind === 'spiral') { const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * 6 * Math.PI, rr = 14 * (1 - t) + 1; pts.push(V(t * 30, Math.cos(a) * rr * 0.6 + 8, Math.sin(a) * rr * 0.6)); }
    part(g, tubeAlong(pts, t => 10 * (1 - t) + 2, { segs: 80, radial: 10 }), M('#f2d2b0', '#d8b6a8'), 1.6); g.rotation.y = r() * 6; return g; }
  const s = new THREE.Shape(); s.moveTo(0, 0); for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.15 + 0.7 * i / 10), rr = 26 + (i % 2) * 3; s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } s.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 3, bevelEnabled: true, bevelThickness: 2, bevelSize: 2, bevelSegments: 2 }); geo.rotateX(-Math.PI / 2 + 0.25);
  part(g, geo, toon(['#f6c9b2', '#f3e0c6', '#e9b9c4'][Math.floor(r() * 3)], { tint: '#d8b6a8', stripes: 10 }), 1.6, [0, 3, 0]); g.rotation.y = r() * 6; return g;
}
export function makeBush(seed, o) {
  o = Object.assign({ col: '#6aa84f', s: 1, flowers: null }, o || {});
  const r = rng(seed || 9), g = G(), m = M(o.col, '#c4cfc0');
  for (let i = 0; i < 6; i++) { const rr = (34 + r() * 22) * o.s; part(g, ell(rr, rr * 0.82, rr, 18, 12), m, 2.6 * o.s, [(r() - 0.5) * 70 * o.s, rr * 0.7 + r() * 16 * o.s, (r() - 0.5) * 60 * o.s]); }
  if (o.flowers) for (let i = 0; i < 9; i++) part(g, ell(6, 6, 6, 8, 6), M(o.flowers, '#d8b6a8', 0), 1.2, [(r() - 0.5) * 80 * o.s, (40 + r() * 40) * o.s, (r() - 0.5) * 70 * o.s]);
  return g;
}
/* trees: 'palm' (date palm), 'pine' (umbrella stone pine), 'tamarisk' (feathery grey-green, coastal) */
export function makeTree(kind, seed, s) {
  const g = G(), r = rng(seed || 4); s = s || 1;
  const trunk = M('#8a5a3a', '#b08a7a');
  if (kind === 'palm') {
    const pts = [V(0, 0, 0), V(14, 160, 0), V(-10, 320, 6), V(18, 460, 0)].map(v => v.multiplyScalar(s));
    part(g, tubeAlong(pts, t => (22 - 8 * t) * s, { segs: 30, radial: 12, round: false }), toon('#9a6b45', { tint: '#b08a7a', stripes: 0 }), 3 * s);
    for (let i = 0; i < 8; i++) part(g, ell(26 * s, 9 * s, 26 * s, 12, 6), M('#7e5534', '#b08a7a', 0), 1.6, [pts[1].x * (0.3 + i * 0.09) - 2, (40 + i * 52) * s, 0]);
    const top = pts[3], leaf = M('#5f9e3e', '#c4cfc0');
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + r() * 0.3, droop = 0.6 + r() * 0.4, L = (170 + r() * 50) * s;
      const P0 = top.clone(), P1 = top.clone().add(V(Math.cos(a) * L * 0.5, 50 * s, Math.sin(a) * L * 0.5)), P2 = top.clone().add(V(Math.cos(a) * L, -L * 0.45 * droop, Math.sin(a) * L));
      part(g, tubeAlong([P0, P1, P2], t => (20 * Math.sin(Math.PI * Math.min(1, 0.15 + t)) + 2) * s, { segs: 20, radial: 8, flat: 0.18 }), leaf, 2 * s); }
    for (let i = 0; i < 5; i++) part(g, ell(9 * s, 9 * s, 9 * s, 10, 8), M('#d9902e', '#b08a7a', 0), 1.4, [top.x + Math.cos(i * 1.3) * 18 * s, top.y - 22 * s, top.z + Math.sin(i * 1.3) * 18 * s]);
  } else if (kind === 'pine') {
    part(g, tubeAlong([V(0, 0, 0), V(-14, 150, 0), V(10, 280, 4)].map(v => v.multiplyScalar(s)), t => (24 - 10 * t) * s, { segs: 20, radial: 12, round: false }), trunk, 3 * s);
    for (const [a, y] of [[0.4, 270], [2.6, 262], [4.4, 266]]) part(g, tubeAlong([V(10, 250, 4), V(Math.cos(a) * 70, y + 20, Math.sin(a) * 70)].map(v => v.multiplyScalar(s)), 9 * s, { segs: 8 }), trunk, 2 * s);
    const leaf = M('#4e8c46', '#c4cfc0');
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, d = i ? 90 : 0; part(g, ell(110 * s, 42 * s, 110 * s, 24, 12), leaf, 4 * s, [Math.cos(a) * d * s, (300 + (i ? 0 : 30)) * s, Math.sin(a) * d * s]); }
  } else {
    part(g, tubeAlong([V(0, 0, 0), V(8, 90, 0), V(-6, 170, 0)].map(v => v.multiplyScalar(s)), t => (16 - 6 * t) * s, { segs: 16, round: false }), trunk, 3 * s);
    const leaf = M('#8fb08a', '#c4cfc0');
    for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, d = r() * 90; part(g, ell((44 + r() * 20) * s, (34 + r() * 14) * s, (44 + r() * 20) * s, 14, 10), leaf, 2.6 * s, [Math.cos(a) * d * s, (190 + r() * 80) * s, Math.sin(a) * d * s]); }
  }
  return g;
}
export function makeReeds(seed, o) {
  o = Object.assign({ n: 9, h: 160 }, o || {}); const r = rng(seed || 6), g = G(), m = M('#88a85a', '#c4cfc0', 0), top = M('#8a6038', '#b08a7a', 0);
  for (let i = 0; i < o.n; i++) { const x = (r() - 0.5) * 60, z = (r() - 0.5) * 60, h = o.h * (0.7 + r() * 0.5), lean = (r() - 0.5) * 30;
    part(g, tubeAlong([V(x, 0, z), V(x + lean * 0.3, h * 0.5, z), V(x + lean, h, z)], 2.6, { segs: 10, radial: 6 }), m, 1.2);
    if (i % 2 === 0) part(g, ell(5, 18, 5, 8, 8), top, 1.2, [x + lean, h + 10, z]); }
  return g;
}
/* flock of birds flying a loop. update(t). o: {n, r (loop radius), y, seed} */
export function makeBirds(o) {
  o = Object.assign({ n: 5, r: 600, y: 900, seed: 3, s: 1 }, o || {});
  const g = G(), r = rng(o.seed), wm = M('#fbfbf7', '#c3c3d6', 0), tips = M('#454b56', '#454b56', 0), items = [];
  for (let i = 0; i < o.n; i++) { const b = G(g); part(b, ell(12 * o.s, 8 * o.s, 8 * o.s, 10, 8), wm, 1.6 * o.s);
    const w = [1, -1].map(s => { const wg = G(b); const gg = leafGeo(46 * o.s, 12 * o.s, 0.25); gg.rotateX(s * -Math.PI / 2); part(wg, gg, wm, 1.4 * o.s); part(wg, ell(5 * o.s, 4 * o.s, 8 * o.s, 8, 6), tips, 0, [0, 0, s * 40 * o.s]); wg.userData.s = s; return wg; });
    items.push({ b, w, ph: r() * 6.28, rr: o.r * (0.7 + r() * 0.5), dy: r() * 120, sp: 0.18 + r() * 0.08 }); }
  g.userData.update = t => items.forEach(it => { const a = it.ph + t * it.sp * 2; it.b.position.set(Math.cos(a) * it.rr, o.y + it.dy + 40 * Math.sin(a * 2), Math.sin(a) * it.rr * 0.6);
    it.b.rotation.y = -a - Math.PI / 2 + Math.PI / 2; it.b.lookAt(g.position.x + Math.cos(a + 0.1) * it.rr, it.b.position.y, g.position.z + Math.sin(a + 0.1) * it.rr * 0.6); it.b.rotateY(-Math.PI / 2);
    it.w.forEach(w => { w.rotation.x = w.userData.s * 0.6 * Math.sin(t * 9 + it.ph); }); });
  return g;
}
export function makeButterflies(o) {
  o = Object.assign({ n: 3, r: 120, y: 90, seed: 8, cols: ['#ffd54a', '#ffffff', '#f49ac1'] }, o || {});
  const g = G(), r = rng(o.seed), items = [];
  for (let i = 0; i < o.n; i++) { const b = G(g), m = M(o.cols[i % o.cols.length], '#d8c0a8', 0);
    const w = [1, -1].map(s => { const wg = G(b); part(wg, ell(10, 2, 9, 10, 6), m, 1.2, [0, 0, s * 9]); wg.userData.s = s; return wg; });
    items.push({ b, w, ph: r() * 6.28, rr: o.r * (0.5 + r() * 0.6) }); }
  g.userData.update = t => items.forEach(it => { const a = it.ph + t * 0.9; it.b.position.set(Math.cos(a) * it.rr, o.y + 30 * Math.sin(a * 3), Math.sin(a * 1.3) * it.rr);
    it.w.forEach(w => { w.rotation.x = w.userData.s * 0.9 * Math.sin(t * 22 + it.ph); }); });
  return g;
}
/* foreground blur element: a soft, out-of-focus silhouette on a plane (grass, leaves, rocks) to put at the frame edge near the camera.
   kind 'grass'|'leaves'|'rock'. Face it to the camera with .lookAt(cam.position) after placing. */
export function makeFgBlur(kind, o) {
  o = Object.assign({ w: 300, h: 220, col: '#4f7f3a', blur: 9, seed: 12 }, o || {});
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * o.h / o.w);
  const c = cv.getContext('2d'), r = rng(o.seed); c.filter = `blur(${o.blur}px)`; c.fillStyle = o.col;
  if (kind === 'grass') for (let i = 0; i < 26; i++) { const x = 70 + r() * 372, hh = cv.height * (0.4 + r() * 0.55), lean = (r() - 0.5) * 90; c.beginPath(); c.moveTo(x - 9, cv.height); c.quadraticCurveTo(x + lean * 0.3, cv.height - hh * 0.6, x + lean, cv.height - hh); c.quadraticCurveTo(x + lean * 0.3 + 6, cv.height - hh * 0.6, x + 9, cv.height); c.fill(); }
  else if (kind === 'leaves') for (let i = 0; i < 18; i++) { c.beginPath(); c.ellipse(80 + r() * 352, 50 + r() * (cv.height - 100), 30 + r() * 30, 14 + r() * 10, r() * 3, 0, Math.PI * 2); c.fill(); }
  else { c.beginPath(); c.ellipse(256, cv.height, 250, cv.height * 0.7, 0, Math.PI, 0); c.fill(); }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.renderOrder = 20; return m;
}

/* props for the people (people themselves: productions/haredi_cast) */
export function makeBackpack() { const g = G(); const m = M('#2f5d8a', '#b0a8c4'), s = M('#1f3d5c', '#9a96b0');
  box(g, 26, 58, 48, m, [0, 30, 0], 2.2, null, 8); box(g, 10, 26, 38, s, [15, 22, 0], 1.8, null, 4); for (const z of [-14, 14]) box(g, 4, 50, 6, s, [-14, 34, z], 1.2, null, 2); return g; }
export function makeWaterBottle() { const g = G(); part(g, lathe([[0.01, 0], [9, 0], [10, 3], [10, 38], [7, 44], [5, 48], [5, 54], [0.01, 54]], 20), M('#5bb6e6', '#a8b6e6'), 1.6); part(g, tube(6, 6, 8, 12).translate(0, 62, 0), M('#2a2f4a', '#9a9ab8'), 1.4); return g; }
export function makeMapScroll(open) { const g = G(), p = M('#f3e7cc', '#d6cbb8', 0), w = M('#8a5a3a', '#b08a7a');
  if (!open) { part(g, tube(7, 7, 60, 14).rotateZ(Math.PI / 2).translate(30, 0, 0), p, 1.6); for (const x of [-32, 32]) part(g, tube(3, 3, 8, 10).rotateZ(Math.PI / 2).translate(x + 4, 0, 0), w, 1.2); return g; }
  box(g, 2, 50, 70, p, [0, 0, 0], 1.4, null, 0.5); for (const z of [-36, 36]) part(g, tube(5, 5, 58, 12).translate(0, 29, z), w, 1.4);
  part(g, tubeAlong([V(1.2, 14, -24), V(1.2, 4, -6), V(1.2, -6, 10), V(1.2, -14, 26)], 2.2, { segs: 16 }), M('#4f9fe0', '#4f9fe0', 0), 0); return g; }
export function makeWalkingStick() { const g = G(); part(g, tubeAlong([V(0, 0, 0), V(0, 130, 0), V(6, 150, 0), V(16, 152, 0)], 3.2, { segs: 20 }), M('#8a5a3a', '#b08a7a'), 1.6); return g; }

/* ======================================================================== BOATS AND SHIPS */
/* hull from a side profile (x along length, y up) extruded to width w, pinched toward the ends. */
function hullGeo(L, Hh, w, o) {
  o = Object.assign({ sheer: 0.25, bow: 0.5, stern: 0.35, pinch: 2.2 }, o || {});
  const s = new THREE.Shape(), h2 = L / 2;
  s.moveTo(-h2 * 0.86, 0); s.quadraticCurveTo(0, -Hh * 0.18, h2 * 0.8, 0);
  s.quadraticCurveTo(h2 * 1.0, Hh * 0.4, h2 * (1 + o.bow * 0.12), Hh * (1 + o.sheer));
  s.quadraticCurveTo(0, Hh * 0.92, -h2 * (1 + o.stern * 0.1), Hh * (1 + o.sheer * 0.8));
  s.quadraticCurveTo(-h2, Hh * 0.4, -h2 * 0.86, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, curveSegments: 20, steps: 8 });
  g.translate(0, 0, -w / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), u = Math.min(1, Math.abs(x) / (h2 * 1.08)); const k = Math.pow(Math.max(0.02, 1 - Math.pow(u, o.pinch)), 0.55) * (0.72 + 0.28 * Math.min(1, y / Hh + 0.2)); p.setZ(i, z * k); }
  g.computeVertexNormals(); return g;
}
/* ancient wooden merchant ship carrying cedar logs (to Yafo). ~520 long. root faces +x. update(t) sways the sail. */
export function makeCedarShip(o) {
  o = Object.assign({ logs: true, oars: true }, o || {});
  const g = G(), wood = toon('#9a6234', { tint: '#b08a7a', stripes: 16 }), dark = M('#6a3f22', '#a08070'), sailA = M('#f2e6c8', '#d8cbb8'), sailB = M('#c0392b', '#b08a9a'), rope = M('#c9a46a', '#b08a7a', 0);
  part(g, hullGeo(520, 90, 150), wood, 3.4);
  box(g, 440, 6, 96, M('#c08a54', '#b49a84', 0), [-10, 80, 0], 2);
  part(g, tubeAlong([V(-262, 96, 0), V(-300, 150, 0), V(-292, 196, 0), V(-262, 186, 0)], 10, { segs: 24 }), dark, 2.6);   // curled stern post
  part(g, tubeAlong([V(262, 100, 0), V(290, 140, 0), V(296, 166, 0)], t => 10 - 5 * t, { segs: 16 }), dark, 2.4);
  part(g, ell(10, 10, 4, 12, 8), M('#ffffff', '#ffffff', 0), 1.6, [230, 70, 56]); part(g, ell(5, 5, 3, 10, 8), M('#1d1613', '#1d1613', 0), 0, [233, 70, 59]);   // painted eye on the bow
  part(g, ell(10, 10, 4, 12, 8), M('#ffffff', '#ffffff', 0), 1.6, [230, 70, -56]); part(g, ell(5, 5, 3, 10, 8), M('#1d1613', '#1d1613', 0), 0, [233, 70, -59]);
  part(g, tube(7, 6, 330).translate(0, 410, 0), dark, 2.4, [20, 0, 0]);
  part(g, tube(5, 5, 300, 10).rotateX(Math.PI / 2).translate(0, 0, 150), dark, 2, [24, 390, 0]);
  const sail = G(g, [30, 250, 0]); g.userData.sail = sail;
  for (let i = 0; i < 6; i++) { const z = -125 + i * 50; box(sail, 4, 270, 50, i % 2 ? sailB : sailA, [3 * Math.cos((z / 125) * 1.4), 0, z], 1.6, null, 1.2); }
  for (const s of [1, -1]) part(g, tubeAlong([V(26, 400, s * 150), V(120, 260, s * 40), V(250, 96, 0)], 1.6, { segs: 10 }), rope, 0);
  part(g, tubeAlong([V(-230, 150, 50), V(-270, 60, 80), V(-290, -20, 90)], 5, { segs: 12 }), dark, 2);   // steering oar
  if (o.oars) for (const s of [1, -1]) for (let i = 0; i < 5; i++) part(g, tubeAlong([V(-120 + i * 55, 80, s * 66), V(-130 + i * 55, 20, s * 130), V(-136 + i * 55, -20, s * 160)], 3.4, { segs: 8 }), dark, 1.6);
  if (o.logs) { const lm = [toon('#8a5a3a', { tint: '#b08a7a' }), M('#e3b77d', '#c9a080', 0), M('#e3b77d', '#c9a080', 0)];
    for (const [n, y] of [[3, 100], [2, 130], [1, 160]]) for (let i = 0; i < n; i++) part(g, new THREE.CylinderGeometry(16, 16, 230, 18).rotateZ(Math.PI / 2), lm, 2.2, [-80, y, (i - (n - 1) / 2) * 34]); }
  g.userData.update = t => { sail.scale.x = 1 + 0.6 * Math.sin(t * 0.8); sail.position.x = 30 + 6 * (1 + Math.sin(t * 0.8)); };
  return g;
}
export function makeFishingBoat(col, seed) {
  const g = G(), r = rng(seed || 2);
  part(g, hullGeo(240, 56, 86, { bow: 0.4 }), toon(col || '#e8f0f4', { tint: '#b9b0c4', regions: [{ below: 14, c: '#c0392b', w: 0 }, { p: [0, 48, 0], r: [300, 5, 300], c: '#2f5d8a', w: 0 }] }), 3);
  box(g, 70, 54, 56, M('#ffffff', '#c9c6d8'), [-30, 82, 0], 2.4, null, 6); box(g, 80, 8, 64, M('#2f5d8a', '#9a96b0'), [-30, 112, 0], 2.2, null, 3);
  box(g, 4, 30, 50, M('#8fd0ec', '#8fd0ec', 0), [5.5, 88, 0], 0, null, 1);
  part(g, tube(3, 3, 120, 8).translate(0, 120, 0), M('#6a3f22', '#a08070'), 1.6, [40, 56, 0]);
  return g;
}
/* giant container ship (~1700 long) */
export function makeContainerShip(o) {
  o = Object.assign({ len: 1700, seed: 21 }, o || {}); const g = G(), r = rng(o.seed), L = o.len;
  part(g, hullGeo(L, 150, 240, { bow: 0.6, sheer: 0.08, stern: 0.1, pinch: 3.5 }), toon('#244a7a', { tint: '#a8a8c8', regions: [{ below: 40, c: '#b8352b', w: 0 }, { p: [0, 150, 0], r: [L, 6, 400], c: '#f2f2f2', w: 0 }] }), 4);
  const cols = ['#d9534f', '#2e86c1', '#f0ad4e', '#5cb85c', '#8e6c8a', '#e8e8e8', '#3b6e8f'], cm = cols.map(c => M(c, '#b0a8c4'));
  for (let b = 0; b < 12; b++) { const x = -L * 0.32 + b * L * 0.058, rows = 4, hgt = 3 + Math.floor(r() * 3);
    for (let z = 0; z < rows; z++) for (let y = 0; y < hgt; y++) box(g, L * 0.052, 30, 44, cm[Math.floor(r() * cm.length)], [x, 172 + y * 31, -69 + z * 46], 1.6, null, 2); }
  box(g, 120, 200, 190, M('#f4f4f0', '#c9c6d8'), [-L * 0.42, 250, 0], 3, null, 8);
  box(g, 140, 26, 210, M('#f4f4f0', '#c9c6d8'), [-L * 0.42, 340, 0], 2.6, null, 6);
  for (let k = 0; k < 4; k++) box(g, 4, 18, 180, M('#2b3a4a', '#2b3a4a', 0), [-L * 0.42 + 61, 220 + k * 30, 0], 0, null, 1);
  box(g, 50, 90, 50, M('#f0ad4e', '#c9a080'), [-L * 0.46, 380, 0], 2.4, null, 6);
  return g;
}
export function makeTugboat() { const g = G(); part(g, hullGeo(180, 60, 90, { bow: 0.2 }), toon('#d9534f', { tint: '#b9b0c4', regions: [{ below: 16, c: '#2b3a4a', w: 0 }] }), 3);
  box(g, 70, 50, 60, M('#ffffff', '#c9c6d8'), [-10, 88, 0], 2.2, null, 6); part(g, tube(12, 12, 50, 14).translate(0, 50, 0), M('#2b3a4a', '#6a6a80'), 2, [-30, 110, 0]);
  for (const z of [-46, 46]) part(g, new THREE.TorusGeometry(16, 6, 8, 18).rotateY(0), M('#2b2b2b', '#555', 0), 1.4, [10, 50, z]); return g; }

/* ======================================================================== SETS
   Every set returns {root, update(t), anchors:{name: [x,y,z]}, ...}. Add a sky (makeSky) and hills yourself, or use the `withSky` option. */

/* (1) OPEN SEA: cartoon waves driven by the wind, a floating bottle, two hero crest waves.
   o: {A0, L, palette}. update(t, A) A = wave height (calm 4, breeze 14, strong wind 36) */
export function makeOpenSea(o) {
  o = Object.assign({ A0: 14, L: 460, palette: 'summer' }, o || {});
  const root = G(), sea = makeSea({ A: o.A0, L: o.L, palette: o.palette }); root.add(sea.mesh);
  const bottle = makeBottle(); root.add(bottle);
  const crests = [[-600, -1800, 0.25], [900, -2600, -0.2]].map(([x, z, ry]) => { const w = makeCurlWave({ w: 800, h: 150 }); w.position.set(x, -8, z); w.rotation.y = ry - Math.PI / 2 + Math.PI / 2; root.add(w); return w; });
  const anchors = { bottle: [300, 0, 200], horizonWest: [0, 0, -12000] };
  return { root, sea, bottle, crests, anchors,
    update(t, A) { sea.update(t, A); const k = cl(((A == null ? o.A0 : A) - 8) / 30, 0, 1);
      crests.forEach((w, i) => { w.userData.update(t + i, k); w.visible = k > 0.03; });
      const b = anchors.bottle, f = sea.float(b[0] + 30 * Math.sin(t * 0.3), b[2], 40); bottle.position.set(b[0] + 30 * Math.sin(t * 0.3), f.y - 4, b[2]); bottle.rotation.set(f.rx, 0.4, f.rz + 0.08); } };
}

/* sandy ground with dunes (z > z0 is land). */
function sandGround(root, o) {
  const sand = M(o.sand || C_SAND, '#d8c4b0', 0), wet = M(o.wet || '#cdb27a', '#c0a890', 0);
  const g = new THREE.PlaneGeometry(9000, 3000, 90, 30).rotateX(-Math.PI / 2), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + 1500; const y = z < 0 ? -20 : Math.min(z * 0.03, 30) + 18 * Math.sin(x * 0.004) * Math.sin(z * 0.006) * sm(z / 600); p.setXYZ(i, x, y, z); }
  g.computeVertexNormals(); const m = new THREE.Mesh(g, sand); root.add(m);
  const wg = new THREE.PlaneGeometry(9000, 170, 60, 2).rotateX(-Math.PI / 2); const wm = new THREE.Mesh(wg, wet); wm.position.set(0, 0.6, 70); wm.material.polygonOffset = true; root.add(wm);
  // the sand under the shallow water fades into the sea
  return m;
}
/* (2) BEACH. o: {season:'summer'|'winter'}. Shoreline along x at z = 0, sea to -z, dunes from z = 700. update(t) */
export function makeBeach(o) {
  o = Object.assign({ season: 'summer', seed: 31, palette: null }, o || {});
  const W = o.season === 'winter', root = G(), r = rng(o.seed);
  sandGround(root, { sand: W ? '#d9c08a' : C_SAND, wet: W ? '#b39a6a' : '#cdb27a' });
  const sea = makeSea({ A: W ? 52 : 6, L: W ? 420 : 300, palette: o.palette || (W ? 'winter' : 'summer'), pos: [0, -2, -2000], storm: W ? 1 : 0, shore: [-40, W ? 260 : 400] }); root.add(sea.mesh);
  const foam = makeFoamLine({ z0: -10, width: W ? 160 : 90 }); root.add(foam.mesh);
  const crests = W ? [[-900, -520, 0.1], [700, -760, -0.15], [-200, -1200, 0.05]].map(([x, z, ry], i) => { const w = makeCurlWave({ w: 900, h: 130 + 30 * i, col: '#3a6787', light: '#5b88a3' }); w.position.set(x, -10, z); w.rotation.y = Math.PI / 2 + ry; root.add(w); return w; }) : [];
  // dunes with beach grass
  for (let i = 0; i < 9; i++) { const x = -3600 + i * 900 + r() * 300, z = 900 + r() * 400, rx = 500 + r() * 300, ry = 90 + r() * 70;
    part(root, ell(rx, ry, rx * 0.55, 40, 16), M(W ? '#d2b882' : '#efd9a3', '#d8c4b0', 0), 6, [x, 0, z]);
    for (let k = 0; k < 4; k++) { const tft = makeGrassTuft(i * 10 + k, { col: '#9cae5c', h: 60, n: 9, dry: W && k % 2 }); tft.position.set(x + (r() - 0.5) * rx, ry * 0.75, z - rx * 0.2 + (r() - 0.5) * 120); root.add(tft); } }
  for (let i = 0; i < 26; i++) { const s = makeShell(i % 3 ? 'fan' : 'spiral', i + 3); s.position.set(-1800 + r() * 3600, 2, 80 + r() * 500); s.scale.setScalar(0.8 + r() * 0.6); root.add(s); }
  for (let i = 0; i < 8; i++) { const s = makeStone(i + 40, 0.6 + r() * 0.8); s.position.set(-2000 + r() * 4000, 0, 120 + r() * 600); root.add(s); }
  let rain = null, wrack = [];
  if (W) { rain = makeRain({ w: 3600, d: 1500, h: 1500, n: 650, col: '#eef4f8', r: 2.4 }); rain.position.set(0, 0, -350); root.add(rain);
    for (let i = 0; i < 6; i++) { const wd = G(root, [-1600 + i * 600 + r() * 200, 4, 120 + r() * 120]); part(wd, tubeAlong([V(-60, 0, 0), V(0, 8, 10), V(70, 2, -6)], 9, { segs: 10 }), M('#8a6a4a', '#a08070'), 2);
      part(wd, ell(60, 8, 30, 16, 8), M('#5d6b3a', '#8a9070', 0), 1.6, [20, 0, 30]); wrack.push(wd); } }
  const anchors = { shore: [0, 0, 20], dune: [0, 120, 1000], wetSand: [0, 0, 90], westHorizon: [0, 0, -12000] };
  return { root, sea, foam, rain, anchors, season: o.season,
    update(t) { sea.update(t); foam.update(t, W ? 1.6 : 0.8); if (rain) rain.userData.update(t); crests.forEach((w, i) => w.userData.update(t + i * 1.3, 0.8 + 0.2 * Math.sin(t * 0.7 + i))); } };
}

/* (3) KURKAR cliffs: layered red-tan sandstone cliff along x, top at ~420, face toward the sea (-z) at z ~ 300.
   o: {erosion 0..1}. setErosion(e): the undercut notch deepens and a block breaks off and falls to the beach (e 0.55..0.9). */
export function makeKurkarCliff(o) {
  o = Object.assign({ erosion: 0.3, len: 3600, seed: 51 }, o || {});
  const root = G(), r = rng(o.seed);
  sandGround(root, {});
  const sea = makeSea({ A: 18, L: 340, palette: 'summer', pos: [0, -2, -2200], shore: [-40, 600] }); root.add(sea.mesh);
  const foam = makeFoamLine({ z0: -10, width: 120 }); root.add(foam.mesh);
  const strata = [['#e2b57c', 90], ['#cf9a5f', 70], ['#e6c08a', 80], ['#c98a55', 60], ['#d9a86c', 70], ['#b5653d', 40]];
  let y = 0; const layers = [];
  strata.forEach(([colr, th], k) => {
    const s = new THREE.Shape(), N = 160, front = [];
    for (let i = 0; i <= N; i++) { const x = -o.len / 2 + o.len * i / N; front.push([x, 300 + 26 * Math.sin(x * 0.005 + k) + 12 * Math.sin(x * 0.013 + k * 2) + (k % 2 ? 14 : -6) + (k === 0 ? 40 : 0) + (k === strata.length - 1 ? 30 : 0)]); }
    s.moveTo(-o.len / 2, 1400); front.forEach(([x, z]) => s.lineTo(x, z)); s.lineTo(o.len / 2, 1400); s.lineTo(-o.len / 2, 1400);
    let g = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: true, bevelThickness: 6, bevelSize: 8, bevelSegments: 2, curveSegments: 4 });
    g.rotateX(Math.PI / 2); g.translate(0, y + th, 0);   // shape y -> world z
    g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g, 0.5); g.computeVertexNormals();
    const m = part(root, g, M(colr, '#c9a8a0', 0), 3.6); layers.push(m); y += th;
  });
  const topY = y;
  for (let i = 0; i < 26; i++) { const b = makeBush(i + 60, { col: i % 3 ? '#7a9a4a' : '#8fae5a', s: 0.7 + r() * 0.5 }); b.position.set(-o.len / 2 + r() * o.len, topY, 420 + r() * 600); root.add(b); }
  for (let i = 0; i < 5; i++) { const tr = makeTree(i % 2 ? 'tamarisk' : 'pine', i + 70, 0.8); tr.position.set(-1400 + i * 700, topY, 800 + r() * 300); root.add(tr); }
  for (let i = 0; i < 9; i++) { const g = rockGeo(60 + r() * 50, 40 + r() * 30, 50 + r() * 30, i + 90); part(root, g, M(strata[i % 5][0], '#c9a8a0'), 3, [-1500 + i * 360 + r() * 100, 20, 200 + r() * 80]); }
  // undercut notch (dark) at the base and the breaking block
  const notch = part(root, new THREE.BoxGeometry(o.len, 50, 60), M('#8a5a3a', '#7a5040', 0), 0, [0, 30, 330]);
  const block = G(root, [200, topY - 60, 300]);
  part(block, rockGeo(110, 60, 80, 7, 0.12), M(strata[4][0], '#c9a8a0'), 3.4);
  const crack = part(root, tubeAlong([V(110, topY + 4, 290), V(160, topY - 30, 285), V(140, topY - 80, 282), V(190, topY - 120, 280)], 3, { segs: 12 }), M(OL, OL, 0), 0);
  const api = { root, sea, foam, anchors: { cliffTop: [0, topY, 600], cliffFace: [0, topY * 0.5, 300], beach: [0, 0, 120], block: [200, topY - 60, 300] }, topY,
    setErosion(e) { notch.scale.z = 0.3 + 1.6 * e; notch.position.z = 330 - 20 * e; crack.visible = e > 0.35 && e < 0.9;
      const u = cl((e - 0.55) / 0.35, 0, 1), fall = u * u; block.position.set(200, (topY - 60) * (1 - fall) + 50 * fall, 300 - 260 * u); block.rotation.set(0.9 * u, 0, -1.3 * u); },
    update(t) { sea.update(t); foam.update(t, 1.2); } };
  api.setErosion(o.erosion);
  return api;
}

/* (4) SEA CROSS-SECTION diorama: land on the right (east), the shelf, the slope, a deep trench, cold dark deep water,
   fish, seaweed, a cable on the seabed and a gas platform. x from -1800 (west) to 1800, front cut at z = +300. update(t) */
export function makeSeaSection(o) {
  o = Object.assign({ depthZ: 600 }, o || {});
  const root = G(), Z = o.depthZ;
  const prof = [[-1800, -1000], [-1200, -1050], [-700, -1380], [-520, -1500], [-350, -1350], [0, -700], [300, -380], [600, -200], [1000, -110], [1400, 0], [1500, 22], [1580, 30], [1640, 150], [1800, 165]];
  const s = new THREE.Shape(); s.moveTo(-1800, -1900); prof.forEach(([x, y]) => s.lineTo(x, y)); s.lineTo(1800, -1900); s.lineTo(-1800, -1900);
  const sg = new THREE.ExtrudeGeometry(s, { depth: Z, bevelEnabled: false, curveSegments: 8 }); sg.translate(0, 0, -Z / 2);
  part(root, sg, toon('#d9bf8a', { tint: '#c9a8a0', hi: 0, regions: [{ below: -260, c: '#b89a74', w: 3 }, { below: -900, c: '#8f7a66', w: 3 }, { below: -1450, c: '#6f6058', w: 3 }, { below: -1800, c: '#5a4c46', w: 2 }] }), 5);
  part(root, new THREE.BoxGeometry(170, 20, Z).translate(1715, 175, 0), M('#7fb85a', '#c4cfc0', 0), 3);
  const water = (alpha) => new THREE.ShaderMaterial({ transparent: alpha < 1, depthWrite: alpha >= 1, side: THREE.DoubleSide, uniforms: { uA: { value: alpha } },
    vertexShader: 'varying float vY; varying float vX; void main(){ vY = position.y; vX = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uA; varying float vY; varying float vX; void main(){ float d = clamp(-vY / 1500.0, 0.0, 1.0);
      vec3 c = mix(vec3(0.42, 0.78, 0.93), vec3(0.22, 0.52, 0.80), smoothstep(0.0, 0.25, d)); c = mix(c, vec3(0.08, 0.18, 0.36), smoothstep(0.3, 0.95, d));
      c *= 1.0 - 0.06 * step(0.5, fract(vY / 160.0 + 0.04 * sin(vX * 0.01)));
      gl_FragColor = vec4(c, uA); }` });
  const ws = new THREE.Shape(); ws.moveTo(-1800, 0); ws.lineTo(1400, 0); for (let i = prof.length - 5; i >= 0; i--) ws.lineTo(prof[i][0], prof[i][1]); ws.lineTo(-1800, 0);
  const front = new THREE.Mesh(new THREE.ShapeGeometry(ws, 8), water(0.5)); front.position.z = Z / 2 + 0.5; front.renderOrder = 6; root.add(front);
  const back = new THREE.Mesh(new THREE.ShapeGeometry(ws, 8), water(1)); back.position.z = -Z / 2 + 0.5; root.add(back);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(Z, 1000).rotateY(Math.PI / 2).translate(-1800, -500, 0), water(0.5)); side.renderOrder = 6; root.add(side);
  const sea = makeSea({ A: 8, L: 260, palette: 'summer', size: 4000, seg: 160, k: 1.5, F: 1e6 }); root.add(sea.mesh);
  sea.mesh.geometry = new THREE.PlaneGeometry(3200, Z, 160, 30).rotateX(-Math.PI / 2).translate(-200, 0, 0);
  // ink line along the seabed profile on the front cut
  part(root, tubeAlong(prof.map(([x, y]) => V(x, y, Z / 2 + 1)), 4, { segs: 200, radial: 6 }), M(OL, OL, 0), 0);
  part(root, tubeAlong([V(-1800, 0, Z / 2 + 1), V(1400, 0, Z / 2 + 1)], 3, { segs: 4, radial: 6 }), M(OL, OL, 0), 0);
  // seabed life
  const yAt = x => { for (let i = 1; i < prof.length; i++) if (x <= prof[i][0]) { const a = prof[i - 1], b = prof[i], u = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * u; } return 0; };
  const weeds = [];
  for (let i = 0; i < 16; i++) { const x = 250 + i * 70, y = yAt(x), h = 80 + (i * 37) % 70, wg = G(root, [x, y, -200 + (i * 53) % 400]);
    part(wg, tubeAlong([V(0, 0, 0), V(12, h * 0.35, 0), V(-10, h * 0.7, 0), V(6, h, 0)], t => 7 * (1 - t) + 2, { segs: 16, flat: 0.35 }), M(i % 3 ? '#4f9a52' : '#7cbf5a', '#c4cfc0', 0), 1.8); weeds.push(wg); }
  for (let i = 0; i < 10; i++) { const x = -1600 + i * 330, st = makeStone(i + 200, 1.2 + (i % 3) * 0.5); st.position.set(x, yAt(x) - 4, -150 + (i * 71) % 300); root.add(st); }
  // cable along the seabed
  const cab = []; for (let x = 1400; x >= -1800; x -= 40) cab.push(V(x, yAt(x) + 6, 120));
  part(root, tubeAlong(cab, 7, { segs: 240, radial: 8 }), M('#2b2b30', '#555', 0), 2);
  // gas platform
  const rig = G(root, [700, 0, -40]), steel = M('#c9ccd2', '#9a9cb0'), yel = M('#f0c040', '#c9a080'), red = M('#c0392b', '#b08a9a');
  const by = yAt(700);
  for (const [x, z] of [[-60, -60], [60, -60], [-60, 60], [60, 60]]) part(rig, tube(10, 10, 220 - by).translate(0, 220, 0), yel, 2.2, [x, 0, z]);
  for (let k = 0; k < 3; k++) { const yy = by + 60 + k * ((220 - by - 80) / 3); box(rig, 140, 8, 8, yel, [0, yy, 60], 1.4); box(rig, 140, 8, 8, yel, [0, yy, -60], 1.4); }
  box(rig, 220, 30, 200, steel, [0, 235, 0], 2.6, null, 4); box(rig, 100, 60, 90, M('#ffffff', '#c9c6d8'), [-50, 280, -30], 2.4, null, 5);
  part(rig, new THREE.CylinderGeometry(50, 50, 6, 30), M('#5a6a5a', '#7a8a7a', 0), 2, [60, 254, 50]);
  for (let k = 0; k < 4; k++) box(rig, 6, 70, 6, red, [40 + (k % 2) * 30, 290 + Math.floor(k / 2) * 70, -50 + (k % 2) * 30], 1.2);
  part(rig, tube(6, 6, 160).translate(0, 160, 0), red, 1.6, [55, 250, -35]);
  const pipe = []; for (let x = 700; x <= 1400; x += 35) pipe.push(V(x, yAt(x) + 8, -60)); part(root, tubeAlong(pipe, 9, { segs: 60, radial: 8 }), M('#7a7f8a', '#5a5a70'), 2);
  // fish schools (simple, not characters)
  const school = [], fm = [M('#f49a3c', '#d4a8a0'), M('#ffd45a', '#d8c0a8'), M('#9ad0ff', '#a8b6e6')];
  for (let i = 0; i < 18; i++) { const f = G(root); part(f, ell(20, 11, 7, 14, 10), fm[i % 3], 1.8); part(f, leafGeo(14, 9, 0.3).rotateZ(Math.PI / 2), fm[i % 3], 1.4, [-18, 0, 0]); school.push({ f, i }); }
  const anchors = { surface: [-400, 0, Z / 2], shelf: [800, -150, Z / 2], slope: [150, -540, Z / 2], trench: [-520, -1500, Z / 2], deepWater: [-900, -900, Z / 2], rig: [700, 300, 0], cable: [-200, yAt(-200), 120], coast: [1450, 20, 0] };
  return { root, sea, anchors, yAt,
    update(t) { sea.update(t); weeds.forEach((w, i) => { w.rotation.z = 0.12 * Math.sin(t * 1.4 + i); });
      school.forEach(({ f, i }) => { const g = Math.floor(i / 6), cx = [-200, 600, -1100][g], cy = [-300, -120, -800][g], a = t * (0.35 + 0.05 * g) + i * 0.5;
        f.position.set(cx + 220 * Math.cos(a) + (i % 3) * 22, cy + 30 * Math.sin(a * 2) + (i % 2) * 18, 80 * Math.sin(a)); f.rotation.y = -a - Math.PI / 2 + Math.PI; f.lookAt(cx + 220 * Math.cos(a + 0.1), f.position.y, 80 * Math.sin(a + 0.1)); f.rotateY(-Math.PI / 2); }); } };
}

/* boulder breakwater along a polyline (x, z points). returns group; tip at the last point */
export function makeBreakwater(pts, o) {
  o = Object.assign({ w: 150, h: 70, seed: 61, lighthouse: true, ancient: false }, o || {});
  const g = G(), r = rng(o.seed), curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => V(x, 0, z))), L = curve.getLength(), n = Math.floor(L / 38);
  const mats = o.ancient ? [M('#e2cfa2', '#c9b08c'), M('#d4bf91', '#bba07c')] : [M('#a9a39a', '#b9b0c4'), M('#bdb5a8', '#b9b0c4'), M('#948e86', '#b9b0c4')];
  for (let i = 0; i <= n; i++) { const u = i / n, p = curve.getPointAt(u), tg = curve.getTangentAt(u), nx = V(-tg.z, 0, tg.x);
    for (const side of [-1, 1]) { const q = p.clone().addScaledVector(nx, side * o.w * 0.32);
      if (o.ancient) box(g, 70, 56, 46, mats[i % 2], [q.x, 26 + (i % 2) * 6, q.z], 2.4, [0, Math.atan2(tg.x, tg.z), 0], 3);
      else part(g, rockGeo(34 + r() * 18, 30 + r() * 14, 30 + r() * 16, i * 7 + side + 3), mats[Math.floor(r() * 3)], 2.6, [q.x + (r() - 0.5) * 14, 18 + r() * 14, q.z + (r() - 0.5) * 14]); }
    if (!o.ancient && i % 2 === 0) part(g, rockGeo(30, 24, 28, i + 500), mats[1], 2.4, [p.x, o.h * 0.75, p.z]); }
  const cap = []; for (let i = 0; i <= 60; i++) cap.push(curve.getPointAt(i / 60).add(V(0, o.h + 4, 0)));
  part(g, tubeAlong(cap, 26, { segs: 120, radial: 4, flat: 0.25 }), M(o.ancient ? '#d8c49a' : '#cfcac2', '#b9b0c4', 0), 2.4);
  if (o.lighthouse) { const tip = curve.getPointAt(1), lh = G(g, [tip.x, o.h, tip.z]);
    part(lh, lathe([[0.01, 0], [34, 0], [30, 60], [26, 150], [30, 154], [30, 162], [0.01, 162]], 28), toon('#ffffff', { tint: '#c9c6d8', regions: [{ p: [0, 30, 0], r: [80, 18, 80], c: '#d9534f', w: 0 }, { p: [0, 100, 0], r: [80, 18, 80], c: '#d9534f', w: 0 }] }), 2.6);
    part(lh, tube(18, 18, 26, 16).translate(0, 190, 0), M('#fff6c8', '#e0d0a0', 0), 2, [0, 0, 0]); part(lh, lathe([[0.01, 0], [24, 0], [0.01, 22]], 16), M('#d9534f', '#b08a9a'), 2, [0, 190, 0]); g.userData.lighthouse = lh; }
  g.userData.curve = curve; return g;
}
/* (5a) HARBOUR with a breakwater: shore along x at z = 600 (land z > 600), sea to -z. The basin behind the breakwater is calm.
   o: {A (open-sea waves)}. The ship enters through the gap at the east end (x ~ 600). update(t) */
export function makeHarbour(o) {
  o = Object.assign({ A: 30, seed: 71 }, o || {});
  const root = G(), r = rng(o.seed);
  const sea = makeSea({ A: o.A, L: 360, palette: 'harbour', pos: [0, -4, -1500] }); root.add(sea.mesh);
  sea.setCalm(-250, 160, 700, 420, 0.1);
  const bwPts = [[-1000, 640], [-1020, 100], [-900, -260], [-500, -330], [0, -320], [380, -280]];
  const bw = makeBreakwater(bwPts); root.add(bw);
  // quay / land
  box(root, 4200, 70, 1400, M('#cfcac2', '#b9b0c4', 0), [400, 20, 1300], 3, null, 4);
  box(root, 4200, 12, 30, M('#2b2b30', '#555', 0), [400, 57, 610], 0, null, 2);
  for (let i = 0; i < 9; i++) part(root, lathe([[0.01, 0], [12, 0], [12, 16], [15, 20], [15, 26], [0.01, 26]], 16), M('#3b3532', '#6a6a80'), 1.6, [-700 + i * 200, 55, 630]);
  box(root, 600, 260, 300, M('#e8d6ab', '#c9b08c'), [-1100, 190, 1300], 3, null, 6); box(root, 640, 20, 340, M('#c0392b', '#b08a9a'), [-1100, 330, 1300], 2.6, null, 4);
  for (let i = 0; i < 4; i++) box(root, 4, 120, 90, M('#3b4a5a', '#3b4a5a', 0), [-1350 + i * 160, 130, 1150 - 0.5], 0, null, 2);
  const house = G(root); for (let i = 0; i < 5; i++) box(house, 180, 160 + (i % 3) * 60, 180, M(['#efe2c2', '#e8d6ab', '#f3ead6'][i % 3], '#c9b08c'), [900 + i * 220, 140 + (i % 3) * 30, 1550 + (i % 2) * 120], 3, null, 6);
  for (let i = 0; i < 4; i++) { const tr = makeTree(i % 2 ? 'palm' : 'pine', i + 300, 0.9); tr.position.set(i < 2 ? -1500 + i * 260 : 900 + i * 260, 55, 800 + (i % 2) * 160); root.add(tr); }
  const boats = [['#e8f0f4', -700, 470, 0.1], ['#f6e6a8', -480, 480, -0.05], ['#cfe8f4', -260, 470, 0.06]].map(([c, x, z, ry], i) => { const b = makeFishingBoat(c, i); b.position.set(x, 0, z); b.rotation.y = Math.PI / 2 + ry; root.add(b); return b; });
  const anchors = { quay: [-300, 55, 640], basin: [-300, 0, 150], gap: [600, 0, -100], openSea: [600, 0, -1500], tip: [380, 70, -280], lighthouse: [380, 230, -280] };
  return { root, sea, breakwater: bw, boats, anchors,
    update(t) { sea.update(t); boats.forEach((b, i) => { const f = sea.float(b.position.x, b.position.z, 60); b.position.y = f.y - 10; b.rotation.x = f.rx; b.rotation.z = f.rz + 0.02 * Math.sin(t + i); }); } };
}
/* (5b) ANCIENT PORT (Caesarea-like): ashlar mole with a round tower, arched vaults along the quay, columns, moored wooden ships */
export function makeAncientPort(o) {
  o = Object.assign({ seed: 81 }, o || {});
  const root = G(), r = rng(o.seed), stone = M('#e2cfa2', '#c9b08c'), stoneD = M('#cdb88c', '#bba07c');
  const sea = makeSea({ A: 22, L: 380, palette: 'summer', pos: [0, -4, -1500] }); root.add(sea.mesh); sea.setCalm(-150, 180, 750, 380, 0.12);
  root.add(makeBreakwater([[-1000, 620], [-1050, 0], [-800, -260], [-200, -300], [250, -220]], { ancient: true, lighthouse: false }));
  root.add(makeBreakwater([[1100, 620], [1080, 100], [800, -120], [480, -180]], { ancient: true, lighthouse: false, seed: 9 }));
  for (const [x, z] of [[250, -220], [480, -180]]) { const tw = G(root, [x, 0, z]); part(tw, new THREE.CylinderGeometry(70, 80, 240, 32).translate(0, 120, 0), stone, 3.2);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; box(tw, 26, 26, 26, stoneD, [Math.cos(a) * 62, 252, Math.sin(a) * 62], 2, [0, -a, 0], 3); } }
  box(root, 4200, 60, 1300, M('#e9dcb8', '#c9b08c', 0), [0, 20, 1250], 3, null, 4);
  // vaults: wall with arched openings
  const vs = new THREE.Shape(); vs.moveTo(-900, 0); vs.lineTo(900, 0); vs.lineTo(900, 260); vs.lineTo(-900, 260); vs.lineTo(-900, 0);
  for (let i = 0; i < 8; i++) { const cx = -790 + i * 225, hole = new THREE.Path(); hole.moveTo(cx - 70, 0.1); hole.lineTo(cx - 70, 120); hole.absarc(cx, 120, 70, Math.PI, 0, true); hole.lineTo(cx + 70, 0.1); hole.lineTo(cx - 70, 0.1); vs.holes.push(hole); }
  const vg = new THREE.ExtrudeGeometry(vs, { depth: 60, bevelEnabled: false, curveSegments: 16 }); part(root, vg, stone, 3, [0, 50, 720]);
  box(root, 1800, 300, 20, M('#4a3a30', '#4a3a30', 0), [0, 200, 900], 0); box(root, 1840, 24, 260, stoneD, [0, 322, 800], 2.6, null, 4);
  for (let i = 0; i < 7; i++) { const col = G(root, [-1300 + i * 120 + (i > 3 ? 1900 : 0), 50, 760 + (i % 2) * 40]);
    if (i === 2 || i === 5) { part(col, tube(18, 18, 180, 18).rotateZ(Math.PI / 2 - 0.1).translate(90, 18, 0), M('#efe6d0', '#c9c0b0'), 2.4); continue; }
    part(col, tube(18, 18, 180 - (i % 3) * 40, 18).translate(0, 180 - (i % 3) * 40, 0), M('#efe6d0', '#c9c0b0'), 2.4); box(col, 50, 16, 50, stoneD, [0, 8, 0], 2); }
  const ships = [[-500, 380, 0.05], [100, 420, -0.1]].map(([x, z, ry], i) => { const s = makeCedarShip({ logs: i === 0, oars: false }); s.position.set(x, -8, z); s.rotation.y = ry; s.scale.setScalar(0.85); root.add(s); return s; });
  return { root, sea, ships, anchors: { towers: [365, 250, -200], vaults: [0, 150, 700], basin: [-150, 0, 180], quay: [0, 50, 640] },
    update(t) { sea.update(t); ships.forEach((s, i) => { const f = sea.float(s.position.x, s.position.z, 120); s.position.y = f.y - 12; s.rotation.x = f.rx; s.rotation.z = f.rz; s.userData.update(t + i); }); } };
}
/* (5c) MODERN PORT: quay, gantry cranes, container stacks, a giant container ship docked, a tug */
export function makeModernPort(o) {
  o = Object.assign({ seed: 91 }, o || {});
  const root = G(), r = rng(o.seed);
  const sea = makeSea({ A: 10, L: 360, palette: 'harbour', pos: [0, -4, -1500] }); root.add(sea.mesh);
  box(root, 6000, 80, 1600, M('#c9c6c0', '#b9b0c4', 0), [0, 20, 1200], 3, null, 4);
  box(root, 6000, 14, 40, M('#f0c040', '#c9a080', 0), [0, 62, 412], 0, null, 2);
  const ship = makeContainerShip(); ship.position.set(0, -50, 120); root.add(ship);
  const cranes = [];
  for (let i = 0; i < 3; i++) { const c = G(root, [-500 + i * 520, 60, 560]), red = M('#d9534f', '#b08a9a'), wht = M('#f4f4f0', '#c9c6d8');
    for (const [x, z] of [[-80, -110], [80, -110], [-80, 110], [80, 110]]) box(c, 22, 420, 22, red, [x, 210, z], 2.4, null, 3);
    box(c, 200, 30, 30, red, [0, 400, -110], 2.2); box(c, 200, 30, 30, red, [0, 400, 110], 2.2);
    box(c, 30, 30, 1100, wht, [0, 470, -340], 2.6, null, 4); box(c, 70, 60, 70, wht, [0, 420, -260], 2.4, null, 6);
    part(c, tube(3, 3, 200, 6), M('#2b2b30', '#555', 0), 0, [0, 455, -420 - i * 60]); box(c, 60, 14, 30, M('#f0c040', '#c9a080'), [0, 250, -420 - i * 60], 1.6); cranes.push(c); }
  const cols = ['#d9534f', '#2e86c1', '#f0ad4e', '#5cb85c', '#8e6c8a', '#e8e8e8'], cm = cols.map(c => M(c, '#b0a8c4'));
  for (let bx = 0; bx < 6; bx++) for (let bz = 0; bz < 3; bz++) { const n = 1 + Math.floor(r() * 4); for (let k = 0; k < n; k++) box(root, 120, 52, 50, cm[Math.floor(r() * cm.length)], [-1500 + bx * 140 + (bz % 2) * 10, 86 + k * 53, 900 + bz * 56], 1.8, null, 3); }
  const tug = makeTugboat(); tug.position.set(1200, -6, -200); tug.rotation.y = 2.4; root.add(tug);
  return { root, sea, ship, cranes, tug, anchors: { ship: [0, 300, 120], cranes: [0, 480, 560], containers: [-1100, 150, 950], quay: [0, 60, 430] },
    update(t) { sea.update(t); const f = sea.float(tug.position.x, tug.position.z, 60); tug.position.y = f.y - 8; tug.rotation.z = f.rz; tug.rotation.x = f.rx; } };
}

/* ======================================================================== (6) RELIEF MAP of the Mediterranean
   Stylised, north up (-z). World X = (lon - 16) * 80 (lon shortened like a real map at 38N), Z = -(lat - 37.5) * 100.
   The coast is a hand-traced polygon list (MED_SEA_POLYS = sea, MED_ISLANDS = land inside the sea) in lon/lat degrees.
   It is baked ONCE into a signed-distance + height grid (DataTexture) used by the shaders AND by the JS helpers,
   so anchors and paths sit exactly on the drawn coast.
   map.lonlat(lon, lat, up) -> [x, y, z] on the surface. map.anchors: caption-ID anchor points (no text in code).
   map.setSand(t, amount) moves the Nile sand along the coast to the Land of Israel. */
export const MAP_KX = 80, MAP_KZ = 100;
const MED_MAIN = [[-5.6, 36.0], [-5.3, 36.15], [-4.4, 36.7], [-2.9, 36.75], [-2.1, 36.8], [-1.6, 37.3], [-0.8, 37.6], [-0.5, 38.3], [0.2, 38.8], [-0.3, 39.4], [0.0, 40.0], [0.9, 40.8],
  [2.1, 41.3], [3.2, 41.9], [3.1, 42.4], [3.0, 43.0], [3.6, 43.4], [4.5, 43.45], [5.4, 43.2], [6.5, 43.1], [7.4, 43.7], [8.4, 44.1], [8.9, 44.4], [9.8, 44.1], [10.3, 43.5], [10.6, 42.9],
  [11.1, 42.4], [12.2, 41.7], [13.0, 41.25], [13.9, 41.2], [14.3, 40.8], [14.9, 40.4], [15.6, 40.0], [15.8, 39.4], [16.1, 38.7], [15.65, 38.2], [16.0, 37.95], [16.6, 38.4], [17.1, 38.9],
  [16.5, 39.6], [17.2, 40.4], [18.0, 39.9], [18.5, 40.1], [17.9, 40.6], [16.9, 41.1], [15.9, 41.6], [16.1, 41.9], [15.2, 41.95], [14.0, 42.6], [13.6, 43.5], [12.4, 44.2], [12.3, 45.2],
  [12.6, 45.5], [13.6, 45.75], [13.6, 45.1], [14.3, 45.2], [15.2, 44.2], [16.4, 43.5], [17.6, 43.0], [18.6, 42.4], [19.3, 41.8], [19.4, 41.0], [19.4, 40.4], [20.0, 39.7], [20.7, 39.0],
  [21.1, 38.3], [21.3, 37.6], [21.7, 36.8], [22.4, 36.4], [23.0, 36.5], [23.2, 37.3], [23.1, 37.9], [24.0, 37.7], [24.0, 38.2], [23.4, 38.6], [22.9, 39.3], [22.6, 40.3], [23.8, 40.0],
  [24.0, 40.7], [25.0, 40.95], [26.0, 40.75], [26.2, 40.1], [26.2, 39.5], [26.8, 39.3], [26.6, 38.4], [27.3, 37.9], [27.3, 37.0], [28.2, 36.7], [29.1, 36.6], [30.0, 36.25], [30.6, 36.8],
  [31.4, 36.75], [32.3, 36.2], [33.6, 36.15], [34.6, 36.8], [35.6, 36.6], [36.2, 36.8], [35.9, 36.2], [35.8, 35.5], [35.9, 34.9], [35.6, 34.4], [35.5, 33.9], [35.2, 33.3], [35.1, 33.0],
  [35.0, 32.8], [34.9, 32.5], [34.8, 32.1], [34.65, 31.8], [34.5, 31.6], [34.3, 31.35], [33.9, 31.15], [33.0, 31.1], [32.3, 31.25], [31.8, 31.5], [31.4, 31.6], [30.9, 31.6], [30.3, 31.45],
  [29.9, 31.2], [29.0, 30.9], [27.2, 31.35], [25.2, 31.6], [24.0, 32.0], [23.0, 32.6], [22.0, 32.9], [21.0, 32.8], [20.1, 32.1], [20.0, 31.0], [19.0, 30.3], [18.0, 30.6], [16.0, 31.2],
  [15.2, 32.3], [13.2, 32.9], [11.5, 33.2], [10.8, 33.8], [10.1, 34.2], [10.8, 35.0], [11.0, 35.8], [10.5, 36.4], [11.1, 37.1], [10.3, 36.9], [9.9, 37.3], [8.6, 36.95], [7.7, 36.9],
  [6.5, 37.0], [5.1, 36.7], [3.1, 36.8], [1.3, 36.5], [0.0, 35.85], [-0.6, 35.7], [-2.0, 35.1], [-3.0, 35.2], [-4.4, 35.2], [-5.3, 35.9], [-5.9, 35.8],
  [-6.3, 35.4], [-6.8, 34.0], [-8.5, 33.2], [-9.8, 30.5], [-9.7, 28.0], [-11, 27.5], [-11, 47.5], [-2.0, 47.5], [-1.3, 46.2], [-1.5, 43.5], [-8.0, 43.7], [-9.3, 43.0], [-8.8, 41.0],
  [-9.5, 38.7], [-8.8, 37.0], [-7.4, 37.2], [-6.3, 36.5], [-6.0, 36.1]];
const MED_BLACK = [[28.0, 41.5], [29.1, 41.2], [30.5, 41.1], [31.8, 41.4], [33.5, 42.0], [35.2, 42.0], [36.8, 41.3], [38.5, 40.95], [40.5, 41.0], [41.6, 41.6], [41.8, 42.6], [40.0, 43.5],
  [38.0, 44.4], [37.0, 45.2], [35.5, 45.3], [33.5, 44.6], [32.5, 45.4], [31.0, 46.6], [30.0, 45.8], [29.6, 45.0], [28.7, 44.2], [28.0, 43.0], [27.9, 42.0]];
const MED_MARMARA = [[26.2, 40.0], [26.45, 40.0], [26.8, 40.35], [28.0, 40.35], [29.0, 40.75], [29.15, 41.25], [28.95, 41.3], [28.0, 41.0], [27.0, 40.7], [26.3, 40.2]];
export const MED_SEA_POLYS = [MED_MAIN, MED_BLACK, MED_MARMARA];
export const MED_ISLANDS = [
  [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.3, 36.8], [12.6, 37.6]],
  [[8.4, 41.0], [9.6, 41.2], [9.8, 40.5], [9.6, 39.2], [9.0, 39.0], [8.4, 39.1], [8.4, 40.3]],
  [[9.4, 43.0], [9.6, 42.4], [9.4, 41.4], [8.8, 41.5], [8.6, 42.2], [8.7, 42.6]],
  [[23.5, 35.6], [24.5, 35.6], [26.3, 35.3], [26.2, 35.0], [24.7, 35.0], [23.5, 35.2]],
  [[32.3, 35.1], [32.9, 35.4], [34.6, 35.7], [34.0, 35.0], [33.0, 34.6], [32.4, 34.7]],
  [[2.4, 39.6], [3.1, 39.95], [3.5, 39.7], [3.2, 39.3], [2.6, 39.4]]];
const MED_RIDGES = [[[6.0, 45.8], [14.0, 46.4], 1.1, 100], [[-6.0, 32.5], [6.0, 35.2], 1.0, 60], [[30.0, 37.2], [36.0, 37.6], 0.9, 60], [[35.25, 31.0], [35.9, 34.2], 0.3, 40],
  [[10.0, 44.0], [16.0, 40.0], 0.45, 45], [[20.0, 41.5], [22.0, 38.0], 0.55, 50], [[-4.0, 42.8], [2.0, 42.7], 0.45, 60], [[33.6, 28.4], [34.2, 29.2], 0.5, 45], [[36.3, 33.2], [36.6, 34.6], 0.4, 50]];
const jsNz = (x, y) => Math.sin(x * 1.7 + Math.sin(y * 1.3)) * Math.sin(y * 2.1 + Math.sin(x * 0.9));
/* bake: grid of [sd (deg, negative = sea), height (world units)] over lon0..lon1, lat0..lat1 at `res` degrees */
function bakeMed(lon0, lon1, lat0, lat1, res) {
  const nx = Math.round((lon1 - lon0) / res) + 1, ny = Math.round((lat1 - lat0) / res) + 1, sd = new Float32Array(nx * ny), hh = new Float32Array(nx * ny);
  const edges = []; for (const P of MED_SEA_POLYS.concat(MED_ISLANDS)) for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; edges.push([a[0], a[1], b[0], b[1]]); }
  for (let j = 0; j < ny; j++) { const y = lat0 + j * res;
    for (let i = 0; i < nx; i++) { const x = lon0 + i * res; let d2 = 1e9, ins = false;
      for (const [ax, ay, bx, by] of edges) {
        if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) ins = !ins;
        const px = x - ax, py = y - ay, ex = bx - ax, ey = by - ay, t = cl((px * ex + py * ey) / (ex * ex + ey * ey), 0, 1), dx = px - ex * t, dy = py - ey * t, dd = dx * dx + dy * dy; if (dd < d2) d2 = dd; }
      const d = Math.sqrt(d2) * (ins ? -1 : 1); sd[j * nx + i] = d;
      let h = -6;
      if (d > 0) { h = 6 + 26 * sm(d / 2.2) + 7 * jsNz(x, y) * sm(d);
        for (const [a, b, w, hr] of MED_RIDGES) { const pax = x - a[0], pay = y - a[1], bax = b[0] - a[0], bay = b[1] - a[1], t = cl((pax * bax + pay * bay) / (bax * bax + bay * bay), 0, 1), q = Math.hypot(pax - bax * t, pay - bay * t); h += hr * Math.exp(-q * q / (w * w)) * (0.65 + 0.35 * jsNz(x * 2.3, y * 2.7)); }
        h *= sm(d / 0.12); }
      hh[j * nx + i] = h; } }
  const sample = (A, lon, lat) => { const fx = cl((lon - lon0) / res, 0, nx - 1.001), fy = cl((lat - lat0) / res, 0, ny - 1.001), i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j, k = j * nx + i;
    return (A[k] * (1 - u) + A[k + 1] * u) * (1 - v) + (A[k + nx] * (1 - u) + A[k + nx + 1] * u) * v; };
  const data = new Uint16Array(nx * ny * 4); for (let k = 0; k < nx * ny; k++) { data[4 * k] = THREE.DataUtils.toHalfFloat(sd[k]); data[4 * k + 1] = THREE.DataUtils.toHalfFloat(hh[k]); data[4 * k + 3] = THREE.DataUtils.toHalfFloat(1); }
  const tex = new THREE.DataTexture(data, nx, ny, THREE.RGBAFormat, THREE.HalfFloatType); tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
  return { tex, sd: (lon, lat) => sample(sd, lon, lat), h: (lon, lat) => sample(hh, lon, lat), nx, ny };
}
const MAP_GL = `uniform sampler2D uMap; uniform vec4 uBox;   // lon0, lat0, lon1-lon0, lat1-lat0
vec2 toLL(vec2 w){ return vec2(w.x / ${MAP_KX.toFixed(1)} + 16.0, 37.5 - w.y / ${MAP_KZ.toFixed(1)}); }
vec4 mapAt(vec2 ll){ return texture2D(uMap, (ll - uBox.xy) / uBox.zw); }
float nz(vec2 p){ return sin(p.x * 1.7 + sin(p.y * 1.3)) * sin(p.y * 2.1 + sin(p.x * 0.9)); }
float sdCap(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }`;
export function makeMedMap(o) {
  o = Object.assign({ segX: 520, segZ: 200, lon0: -10, lon1: 42, lat0: 28, lat1: 47, res: 0.05 }, o || {});
  const root = G(), W = (o.lon1 - o.lon0) * MAP_KX, D = (o.lat1 - o.lat0) * MAP_KZ, cx = ((o.lon0 + o.lon1) / 2 - 16) * MAP_KX, cz = -((o.lat0 + o.lat1) / 2 - 37.5) * MAP_KZ;
  const bake = bakeMed(o.lon0, o.lon1, o.lat0, o.lat1, o.res);
  const geo = new THREE.PlaneGeometry(W, D, o.segX, o.segZ).rotateX(-Math.PI / 2).translate(cx, 0, cz);
  const uBox = new THREE.Vector4(o.lon0, o.lat0, o.lon1 - o.lon0 + o.res * 0, o.lat1 - o.lat0);
  // texel centres: grid point i sits at lon0 + i*res -> uv = (i + 0.5) / nx; correct the box so ll maps onto texel centres
  uBox.set(o.lon0 - o.res * 0.5, o.lat0 - o.res * 0.5, bake.nx * o.res, bake.ny * o.res);
  const mat = new THREE.ShaderMaterial({ uniforms: { uSun: { value: SUN }, uT: { value: 0 }, uMap: { value: bake.tex }, uBox: { value: uBox } },
    vertexShader: MAP_GL + `
      varying vec2 vLL; varying float vH; varying vec3 vN;
      void main(){ vec2 ll = toLL(position.xz); float h = mapAt(ll).g; float e = 0.06;
        float hx = mapAt(ll + vec2(e, 0.0)).g - mapAt(ll - vec2(e, 0.0)).g, hz = mapAt(ll + vec2(0.0, e)).g - mapAt(ll - vec2(0.0, e)).g;
        vN = normalize(vec3(-hx / (2.0 * e * ${MAP_KX.toFixed(1)}), 1.0, hz / (2.0 * e * ${MAP_KZ.toFixed(1)}))); vLL = ll; vH = h;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, h, position.z, 1.0); }`,
    fragmentShader: MAP_GL + `
      uniform vec3 uSun; uniform float uT; varying vec2 vLL; varying float vH; varying vec3 vN;
      float sdNile(vec2 p){ float d = sdCap(p, vec2(31.1, 31.3), vec2(31.2, 30.0)); d = min(d, sdCap(p, vec2(31.2, 30.0), vec2(30.9, 28.6))); d = min(d, sdCap(p, vec2(30.9, 28.6), vec2(31.5, 27.0))); return min(d, sdCap(p, vec2(31.5, 27.0), vec2(32.7, 25.5))); }
      void main(){ vec2 p = vLL; float sd = mapAt(p).r; vec3 c;
        if (sd < 0.0) { float dp = -sd; c = vec3(0.52, 0.83, 0.94); if (dp > 0.35) c = vec3(0.38, 0.72, 0.90); if (dp > 1.3) c = vec3(0.29, 0.62, 0.85);
          if (p.x < -6.3) c = vec3(0.22, 0.47, 0.74);
          c = mix(c, vec3(0.80, 0.94, 1.0), step(0.985, sin(p.x * 7.0 + sin(p.y * 4.0) * 2.0 + uT) * sin(p.y * 6.0 - uT * 0.5)));
          c = mix(c, vec3(1.0), (1.0 - smoothstep(0.03, 0.08, dp)) * 0.9); }
        else {
          vec2 q = p + 0.35 * vec2(nz(p * 1.3), nz(p.yx * 1.1));
          bool eu = q.y > 36.2 && q.x < 26.3 && !(q.x > 25.6 && q.y < 40.4); bool af = q.y <= 36.2 && q.x < 32.4;
          vec3 cEu = vec3(0.56, 0.76, 0.42), cAf = vec3(0.92, 0.82, 0.56), cAs = vec3(0.76, 0.77, 0.50), cDes = vec3(0.91, 0.80, 0.57);
          c = eu ? cEu : (af ? cAf : cAs);
          if (!eu && !af && q.y < 31.0 && q.x > 35.0) c = cDes;
          if (!eu && !af && p.x < 36.2 && p.y > 31.0 && p.y < 34.6) c = vec3(0.62, 0.77, 0.42);
          if (af && q.y > 34.8 && q.x < 11.0) c = mix(c, vec3(0.70, 0.76, 0.46), 0.7);
          if (af) c = mix(c, c * 0.93, step(0.6, sin(p.x * 6.0 + sin(p.y * 3.0) * 2.0)) * smoothstep(33.0, 30.0, p.y));
          float nl = sdNile(p); c = mix(c, vec3(0.46, 0.70, 0.34), 1.0 - smoothstep(0.28, 0.42, nl));
          if (length((p - vec2(31.0, 30.9)) / vec2(1.0, 0.75)) < 1.0) c = vec3(0.46, 0.70, 0.34);
          c = mix(c, vec3(0.30, 0.62, 0.86), 1.0 - smoothstep(0.05, 0.09, nl));
          c = mix(c, vec3(0.64, 0.53, 0.40), smoothstep(40.0, 70.0, vH)); c = mix(c, vec3(0.98), smoothstep(98.0, 104.0, vH));
          float lit = step(0.0, dot(normalize(vN), uSun) - 0.5); c = mix(c * vec3(0.82, 0.82, 0.92), c, lit); }
        c = mix(c, vec3(0.15, 0.11, 0.10), 1.0 - smoothstep(0.018, 0.035, abs(sd)));
        gl_FragColor = vec4(c, 1.0); }` });
  const mesh = new THREE.Mesh(geo, mat); root.add(mesh);
  box(root, W + 80, 60, D + 80, M('#8a5a3a', '#b08a7a'), [cx, -40, cz], 6, null, 10);
  const lonlat = (lon, lat, up) => [(lon - 16) * MAP_KX, Math.max(bake.h(lon, lat), -6) + (up || 0), -(lat - 37.5) * MAP_KZ];
  const SANDP = [[31.0, 31.9], [32.0, 31.55], [33.2, 31.4], [33.95, 31.5], [34.25, 31.85], [34.5, 32.3], [34.68, 32.8], [34.9, 33.4], [35.2, 34.1]];
  const sandCurve = new THREE.CatmullRomCurve3(SANDP.map(([lo, la]) => V((lo - 16) * MAP_KX, -2, -(la - 37.5) * MAP_KZ)));
  const sandM = M('#f2d58e', '#d1b4a4', 0), grains = [];
  for (let i = 0; i < 70; i++) grains.push(part(root, ell(5, 4, 5, 8, 6), sandM, 1.0));
  const anchors = { europe: lonlat(12, 45.6, 20), africa: lonlat(14, 30.0, 20), asia: lonlat(38.5, 39.5, 20), med: lonlat(18, 35.5, 4), gibraltar: lonlat(-5.6, 35.95, 4), atlantic: lonlat(-9, 37, 4),
    nile: lonlat(31.2, 29.2, 10), nileMouth: lonlat(31.0, 31.9, 4), israelCoast: lonlat(34.55, 32.4, 4), yafo: lonlat(34.85, 32.05, 6), caesarea: lonlat(34.95, 32.5, 6), haifa: lonlat(35.1, 32.8, 6),
    cyprus: lonlat(33.3, 35.1, 10), italy: lonlat(15.5, 41.5, 20), greece: lonlat(22, 39.5, 20), blackSea: lonlat(34.5, 43.3, 4), west: lonlat(-6, 37, 4) };
  return { root, mesh, anchors, lonlat, mapH: bake.h, sdSea: bake.sd, sandCurve,
    update(t) { mat.uniforms.uT.value = t; },
    setSand(t, amount) { const n = Math.round(grains.length * cl(amount == null ? 1 : amount, 0, 1));
      grains.forEach((g, i) => { g.visible = i < n; if (!g.visible) return; const u = frac(i / grains.length + t * 0.05); const p = sandCurve.getPointAt(u); const j = ((i * 37) % 11 - 5) * 2.5;
        g.position.set(p.x + j, p.y + 3 + 2 * Math.sin(t * 3 + i), p.z + ((i * 53) % 9 - 4) * 2.5); }); } };
}

export const KIT = { makeTipa, makeGrain, makeFish, makeGull, makeCrab, makeGust, makeSea, makeOpenSea, makeBeach, makeKurkarCliff, makeSeaSection, makeHarbour, makeAncientPort, makeModernPort,
  makeMedMap, makeCedarShip, makeContainerShip, makeFishingBoat, makeTugboat, makeBreakwater, makeBottle, makeCurlWave, makeSplash, makeRain, makeFoamLine, makeSky, makeCloud, makeHills,
  makeGrassTuft, makeStone, makeShell, makeBush, makeTree, makeReeds, makeBirds, makeButterflies, makeFgBlur, makeBackpack, makeWaterBottle, makeMapScroll, makeWalkingStick, makeShadow };
