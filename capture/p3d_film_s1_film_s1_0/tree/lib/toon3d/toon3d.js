/* toon3d - building blocks of the approved 3D cel-shaded cartoon look (factored out of productions/donkey3d, 28/10/2026).
   Page needs: importmap "three" -> node_modules/three/build/three.module.js, and the 2D kit as globals
   (elements2d/core.js, animals.js, animals2.js, animals3.js, objects.js, bodies.js) because faces and gaits are the 2D code.
   Pieces:
   - toon(hex, {tint, hi, vc, regions})  own toon shader: lit + ONE shadow tone (base x tint) + small highlight band,
     light fixed in view space; `regions` = crisp colour areas in object space (cow spots, belly, blaze) without extra meshes.
   - part(parent, geo, mat, ow, pos, rot)  mesh + inverted-hull ink outline (ow = outline width, x cfg.OUT).
   - ell / tube / lathe / along / tubeAlong / leafGeo / bend / bumps  geometry helpers (y up, units = 2D body units).
   - sphereDecal / planeDecal + faceRig  the 2D face (K.animalFace, K.eyePair, K.mouth) rasterised live into canvas
     textures on patches that sit on the head -> same expressions / talk / blink as the 2D sheet.
   - quadruped(name, def) / biped(name, def) / prop(name, def): skeleton + gait (K.footPath / K.ik / K.hoofAng, feet locked
     while planted), body bob + pitch, head nod, idle breathing, ear + tail secondary motion. A character = data + a small
     build() that adds its own shapes on the standard bones (c.body, c.neck, c.head, c.jaw, c.ears, c.tail, c.tailTip).
   - field(scene) the approved bright meadow (sky, hills, trees, fence, path); turntable(scene) round stage.
   Pose object (all optional): {t, x, z, yaw, walk 0..1, ph (cycles; drive from distance / K.cycleLen), step, neckYaw,
     neckPitch, headYaw, headRot, headTilt, jaw, ear, earTwitch, tail, hop, squash, tilt, face:{expr, talk, blink, look, eye}} */
import * as THREE from 'three';
import { mergeVertices } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
THREE.ColorManagement.enabled = false;
export { THREE, RoundedBoxGeometry };
const K = window.K;
export const OL = '#261c19';
export const cfg = { OUT: 1.45, DU: 1 / 0.576 };
export const col = h => new THREE.Color(h);
export const V = (x, y, z) => new THREE.Vector3(x, y, z || 0);
export const frac = x => x - Math.floor(x);
export const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
export const cl = (v, a, b) => Math.max(a, Math.min(b, v));
export const D2R = Math.PI / 180;
export const kf = (t, ks) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const u = sm((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0])); return ks[i - 1][1] + (ks[i][1] - ks[i - 1][1]) * u; } return ks[ks.length - 1][1]; };

/* ---------------- materials ---------------- */
export const LIGHT = new THREE.Vector3(0.55, 0.62, 0.56).normalize();
const toonVS = `varying vec3 vN; varying vec3 vC; varying vec3 vP;
void main(){ vN = normalize(normalMatrix * normal); vP = position;
#ifdef USE_COLOR
 vC = color;
#else
 vC = vec3(1.0);
#endif
 gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const toonFS = `uniform vec3 uColor; uniform vec3 uTint; uniform vec3 uL; uniform float uHi;
