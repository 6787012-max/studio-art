/* g1_shots2.js - film_s1 shots d, x, q, e. NO PEOPLE, NO TEXT (digits on the kilometre posts only). ASCII only. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
import * as P from './g1_props.js';
import { camTrack, aim, morning } from './g1_shots1.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, phong, mapY, ll } = K;
const { BASIC } = P;
const ADD = (c, o) => BASIC(c, Object.assign({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }, o || {}));
const pulseW = (lt, a, b) => ramp(lt, a, a + 0.4) * (1 - ramp(lt, b, b + 0.4));

/* ===================================================================================== d: scale, ruler to road */
export function shotD(X) {
  const cam = X.cam, grp = new THREE.Group(), desk = new THREE.Group(), land = new THREE.Group(); grp.add(desk, land);
  const TC = 6.85;
  /* ---- desk with the paper map */
  const sg = new THREE.Group(); sg.rotation.y = -0.16; sg.position.y = -1.4; desk.add(sg);
  sg.add(P.paperSheet(31.5, 57, P.countryTex('map', 420, 760, -38, 38, 2)));
  const loc = k => { const [x, z] = P.cxz(k); return new THREE.Vector3((x - 1) * 0.75, 0.1, z * 0.75); };
  const A = loc('haifa'), B = loc('bs'), AB = B.clone().sub(A), len = AB.length(), ang = -Math.atan2(AB.z, AB.x), dir = AB.clone().normalize(), perp = new THREE.Vector3(-dir.z, 0, dir.x);
  const pA = K.makePin('#e0401e'), pB = K.makePin('#1fa05a'); pA.userData.k = pB.userData.k = 0.8; pA.position.copy(A); pB.position.copy(B); sg.add(pA, pB);
  const ruler = P.makeRuler(30, 3.2); sg.add(ruler);
  const mid = A.clone().add(B).multiplyScalar(0.5).add(perp.clone().multiplyScalar(2.1));
  const seg = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 0.8).translate(0.5, 0, 0), BASIC('#ffd24a')); seg.position.copy(A); seg.rotation.y = ang; sg.add(seg);
  const segG = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2.6).translate(0.5, 0, 0), ADD('#ffe27a', { opacity: 0.35 })); segG.position.copy(A); segG.rotation.y = ang; sg.add(segG);
  const dsk = [P.bookStack(4, 3), P.inkwell(), P.magnifier(), P.penCup(), P.bookStack(3, 9)];
  [[-31, -22], [26, -26], [25, 24], [-28, 22], [31, 2]].forEach(([x, z], i) => { dsk[i].position.set(x, -1.5, z); dsk[i].rotation.y = i; desk.add(dsk[i]); });
  /* ---- road landscape */
  const rx = z => 6 * Math.sin(z * 0.02);
  const hfn = (x, z) => 0.5 * Math.sin(x * 0.05 + z * 0.03) + 0.3 * Math.sin(z * 0.09 + 1) + 9 * sm((Math.abs(x - rx(z)) - 10) / 34) + 5 * Math.exp(-Math.pow((x + 60) / 30, 2) - Math.pow((z + 90) / 40, 2));
  const set = P.hillSet({ hfn, seed: 11, trees: 70, spread: 160, clear: (x, z) => Math.abs(x - rx(z)) < 8 && z > -200, zr: [-60, 40],
    paint: (x, y, z, c) => { c.lerp(C('#d6a93a'), sm((x - 22) / 4) * sm((70 - x) / 4) * sm((z + 120) / 3) * sm((-40 - z) / 3)); } });
  land.add(set.grp);
  land.add(K.wheatField(22, -120, 46, 80, hfn, 5000, 5));
  const NR = 120, zs = i => 46 - (246 * i) / NR, pos = [], col = [], idx = [], cc = new THREE.Color();
  for (let i = 0; i <= NR; i++) { const z = zs(i), x = rx(z); for (const s of [-1, 1]) { pos.push(x + s * 2.7, hfn(x + s * 2.7, z) + 0.12, z); cc.set(Math.abs(s) > 0 ? '#c9a66a' : '#c9a66a').multiplyScalar(0.92 + 0.08 * hash2(i, s)); col.push(cc.r, cc.g, cc.b); } if (i < NR) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); rg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); rg.setIndex(idx); rg.computeVertexNormals();
  const road = new THREE.Mesh(rg, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); road.receiveShadow = true; road.frustumCulled = false; land.add(road);
  const front = new THREE.Mesh(new THREE.SphereGeometry(1.3, 14, 10), ADD('#ffe27a', { opacity: 0.85 })); land.add(front);
  const town0 = K.makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 3, midTowers: true, scale: 1.2 }); town0.position.set(-24, hfn(-24, 8), 8); land.add(town0);
  const town1 = K.makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 14, seed: 9, midTowers: true, scale: 3.2 }); town1.position.set(rx(-190), hfn(rx(-190), -190), -190); land.add(town1);
  const PZ = [-5, -35, -65, -95, -125, -155], posts = PZ.map((z, k) => { const m = P.makeMilestone(String((k + 1) * 10)); m.position.set(rx(z) + 5.0, hfn(rx(z) + 5, z), z); land.add(m); return m; });
  const camD = [[0, [18, 24, 36], [-2, 0, -6]], [3.2, [8, 17, 26], [-2, 0, -6]], [TC - 0.05, [-9, 9, 20], [-2, 2, -10]]];
  const upd = lt => {
    const isLand = lt >= TC; desk.visible = !isLand; land.visible = isLand;
    if (!isLand) {
      aim(cam, camTrack(lt, camD));
      pA.userData.pop(cl((lt - 0.5) / 0.6)); pB.userData.pop(cl((lt - 1.2) / 0.6)); pA.userData.glow(ramp(lt, 1, 2) * 0.6); pB.userData.glow(ramp(lt, 1.7, 2.6) * 0.6);
      const ru = ramp(lt, 1.9, 2.8); ruler.position.copy(mid).setY(0.35 + 12 * Math.pow(1 - ru, 2)); ruler.rotation.y = ang + 0.5 * (1 - ru); ruler.visible = lt > 1.8;
      const su = ramp(lt, 3.0, 3.9), lf = ramp(lt, 4.6, 6.7);
      seg.visible = segG.visible = su > 0; seg.scale.x = segG.scale.x = Math.max(0.01, len * su * (1 + 1.5 * lf));
      seg.position.set(A.x, 0.28 + 9 * lf, A.z); segG.position.copy(seg.position); seg.rotation.z = segG.rotation.z = 0.5 * lf;
      segG.material.opacity = 0.3 + 0.15 * Math.sin(lt * 7);
    } else {
      const l2 = lt - TC; aim(cam, camTrack(lt, [[TC, [rx(40) + 1, 3.4, 40], [rx(-120), 5.2, -120]], [13.99, [rx(10) + 1, 5.2, 10], [rx(-130), 6.4, -130]]]));
      const frac = ramp(lt, TC + 0.05, 12.2); road.geometry.setDrawRange(0, Math.max(0, Math.floor(frac * NR)) * 6);
      const fz = zs(frac * NR); front.position.set(rx(fz), hfn(rx(fz), fz) + 0.9, fz); front.visible = frac > 0.01 && frac < 0.995; front.scale.setScalar(1 + 0.2 * Math.sin(lt * 9)); void l2;
      posts.forEach((m, k) => { const dz = 40 - PZ[k]; m.userData.pop(cl((lt - (7.5 + 1.0 * k)) / 0.45), 1 + dz / 75); });
    }
  };
  const light = lt => (lt < TC ? { target: [0, 0, 0], ext: 60, so: [-50, 60, 52], sunC: C('#ffe6bd'), sunI: 2.1, hemiI: 0.9, top: C('#7db8ea'), hor: C('#fde3b8') } : morning([0, 0, -60], 120));
  const tipa = lt => ({ side: 1, xf: 0.82, size: 0.2, expr: lt < 3 ? 'curious' : lt < TC ? 'surprised' : 'cheering', arms: lt < 3 ? 'down' : lt < TC ? 'point' : 'up', hop: lt > TC + 1.5 ? 0.4 : 0, show: cl((lt - 0.3) / 0.5) });
  const ev = [[0.5, 'pop'], [1.2, 'pop'], [2.0, 'pop'], [3.0, 'ding'], [4.6, 'whoosh'], [TC - 0.1, 'whoosh']]; for (let k = 0; k < 6; k++) ev.push([7.5 + k, 'pop']);
  return { grp, upd, tipa, mapMode: lt => (lt < TC ? 1 : 0), hero: lt => (lt < TC ? sg : land), light, events: ev };
}

