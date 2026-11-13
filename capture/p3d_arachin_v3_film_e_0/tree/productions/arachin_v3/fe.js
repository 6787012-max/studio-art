// arachin3d / film_e "before the sun rises": portrait 1080x1920, 36.39 s, silent page.
// Objects only: village, clock, room, book, stone path, sun. No people. No Hebrew in code.
// On-screen text = vault IDs (captions_vault.json): titles and pills are drawn by drawOverlay(), the clock plate by tplane().
import { film, THREE, ease, prog, clamp, lerp, rng, world } from '../../lib/stage3d.js';
import { makeBook } from './book3d.js';

const W = 1080, H = 1920, TAU = Math.PI * 2, DEG = Math.PI / 180;
const out = ease.out, io = ease.io, inn = ease.in, sm = ease.sm, pg = prog;
const DUR = 36.39, HOLD_AT = DUR - 1.2;            // last 1.2 s: scene frozen, no fade to black
const T = { e1: 0, e2: 6.4, e3: 11.4, e4: 17.35, e5: 25.05, e6: 29.11 };   // shot starts (absolute s)
const HS = 2.6;                                     // house scale
const FZ = .7 * HS;                                 // front face of a house (z)
const WIN_Y = .8 * HS, WIN_Z = .715 * HS;           // lit window of the target house
const FAM = 'Assistant, Heebo, Arial, sans-serif';

const MAT = {
  gold: new THREE.MeshPhongMaterial({ color: 0xD9A93C, specular: 0xF3D98B, shininess: 90, emissive: 0x2a1800 }),
  goldL: new THREE.MeshPhongMaterial({ color: 0xF3D98B, specular: 0xffffff, shininess: 70, emissive: 0x3a2a08 }),
  cream: new THREE.MeshPhongMaterial({ color: 0xF6F1E5, specular: 0x444444, shininess: 12 }),
  navy: new THREE.MeshPhongMaterial({ color: 0x17357a, specular: 0x6FA8FF, shininess: 35 }),
  house: new THREE.MeshPhongMaterial({ color: 0x1A2B55, specular: 0x202a44, shininess: 6 }),
  roof: new THREE.MeshPhongMaterial({ color: 0x0B1A3C, specular: 0x111111, shininess: 4 }),
  wood: new THREE.MeshPhongMaterial({ color: 0x6B4426, specular: 0x332211, shininess: 18 }),
  woodD: new THREE.MeshPhongMaterial({ color: 0x3E2514, specular: 0x221a10, shininess: 10 }),
  stone: new THREE.MeshPhongMaterial({ color: 0xE9E2CF, specular: 0x222222, shininess: 6 }),
  stoneOn: new THREE.MeshPhongMaterial({ color: 0xFFE7A0, emissive: 0x9A6E10, specular: 0xFFF2C0, shininess: 80 }),
};

// ---------- small helpers ----------
function grp(parent, p, r) {
  const g = new THREE.Group();
  if (p) g.position.set(p[0], p[1], p[2]);
  if (r) g.rotation.set(r[0], r[1], r[2]);
  if (parent) parent.add(g);
  return g;
}
function mesh(geo, mat, p, r, s) {
  const m = new THREE.Mesh(geo, mat);
  if (p) m.position.set(p[0], p[1], p[2]);
  if (r) m.rotation.set(r[0], r[1], r[2]);
  if (s) m.scale.set(s[0], s[1], s[2]);
  return m;
}
const TEX = {};
function glowTex(key, rgb0, rgb1) {   // radial gradient, built once per key
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, `rgba(${rgb0},1)`); r.addColorStop(.35, `rgba(${rgb1},.45)`); r.addColorStop(1, `rgba(${rgb1},0)`);
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  return (TEX[key] = tx);
}
function sprite(parent, pos, size, opacity, key = 'gold', rgb0 = '255,226,150', rgb1 = '255,200,110') {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(key, rgb0, rgb1), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity }));
  s.position.set(pos[0], pos[1], pos[2]); s.scale.set(size, size, 1); parent.add(s); return s;
}

