// shabbat-g41 story (23/11/2026) - havdala after motzei Yom Tov: the whole first day may be used, not three days like Shabbat. Section C of storyboards_v23.md.
// Objects only, no people. Copied from shabbat-g40 (night table, cup with a face, tags, camera helpers) and rebuilt for the calendar storyline.
// Heroes: a silver havdala wine cup with a face, and a wall calendar with a face (day pages, a big page, a bar, a padlock).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, crane, lowHero, insert, handheld, punch, pushIn, face, talkAmt,
          mark3d, shock, popE, ease, prog, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const cl01 = x => Math.min(1, Math.max(0, x));
  const TOPY = .8, NUM = .6, SC = 1.35;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], red: ['#ffe6e6', '#8a1010', '#e04040'] };
  const CUPX = -.6, CUPZ = .2;                  // the havdala cup on the table
  const BY = 2.2, BZ = -1.76;                   // calendar: centre height and depth on the back wall
  const SEED_CUP = 61, SEED_CAL = 62, SEED_CAL2 = 63;
  const WHITE = new THREE.Color(0xfffdf6), GREEN = new THREE.Color(0x7fd97a), GREY = new THREE.Color(0xa6a6a6), RED = new THREE.Color(0xe04040);
  const col = (m, a, b, u) => m.material.color.copy(a).lerp(b, cl01(u));
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

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g40)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, st) => (c, W, H) => {
    c.fillStyle = st[0]; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = st[2]; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = st[1]; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const drawPlain = (text) => (c, W, H) => {             // dark text on the paper, no border
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .9, maxLines: 1, max: H * .66, min: H * .18, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = INK; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const INK = '#1f2a44';
  const tag = (Wd, text, style, w) => bb(Wd, w, .5, drawTag(text, ST[style]), w > 1.6 ? 900 : 520);
  const tagS = (Wd, text, style, w) => bb(Wd, w, .26, drawTag(text, ST[style]), 520);
  const mkDots = (Wd, n, col, r) => { const ds = []; for (let i = 0; i < n; i++) { const d = ball(r, col, { ink: false }); Wd.add(d); ds.push(d); } return ds; };

  // ---------------------------------------------------------------- the wall calendar: a board with a face, a blue and a gold header, three small day pages, a spare page, a big page and a bar
  // bx = its centre x; texts = { b: blue header text, g: gold header text }
  function mkCal(Wd, bx, seed, texts) {
    const g = new THREE.Group(); g.position.set(bx, BY, BZ); Wd.add(g);
    const wp = (lx, ly, lz) => [bx + lx, BY + ly, BZ + (lz || 0)];
    const hov = (lx, ly) => [bx + lx, BY + ly - .75, -1.2];     // where the cup stands in front of a page (its base)
    g.add(box(2.8, 2.0, .08, 0xf1e7cf));                                                   // the board
    const hdr = (fill, style, text) => { const hg = new THREE.Group(); hg.position.set(0, .8, .08); g.add(hg);
      hg.add(box(2.8, .36, .06, fill)); const lab = texPlane(2.5, .3, drawTag(text, ST[style]), { cw: 512 }); lab.position.z = .04; hg.add(lab); return hg; };
    const hdrB = hdr(0x2f6ad0, 'blue', texts.b), hdrG = hdr(0xd9a63a, 'gold', texts.g);
    const pg = (lx, ly, w, h, text) => { const p = new THREE.Group(); p.position.set(lx, ly, .06); g.add(p);
      const b = box(w, h, .04, 0xfffdf6); p.add(b);
      const lab = texPlane(w * .9, h * .7, drawPlain(text), { cw: 512 }); lab.position.z = .025; p.add(lab);
      return { p, box: b }; };
    const pA = pg(-.2, .2, .55, .5, 'א׳'), pB = pg(.4, .2, .55, .5, 'ב׳'), pC = pg(1.0, .2, .55, .5, 'ג׳');
    const pD = pg(1.0, .2, .55, .5, 'היום הראשון');                                            // a small green copy of the first day (beat 5 only)
    pD.p.visible = false;
    const big2 = pg(.3, -.5, 1.9, .9, 'היום השני'); big2.p.visible = false;                  // the next day, big and grey (beat 5 only)
    const big = pg(.3, -.5, 1.9, .9, 'היום הראשון');
    big.p.visible = false;                                                                   // the big page comes in beats 3-5 and in the answer
    const fc = face(Wd, { w: .45, parent: g, pos: [-1.0, -.25, .1], seed });
    const barA = new THREE.Group(); barA.position.set(-.2, -.12, .08); g.add(barA); barA.add(box(.6, .07, .05, 0x3f9a4a));
    const barB = new THREE.Group(); barB.position.set(.4, -.12, .08); g.add(barB);            // pivot at its left end
    const barBbox = box(.9, .07, .05, 0x3f9a4a, { pos: [.45, 0, 0] }); barB.add(barBbox);
    return { g, wp, hov, fc, hdrB, hdrG, pA, pB, pC, pD, big, big2, barA, barB, barBbox };
  }

  // ---------------------------------------------------------------- the heroes (origin = table top; face on the +z side)
  // havdala wine cup: silver, wine level set by setLevel
  function mkGoblet(Wd, x, z, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(SC * 1.4);
    const S = 0xc8ced6;
    g.add(cyl(.11, .11, .02, S, { pos: [0, .01, 0] }));
    g.add(cyl(.025, .025, .2, S, { pos: [0, .12, 0] }));
    g.add(cyl(.12, .085, .2, S, { pos: [0, .33, 0] }));
    const wine = cyl(.112, .09, .18, 0x6a0a1e, { pos: [0, .34, 0] }); g.add(wine);
    const glint = ball(.022, 0xffffff, { ink: false }); g.add(glint);
    const f = face(Wd, { w: .2, parent: g, pos: [0, .33, .1], seed });
    return { g, f, glint, setLevel(L) { const l = Math.max(.02, L); wine.scale.y = l; wine.position.y = .25 + .09 * l; } };
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
    [3.5, HH(truck(c.wide, { dur: 3.5, dist0: (c.wd || 6.4) * Z, dist1: ((c.wd || 6.4) - .2) * Z, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4 * Z, dist1: 3.0 * Z, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6 * Z, dist1: 2.5 * Z, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4 * Z, dist1: 3.6 * Z, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the cup's face, pull out; the cup stands alone, its wine untouched; a clock spins beside it; a day page flips; "?" above
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL, { b: 'אחרי שבת', g: 'יום טוב' }); cal.hdrG.scale.setScalar(.001);
    const cup = mkGoblet(Wd, CUPX, CUPZ, SEED_CUP); cup.setLevel(1);
    const clk = mkClock(Wd, .45, .2);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      cup.g.position.set(CUPX, TOPY, CUPZ);
      cup.f.set(t, { talk: t > 2 ? .35 * talkAmt(t, SEED_CUP) : 0, smile: .2, look: [.3, 0] });
      clk.hand.rotation.z = -t * 5;
      cal.pA.p.scale.x = Math.max(.02, Math.abs(Math.cos(PI * P(4, 5.6, t))));   // a day page turns over
      cal.fc.set(t, { talk: 0, smile: .3, look: [.6, 0] });
      qT.set([CUPX, 2.1, CUPZ], popE(P(1.4, 2.2, t)) * NUM, .05 * Math.sin(t * 4));
    });
    Wd.center = [0, 0]; Wd.occ = [qT.g]; Wd.qPos = [CUPX, 0]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([CUPX, 1.42, CUPZ], { dur: 3.6, dist0: .6, dist1: 2.0, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([CUPX + .2, 1.1, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.3, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (neutral): the cup hops from page to page of the calendar "אחרי שבת"; each day page turns green; tag "שלושה ימים"
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL, { b: 'אחרי שבת', g: 'יום טוב' }); cal.hdrG.visible = false;
    const cup = mkGoblet(Wd, CUPX, CUPZ, SEED_CUP); cup.setLevel(1);
    const tN = tag(Wd, 'שלושה ימים', 'green', 2.2);
    const T = [CUPX, TOPY, CUPZ];
    const keys = [[0, T], [2.4, T], [3.6, cal.hov(-.2, .2)], [6.6, cal.hov(-.2, .2)], [7.8, cal.hov(.4, .2)], [9.4, cal.hov(.4, .2)], [10.6, cal.hov(1.0, .2)], [dur, cal.hov(1.0, .2)]];
    Wd.on(t => {
      const p = pathAt(t, keys);
      cup.g.position.set(p[0], p[1], p[2]);
      cup.f.set(t, { talk: t > 3 ? .4 * talkAmt(t, SEED_CUP) : 0, smile: .5, look: [-.4, 0] });
      col(cal.pA.box, WHITE, GREEN, P(3.6, 4.2, t));
      col(cal.pB.box, WHITE, GREEN, P(7.8, 8.4, t));
      col(cal.pC.box, WHITE, GREEN, P(10.6, 11.2, t));
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .3, look: [.6, 0] });
      tN.set([0, 0.95, 0.9], popE(P(11.4, 12.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    Wd.cam = std(4, { wide: [0, 1.5, 0], wd: 6.6, med: [0, 2.3, -1.6], pm: 3.6, ins: [-.2, 2.4, -1.6], pi: 3.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (bad): the calendar switches to a gold "יום טוב" header; the three-day green bar tries to stretch across but cracks after the first page; red cross; tag "לא ביום טוב"
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL, { b: 'אחרי שבת', g: 'יום טוב' });
    const cup = mkGoblet(Wd, CUPX, CUPZ, SEED_CUP); cup.setLevel(1);
    const cr = mark3d(Wd, 'cross', .6), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'לא ביום טוב', 'red', 2.4);
    const crossAt = cal.wp(.85, -.12, .3);
    Wd.on(t => {
      cal.hdrB.scale.y = Math.max(.001, 1 - sm(P(.4, 1.2, t)));
      cal.hdrG.scale.setScalar(Math.max(.001, popE(P(1.2, 2.0, t))));
      cal.barA.scale.x = Math.max(.001, sm(P(1.6, 2.6, t)));
      cal.barB.scale.x = Math.max(.001, sm(P(3.0, 4.0, t)));
      const fall = sm(P(4.6, 5.8, t));
      cal.barB.rotation.z = -1.1 * fall;
      col(cal.barBbox, GREEN, RED, P(4.4, 4.8, t));
      cr.set(crossAt, popE(P(4.8, 5.4, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(crossAt, P(4.8, 5.6, t), 1.0);
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: -.6, look: [.6, 0], surprise: sm(P(4.6, 5.2, t)) });
      cup.f.set(t, { talk: .3 * talkAmt(t, SEED_CUP), smile: -.4, look: [.8, 0], surprise: sm(P(4.6, 5.2, t)) });
      tN.set([0, 0.95, 0.9], popE(P(6.0, 6.8, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g];
    Wd.cam = std(8, { wide: [0, 1.5, 0], wd: 6.6, med: [0, 2.0, -1.6], pm: 4.4, ins: [.3, 2.0, -1.6], pi: 5.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (good): one big page "היום הראשון" pops up and glows green; the cup hops onto it, its wine shines; green check; tag "כל היום הראשון"
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL, { b: 'אחרי שבת', g: 'יום טוב' }); cal.hdrB.visible = false;
    [cal.pA, cal.pB, cal.pC, cal.pD].forEach(p => { p.p.visible = false; });
    cal.barA.visible = false; cal.barB.visible = false;
    const cup = mkGoblet(Wd, CUPX, CUPZ, SEED_CUP); cup.setLevel(1);
    cal.big.p.visible = true;
    const gl = glowAt(Wd.scene, 1.1, 0xffe9a0, 0);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const tN = tag(Wd, 'כל היום הראשון', 'green', 2.6);
    const T = [CUPX, TOPY, CUPZ], SIDE = [-1.9, TOPY, 0];                       // the cup stands beside the calendar, not in front of the text
    const keys = [[0, T], [1.6, T], [2.8, SIDE], [dur, SIDE]];
    Wd.on(t => {
      cal.big.p.scale.setScalar(Math.max(.001, popE(P(.4, 1.4, t))));
      col(cal.big.box, WHITE, GREEN, P(2.0, 2.8, t));
      const p = pathAt(t, keys);
      cup.g.position.set(p[0], p[1], p[2]);
      const sh = sm(P(3.4, 4.2, t));
      gl.position.set(p[0], p[1] + .6, p[2] + .1); gl.material.opacity = .45 * sh * (.7 + .3 * Math.sin(t * 5));
      cup.f.set(t, { talk: t > 3.6 ? .4 * talkAmt(t, SEED_CUP) : 0, smile: .2 + .8 * sh, look: [.4, 0] });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .3 + .6 * sh, look: [.5, 0] });
      chk.set(cal.wp(1.2, -.05, .3), popE(P(3.4, 4.0, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(cal.wp(1.2, -.05, .3), P(3.4, 4.2, t), 1.0);
      tN.set([0, 0.95, 0.9], popE(P(4.4, 5.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, chk.g];
    Wd.cam = std(12, { wide: [0, 1.5, 0], wd: 6.6, med: [.3, 1.25, -1.3], pm: 4.4, ins: [.3, 1.3, -1.2], pi: 4.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (neutral): the sun travels over the big green page from morning to evening, dotted arc; the whole day is open; tag "כל היום"
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL, { b: 'אחרי שבת', g: 'יום טוב' }); cal.hdrB.visible = false;
    [cal.pA, cal.pB, cal.pC, cal.pD].forEach(p => { p.p.visible = false; });
    cal.barA.visible = false; cal.barB.visible = false;
    cal.big.p.visible = true; cal.big.box.material.color.copy(GREEN);
    const cup = mkGoblet(Wd, CUPX, CUPZ, SEED_CUP); cup.setLevel(1);
    cup.g.visible = false;                                                                   // the cup leaves the frame: the sun is the action here
    const sun = ball(.16, 0xffc23a, { ink: false }); Wd.add(sun);
    const sunAt = u => cal.wp(lerp(-.6, 1.2, u), .05 + .5 * Math.sin(PI * u), .14);   // the arc spans the page width
    const dots = mkDots(Wd, 9, 0xffd07a, .022);
    const tN = tag(Wd, 'כל היום', 'green', 2.0);
    Wd.on(t => {
      const u = sm(P(.6, 14.5, t));
      const s = sunAt(u); sun.position.set(s[0], s[1], s[2]);
      dots.forEach((d, i) => { const q = sunAt(i / 8); d.position.set(q[0], q[1], q[2]); d.scale.setScalar(Math.max(.001, popE(P(.2 + .08 * i, 1.0 + .08 * i, t)) * .9)); });
      cup.f.set(t, { talk: t > 2 ? .4 * talkAmt(t, SEED_CUP) : 0, smile: .6, look: [.4, 0] });
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .5, look: [.5, 0] });
      tN.set([0, 0.95, 0.9], popE(P(1.8, 2.6, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    const C4 = [.3, 2.3, -1.6];                                                   // pulled back and higher: the header stays below the top 15% of the frame
    Wd.cam = cuts([
      [3.5, HH(truck([0, 2.2, 0], { dur: 3.5, dist0: 8.6, dist1: 8.4, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 16)],
      [4.0, HH(punch(pushIn(C4, { dur: 4.0, dist0: 6.2, dist1: 5.8, h0: .5, h1: .5, a0: 8, a1: -6, fov0: 40, fov1: 40 }), [3.0]), 17)],
      [3.5, HH(punch(insert(C4, { dur: 3.5, dist0: 5.2, dist1: 4.8, h0: .3, h1: .3, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [3.6]), 18)],
      [5.0, HH(pullOut([0, 2.3, -1.6], { dur: 5.0, dist0: 6.0, dist1: 7.6, h0: .5, h1: .6, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 19)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-86 (bad): the next day page "היום השני" turns grey; the cup tries to hop onto it and bounces back; a padlock closes on the page; red cross + shock; tag "אין תשלומין"
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL, { b: 'אחרי שבת', g: 'יום טוב' }); cal.hdrB.visible = false;
    [cal.pA, cal.pB, cal.pC].forEach(p => { p.p.visible = false; });
    cal.barA.visible = false; cal.barB.visible = false;
    cal.big2.p.visible = true;                                                    // the big page now reads "היום השני" (grey)
    const cup = mkGoblet(Wd, CUPX, CUPZ, SEED_CUP); cup.setLevel(1);
    const SIDE = [-1.9, TOPY, 0], hB = [-1.3, 1.5, -1.0];                          // the cup stays beside the calendar, never in front of the text
    const keys = [[0, [CUPX, TOPY, CUPZ]], [1.2, SIDE], [2.2, SIDE], [2.8, hB], [3.4, SIDE], [dur, SIDE]];
    const lock = new THREE.Group(); Wd.add(lock);
    lock.add(box(.2, .16, .06, 0x6a5a2a)); lock.add(box(.12, .1, .04, 0x8a7a3a, { pos: [0, .12, 0] }));
    const cr = mark3d(Wd, 'cross', .6), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'אין תשלומין', 'red', 2.4);
    const lockAt = cal.wp(-.55, -.78, .22), crossAt = cal.wp(1.02, -.8, .3);      // cross and lock sit in the page corners, not on the text
    Wd.on(t => {
      cal.big2.p.scale.setScalar(Math.max(.001, popE(P(0, .8, t))));
      col(cal.big2.box, WHITE, GREY, P(.4, 1.2, t));
      cal.pD.p.visible = true;
      cal.pD.p.scale.setScalar(Math.max(.001, popE(P(.4, 1.2, t))));
      col(cal.pD.box, WHITE, GREEN, P(.4, 1.2, t));
      const p = pathAt(t, keys);
      cup.g.position.set(p[0], p[1], p[2]);
      const closing = sm(P(3.0, 3.8, t));
      lock.position.set(lockAt[0], lockAt[1] + .5 * (1 - closing), lockAt[2]);
      cr.set(crossAt, popE(P(3.2, 3.8, t)) * .45, .04 * Math.sin(t * 3));
      sk.set(crossAt, P(3.2, 3.9, t), 1.0);
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: -.6, look: [.4, 0], surprise: sm(P(3.2, 3.8, t)) });
      cup.f.set(t, { talk: .4 * talkAmt(t, SEED_CUP), smile: -.5, look: [.5, 0], surprise: sm(P(2.8, 3.2, t)) });
      tN.set([0, 0.95, 0.9], popE(P(4.8, 5.6, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g];
    Wd.cam = std(20, { wide: [0, 1.5, 0], wd: 6.6, med: [.8, 1.5, -1.5], pm: 3.4, ins: [1.0, 2.1, -1.6], pi: 3.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (split frame): left board "שבת" with three green pages; right board "יום טוב" with one green page; counters "3" and "1" pop; tag "3 מול 1"
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const L = mkCal(Wd, -2.0, SEED_CAL, { b: 'שבת', g: 'יום טוב' }); L.hdrG.visible = false; L.big.p.visible = false; L.pD.p.visible = false;
    L.barA.visible = false; L.barB.visible = false;
    const R = mkCal(Wd, 2.0, SEED_CAL2, { b: 'שבת', g: 'יום טוב' }); R.hdrB.visible = false;
    [R.pA, R.pB, R.pC, R.pD].forEach(p => { p.p.visible = false; });
    R.barA.visible = false; R.barB.visible = false; R.big.p.visible = true;
    const cup = mkGoblet(Wd, 0, CUPZ, SEED_CUP); cup.setLevel(1);
    const tL = tag(Wd, '3', 'green', 1.0), tR = tag(Wd, '1', 'green', 1.0), tS = tag(Wd, '3 מול 1', 'green', 2.2);
    Wd.on(t => {
      L.g.scale.setScalar(Math.max(.001, popE(P(0, 1, t))));
      R.g.scale.setScalar(Math.max(.001, popE(P(0, 1, t))));
      col(L.pA.box, WHITE, GREEN, P(1.6, 2.2, t));
      col(L.pB.box, WHITE, GREEN, P(2.4, 3.0, t));
      col(L.pC.box, WHITE, GREEN, P(3.2, 3.8, t));
      col(R.big.box, WHITE, GREEN, P(4.0, 4.6, t));
      L.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .4 + .4 * sm(P(3.8, 4.4, t)), look: [.5, 0] });
      R.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL2), smile: .8 * sm(P(4.0, 4.8, t)), look: [-.5, 0] });
      cup.f.set(t, { talk: .4 * talkAmt(t, SEED_CUP), smile: .2 + .6 * sm(P(5, 6, t)), look: [0, 0] });
      tL.set([-2.0, 1.0, -1.2], popE(P(4.6, 5.2, t)) * NUM, 0);
      tR.set([2.0, 1.0, -1.2], popE(P(4.8, 5.4, t)) * NUM, 0);
      tS.set([0, 2.2, 0.4], popE(P(5.6, 6.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tS.g];
    const S6 = [0, 2.1, -1.5];                                                    // split centre: both boards in every shot, dist 6-7
    Wd.cam = cuts([
      [3.5, HH(truck(S6, { dur: 3.5, dist0: 6.9, dist1: 6.5, h0: .4, h1: .4, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 24)],
      [3.5, HH(punch(pushIn(S6, { dur: 3.5, dist0: 6.6, dist1: 6.1, h0: .4, h1: .4, a0: 3, a1: -3, fov0: 42, fov1: 40 }), [.3]), 25)],
      [3.5, HH(truck(S6, { dur: 3.5, dist0: 6.4, dist1: 6.9, h0: .4, h1: .4, a0: 4, a1: -4, fov0: 40, fov1: 42, shift: [.6, 0, 0] }), 26)],
      [3.5, HH(punch(pullOut(S6, { dur: 3.5, dist0: 6.2, dist1: 6.8, h0: .4, h1: .5, a0: -3, a1: 3, fov0: 40, fov1: 42 }), [2.8]), 27)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the calendar at the back with the green page "היום הראשון"; the cup at the side, smiling; slow crane; no red cross
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 1.9, SEED_CAL, { b: 'אחרי שבת', g: 'יום טוב' }); cal.hdrB.visible = false;   // calendar moved to the right side
    [cal.pA, cal.pB, cal.pC, cal.pD].forEach(p => { p.p.visible = false; });
    cal.barA.visible = false; cal.barB.visible = false;
    cal.big.p.visible = true; cal.big.box.material.color.copy(GREEN);
    const cup = mkGoblet(Wd, -1.1, .9, SEED_CUP); cup.setLevel(1); cup.g.scale.setScalar(SC * 1.4 * 1.6);   // cup bigger and closer, left side
    Wd.on(t => {
      cup.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      cup.f.set(t, { talk: .3 * talkAmt(t, SEED_CUP), smile: 1, look: [.5, 0] });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .7, look: [-.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([.6, 1.6, .2], { dur: 20, dist0: 7.6, dist1: 6.8, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
