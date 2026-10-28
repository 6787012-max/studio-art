// sh25.js - siach 25/10/2026 helpers: rain world, roads, car, bus, room, props. Everything is a pure function of t. No text on any prop.
import { THREE, box, cyl, ball, mesh, toon, ink, canvasTex, rng, clamp, lerp, ease, prog, rain, cloud, world } from '../../lib/stage3d.js';
import * as P from '../../lib/props3d.js';
import * as S from './shared.js';
import * as K from './kit.js';

export const PI = Math.PI, V3 = (x, y, z) => new THREE.Vector3(x, y, z), C = h => new THREE.Color(h);
export const DS = THREE.DoubleSide;
export const CARC = 0xE9EEF2, ACC = 0x7FB8E8, SEAT = 0xF2E6D2, WET = 0x5E6670, PUD = 0x9FB3C4, GOLD = 0xF5B820, KGOLD = 0xFFD54A;
export const bell = u => Math.sin(PI * clamp(u, 0, 1));

// ---------------------------------------------------------------- looks
export const DRIVER = { coat: '#1d1d24', skin: '#efcfb0', pants: '#15151c', hat: 'kippa', hatColor: '#2A4A8A', beard: '#2a2018', beardLen: .2, vest: false };
export const WETJEW = { coat: '#17171d', skin: '#e6bf9a', pants: '#101014', hat: 'kippa', hatColor: '#2A4A8A', beard: '#8a8a86', beardLen: .8, vest: false, coatLength: .4 };
export const BUSMAN = { coat: '#25252e', skin: '#e6bf9a', pants: '#15151c', hat: 'kippa', hatColor: '#2A4A8A', beard: '#9a9a96', beardLen: .7, vest: false, coatLength: .4 };
export const FATHER = { coat: '#F4F3EE', skin: '#efcfb0', pants: '#2a2a33', hat: 'kippa', hatColor: '#2A4A8A', beard: '#2a2018', beardLen: .2, vest: false };
export const LITTLE = Object.assign({}, S.BOY, { hatColor: '#5AA0E8' });
export const TRAVL = i => ({ coat: '#BFA67A', skin: ['#d9ac86', '#e6bf9a', '#dfb48c'][i % 3], pants: '#BFA67A', hat: 'kippa', hatColor: '#E8E0C8', beard: ['#3a2618', '#2a2018', '#4a3626'][i % 3], beardLen: .55, vest: false });

// ---------------------------------------------------------------- textures / small helpers
let _dot = null;
export const dotTex = () => _dot || (_dot = canvasTex(64, 64, (g, w, h) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.55, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }));
export const glassMat = (op, col) => new THREE.MeshBasicMaterial({ color: col === undefined ? 0xBFD8EA : col, transparent: true, opacity: op === undefined ? .22 : op, side: DS, depthWrite: false });
export const slab = (w, h, d, col, pos, o) => { o = o || {}; const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(col, Object.assign({ side: DS }, o.mat || {}))); m.position.set(...pos); m.castShadow = o.cast !== false; m.receiveShadow = true; if (o.ink !== false) ink(m, o.inkW || .02, undefined, true); return m; };
export function pillar(g, a, b, col, w) { const A = V3(...a), B = V3(...b), d = B.clone().sub(A), L = d.length(), m = new THREE.Mesh(new THREE.BoxGeometry(w || .06, w || .06, L), toon(col === undefined ? 0x39414A : col)); m.position.copy(A).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(V3(0, 0, 1), d.normalize()); m.castShadow = true; g.add(m); return m; }
export function flatDisc(Wd, x, y, z, rx, rz, col, op) { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op === undefined ? .85 : op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); m.rotation.x = -PI / 2; m.scale.set(rx, rz, 1); m.position.set(x, y, z); if (Wd) Wd.add(m); return m; }
export function glow(Wd, size, op, col) { return S.glowSp(Wd, size, op, col); }

