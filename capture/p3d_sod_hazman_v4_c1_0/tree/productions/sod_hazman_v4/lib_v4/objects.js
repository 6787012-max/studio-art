// objects.js - reusable set pieces for the v4 explainer series (toon + ink, warm cinematic light). 1 unit = 1 metre.
// No people, no text: dials use ticks and Latin digits only. Every animated thing is a function of t passed in by the caller.
import { THREE, box, cyl, ball, mesh, toon, ink, canvasTex, rng, ease, prog, clamp, lerp } from '../../../lib/stage3d.js';

const D2R = Math.PI / 180;
export const grp = (Wd, o) => { o = o || {}; const g = new THREE.Group(); if (o.pos) g.position.set(...o.pos); if (o.rot !== undefined) Array.isArray(o.rot) ? g.rotation.set(...o.rot) : (g.rotation.y = o.rot); if (o.scale) g.scale.setScalar(o.scale); (Wd.add ? Wd.add(g) : Wd.scene.add(g)); return g; };
export const basic = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, fog: false }, o || {}));

// ------------------------------------------------------------------ lights
export function lighting(Wd, L) {
  const s = Wd.sun; s.color.set(L.key[0]); s.intensity = L.key[1]; s.position.set(...L.key[2]); s.shadow.mapSize.set(L.shadowMap || 1024, L.shadowMap || 1024);
  if (L.shadowExt) { const c = s.shadow.camera; c.left = c.bottom = -L.shadowExt; c.right = c.top = L.shadowExt; c.far = L.shadowFar || 200; c.updateProjectionMatrix(); }
  if (L.target) s.target.position.set(...L.target);
  if (L.noShadow) s.castShadow = false;
  Wd.hemi.color.set(L.hemi[0]); Wd.hemi.groundColor.set(L.hemi[1]); Wd.hemi.intensity = L.hemi[2];
  if (L.fill) { const f = new THREE.DirectionalLight(L.fill[0], L.fill[1]); f.position.set(...L.fill[2]); Wd.scene.add(f); }
  if (L.rim) { const f = new THREE.DirectionalLight(L.rim[0], L.rim[1]); f.position.set(...L.rim[2]); Wd.scene.add(f); }
  (L.points || []).forEach(p => { const pl = new THREE.PointLight(p[0], p[1], p[3] || 0, p[4] === undefined ? 2 : p[4]); pl.position.set(...p[2]); Wd.scene.add(pl); });
  if (L.fog) Wd.scene.fog = new THREE.Fog(L.fog[0], L.fog[1], L.fog[2]); else if (L.fog === null) Wd.scene.fog = null;
}

