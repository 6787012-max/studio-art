/* film_z landscape stations: 3 snowy mountain + valley, 5 season wheel, 6 rain cloud + rain gauge, 7 sea shore with a ship. ASCII only. No people, no text. */
import * as THREE from 'three';
import { track } from '../../gezer_trip/film_a/gz_kit2.js';
import * as K from '../kit10g.js';
import { landscape, backdrop } from '../film_s5/s5_land.js';
import { makeWheel } from '../film_s5/s5_props.js';
import * as P from '../film_s7/s7_parts.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, noiseTex, heightMesh, tufts, rocks } = K;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const CAM = (cam, lt, keys) => { const c = track(lt, keys); cam.position.set(...c.p); cam.lookAt(...c.l); };
const hillGentle = (x, z) => 13 * Math.exp(-Math.pow(x / 55, 2) - Math.pow((z + 88) / 38, 2)) + 6 * Math.exp(-Math.pow((x - 85) / 30, 2) - Math.pow((z + 40) / 30, 2));
const tp = (expr, arms, hop) => ({ side: 1, xf: 0.78, size: 0.2, expr, arms, hop: hop || 0, show: 1 });

/* ---------------------------------------------------------------- 3: Hermon with its snow cap and the valley below */
function st3(cam) {
  const grp = new THREE.Group();
  const hfn = (x, z) => {
    const m = 52 * Math.exp(-Math.pow((x + 34) / 24, 2) - Math.pow((z + 40) / 30, 2)) + 22 * Math.exp(-Math.pow((x - 60) / 26, 2) - Math.pow((z + 30) / 40, 2));
    const val = -2.2 * Math.exp(-Math.pow((x - 14) / 8, 2));
    return m + val + 0.5 * Math.sin(x * 0.11 + z * 0.07) + 0.3 * Math.sin(z * 0.13 + 1.1);
  };
  const SN = C('#f4f6fa'), RK = C('#9a8c78'), GR = ['#86b257', '#78a84b', '#93bd5e'].map(C), FO = C('#4f7f3a'), GD = C('#d7b550');
  const col = (x, y, z, c) => {
    const gi = Math.floor(hash2(Math.floor(x / 4), Math.floor(z / 4)) * 3);
    c.copy(GR[gi]).lerp(GD, sm((x - 4) / 20) * sm((z + 20) / 25) * (1 - sm((y - 3) / 3)) * 0.8);
    c.lerp(FO, sm((y - 4) / 8) * (1 - sm((y - 20) / 6)) * 0.7); c.lerp(RK, sm((y - 20) / 8) * 0.9); c.lerp(SN, sm((y - 33) / 5));
    c.multiplyScalar(0.92 + 0.16 * hash2(Math.floor(x * 1.3), Math.floor(z * 1.3)));
  };
  const g = heightMesh(-150, 150, -150, 80, 150, 115, hfn, col, lam('#ffffff', { vertexColors: true, map: noiseTex(41, 30, 20) })); g.castShadow = true; g.receiveShadow = true; grp.add(g);
  grp.add(backdrop(0));
  const r = rng(7), tl = [];
  for (let k = 0; k < 2500 && tl.length < 90; k++) { const x = -90 + r() * 170, z = -70 + r() * 105, y = hfn(x, z); if (y > 24 || Math.abs(x - 14) < 6) continue; tl.push([x, y, z, 0.8 + r() * 0.8, r()]); }
  grp.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34', '#6aa04a']));
  const rr = rng(11); grp.add(rocks(90, 3, () => { const x = -70 + rr() * 140, z = -50 + rr() * 80; return [x, hfn(x, z), z]; }, '#b9ae98', 0.3, 1.0));
  const rt = rng(12); grp.add(tufts(900, 4, () => { const x = -40 + rt() * 100, z = -20 + rt() * 50; return [x, hfn(x, z), z]; }, ['#6f9d4a', '#86b257', '#9cc56a'], 0.4, 1.0));
  const pts = []; for (let z = 30; z >= -60; z -= 5) { const x = 14 + 1.2 * Math.sin(z * 0.15); pts.push([x, hfn(x, z) + 0.3, z]); }
  const river = K.makeThickLine(pts, 0.45, BASIC('#4fb0ee')); grp.add(river);
  const sn = K.makeCloud({ scale: 1.5 }); grp.add(sn);
  const rise = K.makeArrow(4, 0.5, lam('#e0401e', { emissive: '#400' })); grp.add(rise);
  const KEYS = [[0, [10, 6, 38], [4, 6, -10]], [4.2, [-6, 30, 30], [-34, 36, -42]]];
  return { grp, hero: g, sun: { t: [-10, 10, -20], ext: 130 }, ev: [[0.2, 'whoosh'], [1.3, 'pop'], [2.4, 'ding']],
    upd(lt) {
      CAM(cam, lt, KEYS); river.userData.setU(ramp(lt, 0.2, 1.8));
      const u = cl((lt - 1.2) / 0.6); sn.visible = u > 0; sn.scale.setScalar(1.5 * pop(u)); sn.position.set(-16 + 2 * Math.sin(lt), 60 + 0.5 * Math.sin(lt * 1.3), -30);
      rise.userData.pop(cl((lt - 2.0) / 0.5)); rise.position.set(-34, 54 + 0.6 * Math.sin(lt * 3), -40); rise.rotation.x = Math.PI;
    }, tipa: lt => tp(lt < 1.8 ? 'curious' : 'surprised', lt < 1.8 ? 'point' : 'up') };
}

