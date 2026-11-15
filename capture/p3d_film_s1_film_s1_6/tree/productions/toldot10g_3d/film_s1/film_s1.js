/* toldot10g film_s1 (reading a map, morning) - gezer_trip look, built like the approved film_s4. 136.72 s, timing locked from the real narration.
   NO PEOPLE, NO TEXT (digits only on the kilometre posts). ASCII only. Every frame is a pure function of t.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur, window.__shots, window.__events, window.__heroBox. */
import * as THREE from 'three';
import { makeSkyDome } from '../../gezer_trip/film_a/gz_kit.js';
import * as K from '../kit10g.js';
import { shotA, shotB, shotC } from './g1_shots1.js';
import { shotD, shotX, shotQ, shotE } from './g1_shots2.js';
const { C } = K;

const DUR = 136.72;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
const TIMES = [['a', 0, 27.66], ['b', 27.66, 52.07], ['c', 52.07, 70.88], ['d', 70.88, 84.87], ['x', 84.87, 105.8], ['q', 105.8, 114.47], ['e', 114.47, DUR]];
window.__dur = DUR; window.__errors = []; window.__ready = false;
window.__shots = TIMES.map(([id, t0, t1], i) => ({ id: 's1' + id, index: i, t0, dur: +(t1 - t0).toFixed(2) }));
window.__caption = () => null; window.__heroBox = () => null; window.__events = []; window.__sceneHash = () => 'toldot10g-s1-v2';

function main() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.id = 'c'; document.getElementById('wrap').appendChild(renderer.domElement);

  const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#fde3b8', 200, 900);
  const sky = makeSkyDome('#7db8ea', '#fde3b8'); scene.add(sky);
  const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000); scene.add(cam);
  const hemi = new THREE.HemisphereLight('#bcd9f5', '#8a7a55', 0.85); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe6bd', 2.1); sun.castShadow = true;
  sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 10, far: 500 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; scene.add(sun, sun.target);

  const scene2 = new THREE.Scene(); scene2.add(new THREE.HemisphereLight('#ffffff', '#9a8a70', 1.0)); const l2 = new THREE.DirectionalLight('#fff4dc', 1.3); l2.position.set(10, 20, 30); scene2.add(l2);
  const comp = K.makeCompanion(cam, scene2);
  const branch = K.makeBranch(); branch.position.z = -12; cam.add(branch);

  const mapRoot = new THREE.Group(); scene.add(mapRoot);
  const TABLE = K.makeTable(), MAP = K.makeTableMap(); mapRoot.add(TABLE, MAP.grp);
  const X = { cam, MAP, mapRoot, scene };

  const builders = { a: shotA, b: shotB, c: shotC, d: shotD, x: shotX, q: shotQ, e: shotE };
  const SH = TIMES.map(([id, t0, t1]) => Object.assign({ id, t0, t1 }, builders[id](X)));
  SH.forEach(s => { scene.add(s.grp); s.grp.visible = false; });

  const DEF = { target: [0, 0, 0], ext: 80, so: [-66, 56, 64], sunC: C('#ffe6bd'), sunI: 2.1, hemiI: 0.85, top: C('#7db8ea'), hor: C('#fde3b8'), fog: [200, 900] };
  const EV = []; SH.forEach(s => { if (s.t0 > 0) EV.push({ t: +(s.t0 - 0.25).toFixed(2), kind: 'whoosh' }); (s.events || []).forEach(([lt, kind]) => EV.push({ t: +(s.t0 + lt).toFixed(2), kind })); });
  EV.sort((a, b) => a.t - b.t); window.__events = EV;
  let HERO = null; const v = new THREE.Vector3(), fw = new THREE.Vector3(), bx = new THREE.Box3();

  function frame(tl) {
    const t = Math.max(0, Math.min(DUR - 0.001, tl));
    let si = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i].t0) si = i;
    const s = SH[si], lt = t - s.t0;
    SH.forEach((o, i) => { o.grp.visible = i === si; });
    const mm = s.mapMode ? s.mapMode(lt) : 0; mapRoot.visible = mm > 0; MAP.grp.visible = mm === 2; if (mm === 2) { MAP.slide(0); MAP.paint(1); }
    branch.visible = !!s.branch;
    const L = Object.assign({}, DEF, s.light ? s.light(lt) : null);
    sky.material.uniforms.uTop.value.copy(L.top); sky.material.uniforms.uHor.value.copy(L.hor);
    scene.fog.color.copy(L.hor); scene.fog.near = L.fog[0]; scene.fog.far = L.fog[1];
    sun.color.copy(L.sunC); sun.intensity = L.sunI; hemi.intensity = L.hemiI;
    sun.target.position.set(...L.target); sun.position.set(L.target[0] + L.so[0], L.target[1] + L.so[1], L.target[2] + L.so[2]);
    if (sun.shadow.camera.right !== L.ext) { Object.assign(sun.shadow.camera, { left: -L.ext, right: L.ext, top: L.ext, bottom: -L.ext }); sun.shadow.camera.updateProjectionMatrix(); }
    s.upd(lt, t);
    cam.updateMatrixWorld();
    comp.place(Object.assign({ t }, s.tipa(lt))); comp.sync();
    renderer.autoClear = false; renderer.clear(); renderer.render(scene, cam); renderer.clearDepth(); renderer.render(scene2, cam);
    /* hero box: the set piece of the shot */
    const ho = s.hero ? s.hero(lt) : s.grp;
    if (ho) {
      bx.setFromObject(ho); cam.getWorldDirection(fw);
      let mnx = 9, mxx = -9, mny = 9, mxy = -9, front = 0;
      for (let i = 0; i < 8; i++) { v.set(i & 1 ? bx.max.x : bx.min.x, i & 2 ? bx.max.y : bx.min.y, i & 4 ? bx.max.z : bx.min.z); if (v.clone().sub(cam.position).dot(fw) > 0.1) front++; v.project(cam); mnx = Math.min(mnx, v.x); mxx = Math.max(mxx, v.x); mny = Math.min(mny, v.y); mxy = Math.max(mxy, v.y); }
      HERO = { visible: front > 0 && mxx > -1 && mnx < 1 && mxy > -1 && mny < 1, behindCamera: front === 0, heightFrac: Math.max(0, Math.min(1, (Math.min(mxy, 1) - Math.max(mny, -1)) / 2)), box: [mnx, mny, mxx, mxy] };
    }
  }
  window.__heroBox = () => HERO;
  window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };
  (async () => {
    try {
      await comp.warm();
      for (const s of SH) { const d = s.t1 - s.t0; for (const f of [0.02, 0.3, 0.55, 0.8, 0.97]) frame(s.t0 + d * f); }
      frame(0); window.__ready = true;
    } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
  })();
}
setTimeout(main, 0);
