/* shots_cd - s2c_torah (open book on a lectern, warm light falls on the land, gold outline) and s2d_strips (the land cut into three lengthwise strips). ASCII only. */
import * as P from './props.js';

export function shotC(ctx) {
  const { K, cam, relief } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  const lc = P.makeLectern(); lc.root.position.set(-70, 0, 30); lc.root.rotation.y = 0.5; grp.add(lc.root);
  const bookW = new THREE.Vector3(-70, 31, 33);
  const pg = K.glowSprite('#ffe4a0', 120, 0); pg.position.copy(bookW); grp.add(pg);
  const pg2 = K.glowSprite('#fff4d0', 40, 0); pg2.position.copy(bookW); grp.add(pg2);
  /* beams of warm light from the pages to the land */
  const target = new THREE.Vector3(-4, 6, 0), dir = target.clone().sub(bookW), L = dir.length(), beams = [[34, 4, 0.16], [22, 2, 0.14]].map(([rt, rb, op]) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, L, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe2a0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.position.copy(bookW).addScaledVector(dir, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()); grp.add(m); return { m, op }; });
  const NS = 70, sparks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: K.glowTex(), color: '#fff0b0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), NS);
  sparks.frustumCulled = false; grp.add(sparks); const d = new THREE.Object3D();
  const outline = P.makeGlowTube(P.toPts(P.outlineWps(), 1.0), 0.7, '#fff0a0', '#ffc43a'); grp.add(outline.group);
  [['lamp', 104, -56, 0], ['compass', 76, 66, 0.5], ['ink', 92, 18, 0]].forEach(([k, x, z, ry]) => { const o = k === 'lamp' ? K.makeLamp() : k === 'ink' ? K.makeInkwell() : K.makeBrassCompass(); o.position.set(x, 0, z); o.rotation.y = ry; grp.add(o); });
  const rig = K.camRig(cam, [
    { t: 0, p: [-44, 62, 132], l: [-34, 22, 14], fov: 36 }, { t: 3.4, p: [-18, 72, 124], l: [-12, 14, 4], fov: 36 }, { t: 7.49, p: [18, 104, 128], l: [-2, 2, -4], fov: 36 }]);
  return {
    id: 's2c_torah', t0: 34.29, t1: 41.78, grp, env: 'room', relief: true, sun: [0, 20, 0, -90, 85, 95, 150],
    tipa: lt => ({ expr: lt < 3.5 ? 'curious' : 'happy', arms: lt > 4 ? 'up' : 'down' }),
    upd(lt, t) {
      rig(lt);
      const e = K.sm(K.lin(lt, 0.3, 1.4)), fl = 0.85 + 0.15 * Math.sin(t * 5);
      pg.material.opacity = 0.35 * e * fl; pg2.material.opacity = 0.4 * e; beams.forEach(b => { b.m.material.opacity = b.op * e * fl; });
      lc.book.position.y = 1.0 + 0.5 * Math.sin(t * 1.7) * e;
      outline.set(K.sm(K.lin(lt, 0.9, 5.2)), 1);
      relief.setSpot(31.6, 35.0, 90); relief.setGlow(0, 0, 0, 0.75 * K.sm(K.lin(lt, 0.8, 2.4)));
      for (let i = 0; i < NS; i++) {
        const a = K.hash(i * 5 + 1), b = K.hash(i * 5 + 2), c = K.hash(i * 5 + 3), u = (t * (0.18 + 0.2 * c) + a) % 1;
        d.position.set(bookW.x + (b - 0.5) * 60 + u * 40 * (c - 0.3), bookW.y - 14 + u * 44, bookW.z + (a - 0.5) * 30); d.quaternion.copy(cam.quaternion);
        const s = (0.8 + 1.8 * c) * Math.sin(Math.PI * u) * e; d.scale.set(Math.max(0.001, s), Math.max(0.001, s), 1); d.updateMatrix(); sparks.setMatrixAt(i, d.matrix);
      }
      sparks.instanceMatrix.needsUpdate = true;
    }
  };
}

