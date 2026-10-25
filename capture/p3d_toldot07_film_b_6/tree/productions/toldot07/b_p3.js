// b_p3.js - film_b part 3: B5 (the bottle rides the waves, the key lesson) and B6 (five bottles, one long wave). Exports `shots`.
import { THREE, box, ease, prog, clamp, lerp, D } from '../../lib/stage3d.js';
import { PAL, seaWorld, mkShot, vlabel, goldLine, fly, sm } from './shared.js';
import { sea, bottle } from './sea.js';

// ------------------------------------------------------------------ B5: the bottle at 40 % of frame height, three clean waves, fixed gold line
const B5_SPEED = 1.3, B5_LAM = 4.2, B5_AMP = .3;
const B5 = mkShot(22, ['CAP_B_12', 'CAP_B_13', 'CAP_B_14'], [0.5, 7.57, 14.63], () => {
  const Wd = seaWorld({ shadowExt: 6, elev: 27, fogNear: 30, fogFar: 260 });
  const S = sea(Wd, { amp: B5_AMP, wavelength: B5_LAM, speed: B5_SPEED, dir: 0 });
  const b = bottle(Wd, { sea: S, at: [0, 0], scale: 3, yaw: 0 }); Wd.hero = b;
  // fixed gold dashed line through the bottle (it does not move sideways)
  goldLine(Wd, { pos: [0, 0], y0: -.7, y1: 1.45, dash: .14, gap: .08, r: .014 });
  // small wave-height ruler beside it (white post, ink ticks every 0.1 m, gold marks at +-0.25 m)
  const RX = -1.35, RZ = -.2;
  Wd.add(box(.06, 1.5, .06, 0xffffff, { pos: [RX, -.1, RZ], inkW: .012 }));
  for (let i = -6; i <= 5; i++) {
    const y = i * .1, big = i % 5 === 0;
    Wd.add(box(big ? .22 : .13, .018, .05, i === 0 ? PAL.gold : PAL.ink, { pos: [RX + (big ? .1 : .065), y, RZ], inkW: 0 }));
  }
  [-.25, .25].forEach(y => Wd.add(box(.34, .03, .06, PAL.gold, { pos: [RX + .14, y, RZ], inkW: .006 })));
  vlabel(Wd, 'LBL_B_06', { pos: [0, 1.62, 0], height: .24, show: t => sm(t, 1.4, 2.4) * (1 - sm(t, 20.7, 21.6)) });
  // camera: slow push-in, then 3 s dolly at exactly the wave speed, stop, 60 degree orbit
  const N = 2400, XT = new Float32Array(N + 1); let acc = 0;
  for (let i = 1; i <= N; i++) { const t = i * 22 / N; acc += B5_SPEED * sm(t, 4.6, 5.2) * (1 - sm(t, 7.8, 8.4)) * 22 / N; XT[i] = acc; }
  const X0 = XT[Math.round(6.5 / 22 * N)];
  const camX = t => XT[Math.min(N, Math.max(0, Math.round(t / 22 * N)))] - X0;
  const LOOK = [0, .08, 0], HF = 1.7;
  const fovFor = d => 2 * Math.atan(HF / (2 * d)) / D;
  const polar = (a, r, y) => { const p = [Math.sin(a) * r, y, Math.cos(a) * r]; return { pos: p, look: LOOK, fov: fovFor(Math.hypot(p[0], p[2], p[1] - LOOK[1])) }; };
  const x8 = camX(8), z8 = 2.3, a0 = Math.atan2(x8, z8), r0 = Math.hypot(x8, z8);
  const cam = t => {
    if (t < 8) { const z = lerp(3.1, z8, ease.io(prog(t, 0, 5))), y = lerp(.78, .6, ease.io(prog(t, 0, 8))); const p = [camX(t), y, z];
      return { pos: p, look: LOOK, fov: fovFor(Math.hypot(p[0], p[2], p[1] - LOOK[1])) }; }
    const k = ease.io(prog(t, 8, 22)); return polar(a0 - 60 * D * k, lerp(r0, 2.7, k), lerp(.6, .5, k));
  };
  return Object.assign(Wd, { cam });
});

// ------------------------------------------------------------------ B6: five bottles in a row, one long wave runs along it, a white ring pulse travels
const B6_AMP = .5;
const B6 = mkShot(20, ['CAP_B_15', 'CAP_B_16', 'CAP_B_17'], [0.5, 6.9, 13.3], () => {
  const Wd = seaWorld({ shadowExt: 14, elev: 27, fogNear: 50, fogFar: 320 });
  const S = sea(Wd, { amp: B6_AMP, wavelength: 12, speed: 2.4, dir: 0 });
  const XS = [-6, -3, 0, 3, 6], rings = [], BT = [];
  XS.forEach((x, i) => {
    const bt = bottle(Wd, { sea: S, at: [x, 0], scale: 5.6, yaw: 0 }); BT.push(bt); if (i === 2) Wd.hero = bt;
    goldLine(Wd, { pos: [x, 0], y0: -.8, y1: 2.5, dash: .18, gap: .1, r: .03 });
    const g = new THREE.Group(), tor = new THREE.Mesh(new THREE.TorusGeometry(1.0, .05, 8, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    tor.rotation.x = Math.PI / 2; g.add(tor); g.rotation.order = 'XZY'; Wd.add(g); rings.push({ g, tor, x });
  });
  Wd.on(t => rings.forEach(r => {
    const q = S.rideAt(r.x, 0, t), hn = clamp(S.heightAt(r.x, 0, t) / (B6_AMP * .8), 0, 1), pulse = Math.pow(hn, 3);
    r.g.position.set(r.x, q.pos[1] + .05, 0); r.g.rotation.set(-Math.atan(q.gz), 0, Math.atan(q.gx));
    r.g.scale.setScalar(.85 + .45 * pulse); r.tor.material.opacity = .12 + .88 * pulse;
  }));
  const cam = fly([
    [0, [-7.5, 8, 10], [-1, .2, 0], 46],
    [8, [-5.5, 2.3, 4.8], [-2, .4, 0], 46],
    [14, [-1, 2.1, 4.5], [1.2, .4, 0], 46],
    [20, [3, 2.1, 4.5], [5, .4, 0], 46]]);
  Wd.on(t => { const lx = cam(t).look[0]; let bi = 0; XS.forEach((x, i) => { if (Math.abs(x - lx) < Math.abs(XS[bi] - lx)) bi = i; }); Wd.hero = BT[bi]; });
  return Object.assign(Wd, { cam });
});

export const shots = [B5, B6];
