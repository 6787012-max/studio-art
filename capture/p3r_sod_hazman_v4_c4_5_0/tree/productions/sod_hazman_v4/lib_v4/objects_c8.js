// objects_c8.js - builder-owned set pieces for chapters c8 / c9 / c10 (sod_hazman_v4). Shared lib_v4 modules are frozen; this file is mine.
// Zero Hebrew, no people, no text except Latin digits. Everything animated is a pure function of the time passed in by the caller.
import { THREE, box, cyl, ball, mesh, toon, canvasTex, rng, ease, prog, clamp, lerp } from '../../../lib/stage3d.js';
import { caption3d, titleCard3d, wordSpans } from './caption3d.js';
import { useDOF } from './dof.js';
import * as O from './objects.js';

export const D2R = Math.PI / 180, TAU = Math.PI * 2, F = mm => 2 * Math.atan(12 / mm) / D2R;
export const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ================================================================== plumbing shared by c8 / c9 / c10
export function kit(CH, ORDER) {
  const LN = id => CH.lines.find(l => l.id === id), T0 = id => LN(id).t0;
  const vtxt = k => String(window.CAPTIONS_VAULT[k] || k);
  const SP = id => { const l = LN(id); return (l.cap && l.words) ? wordSpans(l, vtxt(l.cap)) : []; };
  const gold0 = id => { const s = SP(id).find(w => w.gold); return s ? s.t0 : LN(id).t0; };
  const wordT = (id, i) => { const s = SP(id); return s.length ? s[Math.min(i, s.length - 1)].t0 : LN(id).t0; };
  const START = { intro: 0 }; ORDER.slice(1).forEach(k => { START[k] = T0(k); });
  const ENDOF = k => { const i = ORDER.indexOf(k); return i + 1 < ORDER.length ? START[ORDER[i + 1]] : CH.dur; };
  const baseCam = (Wd, near, far) => Wd.on((t, cam) => { if (cam.near !== near || cam.far !== far) { cam.near = near; cam.far = far; cam.updateProjectionMatrix(); } });
  const finish = (Wd, R) => { if (R.dof) useDOF(Wd, R.dof); caption3d(Wd, null, CH); return Object.assign(Wd, { cam: R.cam }); };
  // camera rig with hard cuts: segs = [{w, p0, p1?, l0, l1?, f0, f1?, e?, ap?, focus?, drift?}]  (w = relative duration)
  const rig = (D, segs) => {
    const tot = segs.reduce((s, x) => s + (x.w || 1), 0); let acc = 0; const T = segs.map(s => { const a = acc; acc += (s.w || 1) / tot * D; return { s, a, b: acc }; });
    const pick = t => { for (const x of T) if (t < x.b) return x; return T[T.length - 1]; };
    const st = t => { const x = pick(t), s = x.s, k = (s.e || ease.io)(prog(t, x.a, x.b)), p = s.pf ? s.pf(t, k) : mix3(s.p0, s.p1 || s.p0, k), l = s.lf ? s.lf(t, k) : mix3(s.l0, s.l1 || s.l0, k), dr = s.drift === undefined ? .008 : s.drift;
      return { pos: [p[0] + Math.sin(t * .7) * dr, p[1] + Math.sin(t * .9 + 1) * dr * .7, p[2]], look: l, fov: lerp(s.f0 || F(35), s.f1 || s.f0 || F(35), k), s }; };
    return { cam: t => { const r = st(t); return { pos: r.pos, look: r.look, fov: r.fov }; },
      dof: t => { const r = st(t), s = r.s; return { focus: s.focus !== undefined ? s.focus : Math.hypot(r.pos[0] - r.look[0], r.pos[1] - r.look[1], r.pos[2] - r.look[2]), ap: s.ap === undefined ? 6 : s.ap, maxR: s.maxR || 14, vig: s.vig === undefined ? .38 : s.vig }; },
      segAt: t => T.findIndex(x => t < x.b) < 0 ? T.length - 1 : T.findIndex(x => t < x.b) };
  };
  return { LN, T0, vtxt, SP, gold0, wordT, START, ENDOF, baseCam, finish, rig };
}

export function introShot(K, world, key) {
  const Wd = world({ fog: false });
  K.baseCam(Wd, .1, 800); O.skyDome(Wd, { top: 0x03061a, mid: 0x0a1844, bot: 0x2a4a86 });
  O.lighting(Wd, { key: [0xffffff, .2, [5, 8, 8]], hemi: [0x6a80c0, 0x101830, .6], noShadow: true });
  [[-30, 8, -60, 40, 0x2a5aa8, .22], [26, -6, -80, 55, 0x4a3a9a, .18], [0, 20, -50, 34, 0x2a6a9a, .14], [-10, -14, -40, 30, 0x5a3a88, .12]].forEach(([x, y, z, s, c, o]) => { const g = O.glow(s, c, o); g.position.set(x, y, z); Wd.add(g); });
  titleCard3d(Wd, key, { pos: [0, 0, 0], width: 7.2, line: { t0: .6, t1: 2.5 } });
  O.motes(Wd, { n: 36, area: [-6, 6, -3, 3, 1, 7], size: .22, color: 0xffd98a, op: .55, seed: 3 });
  O.motes(Wd, { n: 20, area: [-8, 8, -4, 4, -6, -1], size: .3, color: 0x9ab8ff, op: .35, seed: 8 });
  return K.finish(Wd, { cam: t => { const k = ease.sm(prog(t, 0, 4)); return { pos: [0, lerp(.35, .1, k), lerp(13, 9.8, k)], look: [0, 0, 0], fov: F(40) }; }, dof: (t, cam) => ({ focus: Math.hypot(cam.position.x, cam.position.y, cam.position.z), ap: 7, maxR: 12, vig: .38 }) });
}

