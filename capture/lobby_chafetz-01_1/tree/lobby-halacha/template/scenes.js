// scenes.js - 3D scene presets for the lobby-halacha template (classroom / yard / home / text + opening + summary).
// Built on C:/projects/_studio-animatzia/lib/stage3d.js (not modified). Boys only: no women, no girls.
// Every scene is a function of the local time t only (deterministic, no Math.random / Date).
import { THREE, world, box, cyl, ball, toon, canvasTex, groundTex, person, cloud, clamp, lerp, ease, prog, rng } from '../../_studio-animatzia/lib/stage3d.js';

export const FONT = 'Assistant, Heebo, sans-serif';
const PI = Math.PI, D = PI / 180, V2 = (x, y) => new THREE.Vector2(x, y);
const memo = {}; const once = (k, f) => (k in memo) ? memo[k] : (memo[k] = f());

// ---------------------------------------------------------------- text fitting (shared with the overlay in film.html)
export function wrapWords(g, s, maxW) {
  const w = String(s).split(/\s+/).filter(Boolean), L = []; let cur = '';
  for (const x of w) { const t = cur ? cur + ' ' + x : x; if (g.measureText(t).width > maxW && cur) { L.push(cur); cur = x; } else cur = t; }
  if (cur) L.push(cur); return L;
}
// o: {maxW, maxLines, max, min, lh, weight, maxH}. Shrinks the font until it fits; below `min` it keeps shrinking so nothing is ever cut off.
export function fitText(g, text, o) {
  const fits = size => { g.font = `${o.weight || 700} ${size}px ${FONT}`; const L = wrapWords(g, text, o.maxW);
    const ok = L.length <= o.maxLines && (!o.maxH || L.length * size * o.lh <= o.maxH) && L.every(l => g.measureText(l).width <= o.maxW); return { ok, L }; };
  let size = o.max, r = fits(size);
  while (!r.ok && size > 24) { size -= 2; r = fits(size); }
  return { size, lines: r.L };
}

// ---------------------------------------------------------------- cameras
export function cine(keys) {   // keys: [t, [x,y,z] target, dist, height, angleDeg, fov, lookYOffset]
  const K = keys.map(k => ({ t: k[0], v: [k[1][0], k[1][1], k[1][2], k[2], k[3], k[4], k[5] === undefined ? 45 : k[5], k[6] || 0] })), n = K.length;
  const dd = (i, j) => (K[i + 1].v[j] - K[i].v[j]) / (K[i + 1].t - K[i].t), tn = K.map((k, i) => k.v.map((_, j) => { if (i === 0 || i === n - 1) return 0; const a = dd(i - 1, j), b = dd(i, j); return a * b > 0 ? 2 * a * b / (a + b) : 0; }));
  return t => { let i = 0; while (i < n - 2 && t > K[i + 1].t) i++; const dt = K[i + 1].t - K[i].t, s = clamp((t - K[i].t) / dt, 0, 1), s2 = s * s, s3 = s2 * s;
    const v = K[i].v.map((_, j) => (2 * s3 - 3 * s2 + 1) * K[i].v[j] + (s3 - 2 * s2 + s) * dt * tn[i][j] + (-2 * s3 + 3 * s2) * K[i + 1].v[j] + (s3 - s2) * dt * tn[i + 1][j]), a = v[5] * D;
    return { pos: [v[0] + Math.sin(a) * v[3], v[1] + v[4], v[2] + Math.cos(a) * v[3]], look: [v[0], v[1] + v[7], v[2]], fov: v[6] }; };
}
// camera programs; c = [cx, cz] centre of the action. Time fractions are scaled to the beat length; odd beats are mirrored.
const PROG = {
  classroom: [c => [[0, [c[0], .8, c[1]], 5.0, 1.3, -30, 44], [1, [c[0], .85, c[1]], 3.2, .7, 18, 40]],
    c => [[0, [c[0], .8, c[1]], 4.3, .9, 42, 44], [.5, [c[0], .85, c[1]], 3.6, .5, 0, 42], [1, [c[0], .8, c[1]], 4.3, 1.0, -38, 44]],
    c => [[0, [c[0], .7, c[1]], 3.0, .2, -16, 46], [1, [c[0], .9, c[1]], 4.8, 1.6, 26, 44]]],
  yard: [c => [[0, [c[0], .8, c[1]], 8.5, 1.6, -35, 44], [1, [c[0], .85, c[1]], 4.6, .8, 20, 40]],
    c => [[0, [c[0], .8, c[1]], 5.5, 1.0, 50, 44], [.5, [c[0], .85, c[1]], 5.0, 1.2, 0, 42], [1, [c[0], .8, c[1]], 6.5, 1.6, -45, 44]],
    c => [[0, [c[0], .7, c[1]], 4.0, .3, -20, 46], [1, [c[0], 1.0, c[1]], 9.0, 2.6, 28, 44]]],
  home: [c => [[0, [c[0], .85, c[1]], 3.6, 1.1, -34, 42], [1, [c[0], .9, c[1]], 2.6, .55, 14, 38]],
    c => [[0, [c[0], .85, c[1]], 2.7, .5, 36, 42], [.5, [c[0], .9, c[1]], 3.0, .7, 0, 40], [1, [c[0], .85, c[1]], 3.6, 1.2, -40, 42]],
    c => [[0, [c[0], .8, c[1]], 2.4, .25, -12, 44], [1, [c[0], .95, c[1]], 3.9, 1.5, 30, 42]]],
  text: [c => [[0, [c[0], 1.7, c[1]], 6.2, .3, -28, 42], [1, [c[0], 1.7, c[1]], 5.4, .1, 8, 42]],
    c => [[0, [c[0], 1.7, c[1]], 5.5, .1, 30, 42], [1, [c[0], 1.7, c[1]], 6.4, .5, -24, 42]],
    c => [[0, [c[0], 1.7, c[1]], 6.0, -.1, -8, 42], [.5, [c[0], 1.7, c[1]], 5.4, .2, 22, 42], [1, [c[0], 1.7, c[1]], 6.0, .4, -20, 42]]],
};
function camFor(kind, idx, dur, c) {
  const P = PROG[kind], keys = P[idx % P.length](c), m = (idx % 2) ? -1 : 1;
  return cine(keys.map(k => [k[0] * dur, k[1].slice(), k[2], k[3], k[4] * m, k[5], k[6]]));
}

