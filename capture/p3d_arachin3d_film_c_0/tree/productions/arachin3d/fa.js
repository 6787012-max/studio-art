// arachin3d / film_a: gold + navy 3D film, 6 shots timed to narration_times.json (film_a).
// No people. No Hebrew in code: on-screen text = vault IDs only (engine captions + tplane()).
import { film, THREE, ease, prog, clamp, lerp, orbit, rng, world } from '../../lib/stage3d.js';
import { makeBook } from './book3d.js';

const LAND = /[?&]fmt=land(&|$)/.test(location.search);
const W = LAND ? 1920 : 1080, H = LAND ? 1080 : 1920;
const PT = !LAND;
const TAU = Math.PI * 2;
const pg = prog, out = ease.out, io = ease.io, sm = ease.sm, inn = ease.in;

// framing is set per shot in portrait units (the old global pull-back made every subject small)
const fit = fn => t => { const c = fn(t); return { pos: c.pos, look: c.look, fov: c.fov || 45 }; };

const MAT = {
  gold: new THREE.MeshPhongMaterial({ color: 0xD9A93C, specular: 0xF3D98B, shininess: 90, emissive: 0x2a1800 }),
  goldL: new THREE.MeshPhongMaterial({ color: 0xF3D98B, specular: 0xffffff, shininess: 70, emissive: 0x3a2a08 }),
  navy: new THREE.MeshPhongMaterial({ color: 0x17357a, specular: 0x6FA8FF, shininess: 35 }),
  royal: new THREE.MeshPhongMaterial({ color: 0x1F4FA8, specular: 0x9cc4ff, shininess: 45 }),
  cream: new THREE.MeshPhongMaterial({ color: 0xF6F1E5, specular: 0x444444, shininess: 12 }),
  slab: new THREE.MeshPhongMaterial({ color: 0x8f8677, specular: 0x222222, shininess: 8 }),
  grey: new THREE.MeshPhongMaterial({ color: 0x4a4e5a, specular: 0x111111, shininess: 4 }),
  gem: new THREE.MeshPhongMaterial({ color: 0xbfe0ff, specular: 0xffffff, shininess: 180, emissive: 0x1F4FA8, emissiveIntensity: .6 }),
  flame: new THREE.MeshBasicMaterial({ color: 0xFFB84A }),
  flameW: new THREE.MeshBasicMaterial({ color: 0xFFF2C2 }),
  halo: new THREE.MeshBasicMaterial({ color: 0xFFD27A, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending }),
};
const GEO = { coin: new THREE.CylinderGeometry(.62, .62, .12, 36) };

const mk = (geo, mat, pos, rot, sc) => {
  const m = new THREE.Mesh(geo, mat);
  if (pos) m.position.set(pos[0], pos[1], pos[2]);
  if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
  if (sc !== undefined) { if (typeof sc === 'number') m.scale.setScalar(sc); else m.scale.set(sc[0], sc[1], sc[2]); }
  return m;
};
const grp = (parent, pos, rot) => {
  const g = new THREE.Group();
  if (pos) g.position.set(pos[0], pos[1], pos[2]);
  if (rot) g.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(g); return g;
};
const punch = (m, t, a) => { const on = t >= a; m.visible = on; if (on) m.scale.setScalar(.8 + .2 * out(pg(t, a, a + .35))); };

// soft additive glow sprite behind a gold/gem object (static gradient; the sprite moves with its parent)
function glow(parent, pos, size, op) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 2, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,226,150,1)'); gr.addColorStop(.35, 'rgba(255,200,110,.45)'); gr.addColorStop(1, 'rgba(255,180,80,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: op }));
  m.position.set(pos[0], pos[1], pos[2]); m.scale.set(size, size, 1); parent.add(m); return m;
}
// one light band that crosses the gold once per shot (t0..t0+d); deterministic in t
function sweep(Wd, t0, d, y, z, k = 1) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 32; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 256, 0);
  gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(.5, 'rgba(255,245,215,1)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 32);
  const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), mat);
  m.rotation.z = -.5; m.position.set(0, y, z); m.visible = false; Wd.add(m);
  Wd.on(t => { const q = pg(t, t0, t0 + d); m.visible = q > 0 && q < 1; m.position.x = lerp(-9, 9, q); mat.opacity = .5 * k * Math.sin(Math.PI * q); });
  return m;
}

