// hall.js - shared module for the odt_haim1 films: the bright activity hall, the people looks, small helpers.
//   hallWorld(o)            -> Wd with the hall already built (floor y=0, x in +-16, z in +-12, sun from the left)
//   Wd.setMood(fn)          -> fn(t) in 0..1 : 0 warm gold, 1 soft grey (used for "pushing" vs "pulling")
//   INSTR, GROUP[8], man(Wd, look, fn), spots(cx,cz,r,n,a0,a1), lean(Wd,P,fn), confetti(...), shot(...)
//   re-exports: route (y:0 default via walkTo), cine, ct
import { THREE, world, box, cyl, ball, toon, canvasTex, rng, clamp, lerp, ease, prog, person } from '../../lib/stage3d.js';
import { POSES } from '../../lib/figure3d.js';
import * as P from '../../lib/props3d.js';
import { route, cine, ct } from '../azamra342/road.js';
export { route, cine, ct, P, THREE, ease, prog, clamp, lerp, rng };

// two extra arm poses (arms straight forward = pushing; both hands in front = clap)
POSES.push2 = { armA: [-1.4, 0, -.1], armB: [-1.4, 0, .1], foreA: [-.12, 0, 0], foreB: [-.12, 0, 0], chest: [.1, 0, 0] };

export const HX = 16, HZ = 12, WALL_H = 7.5;
export const NAVY = 0x1f2a44, CREAM = 0xf6efe2, WOOD = 0xc89a6a, GOLD = 0xc9a227;

export const INSTR = { coat: '#2a2f3a', beard: '#4a3424', beardLen: .45, hat: 'kippa', hatColor: '#101014', skin: '#eccaa8', pants: '#1b1d24' };
const COATS = ['#2b3a5a', '#3a3a40', '#4a3a2e', '#2e4a3e'];
const SKINS = ['#eccaa8', '#e6bf9a', '#f0d2b4', '#dcb08a', '#eccaa8', '#e9c4a0', '#f0d2b4', '#e2b894'];
const BEARDS = [0, .3, 0, .25, 0, 0, .35, 0];
export const GROUP = COATS.concat(COATS).map((c, i) => ({ coat: COATS[(i * 3 + (i >> 2)) % 4], hat: 'kippa', hatColor: '#101014', beard: ['#3a2a1e', '#2b2018', '#5a4030'][i % 3], beardLen: BEARDS[i], skin: SKINS[i], pants: '#1b1d24', seed: .13 + i * .11 }));

// a man on the hall floor
export function man(Wd, look, fn, o) { return person(Wd, look, t => Object.assign({ seed: look.seed }, fn(t)), o); }
// walking helper: route with y=0
export function walkTo(keys) { return route(keys, { y: 0 }); }
// positions on a circle (angles in degrees measured from +z, turning towards +x); facing = towards the centre
export function spots(cx, cz, r, n, a0, a1) {
  const out = []; for (let i = 0; i < n; i++) { const a = (n === 1 ? (a0 + a1) / 2 : a0 + (a1 - a0) * i / (n - 1)) * Math.PI / 180, x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r; out.push({ x, z, f: Math.atan2(cx - x, cz - z) }); }
  return out;
}
// lean a person (rad, positive = backwards relative to its facing) - pivot at the feet
export function lean(Wd, Pn, fn) {
  const ax = new THREE.Vector3(), q = new THREE.Quaternion();
  Wd.on(t => { const s = fn(t); ax.set(Math.cos(s.facing), 0, -Math.sin(s.facing)); q.setFromAxisAngle(ax, -s.ang); Pn.group.quaternion.copy(q); });
}
export function shot(dur, capIds, capAt, build) { return { dur, caps: capIds, capAt, build }; }

