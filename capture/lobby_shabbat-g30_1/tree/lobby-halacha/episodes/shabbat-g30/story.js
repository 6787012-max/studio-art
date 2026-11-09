// shabbat-g30 story (09/11/2026) - kiddush made before Shacharit. Storyboard: storyboards_v12.md section C.
// Objects only, no people: silver kiddush cup, blue siddur (prayer book), round wall clock, white Shabbat table in morning daylight.
// Timeline bar above the table: left segment = prayer (Shacharit), right segment = meal (seudah).
// The cup stands on the table at the same x as its glowing marker on the bar. x < 0 = before prayer ends, x = 0 = after prayer, before the meal.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, orbitShot, crane, lowHero, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TOPY = .8, OS = 1.5, NUM = .6;
  const BAR_Y = 1.5, BAR_Z = .3, TAG_Y = 2.0;
  const X_EARLY = -1.8, X_KID = 0;
  const CLOCK = [2.4, 2.45, -1.7], BOOK = [-2.1, TOPY, -.5];
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'] };
  const bob = (t, k) => .03 * Math.sin(t * 1.8 + k);
  const bump = (t, a, b) => sm(P(a, a + .4, t)) * (1 - sm(P(b - .4, b, t)));

  // ---------------------------------------------------------------- world: morning daylight, white Shabbat table, window on the back wall
  const kW = () => mkWorld({ skyTop: 0x9fd6f2, skyBottom: 0xfff1d8, fogColor: 0xf5ebd8, fogNear: 24, fogFar: 98, hemi: 1.1, sun: 1.0, sunPos: [-9, 22, 12], shadowExt: 10 });
  function sceneSet(Wd) {
    Wd.add(box(10, 5, .3, 0xfbeed8, { pos: [0, 2.5, -2.0] }));                       // warm back wall
    Wd.add(box(2.7, 1.9, .08, 0x6b4a2e, { pos: [-2.0, 2.4, -1.78] }));               // window frame
    Wd.add(box(2.3, 1.5, .04, 0xbfe9ff, { pos: [-2.0, 2.4, -1.72], ink: false }));   // daylight pane
    Wd.add(box(.05, 1.5, .05, 0x6b4a2e, { pos: [-2.0, 2.4, -1.68] }));                // mullion
    const sun = glowAt(Wd.scene, 2.4, 0xfff0b0, .3); sun.position.set(-1.6, 2.2, -1.5);
    Wd.add(box(10, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                    // floor (top at 0)
    Wd.add(box(5.0, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));               // white Shabbat tablecloth
    Wd.add(box(5.0, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));           // cloth drape
    for (const x of [-2.3, 2.3]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
  }
  function tableDecor(Wd) {
    Wd.add(cyl(.3, .3, .03, 0xffffff, { pos: [1.5, TOPY + .02, .85] }));             // plate
    Wd.add(box(.7, .1, .42, 0xc98a3a, { pos: [1.5, TOPY + .05, -.55] }));            // challah
    Wd.add(box(.74, .03, .46, 0xf1ead8, { pos: [1.5, TOPY + .11, -.55] }));          // linen cover
  }

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g29b)
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

  // ---------------------------------------------------------------- silver kiddush cup (origin = foot centre on the table, scaled OS)
  function mkCup(Wd, pos, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(OS);
    const sil = 0xd6dce4, dark = 0xb4bcc7;
    g.add(cyl(.13, .13, .03, dark, { pos: [0, .015, 0] }));
    g.add(cyl(.035, .035, .1, dark, { pos: [0, .08, 0] }));
    g.add(cyl(.2, .14, .2, sil, { pos: [0, .23, 0] }));
    const wine = cyl(.12, .12, 1, 0x7a0c1c, { pos: [0, .14, 0], ink: false }); g.add(wine);
    const f = face(Wd, { w: .2, parent: g, pos: [0, .25, .2], seed: seed || 1 });
    return { g, f, top: TOPY + .33 * OS, setWine(u) { const H = Math.max(.001, u * .18); wine.visible = u > .005; wine.scale.y = H; wine.position.y = .14 + H / 2; } };
  }

  // ---------------------------------------------------------------- round wall clock on the back wall; reads early (6:40) and its pointers spin forward in beat 4
  function mkClock(Wd, pos, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]);
    g.add(cyl(.5, .5, .1, 0x8a5a2a, { pos: [0, 0, -.03], rot: [PI / 2, 0, 0] }));     // wooden rim
    g.add(cyl(.42, .42, .08, 0xfffaf0, { pos: [0, 0, .02], rot: [PI / 2, 0, 0], ink: false })); // dial
    const pivot = new THREE.Group(); pivot.position.set(0, .05, .14); g.add(pivot);
    const hr = new THREE.Group(), mn = new THREE.Group(); pivot.add(hr); pivot.add(mn);
    hr.add(box(.05, .2, .03, 0x2a2a30, { pos: [0, .1, 0] }));
    mn.add(box(.035, .32, .03, 0x2a2a30, { pos: [0, .16, .01] }));
    const f = face(Wd, { w: .3, parent: g, pos: [0, -.22, .12], seed: seed || 3 });
    return { g, f, pose(minA, hourA) { mn.rotation.z = -minA; hr.rotation.z = -hourA; } };
  }

  // ---------------------------------------------------------------- blue siddur standing on the table (origin = bottom-left corner, scaled OS); cover swings open on the left hinge
  function mkSiddur(Wd, pos, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(OS);
    const pv = new THREE.Group(); g.add(pv);                                         // hinge pivot at the left edge
    g.add(box(.5, .6, .1, 0xf7efe0, { pos: [.25, .3, 0], ink: false }));              // pages block
    g.add(box(.04, .6, .16, 0x1f3a80, { pos: [0, .3, 0] }));                         // spine
    g.add(box(.5, .6, .03, 0x2a4fa0, { pos: [.25, .3, -.065] }));                    // back cover
    pv.add(box(.5, .6, .03, 0x2a4fa0, { pos: [.25, .3, .065] }));                    // front cover
    const f = face(Wd, { w: .3, parent: pv, pos: [.25, .48, .09], seed: seed || 4 });
    const gl = glowAt(Wd.scene, 1.4, 0xffd27a, 0); gl.position.set(pos[0] + .3, pos[1] + .45, pos[2] + .3);
    return { g, f, glow: gl, setOpen(o) { pv.rotation.y = -o * 1.9; } };
  }

  // ---------------------------------------------------------------- timeline bar: prayer segment (blue, left) then meal segment (gold, right); marker = where the cup is
  function mkBar(Wd) {
    Wd.add(box(2.4, .16, .14, 0x2f6ad0, { pos: [-1.2, BAR_Y, BAR_Z] }));
    Wd.add(box(2.4, .16, .14, 0xd9a63a, { pos: [1.2, BAR_Y, BAR_Z] }));
    const gB = glowAt(Wd.scene, 1.8, 0x6aa8ff, 0); gB.position.set(-1.2, BAR_Y, BAR_Z + .05);
    const gG = glowAt(Wd.scene, 1.8, 0xffd27a, 0); gG.position.set(1.2, BAR_Y, BAR_Z + .05);
    const mk = ball(.13, 0xffd166, { pos: [0, BAR_Y, BAR_Z + .15], ink: false }); Wd.add(mk);
    const pT = tag(Wd, 'תפילת שחרית', 'blue', 1.5), mT = tag(Wd, 'סעודה', 'gold', .9);
    return { gB, gG, mk, pT, mT };
  }

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up of the cup's rim, pull out to the morning table and the clock; "?" over the cup
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd); tableDecor(Wd);
    const clk = mkClock(Wd, CLOCK, 3);
    const cup = mkCup(Wd, [0, TOPY, 0], 1), rim = cup.top;
    Wd.on(t => {
      cup.setWine(.9 + .03 * Math.sin(t * 1.3));
      cup.f.set(t, { talk: t > 4 ? .5 * talkAmt(t, 1) : 0, smile: t > 9 ? .6 : .1, look: [Math.sin(t * .8) * .4, .3] });
      clk.pose(4.19 + .02 * t, 3.49 + .002 * t);
      clk.f.set(t, { talk: 0, smile: .2, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g]; Wd.qPos = [0, -.1]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([0, rim, 0], { dur: 3.6, dist0: 1.3, dist1: 1.9, h0: .15, h1: .35, a0: -10, a1: 8, fov0: 30, fov1: 36 }), 1)],
      [4.4, HH(punch(orbitShot([0, rim - .2, 0], { dur: 4.4, dist0: 1.9, dist1: 2.1, h0: .35, h1: .4, a0: -20, a1: 20, fov0: 38, fov1: 38 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.3, 0], { dur: 6.0, dist0: 2.6, dist1: 4.3, h0: .3, h1: .6, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28: the timeline appears; the cup slides in to the start of the meal segment; tag "קידוש היום"
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd); tableDecor(Wd);
    const bar = mkBar(Wd), clk = mkClock(Wd, CLOCK, 3);
    const cup = mkCup(Wd, [0, TOPY, 0], 1); cup.setWine(.85);
    const kT = tag(Wd, 'קידוש היום', 'gold', 1.2);
    const sb = mkSiddur(Wd, BOOK, 4);
    Wd.on(t => {
      const x = lerp(.9, X_KID, sm(P(0, 2.5, t)));
      cup.g.position.set(x, TOPY, 0);
      bar.mk.position.x = x;
      bar.gG.material.opacity = .2 + .1 * Math.sin(t * 2.5);
      bar.pT.set([-1.2, BAR_Y, BAR_Z + .16], popE(P(.6, 1.4, t)) * NUM, 0);
      bar.mT.set([1.2, BAR_Y, BAR_Z + .16], popE(P(1.0, 1.8, t)) * NUM, 0);
      kT.set([x, BAR_Y + .42, BAR_Z], popE(P(2.6, 3.4, t)) * NUM, .03 * Math.sin(t * 1.7));
      cup.f.set(t, { talk: t > 4.5 ? .5 * talkAmt(t, 1) : 0, smile: sm(P(3, 5, t)) * .9, look: [0, .4] });
      clk.pose(4.19 + .03 * t, 3.49 + .003 * t);
      clk.f.set(t, { talk: 0, smile: .3, look: [0, 0] });
      sb.setOpen(0);
      sb.f.set(t, { talk: 0, smile: .2, look: [.2, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, bar.pT.g, bar.mT.g, kT.g, sb.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -10, a1: 8, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 4)],
      [4.0, HH(punch(insert([0, 1.2, 0], { dur: 4.0, dist0: 2.6, dist1: 2.4, h0: .25, h1: .3, a0: -14, a1: 4, fov0: 36, fov1: 34 }), [.6]), 5)],
      [3.5, HH(lowHero([0, 1.0, 0], { dur: 3.5, dist0: 2.6, dist1: 2.4, h0: -.2, h1: -.1, a0: -16, a1: -4, fov0: 42, fov1: 40 }), 6)],
      [3.0, HH(pullOut([0, 1.3, 0], { dur: 3.0, dist0: 3.0, dist1: 4.4, h0: .35, h1: .7, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 7)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (bad): the cup jumps BACK onto the prayer side of the bar; grey tag "חובת קידוש" is off there; the clock looks worried
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd); tableDecor(Wd);
    const bar = mkBar(Wd), clk = mkClock(Wd, CLOCK, 3);
    const cup = mkCup(Wd, [0, TOPY, 0], 1); cup.setWine(.85);
    const sb = mkSiddur(Wd, BOOK, 4);
    const grey = tag(Wd, 'חובת קידוש', 'grey', 1.5);
    Wd.on(t => {
      const p = sm(P(1.5, 2.8, t));
      const x = lerp(X_KID, X_EARLY, p), y = TOPY + .6 * Math.sin(PI * p);
      cup.g.position.set(x, y, 0);
      bar.mk.position.x = x;
      bar.gB.material.opacity = .25 + .1 * Math.sin(t * 2.5);
      bar.pT.set([-1.2, BAR_Y, BAR_Z + .16], NUM, 0);
      bar.mT.set([1.2, BAR_Y, BAR_Z + .16], NUM, 0);
      grey.set([x, TAG_Y, .3], popE(P(3.0, 3.8, t)) * NUM, .03 * Math.sin(t * 1.3));
      cup.f.set(t, { talk: t > 3.8 ? .4 * talkAmt(t, 1) : 0, smile: t > 2.8 ? -.4 : .2, look: [-.3, 0] });
      clk.pose(4.19 + .1 * Math.sin(t * 3), 3.49);
      clk.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, 3) : 0, smile: -.6, look: [Math.sin(t * 2) * .3, 0] });
      sb.setOpen(0);
      sb.f.set(t, { talk: 0, smile: 0, look: [.2, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, grey.g, sb.g, bar.pT.g, clk.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.6, 1.3, 0], { dur: 3.5, dist0: 6.1, dist1: 5.9, h0: .6, h1: .5, a0: 10, a1: -6, fov0: 42, fov1: 42, shift: [-.6, 0, 0] }), 8)],
      [4.0, HH(punch(pushIn([-1.2, 1.3, 0], { dur: 4.0, dist0: 3.6, dist1: 3.2, h0: .4, h1: .3, a0: 14, a1: -4, fov0: 42, fov1: 40 }), [3.4]), 9)],
      [3.5, HH(punch(insert([X_EARLY + .2, 1.2, .05], { dur: 3.5, dist0: 2.8, dist1: 2.6, h0: .2, h1: .25, a0: -16, a1: 8, fov0: 36, fov1: 34 }), [.8]), 10)],
      [3.0, HH(crane([-.6, 1.2, 0], { dur: 3.0, dist0: 3.8, dist1: 4.4, h0: .2, h1: .9, a0: -8, a1: 6, fov0: 40, fov1: 42 }), 11)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (bad): big red cross over the cup at the early point; cup surprised; siddur still closed
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd); tableDecor(Wd);
    const bar = mkBar(Wd), clk = mkClock(Wd, CLOCK, 3);
    const cup = mkCup(Wd, [X_EARLY, TOPY, 0], 1); cup.setWine(.85);
    const sb = mkSiddur(Wd, BOOK, 4);
    const grey = tag(Wd, 'חובת קידוש', 'grey', 1.5);
    const cross = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff5a5a);
    Wd.on(t => {
      cup.g.position.set(X_EARLY, TOPY, 0);
      bar.mk.position.x = X_EARLY;
      bar.gB.material.opacity = .25 + .1 * Math.sin(t * 2.5);
      bar.pT.set([-1.2, BAR_Y, BAR_Z + .16], NUM, 0);
      bar.mT.set([1.2, BAR_Y, BAR_Z + .16], NUM, 0);
      grey.set([X_EARLY, TAG_Y, .3], NUM, .03 * Math.sin(t * 1.3));
      cup.f.set(t, { talk: t > 1 ? .5 * talkAmt(t, 1) : 0, smile: -.6, surprise: t > .6 ? 1 : 0, look: [0, .3] });
      cross.set([X_EARLY, TOPY + .75, .4], popE(P(.5, 1.3, t)) * .9, .04 * Math.sin(t * 3));
      sk.set([X_EARLY, TOPY + .75, .4], P(1.2, 2.0, t), 1.0);
      clk.pose(4.19 + .1 * Math.sin(t * 3), 3.49);
      clk.f.set(t, { talk: 0, smile: -.6, look: [0, 0] });
      sb.setOpen(0);
      sb.f.set(t, { talk: 0, smile: -.2, look: [.2, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, grey.g, cross.g, sb.g, bar.pT.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.8, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 12)],
      [4.0, HH(punch(insert([X_EARLY + .1, 1.2, .05], { dur: 4.0, dist0: 2.9, dist1: 2.7, h0: .2, h1: .25, a0: -10, a1: 6, fov0: 36, fov1: 34 }), [1.2]), 13)],
      [3.5, HH(punch(lowHero([-1.2, 1.0, 0], { dur: 3.5, dist0: 3.2, dist1: 3.0, h0: -.15, h1: -.05, a0: -20, a1: -2, fov0: 42, fov1: 40 }), [.9, 2.4]), 14)],
      [3.0, HH(pullOut([-.6, 1.3, 0], { dur: 3.0, dist0: 3.6, dist1: 4.4, h0: .4, h1: .7, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 15)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-72 (good): siddur opens and glows (prayer happens); clock spins forward; tag turns green; cup takes a curved repeat arrow to the meal side; green check
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd); tableDecor(Wd);
    const bar = mkBar(Wd), clk = mkClock(Wd, CLOCK, 3);
    const cup = mkCup(Wd, [X_EARLY, TOPY, 0], 1); cup.setWine(.85);
    const sb = mkSiddur(Wd, BOOK, 4);
    const grey = tag(Wd, 'חובת קידוש', 'grey', 1.5), green = tag(Wd, 'חובת קידוש', 'green', 1.5);
    const chk = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    const dots = [];
    for (let i = 0; i <= 10; i++) { const d = ball(.035, 0xe0a030, { ink: false }); Wd.add(d); dots.push(d); }
    const arcAt = u => [lerp(X_EARLY, X_KID, u), TOPY + .95 + .5 * Math.sin(PI * u)];
    Wd.on(t => {
      const op = sm(P(.5, 2.2, t));
      sb.setOpen(op);
      sb.glow.material.opacity = .6 * op * (.9 + .1 * Math.sin(t * 3));
      bar.gB.material.opacity = .5 * op;
      sb.f.set(t, { talk: t > 2.5 ? .4 * talkAmt(t, 4) : 0, smile: sm(P(2.5, 3.5, t)), look: [0, 0] });
      clk.pose(4.19 + 4 * PI * sm(P(1, 4.5, t)), 3.49 + (4 * PI / 12) * sm(P(1, 4.5, t)));
      clk.f.set(t, { talk: 0, smile: sm(P(1, 4, t)) * .8, look: [0, 0] });
      const u = sm(P(4.2, 6.0, t)), cx = lerp(X_EARLY, X_KID, u), cy = TOPY + .5 * Math.sin(PI * u);
      cup.g.position.set(cx, cy, 0);
      bar.mk.position.x = cx;
      grey.set([cx, TAG_Y + (cy - TOPY), .3], NUM * (1 - sm(P(2.8, 3.2, t))), 0);
      green.set([cx, TAG_Y + (cy - TOPY), .3], popE(P(3.0, 3.8, t)) * NUM, .03 * Math.sin(t * 1.3));
      dots.forEach((d, i) => {
        const [dx, dy] = arcAt(i / 10);
        d.position.set(dx, dy, .3);
        d.scale.setScalar(.8 * popE(P(4.0 + i * .15, 4.3 + i * .15, t)));
      });
      cup.f.set(t, { talk: t > 4.5 ? .5 * talkAmt(t, 1) : 0, smile: t > 4.5 ? .9 : .2, look: [0, .3] });
      chk.set([0, TOPY + 1.0, .4], popE(P(6.2, 7.0, t)) * .5, .05 * Math.sin(t * 3));
      sk.set([0, TOPY + 1.0, .4], P(6.2, 7.1, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, sb.g, green.g, grey.g, bar.pT.g, chk.g];
    Wd.cam = cuts([
      [4.0, HH(truck([-.6, 1.3, 0], { dur: 4.0, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -10, a1: 8, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 16)],
      [4.0, HH(punch(pushIn([-.4, 1.3, 0], { dur: 4.0, dist0: 3.6, dist1: 3.2, h0: .3, h1: .3, a0: 12, a1: -4, fov0: 42, fov1: 40 }), [3.0]), 17)],
      [4.0, HH(punch(insert([-.6, 1.2, .05], { dur: 4.0, dist0: 3.0, dist1: 2.8, h0: .15, h1: .2, a0: -10, a1: 14, fov0: 36, fov1: 34 }), [5.2]), 18)],
      [4.0, HH(lowHero([-.4, 1.0, 0], { dur: 4.0, dist0: 3.2, dist1: 3.4, h0: -.15, h1: -.05, a0: -12, a1: -4, fov0: 42, fov1: 40 }), 19)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 72-86 (soft): the cup stands on the meal side; soft orange tag "קשה לו" over it; a small ramp appears; tag "לסמוך להקל"; small yellow check, no cross
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd); tableDecor(Wd);
    const bar = mkBar(Wd), clk = mkClock(Wd, CLOCK, 3);
    const cup = mkCup(Wd, [X_KID, TOPY, 0], 1); cup.setWine(.85);
    const sb = mkSiddur(Wd, BOOK, 4);
    const orange = tag(Wd, 'קשה לו', 'orange', 1.1), gold2 = tag(Wd, 'לסמוך להקל', 'gold', 1.4);
    const ramp = box(1.0, .06, .32, 0xc9a060, { pos: [-.5, TOPY + .1, .7] }); Wd.add(ramp);
    const yc = mark3d(Wd, 'check', 1.0);
    Wd.on(t => {
      cup.g.position.set(X_KID, TOPY, 0);
      bar.mk.position.x = X_KID;
      bar.gB.material.opacity = .4;
      bar.pT.set([-1.2, BAR_Y, BAR_Z + .16], NUM, 0);
      bar.mT.set([1.2, BAR_Y, BAR_Z + .16], NUM, 0);
      orange.set([X_KID, TAG_Y, .3], popE(P(1.0, 1.8, t)) * NUM, .02 * Math.sin(t * 1.3));
      gold2.set([1.1, TAG_Y, .3], popE(P(3.4, 4.2, t)) * NUM, .02 * Math.sin(t * 1.1));
      ramp.scale.x = sm(P(2.5, 4.0, t)); ramp.rotation.z = .2 * sm(P(2.5, 4.0, t));
      yc.set([-.45, TOPY + .6, .3], popE(P(5.0, 5.8, t)) * .4, .05 * Math.sin(t * 3));
      cup.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, 1) : 0, smile: .3, look: [-.2, .2] });
      clk.pose(4.19 + .02 * t, 3.49);
      clk.f.set(t, { talk: 0, smile: .4, look: [0, 0] });
      sb.setOpen(0);
      sb.f.set(t, { talk: t > 2 ? .3 * talkAmt(t, 4) : 0, smile: .3, look: [.2, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, orange.g, gold2.g, sb.g, bar.pT.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.4, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 20)],
      [3.5, HH(punch(insert([0, 1.2, .05], { dur: 3.5, dist0: 2.9, dist1: 2.7, h0: .2, h1: .25, a0: -14, a1: 8, fov0: 36, fov1: 34 }), [.5]), 21)],
      [4.0, HH(punch(lowHero([-.4, 1.0, 0], { dur: 4.0, dist0: 3.2, dist1: 3.0, h0: -.1, h1: -.05, a0: -14, a1: -6, fov0: 42, fov1: 40 }), [.6]), 22)],
      [3.0, HH(pullOut([-.4, 1.3, 0], { dur: 3.0, dist0: 3.8, dist1: 4.4, h0: .4, h1: .8, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 23)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (good): the full correct order lights up in sequence: siddur -> cup -> table; big green check; all faces smile
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd); tableDecor(Wd);
    const bar = mkBar(Wd), clk = mkClock(Wd, CLOCK, 3);
    const cup = mkCup(Wd, [X_KID, TOPY, 0], 7); cup.setWine(.85);
    const sb = mkSiddur(Wd, BOOK, 4);
    const gC = glowAt(Wd.scene, 1.6, 0xffd27a, 0); gC.position.set(X_KID, TOPY + .4, .1);
    const gT = glowAt(Wd.scene, 3.2, 0xfff0b0, 0); gT.position.set(.3, TOPY + .2, .3);
    const ok = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      cup.g.position.set(X_KID, TOPY, 0);
      bar.mk.position.x = X_KID;
      bar.pT.set([-1.2, BAR_Y, BAR_Z + .16], NUM, 0);
      bar.mT.set([1.2, BAR_Y, BAR_Z + .16], NUM, 0);
      bar.gB.material.opacity = .7 * bump(t, .5, 2.0);
      gC.material.opacity = .6 * bump(t, 2.0, 3.5);
      gT.material.opacity = .45 * bump(t, 3.5, 5.4);
      bar.gG.material.opacity = .7 * bump(t, 3.5, 5.4);
      sb.setOpen(0);
      sb.f.set(t, { talk: t > .5 ? .5 * talkAmt(t, 4) : 0, smile: 1, look: [0, 0] });
      cup.f.set(t, { talk: t > 2 ? .5 * talkAmt(t, 7) : 0, smile: 1, look: [0, 0] });
      clk.pose(4.19 + 4 * PI * sm(P(1, 4.5, t)), 3.49 + (4 * PI / 12) * sm(P(1, 4.5, t)));
      clk.f.set(t, { talk: t > 4 ? .4 * talkAmt(t, 3) : 0, smile: .9, look: [0, 0] });
      ok.set([0, 1.9, .4], popE(P(5.0, 5.8, t)) * 1.0, .04 * Math.sin(t * 3));
      sk.set([0, 1.9, .4], P(5.0, 5.9, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, sb.g, ok.g, bar.pT.g, bar.mT.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.4, 1.3, 0], { dur: 3.5, dist0: 6.1, dist1: 5.9, h0: .6, h1: .5, a0: -10, a1: 8, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 24)],
      [4.0, HH(punch(pushIn([0, 1.3, 0], { dur: 4.0, dist0: 3.6, dist1: 3.2, h0: .4, h1: .3, a0: 12, a1: -4, fov0: 42, fov1: 40 }), [3.4]), 25)],
      [3.5, HH(punch(insert([.2, 1.2, .05], { dur: 3.5, dist0: 2.9, dist1: 2.7, h0: .2, h1: .25, a0: -14, a1: 8, fov0: 36, fov1: 34 }), [4.4]), 26)],
      [3.0, HH(pullOut([0, 1.3, 0], { dur: 3.0, dist0: 3.4, dist1: 4.6, h0: .4, h1: .8, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 27)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the morning table in sunlight; siddur closed on the left, cup on the right; timeline glows in order; slow crane. Heroes kept to the sides
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd); tableDecor(Wd);
    const bar = mkBar(Wd), clk = mkClock(Wd, CLOCK, 3);
    const cup = mkCup(Wd, [2.0, TOPY, 0], 9); cup.setWine(.85);
    const sb = mkSiddur(Wd, [-2.3, TOPY, -.5], 10);
    Wd.on(t => {
      const pulse = .4 + .2 * Math.sin(t * 2.4);
      bar.gB.material.opacity = pulse * bump(t, 0, 20) * .9 + .2;
      bar.gG.material.opacity = pulse * sm(P(4, 8, t));
      cup.f.set(t, { talk: .4 * talkAmt(t, 9), smile: 1, look: [0, 0] });
      sb.f.set(t, { talk: .3 * talkAmt(t, 10), smile: 1, look: [0, 0] });
      sb.setOpen(0);
      clk.pose(4.19 + .02 * t, 3.49);
      clk.f.set(t, { talk: 0, smile: .8, look: [0, 0] });
      bar.mk.position.x = 2.0;
      bar.pT.set([-1.2, BAR_Y, BAR_Z + .16], NUM, 0);
      bar.mT.set([1.2, BAR_Y, BAR_Z + .16], NUM, 0);
    });
    Wd.center = [0, 0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
