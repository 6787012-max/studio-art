// b_p2.js - film_b part 2: B3 (side-section, three gauges, the wave train grows) and B4 (swell born far away, calm beach). Exports `shots`.
import { THREE, box, cyl, ball, mesh, toon, ease, prog, clamp, lerp, D, cloud } from '../../lib/stage3d.js';
import { tree, rock } from '../../lib/props3d.js';
import { PAL, seaWorld, boy, mkShot, vlabel, fly, sm } from './shared.js';
import { sea, beach } from './sea.js';

const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const C3 = h => new THREE.Color(h);

// ------------------------------------------------------------------ B3: glass-wall cross-section, gauges rise, the wave train grows
const X0 = -40, X1 = 70, DX = .25, NX = Math.round((X1 - X0) / DX), ROWS = 7, FLOOR = -8, DEPTH = 10;
const spX = x => smooth(-6, 26, x);                           // growth profile along the train
const camX3 = t => lerp(0, 25, ease.io(prog(t, 0, 25)));

const B3 = mkShot(27, ['CAP_B_06', 'CAP_B_07', 'CAP_B_08'], [0.5, 9.23, 17.97], () => {
  const Wd = seaWorld({ shadowExt: 30, elev: 28, target: [10, 0, 0], fogNear: 120, fogFar: 600 });
  // static phase table: wavelength grows with the amplitude (longer, taller waves to the right)
  const TH = new Float32Array(NX + 1), SP = new Float32Array(NX + 1);
  let acc = 0;
  for (let i = 0; i <= NX; i++) { const x = X0 + i * DX; SP[i] = spX(x); if (i) acc += 2 * Math.PI / (10 + 24 * SP[i]) * DX; TH[i] = acc; }
  const OM = Math.PI * 2 / 6.2;
  const gauge = [t => sm(t, 1.5, 6.5), t => sm(t, 9, 13.5), t => sm(t, 14, 18.5)];
  const G = t => (gauge[0](t) + gauge[1](t) + gauge[2](t)) / 3;
  const Hs = new Float32Array(NX + 1), Am = new Float32Array(NX + 1);

  // --- front face (the glass cut), top surface, crest foam, ink line
  const fPos = new Float32Array((NX + 1) * ROWS * 3), fCol = new Float32Array((NX + 1) * ROWS * 3), fIdx = [];
  const cS = C3(PAL.seaShallow), cD = C3(PAL.seaDeep), tmp = new THREE.Color();
  for (let i = 0; i <= NX; i++) for (let j = 0; j < ROWS; j++) { tmp.copy(cS).lerp(cD, Math.pow(j / (ROWS - 1), .75)); const o = (i * ROWS + j) * 3; fCol[o] = tmp.r; fCol[o + 1] = tmp.g; fCol[o + 2] = tmp.b; }
  for (let i = 0; i < NX; i++) for (let j = 0; j < ROWS - 1; j++) { const a = i * ROWS + j, b = a + 1, c = a + ROWS, d = c + 1; fIdx.push(a, b, c, b, d, c); }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fPos, 3)); fg.setAttribute('color', new THREE.BufferAttribute(fCol, 3)); fg.setIndex(fIdx);
  const front = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })); front.frustumCulled = false; Wd.add(front);
  const tPos = new Float32Array((NX + 1) * 2 * 3), tIdx = [];
  for (let i = 0; i < NX; i++) { const a = i * 2, b = a + 1, c = a + 2, d = c + 1; tIdx.push(a, b, c, b, d, c); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(tPos, 3)); tg.setIndex(tIdx);
  const top = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ color: 0x9be0f2, side: THREE.DoubleSide })); top.frustumCulled = false; Wd.add(top);
  const strip = (color, z) => { const p = new Float32Array((NX + 1) * 2 * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setIndex(tIdx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })); m.frustumCulled = false; Wd.add(m); return { p, z, m }; };
  const foam = strip(0xffffff, .03), inkL = strip(PAL.ink, .05);
  Wd.hero = front;

  // --- sand bed under the glass, glass lip, far back
  Wd.add(box(120, 4, DEPTH + .2, PAL.sand, { pos: [15, FLOOR - 2, -DEPTH / 2 + .1], inkW: .06 }));
  const lip = new THREE.Mesh(new THREE.PlaneGeometry(120, 18), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .06, depthWrite: false })); lip.position.set(15, 1, .12); Wd.add(lip);

  Wd.on(t => {
    const g = G(t);
    for (let i = 0; i <= NX; i++) {
      const x = X0 + i * DX, A = .3 + 3.7 * g * SP[i], th = TH[i] - OM * t;
      const h = A * (Math.sin(th) + .22 * Math.sin(2 * th + .6)) * .85; Hs[i] = h; Am[i] = A;
      for (let j = 0; j < ROWS; j++) { const o = (i * ROWS + j) * 3; fPos[o] = x; fPos[o + 1] = lerp(h, FLOOR, j / (ROWS - 1)); fPos[o + 2] = 0; }
      tPos[i * 6] = x; tPos[i * 6 + 1] = h; tPos[i * 6 + 2] = 0; tPos[i * 6 + 3] = x; tPos[i * 6 + 4] = h; tPos[i * 6 + 5] = -DEPTH;
      const cr = clamp(h / Math.max(.35, A * .9), 0, 1), th2 = .1 + .5 * cr * cr * clamp(A / 1.2, .35, 1);
      for (const s of [foam]) { s.p[i * 6] = x; s.p[i * 6 + 1] = h + .03; s.p[i * 6 + 2] = s.z; s.p[i * 6 + 3] = x; s.p[i * 6 + 4] = h - th2; s.p[i * 6 + 5] = s.z; }
      inkL.p[i * 6] = x; inkL.p[i * 6 + 1] = h + .09; inkL.p[i * 6 + 2] = inkL.z; inkL.p[i * 6 + 3] = x; inkL.p[i * 6 + 4] = h + .01; inkL.p[i * 6 + 5] = inkL.z;
    }
    fg.attributes.position.needsUpdate = true; tg.attributes.position.needsUpdate = true; foam.m.geometry.attributes.position.needsUpdate = true; inkL.m.geometry.attributes.position.needsUpdate = true;
  });

  // --- the shore shelf with three thermometer gauges (follows the truck so it stays in frame)
  const shore = new THREE.Group(); Wd.add(shore);
  shore.add(box(11, 3, 9, PAL.sand, { pos: [-4.5, -4.7, 10.5], inkW: .05 }));
  const GH = 6.4, GY = -3.2, GX = [-9.1, -5.7, -2.3], ids = ['LBL_B_02', 'LBL_B_03', 'LBL_B_04'], cols = [0xe5473c, 0xe5473c, 0xe5473c], fills = [];
  GX.forEach((x, i) => {
    const gr = new THREE.Group(); gr.position.set(x, GY, 10.5); shore.add(gr);
    gr.add(box(.62, GH, .5, 0xffffff, { pos: [0, GH / 2 + .35, 0], inkW: .04, ink: true }).clone());
    const tube = box(.62, GH, .5, 0xeaf6ff, { pos: [0, GH / 2 + .35, 0], inkW: .04 }); tube.material = tube.material.clone(); tube.material.transparent = true; tube.material.opacity = .55; gr.add(tube);
    gr.add(ball(.5, cols[i], { pos: [0, .42, 0], inkW: .04 }));
    const fill = box(.3, 1, .3, cols[i], { pos: [0, .5, 0], ink: false }); gr.add(fill); fills.push(fill);
    for (let k = 1; k <= 6; k++) gr.add(box(.34, .06, .52, PAL.gold, { pos: [.0, .35 + k, 0], ink: false }));
    vlabel(Wd, ids[i], { pos: t => [x + camX3(t), GY + GH + 1.7 + (i % 2) * 1.1, 10.5], height: 1.0, show: t => sm(t, i === 0 ? 1.2 : i === 1 ? 8.8 : 13.8, i === 0 ? 2.4 : i === 1 ? 10 : 15) * (1 - sm(t, 19.5, 20.5)) });
  });
  Wd.on(t => { shore.position.set(camX3(t), -sm(t, 19.5, 22) * 9, 0);
    fills.forEach((f, i) => { const L = 5.9 * gauge[i](t) + .02; f.scale.y = L; f.position.y = .7 + L / 2; }); });

  // --- long gold wind arrows over the water
  const arrows = [];
  [[7.2, 0], [9.1, .37], [11.0, .71]].forEach(([y, ph], i) => {
    const a = new THREE.Group(), mat = toon(PAL.gold, { transparent: true, opacity: 1 });
    const shaft = mesh(new THREE.BoxGeometry(6, .36, .36), mat, { inkW: .05, box: true }); shaft.position.x = -.6; a.add(shaft);
    const headG = new THREE.ConeGeometry(.75, 1.7, 4); headG.rotateZ(-Math.PI / 2); const head = mesh(headG, mat, { inkW: .05 }); head.position.x = 3.2; a.add(head);
    a.position.z = 1.2; Wd.add(a); arrows.push({ a, y, ph, mat });
  });
  Wd.on(t => { const vis = sm(t, 1.0, 2.5) * (1 - sm(t, 19.5, 21));
    arrows.forEach((r, i) => { const s = (((t * 2.4 / 40 + r.ph) % 1) + 1) % 1, x = camX3(t) - 24 + 48 * s;
      r.a.position.set(x, r.y + .12 * Math.sin(t * 1.6 + i * 2), 1.2); r.a.visible = vis > .02; r.a.scale.setScalar(.6 + .6 * vis * (.7 + .3 * G(t) * 0 + .3 * (i === 0 ? 1 : G(t)))); }); });

  const cam = t => { const x = camX3(t), k = ease.io(prog(t, 0, 27));
    return { pos: [x, lerp(3.5, 4.4, k), lerp(31, 27, k)], look: [x + 1.5, lerp(2.0, 1.9, k), 0], fov: 40 }; };
  return Object.assign(Wd, { cam });
});