/* ---------------------------------------------------------------- 5: the wooden season wheel turns, the land greens and browns */
function st5(cam) {
  const L = landscape({ seed: 6, hill: hillGentle, plaza: [0, 0, 40], trees: 30, clear: (x, z) => Math.abs(x) < 34 && z > -14 && z < 70, walls: [[-38, -12, 0.2, 14], [40, -14, -0.1, 12]], bushesN: 40 });
  const grp = L.grp, gy = L.hfn(0, 0), W = makeWheel(9.6, 14); W.position.set(0, gy + 14.3, 0); grp.add(W);
  const KEYS = [[0, [-12, 12, 52], [0, 14, 0]], [3.6, [4, 16, 44], [0, 14.5, 0]]], ord = [1, 3, 2, 0], st = [0.4, 1.0, 1.6, 2.2];
  return { grp, hero: W, sun: { t: [0, 0, 0], ext: 70 }, ev: [[0.2, 'whoosh'], [0.5, 'pop'], [1.1, 'pop'], [1.7, 'pop'], [2.3, 'pop']],
    upd(lt) {
      CAM(cam, lt, KEYS); W.userData.show(cl((lt + 0.2) / 0.5)); ord.forEach((ai, n) => W.userData.setArc(ai, (lt - st[n]) / 0.6));
      W.userData.setHand(360 * sm((lt - 0.6) / 2.6), lt > 0.5 && lt < 3.4); L.set(0.5 + 0.5 * Math.sin(lt * 1.6));
    }, tipa: lt => tp(lt < 2.4 ? 'curious' : 'cheering', lt < 2.4 ? 'point' : 'up', lt > 2.6 ? 0.5 : 0) };
}

/* ---------------------------------------------------------------- 6: a raining cloud fills the rain gauge */
function st6(cam) {
  const L = landscape({ seed: 8, hill: hillGentle, plaza: [0, 0, 40], trees: 28, clear: (x, z) => Math.abs(x) < 34 && z > -14 && z < 70, walls: [[-40, -12, 0.2, 14]], bushesN: 30 });
  L.set(0.2); const grp = L.grp, gy = L.hfn(0, 0), wood = lam('#8a5a30', { map: K.woodTex(3, 2, 2) });
  const tube = K.makeTube(15, 2.4); tube.position.set(0, gy, 0); grp.add(tube);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 5), wood); stand.position.set(0, gy + 0.1, 0); stand.receiveShadow = true; grp.add(stand);
  for (const dx of [-3.4, 3.4]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 17, 0.4), wood); p.position.set(dx, gy + 8, -2.4); p.castShadow = true; grp.add(p); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(8.4, 17, 0.3), wood); back.position.set(0, gy + 8, -2.7); grp.add(back);
  const cloud = K.makeCloud({ scale: 1.1 }); grp.add(cloud);
  const rain = K.makeRain(420, 1.0, 11, (tb, i, k) => ({ x: (hash2(i, k) - 0.5) * 12, y: gy + 27, z: (hash2(i * 3, k) - 0.5) * 6, p: ramp(tb, 0.5, 1.5) }), (x, z) => gy + 1.0);
  grp.add(rain);
  const KEYS = [[0, [-14, gy + 12, 40], [0, gy + 14, 0]], [4.0, [-2, gy + 18, 36], [0, gy + 14, 0]]];
  return { grp, hero: tube, sun: { t: [0, 0, 0], ext: 70 }, ev: [[0.2, 'whoosh'], [0.6, 'pop'], [1.4, 'tick'], [2.6, 'tick']],
    upd(lt) {
      CAM(cam, lt, KEYS); const cu = cl((lt - 0.1) / 0.5); cloud.visible = cu > 0; cloud.scale.setScalar(1.1 * pop(cu)); cloud.position.set(0.6 * Math.sin(lt * 1.2), gy + 25.5, 0); cloud.userData.setTone(ramp(lt, 0.3, 1.2));
      rain.userData.update(lt); tube.userData.setFill(0.88 * ramp(lt, 1.0, 3.8));
    }, tipa: lt => tp(lt < 1.0 ? 'neutral' : 'surprised', lt < 1.0 ? 'down' : 'point') };
}

/* ---------------------------------------------------------------- 7: the Mediterranean shore, a cargo ship passes */
function st7(cam) {
  const B = P.makeBeach({ seed: 3, near: [-1, 22, -40, 50] }), grp = B.grp;
  grp.add(K.makeClouds(BASIC('#ffffff')));
  const ship = P.makeShip(34, '#2c3e55', ['#c0392b', '#2f6fb0', '#e0a41e', '#3a9a5a', '#d8d8d0'], 3); ship.rotation.y = Math.PI / 2; grp.add(ship);
  const KEYS = [[0, [20, 7, 34], [-26, 3, 4]], [4.4, [16, 5, 14], [-30, 3, -14]]];
  return { grp, hero: ship, sun: { t: [-10, 0, 0], ext: 90 }, ev: [[0.2, 'whoosh'], [1.2, 'pop'], [2.4, 'splash']],
    upd(lt) {
      CAM(cam, lt, KEYS); B.upd(lt);
      const z = 34 - 7.5 * lt; ship.position.set(-38, 0.3 + 0.12 * Math.sin(lt * 1.3), z); ship.rotation.z = 0.02 * Math.sin(lt * 1.1);
    }, tipa: lt => tp(lt < 1.6 ? 'happy' : 'curious', lt < 1.6 ? 'up' : 'point') };
}

export const landStations = cam => ({ s3: st3(cam), s5: st5(cam), s6: st6(cam), s7: st7(cam) });
