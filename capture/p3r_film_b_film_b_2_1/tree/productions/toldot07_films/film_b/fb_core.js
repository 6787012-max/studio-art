/* film_b core: renderer, scene, worlds, actors, helpers. ASCII only. Function of t only (seeded randomness). */
import { THREE, sm, cl, kf, D2R, frac, V, toon, part, ell, tube, lathe, tubeAlong, OL } from '../../../lib/toon3d/toon3d.js';
import * as KT from '../../toldot07_kit/kit07.js';
import { makeRabbiA, makeBoy } from '../../haredi_cast/cast_people.js';
import * as KP from '../../haredi_cast/props_lesson.js';
import * as L from './fb_lib.js';
export { THREE, sm, cl, kf, D2R, frac, V, KT, KP, L };
export const { ease, lerp, lerpv, blinkAt, G, bx } = L;
const { M, rng } = KT;

export const Q = new URLSearchParams(location.search);
export const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
export const W = Q.has('w') ? +Q.get('w') : (HQ ? 1920 : 1280), H = Math.round(W * 9 / 16);
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.autoClear = false;
renderer.setClearColor('#bfe6f7', 1);
document.getElementById('wrap').appendChild(renderer.domElement);
export const scene = new THREE.Scene();
export const cam = new THREE.PerspectiveCamera(32, 16 / 9, 5, 60000);
export const ST = { t: 0, warm: false, faces: new Map() };       // shared frame state
export const ACTIVE = { name: '' };

