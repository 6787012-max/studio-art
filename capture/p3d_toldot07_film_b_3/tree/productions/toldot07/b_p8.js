// b_p8.js - film_b part 8: B14 (respect the sea: broken seawall, black flag, rip current top-down) and B15 (sea breeze from the sea to a hill town). Exports `shots`.
import { THREE, box, cyl, ball, toon, label, cloud, canvasTex, ease, prog, clamp, lerp, D, rng, seq } from '../../lib/stage3d.js';
import { tree, house, wall, banner, sunDisc } from '../../lib/props3d.js';
import { PAL, seaWorld, boy, rav, mkShot, vlabel, fly, sm, face } from './shared.js';
import { sea, beach } from './sea.js';

const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------------ B14
const ZB = 100;    // beach scene (flag, boy, rav) lives at z = 100
const ZR = 220;    // rip current scene lives at z = 220
const STONE = 0xc2baa8, STONE_D = 0xa39c8b;

function seawall(Wd, S) {
  const g = new THREE.Group(); Wd.add(g);
  const TOP = 4.2;
  // wall segments along z, front face at x = -1.5; segments at z = -3 and 3 are destroyed
  for (let zc = -27; zc <= 27; zc += 6) {
    if (zc === -3 || zc === 3) continue;
    g.add(box(3, 7.2, 6, STONE, { pos: [0, TOP - 3.6, zc], inkW: .05 }));
    [.9, 2.0, 3.1].forEach(y => g.add(box(.07, .1, 6, STONE_D, { pos: [-1.52, y, zc], ink: false })));
    [-2, 0, 2].forEach(dz => g.add(box(.07, 3.4, .1, STONE_D, { pos: [-1.52, 1.9, zc + dz], ink: false })));
    wall(Wd, { pos: [-1.0, TOP, zc], rot: Math.PI / 2, len: 6 });
  }
  // jagged edges of the break: low stepped stubs
  g.add(box(3, 5.2, 3.2, STONE, { pos: [0, TOP - 4.6, -7.4], inkW: .05 }));
  g.add(box(3, 3.0, 2.4, STONE, { pos: [0, TOP - 5.7, -5.2], rot: [0, .12, 0], inkW: .05 }));
  g.add(box(3, 5.6, 3.0, STONE, { pos: [0, TOP - 4.4, 7.3], inkW: .05 }));
  g.add(box(3, 3.2, 2.2, STONE, { pos: [0, TOP - 5.6, 5.1], rot: [0, -.1, 0], inkW: .05 }));
  // paved land behind the wall: left and right of the break; the break itself is washed out to a lower bank
  g.add(box(36, 7.2, 29, 0xd8c8a2, { pos: [19.5, TOP - 3.6, -20.5], inkW: .05 }));
  g.add(box(36, 7.2, 29, 0xd8c8a2, { pos: [19.5, TOP - 3.6, 20.5], inkW: .05 }));
  g.add(box(33, 7.2, 12, 0xd8c8a2, { pos: [21.5, TOP - 3.6 - .7, 0], inkW: .05 }));
  g.add(box(7, 3.4, 12, 0xe3cf9a, { pos: [5.2, TOP - 4.0, 0], rot: [0, 0, .32], inkW: .05 }));
  // rubble
  const rub = new THREE.Group(); g.add(rub);
  const r = rng(14), put = (w, h, d, x, y, z, rx, ry, rz) => rub.add(box(w, h, d, r() < .5 ? STONE : 0xb7ae9a, { pos: [x, y, z], rot: [rx, ry, rz], inkW: .04 }));
  put(3.2, 2.0, 2.4, -4.2, -.2, -1.6, .25, .5, .35);
  put(2.4, 1.8, 2.8, -2.6, .1, 2.8, .1, -.4, .2);
  put(2.0, 1.4, 1.6, -5.8, -.3, 3.6, .3, .2, -.3);
  put(2.6, 1.6, 2.0, -3.4, -.4, -4.8, -.2, .9, .15);
  put(1.5, 1.2, 1.4, -7.0, -.2, -2.2, .4, .3, .2);
  put(1.8, 1.4, 1.5, -1.2, .6, .5, .1, .6, .5);
  put(2.2, 1.5, 1.7, 3.6, TOP - 1.4 + .5, -.5, .1, .3, .1);
  put(1.7, 1.3, 1.5, 6.2, TOP - 1.4 + .3, 2.6, 0, -.5, .05);
  put(2.4, 1.6, 2.0, 8.8, TOP - 1.9 + .7, -2.4, .05, .7, 0);
  for (let i = 0; i < 12; i++) { const s = .5 + r() * .9; put(s * 1.4, s, s * 1.2, -8 + r() * 14, i < 4 ? -.2 + r() * .5 : TOP - 1.6 + r() * .6 + (i > 7 ? 0 : 0), -8 + r() * 16, r(), r() * 3, r()); }
  // spray columns along the wall, tied to the actual crest height at the wall (pure function of t)
  const cl = [];
  for (let zc = -27; zc <= 27; zc += 6) {
    if (zc === -3 || zc === 3) continue;
    const grp = []; for (let i = 0; i < 9; i++) { const b = ball(.38 + (i % 3) * .1, 0xffffff, { ink: false, cast: false }); b.visible = false; Wd.add(b); grp.push(b); }
    cl.push([zc, grp]);
  }
  const rr = rng(5);
  const offs = cl.map(() => Array.from({ length: 9 }, () => [rr() * 2 - 1, rr()]));
  Wd.on(t => {
    cl.forEach(([zc, grp], k) => {
      const q = clamp((S.heightAt(-3.2, zc, t) - .5) / 1.6, 0, 1) * (1 - sm(t, 10, 11.5)), hq = Math.pow(q, .8);
      grp.forEach((b, i) => { const o = offs[k][i], f = i / 8; b.visible = hq > .06;
        b.position.set(-1.9 + o[0] * 1.4 + f * 1.4, TOP + .6 + hq * (1.2 + 3.8 * (.35 + .65 * o[1])) * (.4 + .6 * (1 - Math.abs(f - .5))), zc + o[0] * 2.6);
        b.scale.setScalar(.45 + hq * .9); });
    });
  });
  return rub;
}