// ---------------------------------------------------------------- world + textures
function mkWorld(o) {
  const Wd = world(Object.assign({ skyTop: 0x6fb4f0, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 30, fogFar: 130, sun: 1.9, sunPos: [-14, 26, 16], hemi: 1.5, hemiSky: 0xfffbf0, hemiGround: 0x9a8660, shadowExt: 16, skyR: 300 }, o));
  Wd.sun.shadow.mapSize.set(1024, 1024);
  Wd.on((t, cam) => { Wd.sky.position.copy(cam.position); });
  return Wd;
}
const glowTex = () => once('glow', () => canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,236,170,.95)'); r.addColorStop(1, 'rgba(255,200,90,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); }));
function glowSprite(w, h, opacity) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, opacity: opacity || 1 }));
  s.scale.set(w, h, 1); return s;
}
const planksTex = rep => once('plank' + rep, () => { const r = rng(31); return canvasTex(256, 256, (g, w, h) => { const cols = ['#c99a66', '#bd8c58', '#d3a574', '#b5844f'];
  for (let y = 0; y < h; y += 32) { let x = -r() * 120; while (x < w) { const bw = 120 + r() * 140; g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(x, y, bw, 32); g.fillStyle = 'rgba(80,50,20,.45)'; g.fillRect(x, y, 2, 32); x += bw; } g.fillStyle = 'rgba(80,50,20,.5)'; g.fillRect(0, y, w, 2); } }, rep); });
const booksTex = seed => once('books' + seed, () => { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#6b4526'; g.fillRect(0, 0, w, h); const rows = 6, rh = (h - 16) / rows, pal = ['#8a2a2a', '#244a86', '#2f6a3a', '#6a4a2a', '#7b2a5a', '#2a2a36', '#9a7a30', '#4a3470', '#a84a22'];
  for (let i = 0; i < rows; i++) { const y0 = 8 + i * rh; g.fillStyle = '#3a2210'; g.fillRect(10, y0, w - 20, rh - 10); let x = 12;
    while (x < w - 16) { const bw = 9 + r() * 15, bh = (rh - 14) * (.72 + r() * .26); if (x + bw > w - 12) break; g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x, y0 + rh - 10 - bh, bw - 1.5, bh); g.fillStyle = '#e3bd62'; g.fillRect(x + 1, y0 + rh - 10 - bh + bh * .12, bw - 3.5, 2.2); x += bw; }
    g.fillStyle = '#8a5a30'; g.fillRect(0, y0 + rh - 10, w, 10); } g.strokeStyle = '#4a2c14'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }); });
const skyPanelTex = () => once('skypanel', () => canvasTex(128, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fd0ff'); gr.addColorStop(1, '#f4fbff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, y, r] of [[30, 150, 22], [60, 144, 28], [92, 154, 20], [70, 60, 16], [95, 54, 12]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }));
function archShape(w, h) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, PI, false); s.lineTo(-w / 2, 0); return s; }
const bm = (color, o) => new THREE.MeshBasicMaterial(Object.assign({ color, fog: false }, o || {}));

function windowUnit(Wd, x, y0, z, ry, w, h) {   // glowing arched window on a wall, facing +z when ry = 0
  const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.y = ry; Wd.add(g);
  const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
  const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), bm(0xffffff, { map: skyPanelTex() })); pn.position.z = .02;
  const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
  g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .05], ink: false }));
  g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
}

