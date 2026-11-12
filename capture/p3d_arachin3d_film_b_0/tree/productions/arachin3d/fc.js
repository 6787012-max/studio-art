// arachin3d / film_c scene builder. Objects only, no people. No Hebrew in this file.
// Every on-screen string is a vault ID; the text is read at runtime from window.CAPTIONS_VAULT.
import { world, box, cyl, mesh, toon, canvasTex, path, prog, ease, lerp, rng, THREE } from '../../lib/stage3d.js';

const Q = new URLSearchParams(location.search);
export const LAND = Q.get('fmt') === 'land';
export const W = LAND ? 1920 : 1080;
export const H = LAND ? 1080 : 1920;

const DEG = Math.PI / 180, TAU = Math.PI * 2;
const GOLD = 0xD9A93C, GOLD_L = 0xF3D98B, CREAM = 0xF6F1E5, NAVY = 0x0B1B3A, BLUE = 0x1F4FA8;

// gold: metal look (brief: metalness .9, roughness .25) with a warm emissive so it never reads as mud
const goldM = new THREE.MeshStandardMaterial({ color: GOLD, metalness: .9, roughness: .25, emissive: 0x3a2404, emissiveIntensity: .35 });
const glassM = new THREE.MeshStandardMaterial({ color: 0xBFE0FF, transparent: true, opacity: .32, roughness: .05, metalness: 0, depthWrite: false });
const gold = (geo, o) => mesh(geo, goldM, Object.assign({ ink: false }, o || {}));

// soft additive halo (sprite) placed just behind gold objects; texture built once, deterministic
let HALO = null;
function halo(parent, pos, size, op) {
  HALO = HALO || canvasTex(256, 256, g => { const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(255,236,190,1)'); r.addColorStop(.35, 'rgba(243,217,139,.45)'); r.addColorStop(1, 'rgba(243,217,139,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: HALO, blending: THREE.AdditiveBlending, transparent: true, opacity: op, depthWrite: false }));
  s.position.set(pos[0], pos[1], pos[2]); s.scale.setScalar(size); parent.add(s); return s;
}
// one light sweep across the gold per shot: a warm point light crosses x0 -> x1 between t0 and t1 (glint, fades in and out)
function sweep(Wd, x0, x1, y, z, t0, t1) {
  const L = new THREE.PointLight(0xFFF1C9, 0, 16, 1.2); Wd.scene.add(L);
  return t => { const p = prog(t, t0, t1); L.position.set(lerp(x0, x1, p), y, z); L.intensity = 45 * Math.sin(Math.PI * p); };
}

function scene(o) {
  o = o || {};
  const Wd = world({
    ground: o.ground || null, groundSize: 300, skyTop: NAVY, skyBottom: BLUE, fogColor: NAVY,
    fogNear: o.fogNear || 30, fogFar: o.fogFar || 130,
    sun: 1.35, sunColor: 0xFFE2A8, sunPos: [-30, 50, 25], hemi: .85, hemiSky: 0xbcd6ff, hemiGround: 0x1a2a4a,
  });
  Wd.sun.castShadow = false;   // warm key from upper left is the sun; no shadow maps (CPU/GPU budget)
  const rim = new THREE.DirectionalLight(0x6FA8FF, 1.1); rim.position.set(40, 20, -30); Wd.scene.add(rim);
  return Wd;
}

// deterministic floating particles (dust / stars); returns an updater
function dust(Wd, n, sx, sy, sz, seed, color, size, y0) {
  const r = rng(seed), a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = (r() - .5) * sx; a[i * 3 + 1] = (y0 || 0) + r() * sy; a[i * 3 + 2] = (r() - .5) * sz; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity: .85, depthWrite: false }));
  Wd.add(p);
  return t => { p.rotation.y = t * .07; p.position.y = .6 * Math.sin(t * .6 + seed); };
}

