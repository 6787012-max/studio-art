/* siach_20261030 - 3D cel-shaded film, 246.5 s, 15 shots. Deterministic: every frame is a pure function of t.
   Worlds: TW tower+stairs, RD road+bus, HL study hall, HS rainy street, HI hill path, MS mist meadow, DS dusk desert.
   People only through people.js. No text, letters or digits anywhere. */
import { THREE, sm, cl, kf, D2R, part, ell, lathe, RoundedBoxGeometry } from '../../lib/toon3d/toon3d.js';
import { mergeGeometries } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import * as P from './people.js';
import * as PR from './props.js';
import { M, glow, box, bas, WOOD, WOOD2, WOODD, STONE, STONE2 } from './props.js';

export const DUR = 246.5;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture') || Q.get('hq') === '1');
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;

/* ------------------------------------------------------------------ renderer, scene, camera */
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.domElement.id = 'c'; document.getElementById('wrap').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, 16 / 9, 5, 40000);
const sky = PR.makeSky(); scene.add(sky);
function mkOverlay(order) {
  const mat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, uniforms: { uC: { value: new THREE.Color('#000') }, uA: { value: 0 } },
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: 'uniform vec3 uC; uniform float uA; void main(){ gl_FragColor = vec4(uC, uA); }' });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); m.frustumCulled = false; m.renderOrder = order; scene.add(m); return mat;
}
const ovMat = mkOverlay(10), disMat = mkOverlay(40);

//@@UTILS@@
//@@FACE@@

/* ------------------------------------------------------------------ actors (created first: the stairs depend on the bochur stride) */
const ACT = {};
function addPerson(id, mk) { const o = mk(); const h = new THREE.Group(); h.rotation.order = 'YZX'; h.add(o.root); scene.add(h); ACT[id] = { o, h, cycle: o.cycle, fn: () => null, person: true }; return ACT[id]; }
function addProp(id, group) { ACT[id] = { h: group, fn: () => null, prop: true }; return ACT[id]; }
addPerson('BO', P.makeBochur); addPerson('M', P.makeMan); addPerson('RA', P.makeRabbiA); addPerson('OB', P.makeBochur);
for (let i = 1; i <= 6; i++) addPerson('C' + i, P.makeBochur);
// the farmer: straw-coloured hat instead of the dark city hat
{
  const D = window.K.MAN, tgt = [[D.hat, '#e7c65c'], [D.band, '#b4452f']];
  ACT.M.o.root.traverse(o => { const m = o.material; if (!m || !m.uniforms || !m.uniforms.uColor) return; const c = '#' + m.uniforms.uColor.value.getHexString();
    for (const [from, to] of tgt) if (from && c.toLowerCase() === from.toLowerCase()) { m.uniforms.uColor.value.set(to); break; } });
}
const BOC = ACT.BO.cycle, TREAD = BOC / 2;

/* ------------------------------------------------------------------ small builders */
const hexM = (h, t) => M(h, t);
function hill(g, x, z, rx, ry, rz, mat, ow) { return part(g, ell(rx, ry, rz, 28, 14), mat, ow == null ? 8 : ow, [x, -ry * 0.3, z]); }
function tree(g, x, z, s, y, leaf) {
  const g0 = new THREE.Group(); g0.position.set(x, y || 0, z); g0.scale.setScalar(s); g.add(g0);
  part(g0, new THREE.CylinderGeometry(18, 26, 170, 12).translate(0, 85, 0), M('#8a5a3a'), 4);
  for (const [a, b, c2, r] of [[0, 250, 0, 95], [-60, 215, 30, 70], [62, 220, -20, 74], [10, 300, -10, 70]]) part(g0, ell(r, r * 0.92, r, 14, 10), M(leaf || '#5fae4e'), 4, [a, b, c2]);
  if (g.userData.items) g.userData.items.push({ o: g0, x, z, k: 't' });
  return g0;
}
function house(g, x, z, w, h, d, c, roof, ry) {
  const h0 = new THREE.Group(); h0.position.set(x, 0, z); h0.rotation.y = ry || 0; g.add(h0);
  box(h0, w, h, d, M(c), [0, h / 2, 0], 3.4, null, 5);
  const rs = new THREE.Shape(); rs.moveTo(-d / 2 - 20, 0); rs.lineTo(d / 2 + 20, 0); rs.lineTo(0, d * 0.4); rs.lineTo(-d / 2 - 20, 0);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: w + 40, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-(w + 40) / 2, h, 0); part(h0, rg, M(roof || '#b8553c', '#8a6a78'), 3);
  for (const s of [-1, 1]) box(h0, w * 0.2, h * 0.24, 8, bas('#ffd88a'), [s * w * 0.27, h * 0.58, d / 2 + 2], 2, null, 2);
  box(h0, w * 0.16, h * 0.42, 8, M('#8f5d33'), [0, h * 0.21, d / 2 + 2], 2, null, 2);
  if (g.userData.items) g.userData.items.push({ o: h0, x, z, k: 'h' });
  return h0;
}
function ribbon(pts, w, mat, ow) {            // pts [[x,y,z]...] -> flat strip
  const n = pts.length, pos = new Float32Array(n * 6), idx = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], tz = b[2] - a[2]; const L = Math.hypot(tx, tz) || 1; tx /= L; tz /= L;
    const nx = -tz * w / 2, nz = tx * w / 2, p = pts[i];
    pos.set([p[0] + nx, p[1], p[2] + nz, p[0] - nx, p[1], p[2] - nz], i * 6);
    if (i < n - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; return m;
}
const mulb = PR.mulberry;
const soft = (parent, hex, size, pos, op, normal) => { const s = glow(parent, hex, size, pos, op); if (normal) { s.material.blending = THREE.NormalBlending; } return s; };

/* ------------------------------------------------------------------ WORLD TW: tall stone building with an outside zigzag staircase */