// ---------------------------------------------------------------- rain world
export const rainSky = o => Object.assign({ ground: 'grass', skyTop: 0xA9B8C8, skyBottom: 0xDCE3EA, fogColor: 0xDCE3EA, fogNear: 30, fogFar: 170, sun: .85, sunColor: 0xF0F3F8, hemi: 1.7, hemiSky: 0xE4ECF4, hemiGround: 0x9AA88A, sunPos: [-25, 45, 15], shadowExt: 32, groundSize: 700, groundRep: [120, 120] }, o || {});
// rain streaks (white 35%) that follow the camera: cam = the shot camera function
export function rainCam(Wd, camFn, o) {
  o = o || {}; const hx = o.half || 15;
  return rain(Wd, { count: o.count || 1400, x0: -hx, x1: hx, z0: -hx, z1: hx, top: o.top || 16, bottom: 0, color: 0xFFFFFF, opacity: .35, speed: o.speed || 17, len: o.len || .7, amount: o.amount, seed: o.seed || 5,
    offset: t => { const c = camFn(t), p = c.pos, l = c.look, dx = l[0] - p[0], dz = l[2] - p[2], d = Math.hypot(dx, dz) || 1, k = Math.min(9, d * .5) / d; return [p[0] + dx * k, p[2] + dz * k]; } });
}
export function hills(Wd, list) { for (const [x, z, r, col, sy] of list) Wd.add(ball(r, col, { pos: [x, -r * (sy || .5) * .35, z], scale: [1, sy || .5, 1.25], ink: false })); }
export function rtree(Wd, x, z, s, amp, ph, kind) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); Wd.add(g);
  g.add(cyl(.14, .22, 2.0, 0x6B4A30, { pos: [0, 1.0, 0], inkW: .02 }));
  const gr = [0x4E8F3A, 0x5C9C42, 0x44823A];
  if (kind === 1) [[1.3, 1.2, 2.2], [1.0, 1.1, 3.0], [.7, 1.0, 3.8]].forEach(([r, h, y], i) => g.add(mesh(new THREE.ConeGeometry(r, h * 1.5, 12), toon(gr[i]), { pos: [0, y, 0], inkW: .02 })));
  else [[0, 3.0, 0, 1.4], [.8, 2.5, .3, 1.0], [-.7, 2.6, -.3, 1.1]].forEach(([px, py, pz, r], i) => g.add(ball(r, gr[i], { pos: [px, py, pz], inkW: .03 })));
  if (amp) Wd.on(t => { g.rotation.z = amp * Math.sin(t * 1.9 + ph) + amp * .5 * Math.sin(t * 3.1 + ph * 2); g.rotation.x = amp * .4 * Math.sin(t * 1.3 + ph); });
  return g;
}
// road slab group: local z axis = driving axis. o: x,z,rot,len,w,lanes
export function highway(Wd, o) {
  const g = new THREE.Group(); g.position.set(o.x || 0, 0, o.z || 0); g.rotation.y = o.rot || 0; Wd.add(g);
  const L = o.len, w = o.w || 14, lanes = o.lanes === undefined ? 1 : o.lanes;
  const sl = new THREE.Mesh(new THREE.BoxGeometry(w, .08, L), toon(WET)); sl.position.y = .04; sl.receiveShadow = true; g.add(sl);
  if (o.shoulder !== false) for (const s of [-1, 1]) { const sh = new THREE.Mesh(new THREE.BoxGeometry(2.4, .07, L), toon(0x8E8C84)); sh.position.set(s * (w / 2 + 1.2), .035, 0); sh.receiveShadow = true; g.add(sh); }
  const sheenM = new THREE.MeshBasicMaterial({ color: 0xDCE6EE, transparent: true, opacity: .15, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  for (const c of (o.sheen || [-w / 4, w / 4])) { const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, L), sheenM); sh.rotation.x = -PI / 2; sh.position.set(c + .3, .084, 0); g.add(sh); }
  const lm = new THREE.MeshBasicMaterial({ color: 0xF4F4F0 });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(.16, L), lm); e.rotation.x = -PI / 2; e.position.set(s * (w / 2 - .45), .086, 0); g.add(e); }
  if (lanes) { const n = Math.floor(L / 8), im = new THREE.InstancedMesh(new THREE.PlaneGeometry(.16, 3), lm, n), D = new THREE.Object3D(); for (let i = 0; i < n; i++) { D.position.set(0, .087, -L / 2 + i * 8 + 4); D.rotation.set(-PI / 2, 0, 0); D.updateMatrix(); im.setMatrixAt(i, D.matrix); } im.frustumCulled = false; g.add(im); }
  return g;
}
export function guardrail(Wd, x, z0, z1, rot) { const L = Math.abs(z1 - z0), g = new THREE.Group(); g.position.set(x, 0, (z0 + z1) / 2); g.rotation.y = rot || 0; Wd.add(g); g.add(box(.12, .3, L, 0xB9C0C6, { pos: [0, .7, 0], inkW: .01 }));
  for (let z = -L / 2; z <= L / 2; z += 4) g.add(box(.1, .7, .1, 0x8A9096, { pos: [0, .35, z], ink: false })); return g; }

