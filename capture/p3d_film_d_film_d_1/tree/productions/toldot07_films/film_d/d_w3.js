/* film_d worlds 3: insert rooms (closed sefer, crate grid), Caesarea (GC), underwater (GU), modern port + crane + trucks (GP). ASCII only. */
import { THREE, sm, cl, frac, V, part, ell, tube, tubeAlong, lathe, toon, KT, M, box, rockGeo, rng, G, col, GI, GC, GU, GP, hullGeo, makeHalo, makeSparkle, makeParticles, makeLabel, lerp, ease, flags } from './d_core.js';
import { makeRope, setRope } from './d_w2.js';

/* ---------------------------------------------------------------- closed sefer on a shtender, warm room (insert) */
export const seferRoom = (() => {
  const g = G(GI), wood = M('#a8703e', '#c49a84'), woodD = M('#7e4f2a', '#b08a7a');
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(1400, 800), new THREE.MeshBasicMaterial({ color: col('#f1dfb8') })); wall.position.set(0, 330, -260); g.add(wall);
  const grad = new THREE.Mesh(new THREE.CircleGeometry(300, 40), new THREE.MeshBasicMaterial({ color: col('#fff3cf'), transparent: true, opacity: 0.8 })); grad.position.set(0, 320, -258); g.add(grad);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1400, 700).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col('#b9814a') })); floor.position.set(0, 0, 40); g.add(floor);
  for (let i = 0; i < 9; i++) box(g, 4, 1, 700, woodD, [-600 + i * 150, 1, 40], 0);
  part(g, box0(46, 8, 40), woodD, 2, [0, 4, 0]); part(g, box0(30, 120, 28), wood, 2.4, [-2, 66, 0]);
  const top = G(g, [0, 132, 0]); top.rotation.z = -0.32; part(top, box0(46, 4, 48), wood, 2.2, [0, 0, 0]); part(top, box0(3, 5, 48), woodD, 1.4, [22, 3, 0]);
  const book = G(top, [0, 9, 0]); part(book, box0(34, 13, 26), M('#6a3a26', '#b08a7a'), 2, [0, 6.5, 0]); part(book, box0(30, 11, 23), M('#f6efdc', '#d6cbb8', 0), 0, [1.5, 6.5, 0.4]);
  for (const y of [3, 10]) part(book, box0(35, 1.6, 27), M('#e8c04a', '#c9a030', 0), 0, [0, y, 0]); part(book, box0(34.5, 1.8, 26.4), M('#e8c04a', '#c9a030', 0), 0, [0, 6.5, 0]);
  g.scale.setScalar(2.2); g.userData.top = top; g.userData.book = book;
  g.userData.halo = makeHalo(240, '#ffe9a0', 0.55); g.userData.halo.position.set(0, 175, -30); g.userData.halo.material.depthTest = true; g.userData.halo.renderOrder = 5; g.add(g.userData.halo);
  g.userData.sp = [0, 1, 2, 3, 4, 5].map(() => { const s = makeSparkle(9, '#fff4c0'); g.add(s); return s; });
  g.visible = false; return g;
  function box0(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
})();
export function seferTick(T, k) { if (flags.collect) return; const g = seferRoom; g.userData.halo.material.opacity = 0.25 + 0.3 * k + 0.1 * Math.sin(T * 3); g.userData.halo.scale.setScalar(0.9 + 0.15 * k);
  g.userData.sp.forEach((s, i) => { const ph = frac(T * 0.55 + i / 6), on = Math.sin(Math.PI * ph) * k; s.position.set(Math.cos(i * 2.2) * 36, 160 + Math.sin(i * 1.7) * 28 + ph * 30, 22 + Math.sin(i) * 10); s.scale.setScalar(Math.max(0.001, on) * 0.8); s.rotation.z = ph * 1.4; s.visible = on > 0.02; }); }