// ---------------------------------------------------------------- rooms
function hall(Wd, o) {   // long hall (yeshiva corridor / beit midrash). Long axis = x, window wall at z = -HZ, bookcases at z = +HZ.
  o = o || {}; const L = 30, HZ = 6.5, H = 4.8;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(L, 2 * HZ), toon(0xffffff, { map: planksTex([10, 4.4]) })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; Wd.add(fl);
  Wd.add(box(L, 0.006, 2.4, 0xb04a3c, { pos: [0, .003, 0], ink: false })); Wd.add(box(L, 0.008, .12, 0xe0b552, { pos: [0, .004, 1.25], ink: false })); Wd.add(box(L, 0.008, .12, 0xe0b552, { pos: [0, .004, -1.25], ink: false }));
  const wallC = 0xf3e7cc;
  Wd.add(box(L, H, .4, wallC, { pos: [0, H / 2, -HZ - .2], ink: false })); Wd.add(box(L, H, .4, wallC, { pos: [0, H / 2, HZ + .2], ink: false }));
  for (const sx of [-1, 1]) Wd.add(box(.4, H, 2 * HZ, wallC, { pos: [sx * (L / 2 + .2), H / 2, 0], ink: false }));
  Wd.add(box(L, 1.1, .14, 0xb98a58, { pos: [0, .55, -HZ + .07], ink: false })); Wd.add(box(L, 1.1, .14, 0xb98a58, { pos: [0, .55, HZ - .07], ink: false }));
  for (let x = -12; x <= 12.1; x += 4) { windowUnit(Wd, x, 1.0, -HZ + .02, 0, 1.7, 2.9); Wd.add(box(.5, H, .3, 0xe6d6b2, { pos: [x + 2, H / 2, -HZ + .15], ink: false })); }
  for (let x = -12.5; x <= 12.6; x += 4.2) { if (Math.abs(x) < 1.2) continue;
    Wd.add(box(3.7, 3.7, .55, 0x7a4a2a, { pos: [x, 1.85, HZ - .3] }));
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), toon(0xffffff, { map: booksTex(3 + Math.round(x * 3) % 7 + 7) })); sh.position.set(x, 1.85, HZ - .575); sh.rotation.y = PI; Wd.add(sh); }
  Wd.add(box(1.7, 3.0, .2, 0x7a4a2a, { pos: [0, 1.5, HZ - .1] })); Wd.add(box(1.9, .18, .3, 0xd9a63a, { pos: [0, 3.1, HZ - .1], ink: false }));
  for (let x = -13.5; x <= 13.6; x += 3) Wd.add(box(.36, .42, 2 * HZ, 0x6a4326, { pos: [x, H - .2, 0], ink: false }));
  for (let x = -12; x <= 12.1; x += 6) { const lp = new THREE.Group(); lp.position.set(x, 0, 0); Wd.add(lp);
    lp.add(cyl(.02, .02, 1.0, 0x333333, { pos: [0, H - .9, 0], ink: false })); lp.add(cyl(.34, .5, .36, 0xd9a63a, { pos: [0, H - 1.5, 0] }));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), bm(0xfff0c0)); bulb.position.set(0, H - 1.68, 0); lp.add(bulb); const gs = glowSprite(1.8, 1.8, .55); gs.position.set(0, H - 1.7, 0); lp.add(gs); }
  if (o.benches) for (let x = -11; x <= 11.1; x += 5.5) { Wd.add(box(2.4, .1, .5, 0x9a6a3e, { pos: [x, .5, -HZ + .75] })); for (const dx of [-1, 1]) Wd.add(box(.1, .5, .44, 0x6a4326, { pos: [x + dx, .25, -HZ + .75], ink: false })); }
  if (o.tables) for (const sx of [-1, 1]) for (const z of [-2.9, 2.9]) { const x = sx * 9;   // long study tables far from the action
    Wd.add(box(4.6, .09, 1.2, 0x9a6a3e, { pos: [x, .82, z] })); for (const dx of [-2.1, 2.1]) for (const dz of [-.5, .5]) Wd.add(box(.1, .8, .1, 0x6a4326, { pos: [x + dx, .4, z + dz], ink: false }));
    for (const dz of [-1, 1]) Wd.add(box(4.4, .08, .4, 0x8a5a34, { pos: [x, .48, z + dz * .95] }));
    const r = rng(9 + z * 3 + x); for (let i = 0; i < 6; i++) Wd.add(box(.3, .08 + r() * .08, .4, [0x8a2a2a, 0x244a86, 0x2f6a3a, 0x2a2a36][Math.floor(r() * 4)], { pos: [x - 1.8 + i * .7, .9, z + (r() - .5) * .3], rot: [0, r() * .5, 0], ink: false })); }
  return { L, HZ, H };
}

function chair(Wd, x, z, ry, seatY) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; Wd.add(g);   // sitter faces +z when ry = 0
  g.add(box(.46, .05, .46, 0x9a6a3e, { pos: [0, seatY, 0] })); g.add(box(.46, .42, .05, 0x8a5a34, { pos: [0, seatY + .26, -.2] }));
  for (const dx of [-.2, .2]) for (const dz of [-.2, .2]) g.add(box(.05, seatY, .05, 0x6a4326, { pos: [dx, seatY / 2, dz], ink: false }));
}

