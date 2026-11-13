/* strips - the relief of the land sliced by two north-south cuts into three solid strips (coastal plain / hill spine / rift valley).
   Geometry is taken from the relief mesh columns, with side walls and a bottom, so each strip is a real solid block. ASCII only. */
import * as K from '../toldot10g_kit/kit10g.js';
import { makePlaque } from './props.js';
const { THREE } = K;

export function makeStrips(relief, lonCuts) {
  const geo = relief.land.geometry, P = geo.attributes.position, Co = geo.attributes.color;
  const NX = 240, NZ = 480, X0 = K.MAP.x0, DX = (K.MAP.x1 - K.MAP.x0) / NX;
  const bounds = [K.MAP.x0, K.xOf(lonCuts[0]), K.xOf(lonCuts[1]), K.MAP.x1];
  const root = new THREE.Group(), S = [], YB = 0.3;
  const treeGeo = new THREE.ConeGeometry(0.2, 0.62, 6).translate(0, 0.31, 0);
  const earthTop = [0.45, 0.32, 0.2], earthBot = [0.2, 0.14, 0.09];
  for (let s = 0; s < 3; s++) {
    const ia = Math.round((bounds[s] - X0) / DX), ib = Math.round((bounds[s + 1] - X0) / DX), nc = ib - ia + 1, nr = NZ + 1;
    const pos = [], col = [], idx = [];
    for (let iz = 0; iz < nr; iz++) for (let ix = ia; ix <= ib; ix++) { const v = iz * (NX + 1) + ix; pos.push(P.getX(v), P.getY(v), P.getZ(v)); col.push(Co.getX(v), Co.getY(v), Co.getZ(v)); }
    for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < nc - 1; ix++) { const a = iz * nc + ix, b = (iz + 1) * nc + ix, c = b + 1, d = a + 1; idx.push(a, b, d, b, c, d); }
    /* walls: list of top vertex indices along an edge, outward flag */
    const wall = (list, flip) => {
      const base = pos.length / 3;
      list.forEach(i => { pos.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); col.push(...earthTop.map((e, k) => e * 0.6 + col[i * 3 + k] * 0.4)); });
      list.forEach(i => { pos.push(pos[i * 3], YB, pos[i * 3 + 2]); col.push(...earthBot); });
      const n = list.length;
      for (let k = 0; k < n - 1; k++) { const t0 = base + k, t1 = base + k + 1, b0 = base + n + k, b1 = base + n + k + 1; if (!flip) idx.push(t0, b0, t1, t1, b0, b1); else idx.push(t0, t1, b0, t1, b1, b0); }
    };
    const west = [], east = [], north = [], south = [];
    for (let iz = 0; iz < nr; iz++) { west.push(iz * nc); east.push(iz * nc + nc - 1); }
    for (let ix = 0; ix < nc; ix++) { north.push(ix); south.push(NZ * nc + ix); }
    wall(west, false); wall(east, true); wall(north, true); wall(south, false);
    const xa = P.getX(ia), xb = P.getX(ib), zN = P.getZ(0), zS = P.getZ(NZ * (NX + 1));
    { const b = pos.length / 3; pos.push(xa, YB, zN, xb, YB, zN, xa, YB, zS, xb, YB, zS); for (let k = 0; k < 4; k++) col.push(...earthBot); idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
    const uE = { value: new THREE.Vector3(0, 0, 0) }, mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    mat.onBeforeCompile = sh => { sh.uniforms.uE = uE; sh.fragmentShader = 'uniform vec3 uE;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += uE;'); };
    const grp = new THREE.Group(); root.add(grp);
    const mesh = new THREE.Mesh(g, mat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false; grp.add(mesh);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, zS - zN).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ color: '#8fd8ee', transparent: true, opacity: 0.38, shininess: 120, specular: '#ffffff', depthWrite: false }));
    water.position.set((xa + xb) / 2, K.MAP.base - 0.38, (zN + zS) / 2); grp.add(water);
    const rt = K.rng(40 + s);
    grp.add(K.inst(treeGeo, K.lam('#ffffff'), 1500, (i, d, c) => {
      const lat = 29.6 + rt() * 3.8, lon = 34.2 + rt() * 1.7, sf = K.surf(lat, lon), x = K.xOf(lon);
      const want = (lat > 32.6 ? 0.9 : lat > 31.3 ? 0.55 : 0.04) * (sf.h > 120 && sf.h < 1300 ? 1 : 0.1);
      if (x < xa + 0.6 || x > xb - 0.6 || sf.sea > 0.1 || sf.lake || rt() > want || (sf.h > 650 && lat < 32.6)) return false;
      d.position.set(x, sf.y - 0.02, K.zOf(lat)); const sc = 0.8 + rt() * 0.9; d.scale.set(sc, sc, sc);
      return c.set(rt() < 0.5 ? '#36733a' : '#4b8a40').multiplyScalar(0.85 + rt() * 0.3);
    }));
    const xc = (xa + xb) / 2;
    const plaque = makePlaque(s + 1, 15); plaque.position.set(xc, 24, -18); grp.add(plaque);
    const halo = K.glowSprite(['#7dff8a', '#ffb15a', '#8feaff'][s], 90, 0); halo.position.set(xc, 6, -6); grp.add(halo);
    const o = { g: grp, uE, plaque, halo, xc, xa, xb };
    if (s === 1) {
      const j = K.pointOf(31.778, 35.235, 0); const pin = relief.pinMesh('#e0401e'); pin.scale.setScalar(0.6); pin.position.copy(j); grp.add(pin);
      const jh = K.glowSprite('#fff0a0', 22, 0); jh.position.set(j.x, j.y + 2.4, j.z); grp.add(jh); o.pin = pin; o.jer = jh; o.jerP = j;
    }
    S.push(o);
  }
  root.visible = false;
  return { root, S };
}
