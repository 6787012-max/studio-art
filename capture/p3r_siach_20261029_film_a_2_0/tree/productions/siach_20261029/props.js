/* props.js - simple toon props in the approved cel-shaded style (toon shader + ink hull) for katzar_k04_3d.
   No letters anywhere: book pages carry grey line strokes only. All builders return THREE.Groups (units = the 2D body units, y up). */
import { THREE, RoundedBoxGeometry, toon, part, ell, tube, lathe, tubeAlong, V, OL } from '../../lib/toon3d/toon3d.js';

const cache = {};
export const M = (hex, tint, hi) => { const k = hex + '|' + (tint || '') + '|' + hi; return cache[k] || (cache[k] = toon(hex, { tint: tint || '#b9a9b2', hi: hi == null ? 0 : hi })); };
export const WOOD = () => M('#dba76a', '#bf917f'), WOOD2 = () => M('#c1844a', '#a87a74'), WOODD = () => M('#8f5d33', '#7a5a60'), STONE = () => M('#d6ccba', '#a99fb2'), STONE2 = () => M('#bfb4a2', '#9a90a4');
export const bas = (hex, o) => new THREE.MeshBasicMaterial(Object.assign({ color: hex }, o || {}));
const RB = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 2, r == null ? 3 : r);
export function box(parent, w, h, d, mat, pos, ow, rot, r) { return part(parent, RB(w, h, d, r), mat, ow == null ? 2.4 : ow, pos, rot); }
const plainBox = (parent, w, h, d, mat, pos, rot) => part(parent, new THREE.BoxGeometry(w, h, d), mat, 0, pos, rot);

/* ---------- soft glow sprite texture ---------- */
let _glowTex;
export function glowTex() {
  if (_glowTex) return _glowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); _glowTex = new THREE.CanvasTexture(c); return _glowTex;
}
export function glow(parent, hex, size, pos, op) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: hex, transparent: true, opacity: op == null ? 0.8 : op, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1); if (pos) s.position.set(...pos); s.renderOrder = 30; parent.add(s); return s;
}

/* ---------- open book (gemara). spread along z, page "up" along +x, lies on the xz plane (up = +y) ---------- */
export function makeBook(open, o) {
  o = o || {}; const g = new THREE.Group(), W = o.w || 84, Hh = o.h || 108, T = o.t || 16;
  const mCov = M(o.cover || '#6b3f2a', '#9a7a7a'), mPage = M('#f6ecd2', '#ddd0c0', 0), mLine = bas('#8d8a86');
  g.userData.lines = [];
  if (open) {
    for (const s of [-1, 1]) {
      const pg = new THREE.Group(); pg.position.set(0, 0, 0); pg.rotation.x = -s * 0.07; g.add(pg); // pages rise slightly toward the spine side
      box(pg, Hh, 6, W, mCov, [0, 0, s * (W / 2 + 2)], 2, null, 2);
      box(pg, Hh - 6, T, W - 6, mPage, [0, T / 2 + 3, s * (W / 2 + 2)], 1.8, null, 2);
      const rows = 15;
      for (let i = 0; i < rows; i++) {
        const lw = (W - 22) * (i % 7 === 6 ? 0.55 : 1) - ((i * 37) % 9);
        const l = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, lw), mLine); l.position.set(Hh / 2 - 14 - i * ((Hh - 28) / rows), T + 3.6, s * (W / 2 + 2 + (i % 7 === 6 ? -(W - 22 - lw) / 2 : 0)));
        pg.add(l);
      }
    }
    plainBox(g, Hh, 4, 3, mCov, [0, 4, 0]);
  } else {
    box(g, Hh, W * 0.5, 0.9 * W * 0 + W, mCov, [0, W * 0.25, 0], 2.2, null, 3); // closed: Hh tall(x), thick(y), W wide(z)
    box(g, Hh - 6, W * 0.5 - 8, W + 2, mPage, [3, W * 0.25, 0], 0, null, 1);
  }
  return g;
}
/* closed sefer lying flat / stacked: w x d footprint, t thick */
export function makeSefer(hex, w, d, t) {
  const g = new THREE.Group(); box(g, w, t, d, M(hex, '#9a8a96'), [0, t / 2, 0], 1.8, null, 2);
  plainBox(g, w + 0.5, t * 0.82, d - 4, M('#f3e7cc', '#d6cbc0'), [2, t / 2, 0]);
  plainBox(g, 3, t - 3, d + 0.8, bas('#e3b24c'), [-w / 2 + 6, t / 2, 0]); return g;
}

