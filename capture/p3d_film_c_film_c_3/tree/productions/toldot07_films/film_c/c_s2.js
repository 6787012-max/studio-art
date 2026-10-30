/* film_c shot 2: the sand comes from the Nile (36.8 - 84.8 s). ASCII only. */
import { THREE, sm, cl, frac, V, D2R, part, ell, tube, tubeAlong, lathe, toon, KT, W, GM, GB, R, B, GH, sky, cam, ease, lin, lerp, lerp3, blinkAt, flags, POST, fs, pose, talkL, CAMS, skyTo, show, handPos } from './c_core.js';
import { beachTick, sandStream, pour } from './c_s1.js';
import { mound } from './c_beach.js';
const PI = Math.PI, TERR = W.TERR, M = W.M, G = W.G;

/* ---------------------------------------------------------------- the relief map + extras */
export const MAP = KT.makeMedMap({ lat0: 24, segZ: 240 }); GM.add(MAP.root);
const L = (lon, lat, up) => MAP.lonlat(lon, lat, up);
export const NILE = new THREE.CatmullRomCurve3([[32.7, 25.5], [32.1, 26.3], [31.5, 27.0], [31.2, 27.8], [30.9, 28.6], [31.0, 29.3], [31.2, 30.0], [31.15, 30.7], [31.1, 31.3], [31.0, 31.9]].map(([a, b]) => V(...L(a, b, 7))));
const glowMat = new THREE.MeshBasicMaterial({ color: W.col('#fff2a0') });
const glowGeo = new THREE.TubeGeometry(NILE, 200, 4.6, 8, false);
const glow = new THREE.Mesh(glowGeo, glowMat); GM.add(glow); const GLOW_N = glowGeo.index.count;
const halo = new THREE.Mesh(new THREE.TubeGeometry(NILE, 200, 9, 8, false), new THREE.MeshBasicMaterial({ color: W.col('#ffe27a'), transparent: true, opacity: 0.35, depthWrite: false })); GM.add(halo);
// mountains of Africa (south)
const mtn = G(GM);
[[32.6, 24.6, 70, 70], [33.7, 24.8, 60, 54], [31.6, 24.7, 66, 58], [32.2, 25.1, 46, 44]].forEach(([lo, la, r, h], i) => {
  const p = L(lo, la, 0); const mm = part(mtn, new THREE.ConeGeometry(r, h, 9, 1).translate(0, h / 2, 0), M(i % 2 ? '#a9835a' : '#b99468', '#8a6a52', 0), 3.4, [p[0], p[1] - 4, p[2]]); mm.rotation.y = i;
  part(mtn, new THREE.ConeGeometry(r * 0.36, h * 0.3, 9, 1).translate(0, h * 0.86, 0), M('#f7f4ec', '#c9d0e0', 0), 0, [p[0], p[1] - 4, p[2]]).rotation.y = i; });
// grains riding the river, spilling into the sea
export const nileGr = W.makeParticles(110, '#e9c987'); GM.add(nileGr.mesh);
// pins
const pins = [[34.55, 31.67], [34.65, 31.8], [34.77, 32.08], [34.85, 32.33], [35.0, 32.82]].map(([lo, la], i) => {
  const g = G(GM), p = L(lo, la, 0), m = M(i === 4 ? '#2f7fd0' : '#e0453a', '#9a5a5a');
  part(g, new THREE.ConeGeometry(5, 24, 12).rotateX(PI).translate(0, 12, 0), m, 2); part(g, ell(8, 8, 8, 14, 10), m, 2.4, [0, 28, 0]); part(g, ell(3, 3, 3, 8, 6), M('#ffffff', '#fff', 0), 0, [2, 31, 6]);
  g.position.set(p[0], p[1], p[2]); g.visible = false; return g; });
