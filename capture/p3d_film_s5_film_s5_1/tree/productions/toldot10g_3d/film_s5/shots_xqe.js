/* film_s5 shots x (field through the year), q (quiz 2: 365 dots -> 42), e (quiz: squill / almond / wagtail). ASCII only. */
import { THREE, K, cl, ramp, pop, sm, hash2, lam, phong, noiseTex, shadowable, BASIC, M, camTo, LD, LG, mixL, WOOD, DARK, hillGentle } from './s5_common.js';
import { landscape } from './s5_land.js';
import * as P from './s5_props.js';
import { piece } from '../kit10g.js';

export function shotX(cam) {
  const L = landscape({ seed: 13, hill: hillGentle, plaza: [0, 0, 50], trees: 40, clear: (x, z) => Math.abs(x) < 46 && z > -40 && z < 40, bushesN: 30 }); L.set(0.4);
  const grp = L.grp, gy = L.hfn(0, 0), FX = 6, FZ = 0, LEN = 34, NR = 11, DT = 0.3, T0 = 0.3, topY = gy + 0.5;
  grp.add(shadowable(M(new THREE.BoxGeometry(36, 0.5, 22), lam('#9c7a4e', { map: noiseTex(41, 4, 3) }), FX, gy + 0.25, FZ)));
  const rowZ = r => FZ - 10 + (r + 0.5) * 20 / NR, dirOf = r => (r % 2 ? -1 : 1), xs = r => FX - dirOf(r) * LEN / 2;
  const furrows = []; for (let r = 0; r < NR; r++) { const f = M(new THREE.BoxGeometry(LEN, 0.35, 0.9).translate(dirOf(r) * LEN / 2, 0, 0), lam('#4e3420', { map: noiseTex(42, 4, 1) }), xs(r), topY + 0.1, rowZ(r)); f.scale.x = 0.001; grp.add(f); furrows.push(f); }
  const plough = P.makePlough(); grp.add(plough);
  const NS = 28, seeds = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 6, 5), lam('#d9c08a'), NR * NS); seeds.frustumCulled = false; grp.add(seeds);
  const NH = 34, shoots = new THREE.InstancedMesh(new THREE.ConeGeometry(0.09, 1, 5).translate(0, 0.5, 0), lam('#ffffff'), NR * NH); shoots.frustumCulled = false; grp.add(shoots);
  const d = new THREE.Object3D(), cc = new THREE.Color(), GRN = new THREE.Color('#6fbf46'), GLD = new THREE.Color('#e0b030'), STB = new THREE.Color('#b89a50');
  const sheaves = []; for (let i = 0; i < 10; i++) { const s = P.makeSheaf(); s.position.set(FX - 15 + i * 3.3, topY, FZ + (i % 2 ? 3 : -3)); grp.add(s); sheaves.push(s); }
  const baskets = []; for (let i = 0; i < 4; i++) { const b = P.makeBasket(i + 2); b.position.set(FX - 17 + i * 3.1, topY, FZ - 14); grp.add(b); baskets.push(b); }
  const sacks = []; [[0, 0], [2, 0], [4, 0], [1, 1.8], [3, 1.8], [2, 3.6]].forEach(([dx, dy]) => { const s = P.makeSack(); s.position.set(FX + 10 + dx, topY + dy * 0.45, FZ - 14); grp.add(s); sacks.push(s); });
  const clouds = [[-12, 13, -24], [4, 14, -26], [20, 13, -22]].map(([x, y, z]) => { const c = K.makeCloud({ scale: 2.2 }); c.position.set(x, y, z); grp.add(c); return c; });
  const rain = K.makeRain(300, 1.0, 13, (tb, i, k) => ({ x: FX - 18 + hash2(i, k) * 36, y: 12, z: FZ - 11 + hash2(i * 3, k) * 22, p: 0.9 * ramp(tb, 3.4, 4.4) * (1 - ramp(tb, 7.4, 8.2)) }), () => topY); grp.add(rain);
  const W = P.makeWheel(7.5, 11); W.position.set(FX - 23, gy + 11, -2); W.rotation.x = -0.45; grp.add(W); for (let i = 0; i < 4; i++) W.userData.setArc(i, 1);
  const KEYS = [[0, [4, 34, 38], [4, 0, -2]], [15.07, [8, 32, 36], [5, 0, -3]]];
  const HAND = [[0, 180], [3.6, 220], [7.0, 360], [9.4, 400], [14.6, 540]];
  return { grp, hero: W, tgt: [FX, gy, FZ], ext: 60,
    upd(lt) {
      camTo(cam, lt, KEYS); W.userData.setHand(piece(HAND, lt), true);
      const r0 = cl(Math.floor((lt - T0) / DT), 0, NR - 1); const r = Math.max(0, Math.min(NR - 1, Math.floor((lt - T0) / DT)));
      furrows.forEach((f, i) => { f.scale.x = Math.max(0.001, cl((lt - (T0 + i * DT)) / DT)); });
      if (lt < 3.7) { const p = cl((lt - (T0 + r * DT)) / DT), zp = r > 0 ? rowZ(r - 1) : rowZ(0), z = zp + (rowZ(r) - zp) * sm(p / 0.25); plough.visible = true; plough.position.set(xs(r) + dirOf(r) * LEN * p, topY + 0.1, z); plough.rotation.y = dirOf(r) > 0 ? 0 : Math.PI; }
      else { const u = sm((lt - 3.7) / 0.8); plough.visible = lt < 4.6; plough.position.set(xs(NR - 1) + dirOf(NR - 1) * (LEN + 8 * u), topY + 0.1, rowZ(NR - 1)); plough.rotation.y = dirOf(NR - 1) > 0 ? 0 : Math.PI; }
      for (let rr = 0; rr < NR; rr++) for (let j = 0; j < NS; j++) {
        const ts = T0 + rr * DT + DT * (j + 0.5) / NS, u = cl((lt - ts) / 0.25), vis = lt > ts ? Math.max(0.001, 1 - ramp(lt, 4.8, 5.4)) : 0.0001;
        d.position.set(xs(rr) + dirOf(rr) * (j + 0.5) * LEN / NS, topY + 0.25 + 1.2 * (1 - sm(u)), rowZ(rr) + (hash2(rr, j) - 0.5) * 0.4); d.scale.setScalar(vis); d.rotation.set(0, 0, 0); d.updateMatrix(); seeds.setMatrixAt(rr * NS + j, d.matrix);
      }
      seeds.instanceMatrix.needsUpdate = true;
      for (let rr = 0; rr < NR; rr++) for (let j = 0; j < NH; j++) {
        const k = rr * NH + j, dl = hash2(rr, j + 3) * 0.8, g1 = ramp(lt, 4.2 + dl, 7.4 + dl), g2 = ramp(lt, 7.4, 9.2), hv = 1 - ramp(lt, 9.6 + dl * 0.5, 10.6 + dl * 0.5);
        const h = (0.9 * g1 + 0.7 * g2) * hv + 0.3 * (1 - hv) * g1;
        d.position.set(xs(rr) + dirOf(rr) * (j + 0.5) * LEN / NH, topY + 0.2, rowZ(rr) + (hash2(j, rr) - 0.5) * 0.5); d.scale.set(1, Math.max(0.0001, h), 1); d.rotation.set(0, 0, 0); d.updateMatrix(); shoots.setMatrixAt(k, d.matrix);
        cc.copy(GRN).lerp(GLD, g2).lerp(STB, 1 - hv); shoots.setColorAt(k, cc);
      }
      shoots.instanceMatrix.needsUpdate = true; shoots.instanceColor.needsUpdate = true;
      clouds.forEach((c, i) => { const u = (lt - (3.2 + 0.3 * i)) / 0.7; c.visible = u > 0 && lt < 9.6; c.scale.setScalar(2.2 * pop(u)); c.userData.setTone(0.8); c.userData.setOpacity(1 - ramp(lt, 8, 9.5)); });
      rain.userData.update(lt);
      sheaves.forEach((s, i) => { const u = (lt - (10.4 + 0.12 * i)) / 0.4; s.visible = u > 0; s.scale.setScalar(Math.max(0.001, pop(u))); });
      baskets.forEach((b, i) => { const u = (lt - (11.6 + 0.25 * i)) / 0.5; b.visible = u > 0; b.scale.setScalar(Math.max(0.001, pop(u))); });
      sacks.forEach((s, i) => { const u = (lt - (12.8 + 0.25 * i)) / 0.5; s.visible = u > 0; s.scale.setScalar(Math.max(0.001, pop(u))); });
    },
    light(lt) { return Object.assign(mixL(LD, LG, 0.45 * (ramp(lt, 3.3, 4.5) - ramp(lt, 7.8, 9.2))), { tgt: [FX, gy, FZ], ext: 60 }); },
    tipa(lt) { return { side: 1, xf: 0.76, size: 0.2, expr: lt < 3.6 ? 'curious' : lt < 9.4 ? 'happy' : 'cheering', arms: lt < 9.4 ? 'point' : 'up', hop: lt > 11.5 ? 0.4 : 0, show: cl((lt - 0.2) / 0.5) }; } };
}

