/* shots_xqe - s1x_kinds (three framed maps on easels), s1q_quiz2 (compass rose, north), s1e_quiz (colour chips, brown flies to the mountains).
   ASCII only. No people, no text. Top-centre of the frame stays free while the quiz countdown runs (SHOTLIST marks it). */

export function shotX(ctx) {
  const { K, cam } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  const wood = K.lam('#6b4020', { map: K.woodTex(71, 2, 1) }), frameW = K.lam('#4a2c15', { map: K.woodTex(72, 2, 3) }), gold = K.phong('#c9a24a', { shininess: 80, specular: '#ffeeb0' });
  const kinds = ['physical', 'political', 'rain'], XS = [-46, 0, 46];
  const items = kinds.map((kind, i) => {
    const root = new THREE.Group(); root.position.set(XS[i], 0, -6); root.rotation.y = (1 - i) * 0.12; grp.add(root);
    const lift = new THREE.Group(); root.add(lift);
    [[-14, -0.1], [14, -0.1]].forEach(([x, rx]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(1.7, 66, 1.7), wood); l.position.set(x, 33, 3); l.rotation.x = rx; lift.add(K.shadowable(l)); });
    const bl = new THREE.Mesh(new THREE.BoxGeometry(1.7, 60, 1.7), wood); bl.position.set(0, 30, -9); bl.rotation.x = 0.34; lift.add(K.shadowable(bl));
    const cb = new THREE.Mesh(new THREE.BoxGeometry(34, 2.2, 2.6), wood); cb.position.set(0, 9, 3.4); lift.add(K.shadowable(cb));
    const tb = new THREE.Mesh(new THREE.BoxGeometry(34, 2.2, 2.2), wood); tb.position.set(0, 60, 0.4); lift.add(K.shadowable(tb));
    const fr = new THREE.Group(); fr.position.set(0, 34, 4.4); fr.rotation.x = -0.1; lift.add(fr);
    const fb = new THREE.Mesh(new THREE.BoxGeometry(31, 53, 2.2), frameW); fb.castShadow = true; fr.add(fb);
    [[-15.8, 0, 1.2, 53], [15.8, 0, 1.2, 53], [0, 26.8, 31, 1.2], [0, -26.8, 31, 1.2]].forEach(([x, y, sx, sy]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, 0.5), gold); b.position.set(x, y, 1.2); fr.add(b); });
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(27, 49), K.lam('#f2e8cf')); mat.position.z = 1.15; fr.add(mat);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(23.5, 47), new THREE.MeshLambertMaterial({ map: K.ctex(K.landCanvas(kind, 300, 600)) })); pic.position.z = 1.2; pic.receiveShadow = true; fr.add(pic);
    const halo = K.glowSprite('#ffe6a0', 70, 0); halo.position.z = -1.5; fr.add(halo);
    return { root, lift, fr, halo, kind, pic, mat };
  });
  /* extras: pins on the political frame, a blue drop and falling rain on the thematic one, rock samples on the physical one */
  const polFr = items[1].fr, pins = ['jerusalem', 'jaffa', 'haifa', 'beerSheva', 'tiberias', 'eilat'].map((n, k) => { const [la, lo] = K.PLACES[n];
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 10), K.phong('#d8342a', { shininess: 90, specular: '#ffffff' })); s.position.set((lo - 34.1) / 1.9 * 23.5 - 11.75, (la - 29.4) / 4.1 * 47 - 23.5, 2.3); polFr.add(s); return s; });
  const dropG = new THREE.Group(); const dp = []; for (let k = 0; k <= 20; k++) { const u = k / 20; dp.push(new THREE.Vector2(Math.sin(Math.PI * u) * (1 - 0.55 * u) * 3.0 * (u > 0.5 ? 1 : 1), 8 * (1 - u) ** 0.9 * 0 + (1 - u) * 6.4 - 0.0)); }
  const dropProfile = [[0, 0], [1.1, 0.5], [2.0, 1.6], [2.4, 3.0], [2.1, 4.4], [1.3, 5.8], [0.6, 7.2], [0, 8.6]].map(([r, y]) => new THREE.Vector2(r, y)); void dp;
  const drop = new THREE.Mesh(new THREE.LatheGeometry(dropProfile, 22), new THREE.MeshPhongMaterial({ color: '#3a86e8', shininess: 120, specular: '#ffffff', emissive: '#0a2a66' })); dropG.add(K.shadowable(drop));
  dropG.position.set(11.5, -17, 3.2); dropG.scale.setScalar(0.9); items[2].fr.add(dropG);
  const NR = 40, rain = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 5), new THREE.MeshBasicMaterial({ color: '#7fc4ff', transparent: true, opacity: 0.8 }), NR); rain.frustumCulled = false; items[2].root.add(rain);
  const rk = K.rocks(10, 21, r => [-3 + r() * 6, 0, 24 + r() * 6], '#b99a7a', 0.7, 2.4); items[0].root.add(rk);
  const lamp = K.makeLamp(); lamp.position.set(-100, 0, -36); grp.add(lamp); const globe = K.makeGlobe(); globe.position.set(104, 0, -30); grp.add(globe);
  const book = K.makeBookOpen(); book.position.set(-84, 0, 40); book.rotation.y = 0.6; grp.add(book); const ink = K.makeInkwell(); ink.position.set(86, 0, 36); grp.add(ink);
  const rig = K.camRig(cam, [{ t: 0, p: [0, 50, 170], l: [0, 30, 0], fov: 36 }, { t: 3.2, p: [-30, 44, 124], l: [-42, 30, 0], fov: 36 }, { t: 8.4, p: [0, 44, 124], l: [0, 30, 0], fov: 36 },
    { t: 15.2, p: [30, 44, 124], l: [42, 30, 0], fov: 36 }, { t: 20.9, p: [4, 48, 156], l: [0, 29, 0], fov: 36 }]);
  const B = [0.35, 7.17, 14.43];
  const d = new THREE.Object3D();
  return {
    id: 's1x_kinds', t0: 84.87, t1: 105.8, grp, env: 'room', relief: false, sun: [0, 20, 0, -90, 85, 95, 150],
    tipa: lt => ({ x: -16, y: 0, z: 40, expr: lt < 7 ? 'happy' : lt < 14.4 ? 'curious' : 'surprised', arms: 'down' }),
    upd(lt, t) {
      rig(lt);
      items.forEach((it, i) => {
        const e = K.sm((lt - B[i]) / 0.9) - (i < 2 ? K.sm((lt - B[i + 1]) / 0.9) : 0), pp = K.back(K.clamp((lt - B[i]) / 0.9));
        const ec = K.clamp(e); void pp; it.lift.position.z = -5 + 20 * ec; it.lift.position.y = 0; it.root.scale.setScalar(0.95 + 0.14 * ec); it.pic.material.color.setScalar(0.62 + 0.38 * ec); it.mat.material.color.setScalar(0.65 + 0.35 * ec); it.halo.material.opacity = 0.55 * K.clamp(e);
      });
      pins.forEach((s, k) => { const e = K.clamp((lt - (7.6 + 0.35 * k)) / 0.5); s.scale.setScalar(Math.max(0.001, K.back(e))); s.visible = e > 0; });
      const de = K.clamp((lt - 14.6) / 0.7); dropG.scale.setScalar(Math.max(0.001, K.back(de)) * 0.9); dropG.position.y = -17 + 0.8 * Math.sin(t * 2.4); dropG.visible = de > 0;
      for (let i = 0; i < NR; i++) { const a = K.hash(i * 5 + 1), b = K.hash(i * 5 + 2), sp = 14 + 10 * K.hash(i * 5 + 3), y = 70 - ((t * sp + a * 70) % 70);
        d.position.set((a - 0.5) * 30, y - 10, 12 + b * 14); d.scale.set(1, K.clamp((lt - 14.6) / 0.6) * (y > 8 ? 1 : 0.001) + 0.0001, 1); d.updateMatrix(); rain.setMatrixAt(i, d.matrix); }
      rain.instanceMatrix.needsUpdate = true;
    }
  };
}