// ---------- sky: one colour track for the whole film (night -> red horizon -> sunrise -> morning) ----------
const SKY_KEYS = [
  [0, 0x020616, 0x0A1838], [17, 0x050C26, 0x142C66], [21, 0x0E1640, 0x5C2A44],
  [25, 0x2C2F6E, 0xE0683C], [29, 0x6FA6DA, 0xF7B873], [DUR, 0x8EC3EE, 0xFCE0B0],
];
function skyCol(t) {
  let i = 0; while (i < SKY_KEYS.length - 2 && t >= SKY_KEYS[i + 1][0]) i++;
  const a = SKY_KEYS[i], b = SKY_KEYS[i + 1], k = sm(clamp((t - a[0]) / (b[0] - a[0]), 0, 1));
  return { top: new THREE.Color(a[1]).lerp(new THREE.Color(b[1]), k), bot: new THREE.Color(a[2]).lerp(new THREE.Color(b[2]), k) };
}
function base(t0) {
  const Wd = world({ skyTop: 0x020616, skyBottom: 0x0A1838, fogColor: 0x0A1838, fogNear: 24, fogFar: 95, hemiSky: 0xA9C8FF, hemiGround: 0x0B1B3A, hemi: .9, sun: 1.1, sunColor: 0xFFE2A8, sunPos: [-30, 50, 25] });
  Wd.on(lt => {
    const c = skyCol(t0 + lt);
    Wd.sky.material.uniforms.top.value.copy(c.top);
    Wd.sky.material.uniforms.bot.value.copy(c.bot);
    Wd.scene.fog.color.copy(c.bot);
  });
  return Wd;
}
function stars(Wd, t0, fade) {   // fade(absolute t) -> 0..1
  const R = rng(91), N = 220, arr = new Float32Array(N * 3), geo = new THREE.BufferGeometry();
  for (let i = 0; i < N; i++) { arr[i * 3] = (R() - .5) * 120; arr[i * 3 + 1] = 4 + R() * 40; arr[i * 3 + 2] = -30 - R() * 60; }
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const m = new THREE.PointsMaterial({ color: 0xF3EED8, size: 2.2, sizeAttenuation: false, transparent: true, opacity: .9, depthWrite: false, fog: false });
  const p = new THREE.Points(geo, m); p.frustumCulled = false; Wd.add(p);
  Wd.on(lt => { m.opacity = .9 * fade(t0 + lt); m.visible = m.opacity > .01; });
}
function dust(Wd, n, seed, box) {   // floating motes, deterministic in t
  const R = rng(seed), base = [];
  for (let i = 0; i < n; i++) base.push([(R() - .5) * box[0], R() * box[1], -(R() * box[2]) + 2, R() * TAU, .1 + R() * .3]);
  const arr = new Float32Array(n * 3), geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xF3D98B, size: .07, transparent: true, opacity: .7, depthWrite: false, fog: false }));
  pts.frustumCulled = false; Wd.add(pts);
  Wd.on(lt => {
    for (let i = 0; i < n; i++) {
      const b = base[i];
      arr[i * 3] = b[0] + .4 * Math.sin(lt * b[4] + b[3]);
      arr[i * 3 + 1] = (b[1] + b[4] * lt * .5) % box[1];
      arr[i * 3 + 2] = b[2];
    }
    geo.attributes.position.needsUpdate = true;
  });
}
function hill(Wd, mat, x, z, sx, sy, top) {   // squashed sphere: its crest sits at height `top`
  return Wd.add(mesh(new THREE.SphereGeometry(1, 40, 20), mat, [x, top - sy, z], null, [sx, sy, sx * .8]));
}
function houses(Wd, list) {   // [x, z, scale, rotY] -> [{ g, wm }]; the first entry is the target house (window at WIN_Y/WIN_Z)
  return list.map(([x, z, s, ry]) => {
    const g = grp(Wd, [x, 0, z], [0, ry || 0, 0]); g.scale.setScalar(HS * (s || 1));
    g.add(mesh(new THREE.BoxGeometry(1.6, 1.3, 1.4), MAT.house, [0, .65, 0]));
    g.add(mesh(new THREE.ConeGeometry(1.25, .9, 4), MAT.roof, [0, 1.75, 0], [0, Math.PI / 4, 0]));
    const wm = new THREE.MeshBasicMaterial({ color: 0x0D1733, fog: false });
    g.add(mesh(new THREE.PlaneGeometry(.34, .4), wm, [0, .8, .715]));
    return { g, wm };
  });
}
function clockBuild(parent, pos, r) {
  const G = grp(parent, pos);
  G.add(mesh(new THREE.CylinderGeometry(r, r, .18, 48), MAT.cream, [0, 0, 0], [Math.PI / 2, 0, 0]));
  G.add(mesh(new THREE.TorusGeometry(r + .12, .14, 16, 64), MAT.gold, [0, 0, .05]));
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * DEG;
    G.add(mesh(new THREE.BoxGeometry(.12, i % 3 ? .18 : .32, .05), MAT.navy, [Math.sin(a) * r * .8, Math.cos(a) * r * .8, .1], [0, 0, -a]));
  }
  const hourP = grp(G, [0, 0, .14]), minP = grp(G, [0, 0, .16]);
  hourP.add(mesh(new THREE.BoxGeometry(.2, r * .5, .08), MAT.navy, [0, r * .25, 0]));
  minP.add(mesh(new THREE.BoxGeometry(.13, r * .82, .07), MAT.navy, [0, r * .41, 0]));
  G.add(mesh(new THREE.SphereGeometry(.15, 16, 12), MAT.gold, [0, 0, .2]));
  return { G, hourP, minP };
}
// hands unwind from 9 turns to the target time at t1
function setClock(c, t, hDeg, mDeg, t1) {
  const spin = TAU * 9 * (1 - out(pg(t, 0, t1)));
  c.hourP.rotation.z = -(hDeg * DEG + spin / 12);
  c.minP.rotation.z = -(mDeg * DEG + spin);
}
function sunDisc(Wd, p) {   // disc + rays + halo; the group is moved by the caller
  const g = grp(Wd, p);
  g.add(mesh(new THREE.CircleGeometry(3.4, 48), new THREE.MeshBasicMaterial({ color: 0xFFE7A8, fog: false }), [0, 0, 0]));
  const rayM = new THREE.MeshBasicMaterial({ color: 0xFFD27A, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  for (let k = 0; k < 16; k++) { const r = grp(g, null, [0, 0, k * TAU / 16]); r.add(mesh(new THREE.BoxGeometry(.5, 16, .02), rayM, [0, 9, -.05])); }
  const hal = sprite(g, [0, 0, .5], 30, .8, 'sun', '255,236,170', '255,170,80');
  return { g, rayM, hal };
}
// text on a plane, drawn lazily from the vault
function tplane(Wd, key, w, h, o) {
  o = o || {};
  const mat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  if (o.pos) m.position.set(o.pos[0], o.pos[1], o.pos[2]);
  if (o.parent) o.parent.add(m); else Wd.add(m);
  let done = false;
  const load = () => {
    const v = window.CAPTIONS_VAULT;
    if (done || !v || !Object.prototype.hasOwnProperty.call(v, key)) return;
    done = true;
    const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w);
    const g = c.getContext('2d'), s = String(v[key]);
    g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = c.height * (o.fs || .5); g.font = `700 ${Math.round(fs)}px ${FAM}`;
    const mw = g.measureText(s).width;
    if (mw > c.width * .92) { fs *= c.width * .92 / mw; g.font = `700 ${Math.round(fs)}px ${FAM}`; }
    g.lineJoin = 'round'; g.lineWidth = fs * .16; g.strokeStyle = 'rgba(8,14,34,.92)';
    g.strokeText(s, c.width / 2, c.height / 2);
    g.fillStyle = o.color || '#F6F1E5'; g.fillText(s, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    mat.map = tex; mat.needsUpdate = true;
  };
  Wd.on(() => load());
  return m;
}

// ---------- e1: wide night village (10 small houses in the lower frame), gold clock hovers in the centre on 5:50, then the camera flies to one lit window ----------
const E1 = { clk: [0, 5.4, -1], r: 1.8, win: 2 };   // clock centre (frame centre), clock radius, index of the house whose window lights
function s1() {
  const Wd = base(T.e1);
  const groundM = new THREE.MeshPhongMaterial({ color: 0x0C1F44, shininess: 4 });
  const hillM = new THREE.MeshPhongMaterial({ color: 0x163466, shininess: 6 });
  Wd.add(mesh(new THREE.PlaneGeometry(400, 400), groundM, [0, 0, -80], [-Math.PI / 2, 0, 0]));
  [[-22, -70, 40, 9, 8], [18, -74, 46, 10, 9], [0, -95, 70, 12, 11], [36, -60, 26, 8, 7], [-40, -66, 30, 9, 8]]
    .forEach(([x, z, sx, sy, top]) => hill(Wd, hillM, x, z, sx, sy, top));
  const V1 = houses(Wd, [[-3.6, -20, .55, .3], [-1.2, -24, .55, -.2], [1.8, -19, .55, .5], [3.4, -26, .55, -.4],
    [-2.6, -31, .55, .1], [.2, -34, .55, .6], [2.8, -37, .55, -.3], [-4.4, -38, .55, .2], [-.6, -42, .55, -.5], [4.4, -44, .55, .4]]);
  const tgt = V1[E1.win];
  const winGlow = sprite(Wd, [1.8, 1.14, -17.9], 1.6, 0, 'win', '255,226,150', '255,190,90');
  stars(Wd, T.e1, () => 1);
  // crescent moon upper left (bright disc, dark disc offset to the right), blue moonlight so the forms read
  Wd.add(mesh(new THREE.CircleGeometry(3.2, 48), new THREE.MeshBasicMaterial({ color: 0xF6F1E5, fog: false }), [-6, 30, -70]));
  Wd.add(mesh(new THREE.CircleGeometry(2.9, 48), new THREE.MeshBasicMaterial({ color: 0x03081E, fog: false }), [-4.8, 30.5, -69.9]));
  const ml = new THREE.DirectionalLight(0x9DBBFF, 1.0); ml.position.set(-10, 30, -20); Wd.add(ml);
  dust(Wd, 70, 17, [30, 12, 20]);

  const plateY = -(E1.r + .75);
  const ck = clockBuild(Wd, E1.clk, E1.r);
  sprite(ck.G, [0, 0, -.8], 9, .5);
  ck.G.add(mesh(new THREE.BoxGeometry(3.0, .7, .08), MAT.gold, [0, plateY, .1]));
  tplane(Wd, 'E_T550', 2.8, .62, { pos: [0, plateY, .18], parent: ck.G });
  Wd.on(lt => {
    const p = out(pg(lt, 0, 2.8)), w = sm(pg(lt, 4.4, 5.4));
    ck.G.position.set(E1.clk[0], lerp(E1.clk[1] + 7, E1.clk[1], p), E1.clk[2]);   // floats down into the centre
    setClock(ck, lt, 175, 300, 2.8);   // 5:50 (hour 175 deg, minute 300 deg)
    tgt.wm.color.set(0x0D1733).lerp(new THREE.Color(0xFFD36A), w);
    winGlow.material.opacity = .8 * w;
  });
  // subject: the clock until 4.4 s (camera starts flying), then the lit house; read live by the engine each frame
  let heroNow = ck.G;
  Wd.hero = { get group() { return heroNow; } };
  Wd.on(lt => { heroNow = lt < 4.4 ? ck.G : tgt.g; });
  // camera: crane in on the clock (0-4.2 s), then fly to the lit window of house 2 (4.4-6.4 s)
  return Object.assign(Wd, { cam: t => {
    const u = io(pg(t, 0, 4.2)), v = io(pg(t, 4.4, 6.4));
    const ay = lerp(3.2, 2.5, u), az = lerp(16, 14, u);
    const bx = 1.8, by = 1.14, bz = -16.6;
    return { pos: [lerp(0, bx, v), lerp(ay, by, v), lerp(az, bz, v)],
      look: [lerp(0, bx, v), lerp(E1.clk[1], by, v), lerp(E1.clk[2], -18, v)], fov: 40 };
  } });
}

// ---------- e2: one window turns warm, camera pushes through it into the room ----------
function e2cam(lt) {
  const u = sm(pg(lt, 0, 5));
  return { pos: [.08 * Math.sin(lt * .9), lerp(2.2, 2.0, u), lerp(10.8, -.3, u)], look: [0, lerp(2.0, 1.9, u), lerp(1.8, -6, u)] };
}
function s2() {
  const Wd = base(T.e2);
  const hs = houses(Wd, [[0, 0, 1, 0]]), H0 = hs[0];   // the target house: solid facade, lit window
  const glow = sprite(Wd, [0, WIN_Y, WIN_Z + .3], 3.4, 0, 'win', '255,226,150', '255,190,90');
  // room behind the facade
  const room = grp(Wd);
  room.add(mesh(new THREE.PlaneGeometry(8, 13), MAT.woodD, [0, 0, -5.6], [-Math.PI / 2, 0, 0]));
  room.add(mesh(new THREE.PlaneGeometry(13, 3.4), MAT.wood, [-4, 1.7, -5.6], [0, Math.PI / 2, 0]));
  room.add(mesh(new THREE.PlaneGeometry(13, 3.4), MAT.wood, [4, 1.7, -5.6], [0, -Math.PI / 2, 0]));
  room.add(mesh(new THREE.PlaneGeometry(8, 3.4), MAT.wood, [0, 1.7, -12]));
  // table, closed volume, cup with steam, desk lamp
  const table = grp(room, [0, 0, -6]);
  table.add(mesh(new THREE.BoxGeometry(2.8, .14, 1.5), MAT.wood, [0, 1.07, 0]));
  [[-1.25, -.6], [1.25, -.6], [-1.25, .6], [1.25, .6]].forEach(([x, z]) => table.add(mesh(new THREE.BoxGeometry(.14, 1.0, .14), MAT.woodD, [x, .5, z])));
  const bk = makeBook(THREE, { w: 3.0, h: 4.2, t: .9 });
  bk.scale.setScalar(.6); bk.position.set(0, 2.37, -6); bk.rotation.x = -.25; room.add(bk);
  // (children of `table` use absolute heights: the table group sits at y = 0)
  table.add(mesh(new THREE.CylinderGeometry(.28, .24, .55, 28), MAT.cream, [.95, 1.34, 0]));
  const lampM = new THREE.MeshPhongMaterial({ color: 0xF6F1E5, emissive: 0x3a2a10, side: THREE.DoubleSide, shininess: 10 });
  table.add(mesh(new THREE.CylinderGeometry(.18, .2, .08, 24), MAT.gold, [-1.0, 1.14, 0]));
  table.add(mesh(new THREE.CylinderGeometry(.05, .05, .6, 8), MAT.gold, [-1.0, 1.5, 0]));
  table.add(mesh(new THREE.CylinderGeometry(.35, .55, .6, 24, 1, true), lampM, [-1.0, 2.0, 0]));
  const lamp = new THREE.PointLight(0xFFB86A, 9, 12, 1.4); lamp.position.set(-1.0, 1.9, 0); table.add(lamp);
  const lampHalo = sprite(table, [-1.0, 1.9, 0], 3.2, .5, 'lamp', '255,210,140', '255,160,70');
  // steam from the cup (deterministic particles)
  const SN = 36, sp = new Float32Array(SN * 3), sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const steamM = new THREE.PointsMaterial({ color: 0xF6F1E5, size: .16, transparent: true, opacity: .45, depthWrite: false, fog: false });
  const steam = new THREE.Points(sgeo, steamM); steam.frustumCulled = false; table.add(steam);
  Wd.on(lt => {
    const abs = T.e2 + lt, k = sm(pg(lt, 0, 1.2)), c = e2cam(lt);
    H0.wm.color.set(0x0D1733).lerp(new THREE.Color(0xFFD36A), k);
    glow.material.opacity = .8 * k;
    const vis = c.pos[2] > FZ + .15;               // the facade is passed once the camera is inside the window
    H0.g.visible = vis; glow.visible = vis;
    lamp.intensity = 9 * (.94 + .06 * Math.sin(abs * 7.3)); lampHalo.material.opacity = .5 * lamp.intensity / 9;
    for (let i = 0; i < SN; i++) {
      const f = (lt * .35 + i / SN) % 1;
      sp[i * 3] = .95 + .12 * Math.sin(f * 6 + i); sp[i * 3 + 1] = 1.7 + f * 1.3; sp[i * 3 + 2] = .08 * Math.cos(f * 5 + i);
    }
    sgeo.attributes.position.needsUpdate = true;
    steamM.opacity = .45 * (1 - sm(pg(lt, 3.5, 5)));
  });
  Wd.hero = { group: bk };
  return Object.assign(Wd, { cam: t => { const c = e2cam(t); return { pos: c.pos, look: c.look, fov: 40 }; } });
}

// ---------- e3: close on the book: it opens, pages flip, light comes out; desk calendar leaf flips ----------
function s3() {
  const Wd = base(T.e3);
  Wd.add(mesh(new THREE.PlaneGeometry(40, 20), MAT.woodD, [0, 3, -6]));
  Wd.add(mesh(new THREE.BoxGeometry(20, .4, 10), MAT.wood, [0, -2.2, 0]));
  const warm = new THREE.PointLight(0xFFB86A, 16, 14, 1.3); warm.position.set(-2.4, 1.8, 4); Wd.add(warm);
  const bk = makeBook(THREE, { w: 3.0, h: 4.2, t: .9 });
  bk.scale.setScalar(.6); bk.position.set(0, -.7, 0); Wd.add(bk);
  const glow = sprite(Wd, [0, -.6, -.5], 9, 0);
  // desk calendar on the table, its leaf flips over the top
  const cal = grp(Wd, [1.25, -2.0, 2.6]); cal.scale.setScalar(.75);   // small desk calendar beside the book, in front right
  cal.add(mesh(new THREE.BoxGeometry(1.6, .25, 1.0), MAT.cream, [0, .1, 0]));
  cal.add(mesh(new THREE.BoxGeometry(1.6, 1.4, .06), MAT.cream, [0, .8, -.4]));
  const leaf = grp(cal, [0, .9, -.35]);
  leaf.add(mesh(new THREE.PlaneGeometry(1.4, 1.1), new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 4 }), [0, -.55, .01]));
  leaf.add(mesh(new THREE.BoxGeometry(1.4, .12, .03), MAT.gold, [0, -.06, .02]));
  Wd.on(lt => {
    bk.setOpen(sm(pg(lt, .6, 2.4)));
    bk.setFlip(pg(lt, 2.4, 4.6));
    bk.setGlow(.45 * sm(pg(lt, 1.0, 3.0)));
    glow.material.opacity = .65 * sm(pg(lt, 1.0, 3.0));
    leaf.rotation.x = -Math.PI * sm(pg(lt, 2.0, 2.9));
    warm.intensity = 16 * (.95 + .05 * Math.sin(lt * 5));
  });
  Wd.hero = { group: bk };
  // whole open spread in frame and centred (spread is 3.6 wide, frame is 0.41 x distance wide)
  return Object.assign(Wd, { cam: t => ({ pos: [.4 * Math.sin(t * .5), -.1, lerp(11.0, 10.4, sm(pg(t, 0, 5.95)))], look: [0, -.5, 0], fov: 40 }) });
}

