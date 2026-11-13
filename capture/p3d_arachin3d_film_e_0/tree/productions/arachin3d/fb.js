// arachin3d / film_b "33 pages": portrait 1080x1920, 22.05 s, silent graphics layer.
// No people. No Hebrew in code: on-screen text = vault IDs, resolved at runtime from window.CAPTIONS_VAULT.
// Text is drawn as 3D kinetic planes (not engine captions) so glyph height can reach >= 5.5% of frame height.
import { THREE, ease, prog, clamp, lerp, rng, world } from '../../lib/stage3d.js';
import { makeBook, makeShelfRow } from './book3d.js';

const TAU = Math.PI * 2;
const out = ease.out, io = ease.io, inn = ease.in, sm = ease.sm, pg = prog;
const DT = 6;                                   // depth at which text planes sit in front of the lens

const WORLD = { skyTop: 0x040A1C, skyBottom: 0x1B3F8F, fogColor: 0x0B1B3A, fogNear: 26, fogFar: 80, hemiSky: 0xA9C8FF, hemiGround: 0x0B1B3A, hemi: 0.95, sun: 1.7, sunColor: 0xFFE2A8, sunPos: [-30, 50, 25] };

const MAT = {
  gold: new THREE.MeshPhongMaterial({ color: 0xD9A93C, specular: 0xF3D98B, shininess: 90, emissive: 0x2a1800 }),
  goldL: new THREE.MeshPhongMaterial({ color: 0xF3D98B, specular: 0xffffff, shininess: 70, emissive: 0x3a2a08 }),
  navy: new THREE.MeshPhongMaterial({ color: 0x17357a, specular: 0x6FA8FF, shininess: 35 }),
  royal: new THREE.MeshPhongMaterial({ color: 0x1F4FA8, specular: 0x9cc4ff, shininess: 45 }),
  burg: new THREE.MeshPhongMaterial({ color: 0x7A2E2A, specular: 0x553333, shininess: 25 }),
  green: new THREE.MeshPhongMaterial({ color: 0x2E6B4A, specular: 0x446655, shininess: 25 }),
  cream: new THREE.MeshPhongMaterial({ color: 0xF6F1E5, specular: 0x444444, shininess: 12 }),
  dark: new THREE.MeshPhongMaterial({ color: 0x1E3F7E, specular: 0x223355, shininess: 10 }),
  stone: new THREE.MeshPhongMaterial({ color: 0xE9E2CF, specular: 0x222222, shininess: 6 }),
  stoneOn: new THREE.MeshPhongMaterial({ color: 0xFFE7A0, emissive: 0x9A6E10, specular: 0xFFF2C0, shininess: 80 }),
  spark: new THREE.MeshBasicMaterial({ color: 0xFFE7A0 }),
};

const M = (geo, mat, p, r, s) => {
  const m = new THREE.Mesh(geo, mat);
  if (p) m.position.set(p[0], p[1], p[2]);
  if (r) m.rotation.set(r[0], r[1], r[2]);
  if (s) m.scale.set(s[0], s[1], s[2]);
  return m;
};
const BX = (w, h, d, mat, p, r) => M(new THREE.BoxGeometry(w, h, d), mat, p, r);

// the volume used in b1, b2 and b5: makeBook from book3d.js (w, h, t in scene units)
const BOOK = { w: 3.0, h: 4.2, t: 0.9 };
const LYING = -Math.PI / 2 + 0.5;               // book3d "lying on a stand" pose: pages face up and toward the lens
const LIE_Y = 3.45;                             // centre height: lowest edge rests on the stand top (2.0)

// key (warm) and fill (cool) for MeshStandardMaterial books, on top of the world hemi + sun
function lightsFor(Wd) {
  const key = new THREE.DirectionalLight(0xFFE2A8, 2.4); key.position.set(-6, 12, 8); Wd.add(key);
  const fill = new THREE.DirectionalLight(0x9CC4FF, 0.9); fill.position.set(8, 5, 10); Wd.add(fill);
}