/* ---------------------------------------------------------------- skies */
export const SKY = { day: KT.makeSky({ palette: 'day' }), winter: KT.makeSky({ palette: 'winter' }), sunset: KT.makeSky({ palette: 'sunset', sunDir: [-0.12, 0.04, -1] }) };
Object.values(SKY).forEach(s => { s.visible = false; scene.add(s); });
{ const fs = SKY.sunset.material.fragmentShader.replace(/c = mix\(c, vec3\(0\.15, 0\.11, 0\.1\)[^;]*;/, ''); SKY.sunset.material.fragmentShader = fs; SKY.sunset.material.needsUpdate = true; }

/* ---------------------------------------------------------------- ground height on the beach (mirror of sandGround) */
export const gy = (x, z) => z < 0 ? -20 : Math.min(z * 0.03, 30) + 18 * Math.sin(x * 0.004) * Math.sin(z * 0.006) * sm(z / 600);
export const PROM_Y = 40, PROM_Z0 = 300, PROM_Z1 = 560;

/* ---------------------------------------------------------------- worlds */
export const WORLD = {};
const addWorld = (name, g, sky, upd) => { g.visible = false; scene.add(g); WORLD[name] = { g, sky, upd: upd || (() => { }) }; return WORLD[name]; };
const cloudsFor = (g, seed0, list, col, tint) => list.forEach(([x, y, z, s], i) => { const c = KT.makeCloud(seed0 + i, { s, col, tint }); c.position.set(x, y, z); g.add(c); });

function dressPromenade(g, season) {
  const W_ = season === 'winter', stone = M(W_ ? '#a9a49a' : '#d8cfbc', '#b0a8a0', 0), top = M(W_ ? '#b8b2a6' : '#e6dcc6', '#b8b0a4', 0), metal = M('#3b4a5a', '#8a93a0', 0);
  L.bx(g, 5200, PROM_Y, PROM_Z1 - PROM_Z0, top, [0, PROM_Y / 2, (PROM_Z0 + PROM_Z1) / 2], 2.4, null, 3);
  L.bx(g, 5200, PROM_Y + 30, 26, stone, [0, (PROM_Y + 30) / 2 - 15, PROM_Z0 - 10], 2.4, null, 3);
  for (let i = 0; i < 52; i++) L.bx(g, 4, PROM_Y - 4, 3, M('#6f685c', '#8a8478', 0), [-2500 + i * 100, PROM_Y / 2 + 6, PROM_Z0 - 22.5], 0);
  // railing + lamp posts
  for (let i = 0; i < 36; i++) { const x = -2400 + i * 140; L.bx(g, 9, 92, 9, metal, [x, PROM_Y + 46, PROM_Z0 + 14], 1.6, null, 2); }
  L.bx(g, 5000, 7, 7, metal, [0, PROM_Y + 94, PROM_Z0 + 14], 1.6, null, 2); L.bx(g, 5000, 6, 6, metal, [0, PROM_Y + 56, PROM_Z0 + 14], 1.4, null, 2); L.bx(g, 5000, 5, 5, metal, [0, PROM_Y + 22, PROM_Z0 + 14], 1.2, null, 2);
  for (const x of [-1150, 760, 1500, -2300, 2400]) { const lp = L.G(g, [x, PROM_Y, PROM_Z0 + 90]); part(lp, tube(6, 5, 230, 10), metal, 1.8); part(lp, ell(30, 13, 30, 14, 10), M('#d9a441', '#d8c4a0'), 2, [0, 244, 0]); part(lp, ell(10, 10, 10, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff4c2' }), 0, [0, 232, 0]); }
  // benches, bins, planters with palms
  for (const x of [-560, 900, -1800, 2000]) { const b = L.G(g, [x, PROM_Y, PROM_Z0 + 160]); L.bx(b, 190, 10, 52, M('#a8703e', '#c49a84'), [0, 46, 0], 1.8); L.bx(b, 190, 46, 8, M('#a8703e', '#c49a84'), [0, 76, -22], 1.8); for (const sx of [-1, 1]) L.bx(b, 12, 46, 46, metal, [sx * 80, 23, 0], 1.4); }
  for (const x of [-100, 1250]) { const bn = L.G(g, [x, PROM_Y, PROM_Z0 + 120]); part(bn, lathe([[0.01, 0], [24, 0], [28, 70], [0.01, 70]], 14), M('#2f6f56', '#8aa8a0'), 2); }
  for (const [x, s] of [[-1500, 0.9], [700, 1.0], [1700, 0.85], [-300, 0.8]]) { const p = KT.makeTree('palm', 3 + Math.floor(x) % 9, s); p.position.set(x, PROM_Y, PROM_Z0 + 230); g.add(p); L.bx(g, 70, 36, 70, M('#c4623a', '#c4aa80'), [x, PROM_Y + 18, PROM_Z0 + 230], 2); }
  // wet puddles and a few crates (bare floor must be dressed)
  const pud = new THREE.MeshBasicMaterial({ color: W_ ? '#7f93a0' : '#b8dff0', transparent: true, opacity: 0.8 });
  for (const [x, z, r] of [[-200, 420, 70], [260, 450, 90], [700, 410, 60], [-900, 470, 80], [1300, 440, 70]]) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20).rotateX(-Math.PI / 2), pud); m.position.set(x, PROM_Y + 0.8, z); m.scale.z = 0.5; g.add(m); }
  for (const [x, z] of [[-800, 520], [1000, 530]]) { L.bx(g, 60, 50, 60, M('#c08a56', '#c49a84'), [x, PROM_Y + 25, z], 1.8); L.bx(g, 50, 40, 50, M('#d9a55a', '#c49a84'), [x + 8, PROM_Y + 70, z], 1.8, [0, 0.4, 0]); }
}

function beachWorld(name, season, palette, sky) {
  const g = new THREE.Group(), winter = season === 'winter';
  const B = KT.makeBeach({ season, palette }); g.add(B.root);
  g.add(KT.makeHills({ a0: 0.22, a1: Math.PI - 0.22, dists: [5200, 7600, 10200], base: winter ? '#8aa06a' : '#7fb85a', haze: winter ? '#bcc6cc' : '#cfe6f2', h: 900 }));
  dressPromenade(g, season);
  // dune dressing: palms, tamarisk, bushes (beyond the promenade)
  const r = rng(77);
  [[-1300, 1060, 'palm', 1], [900, 1120, 'palm', 1.1], [2100, 1000, 'palm', 0.9], [-2400, 1100, 'palm', 1], [100, 1250, 'tamarisk', 1], [-700, 1180, 'pine', 1.1], [1500, 1220, 'pine', 0.9]].forEach(([x, z, k, s], i) => { const t = KT.makeTree(k, i + 5, s); t.position.set(x, gy(x, z), z); g.add(t); });
  for (let i = 0; i < 14; i++) { const b = KT.makeBush(i + 3, { flowers: i % 3 ? null : '#f6a8c0', s: 0.9 + r() * 0.6 }); const x = -2600 + r() * 5200, z = 700 + r() * 500; b.position.set(x, gy(x, z), z); g.add(b); }
  const clouds = winter ? [[-2400, 1500, -6000, 4], [600, 1700, -7000, 4.4], [3200, 1400, -5200, 3.6], [-800, 1900, -4200, 3.2]] : [[-2600, 1500, -6200, 3], [1800, 1900, -7000, 3.4], [4200, 1300, -4800, 2.6], [-700, 1700, -5200, 2.4], [300, 2100, -8000, 3.6]];
  cloudsFor(g, 40, clouds, winter ? '#9aa6b2' : '#ffffff', winter ? '#737f8c' : '#dfe6f2');
  const birds = KT.makeBirds({ n: 5, r: 700, y: 760, seed: 4 }); birds.position.set(-500, 0, -700); g.add(birds); birds.visible = false;
  const out = { g, B, sea: B.sea, birds, boats: [], season, winter };
  // fishing boats on the sea (summer)
  if (!winter) { [[-1100, -900, '#e8f0f4', 3], [-300, -1500, '#f4e3c0', 4], [900, -1100, '#e8f0f4', 5]].forEach(([x, z, c, sd]) => { const b = KT.makeFishingBoat(c, sd); g.add(b); out.boats.push({ b, x, z, yaw: 0.4 + sd * 0.5 }); }); }
  // pier (summer only), land end at z=+40, runs to z=-660
  if (!winter) { const pier = L.makePier(700); pier.position.set(650, 0, 40); g.add(pier); out.pier = pier; }
  // storm extras: giant curl waves and a hero wave next to a house
  if (winter) {
    out.giants = [[-900, -1500, 380, 0.05], [800, -2100, 520, -0.1], [-300, -2900, 640, 0.0], [1700, -1300, 330, 0.0]].map(([x, z, h, ry], i) => { const w = KT.makeCurlWave({ w: 1500, h, col: '#2f5878', light: '#5b88a3' }); w.position.set(x, -10, z); w.rotation.y = -Math.PI / 2 + ry; w.visible = false; g.add(w); return { w, h }; });
    out.hero = KT.makeCurlWave({ w: 1500, h: 710, col: '#2f5878', light: '#5b88a3' }); out.hero.position.set(0, -10, -520); out.hero.rotation.y = -Math.PI / 2; out.hero.visible = false; g.add(out.hero);
    out.house = L.makeHouse(); out.house.position.set(0, PROM_Y, 520); out.house.visible = false; g.add(out.house);
    out.dark = KT.makeCloud(90, { s: 7, col: '#8d98a5', tint: '#6f7b88' }); out.dark.position.set(-300, 1500, -3600); g.add(out.dark);
  }
  if (out.pier) { }
  out.update = (t, A, foamS) => { B.update(t); B.sea.update(t, A); if (foamS != null) B.foam.update(t, foamS); birds.userData.update(t);
    out.boats.forEach(o => { const f = B.sea.float(o.x, o.z, 90); o.b.position.set(o.x, f.y - 10, o.z); o.b.rotation.set(f.rx, o.yaw, f.rz); }); };
  return addWorld(name, g, sky, null) && Object.assign(WORLD[name], out);
}
beachWorld('beachS', 'summer', null, 'day');
beachWorld('beachW', 'winter', null, 'winter');
beachWorld('sunset', 'summer', 'sunset', 'sunset');
{ const s = WORLD.sunset; s.g.children.forEach(o => { if (o.position.z > 270 && o.position.z < 600 && o.position.y < 200 && o !== s.B.root) o.visible = false; }); s.sea.mat.uniforms.uFogN.value = 700; s.sea.mat.uniforms.uFogF.value = 4200; s.birds.visible = false; }

{ const r = WORLD.beachW.B.rain; if (r) r.visible = false; }
/* mirror sheen (calm-sea look) on the summer beach */
{ const m = L.makeMirror(); m.position.set(0, 0.8, -1500); m.userData.setOp(0); WORLD.beachS.g.add(m); WORLD.beachS.mirror = m;
  WORLD.beachS.refl = WORLD.beachS.boats.map(o => { const e = new THREE.Mesh(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#2f6a9a', transparent: true, opacity: 0.0, depthWrite: false })); e.scale.set(70, 1, 120); e.position.set(o.x, 1.4, o.z + 110); e.renderOrder = 2; WORLD.beachS.g.add(e); return e; }); }

/* open sea (b1 end, b2) */
{
  const g = new THREE.Group(), OS = KT.makeOpenSea({ A0: 6 }); g.add(OS.root);
  cloudsFor(g, 11, [[-2600, 1500, -5200, 3], [1800, 1900, -6400, 3.4], [4200, 1300, -3800, 2.6], [-800, 1700, -7000, 3], [300, 2200, -8200, 3.4]]);
  const far = [[-2800, -3000, '#e8f0f4', 3], [2600, -4200, '#f4e3c0', 5]].map(([x, z, c, s]) => { const b = KT.makeFishingBoat(c, s); g.add(b); return { b, x, z, yaw: 0.6 + s }; });
  const birds = KT.makeBirds({ n: 4, r: 600, y: 700, seed: 6 }); birds.position.set(-300, 0, -900); g.add(birds);
  const w = addWorld('open', g, 'day', null); Object.assign(w, { OS, sea: OS.sea, far, birds });
  w.update = (t, A, calm) => { OS.update(t, A); if (calm) OS.sea.setCalm(calm[0], calm[1], calm[2], calm[3], calm[4]); else OS.sea.setCalm(0, 0, 0, 0, 1); birds.userData.update(t);
    far.forEach(o => { const f = OS.sea.float(o.x, o.z, 90); o.b.position.set(o.x, f.y - 10, o.z); o.b.rotation.set(f.rx, o.yaw, f.rz); }); };
}

/* rooms */
{ const kit = L.makeRoom('kitchen'), g = new THREE.Group(); g.add(kit.root);
  // table with the bowl
  const tb = L.G(g, [60, 0, 60]); const wood = M('#a8703e', '#c49a84'), woodD = M('#7e4f2a', '#b08a7a');
  L.bx(tb, 330, 12, 230, wood, [0, 84, 0], 2.4); for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.bx(tb, 14, 80, 14, woodD, [sx * 145, 40, sz * 95], 2);
  L.bx(tb, 300, 10, 8, woodD, [0, 70, 100], 1.4); L.bx(tb, 300, 10, 8, woodD, [0, 70, -100], 1.4);
  const bowl = L.makeBowl(); bowl.position.set(0, 90, 0); bowl.scale.setScalar(0.85); tb.add(bowl); tb.position.y = -30;
  // loaf, mugs, cloth on the table
  const loaf = L.G(tb, [-120, 90, 70]); part(loaf, ell(42, 20, 24, 18, 12), M('#d9a55a', '#c4aa80'), 2, [0, 18, 0]);
  const mug = L.G(tb, [118, 90, -64]); part(mug, lathe([[0.01, 0], [15, 0], [17, 30], [0.01, 30]], 14), M('#59a0a6', '#a8c0c8'), 1.8);
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(120, 90).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#d9604e' })); cloth.position.set(-110, 90.8, -60); cloth.rotation.y = 0.3; tb.add(cloth);
  const w = addWorld('kitchen', g, null, null); Object.assign(w, { room: kit, bowl, tb });
  w.update = (t, A, mode, amp) => { kit.update(t, mode || 'day', amp == null ? 0.05 : amp, 0); bowl.userData.update(t, A); };
}
{ const st = L.makeRoom('study'), g = new THREE.Group(); g.add(st.root);
  const sh = L.makeSeferStand(KP); sh.root.position.set(330, 0, -120); sh.root.rotation.y = -1.82; g.add(sh.root);
  const glow = L.makeGlow('#ffe9a0', 100, { alpha: 0.5 }); glow.position.set(1, 8, 0); sh.root.userData.book.add(glow);
  const sp = L.makeSparkles(10, 70, 4); sp.position.set(0, 14, 0); sh.root.userData.book.add(sp);
  const table = KP.makeTableSefarim(); table.root.position.set(-650, 0, 80); table.root.rotation.y = Math.PI / 2; table.root.scale.setScalar(0.95); g.add(table.root);
  const cand = KP.makeCandlesticks(); cand.root.position.set(-650, 99, 80); g.add(cand.root);
  const bench = KP.makeBench(); bench.root.position.set(700, 0, -300); bench.root.rotation.y = -Math.PI / 2 + 0.2; g.add(bench.root);
  const w = addWorld('study', g, null, null); Object.assign(w, { room: st, stand: sh, glow, sp });
  w.update = (t, mode, amp, rain, glowK) => { st.update(t, mode || 'day', amp == null ? 0.2 : amp, rain || 0); glow.userData.update(t, glowK == null ? 1 : glowK); sp.userData.update(t, glowK == null ? 1 : glowK); };
}

/* section worlds */
{
  const g = new THREE.Group();
  const sec = L.makeSection({ bed: x => -430 - 20 * Math.sin(x * 0.0021) });
  g.add(sec.root);
  const bg = KT.makeSea({ A: 3, palette: 'summer', pos: [0, -34, -6300] }); bg.mesh.scale.z = 0.5; g.add(bg.mesh);
  cloudsFor(g, 120, [[-2200, 1000, -3800, 2.6], [1700, 1250, -4400, 3], [200, 1500, -5400, 3.4]]);
  const hills = KT.makeHills({ a0: 1.9, a1: 3.3, dists: [6000, 8200], base: '#7fb85a', haze: '#cfe6f2', h: 700 }); g.add(hills); hills.position.set(0, 0, 0);
  // dock on the right for the boy
  const dock = L.G(g, [1850, 0, 0]);
  L.bx(dock, 700, 22, 340, M('#b98350', '#c49a84'), [0, 150, 0], 2.2, null, 3); for (let i = 0; i < 5; i++) L.bx(dock, 8, 24, 340, M('#7e4f2a', '#b08a7a'), [-300 + i * 150, 150, 0], 0);
  for (const x of [-300, 0, 300]) for (const z of [-130, 130]) part(dock, tube(14, 14, 590, 10), M('#6a4326', '#a08070'), 1.8, [x, 140, z]);
  L.bx(dock, 700, 10, 10, M('#6a4326', '#a08070'), [0, 230, 150], 1.6); for (let i = 0; i < 6; i++) L.bx(dock, 9, 70, 9, M('#6a4326', '#a08070'), [-300 + i * 120, 190, 150], 1.4);
  // marker post (stays in place) near the bottle
  const post = L.G(g, [250, 0, 40]); part(post, tube(10, 10, 520, 10), M('#8a5a3a', '#b08a7a'), 2, [0, 70, 0]); for (let k = 0; k < 4; k++) L.bx(post, 26, 12, 26, k % 2 ? M('#f4f0e0', '#c8c8c8', 0) : M('#d9604e', '#b08a9a', 0), [0, 22 + k * 12, 0], 0);
  part(post, ell(14, 14, 14, 10, 8), M('#d9604e', '#b08a9a', 0), 1.6, [0, 82, 0]);
  { const rr = rng(33), bedf = x => -430 - 20 * Math.sin(x * 0.0021);
    for (let i = 0; i < 40; i++) { const x = -2300 + i * 120 + rr() * 70, k = i % 4, q = k === 0 ? KT.makeReeds ? KT.makeReeds(i + 5, { h: 150 + rr() * 90 }) : KT.makeStone(i, 1) : k === 1 ? KT.makeStone(200 + i, 0.8 + rr() * 1.2) : KT.makeStone(300 + i, 0.6 + rr()); q.position.set(x, bedf(x) - 2, 20 + rr() * 100); g.add(q); } }
  const w = addWorld('section3', g, 'day', null); Object.assign(w, { sec, bg, dock, post });
}
{
  const g = new THREE.Group();
  const bed = x => { const u = cl((x + 1500) / 2400, 0, 1); let y = -520 * Math.pow(1 - u, 1.8); if (x > 900) y += 0.12 * (x - 900) + 70 * sm((x - 900) / 600); return y; };
  const sec = L.makeSection({ x0: -2600, x1: 2800, nx: 230, bed });
  g.add(sec.root);
  const bg = KT.makeSea({ A: 3, palette: 'summer', pos: [0, -34, -6300] }); bg.mesh.scale.z = 0.5; g.add(bg.mesh);
  cloudsFor(g, 130, [[-2200, 1000, -3800, 2.6], [1700, 1250, -4400, 3], [200, 1500, -5400, 3.4]]);
  // dune dressing on the sand at the right: palm, tufts, shells
  const palm = KT.makeTree('palm', 11, 0.75); palm.position.set(1900, bed(1900), 20); g.add(palm);
  for (let i = 0; i < 9; i++) { const x = 1100 + i * 170, tf = KT.makeGrassTuft(i + 20, { h: 50, n: 8 }); tf.position.set(x, bed(x), 10 + (i % 3) * 30); g.add(tf); }
  const st = KT.makeStone(88, 1.2); st.position.set(1500, bed(1500), 40); g.add(st);
  { const rr = rng(61); for (let i = 0; i < 26; i++) { const x = -1700 + i * 118 + rr() * 60, q = KT.makeStone(100 + i, 0.5 + rr() * 0.6); q.position.set(x, bed(x) - 4, 28 + rr() * 150); g.add(q); } }
  // spark dashes (wave base friction) + foam balls
  const sparks = [], sm1 = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(46, 7), sm1); m.visible = false; m.renderOrder = 4; g.add(m); sparks.push(m); }
  const fm = M('#ffffff', '#cfd8ea', 0), foam = [];
  for (let i = 0; i < 80; i++) { const m = L.G(g); part(m, ell(14, 12, 12, 10, 8), fm, 1.6); m.visible = false; foam.push(m); }
  const w = addWorld('section4', g, 'day', null); Object.assign(w, { sec, bg, bed, sparks, foam });
}

/* ---------------------------------------------------------------- actors */
export const AC = {};
const reg = (id, o, people) => { AC[id] = { id, o, people: !!people }; scene.add(o.root); o.root.visible = false; return AC[id]; };
reg('rabbi', makeRabbiA(), true); reg('boy', makeBoy(), true);
reg('tipa', KT.makeTipa()); reg('tipaB', KT.makeTipa({ kind: 'sea' })); reg('tipaS', KT.makeTipa({ kind: 'small' }));
reg('gull', KT.makeGull()); reg('gull2', KT.makeGull()); reg('crab', KT.makeCrab());
reg('gust', KT.makeGust()); reg('gustD', KT.makeGust());
for (let i = 0; i < 9; i++) reg('grain' + i, KT.makeGrain());
for (let i = 0; i < 3; i++) reg('fish' + i, KT.makeFish());
{ // dark storm gust: recolour every toon material that has a base colour
  AC.gustD.o.root.traverse(m => { if (m.material && m.material.uniforms && m.material.uniforms.uColor) { const u = m.material.uniforms; const c = u.uColor.value; if (c.r > 0.8) { u.uColor.value = new THREE.Color('#aab4be'); u.uTint.value = new THREE.Color('#7c8894'); } else if (c.b > 0.8 && c.r < 0.7) { u.uColor.value = new THREE.Color('#7c8894'); } } });
}
// bottles (6 for the row; #0 also used on the pier). Empty: only glass + cork.
export const bottles = []; for (let i = 0; i < 7; i++) { const b = KT.makeBottle(), body = b.userData.body; body.children.slice(3).forEach(c => body.remove(c)); b.visible = false; scene.add(b); bottles.push(b); }
// shared one-off props
export const splash = KT.makeSplash({ r: 80 }); splash.visible = false; scene.add(splash);
export const splash2 = KT.makeSplash({ r: 50 }); splash2.visible = false; scene.add(splash2);
// ruler + hero helpers
export const ruler = L.makeRuler(64); ruler.visible = false; scene.add(ruler);
// big foam sheet for the beach slide (c4 of b4) and the grain wave wall
export const foamBig = KT.makeFoamLine({ len: 5200, z0: -10, width: 300 }); foamBig.mesh.visible = false; WORLD.beachS.g.add(foamBig.mesh);
// soft-edged foam sheet (canvas alpha texture) for the curl-wave close-ups: fades to the sand, no hard rectangle
export const foamSoft = (() => { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; const c = cv.getContext('2d'); let sd = 7; const rn = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
  for (let i = 0; i < 1500; i++) { const x = rn() * 1024, y = Math.pow(rn(), 1.7) * 512, r = 8 + rn() * 26 * (1 - y / 700), g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.6, 'rgba(240,248,255,0.7)'); g.addColorStop(1, 'rgba(240,248,255,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.globalCompositeOperation = 'destination-in'; const mk = c.createLinearGradient(0, 0, 1024, 0); mk.addColorStop(0, 'rgba(0,0,0,0)'); mk.addColorStop(0.18, 'rgba(0,0,0,1)'); mk.addColorStop(0.82, 'rgba(0,0,0,1)'); mk.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = mk; c.fillRect(0, 0, 1024, 512);
  const mv2 = c.createLinearGradient(0, 0, 0, 512); mv2.addColorStop(0, 'rgba(0,0,0,1)'); mv2.addColorStop(0.55, 'rgba(0,0,0,0.85)'); mv2.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = mv2; c.fillRect(0, 0, 1024, 512);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2600, 1100).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })); m.renderOrder = 3; m.visible = false; WORLD.beachS.g.add(m); return m; })();
