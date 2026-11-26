// halashon-25 story: "innocently" - a teapot tells lashon hara behind a fake innocent MASK; the blue cup listens; the green mug is the absent friend.
// Talking objects only, NO people. Storyboard: storyboards_v26.md (B). COPY FROM halashon-24: same camera helpers, tags, faces, thread.
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
  const DKC = 0x2f3440, GREEN = 0x2fbf5b, SHELF = 0xa0703f, CREAM = 0xf4f1ea, BOOK = 0x7a3e9d;
  const BUBBLE = 0xfff7e0, GOLD = 0xd9a441, PINK = 0xff6fa0, STRIKE = 0x3b3b44, PAPER = 0xffffff;
  const TOP = .99, PZ = .2;                                  // table top; the front row (z)
  const TEAP0 = [-1.4, TOP, PZ], CUP0 = [1.5, TOP, PZ];     // the speaker and the listener
  const BUB = [-1.4, 2.1, PZ + .3];                          // the speech bubble above the teapot
  const MUG = [2.2, 2.05, -3.95];                            // the absent friend, on the far shelf
  const CROSS = [1.2, 2.2, 1.3];                             // red cross, beat 5
  const CROSS6 = [.3, 2.3, -.6];                             // red cross, beat 6 (behind the scale)
  const SCX = .2, SCZ = .95;                                 // the scale on the table, between the heroes
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

  // ---------------------------------------------------------------- THE SPEAKER: a teapot with a face on the +z side, and an innocent MASK in front of it
  function teapot(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const body = cyl(.36, .42, .5, POTC); body.position.y = .25; g.add(body);
    const lid = ball(.12, POTC); lid.position.y = .56; g.add(lid);
    const spout = box(.3, .08, .08, POTC); spout.position.set(.4, .35, 0); spout.rotation.z = -.5; g.add(spout);
    const f = face(Wd, { w: .4, parent: g, pos: [-.05, .3, .4], seed: 71 });
    const eb = box(.3, .06, .06, DARK); eb.position.set(-.05, .52, .42); g.add(eb);
    // the mask: a pale disc, two big round innocent eyes, a gold halo. Its group moves (slides up, falls flat); rotation.x = -PI/2 means lying on the table
    const mask = new THREE.Group(); mask.position.set(-.05, .3, .48); g.add(mask);
    const disc = cyl(.26, .26, .04, CREAM); disc.rotation.x = PI / 2; mask.add(disc);
    const eyes = new THREE.Group(); mask.add(eyes);
    [-.09, .09].forEach(x => {
      const w = ball(.085, CUPWHITE); w.position.set(x, .03, .03); eyes.add(w);
      const pu = ball(.04, DARK); pu.position.set(x, .03, .1); eyes.add(pu);
    });
    for (let k = 0; k < 8; k++) { const a = k / 8 * 2 * PI; const h = ball(.035, GOLD); h.position.set(Math.cos(a) * .3, Math.sin(a) * .3, 0); mask.add(h); }
    const setMask = (x, y, z, rx, eyesOn) => { mask.position.set(x, y, z); mask.rotation.x = rx; eyes.visible = eyesOn; };
    return { g, lid, eb, f, setMask };
  }

  // ---------------------------------------------------------------- THE SPEECH BUBBLE: a light bubble with a small dark stain; a white ribbon wraps it (pops in later); dark ball = the whole bubble darkens
  function bubble(Wd) {
    const g = new THREE.Group(); g.position.set(BUB[0], BUB[1], BUB[2]); Wd.add(g);
    g.add(ball(.5, BUBBLE));
    const stain = ball(.13, DKC); stain.position.set(.16, -.12, .46); g.add(stain);
    const dark = ball(.5, DKC); dark.scale.setScalar(.001); g.add(dark);
    const ribbon = new THREE.Group(); ribbon.scale.setScalar(.001); g.add(ribbon);
    const band1 = box(1.02, .1, .06, PAPER); band1.position.set(0, 0, .5); ribbon.add(band1);
    const band2 = box(.1, 1.02, .06, PAPER); band2.position.set(0, 0, .5); ribbon.add(band2);
    const bow = ball(.14, PAPER); bow.position.set(0, .56, .52); ribbon.add(bow);
    return { g, stain, dark, ribbon };
  }

  // ---------------------------------------------------------------- the zig-zag path of dots (the sneaky way) from the teapot to the cup
  function zigzag(Wd) {
    const N = 16, A = [TEAP0[0] + .5, TOP + .2, PZ], Bp = [CUP0[0] - .5, TOP + .2, PZ];
    const at = f => [lerp(A[0], Bp[0], f), TOP + .2 + .3 * Math.abs(Math.sin(f * PI * 3)), PZ + .55 * Math.sin(f * PI * 5)];
    const dots = Array.from({ length: N }, () => { const b = ball(.08, GOLD); b.scale.setScalar(.001); Wd.add(b); return b; });
    return { set(f) {
      dots.forEach((b, k) => {
        const kf = (k + .5) / N, p = at(kf), on = f > kf;
        b.position.set(p[0], p[1], p[2]); b.scale.setScalar(on ? 1 : .001);
      });
    } };
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

  // ---------------------------------------------------------------- the deeds list: four dark cards that line up under the friend's name
  function deeds(Wd) {
    const items = [-.9, -.3, .3, .9].map(dx => { const b = box(.3, .3, .1, DKC); b.position.set(MUG[0] + dx, 1.4, MUG[2] + .6); b.scale.setScalar(.001); Wd.add(b); return b; });
    return { set(f) { items.forEach((b, k) => { b.scale.setScalar(Math.max(.001, popE(clamp(f * 4 - k, 0, 1)))); }); } };
  }

  // ---------------------------------------------------------------- the closed book "לשון הרע": its cover flips shut, as if ignored
  function bookProp(Wd) {
    const pv = new THREE.Group(); pv.position.set(-.1, TOP, -.9); Wd.add(pv);
    const pages = box(.6, .05, .42, CREAM); pages.position.set(0, .025, .21); pv.add(pages);
    const cover = new THREE.Group(); cover.position.set(0, .05, 0); pv.add(cover);
    const cv = box(.64, .05, .44, BOOK); cv.position.set(0, 0, .22); cover.add(cv);
    return { cover };
  }

  // ---------------------------------------------------------------- the scale: sweet "תמימות" pan is light, "לשון הרע" pan is heavy
  function scales(Wd) {
    const base = box(1.0, .08, .55, WOOD); base.position.set(SCX, TOP + .04, SCZ); Wd.add(base);
    const post = box(.1, .9, .1, WOOD); post.position.set(SCX, TOP + .5, SCZ); Wd.add(post);
    const beam = new THREE.Group(); beam.position.set(SCX, TOP + .95, SCZ); Wd.add(beam);
    beam.add(box(1.5, .07, .07, DKC));
    const pan = (x, col) => {
      const p = new THREE.Group(); p.position.set(x, -.25, 0); beam.add(p);
      const s = cyl(.22, .16, .05, col); p.add(s);
      const st = box(.02, .24, .02, DKC); st.position.set(0, .12, 0); p.add(st);
      return p;
    };
    pan(-.62, CUPWHITE);
    const rp = pan(.62, 0x9a9aa5); const heavy = ball(.2, DKC); heavy.position.y = .12; rp.add(heavy);
    const tL = tag(Wd, 1.1, .4, 'תמימות', ...TAG_GREEN);
    const tR = tag(Wd, 1.5, .4, 'לשון הרע', ...TAG_BAD);
    return { beam, tL, tR, set(t) {
      beam.rotation.z = -.32 * sm(P(1.0, 2.6, t)) + .03 * Math.sin(t * 6) * (1 - sm(P(2.6, 3.6, t)));
      tL.set([SCX - .7, 2.45, SCZ + .3], popE(P(.6, 1.2, t)));
      tR.set([SCX + .7, 2.45, SCZ + .3], popE(P(1.2, 2.0, t)));
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

  // ================================================================ HOOK (14 s): extreme close-up on the teapot's innocent mask, pulls out; the speech bubble floats up with a dark stain; a "?" above; the blue cup listens; the green mug far on the shelf
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

  // ================================================================ BEAT 1 (14 s): the teapot hides its smirk: the innocent mask slides down over its face; a sneaky zig-zag path runs from the teapot to the cup; tag "דרך רמאות"
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    bubble(Wd);
    const zig = zigzag(Wd);
    const tZ = tag(Wd, 2.4, .5, 'דרך רמאות', ...TAG_GOLD);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.2, 1.5];
    Wd.on(t => {
      B.tp.setMask(-.05, lerp(.9, .3, sm(P(.3, 1.6, t))), .48, 0, true);
      zig.set(sm(P(1.6, 4.6, t)));
      tZ.set([-.1, 1.75, PZ + .9], popE(P(2.4, 3.2, t)));
      B.tp.f.set(t, { smile: .2, talk: talkAmt(t, 3), look: [1, 0] });
      B.tp.g.rotation.y = .3;
      B.cup.f.set(t, { smile: 0, talk: 0, look: [1, 0] });
      B.mug.f.set(t, { smile: 0, talk: 0, look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.4, 1.9, 0], { dur: 3.5, dist0: 11, dist1: 10.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [3.5, HH(punch(insert([TEAP0[0], 1.5, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.4]), 22)],
      [3.5, HH(insert([-.1, 1.4, PZ], { dur: 3.5, dist0: 5.8, dist1: 5.4, h0: 1.2, h1: 1.3, a0: -4, a1: 4, fov0: 40, fov1: 40 }), 23)],
      [3.5, HH(crane([0, 1.8, 0], { dur: 3.5, dist0: 10.5, dist1: 9.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s): the bubble is wrapped in a white ribbon "תמימות" like a gift; the teapot talks sweetly behind its mask; tag "כאילו בתמימות"
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd);
    const zig = zigzag(Wd);
    const tC = tag(Wd, 2.6, .5, 'כאילו בתמימות', ...TAG_GOLD);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.2, 1.6];
    Wd.on(t => {
      zig.set(1);
      bu.ribbon.scale.setScalar(Math.max(.001, popE(P(.4, 1.6, t))));
      tC.set([-.1, 2.45, PZ + .9], popE(P(1.6, 2.4, t)));
      B.tp.setMask(-.05, .3, .48, 0, true);
      B.tp.f.set(t, { smile: .6, talk: talkAmt(t, 5), look: [1, 0] });
      B.tp.g.rotation.y = .3 + .08 * Math.sin(t * 1.3);
      B.cup.f.set(t, { smile: .3, talk: 0, look: [0, 1] });
      B.mug.f.set(t, { smile: 0, talk: 0, look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.9, 0], { dur: 3.5, dist0: 12, dist1: 11.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [3.5, HH(punch(insert([BUB[0] + .3, 2.2, PZ + .3], { dur: 3.5, dist0: 6.4, dist1: 6.2, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.4]), 32)],
      [3.5, HH(insert([CUP0[0], 1.5, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 33)],
      [3.5, HH(crane([0, 1.6, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s): the teapot shrugs "?" as if it does not know; the book "לשון הרע" flips shut, ignored; tag "כאילו לא יודע"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd); bu.ribbon.scale.setScalar(1);
    const bk = bookProp(Wd);
    const sh = tag(Wd, .8, .8, '?', ...TAG_NEU);
    const tBk = tag(Wd, 2.0, .5, 'לשון הרע', ...TAG_BAD);
    const tI = tag(Wd, 1.8, .5, 'כאילו לא יודע', ...TAG_GOLD);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.4, 1.4];
    Wd.on(t => {
      bk.cover.rotation.x = lerp(-1.4, 0, sm(P(1.6, 3.0, t)));
      sh.set([-.7, 1.7 + bob(t, 4), PZ + .8], popE(P(.4, 1.2, t)));
      tBk.set([-.1, 1.75, -.9], popE(P(3.2, 3.8, t)));
      tI.set([.3, 2.35, PZ + .9], popE(P(3.8, 4.6, t)));
      B.tp.setMask(-.05, .3, .48, 0, true);
      B.tp.g.rotation.z = .08 * Math.sin(t * 2);                      // the shrug wobble
      B.tp.f.set(t, { smile: -.1, talk: .5 * talkAmt(t, 9), look: [0, 1] });
      B.cup.f.set(t, { smile: 0, talk: 0, look: [0, 1] });
      B.mug.f.set(t, { smile: .1, talk: 0, look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.8, 0], { dur: 3.5, dist0: 11, dist1: 10.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 41)],
      [3.5, HH(punch(insert([-.7, 1.7, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.6]), 42)],
      [3.5, HH(insert([-.1, 1.4, -.9], { dur: 3.5, dist0: 6.0, dist1: 5.6, h0: 1.4, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 43)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (16 s): the dotted thread runs from the bubble to the green mug; its name tag "פלוני" lights up; the deeds list lines up; tag "מעשיו של פלוני"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd); bu.ribbon.scale.setScalar(1);
    const th = thread(Wd);
    const dd = deeds(Wd);
    const NM = [MUG[0] - .9, 2.45, MUG[2] + .6];
    const tN = tag(Wd, 1.2, .45, 'פלוני', ...TAG_NEU);
    const tG = tag(Wd, 1.2, .45, 'פלוני', ...TAG_GOLD);
    const tM = tag(Wd, 2.4, .5, 'מעשיו של פלוני', ...TAG_NEU);
    Wd.occ = [B.tp.g, B.cup.g, B.mug.g]; Wd.center = [0, 1.7];
    Wd.on(t => {
      th.set(sm(P(.3, 2.6, t)), false, t * 6);
      tN.set(NM, clamp(1 - sm(P(1.0, 1.8, t)), 0, 1));
      tG.set(NM, popE(P(1.0, 1.8, t)));
      dd.set(sm(P(2.0, 4.5, t)));
      tM.set([1.6, 1.95, -2.9], popE(P(4.2, 5.0, t)));
      B.tp.setMask(-.05, .3, .48, 0, true);
      B.tp.f.set(t, { smile: .6, talk: .5 * talkAmt(t, 11), look: [1, 0] });
      B.tp.g.rotation.y = .3;
      B.cup.f.set(t, { smile: .2, talk: 0, look: [0, 1] });
      B.mug.f.set(t, { smile: .3, talk: 0, look: [-1, 0] });
    });
    Wd.cam = cuts([
      [4, HH(truck([0, 1.6, 0], { dur: 4, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 51)],
      [4, HH(punch(insert([BUB[0] + .2, 2.1, PZ + .3], { dur: 4, dist0: 6.0, dist1: 5.6, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.2]), 52)],
      [4, HH(pushIn([MUG[0] - .4, 2.3, MUG[2] + 1], { dur: 4, dist0: 7.6, dist1: 7.0, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 53)],
      [4, HH(crane([-.4, 1.5, 0], { dur: 4, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): the white ribbon tears off the bubble; the dark stain spreads over it; the stamp "לשון הרע" slams down; red cross + shock; the green mug looks sad; the mask slides up
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd); bu.ribbon.scale.setScalar(1);
    const th = thread(Wd);
    const ck = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    const tStamp = tag(Wd, 2.0, .6, 'לשון הרע', ...TAG_BAD);
    const tCross = tag(Wd, 2.6, .55, 'לא לשון הרע', ...TAG_BAD);
    Wd.occ = [B.tp.g, B.cup.g, B.mug.g]; Wd.center = [0, 1.7];
    Wd.on(t => {
      const tr = sm(P(.2, 1.4, t));
      bu.ribbon.position.set(1.4 * tr, 1.2 * tr, .9 * tr);           // the ribbon tears off
      bu.ribbon.rotation.z = 1.3 * tr;
      bu.dark.scale.setScalar(Math.max(.001, sm(P(1.0, 2.2, t))));    // the stain spreads over the bubble
      const cp = popE(P(2.6, 3.4, t));
      ck.set(CROSS, cp * .8, .05 * Math.sin(t * 4) * (t > 3.4 ? 1 : 0));
      sk.set([CROSS[0], CROSS[1], CROSS[2] - .2], P(2.6, 3.4, t), 1.4);
      tCross.set([CROSS[0], CROSS[1] - .8, CROSS[2] + .3], popE(P(3.2, 4.0, t)));
      tStamp.set([BUB[0], lerp(3.0, 2.4, sm(P(1.2, 1.6, t))), PZ + 1.0], popE(P(1.2, 1.8, t)));
      th.set(1, true, t * 8);
      B.tp.setMask(-.05, lerp(.3, .8, sm(P(.6, 2.0, t))), .48, 0, true);
      B.tp.f.set(t, { smile: -.2, talk: .6 * talkAmt(t, 9), look: [1, 0] });
      B.tp.g.rotation.y = .5;
      B.cup.f.set(t, { smile: -.1, talk: 0, look: [0, 1] });
      B.mug.f.set(t, { smile: lerp(-.1, -.6, sm(P(2.6, 3.4, t))), talk: 0, surprise: sm(P(2.6, 3.4, t)), look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(crane([-1.2, 1.4, PZ], { dur: 3.5, dist0: 9.8, dist1: 9.2, h0: 1.0, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 61)],
      [3.5, HH(punch(insert([BUB[0] + .2, 2.2, PZ + .5], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [1.6]), 62)],
      [3.5, HH(pushIn([MUG[0] - .4, 2.3, MUG[2] + 1], { dur: 3.5, dist0: 7.6, dist1: 7.0, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 63)],
      [3.5, HH(truck([.4, 1.3, 0], { dur: 3.5, dist0: 10, dist1: 9.4, h0: 1.6, h1: 2.0, a0: 6, a1: -6, fov0: 44, fov1: 42, shift: [.6, 0, 0] }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): the mask slides off the teapot and falls flat; the scale weighs: "תמימות" rises, "לשון הרע" stays down; red cross + shock; tag "לא מועיל"
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bu = bubble(Wd); bu.ribbon.scale.setScalar(.001); bu.dark.scale.setScalar(1);
    const sc = scales(Wd);
    const ck = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    const tL = tag(Wd, 2.2, .5, 'לא מועיל', ...TAG_BAD);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.6];
    Wd.on(t => {
      const f = sm(P(.4, 2.2, t));
      B.tp.setMask(lerp(-.05, .55, f), lerp(.8, .03, f), lerp(.48, .95, f), lerp(0, -PI / 2, f), f < .5);
      sc.set(t);
      const cp = popE(P(3.2, 4.0, t));
      ck.set(CROSS6, cp * .8, .05 * Math.sin(t * 4) * (t > 4.0 ? 1 : 0));
      sk.set([CROSS6[0], CROSS6[1], CROSS6[2] - .2], P(3.2, 4.0, t), 1.4);
      tL.set([CROSS6[0], 1.8, CROSS6[2] + .3], popE(P(4.0, 4.8, t)));
      B.tp.f.set(t, { smile: -.4, talk: .5 * talkAmt(t, 21), look: [1, 0] });
      B.tp.g.rotation.y = .6;
      B.cup.g.rotation.y = -.6;
      B.cup.f.set(t, { smile: lerp(-.2, -.6, sm(P(3.2, 4.0, t))), talk: 0, surprise: sm(P(3.2, 4.0, t)), look: [-1, 0] });
      B.mug.f.set(t, { smile: -.6, talk: 0, surprise: .4 * sm(P(3.2, 4.0, t)), look: [-1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.6, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 71)],
      [3.5, HH(punch(insert([SCX, 1.7, SCZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.0]), 72)],
      [3.5, HH(pushIn([0.4, 1.3, PZ], { dur: 3.5, dist0: 7.0, dist1: 6.6, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 73)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): slow crane; the teapot is calm, its mask lies flat on the counter, its lid stays closed; a clean white bubble with a small heart goes to the blue cup, which smiles; the mug is happy. NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.tp.g.position.set(-2.8, TOP, PZ + .6); B.tp.g.rotation.y = .3; B.tp.g.scale.setScalar(1.35);
    B.tp.setMask(.55, .03, .95, -PI / 2, false);                  // the mask lies on the counter
    B.cup.g.position.set(2.8, TOP, PZ + .6); B.cup.g.rotation.y = -.3; B.cup.g.scale.setScalar(1.35);
    const cb = new THREE.Group(); cb.visible = false; Wd.add(cb);
    cb.add(ball(.42, PAPER));
    const hl = ball(.09, PINK); hl.position.set(-.09, .05, .36); cb.add(hl);
    const hr = ball(.09, PINK); hr.position.set(.09, .05, .36); cb.add(hr);
    const hb = box(.14, .14, .05, PINK); hb.position.set(0, -.03, .36); hb.rotation.z = PI / 4; cb.add(hb);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.4]; Wd.ansD = 6.4;
    Wd.on(t => {
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