// deep navy space with drifting gold dust (deterministic: a pure function of t)
function space(seed, n) {
  const Wd = world({ skyTop: 0x040A1C, skyBottom: 0x1B3F8F, fogColor: 0x0B1B3A, fogNear: 26, fogFar: 80, hemiSky: 0xA9C8FF, hemiGround: 0x0B1B3A, hemi: .95, sun: 1.7, sunColor: 0xFFE2A8, sunPos: [-30, 50, 25] });
  const rim = new THREE.DirectionalLight(0x6FA8FF, 1.6); rim.position.set(30, 20, -40); Wd.add(rim);
  // soft nebula glow far behind the set: gives the backdrop a gradient instead of one flat colour
  const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gx = gc.getContext('2d');
  const gr = gx.createRadialGradient(128, 128, 8, 128, 128, 128); gr.addColorStop(0, 'rgba(70,120,230,0.6)'); gr.addColorStop(.5, 'rgba(31,79,168,0.25)'); gr.addColorStop(1, 'rgba(4,10,28,0)');
  gx.fillStyle = gr; gx.fillRect(0, 0, 256, 256);
  const neb = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, fog: false }));
  neb.scale.set(80, 80, 1); neb.position.set(0, 2, -34); Wd.add(neb);
  const R = rng(seed), N = n || 150, arr = new Float32Array(N * 3), base = [];
  for (let i = 0; i < N; i++) base.push([(R() - .5) * 42, (R() - .5) * 28, -(R() * 26) + 4, R() * TAU, .15 + R() * .5]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xF3D98B, size: .1, transparent: true, opacity: .85, depthWrite: false, fog: false }));
  pts.frustumCulled = false; Wd.add(pts);
  Wd.on(t => {
    for (let i = 0; i < N; i++) {
      const b = base[i]; let y = b[1] + b[4] * t * .8; y = ((y + 14) % 28 + 28) % 28 - 14;
      arr[i * 3] = b[0] + .7 * Math.sin(t * b[4] + b[3]); arr[i * 3 + 1] = y; arr[i * 3 + 2] = b[2];
    }
    geo.attributes.position.needsUpdate = true;
  });
  return Wd;
}

// text on a plane, drawn lazily from the vault (window.CAPTIONS_VAULT is loaded before the first frame)
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
    let fs = c.height * (o.fs || .5); g.font = `700 ${Math.round(fs)}px Assistant, Heebo, Arial, sans-serif`;
    const mw = g.measureText(s).width;
    if (mw > c.width * .92) { fs *= c.width * .92 / mw; g.font = `700 ${Math.round(fs)}px Assistant, Heebo, Arial, sans-serif`; }
    g.lineJoin = 'round'; g.lineWidth = fs * .16; g.strokeStyle = 'rgba(8,14,34,.92)';
    g.strokeText(s, c.width / 2, c.height / 2);
    g.fillStyle = o.color || '#F6F1E5'; g.fillText(s, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    mat.map = tex; mat.needsUpdate = true;
  };
  Wd.on(() => load());
  return m;
}