export const wallWave = KT.makeCurlWave({ w: 1400, h: 150 }); wallWave.visible = false; WORLD.beachS.g.add(wallWave);
export const swell = [0, 1, 2, 3, 4].map(i => { const w = KT.makeCurlWave({ w: 1500, h: 70 + 12 * i, col: '#3e8fd0', light: '#64c0ea' }); w.visible = false; w.rotation.y = -Math.PI / 2; WORLD.beachS.g.add(w); return w; });
export const stormCloud = KT.makeCloud(95, { s: 6, col: '#4d5864', tint: '#39424c' }); stormCloud.visible = false; WORLD.beachS.g.add(stormCloud);
export const rain1 = KT.makeRain({ w: 1800, d: 1500, h: 1400, n: 420, col: '#cfe0ee', r: 3, seed: 12 }); rain1.visible = false; WORLD.beachS.g.add(rain1);
export const hugeSplash = KT.makeSplash({ r: 220 }); hugeSplash.visible = false; scene.add(hugeSplash);
export const fgGrass = KT.makeFgBlur('grass', { w: 260, h: 160, col: '#6f9a4a', blur: 7 }); export const fgRock = KT.makeFgBlur('rock', { w: 260, h: 170, col: '#6b655c', blur: 8 }); export const fgLeaves = KT.makeFgBlur('leaves', { w: 260, h: 170, col: '#5a8a46', blur: 7 });
[fgGrass, fgRock, fgLeaves].forEach(f => { f.visible = false; scene.add(f); });