// ------------------------------------------------------------------ sky, stars, glow, motes
const GLOWT = (() => { let t = null; return () => t || (t = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.3, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); })); })();
export const glowTexture = () => GLOWT();
export function glow(size, color, op) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOWT(), color, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: op === undefined ? .8 : op }));
  s.scale.set(size, size, 1); return s;
}
export function skyDome(Wd, o) {
  o = o || {}; if (Wd.sky) Wd.sky.visible = false;
  const u = { top: { value: new THREE.Color(o.top || 0x0a1030) }, mid: { value: new THREE.Color(o.mid || 0x1c2c60) }, bot: { value: new THREE.Color(o.bot || 0x4a5a8a) } };
  const dome = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: u,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 c = h > 0.0 ? mix(bot, mid, smoothstep(0.0, 0.22, h)) : bot; c = mix(c, top, smoothstep(0.2, 0.85, h)); gl_FragColor = vec4(c, 1.0);\n#include <colorspace_fragment>\n}' }));
  dome.renderOrder = -10; dome.frustumCulled = false; Wd.scene.add(dome);
  const su = { uA: { value: o.stars === undefined ? 1 : o.stars }, uT: { value: 0 } };
  const stars = new THREE.Mesh(new THREE.SphereGeometry(480, 24, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, transparent: true, blending: THREE.AdditiveBlending, uniforms: su,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uA; uniform float uT; varying vec3 vP;
      float h1(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
      void main(){ vec3 d = normalize(vP); float v = 0.0;
        for (int k = 0; k < 2; k++) { float N = k == 0 ? 95.0 : 170.0; vec3 q = d * N; vec3 g = floor(q); float r = h1(g + float(k) * 7.0);
          if (r > (k == 0 ? 0.55 : 0.7)) { vec3 c = g + vec3(h1(g + 1.3), h1(g + 2.7), h1(g + 4.1)); float dist = length(q - c); float rad = (k == 0 ? 0.11 : 0.08) + r * 0.06;
            float tw = 0.75 + 0.25 * sin(uT * 2.0 + r * 80.0); v += smoothstep(rad, 0.0, dist) * (0.5 + r * 0.5) * tw; } }
        float band = exp(-pow(d.y * 3.2 + d.x * 1.4 - 0.2, 2.0) * 2.0) * 0.1 * h1(floor(d * 300.0));
        gl_FragColor = vec4(vec3(0.85, 0.9, 1.0) * (v + band) * uA, 1.0);\n#include <colorspace_fragment>\n} ` }));
  stars.renderOrder = -9; stars.frustumCulled = false; Wd.scene.add(stars);
  Wd.on((t, cam) => { dome.position.copy(cam.position); stars.position.copy(cam.position); su.uT.value = t; });
  return { dome, stars, uni: u, starU: su, set(top, mid, bot, sa) { u.top.value.set(top); u.mid.value.set(mid); u.bot.value.set(bot); if (sa !== undefined) su.uA.value = sa; } };
}
// drifting bokeh specks (they blur into bokeh under the DOF pass)
export function motes(Wd, o) {
  o = o || {}; const n = o.n || 30, r = rng(o.seed || 5), g = new THREE.Group(), A = o.area || [-4, 4, 0, 3, -4, 4], items = [];
  for (let i = 0; i < n; i++) { const s = glow(o.size || .12, o.color || 0xffe0a0, o.op === undefined ? .6 : o.op); const b = [lerp(A[0], A[1], r()), lerp(A[2], A[3], r()), lerp(A[4], A[5], r())]; s.position.set(...b); g.add(s); items.push({ s, b, p: r() * 6.28, sp: .15 + r() * .3, sz: (o.size || .12) * (.5 + r() * 1.3) }); }
  Wd.scene.add(g);
  Wd.on(t => { for (const m of items) { m.s.position.set(m.b[0] + Math.sin(t * m.sp + m.p) * .25, m.b[1] + Math.sin(t * m.sp * .7 + m.p * 2) * .2 + (o.rise ? ((t * o.rise + m.p) % 1) * .6 : 0), m.b[2] + Math.cos(t * m.sp * .8 + m.p) * .2);
    const k = .6 + .4 * Math.sin(t * m.sp * 2.3 + m.p * 3); m.s.scale.set(m.sz * k, m.sz * k, 1); m.s.material.opacity = (o.op === undefined ? .6 : o.op) * (.5 + .5 * k); } });
  return g;
}

// ------------------------------------------------------------------ textures
const TC = {};
export function stoneTex(seed, base) {
  const key = 's' + seed + base; if (TC[key]) return TC[key];
  const r = rng(seed || 3), c0 = new THREE.Color(base || '#d8c8a2');
  const t = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base || '#d8c8a2'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) { let x = -r() * 60; while (x < w) { const bw = 80 + r() * 90, k = .9 + r() * .2; g.fillStyle = `rgb(${Math.round(c0.r * 255 * k)},${Math.round(c0.g * 255 * k)},${Math.round(c0.b * 255 * k * .98)})`; g.fillRect(x, y, bw, 64); x += bw; } }
    g.strokeStyle = 'rgba(70,55,35,.42)'; g.lineWidth = 3;
    for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let y = 0; y < h; y += 64) { let x = -r() * 60; while (x < w) { const bw = 80 + r() * 90; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); x += bw; } }
    for (let i = 0; i < 500; i++) { g.fillStyle = r() < .5 ? 'rgba(60,45,30,.10)' : 'rgba(255,245,220,.10)'; g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 4); }
  }, [1, 1]);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return (TC[key] = t);
}
export function woodTex(seed, base, plank) {
  const key = 'w' + seed + base + plank; if (TC[key]) return TC[key];
  const r = rng(seed || 4), c0 = new THREE.Color(base || '#9a6a3a');
  const t = canvasTex(512, 512, (g, w, h) => {
    const pw = plank || 128;
    for (let x = 0; x < w; x += pw) { const k = .85 + r() * .25; g.fillStyle = `rgb(${Math.round(c0.r * 255 * k)},${Math.round(c0.g * 255 * k)},${Math.round(c0.b * 255 * k)})`; g.fillRect(x, 0, pw, h);
      for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(50,28,10,${.06 + r() * .1})`; g.lineWidth = 1 + r() * 2; const xx = x + r() * pw; g.beginPath(); g.moveTo(xx, 0); g.bezierCurveTo(xx + (r() - .5) * 20, h * .3, xx + (r() - .5) * 20, h * .6, xx + (r() - .5) * 12, h); g.stroke(); }
      g.strokeStyle = 'rgba(30,16,6,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  }, [1, 1]);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return (TC[key] = t);
}
export function plasterTex(base) {
  const key = 'p' + base; if (TC[key]) return TC[key]; const r = rng(9);
  const t = canvasTex(256, 256, (g, w, h) => { g.fillStyle = base || '#e8d9b8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = r() < .5 ? 'rgba(120,90,50,.06)' : 'rgba(255,250,235,.08)'; g.beginPath(); g.arc(r() * w, r() * h, 3 + r() * 14, 0, 7); g.fill(); } }, [1, 1]);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return (TC[key] = t);
}
function uvScale(geo, w, h, d, k) { const uv = geo.attributes.uv, sc = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const ix = f * 4 + i; uv.setXY(ix, uv.getX(ix) * sc[f][0] * k, uv.getY(ix) * sc[f][1] * k); } return geo; }
export function texBox(w, h, d, tex, tint, o) {
  o = o || {}; const geo = uvScale(new THREE.BoxGeometry(w, h, d), w, h, d, o.k || .9);
  const m = mesh(geo, toon(tint === undefined ? 0xffffff : tint, { map: tex }), Object.assign({ box: true }, o)); return m;
}

// ------------------------------------------------------------------ Jerusalem stone city (no crosses, plain domes)
export function olive(g, x, z, sc, seed) {
  const r = rng(seed || 3), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(sc || 1);
  t.add(cyl(.1, .16, 1.5, 0x4a3828, { pos: [0, .75, 0], inkW: .02 }));
  [[0, 1.9, 0, 1.15], [.7, 1.6, .2, .85], [-.6, 1.7, -.2, .9], [.1, 2.4, .1, .7]].forEach(([px, py, pz, rad], i) => t.add(mesh(new THREE.SphereGeometry(rad, 14, 10), toon(i % 2 ? 0x6f8460 : 0x5a7152), { inkW: .03, pos: [px, py, pz], scale: [1.2, .8, 1] })));
  g.add(t); return t;
}
export function pottedPlant(g, x, y, z, sc) {
  const t = new THREE.Group(); t.position.set(x, y, z); t.scale.setScalar(sc || 1);
  t.add(cyl(.34, .24, .5, 0xb5663a, { pos: [0, .25, 0], inkW: .02 }));
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; t.add(mesh(new THREE.SphereGeometry(.28, 8, 6), toon(i % 2 ? 0x4f7a3c : 0x66934a), { inkW: .015, pos: [Math.cos(a) * .3, .85 + (i % 3) * .14, Math.sin(a) * .3], scale: [.7, 1.8, .7], rot: [Math.sin(a) * .5, 0, -Math.cos(a) * .5] })); }
  g.add(t); return t;
}
const archGeo = (() => { let G = null; return () => { if (G) return G; const sh = new THREE.Shape(); sh.moveTo(-.26, 0); sh.lineTo(.26, 0); sh.lineTo(.26, .5); sh.absarc(0, .5, .26, 0, Math.PI, false); sh.lineTo(-.26, 0); return (G = new THREE.ShapeGeometry(sh, 10)); }; })();
export function city(Wd, o) {
  o = o || {}; const r = rng(o.seed || 11), n = o.n || 60, g = grp(Wd), area = o.area || [-60, 60, -8, -62];
  const tex = [stoneTex(3, '#d9c9a4'), stoneTex(5, '#cdb98f'), stoneTex(8, '#e2d3b0'), stoneTex(12, '#d2bf98')];
  const tints = [0xffffff, 0xf2e6d0, 0xe6d8c0, 0xfff4e0, 0xd8cdb8, 0xefe0c4];
  const winMat = basic(o.litColor || 0xffd488), darkMat = basic(0x2a2a3a), res = { windows: [], winMat, glows: [], darkMat };
  const roofC = [0xb7a37c, 0xa89570, 0xc4b08a], domeAt = [Math.floor(n * .2), Math.floor(n * .52), Math.floor(n * .8)];
  for (let i = 0; i < n; i++) {
    const w = 2.6 + r() * 3.4, tall = r() < .18, h = 2.2 + r() * 3.4 + (tall ? 3 + r() * 3.5 : 0), d = 2.4 + r() * 3, x = lerp(area[0], area[1], r()), z = lerp(area[2], area[3], r()), ty = Math.max(0, (-z - 8)) * (o.slope === undefined ? .11 : o.slope);
    const hh = h + ty, hs = texBox(w, hh, d, tex[i % 4], tints[Math.floor(r() * tints.length)], { inkW: .02, pos: [x, hh / 2 - .02, z], rot: [0, (r() - .5) * .25, 0] });
    hs.castShadow = true; g.add(hs);
    hs.add(box(w + .3, .18, d + .3, roofC[i % 3], { pos: [0, hh / 2 + .08, 0], inkW: .012 }));
    if (r() < .42 && !domeAt.includes(i)) { const ry = hh / 2 + .17, zf = d / 2 + .1; hs.add(box(w + .2, .06, .05, 0x8a7550, { pos: [0, ry + .55, zf], ink: false })); hs.add(box(w + .2, .05, .05, 0x8a7550, { pos: [0, ry + .2, zf], ink: false }));
      for (let k = 0; k <= Math.max(1, Math.floor(w / 1.1)); k++) hs.add(box(.06, .5, .06, 0x8a7550, { pos: [-w / 2 + k * w / Math.max(1, Math.floor(w / 1.1)), ry + .3, zf], ink: false })); }
    const floors = Math.max(1, Math.floor(h / 2.3));
    for (let f = 0; f < floors; f++) { const nw = 1 + Math.floor(r() * 3); for (let k = 0; k < nw; k++) { if (r() < .25) continue; const lit = r() < (o.litFrac === undefined ? .1 : o.litFrac), wm = new THREE.Mesh(archGeo(), lit ? winMat : darkMat);
      wm.position.set(-w / 2 + (k + 1) * w / (nw + 1), -hh / 2 + ty + .9 + f * 2.2, d / 2 + .03); wm.scale.set(1.2, 1.3, 1); hs.add(wm);
      if (lit) { res.windows.push(wm); if (res.glows.length < 22) { const gl = glow(2.2, 0xffc060, .5); gl.position.set(wm.position.x, wm.position.y + .4, d / 2 + .3); hs.add(gl); res.glows.push(gl); } } } }
    if (domeAt.includes(i)) { const rad = Math.min(w, d) * .38, dr = cyl(rad, rad * 1.05, 1.1, 0xd5c39a, { pos: [0, hh / 2 + .7, 0], inkW: .02 }); hs.add(dr);
      const dome = mesh(new THREE.SphereGeometry(rad * 1.08, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xcdbb92), { inkW: .03, pos: [0, .55, 0] }); dr.add(dome);
      dr.add(cyl(.04, .04, .7, 0x8a7550, { pos: [0, .55 + rad * 1.08 + .3, 0], ink: false })); }
    else if (r() < .15) hs.add(box(w * .4, 1.1, d * .4, 0xc2ae86, { pos: [w * .2, hh / 2 + .8, 0], inkW: .012 }));
  }
  for (let i = 0; i < (o.olives === undefined ? 14 : o.olives); i++) olive(g, lerp(area[0], area[1], r()), lerp(-4, area[3] + 12, r()), .9 + r() * .8, i + 5);
  const cy = (px, pz, s) => { g.add(cyl(.02, .5 * s, 4.6 * s, 0x15291f, { pos: [px, 2.3 * s, pz], inkW: .015 })); };
  for (let i = 0; i < (o.cypress === undefined ? 10 : o.cypress); i++) cy(lerp(area[0], area[1], r()), lerp(-6, area[3] + 10, r()), .8 + r() * .6);
  res.group = g; return res;
}
export function hills(Wd, o) {
  o = o || {}; const g = grp(Wd);
  (o.list || [[-30, -110, 40, 14, 22], [20, -120, 50, 17, 24], [-70, -100, 30, 11, 18], [75, -105, 34, 12, 20]]).forEach(([x, z, w, h, d], i) => {
    const m = mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.colors ? o.colors[i % o.colors.length] : 0x2f4a43), { ink: false, scale: [w, h, d], pos: [x, -.2, z] });
    m.castShadow = false; g.add(m); });
  return g;
}

// ------------------------------------------------------------------ clocks
const faceTex = (kind) => {
  const key = 'face' + kind; if (TC[key]) return TC[key];
  return (TC[key] = canvasTex(512, 512, (g, w, h) => {
    const C = 256; const gr = g.createRadialGradient(C, C - 30, 20, C, C, 250); gr.addColorStop(0, kind === 'alarm' ? '#fff3d0' : '#fbf1d8'); gr.addColorStop(1, kind === 'alarm' ? '#ecd9a6' : '#e4d2a2'); g.fillStyle = gr; g.beginPath(); g.arc(C, C, 250, 0, 7); g.fill();
    g.strokeStyle = '#3a2812'; g.lineCap = 'round';
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, big = i % 5 === 0; g.lineWidth = big ? 12 : 4; const r0 = big ? 196 : 218, r1 = 236; g.beginPath(); g.moveTo(C + Math.sin(a) * r0, C - Math.cos(a) * r0); g.lineTo(C + Math.sin(a) * r1, C - Math.cos(a) * r1); g.stroke(); }
    g.fillStyle = '#3a2812'; g.font = '700 74px Heebo, Assistant, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'ltr';
    [[12, 0, -150], [3, 150, 0], [6, 0, 150], [9, -150, 0]].forEach(([s, dx, dy]) => g.fillText(String(s), C + dx, C + dy + 4));
  }));
};
// clock hand angles (radians, clockwise from 12) from an elapsed-seconds-since-12:00 value S
export const handAngles = S => ({ h: (S / 43200) * Math.PI * 2, m: ((S % 3600) / 3600) * Math.PI * 2, s: ((S % 60) / 60) * Math.PI * 2 });
export function wallClock(Wd, o) {
  o = o || {}; const r = o.r || .42, g = grp(Wd, o), alarm = o.kind === 'alarm';
  const rimC = o.rimColor || 0x5a371b;
  g.add(mesh(new THREE.CylinderGeometry(r * 1.1, r * 1.1, .07, 40), toon(rimC), { inkW: .012, rot: [Math.PI / 2, 0, 0], pos: [0, 0, 0] }));
  g.add(mesh(new THREE.TorusGeometry(r * 1.06, r * .06, 12, 48), toon(o.bezel || 0xc99a35), { inkW: .008, pos: [0, 0, .04] }));
  const face = new THREE.Mesh(new THREE.CircleGeometry(r * 1.0, 48), toon(0xffffff, { map: faceTex(alarm ? 'alarm' : 'wall'), emissive: 0x2a2010 })); face.position.z = .037; g.add(face);
  const mk = (len, wd, col, z) => { const p = new THREE.Group(); p.position.z = z; const b = box(wd, len, .012, col, { pos: [0, len / 2 - len * .12, 0], inkW: .004 }); p.add(b); g.add(p); return p; };
  const H = mk(r * .55, r * .075, 0x241608, .05), M = mk(r * .82, r * .055, 0x241608, .058), Sx = mk(r * .9, r * .018, 0xc0392b, .066);
  g.add(mesh(new THREE.CylinderGeometry(r * .05, r * .05, .03, 14), toon(0xc99a35), { inkW: .004, rot: [Math.PI / 2, 0, 0], pos: [0, 0, .07] }));
  const api = { group: g, setTime(S, secs) { const a = handAngles(S); H.rotation.z = -a.h; M.rotation.z = -a.m; Sx.rotation.z = -(secs === undefined ? a.s : secs); Sx.visible = secs !== null; }, hands: { H, M, Sx } };
  api.setTime(o.S || 0); return api;
}
export function alarmClock(Wd, o) {
  o = o || {}; const g = grp(Wd, o), r = .09, red = o.color || 0xc23b30;
  g.add(mesh(new THREE.CylinderGeometry(r * 1.12, r * 1.12, .06, 36), toon(red), { inkW: .006, rot: [Math.PI / 2, 0, 0] }));
  g.add(mesh(new THREE.SphereGeometry(r * 1.12, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(red), { inkW: .006, rot: [-Math.PI / 2, 0, 0], pos: [0, 0, -.03], scale: [1, 1, .55] }));
  g.add(mesh(new THREE.TorusGeometry(r * 1.0, r * .09, 10, 36), toon(0xe6c36a), { inkW: .004, pos: [0, 0, .032] }));
  const face = new THREE.Mesh(new THREE.CircleGeometry(r * .94, 36), toon(0xffffff, { map: faceTex('alarm'), emissive: 0x201808 })); face.position.z = .031; g.add(face);
  [-1, 1].forEach(s => { const bell = mesh(new THREE.SphereGeometry(r * .42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xd8b24a), { inkW: .004, pos: [s * r * .72, r * 1.04, 0], rot: [0, 0, -s * .55] }); g.add(bell);
    const leg = cyl(.006, .006, r * .55, 0x3a2a1a, { pos: [s * r * .72, -r * 1.12, 0], rot: [0, 0, s * .45], ink: false }); g.add(leg); });
  g.add(box(r * 1.05, .008, .012, 0x3a2a1a, { pos: [0, r * 1.28, 0], ink: false }));
  const mk = (len, wd, col, z) => { const p = new THREE.Group(); p.position.z = z; p.add(box(wd, len, .003, col, { pos: [0, len / 2 - len * .1, 0], ink: false })); g.add(p); return p; };
  const H = mk(r * .5, r * .09, 0x241608, .036), M = mk(r * .78, r * .06, 0x241608, .039), Sx = mk(r * .84, r * .02, 0xc0392b, .042);
  return { group: g, setTime(S, secs) { const a = handAngles(S); H.rotation.z = -a.h; M.rotation.z = -a.m; Sx.rotation.z = -(secs === undefined ? a.s : secs); } };
}
// digital readouts: canvas with digits that flip (vertical squash) when `prev` -> `str` over k in 0..1
export function digitalPanel(w, h, o) {
  o = o || {}; const cw = o.cw || 512, ch = Math.round(cw * h / w), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const c = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, fog: false, toneMapped: false }));
  function draw(str, prev, k, t) {
    c.fillStyle = o.bg || '#05080c'; c.fillRect(0, 0, cw, ch);
    if (o.bgGlow) { const g = c.createRadialGradient(cw / 2, ch / 2, 10, cw / 2, ch / 2, cw * .6); g.addColorStop(0, o.bgGlow); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, cw, ch); }
    const fs = ch * (o.fs || .62), cwid = fs * .62; c.font = `${o.weight || 800} ${fs}px Heebo, Assistant, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'ltr';
    const n = str.length, tw = cwid * (n - .35), x0 = cw / 2 - tw / 2 + cwid / 2;
    for (let i = 0; i < n; i++) {
      const ch0 = str[i], was = prev ? prev[i] : ch0, flip = was !== ch0 && k > 0 && k < 1; let sc = 1, show = ch0;
      if (flip) { if (k < .5) { sc = 1 - k * 2; show = was; } else { sc = (k - .5) * 2; show = ch0; } } else if (was !== ch0 && k <= 0) show = was;
      if (ch0 === ':' && Math.floor(t * 1.6) % 2 === 1 && o.blink) continue;
      c.save(); c.translate(x0 + i * cwid * (ch0 === ':' ? .8 : 1) - (ch0 === ':' ? cwid * .05 * i : 0), ch / 2); c.scale(1, Math.max(.02, sc)); c.shadowColor = o.glow || 'rgba(120,255,160,.9)'; c.shadowBlur = fs * .18; c.fillStyle = o.fg || '#7dffb0'; c.fillText(show, 0, 0); c.restore();
    }
    tex.needsUpdate = true;
  }
  return { mesh: m, draw, cv };
}
export function phoneProp(Wd, o) {
  o = o || {}; const g = grp(Wd, o), s = o.s || 1;
  // small keypad phone lying flat: body, small screen at the top, 4x3 physical number keys below
  g.add(box(.062 * s, .014 * s, .128 * s, 0x2a2f3a, { inkW: .004, pos: [0, .007 * s, 0] }));
  g.add(box(.052 * s, .004 * s, .036 * s, 0x10141c, { inkW: .002, pos: [0, .016 * s, -.044 * s] }));
  const pn = digitalPanel(.046 * s, .028 * s, { cw: 300, fg: '#f2f6ff', glow: 'rgba(160,200,255,.8)', bg: '#0a1020', bgGlow: 'rgba(60,110,200,.35)', fs: .5, blink: false });
  pn.mesh.rotation.x = -Math.PI / 2; pn.mesh.position.set(0, .0185 * s, -.044 * s); g.add(pn.mesh);
  g.add(box(.012 * s, .004 * s, .006 * s, 0x6a7080, { ink: false, pos: [0, .016 * s, -.016 * s] }));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) g.add(box(.013 * s, .004 * s, .0095 * s, r === 3 && c !== 1 ? 0x8a8f9c : 0xd8dce6, { inkW: .0015, pos: [(c - 1) * .0165 * s, .016 * s, (-.002 + r * .0135) * s] }));
  g.add(cyl(.0025 * s, .0025 * s, .03 * s, 0x2a2f3a, { pos: [.022 * s, .028 * s, -.062 * s], inkW: .002 }));
  const set = (str, prev, k, t) => pn.draw(str, prev, k, t); set('02:00', '02:00', 1, 0);
  return { group: g, set, light: glow(.45 * s, 0x9ec4ff, .5) };
}
export function ovenProp(Wd, o) {
  o = o || {}; const g = grp(Wd, o);
  g.add(box(.62, .88, .6, 0xe9e2d2, { inkW: .01, pos: [0, .44, 0] }));
  g.add(box(.62, .12, .05, 0xcfc7b4, { inkW: .006, pos: [0, .86, .3] }));
  const pn = digitalPanel(.16, .07, { cw: 256, fg: '#ff9a3c', glow: 'rgba(255,150,60,.9)', bg: '#120804', fs: .78, blink: true, weight: 700 });
  pn.mesh.position.set(0, .86, .326); g.add(pn.mesh);
  [-.2, -.1, .1, .2].forEach(x => g.add(cyl(.022, .022, .03, 0x2b2b2b, { rot: [Math.PI / 2, 0, 0], pos: [x, .86, .335], inkW: .004 })));
  g.add(box(.5, .38, .02, 0x20262e, { inkW: .006, pos: [0, .42, .31] })); g.add(box(.46, .3, .02, 0x3a2a1a, { pos: [0, .42, .318], ink: false }));
  g.add(cyl(.012, .012, .46, 0x9a9a9a, { rot: [0, 0, Math.PI / 2], pos: [0, .67, .345], inkW: .004 }));
  const set = (str, prev, k, t) => pn.draw(str, prev, k, t); set('02:04', '02:04', 1, 0);
  return { group: g, set };
}

// ------------------------------------------------------------------ home room (night): used by several shots
export function homeRoom(Wd, o) {
  o = o || {}; const R = {};
  const plaster = plasterTex('#e6d6b4'), wood = woodTex(4, '#8a5a30', 128), g = grp(Wd);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(9, 8), toon(0xffffff, { map: (() => { const t = woodTex(6, '#9a6a3a', 128).clone(); t.needsUpdate = true; t.repeat.set(3, 3); return t; })() }));
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, -2.5); fl.receiveShadow = true; g.add(fl);
  const wall = (w, h, d, x, y, z) => { const m = texBox(w, h, d, plaster, 0xffffff, { inkW: .01, pos: [x, y, z], k: .35 }); m.receiveShadow = true; g.add(m); return m; };
  wall(9, 3.4, .2, 0, 1.7, -4.1);                               // back
  wall(.2, 3.4, 1.1, -4.0, 1.7, -3.55); wall(.2, 3.4, 3.5, -4.0, 1.7, 0.15);   // left with a window gap z -3.0..-1.4
  wall(.2, 1.0, 1.6, -4.0, .5, -2.2); wall(.2, 1.0, 1.6, -4.0, 2.9, -2.2);
  wall(.2, 3.4, 6.2, 4.0, 1.7, -1.0);                          // right
  const sill = box(.16, .06, 1.8, 0x6a4526, { pos: [-3.96, 1.02, -2.2], inkW: .006 }); g.add(sill);
  const winGl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), basic(0x1a2a5c)); winGl.position.set(-4.1, 1.7, -2.2); winGl.rotation.y = Math.PI / 2; g.add(winGl); R.window = winGl;
  g.add(box(.08, 1.4, .06, 0x6a4526, { pos: [-3.98, 1.7, -2.2], inkW: .005 })); g.add(box(.08, .05, 1.6, 0x6a4526, { pos: [-3.98, 1.7, -2.2], inkW: .005 }));
  g.add(box(9, .14, .06, 0x7a5232, { pos: [0, .07, -3.97], inkW: .005 }));
  // back wall: clock + shelves + a small picture
  R.clock = wallClock(Wd, { pos: [.2, 2.1, -3.93], r: .42, S: 3600 * 1 + 59 * 60 + 40 });
  const shelf = (x) => { const sh = grp(Wd, { pos: [x, 0, -3.7] }); sh.add(box(1.1, 2.2, .35, 0x7a5232, { pos: [0, 1.1, 0], inkW: .01 }));
    const r = rng(x * 7 + 3), cols = [0xdc5a4c, 0x4a93d8, 0xffc531, 0x66a64a, 0x8a5aa8, 0xe58a3c, 0xf3e6c8];
    for (let row = 0; row < 4; row++) { sh.add(box(1.0, .04, .36, 0x5a3a1c, { pos: [0, .35 + row * .5, .01], ink: false })); let bx = -.45; while (bx < .42) { const bw = .06 + r() * .07, bh = .26 + r() * .14; sh.add(box(bw, bh, .24, cols[Math.floor(r() * cols.length)], { pos: [bx + bw / 2, .37 + row * .5 + bh / 2, .04], inkW: .004 })); bx += bw + .005; } }
    g.add(sh); return sh; };
  shelf(-2.3); shelf(-1.1);
  const pic = grp(Wd, { pos: [2.4, 1.9, -3.95] }); pic.add(box(.9, .65, .04, 0x5a3a1c, { inkW: .006 })); pic.add(box(.78, .53, .045, 0x9ec0d8, { ink: false })); pic.add(cyl(.0, .22, .3, 0x55705a, { pos: [-.12, -.05, .03], ink: false })); g.add(pic);
  // table with phone + alarm clock
  const tb = grp(Wd, { pos: [.1, 0, -1.3] }); tb.add(box(2.4, .07, 1.0, 0x9a6a3a, { pos: [0, .76, 0], inkW: .008 })); [[-1.1, -.42], [1.1, -.42], [-1.1, .42], [1.1, .42]].forEach(([x, z]) => tb.add(box(.07, .76, .07, 0x7a5232, { pos: [x, .38, z], inkW: .006 }))); g.add(tb);
  R.table = tb;
  R.phone = phoneProp(Wd, { pos: [.65, .795, -1.0], rot: .35, s: o.phoneS || 1.45 });
  R.alarm = alarmClock(Wd, { pos: [-.25, .795 + .11, -1.4], rot: .2 });
  // oven + kitchen counters along the back wall (right of the clock), oven front faces the room (+z)
  R.oven = ovenProp(Wd, { pos: [1.3, 0, -3.62], rot: 0 });
  g.add(box(1.2, .9, .62, 0x6d5a45, { pos: [.4, .45, -3.62], inkW: .01 })); g.add(box(1.28, .05, .68, 0x3a3a40, { pos: [.4, .92, -3.62], inkW: .006 }));
  g.add(box(1.2, .9, .62, 0x6d5a45, { pos: [2.2, .45, -3.62], inkW: .01 })); g.add(box(1.28, .05, .68, 0x3a3a40, { pos: [2.2, .92, -3.62], inkW: .006 }));
  R.group = g; return R;
}