/* ===================================================================================== x: three kinds of maps (hill set) */
export function shotX(X) {
  const cam = X.cam, grp = new THREE.Group();
  const hfn = (x, z) => 0.4 * Math.sin(x * 0.06 + 0.4) * Math.cos(z * 0.05) + 0.3 * Math.sin(z * 0.1 + x * 0.02 + 1.3) + 16 * Math.exp(-Math.pow((x + 20) / 55, 2) - Math.pow((z + 100) / 40, 2)) + 9 * Math.exp(-Math.pow((x - 80) / 30, 2) - Math.pow((z + 50) / 30, 2));
  const set = P.hillSet({ hfn, seed: 7, trees: 46, row: 10, rowZ: -30, clear: (x, z) => Math.abs(x) < 24 && z > -30,
    paint: (x, y, z, c) => { c.lerp(C('#d6a93a'), sm((x + 70) / 3) * sm((-30 - x) / 3) * sm((z + 50) / 3) * sm((-10 - z) / 3)); const px = x - 2 * Math.sin(z * 0.04); c.lerp(C('#b99766'), (1 - sm((Math.abs(px) - 1.6) / 1.4)) * sm((z + 85) / 6) * sm((-10 - z) / 6) * 0.8); } });
  grp.add(set.grp);
  const city = K.makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 5, midTowers: true, scale: 2.0 }); city.position.set(-24, hfn(-24, -100), -100); grp.add(city);
  grp.add(K.wheatField(30, -52, 40, 30, hfn, 3000, 3));
  [[-30, -18, 0.2, 14], [30, -16, -0.2, 12]].forEach(([x, z, ry, l]) => { const w = K.stoneWall(l, 1.3, ry); w.position.set(x, hfn(x, z) - 0.1, z); grp.add(w); });
  const EW = 5.4, EH = 9.6, xs = [-11, 0, 11], names = ['physical', 'political', 'rain'], CU = [0.35, 7.17, 14.43];
  const row = new THREE.Group(); grp.add(row);
  const es = names.map((n, i) => { const e = P.makeEasel(EW, EH); e.userData.setTex(P.countryTex(n, 270, 480, -38, 38, 20 + i)); e.position.set(xs[i], hfn(xs[i], 0) - 0.05, 0); row.add(e); return e; });
  const cy = es[0].userData.cy, topY = cy + EH / 2, y0 = es.map((e, i) => hfn(xs[i], 0) - 0.05);
  /* toppers */
  const mtn = new THREE.Group(); [[0, 0, 1.6], [-1.7, -0.3, 1.0], [1.6, -0.2, 1.1]].forEach(([x, z, s]) => { const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.5 * s, 3 * s, 8), lam('#8f6a46')); c1.position.set(x, 1.5 * s, z); const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.62 * s, 1.0 * s, 8), lam('#f4f0e6', { emissive: '#555555' })); c2.position.set(x, 2.5 * s, z); mtn.add(c1, c2); });
  const pin = K.makePin('#e0401e'); pin.userData.k = 1.1;
  const drop = new THREE.Group(); { const b = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 14), phong('#2f86e0', { shininess: 90 })); const t = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.9, 18).translate(0, 0.95, 0), phong('#2f86e0', { shininess: 90 })); t.position.y = 0.4; drop.add(b, t); }
  const tops = [mtn, pin, drop]; tops.forEach((t, i) => { t.position.set(xs[i], y0[i] + topY + 1.9, 0.6); row.add(t); }); K.shadowable(drop); K.shadowable(mtn);
  /* political dots */
  const dots = Object.keys(P.CITIES).map(k => { const [x, z] = P.cxz(k), q = es[1].userData.toPanel(x, z, -38, 38), d = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), phong('#e0401e', { shininess: 80 })); d.position.set(q[0], q[1], 0.55); es[1].add(d); return d; });
  /* rain over the thematic sheet */
  const fwdOf = (i, lt) => ramp(lt, CU[i], CU[i] + 0.7) * (i < 2 ? 1 - ramp(lt, CU[i + 1] - 0.1, CU[i + 1] + 0.6) : 1);
  const rain = K.makeRain(220, 1.0, 5.5, (tb, i, k) => ({ x: xs[2] + (hash2(i, k) - 0.5) * EW * 0.9, y: y0[2] + topY - 0.4 - hash2(k, i) * 1.2, z: 5.9 * fwdOf(2, tb) + 1.0, p: ramp(tb, CU[2] + 0.6, CU[2] + 1.6) }), () => y0[2] + cy - EH / 2 + 0.3);
  grp.add(rain);
  const cams = [[0, [0, 6.6, 47], [0, 6.9, 0]], [10, [-2, 7.0, 40], [0, 6.9, 0]], [20.93, [1, 7.3, 37], [0, 6.9, 0]]];
  const upd = lt => {
    aim(cam, camTrack(lt, cams));
    es.forEach((e, i) => { const f = fwdOf(i, lt), seen = lt >= CU[i] ? 1 : 0; e.position.z = 5.4 * f; e.scale.setScalar(1 + 0.15 * f); e.userData.look(0.45 + 0.55 * f + (lt < CU[0] ? 0.3 : 0), f * (0.7 + 0.3 * Math.sin(lt * 5))); void seen; });
    tops.forEach((t, i) => { const u = cl((lt - CU[i] - 0.2) / 0.6), f = fwdOf(i, lt); t.visible = u > 0; t.scale.setScalar(Math.max(0.001, pop(u)) * (1 + 0.15 * f)); t.position.z = 0.6 + 5.4 * f; t.position.y = y0[i] + topY + 1.9 + 0.35 * Math.sin(lt * 2 + i); if (t.userData.glow) t.userData.glow(f); });
    dots.forEach((d, k) => { const u = cl((lt - (CU[1] + 0.9 + 0.35 * k)) / 0.4); d.visible = u > 0; d.scale.setScalar(Math.max(0.001, pop(u))); });
    rain.userData.update(lt);
  };
  const tipa = lt => ({ side: -1, xf: 0.86, size: 0.2, expr: lt < 7.17 ? 'curious' : lt < 14.43 ? 'happy' : 'surprised', arms: 'point', hop: lt > 18 ? 0.3 : 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, branch: true, hero: () => row, light: () => morning([0, 0, 0], 60), events: [[0.35, 'pop'], [7.17, 'pop'], [14.43, 'pop'], [0.8, 'whoosh'], [7.6, 'whoosh'], [14.9, 'whoosh']] };
}