// ================================================================== lit spheres (Earth / Moon) with a real terminator
let ETEX = null, MTEX = null;
export const earthTex = () => ETEX || (ETEX = O.earthTexture());
export const moonTex = () => MTEX || (MTEX = canvasTex(512, 256, (g, w, h) => {
  const r = rng(91), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d9d4c6'); gr.addColorStop(1, '#cfc9b9'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(120,114,100,' + (.08 + r() * .16) + ')'; g.beginPath(); g.arc(r() * w, r() * h, 6 + r() * 30, 0, 7); g.fill(); }
  for (let i = 0; i < 90; i++) { const x = r() * w, y = r() * h, rr = 3 + r() * 11; g.strokeStyle = 'rgba(90,84,72,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, rr, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,255,245,.10)'; g.beginPath(); g.arc(x + 1, y + 1, rr * .8, 0, 7); g.fill(); }
}));
export function litSphere(R, tex, o) {
  o = o || {};
  const u = { map: { value: tex }, L: { value: V3(1, 0, 0) }, dark: { value: o.dark === undefined ? .1 : o.dark }, rim: { value: new THREE.Color(o.rim || 0x6aa8ff) }, rimK: { value: o.rimK === undefined ? .6 : o.rimK }, warm: { value: o.warm === undefined ? .3 : o.warm } };
  const m = new THREE.Mesh(new THREE.SphereGeometry(R, o.seg || 96, (o.seg || 96) / 2), new THREE.ShaderMaterial({ uniforms: u,
    vertexShader: 'varying vec3 vN; varying vec2 vU; varying vec3 vV; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vN = normalize(mat3(modelMatrix) * normal); vU = uv; vV = cameraPosition - w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform sampler2D map; uniform vec3 L; uniform float dark; uniform vec3 rim; uniform float rimK; uniform float warm; varying vec3 vN; varying vec2 vU; varying vec3 vV; void main(){ vec3 N = normalize(vN); vec3 c = texture2D(map, vU).rgb; float d = dot(N, normalize(L)); float lit = smoothstep(-0.05, 0.16, d); vec3 col = c * mix(dark, 1.0, lit) * (0.8 + 0.2 * max(d, 0.0)); col += vec3(1.0, 0.55, 0.2) * exp(-pow(d / 0.09, 2.0)) * warm * 0.35; float f = pow(1.0 - max(dot(N, normalize(vV)), 0.0), 3.0); col += rim * f * rimK * (0.25 + 0.75 * lit); gl_FragColor = vec4(col, 1.0);\n#include <colorspace_fragment>\n}' }));
  m.userData.u = u; return m;
}
export const llv = (lat, lon, R) => { const ph = (lon + 180) * D2R, th = (90 - lat) * D2R; return V3(-R * Math.cos(ph) * Math.sin(th), R * Math.cos(th), R * Math.sin(ph) * Math.sin(th)); };
export function pinAt(parent, R, lat, lon, color, s) {
  s = s || R * .22; const g = new THREE.Group(), p = llv(lat, lon, R); g.position.copy(p); g.quaternion.setFromUnitVectors(V3(0, 1, 0), p.clone().normalize());
  { const c = new THREE.Mesh(new THREE.ConeGeometry(s * .13, s, 10), O.basic(color)); c.position.y = s * .5; c.rotation.x = Math.PI; g.add(c); }
  { const h = new THREE.Mesh(new THREE.SphereGeometry(s * .26, 18, 12), O.basic(color)); h.position.y = s * 1.05; g.add(h); const sh = new THREE.Mesh(new THREE.SphereGeometry(s * .3, 18, 12), new THREE.MeshBasicMaterial({ color: 0x10182c, side: THREE.BackSide, fog: false })); sh.position.y = s * 1.05; g.add(sh); }
  const gl = O.glow(s * 2.6, color, .6); gl.position.y = s * 1.05; g.add(gl); parent.add(g); return g;
}
// tilted Earth: group > tilt(23.5 deg about z, north leans to +x) > spin(y). Sun direction L(phi) = (cos phi, 0, sin phi): phi 0 = northern summer, pi = winter.
export function earthRig(o) {
  o = o || {}; const R = o.R || 2, g = new THREE.Group(); if (o.pos) g.position.set(...o.pos);
  const tilt = new THREE.Group(); tilt.rotation.z = -(o.tilt === undefined ? 23.5 : o.tilt) * D2R; g.add(tilt);
  const spin = new THREE.Group(); tilt.add(spin);
  const globe = litSphere(R, earthTex(), { dark: o.dark === undefined ? .13 : o.dark }); spin.add(globe);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.012, 48, 24), new THREE.MeshBasicMaterial({ color: 0x0c1428, side: THREE.BackSide, fog: false })));
  const atm = O.glow(R * 3.3, 0x6aa8ff, .3); g.add(atm);
  const ax = new THREE.Group(); tilt.add(ax);
  ax.add(new THREE.Mesh(new THREE.CylinderGeometry(R * .014, R * .014, R * 3.5, 8), O.basic(0xffd36a)));
  [1, -1].forEach(s => { const c = new THREE.Mesh(new THREE.ConeGeometry(R * .05, R * .14, 10), O.basic(0xffd36a)); c.position.y = s * R * 1.78; c.rotation.x = s < 0 ? Math.PI : 0; ax.add(c); });
  const api = { group: g, tilt, spin, globe, ax, R, u: globe.userData.u, sunDir: V3(1, 0, 0),
    setSun(phi) { this.sunDir.set(Math.cos(phi), 0, Math.sin(phi)); this.u.L.value.copy(this.sunDir); }, setSpin(a) { spin.rotation.y = a; },
    ring(lat, color, w) { const r = R * Math.cos(lat * D2R) * 1.004; const m = new THREE.Mesh(new THREE.TorusGeometry(r, w || R * .012, 8, 96), O.basic(color || 0xffd36a)); m.rotation.x = Math.PI / 2; m.position.y = R * Math.sin(lat * D2R) * 1.004; spin.add(m); return m; },
    pin(lat, lon, color, s) { return pinAt(spin, R, lat, lon, color, s); } };
  api.setSun(0); return api;
}
export function sunBall(r, gs) {
  const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), O.basic(0xffe9a0)));
  const a = O.glow(gs || r * 6, 0xffc070, .85), b = O.glow((gs || r * 6) * 2.6, 0xffa860, .32); g.add(a); g.add(b); g.userData = { a, b }; return g;
}
export function moonBall(R, o) { o = o || {}; const m = litSphere(R, moonTex(), { dark: o.dark === undefined ? .05 : o.dark, rim: 0xbfd0ff, rimK: .25, warm: 0, seg: 48 }); return m; }

