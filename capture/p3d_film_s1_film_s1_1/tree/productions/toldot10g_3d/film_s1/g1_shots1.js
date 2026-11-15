/* g1_shots1.js - film_s1 shots a, b, c. NO PEOPLE, NO TEXT. ASCII only. Every function is a pure function of lt (local seconds). */
import * as THREE from 'three';
import * as K from '../kit10g.js';
import * as P from './g1_props.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, phong, mapY, ll } = K;
const { BASIC } = P;
const ADD = (c, o) => BASIC(c, Object.assign({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }, o || {}));
export function camTrack(lt, keys) {
  let i = 0; while (i < keys.length - 2 && lt > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)], u = cl((lt - k1[0]) / (k2[0] - k1[0]));
  const h = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return { p: [0, 1, 2].map(j => h(k0[1][j], k1[1][j], k2[1][j], k3[1][j])), l: [0, 1, 2].map(j => h(k0[2][j], k1[2][j], k2[2][j], k3[2][j])) };
}
export const aim = (cam, c) => { cam.position.set(...c.p); cam.lookAt(...c.l); };
const MORNING = { so: [-66, 56, 64], sunC: C('#ffe6bd'), sunI: 2.1, hemiI: 0.85, top: C('#7db8ea'), hor: C('#fde3b8') };
export const morning = (target, ext) => Object.assign({ target, ext }, MORNING);
/* gold pulse used for "this thing is being named" */
const pulse = (lt, a, b, lo) => { const on = ramp(lt, a, a + 0.5) * (1 - ramp(lt, b, b + 0.5)); return on * (0.72 + 0.28 * Math.sin(lt * 5.5)) + (ramp(lt, a, a + 0.5) - on) * (lo == null ? 0.25 : lo); };

