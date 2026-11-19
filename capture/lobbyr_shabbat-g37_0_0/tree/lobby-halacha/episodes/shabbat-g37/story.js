// shabbat-g37 story (19/11/2026) - havdala cup: revi'it lechatchila; at least rov revi'it = melo lugmav; less -> hear havdala again; none -> repeat it himself. Section C of storyboards_v19.md.
// Objects only, no people. Copied from shabbat-g36 (night set, tag helpers, camera rig).
// Heroes: the wine cup (havdala goblet with face), a gauge beside it (the measure: rob and rivit lines), a measuring jug with face,
// a cheek-balloon with face, a blessing card, a second havdala set (candle + cup).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, crane, lowHero, insert, handheld, punch, pushIn, face, talkAmt,
          mark3d, shock, popE, ease, prog, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TOPY = .8, NUM = .6;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], pink: ['#ffe0ec', '#8a1a4a', '#e0508a'] };
  const SC = 1.35;
  const GX = -.3, GZ = 0;                       // the wine cup
  const GA = .95, GAZ = .2;                     // the gauge (measure) beside the cup
  const JZ = .35, JX = 1.9;                     // the measuring jug
  const GH = .9, GB = TOPY + .1;                // gauge height and base (world)
  const FULL_Y = GB + GH, ROB_Y = GB + GH * .62, LOW_Y = GB + GH * .38;
  const SEED_G = 31, SEED_J = 33, SEED_B = 37, SEED_C2 = 36;

  // ---------------------------------------------------------------- world: night, dark-blue window with stars, warm candle light
  const kW = () => mkWorld({ skyTop: 0x0b1633, skyBottom: 0x2a3d6e, fogColor: 0x1d2a52, fogNear: 24, fogFar: 98, hemi: .7, sun: .45, sunPos: [-9, 22, 12], shadowExt: 10 });
  function sceneSet(Wd) {
    Wd.add(box(12, 5, .3, 0x3b3260, { pos: [0, 2.5, -2.0] }));                        // dusk wall
    Wd.add(box(2.7, 1.9, .08, 0x6b4a2e, { pos: [-3.4, 2.4, -1.78] }));                // window frame (left)
    Wd.add(box(2.3, 1.5, .04, 0x0d1d44, { pos: [-3.4, 2.4, -1.72], ink: false }));    // night sky pane
    Wd.add(box(.05, 1.5, .05, 0x6b4a2e, { pos: [-3.4, 2.4, -1.68] }));                 // mullion
    const stars = [[-3.8, 2.85], [-3.1, 3.05], [-3.4, 2.1]].map(p => { const s = ball(.05, 0xfff3b0, { pos: [p[0], p[1], -1.66], ink: false }); Wd.add(s); return s; });
    const glow = glowAt(Wd.scene, 2.2, 0xffb347, .35); glow.position.set(2.8, 1.3, -.9);
    Wd.add(box(12, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                     // floor (top at 0)
    Wd.add(box(6.4, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));                // white Shabbat tablecloth
    Wd.add(box(6.4, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));            // cloth drape
    for (const x of [-3.0, 3.0]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
    Wd.add(cyl(.09, .09, .03, 0xd9b26a, { pos: [2.8, TOPY + .015, -1.0] }));          // braided havdala candle, back right
    Wd.add(cyl(.05, .05, .5, 0xf0d890, { pos: [2.8, TOPY + .26, -1.0] }));
    Wd.add(cyl(.052, .052, .04, 0xc9a24a, { pos: [2.8, TOPY + .3, -1.0], ink: false }));
    const flame = ball(.05, 0xffb347, { pos: [2.8, TOPY + .55, -1.0], ink: false }); Wd.add(flame);
    Wd.add(box(.32, .2, .22, 0xd9a63a, { pos: [-2.6, TOPY + .1, -1.0] }));            // besamim box
    Wd.add(ball(.07, 0x5aa86a, { pos: [-2.6, TOPY + .24, -1.0] }));
    return { flame, stars, glow };
  }
  const animScene = (E, t) => {
    E.flame.scale.set(1 + .08 * Math.sin(t * 13), 1.2 + .25 * Math.sin(t * 9 + 1) + .1 * Math.sin(t * 23), 1);
    E.stars.forEach((s, i) => s.scale.setScalar(.8 + .3 * Math.sin(t * 3 + i * 2)));
  };

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g36)
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
  const tagS = (Wd, text, style, w) => bb(Wd, w, .26, drawTag(text, ST[style]), 520);      // small label for the gauge lines
  const mkDots = (Wd, n, col, r) => { const ds = []; for (let i = 0; i < n; i++) { const d = ball(r, col, { ink: false }); Wd.add(d); ds.push(d); } return ds; };
  // a stream of moving dots from A to B; on = 0..1 strength; flowing, not random
  const flow = (dots, A, B, on, col, t, ph) => dots.forEach((d, i) => {
    const v = (t * .7 + i / dots.length + (ph || 0)) % 1;
    d.position.set(lerp(A[0], B[0], v), lerp(A[1], B[1], v) + .06 * Math.sin(PI * v), lerp(A[2], B[2], v));
    d.scale.setScalar(Math.max(.001, Math.sin(PI * v) * on));
    d.material.color.setHex(col);
  });
  // idle bob for a hero standing on the table
  const place = (o, x, z, t, sd, lift) => { o.g.position.set(x, TOPY + (lift || 0) + .01 * Math.sin(t * 1.7 + sd), z); o.g.rotation.y = .1 * Math.sin(t * .9 + sd); };

  // ---------------------------------------------------------------- the heroes (origin = table top; face on the +z side)
  function mkGoblet(Wd, x, z, seed) {                                // havdala wine cup: silver, wine level set by setLevel
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(SC);
    const S = 0xc8ced6;
    g.add(cyl(.11, .11, .02, S, { pos: [0, .01, 0] }));
    g.add(cyl(.025, .025, .2, S, { pos: [0, .12, 0] }));
    g.add(cyl(.12, .085, .2, S, { pos: [0, .33, 0] }));
    const wine = cyl(.112, .09, .18, 0x6a0a1e, { pos: [0, .34, 0] }); g.add(wine);
    const glint = ball(.022, 0xffffff, { ink: false }); g.add(glint);
    const f = face(Wd, { w: .2, parent: g, pos: [0, .33, .1], seed });
    return {
      g, f, glint, x, z,
      setLevel(L) { const l = Math.max(.02, L); wine.scale.y = l; wine.position.y = .25 + .09 * l; }
    };
  }
  // gauge beside the cup: glass tube, red fill (0..1 = the amount), lines at the rivit (full), the rob (a little above half) and a low line
  function mkGauge(Wd, x, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, 0, z);
    g.add(box(.24, GH, .1, 0xdde6f0, { pos: [0, GB + GH / 2, 0] }));
    const fill = box(.16, GH, .06, 0x7a0a1e, { pos: [0, GB + GH / 2, .05], ink: false }); g.add(fill);
    const line = (y, col) => { const m = box(.4, .03, .08, col, { pos: [0, y, .07], ink: false }); g.add(m); return m; };
    const full = line(FULL_Y, 0x2f6ad0), rob = line(ROB_Y, 0xe0a030), low = line(LOW_Y, 0x9a9a9a);
    const labFull = tagS(Wd, 'רביעית', 'gold', .75), labRob = tagS(Wd, 'רוב', 'orange', .5);
    return {
      g, fill, full, rob, low, labFull, labRob,
      set(F, sf, sr) {
        const f = Math.min(1, Math.max(.001, F));
        fill.scale.y = f; fill.position.y = GB + GH * f / 2;
        fill.material.color.setHex(f >= .98 ? 0xc0203a : 0x7a0a1e);
        labFull.set([x + .72, FULL_Y, z + .3], sf || 0, 0);
        labRob.set([x + .6, ROB_Y, z + .3], sr || 0, 0);
      }
    };
  }
  // measuring jug with face; it hops in from the right, tilts and pours toward the gauge
  function mkJug(Wd) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(JX, TOPY, JZ); g.scale.setScalar(1.1);
    const J = 0x7fb8e6;
    g.add(cyl(.1, .12, .4, J, { pos: [0, .2, 0] }));
    g.add(box(.05, .2, .05, J, { pos: [.14, .2, 0] }));
    const f = face(Wd, { w: .14, parent: g, pos: [0, .24, .13], seed: SEED_J });
    return { g, f };
  }
  function jugTo(J, t, tIn, p0, p1, tOut) {
    const hop = sm(P(tIn, tIn + 1.4, t)), back = sm(P(tOut, tOut + 1.2, t));
    const x = lerp(lerp(3.7, JX, hop), 3.7, back);
    const tilt = .9 * sm(P(p0 - .4, p0, t)) * (1 - sm(P(p1, p1 + .4, t)));
    J.g.position.set(x, TOPY, JZ); J.g.rotation.z = tilt;
    return { on: sm(P(p0, p0 + .3, t)) * (1 - sm(P(p1, p1 + .3, t))), mouth: [x - .46 * Math.sin(tilt), TOPY + .46 * Math.cos(tilt), JZ] };
  }
  function mkCandle(Wd, x, z) {                                       // second havdala candle (lit)
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    g.add(cyl(.05, .05, .5, 0xf0d890, { pos: [0, .25, 0] }));
    const flame = ball(.05, 0xffb347, { pos: [0, .55, 0], ink: false }); g.add(flame);
    return { g, flame };
  }

  // standard four-shot camera: wide -> medium on the action -> insert on the object that carries the halacha -> low hero
  // Z = pull-back factor (18/11): every distance is multiplied, so tags and panels stay inside the frame
  const Z = 1.35;
  const std = (n, c) => cuts([
    [3.5, HH(truck(c.wide, { dur: 3.5, dist0: (c.wd || 6.4) * Z, dist1: ((c.wd || 6.4) - .2) * Z, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4 * Z, dist1: 3.0 * Z, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6 * Z, dist1: 2.5 * Z, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4 * Z, dist1: 3.6 * Z, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the full cup's face, pull out; empty gauge; "?" above
  function hook(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G);
    const GG = mkGauge(Wd, GA, GAZ);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      animScene(E, t);
      G.setLevel(1);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: t > 1 ? .5 * talkAmt(t, SEED_G) : 0, smile: -.5, look: [.6, 0] });
      GG.set(0, 0, 0);
      qT.set([GX, 1.7 + .05 * Math.sin(t * 2), .15], popE(P(1.0, 1.8, t)) * NUM, .05 * Math.sin(t * 4));
    });
    Wd.center = [0, 0]; Wd.occ = [G.g, qT.g]; Wd.qPos = [GX, .15]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([GX, 1.2, .15], { dur: 3.6, dist0: .9, dist1: 1.9, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([0, 1.1, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.1, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (good): the jug pours into the gauge up to the rivit line; the cup drains by the same amount; tag "רביעית"; green check
  function s1(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G), GG = mkGauge(Wd, GA, GAZ), J = mkJug(Wd);
    const pr = mkDots(Wd, 3, 0x7a0a1e, .035);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      animScene(E, t);
      const jg = jugTo(J, t, .4, 2.6, 6.4, 7.6);
      const F = sm(P(2.8, 6.2, t));
      GG.set(F, popE(P(6.2, 6.8, t)), 0);
      G.setLevel(1 - .35 * F);
      flow(pr, jg.mouth, [GA, FULL_Y, GAZ], jg.on, 0x7a0a1e, t);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      place(G, GX, GZ, t, 1, 0);
      J.f.set(t, { talk: jg.on * .5 * talkAmt(t, SEED_J), smile: .4, look: [-.4, 0] });
      G.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, SEED_G) : 0, smile: .2 + .6 * sm(P(6.8, 8.2, t)), look: [.4, 0] });
      chk.set([0, 1.8, .3], popE(P(8.4, 9.0, t)) * .7, .04 * Math.sin(t * 3));
      sk.set([0, 1.8, .3], P(8.4, 9.2, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [GG.labFull.g, chk.g];
    Wd.cam = std(4, { wide: [0, 1.3, 0], wd: 6.4, med: [.2, 1.2, .1], pm: 2.8, ins: [.5, 1.2, .2], pi: .9 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (neutral): the card "ברכה אחרונה" floats in; the gauge is full and glows; a replay with the gauge half full - the card wobbles with a "?"; back to full, steady; tag "בלי ספק"
  function s2(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G), GG = mkGauge(Wd, GA, GAZ);
    const card = tag(Wd, 'ברכה אחרונה', 'gold', 1.9), q = tag(Wd, '?', 'grey', .8), ok = tag(Wd, 'בלי ספק', 'blue', 1.6);
    Wd.on(t => {
      animScene(E, t);
      const F = 1 - .5 * (sm(P(4.0, 5.0, t)) - sm(P(6.4, 7.4, t)));
      GG.set(F, 1, 0);
      G.setLevel(1 - .35 * F);
      place(G, GX, GZ, t, 1, 0);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      const doubt = sm(P(4.0, 4.8, t)) * (1 - sm(P(6.6, 7.2, t)));
      card.set([-1.0, 1.6, .3], popE(P(.6, 1.4, t)) * NUM, .14 * Math.sin(t * 5) * doubt);
      q.set([-1.0, 2.05, .3], popE(P(4.2, 4.8, t)) * NUM * (1 - sm(P(6.6, 7.0, t))), 0);
      ok.set([-1.0, 2.05, .3], popE(P(8.4, 9.0, t)) * NUM, 0);
      G.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, SEED_G) : 0, smile: .5, look: [-.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [card.g, q.g, ok.g, GG.labFull.g];
    Wd.cam = std(8, { wide: [0, 1.3, 0], wd: 6.4, med: [-.5, 1.3, .1], pm: .7, ins: [-1.0, 1.6, .3], pi: .9 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (neutral): the jug pours until the gauge stops at the "רוב" line; the cup face looks tired; tag "לפחות רוב"; check
  function s3(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G), GG = mkGauge(Wd, GA, GAZ), J = mkJug(Wd);
    const pr = mkDots(Wd, 3, 0x7a0a1e, .035);
    const tRob = tag(Wd, 'לפחות רוב', 'orange', 1.9), chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      animScene(E, t);
      const jg = jugTo(J, t, .4, 1.6, 4.4, 5.4);
      const F = .62 * sm(P(1.6, 4.4, t));
      GG.set(F, 0, 1);
      G.setLevel(1 - .35 * F);
      flow(pr, jg.mouth, [GA, ROB_Y, GAZ], jg.on, 0x7a0a1e, t);
      place(G, GX, GZ, t, 1, 0);
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: -.2, look: [.2, -.2] });
      J.f.set(t, { talk: jg.on * .5 * talkAmt(t, SEED_J), smile: .3, look: [-.4, 0] });
      tRob.set([-1.0, 1.9, .3], popE(P(5.0, 5.6, t)) * NUM, 0);
      chk.set([.25, 1.95, .3], popE(P(8.0, 8.6, t)) * .6, .04 * Math.sin(t * 3));
      sk.set([.25, 1.95, .3], P(8.0, 8.8, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [tRob.g, chk.g, GG.labRob.g];
    Wd.cam = std(12, { wide: [0, 1.3, 0], wd: 6.4, med: [-.5, 1.2, .1], pm: 1.6, ins: [.5, 1.2, .2], pi: .6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (good): the cheek-balloon inflates to full exactly when the gauge reaches "רוב"; "=" pops between them; tag "מלא לוגמיו"; green check
  function s4(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G), GG = mkGauge(Wd, GA, GAZ), J = mkJug(Wd);
    const pr = mkDots(Wd, 3, 0x7a0a1e, .035);
    const BG = new THREE.Group(); Wd.add(BG); BG.position.set(-1.5, TOPY, .3);
    BG.add(ball(.25, 0xffb3c6, { pos: [0, .25, 0] }));
    const bf = face(Wd, { w: .16, parent: BG, pos: [0, .25, .27], seed: SEED_B });
    const tEq = tag(Wd, '=', 'green', .5), tFull = tag(Wd, 'מלא לוגמיו', 'pink', 1.9), chk = mark3d(Wd, 'check', .6);
    Wd.on(t => {
      animScene(E, t);
      const jg = jugTo(J, t, .2, 1.0, 3.4, 4.6);
      const F = .62 * sm(P(1.0, 3.8, t));
      GG.set(F, 0, 1);
      G.setLevel(1 - .35 * F);
      flow(pr, jg.mouth, [GA, ROB_Y, GAZ], jg.on, 0x7a0a1e, t);
      BG.scale.setScalar(.15 + .85 * sm(P(.8, 4.0, t)));
      bf.set(t, { talk: .4 * talkAmt(t, SEED_B), smile: t > 4 ? 1 : .4, look: [.3, 0] });
      tEq.set([-.85, 1.1, .3], popE(P(4.2, 4.8, t)) * NUM, 0);
      tFull.set([-1.5, 1.8, .3], popE(P(5.0, 5.6, t)) * NUM, 0);
      chk.set([.25, 2.0, .3], popE(P(7.8, 8.4, t)) * .6, .04 * Math.sin(t * 3));
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      place(G, GX, GZ, t, 1, 0);
      G.f.set(t, { talk: jg.on * .4 * talkAmt(t, SEED_G), smile: .4 + .5 * sm(P(6.4, 7.6, t)), look: [.4, 0] });
      J.f.set(t, { talk: jg.on * .5 * talkAmt(t, SEED_J), smile: .3, look: [-.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tFull.g, tEq.g, chk.g];
    Wd.cam = std(16, { wide: [0, 1.3, 0], wd: 6.6, med: [-.8, 1.2, .1], pm: 2.0, ins: [-1.5, 1.2, .3], pi: .3 });
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-84 (bad): the gauge reaches only the low line, below "רוב"; red cross + shock; a second havdala set (candle + cup) slides in from the side; an arrow from the first cup to it; tag "שומעים שוב"
  function s5(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G), GG = mkGauge(Wd, GA, GAZ), J = mkJug(Wd);
    const pr = mkDots(Wd, 3, 0x7a0a1e, .035);
    const C2 = mkGoblet(Wd, -4.6, .3, SEED_C2), K2 = mkCandle(Wd, -4.6 + .45, .3);
    const arr = mkDots(Wd, 6, 0xe07a20, .035);
    const x1 = mark3d(Wd, 'cross', .6), sk = shock(Wd, 0xff6a6a);
    const tAgain = tag(Wd, 'שומעים שוב', 'blue', 1.8);
    Wd.on(t => {
      animScene(E, t);
      const jg = jugTo(J, t, .2, .8, 3.2, 4.0);
      const F = .38 * sm(P(.8, 3.2, t));
      GG.set(F, 0, 1);
      G.setLevel(1 - .35 * F);
      flow(pr, jg.mouth, [GA, LOW_Y, GAZ], jg.on, 0x7a0a1e, t);
      place(G, GX, GZ, t, 1, 0);
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: -.6, surprise: sm(P(4.2, 4.8, t)), look: [.4, 0] });
      J.f.set(t, { talk: jg.on * .5 * talkAmt(t, SEED_J), smile: -.2, look: [-.4, 0] });
      x1.set([0, 1.9, .3], popE(P(4.4, 5.0, t)) * .6, .05 * Math.sin(t * 3));
      sk.set([0, 1.9, .3], P(4.4, 5.2, t), 1.0);
      const x2 = lerp(-4.6, -2.2, sm(P(5.0, 6.6, t)));
      C2.g.position.set(x2, TOPY, .3); K2.g.position.set(x2 + .45, TOPY, .3);
      C2.f.set(t, { talk: t > 5.6 ? .4 * talkAmt(t, SEED_C2) : 0, smile: .3, look: [.5, 0] });
      flow(arr, [GX + .25, TOPY + .6, .3], [x2 + .15, TOPY + .6, .3], sm(P(6.4, 6.9, t)), 0xe07a20, t);
      tAgain.set([-1.3, 1.9, .3], popE(P(7.9, 8.5, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tAgain.g, x1.g];
    Wd.cam = std(20, { wide: [0, 1.3, 0], wd: 7.0, med: [-.4, 1.2, .1], pm: 1.2, ins: [-2.2, 1.2, .3], pi: .4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 84-98 (good): the second set fades ("אין מי שיבדיל"); the candle relights; the first cup is full again and the jug pours it down to the rivit line; a ring of dots turns around the cup; green check; tag "מבדיל בעצמו"
  function s6(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G), GG = mkGauge(Wd, GA, GAZ), J = mkJug(Wd);
    const pr = mkDots(Wd, 3, 0x7a0a1e, .035);
    const C2 = mkGoblet(Wd, -2.2, .3, SEED_C2), K2 = mkCandle(Wd, -2.2 + .45, .3);
    const ring = mkDots(Wd, 8, 0xe07a20, .03);
    const tNo = tag(Wd, 'אין מי שיבדיל', 'grey', 2.2), tSelf = tag(Wd, 'מבדיל בעצמו', 'green', 2.0);
    const chk = mark3d(Wd, 'check', .55), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      animScene(E, t);
      E.flame.visible = t > 3.0;
      const fade = 1 - sm(P(.8, 2.2, t));
      C2.g.scale.setScalar(Math.max(.001, 1.35 * fade)); K2.g.scale.setScalar(Math.max(.001, fade));
      C2.f.set(t, { talk: t < 2.2 ? .4 * talkAmt(t, SEED_C2) : 0, smile: -.2, look: [-.4, 0] });
      const jg = jugTo(J, t, .2, 2.6, 6.0, 6.8);
      const F = sm(P(2.8, 6.0, t));
      GG.set(F, popE(P(6.0, 6.6, t)), 0);
      G.setLevel(1 - .35 * F);
      flow(pr, jg.mouth, [GA, FULL_Y, GAZ], jg.on, 0x7a0a1e, t);
      ring.forEach((d, i) => {
        const a = i * 2 * PI / 8 + t * 1.6;
        d.position.set(GX + .5 * Math.cos(a), TOPY + .75 + .5 * Math.sin(a), .3);
        d.scale.setScalar(Math.max(.001, popE(P(3.6, 4.4, t)) * (1 - sm(P(8.0, 8.8, t)))));
      });
      tNo.set([-1.5, 1.9, .3], popE(P(.6, 1.2, t)) * NUM * (1 - sm(P(2.0, 2.6, t))), 0);
      tSelf.set([-1.5, 1.9, .3], popE(P(6.8, 7.4, t)) * NUM, 0);
      chk.set([.4, 1.95, .3], popE(P(7.6, 8.2, t)) * .55, .04 * Math.sin(t * 3));
      sk.set([.4, 1.95, .3], P(7.6, 8.4, t), 1.0);
      place(G, GX, GZ, t, 1, 0);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: .3 + .6 * sm(P(6.8, 8.0, t)), look: [.4, 0] });
      J.f.set(t, { talk: jg.on * .5 * talkAmt(t, SEED_J), smile: .3, look: [-.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tNo.g, tSelf.g, chk.g];
    Wd.cam = std(24, { wide: [0, 1.3, 0], wd: 6.6, med: [-.2, 1.2, .1], pm: 3.3, ins: [GX, 1.2, .3], pi: .3 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 98-118: the cup at the front-left, smiling; the gauge at the right with both lines ("רביעית" and "רוב") pulsing; candle and spice box behind; slow crane
  function answerBg(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, -1.9, .4, SEED_G); G.g.scale.setScalar(SC * 1.1); G.setLevel(.65);
    const GG = mkGauge(Wd, 1.5, .4);
    Wd.on(t => {
      animScene(E, t);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: 1, look: [.5, 0] });
      GG.set(1, 1, 1);
      const pulse = 1 + .08 * Math.sin(t * 4);
      GG.full.scale.set(pulse, 1, 1); GG.rob.scale.set(pulse, 1, 1);
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