// ------------------------------------------------------------------ B4: swell born at a far storm, runs to the calm beach
const BX = 10;   // boy x on the beach
const B4 = mkShot(22, ['CAP_B_09', 'CAP_B_10', 'CAP_B_11'], [0.5, 7.57, 14.63], () => {
  const Wd = seaWorld({ shadowExt: 18, elev: 28, target: [8, 0, 0], fogNear: 90, fogFar: 760 });
  const S = sea(Wd, { amp: .55, wavelength: 36, dir: 0, calm: .01 });
  const B = beach(Wd, { slope: .09, x0: 0, z0: -45, z1: 45, xMax: 60, xMin: -14, wetX: 5 });
  B.tongue({ t0: 16.2, dur: 6.5, xBreak: 1.5, xMax: 6.2, thick: .26 });
  // storm cloud at the horizon + rain curtain + wind sheets
  const cl = cloud({ seed: 7, size: 37, puffs: 9, color: 0x8e9db6, inkColor: 0x46546c, pos: [-300, 56, -5], cast: false });
  cl.scale.set(1.2, 1.25, 1.1); cl.traverse(m => { if (m.material && m.material.isMeshToonMaterial) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(0x3a4660); m.material.emissiveIntensity = .5; } });
  Wd.add(cl); Wd.hero = cl;
  const rain = new THREE.Mesh(new THREE.PlaneGeometry(120, 34), new THREE.MeshBasicMaterial({ color: 0x6d7c95, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false })); rain.position.set(-292, 20, -5); rain.rotation.y = Math.PI / 2; Wd.add(rain);
  const sheets = [];
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(26 + (i % 4) * 7, 1.1 + (i % 3) * .5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.rotation.y = Math.PI / 2; Wd.add(m);
    sheets.push({ m, y: 4 + (i * 7.3) % 52, z: -70 + (i * 29) % 140, v: 9 + (i % 4) * 2.5, ph: i * .083 }); }
  Wd.on(t => sheets.forEach(s => { const u = (((t * s.v / 70 + s.ph) % 1) + 1) % 1; s.m.position.set(-345 + u * 70, s.y, s.z); s.m.material.opacity = .75 * Math.sin(u * Math.PI) * sm(t, 0, 1); }));
  vlabel(Wd, 'LBL_B_05', { pos: [-300, 112, -5], height: 17, show: t => sm(t, 1.5, 3) * (1 - sm(t, 14, 15.5)) });

  // swell crest ribbons: follow the real surface (found by local search), fade out as the camera comes down
  const NR = 10, NZ = 30, ZA = -95, ZB = 95, rib = [];
  for (let n = 0; n < NR; n++) { const p = new Float32Array((NZ + 1) * 2 * 3), idx = [];
    for (let j = 0; j < NZ; j++) { const a = j * 2, b = a + 1, c = a + 2, d = c + 1; idx.push(a, b, c, b, d, c); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = 1; Wd.add(m); rib.push({ p, g, m }); }
  const hAt = (x, z, t) => S.heightAt(x, z, t);
  Wd.on(t => {
    const hs = [], step = 1.5; let prev = hAt(-345, 0, t), cur = hAt(-343.5, 0, t);
    for (let x = -343.5; x < -10; x += step) { const nxt = hAt(x + step, 0, t); if (cur > prev && cur >= nxt && cur > .18) hs.push(x); prev = cur; cur = nxt; }
    const fade = 1 - sm(t, 9, 15);
    rib.forEach((r, n) => {
      if (n >= hs.length || fade < .01) { r.m.visible = false; return; }
      r.m.visible = true; let xc = hs[n];
      for (let j = 0; j <= NZ; j++) { const z = ZA + (ZB - ZA) * j / NZ; let best = xc, bh = -9;
        for (let dx = -3; dx <= 3.01; dx += .5) { const hh = hAt(xc + dx, z, t); if (hh > bh) { bh = hh; best = xc + dx; } }
        xc = best; const y = bh + .1; r.p.set([best - 1.2, y, z, best + 1.2, y, z], j * 6); }
      r.g.attributes.position.needsUpdate = true;
      r.m.material.opacity = .9 * fade * smooth(-330, -250, hs[n]) * sm(t, 0.3, 2.5);
    });
  });

  // beach life: the boy, a limp flag, a tree, rocks
  boy(Wd, t => ({ pos: [BX, B.heightAt(BX), -.05], facing: -Math.PI / 2, gesture: 'rest', talk: 0, smile: .15, groundY: 0 }));
  const FX = 13.5, FZ = -3.5, FY = B.heightAt(FX);
  const pole = new THREE.Group(); pole.position.set(FX, FY, FZ); Wd.add(pole);
  pole.add(cyl(.04, .05, 3.2, 0x7a5232, { pos: [0, 1.6, 0] })); pole.add(ball(.08, PAL.gold, { pos: [0, 3.25, 0] }));
  pole.add(box(.03, .45, .8, PAL.red, { pos: [0, 2.85, -.42], inkW: .012 })); pole.add(box(.03, .45, .8, 0xf8f0dc, { pos: [0, 2.4, -.42], inkW: .012 })); pole.add(box(.03, .45, .8, PAL.red, { pos: [0, 1.95, -.42], inkW: .012 }));
  tree(Wd, { pos: [26, B.heightAt(26), 9], kind: 0 }); tree(Wd, { pos: [30, B.heightAt(30), -12], kind: 0 });
  rock(Wd, { pos: [18, B.heightAt(18), 7], seed: 4 }); rock(Wd, { pos: [8, B.heightAt(8) - .1, -9], seed: 9, scale: .7 });

  const cam = fly([[0, [26, 60, 6], [-150, 8, 0], 52], [6, [23, 38, 4], [-130, 6, 0], 50], [13, [19, 12, 2.4], [-70, 2.5, 0], 47], [22, [14, 2.1, .9], [-30, 1.5, .1], 45]]);
  return Object.assign(Wd, { cam });
});

export const shots = [B3, B4];