// ================================================================== sky path of the sun (diagram + real sky)
export function sunDir(lat, rho, psi) {
  const la = lat * D2R, ro = rho * D2R, P = V3(0, Math.sin(la), -Math.cos(la)), U = V3(1, 0, 0), Vv = V3(0, -Math.cos(la), -Math.sin(la));
  return P.multiplyScalar(Math.cos(ro)).add(U.multiplyScalar(Math.cos(psi) * Math.sin(ro))).add(Vv.multiplyScalar(Math.sin(psi) * Math.sin(ro)));
}
export function pathBeads(parent, lat, rho, dist, n, color, size) {
  const g = new THREE.Group(), items = [];
  for (let i = 0; i < n; i++) { const psi = i / n * TAU, d = sunDir(lat, rho, psi), m = new THREE.Mesh(new THREE.SphereGeometry(size || 1, 8, 6), O.basic(color || 0xffd36a)); m.position.copy(d.multiplyScalar(dist)); g.add(m); items.push({ m, psi }); }
  parent.add(g); return { g, items };
}

// ================================================================== snowy fjord village
export function village(Wd, o) {
  o = o || {}; const r = rng(o.seed || 7), G = new THREE.Group(); Wd.add(G);
  const snow = o.snow || 0xe6edf9, winMat = new THREE.MeshBasicMaterial({ color: 0xffc878, fog: false }), glows = [];
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), toon(snow)); gr.rotation.x = -Math.PI / 2; gr.position.set(0, 0, -20); gr.receiveShadow = true; G.add(gr);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(600, 300), toon(o.water || 0x1c3a63)); water.rotation.x = -Math.PI / 2; water.position.set(0, -.04, -190); G.add(water);
  const mount = (x, z, rr, h, c) => { const m = mesh(new THREE.ConeGeometry(rr, h, 9), toon(c), { ink: false, pos: [x, h / 2 - .5, z] }); m.castShadow = false; G.add(m); const cap = mesh(new THREE.ConeGeometry(rr * .46, h * .46, 9), toon(0xf2f6ff), { ink: false, pos: [x, h * .77 - .5, z] }); cap.castShadow = false; G.add(cap); };
  (o.mount === false ? [[-120, -230, 60, 9], [120, -230, 62, 9], [0, -260, 90, 6]] : [[-120, -230, 60, 34], [-70, -250, 50, 28], [-170, -200, 50, 30], [120, -230, 62, 36], [80, -250, 50, 26], [175, -200, 52, 30], [-210, -150, 44, 26], [215, -150, 44, 24]]).forEach(([x, z, rr, h]) => mount(x, z, rr, h, o.rock || 0x40608c));
  const cols = [0xb8402e, 0xd9a441, 0xe8e0d0, 0x3f6fa0, 0x8a3a2a, 0xc9ccb0], pos = [];
  for (let i = 0; i < (o.n || 13); i++) {
    let x, z, ok, tries = 0; do { x = (r() - .5) * 64; z = -9 - r() * 24; ok = pos.every(p => Math.hypot(p[0] - x, p[1] - z) > 6.2); tries++; } while (!ok && tries < 40); pos.push([x, z]);
    const w = 3.2 + r() * 1.4, h = 2.4 + r() * .8, d = 3 + r() * 1.2, c = cols[Math.floor(r() * cols.length)], house = new THREE.Group(); house.position.set(x, 0, z); house.rotation.y = (r() - .5) * .5;
    house.add(box(w, h, d, c, { pos: [0, h / 2, 0], inkW: .04 }));
    house.add(mesh(new THREE.ConeGeometry(Math.max(w, d) * .78, 1.5, 4), toon(0x4a3a36), { pos: [0, h + .75, 0], rot: [0, Math.PI / 4, 0], scale: [w / Math.max(w, d), 1, d / Math.max(w, d)], inkW: .04 }));
    house.add(mesh(new THREE.ConeGeometry(Math.max(w, d) * .8, .5, 4), toon(0xf6f9ff), { pos: [0, h + 1.2, 0], rot: [0, Math.PI / 4, 0], scale: [w / Math.max(w, d), 1, d / Math.max(w, d)], ink: false }));
    house.add(box(.4, .9, .4, 0x5a4a44, { pos: [w * .25, h + 1.2, -d * .1], inkW: .02 }));
    for (const s of [-1, 1]) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(.6, .8), winMat); wn.position.set(s * w * .26, h * .55, d / 2 + .02); house.add(wn);
      const gl = O.glow(2.6, 0xffb868, .55); gl.position.set(s * w * .26, h * .55, d / 2 + .3); house.add(gl); glows.push(gl); }
    house.add(box(.7, 1.3, .1, 0x3a2a22, { pos: [0, .65, d / 2 + .03], ink: false }));
    G.add(house);
  }
  const pine = (x, z, s) => { const p = new THREE.Group(); p.position.set(x, 0, z); p.scale.setScalar(s); p.add(cyl(.18, .24, 1, 0x4a3224, { pos: [0, .5, 0], inkW: .02 }));
    [[1.5, 1.9, 1.4], [1.15, 1.7, 2.5], [.8, 1.5, 3.5]].forEach(([rr, hh, y]) => { p.add(mesh(new THREE.ConeGeometry(rr, hh, 9), toon(0x24473a), { pos: [0, y, 0], inkW: .04 })); p.add(mesh(new THREE.ConeGeometry(rr * .78, hh * .5, 9), toon(0xf3f7ff), { pos: [0, y + hh * .26, 0], ink: false })); }); G.add(p); };
  for (let i = 0; i < (o.pines || 30); i++) pine((r() - .5) * 90, -6 - r() * 32, .8 + r() * .8);
  for (let i = 0; i < (o.south || 0); i++) pine((r() - .5) * 160, 30 + r() * 60, .9 + r() * 1.1);
  (o.fore || [[-9, 6, 1.5], [10, 4, 1.7], [-14, 10, 1.9], [15, 9, 1.4]]).forEach(([x, z, s]) => pine(x, z, s));
  for (let i = 0; i < 16; i++) { const m = mesh(new THREE.SphereGeometry(1, 14, 8), toon(0xf1f5fd), { ink: false, scale: [2 + r() * 2.5, .5 + r() * .5, 1.5 + r() * 2], pos: [(r() - .5) * 70, -.1, -3 - r() * 36] }); m.castShadow = false; G.add(m); }
  (o.lamps || [[-3.5, -6], [4, -9], [-6, -14]]).forEach(([x, z]) => { const l = new THREE.Group(); l.position.set(x, 0, z); l.add(cyl(.05, .07, 2.6, 0x2c2a30, { pos: [0, 1.3, 0], inkW: .01 })); l.add(new THREE.Mesh(new THREE.BoxGeometry(.28, .34, .28), O.basic(0xffd48a)).translateY(2.7)); const gl = O.glow(3.6, 0xffb860, .8); gl.position.y = 2.7; l.add(gl); glows.push(gl); G.add(l); });
  return { G, winMat, glows, pos };
}
export function aurora(Wd, o) {
  o = o || {}; const g = new THREE.Group(), r = rng(o.seed || 3), n = o.n || 5, u = { uT: { value: 0 }, uA: { value: o.alpha === undefined ? 1 : o.alpha } };
  for (let i = 0; i < n; i++) {
    const w = o.w || 120, h = o.h || 42, geo = new THREE.PlaneGeometry(w, h, 140, 8);
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false, uniforms: { uT: u.uT, uA: u.uA, ph: { value: r() * 10 }, hue: { value: i / Math.max(1, n - 1) } },
      vertexShader: 'uniform float uT; uniform float ph; varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; float s = sin(p.x * 0.09 + uT * 0.35 + ph) * 5.0 + sin(p.x * 0.23 - uT * 0.5 + ph * 1.7) * 2.2; p.z += s * (0.4 + uv.y * 0.6); p.y += sin(p.x * 0.13 + uT * 0.4 + ph) * 1.6 * uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
      fragmentShader: 'uniform float uT; uniform float uA; uniform float ph; uniform float hue; varying vec2 vUv; void main(){ float v = vUv.y; float streak = 0.55 + 0.45 * sin(vUv.x * 70.0 + ph * 3.0 + sin(vUv.x * 13.0 + uT * 0.8) * 2.0); float env = pow(1.0 - v, 1.5) * smoothstep(0.0, 0.1, v); float side = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x); vec3 gc = vec3(0.15, 1.0, 0.55); vec3 pc = vec3(0.65, 0.25, 0.95); vec3 c = mix(gc, pc, smoothstep(0.35, 1.0, v) * (0.5 + 0.5 * hue)); float a = env * streak * side * 0.62 * uA; gl_FragColor = vec4(c, a);\n#include <colorspace_fragment>\n}' });
    const m = new THREE.Mesh(geo, mat); m.position.set((r() - .5) * 40, 0, -i * 7); m.rotation.y = (r() - .5) * .5; m.renderOrder = 5; m.frustumCulled = false; g.add(m);
  }
  if (o.pos) g.position.set(...o.pos); Wd.add(g); Wd.on(t => { u.uT.value = t + (Wd.t0 || 0); }); return { g, u };
}

