/* film_s5 shots a (sun, summer vs winter) and b (year wheel + 365 dots). ASCII only. */
import { THREE, K, cl, ramp, pop, sm, lam, phong, noiseTex, shadowable, BASIC, M, Yaxis, camTo, dirOf, LD, LG, mixL, WOOD, DARK, hillGentle } from './s5_common.js';
import { landscape } from './s5_land.js';
import * as P from './s5_props.js';

export function shotA(cam) {
  const L = landscape({ seed: 4, hill: hillGentle, plaza: [0, 12, 36], trees: 34, clear: (x, z) => Math.abs(x) < 30 && z > -8 && z < 62, walls: [[-34, -14, 0.1, 14], [38, -16, -0.2, 10], [-52, -12, 0.3, 12]], city: [0, -88, 2.2], bushesN: 60 });
  const grp = L.grp, hfn = L.hfn, TX = 7, TZ = 8, gy = hfn(TX, TZ), dialTop = gy + 0.55, H = 9.6, TIP = [TX, dialTop + H, TZ];
  const brass = phong('#c9a24a', { shininess: 80 }), hero = new THREE.Group();
  hero.add(M(new THREE.CylinderGeometry(7.2, 7.6, 0.7, 44), lam('#d8cdb0', { map: noiseTex(12, 4, 4) }), TX, gy + 0.2, TZ));
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, t = M(new THREE.BoxGeometry(0.35, 0.12, 1.2), brass, TX + Math.sin(a) * 5.9, dialTop + 0.02, TZ + Math.cos(a) * 5.9); t.rotation.y = a; hero.add(t); }
  hero.add(M(new THREE.CylinderGeometry(0.2, 0.32, H, 10), phong('#8a6a3a'), TX, dialTop + H / 2, TZ), M(new THREE.SphereGeometry(0.6, 14, 10), brass, TX, dialTop + H + 0.3, TZ));
  shadowable(hero); grp.add(hero);
  /* day-length sign */
  const sg = new THREE.Group(), sx = -22, sz = 12, sy = hfn(sx, sz);
  for (const s of [-1, 1]) sg.add(M(new THREE.BoxGeometry(0.5, 6, 0.5), DARK, s * 7.6, 3, 0));
  sg.add(M(new THREE.BoxGeometry(17, 5.6, 0.6), WOOD, 0, 6, 0), M(new THREE.BoxGeometry(15.6, 4.2, 0.3), lam('#1f2f55', { emissive: '#0a1228' }), 0, 6, 0.3));
  const dayBar = M(new THREE.BoxGeometry(1, 3.0, 0.4), lam('#f2b827', { emissive: '#8a6000' }), 0, 6, 0.55); sg.add(dayBar);
  const sunDot = M(new THREE.SphereGeometry(0.95, 14, 10), BASIC('#fff2a0'), 0, 6, 0.9); sg.add(sunDot);
  const moon = M(new THREE.TorusGeometry(0.7, 0.25, 8, 20, 4.4), BASIC('#dfe6f2'), 7.0, 6, 0.8); sg.add(moon);
  for (let i = 0; i < 5; i++) sg.add(M(new THREE.BoxGeometry(0.22, 0.22, 0.1), BASIC('#ffe9a0'), 3 + i * 0.9, 6.7 - (i % 2) * 1.4, 0.5));
  sg.position.set(sx, sy, sz); sg.rotation.y = 0.18; shadowable(sg); grp.add(sg);
  const sun = P.makeSunModel(2.6); hero.add(sun);
  const beam = M(new THREE.CylinderGeometry(1.2, 2.0, 1, 24, 1, true), BASIC('#fff0a0', { transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); hero.add(beam);
  const spot = M(new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2), BASIC('#fff0a0', { transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })); hero.add(spot);
  const KEYS = [[0, [-4, 9, 72], [0, 17, 4]], [14.04, [5, 10, 66], [0, 17, 4]]], tip = new THREE.Vector3(...TIP);
  const sunState = lt => { const w = sm((lt - 7.14) / 2.8), el = lt < 7.14 ? 34 + 18 * sm(lt / 2.2) : 52 - 32 * w; return { w, el, dir: dirOf(el, -30) }; };
  return { grp, hero, tgt: TIP, ext: 70,
    upd(lt) {
      camTo(cam, lt, KEYS); const { w, dir } = sunState(lt); L.set(1 - w);
      const S = tip.clone().addScaledVector(dir, 24), G = tip.clone().addScaledVector(dir, -(H / dir.y));
      sun.position.copy(S); sun.userData.spin(lt); sun.scale.setScalar(pop((lt - 0.2) / 0.6));
      beam.position.copy(S).add(G).multiplyScalar(0.5); beam.quaternion.setFromUnitVectors(Yaxis, S.clone().sub(G).normalize());
      beam.scale.set(1 + 0.9 * w, S.distanceTo(G), 1 + 0.9 * w); beam.material.opacity = (0.22 - 0.12 * w) * cl((lt - 0.4) / 0.6);
      spot.position.set(G.x, G.y + 0.1, G.z); spot.scale.set(2.2 * (1 + 0.2 * w), 1, 2.2 * (1 + 1.8 * w)); spot.rotation.y = Math.atan2(-dir.x, -dir.z); spot.material.opacity = 0.5 - 0.25 * w;
      const u = 0.9 - 0.52 * w, wd = 14.4 * Math.max(0.02, u); dayBar.scale.x = wd; dayBar.position.x = -7.2 + wd / 2; sunDot.position.x = -7.2 + wd;
      sg.scale.setScalar(pop((lt - 0.5) / 0.6));
    },
    light(lt) { const { w, el } = sunState(lt); return Object.assign(mixL(Object.assign({}, LD, { sunC: '#ffe6a8', sunI: 2.5 }), Object.assign({}, LG, { sunC: '#cfdcf0', sunI: 1.3 }), w), { el, az: -30, tgt: TIP, ext: 70 }); },
    tipa(lt) { return { side: 1, xf: 0.76, size: 0.2, expr: lt < 7.14 ? 'happy' : 'curious', arms: lt < 7.14 ? 'up' : 'point', hop: 0, show: cl((lt - 0.2) / 0.5) }; } };
}

