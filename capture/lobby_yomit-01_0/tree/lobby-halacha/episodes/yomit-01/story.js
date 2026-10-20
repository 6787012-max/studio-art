// yomit-01 story: "fire on Yom Tov" (halacha yomit, R' Fried) - 3D choreography per storyboards_v2.md (C). Boys only; nobody holds a match or an open flame: everything lights "by itself" (magic floating candles).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, plainRoom, nightWindow, diningTable, chair, candle, clock, mark3d, qmark, board, drawWord, shock,
    matchbox, matchStick, flameArc, dotPath, door, popE, lighting, glowAt, glowSprite, lerpV, arcPt, shakeCam, archShape, booksTex, planksTex, canvasTex, toon } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly || -.09 * d];
  const SIT = { sit: true, groundY: 0 }, TY = .72, CT = TY + .04, TX = 1.5, TZ = .2, YP = [-4.0, 1.46, -4.55];
  const c3 = new THREE.Color(), COLD = new THREE.Color(0xb8a890), WARM = new THREE.Color(0xffe2b0), NIGHT = new THREE.Color(0x1a2550), DUSK = new THREE.Color(0xff8f4a);
  const mixC = (a, b, k) => new THREE.Color().copy(a).lerp(b, clamp(k, 0, 1));
  const tipOf = (g, rz, L) => [g.position.x - Math.sin(rz) * L, g.position.y + Math.cos(rz) * L, g.position.z];   // top of a thin candle (for the flame arcs)

  function skyWindow(Wd, x, y0, z, w, h) {
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const mat = new THREE.MeshBasicMaterial({ color: 0x1a2550, fog: false }), pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), mat); pn.position.z = .02; g.add(pn);
    const sun = glowSprite(1.1, 1.1, 0); sun.material.color.set(0xffd27a); sun.position.set(0, h * .3, .04); g.add(sun);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .06], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .06], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
    return { set(k) { mat.color.copy(NIGHT).lerp(DUSK, k); sun.material.opacity = k * .95; sun.position.y = lerp(h * .55, h * .22, k); } };
  }
  function yahrzeit(Wd, pos, o) {   // glass memorial candle, burning
    o = o || {}; const c = candle(Wd, { pos, h: .13, r: .03, holder: false, fs: .55, color: 0xfff4d8, glowSize: .8, light: { color: 0xffb35a, i: .9, dist: 7 }, flame: o.flame || (() => 1) });
    const glass = cyl(.085, .075, .21, 0xe04a3a, { pos: [pos[0], pos[1] + .105, pos[2]], ink: false }); glass.material.transparent = true; glass.material.opacity = .5; glass.material.depthWrite = false; Wd.add(glass);
    Wd.add(cyl(.09, .09, .015, 0xb0b6c0, { pos: [pos[0], pos[1] + .008, pos[2]], ink: false })); return c;
  }
  function diningRoom(Wd, o) {
    o = o || {}; const R = plainRoom(Wd, { HX: 6.5, HZ: 5, H: 3.6, beams: o.beams });
    nightWindow(Wd, 4.6, 1.0, -R.HZ + .02, 0, 1.6, 2.1); const sw = skyWindow(Wd, -2.0, 1.0, -R.HZ + .02, 1.4, 2.0);
    Wd.add(box(2.8, 3.0, .5, 0x7a4a2a, { pos: [.4, 1.5, -R.HZ + .3] })); const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.8), toon(0xffffff, { map: booksTex(5) })); sh.position.set(.4, 1.5, -R.HZ + .56); Wd.add(sh);
    Wd.add(box(1.8, .06, .5, 0x8a5a34, { pos: [YP[0], YP[1] - .04, YP[2]] })); for (const dx of [-.7, .7]) Wd.add(box(.06, .3, .4, 0x6a4326, { pos: [YP[0] + dx, YP[1] - .22, YP[2]], ink: false }));
    diningTable(Wd, { x: TX, z: TZ, len: 3.0, wid: 1.1, food: o.food !== false });
    [-.9, 0, .9].forEach(dx => chair(Wd, TX + dx, TZ - .95, 0, .3)); chair(Wd, TX - 1.95, TZ, PI / 2, .3); chair(Wd, TX + 1.95, TZ, -PI / 2, .3);
    return { R, sw };
  }
  const tableCandle = (Wd, dx, flame) => candle(Wd, { pos: [TX + dx, CT, TZ], h: .26, light: { color: 0xffb35a, i: 1.0, dist: 7 }, glowSize: 1.3, flame });
  const roomLight = (Wd, kF, extra) => lighting(Wd, t => { const k = kF(t); return Object.assign({ hemi: lerp(.9, 1.2, k), sun: lerp(.55, 1.1, k), hemiColor: mixC(COLD, WARM, k), sunColor: mixC(new THREE.Color(0xc8d0e8), new THREE.Color(0xfff1dc), k) }, extra ? extra(t) : {}); });
  const seatsFar = (Wd, fn) => [1, 3, 2].forEach((id, i) => boyP(Wd, id, t => Object.assign({ pos: [TX + (i - 1) * .9, 0, TZ - .62], facing: 0 }, SIT, fn(t, i))));

  // ---------------------------------------------------------------- 1. HOOK: Yom Tov table, candles unlit, a closed matchbox; the boy looks from the matchbox to the candles
  function hook(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }); diningRoom(Wd); roomLight(Wd, () => 0);
    const mb = matchbox(Wd, [TX - .6, CT, TZ + .5]); mb.open(0);
    tableCandle(Wd, -.55, () => 0); tableCandle(Wd, .55, () => 0);
    boyP(Wd, 1, t => { const a = Math.sin(t * .9) > 0 ? 1 : -1, k = sm(P(1, 2.2, t)); return Object.assign({ pos: [TX, 0, TZ - .62], facing: 0, gesture: t > 5 ? 'think' : null, perform: t > 5 ? 0 : .2, brow: .5 * k, smile: 0, look: -.55 * Math.sin(t * .9), talk: 0 }, SIT); });
    boyP(Wd, 3, t => Object.assign({ pos: [TX - 1.9, 0, TZ], facing: PI / 2, perform: .3, smile: .2, brow: .3, look: .4 * Math.sin(t * .9 + 1) }, SIT));
    boyP(Wd, 2, t => Object.assign({ pos: [TX + 1.9, 0, TZ], facing: -PI / 2, perform: .3, smile: .2, brow: .3, look: -.4 * Math.sin(t * .9) }, SIT));
    Wd.center = [TX, TZ]; Wd.qPos = [TX - 1.6, TZ + .8]; Wd.qSize = 1.5;
    Wd.cam = seq([0, cine([C(0, [TX, 1.0, TZ], 7.4, 1.8, -20, 44), C(5, [TX, 1.0, TZ], 5.0, 1.2, 8, 44)])],
      [5, cine([C(5, [TX - .6, .9, TZ + .5], 2.4, .5, 24, 40), C(8.5, [TX - .4, .95, TZ + .4], 2.0, .35, -6, 38)])],
      [8.5, cine([C(8.5, [TX, 1.2, TZ - .4], 3.4, .4, 8, 42), C(11, [TX, 1.2, TZ - .4], 3.0, .3, -14, 40), C(14, [TX, 1.2, TZ], 6.4, 1.8, 20, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: close on the matchbox: it slides open, a match rises and strikes by itself; FREEZE, red X slams, the match sinks back
  const TF = 5.4, TR = 9.2;   // freeze start / resume (local seconds of scene 2)
  function s2(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }); diningRoom(Wd); roomLight(Wd, () => 0);
    const BX = [TX - .6, CT, TZ + .5], mb = matchbox(Wd, BX), ms = matchStick(Wd);
    tableCandle(Wd, -.55, () => 0); tableCandle(Wd, .55, () => 0);
    Wd.add(box(.36, .004, .05, 0x5a3320, { pos: [BX[0] - .04, BX[1] + .104, BX[2] + .11], ink: false }));   // strike strip on the sleeve
    const x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a), spk = [];
    for (let i = 0; i < 10; i++) { const s = glowSprite(.1, .1, 0); s.material.color.set(0xffc060); Wd.add(s); spk.push(s); }
    const L = .52, baseOf = (H, rz) => [H[0] + Math.sin(rz) * L, H[1] - Math.cos(rz) * L, H[2]], headOf = (b, rz) => [b[0] - Math.sin(rz) * L, b[1] + Math.cos(rz) * L, b[2]];
    const pathAt = tt => {   // match state at path time tt (0..TF): {base, rz, spark}
      const up = sm(P(1.9, 3.2, tt)), tilt = sm(P(3.2, 4.5, tt)), dsc = sm(P(4.5, 5.0, tt)), drag = Math.pow(P(5.0, TF, tt), 1.4);
      const start = [BX[0] + .32, BX[1] + .06, BX[2] - .02], high = [BX[0] + .3, BX[1] + .5, BX[2] - .02];
      const hs = [BX[0] - .2, BX[1] + .12, BX[2] + .12], he = [BX[0] + .1, BX[1] + .12, BX[2] + .12], hovH = [hs[0], hs[1] + .3, hs[2]];
      if (tt < 3.2) return { base: lerpV(start, high, up), rz: 0, spark: 0 };
      const rz = lerp(0, -1.0, tilt); let H;
      if (tt < 4.5) H = lerpV(headOf(high, 0), hovH, tilt); else if (tt < 5.0) H = lerpV(hovH, hs, dsc); else H = lerpV(hs, he, drag);
      return { base: baseOf(H, rz), rz, spark: tt < 5.0 ? 0 : drag };
    };
    Wd.on(t => {
      const op = sm(P(.7, 1.9, t)) * (1 - sm(P(12.2, 13.4, t))); mb.open(op);
      const tt = t < TF ? t : t < TR ? TF : Math.max(0, TF - (t - TR) * (TF / 3.6)), st = pathAt(tt), sink = t > 11.6 ? sm(P(11.6, 12.6, t)) : 0;
      const base = [st.base[0], st.base[1] - sink * .4, st.base[2]];
      ms.set(base, st.rz, t > .9 ? 1.9 : 0, (t >= TF && t < TR ? 1 : st.spark));
      spk.forEach((s, i) => { const f = (t >= TF && t < TR) ? 1 : st.spark; const a = i * .9 + (t >= TF && t < TR ? 0 : t * 5); const hd = headOf(st.base, st.rz); s.position.set(hd[0] + Math.cos(a) * .05 * f * (1 + i * .15), hd[1] + Math.sin(a * 1.3) * .05 * f, hd[2] + Math.sin(a) * .03); s.material.opacity = f > .1 ? .9 * f : 0; });
      const slam = P(6.0, 6.3, t), back = P(TR - .6, TR, t); x.set([BX[0] + .1, BX[1] + .5, BX[2] + .3], (t > 6.0 ? lerp(1.6, .5, ease.out(slam)) : 0) * (1 - sm(back)), 0); sk.set([BX[0] + .1, BX[1] + .5, BX[2] + .35], P(6.0, 6.9, t), .9); });
    Wd.center = [TX, TZ];
    Wd.cam = shakeCam(seq([0, cine([C(0, [BX[0], BX[1] + .15, BX[2]], 3.2, .6, 18, 40), C(4.5, [BX[0] + .1, BX[1] + .3, BX[2]], 2.0, .3, -8, 38)])],
      [4.5, cine([C(4.5, [BX[0] + .1, BX[1] + .3, BX[2]], 2.0, .3, -8, 38), C(TF, [BX[0] + .05, BX[1] + .3, BX[2]], 2.0, .3, 6, 38), C(TR, [BX[0] + .05, BX[1] + .3, BX[2]], 2.2, .4, 62, 38)])],
      [TR, cine([C(TR, [BX[0] + .05, BX[1] + .3, BX[2]], 1.6, .35, 62, 38), C(dur, [BX[0] + .1, BX[1] + .3, BX[2]], 2.6, .8, 14, 40)])]), [[6.0, .02, .5]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-42: shelf with a burning glass memorial candle; a floating clock rewinds to Erev Yom Tov (sun setting) and returns to night
  const RW0 = 3.0, RW1 = 7.0, RT = 8.6, RT1 = 12.0;
  function s3(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }), { sw } = diningRoom(Wd); const kS = t => sm(P(RW0, RW1, t)) * (1 - sm(P(RT, RT1, t)));
    roomLight(Wd, t => .2 + .5 * kS(t), t => ({ hemiColor: mixC(new THREE.Color(0xa0aac8), new THREE.Color(0xffd3a0), kS(t)) }));
    yahrzeit(Wd, YP); tableCandle(Wd, -.55, () => 0); tableCandle(Wd, .55, () => 0);
    const ck = clock(Wd, { r: .55 }), lab = board(Wd, { w: 2.3, h: .62, draw: drawWord('ערב יום טוב', '#fff1d0', '#8a3a10', '#d9a63a'), cw: 640, frame: 0x6b3a1c, glow: 0xffb050 });
    const hrs = t => 20 - 3 * sm(P(RW0, RW1, t)) + 3 * sm(P(RT, RT1, t));
    Wd.on(t => { sw.set(kS(t)); ck.set([-2.95, 2.55 + .05 * Math.sin(t * 1.3), -4.0], popE(P(1.2, 2.1, t)) * 1.0, hrs(t)); lab.set([-2.0, 3.05, -4.5], popE(P(RW1 - .6, RW1 + .2, t)) * (1 - sm(P(RT, RT + .8, t))) * 1.0, 0); });
    boyP(Wd, 1, t => ({ pos: [-3.3, 0, -2.5], facing: face(-.7, -2), gesture: t > 2.5 ? 'think' : null, perform: t > 2.5 ? 0 : .3, brow: .4, smile: .2 + .5 * sm(P(RT1, 13.5, t)), look: .3, hidden: t > 3 && t < 12.2 }));
    Wd.center = [-3, -4];
    Wd.cam = seq([0, cine([C(0, [-2.6, 1.7, -3.8], 7.6, 1.4, 14, 44), C(3.0, [-3.2, 1.8, -4.2], 4.8, .4, 10, 42)])],
      [3.0, cine([C(3.0, [-3.1, 2.0, -4.4], 4.4, .3, 24, 42), C(7.6, [-3.0, 2.0, -4.4], 4.0, .3, -10, 42)])],
      [7.6, cine([C(7.6, [-3.2, 1.7, -4.5], 3.0, .2, -14, 40), C(RT1 + .4, [-3.0, 1.9, -4.3], 3.6, .3, 18, 42)])],
      [RT1 + .4, cine([C(RT1 + .4, [-3.0, 1.8, -4.0], 5.0, .8, 12, 44), C(14, [-2.6, 1.8, -3.6], 7.6, 1.6, -10, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 42-56: a thin candle floats to the glass candle; the fire JUMPS across (glowing arc); the thin candle is lit; green check
  function s4(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }), { sw } = diningRoom(Wd); roomLight(Wd, t => .25 + .1 * sm(P(5, 8, t)));
    yahrzeit(Wd, YP); tableCandle(Wd, -.55, () => 0); tableCandle(Wd, .55, () => 0);
    const FP = [YP[0], YP[1] + .13 + .1, YP[2]];
    const th = candle(Wd, { pos: [0, 0, 0], h: .4, r: .026, holder: false, color: 0xfff4d8, glowSize: .9, fs: .9, light: { color: 0xffb35a, i: .7, dist: 5 }, flame: t => sm(P(4.7, 5.5, t)), appear: t => P(.4, 1.3, t) });
    const arc = flameArc(Wd, 26), ck = mark3d(Wd, 'check', 1.0), TL = .48, hov = [-3.38, 1.52, YP[2] + .0], RZ = .62;
    const thPos = t => t < 8.6 ? arcPt([-1.2, 2.2, -4.0], hov, sm(P(.6, 3.6, t)), .25) : arcPt(hov, [-1.0, 2.6, -3.6], sm(P(8.6, 11.8, t)), .3);
    Wd.on(t => { const p = thPos(t); th.g.position.set(p[0], p[1], p[2]); th.g.rotation.z = RZ * sm(P(2.6, 3.8, t)) * (1 - sm(P(8.6, 9.6, t)));
      const rz = th.g.rotation.z, tip = tipOf(th.g, rz, TL);
      const u = P(3.9, 4.8, t), fade = 1 - sm(P(5.6, 6.8, t)); arc.set(FP, tip, u, .3, fade);
      ck.set([-3.0, 2.85, YP[2] + .3], popE(P(6.4, 7.3, t)) * 1.2, .05 * Math.sin(t * 3)); });
    boyP(Wd, 1, t => ({ pos: [-2.4, 0, -2.6], facing: face(-1.3, -2), gesture: t > 6.6 ? 'thumb' : null, perform: t > 6.6 ? 0 : .3, brow: .3, smile: .3 + .6 * sm(P(6.4, 8, t)), look: .2, hidden: t < 10 }));
    Wd.center = [-3, -4];
    Wd.cam = seq([0, cine([C(0, [-2.6, 1.8, -4.2], 5.6, .6, 20, 44), C(3.6, [-3.4, 1.8, -4.5], 3.6, .3, 8, 40)])],
      [3.6, cine([C(3.6, [-3.65, 1.75, -4.6], 2.5, .1, 30, 38), C(6.0, [-3.65, 1.75, -4.6], 2.3, .1, 4, 36)])],
      [6.0, cine([C(6.0, [-3.2, 1.9, -4.3], 4.6, .5, -18, 42), C(10, [-2.8, 2.0, -4.1], 5.0, .7, 18, 44), C(14, [-2.2, 1.9, -3.6], 7.2, 1.4, -6, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 56-70: the lit thin candle floats to the Yom Tov candles and lights them; the room brightens warmly; the boys smile
  function s5(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }); diningRoom(Wd);
    const T1 = 5.8, T2 = 8.9, kL = t => .5 * sm(P(T1 + .6, T1 + 1.6, t)) + .5 * sm(P(T2 + .6, T2 + 1.6, t)), kRoom = t => sm(P(T1 + .6, 11.5, t));
    roomLight(Wd, kRoom); yahrzeit(Wd, YP);
    const c1 = tableCandle(Wd, -.55, t => sm(P(T1 + .5, T1 + 1.3, t))), c2 = tableCandle(Wd, .55, t => sm(P(T2 + .5, T2 + 1.3, t)));
    const th = candle(Wd, { pos: [0, 0, 0], h: .4, r: .026, holder: false, color: 0xfff4d8, glowSize: .9, fs: .9, light: { color: 0xffb35a, i: .7, dist: 5 }, flame: () => 1, appear: t => (1 - sm(P(11.8, 13.2, t))) });
    const arc1 = flameArc(Wd, 24), arc2 = flameArc(Wd, 24), TL = .48, RZ = .62;
    const tip1 = [TX - .55, CT + .29 + .26 + .04, TZ], tip2 = [TX + .55, CT + .29 + .26 + .04, TZ];
    const hov1 = [tip1[0] - .55, tip1[1] - .2, TZ], hov2 = [tip2[0] - .55, tip2[1] - .2, TZ], start = [-3.2, 2.1, -3.4];
    const pos = t => { if (t < T1 - .8) return arcPt(start, hov1, sm(P(.8, T1 - .8, t)), .9); if (t < T2 - .6) return lerpV(hov1, hov2, sm(P(T1 + 1.6, T2 - .6, t))); if (t < 11.2) return hov2; return lerpV(hov2, [3.0, 2.8, -2.4], sm(P(11.2, 13.4, t))); };
    Wd.on(t => { const p = pos(t); th.g.position.set(p[0], p[1] + .03 * Math.sin(t * 2), p[2]); th.g.rotation.z = -RZ * sm(P(T1 - 1.4, T1 - .6, t)) * (1 - sm(P(11.4, 12.4, t)));
      const tp = tipOf(th.g, th.g.rotation.z, TL); arc1.set(tp, tip1, P(T1, T1 + .8, t), .25, 1 - sm(P(T1 + 1.6, T1 + 2.6, t))); arc2.set(tp, tip2, P(T2, T2 + .8, t), .25, 1 - sm(P(T2 + 1.6, T2 + 2.6, t))); });
    seatsFar(Wd, (t, i) => { const k = sm(P(T2 + .8, T2 + 2.5, t)); return { smile: .15 + .85 * k, brow: .25 * (1 - k), perform: .3, talk: k > .8 ? .35 * talkAmt(t, i + 1) : 0, look: .3 * Math.sin(t * .8 + i) * (1 - k), gesture: i === 1 && k < .2 && t > 3 ? 'think' : null }; });
    boyP(Wd, 4, t => Object.assign({ pos: [TX - 1.9, 0, TZ], facing: PI / 2, perform: .3, smile: .2 + .8 * sm(P(T2 + .8, T2 + 2.5, t)), brow: .2 }, SIT));
    Wd.center = [TX, TZ];
    Wd.cam = seq([0, cine([C(0, [-.5, 1.2, -2.2], 7.8, 1.4, 20, 44), C(4.2, [.5, 1.1, -.6], 5.8, .8, 12, 44)])],
      [4.2, cine([C(4.2, [TX - .6, 1.0, TZ], 3.0, .3, -20, 40), C(7.8, [TX - .2, 1.0, TZ], 2.8, .2, 12, 38)])],
      [7.8, cine([C(7.8, [TX + .4, 1.0, TZ], 3.0, .3, 16, 40), C(10.4, [TX + .3, 1.0, TZ], 3.2, .3, -20, 40)])],
      [10.4, cine([C(10.4, [TX, 1.2, TZ - .3], 5.2, 1.0, 14, 44), C(14, [TX, 1.25, TZ - .3], 4.4, .7, -16, 42)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 70-84: the flame is in the kitchen, far away: a dotted path; a carrier candle takes the flame like a relay baton from flame to flame
  function s6(dur) {
    const Wd = mkWorld({ fogNear: 60, fogFar: 200 }); const HZ = 5, H = 3.6;
    const kt = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 12), toon(0xffffff, { map: canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#e9eef2' : '#c9d2da'; g.fillRect(i * 32, j * 32, 32, 32); } }, [4, 5]) })); kt.rotation.x = -PI / 2; kt.position.set(-9.2, .004, 1); kt.receiveShadow = true; Wd.add(kt);
    const dn = new THREE.Mesh(new THREE.PlaneGeometry(14.8, 12), toon(0xffffff, { map: planksTex([5, 4.5]) })); dn.rotation.x = -PI / 2; dn.position.set(2.8, .004, 1); dn.receiveShadow = true; Wd.add(dn);
    Wd.add(box(24.4, H, .4, 0xf4e8cc, { pos: [-2.2, H / 2, -HZ - .2], ink: false })); Wd.add(box(24.4, 1.0, .12, 0xb98a58, { pos: [-2.2, .5, -HZ + .06], ink: false }));
    Wd.add(box(.4, H, 12, 0xf4e8cc, { pos: [-14.2, H / 2, 1], ink: false })); Wd.add(box(.4, H, 12, 0xf4e8cc, { pos: [9.9, H / 2, 1], ink: false }));
    // kitchen: counter, upper cabinets, fridge, window; dining: table, windows, bookcase; a doorway frame between
    Wd.add(box(4.6, 1.0, .9, 0xd9c9a8, { pos: [-8.8, .5, -4.4] })); Wd.add(box(4.8, .08, 1.0, 0x5a4a3a, { pos: [-8.8, 1.04, -4.4] })); Wd.add(box(3.4, 1.0, .5, 0xc9a574, { pos: [-9.6, 2.9, -4.7] })); Wd.add(box(1.3, 2.3, .9, 0xeef2f6, { pos: [-12.6, 1.15, -4.4] }));
    skyWindow(Wd, -6.8, 1.4, -HZ + .02, 1.2, 1.7).set(0);
    for (const dx of [-.9, .9]) Wd.add(box(.2, 3.0, .3, 0x6b3a1c, { pos: [-4.6 + dx, 1.5, -2.2] })); Wd.add(box(2.1, .2, .3, 0x6b3a1c, { pos: [-4.6, 3.0, -2.2] }));
    nightWindow(Wd, 1.4, 1.0, -HZ + .02, 0, 1.6, 2.1); nightWindow(Wd, 6.4, 1.0, -HZ + .02, 0, 1.6, 2.1);
    Wd.add(box(2.4, 2.9, .5, 0x7a4a2a, { pos: [3.9, 1.45, -HZ + .3] }));
    const DX = 4.6; diningTable(Wd, { x: DX, z: -.2, len: 3.0, wid: 1.1, food: true }); [-.9, 0, .9].forEach(dx => chair(Wd, DX + dx, -1.15, 0, .3));
    const KP = [-8.6, 1.14, -4.3];
    lighting(Wd, t => ({ hemi: .85, sun: .6, hemiColor: 0xe8d8b8 }));
    const kc = yahrzeit(Wd, KP);
    const T1 = 2.5, T2 = 10.3, T3 = 12.2;
    const c1 = candle(Wd, { pos: [DX - .55, CT, -.2], h: .26, light: { color: 0xffb35a, i: 1.0, dist: 7 }, glowSize: 1.3, flame: t => sm(P(T2 + .5, T2 + 1.3, t)) });
    const c2 = candle(Wd, { pos: [DX + .55, CT, -.2], h: .26, light: { color: 0xffb35a, i: 1.0, dist: 7 }, glowSize: 1.3, flame: t => sm(P(T3 + .5, T3 + 1.3, t)) });
    const th = candle(Wd, { pos: [0, 0, 0], h: .4, r: .026, holder: false, color: 0xfff4d8, glowSize: .9, fs: .9, light: { color: 0xffb35a, i: .6, dist: 5 }, flame: t => sm(P(T1 + .6, T1 + 1.4, t)), appear: t => P(.3, 1.0, t) * (1 - sm(P(13.4, 14, t))) });
    const TL = .48, RZ = .62, kTip = [KP[0], KP[1] + .13 + .1, KP[2]], tipT1 = [DX - .55, CT + .59, -.2], tipT2 = [DX + .55, CT + .59, -.2];
    const hovK = [kTip[0] + .6, kTip[1] - .17, KP[2]], hovT1 = [tipT1[0] - .55, tipT1[1] - .2, -.2], hovT2 = [tipT2[0] - .55, tipT2[1] - .2, -.2];
    const curve = new THREE.CatmullRomCurve3([hovK, [-6.4, 1.9, -3.4], [-4.6, 2.1, -2.2], [-2.0, 1.9, -1.2], [1.2, 1.7, -.7], hovT1].map(a => new THREE.Vector3(...a)), false, 'centripetal');
    const pts = []; for (let i = 0; i <= 22; i++) pts.push(curve.getPoint(i / 22).toArray());
    const dots = dotPath(Wd, pts, { step: .45, r: .07, color: 0xffd166 });
    const carrier = t => curve.getPoint(sm(P(4.4, T2 - .8, t))).toArray();
    const arcA = flameArc(Wd, 24), arcB = flameArc(Wd, 24), arcC = flameArc(Wd, 24);
    const c2hov = hovT2;
    const cpos = t => t < T3 - .8 ? (t < T2 + 1.6 ? carrier(t) : lerpV(hovT1, c2hov, sm(P(T2 + 1.7, T3 - .8, t)))) : c2hov;
    Wd.on(t => { const p = t < 4.4 ? lerpV([-7.2, 2.4, -3.2], hovK, sm(P(.4, 1.6, t))) : cpos(t), pp = [p[0], p[1] + .03 * Math.sin(t * 2), p[2]]; th.g.position.set(...pp); th.g.rotation.z = RZ * sm(P(.8, 1.6, t)) * (1 - sm(P(4.0, 4.8, t))) - RZ * sm(P(T2 - 1.2, T2 - .4, t)) * (1 - sm(P(T2 + 1.7, T2 + 2.3, t))) - RZ * sm(P(T3 - 1.4, T3 - .6, t));
      const rz = th.g.rotation.z, tp = tipOf(th.g, rz, TL); arcA.set(kTip, tp, P(T1 - .2, T1 + .6, t), .3, 1 - sm(P(T1 + 1.4, T1 + 2.4, t)));
      arcB.set(tp, tipT1, P(T2, T2 + .8, t), .25, 1 - sm(P(T2 + 1.5, T2 + 2.5, t))); arcC.set(tp, tipT2, P(T3, T3 + .8, t), .25, 1 - sm(P(T3 + 1.5, T3 + 2.5, t)));
      dots.set(sm(P(1.8, 5.0, t)) * (t > 12 ? 1 - sm(P(12.6, 13.6, t)) : 1), t); });
    [1, 3].forEach((id, i) => boyP(Wd, id, t => ({ pos: [DX - 2.5 + i * .9, 0, 1.3], facing: face(-1.5 - i * .5, -2), gesture: t < 3 ? 'point' : (i ? 'shrug' : 'think'), perform: 0, brow: .4, smile: .1 + .8 * sm(P(T3 + 1, T3 + 2.5, t)), look: -.4 })));
    Wd.center = [-2, -1];
    const follow = t => { const p = (t < 4.4 ? [-7.9, 1.55, -3.6] : cpos(t)); return { pos: [p[0] * .85 + 1.2, 2.5, p[2] + 8.6], look: [p[0], 1.45, p[2]], fov: 46 }; };
    Wd.cam = seq([0, cine([C(0, [-8.2, 1.5, -4.0], 6.0, .8, 14, 44), C(3.4, [-8.0, 1.6, -3.8], 4.2, .4, -16, 42)])],
      [3.4, cine([C(3.4, [-4.0, 1.6, -2.0], 17, 3.6, 4, 46), C(4.6, [-3.0, 1.6, -2.0], 15, 3.2, 0, 46)])],
      [4.6, follow],
      [T2 + 1.2, cine([C(T2 + 1.2, [DX - .2, 1.4, -.2], 4.2, .6, -16, 42), C(dur, [DX - .1, 1.45, -.2], 5.4, .9, 18, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 84-100: two doors: "new fire" (red X, closed, matchbox) | "fire from fire" (green check, open, warm light); the boy walks through the open one
  function s7(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }); plainRoom(Wd, { HX: 7, HZ: 5, H: 4.2, wall: 0xf1e3c6 });
    lighting(Wd, t => ({ hemi: 1.0, sun: .8, hemiColor: 0xf0e6d0 }));
    const dN = door(Wd, { label: 'אש חדשה', ok: false }), dO = door(Wd, { label: 'אש מאש', ok: true });
    const mbox = matchbox(Wd, [-3.0, 0, -2.4]); mbox.open(0); mbox.g.scale.setScalar(4.4); mbox.g.rotation.y = .35;
    const xm = mark3d(Wd, 'cross', 1.3), ok = mark3d(Wd, 'check', 1.3), gl = glowAt(Wd.scene, 5, 0xffc070, .0); gl.position.set(2.7, 1.5, -2.6);
    const sp = []; for (let i = 0; i < 14; i++) { const s = glowSprite(.22, .22, 0); s.material.color.set(0xffe9a8); Wd.add(s); sp.push(s); }
    const bX = t => lerp(.3, 2.7, sm(P(2.0, 6.0, t))), bZ = t => lerp(1.2, -2.2, sm(P(2.0, 6.0, t)));
    Wd.on(t => { dN.set([-2.7, 0, -4.7], 0, 1); dO.set([2.7, 0, -4.7], P(2.6, 4.6, t), 1); xm.set([-4.6, 2.0, -3.4], popE(P(1.0, 1.9, t)) * 1.3, .05 * Math.sin(t * 4)); ok.set([4.6, 2.0, -3.4], popE(P(1.5, 2.4, t)) * 1.3 * (1 - sm(P(8.6, 9.4, t))), .05 * Math.sin(t * 3));
      gl.material.opacity = .5 * sm(P(3, 5, t)); sp.forEach((s, i) => { const a = t * .9 + i * 1.7; s.position.set(2.7 + Math.cos(a) * .6, .5 + (t * .5 + i * .31) % 2.2, -4.2 + Math.sin(a) * .3); s.material.opacity = .8 * sm(P(3, 5, t)); }); });
    boyP(Wd, 1, t => { const mv = t > 2.0 && t < 6.0, ex = t >= 6.0; return { pos: [bX(t), 0, ex ? -2.2 - (t - 6.0) * 1.6 : bZ(t)], facing: ex ? face(0, -1) : face(2.4, -5.6), walk: mv || ex ? t * 5.6 : undefined, hidden: t > 8.5, gesture: !mv && !ex && t < 2 ? 'think' : null, perform: 0, smile: .4 + .5 * sm(P(4, 6, t)), brow: t < 2 ? .4 : 0 }; });
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C(0, [0, 2.0, -3.0], 10.5, 1.0, -14, 46), C(3.2, [0, 2.0, -2.8], 9.6, .8, 8, 46)])],
      [3.2, cine([C(3.2, [1.2, 1.2, -1.8], 6.4, .8, 34, 44), C(6.8, [2.5, 1.3, -3.6], 6.2, .6, -12, 44)])],
      [6.8, cine([C(6.8, [2.7, 1.6, -4.2], 6.2, .6, 6, 44), C(10.5, [2.7, 1.6, -4.6], 3.8, .3, 0, 42), C(dur, [2.7, 1.6, -4.9], 2.8, .3, 0, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the lit Yom Tov table behind the card
  function answerBg(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }); diningRoom(Wd, { beams: false }); roomLight(Wd, () => 1);
    tableCandle(Wd, -.55, () => 1); tableCandle(Wd, .55, () => 1); yahrzeit(Wd, YP);
    const gl = glowAt(Wd.scene, 8, 0xffc070, .5); gl.position.set(TX, 1.2, TZ + .2);
    seatsFar(Wd, (t, i) => ({ smile: 1, perform: .5, talk: .5 * talkAmt(t, i + 2) }));
    boyP(Wd, 4, t => Object.assign({ pos: [TX - 1.9, 0, TZ], facing: PI / 2, smile: 1, perform: .5, talk: .3 * talkAmt(t, 7) }, SIT)); boyP(Wd, 5, t => Object.assign({ pos: [TX + 1.9, 0, TZ], facing: -PI / 2, smile: 1, perform: .5, talk: .3 * talkAmt(t, 8) }, SIT));
    Wd.center = [TX, TZ + 1.2]; Wd.ansD = 6.2; return Wd;
  }

  const grade = t => {
    if (t >= 14 + TF && t < 14 + TR) { const k = sm(P(14 + TF, 14 + TF + .25, t)) * (1 - sm(P(14 + TR - .3, 14 + TR, t))); return { sat: lerp(1, .5, k), contrast: lerp(1, 1.12, k), bright: lerp(1, 1.05, k) }; }
    return { sat: 1 };
  };
  const overlay = (g, W, H, t) => {
    const s = H / 1080, f0 = 14 + TF;
    if (t >= f0 - .05 && t < f0 + .3) { g.fillStyle = '#ffffff'; g.globalAlpha = .55 * (1 - (t - f0) / .35); g.fillRect(0, 0, W, H); g.globalAlpha = 1; }   // freeze flash
    const r0 = 28 + RW0, r1 = 28 + RW1;
    if (t >= r0 && t < r1 + .3) {   // rewind: scan lines + double arrow
      const a = sm(P(r0, r0 + .3, t)) * (1 - sm(P(r1, r1 + .3, t))); g.globalAlpha = a * .2; g.fillStyle = '#9fb4ff'; for (let y = 0; y < H; y += 8 * s) g.fillRect(0, y, W, 2 * s);
      g.globalAlpha = a * .95; g.fillStyle = '#fff'; g.strokeStyle = '#1c2745'; g.lineWidth = 10 * s; g.lineJoin = 'round'; const cx = W / 2, cy = 110 * s, q = 52 * s;
      for (const dx of [-q * .95, q * .95]) { g.beginPath(); g.moveTo(cx + dx + q * .7, cy - q); g.lineTo(cx + dx - q * .7, cy); g.lineTo(cx + dx + q * .7, cy + q); g.closePath(); g.stroke(); g.fill(); }
      g.globalAlpha = 1; }
  };
  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg, grade, overlay };
};