export const AUTOHIDE0 = [];
/* ---------------------------------------------------------------- put actors (warm mode records face states) */
const qlook = l => l ? [Math.round(l[0] * 4) / 4, Math.round(l[1] * 4) / 4] : [0, 0];
export function put(id, po, face) {
  const a = AC[id]; face = Object.assign({}, face); if (face.look) face.look = qlook(face.look);
  if (ST.warm) { const k = id + JSON.stringify(face); if (!ST.faces.has(k)) ST.faces.set(k, [a, face]); return; }
  a.o.pose(Object.assign({ t: ST.t }, po)); if (a.people) a.o.root.position.y = po.y || 0;
  a.o.root.visible = true; if (po.scale) a.o.root.scale.setScalar(po.scale); else a.o.root.scale.setScalar(1); a.o.face.set(face);
}
export const talk = (t, a, b, rate) => (t > a && t < b && frac(t * 0.9) < 0.74) ? 'AEOXUM'[Math.floor(t * (rate || 9)) % 6] : null;
export const REST = { l: { sz: 0.08 }, r: { sz: 0.08 } };
export const AUTOHIDE = [];
export const hideAll = () => { AUTOHIDE.forEach(o => { o.visible = false; }); Object.values(AC).forEach(a => { a.o.root.visible = false; }); bottles.forEach(b => b.visible = false); [splash, splash2, hugeSplash, ruler, fgGrass, fgRock, fgLeaves].forEach(o => o.visible = false); };

