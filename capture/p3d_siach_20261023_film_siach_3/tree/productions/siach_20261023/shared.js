// shared.js - film_siach (The Money Test). Shared look constants + helpers (boy, coins, heap, heart, props). Deterministic: everything is a function of t.
import { THREE, box, cyl, ball, mesh, toon, ink, canvasTex, groundTex, person, cloud, rng, clamp, lerp, ease, prog } from '../../lib/stage3d.js';

export const INK = 0x3A2A12, GOLD = 0xFFD54A;
export const BOY = { kind: 'boy', coat: '#2b3a5a', hat: 'kippa', hatColor: '#2A4A8A', beardLen: 0, skin: '#f0d2b4', pants: '#1b1d24' };
export const BOY_SCALE = 1;           // the brief says .72; the engine boy is already .8 of a man, so 1 keeps him readable next to men
export const ROAD_Y = .08;            // top of the road slabs: feet of anyone on a road stand here
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

export const sky = o => Object.assign({ ground: 'sand', skyTop: 0x7EC8F0, skyBottom: 0xFFF1C9, fogColor: 0xFFF1C9, fogNear: 70, fogFar: 260, sun: 2.0, sunPos: [-30, 50, 25],
  hemi: 1.3, hemiSky: 0xBFE2FA, hemiGround: 0xE9D3A1, shadowExt: 30 }, o || {});

export function hero(Wd, fn, o) { return person(Wd, BOY, t => Object.assign({ seed: .6, smile: .6 }, fn(t)), Object.assign({ scale: BOY_SCALE }, o || {})); }
export const man = (Wd, look, fn, o) => person(Wd, look, fn, o);

// ---------- looks (men and boys only, a kippa on every figure - the engine forces it) ----------
const COATS = ['#7A5C3E', '#8A8A80', '#6B5B4B', '#9A8366'], KIP = ['#2A4A8A', '#E8E0C8', '#2A4A8A', '#2A4A8A'];
const SKINS = ['#efcfb0', '#f0d2b4', '#e6bf9a', '#d9ac86', '#f3d9bf'], BEARDS = ['#3a2618', '#2a2018', '#6b5a48', '#8a8a86', '#4a3626'];
export function poorLook(i) {
  const r = rng(300 + i * 17), kid = i % 5 === 3;
  return { kind: kid ? 'boy' : undefined, coat: COATS[i % COATS.length], skin: SKINS[Math.floor(r() * 5)], pants: '#3a342c', hat: 'kippa', hatColor: KIP[i % 4], vest: false, coatLength: .45,
    beard: BEARDS[Math.floor(r() * 5)], beardLen: kid ? 0 : .35 + r() * .45, glasses: !kid && r() < .15 };
}
const BRIGHT = ['#3c6aa0', '#4f8a5a', '#8a5a7a', '#a0703a', '#4a7a8a', '#7a6a9a'];
export function townLook(i) {
  const r = rng(500 + i * 13), kid = i % 2 === 1;
  return { kind: kid ? 'boy' : undefined, coat: BRIGHT[i % BRIGHT.length], skin: SKINS[Math.floor(r() * 5)], pants: '#2a2a33', hat: 'kippa', hatColor: KIP[(i + 1) % 4], vest: false, coatLength: .45,
    beard: BEARDS[Math.floor(r() * 5)], beardLen: kid ? 0 : .4 + r() * .4, glasses: !kid && r() < .2 };
}

// ---------- glow ----------
let _g = null;
export const glowTex = () => _g || (_g = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,236,170,1)'); r.addColorStop(.4, 'rgba(255,210,110,.45)'); r.addColorStop(1, 'rgba(255,190,80,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }));
export function glowSp(Wd, size, op, col) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: col === undefined ? 0xffffff : col, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: op === undefined ? .8 : op })); s.scale.set(size, size, 1); s.renderOrder = 4; if (Wd) Wd.add(s); return s; }

// ---------- ground pieces ----------
export function paving(Wd, o) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.d), new THREE.MeshLambertMaterial({ map: groundTex('stone', o.rep || [o.w / 3, o.d / 3]), color: o.tint === undefined ? 0xFFE9C0 : o.tint, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.rotation.x = -Math.PI / 2; m.position.set(o.x || 0, o.y === undefined ? .03 : o.y, o.z || 0); m.receiveShadow = true; Wd.add(m); return m;
}
// road: a polyline of slabs (top at ROAD_Y) with two curbs
export function road(Wd, pts, w, color) {
  const g = new THREE.Group(); Wd.add(g);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ry = Math.atan2(dx, dz), sg = new THREE.Group();
    sg.position.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2); sg.rotation.y = ry; g.add(sg);
    sg.add(box(w, ROAD_Y, L + .02, color || 0xE6CE9C, { pos: [0, ROAD_Y / 2, 0], inkW: .012 }));
    for (const s of [-1, 1]) sg.add(box(.16, .05, L + .02, 0xC9A86A, { pos: [s * (w / 2 - .08), ROAD_Y + .02, 0], ink: false }));
    for (let k = 0; k < L; k += 1.6) sg.add(box(w * .5, .006, .05, 0xC9A86A, { pos: [0, ROAD_Y + .004, -L / 2 + k + .4], ink: false }));
  }
  return g;
}

