/* shots_ab - s2a_continents (study-room globe, three continents light up, three arrows meet on the land) and s2b_borders
   (relief map: glowing west coast, glowing Jordan line, icon board for natural borders, floating pencil draws a dashed straight border). ASCII only. */
import * as P from './props.js';

function decor(K, grp, list) {
  const { THREE } = K;
  list.forEach(([kind, x, z, ry]) => {
    const o = kind === 'lamp' ? K.makeLamp() : kind === 'book' ? K.makeBookOpen() : kind === 'ink' ? K.makeInkwell() : kind === 'pencil' ? K.makePencil() : kind === 'compass' ? K.makeBrassCompass() : K.makeMagnifier();
    o.position.set(x, 0, z); o.rotation.y = ry || 0; grp.add(o);
  });
  void THREE;
}

export function shotA(ctx) {
  const { K, cam } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  const gl = P.makeBigGlobe(38); gl.root.position.set(0, 0, -10); grp.add(gl.root);
  decor(K, grp, [['lamp', 98, -52, 0], ['book', -92, 30, 1.0], ['ink', -88, -34, 0], ['pencil', -40, 62, 0.4], ['compass', 62, 64, 0.5], ['mag', 84, 24, -2.4]]);
  /* three arrows (mesh-local) from the continents to the land */
  const src = [[40, 85], [8, 22], [50, 14]], cols = [['#ffcf8a', '#ff9a3a'], ['#fff6a0', '#ffe03a'], ['#ffc0d0', '#ff6a8a']];
  const arrows = src.map((s, i) => {
    const pts = P.globeArcPts(gl, s, [31.7, 35.0], 0.1 + 0.02 * i), tube = P.makeGlowTube(pts, 0.75, cols[i][0], cols[i][1]);
    gl.mesh.add(tube.group);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.1, 5.4, 12).translate(0, 2.7, 0), new THREE.MeshBasicMaterial({ color: cols[i][0] }));
    const e = pts[pts.length - 1], pr = pts[pts.length - 3]; cone.position.copy(e); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.clone().sub(pr).normalize()); cone.position.addScaledVector(e.clone().sub(pr).normalize(), -3.2); gl.mesh.add(cone);
    return { tube, cone };
  });
  grp.updateMatrixWorld(true);
  const Pw = gl.israel.getWorldPosition(new THREE.Vector3()), Cw = gl.axis.getWorldPosition(new THREE.Vector3());
  const rig = K.camRig(cam, [
    { t: 0, p: [Pw.x + 5, Pw.y + 11, Pw.z + 56], l: [Pw.x, Pw.y, Pw.z], fov: 36 },
    { t: 3.6, p: [Cw.x + 28, Cw.y + 30, Cw.z + 112], l: [Cw.x, Cw.y + 2, Cw.z], fov: 36 },
    { t: 7.4, p: [Cw.x + 6, Cw.y + 34, Cw.z + 150], l: [Cw.x + 2, Cw.y + 2, Cw.z], fov: 36 },
    { t: 12.5, p: [Cw.x - 22, Cw.y + 24, Cw.z + 118], l: [Pw.x - 4, Pw.y - 2, Pw.z], fov: 36 },
    { t: 17.44, p: [Pw.x + 9, Pw.y + 12, Pw.z + 54], l: [Pw.x, Pw.y, Pw.z], fov: 34 }]);
  const T0 = [1.0, 3.2, 5.2];
  return {
    id: 's2a_continents', t0: 0, t1: 17.44, grp, env: 'room', relief: false, sun: [0, 20, 0, -90, 85, 95, 150],
    tipa: lt => ({ expr: lt < 7 ? 'curious' : lt < 14 ? 'happy' : 'surprised', arms: lt > 13 && lt < 16 ? 'up' : 'down' }),
    upd(lt, t) {
      rig(lt);
      gl.over.forEach((o, i) => { const e = (0.42 + 0.43 * (1 - K.sm(K.lin(lt, T0[i] + 0.6, T0[i] + 2.2)))) * K.sm(K.lin(lt, T0[i], T0[i] + 0.5)) * (0.9 + 0.1 * Math.sin(t * 6 + i)); o.material.opacity = e; });
      const ie = K.sm(K.lin(lt, 0.3, 1.0)); gl.halo.material.opacity = ie * (0.7 + 0.3 * Math.sin(t * 5)); const rs = 1 + 0.18 * Math.sin(t * 5); gl.ring.scale.set(rs, rs, rs); gl.ring.material.opacity = ie; gl.dot.scale.setScalar(Math.max(0.001, ie));
      arrows.forEach((a, i) => { const t1 = 7.7 + i * 1.7, u = K.sm(K.lin(lt, t1, t1 + 1.9)); a.tube.set(u, u > 0.001 ? 0.95 : 0); a.cone.visible = u > 0.97; });
      const meet = K.env(lt, 11.4, 0.5, 4.0, 1.0); gl.halo.material.opacity = Math.max(gl.halo.material.opacity, meet * 0.95); gl.halo.scale.setScalar(38 * 0.42 * (1 + 0.5 * meet));
    }
  };
}