function homeRoom(Wd, shabbat) {
  const HX = 5, HZ = 5, H = 3.5, wallC = shabbat ? 0xf6ead0 : 0xf0e3c6;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2 * HX, 2 * HZ), toon(0xffffff, { map: planksTex([5, 4.5]) })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; Wd.add(fl);
  Wd.add(box(3.8, .004, 2.9, 0x9a3a34, { pos: [0, .002, 0], ink: false })); Wd.add(box(3.4, .006, 2.5, 0xd9a63a, { pos: [0, .003, 0], ink: false })); Wd.add(box(3.2, .008, 2.3, 0x9a3a34, { pos: [0, .004, 0], ink: false }));
  Wd.add(box(2 * HX, H, .4, wallC, { pos: [0, H / 2, -HZ - .2], ink: false })); Wd.add(box(2 * HX, H, .4, wallC, { pos: [0, H / 2, HZ + .2], ink: false }));
  for (const sx of [-1, 1]) Wd.add(box(.4, H, 2 * HZ, wallC, { pos: [sx * (HX + .2), H / 2, 0], ink: false }));
  Wd.add(box(2 * HX, 1.0, .12, 0xb98a58, { pos: [0, .5, -HZ + .06], ink: false })); Wd.add(box(2 * HX, 1.0, .12, 0xb98a58, { pos: [0, .5, HZ - .06], ink: false }));
  windowUnit(Wd, -2.2, 1.0, -HZ + .02, 0, 1.6, 2.1);   // window behind the boy (left)
  for (const dx of [-1, 1]) Wd.add(box(.5, 2.4, .14, shabbat ? 0xf0e6d0 : 0xc9946a, { pos: [-2.2 + dx * 1.05, 1.9, -HZ + .12], ink: false }));
  Wd.add(box(3.4, .1, .1, 0x6a4326, { pos: [-2.2, 3.15, -HZ + .12], ink: false }));
  Wd.add(box(3.0, 3.0, .5, 0x7a4a2a, { pos: [2.3, 1.5, -HZ + .3] }));   // bookcase behind the boy (right)
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), toon(0xffffff, { map: booksTex(5) })); sh.position.set(2.3, 1.5, -HZ + .555); Wd.add(sh);
  Wd.add(box(3.0, 3.0, .5, 0x7a4a2a, { pos: [HX - .3, 1.5, 0], rot: [0, 0, 0] })); const sh2 = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), toon(0xffffff, { map: booksTex(6) })); sh2.position.set(HX - .555, 1.5, 0); sh2.rotation.y = -PI / 2; Wd.add(sh2);
  Wd.add(box(2.4, .9, .5, 0x8a5a34, { pos: [-HX + .3, .45, 0.5] })); for (const [i, dz] of [[0, -.3], [1, .5], [2, 1.3]]) Wd.add(cyl(.12, .16, .4 + i * .08, [0xc0c6cf, 0xd9a63a, 0xc0c6cf][i], { pos: [-HX + .3, 1.1 + i * .04, dz + .5] }));
  const fr = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), toon(0xdcc79a)); fr.position.set(-HX + .46, 2.1, .5); fr.rotation.y = PI / 2; Wd.add(fr); Wd.add(box(.06, 1.14, 1.64, 0x7a4a2a, { pos: [-HX + .42, 2.1, .5], ink: false }));
  // table at the origin: top at y = .66
  const TY = .66, cloth = shabbat ? 0xffffff : 0xb88a56;
  Wd.add(box(2.0, .06, 1.1, shabbat ? 0xf4f0e6 : 0x9a6a3e, { pos: [0, TY, 0] }));
  if (shabbat) { Wd.add(box(2.12, .02, 1.22, cloth, { pos: [0, TY + .04, 0], ink: false })); for (const sz of [-1, 1]) Wd.add(box(2.12, .3, .02, cloth, { pos: [0, TY - .12, sz * .61], ink: false })); for (const sx of [-1, 1]) Wd.add(box(.02, .3, 1.22, cloth, { pos: [sx * 1.06, TY - .12, 0], ink: false })); }
  else for (const dx of [-.9, .9]) for (const dz of [-.45, .45]) Wd.add(box(.07, TY, .07, 0x6a4326, { pos: [dx, TY / 2, dz], ink: false }));
  chair(Wd, 0, -.95, 0, .3); chair(Wd, 0, .95, PI, .3);
  const live = [];
  if (shabbat) {
    for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * .62, TY + .05, .12); Wd.add(g);
      g.add(cyl(.09, .12, .05, 0xd8dde6, { pos: [0, .025, 0] })); g.add(cyl(.025, .035, .3, 0xd8dde6, { pos: [0, .2, 0] })); g.add(cyl(.065, .03, .06, 0xd8dde6, { pos: [0, .38, 0] }));
      g.add(cyl(.026, .026, .24, 0xfff4d8, { pos: [0, .5, 0], ink: false }));
      const fl2 = new THREE.Mesh(new THREE.ConeGeometry(.032, .11, 10), bm(0xffb43a)); fl2.position.set(0, .68, 0); g.add(fl2);
      const gl = glowSprite(.55, .55, .9); gl.position.set(0, .68, 0); g.add(gl); live.push([fl2, gl, sx]); }
    const lamp = new THREE.PointLight(0xffc27a, 1.4, 5); lamp.position.set(0, TY + .8, .1); Wd.add(lamp);
    const cv = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#1d3770'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e2b13a'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); g.lineWidth = 3; g.strokeRect(24, 24, w - 48, h - 48);
      g.fillStyle = '#e2b13a'; g.beginPath(); g.arc(w / 2, h / 2, 26, 0, 7); g.fill(); });
    const cov = new THREE.Mesh(new THREE.BoxGeometry(.62, .09, .4), [toon(0x1d3770), toon(0x1d3770), toon(0xffffff, { map: cv }), toon(0x1d3770), toon(0x1d3770), toon(0x1d3770)]); cov.position.set(0, TY + .08, .02); cov.castShadow = true; Wd.add(cov);
    Wd.add(cyl(.045, .03, .12, 0xd8dde6, { pos: [.52, TY + .1, -.05] })); Wd.add(cyl(.09, .09, .02, 0xd8dde6, { pos: [.52, TY + .045, -.05], ink: false }));
  } else {
    Wd.add(box(.34, .07, .46, 0x244a86, { pos: [-.5, TY + .065, .1], rot: [0, .2, 0] })); Wd.add(box(.3, .06, .4, 0x8a2a2a, { pos: [-.5, TY + .13, .1], rot: [0, -.1, 0] })); Wd.add(box(.28, .02, .38, 0xf4ecd8, { pos: [.1, TY + .04, .15], rot: [0, .15, 0], ink: false }));
    Wd.add(cyl(.05, .05, .1, 0x5a8a5a, { pos: [.7, TY + .08, .2] })); Wd.add(cyl(.02, .02, .3, 0x333333, { pos: [-.85, TY + .18, -.1], ink: false })); Wd.add(cyl(.12, .2, .2, 0xffe9a8, { pos: [-.85, TY + .4, -.1] }));
    const lamp = new THREE.PointLight(0xffe0a0, 1.0, 5); lamp.position.set(-.85, TY + .7, -.1); Wd.add(lamp); }
  Wd.on(t => { for (const [fl2, gl, s] of live) { const f = 1 + .12 * Math.sin(t * 9 + s * 2) + .06 * Math.sin(t * 17 + s); fl2.scale.set(1, f, 1); gl.material.opacity = .75 + .2 * Math.sin(t * 7 + s); } });
  return { TY };
}

