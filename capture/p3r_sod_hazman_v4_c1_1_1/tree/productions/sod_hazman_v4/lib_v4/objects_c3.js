// objects_c3.js - chapter c3 set pieces (Earth with a terminator, Eretz Yisrael relief table, sun arc, sundials). No text: digits, pips, rings only.
import { THREE, box, cyl, ball, mesh, toon, canvasTex, rng, ease, prog, clamp, lerp } from '../../../lib/stage3d.js';
import * as O from './objects.js';
import { D2R, F, backOut, livePlane, mix3, goldRing } from './objects_c1b.js';
let _ET = null; const eTex = () => _ET || (_ET = O.earthTexture());

const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- Eretz Yisrael relief (ported from c1 L10): height + colour of a point (x,z in relief units, north = -z)
const C = h => new THREE.Color(h);
const cSea = C(0x2a6aa8), cCoast = C(0x4a90c0), cPlain = C(0x7aa04e), cHill = C(0x8a9a58), cRock = C(0xb09a68), cDry = C(0xd2b878), cGreen = C(0x5f8c44), cLake = C(0x3a78b0), cEast = C(0xc4a870);
export function reliefAt(x, z, out) {
  const north = -z, xc = -62 + north * .08, xr = 28 + north * .02, nz_ = Math.sin(x * .21) * Math.cos(z * .17) * .12 + Math.sin(x * .6 + z * .4) * .05; let h, c = out || new THREE.Color();
  if (x < xc) { h = -.2; c.copy(cSea).lerp(cCoast, sm(xc - 18, xc, x)); }
  else if (x < xc + 28) { h = .15 + sm(xc, xc + 28, x) * .2; c.copy(cPlain).lerp(cHill, sm(xc + 10, xc + 28, x)); }
  else if (x < xr - 8) { const u = (x - xc - 28) / (xr - 8 - xc - 28); h = .5 + Math.sin(u * Math.PI) * (.9 + .3 * sm(60, 220, north)); c.copy(cHill).lerp(cRock, sm(.3, .8, u)); if (north > 100) c.lerp(cGreen, .6); }
  else if (x < xr + 10) { h = -.6; c.copy(cEast).lerp(cRock, .3); if (z > 8 && z < 72) c.copy(cLake); if (north > 118 && north < 150) c.copy(cLake); }
  else { h = .7 + sm(xr + 10, xr + 40, x) * .5; c.copy(cEast).lerp(cDry, .4); }
  if (z > 95) { c.lerp(cDry, sm(95, 130, z)); h = h * (1 - .6 * sm(95, 140, z)); }
  return h + nz_;
}
// world-space relief (metres): s = metres per relief unit, vy = metres per height unit
export function reliefTable(Wd, o) {
  o = o || {}; const s = o.s || .012, vy = o.vy || .04, Wr = 320, Hr = 540, nx = 128, nz = 210, R = { s, vy }, g = O.grp(Wd, o);
  const geo = new THREE.PlaneGeometry(Wr * s, Hr * s, nx, nz); geo.rotateX(-Math.PI / 2); const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) / s, z = pos.getZ(i) / s, h = reliefAt(x, z, c); pos.setY(i, h * 2.4 * vy); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, toon(0xffffff, { vertexColors: true })); m.receiveShadow = false; m.castShadow = false; g.add(m);
  g.add(box(Wr * s + .3, .22, Hr * s + .3, 0x5a3a1c, { pos: [0, -.14, 0], inkW: .02 }));
  R.g = g; R.mesh = m; R.at = (x, z) => [x * s, reliefAt(x, z) * 2.4 * vy, z * s];
  // pins: Jerusalem (hills) and Tel Aviv (coast): relief coordinates derived from the lat / lon of the two cities
  R.jer = [-11.3, -(-13)]; R.jer = [-11.3, 13]; R.tlv = [-58, -30];
  const pin = (xz, col, glowCol) => { const p = new THREE.Group(), q = R.at(xz[0], xz[1]); p.position.set(q[0], q[1] + .02, q[2]); const head = new THREE.Mesh(new THREE.SphereGeometry(.07, 20, 14), O.basic(col)); head.position.y = .3; p.add(head); p.add(cyl(.012, .012, .3, 0xd8d8e0, { pos: [0, .15, 0], ink: false })); const gl = O.glow(.9, glowCol, 0); gl.position.y = .3; p.add(gl); p.userData.gl = gl; p.userData.head = head; g.add(p); return p; };
  R.pJ = pin(R.jer, 0xffc428, 0xffc040); R.pT = pin(R.tlv, 0x4aa0ff, 0x6ab0ff);
  R.pinGlow = (a, b, t) => { R.pJ.userData.gl.material.opacity = a * (.7 + .3 * Math.sin(t * 4)); R.pT.userData.gl.material.opacity = b * (.7 + .3 * Math.sin(t * 4 + 1)); R.pJ.userData.head.scale.setScalar(1 + .3 * a * (.5 + .5 * Math.sin(t * 4))); };
  return R;
}
// the shadow line of sunset: dark east of the line, a gold edge; lineX in world metres (moves west)
export function terminatorSweep(Wd, R) {
  const W = R.s * 320 * 2.2, H = R.s * 540 * 1.2, tex = canvasTex(512, 8, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(8,12,40,0)'); gr.addColorStop(.485, 'rgba(8,12,40,0)'); gr.addColorStop(.5, 'rgba(255,214,110,1)'); gr.addColorStop(.512, 'rgba(255,196,80,.55)'); gr.addColorStop(.55, 'rgba(10,16,52,.7)'); gr.addColorStop(1, 'rgba(6,10,36,.78)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })); p.rotation.x = -Math.PI / 2; p.position.y = .3; p.renderOrder = 5; Wd.add(p);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(.5, H * .6), new THREE.MeshBasicMaterial({ color: 0xffc860, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); gl.rotation.x = -Math.PI / 2; gl.position.y = .31; Wd.add(gl);
  return { mesh: p, set(lineX, vis) { p.visible = vis > .01; p.position.x = lineX + W / 2 - W * .0; p.position.x = lineX; gl.position.x = lineX; gl.material.opacity = .25 * vis; p.material.opacity = vis; } };
}
// a small framed sunset panel (live canvas) that hovers over a pin
export function sunsetInset(w) {
  const P = livePlane(w, w * .62, 640, 397); const c = P.c; let last = -1;
  P.set = k => { const key = Math.round(k * 240); if (key === last) return; last = key; const sy = lerp(.22, .74, ease.sm(k)) * 397; c.clearRect(0, 0, 640, 397); c.save(); c.beginPath(); c.roundRect(10, 10, 620, 377, 26); c.clip();
    const gr = c.createLinearGradient(0, 0, 0, 397); gr.addColorStop(0, `rgb(${lerp(70, 40, k) | 0},${lerp(130, 50, k) | 0},${lerp(210, 120, k) | 0})`); gr.addColorStop(.7, `rgb(${lerp(250, 240, k) | 0},${lerp(200, 120, k) | 0},${lerp(140, 70, k) | 0})`); gr.addColorStop(1, '#f8b070'); c.fillStyle = gr; c.fillRect(0, 0, 640, 397);
    c.shadowColor = 'rgba(255,210,100,.9)'; c.shadowBlur = 40; c.fillStyle = '#ffe49a'; c.beginPath(); c.arc(430, sy, 56, 0, 7); c.fill(); c.shadowBlur = 0;
    c.fillStyle = '#3a2c3e'; c.beginPath(); c.moveTo(0, 397); c.lineTo(0, 290); c.quadraticCurveTo(120, 230, 230, 292); c.quadraticCurveTo(330, 330, 440, 276); c.quadraticCurveTo(560, 230, 640, 300); c.lineTo(640, 397); c.fill(); c.fillStyle = '#4a3a3a'; [[60, 300, 40, 50], [130, 310, 30, 40], [500, 292, 44, 60], [560, 300, 34, 46]].forEach(([x, y, ww, h]) => c.fillRect(x, y, ww, h)); c.restore();
    c.strokeStyle = '#ffc84a'; c.lineWidth = 12; c.beginPath(); c.roundRect(10, 10, 620, 377, 26); c.stroke(); P.touch(); }; P.set(0); return P;
}
// two noon posts with a short gap bar under them (two pips): the two-minute gap
export function gapBar(Wd, o) {
  o = o || {}; const g = O.grp(Wd, o), R = { g }, XA = -1.3, XB = 1.3;
  const post = (x, col) => { const p = new THREE.Group(); p.position.x = x; p.add(cyl(.05, .07, 2.2, 0xd9c9a4, { pos: [0, 1.1, 0], inkW: .012 })); const top = new THREE.Mesh(new THREE.SphereGeometry(.34, 24, 16), O.basic(col)); top.position.y = 2.5; p.add(top); const gl = O.glow(2.4, col, .5); gl.position.y = 2.5; p.add(gl); const beam = new THREE.Mesh(new THREE.CylinderGeometry(.16, .32, 2.2, 16, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 1.15; p.add(beam); g.add(p); p.userData = { top, gl, beam }; return p; };
  R.a = post(XA, 0xffd23a); R.b = post(XB, 0x7ab4ff);
  g.add(box(3.4, .06, .5, 0x5a5666, { pos: [0, .03, 0], inkW: .01 })); const bar = box(2.6, .12, .12, 0xffc84a, { pos: [0, .35, .1], inkW: .008 }); bar.material = new THREE.MeshBasicMaterial({ color: 0xffc84a, fog: false }); g.add(bar); R.bar = bar;
  R.pips = [-1, 1].map(s => { const p = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 12), O.basic(0xfff0b0)); p.position.set(s * .5, .35, .22); g.add(p); return p; });
  const ends = [-1, 1].map(s => { const e = box(.1, .5, .14, 0xffc84a, { pos: [s * 1.3, .35, .1], ink: false }); e.material = new THREE.MeshBasicMaterial({ color: 0xffc84a, fog: false }); g.add(e); return e; });
  R.set = (ka, kb, kbar, flash, t) => { [[R.a, ka], [R.b, kb]].forEach(([p, k]) => { const e = backOut(clamp(k, 0, 1)); p.scale.setScalar(Math.max(.001, e)); p.userData.gl.material.opacity = .6 * clamp(k, 0, 1) * (.85 + .15 * Math.sin(t * 5)); p.userData.beam.material.opacity = .22 * clamp(k, 0, 1); });
    const e2 = ease.out(clamp(kbar, 0, 1)); bar.scale.x = Math.max(.001, e2); ends.forEach(x => x.visible = kbar > .8); R.pips.forEach((p, i) => { p.visible = kbar > .6; const f = flash > 0 ? (.5 + .5 * Math.sin(t * 14 + i * 3.14)) : 0; p.scale.setScalar(1 + .6 * f * flash); }); bar.material.color.setHex(flash > 0 && Math.sin(t * 14) > 0 ? 0xffffff : 0xffc84a); };
  R.set(0, 0, 0, 0, 0); return R;
}

