// yomit-23 story: "פתק שנשמט מההגרלה" (halacha yomit 23). Storyboard A in storyboards_v24.md.
// Copied from episodes/yomit-22/story.js (living-room helpers, tags, camera helpers). NO people, NO figures.
// Heroes: a lottery box with a face on its front (label "קלפי") and ONE small note with a face (the missing name).
// Other notes = plain white cards with a squiggle line. Everything is a function of local time t.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, toon, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const lerpV = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
  const arcV = (a, b, u, h) => { const p = lerpV(a, b, u); p[1] += h * Math.sin(PI * clamp(u, 0, 1)); return p; };
  const FB = { talk: 0, smile: .3, look: [0, 0], surprise: 0, open: 1 };
  const F = (f, t, o) => f.set(t, Object.assign({}, FB, o));
  const C4 = (dur, a, b, c, d) => cuts([[dur * .25, a], [dur * .25, b], [dur * .25, c], [dur * .25, d]]);
  const CLR_GOLD = 0xffd23a, CLR_WOOD = 0x8a5a2a, CLR_FLOOR = 0xb98a5a, CLR_INK = 0x2d3a6b;
  const WHITEP = ['#ffffff', '#2d3a6b', '#9aa7c4'], REDP = ['#ffe3e3', '#8a1a1a', '#d33b3b'];
  const GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'], GOLDP = ['#fff1c2', '#6a3a00', '#d9a63a'], ORANGEP = ['#ffe9d0', '#8a4a10', '#e8862a'];

  // ---------------------------------------------------------------- positions (metres; back wall at z=-2.4, camera on +z)
  const TOP = .9;                                                        // the table top height
  const BOX = [0, TOP, -.2], SLOT = [0, 1.7, -.2];                       // the lottery box and its slot (top of the box)
  const HERO0 = [-1.05, TOP + .25, .1];                                  // the small note (the missing name), standing outside
  const PILE = [[-1.9, .25], [-1.9, -.3], [-1.55, .25], [-1.55, -.3], [1.55, .25], [1.55, -.3], [1.9, .25], [1.9, -.3]];  // 8 other notes
  const PILE3 = PILE.map(p => [p[0], TOP + .25, p[1]]);
  const TAG_Y = 1.9;                                                     // beat tags, centred above the action

  // ---------------------------------------------------------------- tags (same helpers as yomit-22)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return;
      g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W2, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W2 * .03, H * .06, W2 * .94, H * .88, H * .3); c.fill();
    c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W2 * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W2 / 2, H * .54);
  };
  const T2 = (Wd, w, text, pal, h) => bb(Wd, w, h || .42, drawTag(text, pal[0], pal[1], pal[2]));

  // ---------------------------------------------------------------- props
  // a disc that glows (faces the camera)
  function glowAt(Wd, p, r, c) { const d = cyl(r, r, .03, c); d.rotation.x = PI / 2; d.position.set(p[0], p[1], p[2]); Wd.add(d); return d; }
  // the living room of yomit-22, now a kitchen-table scene: back wall, floor, a wooden table with a cloth
  function room(Wd) {
    const back = box(12, 6, .2, 0xf3e3c8); back.position.set(0, 2.5, -2.4); Wd.add(back);
    const floor = box(12, .1, 10, CLR_FLOOR); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const tb = box(4.4, TOP, 2.0, CLR_WOOD); tb.position.set(0, TOP / 2, -.6); Wd.add(tb);
    const cl = box(4.2, .03, 1.8, 0xf0e0c0); cl.position.set(0, TOP + .015, -.6); Wd.add(cl);
  }
  // the lottery box: a wooden box with a slot on top and a face on its front; label "קלפי" set by the beat
  function lotteryBox(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const body = box(.9, .8, .7, CLR_WOOD); body.position.y = .4; g.add(body);
    const lid = box(.96, .06, .76, 0x6a3a18); lid.position.y = .83; g.add(lid);
    const slot = box(.5, .03, .08, 0x1a1008); slot.position.set(0, .86, 0); g.add(slot);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .42, .36], seed: 23 });
    const TL = T2(Wd, .7, 'קלפי', WHITEP, .36);
    return { g, f, TL };
  }
  // a white folded note with a squiggle line; withFace = the small note (the missing name) with a face
  function note(Wd, p, seed, withFace) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const card = box(.42, .5, .04, 0xffffff); g.add(card);
    const sq = box(.28, .03, .02, CLR_INK); sq.position.set(0, -.17, .03); g.add(sq);
    const f = withFace ? face(Wd, { w: .32, parent: g, pos: [0, .08, .035], seed }) : null;
    return { g, card, f };
  }
  // a note flies from p0 into the slot and disappears inside the box (u = 0..1 over d seconds from t0)
  const flyIn = (n, p0, t, t0, d, slot) => {
    const u = clamp((t - t0) / d, 0, 1), p = arcV(p0, slot, sm(u), .7);
    n.g.position.set(p[0], p[1], p[2]); n.g.scale.setScalar(lerp(1, .35, u)); n.g.visible = u < 1;
  };
  // a note jumps out of the slot to a point in the air and stays there
  const flyOut = (n, to, t, t0, d, slot) => {
    const u = clamp((t - t0) / d, 0, 1), p = arcV(slot, to, sm(u), .8);
    n.g.visible = t >= t0; n.g.position.set(p[0], p[1], p[2]); n.g.scale.setScalar(lerp(.35, 1, u));
  };
  // a pile of gold coins (the prize)
  function coins(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    for (let k = 0; k < 5; k++) { const c = cyl(.22, .22, .05, CLR_GOLD); c.position.y = .025 + k * .05; g.add(c); }
    return g;
  }
  // an open book on a flat base: the right page is a pivot that turns (rotation.z)
  function makeBook(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const cov = box(.95, .05, .7, 0x7a3a10); cov.position.y = .025; g.add(cov);
    const pl = box(.42, .04, .62, 0xfff8e8); pl.position.set(-.22, .06, 0); g.add(pl);
    const piv = new THREE.Group(); piv.position.set(0, .06, 0); g.add(piv);
    const pr = box(.42, .04, .62, 0xfff8e8); pr.position.set(.22, 0, 0); piv.add(pr);
    return piv;
  }
  // an hourglass: two glass bulbs between two wooden discs; the sand is one ball
  function hourglass(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); g.scale.setScalar(.9); Wd.add(g);
    const top = cyl(.2, .04, .32, 0xbfe8ff); top.position.y = .46; g.add(top);
    const bot = cyl(.04, .2, .32, 0xbfe8ff); bot.position.y = .14; g.add(bot);
    [0, .62].forEach(y => { const d = cyl(.24, .24, .05, 0x6a3a18); d.position.y = y; g.add(d); });
    const sand = ball(.06, 0xf2c14e); g.add(sand);
    return { g, sand };
  }
  // a balance (scale): a post and a beam that tilts; the two pans are children of the beam
  function balance(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const post = cyl(.04, .04, .5, CLR_WOOD); post.position.y = .25; g.add(post);
    const beam = new THREE.Group(); beam.position.y = .5; g.add(beam);
    beam.add(box(1.0, .05, .05, 0x6a3a18));
    [-.45, .45].forEach(x => { const pan = cyl(.2, .2, .03, 0xc0d8ff); pan.position.set(x, -.2, 0); beam.add(pan); });
    return beam;
  }
  // a wall calendar: the top page flips over its bottom edge (pivot) to show "הגרלה הבאה" underneath
  function calendar(Wd, p) {
    const pv = new THREE.Group(); pv.position.set(p[0], p[1], p[2]); Wd.add(pv);
    const under = box(.9, .7, .04, 0xffffff); under.position.set(0, .35, -.02); pv.add(under);
    const pg = new THREE.Group(); pv.add(pg);
    const page = box(.9, .7, .04, 0xffffff); page.position.set(0, .35, .02); pg.add(page);
    const hd = box(.9, .14, .05, 0xc0584a); hd.position.set(0, .63, .05); pg.add(hd);
    return pg;
  }
  // a green ring (a circular arrow) in the plane facing the camera
  function ring(Wd, p, R, c) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(R, .07, 14, 56, PI * 1.7), toon(c));
    m.position.set(p[0], p[1], p[2]); Wd.add(m); return m;
  }
  // a sparkle (the gold star on the winning note): four gold balls turning around its centre
  function sparkle(parent) {
    const sg = new THREE.Group(); sg.position.set(.28, .3, .04); parent.add(sg);
    for (let k = 0; k < 4; k++) { const a = k / 4 * 2 * PI; const b = ball(.05, CLR_GOLD); b.position.set(Math.cos(a) * .12, Math.sin(a) * .12, 0); sg.add(b); }
    return sg;
  }

  // ================================================================ HOOK 0-14: extreme close-up on the small note's worried face, pull out: the box on the table, the other notes jump into its slot one by one; coins glow behind; "?" from qPos
  function hook(dur) {
    const Wd = mkWorld({}); room(Wd);
    const L = lotteryBox(Wd, BOX), H = note(Wd, HERO0, 23, true);
    const N = PILE3.map(p => note(Wd, p, 0, false));
    const gl = glowAt(Wd, [1.2, 1.4, -2.2], .6, CLR_GOLD);
    coins(Wd, [1.2, TOP, -1.1]);
    Wd.on(t => {
      N.forEach((n, i) => flyIn(n, PILE3[i], t, 4 + i * .9, 1.0, SLOT));
      L.g.rotation.z = t > 11 ? Math.sin(t * 30) * .045 * (1 - P(13, 14, t)) : 0;
      gl.scale.setScalar(1 + .12 * Math.sin(t * 3));
      L.TL.set([0, 1.85, 1.0], 1, 0, 1);
      F(H.f, t, { smile: -.6, look: [.6, 0], talk: t > 3 && t < 11 ? .5 * talkAmt(t, 23) : 0 });
      F(L.f, t, { smile: t > 4 ? .8 : .2, look: [0, .2], talk: t > 4 && t < 11 ? .6 * talkAmt(t, 9) : 0 });
    });
    Wd.occ = []; Wd.center = [-.3, 1.0]; Wd.qPos = [HERO0[0], HERO0[2]];
    Wd.cam = C4(dur,
      HH(pullOut([HERO0[0], 1.15, .1], { dur: dur * .25, dist0: 1.3, dist1: 2.2, h0: 1.15, h1: 1.5, a0: 6, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([-.4, 1.0, -.2], { dur: dur * .25, dist0: 3.0, dist1: 5.2, h0: 1.2, h1: 1.6, a0: -4, a1: 6, fov0: 38, fov1: 44 }), 42),
      HH(truck([0, 1.2, -.2], { dur: dur * .25, dist0: 6.2, dist1: 6.0, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([0, 1.3, -.2], { dur: dur * .25, dist0: 4.6, dist1: 4.0, h0: 1.3, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14): the open book turns, the hourglass runs (hours of learning); 8 notes hop one by one into the slot; the box shakes; the coins shine; tag "הגרלה"
  function s1(dur) {
    const Wd = mkWorld({}); room(Wd);
    const L = lotteryBox(Wd, BOX), H = note(Wd, HERO0, 23, true);
    const N = PILE3.map(p => note(Wd, p, 0, false));
    const bk = makeBook(Wd, [-1.5, TOP, -1.1]), hg = hourglass(Wd, [-.7, TOP, -1.1]), cn = coins(Wd, [1.2, TOP, -1.1]);
    const gl = glowAt(Wd, [1.2, 1.4, -2.2], .6, CLR_GOLD);
    const TG = T2(Wd, 1.2, 'הגרלה', GOLDP, .42);
    Wd.on(t => {
      N.forEach((n, i) => flyIn(n, PILE3[i], t, 2.5 + i * 1.0, 1.0, SLOT));
      L.g.rotation.z = Math.sin(t * 28) * .05 * P(10.3, 10.8, t) * (1 - P(13, 14, t));
      L.TL.set([0, 1.85, 1.0], 1, 0, 1);
      bk.rotation.z = -.9 * PI * (.5 - .5 * Math.cos(t * 2.2));
      hg.sand.position.set(0, .45 - .22 * ((t * .2) % 1), 0);
      cn.rotation.y = t * .6;
      gl.scale.setScalar(1 + .3 * P(10, 11, t) * (.6 + .4 * Math.sin(t * 6)));
      TG.set([0, TAG_Y, 1.0], popE(P(.5, 1.1, t)), 0, 1);
      F(L.f, t, { smile: .7, look: [0, .2], talk: t > 2.5 && t < 10.5 ? .6 * talkAmt(t, 31) : 0 });
      F(H.f, t, { smile: .3, look: [.5, .2], talk: t > 10.5 ? .3 * talkAmt(t, 32) : 0 });
    });
    Wd.occ = []; Wd.center = [-.2, 1.1];
    Wd.cam = C4(dur,
      HH(crane([0, 1.6, -.2], { dur: dur * .25, dist0: 8.0, dist1: 7.4, h0: 1.0, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 11),
      HH(punch(pushIn([0, 1.2, -.2], { dur: dur * .25, dist0: 5.6, dist1: 5.0, h0: 1.1, h1: 1.3, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 12),
      HH(insert([0, 1.5, .2], { dur: dur * .25, dist0: 3.4, dist1: 3.2, h0: 1.8, h1: 1.9, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([-.2, 1.2, -.2], { dur: dur * .25, dist0: 7.0, dist1: 6.6, h0: 1.2, h1: 1.4, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (14, bad): a winning note jumps out with a gold sparkle; the counter "7 מתוך 8"; the small note still outside; red cross + shock; tag "נשמט"
  function s2(dur) {
    const Wd = mkWorld({}); room(Wd);
    const L = lotteryBox(Wd, BOX), H = note(Wd, HERO0, 23, true);
    const N = PILE3.map(p => note(Wd, p, 0, false));          // N[7] is the winner
    const W = N[7], sp = sparkle(W.g);
    const CNT = T2(Wd, .9, '8 מתוך 9', ORANGEP, .38);
    const NSH = T2(Wd, 1.0, 'נשמט', REDP, .42);
    const X = mark3d(Wd, 'cross', .6), SK = shock(Wd, 0xff5a5a);
    Wd.on(t => {
      N.forEach((n, i) => { if (i < 7) n.g.visible = false; });
      flyOut(W, [.85, TOP + .25, .25], t, 1.2, 1.2, SLOT);
      sp.visible = t > 1.2; sp.rotation.z = t * 4;
      L.TL.set([0, 1.85, 1.0], 1, 0, 1);
      CNT.set([0, 1.85, 1.0], popE(P(3.2, 3.9, t)), 0, 1);
      const hit = P(4.0, 4.6, t);
      SK.set([HERO0[0], HERO0[1] + .3, HERO0[2] + .05], hit, 1.2);
      X.set([HERO0[0], 1.75, .3], popE(P(4.2, 4.8, t)) * .9, 0);
      NSH.set([0, TAG_Y, 1.0], popE(P(4.4, 5.0, t)), 0, 1);
      F(H.f, t, { smile: -.5, look: [-.6, .2], surprise: sm(P(3.8, 4.6, t)), talk: t < 3.8 ? .6 * talkAmt(t, 41) : 0 });
      F(L.f, t, { smile: t > 4 ? -.2 : .2, look: [0, .2], talk: t < 3.5 ? .5 * talkAmt(t, 42) : 0 });
    });
    Wd.occ = []; Wd.center = [-.1, 1.1];
    Wd.cam = C4(dur,
      HH(truck([0, 1.3, -.2], { dur: dur * .25, dist0: 8.0, dist1: 7.6, h0: 1.1, h1: 1.3, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 21),
      HH(insert([0, 1.7, -.2], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.8, h1: 1.9, a0: 6, a1: -6, fov0: 38, fov1: 36 }), 22),
      HH(punch(pushIn([HERO0[0], 1.2, .1], { dur: dur * .25, dist0: 4.4, dist1: 3.8, h0: 1.2, h1: 1.3, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [1.0]), 23),
      HH(orbitShot([-.3, 1.2, -.2], { dur: dur * .25, dist0: 6.8, dist1: 6.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (14): a calendar page flips to "הגרלה הבאה"; two copies of the small note stand side by side ("x2"), ready to jump in; a balance tilts; tag "פעמיים"
  function s3(dur) {
    const Wd = mkWorld({}); room(Wd);
    const L = lotteryBox(Wd, BOX), H = note(Wd, HERO0, 23, true);
    const N = PILE3.map(p => note(Wd, p, 0, false));
    const C1 = note(Wd, [1.0, TOP + .25, .2], 31, true), C2 = note(Wd, [1.5, TOP + .25, .2], 32, true);
    const bal = balance(Wd, [-1.45, TOP, -1.1]);
    const pg = calendar(Wd, [1.35, 1.3, -2.2]);
    const TCAL = T2(Wd, 1.1, 'הגרלה הבאה', GREENP, .38);
    const TX2 = T2(Wd, .5, 'x2', GOLDP, .36);
    const TG = T2(Wd, 1.2, 'פעמיים', GOLDP, .42);
    Wd.on(t => {
      N.forEach(n => { n.g.visible = false; });
      L.TL.set([0, 1.85, 1.0], 1, 0, 1);
      bal.rotation.z = .25 * Math.sin(t * 1.6);
      pg.rotation.x = -PI * .92 * sm(P(1, 2.6, t));
      TCAL.set([1.35, 2.2, -2.0], popE(P(2.8, 3.6, t)), 0, 1);
      C1.g.visible = t > 2.5; C2.g.visible = t > 2.5;
      C1.g.position.y = TOP + .25 + .03 * Math.sin(t * 3); C2.g.position.y = TOP + .25 + .03 * Math.sin(t * 3 + 1);
      TX2.set([1.25, 1.85, .2], popE(P(2.6, 3.2, t)), 0, 1);
      TG.set([0, TAG_Y, 1.0], popE(P(5, 5.6, t)), 0, 1);
      F(H.f, t, { smile: .2, look: [.2, .2], talk: t < 4 ? .4 * talkAmt(t, 33) : 0 });
      F(C1.f, t, { smile: .5, look: [-.6, 0], talk: t > 4 ? .5 * talkAmt(t, 34) : 0 });
      F(C2.f, t, { smile: .5, look: [-.6, 0], talk: t > 4 ? .5 * talkAmt(t, 35) : 0 });
      F(L.f, t, { smile: .3, look: [0, .2], talk: t > 5 && t < 9 ? .5 * talkAmt(t, 36) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(crane([0, 1.6, -.4], { dur: dur * .25, dist0: 8.2, dist1: 7.6, h0: 1.1, h1: 1.5, a0: 8, a1: -6, fov0: 46, fov1: 44 }), 31),
      HH(pushIn([1.2, 1.3, .2], { dur: dur * .25, dist0: 4.8, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), 32),
      HH(punch(insert([-1.45, 1.3, -1.1], { dur: dur * .25, dist0: 3.6, dist1: 3.4, h0: 1.4, h1: 1.5, a0: -8, a1: 8, fov0: 36, fov1: 34 }), [dur * .25 * .3]), 33),
      HH(orbitShot([0, 1.3, -.2], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.3, h1: 1.5, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (16, neutral): the small note shakes its head and pushes the "x2" copies away; a big green circular arrow around the box ("מחדש"); all notes fly out of the box and wait in the air; orange pulse, no check
  function s4(dur) {
    const Wd = mkWorld({}); room(Wd);
    const L = lotteryBox(Wd, BOX), H = note(Wd, HERO0, 23, true);
    const N = PILE3.map(p => note(Wd, p, 0, false));
    const C1 = note(Wd, [1.0, TOP + .25, .2], 31, true), C2 = note(Wd, [1.5, TOP + .25, .2], 32, true);
    const RG = ring(Wd, [BOX[0], 1.25, .45], .95, 0x3fb840);
    const SK = shock(Wd, 0xff9a2a);
    const TM = T2(Wd, 1.2, 'מחדש', GREENP, .42);
    const hover = PILE.map((_, i) => { const a = i / 8 * 2 * PI; return [Math.cos(a) * 1.35, 1.6 + Math.sin(a) * .7, .3]; });
    Wd.on(t => {
      N.forEach((n, i) => {
        flyOut(n, hover[i], t, 1.2 + i * .35, 1.0, SLOT);
        if (t > 2.5 + i * .35) n.g.position.y = hover[i][1] + .06 * Math.sin(t * 2.2 + i);
      });
      L.TL.set([0, 1.85, 1.0], 1, 0, 1);
      const ps = Math.max(.001, popE(P(1.4, 2.4, t)));
      RG.visible = t > 1.4; RG.scale.setScalar(ps); RG.rotation.z = t * .6;
      SK.set([BOX[0], 1.2, .45], (t * .6) % 1, 1.5);
      TM.set([0, TAG_Y, 1.0], popE(P(.6, 1.2, t)), 0, 1);
      const push = sm(P(1.0, 2.4, t));
      C1.g.position.x = 1.0 + .9 * push; C1.g.rotation.z = -.6 * push;
      C2.g.position.x = 1.5 + 1.0 * sm(P(1.2, 2.6, t)); C2.g.rotation.z = -.5 * sm(P(1.2, 2.6, t));
      H.g.rotation.y = .35 * Math.sin(t * 9) * P(.2, .8, t) * (1 - P(3.5, 4.2, t));
      F(H.f, t, { smile: -.4, look: [-.5, .2], talk: t < 4 ? .5 * talkAmt(t, 51) : 0 });
      F(C1.f, t, { smile: -.5, look: [.8, 0], surprise: sm(P(1.0, 1.6, t)) });
      F(C2.f, t, { smile: -.5, look: [.8, 0], surprise: sm(P(1.2, 1.8, t)) });
      F(L.f, t, { smile: .2, look: [0, .2], talk: t > 1 && t < 8 ? .5 * talkAmt(t, 52) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.3];
    Wd.cam = C4(dur,
      HH(crane([0, 1.7, -.3], { dur: dur * .25, dist0: 8.4, dist1: 7.8, h0: 1.1, h1: 1.5, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 41),
      HH(punch(pushIn([0, 1.3, -.2], { dur: dur * .25, dist0: 5.8, dist1: 5.2, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .4]), 42),
      HH(insert([-1.0, 1.3, .4], { dur: dur * .25, dist0: 3.6, dist1: 3.4, h0: 1.4, h1: 1.5, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 43),
      HH(orbitShot([0, 1.4, -.2], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.4, h1: 1.6, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (14, good): all 9 notes (including the small one) drop into the box in a neat line; the box shakes evenly; green check; tag "כהוגן"
  function s5(dur) {
    const Wd = mkWorld({}); room(Wd);
    const L = lotteryBox(Wd, BOX);
    const ROW = [-1.6, -1.2, -.8, -.4, 0, .4, .8, 1.2, 1.6];      // the nine notes in one neat line in front of the box
    const N = PILE.map((_, i) => note(Wd, [ROW[i], TOP + .25, .3], 0, false));
    const H = note(Wd, [ROW[8], TOP + .25, .3], 23, true);
    const CK = mark3d(Wd, 'check', .9);
    const TG = T2(Wd, 1.2, 'כהוגן', GREENP, .42);
    Wd.on(t => {
      N.forEach((n, i) => flyIn(n, [ROW[i], TOP + .25, .3], t, 1.0 + i * .5, .9, SLOT));
      flyIn(H, [ROW[8], TOP + .25, .3], t, 1.0 + 8 * .5, .9, SLOT);
      L.g.rotation.z = .035 * Math.sin(t * 14) * P(4.8, 5.4, t) * (1 - P(11.6, 12.2, t));
      L.TL.set([0, 1.85, 1.0], 1, 0, 1);
      CK.set([0.95, 1.85, 1.0], popE(P(10.2, 10.9, t)) * .9, 0);
      TG.set([0, TAG_Y, 1.0], popE(P(.5, 1.1, t)), 0, 1);
      F(L.f, t, { smile: t > 10 ? 1 : .5, look: [0, .2], talk: t > .8 && t < 10 ? .4 * talkAmt(t, 55) : 0 });
      F(H.f, t, { smile: t > 5 ? 1 : .6, look: [0, .2], talk: t < 5 ? .5 * talkAmt(t, 56) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.1];
    Wd.cam = C4(dur,
      HH(crane([0, 1.5, -.2], { dur: dur * .25, dist0: 8.2, dist1: 7.6, h0: 1.2, h1: 1.6, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 51),
      HH(punch(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 5.4, dist1: 5.0, h0: 1.1, h1: 1.3, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .8]), 52),
      HH(insert([0, 1.4, .2], { dur: dur * .25, dist0: 3.6, dist1: 3.4, h0: 1.7, h1: 1.8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 53),
      HH(orbitShot([0, 1.2, -.2], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 54));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (14, bad): the spoiled lottery replayed: the small note outside; the winning star note has a crack and turns grey; red cross + shock; tag "הגורל בטל"
  function s6(dur) {
    const Wd = mkWorld({}); room(Wd);
    const L = lotteryBox(Wd, BOX), H = note(Wd, HERO0, 23, true);
    const N = PILE3.map(p => note(Wd, p, 0, false));
    const WIN = note(Wd, [.85, TOP + .25, .25], 0, false);
    const crack = box(.36, .014, .012, 0x222222); crack.position.set(0, .02, .03); crack.rotation.z = .6; WIN.g.add(crack);
    const sp = sparkle(WIN.g);
    const X = mark3d(Wd, 'cross', .6), SK = shock(Wd, 0xff5a5a);
    const TG = T2(Wd, 1.5, 'הגורל בטל', REDP, .42);
    const white = new THREE.Color(0xffffff), grey = new THREE.Color(0x7a7a7a);
    Wd.on(t => {
      N.forEach(n => { n.g.visible = false; });
      L.g.rotation.z = .02 * Math.sin(t * 12) * P(1, 2, t) * (1 - P(4, 5, t));
      L.TL.set([0, 1.85, 1.0], 1, 0, 1);
      crack.scale.x = Math.max(.001, P(2, 3, t));
      WIN.card.material.color.lerpColors(white, grey, P(3, 4.5, t));
      sp.visible = t < 3.5;
      sp.rotation.z = t * 4;
      const hit = P(4.2, 4.8, t);
      SK.set([.85, 1.15, .4], hit, 1.2);
      X.set([.85, 2.2, 1.0], popE(P(4.4, 5.0, t)) * .9, 0);
      TG.set([.85, 1.7, 1.0], popE(P(5, 5.6, t)), 0, 1);
      H.g.rotation.z = .05 * Math.sin(t * 5);
      F(H.f, t, { smile: -.6, look: [.5, 0], surprise: sm(P(2.5, 3.5, t)), talk: t < 4 ? .5 * talkAmt(t, 61) : 0 });
      F(L.f, t, { smile: -.3, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [-.1, 1.1];
    Wd.cam = C4(dur,
      HH(crane([0, 1.6, -.2], { dur: dur * .25, dist0: 8.0, dist1: 7.5, h0: 1.1, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 61),
      HH(punch(crane([.2, 1.4, .3], { dur: dur * .25, dist0: 8.0, dist1: 7.4, h0: 1.3, h1: 1.5, a0: 0, a1: 0, fov0: 44, fov1: 44 }), [dur * .25 * .8]), 62),
      HH(insert([.1, 1.5, .4], { dur: dur * .25, dist0: 7.0, dist1: 6.6, h0: 1.5, h1: 1.6, a0: 0, a1: 0, fov0: 44, fov1: 44 }), 63),
      HH(orbitShot([-.1, 1.2, -.2], { dur: dur * .25, dist0: 6.9, dist1: 6.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the box on one side smiling, the small note hops happily into the slot; the coins glow on the other side; a soft green circular arrow above "גורל חדש". NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); room(Wd);
    const BX = [-1.7, TOP, -.2], SL = [-1.7, 1.7, -.2];
    const L = lotteryBox(Wd, BX);
    const H = note(Wd, HERO0, 23, true);
    const N = PILE3.map(p => note(Wd, p, 0, false));
    const gl = glowAt(Wd, [2.0, 1.4, -2.2], .6, CLR_GOLD);
    const cn = coins(Wd, [2.0, TOP, -1.1]);
    const RG = ring(Wd, [-1.7, 1.3, .45], .75, 0x3fb840);
    const TG = T2(Wd, 1.6, 'גורל חדש', GREENP, .42);
    Wd.on(t => {
      N.forEach(n => { n.g.visible = false; });
      const hop = t > 3;
      flyIn(H, HERO0, t, 3.0, 1.6, SL);
      if (!hop) H.g.position.y = HERO0[1] + .05 * Math.abs(Math.sin(t * 6));
      L.g.rotation.z = .03 * Math.sin(t * 3);
      L.TL.set([-1.7, 1.85, 1.0], 1, 0, 1);
      gl.scale.setScalar(1 + .1 * Math.sin(t * 2.5));
      cn.rotation.y = t * .2;
      RG.rotation.z = t * .3;
      TG.set([-1.7, .75, 1.0], popE(P(.4, 1.2, t)), 0, 1);
      F(L.f, t, { smile: 1, look: [.3, .2], talk: .4 * talkAmt(t, 3) });
      F(H.f, t, { smile: 1, look: [.5, .2], talk: t < 4.6 ? .4 * talkAmt(t, 1) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([0.2, 1.9, -1.0],{ dur: dur, dist0: 8.2, dist1: 7.4, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