// ---------- coins (flat gold discs with ink outline) ----------
export function coinMesh(K) { const r = .18 * K; return cyl(r, r, .03 * K, GOLD, { inkW: .009 * K, inkColor: INK }); }
// stack of 5. o: pos [x,y,z], K (2), take (time the boy collects it), to (t => [x,y,z] of the hand), appear (time it pops in; default visible)
export function stack(Wd, o) {
  const K = o.K || 2, g = new THREE.Group(), th = .03 * K * 1.15; Wd.add(g);
  for (let i = 0; i < 5; i++) { const c = coinMesh(K); c.scale.y = 1.15; c.position.set((i % 2 ? .012 : -.012) * K, th * (i + .5), (i % 3 - 1) * .008 * K); c.rotation.y = i * .7; g.add(c); }
  const gl = glowSp(null, 1.5 * K / 2, .5); gl.position.y = th * 3; g.add(gl);
  const p = o.pos;
  Wd.on(t => {
    const a = o.appear === undefined ? 1 : ease.out(prog(t, o.appear, o.appear + .5));
    let u = o.take === undefined ? 0 : prog(t, o.take, o.take + .75), e = ease.io(u);
    g.visible = a > .01 && u < 1;
    if (!g.visible) return;
    const to = o.to ? o.to(t) : [p[0], p[1] + 1, p[2]];
    g.position.set(lerp(p[0], to[0], e), lerp(p[1], to[1], e) + .5 * Math.sin(Math.PI * e), lerp(p[2], to[2], e));
    const s = a * (1 - .85 * e); g.scale.setScalar(Math.max(.001, s)); g.rotation.y = e * 6;
  });
  return g;
}

const DUM = new THREE.Object3D();
// heap: a cone of 60 discs built by code (instanced). o: pos, R (base radius), K (disc scale), glow,
// optional fly-off: t0 (first disc leaves), t1 (last disc gone), tgt(i) -> world target [x,y,z], arc (height).
export function heap(Wd, o) {
  const n = 60, K = o.K || 1.5, R = o.R || 1.45, rad = .18 * K, th = .03 * K * 2.4, p = o.pos, FL = 1.3, SH = .35;
  const geo = new THREE.CylinderGeometry(rad, rad, th, 24);
  const im = new THREE.InstancedMesh(geo, toon(GOLD, { emissive: 0x4a3000 }), n), ik = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }), n);
  im.frustumCulled = ik.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; Wd.add(im); Wd.add(ik);
  const r = rng(o.seed || 11), C = [], counts = [24, 16, 10, 6, 3, 1], Hm = o.Hm || 1;
  counts.forEach((c, l) => { const Rl = R * (1 - l * .17); for (let k = 0; k < c; k++) { const a = k * 2.39996 + l, rr = Rl * Math.sqrt((k + .5) / c);
    C.push({ x: Math.cos(a) * rr, y: th * .5 + l * th * .78 * Hm + r() * .02, z: Math.sin(a) * rr, rx: (r() - .5) * .55, ry: r() * 6.28, rz: (r() - .5) * .55 }); } });
  if (o.core) { const hg = 5.6 * th * .78 * Hm + th, cone = mesh(new THREE.ConeGeometry(R * .9, hg, 28), toon(0xD9A92A, { emissive: 0x3a2600 }), { pos: [p[0], p[1] + hg / 2, p[2]], inkW: .03, inkColor: INK }); Wd.add(cone); }
  C.reverse();   // index 0 = top coin: it leaves first
  const gl = o.glow === false ? null : glowSp(Wd, R * 5.5, .55); if (gl) gl.position.set(p[0], p[1] + R * .55, p[2]);
  const put = (m, i, x, y, z, rx, ry, rz, s, ix, iy) => { DUM.position.set(x, y, z); DUM.rotation.set(rx, ry, rz); DUM.scale.set(s * ix, s * iy, s * ix); DUM.updateMatrix(); m.setMatrixAt(i, DUM.matrix); };
  Wd.on(t => {
    let rest = 0;
    for (let i = 0; i < n; i++) {
      const c = C[i]; let x = p[0] + c.x, y = p[1] + c.y, z = p[2] + c.z, rx = c.rx, rz = c.rz, ry = c.ry, s = 1;
      if (o.t0 !== undefined) {
        const L = o.t0 + (o.t1 - o.t0 - FL - SH) * i / (n - 1), u = (t - L) / FL;
        if (t >= L) { const tg = o.tgt(i), uu = clamp(u, 0, 1);
          x = lerp(x, tg[0], uu); z = lerp(z, tg[2], uu); y = lerp(y, tg[1], uu) + (o.arc || 2.2) * 4 * uu * (1 - uu); rx = c.rx + uu * 9; ry = c.ry + uu * 5;
          if (u > 1) s = Math.max(.0001, 1 - clamp((u - 1) * FL / SH, 0, 1)); } else rest++;
      } else rest++;
      put(im, i, x, y, z, rx, ry, rz, s, 1, 1); put(ik, i, x, y, z, rx, ry, rz, s, 1.16, 1.9);
    }
    im.instanceMatrix.needsUpdate = true; ik.instanceMatrix.needsUpdate = true;
    if (gl) { gl.material.opacity = .6 * rest / n * (.9 + .1 * Math.sin(t * 3)); gl.visible = rest > 0; }
  });
  return { im, ik, glow: gl };
}

