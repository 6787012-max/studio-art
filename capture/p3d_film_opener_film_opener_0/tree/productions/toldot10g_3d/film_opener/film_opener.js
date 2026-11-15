/* toldot10g film_opener (lesson 10 opening, dawn) - gezer_trip look. 12.92 s, one shot, timing locked from the real narration.
   The wooden table at dawn, a low glide over the table edge toward the map, rising to a tilted view; nine pins pop in rhythm.
   NO PEOPLE, NO TEXT. ASCII only. Every frame is a pure function of t.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur, window.__shots, window.__events. */
import * as THREE from 'three';
import { makeSkyDome } from '../../gezer_trip/film_a/gz_kit.js';
import * as K from '../kit10g.js';
const { cl, ramp, pop, C, sm, lam, phong, ll, mapY, makeClouds } = K;

const DUR = 12.92;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#f6caa0', 120, 520);
const sky = makeSkyDome('#86a4d8', '#ffc690'); scene.add(sky);
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000); scene.add(cam);
const hemi = new THREE.HemisphereLight('#a9b8e8', '#a07858', 0.8); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffb77a', 2.3); sun.castShadow = true;
sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -85, right: 85, top: 85, bottom: -85, near: 10, far: 400 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);
const SUN_A = { col: C('#ff9f64'), top: C('#8fb4e6'), hor: C('#ffa878'), fog: C('#f2b890') };   /* first light */
const SUN_B = { col: C('#ffdcb0'), top: C('#a8cff2'), hor: C('#ffd9a8'), fog: C('#f8d6b0') };   /* full dawn glow */

const scene2 = new THREE.Scene(); scene2.add(new THREE.HemisphereLight('#ffffff', '#9a8a70', 1.0)); const l2 = new THREE.DirectionalLight('#fff0dc', 1.3); l2.position.set(10, 20, 30); scene2.add(l2);
const comp = K.makeCompanion(cam, scene2);

/* ---------------------------------------------------------------- the table and the map (turned: north to the right, we face west) */
const TABLE = K.makeTable(), MAP = K.makeTableMap();
const pinG = new THREE.Group();
scene.add(TABLE, MAP.grp, pinG);
MAP.paint(1); MAP.slide(0);
TABLE.children[2].visible = false;   /* the kit pencil is cut by the frame edge in the last frames */

