/* shots_ab - s1a_photo_map (photo and map of the same place) and s1b_legend (relief map + legend card). ASCII only, no people, no text. */
import { world, paintPhoto, paintMap, ART } from './s1_art.js';

export function shotA(ctx) {
  const { K, cam, relief } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  const Wd = world(), photoC = paintPhoto(Wd), mapC = paintMap(Wd);
  const MAPX = 4, SW = 70, SD = 50;
  /* photo print: thick glossy paper */
  const photo = new THREE.Group(); photo.position.set(-40, 0, 0); photo.rotation.y = 0.035;
  const pb = new THREE.Mesh(new THREE.BoxGeometry(72.4, 0.3, 52.4), K.lam('#f3eedd')); pb.position.y = 0.15; photo.add(K.shadowable(pb));
  const pp = new THREE.Mesh(new THREE.PlaneGeometry(69.6, 49.7).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ map: K.ctex(photoC), shininess: 45, specular: '#555555' })); pp.position.y = 0.32; pp.receiveShadow = true; photo.add(pp);
  grp.add(photo);
  /* map sheet that unrolls */
  const sheet = K.makeRollSheet(SW, SD, K.ctex(mapC), '#efe6cf'); sheet.position.set(MAPX, 0, 0); grp.add(sheet);
  const px = u => u / ART.W * SW, pz = v => -SD / 2 + v / ART.H * SD;
  /* map markers (pins pop when the important things light up) and photo sparkles */
  const marks = new THREE.Group(); marks.position.set(MAPX, 0.1, 0); grp.add(marks);
  const spots = [[Wd.villages[0].x, Wd.villages[0].y, 'pin', 19.0], [Wd.villages[1].x, Wd.villages[1].y, 'pin', 19.6], [Wd.villages[2].x, Wd.villages[2].y, 'pin', 20.2], [Wd.lake.cx, Wd.lake.cy, 'ring', 21.0], [Wd.hill.cx, Wd.hill.cy, 'ring', 22.4]];
  const pins = spots.map(([u, v, kind, tp]) => {
    const o = { kind, tp };
    if (kind === 'pin') { o.m = relief.pinMesh(kind === 'pin' ? '#e0401e' : '#e0401e'); o.m.position.set(px(u), 0, pz(v)); marks.add(o.m); }
    o.halo = K.glowSprite(kind === 'pin' ? '#ffd27a' : '#fff0a0', kind === 'pin' ? 9 : 24, 0); o.halo.position.set(px(u), kind === 'pin' ? 2.6 : 1.4, pz(v)); marks.add(o.halo);
    return o;
  });
  const NS = 340, sparks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: K.glowTex(), color: '#fffbe0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), NS);
  sparks.frustumCulled = false; photo.add(sparks);
  const d = new THREE.Object3D();
  /* table props */
  const pencil = K.makePencil(); pencil.position.set(-18, 0, 35); pencil.rotation.y = 0.35; grp.add(pencil);
  const comp = K.makeBrassCompass(); comp.position.set(66, 0, 36); comp.rotation.y = 0.5; grp.add(comp);
  const mag = K.makeMagnifier(); mag.position.set(-66, 0, 33); mag.rotation.y = -2.7; grp.add(mag);
  const ink = K.makeInkwell(); ink.position.set(-92, 0, -24); grp.add(ink);
  const book = K.makeBookOpen(); book.position.set(-103, 0, 14); book.rotation.y = 1.2; grp.add(book);
  const lamp = K.makeLamp(); lamp.position.set(98, 0, -52); grp.add(lamp);
  const globe = K.makeGlobe(); globe.position.set(112, 0, -22); grp.add(globe);
  const rig = K.camRig(cam, [
    { t: 0, p: [4, 120, 96], l: [0, 0, 6], fov: 36 }, { t: 6, p: [-30, 52, 60], l: [-36, 0, 4], fov: 36 }, { t: 10.5, p: [-18, 38, 50], l: [-22, 0, 2], fov: 34 },
    { t: 16.5, p: [14, 60, 68], l: [4, 0, 2], fov: 36 }, { t: 22, p: [34, 42, 52], l: [36, 0, 2], fov: 34 }, { t: 27.66, p: [18, 34, 44], l: [30, 0, 0], fov: 33 }]);
  return {
    id: 's1a_photo_map', t0: 0, t1: 27.66, grp, env: 'room', relief: false,
    tipa: lt => ({ x: 0, y: 0, z: 31, expr: lt < 10 ? 'curious' : lt < 18 ? 'happy' : 'surprised', arms: lt > 18.2 && lt < 24 ? 'up' : 'down' }),
    sun: [0, 0, 0, -95, 80, -70, 150],
    upd(lt, t) {
      rig(lt);
      const u = K.sm(K.lin(lt, 10.2, 16.8));
      sheet.userData.set(Math.max(0.0001, u));
      marks.visible = lt >= 18.0;
      pins.forEach(o => { const e = K.clamp((lt - o.tp) / 0.7); if (o.m) { const k = Math.max(0.001, K.back(e)) * 0.62; o.m.scale.setScalar(k); o.m.position.y = (1 - K.clamp(e)) * 2.2; o.m.visible = e > 0; }
        o.halo.material.opacity = 0.9 * K.env(lt, o.tp, 0.3, 0.8, 1.6) * (0.75 + 0.25 * Math.sin(t * 7)); });
      /* sparkles: hundreds of tiny details flicker on the photo side in beat 3 */
      const act = K.sm(K.lin(lt, 18.2, 19.6));
      for (let i = 0; i < NS; i++) {
        const a = K.hash(i * 7 + 1), b = K.hash(i * 7 + 2), f = 2.2 + 4 * K.hash(i * 7 + 3), ph = K.hash(i * 7 + 4) * 6.28;
        const fl = Math.pow(Math.max(0, Math.sin(t * f + ph)), 6) * act, s = 0.5 + 1.5 * K.hash(i * 7 + 5) * fl;
        d.position.set((a - 0.5) * 66, 0.5, (b - 0.5) * 46); d.scale.set(Math.max(0.001, s), 1, Math.max(0.001, s)); d.updateMatrix(); sparks.setMatrixAt(i, d.matrix);
      }
      sparks.instanceMatrix.needsUpdate = true;
    }
  };
}