const B14 = mkShot(33, ['CAP_B_41', 'CAP_B_42', 'CAP_B_43', 'CAP_B_44'], [0.5, 8.55, 16.6, 24.65], () => {
  const Wd = seaWorld({ shadowExt: 22, elev: 30, target: [0, 2, 0], fogNear: 60, fogFar: 330 });
  const S = sea(Wd, { amp: t => 2.3 - 1.4 * sm(t, 10, 12) - .25 * sm(t, 20, 22), wavelength: 14, dir: 0, glint: 1 });
  const rub = seawall(Wd, S); Wd.hero = rub;
  // storm clouds over the wall (only the first segment is stormy)
  { const rc = rng(21); for (let i = 0; i < 7; i++) { const c = cloud({ seed: i + 3, size: 5 + rc() * 3, color: 0x93a7b3, inkColor: 0x4a5c68, pos: [-30 + rc() * 40, 26 + rc() * 6, -40 + rc() * 80], puffs: 7, cast: false });
    c.scale.set(2.2, .9, 1.3); Wd.add(c); } }

  // ---------- beach scene: black flag, boy, rav
  const Bc = beach(Wd, { slope: .1, x0: 0, z0: ZB - 30, z1: ZB + 30, xMin: -16, xMax: 40, floor: -3, wetX: 1.6 });
  const hAt = Bc.heightAt;
  for (let i = 0; i < 11; i++) Bc.tongue({ t0: 8.5 + 1.8 * i, dur: 3.8, xBreak: -1.6, xMax: 1.8, z0: ZB - 22, z1: ZB + 22, thick: .22 });
  const fl = banner(Wd, { pos: [2.4, hAt(2.4), ZB - 2.6], color: 0x14161c, color2: 0x14161c, seed: 2 });
  { const r2 = rng(8); for (let i = 0; i < 7; i++) { const x = 8 + r2() * 24, z = ZB - 20 + r2() * 40; Wd.add(ball(.14 + r2() * .12, 0xc9b183, { pos: [x, hAt(x) + .05, z], scale: [1.3, .6, 1] })); }
    tree(Wd, { pos: [26, hAt(26), ZB - 6], scale: 1.4, kind: 0 }); tree(Wd, { pos: [30, hAt(30), ZB + 8], scale: 1.6, kind: 0 }); tree(Wd, { pos: [22, hAt(22), ZB + 14], scale: 1.3, kind: 0 }); }
  // boy walks toward the water (-x), rav raises a hand, he stops
  const bx = t => { const k = prog(t, 11.3, 15.3); return lerp(13, 6.6, ease.io(k)); };
  const bP = boy(Wd, t => { const x = bx(t), moving = t > 11.3 && t < 15.3, turn = sm(t, 16.0, 17.2);
    return { pos: [x, hAt(x), ZB + .15], facing: lerp(-Math.PI / 2, -Math.PI / 2 + 1.1, turn), gesture: 'rest', walk: moving ? (13 - x) * 8 : undefined, smile: .15, brow: sm(t, 15.3, 16) * .5 }; });
  const rP = rav(Wd, t => ({ pos: [4.1, hAt(4.1), ZB + .7], facing: face([4.1, 0, ZB + .7], [bx(t), 0, ZB + .15]), gesture: t > 13.4 && t < 22 ? 'up' : 'rest', talk: t > 16 && t < 22 ? .4 : 0 }));

  // ---------- rip current scene (top-down)
  const Br = beach(Wd, { slope: .1, x0: 0, z0: ZR - 36, z1: ZR + 36, xMin: -16, xMax: 30, floor: -3, wetX: 1.6 });
  for (let i = 0; i < 9; i++) Br.tongue({ t0: 19.5 + 2.1 * i, dur: 3.8, xBreak: -1.4, xMax: 1.4, z0: ZR - 22, z1: ZR + 22, thick: .2 });
  const hw = x => { // half width of the rip channel at world x
    if (x > -1) return 1.7; if (x > -26) return lerp(2.0, 3.0, prog(-x, 1, 26)); return lerp(3.0, 8.5, ss(26, 31, -x)) * (1 - ss(34, 36.5, -x) * .9); };
  const mkMask = (inv, W, H, x0, x1, zs) => canvasTex(W, H, (g, w, h) => {
    g.fillStyle = inv ? '#fff' : '#000'; g.fillRect(0, 0, w, h); g.filter = 'blur(5px)'; g.fillStyle = inv ? '#000' : '#fff'; g.beginPath();
    const n = 60; for (let i = 0; i <= n; i++) { const x = lerp(x1, x0, i / n), u = (x - x0) / (x1 - x0), y = h / 2 - hw(x) / zs * h * (inv ? 1.25 : 1) ; i ? g.lineTo(u * w, y) : g.moveTo(u * w, y); }
    for (let i = n; i >= 0; i--) { const x = lerp(x1, x0, i / n), u = (x - x0) / (x1 - x0), y = h / 2 + hw(x) / zs * h * (inv ? 1.25 : 1); g.lineTo(u * w, y); }
    g.closePath(); g.fill(); g.filter = 'none'; });
  // dark rip channel with seaward-moving foam streaks
  const CX0 = -37, CX1 = -1, CZ = 24;
  const rr2 = rng(33);
  const streak = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#245a6c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const y = rr2() * h, x = rr2() * w, l = 40 + rr2() * 90; g.strokeStyle = rr2() < .6 ? 'rgba(210,235,240,.75)' : 'rgba(150,120,80,.7)'; g.lineWidth = 3 + rr2() * 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (rr2() - .5) * 8); g.stroke(); } }, [6, 3]);
  const chMat = new THREE.MeshBasicMaterial({ map: streak, alphaMap: mkMask(false, 512, 256, CX0, CX1, CZ), transparent: true, opacity: .95, depthWrite: false, fog: false });
  const chGeo = new THREE.PlaneGeometry(CX1 - CX0, CZ); chGeo.rotateX(-Math.PI / 2);
  const ch = new THREE.Mesh(chGeo, chMat); ch.position.set((CX0 + CX1) / 2, 1.15, ZR); ch.renderOrder = 3; Wd.add(ch);
  // white breaking zones on both sides of the channel, moving toward the beach
  const brk = canvasTex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const x0 = i * w / 4 + 20;
    g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.moveTo(x0, 0); for (let y = 0; y <= h; y += 16) g.lineTo(x0 + 26 + 8 * Math.sin(y * .1 + i), y); for (let y = h; y >= 0; y -= 16) g.lineTo(x0 + 6 + 6 * Math.cos(y * .12), y); g.closePath(); g.fill(); } }, [3, 3]);
  const bkMat = new THREE.MeshBasicMaterial({ map: brk, alphaMap: mkMask(true, 512, 256, -17, -1, CZ), transparent: true, opacity: .9, depthWrite: false, fog: false });
  const bkGeo = new THREE.PlaneGeometry(16, CZ); bkGeo.rotateX(-Math.PI / 2);
  const bk = new THREE.Mesh(bkGeo, bkMat); bk.position.set(-9, 1.12, ZR); bk.renderOrder = 4; Wd.add(bk);
  Wd.on(t => { streak.offset.x = t * .5; brk.offset.x = -t * .22; });

  // swimmer (boy, seen from above) crossing the channel parallel to the shore, plus the gold arrow
  const sw = new THREE.Group(); Wd.add(sw);
  const skin = 0xf0d2b4;
  sw.add(ball(.3, skin, { pos: [0, .1, 1.0] })); { const kp = ball(.31, 0x101014, { pos: [0, .2, 0.98], scale: [1, .5, 1] }); sw.add(kp); }
  sw.add(box(.9, .3, 1.5, 0x2b3a5a, { pos: [0, .08, 0] }));
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * .5, .2, .55); a.add(cyl(.09, .09, 1.1, skin, { pos: [0, 0, .55], rot: [Math.PI / 2, 0, 0] })); sw.add(a); return a; });
  const legs = [-1, 1].map(s => { const l = cyl(.1, .1, 1.1, 0x1b1d24, { pos: [s * .22, .05, -1.1], rot: [Math.PI / 2, 0, 0] }); sw.add(l); return l; });
  const ringG = new THREE.RingGeometry(1.5, 2.0, 32); ringG.rotateX(-Math.PI / 2);
  const wake = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8, depthWrite: false, fog: false })); wake.position.y = -.05; sw.add(wake);
  sw.scale.setScalar(1.5);
  const zOf = t => lerp(ZR - 1.6, ZR + 9.6, ease.io(prog(t, 22, 31.5)));
  Wd.on(t => { const zz = zOf(t), zo = zz - ZR, x = -12.5 - 3.3 * ss(-1.6, 3.4, zo);
    sw.position.set(x, 1.35, zz); sw.rotation.y = 0; const ph = t * 5.5;
    arms.forEach((a, i) => { a.rotation.x = Math.sin(ph + i * Math.PI) * 1.1 - .4; }); legs.forEach((l, i) => { l.position.y = .05 + .12 * Math.sin(ph * 2 + i * Math.PI); });
    wake.scale.setScalar(1 + .12 * Math.sin(t * 6)); });
  const arrow = new THREE.Group(); Wd.add(arrow);
  const AL = 11.4;
  arrow.add(box(1.0, .12, AL - 1.8, PAL.gold, { pos: [0, 0, (AL - 1.8) / 2], inkW: .06 }));
  { const cg = new THREE.ConeGeometry(1.3, 2.2, 4); cg.rotateX(Math.PI / 2); cg.rotateZ(Math.PI / 4); const cn = new THREE.Mesh(cg, toon(PAL.gold)); cn.position.set(0, 0, AL - 1.1); arrow.add(cn); }
  arrow.position.set(-12.5, 1.5, ZR - 1.6 - 1.0);
  Wd.on(t => { const k = ease.out(prog(t, 22.2, 25)); arrow.visible = k > .01; arrow.scale.set(1, 1, Math.max(k, .001)); arrow.position.x = -12.5 - 1.6; });

  // hero follows the story
  Wd.on(t => { Wd.hero = t < 11 ? rub : t < 21 ? rP : sw; });

  // ---------- cameras
  const cam1 = fly([[0, [-17, 8, -25], [0, 3.2, -3], 50], [4, [-13, 7, -10], [0, 3, 0], 50], [7.5, [-9.5, 8.6, 6], [2, 3, 1.5], 52], [11, [-6, 11, 21], [3, 3, 2], 52]]);
  const cam2 = fly([[11, [14.5, hAt(14.5) + 1.6, ZB - 8.5], [10, hAt(10) + 1.2, ZB], 46], [16, [8.6, hAt(8) + 1.3, ZB - 4.4], [5.4, hAt(6) + 1.1, ZB + .4], 38], [21, [6.2, hAt(6) + 1.2, ZB - 3.9], [5.0, hAt(5) + 1.2, ZB + .3], 36]]);
  const cam3 = t => { const k = ease.io(prog(t, 21, 33)), zc = lerp(ZR - 4, ZR + 6.5, k), h = lerp(30, 23, k);
    return { pos: [-7.5 + 5, h, zc], look: [-8.5, 0, zc + .6], fov: 50 }; };
  return Object.assign(Wd, { cam: seq([0, cam1], [11, cam2], [21, cam3]) });
});