// ---------------------------------------------------------------- the car (front = +z, driver seat x=+.4, passenger x=-.4, door on the passenger side x=-.835)
export const DRV = [.4, .21, -.18], PAX = [-.4, .21, -.18];
export function toW(st, p) { const c = Math.cos(st.h), s = Math.sin(st.h); return [st.x + p[0] * c + p[2] * s, (st.y || 0) + p[1], st.z - p[0] * s + p[2] * c]; }
export function makeCar(Wd, o) {
  o = o || {}; const bodyC = o.color === undefined ? CARC : o.color, acc = o.accent === undefined ? ACC : o.accent, full = o.interior !== false;
  const g = new THREE.Group(); Wd.add(g);
  const pm = (w, h, d, col, pos, mat) => { const m = slab(w, h, d, col, pos, { mat }); g.add(m); return m; };
  pm(1.74, .55, 1.25, bodyC, [0, .555, 1.425]); pm(1.74, .55, .75, bodyC, [0, .555, -1.675]);
  pm(.07, .55, 2.1, bodyC, [.835, .555, -.25]);
  // passenger door (hinge at the front edge)
  const door = new THREE.Group(); door.position.set(-.835, 0, .8); g.add(door);
  const dp = slab(.07, .55, 2.1, bodyC, [0, .555, -1.05]); door.add(dp);
  const sideGlass = (x, dz) => { const sh = new THREE.Shape(); sh.moveTo(-1.3 - dz, .85); sh.lineTo(.93 - dz, .85); sh.lineTo(.33 - dz, 1.6); sh.lineTo(-.88 - dz, 1.6); sh.closePath(); const geo = new THREE.ShapeGeometry(sh); geo.rotateY(-PI / 2); const m = new THREE.Mesh(geo, glassMat()); m.position.x = x; m.renderOrder = 6; return m; };
  g.add(sideGlass(.83, 0)); door.add(sideGlass(0, .8));
  // accent stripes
  g.add(box(.02, .16, 4.1, acc, { pos: [.88, .5, 0], ink: false })); g.add(box(.02, .07, 1.25, acc, { pos: [-.88, .5, 1.425], ink: false })); g.add(box(.02, .07, .75, acc, { pos: [-.88, .5, -1.675], ink: false })); door.add(box(.02, .07, 2.1, acc, { pos: [-.05, .5, -1.05], ink: false }));
  g.add(box(.5, .012, 1.2, acc, { pos: [0, .84, 1.43], ink: false }));
  // roof, pillars, glass
  pm(1.66, .07, 1.2, bodyC, [0, 1.655, -.28]);
  for (const s of [-1, 1]) { pillar(g, [s * .8, .83, .95], [s * .8, 1.62, .32]); pillar(g, [s * .8, .83, -1.3], [s * .8, 1.62, -.88]); pillar(g, [s * .8, 1.62, .32], [s * .8, 1.62, -.88], 0x39414A, .05); }
  const ws = new THREE.Group(); ws.position.set(0, .84, .95); ws.rotation.x = -Math.atan2(.63, .78); g.add(ws);
  const wsL = Math.hypot(.63, .78), gl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, wsL), glassMat(.2)); gl.position.y = wsL / 2; gl.renderOrder = 6; ws.add(gl);
  const rw = new THREE.Group(); rw.position.set(0, .83, -1.3); rw.rotation.x = Math.atan2(.42, .79); g.add(rw);
  const rgl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, Math.hypot(.42, .79)), glassMat(.2)); rgl.position.y = Math.hypot(.42, .79) / 2; rgl.renderOrder = 6; rw.add(rgl);
  // wipers
  const wip = []; for (const px of [.4, -.18]) { const pv = new THREE.Group(); pv.position.set(px, .03, .02); ws.add(pv); pv.add(box(.03, .72, .014, 0x1c1c20, { pos: [0, .36, 0], ink: false })); pv.add(box(.05, .1, .02, 0x1c1c20, { pos: [0, .02, 0], ink: false })); wip.push(pv); }
  // wheels, lights, plates, mirrors
  const wheels = []; for (const sx of [-1, 1]) for (const zz of [1.28, -1.28]) { const pv = new THREE.Group(); pv.position.set(sx * .83, .34, zz); const t = cyl(.34, .34, .22, 0x2A2A33, { rot: [0, 0, PI / 2], inkW: .02 }); pv.add(t); pv.add(cyl(.17, .17, .24, 0xE8E0C8, { rot: [0, 0, PI / 2], ink: false })); pv.add(box(.25, .06, .3, 0x6a6a72, { ink: false })); g.add(pv); wheels.push(pv); }
  for (const s of [-1, 1]) { g.add(ball(.12, 0xFFE9A8, { pos: [s * .55, .72, 2.06], scale: [1.4, .8, .4], ink: false })); g.add(box(.3, .1, .04, 0xDC5A4C, { pos: [s * .6, .8, -2.06], ink: false })); g.add(box(.12, .1, .2, bodyC, { pos: [s * .98, 1.0, .72], inkW: .01 })); }
  g.add(box(.5, .13, .03, 0xF4F4F0, { pos: [0, .45, 2.07], ink: false })); g.add(box(.5, .13, .03, 0xF4F4F0, { pos: [0, .62, -2.07], ink: false }));
  const api = { g, door, wheels, wip, ws, glass: [gl, rgl] };
  if (full) {
    pm(1.6, .03, 2.1, 0x8E8A84, [0, .3, -.25], {});
    const sm = c => toon(c, { emissive: 0x2a2012 }), sb = (w, h, d, pos, rot) => { const m = mesh(new THREE.BoxGeometry(w, h, d), sm(SEAT), { pos, rot, inkW: .012, box: true }); g.add(m); return m; };
    for (const x of [.4, -.4]) { sb(.5, .12, .52, [x, .5, -.05]); sb(.5, .62, .13, [x, .85, -.38], [-.12, 0, 0]); sb(.22, .16, .1, [x, 1.22, -.43]); }
    sb(1.4, .12, .5, [0, .5, -.95]); sb(1.4, .6, .12, [0, .84, -1.22], [-.12, 0, 0]);
    g.add(box(1.56, .2, .5, 0xCFC6B8, { pos: [0, .86, .66], inkW: .012 })); g.add(box(1.5, .04, .46, 0x8E8A84, { pos: [0, .975, .66], ink: false }));
    for (const x of [.4, 0, -.4]) g.add(box(.16, .03, .05, 0x4A4A52, { pos: [x, 1.0, .72], ink: false }));
    const sw = new THREE.Mesh(new THREE.TorusGeometry(.17, .022, 10, 28), toon(0x2a2a30)); sw.position.set(.4, 1.04, .36); sw.rotation.x = -.35; sw.castShadow = true; g.add(sw); g.add(cyl(.03, .03, .3, 0x2a2a30, { pos: [.4, .93, .5], rot: [PI / 2 - .6, 0, 0], ink: false }));
    g.add(box(1.5, .1, .1, 0xCFC6B8, { pos: [0, .82, .4], ink: false }));
  }
  api.update = st => {
    g.position.set(st.x, st.y || 0, st.z); g.rotation.y = st.h; const sp = (st.dist || 0) / .34; for (const w of wheels) w.rotation.x = sp;
    door.rotation.y = (st.door || 0) * 1.15; const r = st.wr === undefined ? .8 : st.wr; wip.forEach((w, i) => { w.rotation.z = r > 0 ? .62 + .72 * Math.sin((st.t || 0) * PI * 2 * r + i * .25) : 1.35; });
  };
  return api;
}
// street / car pose helpers
export const heading = (dx, dz) => Math.atan2(dx, dz);

