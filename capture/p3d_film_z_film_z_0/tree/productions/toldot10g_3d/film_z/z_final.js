/* film_z finale (z2): the relief map on the table in warm evening light by the window, an open book, TIPA and MELACH on a cloud. ASCII only. No people, no text. */
import * as THREE from 'three';
import { track } from '../../gezer_trip/film_a/gz_kit2.js';
import * as K from '../kit10g.js';
import { makeMelach } from '../../toldot09_kit/kit09.js';
const { cl, ramp, pop, C, hash2, lam, phong, woodTex, noiseTex, shadowable, rng, mapY, ll } = K;
const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));

/* MELACH sits beside TIPA on the same screen-space cloud (child of the companion holder) */
export function makeBuddy(comp, cam) {
  let mel = null; const group = new THREE.Group(), inner = new THREE.Group(); group.add(inner);
  const DEPTH = 30, HH = DEPTH * Math.tan(18 * Math.PI / 180);
  const pm = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#555555' }), puff = new THREE.Group();
  [[0, 0, 0, 1.2], [-1.2, -0.1, 0.1, 0.8], [1.2, -0.05, 0, 0.85], [-0.5, 0.1, 0.6, 0.8], [0.6, 0, 0.6, 0.7], [0, -0.1, -0.5, 0.9]].forEach(([x, y, z, r]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), pm); m.position.set(x, y, z); m.scale.y = 0.55; puff.add(m); });
  group.add(puff); comp.holder.add(group);
  const look = [-0.5, 0.1];
  return {
    setVisible(v) { group.visible = v; },
    async warm() { mel = makeMelach(); inner.add(mel.root); for (const e of ['neutral', 'happy', 'curious']) { try { await mel.face.set({ expr: e, look, talk: null, blink: false }); } catch (err) { /* expression not in the grain rig */ } } },
    place(o) {
      if (!mel) return; const size = o.size || 0.15, s = size * 2 * HH / mel.height;
      group.position.set(-2.7, 0, 0); inner.scale.setScalar(s); puff.position.set(0, -0.12 + 0.1 * Math.sin((o.t || 0) * 1.5 + 1), 0);
      inner.position.set(0, 0.28 + 0.1 * Math.sin((o.t || 0) * 1.5 + 1), 0);
      mel.pose({ t: o.t || 0, x: 0, y: 0, z: 0, yaw: Math.atan2(-0.83, -0.55), walk: o.hop || 0, ph: (o.t || 0) * 1.4, arms: 'down' });
      try { mel.face.set({ expr: o.expr || 'happy', look, talk: null, blink: false }); } catch (err) { /* keep */ }
    }
  };
}