// falling gold/cream confetti, a pure function of t
export function confetti(Wd, c, t0, n, seed, o) {
  o = o || {}; const r = rng(seed), g = new THREE.BoxGeometry(.09, .02, .06), m = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), im = new THREE.InstancedMesh(g, m, n), cols = [0xc9a227, 0xf6efe2, 0xe8b64a, 0x4a6aa8];
  const it = []; for (let i = 0; i < n; i++) { it.push({ x: (r() - .5) * 7, z: (r() - .5) * 7, y: 3 + r() * 3, v: .7 + r() * .8, ph: r() * 6, sp: 2 + r() * 3 }); im.setColorAt(i, new THREE.Color(cols[i % 4])); }
  im.frustumCulled = false; const D = new THREE.Object3D(); Wd.add(im);
  Wd.on(t => { const u = t - t0; for (let i = 0; i < n; i++) { const s = it[i], fall = (u * s.v) % 6, vis = u > 0; D.position.set(c[0] + s.x + Math.sin(u * 1.3 + s.ph) * .3, vis ? Math.max(.02, s.y - fall - (u > 0 ? 0 : 0)) : -9, c[2] + s.z); D.rotation.set(u * s.sp, u * s.sp * .7, 0); D.scale.setScalar(1); D.updateMatrix(); im.setMatrixAt(i, D.matrix); } im.instanceMatrix.needsUpdate = true; });
  return im;
}

// ---------------------------------------------------------------- the hall
function plankTex() {
  const r = rng(77), cols = ['#c89a6a', '#c0925f', '#d0a374', '#bb8c5c'];
  return canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < h; y += 32) { let x = -r() * 100; while (x < w) { const bw = 100 + r() * 130; g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(x, y, bw, 32); g.fillStyle = 'rgba(90,55,25,.35)'; g.fillRect(x, y, 2, 32); x += bw; } g.fillStyle = 'rgba(90,55,25,.4)'; g.fillRect(0, y, w, 2); } }, [16, 12]);
}
const quad = (a, b, c, d, mat) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3)); const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 3; return m; };
const noCast = o => { o.traverse(m => { if (m.isMesh) m.castShadow = false; }); return o; };

