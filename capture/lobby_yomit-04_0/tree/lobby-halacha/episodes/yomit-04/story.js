// yomit-04 story: "squeezing fruit on Yom Tov" (halacha yomit, R' Fried) - 3D choreography per storyboards_v5.md (A).
// Boys only (Sruly + little Avrami). Nobody squeezes by hand and nobody touches a flame: fruit, lemon halves and tools float and work BY ITSELF (magic kitchen).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, plainRoom, diningTable, chair, mark3d, popE, lighting, glowAt, glowSprite,
    texPlane, toon, bm, FONT, fitText, lerpV, arcPt, shock: shockRaw, bill, booksTex, windowUnit, dotPath, rng } = K;
  const shock = (Wd, c) => { const o = shockRaw(Wd, c), st = o.set; o.set = (pos, k, size) => st(pos, k, Math.min(size || 1, .3)); return o; };   // small rings: never reach a head
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.06 * d : ly];
  const CT = .72, TT = .76;                    // island top / table top (cloth)
  const TX = 3.0, TZ = -1.7;                   // dining table centre
  const BZ = -3.25;                            // the boys' standing line (behind island / table)
  const SRULY = 3, AVRAMI = 2, DS = .88;
  const SIT = { sit: true, groundY: 0 };
  const IZ = -1.78;                            // z line of everything floating over the island
  const LB = -3.95, RB = -.1;                  // standing boys: left / right of the island

  // ---------------------------------------------------------------- boys
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(() => { const k = Pn.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }); return Pn; };   // dark navy velvet kippa
  const sruly = (Wd, fn) => boyK(Wd, SRULY, t => Object.assign({ pos: [-3.0, 0, BZ], facing: .45, perform: .35, smile: .5 }, fn(t)));
  const avrami = (Wd, fn) => boyK(Wd, AVRAMI, t => Object.assign({ pos: [-.8, 0, BZ], facing: -.4, scale: DS, perform: .35, smile: .5 }, fn(t)));

  // ---------------------------------------------------------------- billboards (tags, lock)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .84, maxLines: 1, max: H * .64, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54); };
  const drawShabbat = drawTag('שבת', '#fff2b8', '#7a1c1c', '#d9a63a');
  const drawYomTov = drawTag('יום טוב', '#d9ecff', '#1a3a7a', '#4a8fd0');
  const drawDash = drawTag('דש', '#e4e6ea', '#3a3f48', '#8a929c');
  const drawEq = drawTag('=', '#fff2b8', '#7a1c1c', '#d9a63a');
  const drawLock = (c, W, H) => {
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = '#3a3f48'; c.lineWidth = W * .2; c.beginPath(); c.arc(W / 2, H * .38, W * .24, PI, 0); c.lineTo(W * .74, H * .5); c.moveTo(W * .26, H * .38); c.lineTo(W * .26, H * .5); c.stroke();
    c.strokeStyle = '#b4bac2'; c.lineWidth = W * .1; c.beginPath(); c.arc(W / 2, H * .38, W * .24, PI, 0); c.lineTo(W * .74, H * .5); c.moveTo(W * .26, H * .38); c.lineTo(W * .26, H * .5); c.stroke();
    c.fillStyle = '#8a929c'; c.beginPath(); c.roundRect(W * .12, H * .46, W * .76, H * .46, W * .1); c.fill(); c.lineWidth = W * .05; c.strokeStyle = '#3a3f48'; c.stroke();
    c.fillStyle = '#3a3f48'; c.beginPath(); c.arc(W / 2, H * .64, W * .08, 0, PI * 2); c.fill(); c.fillRect(W * .47, H * .64, W * .06, H * .16); };

  // ---------------------------------------------------------------- rooms (same bright Yom Tov kitchen as yomit-03)
  function kitchenRoom(Wd, noChairs) {
    const R = plainRoom(Wd, { HX: 6.2, HZ: 4.6, H: 3.5, beams: false, wall: 0xf8edd2 });
    Wd.add(box(5.7, .9, .7, 0xc9a574, { pos: [-3.3, .45, -4.25] })); Wd.add(box(5.8, .06, .8, 0x6a5a48, { pos: [-3.3, .93, -4.22] }));
    Wd.add(box(5.7, .85, .04, 0xeef2f6, { pos: [-3.3, 1.38, -4.58], ink: false }));
    windowUnit(Wd, -3.3, 1.5, -4.57, 0, 1.4, 1.7);
    Wd.add(box(1.8, .9, .4, 0xb98a58, { pos: [-5.2, 2.55, -4.4] })); Wd.add(box(1.8, .9, .4, 0xb98a58, { pos: [-1.4, 2.55, -4.4] }));
    Wd.add(box(.95, 2.2, .8, 0xeef2f6, { pos: [-.1, 1.1, -4.15] }));
    for (const dy of [.5, 1.6]) Wd.add(box(.05, .5, .05, 0x8a929c, { pos: [.3, dy + .2, -3.72], ink: false }));
    windowUnit(Wd, 3.0, 1.0, -4.57, 0, 1.6, 2.1);
    for (const dx of [-1, 1]) Wd.add(box(.5, 2.4, .14, 0xb5503a, { pos: [3.0 + dx * 1.1, 1.9, -4.5], ink: false }));
    Wd.add(box(1.7, 2.7, .5, 0x7a4a2a, { pos: [5.2, 1.35, -4.3] })); const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.5), toon(0xffffff, { map: booksTex(5) })); sh.position.set(5.2, 1.35, -4.04); Wd.add(sh);
    Wd.add(box(2.5, .62, .95, 0xf0e4cc, { pos: [-2.2, .31, -1.75] })); Wd.add(box(2.7, .08, 1.05, 0xe2bd88, { pos: [-2.2, .68, -1.75] }));
    diningTable(Wd, { x: TX, z: TZ, len: 3.2, wid: 1.1, cloth: 0xfffaf0, food: false });
    Wd.add(box(3.0, .012, .26, 0xd9a63a, { pos: [TX, TT + .008, TZ], ink: false }));
    Wd.add(box(.46, .09, .26, 0x244a86, { pos: [TX + 1.15, TT + .05, TZ - .34] })); Wd.add(ball(.13, 0xe3b25a, { pos: [TX + 1.15, TT + .1, TZ - .34], scale: [1.4, .5, 1], ink: false }));
    Wd.add(cyl(.05, .035, .16, 0xd8dde6, { pos: [TX - 1.2, TT + .1, TZ - .36] })); Wd.add(cyl(.09, .09, .02, 0xd8dde6, { pos: [TX - 1.2, TT + .03, TZ - .36], ink: false }));
    if (!noChairs) { chair(Wd, TX - .7, TZ - .95, 0, .46); chair(Wd, TX + .7, TZ - .95, 0, .46); }
    lighting(Wd, () => ({ hemi: 1.15, sun: 1.0, hemiColor: 0xfff1d8, sunColor: 0xfff1dc }));
    return R;
  }
  const kW = () => mkWorld({ skyTop: 0x9ad0f6, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 40, fogFar: 140, hemi: 1.15, sun: 1.0, sunPos: [-14, 26, 16], shadowExt: 14 });

  // ---------------------------------------------------------------- props
  function openCyl(Wd, rt, rb, h, col) {
    const g = new THREE.Group(); const side = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 32, 1, true), toon(col, { side: THREE.DoubleSide })); side.position.y = h / 2; side.castShadow = true; g.add(side);
    g.add(cyl(rb - .005, rb - .005, .02, 0xe8eef4, { pos: [0, .012, 0], ink: false }));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(rt, .018, 8, 32), toon(0xffffff)); rim.rotation.x = PI / 2; rim.position.y = h; g.add(rim); Wd.add(g); return g;
  }
  const mkBowl = Wd => openCyl(Wd, .27, .18, .2, 0x4a8fd0);                       // salad bowl (origin = base centre)
  const mkGlass = Wd => openCyl(Wd, .105, .08, .24, 0xc4e6f7);                    // the EMPTY glass
  const mkPlate = (Wd, r) => { const g = new THREE.Group(); g.add(cyl(r, r * .85, .03, 0xfffaf0, { pos: [0, .015, 0] })); const rm = new THREE.Mesh(new THREE.TorusGeometry(r * .93, .014, 6, 32), toon(0x3b6fd0)); rm.rotation.x = PI / 2; rm.position.y = .03; g.add(rm); Wd.add(g); return g; };
  function mkFish(Wd) {   // plate with a fish on it (origin = plate base centre)
    const g = mkPlate(Wd, .32);
    g.add(ball(.13, 0xc98f5a, { pos: [0, .09, 0], scale: [1.75, .55, .8], inkW: .005 })); g.add(ball(.11, 0xe0b080, { pos: [0, .115, .02], scale: [1.5, .3, .6], ink: false }));
    const tail = new THREE.Mesh(new THREE.ConeGeometry(.09, .13, 3), toon(0xb07a46)); tail.rotation.z = PI / 2; tail.position.set(-.27, .09, 0); tail.scale.set(1, 1, .3); tail.castShadow = true; g.add(tail);
    g.add(ball(.016, 0x2a1a10, { pos: [.19, .12, .09], ink: false })); g.add(ball(.016, 0x2a1a10, { pos: [.19, .12, -.09], ink: false }));
    for (const [dx, dz] of [[.2, .2], [-.12, .2], [.05, -.22]]) g.add(ball(.035, 0x3fae4a, { pos: [dx, .05, dz], scale: [1, .6, 1], ink: false }));
    return g; }
  function mkOrange(Wd) { const g = new THREE.Group(); g.add(ball(.1, 0xff9a1f, { inkW: .005 })); g.add(ball(.02, 0x3fae4a, { pos: [0, .098, 0], scale: [1.8, .5, 1.8], ink: false })); g.add(ball(.03, 0xffb44a, { pos: [-.04, .04, .075], ink: false })); Wd.add(g); return g; }
  function mkLemonHalf(Wd) {   // origin = cut-face level; s tilts so the cut face half-shows to the camera
    const g = new THREE.Group(), s = new THREE.Group(); g.add(s); Wd.add(g);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(.098, 22, 12, 0, PI * 2, 0, PI / 2), toon(0xffe03a)); dome.scale.set(1.05, .9, 1.05); dome.castShadow = true; s.add(dome);
    s.add(cyl(.098, .098, .012, 0xffe66a, { pos: [0, 0, 0], inkW: .004 })); s.add(cyl(.082, .082, .016, 0xfff6c0, { pos: [0, -.001, 0], ink: false }));
    for (let i = 0; i < 6; i++) s.add(box(.075, .018, .008, 0xffd84a, { pos: [Math.cos(i * PI / 3) * .035, -.002, Math.sin(i * PI / 3) * .035], rot: [0, -i * PI / 3, 0], ink: false }));
    s.rotation.x = -.7; return { g, s }; }
  function mkWipes(Wd) { const g = new THREE.Group(); g.add(box(.26, .075, .17, 0xf4f8ff, { pos: [0, .04, 0] })); g.add(box(.2, .078, .11, 0x3b8fd0, { pos: [0, .04, 0], ink: false })); g.add(box(.09, .022, .07, 0x2a6fb0, { pos: [.05, .09, 0] })); g.add(ball(.022, 0xffffff, { pos: [-.06, .04, .06], scale: [1, 1.3, .3], ink: false })); Wd.add(g); return g; }
  function mkSponge(Wd) { const g = new THREE.Group(); g.add(box(.22, .06, .13, 0xf2d23a, { pos: [0, .03, 0] })); g.add(box(.22, .022, .13, 0x2fa84f, { pos: [0, .07, 0] })); for (const dx of [-.07, 0, .07]) g.add(ball(.012, 0xd8b020, { pos: [dx, .035, .068], ink: false })); Wd.add(g); return g; }
  function mkSink(Wd, x) {
    Wd.add(box(.55, .06, .4, 0xdfe6ec, { pos: [x, CT + .03, IZ + .05] })); Wd.add(box(.43, .02, .28, 0x7a8794, { pos: [x, CT + .062, IZ + .05], ink: false }));
    Wd.add(cyl(.02, .02, .22, 0xc3cad2, { pos: [x - .16, CT + .17, IZ - .1] })); Wd.add(box(.02, .02, .14, 0xc3cad2, { pos: [x - .16, CT + .28, IZ - .03] })); }
  const CUC = [0x2e8b3a, 0xcfe8a8], TOM = [0xd8342a, 0xff8f7a];
  const addV = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const heapOff = (i, rank0) => { const k = i + (rank0 || 0), a = k * 2.39996, r = .12 * Math.sqrt(((k * 7) % 11 + 1) / 11); return [Math.cos(a) * r, .06 + (k % 5) * .016, Math.sin(a) * r * .9]; };
  function chips(Wd, list) {   // static decoration pieces
    const ms = list.map(o => { const m = new THREE.Group(); m.add(cyl(o.sz[0], o.sz[0], o.sz[1], o.col, { inkW: .004 })); if (o.col2) m.add(cyl(o.sz[0] * .78, o.sz[0] * .78, o.sz[1] + .004, o.col2, { ink: false })); Wd.add(m); m.position.set(...o.at); m.rotation.set(...o.rot); return m; });
    return ms; }
  function fillBowl(Wd, bowlPos, cols, n, rank0) { const specs = []; for (let i = 0; i < n; i++) { const off = heapOff(i, rank0 || 0); specs.push({ col: cols[i % cols.length][0], col2: cols[i % cols.length][1], sz: [.042, .03], at: addV(bowlPos, off), rot: [.4 * (i % 3), i, .6 * (i % 4)] }); } return chips(Wd, specs); }
  // lemon drops: spec {t0, d, from, to}; fall with gravity, vanish when they land
  function dropsFx(Wd, list) {
    const ms = list.map(() => { const m = ball(.03, 0xffe45a, { inkW: .003 }); m.visible = false; Wd.add(m); return m; });
    Wd.on(t => list.forEach((o, i) => { const m = ms[i], u = (t - o.t0) / o.d; if (u < 0 || u > 1.45) { m.visible = false; return; } m.visible = true; const f = Math.min(1, u);
      m.position.set(lerp(o.from[0], o.to[0], f), lerp(o.from[1], o.to[1], f * f), lerp(o.from[2], o.to[2], f)); const s = u < 1 ? 1 : Math.max(.01, 1 - (u - 1) / .45); m.scale.set(.9 * s, (1.3 - .3 * f) * s, .9 * s); }));
    return ms; }
  const mkDrops = (center, times, per, seed, spread) => { const R = rng(seed), out = []; times.forEach(ts => { for (let j = 0; j < per; j++) { const ox = (R() - .5) * (spread || .16), oz = (R() - .5) * (spread || .16) * .8;
      out.push({ t0: ts + .12 + .09 * j, d: .36, from: [center[0] + ox * .35, center[1] - .1, center[2] + oz * .35 + .02], to: [center[0] + ox, center[3], center[2] + oz] }); } }); return out; };
  const pulseHump = (t, times, w) => times.reduce((m, ts) => Math.max(m, sm(clamp(1 - Math.abs(t - ts) / (w || .26), 0, 1))), 0);
  const slamS = (t, t0, size) => { const a = P(t0, t0 + .3, t); return a <= 0 ? 0 : size * (1 + 1.4 * (1 - ease.out(a))); };

  // ---------------------------------------------------------------- 1. HOOK 0-14: oranges, lemon, empty glass, salad bowl, fish plate float; Sruly holds an orange over the empty glass, stops, looks at the camera
  function hook(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const glass = mkGlass(Wd), oA = mkOrange(Wd), oB = mkOrange(Wd), oC = mkOrange(Wd), lem = mkOrange(Wd), bw = mkBowl(Wd), fish = mkFish(Wd);
    lem.children[0].material = lem.children[0].material.clone(); lem.children[0].material.color.set(0xffe03a); lem.scale.set(1, 1, 1);
    fillBowl(Wd, [0, 0, 0], [CUC, TOM], 0);
    const salad = fillBowl(Wd, [0, 0, 0], [CUC, TOM], 9); const sg = new THREE.Group(); Wd.add(sg); salad.forEach(m => { Wd.scene.remove(m); sg.add(m); });
    const spark = [], R = rng(11); for (let i = 0; i < 10; i++) { const s = glowSprite(.14, .14, 0); s.material.color.set(0xffe9a8); Wd.add(s); spark.push([s, R() * 6, R()]); }
    const GXh = -3.0;
    Wd.on(t => { const k = sm(P(.2, 1.2, t));
      glass.position.set(GXh, CT + .1 + .035 * Math.sin(t * 1.3), IZ); glass.scale.setScalar(.01 + .99 * popE(P(.2, 1.0, t)));
      oB.position.set(-2.55, CT + .17 + .04 * Math.sin(t * 1.5 + 1), IZ + .05); oB.scale.setScalar(.01 + .99 * popE(P(.4, 1.1, t)));
      oC.position.set(-2.3, CT + .15 + .04 * Math.sin(t * 1.4 + 2), IZ - .04); oC.scale.setScalar(.01 + .99 * popE(P(.5, 1.2, t)));
      lem.position.set(-1.95, CT + .15 + .04 * Math.sin(t * 1.6 + 3), IZ); lem.scale.setScalar((.01 + .99 * popE(P(.6, 1.3, t))) * .85);
      bw.position.set(-1.5, CT + .12 + .04 * Math.sin(t * 1.2 + 1.5), IZ); bw.scale.setScalar(.01 + .99 * popE(P(.7, 1.5, t)));
      sg.position.copy(bw.position); sg.scale.copy(bw.scale);
      fish.position.set(-.98, CT + .14 + .04 * Math.sin(t * 1.35 + 4), IZ - .02); fish.scale.setScalar((.01 + .99 * popE(P(.9, 1.7, t))) * .78);
      // orange A: sits on the heap, then drifts over the empty glass and hovers there
      const u = sm(P(4.6, 6.4, t)), from = [-2.42, CT + .33, IZ + .02], to = [GXh, CT + .62, IZ];
      const p = u <= 0 ? [from[0], from[1] + .035 * Math.sin(t * 1.7), from[2]] : (u >= 1 ? [to[0], to[1] + .03 * Math.sin(t * 1.9), to[2]] : arcPt(from, to, u, .25));
      oA.position.set(p[0], p[1], p[2]); oA.scale.setScalar(.01 + .99 * popE(P(.3, 1.0, t))); oA.rotation.z = .15 * Math.sin(t * 1.1) * (1 - u);
      spark.forEach(([s, ph, q]) => { s.position.set(-2.2 + 1.5 * Math.sin(t * .6 + ph), CT + .75 + .25 * Math.sin(t * .9 + ph * 2), IZ + .2 * Math.sin(t + ph)); s.material.opacity = .5 * k * (.5 + .5 * Math.sin(t * 2.5 + ph) ** 2); }); });
    Wd.occ = [glass, oA, oB, oC, lem, bw, fish];
    sruly(Wd, t => ({ pos: [-4.4, 0, -1.75], facing: t < 9.2 ? .85 + .1 * Math.sin(t * .7) : lerp(.85, .12, sm(P(9.2, 10.4, t))), gesture: t > 4.6 && t < 9.2 ? 'think' : null, perform: t > 4.6 && t < 9.2 ? 0 : .5, brow: t > 6 ? .55 : .2, smile: t > 6 ? .05 : .4, look: t > 10.4 ? 0 : .4 * Math.sin(t * 1.2) }));
    avrami(Wd, t => ({ pos: [-.1, 0, -1.75], facing: -.85, gesture: t > 6.5 ? 'shrug' : null, perform: t > 6.5 ? 0 : .5, brow: .45, smile: .1, look: .3 }));
    Wd.center = [-2.2, -1.75]; Wd.qPos = [-3.4, -1.75]; Wd.qSize = 1.0;
    Wd.cam = seq([0, cine([C(0, [-1.9, 1.0, -2.2], 7.0, 1.8, -24, 44), C(5, [-2.0, 1.0, -2.2], 5.8, 1.5, 6, 44)])],
      [5, cine([C(5, [-2.5, 1.2, -2.0], 4.8, 1.1, 22, 40), C(9, [-2.5, 1.2, -2.0], 4.5, 1.0, -8, 40)])],
      [9, cine([C(9, [-2.8, 1.15, -1.9], 4.8, 1.1, -26, 40), C(11.6, [-2.6, 1.1, -1.9], 5.0, 1.1, 12, 40)])],
      [11.6, cine([C(11.6, [-2.2, 1.1, -2.1], 6.0, 1.6, 8, 43), C(14, [-2.2, 1.2, -2.1], 6.8, 1.8, -14, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: orange over the EMPTY glass; before one drop falls a red X slams between them; orange back to the bowl; sign "dash" with a grey lock
  function s2(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const GX = -2.5, FX = -1.55;
    const glass = mkGlass(Wd); glass.position.set(GX, CT, IZ); glass.scale.setScalar(1.5);
    const fb = mkBowl(Wd); fb.position.set(FX, CT, IZ); const rest = [mkOrange(Wd), mkOrange(Wd)]; rest[0].position.set(FX - .06, CT + .14, IZ + .02); rest[1].position.set(FX + .08, CT + .15, IZ - .03);
    const orange = mkOrange(Wd), x1 = mark3d(Wd, 'cross', 1.0), shk = shock(Wd, 0xff5a5a);
    const sign = bb(Wd, 1.0, .42, drawDash, 512), lock = bb(Wd, .5, .5, drawLock, 256), gl = glowAt(Wd.scene, 1.9, 0xaab0b8, 0);
    Wd.occ = [glass, orange, x1.g, sign.g, lock.g];
    const hov = [GX, CT + .72, IZ];
    Wd.on(t => {
      const up = sm(P(.3, 1.9, t)), back = sm(P(6.0, 8.2, t)); let p;
      if (back > 0) p = arcPt(hov, [FX + .02, CT + .27, IZ], back, .3); else p = arcPt([FX, CT + .3, IZ], hov, up, .35);
      const sq = back > 0 ? 0 : sm(P(3.3, 4.3, t)) * (1 - sm(P(4.7, 5.0, t)));
      orange.position.set(p[0], p[1] + (back > 0 || up < 1 ? 0 : .03 * Math.sin(t * 2.1)), p[2]); orange.scale.set(1.5 * (1 + .1 * sq), 1.5 * (1 - .14 * sq), 1.5 * (1 + .1 * sq)); orange.rotation.z = back > 0 || up < 1 ? .4 * Math.sin(t * 2) : .1 * Math.sin(t * 2);
      const xs = slamS(t, 4.8, .85) * (1 - sm(P(8.0, 8.8, t))); x1.set([GX + .62, CT + .5, IZ - .02], xs, .04 * Math.sin(t * 5)); shk.set([GX + .62, CT + .5, IZ], P(4.8, 5.6, t), 1.0);
      const sa = popE(P(8.6, 9.6, t)); sign.set([-2.2 + .35, CT + .95 + .05 * Math.sin(t * 1.8), IZ - .1], sa * 1.0, .03 * Math.sin(t * 2.4)); lock.set([-2.2 - .45, CT + .95 + .05 * Math.sin(t * 1.8 + 1), IZ - .1], popE(P(9.2, 10.2, t)) * 1.0, .12 * Math.sin(t * 3));
      gl.position.set(-2.2, CT + .95, IZ - .15); gl.material.opacity = .45 * sm(P(9.0, 10.5, t)); });
    sruly(Wd, t => ({ pos: [-3.55, 0, -1.75], facing: .85, gesture: t > 5.2 && t < 9 ? 'shrug' : (t > 1.5 && t < 4.7 ? 'point' : null), perform: (t > 5.2 && t < 9) || (t > 1.5 && t < 4.7) ? 0 : .5, brow: t > 4.8 ? .5 : .2, smile: t > 4.8 ? .05 : .4, look: .3 * Math.sin(t * .9) }));
    avrami(Wd, t => ({ pos: [-.95, 0, -1.75], facing: -.85, gesture: t > 5.4 && t < 8.6 ? 'shrug' : null, perform: t > 5.4 && t < 8.6 ? 0 : .45, brow: t > 4.8 ? .4 : .2, smile: .15, look: -.3 * Math.sin(t * .8) }));
    Wd.center = [-2.2, BZ];
    Wd.cam = seq([0, cine([C(0, [-2.3, 1.0, -1.8], 3.6, 1.3, 18, 38), C(3.4, [-2.3, 1.0, -1.8], 3.1, 1.25, 8, 38)])],
      [3.4, cine([C(3.4, [-2.3, 1.0, -1.8], 3.0, 1.2, -14, 38), C(6.8, [-2.3, 1.0, -1.8], 3.0, 1.2, 6, 38)])],
      [6.8, cine([C(6.8, [-2.3, 1.0, -1.8], 3.2, 1.3, 16, 38), C(10.4, [-2.3, 1.0, -1.8], 3.4, 1.3, -8, 38)])],
      [10.4, cine([C(10.4, [-2.3, 1.1, -1.8], 3.6, 1.3, -10, 40), C(dur, [-2.3, 1.1, -1.8], 4.2, 1.5, 12, 40)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-44: two tags "Shabbat" / "Yom Tov"; the lock "dash" sits on BOTH
  function s3(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const AX = -2.95, BX = -1.45, TY = CT + .98, TZ3 = IZ - .05;
    const tA = bb(Wd, 1.0, .42, drawShabbat, 512), tB = bb(Wd, 1.0, .42, drawYomTov, 512);
    const lA = bb(Wd, .5, .5, drawLock, 256), lB = bb(Wd, .5, .5, drawLock, 256), dA = bb(Wd, .6, .26, drawDash, 384), dB = bb(Wd, .6, .26, drawDash, 384);
    const sk1 = shock(Wd, 0xaab0b8), sk2 = shock(Wd, 0xaab0b8), g1 = glowAt(Wd.scene, 1.5, 0xaab0b8, 0), g2 = glowAt(Wd.scene, 1.5, 0xaab0b8, 0), gl = glowAt(Wd.scene, 1.6, 0xfff0a0, 0), gl2 = glowAt(Wd.scene, 1.6, 0xbfe0ff, 0);
    const spark = [], R = rng(31); for (let i = 0; i < 10; i++) { const s = glowSprite(.12, .12, 0); s.material.color.set(0xffe9a8); Wd.add(s); spark.push([s, R() * 6]); }
    Wd.occ = [tA.g, tB.g, lA.g, lB.g, dA.g, dB.g];
    Wd.on(t => { const a = popE(P(.5, 1.4, t)), b = popE(P(1.8, 2.7, t)), bob = k => .04 * Math.sin(t * 1.8 + k);
      tA.set([AX, TY + bob(0), TZ3], a, .035 * Math.sin(t * 1.6)); tB.set([BX, TY + bob(2), TZ3], b, .035 * Math.sin(t * 1.5 + 1));
      gl.position.set(AX, TY, TZ3 - .1); gl.material.opacity = .5 * a; gl2.position.set(BX, TY, TZ3 - .1); gl2.material.opacity = .5 * b;
      const l1 = popE(P(4.2, 5.0, t)), l2 = popE(P(6.6, 7.4, t));
      lA.set([AX - .2, TY - .36 + bob(1), TZ3 + .05], l1 * 1.0, .1 * Math.sin(t * 3)); lB.set([BX + .5, TY - .32 + bob(3), TZ3 + .05], l2 * 1.0, .1 * Math.sin(t * 3 + 1));
      dA.set([AX + .35, TY - .5 + bob(1), TZ3 + .02], popE(P(4.8, 5.6, t)) * .95, .02 * Math.sin(t * 2)); dB.set([BX, TY - .48 + bob(3), TZ3 + .02], popE(P(7.2, 8.0, t)) * .95, .02 * Math.sin(t * 2 + 1));
      sk1.set([AX - .2, TY - .36, TZ3], P(4.2, 5.0, t), 1.0); sk2.set([BX + .5, TY - .32, TZ3], P(6.6, 7.4, t), 1.0);
      g1.position.set(AX - .2, TY - .36, TZ3 - .1); g1.material.opacity = .5 * sm(P(4.2, 5.2, t)); g2.position.set(BX + .5, TY - .32, TZ3 - .1); g2.material.opacity = .5 * sm(P(6.6, 7.6, t));
      spark.forEach(([s, ph]) => { s.position.set(-2.2 + 1.6 * Math.sin(t * .55 + ph), CT + .35 + .6 * (.5 + .5 * Math.sin(t * .8 + ph * 2)), IZ + .2 * Math.sin(t + ph)); s.material.opacity = .5 * sm(P(1, 3, t)) * (.5 + .5 * Math.sin(t * 2.5 + ph) ** 2); }); });
    sruly(Wd, t => ({ pos: [LB, 0, -1.75], facing: .85, gesture: t > 2.8 && t < 6 ? 'point' : (t > 9 ? 'shrug' : null), perform: (t > 2.8 && t < 6) || t > 9 ? 0 : .5, smile: .3, brow: t > 9 ? .4 : .1, look: .3 * Math.sin(t * .9) }));
    avrami(Wd, t => ({ pos: [RB, 0, -1.75], facing: -.85, gesture: t > 6 && t < 9 ? 'point' : (t > 10 ? 'shrug' : null), perform: (t > 6 && t < 9) || t > 10 ? 0 : .5, smile: .3, brow: t > 10 ? .4 : .1, look: -.3 * Math.sin(t * .8) }));
    Wd.center = [-2.2, BZ];
    Wd.cam = seq([0, cine([C(0, [-2.2, 1.1, -1.9], 4.4, 1.4, -20, 42), C(3.6, [-2.2, 1.1, -1.9], 3.8, 1.3, -6, 42)])],
      [3.6, cine([C(3.6, [-2.2, 1.1, -1.9], 3.5, 1.3, 16, 40), C(7.6, [-2.2, 1.1, -1.9], 3.7, 1.3, -10, 40)])],
      [7.6, cine([C(7.6, [-2.2, 1.1, -1.9], 3.8, 1.3, -18, 40), C(10.6, [-2.2, 1.1, -1.9], 3.9, 1.3, 10, 40)])],
      [10.6, cine([C(10.6, [-2.2, 1.15, -1.9], 3.9, 1.3, 10, 42), C(dur, [-2.2, 1.15, -1.9], 4.6, 1.5, -10, 42)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-60: a lemon half squeezes drops directly onto the salad; the salad glows; green check
  function s4(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const SX = -2.3, bowlP = [SX, CT, IZ], hov = [SX, CT + .78, IZ], pul = [0, 1, 2, 3, 4, 5, 6].map(i => 3.0 + .9 * i);
    const bw = mkBowl(Wd); bw.position.set(...bowlP); fillBowl(Wd, bowlP, [CUC, TOM], 12);
    const lm = mkLemonHalf(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), gl = glowAt(Wd.scene, 2.0, 0x9dffb0, 0);
    dropsFx(Wd, mkDrops([SX, hov[1], IZ, CT + .2], pul, 3, 4));
    Wd.occ = [lm.g, bw, ck.g];
    Wd.on(t => { const ap = popE(P(.4, 1.4, t)) * (1 - sm(P(10.0, 10.8, t))), arr = sm(P(.4, 2.2, t)), h = pulseHump(t, pul, .24);
      const p = arr >= 1 ? hov : arcPt([SX + 1.1, CT + .9, IZ], hov, arr, .25);
      lm.g.visible = ap > .01; lm.g.scale.set(1.5 * Math.max(.01, ap) * (1 + .2 * h), 1.5 * Math.max(.01, ap) * (1 - .4 * h), 1.5 * Math.max(.01, ap) * (1 + .2 * h)); lm.g.position.set(p[0], p[1] + (arr >= 1 ? .03 * Math.sin(t * 2.2) - .05 * h : 0), p[2]); lm.g.rotation.z = .1 * Math.sin(t * 1.6);
      const ok = popE(P(10.7, 11.5, t)); ck.set([SX, CT + 1.18 + .05 * Math.sin(t * 3), IZ], ok * .62, .05 * Math.sin(t * 3)); sk.set([SX, CT + 1.18, IZ], P(10.4, 11.3, t), .6);
      gl.position.set(SX, CT + .25, IZ); gl.material.opacity = .55 * sm(P(4.5, 10.8, t)); bw.rotation.z = .02 * h; });
    avrami(Wd, t => ({ pos: [-3.6, 0, -1.75], facing: .85, gesture: t > 11 ? 'cheer' : (t > 1.5 && t < 3 ? 'point' : null), perform: t > 11 || (t > 1.5 && t < 3) ? 0 : .5, smile: .5 + .4 * sm(P(10, 11, t)), look: .3 * Math.sin(t * .9) }));
    sruly(Wd, t => ({ pos: [-.95, 0, -1.75], facing: -.85, gesture: t > 11 ? 'thumb' : null, perform: t > 11 ? 0 : .45, smile: .5 + .4 * sm(P(10, 11, t)), look: -.3 * Math.sin(t * .8) }));
    Wd.center = [-2.0, BZ];
    Wd.cam = seq([0, cine([C(0, [-2.3, 1.0, -1.8], 3.6, 1.3, 18, 38), C(3.0, [-2.3, 1.0, -1.8], 3.2, 1.25, 8, 38)])],
      [3.0, cine([C(3.0, [-2.3, 1.0, -1.8], 3.0, 1.2, -14, 38), C(7.0, [-2.3, 1.0, -1.8], 3.0, 1.2, 6, 38)])],
      [7.0, cine([C(7.0, [-2.3, 1.0, -1.8], 3.1, 1.2, 16, 38), C(10.4, [-2.3, 1.0, -1.8], 3.2, 1.2, -6, 38)])],
      [10.4, cine([C(10.4, [-2.3, 1.1, -1.8], 3.4, 1.3, -10, 40), C(dur, [-2.3, 1.1, -1.8], 4.2, 1.5, 10, 40)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 60-74: the same over a fish plate (check); then side by side: lemon->glass (X) vs lemon->salad (check)
  function s5(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const FXp = -2.2, GX = -2.8, SX = -1.6, hovF = [FXp, CT + .72, IZ], hovG = [GX, CT + .72, IZ], hovS = [SX, CT + .72, IZ];
    const fish = mkFish(Wd), glass = mkGlass(Wd), bw = mkBowl(Wd); bw.position.set(SX, CT, IZ); glass.position.set(GX, CT, IZ); glass.scale.setScalar(1.5); fillBowl(Wd, [SX, CT, IZ], [CUC, TOM], 12);
    const lA = mkLemonHalf(Wd), lB = mkLemonHalf(Wd), cF = mark3d(Wd, 'check', 1.0), cS = mark3d(Wd, 'check', 1.0), xG = mark3d(Wd, 'cross', 1.0), skF = shock(Wd, 0x6dff9a), skS = shock(Wd, 0x6dff9a), skG = shock(Wd, 0xff5a5a), glF = glowAt(Wd.scene, 2.0, 0x9dffb0, 0), glS = glowAt(Wd.scene, 2.0, 0x9dffb0, 0);
    const pF = [2.0, 2.9, 3.8], pS = [8.9, 9.6, 10.3];
    dropsFx(Wd, mkDrops([FXp, hovF[1], IZ, CT + .14], pF, 4, 7, .3).concat(mkDrops([SX, hovS[1], IZ, CT + .2], pS, 3, 9)));
    Wd.occ = [lA.g, lB.g, fish, glass, bw, cF.g, cS.g, xG.g];
    Wd.on(t => {
      const fi = popE(P(.2, 1.0, t)) * (1 - sm(P(6.4, 7.2, t))); fish.visible = fi > .01; fish.scale.setScalar(Math.max(.01, fi)); fish.position.set(FXp, CT + .02 + .02 * Math.sin(t * 2), IZ);
      const ga = popE(P(6.8, 7.6, t)); glass.visible = ga > .01; glass.scale.setScalar(Math.max(.01, ga)); const ba = popE(P(7.0, 7.8, t)); bw.visible = ba > .01; bw.scale.setScalar(Math.max(.01, ba));
      // lemon A: over the fish, then glides to the salad
      const arr = sm(P(.3, 1.6, t)), mv = sm(P(6.4, 8.0, t)); let p = mv > 0 ? arcPt(hovF, hovS, mv, .3) : (arr >= 1 ? hovF : arcPt([FXp + 1.0, CT + .95, IZ], hovF, arr, .25));
      const hA = Math.max(pulseHump(t, pF, .24), pulseHump(t, pS, .24));
      lA.g.visible = t > .3; lA.g.scale.set(1.5 * (1 + .2 * hA), 1.5 * (1 - .4 * hA), 1.5 * (1 + .2 * hA)); lA.g.position.set(p[0], p[1] + .03 * Math.sin(t * 2.2) - .05 * hA, p[2]); lA.g.rotation.z = .1 * Math.sin(t * 1.6);
      // lemon B: appears over the glass and tilts toward it - X before any drop
      const bp = popE(P(7.0, 7.9, t)); lB.g.visible = bp > .01; lB.g.scale.setScalar(1.5 * Math.max(.01, bp)); lB.g.position.set(hovG[0], hovG[1] + .03 * Math.sin(t * 2.4 + 1), hovG[2]); lB.g.rotation.z = -.35 * sm(P(8.2, 8.9, t)) + .05 * Math.sin(t * 2);
      const okF = popE(P(5.0, 5.9, t)) * (1 - sm(P(6.3, 6.9, t))); cF.set([FXp, CT + 1.15 + .05 * Math.sin(t * 3), IZ + .1], okF * .6, .05 * Math.sin(t * 3)); skF.set([FXp, CT + 1.15, IZ + .1], P(5.0, 5.9, t), .6);
      glF.position.set(FXp, CT + .25, IZ); glF.material.opacity = .55 * sm(P(2.4, 5.4, t)) * (1 - sm(P(6.4, 7.2, t)));
      const xs = slamS(t, 9.0, .6); xG.set([GX, CT + 1.15, IZ + .1], xs, .04 * Math.sin(t * 5)); skG.set([GX, CT + 1.15, IZ + .1], P(9.0, 9.8, t), .9);
      const okS = popE(P(11.0, 11.9, t)); cS.set([SX, CT + 1.15 + .05 * Math.sin(t * 3 + 1), IZ + .1], okS * .6, .05 * Math.sin(t * 3 + 1)); skS.set([SX, CT + 1.15, IZ + .1], P(11.0, 11.9, t), .6);
      glS.position.set(SX, CT + .25, IZ); glS.material.opacity = .55 * sm(P(8.9, 11.3, t)); });
    avrami(Wd, t => ({ pos: [-3.7, 0, -1.75], facing: .85, gesture: t > 11.8 ? 'cheer' : (t > 1.2 && t < 2.6 ? 'point' : null), perform: t > 11.8 || (t > 1.2 && t < 2.6) ? 0 : .5, smile: .5 + .4 * sm(P(11, 12, t)), brow: t > 9 && t < 11 ? .3 : 0, look: .3 * Math.sin(t * .9) }));
    sruly(Wd, t => ({ pos: [-.75, 0, -1.75], facing: -.85, gesture: t > 11.8 ? 'thumb' : (t > 9 && t < 11 ? 'shrug' : null), perform: t > 11.8 || (t > 9 && t < 11) ? 0 : .45, smile: .5 + .4 * sm(P(11, 12, t)), look: -.3 * Math.sin(t * .8) }));
    Wd.center = [-2.1, BZ];
    Wd.cam = seq([0, cine([C(0, [-2.2, 1.0, -1.8], 3.6, 1.3, 18, 38), C(3.0, [-2.2, 1.0, -1.8], 3.2, 1.25, 8, 38)])],
      [3.0, cine([C(3.0, [-2.2, 1.0, -1.8], 3.0, 1.2, -14, 38), C(6.6, [-2.2, 1.0, -1.8], 3.0, 1.2, 6, 38)])],
      [6.6, cine([C(6.6, [-2.2, 1.0, -1.8], 3.6, 1.3, 12, 40), C(10.0, [-2.2, 1.0, -1.8], 3.8, 1.3, -8, 40)])],
      [10.0, cine([C(10.0, [-2.2, 1.05, -1.8], 3.9, 1.3, -10, 42), C(dur, [-2.2, 1.05, -1.8], 3.8, 1.35, 8, 40)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 74-88: wet wipes + scotch sponge float up from the sink; an "=" sign links a Yom Tov tag to a Shabbat tag
  function s6(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const SKX = -2.85; mkSink(Wd, SKX);
    const wp = mkWipes(Wd), sp = mkSponge(Wd);
    const tY = bb(Wd, .8, .34, drawYomTov, 512), tS = bb(Wd, .8, .34, drawShabbat, 512), eq = bb(Wd, .62, .62, drawEq, 256), sk = shock(Wd, 0xffd166), glE = glowAt(Wd.scene, 1.8, 0xfff0a0, 0);
    const spark = [], R = rng(61); for (let i = 0; i < 10; i++) { const s = glowSprite(.12, .12, 0); s.material.color.set(0xffe9a8); Wd.add(s); spark.push([s, R() * 6]); }
    const WX = -2.45, SX2 = -1.6, TYY = CT + 1.0, EX = -2.2;
    Wd.occ = [wp, sp, tY.g, tS.g, eq.g];
    Wd.on(t => { const uW = sm(P(.4, 2.2, t)), uS = sm(P(1.3, 3.1, t)), fl = (u, fx, ph) => u <= 0 ? [SKX, CT + .02, IZ] : arcPt([SKX, CT + .1, IZ + .02], [fx, CT + .45, IZ], u, .25);
      const pw = fl(uW, WX), ps = fl(uS, SX2);
      wp.visible = uW > 0; wp.scale.setScalar(1.3 * Math.max(.01, popE(P(.4, 1.1, t)))); wp.position.set(pw[0], pw[1] + (uW >= 1 ? .035 * Math.sin(t * 1.9) : 0), pw[2]); wp.rotation.set(.1 * Math.sin(t * 1.3), t * .55, .12 * Math.sin(t * 1.7));
      sp.visible = uS > 0; sp.scale.setScalar(1.3 * Math.max(.01, popE(P(1.3, 2.0, t)))); sp.position.set(ps[0], ps[1] + (uS >= 1 ? .035 * Math.sin(t * 1.7 + 1) : 0), ps[2]); sp.rotation.set(.1 * Math.sin(t * 1.2), -t * .5, .12 * Math.sin(t * 1.5));
      tY.set([-3.35, TYY + .04 * Math.sin(t * 1.8), IZ - .05], popE(P(3.4, 4.2, t)), .03 * Math.sin(t * 1.6)); tS.set([-1.05, TYY + .04 * Math.sin(t * 1.7 + 1), IZ - .05], popE(P(4.2, 5.0, t)), .03 * Math.sin(t * 1.5 + 1));
      const e = popE(P(5.2, 6.1, t)); eq.set([EX, TYY + .04 * Math.sin(t * 2), IZ - .05], e, .04 * Math.sin(t * 2.4)); sk.set([EX, TYY, IZ - .05], P(5.2, 6.1, t), 1.1); glE.position.set(EX, TYY, IZ - .2); glE.material.opacity = .5 * sm(P(5.2, 6.4, t));
      spark.forEach(([s, ph]) => { s.position.set(-2.2 + 1.6 * Math.sin(t * .55 + ph), CT + .3 + .6 * (.5 + .5 * Math.sin(t * .8 + ph * 2)), IZ + .2 * Math.sin(t + ph)); s.material.opacity = .5 * sm(P(1, 3, t)) * (.5 + .5 * Math.sin(t * 2.5 + ph) ** 2); }); });
    sruly(Wd, t => ({ pos: [-3.6, 0, -1.75], facing: .85, gesture: t > 7 ? 'thumb' : (t > 2 && t < 4 ? 'point' : null), perform: t > 7 || (t > 2 && t < 4) ? 0 : .5, smile: .4 + .4 * sm(P(6, 8, t)), look: .3 * Math.sin(t * .9) }));
    avrami(Wd, t => ({ pos: [-.85, 0, -1.75], facing: -.85, gesture: t > 7.5 ? 'cheer' : null, perform: t > 7.5 ? 0 : .5, smile: .4 + .4 * sm(P(6, 8, t)), look: -.3 * Math.sin(t * .8) }));
    Wd.center = [-2.2, BZ];
    Wd.cam = seq([0, cine([C(0, [-2.4, 1.0, -1.9], 4.2, 1.5, 18, 42), C(3.2, [-2.4, 1.0, -1.9], 3.6, 1.3, 8, 42)])],
      [3.2, cine([C(3.2, [-2.2, 1.1, -1.9], 3.7, 1.3, -16, 40), C(6.4, [-2.2, 1.1, -1.9], 3.9, 1.3, 6, 40)])],
      [6.4, cine([C(6.4, [-2.2, 1.1, -1.9], 3.9, 1.3, 12, 40), C(9.6, [-2.2, 1.1, -1.9], 3.9, 1.3, -12, 40)])],
      [9.6, cine([C(9.6, [-2.2, 1.1, -1.9], 4.0, 1.3, -12, 42), C(dur, [-2.2, 1.1, -1.9], 4.6, 1.5, 10, 42)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 88-100: recap on the festive table: glass + X, salad + fish + check, wipes/sponge + "="; the boys sit and smile
  function s7(dur) {
    const Wd = kW(); kitchenRoom(Wd, true);
    const RZ = -1.55, X1 = 1.95, X2 = 3.0, X3 = 4.0, MY = 1.95;
    const glass = mkGlass(Wd), bw = mkBowl(Wd), fish = mkFish(Wd), wp = mkWipes(Wd), sp = mkSponge(Wd);
    fillBowl(Wd, [0, 0, 0], [CUC, TOM], 0);
    const salad = fillBowl(Wd, [0, 0, 0], [CUC, TOM], 9), sg = new THREE.Group(); Wd.add(sg); salad.forEach(m => { Wd.scene.remove(m); sg.add(m); });
    const xM = mark3d(Wd, 'cross', 1.0), cM = mark3d(Wd, 'check', 1.0), eq = bb(Wd, .6, .6, drawEq, 256), tY = bb(Wd, .7, .3, drawYomTov, 384), tS = bb(Wd, .7, .3, drawShabbat, 384);
    const gl1 = glowAt(Wd.scene, 1.8, 0x9dffb0, 0), gl2 = glowAt(Wd.scene, 1.8, 0xfff0a0, 0);
    const sB = shock(Wd, 0xff5a5a), sC = shock(Wd, 0x6dff9a), sE = shock(Wd, 0xffd166);
    Wd.occ = [glass, bw, fish, wp, sp, xM.g, cM.g, eq.g, tY.g, tS.g];
    Wd.on(t => { const a1 = popE(P(.4, 1.2, t)), a2 = popE(P(2.0, 2.8, t)), a3 = popE(P(3.8, 4.6, t));
      glass.scale.setScalar(Math.max(.01, a1)); glass.position.set(X1, TT, RZ); glass.visible = a1 > .01;
      bw.scale.setScalar(Math.max(.01, a2)); bw.position.set(X2 - .05, TT, RZ + .12); bw.visible = a2 > .01; sg.position.copy(bw.position); sg.scale.copy(bw.scale);
      fish.scale.setScalar(Math.max(.01, a2) * .8); fish.position.set(X2 + .5, TT, RZ + .1); fish.visible = a2 > .01;
      wp.scale.setScalar(Math.max(.01, a3) * 1.2); wp.position.set(X3 - .25, TT + .01 + .02 * Math.sin(t * 1.8), RZ); wp.rotation.y = .5 * Math.sin(t * .8); wp.visible = a3 > .01;
      sp.scale.setScalar(Math.max(.01, a3) * 1.2); sp.position.set(X3 + .25, TT + .01 + .02 * Math.sin(t * 1.7 + 1), RZ); sp.rotation.y = -.5 * Math.sin(t * .8); sp.visible = a3 > .01;
      xM.set([X1, MY + .04 * Math.sin(t * 3), RZ], slamS(t, 1.4, .5), .04 * Math.sin(t * 4)); sB.set([X1, MY, RZ], P(1.4, 2.2, t), 1.0);
      cM.set([X2 - .15, MY + .15 + .04 * Math.sin(t * 3 + 1), RZ], popE(P(3.2, 4.0, t)) * .45, .05 * Math.sin(t * 3)); sC.set([X2, MY, RZ], P(3.2, 4.0, t), .6);
      gl1.position.set(X2, TT + .25, RZ); gl1.material.opacity = .5 * sm(P(3.2, 4.4, t));
      const e = popE(P(5.2, 6.0, t)); eq.set([X3, MY + .1 + .04 * Math.sin(t * 2.2), RZ], e * .8, .04 * Math.sin(t * 2.4)); sE.set([X3, MY, RZ], P(5.2, 6.0, t), .9);
      tY.set([X3 - .8, MY - .02 + .03 * Math.sin(t * 1.8), RZ], popE(P(5.6, 6.4, t)) * 1.0, 0); tS.set([X3 + .8, MY - .02 + .03 * Math.sin(t * 1.7 + 1), RZ], popE(P(5.8, 6.6, t)) * 1.0, 0);
      gl2.position.set(X3, TT + .25, RZ); gl2.material.opacity = .45 * sm(P(5.2, 6.4, t)); });
    avrami(Wd, t => ({ pos: [.95, 0, TZ], facing: .7, gesture: t > 7 ? 'cheer' : null, perform: t > 7 ? 0 : .5, smile: .6 + .4 * sm(P(5, 7, t)), talk: .3 * talkAmt(t, 5) * sm(P(7, 8, t)), look: .3 * Math.sin(t * .7) }));
    sruly(Wd, t => ({ pos: [5.05, 0, TZ], facing: -.7, gesture: t > 6.5 ? (Math.sin(t * .9) > .2 ? 'thumb' : 'cheer') : null, perform: t > 6.5 ? 0 : .5, smile: .6 + .4 * sm(P(5, 7, t)), talk: .3 * talkAmt(t, 3) * sm(P(7, 8, t)), look: -.3 * Math.sin(t * .8) }));
    Wd.center = [3.0, BZ];
    Wd.cam = seq([0, cine([C(0, [3.0, 1.1, -1.9], 4.6, 1.5, -14, 42), C(3.6, [3.0, 1.1, -1.9], 4.2, 1.4, 8, 41)])],
      [3.6, cine([C(3.6, [3.0, 1.1, -1.9], 4.1, 1.4, 14, 41), C(7.6, [3.0, 1.1, -1.9], 4.3, 1.4, -10, 41)])],
      [7.6, cine([C(7.6, [3.0, 1.15, -1.9], 4.4, 1.4, -12, 42), C(10.0, [3.0, 1.15, -1.9], 4.5, 1.5, 8, 42)])],
      [10.0, cine([C(10.0, [3.0, 1.15, -1.9], 4.6, 1.5, 8, 42), C(dur, [3.0, 1.2, -1.9], 5.0, 1.7, -10, 43)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the festive table with the glowing salad and fish, the two brothers smiling behind the card
  function answerBg(dur) {
    const Wd = kW(); kitchenRoom(Wd, true);
    const b = mkBowl(Wd); b.position.set(2.4, TT, TZ - .1); fillBowl(Wd, [2.4, TT, TZ - .1], [CUC, TOM], 12, 0); const fs = mkFish(Wd); fs.position.set(3.6, TT, TZ - .1); fs.scale.setScalar(.9);
    [2.4, 3.6].forEach(x => { const gl = glowAt(Wd.scene, 1.8, 0xffe08a, .4); gl.position.set(x, TT + .25, TZ); });
    sruly(Wd, t => ({ pos: [3.55, 0, -2.55], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }));
    avrami(Wd, t => ({ pos: [2.45, 0, -2.55], facing: 0, scale: DS, smile: 1, perform: .5, talk: .4 * talkAmt(t, 3) }));
    Wd.center = [3.0, -2.2]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