let GLOWT = null;
function glowSprite(Wd, pos, size, opacity) {
  if (!GLOWT) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,220,140,1)'); r.addColorStop(0.35, 'rgba(255,190,80,0.45)'); r.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    GLOWT = new THREE.CanvasTexture(c); GLOWT.colorSpace = THREE.SRGBColorSpace;
  }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOWT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: opacity || 0 }));
  sp.scale.set(size, size, 1); sp.position.set(pos[0], pos[1], pos[2]); Wd.add(sp); return sp;
}

// deep navy space with drifting gold dust (same recipe as film_a)
function space(seed, n) {
  const Wd = world(WORLD);
  const rim = new THREE.DirectionalLight(0x6FA8FF, 1.6); rim.position.set(30, 20, -40); Wd.add(rim);
  const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gx = gc.getContext('2d');
  const gr = gx.createRadialGradient(128, 128, 8, 128, 128, 128);
  gr.addColorStop(0, 'rgba(70,120,230,0.6)'); gr.addColorStop(0.5, 'rgba(31,79,168,0.25)'); gr.addColorStop(1, 'rgba(4,10,28,0)');
  gx.fillStyle = gr; gx.fillRect(0, 0, 256, 256);
  const neb = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, fog: false }));
  neb.scale.set(80, 80, 1); neb.position.set(0, 2, -34); Wd.add(neb);
  const R = rng(seed), N = n || 150, arr = new Float32Array(N * 3), base = [];
  for (let i = 0; i < N; i++) base.push([(R() - 0.5) * 42, (R() - 0.5) * 28, -(R() * 26) + 4, R() * TAU, 0.15 + R() * 0.5]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xF3D98B, size: 0.1, transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
  pts.frustumCulled = false; Wd.add(pts);
  Wd.on(t => {
    for (let i = 0; i < N; i++) {
      const b = base[i]; let y = b[1] + b[4] * t * 0.8; y = ((y + 14) % 28 + 28) % 28 - 14;
      arr[i * 3] = b[0] + 0.7 * Math.sin(t * b[4] + b[3]); arr[i * 3 + 1] = y; arr[i * 3 + 2] = b[2];
    }
    geo.attributes.position.needsUpdate = true;
  });
  return Wd;
}

// text as a kinetic 3D plane placed in screen space in front of the lens (sy = 0 top .. 1 bottom)
const CAPC = {};
function capCanvas(s, fpx, color) {
  const key = s + '|' + fpx + '|' + (color || '');
  if (CAPC[key]) return CAPC[key];
  const font = `700 ${fpx}px Assistant, Heebo, Arial, sans-serif`;
  const mc = document.createElement('canvas').getContext('2d'); mc.font = font; mc.direction = 'rtl';
  const tw = mc.measureText(s).width;
  const c = document.createElement('canvas'); c.width = Math.ceil(tw + fpx * 0.8); c.height = Math.ceil(fpx * 1.5);
  const g = c.getContext('2d'); g.font = font; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = fpx * 0.16; g.strokeStyle = 'rgba(8,14,34,0.95)';
  g.strokeText(s, c.width / 2, c.height / 2);
  g.fillStyle = color || '#F6F1E5'; g.fillText(s, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return (CAPC[key] = { tex, aspect: c.width / c.height });
}
function textPlane(Wd, o) {
  const mat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.renderOrder = 20; m.visible = false; Wd.add(m);
  const qy = new THREE.Quaternion(), ax = new THREE.Vector3(0, 1, 0), fwd = new THREE.Vector3(), up = new THREE.Vector3(), q = new THREE.Quaternion(), p = new THREE.Vector3();
  let cur = null, cap = null;
  Wd.on((lt, cam) => {
    if (lt < o.t0 || lt > o.t1) { m.visible = false; return; }
    const v = window.CAPTIONS_VAULT || {};
    const s = o.num ? o.num(lt) : (Object.prototype.hasOwnProperty.call(v, o.key) ? String(v[o.key]) : null);
    if (!s) { m.visible = false; return; }
    if (s !== cur) { cur = s; cap = capCanvas(s, o.fpx || 150, o.color); mat.map = cap.tex; mat.needsUpdate = true; }
    const k = out(pg(lt, o.t0, o.t0 + 0.35));
    const visH = 2 * DT * Math.tan(cam.fov * Math.PI / 360), visW = visH * 9 / 16;
    let h = visH * (o.hf || 0.12) * (0.8 + 0.2 * k);
    if (h * cap.aspect > visW * 0.88) h = visW * 0.88 / cap.aspect;
    fwd.set(0, 0, -1).applyQuaternion(cam.quaternion); up.set(0, 1, 0).applyQuaternion(cam.quaternion);
    p.copy(cam.position).addScaledVector(fwd, DT).addScaledVector(up, (0.5 - o.sy) * visH);
    m.position.copy(p);
    q.copy(cam.quaternion).multiply(qy.setFromAxisAngle(ax, 0.6 * (1 - k)));   // 3D turn-in
    m.quaternion.copy(q);
    m.scale.set(h * cap.aspect, h, 1);
    mat.opacity = o.hold ? 1 : clamp((o.t1 - lt) / 0.25, 0, 1);
    m.visible = mat.opacity > 0;
  });
  return m;
}

// flag on a pole; the cloth is a plane whose z is displaced by t (deterministic)
function flag(parent, x, y, z, len, hgt) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  g.add(M(new THREE.CylinderGeometry(0.06, 0.06, hgt + 0.6, 8), MAT.gold, [0, (hgt + 0.6) / 2, 0]));
  const geo = new THREE.PlaneGeometry(len, hgt * 0.5, 14, 6); geo.translate(len / 2, 0, 0);
  const base = Float32Array.from(geo.attributes.position.array);
  g.add(M(geo, new THREE.MeshPhongMaterial({ color: 0x1F4FA8, specular: 0x6FA8FF, shininess: 30, side: THREE.DoubleSide }), [0, hgt * 0.8, 0]));
  return { geo, base, len };
}
function waveFlag(f, t) {
  const pos = f.geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = f.base[i * 3];
    pos.setZ(i, Math.sin(x * 2.4 - t * 6) * 0.35 * (x / f.len));
  }
  pos.needsUpdate = true;
}