// one coin travelling an arc. o: from (t => [x,y,z]), to (t => [x,y,z]), t0, dur (.6), arc (.8), K (1.6)
export function flyCoin(Wd, o) {
  const c = coinMesh(o.K || 1.6), dur = o.dur || .6; Wd.add(c);
  Wd.on(t => {
    const u = (t - o.t0) / dur; c.visible = u >= 0 && u < 1.35; if (!c.visible) return;
    const uu = clamp(u, 0, 1), a = o.from(t), b = o.to(t);
    c.position.set(lerp(a[0], b[0], uu), lerp(a[1], b[1], uu) + (o.arc === undefined ? .8 : o.arc) * 4 * uu * (1 - uu), lerp(a[2], b[2], uu));
    c.rotation.set(uu * 9, uu * 3, 0); c.scale.setScalar(Math.max(.001, u > 1 ? 1 - (u - 1) / .35 : 1));
  });
  return c;
}

// ---------- the heart ----------
export function heartGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, -.45); s.bezierCurveTo(-.55, -.1, -.6, .35, -.28, .42); s.bezierCurveTo(-.12, .46, 0, .36, 0, .26);
  s.bezierCurveTo(0, .36, .12, .46, .28, .42); s.bezierCurveTo(.6, .35, .55, -.1, 0, -.45);
  const g = new THREE.ExtrudeGeometry(s, { depth: .22, bevelEnabled: true, bevelSize: .04, bevelThickness: .05, bevelSegments: 3, curveSegments: 18 }); g.translate(0, 0, -.11); return g;
}
// heart: warm red-gold, billboard to the camera, grows with each gift. o: pos [x,y,z], gifts [times], s0, s1, base (.55)
export function heart(Wd, o) {
  const g = new THREE.Group(); Wd.add(g);
  const hm = mesh(heartGeo(), toon(0xE8453C, { emissive: 0x6a2008 }), { box: true, inkW: .045, inkColor: INK }); g.add(hm);
  const rim = new THREE.Mesh(heartGeo(), toon(0xFFC531, { emissive: 0x7a5200 })); rim.scale.set(.62, .62, 1.1); rim.position.z = .02; g.add(rim);
  const gl = glowSp(null, 2.2, .55, 0xFF9A5A); gl.position.z = -.15; g.add(gl);
  const b = o.base || .55, n = o.gifts.length;
  Wd.on((t, cam) => {
    let k = 0; for (const gt of o.gifts) k += ease.out(prog(t, gt, gt + .15));
    const s = lerp(o.s0 === undefined ? .3 : o.s0, o.s1 === undefined ? 1.6 : o.s1, k / n) * (1 + .06 * Math.sin(t * 6.5));
    const p = o.pos(t); g.position.set(p[0], p[1] + .04 * Math.sin(t * 2.2), p[2]);
    g.rotation.y = Math.atan2(cam.position.x - g.position.x, cam.position.z - g.position.z); g.scale.setScalar(Math.max(.001, s * b));
    gl.material.opacity = .35 + .2 * Math.sin(t * 6.5);
  });
  return g;
}

// ---------- pouch in the boy's hand (shot 1) ----------
export function pouchOn(Wd, P) {
  let done = false;
  Wd.on(() => { if (done || !P.figure) return; done = true; const h = P.figure.bones.handA.userData.hand, sd = new THREE.Group(); h.add(sd);
    sd.add(ball(.085, 0xD9A52B, { pos: [0, -.1, 0], scale: [1, 1.05, 1], inkW: .008, inkColor: INK }));
    sd.add(cyl(.045, .06, .06, 0xB8821F, { pos: [0, -.02, 0], inkW: .006, inkColor: INK })); sd.add(ball(.03, 0xF5B820, { pos: [0, .015, 0], inkW: .005, inkColor: INK })); sd.position.set(0, -.06, .02); });
}

