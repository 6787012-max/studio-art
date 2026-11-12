/* shots_b - art pass for gezer_trip film_a shots s6 solomon_gate, s7 standing_stones, s8 dan_camp, s9 forest_clearing.
   No people, no animals, no text. ASCII only. Every update is a pure function of lt (local time). */
import * as THREE from 'three';
import { sm, lerp3, easeOutBack, makeHills, makeClouds } from './gz_kit.js';
import { heightMesh, makePuff, track, rng, shadowable } from './gz_kit2.js';
import { lam, phong, clamp, noiseTex, woodTex, ashMat, inst, tufts, rocks, bushes, merlons, farGround, makeCity } from './gz_kit3.js';

const cl01 = u => Math.max(0, Math.min(1, u));
const C = c => new THREE.Color(c);
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const BASIC = c => new THREE.MeshBasicMaterial({ color: c });
const easeO3 = u => 1 - Math.pow(1 - cl01(u), 3);

function envB(grp, farColor, farY, hillCols, rotate) {
  grp.add(farGround(farColor, farY));
  const hc = hillCols || ['#9db483', '#b2c6b4', '#d0dde0'];
  const h = makeHills(lam(hc[0]), lam(hc[1]), lam(hc[2]));
  grp.add(h);
  const cm = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  grp.add(makeClouds(cm));
  if (rotate) { const h2 = makeHills(lam(hc[0]), lam(hc[1]), lam(hc[2])); h2.rotation.y = Math.PI / 2; grp.add(h2); }
}

function fieldTex(seed, rep) {
  const fc = document.createElement('canvas'); fc.width = fc.height = 256;
  const fg = fc.getContext('2d'), fr = rng(seed), pal = ['#a9c46d', '#8fb35e', '#c4c47a', '#b99a66', '#7ba24c', '#d0bf86'];
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { fg.fillStyle = pal[Math.floor(fr() * pal.length)]; fg.fillRect(i * 32, j * 32, 32, 32); fg.strokeStyle = 'rgba(80,70,40,0.25)'; fg.strokeRect(i * 32, j * 32, 32, 32); }
  const t = new THREE.CanvasTexture(fc); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t;
}