// stand: dark pedestal, royal top plate, gold edge. Top surface at height h.
function stand(w, d, h) {
  const g = new THREE.Group();
  g.add(BX(w, 0.4, d, MAT.dark, [0, 0.2, 0]));
  g.add(BX(w * 0.66, h - 0.9, d * 0.66, MAT.dark, [0, 0.4 + (h - 0.9) / 2, 0]));
  g.add(BX(w, 0.22, d, MAT.royal, [0, h - 0.11, 0]));
  g.add(BX(w + 0.04, 0.05, d + 0.04, MAT.gold, [0, h + 0.015, 0]));
  return g;
}

// ---------- b1: the open volume lies tilted on a stand; last pages turn, the cover closes with a heavy thud, gold confetti ----------
export function s01() {
  const Wd = space(101, 70);
  const TH = 3.6;                                   // the cover lands here: confetti and flash start
  lightsFor(Wd);
  Wd.add(stand(7.4, 4.8, 2.0));
  const bk = makeBook(THREE, BOOK);
  bk.rotation.x = LYING; bk.position.set(0, LIE_Y, 0); Wd.add(bk);
  const glowS = glowSprite(Wd, [0, LIE_Y, 0.6], 10, 0);
  const ringM = new THREE.MeshBasicMaterial({ color: 0xD9A93C, transparent: true, opacity: 0, depthWrite: false });
  const ring = M(new THREE.TorusGeometry(1, 0.06, 8, 96), ringM, [0, 2.05, 0], [Math.PI / 2, 0, 0]); Wd.add(ring);
  const r = rng(11), bits = [];
  for (let i = 0; i < 110; i++) {
    const m = i < 80 ? BX(0.16, 0.05, 0.1, i % 3 ? MAT.goldL : MAT.gold, [0, 0, 0]) : M(new THREE.SphereGeometry(0.06, 6, 6), MAT.spark, [0, 0, 0]);
    Wd.add(m); bits.push({ m, a: r() * TAU, s: 1 + r() * 3.5, up: 3 + r() * 5, sp: 0.6 + r() * 0.8, rx: r() * 6, rz: r() * 6 });
  }
  Wd.on(t => {
    bk.setOpen(1 - io(pg(t, 2.8, 3.6)));             // cover closes under its own weight
    bk.setFlip(pg(t, 0.2, 2.6));                     // last pages turn over (only while open)
    glowS.material.opacity = 0.9 * sm(pg(t, TH - 0.3, TH)) * (1 - pg(t, TH, TH + 0.7));
    const u = pg(t, TH, TH + 1.2);
    ringM.opacity = 0.9 * (1 - u); ring.scale.setScalar(0.4 + 6 * out(u));
    const tau = t - TH;
    bits.forEach(q => {
      if (tau <= 0) { q.m.visible = false; return; }
      const x = Math.cos(q.a) * q.s * tau, z = Math.sin(q.a) * q.s * tau + 0.3, y = LIE_Y + 0.6 + q.up * tau - 4.9 * tau * tau;
      q.m.visible = y > 2.2 && tau < 3; q.m.position.set(x, y, z); q.m.rotation.set(q.rx + tau * q.sp * 8, tau * 6, q.rz);
    });
  });
  textPlane(Wd, { key: 'B_REVII', t0: 0.3, t1: 3.2, sy: 0.12, hf: 0.12 });
  textPlane(Wd, { key: 'B_SIYUM', t0: 3.4, t1: 5.3, sy: 0.88, hf: 0.12, color: '#F3D98B', hold: true });
  Wd.hero = bk;
  Wd.cam = t => {
    // wide while open (whole spread in frame), dolly in as it closes, drift back after
    const d = lerp(16.2, 9.0, io(pg(t, 2.6, 3.6))) + 0.4 * sm(pg(t, 3.6, 5.3));
    return { pos: [0, 3.0 + 0.8 * d, d], look: [0, LIE_Y, 0], fov: 40 };
  };
  return Wd;
}