export function shotB(ctx) {
  const { K, cam, relief } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  const coastP = P.toPts(P.coastWps(31.25, 33.09, 70), 1.1), jorP = P.toPts(P.densify(P.JORDAN, 0.04), 1.1);
  const coast = P.makeGlowTube(coastP, 0.62, '#fff2a0', '#5dff8a'), jor = P.makeGlowTube(jorP, 0.62, '#fff2a0', '#ffb13a');
  grp.add(coast.group, jor.group);
  const ib = P.makeIconBoard(); ib.stand.position.set(-72, 0, 16); ib.stand.rotation.y = 0.55; grp.add(ib.stand);
  /* political border: a straight dashed line (Rafah - Eilat) drawn by a floating pencil */
  const A = K.pointOf(31.25, 34.27), B = K.pointOf(29.55, 34.90), ND = 12, dx = B.x - A.x, dz = B.z - A.z, LEN = Math.hypot(dx, dz);
  const dashes = [];
  for (let k = 0; k < ND; k++) {
    const u = (k + 0.5) / ND, x = A.x + dx * u, z = A.z + dz * u;
    const m = new THREE.Mesh(new THREE.BoxGeometry(LEN / ND * 0.62, 0.7, 1.5), new THREE.MeshPhongMaterial({ color: '#d8342a', emissive: '#5a0c08', shininess: 60 }));
    m.position.set(x, relief.yAtXZ(x, z) + 0.5, z); m.rotation.y = -Math.atan2(dz, dx); grp.add(m); dashes.push(m);
  }
  const pen = K.makePencil(); const PS = 2.4; pen.scale.setScalar(PS); pen.rotation.set(0, 2.6, -0.85, 'XYZ'); grp.add(pen);
  const tipV = new THREE.Vector3(10.7 * PS, 0.5 * PS, 0).applyEuler(pen.rotation);
  const trail = K.glowSprite('#ffd0a0', 12, 0); grp.add(trail);
  decor(K, grp, [['lamp', 108, -60, 0], ['compass', 80, 62, 0.9], ['ink', 94, 20, 0], ['mag', -92, -50, 0.7]]);
  const rig = K.camRig(cam, [
    { t: 0, p: [-54, 58, 104], l: [-6, 0, 24], fov: 36 }, { t: 3.2, p: [-30, 52, 40], l: [-8, 0, -22], fov: 36 }, { t: 5.2, p: [-6, 60, 20], l: [4, 0, -24], fov: 36 },
    { t: 7.6, p: [60, 56, 70], l: [14, 0, 6], fov: 36 }, { t: 9.6, p: [-4, 74, 126], l: [-24, 6, 14], fov: 36 }, { t: 12.4, p: [-36, 62, 120], l: [-12, 0, 36], fov: 36 },
    { t: 16.0, p: [-20, 100, 150], l: [-2, 0, 14], fov: 36 }, { t: 16.85, p: [-14, 106, 154], l: [0, 0, 12], fov: 36 }]);
  return {
    id: 's2b_borders', t0: 17.44, t1: 34.29, grp, env: 'room', relief: true, sun: [0, 0, 0, -95, 80, -70, 150],
    tipa: lt => ({ expr: lt < 8.3 ? 'happy' : lt < 15.5 ? 'curious' : 'surprised', arms: 'down' }),
    upd(lt, t) {
      rig(lt);
      const cu = K.sm(K.lin(lt, 0.7, 4.7)), ju = K.sm(K.lin(lt, 5.0, 8.0)), pulse = 0.8 + 0.2 * Math.sin(t * 6);
      coast.set(cu, 1 * (lt < 8.3 ? 1 : 0.75 * pulse + 0.25)); jor.set(ju, 1 * (lt < 8.3 ? 1 : 0.75 * pulse + 0.25));
      relief.setGlow(0, 0, K.env(lt, 0.5, 0.8, 5.2, 1.4), 0);
      const bp = K.back(K.clamp((lt - 8.4) / 0.8)); ib.stand.scale.setScalar(Math.max(0.001, bp)); ib.halo.material.opacity = 0.7 * K.env(lt, 8.4, 0.5, 3.0, 1.2);
      const du = K.sm(K.lin(lt, 12.2, 15.8)), head = new THREE.Vector3(A.x + dx * du, 0, A.z + dz * du);
      dashes.forEach((m, k) => { const e = K.clamp((du * ND - k) / 0.6); m.scale.setScalar(Math.max(0.001, K.back(e))); m.visible = e > 0; });
      head.y = relief.yAtXZ(head.x, head.z) + 0.8;
      const pe = K.sm(K.lin(lt, 11.4, 12.4)), bob = Math.sin(t * 9) * 0.35; pen.visible = pe > 0.001;
      pen.position.set(head.x - tipV.x, head.y - tipV.y + (1 - pe) * 24 + bob, head.z - tipV.z);
      trail.position.set(head.x, head.y + 0.4, head.z); trail.material.opacity = 0.8 * pe * (du < 1 ? 1 : 0.2);
    }
  };
}