// ---------- market stall with 3 shiny toys (boxes) ----------
export function stall(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); g.rotation.y = o.rot || 0; Wd.add(g);
  g.add(box(2.6, .1, 1.1, 0xA4713F, { pos: [0, .95, 0] })); g.add(box(2.5, .9, 1.0, 0xC89558, { pos: [0, .45, 0] }));
  for (const sx of [-1.25, 1.25]) for (const sz of [-.5, .5]) g.add(box(.09, 2.3, .09, 0x7A5232, { pos: [sx, 1.15, sz * 1.0] }));
  for (let i = 0; i < 7; i++) { const b = box(.4, .06, 1.5, i % 2 ? 0xF8F2E4 : 0xDC5A4C, { pos: [-1.2 + i * .4, 2.38 - 0, 0], rot: [.22, 0, 0], inkW: .01 }); g.add(b); }
  const toys = [[-.8, 0xDC5A4C, .36, .36, .36], [0, 0x4A93D8, .3, .5, .3], [.8, 0xFFC531, .4, .26, .4]];
  toys.forEach(([x, c, w, h, d], i) => { const m = box(w, h, d, c, { pos: [x, 1.0 + h / 2, 0], rot: [0, .5 * (i + 1), 0], inkW: .012, inkColor: INK }); g.add(m);
    m.material.emissive = new THREE.Color(c).multiplyScalar(.28);
    const gl = glowSp(null, .9, .55); gl.position.set(x, 1.0 + h + .12, 0); g.add(gl); g.userData['gl' + i] = gl; });
  Wd.on(t => { for (let i = 0; i < 3; i++) { const gl = g.userData['gl' + i]; gl.material.opacity = .35 + .35 * Math.max(0, Math.sin(t * 4 + i * 2.1)); } });
  return g;
}

// ---------- the little house (shot 4): courses rise one by one with each saving, then the roof, the door and windows ----------
export function littleHouse(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); Wd.add(g);
  const W = 3.4, D = 2.6, H = .85, courses = [];
  for (let i = 0; i < 3; i++) { const b = box(W, H, D, i % 2 ? 0xF0DDB0 : 0xE9D3A1, { pos: [0, H / 2, 0], inkW: .02 }); b.position.y = i * H + H / 2; g.add(b); courses.push(b); }
  const roof = box(W + .5, .22, D + .5, 0xC9663C, { inkW: .02 }); roof.position.y = 3 * H + .11; g.add(roof);
  const door = box(.8, 1.5, .1, 0x7A5232, { pos: [0, .75, D / 2 + .03], inkW: .012 }); g.add(door);
  const win = [-1.05, 1.05].map(x => { const w = box(.7, .7, .1, 0x4A93D8, { pos: [x, 1.45, D / 2 + .03], inkW: .012 }); g.add(w); return w; });
  const gl = glowSp(null, 6, .5); gl.position.set(0, 1.6, D / 2 + .4); g.add(gl);
  Wd.on(t => {
    courses.forEach((b, i) => { const u = ease.out(prog(t, o.tc[i], o.tc[i] + .7)); b.visible = u > .01; b.scale.y = Math.max(.001, u); b.position.y = i * H + H * u / 2; });
    const ur = ease.out(prog(t, o.tr, o.tr + .7)); roof.visible = ur > .01; roof.position.y = 3 * H + .11 + (1 - ur) * 3.5;
    const ud = ease.out(prog(t, o.td, o.td + .6)); door.scale.setScalar(Math.max(.001, ud)); door.position.y = .75 * Math.max(.001, ud); door.visible = ud > .01;
    win.forEach((w, i) => { const u = ease.out(prog(t, o.td + .25 + i * .2, o.td + .85 + i * .2)); w.visible = u > .01; w.scale.setScalar(Math.max(.001, u)); });
    gl.visible = ud > .5; gl.material.opacity = .5 * ease.sm(prog(t, o.td + .5, o.td + 1.5));
  });
  return g;
}

// ---------- day post with a growing flag ----------
export function dayPost(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); Wd.add(g);
  g.add(cyl(.045, .06, 1.9, 0x7A5232, { pos: [0, .95, 0], inkW: .01, inkColor: INK })); g.add(ball(.07, GOLD, { pos: [0, 1.93, 0], inkW: .008, inkColor: INK }));
  const fl = box(.8, .5, .03, o.color || 0x5CAA4A, { inkW: .01, inkColor: INK }); const pv = new THREE.Group(); pv.position.set(.04, 1.7, 0); pv.add(fl); fl.position.x = .4; g.add(pv);
  Wd.on(t => { const k = lerp(.4, 1, ease.out(prog(t, o.grow, o.grow + 1.0))); pv.scale.set(k, k, 1); pv.rotation.y = .12 * Math.sin(t * 2.6 + o.pos[0]); });
  return g;
}