// ------------------------------------------------------------------ watch table set (wood table, book stack, shelf wall + far wall clock)
export function watchTable(Wd, o) {
  o = o || {}; const R = {}, g = grp(Wd);
  const tex = woodTex(11, '#a67845', 160).clone(); tex.needsUpdate = true; tex.repeat.set(3, 3);
  const tb = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), toon(0xffffff, { map: tex })); tb.rotation.x = -Math.PI / 2; tb.receiveShadow = true; g.add(tb);
  const wall = texBox(16, 7, .3, plasterTex('#d9c6a0'), 0xffffff, { pos: [0, 3.2, -4.2], k: .3, inkW: .01 }); g.add(wall);
  R.farClock = wallClock(Wd, { pos: [.95, .98, -4.0], r: .34, S: 3600 * 1 + 7 * 60 }); g.add(box(2.4, .7, .5, 0x6a4526, { pos: [1.0, .35, -3.8], inkW: .01 }));
  // shelves behind (blurred)
  [-1.4, -3.4].forEach((x, i) => { const sh = grp(Wd, { pos: [x, 0, -3.9] }); sh.add(box(1.6, 2.4, .4, 0x7a5232, { pos: [0, 1.2, 0], inkW: .01 })); const r = rng(40 + i); for (let row = 0; row < 4; row++) { let bx = -.72; while (bx < .7) { const bw = .08 + r() * .1, bh = .3 + r() * .15; sh.add(box(bw, bh, .28, [0xdc5a4c, 0x4a93d8, 0xffc531, 0x66a64a, 0x8a5aa8, 0xe58a3c][Math.floor(r() * 6)], { pos: [bx + bw / 2, .42 + row * .55 + bh / 2, .05], inkW: .004 })); bx += bw + .005; } } g.add(sh); });
  // window glow at the right (sun for L09)
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.8), basic(o.windowColor || 0x2a3a70)); win.position.set(2.7, 1.45, -4.0); g.add(win); R.window = win;
  R.winGlow = glow(6, 0xffd890, 0); R.winGlow.position.set(2.7, 1.45, -3.9); g.add(R.winGlow);
  // book stack (foreground-left) and the one the watch leans on
  const colors = [0x8a2f2a, 0x24407a, 0x2f5d3a, 0x6a4a1c, 0x5a2f6a];
  const stack = (x, z, n, rot) => { const s = grp(Wd, { pos: [x, 0, z], rot }); let y = 0; for (let i = 0; i < n; i++) { const hh = .06 + (i % 3) * .015; s.add(box(.34 - i * .01, hh, .46 - i * .01, colors[i % colors.length], { pos: [0, y + hh / 2, 0], rot: [0, (i - 1) * .12, 0], inkW: .006 })); s.add(box(.3 - i * .01, hh - .015, .43, 0xf3e6c8, { pos: [.02, y + hh / 2, .0], rot: [0, (i - 1) * .12, 0], ink: false })); y += hh; } g.add(s); return s; };
  R.leanStack = stack(.06, -.36, 2, .1);
  R.fore = stack(-.42, .55, 3, -.35);
  R.group = g; return R;
}