// ---------------------------------------------------------------- characters
const SK = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
const lookOf = i => ({ kind: 'boy', hat: 'kippa', beardLen: 0, skin: SK[i % 4], pants: ['#1b1d24', '#22262e', '#17181d'][i % 3], glasses: i % 3 === 1 });
export const REG = [];   // debug registry: every scene world with its people (used by stills.py --check)
const boyP = (Wd, i, fn) => { const P = person(Wd, lookOf(i), t => Object.assign({ seed: .2 + .17 * i }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(P); return P; };
const talkAmt = (t, s) => clamp(Math.sin(t * 1.6 + s * 5) * 3 + .9, 0, 1) * (.5 + .5 * Math.sin(t * 10.3 + s));
const face = (dx, dz) => Math.atan2(dx, dz);

// two boys talking; geo {cx, z, i0, sep}
function pair(Wd, beat, dur, geo) {
  const acts = [].concat(beat.action || []), has = k => acts.includes(k), mood = beat.mood, cx = geo.cx, z = geo.z, sep = geo.sep || .62;
  const K = t => ease.sm(prog(t, dur * .10, dur * .32));
  const smile = mood === 'good' ? .9 : mood === 'bad' ? 0 : .35, brow = mood === 'bad' ? .5 : 0;
  const baseA = PI / 2 - .5, baseB = -PI / 2 + .5;
  const half = t => has('whisper') ? lerp(sep, .3, K(t)) : sep;
  boyP(Wd, geo.i0, t => { const k = K(t), st = { pos: [cx - half(t), 0, z], facing: baseA, talk: talkAmt(t, 1), smile, brow, perform: .8 };
    if (has('whisper')) Object.assign(st, { gesture: k > .5 ? 'think' : null, talk: .25 * talkAmt(t, 1), facing: baseA + .15 * k, smile: .15 });
    else if (has('point')) Object.assign(st, { gesture: k > .5 ? 'point' : null, perform: k > .5 ? 0 : .8 });
    else if (has('turn_away')) Object.assign(st, { gesture: k > .4 ? 'offer' : null, perform: k > .4 ? 0 : .8, talk: talkAmt(t, 1) });
    else if (has('smile')) Object.assign(st, { gesture: k > .5 ? 'explainA' : null, smile: 1, talk: .2 * talkAmt(t, 1) });
    return st; });
  boyP(Wd, geo.i0 + 1, t => { const k = K(t), st = { pos: [cx + half(t), 0, z], facing: baseB, talk: .15 * talkAmt(t, 2), smile, brow, perform: .25, look: -.4 * (1 - k) };
    if (has('whisper')) Object.assign(st, { facing: baseB - .1 * k, smile: .2, look: -.5, talk: 0 });
    else if (has('point')) Object.assign(st, { gesture: k > .5 ? 'shrug' : null, perform: 0, brow: .4 * k });
    else if (has('turn_away')) { st.pos = [cx + half(t) + .9 * k, 0, z]; st.facing = lerp(baseB, PI / 2 + .6, k); st.perform = 0; st.brow = .6 * k; st.smile = 0; st.talk = 0; st.look = 0; }
    else if (has('smile')) Object.assign(st, { gesture: k > .5 ? 'thumb' : null, smile: 1, perform: 0 });
    return st; });
}

// ---------------------------------------------------------------- beat scenes
function sceneClassroom(beat, dur, idx) {
  const Wd = mkWorld(); hall(Wd, { benches: true });
  const cx = ((idx % 3) - 1) * 4.5; pair(Wd, beat, dur, { cx, z: 0, i0: idx });
  boyP(Wd, idx + 2, t => ({ pos: [cx - 8 + 16 * ((t * .05 + idx * .2) % 1), 0, -4.2], facing: PI / 2, walk: t * 5.5 + idx }));   // a passer-by far behind
  return Object.assign(Wd, { cam: camFor('classroom', idx, dur, [cx, 0]) });
}
function sceneYard(beat, dur, idx) {
  const Wd = mkWorld({ ground: 'grass', groundSize: 320, skyTop: 0x4f9fe8, fogNear: 45, fogFar: 150, sunPos: [-20, 30, 18], shadowExt: 22 });
  const pave = new THREE.Mesh(new THREE.PlaneGeometry(46, 30), new THREE.MeshLambertMaterial({ map: groundTex('stone', [9, 6]) })); pave.rotation.x = -PI / 2; pave.position.set(0, .006, -1); pave.material.polygonOffset = true; pave.material.polygonOffsetFactor = -2; pave.material.polygonOffsetUnits = -2; pave.receiveShadow = true; Wd.add(pave);
  Wd.add(box(46.4, .12, .2, 0xcfc4aa, { pos: [0, .06, 14.1], ink: false })); Wd.add(box(46.4, .12, .2, 0xcfc4aa, { pos: [0, .06, -16.1], ink: false }));
  Wd.add(box(40, 9, 6, 0xf2e2bd, { pos: [0, 4.5, -19.5] })); Wd.add(box(40.6, .5, 6.6, 0xc9a574, { pos: [0, 9.2, -19.5], ink: false }));
  const win = bm(0xa6d4f2, {}), frm = bm(0xffffff, {});
  for (const y of [2.3, 6.0]) for (let x = -16.5; x <= 16.6; x += 3.3) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2), frm); f.position.set(x, y, -16.48); Wd.add(f); const w2 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.9), win); w2.position.set(x, y, -16.47); Wd.add(w2); }
  const dr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(2.2, 3.4), 12), toon(0x7a4a2a)); dr.position.set(0, 0, -16.45); Wd.add(dr);
  for (const [x, z, s] of [[-12, -9, 1.0], [11, -10, 1.2], [-17, 2, .9], [17, 0, 1.0]]) { Wd.add(cyl(.22 * s, .3 * s, 2.7 * s, 0x7a5232, { pos: [x, 1.35 * s, z] })); Wd.add(ball(1.7 * s, 0x6fae57, { pos: [x, 3.8 * s, z], scale: [1, .9, 1] })); Wd.add(ball(1.2 * s, 0x82bf62, { pos: [x + 1.1 * s, 3.2 * s, z + .4], scale: [1, .9, 1] })); }
  for (let x = -22; x <= 22.1; x += 1.6) Wd.add(box(.1, 1.5, .1, 0x8a8f96, { pos: [x, .75, 14.4], ink: false })); Wd.add(box(46, .08, .06, 0x8a8f96, { pos: [0, 1.3, 14.4], ink: false })); Wd.add(box(46, .08, .06, 0x8a8f96, { pos: [0, .6, 14.4], ink: false }));
  Wd.add(box(2.4, .1, .55, 0x9a6a3e, { pos: [-6.5, .5, -3.5] })); Wd.add(box(2.4, .5, .08, 0x8a5a34, { pos: [-6.5, .78, -3.8] })); for (const dx of [-1, 1]) Wd.add(box(.1, .5, .5, 0x6a4326, { pos: [-6.5 + dx, .25, -3.5], ink: false }));
  Wd.add(ball(.13, 0xffffff, { pos: [3.2, .13, 1.4] }));
  const clouds = [0, 1, 2, 3].map(i => { const c = cloud({ seed: 3 + i, size: 2.2 + i * .4, puffs: 6, pos: [-30 + i * 22, 16 + i * 2, -40 - i * 6] }); Wd.add(c); return c; });
  Wd.on(t => clouds.forEach((c, i) => { c.position.x = -30 + i * 22 + t * .5; }));
  const cx = ((idx % 3) - 1) * 2.5; pair(Wd, beat, dur, { cx, z: 0, i0: idx });
  boyP(Wd, idx + 2, t => { const a = t * .3 + idx; const x = Math.cos(a) * 3.2, zz = -7 + Math.sin(a) * 1.4, dx = -Math.sin(a) * 3.2, dz = Math.cos(a) * 1.4; return { pos: [x, 0, zz], facing: face(dx, dz), walk: t * 5.4 }; });
  boyP(Wd, idx + 3, t => ({ pos: [-6.5, 0, -3.3], facing: face(1, .6), sit: true, groundY: 0, talk: .3 * talkAmt(t, 3), perform: .5, smile: .5 }));
  return Object.assign(Wd, { cam: camFor('yard', idx, dur, [cx, 0]) });
}
function sceneHome(beat, dur, idx) {
  const shabbat = beat.variant === 'shabbat';
  const Wd = mkWorld({ sunPos: [-6, 14, 12], shadowExt: 9, fogNear: 20, fogFar: 80 }); const R = homeRoom(Wd, shabbat);
  const acts = [].concat(beat.action || []), has = k => acts.includes(k), mood = beat.mood;
  const K = t => ease.sm(prog(t, dur * .10, dur * .34));
  boyP(Wd, idx, t => { const k = K(t), st = { pos: [0, 0, -.82], facing: 0, sit: true, groundY: 0, talk: talkAmt(t, 2), perform: .7, smile: mood === 'good' ? .9 : mood === 'bad' ? 0 : .4, brow: mood === 'bad' ? .5 : 0 };
    if (has('point')) Object.assign(st, { gesture: k > .5 ? 'point' : null, perform: k > .5 ? 0 : .7 });
    else if (has('whisper')) Object.assign(st, { gesture: k > .5 ? 'think' : null, talk: .2 * talkAmt(t, 2), perform: 0, look: -.6 * k });
    else if (has('turn_away')) Object.assign(st, { facing: -.9 * k, talk: 0, perform: 0, smile: 0, brow: .5 * k, look: 0 });
    else if (has('smile')) Object.assign(st, { gesture: k > .5 ? 'thumb' : null, smile: 1, talk: .2 * talkAmt(t, 2), perform: 0 });
    return st; });
  return Object.assign(Wd, { cam: camFor('home', idx, dur, [0, -.3]) });
}

