/* toldot10g film_z (finale of lesson 10: nine-topic replay + the closing evening scene) - Tel Gezer look. 50.83 s, timing locked from the real narration.
   NO PEOPLE, NO TEXT (only the digits -440). ASCII only. Every frame is a pure function of t.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur, window.__shots, window.__events, window.__heroBox. */
import * as THREE from 'three';
import { makeSkyDome } from '../../gezer_trip/film_a/gz_kit.js';
import * as K from '../kit10g.js';
import { mapStations } from './z_map.js';
import { landStations } from './z_land.js';
import { buildFinal, makeBuddy } from './z_final.js';
const { cl, C } = K;

const DUR = 50.83, T_SPLIT = 34.06;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#fbe9bd', 200, 900);
const sky = makeSkyDome('#79c3ee', '#fbe9bd'); scene.add(sky);
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000); scene.add(cam);
const hemi = new THREE.HemisphereLight('#bcd9f5', '#8a7a55', 0.85); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1d0', 2.1); sun.castShadow = true;
sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 500 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

const M0 = { top: C('#79c3ee'), hor: C('#fbe9bd'), sun: C('#fff1d0'), sunI: 2.1, hemI: 0.85, hs: C('#bcd9f5'), hg: C('#8a7a55') };
const MD = { top: C('#7a5a8c'), hor: C('#f2a860'), sun: C('#ffa860'), sunI: 2.3, hemI: 1.2, hs: C('#ffd9b0'), hg: C('#7a5a42') };
function setMood(k) {
  sky.material.uniforms.uTop.value.copy(M0.top).lerp(MD.top, k); sky.material.uniforms.uHor.value.copy(M0.hor).lerp(MD.hor, k);
  scene.fog.color.copy(sky.material.uniforms.uHor.value);
  sun.color.copy(M0.sun).lerp(MD.sun, k); sun.intensity = M0.sunI + (MD.sunI - M0.sunI) * k; hemi.intensity = M0.hemI + (MD.hemI - M0.hemI) * k;
  hemi.color.copy(M0.hs).lerp(MD.hs, k); hemi.groundColor.copy(M0.hg).lerp(MD.hg, k);
}

const scene2 = new THREE.Scene(); scene2.add(new THREE.HemisphereLight('#ffffff', '#9a8a70', 1.0)); const l2 = new THREE.DirectionalLight('#fff4dc', 1.3); l2.position.set(10, 20, 30); scene2.add(l2);
const comp = K.makeCompanion(cam, scene2);
const buddy = makeBuddy(comp, cam);

const mapRoot = new THREE.Group(); scene.add(mapRoot);
const TABLE = K.makeTable(), MAP = K.makeTableMap(); mapRoot.add(TABLE, MAP.grp);

/* z1 = nine stations (cuts on the cue starts 5.4 / 16.38 / 24.62), z2 = the finale */
const PLAN = [['s1', 0, 2.6], ['s2', 2.6, 5.4], ['s3', 5.4, 9.4], ['s4', 9.4, 13.0], ['s5', 13.0, 16.38], ['s6', 16.38, 20.4], ['s7', 20.4, 24.62], ['s8', 24.62, 29.0], ['s9', 29.0, T_SPLIT], ['z2', T_SPLIT, DUR]];
let SH = [], lastTipa = null, ready = false, HERO = null;

function build() {
  const ms = mapStations(cam, MAP), ls = landStations(cam), all = Object.assign({}, ms, ls, { z2: buildFinal(cam, MAP) });
  SH = PLAN.map(([id, t0, t1]) => Object.assign({ id, t0, t1 }, all[id]));
  SH.forEach(s => { if (s.grp) { scene.add(s.grp); s.grp.visible = false; } });
  window.__events = SH.flatMap(s => (s.ev || []).map(([t, kind]) => ({ t: +(s.t0 + t).toFixed(2), kind })));
}

function frame(tl) {
  const t = Math.max(0, Math.min(DUR - 0.001, tl));
  let si = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i].t0) si = i;
  const s = SH[si], lt = t - s.t0;
  SH.forEach((o, i) => { o.grp.visible = i === si; });
  mapRoot.visible = !!s.map; if (s.map) { MAP.slide(0); MAP.paint(1); }
  setMood(s.dusk ? 1 : 0);
  const sc = s.sun, so = s.so || [72, 63.6, 72];
  sun.target.position.set(...sc.t); sun.position.set(sc.t[0] + so[0], sc.t[1] + so[1], sc.t[2] + so[2]);
  if (sun.shadow.camera.right !== sc.ext) { Object.assign(sun.shadow.camera, { left: -sc.ext, right: sc.ext, top: sc.ext, bottom: -sc.ext }); sun.shadow.camera.updateProjectionMatrix(); }
  s.upd(lt, t);
  cam.updateMatrixWorld();
  lastTipa = s.tipa(lt); comp.place(Object.assign({ t }, lastTipa));
  buddy.setVisible(!!s.buddy); if (s.buddy) buddy.place(Object.assign({ t }, s.buddy(lt)));
  comp.sync();
  { const bx = new THREE.Box3().setFromObject(s.hero || (s.map ? MAP.grp : s.grp)), fw = new THREE.Vector3(), v = new THREE.Vector3(); cam.getWorldDirection(fw);
    let mnx = 9, mxx = -9, mny = 9, mxy = -9, front = 0;
    for (let i = 0; i < 8; i++) { v.set(i & 1 ? bx.max.x : bx.min.x, i & 2 ? bx.max.y : bx.min.y, i & 4 ? bx.max.z : bx.min.z); if (v.clone().sub(cam.position).dot(fw) > 0.1) front++; v.project(cam); mnx = Math.min(mnx, v.x); mxx = Math.max(mxx, v.x); mny = Math.min(mny, v.y); mxy = Math.max(mxy, v.y); }
    HERO = { visible: front > 0 && mxx > -1 && mnx < 1 && mxy > -1 && mny < 1, behindCamera: front === 0, heightFrac: Math.max(0, Math.min(1, (Math.min(mxy, 1) - Math.max(mny, -1)) / 2)), box: [mnx, mny, mxx, mxy] }; }
  renderer.autoClear = false; renderer.clear(); renderer.render(scene, cam); renderer.clearDepth(); renderer.render(scene2, cam);
}

window.__dur = DUR;
window.__shots = [{ id: 'z1_replay', index: 0, t0: 0, dur: T_SPLIT }, { id: 'z2_pasuk', wide: true, index: 1, t0: T_SPLIT, dur: +(DUR - T_SPLIT).toFixed(2) }];
window.__events = [];
window.__caption = () => null; window.__heroBox = () => HERO; window.__sceneHash = () => 'toldot10g-z-v1';
window.__errors = [];
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

async function main() {
  try {
    build(); await comp.warm(); await buddy.warm();
    for (const s of SH) { frame(s.t0 + 0.5); frame(s.t0 + (s.t1 - s.t0) * 0.5); }
    frame(0); window.__ready = true; ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
}
setTimeout(main, 0);
