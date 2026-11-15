/* film_s3 (toldot10g) shared helpers: smooth camera path, canvas props, gauge, crown, digit board. ASCII only, no people, no Hebrew. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
const { cl, ramp, pop, C, lam, phong, woodTex, noiseTex } = K;
export const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));

/* Hermite camera path: keys [[t, [px,py,pz], [lx,ly,lz]], ...] - never stops between keys */
export function camPath(lt, keys) {
  const n = keys.length;
  let i = 0; while (i < n - 2 && lt > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1], dt = b[0] - a[0], u = cl((lt - a[0]) / dt);
  const out = {};
  [['p', 1], ['l', 2]].forEach(([nm, k]) => {
    out[nm] = [0, 1, 2].map(j => {
      const tan = idx => {
        const p0 = keys[Math.max(0, idx - 1)], p1 = keys[Math.min(n - 1, idx + 1)];
        const d = p1[0] - p0[0] || 1; return (p1[k][j] - p0[k][j]) / d;
      };
      const m0 = tan(i) * dt, m1 = tan(i + 1) * dt, p0 = a[k][j], p1 = b[k][j];
      const u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1;
    });
  });
  return out;
}

export function ctex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.userData = { c, g }; return t;
}

const WOOD = () => lam('#8a5a30', { map: woodTex(3, 2, 2) });

/* vertical altimeter post with a red marker. set(f) f 0..1 (0 = bottom) */
export function makeGauge(H) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.BoxGeometry(2.7, H, 0.5), WOOD()); g.add(post);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(2.0, H - 0.7), new THREE.MeshBasicMaterial({
    map: ctex(128, 512, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#dfe9f2'); gr.addColorStop(0.5, '#cfe0b0'); gr.addColorStop(1, '#8cb85a');
      c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#3a2a18';
      for (let i = 0; i <= 20; i++) { const y = 8 + i * (h - 16) / 20; c.fillRect(i % 5 === 0 ? 8 : 34, y - 2, i % 5 === 0 ? 112 : 60, i % 5 === 0 ? 6 : 4); }
    })
  }));
  face.position.z = 0.27; g.add(face);
  const mk = new THREE.Group();
  const tri = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.25, 3).rotateZ(Math.PI / 2), BASIC('#e0301e')); tri.position.x = 1.9; mk.add(tri);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.2), BASIC('#e0301e')); bar.position.x = 0.4; mk.add(bar);
  mk.position.z = 0.45; g.add(mk);
  g.userData.set = f => { mk.position.y = -H / 2 + 0.55 + cl(f) * (H - 1.1); };
  g.userData.set(1);
  return g;
}

/* clock: set(turns 0..1), show(u) */
export function makeClock() {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.55, 0.5, 40).rotateX(Math.PI / 2), WOOD()); g.add(rim);
  const face = new THREE.Mesh(new THREE.CircleGeometry(2.25, 40), new THREE.MeshBasicMaterial({ color: '#f4ecd2' })); face.position.z = 0.27; g.add(face);
  const slices = [];
  for (let k = 0; k < 60; k++) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(2.1, 3, Math.PI / 2 - (k + 1) * Math.PI / 30 - 0.004, Math.PI / 30 + 0.008), new THREE.MeshBasicMaterial({ color: '#ffc928' }));
    m.position.z = 0.3; m.visible = false; g.add(m); slices.push(m);
  }
  for (let k = 0; k < 12; k++) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.14, k % 3 === 0 ? 0.55 : 0.32, 0.06), BASIC('#3a2a18'));
    const a = k * Math.PI / 6; t.position.set(Math.sin(a) * 1.9, Math.cos(a) * 1.9, 0.34); t.rotation.z = -a; g.add(t);
  }
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.85, 0.08).translate(0, 0.92, 0), BASIC('#b02a1c')); hand.position.z = 0.4; g.add(hand);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), BASIC('#3a2a18')); hub.position.z = 0.4; g.add(hub);
  g.userData.set = f => { hand.rotation.z = -f * Math.PI * 2; const n = Math.floor(f * 60 + 1e-6); slices.forEach((s, i) => { s.visible = i < n; }); };
  g.userData.show = u => { g.scale.setScalar(pop(u)); g.visible = u > 0; };
  return g;
}

export function makeCrown(S) {
  const g = new THREE.Group(), gold = phong('#ffc928', { shininess: 90, emissive: '#6a4a00' });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.8, 0.5, 20, 1, true), gold));
  for (let k = 0; k < 5; k++) {
    const a = k * Math.PI * 2 / 5, sp = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 6), gold);
    sp.position.set(Math.sin(a) * 0.8, 0.65, Math.cos(a) * 0.8); g.add(sp);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), phong('#ff5a4a')); b.position.set(Math.sin(a) * 0.8, 1.12, Math.cos(a) * 0.8); g.add(b);
  }
  g.scale.setScalar(S || 1); return g;
}

/* digit board (wood frame + canvas). set(text, color) redraws only on change */
export function makeDigitBoard(w, h) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.5), WOOD()));
  const tex = ctex(256, Math.round(256 * h / w), () => {});
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.6, h - 0.6), new THREE.MeshBasicMaterial({ map: tex })); face.position.z = 0.27; g.add(face);
  let last = '';
  g.userData.set = (txt, col, bg) => {
    const key = txt + col + bg; if (key === last) return; last = key;
    const c = tex.userData.g, W = tex.userData.c.width, H = tex.userData.c.height;
    c.fillStyle = bg || '#fbf3dc'; c.fillRect(0, 0, W, H); c.fillStyle = col || '#2a1c0e';
    c.font = 'bold ' + Math.round(H * 0.78) + 'px Arial, Helvetica, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, W / 2, H * 0.54);
    tex.needsUpdate = true;
  };
  g.userData.set('300', '#2a1c0e', '#fbf3dc');
  return g;
}

export function glowRing(r, tube, col) {
  return new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 56).rotateX(Math.PI / 2), BASIC(col || '#ffe27a', { transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
}