/* ===================================================================================== q: north on the table map */
export function shotQ(X) {
  const cam = X.cam, MAP = X.MAP, grp = new THREE.Group();
  const R = 8.5, rose = P.makeRose(R); rose.position.set(1, 6.0, 8); grp.add(rose);
  const tip = new THREE.Vector3(1, 6.8, 8 - R), her = P.cxz ? ll(33.28, 35.77) : [12, -32], hy = mapY(her[0], her[1]);
  const hpin = K.makePin('#ffffff'); hpin.userData.k = 1.5; hpin.position.set(her[0], hy + 0.05, her[1]); grp.add(hpin);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 2.2, 14, 16, 1, true).translate(0, 7, 0), ADD('#fff0a0', { opacity: 0, side: THREE.DoubleSide })); col.position.set(her[0], hy, her[1]); grp.add(col);
  const wave = new THREE.Mesh(new THREE.TorusGeometry(1, 0.15, 8, 40).rotateX(Math.PI / 2), ADD('#ffe27a', { opacity: 0 })); wave.position.set(her[0], hy + 0.4, her[1]); grp.add(wave);
  const beam = K.makeThickLine([[tip.x, tip.y, tip.z], [(tip.x + her[0]) / 2 + 2, 11.5, (tip.z + her[1]) / 2], [her[0], hy + 5.5, her[1]]], 0.34, BASIC('#ffd24a')); grp.add(beam);
  const cams = [[0, [3, 56, 56], [1, 0, -8]], [8.67, [0, 52, 55], [1, 0, -10]]];
  const blink = (lt, i) => { const T = 0.7 + 0.6 * i, d = Math.abs(lt - T - 0.25); return Math.max(0, 1 - d / 0.3); };
  const upd = lt => {
    aim(cam, camTrack(lt, cams));
    rose.scale.setScalar(Math.max(0.001, pop(cl(lt / 0.6)))); rose.position.y = 6.0 + 0.25 * Math.sin(lt * 1.8);
    const ans = lt >= 6.41, fl = [0, 2, 4, 6];
    for (let i = 0; i < 8; i++) rose.userData.glow(i, 0);
    if (!ans) { const k = Math.floor((lt - 0.7) / 0.6); if (lt >= 0.7 && lt < 6.1) rose.userData.glow(fl[((k % 4) + 4) % 4], blink(lt, k)); } else { rose.userData.glow(0, ramp(lt, 6.41, 6.9) * (0.85 + 0.15 * Math.sin(lt * 7))); [1, 7].forEach(a => rose.userData.glow(a, 0.18 * ramp(lt, 6.6, 7.2))); }
    rose.userData.question(ramp(lt, 0.6, 1.1) * (ans ? 0 : 1), lt * (lt > 6.11 ? 1.8 : 1), lt > 6.11 ? '#ff9a3a' : '#ffd24a');
    beam.userData.setU(ramp(lt, 6.5, 7.6));
    hpin.userData.pop(cl((lt - 7.3) / 0.6)); hpin.userData.glow(ramp(lt, 7.4, 8.0) * (0.7 + 0.3 * Math.sin(lt * 6)));
    col.material.opacity = 0.5 * ramp(lt, 7.3, 8.0) * (0.7 + 0.3 * Math.sin(lt * 8)); col.visible = lt > 7.3;
    const wu = cl((lt - 7.3) / 1.2); wave.visible = wu > 0 && wu < 1; wave.scale.setScalar(1 + 5 * wu); wave.material.opacity = 0.8 * (1 - wu);
  };
  const tipa = lt => ({ side: 1, xf: 0.82, size: 0.2, expr: lt < 0.8 ? 'neutral' : lt < 6.41 ? 'curious' : 'cheering', arms: lt < 6.41 ? 'down' : 'up', hop: lt > 7.2 ? 0.5 : 0, show: cl((lt - 0.3) / 0.5) });
  const ev = [[0.4, 'pop'], [6.11, 'countdown'], [6.41, 'answer'], [6.5, 'ding'], [7.3, 'pop']]; for (let i = 0; i < 8; i++) ev.push([0.7 + 0.6 * i + 0.2, 'tick']);
  return { grp, upd, tipa, mapMode: () => 2, hero: () => MAP.grp, light: () => morning([0, 0, 0], 80), events: ev };
}

