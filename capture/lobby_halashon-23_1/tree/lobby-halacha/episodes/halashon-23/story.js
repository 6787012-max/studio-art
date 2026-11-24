// halashon-23 story: "I was only joking" - lashon hara is forbidden from the Torah even in jest, without hatred and without intent (storyboards_v24.md, section B).
// Talking objects only, NO people. COPY FROM halashon-22: same set, tags, cups, teapot, arrow and camera helpers.
// Heroes: a laughing TEAPOT (the speaker), a blue CUP "חבר" (the listener), a LAUGH BUBBLE "חחח" with a dark STAIN inside (the disgrace).
// Props: a hatred thermometer, an iron weight "איסור", a target with a grey arrow "לגנות", a spring with a party horn "קלות ראש", a magnifying glass "האמת".
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, FONT, fitText } = K;
  // whole-frame lift: every camera aims lower so the subject sits above the caption band
  const LIFT = .5;
  const lift = p => [p[0], p[1] - LIFT, p[2]];
  const pushIn = (p, o) => K.pushIn(lift(p), o), pullOut = (p, o) => K.pullOut(lift(p), o), truck = (p, o) => K.truck(lift(p), o);
  const crane = (p, o) => K.crane(lift(p), o), insert = (p, o) => K.insert(lift(p), o);
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .05;
  const RED = 0xe03131, DARK = 0x2b2b33, WOOD = 0x8a5a33, POTC = 0xd9735a, CUPBLUE = 0x3a86ff, CUPWHITE = 0xffffff;
  const DKB = 0x4a4f5c, DKC = 0x2f3440, CLOUD = 0xb6bcc6, PANC = 0xbfe9ff, GREEN = 0x2fbf5b, SHELF = 0xa0703f;
  const BUBBLE = 0xfff7e0, STAIN = 0x4a3320, GREY = 0x8a8f99, IRON = 0x4a4f5c, GOLD = 0xd9a441, HORN = 0xff7ab6;
  const PINK = 0xff6fa0, CREAM = 0xf4f1ea;
  const TOP = .99, PZ = .2;                                // table top; the front row (z)
  const TEAP0 = [-1.7, TOP, PZ], CUP0 = [1.8, TOP, PZ];    // the speaker and the listener
  const SPOUT = [TEAP0[0] + .7, TOP + .75, PZ + .3];       // where the laugh bubbles start
  const BUB_TO = [CUP0[0] - .35, 1.75, PZ + .3];           // where they arrive (in front of the cup)
  const TH = [-3.1, TOP, .4];                              // hatred thermometer (beat 2)
  const TGT = [-3.2, 1.5, .3];                             // target on a stand (beat 3)
  const PIV = [0, TOP + 1.6, 0];                           // balance scale pivot (beat 1)
  const LIS = [[3.4, -.7, 0x9ee0a0, 40], [4.2, -.2, 0xffd27a, 41]];   // two listener cups behind the blue cup
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

  // ---------------------------------------------------------------- a cup with a face
  function cupHero(Wd, x, z, col, seed) {
    const g = new THREE.Group(); g.position.set(x, TOP, z); Wd.add(g);
    const sau = cyl(.5, .5, .06, CREAM); sau.position.y = .03; g.add(sau);
    const body = cyl(.36, .3, .8, col); body.position.y = .46; g.add(body);
    const white = cyl(.37, .31, .8, CUPWHITE); white.position.y = .86; white.scale.y = .001; g.add(white);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .5, .38], seed });
    return { g, body, white, f };
  }

  // ---------------------------------------------------------------- THE SPEAKER: a laughing teapot with a face on the +z side
  function teapot(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const body = cyl(.36, .42, .5, POTC); body.position.y = .25; g.add(body);
    const lid = ball(.12, POTC); lid.position.y = .56; g.add(lid);
    const spout = box(.3, .08, .08, POTC); spout.position.set(.4, .35, 0); spout.rotation.z = -.5; g.add(spout);
    const f = face(Wd, { w: .4, parent: g, pos: [-.05, .3, .4], seed: 71 });
    return { g, lid, f };
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

  // ---------------------------------------------------------------- piecewise: the scale tilt helper (local coords, rotated by the beam)
  const toW = (lx, ly, th) => [PIV[0] + lx * Math.cos(th) - ly * Math.sin(th), PIV[1] + lx * Math.sin(th) + ly * Math.cos(th), 0];

  // ---------------------------------------------------------------- THE LAUGH BUBBLE "חחח": a light bubble with a dark stain on its front; st = stain size
  function laugh(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    g.add(ball(.42, BUBBLE));
    const stain = ball(.15, STAIN); stain.position.set(.1, -.05, .36); g.add(stain);
    const tt = tag(Wd, 1.0, .4, 'חחח', ...TAG_GOLD);
    return { g, stain, set(pos, s, st) {
      g.visible = s > .01; if (!g.visible) { tt.set(pos, 0); return; }
      g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s);
      stain.scale.setScalar(Math.max(.001, st === undefined ? 1 : st));
      tt.set([pos[0], pos[1] + .65, pos[2] + .2], s);
    } };
  }
  // where a bubble is at fraction f of its trip (it arcs a little)
  const bubPos = (f, from = SPOUT, to = BUB_TO) => [0, 1, 2].map(i => lerp(from[i], to[i], f) + (i === 1 ? .45 * Math.sin(PI * f) : 0));

  // ---------------------------------------------------------------- a grey smudge on the front of a cup (scale 0 = none)
  function stainOn(cup) {
    const s = cyl(.14, .14, .02, STAIN); s.rotation.x = PI / 2; s.position.set(.16, .36, .37); cup.g.add(s); return s;
  }

  // ---------------------------------------------------------------- THE HATRED THERMOMETER: red column in a cream tube, blue frost on top; set(v) with v 0..1
  function thermo(Wd) {
    const g = new THREE.Group(); g.position.set(TH[0], TH[1], TH[2]); Wd.add(g);
    const tube = cyl(.13, .13, 1.1, CREAM); tube.position.y = .8; g.add(tube);
    const fill = cyl(.07, .07, 1, RED); g.add(fill);
    const bulb = ball(.26, RED); bulb.position.y = .18; g.add(bulb);
    const frost = ball(.2, 0x7fc8ff); frost.position.y = 1.45; g.add(frost);
    return { set(v) { const h = Math.max(.001, v * .9); fill.scale.y = h; fill.position.y = .2 + h / 2; } };
  }

  // ---------------------------------------------------------------- THE TARGET on a stand: rings red and cream, facing the camera
  function target(Wd) {
    const g = new THREE.Group(); g.position.set(TGT[0], TGT[1], TGT[2]); Wd.add(g);
    const sd = cyl(.05, .05, TGT[1] - TOP, DKC); sd.position.y = -(TGT[1] - TOP) / 2; g.add(sd);
    [[.8, CREAM], [.6, RED], [.4, CREAM], [.2, RED]].forEach(([r, c], i) => {
      const d = cyl(r, r, .06, c); d.rotation.x = PI / 2; d.position.z = .02 + .02 * i; g.add(d);
    });
    return g;
  }

  // ---------------------------------------------------------------- THE MAGNIFYING GLASS: a ring of small balls + a handle (no lens, so the stain stays visible)
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
    const eb = box(.3, .06, .06, DARK); eb.position.set(-.05, .52, .42); tp.g.add(eb); tp.eb = eb;   // sly eyebrow, squints when it lowers
    const cup = cupHero(Wd, CUP0[0], CUP0[2], CUPBLUE, 20);
    const lis = LIS.map(([x, z, c, s]) => cupHero(Wd, x, z, c, s));
    return { tp, cup, lis };
  }
  // the two listener cups stay neutral and turn to whoever is talking
  const idleLis = (B, t) => B.lis.forEach(l => l.f.set(t, { smile: .1, talk: 0, look: [-1, 0] }));

  // ================================================================ HOOK (14 s): extreme close-up on the laughing teapot, pulls out; a laugh bubble "חחח" with a stain floats toward the blue cup; "?" above the cup
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bb = laugh(Wd);
    const qq = tag(Wd, .8, .8, '?', ...TAG_GOLD);
    Wd.qPos = [CUP0[0], CUP0[2]];
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.2, 0];
    Wd.on(t => {
      B.tp.g.rotation.y = .9 * sm(P(4, 8, t));
      B.cup.g.rotation.y = -.6 * sm(P(4, 8, t));
      B.tp.lid.position.y = .56 + .07 * Math.abs(Math.sin(t * 7));   // the lid bounces with the laughter
      bb.set(bubPos(sm(P(3, 11, t))), popE(P(2, 3, t)), 1);
      B.tp.f.set(t, { smile: .9, talk: talkAmt(t, 3), look: [1, 0] });
      B.cup.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
      idleLis(B, t);
      qq.set([CUP0[0] - .1, 2.3 + bob(t, 3), PZ + .6], popE(P(1.4, 2.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut([TEAP0[0], 1.4, PZ], { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-.6, 1.2, 0], { dur: w[1], dist0: 8.4, dist1: 8.0, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([.2, 1.3, PZ], { dur: w[2], dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.4, PZ], { dur: w[3], dist0: 10, dist1: 9.4, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s): a giant iron weight "איסור" drops hard onto the scale pan; the beam tilts, dust bursts; tag "איסור גדול"
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const post = box(.1, 1.6, .1, WOOD); post.position.set(0, TOP + .8, 0); Wd.add(post);
    const piv = new THREE.Group(); piv.position.set(PIV[0], PIV[1], PIV[2]); Wd.add(piv);
    const beamG = new THREE.Group(); piv.add(beamG);
    beamG.add(box(2.4, .1, .12, WOOD));
    [-1.1, 1.1].forEach(x => {
      const s = box(.03, .75, .03, WOOD); s.position.set(x, -.375, 0); beamG.add(s);
      const p = cyl(.45, .45, .08, PANC); p.position.set(x, -.75, 0); beamG.add(p);
    });
    const wt = box(.9, .8, .9, IRON); Wd.add(wt);
    const wl = tag(Wd, .9, .4, 'איסור', ...TAG_GOLD);
    const dust = Array.from({ length: 8 }, () => { const b = ball(.08, CLOUD); Wd.add(b); return b; });
    const tMain = tag(Wd, 3.0, .6, 'איסור גדול', ...TAG_NEU);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.4];
    Wd.on(t => {
      const fall = 1 - sm(P(.9, 1.8, t));              // the weight drops from above
      const tilt = .26 * sm(P(1.8, 2.6, t));           // then the left pan sinks under it
      beamG.rotation.z = tilt;
      const lp = toW(-1.1, -.75, tilt);
      const wy = lp[1] + .4 + 1.6 * fall;
      wt.position.set(lp[0], wy, 0);
      wl.set([lp[0], wy + .5, .5], popE(P(.4, 1.0, t)));
      const ph = P(1.8, 2.9, t);                        // the impact sends a dust ring out
      dust.forEach((b, i) => {
        const an = i / 8 * 2 * PI, R = .2 + .9 * ph;
        b.position.set(lp[0] + Math.cos(an) * R * 1.4, lp[1] - .2 + Math.sin(an) * R * .3, .1);
        b.scale.setScalar(Math.max(.001, (1 - ph) * .9 * sm(P(1.8, 2.0, t))));
      });
      tMain.set([0, 1.9, 1.3], popE(P(2.2, 3.0, t)));
      B.tp.f.set(t, { smile: .1, talk: .6 * talkAmt(t, 5) * sm(P(2, 2.6, t)), look: [0, 1] });
      B.tp.g.rotation.y = .5;
      B.cup.g.rotation.y = -.5;
      B.cup.f.set(t, { smile: -.1, talk: 0, surprise: .4 * sm(P(1.8, 2.4, t)), look: [0, 1] });
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.9, 0], { dur: 3.5, dist0: 11, dist1: 10.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [3.5, HH(punch(insert([-.8, 1.8, 0], { dur: 3.5, dist0: 7.0, dist1: 6.6, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [1.8]), 22)],
      [3.5, HH(insert([1.8, 1.9, PZ], { dur: 3.5, dist0: 5.0, dist1: 4.6, h0: 1.2, h1: 1.4, a0: -4, a1: 4, fov0: 40, fov1: 40 }), 23)],
      [3.5, HH(crane([0, 1.8, 0], { dur: 3.5, dist0: 10.5, dist1: 9.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, neutral): the hatred thermometer stays at zero (cold blue frost); the teapot smiles innocently; the laugh bubble with the stain still travels toward the cup; tag "בלי שנאה"
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const th = thermo(Wd);
    const bb = laugh(Wd);
    const tS = tag(Wd, 1.0, .4, 'שנאה', ...TAG_BLUE);
    const tMain = tag(Wd, 2.0, .45, 'בלי שנאה', ...TAG_GREEN);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.6, 1.4];
    Wd.on(t => {
      th.set(0);                                        // the needle never rises
      tS.set([TH[0], 2.1, .9], popE(P(.5, 1.2, t)));
      bb.set(bubPos(.3 - .3 * Math.cos(t * .45)),popE(P(.5, 1.2, t)), 1);   // the stained bubble keeps travelling between teapot and cup
      B.tp.f.set(t, { smile: .8, talk: .5 * talkAmt(t, 9), look: [1, 0] });
      B.tp.g.rotation.y = .4;
      B.cup.g.rotation.y = -.5;
      B.cup.f.set(t, { smile: 0, talk: 0, look: [-1, 0] });
      tMain.set([TH[0] + 1.1, 1.55 + bob(t, 3), 1.4], popE(P(1.6, 2.4, t)));
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.6, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [3.5, HH(insert([TH[0], 1.6, .4], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 32)],
      [3.5, HH(punch(pushIn([TEAP0[0] + .6, 1.3, PZ], { dur: 3.5, dist0: 6.4, dist1: 5.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.0]), 33)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, neutral): the target "לגנות" - its grey arrow slides off and lies on the table, not aimed; the teapot shakes its lid; the stain is still in the bubble; tag "בלי כוונה"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    target(Wd);
    const ar = arrow(Wd, GREY);
    const bb = laugh(Wd);
    const tT = tag(Wd, 1.8, .45, 'בלי כוונה', ...TAG_NEU);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.6, 1.4];
    Wd.on(t => {
      const drop = sm(P(1, 3, t));
      const a = [TGT[0] + .25, lerp(1.8, TOP + .12, drop), .6];
      ar.set(a, [a[0] - .9, a[1] - .1, .6], 1);
      tT.set([TGT[0], 1.7, 1.2], popE(P(1, 1.8, t)));
      bb.set([.2, 1.7 + .08 * Math.sin(t * 1.5), .5], popE(P(.4, 1.2, t)), 1);
      B.tp.lid.position.x = .05 * Math.sin(t * 12) * sm(P(1, 2, t));     // "I did not mean it": the lid shakes
      B.tp.f.set(t, { smile: .3, talk: .7 * talkAmt(t, 15), look: [1, 0] });
      B.tp.g.rotation.y = .5;
      B.cup.g.rotation.y = -.5;
      B.cup.f.set(t, { smile: .1, talk: 0, look: [-1, 0] });
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.6, 1.6, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 41)],
      [3.5, HH(punch(insert([TGT[0], 1.5, .3], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.9]), 42)],
      [3.5, HH(pushIn([TEAP0[0], 1.3, PZ], { dur: 3.5, dist0: 6.6, dist1: 6.0, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 43)],
      [3.5, HH(crane([-.6, 1.4, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (16 s, neutral): the teapot laughs hard, lid jumps, many little bubbles; one stained bubble lands on the blue cup and leaves a grey smudge; the cup frowns; tag "דרך שחוק"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bb = laugh(Wd);
    const puffs = Array.from({ length: 6 }, () => { const b = ball(.12, BUBBLE); Wd.add(b); return b; });
    const sm1 = stainOn(B.cup);
    const tMain = tag(Wd, 2.6, .6, 'דרך שחוק', ...TAG_NEU);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [.2, 1.4];
    Wd.on(t => {
      B.tp.lid.position.y = .56 + .08 * Math.abs(Math.sin(t * 8));   // the teapot laughs hard
      B.tp.g.rotation.z = .08 * Math.sin(t * 6);
      puffs.forEach((b, k) => {
        const ph = (t * .45 + k / 6) % 1;
        b.position.set(lerp(SPOUT[0], CUP0[0] - .5, ph), SPOUT[1] + .7 * Math.sin(ph * PI), PZ + .3);
        b.scale.setScalar(Math.max(.001, Math.sin(ph * PI)));
      });
      const f = sm(P(.8, 5.2, t));
      bb.set(bubPos(f, SPOUT, [CUP0[0] - .1, 1.5, PZ + .5]), popE(P(.2, 1.0, t)) * (1 - sm(P(5.4, 6.2, t))), 1);
      sm1.scale.setScalar(Math.max(.001, sm(P(5.6, 7.4, t))));       // the grey smudge spreads on the cup
      B.tp.f.set(t, { smile: .9, talk: .8 * talkAmt(t, 11), look: [1, 0] });
      B.cup.f.set(t, { smile: -.6, talk: 0, surprise: .3 * sm(P(5, 6, t)), look: [-1, 0] });
      tMain.set([0, 2.1, 1.0], popE(P(1.0, 1.8, t)));
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [4, HH(truck([0, 1.6, 0], { dur: 4, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 51)],
      [4, HH(punch(insert([TEAP0[0] + .2, 1.4, PZ], { dur: 4, dist0: 6.2, dist1: 5.8, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.2]), 52)],
      [4, HH(insert([CUP0[0], 1.3, .2], { dur: 4, dist0: 5.6, dist1: 5.2, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [4, HH(crane([.2, 1.4, 0], { dur: 4, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, neutral): the teapot bounces on a spring with a party horn, light-headed; little bubbles spin around it; the smudge on the cup grows; tag "קלות ראש"
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const coils = Array.from({ length: 6 }, () => { const d = cyl(.3, .3, .05, GOLD); Wd.add(d); return d; });
    const horn = cyl(.03, .16, .5, HORN); horn.rotation.z = PI / 2; horn.position.set(.3, .7, .1); B.tp.g.add(horn);
    const orbit = Array.from({ length: 4 }, () => { const b = ball(.14, BUBBLE); Wd.add(b); return b; });
    const st2 = stainOn(B.cup);
    const tMain = tag(Wd, 2.6, .6, 'קלות ראש', ...TAG_NEU);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.4, 1.4];
    Wd.on(t => {
      const amp = sm(P(.5, 1.5, t));
      const hop = Math.abs(Math.sin(t * 5)) * .45 * amp;   // bouncing on the spring
      B.tp.g.position.y = TOP + hop;
      B.tp.g.rotation.z = .08 * Math.sin(t * 5) * amp;
      horn.rotation.z = PI / 2 + .3 * Math.sin(t * 10) * amp;
      coils.forEach((d, k) => {
        d.position.set(TEAP0[0], TOP + (k + 1) * hop / 7, PZ);
        d.scale.setScalar(Math.max(.001, amp));
      });
      orbit.forEach((b, k) => {
        const a = t * 1.3 + k * PI / 2;
        b.position.set(TEAP0[0] + Math.cos(a) * 1.0, 1.9 + .3 * Math.sin(a), PZ + .4);
        b.scale.setScalar(Math.max(.001, amp * .9));
      });
      st2.scale.setScalar(1 + .6 * sm(P(0, 13, t)));          // the smudge grows a bit
      B.tp.f.set(t, { smile: .8, talk: .8 * talkAmt(t, 15), look: [0, 1] });
      B.cup.f.set(t, { smile: -.4, talk: 0, look: [-1, 0] });
      tMain.set([0, 2.15 + bob(t, 4), 1.0], popE(P(.6, 1.4, t)));
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(crane([-1.7, 1.4, PZ], { dur: 3.5, dist0: 9.8, dist1: 9.2, h0: 1.0, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 61)],
      [3.5, HH(punch(insert([TEAP0[0], 1.7, PZ], { dur: 3.5, dist0: 6.0, dist1: 5.6, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [5.0]), 62)],
      [3.5, HH(pushIn([CUP0[0], 1.3, .2], { dur: 3.5, dist0: 6.6, dist1: 6.0, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 63)],
      [3.5, HH(truck([.4, 1.3, 0], { dur: 3.5, dist0: 10, dist1: 9.4, h0: 1.6, h1: 2.0, a0: 6, a1: -6, fov0: 44, fov1: 42, shift: [.6, 0, 0] }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): the magnifying glass "האמת" slides over the laugh bubble: the stain inside is big and clear, label "דברי גנאי"; the cup is sad; red cross + shock; tag "אסור מן התורה" under the cross
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bb = laugh(Wd);
    const glass = glassRing(Wd);
    const tLens = tag(Wd, 1.6, .42, 'דברי גנאי', ...TAG_NEU);
    const ck = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    const tMain = tag(Wd, 3.0, .6, 'אסור מן התורה', ...TAG_BAD);
    const BUB6 = [-.8, 1.35, .5], CROSS = [.6, 1.95, 1.3];
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.5];
    Wd.on(t => {
      const f = sm(P(.6, 3.4, t));
      const gc = [lerp(-2.4, BUB6[0], f), lerp(2.4, 1.4, f), 1.1];
      glass.set(gc, popE(P(.4, 1.2, t)));
      bb.set(BUB6, 1, lerp(1, 2.4, sm(P(3.2, 5.0, t))));      // the stain grows big under the glass
      tLens.set([-.25, 2.1, 1.25], popE(P(4.0, 4.8, t)));
      ck.set(CROSS, popE(P(5.0, 5.8, t)) * .8, .05 * Math.sin(t * 4) * (t > 5.8 ? 1 : 0));
      sk.set([CROSS[0], CROSS[1], .9], P(5.0, 5.8, t), 1.4);
      tMain.set([CROSS[0], 1.3, 1.4], popE(P(5.6, 6.4, t)));
      B.tp.f.set(t, { smile: -.4, talk: .5 * talkAmt(t, 21), look: [1, 0] });
      B.tp.g.rotation.y = .6;
      B.cup.g.rotation.y = -.6;
      B.cup.f.set(t, { smile: lerp(-.2, -.6, sm(P(4.8, 5.6, t))), talk: 0, surprise: sm(P(4.8, 5.6, t)), look: [-1, 0] });
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.6, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 71)],
      [3.5, HH(punch(insert([BUB6[0], 1.5, .5], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.0]), 72)],
      [3.5, HH(pushIn([CUP0[0], 1.3, .2], { dur: 3.5, dist0: 6.2, dist1: 5.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 73)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): slow crane; the teapot calm with its lid closed sends a clean white bubble with a small heart to the blue cup, which is clean and smiling. NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.tp.g.position.set(-2.3, TOP, PZ + .6); B.tp.g.rotation.y = .3;
    B.cup.g.position.set(2.3, TOP, PZ + .6); B.cup.g.rotation.y = -.3;
    B.lis.forEach(l => { l.g.visible = false; });
    const cb = new THREE.Group(); cb.visible = false; Wd.add(cb);
    cb.add(ball(.42, 0xffffff));
    const hl = ball(.09, PINK); hl.position.set(-.09, .05, .36); cb.add(hl);
    const hr = ball(.09, PINK); hr.position.set(.09, .05, .36); cb.add(hr);
    const hb = box(.14, .14, .05, PINK); hb.position.set(0, -.03, .36); hb.rotation.z = PI / 4; cb.add(hb);
    const FROM = [-1.6, .8, PZ + .9], TO = [1.95, .8, PZ + .9];   // low: stays under the card centre
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.4]; Wd.ansD = 6.4;
    Wd.on(t => {
      const ph = (t * .14) % 1;                                  // one trip every 7 s
      const s = Math.min(1, ph * 8, (1 - ph) * 8);
      const p = [lerp(FROM[0], TO[0], sm(ph)), .8, PZ + .9];
      cb.visible = s > .01;
      cb.position.set(p[0], p[1], p[2]); cb.scale.setScalar(Math.max(.001, s));
      B.tp.f.set(t, { smile: .8, talk: .3 * talkAmt(t, 37), look: [1, 0] });
      B.cup.f.set(t, { smile: 1, talk: 0, look: [0, 0] });
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.5, PZ], { dur, dist0: 8.8, dist1: 8.4, h0: 1.0, h1: 2.2, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
