// shabbat-g34 story (13/11/2026) - forgot "zecher liytziat mitzrayim" in kiddush. Storyboard: storyboards_v16.md section C.
// Objects only, no people: kiddush cup A (silver, dark-red wine, worried face), kiddush card (highlight bar, gold line),
// cup B (gold, arrives later), a pyramid (mitzrayim), challot under a cover and two candlesticks in the far background.
// Built from shabbat-g33 (camera, face, tag helpers, Shabbat table set kept; the five foods removed).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, lowHero, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TOPY = .8, NUM = .6, TAG_Y = 1.65;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], pink: ['#ffe0ec', '#8a1a4a', '#e0508a'],
               purple: ['#f1e6ff', '#4a1a7a', '#8a4ad0'], brown: ['#f3e6d6', '#5a3418', '#a06a3a'], slate: ['#dfe7f2', '#1e2f4a', '#4a6a9a'] };
  const CARD = { w: 1.1, h: 1.5, x: .45, z: -.35 };
  const LF = [.30, .42, .54, .66, .80];                      // card lines (fraction from the top); LF[4] = the gold line
  const cardY = f => TOPY + CARD.h * (1 - f);
  const A_POS = [-.9, .15], B_HOME = [1.5, .15], B_OUT = [3.2, .15], PYR = [-1.85, -.2], SC = 1.35;   // SC = heroes scale (bigger in frame)
  const SEED_A = 21, SEED_B = 22;

  // ---------------------------------------------------------------- world: morning daylight, white Shabbat table, window on the back wall
  const kW = () => mkWorld({ skyTop: 0x9fd6f2, skyBottom: 0xfff1d8, fogColor: 0xf5ebd8, fogNear: 24, fogFar: 98, hemi: 1.1, sun: 1.0, sunPos: [-9, 22, 12], shadowExt: 10 });
  function sceneSet(Wd) {
    Wd.add(box(12, 5, .3, 0xfbeed8, { pos: [0, 2.5, -2.0] }));                        // warm back wall
    Wd.add(box(2.7, 1.9, .08, 0x6b4a2e, { pos: [-3.4, 2.4, -1.78] }));                // window frame (left)
    Wd.add(box(2.3, 1.5, .04, 0xbfe9ff, { pos: [-3.4, 2.4, -1.72], ink: false }));    // daylight pane
    Wd.add(box(.05, 1.5, .05, 0x6b4a2e, { pos: [-3.4, 2.4, -1.68] }));                 // mullion
    const sun = glowAt(Wd.scene, 2.4, 0xfff0b0, .3); sun.position.set(-2.9, 2.2, -1.5);
    Wd.add(box(12, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                     // floor (top at 0)
    Wd.add(box(6.4, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));                // white Shabbat tablecloth
    Wd.add(box(6.4, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));            // cloth drape
    for (const x of [-3.0, 3.0]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
    for (const x of [-2.75, 2.75]) {                                                  // two candlesticks, far background
      Wd.add(cyl(.09, .09, .03, 0xd9b26a, { pos: [x, TOPY + .015, -1.0] }));
      Wd.add(cyl(.03, .03, .32, 0xf4f0e0, { pos: [x, TOPY + .19, -1.0] }));
      Wd.add(ball(.045, 0xffb347, { pos: [x, TOPY + .39, -1.0], ink: false }));
    }
    const cover = ball(.3, 0xf6f1e4, { pos: [2.0, TOPY, -.45], ink: false }); cover.scale.set(1, .55, 1); Wd.add(cover);   // challot under a cover
  }

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g33)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, st) => (c, W, H) => {
    c.fillStyle = st[0]; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = st[2]; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = st[1]; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const tag = (Wd, text, style, w) => bb(Wd, w || 1.3, .5, drawTag(text, ST[style]), (w || 1.3) > 1.6 ? 900 : 520);
  const mkDots = (Wd, n, col, r) => { const ds = []; for (let i = 0; i < n; i++) { const d = ball(r, col, { ink: false }); Wd.add(d); ds.push(d); } return ds; };
  const plane = (Wd, w, h, draw, cw, pos, ro) => { const m = texPlane(w, h, draw, { cw: cw || 512, ro: ro || 9 }); m.position.set(pos[0], pos[1], pos[2]); Wd.add(m); return m; };

  // ---------------------------------------------------------------- the kiddush card: cream card, four grey bars, one real gold line; a highlight bar and a gold overlay are drawn on top
  const cardDraw = (c, W, H) => {
    c.fillStyle = '#fffdf6'; c.fillRect(0, 0, W, H);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `700 ${H * .055}px ${FONT}`; c.fillStyle = '#1e2f4a'; c.fillText('קידוש ליל שבת', W / 2, H * .13);
    for (let i = 0; i < 4; i++) { c.fillStyle = '#c9c9d4'; c.beginPath(); c.roundRect(W * .1, H * (LF[i] - .018), W * .8 * (i === 3 ? .6 : 1), H * .036, H * .018); c.fill(); }
    c.font = `700 ${H * .062}px ${FONT}`; c.fillStyle = '#a9a9b4'; c.fillText('זכר ליציאת מצרים', W / 2, H * LF[4]);   // dark until it lights
  };
  const goldDraw = (c, W, H) => {
    c.fillStyle = 'rgba(255,214,90,.92)'; c.beginPath(); c.roundRect(W * .03, H * .1, W * .94, H * .8, H * .4); c.fill();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${H * .5}px ${FONT}`; c.fillStyle = '#6a4a00'; c.fillText('זכר ליציאת מצרים', W / 2, H * .5);
  };
  function mkCard(Wd) {
    Wd.add(box(CARD.w + .06, CARD.h + .06, .03, 0xd9c9a0, { pos: [CARD.x, TOPY + CARD.h / 2, CARD.z - .03] }));   // card board
    plane(Wd, CARD.w, CARD.h, cardDraw, 512, [CARD.x, TOPY + CARD.h / 2, CARD.z], 8);
    const hl = plane(Wd, CARD.w * .98, .16, (c, W, H) => { c.fillStyle = '#ffe066'; c.fillRect(0, 0, W, H); }, 64, [CARD.x, cardY(LF[0]), CARD.z + .01], 10);
    const gold = plane(Wd, CARD.w, .16, goldDraw, 512, [CARD.x, cardY(LF[4]), CARD.z + .012], 11);
    hl.material.opacity = 0; gold.material.opacity = 0;
    return { hl, gold, setHl(y, a) { hl.position.y = y; hl.material.opacity = a; } };
  }

  // ---------------------------------------------------------------- the heroes (origin = table top; face on the +z side)
  function mkCupA(Wd) {                                                              // silver kiddush cup with dark-red wine
    const g = new THREE.Group(); Wd.add(g); g.position.set(A_POS[0], TOPY, A_POS[1]); g.scale.setScalar(SC);
    const S = 0xc8ced6;
    g.add(cyl(.11, .11, .02, S, { pos: [0, .01, 0] }));
    g.add(cyl(.025, .025, .2, S, { pos: [0, .12, 0] }));
    g.add(cyl(.12, .085, .2, S, { pos: [0, .33, 0] }));
    g.add(cyl(.115, .115, .03, 0x6a0a1e, { pos: [0, .415, 0] }));                   // dark-red wine
    const f = face(Wd, { w: .2, parent: g, pos: [0, .33, .1], seed: SEED_A });
    return { g, f };
  }
  function mkCupB(Wd) {                                                              // second kiddush cup, gold
    const g = new THREE.Group(); Wd.add(g);
    const G = 0xe0b040; g.scale.setScalar(SC);
    g.add(cyl(.11, .11, .02, G, { pos: [0, .01, 0] }));
    g.add(cyl(.025, .025, .2, G, { pos: [0, .12, 0] }));
    g.add(cyl(.12, .085, .2, G, { pos: [0, .33, 0] }));
    const f = face(Wd, { w: .2, parent: g, pos: [0, .33, .1], seed: SEED_B });
    return { g, f };
  }
  function mkPyramid(Wd) {                                                           // small pyramid for mitzrayim
    const g = new THREE.Group(); Wd.add(g); g.position.set(PYR[0], TOPY, PYR[1]);
    g.add(box(.3, .03, .3, 0xb8a070, { pos: [0, .015, 0] }));
    g.add(cyl(.0005, .18, .32, 0xd9b26a, { pos: [0, .19, 0] }));
    return g;
  }
  const bob = (o, t, sd, x, z) => { o.g.position.set(x, TOPY + .012 * Math.sin(t * 1.7 + sd), z); o.g.rotation.y = .12 * Math.sin(t * .9 + sd); };
  const arcPts = (cx, cy, r, n) => { const out = []; for (let i = 0; i < n; i++) { const a = PI - PI * i / (n - 1); out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return out; };

  // standard four-shot camera: wide -> medium on the action -> insert on the object that carries the halacha -> low hero
  const std = (n, c) => cuts([
    [3.5, HH(truck(c.wide, { dur: 3.5, dist0: c.wd || 6.4, dist1: (c.wd || 6.4) - .2, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4, dist1: 3.0, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6, dist1: 2.5, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4, dist1: 3.6, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on cup A's worried face, pull out; the card's highlight runs the lines and jumps past the gold line, which stays dark; "?" above
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const A = mkCupA(Wd), card = mkCard(Wd);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      bob(A, t, 1, A_POS[0], A_POS[1]);
      const y = t < 4.6 ? lerp(cardY(LF[0]), cardY(LF[3]), sm(P(1, 4.6, t))) : lerp(cardY(LF[3]), cardY(.97), sm(P(4.6, 5.2, t)));
      card.setHl(y, t > .9 ? .4 : 0);
      qT.set([-.9, 2.0 + .05 * Math.sin(t * 2), .15], popE(P(1.0, 1.8, t)) * NUM, .05 * Math.sin(t * 4));
      A.f.set(t, { talk: t > 1 ? .5 * talkAmt(t, SEED_A) : 0, smile: -.5, look: [.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [A.g, card.hl]; Wd.qPos = [-.9, .15]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([-.9, 1.15, .15], { dur: 3.6, dist0: .9, dist1: 1.9, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([-.2, 1.2, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.2, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (good wording of the kiddush line): highlight runs the card line by line; the gold line lights; the pyramid pops with an arrow "יציאה" going out of it
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const A = mkCupA(Wd), card = mkCard(Wd), pyr = mkPyramid(Wd);
    const out = mkDots(Wd, 6, 0xffb347, .035);
    const yy = tag(Wd, 'יציאה', 'orange', 1.1);
    Wd.on(t => {
      bob(A, t, 1, A_POS[0], A_POS[1]);
      card.setHl(lerp(cardY(LF[0]), cardY(LF[4]), sm(P(.8, 4.0, t))), t > .6 ? .4 : 0);
      card.gold.material.opacity = sm(P(4.0, 4.6, t));
      pyr.scale.setScalar(Math.max(.001, popE(P(8.0, 8.6, t))));
      yy.set([-1.85, 1.75, .05], popE(P(8.8, 9.4, t)) * NUM, .03 * Math.sin(t * 3));
      out.forEach((d, i) => {
        const v = clamp((t - 8.6 - .25 * i) / 1.0, 0, 1);
        d.position.set(lerp(PYR[0], -2.6, v), lerp(TOPY + .35, 1.5, v), PYR[1]);
        d.scale.setScalar(Math.max(.001, Math.sin(PI * v)));
      });
      A.f.set(t, { talk: t > 1.5 ? .4 * talkAmt(t, SEED_A) : 0, smile: .4 + .4 * sm(P(4.0, 4.6, t)), look: [.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [yy.g, card.hl];
    Wd.cam = std(4, { wide: [0, 1.3, 0], med: [.45, 1.2, -.3], pm: .5, ins: [-1.9, 1.1, -.1], pi: .5 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (bad): the highlight runs again and HOPS over the gold line (tag "דילג"); the gold line stays dark; cup A is surprised; red cross; "?" pops
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const A = mkCupA(Wd), card = mkCard(Wd);
    const dT = tag(Wd, 'דילג', 'orange', 1.1), cross = mark3d(Wd, 'cross', .6), qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      bob(A, t, 1, A_POS[0], A_POS[1]);
      const y = t < 3.4 ? lerp(cardY(LF[0]), cardY(LF[3]), sm(P(.8, 3.4, t)))
                        : lerp(cardY(LF[3]), cardY(.97), sm(P(3.4, 4.2, t))) + .3 * Math.sin(PI * clamp((t - 3.4) / .8, 0, 1));
      card.setHl(y, t > .6 ? .4 : 0);
      dT.set([CARD.x, 2.05, .2], popE(P(4.0, 4.6, t)) * NUM, 0);
      cross.set([-.3, 1.9, .3], popE(P(4.6, 5.2, t)) * .6, .05 * Math.sin(t * 3));
      qT.set([-.9, 2.1, .15], popE(P(5.2, 5.8, t)) * NUM, .05 * Math.sin(t * 4));
      A.f.set(t, { talk: t > 1 ? .45 * talkAmt(t, SEED_A) : 0, smile: -.6, surprise: sm(P(4.4, 4.9, t)), look: [.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [dT.g, cross.g, qT.g, card.hl];
    Wd.cam = std(8, { wide: [0, 1.3, 0], med: [.45, 1.3, -.3], pm: 1.1, ins: [-.9, 1.25, .15], pi: .3 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (good): cup B slides in from the side with "עוד לא קידש"; sound rings travel from B to A (A's ear glows); the gold line lights; green check
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const A = mkCupA(Wd), B = mkCupB(Wd), card = mkCard(Wd);
    const tB = tag(Wd, 'עוד לא קידש', 'gold', 1.7);
    const rings = mkDots(Wd, 10, 0xffd166, .035);
    const ear = ball(.07, 0xffd166, { ink: false }); Wd.add(ear);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      const bx = lerp(3.6, B_HOME[0], sm(P(.4, 2.0, t)));
      bob(A, t, 1, A_POS[0], A_POS[1]); bob(B, t, 2, bx, B_HOME[1]);
      tB.set([bx, 1.8, .2], popE(P(1.4, 2.0, t)) * NUM, 0);
      rings.forEach((d, i) => {
        const v = clamp((t - 2.6 - .1 * i) / 1.2, 0, 1);
        d.position.set(lerp(bx, A_POS[0], v), TOPY + .4 + .15 * Math.sin(PI * v), lerp(B_HOME[1], A_POS[1], v));
        d.scale.setScalar(Math.max(.001, Math.sin(PI * v) * 1.6));
      });
      ear.position.set(A_POS[0] + .14, 1.45, .2); ear.scale.setScalar(Math.max(.001, popE(P(3.4, 3.9, t))));
      card.setHl(cardY(LF[4]), 0);
      card.gold.material.opacity = sm(P(4.6, 5.1, t));
      chk.set([-.45, 1.8, .35], popE(P(5.4, 6.0, t)) * .7, .04 * Math.sin(t * 3));
      sk.set([-.9, 1.75, .35], P(5.4, 6.2, t), 1.0);
      A.f.set(t, { talk: t > 3.6 ? .45 * talkAmt(t, SEED_A) : 0, smile: .4 + .5 * sm(P(4.4, 4.9, t)), look: [.8, 0] });
      B.f.set(t, { talk: (t > 1.8 && t < 2.8) ? .5 * talkAmt(t, SEED_B) : 0, smile: .6, look: [-.8, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tB.g, chk.g, card.gold];
    Wd.cam = std(12, { wide: [.5, 1.3, 0], wd: 7.6, med: [.5, 1.3, 0], pm: 1.9, ins: [-.9, 1.3, .15], pi: .5 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (good): cup B slides away with "אין אחר"; a U-turn arrow curls over cup A, tag "חוזר ומקדש"; the highlight runs the card again from the top, now lighting the gold line; green check
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const A = mkCupA(Wd), B = mkCupB(Wd), card = mkCard(Wd);
    const tAin = tag(Wd, 'אין אחר', 'orange', 1.2), tU = tag(Wd, 'חוזר ומקדש', 'green', 1.6);
    const arc = mkDots(Wd, 14, 0xe07a20, .04);
    const pts = arcPts(A_POS[0], TOPY + .55, .55, 14);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      const bx = lerp(B_HOME[0], B_OUT[0], sm(P(.4, 1.4, t)));
      bob(A, t, 1, A_POS[0], A_POS[1]);
      bob(B, t, 2, bx, B_HOME[1]); B.g.scale.setScalar(SC * Math.max(.001, 1 - sm(P(.6, 1.4, t))));
      tAin.set([B_HOME[0], 1.5, .2], popE(P(1.4, 2.0, t)) * NUM, 0);
      arc.forEach((d, i) => {
        d.position.set(pts[i][0], pts[i][1], A_POS[1]);
        d.scale.setScalar(Math.max(.001, popE(P(2.4 + .12 * i, 2.8 + .12 * i, t))));
      });
      tU.set([A_POS[0], 2.05, .3], popE(P(3.2, 3.8, t)) * NUM, .03 * Math.sin(t * 2));
      card.setHl(lerp(cardY(LF[0]), cardY(LF[4]), sm(P(4.0, 8.0, t))), t > 3.9 ? .4 : 0);
      card.gold.material.opacity = sm(P(7.3, 7.9, t)) * (.85 + .15 * Math.sin(t * 4));
      chk.set([1.7, 1.3, .3], popE(P(8.4, 9.0, t)) * .8, .04 * Math.sin(t * 3));
      sk.set([1.7, 1.3, .3], P(8.4, 9.2, t), 1.0);
      A.f.set(t, { talk: t > 1.5 ? .4 * talkAmt(t, SEED_A) : 0, smile: .3 + .5 * sm(P(3.6, 4.4, t)), look: [0, .2] });
      B.f.set(t, { talk: 0, smile: .3, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tU.g, tAin.g, chk.g, card.hl];
    Wd.cam = std(16, { wide: [0, 1.3, 0], med: [-.9, 1.4, .15], pm: .2, ins: [.45, 1.2, -.3], pi: .4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-84 (doubt): a grey cloud sits on the gold line, the line flickers lit/unlit ("מסופק"); cup B comes back and sends sound waves to cup A - "גם הוא ישמע"
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const A = mkCupA(Wd), B = mkCupB(Wd), card = mkCard(Wd);
    const tM = tag(Wd, 'מסופק', 'orange', 1.4), tB = tag(Wd, 'עוד לא קידש', 'gold', 1.7);
    const cloud = [0, 1, 2].map(() => { const b = ball(.12, 0x9a9aa6, { ink: false }); Wd.add(b); return b; });
    const rings = mkDots(Wd, 10, 0xffd166, .035);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const cOff = [[-.1, 0, .02], [0, .06, .03], [.1, 0, .02]];
    Wd.on(t => {
      const bx = lerp(B_OUT[0], B_HOME[0], sm(P(2.2, 3.4, t)));
      bob(A, t, 1, A_POS[0], A_POS[1]); bob(B, t, 2, bx, B_HOME[1]); B.g.scale.setScalar(SC * Math.max(.001, sm(P(2.2, 2.6, t))));
      tB.set([bx, 1.8, .2], popE(P(3.2, 3.8, t)) * NUM, 0);
      tM.set([CARD.x, 1.95, .25], popE(P(.8, 1.4, t)) * NUM, .03 * Math.sin(t * 2));
      cloud.forEach((b, i) => {
        b.position.set(.98 + cOff[i][0], cardY(LF[4]) + .02 + cOff[i][1], CARD.z + .07 + cOff[i][2]);
        b.scale.setScalar(Math.max(.001, popE(P(.4 + .1 * i, 1.0 + .1 * i, t))));
      });
      card.setHl(cardY(LF[4]), 0);
      card.gold.material.opacity = t < 1.2 ? 0 : (t < 4.2 ? (Math.sin(t * 15) > 0 ? .9 : .12) : .9);
      rings.forEach((d, i) => {
        const v = clamp((t - 4.0 - .1 * i) / 1.2, 0, 1);
        d.position.set(lerp(bx, A_POS[0], v), TOPY + .4 + .15 * Math.sin(PI * v), lerp(B_HOME[1], A_POS[1], v));
        d.scale.setScalar(Math.max(.001, Math.sin(PI * v) * 1.6));
      });
      chk.set([-.9, 1.75, .35], popE(P(8.2, 8.9, t)) * .8, .04 * Math.sin(t * 3));
      sk.set([-.9, 1.75, .35], P(8.2, 9.0, t), 1.0);
      A.f.set(t, { talk: t > 5 ? .4 * talkAmt(t, SEED_A) : 0, smile: .3 + .4 * sm(P(4.6, 5.4, t)), look: [.8, 0] });
      B.f.set(t, { talk: (t > 3.4 && t < 5.6) ? .5 * talkAmt(t, SEED_B) : 0, smile: .5, look: [-.8, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tM.g, tB.g, chk.g];
    Wd.cam = std(20, { wide: [.5, 1.3, 0], wd: 7.6, med: [.6, 1.3, -.1], pm: 1.0, ins: [-.9, 1.4, .15], pi: .7 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (good, after the doubt): cup B leaves ("אין מי שיוציאו"); the U-turn arrow starts to curl over A, gets a soft cross and dissolves; tag "אינו חוזר"; cup A relaxes and smiles; green check
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const A = mkCupA(Wd), B = mkCupB(Wd), card = mkCard(Wd);
    const tE = tag(Wd, 'אין מי שיוציאו', 'orange', 2.0), tNo = tag(Wd, 'אינו חוזר', 'grey', 1.5);
    const arc = mkDots(Wd, 14, 0xe07a20, .04);
    const pts = arcPts(A_POS[0], TOPY + .55, .55, 14);
    const soft = mark3d(Wd, 'cross', .7), chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      const bx = lerp(B_HOME[0], B_OUT[0], sm(P(.4, 1.4, t)));
      bob(A, t, 1, A_POS[0], A_POS[1]); bob(B, t, 2, bx, B_HOME[1]); B.g.scale.setScalar(SC * Math.max(.001, 1 - sm(P(.6, 1.4, t))));
      tE.set([.55, 1.75, .2], popE(P(1.4, 2.0, t)) * NUM * .85, 0);
      const dis = 1 - sm(P(3.4, 4.2, t));
      arc.forEach((d, i) => {
        d.position.set(pts[i][0], pts[i][1], A_POS[1]);
        d.scale.setScalar(Math.max(.001, popE(P(2.0 + .1 * i, 2.4 + .1 * i, t)) * dis));
      });
      soft.set([A_POS[0] + .45, 1.6, .35], popE(P(3.4, 3.9, t)) * .7, .05 * Math.sin(t * 3));
      tNo.set([A_POS[0], 2.1, .3], popE(P(4.4, 5.0, t)) * NUM, .02 * Math.sin(t * 2));
      chk.set([.3, 1.5, .3], popE(P(8.0, 8.6, t)) * .8, .04 * Math.sin(t * 3));
      sk.set([.3, 1.5, .3], P(8.0, 8.8, t), 1.0);
      card.setHl(cardY(LF[0]), 0);
      A.f.set(t, { talk: t > 5 ? .35 * talkAmt(t, SEED_A) : 0, smile: -.1 + .9 * sm(P(4.4, 5.2, t)), look: [0, 0] });
      B.f.set(t, { talk: 0, smile: .3, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tNo.g, tE.g, soft.g, chk.g];
    Wd.cam = std(24, { wide: [0, 1.3, 0], med: [-.9, 1.4, .15], pm: .4, ins: [-.9, 1.6, .15], pi: .5 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: two-column diagram standing at the back ("שכח -> חוזר ומקדש", "מסופק -> אינו חוזר"); cups at the sides; a moving arrow of dots; slow crane
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const A = mkCupA(Wd), B = mkCupB(Wd);
    A.g.position.x = -2.0; B.g.position.x = 2.0;
    const tS = tag(Wd, 'שכח', 'orange', 1.0), tR = tag(Wd, 'חוזר ומקדש', 'green', 1.8);
    const tM = tag(Wd, 'מסופק', 'orange', 1.2), tN = tag(Wd, 'אינו חוזר', 'grey', 1.6);
    const flow = mkDots(Wd, 5, 0xffd166, .05), flow2 = mkDots(Wd, 5, 0xffd166, .05);
    Wd.on(t => {
      tS.set([-1.9, 2.35, -1.6], popE(P(1.0, 1.6, t)) * NUM, 0);
      tR.set([1.9, 2.35, -1.6], popE(P(1.6, 2.2, t)) * NUM, 0);
      tM.set([-1.9, 1.75, -1.6], popE(P(2.6, 3.2, t)) * NUM, 0);
      tN.set([1.9, 1.75, -1.6], popE(P(3.2, 3.8, t)) * NUM, 0);
      flow.forEach((d, i) => { const v = (t * .35 + i / 5) % 1; d.position.set(lerp(-1.3, 1.1, v), 2.35, -1.6); d.scale.setScalar(Math.max(.001, Math.sin(PI * v))); });
      flow2.forEach((d, i) => { const v = (t * .35 + i / 5) % 1; d.position.set(lerp(-1.3, 1.1, v), 1.75, -1.6); d.scale.setScalar(Math.max(.001, Math.sin(PI * v))); });
      bob(A, t, 1, -2.0, A_POS[1]); bob(B, t, 2, 2.0, B_HOME[1]);
      A.f.set(t, { talk: .3 * talkAmt(t, SEED_A), smile: 1, look: [.5, 0] });
      B.f.set(t, { talk: .3 * talkAmt(t, SEED_B), smile: .8, look: [-.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tS.g, tR.g, tM.g, tN.g]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