/* ===================================================================================== a: photo and map (hill set) */
export function shotA(X) {
  const cam = X.cam, grp = new THREE.Group();
  const hfn = (x, z) => 0.4 * Math.sin(x * 0.07 + 0.4) * Math.cos(z * 0.05) + 0.3 * Math.sin(z * 0.11 + x * 0.02 + 1.3) + 14 * Math.exp(-Math.pow(x / 60, 2) - Math.pow((z + 96) / 40, 2)) + 7 * Math.exp(-Math.pow((x - 90) / 32, 2) - Math.pow((z + 40) / 32, 2)) + 9 * Math.exp(-Math.pow((x + 95) / 34, 2) - Math.pow((z + 60) / 30, 2));
  const set = P.hillSet({ hfn, seed: 4, trees: 46, row: 12, rowZ: -26, clear: (x, z) => Math.abs(x) < 22 && z > -28,
    paint: (x, y, z, c) => { const px = x - 2 * Math.sin(z * 0.04); c.lerp(C('#b99766'), (1 - sm((Math.abs(px) - 1.6) / 1.4)) * sm((z + 85) / 6) * sm((40 - z) / 6) * 0.9); c.lerp(C('#d6a93a'), sm((x - 28) / 3) * sm((72 - x) / 3) * sm((z + 34) / 3) * sm((-4 - z) / 3)); } });
  grp.add(set.grp);
  const city = K.makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 5, midTowers: true, scale: 2.2 }); city.position.set(0, hfn(0, -98), -98); grp.add(city);
  grp.add(K.wheatField(28, -34, 44, 30, hfn, 3500, 3));
  [[-24, -16, 0.1, 14], [-40, -14, 0.3, 12], [26, -14, -0.2, 10]].forEach(([x, z, ry, l]) => { const w = K.stoneWall(l, 1.3, ry); w.position.set(x, hfn(x, z) - 0.1, z); grp.add(w); });
  const EW = 6.4, EH = 9.1, Z0 = -34, Z1 = 26;
  const pair = new THREE.Group(); grp.add(pair);
  const eP = P.makeEasel(EW, EH), eM = P.makeEasel(EW, EH); eP.position.set(-6.6, hfn(-6.6, 0) - 0.05, 0); eM.position.set(6.6, hfn(6.6, 0) - 0.05, 0); pair.add(eP, eM);
  eP.userData.setTex(P.countryTex('photo', 360, 512, Z0, Z1, 3));
  eM.userData.panel.material = lam('#e9dcc0');
  const cy = eP.userData.cy, topY = cy + EH / 2;
  /* map paper that unrolls */
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(EW, EH).translate(0, -EH / 2, 0), new THREE.MeshLambertMaterial({ map: P.countryTex('map', 360, 512, Z0, Z1, 5), emissive: '#ffffff', emissiveIntensity: 0.4 }));
  const mt = paper.material.map; paper.material.emissiveMap = mt; paper.position.set(0, topY, 0.4); paper.scale.y = 0.001; eM.add(paper);
  const scroll = P.makeScroll(EW + 0.2, 0.9); eM.add(scroll);
  const glowSea = new THREE.Mesh(new THREE.PlaneGeometry(EW, EH), ADD('#ffffff', { map: P.glowTex('sea', 360, 512, Z0, Z1), opacity: 0 })); glowSea.position.set(0, cy, 0.46); eM.add(glowSea);
  const glowMt = new THREE.Mesh(new THREE.PlaneGeometry(EW, EH), ADD('#ffffff', { map: P.glowTex('mount', 360, 512, Z0, Z1), opacity: 0 })); glowMt.position.set(0, cy, 0.47); eM.add(glowMt);
  const KEYS = ['jer', 'haifa', 'bs', 'tib', 'eilat'], pins = KEYS.map(k => { const [x, z] = P.cxz(k), [px, py] = eM.userData.toPanel(x, z, Z0, Z1), p = K.makePin('#e0401e'); p.userData.k = 0.3; p.rotation.x = Math.PI / 2; p.position.set(px, py, 0.5); eM.add(p); return p; });
  /* flicker on the photo */
  const NS = 280, spk = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.2, 0.2), ADD('#fff6c0', { opacity: 0.95 }), NS), d0 = new THREE.Object3D(), r = rng(9), sp = [];
  for (let k = 0; k < 4000 && sp.length < NS; k++) { const x = P.GX0 + r() * (P.GX1 - P.GX0), z = Z0 + r() * (Z1 - Z0); if (P.hAt(x, z) < 0.2) continue; const q = eP.userData.toPanel(x, z, Z0, Z1); sp.push([q[0], q[1], hash2(k, 2) * 6.28, 4 + hash2(k, 5) * 6]); }
  spk.frustumCulled = false; eP.add(spk);
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(EW + 2.6, EH + 2.6), ADD('#ffe27a', { opacity: 0 })); eP.add(ring); ring.position.set(0, cy, -0.12);
  const cams = [[0, [-9, 4.2, 54], [0, 6.2, 0]], [9, [-1, 5.6, 42], [-1, 6.6, 0]], [19, [5, 6.4, 35], [1, 6.8, 0]], [27.66, [0, 6.9, 31], [0, 6.8, 0]]];
  const upd = lt => {
    aim(cam, camTrack(lt, cams));
    const u0 = cl(lt / 0.9); eP.scale.setScalar(Math.max(0.001, pop(u0))); eM.scale.setScalar(Math.max(0.001, pop(cl((lt - 0.15) / 0.9))));
    const act = Math.max(ramp(lt, 2.8, 3.6) * (1 - ramp(lt, 9.6, 10.4)) * 0.85, ramp(lt, 18.2, 18.9));
    for (let i = 0; i < NS; i++) { const s = sp[i], on = Math.pow(Math.max(0, Math.sin(lt * s[3] + s[2])), 5) * act; d0.position.set(s[0], s[1], 0.38); d0.scale.setScalar(Math.max(0.0001, on * 1.3)); d0.updateMatrix(); spk.setMatrixAt(i, d0.matrix); }
    spk.instanceMatrix.needsUpdate = true;
    ring.material.opacity = 0.7 * (1 - ramp(lt, 0.9, 2.6)) * ramp(lt, 0.4, 0.7) + 0.3 * ramp(lt, 18.2, 18.7) * (0.6 + 0.4 * Math.sin(lt * 6));
    /* scroll: rests on the ledge, hops to the top, unrolls */
    const hop = ramp(lt, 10.3, 11.3), un = ramp(lt, 11.3, 14.6);
    const sy = 2.5 + (topY - 2.5) * hop + 2.2 * Math.sin(Math.PI * hop) - EH * un;
    scroll.position.set(0, sy, 0.8 + 0.1 * hop); scroll.rotation.x = -un * 0; scroll.userData.cyl.scale.set(1, 1 - 0.78 * un, 1 - 0.78 * un);
    paper.scale.y = Math.max(0.001, un); paper.visible = un > 0;
    glowSea.material.opacity = 0.85 * ramp(lt, 18.5, 19.6) * (0.7 + 0.3 * Math.sin(lt * 3));
    glowMt.material.opacity = 0.9 * ramp(lt, 21.0, 22.0) * (0.7 + 0.3 * Math.sin(lt * 3.4));
    pins.forEach((p, i) => { p.userData.pop(cl((lt - (23.6 + 0.5 * i)) / 0.5)); p.userData.glow(ramp(lt, 24 + 0.5 * i, 24.5 + 0.5 * i) * (0.7 + 0.3 * Math.sin(lt * 5))); });
    eP.userData.look(lt < 10 ? 1 : 0.85, 0); eM.userData.look(lt < 10.3 ? 0.7 : 1, 0);
  };
  const tipa = lt => ({ side: -1, xf: 0.84, size: 0.2, expr: lt < 0.8 ? 'neutral' : lt < 10.3 ? 'curious' : lt < 18.2 ? 'happy' : 'surprised', arms: lt < 10.3 ? 'point' : lt < 18.2 ? 'down' : 'up', hop: lt > 23.5 ? 0.4 : 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, branch: true, hero: () => pair, light: () => morning([0, 0, -4], 60), events: [[0.5, 'pop'], [10.3, 'whoosh'], [11.3, 'pop'], [18.2, 'pop'], [18.6, 'ding'], [21.0, 'ding'], [23.6, 'pop'], [24.1, 'pop'], [24.6, 'pop'], [25.1, 'pop'], [25.6, 'pop']] };
}