// ================================================================== counters / bars
export function counter(w, h, o) {
  o = o || {}; const g = new THREE.Group(), p = O.digitalPanel(w, h, Object.assign({ fg: '#ffd36a', glow: 'rgba(255,190,70,.9)', bg: '#0b1233', bgGlow: 'rgba(255,200,110,.22)', fs: .64, cw: 512 }, o));
  p.mesh.position.z = .075; g.add(p.mesh); g.add(box(w + .18, h + .18, .12, 0xc99a35, { inkW: .012 })); let last = '';
  g.userData.set = (v, t) => { const s = String(Math.round(v)); if (s !== last) { last = s; p.draw(s, null, 0, t || 0); } };
  g.userData.set(0, 0); return g;
}
export const popS = (t, t0, d) => { const k = clamp((t - t0) / (d || .45), 0, 1); return k <= 0 ? 0.0001 : k >= 1 ? 1 : (1 + .22 * Math.sin(Math.PI * k) * (1 - k)) * ease.out(k); };
export function glowFlash(Wd, color, size) { const s = O.glow(size || 3, color || 0xffd070, 0); s.visible = false; Wd.add(s); return s; }
export const flashAt = (s, t, t0, dur, op, sz) => { const k = (t - t0) / dur; s.visible = k > 0 && k < 1; if (s.visible) { s.material.opacity = op * (1 - k) * Math.min(1, k * 6); s.scale.setScalar(sz * (.6 + .9 * ease.out(k))); } };