export function shotB(ctx) {
  const { K, cam, relief } = ctx, { THREE } = K;
  const grp = new THREE.Group();
  /* legend stand: wooden base + back board + paper card with three colour chips (round, glossy) and abstract bars */
  const stand = new THREE.Group(); stand.position.set(60, 0, 30); stand.rotation.y = -0.5; grp.add(stand);
  const wood = K.lam('#6b4020', { map: K.woodTex(61, 2, 1) });
  const bs = new THREE.Mesh(new THREE.BoxGeometry(24, 1.8, 11), wood); bs.position.y = 0.9; stand.add(K.shadowable(bs));
  const board = new THREE.Group(); board.position.set(0, 1.8, -1); board.rotation.x = -0.2; stand.add(board);
  const bd = new THREE.Mesh(new THREE.BoxGeometry(26, 34, 1.2), wood); bd.position.y = 17; board.add(K.shadowable(bd));
  const cc = K.cvs(460, 600), g = cc.getContext('2d'); g.fillStyle = '#f6efd9'; g.fillRect(0, 0, 460, 600); g.strokeStyle = '#7a5a2a'; g.lineWidth = 8; g.strokeRect(14, 14, 432, 572); g.strokeStyle = '#c9a24a'; g.lineWidth = 3; g.strokeRect(28, 28, 404, 544);
  [[120, 'rgba(120,160,90,0.18)'], [270, 'rgba(160,110,70,0.18)'], [420, 'rgba(120,190,210,0.2)']].forEach(([y, c]) => { g.fillStyle = c; g.fillRect(50, y - 55, 360, 110); g.fillStyle = '#8a7a58'; for (let k = 0; k < 2; k++) { g.beginPath(); g.roundRect(190, y - 28 + k * 34, 190 - k * 60, 14, 7); g.fill(); } });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(23, 30), new THREE.MeshLambertMaterial({ map: K.ctex(cc) })); card.position.set(0, 17.4, 0.65); card.receiveShadow = true; board.add(card);
  const chipCols = ['#47b04f', '#9a6a3e', '#7fd6e8'], chips = [], cy = [22.6, 17.4, 12.2].map(v => v + 0), CY = [23.0, 17.4, 11.8];
  chipCols.forEach((c, i) => {
    const m = new THREE.MeshPhongMaterial({ color: c, shininess: 90, specular: '#ffffff', emissive: '#000000' });
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.2, 1.2, 28).rotateX(Math.PI / 2), m); ch.position.set(-6.2, CY[i] + 0.0, 1.3); ch.castShadow = true; board.add(ch);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.22, 8, 28), K.phong('#c9a24a')); rim.position.set(-6.2, CY[i], 1.3); board.add(rim);
    const halo = K.glowSprite(i === 0 ? '#7dff8a' : i === 1 ? '#ffb15a' : '#8feaff', 13, 0); halo.position.set(-6.2, CY[i], 2.4); board.add(halo);
    chips.push({ ch, m, rim, halo, y0: CY[i] });
  });
  const key = K.makeKey(); key.scale.setScalar(2.4); key.position.set(0, 31.2, 1.6); board.add(key);
  const keyRing = K.glowSprite('#ffe27a', 9, 0.5); keyRing.position.set(0, 31.2, 1.2); board.add(keyRing);
  /* a few table props so the table stays alive */
  const compass = K.makeBrassCompass(); compass.position.set(-70, 0, 66); compass.rotation.y = 1.0; grp.add(compass);
  const pencil = K.makePencil(); pencil.position.set(-62, 0, -72); pencil.rotation.y = 1.9; grp.add(pencil);
  const mag = K.makeMagnifier(); mag.position.set(72, 0, -56); mag.rotation.y = 0.7; grp.add(mag);
  const lamp = K.makeLamp(); lamp.position.set(-108, 0, -68); grp.add(lamp);
  const rig = K.camRig(cam, [
    { t: 0, p: [66, 62, 118], l: [4, 0, 8], fov: 34 }, { t: 8, p: [34, 56, 126], l: [0, 0, 18], fov: 34 }, { t: 16, p: [-46, 58, 110], l: [-4, 0, 4], fov: 34 },
    { t: 21, p: [-62, 64, 92], l: [-2, 0, -8], fov: 34 }, { t: 24.4, p: [-70, 70, 90], l: [-2, 0, -10], fov: 34 }]);
  return {
    id: 's1b_legend', t0: 27.66, t1: 52.07, grp, env: 'room', relief: true,
    tipa: lt => ({ x: 47, y: 0, z: 8, expr: lt < 9.4 ? 'happy' : lt < 20 ? 'curious' : 'surprised', arms: 'down' }),
    sun: [0, 0, 0, -95, 80, -70, 150],
    upd(lt, t) {
      rig(lt);
      const coast = K.env(lt, 0.4, 0.7, 8.6, 0.9), mount = K.env(lt, 9.8, 0.7, 9.8, 0.9), water = K.env(lt, 20.9, 0.7, 40, 1.0);
      relief.setGlow(coast, mount, water, 0);
      [coast, mount, K.clamp(water)].forEach((e, i) => { const c = chips[i]; c.ch.position.z = 1.3 + 1.1 * e; c.rim.position.z = c.ch.position.z; c.halo.material.opacity = 0.9 * e * (0.75 + 0.25 * Math.sin(t * 6));
        c.m.emissive.setRGB(0.5 * e, 0.4 * e, 0.3 * e); });
      key.rotation.y = lt * 1.3; key.position.y = 31.2 + 0.25 * Math.sin(lt * 1.6);
    }
  };
}