export function makeShotsB(cam) {
  /* ================= s6 solomon_gate ================= */
  function buildS6() {
    const grp = new THREE.Group(), r = rng(66);
    const ground = heightMesh(-100, 100, -120, 70, 200, 190, (x, z) => 0.25 * Math.sin(x * 0.13) * Math.cos(z * 0.11) * sm((Math.hypot(x, z + 10) - 16) / 12),
      (x, y, z, c) => { c.set('#cdbb85').lerp(C('#b5a070'), 0.5 + 0.5 * Math.sin(x * 0.3) * Math.sin(z * 0.27)); if (z < 6 && z > -70) c.lerp(C('#d6c9a4'), 0.4); },
      lam('#ffffff', { vertexColors: true, map: noiseTex(66, 40, 38) }));
    grp.add(ground);
    envB(grp, '#b8a56e', -0.3);
    const street = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 93).rotateX(-Math.PI / 2), ashMat('#d9ccae', 6.4, 93)); street.position.set(0, 0.03, -18.5); street.receiveShadow = true; grp.add(street);
    for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 16.8).rotateX(-Math.PI / 2), ashMat('#cbbd9a', 3, 16.8)); f.position.set(s * 3.9, 0.03, 0); f.receiveShadow = true; grp.add(f); }
    const drain = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 16.4), BASIC('#3a2c1c')); drain.position.set(0, 0.04, 0); grp.add(drain);
    /* course-by-course build */
    const CH = 0.6, NC = 12, COL = '#e6d8b8', layers = [];
    for (let c = 0; c < NC; c++) layers.push([]);
    const holder = new THREE.Group(); grp.add(holder);
    const addEl = (cx, cz, sx, sz, courses) => {
      for (let c = 0; c < courses; c++) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(sx, CH - 0.02, sz), ashMat(COL, Math.max(sx, sz), CH));
        m.position.set(cx, CH * (c + 0.5), cz); m.castShadow = true; m.receiveShadow = true; m.userData.y0 = m.position.y; m.userData.d = r() * 0.25; holder.add(m); layers[c].push(m);
      }
    };
    const b = [-8.1, -2.7, 2.7, 8.1];
    for (const s of [-1, 1]) {
      for (const z of b) { addEl(s * 2.4, z, 0.6, 0.6, 6); addEl(s * 3.9, z, 3.3, 0.6, 6); }
      addEl(s * 5.7, 0, 0.6, 16.8, 6);
      addEl(s * 4.6, 9.5, 5.0, 4.4, 12);
      addEl(s * 17.5, 9.5, 21, 4.0, 8);
    }
    /* extras: benches, doors, merlons */
    const extras = new THREE.Group(); grp.add(extras);
    const bm = lam('#efe3c6', { map: noiseTex(7, 1, 1) });
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const zc = (b[i] + b[i + 1]) / 2;
      const bk = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 4.2), bm); bk.position.set(s * 5.1, 0.25, zc); extras.add(shadowable(bk));
      for (const zz of [b[i] + 0.55, b[i + 1] - 0.55]) { const bs = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.5), bm); bs.position.set(s * 3.9, 0.225, zz); extras.add(shadowable(bs)); }
    }
    const wood = lam('#9a6a38', { map: woodTex(8, 1, 1) });
    for (const s of [-1, 1]) {
      const pv = new THREE.Group(); pv.position.set(s * 2.0, 0, 8.1); pv.rotation.y = -s * 1.5;
      const dm = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.4, 0.16), wood); dm.position.set(s * 1.0, 1.7, 0); pv.add(dm);
      for (const y of [0.7, 1.7, 2.7]) { const st = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.2), lam('#3a2a18')); st.position.set(s * 1.0, y, 0); pv.add(st); }
      extras.add(shadowable(pv));
    }
    const mer = [];
    for (const s of [-1, 1]) {
      for (let x = 2.4; x <= 6.9; x += 0.9) for (const z of [7.5, 11.5]) mer.push([s * x, 7.5, z, 0]);
      for (let z = 7.6; z <= 11.5; z += 0.9) for (const x of [2.3, 6.9]) mer.push([s * x, 7.5, z, 0]);
      for (let x = 7.6; x <= 27.5; x += 0.95) for (const z of [7.6, 11.4]) mer.push([s * x, 5.1, z, 0]);
    }
    extras.add(merlons(mer, lam('#d8caa6'), 0.6));
    const puffs = [[-7, 12.8], [7, 12.8], [-3, 12.8], [3, 12.8], [-14, 12], [14, 12], [-5.8, 2], [5.8, -3], [-5.8, -5], [5.8, 6]].map(q => { const p = makePuff('#e0cf9f'); p.position.set(q[0], 0.6, q[1]); grp.add(p); return p; });
    /* city beyond the gate: flat-roofed houses */
    const hs = [];
    for (let tries = 0; hs.length < 50 && tries < 600; tries++) {
      const x = (r() - 0.5) * 66, z = -52 + r() * 62, w = 3 + r() * 3, d = 3 + r() * 2, h = 2.4 + r() * 2.6;
      if (z > -12 ? Math.abs(x) < 9 : Math.abs(x) < 4.6) continue;
      if (z > 5 && Math.abs(x) < 30) continue;
      if (hs.some(q => Math.abs(q.x - x) < (q.w + w) / 2 + 0.8 && Math.abs(q.z - z) < (q.d + d) / 2 + 0.8)) continue;
      hs.push({ x, z, w, d, h });
    }
    const pal = ['#e8d9b6', '#d9c294', '#efe4cc', '#cdb184', '#e0cba0'].map(C);
    grp.add(inst(new THREE.BoxGeometry(1, 1, 1), lam('#ffffff', { map: noiseTex(12, 1, 1) }), hs.length, (i, d, col) => { const q = hs[i]; d.position.set(q.x, q.h / 2, q.z); d.scale.set(q.w, q.h, q.d); return col.copy(pal[i % 5]).multiplyScalar(0.9 + 0.2 * hash(i, 3)); }));
    grp.add(inst(new THREE.BoxGeometry(1, 1, 1), lam('#f3ead2'), hs.length, (i, d) => { const q = hs[i]; d.position.set(q.x, q.h + 0.09, q.z); d.scale.set(q.w + 0.25, 0.18, q.d + 0.25); }));
    grp.add(inst(new THREE.BoxGeometry(0.9, 1.5, 0.06), BASIC('#2a1d12'), hs.length, (i, d) => { const q = hs[i]; d.position.set(q.x + (hash(i, 9) - 0.5) * q.w * 0.5, 0.75, q.z + q.d / 2 + 0.03); }));
    grp.add(tufts(380, 61, rr => { const x = -22 + rr() * 44, z = 14 + rr() * 18; if (Math.abs(x) < 3) return null; return [x, 0, z]; }, ['#c8b56a', '#b5a45a', '#9fae5e'], 0.4, 1.0));
    grp.add(rocks(40, 62, rr => { const x = -24 + rr() * 48, z = 13 + rr() * 22; if (Math.abs(x) < 3.5) return null; return [x, 0, z]; }, '#cdbd98', 0.3, 0.9));
    grp.add(bushes(14, 63, rr => { const x = (rr() < 0.5 ? -1 : 1) * (8 + rr() * 14); return [x, 0, 14 + rr() * 8]; }, '#6f9a44', 0.6, 1.2));
    const KEYS = [[0, [3, 2.0, 33], [0, 3.2, 0]], [3.5, [1, 1.9, 30], [0, 3.0, 0]], [4.4, [0, 1.6, 15], [0, 1.8, 0]], [5.0, [0, 1.6, 5.5], [-1.5, 1.5, 0]],
                  [5.6, [0.6, 1.6, 1.4], [-4.8, 0.9, 0.4]], [6.2, [0, 1.6, -2], [0, 1.7, -12]], [7.0, [0, 1.7, -9], [2, 2.2, -22]], [8.0, [0, 2.2, -14], [3, 2.0, -30]]];
    const upd = (t, lt) => {
      const c = track(lt, KEYS); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
      layers.forEach((arr, ci) => arr.forEach(m => {
        const u = cl01((lt - (0.2 + ci * 0.25) - m.userData.d) / 0.5);
        m.visible = u > 0; m.position.y = m.userData.y0 + (1 - easeO3(u)) * 6;
      }));
      const ue = cl01((lt - 3.0) / 0.6); extras.visible = ue > 0; extras.position.y = (1 - easeO3(ue)) * 4;
      puffs.forEach((p, k) => { p.userData.setU(cl01((lt - (0.55 + k * 0.32)) / 0.9)); p.scale.multiplyScalar(1.3); });
    };
    return { grp, upd, sun: { t: [0, 0, -4], ext: 58 } };
  }

  /* ================= s7 standing_stones ================= */
  function rockStone(seed, w, h, d) {
    const g = new THREE.BoxGeometry(1, 1, 1, 8, 16, 8); g.translate(0, 0.5, 0);
    const p = g.attributes.position, rr = rng(seed), ph = [rr() * 6, rr() * 6, rr() * 6, rr() * 6];
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      let sc = 1 - 0.3 * y * y * (0.6 + 0.4 * Math.sin(ph[0] + y * 2));
      const top = clamp((y - 0.8) / 0.2, 0, 1); sc *= 1 - 0.5 * top * top;
      const yy = y - 0.09 * top * top * Math.hypot(x, z) * 2;
      const n1 = 0.1 * Math.sin(x * 7 + ph[1] + y * 3) + 0.07 * Math.sin(z * 9 + ph[2] + y * 5) + 0.05 * Math.sin((x + z) * 13 + ph[3]);
      x = x * sc * (1 + n1) + 0.14 * y * Math.sin(ph[1]) + 0.05 * Math.sin(y * 4 + ph[0]);
      z = z * sc * (1 - 0.7 * n1) + 0.1 * y * Math.sin(ph[2]);
      p.setXYZ(i, x * w, yy * h, z * d);
    }
    g.computeVertexNormals();
    return g;
  }
  function buildS7() {
    const grp = new THREE.Group();
    const h7 = (x, z) => 0.35 * Math.sin(x * 0.11 + 1) * Math.cos(z * 0.09) * sm((Math.hypot(x * 0.7, z * 0.5) - 12) / 10) - 14 * sm((-x - 24) / 10);
    const ground = heightMesh(-85, 85, -70, 70, 200, 160, h7, (x, y, z, c) => { c.set('#c9b26c').lerp(C('#a9b45e'), 0.5 + 0.5 * Math.sin(x * 0.2) * Math.sin(z * 0.17)); c.lerp(C('#9c8a58'), sm(-y / 8)); },
      lam('#ffffff', { vertexColors: true, map: noiseTex(71, 36, 30) }));
    grp.add(ground);
    const low = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400).rotateX(-Math.PI / 2), lam('#ffffff', { map: fieldTex(72, 40) })); low.position.y = -14; grp.add(low);
    envB(grp, '#b4c48a', -15, null, true);
    const H = [1.6, 2.1, 2.6, 3.3, 2.2, 2.9, 2.4, 1.8, 2.7, 2.0], Wd = [0.9, 1.0, 1.2, 1.2, 0.8, 1.1, 0.9, 0.7, 1.1, 0.8], Dp = [0.7, 0.9, 0.8, 1.0, 0.6, 0.9, 0.8, 0.6, 1.0, 0.7];
    const stones = [], puffs = [];
    const smat = lam('#d6c8a6', { map: noiseTex(73, 1, 1, { n: 9000 }) });
    H.forEach((h, k) => {
      const m = new THREE.Mesh(rockStone(100 + k * 17, Wd[k], h, Dp[k]), smat); const z = (k - 4.5) * 2.2;
      m.position.set(0.25 * Math.sin(k * 2.3), 0, z); m.rotation.set(0.02 * Math.sin(k * 3.1), 0.5 * Math.sin(k * 1.7), 0.03 * Math.cos(k * 2.2));
      m.castShadow = true; m.receiveShadow = true; grp.add(m); stones.push(m);
      const p = makePuff('#b99766'); p.position.set(m.position.x, 0.3, z); grp.add(p); puffs.push(p);
    });
    const basinM = ashMat('#e6d8b8', 3, 0.8);
    for (const [x, z, sx, sz] of [[4.5, 0.6, 3.4, 0.5], [4.5, 3.4, 3.4, 0.5], [2.9, 2.0, 0.5, 3.3], [6.1, 2.0, 0.5, 3.3]]) {
      const bm = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.85, sz), basinM); bm.position.set(x, 0.42, z); grp.add(shadowable(bm));
    }
    const bf = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 3.0), lam('#cdbd98')); bf.position.set(4.5, 0.15, 2.0); grp.add(shadowable(bf));
    const bw = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 2.6), new THREE.MeshPhongMaterial({ color: '#4aa0d8', emissive: '#0b3050', shininess: 80 })); bw.position.set(4.5, 0.5, 2.0); grp.add(bw);
    /* surveyor pole, exactly as tall as the tallest stone */
    const pole = new THREE.Group(), seg = H[3] / 3;
    ['#d6301e', '#ffffff', '#d6301e'].forEach((c, i) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, seg, 14), lam(c)); s.position.y = seg * (i + 0.5); pole.add(s); });
    const pz = (3 - 4.5) * 2.2; pole.position.set(1.7, -H[3], pz); grp.add(shadowable(pole));
    /* grass, rocks, bushes */
    const dryPal = ['#c9b77a', '#b5a45a', '#d9c98a', '#9fae5e'];
    grp.add(tufts(700, 74, rr => { const a = (-45 + rr() * 90) * Math.PI / 180, R = 21 + rr() * 3.6; return [R * Math.cos(a), 0, R * Math.sin(a)]; }, dryPal, 0.35, 0.85));
    grp.add(tufts(900, 75, rr => { const x = -18 + rr() * 36, z = -26 + rr() * 52; if (Math.abs(x) < 1.4 && Math.abs(z) < 16) return null; return [x, 0, z]; }, dryPal, 0.4, 1.1));
    grp.add(rocks(45, 76, rr => { const a = (-60 + rr() * 120) * Math.PI / 180, R = 12 + rr() * 12; return [R * Math.cos(a), 0, R * Math.sin(a)]; }, '#cdbd98', 0.2, 0.7));
    grp.add(rocks(3, 77, rr => { const a = (-8 + rr() * 16) * Math.PI / 180, R = 22 + rr() * 1.5; return [R * Math.cos(a), 0, R * Math.sin(a)]; }, '#cdbd98', 0.5, 0.8));
    grp.add(bushes(10, 78, rr => { const a = (-60 + rr() * 120) * Math.PI / 180, R = 17 + rr() * 8; return [R * Math.cos(a), 0, R * Math.sin(a)]; }, '#8a9f5a', 0.5, 1.0));
    const upd = (t, lt) => {
      const az = (-20 + 40 * sm(lt / 6)) * Math.PI / 180, cr = sm((lt - 6) / 2), R = 15 - 2 * cr, y = 0.6 + 2.4 * cr;
      cam.position.set(R * Math.cos(az), y, R * Math.sin(az)); cam.lookAt(0, 1.5 + 0.3 * cr, 0);
      stones.forEach((m, k) => {
        const u = cl01((lt - (0.5 + 0.3 * k)) / 0.9); m.position.y = -H[k] * (1 - easeOutBack(u)) * 1.0 - (u <= 0 ? 0.5 : 0);
        puffs[k].userData.setU(cl01((lt - (0.5 + 0.3 * k)) / 1.2));
      });
      const up = cl01((lt - 4.5) / 0.9); pole.position.y = -H[3] * (1 - easeO3(up)) - 0.0; pole.visible = up > 0;
    };
    return { grp, upd, sun: { t: [0, 0, 0], ext: 40, off: [90, 30, 50] } };
  }

  /* ================= s8 dan_camp ================= */
  function buildS8() {
    const grp = new THREE.Group();
    const hill = (x, z, cx, cz, H, R, F) => { const d = Math.hypot(x - cx, z - cz); return H * sm(clamp((R - d) / (R - F), 0, 1)); };
    const h8 = (x, z) => {
      let y = 3.5 * sm((-z - 28) / 35) + 0.25 * Math.sin(x * 0.2) * Math.cos(z * 0.17);
      y = Math.max(y, hill(x, z, -32, -60, 15, 22, 9), hill(x, z, 32, -60, 15, 22, 9));
      return y + 22 * sm((-z - 100) / 50) * (0.7 + 0.3 * Math.sin(x * 0.07));
    };
    const STRAW = C('#c9a24a'), GR = C('#9cb15e'), OCH = C('#a99a5a'), RK = C('#b9a47a');
    const ground = heightMesh(-130, 130, -160, 50, 220, 190, h8, (x, y, z, c) => {
      c.copy(GR); const f = sm((60 - Math.abs(x)) / 8) * sm((z + 46) / 6) * sm((26 - z) / 6);
      c.lerp(STRAW, f); c.lerp(OCH, sm((y - 3) / 5) * 0.8); c.lerp(RK, sm((y - 12) / 4) * 0.5);
    }, lam('#ffffff', { vertexColors: true, map: noiseTex(81, 40, 30) }));
    grp.add(ground);
    envB(grp, '#a9a85e', -0.5);
    /* towns on the two hills */
    for (const s of [-1, 1]) { const c = makeCity({ W: 9.5, D: 6.5, wallH: 2.0, towerH: 3.6, houses: 10, seed: 40 + s, color: '#e2d2ac', midTowers: false }); c.position.set(s * 32, 15, -60); grp.add(c); }
    /* camp: tents, fire */
    const CZ = -58, CY = h8(0, CZ);
    const tents = [], tm = lam('#efe2c0', { map: noiseTex(82, 1, 1) });
    for (let k = 0; k < 7; k++) {
      const a = k * Math.PI * 2 / 7 + 0.3, x = 6.3 * Math.cos(a), z = CZ + 6.3 * Math.sin(a), g = new THREE.Group();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.1, 3.6, 18), tm); cone.position.y = 1.8; g.add(cone);
      const slit = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.7), BASIC('#241810')); slit.position.set(0, 0.85, 1.55 - 0.0); slit.rotation.x = -0.0; g.add(slit);
      g.position.set(x, h8(x, z), z); g.rotation.y = Math.atan2(-x, -(z - CZ)) + Math.PI; tents.push({ g, t0: 2.0 + 0.28 * k }); grp.add(shadowable(g));
    }
    const fire = new THREE.Group(); fire.position.set(0, CY, CZ);
    for (let k = 0; k < 3; k++) { const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.5, 6).rotateZ(Math.PI / 2), lam('#4a3220')); lg.rotation.y = k * 1.05; lg.position.y = 0.15; fire.add(lg); }
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, st = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 0), lam('#9a9488')); st.position.set(0.95 * Math.cos(a), 0.15, 0.95 * Math.sin(a)); fire.add(st); }
    const fl = [0, 1, 2].map(k => { const f = new THREE.Mesh(new THREE.ConeGeometry(0.34 - k * 0.07, 1.3 - k * 0.2, 8), BASIC(['#ff8a1c', '#ffc23a', '#fff0b0'][k])); f.position.y = 0.75 - k * 0.1; fire.add(f); return f; });
    const fLight = new THREE.PointLight('#ff9a40', 60, 24, 1.6); fLight.position.y = 1.5; fire.add(fLight); grp.add(fire);
    /* wheat: near dense set and far set */
    const wx = 0.86, wz = -0.51, axis = new THREE.Vector3(wz, 0, -wx).normalize(), Q = new THREE.Quaternion(), D = new THREE.Object3D();
    const stalkMat = lam('#ffffff'), pal = ['#d9a520', '#c9962a', '#e0b84a', '#c2a24a'].map(C);
    function wheatSet(n, seed, x0, x1, z0, z1, hmin, hmax, thick) {
      const rr = rng(seed), bx = new Float32Array(n), bz = new Float32Array(n), by = new Float32Array(n), hh = new Float32Array(n), ph = new Float32Array(n);
      for (let i = 0; i < n; i++) { bx[i] = x0 + rr() * (x1 - x0); bz[i] = z0 + rr() * (z1 - z0); by[i] = h8(bx[i], bz[i]); hh[i] = hmin + rr() * (hmax - hmin); ph[i] = rr() * 6.28; }
      const sg = new THREE.CylinderGeometry(0.012 * thick, 0.02 * thick, 1, 3).translate(0, 0.5, 0);
      const eg = new THREE.IcosahedronGeometry(0.05 * thick, 0).scale(1, 3.2, 1);
      const sm1 = new THREE.InstancedMesh(sg, stalkMat, n), em = new THREE.InstancedMesh(eg, stalkMat, n); sm1.frustumCulled = em.frustumCulled = false;
      const col = new THREE.Color();
      for (let i = 0; i < n; i++) { col.copy(pal[i % 4]).multiplyScalar(0.85 + 0.3 * ((i * 7) % 10) / 10); sm1.setColorAt(i, col); em.setColorAt(i, col); }
      const gusts = [[5.0, 0.62], [6.6, 0.5]];
      return {
        meshes: [sm1, em],
        update(lt) {
          for (let i = 0; i < n; i++) {
            const x = bx[i], z = bz[i], proj = x * wx + z * wz;
            let th = 0.07 * Math.sin(lt * 1.7 + ph[i] + proj * 0.12);
            for (const g of gusts) { const dd = proj - (-45 + 30 * (lt - g[0])); th += g[1] * Math.exp(-(dd * dd) / 72) * (0.8 + 0.2 * Math.sin(ph[i])); }
            Q.setFromAxisAngle(axis, th); const s = Math.sin(th), c = Math.cos(th);
            D.position.set(x, by[i], z); D.quaternion.copy(Q); D.scale.set(1, hh[i], 1); D.updateMatrix(); sm1.setMatrixAt(i, D.matrix);
            const hq = hh[i] + 0.1 * thick;
            D.position.set(x + wx * s * hq, by[i] + c * hq, z + wz * s * hq); D.scale.set(1, 1, 1); D.updateMatrix(); em.setMatrixAt(i, D.matrix);
          }
          sm1.instanceMatrix.needsUpdate = true; em.instanceMatrix.needsUpdate = true;
        }
      };
    }
    const near = wheatSet(9000, 83, -15, 15, -10, 17, 0.7, 1.3, 1), far = wheatSet(8000, 84, -58, 58, -46, -10, 1.0, 1.5, 2.6);
    near.meshes.concat(far.meshes).forEach(m => grp.add(m));
    grp.add(tufts(200, 85, rr => { const x = -40 + rr() * 80, z = 18 + rr() * 10; return [x, h8(x, z), z]; }, ['#a9b45e', '#c8b56a'], 0.4, 0.9));
    const KEYS = [[0, [-3, 0.85, 9], [0, 1.15, -20]], [3.0, [-1, 1.0, -2], [0, 1.5, -30]], [7.0, [0, 15, 14], [0, 5, -58]], [10, [0, 12.5, 3], [0, 5.5, -58]]];
    const upd = (t, lt) => {
      const c = track(lt, KEYS); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
      near.update(lt); far.update(lt);
      tents.forEach(tt => { const u = cl01((lt - tt.t0) / 0.5); tt.g.scale.setScalar(Math.max(0.001, easeOutBack(u))); tt.g.visible = u > 0; });
      const f = 1 + 0.12 * Math.sin(lt * 11) + 0.08 * Math.sin(lt * 23);
      fl.forEach((m, k) => m.scale.set(1, f * (1 + 0.1 * Math.sin(lt * 14 + k * 2)), 1)); fLight.intensity = 60 * f;
    };
    return { grp, upd, sun: { t: [0, 0, -20], ext: 110 } };
  }

  /* ================= s9 forest_clearing ================= */
  function buildS9() {
    const grp = new THREE.Group(), r = rng(91);
    const ground = heightMesh(-70, 70, -70, 70, 160, 160, (x, z) => 0.12 * Math.sin(x * 0.3) * Math.cos(z * 0.27) + 0.05 * Math.sin(x * 1.3 + z * 0.9),
      (x, y, z, c) => { c.set('#7d5c36').lerp(C('#946c3e'), 0.5 + 0.5 * Math.sin(x * 0.5) * Math.sin(z * 0.45)); c.lerp(C('#5e4528'), sm((Math.hypot(x, z) - 14) / 20)); },
      lam('#ffffff', { vertexColors: true, map: noiseTex(92, 40, 40, { n: 9000 }) }));
    grp.add(ground);
    envB(grp, '#3d4f2c', -0.4, ['#3e5a3a', '#6a8a72', '#a8bfb8']);
    /* pines: instanced trunk + 4 foliage layers */
    const S = [-3.2, 0], RC = [3.6, 1.0], pines = [];
    [78, 88, 104, 146].forEach((az, i) => { const a = az * Math.PI / 180, R = [9.3, 9.0, 9.4, 9.1][i]; pines.push({ x: R * Math.cos(a), z: R * Math.sin(a), h: 11 + r() * 2 }); });
    for (let tries = 0; pines.length < 48 && tries < 600; tries++) {
      const a = r() * Math.PI * 2, R = 10 + r() * 22, x = R * Math.cos(a), z = R * Math.sin(a), small = r() < 0.3;
      if (Math.hypot(x - S[0], z - S[1]) < 4 || Math.hypot(x - RC[0], z - RC[1]) < 5.5) continue;
      if (z > 4 && z < 12 && Math.abs(x) < 9) continue;
      if (R < 12.6 && a > 0.9 && a < 2.4) continue;
      pines.push({ x, z, h: small ? 5 + r() * 3 : 10 + r() * 5 });
    }
    const N = pines.length, gcol = [C('#2f6b3a'), C('#27582f'), C('#356f3c')];
    grp.add(inst(new THREE.CylinderGeometry(1, 1.35, 1, 8).translate(0, 0.5, 0), lam('#ffffff', { map: noiseTex(93, 1, 4) }), N, (i, d, col) => { const p = pines[i], rad = 0.02 * p.h + 0.07; d.position.set(p.x, 0, p.z); d.scale.set(rad, p.h * 0.95, rad); return col.set('#6a4a2e').multiplyScalar(0.8 + 0.3 * hash(i, 2)); }));
    for (let j = 0; j < 4; j++) {
      grp.add(inst(new THREE.ConeGeometry(1, 1, 10).translate(0, 0.5, 0), lam('#ffffff', { map: noiseTex(94 + j, 1, 1) }), N, (i, d, col) => {
        const p = pines[i], R0 = 0.17 * p.h * (1 - 0.22 * j); d.position.set(p.x, p.h * (0.2 + 0.17 * j), p.z); d.rotation.y = i + j; d.scale.set(R0, 0.32 * p.h, R0); return col.copy(gcol[(i + j) % 3]).multiplyScalar(0.85 + 0.3 * hash(i, j));
      }));
    }
    /* warm sun patches on the ground */
    [[-1.5, 2.5, 3.0], [3.5, -3.5, 2.4], [-7, -3, 2.6], [7, 5, 2.2], [0.5, -9, 2.8], [-4, 6.5, 2.0]].forEach(([x, z, rd], i) => { const sp = new THREE.Mesh(new THREE.CircleGeometry(rd, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffe9a8', transparent: true, opacity: 0.2, depthWrite: false })); sp.scale.set(1.3, 1, 0.8 + 0.2 * (i % 2)); sp.position.set(x, 0.05 + i * 0.002, z); grp.add(sp); });
    /* saj: stone ring, convex iron dome, fire, bread, smoke */
    const saj = new THREE.Group(); saj.position.set(S[0], 0, S[1]); grp.add(saj);
    saj.add(rocks(10, 95, rr => { const k = Math.floor(rr() * 1000), a = (k % 10) * Math.PI / 5; return [1.25 * Math.cos(a), 0, 1.25 * Math.sin(a)]; }, '#9a9488', 0.3, 0.45));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2), phong('#3a3a40', { shininess: 50, specular: '#888899' })); dome.scale.set(1.5, 0.5, 1.5); dome.position.y = 0.6; saj.add(shadowable(dome));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.05, 8, 40).rotateX(Math.PI / 2), phong('#2a2a30')); rim.position.y = 0.6; saj.add(rim);
    const breads = [[0.55, 0.4], [-0.6, 0.3], [0.1, -0.65], [-0.45, -0.5]].map(([x, z], i) => {
      const rr2 = Math.hypot(x, z), y = 0.6 + 0.5 * Math.sqrt(Math.max(0, 1 - (rr2 / 1.5) * (rr2 / 1.5))) + 0.03;
      const nrm = new THREE.Vector3(x / (1.5 * 1.5), (y - 0.6) / (0.5 * 0.5), z / (1.5 * 1.5)).normalize();
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 24), lam('#e0b872', { map: noiseTex(96 + i, 1, 1, { dk: 'rgba(120,70,20,0.35)', n: 700 }) }));
      b.position.set(x, y, z); b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nrm); b.castShadow = true; saj.add(b); return { b, y, t0: 1.0 + 0.55 * i };
    });
    const fire = new THREE.Group(); fire.position.y = 0.1; saj.add(fire);
    const fl = [0, 1].map(k => { const f = new THREE.Mesh(new THREE.ConeGeometry(0.3 - 0.1 * k, 0.5 - 0.1 * k, 7), BASIC(['#ff8a1c', '#ffd060'][k])); f.position.y = 0.2; fire.add(f); return f; });
    const fLight = new THREE.PointLight('#ff8a30', 5, 6, 1.5); fLight.position.set(0, 0.4, 1.0); saj.add(fLight);
    const smoke = [0, 1, 2, 3, 4, 5].map(k => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshLambertMaterial({ color: '#e8e8e8', transparent: true, opacity: 0, depthWrite: false })); saj.add(m); return { m, ph: k / 6 }; });
    /* picnic tables */
    const tw = lam('#9a6a38', { map: woodTex(97, 1, 1) });
    [[-0.5, -6.4, 0.2], [8.2, -2.4, 1.2]].forEach(([x, z, ry]) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.9), tw); top.position.y = 0.78; g.add(top);
      for (const s of [-1, 1]) { const bn = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.07, 0.3), tw); bn.position.set(0, 0.46, s * 0.72); g.add(bn); for (const e of [-1, 1]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), tw); lg.position.set(e * 0.95, 0.4, s * 0.3); lg.rotation.x = s * 0.2; g.add(lg); } }
      grp.add(shadowable(g));
    });
    /* rope ring */
    const rc = document.createElement('canvas'); rc.width = 64; rc.height = 64; const rg = rc.getContext('2d');
    rg.fillStyle = '#c4a068'; rg.fillRect(0, 0, 64, 64); rg.strokeStyle = '#7a5a30'; rg.lineWidth = 6;
    for (let k = -2; k < 5; k++) { rg.beginPath(); rg.moveTo(k * 16, 0); rg.lineTo(k * 16 + 40, 64); rg.stroke(); }
    const rt = new THREE.CanvasTexture(rc); rt.wrapS = rt.wrapT = THREE.RepeatWrapping; rt.repeat.set(60, 1);
    const ropeMat = lam('#ffffff', { map: rt }); let rope = new THREE.Mesh(new THREE.BufferGeometry(), ropeMat); rope.castShadow = true; rope.position.set(RC[0], 0, RC[1]); grp.add(rope);
    function ropeGeo(lt) {
      const pts = [], Rr = 3, lift = sm((lt - 4.0) / 1.3), taut = sm((lt - 5.0) / 1.5), br = 1 + 0.03 * Math.sin((lt - 6.5) * 2 * Math.PI / 2.4) * sm((lt - 6.3) / 0.6);
      for (let i = 0; i < 72; i++) {
        const a = i / 72 * Math.PI * 2, slack = Rr * (1 + 0.2 * Math.sin(2 * a + 1) + 0.13 * Math.sin(3 * a + 0.4) + 0.07 * Math.sin(5 * a));
        const rad = (slack + (Rr * br - slack) * taut) * (1 + 0.05 * lift);
        const y = 0.09 + 0.81 * lift + (1 - taut) * 0.18 * lift * Math.sin(3 * a + 1) + 0.04 * Math.cos(a - 1) * taut * Math.sin((lt - 6.5) * 2.6) * sm((lt - 6.3) / 0.6);
        pts.push(new THREE.Vector3(rad * Math.cos(a) + (1 - taut) * 0.45 * Math.sin(3 * a), y, rad * Math.sin(a) + (1 - taut) * 0.45 * Math.cos(2 * a)));
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.085, 8, true);
    }
    grp.add(tufts(260, 98, rr => { const a = rr() * 6.28, R = 4 + rr() * 22; return [R * Math.cos(a), 0, R * Math.sin(a)]; }, ['#6a7a3a', '#8a7a4a', '#5a6a32'], 0.25, 0.6));
    grp.add(rocks(30, 99, rr => { const a = rr() * 6.28, R = 6 + rr() * 22; return [R * Math.cos(a), 0, R * Math.sin(a)]; }, '#8a8478', 0.2, 0.55));
    const upd = (t, lt) => {
      const az = (125 - 57 * sm(lt / 8)) * Math.PI / 180, R = 10.8, tg = lerp3([S[0], 0.95, S[1]], [RC[0], 0.95, RC[1]], sm((lt - 2.5) / 4.5));
      cam.position.set(R * Math.cos(az), 1.2 + 0.4 * sm(lt / 8), R * Math.sin(az)); cam.lookAt(tg[0], tg[1], tg[2]);
      breads.forEach(({ b, t0 }, i) => { const u = cl01((lt - t0) / 0.45); b.scale.setScalar(Math.max(0.001, easeOutBack(u))); b.visible = u > 0; });
      const f = 1 + 0.12 * Math.sin(lt * 10) + 0.07 * Math.sin(lt * 21); fl.forEach(m => m.scale.set(1, f, 1)); fLight.intensity = 5 * f;
      smoke.forEach(({ m, ph }) => { const u = ((lt * 0.25 + ph) % 1); m.position.set(0.3 * Math.sin(u * 5 + ph * 9), 1.3 + u * 3.2, 0.3 * Math.cos(u * 4 + ph * 7)); m.scale.setScalar(0.25 + 0.7 * u); m.material.opacity = 0.35 * Math.sin(Math.PI * Math.min(1, u * 1.05)) * (1 - 0.4 * u); });
      rope.geometry.dispose(); rope.geometry = ropeGeo(lt);
    };
    rope.geometry = ropeGeo(0);
    return { grp, upd, sun: { t: [0, 0, 0], ext: 30 } };
  }

  return { S6: buildS6(), S7: buildS7(), S8: buildS8(), S9: buildS9() };
}
