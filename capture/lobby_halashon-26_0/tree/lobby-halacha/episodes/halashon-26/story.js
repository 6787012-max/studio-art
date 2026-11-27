// halashon-26 story: "even if no harm came" - a dark gossip bubble with a face is sent at three listener cups; a glass wall stops it; the house-plaque "פלוני" stays unharmed; the harm meter stays at zero; a big stamp still says לשון הרע; the gold scale asks for כפרה; the forecast board predicts zero harm before speaking; a padlock closes the bubble.
// Talking objects only, NO people. Storyboard: storyboards_v27.md (B). COPY FROM halashon-25: same camera helpers, tags, faces, scale.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, FONT, fitText } = K;
  // whole-frame lift: every camera aims lower so the subject sits above the caption band
  const LIFT = .5;
  const lift = p => [p[0], p[1] - LIFT, p[2]];
  // every camera at most 6.5 from its target; anything further is pulled in and narrowed to 36 degrees so the heroes fill the frame
  const fit = o => { if (!o || o.dist0 === undefined) return o; if (o.dist0 <= 6.5 && o.dist1 <= 6.5) return o;
    return Object.assign({}, o, { dist0: Math.min(o.dist0, 6.5), dist1: Math.min(o.dist1, 6.5), fov0: 36, fov1: 36 }); };
  const pushIn = (p, o) => K.pushIn(lift(p), fit(o)), pullOut = (p, o) => K.pullOut(lift(p), fit(o)), truck = (p, o) => K.truck(lift(p), fit(o));
  const crane = (p, o) => K.crane(lift(p), fit(o)), insert = (p, o) => K.insert(lift(p), fit(o));
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const RED = 0xe03131, DARK = 0x2b2b33, WOOD = 0x8a5a33, SHELF = 0xa0703f, CREAM = 0xf4f1ea;
  const CUPBLUE = 0x3a86ff, DKG = 0x4a4a55, DKC = 0x2f3440, GREEN = 0x2fbf5b, GOLD = 0xd9a441;
  const ORANGE = 0xff8a2b, GLASS_C = 0xbfeaff, PANEL = 0xfff4d6;
  const TOP = .99, PZ = .2;                                  // table top; the front row (z)
  const BUB0 = [-1.3, 2.1, PZ + .3];                         // the bubble's resting spot, left of the glass
  const HOUSE = [-2.7, TOP, PZ];                             // the house-plaque "פלוני" (a house, never a figure)
  const GLASS = [.55, TOP + 1.0, PZ];                        // the clear glass wall in front of the cups
  const CUPX = [1.3, 2.1, 2.9];                              // the three listener cups
  const HM = [3.9, TOP + 1.2, -.6];                          // harm meter on its stand
  const SCX = -.6, SCZ = -1.0;                               // the gold scale, back of the table
  const BOARD = [2.2, 2.5, -2.9];                            // the forecast board on the back wall, right side
  const CLOCK = [-1.9, TOP + 1.0, -2.0];                     // the small clock on the table
  const BUB_PT = [1.0, 2.1, -1.1];                           // beat 5: the bubble points at the board
  const TAG_BAD = ['#ffe3e3', '#8a1010', '#c43030'];
  const TAG_NEU = ['#ffffff', '#222222', '#8a8a8a'];
  const TAG_GOLD = ['#fff6d6', '#5a3a10', '#c9a050'];
  const TAG_GREEN = ['#e8fff0', '#1f6a2a', '#3f9a4a'];

  // ---------------------------------------------------------------- tags (billboards with a visible opacity)
  const mkDraw = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill();
    if (border) { c.lineWidth = H * .07; c.strokeStyle = border; c.stroke(); }
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  function tag(Wd, w, h, text, bg, fg, border) {
    const m = texPlane(w, h, mkDraw(text, bg, fg, border), { cw: 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, a) {
      const al = a === undefined ? 1 : a; g.visible = s > .01 && al > .01; if (!g.visible) return;
      g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); m.material.opacity = al; } };
  }

  // ---------------------------------------------------------------- set: floor, back wall, long warm table with four legs
  function base(Wd) {
    const fl = box(26, .2, 9, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(26, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    const tb = box(17, .18, 3.0, 0xb07a4a); tb.position.set(-.1, TOP - .09, 0); Wd.add(tb);
    for (const lx of [-7.9, 7.9]) for (const lz of [-1.3, 1.3]) {
      const l = box(.2, TOP - .18, .2, WOOD); l.position.set(lx, (TOP - .18) / 2, lz); Wd.add(l);
    }
  }

  // ---------------------------------------------------------------- the speech bubble: a dark grey gossip bubble with a face (label "גנות")
  function bubbleHero(Wd) {
    const g = new THREE.Group(); g.position.set(BUB0[0], BUB0[1], BUB0[2]); Wd.add(g);
    g.add(ball(.5, DKG));
    const f = face(Wd, { w: .48, parent: g, pos: [0, .05, .48], seed: 81 });
    return { g, f };
  }

  // ---------------------------------------------------------------- the house-plaque "פלוני" with a face on its front
  function houseHero(Wd) {
    const g = new THREE.Group(); g.position.set(HOUSE[0], HOUSE[1], HOUSE[2]); Wd.add(g);
    const body = box(.9, .7, .55, 0xffe27a); body.position.y = .35; g.add(body);
    const roof = cyl(0, .66, .4, SHELF); roof.position.y = .9; g.add(roof);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .3, .3], seed: 61 });
    return { g, f };
  }

  // ---------------------------------------------------------------- a listener cup with a face
  function cupHero(Wd, x, col, seed) {
    const g = new THREE.Group(); g.position.set(x, TOP, PZ); Wd.add(g);
    const sau = cyl(.5, .5, .06, CREAM); sau.position.y = .03; g.add(sau);
    const body = cyl(.36, .3, .8, col); body.position.y = .46; g.add(body);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .5, .38], seed });
    return { g, f };
  }

  // ---------------------------------------------------------------- the clear glass wall: grows up in beat 1 and stays
  function glassWall(Wd) {
    const g = new THREE.Group(); g.position.set(GLASS[0], GLASS[1], GLASS[2]); g.scale.setScalar(.001); Wd.add(g);
    g.add(box(.08, 2.0, 2.4, GLASS_C));
    return g;
  }

  // ---------------------------------------------------------------- a dial with a needle (harm meter, or the forecast board)
  function meter(Wd, p, sc, stand) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); g.scale.setScalar(sc); Wd.add(g);
    if (stand) { const st = box(.12, 1.2, .12, WOOD); st.position.y = -.6; g.add(st); }
    const disc = cyl(.5, .5, .08, CREAM); disc.rotation.x = PI / 2; g.add(disc);
    const pv = new THREE.Group(); pv.position.set(0, 0, .06); g.add(pv);
    const nd = box(.06, .42, .06, RED); nd.position.y = .18; pv.add(nd);
    return { g, set(a) { pv.rotation.z = a; } };
  }

  // ---------------------------------------------------------------- the forecast board on the back wall, with a crystal ball and a meter
  function forecast(Wd) {
    const g = new THREE.Group(); g.position.set(BOARD[0], BOARD[1], BOARD[2]); Wd.add(g);
    g.add(box(1.8, 1.4, .1, PANEL));
    const dial = cyl(.42, .42, .08, CREAM); dial.rotation.x = PI / 2; dial.position.set(0, -.05, .08); g.add(dial);
    const pv = new THREE.Group(); pv.position.set(0, -.05, .14); g.add(pv);
    const nd = box(.05, .36, .05, RED); nd.position.y = .16; pv.add(nd);
    const cb = ball(.22, 0x9fe8ff); cb.position.set(-1.2, 0, .05); g.add(cb);
    return { set(a) { pv.rotation.z = a; } };
  }

  // ---------------------------------------------------------------- a small clock on the table: its hand rewinds in beat 5
  function clockHero(Wd) {
    const g = new THREE.Group(); g.position.set(CLOCK[0], CLOCK[1], CLOCK[2]); Wd.add(g);
    const face0 = cyl(.36, .36, .08, CREAM); face0.rotation.x = PI / 2; g.add(face0);
    const hand = new THREE.Group(); hand.position.set(0, 0, .07); g.add(hand);
    const hb = box(.05, .28, .05, DARK); hb.position.y = .12; hand.add(hb);
    return { set(a) { hand.rotation.z = a; } };
  }

  // ---------------------------------------------------------------- a circle of small balls (a shield, or an orange pulse)
  function ring(Wd, c, r, n, col, sz) {
    const bs = Array.from({ length: n }, () => { const b = ball(sz, col); b.scale.setScalar(.001); Wd.add(b); return b; });
    return { set(s, spin) {
      bs.forEach((b, k) => {
        const a = k / n * 2 * PI + (spin || 0);
        b.position.set(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]);
        b.scale.setScalar(Math.max(.001, s));
      });
    } };
  }

  // ---------------------------------------------------------------- a padlock (group; the caller moves it)
  function padlock(Wd) {
    const g = new THREE.Group(); g.scale.setScalar(.001); Wd.add(g);
    g.add(box(.4, .32, .2, GOLD));
    const s1 = cyl(.05, .05, .28, GOLD); s1.position.set(-.13, .26, 0); g.add(s1);
    const s2 = cyl(.05, .05, .28, GOLD); s2.position.set(.13, .26, 0); g.add(s2);
    const top = box(.31, .07, .07, GOLD); top.position.set(0, .4, 0); g.add(top);
    return g;
  }

  // ---------------------------------------------------------------- the gold scale: left pan takes the bubble; right pan has a glowing gold "כפרה"
  function scales(Wd) {
    const base0 = box(1.0, .08, .55, WOOD); base0.position.set(SCX, TOP + .04, SCZ); Wd.add(base0);
    const post = box(.1, .9, .1, WOOD); post.position.set(SCX, TOP + .5, SCZ); Wd.add(post);
    const beam = new THREE.Group(); beam.position.set(SCX, TOP + .95, SCZ); Wd.add(beam);
    beam.add(box(1.5, .07, .07, DKC));
    const pan = x => { const p = new THREE.Group(); p.position.set(x, -.25, 0); beam.add(p);
      const s = cyl(.22, .16, .05, 0x9a9aa5); p.add(s); const st = box(.02, .24, .02, DKC); st.position.set(0, .12, 0); p.add(st); return p; };
    pan(-.62);
    const rp = pan(.62);
    const orb = ball(.16, GOLD); orb.position.y = .12; orb.scale.setScalar(.001); rp.add(orb);
    const tL = tag(Wd, 1.0, .35, 'כפרה', ...TAG_GOLD);
    const tG = tag(Wd, 2.4, .5, 'צריך כפרה', ...TAG_GOLD);
    return { tL, tG, set(t) {
      beam.rotation.z = .2 * sm(P(2.4, 3.4, t));                 // the left pan (the bubble) goes down
      orb.scale.setScalar(Math.max(.001, popE(P(1.8, 2.6, t))));  // the gold orb glows on the empty right pan
      tL.set([SCX, 1.25, SCZ + .5], 1);
      tG.set([SCX, 2.45, SCZ + .4], popE(P(2.6, 3.4, t)));
    } };
  }

  // ---------------------------------------------------------------- the whole set (same objects in every beat)
  function build(Wd) {
    base(Wd);
    const house = houseHero(Wd);
    const cups = [cupHero(Wd, CUPX[0], CUPBLUE, 20), cupHero(Wd, CUPX[1], 0xffffff, 21), cupHero(Wd, CUPX[2], 0xff9fc0, 22)];
    const glass = glassWall(Wd);
    const hm = meter(Wd, HM, 1, true);
    return { house, cups, glass, hm };
  }

  // ================================================================ HOOK (14 s): extreme close-up on the bubble's sly face, pulls out; "?" above; the label "גנות" under it; the harm meter at zero
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubbleHero(Wd);
    const qq = tag(Wd, .8, .8, '?', ...TAG_GOLD);
    const tG = tag(Wd, 1.2, .4, 'גנות', ...TAG_BAD);
    Wd.qPos = [BUB0[0] + .9, BUB0[2]];
    Wd.occ = [B.house.g, B.cups[1].g, bu.g]; Wd.center = [-.6, 0];
    Wd.on(t => {
      bu.g.scale.setScalar(Math.max(.001, popE(P(2, 3.2, t))));
      bu.g.position.set(BUB0[0], BUB0[1] + .08 * Math.sin(t * 2), BUB0[2]);
      bu.f.set(t, { smile: .6, talk: talkAmt(t, 3), look: [1, 0] });
      B.house.f.set(t, { smile: 0, talk: 0, look: [1, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: 0, talk: 0, look: [1, 0] }));
      B.hm.set(-1.1);
      qq.set([BUB0[0] + .9, 2.0 + bob(t, 3), PZ + .6], popE(P(1.4, 2.2, t)));
      tG.set([BUB0[0], 1.3, PZ + .9], popE(P(2.6, 3.4, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut([BUB0[0], 2.0, PZ + .4], { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-.6, 1.2, 0], { dur: w[1], dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([CUPX[1] - .6, 1.3, PZ], { dur: w[2], dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.4, PZ], { dur: w[3], dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }
  function bob(t, s) { return Math.sin(t * 1.7 + s) * .05; }

  // ================================================================ BEAT 1 (14 s): the bubble flies at the cups; the glass wall rises; the bubble bounces back; the cups shake their heads; tag "לא קיבלו"
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubbleHero(Wd);
    const tN = tag(Wd, 2.4, .5, 'לא קיבלו', ...TAG_GOLD);
    Wd.occ = [B.house.g, B.cups[1].g, bu.g]; Wd.center = [-.2, 1.5];
    Wd.on(t => {
      const fly = sm(P(.4, 2.0, t)), back = sm(P(2.2, 3.4, t));
      const x = lerp(lerp(BUB0[0], GLASS[0] - .7, fly), BUB0[0], back);
      bu.g.position.set(x, BUB0[1] + .2 * Math.sin(PI * fly) * (1 - back), BUB0[2] + .2 * fly);
      B.glass.scale.setScalar(Math.max(.001, popE(P(.2, 1.0, t))));
      tN.set([0, 2.2, PZ + .9], popE(P(1.2, 2.0, t)));
      bu.f.set(t, { smile: -.5, talk: talkAmt(t, 3), look: [1, 0] });
      B.cups.forEach((c, k) => {
        c.g.rotation.y = .3 * Math.sin(t * 5 + k) * (t > 1.2 ? 1 : 0);
        c.f.set(t, { smile: -.3, talk: 0, look: [-1, 0] });
      });
      B.house.f.set(t, { smile: .3, talk: 0, look: [1, 0] });
      B.hm.set(-1.1);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.4, 1.9, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [3.5, HH(punch(insert([-.4, 1.6, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.4]), 22)],
      [3.5, HH(insert([CUPX[1], 1.4, PZ], { dur: 3.5, dist0: 5.8, dist1: 5.4, h0: 1.2, h1: 1.3, a0: -4, a1: 4, fov0: 40, fov1: 40 }), 23)],
      [3.5, HH(crane([0, 1.8, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, good): the house-plaque "פלוני" smiles, unharmed; a green shield of dots circles it; the harm meter stays at zero and wobbles; tag "בלי נזק"
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubbleHero(Wd);
    B.glass.scale.setScalar(1);
    const sh = ring(Wd, [HOUSE[0], TOP + .4, PZ + .25], .8, 8, GREEN, .09);
    const tG = tag(Wd, 1.8, .5, 'בלי נזק', ...TAG_GREEN);
    Wd.occ = [B.house.g, B.cups[1].g, bu.g]; Wd.center = [-.6, 1.5];
    Wd.on(t => {
      sh.set(popE(P(.3, 1.2, t)), t * .5);
      tG.set([HOUSE[0], 2.0, PZ + .9], popE(P(1.0, 1.8, t)));
      B.house.f.set(t, { smile: .9, talk: talkAmt(t, 7), look: [1, 0] });
      B.hm.set(-1.1 + .08 * Math.sin(t * 5));
      bu.f.set(t, { smile: -.2, talk: 0, look: [1, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: 0, talk: 0, look: [0, 1] }));
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.6, 1.8, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [3.5, HH(punch(insert([HOUSE[0], 1.4, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.4]), 32)],
      [3.5, HH(insert([HM[0], HM[1], HM[2]], { dur: 3.5, dist0: 5.4, dist1: 5.0, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 33)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): even so, a big stamp "לשון הרע" comes down on the bubble; red cross + shock on the bubble; tag "לשון הרע"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubbleHero(Wd);
    B.glass.scale.setScalar(1);
    const ck = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    const tS = tag(Wd, 2.2, .6, 'לשון הרע', ...TAG_BAD);
    const CR = [BUB0[0] + .7, BUB0[1] + .3, PZ + .8];
    Wd.occ = [B.house.g, B.cups[1].g, bu.g]; Wd.center = [-.6, 1.6];
    Wd.on(t => {
      const cp = popE(P(1.4, 2.2, t));
      bu.g.position.set(BUB0[0], BUB0[1], BUB0[2]);
      bu.g.rotation.z = .08 * Math.sin(t * 9) * (t > 1.4 ? 1 : 0);
      ck.set(CR, cp * .8, .05 * Math.sin(t * 4) * (t > 2.2 ? 1 : 0));
      sk.set([CR[0], CR[1], CR[2] - .2], P(1.4, 2.2, t), 1.4);
      const sz = t < .6 ? 0 : lerp(1.8, 1, sm(P(.6, 1.2, t)));   // the stamp drops from big to normal
      tS.set([BUB0[0], 2.3, PZ + 1.0], sz);
      bu.f.set(t, { smile: -.6, talk: .5 * talkAmt(t, 9), surprise: sm(P(1.4, 2.2, t)), look: [0, 1] });
      B.house.f.set(t, { smile: -.3, talk: 0, look: [1, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.6, 1.8, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 41)],
      [3.5, HH(punch(insert([BUB0[0] + .2, 2.2, PZ + .4], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.4]), 42)],
      [3.5, HH(insert([HOUSE[0], 1.5, PZ], { dur: 3.5, dist0: 6.0, dist1: 5.6, h0: 1.4, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 43)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (16 s, bad): the bubble lands on the left pan of the gold scale and it sinks; the empty right pan rises with a glowing "כפרה"; tag "צריך כפרה"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubbleHero(Wd);
    B.glass.scale.setScalar(1);
    const sc = scales(Wd);
    Wd.occ = [B.house.g, B.cups[1].g, bu.g]; Wd.center = [-.6, 1.5];
    Wd.on(t => {
      const land = sm(P(.5, 2.4, t));
      bu.g.position.set(lerp(BUB0[0], SCX - .62, land), lerp(BUB0[1], 2.2, land), lerp(BUB0[2], SCZ, land));
      bu.f.set(t, { smile: -.4, talk: .5 * talkAmt(t, 11), surprise: .3 * land, look: [1, 0] });
      B.house.f.set(t, { smile: 0, talk: 0, look: [1, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
      sc.set(t);
    });
    Wd.cam = cuts([
      [4, HH(truck([-.6, 1.6, 0], { dur: 4, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 51)],
      [4, HH(punch(insert([SCX, 1.8, SCZ], { dur: 4, dist0: 6.0, dist1: 5.6, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.6]), 52)],
      [4, HH(pushIn([SCX, 2.0, SCZ + 1], { dur: 4, dist0: 6.5, dist1: 6.2, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 53)],
      [4, HH(crane([-.4, 1.5, 0], { dur: 4, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, good): BEFORE speaking, a small clock rewinds; the forecast board shows the harm meter predicted at zero; the bubble points at it proudly; an orange pulse; tag "משער מראש"
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubbleHero(Wd);
    B.glass.scale.setScalar(.001);
    const fc = forecast(Wd);
    const clk = clockHero(Wd);
    const rg = ring(Wd, BUB_PT, .75, 6, ORANGE, .08);
    const tF = tag(Wd, 1.0, .4, 'משער', ...TAG_NEU);
    const tM = tag(Wd, 2.4, .5, 'משער מראש', ...TAG_GOLD);
    Wd.occ = [B.cups[1].g, bu.g]; Wd.center = [.6, 1.6];
    Wd.on(t => {
      const pt = sm(P(.4, 1.6, t));
      bu.g.position.set(lerp(BUB0[0], BUB_PT[0], pt), lerp(BUB0[1], BUB_PT[1], pt), lerp(BUB0[2], BUB_PT[2], pt));
      bu.f.set(t, { smile: .8, talk: talkAmt(t, 13), look: [-1, 1] });
      fc.set(-1.1);
      clk.set(-2.0 * sm(P(.8, 2.4, t)));
      rg.set(popE(P(2.4, 3.2, t)), t * 4);
      tF.set([BOARD[0], 1.45, BOARD[2] + .4], popE(P(.4, 1.0, t)));
      tM.set([BUB_PT[0] + 1.6, 2.3, BUB_PT[2] - .6], popE(P(2.0, 2.8, t)));
      B.house.f.set(t, { smile: .4, talk: 0, look: [1, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: .2, talk: 0, look: [0, 1] }));
    });
    Wd.cam = cuts([
      [3.5, HH(truck([.6, 1.8, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 61)],
      [3.5, HH(punch(insert([BOARD[0], 2.0, BOARD[2]], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.0]), 62)],
      [3.5, HH(insert([BUB_PT[0], 2.0, BUB_PT[2]], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 63)],
      [3.5, HH(crane([.4, 1.5, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): the bubble tries to fly out; a padlock falls and closes it; red cross + shock; tag "אסור לספר"
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubbleHero(Wd);
    B.glass.scale.setScalar(1);
    const lk = padlock(Wd);
    const ck = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    const CR = [BUB0[0] + .7, BUB0[1] + .3, PZ + .8];
    const tL = tag(Wd, 2.2, .5, 'אסור לספר', ...TAG_BAD);
    Wd.occ = [B.house.g, B.cups[1].g, bu.g]; Wd.center = [-.6, 1.6];
    Wd.on(t => {
      const out = sm(P(.3, 1.4, t));
      const bx = BUB0[0] + .4 * out, bz = BUB0[2] + .5 * out;
      bu.g.position.set(bx, BUB0[1], bz);
      lk.position.set(bx, lerp(2.9, BUB0[1] - .45, sm(P(1.4, 2.6, t))), bz + .5);
      lk.scale.setScalar(Math.max(.001, popE(P(1.2, 2.0, t))));
      ck.set(CR, popE(P(2.2, 3.0, t)) * .8, .05 * Math.sin(t * 4) * (t > 3.0 ? 1 : 0));
      sk.set([CR[0], CR[1], CR[2] - .2], P(2.2, 3.0, t), 1.4);
      tL.set([.6, 2.0, PZ + 1.0], popE(P(2.6, 3.4, t)));
      bu.f.set(t, { smile: -.4, talk: talkAmt(t, 15), surprise: sm(P(2.2, 3.0, t)), look: [1, 0] });
      B.house.f.set(t, { smile: -.5, talk: 0, look: [1, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: -.3, talk: 0, look: [-1, 0] }));
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.6, 1.8, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 71)],
      [3.5, HH(punch(insert([BUB0[0] + .2, 1.9, PZ + .5], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.8]), 72)],
      [3.5, HH(insert([CUPX[1], 1.5, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 73)],
      [3.5, HH(truck([-1.0, 1.6, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.4, h1: 1.8, a0: 6, a1: -6, fov0: 42, fov1: 42 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): slow crane; the bubble is locked at one side and small; the house-plaque and the three cups smile at the other side; NO red cross
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.glass.scale.setScalar(.001);
    B.house.g.position.set(-.7, TOP, PZ + .2);
    const bu = bubbleHero(Wd);
    bu.g.position.set(-2.9, 2.0, PZ + .5); bu.g.scale.setScalar(.9);
    bu.f.set(0, { smile: -.4, talk: 0, look: [0, 1] });
    const lk = padlock(Wd); lk.position.set(-2.9, 1.5, PZ + 1.0); lk.scale.setScalar(1);
    Wd.occ = [B.house.g, B.cups[1].g]; Wd.center = [0, 1.4]; Wd.ansD = 6.4;
    Wd.on(t => {
      B.house.f.set(t, { smile: 1, talk: 0, look: [0, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: 1, talk: 0, look: [0, 0] }));
      bu.f.set(t, { smile: -.4, talk: 0, look: [0, 1] });
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur, dist0: 5.2, dist1: 4.8, h0: 1.0, h1: 2.2, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