// ---------- room pieces ----------
// desk lamp with a glowing shade (no flame). o: pos, flick seed
export function deskLamp(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); Wd.add(g);
  g.add(cyl(.16, .2, .05, 0x3b2c22, { pos: [0, .025, 0] })); g.add(cyl(.025, .025, .55, 0x3b2c22, { pos: [0, .3, 0], ink: false }));
  const sh = new THREE.Mesh(new THREE.ConeGeometry(.24, .26, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE9A8, side: THREE.DoubleSide })); sh.position.y = .62; g.add(sh);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 8), new THREE.MeshBasicMaterial({ color: 0xFFF3C8 })); bulb.position.y = .55; g.add(bulb);
  const gl = glowSp(null, 2.2, .8); gl.position.y = .55; g.add(gl);
  Wd.on(t => { gl.material.opacity = .72 + .08 * Math.sin(t * 5 + (o.seed || 0)); });
  return g;
}
// a room shell: floor tint, back wall z=zb, side walls at +-xw, height h. Returns the group.
export function roomShell(Wd, o) {
  const g = new THREE.Group(); Wd.add(g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(o.xw * 2, o.zf - o.zb), new THREE.MeshLambertMaterial({ color: o.floor || 0xD9B27A })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, .02, (o.zf + o.zb) / 2); fl.receiveShadow = true; g.add(fl);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(o.xw * 1.1, 4.2), new THREE.MeshLambertMaterial({ color: o.rug || 0xB5513C, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); rug.rotation.x = -Math.PI / 2; rug.position.set(o.rugX || 0, .035, o.rugZ === undefined ? -1 : o.rugZ); rug.receiveShadow = true; g.add(rug);
  const back = box(o.xw * 2 + .4, o.h, .3, o.wall || 0xF3E6C8, { pos: [0, o.h / 2, o.zb], inkW: .02 }); g.add(back);
  for (const s of [-1, 1]) g.add(box(.3, o.h, o.zf - o.zb, o.wallSide || 0xE9D3A1, { pos: [s * o.xw, o.h / 2, (o.zf + o.zb) / 2], inkW: .02 }));
  g.add(box(o.xw * 2 + .4, .22, .34, 0xA4713F, { pos: [0, .11, o.zb + .02], ink: false }));
  return g;
}
// window on the back wall: frame + luminous pane (+ a soft shaft of light down to the floor)
export function windowOn(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); Wd.add(g);
  const w = o.w || 1.8, h = o.h || 1.7;
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: o.color || 0xCFEAFF, fog: false })));
  const fr = 0x8A5A34; g.add(box(w + .2, .1, .16, fr, { pos: [0, h / 2 + .05, 0], ink: false })); g.add(box(w + .2, .1, .16, fr, { pos: [0, -h / 2 - .05, 0], ink: false }));
  g.add(box(.1, h + .2, .16, fr, { pos: [-w / 2 - .05, 0, 0], ink: false })); g.add(box(.1, h + .2, .16, fr, { pos: [w / 2 + .05, 0, 0], ink: false })); g.add(box(.06, h, .12, fr, { pos: [0, 0, 0], ink: false })); g.add(box(w, .06, .12, fr, { pos: [0, 0, 0], ink: false }));
  if (o.shaft) { const s = new THREE.Mesh(new THREE.PlaneGeometry(w * .9, o.shaft), new THREE.MeshBasicMaterial({ color: o.shaftColor || 0xFFE9A8, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    s.position.set(0, -o.shaft * .45, 1.2); s.rotation.x = .75; g.add(s); }
  return g;
}

// =====================================================================================
// siach_20261023 additions: looks, light field, apple, chest (treasury), warm house, car, bed, clock, shtender, flowers
// =====================================================================================
export const RAV = { coat: '#1d1d24', skin: '#efcfb0', pants: '#15151c', hat: 'hat', hatColor: '#1a1a22', beard: '#F4F1EA', beardLen: .95 };
export const OLD = { coat: '#4a4a52', skin: '#e6bf9a', pants: '#2a2a33', hat: 'kippa', hatColor: '#2A4A8A', beard: '#8a8a86', beardLen: .75 };
export const OLD2 = Object.assign({}, OLD, { beard: '#ECE9E2', beardLen: .9 });
const COATS8 = ['#3c6aa0', '#4f8a5a', '#8a5a7a', '#a0703a', '#4a7a8a', '#6a5a9a', '#b0653a', '#3a7a6a'];
export function boyLook(i) { return { kind: 'boy', coat: COATS8[i % 8], skin: SKINS[i % 5], pants: '#1b1d24', hat: 'kippa', hatColor: i % 2 ? '#E8E0C8' : '#2A4A8A', beardLen: 0 }; }
export const col = h => new THREE.Color(h);

// ---------- light field: gold glowing spheres (ink outline) + additive halo; call begin / put / flush each frame ----------
export function lightField(Wd, N, o) {
  o = o || {}; const rad = o.r || .1, geo = new THREE.SphereGeometry(rad, 12, 8);
  const im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), N);
  const ik = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, fog: false }), N);
  im.frustumCulled = ik.frustumCulled = false; im.renderOrder = 3; ik.renderOrder = 3;
  const pg = new THREE.BufferGeometry(), pp = new Float32Array(N * 3), pc = new Float32Array(N * 3);
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
  const pm = new THREE.PointsMaterial({ map: glowTex(), size: o.glow || 1.6, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, vertexColors: true, fog: false, opacity: o.haloOp === undefined ? .55 : o.haloOp });
  const pts = new THREE.Points(pg, pm); pts.frustumCulled = false; pts.renderOrder = 4;
  Wd.add(im); Wd.add(ik); Wd.add(pts);
  const D = new THREE.Object3D(), c0 = new THREE.Color(GOLD); let n = 0;
  const L = {
    begin() { n = 0; },
    put(x, y, z, s, c) { if (n >= N || !(s > .001)) return; c = c || c0; D.position.set(x, y, z); D.rotation.set(0, 0, 0); D.scale.setScalar(s); D.updateMatrix();
      im.setMatrixAt(n, D.matrix); D.scale.setScalar(s * 1.28); D.updateMatrix(); ik.setMatrixAt(n, D.matrix); im.setColorAt(n, c);
      pp[n * 3] = x; pp[n * 3 + 1] = y; pp[n * 3 + 2] = z; pc[n * 3] = c.r * s; pc[n * 3 + 1] = c.g * s; pc[n * 3 + 2] = c.b * s; n++; },
    flush() { D.scale.setScalar(.0001); D.updateMatrix();
      for (let i = n; i < N; i++) { im.setMatrixAt(i, D.matrix); ik.setMatrixAt(i, D.matrix); im.setColorAt(i, c0); pp[i * 3] = 0; pp[i * 3 + 1] = -999; pp[i * 3 + 2] = 0; pc[i * 3] = pc[i * 3 + 1] = pc[i * 3 + 2] = 0; }
      im.instanceMatrix.needsUpdate = ik.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; pg.attributes.position.needsUpdate = pg.attributes.color.needsUpdate = true; },
    frame(fn) { Wd.on((t, cam) => { L.begin(); fn(t, cam, L); L.flush(); }); return L; },
  };
  return L;
}
// stream of lights: o {t0,t1,N,life,pos:(u,i,k)->[x,y,z], size, col}; the lights are emitted from t0 to t1 and live `life` seconds
export function stream(L, t, o) {
  const life = o.life || 3, N = o.N || 10, sz = o.size || 1;
  for (let i = 0; i < N; i++) {
    const e = o.t0 + i * life / N; if (t < e) continue;
    const k = Math.floor((t - e) / life), st = e + k * life; if (st > o.t1) continue;
    const u = (t - st) / life, p = o.pos(u, i, k); if (!p) continue;
    L.put(p[0], p[1], p[2], sz * Math.min(1, u * 7, (1 - u) * 5) * (p[3] === undefined ? 1 : p[3]), o.col);
  }
}

