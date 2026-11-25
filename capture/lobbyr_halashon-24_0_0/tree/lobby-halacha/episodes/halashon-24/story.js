// halashon-24 story: "without naming him" - lashon hara even without a name when the listener understands; even without any disgrace, words cunningly meant to harm = "lashon hara betzin'a" (storyboards_v25.md, section B).
// Talking objects only, NO people. COPY FROM halashon-23: same camera helpers, tags, cups, teapot and face helpers.
// Heroes: a TEAPOT (the speaker), a blue CUP "שומע" (the listener), a GREEN MUG "חבר" (the absent friend) on a far shelf.
// Props: a speech bubble with a blank "?" card, a dotted thread to the mug, a light bulb over the cup, a hidden dark arrow under the table, a grey storm cloud over the mug, a magnifying glass.
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
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .05;
  const RED = 0xe03131, DARK = 0x2b2b33, WOOD = 0x8a5a33, POTC = 0xd9735a, CUPBLUE = 0x3a86ff, CUPWHITE = 0xffffff;
  const DKC = 0x2f3440, CLOUD = 0x9aa1ab, GREEN = 0x2fbf5b, SHELF = 0xa0703f, CREAM = 0xf4f1ea;
  const BUBBLE = 0xfff7e0, GOLD = 0xd9a441, PINK = 0xff6fa0, YEL = 0xffe27a, STRIKE = 0x3b3b44, PAPER = 0xffffff;
  const TOP = .99, PZ = .2;                                  // table top; the front row (z)
  const TEAP0 = [-1.4, TOP, PZ], CUP0 = [1.5, TOP, PZ];     // the speaker and the listener
  const BUB = [-1.4, 2.1, PZ + .3];                          // the speech bubble above the teapot
  const MUG = [2.2, 2.05, -3.95];                            // the absent friend, on the far shelf
  const CROSS = [1.2, 2.2, 1.3];                             // where the red cross appears (beats 3, 6)
  const TAG_BAD = ['#ffe3e3', '#8a1010', '#c43030'];
  const TAG_NEU = ['#ffffff', '#222222', '#8a8a8a'];
  const TAG_GOLD = ['#fff6d6', '#5a3a10', '#c9a050'];
  const TAG_GREEN = ['#e8fff0', '#1f6a2a', '#3f9a4a'];
  const TAG_BLUE = ['#e8f0ff', '#1f3f7a', '#4f78b8'];
  // the hidden dark arrow: a path that goes under the table, then up to the mug
  const PTS = [[-1.5, 1.6, PZ + .2], [-1.0, .45, 0], [1.0, .45, -1.0], [2.0, 1.2, -2.9], [MUG[0] - .3, MUG[1] + .5, MUG[2] + .5]];

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

  // ---------------------------------------------------------------- set: floor, back wall, long warm table with four legs, one shelf at the back
  function base(Wd) {
    const fl = box(26, .2, 9, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(26, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    const tb = box(17, .18, 3.0, 0xb07a4a); tb.position.set(-.1, TOP - .09, 0); Wd.add(tb);
    for (const lx of [-7.9, 7.9]) for (const lz of [-1.3, 1.3]) {
      const l = box(.2, TOP - .18, .2, WOOD); l.position.set(lx, (TOP - .18) / 2, lz); Wd.add(l);
    }
    const sh = box(7.2, .1, .45, SHELF); sh.position.set(0, 2.0, -4.2); Wd.add(sh);
    [[-3.0, 0xff8fa3], [-2.2, 0x8fd3ff], [-1.4, 0xffe27a]].forEach(([x, c], j) => {
      const bx = box(.5, .45 + .1 * (j % 2), .35, c); bx.position.set(x, 2.25, -4.2); Wd.add(bx);
    });
    Wd.center = [0, 0];
  }

  // ---------------------------------------------------------------- a cup with a face (the listener)
  function cupHero(Wd, x, z, col, seed) {
    const g = new THREE.Group(); g.position.set(x, TOP, z); Wd.add(g);
    const sau = cyl(.5, .5, .06, CREAM); sau.position.y = .03; g.add(sau);
    const body = cyl(.36, .3, .8, col); body.position.y = .46; g.add(body);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .5, .38], seed });
    return { g, body, f };
  }

  // ---------------------------------------------------------------- the absent friend: a green mug with a face, on the far shelf
  function mugHero(Wd) {
    const g = new THREE.Group(); g.position.set(MUG[0], MUG[1], MUG[2]); g.scale.setScalar(1.3); Wd.add(g);
    const body = cyl(.36, .36, .8, GREEN); body.position.y = .4; g.add(body);
    const handle = box(.1, .4, .12, GREEN); handle.position.set(.42, .4, 0); g.add(handle);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .45, .38], seed: 33 });
    return { g, f };
  }

  // ---------------------------------------------------------------- THE SPEAKER: a teapot with a face on the +z side
  function teapot(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const body = cyl(.36, .42, .5, POTC); body.position.y = .25; g.add(body);
    const lid = ball(.12, POTC); lid.position.y = .56; g.add(lid);
    const spout = box(.3, .08, .08, POTC); spout.position.set(.4, .35, 0); spout.rotation.z = -.5; g.add(spout);
    const f = face(Wd, { w: .4, parent: g, pos: [-.05, .3, .4], seed: 71 });
    const eb = box(.3, .06, .06, DARK); eb.position.set(-.05, .52, .42); g.add(eb);   // sly eyebrow
    return { g, lid, eb, f };
  }

  // ---------------------------------------------------------------- THE SPEECH BUBBLE: a light bubble; inside, a blank white card with "?" (no name), or a clean flower picture
  function bubble(Wd) {
    const g = new THREE.Group(); g.position.set(BUB[0], BUB[1], BUB[2]); Wd.add(g);
    g.add(ball(.5, BUBBLE));
    const card = box(.56, .4, .05, PAPER); card.position.set(0, 0, .48); g.add(card);
    const strike = box(.46, .05, .03, STRIKE); strike.position.set(0, -.02, .53); strike.scale.x = .001; g.add(strike);
    const flower = new THREE.Group(); flower.position.set(0, 0, .5); flower.visible = false; g.add(flower);
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * 2 * PI; const pt = ball(.1, PINK); pt.position.set(Math.cos(a) * .13, Math.sin(a) * .13, .02); flower.add(pt);
    }
    const fc = ball(.07, GOLD); fc.position.z = .05; flower.add(fc);
    const dark = ball(.5, DKC); dark.scale.setScalar(.001); g.add(dark);   // the bubble darkens
    return { g, card, strike, flower, dark };
  }

  // ---------------------------------------------------------------- the dotted thread from the bubble to the mug; red = the thread glows red
  function thread(Wd) {
    const N = 12;
    const from = [BUB[0] + .5, BUB[1] + .05, BUB[2]], to = [MUG[0] - .5, MUG[1] + .6, MUG[2] + .3];
    const at = f => [0, 1, 2].map(i => lerp(from[i], to[i], f) + (i === 1 ? 1.0 * Math.sin(PI * f) : 0));
    const gold = Array.from({ length: N }, () => { const b = ball(.07, GOLD); Wd.add(b); return b; });
    const red = Array.from({ length: N }, () => { const b = ball(.09, RED); Wd.add(b); return b; });
    return { set(f, isRed, pulse) {
      for (let k = 0; k < N; k++) {
        const kf = (k + .5) / N, p = at(kf), on = f > kf;
        gold[k].position.set(p[0], p[1], p[2]); red[k].position.set(p[0], p[1], p[2]);
        gold[k].scale.setScalar(on && !isRed ? 1 : .001);
        red[k].scale.setScalar(on && isRed ? 1 + .25 * Math.sin((pulse || 0) + k) : .001);
      }
    } };
  }

  // ---------------------------------------------------------------- the hidden dark arrow: dots that travel under the table and pop up at the mug
  function hiddenArrow(Wd) {
    const n = PTS.length - 1;
    const pt = f => { const x = clamp(f, 0, 1) * n, i = Math.min(n - 1, Math.floor(x)), u = x - i; return [0, 1, 2].map(k => lerp(PTS[i][k], PTS[i + 1][k], u)); };
    const dots = Array.from({ length: 6 }, () => { const b = ball(.13, DKC); Wd.add(b); return b; });
    const head = ball(.24, DKC); Wd.add(head);
    return { set(f) {
      dots.forEach((b, k) => {
        const fk = f - k * .06, p = pt(fk);
        b.position.set(p[0], p[1], p[2]); b.scale.setScalar(fk > 0 && f < 1.02 ? 1 : .001);
      });
      const hp = pt(1); head.position.set(hp[0], hp[1], hp[2]);
      head.scale.setScalar(Math.max(.001, f >= 1 ? 1 : 0));
    } };
  }

  // ---------------------------------------------------------------- the grey storm cloud over the mug (s = 0..1)
  function stormCloud(Wd) {
    const g = new THREE.Group(); g.position.set(MUG[0], 3.2, MUG[2] + .6); Wd.add(g);
    const parts = [[-.35, 0, .35], [0, .1, 0], [.35, 0, .3], [.1, .25, -.1]].map(([x, y, r]) => {
      const b = ball(r + .1, CLOUD); b.position.set(x, y, 0); g.add(b); return b;
    });
    return { set(s) { g.visible = s > .01; parts.forEach(b => b.scale.setScalar(Math.max(.001, s))); } };
  }

  // ---------------------------------------------------------------- THE MAGNIFYING GLASS: a ring of small balls + a handle (no lens)
  function glassRing(Wd) {
    const ring = Array.from({ length: 10 }, () => { const b = ball(.07, DKC); Wd.add(b); return b; });
    const hd = box(.12, .9, .08, WOOD); Wd.add(hd);
    return { set(c, s) {
      ring.forEach((b, i) => { const an = i / 10 * 2 * PI; b.position.set(c[0] + Math.cos(an) * .5 * s, c[1] + Math.sin(an) * .5 * s, c[2]); b.scale.setScalar(Math.max(.001, s)); });
      hd.position.set(c[0] + .45 * s, c[1] - .45 * s, c[2]); hd.rotation.z = -PI / 4; hd.scale.setScalar(Math.max(.001, s));
    } };
  }

  // ---------------------------------------------------------------- the whole set (same objects in every beat)
  function build(Wd) {
    base(Wd);
    const tp = teapot(Wd, TEAP0);
    const cup = cupHero(Wd, CUP0[0], CUP0[2], CUPBLUE, 20);
    const mug = mugHero(Wd);
    return { tp, cup, mug };
  }

  // ================================================================ HOOK (14 s): extreme close-up on the teapot, pulls out; the speech bubble with a blank "?" card; the blue cup listens; the green mug far on the shelf
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd);
    const qq = tag(Wd, .8, .8, '?', ...TAG_GOLD);
    Wd.qPos = [BUB[0] + .9, BUB[2]];
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.2, 0];
    Wd.on(t => {
      B.tp.g.rotation.y = .9 * sm(P(4, 8, t));
      B.cup.g.rotation.y = -.6 * sm(P(4, 8, t));
      B.tp.lid.position.y = .56 + .07 * Math.abs(Math.sin(t * 7));   // the lid bounces with the talking
      bu.g.scale.setScalar(Math.max(.001, popE(P(2, 3.2, t))));
      B.tp.f.set(t, { smile: .6, talk: talkAmt(t, 3), look: [1, 0] });
      B.cup.f.set(t, { smile: 0, talk: 0, look: [1, 0] });
      B.mug.f.set(t, { smile: 0, talk: 0, look: [-1, 0] });
      qq.set([BUB[0] + .9, 2.0 + bob(t, 3), PZ + .6], popE(P(1.4, 2.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut([TEAP0[0], 1.4, PZ], { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-.6, 1.2, 0], { dur: w[1], dist0: 8.4, dist1: 8.0, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([CUP0[0] - .6, 1.3, PZ], { dur: w[2], dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.4, PZ], { dur: w[3], dist0: 10, dist1: 9.4, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s): the blank "?" card; a stamp "שם" tries to appear on it and stays blank (a grey line crosses it out); tag "בלי שם"
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd);
    const qCard = tag(Wd, .4, .4, '?', ...TAG_NEU);
    const tName = tag(Wd, 1.2, .45, 'שם', ...TAG_NEU);
    const tNo = tag(Wd, 2.2, .5, 'בלי שם', ...TAG_GREEN);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.2, 1.5];
    Wd.on(t => {
      bu.strike.scale.x = Math.max(.001, sm(P(2.0, 2.8, t)));          // the grey line crosses the name out
      qCard.set([BUB[0], BUB[1], BUB[2] + .66], popE(P(.2, .8, t)));
      const ap = popE(P(.8, 1.6, t)) * (1 - sm(P(2.6, 3.4, t)));      // the stamp appears, then fades: it stays blank
      tName.set([BUB[0] + .6, 1.95, PZ + .9], ap);
      tNo.set([-0.4, 1.95, PZ + 1.0], popE(P(1.5, 2.3, t)));
      B.tp.f.set(t, { smile: .2, talk: talkAmt(t, 3), look: [1, 0] });
      B.tp.g.rotation.y = .3;
      B.cup.f.set(t, { smile: 0, talk: 0, look: [1, 0] });
      B.mug.f.set(t, { smile: 0, talk: 0, look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.4, 1.9, 0], { dur: 3.5, dist0: 11, dist1: 10.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [3.5, HH(punch(insert([BUB[0] + .5, 2.0, PZ], { dur: 3.5, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.0]), 22)],
      [3.5, HH(insert([BUB[0], 2.0, PZ + .3], { dur: 3.5, dist0: 4.6, dist1: 4.2, h0: 1.4, h1: 1.5, a0: -4, a1: 4, fov0: 40, fov1: 40 }), 23)],
      [3.5, HH(crane([0, 1.8, 0], { dur: 3.5, dist0: 10.5, dist1: 9.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s): a dotted thread shoots from the bubble across the room and lands on the green mug; the bulb lights over the blue cup, its eyes turn to the mug; tag "השומע מבין"
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd);
    const th = thread(Wd);
    const bulb = ball(.16, YEL); Wd.add(bulb);
    const tH = tag(Wd, 1.8, .42, 'השומע מבין', ...TAG_GOLD);
    const tS = tag(Wd, 1.0, .4, 'שומע', ...TAG_BLUE);
    const tF = tag(Wd, 1.0, .4, 'חבר', ...TAG_GREEN);
    Wd.occ = [B.tp.g, B.cup.g, B.mug.g]; Wd.center = [0, 1.7];
    Wd.on(t => {
      const f = sm(P(.3, 2.6, t));
      th.set(f, false, t * 6);
      bulb.position.set(CUP0[0] - .45, 2.2 + bob(t, 2), PZ + .3);
      bulb.scale.setScalar(Math.max(.001, popE(P(1.8, 2.6, t))));
      tH.set([CUP0[0] + .35, 2.2, PZ + .7], popE(P(2.4, 3.2, t)));
      tS.set([CUP0[0] - .9, 1.6, PZ + .9], popE(P(.6, 1.2, t)));
      tF.set([MUG[0] + .95, 2.0, MUG[2] + .2], popE(P(1.0, 1.8, t)));
      B.tp.f.set(t, { smile: .7, talk: talkAmt(t, 5), look: [1, 0] });
      B.tp.g.rotation.y = .4;
      B.cup.f.set(t, { smile: .3, talk: 0, look: [0, 1], surprise: 0 });
      B.cup.g.rotation.y = -.3;
      B.mug.f.set(t, { smile: .2, talk: 0, look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.9, 0], { dur: 3.5, dist0: 12, dist1: 11.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [3.5, HH(punch(insert([0.9, 1.7, -1.2], { dur: 3.5, dist0: 6.4, dist1: 6.2, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.4]), 32)],
      [3.5, HH(insert([CUP0[0], 1.5, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 33)],
      [3.5, HH(crane([0, 1.6, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): the thread glows red, the bubble darkens, the green mug looks sad; red cross + shock; tag "לשון הרע" under the cross
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd);
    const th = thread(Wd);
    const ck = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    const tL = tag(Wd, 2.4, .6, 'לשון הרע', ...TAG_BAD);
    Wd.occ = [B.tp.g, B.cup.g, B.mug.g]; Wd.center = [0, 1.7];
    Wd.on(t => {
      th.set(1, true, t * 8);
      bu.dark.scale.setScalar(Math.max(.001, sm(P(.5, 2.0, t)) * 1.02));
      const cp = popE(P(2.0, 2.8, t));
      ck.set(CROSS, cp * .8, .05 * Math.sin(t * 4) * (t > 2.8 ? 1 : 0));
      sk.set([CROSS[0], CROSS[1], CROSS[2] - .2], P(2.0, 2.8, t), 1.4);
      tL.set([CROSS[0], CROSS[1] - .8, CROSS[2] + .3], popE(P(2.6, 3.4, t)));
      B.tp.f.set(t, { smile: -.2, talk: .6 * talkAmt(t, 9), look: [1, 0] });
      B.tp.g.rotation.y = .5;
      B.cup.f.set(t, { smile: -.1, talk: 0, look: [0, 1] });
      B.mug.f.set(t, { smile: lerp(-.1, -.6, sm(P(2.0, 2.8, t))), talk: 0, surprise: sm(P(2.0, 2.8, t)), look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.8, 0], { dur: 3.5, dist0: 11, dist1: 10.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 41)],
      [3.5, HH(punch(insert([CROSS[0], 1.9, CROSS[2]], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.9]), 42)],
      [3.5, HH(pushIn([MUG[0], 2.3, MUG[2] + 1], { dur: 3.5, dist0: 7.6, dist1: 7.0, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 43)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (16 s): the picture in the bubble is now an innocent clean flower; a magnifier scans it and shows a green "0"; tag "בלי גנאי"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd);
    bu.card.visible = false; bu.strike.visible = false; bu.flower.visible = true;
    const glass = glassRing(Wd);
    const zero = tag(Wd, .8, .8, '0', ...TAG_GREEN);
    const tNo = tag(Wd, 1.8, .5, 'בלי גנאי', ...TAG_NEU);
    Wd.occ = [B.tp.g, B.cup.g, B.mug.g]; Wd.center = [-.4, 1.6];
    Wd.on(t => {
      const f = sm(P(.6, 3.6, t));
      glass.set([lerp(BUB[0] + 1.6, BUB[0], f), lerp(BUB[1] - 1.0, BUB[1], f), BUB[2] + .9], popE(P(.4, 1.2, t)));
      bu.flower.rotation.z = .5 * sm(P(0, 15, t));                              // the flower turns in the scan
      zero.set([BUB[0] + 1.1, 2.0, PZ + .9], popE(P(3.6, 4.6, t)));
      tNo.set([0.2, 1.3, PZ + 1.0], popE(P(4.6, 5.6, t)));
      B.tp.f.set(t, { smile: .6, talk: .5 * talkAmt(t, 11), look: [1, 0] });
      B.tp.g.rotation.y = .3;
      B.cup.f.set(t, { smile: .2, talk: 0, look: [0, 1] });
      B.mug.f.set(t, { smile: .3, talk: 0, look: [-1, 0] });
    });
    Wd.cam = cuts([
      [4, HH(truck([0, 1.6, 0], { dur: 4, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 51)],
      [4, HH(punch(insert([BUB[0], 2.1, PZ], { dur: 4, dist0: 6.0, dist1: 5.6, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.2]), 52)],
      [4, HH(pushIn([TEAP0[0], 1.4, PZ], { dur: 4, dist0: 6.2, dist1: 5.8, h0: 1.3, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [4, HH(crane([-.4, 1.5, 0], { dur: 4, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s): the teapot squints slyly; the hidden dark arrow travels under the table and pops up at the green mug; a grey storm cloud forms over it; tag "ברמאות"
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd);
    bu.card.visible = false; bu.strike.visible = false; bu.flower.visible = true;
    const ha = hiddenArrow(Wd);
    const cl = stormCloud(Wd);
    const tR = tag(Wd, 2.0, .55, 'ברמאות', ...TAG_NEU);
    const tRx = [0.3, 1.45, PZ + 1.1];
    Wd.occ = [B.tp.g, B.cup.g, B.mug.g]; Wd.center = [-.2, 1.5];
    Wd.on(t => {
      B.tp.eb.rotation.z = -.5 * sm(P(.5, 1.5, t));                // the sly eyebrow
      ha.set(sm(P(.3, 5.0, t)) * 1.0);
      cl.set(sm(P(5.2, 7.2, t)));
      tR.set(tRx, popE(P(1.2, 2.0, t)));
      B.tp.f.set(t, { smile: .4, talk: .6 * talkAmt(t, 15), look: [1, 0] });
      B.cup.f.set(t, { smile: .1, talk: 0, look: [-1, 0] });
      B.mug.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(crane([-1.7, 1.4, PZ], { dur: 3.5, dist0: 9.8, dist1: 9.2, h0: 1.0, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 61)],
      [3.5, HH(punch(insert([TEAP0[0], 1.5, PZ], { dur: 3.5, dist0: 6.0, dist1: 5.6, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [1.6]), 62)],
      [3.5, HH(pushIn([MUG[0], 2.3, MUG[2] + 1], { dur: 3.5, dist0: 7.6, dist1: 7.0, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 63)],
      [3.5, HH(truck([.4, 1.3, 0], { dur: 3.5, dist0: 10, dist1: 9.4, h0: 1.6, h1: 2.0, a0: 6, a1: -6, fov0: 44, fov1: 42, shift: [.6, 0, 0] }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): the hidden arrow is revealed as a label "בצנעא" over it; the cloud stays over the mug; red cross + shock; tag "לשון הרע בצנעא" under the cross
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd);
    bu.card.visible = false; bu.strike.visible = false; bu.flower.visible = true;
    const ha = hiddenArrow(Wd);
    const cl = stormCloud(Wd);
    const ck = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    const tBig = tag(Wd, 1.4, .6, 'בצנעא', ...TAG_BAD);
    const tL = tag(Wd, 2.4, .6, 'לשון הרע בצנעא', ...TAG_BAD);
    const CROSS6 = [0.0, 2.1, 1.2];                              // beat 6: away from the green mug
    Wd.occ = [B.tp.g, B.cup.g, B.mug.g]; Wd.center = [0, 1.7];
    Wd.on(t => {
      ha.set(1);
      cl.set(1);
      tBig.set([-0.3, 1.45, -.5], popE(P(.6, 1.6, t)));                    // the hidden place, labelled
      const cp = popE(P(4.0, 4.8, t));
      ck.set(CROSS6, cp * .8, .05 * Math.sin(t * 4) * (t > 4.8 ? 1 : 0));
      sk.set([CROSS6[0], CROSS6[1], CROSS6[2] - .2], P(4.0, 4.8, t), 1.4);
      tL.set([CROSS6[0], 1.2, CROSS6[2] + .3], popE(P(4.6, 5.4, t)));
      B.tp.f.set(t, { smile: -.4, talk: .5 * talkAmt(t, 21), look: [1, 0] });
      B.tp.g.rotation.y = .6;
      B.cup.g.rotation.y = -.6;
      B.cup.f.set(t, { smile: lerp(-.2, -.6, sm(P(4.0, 4.8, t))), talk: 0, surprise: sm(P(4.0, 4.8, t)), look: [-1, 0] });
      B.mug.f.set(t, { smile: -.6, talk: 0, surprise: .4 * sm(P(4.0, 4.8, t)), look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.6, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 71)],
      [3.5, HH(punch(insert([0.0, 1.8, 1.2], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.0]), 72)],
      [3.5, HH(pushIn([0.4, 1.3, PZ], { dur: 3.5, dist0: 7.0, dist1: 6.6, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 73)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): slow crane; the teapot calm with a quiet smile sends a clean white bubble with a small heart to the blue cup, which smiles; the mug is happy; the cloud is gone. NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.tp.g.position.set(-2.8, TOP, PZ + .6); B.tp.g.rotation.y = .3; B.tp.g.scale.setScalar(1.35);
    B.cup.g.position.set(2.8, TOP, PZ + .6); B.cup.g.rotation.y = -.3; B.cup.g.scale.setScalar(1.35);
    const cl = stormCloud(Wd);
    const cb = new THREE.Group(); cb.visible = false; Wd.add(cb);
    cb.add(ball(.42, PAPER));
    const hl = ball(.09, PINK); hl.position.set(-.09, .05, .36); cb.add(hl);
    const hr = ball(.09, PINK); hr.position.set(.09, .05, .36); cb.add(hr);
    const hb = box(.14, .14, .05, PINK); hb.position.set(0, -.03, .36); hb.rotation.z = PI / 4; cb.add(hb);
    const FROM = [-2.4, .8, PZ + .9], TO = [2.4, .8, PZ + .9];   // low: stays under the card centre
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.4]; Wd.ansD = 6.4;
    Wd.on(t => {
      cl.set(0);                                                 // the cloud is gone
      const s = 1 + .08 * Math.sin(t * 3);                       // the clean bubble stays at the side, above the teapot
      const p = [-2.6, 2.0 + .1 * Math.sin(t * 2), PZ + .9];
      cb.visible = true;
      cb.position.set(p[0], p[1], p[2]); cb.scale.setScalar(Math.max(.001, s));
      B.tp.f.set(t, { smile: .5, talk: 0, look: [1, 0] });
      B.cup.f.set(t, { smile: 1, talk: 0, look: [0, 0] });
      B.mug.f.set(t, { smile: 1, talk: 0, look: [0, 0] });
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.5, PZ], { dur, dist0: 6.4, dist1: 6.0, h0: 1.0, h1: 2.2, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