#if NREG > 0
uniform vec3 uRp[NREG]; uniform vec3 uRr[NREG]; uniform vec3 uRc[NREG]; uniform float uRw[NREG];
#endif
varying vec3 vN; varying vec3 vC; varying vec3 vP;
void main(){ vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n; float d = dot(n, uL);
 vec3 base = uColor * vC;
#if NREG > 0
 for (int i = 0; i < NREG; i++) {
   float w = uRw[i] * (sin(vP.x * 0.083 + vP.y * 0.051 + float(i)) + 0.7 * sin(vP.z * 0.107 - vP.y * 0.073 + 2.0 * float(i)));
   if (uRr[i].x < 0.0) { if (vP.y < uRp[i].y + w * 8.0 && abs(vP.x - uRp[i].x) < uRr[i].y) base = uRc[i]; }
   else { vec3 q = (vP - uRp[i]) / uRr[i]; if (length(q) < 1.0 + w) base = uRc[i]; }
 }
#endif
 #ifdef STRIPES
 if (fract(atan(vP.z, vP.y) * STRIPES / 6.2831853) < 0.38) base *= 0.80;
 #endif
 float lit = smoothstep(-0.06, 0.0, d);
 vec3 c = mix(base * uTint, base, lit);
 c = mix(c, min(vec3(1.0), base * 1.07 + 0.025), uHi * smoothstep(0.80, 0.84, d));
 gl_FragColor = vec4(c, 1.0); }`;
/* regions: [{p:[x,y,z], r:[rx,ry,rz], c:'#hex', w:wobble}]  ellipsoid area in the part's local space,
            or {below:y, x0, xHalf, c}  everything under y (belly band). Later regions win. */
export function toon(hex, o) {
  o = o || {};
  const R = o.regions || [];
  const u = { uColor: { value: col(hex) }, uTint: { value: col(o.tint || '#bfb1bb') }, uL: { value: LIGHT }, uHi: { value: o.hi == null ? 1 : o.hi } };
  if (R.length) {
    u.uRp = { value: R.map(r => r.below != null ? V(r.x0 || 0, r.below, 0) : V(...r.p)) };
    u.uRr = { value: R.map(r => r.below != null ? V(-1, r.xHalf || 1e4, 0) : V(...r.r)) };
    u.uRc = { value: R.map(r => col(r.c)) };
    u.uRw = { value: R.map(r => r.w == null ? (r.below != null ? 0 : 0.06) : r.w) };
  }
  return new THREE.ShaderMaterial({ vertexShader: toonVS, fragmentShader: toonFS, vertexColors: !!o.vc, defines: Object.assign({ NREG: R.length }, o.stripes ? { STRIPES: o.stripes.toFixed(1) } : {}), uniforms: u });
}
const hullVS = `uniform float uW; void main(){ vec3 p = position + normal * uW; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
const hullFS = `uniform vec3 uC; void main(){ gl_FragColor = vec4(uC, 1.0); }`;
const hullMats = {};
export function hullMat(w) {
  return hullMats[w] || (hullMats[w] = new THREE.ShaderMaterial({ vertexShader: hullVS, fragmentShader: hullFS, side: THREE.BackSide,
    uniforms: { uW: { value: w }, uC: { value: col(OL) } } }));
}
// mesh + its inverted hull. geometry is baked (no object scale) so the hull width is uniform
export function part(parent, geo, mat, ow, pos, rot) {
  const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (rot) m.rotation.set(...rot);
  parent.add(m);
  if (ow > 0) {
    let hg = geo.clone(); for (const k of Object.keys(hg.attributes)) if (k !== 'position') hg.deleteAttribute(k);
    hg = mergeVertices(hg, 1e-3); hg.computeVertexNormals();
    const h = new THREE.Mesh(hg, hullMat(ow * cfg.OUT)); m.add(h); m.userData.hull = h;
  }
  return m;
}

/* ---------------- geometry (y up, units = the 2D body units) ---------------- */
export const ell = (rx, ry, rz, ws = 40, hs = 28) => new THREE.SphereGeometry(1, ws, hs).scale(rx, ry, rz);
// tapered tube hanging down from the origin (length along -y), round ends
export function tube(r0, r1, len, seg = 20) {
  const pts = [], N = 14;
  for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 * i / 6; pts.push(new THREE.Vector2(Math.sin(a) * r1 + 0.001, -len - Math.cos(a) * r1 * 0.6)); }
  for (let i = 1; i < N; i++) { const t = i / N; pts.push(new THREE.Vector2(r1 + (r0 - r1) * t, -len * (1 - t))); }
  for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 * i / 6; pts.push(new THREE.Vector2(Math.cos(a) * r0 + 0.001, Math.sin(a) * r0 * 0.6)); }
  return new THREE.LatheGeometry(pts, seg);
}
export function lathe(prof, seg = 32) { return new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(Math.max(0.001, p[0]), p[1])), seg); }
// orient a geometry built along +y between points a and b
export function along(geo, a, b) {
  const v = new THREE.Vector3().subVectors(b, a), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
  geo.applyQuaternion(q); geo.translate(a.x, a.y, a.z); return geo;
}
/* tube along a smooth curve through pts (Vector3), radius rf(t) (number or fn), round/pointed ends.
   o.flat: squash the cross-section along the curve binormal (feathers, flat horns); o.tip: radius at the end relative */
export function tubeAlong(pts, rf, o) {
  o = o || {};
  const segs = o.segs || 40, radial = o.radial || 14;
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const g = new THREE.TubeGeometry(curve, segs, 1, radial, false);
  const p = g.attributes.position, fr = curve.computeFrenetFrames(segs, false);
  const rr = typeof rf === 'function' ? rf : (t => rf * (1 - (1 - (o.tip == null ? 1 : o.tip)) * t));
  const cap = o.cap == null ? 0.06 : o.cap;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, c = curve.getPointAt(t);
    let k = rr(t);
    if (t < cap) k *= Math.sqrt(Math.max(0.0004, t / cap)) * 0.9 + 0.1 * (t / cap);
    if (o.round !== false && t > 1 - cap) k *= Math.sqrt(Math.max(0.0004, (1 - t) / cap));
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j, v = V(p.getX(idx), p.getY(idx), p.getZ(idx)).sub(c);
      if (o.flat) { const b = fr.binormals[i], db = v.dot(b); v.addScaledVector(b, -db * (1 - o.flat)); }
      v.multiplyScalar(k).add(c); p.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals(); return g;
}
// leaf / ear: lathe along +y, width w, length len, flattened in x by `flat`
export function leafGeo(len, w, flat = 0.6, pw = 0.62, seg = 20) {
  const prof = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; prof.push([w * Math.pow(Math.sin(Math.PI * Math.pow(t, pw)), 0.9) + 0.01, t * len]); }
  const g = lathe(prof, seg); g.scale(flat, 1, 1); return g;
}
// bend a geometry built along +y toward +x (k = total angle in radians over length len)
export function bend(geo, k, len) {
  if (Math.abs(k) < 1e-4) return geo;
  const rho = len / k, p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), a = y / rho; p.setXY(i, rho - (rho - x) * Math.cos(a), (rho - x) * Math.sin(a)); }
  geo.computeVertexNormals(); return geo;
}
// cone tuft from base point toward dir (Vector3), flattened sideways
export function cone(r, len, flat = 0.6, seg = 12) { const g = new THREE.ConeGeometry(r, len, seg); g.scale(1, 1, flat); g.translate(0, len / 2, 0); return g; }
export function aim(geo, base, dir) { geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize())); geo.translate(base.x, base.y, base.z); return geo; }
/* cloud of bumps over an ellipsoid (wool): returns list of [x,y,z,r]. n points (fibonacci), keep(x,y,z) filter */
export function bumps(c, R, n, rb, keep, jit = 0.18, inset = 0.86) {
  const out = [], ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - 2 * (i + 0.5) / n, rr = Math.sqrt(1 - y * y), a = i * ga;
    const u = V(Math.cos(a) * rr, y, Math.sin(a) * rr);
    if (keep && !keep(u)) continue;
    const j = 1 + jit * Math.sin(i * 12.9898) * 0.5;
    out.push([c[0] + u.x * R[0] * inset, c[1] + u.y * R[1] * inset, c[2] + u.z * R[2] * inset, rb * j]);
  }
  return out;
}