function roseOnRelief(K, relief, THREE, R) {
  const rose = K.makeRose(R), centre = relief.pointOf(31.6, 35.1), ROSE_Y = 7.4; rose.root.position.set(centre.x, ROSE_Y, centre.z);
  const g = new THREE.Group(); g.add(rose.root);
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([sx, sz]) => { const x = centre.x + sx * R * 0.7, z = centre.z + sz * R * 0.7, y0 = relief.yAtXZ(x, z);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, ROSE_Y - y0, 8), K.phong('#c9a24a', { shininess: 80 })); leg.position.set(x, (ROSE_Y + y0) / 2, z); g.add(K.shadowable(leg)); });
  return { g, rose };
}

export function shotQ(ctx) {
  const { K, cam, relief } = ctx, { THREE } = K;
  const grp = new THREE.Group(), { g, rose } = roseOnRelief(K, relief, THREE, 15); grp.add(g);
  const her = relief.pointOf(...K.PLACES.hermon);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 46, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#fff2b0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.set(her.x, her.y + 23, her.z); grp.add(beam);
  const hp = K.glowSprite('#fff0a0', 22, 0); hp.position.set(her.x, her.y + 3, her.z); grp.add(hp);
  const pen = K.makePencil(); pen.position.set(-62, 0, 70); pen.rotation.y = 2.4; grp.add(pen); const comp = K.makeBrassCompass(); comp.position.set(66, 0, 70); grp.add(comp);
  const rig = K.camRig(cam, [{ t: 0, p: [-92, 56, 16], l: [0, 6, -6], fov: 36 }, { t: 5.2, p: [-78, 62, 46], l: [0, 6, -6], fov: 36 }, { t: 6.4, p: [-62, 74, 64], l: [4, 5, -8], fov: 36 },
    { t: 8.67, p: [46, 122, 70], l: [46, 0, -18], fov: 40 }]);
  const ANS = 6.41;
  return {
    id: 's1q_quiz2', t0: 105.8, t1: 114.47, grp, env: 'room', relief: true,
    tipa: lt => ({ x: 52, y: 0, z: 40, expr: lt < ANS ? 'curious' : 'cheering', arms: lt < ANS ? 'down' : 'up' }),
    upd(lt, t) {
      rig(lt);
      rose.root.rotation.y = 0;
      for (let i = 0; i < 8; i++) rose.glow(i, 0);
      if (lt < ANS) { [[0.7, 0], [1.6, 1], [2.5, 2], [3.4, 3], [4.3, 0], [5.0, 1], [5.7, 2]].forEach(([a, i]) => rose.glow(i, K.env(lt, a, 0.2, 0.25, 0.4))); }
      const n = K.sm(K.lin(lt, ANS, ANS + 0.5)); rose.glow(0, n);
      rose.question(lt >= 0.4 && lt < ANS + 0.1 ? 1 : 0, t);
      relief.setSpot(...K.PLACES.hermon, 7); relief.setGlow(0, 0, 0, K.sm(K.lin(lt, ANS + 0.8, ANS + 1.6)));
      const bo = K.sm(K.lin(lt, ANS + 0.5, ANS + 1.4)) * (0.7 + 0.3 * Math.sin(t * 5)); beam.material.opacity = 0.55 * bo; hp.material.opacity = 0.9 * bo;
    }
  };
}