/* ===================================================================================== b: legend on the table map */
export function shotB(X) {
  const cam = X.cam, MAP = X.MAP, grp = new THREE.Group();
  const gr = P.makeOverlay((x, z) => { const y = mapY(x, z); return sm((y - 0.1) / 0.1) * (1 - sm((y - 0.95) / 0.3)); }, (x, z, m, c) => c.setRGB(0.35 * m, 1.0 * m, 0.3 * m), { step: 0.45 });
  const br = P.makeOverlay((x, z) => sm((mapY(x, z) - 1.25) / 0.45), (x, z, m, c) => c.setRGB(1.0 * m, 0.62 * m, 0.18 * m), { step: 0.45 });
  const bl = P.makeOverlay((x, z) => 1 - sm((mapY(x, z) - 0.1) / 0.03), (x, z, m, c) => { const d = sm((-x - 6) / 10); c.setRGB((0.5 - 0.4 * d) * m, (0.9 - 0.55 * d) * m, (1.0) * m); }, { step: 0.45 });
  grp.add(gr, br, bl);
  /* legend board standing left of the map */
  const board = new THREE.Group(); board.position.set(-29, -1.5, -2); board.rotation.y = 0.6; grp.add(board);
  const wood = lam('#8a5a30', { map: K.woodTex(3, 2, 2) }), cream = lam('#f1e6c6', { emissive: '#4a4030' });
  const bx = (sx, sy, sz, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); board.add(b); return b; };
  bx(9, 16.4, 1.0, 0, 9.0, 0, wood); bx(7.8, 14.6, 0.3, 0, 9.0, 0.6, cream);
  bx(1.1, 1.0, 5, -3.6, 0.5, -0.5, wood); bx(1.1, 1.0, 5, 3.6, 0.5, -0.5, wood); bx(9.8, 0.7, 1.4, 0, 16.9, 0.1, wood);
  const chips = [['#58b04a', 14.0], ['#a67c4a', 9.0], ['#86d6f6', 4.0]].map(([c, y]) => { const ch = P.makeChip(c, 2.0); ch.position.set(0, y, 1.1); board.add(ch); return ch; });
  const key = P.makeKey(); key.scale.setScalar(1.25); key.position.set(-23, -0.6, 12); grp.add(key);
  shadowSet(board);
  const S = [[1.9, 9.6], [9.8, 20.6], [20.9, 99]];
  const gk = i => pulse(0, 0, 0) + 0; /* placeholder to keep lint quiet */
  const cams = [[0, [-4, 50, 48], [-3, 0, 0]], [8, [-18, 38, 37], [-6, 0, 2]], [16, [12, 40, 38], [3, 0, -2]], [24.41, [-1, 46, 43], [-3, 0, -2]]];
  const upd = lt => {
    aim(cam, camTrack(lt, cams)); void gk;
    const bu = cl((lt - 0.4) / 0.9); board.visible = bu > 0; board.scale.setScalar(Math.max(0.001, pop(bu)));
    const g = S.map(([a, b], i) => pulse(lt, a, b, 0.2));
    [gr, br, bl].forEach((m, i) => { m.material.opacity = 0.9 * g[i]; });
    chips.forEach((c, i) => { c.userData.glow(g[i]); c.scale.setScalar(1 + 0.14 * g[i]); c.position.z = 1.1 + 0.7 * g[i]; });
    key.rotation.y = lt * 0.5; key.position.y = -0.6 + 0.35 * Math.abs(Math.sin(lt * 1.3));
  };
  const tipa = lt => ({ side: 1, xf: 0.82, size: 0.2, expr: lt < 1.9 ? 'happy' : lt < 9.8 ? 'curious' : lt < 20.9 ? 'happy' : 'surprised', arms: lt < 1.9 ? 'down' : 'point', hop: 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, mapMode: () => 2, hero: () => MAP.grp, light: () => morning([0, 0, 0], 80), events: [[0.5, 'pop'], [1.9, 'ding'], [9.8, 'ding'], [20.9, 'ding']] };
}
function shadowSet(g) { g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }

