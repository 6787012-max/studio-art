/* film_s3 table shots: B (five landform dioramas), C (flight over the real LAND), D (physical colours + legend), Q (quiz 2), E (quiz: raised table lands on the Golan). ASCII only. */
import * as THREE from 'three';
import * as K from '../kit10g.js';
import { camPath, BASIC, makeCrown, ctex, glowRing } from './common.js';
import { makeForm } from './forms.js';
const { cl, ramp, pop, C, hash2, sm, rng, lam, phong, mapY, ll } = K;
const flatRing = (r, tube, col) => glowRing(r, tube, col);
const onMap = (x, z, lift) => [x, mapY(x, z) + (lift || 0), z];

/* ============================================================ B: five landforms rise from the table */
export function buildB(cam) {
  const grp = new THREE.Group(), kinds = ['har', 'reches', 'emek', 'mishor', 'rama'], XS = [-36, -18, 0, 18, 36], RT = [0.7, 3.9, 7.3, 10.5, 14.0];
  const mat0 = new THREE.Mesh(new THREE.BoxGeometry(116, 0.3, 46), lam('#7fb157', { map: K.noiseTex(77, 14, 6) })); mat0.position.set(0, -1.4, 0); mat0.receiveShadow = true; grp.add(mat0);
  const rg0 = rng(21); grp.add(K.tufts(900, 3, () => [(rg0() - 0.5) * 112, -1.2, (rg0() - 0.5) * 42], ['#6f9d4a', '#86b257', '#9cc56a', '#e8c97c'], 0.4, 1.0));
  const forms = kinds.map((k, i) => { const f = makeForm(k, 3 + i); f.grp.position.x = XS[i]; grp.add(f.grp); return f; });
  const KEYS = [[0, [-36, 22, 44], [-30, 3, 0]], [4.5, [-20, 21, 42], [-14, 3, 0]], [8.5, [-4, 22, 43], [4, 3.5, 0]], [11.5, [14, 22, 42], [20, 3.5, 0]], [14.6, [34, 24, 46], [34, 5, 0]], [17, [2, 35, 73], [0, 3, 0]], [21.2, [0, 34, 70], [0, 3, 0]]];
  const upd = lt => {
    const c = camPath(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    const gl = forms.map((f, i) => cl((lt - RT[i]) / 0.5) * (1 - cl((lt - RT[i] - 2.6) / 0.6)));
    const any = Math.max(...gl);
    forms.forEach((f, i) => { f.rise((lt - RT[i]) / 0.9); f.look(0.9 * any * (1 - gl[i]), gl[i], lt); });
  };
  const tipa = lt => ({ side: 1, xf: 0.78, size: 0.2, expr: lt < 0.7 ? 'neutral' : lt < 14 ? 'curious' : 'cheering', arms: lt < 0.7 ? 'down' : 'point', hop: 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, table: true, sun: { t: [0, 0, 0], ext: 95 }, ev: RT.map(t => [t, 'pop']).concat([[0.4, 'whoosh']]) };
}

/* ============================================================ C: fast flight over the real LAND */
export function buildC(cam) {
  const grp = new THREE.Group(), P = (la, lo) => ll(la, lo);
  const hx = P(33.41, 35.86), pinH = K.makePin('#f5f5f5'); pinH.userData.k = 1.35; pinH.position.set(hx[0], mapY(hx[0], hx[1]) + 0.05, hx[1]);
  const crown = makeCrown(1.2); crown.position.y = 5.4; pinH.add(crown); grp.add(pinH);
  const ring = (la, lo, rx, rz, col) => { const p = P(la, lo), r = flatRing(1, 0.1, col); r.position.set(p[0], mapY(p[0], p[1]) + 0.55, p[1]); r.userData.s = [rx, rz]; grp.add(r); return r; };
  const rH = ring(33.41, 35.86, 3.6, 3.6, '#fff2a0'), rG = ring(32.9, 35.78, 4.4, 6.2, '#ffe27a'), rJ = ring(32.58, 35.28, 5.2, 3.2, '#9cff7a'), rC = ring(32.2, 34.86, 2.4, 6.0, '#ffb04a');
  const jp = [[33.15, 35.62], [32.95, 35.63], [32.86, 35.60], [32.70, 35.57], [32.45, 35.56], [32.15, 35.54], [31.95, 35.54], [31.80, 35.51], [31.55, 35.47], [31.25, 35.45]].map(([a, b]) => { const p = P(a, b); return [p[0], mapY(p[0], p[1]) + 0.55, p[1]]; });
  const jline = K.makeThickLine(jp, 0.3, BASIC('#8fe8ff')); grp.add(jline);
  const KEYS = [[0, [-6, 30, -26], [12, 2, -28]], [3.5, [-6, 28, -30], [13.2, 3, -32]], [7.4, [-14, 36, -22], [12, 2, -24]], [11, [-26, 27, -16], [4.6, 1, -18]], [13.8, [-30, 26, -6], [0, 0, -8]], [17.5, [-28, 26, -10], [8.5, 0, -8]], [22.5, [-28, 24, 2], [8.5, 0, 2]], [26.8, [-26, 24, 14], [8.5, 0, 14]]];
  const pulse = (r, u, lt, hold) => { const k = pop(u); r.visible = u > 0; r.scale.set(r.userData.s[0] * k * (1 + 0.05 * Math.sin(lt * 5)), 1, r.userData.s[1] * k * (1 + 0.05 * Math.sin(lt * 5))); r.material.opacity = 0.95 * (hold == null ? 1 : hold); };
  const upd = lt => {
    const c = camPath(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    pinH.userData.pop(cl((lt - 0.4) / 0.6)); pinH.userData.glow(ramp(lt, 1.2, 2.0) * (0.7 + 0.3 * Math.sin(lt * 5))); crown.rotation.y = lt * 1.2;
    pulse(rH, (lt - 1.4) / 0.6, lt, 1 - ramp(lt, 7.0, 7.6)); pulse(rG, (lt - 6.4) / 0.6, lt, 1 - ramp(lt, 8.0, 8.6));
    pulse(rJ, (lt - 8.7) / 0.6, lt, 1 - ramp(lt, 11.5, 12.1)); pulse(rC, (lt - 12.2) / 0.6, lt, 1 - ramp(lt, 14.6, 15.2));
    jline.userData.setU(ramp(lt, 16.0, 24.0));
  };
  const tipa = lt => ({ side: -1, xf: 0.78, size: 0.2, expr: lt < 15.2 ? 'surprised' : 'curious', arms: lt < 15.2 ? 'up' : 'point', hop: 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, table: true, map: true, sun: { t: [0, 0, 0], ext: 80 }, ev: [[0.35, 'whoosh'], [4.6, 'pop'], [6.4, 'pop'], [8.7, 'pop'], [12.2, 'pop'], [15.6, 'whoosh'], [16.0, 'pop']] };
}

/* ============================================================ D: recolour by height + legend bar + slider */
export function buildD(cam, MAP) {
  const grp = new THREE.Group();
  const meshes = [MAP.north.children[0], MAP.south.children[0]], trees = [];
  [MAP.north, MAP.south].forEach(h => h.children.forEach(o => { if (o.isInstancedMesh) trees.push(o); }));
  const snaps = meshes.map(m => Float32Array.from(m.geometry.attributes.color.array));
  const STOPS = [[0.0, '#4f9a45'], [0.5, '#7fb84f'], [1.1, '#c3cf58'], [1.8, '#ecd05a'], [2.5, '#d59a4a'], [3.3, '#a8703c'], [4.3, '#7a4a2a']].map(([h, c]) => [h, C(c)]);
  const tmp = C('#ffffff'), hot = C('#ffffff');
  const phys = (y, out) => { let i = 0; while (i < STOPS.length - 2 && y > STOPS[i + 1][0]) i++; const a = STOPS[i], b = STOPS[i + 1]; out.copy(a[1]).lerp(b[1], cl((y - a[0]) / (b[0] - a[0]))); };
  let dirty = false, lastKey = '';
  function apply(u, band) {
    const key = u.toFixed(3) + '|' + band.toFixed(3); if (key === lastKey) return; lastKey = key; dirty = true;
    meshes.forEach((m, k) => {
      const pos = m.geometry.attributes.position, col = m.geometry.attributes.color, a = col.array, s = snaps[k], n = pos.count;
      for (let i = 0; i < n; i++) {
        const y = pos.getY(i), j = i * 3;
        if (y < 0.35) { a[j] = s[j]; a[j + 1] = s[j + 1]; a[j + 2] = s[j + 2]; continue; }
        phys(y, tmp); const wb = band < 0 ? 0 : cl(1 - Math.abs(y - band) / 0.5);
        if (wb > 0) tmp.lerp(hot, wb);
        a[j] = s[j] + (tmp.r - s[j]) * u; a[j + 1] = s[j + 1] + (tmp.g - s[j + 1]) * u; a[j + 2] = s[j + 2] + (tmp.b - s[j + 2]) * u;
      }
      col.needsUpdate = true;
    });
    trees.forEach(t => { t.visible = u < 0.5; });
  }
  function restore() { if (!dirty) return; dirty = false; lastKey = ''; meshes.forEach((m, k) => { m.geometry.attributes.color.array.set(snaps[k]); m.geometry.attributes.color.needsUpdate = true; }); trees.forEach(t => { t.visible = true; }); }
  /* legend */
  const BH = 11.2, BY0 = -0.6, yOf = h => BY0 + h / 4.3 * BH;
  const leg = new THREE.Group(); leg.position.set(-2, 0, 44.5); leg.rotation.y = -Math.PI / 2 + 0.2; leg.scale.setScalar(2.2); grp.add(leg);
  const wood = lam('#8a5a30', { map: K.woodTex(3, 2, 2) });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(4.6, BH + 1.6, 0.8), wood); frame.position.y = BY0 + BH / 2; frame.castShadow = true; leg.add(frame);
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(3.2, BH), new THREE.MeshBasicMaterial({ map: ctex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); STOPS.forEach(([hh, c]) => gr.addColorStop(hh / 4.3, '#' + c.getHexString())); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) }));
  bar.position.set(0, BY0 + BH / 2, 0.42); leg.add(bar);
  const ptr = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.6, 3).rotateZ(-Math.PI / 2), BASIC('#e0301e')); leg.add(ptr);
  const bandQ = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 0.2), BASIC('#fff6c0', { transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); bandQ.position.z = 0.55; leg.add(bandQ);
  for (let i = 0; i <= 4; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.1), BASIC('#3a2a18')); tk.position.set(-2.0, yOf(i * 1.075), 0.45); leg.add(tk); }
  const KEYS = [[0, [-40, 63, 13], [0, 0, 13]], [4.5, [-38, 61, 12], [1, 0, 13]], [9, [-36, 59, 11], [2, 0, 14]]];
  const upd = lt => {
    const c = camPath(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    const u = ramp(lt, 0.4, 2.6), hS = 0.15 + 4.0 * ramp(lt, 2.8, 8.0), sl = lt > 2.6;
    apply(u, sl ? hS : -1);
    const lu = (lt - 0.2) / 0.6; leg.visible = lu > 0; leg.scale.setScalar(2.2 * pop(lu));
    ptr.visible = bandQ.visible = sl; ptr.position.set(-2.9, yOf(hS), 0.6); bandQ.position.y = yOf(hS);
  };
  const tipa = lt => ({ side: -1, xf: 0.8, size: 0.2, expr: lt < 2.6 ? 'surprised' : 'happy', arms: lt < 2.6 ? 'up' : 'point', hop: 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, table: true, map: true, restore, sun: { t: [0, 0, 0], ext: 85 }, ev: [[0.35, 'pop'], [2.8, 'whoosh']] };
}

/* ============================================================ Q: quiz 2, three mountain pins, question ring over the tallest */
export function buildQ(cam) {
  const grp = new THREE.Group(), specs = [[32.74, 35.0, '#2f6fd0', 1.1], [31.78, 35.2, '#e0401e', 1.9], [33.41, 35.86, '#1fa05a', 3.0]];
  const pins = specs.map(([la, lo, col, k]) => { const p = ll(la, lo), pn = K.makePin(col); pn.userData.k = k; pn.position.set(p[0], mapY(p[0], p[1]) + 0.05, p[1]); grp.add(pn); return pn; });
  const hp = ll(33.41, 35.86), top = mapY(hp[0], hp[1]) + 0.05 + 4.7 * 3.0;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.3, 10, 48), BASIC('#ffd24a')); ring.position.set(hp[0], top + 2.6, hp[1]); grp.add(ring);
  const crown = makeCrown(1.0); crown.position.y = 4.7 + 1.1; pins[2].add(crown);
  const ans = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), BASIC('#ffffff', { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); ans.position.y = 3.7; pins[2].add(ans);
  const snow = new THREE.Mesh(new THREE.ConeGeometry(3.2, 3.0, 20), BASIC('#ffffff', { transparent: true, opacity: 0 })); snow.position.set(hp[0], mapY(hp[0], hp[1]) + 0.9, hp[1]); grp.add(snow);
  const KEYS = [[0, [-36, 50, -20], [10, 2, -20]], [8.3, [-34, 48, -20], [10, 3, -20]]];
  const upd = lt => {
    const c = camPath(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    pins.forEach((p, i) => p.userData.pop(cl((lt - (0.5 + 0.7 * i)) / 0.7)));
    const ru = (lt - 2.6) / 0.5, an = lt >= 5.63, cd = lt >= 5.33;
    ring.visible = ru > 0 && !an; ring.scale.setScalar(pop(ru) * (1 + 0.1 * Math.sin(lt * (cd ? 10 : 4))));
    ring.position.y = top + 2.6 + 0.3 * Math.sin(lt * 3);
    const a = ramp(lt, 5.63, 6.1); crown.visible = a > 0; crown.scale.setScalar(pop((lt - 5.63) / 0.6)); crown.rotation.y = lt * 2;
    pins[2].children[1].material.color.set(a > 0.5 ? '#ffffff' : '#1fa05a'); pins[2].userData.glow(a * (0.8 + 0.2 * Math.sin(lt * 8)));
    ans.material.opacity = 0.45 * a; ans.scale.setScalar(0.4 + 0.3 * a + 0.04 * Math.sin(lt * 8));
    snow.material.opacity = 0.0;
  };
  const tipa = lt => ({ side: 1, xf: 0.8, size: 0.2, expr: lt < 2.6 ? 'neutral' : lt < 5.63 ? 'curious' : 'cheering', arms: lt < 5.63 ? 'down' : 'up', hop: lt > 5.63 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, table: true, map: true, sun: { t: [0, 0, 0], ext: 85 }, ev: [[0.5, 'pop'], [1.2, 'pop'], [1.9, 'pop'], [2.6, 'pop'], [3.55, 'tick'], [4.55, 'tick'], [5.55, 'tick'], [5.63, 'ding']] };
}

/* ============================================================ E: the raised table lifts and settles on the Golan, then the sky changes */
export function buildE(cam, MAP) {
  const grp = new THREE.Group(), ZF = 54, XH = -10, XR = 10;
  const mat0 = new THREE.Mesh(new THREE.BoxGeometry(64, 0.3, 40), lam('#7fb157', { map: K.noiseTex(79, 8, 6) })); mat0.position.set(0, -1.4, ZF + 2); mat0.receiveShadow = true; grp.add(mat0);
  const rg0 = rng(23); grp.add(K.tufts(500, 3, () => [(rg0() - 0.5) * 60, -1.2, ZF + 2 + (rg0() - 0.5) * 36], ['#6f9d4a', '#86b257', '#9cc56a', '#e8c97c'], 0.4, 1.0));
  const har = makeForm('har', 4), rama = makeForm('rama', 8);
  har.grp.position.set(XH, 0, ZF); rama.grp.position.set(XR, 0, ZF); grp.add(har.grp, rama.grp); har.rise(1); rama.rise(1);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(21, 0.4, 10, 64).rotateX(Math.PI / 2), BASIC('#ffd24a', { transparent: true, opacity: 0.95 })); ring.scale.set(1, 1, 0.52); ring.position.set(0, -1.2, ZF + 1); grp.add(ring);
  const gp = ll(32.9, 35.78), gy = mapY(gp[0], gp[1]) + 0.1;
  const A0 = [0, 0, 0], A1 = [gp[0] - XR, gy, gp[1] - ZF];
  const landRing = glowRing(1, 0.12, '#ffe27a'); landRing.position.set(gp[0], gy + 0.5, gp[1]); landRing.scale.set(4.4, 1, 6.2); grp.add(landRing);
  /* weather: clouds in the north, strong sun in the south, rain under the north clouds */
  const cs = [[2, -32, 1.1], [10, -36, 1.3], [16, -28, 1.0], [-4, -24, 0.9]].map(([x, z, s], i) => { const c = K.makeCloud({ scale: s }); c.position.set(x, 13 + (i % 2) * 1.5, z); c.userData.s = s; c.userData.t = 12.4 + 0.45 * i; grp.add(c); return c; });
  const sunG = new THREE.Group(); sunG.position.set(6, 12, 30);
  sunG.add(new THREE.Mesh(new THREE.SphereGeometry(3.2, 20, 14), BASIC('#ffd23a')));
  sunG.add(new THREE.Mesh(new THREE.SphereGeometry(5.6, 20, 14), BASIC('#ffe27a', { transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })));
  const rays = []; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, rm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 0.3), BASIC('#ffd23a')); rm.position.set(Math.sin(a) * 6.6, Math.cos(a) * 6.6, 0); rm.rotation.z = -a; sunG.add(rm); rays.push(rm); }
  grp.add(sunG);
  const rain = K.makeRain(320, 1.0, 9, (tb, i, k) => { const c = cs[i % 4], p = c.position; return { x: p.x + (hash2(i, k) - 0.5) * 7, y: p.y - 1.2, z: p.z + (hash2(i * 3, k) - 0.5) * 6, p: 0.7 * ramp(tb, 16.5, 19) }; }, (x, z) => Math.max(0, mapY(x, z)));
  grp.add(rain);
  const KEYS = [[0, [0, 26, 90], [0, 4, 52]], [7.4, [3, 29, 86], [0, 5, 50]], [9.2, [22, 44, 88], [6, 6, 20]], [11.6, [21, 15, -7], [12, 3, -25]], [15, [-40, 30, 20], [4, 2, -6]], [20, [-54, 26, 12], [3, 2, 0]], [25, [-55, 26, 13], [3, 2, 2]]];
  const upd = lt => {
    const c = camPath(lt, KEYS); cam.position.set(...c.p); cam.lookAt(...c.l);
    const ru = (lt - 2.4) / 0.5, an = lt >= 7.87;
    ring.visible = ru > 0 && !an; ring.scale.set(pop(ru), 1, 0.52 * pop(ru)); ring.material.opacity = 0.7 + 0.25 * Math.sin(lt * (lt > 7.3 ? 10 : 4));
    har.look(0, 0, lt); rama.look(0, 0.9 * ramp(lt, 7.3, 7.87) * (1 - ramp(lt, 11.7, 12.4)), lt);
    const e = ramp(lt, 7.9, 11.6), m = rama.model, s = 1 - 0.5 * e;
    m.position.set(A0[0] + (A1[0] - A0[0]) * e, -0.35 + (A1[1] + 0.35) * e + 30 * Math.sin(Math.PI * e) + (lt > 11.6 ? 0.6 * Math.exp(-(lt - 11.6) * 5) * Math.sin((lt - 11.6) * 24) : 0), A0[2] + (A1[2] - A0[2]) * e);
    m.rotation.y = 0.8 * Math.sin(Math.PI * e); m.scale.set(s, s * (lt > 11.6 ? 1 - 0.06 * Math.exp(-(lt - 11.6) * 6) * Math.sin((lt - 11.6) * 30) : 1), s);
    landRing.visible = lt > 8.4 && lt < 13; landRing.material.opacity = 0.9 * ramp(lt, 8.4, 9.4) * (1 - ramp(lt, 11.8, 12.8)) * (0.6 + 0.4 * Math.sin(lt * 8));
    cs.forEach(cd => { const u = (lt - cd.userData.t) / 0.7; cd.visible = u > 0; cd.scale.setScalar(cd.userData.s * pop(u)); cd.userData.setTone(0.8 * ramp(lt, cd.userData.t + 0.7, cd.userData.t + 3.5)); });
    const su = (lt - 13.2) / 0.7; sunG.visible = su > 0; sunG.scale.setScalar(pop(su) * (1 + 0.04 * Math.sin(lt * 3)));
    rays.forEach((r, k) => { r.scale.y = 1 + 0.25 * Math.sin(lt * 4 + k); });
    sunG.lookAt(cam.position);
    rain.userData.update(lt);
  };
  const tipa = lt => ({ side: 1, xf: 0.8, size: 0.2, expr: lt < 2.4 ? 'neutral' : lt < 7.87 ? 'curious' : lt < 12 ? 'surprised' : 'cheering', arms: lt < 7.87 ? 'down' : lt < 12 ? 'up' : 'point', hop: lt > 11.6 ? 0.5 : 0, show: cl((lt - 0.2) / 0.5) });
  return { grp, upd, tipa, table: true, map: true, sun: lt => ({ t: [0, 0, lt < 8 ? 40 : 0], ext: lt < 8 ? 70 : 100 }), ev: [[0.35, 'pop'], [2.4, 'pop'], [4.9, 'tick'], [5.9, 'tick'], [6.9, 'tick'], [7.87, 'ding'], [8.3, 'whoosh'], [11.6, 'pop'], [12.4, 'pop'], [13.2, 'pop']] };
}