/* props on the table: closed books, a spyglass, a cup, a scroll - all fixed, in world coordinates */
const brass = phong('#c9a24a', { shininess: 90 });
function closedBook(w, h, d, col, band) {
  const g = new THREE.Group();
  const cover = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(col)); cover.position.y = h / 2; g.add(cover);
  const pg = new THREE.Mesh(new THREE.BoxGeometry(w - 0.5, h - 0.45, d + 0.08), lam('#f1e7c9')); pg.position.set(0.25, h / 2, 0); g.add(pg);
  const st = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.16, d + 0.04), lam(band)); st.position.y = h * 0.78; g.add(st);
  const st2 = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.16, d + 0.04), lam(band)); st2.position.y = h * 0.22; g.add(st2);
  return g;
}
const props = new THREE.Group();
{
  const TY = -1.55;
  const stack = (x, z, ry0, list) => { let y = TY; list.forEach(([w, h, d, c, b, ry], i) => { const bk = closedBook(w, h, d, c, b); bk.position.set(x, y, z); bk.rotation.y = ry0 + ry; props.add(bk); y += h; }); };
  stack(30, -25, 0.3, [[9.4, 1.5, 6.8, '#7a2f4a', '#e8d6a0', 0.1], [8.6, 1.3, 6.2, '#2f6b6a', '#d8b25a', -0.2], [7.8, 1.2, 5.6, '#a5602a', '#e8d6a0', 0.25]]);
  stack(-29, -26, -0.4, [[9, 1.4, 6.4, '#2f5d8a', '#d8b25a', 0.0], [8, 1.2, 5.8, '#3d6b3a', '#e8d6a0', 0.3]]);
  /* spyglass lying on the table */
  const sg = new THREE.Group();
  [[0.62, 5.5, 0], [0.5, 4.5, 5.0], [0.38, 3.5, 9.2]].forEach(([r, l, x]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 16).rotateZ(Math.PI / 2), brass); c.position.x = x + l / 2 - 2; sg.add(c); });
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.12, 16).rotateZ(Math.PI / 2), BASIC('#bfe4ff')); lens.position.x = 3.9; sg.add(lens);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.1, 8, 20).rotateY(Math.PI / 2), lam('#4a2c18')); ring.position.x = 0.2; sg.add(ring);
  sg.position.set(30, TY + 0.66, 44); sg.rotation.y = 0.9; props.add(sg);
  /* cup with tea */
  const cup = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.0, 1.9, 24, 1, true), lam('#f4efe4')); body.material.side = THREE.DoubleSide; body.position.y = 1.17; cup.add(body);
  const tea = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.05, 24), lam('#8a4a1c', { emissive: '#3a1e08' })); tea.position.y = 1.77; cup.add(tea);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.15, 8, 16, Math.PI), lam('#f4efe4')); hd.position.set(1.3, 1.2, 0); hd.rotation.z = -Math.PI / 2; cup.add(hd);
  const sau = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 1.9, 0.22, 28), lam('#e8e2d2')); sau.position.y = 0.1; cup.add(sau);
  cup.position.set(-24, TY, -8); props.add(cup);
  /* rolled scroll */
  const sc = new THREE.Group();
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 9, 20).rotateZ(Math.PI / 2), lam('#efe2bb')); sc.add(roll);
  [-4.4, 4.4].forEach(x => { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.5, 14).rotateZ(Math.PI / 2), lam('#7a4a22')); cap.position.x = x * 1.06; sc.add(cap); });
  const rib = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.14, 8, 22).rotateY(Math.PI / 2), lam('#b02a1c')); rib.position.x = 1; sc.add(rib);
  sc.position.set(-28, TY + 1.0, 46); sc.rotation.y = 0.5; props.add(sc);
  /* small brass compass: the foreground of the first frames */
  const cmp = new THREE.Group();
  cmp.add(new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.7, 28), brass));
  const cf = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.74, 28), lam('#f2ead2')); cf.position.y = 0.02; cmp.add(cf);
  const cn = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 4.6), lam('#b02a1c')); cn.position.y = 0.42; cmp.add(cn);
  const cs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 2.4), lam('#2a2a2a')); cs.position.set(0, 0.42, 3.5); cmp.add(cs);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 12), brass); lid.position.y = 0.55; cmp.add(lid);
  cmp.scale.setScalar(1.6); cmp.position.set(-3, TY + 0.4, 29); cmp.rotation.y = 0.4; props.add(cmp);
}
scene.add(K.shadowable(props));

/* dawn clouds on the horizon (west and south), drifting */
const hClouds = [[-170, 26, -50, 3.2], [-120, 34, -110, 3.8], [-30, 30, -170, 4.2], [60, 24, -150, 3.0], [150, 30, -90, 3.6], [-190, 18, 40, 2.6], [-90, 20, 120, 2.4]].map(([x, y, z, s]) => {
  const c = K.makeCloud({ scale: s }); c.userData.p = [x, y, z]; c.userData.s = s; c.userData.setTone(0.0); scene.add(c); return c;
});
hClouds.forEach(c => { c.children.forEach(m => { m.castShadow = false; m.receiveShadow = false; }); });