// ruler along the route
const SC = MAP.sandCurve, RU = G(GM), ticks = []; let barMesh = null;
{ const bar = tubeAlong(Array.from({ length: 24 }, (_, i) => { const p = SC.getPointAt(i / 23 * 0.64); return V(p.x - 14, 9, p.z); }), 2.6, { segs: 60, radial: 8 });
  const m = part(RU, bar, M('#f2c14e', '#c9a24e', 0), 1.6); barMesh = m; for (let i = 0; i <= 30; i++) { const p = SC.getPointAt(i / 30 * 0.64), t = SC.getTangentAt(i / 30 * 0.64), big = i % 5 === 0;
    const b = new THREE.Mesh(new THREE.BoxGeometry(big ? 4 : 2.4, big ? 22 : 12, 2.4), new THREE.MeshBasicMaterial({ color: W.col('#2b2626') })); b.position.set(p.x - 14, 9 + (big ? 6 : 1), p.z); b.rotation.y = -Math.atan2(t.z, t.x); RU.add(b); ticks.push(b); } }
RU.visible = false;
const rulerLabel = W.makeLabel('650 km', 150, 54, 150); GM.add(rulerLabel); rulerLabel.visible = false;
// sweat drop for the tired grain
const sweat = part(GM, lathe([[0.01, 0], [5, 3], [7, 10], [5, 17], [0.01, 24]], 14), M('#7fd2f6', '#a8b6e6', 0), 1.6); sweat.visible = false;

export const backArrow = (() => { const g = G(GM), pts = [[34.9, 33.4], [34.5, 32.3], [33.9, 31.5], [33.2, 31.4], [32.0, 31.55], [31.0, 31.9]].map(([a, b]) => V(...L(a, b, 16)));
  const cv = new THREE.CatmullRomCurve3(pts); const geo = new THREE.TubeGeometry(cv, 100, 5.5, 8, false); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: W.col('#ffd23a') })); g.add(m);
  const head = new THREE.Mesh(new THREE.ConeGeometry(14, 30, 12), new THREE.MeshBasicMaterial({ color: W.col('#ffd23a') })); g.add(head);
  g.userData.set = u => { geo.setDrawRange(0, Math.floor(geo.index.count * u / 6) * 6); const p = cv.getPointAt(Math.min(u, 0.999)), t = cv.getTangentAt(Math.min(u, 0.999)); head.position.copy(p); head.quaternion.setFromUnitVectors(V(0, 1, 0), t); head.visible = u > 0.02; };
  g.visible = false; return g; })();
/* ---------------------------------------------------------------- bubble with the Nile (beach scene, c6) */
const bubble = (() => {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 384; const c = cv.getContext('2d');
  c.save(); c.beginPath(); c.ellipse(256, 192, 244, 178, 0, 0, 7); c.clip();
  const sg = c.createLinearGradient(0, 0, 0, 384); sg.addColorStop(0, '#7fc4ee'); sg.addColorStop(0.55, '#d6efff'); sg.addColorStop(1, '#fff1c8'); c.fillStyle = sg; c.fillRect(0, 0, 512, 384);
  c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(410, 90, 34, 0, 7); c.fill();
  const dune = (col, y0, amp, ph) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, 384); for (let x = 0; x <= 512; x += 8) c.lineTo(x, y0 + amp * Math.sin(x * 0.012 + ph)); c.lineTo(512, 384); c.fill(); };
  dune('#e9c987', 190, 22, 1); dune('#dcb272', 240, 26, 3); dune('#cf9f5e', 330, 20, 5);
  c.strokeStyle = '#3f93d4'; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(256, 400); c.bezierCurveTo(150, 330, 380, 280, 250, 210); c.bezierCurveTo(200, 190, 270, 170, 280, 160); c.stroke();
  c.strokeStyle = '#7fc4f0'; c.lineWidth = 8; c.beginPath(); c.moveTo(256, 400); c.bezierCurveTo(150, 330, 380, 280, 250, 210); c.stroke();
  c.strokeStyle = '#5f9e3e'; c.lineWidth = 7; c.setLineDash([2, 12]); c.beginPath(); c.moveTo(230, 400); c.bezierCurveTo(120, 330, 350, 270, 225, 205); c.stroke(); c.setLineDash([]);
  [[110, 270], [400, 300], [330, 215]].forEach(([x, y]) => { c.strokeStyle = '#7e5534'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 6, y - 24, x, y - 48); c.stroke(); c.fillStyle = '#5f9e3e';
    for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(x + Math.cos(k * 1.05) * 22, y - 50 + Math.sin(k * 1.05) * 8, 20, 5, k * 1.05 * 0.5, 0, 7); c.fill(); } });
  c.restore(); c.strokeStyle = '#261c19'; c.lineWidth = 9; c.beginPath(); c.ellipse(256, 192, 244, 178, 0, 0, 7); c.stroke();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
  const g = new THREE.Group(), pl = new THREE.Mesh(new THREE.PlaneGeometry(190, 142), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); g.add(pl);
  [[-70, -88, 14], [-88, -112, 9], [-98, -130, 6]].forEach(([x, y, r]) => { const d = new THREE.Mesh(new THREE.CircleGeometry(r, 20), new THREE.MeshBasicMaterial({ color: W.col('#ffffff') })); d.position.set(x, y, 0); g.add(d);
    const o = new THREE.Mesh(new THREE.RingGeometry(r, r + 2.2, 20), new THREE.MeshBasicMaterial({ color: W.col('#261c19') })); o.position.set(x, y, 0.1); g.add(o); });
  g.visible = false; GB.add(g); return g;
})();