// ---------- b2: a volume slides out of a shelf row, turns its cover to the lens, opens, warm light ----------
export function s02() {
  const Wd = space(202, 60);
  lightsFor(Wd);
  const ROW_Y = 2.3;                                // volumes stand on the lower plank (top at 0.2); centre = 0.2 + h/2
  const wood = new THREE.MeshStandardMaterial({ color: 0x6B4A2B, roughness: 0.75, metalness: 0.05 });
  const backM = new THREE.MeshStandardMaterial({ color: 0x0E1E3E, roughness: 0.9, metalness: 0.05 });
  Wd.add(BX(10.4, 6.0, 0.2, backM, [0, 2.6, -3.5]));
  Wd.add(BX(10.0, 0.4, 3.4, wood, [0, 0.0, -1.5]));
  Wd.add(BX(10.0, 0.4, 3.4, wood, [0, 4.8, -1.5]));
  const row = makeShelfRow(THREE, 9, { h: 4.2, t: 0.9, d: 3.0 });
  row.position.set(0, ROW_Y, 0); Wd.add(row);
  row.children[4].visible = false;                  // the slot the volume leaves (centre of the row)
  Wd.add(BX(3.8, 0.4, 3.4, MAT.royal, [0, 0.0, 2.0]));   // plinth in front, top at 0.2
  const bk = makeBook(THREE, BOOK);
  bk.position.set(0, ROW_Y, -1.5); bk.rotation.y = -Math.PI / 2; Wd.add(bk);   // spine toward the lens, as on the shelf
  Wd.on(t => {
    bk.position.z = lerp(-1.5, 2.0, io(pg(t, 0.6, 1.3)));          // slides forward out of the row
    bk.rotation.y = -Math.PI / 2 * (1 - io(pg(t, 1.3, 2.1)));      // turns the cover to the lens
    bk.setOpen(io(pg(t, 2.1, 3.0)));
    bk.setGlow(sm(pg(t, 2.5, 3.2)));
  });
  textPlane(Wd, { key: 'B_CHAMISHI', t0: 0.2, t1: 2.0, sy: 0.12, hf: 0.12 });
  textPlane(Wd, { key: 'B_HATCHALA', t0: 2.1, t1: 3.8, sy: 0.88, hf: 0.12, hold: true });
  Wd.hero = bk;
  Wd.cam = t => {
    // whole row in frame at the start, then pull in on the book
    const zc = lerp(22.9, 17.0, sm(pg(t, 0, 1.4)));
    const zt = lerp(-1.5, 2.0, io(pg(t, 0.6, 1.3)));
    return { pos: [0, 3.4, zc], look: [0, 2.6, zt], fov: 40 };
  };
  return Wd;
}