// ---------------------------------------------------------------- city-edge street (along world x): road z in [-5,5], pavement z in [5,8], houses behind
export function cityEdge(Wd, o) {
  o = o || {};
  highway(Wd, { x: 0, z: 0, rot: PI / 2, len: 260, w: 10, lanes: 1, shoulder: false, sheen: [-2.4, 2.4] });
  // right pavement (z 5..8.4) and left pavement
  const pv = new THREE.Mesh(new THREE.BoxGeometry(260, .12, 3.4), toon(0xA9ADB2)); pv.position.set(0, .06, 6.7); pv.receiveShadow = true; Wd.add(pv);
  const pv2 = new THREE.Mesh(new THREE.BoxGeometry(260, .12, 3.0), toon(0xA9ADB2)); pv2.position.set(0, .06, -6.5); pv2.receiveShadow = true; Wd.add(pv2);
  const r = rng(9);
  const cols = [0xF4DFB4, 0xEED8AC, 0xF0E2C0, 0xE9D3A1];
  for (let i = 0; i < 16; i++) { const x = -110 + i * 15 + (r() - .5) * 3; P.house(Wd, { pos: [x, 0, 14.5 + (i % 3) * 2.2], rot: 0, scale: 1.25, color: cols[i % 4] }); }
  for (let i = 0; i < 12; i++) { const x = -100 + i * 19 + (r() - .5) * 4; P.house(Wd, { pos: [x, 0, -15.5 - (i % 3) * 2.5], rot: PI, scale: 1.3, color: cols[(i + 1) % 4] }); }
  for (let i = 0; i < 20; i++) rtree(Wd, -120 + i * 12.5 + r() * 3, 9.8 + r() * .8, .8 + r() * .2, o.sway || 0, i * 1.7, i % 3 === 0 ? 1 : 0);
  hills(Wd, [[-40, -90, 40, 0x8DB070], [60, -100, 46, 0x7FA35A], [-110, -80, 36, 0x97B878], [140, -90, 40, 0x8DB070], [0, 120, 44, 0x8DB070], [-90, 120, 40, 0x7FA35A], [100, 120, 40, 0x97B878]]);
  for (const [x, y, z, s, sd] of [[-60, 40, -60, 4, 3], [30, 44, -80, 5, 5], [80, 38, -50, 3.5, 8], [-20, 42, 70, 4.5, 12]]) Wd.add(cloud({ seed: sd, size: s, pos: [x, y, z], puffs: 6, cast: false, color: 0xEDF1F5 }));
  return { puddleAt: (x, z, rx, rz) => flatDisc(Wd, x, .095, z, rx, rz, PUD, .9) };
}