/* ===================================================================================== e: the brown chip flies to the mountain spine */
export function shotE(X) {
  const cam = X.cam, MAP = X.MAP, grp = new THREE.Group();
  const spineMask = (x, z) => sm((mapY(x, z) - 1.1) / 0.5) * sm((x + 2.5) / 1.5) * (1 - sm((x - 9) / 1.5)) * sm((z + 29) / 2) * (1 - sm((z - 12) / 2));
  const spine = P.makeOverlay(spineMask, (x, z, m, c) => { c.set('#b98c54').multiplyScalar(0.9 + 0.2 * hash2(Math.floor(x * 2), Math.floor(z * 2))); }, { solid: true, lift: 0.04, step: 0.3 });
  spine.visible = false; grp.add(spine);
  const R = 3.8, spec = [['#58b04a', -11], ['#a67c4a', 0], ['#86d6f6', 11]];
  const chips = spec.map(([c, x]) => { const ch = P.makeChip(c, R); ch.position.set(x, 12, 14); grp.add(ch); return ch; });
  const T = [3.2, 6.6, -5.4];
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 1.35, 0.28, 10, 48), BASIC('#ffd24a')); grp.add(ring);
  const splash = new THREE.Mesh(new THREE.TorusGeometry(1, 0.2, 8, 40).rotateX(Math.PI / 2), ADD('#ffe27a', { opacity: 0 })); splash.position.set(T[0], 5.4, T[2]); grp.add(splash);
  const beamUp = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.6, 12, 18, 1, true).translate(0, 6, 0), ADD('#fff0a0', { opacity: 0, side: THREE.DoubleSide })); beamUp.position.set(T[0], 3.6, T[2]); grp.add(beamUp);
  const NS = 140, st = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.28), ADD('#ffe27a', { opacity: 0.95 }), NS), d0 = new THREE.Object3D(); st.frustumCulled = false; grp.add(st);
  const cams = [[0, [0, 41, 52], [0, 3, 2]], [8, [3, 43, 49], [1, 2, -2]], [14, [-16, 42, 36], [2, 1, -4]], [22.25, [0, 80, 70], [0, 0, -1]]];
  const upd = lt => {
    aim(cam, camTrack(lt, cams));
    chips.forEach((c, i) => {
      const u = cl((lt - (0.6 + 0.8 * i)) / 0.6); c.visible = u > 0; const bob = 0.35 * Math.sin(lt * 2 + i);
      c.userData.glow(i === 1 ? ramp(lt, 3.6, 4.2) * 0.35 : 0);
      if (i === 1 && lt >= 7.59) {
        const f = ramp(lt, 7.6, 9.0); c.position.set(0 + (T[0] - 0) * f, 12 + (T[1] - 12) * f + 8 * Math.sin(Math.PI * f), 14 + (T[2] - 14) * f); c.scale.setScalar(Math.max(0.001, (1 - 0.65 * f))); c.rotation.set(0, 6.3 * f, 0.5 * Math.sin(Math.PI * f)); c.visible = lt < 9.05; c.userData.glow(0.8);
      } else if (i !== 1 && lt >= 7.59) { const g = 1 - ramp(lt, 7.7, 8.5); c.scale.setScalar(Math.max(0.0001, g * pop(u))); c.position.set(spec[i][1], 12 + bob, 14); c.rotation.set(0, 0, 0); c.visible = g > 0.01; }
      else { c.position.set(spec[i][1], 12 + bob, 14); c.scale.setScalar(Math.max(0.0001, pop(u))); c.rotation.set(0, 0.15 * Math.sin(lt + i), 0); }
    });
    const rv = lt > 2.4 && lt < 7.59, cd = lt > 7.29; ring.visible = rv; ring.position.set(0, 12 + 0.35 * Math.sin(lt * 2 + 1), 14.6); ring.scale.setScalar(pop((lt - 2.4) / 0.4) * (1 + 0.1 * Math.sin(lt * (cd ? 11 : 4)))); ring.material.color.set(cd ? '#ff9a3a' : '#ffd24a');
    const land = lt >= 9.0; spine.visible = land; const rise = ramp(lt, 9.0, 10.8); spine.userData.uRise.value = 0.9 * rise;
    spine.material.emissive.setRGB(0.55 * (ramp(lt, 9.0, 9.6) * (0.7 + 0.3 * Math.sin(lt * 4))), 0.38 * ramp(lt, 9.0, 9.6) * (0.7 + 0.3 * Math.sin(lt * 4)), 0.08);
    const su = cl((lt - 9.0) / 1.4); splash.visible = su > 0 && su < 1; splash.scale.setScalar(1 + 7 * su); splash.material.opacity = 0.85 * (1 - su);
    beamUp.visible = lt > 9.0; beamUp.material.opacity = 0.45 * ramp(lt, 9.0, 9.8) * (0.7 + 0.3 * Math.sin(lt * 6)) * (1 - 0.6 * ramp(lt, 12, 14));
    const cf = ramp(lt, 11.5, 11.7);
    for (let i = 0; i < NS; i++) { const age = Math.max(0, lt - 11.65 - hash2(i, 1) * 3.5), a = hash2(i, 2) * 6.28, rr = 2 + hash2(i, 3) * 9; d0.position.set(T[0] + Math.cos(a) * rr * (0.4 + age * 0.3), 5 + age * (2.5 + 3 * hash2(i, 4)) - age * age * 0.5, T[2] + Math.sin(a) * rr * (0.4 + age * 0.3)); d0.rotation.set(age * 3, age * 4, 0); d0.scale.setScalar(cf > 0 && age > 0 ? Math.max(0.001, 1 - age / 5) : 0.0001); d0.updateMatrix(); st.setMatrixAt(i, d0.matrix); }
    st.instanceMatrix.needsUpdate = true;
  };
  const tipa = lt => ({ side: -1, xf: 0.84, size: 0.2, expr: lt < 2.4 ? 'happy' : lt < 7.59 ? 'curious' : lt < 9.0 ? 'surprised' : 'cheering', arms: lt < 7.59 ? 'point' : 'up', hop: lt > 9.0 ? 0.6 : 0, show: cl((lt - 0.3) / 0.5) });
  return { grp, upd, tipa, mapMode: () => 2, hero: () => MAP.grp, light: () => morning([0, 0, 0], 80),
    events: [[0.6, 'pop'], [1.4, 'pop'], [2.2, 'pop'], [7.29, 'countdown'], [7.59, 'answer'], [7.65, 'whoosh'], [9.0, 'ding'], [11.65, 'stamp'], [11.7, 'ding']] };
}