/* ---------- shtender (lectern). reader stands at local -x and faces +x; the sloped top rises toward +x ---------- */
export function makeShtender() {
  const g = new THREE.Group(), mW = WOOD(), mD = WOODD();
  box(g, 76, 150, 84, mW, [0, 75, 0], 2.6, null, 4);
  box(g, 86, 14, 94, mD, [0, 7, 0], 2.4, null, 3);
  const top = new THREE.Group(); top.position.set(0, 152, 0); top.rotation.z = 0.36; g.add(top);
  box(top, 88, 8, 100, mD, [0, 4, 0], 2.4, null, 2);
  box(top, 6, 9, 100, mD, [-40, 11, 0], 2, null, 1);  // lip at the near edge
  top.userData.surfY = 8.5; g.userData.top = top; return g;
}

/* ---------- bench / stool / table ---------- */
export function makeBench(len, h) {
  const g = new THREE.Group(); h = h || 64; box(g, len, 10, 46, WOOD(), [0, h - 5, 0], 2.4, null, 3);
  for (const s of [-1, 1]) box(g, 10, h - 10, 40, WOODD(), [s * (len / 2 - 22), (h - 10) / 2, 0], 2.2, null, 2);
  return g;
}
export function makeTable(w, d, h) {
  const g = new THREE.Group(); h = h || 118; box(g, w, 12, d, WOOD(), [0, h - 6, 0], 2.8, null, 3);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 16, h - 12, 16, WOODD(), [sx * (w / 2 - 22), (h - 12) / 2, sz * (d / 2 - 22)], 2.2, null, 2);
  box(g, w - 40, 8, 8, WOODD(), [0, 34, d / 2 - 22], 2, null, 1); box(g, w - 40, 8, 8, WOODD(), [0, 34, -d / 2 + 22], 2, null, 1);
  return g;
}
export function stackOf(cols, w, d, t0) { // pile of closed books
  const g = new THREE.Group(); let y = 0; cols.forEach((c, i) => { const b = makeSefer(c, w - (i % 3) * 5, d - (i % 2) * 6, t0 + (i % 3) * 3); b.position.set(((i * 7) % 5) - 2, y, ((i * 5) % 4) - 1.5); b.rotation.y = ((i * 29) % 11 - 5) * 0.015; g.add(b); y += t0 + (i % 3) * 3; }); return g;
}

/* ---------- hanging lamp ---------- */
export function makeLamp(drop) {
  const g = new THREE.Group(); plainBox(g, 2.4, drop, 2.4, M('#3b2c22'), [0, -drop / 2, 0]);
  const sh = part(g, lathe([[0.1, 0], [10, 3], [34, -28], [38, -34], [30, -34], [9, -4]], 28), M('#d9a441', '#b98a64'), 2.2, [0, -drop, 0]);
  part(g, ell(14, 14, 14, 16, 12), M('#ffe9a8', '#ffe9a8', 0), 0, [0, -drop - 20, 0]);
  glow(g, '#ffd27a', 320, [0, -drop - 22, 0], 0.85); return g;
}

/* ---------- study hall (interior, open top). Origin = middle of the window wall's floor line. Room extends toward +z.
   The window wall is at z = 0 (outside = -z). Returns {group, lamps, sashes, glass}. ---------- */