// floating card (text / title / summary): canvas drawn by `draw`, world size w x h, faces +z.
function card3d(Wd, o) {
  const g = new THREE.Group(); Wd.add(g);
  const tex = canvasTex(o.cw || 1536, o.ch || 1024, o.draw);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.h), bm(0xffffff, { map: tex })); face.position.z = .005; g.add(face);
  g.add(box(o.w + .18, o.h + .18, .1, o.frame || 0xd9a63a, { pos: [0, 0, -.06] }));
  const gl = glowSprite(o.w * 1.9, o.h * 2.0, .55); gl.position.z = -.4; g.add(gl);
  Wd.on(t => { const k = ease.out(prog(t, o.t0 || 0, (o.t0 || 0) + 1.3)); g.scale.setScalar(.55 + .45 * k);
    g.position.set(o.pos[0], o.pos[1] + .06 * Math.sin(t * 1.3), o.pos[2]); g.rotation.y = .05 * Math.sin(t * .5); g.rotation.x = .02 * Math.sin(t * .7); });
  return g;
}
function drawParchment(o) {   // o: {text, ref}
  return (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ecd9a6'); gr.addColorStop(.5, '#f9eed0'); gr.addColorStop(1, '#e8d39c'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#a9803a'; c.lineWidth = 10; c.strokeRect(26, 26, w - 52, h - 52); c.lineWidth = 3; c.strokeRect(46, 46, w - 92, h - 92);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const hasRef = !!o.ref, fit = fitText(c, o.text || '', { maxW: w - 220, maxLines: 6, max: 118, min: 58, lh: 1.32, maxH: h - (hasRef ? 330 : 200) });
    const lh = fit.size * 1.32, y0 = (hasRef ? h * .46 : h / 2) - (fit.lines.length - 1) * lh / 2; c.fillStyle = '#3b2410'; c.font = `700 ${fit.size}px ${FONT}`;
    fit.lines.forEach((l, i) => c.fillText(l, w / 2, y0 + i * lh));
    if (hasRef) { c.fillStyle = '#a9803a'; c.fillRect(w / 2 - 120, h - 215, 240, 5); const f2 = fitText(c, o.ref, { maxW: w - 300, maxLines: 1, max: 62, min: 40, lh: 1.2 }); c.font = `700 ${f2.size}px ${FONT}`; c.fillStyle = '#7a4a1e'; c.fillText(f2.lines[0] || '', w / 2, h - 140); } };
}
function sceneText(beat, dur, idx) {
  const Wd = mkWorld({ fogNear: 26 }); hall(Wd, { tables: true });
  card3d(Wd, { w: 3.0, h: 2.0, pos: [0, 2.0, 0], draw: drawParchment({ text: beat.text || beat.caption || '', ref: beat.ref }), t0: 0 });
  const acts = [].concat(beat.action || []), has = k => acts.includes(k);
  boyP(Wd, idx, t => ({ pos: [-2.3, 0, .5], facing: face(2.3, -.5) - .55, talk: 0, perform: has('point') ? 0 : .4, gesture: has('point') ? 'point' : null, smile: beat.mood === 'good' ? .9 : .3, look: .4 }));
  boyP(Wd, idx + 1, t => ({ pos: [2.3, 0, .5], facing: face(-2.3, -.5) + .55, talk: .3 * talkAmt(t, 4), perform: .5, smile: beat.mood === 'good' ? .9 : .3, look: -.4 }));
  return Object.assign(Wd, { cam: camFor('text', idx, dur, [0, 0]) });
}
export function buildBeat(beat, dur, idx) {
  const f = { classroom: sceneClassroom, yard: sceneYard, home: sceneHome, text: sceneText }[beat.scene] || sceneClassroom;
  const Wd = f(beat, dur, idx); Wd.beatIdx = idx; REG.push(Wd); return Wd;
}

