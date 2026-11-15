/* shots_cd - s1c_compass (brass rose on the relief map, then a landscape with a real sun path) and s1d_scale (ruler -> real road with milestones).
   ASCII only, no people, no text (digits only on the milestones, as the SHOTLIST names them). */

export function shotC(ctx) {
  const { K, cam, relief, scene, sky, hemi, sun, setSun } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  /* ---- part 1: the rose settles on the relief map */
  const p1 = new THREE.Group(); grp.add(p1);
  const R = 17, rose = K.makeRose(R), centre = relief.pointOf(31.6, 35.1);
  const ROSE_Y = 7.4; rose.root.position.set(centre.x, ROSE_Y, centre.z); p1.add(rose.root);
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([sx, sz]) => { const x = centre.x + sx * R * 0.7, z = centre.z + sz * R * 0.7, y0 = relief.yAtXZ(x, z);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, ROSE_Y - y0, 8), K.phong('#c9a24a', { shininess: 80 })); leg.position.set(x, (ROSE_Y + y0) / 2, z); leg.userData.base = true; p1.add(K.shadowable(leg)); });
  const rig1 = K.camRig(cam, [{ t: 0, p: [0, 50, 74], l: [2, 6, -12], fov: 34 }, { t: 5.2, p: [-24, 66, 42], l: [2, 6, -8], fov: 34 }, { t: 10.9, p: [22, 84, 36], l: [2, 6, -10], fov: 34 }]);
  /* ---- part 2: landscape, sun rises over the eastern mountains (left), crosses, sets into the western sea (right) */
  const p2 = new THREE.Group(); grp.add(p2);
  const hf = K.makeHF({ mount: true, sea: true });
  p2.add(K.makeGround(hf, [-1100, 1000, -1300, 90], { nx: 300, nz: 260, sea: true }));
  const sea = K.makeSea(); p2.add(sea);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#d9c9a0' })); far.position.y = -12; p2.add(far);
  const inCam = (x, z) => false; void inCam;
  p2.add(K.scatterCountry(hf, { seed: 5, olives: 60, cypress: 16, bushes: 160, rocks: 70, tufts: 650, place: r => [-110 + r() * 190, 30 - r() * 190], avoid: (x, z) => (Math.abs(x) < 20 && z > -75) || Math.hypot(x + 9, z + 6) < 10 }));
  p2.add(K.scatterCountry(hf, { seed: 15, olives: 40, cypress: 6, place: r => [-300 + r() * 520, -120 - r() * 520] }));
  const house = K.makeStoneHouse(7, 5.5, 3.6, 4); house.position.set(-38, hf(-38, -62), -62); house.rotation.y = 0.3; p2.add(house);
  const house2 = K.makeStoneHouse(5, 4.4, 3.2, 8); house2.position.set(34, hf(34, -96), -96); house2.rotation.y = -0.4; p2.add(house2);
  p2.add(K.makeWall(hf, -80, -30, -20, -42), K.makeWall(hf, 14, -44, 70, -34), K.makeWall(hf, -60, -18, -22, -22), K.makeWall(hf, 24, -20, 64, -14));
  p2.add(K.makeFields(hf, 14, 3, [-120, 80, -40, -240]));
  p2.add(K.scatterCountry(hf, { seed: 25, olives: 26, cypress: 4, bushes: 40, place: r => [-95 + r() * 190, -22 - r() * 60], avoid: (x, z) => Math.abs(x) < 18 }));
  /* pillar with a tilted rose (east arm on the left, west arm on the right) */
  const CX = -9, CZ = -6, camY0 = hf(0, 24) + 5.2;
  const pil = new THREE.Group(); const pH = camY0 - hf(CX, CZ) - 0.1;
  const pb = new THREE.Mesh(new THREE.BoxGeometry(1.5, pH, 1.5), K.lam('#dccfae', { map: K.noiseTex(41, 1, 2) })); pb.position.y = pH / 2; pil.add(K.shadowable(pb));
  const pcap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 2.2), K.lam('#c9b98e')); pcap.position.y = pH + 0.2; pil.add(K.shadowable(pcap));
  const pst = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 2.6), K.lam('#cdbd98')); pst.position.y = 0.3; pil.add(K.shadowable(pst));
  pil.position.set(CX, hf(CX, CZ), CZ); p2.add(pil);
  const rose2 = K.makeRose(2.3); rose2.root.position.set(CX, camY0 + 0.35, CZ + 1.6); rose2.root.rotation.y = Math.PI; rose2.tilt.rotation.x = -1.05; p2.add(rose2.root);
  /* sun disc, glow, sea glitter */
  const disc = new THREE.Mesh(new THREE.SphereGeometry(52, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff6dc', fog: false })); disc.renderOrder = 5; p2.add(disc);
  const halo = K.glowSprite('#ffd58a', 640, 0.9); halo.material.fog = false; halo.renderOrder = 4; p2.add(halo);
  const gtex = (() => { const c = K.cvs(64, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(255,230,170,0)'); gr.addColorStop(0.5, 'rgba(255,230,170,1)'); gr.addColorStop(1, 'rgba(255,230,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    const gv = g.createLinearGradient(0, 0, 0, 256); gv.addColorStop(0, 'rgba(0,0,0,1)'); gv.addColorStop(1, 'rgba(0,0,0,0.0)'); g.globalCompositeOperation = 'destination-in'; g.fillStyle = gv; g.fillRect(0, 0, 64, 256); return new THREE.CanvasTexture(c); })();
  const glit = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: gtex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); glit.position.y = 0.4; p2.add(glit);
  const fogObj = new THREE.Fog('#fbe9bd', 380, 1900);
  const T0 = 10.9;
  const camAt = lt => {
    const th = K.sm(K.lin(lt, 11.0, 18.5));
    const s = K.sunState(th); const z = 24 - 14 * K.sm(K.lin(lt, 10.9, 18.8));
    cam.position.set(0, hf(0, z) + 5.2, z); cam.fov = 56; cam.updateProjectionMatrix();
    cam.lookAt(s.dir.x * 1600 * 0.14, cam.position.y + 42, -300); return s;
  };
  return {
    id: 's1c_compass', t0: 52.07, t1: 70.88, grp,
    mode: lt => ({ env: lt < T0 ? 'room' : 'land', relief: lt < T0 }),
    tipa: lt => (lt < T0 ? { x: -43, y: 0, z: 22, expr: lt < 6 ? 'happy' : 'curious', arms: 'down' } : null),
    upd(lt, t) {
      const part1 = lt < T0; p1.visible = part1; p2.visible = !part1;
      if (part1) {
        rig1(lt);
        const d = K.back(K.clamp((lt - 0.2) / 1.3)); rose.root.position.y = ROSE_Y + (1 - K.clamp((lt - 0.2) / 1.3)) * 34 * (1 - 0) ; rose.root.rotation.y = (1 - K.sm(K.lin(lt, 0.2, 1.5))) * 1.3; void d;
        const seq = [[1.3, 0], [3.3, 2], [5.4, 1], [7.5, 3]];
        for (let i = 0; i < 8; i++) rose.glow(i, 0);
        seq.forEach(([a, i]) => rose.glow(i, K.env(lt, a, 0.35, 1.0, 1.1)));
        rose.glow(0, Math.max(K.env(lt, 1.3, 0.35, 1.0, 1.1), 0.25 * K.sm(K.lin(lt, 2.6, 4)) * 0));
        return;
      }
      /* landscape */
      const th = K.sm(K.lin(lt, 11.0, 18.5));
      const s = camAt(lt);
      sea.userData.update(t);
      const lightY = Math.max(40, s.dir.y * 500), ele = K.clamp((s.e + 0.05) / 0.3);
      setSun(0, 0, -60, s.dir.x * 500, lightY, s.dir.z * 500, 140);
      sun.color.copy(s.sunC); sun.intensity = 0.4 + 2.5 * K.sm(ele);
      hemi.color.copy(s.top).lerp(new THREE.Color('#ffffff'), 0.45); hemi.groundColor.set('#8a7456'); hemi.intensity = 1.5 + 1.0 * s.low;
      ctx.S.fill.color.copy(s.sunC); ctx.S.fill.intensity = 1.8 + 1.1 * s.low;
      fogObj.color.copy(s.hor); scene.fog = fogObj; scene.background.copy(s.hor); far.material.color.copy(s.hor).lerp(new THREE.Color('#b9a478'), 0.3);
      sky.userData.set(s.top, s.hor, s.dir, s.sunC, 0.3 + 0.7 * s.low);
      disc.position.copy(s.pos); halo.position.copy(s.pos); disc.material.color.copy(s.sunC).lerp(new THREE.Color('#ffffff'), 0.6 * (1 - s.low));
      halo.material.opacity = 0.18 + 0.5 * s.low; halo.material.color.copy(s.sunC); halo.scale.set(520 + 300 * s.low, 520 + 300 * s.low, 1);
      /* sea glitter streak from the sun foot toward the camera */
      const fx = s.pos.x, fz = s.pos.z, midx = (fx + 0) / 2, midz = (fz + 20) / 2, len = Math.hypot(fx, fz - 20);
      glit.position.set(midx, 0.5, midz); glit.scale.set(220, 1, len); glit.rotation.y = Math.atan2(-fx, -(fz - 20)) * 1 + 0; glit.rotation.y = Math.atan2(fx, fz - 20) + Math.PI;
      glit.material.opacity = 0.7 * K.clamp(1 - s.e / 0.3) * K.clamp((s.e + 0.02) / 0.06) * (s.pos.x > 150 ? 1 : 0.0);
      /* east arm flashes at sunrise, west arm at sunset */
      for (let i = 0; i < 8; i++) rose2.glow(i, 0);
      rose2.glow(1, K.env(lt, 11.4, 0.4, 1.6, 1.2)); rose2.glow(3, K.env(lt, 16.2, 0.4, 1.8, 1.2));
    }
  };
}

export function shotD(ctx) {
  const { K, cam, relief, scene, sky, hemi, sun, setSun } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  const p1 = new THREE.Group(); grp.add(p1);
  const A = relief.pointOf(...K.PLACES.haifa), B = relief.pointOf(...K.PLACES.jerusalem);
  const dx = B.x - A.x, dz = B.z - A.z, dist = Math.hypot(dx, dz), L = 46, RY = 6.4;
  const ruler = K.makeRuler(L, 4.2); ruler.position.set((A.x + B.x) / 2, RY, (A.z + B.z) / 2); ruler.rotation.y = Math.atan2(-dz, dx); p1.add(ruler);
  [A, B].forEach(P => { const blk = new THREE.Mesh(new THREE.BoxGeometry(2.2, RY - P.y + 0.1, 2.2), K.lam('#6b4020')); blk.position.set(P.x, (RY + P.y) / 2 - 0.2, P.z); p1.add(K.shadowable(blk)); });
  [A, B].forEach((P, i) => { const pin = relief.pinMesh(i ? '#2f6fd0' : '#e0401e'); pin.position.set(P.x, P.y, P.z); pin.scale.setScalar(0.75); p1.add(pin); });
  const pivot = new THREE.Group(); pivot.position.set((A.x + B.x) / 2, RY + 0.5, (A.z + B.z) / 2); pivot.rotation.y = ruler.rotation.y; p1.add(pivot);
  const segM = new THREE.MeshPhongMaterial({ color: '#ffcf4a', shininess: 80, emissive: '#6a4a00' });
  const seg = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 3.6), segM); seg.position.x = -L / 2 + 0.9; seg.scale.x = 6; pivot.add(K.shadowable(seg));   // pivot at its left end below
  seg.geometry.translate(0.5, 0, 0); seg.position.x = -L / 2 + 0.3;
  const halo = K.glowSprite('#ffe27a', 16, 0); halo.position.set(-L / 2 + 3.5, 1.5, 0); pivot.add(halo);
  const comp = K.makeBrassCompass(); comp.position.set(-60, 0, 46); p1.add(comp); const pen = K.makePencil(); pen.position.set(60, 0, 70); pen.rotation.y = 0.6; p1.add(pen);
  const ux = dx / dist, uz = dz / dist;
  const rig1 = K.camRig(cam, [{ t: 0, p: [58, 62, 84], l: [4, 5, -10], fov: 34 }, { t: 6.4, p: [A.x - ux * 34, 40, A.z - uz * 34], l: [A.x + ux * 12, 5, A.z + uz * 12], fov: 36 },
    { t: 8.6, p: [A.x - ux * 16, 20, A.z - uz * 16], l: [A.x + ux * 30, 4, A.z + uz * 30], fov: 42 }, { t: 9.95, p: [A.x - ux * 12, 11, A.z - uz * 12], l: [A.x + ux * 40, 3, A.z + uz * 40], fov: 50 }]);
  /* ---- part 2: road across the hills with milestones */
  const p2 = new THREE.Group(); grp.add(p2);
  const hf = K.makeHF({});
  p2.add(K.makeGround(hf, [-500, 500, -800, 120], { nx: 260, nz: 240 }));
  const far = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#d9cfa8' })); far.position.y = -12; p2.add(far);
  const rx = z => 14 * Math.sin(z * 0.012) + 5 * Math.sin(z * 0.03);
  const wps = []; for (let z = 120; z >= -700; z -= 20) wps.push([rx(z), z]);
  const road = K.ribbon(K.sampleWP(wps, 200, hf, 0.1), 6.4, K.lam('#cdbb90')); p2.add(road);
  const roadEdge = K.ribbon(K.sampleWP(wps, 200, hf, 0.07), 7.4, K.lam('#efe4c8')); p2.add(roadEdge);
  const center = K.ribbon(K.sampleWP(wps, 200, hf, 0.13), 0.25, K.lam('#f6efd8')); p2.add(center);
  const avoidRoad = (x, z) => Math.abs(x - rx(z)) < 6;
  p2.add(K.scatterCountry(hf, { seed: 9, olives: 70, cypress: 24, bushes: 150, rocks: 60, tufts: 700, place: r => [-110 + r() * 220, 60 - r() * 300], avoid: avoidRoad }));
  p2.add(K.scatterCountry(hf, { seed: 19, olives: 40, cypress: 8, place: r => [-300 + r() * 600, -150 - r() * 500], avoid: avoidRoad }));
  const hs = K.makeStoneHouse(7, 5.5, 3.6, 3); hs.position.set(-30, hf(-30, -60), -60); hs.rotation.y = 0.5; p2.add(hs);
  const hs2 = K.makeStoneHouse(5.5, 4.5, 3.2, 6); hs2.position.set(36, hf(36, -150), -150); hs2.rotation.y = -0.3; p2.add(hs2);
  p2.add(K.makeWall(hf, 14, 20, 20, -40), K.makeWall(hf, -22, -10, -26, -80));
  p2.add(K.makeFields(hf, 14, 7, [-120, 120, 40, -260]));
  const stones = []; for (let i = 0; i < 6; i++) { const z = -2 - i * 15, m = K.makeMilestone(i + 1); m.scale.setScalar(1.7); m.position.set(rx(z) + 5.4, hf(rx(z) + 5.4, z), z); m.rotation.y = -0.18; p2.add(m); stones.push(m); }
  const fogObj = new THREE.Fog('#f3e4bf', 260, 1500);
  /* warm fade between the two parts */
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.4), new THREE.MeshBasicMaterial({ color: '#f1dcae', transparent: true, opacity: 0, depthTest: false, depthWrite: false })); veil.position.z = -1.2; veil.renderOrder = 999; cam.add(veil);
  const T1 = 9.95;
  return {
    id: 's1d_scale', t0: 70.88, t1: 84.87, grp,
    mode: lt => ({ env: lt < T1 ? 'room' : 'land', relief: lt < T1 }),
    tipa: lt => (lt < T1 - 0.6 ? { x: -48, y: 0, z: 6, expr: 'curious', arms: 'down' } : null),
    sun: [0, 0, 0, -95, 80, -70, 150],
    upd(lt, t) {
      const part1 = lt < T1; p1.visible = part1; p2.visible = !part1;
      veil.material.opacity = 0; veil.visible = veil.material.opacity > 0.003;
      if (part1) {
        rig1(lt);
        const e = K.sm(K.lin(lt, 6.7, 9.6));
        seg.scale.set(6 * (1 + e * 8), 1 - 0.7 * e, 1 + 0.55 * e); segM.color.set('#ffcf4a').lerp(new THREE.Color('#8f8a7c'), e); segM.emissive.setRGB(0.42 * (1 - e), 0.29 * (1 - e), 0);
        halo.material.opacity = 0.8 * K.env(lt, 0.5, 0.5, 5.5, 0.6) * (0.75 + 0.25 * Math.sin(t * 6));
        halo.position.x = -L / 2 + 3.5 + e * 30; void dist;
        return;
      }
      /* road landscape */
      const z = 36 - 70 * K.sm(K.lin(lt, 9.95, 14.0)), y = hf(rx(z), z) + 2.4, z2 = z - 24;
      cam.fov = 46; cam.updateProjectionMatrix(); cam.position.set(rx(z), y, z); cam.lookAt(rx(z2) + 2, y + 3.4, z2);
      road.userData.setU(K.sm(K.lin(lt, 10.2, 12.4))); roadEdge.userData.setU(K.sm(K.lin(lt, 10.2, 12.4))); center.userData.setU(K.sm(K.lin(lt, 10.2, 12.4)));
      stones.forEach((m, i) => { const e = K.clamp((lt - (10.9 + 0.6 * i)) / 0.6); m.visible = e > 0; m.scale.setScalar(Math.max(0.001, K.back(e)) * 1.7); });
      const s = K.sunState(0.62); const lightD = new THREE.Vector3(-0.55, 0.6, 0.45).normalize();
      setSun(rx(z), 0, z - 40, lightD.x * 300, lightD.y * 300, lightD.z * 300, 130);
      sun.color.set('#ffe2ac'); sun.intensity = 2.5; hemi.color.set('#d6e4f2'); hemi.intensity = 1.2; ctx.S.fill.color.set('#ffe9cf'); ctx.S.fill.intensity = 0.4;
      fogObj.color.set('#f1e2bd'); scene.fog = fogObj; scene.background.set('#f1e2bd');
      sky.userData.set(new THREE.Color('#79c3ee'), new THREE.Color('#f6e8c4'), new THREE.Vector3(-0.5, 0.5, -1), '#ffe9b0', 0.4); void s;
    }
  };
}