// balance scale: pole + beam + two pans; setTilt(th) moves the beam ends and keeps pans level
function balance(Wd, pos, hl, bh0) {
  const g = grp(Wd, pos), bh = bh0 || 4.2, beam = grp(g, [0, bh, 0]);
  g.add(mk(new THREE.CylinderGeometry(.12, .16, bh, 16), MAT.gold, [0, bh / 2, 0]));
  g.add(mk(new THREE.CylinderGeometry(1.2, 1.4, .3, 32), MAT.gold, [0, .15, 0]));
  beam.add(mk(new THREE.BoxGeometry(hl * 2 + .5, .14, .22), MAT.gold));
  beam.add(mk(new THREE.SphereGeometry(.26, 16, 12), MAT.goldL, [0, .24, 0]));
  const pans = [-1, 1].map(() => grp(g, [0, bh, 0]));
  pans.forEach(p => {
    p.add(mk(new THREE.CylinderGeometry(1.1, .9, .14, 40), MAT.gold, [0, -2.2, 0]));
    [-.7, .7].forEach(x => p.add(mk(new THREE.CylinderGeometry(.03, .03, 2.2, 6), MAT.goldL, [x, -1.1, 0])));
  });
  g.pans = pans;
  g.setTilt = th => {
    beam.rotation.z = th;
    [-1, 1].forEach((s, k) => { pans[k].position.set(s * hl * Math.cos(th), bh + s * hl * Math.sin(th), 0); });
  };
  g.setTilt(0);
  return g;
}

// stack of gold coins; set(k) shows the first k coins
function coinStack(parent, pos, max) {
  const g = grp(parent, pos), cs = [];
  for (let i = 0; i < max; i++) { const c = mk(GEO.coin, MAT.gold, [0, .07 + i * .13, 0]); g.add(c); cs.push(c); }
  return { g, set: k => cs.forEach((c, i) => { c.visible = i < k; }) };
}

// dial gauge with a needle and a vault label under it
function gauge(Wd, pos, lab, sc) {
  const g = grp(Wd, pos); if (sc) g.scale.setScalar(sc);
  const face = mk(new THREE.CylinderGeometry(1.25, 1.25, .12, 40), MAT.navy, [0, 0, 0], [Math.PI / 2, 0, 0]); g.add(face);
  g.add(mk(new THREE.TorusGeometry(1.3, .13, 14, 48), MAT.gold));
  const nd = grp(g, [0, 0, .12]); nd.add(mk(new THREE.BoxGeometry(.12, 1.0, .08), MAT.goldL, [0, .5, 0]));
  g.add(mk(new THREE.CylinderGeometry(.15, .15, .2, 16), MAT.goldL, [0, 0, .12], [Math.PI / 2, 0, 0]));
  tplane(Wd, lab, 2.6, .65, { pos: [0, -1.9, .3], fs: .6, parent: g });
  return { g, face, base: pos.slice(), setAng: a => { nd.rotation.z = a; } };
}

// the question mark: a torus arc from the bottom round over the top, a stem and a dot
function qmark(Wd) {
  const g = grp(Wd, [0, 0, 0]);
  g.add(mk(new THREE.TorusGeometry(1, .24, 20, 64, Math.PI * 1.5), MAT.gold, [0, 0, 0], [0, 0, -Math.PI / 2]));
  g.add(mk(new THREE.CylinderGeometry(.24, .24, .9, 20), MAT.gold, [0, -1.45, 0]));
  g.add(mk(new THREE.SphereGeometry(.34, 24, 16), MAT.goldL, [0, -2.35, 0]));
  return g;
}

// ---------- a1: question mark spins up, the scale rises behind it, camera pushes in ----------
function s1() {
  const Wd = space(1, 170);
  const Q = qmark(Wd), SC = balance(Wd, [0, -8, -7], 2.8);
  Wd.hero = { group: Q };
  Wd.on(t => {
    Q.position.set(Math.sin(t * .9) * .15, .9 + Math.sin(t * 1.7) * .12, 0);
    Q.rotation.y = TAU * .75 * io(pg(t, 0, 3.6));
    Q.rotation.z = .08 * Math.sin(t * 1.1);
    SC.position.y = lerp(-8, 1.6, out(pg(t, .8, 3.0)));
    SC.setTilt(.05 * Math.sin(t * 1.4));
  });
  glow(Wd, [0, .2, -1.2], 7, .55); sweep(Wd, 1.2, 1.2, .2, 1.2);
  return Object.assign(Wd, { cam: fit(t => ({ pos: [0, .2, 9.3 - .9 * out(pg(t, 0, 3.6))], look: [0, .2, 0], fov: 42 })) });
}

