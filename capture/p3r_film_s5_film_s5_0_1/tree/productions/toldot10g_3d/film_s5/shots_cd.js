/* film_s5 shots c (signs of winter near the ground) and d (sun bar vs moon bar, 11). ASCII only. */
import { THREE, K, cl, ramp, pop, sm, hash2, lam, phong, noiseTex, shadowable, BASIC, M, camTo, LD, LG, mixL, WOOD, DARK, hillGentle } from './s5_common.js';
import { landscape } from './s5_land.js';
import * as P from './s5_props.js';

export function shotC(cam) {
  const hillC = (x, z) => 10 * Math.exp(-Math.pow((x + 20) / 40, 2) - Math.pow((z + 60) / 40, 2)) + 4 * Math.exp(-Math.pow((x - 40) / 25, 2) - Math.pow((z + 20) / 25, 2));
  const L = landscape({ seed: 8, hill: hillC, trees: 26, treeCols: ['#7e8f55', '#8a9a60', '#6f8450'], clear: (x, z) => x > -32 && x < 36 && z > -4 && z < 45, rocksN: 110, tuftCols: ['#c9b57c', '#d6c07a', '#b8a45a'], bushesN: 70, bushCol: '#a89850', walls: [[-30, -8, 0.2, 14]] });
  const grp = L.grp, hfn = L.hfn; L.set(1);
  const SQ = [-4, 10], sy = hfn(SQ[0], SQ[1]);
  const soil = M(new THREE.CircleGeometry(7, 32).rotateX(-Math.PI / 2), lam('#a98960', { map: noiseTex(30, 3, 3) }), SQ[0], sy + 0.06, SQ[1]); soil.receiveShadow = true; grp.add(soil);
  const squill = P.makeSquill(9); squill.position.set(SQ[0], sy, SQ[1]); grp.add(squill);
  const stx = 2.6, stz = 8.2, sty = hfn(stx, stz), stone = M(new THREE.DodecahedronGeometry(1.1, 0).scale(1.6, 0.8, 1.2), lam('#c9bfa8', { map: noiseTex(31, 2, 2) }), stx, sty + 0.4, stz); shadowable(stone); grp.add(stone);
  const bird = P.makeWagtail(); grp.add(bird);
  const alx = 14, alz = 5, almond = P.makeAlmond(3, 1.3); almond.position.set(alx, hfn(alx, alz), alz); grp.add(almond);
  [[-20, -4, 1.6, 1], [26, -12, 1.8, 2], [-34, 6, 1.5, 3], [34, 2, 1.5, 4], [-10, -14, 1.7, 5]].forEach(([x, z, s, sd]) => { const b = P.makeBareTree(sd, s); b.position.set(x, hfn(x, z), z); grp.add(b); });
  const clouds = [[-10, 13, -12], [4, 14, -10], [14, 13, -14]].map(([x, y, z]) => { const c = K.makeCloud({ scale: 2.2 }); c.position.set(x, y, z); grp.add(c); return c; });
  const inten = tb => ramp(tb, 12.3, 13.5) * (1 - ramp(tb, 17, 18.5)) * (0.3 + 0.7 * ramp(tb, 13, 15));
  const rain = K.makeRain(420, 1.0, 14, (tb, i, k) => ({ x: -16 + hash2(i, k) * 40, y: 13, z: -6 + hash2(i * 3, k) * 22, p: inten(tb) }), (x, z) => hfn(x, z)); grp.add(rain);
  const KEYS = [[0, [8, 3.5, 30], [-3, 3.5, 10]], [7.2, [4, 3.2, 28], [-1, 3.8, 9]], [12.3, [6, 3, 29], [1, 3.5, 9]], [17, [12, 4, 27], [8, 5.5, 6]], [21.49, [16, 5, 24], [13, 6.5, 5]]];
  const mood = lt => 0.55 * (ramp(lt, 11.5, 13.5) - ramp(lt, 17, 19.5));
  return { grp, hero: squill, heroAt: lt => (lt > 16 ? almond : squill), tgt: [5, 0, 8], ext: 60,
    upd(lt) {
      camTo(cam, lt, KEYS); L.set(1 - 0.4 * ramp(lt, 13, 19));
      squill.userData.grow(ramp(lt, 0.35, 4.8));
      if (lt < 6.6 || lt > 15.2) bird.visible = false; else {
        bird.visible = true; let o;
        if (lt < 7.9) { const u = (lt - 6.6) / 1.3, e = sm(u); o = { x: -22 + 24.6 * u, y: sty + 0.85 + (14 - sty - 0.85) * (1 - e), z: -8 + 16.2 * u, yaw: -0.58, tilt: 0.2, flap: 0.9 * Math.sin(lt * 38), wag: 0 }; }
        else if (lt < 13.2) { o = { x: stx, y: sty + 0.85, z: stz, yaw: -0.58 - 0.4 * sm((lt - 8) / 0.6), tilt: 0, flap: 0.03, wag: 0.4 * Math.sin(lt * 16) }; }
        else { const u = cl((lt - 13.2) / 2.0), e = sm(u); o = { x: stx + 28 * e, y: sty + 0.85 + 16 * e, z: stz - 18 * e, yaw: 0.9, tilt: 0.2, flap: 0.9 * Math.sin(lt * 38), wag: 0 }; }
        bird.userData.pose(o);
      }
      rain.userData.update(lt);
      clouds.forEach((c, i) => { const u = (lt - (11.8 + 0.4 * i)) / 0.8; c.visible = u > 0 && lt < 20; c.scale.setScalar(2.2 * pop(u)); c.userData.setTone(ramp(lt, 12, 14) * (1 - ramp(lt, 17, 19))); });
      almond.userData.bloom(ramp(lt, 16.2, 19.6));
    },
    light(lt) { return Object.assign(mixL(LD, LG, mood(lt)), { tgt: [5, 0, 8], ext: 60 }); },
    tipa(lt) { return { side: 1, xf: 0.76, size: 0.2, expr: lt < 7.5 ? 'curious' : lt < 12.3 ? 'surprised' : lt < 17 ? 'cheering' : 'happy', arms: lt < 7.5 ? 'point' : lt < 12.3 ? 'down' : lt < 17 ? 'up' : 'down', hop: lt > 12.3 && lt < 17 ? 0.6 : 0, show: cl((lt - 0.2) / 0.5) }; } };
}