// ---------------------------------------------------------------- Earth with a real terminator (shader), tilted axis, a Jerusalem pin that rides the spin
export function earthStage(Wd, o) {
  o = o || {}; const Rr = o.R || 1.4, g = new THREE.Group(); if (o.pos) g.position.set(...o.pos); Wd.add(g);
  const tilt = new THREE.Group(); tilt.rotation.z = -23.5 * D2R; g.add(tilt); const sunDir = new THREE.Vector3(-1, .12, .22).normalize();
  const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: eTex() }, uSun: { value: sunDir }, uGold: { value: 0 } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D map; uniform vec3 uSun; uniform float uGold; varying vec2 vUv; varying vec3 vN;
      void main(){ vec3 tex = texture2D(map, vUv).rgb; float d = dot(normalize(vN), normalize(uSun)); float lit = smoothstep(-0.012, 0.045, d);
        vec3 dayC = tex * (0.7 + 0.45 * clamp(d, 0.0, 1.0)); vec3 nightC = tex * vec3(0.13, 0.17, 0.34) + vec3(0.012, 0.018, 0.05);
        vec3 c = mix(nightC, dayC, lit); float band = exp(-pow(d / 0.03, 2.0)); c += vec3(1.0, 0.78, 0.3) * band * (0.2 + uGold * 1.5);
        gl_FragColor = vec4(c, 1.0);\n#include <colorspace_fragment>\n} ` });
  const spinG = new THREE.Group(); tilt.add(spinG); const earth = new THREE.Mesh(new THREE.SphereGeometry(Rr, 96, 48), mat); spinG.add(earth);
  const atm = O.glow(Rr * 3.4, 0x7ab0ff, .38); g.add(atm);
  const lon = 35.2, lat = 31.8, phi = (lon + 180) * D2R, th = (90 - lat) * D2R, d0 = new THREE.Vector3(-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th));
  const pin = new THREE.Group(); pin.position.copy(d0).multiplyScalar(Rr); pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d0); spinG.add(pin);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.06 * Rr / 1.4, 16, 12), O.basic(0xff5a3a)); head.position.y = .24 * Rr / 1.4; pin.add(head); pin.add(cyl(.01, .01, .24 * Rr / 1.4, 0xf0f0f8, { pos: [0, .12 * Rr / 1.4, 0], ink: false })); const pg = O.glow(.5 * Rr / 1.4, 0xff9a60, .9); pg.position.y = .24 * Rr / 1.4; pin.add(pg);
  const R = { g, tilt, spinG, earth, mat, pin, sunDir, Rr, atm, set(spin, gold) { spinG.rotation.y = spin; mat.uniforms.uGold.value = gold || 0; },
    pinDir(spin) { const v = d0.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), spin).applyAxisAngle(new THREE.Vector3(0, 0, 1), -23.5 * D2R); return v; },
    litAt(spin) { return R.pinDir(spin).dot(sunDir); } };
  return R;
}
// the speed counter (live digits with an arc ring)
export function speedCounter() {
  const P = livePlane(1.9, .95, 600, 300); const c = P.c; let last = '';
  P.set = (v, target) => { const s = String(Math.floor(v)), key = s; if (key === last) return; last = key; c.clearRect(0, 0, 600, 300); const bg = c.createLinearGradient(0, 0, 0, 300); bg.addColorStop(0, 'rgba(14,22,60,.9)'); bg.addColorStop(1, 'rgba(8,12,36,.9)'); c.fillStyle = bg; c.beginPath(); c.roundRect(8, 8, 584, 284, 40); c.fill();
    c.lineCap = 'round'; c.lineWidth = 18; c.strokeStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.arc(300, 262, 210, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); const f = clamp(v / target, 0, 1); c.strokeStyle = '#ffc84a'; c.shadowColor = '#ffb030'; c.shadowBlur = 24; c.beginPath(); c.arc(300, 262, 210, Math.PI * 1.1, Math.PI * (1.1 + .8 * f)); c.stroke(); c.shadowBlur = 0;
    c.font = '900 150px Heebo, Assistant, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'ltr'; c.shadowColor = 'rgba(255,190,60,.9)'; c.shadowBlur = 26; c.fillStyle = v >= target - .5 ? '#fff3b0' : '#ffd870'; c.fillText(s, 300, 168); c.shadowBlur = 0; c.strokeStyle = '#ffc84a'; c.lineWidth = 6; c.beginPath(); c.roundRect(8, 8, 584, 284, 40); c.stroke(); P.touch(); };
  P.set(0, 1); return P;
}

// ---------------------------------------------------------------- the rise from Jerusalem through the clouds to the whole Earth (ported from c1 L10); returns the camera function
function reliefCurved(RE) {
  const W = 320, H = 540, nx = 110, nz = 180, geo = new THREE.PlaneGeometry(W, H, nx, nz); geo.rotateX(-Math.PI / 2); const pos = geo.attributes.position, col = new Float32Array(pos.count * 4), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), h = reliefAt(x, z, c), ex = Math.min(x + W / 2, W / 2 - x) / 40, ez = Math.min(z + H / 2, H / 2 - z) / 60; pos.setY(i, h * 2.4 + .05 - (x * x + z * z) / (2 * RE)); col[i * 4] = c.r; col[i * 4 + 1] = c.g; col[i * 4 + 2] = c.b; col[i * 4 + 3] = sm(0, 1, Math.min(ex, ez)); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 4)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, toon(0xffffff, { vertexColors: true, transparent: true })); m.receiveShadow = false; return m;
}
export function riseSet(Wd, dur, ctx) {
  const RE = 6000, EC = [0, -RE, 0], sky = O.skyDome(Wd, { top: 0x4a84d8, mid: 0xa8c8ec, bot: 0xf6e4c0, stars: 0 });
  const FIN = { pos: new THREE.Vector3(0, EC[1] + 26000 * Math.cos(30 * D2R), 26000 * Math.sin(30 * D2R)), look: new THREE.Vector3(...EC) };
  const m4 = new THREE.Matrix4().lookAt(FIN.pos, FIN.look, new THREE.Vector3(0, 1, 0)), right = new THREE.Vector3(), up = new THREE.Vector3(), fwd = new THREE.Vector3(); m4.extractBasis(right, up, fwd); fwd.negate();
  const sunPos = FIN.pos.clone().addScaledVector(fwd, 52000).addScaledVector(right, -34000).addScaledVector(up, 4000);
  O.lighting(Wd, { key: [0xfff0d8, 2.3, sunPos.clone().sub(new THREE.Vector3(...EC)).normalize().multiplyScalar(500).toArray()], hemi: [0x9ab8e8, 0x405070, .85], fill: [0x6a8ad0, .25, [0, 100, 300]], target: [0, 0, 0], shadowExt: 100, shadowMap: 1024, fog: null });
  const E = O.earth(Wd, { R: RE, pos: EC }), em = E.userData.earth, q1 = new THREE.Quaternion(), D = Math.PI / 180;
  const lon = 35.2, lat = 31.8, phi = (lon + 180) * D, th = (90 - lat) * D, d0 = new THREE.Vector3(-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th));
  q1.setFromUnitVectors(d0, new THREE.Vector3(0, 1, 0)); const n2 = new THREE.Vector3(0, 1, 0).applyQuaternion(q1), ang = Math.atan2(n2.x, -n2.z);
  em.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ang).multiply(q1)); em.material.color.setHex(0xe8e0cc);
  Wd.add(reliefCurved(RE));
  const Cc = O.city(Wd, { seed: 29, n: 56, litFrac: 0, area: [-58, 58, -12, -62], slope: .04, cypress: 6 }); Cc.glows.forEach(g => { g.visible = false; }); Cc.winMat.color.setHex(0x39404a);
  O.hills(Wd, { colors: [0x6a7a52, 0x7a8a5c], list: [[-30, -118, 30, 8, 22], [38, -118, 34, 9, 24], [-78, -112, 28, 7, 18]] });
  const sunM = new THREE.Mesh(new THREE.SphereGeometry(1500, 24, 16), O.basic(0xfff1c0)); sunM.position.copy(sunPos); Wd.add(sunM); const sg = O.glow(22000, 0xffd890, .75); sg.position.copy(sunPos); Wd.add(sg); const sg2 = O.glow(60000, 0xffb870, .3); sg2.position.copy(sunPos); Wd.add(sg2);
  const T = t => ease.io(prog(t, 0, dur)), atm = E.children.find(c => c !== em);
  Wd.on((t, cam) => { const s = T(t); atm.visible = Math.hypot(cam.position.x, cam.position.y - EC[1], cam.position.z) > RE * 1.07;
    const L2 = (c0, c1, c2, e) => new THREE.Color(c0).lerp(new THREE.Color(c1), ease.sm(prog(s, .1, .5))).lerp(new THREE.Color(c2), ease.sm(prog(s, .5, e)));
    sky.uni.top.value.copy(L2(0x4a84d8, 0x0e2a66, 0x000208, .85)); sky.uni.mid.value.copy(L2(0xa8c8ec, 0x2a5aa0, 0x02050f, .87)); sky.uni.bot.value.copy(L2(0xf6e4c0, 0x7aa8de, 0x05080e, .9));
    sky.starU.uA.value = ease.sm(prog(s, .55, .9)); sg.material.opacity = .75 * ease.sm(prog(s, .65, .97)); sg2.material.opacity = .3 * ease.sm(prog(s, .7, 1)); sunM.visible = sg.visible = sg2.visible = s > .62; });
  return t => { const s = T(t), rad = Math.exp(lerp(Math.log(6030), Math.log(26000), Math.pow(s, 1.25))), ph = lerp(.7, 30, Math.pow(s, 2.2)) * D2R;
    const pos = [0, EC[1] + rad * Math.cos(ph), rad * Math.sin(ph)], k = Math.pow(s, 1.3), look = [0, lerp(4, EC[1], k), lerp(-30, EC[2], k)];
    return { pos, look, fov: lerp(F(24), F(40), s) }; };
}