/* the room behind the table: wall, window with a low sun, curtains, a small bookcase */
function room() {
  const g = new THREE.Group(), wall = new THREE.Mesh(new THREE.PlaneGeometry(420, 170), lam('#d9b98a', { map: noiseTex(51, 6, 3) })); wall.position.set(0, 40, -100); wall.receiveShadow = true; g.add(wall);
  const base = new THREE.Mesh(new THREE.BoxGeometry(420, 10, 1.2), lam('#5a3a1e', { map: woodTex(4, 14, 1) })); base.position.set(0, 3, -99.4); g.add(base);
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; { const x = cv.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#6a5a9a'); gr.addColorStop(0.55, '#f0a860'); gr.addColorStop(1, '#ffd890'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); x.fillStyle = '#ffe9b0'; x.beginPath(); x.arc(40, 92, 15, 0, 6.3); x.fill(); x.fillStyle = '#7a6a58'; x.fillRect(0, 108, 128, 20); }
  const WX = -42, WY = 40, pane = new THREE.Mesh(new THREE.PlaneGeometry(40, 46), BASIC('#ffffff', { map: new THREE.CanvasTexture(cv) })); pane.position.set(WX, WY, -98.8); g.add(pane);
  const fr = lam('#4a2c18', { map: woodTex(6, 3, 1) });
  const bar = (x, y, w, h) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.6), fr); b.position.set(WX + x, WY + y, -98.2); b.castShadow = true; g.add(b); };
  bar(0, 24, 46, 3); bar(0, -24, 46, 3); bar(-21.5, 0, 3, 50); bar(21.5, 0, 3, 50); bar(0, 0, 1.6, 46); bar(0, 2, 40, 1.6);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(40, 46), BASIC('#ffb060', { transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })); glow.position.set(WX, WY, -97.8); g.add(glow);
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(9, 54, 2.4), lam('#8a2f2a')); c.position.set(WX + s * 28, WY - 1, -97.4); c.castShadow = true; g.add(c); }
  /* bookcase */
  const bc = new THREE.Group(), r = rng(9); bc.position.set(58, 0, -97);
  const bk = new THREE.Mesh(new THREE.BoxGeometry(40, 70, 3), lam('#5a3a1e', { map: woodTex(5, 4, 4) })); bk.position.set(0, 33, -1.2); bc.add(bk);
  for (let sh = 0; sh < 4; sh++) {
    const pl = new THREE.Mesh(new THREE.BoxGeometry(40, 1.2, 8), lam('#7a4a26')); pl.position.set(0, 3 + sh * 17, 1.5); bc.add(pl);
    let x = -17; while (x < 17) { const w = 1.6 + r() * 1.4, h = 8 + r() * 6, b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 5.6), lam(['#8a2f2a', '#2a4a7a', '#3a6a3a', '#c9a24a', '#5a3a6a', '#d8d0b8'][Math.floor(r() * 6)])); b.position.set(x + w / 2, 3.6 + sh * 17 + h / 2, 1.8); bc.add(b); x += w + 0.1; }
  }
  bc.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); g.add(bc);
  return g;
}

export function buildFinal(cam, MAP) {
  const grp = new THREE.Group(); grp.add(room());
  const book = K.makeBook(); book.scale.setScalar(2.4); book.position.set(-31, -1.0, 16); book.rotation.y = 0.35; grp.add(book);
  const pins = [[33.0, 35.6], [32.9, 35.4], [32.7, 35.25], [32.4, 35.0], [32.0, 34.9], [31.78, 35.2], [31.5, 35.47], [31.25, 34.79], [30.4, 35.0]].map(([a, b], i) => {
    const [x, z] = ll(a, b), p = K.makePin(['#0f3d7a', '#e0401e', '#1fa05a', '#e8a41c', '#7a3aa0', '#d8402e', '#1f8fb0', '#c97a1c', '#3a9a5a'][i]); p.userData.k = 1.4; p.position.set(x, mapY(x, z) + 0.05, z); grp.add(p); return p;
  });
  const KEYS = [[0, [8, 20, 40], [-3, 0, 4]], [9, [3, 28, 74], [-4, 3, 0]], [13, [-2, 34, 110], [-4, 9, -10]], [16.8, [-2, 34, 110], [-4, 9, -10]]];
  return { grp, map: true, dusk: 1, sun: { t: [0, 0, 0], ext: 100 }, so: [-62, 30, -62], ev: [[0.2, 'whoosh'], [0.9, 'pop'], [1.1, 'pop'], [1.3, 'pop'], [1.5, 'pop'], [1.7, 'pop'], [1.9, 'pop'], [2.1, 'pop'], [2.3, 'pop'], [2.5, 'pop'], [12.2, 'ding']],
    upd(lt) {
      const c = track(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l); MAP.paint(1);
      book.userData.setOpen(1);
      pins.forEach((p, i) => { p.userData.pop(cl((lt - 0.9 - 0.2 * i) / 0.5)); p.userData.glow(ramp(lt, 3 + 0.15 * i, 3.6 + 0.15 * i) * (0.65 + 0.35 * Math.sin(lt * 3 + i))); });
    },
    tipa: lt => ({ side: 1, xf: 0.78, size: 0.2, expr: lt < 4 ? 'happy' : lt < 12 ? 'curious' : 'cheering', arms: lt < 12 ? 'down' : 'up', hop: lt > 12.2 && lt < 13.2 ? 0.5 : 0, show: cl((lt + 0.0) / 0.5) }),
    buddy: lt => ({ size: 0.15, expr: lt < 12 ? 'curious' : 'happy', hop: lt > 12.2 && lt < 13.2 ? 0.5 : 0 }) };
}