export function makeHall(o) {
  o = o || {}; const g = new THREE.Group(), WX = 1500, DZ = 2100, WH = 1500;
  const mFloor = M('#cf9b62', '#b18779'), mWall = M('#e8c690', '#c4a08e'), mWallD = M('#d6ad74', '#b79583'), mTrim = WOODD();
  const fl = new THREE.Mesh(new THREE.BoxGeometry(WX * 2, 20, DZ + 400), mFloor); fl.position.set(0, -10, DZ / 2 - 100); g.add(fl);
  for (let i = -9; i <= 9; i++) plainBox(g, 3, 1.2, DZ + 380, M('#a8723f', '#9a7a7a'), [i * 160, 0.8, DZ / 2 - 100]);
  // window wall (z = 0): pieces around an opening x -520..520, y 170..900
  const WL = 520, W0 = 170, W1 = 900, th = 40;
  const wall = (w, h, x, y, z, mat) => box(g, w, h, th, mat || mWall, [x, y, z], 0, null, 0);
  wall(WX - WL, WH, -(WX + WL) / 2, WH / 2, 0); wall(WX - WL, WH, (WX + WL) / 2, WH / 2, 0);
  wall(WL * 2, W0, 0, W0 / 2, 0); wall(WL * 2, WH - W1, 0, (WH + W1) / 2, 0);
  // frame
  for (const [w, h, x, y] of [[WL * 2 + 50, 28, 0, W0 - 4], [WL * 2 + 50, 28, 0, W1 + 4], [28, W1 - W0 + 50, -WL - 4, (W0 + W1) / 2], [28, W1 - W0 + 50, WL + 4, (W0 + W1) / 2]]) box(g, w, h, th + 16, mTrim, [x, y, 6], 2.4, null, 3);
  // sashes (casements) hinged at the sides
  g.userData.sashes = []; const glassMat = new THREE.MeshBasicMaterial({ color: '#cfe8f6', transparent: true, opacity: 0.22, depthWrite: false });
  for (const s of [-1, 1]) {
    const hinge = new THREE.Group(); hinge.position.set(s * WL, 0, 14); g.add(hinge);
    const sw = WL; const sash = new THREE.Group(); sash.position.set(-s * sw / 2, (W0 + W1) / 2, 0); hinge.add(sash);
    const ph = W1 - W0;
    box(sash, sw, 14, 10, mTrim, [0, ph / 2 - 7, 0], 2, null, 2); box(sash, sw, 14, 10, mTrim, [0, -ph / 2 + 7, 0], 2, null, 2);
    box(sash, 14, ph, 10, mTrim, [-sw / 2 + 7, 0, 0], 2, null, 2); box(sash, 14, ph, 10, mTrim, [sw / 2 - 7, 0, 0], 2, null, 2);
    box(sash, 8, ph - 20, 8, mTrim, [0, 0, 0], 1.8, null, 1); box(sash, sw - 14, 8, 8, mTrim, [0, 0, 0], 1.8, null, 1);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(sw - 16, ph - 16), glassMat); sash.add(gl);
    g.userData.sashes.push({ hinge, s, glass: gl });
  }
  g.userData.glassMat = glassMat;
  // side walls + back wall
  const sideH = WH; box(g, th, sideH, DZ + 400, mWallD, [-WX, sideH / 2, DZ / 2 - 100], 0, null, 0); box(g, th, sideH, DZ + 400, mWallD, [WX, sideH / 2, DZ / 2 - 100], 0, null, 0);
  box(g, WX * 2, sideH, th, mWallD, [0, sideH / 2, DZ + 100], 0, null, 0);
  // wainscot + beams
  for (const x of [-WX + 22, WX - 22]) box(g, 14, 260, DZ + 380, mTrim, [x, 130, DZ / 2 - 100], 0, null, 0);
  box(g, WX * 2 - 40, 260, 14, mTrim, [0, 130, DZ + 78], 0, null, 0);
  for (const x of [-1, 1]) for (let i = 0; i < 7; i++) { // bookcase with spines on the side walls
    if (i === 3) continue; const cx = x * (WX - 60), cz = 360 + i * 240;
    box(g, 70, 600, 210, WOOD(), [cx, 300, cz], 2.4, null, 3);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) plainBox(g, 54, 100 - (k * 13) % 14, 20, M(['#2b4d8c', '#8c2b2b', '#2b6b4d', '#6b3f2a', '#c9a13b', '#4a3b7a', '#a0522d'][(k + r * 3) % 7], '#9a8a96'), [cx - x * 16, 70 + r * 140 + 50 - (k * 13) % 14 / 2 + 0, cz - 90 + k * 29]);
  }
  // a few shtenders and benches along the back (set dressing)
  for (const x of [-960, 960]) { const st = makeShtender(); st.position.set(x, 0, DZ - 90); st.rotation.y = -Math.PI / 2 * (x > 0 ? -1 : 1) * 0 + (x > 0 ? Math.PI : 0); g.add(st); }
  // lamps
  g.userData.lamps = [];
  for (const [x, z, d] of [[-900, 1000, 680], [900, 1000, 680], [-900, 1900, 640], [900, 1900, 640]]) { const l = makeLamp(d); l.position.set(x, 1180, z); g.add(l); g.userData.lamps.push(l); }
  return g;
}