/* ---------------- face: the 2D drawing as live canvas textures ---------------- */
const decVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const decFS = `uniform sampler2D uMap; varying vec2 vUv; void main(){ vec4 c = texture2D(uMap, vUv); if (c.a < 0.03) discard; gl_FragColor = vec4(c.rgb / max(c.a, 1e-3), c.a); }`;
function decalMat(tex) {
  return new THREE.ShaderMaterial({ vertexShader: decVS, fragmentShader: decFS, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, uniforms: { uMap: { value: tex } } });
}
/* sphere patch facing +x on an ellipsoid (centre, radii) slightly above its surface; S = {phi (half width rad), th0, th1
   (polar range from the top), cx, cy (drawing coords of the patch centre = the +x point on the equator), k, cw, du} */
export function sphereDecal(parent, center, rad, S) {
  const k = S.k || 1.012, du = S.du || cfg.DU, cw = S.cw || 640;
  const g = new THREE.SphereGeometry(1, 48, 32, Math.PI - S.phi, S.phi * 2, S.th0, S.th1 - S.th0).scale(rad[0] * k, rad[1] * k, rad[2] * k);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = Math.round(cw * (rad[1] * (S.th1 - S.th0)) / (rad[2] * S.phi * 2));
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = 4; tex.premultiplyAlpha = true;
  const m = new THREE.Mesh(g, decalMat(tex)); m.position.set(...center); parent.add(m);
  const w = rad[2] * S.phi * 2 * du, y0 = S.cy - (Math.PI / 2 - S.th0) * rad[1] * du, h = (S.th1 - S.th0) * rad[1] * du;
  return { mesh: m, cv, tex, cache: {}, key: '', vb: [S.cx - w / 2, y0, w, h] };
}
// flat patch (book cover, coin face): plane in the y-z plane facing +x, size w (z) x h (y); drawing centre cx, cy
export function planeDecal(parent, pos, w, h, S) {
  S = S || {}; const du = S.du || cfg.DU, cw = S.cw || 640;
  const g = new THREE.PlaneGeometry(w, h); g.rotateY(Math.PI / 2);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = Math.round(cw * h / w);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = 4; tex.premultiplyAlpha = true;
  const m = new THREE.Mesh(g, decalMat(tex)); m.position.set(...pos); if (S.rot) m.rotation.set(...S.rot); parent.add(m);
  const cx = S.cx || 0, cy = S.cy || 0;
  return { mesh: m, cv, tex, cache: {}, key: '', vb: [cx - w * du / 2, cy - h * du / 2, w * du, h * du] };
}
const svgDoc = (inner, box, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${box.map(v => v.toFixed(2)).join(' ')}" preserveAspectRatio="none">${inner}</svg>`;
function loadImg(svg) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }); }
/* decals: {name: decal}; svgFn(st) -> {name: svg inner in drawing coords} */
export function faceRig(decals, svgFn) {
  return {
    decals,
    async set(st) {
      st = Object.assign({ expr: 'neutral' }, st || {});
      const look = (st.look || [0, 0]).map(v => Math.round(v * 8) / 8);
      const key = [st.expr, st.talk || '-', st.blink ? 1 : 0, look.join(','), JSON.stringify(st.eye || 0), JSON.stringify(st.mo || 0), st.tongue ? 1 : 0].join('|');
      let F = null;
      for (const name of Object.keys(decals)) {
        const dec = decals[name], k2 = key + name;
        if (dec.key === k2) continue;
        let im = dec.cache[k2];
        if (!im) { F = F || svgFn(Object.assign({}, st, { look })); im = await loadImg(svgDoc(F[name] || '', dec.vb, dec.cv.width, dec.cv.height)); dec.cache[k2] = im; }
        const c = dec.cv.getContext('2d'); c.clearRect(0, 0, dec.cv.width, dec.cv.height); if (im) c.drawImage(im, 0, 0, dec.cv.width, dec.cv.height);
        dec.tex.needsUpdate = true; dec.key = k2;
      }
    },
  };
}
// standard features: eyes (+brows) and a mouth, using the 2D kit presets
export function eyesSvg(st, e1, e2, lid, bw, browCol, per) {
  const f = K.animalFace(st);
  if (per && per[st.expr]) per = per[st.expr]; else if (per && (per.neutral || per.happy)) per = null;
  return K.eyePair(f, Object.assign({}, e1), Object.assign({}, e2), lid, bw, browCol || OL, per);
}
export function mouthSvg(st, mo) {
  const f = K.animalFace(st), m = f.m, ex = st.expr;
  return K.mouth(Object.assign({ open: m.open, smile: m.smile, round: m.round, teeth: m.round ? 0 : (mo.teeth == null ? 10 : mo.teeth),
    skew: ex === 'neutral' && !st.talk ? (mo.skewN == null ? -4 : mo.skewN) : 0 }, mo, { w: mo.w * (m.wide || 1) }));
}
export const jawOf = talk => talk ? ({ A: 1, O: 0.8, E: 0.5, X: 0.15 }[talk] || 0) : 0;
export const taper = (...a) => K.taper(...a);

