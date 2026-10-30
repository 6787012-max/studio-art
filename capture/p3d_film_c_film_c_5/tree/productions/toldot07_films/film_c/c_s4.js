/* film_c shot 4: kurkar - old sand turns to rock (141.3 - 188.0 s). ASCII only. */
import { THREE, sm, cl, frac, V, D2R, part, ell, tube, tubeAlong, lathe, toon, KT, W, GB, GC, GM, R, B, GH, GX, TI, sky, cam, ease, lin, lerp, lerp3, blinkAt, flags, POST, fs, pose, talkL, CAMS, skyTo, show, handPos } from './c_core.js';
import { beachTick, sandStream, pour } from './c_s1.js';
import { dune, tufts, clock, gdH, mound } from './c_beach.js';
import { MAP, backArrow } from './c_s2.js';
const PI = Math.PI, TERR = W.TERR, M = W.M, G = W.G, GD = W.GD, rng = W.rng;

/* ---------------------------------------------------------------- diorama set */
{ const f = new THREE.Mesh(new THREE.CircleGeometry(7000, 40).rotateX(-PI / 2), toon('#a6cf74', { tint: '#8fb868', hi: 0 })); f.position.y = -2; GC.add(f); }
const SAND = W.col('#e9c987');
export const slice = (() => {
  const g = G(GC), s = new THREE.Shape(), Wd = 720, hump = x => 150 + 135 * Math.exp(-Math.pow(x / 210, 2)) - 0.0;
  s.moveTo(-Wd / 2, 0); s.lineTo(Wd / 2, 0); for (let x = Wd / 2; x >= -Wd / 2; x -= 20) s.lineTo(x, hump(x)); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 150, bevelEnabled: false }); geo.translate(0, 0, -75);
  part(g, geo, M('#e6c27c', '#c9a46a', 0), 3.4);
  const r = rng(14), gr = W.makeParticles(560, '#ffffff', new THREE.SphereGeometry(1, 7, 5).scale(1, 0.8, 0.25)); g.add(gr.mesh);
  const cols = ['#d9b36a', '#f2d894', '#c99a52', '#e8c27c']; let n = 0;
  for (let i = 0; i < 1600 && n < gr.n; i++) { const x = (r() - 0.5) * (Wd - 20), y = 8 + r() * 400; if (y > hump(x) - 12) continue; gr.set(n, x, y, 76.5, 7 + r() * 5); gr.mesh.setColorAt(n, W.col(cols[Math.floor(r() * 4)])); n++; }
  for (; n < gr.n; n++) gr.hide(n); gr.commit(); gr.mesh.instanceColor.needsUpdate = true;
  const sh = W.makeParticles(70, '#ffffff', new THREE.SphereGeometry(1, 8, 6).scale(1, 0.7, 0.3)); g.add(sh.mesh); const pcs = [];
  for (let i = 0; i < 70; i++) { const x = (r() - 0.5) * 560, y = 70 + r() * 230; if (y > hump(x) - 25) { i--; continue; } pcs.push({ x, y, s: 10 + r() * 7, a: r() * 6 }); sh.mesh.setColorAt(i, W.col(['#f6c9b2', '#fff1e4', '#e9b9c4'][i % 3])); }
  sh.mesh.instanceColor.needsUpdate = true;
  g.userData = { sh, pcs, hump };
  return g;
})();
const bx0 = 2200;     // close-up cluster / block
export const cluster = (() => {
  const g = G(GC, [bx0, 0, 0]);
  part(g, new THREE.BoxGeometry(1500, 900, 20).translate(0, 350, -160), M('#d9ba7c', '#c9a46a', 0), 0);
  const r = rng(31), dots = W.makeParticles(160, '#b98f4c'); g.add(dots.mesh); for (let i = 0; i < 160; i++) { dots.set(i, (r() - 0.5) * 1400, -50 + r() * 800, -146, 9 + r() * 12); } dots.commit();
  part(g, ell(700, 240, 90, 36, 16), M('#f0d89c', '#dcc08a', 0), 3, [0, 0, -110]); for (let i = 0; i < 4; i++) { const t = KT.makeGrassTuft(i + 90, { col: '#8fb55a', h: 70, n: 9 }); t.position.set(-420 + i * 260, 215, -100); g.add(t); }
  const bridges = [], beads = [];
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: W.col('#fff0a0'), transparent: true, opacity: 0.9, depthWrite: false })); b.visible = false; g.add(b); beads.push(b); }
  const bm = M('#dfc088', '#c9a46a', 0), br = [];
  for (let i = 0; i < 6; i++) { const m = part(g, tubeAlong([V(0, 0, 0), V(15, 10, 0), V(30, 0, 0)], 7, { segs: 8, radial: 8 }), bm, 1.6); m.visible = false; br.push(m); }
  const block = G(g, [0, 0, 0]);
  const kmat = toon('#dba76c', { tint: '#b98a68', hi: 0, regions: [100, 55, 10, -35, -80].map((b, i) => ({ below: b, c: ['#e8c08a', '#d9a868', '#c98a55', '#b5653d', '#d9a868'][i], x0: 0, xHalf: 1e4 })) });
  part(block, rockGeo2(), kmat, 3.6, [0, 110, 0]); const rr = rng(4); for (let i = 0; i < 18; i++) part(block, ell(7, 5, 4, 8, 6), M('#8a5a3a', '#8a5a3a', 0), 0, [(rr() - 0.5) * 300, 130 + rr() * 170, 108]);
  block.visible = false; g.userData = { dots, beads, br, block, kmat };
  return g;
})();
function rockGeo2() { return W.rockGeo(165, 120, 105, 17, 0.07); }
// triptych at x = 4400
const tx0 = 4400;
const tri = (() => {
  const g = G(GC, [tx0, 0, 0]); const m = M('#e9c987', '#c9a46a', 0);
  part(g, ell(170, 80, 150, 30, 16), M('#f0d89c', '#dcc08a', 0), 3.2, [0, 10, 0]);
  for (let i = 0; i < 3; i++) { const t = KT.makeGrassTuft(i + 40, { col: '#8fb55a', h: 60, n: 9 }); t.position.set(-60 + i * 55, 66 - Math.abs(i - 1) * 14, -30 + i * 10); g.add(t); }
  const kb = G(g, [440, 0, 0]); part(kb, W.rockGeo(110, 80, 90, 9, 0.07), cluster.userData.kmat, 3.4, [0, 60, 0]);
  const arr = [0, 1, 2].map(i => { const a = i === 0 ? [-380, 80, 30, -70, 110, 30] : i === 1 ? [70, 90, 30, 300, 110, 30] : [330, 200, 0, 0, 380, 0];
    const c = i < 2 ? new THREE.QuadraticBezierCurve3(V(i === 0 ? -250 : 190, 80, 30), V(i === 0 ? -190 : 250, 190, 30), V(i === 0 ? -50 : 330, 90, 30)) : new THREE.CubicBezierCurve3(V(440, 190, 0), V(330, 470, 0), V(-330, 470, 0), V(-440, 130, 0));
    const geo = new THREE.TubeGeometry(c, 40, 7, 8, false); const mm = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: W.col('#ffd23a') })); g.add(mm);
    const hd = new THREE.Mesh(new THREE.ConeGeometry(18, 38, 12), new THREE.MeshBasicMaterial({ color: W.col('#ffd23a') })); g.add(hd); return { c, geo, hd }; });
  g.userData.arr = arr; return g;
})();
const setArrow = (a, u) => { a.geo.setDrawRange(0, Math.floor(a.geo.index.count * u / 6) * 6); const p = a.c.getPointAt(Math.min(0.999, Math.max(0.001, u))), t = a.c.getTangentAt(Math.min(0.999, Math.max(0.001, u))); a.hd.position.copy(p); a.hd.quaternion.setFromUnitVectors(V(0, 1, 0), t); a.hd.visible = u > 0.03; };