// ================================================================== 24h ring (12 + 12 equal halves) and the day bar (12 equal segments)
export function sector(r0, r1, a0, a1, depth) {
  const sh = new THREE.Shape(), N = 10; for (let i = 0; i <= N; i++) { const a = lerp(a0, a1, i / N); i ? sh.lineTo(Math.cos(a) * r1, Math.sin(a) * r1) : sh.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); }
  for (let i = N; i >= 0; i--) { const a = lerp(a0, a1, i / N); sh.lineTo(Math.cos(a) * r0, Math.sin(a) * r0); }
  return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
}
export function dayRing(o) {
  o = o || {}; const g = new THREE.Group(), r0 = o.r0 || 2.2, r1 = o.r1 || 3.3, tiles = [];
  for (let i = 0; i < 24; i++) {
    const a1 = Math.PI / 2 - i * TAU / 24, a0 = a1 - TAU / 24 + .045, day = i < 12, m = mesh(sector(r0, r1, a0, a1 - .0, .42), toon(day ? 0xffc84a : 0x2c438c, { emissive: day ? 0x5a3c06 : 0x0a1030 }), { inkW: .02 });
    const holder = new THREE.Group(); holder.add(m); g.add(holder); tiles.push({ holder, m, day, mid: (a0 + a1) / 2 });
  }
  const hand = new THREE.Group(); hand.add(box(.09, r1 + .4, .1, 0xfff0c0, { pos: [0, (r1 + .4) / 2, .5], inkW: .01 })); hand.add(ball(.2, 0xfff0c0, { pos: [0, 0, .5], inkW: .01 })); g.add(hand);
  const sunI = sunBall(.55, 3); sunI.position.set(0, 0, .5); g.add(sunI);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(.5, 24, 16), O.basic(0xe6e8f8)); moon.position.set(0, 0, .5); g.add(moon);
  const bar = box(.12, r1 * 2 + .8, .14, 0xfff0c0, { pos: [0, 0, .5], inkW: .01 }); bar.scale.y = 0.0001; g.add(bar);
  // t0: start of the build, per = seconds per tile, tSplit: the two halves part, tHand: the hand sweeps
  g.userData.update = (t, t0, per, tSplit, tHand) => {
    tiles.forEach((tl, i) => { const s = popS(t, t0 + i * per, .5), side = tl.day ? 1 : -1, ks = ease.io(prog(t, tSplit, tSplit + 1.0));
      tl.holder.scale.setScalar(s); tl.holder.position.set(side * .22 * ks, 0, (1 - s) * -1.2); });
    bar.scale.y = Math.max(.0001, ease.out(prog(t, tSplit - .3, tSplit + .7))); bar.position.x = 0;
    const hk = prog(t, tHand, tHand + 6); hand.visible = hk > 0; hand.rotation.z = -hk * TAU * ease.sm(1) + 0; hand.rotation.z = -hk * TAU;
    const ks2 = ease.out(prog(t, tSplit + .5, tSplit + 1.4));
    sunI.position.set(1.7 * ks2, 0, .5); sunI.scale.setScalar(.0001 + ks2); moon.position.set(-1.7 * ks2, 0, .5); moon.scale.setScalar(.0001 + ks2);
  };
  return g;
}
export function dayBar(o) {
  o = o || {}; const g = new THREE.Group(), n = o.n || 12, W = o.w || 11, H = o.h || .9, segs = [];
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, c = new THREE.Color(0xe8803a).lerp(new THREE.Color(0xffd24a), Math.sin(Math.PI * u)), m = box(W / n, H, .5, c.getHex(), { inkW: .025 }); m.material.emissive = c.clone().multiplyScalar(.25); g.add(m); segs.push(m); }
  const sun = sunBall(.5, 2.6), tick = []; g.add(sun);
  for (let i = 0; i <= n; i++) { const m = box(.05, .35, .08, 0xfff0c0, { pos: [(i / n - .5) * W, -H * .9, .2], ink: false }); g.add(m); tick.push(m); }
  g.userData.update = (t, tSplit, tSun, dur) => {
    const ks = ease.io(prog(t, tSplit, tSplit + 1.2)), gap = .16 * ks;
    segs.forEach((m, i) => { m.position.x = (i + .5) / n * W - W / 2 + (i - (n - 1) / 2) * gap; m.scale.set(1 - gap * 1.2 / (W / n) * ks, 1, 1); });
    tick.forEach((m, i) => { m.position.x = (i / n - .5) * W + (i - n / 2) * gap; m.visible = ks > .5; });
    const su = prog(t, tSun, tSun + (dur || 6)); sun.position.set((su - .5) * W * (1 + ks * .02), H * .5 + 1.0 + Math.sin(Math.PI * su) * 1.4, .4); sun.visible = su > 0;
    const act = Math.floor(su * n); segs.forEach((m, i) => { m.material.emissiveIntensity = su > 0 && i === act ? 1.8 : 1; });
  };
  return g;
}