/* ---------------- characters ---------------- */
function setSeg(bone, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  bone.position.set(a[0], a[1], bone.position.z); bone.rotation.set(0, 0, Math.atan2(dx, -dy)); bone.scale.set(1, len / bone.userData.len, 1);
}
// helper bag passed to build(): make bones / parts quickly
function helpers(c) {
  return {
    bone(parent, pos) { const b = new THREE.Bone(); if (pos) b.position.set(...pos); parent.add(b); return b; },
    // torso: lathe along x (superellipse profile), local shape fn, at [x, y] on c.body
    torso(o) {
      const L = o.L, R = o.R, e = o.e || 2.5, prof = [], nL = o.nL || 40;
      for (let i = 0; i <= nL; i++) { const t = -1 + 2 * i / nL; prof.push([R * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), e)), 1 / e), t * L / 2]); }
      const g = lathe(prof, o.seg || 48); g.rotateZ(-Math.PI / 2); g.scale(1, 1, o.zs || 0.8);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        if (o.shape) [x, y, z] = o.shape(x, y, z, L, R);
        else { if (y > 0) y *= 0.86 + 0.06 * Math.cos(x / (L / 2) * 1.4); else y *= 1.0 + 0.08 * Math.max(0, -x / (L / 2) + 0.2); }
        p.setXYZ(i, x, y, z);
      }
      g.computeVertexNormals();
      c.torso = part(c.body, g, o.mat, o.ow || 3.2, [o.at[0], o.at[1], 0]);
      return c.torso;
    },
    // neck: lathe from base to top (rel), profile radii [base, quarter, 0.6, top]
    neck(base, top, r, zs, mat, ow) {
      c.neck = new THREE.Bone(); c.neck.position.set(...base); c.body.add(c.neck);
      const T = V(...top), len = T.length();
      const ng = lathe([[0.01, -10], [r[0] * 0.92, -2], [r[0], len * 0.25], [r[1], len * 0.6], [r[2], len], [r[3], len + 12], [0.01, len + 18]], 28);
      ng.scale(1, 1, zs || 0.78); along(ng, V(0, 0, 0), T);
      c.neckMesh = part(c.neck, ng, mat, ow || 3.2);
      c.NECK_TOP = T;
      return c.neck;
    },
    head(scale, parent, pos) {
      c.head = new THREE.Bone(); c.head.position.copy(pos ? V(...pos) : c.NECK_TOP); c.head.scale.setScalar(scale || 1.4); (parent || c.neck).add(c.head);
      c.jaw = new THREE.Bone(); c.jaw.position.set(0, 20, 0); c.head.add(c.jaw); c.jaw.userData.y0 = 20;
      return c.head;
    },
    ear(parent, pos, geoOut, matOut, geoIn, matIn, ow) {
      const b = new THREE.Bone(); b.position.set(...pos); parent.add(b);
      part(b, geoOut, matOut, ow || 2.4); if (geoIn) part(b, geoIn, matIn, 0);
      return b;
    },
  };
}

/* ----- quadruped -----
   def: {spec (K.BODY key, default name), legZ, legR {hind, fore, knee, low0, low1, cap}, legMat, hoofMat, paw,
         build(c, H) -> shapes on c.body / c.neck / c.head / c.jaw, sets c.face, c.ears [{b, rot:[x,y,z], k}], c.tail, c.tailTip,
         ear(c, po, eb), tail(c, po, ts), extra(c, po) } */