// ---------- b3: giant gold "33" slams down, punch-in, shockwave ----------
function digit3(parent, x) {
  const g = new THREE.Group(); g.position.set(x, 0, 0); parent.add(g);
  const rx = 0.36, ry = 0.75, pts = [];
  for (let i = 0; i <= 40; i++) { const a = lerp(2.55, -1.5708, i / 40); pts.push(new THREE.Vector3(Math.cos(a) * rx, 2.2 + Math.sin(a) * ry, 0)); }
  for (let i = 0; i <= 40; i++) { const a = lerp(1.5708, -2.6, i / 40); pts.push(new THREE.Vector3(Math.cos(a) * rx, 0.7 + Math.sin(a) * ry, 0)); }
  const curve = new THREE.CatmullRomCurve3(pts);
  for (let k = 0; k < 5; k++) {
    const z = (k - 2) * 0.13;
    g.add(M(new THREE.TubeGeometry(curve, 220, 0.2 - Math.abs(k - 2) * 0.012, 12, false), k % 2 ? MAT.gold : MAT.goldL, [0, 0, z]));
  }
  return g;
}
export function s03() {
  const Wd = space(303, 60);
  const root = new THREE.Group(); Wd.add(root);
  const dg = new THREE.Group(); dg.position.y = -1.45; root.add(dg);   // digits centred on y = 0
  digit3(dg, -0.42); digit3(dg, 0.42);
  const ringM = new THREE.MeshBasicMaterial({ color: 0xD9A93C, transparent: true, opacity: 0, depthWrite: false });
  const ring = M(new THREE.TorusGeometry(1, 0.07, 8, 96), ringM, [0, 0, -0.3]); Wd.add(ring);
  const key = new THREE.PointLight(0xFFE2A8, 60, 40); key.position.set(-8, 10, 10); Wd.add(key);
  const spr = glowSprite(Wd, [0, 0, -0.9], 7, 0.5);
  Wd.on(t => {
    root.position.y = 3.5 * (1 - inn(pg(t, 0, 0.6)));   // slams in from just above the top edge
    const u = pg(t, 0.6, 1.8);
    ringM.opacity = 0.85 * (1 - u); ring.scale.setScalar(1 + 3 * out(u));
    spr.material.opacity = 0.5 * (0.7 + 0.3 * Math.sin(t * 3));
  });
  textPlane(Wd, { key: 'B_33', t0: 0.2, t1: 1.3, sy: 0.12, hf: 0.12, color: '#F3D98B' });
  textPlane(Wd, { key: 'B_DAPIM', t0: 1.4, t1: 2.6, sy: 0.88, hf: 0.12 });
  Wd.hero = root;
  Wd.cam = t => {
    const push = io(pg(t, 0, 2.6)), hit = out(pg(t, 0.6, 1.1));
    const sh = Math.sin(t * 61) * 0.12 * Math.exp(-Math.max(0, t - 0.6) * 4.5);
    return { pos: [sh, 0.25, 8.2 - 0.5 * push - 0.5 * hit], look: [0, 0, 0], fov: 40 };
  };
  return Wd;
}