/* ---------- golden staircase (a vision): steps rising toward +x/+y, glowing summit with an open book ---------- */
export function makeStairs(n, rise) {
  const g = new THREE.Group(), steps = [], mG = new THREE.MeshBasicMaterial({ color: '#ffd96a', transparent: true, opacity: 0.0, depthWrite: false });
  g.userData.mat = mG; n = n || 26; rise = rise || 70;
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(150, 22, 300), mG); m.position.set(i * 105, i * rise, 0); g.add(m); steps.push(m);
    const e = new THREE.Mesh(new THREE.BoxGeometry(150, 4, 300), new THREE.MeshBasicMaterial({ color: '#fff6c8', transparent: true, opacity: 0, depthWrite: false })); e.position.set(i * 105, i * rise + 12, 0); g.add(e); steps.push(e);
  }
  g.userData.steps = steps;
  const top = new THREE.Group(); top.position.set(n * 105 + 40, n * rise + 140, 0); g.add(top);
  const bk = makeBook(true, { w: 120, h: 150, t: 22, cover: '#e3b24c' }); bk.position.y = -20; top.add(bk); g.userData.top = top; g.userData.book = bk;
  g.userData.glows = [glow(top, '#fff2b0', 900, [0, 60, 0], 0), glow(top, '#ffd54a', 1800, [0, 60, 0], 0)];
  return g;
}

