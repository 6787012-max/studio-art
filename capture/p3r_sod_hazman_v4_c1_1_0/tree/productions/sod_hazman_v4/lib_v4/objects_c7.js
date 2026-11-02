// objects_c7.js - set pieces for chapter c7 only (dawn and dusk of Jerusalem, candle room, sunset graph, white horizon). No Hebrew, no people.
import { THREE, box, cyl, mesh, toon, ease, prog, clamp, lerp, rng, O, D2R, candle, textPlane, tube, reveal, sunBall, goldRing, ringAnim } from './kit_c4567.js';

const col = k => new THREE.Color(k);
// ---------------------------------------------------------------- Jerusalem dawn: stone city, hills, sky and sun driven by one number u (0 night .. 1 morning)
export function dawnWorld(Wd) {
  const sky = O.skyDome(Wd, {}); O.lighting(Wd, { key: [0x9db8ff, 1.0, [-30, 45, -25]], hemi: [0x4a5c92, 0x20182a, .9], rim: [0x6f8cff, .6, [25, 30, -50]], target: [0, 4, -30], shadowExt: 75, shadowMap: 1024, fog: [0x1b2850, 45, 300] });
  Wd.scene.fog = new THREE.Fog(0x1b2850, 45, 300);
  const g0 = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), toon(0x4a4a58)); g0.rotation.x = -Math.PI / 2; g0.receiveShadow = true; Wd.add(g0);
  O.hills(Wd, { colors: [0x24384a, 0x2c4650, 0x1f3040], list: [[-30, -118, 30, 15, 22], [38, -118, 34, 17, 24], [-78, -112, 28, 12, 18], [90, -112, 30, 13, 20], [-10, -170, 70, 22, 30], [60, -170, 60, 20, 30]] });
  const C = O.city(Wd, { seed: 29, n: 56, litFrac: .22, area: [-58, 58, -12, -62], slope: .05, cypress: 6 });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 28, 16), O.basic(0xffe9a0)), sg = O.glow(90, 0xffc070, 0), sg2 = O.glow(240, 0xffa860, 0); Wd.add(sun); Wd.add(sg); Wd.add(sg2);
  const hz = O.glow(260, 0xff9a60, 0); hz.position.set(7, 4, -150); hz.scale.set(420, 60, 1); Wd.add(hz);
  const keys = [[0, 0x050a22, 0x142458, 0x4c4a78], [.4, 0x1a2a64, 0x5a4a88, 0xe88a5a], [.65, 0x4a78c8, 0xf0a870, 0xffd08a], [1, 0x6aa4e8, 0xbcd8f0, 0xfbe6c0]];
  const skyAt = u => { let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++; const k = clamp((u - keys[i][0]) / (keys[i + 1][0] - keys[i][0]), 0, 1), e = ease.sm(k); return [1, 2, 3].map(j => col(keys[i][j]).lerp(col(keys[i + 1][j]), e)); };
  const keyA = col(0x9db8ff), keyB = col(0xff9a60), keyC = col(0xfff0d8), fogA = col(0x1b2850), fogB = col(0xd9a080), fogC = col(0xc8d8e8);
  const mark = new THREE.Group(); mark.position.set(-6.5, 11.5, -112); mark.add(cyl(.5, .7, 5, 0xd9c9a4, { pos: [0, 2.5, 0], inkW: .08 })); const mgl = O.glow(8, 0xffd070, .8); mgl.position.y = 5.5; mark.add(mgl); Wd.add(mark);
  const api = { sky, C, sun, mark, set(u) { const [top, mid, bot] = skyAt(u); sky.uni.top.value.copy(top); sky.uni.mid.value.copy(mid); sky.uni.bot.value.copy(bot); sky.starU.uA.value = 1 - ease.sm(prog(u, .25, .6));
    const su = prog(u, .42, .84); sun.position.set(7, lerp(-9, 24, ease.sm(su)), -150); sg.position.copy(sun.position); sg2.position.copy(sun.position); sg.material.opacity = .85 * ease.sm(prog(u, .5, .86)); sg2.material.opacity = .45 * ease.sm(prog(u, .55, .95)); sun.visible = su > 0;
    hz.material.opacity = .65 * ease.sm(prog(u, .12, .45)) * (1 - ease.sm(prog(u, .62, .9)));
    const kc = u < .65 ? keyA.clone().lerp(keyB, ease.sm(prog(u, .25, .65))) : keyB.clone().lerp(keyC, ease.sm(prog(u, .65, 1))); Wd.sun.color.copy(kc); Wd.sun.intensity = lerp(.9, 2.0, ease.sm(prog(u, .3, 1)));
    Wd.sun.position.set(lerp(-30, 40, ease.sm(prog(u, .3, .9))), lerp(45, 55, prog(u, .5, 1)), lerp(-25, -10, prog(u, .3, 1))); Wd.hemi.color.copy(col(0x4a5c92).lerp(col(0xbfd4f0), ease.sm(prog(u, .35, 1)))); Wd.hemi.intensity = lerp(.9, 1.15, ease.sm(prog(u, .3, 1)));
    Wd.scene.fog.color.copy(fogA.clone().lerp(u < .65 ? fogB : fogC, ease.sm(prog(u, .3, .65))).lerp(fogC, ease.sm(prog(u, .65, 1)))); C.winMat.color.set(0xffd488).lerp(col(0x39404a), ease.sm(prog(u, .5, .8))); C.glows.forEach(gl => { gl.material.opacity = .55 * (1 - ease.sm(prog(u, .5, .8))); });
    mgl.material.opacity = .8 * (.4 + .6 * ease.sm(prog(u, .1, .4))) * (1 - .6 * ease.sm(prog(u, .7, .95))); } };
  return api;
}
// big ashlar wall, a sliding band of first light, a lit minyan window above
export function kotelWall(Wd) {
  const g = O.grp(Wd), T = [O.stoneTex(3, '#d9c9a4'), O.stoneTex(5, '#cdb98f')];
  for (let row = 0; row < 9; row++) { const h = 1.1 - row * .02; let x = -10 - (row % 2) * .9; while (x < 10) { const w = 1.8 + ((row * 7 + Math.floor(x * 3)) % 5) * .35; g.add(O.texBox(w - .06, h - .04, .6, T[(row + Math.floor(x)) & 1], 0xe0d4bc, { pos: [x + w / 2, .55 + row * 1.08, 0], inkW: .02, k: .5 })); x += w; } }
  const band = new THREE.Mesh(new THREE.PlaneGeometry(26, 3.6), new THREE.MeshBasicMaterial({ map: O.glowTexture(), color: 0xffc070, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); band.position.z = .45; g.add(band);
  const arch = new THREE.Shape(); arch.moveTo(-.7, 0); arch.lineTo(.7, 0); arch.lineTo(.7, 2.0); arch.absarc(0, 2.0, .7, 0, Math.PI, false); arch.lineTo(-.7, 0);
  const win = new THREE.Mesh(new THREE.ShapeGeometry(arch, 12), O.basic(0x3a3040)); win.position.set(3.0, 6.0, .34); g.add(win); const wg = O.glow(4, 0xffc060, 0); wg.position.set(3.0, 7.2, .8); g.add(wg);
  return { group: g, band, win, wg };
}
// dusk sky with hills; three stars that appear one by one
export function duskWorld(Wd) {
  const sky = O.skyDome(Wd, { top: 0x142a5a, mid: 0x6a4a78, bot: 0xf09a60, stars: 0 }); O.lighting(Wd, { key: [0xffa870, .7, [-30, 20, 20]], hemi: [0x6a6a98, 0x3a2a38, .8], rim: [0x8aa0ff, .3, [20, 10, -30]], target: [0, 3, -30], shadowExt: 60, fog: [0x6a4a68, 60, 300] });
  Wd.scene.fog = new THREE.Fog(0x6a4a68, 60, 300); const g0 = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), toon(0x4a4050)); g0.rotation.x = -Math.PI / 2; Wd.add(g0);
  O.hills(Wd, { colors: [0x3a3050, 0x2a2842, 0x4a3a58], list: [[-30, -118, 34, 12, 22], [40, -120, 40, 14, 24], [-90, -112, 30, 10, 18], [100, -112, 34, 12, 20], [0, -170, 80, 18, 30]] });
  const C = O.city(Wd, { seed: 29, n: 56, litFrac: .25, area: [-58, 58, -12, -62], slope: .05, cypress: 6 });
  const stars = [[-14, 46, -150], [10, 54, -140], [28, 40, -150]].map(p => { const s = new THREE.Group(); s.position.set(...p); const c = new THREE.Mesh(new THREE.OctahedronGeometry(.9, 0), O.basic(0xfff6d0)); s.add(c); s.add(O.glow(14, 0xfff0b0, .9)); const rg = goldRing(Wd); Wd.add(s); return { g: s, rg }; });
  return { sky, C, stars, setDusk(u) { sky.uni.top.value.setHex(0x142a5a).lerp(col(0x050a22), u); sky.uni.mid.value.setHex(0x6a4a78).lerp(col(0x1a2458), u); sky.uni.bot.value.setHex(0xf09a60).lerp(col(0x4a3a68), u * .8); } };
}
// candle room: white tablecloth, two candles, a wall clock, a window with the low winter sun and stone houses outside
export function candleRoom(Wd) {
  const R = {}, pl = O.plasterTex('#e6d6b4'), g = O.grp(Wd);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), toon(0xffffff, { map: O.woodTex(6, '#9a6a3a', 128) })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, -1); g.add(fl);
  g.add(O.texBox(.3, 4, 8, pl, 0xffffff, { pos: [-4.5, 2, -1.2], k: .35, inkW: .01 })); g.add(O.texBox(10, 4, .3, pl, 0xffffff, { pos: [0, 2, -4.2], k: .35, inkW: .01 }));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.4), O.basic(0xf6c890)); win.position.set(-4.3, 2.3, -1.0); win.rotation.y = Math.PI / 2; g.add(win); R.win = win; R.winGlow = O.glow(8, 0xffb060, .7); R.winGlow.position.set(-4.0, 2.3, -1.0); g.add(R.winGlow);
  const sunW = new THREE.Mesh(new THREE.CircleGeometry(.35, 24), O.basic(0xff9a40)); sunW.position.set(-4.28, 1.35, -.2); sunW.rotation.y = Math.PI / 2; g.add(sunW); R.sunW = sunW;
  [-1, 1].forEach(s => g.add(box(.1, 2.5, .08, 0x6a4526, { pos: [-4.2, 2.3, -1.0 + s * 1.5], inkW: .006 }))); g.add(box(.1, .08, 3.1, 0x6a4526, { pos: [-4.2, 2.3, -1.0], inkW: .006 }));
  g.add(box(3.2, .12, 1.7, 0x9a6a3a, { pos: [0, .95, -1.6], inkW: .01 })); [[-1.4, -2.3], [1.4, -2.3], [-1.4, -.9], [1.4, -.9]].forEach(([x, z]) => g.add(box(.12, .95, .12, 0x7a5232, { pos: [x, .47, z], inkW: .006 })));
  g.add(box(3.5, .06, 1.9, 0xf6f2e8, { pos: [0, 1.04, -1.6], inkW: .008 })); g.add(box(3.5, .5, .06, 0xf6f2e8, { pos: [0, .8, -.65], inkW: .008 }));
  R.clock = O.wallClock(Wd, { pos: [1.4, 2.8, -4.0], r: .55, S: 16 * 3600 + 22 * 60 - 12 * 3600 }); g.add(R.clock.group);
  R.candles = [candle(Wd, { pos: [-.5, 1.07, -1.6], h: .55, scale: 1.5 }), candle(Wd, { pos: [.5, 1.07, -1.6], h: .55, scale: 1.5 })]; R.group = g; return R;
}
// the sunset / day-length graph (day index 0..60). Real shapes: earliest sunset about day 14, shortest day at day 28
export const sunsetAt = i => 16.58 + .00028 * Math.pow(i - 14, 2) + (i > 14 ? 0 : .0004 * Math.pow(i - 14, 2));
export const dayLenAt = i => 9.82 + .0000 + .00085 * Math.pow(i - 28, 2) * (i > 28 ? 1.0 : 1.0);
export function graph(Wd) {
  const G = O.grp(Wd), W = 12, H = 5; G.add(box(W + 1, H + 1, .2, 0x15203a, { pos: [W / 2, H / 2, -.2], inkW: .02 })); G.add(box(W + .4, .08, .1, 0xe6c880, { pos: [W / 2, 0, 0], ink: false })); G.add(box(.08, H + .4, .1, 0xe6c880, { pos: [0, H / 2, 0], ink: false }));
  for (let i = 0; i <= 60; i += 5) G.add(box(.04, i % 15 === 0 ? .3 : .15, .06, 0xe6c880, { pos: [i / 60 * W, -.1, 0], ink: false })); for (let k = 1; k <= 4; k++) G.add(box(W, .015, .02, 0x4a5a88, { pos: [W / 2, k * H / 5, -.05], ink: false }));
  const X = i => i / 60 * W, Y1 = i => (sunsetAt(i) - 16.5) / .75 * H * .8 + .3, Y2 = i => (dayLenAt(i) - 9.7) / 1.1 * H * .8 + .3;
  const mk = f => Array.from({ length: 41 }, (_, k) => { const i = k * 1.5; return [X(i), f(i), .1]; });
  const c1 = tube(mk(Y1), .07, 0xffb050, { seg: 120, rs: 6 }), c2 = tube(mk(Y2), .07, 0x6ac0ff, { seg: 120, rs: 6 }); G.add(c1); G.add(c2); reveal(c1, 0); reveal(c2, 0);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), O.basic(0xffd070)), bg = O.glow(1.2, 0xffd070, .9); G.add(ball); G.add(bg); const mkLine = (i, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.06, H), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(X(i), H / 2, .05); G.add(m); return m; };
  const l14 = mkLine(14, 0xffb050), l28 = mkLine(28, 0x6ac0ff); const br = box(X(14), .1, .08, 0xffe08a, { pos: [X(14) / 2 + X(14), -.45, 0], ink: false }); br.scale.x = 0; br.position.set(X(21), -.5, 0); G.add(br);
  return { group: G, c1, c2, ball, bg, l14, l28, br, X, Y1, Y2, W, H };
}
// white snowy plain and a sun that skims the horizon without touching it
export function snowHorizon(Wd) {
  const sky = O.skyDome(Wd, { top: 0x6a88c0, mid: 0xc8d8ee, bot: 0xfff0d8, stars: 0 }); O.lighting(Wd, { key: [0xfff0d8, 1.2, [-30, 10, -40]], hemi: [0xdbe8f8, 0xe8f0f8, 1.0], rim: [0xffd0a0, .5, [20, 4, -30]], target: [0, 0, -30], shadowExt: 40, fog: [0xf0e8e0, 40, 260] });
  Wd.scene.fog = new THREE.Fog(0xf0e8e0, 40, 260); const g0 = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), toon(0xf4f6fa)); g0.rotation.x = -Math.PI / 2; g0.receiveShadow = true; Wd.add(g0);
  const r = rng(5); for (let i = 0; i < 18; i++) Wd.add(mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xe8eef8), { ink: false, scale: [3 + r() * 6, .5 + r() * 1.2, 3 + r() * 5], pos: [-60 + r() * 120, 0, -20 - r() * 80] }));
  for (let i = 0; i < 6; i++) { const p = new THREE.Group(); p.position.set(-14 + i * 6 + r() * 3, 0, -8 - r() * 14); p.add(cyl(.05, .12, 1.6, 0x4a3a30, { pos: [0, .8, 0], inkW: .01 })); [0, .5, 1.0].forEach((y, k) => p.add(mesh(new THREE.ConeGeometry(.9 - k * .25, 1.0, 8), toon(0x2f5a46), { inkW: .02, pos: [0, 1.0 + y, 0] }))); Wd.add(p); }
  const sun = sunBall(Wd, 4, { core: 0xfff4d0, halo: 0xffe0a0, halo2: 0xffc880 }); return { sky, sun };
}
