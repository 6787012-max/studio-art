// shabbat-g39 story (21/11/2026) - havdala: heard only "borei pri hagafen", not "hamavdil" -> NOT yotze, must repeat. Section C of storyboards_v21.md.
// Objects only, no people. Mirror of shabbat-g38 (copied from it): the missed card is now the GOLD "המבדיל".
// Heroes: the wine cup (face), two blessing cards with faces (gold "המבדיל", purple "הגפן"), an ear with a face (listener),
// a grey cloud that stops the gold sound, a circle diagram "עיקר ההבדלה" with a gold key, a meter, a circular arrow "שוב", a split line for the recap.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, crane, lowHero, insert, handheld, punch, pushIn, face, talkAmt,
          mark3d, shock, popE, ease, prog, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TOPY = .8, NUM = .6;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], pink: ['#ffe0ec', '#8a1a4a', '#e0508a'],
               red: ['#ffe6e6', '#8a1010', '#e04040'] };
  const SC = 1.35;
  const GX = -.3, GZ = -.5;                     // the wine cup
  const HZ = .6;                                // the row of blessing cards
  const EAR_X = 2.2;                            // the ear (listener), right side, kept inside the medium frame
  const CARD = { gold: 0xd9a63a, purple: 0x6a2aa0, grey: 0x9a9a9a, green: 0x3f9a4a, orange: 0xe07a20 };
  const SEED_G = 31, SEED_H = 41, SEED_P = 42, SEED_E = 47;

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

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g37)
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
  const tagS = (Wd, text, style, w) => bb(Wd, w, .26, drawTag(text, ST[style]), 520);      // small label for cards
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
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(SC * 1.4);
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
  // a blessing card standing on the table: a flat coloured card with a face on its front
  function mkCard(Wd, x, z, col, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    const body = box(.5, .6, .06, col, { pos: [0, .3, 0] }); g.add(body);
    const f = face(Wd, { w: .34, parent: g, pos: [0, .3, .07], seed });
    return { g, f, body };
  }
  // the listener: an ear shape with a face (not a person)
  function mkEar(Wd, x, y, z, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, y, z);
    const e = ball(.24, 0xf2c4a0); e.scale.set(.75, 1.1, .6); g.add(e);
    const inner = ball(.07, 0xd98a7a, { ink: false }); inner.position.set(0, -.01, .14); g.add(inner);
    const f = face(Wd, { w: .26, parent: g, pos: [0, .02, .17], seed });
    return { g, f };
  }
  // grey cloud: three soft balls that stop the sound
  function mkCloud(Wd, x, y, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, y, z);
    [[0, 0, .2], [.18, .05, .16], [-.18, .03, .15]].forEach(p => { const b = ball(p[2], 0xb8c0cc, { ink: false }); b.position.set(p[0], p[1], 0); g.add(b); });
    return g;
  }
  // meter standing on the table: a bar that fills from the bottom
  function mkMeter(Wd, x, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    g.add(box(.26, 1.0, .1, 0xdde6f0, { pos: [0, .5, 0] }));
    const fill = box(.18, 1.0, .06, 0x2f9a4a, { pos: [0, .5, .05], ink: false }); g.add(fill);
    return { g, set(F) { const f = Math.min(1, Math.max(.001, F)); fill.scale.y = f; fill.position.y = .5 * f; } };
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

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the cup's face, pull out; the two cards hover; the GOLD "המבדיל" card blinks out; "?" above
  function hook(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G);
    const HAM = mkCard(Wd, .3, GZ, CARD.gold, SEED_H), HAG = mkCard(Wd, -.9, GZ, CARD.purple, SEED_P);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      animScene(E, t);
      G.setLevel(1);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: t > 1 ? .5 * talkAmt(t, SEED_G) : 0, smile: -.4, look: [.6, 0] });
      const bob = .05 * Math.sin(t * 2);
      HAM.g.position.set(.3, 1.6 + bob, GZ); HAM.g.scale.setScalar(Math.max(.001, popE(P(.4, 1.2, t)) * (1 - sm(P(5.4, 6.2, t)))));
      HAG.g.position.set(-.9, 1.6 - bob, GZ); HAG.g.scale.setScalar(Math.max(.001, popE(P(.8, 1.6, t))));
      HAM.f.set(t, { talk: t > 3 ? .4 * talkAmt(t, SEED_H) : 0, smile: .5, look: [-.5, 0], surprise: sm(P(5.4, 6.2, t)) });
      HAG.f.set(t, { talk: t > 3 ? .3 * talkAmt(t, SEED_P) : 0, smile: .4, look: [.5, 0] });
      qT.set([GX, 2.0 + .05 * Math.sin(t * 2), GZ], popE(P(6.6, 7.4, t)) * NUM, .05 * Math.sin(t * 4));
    });
    Wd.center = [0, 0]; Wd.occ = [G.g, qT.g, HAM.g, HAG.g]; Wd.qPos = [GX, GZ]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([GX, 1.2, GZ], { dur: 3.6, dist0: .9, dist1: 1.9, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([0, 1.1, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.1, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (neutral): four cards pop in a row (the havdala order), each with a label; the big tag "ברכות ההבדלה"
  function s1(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G);
    // [x, card text, card colour, label style, label width]
    const row = [[-1.7, 'הגפן', CARD.purple, 'blue', .6], [-.85, 'בשמים', CARD.green, 'green', .8],
                 [.3, 'מאורי האש', CARD.orange, 'orange', .95], [1.35, 'המבדיל', CARD.gold, 'gold', .75]];
    const cards = row.map((r, i) => ({ x: r[0], c: mkCard(Wd, r[0], HZ, r[2], SEED_P + i), lbl: tagS(Wd, r[1], r[3], r[4]), t0: 1 + 1.5 * i, sd: SEED_P + i }));
    const big = tagS(Wd, 'ברכות ההבדלה', 'gold', 2.0);
    Wd.on(t => {
      animScene(E, t);
      G.setLevel(1); G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      place(G, GX, GZ, t, 1, 0);
      G.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, SEED_G) : 0, smile: .2, look: [.5, 0] });
      cards.forEach(k => {
        k.c.g.scale.setScalar(Math.max(.001, popE(P(k.t0, k.t0 + .6, t))));
        k.c.f.set(t, { talk: t > k.t0 + .6 ? .3 * talkAmt(t, k.sd) : 0, smile: .4, look: [0, 0] });
        k.lbl.set([k.x, 1.55, HZ], popE(P(k.t0 + .4, k.t0 + 1.0, t)) * .8, 0);
      });
      big.set([0, 1.85, HZ], popE(P(.6, 1.2, t)) * .9, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [big.g];
    Wd.cam = std(4, { wide: [0, 1.2, 0], wd: 6.4, med: [.1, 1.2, .3], pm: 2.6, ins: [.5, 1.2, HZ], pi: .8 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (neutral): the purple "הגפן" sound arrives at the ear over the cards; the GOLD "המבדיל" sound stops at a grey cloud; tag "לא שמע ״המבדיל״"
  function s2(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G);
    const HAM = mkCard(Wd, 1.2, HZ, CARD.gold, SEED_H), HAG = mkCard(Wd, -1.6, HZ, CARD.purple, SEED_P);
    const EAR = mkEar(Wd, EAR_X, TOPY + .6, HZ, SEED_E);
    const cloud = mkCloud(Wd, 1.6, TOPY + .55, HZ);
    const dH = mkDots(Wd, 3, 0xd9a63a, .035), dG = mkDots(Wd, 3, 0x6a2aa0, .035);
    const tNo = tag(Wd, 'לא שמע ״המבדיל״', 'grey', 2.6);
    Wd.on(t => {
      animScene(E, t);
      G.setLevel(1); G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: 0, smile: -.2, look: [1, 0] });
      HAM.f.set(t, { talk: .4 * talkAmt(t, SEED_H), smile: .2, look: [1, 0] });
      HAG.f.set(t, { talk: .3 * talkAmt(t, SEED_P), smile: .4, look: [1, 0] });
      flow(dH, [1.2, TOPY + .55, HZ], [1.5, TOPY + .55, HZ], 1, 0xd9a63a, t);                     // gold sound: stopped by the cloud
      flow(dG, [-1.4, TOPY + 1.0, HZ], [EAR_X - .3, TOPY + .6, HZ], 1, 0x6a2aa0, t);              // purple sound: arrives, over the cards
      EAR.f.set(t, { talk: t > 3 ? .5 * talkAmt(t, SEED_E) : 0, smile: .3 + .2 * sm(P(3, 5, t)), look: [-.5, 0] });
      tNo.set([.4, 2.0, HZ], popE(P(3.0, 3.8, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tNo.g];
    Wd.cam = std(8, { wide: [0, 1.2, 0], wd: 6.6, med: [.2, 1.2, HZ], pm: 4.4, ins: [.4, 1.2, HZ], pi: 5.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (bad): the meter "יצא ידי חובה" tries to fill but stays empty; the ear worries; red cross + shock; tag "לא יצא"
  function s3(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G);
    const HAM = mkCard(Wd, 1.2, HZ, CARD.gold, SEED_H), HAG = mkCard(Wd, -1.6, HZ, CARD.purple, SEED_P);
    const EAR = mkEar(Wd, EAR_X, TOPY + .6, HZ, SEED_E);
    const M = mkMeter(Wd, -2.7, HZ);
    const mL = tagS(Wd, 'יצא ידי חובה', 'blue', 1.6);
    const tNo = tag(Wd, 'לא יצא', 'red', 1.6), crs = mark3d(Wd, 'cross', .6), sk = shock(Wd, 0xff6a6a);
    Wd.on(t => {
      animScene(E, t);
      G.setLevel(1); G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: 0, smile: -.3, look: [1, 0] });
      HAM.f.set(t, { talk: .3 * talkAmt(t, SEED_H), smile: -.2, look: [1, 0] });
      HAG.f.set(t, { talk: .3 * talkAmt(t, SEED_P), smile: .4, look: [1, 0] });
      const tryF = sm(P(1.0, 3.0, t)) * (1 - sm(P(3.0, 4.2, t)));                                // the bar rises a little, then drops back
      M.set(.03 + .3 * tryF);
      mL.set([-2.7, 2.1, HZ], popE(P(.4, 1.0, t)) * .8, 0);
      EAR.f.set(t, { talk: .3 * talkAmt(t, SEED_E), smile: -.6, surprise: sm(P(4.0, 4.6, t)), look: [-.5, 0] });
      crs.set([1.6, 1.85, HZ], popE(P(4.2, 5.0, t)) * .6, .04 * Math.sin(t * 3));
      sk.set([1.6, 1.85, HZ], P(4.2, 5.6, t), 1.0);
      tNo.set([0, 2.35, HZ], popE(P(4.6, 5.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tNo.g, crs.g];
    Wd.cam = std(12, { wide: [0, 1.3, 0], wd: 6.6, med: [.6, 1.3, HZ], pm: 4.6, ins: [-2.4, 1.0, HZ], pi: 4.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (neutral): diagram - a dotted circle "עיקר ההבדלה"; the gold card "המבדיל" lifts INSIDE it; the purple card "הגפן" floats just OUTSIDE; a gold key appears; tag "המבדיל = העיקר"
  function s4(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G);
    const HAM = mkCard(Wd, 1.2, HZ, CARD.gold, SEED_H), HAG = mkCard(Wd, -1.6, HZ, CARD.purple, SEED_P);
    const C = [.2, 1.6, HZ], R = .6;
    const ringD = mkDots(Wd, 18, 0xd9a63a, .035);
    const lbl = tagS(Wd, 'עיקר ההבדלה', 'gold', 1.3);
    const tEq = tag(Wd, 'המבדיל = העיקר', 'gold', 1.9);
    const key = new THREE.Group(); Wd.add(key); key.position.set(-.9, 1.0, HZ);                   // gold key icon
    key.add(box(.5, .07, .07, 0xd9a63a, { pos: [0, 0, 0] }));
    const bow = cyl(.13, .13, .07, 0xd9a63a, { pos: [-.32, 0, 0] }); bow.rotation.x = PI / 2; key.add(bow);
    key.add(box(.1, .16, .07, 0xd9a63a, { pos: [.22, -.1, 0] }));
    Wd.on(t => {
      animScene(E, t);
      G.setLevel(1); G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .2 * talkAmt(t, SEED_G), smile: .3, look: [.4, 0] });
      const lift = sm(P(0, 1.8, t));
      HAM.g.position.set(lerp(1.2, C[0], lift), lerp(TOPY, C[1], lift), HZ);
      HAM.f.set(t, { talk: .4 * talkAmt(t, SEED_H), smile: .6, look: [-.3, 0] });
      const out = sm(P(.4, 2.2, t));
      HAG.g.position.set(lerp(-1.6, -.9, out), lerp(TOPY, 2.25, out), HZ);
      HAG.f.set(t, { talk: t > 3 ? .3 * talkAmt(t, SEED_P) : 0, smile: .2, look: [.6, 0] });
      ringD.forEach((d, i) => {
        const a = i * 2 * PI / 18 + .4 * t;
        d.position.set(C[0] + R * Math.cos(a), C[1] + R * Math.sin(a), HZ);
        d.scale.setScalar(Math.max(.001, popE(P(1.4, 2.2, t))));
      });
      key.scale.setScalar(Math.max(.001, popE(P(2.4, 3.2, t))));
      key.rotation.z = .15 * Math.sin(t * 2);
      lbl.set([C[0], 2.5, HZ], popE(P(1.6, 2.4, t)) * .9, 0);
      tEq.set([2.0, 2.05, HZ], popE(P(3.0, 3.6, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [lbl.g, tEq.g];
    Wd.cam = std(16, { wide: [0, 1.4, 0], wd: 6.6, med: [0, 1.5, HZ], pm: 2.6, ins: [C[0], C[1], HZ], pi: 3.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-86 (good): repeat - a circular arrow "שוב" goes round the table; the cup refills; the gold sound reaches the ear; the meter fills; green check; tag "לחזור ולהבדיל"
  function s5(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G);
    const HAM = mkCard(Wd, 1.2, HZ, CARD.gold, SEED_H), HAG = mkCard(Wd, -1.6, HZ, CARD.purple, SEED_P);
    const EAR = mkEar(Wd, EAR_X, TOPY + .6, HZ, SEED_E);
    const M = mkMeter(Wd, -2.7, HZ);
    const RC = [0, .9, HZ + .35], RR = .95;                                                     // circular arrow "שוב" in front of the cards
    const ringD = mkDots(Wd, 12, 0x3f9a4a, .035);
    const head = cyl(0, .09, .18, 0x3f9a4a); Wd.add(head);
    const dH = mkDots(Wd, 3, 0xd9a63a, .035);
    const tS = tag(Wd, 'לחזור ולהבדיל', 'green', 2.6);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      animScene(E, t);
      const refill = sm(P(.4, 2.4, t));
      G.setLevel(.3 + .7 * refill); G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: .2 + .6 * refill, look: [.5, 0] });
      HAM.f.set(t, { talk: .4 * talkAmt(t, SEED_H), smile: .5, look: [1, 0] });
      HAG.f.set(t, { talk: 0, smile: -.1, look: [1, 0] });
      flow(dH, [1.2, TOPY + .55, HZ], [EAR_X - .3, TOPY + .6, HZ], refill, 0xd9a63a, t);          // gold sound reaches the ear now
      M.set(.02 + .98 * sm(P(1.6, 4.4, t)));
      EAR.f.set(t, { talk: .4 * talkAmt(t, SEED_E), smile: .3 + .6 * sm(P(3.5, 5.0, t)), look: [-.5, 0] });
      ringD.forEach((d, i) => {
        const a = i * 2 * PI / 12 + .3 * t;
        d.position.set(RC[0] + RR * Math.cos(a), RC[1] + RR * Math.sin(a), RC[2]);
        d.scale.setScalar(Math.max(.001, popE(P(.2, 1.0, t))));
      });
      const ha = t * .7;
      head.position.set(RC[0] + RR * Math.cos(ha), RC[1] + RR * Math.sin(ha), RC[2]);
      head.rotation.z = ha; head.scale.setScalar(Math.max(.001, popE(P(.4, 1.2, t))));
      tS.set([0, 2.2, HZ], popE(P(.6, 1.2, t)) * NUM, 0);
      chk.set([1.8, 1.85, HZ], popE(P(4.6, 5.2, t)) * .6, .04 * Math.sin(t * 3));
      sk.set([1.8, 1.85, HZ], P(4.6, 5.4, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [tS.g, chk.g];
    Wd.cam = std(20, { wide: [0, 1.2, 0], wd: 6.8, med: [0, 1.3, HZ], pm: 4.6, ins: [1.2, 1.3, HZ], pi: 4.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (good): split recap - left the gold "המבדיל" heard: green check "יצא"; right the purple "הגפן" only: red cross "לא יצא"; tag "בלי ״המבדיל״ - לא"
  function s6(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GX, GZ, SEED_G);
    const HAM = mkCard(Wd, -1.5, HZ, CARD.gold, SEED_H), HAG = mkCard(Wd, 1.4, HZ, CARD.purple, SEED_P);
    Wd.add(box(.04, 1.4, .04, 0xffffff, { pos: [0, TOPY + .7, HZ], ink: false }));              // split line
    const tG = tagS(Wd, 'המבדיל', 'gold', .9), tH = tagS(Wd, 'הגפן', 'blue', .8);
    const tAns = tag(Wd, 'בלי ״המבדיל״ - לא', 'red', 2.9);
    const chkL = mark3d(Wd, 'check', .6), crsR = mark3d(Wd, 'cross', .6), skL = shock(Wd, 0x6dff9a), skR = shock(Wd, 0xff6a6a);
    Wd.on(t => {
      animScene(E, t);
      G.setLevel(1); G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: .2, look: [0, 0] });
      const hi = sm(P(.4, 1.6, t));
      HAM.g.scale.setScalar(Math.max(.001, 1.2 * popE(P(.2, 1.0, t))));
      HAM.f.set(t, { talk: .4 * talkAmt(t, SEED_H), smile: .5 + .5 * hi, look: [-1, 0] });
      HAG.g.scale.setScalar(Math.max(.001, .9 * popE(P(.6, 1.4, t))));
      HAG.f.set(t, { talk: 0, smile: -.4, look: [1, 0], surprise: sm(P(4.0, 4.6, t)) });
      tG.set([-1.5, 1.6, HZ], popE(P(.6, 1.2, t)) * .8, 0);
      tH.set([1.4, 1.6, HZ], popE(P(.8, 1.4, t)) * .8, 0);
      chkL.set([-1.5, 1.95, HZ], popE(P(3.2, 4.0, t)) * .6, .04 * Math.sin(t * 3));
      skL.set([-1.5, 1.95, HZ], P(3.2, 4.6, t), 1.0);
      crsR.set([1.4, 1.95, HZ], popE(P(4.2, 5.0, t)) * .6, .04 * Math.sin(t * 3));
      skR.set([1.4, 1.95, HZ], P(4.2, 5.6, t), 1.0);
      tAns.set([0, 2.3, HZ], popE(P(2.6, 3.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tAns.g, chkL.g, crsR.g];
    Wd.cam = std(24, { wide: [0, 1.3, 0], wd: 6.6, med: [0, 1.4, HZ], pm: 4.6, ins: [1.4, 1.5, HZ], pi: 4.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the cup at the front-left, smiling; the gold card "המבדיל" inside a turning dotted circle at the right with a circular arrow "שוב"; slow crane
  function answerBg(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, -2.0, -.2, SEED_G); G.g.scale.setScalar(SC * 1.4 * 1.1); G.setLevel(.8);
    const HAM = mkCard(Wd, 1.7, .3, CARD.gold, SEED_H);
    const C = [1.7, 1.5, .3];
    const ringD = mkDots(Wd, 18, 0xd9a63a, .04);
    const head2 = cyl(0, .08, .16, 0x3f9a4a); Wd.add(head2);
    const tSh = tagS(Wd, 'שוב', 'green', .9);
    Wd.on(t => {
      animScene(E, t);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: 1, look: [.5, 0] });
      HAM.g.position.set(C[0], C[1] + .05 * Math.sin(t * 1.5), C[2]); HAM.g.scale.setScalar(1);
      HAM.f.set(t, { talk: .4 * talkAmt(t, SEED_H), smile: 1, look: [-.5, 0] });
      ringD.forEach((d, i) => {
        const a = i * 2 * PI / 18 + t * .4;
        d.position.set(C[0] + .95 * Math.cos(a), C[1] + .95 * Math.sin(a), C[2]);
        d.scale.setScalar(1 + .3 * Math.sin(t * 3 + i));
      });
      const a2 = t * .5;
      head2.position.set(C[0] + .95 * Math.cos(a2), C[1] + .95 * Math.sin(a2), C[2]); head2.rotation.z = a2;
      tSh.set([C[0], C[1] + 1.35, C[2]], .9, 0);
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