// ---------- apple ----------
export function appleMesh(s) {
  s = s || 1; const g = new THREE.Group();
  g.add(ball(.075 * s, 0xD8372C, { scale: [1, .92, 1], inkW: .007 * s, inkColor: INK }));
  g.add(cyl(.006 * s, .006 * s, .035 * s, 0x5a3a1a, { pos: [0, .075 * s, 0], ink: false }));
  g.add(ball(.02 * s, 0x5CAA4A, { pos: [.025 * s, .08 * s, 0], scale: [1.6, .5, 1], ink: false }));
  const gl = glowSp(null, .7 * s, 0, 0xFFD54A); gl.position.y = 0; g.add(gl); g.userData.glow = gl; return g;
}
export function holdIn(Wd, P, side, obj, pos, rot) {
  obj.visible = false; let done = false;
  Wd.on(() => { if (done || !P.figure) return; done = true; const h = P.figure.bones['hand' + side].userData.hand; h.add(obj);
    obj.position.set(...(pos || [0, -.08, .03])); if (rot) obj.rotation.set(...rot); obj.visible = true; });
}
const _v = new THREE.Vector3();
export function wpos(obj, out) { obj.updateWorldMatrix(true, false); return obj.getWorldPosition(out || _v); }
export function headPos(P, out) { if (!P.figure) return (out || _v).set(0, 1.4, 0); return wpos(P.figure.bones.head, out); }

// apples sitting in tree crowns (instanced red spheres)
export function applesOn(Wd, base, sc, seed, n) {
  const r = rng(seed), spheres = [[0, 3.1, 0, 1.45], [.85, 2.6, .3, 1], [-.75, 2.7, -.3, 1.1]];
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.1 * sc, 10, 8), toon(0xD8372C), n), D = new THREE.Object3D();
  for (let i = 0; i < n; i++) { const s = spheres[i % 3], a = r() * 6.28, b = (r() * .9 + .05) * Math.PI * .85, R = s[3] * 1.0;
    D.position.set(base[0] + (s[0] + Math.sin(b) * Math.cos(a) * R) * sc, base[1] + (s[1] + Math.cos(b) * R * .8 - .15) * sc, base[2] + (s[2] + Math.sin(b) * Math.sin(a) * R) * sc); D.updateMatrix(); im.setMatrixAt(i, D.matrix); }
  im.castShadow = true; Wd.add(im); return im;
}
export function flowers(Wd, o) {
  const r = rng(o.seed || 3), n = o.n || 40, cols = [0xE8453C, 0xFFC531, 0xF2A0C0, 0xFFFFFF, 0x8A5AC8, 0xFF8A3C];
  const hd = new THREE.InstancedMesh(new THREE.SphereGeometry(.11, 8, 6), toon(0xffffff), n), st = new THREE.InstancedMesh(new THREE.CylinderGeometry(.015, .015, .5, 5), toon(0x4c8a40), n), D = new THREE.Object3D();
  for (let i = 0; i < n; i++) { const x = lerp(o.x0, o.x1, r()), z = lerp(o.z0, o.z1, r()), h = .35 + r() * .25;
    D.position.set(x, h / 2, z); D.scale.set(1, h / .5, 1); D.updateMatrix(); st.setMatrixAt(i, D.matrix);
    D.position.set(x, h + .02, z); D.scale.set(1, .8, 1); D.updateMatrix(); hd.setMatrixAt(i, D.matrix); hd.setColorAt(i, new THREE.Color(cols[i % cols.length])); }
  Wd.add(hd); Wd.add(st);
}

