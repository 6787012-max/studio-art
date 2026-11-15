/* film_z map stations (the wooden table with the relief map): 1 map + compass, 2 three strips, 4 green/gold split, 8 lake, 9 Dead Sea. ASCII only. No people, no text (digits -440 only). */
import * as THREE from 'three';
import { track } from '../../gezer_trip/film_a/gz_kit2.js';
import * as K from '../kit10g.js';
import { makeGlowDigits } from '../film_s5/s5_props.js';
const { cl, ramp, pop, lam, phong, shadowable, mapY, ll } = K;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const tp = (lt, a, b, c, d, e) => ({ side: 1, xf: 0.78, size: 0.2, expr: a, arms: b, hop: c || 0, show: 1 });
const CAM = (cam, lt, keys) => { const c = track(lt, keys); cam.position.set(...c.p); cam.lookAt(...c.l); };
const pinAt = (grp, lat, lon, col) => { const [x, z] = ll(lat, lon), p = K.makePin(col); p.userData.k = 2; p.position.set(x, mapY(x, z) + 0.05, z); grp.add(p); return p; };

/* ---------------------------------------------------------------- 1: map sheet with the brass compass rose */
function st1(cam, MAP) {
  const grp = new THREE.Group(), rose = new THREE.Group(), brass = phong('#c9a24a', { shininess: 80 });
  rose.position.set(-24, -1.0, 12);
  rose.add(new THREE.Mesh(new THREE.CylinderGeometry(7.6, 8, 0.7, 40), brass));
  const face = new THREE.Mesh(new THREE.CylinderGeometry(6.7, 6.7, 0.76, 40), lam('#f2ead2')); face.position.y = 0.03; rose.add(face);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(6.9, 0.22, 8, 48).rotateX(Math.PI / 2), brass); ring.position.y = 0.4; rose.add(ring);
  const arms = [];
  for (let i = 0; i < 8; i++) {
    const L = i % 2 ? 3.6 : 6.2, w = i % 2 ? 0.8 : 1.25, g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.ConeGeometry(w, L, 4).translate(0, L / 2, 0).rotateX(Math.PI / 2), i === 0 ? lam('#c0392b', { emissive: '#500a08' }) : lam(i % 2 ? '#7a5a2a' : '#3a2a18'));
    m.position.y = 0.55; g.add(m); g.rotation.y = Math.PI - i * Math.PI / 4; rose.add(g); arms.push(g);
  }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 10), brass); hub.position.y = 0.7; rose.add(hub);
  grp.add(shadowable(rose));
  const pins = [pinAt(grp, 32.9, 35.4, '#0f3d7a'), pinAt(grp, 31.78, 35.2, '#e0401e'), pinAt(grp, 31.25, 34.79, '#1fa05a')];
  const KEYS = [[0, [-30, 40, 50], [-6, 0, 6]], [3.0, [6, 30, 36], [1, 0, -4]]];
  return { grp, map: true, sun: { t: [0, 0, 0], ext: 80 }, ev: [[0.1, 'whoosh'], [0.9, 'pop'], [1.3, 'pop']],
    upd(lt) {
      CAM(cam, lt, KEYS); MAP.paint(ramp(lt, 0.1, 2.0));
      arms.forEach((a, i) => { const k = [0, 2, 4, 6, 1, 3, 5, 7].indexOf(i); a.scale.setScalar(pop((lt - 0.2 - 0.18 * k) / 0.4)); });
      rose.rotation.y = 0.25 * Math.sin(lt * 1.2);
      pins.forEach((p, i) => { p.userData.pop(cl((lt - 1.0 - 0.3 * i) / 0.5)); p.userData.glow(ramp(lt, 1.6, 2.3) * (0.7 + 0.3 * Math.sin(lt * 5))); });
    }, tipa: lt => tp(lt, 'happy', 'point') };
}