export function shotD(ctx) {
  const { K, cam, strips } = ctx, { THREE } = K;
  const grp = new THREE.Group(), S = strips.S, GAP = 17;
  const COL = [[0.25, 0.95, 0.35], [1.0, 0.62, 0.2], [0.3, 0.85, 1.0]];
  [['lamp', 108, -60, 0], ['compass', -92, 70, 0.9], ['ink', -96, -30, 0], ['book', 98, 56, -0.6], ['pencil', 88, -4, 0.3]].forEach(([k, x, z, ry]) => {
    const o = k === 'lamp' ? K.makeLamp() : k === 'ink' ? K.makeInkwell() : k === 'book' ? K.makeBookOpen() : k === 'pencil' ? K.makePencil() : K.makeBrassCompass(); o.position.set(x, 0, z); o.rotation.y = ry; grp.add(o); });
  const rig = K.camRig(cam, [
    { t: 0, p: [0, 150, 214], l: [0, 0, -6], fov: 38 }, { t: 3.6, p: [-52, 96, 150], l: [0, 2, -4], fov: 36 }, { t: 7.6, p: [-70, 66, 96], l: [-14, 2, 8], fov: 36 },
    { t: 12.8, p: [-30, 44, 54], l: [4, 4, -6], fov: 36 }, { t: 14.6, p: [16, 46, 38], l: [6, 6, -12], fov: 36 }, { t: 18.3, p: [52, 52, 44], l: [18, 2, -2], fov: 36 },
    { t: 22.0, p: [40, 96, 120], l: [8, 0, -4], fov: 36 }, { t: 25.75, p: [0, 150, 205], l: [0, 0, -6], fov: 38 }]);
  const LT = [8.0, 13.3, 18.8], DUR = [5.0, 5.0, 3.7];
  return {
    id: 's2d_strips', t0: 41.78, t1: 67.53, grp, hero: strips.root, env: 'room', relief: false, sun: [0, 0, 0, -95, 80, -70, 150],
    tipa: lt => ({ expr: lt < 7.8 ? 'curious' : lt < 18.5 ? 'happy' : 'surprised', arms: lt > 18.6 && lt < 23 ? 'up' : 'down' }),
    upd(lt, t) {
      rig(lt); strips.root.visible = true;
      const open = K.sm(K.lin(lt, 0.5, 3.6)) * (1 - K.sm(K.lin(lt, 22.4, 25.2)));
      S.forEach((s, i) => {
        const e = K.sm(K.lin(lt, LT[i], LT[i] + 0.7)) * (1 - 0.75 * K.sm(K.lin(lt, LT[i] + DUR[i], LT[i] + DUR[i] + 0.8))) * (1 - K.sm(K.lin(lt, 22.4, 24.6)));
        const pl = 0.8 + 0.2 * Math.sin(t * 5 + i);
        s.g.position.set((i - 1) * GAP * open, 4.5 * e, 0);
        s.uE.value.set(COL[i][0] * e * pl * 0.28, COL[i][1] * e * pl * 0.28, COL[i][2] * e * pl * 0.28);
        const pp = K.back(K.clamp((lt - (LT[i] - 0.3)) / 0.6)) * (1 - K.sm(K.lin(lt, 22.4, 24.0)));
        s.plaque.scale.set(Math.max(0.001, 15 * pp), Math.max(0.001, 15 * pp), 1); s.plaque.position.y = 24 + 1.2 * Math.sin(t * 2 + i);
        s.halo.material.opacity = 0.5 * e * pl;
        if (s.jer) { const je = K.sm(K.lin(lt, LT[1] + 0.4, LT[1] + 1.2)) * (1 - K.sm(K.lin(lt, 22.4, 24.0))); s.jer.material.opacity = 0.95 * je * (0.7 + 0.3 * Math.sin(t * 8)); s.jer.scale.setScalar(22 * (1 + 0.25 * Math.sin(t * 8)) * Math.max(0.001, je)); s.jer.visible = je > 0.01; }
      });
    }
  };
}