// ---------------------------------------------------------------- drips & splash
export function drips(Wd, Pp, N, gY) {
  const pos = new Float32Array(N * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xCFE4F5, size: .07, map: dotTex(), sizeAttenuation: true, transparent: true, opacity: .95, depthWrite: false })); pts.frustumCulled = false; Wd.add(pts);
  const h = V3(0, 0, 0), a = V3(0, 0, 0), b = V3(0, 0, 0);
  Wd.on(t => {
    if (!Pp.figure) return; S.headPos(Pp, h); S.wpos(Pp.figure.bones.handA.userData.hand, a); S.wpos(Pp.figure.bones.handB.userData.hand, b);
    for (let i = 0; i < N; i++) { const k = i % 4, u = (t * 1.25 + i * .382) % 1, ang = i * 2.4 + Math.floor(t * 1.25 + i * .382) * 1.7; let x, y, z, fall;
      if (k === 0) { x = h.x + .2 * Math.cos(ang); y = h.y + .02; z = h.z + .2 * Math.sin(ang); fall = 1.05; }
      else if (k === 1) { x = h.x + .27 * Math.cos(ang); y = h.y - .95; z = h.z + .27 * Math.sin(ang); fall = .78; }
      else if (k === 2) { x = a.x + .1 * Math.cos(ang); y = a.y - .36; z = a.z + .1 * Math.sin(ang); fall = .7; }
      else { x = b.x + .1 * Math.cos(ang); y = b.y - .36; z = b.z + .1 * Math.sin(ang); fall = .7; }
      const yy = y - fall * u * u; pos[i * 3] = x; pos[i * 3 + 1] = yy < gY ? -999 : yy; pos[i * 3 + 2] = z; }
    geo.attributes.position.needsUpdate = true; });
  return pts;
}
export function bagMesh(col) { const g = new THREE.Group(); g.add(box(.3, .36, .17, col, { pos: [0, -.23, 0], inkW: .008 })); g.add(box(.26, .04, .13, 0xF0E8D8, { pos: [0, -.05, 0], ink: false })); const hd = new THREE.Mesh(new THREE.TorusGeometry(.07, .011, 6, 14), toon(0x3A3A40)); hd.position.y = -.01; g.add(hd); return g; }
// mud blotches on the chest bone, scale in from tStart
export function mudOn(Wd, Pp, tStart, list, col) {
  let done = false, grp = null, items = [];
  Wd.on(t => { if (!done && Pp.figure) { done = true; grp = new THREE.Group(); Pp.figure.bones.chest.add(grp);
      for (const [x, y, z, r, sx, sy, sz] of list) { const m = ball(r, col || 0x6B5A44, { pos: [x, y, z], scale: [sx || 1, sy || 1.2, sz || .4], ink: false }); grp.add(m); items.push(m); } }
    if (!grp) return; const k = ease.out(prog(t, tStart, tStart + .45)); grp.visible = k > .01; grp.scale.setScalar(Math.max(.001, k)); });
}
// water/mud splash particles. spec: {t0,n,src:(i,r)->[x,y,z],vel:(i,r)->[vx,vy,vz], life, size:[a,b], col}
export function splash(Wd, o) {
  const n = o.n, r = rng(o.seed || 17), P0 = [], D = new THREE.Object3D(), im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshLambertMaterial({ color: o.col || 0xE6EFF6 }), n);
  for (let i = 0; i < n; i++) P0.push({ tb: o.t0 + (i / n) * (o.span || 1.0), src: o.src(i, r), v: o.vel(i, r), life: (o.life || 1.1) * (.8 + .4 * r()), s: lerp(o.size[0], o.size[1], r()), mud: r() < (o.mudFrac || 0) });
  im.frustumCulled = false; Wd.add(im);
  Wd.on(t => { for (let i = 0; i < n; i++) { const p = P0[i], tau = t - p.tb; if (tau < 0 || tau > p.life) { D.position.set(0, -999, 0); D.scale.setScalar(.0001); } else { const u = tau / p.life; D.position.set(p.src[0] + p.v[0] * tau, p.src[1] + p.v[1] * tau - 4.9 * tau * tau, p.src[2] + p.v[2] * tau); D.scale.setScalar(p.s * (1 - .55 * u)); if (D.position.y < .06) D.position.y = .06; }
      D.updateMatrix(); im.setMatrixAt(i, D.matrix); if (o.mudCol) im.setColorAt(i, C(P0[i].mud ? o.mudCol : (o.col || 0xE6EFF6))); }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; });
  return im;
}

