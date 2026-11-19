// richness.js - scene richness probe for tools/verify_scene.py (added 17/11/2026).
//
// HOW TO USE (in a shot or film file, after the shot's world exists):
//   import { installRichness } from '../lib/richness.js';   // path relative to the film file
//   const rich = installRichness(Wd.scene);                  // once per shot scene
//   Wd.on(rich.onFrame);                                     // so the probe knows the camera of each frame
// MARK OBJECTS (userData is read by the probe; nothing else changes):
//   obj.userData.kind = 'map' | 'rock' | 'boat' | ...   // a kind word; 'map' counts toward mapShare
//                                                       // (set it on the group; children inherit it)
//   obj.userData.text = true                            // an in-scene Hebrew label (sign, board, sprite)
// window.__richness(t) returns {objects, kinds, texts, mapShare} for the frame currently rendered.
// It is meant to be called right after window.__seek(t) (verify_scene.py does that). Returns null
// when no frame has been rendered yet.
//   objects  = visible meshes/sprites inside the camera view (sky excluded)
//   kinds    = distinct kinds in view (userData.kind, else geometry type, else material type)
//   texts    = visible nodes with userData.text === true inside the view
//   mapShare = approximate fraction of the screen covered by 'map' objects (0..1, boxes, may overlap)

import { THREE } from './stage3d.js';

const LAST = { scene: null, cam: null };

function kindOf(o) {
  for (let p = o; p; p = p.parent) if (p.userData && p.userData.kind) return String(p.userData.kind);
  if (o.geometry && o.geometry.type) return o.geometry.type;
  if (o.material && o.material.type) return o.material.type;
  return o.type || 'unknown';
}

function inView(o, fr) {
  if ((o.isMesh || o.isSprite) && o.geometry) {
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const s = o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld);
    return fr.intersectsSphere(s);
  }
  const b = new THREE.Box3().setFromObject(o, true);
  return !b.isEmpty() && fr.intersectsBox(b);
}

// approximate screen share of one object: project its box corners (only corners in front of the lens)
function screenShare(o, view, proj, near) {
  const b = new THREE.Box3().setFromObject(o, true);
  if (b.isEmpty()) return 0;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, front = 0;
  const v = new THREE.Vector3();
  for (let m = 0; m < 8; m++) {
    v.set(m & 1 ? b.max.x : b.min.x, m & 2 ? b.max.y : b.min.y, m & 4 ? b.max.z : b.min.z).applyMatrix4(view);
    if (v.z >= -near) continue;
    front++;
    v.applyMatrix4(proj);
    x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
  }
  if (!front) return 0;
  x0 = Math.max(-1, x0); x1 = Math.min(1, x1); y0 = Math.max(-1, y0); y1 = Math.min(1, y1);
  return Math.max(0, x1 - x0) * Math.max(0, y1 - y0) / 4;   // NDC area 4 = whole screen
}

function compute(scene, cam) {
  scene.updateMatrixWorld(true);
  cam.updateMatrixWorld(true);
  const view = cam.matrixWorldInverse, proj = cam.projectionMatrix;
  const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(proj, view));
  const kinds = new Set(), mapRoots = [];
  let objects = 0, texts = 0;
  scene.traverseVisible(o => {
    if (o === scene) return;
    const ud = o.userData || {};
    if (ud.text === true && inView(o, fr)) texts++;
    if (ud.kind === 'map') {
      let nested = false;
      for (let p = o.parent; p && p !== scene; p = p.parent) if (p.userData && p.userData.kind === 'map') { nested = true; break; }
      if (!nested) mapRoots.push(o);
    }
    if (!(o.isMesh || o.isSprite)) return;
    if (o.renderOrder <= -10 || ud.kind === 'sky') return;   // sky dome (world() sets renderOrder -10)
    if (!inView(o, fr)) return;
    objects++;
    kinds.add(kindOf(o));
  });
  let mapShare = 0;
  for (const o of mapRoots) if (inView(o, fr)) mapShare += screenShare(o, view, proj, cam.near);
  return { objects, kinds: kinds.size, texts, mapShare: Math.min(1, +mapShare.toFixed(3)) };
}

export function installRichness(scene, opts) {
  opts = opts || {};
  const onFrame = (t, cam) => { LAST.scene = scene; LAST.cam = cam || opts.camera || null; };
  if (opts.camera) LAST.cam = opts.camera;
  if (!window.__richness) {
    window.__richness = t => {
      if (!LAST.scene || !LAST.cam) return null;   // t is part of the contract; the page must already be at t
      return compute(LAST.scene, LAST.cam);
    };
  }
  return { onFrame };
}