// ================================================================== sky diagram (horizon disc + tilted sun circle + lowest-point marker)
export function skyDiagram(Wd, o) {
  o = o || {}; const lat = o.lat === undefined ? 69 : o.lat, rho = o.rho === undefined ? 66.6 : o.rho, d = o.d || 6, g = new THREE.Group(); Wd.add(g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(7.5, 72), new THREE.MeshBasicMaterial({ color: 0x1a3a52, transparent: true, opacity: .92, fog: false })); disc.rotation.x = -Math.PI / 2; g.add(disc);
  [2.5, 5, 7.4].forEach(rr => { const rg = new THREE.Mesh(new THREE.RingGeometry(rr, rr + .05, 72), O.basic(0x5a86a8, { transparent: true, opacity: .5, side: THREE.DoubleSide })); rg.rotation.x = -Math.PI / 2; rg.position.y = .01; g.add(rg); });
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12, tk = box(.06, .06, .5, 0x8ab4d4, { pos: [Math.cos(a) * 7.2, .03, Math.sin(a) * 7.2], rot: [0, -a, 0], ink: false }); g.add(tk); }
  const beads = pathBeads(g, lat, rho, d, 72, 0xb8923a, .06);
  // lowest point of the circle: psi = pi/2
  const low = sunDir(lat, rho, Math.PI / 2).multiplyScalar(d), mk = new THREE.Group(); mk.position.copy(low); g.add(mk);
  mk.add(mesh(new THREE.ConeGeometry(.2, .45, 4), toon(0xff7a3a), { pos: [0, -.42, 0], rot: [Math.PI, 0, 0], inkW: .02 })); const mglow = O.glow(1.8, 0xffa050, .8); mk.add(mglow);
  const hgt = Math.max(.001, Math.abs(low.y)), drop = box(.03, hgt, .03, 0xffd36a, { pos: [low.x, low.y / 2, low.z], ink: false }); g.add(drop);
  const sun = sunBall(.34, 2.2); g.add(sun);
  const north = mesh(new THREE.ConeGeometry(.28, .7, 4), toon(0x9ab8ff), { pos: [0, .2, -7.9], rot: [-Math.PI / 2, 0, 0], inkW: .02 }); g.add(north);
  const api = { g, beads, low, mk, mglow, sun, drop, disc,
    setSun(psi) { sun.position.copy(sunDir(lat, rho, psi).multiplyScalar(d)); sun.visible = true; },
    lit(psi) { beads.items.forEach(b => { const dd = ((psi - b.psi) % TAU + TAU) % TAU; b.m.material.color.setHex(dd < Math.PI * 1.1 && dd > 0 ? 0xffd86a : 0xb8923a); }); } };
  return api;
}