export function quadruped(name, def) {
  const sp = K.BODY[def.spec || name], c = { name, sp, def, kind: 'quad', ears: [] };
  c.root = new THREE.Group(); c.body = new THREE.Bone(); c.root.add(c.body);
  const H = helpers(c);
  def.build(c, H);
  // legs: upper > lower > hoof bones in the 2D side-view plane; rebuilt for their standing length and scaled per frame
  const HL = { w: sp.legW[1] * 0.62, h: sp.hoofH };
  const lr = Object.assign({ hind: sp.legW[0] * 0.61, fore: sp.legW[0] * 0.5, knee: sp.legW[1] * 0.62, low0: sp.legW[1] * 0.6, low1: sp.legW[1] * 0.55, cap: sp.legW[1] * 0.64 }, def.legR || {});
  const Z = def.legZ || 25;
  c.legs = [{ x: sp.hindX, o: 0, k: -1, z: Z }, { x: sp.foreX, o: 0.6, k: 1, z: Z },
    { x: sp.hindX + 6, o: 0.5, k: -1, z: -Z }, { x: sp.foreX + 6, o: 0.1, k: 1, z: -Z }].map(L => {
    const up = new THREE.Bone(), lo = new THREE.Bone(), hf = new THREE.Bone();
    c.root.add(up); c.root.add(lo); c.root.add(hf);
    const hipY = sp.legLen + 14, stand = hipY - HL.h, Lt = stand * (sp.legK || 1.035), r1 = L.k < 0 ? 0.54 : 0.5;
    L.L1 = Lt * r1; L.L2 = Lt - L.L1;
    const lm = (L.k < 0 ? def.hindMat : def.foreMat) || def.legMat;
    for (const [bone, len, rA, rB] of [[up, L.L1, L.k < 0 ? lr.hind : lr.fore, lr.knee], [lo, L.L2, lr.low0, lr.low1]]) {
      bone.userData.m = part(bone, tube(rA, rB, len), lm, 2.8); bone.userData.len = len;
    }
    part(lo, ell(lr.cap, lr.cap, lr.cap, 18, 12), lm, 2.6);
    let hg;
    if (def.paw || sp.paw) { hg = ell(HL.w * 1.35, HL.h * 0.62, HL.w * 1.12, 24, 14); hg.translate(HL.w * 0.55, -HL.h * 0.55, 0); }
    else { hg = new THREE.CylinderGeometry(HL.w * 0.95, HL.w * 1.25, HL.h, 18); hg.translate(0, -HL.h / 2, 0); hg.scale(1.12, 1, 1); }
    part(hf, hg, def.hoofMat, 2.4);
    up.position.z = lo.position.z = hf.position.z = L.z;
    return Object.assign(L, { up, lo, hf });
  });
  c.HL = HL;
  c.cycle = K.cycleLen(def.spec || name);
  c.pose = po => poseQuad(c, po);
  return c;
}
function poseQuad(c, po) {
  const sp = c.sp, def = c.def, HL = c.HL;
  const walk = po.walk || 0, ph = po.ph || 0, A = sp.bobAmp * walk, t = po.t || 0;
  const bob2 = A * 0.7 * Math.cos(4 * Math.PI * (ph - 0.16)) + (po.bob || 0);   // 2D convention: + = down
  const deg2 = 1.3 * walk * Math.sin(2 * Math.PI * (ph - 0.1)) + (po.pitch || 0);
  const breathe = Math.sin(t * 2.1);
  c.root.position.set(po.x || 0, 0, po.z || 0); c.root.rotation.set(0, po.yaw || 0, 0);
  const pr = -deg2 * D2R, piv = sp.legLen;
  c.body.rotation.z = pr; c.body.position.x = piv * Math.sin(pr); c.body.position.y = -bob2 + piv * (1 - Math.cos(pr));
  if (c.torso) c.torso.scale.set(1, 1 + 0.012 * breathe, 1 + 0.018 * breathe);
  const S = sp.stride, duty = sp.duty || 0.62;
  for (const L of c.legs) {
    const hp = [L.x, -sp.legLen + bob2], rr = deg2 * D2R, cy = -sp.legLen;
    const hx = (hp[0]) * Math.cos(rr) - (hp[1] - cy) * Math.sin(rr), hy = cy + hp[0] * Math.sin(rr) + (hp[1] - cy) * Math.cos(rr) - 14;
    const f0 = K.footPath(ph + L.o, S, duty, sp.lift);
    const g = { x: L.x + f0.x * walk, y: f0.y * walk, st: walk > 0.05 ? f0.st : 0, q: walk > 0.05 ? f0.q : -1 };
    if (po.step && walk <= 0.05) { const s2 = K.footPath(po.step + L.o, 0, 0.6, 14); g.y = s2.y; g.q = s2.q; g.st = s2.st; }
    const ang = K.hoofAng(g, sp.curl); let ank;
    if (g.q < 0 && ang > 0.01) { const a = ang * D2R, tx = HL.w * (sp.paw ? 2.0 : 1.3), ty = HL.h; ank = [g.x + tx - (tx * Math.cos(a) - ty * Math.sin(a)), g.y - (tx * Math.sin(a) + ty * Math.cos(a))]; }
    else ank = [g.x, g.y - HL.h];
    const kn = K.ik([hx, hy], ank, L.L1, L.L2, L.k);
    const to3 = p => [p[0], -p[1]];
    setSeg(L.up, to3([hx, hy]), to3(kn)); setSeg(L.lo, to3(kn), to3(ank));
    L.hf.position.set(ank[0], -ank[1], L.z); L.hf.rotation.set(0, 0, -ang * D2R);
  }
  const nod = -3.2 * walk * Math.cos(4 * Math.PI * (ph - 0.22));
  if (c.neck) c.neck.rotation.set(0, po.neckYaw || 0, (-(po.neckPitch || 0) - nod * 0.4) * D2R);
  if (c.head) c.head.rotation.set((po.headTilt || 0) * D2R, po.headYaw || 0, (-(po.headRot || 0) - nod * 0.6 + 0.6 * breathe) * D2R);
  if (c.jaw) c.jaw.position.y = c.jaw.userData.y0 - (po.jaw || 0) * (def.jawDrop || 3);
  const ea = po.ear || 0, eb = 3 * walk * Math.sin(4 * Math.PI * (ph - 0.32)), tw = po.earTwitch || 0;
  for (const E of c.ears) {
    const s = E.side || 1;
    E.b.rotation.set(E.rot[0] - tw * 0.5 * (E.tw == null ? 1 : E.tw), E.rot[1], E.rot[2] + ((eb * (E.k || 1)) + ea * s) * D2R * (E.ka || 1));
    if (E.flop) E.b.rotation.x += E.flop * (0.06 * Math.sin(4 * Math.PI * (ph - 0.4)) * walk + 0.03 * Math.sin(t * 2.4 + s));
  }
  const ts = (po.tail || 0) + 9 * walk * Math.sin(2 * Math.PI * (ph - 0.3));
  if (c.tail) { const T = def.tailMove || {}; c.tail.rotation.set(0.22 * Math.sin(t * 1.7 + ph * 6.28) * (0.4 + walk) * (T.sway == null ? 1 : T.sway), (T.yaw || 0), -ts * D2R * (T.k || 1.2) + (T.base || -0.08)); }
  if (c.tailTip) c.tailTip.rotation.z = -0.25 * Math.sin(t * 2.3 + ph * 6.28 - 0.8);
  if (def.extra) def.extra(c, po, { walk, ph, t, breathe, bob2, deg2 });
}

