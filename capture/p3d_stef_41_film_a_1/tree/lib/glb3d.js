// glb3d.js - skinned GLB models as deterministic "actors" in the stage3d house style (toon material + ink outline).
//
// PATTERN (the GLBs must be loaded BEFORE film() builds the shots, so window.__ready is only set after they are in memory):
//   import { preloadGLBs, glbActor } from '../../lib/glb3d.js';
//   await preloadGLBs({ robot: '../../assets_net/RobotExpressive.glb', fox: '../../assets_net/Fox.glb' });   // top-level await in the module
//   film({ shots: [ { dur: 8, build() { const Wd = world({...});
//       glbActor(Wd, 'robot', t => ({ pos: [0, 0, 0], facing: 0, clip: 'Wave' }), { height: 1.7 });
//       return Object.assign(Wd, { cam: ... }); } } ] });      // film() sets window.__ready itself, after the await
//
// glbActor(Wd, name, fn, opts):
//   fn(t) -> { pos:[x,y,z], facing (rad, 0 = +z, same as person()), scale, clip (name or index), clipTime (s), speed, hidden }
//   opts  -> { height (m, auto-fit, feet on the ground), scale, yaw (extra rotation if the model faces another way), ink (outline width in m,
//             false = off), fade (crossfade seconds, default .35), colors {materialName: hex}, tint (hex multiplier), clone (default true) }
// Animation is a pure function of t: every clip's time is set explicitly and mixer.update(0) is called (never update(dt)).
// Crossfade: fn is sampled over the last `fade` seconds and each clip gets the share of samples in which it was active.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { toon } from './stage3d.js';

const CACHE = {};

// XHR + parse (fetch() cannot read file:// pages, XHR can with --allow-file-access-from-files; works on http too)
function fetchBuf(url) {
  return new Promise((ok, bad) => {
    const x = new XMLHttpRequest(); x.open('GET', url); x.responseType = 'arraybuffer';
    x.onload = () => (x.status === 200 || x.status === 0) && x.response && x.response.byteLength > 100 ? ok(x.response) : bad(new Error('glb3d: cannot load ' + url + ' (' + x.status + ')'));
    x.onerror = () => bad(new Error('glb3d: network error ' + url)); x.send();
  });
}
export async function preloadGLBs(map) {
  const loader = new GLTFLoader();
  await Promise.all(Object.entries(map).map(async ([name, url]) => {
    const buf = await fetchBuf(url);
    const gltf = await new Promise((ok, bad) => loader.parse(buf, url.replace(/[^/]*$/, ''), ok, bad));
    CACHE[name] = gltf;
  }));
  return Object.keys(map);
}
export const glbClips = name => (CACHE[name] ? CACHE[name].animations.map(a => a.name) : []);

function hull(w, color) {
  const m = new THREE.MeshBasicMaterial({ color: color || 0x15100c, side: THREE.BackSide });
  m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normalize(normal) * ' + w.toFixed(6) + ';'); };
  m.customProgramCacheKey = () => 'glbhull' + w.toFixed(6);
  return m;
}

function toToon(m, geo, o) {
  const hasVC = !!geo.attributes.color, col = m.color ? m.color.clone() : new THREE.Color(0xcccccc);
  if (o.colors && o.colors[m.name] !== undefined) col.set(o.colors[m.name]);
  if (o.tint !== undefined) col.multiply(new THREE.Color(o.tint));
  const t = toon(col, { map: m.map || null, side: m.side, transparent: !!m.transparent, opacity: m.opacity === undefined ? 1 : m.opacity, alphaTest: m.alphaTest || 0, vertexColors: hasVC });
  if (m.emissive && m.emissive.getHex() !== 0) t.emissive.copy(m.emissive);
  t.name = m.name; return t;
}