// ---------- a2: valuation machine: scale, three gauges, coin stacks, price tag, 60 degree orbit ----------
function s2() {
  const Wd = space(2, 150);
  const SC = balance(Wd, [0, -1.2, 0], 2.8);
  const cL = coinStack(SC.pans[0], [0, -2.1, 0], 9), cR = coinStack(SC.pans[1], [0, -2.1, 0], 9);
  const gs = [gauge(Wd, [-3.5, 6.2, -1.2], 'A_GIL'), gauge(Wd, [0, 8.4, 1.4], 'A_BRIUT'), gauge(Wd, [3.5, 6.2, -1.2], 'A_KOACH')];
  const tag = mk(new THREE.BoxGeometry(1.6, 1.0, .14), MAT.goldL, [3.6, -1.0, 2.2]); Wd.add(tag);
  const hg = new THREE.Group(); Wd.add(hg); hg.add(SC, ...gs.map(g => g.g)); Wd.hero = { group: hg };
  glow(Wd, [0, 4.2, -1.5], 12, .35); sweep(Wd, 4.0, 1.4, 3.4, 1.5);
  Wd.on(t => {
    const nL = Math.round(4 + 3 * Math.sin(t * .9)), nR = Math.round(4 + 3 * Math.sin(t * .9 + 2.1));
    cL.set(clamp(nL, 1, 9)); cR.set(clamp(nR, 1, 9));
    SC.setTilt(clamp(-.07 * (nR - nL), -.3, .3));
    gs.forEach((g, i) => g.setAng(.95 * Math.sin(t * (.8 + .25 * i) + i * 1.7)));
    tag.rotation.x = Math.PI * Math.floor(t / 2.6) + Math.PI * io(pg(t % 2.6, 1.9, 2.5));
    tag.position.y = -1.0 + .08 * Math.sin(t * 1.5);
  });
  return Object.assign(Wd, { cam: fit(orbit([0, 3.4, 0], 24.5, 3.2, -30, 30, 0, 10.32, 40)) });
}