export function shotD(cam) {
  const L = landscape({ seed: 11, hill: hillGentle, plaza: [0, 0, 48], trees: 30, clear: (x, z) => Math.abs(x) < 40 && z > -16 && z < 60, bushesN: 30, walls: [[-44, -14, 0.1, 12]] }); L.set(0.3);
  const grp = L.grp, gy = L.hfn(0, 0), Y0 = gy + 1.4;
  const stage = shadowable(M(new THREE.BoxGeometry(60, 1.4, 24), WOOD, 0, gy + 0.7, 0)); grp.add(stage);
  const bar = (len, color, em) => { const g = new THREE.Group(); g.add(M(new THREE.BoxGeometry(len, 1.6, 1.8), lam(color, { emissive: em }), -len / 2, 0.8, 0)); for (let k = 1; k < 12; k++) g.add(M(new THREE.BoxGeometry(0.14, 0.06, 1.8), DARK, -len * k / 12, 1.62, 0)); return shadowable(g); };
  const sunB = bar(40, '#f2b827', '#7a5000'), moonB = bar(37, '#aab8d0', '#202838'); sunB.position.set(20, Y0, -3.5); moonB.position.set(20, Y0, 3.5); grp.add(sunB, moonB);
  const sunI = P.makeSunModel(1.2); sunI.position.set(23, Y0 + 1.6, -3.5); const moonI = M(new THREE.TorusGeometry(0.9, 0.3, 8, 24, 4.2), BASIC('#dfe6f2'), 23, Y0 + 1.6, 3.5); grp.add(sunI, moonI);
  const flag = x => { const g = new THREE.Group(); g.add(M(new THREE.BoxGeometry(0.2, 3.4, 0.2), DARK, 0, 1.7, 0)); const b = new THREE.Group(); b.position.y = 3.9; for (let k = 0; k < 5; k++) { const a = k * 1.2566; b.add(M(new THREE.SphereGeometry(0.42, 10, 8).scale(1, 1, 0.5), lam('#ffe0ea', { emissive: '#aa6a80' }), Math.sin(a) * 0.55, Math.cos(a) * 0.55, 0)); } b.add(M(new THREE.SphereGeometry(0.25, 8, 6), BASIC('#e8a010'))); g.add(b); g.userData.b = b; return g; };
  const fS = flag(), fM = flag(); grp.add(fS, fM);
  const hl = M(new THREE.BoxGeometry(3, 1.8, 1.9), BASIC('#ffe27a', { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), -18.5, Y0 + 0.9, 3.5); grp.add(hl);
  const s11 = P.makeSign('11', 4.4, 2.6, '#efe3c4', '#c0392b'); grp.add(s11);
  const blocks = [0, 1, 2].map(() => { const b = shadowable(M(new THREE.BoxGeometry(3, 1.6, 1.8), lam('#aab8d0', { emissive: '#202838' }))); grp.add(b); return b; });
  const mat = lam('#b06ae0', { emissive: '#3a1a60' }), big = shadowable(M(new THREE.BoxGeometry(3, 1.6, 1.8), mat)); grp.add(big);
  const ring = M(new THREE.TorusGeometry(1, 0.12, 8, 32).rotateX(Math.PI / 2), BASIC('#fff2a0', { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), -18.5, Y0 + 1.2, 3.5); grp.add(ring);
  const KEYS = [[0, [-2, 18, 36], [0, 2, 1]], [10, [-6, 17, 33], [-8, 2, 2]], [14, [-4, 16, 32], [-8, 2, 2]], [15.47, [0, 19, 37], [0, 2, 1]]];
  return { grp, hero: stage, tgt: [0, gy, 0], ext: 70,
    upd(lt) {
      camTo(cam, lt, KEYS);
      sunB.scale.x = Math.max(0.001, ramp(lt, 0.3, 1.2)); moonB.scale.x = Math.max(0.001, ramp(lt, 0.8, 1.7));
      sunI.visible = lt > 0.5; sunI.scale.setScalar(pop((lt - 1.0) / 0.5)); sunI.userData.spin(lt); moonI.scale.setScalar(pop((lt - 1.4) / 0.5));
      const fu = (lt - 1.6) / 0.5; fS.visible = fM.visible = fu > 0; fS.scale.setScalar(pop(fu)); fM.scale.setScalar(pop(fu));
      const mx = 1.5 * (1 - ramp(lt, 13.3, 14.3)); fS.position.set(0, Y0, -3.5); fM.position.set(mx, Y0, 3.5);
      const gl = ramp(lt, 13.3, 13.9) * (1 - ramp(lt, 14.6, 15.4)); fS.userData.b.rotation.z = fM.userData.b.rotation.z = 0.2 * Math.sin(lt * 6) * gl;
      const bl = lt > 3.2 && lt < 7.0 ? 0.35 + 0.35 * Math.sin(lt * 9) : 0; hl.material.opacity = bl;
      const su = (lt - 3.2) / 0.5; s11.visible = su > 0 && lt < 7.4; s11.position.set(-18.5, Y0 + 7 + 0.4 * Math.sin(lt * 9), 3.5); s11.scale.setScalar(Math.max(0.001, pop(su)) * (1 + 0.08 * Math.sin(lt * 9)));
      blocks.forEach((b, i) => { const u = (lt - (7.0 + 1.3 * i)) / 0.5, mg = ramp(lt, 10.4, 11.3); b.visible = u > 0 && lt < 11.4; b.scale.setScalar(Math.max(0.001, pop(u))); b.position.set(-25, Y0 + 0.8 + (1.7 * i) * (1 - mg) + 1.7 * mg, 3.5); });
      const bu = (lt - 11.4) / 0.4; big.visible = bu > 0; let bx = -25, by = Y0 + 2.5;
      if (lt >= 11.6 && lt < 12.6) { const e = sm((lt - 11.6) / 1.0); bx = -25 + 6.5 * e; by = Y0 + 2.5 + 5.5 * Math.sin(Math.PI * 0.5 * e); }
      else if (lt >= 12.6) { const e = Math.pow(cl((lt - 12.6) / 0.7), 2); bx = -18.5; by = Y0 + 8 - (8 - 0.8) * e; }
      big.position.set(bx, by, 3.5); big.scale.setScalar(Math.max(0.001, pop(bu)));
      mat.color.set('#b06ae0').lerp(new THREE.Color('#aab8d0'), ramp(lt, 13.4, 14.4)); mat.emissive.set('#3a1a60').lerp(new THREE.Color('#202838'), ramp(lt, 13.4, 14.4));
      const ru = cl((lt - 13.3) / 1.0); ring.visible = ru > 0 && ru < 1; ring.scale.setScalar(1 + 5 * ru); ring.material.opacity = 0.8 * (1 - ru);
    },
    light() { return Object.assign({}, LD, { tgt: [0, gy, 0], ext: 70 }); },
    tipa(lt) { return { side: 1, xf: 0.76, size: 0.2, expr: lt < 7 ? 'curious' : lt < 13.3 ? 'surprised' : 'cheering', arms: lt < 13.3 ? 'point' : 'up', hop: lt > 13.3 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) }; } };
}
