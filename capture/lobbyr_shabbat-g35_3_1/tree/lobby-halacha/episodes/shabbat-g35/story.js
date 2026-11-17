// shabbat-g35 story (16/11/2026) - kos pagum after kiddush, section C of storyboards_v17.md.
// Objects only, no people: kiddush goblet (silver, dark-red wine, face, notch on the rim), 5 small cups (mesubim, faces),
// a wine bottle (face, tag "יין"), a blue shield for the "bedieved" case.
// Built from shabbat-g34 (camera, face, tag helpers, Shabbat table set kept).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, lowHero, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TOPY = .8, NUM = .6;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], pink: ['#ffe0ec', '#8a1a4a', '#e0508a'] };
  const SC = 1.35, SM = 2.24;                                   // goblet scale, small-cup scale
  const GOB = [0, 0];
  const GRIM_Y = TOPY + .43 * SC;                              // goblet rim (world height)
  const MOUTH_Y = TOPY + .19 * SM;                             // small cup mouth (world height)
  const ROW = [[-1.6, -.55], [-.8, -.55], [0, -.55], [.8, -.55], [1.6, -.55]];       // the row, behind the goblet
  const GATHER = [[-.5, .2], [.5, .2], [-.5, -.45], [.5, -.45], [0, -.75]];           // the household gathers round the goblet
  const ANS_CUPS = [[1.6, .35], [2.15, -.05], [2.6, .4], [1.9, -.55], [2.7, -.45]];
  const SEED_G = 31, SEEDS_S = [32, 33, 34, 35, 36], SEED_BOT = 37;

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

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g34)
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
  // a stream of moving dots from A to B; on = 0..1 strength; flowing, not random
  const flow = (dots, A, B, on, col, t, ph) => dots.forEach((d, i) => {
    const v = (t * .7 + i / dots.length + (ph || 0)) % 1;
    d.position.set(lerp(A[0], B[0], v), lerp(A[1], B[1], v) + .06 * Math.sin(PI * v), lerp(A[2], B[2], v));
    d.scale.setScalar(Math.max(.001, Math.sin(PI * v) * on));
    d.material.color.setHex(col);
  });
  // idle bob for a hero standing on the table (lift = extra height)
  const place = (o, x, z, t, sd, lift) => { o.g.position.set(x, TOPY + (lift || 0) + .01 * Math.sin(t * 1.7 + sd), z); o.g.rotation.y = .1 * Math.sin(t * .9 + sd); };

  // ---------------------------------------------------------------- the heroes (origin = table top; face on the +z side)
  function mkGoblet(Wd) {                                            // kiddush goblet: silver, dark-red wine, a notch on the rim (hidden by default)
    const g = new THREE.Group(); Wd.add(g); g.position.set(GOB[0], TOPY, GOB[1]); g.scale.setScalar(SC);
    const S = 0xc8ced6;
    g.add(cyl(.11, .11, .02, S, { pos: [0, .01, 0] }));
    g.add(cyl(.025, .025, .2, S, { pos: [0, .12, 0] }));
    g.add(cyl(.12, .085, .2, S, { pos: [0, .33, 0] }));
    const wine = cyl(.112, .09, .18, 0x6a0a1e, { pos: [0, .34, 0] }); g.add(wine);           // wine: bottom at .25, top at .43 when full
    const notch = box(.05, .04, .05, 0x8a8a8a, { pos: [.09, .43, .09], ink: false }); g.add(notch);
    notch.scale.setScalar(.001);
    const fix = ball(.035, 0xffd166, { pos: [.09, .43, .09], ink: false }); g.add(fix); fix.scale.setScalar(.001);
    const glint = ball(.022, 0xffffff, { ink: false }); g.add(glint);                       // the shiny spot that runs round the rim
    const f = face(Wd, { w: .2, parent: g, pos: [0, .33, .1], seed: SEED_G });
    return {
      g, f, notch, fix, glint,
      setLevel(L) { const l = Math.max(.02, L); wine.scale.y = l; wine.position.y = .25 + .09 * l; }
    };
  }
  function mkSmall(Wd, i, x, z) {                                    // one of the five small cups (mesubim); x,z = its place
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(SM);
    const S = 0xd8dde4;
    g.add(cyl(.07, .07, .02, S, { pos: [0, .01, 0] }));
    g.add(cyl(.012, .012, .08, S, { pos: [0, .05, 0] }));
    g.add(cyl(.075, .05, .1, S, { pos: [0, .14, 0] }));
    const wine = cyl(.068, .05, .04, 0x8a1a2a, { pos: [0, .17, 0] }); g.add(wine);
    const f = face(Wd, { w: .12, parent: g, pos: [0, .14, .07], seed: SEEDS_S[i] });
    return { g, f, wine, x, z };
  }
  function mkBottle(Wd, x, z) {                                       // wine bottle with a face; top at .56 local
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(1.1);
    const G = 0x3a5a2a;
    g.add(cyl(.1, .1, .42, G, { pos: [0, .21, 0] }));
    g.add(cyl(.04, .04, .14, G, { pos: [0, .49, 0] }));
    const f = face(Wd, { w: .16, parent: g, pos: [0, .27, .1], seed: SEED_BOT });
    return { g, f };
  }

  // standard four-shot camera: wide -> medium on the action -> insert on the object that carries the halacha -> low hero
  const std = (n, c) => cuts([
    [3.5, HH(truck(c.wide, { dur: 3.5, dist0: c.wd || 6.4, dist1: (c.wd || 6.4) - .2, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4, dist1: 3.0, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6, dist1: 2.5, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4, dist1: 3.6, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the goblet's face, pull out to the table with the five small cups waiting in a row; "?" above
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const G = mkGoblet(Wd), S = ROW.map((p, i) => mkSmall(Wd, i, p[0], p[1]));
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      place(G, GOB[0], GOB[1], t, 1, 0); G.setLevel(1);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      S.forEach((c, i) => { place(c, c.x, c.z, t, i + 2, 0); c.f.set(t, { talk: 0, smile: -.2, look: [0, 0] }); });
      qT.set([0, 1.7 + .05 * Math.sin(t * 2), .15], popE(P(1.0, 1.8, t)) * NUM, .05 * Math.sin(t * 4));
      G.f.set(t, { talk: t > 1 ? .5 * talkAmt(t, SEED_G) : 0, smile: -.5, look: [.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [G.g, qT.g]; Wd.qPos = [0, .15]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([0, 1.2, .15], { dur: 3.6, dist0: .9, dist1: 1.9, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([0, 1.1, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.1, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (good): before kiddush - the small cups slide from a heap into one neat row, one in front of each place; a counter of five green ticks; green check
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const G = mkGoblet(Wd);
    const sx = i => .2 + .3 * i, sz = i => 1 - .1 * i;
    const S = [0, 1, 2, 3, 4].map(i => mkSmall(Wd, i, sx(i), sz(i)));
    const ticks = ROW.map(p => { const b = ball(.05, 0x3f9a4a, { ink: false }); b.position.set(p[0], 1.5, p[1]); Wd.add(b); return b; });
    const tL = tag(Wd, 'לפני הקידוש', 'gold', 1.9), chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      place(G, GOB[0], GOB[1], t, 1, 0); G.setLevel(1);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      S.forEach((c, i) => {
        const v = sm(P(.8 + .3 * i, 2.4 + .3 * i, t));
        c.g.position.set(lerp(sx(i), ROW[i][0], v), TOPY + .35 * Math.sin(PI * v), lerp(sz(i), ROW[i][1], v));
        c.f.set(t, { talk: 0, smile: .2 + .3 * v, look: [0, 0] });
      });
      ticks.forEach((b, i) => b.scale.setScalar(Math.max(.001, popE(P(3.4 + .35 * i, 3.8 + .35 * i, t)))));
      tL.set([0, 1.7, .2], popE(P(1.0, 1.6, t)) * NUM, 0);
      chk.set([1.9, 1.85, .3], popE(P(5.6, 6.2, t)) * .7, .04 * Math.sin(t * 3));
      sk.set([1.9, 1.85, .3], P(5.6, 6.4, t), 1.0);
      G.f.set(t, { talk: t > 1.5 ? .4 * talkAmt(t, SEED_G) : 0, smile: .4 + .4 * sm(P(5.6, 6.2, t)), look: [.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tL.g, chk.g];
    Wd.cam = std(4, { wide: [0, 1.3, 0], med: [.1, 1.2, .1], pm: .5, ins: [.8, 1.1, -.55], pi: .5 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (good): tag "בני הבית" - the small cups gather round the goblet; green dotted straws run from the goblet's own rim to each cup's mouth; the rim stays shiny; green check
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const G = mkGoblet(Wd), S = ROW.map((p, i) => mkSmall(Wd, i, p[0], p[1]));
    const straws = S.map(() => mkDots(Wd, 3, 0x3f9a4a, .035));
    const tB = tag(Wd, 'בני הבית', 'gold', 1.7), chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const RIM = [GOB[0], GRIM_Y, GOB[1]];
    Wd.on(t => {
      place(G, GOB[0], GOB[1], t, 1, 0); G.setLevel(1);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      S.forEach((c, i) => {
        const v = sm(P(.5 + .2 * i, 2.2 + .2 * i, t));
        c.g.position.set(lerp(ROW[i][0], GATHER[i][0], v), TOPY, lerp(ROW[i][1], GATHER[i][1], v));
        flow(straws[i], RIM, [GATHER[i][0], MOUTH_Y, GATHER[i][1]], sm(P(2.6, 3.2, t)), 0x3f9a4a, t, i * .1);
        c.f.set(t, { talk: 0, smile: .5, look: [0, 0] });
      });
      tB.set([0, 1.7, .2], popE(P(1.4, 2.0, t)) * NUM, 0);
      chk.set([1.9, 1.85, .3], popE(P(6.0, 6.6, t)) * .7, .04 * Math.sin(t * 3));
      sk.set([1.9, 1.85, .3], P(6.0, 6.8, t), 1.0);
      G.f.set(t, { talk: t > 1 ? .45 * talkAmt(t, SEED_G) : 0, smile: .6, look: [.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tB.g, chk.g];
    Wd.cam = std(8, { wide: [0, 1.3, 0], med: [.2, 1.3, -.2], pm: 1.1, ins: [-.2, 1.35, .3], pi: .3 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (bad): the goblet drinks first (level drops, a grey notch and tag "פגום" appear on the rim); only then it pours into the row - the poured wine turns dull grey; red cross; tag "כוס פגום"
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const G = mkGoblet(Wd), S = ROW.map((p, i) => mkSmall(Wd, i, p[0], p[1]));
    const streams = S.map(() => mkDots(Wd, 2, 0xe0203a, .035));
    const tP = tag(Wd, 'פגום', 'grey', 1.1), tC = tag(Wd, 'כוס פגום', 'grey', 1.7), cross = mark3d(Wd, 'cross', .6);
    const RIM = [GOB[0], GRIM_Y, GOB[1]];
    Wd.on(t => {
      place(G, GOB[0], GOB[1], t, 1, 0);
      const sip = sm(P(.6, 2.0, t)), pour = sm(P(3.4, 4.8, t));
      G.setLevel(1 - .15 * sip - .15 * pour);
      G.notch.scale.setScalar(Math.max(.001, popE(P(4.2, 4.8, t))));
      tP.set([.6, 1.5, .2], popE(P(4.4, 5.0, t)) * NUM * (1 - sm(P(7.4, 7.8, t))), 0);
      S.forEach((c, i) => {
        flow(streams[i], RIM, [c.x, MOUTH_Y, c.z], sm(P(3.2, 3.8, t)) * (1 - sm(P(6.4, 7.0, t))), t < 4.6 ? 0xe0203a : 0x7a7a7a, t, i * .13);
        c.wine.material.color.setHex(t < 4.6 ? 0x8a1a2a : 0x7a7a7a);
        c.f.set(t, { talk: 0, smile: t > 4.6 ? -.4 : .2, look: [0, 0] });
      });
      cross.set([-.4, 1.95, .3], popE(P(6.2, 6.8, t)) * .6, .05 * Math.sin(t * 3));
      tC.set([.5, 1.75, .2], popE(P(6.0, 6.6, t)) * NUM, 0);
      G.f.set(t, { talk: (t > 1 && t < 4.0) ? .45 * talkAmt(t, SEED_G) : 0, smile: -.6, surprise: sm(P(6.2, 6.8, t)), look: [.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tP.g, tC.g, cross.g];
    // insert on the goblet first (sip, notch pops, tag "פגום"), then medium on the grey pour, then wide, then low hero
    Wd.cam = cuts([
      [3.5, HH(truck([.5, 1.3, 0], { dur: 3.5, dist0: 7.6, dist1: 7.4, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 12)],
      [4.0, HH(insert([0, 1.35, .3], { dur: 4.0, dist0: 2.5, dist1: 1.7, h0: .25, h1: .3, a0: -10, a1: 8, fov0: 36, fov1: 34 }), 13)],
      [3.5, HH(punch(pushIn([.1, 1.3, 0], { dur: 3.5, dist0: 3.4, dist1: 3.0, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [.5]), 14)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4, dist1: 3.6, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 15)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (good): order on a board - "1 מוזג לכוסות" then "2 המקדש שותה"; a rewind arrow runs back over the goblet; the goblet pours first (bright red streams into the cups), then drinks; the rim stays shiny; green check
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const G = mkGoblet(Wd), S = ROW.map((p, i) => mkSmall(Wd, i, p[0], p[1]));
    const board = plane(Wd, 2.4, 1.4, (c, W, H) => { c.fillStyle = '#14408f'; c.beginPath(); c.roundRect(W * .02, H * .04, W * .96, H * .92, H * .12); c.fill(); }, 512, [-1.0, 1.7, -.75], 9);
    const s1T = tag(Wd, '1 מוזג לכוסות', 'green', 2.2), s2T = tag(Wd, '2 המקדש שותה', 'orange', 2.2);
    const arc = mkDots(Wd, 10, 0xe07a20, .04);
    const streams = S.map(() => mkDots(Wd, 2, 0xe0203a, .035));
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const RIM = [GOB[0], GRIM_Y, GOB[1]];
    Wd.on(t => {
      place(G, GOB[0], GOB[1], t, 1, 0);
      G.setLevel(1 - .2 * sm(P(2.6, 4.6, t)) - .08 * sm(P(6.0, 6.8, t)));
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      board.scale.setScalar(Math.max(.001, popE(P(.6, 1.2, t))));
      s1T.set([-1.0, 1.93, -.7], popE(P(.9, 1.5, t)) * NUM, 0);
      s2T.set([-1.0, 1.48, -.7], popE(P(4.8, 5.4, t)) * NUM, 0);
      arc.forEach((d, i) => {
        const v = 1 - ((t * .6 + i / arc.length) % 1);            // runs right to left: rewind
        const a = PI * (1 - v);
        d.position.set(.6 * Math.cos(a), 1.5 + .6 * Math.sin(a), .3);
        d.scale.setScalar(Math.max(.001, Math.sin(PI * v) * (1 - sm(P(2.0, 2.4, t)))));
      });
      S.forEach((c, i) => {
        flow(streams[i], RIM, [c.x, MOUTH_Y, c.z], sm(P(2.6, 3.0, t)) * (1 - sm(P(4.8, 5.0, t))), 0xe0203a, t, i * .13);
        c.f.set(t, { talk: 0, smile: .3, look: [0, 0] });
      });
      chk.set([1.6, 1.85, .3], popE(P(8.0, 8.6, t)) * .7, .04 * Math.sin(t * 3));
      sk.set([1.6, 1.85, .3], P(8.0, 8.8, t), 1.0);
      G.f.set(t, { talk: t > 1.5 ? .4 * talkAmt(t, SEED_G) : 0, smile: .4 + .4 * sm(P(8.0, 8.6, t)), look: [.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [s1T.g, s2T.g, chk.g];
    Wd.cam = std(16, { wide: [0, 1.3, 0], med: [-.5, 1.3, .1], pm: .5, ins: [-.2, 1.35, .3], pi: .4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-84 (fix): the notch is on the rim; the wine bottle hops in, pours a small stream into the goblet ("מעט יין"); the notch fills with gold light and vanishes (tag "תיקון"); then the goblet pours bright red into the cups; green check
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const G = mkGoblet(Wd), S = ROW.map((p, i) => mkSmall(Wd, i, p[0], p[1])), B = mkBottle(Wd, -2.6, .25);
    const pour = mkDots(Wd, 3, 0xa0203a, .035), streams = S.map(() => mkDots(Wd, 2, 0xe0203a, .035));
    const tY = tag(Wd, 'יין', 'pink', 1.0), tF = tag(Wd, 'תיקון', 'green', 1.4), tP = tag(Wd, 'פגום', 'grey', 1.1);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const RIM = [GOB[0], GRIM_Y, GOB[1]];
    Wd.on(t => {
      const hop = sm(P(.8, 2.2, t)), back = sm(P(9.0, 10.4, t));
      const bx = lerp(lerp(-2.6, -.45, hop), -2.6, back);
      const bY = TOPY + .4 * Math.sin(PI * hop) + .4 * Math.sin(PI * back);
      const tilt = -.55 * sm(P(3.0, 3.6, t)) * (1 - back);
      B.g.position.set(bx, bY, .25); B.g.rotation.z = tilt;
      B.f.set(t, { talk: (t > 2.4 && t < 4.6) ? .4 * talkAmt(t, SEED_BOT) : 0, smile: .5, look: [.6, 0] });
      tY.set([bx, bY + .7, .25], popE(P(1.4, 2.0, t)) * NUM * (1 - back), 0);
      flow(pour, [bx + .25, 1.36, .25], RIM, sm(P(3.0, 3.4, t)) * (1 - sm(P(4.4, 4.8, t))), 0xa0203a, t);
      place(G, GOB[0], GOB[1], t, 1, 0);
      G.setLevel(.72 + .12 * sm(P(3.0, 4.6, t)) - .1 * sm(P(6.0, 8.4, t)));
      G.notch.material.color.setHex(t < 3.4 ? 0x8a8a8a : 0xffd166);
      G.notch.scale.setScalar(Math.max(.001, 1 - sm(P(4.0, 4.8, t))));
      G.fix.scale.setScalar(Math.max(.001, Math.sin(PI * P(3.2, 5.2, t)) * 1.4));
      tF.set([0, 1.7, .2], popE(P(4.6, 5.2, t)) * NUM, 0);
      tP.set([.6, 1.5, .2], popE(P(.2, .8, t)) * NUM * (1 - sm(P(4.6, 5.2, t))), 0);
      S.forEach((c, i) => {
        flow(streams[i], RIM, [c.x, MOUTH_Y, c.z], sm(P(6.0, 6.6, t)) * (1 - sm(P(8.6, 9.2, t))), 0xe0203a, t, i * .13);
        c.f.set(t, { talk: 0, smile: .2, look: [0, 0] });
      });
      chk.set([1.9, 1.85, .3], popE(P(9.4, 10.0, t)) * .7, .04 * Math.sin(t * 3));
      sk.set([1.9, 1.85, .3], P(9.4, 10.2, t), 1.0);
      G.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, SEED_G) : 0, smile: -.2 + .8 * sm(P(4.6, 5.4, t)), look: [.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tY.g, tF.g, tP.g, chk.g];
    Wd.cam = std(20, { wide: [0, 1.3, 0], wd: 7.4, med: [-.5, 1.3, .1], pm: .5, ins: [-.1, 1.35, .3], pi: .6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 84-98 (good, the soft case): a small cup drank from a grey "פגום" cup and sips; a big calm blue shield with tag "בדיעבד - אינו מעכב"; the cup smiles; green check
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const G = mkGoblet(Wd), S = ROW.map((p, i) => mkSmall(Wd, i, p[0], p[1]));
    const shield = cyl(.45, .45, .04, 0x2f6ad0, { pos: [0, 1.35, -.95], ink: false }); shield.rotation.x = PI / 2; Wd.add(shield);
    const tB = tag(Wd, 'בדיעבד - אינו מעכב', 'blue', 2.6), tP = tag(Wd, 'פגום', 'grey', 1.1), chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    S[2].wine.material.color.setHex(0x7a7a7a);
    Wd.on(t => {
      place(G, GOB[0], GOB[1], t, 1, 0); G.setLevel(.72);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      S[2].g.rotation.z = .35 * Math.sin(PI * P(2.0, 3.0, t));
      tP.set([0, 1.45, -.55], popE(P(.6, 1.2, t)) * NUM, 0);
      shield.scale.setScalar(Math.max(.001, popE(P(3.4, 4.0, t)) * (1 + .02 * Math.sin(t * 2))));
      tB.set([0, 1.95, -.9], popE(P(3.6, 4.4, t)) * NUM, 0);
      chk.set([1.8, 1.8, .3], popE(P(7.6, 8.2, t)) * .7, .04 * Math.sin(t * 3));
      sk.set([1.8, 1.8, .3], P(7.6, 8.4, t), 1.0);
      S.forEach((c, i) => {
        if (i === 2) c.f.set(t, { talk: t > 4.4 ? .4 * talkAmt(t, SEEDS_S[2]) : 0, smile: -.2 + 1.2 * sm(P(4.4, 5.2, t)), look: [0, 0] });
        else c.f.set(t, { talk: 0, smile: .2, look: [0, 0] });
      });
      G.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, SEED_G) : 0, smile: .5, look: [.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tB.g, tP.g, chk.g];
    Wd.cam = std(24, { wide: [0, 1.3, 0], wd: 7.0, med: [.2, 1.2, -.4], pm: .6, ins: [0, 1.1, -.55], pi: .5 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 98-120: three-step diagram standing at the back ("כוסות לכולם", "מוזגים לפני ששותה", "מוסיפים יין") with a moving arrow of dots; goblet and small cups at the sides; slow crane
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    // the three-step diagram was too small and hidden under the answer card: dropped; the goblet and cups stand at the sides, larger
    const G = mkGoblet(Wd), S = ANS_CUPS.map((p, i) => mkSmall(Wd, i, p[0], p[1]));
    G.g.scale.setScalar(SC * 1.5);
    S.forEach(c => c.g.scale.setScalar(SM * 1.2));
    Wd.on(t => {
      place(G, -2.0, GOB[1], t, 1, 0); G.setLevel(1);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      S.forEach((c, i) => c.f.set(t, { talk: .25 * talkAmt(t, SEEDS_S[i]), smile: .8, look: [-.5, 0] }));
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: 1, look: [.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