// ================================================================== misc small props
export function candle(x, y, z, h, seed) {
  const c = new THREE.Group(); c.position.set(x, y, z); c.add(cyl(.045, .05, h, 0xf6ecd0, { pos: [0, h / 2, 0], inkW: .008 })); c.add(box(.14, .02, .14, 0xc99a35, { pos: [0, .01, 0], ink: false }));
  const fl = O.glow(.42, 0xffb050, .95); fl.position.y = h + .1; c.add(fl); const core = O.glow(.16, 0xfff2c0, 1); core.position.y = h + .08; c.add(core);
  c.userData.tick = t => { const k = 1 + .14 * Math.sin(t * 9 + seed * 3) * Math.sin(t * 3.7 + seed); fl.scale.setScalar(.42 * k); fl.position.x = Math.sin(t * 5 + seed) * .012; };
  return c;
}
export function lampDesk(x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.add(cyl(.12, .16, .05, 0x2a2a30, { pos: [0, .025, 0], inkW: .008 })); g.add(cyl(.02, .02, .55, 0x2a2a30, { pos: [0, .3, 0], inkW: .006 }));
  g.add(mesh(new THREE.ConeGeometry(.2, .22, 20, 1, true), toon(0x2f6a4c, { side: THREE.DoubleSide }), { pos: [0, .62, 0], inkW: .012 }));
  const gl = O.glow(1.4, 0xffe0a0, .9); gl.position.y = .55; g.add(gl); g.userData.glow = gl; return g;
}

// ================================================================== window panel (a lit window near the watch) and the beit-midrash sefer set
export function winPanel(Wd, x, y, z, c0, c1, w, h) {
  w = w || 1.1; h = h || 1.5; const g = new THREE.Group(); g.position.set(x, y, z);
  const tex = canvasTex(8, 128, (c, ww, hh) => { const gr = c.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, c0); gr.addColorStop(1, c1); c.fillStyle = gr; c.fillRect(0, 0, ww, hh); });
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, fog: false })));
  const fr = 0x6a4526; g.add(box(w + .16, .08, .12, fr, { pos: [0, h / 2 + .04, .02], inkW: .008 })); g.add(box(w + .16, .08, .12, fr, { pos: [0, -h / 2 - .04, .02], inkW: .008 }));
  g.add(box(.08, h, .12, fr, { pos: [-w / 2 - .04, 0, .02], inkW: .008 })); g.add(box(.08, h, .12, fr, { pos: [w / 2 + .04, 0, .02], inkW: .008 })); g.add(box(.05, h, .1, fr, { pos: [0, 0, .03], ink: false })); g.add(box(w, .05, .1, fr, { pos: [0, .05, .03], ink: false }));
  Wd.add(g); return g;
}
export function bethMidrash(Wd, o) {
  o = o || {}; const sh = O.shtender(Wd, {}), se = O.sefer(Wd, { pos: [0, .035, 0], bright: o.bright || 1.05 }); sh.userData.slope.add(se);
  Wd.add(box(14, 6, .3, 0x2a1c12, { pos: [0, 3, -3.6], inkW: .01 }));
  [-2.4, 2.4, -4.6].forEach((x, i) => { const s = new THREE.Group(); s.position.set(x, 0, -3.3); s.add(box(1.8, 2.8, .5, 0x4a3018, { pos: [0, 1.4, 0], inkW: .01 })); const r = rng(60 + i);
    for (let row = 0; row < 5; row++) { let bx = -.8; while (bx < .78) { const bw = .08 + r() * .1, bh = .32 + r() * .16; s.add(box(bw, bh, .36, [0x6a2a24, 0x24407a, 0x2f5d3a, 0x6a4a1c, 0x5a2f6a][Math.floor(r() * 5)], { pos: [bx + bw / 2, .35 + row * .55 + bh / 2, .05], inkW: .004 })); bx += bw + .005; } } Wd.add(s); });
  [[-1.8, 2.2, -2.8, 1.0], [1.7, 1.8, -3.0, .8], [3.2, 2.6, -3.2, 1.2], [-3.4, 1.2, -2.6, .9], [.2, 3.1, -3.0, 1.1]].forEach(([x, y, z, s]) => { const g = O.glow(s, 0xffc070, .9); g.position.set(x, y, z); Wd.add(g); });
  const pg = O.glow(2.2, 0xffd890, .4); pg.position.set(0, 1.55, .35); Wd.add(pg);
  const lamp = lampDesk(-.85, .93, -.1); Wd.add(lamp); Wd.add(box(.9, .05, .55, 0x5a3416, { pos: [-.85, .9, -.1], inkW: .005 }));
  const c = candle(.95, .93, -.2, .26, 3); Wd.add(c); Wd.add(box(.8, .05, .5, 0x5a3416, { pos: [.95, .9, -.2], inkW: .005 }));
  O.motes(Wd, { n: 34, area: [-1.8, 1.8, .6, 2.6, -2.5, 1.4], size: .07, color: 0xffd890, op: .6, seed: 45, rise: .05 });
  Wd.on((t, cam) => { const g = t + (Wd.t0 || 0); c.userData.tick(g); pg.material.opacity = .4 + .06 * Math.sin(g * 5.3); lamp.userData.glow.scale.setScalar(1.4 * (1 + .03 * Math.sin(g * 3.1))); });
  return { sh, se, lamp, candle: c };
}
export const bmLights = { key: [0xffc58a, .9, [1, 4, 3]], hemi: [0x5a4030, 0x1a1008, .6], fill: [0x6a5a80, .2, [-3, 1, 3]], rim: [0xffb070, .5, [-1, 3, -3]], target: [0, 1.1, 0], shadowExt: 4, fog: null,
  points: [[0xffc070, 7, [0, 2.3, .6], 6], [0xffd090, 3, [.7, 1.4, .9], 4], [0xffe0a0, 5, [-.85, 1.6, .1], 4]] };