// ---------- b4: winding path of 33 stones climbs to a summit; bookmark hops, stones light, counter ----------
export function s04() {
  const Wd = space(404, 90);
  const N = 33, P = [];
  for (let i = 0; i <= N; i++) P.push([3.2 * Math.sin(i * 0.9), 0.3 * i, 0]);
  const pathG = new THREE.Group(); Wd.add(pathG);
  const stones = [];
  for (let i = 0; i < N; i++) {
    const g = new THREE.Group(); g.position.set(P[i][0], P[i][1], P[i][2]); pathG.add(g);
    g.add(M(new THREE.CylinderGeometry(0.8, 0.85, 0.22, 24), MAT.stone, [0, 0, 0]));
    const lit = M(new THREE.CylinderGeometry(0.82, 0.87, 0.24, 24), MAT.stoneOn, [0, 0.01, 0]); lit.visible = false; g.add(lit);
    stones.push({ lit, t: 0.2 + i * 0.13 });
  }
  const S = P[N];
  pathG.add(M(new THREE.CylinderGeometry(2.2, 2.4, 0.5, 32), MAT.stone, [S[0], S[1] - 0.25, 0]));
  const fl = flag(pathG, S[0] - 0.4, S[1] + 0.25, 0, 2.6, 2.2);
  const bm = new THREE.Group(); pathG.add(bm);
  bm.add(BX(2.0, 0.08, 0.5, MAT.goldL, [0, 0, 0]));
  Wd.add(M(new THREE.ConeGeometry(14, 10, 40), MAT.royal, [0, 5, -10]));   // hill behind the path
  const glow = glowSprite(Wd, [0, 0, 0], 4, 0);
  const key = new THREE.PointLight(0xFFE2A8, 60, 60); key.position.set(-10, 14, 6); Wd.add(key);
  // bookmark position at time t (pure function of t)
  const hop = t => {
    const s = clamp((t - 0.2) / 0.13, 0, N);
    const i0 = Math.min(N - 1, Math.floor(s)), f = s - i0, e = io(f);
    const a = P[i0], b = P[i0 + 1];
    return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) + 0.35 + 0.8 * Math.sin(Math.PI * f), 0.6];
  };
  Wd.on(t => {
    const b = hop(t);
    bm.position.set(b[0], b[1], b[2]);
    glow.position.set(b[0], b[1], b[2] + 0.4); glow.material.opacity = 0.7;
    stones.forEach(q => { q.lit.visible = t >= q.t; });
    waveFlag(fl, t);
  });
  textPlane(Wd, { num: lt => String(clamp(Math.floor((lt - 0.2) / 0.13) + 1, 1, N)), t0: 0.2, t1: 5.9, sy: 0.12, hf: 0.1, fpx: 240, color: '#F3D98B', hold: true });
  textPlane(Wd, { key: 'B_DAF', t0: 0.3, t1: 5.5, sy: 0.91, hf: 0.11 });
  Wd.hero = pathG;
  Wd.cam = t => {
    const b = hop(t), k = io(pg(t, 0, 4.9)), rise = inn(pg(t, 4.4, 5.9));
    const lx = b[0] * 0.3, ly = 6.4 + 0.3 * (b[1] - 6.4) + 2.5 * rise;
    return { pos: [lx + 0.6 * Math.sin(t * 0.7), ly + 0.6 + 0.8 * rise, 32 - 1.2 * k - 4 * rise], look: [lx, ly, 0], fov: 40 };
  };
  return Wd;
}

// ---------- b5: summit - the volume on a stand, light beam up, flag waving, orbit and settle ----------
export function s05() {
  const Wd = space(505, 120);
  lightsFor(Wd);
  Wd.add(stand(7.4, 4.8, 2.0));
  const bk = makeBook(THREE, BOOK);
  bk.rotation.x = LYING; bk.position.set(0, LIE_Y, 0); Wd.add(bk);
  bk.setOpen(1); bk.setFlip(0); bk.setGlow(0.6);
  const beamM = new THREE.MeshBasicMaterial({ color: 0xFFD27A, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  Wd.add(M(new THREE.CylinderGeometry(0.5, 2.2, 40, 28, 1, true), beamM, [0, 2.0 + 20, 0]));
  const fl = flag(Wd, -3.2, 2.05, -2.2, 2.8, 2.4);
  Wd.on(t => {
    beamM.opacity = 0.12 * sm(pg(t, 0.2, 1.0)) * (0.9 + 0.1 * Math.sin(t * 5));
    waveFlag(fl, t);
  });
  textPlane(Wd, { key: 'B_MECHAKE', t0: 0.2, t1: 2.6, sy: 0.12, hf: 0.12 });
  textPlane(Wd, { key: 'B_CTA', t0: 2.7, t1: 4.45, sy: 0.88, hf: 0.12, color: '#F3D98B', hold: true });
  Wd.hero = bk;
  Wd.cam = t => {
    const u = io(pg(t, 0, 3.4)), a = -0.7 + 0.9 * u + 0.04 * Math.sin(t * 0.8), R = lerp(15.5, 15.0, u);
    return { pos: [R * Math.sin(a), 3.0 + 0.8 * R + 0.3 * Math.sin(t * 0.9), R * Math.cos(a)], look: [0, LIE_Y, 0], fov: 40 };
  };
  return Wd;
}
