/* shots_xqe - s2x_shape (short west-east arrow vs very long north-south arrow, two clocks), s2q_quiz2 (west or east edge, sea shimmer + rolling wave),
   s2e_quiz (three strips blink, ring stops on the middle strip, it rises). ASCII only. No people, no text. */
import * as P from './props.js';

function arrow(K, THREE, pts, r, c1, c2) {
  const tube = P.makeGlowTube(pts, r, c1, c2), cone = new THREE.Mesh(new THREE.ConeGeometry(r * 3.2, r * 8, 14).translate(0, r * 4, 0), new THREE.MeshBasicMaterial({ color: c1 }));
  const grp = new THREE.Group(); grp.add(tube.group, cone); cone.visible = false;
  return { grp, tube, set(u, op) { tube.set(u, op); const p = tube.curve.getPoint(K.clamp(u)), q = tube.curve.getPoint(K.clamp(u - 0.02)); cone.position.copy(p); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().sub(q).normalize()); cone.position.addScaledVector(p.clone().sub(q).normalize(), -r * 3); cone.visible = op > 0.01 && u > 0.01; } };
}

export function shotX(ctx) {
  const { K, cam, relief } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  const LIFT = 9;
  const w0 = K.pointOf(32.0, 34.76, 0), w1 = K.pointOf(32.0, 35.55, 0);
  const shortPts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; shortPts.push(new THREE.Vector3(w0.x + (w1.x - w0.x) * u, LIFT + 1.2 * Math.sin(Math.PI * u), w0.z)); }
  const sa = arrow(K, THREE, shortPts, 1.0, '#fff2a0', '#ffd23a'); grp.add(sa.grp);
  const hp = K.pointOf(...K.PLACES.hermon), ep = K.pointOf(...K.PLACES.eilat);
  const longPts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; longPts.push(new THREE.Vector3(hp.x + (ep.x - hp.x) * u, 14 + 3 * Math.sin(Math.PI * u), hp.z + (ep.z - hp.z) * u)); }
  const la = arrow(K, THREE, longPts, 1.5, '#d8f4ff', '#38b6ff'); grp.add(la.grp);
  const pinH = relief.pinMesh('#e0401e'), pinE = relief.pinMesh('#e0401e'); pinH.position.copy(hp); pinE.position.copy(ep); grp.add(pinH, pinE);
  const clA = P.makeClock(11), clB = P.makeClock(11); clA.position.set(-48, 0, -20); clB.position.set(-48, 0, 34); clA.rotation.y = 0.5; clB.rotation.y = 0.5; grp.add(clA, clB);
  const hA = K.glowSprite('#ffe27a', 50, 0), hB = K.glowSprite('#7ad4ff', 50, 0); hA.position.set(-48, 14, -17); hB.position.set(-48, 14, 37); grp.add(hA, hB);
  [['lamp', 108, -62], ['compass', 84, 64], ['ink', 100, 10]].forEach(([k, x, z]) => { const o = k === 'lamp' ? K.makeLamp() : k === 'ink' ? K.makeInkwell() : K.makeBrassCompass(); o.position.set(x, 0, z); grp.add(o); });
  const rig = K.camRig(cam, [
    { t: 0, p: [28, 62, 62], l: [-6, 2, -16], fov: 36 }, { t: 3.0, p: [24, 56, 56], l: [-10, 2, -14], fov: 36 }, { t: 6.0, p: [-30, 150, 170], l: [-4, 0, 0], fov: 38 },
    { t: 10.0, p: [30, 150, 150], l: [-2, 0, -4], fov: 38 }, { t: 15.0, p: [0, 164, 174], l: [-4, 0, 2], fov: 38 }, { t: 19.97, p: [10, 146, 150], l: [-2, 0, 0], fov: 38 }]);
  return {
    id: 's2x_shape', t0: 67.53, t1: 87.5, grp, env: 'room', relief: true, sun: [0, 0, 0, -95, 80, -70, 150],
    tipa: lt => ({ expr: lt < 6 ? 'curious' : lt < 17 ? 'happy' : 'surprised', arms: 'down' }),
    upd(lt, t) {
      rig(lt);
      const su = K.sm(K.lin(lt, 0.6, 2.0)), sOp = lt < 5.6 ? 1 : 1 - K.sm(K.lin(lt, 5.6, 6.6)) * 0.55;
      sa.set(su, sOp); clA.userData.setTurns(K.sm(K.lin(lt, 0.6, 2.6)) * 1.0); hA.material.opacity = 0.7 * K.env(lt, 0.6, 0.3, 1.6, 0.8);
      const pe = K.back(K.clamp((lt - 6.2) / 0.7)); pinH.scale.setScalar(Math.max(0.001, pe)); pinE.scale.setScalar(Math.max(0.001, K.back(K.clamp((lt - 6.5) / 0.7)))); pinH.visible = pinE.visible = lt > 6.15;
      const lu = K.lin(lt, 7.0, 17.0), le = lt > 6.9 ? 1 : 0; la.set(lu, le); clB.userData.setTurns(8 * lu); hB.material.opacity = 0.7 * K.env(lt, 7.0, 0.5, 9.6, 1.2);
      relief.setSpot(33.416, 35.857, 12); relief.setGlow(0, 0, 0, 0);
    }
  };
}