// rig extension: a segment may carry pf/lf (functions of t) in place of p0/p1 and l0/l1

// ================================================================== the watch shot (W lines): right-center, ~50% of the frame height; reused by c9 / c10
export function watchShotMaker(env) {
  const { K, CH, MOUTH, world, makeWatch } = env;
  return function watchShot(id, o) {
    const a = K.START[id], D = K.ENDOF(id) - a, Wd = world({ fog: false }); K.baseCam(Wd, .03, 120);
    O.skyDome(Wd, { top: 0x1c2848, mid: 0x3a3a58, bot: 0x6a5a58, stars: 0 }); const R = O.watchTable(Wd, { windowColor: o.win || 0x2a3a70 });
    O.lighting(Wd, { key: [o.keyC || 0xffd9a0, o.key === undefined ? 1.0 : o.key, [1.5, 3.5, 3]], hemi: [0xd8b890, 0x3a2a1a, o.hemi === undefined ? .75 : o.hemi], fill: [0x7a96d8, .3, [-4, 1.5, 2]], rim: [0xffe0b0, o.rim === undefined ? .8 : o.rim, [-1.5, 2.5, -2]], target: [0, .2, 0], shadowExt: 3, fog: null,
      points: [[0xffc070, 6 * (o.pt === undefined ? 1 : o.pt), [.9, 1.6, 1.2], 7], [o.wc || 0xffd890, o.wi || 0, [1.4, 1.2, -.6], 6]] });
    R.winGlow.material.opacity = 0;
    const W = makeWatch(Wd, { scale: .24, lines: CH.lines, mouth: MOUTH }); W.obj.position.set(0, .122, 0); W.obj.rotation.x = -.18; Wd.add(W.obj); Wd.hero = W.obj;
    O.motes(Wd, { n: 22, area: [-.8, 1.4, .1, 1.2, -1.5, 1.0], size: .035, color: 0xffe3a8, op: .6, seed: 33, rise: .04 });
    if (o.extra) o.extra(Wd, R, a, W);
    Wd.on((t, cam) => { const g = t + a, lk = o.look(g, a); W.obj.rotation.y = lk.yaw; W.auto(g, Object.assign({ lid: 1, eyes: 1, look: [lk.x, lk.y] }, o.over ? o.over(g) : {})); });
    const R2 = K.rig(D, o.segs || [
      { w: 1.2, p0: [0, .36, 1.34], p1: [0, .36, 1.2], l0: [-.15, .19, 0], l1: [-.16, .19, 0], f0: F(50), ap: 20, focus: 1.3, vig: .42 },
      { w: 1, p0: [-.06, .33, 1.12], p1: [-.08, .32, 1.02], l0: [-.13, .18, 0], l1: [-.14, .18, 0], f0: F(50), ap: 20, focus: 1.05, vig: .42 }]);
    return K.finish(Wd, R2);
  };
}