/* ---------------------------------------------------------------- 2: the three strips lift out of the map */
function st2(cam, MAP) {
  const grp = new THREE.Group(), defs = [[-5.2, -0.8, '#ffd24a'], [-0.8, 5.2, '#d2812e'], [5.2, 9.8, '#3a98e0']], slabs = [];
  defs.forEach(([a, b, col]) => {
    const g = new THREE.Group(), s = new THREE.Mesh(new THREE.BoxGeometry(b - a, 1, 70).translate(0, 0.5, 0), BASIC(col, { transparent: true, opacity: 0.5, depthWrite: false }));
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(b - a, 70).rotateX(-Math.PI / 2), BASIC('#ffffff', { transparent: true, opacity: 0.35, depthWrite: false })); cap.position.y = 1;
    g.add(s, cap); g.position.set((a + b) / 2, 0.15, 0); grp.add(g); slabs.push(g);
  });
  const KEYS = [[0, [-26, 24, 46], [-2, 0, 8]], [2.9, [-4, 30, 26], [2, 0, -12]]];
  return { grp, map: true, sun: { t: [0, 0, 0], ext: 80 }, ev: [[0.2, 'whoosh'], [0.5, 'pop'], [1.1, 'pop'], [1.7, 'pop']],
    upd(lt) {
      CAM(cam, lt, KEYS); MAP.paint(1);
      slabs.forEach((g, i) => { const u = cl((lt - 0.3 - 0.6 * i) / 0.8); g.visible = u > 0; g.scale.y = Math.max(0.001, 5.0 * pop(u)); });
    }, tipa: lt => tp(lt, lt < 1.7 ? 'curious' : 'happy', lt < 1.7 ? 'point' : 'up', lt > 2.2 ? 0.4 : 0) };
}

/* ---------------------------------------------------------------- 4: the land splits: green north, golden south */
function st4(cam, MAP) {
  const grp = new THREE.Group(), BS = MAP.bs;
  const sunB = new THREE.Mesh(new THREE.SphereGeometry(1.7, 20, 14), BASIC('#ffc928')); grp.add(sunB);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(2.6, 18, 12), BASIC('#fff2a0', { transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); grp.add(halo);
  const cloud = K.makeCloud({ scale: 0.8 }); grp.add(cloud);
  const rain = K.makeRain(160, 1.0, 9, (tb, i, k) => ({ x: 3 + (K.hash2(i, k) - 0.5) * 6, y: 10.3, z: -26 + (K.hash2(i * 3, k) - 0.5) * 6, p: 0.8 }), () => 0.3);
  grp.add(rain);
  const KEYS = [[0, [-24, 17, 36], [2, 1, -2]], [3.6, [-6, 22, 44], [2, 0, 0]]];
  return { grp, map: true, sun: { t: [0, 0, 0], ext: 80 }, ev: [[0.2, 'whoosh'], [0.6, 'pop'], [1.4, 'ding']],
    upd(lt) {
      CAM(cam, lt, KEYS); MAP.paint(1); MAP.slide(3.6 * ramp(lt, 0.3, 1.8));
      const su = cl((lt - 1.0) / 0.5); sunB.visible = halo.visible = su > 0; sunB.scale.setScalar(pop(su)); halo.scale.setScalar(pop(su) * (1 + 0.1 * Math.sin(lt * 5))); sunB.position.set(3, 9 + 0.3 * Math.sin(lt * 2), 24 + 3.6); halo.position.copy(sunB.position);
      const cu = cl((lt - 0.5) / 0.5); cloud.visible = cu > 0; cloud.scale.setScalar(0.8 * pop(cu)); cloud.position.set(3, 9.5, -26 - 3.6); cloud.userData.setTone(0.35);
      rain.position.z = -3.6; rain.userData.update(lt);
    }, tipa: lt => tp(lt, lt < 1.4 ? 'curious' : 'cheering', lt < 1.4 ? 'point' : 'up', lt > 1.4 ? 0.5 : 0) };
}

/* ---------------------------------------------------------------- 8: the lake, a blue carrier line leaves it south */
const RIV = [[32.84, 35.58], [32.7, 35.57], [32.45, 35.56], [32.15, 35.54], [31.95, 35.54], [31.8, 35.51], [31.6, 35.48]].map(([a, b]) => { const [x, z] = ll(a, b); return [x, mapY(x, z) + 0.7, z]; });
function st8(cam, MAP) {
  const grp = new THREE.Group(), line = K.makeThickLine(RIV, 0.32, BASIC('#2fa8ff')), glow = K.makeThickLine(RIV, 0.9, BASIC('#7fd0ff', { transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending }));
  grp.add(line, glow);
  const [kx, kz] = ll(32.82, 35.58), ringL = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.18, 8, 40).rotateX(Math.PI / 2), BASIC('#bfe8ff')); ringL.position.set(kx, 0.5, kz); grp.add(ringL);
  const pulses = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 8), BASIC('#ffffff')); grp.add(m); return m; });
  const lens = []; let tot = 0; for (let i = 0; i < RIV.length - 1; i++) { const d = Math.hypot(RIV[i + 1][0] - RIV[i][0], RIV[i + 1][2] - RIV[i][2]); lens.push(d); tot += d; }
  const at = u => { let d = u * tot, i = 0; while (i < lens.length - 1 && d > lens[i]) { d -= lens[i]; i++; } const f = cl(d / lens[i]); return RIV[i].map((v, j) => v + (RIV[i + 1][j] - v) * f); };
  const pin = pinAt(grp, 32.82, 35.58, '#1f5fb0');
  const KEYS = [[0, [-8, 12, -38], [9, 0, -22]], [4.6, [-6, 17, -6], [8, 0, -8]]];
  return { grp, map: true, sun: { t: [0, 0, -8], ext: 80 }, ev: [[0.2, 'whoosh'], [0.7, 'pop'], [1.4, 'tick'], [2.4, 'tick']],
    upd(lt) {
      CAM(cam, lt, KEYS); MAP.paint(1);
      pin.userData.pop(cl((lt - 0.3) / 0.5)); pin.userData.glow(0.7 + 0.3 * Math.sin(lt * 5));
      ringL.scale.setScalar(pop((lt - 0.4) / 0.5) * (1 + 0.08 * Math.sin(lt * 4)));
      const u = ramp(lt, 0.9, 3.6); line.userData.setU(u); glow.userData.setU(u);
      pulses.forEach((m, i) => { const v = ((lt - 1.2 - i * 0.45) * 0.28); m.visible = v > 0 && v < 1; if (m.visible) m.position.set(...at(Math.min(v, u))); });
    }, tipa: lt => tp(lt, lt < 1.4 ? 'curious' : 'happy', lt < 1.4 ? 'down' : 'point') };
}