/* ---------- wooden ark with ramp, deck and door. Hull spans x -1000..1000, z -800..-300 (front face z=-300), y 0..560 ---------- */
export const RAMP = { x0: -1150, x1: 250, y1: 200, z0: -300, z1: 0 };
export const rampY = x => Math.max(0, Math.min(1, (x - RAMP.x0) / (RAMP.x1 - RAMP.x0))) * RAMP.y1;
export function makeArk() {
  const g = new THREE.Group(), mW = WOOD(), mW2 = WOOD2(), mD = WOODD();
  const sh = new THREE.Shape(); sh.moveTo(-860, 0); sh.lineTo(860, 0); sh.quadraticCurveTo(1010, 30, 1060, 600); sh.lineTo(-1060, 600); sh.quadraticCurveTo(-1010, 30, -860, 0);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 500, bevelEnabled: false, curveSegments: 18 }); hg.translate(0, 0, -800);
  part(g, hg, mW2, 4, [0, 0, 0]);
  for (let y = 60; y < 600; y += 62) plainBox(g, 2060, 5, 3, mD, [0, y, -298]);
  for (let x = -900; x <= 900; x += 225) plainBox(g, 5, 540, 3, mD, [x, 300, -298]);
  // cabin + gable roof
  box(g, 1500, 270, 400, mW, [0, 735, -540], 3.4, null, 4);
  const rs = new THREE.Shape(); rs.moveTo(-250, 0); rs.lineTo(250, 0); rs.lineTo(0, 170); rs.lineTo(-250, 0);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: 1700, bevelEnabled: true, bevelSize: 6, bevelThickness: 6, bevelSegments: 2 }); rg.rotateY(Math.PI / 2); rg.translate(-850, 870, -540);
  part(g, rg, M('#c9553d', '#a97a82'), 3.4);
  for (let x = -600; x <= 600; x += 300) { box(g, 120, 120, 8, M('#3d2a24'), [x, 745, -337], 2, null, 6); box(g, 150, 18, 12, mD, [x, 690, -334], 1.6, null, 2); }
  // door recess + open leaves
  box(g, 440, 330, 10, M('#2a1a12', '#2a1a12'), [580, 360, -296], 2.6, null, 2);
  g.userData.doorX = 580;
  for (const s of [-1, 1]) { const hinge = new THREE.Group(); hinge.position.set(580 + s * 215, 195, -292); hinge.rotation.y = s * 1.1; g.add(hinge); box(hinge, 210, 330, 14, mD, [-s * 105, 165, 0], 2.8, null, 3); for (let i = 0; i < 4; i++) plainBox(hinge, 210, 4, 2, M('#6b4524'), [-s * 105, 50 + i * 80, 8]); }
  // deck + ramp
  box(g, 700, 30, 330, mW, [550, 185, -150], 3, null, 3);
  for (const x of [250, 820]) box(g, 18, 70, 18, mD, [x, 235, -2], 2.2, null, 2);
  box(g, 600, 10, 12, mD, [540, 270, -2], 2, null, 1);
  const L = Math.hypot(RAMP.x1 - RAMP.x0, RAMP.y1), th = 22, ang = Math.atan2(RAMP.y1, RAMP.x1 - RAMP.x0);
  const rm = new THREE.Group(); rm.position.set((RAMP.x0 + RAMP.x1) / 2, RAMP.y1 / 2 - th / 2 * Math.cos(ang), (RAMP.z0 + RAMP.z1) / 2); rm.rotation.z = ang; g.add(rm);
  box(rm, L, th, RAMP.z1 - RAMP.z0, mW, [0, 0, 0], 3, null, 3);
  for (let i = 1; i < 15; i++) plainBox(rm, 8, 3, RAMP.z1 - RAMP.z0 - 6, mD, [-L / 2 + i * L / 15, th / 2 + 1.5, 0]);
  const post = []; for (let i = 0; i <= 5; i++) { const x = RAMP.x0 + 60 + i * (RAMP.x1 - 60 - RAMP.x0 - 60) / 5; const y = rampY(x); box(g, 14, 96, 14, mD, [x, y + 48, -2], 2, null, 2); post.push([x, y + 92]); }
  for (let i = 0; i < 5; i++) { const a = post[i], b = post[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); plainBox(g, l, 9, 9, mD, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, -2], [0, 0, Math.atan2(b[1] - a[1], b[0] - a[0])]); }
  return g;
}