// ------------------------------------------------------------------ B15
const HX = (x, z) => {   // terrain height
  const coast = ss(-8, 4, x), plain = 1.2 * ss(4, 70, x) + .55 * Math.sin(x * .07 + z * .05);
  const town = ss(172, 188, x) * (1 - ss(204, 216, x));
  let h = -3 + 3.4 * coast + plain * (1 - town * .8);
  h += 15 * ss(88, 160, x) + 3.2 * Math.sin(x * .09 - z * .06 + 1) * ss(90, 140, x) * (1 - town);
  h += 8 * ss(160, 186, x);
  h += 24 * ss(214, 300, x) + 6 * Math.sin(z * .05 + x * .03) * ss(210, 260, x);
  h *= 1 - .0 * Math.abs(z);
  return h;
};
const TOWN = [190, 0];

const B15 = mkShot(18, ['CAP_B_45', 'CAP_B_46'], [0.5, 9.1], () => {
  const TY = HX(TOWN[0], TOWN[1]);
  const Wd = seaWorld({ shadowExt: 40, elev: 32, az: 10, target: [TOWN[0], TY, 0], fogNear: 150, fogFar: 520, hemi: 1.2 });
  sea(Wd, { amp: .55, wavelength: 12, dir: 0, glint: 1, calm: .02 });
  // terrain
  { const X0 = -30, X1 = 350, Z0 = -150, Z1 = 150, DX = 4, DZ = 5, nx = Math.round((X1 - X0) / DX), nz = Math.round((Z1 - Z0) / DZ), pos = [], col = [], idx = [];
    const cs = new THREE.Color(PAL.sand), cg = new THREE.Color(0x9cc45f), cg2 = new THREE.Color(0x7fb04f), co = new THREE.Color(0xb9ae5e), ct = new THREE.Color(0xdcc88f), c = new THREE.Color();
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) { const x = X0 + i * DX, z = Z0 + j * DZ, y = HX(x, z); pos.push(x, y, z);
      c.copy(cs).lerp(cg, ss(3, 14, x)).lerp(cg2, .5 + .5 * Math.sin(x * .05 + z * .06)).lerp(cs, 1 - ss(3, 14, x)).lerp(co, ss(95, 150, x)).lerp(ct, ss(210, 280, x) * .7);
      if (y < 0) c.copy(cs).multiplyScalar(.85); col.push(c.r, c.g, c.b); }
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const a = i * (nz + 1) + j, b = a + 1, cc = a + nz + 1, d = cc + 1; idx.push(a, b, cc, b, d, cc); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, toon(0xffffff, { vertexColors: true })); m.receiveShadow = true; Wd.add(m); }
  // trees
  { const r = rng(61); for (let i = 0; i < 46; i++) { const x = 14 + r() * 290, z = -70 + r() * 140; if (Math.abs(x - TOWN[0]) < 22 && Math.abs(z) < 26) continue;
      tree(Wd, { pos: [x, HX(x, z), z], scale: 1.8 + r() * 1.2, kind: x > 120 && r() < .5 ? 1 : 0 }); } }
  // the town: white houses on the plateau
  const spots = [[-26, -14, 1.5], [-22, 12, 1.6], [-12, -22, 1.4], [-10, 22, 1.5], [10, -17, 1.7], [12, 15, 1.6], [24, -8, 1.5], [24, 10, 1.4], [-34, 0, 1.5], [0, 30, 1.4], [1, -30, 1.5], [18, 28, 1.3], [-17, 4, 1.3]];
  spots.forEach(([dx, dz, s], i) => { const x = TOWN[0] + dx, z = TOWN[1] + dz; house(Wd, { pos: [x, HX(x, z), z], rot: (i % 4) * Math.PI / 2 + .15 * (i % 3), scale: s, color: 0xf8f1e0 }); });
  const H0 = HX(TOWN[0], TOWN[1]);
  const home = house(Wd, { pos: [TOWN[0], H0, TOWN[1]], rot: -Math.PI / 2, scale: 2, color: 0xfaf4e6 });
  const roofY = H0 + 3.25 * 2;
  { const r = rng(9); for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = 14 + r() * 18, x = TOWN[0] + Math.cos(a) * d, z = TOWN[1] + Math.sin(a) * d; tree(Wd, { pos: [x, HX(x, z), z], scale: 1.6 + r(), kind: 0 }); } }
  let tubeHero = null;
  const BY = boy(Wd, t => ({ pos: [TOWN[0] + 1.6, roofY, TOWN[1] - 1.0], facing: -Math.PI / 2 + .12, gesture: 'rest', smile: .35 + .6 * sm(t, 9, 11), brow: .3 * sm(t, 9, 11) }), { scale: 2.0 });
  Wd.hero = tubeHero;

  // wind ribbon path, sea -> coast -> plain -> foothills -> town -> Jerusalem hills
  const X0 = -130, X1 = 330, pts = [];
  for (let x = X0; x <= X1; x += 30) { const z = 14 * Math.sin((x - TOWN[0]) * .02), ground = Math.max(HX(x, z), 0), y = x < 100 ? Math.max(11, ground + 8) : ground + 9;
    pts.push(new THREE.Vector3(x, y, z)); }
  // pull the point nearest the town exactly to face height on the roof
  const iT = pts.findIndex(p => p.x >= TOWN[0] - 1e-6 && p.x <= TOWN[0] + 30); // closest sample at/after town
  pts.forEach((p, i) => { if (Math.abs(p.x - TOWN[0]) < 16) { p.z = TOWN[1] - 1.0; p.y = roofY + 3.2; } });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const F = t => lerp(.08, .69, ease.io(prog(t, 0, 9.4))) + .31 * ease.io(prog(t, 9.4, 17.6));
  // continuous soft tube
  const tubeG = new THREE.TubeGeometry(curve, 240, 1.0, 8, false), tubeIdx = tubeG.index.count;
  const tube = tubeHero = new THREE.Mesh(tubeG, new THREE.MeshBasicMaterial({ color: 0xfff6dc, transparent: true, opacity: .55, depthWrite: false, fog: false })); tube.frustumCulled = false; Wd.add(tube);
  // dashes
  const N = 52, dashes = [], up = new THREE.Vector3(1, 0, 0), tmp = new THREE.Vector3();
  for (let i = 0; i < N; i++) { const d = ball(1, i % 2 ? 0xffffff : 0xffd778, { scale: [4.2, .9, 1.7], inkW: .06, cast: false }); Wd.add(d); dashes.push(d); }
  Wd.on(t => {
    const f = F(t); tube.geometry.setDrawRange(0, Math.floor(f * tubeIdx / 3) * 3);
    dashes.forEach((d, i) => { const u = ((i / N + t * .17) % 1) * f; d.visible = f > .02; curve.getPointAt(u, tmp); d.position.copy(tmp).y += .15 * Math.sin(t * 3 + i);
      curve.getTangentAt(u, tmp); d.quaternion.setFromUnitVectors(up, tmp.normalize()); });
  });
  // sun clock: a sun disc fixed in the corner of the view, moving from morning to afternoon
  const sd = sunDisc(Wd, { r: .9 });
  Wd.on((t, cam) => { const u = prog(t, .8, 17.2), a = Math.PI * (1 - u), off = new THREE.Vector3(Math.cos(a) * 11 + 6, 3.6 + Math.sin(a) * 4.6, -30).applyQuaternion(cam.quaternion);
    sd.position.copy(cam.position).add(off); });
  Wd.on(t => { Wd.hero = t < 7 ? tube : t < 12 ? home : BY; });
  // labels
  vlabel(Wd, 'LBL_B_12', { pos: [4, 21, 0], height: 9, show: t => sm(t, 1.4, 2.4) * (1 - sm(t, 6.2, 7.2)) });
  vlabel(Wd, 'LBL_B_13', { pos: [TOWN[0] - 10, H0 + 30, TOWN[1] - 12], height: 9, show: t => sm(t, 8.6, 9.6) });
  vlabel(Wd, 'LBL_B_14', { pos: [275, HX(275, 0) + 16, 8], height: 12, show: t => sm(t, 12.5, 13.5) });
  // camera: high flight along the ribbon, 90 m -> 25 m, then down to the boy's roof
  const cam = fly([[0, [-150, 90, 40], [-70, 8, 0], 50], [3.5, [-10, 72, 36], [70, 8, 0], 50], [7, [120, H0 + 24, 30], [170, H0 + 6, 0], 50], [9.2, [166, roofY + 14, 20], [TOWN[0], roofY, 0], 50],
    [12, [174, roofY + 9, 13], [TOWN[0] + 1.6, roofY + 3, -1], 48], [15, [176, roofY + 6, 9], [TOWN[0] + 1.6, roofY + 3, -1], 48], [18, [TOWN[0] - 6.5, roofY + 4.2, TOWN[1] + 5.5], [TOWN[0] + 1.6, roofY + 3.2, -1], 52]]);
  return Object.assign(Wd, { cam });
});

export const shots = [B14, B15];