/* ----- biped (rooster): two-leg walk, ankle bends back, toes curl in swing, the head holds still and thrusts once per step.
   def: {stride, build(c, H) (c.body pivot (0,70); sets c.neckB, c.head, c.jaw, c.face, c.tail, c.wings), legMat, hipY, legLen} */
export function biped(name, def) {
  const c = { name, def, kind: 'bird', ears: [] };
  c.root = new THREE.Group(); c.body = new THREE.Bone(); c.root.add(c.body);
  const H = helpers(c);
  def.build(c, H);
  const LL = def.legLen || 62;
  c.legs = [{ o: 0, z: 18, dx: -8 }, { o: 0.5, z: -18, dx: 8 }].map(L => {
    const up = new THREE.Bone(), lo = new THREE.Bone(), ft = new THREE.Bone();
    c.root.add(up); c.root.add(lo); c.root.add(ft);
    L.L1 = L.L2 = LL * 1.04 / 2;
    up.userData.m = part(up, tube(8, 5.5, L.L1), def.thighMat || def.legMat, 2.4); up.userData.len = L.L1;
    lo.userData.m = part(lo, tube(5, 4.4, L.L2), def.legMat, 2.2); lo.userData.len = L.L2;
    for (const [a, l] of [[0, 30], [0.5, 24], [-0.5, 24]]) { const g = tube(4.2, 2.6, l, 10); g.rotateZ(Math.PI / 2); g.rotateY(a); part(ft, g, def.legMat, 2); }
    const gb = tube(3.8, 2.6, 14, 10); gb.rotateZ(-Math.PI / 2); part(ft, gb, def.legMat, 2);
    part(ft, ell(5.5, 5, 5.5, 14, 10), def.legMat, 1.8);
    up.position.z = lo.position.z = ft.position.z = L.z;
    return Object.assign(L, { up, lo, ft });
  });
  c.cycle = (def.stride || 34) / 0.6;
  c.pose = po => {
    const walk = po.walk || 0, ph = po.ph || 0, t = po.t || 0, duty = 0.6, S = def.stride || 34;
    const bob = 3.2 * walk * Math.cos(4 * Math.PI * (ph - 0.12)) + (po.bob || 0);
    const deg = (po.pitch || 0) + 2.5 * walk * Math.sin(2 * Math.PI * ph) + 4 * walk;
    const breathe = Math.sin(t * 2.4);
    c.root.position.set(po.x || 0, 0, po.z || 0); c.root.rotation.set(0, po.yaw || 0, 0);
    const pr = -deg * D2R, piv = 70;
    c.body.rotation.z = pr; c.body.position.x = piv * Math.sin(pr); c.body.position.y = -bob + piv * (1 - Math.cos(pr));
    if (c.torso) c.torso.scale.set(1, 1 + 0.015 * breathe, 1 + 0.02 * breathe);
    const cyc = S / duty, u = frac(ph * 2 + 0.15), A = 0.7 * cyc / 2 * 0.8;
    let hdx, hdy;
    if (u < 0.7) { hdx = A * (0.5 - u / 0.7); hdy = 0; } else { const v = sm((u - 0.7) / 0.3); hdx = -A / 2 + A * v; hdy = 5 * Math.sin(Math.PI * v); }
    for (const L of c.legs) {
      const hip = [L.dx, -66 + bob];
      const f0 = K.footPath(ph + L.o, S, duty, 20);
      const g = { x: L.dx + f0.x * walk, y: f0.y * walk, q: walk > 0.05 ? f0.q : -1, st: walk > 0.05 ? f0.st : 0 };
      if (po.step && walk <= 0.05) { const s2 = K.footPath(po.step + L.o, 0, 0.6, 12); g.y = s2.y; g.q = s2.q; g.st = s2.st; }
      const ankle = [g.x, g.y - 4];
      const kn = K.ik(hip, ankle, L.L1, L.L2, -1);
      const to3 = p => [p[0], -p[1]];
      setSeg(L.up, to3(hip), to3(kn)); setSeg(L.lo, to3(kn), to3(ankle));
      const a = g.q >= 0 ? (g.q < 0.75 ? 55 * Math.sin(Math.PI * g.q / 0.75) : -10 * Math.sin(Math.PI * (g.q - 0.75) / 0.25)) : (g.st > 0.85 ? 18 * sm((g.st - 0.85) / 0.15) : 0);
      L.ft.position.set(ankle[0], -ankle[1], L.z); L.ft.rotation.set(0, 0, -a * D2R);
    }
    if (c.neckB) {
      c.neckB.position.x = c.neckB.userData.x0 + hdx * walk * 0.8; c.neckB.position.y = c.neckB.userData.y0 - hdy * walk;
      c.neckB.rotation.set(0, po.neckYaw || 0, (-(po.neckPitch || 0) + deg) * D2R);   // head stays level while the body pitches
    }
    if (c.head) c.head.rotation.set((po.headTilt || 0) * D2R, po.headYaw || 0, (-(po.headRot || 0) - 4 * walk * Math.sin(Math.PI * 2 * u) + 0.8 * breathe) * D2R);
    if (c.jaw) c.jaw.rotation.z = -(po.jaw || 0) * 0.42;
    const tw = (po.tail || 0) + 6 * walk * Math.sin(2 * Math.PI * ph);
    if (c.tail) c.tail.rotation.set(0.06 * Math.sin(t * 1.6), 0, tw * D2R);
    const fl = po.flap || 0;
    if (c.wings) c.wings.forEach((w, i) => { w.rotation.set((i ? 1 : -1) * fl * 0.9, 0, fl * 0.5 + 0.03 * walk * Math.sin(2 * Math.PI * ph)); });
    if (c.comb) c.comb.rotation.z = -0.06 * Math.sin(t * 3 + ph * 6.28) * (0.5 + walk);
    if (def.extra) def.extra(c, po, { walk, ph, t, breathe });
  };
  return c;
}