// ---------- a3: scroll unrolls, stone slab lands, gold seal stamps, two gauges go grey and fall ----------
function s3() {
  const Wd = space(3, 150);
  const scr = grp(Wd, [0, 2.6, -2.6]);
  scr.add(mk(new THREE.PlaneGeometry(9, 4.6), MAT.cream));
  scr.add(mk(new THREE.CylinderGeometry(.34, .34, 9.2, 20), MAT.goldL, [0, 2.3, .1], [0, 0, Math.PI / 2]));
  scr.add(mk(new THREE.CylinderGeometry(.34, .34, 9.2, 20), MAT.goldL, [0, -2.3, .1], [0, 0, Math.PI / 2]));
  const slab = grp(Wd, [0, 0, .6]);
  slab.add(mk(new THREE.BoxGeometry(5, 1.2, 3), MAT.slab, [0, .6, 0]));
  coinStack(slab, [0, 1.2, 0], 7);
  const rm = new THREE.MeshBasicMaterial({ color: 0xF3D98B, transparent: true, opacity: 0, depthWrite: false });
  const ring = mk(new THREE.TorusGeometry(1, .08, 8, 64), rm, [0, .05, .6], [Math.PI / 2, 0, 0]); Wd.add(ring);
  const seal = grp(Wd, [0, 5.2, .6]);
  seal.add(mk(new THREE.CylinderGeometry(.9, .9, .36, 36), MAT.gold));
  seal.add(mk(new THREE.CylinderGeometry(.3, .4, .8, 20), MAT.goldL, [0, .58, 0]));
  const gs = [gauge(Wd, [-2.1, 5.0, -.6], 'A_GIL', .72), gauge(Wd, [0, 5.6, -.6], 'A_BRIUT', .72), gauge(Wd, [2.1, 5.0, -.6], 'A_KOACH', .72)];
  const hg = new THREE.Group(); Wd.add(hg); hg.add(scr, slab, seal, ...gs.map(g => g.g)); Wd.hero = { group: hg };
  Wd.on(t => {
    scr.scale.x = Math.max(.02, out(pg(t, 0, 1.7)));
    slab.position.y = 11.4 * Math.pow(1 - pg(t, .6, 1.9), 2);
    const rr = pg(t, 1.9, 2.8);
    ring.visible = t >= 1.9 && t < 2.8; ring.scale.setScalar(.5 + 4 * out(rr)); rm.opacity = 1 - rr;
    seal.position.y = lerp(5.2, 2.35, out(pg(t, 2.6, 3.1)));
    gs[0].setAng(.6 + .2 * Math.sin(t * 1.3));
    [1, 2].forEach(i => {
      const g = gs[i]; const d = pg(t, 1.0, 2.6);
      g.face.material = t > .9 ? MAT.grey : MAT.navy;
      g.g.position.set(g.base[0], g.base[1] - 9 * inn(d), g.base[2]);
      g.g.rotation.z = 1.2 * inn(d);
      g.g.visible = t < 2.9;
    });
  });
  sweep(Wd, 4.5, 1.2, 3.5, 3);
  return Object.assign(Wd, { cam: fit(t => { const u = sm(pg(t, 0, 7.19)); return { pos: [.6 * Math.sin(t * .5), 1.6 + 5.4 * u, 13.6 + 1.6 * u], look: [0, 3.4 + 1.0 * u, 0], fov: 44 }; }) });
}

// ---------- a4: two candles (weak / strong), identical coin stacks rise, the scale settles level ----------
function s4() {
  const Wd = space(4, 130);
  const SC = balance(Wd, [0, 0, -1.6], 1.6, 6.0);
  const cL = coinStack(SC.pans[0], [0, -6.5, 5], 7), cR = coinStack(SC.pans[1], [0, -6.5, 5], 7);
  const lights = [];
  const flames = [-1.7, 1.7].map((x, i) => {
    const g = grp(Wd, [x, 0, 3.6]);
    g.add(mk(new THREE.CylinderGeometry(1.1, 1.2, .8, 32), MAT.royal, [0, .4, 0]));
    g.add(mk(new THREE.CylinderGeometry(.42, .42, 2.4, 24), MAT.cream, [0, 2.0, 0]));
    const f = grp(g, [0, 3.5, 0]);
    const core = mk(new THREE.SphereGeometry(i ? .42 : .24, 18, 12), i ? MAT.flameW : MAT.flame);
    f.add(core);
    const halo = mk(new THREE.SphereGeometry(i ? 1.3 : .7, 18, 12), MAT.halo); f.add(halo);
    const pl = new THREE.PointLight(i ? 0xFFD27A : 0xFF9A3A, i ? 3.2 : 1.0, 14); pl.position.set(x, 3.6, 3.6); Wd.add(pl); lights.push(pl);
    return { f, core, halo, i, g };
  });
  const hg = new THREE.Group(); Wd.add(hg); hg.add(SC, ...flames.map(q => q.g)); Wd.hero = { group: hg };
  sweep(Wd, 2.0, 1.4, 4.0, 2.5);
  Wd.on(t => {
    const th = .34 * (1 - out(pg(t, 1.5, 4.0))) * Math.sin(t * 5.2);
    SC.setTilt(th);
    cL.g.position.set(0, lerp(-6.5, -2.1, out(pg(t, .5, 2.2))), lerp(5, 0, out(pg(t, .5, 2.2))));
    cR.g.position.set(0, lerp(-6.5, -2.1, out(pg(t, .5, 2.2))), lerp(5, 0, out(pg(t, .5, 2.2))));
    cL.set(7); cR.set(7);
    flames.forEach(q => {
      const flick = q.i ? 1 + .04 * Math.sin(t * 9) : .5 + .14 * Math.sin(t * 13.1) + .08 * Math.sin(t * 5.7);
      q.core.scale.setScalar(flick); q.halo.scale.setScalar(flick * (q.i ? 1 : .8) + .05 * Math.sin(t * 3));
      lights[q.i].intensity = (q.i ? 3.2 : 1.0) * (.9 + .1 * Math.sin(t * 11 + q.i));
    });
  });
  return Object.assign(Wd, { cam: fit(t => ({ pos: [-5 + 10 * io(pg(t, 0, 5.9)), 3.0, 15.4], look: [0, 3.0, 0], fov: 42 })) });
}