export function shotE(ctx) {
  const { K, cam, relief } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  const cols = ['#47b04f', '#9a6a3e', '#7fd6e8'], XS = [-13, 0, 13], CYy = 15, CZ = 24;
  const chips = cols.map((c, i) => {
    const g = new THREE.Group(); const m = new THREE.MeshPhongMaterial({ color: c, shininess: 100, specular: '#ffffff', emissive: '#000000' });
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.9, 1.9, 36), m); g.add(K.shadowable(ch));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(4.7, 0.34, 8, 36).rotateX(Math.PI / 2), K.phong('#c9a24a', { shininess: 90, specular: '#fff0b0' })); rim.position.y = 0.9; g.add(rim);
    const halo = K.glowSprite(c, 22, 0); halo.position.y = 1.5; g.add(halo); grp.add(g); return { g, m, halo };
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(7.4, 0.5, 8, 48).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); grp.add(ring);
  const jer = relief.pointOf(31.76, 35.1, 4.2); const mk = relief.pointOf(...K.PLACES.hermon);
  const glowJ = K.glowSprite('#fff0a0', 30, 0); glowJ.position.set(jer.x, jer.y + 4, jer.z); grp.add(glowJ); void mk;
  const lamp = K.makeLamp(); lamp.position.set(-84, 0, -60); grp.add(lamp); const pen = K.makePencil(); pen.position.set(-60, 0, 70); pen.rotation.y = 0.8; grp.add(pen);
  const rig = K.camRig(cam, [{ t: 0, p: [46, 40, 78], l: [0, 12, 8], fov: 36 }, { t: 7.0, p: [30, 46, 88], l: [0, 10, 6], fov: 36 }, { t: 9.6, p: [18, 34, 54], l: [3, 6, -8], fov: 36 },
    { t: 12, p: [-34, 66, 94], l: [0, 0, -2], fov: 36 }, { t: 16, p: [-60, 140, 108], l: [0, 0, 0], fov: 36 }, { t: 22.25, p: [14, 238, 46], l: [14, 0, -2], fov: 36 }]);
  const FLY0 = 7.59, FLY1 = 9.5, CH = 11.65;
  const chipPos = (i, t) => { const bob = Math.sin(t * 1.6 + i * 2) * 0.7; return [XS[i], CYy + bob, CZ]; };
  return {
    id: 's1e_quiz', t0: 114.47, t1: 136.72, grp, env: 'room', relief: true,
    tipa: (lt, t) => {
      const ch = lt >= CH; const ph = (t * 1.3) % 1;
      return { x: -48, y: 0, z: 36, expr: lt < FLY0 ? 'curious' : ch ? 'cheering' : 'happy', arms: ch ? 'up' : 'down', hop: ch && lt < CH + 5.5 ? 1 : 0, ph, hopH: 70 };
    },
    upd(lt, t) {
      rig(lt);
      const fu = K.sm(K.lin(lt, FLY0, FLY1));
      chips.forEach((c, i) => {
        let p = chipPos(i, t);
        if (i === 1) { const a = p, b = [jer.x, jer.y + 1.6, jer.z], u = fu; p = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 18 * Math.sin(Math.PI * u), a[2] + (b[2] - a[2]) * u]; }
        const tl = K.sm(K.lin(lt, 14.0, 17.0)), tg = [58, 2.0, (i - 1) * 40];
        c.g.position.set(p[0] + (tg[0] - p[0]) * tl, p[1] + (tg[1] - p[1]) * tl, p[2] + (tg[2] - p[2]) * tl); c.g.scale.setScalar(1 + 1.0 * tl);
        c.g.rotation.x = (i === 1 ? 0.5 * fu + 0.2 * Math.sin(t) * (1 - fu) : 0.18 * Math.sin(t * 0.9 + i)) * (1 - tl); c.g.rotation.z = 0.12 * Math.cos(t * 0.8 + i) * (1 - tl);
        c.halo.material.opacity = (i === 1 ? 0.5 + 0.4 * K.sm(K.lin(lt, FLY0, FLY1)) : 0.15) * (0.8 + 0.2 * Math.sin(t * 6));
        const em = i === 1 ? 0.35 * K.sm(K.lin(lt, FLY0, FLY1)) : 0; c.m.emissive.setRGB(em, em * 0.6, 0);
      });
      const qs = lt > 0.5 && lt < FLY0 + 0.05 ? 1 : 0; ring.visible = qs > 0; ring.material.opacity = 0.9 * qs; const sc = 1 + 0.1 * Math.sin(t * 7); ring.scale.set(sc, sc, sc); const p1 = chipPos(1, t); ring.position.set(p1[0], p1[1] + 1.2, p1[2]);
      const rise = K.sm(K.lin(lt, FLY1 - 0.2, FLY1 + 2.2));
      relief.setSpot(31.78, 35.12, 9); relief.setRise(rise); relief.setGlow(0, 0, 0, K.sm(K.lin(lt, FLY1 - 0.1, FLY1 + 1.4)));
      glowJ.material.opacity = 0.7 * K.env(lt, FLY1 - 0.1, 0.4, 1.2, 1.6); glowJ.position.y = jer.y + 4 + 2.6 * rise;
    }
  };
}