export function shotQ(ctx) {
  const { K, cam, relief } = ctx, { THREE } = K;
  const grp = new THREE.Group(), ANS = 5.61;
  const coastW = P.coastWps(31.25, 33.09, 70), coastP = P.toPts(coastW, 1.1), jorP = P.toPts(P.densify(P.JORDAN, 0.04), 1.1);
  const west = P.makeGlowTube(coastP, 0.7, '#fff2a0', '#5dff8a'), east = P.makeGlowTube(jorP, 0.7, '#fff2a0', '#ffb13a'); grp.add(west.group, east.group);
  const foam = [0, 1, 2].map(() => { const f = P.makeGlowTube(P.toPts(coastW, 0.55), 0.5, '#ffffff', '#bfeaff'); grp.add(f.group); return f; });
  const mid = K.pointOf(32.2, 34.7, 0), qr = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.55, 10, 40).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  const qHalo = K.glowSprite('#ffe27a', 26, 0); grp.add(qr, qHalo);
  [['lamp', 108, -62], ['compass', -92, 66], ['ink', 96, 20], ['book', -96, -20]].forEach(([k, x, z]) => { const o = k === 'lamp' ? K.makeLamp() : k === 'ink' ? K.makeInkwell() : k === 'book' ? K.makeBookOpen() : K.makeBrassCompass(); o.position.set(x, 0, z); grp.add(o); });
  const rig = K.camRig(cam, [
    { t: 0, p: [-60, 64, 74], l: [-6, 0, -4], fov: 36 }, { t: 4.0, p: [-44, 58, 54], l: [0, 0, -6], fov: 36 }, { t: 5.6, p: [-62, 66, 58], l: [-12, 0, -10], fov: 36 }, { t: 8.13, p: [-56, 62, 46], l: [-6, 0, -12], fov: 36 }]);
  return {
    id: 's2q_quiz2', t0: 87.5, t1: 95.63, grp, env: 'room', relief: true, sun: [0, 0, 0, -95, 80, -70, 150],
    tipa: lt => ({ expr: lt < ANS ? 'curious' : 'cheering', arms: lt < ANS ? 'down' : 'up' }),
    upd(lt, t) {
      rig(lt);
      const pl = 0.8 + 0.2 * Math.sin(t * 7);
      const bw = lt < ANS ? (Math.sin(lt * 5.2) > 0 ? 1 : 0.15) : 0.7, be = lt < ANS ? (Math.sin(lt * 5.2) > 0 ? 0.15 : 1) : 0.4, on = K.sm(K.lin(lt, 0.3, 0.9));
      west.set(1, on * bw * pl); east.set(1, on * be * pl);
      const q = lt >= 0.5 && lt < ANS + 0.1 ? 1 : 0, bob = Math.sin(t * 3) * 0.8; qr.material.opacity = 0.95 * q; qr.visible = q > 0; qr.position.set(mid.x - 4, mid.y + 7 + bob, mid.z); const qs = 1 + 0.12 * Math.sin(t * 7); qr.scale.set(qs, qs, qs);
      qHalo.position.copy(qr.position); qHalo.material.opacity = 0.7 * q * pl;
      const sea = K.sm(K.lin(lt, ANS, ANS + 0.8)) * (0.8 + 0.2 * Math.sin(t * 6)); relief.setGlow(0, 0, sea, 0);
      foam.forEach((f, i) => { const a = lt - (ANS + 0.1 + i * 0.7), u = K.clamp(a / 1.5); f.group.position.x = -26 * (1 - K.sm(u)) - 0.5; f.group.position.y = 0.3 * Math.sin(t * 8 + i);
        f.set(1, lt > ANS ? 0.95 * (1 - K.sm(K.clamp((a - 1.4) / 0.5))) * (a > 0 ? 1 : 0) : 0); });
    }
  };
}