// ---------- a5: the last gauge and the tag crumble into dust; a cut gem rises with rays and orbiting dust ----------
function s5() {
  const Wd = space(5, 160);
  const gA = gauge(Wd, [0, 2.6, 0], 'A_GIL');
  const tg = grp(Wd, [2.0, -.8, .6]); tg.add(mk(new THREE.BoxGeometry(1.6, 1.0, .14), MAT.goldL));
  const R = rng(55), deb = [];
  [[0, 2.6, 0, 26], [2.0, -.8, .6, 14]].forEach(([x, y, z, n]) => {
    for (let i = 0; i < n; i++) {
      const s = .1 + R() * .22;
      const m = mk(new THREE.BoxGeometry(s, s, s), i % 2 ? MAT.goldL : MAT.navy); m.visible = false; Wd.add(m);
      deb.push({ m, o: [x, y, z], v: [(R() - .5) * 6, R() * 5, (R() - .5) * 3], w: [R() * 7, R() * 7, R() * 7] });
    }
  });
  const rayM = new THREE.MeshBasicMaterial({ color: 0xF3D98B, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const gemG = grp(Wd, [0, -6, 0]);
  const gm = mk(new THREE.OctahedronGeometry(1.7, 0), MAT.gem, [0, 0, 0], [0, 0, 0], [1, 1.35, 1]); gemG.add(gm); Wd.hero = { group: gm };
  glow(gemG, [0, 0, -1.5], 11, .8);
  const rays = [];
  for (let k = 0; k < 14; k++) { const r = grp(gemG, [0, 0, 0], [0, 0, k * TAU / 14]); r.add(mk(new THREE.BoxGeometry(.08, 6.5, .02), rayM, [0, 4.4, 0])); rays.push(r); }
  const ORB = 60, op = new Float32Array(ORB * 3), og = new THREE.BufferGeometry();
  og.setAttribute('position', new THREE.BufferAttribute(op, 3));
  const orb = new THREE.Points(og, new THREE.PointsMaterial({ color: 0xF3D98B, size: .13, transparent: true, depthWrite: false, opacity: .9 }));
  orb.frustumCulled = false; Wd.add(orb);
  Wd.on(t => {
    const ts = t - 1.0, dbg = ts >= 0;
    gA.g.visible = t < 1.0; tg.visible = t < 1.0;
    gA.g.scale.setScalar(Math.max(.01, 1 - sm(pg(t, .4, 1.0))));
    deb.forEach(d => {
      if (!dbg || ts > 2.8) { d.m.visible = false; return; }
      d.m.visible = true;
      d.m.position.set(d.o[0] + d.v[0] * ts, d.o[1] + d.v[1] * ts - 1.6 * ts * ts, d.o[2] + d.v[2] * ts);
      d.m.rotation.set(d.w[0] * ts, d.w[1] * ts, d.w[2] * ts);
      d.m.scale.setScalar(Math.max(.01, 1 - ts / 2.8));
    });
    gemG.position.y = lerp(-1.2, 1.6, out(pg(t, .5, 3.2)));
    gm.rotation.y = .9 * t;
    rayM.opacity = .32 * sm(pg(t, 2.2, 3.6)) * (.85 + .15 * Math.sin(t * 2.3));
    rays.forEach((r, k) => { r.rotation.z = k * TAU / 14 + .05 * t; });
    for (let i = 0; i < ORB; i++) {
      const a = i * TAU / ORB + t * (.3 + .25 * (i % 3)), rr = 3.1 + .7 * Math.sin(i * 1.7 + t * .8);
      op[i * 3] = Math.cos(a) * rr; op[i * 3 + 1] = 1.6 + .9 * Math.sin(a * 2 + i); op[i * 3 + 2] = Math.sin(a) * rr;
    }
    og.attributes.position.needsUpdate = true;
  });
  sweep(Wd, 1.6, 1.2, 1.6, 1.5);
  return Object.assign(Wd, { cam: fit(t => ({ pos: [0, 2.9 + .4 * sm(pg(t, 0, 6.44)), 8.4 - .8 * sm(pg(t, 0, 6.44))], look: [0, 1.6, 0], fov: 44 })) });
}

// ---------- a6: a closed Talmud volume drops onto the table, opens, pages flip, light from the pages ----------
function s6() {
  const Wd = space(6, 130);
  Wd.add(mk(new THREE.BoxGeometry(11, .4, 6), MAT.navy, [0, -2.35, 0]));   // table top at y = -2.15
  const key = new THREE.DirectionalLight(0xFFE2A8, 1.5); key.position.set(4, 8, 10); Wd.add(key);      // warm key
  const fill = new THREE.DirectionalLight(0xA9C8FF, .7); fill.position.set(-8, 3, 6); Wd.add(fill);    // cool fill: keeps the navy cover readable
  const bk = makeBook(THREE, { w: 3.0, h: 4.2, t: .9 });   // shared prop, centred on its closed volume
  Wd.add(bk); Wd.hero = { group: bk };
  const dustM = new THREE.MeshBasicMaterial({ color: 0xF3E9D2, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const R = rng(61);
  const dust = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), dustM); m.visible = false; Wd.add(m); return { m, a: R() * TAU, s: .6 + R() * 1.1 }; });
  sweep(Wd, 2.5, 1.2, 1.5, 1.5, .5);   // half strength
  Wd.on(t => {
    const drop = pg(t, 0, 1.0);
    bk.position.y = 6 * Math.pow(1 - drop, 2) + .12 * Math.sin(Math.PI * pg(t, 1.0, 1.5));   // falls, lands at 1.0 s, small hop
    bk.rotation.x = lerp(-.25, -.12, io(pg(t, 1.2, 2.9)));                                    // stands tilted back, then lies a little flatter
    bk.setOpen(pg(t, 1.2, 2.9)); bk.setGlow(pg(t, 1.2, 2.9));
    bk.setFlip(pg(t, 2.9, 5.0));
    const q = pg(t, 1.0, 1.9);
    dustM.opacity = .45 * (1 - q);
    dust.forEach(d => { d.m.visible = q > 0 && q < 1; const r = d.s * q * 1.6; d.m.position.set(Math.cos(d.a) * r, -2.1 + .3 * q * (1 - q), Math.sin(d.a) * r * .6); });
  });
  const dist = t => lerp(8.7, 15, io(pg(t, 1.2, 2.9)));   // closed: ~60% of frame height; pulls back so the open spread fits
  return Object.assign(Wd, { cam: fit(t => ({ pos: [0, .3, dist(t)], look: [0, -.3, 0], fov: 44 })) });
}