/* ---------- ark interior (warm barn): floor, ribbed walls, hay, lanterns. Origin = floor centre. ---------- */
export function makeArkInside() {
  const g = new THREE.Group(), mW = WOOD(), mD = WOODD(), mHay = M('#ecd27a', '#c9a96a');
  const fl = new THREE.Mesh(new THREE.BoxGeometry(3600, 20, 2000), M('#c78f55', '#a8776e')); fl.position.set(0, -10, 0); g.add(fl);
  for (let i = -9; i <= 9; i++) plainBox(g, 3, 1.2, 2000, M('#8f5d33', '#7a5a60'), [i * 190, 0.8, 0]);
  const back = box(g, 3600, 1100, 30, M('#d6a066', '#b58478'), [0, 550, -1000], 0, null, 0);
  for (const s of [-1, 1]) box(g, 30, 1100, 2000, M('#cf9860', '#b58478'), [s * 1800, 550, 0], 0, null, 0);
  for (let x = -1500; x <= 1500; x += 300) { box(g, 36, 1000, 40, mD, [x, 500, -975], 2, null, 2); }
  for (let y = 120; y < 1000; y += 140) plainBox(g, 3560, 7, 4, mD, [0, y, -982]);
  for (let x = -1650; x <= 1650; x += 330) { box(g, 36, 1050, 40, mD, [x, 525, 0], 0, null, 0).position.set(x, 525, 0); }
  // ceiling beams (arches seen from inside) at the top
  for (let x = -1500; x <= 1500; x += 500) box(g, 60, 70, 1960, mD, [x, 1060, 0], 2.4, null, 2);
  // hay piles
  for (const [x, z, s] of [[-1300, -700, 1.3], [1300, -750, 1.1], [-900, -900, 0.9], [900, -900, 1.2], [0, -930, 1.5]]) { part(g, ell(140 * s, 70 * s, 100 * s, 20, 12), mHay, 2.6, [x, 20, z]); }
  g.userData.lamps = [];
  for (const [x, z] of [[-900, -500], [900, -500], [0, -700]]) { const l = makeLamp(560); l.position.set(x, 1060, z); g.add(l); g.userData.lamps.push(l); }
  return g;
}

/* ---------- night street: stone houses with warm windows, cobbles, crossroads, study-hall facade with a door ---------- */
export function makeStreet() {
  const g = new THREE.Group(); const mRoad = M('#6d6a78', '#55525f'), mWalk = M('#8a8694', '#6a6674');
  const rd = new THREE.Mesh(new THREE.BoxGeometry(5200, 20, 760), mRoad); rd.position.set(0, -10, 0); g.add(rd);
  const rd2 = new THREE.Mesh(new THREE.BoxGeometry(760, 20, 4200), mRoad); rd2.position.set(0, -10, 0); g.add(rd2);
  for (const [x, z, w, d] of [[-1900, -700, 1900, 600], [1900, -700, 1900, 600], [-1900, 1000, 1900, 1300], [1900, 1000, 1900, 1300]]) { box(g, w, 18, d, mWalk, [x, 4, z], 0, null, 0); }
  g.userData.win = [];
  const house = (x, z, w, h, d, c, face) => {
    const h0 = new THREE.Group(); h0.position.set(x, 0, z); h0.rotation.y = face; g.add(h0);
    box(h0, w, h, d, M(c, '#a39ab0'), [0, h / 2 + 10, 0], 3.4, null, 5);
    box(h0, w + 40, 26, d + 40, M('#9a8f99', '#7f7585'), [0, h + 22, 0], 2.6, null, 4);
    const rs = new THREE.Shape(); rs.moveTo(-d / 2 - 20, 0); rs.lineTo(d / 2 + 20, 0); rs.lineTo(0, 130); rs.lineTo(-d / 2 - 20, 0);
    const rg = new THREE.ExtrudeGeometry(rs, { depth: w + 40, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-(w + 40) / 2, h + 34, 0); part(h0, rg, M('#a8503f', '#8a6a78'), 3);
    const nx = Math.max(2, Math.round(w / 190)), ny = Math.max(1, Math.round(h / 230));
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const wx = -w / 2 + (i + 0.5) * w / nx, wy = 110 + j * 220 + (h - ny * 220) / 2 + 40;
      const on = ((i * 7 + j * 3 + Math.round(x / 100)) % 3) !== 0;
      box(h0, 84, 112, 8, M(on ? '#ffd37a' : '#4a4a66', on ? '#ffd37a' : '#3a3a55'), [wx, wy, d / 2 + 2], 2, null, 3);
      if (on) glow(h0, '#ffc860', 200, [wx, wy, d / 2 + 14], 0.35);
    }
  };
  house(-1500, -1000, 700, 520, 460, '#d7cbb6', 0); house(-700, -1030, 600, 640, 420, '#c9bda8', 0); house(1500, -1000, 760, 480, 460, '#cfc3ae', 0);
  house(-1500, 1700, 700, 560, 460, '#cdc2ae', Math.PI); house(1000, 1760, 700, 600, 420, '#d9cdb8', Math.PI); house(-700, 1750, 560, 480, 420, '#c3b8a4', Math.PI);
  house(-2300, 0, 560, 520, 420, '#d2c6b0', Math.PI / 2); house(2300, 0, 560, 560, 420, '#cabea9', -Math.PI / 2);
  // street lamps (dim) and the study-hall facade at (700,-1030)
  const hall = new THREE.Group(); hall.position.set(560, 0, -1030); g.add(hall);
  box(hall, 760, 560, 440, M('#e8d3a8', '#b9a39a'), [0, 290, 0], 3.4, null, 5);
  const rs2 = new THREE.Shape(); rs2.moveTo(-240, 0); rs2.lineTo(240, 0); rs2.lineTo(0, 160); rs2.lineTo(-240, 0);
  const rg2 = new THREE.ExtrudeGeometry(rs2, { depth: 800, bevelEnabled: false }); rg2.rotateY(Math.PI / 2); rg2.translate(-400, 570, 0); part(hall, rg2, M('#b45b3a', '#8a6a78'), 3);
  box(hall, 250, 380, 24, M('#ffe3a0', '#ffe3a0', 0), [0, 200, 232], 0, null, 4);          // warm lit doorway
  glow(hall, '#ffcf70', 700, [0, 200, 320], 0.55);
  const door = new THREE.Group(); door.position.set(-125, 0, 246); hall.add(door); box(door, 250, 380, 16, M('#9c6a3a', '#80606a'), [125, 190, 0], 2.8, null, 4); box(door, 36, 36, 20, M('#e3b24c'), [200, 180, 14], 1.8, null, 8);
  g.userData.door = door; g.userData.hallPos = hall.position;
  box(hall, 360, 24, 90, STONE(), [0, 12, 290], 2.4, null, 3);          // step
  for (const s of [-1, 1]) { box(hall, 200, 140, 8, M('#ffd37a', '#ffd37a', 0), [s * 260, 330, 232], 2, null, 3); glow(hall, '#ffc860', 260, [s * 260, 330, 250], 0.5); }
  for (const [x, z] of [[-520, -420], [800, 360], [-1100, 380], [1500, -330]]) { const lp = new THREE.Group(); lp.position.set(x, 0, z); g.add(lp); plainBox(lp, 10, 300, 10, M('#2f2c3a'), [0, 150, 0]); part(lp, ell(22, 28, 22, 14, 10), M('#ffdca0', '#ffdca0', 0), 1.8, [0, 320, 0]); glow(lp, '#ffd080', 260, [0, 320, 0], 0.55); }
  return g;
}