/* ---------------------------------------------------------------- HUD (2D overlay drawn per frame) */
export const hudCv = document.createElement('canvas'); hudCv.width = W; hudCv.height = H;
export const hx = hudCv.getContext('2d');
const hudTex = new THREE.CanvasTexture(hudCv); hudTex.colorSpace = THREE.NoColorSpace;
const hudScene = new THREE.Scene(), hudCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
export const hudMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: hudTex, transparent: true, depthTest: false, depthWrite: false })); hudScene.add(hudMesh);
export const HUD = { on: false };
export const scr = v => { const p = v.clone().project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; };
export function hudBegin() { hx.clearRect(0, 0, W, H); HUD.on = false; }
export function hudEnd() { hudMesh.visible = HUD.on; if (HUD.on) hudTex.needsUpdate = true; }
export function renderHud() { if (!HUD.on) return; renderer.clearDepth(); renderer.render(hudScene, hudCam); }
/* outlined bold text */
export function txt(s, x, y, size, o) { o = o || {}; HUD.on = true; hx.save(); hx.translate(x, y); hx.scale(o.k || 1, o.k || 1); hx.font = `900 ${size}px "Arial Black", Arial, sans-serif`; hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.lineJoin = 'round';
  hx.lineWidth = size * 0.22; hx.strokeStyle = '#261c19'; hx.strokeText(s, 0, 0); hx.fillStyle = o.col || '#fff6d6'; hx.fillText(s, 0, 0); hx.restore(); }