export function shotQ(cam) {
  const L = landscape({ seed: 6, hill: hillGentle, plaza: [0, 0, 40], trees: 30, clear: (x, z) => Math.abs(x) < 34 && z > -14 && z < 70, walls: [[-38, -12, 0.2, 14]], bushesN: 40 }); L.set(0.25);
  const grp = L.grp, gy = L.hfn(0, 0);
  const B = P.makeDotBoard(); B.position.set(0, gy + 12.3, 0); grp.add(B);
  const glow = P.makeGlowDigits('42', 17, 9.3); glow.position.set(0, gy + 12.3, 2.7); grp.add(glow);
  const bb = B.userData.blueBox, ring = M(new THREE.TorusGeometry(1, 0.09, 10, 48), BASIC('#ffd24a'), bb.cx, gy + 12.3 + bb.cy, 1.5); ring.scale.set(bb.rx, bb.ry, 1); grp.add(ring);
  const KEYS = [[0, [0, 13, 58], [0, 18, 0]], [10.59, [0, 13.5, 55], [0, 18, 0]]];
  return { grp, hero: B, tgt: [0, gy, 0], ext: 70,
    upd(lt) {
      camTo(cam, lt, KEYS); B.scale.setScalar(Math.max(0.001, pop(lt / 0.8)));
      const answer = lt > 7.05, pulse = lt > 1.5 && lt < 7.4 ? lt : 0;
      B.userData.apply({ reveal: ramp(lt, 0.1, 1.4), blueU: k => (lt - (1.5 + 0.05 * k)) / 0.3, dropU: k => (lt - (1.6 + 0.05 * k)) / 0.3, gather: k => (lt - (7.05 + 0.03 * k)) / 0.9, pulse });
      const ru = (lt - 3.8) / 0.5; ring.visible = ru > 0 && lt < 7.8; ring.scale.set(bb.rx * pop(ru) * (1 + 0.05 * Math.sin(lt * (lt > 6.75 ? 12 : 4))), bb.ry * pop(ru) * (1 + 0.05 * Math.sin(lt * (lt > 6.75 ? 12 : 4))), 1);
      glow.userData.set(ramp(lt, 8.4, 9.4)); glow.scale.multiplyScalar(answer ? 1 : 1);
    },
    light() { return Object.assign({}, LD, { tgt: [0, gy, 0], ext: 70 }); },
    tipa(lt) { return { side: 1, xf: 0.76, size: 0.2, expr: lt < 3.8 ? 'neutral' : lt < 6.75 ? 'curious' : lt < 7.05 ? 'worried' : 'cheering', arms: lt < 7.05 ? 'down' : 'up', hop: lt > 7.05 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) }; } };
}

