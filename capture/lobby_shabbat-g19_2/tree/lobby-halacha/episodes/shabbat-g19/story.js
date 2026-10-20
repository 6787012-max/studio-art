// shabbat-g19 story: "Shabbat candles - hall or home?" (Azamra 19) - 3D choreography per storyboards_v2.md (B). Boys only; candles light by themselves.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, plainRoom, hallRoom, nightWindow, diningTable, chair, candle, clock, mark3d, qmark, board, drawWord, drawNoFlame,
    shock, toyTruck, popE, lighting, glowAt, glowSprite, texPlane, insetView, lerpV, arcPt, shakeCam, label, sparkles } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly || -.09 * d];
  const SIT = { sit: true, groundY: 0 }, TY = .72, CT = TY + .04;
  const WARM = new THREE.Color(0xffe2b0), COLD = new THREE.Color(0x8fa0c8), WG = new THREE.Color(0x9a8660), CG = new THREE.Color(0x40455a), SUNW = new THREE.Color(0xfff1dc), SUNC = new THREE.Color(0xaab8e0);
  const mix = (a, b, k) => new THREE.Color().copy(a).lerp(b, clamp(k, 0, 1));
  const warmLight = (Wd, hr, kF) => lighting(Wd, t => { const k = kF(t); if (hr) hr.setLights(k); return { hemi: lerp(.62, 1.2, k), sun: lerp(.34, 1.2, k), hemiColor: mix(COLD, WARM, k), hemiGround: mix(CG, WG, k), sunColor: mix(SUNC, SUNW, k) }; });
  const SEATS = [{ id: 1, pos: [-1.1, 0, -.82], f: 0 }, { id: 3, pos: [0, 0, -.82], f: 0 }, { id: 2, pos: [1.1, 0, -.82], f: 0 }, { id: 4, pos: [-1.95, 0, 0], f: PI / 2 }, { id: 5, pos: [1.95, 0, 0], f: -PI / 2 }];
  function hallTable(Wd, food) {
    diningTable(Wd, { x: 0, z: 0, len: 3.2, wid: 1.1, food });
    [-1.1, 0, 1.1].forEach(x => chair(Wd, x, -.95, 0, .3)); chair(Wd, -2.05, 0, PI / 2, .3); chair(Wd, 2.05, 0, -PI / 2, .3); [-1.0, 1.0].forEach(x => chair(Wd, x, .95, PI, .3));
  }
  function hallWorld(foodOn) { const Wd = mkWorld({ fogNear: 40, fogFar: 140 }), hr = hallRoom(Wd); hallTable(Wd, foodOn !== false); return { Wd, hr }; }
  const seatBoys = (Wd, fn, ids) => SEATS.forEach((s, i) => { if (ids && !ids.includes(i)) return; boyP(Wd, s.id, t => Object.assign({ pos: s.pos, facing: s.f }, SIT, fn(t, i, s))); });
  const tableCandles = (Wd, o) => [-.62, .62].map((x, i) => candle(Wd, { pos: [x, CT, 0], h: .26, light: { color: 0xffb35a, i: 1.1, dist: 7 }, glowSize: 1.3, flame: t => o.flame(t) * (i ? 1 : 1) * 1, appear: o.appear }));

  // ---------------------------------------------------------------- 1. HOOK: sunset street, two boys walk from their house to the lit hall; cut: home table unlit candles; cut: hall table no candles; "?"
  function hook(dur) {
    const Wd = mkWorld({ skyTop: 0x5b6fd0, skyBottom: 0xffb27a, fogColor: 0xffc58f, fogNear: 45, fogFar: 150, sun: 1.5, sunColor: 0xffc27a, sunPos: [-40, 14, 14], hemi: 1.1, hemiSky: 0xffe3c8, hemiGround: 0x8a6a50, shadowExt: 28, ground: 'stone', groundSize: 400 });
    Wd.add(box(120, .03, 6.4, 0x4a4d57, { pos: [2, .015, 1.2], ink: false })); Wd.add(box(120, .06, 2, 0xd9cfba, { pos: [2, .03, -2.4], ink: false }));
    for (let x = -50; x < 50; x += 4) Wd.add(box(1.4, .035, .28, 0xf0e8c8, { pos: [x, .04, 1.2], ink: false }));
    // the boys' house (left) and the event hall (right)
    const house = (x) => { Wd.add(box(8, 5, 5, 0xf0d9b0, { pos: [x, 2.5, -4.2] })); const roof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 2.4, 4), K.toon(0xb5503a)); roof.rotation.y = PI / 4; roof.scale.z = .75; roof.position.set(x, 6.2, -4.2); roof.castShadow = true; K.ink(roof, .03); Wd.add(roof);
      Wd.add(box(1.3, 2.4, .2, 0x7a4a2a, { pos: [x, 1.2, -1.65] })); for (const dx of [-2.4, 2.4]) { Wd.add(box(1.3, 1.5, .2, 0xffe08a, { pos: [x + dx, 2.4, -1.65], ink: false })); Wd.add(box(1.5, .12, .3, 0xe6d6b2, { pos: [x + dx, 1.62, -1.55], ink: false })); } };
    house(-9);
    house(-19); house(-29);
    Wd.add(box(14, 6.8, 6, 0xf6e8c4, { pos: [18, 3.4, -4.7] })); Wd.add(box(14.6, .5, 6.6, 0xc9a574, { pos: [18, 7.0, -4.7], ink: false }));
    for (const dx of [-5, -3, 3, 5]) Wd.add(box(1.4, 3.2, .2, 0xffe08a, { pos: [18 + dx, 2.8, -1.65], ink: false }));
    Wd.add(box(3.2, 3.2, .3, 0xffd27a, { pos: [18, 1.6, -1.6], ink: false })); Wd.add(box(.12, 3.2, .35, 0x7a4a2a, { pos: [18, 1.6, -1.55], ink: false }));
    const sign = board(Wd, { w: 3.6, h: 1.25, draw: drawWord('אולם', '#fff4cf', '#7a1c1c', '#d9a63a'), cw: 768, frame: 0x6b3a1c, glow: 0xffd27a }); sign.set([18, 4.7, -1.4], 1.3, 0);
    for (const x of [-4, 4, 8, 12, 23, 27]) { Wd.add(cyl(.18, .24, 2.4, 0x7a5232, { pos: [x, 1.2, -2.9] })); Wd.add(ball(1.3, 0x6fae57, { pos: [x, 3.3, -2.9], scale: [1, .9, 1] })); }
    for (const x of [-12, -2, 7, 13.5, 20]) { Wd.add(cyl(.07, .09, 4, 0x333333, { pos: [x, 2, -1.4] })); const lb = new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff0c0, fog: false })); lb.position.set(x, 4.1, -1.4); Wd.add(lb); const gs = glowSprite(2, 2, .5); gs.position.copy(lb.position); Wd.add(gs); }
    const sun = glowSprite(26, 26, .85); sun.position.set(-8, 7, -90); sun.material.color.set(0xffa040); Wd.add(sun);
    // vignettes far away (cut-ins): home table (x = +100) and hall table (x = -100)
    const vig = (x, home) => { const g = new THREE.Group(); g.position.set(x, 0, 0); Wd.add(g);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), K.toon(0xffffff, { map: K.planksTex([4, 3]) })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; g.add(fl);
      g.add(box(10, 4, .3, home ? 0xf4e4c0 : 0xf1e3c6, { pos: [0, 2, -3.6], ink: false })); g.add(box(10, 1, .12, 0xb98a58, { pos: [0, .5, -3.45], ink: false }));
      if (home) { g.add(box(1.8, 1.9, .1, 0x1e2f60, { pos: [-2.6, 2.2, -3.4], ink: false })); g.add(box(.5, 2.6, .12, 0xc9946a, { pos: [-3.7, 2.2, -3.3], ink: false })); g.add(box(.5, 2.6, .12, 0xc9946a, { pos: [-1.5, 2.2, -3.3], ink: false })); g.add(box(2.4, 2.8, .5, 0x7a4a2a, { pos: [2.8, 1.4, -3.2] })); }
      else { for (const dx of [-3.2, 0, 3.2]) { g.add(box(.9, 3.4, .14, 0x8a2a3a, { pos: [dx - 1.0, 2.2, -3.4], ink: false })); g.add(box(.9, 3.4, .14, 0x8a2a3a, { pos: [dx + 1.0, 2.2, -3.4], ink: false })); g.add(box(1.0, 2.8, .1, 0x1e2f60, { pos: [dx, 2.3, -3.42], ink: false })); } const lp = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff0c0, fog: false })); lp.position.set(0, 3.5, -1); g.add(lp); const gs = glowSprite(3, 3, .6); gs.position.copy(lp.position); g.add(gs); }
      const pl = new THREE.PointLight(0xffcc88, 1.3, 14); pl.position.set(0, 3, 1.5); g.add(pl); return g; };
    vig(100, true); vig(-100, false);
    diningTable(Wd, { x: 100, z: 0, len: 2.4, wid: 1.0, cloth: 0xffffff, food: false });
    const homeCandles = [-.45, .45].map(x => candle(Wd, { pos: [100 + x, CT, 0], h: .26, flame: () => 0 }));
    diningTable(Wd, { x: -100, z: 0, len: 3.2, wid: 1.1, food: true });
    [-1.1, 0, 1.1].forEach(x => chair(Wd, -100 + x, -.95, 0, .3));
    // boys with bags
    const bx = t => -8.2 + 1.45 * t;
    [1, 3].forEach((id, i) => { boyP(Wd, id, t => ({ pos: [bx(t) + i * .75, 0, -.4 - i * .15], facing: face(1, 0), walk: t * 6 + i, smile: .5, perform: 0 })); const bag = box(.34, .4, .16, i ? 0x2f6a3a : 0x244a86, { pos: [0, .5, 0] }); Wd.add(bag);
      Wd.on(t => bag.position.set(bx(t) + i * .75 - .03, .62, -.4 - i * .15 - .38)); });
    boyP(Wd, 2, t => Object.assign({ pos: [102.4, 0, .8], facing: face(-2.4, -.8), gesture: t > 7.4 ? 'think' : null, perform: 0, brow: .4, look: -.5, smile: 0 }, { }));
    Wd.center = [0, 0]; Wd.qPos = [-1.8, 0]; Wd.qSize = 2.6;
    Wd.cam = seq([0, cine([C(0, [-7, 1.2, 0], 5.2, .7, 30, 44), C(6, [2.4, 1.2, 0], 5.6, .8, -26, 44)])],
      [6, cine([C(6, [100, 1.1, 0], 3.6, .9, 22, 40), C(9.2, [100, 1.1, 0], 2.6, .5, -10, 38)])],
      [9.2, cine([C(9.2, [-100, 1.1, 0], 4.8, 1.0, -26, 42), C(12, [-100, 1.1, 0], 3.2, .6, 14, 40)])],
      [12, cine([C(12, [6, 2.4, -2], 20, 5.0, 8, 46), C(14, [6, 2.6, -2], 17, 4.0, -6, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: the hall at night, almost dark: cold and grey
  function s2(dur) {
    const { Wd, hr } = hallWorld(true);
    warmLight(Wd, hr, t => .0);
    seatBoys(Wd, (t, i) => ({ smile: 0, brow: .25, perform: .12, talk: 0, look: .35 * Math.sin(t * .5 + i * 2), gesture: i === 3 ? 'headdown' : null }));
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C(0, [0, 1.1, 0], 9.0, 2.4, -24, 46), C(5, [0, 1.1, 0], 6.0, 1.6, 8, 44)])],
      [5, cine([C(5, [0, 1.0, 0], 3.4, .6, 20, 42), C(9.5, [0, 1.0, 0], 3.0, .5, -22, 42)])],
      [9.5, cine([C(9.5, [-.2, 1.1, -.5], 4.2, .9, 14, 44), C(14, [.4, 1.2, 0], 7.6, 2.4, 42, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-42: two candles appear and light by themselves; warm light spreads; the table becomes festive
  function s3(dur) {
    const { Wd, hr } = hallWorld(true), kW = t => sm(P(4.4, 8.6, t));
    warmLight(Wd, hr, kW);
    const cs = tableCandles(Wd, { flame: t => sm(P(4.3, 5.2, t)), appear: t => P(2.2, 3.4, t) });
    const gl = glowAt(Wd.scene, 7, 0xffc070, .0); gl.position.set(0, 1.1, .2); Wd.on(t => gl.material.opacity = .45 * kW(t));
    const sp = []; for (let i = 0; i < 12; i++) { const s = glowSprite(.2, .2, 0); s.material.color.set(0xffe9a8); Wd.add(s); sp.push(s); }
    Wd.on(t => sp.forEach((s, i) => { const k = P(2.2, 4.4, t); const a = i * 2.4 + t * 1.1; s.position.set((i % 2 ? .62 : -.62) + Math.cos(a) * .35 * (1 - k * .3), CT + .3 + k * 1.0 + (i % 3) * .1 + Math.sin(a) * .1, Math.sin(a) * .25); s.material.opacity = Math.sin(PI * clamp(k + i * .02, 0, 1)) * .8; }));
    seatBoys(Wd, (t, i) => { const k = kW(t); return { smile: .1 + .9 * k, brow: .25 * (1 - k), perform: .3 * k, talk: k > .85 ? .5 * talkAmt(t, i + 1) : 0, look: .25 * Math.sin(t * .6 + i * 2) * (1 - k), gesture: !(i === 3) ? null : (k > .5 ? null : 'headdown') }; });
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C(0, [0, 1.0, 0], 7.0, 1.8, 12, 44), C(4.4, [0, 1.2, 0], 4.6, 1.0, -8, 42)])],
      [4.4, cine([C(4.4, [0, 1.3, 0], 2.8, .15, 18, 40), C(8.6, [0, 1.3, 0], 2.4, .0, -14, 38)])],
      [8.6, cine([C(8.6, [0, 1.1, -.5], 3.8, .6, -34, 44), C(14, [0, 1.15, -.4], 4.6, 1.0, 34, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 42-56: split screen: LEFT home (candles, empty chairs, no food) | RIGHT hall (candles, boys eating). green check over the hall, grey ? over the home
  function s4(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140, hemi: 1.15, sun: 1.1 });
    const half = home => { const sx = home ? -1 : 1, x0 = sx * 10;   // each half = a 20 m wide room: floor, back wall, decor; the two halves meet at x = 0
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), K.toon(0xffffff, { map: K.planksTex([8, 5]) })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; fl.position.set(x0, .005, 2.9); Wd.add(fl);
      Wd.add(box(20, 4.4, .3, home ? 0xf4e4c0 : 0xf1e3c6, { pos: [x0, 2.2, -3.1], ink: false })); Wd.add(box(20, 1, .12, 0xb98a58, { pos: [x0, .5, -2.95], ink: false }));
      if (home) { for (const wx of [-5.05, -10.2, -15.0]) { Wd.add(box(1.6, 2.0, .1, 0x1e2f60, { pos: [wx, 2.2, -2.9], ink: false })); Wd.add(box(.45, 2.6, .12, 0xc9946a, { pos: [wx - 1.0, 2.2, -2.8], ink: false })); Wd.add(box(.45, 2.6, .12, 0xc9946a, { pos: [wx + 1.0, 2.2, -2.8], ink: false })); } Wd.add(box(1.6, 2.6, .4, 0x7a4a2a, { pos: [-1.35, 1.3, -2.7] })); Wd.add(box(1.6, 2.6, .4, 0x7a4a2a, { pos: [-7.7, 1.3, -2.7] })); Wd.add(box(1.6, 2.6, .4, 0x7a4a2a, { pos: [-12.6, 1.3, -2.7] })); }
      else for (const dx of [1.25, 3.45, 5.65, 9.8, 14.2]) { Wd.add(box(.7, 3.4, .14, 0x8a2a3a, { pos: [dx - .8, 2.3, -2.9], ink: false })); Wd.add(box(.7, 3.4, .14, 0x8a2a3a, { pos: [dx + .8, 2.3, -2.9], ink: false })); Wd.add(box(.9, 2.8, .1, 0x1e2f60, { pos: [dx, 2.4, -2.92], ink: false })); } };
    half(true); half(false);
    Wd.add(box(.14, 4.4, .3, 0xffffff, { pos: [0, 2.2, -2.9], ink: false })); Wd.add(box(.14, .05, 6, 0xffffff, { pos: [0, .03, 0], ink: false }));
    // home (left): candles, EMPTY chairs, no food
    diningTable(Wd, { x: -3.45, z: 0, len: 2.2, wid: 1.0, food: false });
    [-.8, .8].forEach(x => { chair(Wd, -3.45 + x, -.9, 0, .3); chair(Wd, -3.45 + x, .9, PI, .3); });
    const hc = [-.4, .4].map(x => candle(Wd, { pos: [-3.45 + x, CT, 0], h: .3, light: { color: 0xffb35a, i: .9, dist: 5 }, flame: t => sm(P(.3, 1.2, t)) }));
    // hall (right): candles, food, boys eating
    diningTable(Wd, { x: 3.45, z: 0, len: 2.6, wid: 1.0, food: true });
    [-.9, 0, .9].forEach(x => chair(Wd, 3.45 + x, -.9, 0, .3)); chair(Wd, 3.45 - 1.6, 0, PI / 2, .3); chair(Wd, 3.45 + 1.6, 0, -PI / 2, .3);
    const rc = [-.5, .5].map(x => candle(Wd, { pos: [3.45 + x, CT, 0], h: .3, light: { color: 0xffb35a, i: .9, dist: 5 }, flame: t => sm(P(.3, 1.2, t)) }));
    [[1, -.9, 0], [3, 0, 0], [2, .9, 0]].forEach(([id, dx, f], i) => boyP(Wd, id, t => Object.assign({ pos: [3.45 + dx, 0, -.78], facing: 0, smile: .9, perform: .5, talk: .4 * talkAmt(t, i + 3) }, SIT)));
    boyP(Wd, 4, t => Object.assign({ pos: [3.45 - 1.5, 0, 0], facing: PI / 2, smile: .9, perform: .5, talk: .3 * talkAmt(t, 8) }, SIT));
    const lh = board(Wd, { w: 1.5, h: .6, draw: drawWord('בית', '#fff4cf', '#7a4a1e'), cw: 512, frame: 0x6b3a1c }), la = board(Wd, { w: 1.9, h: .6, draw: drawWord('אולם', '#fff4cf', '#7a1c1c'), cw: 512, frame: 0x6b3a1c });
    const ck = mark3d(Wd, 'check', 1.0), q = qmark(Wd, '#a8adb8', 1.5);
    Wd.on(t => { lh.set([-3.45, 3.55, -2.7], popE(P(.5, 1.2, t)), 0); la.set([3.45, 3.55, -2.7], popE(P(.5, 1.2, t)), 0);
      ck.set([3.45, 2.75, -1.0], popE(P(3.4, 4.3, t)) * 1.1, .05 * Math.sin(t * 3)); q.set([-3.45, 2.7 + .06 * Math.sin(t * 1.7), -1.0], popE(P(4.6, 5.4, t)) * .8, .15 * Math.sin(t * 1.2)); });
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C(0, [0, 1.7, 0], 10.5, 1.6, -4, 44), C(3.8, [0, 1.8, 0], 9.0, 1.3, 6, 44)])],
      [3.8, cine([C(3.8, [3.45, 2.1, -.4], 7.0, .8, -16, 42), C(8, [3.45, 1.9, -.4], 5.8, .5, 18, 40)])],
      [8, cine([C(8, [-3.45, 2.0, -.4], 6.6, .8, 16, 42), C(11.5, [-3.45, 1.9, -.3], 5.4, .5, -20, 40)])],
      [11.5, cine([C(11.5, [0, 1.9, 0], 9.0, 1.4, -8, 44), C(14, [0, 2.0, 0], 10.5, 1.8, 6, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 56-70: no open flame in the hall: crossed-out flame sign; the boys look at each other
  function s5(dur) {
    const { Wd, hr } = hallWorld(true);
    warmLight(Wd, hr, t => 1);
    const sg = board(Wd, { w: 1.9, h: 1.9, draw: drawNoFlame, cw: 640, frame: 0x6b3a1c, glow: 0xff7a7a }), sk = shock(Wd, 0xff7a7a), x = mark3d(Wd, 'cross', .0);
    Wd.on(t => { sg.set([2.9, 2.35 + .05 * Math.sin(t * 1.4), .3], popE(P(1.6, 2.5, t)) * .8, -.45); sk.set([2.9, 2.35, .6], P(2.5, 3.3, t), 3.2); });
    seatBoys(Wd, (t, i) => { const a = sm(P(2.6, 3.6, t)), b = sm(P(6.5, 7.8, t)); const toSign = PI / 2 - .35;
      const base = SEATS[i].f; let f = base, gesture = null, look = 0;
      if (i === 0) { f = lerp(base, toSign, a); f = lerp(f, PI / 2 + .15, b); gesture = b > .5 ? 'think' : null; }
      else if (i === 1) { f = lerp(base, toSign, a); f = lerp(f, -.5, b); gesture = b > .5 ? 'shrug' : null; }
      else if (i === 2) { f = lerp(base, toSign, a); f = lerp(f, -.35, b); gesture = b > .6 ? 'think' : null; look = .3 * b; }
      else if (i === 3) { f = lerp(base, toSign, a * .6); gesture = b > .5 ? 'think' : null; }
      else { f = lerp(base, toSign + .3, a * .5); gesture = b > .5 ? 'shrug' : null; }
      return { facing: f, smile: .3 * (1 - a), brow: .5 * a, perform: gesture ? 0 : .3 * (1 - a), gesture, look }; });
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C(0, [.5, 1.2, 0], 7.4, 1.8, -16, 44), C(4, [1.8, 1.7, .2], 6.2, 1.0, 10, 44)])],
      [4, cine([C(4, [2.2, 1.9, .3], 6.2, .3, 24, 42), C(7.5, [1.8, 1.8, .3], 5.6, .4, -16, 42)])],
      [7.5, cine([C(7.5, [0, 1.1, -.5], 3.8, .6, 20, 42), C(11, [0, 1.1, -.4], 3.4, .5, -24, 42), C(14, [0, 1.4, 0], 6.6, 2.0, 12, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 70-84: home: candles light by themselves; time-lapse with a big clock: short candles die (red X), long candles keep burning (green check)
  function s6(dur) {
    const Wd = mkWorld({ fogNear: 30, fogFar: 100 }), R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6 });
    nightWindow(Wd, -2.2, 1.0, -R.HZ + .02, 0, 1.6, 2.1); nightWindow(Wd, 2.2, 1.0, -R.HZ + .02, 0, 1.6, 2.1);
    Wd.add(box(2.6, 2.8, .5, 0x7a4a2a, { pos: [-R.HX + 1.6, 1.4, -R.HZ + .3] }));
    diningTable(Wd, { x: 0, z: 0, len: 2.8, wid: 1.1, food: false }); [-.8, .8].forEach(x => { chair(Wd, x, -.95, 0, .3); chair(Wd, x, .95, PI, .3); });
    lighting(Wd, t => ({ hemi: lerp(.5, .72, sm(P(1, 3, t))), sun: .35, hemiColor: 0xd0c0a8 }));
    const burn = (a, b) => t => 1 - P(a, b, t), TL = 4.4, TE = 11.6;
    const mk = (x, h, lenF, delay) => candle(Wd, { pos: [x, CT, 0], h, light: { color: 0xffb35a, i: .8, dist: 6 }, glowSize: 1.2, flame: t => sm(P(1.0 + delay, 1.9 + delay, t)) * (lenF(t) > .06 ? 1 : sm(clamp(lenF(t) / .06, 0, 1))), len: lenF });
    const shortLen = t => lerp(1, 0, sm(P(TL, 8.2, t))), longLen = t => lerp(1, .55, P(TL, TE, t));
    mk(-.75, .06, shortLen, 0); mk(-.45, .06, shortLen, .4); mk(.45, .62, longLen, .8); mk(.75, .62, longLen, 1.2);
    const ck = clock(Wd, { r: .8 }), xm = mark3d(Wd, 'cross', 1.0), ok = mark3d(Wd, 'check', 1.0), sx = mark3d(Wd, 'cross', 1.0), so = mark3d(Wd, 'check', 1.0);
    Wd.on(t => { ck.set([0, 2.85 + .06 * Math.sin(t * 1.3), -.1], popE(P(3.0, 3.9, t)) * .95, lerp(18, 26.5, sm(P(TL, TE, t)))); xm.set([-1.3, 1.5, .2], popE(P(8.3, 9.2, t)) * .5 * (1 - sm(P(10.6, 11.3, t))), .06 * Math.sin(t * 4)); ok.set([1.5, 2.0, .4], popE(P(11.7, 12.6, t)) * .62, .05 * Math.sin(t * 3));
      sx.set([-.6, 1.45, .3], popE(P(3.6, 4.3, t)) * .42 * (1 - sm(P(8.3, 8.8, t))), 0); so.set([.6, 2.2, .3], popE(P(3.6, 4.3, t)) * .42 * (1 - sm(P(11.7, 12.2, t))), 0); });
    boyP(Wd, 1, t => ({ pos: [2.9, 0, 1.6], facing: face(-2.9, -1.6), gesture: t > 5 ? 'think' : null, perform: t > 5 ? 0 : .3, brow: .3 * sm(P(4, 6, t)), smile: .3 + .6 * sm(P(11.5, 13, t)), look: -.3 }));
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C(0, [0, 1.1, 0], 7.4, 1.8, -18, 44), C(3.6, [0, 1.2, 0], 5.6, 1.2, 8, 44)])],
      [3.6, cine([C(3.6, [0, 1.75, 0], 6.2, .4, -12, 44), C(8, [0, 1.7, 0], 6.8, .5, 18, 44)])],
      [8, cine([C(8, [-.6, 1.3, 0], 3.2, .2, 12, 40), C(11.4, [-.6, 1.2, 0], 2.8, .1, -10, 38)])],
      [11.4, cine([C(11.4, [.6, 1.4, 0], 3.4, .3, -14, 42), C(14, [0, 1.5, 0], 6.8, 1.6, 12, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 84-100: night, the boys come home; the long candles light the house; one steps over a toy truck (grey what-if inset: in the dark he trips)
  const TE7 = 1.6, V7 = 1.3, TRUCK = [.2, 0, 1.5];
  const walk7 = (t, d, i) => { const te = TE7 + d; return t < te ? 5.6 : Math.max(-3.4 + (i || 0) * 1.1, 5.6 - V7 * (t - te)); };
  function s7(dur) {
    const Wd = mkWorld({ fogNear: 30, fogFar: 100 }), R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6 });
    nightWindow(Wd, -2.2, 1.0, -R.HZ + .02, 0, 1.6, 2.1); nightWindow(Wd, 2.0, 1.0, -R.HZ + .02, 0, 1.6, 2.1);
    Wd.add(box(2.4, 2.8, .5, 0x7a4a2a, { pos: [-R.HX + 1.5, 1.4, -R.HZ + .3] }));
    diningTable(Wd, { x: -.3, z: -1.6, len: 2.6, wid: 1.0, food: false });
    // doorway in the right wall: frame + open door leaf, night outside
    Wd.add(box(.25, 2.5, .15, 0x6b3a1c, { pos: [R.HX - .12, 1.25, 1.0] })); Wd.add(box(.25, 2.5, .15, 0x6b3a1c, { pos: [R.HX - .12, 1.25, 2.1] })); Wd.add(box(.25, .15, 1.25, 0x6b3a1c, { pos: [R.HX - .12, 2.55, 1.55] })); Wd.add(box(.1, 2.45, 1.0, 0x1a2550, { pos: [R.HX + .05, 1.22, 1.55], ink: false }));
    toyTruck(Wd, TRUCK, .4);
    lighting(Wd, t => ({ hemi: .42, sun: .25, hemiColor: 0xb8a890, sunColor: 0xc0c8e0 }));
    [-1.0, .4].forEach((x, i) => candle(Wd, { pos: [x, CT, -1.6], h: .5, len: () => .6, light: { color: 0xffb35a, i: 1.25, dist: 9 }, glowSize: 1.4, flame: t => 1 }));
    const pool = glowSprite(9, 9, .35); pool.position.set(-.3, .2, -1.0); pool.material.color.set(0xffb05a); Wd.add(pool);
    [0, 1].forEach(i => boyP(Wd, [1, 3][i], t => { const d = i * 1.3, x = walk7(t, d, i), mv = x > -3.4 + i * 1.1 + .001 && t > TE7 + d, hop = Math.abs(x - TRUCK[0]) < .6 && mv ? .17 * Math.sin(PI * clamp((TRUCK[0] + .6 - x) / 1.2, 0, 1)) : 0;
      const fin = t > 10 + d * .5; return { pos: [x, hop, TRUCK[2] + (i ? .35 : 0)], facing: fin ? 0.2 : -PI / 2, walk: mv ? t * 5.6 + i : undefined, hidden: t < TE7 + d - .3, smile: .6 + .3 * (fin ? 1 : 0), gesture: fin ? (i ? 'thumb' : 'explainA') : null, perform: 0, brow: 0 }; }));
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C(0, [1.0, 1.2, 1.2], 7.4, 1.4, 22, 44), C(4, [1.6, 1.0, 1.5], 5.6, 1.0, 26, 42)])],
      [4, cine([C(4, [1.6, .65, 1.5], 3.8, .2, 10, 40), C(8, [-.6, .65, 1.5], 3.8, .2, -10, 40)])],
      [8, cine([C(8, [-2.2, 1.1, 1.6], 4.8, .8, 20, 44), C(11.5, [-2.4, 1.1, 1.5], 3.8, .6, -20, 42)])],
      [11.5, cine([C(11.5, [-.4, 1.4, -.4], 8.0, 2.2, 10, 46), C(16, [-.4, 1.4, -.4], 6.4, 1.6, -16, 46)])]);
    return Wd;
  }
  // grey what-if inset (second small world): the same room in the dark, the boy trips over the truck
  const W2 = mkWorldInset();
  function mkWorldInset() {
    const Wd = mkWorld({ fogNear: 20, fogFar: 60, hemi: .22, sun: .08, hemiColor: 0x8890a8, sunColor: 0x8090b0, skyTop: 0x0a1020, skyBottom: 0x151c30, fogColor: 0x10162a }); const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6 });
    toyTruck(Wd, [TRUCK[0], 0, 0], .4);
    const b = boyP(Wd, 1, t => { const x = lerp(2.6, TRUCK[0] + .3, sm(P(0, 2.3, t))) - (t > 2.3 ? (t - 2.3) * .3 * (1 - P(2.3, 3.2, t)) : 0), fall = sm(P(2.3, 3.4, t)); return { pos: [x, 0, 0], facing: -PI / 2, walk: t < 2.3 ? t * 5 : undefined, smile: 0, brow: .3 * fall, perform: 0, talk: 0 }; });
    Wd.on(t => { const fall = sm(P(2.3, 3.4, t)); b.group.rotation.z = fall * 1.45; b.group.position.y = .06 * fall; });
    Wd.updaters; return Wd;
  }
  const inset = insetView(W2, t => ({ pos: [lerp(1.6, -.4, P(0, 4, t)), 1.0, 3.0], look: [lerp(1.0, -.6, P(0, 4, t)), .5, 0], fov: 44 }), 640, 360);
  const IN0 = 87.6, IN1 = 93.8;

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the hall table with glowing candles behind the card
  function answerBg(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }), hr = hallRoom(Wd); warmLight(Wd, hr, t => 1);
    const o = [0, 0, 2.2]; const T = new THREE.Group(); T.position.set(0, 0, 2.4); Wd.add(T);
    diningTable(Wd, { x: 0, z: 2.4, len: 3.2, wid: 1.1, food: true });
    [-1.1, 0, 1.1].forEach(x => chair(Wd, x, 1.45, 0, .3)); chair(Wd, -2.05, 2.4, PI / 2, .3); chair(Wd, 2.05, 2.4, -PI / 2, .3);
    [-.62, .62].forEach(x => candle(Wd, { pos: [x, CT, 2.4], h: .26, light: { color: 0xffb35a, i: 1.0, dist: 7 }, glowSize: 1.5, flame: () => 1 }));
    const gl = glowAt(Wd.scene, 8, 0xffc070, .5); gl.position.set(0, 1.1, 2.6);
    [[1, -1.1, 1.58, 0], [3, 0, 1.58, 0], [2, 1.1, 1.58, 0]].forEach(([id, x, z, f], i) => boyP(Wd, id, t => Object.assign({ pos: [x, 0, z], facing: f, smile: 1, perform: .5, talk: .5 * talkAmt(t, i + 2) }, SIT)));
    boyP(Wd, 4, t => Object.assign({ pos: [-1.95, 0, 2.4], facing: PI / 2, smile: 1, perform: .5, talk: .3 * talkAmt(t, 8) }, SIT)); boyP(Wd, 5, t => Object.assign({ pos: [1.95, 0, 2.4], facing: -PI / 2, smile: 1, perform: .5, talk: .3 * talkAmt(t, 9) }, SIT));
    Wd.center = [0, 1.6]; Wd.ansD = 6.4; return Wd;
  }

  const grade = t => {
    if (t >= 14 && t < 28.6) return { sat: lerp(1, .4, sm(P(14, 14.8, t))) };
    if (t >= 28.6 && t < 33) return { sat: lerp(.4, 1, sm(P(28.6, 32, t))) };
    return { sat: 1 };
  };
  const overlay = (g, W, H, t) => {
    if (t < IN0 - .1 || t > IN1 + .5) return; const s = H / 1080, k = sm(P(IN0, IN0 + .5, t)) * (1 - sm(P(IN1, IN1 + .45, t))); if (k <= .01) return;
    const w = 640 * 1.05 * s * k, h = 360 * 1.05 * s * k, x = W - 36 * s - w, y = 190 * s;
    g.save(); g.globalAlpha = .98; inset.draw(g, t - IN0, x, y, w, h, 'grayscale(1) brightness(1.15) contrast(1.05)'); g.restore();
    g.save(); g.strokeStyle = '#eef0f6'; g.lineWidth = 7 * s; g.beginPath(); g.roundRect(x, y, w, h, 26); g.stroke();
    const f = clamp((t - IN0) / 2.9, 0, 1); if (f > .8) { g.fillStyle = '#e03131'; g.font = `700 ${86 * s * k}px Assistant, Heebo, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', x + w - 56 * s, y + 70 * s); }
    g.restore();
  };
  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg, grade, overlay };
};