export const px = v => v * W / 1920;
const hsh = n => { const q = Math.sin(n * 127.1 + 311.7) * 43758.5453; return q - Math.floor(q); };
/* thin storm rain streaks drawn on the HUD, 30 degrees from vertical (replaces the kit rain bars) */
export function rainHud(t, k) {
  k = k == null ? 1 : k; if (k <= 0) return; HUD.on = true; hx.save(); hx.lineCap = 'round'; hx.strokeStyle = 'rgba(232,242,250,' + (0.5 * k).toFixed(3) + ')'; hx.lineWidth = Math.max(1.5, px(2.6));
  const T30 = Math.tan(Math.PI / 6);
  for (let i = 0; i < 170; i++) { const sp = 0.7 + 0.8 * hsh(i * 3.1), len = px(46 + 70 * hsh(i * 5.7)), y0 = ((hsh(i) + t * 0.55 * sp) % 1) * (H + len * 2) - len;
    const xx = hsh(i * 1.7 + 9) * (W + H * T30 + 200) - 100 - y0 * T30 + H * T30 * 0.5; hx.beginPath(); hx.moveTo(xx, y0); hx.lineTo(xx - len * 0.5, y0 + len * 0.866); hx.stroke(); }
  hx.restore();
}

AUTOHIDE.push(foamBig.mesh, foamSoft, wallWave, stormCloud, rain1, ...swell, WORLD.beachW.hero, WORLD.beachW.house, ...WORLD.beachW.giants.map(g => g.w), WORLD.beachS.mirror);