// ---------- e4: 33 stones climb the hill, bookmark hops, counter runs, horizon glows red ----------
function s4() {
  const Wd = base(T.e4);
  const hillM = new THREE.MeshPhongMaterial({ color: 0x0E2250, shininess: 4 });
  Wd.add(mesh(new THREE.ConeGeometry(14, 10, 40), hillM, [0, 5, -10]));
  Wd.add(mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshPhongMaterial({ color: 0x0A1A3C, shininess: 4 }), [0, -.6, -60], [-Math.PI / 2, 0, 0]));
  const hz = sprite(Wd, [0, 4, -44], 70, 0, 'hz', '255,150,80', '255,90,40');
  const N = 33, P = [];
  for (let i = 0; i <= N; i++) P.push([3.2 * Math.sin(i * .9), .3 * i, 0]);
  const stones = [], pathG = grp(Wd);
  for (let i = 0; i < N; i++) {
    const g = grp(pathG, P[i]);
    g.add(mesh(new THREE.CylinderGeometry(.8, .85, .22, 24), MAT.stone));
    const lit = mesh(new THREE.CylinderGeometry(.82, .87, .24, 24), MAT.stoneOn, [0, .01, 0]); lit.visible = false; g.add(lit);
    stones.push({ lit, t: .2 + i * .13 });
  }
  const bm = mesh(new THREE.BoxGeometry(1.4, .1, .4), MAT.goldL); Wd.add(bm);
  const bg = sprite(Wd, [0, 0, .4], 4, .7);
  const hop = t => {
    const s = clamp((t - .2) / .13, 0, N), i0 = Math.min(N - 1, Math.floor(s)), f = s - i0, e = io(f);
    const a = P[i0], b = P[i0 + 1];
    return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) + .35 + .8 * Math.sin(Math.PI * f), .6];
  };
  dust(Wd, 90, 404, [30, 14, 20]);
  Wd.on(lt => {
    const abs = T.e4 + lt, b = hop(lt);
    bm.position.set(b[0], b[1], b[2]); bg.position.set(b[0], b[1], b[2] + .4);
    stones.forEach(q => { q.lit.visible = lt >= q.t; });
    hz.material.opacity = .9 * sm(pg(abs, 17.35, 25));
    hillM.color.set(0x0E2250).lerp(new THREE.Color(0x7A3A3A), sm(pg(abs, 19, 25)));
  });
  Wd.hero = { group: pathG };
  Wd.cam = t => {
    const b = hop(t), k = io(pg(t, 0, 4.6)), r = sm(pg(t, 4.6, 7.7));
    const lx = b[0] * .3, ly = lerp(4.0, 6.5, k) + 2.5 * r;
    return { pos: [lx + .4 * Math.sin(t * .7), ly + .4 + 2.5 * r, lerp(20, 17, k) - 3 * r], look: [lx, ly + 1.4 * r, 0], fov: 40 };
  };
  return Wd;
}