/* ----- prop with a face (sefer, kettle, stone, coin): hop / tilt / squash / talk bounce.
   po.hop = phase in hops (drive from distance / c.cycle), po.walk = 0..1 hopping amount */
export function prop(name, def) {
  const c = { name, def, kind: 'prop', ears: [] };
  c.root = new THREE.Group(); c.body = new THREE.Group(); c.root.add(c.body);
  c.inner = new THREE.Group(); c.body.add(c.inner);
  def.build(c, helpers(c));
  c.cycle = def.hopLen || 90;
  c.pose = po => {
    const walk = po.walk || 0, t = po.t || 0, hp = frac(po.ph || 0), H0 = def.hopH || 46;
    let y = 0, sq = 0, tilt = po.tilt || 0;
    if (walk > 0.01) {
      // 0..0.18 crouch, 0.18..0.82 air, 0.82..1 land squash
      if (hp < 0.18) sq = -0.12 * Math.sin(Math.PI * hp / 0.18);
      else if (hp < 0.82) { const u = (hp - 0.18) / 0.64; y = H0 * 4 * u * (1 - u); sq = 0.08 * Math.sin(Math.PI * u) ; tilt += -8 * Math.sin(Math.PI * 2 * u) * (def.tiltK || 1); }
      else sq = -0.16 * Math.sin(Math.PI * (hp - 0.82) / 0.18);
      y *= walk; sq *= walk;
    }
    if (po.step) { const u = frac(po.step); y += 10 * Math.sin(Math.PI * u); }
    const talkB = po.face && po.face.talk ? 0.035 * (po.jaw || 0) : 0, br = 0.012 * Math.sin(t * 2.2);
    sq += (po.squash || 0) + talkB + br;
    c.root.position.set(po.x || 0, 0, po.z || 0); c.root.rotation.set(0, po.yaw || 0, 0);
    c.body.position.y = y;
    c.body.rotation.set((po.headTilt || 0) * D2R * 0.5, po.headYaw || 0, -(tilt + (po.headRot || 0) * 0.5) * D2R);
    c.inner.scale.set(1 - sq * 0.5, 1 + sq, 1 - sq * 0.5);
    if (def.extra) def.extra(c, po, { walk, t, hp });
  };
  return c;
}

