// shabbat-g36 story (17/11/2026) - havdala: only wine or grape juice, not beer or coffee; no chamar medina today;
// no wine - wait for Sunday, only then coffee. Section C of storyboards_v18.md.
// Objects only, no people. Copied from shabbat-g35 (table, cloth, goblet with a face, bottle with a face, tag helpers).
// Night set: dark-blue window with three stars, braided havdala candle with a flickering flame, besamim box.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, lowHero, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TOPY = .8, NUM = .6;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], pink: ['#ffe0ec', '#8a1a4a', '#e0508a'] };
  const SC = 1.35;
  const GOB_X = 0, GOB_Z = 0;
  const GRIM_Y = TOPY + .43 * SC;                              // goblet rim (world height)
  const SEED_G = 31, SEED_W = 32, SEED_J = 33, SEED_M = 34, SEED_C = 35;
  const SHOPS = [[-1.1, 1.55], [-.37, 1.55], [.37, 1.55], [1.1, 1.55], [-1.1, 1.9], [-.37, 1.9], [.37, 1.9], [1.1, 1.9]];

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

  // ---------------------------------------------------------------- billboards / tags / boards (same pattern as shabbat-g35)
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
  const drawBoard = (bg, ink, label, size) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .02, H * .04, W * .96, H * .92, H * .12); c.fill();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${H * (size || .36)}px ${FONT}`; c.fillStyle = ink; c.fillText(label, W / 2, H * .5);
  };
  const drawTile = (kind) => (c, W, H) => {
    if (kind === 'moon') { c.fillStyle = '#1f2f6b'; c.fillRect(0, 0, W, H); c.fillStyle = '#fff4c2'; c.beginPath(); c.arc(W * .7, H * .6, H * .2, 0, 2 * PI); c.fill(); }
    else { c.fillStyle = '#ffe9a8'; c.fillRect(0, 0, W, H); c.fillStyle = '#f5a623'; c.beginPath(); c.arc(W * .7, H * .6, H * .22, 0, 2 * PI); c.fill(); }
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${H * .14}px ${FONT}`; c.fillStyle = kind === 'moon' ? '#ffffff' : '#5a3a00';
    c.fillText(kind === 'moon' ? 'מוצאי שבת' : 'יום ראשון', W / 2, H * .17);
  };
  // idle bob for a hero standing on the table
  const place = (o, x, z, t, sd, lift) => { o.g.position.set(x, TOPY + (lift || 0) + .01 * Math.sin(t * 1.7 + sd), z); o.g.rotation.y = .1 * Math.sin(t * .9 + sd); };

  // ---------------------------------------------------------------- the heroes (origin = table top; face on the +z side)
  function mkGoblet(Wd, x, z) {                                      // havdala goblet: silver, wine level set by setLevel
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(SC);
    const S = 0xc8ced6;
    g.add(cyl(.11, .11, .02, S, { pos: [0, .01, 0] }));
    g.add(cyl(.025, .025, .2, S, { pos: [0, .12, 0] }));
    g.add(cyl(.12, .085, .2, S, { pos: [0, .33, 0] }));
    const wine = cyl(.112, .09, .18, 0x6a0a1e, { pos: [0, .34, 0] }); g.add(wine);
    const glint = ball(.022, 0xffffff, { ink: false }); g.add(glint);
    const f = face(Wd, { w: .2, parent: g, pos: [0, .33, .1], seed: SEED_G });
    return {
      g, f, glint, x, z,
      setLevel(L) { const l = Math.max(.02, L); wine.scale.y = l; wine.position.y = .25 + .09 * l; }
    };
  }
  function mkBottle(Wd, x, z, col, seed) {                           // wine / grape-juice bottle with a face; mouth at .62 local
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(1.1);
    g.add(cyl(.1, .1, .42, col, { pos: [0, .21, 0] }));
    g.add(cyl(.04, .04, .14, col, { pos: [0, .49, 0] }));
    const f = face(Wd, { w: .16, parent: g, pos: [0, .27, .1], seed });
    return { g, f, x, z };
  }
  const mouthOf = (x, z, a) => [x - .62 * Math.sin(a), TOPY + .62 * Math.cos(a), z];   // bottle mouth when tilted by a
  function mkMug(Wd, x, z, seed, crownOn) {                          // beer mug, white foam, face; crown on the head (optional)
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(1.1);
    const M = 0xe0a030;
    g.add(cyl(.14, .14, .3, M, { pos: [0, .15, 0] }));
    g.add(box(.06, .16, .06, M, { pos: [.17, .15, 0] }));                            // handle
    const foam = ball(.15, 0xfffdf5, { pos: [0, .34, 0] }); foam.scale.set(1, .45, 1); g.add(foam);
    const crown = cyl(.13, .17, .12, 0xffd166, { pos: [0, .47, 0] }); g.add(crown);
    crown.scale.setScalar(crownOn ? 1 : .001);
    const f = face(Wd, { w: .14, parent: g, pos: [0, .14, .15], seed });
    return { g, f, crown, x, z };
  }
  function mkCup(Wd, x, z, seed) {                                   // coffee cup with a face and rising steam
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(1.2);
    const W = 0xf4f0e6;
    g.add(cyl(.18, .18, .02, W, { pos: [0, .01, 0] }));                              // saucer
    g.add(cyl(.11, .08, .2, W, { pos: [0, .12, 0] }));                               // cup
    g.add(cyl(.1, .1, .02, 0x4a2412, { pos: [0, .21, 0] }));                         // coffee top
    g.add(box(.05, .1, .05, W, { pos: [.12, .12, 0] }));                             // handle
    const f = face(Wd, { w: .12, parent: g, pos: [0, .12, .1], seed });
    const steam = mkDots(Wd, 4, 0xdddddd, .035);
    return { g, f, steam, x, z };
  }

  // standard four-shot camera: wide -> medium on the action -> insert on the object that carries the halacha -> low hero
  // Z = pull-back factor (18/11): every distance is multiplied, so tags and panels stay inside the frame (max wide distance 9.5 <= 12)
  const Z = 1.35;
  const std = (n, c) => cuts([
    [3.5, HH(truck(c.wide, { dur: 3.5, dist0: (c.wd || 6.4) * Z, dist1: ((c.wd || 6.4) - .2) * Z, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4 * Z, dist1: 3.0 * Z, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6 * Z, dist1: 2.5 * Z, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4 * Z, dist1: 3.6 * Z, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the empty goblet's worried face, pull out; empty bottle on its side; beer and coffee hop ("pick me"); "?" above
  function hook(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GOB_X, GOB_Z);
    const W = mkBottle(Wd, 1.8, -.2, 0x2d4a24, SEED_W);
    W.g.position.y = TOPY + .11; W.g.rotation.z = PI / 2;                            // lying on its side, face still to camera
    const B = mkMug(Wd, -1.3, .5, SEED_M, false), C = mkCup(Wd, 1.3, .5, SEED_C);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      animScene(E, t);
      G.setLevel(.02);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: t > 1 ? .5 * talkAmt(t, SEED_G) : 0, smile: -.5, look: [.6, 0] });
      const a = ease.sm(P(1.0, 2.0, t));
      B.g.position.set(-1.3, TOPY + a * .3 * Math.abs(Math.sin(t * 3.2)), .5);
      C.g.position.set(1.3, TOPY + a * .3 * Math.abs(Math.sin(t * 3.2 + 1.5)), .5);
      B.f.set(t, { talk: a * .6 * talkAmt(t, SEED_M), smile: .6, look: [-.4, 0] });
      C.f.set(t, { talk: a * .6 * talkAmt(t, SEED_C), smile: .6, look: [.4, 0] });
      flow(C.steam, [1.3, TOPY + .3, .5], [1.3, TOPY + .9, .5], 1, 0xdddddd, t);
      W.f.set(t, { talk: 0, smile: -.4, look: [0, 0] });
      qT.set([0, 1.7 + .05 * Math.sin(t * 2), .15], popE(P(1.0, 1.8, t)) * NUM, .05 * Math.sin(t * 4));
    });
    Wd.center = [0, 0]; Wd.occ = [G.g, qT.g]; Wd.qPos = [0, .15]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([0, 1.2, .15], { dur: 3.6, dist0: .9, dist1: 1.9, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([0, 1.1, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.1, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (good): the wine bottle and the grape-juice bottle slide in from both sides; a red stream pours into the goblet, the level rises, the goblet smiles; tags "יין" and "מיץ ענבים"; green check
  function s1(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GOB_X, GOB_Z);
    const WB = mkBottle(Wd, -1.7, .3, 0x2d4a24, SEED_W), JB = mkBottle(Wd, 1.7, .3, 0x9a6ac0, SEED_J);
    const wineP = mkDots(Wd, 3, 0x7a0a1e, .035), juiceP = mkDots(Wd, 3, 0xb07ad0, .03);
    const tW = tag(Wd, 'יין', 'pink', 1.0), tJ = tag(Wd, 'מיץ ענבים', 'orange', 1.7);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      animScene(E, t);
      const hl = sm(P(.6, 2.6, t)), hr = sm(P(.9, 2.9, t));
      const ta = -.7 * sm(P(3.2, 3.8, t)) * (1 - sm(P(7.6, 8.2, t)));
      const tb = .7 * sm(P(5.4, 6.2, t)) * (1 - sm(P(8.6, 9.2, t)));
      const xl = lerp(-4.2, -1.7, hl), xr = lerp(4.2, 1.7, hr);
      WB.g.position.set(xl, TOPY, .3); WB.g.rotation.z = ta;
      JB.g.position.set(xr, TOPY, .3); JB.g.rotation.z = tb;
      flow(wineP, mouthOf(xl, .3, ta), [GOB_X, GRIM_Y, GOB_Z], sm(P(3.4, 3.8, t)) * (1 - sm(P(7.4, 7.8, t))), 0x7a0a1e, t);
      flow(juiceP, mouthOf(xr, .3, tb), [GOB_X, GRIM_Y, GOB_Z], sm(P(5.6, 6.0, t)) * (1 - sm(P(8.6, 8.9, t))), 0xb07ad0, t, .3);
      G.setLevel(.05 + .45 * sm(P(3.6, 6.0, t)) + .5 * sm(P(6.2, 8.0, t)));
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      place(G, GOB_X, GOB_Z, t, 1, 0);
      tW.set([xl, 1.7, .2], popE(P(2.0, 2.6, t)) * NUM, 0);
      tJ.set([Math.min(xr, 1.1), 1.7, .2], popE(P(5.0, 5.6, t)) * NUM, 0);
      chk.set([0, 1.8, .3], popE(P(8.4, 9.0, t)) * .7, .04 * Math.sin(t * 3));
      sk.set([0, 1.8, .3], P(8.4, 9.2, t), 1.0);
      WB.f.set(t, { talk: (t > 2.4 && t < 4.4) ? .4 * talkAmt(t, SEED_W) : 0, smile: .5, look: [.4, 0] });
      JB.f.set(t, { talk: (t > 5.6 && t < 8.6) ? .4 * talkAmt(t, SEED_J) : 0, smile: .5, look: [-.4, 0] });
      G.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, SEED_G) : 0, smile: .2 + .6 * sm(P(7.0, 8.4, t)), look: [.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tW.g, tJ.g, chk.g];
    Wd.cam = std(4, { wide: [0, 1.3, 0], med: [-.5, 1.2, .1], pm: .5, ins: [0, 1.35, .3], pi: .5 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (bad): the beer mug, then the coffee cup, hop up to pour into the goblet - a clear pane flashes in front of the goblet each time, the stream stops at it; a red cross each time; tag "מן הדין - לא"
  function s2(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GOB_X, GOB_Z);
    const BM = mkMug(Wd, -3.0, .3, SEED_M, false), CU = mkCup(Wd, 3.0, .3, SEED_C);
    const pane = box(.8, .8, .03, 0xbfe9ff, { pos: [0, 1.25, .4], ink: false }); Wd.add(pane); pane.scale.setScalar(.001);
    const beerP = mkDots(Wd, 3, 0xe0a030, .035), coffP = mkDots(Wd, 3, 0x4a2412, .035);
    const x1 = mark3d(Wd, 'cross', .5), x2 = mark3d(Wd, 'cross', .5);
    const tB = tag(Wd, 'בירה', 'orange', 1.0), tC = tag(Wd, 'קפה', 'blue', 1.0), tBad = tag(Wd, 'מן הדין - לא', 'pink', 2.2);
    const PT = [0, 1.25, .4];
    Wd.on(t => {
      animScene(E, t);
      place(G, GOB_X, GOB_Z, t, 1, 0);
      G.setLevel(1);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      // beer: hop in, tilt, pour (blocked), hop back
      const hopB = sm(P(.8, 2.4, t)), backB = sm(P(4.8, 6.2, t));
      const bxB = lerp(lerp(-3.0, -.8, hopB), -3.0, backB);
      const tiltB = -.6 * sm(P(2.9, 3.3, t)) * (1 - sm(P(4.2, 4.6, t)));
      BM.g.position.set(bxB, TOPY + .5 * Math.sin(PI * Math.min(1, hopB)), .3); BM.g.rotation.z = tiltB;
      flow(beerP, [bxB - .4 * Math.sin(tiltB), TOPY + .4 * Math.cos(tiltB) + .1, .3], PT, sm(P(2.9, 3.3, t)) * (1 - sm(P(4.2, 4.6, t))), 0xe0a030, t);
      tB.set([bxB, 1.6, .2], popE(P(1.0, 1.6, t)) * NUM * (1 - sm(P(6.4, 7.0, t))), 0);
      // coffee: hop in, tilt, pour (blocked), hop back
      const hopC = sm(P(5.8, 7.4, t)), backC = sm(P(10.0, 11.8, t));
      const bxC = lerp(lerp(3.0, .8, hopC), 3.0, backC);
      const tiltC = .6 * sm(P(8.0, 8.8, t)) * (1 - sm(P(9.6, 10.0, t)));
      CU.g.position.set(bxC, TOPY + .5 * Math.sin(PI * Math.min(1, hopC)), .3); CU.g.rotation.z = tiltC;
      flow(coffP, [bxC - .25 * Math.sin(tiltC) - .1, TOPY + .3, .3], PT, sm(P(8.0, 8.4, t)) * (1 - sm(P(9.6, 9.8, t))), 0x4a2412, t, .2);
      flow(CU.steam, [bxC, TOPY + .3, .3], [bxC, TOPY + .9, .3], 1, 0xdddddd, t);
      tC.set([bxC, 1.5, .2], popE(P(6.0, 6.6, t)) * NUM * (1 - sm(P(12.4, 12.8, t))), 0);
      // the pane flashes each time something pours into it
      pane.scale.setScalar(Math.max(.001, Math.sin(PI * P(2.9, 4.6, t)), Math.sin(PI * P(8.0, 9.8, t))));
      x1.set([0, 1.9, .45], popE(P(4.2, 4.8, t)) * .6 * (1 - sm(P(6.8, 7.2, t))), .05 * Math.sin(t * 3));
      x2.set([0, 1.9, .45], popE(P(9.4, 10.0, t)) * .6, .05 * Math.sin(t * 3));
      tBad.set([0, 2.25, .2], popE(P(3.4, 4.0, t)) * NUM, 0);
      BM.f.set(t, { talk: (t > .8 && t < 4.6) ? .5 * talkAmt(t, SEED_M) : 0, smile: -.3, look: [.5, 0] });
      CU.f.set(t, { talk: (t > 5.8 && t < 10.0) ? .5 * talkAmt(t, SEED_C) : 0, smile: -.3, look: [-.5, 0] });
      G.f.set(t, { talk: (t > 1 && t < 4.0) ? .45 * talkAmt(t, SEED_G) : 0, smile: -.6, surprise: sm(P(4.2, 4.8, t)), look: [.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tBad.g, x1.g, x2.g, tB.g, tC.g];
    Wd.cam = std(8, { wide: [0, 1.3, 0], med: [-.6, 1.3, .2], pm: 1.0, ins: [0, 1.3, .4], pi: 1.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (neutral): a town-map board stands up behind the table; the shops light up one after another, each with a wine bottle (8 = "יין מצוי"); the beer mug wears a paper crown tagged "חמר מדינה" - as the map fills the crown turns grey and slides off the mug
  function s3(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, GOB_X, GOB_Z);
    const WB = mkBottle(Wd, 1.9, .3, 0x2d4a24, SEED_W);
    const BM = mkMug(Wd, -2.2, .3, SEED_M, true);
    const drawMap = (c, W, H) => {
      c.fillStyle = '#f3e6c4'; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#c9b48a'; c.lineWidth = H * .04;
      c.beginPath(); c.moveTo(0, H * .45); c.lineTo(W, H * .5); c.moveTo(W * .5, 0); c.lineTo(W * .45, H); c.stroke();
    };
    plane(Wd, 2.6, 1.5, drawMap, 900, [0, 1.45, -.7], 9);
    const shops = SHOPS.map(p => {
      const b = box(.3, .22, .14, 0x9a9a9a, { pos: [p[0], p[1], -.45] }); Wd.add(b);
      const lt = ball(.06, 0xc0203a, { pos: [p[0], p[1] + .2, -.45], ink: false }); Wd.add(lt); lt.scale.setScalar(.001);
      return { b, lt };
    });
    const tCrown = tag(Wd, 'חמר מדינה', 'gold', 1.9), tYain = tag(Wd, 'יין מצוי', 'orange', 1.6);   // (tags pulled in to x +-1.5, see below)
    Wd.on(t => {
      animScene(E, t);
      place(G, GOB_X, GOB_Z, t, 1, 0); G.setLevel(1);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      shops.forEach((s, i) => {
        const t0 = 1.0 + .5 * i;
        s.lt.scale.setScalar(Math.max(.001, popE(P(t0, t0 + .4, t))));
        s.b.material.color.setHex(t > t0 + .2 ? 0xc0203a : 0x9a9a9a);
      });
      const s = sm(P(5.4, 7.0, t));
      BM.crown.material.color.setHex(t < 5.4 ? 0xffd166 : 0x8a8a8a);
      BM.crown.position.set(.4 * s, .47 - .35 * s, 0);
      BM.g.rotation.z = .08 * Math.sin(t * 2);
      tCrown.set([-1.5, 1.75, .3], popE(P(2.4, 3.0, t)) * NUM, 0);
      tYain.set([.8, 1.75, .3], popE(P(1.4, 2.0, t)) * NUM, 0);
      WB.f.set(t, { talk: (t > 3 && t < 6) ? .4 * talkAmt(t, SEED_W) : 0, smile: .3, look: [-.4, 0] });
      BM.f.set(t, { talk: (t > 2.4) ? .5 * talkAmt(t, SEED_M) : 0, smile: t > 5.4 ? -.4 : .2, look: [.4, 0] });
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: .4, look: [.3, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tCrown.g, tYain.g];
    Wd.cam = std(12, { wide: [0, 1.4, 0], wd: 6.8, med: [-1.0, 1.3, -.2], pm: 1.0, ins: [-2.2, 1.2, .3], pi: .8 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (bad): two boards - "פעם" (sepia): a barrel with a gold crown; "בזמננו" (bright): the same barrel, the crown slot above it is an empty dotted outline; a moving arrow from one board to the other; the beer and the coffee stand at the side with no crown; tag "אין חמר מדינה"
  function s4(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const boardL = plane(Wd, 1.9, 1.1, drawBoard('#c9a878', '#5a3a1a', 'פעם'), 900, [-1.25, 1.45, -.7], 9);
    const boardR = plane(Wd, 1.9, 1.1, drawBoard('#bfe9ff', '#14408f', 'בזמננו'), 900, [1.25, 1.45, -.7], 9);
    Wd.add(cyl(.3, .3, .55, 0x8a5a2a, { pos: [-2.0, TOPY + .275, .2] }));                  // barrel, with crown
    Wd.add(cyl(.22, .3, .12, 0xffd166, { pos: [-2.0, TOPY + .61, .2] }));
    Wd.add(cyl(.3, .3, .55, 0x8a5a2a, { pos: [2.0, TOPY + .275, .2] }));                   // barrel, no crown
    const slot = mkDots(Wd, 8, 0xe0a030, .03);                                              // the empty crown slot
    const arrow = mkDots(Wd, 8, 0xe07a20, .035);
    const BM = mkMug(Wd, 1.0, .45, SEED_M, false), CU = mkCup(Wd, 2.9, .45, SEED_C);
    const tNo = tag(Wd, 'אין חמר מדינה', 'pink', 2.4);
    Wd.on(t => {
      animScene(E, t);
      boardL.scale.setScalar(Math.max(.001, popE(P(.6, 1.2, t))));
      boardR.scale.setScalar(Math.max(.001, popE(P(.8, 1.4, t))));
      slot.forEach((d, i) => {
        const a = i * PI / 4;
        d.position.set(2.0 + .22 * Math.cos(a), TOPY + .72 + .1 * Math.sin(a), .2);
        d.scale.setScalar(Math.max(.001, popE(P(1.6, 2.0, t)) * (.6 + .4 * Math.sin(t * 4 + i))));
      });
      flow(arrow, [-.55, 1.45, -.3], [.55, 1.45, -.3], sm(P(2.0, 2.6, t)), 0xe07a20, t);
      BM.g.position.set(1.0, TOPY + .01 * Math.sin(t * 1.7), .45); BM.g.rotation.y = .1 * Math.sin(t * .9);
      CU.g.position.set(2.9, TOPY + .01 * Math.sin(t * 1.5 + 1), .45);
      tNo.set([0, 2.0, .2], popE(P(5.0, 5.6, t)) * NUM, 0);
      BM.f.set(t, { talk: (t > 1.5) ? .5 * talkAmt(t, SEED_M) : 0, smile: -.3, look: [-.4, 0] });
      CU.f.set(t, { talk: (t > 3.5) ? .5 * talkAmt(t, SEED_C) : 0, smile: -.3, look: [-.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tNo.g];
    Wd.cam = std(16, { wide: [0, 1.3, 0], med: [.6, 1.2, .1], pm: .6, ins: [1.3, 1.3, .2], pi: .8 });
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-84 (good): a timeline of two tiles: "מוצאי שבת" (moon) -> arrow -> "יום ראשון" (sun); the goblet waits on the first tile while the clock hands spin; on the Sunday tile a full wine bottle hops in from a little shop and pours bright red; green check
  function s5(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    plane(Wd, 1.9, 1.2, drawTile('moon'), 900, [-1.8, 1.45, -.7], 9);
    plane(Wd, 1.9, 1.2, drawTile('sun'), 900, [1.8, 1.45, -.7], 9);
    const G = mkGoblet(Wd, -1.8, .2);
    const WB = mkBottle(Wd, 2.5, .35, 0x2d4a24, SEED_W);
    Wd.add(box(.6, .5, .5, 0xe0a060, { pos: [2.9, TOPY + .25, .2] }));                  // little shop
    const clockG = new THREE.Group(); clockG.position.set(-1.8, 2.05, -.45); Wd.add(clockG);
    clockG.add(ball(.22, 0xfffdf5));
    const hA = new THREE.Group(), hB = new THREE.Group(); clockG.add(hA); clockG.add(hB);
    hA.add(box(.03, .18, .03, 0x222222, { pos: [0, .09, .03], ink: false }));
    hB.add(box(.03, .12, .03, 0x222222, { pos: [0, .06, .03], ink: false }));
    const arrow = mkDots(Wd, 6, 0xe07a20, .035), pour = mkDots(Wd, 3, 0xa0203a, .035);
    const puddle = cyl(.2, .2, .01, 0x7a0a1e, { pos: [1.2, TOPY + .005, .4], ink: false }); Wd.add(puddle); puddle.scale.setScalar(.001);
    const tY = tag(Wd, 'יין', 'pink', 1.0), chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      animScene(E, t);
      flow(arrow, [-.8, 1.45, -.5], [.8, 1.45, -.5], sm(P(1.6, 2.2, t)), 0xe07a20, t);
      hA.rotation.z = -t * 1.5; hB.rotation.z = -t * .2;
      place(G, -1.8, .2, t, 1, 0); G.setLevel(.12);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .4 * talkAmt(t, SEED_G), smile: 0, look: [.5, 0] });
      const hop = sm(P(.8, 2.4, t)), back = 0;
      const bx = lerp(2.5, 1.7, hop);
      const tilt = .7 * sm(P(3.6, 4.2, t)) * (1 - sm(P(7.0, 7.6, t)));
      WB.g.position.set(bx, TOPY + .35 * Math.sin(PI * hop), .35); WB.g.rotation.z = tilt;
      flow(pour, mouthOf(bx, .35, tilt), [1.2, TOPY + .02, .4], sm(P(3.8, 4.2, t)) * (1 - sm(P(7.0, 7.4, t))), 0xa0203a, t);
      puddle.scale.setScalar(Math.max(.001, sm(P(4.2, 6.6, t))));
      tY.set([bx, 1.75, .25], popE(P(2.6, 3.2, t)) * NUM * (1 - sm(P(7.6, 8.0, t))), 0);
      chk.set([0, 1.9, .3], popE(P(6.6, 7.2, t)) * .7, .04 * Math.sin(t * 3));
      sk.set([0, 1.9, .3], P(6.6, 7.4, t), 1.0);
      WB.f.set(t, { talk: (t > 3 && t < 7) ? .4 * talkAmt(t, SEED_W) : 0, smile: .6, look: [-.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tY.g, chk.g];
    Wd.cam = std(20, { wide: [0, 1.4, 0], wd: 7.4, med: [-.6, 1.3, .1], pm: .6, ins: [1.8, 1.2, .3], pi: .8 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 84-98 (the soft case): the Sunday tile again - the shop shutter is closed, a dotted empty bottle outline with "?"; only now the coffee cup steps up with a soft tag "מוטב משלא יבדיל כלל" and pours into the goblet; a soft green check (smaller)
  function s6(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    plane(Wd, 1.9, 1.2, drawTile('sun'), 900, [1.8, 1.45, -.7], 9);
    const G = mkGoblet(Wd, -.5, 0);
    const CU = mkCup(Wd, .9, .55, SEED_C);
    Wd.add(box(.6, .5, .5, 0xe0a060, { pos: [2.9, TOPY + .25, .2] }));                  // shop
    Wd.add(box(.56, .44, .06, 0x6a6a6a, { pos: [2.9, TOPY + .25, .47] }));              // shutter, closed
    const OUT = [];
    for (let k = 0; k < 7; k++) { OUT.push([1.8 - .09, TOPY + .06 + .07 * k]); OUT.push([1.8 + .09, TOPY + .06 + .07 * k]); }
    OUT.push([1.8 - .03, TOPY + .6], [1.8 + .03, TOPY + .6], [1.8, TOPY + .66]);
    const outline = mkDots(Wd, OUT.length, 0x9a9a9a, .022);
    const tQ = tag(Wd, '?', 'grey', .8);
    const tSoft = tag(Wd, 'מוטב משלא יבדיל כלל', 'blue', 2.6), chk = mark3d(Wd, 'check', .45), sk = shock(Wd, 0x6dff9a);
    const PT = [GOB_X - .5 + .0, GRIM_Y, 0];
    const flowIn = mkDots(Wd, 3, 0x4a2412, .035);
    Wd.on(t => {
      animScene(E, t);
      outline.forEach((d, i) => d.position.set(OUT[i][0], OUT[i][1], .35));
      tQ.set([1.8, 1.45, .35], popE(P(.6, 1.2, t)) * NUM, 0);
      place(G, -.5, 0, t, 1, 0);
      G.setLevel(.3 + .15 * sm(P(4.6, 7.0, t)));
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: .2 + .3 * sm(P(4.6, 6.0, t)), look: [.4, 0] });
      // coffee: step up, tilt, pour into the goblet, step back
      const step = sm(P(1.0, 2.4, t));
      const tilt = .6 * sm(P(2.6, 3.2, t)) * (1 - sm(P(4.4, 5.0, t)));
      CU.g.position.set(lerp(.9, .1, step), TOPY, lerp(.55, .45, step)); CU.g.rotation.z = tilt;
      flow(flowIn, [CU.g.position.x - .25 * Math.sin(tilt) - .1, TOPY + .3, .45], PT, sm(P(2.8, 3.2, t)) * (1 - sm(P(4.4, 4.8, t))), 0x4a2412, t);
      flow(CU.steam, [CU.g.position.x, TOPY + .3, .45], [CU.g.position.x, TOPY + .9, .45], 1, 0xdddddd, t);
      tSoft.set([-.2, 1.7, .3], popE(P(2.8, 3.4, t)) * NUM, 0);
      chk.set([.7, 1.75, .3], popE(P(6.6, 7.2, t)) * .45, .04 * Math.sin(t * 3));
      sk.set([.7, 1.75, .3], P(6.6, 7.4, t), .6);
      CU.f.set(t, { talk: (t > 2.8 && t < 4.8) ? .4 * talkAmt(t, SEED_C) : 0, smile: .4, look: [-.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tSoft.g, chk.g, tQ.g];
    Wd.cam = std(24, { wide: [0, 1.3, 0], wd: 7.0, med: [.2, 1.2, -.4], pm: .6, ins: [.5, 1.2, .3], pi: .8 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 98-120: goblet full, with the wine and grape-juice bottles on one side; beer and coffee far on the other side; two small tiles at the back; candle flickering; slow crane
  function answerBg(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const G = mkGoblet(Wd, -2.3, 0); G.g.scale.setScalar(SC * 1.2); G.setLevel(1);
    const WB = mkBottle(Wd, -3.3, .3, 0x2d4a24, SEED_W), JB = mkBottle(Wd, -1.2, .4, 0x9a6ac0, SEED_J);
    const BM = mkMug(Wd, 2.1, .3, SEED_M, false), CU = mkCup(Wd, 3.0, .3, SEED_C);
    plane(Wd, 1.2, .8, drawTile('moon'), 512, [-2.4, 2.4, -1.3], 9);
    plane(Wd, 1.2, .8, drawTile('sun'), 512, [2.4, 2.4, -1.3], 9);
    Wd.on(t => {
      animScene(E, t);
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: 1, look: [.5, 0] });
      WB.f.set(t, { talk: .25 * talkAmt(t, SEED_W), smile: .8, look: [.4, 0] });
      JB.f.set(t, { talk: .25 * talkAmt(t, SEED_J), smile: .8, look: [.4, 0] });
      BM.f.set(t, { talk: .2 * talkAmt(t, SEED_M), smile: -.2, look: [-.5, 0] });
      CU.f.set(t, { talk: .2 * talkAmt(t, SEED_C), smile: -.2, look: [-.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