/* ---------------------------------------------------------------- shot 2 */
const bFace = (T, st, off) => Object.assign({ expr: 'smile', blink: blinkAt(T, off || 0.6), look: [0, 0] }, st);
export function shot2(lt, T) {
  let cam2;
  if (lt < 38.72) {
    show(GM, GH); skyTo('day'); MAP.update(T);
    const hop = (u, ph) => ({ walk: 1, ph, hopH: 46 });
    const gp = (x, y, z, extra) => pose(GH, Object.assign({ t: T, x, y, z, yaw: -0.65, shadow: false }, extra));
    backArrow.visible = false;
    glow.visible = halo.visible = lt < 16.64 + 8; mtn.visible = true;
    const gk = lt < 7.76 ? ease(lt, 0.6, 6.4) : 1; glowGeo.setDrawRange(0, Math.floor(GLOW_N * gk / 6) * 6); halo.geometry.setDrawRange(0, Math.floor(GLOW_N * gk / 6) * 6);
    glowMat.color.set(0xfff2a0).multiplyScalar(0.8 + 0.2 * Math.sin(T * 6));
    GH.root.scale.setScalar(0.2);
    MAP.setSand(T, lt >= 16.64 ? 1 : 0); nileGr.mesh.visible = lt >= 7.76 && lt < 16.64; ticks.length;
    pins.forEach(p => { p.visible = false; }); RU.visible = false; rulerLabel.visible = false; sweat.visible = false;
    for (let i = 0; i < nileGr.n; i++) nileGr.hide(i); nileGr.commit();
    if (lt < 7.76) {                                           /* c1: the Nile line glows from the south down to its delta */
      const mp = L(31.0, 31.9, 0), tip = NILE.getPointAt(Math.min(gk, 0.999));
      gp(tip.x, tip.y - 2, tip.z, hop(1, T * 0.9)); fs(GH, { expr: lt < 4 ? 'curious' : 'happy', blink: blinkAt(T, 0.5), look: [0.4, 0] });
      cam2 = CAMS(lt, [{ t0: 0, t1: 3.6, p: [380, 820, 1650], p1: [760, 600, 1500], l: [1050, 0, 700], l1: [1200, 0, 780], f: 34 },
        { t0: 3.6, t1: 7.76, p: [1560, 190, 1380], p1: [1470, 150, 760], l: [1220, 10, 1180], l1: [1230, 5, 560], f: 32 }]);
    } else if (lt < 16.64) {                                   /* c2: grains wash down from the mountains of Africa into the sea */
      const k = lt - 7.76, u = ease(lt, 8.4, 15.4), tip = NILE.getPointAt(Math.min(0.999, u)), tg = NILE.getTangentAt(Math.min(0.999, u));
      for (let i = 0; i < nileGr.n; i++) { const s = frac(i * 0.61803 + k * 0.075), p = NILE.getPointAt(Math.min(0.999, s)), j = ((i * 37) % 11 - 5) * 1.7;
        nileGr.set(i, p.x + j, p.y + 3 + 1.5 * Math.sin(T * 5 + i), p.z + ((i * 53) % 9 - 4) * 1.5, 3.4 + (i % 3) * 0.7); } nileGr.commit();
      gp(tip.x, tip.y - 2, tip.z, { walk: 1, ph: u * 11, hopH: 40, yaw: -Math.atan2(tg.z, tg.x) });
      fs(GH, { expr: lt < 12 ? 'surprised' : 'happy', blink: blinkAt(T, 0.5), look: [0.3, 0.2] });
      if (lt < 12.4) cam2 = CAMS(lt, [{ t0: 7.76, t1: 12.4, p: [1480, 150, 1500], p1: [1400, 130, 1330], l: [1200, 20, 1240], l1: [1200, 10, 1120], f: 32 }]);
      else cam2 = { p: [tip.x + 220, 150, tip.z + 200], l: [tip.x - 30, 10, tip.z - 20], fov: 33 };
    } else if (lt < 24) {                                      /* c3: the waves carry the sand north-east along the coast */
      const u = 0.02 + 0.6 * ease(lt, 16.9, 23.6), p = SC.getPointAt(u), dist = u * SC.getLength();
      gp(p.x, -6, p.z, { walk: 1, ph: dist / 38, hopH: 46 }); fs(GH, { expr: lt < 18.5 ? 'curious' : 'happy', blink: blinkAt(T, 0.5), look: [0.4, 0] });
      cam2 = { p: [p.x + 210, 170, p.z + 250], l: [p.x - 40, 0, p.z - 70], fov: 34 };
    } else if (lt < 32.12) {                                   /* c4: pins pop along the coast, the grain hops from pin to pin */
      const times = [24.8, 26.3, 27.8, 29.3, 30.9], k = lt;
      pins.forEach((p, i) => { const e = ease(k, times[i], times[i] + 0.5), ov = e + 0.25 * Math.sin(Math.PI * e) * (1 - e); p.visible = e > 0.001; p.scale.setScalar(Math.max(0.001, i === 4 ? 1.1 * ov : ov)); p.position.y = MAP.lonlat(0, 0, 0)[1] * 0 + 6; });
      let from = SC.getPointAt(0.02), cur = 0; const pp = pins.map(p => p.position);
      let gx, gz, hopu = 0;
      const stops = [[1480, 585], [1488, 570], [1492, 542], [1494, 517], [1499, 468]];
      stops.forEach((s, i) => { stops[i] = [pins[i].position.x, pins[i].position.z]; });
      let seg = -1; for (let i = 0; i < 5; i++) if (k >= times[i] + 0.3) seg = i;
      const a = seg < 0 ? [1470, 598] : stops[seg], b = seg < 4 ? stops[seg + 1] : stops[4], t0 = seg < 0 ? 24.0 : times[seg] + 0.3, t1 = seg < 4 ? times[seg + 1] + 0.2 : 32.1;
      const hu = lin(k, t0 + 0.2, Math.min(t1, t0 + 1.0)); gx = lerp(a[0], b[0], seg === 4 ? 0 : sm(hu)); gz = lerp(a[1], b[1], seg === 4 ? 0 : sm(hu));
      const arc = seg === 4 ? 0 : 4 * hu * (1 - hu) * 34;
      gp(gx - 18, arc - 2, gz, { walk: 0, squash: seg === 4 && lt > 31 ? 0.15 * Math.sin((lt - 31) * 9) : 0, yaw: -2.6 });
      fs(GH, { expr: seg >= 4 ? 'cheering' : 'happy', blink: seg < 4 && blinkAt(T, 0.5), look: [0.3, 0.3] });
      cam2 = CAMS(lt, [{ t0: 24, t1: 32.12, p: [1700, 120, 640], p1: [1650, 135, 520], l: [1485, 14, 560], l1: [1495, 14, 500], f: 32 }]);
      if (lt < 24.9) cam2 = { p: [1640, 150, 700], l: [1480, 10, 590], fov: 33 };
    } else {                                                   /* c5: a long journey, 650 km: the ruler line, the grain wipes its brow */
      const re = ease(lt, 32.7, 35.4); RU.visible = true; ticks.forEach((tk, i) => { tk.visible = i / ticks.length <= re + 0.02; }); { const n = barMesh.geometry.index.count, d = Math.floor(n * re / 6) * 6; barMesh.geometry.setDrawRange(0, d); barMesh.userData.hull.geometry.setDrawRange(0, d); }
      rulerLabel.visible = lt > 34.2; rulerLabel.scale.setScalar(0.5 + 0.5 * ease(lt, 34.2, 34.8));
      MAP.setSand(T, 0.35);
      const hp = SC.getPointAt(0.62);
      gp(hp.x, -2, hp.z, { walk: 0, tilt: lt > 36 ? 9 * Math.sin((lt - 36) * 4) : 0, squash: lt > 35.6 ? 0.06 * Math.sin((lt - 35.6) * 3) : 0, yaw: -2.2 });
      fs(GH, { expr: lt > 35.4 ? 'tired' : 'happy', blink: blinkAt(T, 0.5), look: [0.3, -0.1] });
      cam2 = CAMS(lt, [{ t0: 32.12, t1: 38.72, p: [900, 560, 960], p1: [1150, 480, 1010], l: [1430, 0, 520], l1: [1400, 0, 520], f: 34 }]);
      if (!flags.collect) {
        const lp = SC.getPointAt(0.32); rulerLabel.position.set(lp.x - 80, 70, lp.z + 6); POST.push(() => rulerLabel.quaternion.copy(cam.quaternion));
        const sw = ease(lt, 36.1, 36.9); sweat.visible = lt > 36.1 && lt < 37.4; sweat.position.set(hp.x + 10 + 40 * sw, 55 + 24 * sw - 70 * sw * sw, hp.z + 8); sweat.scale.setScalar(Math.max(0.01, 1 - sw * 0.4));
      }
    }
  } else {                                                      /* c6: back on our beach: the sand in his hand came from the Nile */
    show(GB, B, R, GH); skyTo('day'); beachTick(T, { blow1: 0.3 });
    const bx = 80, bz = 430, yawB = -PI / 2 + 1.0;
    mound.visible = false;
    pose(B, { t: T, x: bx, z: bz, yaw: yawB, walk: 0, lean: 4, headTilt: 10, arms: { r: { sz: 0.5, sx: 0.12, el: 0.85, curl: 0.2 } } }, TERR(bx, bz));
    fs(B, bFace(T, { expr: lt > 41.5 ? 'surprised' : 'thinking', look: [0.1, -0.5] }, 0.6));
    pose(R, { t: T, x: bx - 300, z: bz + 120, yaw: -PI / 2 + 0.45, walk: 0, headYaw: 0.1, headTilt: 3 * Math.sin(T * 1.4), arms: { r: { sz: 0.9 * ease(lt, 40.5, 41.2), sx: 0.2, el: 0.5, point: true } } }, TERR(bx - 300, bz + 120));
    fs(R, { expr: lt < 40 ? 'explaining' : 'smile', talk: talkL(lt, 39, 43), blink: blinkAt(T, 0.1), look: [0.3, 0] });
    B.root.updateMatrixWorld(true); const h = handPos(B, 1);
    pose(GH, { t: T, x: h[0] + 4, y: h[1] + 8, z: h[2], yaw: yawB, walk: 0, shadow: false, squash: 0.03 * Math.sin(T * 3) }); GH.root.scale.setScalar(0.3);
    fs(GH, { expr: lt > 41 ? 'cheering' : 'happy', blink: blinkAt(T, 0.3), look: [0.1, 0.4] });
    for (let i = 0; i < sandStream.n; i++) sandStream.hide(i); sandStream.commit();
    const be = ease(lt, 41.2, 42.2); bubble.visible = lt > 41.2; bubble.scale.setScalar(Math.max(0.01, be));
    cam2 = CAMS(lt, [{ t0: 38.72, t1: 47.6, p: [h[0] + 260, h[1] + 20, h[2] + 800], p1: [h[0] + 200, h[1] + 30, h[2] + 700], l: [h[0] + 10, h[1] + 70, h[2]], l1: [h[0] + 10, h[1] + 85, h[2]], f: 32 }]);
    if (!flags.collect) { bubble.position.set(h[0] + 30, h[1] + 175, h[2] + 20); POST.push(() => bubble.quaternion.copy(cam.quaternion)); }
  }
  if (lt < 38.72) { bubble.visible = false; }
  return cam2;
}