// ---------- the treasury: a large closed wooden chest with gold bands floating in a warm cloud ----------
export function chest(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); g.scale.setScalar(o.scale || 1); Wd.add(g);
  const WOOD = 0x9A6A3A, BAND = 0xF2B630;
  g.add(box(3.2, 1.5, 2.0, WOOD, { pos: [0, .75, 0], inkW: .03 }));
  for (const x of [-1.2, 1.2]) g.add(box(.24, 1.56, 2.08, BAND, { pos: [x, .75, 0], inkW: .02 }));
  g.add(box(3.3, .2, 2.1, BAND, { pos: [0, .1, 0], inkW: .02 }));
  const lid = new THREE.Group(); lid.position.set(0, 1.5, -1.0); g.add(lid);
  lid.add(box(3.3, .38, 2.1, 0xA9763F, { pos: [0, .19, 1.0], inkW: .03 }));
  for (const x of [-1.2, 1.2]) lid.add(box(.26, .44, 2.16, BAND, { pos: [x, .2, 1.0], inkW: .02 }));
  lid.add(box(.42, .5, .12, BAND, { pos: [0, .0, 2.04], inkW: .02 }));
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.7), new THREE.MeshBasicMaterial({ color: 0xFFE27A, fog: false })); inner.rotation.x = -Math.PI / 2; inner.position.set(0, 1.46, 0); g.add(inner);
  const gl = glowSp(null, 9, 0, 0xFFD36A); gl.position.set(0, 1.8, 0); g.add(gl);
  const cl = []; for (let i = 0; i < 5; i++) { const c = cloud({ seed: 40 + i, size: 1.6, color: 0xFFF3DC, puffs: 5, cast: false, pos: [(i - 2) * 2.2, -.7 - (i % 2) * .3, (i % 3 - 1) * 1.2] }); g.add(c); cl.push(c); }
  const api = { g, lid, inner, gl, set(open, glow) { lid.rotation.x = -open * 1.95; inner.visible = open > .02; gl.material.opacity = Math.min(1, glow); gl.scale.setScalar(6 + 5 * glow); } };
  api.set(o.open || 0, o.glow || .25); return api;
}

// ---------- warm little house with a glowing window and a glowing doorway (front = +z) ----------
export function warmHouse(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); g.rotation.y = o.rot || 0; g.scale.setScalar(o.scale || 1); Wd.add(g);
  const W = 5, H = 3, D = 4.2;
  g.add(box(W, H, D, 0xF4DFB4, { pos: [0, H / 2, 0], inkW: .03 }));
  const tri = new THREE.Shape(); tri.moveTo(-W / 2 - .3, 0); tri.lineTo(W / 2 + .3, 0); tri.lineTo(0, 1.7);
  const rf = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: D + .5, bevelEnabled: false }), toon(0xC9663C)); rf.position.set(0, H, -D / 2 - .25); ink(rf, .03, INK); g.add(rf);
  g.add(box(.6, 1.4, .6, 0xE9D3A1, { pos: [1.4, H + 1.2, -.6], inkW: .02 }));
  const warm = new THREE.MeshBasicMaterial({ color: 0xFFD36A, fog: false });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.9), warm); door.position.set(0, .95, D / 2 + .02); g.add(door);
  g.add(box(1.4, .12, .2, 0x8A5A34, { pos: [0, 1.96, D / 2 + .05], ink: false })); for (const s of [-1, 1]) g.add(box(.12, 1.9, .2, 0x8A5A34, { pos: [s * .62, .95, D / 2 + .05], ink: false }));
  g.add(box(2.2, .15, .8, 0xC2BAA8, { pos: [0, .07, D / 2 + .5], inkW: .01 }));
  const wins = []; for (const x of [-1.7, 1.7]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), new THREE.MeshBasicMaterial({ color: 0xFFE29A, fog: false })); w.position.set(x, 1.7, D / 2 + .02); g.add(w); wins.push(w);
    g.add(box(1.1, .1, .2, 0x8A5A34, { pos: [x, 2.2, D / 2 + .05], ink: false })); g.add(box(1.1, .1, .2, 0x8A5A34, { pos: [x, 1.2, D / 2 + .05], ink: false })); g.add(box(.1, 1.1, .2, 0x8A5A34, { pos: [x - .5, 1.7, D / 2 + .05], ink: false })); g.add(box(.1, 1.1, .2, 0x8A5A34, { pos: [x + .5, 1.7, D / 2 + .05], ink: false })); }
  const gl = glowSp(null, o.glow || 6, .5, 0xFFC85A); gl.position.set(0, 1.5, D / 2 + .5); g.add(gl);
  Wd.on(t => { gl.material.opacity = .45 + .1 * Math.sin(t * 1.3 + 1); });
  return g;
}

