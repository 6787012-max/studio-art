// shabbat-g33 story (12/11/2026) - order of brachot MGESh ASh. Storyboard: storyboards_v15.md section C.
// Objects only, no people: cake (mezonot, pink), grape-juice bottle + glass (hagafen, purple), apple (ha'etz, green),
// cucumber (ha'adama, brown), chocolate bar (shehakol, slate). A closed cupboard on the right holds the far-away food.
// Built from shabbat-g32 (camera, face, tag helpers, plate, table set kept).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, lowHero, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const bump = (t, a, b) => sm(P(a, a + .4, t)) * (1 - sm(P(b - .4, b, t)));
  const TOPY = .8, NUM = .6, TAG_Y = 1.65;
  const ROW = [-2.0, -1.0, 0, 1.0, 2.0];                       // five table slots (slot i = i-th food of the order)
  const MESS = { cake: [-1.9, -.3], juice: [-.9, -.5], apple: [-.1, .55], cuc: [.8, .6], choc: [1.8, -.3] };  // messy start
  const CUP = [4.0, 0, -1.0];                                   // closed cupboard, far right on the floor
  const ORDER = ['cake', 'juice', 'apple', 'cuc', 'choc'];     // the right order: MGESh ASh
  const S1 = { apple: 0, choc: 1, juice: 2, cake: 3, cuc: 4 }; // lined up, but not yet in order
  const SEED = { cake: 5, juice: 6, apple: 7, cuc: 8, choc: 9 };
  const LET = ['מ', 'ג', 'ע', 'א', 'ש'];
  const BRT = { cake: ['מזונות', 'pink'], juice: ['הגפן', 'purple'], apple: ['העץ', 'green'], cuc: ['האדמה', 'brown'], choc: ['שהכל', 'slate'] };
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], pink: ['#ffe0ec', '#8a1a4a', '#e0508a'],
               purple: ['#f1e6ff', '#4a1a7a', '#8a4ad0'], brown: ['#f3e6d6', '#5a3418', '#a06a3a'], slate: ['#dfe7f2', '#1e2f4a', '#4a6a9a'] };

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
  }

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g32)
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

  // ---------------------------------------------------------------- foods (origin = centre of the food on the table; face on the +z side)
  function mkPlate(Wd, pos, seed) {                                                    // cake on a plate (mezonot)
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]);
    g.add(cyl(.6, .6, .04, 0xffffff, { pos: [0, .02, 0] }));                          // plate
    g.add(cyl(.3, .3, .26, 0xf2c9a0, { pos: [-.12, .17, 0] }));                       // cake
    g.add(cyl(.32, .32, .05, 0xff8fb0, { pos: [-.12, .305, 0] }));                    // pink frosting
    for (let i = 0; i < 6; i++) { const a = i * 1.1; g.add(ball(.022, 0x7a4a24, { pos: [-.12 + .24 * Math.cos(a), .34, .24 * Math.sin(a)], ink: false })); }
    for (let i = 0; i < 3; i++) g.add(cyl(.13, .13, .05, 0xb8783a, { pos: [.32, .065 + i * .05, .05] }));  // cookie stack
    g.add(ball(.02, 0x3a2010, { pos: [.32, .19, .05], ink: false }));                 // chocolate chip
    const f = face(Wd, { w: .3, parent: g, pos: [-.12, .16, .33], seed: seed || 5 });
    return { kind: 'cake', g, f };
  }
  function mkFood(Wd, kind, xz, seed) {
    if (kind === 'cake') return mkPlate(Wd, [xz[0], TOPY, xz[1]], seed);
    const g = new THREE.Group(); Wd.add(g); g.position.set(xz[0], TOPY, xz[1]);
    let f;
    if (kind === 'juice') {                                                           // grape-juice bottle + a glass beside it
      g.add(cyl(.13, .13, .5, 0x6a2a9a, { pos: [-.18, .25, 0] }));                    // bottle body
      g.add(cyl(.05, .13, .14, 0x6a2a9a, { pos: [-.18, .57, 0] }));                   // shoulder
      g.add(cyl(.05, .05, .08, 0x2a2a2a, { pos: [-.18, .68, 0] }));                   // cap
      g.add(cyl(.11, .08, .22, 0xdfeeff, { pos: [.3, .11, 0] }));                     // glass
      g.add(cyl(.095, .07, .12, 0x8a3ab0, { pos: [.3, .08, 0] }));                    // juice in the glass
      f = face(Wd, { w: .24, parent: g, pos: [-.18, .3, .14], seed: seed || 6 });
    } else if (kind === 'apple') {
      g.add(ball(.22, 0xd83a2a, { pos: [0, .22, 0] }));                               // apple
      g.add(cyl(.012, .012, .1, 0x6b4a2e, { pos: [0, .47, 0] }));                     // stem
      const lf = ball(.06, 0x3f9a4a, { pos: [.07, .48, 0], ink: false }); lf.scale.set(1.6, .5, 1); g.add(lf);
      f = face(Wd, { w: .24, parent: g, pos: [0, .24, .23], seed: seed || 7 });
    } else if (kind === 'cuc') {
      g.add(cyl(.1, .1, .6, 0x3f8a3a, { pos: [0, .3, 0] }));                          // cucumber, standing
      for (let i = 0; i < 5; i++) g.add(ball(.02, 0x2a5a24, { pos: [.095 * Math.cos(i * 1.3), .1 + i * .1, .095 * Math.sin(i * 1.3)], ink: false }));
      f = face(Wd, { w: .22, parent: g, pos: [0, .36, .12], seed: seed || 8 });
    } else {                                                                          // chocolate bar (choc)
      g.add(box(.46, .3, .14, 0x4a5a72, { pos: [0, .15, 0] }));
      g.add(box(.47, .05, .15, 0xc9a94a, { pos: [0, .27, 0] }));                      // foil stripe
      f = face(Wd, { w: .2, parent: g, pos: [0, .13, .085], seed: seed || 9 });
    }
    return { kind, g, f };
  }
  // move a food along x/z from one spot to another, with a hop
  function glide(food, from, to, t, a, b, hop) {
    const u = sm(P(a, b, t));
    food.g.position.set(lerp(from[0], to[0], u), TOPY + hop * Math.sin(PI * u), lerp(from[1], to[1], u));
  }
  // closed cupboard on the right: the door is the front; a dim pear on top (not part of the ring)
  function mkCupboard(Wd) {
    Wd.add(box(.9, 1.5, .6, 0x8a5a2e, { pos: [CUP[0], .75, CUP[2]] }));
    const door = box(.8, 1.4, .04, 0xa06a3a, { pos: [CUP[0], .75, CUP[2] + .32] }); Wd.add(door);
    Wd.add(ball(.03, 0xffd166, { pos: [CUP[0] + .3, .75, CUP[2] + .36], ink: false }));  // knob
    Wd.add(ball(.16, 0x5a5a3a, { pos: [CUP[0], 1.66, CUP[2]], ink: false }));            // dim pear on top
    return door;
  }

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up of the apple pushing forward, pull out to the five foods in a messy row; the cucumber pushes too; "?" above
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const F = {}; for (const k of ORDER) F[k] = mkFood(Wd, k, MESS[k], SEED[k]);
    mkCupboard(Wd);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      F.apple.g.position.set(MESS.apple[0], TOPY, MESS.apple[1] + .15 * (.5 + .5 * Math.sin(t * 2.6)));
      F.cuc.g.position.set(MESS.cuc[0], TOPY, MESS.cuc[1] + .15 * (.5 + .5 * Math.sin(t * 2.6 + 2.2)));
      qT.set([0, 2.0 + .05 * Math.sin(t * 2), .1], popE(P(1.0, 1.8, t)) * NUM * 1.3, .05 * Math.sin(t * 4));
      F.apple.f.set(t, { talk: t > 1 ? .5 * talkAmt(t, SEED.apple) : 0, smile: .7, look: [.3, 0] });
      F.cuc.f.set(t, { talk: t > 2.5 ? .5 * talkAmt(t, SEED.cuc) : 0, smile: .4, look: [-.3, 0] });
      for (const k of ['cake', 'juice', 'choc']) F[k].f.set(t, { talk: 0, smile: -.4, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [F.apple.g, F.cuc.g]; Wd.qPos = [0, .1]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([-.1, 1.0, .7], { dur: 3.6, dist0: 1.0, dist1: 1.8, h0: .3, h1: .4, a0: -10, a1: 8, fov0: 30, fov1: 36 }), 1)],
      [4.4, HH(punch(truck([-.55, 1.2, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.2, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28: the five foods line up in a messy row; a glow ring marks all five "before him"; clock badge "עכשיו"; the far cupboard stays dark
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const F = {}; for (const k of ORDER) F[k] = mkFood(Wd, k, MESS[k], SEED[k]);
    mkCupboard(Wd);
    const ring = mkDots(Wd, 16, 0xffd166, .03);
    const clock = tag(Wd, 'עכשיו', 'orange', 1.2);
    Wd.on(t => {
      for (const k of ORDER) { const i = S1[k], a = .4 + .15 * i; glide(F[k], MESS[k], [ROW[i], 0], t, a, a + 2.0, .3); }
      ring.forEach((d, i) => {
        const a = i * 2 * PI / 16;
        d.position.set(2.45 * Math.cos(a), TOPY + .03, .85 * Math.sin(a));
        d.scale.setScalar(Math.max(.001, popE(P(3.0, 3.8, t)) * (.9 + .1 * Math.sin(t * 5 + i))));
      });
      clock.set([0, 2.0, .2], popE(P(2.6, 3.4, t)) * NUM, .05 * Math.sin(t * 3));
      for (const k of ORDER) F[k].f.set(t, { talk: t > 4 + .6 * S1[k] ? .45 * talkAmt(t, SEED[k]) : 0, smile: .2 + .4 * sm(P(3.0, 3.8, t)), look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [clock.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 6.4, dist1: 6.2, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 4)],
      [4.0, HH(punch(pushIn([0, 1.2, .2], { dur: 4.0, dist0: 3.8, dist1: 3.4, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [3.2]), 5)],
      [3.5, HH(punch(insert([ROW[2], 1.1, .1], { dur: 3.5, dist0: 2.7, dist1: 2.6, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [2.8]), 6)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4, dist1: 3.6, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 7)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42: the five hop into the order cake, juice, apple, cucumber, chocolate; a big ribbon of letters מ-ג-ע-א-ש flies letter by letter to each food; bracha tags pop; tag "מגע״ש א״ש"
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const F = {}; for (const k of ORDER) F[k] = mkFood(Wd, k, [ROW[S1[k]], 0], SEED[k]);
    mkCupboard(Wd);
    const L = LET.map(c => tag(Wd, c, 'gold', .42));
    const B = ORDER.map(k => tag(Wd, BRT[k][0], BRT[k][1], 1.3));
    const big = tag(Wd, 'מגע״ש א״ש', 'gold', 2.2);
    Wd.on(t => {
      ORDER.forEach((k, i) => { const a = .5 + .2 * i; glide(F[k], [ROW[S1[k]], 0], [ROW[i], 0], t, a, a + 1.6, .45); });
      LET.forEach((c, k) => {
        const u = sm(P(1.2 + .3 * k, 2.6 + .3 * k, t)), vis = popE(P(.4 + .1 * k, .9 + .1 * k, t)) * (1 - sm(P(3.6, 4.0, t)));
        const x = lerp(-1.0 + .5 * k, ROW[k], u), y = lerp(2.1, 1.35, u) + .45 * Math.sin(PI * u), z = lerp(-.2, .3, u);
        L[k].set([x, y, z], NUM * .8 * vis, .1 * Math.sin(t * 3 + k));
      });
      ORDER.forEach((k, i) => B[i].set([ROW[i] - .1, TAG_Y, .3], popE(P(4.0 + .2 * i, 4.6 + .2 * i, t)) * NUM, .03 * Math.sin(t * 2 + i)));
      big.set([0, 2.35, -.2], popE(P(4.8, 5.6, t)) * NUM, 0);
      ORDER.forEach((k, i) => F[k].f.set(t, { talk: t > 4.0 + .2 * i ? .45 * talkAmt(t, SEED[k]) : 0, smile: .2 + .5 * sm(P(4.0 + .2 * i, 4.6 + .2 * i, t)), look: [0, 0] }));
    });
    Wd.center = [0, 0]; Wd.occ = [big.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.0, 0], { dur: 3.5, dist0: 7.8, dist1: 7.6, h0: 1.0, h1: .9, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 8)],
      [4.0, HH(punch(pushIn([0, 1.5, -.1], { dur: 4.0, dist0: 5.0, dist1: 4.6, h0: .7, h1: .7, a0: 6, a1: -6, fov0: 42, fov1: 40 }), [4.6]), 9)],
      [3.5, HH(punch(insert([ROW[0], 1.1, .2], { dur: 3.5, dist0: 2.7, dist1: 2.6, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [4.3]), 10)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4, dist1: 3.6, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 11)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (diagram): on the back wall two circles - a big grey "שהכל" covering everything (many icons), a small green "העץ" covering only the fruits (apple, pear); arrow tag "מבוררת = קודמת"
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const F = {}; for (const k of ORDER) F[k] = mkFood(Wd, k, [ROW[ORDER.indexOf(k)], 0], SEED[k]);
    mkCupboard(Wd);
    const disc = (r, c, x, y, z) => { const m = cyl(r, r, .05, c, { pos: [x, y, z] }); m.rotation.x = PI / 2; Wd.add(m); return m; };
    const big = disc(1.3, 0x9a9aa6, .3, 2.25, -1.78), small = disc(.6, 0x6dbf7a, -.35, 2.2, -1.74);
    const many = [0xffd166, 0xf0a0c0, 0x4a5a72, 0x7a4a2a, 0x3a8ad0, 0xd08a34, 0x9a6ad0, 0x2a2a2a, 0xe0565a];
    const icons = [];
    for (let i = 0; i < 9; i++) {
      const a = i * 2 * PI / 9 + .3, x = .3 + .85 * Math.cos(a), y = 2.25 + .85 * Math.sin(a);
      if (Math.hypot(x + .35, y - 2.2) < .8) continue;                              // keep the fruit circle for fruits only
      const b = ball(.1, many[i], { pos: [x, y, -1.66], ink: false }); Wd.add(b); icons.push(b);
    }
    const apple = ball(.1, 0xd83a2a, { pos: [-.55, 2.35, -1.66], ink: false }); Wd.add(apple);
    const pear = ball(.1, 0xc8d848, { pos: [-.2, 2.05, -1.66], ink: false }); Wd.add(pear);
    const lb = tag(Wd, 'שהכל', 'slate', 1.1), lg = tag(Wd, 'העץ', 'green', 1.0), arrow = tag(Wd, 'מבוררת = קודמת', 'gold', 2.4);
    Wd.on(t => {
      big.scale.setScalar(Math.max(.001, popE(P(.4, 1.2, t))));
      icons.forEach((b, i) => b.scale.setScalar(Math.max(.001, popE(P(1.0 + .12 * i, 1.6 + .12 * i, t)))));
      small.scale.setScalar(Math.max(.001, popE(P(2.0, 2.8, t))));
      apple.scale.setScalar(Math.max(.001, popE(P(2.6, 3.2, t))));
      pear.scale.setScalar(Math.max(.001, popE(P(2.8, 3.4, t))));
      lb.set([1.95, 2.9, -1.5], popE(P(1.4, 2.0, t)) * NUM, 0);
      lg.set([-1.85, 2.7, -1.5], popE(P(2.6, 3.2, t)) * NUM, 0);
      arrow.set([0, 1.5, .9], popE(P(3.4, 4.2, t)) * NUM, .03 * Math.sin(t * 3));
      ORDER.forEach((k, i) => F[k].f.set(t, { talk: t > 4.5 + .3 * i ? .4 * talkAmt(t, SEED[k]) : 0, smile: .3, look: [0, .2] }));
    });
    Wd.center = [0, 0]; Wd.occ = [lb.g, lg.g, arrow.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.8, -.8], { dur: 3.5, dist0: 6.6, dist1: 6.2, h0: .9, h1: .8, a0: -6, a1: 6, fov0: 42, fov1: 42 }), 12)],
      [4.0, HH(punch(pushIn([0, 2.1, -1.6], { dur: 4.0, dist0: 5.0, dist1: 4.6, h0: .6, h1: .7, a0: -8, a1: 8, fov0: 40, fov1: 38 }), [3.0]), 13)],
      [3.5, HH(punch(insert([-.35, 2.2, -1.6], { dur: 3.5, dist0: 2.8, dist1: 2.6, h0: .5, h1: .55, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [2.8]), 14)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 15)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (good): only the apple and the cucumber; the apple steps forward, its green tag lights first ("1"); the cucumber waits politely, then its brown tag lights ("2"); green check
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const ap = mkFood(Wd, 'apple', [-.5, 0], SEED.apple), cu = mkFood(Wd, 'cuc', [.5, 0], SEED.cuc);
    const aT = tag(Wd, 'העץ', 'green', 1.3), cT = tag(Wd, 'האדמה', 'brown', 1.3);
    const n1 = tag(Wd, '1', 'blue', .6), n2 = tag(Wd, '2', 'blue', .6);
    const chk = mark3d(Wd, 'check', .5), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      const st = sm(P(.6, 1.6, t)), zA = lerp(0, .45, st), glow = 1 + .06 * Math.sin(t * 5);
      ap.g.position.set(-.5, TOPY, zA);
      aT.set([-.5, TAG_Y, zA], popE(P(1.2, 1.9, t)) * NUM * glow, .02 * Math.sin(t * 1.7));
      n1.set([-.5, 2.1, zA], popE(P(1.0, 1.6, t)) * NUM, 0);
      cT.set([.5, TAG_Y, 0], popE(P(2.6, 3.2, t)) * NUM * glow, .02 * Math.sin(t * 1.7));
      n2.set([.5, 2.1, 0], popE(P(2.6, 3.2, t)) * NUM, 0);
      chk.set([0, 1.15, .55], popE(P(3.6, 4.2, t)) * .9, .04 * Math.sin(t * 3));
      sk.set([0, 1.15, .55], P(3.6, 4.4, t), 1.0);
      ap.f.set(t, { talk: t > .9 ? .5 * talkAmt(t, SEED.apple) : 0, smile: .4 + .5 * sm(P(1.6, 2.2, t)), look: [0, 0] });
      cu.f.set(t, { talk: t > 2.8 ? .4 * talkAmt(t, SEED.cuc) : 0, smile: .5, look: [-.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [aT.g, cT.g, chk.g, n1.g, n2.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 4.8, dist1: 4.6, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 16)],
      [4.0, HH(punch(pushIn([0, 1.2, .2], { dur: 4.0, dist0: 3.4, dist1: 3.0, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [1.8]), 17)],
      [3.5, HH(punch(insert([-.5, 1.1, .45], { dur: 3.5, dist0: 2.6, dist1: 2.5, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [2.4]), 18)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 19)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-84 (good): only the apple is on the table; the cucumber is in the closed cupboard far away; a dotted arrow "להביא?" goes toward it and gets a soft cross; the apple's tag lights; green check "אין צריך"
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const ap = mkFood(Wd, 'apple', [-.3, 0], SEED.apple);
    const door = mkCupboard(Wd);
    const aT = tag(Wd, 'העץ', 'green', 1.3), no = tag(Wd, 'להביא?', 'orange', 1.4), ok = tag(Wd, 'אין צריך', 'green', 1.6);
    const cr = mark3d(Wd, 'cross', .6), chk = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a);
    const dots = mkDots(Wd, 12, 0x3a2a1a, .035);
    Wd.on(t => {
      dots.forEach((d, i) => {
        const u = (i + 1) / 13, p = popE(P(.6 + .05 * i, 1.0 + .05 * i, t));
        d.position.set(lerp(-.3, 3.6, u), 1.25 + .3 * Math.sin(PI * u), lerp(.1, -.6, u));
        d.scale.setScalar(Math.max(.001, p * (.9 + .1 * Math.sin(t * 5 + i))));
      });
      cr.set([1.8, 1.45, -.2], popE(P(2.2, 2.8, t)) * .6, .05 * Math.sin(t * 3));          // soft cross
      no.set([1.8, 1.95, -.2], popE(P(1.8, 2.4, t)) * NUM, .04 * Math.sin(t * 2));
      door.rotation.y = .05 * Math.sin(t * 6) * bump(t, 2.5, 4.5);
      aT.set([-.3, TAG_Y, 0], popE(P(3.6, 4.2, t)) * NUM * (1 + .06 * Math.sin(t * 5)), 0);
      ok.set([.2, 1.9, .3], popE(P(4.6, 5.2, t)) * NUM, 0);
      chk.set([.5, 1.4, .3], popE(P(4.6, 5.2, t)) * .9, .04 * Math.sin(t * 3));
      sk.set([.5, 1.4, .3], P(4.6, 5.4, t), 1.0);
      ap.f.set(t, { talk: t > 4.2 ? .5 * talkAmt(t, SEED.apple) : 0, smile: .2 - .5 * bump(t, 2.6, 3.8) + .6 * sm(P(4.2, 5.0, t)), look: [.8 * sm(P(.8, 1.6, t)), 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [no.g, ok.g, aT.g, cr.g];
    Wd.cam = cuts([
      [3.5, HH(truck([1.0, 1.3, 0], { dur: 3.5, dist0: 6.4, dist1: 6.2, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 20)],
      [4.0, HH(punch(pushIn([1.2, 1.55, -.2], { dur: 4.0, dist0: 4.0, dist1: 3.6, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [3.0]), 21)],
      [3.5, HH(punch(insert([3.8, 1.1, -.6], { dur: 3.5, dist0: 2.8, dist1: 2.6, h0: .2, h1: .25, a0: -12, a1: 8, fov0: 36, fov1: 34 }), [3.6]), 22)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -12, a1: -4, fov0: 42, fov1: 40 }), 23)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 84-98 (good, after a mistake): the cucumber's brown tag lights first by mistake; small orange "אופס"; then the apple's tag lights; big green check "יצא ידי חובתו"; both smile
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const ap = mkFood(Wd, 'apple', [-.5, 0], SEED.apple), cu = mkFood(Wd, 'cuc', [.5, 0], SEED.cuc);
    const aT = tag(Wd, 'העץ', 'green', 1.3), cT = tag(Wd, 'האדמה', 'brown', 1.3);
    const oops = tag(Wd, 'אופס', 'orange', 1.0), big = tag(Wd, 'יצא ידי חובתו', 'green', 2.6);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      cT.set([.5, TAG_Y, 0], popE(P(.8, 1.4, t)) * NUM, .03 * Math.sin(t * 2));
      oops.set([1.2, 1.75, .3], popE(P(1.8, 2.4, t)) * NUM, .05 * Math.sin(t * 4));
      aT.set([-.5, TAG_Y, 0], popE(P(2.8, 3.4, t)) * NUM, .02 * Math.sin(t * 1.7));
      chk.set([0, .95, .5], popE(P(3.8, 4.5, t)) * .9, .04 * Math.sin(t * 3));
      big.set([0, 1.42, .95], popE(P(3.8, 4.5, t)) * NUM, 0);
      sk.set([0, .95, .5], P(3.8, 5.0, t), 1.0);
      cu.f.set(t, { talk: (t > 1.0 && t < 3.0) ? .5 * talkAmt(t, SEED.cuc) : (t > 4.0 ? .3 * talkAmt(t, SEED.cuc) : 0), smile: .5 - .5 * bump(t, 1.4, 2.4) + .6 * sm(P(3.8, 4.5, t)), surprise: bump(t, 1.3, 2.3), look: [-.3, 0] });
      ap.f.set(t, { talk: t > 3.0 ? .5 * talkAmt(t, SEED.apple) : 0, smile: .3 + .6 * sm(P(3.8, 4.5, t)), look: [.3, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [big.g, aT.g, cT.g, chk.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 4.8, dist1: 4.6, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 24)],
      [4.0, HH(punch(pushIn([0, 1.2, .2], { dur: 4.0, dist0: 3.4, dist1: 3.0, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [3.2]), 25)],
      [3.5, HH(punch(insert([0, 1.45, .2], { dur: 3.5, dist0: 3.2, dist1: 3.0, h0: .2, h1: .25, a0: -12, a1: 8, fov0: 40, fov1: 38 }), [2.4]), 26)],
      [3.0, HH(pullOut([0, 1.3, 0], { dur: 3.0, dist0: 3.4, dist1: 4.6, h0: .4, h1: .8, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 27)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the five foods in the order MGESh ASh on the table, their bracha tags glowing one after the other; slow crane over the middle
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const F = {}; for (const k of ORDER) F[k] = mkFood(Wd, k, [ROW[ORDER.indexOf(k)], 0], SEED[k]);
    const B = ORDER.map(k => tag(Wd, BRT[k][0], BRT[k][1], 1.3));
    Wd.on(t => {
      ORDER.forEach((k, i) => {
        const on = popE(P(2 + 3 * i, 3 + 3 * i, t));
        B[i].set([ROW[i] - .1, TAG_Y, .3], on * NUM * (1 + .05 * Math.sin(t * 4)), .03 * Math.sin(t * 2 + i));
        F[k].f.set(t, { talk: .3 * talkAmt(t, SEED[k]), smile: 1, look: [0, 0] });
      });
    });
    Wd.center = [0, 0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