// ---------- e5: sunrise behind the hills, stars fade, village windows catch light, clock returns to 6:30 ----------
function s5() {
  const Wd = base(T.e5);
  const hillM = new THREE.MeshPhongMaterial({ color: 0x0E2250, shininess: 4 });
  Wd.add(mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshPhongMaterial({ color: 0x0A1A3C, shininess: 4 }), [0, 0, -70], [-Math.PI / 2, 0, 0]));
  [[-14, -24, 20, 5, 3.2], [12, -26, 22, 6, 3.4], [0, -34, 40, 8, 4.2], [-30, -36, 20, 6, 3.5], [28, -30, 16, 5, 2.8]]
    .forEach(([x, z, sx, sy, top]) => hill(Wd, hillM, x, z, sx, sy, top));
  const V = houses(Wd, [[-6, -18, 1, .3], [4, -20, 1.1, -.2], [-12, -24, 1, .5], [10, -26, .9, .1], [0, -30, 1.1, 0], [-18, -30, .9, -.4]]);
  stars(Wd, T.e5, abs => 1 - sm(pg(abs, 25.5, 28.6)));
  const sun = sunDisc(Wd, [0, -6, -40]);
  const ck = clockBuild(Wd, [0, 1.3, 0], 1.0);   // raised and reduced: the ground plane (y=0) no longer hides the lower part
  sprite(ck.G, [0, 0, -.8], 7, .6);
  Wd.on(lt => {
    const abs = T.e5 + lt;
    ck.G.scale.setScalar(Math.max(.001, out(pg(lt, 0, .6))));
    setClock(ck, lt, 195, 180, 1.5);   // 6:30 (hour 195 deg, minute 180 deg), settled by 26.6 s
    sun.g.position.y = lerp(-6, 3.4, out(pg(abs, 25.2, 29.1)));
    sun.rayM.opacity = .32 * sm(pg(abs, 25.6, 27.6));
    V.forEach(h => h.wm.color.set(0x0D1733).lerp(new THREE.Color(0xFFC36A), sm(pg(abs, 26, 28.5))));
    hillM.color.set(0x0E2250).lerp(new THREE.Color(0x3A2A4A), sm(pg(abs, 25, 28)));
  });
  Wd.hero = { group: ck.G };
  return Object.assign(Wd, { cam: t => { const u = sm(pg(t, 0, 4.06)); return { pos: [0, lerp(.9, 1.3, u), lerp(8.2, 7.6, u)], look: [0, .9, 0], fov: 40 }; } });
}