export function shotB(cam) {
  const L = landscape({ seed: 6, hill: hillGentle, plaza: [0, 0, 40], trees: 30, clear: (x, z) => Math.abs(x) < 34 && z > -14 && z < 70, walls: [[-38, -12, 0.2, 14], [40, -14, -0.1, 12]], bushesN: 40 });
  const grp = L.grp, gy = L.hfn(0, 0); L.set(0.25);
  const W = P.makeWheel(9.6, 14); W.position.set(0, gy + 14.3, 0); grp.add(W);
  const B = P.makeDotBoard(); B.position.set(0, gy + 12.3, 0); grp.add(B);
  const sign = P.makeSign('42', 7, 3.6, '#efe3c4', '#2a5fb0'); grp.add(sign);
  const KEYS = [[0, [0, 13, 46], [0, 14, 0]], [9.0, [0, 13.5, 48], [0, 14, 0]], [11.8, [0, 15, 52], [0, 14.5, 0]], [18.57, [2, 16, 50], [0, 14.5, 0]]];
  const wu = W.userData, bd = B.userData, st = [0.8, 2.6, 4.6, 5.7], ord = [1, 3, 2, 0];
  return { grp, hero: B, heroAt: lt => (lt < 9.9 ? W : B), tgt: [0, gy, 0], ext: 70,
    upd(lt) {
      camTo(cam, lt, KEYS);
      W.visible = lt < 10.4; W.scale.setScalar(Math.max(0.001, pop((lt - 0.1) / 0.5) * (1 - sm((lt - 9.6) / 0.7))));
      ord.forEach((ai, n) => wu.setArc(ai, (lt - st[n]) / 0.7));
      wu.setHand(360 * sm((lt - 6.6) / 2.6), lt > 6.4 && lt < 10);
      B.visible = lt > 9.43; B.scale.setScalar(Math.max(0.001, pop((lt - 9.8) / 0.7)));
      bd.apply({ reveal: ramp(lt, 10.4, 12.8), blueU: k => (lt - (12.6 + 0.1 * k)) / 0.35, dropU: k => (lt - (12.8 + 0.1 * k)) / 0.35 });
      const su = (lt - 16.4) / 0.8; sign.visible = su > 0; sign.position.set(0, gy + 24 + 6 * (1 - pop(su)), 2); sign.scale.setScalar(Math.max(0.001, pop(su)));
    },
    light() { return Object.assign({}, LD, { tgt: [0, gy, 0], ext: 70 }); },
    tipa(lt) { return { side: 1, xf: 0.76, size: 0.2, expr: lt < 9.4 ? 'curious' : lt < 16.4 ? 'surprised' : 'cheering', arms: lt < 9.4 ? 'point' : lt < 16.4 ? 'down' : 'up', hop: lt > 16.4 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) }; } };
}
