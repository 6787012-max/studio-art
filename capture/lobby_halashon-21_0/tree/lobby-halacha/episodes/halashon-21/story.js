// halashon-21 story: "even to his face" (storyboards_v22.md, section B).
// Talking objects only, NO people. COPY FROM halashon-20: same tags, base, faces, meter, walk, arrow and camera helpers.
// Heroes: a sly TEAPOT (the speaker), a blue CUP (the one spoken about), a dark grey SPEECH BALL with a thundercloud,
// two listener cups behind the blue cup, a wall screen, a balance scale, a gold stamp "אמת", a worry meter "בושה".
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, arcPt, FONT, fitText } = K;
  // whole-frame lift: every camera aims lower so the subject sits above the caption band
  const LIFT = .5;
  const lift = p => [p[0], p[1] - LIFT, p[2]];
  const pushIn = (p, o) => K.pushIn(lift(p), o), pullOut = (p, o) => K.pullOut(lift(p), o), truck = (p, o) => K.truck(lift(p), o);
  const crane = (p, o) => K.crane(lift(p), o), insert = (p, o) => K.insert(lift(p), o);
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .05;
  const GOLD = 0xf2c14e, RED = 0xe03131, PAPER = 0xf4e4b8, LIT = 0xffd166, DARK = 0x2b2b33;
  const WOOD = 0x8a5a33, SHELF = 0xa0703f, POTC = 0xd9735a, CUPBLUE = 0x3a86ff, CUPWHITE = 0xffffff;
  const DKB = 0x4a4f5c, DKC = 0x2f3440, SCRN = 0xd9b38c, CLOUD = 0xb6bcc6, PANC = 0xbfe9ff;
  const TOP = .99, PZ = .2;                              // table top; the front row (z)
  const TEAP0 = [-1.7, TOP, PZ], CUP0 = [1.8, TOP, PZ];  // the speaker and the one spoken about
  const BUB_HOME = [-1.0, TOP + .85, .35];               // the speech ball, in front of the teapot
  const LIS = [[3.4, -.7, 0x9ee0a0, 40], [4.2, -.2, 0xffd27a, 41]];   // two listener cups behind the blue cup
  const SCR = [.1, -.1];                                 // the wall screen (x, z)
  const METER = [.4, 1.1];                               // worry meter, front-middle
  const PIV = [0, TOP + 1.6, 0];                         // balance scale pivot
  const TAG_BAD = ['#ffe3e3', '#8a1010', '#c43030'];
  const TAG_NEU = ['#ffffff', '#222222', '#8a8a8a'];
  const TAG_GOLD = ['#fff6d6', '#5a3a10', '#c9a050'];
  const TAG_GREEN = ['#e8fff0', '#1f6a2a', '#3f9a4a'];
  const TAG_BLUE = ['#e8f0ff', '#1f3f7a', '#4f78b8'];

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

  // ---------------------------------------------------------------- set: floor, back wall, long warm table with four legs, shelves
  function base(Wd) {
    const fl = box(26, .2, 9, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(26, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    const tb = box(17, .18, 3.0, 0xb07a4a); tb.position.set(-.1, TOP - .09, 0); Wd.add(tb);
    for (const lx of [-7.9, 7.9]) for (const lz of [-1.3, 1.3]) {
      const l = box(.2, TOP - .18, .2, WOOD); l.position.set(lx, (TOP - .18) / 2, lz); Wd.add(l);
    }
    [2.0, 2.7].forEach((y, k) => {
      const sh = box(7.2, .1, .45, SHELF); sh.position.set(0, y, -4.2); Wd.add(sh);
      [[-3.0, 0xff8fa3], [-2.2, 0x8fd3ff], [-1.4, 0xffe27a], [1.6, 0xb5f5a0], [2.4, 0xffb86b], [3.2, 0xd6b8ff]].forEach(([x, c], j) => {
        const bx = box(.5, .45 + .1 * ((j + k) % 2), .35, c); bx.position.set(x, y + .25, -4.2); Wd.add(bx);
      });
    });
    Wd.center = [0, 0];
  }

  // ---------------------------------------------------------------- a cup with a face; a white overlay grows from its top down (blushing pale)
  function cupHero(Wd, x, z, col, seed) {
    const g = new THREE.Group(); g.position.set(x, TOP, z); Wd.add(g);
    const sau = cyl(.5, .5, .06, 0xf4f1ea); sau.position.y = .03; g.add(sau);
    const body = cyl(.36, .3, .8, col); body.position.y = .46; g.add(body);
    const white = cyl(.37, .31, .8, CUPWHITE); white.position.y = .86; white.scale.y = .001; g.add(white);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .5, .38], seed });
    return { g, body, white, f };
  }
  const setWhite = (c, s) => { const k = Math.max(.001, s); c.white.scale.y = k; c.white.position.y = .86 - .4 * k; };

  // ---------------------------------------------------------------- THE SPEAKER: a sly teapot with a face on the +z side (its spout points where it turns)
  function teapot(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const body = cyl(.36, .42, .5, POTC); body.position.y = .25; g.add(body);
    const lid = ball(.12, POTC); lid.position.y = .56; g.add(lid);
    const spout = box(.3, .08, .08, POTC); spout.position.set(.4, .35, 0); spout.rotation.z = -.5; g.add(spout);
    const f = face(Wd, { w: .4, parent: g, pos: [-.05, .3, .4], seed: 71 });
    return { g, lid, f };
  }

  // ---------------------------------------------------------------- THE SPEECH BALL: dark grey, with a little thundercloud on top ("לשון הרע")
  function dark(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    const bl = ball(.32, DKB); g.add(bl);
    const cl = new THREE.Group(); cl.position.y = .4; g.add(cl);
    [[-.14, 0, .15], [.13, .03, .14], [0, .16, .13]].forEach(([x, y, r]) => { const c = ball(r, DKC); c.position.set(x, y, 0); cl.add(c); });
    return { g, bl, cl };
  }

  // ---------------------------------------------------------------- the wall screen (a panel with a little frame)
  function screen(Wd) {
    const s = box(1.5, 1.3, .12, SCRN); s.position.set(SCR[0], TOP + .65, SCR[1]); Wd.add(s);
    return s;
  }

  // ---------------------------------------------------------------- a moving arrow from a to b; s = how much of it is drawn (0..1)
  function arrow(Wd, col) {
    const g = new THREE.Group(); Wd.add(g);
    const st = box(1, .1, .1, col); g.add(st);
    const hd = ball(.14, col); g.add(hd);
    return { g, set(a, b, s) {
      g.visible = s > .01; if (!g.visible) return;
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      g.position.set(a[0], a[1], a[2]); g.rotation.z = Math.atan2(dy, dx);
      st.scale.x = Math.max(.001, len * s); st.position.x = len * s / 2;
      hd.position.x = len * s;
    } };
  }

  // ---------------------------------------------------------------- the worry METER: a post and a bar; the green fill grows from the left
  function meter(Wd, x, z) {
    const g = new THREE.Group(); g.position.set(x, TOP, z); Wd.add(g);
    const post = box(.08, .8, .08, WOOD); post.position.y = .4; g.add(post);
    const bar = box(1.6, .3, .1, 0x59606b); bar.position.set(0, .95, 0); g.add(bar);
    const fill = box(1.6, .22, .14, 0x2fbf5b); fill.position.set(0, .95, .01); fill.scale.x = .001; g.add(fill);
    return { g, fill, set(f) { const k = Math.max(.001, f); fill.scale.x = k; fill.position.x = -.8 * (1 - k); } };
  }

  // ---------------------------------------------------------------- piecewise walk on the table: pts [x,z] reached at times ts
  function walk(t, pts, ts) {
    if (t <= ts[0]) return pts[0];
    for (let i = 0; i < pts.length - 1; i++) {
      if (t < ts[i + 1]) { const u = sm(P(ts[i], ts[i + 1], t)); return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]; }
    }
    return pts[pts.length - 1];
  }

  // ---------------------------------------------------------------- the balance SCALE: post, pivot beam, two pans (local coords, rotated by the beam)
  const toW = (lx, ly, th) => [PIV[0] + lx * Math.cos(th) - ly * Math.sin(th), PIV[1] + lx * Math.sin(th) + ly * Math.cos(th), 0];

  // ---------------------------------------------------------------- the whole set (same objects in every beat; each beat animates what it needs)
  function build(Wd) {
    base(Wd);
    const tp = teapot(Wd, TEAP0);
    const cup = cupHero(Wd, CUP0[0], CUP0[2], CUPBLUE, 20);
    const lis = LIS.map(([x, z, c, s]) => cupHero(Wd, x, z, c, s));
    const bub = dark(Wd); bub.g.position.set(BUB_HOME[0], BUB_HOME[1], BUB_HOME[2]);
    return { tp, cup, lis, bub };
  }
  // the two listener cups stay neutral and turn to whoever is talking
  const idleLis = (B, t) => B.lis.forEach(l => l.f.set(t, { smile: .1, talk: 0, look: [-1, 0] }));

  // ================================================================ HOOK (14 s): extreme close-up on the teapot's face, pulls out: it turns to the blue cup; a dark bubble swells toward it; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const qq = tag(Wd, .8, .8, '?', ...TAG_GOLD);
    Wd.qPos = [TEAP0[0], TEAP0[2]];
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.2, 0];
    Wd.on(t => {
      const grow = sm(P(2, 9, t));
      B.bub.g.position.set(lerp(BUB_HOME[0], .2, grow), lerp(BUB_HOME[1], TOP + .9, grow) + .03 * Math.sin(t * 2.2), lerp(BUB_HOME[2], .35, grow));
      B.bub.g.scale.setScalar(.3 + .7 * grow);
      B.tp.g.rotation.y = .9 * sm(P(4, 8, t));
      B.cup.g.rotation.y = -.6 * sm(P(4, 8, t));
      B.tp.f.set(t, { smile: .3, talk: talkAmt(t, 3), look: [1, 0] });
      B.cup.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
      idleLis(B, t);
      qq.set([TEAP0[0], 2.4 + bob(t, 3), PZ], popE(P(1.4, 2.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut([TEAP0[0], 1.4, PZ], { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-.6, 1.2, 0], { dur: w[1], dist0: 8.4, dist1: 8.0, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([.2, 1.3, PZ], { dur: w[2], dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.4, PZ], { dur: w[3], dist0: 10, dist1: 9.4, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, bad): a gold stamp "אמת" lands on the dark bubble; the bubble still gets a red cross; tag "גם אמת - אסור"
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const q = tag(Wd, 3.0, .6, 'גם אמת - אסור', ...TAG_BAD);
    const stamp = tag(Wd, 1.1, .5, 'אמת', ...TAG_GOLD);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.tp.g, B.bub.g]; Wd.center = [-.4, 1.2];
    Wd.on(t => {
      const drop = sm(P(1.0, 3.0, t));
      B.bub.g.position.set(BUB_HOME[0], BUB_HOME[1] + .03 * Math.sin(t * 2.2), BUB_HOME[2]);
      B.bub.g.scale.y = 1 - .1 * Math.sin(clamp(P(3.0, 4.4, t), 0, 1) * PI);
      stamp.set([BUB_HOME[0], lerp(3.4, BUB_HOME[1] + .6, drop), .6], t < .6 ? 0 : 1);
      cx.set([BUB_HOME[0], BUB_HOME[1] + .15, .8], popE(P(4.5, 5.3, t)) * .75, .05 * Math.sin(t * 4) * (t > 5.3 ? 1 : 0));
      sk.set([BUB_HOME[0], BUB_HOME[1], PZ], P(4.5, 5.3, t), 1.2);
      B.tp.g.rotation.y = .5;
      B.tp.f.set(t, { smile: -.2, talk: .8 * talkAmt(t, 7), look: [1, 0] });
      B.cup.g.rotation.y = -.5;
      B.cup.f.set(t, { smile: -.3, talk: 0, surprise: sm(P(4.5, 5.3, t)), look: [-1, 0] });
      idleLis(B, t);
      q.set([0, 2.1 + bob(t, 1), PZ], popE(P(.4, 1.2, t)));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-.4, 1.4, 0], { dur: w[0], dist0: 9.5, dist1: 9.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [w[1], HH(punch(insert([BUB_HOME[0] + .3, 2.3, PZ],{ dur: w[1], dist0: 5.4, dist1: 5.0, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [1.0]), 22)],
      [w[2], HH(pushIn([-1.6, 1.2, PZ], { dur: w[2], dist0: 6.4, dist1: 5.8, h0: 1.2, h1: 1.5, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 23)],
      [w[3], HH(crane([.4, 1.4, 0], { dur: w[3], dist0: 9.5, dist1: 8.6, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s): the teapot walks behind the wall screen and behind the blue cup's back, whispering to the listeners; a thought cloud "הייתי אומר בפניו" with an arrow to the blue cup
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const scr = screen(Wd);
    const cloud = new THREE.Group(); Wd.add(cloud);
    [[-.8, 0, .5], [.8, 0, .5], [0, .3, .6], [-.3, .1, .5], [.3, .1, .5]].forEach(([x, y, r]) => { const c = ball(r, CLOUD); c.position.set(x, y, 0); cloud.add(c); });
    const tTh = tag(Wd, 2.8, .55, 'הייתי אומר בפניו', ...TAG_NEU);
    const tMain = tag(Wd, 2.8, .6, '״גם בפניו״', ...TAG_BLUE);
    const ar = arrow(Wd, DARK);
    B.bub.g.visible = false;
    Wd.occ = [B.cup.g, B.tp.g]; Wd.center = [.4, 1.0];
    Wd.on(t => {
      const p = walk(t, [[TEAP0[0], TEAP0[2]], [-.2, -.85], [2.8, -1.0]], [0, 3.5, 7.5]);
      B.tp.g.position.set(p[0], TOP, p[1]);
      B.tp.g.rotation.y = .4;
      B.tp.f.set(t, { smile: -.2, talk: .6 * talkAmt(t, 9), look: [1, 0] });
      const ca = popE(P(2.8, 3.8, t));
      cloud.position.set(p[0] + .2, 2.85 + .08 * Math.sin(t * 2.2), p[1]);
      cloud.scale.setScalar(Math.max(.001, ca));
      tTh.set([p[0] + .2, 2.85 + .08 * Math.sin(t * 2.2), p[1] + .8], popE(P(3.0, 3.8, t)));
      ar.set([p[0] + .4, 2.4, p[1]], [CUP0[0] - .4, TOP + 1.0, PZ], sm(P(5.0, 7.0, t)));
      B.cup.g.rotation.y = -.6;
      B.cup.f.set(t, { smile: -.4, talk: 0, look: [-1, 0] });
      B.lis.forEach((l, i) => l.f.set(t, { smile: .3, talk: .4 * talkAmt(t, 11 + i) * sm(P(4, 6, t)), look: [-1, 0] }));
      tMain.set([1.6, 2.4 + bob(t, 4), PZ], popE(P(.4, 1.2, t)));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-.6, 1.4, 0], { dur: w[0], dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [w[1], HH(insert([-.2, 2.2, -.2], { dur: w[1], dist0: 5.8, dist1: 5.4, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 32)],
      [w[2], HH(pushIn([CUP0[0], 1.2, PZ], { dur: w[2], dist0: 6.4, dist1: 5.8, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 33)],
      [w[3], HH(crane([.6, 1.4, 0], { dur: w[3], dist0: 10, dist1: 9.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): the teapot turns and pours the dark bubble straight at the blue cup, face to face; a red cross and a shock; the label "לשון הרע" stays on the bubble; tag "בפניו ממש"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const tLab = tag(Wd, 2.0, .5, 'לשון הרע', ...TAG_NEU);
    const tMain = tag(Wd, 3.0, .6, 'בפניו ממש', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.5), sk = shock(Wd, 0xff7a7a);
    const land = [CUP0[0] - .55, TOP + .9, PZ + .35];
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.0];
    Wd.on(t => {
      B.tp.g.rotation.y = .9 * sm(P(1.5, 3.5, t));
      B.tp.f.set(t, { smile: -.6, talk: .6 * talkAmt(t, 9), look: [1, 0] });
      const u = sm(P(3.5, 6.4, t));
      const pa = arcPt(BUB_HOME, land, u, .9);
      const w = Math.sin(clamp(P(6.4, 7.4, t), 0, 1) * PI);
      B.bub.g.position.set(pa[0], pa[1] + (u >= 1 ? .03 * Math.sin(t * 2.2) : 0), pa[2]);
      B.bub.g.scale.set(1 + .12 * w, 1 - .12 * w, 1);
      tLab.set([pa[0], pa[1] + .95, pa[2]], popE(P(3.5, 4.2, t)));
      B.cup.g.rotation.y = -.6;
      B.cup.g.rotation.z = (t > 6.4 ? .08 * Math.sin(t * 30) * (1 - sm(P(6.8, 7.8, t))) : 0);
      B.cup.f.set(t, { smile: lerp(-.1, -.6, sm(P(6.4, 7.0, t))), talk: 0, surprise: sm(P(6.4, 6.9, t)), look: [-1, 0] });
      idleLis(B, t);
      cx.set([CUP0[0], 1.9, PZ + .6], popE(P(6.4, 7.2, t)), .05 * Math.sin(t * 4) * (t > 7.2 ? 1 : 0));
      sk.set([CUP0[0], 1.4, PZ], P(6.4, 7.2, t), 1.4);
      tMain.set([-.4, 2.1 + bob(t, 4), PZ], popE(P(7.2, 8.0, t)));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-.4, 1.4, 0], { dur: w[0], dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 41)],
      [w[1], HH(punch(insert([-.4, 1.4, PZ], { dur: w[1], dist0: 5.8, dist1: 5.4, h0: 1.3, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.9]), 42)],
      [w[2], HH(pushIn([CUP0[0], 1.2, PZ], { dur: w[2], dist0: 7.6, dist1: 7.0, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 43)],
      [w[3], HH(crane([.2, 1.4, 0], { dur: w[3], dist0: 10, dist1: 9.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, bad, diagram): a balance scale; left pan "שלא בפניו", right pan "בפניו"; the bubble drops into the right pan, which sinks lower and glows red; tag "גדול יותר"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.tp.g.position.set(-2.3, TOP, PZ); B.cup.g.position.set(2.3, TOP, PZ);
    const plate = box(.9, .1, .6, 0x8a8f99); plate.position.set(0, TOP + .05, 0); Wd.add(plate);
    const post = box(.1, 1.6, .1, WOOD); post.position.set(0, TOP + .8, 0); Wd.add(post);
    const piv = new THREE.Group(); piv.position.set(PIV[0], PIV[1], PIV[2]); Wd.add(piv);
    const beamG = new THREE.Group(); piv.add(beamG);
    const beam = box(2.4, .1, .12, WOOD); beamG.add(beam);
    const pans = [-1.1, 1.1].map(x => {
      const s = box(.03, .75, .03, WOOD); s.position.set(x, -.375, 0); beamG.add(s);
      const p = cyl(.45, .45, .08, PANC); p.position.set(x, -.75, 0); beamG.add(p);
      return p;
    });
    const ballL = ball(.2, PAPER); beamG.add(ballL);
    const tL = tag(Wd, 2.0, .5, 'שלא בפניו', ...TAG_NEU);
    const tR = tag(Wd, 1.3, .5, 'בפניו', ...TAG_BAD);
    const tMain = tag(Wd, 3.0, .6, 'גדול יותר', ...TAG_BAD);
    const PAN_BASE = new THREE.Color(PANC), PAN_RED = new THREE.Color(RED);
    B.bub.g.visible = true;
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      const tilt = -.25 * sm(P(3.5, 5.5, t));
      beamG.rotation.z = tilt;
      // the speech ball travels from the teapot and settles in the right pan (scaled down)
      const u = sm(P(1.8, 3.4, t));
      const tgt = toW(1.1, -.3, tilt);
      const bp = arcPt(BUB_HOME, tgt, u, .8);
      B.bub.g.position.set(bp[0], bp[1] + (u >= 1 ? .03 * Math.sin(t * 2.2) : 0), bp[2]);
      B.bub.g.scale.setScalar(1 - .4 * u);
      ballL.position.set(-1.1, -.3, 0); ballL.scale.setScalar(Math.max(.001, popE(P(.8, 1.4, t))));
      pans[1].material.color.copy(PAN_BASE).lerp(PAN_RED, sm(P(3.5, 5.5, t)));
      const lp = toW(-1.1, -1.0, tilt), rp = toW(1.1, -1.0, tilt);
      tL.set([lp[0], lp[1], .6], popE(P(.6, 1.2, t)));
      tR.set([rp[0], rp[1], .6], popE(P(2.2, 3.0, t)));
      tMain.set([0, 2.45 + bob(t, 4), PZ], popE(P(5.5, 6.3, t)));
      B.tp.f.set(t, { smile: -.6, talk: .6 * talkAmt(t, 13), look: [1, 0] });
      B.tp.g.rotation.y = .6;
      B.cup.g.rotation.y = -.6;
      B.cup.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
      idleLis(B, t);
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(insert([0, TOP + .9, 0], { dur: w[0], dist0: 6.6, dist1: 6.2, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 44, fov1: 44 }), 51)],
      [w[1], HH(punch(truck([-.4, 1.3, 0], { dur: w[1], dist0: 9.0, dist1: 8.6, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.4, 0, 0] }), [2.0]), 52)],
      [w[2], HH(pushIn([1.1, 1.8, .6], { dur: w[2], dist0: 5.6, dist1: 5.0, h0: 1.2, h1: 1.4, a0: -4, a1: 4, fov0: 42, fov1: 42 }), 53)],
      [w[3], HH(crane([0, 1.4, 0], { dur: w[3], dist0: 9.5, dist1: 8.6, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): the teapot puffs up with red spikes and cheeks, the blue cup bubbles up angry; lightning zig-zags between them; the counter "מריבות" climbs 1, 2, 3; tag "עזות ומריבות"
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.bub.g.visible = false;
    const spikes = [];
    for (let i = 0; i < 6; i++) {
      const a = i * PI / 3; const sp = cyl(.02, .09, .32, RED);
      sp.position.set(Math.cos(a) * .28, .78, Math.sin(a) * .28); sp.scale.y = .001; B.tp.g.add(sp); spikes.push(sp);
    }
    const cheeks = [[-.32, .3], [.24, .3]].map(([x, y]) => { const c = ball(.08, RED); c.position.set(x, y, .3); c.scale.setScalar(.001); B.tp.g.add(c); return c; });
    const LA = [TEAP0[0] + .5, TOP + .7, PZ + .1], LB = [CUP0[0] - .5, TOP + .7, PZ + .1];
    const zig = [LA, [lerp(LA[0], LB[0], .25), TOP + 1.15, PZ + .1], [lerp(LA[0], LB[0], .5), TOP + .35, PZ + .1],
                 [lerp(LA[0], LB[0], .75), TOP + 1.15, PZ + .1], LB];
    const bolts = zig.slice(0, -1).map((p, i) => ({ seg: arrow(Wd, LIT), a: p, b: zig[i + 1] }));
    const cnt = [[5.6, 7.4], [7.4, 9.2], [9.2, 99]].map(([s0, s1], k) => ({ s0, s1, tg: tag(Wd, 2.2, .55, 'מריבות ' + (k + 1), ...TAG_BAD) }));
    const tMain = tag(Wd, 3.0, .6, 'עזות ומריבות', ...TAG_BAD);
    const sk = shock(Wd, LIT);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      const puff = sm(P(1.0, 4.0, t));
      B.tp.g.scale.setScalar(1 + .25 * puff);
      B.tp.g.rotation.y = .8;
      spikes.forEach(sp => { sp.scale.y = Math.max(.001, puff); });
      cheeks.forEach(c => c.scale.setScalar(Math.max(.001, sm(P(1.5, 3.0, t)))));
      B.tp.f.set(t, { smile: -.6, talk: .6 * talkAmt(t, 15), look: [1, 0] });
      const ang = sm(P(2.0, 4.0, t));
      B.cup.g.scale.setScalar(1 + .12 * ang);
      B.cup.g.rotation.z = .06 * Math.sin(t * 26) * ang;
      B.cup.g.rotation.y = -.8;
      B.cup.f.set(t, { smile: -.6, talk: .5 * talkAmt(t, 17) * ang, surprise: sm(P(5.0, 6.0, t)), look: [-1, 0] });
      idleLis(B, t);
      const flick = (t % .5) < .32 ? 1 : 0;
      const lv = sm(P(4.8, 5.4, t)) * flick * (t < 10.5 ? 1 : 0);
      bolts.forEach(b => b.seg.set(b.a, b.b, lv));
      sk.set([0, TOP + .7, PZ], P(5.0, 5.8, t), 1.2);
      cnt.forEach(c => c.tg.set([0, 2.6 + bob(t, 2), PZ], (t >= c.s0 && t < c.s1) ? popE(P(c.s0, c.s0 + .4, t)) : 0));
      tMain.set([0, 1.7 + bob(t, 5), PZ], popE(P(2.6, 3.4, t)));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(crane([0, 1.4, PZ], { dur: w[0], dist0: 9.8, dist1: 9.2, h0: 1.0, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 61)],
      [w[1], HH(punch(insert([0, 2.0, PZ], { dur: w[1], dist0: 6.0, dist1: 5.6, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.1]), 62)],
      [w[2], HH(pushIn([TEAP0[0], 1.2, PZ], { dur: w[2], dist0: 7.6, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 63)],
      [w[3], HH(truck([.4, 1.3, 0], { dur: w[3], dist0: 10, dist1: 9.4, h0: 1.6, h1: 2.0, a0: 6, a1: -6, fov0: 44, fov1: 42, shift: [.6, 0, 0] }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): the blue cup turns pale from the top down (halbanat panim), shrinks a little; a worry meter "בושה" fills; a red cross; tag "הלבנת פנים"
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.bub.g.visible = false;
    const me = meter(Wd, METER[0], METER[1]); me.set(0);
    const tMeter = tag(Wd, 1.3, .5, 'בושה', ...TAG_BAD);
    const tMain = tag(Wd, 3.2, .6, 'הלבנת פנים', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.3), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.cup.g, B.tp.g]; Wd.center = [.6, 1.0];
    Wd.on(t => {
      const pale = sm(P(1.0, 5.5, t));
      setWhite(B.cup, pale);
      B.cup.g.scale.setScalar(1 - .08 * pale);
      B.cup.g.rotation.y = -.6;
      B.cup.f.set(t, { smile: lerp(.2, -.6, pale), talk: 0, surprise: sm(P(5.6, 6.2, t)), look: [-1, 0] });
      me.set(sm(P(2.0, 7.5, t)));
      tMeter.set([METER[0], 1.42 + bob(t, 2), METER[1]], popE(P(1.4, 2.2, t)));
      cx.set([CUP0[0], 1.9, PZ + .6], popE(P(5.6, 6.4, t)), .05 * Math.sin(t * 4) * (t > 6.4 ? 1 : 0));
      sk.set([CUP0[0], 1.4, PZ], P(5.6, 6.4, t), 1.4);
      tMain.set([0, 2.45 + bob(t, 4), PZ], popE(P(6.6, 7.4, t)));
      B.tp.g.rotation.y = .8;
      B.tp.f.set(t, { smile: -.4, talk: .5 * talkAmt(t, 21), look: [1, 0] });
      idleLis(B, t);
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-.2, 1.4, 0], { dur: w[0], dist0: 9.8, dist1: 9.4, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 71)],
      [w[1], HH(punch(insert([CUP0[0], 1.4, PZ], { dur: w[1], dist0: 5.2, dist1: 5.0, h0: 1.3, h1: 1.4, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.1]), 72)],
      [w[2], HH(pushIn([METER[0], 1.2, METER[1]], { dur: w[2], dist0: 7.5, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -4, a1: 4, fov0: 42, fov1: 42 }), 73)],
      [w[3], HH(crane([0, 1.4, 0], { dur: w[3], dist0: 9.8, dist1: 9.0, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): slow crane over the table; the teapot at one side with a closed lid and a gentle smile; the blue cup at the other side, blue and happy again; the dark bubble small and crossed out between them
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.tp.g.position.set(-2.3, TOP, PZ + .6); B.tp.g.rotation.y = .3;
    B.cup.g.position.set(2.3, TOP, PZ + .6); B.cup.g.rotation.y = -.3;
    B.lis.forEach(l => { l.g.visible = false; });
    const cx = mark3d(Wd, 'cross', 1.6);
    cx.set([0, TOP + .6, PZ + .5], 0, 0); B.bub.g.visible = false;
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.2]; Wd.ansD = 6.4;
    Wd.on(t => {
      B.bub.g.position.set(0, TOP + .55 + .02 * Math.sin(t * 1.6), PZ);
      B.bub.g.scale.setScalar(.001);
      B.tp.f.set(t, { smile: .4, talk: .3 * talkAmt(t, 37), look: [1, 0] });
      B.cup.f.set(t, { smile: .9, talk: 0, look: [0, 0] });
      setWhite(B.cup, .001);
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.5, PZ], { dur, dist0: 8.8, dist1: 8.4, h0: 1.0, h1: 2.2, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
