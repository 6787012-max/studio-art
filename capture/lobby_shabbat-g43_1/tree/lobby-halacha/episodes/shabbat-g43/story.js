// shabbat-g43 story (25/11/2026) - cutting nails on Wednesday is permitted until sunset; not Thursday (they begin to grow on Shabbat). Section C of storyboards_v25.md.
// Objects only, no people. Copied from shabbat-g41 (wall calendar with a face, table, camera helpers) and rebuilt: the hero is a silver NAIL CLIPPER with a face.
// Calendar order is right-to-left: the earlier day is on the RIGHT (Wed, Thu, Fri, Shabbat).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, crane, lowHero, insert, handheld, punch, pushIn, face, talkAmt,
          mark3d, shock, popE, ease, prog, lerp, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const cl01 = x => Math.min(1, Math.max(0, x));
  const TOPY = .8, NUM = .38, SC = 1.35;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], red: ['#ffe6e6', '#8a1010', '#e04040'], night: ['#14233f', '#ffffff', '#3a5fa0'] };
  const CLX = -.6, CLZ = .2;                    // the nail clipper standing on the table
  const BY = 2.2, BZ = -1.76;                   // calendar: centre height and depth on the back wall
  const DAY = { wed: 1.05, thu: .35, fri: -.35, sat: -1.05 };   // local x of the day pages (earlier day on the right)
  const PY = .2;                                // day page centre height (local)
  const METX = -1.7, METZ = .4;                 // growth meter standing on the table
  const CLKX = 2.3, CLKZ = .2;                  // clock on the table
  const SEED_CLIP = 71, SEED_CAL = 62, SEED_CAL2 = 63;
  const WHITE = new THREE.Color(0xfffdf6), GREEN = new THREE.Color(0x7fd97a), GREY = new THREE.Color(0xa6a6a6);
  const col = (m, a, b, u) => m.material.color.copy(a).lerp(b, cl01(u));
  const win = (t, a, b) => sm(P(a, a + .3, t)) * (1 - sm(P(b, b + .3, t)));          // 0 -> 1 -> 0 window in time
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
    Wd.add(box(12, 5, .3, 0x7a4f32, { pos: [0, 2.5, -2.0] }));                       // warm wooden back wall (front face at z -1.85)
    Wd.add(box(12, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                    // floor (top at 0)
    Wd.add(box(6.4, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));                // white Shabbat tablecloth
    Wd.add(box(6.4, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));            // cloth drape
    for (const x of [-3.0, 3.0]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
  }

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g41)
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
  const drawCrescent = (c, W, H) => { c.fillStyle = '#fffdf6'; c.beginPath(); c.arc(W / 2, H / 2, H * .44, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(W * .66, H * .42, H * .38, 0, Math.PI * 2); c.fill(); c.globalCompositeOperation = 'source-over'; };
  const drawPlain = (text) => (c, W, H) => {             // dark text on the paper, no border
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .9, maxLines: 1, max: H * .66, min: H * .18, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = INK; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const tag = (Wd, text, style, w) => bb(Wd, w, .5, drawTag(text, ST[style]), w > 1.6 ? 900 : 520);

  // ---------------------------------------------------------------- the wall calendar: a board with a face, a blue header, four day pages (Wed, Thu, Fri, Shabbat in gold), a horizon line, a night strip and a growth arrow
  // bx = its centre x
  function mkCal(Wd, bx, seed, dy) {
    const yc = BY + (dy || 0);
    const g = new THREE.Group(); g.position.set(bx, yc, BZ); Wd.add(g);
    const wp = (lx, ly, lz) => [bx + lx, yc + ly, BZ + (lz || 0)];
    const hov = (lx, ly) => [bx + lx, yc + ly - 1.0, -1.2];     // base of a hero standing in front of a page (just under it)
    g.add(box(3.2, 2.4, .08, 0xf1e7cf));                          // the board (local y -1.2..1.2)
    const hd = new THREE.Group(); hd.position.set(0, 1.0, .08); g.add(hd);
    hd.add(box(3.2, .36, .06, 0x2f6ad0));
    const hl = texPlane(3.0, .3, drawTag('ערב שבת', ST.blue), { cw: 512 }); hl.position.z = .04; hd.add(hl);
    g.add(box(2.9, .03, .04, 0x14408f, { pos: [0, .5, .05] }));  // horizon line
    const pages = {};
    const pg = (key, lx, text, fill) => { const p = new THREE.Group(); p.position.set(lx, PY, .06); g.add(p);
      const b = box(.6, .5, .04, fill || 0xfffdf6); p.add(b);
      const lab = texPlane(.54, .35, drawPlain(text), { cw: 512 }); lab.position.z = .025; p.add(lab);
      pages[key] = { p, box: b }; };
    pg('wed', DAY.wed, 'רביעי');
    pg('thu', DAY.thu, 'חמישי');
    pg('fri', DAY.fri, 'שישי');
    pg('sat', DAY.sat, 'שבת', 0xf0c04a);                          // Shabbat page: gold, clean
    const night = texPlane(.6, .5, drawTag('ליל שבת', ST.night), { cw: 512 }); night.position.set(DAY.sat, PY, .12); night.scale.setScalar(.001); g.add(night);
    const ar = new THREE.Group(); ar.position.set(DAY.sat + .2, PY + .3, .12); g.add(ar);     // growth arrow, pops up from the Shabbat page
    ar.add(box(.06, .22, .04, 0x3f9a4a, { pos: [0, -.08, 0] })); ar.add(cyl(.005, .1, .1, 0x3f9a4a, { pos: [0, .12, 0] })); ar.scale.setScalar(.001);
    const fc = face(Wd, { w: .42, parent: g, pos: [-1.35, -.7, .1], seed });
    return { g, wp, hov, pages, night, ar, fc };
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
  // growth meter: a tall bar, a green fill that rises from the base, and a sprout arrow on top
  function mkMeter(Wd, x, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    g.add(box(.26, 1.0, .1, 0xdfe8d8, { pos: [0, .5, 0] }));
    const fill = new THREE.Group(); fill.position.set(0, .03, .06); g.add(fill);
    fill.add(box(.18, .92, .04, 0x3f9a4a, { pos: [0, .46, 0] })); fill.scale.y = .001;
    const arrow = new THREE.Group(); arrow.position.set(0, 1.12, .1); g.add(arrow);
    arrow.add(box(.08, .2, .05, 0x3f9a4a, { pos: [0, -.08, 0] })); arrow.add(cyl(.005, .12, .1, 0x3f9a4a, { pos: [0, .12, 0] })); arrow.scale.setScalar(.001);
    return { g, fill, arrow };
  }
  // a small clock standing on the table with a fast second hand (time passes)
  function mkClock(Wd, x, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    const disc = cyl(.2, .2, .04, 0xfff8e8, { pos: [0, .3, 0] }); disc.rotation.x = PI / 2; g.add(disc);
    const rim = cyl(.22, .22, .02, 0x7a4f32, { pos: [0, .3, -.01] }); rim.rotation.x = PI / 2; g.add(rim);
    const hand = new THREE.Group(); hand.position.set(0, .3, .045); g.add(hand);
    hand.add(box(.03, .16, .02, 0x1f2a44, { pos: [0, .08, 0] }));
    hand.add(box(.02, .12, .02, 0xc4161c, { pos: [.04, .04, 0] }));
    return { g, hand };
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

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the clipper's face, pull out; the clipper clicks; a day page turns; "?" above
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL, -.45);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      cl.g.position.set(CLX, TOPY, CLZ);
      cl.setClick(Math.max(0, Math.sin(t * 6)));
      cl.f.set(t, { talk: t > 2 ? .35 * talkAmt(t, SEED_CLIP) : 0, smile: .2, look: [.3, 0] });
      cal.pages.wed.p.scale.x = Math.max(.02, Math.abs(Math.cos(PI * P(4, 5.6, t))));   // the Wednesday page turns over
      cal.fc.set(t, { talk: 0, smile: .3, look: [.6, 0] });
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

  // ---------------------------------------------------------------- 1. BEAT 14-28 (neutral): the clipper goes to the Wednesday page and clicks; the day counter goes "יום 1", "יום 2", "יום 3"; on day 3 the growth meter starts to rise; tag "ביום השלישי"
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const mt = mkMeter(Wd, METX, METZ);
    const dayT = [tag(Wd, 'יום 1', 'grey', 1.0), tag(Wd, 'יום 2', 'grey', 1.0), tag(Wd, 'יום 3', 'green', 1.0)];
    const tN = tag(Wd, 'ביום השלישי', 'green', 2.2);
    const cres = bb(Wd, .4, .4, drawCrescent, 256);
    const T = [CLX, TOPY, CLZ], W = cal.hov(DAY.wed, PY);
    const keys = [[0, T], [2.4, T], [3.6, W], [dur, W]];
    const dayWin = [[3.8, 5.8], [5.8, 7.8], [7.8, 99]];
    Wd.on(t => {
      const p = pathAt(t, keys);
      cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(t > 3.6 ? Math.max(0, Math.sin(t * 8)) : 0);
      cl.f.set(t, { talk: t > 3 ? .4 * talkAmt(t, SEED_CLIP) : 0, smile: .5, look: [-.4, 0] });
      dayT.forEach((d, i) => d.set([METX, 2.1, METZ], NUM * win(t, dayWin[i][0], dayWin[i][1]), 0));
      mt.fill.scale.y = Math.max(.001, sm(P(9.6, 12.4, t)));
      mt.arrow.scale.setScalar(Math.max(.001, popE(P(10.2, 11.0, t))));
      cres.set([METX + .32, TOPY + .6, METZ + .2], popE(P(.4, 1.2, t)) * .9, 0);
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .3, look: [.6, 0] });
      tN.set([0, 2.2, -.5], popE(P(11.4, 12.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, dayT[0].g, dayT[1].g, dayT[2].g];
    Wd.cam = std(4, { wide: [0, 1.5, 0], wd: 2.6, med: [-.9, 1.7, -.4], pm: 3.6, ins: [METX, 1.6, METZ], pi: 3.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (bad): the clipper hops Wed -> Thu -> Fri -> Shabbat; at the gold Shabbat page the growth arrow pops; red cross + shock; tag "צומח בשבת"
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const cr = mark3d(Wd, 'cross', .6), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'צומח בשבת', 'red', 2.4);
    const W = cal.hov(DAY.wed, PY), TH = cal.hov(DAY.thu, PY), FR = cal.hov(DAY.fri, PY), SA = cal.hov(DAY.sat, PY);
    const keys = [[0, W], [.8, W], [1.8, TH], [2.5, TH], [3.4, FR], [3.9, FR], [4.6, SA], [dur, SA]];
    const crossAt = cal.wp(DAY.sat - .22, PY + .27, .2);
    Wd.on(t => {
      const p = pathAt(t, keys);
      cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(0);
      cal.ar.scale.setScalar(Math.max(.001, popE(P(4.8, 5.4, t))));
      cr.set(crossAt, popE(P(4.6, 5.2, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(crossAt, P(4.6, 5.0, t), 1.0);
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: -.6, look: [-.4, 0], surprise: sm(P(4.6, 5.2, t)) });
      cl.f.set(t, { talk: .35 * talkAmt(t, SEED_CLIP), smile: -.4, look: [.4, 0], surprise: sm(P(4.6, 5.2, t)) });
      tN.set([0, 2.2, -.5], popE(P(5.6, 6.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g];
    Wd.cam = std(8, { wide: [0, 1.5, 0], wd: 2.6, med: [0, 2.0, -1.6], pm: 4.4, ins: [DAY.sat, 2.2, -1.6], pi: 5.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (bad): the clipper hops from Shabbat to the Thursday page; the Thursday page turns grey; the clipper bounces back; red cross; tag "לא ביום חמישי"
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const cr = mark3d(Wd, 'cross', .6), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'לא ביום חמישי', 'red', 2.6);
    const SA = cal.hov(DAY.sat, PY), TH = cal.hov(DAY.thu, PY);
    const keys = [[0, SA], [1.4, SA], [2.8, TH], [3.8, TH], [5.4, SA], [dur, SA]];
    const crossAt = cal.wp(DAY.thu + .22, PY + .27, .2);
    Wd.on(t => {
      const p = pathAt(t, keys);
      cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(0);
      cal.ar.scale.setScalar(1);
      col(cal.pages.thu.box, WHITE, GREY, P(2.6, 3.4, t));
      cr.set(crossAt, popE(P(3.6, 4.2, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(crossAt, P(3.6, 4.4, t), 1.0);
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: -.6, look: [.2, 0], surprise: sm(P(3.6, 4.2, t)) });
      cl.f.set(t, { talk: .4 * talkAmt(t, SEED_CLIP), smile: -.5, look: [.5, 0], surprise: sm(P(3.6, 4.2, t)) });
      tN.set([0, 2.2, -.5], popE(P(5.0, 5.8, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g];
    Wd.cam = std(12, { wide: [0, 1.5, 0], wd: 2.6, med: [-.4, 2.0, -1.5], pm: 4.2, ins: [DAY.thu, 2.2, -1.6], pi: 4.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-72 (good, 16 s): the Wednesday page glows green; the clipper clicks happily on it; it hops Wed -> Thu -> Fri; the Friday page turns green, Shabbat stays gold; green check; tag "מותר ביום רביעי"
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const tN = tag(Wd, 'מותר ביום רביעי', 'green', 3.0);
    const SA = cal.hov(DAY.sat, PY), W = cal.hov(DAY.wed, PY), TH = cal.hov(DAY.thu, PY), FR = cal.hov(DAY.fri, PY);
    const keys = [[0, SA], [1.4, SA], [2.8, W], [4.6, W], [6.2, TH], [7.6, TH], [9.2, FR], [dur, FR]];
    const checkAt = cal.wp(DAY.fri + .22, PY + .27, .2);
    Wd.on(t => {
      const p = pathAt(t, keys);
      cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(t > 3.4 && t < 5.0 ? Math.max(0, Math.sin(t * 9)) : 0);
      cl.f.set(t, { talk: t > 3 ? .4 * talkAmt(t, SEED_CLIP) : 0, smile: .4 + .6 * sm(P(3.0, 4.0, t)), look: [.4, 0] });
      cal.ar.scale.setScalar(Math.max(.001, 1 - sm(P(0, .6, t))));
      col(cal.pages.wed.box, WHITE, GREEN, P(.8, 1.6, t));
      col(cal.pages.fri.box, WHITE, GREEN, P(8.8, 9.6, t));
      chk.set(checkAt, popE(P(9.6, 10.4, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(checkAt, P(9.6, 10.6, t), 1.0);
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .3 + .6 * sm(P(9.6, 10.4, t)), look: [.5, 0] });
      tN.set([0, 2.2, -.5], popE(P(3.6, 4.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, chk.g];
    const C4 = [-.4, 2.3, -1.6];                                                   // pulled back and higher: the header stays below the top 15% of the frame
    Wd.cam = cuts([
      [3.5, HH(truck([0, 2.2, -1.0], { dur: 3.5, dist0: 3.6, dist1: 3.4, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 16)],
      [4.0, HH(punch(pushIn(C4, { dur: 4.0, dist0: 4.9, dist1: 4.6, h0: .5, h1: .5, a0: 8, a1: -6, fov0: 40, fov1: 40 }), [3.0]), 17)],
      [3.5, HH(punch(insert([DAY.fri, 2.3, -1.6], { dur: 3.5, dist0: 4.2, dist1: 3.9, h0: .3, h1: .3, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [9.6]), 18)],
      [5.0, HH(pullOut([0, 2.3, -1.6], { dur: 5.0, dist0: 5.0, dist1: 4.8, h0: .5, h1: .6, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 19)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 72-86 (neutral): the sun travels over the Wednesday page and sets behind the horizon line; the clock ticks beside the clipper; the green page stays green until the sun touches the horizon; tag "עד השקיעה"
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    cal.pages.wed.box.material.color.copy(GREEN);
    const W = cal.hov(DAY.wed, PY);
    cl.g.position.set(W[0], W[1], W[2]);
    const sun = ball(.13, 0xffc23a, { ink: false }); Wd.add(sun);
    const sunAt = u => cal.wp(lerp(.2, DAY.wed, u), .8 - .3 * u, .14);
    const clk = mkClock(Wd, CLKX, CLKZ);
    const tN = tag(Wd, 'עד השקיעה', 'green', 2.2);
    Wd.on(t => {
      const u = sm(P(.6, 10.6, t));
      const s = sunAt(u); sun.position.set(s[0], s[1], s[2]);
      sun.scale.setScalar(Math.max(.001, 1 - sm(P(10.6, 11.4, t))));
      clk.hand.rotation.z = -t * 5;
      cl.setClick(Math.max(0, Math.sin(t * 2.5)) * .4);
      cl.f.set(t, { talk: .3 * talkAmt(t, SEED_CLIP), smile: .6, look: [.2, 0] });
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .3, look: [.6, 0] });
      tN.set([0, 2.8, -.5], popE(P(3.0, 3.8, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    Wd.cam = std(16, { wide: [0, 1.5, 0], wd: 2.6, med: [.6, 2.3, -1.6], pm: 3.6, ins: [DAY.wed, 2.4, -1.6], pi: 3.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (bad): after sunset a moon rises and the night strip covers the Shabbat page; the clipper tries again and hops Wed -> Shabbat; the growth arrow pops on the night page; red cross + shock; tag "בליל שבת"
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const cr = mark3d(Wd, 'cross', .6), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'בליל שבת', 'red', 2.4);
    const moon = ball(.11, 0xf5f0d0, { ink: false }); Wd.add(moon);
    const W = cal.hov(DAY.wed, PY), SA = cal.hov(DAY.sat, PY);
    const SIDEL = [DAY.sat - .95, BY + PY - 1.0, -1.2];                             // the clipper moves aside, left of the board, so the night strip reads
    const keys = [[0, W], [1.0, W], [3.0, SIDEL], [dur, SIDEL]];
    const crossAt = cal.wp(DAY.sat - .22, PY + .27, .2);
    const moonAt = cal.wp(DAY.wed, .8, .14);
    Wd.on(t => {
      const p = pathAt(t, keys);
      cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(0);
      moon.position.set(moonAt[0], moonAt[1], moonAt[2]); moon.scale.setScalar(Math.max(.001, popE(P(.4, 1.4, t))));
      cal.night.scale.setScalar(Math.max(.001, popE(P(2.4, 3.2, t))));
      cal.ar.scale.setScalar(Math.max(.001, popE(P(4.4, 5.2, t))));
      cr.set(crossAt, popE(P(5.0, 5.6, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(crossAt, P(5.0, 5.8, t), 1.0);
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: -.6, look: [-.4, 0], surprise: sm(P(5.0, 5.6, t)) });
      cl.f.set(t, { talk: .4 * talkAmt(t, SEED_CLIP), smile: -.5, look: [.4, 0], surprise: sm(P(5.0, 5.6, t)) });
      tN.set([-.7, 2.2, -.5], popE(P(6.2, 7.0, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g];
    Wd.cam = std(32, { wide: [0, 1.5, 0], wd: 2.6, med: [-.4, 2.0, -1.6], pm: 5.0, ins: [DAY.sat, 2.2, -1.6], pi: 5.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the calendar on the right; the clipper happy on the green Wednesday page; the sun still up above it; the Shabbat page gold and clean; slow crane; no red cross
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 1.9, SEED_CAL);
    cal.pages.wed.box.material.color.copy(GREEN);
    const sun = ball(.13, 0xffc23a, { ink: false }); const sunP = cal.wp(DAY.wed, .8, .14); sun.position.set(sunP[0], sunP[1], sunP[2]); Wd.add(sun);
    const cl = mkClipper(Wd, 0, 0, SEED_CLIP); cl.g.scale.setScalar(SC * 1.0);
    Wd.on(t => {
      const p = cal.hov(DAY.wed, PY);
      cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(Math.max(0, Math.sin(t * 3)) * .5);
      cl.f.set(t, { talk: .3 * talkAmt(t, SEED_CLIP), smile: 1, look: [-.5, 0] });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .7, look: [-.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([1.6, 1.6, -1.0], { dur: 20, dist0: 5.0, dist1: 4.6, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