function drawLabel(g, s, o) {
  if (o.plate) {
    g.fillStyle = 'rgba(11,27,58,.82)'; g.beginPath(); g.roundRect(12, 24, 1000, 208, 56); g.fill();
    g.strokeStyle = '#D9A93C'; g.lineWidth = 10; g.stroke();
  }
  g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let px = o.px || 170; g.font = '700 ' + px + 'px Assistant, Heebo, sans-serif';
  const tw = g.measureText(s).width;
  if (tw > 920) { px = Math.floor(px * 920 / tw); g.font = '700 ' + px + 'px Assistant, Heebo, sans-serif'; }
  g.lineJoin = 'round'; g.lineWidth = px * .16; g.strokeStyle = 'rgba(11,27,58,.9)'; g.strokeText(s, 512, 130);
  g.fillStyle = o.color || '#F6F1E5'; g.fillText(s, 512, 130);
}

// Text billboard. Texture is drawn lazily from the vault (the vault loads after build()).
// o.at = [x,y,z] world anchor + o.h (world height); otherwise screen anchor: o.ny (fraction of frame height,
// up = +), o.hf (text height as fraction of frame height). o.t0/o.t1 = window in shot time. o.plate = navy box.
function label(Wd, key, o) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false, opacity: 0 }));
  m.renderOrder = 50; m.visible = false; Wd.add(m);
  let built = false;
  const P = new THREE.Vector3(), F = new THREE.Vector3(), U = new THREE.Vector3(), R = new THREE.Vector3(), V = new THREE.Vector3();
  return (t, cam) => {
    const k = (t < o.t0 || t > o.t1) ? 0 : (1 - ease.sm(prog(t, o.t1 - .3, o.t1)));   // full cream at entry; the entrance is the size punch (0.8 -> 1, 0.35 s)
    if (k <= .001) { m.visible = false; return; }
    if (!built) {
      const VT = window.CAPTIONS_VAULT;
      if (!VT || !Object.prototype.hasOwnProperty.call(VT, key)) { m.visible = false; return; }
      const str = String(VT[key]);
      m.material.map = canvasTex(1024, 256, g => drawLabel(g, str, o));
      m.material.needsUpdate = true; built = true;
    }
    const q = cam.quaternion, pun = .8 + .2 * ease.out(prog(t, o.t0, o.t0 + .35));
    let s, c;
    if (o.at) { s = o.h * pun; c = V.set(o.at[0], o.at[1], o.at[2]); }
    else {
      const visH = 4 * Math.tan(cam.fov * DEG / 2);   // frustum height at distance 2
      s = o.hf * visH * pun;
      c = P.copy(cam.position)
        .addScaledVector(F.set(0, 0, -1).applyQuaternion(q), 2)
        .addScaledVector(U.set(0, 1, 0).applyQuaternion(q), o.ny * visH)
        .addScaledVector(R.set(1, 0, 0).applyQuaternion(q), (o.nx || 0) * visH * cam.aspect);
    }
    m.position.copy(c); m.quaternion.copy(q); m.scale.set(s, s, 1);
    m.material.opacity = k; m.visible = true;
  };
}

// clock: big gold-rimmed wall clock; hands are pivots so they can sweep and stop
function clock(parent, pos, r) {
  const G = new THREE.Group(); G.position.set(pos[0], pos[1], pos[2]); parent.add(G);
  G.add(mesh(new THREE.CylinderGeometry(r, r, .22, 48), toon(CREAM), { rot: [Math.PI / 2, 0, 0] }));
  G.add(gold(new THREE.TorusGeometry(r + .14, .16, 16, 64), { pos: [0, 0, .06] }));
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * DEG;
    G.add(box(.12, i % 3 ? .2 : .34, .06, 0x1b2a4e, { pos: [Math.sin(a) * r * .8, Math.cos(a) * r * .8, .13], rot: [0, 0, -a], ink: false }));
  }
  const hourP = new THREE.Group(), minP = new THREE.Group();
  hourP.position.z = minP.position.z = .16; G.add(hourP, minP);
  hourP.add(box(.22, r * .5, .1, NAVY, { pos: [0, r * .25, 0], ink: false }));
  minP.add(box(.14, r * .82, .08, NAVY, { pos: [0, r * .41, 0], ink: false }));
  G.add(gold(new THREE.SphereGeometry(.16, 16, 12), { pos: [0, 0, .2] }));
  return { G, hourP, minP };
}
// hands unwind from 9 turns to the target time at t1 (fast sweep, then a slow stop)
function setClock(c, t, hDeg, mDeg, t1) {
  const spin = TAU * 9 * (1 - ease.out(prog(t, 0, t1)));
  c.hourP.rotation.z = -(hDeg * DEG + spin / 12);
  c.minP.rotation.z = -(mDeg * DEG + spin);
}

