// k07fx.js - crowds, light fields, the Sinai mountain, flowers, rising glow. Everything is a function of t only.
import { THREE, box, cyl, ball, toon, rng, clamp, lerp, ease, prog } from '../../lib/stage3d.js';
import { fbm, motes, glowSprite, sm, PI } from './k07lib.js';

export const kf = (t, k) => { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t < k[i][0]) return lerp(k[i - 1][1], k[i][1], sm((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]))); return k[k.length - 1][1]; };

const DUM = new THREE.Object3D();
// instanced simple modest figures (men and boys). o: seed,n,cx,cz,rx,rz,yaw|face,yAt,skip,minD
export function crowd(Wd, o) {
  const r = rng(o.seed || 9), n = o.n || 300, items = [];
  for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()), x = o.cx + Math.cos(a) * rr * o.rx, z = o.cz + Math.sin(a) * rr * o.rz; if (o.skip && o.skip(x, z)) { i--; continue; }
    items.push({ x, z, y: o.yAt ? o.yAt(x, z) : 0, s: r() < .25 ? .74 + r() * .06 : .9 + r() * .2, ph: r() * 6.28, coat: r(), skin: r(), boy: false }); }
  const bodyG = new THREE.CylinderGeometry(.2, .27, 1.2, 8); bodyG.translate(0, .6, 0); const headG = new THREE.SphereGeometry(.17, 8, 6); headG.translate(0, 1.37, 0);
  const hatG = new THREE.CylinderGeometry(.19, .19, .07, 8); hatG.translate(0, 1.52, 0); const shirtG = new THREE.CylinderGeometry(.1, .12, .5, 8); shirtG.translate(0, .95, .17);
  const mk = (geo, cf) => { const m = new THREE.InstancedMesh(geo, toon(0xffffff), n); m.frustumCulled = false; m.castShadow = false; items.forEach((it, i) => m.setColorAt(i, new THREE.Color(cf(it)))); Wd.add(m); return m; };
  const coats = ['#17171d', '#1f2430', '#2a2230', '#202a24', '#26262c', '#2d2420'], skins = ['#f4d8bc', '#f6dcc2', '#efcdb0', '#f8e0c8'];
  const mb = mk(bodyG, it => coats[Math.floor(it.coat * 6)]), mh = mk(headG, it => skins[Math.floor(it.skin * 4)]), mt = mk(hatG, () => '#101014'), ms = mk(shirtG, () => '#f4f0e8');
  const yawOf = it => o.face ? Math.atan2(o.face[0] - it.x, o.face[2] - it.z) : (o.yaw || 0);
  Wd.on(t => { items.forEach((it, i) => { const bob = Math.abs(Math.sin(t * 1.1 + it.ph)) * .02; DUM.position.set(it.x, it.y + bob, it.z); DUM.rotation.set(0, yawOf(it), .02 * Math.sin(t * .8 + it.ph)); DUM.scale.setScalar(it.s); DUM.updateMatrix();
      mb.setMatrixAt(i, DUM.matrix); mh.setMatrixAt(i, DUM.matrix); mt.setMatrixAt(i, DUM.matrix); ms.setMatrixAt(i, DUM.matrix); });
    for (const m of [mb, mh, mt, ms]) m.instanceMatrix.needsUpdate = true; });
  return items;
}
// a glowing point in every chest. pts [{x,y,z}], ign(i,t,p)->brightness 0..1.6
export function lightField(Wd, pts, ign, o) {
  o = o || {}; const m = motes(Wd, pts.length, { depthTest: false });
  Wd.on(t => { pts.forEach((p, i) => { const l = ign(i, t, p); if (l <= .01) { m.hide(i); return; } const k = Math.min(l, 1.7); m.set(i, p.x, p.y, p.z, (o.size || .8) * (.45 + .6 * k), 1 * k * .9, .78 * k * .85, .4 * k * .7); }); m.done(); });
  return m;
}
// the Sinai mountain in a cool peach dawn palette (no figure, no gold desert)
export function sinai(Wd, o) {
  const R = o.R || 150, H = o.H || 130, X = o.x || 0, Z = o.z || 0, seed = o.seed || 3, N = o.N || 130, size = R * 2.6;
  const hAt = (x, z) => { const u = x / R, v = z / R, r = Math.hypot(u * .85, v * 1.1), e = clamp(1 - r, 0, 1); let h = Math.pow(e, 1.12) * H;
    const r2 = Math.hypot((u + .42) * 1.5, (v - .12) * 1.6); h = Math.max(h, Math.pow(clamp(1 - r2, 0, 1), 1.2) * H * .62); const r3 = Math.hypot((u - .4) * 1.4, (v + .1) * 1.5); h = Math.max(h, Math.pow(clamp(1 - r3, 0, 1), 1.2) * H * .5);
    const n = fbm(x * .045 + seed, z * .045 + seed * 2), rid = 1 - Math.abs(2 * fbm(x * .09 + seed * 3, z * .09) - 1); h *= .8 + .32 * n; h += rid * H * .1 * Math.pow(clamp(h / H, 0, 1), .7); return Math.max(0, h); };
  const geo = new THREE.PlaneGeometry(size, size, N, N); geo.rotateX(-PI / 2); const p = geo.attributes.position, cols = new Float32Array(p.count * 3); let top = [0, 0, 0], hm = -1;
  const pal = [[.56, .72, .55], [.74, .57, .58], [.58, .50, .68], [.86, .72, .72]], plain = [.55, .72, .53];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = hAt(x, z); p.setY(i, y); if (y > hm) { hm = y; top = [x, y, z]; }
    const hn = clamp(y / H, 0, 1), n = fbm(x * .06 + 5, z * .06 + 9), band = Math.sin(y * .5 + n * 8) * .5 + .5, k = hn * 3, i0 = Math.min(2, Math.floor(k)), f = k - i0; let c = [0, 1, 2].map(j => lerp(pal[i0][j], pal[i0 + 1][j], f));
    const sh = .92 + .12 * band; c = c.map(v => v * sh); const ed = clamp(1 - y / 5, 0, 1); c = c.map((v, j) => lerp(v, plain[j], ed * .85)); cols[i * 3] = c[0]; cols[i * 3 + 1] = c[1]; cols[i * 3 + 2] = c[2]; }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, toon(0xffffff, { vertexColors: true, flatShading: true })); m.position.set(X, .02, Z); m.receiveShadow = true; Wd.add(m);
  return { mesh: m, hAt, top: [X + top[0], top[1], Z + top[2]], X, Z, R, H };
}
// soft mist sprites drifting around a mountain
export function mist(Wd, o) {
  const r = rng(o.seed || 4), S = [];
  for (let i = 0; i < (o.n || 16); i++) { const a = r() * 6.283, rho = o.R * (.5 + r() * .7), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowSprite(0xffffff, 1).material.map, color: 0xffdcd4, transparent: true, opacity: .2, depthWrite: false, fog: false }));
    s.userData = { a, rho, y: 6 + r() * o.H * .5, sz: 70 + r() * 110, ph: r() * 6 }; s.renderOrder = 4; Wd.add(s); S.push(s); }
  Wd.on(t => S.forEach(s => { const d = s.userData; s.position.set(o.x + Math.cos(d.a) * d.rho + 6 * Math.sin(t * .1 + d.ph), d.y + 2 * Math.sin(t * .13 + d.ph), o.z + Math.sin(d.a) * d.rho * .8); s.scale.set(d.sz * 1.6, d.sz * .7, 1); }));
}
// a column of warm glow with motes rising from a point (loaf / open sefer)
export function risingGlow(Wd, getPos, getL, o) {
  o = o || {}; const n = o.n || 14, h = o.h || 1.3, r0 = o.r || .1, rr = rng(o.seed || 3), ph = [], ax = [], az = [];
  for (let i = 0; i < n; i++) { ph.push(rr()); const a = rr() * 6.283; ax.push(Math.cos(a)); az.push(Math.sin(a)); }
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(r0 * 3, r0, h, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd58a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); Wd.add(cone);
  const m = motes(Wd, n, {});
  Wd.on(t => { const p = getPos(t), l = getL(t); cone.visible = l > .02; cone.position.set(p[0], p[1] + h / 2, p[2]); cone.material.opacity = .11 * Math.min(l, 1.2);
    for (let i = 0; i < n; i++) { if (l <= .02) { m.hide(i); continue; } const u = (t * .33 + ph[i]) % 1; m.set(i, p[0] + ax[i] * r0 * (1 + 2.4 * u) * (.5 + ph[i]), p[1] + u * h * 1.15, p[2] + az[i] * r0 * (1 + 2.4 * u) * (.5 + ph[i]), (o.size || .11) * (1 - .7 * u) * Math.min(l, 1.2), 1, .82, .45); }
    m.done(); });
}
// flowers: pts [{x,y,z}], bloom(t,p)->0..1
export function flowers(Wd, pts, bloom) {
  const n = pts.length, r = rng(77), sg = new THREE.CylinderGeometry(.012, .014, 1, 5); sg.translate(0, .5, 0); const hg = new THREE.SphereGeometry(1, 10, 8);
  const st = new THREE.InstancedMesh(sg, new THREE.MeshBasicMaterial({ color: 0x5d9a4a }), n), hd = new THREE.InstancedMesh(hg, toon(0xffffff), n), pal = ['#f48fb1', '#ffd84d', '#fff3e6', '#b59cf0', '#ff9a6a', '#f7c6e0'];
  pts.forEach((p, i) => { p.h = .22 + r() * .22; p.ry = r() * 6; hd.setColorAt(i, new THREE.Color(pal[i % 6])); }); st.frustumCulled = hd.frustumCulled = false; Wd.add(st); Wd.add(hd);
  Wd.on(t => { pts.forEach((p, i) => { const b = bloom(t, p), h = p.h * (.35 + .65 * b); DUM.position.set(p.x, p.y, p.z); DUM.rotation.set(0, p.ry, 0); DUM.scale.set(1, h, 1); DUM.updateMatrix(); st.setMatrixAt(i, DUM.matrix);
      DUM.position.set(p.x, p.y + h, p.z); DUM.scale.setScalar(.012 + .075 * b); DUM.updateMatrix(); hd.setMatrixAt(i, DUM.matrix); }); st.instanceMatrix.needsUpdate = hd.instanceMatrix.needsUpdate = true; });
}