film({
  W, H, vault: 'captions_vault.json', xf: .4, fadeIn: false,   // transitions <= 0.4 s; no black open (first frame is already the subject)
  shots: [
    { id: 'a1', dur: 3.62, build: s1 },
    { id: 'a2', dur: 10.32, build: s2 },
    { id: 'a3', dur: 7.19, build: s3 },
    { id: 'a4', dur: 5.9, build: s4 },
    { id: 'a5', dur: 6.44, build: s5 },
    { id: 'a6', dur: 6.27, build: s6 },
  ],
});

// ---------- screen-space text, drawn after the stage each frame (no stage caption: its pill is too small) ----------
// titles: centred, width <= 0.8 W, letter em = 0.085 H; pills: em = 0.093 W (1.5x the stage caption), box bottom at 0.80 H
const FAM = 'Assistant, Heebo, Arial, sans-serif';
const OVERLAY = [   // [vault key, start s, end s, title y as fraction of H from top (omit y = caption pill)]
  { k: 'A_TITLE', a: .5, b: 3.62, y: .845 },
  { k: 'A_DAMAI', a: 3.62, b: 8.62 }, { k: 'A_SHUK', a: 8.62, b: 13.64 },
  { k: 'A_ERKI', a: 13.94, b: 20.83 },
  { k: 'A_KAVUA', a: 17.44, b: 21.13, y: .15 },
  { k: 'A_SHAVIM', a: 21.13, b: 26.73 }, { k: 'A_MESER', a: 27.03, b: 32.73 },
  { k: 'A_MASECHET', a: 33.47, b: 38.17 },
  { k: 'A_YOM', a: 35.37, b: 39.74, y: .14 }, { k: 'A_CTA', a: 38.37, b: 39.74, y: .84 },
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
  for (const it of OVERLAY) {
    if (t < it.a || t >= it.b) continue;
    const s = ovText(it.k); if (!s) continue;
    const a = clamp((t - it.a) / .3, 0, 1) * clamp((it.b - t) / .3, 0, 1);
    g.save(); g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = a;
    if (it.y === undefined) {
      const P = pillLayout(g, s);
      g.globalAlpha = a * .8; g.fillStyle = 'rgba(14,12,26,.82)'; g.beginPath(); g.roundRect(P.rect.x, P.rect.y, P.rect.w, P.rect.h, P.em * .36); g.fill();
      g.globalAlpha = a; g.fillStyle = '#fff';
      P.L.forEach((l, i) => g.fillText(l, W / 2, P.by + P.tp + P.lh * (i + .5)));
    } else {
      let em = H * .085; g.font = `700 ${Math.round(em)}px ${FAM}`;
      const mw = g.measureText(s).width; if (mw > W * .8) { em *= W * .8 / mw; g.font = `700 ${Math.round(em)}px ${FAM}`; }
      const sc = .8 + .2 * out(pg(t, it.a, it.a + .35));
      g.translate(W / 2, it.y * H); g.scale(sc, sc);
      g.lineJoin = 'round'; g.lineWidth = em * .14; g.strokeStyle = 'rgba(8,14,34,.92)'; g.strokeText(s, 0, 0);
      g.fillStyle = '#F6F1E5'; g.fillText(s, 0, 0);
    }
    g.restore();
  }
}
const seekStage = window.__seek, tAbs = t => Math.max(0, (Number(t) || 0) + (window.__T0 || 0));
window.__seek = t => { seekStage(t); drawOverlay(tAbs(t)); };
window.__caption = t => {   // same box as drawn: lets verify_scene measure the pill
  t = tAbs(t);
  const it = OVERLAY.find(o => o.y === undefined && t >= o.a && t < o.b); if (!it) return null;
  const s = ovText(it.k); if (!s) return null;
  const P = pillLayout(document.createElement('canvas').getContext('2d'), s);
  return { id: it.k, text: s, rect: P.rect, canvasW: W, canvasH: H, dir: 'rtl', lang: 'he', alpha: 1 };
};
