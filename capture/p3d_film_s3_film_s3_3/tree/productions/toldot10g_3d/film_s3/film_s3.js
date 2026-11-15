/* toldot10g film_s3 (lesson 10: mountains, valleys and plains) - Tel Gezer look. 120.32 s, timing locked from the real narration.
   NO PEOPLE, NO TEXT (digits only on the climb altimeter). ASCII only. Every frame is a pure function of t.
   Contract: window.__ready, window.__seek(t) (adds window.__T0), window.__dur, window.__shots, window.__events, window.__heroBox. */
import * as THREE from 'three';
import { makeSkyDome } from '../../gezer_trip/film_a/gz_kit.js';
import * as K from '../kit10g.js';
import { buildA, buildX } from './shots_land.js';
import { buildB, buildC, buildD, buildQ, buildE } from './shots_table.js';
const { lam, woodTex } = K;

const DUR = 120.32;
const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
const W = HQ ? 1920 : 1280, H = HQ ? 1080 : 720;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
document.getElementById('wrap').appendChild(renderer.domElement);

function main() {
const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#fbe9bd', 200, 900);
const sky = makeSkyDome('#79c3ee', '#fbe9bd'); scene.add(sky);
const cam = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 3000); scene.add(cam);
const hemi = new THREE.HemisphereLight('#bcd9f5', '#8a7a55', 0.95); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1d0', 2.1); sun.castShadow = true;
sun.shadow.mapSize.set(HQ ? 2048 : 1024, HQ ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 500 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

const scene2 = new THREE.Scene(); scene2.add(new THREE.HemisphereLight('#ffffff', '#9a8a70', 1.0)); const l2 = new THREE.DirectionalLight('#fff4dc', 1.3); l2.position.set(10, 20, 30); scene2.add(l2);
const comp = K.makeCompanion(cam, scene2);

/* the wooden table (+ a huge extension so no dark floor shows) and the real-elevation land in its tray */
const TABLE = K.makeTable(); scene.add(TABLE);
const ext = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), lam('#6b4020', { map: woodTex(2, 140, 140) })); ext.position.y = -1.56; ext.receiveShadow = true; TABLE.add(ext);
const MAP = K.makeTableMap(); scene.add(MAP.grp);
const felt = new THREE.Mesh(new THREE.BoxGeometry(170, 0.3, 130), lam('#7fb157', { map: K.noiseTex(83, 20, 14) })); felt.position.set(0, -1.45, 8); felt.receiveShadow = true; scene.add(felt);
const rf = K.rng(41); felt.add(K.tufts(1400, 5, () => [(rf() - 0.5) * 164, 0.2, (rf() - 0.5) * 124], ['#6f9d4a', '#86b257', '#9cc56a', '#e8c97c'], 0.4, 1.0));

const T = [0, 15.8, 36.97, 63.74, 72.73, 87.02, 95.31, DUR];
const SH = [['s3a_hour', () => buildA(cam)], ['s3b_forms', () => buildB(cam)], ['s3c_real', () => buildC(cam)], ['s3d_colors', () => buildD(cam, MAP)],
  ['s3x_climb', () => buildX(cam)], ['s3q_quiz2', () => buildQ(cam)], ['s3e_quiz', () => buildE(cam, MAP)]].map(([id, fn], i) => Object.assign({ id, t0: T[i], t1: T[i + 1] }, fn()));
SH.forEach(s => { scene.add(s.grp); s.grp.visible = false; if (s.hud) s.hud.visible = false; });

let HERO = null;
function frame(tl) {
  const t = Math.max(0, Math.min(DUR - 0.001, tl));
  let si = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i].t0) si = i;
  const s = SH[si], lt = t - s.t0;
  SH.forEach((o, i) => { o.grp.visible = i === si; if (o.hud) o.hud.visible = i === si; });
  SH.forEach((o, i) => { if (i !== si && o.restore) o.restore(); });
  TABLE.visible = !!s.table; MAP.grp.visible = !!s.map; felt.visible = !!s.map;
  if (s.map) { MAP.slide(0); MAP.paint(1); }
  const sc = typeof s.sun === 'function' ? s.sun(lt) : s.sun, so = [72, 63.6, 72];
  sun.target.position.set(...sc.t); sun.position.set(sc.t[0] + so[0], sc.t[1] + so[1], sc.t[2] + so[2]);
  if (sun.shadow.camera.right !== sc.ext) { Object.assign(sun.shadow.camera, { left: -sc.ext, right: sc.ext, top: sc.ext, bottom: -sc.ext }); sun.shadow.camera.updateProjectionMatrix(); }
  s.upd(lt, t);
  cam.updateMatrixWorld();
  sky.position.copy(cam.position);
  comp.place(Object.assign({ t }, s.tipa(lt))); if (s.tipaY) comp.holder.position.y += s.tipaY(lt); comp.sync();
  { const tg = s.map ? MAP.grp : s.grp, bx = new THREE.Box3().setFromObject(tg), fw = new THREE.Vector3(); cam.getWorldDirection(fw);
    let mnx = 9, mxx = -9, mny = 9, mxy = -9, front = 0; const v = new THREE.Vector3();
    for (let i = 0; i < 8; i++) { v.set(i & 1 ? bx.max.x : bx.min.x, i & 2 ? bx.max.y : bx.min.y, i & 4 ? bx.max.z : bx.min.z); if (v.clone().sub(cam.position).dot(fw) > 0.1) front++;
      v.project(cam); mnx = Math.min(mnx, v.x); mxx = Math.max(mxx, v.x); mny = Math.min(mny, v.y); mxy = Math.max(mxy, v.y); }
    HERO = { visible: front > 0 && mxx > -1 && mnx < 1 && mxy > -1 && mny < 1, behindCamera: front === 0, heightFrac: Math.max(0, Math.min(1, (Math.min(mxy, 1) - Math.max(mny, -1)) / 2)), box: [mnx, mny, mxx, mxy] }; }
  renderer.autoClear = false; renderer.clear(); renderer.render(scene, cam); renderer.clearDepth(); renderer.render(scene2, cam);
}

const EV = []; SH.forEach(s => { (s.ev || []).forEach(([lt, kind]) => EV.push({ t: +(s.t0 + lt).toFixed(2), kind })); if (s.t0 > 0) EV.push({ t: +(s.t0 - 0.3).toFixed(2), kind: 'whoosh' }); });
window.__events = EV.sort((a, b) => a.t - b.t); window.__heroBox = () => HERO;
window.__dur = DUR; window.__HQ = HQ;
window.__shots = SH.map((s, i) => ({ id: s.id, index: i, t0: s.t0, dur: +(s.t1 - s.t0).toFixed(2) }));
window.__caption = () => null; window.__sceneHash = () => 'toldot10g-s3-v1'; window.__errors = [];
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };

(async () => {
  try {
    await comp.warm();
    for (const s of SH) { frame(s.t0 + 0.5); frame(s.t0 + (s.t1 - s.t0) * 0.5); }
    frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();
}
setTimeout(main, 0);