// ------------------------------------------------------------------ sefer / shtender
export function pageTex(seed, opts) {
  const r = rng(seed || 2);
  return canvasTex(512, 640, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(1, '#f2d896'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(70,40,10,.7)'; g.lineWidth = 3; g.strokeRect(24, 24, w - 48, h - 48);
    // header band (the title is drawn live by the caller when needed)
    g.fillStyle = 'rgba(120,70,20,.16)'; g.fillRect(40, 40, w - 80, 70);
    // a central text block and two side commentary columns, as grey-brown strokes (no letters)
    const col = (x0, x1, y0, y1, ls) => { for (let y = y0; y < y1; y += ls) { let x = x1; while (x > x0 + 10) { const wd = 10 + r() * 38; g.fillStyle = `rgba(60,35,12,${.55 + r() * .25})`; g.fillRect(x - wd, y, Math.min(wd, x - x0), 6); x -= wd + 6; } } };
    col(150, 362, 130, 590, 17); col(40, 140, 130, 590, 13); col(372, 472, 130, 590, 13);
    g.strokeStyle = 'rgba(70,40,10,.4)'; g.lineWidth = 2; [[145, 130, 145, 590], [367, 130, 367, 590]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
    for (let i = 0; i < 600; i++) { g.fillStyle = 'rgba(120,80,30,.04)'; g.fillRect(r() * w, r() * h, 3 + r() * 5, 3); }
  });
}
export function sefer(Wd, o) {
  o = o || {}; const g = grp(Wd, o), pt = pageTex(5), pt2 = pageTex(9);
  const pm = (tex, k) => new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(k, k * .96, k * .86), fog: false });
  [-1, 1].forEach(s => {
    const pg = new THREE.Mesh(new THREE.PlaneGeometry(.42, .54), pm(s < 0 ? pt : pt2, o.bright || 1)); pg.position.set(s * .212, .075, 0); pg.rotation.x = -Math.PI / 2; pg.rotation.z = s * .06; g.add(pg); (s < 0 ? (g.userData.pgL = pg) : (g.userData.pgR = pg));
    g.add(box(.44, .05, .56, 0xf0e2bc, { pos: [s * .222, .035, 0], rot: [0, 0, s * .02], inkW: .006 }));
    g.add(box(.46, .018, .58, 0x6a1f1a, { pos: [s * .232, .008, 0], inkW: .006 }));
  });
  g.add(box(.03, .09, .58, 0x4a1612, { pos: [0, .045, 0], inkW: .005 }));
  return g;
}
export function shtender(Wd, o) {
  o = o || {}; const g = grp(Wd, o), wc = 0x7a4a24, wd = 0x5a3416;
  g.add(box(.7, .9, .55, wc, { pos: [0, .45, 0], inkW: .012 })); g.add(box(.78, .06, .62, wd, { pos: [0, .9, 0], inkW: .01 }));
  const slope = grp(Wd, { pos: [0, 1.12, -.05], rot: [.5, 0, 0] }); g.add(slope);
  slope.add(box(.78, .05, .6, wc, { inkW: .01 })); slope.add(box(.78, .07, .06, wd, { pos: [0, .05, .3], inkW: .008 }));
  g.userData.slope = slope; return g;
}