export function shotE(cam) {
  const L = landscape({ seed: 15, hill: hillGentle, plaza: [0, 0, 40], trees: 30, treeCols: ['#7e8f55', '#6f8450', '#5f9a45'], clear: (x, z) => Math.abs(x) < 36 && z > -14 && z < 60, bushesN: 40, walls: [[-40, -12, 0.2, 14]] }); L.set(0.7);
  const grp = L.grp, gy = L.hfn(0, 0), XS = [-16, -3, 10], PY = gy + 2.2;
  const stone = lam('#d8cdb0', { map: noiseTex(51, 4, 2) }), soil = lam('#6b4a2a', { map: noiseTex(52, 3, 3) });
  const pl = XS.map(x => { const g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(4, 4.4, 2.2, 28), stone, 0, 1.1, 0), M(new THREE.CylinderGeometry(3.6, 3.6, 0.1, 28), soil, 0, 2.2, 0)); g.position.set(x, gy, 0); shadowable(g); grp.add(g); return g; });
  const row = new THREE.Group(); pl.forEach(p => { grp.remove(p); row.add(p); }); grp.add(row);
  const squill = P.makeSquill(9); squill.position.set(XS[0], PY, 0); row.add(squill);
  const almond = P.makeAlmond(5, 0.55); almond.position.set(XS[1], PY, 0); almond.userData.bloom(1); row.add(almond);
  const rock = M(new THREE.DodecahedronGeometry(1.0, 0).scale(1.5, 0.7, 1.1), lam('#c9bfa8'), XS[2], PY + 0.3, 0); shadowable(rock); grp.add(rock);
  const bird = P.makeWagtail(); row.add(bird);
  const ring = M(new THREE.TorusGeometry(5, 0.2, 10, 48), BASIC('#ffd24a'), XS[0], PY + 4.2, 1.5); grp.add(ring);
  const med = new THREE.Group(); med.add(M(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 28).rotateX(Math.PI / 2), DARK), M(new THREE.CylinderGeometry(2.1, 2.1, 0.55, 28).rotateX(Math.PI / 2), lam('#efe3c4')), M(P.dropGeo().scale(2.4, 2.4, 1.2), lam('#4fb0ee', { emissive: '#1a5a90' }), 0, 0, 0.4));
  for (const s of [-1, 1]) { const x = M(new THREE.BoxGeometry(4.2, 0.45, 0.3), BASIC('#d02818'), 0, 0, 0.7); x.rotation.z = s * 0.78; med.add(x); }
  med.position.set(-22, gy + 9, 1); grp.add(med);
  const clouds = [[-18, 17, -12], [-4, 19, -14], [12, 18, -12], [-28, 15, -8]].map(([x, y, z]) => { const c = K.makeCloud({ scale: 2.5 }); c.position.set(x, y, z); grp.add(c); return c; });
  const KEYS = [[0, [-2, 9, 42], [-3, 6, 0]], [21.49, [2, 10, 38], [-1, 6.2, 0]]];
  return { grp, hero: row, tgt: [0, gy, 0], ext: 60,
    upd(lt) {
      camTo(cam, lt, KEYS);
      pl.forEach((p, i) => { const u = (lt - (0.3 + 0.5 * i)) / 0.6; p.scale.setScalar(Math.max(0.001, pop(u))); });
      const o1 = pop((lt - 0.6) / 0.6), o2 = pop((lt - 1.1) / 0.6), o3 = pop((lt - 1.6) / 0.6), gr = ramp(lt, 7.7, 9.6);
      squill.scale.setScalar(Math.max(0.001, o1 * (0.75 + 0.25 * gr))); squill.userData.grow(0.62 + 0.38 * gr); squill.userData.glow(ramp(lt, 8.6, 9.8) * (0.8 + 0.2 * Math.sin(lt * 9)), 0.62 + 0.38 * gr);
      almond.scale.setScalar(Math.max(0.001, 0.55 * o2)); bird.scale.setScalar(Math.max(0.001, 2.0 * o3));
      bird.userData.pose({ x: XS[2], y: PY + 0.7, z: 0, yaw: -0.9, tilt: 0, flap: 0.03, wag: 0.4 * Math.sin(lt * 16) });
      const ru = (lt - 2.6) / 0.5; ring.visible = ru > 0; const pul = lt > 7.37 && lt < 10.4 ? 1 + 0.06 * Math.sin(lt * 10) : 1; ring.scale.setScalar(Math.max(0.001, pop(ru) * pul * (1 + 0.15 * gr))); ring.position.y = PY + 4.2 + 2.5 * gr; ring.material.color.set(lt > 7.67 ? '#7be08a' : '#ffd24a');
      const mu = (lt - 3.8) / 0.5; med.visible = mu > 0 && lt < 8.4; med.scale.setScalar(Math.max(0.001, pop(mu) * (1 - ramp(lt, 7.7, 8.3)))); med.rotation.z = 0.08 * Math.sin(lt * 7) * (lt > 4.3 ? 1 : 0);
      clouds.forEach((c, i) => { const u = (lt - (10.3 + 1.2 * i)) / 1.0; c.visible = u > 0; c.scale.setScalar(2.5 * pop(u) * (1 + 0.25 * ramp(lt, 12, 19))); c.userData.setTone(ramp(lt, 10.5 + i, 17)); });
    },
    light(lt) { return Object.assign(mixL(LD, LG, 0.7 * ramp(lt, 10.3, 18)), { tgt: [0, gy, 0], ext: 60 }); },
    tipa(lt) { return { side: 1, xf: 0.76, size: 0.2, expr: lt < 2.6 ? 'neutral' : lt < 7.37 ? 'curious' : lt < 10.25 ? 'worried' : 'surprised', arms: lt < 7.67 ? 'down' : lt < 10.25 ? 'up' : 'down', hop: lt > 7.67 && lt < 10.25 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5), look: lt > 10.25 ? [-0.2, 0.9] : null }; } };
}