export function shotE(ctx) {
  const { K, cam, strips } = ctx, { THREE } = K;
  const grp = new THREE.Group(), S = strips.S, ANS = 7.05;
  const COL = [[0.25, 0.95, 0.35], [1.0, 0.62, 0.2], [0.3, 0.85, 1.0]];
  const ring = new THREE.Mesh(new THREE.TorusGeometry(7, 0.7, 10, 44).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  const rh = K.glowSprite('#ffe27a', 36, 0); grp.add(ring, rh);
  const gold = K.glowSprite('#ffd86a', 60, 0); grp.add(gold);
  [['lamp', 108, -62, 0], ['compass', -96, 66, 0.9], ['ink', 104, 30, 0], ['book', -98, -34, 0.6]].forEach(([k, x, z, ry]) => { const o = k === 'lamp' ? K.makeLamp() : k === 'ink' ? K.makeInkwell() : k === 'book' ? K.makeBookOpen() : K.makeBrassCompass(); o.position.set(x, 0, z); o.rotation.y = ry; grp.add(o); });
  const rig = K.camRig(cam, [
    { t: 0, p: [10, 96, 150], l: [0, 2, -6], fov: 36 }, { t: 4.0, p: [-14, 84, 120], l: [3, 2, -8], fov: 36 }, { t: 7.0, p: [14, 74, 100], l: [5, 4, -10], fov: 36 },
    { t: 11.4, p: [22, 60, 96], l: [5, 8, -10], fov: 36 }, { t: 15.0, p: [18, 36, 78], l: [5, 16, -12], fov: 36 }, { t: 19.87, p: [10, 22, 52], l: [5, 17, -14], fov: 36 }]);
  const RING_AT = [[0.9, 0], [3.0, 0], [3.7, 2], [4.4, 0], [5.1, 2], [5.8, 1]];
  return {
    id: 's2e_quiz', t0: 95.63, t1: 115.5, grp, hero: strips.root, env: 'room', relief: false, sun: [0, 0, 0, -95, 80, -70, 150],
    tipa: lt => ({ expr: lt < ANS ? 'curious' : 'cheering', arms: lt < ANS ? 'down' : 'up', hop: lt > ANS + 1 && lt < ANS + 6 ? 1 : 0, ph: (lt * 1.3) % 1, hopH: 60 }),
    upd(lt, t) {
      rig(lt); strips.root.visible = true;
      const rise = K.sm(K.lin(lt, ANS, ANS + 1.6)), pl = 0.8 + 0.2 * Math.sin(t * 7);
      let sel = -1; RING_AT.forEach(([a, i]) => { if (lt >= a) sel = i; });
      S.forEach((s, i) => {
        let e = 0;
        if (lt < 3.0) { const a = [0.9, 1.6, 2.3][i]; e = K.env(lt, a, 0.2, 0.25, 0.35); }
        else if (lt < ANS) e = (sel === i ? 0.7 : 0.1) * pl;
        else e = i === 1 ? 1.0 * pl : 0.12;
        s.g.position.set((i - 1) * 1.2, i === 1 ? 14 * rise : 0, 0);
        const c = i === 1 && lt >= ANS ? [1.0, 0.78, 0.3] : COL[i];
        s.uE.value.set(c[0] * e * 0.55, c[1] * e * 0.55, c[2] * e * 0.55); s.halo.material.opacity = 0.4 * e; s.plaque.scale.set(0.001, 0.001, 1);
        if (s.jer) { const je = K.sm(K.lin(lt, 5.6, 6.2)); s.jer.material.opacity = 0.95 * je * (0.7 + 0.3 * Math.sin(t * 9)); s.jer.scale.setScalar(Math.max(0.001, 24 * je * (1 + 0.3 * Math.sin(t * 9)))); s.jer.visible = je > 0.01; }
      });
      const q = lt > 2.9 && lt < ANS + 0.2 ? 1 : 0, tgt = sel < 0 ? 0 : sel, sx = S[tgt].xc + (tgt - 1) * 1.2;
      ring.visible = q > 0; ring.material.opacity = 0.95 * q; ring.position.set(sx, 20 + Math.sin(t * 4) * 0.8, -12); const rs = 1 + 0.12 * Math.sin(t * 7); ring.scale.set(rs, rs, rs);
      rh.position.copy(ring.position); rh.material.opacity = 0.7 * q * pl;
      gold.position.set(S[1].xc, 14 * rise + 10, -12); gold.material.opacity = 0.3 * K.sm(K.lin(lt, ANS + 0.4, ANS + 1.6)) * (0.85 + 0.15 * Math.sin(t * 5));
    }
  };
}
