/* shots_a - art pass for gezer_trip film_a shots s0, s1, s2, s4, s5. No people, no animals, no text. ASCII only.
   Every update is a pure function of lt (local time). */
import * as THREE from 'three';
import { sm, lerp3, easeOutBack, makeHills, makeClouds, makeOlive } from './gz_kit.js';
import { heightMesh, ribbon, sampleWP, pathAt, makePuff, makeBus, makeCloudCluster, track, rng, shadowable } from './gz_kit2.js';
import { lam, phong, clamp, noiseTex, woodTex, waveTex, ashMat, inst, tufts, rocks, bushes, makePalm, merlons,
         makeCity, farGround, makeCart2 } from './gz_kit3.js';

const cl01 = u => Math.max(0, Math.min(1, u));
const C = c => new THREE.Color(c);
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const BASIC = c => new THREE.MeshBasicMaterial({ color: c });

function envSet(grp, farColor, farY) {
  grp.add(farGround(farColor, farY));
  grp.add(makeHills(lam('#9db483'), lam('#b2c6b4'), lam('#d0dde0')));
  grp.add(makeClouds(new THREE.MeshBasicMaterial({ color: '#ffffff' })));
}

export function makeShots(cam) {
  const NOISE = {};
  const nz = (k, s, rx, ry, o) => (NOISE[k] = NOISE[k] || noiseTex(s, rx, ry, o));

  /* ================= s0 map_journey: relief model on a wooden table ================= */
  function buildS0() {
    const grp = new THREE.Group();
    const coast = z => -13.5 + 2.2 * Math.sin(z * 0.22) + 1.2 * Math.sin(z * 0.55 + 1);
    const h0 = (x, z) => {
      const d = x - coast(z);
      let y;
      if (d < 0) y = -0.9 * sm(-d / 6);
      else {
        const e = sm((x - 4) / 32);
        const ridge = Math.pow(Math.abs(Math.sin((x * 0.9 - z * 0.35) * 0.5)), 1.4) * sm((x - 2) / 12);
        y = 0.15 * sm(d / 1.5) + 0.35 * sm(d / 5) + 4.0 * e + 1.1 * ridge * e +
            0.3 * Math.sin(x * 0.5 + z * 0.3) * Math.sin(z * 0.45) * sm((x - 4) / 10);
      }
      return y * (1 - 0.72 * sm((Math.abs(x) - 33) / 7));
    };
    const fp = ['#9cc56a', '#86b257', '#b9c46f', '#c9b27a', '#6f9d4a', '#a8c870'].map(C);
    const SAND = C('#e6d6a2'), DEEP = C('#255f93'), SHAL = C('#7fd3f4'), B1 = C('#a98a5a'), B2 = C('#85633e'), B3 = C('#c0a272');
    const colS0 = (x, y, z, c) => {
      const d = x - coast(z);
      if (d < 0) { c.copy(DEEP).lerp(SHAL, sm(1 - (-d) / 6.5)); return; }
      c.copy(fp[Math.floor(hash(Math.floor(x / 2.6), Math.floor(z / 2.6)) * fp.length)]);
      c.lerp(SAND, 1 - sm(d / 1.7));
      c.lerp(B1, sm((x - 1) / 13) * 0.75).lerp(B2, sm((y - 2.3) / 1.8) * 0.8);
      const rg = Math.pow(Math.abs(Math.sin((x * 0.9 - z * 0.35) * 0.5)), 1.4);
      c.lerp(B3, rg * sm((x - 4) / 10) * 0.45);
    };
    const mapMat = lam('#ffffff', { vertexColors: true, map: nz('map', 5, 38, 28) });
    const land = heightMesh(-40, 40, -30, 30, 240, 180, h0, colS0, mapMat); land.castShadow = true; grp.add(land);
    const waves = new THREE.Mesh(new THREE.PlaneGeometry(80, 60).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: waveTex(3, 10, 8), transparent: true, depthWrite: false, opacity: 0.8 }));
    waves.position.y = 0.04; grp.add(waves);
    /* table, frame, slab */
    const tw = lam('#6b4020', { map: woodTex(2, 10, 7) });
    const top = new THREE.Mesh(new THREE.PlaneGeometry(150, 104).rotateX(-Math.PI / 2), tw); top.position.y = -1.5; top.receiveShadow = true; grp.add(top);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(150, 3, 104), lam('#3a2412', { map: woodTex(4, 6, 1) })); edge.position.y = -3.05; grp.add(edge);
    const dark = lam('#4a2c18', { map: woodTex(6, 3, 1) });
    for (const [x, z, sx, sz] of [[0, 30.9, 83.6, 1.8], [0, -30.9, 83.6, 1.8], [40.9, 0, 1.8, 60], [-40.9, 0, 1.8, 60]]) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(sx, 3.1, sz), dark); f.position.set(x, 0.05, z); f.castShadow = true; f.receiveShadow = true; grp.add(f);
    }
    const slab = new THREE.Mesh(new THREE.BoxGeometry(80, 0.5, 60), lam('#2c1d12')); slab.position.y = -1.25; grp.add(slab);
    /* pencil and brass compass on the table (foreground layer) */
    const pen = new THREE.Group();
    const pb = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 15, 6).rotateZ(Math.PI / 2), phong('#e8a41c')); pen.add(pb);
    const pt = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 6).rotateZ(-Math.PI / 2), lam('#d9b98a')); pt.position.x = 8.3; pen.add(pt);
    const pg = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 6).rotateZ(-Math.PI / 2), lam('#2a2a2a')); pg.position.x = 9.3; pen.add(pg);
    const er = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.0, 6).rotateZ(Math.PI / 2), lam('#d97a8a')); er.position.x = -8.0; pen.add(er);
    pen.position.set(47, -0.95, -8); pen.rotation.y = 1.25; grp.add(shadowable(pen));
    const comp = new THREE.Group();
    const cr = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.7, 28), phong('#c9a24a', { shininess: 80 })); comp.add(cr);
    const cf = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.74, 28), lam('#f2ead2')); cf.position.y = 0.02; comp.add(cf);
    const cn = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 4.6), lam('#b02a1c')); cn.position.y = 0.42; cn.rotation.y = 0.5; comp.add(cn);
    comp.position.set(-48, -1.15, -14); grp.add(shadowable(comp));
    /* pins, villages, trees, walled city */
    const pinMesh = color => {
      const g = new THREE.Group();
      const nd = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.3, 6), phong('#d0d0d0', { shininess: 90 })); nd.position.y = 1.65; g.add(nd);
      const bl = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 14), phong(color, { shininess: 80, specular: '#ffffff' })); bl.position.y = 3.3; g.add(bl);
      g.userData.pop = u => { g.scale.setScalar(Math.max(0.001, easeOutBack(u))); g.position.y = g.userData.y0 + (1 - cl01(u)) * 2.2; g.visible = u > 0; };
      return shadowable(g);
    };
    const pins = [[[6, -8], '#0f3d7a', 0.8], [[-10, 4], '#e0401e', 4.5], [[-10.7, 4.3], '#e0401e', 4.8], [[9, -3], '#1fa05a', 8.0]].map(([p, m, tp]) => {
      const pin = pinMesh(m); pin.userData.y0 = h0(p[0], p[1]) + 0.1; pin.position.set(p[0], pin.userData.y0, p[1]);
      if (m === '#e0401e' && p[0] < -10.5) pin.scale.setScalar(0.7);
      grp.add(pin); return { pin, tp, small: p[0] < -10.5 };
    });
    for (const [vx, vz] of [[-3, 9], [15, -13], [27, 8]]) {
      const r = rng(Math.floor(vx * 7 + vz));
      grp.add(inst(new THREE.BoxGeometry(1, 1, 1), lam('#f6f0e0'), 8, (i, d) => {
        const s = 0.5 + r() * 0.35; d.scale.set(s, s * 0.9, s * 1.1);
        const x = vx + (r() - 0.5) * 3.4, z = vz + (r() - 0.5) * 3.0; d.position.set(x, h0(x, z) + s * 0.45, z); d.rotation.y = r() * 1.2;
      }));
    }
    const rt = rng(31), cents = [[-6, -6], [-3, 12], [2, 15], [12, 6], [16, -10], [26, 12], [30, -14], [20, -8], [6, 20]];
    grp.add(inst(new THREE.ConeGeometry(0.42, 1.2, 6), lam('#ffffff'), 150, (i, d, col) => {
      const q = cents[Math.floor(rt() * cents.length)], x = q[0] + (rt() - 0.5) * 6, z = q[1] + (rt() - 0.5) * 5, y = h0(x, z);
      if (y < 0.15) return false;
      d.position.set(x, y + 0.5, z); const s = 0.7 + rt() * 0.6; d.scale.set(s, s, s);
      return col.set(rt() < 0.5 ? '#3f7a34' : '#58903c').multiplyScalar(0.85 + rt() * 0.3);
    }));
    const cx = 22, cz = -2, cy = h0(cx, cz);
    const bs = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.8, 3.2), lam('#a98a5a')); bs.position.set(cx, cy - 0.15, cz); grp.add(shadowable(bs));
    const city = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 12, seed: 5, midTowers: true, scale: 0.3 });
    city.position.set(cx, cy + 0.22, cz); grp.add(city);
    /* routes: white edge + coloured core, thin and slightly raised */
    const wp1 = [[6, -8], [1, -5.5], [-4, -1], [-7.5, 2.8], [-10, 4]], wp2 = [[-10, 4], [-2, 2.2], [4, 0.4], [9, -3]];
    const mk = (wps, mat) => {
      const pts = sampleWP(wps, 60, h0, 0.2), edgeR = ribbon(sampleWP(wps, 60, h0, 0.13), 1.15, lam('#ffffff')), core = ribbon(pts, 0.7, mat);
      grp.add(edgeR, core); return { pts, set: u => { edgeR.userData.setU(u); core.userData.setU(u); } };
    };
    const R1 = mk(wp1, lam('#d6451e', { emissive: '#3a0c00' })), R2 = mk(wp2, lam('#2e9d5f', { emissive: '#04210f' }));
    const bus = new THREE.Group();
    const yb = phong('#ffd21c', { shininess: 70 }), nb = lam('#0b2a4a'), kb = lam('#222222');
    const bb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.95, 1.1), yb); bb.position.y = 0.85; bus.add(bb);
    const bw = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.34, 1.14), nb); bw.position.set(-0.1, 1.05, 0); bus.add(bw);
    const bf = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.9), nb); bf.position.set(1.1, 1.05, 0); bus.add(bf);
    for (const [x, z] of [[0.7, 0.55], [0.7, -0.55], [-0.7, 0.55], [-0.7, -0.55]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 12).rotateX(Math.PI / 2), kb); w.position.set(x, 0.3, z); bus.add(w); }
    shadowable(bus); bus.scale.setScalar(0.9); grp.add(bus);
    const cc = [makeCloudCluster(new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.9 }), 0.4),
                makeCloudCluster(new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.9 }), 0.32)];
    cc.forEach(c => grp.add(c));
    const KEYS = [[0, [0, 65, 46], [0, 0, 0]], [5.0, [-2, 19.6, 11.8], [-2, 0, -2]], [5.6, [-2.4, 19.6, 11.8], [-2.4, 0, -2]],
                  [8.6, [3, 22, 13.5], [1, 0, -2]], [10, [4, 24, 14.5], [0.5, 0, -1]]];
    const upd = (t, lt) => {
      const c = track(lt, KEYS); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
      R1.set(lt < 1.5 ? 0 : sm((lt - 1.5) / 3)); R2.set(lt < 6 ? 0 : sm((lt - 6) / 2));
      let pts, uu;
      if (lt < 4.5) { pts = R1.pts; uu = lt < 1.5 ? 0 : sm((lt - 1.5) / 3); }
      else if (lt < 6) { pts = R1.pts; uu = 1; }
      else { pts = R2.pts; uu = lt < 8 ? sm((lt - 6) / 2) : 1; }
      const bp = pathAt(pts, uu), ah = pathAt(pts, Math.min(1, uu + 0.015)), be = pathAt(pts, Math.max(0, uu - 0.015));
      bus.position.set(bp[0], bp[1] - 0.12, bp[2]); bus.rotation.y = Math.atan2(-(ah[2] - be[2]), ah[0] - be[0]);
      pins.forEach(({ pin, tp, small }) => { pin.userData.pop(cl01((lt - tp) / 0.6)); if (small && lt >= tp) pin.scale.multiplyScalar(0.7); });
      cc[0].position.set(-30 + lt * 1.2, 15, 20); cc[1].position.set(30 - lt * 0.8, 17, 24);
    };
    return { grp, upd, sun: { t: [0, 0, 0], ext: 62 } };
  }

  /* ================= s1 key_road ================= */
  function buildS1() {
    const grp = new THREE.Group();
    const TEL = { x: -5, z: 0 }, MT = { x: 30, z: 0 };
    const h1 = (x, z) => {
      let y = 0.35 + 0.2 * Math.sin(x * 0.13 + 1) * Math.cos(z * 0.09);
      y += 12 * sm((-z - 20) / 40) * (0.7 + 0.3 * Math.sin(x * 0.09 + 1));
      const sea = sm((-23 - x) / 5); y = y * (1 - sea) - 0.9 * sea;
      const r = Math.hypot(x - TEL.x, z - TEL.z);
      if (r < 14) {
        const s = clamp((14 - r) / 6.2, 0, 1), s3 = s * 3, k = Math.floor(Math.min(s3, 2.999)), f = s3 - k;
        y = Math.max(y, 6.5 * (k + sm(clamp((f - 0.65) / 0.35, 0, 1))) / 3);
      }
      const m = Math.hypot((x - MT.x) * 0.9, z - MT.z);
      if (m < 28) {
        const s = clamp((28 - m) / 16, 0, 1);
        y = Math.max(y, 18 * Math.pow(sm(s), 1.15) * (1 + 0.06 * Math.sin(x * 0.8) * Math.sin(z * 0.7) * (1 - sm((s - 0.8) / 0.2))));
      }
      const m2 = Math.hypot((x - 52) * 0.9, z + 10);
      if (m2 < 22) y = Math.max(y, 12 * Math.pow(sm(clamp((22 - m2) / 14, 0, 1)), 1.1));
      return y;
    };
    const fp = ['#9cc56a', '#86b257', '#c8c47a', '#b99a66', '#6f9d4a', '#a6c46c'].map(C);
    const DEEP = C('#2a6a9e'), SHAL = C('#7fd3f4'), SAND = C('#e6d6a2'), TELC = C('#c9ae7e'), TELG = C('#a9b36a'), ROCK = C('#bba883'), HILG = C('#8fa862');
    const col1 = (x, y, z, c) => {
      if (y < 0.0) { c.copy(DEEP).lerp(SHAL, sm((y + 0.75) / 0.6)); return; }
      c.copy(fp[Math.floor(hash(Math.floor(x / 3.5), Math.floor(z / 4)) * fp.length)]);
      c.lerp(SAND, 1 - sm((x + 23) / 2.5));
      const r = Math.hypot(x - TEL.x, z - TEL.z);
      if (r < 15) { c.lerp(TELC, sm((y - 0.5) / 0.9)); c.lerp(TELG, 0.3 * hash(Math.floor(x * 1.3), Math.floor(z * 1.3)) * sm((y - 0.5) / 0.9)); }
      c.lerp(ROCK, sm((y - 1.8) / 6) * (r < 15 ? 0 : 1));
      c.lerp(HILG, sm((-z - 20) / 18) * 0.7);
    };
    const mat = lam('#ffffff', { vertexColors: true, map: nz('t1', 8, 46, 36) });
    const terr = heightMesh(-70, 70, -70, 40, 280, 220, h1, col1, mat); terr.castShadow = true; grp.add(terr);
    const waves = new THREE.Mesh(new THREE.PlaneGeometry(70, 110).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: waveTex(7, 8, 14), transparent: true, depthWrite: false, opacity: 0.85 }));
    waves.position.set(-35, 0.05, -15); grp.add(waves);
    const deep = new THREE.Mesh(new THREE.PlaneGeometry(700, 600).rotateX(-Math.PI / 2), lam('#2a6a9e')); deep.position.set(-420, -0.95, -20); grp.add(deep);
    envSet(grp, '#9bb86a', -1.6);
    /* jetty and boat */
    const wood = lam('#8a5f34', { map: woodTex(3, 2, 1) });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(18, 0.35, 2.4), wood); deck.position.set(-33, 0.85, 14); grp.add(shadowable(deck));
    for (let x = -25; x >= -41; x -= 2.8) for (const z of [12.9, 15.1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 2.7, 6), wood); p.position.set(x, -0.45, z); grp.add(shadowable(p)); }
    const boat = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI), lam('#9a4a2a', { side: THREE.DoubleSide, map: woodTex(5, 2, 1) }));
    hull.scale.set(2.1, 0.6, 0.75); boat.add(hull);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 1.1), wood); seat.position.y = -0.05; boat.add(seat);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 24).rotateX(Math.PI / 2), lam('#e9dcc0')); rim.scale.set(2.1, 1, 0.75); boat.add(rim);
    boat.position.set(-31, 0.12, 11.6); grp.add(shadowable(boat));
    /* road, ramp, markers */
    const wps = [[-26, 14.5], [-14, 14.5], [-5, 14.5], [6, 14.2], [14, 13], [20, 11], [26, 10], [30, 8]];
    const road = ribbon(sampleWP(wps, 90, h1, 0.28), 1.8, lam('#ecdfc2')); road.userData.setU(1); grp.add(road);
    const ramp = ribbon(sampleWP([[-5, 14.2], [-5, 5.6]], 50, h1, 0.2), 2.2, lam('#dccaa0')); ramp.userData.setU(1); grp.add(ramp);
    grp.add(inst(new THREE.BoxGeometry(0.4, 0.8, 0.4), lam('#f3ead2'), 11, (i, d) => { const x = -22 + i * 5.5, z = 13.4; d.position.set(x, h1(x, z) + 0.4, z); d.rotation.y = i; }));
    /* tel city, key, mountain city */
    const city = makeCity({ W: 11, D: 7.5, wallH: 1.9, towerH: 3.4, houses: 15, seed: 3 }); city.position.set(-5, 6.5, 0); grp.add(city);
    const mcity = makeCity({ W: 16, D: 11, wallH: 2.6, towerH: 4.6, houses: 26, seed: 7, midTowers: true, color: '#e0d1ad' }); mcity.position.set(30, 18, 0); grp.add(mcity);
    const gold = phong('#ffd24a', { specular: '#fff4c0', shininess: 90, emissive: '#3a2805' });
    const keyIn = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 10, 24), gold); ring.position.x = -1.2; keyIn.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.07, 8, 16), gold); ring2.position.x = -1.2; keyIn.add(ring2);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 0.22), gold); shaft.position.x = 0.2; keyIn.add(shaft);
    for (const x of [1.0, 1.5]) { const tt = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 0.22), gold); tt.position.set(x, -0.3, 0); keyIn.add(tt); }
    keyIn.rotation.z = -0.3; keyIn.scale.setScalar(1.25); shadowable(keyIn);
    const key = new THREE.Group(); key.add(keyIn); grp.add(key);
    /* life: palms, olives, bushes, rocks, tufts */
    [[-21, 20, 6, 1], [-19, 23, 5, 2], [-15, 19, 6.5, 3], [-9, 24, 5.5, 4], [3, 19, 6, 5], [9, 21, 5, 6], [-24, 11, 6, 7]].forEach(([x, z, h, s]) => {
      const p = makePalm(h, s); p.position.set(x, h1(x, z), z); grp.add(p);
    });
    [[8, 20], [-13, 7], [14, 24]].forEach(([x, z]) => { const o = makeOlive(lam('#6e5a40'), lam('#8a9f78')); o.position.set(x, h1(x, z), z); o.scale.setScalar(1.1); grp.add(o); });
    const fgPlace = (xa, xb, za, zb) => r => { const x = xa + r() * (xb - xa), z = za + r() * (zb - za); return [x, h1(x, z), z]; };
    grp.add(bushes(46, 11, fgPlace(-36, 30, 16, 20), '#5f8a3c', 0.5, 1.1), rocks(70, 12, fgPlace(-36, 30, 15.5, 22), '#c9bb9a', 0.25, 0.7),
            tufts(520, 13, fgPlace(-36, 34, 15, 23), ['#c8b56a', '#b9a65a', '#8fae5c'], 0.4, 0.9));
    grp.add(tufts(300, 14, r => { const x = -2 + r() * 60, z = 3 + r() * 12; return [x, h1(x, z), z]; }, ['#c8b56a', '#a0b25e'], 0.3, 0.7));
    grp.add(rocks(60, 15, r => { const x = 4 + r() * 24, z = -8 + r() * 14; return [x, h1(x, z), z]; }, '#b9a888', 0.4, 1.2));
    const cw = lam('#9a6a38', { map: woodTex(9, 1, 1) }), cd = lam('#4a3220');
    const carts = [0, 1, 2].map(() => { const c = makeCart2(cw, cd); grp.add(c); return c; });
    const KEYS = [[0, [-34, 2.1, 19.5], [-12, 3.2, 8]], [4.0, [-9, 11.5, 30], [-5, 8.6, 0]], [7.0, [-6.5, 12, 27.5], [-5, 8.8, 0]], [10, [22, 14, 31], [30, 19, 2]]];
    const upd = (t, lt) => {
      const c = track(lt, KEYS); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
      carts.forEach((cart, k) => {
        const x = -22 + k * 9 + lt * 1.0, z = [14.2, 14.9, 14.4][k];
        cart.position.set(x, h1(x, z) + 0.28, z);
        cart.userData.wheels.forEach(w => { w.rotation.z = -(x + 22) / cart.userData.R; });
      });
      key.visible = lt >= 4.2;
      const du = sm((lt - 4.2) / 1.2);
      key.position.set(-5, 19 + (13.7 - 19) * du, 5.2);
      key.rotation.y = 2 * Math.PI * sm((lt - 5.4) / 1.6);
      boat.position.y = 0.12 + 0.05 * Math.sin(lt * 1.7); boat.rotation.z = 0.04 * Math.sin(lt * 1.3);
    };
    return { grp, upd, sun: { t: [0, 0, 5], ext: 78 } };
  }

  /* ================= s2 time_road ================= */
  function buildS2() {
    const grp = new THREE.Group();
    const h2 = (x, z) => { const d = Math.max(Math.abs(z) - 22, -30 - x, x - 56, 0); return -18 * sm(d / 9); };
    const dry = C('#cdbb85'), dry2 = C('#b9a56c'), slope = C('#a08c5a');
    const col2 = (x, y, z, c) => { c.copy(dry).lerp(dry2, hash(Math.floor(x / 2), Math.floor(z / 2)) * 0.5); c.lerp(slope, sm(-y / 5)); };
    const ground = heightMesh(-50, 76, -40, 40, 190, 100, h2, col2, lam('#ffffff', { vertexColors: true, map: nz('t2', 11, 30, 18) })); grp.add(ground);
    /* lowland with field patchwork */
    const fc = document.createElement('canvas'); fc.width = fc.height = 256; const fg = fc.getContext('2d'), fr = rng(77);
    const pal = ['#a9c46d', '#8fb35e', '#c4c47a', '#b99a66', '#7ba24c', '#d0bf86'];
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { fg.fillStyle = pal[Math.floor(fr() * pal.length)]; fg.fillRect(i * 32, j * 32, 32, 32); fg.strokeStyle = 'rgba(80,70,40,0.25)'; fg.strokeRect(i * 32, j * 32, 32, 32); }
    const ft = new THREE.CanvasTexture(fc); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(30, 30);
    const low = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200).rotateX(-Math.PI / 2), lam('#ffffff', { map: ft })); low.position.y = -18; grp.add(low);
    envSet(grp, '#b4c48a', -19);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(64, 3.2).rotateX(-Math.PI / 2), ashMat('#d9ccae', 64, 3.2)); path.position.set(15, 0.04, 0); path.receiveShadow = true; grp.add(path);
    const xs = [0, 9, 18, 27], TOP = 1.31;
    xs.forEach(x => {
      const g = new THREE.Group();
      const step = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.22, 2.4), ashMat('#e2d4b2', 3, 0.22)); step.position.y = 0.11;
      const blk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.95, 1.9), ashMat('#e9dcc0', 2.6, 0.95)); blk.position.y = 0.695;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 2.1), lam('#efe3c8', { map: nz('cap', 21, 1, 1) })); cap.position.y = 1.24;
      const lip = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.06, 2.02), lam('#cdbd98')); lip.position.y = 1.15;
      g.add(step, blk, lip, cap); g.position.x = x; grp.add(shadowable(g));
    });
    /* ruins, columns, grass, rocks */
    const r = rng(11), wallM = ashMat('#d6c6a2', 4, 1.4);
    for (const [z, hm] of [[-8, 2.2], [-15, 1.5], [-24, 1.0]]) for (let x = -24; x < 56; x += 4.4) {
      if (r() < 0.2) continue;
      const h = 0.6 + r() * hm, w = new THREE.Mesh(new THREE.BoxGeometry(4.2, h, 1.0 + (z < -10 ? 0.4 : 0)), wallM); w.position.set(x + r(), h / 2, z + r() * 0.8); grp.add(shadowable(w));
      if (r() < 0.6) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.9 + r(), 0.35, 0.8), wallM); s.position.set(x + r() * 3 - 1.5, h + 0.17, z + r() * 0.6); s.rotation.y = r(); grp.add(shadowable(s)); }
    }
    for (const [cx, cz, nd] of [[4, -6, 3], [21, -6.5, 2], [33, -7, 3], [-12, -9, 2]]) {
      for (let k = 0; k < nd; k++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.85, 14), ashMat('#e2d4b2', 3, 0.85)); d.position.set(cx + k * 0.04, 0.43 + k * 0.85, cz); d.rotation.y = k; grp.add(shadowable(d)); }
    }
    const td = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.0, 14).rotateZ(Math.PI / 2), ashMat('#e2d4b2', 3, 0.85)); td.position.set(14, 0.48, -5.2); td.rotation.y = 0.5; grp.add(shadowable(td));
    const dryPal = ['#c9b77a', '#b5a45a', '#d9c98a', '#9fae5e'];
    grp.add(tufts(260, 21, rr => { const x = -22 + rr() * 76, z = (rr() < 0.5 ? -1 : 1) * (2.4 + rr() * 17); if (z > 2 && z < 3.4) return null; return [x, 0, z]; }, dryPal, 0.5, 1.2));
    grp.add(rocks(60, 22, rr => [-22 + rr() * 76, 0, (rr() < 0.5 ? -1 : 1) * (2.3 + rr() * 14)], '#cdbd98', 0.2, 0.6));
    grp.add(tufts(110, 23, rr => [-8 + rr() * 44, 0, 3.4 + rr() * 3.5], dryPal, 0.4, 0.9));
    /* P1 shield + spear */
    const bronze = phong('#b8894a', { shininess: 55, specular: '#e8c890', map: nz('br', 31, 2, 2) }), bronzeD = phong('#8a6430', { shininess: 40 });
    const objs = [];
    { const g = new THREE.Group(), sh = new THREE.Group();
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.14, 40).rotateX(Math.PI / 2), bronze); sh.add(disc);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.07, 8, 40), bronzeD); rim.position.z = 0.04; sh.add(rim);
      for (const R of [0.62, 0.42]) { const t = new THREE.Mesh(new THREE.TorusGeometry(R, 0.03, 6, 32), bronzeD); t.position.z = 0.08; sh.add(t); }
      const boss = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 12), bronze); boss.scale.z = 0.6; boss.position.z = 0.1; sh.add(boss);
      const bring = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.03, 6, 20), bronzeD); bring.position.z = 0.1; sh.add(bring);
      sh.position.y = 0.95; sh.rotation.x = -0.1; g.add(sh);
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 3.2, 8), lam('#7a5a36')); sp.position.set(1.15, 1.5, 0.25); sp.rotation.z = -0.22; g.add(sp);
      const hd = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.6, 4), bronze); hd.scale.z = 0.3; hd.position.set(1.57, 3.35, 0.25); hd.rotation.z = -0.22; g.add(hd);
      const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 8), bronzeD); fer.position.set(1.5, 3.02, 0.25); fer.rotation.z = -0.22; g.add(fer);
      objs.push({ g, sw: 0.35 }); }
    /* P2 crown */
    { const g = new THREE.Group(), gold = phong('#ffd24a', { specular: '#fff4c0', shininess: 90, emissive: '#2a1c04' }), cr = new THREE.Group();
      const cu = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.68, 0.14, 24), lam('#7a1620')); cu.position.y = 0.07; g.add(cu);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.6, 0.5, 40, 1, true), phong('#ffd24a', { specular: '#fff4c0', shininess: 90, emissive: '#2a1c04', side: THREE.DoubleSide })); band.position.y = 0.4; cr.add(band);
      for (const [y, R] of [[0.16, 0.6], [0.66, 0.72]]) { const t = new THREE.Mesh(new THREE.TorusGeometry(R, 0.05, 8, 40).rotateX(Math.PI / 2), gold); t.position.y = y; cr.add(t); }
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4, cn = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.55, 6), gold); cn.position.set(0.72 * Math.cos(a), 0.93, 0.72 * Math.sin(a)); cr.add(cn);
        const bl = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), gold); bl.position.set(0.72 * Math.cos(a), 1.23, 0.72 * Math.sin(a)); cr.add(bl);
        const gm = new THREE.Mesh(new THREE.IcosahedronGeometry(0.085, 0), phong(['#d4202a', '#2a5ad0', '#1fa05a'][k % 3], { shininess: 100, emissive: '#200000' }));
        gm.position.set(0.7 * Math.cos(a + 0.39), 0.42, 0.7 * Math.sin(a + 0.39)); cr.add(gm);
      }
      cr.position.y = 0.14; cr.scale.setScalar(1.35); g.add(cr); objs.push({ g, sw: 'spin' }); }
    /* P3 six-chamber gate */
    { const g = new THREE.Group(), ls = '#e6d8b8';
      const bx = (x, y, z, sx, sy, sz, m) => { const q = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m || ashMat(ls, Math.max(sx, sz), sy)); q.position.set(x, y, z); g.add(q); return q; };
      bx(0, 0.06, 0, 3.4, 0.12, 2.7, lam('#d0c09c', { map: nz('gb', 41, 2, 2) }));
      for (const s of [-1, 1]) {
        bx(s * 1.55, 0.4, 0, 0.14, 0.55, 2.4);
        for (const z of [-0.4, 0.4]) bx(s * 0.95, 0.4, z, 1.15, 0.55, 0.12);
        for (const z of [-1.2, 1.2]) bx(s * 0.95, 0.4, z, 1.2, 0.55, 0.14);
        for (const z of [-1.2, -0.4, 0.4]) bx(s * 0.38, 0.72, z, 0.32, 1.3, 0.32);
        for (const z of [-0.8, 0, 0.8]) bx(s * 1.35, 0.25, z, 0.3, 0.14, 0.7, lam('#cdbd98'));
        bx(s * 0.78, 0.98, 1.45, 1.05, 1.85, 1.05);
        bx(s * 0.78, 1.97, 1.45, 1.22, 0.12, 1.22, lam('#cdbd98'));
        for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bx(s * 0.78 + dx * 0.5, 2.11, 1.45 + dz * 0.5, 0.2, 0.17, 0.2, lam('#d8caa6'));
        bx(s * 0.78, 0.85, 1.985, 0.14, 0.5, 0.06, BASIC('#1a120c'));
      }
      bx(0, 0.125, 0, 0.14, 0.02, 2.4, BASIC('#3a2a1c'));
      objs.push({ g, sw: 0.3, scale: 0.95 }); }
    /* P4 clay jug + stone lamp with flame */
    let flame, flameIn, flameLight;
    { const g = new THREE.Group(), clay = lam('#b5673a', { map: nz('cl', 51, 1, 1) });
      const prof = [[0.01, 0], [0.3, 0.04], [0.43, 0.3], [0.39, 0.62], [0.21, 0.88], [0.17, 1.0], [0.27, 1.08], [0.26, 1.13]].map(([x, y]) => new THREE.Vector2(x, y));
      const jug = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), clay); jug.scale.setScalar(1.15); jug.position.x = -0.55; g.add(jug);
      for (const s of [-1, 1]) { const hdl = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 16, Math.PI), clay); hdl.position.set(-0.55 + s * 0.33 * 1.15, 0.78, 0); hdl.rotation.z = -s * Math.PI / 2; g.add(hdl); }
      const lp = [[0.01, 0], [0.34, 0.02], [0.42, 0.1], [0.34, 0.22], [0.12, 0.25]].map(([x, y]) => new THREE.Vector2(x, y));
      const lamp = new THREE.Mesh(new THREE.LatheGeometry(lp, 24), lam('#dccfae', { map: nz('lp', 52, 1, 1) })); lamp.position.set(0.85, 0.0, 0); g.add(lamp);
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.34, 10).rotateZ(-Math.PI / 2), lam('#dccfae')); spout.position.set(1.27, 0.2, 0); g.add(spout);
      flame = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), BASIC('#ffb830')); flame.position.set(1.46, 0.36, 0); g.add(flame);
      flameIn = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), BASIC('#fff2c0')); flameIn.position.set(1.46, 0.33, 0); g.add(flameIn);
      flameLight = new THREE.PointLight('#ffb050', 1.4, 4, 1.5); flameLight.position.set(1.46, 0.5, 0.3); g.add(flameLight);
      objs.push({ g, sw: 0.25, off: -0.3 }); }
    const riseT = [1.5, 4.5, 7.5, 10.0], puffs = [];
    xs.forEach((x, i) => {
      const o = objs[i]; o.g.position.set(x + (o.off || 0), TOP - 1.4, 0); if (o.scale) o.g.scale.setScalar(o.scale); grp.add(shadowable(o.g));
      const ps = [[-0.7, 0.1, 0.9], [0.8, 0.05, 1.0], [0, 0.15, 1.15]].map(q => { const p = makePuff('#e6d3a0'); p.position.set(x + q[0], TOP + q[1], q[2]); p.scale.setScalar(0.6); grp.add(p); return p; });
      puffs.push(ps);
    });
    const S = (a, b) => [a, b];
    const KEYS = [[0, [-5, 2.6, 9], [0, 2.4, 0]], [1.2, [0.8, 2.8, 8.2], [0.2, 2.6, 0]], [3.0, [0.4, 2.8, 7.4], [0.2, 2.6, 0]],
                  [4.2, [9.7, 2.7, 5.5], [9, 2.45, 0]], [6.0, [9.4, 2.7, 5.1], [9, 2.45, 0]],
                  [7.2, [15.0, 3.0, 7.6], [18, 1.2, 0]], [9.0, [15.6, 3.1, 7.2], [18, 1.2, 0]],
                  [9.8, [26.6, 2.55, 4.4], [27, 2.35, 0]], [12, [26.8, 2.55, 4.0], [27, 2.35, 0]]];
    const upd = (t, lt) => {
      const c = track(lt, KEYS); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
      objs.forEach((o, i) => {
        const u = cl01((lt - riseT[i]) / 1.2), e = easeOutBack(u);
        o.g.position.y = TOP - 1.4 + 1.4 * e; o.g.visible = u > 0 || lt < 0;
        const ts = Math.max(0, lt - riseT[i]);
        o.g.rotation.y = o.sw === 'spin' ? ts * 0.7 : o.sw * Math.sin(ts * 0.9);
        puffs[i].forEach((p, k) => { p.userData.setU(cl01((lt - riseT[i] - k * 0.08) / 1.1)); p.scale.multiplyScalar(0.6); });
      });
      const fl = 1 + 0.07 * Math.sin(lt * 9) + 0.04 * Math.sin(lt * 17); flame.scale.set(1, 1.9 * fl, 1); flameIn.scale.set(1, 1.9 * fl, 1);
      flameLight.intensity = 1.4 * fl;
    };
    return { grp, upd, sun: { t: [14, 0, 0], ext: 56 } };
  }

  /* ================= s4 calendar_stone ================= */
  function buildS4() {
    const grp = new THREE.Group();
    const TX = -3.2, TZ = -0.5;
    const h4 = (x, z) => (0.1 * Math.sin(x * 0.5) * Math.cos(z * 0.4) + 0.06 * Math.sin(x * 1.7 + z * 1.3)) * sm((Math.hypot(x + 1, z - 1.5) - 6) / 4);
    const s1c = C('#cbab76'), s2c = C('#dcc794');
    const ground = heightMesh(-60, 60, -60, 40, 200, 160, h4, (x, y, z, c) => { c.copy(s1c).lerp(s2c, 0.5 + 0.5 * Math.sin(x * 0.4) * Math.sin(z * 0.35)); }, lam('#ffffff', { vertexColors: true, map: nz('s4g', 61, 34, 22) }));
    grp.add(ground);
    envSet(grp, '#b9a46a', -0.4);
    /* tel slope behind: terraced hill, pale with distance */
    [[34, 38, 3, 1.5, '#c9b387'], [28, 32, 3, 4.5, '#c2ab7e'], [21, 25, 3, 7.5, '#bda678']].forEach(([rt, rb, h, y, c]) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 40), lam(c, { map: nz('tl', 62, 8, 1) })); m.position.set(-5, y, -56); m.castShadow = true; grp.add(m);
    });
    const wr = rng(5);
    for (let i = 0; i < 7; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2 + wr(), 1.2), ashMat('#d6c6a2', 5, 1.5)); w.position.set(-16 + i * 6, 9.6, -52 + wr() * 3); grp.add(shadowable(w)); }
    /* tablet */
    const pts = [], N = 28;
    for (let k = 0; k < N; k++) {
      const a = k / N * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      let jag = 1 + 0.06 * Math.sin(k * 2.7) + 0.05 * Math.cos(k * 5.1) - (k % 6 === 2 ? 0.07 : 0);
      if (k >= 3 && k <= 5) jag *= 0.86;
      pts.push(new THREE.Vector2(1.7 * Math.sign(ca) * Math.pow(Math.abs(ca), 0.55) * jag, 2.2 * Math.sign(sa) * Math.pow(Math.abs(sa), 0.55) * jag));
    }
    const tabGeo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, steps: 1 }).translate(0, 0, -0.25);
    const tab = new THREE.Group();
    const tm = new THREE.Mesh(tabGeo, lam('#efe6cc', { map: noiseTex(9, 0.45, 0.45, { base: '#f4f0e6', n: 10000, blots: 22 }) })); tm.castShadow = true; tm.receiveShadow = true; tab.add(tm);
    const LEN = [1.8, 2.4, 1.5, 2.7, 1.1, 2.1, 1.7], grooves = [];
    const gd = BASIC('#2b2116'), gl = BASIC('#e8dcbc');
    LEN.forEach((len, k) => {
      const ns = Math.ceil(len / 0.25), y0 = 1.5 - k * 0.44, x0 = -1.35 + 0.12 * Math.sin(k * 2.2), segs = [];
      for (let j = 0; j < ns; j++) {
        const x = x0 + (j + 0.5) * 0.25, y = y0 + 0.03 * Math.sin(j * 1.3 + k) + 0.0;
        const d = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.075 + 0.02 * Math.sin(j * 2.1 + k), 0.05), gd); d.position.set(x, y, 0.31);
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.022, 0.03), gl); l.position.set(x, y - 0.058, 0.318);
        d.visible = l.visible = false; tab.add(d, l); segs.push([d, l]);
      }
      grooves.push(segs);
    });
    tab.position.set(TX, 0, TZ); tab.rotation.set(-0.06, 0.05, 0.04); grp.add(tab);
    const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10), lam('#cbab76', { map: nz('md', 63, 2, 1) })); mound.scale.set(2.5, 0.28, 1.1); mound.position.set(TX, 0.0, TZ + 0.1); mound.receiveShadow = true; grp.add(mound);
    /* tokens */
    const L = {
      leaf: lam('#5c9a3a'), leaf2: lam('#7cc84a'), leafD: lam('#3f7a2a'), olv: lam('#8fa06a'), olf: lam('#3d3a22'), purple: lam('#4a2350'),
      wheat: lam('#e0a820'), barley: lam('#c9a24a'), flax: lam('#7c8fa6'), stem: lam('#8a7a3a'), brown: lam('#6a4a28'), tie: lam('#5a3a1a')
    };
    const ell = (m, r, sx, sy, sz, x, y, z, rz) => { const q = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), m); q.scale.set(sx, sy, sz); q.position.set(x, y, z); if (rz) q.rotation.z = rz; return q; };
    const bundle = (g, stemM, earFn, n, spread) => {
      for (let j = 0; j < n; j++) {
        const pv = new THREE.Group(); pv.position.y = 0.4; pv.rotation.z = (j - (n - 1) / 2) * spread; pv.rotation.y = j * 0.8;
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 1.0, 5), stemM); st.position.y = 0.1; pv.add(st);
        const ear = earFn(j); ear.position.y = 0.66; pv.add(ear); g.add(pv);
      }
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.035, 6, 14).rotateX(Math.PI / 2), L.tie); tie.position.y = 0.4; g.add(tie);
    };
    const mkIcon = k => {
      const g = new THREE.Group();
      if (k === 0) {
        const cv = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.4, 0.05, 0), new THREE.Vector3(-0.1, 0.3, 0.02), new THREE.Vector3(0.2, 0.55, 0), new THREE.Vector3(0.42, 0.85, 0)]);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 12, 0.028, 5, false), L.brown));
        for (let j = 0; j < 8; j++) { const u = 0.12 + j * 0.11, p = cv.getPoint(u), s = j % 2 ? 1 : -1; const lf = ell(L.olv, 0.1, 2.3, 0.3, 0.9, p.x + s * 0.12, p.y + 0.04, p.z + 0.02, s * 0.5); g.add(lf); }
        for (const [x, y] of [[-0.02, 0.28], [0.22, 0.5], [0.12, 0.42]]) g.add(ell(L.olf, 0.075, 1, 1.2, 1, x, y - 0.08, 0.06));
      }
      if (k === 1) {
        g.add(ell(L.brown, 0.17, 1, 0.75, 0.8, 0, 0.12, 0)); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.55, 6), L.leaf2); st.position.y = 0.4; g.add(st);
        g.add(ell(L.leaf2, 0.15, 1.7, 0.3, 0.9, -0.2, 0.78, 0, 0.5), ell(L.leaf2, 0.15, 1.7, 0.3, 0.9, 0.2, 0.78, 0, -0.5));
      }
      if (k === 2) for (const [x, rz, h] of [[-0.12, 0.3, 0.8], [0.12, -0.3, 0.8], [0, 0, 1.0]]) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.13, h, 4), L.leaf); b.scale.z = 0.3; b.position.set(x, h / 2, 0); b.rotation.z = rz; g.add(b); }
      if (k === 3) bundle(g, L.flax, () => { const e = new THREE.Group(); const f = ell(lam('#6f8fd0'), 0.05, 1, 1, 1, 0, 0, 0); e.add(f); return e; }, 9, 0.1);
      if (k === 4) bundle(g, L.barley, () => { const e = new THREE.Group(); e.add(ell(L.barley, 0.05, 1, 3.2, 1, 0, 0.1, 0)); for (const a of [-0.3, 0, 0.3]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 3), lam('#d9bd6a')); h.position.set(a * 0.1, 0.32, 0); h.rotation.z = a; e.add(h); } return e; }, 9, 0.11);
      if (k === 5) bundle(g, L.wheat, j => { const e = new THREE.Group(); e.add(ell(L.wheat, 0.07, 1, 2.6, 0.9, 0, 0.1, 0)); e.add(ell(L.wheat, 0.05, 1, 2, 0.9, 0.06, 0.2, 0)); return e; }, 9, 0.16);
      if (k === 6) {
        for (let row = 0; row < 5; row++) for (let c = 0; c < 5 - row; c++) g.add(ell(L.purple, 0.095, 1, 1, 1, (c - (4 - row) / 2) * 0.19, 0.72 - row * 0.15, ((row + c) % 2 - 0.5) * 0.08));
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.24, 6), L.brown); st.position.y = 0.88; g.add(st);
        g.add(ell(L.leaf, 0.2, 1.4, 0.2, 1, 0.22, 0.95, 0, -0.4));
      }
      if (k === 7) {
        const pf = [[0.01, 0], [0.2, 0.04], [0.3, 0.22], [0.27, 0.42], [0.15, 0.6], [0.08, 0.74], [0.05, 0.82]].map(([x, y]) => new THREE.Vector2(x, y));
        g.add(new THREE.Mesh(new THREE.LatheGeometry(pf, 18), lam('#5a3050')));
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.14, 6), L.brown); st.position.y = 0.86; g.add(st);
        g.add(ell(L.leaf, 0.2, 1.4, 0.2, 1, 0.22, 0.8, 0, -0.5));
      }
      return shadowable(g);
    };
    const tokenStone = lam('#cbbea4', { map: nz('tok', 71, 1, 1) }), tokenRim = lam('#dcd0b8'), tokenIn = lam('#b3a68e');
    const tokens = [];
    for (let k = 0; k < 8; k++) {
      const x = -1.2 + 1.08 * k, z = 1.6 - 0.5 * Math.sin(Math.PI * k / 7);
      const tg = new THREE.Group(); tg.position.set(x, 0.1, z);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.63, 0.2, 32), tokenStone); tg.add(disc);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.05, 8, 32).rotateX(Math.PI / 2), tokenRim); rim.position.y = 0.1; tg.add(rim);
      const inn = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.02, 28), tokenIn); inn.position.y = 0.105; tg.add(inn);
      const icon = mkIcon(k); icon.position.y = 0.11; tg.add(icon);
      let gring = null;
      if (k === 1) { gring = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.06, 8, 32).rotateX(Math.PI / 2), phong('#ffd24a', { specular: '#fff4c0', shininess: 90, emissive: '#4a3305' })); gring.position.y = 0.1; gring.visible = false; tg.add(gring); }
      shadowable(tg); grp.add(tg);
      tokens.push({ g: tg, pop: 3.0 + 0.45 * (7 - k), ring: gring, lift: k === 1, y0: 0.1 });
    }
    const dust = [[-4.2, 0.3, 0.9], [-2.2, 0.3, 0.9], [-3.2, 0.4, 1.1]].map(v => { const p = makePuff('#d8c49a'); p.position.set(...v); p.userData.k = 0.55; grp.add(p); return p; });
    grp.add(rocks(70, 81, rr => { const x = -14 + rr() * 28, z = rr() < 0.6 ? -2 - rr() * 14 : 6 + rr() * 3; if (Math.abs(x - TX) < 3 && z > -3 && z < 2) return null; return [x, 0, z]; }, '#d9ccae', 0.2, 0.7));
    grp.add(rocks(8, 82, rr => { const a = rr() * 6.28; return [TX + Math.cos(a) * 2.6, 0, TZ + 0.6 + Math.sin(a) * 1.1]; }, '#d9ccae', 0.22, 0.45));
    const dryPal = ['#c9b77a', '#b5a45a', '#d9c98a'];
    grp.add(tufts(260, 83, rr => { const x = -14 + rr() * 28, z = rr() < 0.6 ? -1 - rr() * 14 : 5.5 + rr() * 4; if (Math.abs(x - TX) < 2.5 && z < 1 && z > -3) return null; return [x, 0, z]; }, dryPal, 0.5, 1.3));
    grp.add(tufts(160, 84, rr => [-12 + rr() * 24, 0, 7.5 + rr() * 2.5], dryPal, 0.6, 1.4));
    const TC = [TX, 1.8, TZ];
    const K2 = { p: [0.8, 6.4, 12.0], l: [0.2, 0.5, -0.2] }, K3 = { p: [0.9, 5.6, 12.6], l: [0.4, 1.0, 0.0] };
    const upd = (t, lt) => {
      if (lt < 4.5) {
        const a = (-12.5 + 25 * sm(lt / 4.5)) * Math.PI / 180;
        cam.position.set(TC[0] + 10 * Math.sin(a), 2.8, TC[2] + 10 * Math.cos(a)); cam.lookAt(TC[0], 1.7, TC[2]);
      } else {
        const a0 = 12.5 * Math.PI / 180, S0 = { p: [TC[0] + 10 * Math.sin(a0), 2.8, TC[2] + 10 * Math.cos(a0)], l: [TC[0], 1.7, TC[2]] };
        let p, l;
        if (lt < 7) { const u = sm((lt - 4.5) / 2.5); p = lerp3(S0.p, K2.p, u); l = lerp3(S0.l, K2.l, u); }
        else { const u = sm((lt - 7) / 2); p = lerp3(K2.p, K3.p, u); l = lerp3(K2.l, K3.l, u); }
        cam.position.set(p[0], p[1], p[2]); cam.lookAt(l[0], l[1], l[2]);
      }
      tab.position.y = -2.6 + 4.85 * easeOutBack(cl01(lt / 1.5));
      grooves.forEach((segs, k) => {
        const u = sm((lt - (1.5 + k * 0.36)) / 0.55), n = Math.floor(u * segs.length + 0.0001);
        segs.forEach(([d, l], j) => { d.visible = l.visible = j < n || (u >= 1); });
      });
      tokens.forEach(tk => {
        const u = cl01((lt - tk.pop) / 0.45);
        tk.g.scale.setScalar(Math.max(0.001, easeOutBack(u))); tk.g.visible = u > 0;
        if (tk.lift) { tk.g.position.y = tk.y0 + 0.3 * sm((lt - 7.0) / 0.5); if (tk.ring) tk.ring.visible = lt >= 7.0; }
      });
      dust.forEach((p, i) => { p.userData.setU(cl01((lt - 0.2 - i * 0.2) / 1.5)); p.scale.multiplyScalar(0.55); });
    };
    return { grp, upd, sun: { t: [0, 0, 0], ext: 40 } };
  }

  /* ================= s5 water_system ================= */
  function buildS5() {
    const grp = new THREE.Group();
    const ptop = x => { const P = [[-14, 6.4], [-11, 8.0], [-9, 8.8], [-1, 8.9], [6, 7.6], [14, 5]]; for (let i = 0; i < P.length - 1; i++) if (x <= P[i + 1][0]) return P[i][1] + (P[i + 1][1] - P[i][1]) * (x - P[i][0]) / (P[i + 1][0] - P[i][0]); return 5; };
    const prof = [[-14, 0], [14, 0], [14, 5], [6, 7.6], [-1, 8.9], [-9, 8.8], [-11, 8.0], [-14, 6.4]];
    const yF = x => 8.8 - 0.62 * (x + 8.6), X0 = -8.6, X1 = 1.4, TH = 2.3, CAVE = { x: 5.4, y: 2.3, rx: 4.4, ry: 1.9 };
    const base = new THREE.Mesh(new THREE.BoxGeometry(31, 0.8, 9), lam('#4a3a2a', { map: woodTex(12, 3, 1) })); base.position.y = -0.4; base.receiveShadow = true; grp.add(base);
    grp.add(farGround('#c0ab70', -0.9));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 200).rotateX(-Math.PI / 2), lam('#c9b77a', { map: nz('f5', 91, 60, 46) })); floor.position.y = -0.85; floor.receiveShadow = true; grp.add(floor);
    envSet(grp, '#b4a070', -0.95);
    const shape = new THREE.Shape(prof.map(([x, y]) => new THREE.Vector2(x, y)));
    const rockM = lam('#c7a871', { map: nz('blk', 92, 0.12, 0.12) }), darkM = lam('#3a2a1c');
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 4.4, bevelEnabled: false }).translate(0, 0, -3), rockM); back.castShadow = true; back.receiveShadow = true; grp.add(back);
    const shape2 = new THREE.Shape(prof.map(([x, y]) => new THREE.Vector2(x, y))), hole = new THREE.Path(); hole.absellipse(CAVE.x, CAVE.y, CAVE.rx, CAVE.ry, 0, Math.PI * 2, false); shape2.holes.push(hole);
    const front = new THREE.Mesh(new THREE.ExtrudeGeometry(shape2, { depth: 1.6, bevelEnabled: false, curveSegments: 48 }).translate(0, 0, 1.4), [rockM, darkM]); front.castShadow = true; front.receiveShadow = true; grp.add(front);
    const cback = new THREE.Mesh(new THREE.CircleGeometry(1, 48), lam('#2b1d12')); cback.scale.set(CAVE.rx, CAVE.ry, 1); cback.position.set(CAVE.x, CAVE.y, 1.43); cback.receiveShadow = true; grp.add(cback);
    /* cut face painted: strata, embedded stones, tunnel band, cave */
    const CW = 2048, CH = 700, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    const g2 = cv.getContext('2d'), cr = rng(17);
    const X = x => (x + 14) / 28 * CW, Y = y => (9.5 - y) / 9.5 * CH, PX = CW / 28;
    g2.beginPath(); prof.forEach(([x, y], i) => (i ? g2.lineTo(X(x), Y(y)) : g2.moveTo(X(x), Y(y)))); g2.closePath(); g2.clip();
    const bands = ['#c7a871', '#b08c55', '#d9bd8a', '#8f6f40', '#c2a06a', '#a88850', '#e0c9a0', '#7d6039', '#b99a62'];
    let yy = 9.6, bi = 0;
    while (yy > -0.2) {
      const th = 0.3 + cr() * 0.6;
      g2.fillStyle = bands[bi++ % bands.length]; g2.beginPath(); g2.moveTo(0, Y(yy));
      for (let x = 0; x <= CW; x += 24) g2.lineTo(x, Y(yy) + 6 * Math.sin(x * 0.012 + yy * 3) + 3 * Math.sin(x * 0.04 + bi));
      g2.lineTo(CW, CH + 5); g2.lineTo(0, CH + 5); g2.closePath(); g2.fill();
      g2.strokeStyle = 'rgba(55,35,18,0.5)'; g2.lineWidth = 2.5; g2.beginPath();
      for (let x = 0; x <= CW; x += 24) g2.lineTo(x, Y(yy) + 6 * Math.sin(x * 0.012 + yy * 3) + 3 * Math.sin(x * 0.04 + bi)); g2.stroke();
      yy -= th;
    }
    for (let i = 0; i < 70; i++) {
      const x = cr() * CW, y = cr() * CH, rx = 10 + cr() * 26, ry = 7 + cr() * 14, lg = cr() < 0.5;
      g2.fillStyle = lg ? 'rgba(236,222,190,0.85)' : 'rgba(110,86,52,0.8)'; g2.beginPath(); g2.ellipse(x, y, rx, ry, cr() * 3, 0, 6.3); g2.fill();
      g2.strokeStyle = 'rgba(50,32,16,0.55)'; g2.lineWidth = 2; g2.stroke();
    }
    for (let i = 0; i < 16000; i++) { g2.fillStyle = cr() < 0.5 ? 'rgba(60,40,20,0.16)' : 'rgba(255,245,220,0.16)'; g2.fillRect(cr() * CW, cr() * CH, 1 + cr() * 2, 1 + cr() * 2); }
    /* tunnel band + cave */
    g2.fillStyle = '#35241a'; g2.beginPath();
    g2.moveTo(X(X0), Y(yF(X0))); g2.lineTo(X(X1), Y(yF(X1))); g2.lineTo(X(X1), Y(yF(X1) + TH)); g2.lineTo(X(X0), Y(yF(X0) + TH)); g2.closePath(); g2.fill();
    g2.strokeStyle = '#e9dcc0'; g2.lineWidth = 7;
    g2.beginPath(); g2.moveTo(X(X0), Y(yF(X0) + TH)); g2.lineTo(X(X1), Y(yF(X1) + TH)); g2.stroke();
    g2.beginPath(); g2.moveTo(X(X0), Y(yF(X0))); g2.lineTo(X(X1), Y(yF(X1))); g2.stroke();
    g2.save(); g2.globalCompositeOperation = 'destination-out'; g2.beginPath(); g2.ellipse(X(CAVE.x), Y(CAVE.y), CAVE.rx * PX, CAVE.ry / 9.5 * CH, 0, 0, 6.3); g2.fill(); g2.restore();
    g2.strokeStyle = '#d9c9a0'; g2.lineWidth = 8; g2.beginPath(); g2.ellipse(X(CAVE.x), Y(CAVE.y), CAVE.rx * PX, CAVE.ry / 9.5 * CH, 0, 0, 6.3); g2.stroke();
    const face = new THREE.Mesh(new THREE.PlaneGeometry(28, 9.5), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(cv), alphaTest: 0.5 }));
    face.position.set(0, 4.75, 3.03); face.receiveShadow = true; grp.add(face);
    /* ceiling lip and stepped floor (40 treads) */
    const ang = Math.atan2(yF(X1) - yF(X0), X1 - X0), ln = Math.hypot(X1 - X0, yF(X1) - yF(X0));
    const lip = new THREE.Mesh(new THREE.BoxGeometry(ln + 0.4, 0.34, 1.3), ashMat('#d9c6a0', ln, 0.34));
    lip.position.set((X0 + X1) / 2, (yF(X0) + yF(X1)) / 2 + TH + 0.17, 3.68); lip.rotation.z = ang; grp.add(shadowable(lip));
    const dx = (X1 - X0) / 40, dy = (yF(X1) - yF(X0)) / 40, treadM = lam('#f3e6c6', { map: nz('tr', 93, 1, 1) }), riserM = lam('#a98f64');
    for (let i = 0; i < 40; i++) {
      const x = X0 + (i + 0.5) * dx, top = yF(X0) + i * dy + dy * 0.5, hh = Math.abs(dy) + 0.02;
      const bk = new THREE.Mesh(new THREE.BoxGeometry(dx, hh, 1.3), riserM); bk.position.set(x, top - hh / 2, 3.68); grp.add(shadowable(bk));
      const tr = new THREE.Mesh(new THREE.BoxGeometry(dx + 0.01, 0.045, 1.3), treadM); tr.position.set(x, top - 0.0225, 3.68); grp.add(shadowable(tr));
    }
    /* water volume, stalactites, ripple rings */
    const waterM = new THREE.MeshPhongMaterial({ color: '#3fa2e0', emissive: '#0b3a60', shininess: 90, specular: '#ffffff', transparent: true, opacity: 0.88 });
    const wsh = new THREE.Shape(), wa0 = Math.PI - Math.asin((1.0 - CAVE.y) / CAVE.ry), wa1 = 2 * Math.PI + Math.asin((1.0 - CAVE.y) / CAVE.ry);
    for (let k = 0; k <= 40; k++) { const a = wa0 + (wa1 - wa0) * k / 40, px = CAVE.x + (CAVE.rx - 0.03) * Math.cos(a), py = CAVE.y + (CAVE.ry - 0.03) * Math.sin(a); if (k) wsh.lineTo(px, py); else wsh.moveTo(px, py); }
    const water = new THREE.Mesh(new THREE.ExtrudeGeometry(wsh, { depth: 1.4, bevelEnabled: false }).translate(0, 0, 1.5), waterM); grp.add(water);
    const stal = [];
    for (let x = 2.3; x <= 8.5; x += 0.62) {
      const yt = CAVE.y + CAVE.ry * Math.sqrt(Math.max(0, 1 - Math.pow((x - CAVE.x) / CAVE.rx, 2))), h = 0.35 + 0.5 * hash(x, 3);
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.16 + 0.06 * hash(x, 5), h, 7).rotateX(Math.PI), lam('#8a7352', { map: nz('st', 94, 1, 1) })); c.position.set(x, yt - h / 2 + 0.05, 2.4);
      grp.add(shadowable(c));
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), lam('#6e5a3e')); b.scale.set(1, 0.5, 0.7); b.position.set(x + 0.3, yt - 0.02, 2.35); grp.add(b);
    }
    const ringGeo = new THREE.RingGeometry(0.85, 1.0, 40).rotateX(-Math.PI / 2);
    const mkRing = () => { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); m.position.y = 1.02; m.visible = false; grp.add(m); return m; };
    const dropX = [3.8, 5.4, 7.0], drops = dropX.map((x, k) => {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8).scale(1, 1.4, 1), waterM); d.visible = false; grp.add(d);
      return { d, rp: mkRing(), t0: 7.2 + 0.5 * k, x };
    });
    const amb = [0, 1, 2].map(() => mkRing());
    /* hilltop: city wall, tower, lined entrance, bushes, foreground */
    const stoneC = '#e6d8b8', mer = [];
    for (const xc of [-13, -11.2, -9.6, -2.4, 3.4, 5.4, 7.4, 9.4, 11.2]) {
      const yb = ptop(xc) - 0.5, w = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 1.2), ashMat(stoneC, 2, 1.8)); w.position.set(xc, yb + 0.9, 0); grp.add(shadowable(w));
      for (const o of [-0.6, 0.6]) mer.push([xc + o, yb + 2.0, 0, 0]);
    }
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.2, 2.4), ashMat(stoneC, 2.6, 4.2)); tower.position.set(1.4, ptop(1.4) - 0.4 + 2.1, 0); grp.add(shadowable(tower));
    const tcap = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 2.8), lam('#cdbd98')); tcap.position.set(1.4, ptop(1.4) + 3.9 + 0.1, 0); grp.add(shadowable(tcap));
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) mer.push([1.4 + a * 1.35, ptop(1.4) + 4.4, b * 1.25, 0]);
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 0.08), BASIC('#1a120c')); slit.position.set(1.4, ptop(1.4) + 2.4, 1.22); grp.add(slit);
    grp.add(merlons(mer.map(q => [q[0], q[1], q[2], 0]), lam('#d8caa6'), 0.55));
    for (const [x0, x1] of [[-9.3, -8.6], [-4.9, -4.2]]) {
      const j = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.9, 2.6), ashMat(stoneC, 2.6, 0.9)); j.position.set((x0 + x1) / 2, 8.85 + 0.35, 0); grp.add(shadowable(j));
    }
    const topPlace = (xa, xb) => r => { const x = xa + r() * (xb - xa); return [x, ptop(x), -2.4 + r() * 4.8]; };
    grp.add(bushes(16, 95, topPlace(-13.5, -9.6), '#5f8a3c', 0.3, 0.6), bushes(10, 96, topPlace(-4.2, 0), '#6f9a44', 0.25, 0.5),
            tufts(150, 97, topPlace(-13.5, 12), ['#c8b56a', '#a0b25e', '#8fae5c'], 0.3, 0.7));
    grp.add(rocks(18, 98, r => [-15 + r() * 30, -0.6, 5 + r() * 5], '#cdbd98', 0.3, 0.8), tufts(160, 99, r => [-15 + r() * 30, -0.6, 5.5 + r() * 5.5], ['#c8b56a', '#b5a45a', '#9fae5e'], 0.4, 0.9));
    /* lantern */
    const lantern = new THREE.Group();
    const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.36, 12), phong('#c9a24a', { shininess: 80 })); lb.position.y = 0.18; lantern.add(lb);
    const lt2 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.18, 12), phong('#a8822e')); lt2.position.y = 0.46; lantern.add(lt2);
    const lf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), BASIC('#ffcf5a')); lf.scale.y = 1.5; lf.position.y = 0.22; lantern.add(lf);
    const lamp = new THREE.PointLight('#ffb84d', 9, 9, 1.2); lamp.position.y = 0.4; lantern.add(lamp); grp.add(lantern);
    const lpos = lt => { const s = cl01((lt - 1.5) / 5.5), x = X0 + 0.4 + (X1 - X0 - 0.8) * s; return [x, yF(x) + 0.12, 3.68]; };
    const trackCam = lt => { const p = lpos(lt); return { p: [p[0] + 1.5, p[1] + 2.4, p[2] + 11.5], l: [p[0] + 1.5, p[1] - 0.1, p[2]] }; };
    const START = { p: [0, 6.2, 33], l: [0, 5.2, 0] }, MCU = { p: [CAVE.x, 4.6, 13.5], l: [CAVE.x, 1.8, 2.3] };
    const upd = (t, lt) => {
      let c;
      if (lt < 1.5) { const a = trackCam(1.5), u = sm(lt / 1.5); c = { p: lerp3(START.p, a.p, u), l: lerp3(START.l, a.l, u) }; }
      else if (lt < 7.0) c = trackCam(lt);
      else if (lt < 8.0) { const a = trackCam(7.0), u = sm(lt - 7.0); c = { p: lerp3(a.p, MCU.p, u), l: lerp3(a.l, MCU.l, u) }; }
      else c = MCU;
      cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
      const lp = lpos(lt); lantern.position.set(lp[0], lp[1], lp[2]); lantern.visible = lt < 7.4; lamp.intensity = lt < 7.4 ? 9 : 0;
      lf.scale.y = 1.5 * (1 + 0.06 * Math.sin(lt * 11));
      drops.forEach(dr => {
        const fall = cl01((lt - dr.t0) / 0.5);
        dr.d.visible = lt >= dr.t0 && lt < dr.t0 + 0.5; dr.d.position.set(dr.x, 3.7 + (1.1 - 3.7) * fall * fall, 2.3);
        const ru = cl01((lt - dr.t0 - 0.5) / 1.0);
        dr.rp.visible = ru > 0 && ru < 1; dr.rp.position.x = dr.x; dr.rp.position.z = 2.3; dr.rp.scale.setScalar(0.2 + 1.3 * ru); dr.rp.material.opacity = 0.85 * (1 - ru);
      });
      amb.forEach((m, k) => {
        const ph = (lt * 0.45 + k / 3) % 1; m.visible = lt > 6.5; m.position.set(3.2 + k * 2.1, 1.02, 2.3); m.scale.setScalar(0.15 + 0.7 * ph); m.material.opacity = 0.5 * (1 - ph);
      });
    };
    return { grp, upd, sun: { t: [0, 4, 0], ext: 30 } };
  }

  return { S0: buildS0(), S1: buildS1(), S2: buildS2(), S4: buildS4(), S5: buildS5() };
}
