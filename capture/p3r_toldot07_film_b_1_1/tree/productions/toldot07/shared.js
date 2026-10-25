// shared.js - toldot07 shared module (built once by the first builder; others only APPEND).
// Import:  import { PAL, BOY, RAV, boy, rav, seaWorld, sunDir, mkShot, vlabel, goldLine, fly, ring, sm, talkF, face, V3 } from './shared.js';
//
// PAL                      palette numbers from the brief (hex ints): seaShallow seaDeep foam sand skyTop skyBottom red gold ink sun
// INK_W                    outline width 0.03 m
// BOY, RAV                 look constants (BOY = student, RAV = teacher with grey beard + glasses)
// boy(Wd, fn, o)           person wrapper, scale .72 (o.scale overrides). fn(t) -> {pos,facing,gesture,talk,...} as person()
// rav(Wd, fn, o)           same for the teacher, scale 1
// seaWorld(o)              world() with the series light: warm sun from the west (28 deg), sky #7fcdf3 -> #fff1cf, fog, sun glow sprite that follows
//                          the camera. o: {elev, az, target:[x,y,z], shadowExt, fogNear, fogFar, sun, hemi}. Returns Wd; Wd.sunDir = [x,y,z] (towards the sun).
// sunDir(elev=28, az=12)   unit vector towards the sun (west = -x)
// mkShot(dur, caps, capAt, build)   -> engine shot object
// vlabel(Wd, id, o)        vault label (LBL_B_xx) resolved lazily. o: {pos:[x,y,z] | fn(t)->[x,y,z], height, show:t=>0..1, color, bg}
// goldLine(Wd, {pos:[x,z], y0, y1, dash, gap, r})   gold dashed vertical line (static); returns the group
// fly(keys)                camera through points: keys [[t,[pos],[look],fov?],...] (smooth, slows only at both ends)
// ring(c, r, h, a0, a1, t0, t1, n, f0, f1)   keys on a circle around c, to spread inside fly()
// sm(t,a,b) smoothstep progress; talkF(t) talk wobble; face(a,b) yaw from a to b; V3
// Camera re-exports: path orbit seq dolly crane pushIn camShake follow tween shake bob
import { THREE, world, person, label, canvasTex, ease, prog, clamp, lerp, D } from '../../lib/stage3d.js';
export { path, orbit, seq } from '../../lib/stage3d.js';
export { dolly, crane, pushIn, camShake, follow, tween, shake, bob } from '../../lib/motion3d.js';
export { THREE };

export const PAL = { seaShallow: 0x52c0e0, seaDeep: 0x1f78b4, foam: 0xffffff, sand: 0xf0d9a8, skyTop: 0x7fcdf3, skyBottom: 0xfff1cf, red: 0xe5473c, gold: 0xf2c14e, ink: 0x1c2b3a, sun: 0xffe2a6 };
export const INK_W = 0.03;
export const BOY = { kind: 'boy', coat: '#2b3a5a', hat: 'kippa', hatColor: '#101014', beardLen: 0, skin: '#f0d2b4', pants: '#1b1d24' };
export const RAV = { coat: '#1d1d24', beard: '#8a8a86', beardLen: .6, hat: 'hat', skin: '#efcfb0', glasses: true };
export const boy = (Wd, fn, o) => person(Wd, BOY, fn, Object.assign({ scale: .72 }, o));
export const rav = (Wd, fn, o) => person(Wd, RAV, fn, Object.assign({ scale: 1 }, o));

export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const sm = (t, a, b) => ease.sm(prog(t, a, b));
export const talkF = t => .5 + .5 * Math.sin(t * 9);
export const face = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]);

