// halashon-22 story: "I would say it to his face" only helps for avak lashon hara (storyboards_v23.md, section B).
// Talking objects only, NO people. COPY FROM halashon-21: same tags, base, cups, teapot, arrow, scale and camera helpers.
// Heroes: a sly TEAPOT (the speaker), a blue CUP "חבר" (the listener), a SENTENCE CARD that flips between
// "פירוש טוב" (white) and "פירוש של גנאי" (grey), a TONE DIAL (needle green "קל" / red "לגנות"), a thought cloud "גם בפניו".
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
  const RED = 0xe03131, DARK = 0x2b2b33, PAPER = 0xf4e4b8, LIT = 0xffd166, SPOT = 0xfff3b0;
  const WOOD = 0x8a5a33, SHELF = 0xa0703f, POTC = 0xd9735a, CUPBLUE = 0x3a86ff, CUPWHITE = 0xffffff;
  const DKB = 0x4a4f5c, DKC = 0x2f3440, CLOUD = 0xb6bcc6, PANC = 0xbfe9ff, GREEN = 0x2fbf5b;
  const TOP = .99, PZ = .2;                                // table top; the front row (z)
  const TEAP0 = [-1.7, TOP, PZ], CUP0 = [1.8, TOP, PZ];    // the speaker and the listener
  const CARD = [0, 1.9, .6];                               // the sentence card, floats between teapot and cup
  const DIAL = [-3.6, 2.5, .4];                            // tone dial on a stand, far left
  const SPOUT = [TEAP0[0] + .7, TOP + .7, PZ + .25];       // teapot spout: where the sound rings start
  const PIV = [0, TOP + 1.6, 0];                           // balance scale pivot
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
    const sau = cyl(.5, .5, .06, 0xf4f1ea); sau.position.y = .03; g.add(sau);
    const body = cyl(.36, .3, .8, col); body.position.y = .46; g.add(body);
    const white = cyl(.37, .31, .8, CUPWHITE); white.position.y = .86; white.scale.y = .001; g.add(white);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .5, .38], seed });
    return { g, body, white, f };
  }

  // ---------------------------------------------------------------- THE SPEAKER: a sly teapot with a face on the +z side
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

  // ---------------------------------------------------------------- THE SENTENCE CARD: white side "פירוש טוב", grey side "פירוש של גנאי" (rotation.y = PI shows the grey side)
  function card(Wd) {
    const g = new THREE.Group(); g.position.set(CARD[0], CARD[1], CARD[2]); Wd.add(g);
    g.add(box(1.9, 1.0, .08, PAPER));
    const fr = texPlane(1.8, .9, mkDraw('פירוש טוב', '#ffffff', '#1f6a2a', null), { cw: 512, ro: 9 });
    fr.position.z = .05; g.add(fr);
    const bk = texPlane(1.8, .9, mkDraw('פירוש של גנאי', '#8d939c', '#ffffff', null), { cw: 512, ro: 9 });
    bk.position.z = -.05; bk.rotation.y = PI; g.add(bk);
    return g;
  }

  // ---------------------------------------------------------------- THE TONE DIAL on a stand: needle angle a (positive = green "קל", negative = red "לגנות")
  function dial(Wd) {
    const g = new THREE.Group(); g.position.set(DIAL[0], DIAL[1], DIAL[2]); Wd.add(g);
    const sd = cyl(.07, .07, DIAL[1] - TOP, DKC); sd.position.set(0, -(DIAL[1] - TOP) / 2, 0); g.add(sd);
    const rim = cyl(.95, .95, .08, DKC); rim.rotation.x = PI / 2; g.add(rim);
    const dface = cyl(.84, .84, .1, 0xf4f1ea); dface.rotation.x = PI / 2; dface.position.z = .02; g.add(dface);
    for (let i = 0; i < 9; i++) {
      const a = -.9 + i * .225;
      const col = a > .1 ? GREEN : (a < -.1 ? RED : 0x8a8f99);
      const d = ball(.07, col); d.position.set(-Math.sin(a) * .66, Math.cos(a) * .66, .1); g.add(d);
    }
    const piv = new THREE.Group(); piv.position.set(0, 0, .12); g.add(piv);
    const nd = box(.07, .72, .05, DARK); nd.position.y = .34; piv.add(nd);
    piv.add(ball(.1, DARK));
    return { set(a) { piv.rotation.z = a; } };
  }

  // ---------------------------------------------------------------- sound rings from the spout: 3 rings of small balls; jagged when red (red 0..1)
  function soundRings(Wd) {
    const rings = [0, 1, 2].map(() => Array.from({ length: 10 }, () => { const b = ball(.07, 0x6ec8ff); Wd.add(b); return b; }));
    return { update(t, red, on) {
      rings.forEach((arr, k) => {
        const ph = (t * .45 + k / 3) % 1;
        const R = .2 + 1.2 * ph;
        arr.forEach((b, i) => {
          const an = i / 10 * 2 * PI, wob = (i % 2 ? 1 : -1) * red * .22, rr = R * (1 + wob);
          b.position.set(SPOUT[0] + Math.cos(an) * rr, SPOUT[1] + Math.sin(an) * rr, SPOUT[2]);
          b.scale.setScalar(Math.max(.001, (1 - ph) * on * .9));
        });
      });
    } };
  }

  // ---------------------------------------------------------------- a thought cloud with a tag inside (the cloud is a set of grey balls)
  function thought(Wd, text, w) {
    const cg = new THREE.Group(); cg.visible = false; Wd.add(cg);
    [[-1.2, 0, .55], [1.2, 0, .55], [0, .35, .7], [-.6, .25, .6], [.6, .25, .6], [0, -.2, .5]].forEach(([x, y, r]) => { const c = ball(r, CLOUD); c.position.set(x, y, 0); cg.add(c); });
    const tt = tag(Wd, w, .55, text, ...TAG_BLUE);
    return { set(pos, s) {
      cg.visible = s > .01;
      if (cg.visible) { cg.position.set(pos[0], pos[1], pos[2]); cg.scale.setScalar(s); }
      tt.set([pos[0], pos[1] + .02, pos[2] + .9], s);
    } };
  }

  // ---------------------------------------------------------------- piecewise: the scale tilt helper (local coords, rotated by the beam)
  const toW = (lx, ly, th) => [PIV[0] + lx * Math.cos(th) - ly * Math.sin(th), PIV[1] + lx * Math.sin(th) + ly * Math.cos(th), 0];

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

  // ================================================================ HOOK (14 s): extreme close-up on the teapot's face, pulls out; a thought cloud "הייתי אומר גם בפניו" rises; blue cup at the side; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const cl = thought(Wd, 'הייתי אומר גם בפניו', 2.8);
    const qq = tag(Wd, .8, .8, '?', ...TAG_GOLD);
    Wd.qPos = [TEAP0[0], TEAP0[2]];
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.2, 0];
    Wd.on(t => {
      const g = popE(P(2, 4, t));
      cl.set([-.3, 2.6 + .08 * Math.sin(t * 2.2), .35], g);
      B.tp.g.rotation.y = .9 * sm(P(4, 8, t));
      B.cup.g.rotation.y = -.6 * sm(P(4, 8, t));
      B.tp.f.set(t, { smile: .3, talk: talkAmt(t, 3), look: [1, 0] });
      B.cup.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
      idleLis(B, t);
      qq.set([TEAP0[0] - .6, 2.4 + bob(t, 3), PZ], popE(P(1.4, 2.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut([TEAP0[0], 1.4, PZ], { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-.6, 1.2, 0], { dur: w[1], dist0: 8.4, dist1: 8.0, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([.2, 1.3, PZ], { dur: w[2], dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.4, PZ], { dur: w[3], dist0: 10, dist1: 9.4, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s): a balance scale; the big dark ball "לשון הרע" weighs on the left pan, a small light-grey dust cloud "אבק" on the right; a spotlight picks the dust; tag "רק באבק"
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
    const dk = dark(Wd); dk.g.scale.setScalar(1.6);
    const dust = new THREE.Group(); Wd.add(dust);
    [[0, 0, .14], [.16, .05, .12], [-.14, .06, .12], [.03, .17, .1]].forEach(([x, y, r]) => { const c = ball(r, CLOUD); c.position.set(x, y, 0); dust.add(c); });
    const spotG = new THREE.Group(); Wd.add(spotG);
    spotG.add(cyl(.06, .45, 2.4, SPOT));
    const tMain = tag(Wd, 2.6, .6, 'רק באבק', ...TAG_GREEN);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.4];
    Wd.on(t => {
      const tilt = .26 * sm(P(.5, 2, t));          // the dark ball is heavy: the left pan sinks
      beamG.rotation.z = tilt;
      const lp = toW(-1.1, -.75, tilt), rp = toW(1.1, -.75, tilt);
      dk.g.position.set(lp[0], lp[1] + .45, 0);
      const grow = popE(P(.2, 1.0, t));
      dust.position.set(rp[0], rp[1] + .25, 0);
      dust.scale.setScalar(Math.max(.001, grow * (1 + .08 * Math.sin(t * 3) * sm(P(3, 4, t)))));
      spotG.position.set(rp[0], rp[1] + 2.0, 0);
      spotG.scale.setScalar(Math.max(.001, popE(P(3, 4, t))));
      tMain.set([0, 2.95 + bob(t, 2), PZ], popE(P(4.2, 5.0, t)));
      B.tp.f.set(t, { smile: -.2, talk: .6 * talkAmt(t, 5), look: [1, 0] });
      B.tp.g.rotation.y = .5;
      B.cup.g.rotation.y = -.5;
      B.cup.f.set(t, { smile: .1, talk: 0, look: [-1, 0] });
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.6, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [3.5, HH(punch(insert([0, 2.2, 0], { dur: 3.5, dist0: 6.2, dist1: 5.8, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [1.0]), 22)],
      [3.5, HH(insert([1.1, 1.9, 0], { dur: 3.5, dist0: 5.0, dist1: 4.6, h0: 1.2, h1: 1.4, a0: -4, a1: 4, fov0: 40, fov1: 40 }), 23)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 9.5, dist1: 8.6, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s): the sentence card floats and flips between "פירוש טוב" and "פירוש של גנאי"; two arrows fork from it; tag "שני פירושים"
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const cd = card(Wd);
    const forkA = arrow(Wd, DARK), forkB = arrow(Wd, DARK);
    const tgA = [-1.4, 2.7, .6], tgB = [1.4, 2.7, .6];
    const tMain = tag(Wd, 3.0, .6, 'שני פירושים', ...TAG_BLUE);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.6];
    Wd.on(t => {
      cd.scale.setScalar(Math.max(.001, popE(P(0, 1.2, t))));
      cd.rotation.y = PI * (sm(P(6.5, 8, t)) - sm(P(11, 12.5, t)));  // grey side shows for a while, then white again
      cd.position.y = CARD[1] + .05 * Math.sin(t * 1.8);
      forkA.set([0, 2.4, .7], tgA, sm(P(1.2, 2.4, t)));
      forkB.set([0, 2.4, .7], tgB, sm(P(1.2, 2.4, t)));
      tMain.set([0, 2.95 + bob(t, 2), PZ], popE(P(1.5, 2.3, t)));
      B.tp.f.set(t, { smile: .2, talk: .6 * talkAmt(t, 9), look: [1, 0] });
      B.tp.g.rotation.y = .4;
      B.cup.g.rotation.y = -.6;
      B.cup.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.6, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [3.5, HH(insert([CARD[0], CARD[1], .6], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 32)],
      [3.5, HH(punch(pushIn([TEAP0[0] + .6, 1.3, PZ], { dur: 3.5, dist0: 6.4, dist1: 5.8, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.0]), 33)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s): the tone dial; the needle swings from green to red and back; sound rings leave the spout, smooth at green, jagged at red; tag "קול ותנועות"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const D = dial(Wd);
    const rg = soundRings(Wd);
    const tG = tag(Wd, 1.0, .42, 'קל', ...TAG_GREEN);
    const tR = tag(Wd, 1.5, .42, 'לגנות', ...TAG_BAD);
    const tMain = tag(Wd, 3.0, .6, 'קול ותנועות', ...TAG_BLUE);
    const aOf = t => .9 - 1.8 * sm(P(1.5, 4, t)) + 1.8 * sm(P(7.5, 10, t));
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-1.0, 1.4];
    Wd.on(t => {
      const a = aOf(t);
      D.set(a);
      rg.update(t, clamp(-a / .9, 0, 1), sm(P(.6, 1.4, t)));
      tG.set([DIAL[0] - 1.1, DIAL[1] + .65, DIAL[2]], popE(P(1, 1.8, t)));
      tR.set([DIAL[0] + 1.2, DIAL[1] + .65, DIAL[2]], popE(P(1, 1.8, t)));
      tMain.set([-1.2, 2.8 + bob(t, 3), PZ], popE(P(2.2, 3.0, t)));
      B.tp.f.set(t, { smile: -.1, talk: .8 * talkAmt(t, 9), look: [1, 0] });
      B.tp.g.rotation.y = .5;
      B.cup.g.rotation.y = -.5;
      B.cup.f.set(t, { smile: .1, talk: 0, look: [-1, 0] });
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-1.0, 1.4, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 41)],
      [3.5, HH(punch(insert([DIAL[0], DIAL[1], .4], { dur: 3.5, dist0: 6.0, dist1: 5.6, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.9]), 42)],
      [3.5, HH(pushIn([SPOUT[0], 1.2, PZ], { dur: 3.5, dist0: 6.6, dist1: 6.0, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 43)],
      [3.5, HH(crane([-.8, 1.4, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, good): the needle rests on green; the card turns its white side to the cup; the teapot says it face to face; the cup smiles; green check; tag "בלי גנאי - מותר"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const cd = card(Wd);
    const D = dial(Wd);
    const ck = mark3d(Wd, 'check', 1.2);
    const tG = tag(Wd, 1.0, .42, 'קל', ...TAG_GREEN);
    const tMain = tag(Wd, 3.2, .6, 'בלי גנאי - מותר', ...TAG_GREEN);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [.4, 1.4];
    Wd.on(t => {
      D.set(.9 + .05 * Math.sin(t * 1.3));
      tG.set([DIAL[0] - 1.1, DIAL[1] + .65, DIAL[2]], popE(P(.4, 1.2, t)));
      cd.rotation.y = .9 * sm(P(1.5, 3.5, t));                     // white side turns toward the cup
      cd.position.y = CARD[1] + .05 * Math.sin(t * 1.8);
      B.tp.g.rotation.y = .6 * sm(P(1, 3, t));
      B.tp.f.set(t, { smile: .5, talk: .6 * talkAmt(t, 13), look: [1, 0] });
      B.cup.g.rotation.y = -.5;
      B.cup.f.set(t, { smile: 1, talk: .3 * talkAmt(t, 15) * sm(P(3, 4, t)), look: [-1, 0] });
      ck.set([1.8, 2.6 + bob(t, 2), .6], popE(P(4.6, 5.4, t)));
      tMain.set([0, 3.25 + bob(t, 4), PZ], popE(P(6, 7, t)));
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.6, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 51)],
      [3.5, HH(insert([CARD[0], CARD[1], .6], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 52)],
      [3.5, HH(punch(pushIn([CUP0[0], 1.3, .2], { dur: 3.5, dist0: 6.2, dist1: 5.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.6]), 53)],
      [3.5, HH(crane([.4, 1.4, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): the teapot squints slyly, the needle jumps to red, rings turn jagged; the card flips to its grey side by itself; tag "כוונה לגנות"
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const cd = card(Wd);
    const D = dial(Wd);
    const rg = soundRings(Wd);
    const tR = tag(Wd, 1.5, .42, 'לגנות', ...TAG_BAD);
    const tMain = tag(Wd, 3.2, .6, 'כוונה לגנות', ...TAG_BAD);
    cd.rotation.y = .9;
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [-.2, 1.4];
    Wd.on(t => {
      const sq = sm(P(1, 2, t));
      B.tp.eb.rotation.z = -.4 * sq; B.tp.eb.position.y = .52 - .06 * sq;   // the squint
      const a = .9 - 1.8 * sm(P(.8, 1.6, t));
      D.set(a);
      rg.update(t, clamp(-a / .9, 0, 1), sm(P(.6, 1.2, t)));
      tR.set([DIAL[0] + 1.2, DIAL[1] + .65, DIAL[2]], popE(P(1.8, 2.6, t)));
      cd.rotation.y = .9 + PI * sm(P(2.5, 4, t));                   // the card flips to the grey side
      cd.position.y = CARD[1] + .04 * Math.sin(t * 2.6) * sm(P(2.5, 4, t));
      B.tp.f.set(t, { smile: -.6, talk: .7 * talkAmt(t, 15), look: [1, 0] });
      B.tp.g.rotation.y = .6;
      B.cup.g.rotation.y = -.6;
      B.cup.f.set(t, { smile: -.5, talk: 0, surprise: .6 * sm(P(3, 4, t)), look: [-1, 0] });
      tMain.set([0, 3.1 + bob(t, 5), PZ], popE(P(4.5, 5.3, t)));
    });
    Wd.cam = cuts([
      [3.5, HH(crane([0, 1.4, PZ], { dur: 3.5, dist0: 9.8, dist1: 9.2, h0: 1.0, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 61)],
      [3.5, HH(punch(insert([0, 2.0, PZ], { dur: 3.5, dist0: 6.0, dist1: 5.6, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [5.0]), 62)],
      [3.5, HH(pushIn([TEAP0[0], 1.2, PZ], { dur: 3.5, dist0: 7.6, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 63)],
      [3.5, HH(truck([.4, 1.3, 0], { dur: 3.5, dist0: 10, dist1: 9.4, h0: 1.6, h1: 2.0, a0: 6, a1: -6, fov0: 44, fov1: 42, shift: [.6, 0, 0] }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): a gold stamp "אמת" and the cloud "גם בפניו" try to protect the grey card, but slide off; red cross + shock; tag "אסור"
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const cd = card(Wd);
    cd.rotation.y = .9 + PI;                                        // grey side toward the cup
    const stamp = tag(Wd, 1.2, .5, 'אמת', ...TAG_GOLD);
    const cloud = thought(Wd, 'גם בפניו', 2.4);
    const cx = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    const tMain = tag(Wd, 2.6, .6, 'אסור', ...TAG_BAD);
    // stamp comes from the top left, lands near the card, then slides off to the left; the cloud does the same on the right
    const SA = [-2.4, 3.0, .8], SN = [-.9, 2.25, .9], SO = [-3.0, 1.2, .9];
    const CA = [2.4, 3.0, .8], CN = [.9, 2.25, .9], CO = [3.0, 1.2, .9];
    const path = (A, N, O, f, s) => [0, 1, 2].map(i => lerp(lerp(A[i], N[i], f), O[i], s));
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.6];
    Wd.on(t => {
      const f = sm(P(.8, 2.4, t)), s = sm(P(3.4, 5.4, t));
      stamp.set(path(SA, SN, SO, f, s), popE(P(.6, 1.2, t)) * (1 - .4 * s));
      cloud.set(path(CA, CN, CO, f, s), popE(P(.8, 1.4, t)) * (1 - .4 * s));
      cx.set([0, 1.9, 1.1], popE(P(5.0, 5.8, t)) * .8, .05 * Math.sin(t * 4) * (t > 5.8 ? 1 : 0));
      sk.set([0, 1.9, .6], P(5.0, 5.8, t), 1.4);
      tMain.set([0, 2.2 + bob(t, 4), PZ], popE(P(5.6, 6.4, t)));
      cd.position.y = CARD[1] + .04 * Math.sin(t * 1.6);
      B.tp.f.set(t, { smile: -.4, talk: .5 * talkAmt(t, 21), look: [1, 0] });
      B.tp.g.rotation.y = .6;
      B.cup.g.rotation.y = -.6;
      B.cup.f.set(t, { smile: lerp(-.2, -.6, sm(P(4.8, 5.6, t))), talk: 0, surprise: sm(P(4.8, 5.6, t)), look: [-1, 0] });
      idleLis(B, t);
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.6, 0], { dur: 3.5, dist0: 10, dist1: 9.6, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 71)],
      [3.5, HH(punch(insert([CARD[0], CARD[1], .6], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.0]), 72)],
      [3.5, HH(pushIn([CUP0[0], 1.2, .2], { dur: 3.5, dist0: 6.2, dist1: 5.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 73)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 9.5, dist1: 8.8, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): slow crane; the teapot at one side calm and smiling, the blue cup on the other side happy; the white side of the card glows between them; the dial on green. NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.tp.g.position.set(-2.3, TOP, PZ + .6); B.tp.g.rotation.y = .3;
    B.cup.g.position.set(2.3, TOP, PZ + .6); B.cup.g.rotation.y = -.3;
    B.lis.forEach(l => { l.g.visible = false; });
    const cd = card(Wd);
    const glow = box(2.3, 1.4, .03, LIT); glow.position.z = -.12; cd.add(glow);
    const D = dial(Wd);
    Wd.occ = [B.tp.g, B.cup.g]; Wd.center = [0, 1.4]; Wd.ansD = 6.4;
    Wd.on(t => {
      D.set(.9);
      glow.scale.set(1 + .02 * Math.sin(t * 2), 1 + .02 * Math.sin(t * 2), 1);
      cd.position.y = CARD[1] + .05 * Math.sin(t * 1.5);
      B.tp.f.set(t, { smile: .8, talk: .3 * talkAmt(t, 37), look: [1, 0] });
      B.cup.f.set(t, { smile: 1, talk: 0, look: [0, 0] });
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.5, PZ], { dur, dist0: 8.8, dist1: 8.4, h0: 1.0, h1: 2.2, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