/* ---------------------------------------------------------------- nine pins */
const STOPS = [[33.20, 35.60], [32.76, 35.40], [32.31, 35.05], [31.87, 34.95], [31.43, 35.05], [30.98, 34.85], [30.54, 34.85], [30.09, 34.95], [29.65, 34.95]];
const PCOL = ['#e0401e', '#f08a1e', '#e8c21e', '#58b030', '#1fa0a0', '#2a6fd0', '#7a44c8', '#d03c8c', '#c0392b'];
const T0 = 0.6, GAP = 0.66, TW = 7.5;
const pins = [], beams = [], rings = [], tP = [];
STOPS.forEach(([la, lo], i) => {
  const [x, z] = ll(la, lo), y = mapY(x, z);
  const pn = K.makePin(PCOL[i]); pn.userData.k = 1.5; pn.position.set(x, y + 0.05, z); pinG.add(pn); pins.push(pn);
  const bm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.5, 22, 12, 1, true).translate(0, 11, 0), BASIC('#ffe9a8', { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  bm.position.set(x, y + 3.7, z); pinG.add(bm); beams.push(bm);
  const rg = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.16, 8, 40).rotateX(Math.PI / 2), BASIC(PCOL[i], { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  rg.position.set(x, y + 0.5, z); pinG.add(rg); rings.push(rg);
  tP.push(T0 + i * GAP);
});
/* route line: hugs the relief, grows as the pins appear */
const routePts = [], routeAt = [0];
{
  const P = STOPS.map(([la, lo]) => ll(la, lo));
  let acc = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const n = 7;
    for (let k = 0; k < n; k++) {
      const u = k / n, x = P[i][0] + (P[i + 1][0] - P[i][0]) * u, z = P[i][1] + (P[i + 1][1] - P[i][1]) * u;
      const pt = [x, mapY(x, z) + 0.7, z];
      if (routePts.length) { const q = routePts[routePts.length - 1]; acc += Math.hypot(pt[0] - q[0], pt[2] - q[2]); }
      routePts.push(pt);
    }
    routeAt.push(acc + 0);
  }
  const x = P[P.length - 1][0], z = P[P.length - 1][1]; const pt = [x, mapY(x, z) + 0.7, z]; const q = routePts[routePts.length - 1]; acc += Math.hypot(pt[0] - q[0], pt[2] - q[2]); routePts.push(pt); routeAt[P.length - 1] = acc;
  routeAt.forEach((v, i) => { routeAt[i] = v / acc; });
}
const route = K.makeThickLine(routePts, 0.16, BASIC('#ffcf3a')); pinG.add(route);

/* ---------------------------------------------------------------- camera: Hermite path with finite-difference tangents (no stops mid-shot) */
const KEYS = [
  [0.0, [3, 6, 50], [3, -3, 14]],
  [3.0, [2.5, 12, 48], [2.5, 0, 0]],
  [6.0, [2.5, 28, 66], [2.5, 0, -2]],
  [9.5, [2.5, 32, 62], [2.5, 0, -8]],
  [12.92, [2.5, 33, 60], [2.5, 0, -8]]
];
function camAt(t) {
  const n = KEYS.length; let i = 0; while (i < n - 2 && t > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1], dt = b[0] - a[0], u = cl((t - a[0]) / dt);
  const tan = (k, which) => {
    const p = KEYS[k][which], out = [0, 0, 0];
    for (let j = 0; j < 3; j++) {
      if (k === 0) out[j] = 0.45 * (KEYS[1][which][j] - p[j]) / (KEYS[1][0] - KEYS[0][0]);
      else if (k === n - 1) out[j] = 0.25 * (p[j] - KEYS[k - 1][which][j]) / (KEYS[k][0] - KEYS[k - 1][0]);
      else out[j] = (KEYS[k + 1][which][j] - KEYS[k - 1][which][j]) / (KEYS[k + 1][0] - KEYS[k - 1][0]);
    }
    return out;
  };
  const u2 = u * u, u3 = u2 * u, h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const res = [1, 2].map(w => { const m0 = tan(i, w), m1 = tan(i + 1, w); return [0, 1, 2].map(j => h00 * a[w][j] + h10 * dt * m0[j] + h01 * b[w][j] + h11 * dt * m1[j]); });
  return { p: res[0], l: res[1] };
}

/* ---------------------------------------------------------------- frame */
let lastTipa = null;
const fogCol = new THREE.Color();
function frame(tl) {
  const t = Math.max(0, Math.min(DUR - 0.001, tl)), lt = t;
  const c = camAt(lt); cam.position.set(...c.p); cam.lookAt(...c.l);
  /* dawn brightening: first light -> warm glow */
  const k = ramp(lt, 0, 9);
  sun.color.copy(SUN_A.col).lerp(SUN_B.col, k); sun.intensity = 2.15 + 0.5 * k;
  hemi.intensity = 0.78 + 0.22 * k;
  sky.material.uniforms.uTop.value.copy(SUN_A.top).lerp(SUN_B.top, k); sky.material.uniforms.uHor.value.copy(SUN_A.hor).lerp(SUN_B.hor, k);
  fogCol.copy(SUN_A.fog).lerp(SUN_B.fog, k); scene.fog.color.copy(fogCol);
  sun.target.position.set(0, 0, 0); sun.position.set(92, 30 + 10 * k, 14);
  /* clouds drift */
  hClouds.forEach((cd, i) => { const p = cd.userData.p; cd.position.set(p[0] + lt * (1.1 + 0.2 * i), p[1] + 0.3 * Math.sin(lt * 0.6 + i), p[2]); cd.setRotationFromEuler(new THREE.Euler()); });
  /* pins */
  const wave = lt - TW;
  pins.forEach((pn, i) => {
    const dd = Math.hypot(cam.position.x - pn.position.x, cam.position.y - pn.position.y, cam.position.z - pn.position.z), kk = Math.max(0.8, Math.min(2.2, 0.02 * dd));
    pn.userData.k = kk; beams[i].position.y = pn.position.y + 3.7 * kk;
    const u = (lt - tP[i]) / 0.55;
    pn.userData.pop(u);
    const ag = lt - tP[i];
    const bump = wave > 0 ? Math.exp(-Math.pow((wave - i * 0.13 - 0.25) / 0.22, 2)) : 0;
    const base = ag > 0 ? (0.25 + 0.75 * Math.exp(-ag * 1.4)) : 0;
    pn.userData.glow(Math.min(1, base * 0.8 + bump) * (0.85 + 0.15 * Math.sin(lt * 5 + i)));
    const bo = ag > 0 ? (0.32 * Math.exp(-ag * 1.1) + 0.07 + 0.2 * bump) : 0;
    beams[i].visible = ag > 0; beams[i].material.opacity = bo; const bk = kk * 0.45; beams[i].scale.set(bk * (1 + 0.4 * Math.exp(-ag * 3)), bk * (0.55 + 0.45 * cl(ag / 0.35)), bk * (1 + 0.4 * Math.exp(-ag * 3)));
    const ra = ag / 1.3; rings[i].visible = ra > 0 && ra < 1; rings[i].scale.setScalar(kk * (1 + ra * 4.0)); rings[i].material.opacity = 0.75 * (1 - ra);
  });
  /* route reaches pin i at the moment it pops */
  let ru = 0;
  for (let i = 0; i < pins.length - 1; i++) { const a = cl((lt - tP[i] - 0.2) / (GAP - 0.1)); ru = Math.max(ru, routeAt[i] + (routeAt[i + 1] - routeAt[i]) * sm(a) * (a > 0 ? 1 : 0)); }
  route.userData.setU(ru);
  /* Tipa lands on her cloud at the second beat */
  const tu = (lt - TW) / 0.6;
  lastTipa = { side: -1, xf: 0.8, size: 0.2, expr: lt < TW + 1.6 ? 'happy' : 'cheering', arms: lt < TW + 1.6 ? 'point' : 'up', hop: lt > TW + 1.6 ? 0.5 : 0, show: cl(tu) };
  cam.updateMatrixWorld();
  comp.place(Object.assign({ t }, lastTipa)); comp.sync();
  renderer.autoClear = false; renderer.clear(); renderer.render(scene, cam); renderer.clearDepth(); renderer.render(scene2, cam);
}

window.__dur = DUR;
window.__shots = [{ id: 'o1_takeoff', index: 0, t0: 0, dur: DUR }];
window.__events = [{ t: 0.1, kind: 'whoosh' }].concat(tP.map(t => ({ t, kind: 'pop' })), [{ t: TW, kind: 'whoosh' }, { t: TW + 0.4, kind: 'ding' }]);
window.__caption = () => null; window.__heroBox = () => (lastTipa && lastTipa.show > 0.05 ? { visible: true, behindCamera: false, heightFrac: lastTipa.size || 0.2 } : null); window.__sceneHash = () => 'toldot10g-opener-v1';
window.__errors = [];
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

setTimeout(async () => {
  try {
    await comp.warm();
    frame(0.5); frame(DUR * 0.5); frame(0); window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
}, 0);