// ---------- c1 (0-6.2 s): tall double doors, light floods out, camera flies through ----------
function s1() {
  const Wd = scene({ ground: 'dark', fogNear: 20, fogFar: 95 });
  for (const x of [-7, 7]) for (const z of [-1, -10, -19, -28]) {
    Wd.add(cyl(.7, .8, 18, 0x16315f, { pos: [x, 9, z] }));
    Wd.add(gold(new THREE.CylinderGeometry(1, 1, .5, 32), { pos: [x, .25, z] }));
  }
  const door = new THREE.Group(); door.position.set(0, .14, -4); Wd.add(door); Wd.hero = door;
  const LP = new THREE.Group(), RP = new THREE.Group();
  LP.position.set(-2.3, 0, 0); RP.position.set(2.3, 0, 0); door.add(LP, RP);
  const leaf = (P, s) => {
    P.add(mesh(new THREE.BoxGeometry(2.3, 7.8, .3), toon(BLUE), { pos: [s * 1.15, 3.9, 0] }));
    P.add(gold(new THREE.BoxGeometry(1.7, 6.9, .05), { pos: [s * 1.15, 3.9, .18] }));
    P.add(gold(new THREE.SphereGeometry(.12, 14, 10), { pos: [s * 1.95, 3.7, .26] }));
  };
  leaf(LP, 1); leaf(RP, -1);
  door.add(gold(new THREE.BoxGeometry(.22, 8.1, .42), { pos: [-2.5, 4.05, 0] }));
  door.add(gold(new THREE.BoxGeometry(.22, 8.1, .42), { pos: [2.5, 4.05, 0] }));
  door.add(gold(new THREE.BoxGeometry(5.2, .22, .42), { pos: [0, 8.05, 0] }));

  // light behind the doors: radial gradient (not a flat colour, so the frame never reads as one colour)
  const gT = canvasTex(512, 512, (g, w, h) => {
    const r = g.createRadialGradient(256, 256, 8, 256, 256, 256);
    r.addColorStop(0, 'rgba(255,246,220,1)'); r.addColorStop(.3, 'rgba(243,217,139,.95)');
    r.addColorStop(.7, 'rgba(217,169,60,.35)'); r.addColorStop(1, 'rgba(11,27,58,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  const GL = new THREE.Mesh(new THREE.PlaneGeometry(17, 23), new THREE.MeshBasicMaterial({ map: gT, transparent: true, opacity: 0, depthWrite: false }));
  GL.position.set(0, 4, -14); Wd.add(GL);
  const PL = new THREE.PointLight(0xFFD27A, 0, 60, 1.4); PL.position.set(0, 4, -6); Wd.scene.add(PL);
  // gold line of light under the closed doors
  const LN = new THREE.Mesh(new THREE.BoxGeometry(4.8, .12, .12), new THREE.MeshBasicMaterial({ color: GOLD_L, transparent: true, opacity: 1, depthWrite: false }));
  LN.position.set(0, .08, -3.9); Wd.add(LN);
  const DU = dust(Wd, 150, 18, 16, 30, 11, GOLD_L, .09, -2);
  const L1 = label(Wd, 'C_HIZDAMNUT', { ny: .3, hf: .12, px: 185, t0: .5, t1: 4.7 });   // letters ~6% of frame height; gone fully by 4.7 s
  const SW1 = sweep(Wd, -9, 9, 5, -2, 1.0, 5.6);
  // a real wall with a doorway (x -2.6..2.6, y 0..8.1) at z -4.4: the camera flies through the opening
  const WALL = 0x102a52;
  Wd.add(box(18, 26, .5, WALL, { pos: [-11.6, 5, -4.4], ink: false }));
  Wd.add(box(18, 26, .5, WALL, { pos: [11.6, 5, -4.4], ink: false }));
  Wd.add(box(5.2, 12, .5, WALL, { pos: [0, 14.1, -4.4], ink: false }));
  // volumetric light: three faint additive cones leave the doorway toward the lens (opacity follows the doors)
  const CONES = [[2.6, 9.5, .10], [2.0, 7.4, .07], [1.4, 5.2, .05]].map(([rb, rt, o0]) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, 16, 32, 1, true), new THREE.MeshBasicMaterial({ color: GOLD_L, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = Math.PI / 2; m.position.set(0, 4.05, 3.9); Wd.add(m); return [m, o0];
  });

  // the two c2 clocks are already visible far down the hall and grow toward the lens from 4.0 s (no empty frame before the cut)
  const FAR = new THREE.Group(); FAR.position.set(0, 2.6, -34); FAR.visible = false; Wd.add(FAR);
  const fA = clock(FAR, [0, 2.42, 0], 1.3), fB = clock(FAR, [0, -2.42, -1.5], 1.3);
  halo(fA.G, [0, 0, -.5], 6.0, .55); halo(fB.G, [0, 0, -.5], 6.0, .55);
  Wd.on((t, cam) => {
    FAR.visible = t >= 3.9; FAR.scale.setScalar(.12 + .88 * ease.out(prog(t, 4.0, 5.6))); FAR.position.z = lerp(-34, -26, prog(t, 4.0, 6.2));
    setClock(fA, t, 217.5, 90, 1.8); setClock(fB, t, 255, 180, 2.2);
    const op = ease.io(prog(t, 2.0, 4.2));
    LP.rotation.y = op * 1.35; RP.rotation.y = -op * 1.35;   // leaves swing away from the lens
    const dim = 1 - ease.sm(prog(t, 4.6, 5.4));   // glow fades out early; the far clocks take over the frame, so the cut into c2 is never empty
    PL.intensity = 34 * op * dim; GL.material.opacity = op * dim; LN.material.opacity = 1 - .85 * op;
    CONES.forEach(([m, o0], i) => { m.material.opacity = o0 * op * dim * (.9 + .1 * Math.sin(t * 2.7 + i)); });
    SW1(t);
    DU(t); L1(t, cam);
  });
  return Object.assign(Wd, { cam: path([
    [0, [0, 3.3, 20], [0, 3.6, -4], 46],
    [3.2, [0, 3.4, 11], [0, 3.8, -4], 46],
    [5.0, [0, 3.5, -1.5], [0, 3.8, -12], 48],
    [6.2, [0, 3.6, -6], [0, 3.9, -14], 50],
  ]) });
}

// ---------- c2 (6.2-12.3 s): two gold-rimmed clocks, hands sweep and stop at 7:15 and 8:30 ----------
function s2() {
  const Wd = scene({ fogNear: 25, fogFar: 110 });
  const pair = new THREE.Group(); Wd.add(pair); Wd.hero = pair;   // hero = both clocks (union box)
  // stacked vertically: 7:15 clock on top, its plate directly under it, then 8:30 clock with its plate under it
  const c1 = clock(pair, [0, 5.0, 0], 1.3), c2 = clock(pair, [0, .16, -1.5], 1.3);
  halo(c1.G, [0, 0, -.5], 6.0, .55); halo(c2.G, [0, 0, -.5], 6.0, .55);
  const L1 = label(Wd, 'C_SHNEI', { ny: .44, hf: .09, t0: 0, t1: 5.85 });   // header above the stack, clear of the top clock
  const T1 = label(Wd, 'C_T1', { at: [0, 2.9, .6], h: 1.1, t0: 2.0, t1: 99, plate: true });
  const T2 = label(Wd, 'C_T2', { at: [0, -1.9, -.9], h: 1.1, t0: 2.6, t1: 99, plate: true });
  const DU = dust(Wd, 110, 20, 14, 24, 22, GOLD_L, .08, -2);
  const SW2 = sweep(Wd, -6, 6, 5, 4, .6, 5.2);
  Wd.on((t, cam) => {
    setClock(c1, t, 217.5, 90, 1.8);     // 7:15
    setClock(c2, t, 255, 180, 2.2);      // 8:30
    SW2(t); DU(t); L1(t, cam); T1(t, cam); T2(t, cam);
  });
  return Object.assign(Wd, { cam: path([
    [0, [-3.2, 2.6, 14], [0, 2.0, 0], 46],
    [3.0, [2.6, 2.3, 13.6], [0, 2.0, 0], 46],
    [6.1, [-1.2, 2.2, 14], [0, 2.0, 0], 45],
  ]) });
}

// ---------- c3 (12.3-14.6 s): night sky, moon rises over a lit study hall (building only) ----------
function s3() {
  const Wd = scene({ fogNear: 45, fogFar: 180 });
  // stars: fixed cream field far behind the building (deterministic)
  const sr = rng(33), SA = new Float32Array(260 * 3);
  for (let i = 0; i < 260; i++) { SA[i * 3] = (sr() - .5) * 90; SA[i * 3 + 1] = -4 + sr() * 40; SA[i * 3 + 2] = -34 - sr() * 22; }
  const SG = new THREE.BufferGeometry(); SG.setAttribute('position', new THREE.BufferAttribute(SA, 3));
  Wd.add(new THREE.Points(SG, new THREE.PointsMaterial({ color: 0xF6F1E5, size: .24, transparent: true, opacity: .9, depthWrite: false })));
  const B = new THREE.Group(); B.position.set(0, 0, -10); B.scale.setScalar(.75); Wd.add(B); Wd.hero = B;
  // block, cornice, dome with gold rim, finial with halo
  B.add(box(12, 6.6, 5, 0x2b4f94, { pos: [0, 3.3, 0] }));
  B.add(box(12.6, .4, 1.6, 0x1f4fa8, { pos: [0, 6.6, 1.9] }));
  B.add(mesh(new THREE.SphereGeometry(3.4, 32, 16, 0, TAU, 0, Math.PI / 2), toon(0x2b4f94), { pos: [0, 6.6, 0], ink: false }));
  B.add(gold(new THREE.TorusGeometry(3.4, .12, 12, 48), { pos: [0, 6.62, 0], rot: [Math.PI / 2, 0, 0] }));
  B.add(gold(new THREE.SphereGeometry(.42, 16, 12), { pos: [0, 10.1, 0] }));
  B.add(gold(new THREE.CylinderGeometry(.06, .06, 1.2, 8), { pos: [0, 9.5, 0] }));
  halo(B, [0, 10.1, -.5], 3.2, .55);
  // portico: six columns on bases with capitals and a lintel; three steps up to the door
  for (const x of [-4.8, -2.88, -.96, .96, 2.88, 4.8]) {
    B.add(cyl(.3, .3, 5.6, CREAM, { pos: [x, 3.4, 3.2], ink: false }));
    B.add(box(.8, .22, .8, CREAM, { pos: [x, .71, 3.2] }));
    B.add(box(.8, .22, .8, CREAM, { pos: [x, 6.3, 3.2] }));
  }
  B.add(box(12.3, .4, .8, CREAM, { pos: [0, 6.5, 3.2] }));
  B.add(box(13.4, .3, 2.0, CREAM, { pos: [0, .15, 4.2] }));
  B.add(box(12.6, .3, 1.4, CREAM, { pos: [0, .45, 3.7] }));
  // lit windows set in navy frames, and a gold-framed doorway with warm light
  for (const x of [-3.84, -1.92, 1.92, 3.84]) for (const y of [2.0, 4.4]) {
    B.add(box(.95, 1.45, .1, NAVY, { pos: [x, y, 2.52], ink: false }));
    const w = new THREE.Mesh(new THREE.BoxGeometry(.75, 1.25, .12), new THREE.MeshBasicMaterial({ color: 0xFFC766 }));
    w.position.set(x, y, 2.6); B.add(w);
  }
  B.add(gold(new THREE.BoxGeometry(1.5, 2.8, .12), { pos: [0, 1.5, 2.56], ink: false }));
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.3, .12), new THREE.MeshBasicMaterial({ color: 0xFFD27A })); door.position.set(0, 1.4, 2.66); B.add(door);
  // lights: warm spill on the facade, moon key, one gold glint sweep
  const FL = new THREE.PointLight(0xFFC766, 9, 22, 1.5); FL.position.set(0, 2.5, 7); Wd.scene.add(FL);
  const moon = new THREE.Group(); Wd.add(moon);
  moon.add(mesh(new THREE.SphereGeometry(2.2, 32, 20), toon(GOLD_L), { ink: false }));
  moon.add(mesh(new THREE.SphereGeometry(2.0, 32, 20), toon(NAVY), { pos: [.95, .55, 1.2], ink: false }));   // crescent mask
  const PL = new THREE.PointLight(0xFFD27A, 14, 40, 1.6); PL.position.set(-4, 8, -12); Wd.scene.add(PL);
  const SW3 = sweep(Wd, -8, 8, 6, 6, .3, 2.1);
  const L1 = label(Wd, 'C_ARVIT', { ny: -.28, hf: .09, t0: 0, t1: 1.98, plate: true });
  Wd.on((t, cam) => {
    moon.position.set(4.6, lerp(-2, 13, ease.out(prog(t, 0, 2.3))), -26);   // rises clear above the dome
    SW3(t); L1(t, cam);
  });
  // camera rises slowly over the 2.3 s
  return Object.assign(Wd, { cam: path([
    [0, [0, -2.6, 15], [0, 3.0, -10], 46],
    [2.3, [0, 1.2, 14.5], [0, 7.2, -10], 46],
  ]) });
}

// ---------- c4 (14.6-19.2 s): weekly calendar grid; gold clock stamps each day, row locks with a gold pin ----------
function s4() {
  const Wd = scene({ fogNear: 30, fogFar: 120 });
  const cal = new THREE.Group(); cal.position.set(0, .9, 0); Wd.add(cal); Wd.hero = cal;
  for (const x of [-4.2, 4.2]) cal.add(gold(new THREE.CylinderGeometry(.12, .12, 6, 14), { pos: [x, 2.1, -.2] }));   // binder posts (frame)
  cal.add(gold(new THREE.BoxGeometry(8.6, .16, .16), { pos: [0, 5.1, -.2] }));
  const X = i => (i - 3) * 1.12, ROWY = [2.36, 1.18, 0];
  const tiles = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) {
    const g = new THREE.Group(); g.position.set(X(c), ROWY[r], 0); cal.add(g);
    g.add(box(1.0, 1.0, .3, CREAM, { pos: [0, 0, 0] }));
    g.add(box(1.02, .24, .32, BLUE, { pos: [0, .38, 0] }));
    if (r === 1) {   // the stamped week row
      const tok = new THREE.Group(); tok.position.set(0, -.05, .3); tok.scale.setScalar(.001); g.add(tok);
      tok.add(gold(new THREE.CylinderGeometry(.34, .34, .1, 32), { rot: [Math.PI / 2, 0, 0] }));
      tok.add(box(.05, .24, .05, NAVY, { pos: [0, .09, .06], ink: false }));
      const ring = new THREE.Mesh(new THREE.RingGeometry(.5, .6, 40), new THREE.MeshBasicMaterial({ color: GOLD_L, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      ring.position.z = .18; g.add(ring);
      halo(tok, [0, 0, -.05], 1.7, .45);
      tiles.push({ g, tok, ring, ts: .5 + c * .42 });
    }
  }
  const pin = gold(new THREE.BoxGeometry(7.9, .14, .14), { pos: [0, 1.73, .22] }); cal.add(pin);
  const PL = new THREE.PointLight(0xFFD27A, 10, 30, 1.5); PL.position.set(0, 2.5, 6); Wd.scene.add(PL);
  const DU = dust(Wd, 120, 24, 14, 20, 41, GOLD_L, .08, -4);
  const L1 = label(Wd, 'C_KAVUA', { ny: .3, hf: .09, t0: 0, t1: 4.3 });
  const SW4 = sweep(Wd, -8, 8, 3, 6, .4, 4.0);
  Wd.on((t, cam) => {
    for (const s of tiles) {
      const dt = t - s.ts;
      s.g.position.z = dt >= 0 ? -.16 * Math.exp(-dt * 8) : 0;                  // thump on stamp
      s.tok.scale.setScalar(Math.max(.001, ease.out(prog(t, s.ts, s.ts + .3))));
      s.ring.scale.setScalar(1 + 3 * prog(t, s.ts, s.ts + .7));                  // ripple
      s.ring.material.opacity = dt >= 0 ? .9 * (1 - prog(t, s.ts, s.ts + .7)) : 0;
    }
    pin.visible = t > 3.5; pin.position.y = lerp(4.5, 1.73, ease.in(prog(t, 3.5, 4.2)));
    SW4(t); DU(t); L1(t, cam);
  });
  return Object.assign(Wd, { cam: path([
    [0, [-1.6, 2.6, 19.5], [0, 2.4, 0], 45],
    [4.6, [1.6, 2.3, 18.5], [0, 2.4, 0], 45],
  ]) });
}

// ---------- c5 (19.2-25.49 s): hourglass flips with weight; two beats of text; end card holds ----------
function s5() {
  const Wd = scene({ fogNear: 30, fogFar: 120 });
  const HG = new THREE.Group(); HG.position.set(0, 2.9, 0); Wd.add(HG); Wd.hero = HG;
  halo(HG, [0, 0, -.6], 6.4, .5);
  const SW5 = sweep(Wd, -7, 7, 4, 3, .2, 5.5);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.5, .16, 2.4, 40), glassM); top.position.y = 1.2; HG.add(top);
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(.16, 1.5, 2.4, 40), glassM); bot.position.y = -1.2; HG.add(bot);
  for (const y of [2.55, -2.55]) HG.add(gold(new THREE.CylinderGeometry(1.85, 1.85, .36, 48), { pos: [0, y, 0] }));
  for (const x of [-1.55, 1.55]) for (const z of [-1.55, 1.55]) HG.add(gold(new THREE.CylinderGeometry(.09, .09, 5.1, 12), { pos: [x, 0, z] }));
  HG.add(mesh(new THREE.CylinderGeometry(1.05, .16, 1.0, 40), toon(0xE8C27A), { pos: [0, .5, 0], ink: false }));   // sand, top bulb
  HG.add(mesh(new THREE.CylinderGeometry(.16, 1.3, .9, 40), toon(0xE8C27A), { pos: [0, -1.1, 0], ink: false }));  // sand, bottom pile
  // falling sand stream: world-space, always falls down through the neck
  const N = 70, sa = new Float32Array(N * 3), sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sa, 3));
  const stream = new THREE.Points(sg, new THREE.PointsMaterial({ color: GOLD_L, size: .1, transparent: true, opacity: .9, depthWrite: false }));
  stream.position.set(0, 2.9, 0); Wd.add(stream);
  const DU = dust(Wd, 120, 20, 14, 20, 51, GOLD_L, .08, -2);
  // beats: first line 0.1-2.4 s, CTA 2.5-4.5 s; end card enters at 4.7 s (full size at 5.05 s, held to the 6.29 s end)
  const L1 = label(Wd, 'C_EIMATAI', { ny: .3, hf: .09, t0: .1, t1: 2.4 });
  const L2 = label(Wd, 'C_CTA', { ny: .3, hf: .09, t0: 2.5, t1: 4.5 });
  const L3 = label(Wd, 'MASECHET', { ny: .05, hf: .13, t0: 4.7, t1: 99, plate: true });
  const L4 = label(Wd, 'DAF_YOMI', { ny: -.16, hf: .09, t0: 4.7, t1: 99, plate: true });
  Wd.on((t, cam) => {
    HG.rotation.z = Math.PI * ease.io(prog(t, 2.6, 3.8));   // flip
    const pa = sg.attributes.position;
    for (let i = 0; i < N; i++) {
      const f = (i / N + t * 1.1) % 1;
      pa.array[i * 3] = .03 * Math.sin(i * 7.1); pa.array[i * 3 + 1] = -f * 1.5; pa.array[i * 3 + 2] = .03 * Math.cos(i * 3.3);
    }
    pa.needsUpdate = true;
    SW5(t); DU(t); L1(t, cam); L2(t, cam); L3(t, cam); L4(t, cam);
  });
  return Object.assign(Wd, { cam: path([
    [0, [.2, 3.6, 17], [0, 2.9, 0], 46],
    [6.29, [-.6, 4.0, 13], [0, 3.2, 0], 44],
  ]) });
}

// shot table (durations = narration_times.json film_c, 25.49 s)
export const shots = [
  { id: 'c1', dur: 6.2, build: s1 },
  { id: 'c2', dur: 6.1, build: s2 },
  { id: 'c3', dur: 2.3, build: s3 },
  { id: 'c4', dur: 4.6, build: s4 },
  { id: 'c5', dur: 6.29, build: s5 },
];
