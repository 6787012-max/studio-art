// shabbat-g46 story (28/11/2026) - feet on Thursday night, hands on Friday day: for nails they are not one day. Section C of storyboards_v28.md.
// Objects only: no people, no hands, no feet. Two labelled cushions stand for the feet (blue) and the hands (orange).
// Copied from shabbat-g43 (clipper with a face, wall calendar, tags, check/cross, camera helpers) and adapted.
// Calendar order is right-to-left: Thursday on the RIGHT, Friday on the LEFT, the night strip in the middle.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, crane, lowHero, insert, handheld, punch, pushIn, face, talkAmt,
          mark3d, shock, popE, ease, prog, lerp, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const cl01 = x => Math.min(1, Math.max(0, x));
  const TOPY = .8, NUM = .38, SC = 1.35, LIFT = .14;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], red: ['#ffe6e6', '#8a1010', '#e04040'],
               night: ['#14233f', '#ffffff', '#3a5fa0'] };
  const CLX = -.1, CLZ = .35;                   // clipper home on the table
  const LEGX = -1.4, HANDX = 1.2, CUSZ = .35;   // the two cushions at home: feet (blue) and hands (orange)
  const BY = 1.8, BZ = -1.76;                  // calendar: centre height and depth on the back wall
  const DAY = { thu: 1.0, fri: -1.0, night: 0 }; // local x of the pages; Thursday on the right
  const PY = .1, UZ = -.9;                      // page centre height; z of the table spot under the pages
  const CLKX = 2.2, CLKZ = -.3;                 // wall clock with a face, on the table at the right
  const CANX = -2.4, CANZ = -.2;                // two Shabbat candles at the far left
  const SEED_CLIP = 71, SEED_CAL = 62, SEED_CLK = 83, SEED_LEG = 81, SEED_HAND = 82;
  const WHITE = new THREE.Color(0xfffdf6), GREEN = new THREE.Color(0x7fd97a);
  const col = (m, a, b, u) => m.material.color.copy(a).lerp(b, cl01(u));
  const K0 = (x, z) => [x, TOPY, z];           // a spot on the table top
  const C0 = (x, z) => [x, TOPY + LIFT, z];    // a spot on top of a cushion
  const HOME = [CLX, TOPY, CLZ];
  const LEG0 = [LEGX, TOPY, CUSZ], HAND0 = [HANDX, TOPY, CUSZ];
  const arc3 = (a, b, u, lift) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + lift * Math.sin(PI * u), lerp(a[2], b[2], u)];
  // keys = [[time, [x, y, z]], ...]: between two different points the object hops along an arc, otherwise it stays put
  function pathAt(t, keys) {
    if (t <= keys[0][0]) return keys[0][1].slice();
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, a] = keys[i], [t1, b] = keys[i + 1];
      if (t < t1) { const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); return arc3(a, b, sm(P(t0, t1, t)), d > .2 ? .8 : 0); }
    }
    return keys[keys.length - 1][1].slice();
  }

  // ---------------------------------------------------------------- world: night, warm wooden wall, table with white cloth
  const kW = () => mkWorld({ skyTop: 0x1b2a55, skyBottom: 0x3a4f85, fogColor: 0x25345f, fogNear: 26, fogFar: 100, hemi: 1.0, sun: .7, sunPos: [-9, 22, 12], shadowExt: 10 });
  function sceneSet(Wd) {
    Wd.add(box(12, 5, .3, 0x7a4f32, { pos: [0, 2.5, -2.0] }));                       // warm wooden back wall
    Wd.add(box(12, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                    // floor (top at 0)
    Wd.add(box(6.4, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));                // white Shabbat tablecloth
    Wd.add(box(6.4, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));            // cloth drape
    for (const x of [-3.0, 3.0]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
  }

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g43)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const INK = '#1f2a44';
  const drawTag = (text, st) => (c, W, H) => {
    c.fillStyle = st[0]; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = st[2]; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = st[1]; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const drawPlain = (text) => (c, W, H) => {             // dark text on the paper, no border
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .9, maxLines: 1, max: H * .66, min: H * .18, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = INK; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const drawNight = (text) => (c, W, H) => {             // white text on the dark night strip, two lines allowed
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W * .86, maxLines: 2, max: H * .14, min: H * .06, lh: 1.15 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = '#ffffff';
    const n = f.lines.length;
    f.lines.forEach((ln, i) => c.fillText(ln, W / 2, H * .5 + (i - (n - 1) / 2) * f.size * 1.25));
  };
  const tag = (Wd, text, style, w) => bb(Wd, w, .5, drawTag(text, ST[style]), w > 1.6 ? 900 : 520);

  // ---------------------------------------------------------------- the wall calendar: a board with a face, a blue header with a sun (right) and a moon (left),
  // two big pages (Thursday on the right, Friday on the left) and a dark night strip between them
  function mkCal(Wd, bx, seed) {
    const g = new THREE.Group(); g.position.set(bx, BY, BZ); Wd.add(g);
    const wp = (lx, ly, lz) => [bx + lx, BY + ly, BZ + (lz || 0)];
    g.add(box(3.2, 2.4, .08, 0xf1e7cf));                          // the board (local y -1.2..1.2)
    const hd = new THREE.Group(); hd.position.set(0, 1.0, .08); g.add(hd);
    hd.add(box(3.2, .36, .06, 0x2f6ad0));
    const hl = texPlane(2.2, .3, drawTag('ערב שבת', ST.blue), { cw: 512 }); hl.position.z = .04; hd.add(hl);
    const pages = {};
    const pg = (key, lx, text) => { const p = new THREE.Group(); p.position.set(lx, PY, .06); g.add(p);
      const b = box(.9, 1.0, .04, 0xfffdf6); p.add(b);
      const lab = texPlane(.84, .6, drawPlain(text), { cw: 512 }); lab.position.z = .025; p.add(lab);
      pages[key] = { p, box: b }; };
    pg('thu', DAY.thu, 'חמישי');
    pg('fri', DAY.fri, 'שישי');
    const night = box(.8, 1.0, .05, 0x14233f, { pos: [DAY.night, PY, .05] }); g.add(night);
    const nl = texPlane(.76, .9, drawNight('ליל שישי'), { cw: 512 }); nl.position.set(DAY.night, PY, .09); g.add(nl);
    const sun = ball(.12, 0xffc23a, { ink: false }); sun.position.set(...wp(1.4, 1.0, .16)); Wd.add(sun);
    const moon = ball(.11, 0xf5f0d0, { ink: false }); moon.position.set(...wp(-1.4, 1.0, .16)); moon.scale.setScalar(.001); Wd.add(moon);
    const fc = face(Wd, { w: .42, parent: g, pos: [0, -.8, .1], seed });
    return { g, wp, pages, night, sun, moon, fc };
  }

  // ---------------------------------------------------------------- heroes (origin = table top; face on the +z side)
  // silver nail clipper standing on the table: a body, a fixed top and a movable jaw that clicks
  function mkClipper(Wd, x, z, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(SC * .9);
    const S = 0xc8ced6;
    g.add(box(.36, .62, .12, S, { pos: [0, .36, 0] }));                       // silver body
    g.add(box(.3, .08, .14, 0x6a6e78, { pos: [0, .7, 0] }));                   // fixed top
    const jaw = new THREE.Group(); jaw.position.set(-.15, .72, 0); g.add(jaw); // hinge at the left end
    jaw.add(box(.3, .05, .15, 0xdfe6ee, { pos: [.15, .02, 0] }));             // movable jaw
    g.add(box(.12, .06, .08, 0x3a3a44, { pos: [.12, .8, 0] }));               // lever
    const f = face(Wd, { w: .26, parent: g, pos: [0, .36, .1], seed });
    return { g, f, setClick(c) { jaw.rotation.z = -.55 * cl01(c); } };
  }
  // a cushion with a label: a flat soft block on the table; the label floats above it
  function mkCushion(Wd, p, text, style, hex) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(p[0], p[1], p[2]);
    g.add(box(.72, LIFT, .5, hex, { pos: [0, LIFT / 2, 0] }));
    const lab = tag(Wd, text, style, .9);
    lab.set([p[0], p[1] + .75, p[2]], NUM, 0);                  // the label shows from the start, also for a cushion that never moves
    return { g, set(q) { g.position.set(q[0], q[1], q[2]); lab.set([q[0], q[1] + .75, q[2]], NUM, 0); } };
  }
  // a wall clock standing on the table, with a face and a hand that turns
  function mkClock(Wd, x, z, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    const disc = cyl(.2, .2, .04, 0xfff8e8, { pos: [0, .3, 0] }); disc.rotation.x = PI / 2; g.add(disc);
    const rim = cyl(.22, .22, .02, 0x7a4f32, { pos: [0, .3, -.01] }); rim.rotation.x = PI / 2; g.add(rim);
    const hand = new THREE.Group(); hand.position.set(0, .3, .13); g.add(hand);
    hand.add(box(.03, .16, .02, 0x1f2a44, { pos: [0, .08, 0] }));
    const f = face(Wd, { w: .24, parent: g, pos: [0, .3, .09], seed });
    return { g, hand, f };
  }
  // two Shabbat candles in silver holders, unlit by default: the flames pop when they glow
  function mkCandles(Wd) {
    const flames = [];
    for (const dx of [0, .32]) {
      const x = CANX + dx;
      Wd.add(cyl(.05, .05, .42, 0xfff8e8, { pos: [x, TOPY + .21, CANZ] }));
      const fl = ball(.07, 0xffa030, { ink: false }); fl.position.set(x, TOPY + .5, CANZ); fl.scale.setScalar(.001); Wd.add(fl);
      flames.push(fl);
    }
    return flames;
  }

  // standard four-shot camera: wide -> medium on the action -> insert on the object that carries the halacha -> low hero
  // Z = pull-back factor: every distance is multiplied, so tags and panels stay inside the frame
  const Z = 1.35;
  const std = (n, c) => cuts([
    [3.5, HH(truck([c.wide[0], c.wide[1], -1.0], { dur: 3.5, dist0: (c.wd || 6.4) * Z, dist1: ((c.wd || 6.4) - .2) * Z, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4 * Z, dist1: 3.0 * Z, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6 * Z, dist1: 2.5 * Z, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4 * Z, dist1: 3.6 * Z, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the clipper's face, pull out; the clipper clicks; the Thursday page turns; "?" above
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    mkCushion(Wd, LEG0, 'רגליים', 'blue', 0x2f6ad0);
    mkCushion(Wd, HAND0, 'ידיים', 'orange', 0xe07a20);
    const clk = mkClock(Wd, CLKX, CLKZ, SEED_CLK);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      cl.g.position.set(CLX, TOPY, CLZ);
      cl.setClick(Math.max(0, Math.sin(t * 6)));
      cl.f.set(t, { talk: t > 2 ? .35 * talkAmt(t, SEED_CLIP) : 0, smile: .2, look: [.3, 0] });
      cal.pages.thu.p.scale.x = Math.max(.02, Math.abs(Math.cos(PI * P(4, 5.6, t))));   // the Thursday page turns over
      cal.sun.scale.setScalar(1); cal.moon.scale.setScalar(.001);
      cal.fc.set(t, { talk: 0, smile: .3, look: [.6, 0] });
      clk.hand.rotation.z = -t * 2; clk.f.set(t, { talk: 0, smile: .3, look: [-.5, 0] });
      qT.set([CLX, 2.1, CLZ], popE(P(1.4, 2.2, t)) * NUM, .05 * Math.sin(t * 4));
    });
    Wd.center = [0, 0]; Wd.occ = [qT.g]; Wd.qPos = [CLX, 0]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([CLX, 1.24, CLZ], { dur: 3.6, dist0: .6, dist1: 2.0, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([CLX + .2, 1.1, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.3, 0], { dur: 6.0, dist0: 3.2, dist1: 4.6, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (neutral): both cushions slide under the one Friday page; the clipper hops from feet to hands there and hesitates; tag "לא ביום אחד"
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const leg = mkCushion(Wd, LEG0, 'רגליים', 'blue', 0x2f6ad0);
    const hand = mkCushion(Wd, HAND0, 'ידיים', 'orange', 0xe07a20);
    const tN = tag(Wd, 'לא ביום אחד', 'orange', 2.6);
    const legK = [[0, LEG0], [2.0, LEG0], [4.0, K0(-1.0, -.55)], [dur, K0(-1.0, -.55)]];
    const handK = [[0, HAND0], [2.0, HAND0], [4.0, K0(-1.0, -1.15)], [dur, K0(-1.0, -1.15)]];
    const clK = [[0, HOME], [4.6, C0(-1.0, -.55)], [6.4, C0(-1.0, -1.15)], [dur, C0(-1.0, -1.15)]];
    Wd.on(t => {
      const p = pathAt(t, clK); cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(t > 6.6 ? .3 * Math.max(0, Math.sin(t * 3)) : 0);   // hesitates on the hands cushion
      leg.set(pathAt(t, legK)); hand.set(pathAt(t, handK));
      cl.f.set(t, { talk: t > 3 ? .4 * talkAmt(t, SEED_CLIP) : 0, smile: -.1, look: [-.4, 0] });
      cal.sun.scale.setScalar(1); cal.moon.scale.setScalar(.001);
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .2, look: [.5, 0] });
      tN.set([0, 2.2, -.5], popE(P(10.0, 11.0, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    Wd.cam = std(4, { wide: [0, 1.7, 0], wd: 2.6, med: [-.5, 1.5, -.4], pm: 6.0, ins: [-1.0, 1.2, -.7], pi: 9.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (good): the feet cushion slides under the Thursday page (right) and the hands cushion under the Friday page (left); the clipper visits each; green check; tag "רגליים בחמישי"
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const leg = mkCushion(Wd, LEG0, 'רגליים', 'blue', 0x2f6ad0);
    const hand = mkCushion(Wd, HAND0, 'ידיים', 'orange', 0xe07a20);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const tN = tag(Wd, 'רגליים בחמישי', 'green', 2.8);
    const checkAt = cal.wp(DAY.thu + .3, .7, .2);
    const legK = [[0, LEG0], [1.0, LEG0], [3.2, K0(DAY.thu, UZ)], [dur, K0(DAY.thu, UZ)]];
    const handK = [[0, HAND0], [1.0, HAND0], [3.2, K0(DAY.fri, UZ)], [dur, K0(DAY.fri, UZ)]];
    const clK = [[0, HOME], [3.6, HOME], [5.4, C0(DAY.thu, UZ)], [7.2, C0(DAY.thu, UZ)], [9.0, C0(DAY.fri, UZ)], [dur, C0(DAY.fri, UZ)]];
    Wd.on(t => {
      const p = pathAt(t, clK); cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick((t > 5.4 && t < 7.2) || t > 9.0 ? Math.max(0, Math.sin(t * 9)) : 0);
      leg.set(pathAt(t, legK)); hand.set(pathAt(t, handK));
      cal.sun.scale.setScalar(1); cal.moon.scale.setScalar(.001);
      chk.set(checkAt, popE(P(9.4, 10.2, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(checkAt, P(9.4, 10.4, t), 1.0);
      cl.f.set(t, { talk: t > 5 ? .4 * talkAmt(t, SEED_CLIP) : 0, smile: .3 + .6 * sm(P(9.4, 10.2, t)), look: [.4, 0] });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .3 + .6 * sm(P(9.4, 10.2, t)), look: [.5, 0] });
      tN.set([0, 2.2, -.5], popE(P(3.8, 4.6, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, chk.g];
    Wd.cam = std(8, { wide: [0, 1.7, 0], wd: 2.6, med: [.2, 1.6, -.6], pm: 5.4, ins: [DAY.thu, 1.2, -.9], pi: 9.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (neutral): the sun sets and the moon rises; the clock turns to evening; the feet cushion moves onto the night strip; the clipper rides it and looks up with a "?"; tag "ליל שישי"
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const leg = mkCushion(Wd, K0(DAY.thu, UZ), 'רגליים', 'blue', 0x2f6ad0);
    mkCushion(Wd, K0(DAY.fri, UZ), 'ידיים', 'orange', 0xe07a20);
    const clk = mkClock(Wd, CLKX, CLKZ, SEED_CLK);
    const q = tag(Wd, '?', 'grey', .8);
    const tN = tag(Wd, 'ליל שישי', 'night', 2.4);
    const legK = [[0, K0(DAY.thu, UZ)], [1.0, K0(DAY.thu, UZ)], [3.6, K0(DAY.night, UZ)], [dur, K0(DAY.night, UZ)]];
    const clK = [[0, C0(DAY.thu, UZ)], [1.0, C0(DAY.thu, UZ)], [3.6, C0(DAY.night, UZ)], [dur, C0(DAY.night, UZ)]];
    Wd.on(t => {
      const p = pathAt(t, clK); cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(0);
      const lp = pathAt(t, legK); leg.set(lp);
      cal.sun.scale.setScalar(Math.max(.001, 1 - sm(P(1.0, 3.0, t))));
      cal.moon.scale.setScalar(Math.max(.001, sm(P(2.0, 4.0, t))));
      clk.hand.rotation.z = -t * 1.2;
      cl.f.set(t, { talk: .3 * talkAmt(t, SEED_CLIP), smile: .2, look: [.5, 1.0] });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .3, look: [.4, 0] });
      q.set([p[0] + .3, 1.85, p[2]], popE(P(4.0, 4.8, t)) * NUM, 0);
      tN.set([0, 2.2, -.5], popE(P(5.6, 6.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, q.g];
    Wd.cam = std(12, { wide: [0, 1.5, 0], wd: 2.6, med: [-.2, 1.7, -.5], pm: 6.0, ins: [0, 1.0, -.9], pi: 8.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-72 (bad, 16 s): the dotted bracket joins the night strip and the Friday page into one box; the clock worries; orange pulse; tag "הלילה שייך ליום?"
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, 0, 0, SEED_CLIP);
    mkCushion(Wd, C0(0, UZ), 'רגליים', 'blue', 0x2f6ad0);
    mkCushion(Wd, K0(DAY.fri, UZ), 'ידיים', 'orange', 0xe07a20);
    const clk = mkClock(Wd, CLKX, CLKZ, SEED_CLK);
    const sk = shock(Wd, 0xe07a20);
    const tN = tag(Wd, 'הלילה שייך ליום?', 'orange', 2.8);
    // the dotted bracket above the pages: dots that turn into one solid bar
    const bar = box(1.9, .05, .05, 0xe07a20, { pos: [-.5, BY + .72, BZ + .16] }); Wd.add(bar); bar.scale.x = .001;
    const dots = [];
    for (let i = 0; i < 10; i++) { const d = ball(.035, 0x8a3a00, { ink: false }); d.position.set(-1.45 + i * .21, BY + .72, BZ + .16); Wd.add(d); dots.push(d); }
    const clK = [[0, C0(0, UZ)], [dur, C0(0, UZ)]];
    Wd.on(t => {
      const p = pathAt(t, clK); cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(0);
      const j = sm(P(4.5, 5.6, t));
      dots.forEach((d, i) => { d.position.y = BY + .72 + .05 * Math.sin(t * 5 + i) * (1 - j); d.scale.setScalar(Math.max(.001, 1 - j)); });
      bar.scale.x = Math.max(.001, j);
      clk.hand.rotation.z = Math.sin(t * 9) * .4; clk.f.set(t, { talk: .2 * talkAmt(t, SEED_CLK), smile: -.5, look: [-.3, 0] });
      cl.f.set(t, { talk: .3 * talkAmt(t, SEED_CLIP), smile: -.3, look: [-.4, 1.0] });
      cal.sun.scale.setScalar(.001); cal.moon.scale.setScalar(1);
      sk.set([-.5, BY + .72, BZ + .2], P(5.5, 6.5, t), 1.0);
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: -.3, look: [.4, 0] });
      tN.set([0, 2.2, -.5], popE(P(6.8, 7.6, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    const C4 = [-.4, 1.8, -1.6];                                                 // pulled back and higher: the header stays below the top 15% of the frame
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.7, -1.0], { dur: 3.5, dist0: 3.6, dist1: 3.4, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 16)],
      [4.0, HH(punch(pushIn(C4, { dur: 4.0, dist0: 4.9, dist1: 4.6, h0: .5, h1: .5, a0: 8, a1: -6, fov0: 40, fov1: 40 }), [6.6]), 17)],
      [3.5, HH(punch(insert([-.5, 2.1, -1.6],{ dur: 3.5, dist0: 4.2, dist1: 3.9, h0: .3, h1: .3, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [5.8]), 18)],
      [5.0, HH(pullOut([0, 1.9, -1.6],{ dur: 5.0, dist0: 5.0, dist1: 4.8, h0: .5, h1: .6, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 19)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 72-86 (good): the bracket snaps and falls away, the two segments stay separate; the sign "לגבי ציפורניים" glows; green check; tag "לא אומרים"
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, 0, 0, SEED_CLIP);
    mkCushion(Wd, C0(0, UZ), 'רגליים', 'blue', 0x2f6ad0);
    mkCushion(Wd, K0(DAY.fri, UZ), 'ידיים', 'orange', 0xe07a20);
    const bar = box(1.9, .05, .05, 0xe07a20, { pos: [-.5, BY + .72, BZ + .16] }); Wd.add(bar);
    const sk = shock(Wd, 0xe07a20), chk = mark3d(Wd, 'check', .6), skG = shock(Wd, 0x6dff9a);
    const sign = tag(Wd, 'לגבי ציפורניים', 'blue', 1.5);
    const tN = tag(Wd, 'לא אומרים', 'green', 1.5);
    const checkAt = cal.wp(0, .9, .2);
    Wd.on(t => {
      cl.g.position.set(...C0(0, UZ));                              // the clipper stays on the feet cushion
      cl.setClick(0);
      const fall = sm(P(1.0, 2.8, t));
      bar.position.set(-.5, BY + .72 - 2.4 * fall, BZ + .16); bar.rotation.z = .9 * fall;
      sk.set([-.5, BY + .72, BZ + .2], P(.9, 1.7, t), 1.0);
      cl.f.set(t, { talk: .3 * talkAmt(t, SEED_CLIP), smile: .6, look: [.2, 0] });
      cal.sun.scale.setScalar(.001); cal.moon.scale.setScalar(1);
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .5, look: [.4, 0] });
      sign.set([-.95, 2.2, -.5], popE(P(3.6, 4.4, t)) * NUM, 0);
      tN.set([.95, 2.2, -.5], popE(P(6.0, 6.8, t)) * NUM, 0);
      chk.set(checkAt, popE(P(8.0, 8.8, t)) * .6, .04 * Math.sin(t * 3));
      skG.set(checkAt, P(8.0, 9.0, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [sign.g, tN.g, chk.g];
    Wd.cam = std(16, { wide: [0, 1.5, 0], wd: 2.6, med: [.1, 1.7, -.6], pm: 4.4, ins: [0, 1.9, -1.6], pi: 8.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (good): the sun rises over the calendar; the feet cushion stays on the night strip; the clipper hops by day to the hands cushion on the Friday page; the candles glow; green check; tag "אינו נחשב יום אחד"
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, 0, 0, SEED_CLIP);
    mkCushion(Wd, C0(0, UZ), 'רגליים', 'blue', 0x2f6ad0);
    mkCushion(Wd, K0(DAY.fri, UZ), 'ידיים', 'orange', 0xe07a20);
    const flames = mkCandles(Wd);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const tN = tag(Wd, 'אינו נחשב יום אחד', 'green', 3.2);
    const checkAt = cal.wp(0, .9, .2);
    const clK = [[0, C0(0, UZ)], [3.0, C0(0, UZ)], [5.6, C0(DAY.fri, UZ)], [dur, C0(DAY.fri, UZ)]];
    Wd.on(t => {
      const p = pathAt(t, clK); cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick((t < 2.5) || t > 6.4 ? Math.max(0, Math.sin(t * 8)) * .6 : 0);
      cal.sun.scale.setScalar(Math.max(.001, sm(P(.5, 4.0, t))));
      cal.moon.scale.setScalar(Math.max(.001, 1 - sm(P(.5, 3.5, t))));
      flames.forEach((f, i) => f.scale.setScalar(Math.max(.001, popE(P(2.0 + .2 * i, 3.0 + .2 * i, t)))));
      chk.set(checkAt, popE(P(8.2, 9.0, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(checkAt, P(8.2, 9.2, t), 1.0);
      cl.f.set(t, { talk: .4 * talkAmt(t, SEED_CLIP), smile: .6 + .4 * sm(P(8.2, 9.0, t)), look: [-.4, 0] });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .6, look: [-.4, 0] });
      tN.set([0, 2.2, -.5], popE(P(9.0, 9.8, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, chk.g];
    Wd.cam = std(14, { wide: [0, 1.5, 0], wd: 2.6, med: [-.3, 1.7, -.6], pm: 8.2, ins: [0, 1.9, -1.6], pi: 8.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the calendar with the sun on the right and the moon on the left; the feet cushion on the night strip and the hands cushion on the Friday page; the clipper smiles between them; the candles at the back; slow crane; no red cross
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    mkCandles(Wd);
    mkCushion(Wd, C0(0, UZ), 'רגליים', 'blue', 0x2f6ad0);
    mkCushion(Wd, K0(DAY.fri, UZ), 'ידיים', 'orange', 0xe07a20);
    const cl = mkClipper(Wd, -.5, UZ, SEED_CLIP);
    Wd.on(t => {
      cl.g.position.set(-.5, TOPY, UZ);
      cl.setClick(Math.max(0, Math.sin(t * 3)) * .5);
      cl.f.set(t, { talk: .3 * talkAmt(t, SEED_CLIP), smile: 1, look: [-.5, 0] });
      cal.sun.scale.setScalar(1); cal.moon.scale.setScalar(1);
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .7, look: [-.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.6, -1.0], { dur: 20, dist0: 5.2, dist1: 4.8, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