export function buildHall(Wd) {
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2 * HX, 2 * HZ), toon(0xffffff, { map: plankTex() })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; Wd.add(fl);
  const wm = 0xeedcbc;
  const walls = [box(2 * HX + 1, WALL_H, .5, wm, { pos: [0, WALL_H / 2, HZ + .25], ink: false }), box(2 * HX + 1, WALL_H, .5, wm, { pos: [0, WALL_H / 2, -HZ - .25], ink: false }),
    box(.5, WALL_H, 2 * HZ, wm, { pos: [-HX - .25, WALL_H / 2, 0], ink: false }), box(.5, WALL_H, 2 * HZ, wm, { pos: [HX + .25, WALL_H / 2, 0], ink: false })];
  walls.forEach(w => { w.castShadow = false; Wd.add(w); });
  // navy skirting + cream wainscot line
  for (const [w, h, d, x, z] of [[2 * HX, .16, .1, 0, HZ - .05], [2 * HX, .16, .1, 0, -HZ + .05], [.1, .16, 2 * HZ, -HX + .05, 0], [.1, .16, 2 * HZ, HX - .05, 0]]) Wd.add(noCast(box(w, h, d, NAVY, { pos: [x, .08, z], ink: false })));
  // rafters
  for (let x = -14; x <= 14; x += 4) Wd.add(noCast(box(.3, .4, 2 * HZ, 0xb98a5c, { pos: [x, WALL_H - .2, 0], ink: false })));
  // big windows on the left wall + warm sun patches on the floor
  const glass = new THREE.MeshBasicMaterial({ color: 0xfff1cc, fog: false }), patchM = new THREE.MeshBasicMaterial({ color: 0xffdca0, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const beamM = new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: .035, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const xw = -HX + .03, y0 = 1.4, y1 = 6.0, k = 30 / 26, kz = -8 / 26; const patches = [];
  for (const zc of [-8.4, -2.8, 2.8, 8.4]) {
    const hw = 1.7, gl = new THREE.Mesh(new THREE.PlaneGeometry(2 * hw, y1 - y0), glass); gl.rotation.y = Math.PI / 2; gl.position.set(xw, (y0 + y1) / 2, zc); Wd.add(gl);
    Wd.add(noCast(box(.12, y1 - y0 + .3, .14, 0xf6efe2, { pos: [xw + .02, (y0 + y1) / 2, zc - hw - .04], ink: false }))); Wd.add(noCast(box(.12, y1 - y0 + .3, .14, 0xf6efe2, { pos: [xw + .02, (y0 + y1) / 2, zc + hw + .04], ink: false })));
    for (const yy of [y0 - .08, y1 + .08, (y0 + y1) / 2]) Wd.add(noCast(box(.12, .14, 2 * hw + .2, 0xf6efe2, { pos: [xw + .02, yy, zc], ink: false })));
    Wd.add(noCast(box(.1, y1 - y0, .08, 0xf6efe2, { pos: [xw + .02, (y0 + y1) / 2, zc], ink: false })));
    const fb = (z, y) => [xw + k * y, .02, z + kz * y], pa = quad(fb(zc - hw, y0), fb(zc + hw, y0), fb(zc + hw, y1), fb(zc - hw, y1), patchM); Wd.add(pa); patches.push(pa);
    const bm = quad([xw, y1, zc - hw], [xw, y1, zc + hw], fb(zc + hw, y1), fb(zc - hw, y1), beamM); Wd.add(bm); patches.push(bm);
    const bm2 = quad([xw, y0, zc - hw], [xw, y0, zc + hw], fb(zc + hw, y0), fb(zc - hw, y0), beamM); Wd.add(bm2); patches.push(bm2);
  }
  // a few stacked chairs and a table at the right side
  P.table(Wd, { pos: [13.6, 0, -4.5], w: 2.6, d: 1.0, rot: Math.PI / 2 });
  for (const [x, z, n, ry] of [[14.6, 6.2, 5, .1], [14.6, 7.5, 4, -.08], [13.4, 10.4, 6, 1.45]]) for (let i = 0; i < n; i++) P.chair(Wd, { pos: [x + (i % 2) * .02, i * .17, z], rot: Math.PI / 2 * 0 + ry + Math.PI * .5 });
  Wd.patches = patches; return Wd;
}

export function hallWorld(o) {
  const warm = Object.assign({ skyTop: 0xcfe3f5, skyBottom: 0xfff1d8, fogColor: 0xf6eada, fogNear: 45, fogFar: 150, sun: 2.0, sunColor: 0xffd9a0, sunPos: [-30, 26, 8], hemi: 1.6, hemiSky: 0xfffaf0, hemiGround: 0xd8b48a, shadowExt: 24, skyR: 400 }, o || {});
  const Wd = world(warm); buildHall(Wd);
  // mood: 0 = warm gold, 1 = soft grey
  const C = c => new THREE.Color(c), base = { sun: C(warm.sunColor), hs: C(warm.hemiSky), hg: C(warm.hemiGround), fog: C(warm.fogColor), top: C(warm.skyTop), bot: C(warm.skyBottom) };
  const grey = { sun: C(0xb4bcc8), hs: C(0xdfe4ea), hg: C(0xa6a8aa), fog: C(0xd6d9dc), top: C(0xb9c3cf), bot: C(0xdcdedf) }, u = Wd.sky.material.uniforms;
  Wd.setMood = fn => Wd.on(t => { const g = clamp(fn(t), 0, 1);
    Wd.sun.color.copy(base.sun).lerp(grey.sun, g); Wd.sun.intensity = warm.sun * (1 - .45 * g); Wd.hemi.color.copy(base.hs).lerp(grey.hs, g); Wd.hemi.groundColor.copy(base.hg).lerp(grey.hg, g); Wd.hemi.intensity = warm.hemi * (1 - .08 * g);
    Wd.scene.fog.color.copy(base.fog).lerp(grey.fog, g); u.top.value.copy(base.top).lerp(grey.top, g); u.bot.value.copy(base.bot).lerp(grey.bot, g);
    for (const p of Wd.patches) p.material.opacity = (p.material.userData.o0 = p.material.userData.o0 || p.material.opacity) * (1 - g); });
  return Wd;
}
