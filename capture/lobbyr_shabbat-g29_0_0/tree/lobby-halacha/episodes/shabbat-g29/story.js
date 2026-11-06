// shabbat-g29 story: "אין יין לקידוש בבוקר" (Hilchot Shabbat #9). Talking objects only: a kiddush cup, a beer bottle, a challah, a sefer,
// a wine rack, a town map and a balance. Storyboard: storyboards_v10.md section C. No people, no figures, no grain.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, orbitShot, crane, insert, handheld, punch, face, talkAmt,
    mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT, arcPt, openBook, plainRoom, diningTable, lighting, windowUnit } = K;
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TTOP = .78, TZ = -1.6;                                             // table top level, table depth
  const SILVER = 0xd9dfe8, GOLD = 0xd9a63a, AMBER = 0x6b3a14, WOOD = 0xb98a58, CHAL = 0xc0792a;
  const CUP = [-.85, TTOP, TZ], BOT = [0, TTOP, TZ], CHA = [.85, TTOP, TZ];   // hook / answer-free layout
  const CUP_L = [-1.2, TTOP, TZ], BOT_R = [1.2, TTOP, TZ], BAL = [0, TTOP, TZ];
  const CUP_A = [-1.1, TTOP, TZ], CHA_A = [1.1, TTOP, TZ];                    // answer: heroes at the sides, middle left for the card
  const HERO = 1.3;                                                           // table heroes are drawn larger (the room is wide)
  const RACK = [1.7, 0, -3.25], BOOK = [-1.6, TTOP + .31, -2.1];
  const bob = (t, k) => .03 * Math.sin(t * 1.8 + k);
  const sp = (dur, ws) => { const s = ws.reduce((a, b) => a + b, 0); return ws.map(w => dur * w / s); };   // split a beat into shots that sum to dur
  const kW = () => mkWorld({ skyTop: 0x9ad0f6, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 40, fogFar: 140, hemi: 1.15, sun: 1.0, sunPos: [-14, 26, 16], shadowExt: 14 });

  // ---------------------------------------------------------------- tags and labels (Hebrew, rtl)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawCard = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const tagEmpty = drawCard('אין יין', '#ffecec', '#9a1c1c', '#c43030');
  const tagOK = drawCard('על החלה', '#f6fff2', '#1f6a2a', '#3f9a4a');
  const tagQ = drawCard('?', '#ffffff', '#c4161c', '#c4161c');
  const drawLabel = (c, W, H) => {
    c.fillStyle = '#f6e7b8'; c.fillRect(0, 0, W, H); c.strokeStyle = '#7a4a1a'; c.lineWidth = H * .05; c.strokeRect(H * .05, H * .05, W - H * .1, H - H * .1);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, 'שכר', { maxW: W * .8, maxLines: 1, max: H * .5, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = '#5a2e0c'; c.fillText(f.lines[0] || 'שכר', W / 2, H * .54);
  };

  // ---------------------------------------------------------------- the room: table, window, warm walls
  function room(Wd) {
    plainRoom(Wd, { HX: 4.6, HZ: 3.6, H: 3.4, beams: false, wall: 0xf8edd2 });
    windowUnit(Wd, -2.3, 1.1, -3.55, 0, 1.5, 1.9);
    diningTable(Wd, { x: 0, z: TZ, len: 3.8, wid: 1.1, cloth: 0xffffff, food: false });
    lighting(Wd, () => ({ hemi: 1.15, sun: 1.0, hemiColor: 0xfff1d8, sunColor: 0xfff1dc }));
  }

  // ---------------------------------------------------------------- heroes (objects with faces; front = +z)
  function mkCup(Wd, seed) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(cyl(.09, .07, .045, SILVER, { pos: [0, .022, 0] }));
    inner.add(cyl(.016, .016, .11, SILVER, { pos: [0, .1, 0] }));
    inner.add(cyl(.14, .1, .21, 0xe9edf4, { pos: [0, .21, 0] }));
    inner.add(cyl(.148, .148, .025, GOLD, { pos: [0, .32, 0] }));
    const fc = face(Wd, { w: .15, parent: inner, pos: [0, .2, .135], seed });
    return { g, face: fc, set(pos, s, ry) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s * HERO); inner.rotation.y = ry || 0; } };
  }
  function mkBottle(Wd, seed, par) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; (par || Wd).add(g);
    inner.add(cyl(.09, .09, .3, AMBER, { pos: [0, .15, 0] }));
    inner.add(cyl(.045, .09, .1, AMBER, { pos: [0, .35, 0] }));
    inner.add(cyl(.045, .045, .12, AMBER, { pos: [0, .45, 0] }));
    inner.add(cyl(.05, .05, .03, GOLD, { pos: [0, .53, 0] }));
    const lab = texPlane(.13, .13, drawLabel, { cw: 256, ro: 7 }); lab.position.set(0, .1, .0935); inner.add(lab);
    const fc = face(Wd, { w: .13, parent: inner, pos: [0, .24, .095], seed });
    return { g, face: fc, set(pos, s, ry, sy, rz) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.set(s * HERO, s * HERO * (sy === undefined ? 1 : sy), s * HERO); inner.rotation.set(0, ry || 0, rz || 0); } };
  }
  function mkChallah(Wd, seed, par, o) {   // two braided loaves (front one has the face) + an optional cover that lifts
    o = o || {};
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; (par || Wd).add(g);
    const loaves = [];
    for (const z of [-.15, .15]) {   // each challah = 3 overlapping squashed balls in a row, alternating tilt (braid), golden
      for (let i = 0; i < 3; i++) { const b = ball(.14, CHAL, { pos: [-.13 + i * .13, .09, z + (i % 2 ? .02 : -.02)], scale: [1.25, .62, .9], rot: [0, 0, i % 2 ? .35 : -.35], ink: false }); inner.add(b); loaves.push(b); }
      for (let i = 0; i < 6; i++) inner.add(ball(.014, 0xfff2cf, { pos: [-.16 + i * .065, .18, z], ink: false }));   // seeds
    }
    const fc = face(Wd, { w: .17, parent: inner, pos: [0, .08, .3], seed });
    let coverG = null;
    if (o.cover !== false) { coverG = new THREE.Group(); inner.add(coverG); coverG.add(ball(.42, 0xf7f1e3, { pos: [0, .12, 0], scale: [1.9, .5, 1.25] })); }
    const glow = glowAt(inner, 1.4, 0xffd27a, 0);
    return {
      g, face: fc,
      set(pos, s, ry, bake) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s * HERO); inner.rotation.y = ry || 0;
        const k = bake || 0; loaves.forEach(l => l.material.emissive.setRGB(.28 * k, .16 * k, 0)); glow.material.opacity = .45 * k; },
      lift(k) { if (!coverG) return; const u = clamp(k, 0, 1); coverG.position.set(0, u * 1.1, 0); coverG.rotation.y = u * .9; coverG.scale.setScalar(Math.max(.02, 1 - .93 * u)); }
    };
  }
  function mkRack(Wd) {   // wooden wine rack, 8 cubbies; the red dots mark the empty ones
    const g = new THREE.Group(); g.position.set(RACK[0], RACK[1], RACK[2]); Wd.add(g);
    g.add(box(1.5, .06, .42, WOOD, { pos: [0, .03, 0] }));
    for (const sx of [-1, 1]) g.add(box(.06, 1.75, .4, WOOD, { pos: [sx * .72, .875, 0] }));
    g.add(box(1.5, .06, .42, WOOD, { pos: [0, 1.75, 0] }));
    const dots = [];
    [.56, 1.14].forEach(y => {
      g.add(box(1.44, .05, .4, 0xa87a4a, { pos: [0, y, 0] }));
      g.add(box(1.44, .3, .02, 0x3a2412, { pos: [0, y + .17, -.19], ink: false }));
      for (let c = 0; c < 4; c++) { const d = ball(.055, 0xe03131, { pos: [-.54 + c * .36, y + .2, .1], ink: false }); d.scale.setScalar(.001); g.add(d); dots.push(d); }
    });
    return { g, dots };
  }
  function mkMap(Wd) {   // town map on the table: six houses, each gets a beer glass icon
    const mp = new THREE.Group(); mp.position.set(0, TTOP, TZ); Wd.add(mp);
    mp.add(box(1.7, .03, .95, 0xf3e3b4, { pos: [0, .015, 0] }));
    mp.add(box(1.2, .006, .04, 0xc9a86a, { pos: [-.1, .034, 0], ink: false }));
    const HS = [[-.62, -.25], [-.32, .2], [-.05, -.22], [.2, .18], [.48, -.2], [.62, .22]];
    const hs = HS.map(([x, z]) => { const h = new THREE.Group(); h.position.set(x, .03, z); mp.add(h); h.add(box(.16, .12, .16, 0xf4f0e6, { pos: [0, .06, 0] })); h.add(cyl(0, .12, .08, 0xb5442a, { pos: [0, .16, 0] })); return h; });
    const ic = HS.map(([x, z]) => { const g2 = new THREE.Group(); g2.position.set(x, .26, z); mp.add(g2); g2.add(cyl(.035, .028, .08, 0xf6c93a, { pos: [0, .04, 0] })); g2.add(ball(.034, 0xffffff, { pos: [0, .1, 0], ink: false })); return g2; });
    return { mp, hs, ic };
  }

  // ---------------------------------------------------------------- 1. HOOK 0-14: an extreme close-up of the kiddush cup pulls back; an empty wine rack; "?"
  function hook(dur) {
    const Wd = kW(); room(Wd); mkRack(Wd);
    const cup = mkCup(Wd, 1);
    Wd.on(t => {
      cup.set([CUP[0], TTOP + bob(t, 1), CUP[2]], 1, .08 * Math.sin(t * .9));
      cup.face.set(t, { talk: t < 12 ? .9 * talkAmt(t, 1) : 0, smile: -.5, look: [.8, .2] });
    });
    Wd.qPos = [CUP[0], CUP[2]]; Wd.qSize = .8; Wd.center = [-.3, TZ]; Wd.occ = [cup.g];
    const [d1, d2, d3] = sp(dur, [4.6, 4.4, 5.0]);
    Wd.cam = cuts([
      [d1, HH(pullOut([CUP[0], 1.0, TZ], { dur: d1, dist0: .9, dist1: 2.6, h0: .05, h1: .45, a0: -16, a1: 6, fov0: 30, fov1: 38 }), 1)],
      [d2, HH(truck([0, .85, -2.0], { dur: d2, dist0: 4.2, dist1: 3.8, h0: .6, h1: .55, a0: -8, a1: 12, fov0: 42, fov1: 42, shift: [.5, 0, 0] }), 2)],
      [d3, HH(punch(insert([CUP[0] + .1, 1.0, TZ], { dur: d3, dist0: 2.2, dist1: 2.0, h0: .3, h1: .2, a0: 10, a1: -4, fov0: 36, fov1: 34 }), [.5]), 3)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: the cup is sad, the empty rack; every cubby marks "empty" one by one; the tag "אין יין"
  function s1(dur) {
    const Wd = kW(); room(Wd); const rk = mkRack(Wd); const cup = mkCup(Wd, 1);
    const tg = bb(Wd, 1.5, .5, tagEmpty, 640);
    Wd.on(t => {
      cup.set([CUP[0], TTOP + bob(t, 1), CUP[2]], 1, .25 * Math.sin(t * .7));
      cup.face.set(t, { talk: t > .5 ? talkAmt(t, 1) : 0, smile: -.5, look: [.7, 0] });
      rk.dots.forEach((d, i) => d.scale.setScalar(Math.max(.001, popE(P(1.0 + i * .45, 1.6 + i * .45, t)))));
      tg.set([RACK[0], 1.0 + bob(t, 2), RACK[2] + .35], popE(P(.3, 1.3, t)), .03 * Math.sin(t * 1.7));
    });
    Wd.center = [.4, TZ]; Wd.occ = [rk.g, tg.g, cup.g];
    const [d1, d2, d3] = sp(dur, [4.5, 4.5, 5.0]);
    Wd.cam = cuts([
      [d1, HH(truck([.2, 1.1, -2.4], { dur: d1, dist0: 3.6, dist1: 3.2, h0: .5, h1: .45, a0: -14, a1: 6, fov0: 44, fov1: 44, shift: [.9, 0, 0] }), 4)],
      [d2, HH(punch(insert([RACK[0], 1.2, RACK[2] + .2], { dur: d2, dist0: 2.4, dist1: 2.1, h0: .4, h1: .3, a0: 16, a1: -6, fov0: 36, fov1: 34 }), [1.2]), 5)],
      [d3, HH(pushIn([CUP[0], 1.0, TZ], { dur: d3, dist0: 3.2, dist1: 2.6, h0: .2, h1: .3, a0: -12, a1: 8, fov0: 42, fov1: 40 }), 6)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-43: the sefer opens with a glowing line; the beer bottle steps forward proudly
  function s2(dur) {
    const Wd = kW(); room(Wd); mkRack(Wd);
    const cup = mkCup(Wd, 1), bt = mkBottle(Wd, 2), bk = openBook(Wd, { text: 'חמר מדינה' });
    Wd.on(t => {
      const u = sm(P(2.2, 4.4, t));
      bk.set(BOOK, .22 * popE(P(.2, 1.2, t)), sm(P(1.4, 3.2, t)) * (.85 + .15 * Math.sin(t * 4)));
      const bp = arcPt([BOT[0], BOT[1], BOT[2]], [BOT[0], BOT[1], -1.25], u, .14);
      bt.set([bp[0], bp[1] + bob(t, 2), bp[2]], 1, -.15 * u);
      bt.face.set(t, { talk: t > 4.5 ? .8 * talkAmt(t, 2) : 0, smile: .3 + .6 * u, look: [-.5, .2 * Math.sin(t)] });
      cup.set([CUP[0], TTOP + bob(t, 1), CUP[2]], 1, .15);
      cup.face.set(t, { talk: 0, smile: .2 + .2 * u, look: [.6, 0] });
    });
    Wd.center = [-.4, TZ]; Wd.occ = [bk.g, bt.g, cup.g];
    const [d1, d2, d3] = sp(dur, [4.5, 5.0, 5.5]);
    Wd.cam = cuts([
      [d1, HH(pushIn([BOOK[0], 1.1, BOOK[2]], { dur: d1, dist0: 3.8, dist1: 3.2, h0: .3, h1: .35, a0: -16, a1: -4, fov0: 42, fov1: 40 }), 7)],
      [d2, HH(punch(insert([BOOK[0] + .2, 1.1, BOOK[2] + .2], { dur: d2, dist0: 1.9, dist1: 1.7, h0: .3, h1: .25, a0: 12, a1: -8, fov0: 36, fov1: 34 }), [1.0]), 8)],
      [d3, HH(truck([.4, 1.0, -1.5], { dur: d3, dist0: 3.0, dist1: 2.8, h0: .3, h1: .3, a0: -4, a1: 10, fov0: 42, fov1: 42, shift: [.8, 0, 0] }), 9)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 43-57: the town map; a house per drink icon pops up
  function s3(dur) {
    const Wd = kW(); room(Wd); mkRack(Wd);
    const cup = mkCup(Wd, 1), bt = mkBottle(Wd, 2), m = mkMap(Wd);
    Wd.on(t => {
      m.hs.forEach((h, i) => h.scale.setScalar(Math.max(.001, popE(P(.3 + i * .35, 1.1 + i * .35, t)))));
      m.ic.forEach((g2, i) => { g2.scale.setScalar(Math.max(.001, popE(P(1.4 + i * .35, 2.2 + i * .35, t)))); g2.position.y = .26 + .02 * Math.sin(t * 2.2 + i); });
      cup.set([CUP_L[0], TTOP + bob(t, 1), CUP_L[2]], 1, .2);
      cup.face.set(t, { talk: 0, smile: .3, look: [.5, 0] });
      bt.set([BOT_R[0], TTOP + bob(t, 2), BOT_R[2]], 1, -.2);
      bt.face.set(t, { talk: .7 * talkAmt(t, 2) * (t > 2 ? 1 : 0), smile: .8, look: [-.4, .3] });
    });
    Wd.center = [0, TZ]; Wd.occ = [m.mp, cup.g, bt.g];
    const [d1, d2, d3] = sp(dur, [4.5, 4.8, 4.7]);
    Wd.cam = cuts([
      [d1, HH(crane([0, 1.0, TZ], { dur: d1, dist0: 3.4, dist1: 2.9, h0: .9, h1: .35, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 10)],
      [d2, HH(punch(insert([0, .95, TZ + .1], { dur: d2, dist0: 2.3, dist1: 2.0, h0: .45, h1: .4, a0: 6, a1: -10, fov0: 38, fov1: 36 }), [2.6]), 11)],
      [d3, HH(truck([.7, 1.1, TZ], { dur: d3, dist0: 4.0, dist1: 3.8, h0: .35, h1: .3, a0: -16, a1: 10, fov0: 42, fov1: 42, shift: [.7, 0, 0] }), 12)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 57-71 (mood bad): the drink icons fade; a big "?" wobbles over the bottle, which shrinks unsure
  function s4(dur) {
    const Wd = kW(); room(Wd); mkRack(Wd);
    const cup = mkCup(Wd, 1), bt = mkBottle(Wd, 2), m = mkMap(Wd), qq = bb(Wd, .5, .5, tagQ, 256);
    Wd.on(t => {
      m.ic.forEach((g2, i) => g2.scale.setScalar(Math.max(.001, 1 - sm(P(.3 + i * .12, 1.8 + i * .12, t)))));
      cup.set([CUP_L[0], TTOP + bob(t, 1), CUP_L[2]], 1, .05);
      cup.face.set(t, { talk: 0, smile: -.2, look: [-.3, 0] });
      const sh = sm(P(1.0, 3.0, t));
      bt.set([BOT_R[0], TTOP + bob(t, 2), BOT_R[2]], 1, .25 * Math.sin(t * 3.1) * sh, 1 - .18 * sh, .06 * Math.sin(t * 5) * sh);
      bt.face.set(t, { talk: .25 * talkAmt(t, 2), smile: -.6, surprise: .6 * sh, look: [0, -.4] });
      qq.set([BOT_R[0], 1.4 + .04 * Math.sin(t * 4), BOT_R[2] + .15], popE(P(.8, 1.8, t)) * (1 + .08 * Math.sin(t * 5)), .25 * Math.sin(t * 3));
    });
    Wd.center = [1.0, TZ]; Wd.occ = [m.mp, bt.g, qq.g, cup.g];
    const [d1, d2, d3] = sp(dur, [4.5, 4.8, 4.7]);
    Wd.cam = cuts([
      [d1, HH(orbitShot([BOT_R[0], 1.1, TZ], { dur: d1, dist0: 3.0, dist1: 2.8, h0: .3, h1: .3, a0: -34, a1: -10, fov0: 40, fov1: 40 }), 13)],
      [d2, HH(punch(insert([BOT_R[0] - .05, 1.15, TZ + .1], { dur: d2, dist0: 1.3, dist1: 1.25, h0: .2, h1: .25, a0: -10, a1: 10, fov0: 40, fov1: 40 }), [.6]), 14)],
      [d3, HH(pullOut([0, 1.2, TZ], { dur: d3, dist0: 3.0, dist1: 4.6, h0: .3, h1: .9, a0: 6, a1: -10, fov0: 40, fov1: 44 }), 15)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 71-85 (mood good): the balance tips firmly to the challah side, green glow, check
  function s5(dur) {
    const Wd = kW(); room(Wd); mkRack(Wd);
    const cup = mkCup(Wd, 1);
    const bal = new THREE.Group(); bal.position.set(BAL[0], BAL[1], BAL[2]); Wd.add(bal);
    bal.add(cyl(.2, .2, .03, 0x8a6a2a, { pos: [0, .015, 0] }));
    bal.add(cyl(.03, .03, .9, 0x8a6a2a, { pos: [0, .45, 0] }));
    const beam = new THREE.Group(); beam.position.set(0, .9, 0); bal.add(beam);
    beam.add(box(1.3, .04, .05, GOLD, { pos: [0, 0, 0] })); beam.add(ball(.05, GOLD, { pos: [0, .03, 0], ink: false }));
    for (const sx of [-1, 1]) { beam.add(cyl(.006, .006, .55, 0x3a3a3a, { pos: [sx * .6, -.275, 0], ink: false })); beam.add(cyl(.2, .2, .03, GOLD, { pos: [sx * .6, -.55, 0] })); }
    const bt = mkBottle(Wd, 2, beam), ch = mkChallah(Wd, 3, beam, { cover: false });
    const gg = glowAt(beam, .9, 0x6dff9a, 0); gg.position.set(.6, -.35, .2);
    const qq = bb(Wd, .6, .6, tagQ, 256), ck = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      const u = sm(P(1.6, 5.2, t));
      beam.rotation.z = lerp(.12, -.26, u) + .02 * Math.sin(t * 4.5) * (1 - u);
      bt.set([-.6, -.535, 0], .7, 0);
      bt.face.set(t, { talk: .3 * talkAmt(t, 2), smile: -.3, look: [-.3, .3], surprise: 0 });
      ch.set([.6, -.535, 0], .385, 0, u);
      ch.face.set(t, { talk: u * talkAmt(t, 3), smile: -.2 + 1.2 * u, look: [.3, 0] });
      gg.material.opacity = .5 * u * (.85 + .15 * Math.sin(t * 3));
      qq.set([BAL[0] - .6, TTOP + 1.25, BAL[2] + .1], popE(P(.5, 1.2, t)), .2 * Math.sin(t * 3), 1 - u);
      ck.set([BAL[0] + .6, TTOP + 1.25 + .04 * Math.sin(t * 3), BAL[2]], popE(P(5.0, 6.0, t)) * .8, .05 * Math.sin(t * 3));
      sk.set([BAL[0] + .6, TTOP + .3, BAL[2]], P(5.0, 5.9, t), 1.2);
      cup.set([CUP_L[0], TTOP + bob(t, 1), CUP_L[2]], 1, .15);
      cup.face.set(t, { talk: 0, smile: .2 + .6 * sm(P(4.5, 6.0, t)), look: [.6, -.1] });
    });
    Wd.center = [0, TZ]; Wd.occ = [bal, cup.g, qq.g, ck.g];
    const [d1, d2, d3] = sp(dur, [4.5, 4.8, 4.7]);
    Wd.cam = cuts([
      [d1, HH(pushIn([0, 1.1, TZ], { dur: d1, dist0: 4.4, dist1: 3.4, h0: .35, h1: .3, a0: -8, a1: 8, fov0: 42, fov1: 40 }), 16)],
      [d2, HH(punch(insert([.1, TTOP + .35, TZ + .1], { dur: d2, dist0: 2.6, dist1: 2.4, h0: .25, h1: .3, a0: 10, a1: -6, fov0: 40, fov1: 38 }), [.7]), 17)],
      [d3, HH(orbitShot([0, 1.1, TZ], { dur: d3, dist0: 3.4, dist1: 3.1, h0: .2, h1: .45, a0: -24, a1: 18, fov0: 40, fov1: 40 }), 18)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 85-100: back at the table: the cover lifts by itself, the challot glow, big check, the cup smiles
  function s6(dur) {
    const Wd = kW(); room(Wd); mkRack(Wd);
    const cup = mkCup(Wd, 1), ch = mkChallah(Wd, 3, null, {});
    const tg = bb(Wd, 1.3, .42, tagOK, 700), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      const lk = sm(P(1.6, 4.4, t));
      ch.set([CHA[0], TTOP + bob(t, 3) * .5, CHA[2]], 1, 0, sm(P(3.4, 5.8, t)));
      ch.lift(lk);
      cup.set([CUP[0], TTOP + bob(t, 1), CUP[2]], 1, .12);
      cup.face.set(t, { talk: t > 5 ? .8 * talkAmt(t, 1) : 0, smile: -.2 + 1.2 * sm(P(4.2, 6.0, t)), look: [.5, 0] });
      ck.set([CHA[0] - .65, 1.2 + .04 * Math.sin(t * 3), CHA[2]], popE(P(4.8, 5.8, t)) * .9, .05 * Math.sin(t * 3));
      sk.set([CHA[0] - .65, 1.2, CHA[2]], P(4.8, 5.7, t), 1.4);
      tg.set([CHA[0], 1.5 + bob(t, 2), CHA[2]], popE(P(5.2, 6.2, t)) * .95, .03 * Math.sin(t * 1.7));
    });
    Wd.center = [0, TZ]; Wd.occ = [cup.g, ch.g, tg.g, ck.g];
    const [d1, d2, d3] = sp(dur, [4.5, 5.5, 5.0]);
    Wd.cam = cuts([
      [d1, HH(truck([0, 1.0, TZ], { dur: d1, dist0: 3.6, dist1: 3.2, h0: .4, h1: .35, a0: -12, a1: 8, fov0: 44, fov1: 42, shift: [.6, 0, 0] }), 19)],
      [d2, HH(punch(insert([CHA[0], 1.0, TZ + .1], { dur: d2, dist0: 2.5, dist1: 2.3, h0: .35, h1: .6, a0: -10, a1: 12, fov0: 38, fov1: 34 }), [.3]), 20)],
      [d3, HH(crane([CHA[0], 1.35, TZ], { dur: d3, dist0: 3.4, dist1: 3.0, h0: .05, h1: 1.0, a0: 16, a1: -6, fov0: 42, fov1: 40 }), 21)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the Shabbat table with the uncovered challot and the cup at the sides, morning light, slow crane
  function answerBg(dur) {
    const Wd = kW(); room(Wd); mkRack(Wd);
    const cup = mkCup(Wd, 1), ch = mkChallah(Wd, 3, null, { cover: false });
    const gl = glowAt(Wd.scene, 2.6, 0xffe08a, .3);
    Wd.on(t => {
      gl.position.set(0, 1.0, TZ + .05); gl.material.opacity = .3 + .1 * Math.sin(t * 2.4);
      cup.set([CUP_A[0], TTOP + bob(t, 1), CUP_A[2]], 1, .1);
      cup.face.set(t, { talk: .4 * talkAmt(t, 1), smile: 1, look: [.4, 0] });
      ch.set([CHA_A[0], TTOP + bob(t, 3) * .5, CHA_A[2]], 1, 0, .8 + .2 * Math.sin(t * 2.4));
      ch.face.set(t, { talk: .5 * talkAmt(t, 3), smile: 1, look: [-.4, 0] });
    });
    Wd.center = [0, TZ]; Wd.occ = [cup.g, ch.g]; Wd.ansD = 6.4;
    Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 2.2, TZ], { dur: 20, dist0: 7.2, dist1: 6.0, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