export function sunDir(elev, az) {
  const e = (elev === undefined ? 28 : elev) * D, a = (az === undefined ? 12 : az) * D;
  return [-Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a)];
}
let GLOW = null;
const glowTex = () => GLOW || (GLOW = canvasTex(256, 256, (g, w, h) => { const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(255,255,235,1)'); r.addColorStop(.07, 'rgba(255,244,200,.95)'); r.addColorStop(.2, 'rgba(255,226,160,.4)'); r.addColorStop(.55, 'rgba(255,214,140,.1)'); r.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }));

export function seaWorld(o) {
  o = o || {}; const d = sunDir(o.elev, o.az), tg = o.target || [0, 0, 0];
  const Wd = world({ skyTop: PAL.skyTop, skyBottom: PAL.skyBottom, fogColor: PAL.skyBottom, fogNear: o.fogNear || 40, fogFar: o.fogFar || 340,
    sun: o.sun === undefined ? 2.1 : o.sun, sunColor: PAL.sun, sunPos: [tg[0] + d[0] * 80, tg[1] + d[1] * 80, tg[2] + d[2] * 80],
    hemi: o.hemi === undefined ? 1.15 : o.hemi, hemiSky: 0xfff6e0, hemiGround: 0x86bccf, shadowExt: o.shadowExt || 16, skyR: 900 });
  Wd.sun.target.position.set(...tg);
  Wd.sunDir = d;
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, opacity: o.glow === undefined ? .95 : o.glow }));
  gl.scale.set(420, 420, 1); gl.renderOrder = -5; Wd.add(gl);
  Wd.on((t, cam) => { Wd.sky.position.copy(cam.position); gl.position.copy(cam.position).addScaledVector(V3(d[0], d[1], d[2]), 700); });
  return Wd;
}

export const mkShot = (dur, caps, capAt, build) => ({ dur, caps, capAt, build });

// vault label, created on the first frame (the vault loads after build()).
export function vlabel(Wd, id, o) {
  o = o || {}; let sp = null, base = null;
  Wd.on(t => {
    const V = window.CAPTIONS_VAULT; if (!sp) { if (!V || !Object.prototype.hasOwnProperty.call(V, id)) return;
      sp = label(Wd, String(V[id]), { height: o.height || .3, color: o.color || '#ffe9a8', bg: o.bg || 'rgba(28,43,58,.88)', size: o.size || 72 }); base = sp.scale.clone(); }
    const k = o.show ? o.show(t) : 1, p = typeof o.pos === 'function' ? o.pos(t) : o.pos;
    sp.visible = k > .01; sp.scale.set(base.x * Math.max(k, .001), base.y * Math.max(k, .001), 1); if (p) sp.position.set(p[0], p[1] + .08 * ease.out(clamp(k, 0, 1)), p[2]);
  });
}

export function goldLine(Wd, o) {
  const g = new THREE.Group(), d = o.dash || .12, gap = o.gap || .07, r = o.r || .008, mat = new THREE.MeshBasicMaterial({ color: PAL.gold, fog: false });
  for (let y = o.y0; y < o.y1 - 1e-6; y += d + gap) { const h = Math.min(d, o.y1 - y), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 6), mat); m.position.set(0, y + h / 2, 0); g.add(m); }
  g.position.set(o.pos[0], 0, o.pos[1]); Wd.add(g); return g;
}

export function fly(keys) {
  const P = new THREE.CatmullRomCurve3(keys.map(k => V3(...k[1])), false, 'centripetal');
  const L = new THREE.CatmullRomCurve3(keys.map(k => V3(...k[2])), false, 'centripetal');
  const T = keys.map(k => k[0]), n = keys.length - 1, m = [0];
  for (let i = 1; i < n; i++) { const d0 = 1 / (T[i] - T[i - 1]), d1 = 1 / (T[i + 1] - T[i]); m.push(2 * d0 * d1 / (d0 + d1)); }
  m.push(0);
  const U = t => { if (t <= T[0]) return 0; if (t >= T[n]) return n; let i = 0; while (t > T[i + 1]) i++;
    const h = T[i + 1] - T[i], s = (t - T[i]) / h, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * i + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * (i + 1) + (s3 - s2) * h * m[i + 1]; };
  return t => { const u = clamp(U(t), 0, n), i = Math.min(n - 1, Math.floor(u)), w = u - i, f0 = keys[i][3] || 45, f1 = keys[i + 1][3] || f0;
    return { pos: P.getPoint(u / n).toArray(), look: L.getPoint(u / n).toArray(), fov: lerp(f0, f1, w) }; };
}
export function ring(c, r, h, a0, a1, t0, t1, n, f0, f1) {
  const R = Array.isArray(r) ? r : [r, r], H = Array.isArray(h) ? h : [h, h], K = [];
  for (let i = 0; i <= n; i++) { const u = i / n, a = lerp(a0, a1, u) * D, rr = lerp(R[0], R[1], u);
    K.push([lerp(t0, t1, u), [c[0] + Math.sin(a) * rr, c[1] + lerp(H[0], H[1], u), c[2] + Math.cos(a) * rr], c, lerp(f0, f1 === undefined ? f0 : f1, u)]); }
  return K;
}