/* ---------------- sets ---------------- */
export function field(scene) {
  scene.background = new THREE.Color(0x8fd0ec);
  const mGrass = toon('#8cc068', { tint: '#c9d3bd', hi: 0 }), mHill1 = toon('#9ccd6c', { tint: '#c8d6c0', hi: 0 }), mHill2 = toon('#7fb85a', { tint: '#c8d6c0', hi: 0 }),
    mTrunk = toon('#8a5a3a'), mLeaf = toon('#5fae4e', { tint: '#c4cfc0' }), mPost = toon('#c99a62'), mPath = toon('#ead7a4', { tint: '#d8cfc0', hi: 0 }),
    mApple = toon('#e2483a'), mCloud = toon('#ffffff', { tint: '#dfe6f2', hi: 0 });
  const g = new THREE.CircleGeometry(9000, 64).rotateX(-Math.PI / 2); scene.add(new THREE.Mesh(g, mGrass));
  const pg = new THREE.PlaneGeometry(4000, 180).rotateX(-Math.PI / 2); const pm = new THREE.Mesh(pg, mPath); pm.position.set(0, 0.6, 30); scene.add(pm);
  for (const [x, z, rx, ry, rz, m] of [[-2600, -3600, 2600, 700, 1200, mHill1], [1800, -4200, 3000, 900, 1300, mHill2], [-200, -5200, 2600, 1100, 1000, mHill1],
    [3600, -2400, 1800, 520, 900, mHill1], [-4200, -1800, 1600, 480, 900, mHill2], [400, 4800, 3000, 600, 900, mHill2]])
    part(scene, ell(rx, ry, rz, 48, 24), m, 10, [x, 0, z]);
  const tree = (x, z, s) => { const g0 = new THREE.Group(); g0.position.set(x, 0, z); g0.scale.setScalar(s); scene.add(g0);
    part(g0, tube(18, 26, 170, 14).translate(0, 170, 0), mTrunk, 4);
    for (const [a, b, c2, r] of [[0, 250, 0, 95], [-60, 215, 30, 70], [62, 220, -20, 74], [10, 300, -10, 70]]) part(g0, ell(r, r * 0.92, r), mLeaf, 4, [a, b, c2]);
    for (const [a, b, c2] of [[60, 270, 50], [-40, 250, 80], [20, 320, 50]]) part(g0, ell(10, 10, 10, 12, 8), mApple, 2, [a, b, c2]); };
  tree(-760, -1300, 1.2); tree(980, -900, 1.4); tree(-1500, -1500, 1.6); tree(420, 1700, 1.0); tree(1700, -400, 1.1);
  const fence = new THREE.Group(); scene.add(fence);
  for (let i = -14; i <= 14; i++) part(fence, new THREE.BoxGeometry(14, 120, 14).translate(0, 60, 0), mPost, 3, [i * 150, 0, -330]);
  for (const y of [55, 100]) part(fence, new THREE.BoxGeometry(150 * 28, 12, 8).translate(0, y, 0), mPost, 3, [0, 0, -330]);
  for (const [x, y, z, s] of [[-1600, 1500, -3800, 1.4], [900, 1800, -4200, 1.8], [2600, 1350, -3000, 1.1]]) {
    const g0 = new THREE.Group(); g0.position.set(x, y, z); g0.scale.setScalar(s); scene.add(g0);
    for (const [a, b, r] of [[0, 0, 90], [-90, -20, 65], [95, -18, 70], [40, 30, 60]]) part(g0, ell(r, r * 0.75, r * 0.6), mCloud, 6, [a, b, 0]);
  }
  return { fence };
}
// round wooden stage on the meadow (gallery turntable). returns the rotating group
export function turntable(scene, R) {
  scene.background = new THREE.Color(0x8fd0ec);
  const mGrass = toon('#8cc068', { tint: '#c9d3bd', hi: 0 }), mHill1 = toon('#9ccd6c', { tint: '#c8d6c0', hi: 0 }), mHill2 = toon('#7fb85a', { tint: '#c8d6c0', hi: 0 }),
    mTop = toon('#ead7a4', { tint: '#d8cfc0', hi: 0 }), mSide = toon('#c99a62', { tint: '#cbb8b0', hi: 0 }), mRing = toon('#e3b24c', { hi: 0 }), mCloud = toon('#ffffff', { tint: '#dfe6f2', hi: 0 });
  scene.add(new THREE.Mesh(new THREE.CircleGeometry(12000, 64).rotateX(-Math.PI / 2), mGrass));
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, d = 6200 + 900 * Math.sin(i * 2.3); part(scene, ell(2200, 650 + 250 * Math.sin(i * 1.7), 1200, 48, 24), i % 2 ? mHill1 : mHill2, 10, [Math.cos(a) * d, 0, Math.sin(a) * d]); }
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 0.3, d = 7000; const g0 = new THREE.Group(); g0.position.set(Math.cos(a) * d, 1700 + 300 * Math.sin(i * 3.1), Math.sin(a) * d); g0.lookAt(0, g0.position.y, 0); g0.scale.setScalar(1.5); scene.add(g0);
    for (const [x, y, r] of [[0, 0, 90], [-90, -20, 65], [95, -18, 70], [40, 30, 60]]) part(g0, ell(r * 0.6, r * 0.75, r), mCloud, 6, [0, y, x]); }
  const tt = new THREE.Group(); scene.add(tt);
  part(tt, new THREE.CylinderGeometry(R, R + 30, 40, 96).translate(0, -20, 0), mSide, 6);
  const top = new THREE.Mesh(new THREE.CircleGeometry(R - 2, 96).rotateX(-Math.PI / 2), mTop); top.position.y = 0.5; tt.add(top);
  const ring = new THREE.Mesh(new THREE.RingGeometry(R - 70, R - 52, 96).rotateX(-Math.PI / 2), mRing); ring.position.y = 1; tt.add(ring);
  tt.position.y = 0;
  return tt;
}
export function orbitCam(cam, c) { cam.position.set(c.tx + c.R * Math.sin(c.az), c.h, (c.tz || 0) + c.R * Math.cos(c.az)); cam.lookAt(c.tx, c.ty, c.tz || 0); }
export function renderer(W, H, el, dpr) {
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(dpr || 1); r.setSize(W, H, false); r.domElement.style.width = W + 'px'; r.domElement.style.height = H + 'px';
  r.outputColorSpace = THREE.LinearSRGBColorSpace; el.appendChild(r.domElement); return r;
}