export function glbActor(Wd, name, fn, opts) {
  opts = opts || {};
  const src = CACHE[name]; if (!src) throw new Error('glb3d: "' + name + '" not preloaded - await preloadGLBs({...}) before film()');
  const model = SkeletonUtils.clone(src.scene), clips = src.animations, mixer = new THREE.AnimationMixer(model);
  const acts = clips.map(c => mixer.clipAction(c)), idx = c => typeof c === 'number' ? c : clips.findIndex(x => x.name === c);
  const st0 = fn ? fn(0) : {}, defClip = st0.clip !== undefined ? st0.clip : (opts.fitClip !== undefined ? opts.fitClip : 0);
  const skinned = [], meshes = [];
  model.traverse(o => { if (o.isMesh) { meshes.push(o); if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();   // e.g. Fox has none: toon would render black
    o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;   // skinned boxes go stale while animating
    o.material = Array.isArray(o.material) ? o.material.map(m => toToon(m, o.geometry, opts)) : toToon(o.material, o.geometry, opts); if (o.isSkinnedMesh) skinned.push(o); } });
  // pose at time 0 of the first clip, then measure for the auto-fit
  const ci0 = idx(defClip); if (clips.length && ci0 >= 0) { acts[ci0].play(); acts[ci0].time = 0; mixer.update(0); }
  const fit = new THREE.Group(), g = new THREE.Group(); fit.add(model); g.add(fit);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model, true), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  const k = opts.height ? opts.height / Math.max(size.y, 1e-6) : (opts.scale || 1);
  fit.scale.setScalar(k); if (opts.ground !== false) model.position.set(-ctr.x, -box.min.y, -ctr.z);
  g.updateMatrixWorld(true);
  // ink outline: a back-face copy that shares the skeleton; width converted from metres to the mesh's own units
  const H0 = []; if (opts.ink !== false) {
    const wWorld = typeof opts.ink === 'number' ? opts.ink : (opts.height || size.y * k) * .011;
    for (const m of meshes) {
      m.geometry.computeBoundingBox(); const gb = m.geometry.boundingBox.getSize(new THREE.Vector3()), wb = new THREE.Box3().setFromObject(m, true).getSize(new THREE.Vector3());
      const r = Math.max(wb.x, wb.y, wb.z) / Math.max(gb.x, gb.y, gb.z, 1e-6), w = wWorld / Math.max(r, 1e-6);
      H0.push({ name: m.name, wWorld, r, w, gb: gb.toArray(), wb: wb.toArray() }); const mat = hull(w, opts.inkColor), o = m.isSkinnedMesh ? new THREE.SkinnedMesh(m.geometry, mat) : new THREE.Mesh(m.geometry, mat);
      if (m.isSkinnedMesh) o.bind(m.skeleton, m.bindMatrix); o.frustumCulled = false; o.raycast = () => {}; o.castShadow = false; m.add(o);
    }
  }
  Wd.add(g);
  const N = 4, fade = opts.fade === undefined ? .35 : opts.fade, yaw = opts.yaw || 0;
  const H = { group: g, model, mixer, clips: clips.map(c => c.name), height: size.y * k, inkInfo: H0 };
  Wd.on(t => {
    const st = fn ? fn(t) : {};
    if (st.hidden) { g.visible = false; return; } g.visible = true;
    const p = st.pos || [0, 0, 0]; g.position.set(p[0], p[1] || 0, p[2]); g.rotation.y = (st.facing || 0) + yaw; g.scale.setScalar((st.scale || 1) * (opts.scale && opts.height ? opts.scale : 1));
    if (!clips.length) return;
    // clip weights = share of the last `fade` seconds (sampled) in which the clip was active
    const W = new Map(); let S = 0;
    for (let i = 0; i <= N; i++) {
      const ts = t - fade * (1 - i / N), s = i === N ? st : (fn && fade > 0 ? fn(ts) : st), c = idx(s.clip !== undefined ? s.clip : defClip); if (c < 0) continue;
      const sp = s.speed === undefined ? 1 : s.speed, tc = (s.clipTime !== undefined ? s.clipTime : ts * sp) + (t - ts) * sp, wgt = i + 1; S += wgt;
      const e = W.get(c) || { w: 0, t: 0 }; e.w += wgt; e.t = tc; W.set(c, e);
    }
    acts.forEach((a, c) => {
      const e = W.get(c);
      if (!e || S <= 0) { if (a.isRunning()) a.stop(); return; }
      const d = a.getClip().duration || 1; a.play(); a.paused = false; a.time = st.once ? Math.min(e.t, d - 1e-3) : ((e.t % d) + d) % d; a.setEffectiveWeight(e.w / S); a.setEffectiveTimeScale(1);
    });
    mixer.update(0);
  });
  return H;
}