/* ---------------------------------------------------------------- 9: the Dead Sea far below sea level, digits -440 */
function st9(cam, MAP) {
  const grp = new THREE.Group(), [dx, dz] = ll(31.5, 35.47);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(22, 18).rotateX(-Math.PI / 2), BASIC('#bfe8ff', { transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide })); plane.position.set(dx + 1, 4.0, dz); grp.add(plane);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 4).rotateX(Math.PI / 2).scale(11, 1, 9), BASIC('#ffffff')); edge.position.copy(plane.position); grp.add(edge);
  const arrow = K.makeArrow(2.6, 0.5, lam('#e0401e', { emissive: '#400' })); arrow.rotation.x = Math.PI; grp.add(arrow);
  const dig = makeGlowDigits('-440', 13, 6.2); grp.add(dig);
  const salt = []; for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), lam('#ffffff', { emissive: '#8892a8' })); m.rotation.set(i, i * 1.7, 0.4); salt.push(m); grp.add(m); }
  const KEYS = [[0, [-9, 8, 24], [7, 1, 0]], [5.0, [-2, 13, 26], [7.4, 2, -2]]];
  return { grp, map: true, sun: { t: [0, 0, 0], ext: 80 }, ev: [[0.2, 'whoosh'], [0.8, 'pop'], [1.9, 'ding']],
    upd(lt) {
      CAM(cam, lt, KEYS); MAP.paint(1);
      const pu = cl((lt - 0.4) / 0.6); plane.visible = edge.visible = pu > 0; plane.scale.set(pop(pu), 1, pop(pu)); edge.scale.set(11 * pop(pu), 1, 9 * pop(pu));
      arrow.userData.pop(cl((lt - 1.1) / 0.5)); arrow.position.set(dx + 1, 3.6 + 0.3 * Math.sin(lt * 4), dz);
      dig.position.set(dx + 1, 9.4 + 0.25 * Math.sin(lt * 2), dz + 1); dig.userData.set(cl((lt - 1.8) / 0.6));
      salt.forEach((m, i) => { m.visible = lt > 2.4; m.position.set(dx + (i - 3) * 0.55, 0.5 + 0.15 * Math.sin(lt * 2 + i), dz + ((i * 5) % 7 - 3) * 0.7); });
    }, tipa: lt => tp(lt, lt < 1.8 ? 'curious' : 'surprised', lt < 1.8 ? 'point' : 'up', lt > 3 ? 0.4 : 0) };
}

export const mapStations = (cam, MAP) => ({ s1: st1(cam, MAP), s2: st2(cam, MAP), s4: st4(cam, MAP), s8: st8(cam, MAP), s9: st9(cam, MAP) });