/* ===================================================================================== c: compass rose on the desk, then sun over the land */
export function shotC(X) {
  const cam = X.cam, grp = new THREE.Group(), desk = new THREE.Group(), land = new THREE.Group(); grp.add(desk, land);
  /* ---- desk */
  const sheet = P.paperSheet(31.5, 57, P.countryTex('map', 420, 760, -38, 38, 2)); sheet.position.set(0, -1.4, 0); sheet.rotation.y = -0.16; desk.add(sheet);
  const R = 10.5, rose = P.makeRose(R); desk.add(rose);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(R * 1.25, 40).rotateX(-Math.PI / 2), BASIC('#1a1008', { transparent: true, opacity: 0.0, depthWrite: false })); sh.position.y = -1.3; desk.add(sh);
  const cl1 = P.bookStack(4, 1); cl1.position.set(-31, -1.5, -20); cl1.rotation.y = 0.4; desk.add(cl1);
  const ink = P.inkwell(); ink.position.set(25, -1.5, -24); desk.add(ink);
  const mag = P.magnifier(); mag.position.set(24, -1.5, 22); mag.rotation.y = 0.5; desk.add(mag);
  const cup = P.penCup(); cup.position.set(-27, -1.5, 22); desk.add(cup);
  const cl2 = P.bookStack(3, 7); cl2.position.set(30, -1.5, 4); cl2.rotation.y = -0.3; desk.add(cl2);
  const W = [[1.5, 3.7, 0], [3.9, 5.9, 4], [6.2, 8.1, 2], [8.4, 10.6, 6]]; /* N, S, E, W arms: window per arm */
  const ORDER = [0, 4, 2, 6];
  /* ---- landscape with the sun arc */
  const hfn = (x, z) => { const base = 0.4 * Math.sin(x * 0.07 + 0.4) * Math.cos(z * 0.05) + 0.3 * Math.sin(z * 0.11 + x * 0.02 + 1.3); const left = 24 * Math.exp(-Math.pow((x + 105) / 50, 2) - Math.pow((z + 60) / 55, 2)) + 11 * Math.exp(-Math.pow((x + 48) / 30, 2) - Math.pow((z + 110) / 30, 2)); const shore = sm((x - 34) / 34); return (base + left) * (1 - shore) - 5.5 * shore; };
  const set = P.hillSet({ hfn, seed: 6, trees: 50, backdrop: false, clear: (x, z) => x > 30 || (Math.abs(x) < 14 && z > -24), zr: [-14, 30],
    paint: (x, y, z, c) => { c.lerp(C('#dcc590'), sm((x - 26) / 8)); } });
  land.add(set.grp);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ color: '#2f86c8', shininess: 90, specular: '#ffffff' })); sea.position.y = -1.2; land.add(sea);
  const wv = new THREE.Mesh(new THREE.PlaneGeometry(500, 400).rotateX(-Math.PI / 2).translate(250, 0, -100), BASIC('#ffffff', { map: K.waveTex(9, 8, 6), transparent: true, depthWrite: false, opacity: 0.5 })); wv.position.y = -1.1; land.add(wv);
  const ridge = new THREE.Group();
  [[-330, -620, 300, 70, 140], [-120, -700, 260, 52, 120], [-560, -560, 220, 60, 100]].forEach(([x, z, sx, sy, sz]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), lam('#7b9a9e')); m.scale.set(sx, sy, sz); m.position.set(x, -14, z); ridge.add(m); });
  land.add(ridge);
  const city = K.makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 8, midTowers: true, scale: 1.5 }); city.position.set(-30, hfn(-30, -52), -52); land.add(city);
  const w1 = K.stoneWall(12, 1.3, 0.2); w1.position.set(14, hfn(14, -14), -14); land.add(w1);
  const palms = []; for (let i = 0; i < 14; i++) { const x = 24 + i * 1.7 + hash2(i, 1) * 3, z = -8 - hash2(i, 2) * 40; palms.push([x, hfn(x, z), z, 0.9 + hash2(i, 3) * 0.6, hash2(i, 4)]); }
  land.add(K.plantTrees(palms, ['#4f8a3a', '#6aa04a']));
  const sunM = new THREE.Mesh(new THREE.SphereGeometry(34, 28, 20), new THREE.MeshBasicMaterial({ color: '#fff4cc', fog: false }));
  const sunH = new THREE.Mesh(new THREE.SphereGeometry(120, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffd28a', transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  const sunH2 = new THREE.Mesh(new THREE.SphereGeometry(300, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffc27a', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  land.add(sunM, sunH, sunH2);
  const beacon = x => { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 4, 10), lam('#d9d0b8')); t.position.y = 2; const l = new THREE.Mesh(new THREE.SphereGeometry(1.0, 14, 10), new THREE.MeshBasicMaterial({ color: '#ffcf5a' })); l.position.y = 4.9; const h = new THREE.Mesh(new THREE.SphereGeometry(3, 14, 10), ADD('#ffd24a', { opacity: 0 })); h.position.y = 4.9; g.add(t, l, h); g.position.set(x, hfn(x, -22), -22); g.userData.h = h; g.userData.l = l; return shadowSet2(g); };
  const bE = beacon(-26), bW = beacon(38); land.add(bE, bW);
  const T0 = 10.75, T1 = 18.81, lin = lt => cl((lt - T0) / (T1 - T0));
  const phiOf = lt => Math.PI * (0.02 + 0.96 * lin(lt));
  const sunPos = lt => { const f = phiOf(lt); return [-340 * Math.cos(f), -24 + 225 * Math.sin(f), -720]; };
  const cams = [[0, [-26, 32, 30], [0, 0, 0]], [4, [-10, 38, 35], [0, 0, -2]], [8, [22, 30, 27], [0, 0, 0]], [10.7, [8, 38, 31], [0, 0, -2]]];
  const ordGlow = (i, lt) => { const [a, b] = W[i]; return pulse(lt, a, b, 0.32); };
  const upd = lt => {
    const isLand = lt >= T0; desk.visible = !isLand; land.visible = isLand;
    if (!isLand) {
      aim(cam, camTrack(lt, cams));
      const u = ramp(lt, 0.2, 1.4), hgt = 24 * Math.pow(1 - u, 2); rose.position.set(0, -1.28 + hgt, 0); rose.scale.setScalar(Math.max(0.001, pop(cl(lt / 0.5))));
      sh.material.opacity = 0.32 * u; sh.scale.setScalar(1.1 - 0.1 * u);
      for (let i = 0; i < 8; i++) rose.userData.glow(i, 0);
      ORDER.forEach((arm, k) => rose.userData.glow(arm, ordGlow(k, lt)));
      [1, 3, 5, 7].forEach((arm, k) => rose.userData.glow(arm, 0.5 * ramp(lt, 10.0, 10.5) * (0.7 + 0.3 * Math.sin(lt * 6 + k))));
      [mag, ink].forEach((m, i) => { m.rotation.y += 0; });
    } else {
      const lt2 = lt - T0; aim(cam, camTrack(lt, [[T0, [-3, 6, 42], [0, 19, -100]], [T1, [3, 6.6, 31], [0, 19.5, -100]]]));
      const sp = sunPos(lt); sunM.position.set(...sp); sunH.position.set(...sp); sunH2.position.set(...sp);
      const f = phiOf(lt), s = Math.sin(f), dy = sm(s * 1.8);
      sunM.material.color.set('#ffb562').lerp(C('#fff6d8'), dy); sunH.material.opacity = 0.34 + 0.1 * (1 - dy);
      const ea = 1 - ramp(lin(lt), 0.0, 0.3), we = ramp(lin(lt), 0.7, 1.0);
      bE.userData.h.material.opacity = 0.85 * ea * (0.6 + 0.4 * Math.sin(lt * 9)); bW.userData.h.material.opacity = 0.85 * we * (0.6 + 0.4 * Math.sin(lt * 9));
      bE.userData.l.material.color.set('#7a6a3a').lerp(C('#ffd24a'), ea); bW.userData.l.material.color.set('#7a6a3a').lerp(C('#ffd24a'), we); void lt2;
    }
  };
  const light = lt => {
    if (lt < T0) return { target: [0, 0, 0], ext: 60, so: [-50, 60, 52], sunC: C('#ffe6bd'), sunI: 2.1, hemiI: 0.9, top: C('#7db8ea'), hor: C('#fde3b8') };
    const f = phiOf(lt), s = Math.sin(f), dy = sm(s * 1.9), k = lin(lt);
    const hor = C('#ffb48a').lerp(C('#fbe9bd'), dy).lerp(C('#ff9262'), ramp(k, 0.55, 1.0) * (1 - dy));
    return { target: [0, 0, -30], ext: 95, so: [-Math.cos(f) * 85, 14 + 70 * s, -22], sunC: C('#ff9d58').lerp(C('#fff0cc'), dy), sunI: 1.3 + 1.0 * s, hemiI: 0.62 + 0.4 * s, top: C('#6f8fd0').lerp(C('#79c3ee'), dy), hor, fog: [260, 1500] };
  };
  const tipa = lt => ({ side: -1, xf: 0.82, size: 0.2, expr: lt < T0 ? 'curious' : 'happy', arms: lt < T0 ? 'point' : 'up', hop: 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, mapMode: lt => (lt < T0 ? 1 : 0), hero: lt => (lt < T0 ? rose : land), light, events: [[1.5, 'ding'], [3.9, 'ding'], [6.2, 'ding'], [8.4, 'ding'], [T0 - 0.15, 'whoosh'], [T0 + 0.5, 'pop'], [T1 - 2.0, 'pop']] };
}
function shadowSet2(g) { g.traverse(o => { if (o.isMesh) { o.castShadow = true; } }); return g; }