// ---------- e6: end card: open book in the lower third, sun behind it, texts punch in ----------
function s6() {
  const Wd = base(T.e6);
  const sun = sunDisc(Wd, [0, -.2, -36]);
  const key = new THREE.DirectionalLight(0xFFE2A8, 1.4); key.position.set(3, 8, 10); Wd.add(key);
  const bk = makeBook(THREE, { w: 3.0, h: 4.2, t: .9 });
  bk.scale.setScalar(.55); bk.position.set(0, -2.26, 0); Wd.add(bk);   // lower third of the frame, whole
  Wd.on(lt => {
    bk.setOpen(io(pg(lt, .2, 2.6)));
    bk.setGlow(.6 * sm(pg(lt, 1.4, 3.6)));
    bk.setFlip(pg(lt, 2.8, 5.6));
    sun.hal.material.opacity = .85;
    sun.rayM.opacity = .3 * sm(pg(lt, .5, 2.5));
  });
  Wd.hero = { group: bk };
  return Object.assign(Wd, { cam: t => ({ pos: [.3 * Math.sin(t * .4), 0, lerp(10.2, 9.8, sm(pg(t, 0, 7.28)))], look: [0, 0, 0], fov: 40 }) });
}

// ---------- on-screen text: vault IDs only ----------
// y = title (screen-space, no caption gate); no y = pill (caption gate: needs >= 4.4 s); plate = gold pill
const OV = [
  { k: 'E_CHALON', a: 6.4, b: 11.11 },
  { k: 'E_MASECHET', a: 11.41, b: 13.35, y: .15 },
  { k: 'E_YOM', a: 13.45, b: 15.25, y: .15 },
  { k: 'E_33', a: 15.35, b: 17.05, y: .15, big: true },
  { k: 'E_DAF', a: 17.35, b: 19.3, y: .15 },
  { k: 'E_MAGID', a: 19.5, b: 24.75, plate: true },
  { k: 'E_SHACHARIT', a: 25.05, b: 28.81, y: .15, big: true },
  { k: 'E_T550', a: 29.11, b: 36.39, y: .27, big: true },
  { k: 'E_END1', a: 30.1, b: 36.39, y: .42 },
  { k: 'E_CTA', a: 31.4, b: 36.39, y: .56 },
  { k: 'E_END2', a: 31.9, b: 36.39, y: .965, small: true },
];
const ovText = k => { const v = window.CAPTIONS_VAULT || {}; return Object.prototype.hasOwnProperty.call(v, k) ? String(v[k]) : ''; };
function ovWrap(g, s, maxW) {
  const L = []; let cur = '';
  for (const w of s.split(' ')) { const tst = cur ? cur + ' ' + w : w; if (!cur || g.measureText(tst).width <= maxW) cur = tst; else { L.push(cur); cur = w; } }
  if (cur) L.push(cur); return L;
}
function pillLayout(g, s) {
  const em = W * .093, pad = W * .03;
  g.direction = 'rtl'; g.font = `700 ${Math.round(em)}px ${FAM}`;
  const L = ovWrap(g, s, W * .86 - pad * 2), lh = em * 1.28, tp = em * .34, bh = L.length * lh + tp * 2, by = H * .8 - bh;
  let mw = 0; for (const l of L) mw = Math.max(mw, g.measureText(l).width);
  return { em, L, lh, tp, by, rect: { x: W / 2 - mw / 2 - pad, y: by, w: mw + pad * 2, h: bh } };
}
function drawOverlay(t) {
  const g = document.getElementById('c').getContext('2d');
  if (t >= 17.55 && t < 24.7) {   // path counter 1..33 (digits only)
    const n = clamp(Math.floor((t - 17.55) / .13) + 1, 1, 33), em = H * .11;
    g.save(); g.direction = 'ltr'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${Math.round(em)}px ${FAM}`;
    g.lineJoin = 'round'; g.lineWidth = em * .14; g.strokeStyle = 'rgba(8,14,34,.92)'; g.strokeText(String(n), W / 2, H * .27);
    g.fillStyle = '#F3D98B'; g.fillText(String(n), W / 2, H * .27); g.restore();
  }
  for (const it of OV) {
    if (t < it.a || t >= it.b) continue;
    const s = ovText(it.k); if (!s) continue;
    const a = clamp((t - it.a) / .3, 0, 1) * clamp((it.b - t) / .3, 0, 1);
    g.save(); g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = a;
    if (it.y === undefined || it.plate) {
      const P = pillLayout(g, s), slide = it.plate ? (1 - out(pg(t, it.a, it.a + .5))) * W * .4 : 0;
      g.globalAlpha = a * (it.plate ? 1 : .8);
      g.fillStyle = it.plate ? '#D9A93C' : 'rgba(14,12,26,.82)';
      g.beginPath(); g.roundRect(P.rect.x + slide, P.rect.y, P.rect.w, P.rect.h, P.em * .36); g.fill();
      g.globalAlpha = a; g.fillStyle = it.plate ? '#0B1B3A' : '#fff';
      P.L.forEach((l, i) => g.fillText(l, W / 2 + slide, P.by + P.tp + P.lh * (i + .5)));
    } else {
      let em = H * (it.big ? .105 : it.small ? .05 : .085); g.font = `700 ${Math.round(em)}px ${FAM}`;
      const mw = g.measureText(s).width; if (mw > W * .8) { em *= W * .8 / mw; g.font = `700 ${Math.round(em)}px ${FAM}`; }
      const sc = .8 + .2 * out(pg(t, it.a, it.a + .35));
      g.translate(W / 2, it.y * H); g.scale(sc, sc);
      g.lineJoin = 'round'; g.lineWidth = em * .14; g.strokeStyle = 'rgba(8,14,34,.92)'; g.strokeText(s, 0, 0);
      g.fillStyle = '#F6F1E5'; g.fillText(s, 0, 0);
    }
    g.restore();
  }
}

film({
  W, H, vault: 'captions_vault.json', xf: .001, fadeIn: false,   // hard cuts (xf > 0 would double-expose); 0 is falsy in film(), so a tiny value
  shots: [
    { id: 'e1', dur: 6.4, build: s1 },
    { id: 'e2', dur: 5.0, build: s2 },
    { id: 'e3', dur: 5.95, build: s3 },
    { id: 'e4', dur: 7.7, build: s4 },
    { id: 'e5', dur: 4.06, build: s5 },
    { id: 'e6', dur: 7.28, build: s6 },
  ],
});

// ---------- wrap the engine seek: freeze the last 1.2 s (engine would fade to black) and draw the text ----------
const seekStage = window.__seek, tAbs = t => Math.max(0, (Number(t) || 0) + (window.__T0 || 0));
window.__seek = t => {
  const a = tAbs(t), off = window.__T0 || 0;
  seekStage(Math.min(a, HOLD_AT) - off);
  drawOverlay(a);
};
window.__caption = t => {   // same box as drawn: lets verify_scene measure the pill
  t = tAbs(t);
  const it = OV.find(o => (o.y === undefined || o.plate) && t >= o.a && t < o.b); if (!it) return null;
  const s = ovText(it.k); if (!s) return null;
  const P = pillLayout(document.createElement('canvas').getContext('2d'), s);
  return { id: it.k, text: s, rect: P.rect, canvasW: W, canvasH: H, dir: 'rtl', lang: 'he', alpha: 1 };
};
