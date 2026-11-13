/* toldot10g film_s5 (seasons of the year) - Tel Gezer look. 116.74 s, timing locked from the real narration.
   NO PEOPLE, NO TEXT (digits only). ASCII only. Every frame is a pure function of t.
   Contract: window.__ready, __seek(t) (adds __T0), __dur, __shots, __events, __heroBox. */
import * as THREE from 'three';
import { makeSkyDome } from '../../gezer_trip/film_a/gz_kit.js';
import * as K from '../kit10g.js';
import { dirOf } from './s5_common.js';
import { shotA, shotB } from './shots_ab.js';
import { shotC, shotD } from './shots_cd.js';
import { shotX, shotQ, shotE } from './shots_xqe.js';

const DUR = 116.74;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;
window.__dur = DUR; window.__errors = [];

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c'; document.getElementById('wrap').appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#fbe9bd', 200, 900);
const sky = makeSkyDome('#79c3ee', '#fbe9bd'); scene.add(sky);
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000); scene.add(cam);
const hemi = new THREE.HemisphereLight('#bcd9f5', '#8a7a55', 0.85); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1d0', 2.1); sun.castShadow = true;
sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 500 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; scene.add(sun, sun.target);
const scene2 = new THREE.Scene(); scene2.add(new THREE.HemisphereLight('#ffffff', '#9a8a70', 1.0)); const l2 = new THREE.DirectionalLight('#fff4dc', 1.3); l2.position.set(10, 20, 30); scene2.add(l2);
const comp = K.makeCompanion(cam, scene2);

const T = [0, 14.04, 32.61, 54.12, 69.59, 84.66, 95.25, DUR];
const BUILD = [['a', shotA], ['b', shotB], ['c', shotC], ['d', shotD], ['x', shotX], ['q', shotQ], ['e', shotE]];
let SH = [];

function frame(tl) {
  const t = Math.max(0, Math.min(DUR - 0.001, tl));
  let si = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i].t0) si = i;
  const s = SH[si], lt = t - s.t0;
  SH.forEach((o, i) => { o.grp.visible = i === si; });
  const Lg = s.light(lt);
  sky.material.uniforms.uTop.value.set(Lg.top); sky.material.uniforms.uHor.value.set(Lg.hor); scene.fog.color.set(Lg.hor);
  sun.color.set(Lg.sunC); sun.intensity = Lg.sunI; hemi.intensity = Lg.hemiI;
  sun.target.position.set(...Lg.tgt); sun.position.set(...Lg.tgt).addScaledVector(dirOf(Lg.el, Lg.az), 120);
  if (sun.shadow.camera.right !== Lg.ext) { Object.assign(sun.shadow.camera, { left: -Lg.ext, right: Lg.ext, top: Lg.ext, bottom: -Lg.ext }); sun.shadow.camera.updateProjectionMatrix(); }
  s.upd(lt, t); cam.updateMatrixWorld();
  const to = s.tipa(lt); comp.place(Object.assign({ t }, to)); comp.sync();
  if (to.look) comp.tipa.face.set({ expr: to.expr, look: to.look, talk: null, blink: false });
  /* hero box (projected) */
  { const bx = new THREE.Box3().setFromObject(s.heroAt ? s.heroAt(lt) : s.hero), fw = new THREE.Vector3(), v = new THREE.Vector3(); cam.getWorldDirection(fw);
    let mnx = 9, mxx = -9, mny = 9, mxy = -9, front = 0;
    for (let i = 0; i < 8; i++) { v.set(i & 1 ? bx.max.x : bx.min.x, i & 2 ? bx.max.y : bx.min.y, i & 4 ? bx.max.z : bx.min.z); if (v.clone().sub(cam.position).dot(fw) > 0.1) front++; v.project(cam); mnx = Math.min(mnx, v.x); mxx = Math.max(mxx, v.x); mny = Math.min(mny, v.y); mxy = Math.max(mxy, v.y); }
    HERO = { visible: front > 0 && mxx > -1 && mnx < 1 && mxy > -1 && mny < 1, behindCamera: front === 0, heightFrac: Math.max(0, Math.min(1, (Math.min(mxy, 1) - Math.max(mny, -1)) / 2)), box: [mnx, mny, mxx, mxy] }; }
  renderer.autoClear = false; renderer.clear(); renderer.render(scene, cam); renderer.clearDepth(); renderer.render(scene2, cam);
}
let HERO = null;

const EV = []; const ev = (t, kind) => EV.push({ t: +t.toFixed(2), kind });
[0.6, 7.14, 14.39, 23.47, 32.96, 40.12, 44.92, 54.47, 61.13, 69.94, 78.28, 85.01, 91.71, 95.6, 102.92, 105.5].forEach(t => ev(t + 0.05, 'pop'));
T.slice(1, 7).forEach(t => ev(t - 0.3, 'whoosh'));
[91.41, 92.41, 93.41, 102.62, 103.62, 104.62].forEach(t => ev(t, 'tick')); ev(91.71, 'ding'); ev(102.92, 'ding'); ev(44.95, 'splash'); ev(73.6, 'splash');
window.__events = EV.sort((a, b) => a.t - b.t);
window.__heroBox = () => HERO; window.__caption = () => null; window.__sceneHash = () => 'toldot10g-s5-v1';
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };

async function main() {
  SH = BUILD.map(([id, fn], i) => Object.assign({ id, t0: T[i], t1: T[i + 1] }, fn(cam)));
  SH.forEach(s => { scene.add(s.grp); s.grp.visible = false; });
  window.__shots = SH.map((s, i) => ({ id: 's5' + s.id, index: i, t0: s.t0, dur: +(s.t1 - s.t0).toFixed(2) }));
  await comp.warm();
  for (const s of SH) { frame(s.t0 + 0.5); frame(s.t0 + (s.t1 - s.t0) * 0.5); }
  frame(0); window.__ready = true;
}
setTimeout(() => { main().catch(e => { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }); }, 0);