// ---------------------------------------------------------------- opening + summary (cards in 3D space)
function sparkles(Wd, n, seed, spread) {
  const r = rng(seed), base = [], pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) base.push([(r() - .5) * spread[0], r() * spread[1], (r() - .5) * spread[2], .15 + r() * .3, r() * 6]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: glowTex(), size: .5, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe9a8, fog: false }));
  pts.frustumCulled = false; Wd.add(pts);
  Wd.on(t => { for (let i = 0; i < n; i++) { const b = base[i]; pos[i * 3] = b[0] + Math.sin(t * b[3] + b[4]) * .4; pos[i * 3 + 1] = 0.3 + (b[1] + t * b[3] * .6) % spread[1]; pos[i * 3 + 2] = b[2] + Math.cos(t * b[3] * .8 + b[4]) * .4; } geo.attributes.position.needsUpdate = true; });
}
export function buildOpening(EP, dur) {
  const Wd = mkWorld({ fogNear: 28 }); hall(Wd, { tables: true }); sparkles(Wd, 50, 4, [14, 6, 8]);
  card3d(Wd, { w: 4.0, h: 2.5, pos: [0, 2.3, 0], cw: 1536, ch: 960, frame: 0xd9a63a, t0: .2, draw: (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff7e0'); gr.addColorStop(1, '#f3dfae'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#c28f2c'; c.lineWidth = 12; c.strokeRect(28, 28, w - 56, h - 56); c.lineWidth = 4; c.strokeRect(52, 52, w - 104, h - 104);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const fit = fitText(c, EP.title || '', { maxW: w - 240, maxLines: 2, max: 200, min: 90, lh: 1.15, maxH: h * .5 }), lh = fit.size * 1.15;
    c.fillStyle = '#1d2a5a'; c.font = `700 ${fit.size}px ${FONT}`; const y0 = h * .42 - (fit.lines.length - 1) * lh / 2; fit.lines.forEach((l, i) => c.fillText(l, w / 2, y0 + i * lh));
    c.fillStyle = '#c28f2c'; c.fillRect(w / 2 - 170, h * .70, 340, 8);
    if (EP.source) { const f2 = fitText(c, EP.source, { maxW: w - 300, maxLines: 1, max: 80, min: 46, lh: 1.2 }); c.font = `700 ${f2.size}px ${FONT}`; c.fillStyle = '#7a4a1e'; c.fillText(f2.lines[0] || '', w / 2, h * .81); } } });
  return Object.assign(Wd, { cam: cine([[0, [0, 2.0, 0], 5.8, .3, -24, 42, 0], [dur * .6, [0, 2.1, 0], 5.3, .1, 6, 42, 0], [dur, [0, 2.15, 0], 4.8, .0, 16, 42, 0]]) });
}
export function buildSummary(EP, dur) {
  const Wd = mkWorld({ fogNear: 28 }); hall(Wd, { tables: true }); sparkles(Wd, 70, 7, [14, 7, 8]);
  card3d(Wd, { w: 4.2, h: 2.62, pos: [0, 2.3, 0], cw: 1536, ch: 960, frame: 0xd9a63a, t0: .2, draw: (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#ffe9a6'); gr.addColorStop(1, '#ffd370'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#a8741a'; c.lineWidth = 12; c.strokeRect(28, 28, w - 56, h - 56); c.lineWidth = 4; c.strokeRect(52, 52, w - 104, h - 104);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#a8741a'; for (let k = -2; k <= 2; k++) { c.beginPath(); const cx = w / 2 + k * 70, cy = 140, R = k === 0 ? 30 : 20; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? R * .45 : R; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.closePath(); c.fill(); }
    const hasRef = !!EP.summarySource || !!EP.source, ref = EP.summarySource || EP.source || '';
    const fit = fitText(c, EP.summary || '', { maxW: w - 240, maxLines: 3, max: 160, min: 80, lh: 1.2, maxH: h * (hasRef ? .5 : .6) }), lh = fit.size * 1.2;
    c.fillStyle = '#1d2a5a'; c.font = `700 ${fit.size}px ${FONT}`; const y0 = h * .50 - (fit.lines.length - 1) * lh / 2; fit.lines.forEach((l, i) => c.fillText(l, w / 2, y0 + i * lh));
    if (hasRef) { const f2 = fitText(c, ref, { maxW: w - 300, maxLines: 1, max: 58, min: 36, lh: 1.2 }); c.font = `700 ${f2.size}px ${FONT}`; c.fillStyle = '#6b4310'; c.fillText(f2.lines[0] || '', w / 2, h * .85); } } });
  return Object.assign(Wd, { cam: cine([[0, [0, 2.0, 0], 5.8, .4, 26, 42, 0], [dur * .5, [0, 2.1, 0], 5.4, .2, -6, 42, 0], [dur, [0, 2.15, 0], 5.0, .1, -16, 42, 0]]) });
}