// ------------------------------------------------------------------ Earth
export function earthTexture() {
  const poly = (g, pts, W, H) => { g.beginPath(); pts.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * W, y = (90 - la) / 180 * H; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); };
  return canvasTex(2048, 1024, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a6fb8'); gr.addColorStop(.5, '#1f64ad'); gr.addColorStop(1, '#2a6fb8'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.filter = 'blur(5px)'; g.fillStyle = '#6f9a4a';
    poly(g, [[-17, 21], [-10, 30], [-6, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [40, -2], [40, -15], [33, -26], [20, -35], [12, -18], [9, -1], [8, 5], [-8, 4], [-17, 14]], W, H);
    poly(g, [[-9, 37], [-9, 43], [-4, 48], [3, 51], [8, 55], [12, 55], [24, 60], [28, 70], [18, 70], [6, 62], [12, 58], [14, 54], [24, 54], [30, 48], [40, 46], [40, 41], [28, 41], [24, 37], [16, 38], [12, 44], [8, 44], [3, 43], [-1, 38]], W, H);
    poly(g, [[40, 46], [40, 70], [100, 76], [140, 72], [180, 66], [170, 60], [140, 52], [130, 42], [122, 38], [122, 30], [120, 22], [108, 18], [104, 10], [100, 2], [98, 16], [92, 22], [80, 10], [72, 20], [67, 25], [57, 25], [56, 27], [48, 30], [44, 37], [36, 37], [34, 31], [36, 36], [40, 41]], W, H);
    poly(g, [[-125, 50], [-95, 70], [-60, 60], [-55, 48], [-80, 25], [-97, 18], [-118, 32]], W, H); poly(g, [[-80, 8], [-50, 0], [-40, -20], [-60, -52], [-72, -40], [-78, -10]], W, H);
    g.fillStyle = '#d4b676'; poly(g, [[35, 29], [43, 30], [48, 30], [56, 24], [59, 22], [52, 16], [43, 13], [39, 21]], W, H); poly(g, [[-12, 30], [10, 30], [30, 30], [30, 20], [0, 18], [-12, 20]], W, H);
    g.filter = 'none'; const rn = rng(5); for (let i = 0; i < 2500; i++) { g.fillStyle = rn() < .5 ? 'rgba(60,90,40,.10)' : 'rgba(200,170,110,.10)'; g.beginPath(); g.arc(rn() * W, rn() * H, 6 + rn() * 26, 0, 7); g.fill(); }
    g.fillStyle = '#eef3f8'; g.fillRect(0, 0, W, 40); g.fillRect(0, H - 50, W, 50);
    const r = rng(77); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(255,255,255,.26)'; for (let i = 0; i < 70; i++) { const x = r() * W, y = H * (.15 + r() * .7); g.beginPath(); g.ellipse(x, y, 30 + r() * 90, 8 + r() * 22, (r() - .5) * .6, 0, 7); g.fill(); }
  });
}
export function earth(Wd, o) {
  o = o || {}; const R = o.R || 6000, g = grp(Wd, { pos: o.pos });
  const tex = earthTexture(); const e = mesh(new THREE.SphereGeometry(R, 96, 48), toon(0xffffff, { map: tex }), { ink: false }); e.castShadow = false; e.receiveShadow = false; g.add(e);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.045, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { c: { value: new THREE.Color(.35, .62, 1.0) } }, vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 c; varying vec3 vN; void main(){ float i = pow(max(0.0, 0.72 - dot(vN, vec3(0.0,0.0,1.0))), 3.0) * 1.6; gl_FragColor = vec4(c * i, i); }' }));
  g.add(atm); g.userData.earth = e; return g;
}