// ---------- car (light blue rounded box car); fn(t) -> {x, z}; it drives toward -x ----------
export function carMesh(Wd, fn) {
  const g = new THREE.Group(); Wd.add(g);
  g.add(box(3.4, .75, 1.6, 0x7FB8E8, { pos: [0, .7, 0], inkW: .03 })); g.add(box(1.9, .7, 1.45, 0x8CC6F2, { pos: [.35, 1.4, 0], inkW: .03 }));
  const win = 0x2B4C7A; g.add(box(.05, .5, 1.3, win, { pos: [-.62, 1.42, 0], ink: false })); g.add(box(1.7, .46, .05, win, { pos: [.35, 1.43, .74], ink: false })); g.add(box(1.7, .46, .05, win, { pos: [.35, 1.43, -.74], ink: false }));
  g.add(box(.2, .22, 1.7, 0xF8F2E4, { pos: [-1.72, .45, 0], inkW: .01 })); g.add(box(.2, .22, 1.7, 0xF8F2E4, { pos: [1.72, .45, 0], inkW: .01 }));
  for (const z of [-.55, .55]) g.add(ball(.14, 0xFFE9A8, { pos: [-1.72, .82, z], ink: false }));
  const wh = []; for (const x of [-1.05, 1.1]) for (const z of [-.82, .82]) { const w = cyl(.34, .34, .28, 0x2a2a33, { pos: [x, .34, z], rot: [Math.PI / 2, 0, 0], inkW: .02 }); g.add(w); g.add(cyl(.16, .16, .3, 0xE8E0C8, { pos: [x, .34, z], rot: [Math.PI / 2, 0, 0], ink: false })); wh.push(w); }
  Wd.on(t => { const s = fn(t); g.position.set(s.x, 0, s.z); g.visible = s.x < 140; });
  return g;
}

// ---------- bed, alarm clock, shtender ----------
export function bed(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); Wd.add(g);
  g.add(box(1.3, .35, 2.3, 0x8A5A34, { pos: [0, .3, 0], inkW: .02 })); g.add(box(1.2, .22, 2.2, 0xFFF6E0, { pos: [0, .58, 0], inkW: .015 }));
  g.add(box(1.3, 1.0, .12, 0x8A5A34, { pos: [0, .75, -1.2], inkW: .02 })); g.add(box(.8, .14, .5, 0xFFFFFF, { pos: [0, .74, -.85], inkW: .01 }));
  g.add(box(1.22, .1, 1.2, o.blanket || 0x3C7FD8, { pos: [0, .72, .35], inkW: .01 })); return g;
}
export function alarmClock(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); Wd.add(g); const b = new THREE.Group(); b.position.y = .17; g.add(b);
  b.add(cyl(.15, .15, .1, 0xE04A3C, { rot: [Math.PI / 2, 0, 0], inkW: .01 })); b.add(cyl(.12, .12, .03, 0xFFF6E0, { pos: [0, 0, .06], rot: [Math.PI / 2, 0, 0], ink: false }));
  const h1 = box(.012, .09, .01, 0x333333, { pos: [0, .04, .085], ink: false }), h2 = box(.012, .06, .01, 0x333333, { pos: [.03, 0, .09], rot: [0, 0, -1.2], ink: false }); b.add(h1, h2);
  for (const s of [-1, 1]) b.add(ball(.05, 0xF2B630, { pos: [s * .1, .15, 0], inkW: .006 }));
  for (const s of [-1, 1]) g.add(cyl(.012, .012, .08, 0x333333, { pos: [s * .08, .04, 0], rot: [0, 0, s * .3], ink: false }));
  Wd.on(t => { const k = o.ring(t); b.rotation.z = k * .09 * Math.sin(t * 70); b.position.x = k * .008 * Math.sin(t * 55); }); return g;
}
export function shtender(Wd, o) {
  const g = new THREE.Group(); g.position.set(...o.pos); g.rotation.y = o.rot || 0; Wd.add(g);
  g.add(box(.5, .06, .5, 0x5e3a20, { pos: [0, .03, 0], inkW: .01 })); g.add(box(.12, 1.0, .12, 0x5e3a20, { pos: [0, .5, 0], inkW: .01 }));
  g.add(box(.54, .04, .5, 0x7a4a2a, { pos: [0, 1.04, 0], rot: [.42, 0, 0], inkW: .01 })); return g;
}