/* ---------- sky helpers, rain, water, rainbow, glow ring, sparkles ---------- */
export function makeSky() {
  const geo = new THREE.SphereGeometry(18000, 24, 16);
  const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, depthTest: false, uniforms: { uTop: { value: new THREE.Color('#79c0ea') }, uBot: { value: new THREE.Color('#fdf3dc') } },
    vertexShader: 'varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uTop; uniform vec3 uBot; varying float vY; void main(){ float k = smoothstep(-0.05, 0.75, vY); gl_FragColor = vec4(mix(uBot, uTop, k), 1.0); }' });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = -20; m.frustumCulled = false; return m;
}
export function makeRain(n, seed) {
  const pos = new Float32Array(n * 6), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.7, depthWrite: false });
  const ln = new THREE.LineSegments(geo, mat); ln.frustumCulled = false; ln.renderOrder = 25;
  const rnd = mulberry(seed || 7), R = []; for (let i = 0; i < n; i++) R.push([rnd(), rnd(), rnd(), rnd()]);
  /* c = centre of the rain box (world), ext = {w, h, d} half-width / height / depth */
  ln.userData.update = (t, c, amt, slant, ext) => {
    const sp = 1500, H = ext.h, W = ext.w, Dz = ext.d;
    ln.visible = amt > 0.01; mat.opacity = 0.75 * Math.min(1, amt);
    const cnt = Math.floor(n * Math.min(1, amt)); geo.setDrawRange(0, cnt * 2);
    for (let i = 0; i < n; i++) {
      const r = R[i], fy = ((r[1] - t * sp / H * (0.8 + 0.4 * r[3])) % 1 + 1) % 1;
      const x = (r[0] - 0.5) * W * 2 + c.x, y = fy * H + c.y, z = c.z + (r[2] - 0.5) * Dz * 2;
      const L = 60 + r[3] * 40;
      pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z; pos[i * 6 + 3] = x + L * slant; pos[i * 6 + 4] = y - L; pos[i * 6 + 5] = z;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return ln;
}
export function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function makeRainbow() {
  const g = new THREE.Group(), cols = ['#e8473f', '#f59a3b', '#f7d84a', '#6cc04a', '#3fa9e0', '#6a58c8'];
  cols.forEach((c, i) => { const R = 1750 - i * 62; const m = new THREE.Mesh(new THREE.TorusGeometry(R, 32, 10, 64, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, depthWrite: false })); g.add(m); });
  g.userData.mats = g.children.map(m => m.material); return g;
}
export function makeWater(w, d) {
  const g = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#58b9ea', transparent: true, opacity: 0.82, depthWrite: true }));
  g.add(m); g.userData.crests = [];
  const mc = new THREE.MeshBasicMaterial({ color: '#dff4ff', transparent: true, opacity: 0.9 });
  for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.TorusGeometry(40 + (i % 5) * 14, 4, 6, 20, Math.PI), mc); c.rotation.x = -Math.PI / 2; g.add(c); g.userData.crests.push(c); }
  g.userData.plane = m; return g;
}
export function glowRing(hex) {   // soft vertical halo arc (upper half circle, radius 1 in the xy plane) + a faint glow in the middle
  const g = new THREE.Group(), mk = o => new THREE.MeshBasicMaterial({ color: hex || '#ffcf6a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const m0 = mk(), m1 = mk();
  g.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 56, Math.PI), m0)); g.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.16, 8, 56, Math.PI), m1));
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: hex || '#ffcf6a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(2.4, 1.5, 1); sp.position.set(0, 0.35, 0); sp.renderOrder = 30; g.add(sp);
  g.userData.mats = [m0, m1, sp.material]; g.renderOrder = 30; return g;
}
export function makeSparkles(n, seed) {
  const g = new THREE.Group(), rnd = mulberry(seed || 3), sh = new THREE.Shape(); const R = 1, r = 0.22;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r : R; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const geo = new THREE.ShapeGeometry(sh); g.userData.items = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.renderOrder = 31; m.userData = { a: rnd(), b: rnd(), c: rnd(), d: rnd() }; g.add(m); g.userData.items.push(m); }
  return g;
}
export function makeCloudPuff(hex, tint) {
  const g = new THREE.Group(), m = M(hex, tint, 0);
  for (const [a, b, r] of [[0, 0, 90], [-90, -20, 65], [95, -18, 70], [40, 30, 60], [-40, 24, 56]]) part(g, ell(r, r * 0.78, r * 0.7), m, 5, [a, b, 0]);
  return g;
}
export function makeLeaf(hex) { const g = new THREE.Group(); part(g, ell(22, 7, 12, 10, 6), M(hex, '#c4cfc0', 0), 1.4); return g; }
export function makeArrow(hex) { // swirling curved arrow (abstract, no letters)
  const g = new THREE.Group(), pts = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 1.55; pts.push(V(Math.cos(a) * 90, i * 3, Math.sin(a) * 90)); }
  const m = M(hex, '#cfc0c8', 0); part(g, tubeAlong(pts, 8, { segs: 40, radial: 8 }), m, 1.6);
  const tip = new THREE.ConeGeometry(22, 48, 12); const p = pts[pts.length - 1], q = pts[pts.length - 2]; const d = p.clone().sub(q).normalize();
  tip.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d)); tip.translate(p.x, p.y, p.z); part(g, tip, m, 1.6); return g;
}
