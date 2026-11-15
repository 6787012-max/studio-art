/* film_s3 landscape shots: A (mountain top to deep valley, altimeter + clock) and X (winding climb Beit Shemesh -> Jerusalem). ASCII only. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
import { camPath, BASIC, makeGauge, makeClock, makeDigitBoard, ctex } from './common.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, phong, heightMesh, noiseTex, woodTex, tufts, rocks, bushes } = K;
const gmat = (s, rx, ry) => lam('#ffffff', { vertexColors: true, map: noiseTex(s, rx, ry) });

/* ============================================================ A: from a high top into a deep valley in under an hour */
export function buildA(cam) {
  const grp = new THREE.Group(), hud = new THREE.Group(); cam.add(hud);
  const Hf = (x, z) => {
    const wall = 36 * sm((Math.abs(x) - 12) / 36) * sm((z + 52) / 40) + 30 * sm((z - 105) / 30);
    const mt = 66 * Math.exp(-(x * x) / (2 * 20 * 20) - Math.pow(z + 80, 2) / (2 * 26 * 26));
    const shoulder = 14 * Math.exp(-Math.pow(Math.abs(x) - 34, 2) / (2 * 14 * 14) - Math.pow(z + 70, 2) / (2 * 34 * 34));
    return 1.2 + 0.6 * Math.sin(x * 0.13 + z * 0.05) + 0.4 * Math.sin(z * 0.21 + x * 0.09) + wall + mt + shoulder;
  };
  const GC = ['#86b257', '#7fb157', '#9cc56a', '#6fa04a'].map(C);
  const col = (x, y, z, c) => {
    c.copy(GC[Math.floor(hash2(Math.floor(x / 4), Math.floor(z / 4)) * 4)]);
    c.lerp(C('#a8a060'), sm((y - 16) / 14) * 0.8); c.lerp(C('#9d9588'), sm((y - 34) / 8)); c.lerp(C('#eeeadf'), sm((y - 54) / 5));
    c.multiplyScalar(0.92 + 0.16 * hash2(Math.floor(x * 0.7), Math.floor(z * 0.7)));
  };
  const g = heightMesh(-170, 170, -140, 150, 170, 145, Hf, col, gmat(61, 40, 36)); g.castShadow = true; grp.add(g);
  const r = rng(77), tl = [];
  for (let k = 0; k < 6000 && tl.length < 220; k++) { const x = (r() - 0.5) * 220, z = -50 + r() * 190, y = Hf(x, z); if (Math.abs(x) < 5 || y > 30) continue; tl.push([x, y, z, 0.9 + r() * 0.9, r()]); }
  for (let k = 0; k < 4000 && tl.length < 300; k++) { const x = (r() - 0.5) * 120, z = -88 + r() * 50, y = Hf(x, z); if (y > 40 || y < 16 || Math.abs(x) < 3) continue; tl.push([x, y, z, 0.8 + r() * 0.6, r()]); }
  grp.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34', '#6aa04a']));
  const rr = rng(5);
  grp.add(rocks(150, 3, () => { const x = (rr() - 0.5) * 140, z = -50 + rr() * 90; return [x, Hf(x, z), z]; }, '#b9ae98', 0.4, 1.4));
  const rs = rng(31); grp.add(rocks(90, 6, () => { const x = (rs() - 0.5) * 40, z = -76 + rs() * 22; return [x, Hf(x, z) - 0.2, z]; }, '#8d857a', 0.25, 0.8));
  const rt = rng(8); grp.add(tufts(1500, 4, () => { const x = (rt() - 0.5) * 100, z = -30 + rt() * 150; return [x, Hf(x, z), z]; }, ['#6f9d4a', '#86b257', '#9cc56a'], 0.5, 1.4));
  const rv = []; for (let i = 0; i <= 40; i++) { const z = -18 + i * 3.6, x = 3.5 * Math.sin(z * 0.07); rv.push([x, Hf(x, z) + 0.15, z]); }
  const river = K.makeThickLine(rv, 1.5, BASIC('#58b4ee')); river.userData.setU(1); grp.add(river);
  const clouds = [[-46, 58, -52, 1.7], [44, 50, -70, 1.5], [-20, 72, -130, 2.0], [12, 40, -34, 0.9], [60, 62, -100, 1.8]].map(([x, y, z, s]) => { const c = K.makeCloud({ scale: s }); c.position.set(x, y, z); c.userData.b = [x, y, z]; grp.add(c); return c; });
  const peakGlow = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 10), BASIC('#fff2a0', { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); grp.add(peakGlow);
  /* HUD: altimeter at the left, clock above it */
  const gauge = makeGauge(11); gauge.position.set(-14.6, -0.2, -30); hud.add(gauge);
  const clock = makeClock(); clock.position.set(-8.9, 5.3, -30); hud.add(clock);
  const KEYS = [[0, [4, 77, -90], [0, 52, 40]], [3.5, [-2, 46, -52], [0, 10, 14]], [6.5, [2, 17, -10], [0, 6, 40]], [9.4, [0, 8.5, 26], [1, 5, 80]], [12.4, [-3, 6.6, 48], [2, 5.5, 100]], [15.8, [2, 6.2, 70], [0, 5.5, 125]]];
  const upd = (lt) => {
    const c = camPath(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    gauge.userData.set(cl((cam.position.y - 6) / 70));
    const ku = (lt - 0.5) / 0.5; gauge.visible = ku > 0; gauge.scale.setScalar(pop(ku));
    clock.userData.show((lt - 1.0) / 0.6);
    clock.userData.set(0.2 * ramp(lt, 1.0, 9.3) + 0.1 * ramp(lt, 9.6, 15.4));
    peakGlow.visible = lt < 3.5; peakGlow.position.set(0, 67, -80); peakGlow.material.opacity = 0.6 * (1 - ramp(lt, 1.5, 3.5)) * (0.7 + 0.3 * Math.sin(lt * 7));
    clouds.forEach((cl_, i) => { cl_.position.set(cl_.userData.b[0] + lt * (0.6 + 0.2 * i), cl_.userData.b[1], cl_.userData.b[2]); });
  };
  const tipa = lt => ({ side: 1, xf: 0.77, size: 0.2, expr: lt < 9.4 ? 'surprised' : 'happy', arms: lt < 9.4 ? 'up' : 'point', hop: lt < 9.4 ? 0.6 : 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, hud, upd, tipa, sun: lt => { const c = camPath(lt, KEYS); return { t: [c.l[0], 0, c.l[2]], ext: 110 }; }, ev: [[0.6, 'whoosh'], [1.0, 'pop'], [3.0, 'whoosh'], [9.62, 'pop']] };
}

/* ============================================================ X: the climb from Beit Shemesh up to Jerusalem */
export function buildX(cam) {
  const grp = new THREE.Group(), hud = new THREE.Group(); cam.add(hud);
  const Hf = (x, z) => 30 * sm((70 - z) / 125) + 5 * Math.sin(x * 0.07 + 1) * sm((70 - z) / 60) + 0.5 * Math.sin(x * 0.25 + z * 0.17) + 0.4 * Math.sin(z * 0.31 + 2)
    + 16 * sm((Math.abs(x) - 26) / 30) * sm((z + 20) / 60) + 6 * sm((Math.abs(x) - 40) / 30);
  const GC = ['#8fc063', '#86b257', '#a6c76c', '#7fb157'].map(C);
  const col = (x, y, z, c) => {
    c.copy(GC[Math.floor(hash2(Math.floor(x / 4), Math.floor(z / 4)) * 4)]);
    c.lerp(C('#cdb47e'), sm((y - 8) / 16) * 0.6).lerp(C('#bfae82'), sm((y - 24) / 10) * 0.5);
    c.multiplyScalar(0.92 + 0.16 * hash2(Math.floor(x * 0.7), Math.floor(z * 0.7)));
  };
  grp.add(Object.assign(heightMesh(-190, 190, -140, 150, 190, 145, Hf, col, gmat(71, 40, 36)), { castShadow: true }));
  const NP = 90, rp = [];
  for (let i = 0; i <= NP; i++) { const s = i / NP, z = 60 - 100 * s, x = 15 * Math.sin(s * 15.5) * (1 - 0.3 * s); rp.push([x, Hf(x, z) + 0.55, z]); }
  const road = K.makeThickLine(rp, 1.25, lam('#b79b6c')); road.userData.setU(1); grp.add(road);
  const lineP = rp.map(p => [p[0], p[1] + 0.55, p[2]]);
  const line = K.makeThickLine(lineP, 0.42, BASIC('#ffcf3a')); grp.add(line);
  const cum = [0]; for (let i = 1; i < lineP.length; i++) cum.push(cum[i - 1] + Math.hypot(lineP[i][0] - lineP[i - 1][0], lineP[i][1] - lineP[i - 1][1], lineP[i][2] - lineP[i - 1][2]));
  const posAt = u => { const T = cl(u) * cum[cum.length - 1]; let i = 0; while (i < cum.length - 2 && T > cum[i + 1]) i++; const f = (T - cum[i]) / (cum[i + 1] - cum[i] || 1); return [0, 1, 2].map(j => lineP[i][j] + (lineP[i + 1][j] - lineP[i][j]) * f); };
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.95, 14, 10), BASIC('#fff6c0')); grp.add(tip);
  const tipG = new THREE.Mesh(new THREE.SphereGeometry(1.7, 14, 10), BASIC('#ffe27a', { transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })); grp.add(tipG);
  const r = rng(19), tl = [];
  for (let k = 0; k < 8000 && tl.length < 260; k++) { const x = (r() - 0.5) * 240, z = -80 + r() * 170, y = Hf(x, z); let near = 9; for (let j = 0; j < rp.length; j += 3) near = Math.min(near, Math.hypot(x - rp[j][0], z - rp[j][2])); if (near < 3.5) continue; tl.push([x, y, z, 0.9 + r() * 0.8, r()]); }
  grp.add(K.plantTrees(tl, ['#4f8a3a', '#5f9a45', '#3f7a34', '#6aa04a']));
  const rr = rng(6); grp.add(rocks(120, 3, () => { const x = (rr() - 0.5) * 160, z = -90 + rr() * 150; return [x, Hf(x, z), z]; }, '#c2b090', 0.5, 1.8));
  const rt = rng(9); grp.add(tufts(1200, 4, () => { const x = (rt() - 0.5) * 120, z = -60 + rt() * 130; return [x, Hf(x, z), z]; }, ['#6f9d4a', '#86b257', '#c9b57c'], 0.5, 1.3));
  grp.add(K.wheatField(-50, 20, 30, 24, Hf, 2200, 3));
  const wp = rp[rp.length - 1], city = K.makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 5, midTowers: true, scale: 2.4 });
  city.position.set(wp[0] - 2, Hf(wp[0] - 2, wp[2] - 24) - 0.2, wp[2] - 24); grp.add(city);
  const pinS = K.makePin('#e0401e'); pinS.userData.k = 2.2; pinS.position.set(rp[0][0], rp[0][1], rp[0][2]); grp.add(pinS);
  const pinE = K.makePin('#ffc928'); pinE.userData.k = 2.2; pinE.position.set(wp[0], wp[1], wp[2]); grp.add(pinE);
  /* HUD: digits board + 800/300 column */
  const board = makeDigitBoard(7, 3.4); board.position.set(-8.6, 2.2, -30); hud.add(board);
  const col2 = new THREE.Group(); col2.position.set(-14.4, 0, -30); hud.add(col2);
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3, 0.6), lam('#8a7e6a')); base.position.y = -5.2 + 1.5; col2.add(base);
  const gold = new THREE.Mesh(new THREE.BoxGeometry(2.3, 5, 0.6), BASIC('#ffc928')); gold.position.y = -5.2 + 3 + 2.5; col2.add(gold);
  const gl = new THREE.Mesh(new THREE.BoxGeometry(2.9, 5.5, 0.9), BASIC('#fff2a0', { transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })); gl.position.copy(gold.position); col2.add(gl);
  const board2 = makeDigitBoard(4.4, 2.6); board2.position.set(-14.4, -5.2 + 3 + 2.5, -29.5); hud.add(board2);
  const prog = lt => ramp(lt, 0.8, 7.6);
  const KEYS = lt => { const uc = prog(lt - 0.9), ul = prog(lt + 0.7), pc = posAt(uc), pl = posAt(ul); return { p: [pc[0] - 9, pc[1] + 17, pc[2] + 38], l: [pl[0], pl[1] + 4, pl[2] - 8] }; };
  const topKeys = [[8.2, null], [14.3, null]];
  const upd = (lt) => {
    let c; if (lt < 8.6) c = KEYS(lt); else {
      const a = KEYS(8.6), w = ramp(lt, 8.6, 12.5); const p2 = [wp[0] + 44, wp[1] + 34, wp[2] + 52], l2 = [wp[0] - 2, wp[1] - 2, wp[2] - 8];
      c = { p: a.p.map((v, j) => v + (p2[j] - v) * w + (j === 0 ? 4 * Math.sin(lt * 0.5) : 0)), l: a.l.map((v, j) => v + (l2[j] - v) * w) };
    }
    cam.position.set(...c.p); cam.lookAt(...c.l);
    const u = prog(lt); line.userData.setU(u); const tp = posAt(u); tip.position.set(...tp); tipG.position.set(...tp); tipG.scale.setScalar(1 + 0.2 * Math.sin(lt * 8));
    tip.visible = tipG.visible = lt > 0.7;
    pinS.userData.pop(cl((lt - 0.2) / 0.5)); pinE.userData.pop(cl((lt - 0.4) / 0.5)); pinE.userData.glow(ramp(lt, 7.0, 7.8) * (0.7 + 0.3 * Math.sin(lt * 5)));
    const bu = (lt - 0.5) / 0.5; board.visible = bu > 0; board.scale.setScalar(pop(bu));
    const showB = lt < 8.3; board.userData.set(String(300 + Math.round(500 * u)), showB ? '#2a1c0e' : '#7a4a00', showB ? '#fbf3dc' : '#ffe9a0');
    const cu = (lt - 8.3) / 0.7; col2.visible = board2.visible = cu > 0; col2.scale.set(1, pop(cu), 1); board2.scale.setScalar(pop((lt - 9.0) / 0.6));
    board2.userData.set('500', '#7a4a00', '#ffe9a0'); gl.material.opacity = 0.2 + 0.15 * Math.sin(lt * 5);
  };
  const tipa = lt => ({ side: 1, xf: 0.77, size: 0.2, expr: lt < 7.8 ? 'curious' : 'cheering', arms: lt < 7.8 ? 'point' : 'up', hop: lt > 8.2 ? 0.5 : 0.2, show: cl((lt - 0.2) / 0.5) });
  return { grp, hud, upd, tipa, tipaY: lt => 3.6 * prog(lt), sun: lt => { const tp = posAt(prog(lt)); return { t: [tp[0], tp[1] - 2, tp[2]], ext: 100 }; }, ev: [[0.35, 'pop'], [0.8, 'whoosh'], [7.8, 'ding'], [8.3, 'pop']] };
}