// ---------------------------------------------------------------- gold balance scale (beam along local z; heart end at -z)
export function heartMesh() { const m = mesh(S.heartGeo(), S.toonHeart ? S.toonHeart() : toon(0xE8453C, { emissive: 0x6a2008 }), { box: true, inkW: .045 }); return m; }

// ---------------------------------------------------------------- the bus (exterior). front = +z, door on the right side (x = -1.28)
export function makeBus(Wd) {
  const g = new THREE.Group(); Wd.add(g);
  const W = 2.55, L = 10.5;
  g.add(box(W, 1.15, L, 0xF4F6F8, { pos: [0, 1.0, 0], inkW: .03 }));
  g.add(box(W + .04, .3, L - .2, 0x3C7FD8, { pos: [0, .78, 0], ink: false }));
  g.add(box(W, 1.15, L, 0x6F9AC8, { pos: [0, 2.1, 0], inkW: .03 }));
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) g.add(box(.02, .95, .12, 0xF4F6F8, { pos: [s * (W / 2 + .01), 2.1, -4.3 + i * 1.7], ink: false }));
  g.add(box(W, .22, L, 0xDDE3E8, { pos: [0, 2.78, 0], inkW: .03 })); g.add(box(W * .6, .08, L * .8, 0xCBD3DA, { pos: [0, 2.94, 0], inkW: .02 }));
  g.add(box(W - .3, .8, .06, 0x2B4C7A, { pos: [0, 2.0, L / 2 + .01], ink: false })); g.add(box(1.9, .3, .05, 0x1a2a48, { pos: [0, 2.62, L / 2 + .02], ink: false }));
  for (const s of [-1, 1]) { g.add(ball(.13, 0xFFE9A8, { pos: [s * .9, .8, L / 2 + .02], scale: [1.4, .8, .4], ink: false })); g.add(box(.3, .12, .04, 0xDC5A4C, { pos: [s * .95, .9, -L / 2 - .02], ink: false })); }
  const wheels = []; for (const z of [-3.2, 3.4]) for (const s of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(s * 1.0, .5, z); pv.add(cyl(.5, .5, .3, 0x2A2A33, { rot: [0, 0, PI / 2], inkW: .02 })); pv.add(cyl(.25, .25, .32, 0xDDE3E8, { rot: [0, 0, PI / 2], ink: false })); pv.add(box(.34, .08, .4, 0x6a6a72, { ink: false })); g.add(pv); wheels.push(pv); }
  const leaves = []; for (const s of [-1, 1]) { const lf = box(.05, 1.9, .55, 0x2B4C7A, { pos: [-(W / 2 + .03), 1.25, 3.9 + s * .29], inkW: .01 }); g.add(lf); leaves.push([lf, s]); g.add(box(.02, .08, .6, 0xF4F6F8, { pos: [-(W / 2 + .06), 1.25, 3.9 + s * .29], ink: false })); }
  return { g, wheels, update(st) { g.position.set(st.x, 0, st.z); g.rotation.y = st.h; const sp = (st.dist || 0) / .5; for (const w of wheels) w.rotation.x = sp; for (const [lf, s] of leaves) lf.position.z = 3.9 + s * (.29 + (st.door || 0) * .5); } };
}