/* ---------------------------------------------------------------- shot 4 */
const bFace = (T, st, off) => Object.assign({ expr: 'smile', blink: blinkAt(T, off || 0.6), look: [0, 0] }, st);
export function shot4(lt, T) {
  let cm; const yawB = -PI / 2 + 1.0, bx = 80, bz = 430;
  const hid = () => { for (let i = 0; i < sandStream.n; i++) sandStream.hide(i); sandStream.commit(); };
  if (lt < 8.56) {                                       /* c1: very old sand stays in place: seasons and years pass */
    show(GB, R, B); const cyc = Math.sin((lt - 0.4) * 2 * PI / 2.0) * 0.5 + 0.5, yr = lin(lt, 0.4, 8.5);
    skyTo('day', 'dry', 0.9 * (0.5 + 0.5 * Math.sin((lt - 0.4) * 2 * PI / 2.0 - 1.2)));
    beachTick(T, { blow1: 0, blow2: 0.15, dune: 1 }); mound.visible = false;
    tufts.set(true, 0.25 + 0.75 * Math.pow(Math.sin(yr * 4 * PI / 1) * 0.5 + 0.5, 1), 0.5 - 0.5 * Math.cos((lt - 0.4) * 2 * PI / 2.0));
    clock.visible = true; clock.position.set(GD.x - 380, TERR(GD.x - 380, GD.z - 330) + 330, GD.z - 330); clock.rotation.y = -PI / 2; clock.userData.set((lt - 0.4) * 5);
    pose(R, { t: T, x: GD.x - 700, z: GD.z + 90, yaw: 0.25, headYaw: 0.3, walk: 0 }, gdH(GD.x - 700, GD.z + 90, 1)); fs(R, { expr: lt > 4 ? 'surprised' : 'smile', blink: blinkAt(T, 0.1), look: [0.5, 0.1] });
    pose(B, { t: T, x: GD.x - 680, z: GD.z + 200, yaw: 0.4, headYaw: 0.1, walk: 0 }, gdH(GD.x - 680, GD.z + 200, 1)); fs(B, bFace(T, { expr: lt > 4 ? 'surprised' : 'smile', look: [0.6, 0.2] }, 0.3));
    cm = CAMS(lt, [{ t0: 0.4, t1: 8.56, p: [GD.x - 1250, 245, GD.z - 260], p1: [GD.x - 1100, 250, GD.z - 160], l: [GD.x - 150, 245, GD.z + 20], l1: [GD.x - 100, 245, GD.z + 60], f: 34 }]);
  } else if (lt < 24.88) {                               /* c2 + c3: rain dissolves shell pieces, the glue holds grain to grain */
    show(GC); skyTo('lab'); const U = slice.userData;
    if (lt < 16.72) {
      show(...TI); slice.visible = true; cluster.visible = false; tri.visible = false;
      const front = 340 - 300 * ease(lt, 9.4, 16.2);
      for (let i = 0; i < U.pcs.length; i++) { const p = U.pcs[i], s = sm((front - p.y + 6) / 40) * 0 + (p.y > front ? sm(1 - (p.y - front) / 36) * 0 : 1); const d = cl((p.y - front) / 30, 0, 1); U.sh.set(i, p.x, p.y, 76.5, p.s * (1 - d)); } U.sh.commit();
      TI.forEach((t, i) => { const x = [-190, 10, 200][i], y = lerp(520 + i * 40, front + 20 + i * 8, ease(lt, 8.6 + i * 0.5, 14 + i * 0.4)), sc = 0.3 * (1 - 0.35 * ease(lt, 12, 16.5));
        pose(t, { t: T, x, y, z: 100, yaw: -PI / 2 + 0.3, walk: 0, float: 0, arms: i === 1 ? 'up' : 'down', shadow: false }); t.root.scale.setScalar(sc);
        fs(t, { expr: ['happy', 'surprised', 'cheering'][i], blink: blinkAt(T, i * 0.3), look: [0, -0.4] }); });
      cm = CAMS(lt, [{ t0: 8.56, t1: 12.8, p: [0, 250, 1120], p1: [30, 240, 1000], l: [0, 190, 0], f: 33 }, { t0: 12.8, t1: 16.72, p: [-130, 230, 640], p1: [-60, 190, 560], l: [-60, 210, 0], l1: [-30, 170, 0], f: 33 }]);
    } else {
      show(...GX.slice(0, 5)); slice.visible = false; cluster.visible = true; tri.visible = false; const U2 = cluster.userData; U2.block.visible = false;
      const pos = [[-190, 0], [0, 0], [190, 0], [-95, 125], [95, 125]];
      const gl = ease(lt, 19.5, 22), k = lt - 16.72;
      GX.slice(0, 5).forEach((g, i) => { const [px, py] = pos[i]; pose(g, { t: T, x: bx0 + px, y: py + 10 * 0, z: 0, yaw: -PI / 2 + 0.15 * (i - 2) * 0.4, walk: 0, tilt: 3 * Math.sin(T * 2 + i), squash: 0.03 * Math.sin(T * 3 + i), shadow: true }); g.root.scale.setScalar(0.72);
        fs(g, { expr: gl > 0.5 ? 'cheering' : 'curious', blink: blinkAt(T, i * 0.21), look: [(i - 2) * 0.2, 0.1] }); });
      const pairs = [[0, 1], [1, 2], [3, 4], [0, 3], [1, 3], [1, 4]];
      U2.br.forEach((m, i) => { const [a, b] = pairs[i], A = pos[a], Bp = pos[b]; const show2 = ease(lt, 17.8 + i * 0.35, 18.8 + i * 0.35);
        m.visible = show2 > 0.05; const mx = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2 + 78; m.position.set(bx0 + mx - 0, my, 40); m.rotation.z = Math.atan2(Bp[1] - A[1], Bp[0] - A[0]) - 0; m.scale.set(Math.hypot(Bp[0] - A[0], Bp[1] - A[1]) / 30 * show2, 1, 1); m.position.x = bx0 + A[0]; m.position.y = A[1] + 78;
        const bd = U2.beads[i]; bd.visible = gl > 0.02; bd.position.set(bx0 + mx, my, 48); bd.scale.setScalar((9 + 7 * gl) * (1 + 0.15 * Math.sin(T * 7 + i))); bd.material.opacity = 0.55 + 0.4 * gl; });
      cm = CAMS(lt, [{ t0: 16.72, t1: 24.88, p: [bx0 + 20, 190, 800], p1: [bx0 - 10, 200, 620], l: [bx0, 140, 0], f: 33 }]);
    }
  } else if (lt < 31.51) {                               /* c4: the soft sand becomes rock: kurkar */
    show(GC, ...GX.slice(0, 5)); slice.visible = false; cluster.visible = true; tri.visible = false; skyTo('lab'); const U2 = cluster.userData;
    const e = ease(lt, 25.6, 29.0), pos = [[-190, 0], [0, 0], [190, 0], [-95, 125], [95, 125]];
    GX.slice(0, 5).forEach((g, i) => { const [px, py] = pos[i]; pose(g, { t: T, x: bx0 + px * (1 - 0.7 * e), y: py * (1 - 0.6 * e), z: 0, walk: 0, yaw: -PI / 2, shadow: false }); g.root.scale.setScalar(0.72 * (1 - e) + 0.001); fs(g, { expr: 'cheering', blink: false, look: [0, 0] }); g.root.visible = e < 0.98; });
    U2.block.visible = e > 0.02; U2.block.scale.setScalar(0.2 + 0.8 * e); U2.block.position.y = 0; if (!flags.collect) U2.kmat.uniforms.uColor.value.copy(SAND).lerp(W.col('#dba76c'), ease(lt, 27, 30.5));
    U2.beads.forEach((b, i) => { b.visible = e < 0.9 && i < 5; b.scale.setScalar(16 * (1 - e)); }); U2.br.forEach(m => { m.visible = e < 0.5; });
    cm = CAMS(lt, [{ t0: 24.88, t1: 31.51, p: [bx0 + 60, 210, 760], p1: [bx0 - 30, 190, 600], l: [bx0, 120, 0], f: 33 }]);
  } else if (lt < 38.14) {                               /* c5: rub a piece of kurkar and sand falls: the grains cheer */
    show(GB, B, R, ...GX.slice(0, 3)); skyTo('day'); beachTick(T, { blow1: 0.3 }); mound.visible = false; const k = lt - 31.51;
    const rub = Math.sin(k * 20) * 0.1 * ease(k, 1, 1.6);
    pose(B, { t: T, x: bx, z: bz, yaw: yawB, walk: 0, headTilt: 12, lean: 6, arms: { r: { sz: 0.7 + rub, sx: 0.35, el: 1.25, curl: 0.5 }, l: { sz: 0.7 - rub, sx: 0.35, el: 1.25, curl: 0.5 } } }, TERR(bx, bz));
    fs(B, bFace(T, { expr: k > 3.6 ? 'surprised' : 'thinking', look: [0.1, -0.5] }, 0.6));
    pose(R, { t: T, x: bx - 300, z: bz + 120, yaw: -PI / 2 + 0.45, walk: 0, headYaw: 0.1, headTilt: 3 * Math.sin(T * 1.4) }, TERR(bx - 300, bz + 120)); fs(R, { expr: 'smile', blink: blinkAt(T, 0.1), look: [0.3, 0] });
    B.root.updateMatrixWorld(true); const hr = handPos(B, 1), hl = handPos(B, 0), mid = [(hr[0] + hl[0]) / 2, (hr[1] + hl[1]) / 2, (hr[2] + hl[2]) / 2];
    if (!flags.collect) { kurkarPiece().visible = true; kurkarPiece().position.set(mid[0], mid[1] + 2, mid[2]); kurkarPiece().rotation.y = 0.5; kurkarPiece().scale.setScalar(0.9 - 0.25 * lin(k, 1.5, 6.4)); }
    pour(T, [mid[0], mid[1] - 8, mid[2]], ease(k, 1.4, 2.4) * (1 - ease(k, 6.2, 6.6)));
    GX.slice(0, 3).forEach((g, i) => { const pop = ease(k, 3.6 + i * 0.35, 4.1 + i * 0.35), jump = Math.abs(Math.sin((k - 4) * 6 + i * 2)) * 24 * pop;
      pose(g, { t: T, x: bx + 70 + i * 50, z: bz + 110 + (i % 2) * 40, y: TERR(bx, bz) + jump, yaw: -PI / 2 + 0.3, walk: 0, shadow: true, squash: pop * 0.05 }); g.root.scale.setScalar(0.001 + 0.2 * pop);
      fs(g, { expr: 'cheering', blink: false, look: [0, 0] }); });
    cm = CAMS(lt, [{ t0: 31.51, t1: 38.14, p: [260, 150, 1120], p1: [220, 140, 1010], l: [bx + 30, 120, bz + 40], f: 32 }]);
  } else {                                               /* c6: grain -> dune -> kurkar -> back to the Nile */
    const k = lt - 38.14;
    if (k < 4.4) {
      show(GC, GH); slice.visible = false; cluster.visible = false; tri.visible = true; skyTo('lab'); const A = tri.userData.arr;
      setArrow(A[0], ease(k, 0.6, 1.8)); setArrow(A[1], ease(k, 2.0, 3.2)); setArrow(A[2], ease(k, 3.4, 4.3));
      pose(GH, { t: T, x: tx0 - 350, z: 0, y: 4, yaw: -PI / 2 + 0.2, walk: k > 0.2 && k < 0.6 ? 1 : 0, ph: k * 3, shadow: true, squash: 0.04 * Math.sin(T * 4) }); GH.root.scale.setScalar(0.62);
      fs(GH, { expr: k < 3.3 ? 'happy' : 'cheering', blink: blinkAt(T, 0.3), look: [0.3, 0.2] });
      cm = CAMS(lt, [{ t0: 38.14, t1: 42.54, p: [tx0 - 100, 330, 1250], p1: [tx0 + 40, 300, 1110], l: [tx0, 160, 0], f: 34 }]);
    } else {
      show(GM, GH); skyTo('day'); MAP.update(T); backArrow.visible = true; const u = ease(lt, 42.9, 45.6); backArrow.userData.set(Math.max(0.001, u)); MAP.setSand(T, 0);
      const SC = MAP.sandCurve, p = SC.getPointAt(Math.max(0.001, 0.62 - 0.6 * u)), dist = 0.6 * u * SC.getLength();
      pose(GH, { t: T, x: p.x, y: -4, z: p.z, yaw: 2.4, walk: u > 0.01 && u < 0.99 ? 1 : 0, ph: dist / 38, hopH: 46, shadow: false }); GH.root.scale.setScalar(0.2);
      fs(GH, { expr: 'cheering', blink: false, look: [0.3, 0.3] });
      cm = CAMS(lt, [{ t0: 42.54, t1: 46.7, p: [900, 560, 1000], p1: [1100, 500, 940], l: [1400, 0, 520], l1: [1380, 0, 500], f: 34 }]);
    }
  }
  return cm;
}
import { kurkarPiece as _kp } from './c_beach.js';
function kurkarPiece() { return _kp; }
GB.add(_kp);