// ---------------------------------------------------------------- sundials: a row of old towns, each with its own slightly different shadow
export function sundialTowns(Wd, o) {
  o = o || {}; const N = 5, R = { towns: [] }, r = rng(41);
  for (let i = 0; i < N; i++) { const x = (i - (N - 1) / 2) * 4.6, g = O.grp(Wd, { pos: [x, 0, 0] });
    for (let k = 0; k < 6; k++) { const w = .5 + r() * .5, h = .5 + r() * .9; g.add(box(w, h, .5 + r() * .4, [0xcfb88a, 0xd9c49a, 0xbfa678][k % 3], { pos: [(k - 2.5) * .62, h / 2, -1.7 - r() * .8], inkW: .02 })); }
    g.add(cyl(.22, .26, .24, 0xd9c9a4, { pos: [-.55 * 0 + 1.7, .12, -2.2], inkW: .015 })); g.add(box(.14, .5, .1, 0x6a4a1c, { pos: [-1.9, .25, -2.1], inkW: .01 })); // hint of a door tower
    const base = cyl(.95, 1.02, .16, 0xd9c9a4, { pos: [0, .08, .6], inkW: .02 }); g.add(base); const dial = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .02, 40), toon(0xffffff, { map: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#f2e8cc'; c.fillRect(0, 0, w, h); c.strokeStyle = '#8a6a3c'; c.lineWidth = 5; for (let a = -6; a <= 6; a++) { const an = a * .22; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.sin(an) * 118, 128 - Math.cos(an) * 118); c.stroke(); } c.strokeStyle = '#6a4a1c'; c.lineWidth = 8; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.stroke(); }) })); dial.position.set(0, .18, .6); g.add(dial);
    const gn = new THREE.Mesh(new THREE.BoxGeometry(.06, .7, .5), toon(0x4a3a2a)); gn.position.set(0, .55, .6); gn.geometry.translate(0, 0, 0); g.add(gn);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(.16, 1.5), new THREE.MeshBasicMaterial({ color: 0x20180c, transparent: true, opacity: .62, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.geometry.translate(0, .75, 0); sh.position.set(0, .2, .6); g.add(sh);
    R.towns.push({ g, sh, x }); }
  R.set = (ang, t) => R.towns.forEach((tw, i) => { tw.sh.rotation.z = -(ang + i * .1 + Math.sin(t * .3 + i) * .004); });
  return R;
}
