// halashon-16 story: "What was - is not mentioned" (storyboards_v17.md, section B).
// Talking objects only, NO people. Adapted from halashon-15 (COPY FROM).
// Heroes: THE SCROLL (the story, face), 3 LISTENER cups with faces (tag "חברים"), a far HOUSE "מי שדיברו עליו" (crack grows),
// an old PHOTO frame "פעם" with a dark blot, a TREE "היום" (blooms at the end), a SALT SHAKER (face),
// a floor timeline from the blot to the tree, a balance scale, an open book with a gold line.
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
  const pulse = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);
  const GOLD = 0xf2c14e, GREEN = 0x2fbf5b, RED = 0xe03131, PAPER = 0xf4e4b8, LIT = 0xffd166, GREY = 0x6b6f76, DARK = 0x2b2b33, BLOSSOM = 0xffb3c7;
  const C_RED = new THREE.Color(RED), C_GREEN = new THREE.Color(GREEN), C_GOLD = new THREE.Color(GOLD), C_DARK = new THREE.Color(DARK), C_LIT = new THREE.Color(LIT);
  const TILE0 = 0xd8d2c2, C_TILE0 = new THREE.Color(TILE0);
  const TOP = .99;                    // table top surface (table = box at y .9, thickness .18)
  const SX = -4.3;                    // the scroll (the story)
  const SCX = -1.2;                   // the balance scale
  const LS = [1.0, 2.2, 3.4];         // the three listener cups
  const HOUSE = [9.6, -1.6];          // the far house (floor, behind the table end)
  const TL_Z = 2.3;                   // the floor timeline (in front of the table)
  const TIMEL = Array.from({ length: 13 }, (_, i) => -6.6 + .9 * i);
  const TREE = [TIMEL[12], TL_Z];     // the tree stands at the right end of the timeline
  const PHOTO = [-6.6, -.4];          // the old photo frame on the table, left
  const FCOL = 0xcfe6ff, SHCOL = 0xdfe3ea, LCOL = 0xf2b8a2;
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

  // ---------------------------------------------------------------- set: floor, back wall, long warm table with four legs
  function base(Wd) {
    const fl = box(26, .2, 9, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(26, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    const tb = box(17, .18, 3.0, 0xb07a4a); tb.position.set(-.1, TOP - .09, 0); Wd.add(tb);
    for (const lx of [-7.9, 7.9]) for (const lz of [-1.3, 1.3]) {
      const l = box(.2, TOP - .18, .2, 0x8a5a33); l.position.set(lx, (TOP - .18) / 2, lz); Wd.add(l);
    }
    Wd.center = [0, 0];
  }

  // ---------------------------------------------------------------- a friend / listener: a simple cup with a face
  function friend(Wd, x, z, y, seed, col) {
    const g = new THREE.Group(); g.position.set(x, y, z); Wd.add(g);
    const sau = cyl(.5, .5, .06, 0xf4f1ea); sau.position.y = .03; g.add(sau);
    const body = cyl(.36, .3, .8, col); body.position.y = .46; g.add(body);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .5, .38], seed });
    return { g, body, f, col };
  }

  // ---------------------------------------------------------------- the SECRET: an upright rolled scroll with a face on the +z side
  function scroll(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const body = cyl(.36, .36, 1.1, PAPER); body.position.y = .55; g.add(body);
    const rollT = cyl(.42, .42, .14, 0xc9a86a); rollT.position.y = 1.16; g.add(rollT);
    const rollB = cyl(.42, .42, .14, 0xc9a86a); rollB.position.y = -.02; g.add(rollB);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .62, .37], seed: 9 });
    const lock = new THREE.Group(); lock.position.set(0, .3, .4); lock.visible = false; g.add(lock);
    const lb = box(.3, .24, .1, GOLD); lock.add(lb);
    return { g, body, f, lock };
  }

  // ---------------------------------------------------------------- house of Shimon (face on the front = +z) with a crack on its side
  function house(Wd, x, seed, col, roof, z = 0) {
    const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g);
    const body = box(1.2, .9, .8, col); body.position.y = .45; g.add(body);
    const rf = cyl(0, .8, .6, roof); rf.position.y = 1.2; g.add(rf);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .55, .41], seed });
    const wins = [-.42, .42].map(x => { const wn = box(.2, .22, .05, 0x59606b); wn.position.set(x, .55, .42); g.add(wn); return wn; });
    const crack = box(.05, .6, .04, 0x1e1e1e); crack.position.set(.42, .3, .41); crack.scale.y = .001; g.add(crack);
    return { g, body, f, col, wins, crack };
  }
  const lightHouse = (h, a) => {
    const k = clamp(a, 0, 1);
    h.body.material.color.set(new THREE.Color(h.col).lerp(new THREE.Color(LIT), k));
    h.wins.forEach(wn => wn.material.color.set(new THREE.Color(0x59606b).lerp(new THREE.Color(0xffe066), k)));
  };
  const redHouse = (h, a) => h.body.material.color.set(new THREE.Color(h.col).lerp(C_RED, clamp(a, 0, 1)));

  // ---------------------------------------------------------------- the small balance scale (pivot on a post; pans hang from the beam)
  function scale(Wd) {
    const g = new THREE.Group(); g.position.set(SCX, TOP, 0); Wd.add(g);
    const foot = cyl(.5, .5, .08, 0x8a5a33); foot.position.y = .04; g.add(foot);
    const post = cyl(.08, .08, 1.6, 0x8a5a33); post.position.y = .8; g.add(post);
    const beam = new THREE.Group(); beam.position.y = 1.6; g.add(beam);
    beam.add(box(2.4, .08, .1, 0x8a5a33));
    const pans = [-1.1, 1.1].map(x => {
      const s = cyl(.006, .006, .45, 0x59606b); s.position.set(x, -.22, 0); beam.add(s);
      const p = cyl(.42, .42, .06, GOLD); p.position.set(x, -.46, 0); beam.add(p);
      return p;
    });
    return { g, beam, pans };
  }

  // ---------------------------------------------------------------- the TREE: a warm pot, a trunk, a green crown and four blossoms (scaled to 0 until they open)
  function tree(Wd) {
    const g = new THREE.Group(); g.position.set(TREE[0], 0, TREE[1]); Wd.add(g);
    const pot = cyl(.46, .36, .5, 0xb07a4a); pot.position.y = .25; g.add(pot);
    const trunk = cyl(.1, .15, .9, 0x8a5a33); trunk.position.y = .95; g.add(trunk);
    const crown = ball(.7, GREEN); crown.position.y = 1.9; g.add(crown);
    const bl = [0, 1, 2, 3].map(k => {
      const b = ball(.2, BLOSSOM); b.scale.setScalar(.001);
      b.position.set(Math.cos(k * 1.6) * .6, 1.9 + Math.sin(k * 1.6) * .35, .45); g.add(b); return b;
    });
    return { g, trunk, crown, bl };
  }

  // ---------------------------------------------------------------- the old PHOTO frame "פעם" standing on the table, with a dark blot on the picture
  function photo(Wd) {
    const g = new THREE.Group(); g.position.set(PHOTO[0], TOP, PHOTO[1]); Wd.add(g);
    const fr = box(1.1, 1.3, .08, 0x7a5a2a); fr.position.y = .7; g.add(fr);
    const pic = box(.85, 1.0, .05, 0xd9c9a3); pic.position.set(0, .72, .06); g.add(pic);
    const bl = ball(.13, DARK); bl.position.set(.2, .95, .12); g.add(bl);
    return { g, bl };
  }

  // ---------------------------------------------------------------- a SALT SHAKER with a face (+z side)
  function shaker(Wd, x, y, z) {
    const g = new THREE.Group(); g.position.set(x, y, z); Wd.add(g);
    const body = cyl(.26, .21, .62, SHCOL); body.position.y = .31; g.add(body);
    const top = cyl(.28, .28, .12, 0xc0c4cc); top.position.y = .68; g.add(top);
    const f = face(Wd, { w: .38, parent: g, pos: [0, .36, .27], seed: 44 });
    return { g, body, f };
  }

  // ---------------------------------------------------------------- spreading arcs: dotted path from a to b, lit by s in 0..1
  function arc(Wd, a, b, h, n) {
    const d = [];
    for (let k = 1; k <= n; k++) { const m = ball(.07, 0x6b7078); m.visible = false; Wd.add(m); d.push(m); }
    return (s, col) => d.forEach((m, k) => {
      const u = (k + 1) / (n + 1), on = s > u;
      m.visible = on; if (!on) return;
      const p = arcPt(a, b, u, h); m.position.set(p[0], p[1], p[2]);
      if (col !== undefined) m.material.color.set(col);
    });
  }

  // ---------------------------------------------------------------- the whole set (same objects in every beat; each beat animates what it needs)
  function build(Wd) {
    base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const L = LS.map((x, i) => friend(Wd, x, 0, TOP, 20 + i, FCOL));
    const hs = [house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1])];
    const tr = tree(Wd);
    const ph = photo(Wd);
    const tiles = TIMEL.map(x => { const m = box(1.0, .05, .6, TILE0); m.position.set(x, .03, TL_Z); Wd.add(m); return m; });
    const blot = ball(.22, DARK); blot.position.set(TIMEL[0], .22, TL_Z); Wd.add(blot);
    const sca = scale(Wd); sca.g.visible = false;
    return { sc, L, hs, tr, ph, tiles, blot, sca };
  }

  // ================================================================ HOOK (14 s): extreme close-up on the scroll's face, pulls out to the old photo "פעם" with its blot and the big tree "היום"; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const qq = tag(Wd, .8, .8, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    const past = tag(Wd, 2.2, .8, 'פעם', ...TAG_NEU);
    const today = tag(Wd, 2.2, .8, 'היום', ...TAG_GREEN);
    Wd.qPos = [SX, 0];
    Wd.occ = [B.sc.g, B.tr.g, B.ph.g]; Wd.center = [-2.6, 1.2];
    Wd.on(t => {
      B.sc.f.set(t, { smile: .3, talk: .5 * talkAmt(t, 3), look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: .1, talk: 0, look: [-1, 0] }));
      B.hs.forEach(h => { h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      B.tr.g.rotation.z = .02 * Math.sin(t * 2);
      B.ph.bl.position.y = .95 + .02 * Math.sin(t * 3);
      past.set([PHOTO[0], 2.3 + bob(t, 1), PHOTO[1]], popE(P(.8, 1.8, t)));
      today.set([TREE[0], 3.3 + bob(t, 2), TL_Z], popE(P(2.6, 3.6, t)));
      qq.set([SX, 2.6 + bob(t, 3), .4], popE(P(1.4, 2.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut([SX, 1.4, 0], { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-1.2, 1.2, 0], { dur: w[1], dist0: 12, dist1: 11.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([PHOTO[0], 1.6, PHOTO[1]], { dur: w[2], dist0: 7.4, dist1: 7.0, h0: 1.5, h1: 1.7, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([-1.2, 1.4, TL_Z], { dur: w[3], dist0: 12, dist1: 11.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, bad): the scroll's speech bubble has a sentence; a tiny "+1" word-block tries to slide into it; a red cross stamps it; tag "אפילו מילה אחת"
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bub = tag(Wd, 3.2, .6, 'שמעתי עליו מעשה', ...TAG_NEU);
    const plus = tag(Wd, 1.3, .95, '+1', '#ff3b3b', '#ffffff', '#ffe066');
    const again = tag(Wd, 3.0, .5, 'אפילו מילה אחת', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    const from = [-6.8, 2.5, .4], to = [SX + 1.3, 2.7, .4];
    Wd.occ = [B.sc.g, B.L[0].g, bub.g]; Wd.center = [-3.4, 1.6];
    Wd.on(t => {
      bub.set([SX, 2.7 + bob(t, 1), .4], popE(P(0, .8, t)));
      const go = sm(P(3.6, 5.8, t));
      const pp = [lerp(from[0], to[0], go), lerp(from[1], to[1], go), lerp(from[2], to[2], go)];
      plus.set(pp, popE(P(3.2, 3.8, t)) * (1 - sm(P(6.0, 6.6, t))));
      cx.set([SX + 1.3, 2.5, .9], popE(P(5.9, 6.6, t)) * .9, .05 * Math.sin(t * 4) * (t > 6.6 ? 1 : 0));
      sk.set([SX + 1.3, 2.5, .9], P(5.9, 6.6, t), 1.2);
      again.set([SX, 3.35 + bob(t, 2), .4], popE(P(6.8, 7.6, t)));
      B.sc.f.set(t, { smile: -.2, talk: .9 * talkAmt(t, 7) * sm(P(.4, 1.2, t)), surprise: sm(P(5.4, 5.9, t)), look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
      B.hs.forEach(h => { h.f.set(t, { smile: -.4, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
    });
    const w = [3.5, 3.8, 3.7, 3.0];
    Wd.cam = cuts([
      [w[0], HH(truck([-3.6, 1.4, 0], { dur: w[0], dist0: 10.5, dist1: 9.8, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [w[1], HH(punch(insert([SX + .6, 2.6, 0], { dur: w[1], dist0: 7.6, dist1: 7.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [6.4 - 3.5]), 22)],
      [w[2], HH(pushIn([SX, 1.4, 0], { dur: w[2], dist0: 5.0, dist1: 4.4, h0: 1.3, h1: 1.6, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 23)],
      [w[3], HH(crane([1.0, 1.4, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, bad): a salt shaker flies over the bubble and sprinkles on it; the bubble swells; the far house gets a crack (tag "מקלקל"); a red cross on the shaker
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bub = tag(Wd, 3.2, .6, 'שמעתי עליו מעשה', ...TAG_NEU);
    const shk = shaker(Wd, -2.0, TOP, .9);
    const dots = Array.from({ length: 7 }, () => { const d = ball(.045, 0xffffff); d.visible = false; Wd.add(d); return d; });
    const hcr = tag(Wd, 1.6, .5, 'מקלקל', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.1), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.sc.g, B.L[0].g, B.hs[0].g]; Wd.center = [-1.6, 1.8];
    Wd.on(t => {
      const k = sm(P(.5, 2.4, t));
      shk.g.position.set(lerp(-2.0, SX + 1.9, k), lerp(TOP, 3.4, k) + .3 * Math.sin(k * PI), lerp(.9, .4, k));
      shk.g.rotation.z = -.6 * sm(P(2.6, 3.2, t));
      shk.f.set(t, { smile: t > 9.5 ? -.6 : .3, talk: .5 * talkAmt(t, 44), surprise: sm(P(9.5, 10.0, t)), look: [-1, 0] });
      dots.forEach((d, j) => {
        const s = 3.0 + .35 * j, u = clamp((t - s) / .9, 0, 1);
        d.visible = t > s && u < 1;
        d.position.set(SX + 1.6 - .3 * u, 3.1 - .7 * u, .6);
      });
      bub.set([SX, 2.7 + bob(t, 1), .4], popE(P(0, .6, t)) * (1 + .25 * sm(P(3.0, 6.0, t))));
      B.hs[0].crack.scale.y = Math.max(.001, sm(P(6.0, 9.0, t)));
      hcr.set([HOUSE[0], 2.3 + bob(t, 2), HOUSE[1] + .4], popE(P(6.6, 7.6, t)));
      cx.set([SX + 2.6, 3.9, .9], popE(P(9.5, 10.4, t)) * .9, .05 * Math.sin(t * 4) * (t > 10.4 ? 1 : 0));
      sk.set([SX + 2.6, 3.9, .9], P(9.5, 10.4, t), 1.2);
      B.sc.f.set(t, { smile: -.4, talk: 0, look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
      B.hs.forEach(h => { h.f.set(t, { smile: -.6, talk: 0, surprise: sm(P(8.0, 9.0, t)), look: [-1, 0] }); lightHouse(h, 0); });
    });
    const w = [3.0, 3.8, 3.7, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.6, 1.6, 0], { dur: w[0], dist0: 11.5, dist1: 11, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 31)],
      [w[1], HH(punch(insert([SX + .8, 3.0, .4], { dur: w[1], dist0: 7.6, dist1: 7.2, h0: 2.2, h1: 2.3, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [9.6 - 3.0]), 32)],
      [w[2], HH(insert([HOUSE[0], 1.3, HOUSE[1]], { dur: w[2], dist0: 7.6, dist1: 7.1, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 33)],
      [w[3], HH(crane([SX + 1.5, 2.2, .4], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: 1.2, h1: 2.4, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s): a timeline on the floor: left the blot "בנערותו", then a long path of green tiles and checks to the right "מאז - כשורה", ending at the big tree "היום"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const past = tag(Wd, 1.9, .5, 'בנערותו', ...TAG_NEU);
    const after = tag(Wd, 2.6, .5, 'מאז - כשורה', ...TAG_GREEN);
    const today = tag(Wd, 1.5, .5, 'היום', ...TAG_GREEN);
    const ticks = [3, 6, 9, 12].map(i => ({ i, ck: mark3d(Wd, 'check', 1.0) }));
    const ar = arc(Wd, [TIMEL[0], 1.1, TL_Z], [TREE[0], 1.1, TL_Z], .9, 9);
    Wd.occ = [B.tr.g, B.sc.g]; Wd.center = [0, 1.0];
    Wd.on(t => {
      B.tiles.forEach((m, i) => { if (i === 0) return; const lit = sm(P(1.2 + .35 * i, 1.8 + .35 * i, t)); m.material.color.lerpColors(C_TILE0, C_GREEN, lit); });
      ar(sm(P(1.0, 5.5, t)), GREEN);
      B.blot.position.y = .22 + .05 * Math.sin(t * 2.2);
      ticks.forEach(({ i, ck }) => ck.set([TIMEL[i], 1.3 + bob(t, i), TL_Z], popE(P(1.8 + .35 * i, 2.4 + .35 * i, t)) * .5, 0));
      past.set([TIMEL[0], 1.5, TL_Z], popE(P(.4, 1.2, t)));
      after.set([0.0, 2.1, TL_Z], popE(P(4.6, 5.6, t)));
      today.set([TREE[0], 3.3 + bob(t, 2), TL_Z], popE(P(6.2, 7.2, t)));
      B.tr.g.rotation.z = .01 * Math.sin(t * 1.4);
      B.sc.f.set(t, { smile: .1, talk: 0, look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: .3, talk: 0, look: [0, 0] }));
    });
    const w = [3.5, 3.5, 3.7, 3.3];
    Wd.cam = cuts([
      [w[0], HH(crane([0.0, .6, TL_Z], { dur: w[0], dist0: 12, dist1: 11.4, h0: 1.4, h1: 2.2, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 41)],
      [w[1], HH(punch(insert([TIMEL[0] + 1.2, 1.1, TL_Z], { dur: w[1], dist0: 6.4, dist1: 6.0, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [1.0]), 42)],
      [w[2], HH(truck([4.2, 1.2, TL_Z], { dur: w[2], dist0: 10.2, dist1: 9.6, h0: 1.2, h1: 1.6, a0: -6, a1: 6, fov0: 44, fov1: 44 }), 43)],
      [w[3], HH(crane([2.2, .9, TL_Z], { dur: w[3], dist0: 11.5, dist1: 10.6, h0: 1.8, h1: 2.6, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, bad): the scroll turns to the three listeners and starts to unroll the old dark blot toward them; a red cross and tag "אסור לגנותו"; the tree shivers
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const kol = tag(Wd, 2.6, .55, 'אסור לגנותו', ...TAG_BAD);
    const fri = tag(Wd, 1.6, .5, 'חברים', ...TAG_BLUE);
    const bl2 = ball(.22, DARK); bl2.visible = false; Wd.add(bl2);
    const cx = mark3d(Wd, 'cross', 1.3), sk = shock(Wd, 0xff7a7a);
    const A = [SX + .5, 1.7, .5], Bp = [LS[0] - .3, 2.2, 0];
    Wd.occ = [B.sc.g, B.L[1].g, B.L[2].g]; Wd.center = [1.0, 1.4];
    Wd.on(t => {
      B.sc.g.rotation.y = .7 * sm(P(.6, 2.6, t));
      const u = clamp(sm(P(2.6, 5.4, t)), 0, 1);
      const p = arcPt(A, Bp, u, 1.0); bl2.position.set(p[0], p[1], p[2]);
      bl2.visible = t > 2.2 && t < 6.2;
      B.sc.f.set(t, { smile: -.4, talk: .8 * talkAmt(t, 9), look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: -.2, talk: 0, surprise: sm(P(5.6, 6.2, t)), look: [-1, 0] }));
      fri.set([LS[1] - 1.1, 2.0 + bob(t, 1), .3], popE(P(.6, 1.4, t)));
      kol.set([LS[1] + .4, 2.4 + bob(t, 2), .3], popE(P(6.6, 7.6, t)));
      cx.set([LS[0] - .2, 2.2, .8], popE(P(6.4, 7.2, t)) * .9, .05 * Math.sin(t * 4) * (t > 7.2 ? 1 : 0));
      sk.set([LS[0] - .2, 2.2, .8], P(6.4, 7.2, t), 1.3);
      B.tr.g.rotation.z = .05 * Math.sin(t * 18) * sm(P(6.4, 7.2, t));
    });
    const w = [3.8, 3.6, 3.4, 3.2];
    Wd.cam = cuts([
      [w[0], HH(truck([1.2, 1.4, 0], { dur: w[0], dist0: 11.5, dist1: 10.8, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 44, shift: [.6, 0, 0] }), 51)],
      [w[1], HH(punch(insert([1.6, 1.8, 0], { dur: w[1], dist0: 7.4, dist1: 7.0, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [6.6 - 3.8]), 52)],
      [w[2], HH(crane([SX + 1.5, 1.6, 0], { dur: w[2], dist0: 9.5, dist1: 8.6, h0: .8, h1: 2.2, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 53)],
      [w[3], HH(truck([3.0, 1.3, 0], { dur: w[3], dist0: 9.2, dist1: 8.8, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 44, fov1: 44 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): the far house is moved away ("שלא בפניו") - a red cross; then the balance scale: "האמת" on one pan, "+ 0" on the other - a second red cross
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const H = B.hs[0];
    const far = tag(Wd, 2.4, .55, 'שלא בפניו', ...TAG_BAD);
    const cx1 = mark3d(Wd, 'cross', 1.3), sk1 = shock(Wd, 0xff7a7a);
    const cx2 = mark3d(Wd, 'cross', 1.1), sk2 = shock(Wd, 0xff7a7a);
    const honest = tag(Wd, 1.9, .55, 'האמת', ...TAG_GREEN);
    const zero = tag(Wd, 1.4, .55, '+ 0', ...TAG_NEU);
    Wd.occ = [H.g, B.sca.g]; Wd.center = [4.0, 1.4];
    Wd.on(t => {
      const away = sm(P(.4, 2.8, t));
      H.g.position.x = lerp(HOUSE[0], 12.6, away);
      redHouse(H, sm(P(2.8, 3.4, t)));
      H.f.set(t, { smile: -.6, talk: .4 * talkAmt(t, 15) * away, surprise: sm(P(2.8, 3.3, t)), look: [-1, 0] });
      far.set([H.g.position.x, 2.0 + bob(t, 1), HOUSE[1] + .4], popE(P(.8, 1.8, t)));
      cx1.set([11.4, 2.0, HOUSE[1] + .9], popE(P(3.3, 4.1, t)) * .9, .05 * Math.sin(t * 4) * (t > 4.1 ? 1 : 0));
      sk1.set([11.4, 2.0, HOUSE[1] + .9], P(3.3, 4.1, t), 1.5);
      const sOn = Math.max(.001, popE(P(4.8, 5.8, t)));
      B.sca.g.visible = t > 4.8;
      B.sca.g.scale.setScalar(sOn);
      B.sca.beam.rotation.z = .15 * (1 - sm(P(5.8, 8.0, t)));
      honest.set([SCX - 1.1, 2.9 + bob(t, 2), .4], popE(P(5.6, 6.4, t)));
      zero.set([SCX + 1.1, 2.9 + bob(t, 3), .4], popE(P(6.6, 7.4, t)));
      cx2.set([SCX, 2.5, .9], popE(P(9.6, 10.4, t)) * .9, .05 * Math.sin(t * 4) * (t > 10.4 ? 1 : 0));
      sk2.set([SCX, 2.5, .9], P(9.6, 10.4, t), 1.3);
      B.sc.f.set(t, { smile: -.3, talk: .4 * talkAmt(t, 9), look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: -.3, talk: 0, look: [-1, 0] }));
    });
    const w = [3.5, 3.5, 3.6, 3.4];
    Wd.cam = cuts([
      [w[0], HH(truck([3.6, 1.4, 0], { dur: w[0], dist0: 12, dist1: 11.4, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 61)],
      [w[1], HH(insert([10.8, 1.6, -1.0], { dur: w[1], dist0: 7.6, dist1: 7.2, h0: 1.5, h1: 1.7, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 62)],
      [w[2], HH(punch(insert([SCX, 2.3, 0], { dur: w[2], dist0: 7.8, dist1: 7.4, h0: 1.8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), [9.6 - 7.1]), 63)],
      [w[3], HH(crane([SCX, 1.4, 0], { dur: w[3], dist0: 10, dist1: 9, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, good): an open book with the gold line "כל פשעיו אשר עשה לא יזכרו"; the old blot fades into light; the tree blooms; a green check
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const book = new THREE.Group(); book.position.set(.6, TOP + .95, 1.0); book.rotation.x = 1.1; Wd.add(book);
    const pgL = box(1.3, .06, 1.0, PAPER); pgL.position.x = -.62; book.add(pgL);
    const pgR = box(1.3, .06, 1.0, PAPER); pgR.position.x = .62; book.add(pgR);
    const spine = box(.14, .1, 1.0, 0x8a5a33); spine.position.y = .02; book.add(spine);
    const gold = tag(Wd, 4.6, .6, 'כל פשעיו אשר עשה לא יזכרו', ...TAG_GOLD);
    const ck = mark3d(Wd, 'check', 1.2);
    const spark = Array.from({ length: 6 }, () => { const s = ball(.07, GOLD); s.visible = false; Wd.add(s); return s; });
    Wd.occ = [book, B.tr.g]; Wd.center = [1.0, 1.2];
    Wd.on(t => {
      const open = sm(P(.2, 1.6, t));
      pgL.rotation.z = .3 * open; pgR.rotation.z = -.3 * open;
      const fade = sm(P(2.6, 5.6, t));
      B.blot.scale.setScalar(Math.max(.001, 1 - fade));
      B.blot.material.color.lerpColors(C_DARK, C_GOLD, fade);
      spark.forEach((s, k) => {
        const u = clamp((t - 3.0 - .35 * k) / 1.6, 0, 1);
        s.visible = u > 0 && u < 1;
        s.position.set(TIMEL[0] + .3 * Math.cos(k * 1.1), .25 + 1.4 * u, TL_Z + .3 * Math.sin(k * 1.1));
      });
      B.tr.crown.material.color.lerpColors(C_GREEN, C_LIT, sm(P(1.0, 5.0, t)));
      B.tr.bl.forEach((b, k) => b.scale.setScalar(Math.max(.001, sm(P(2.0 + .3 * k, 4.6 + .3 * k, t)))));
      B.tr.g.scale.setScalar(1 + .03 * pulse(t, 5.0, 1.0));
      ck.set([TREE[0], 3.4, TL_Z], popE(P(5.6, 6.6, t)) * .5, 0);
      gold.set([.6, 1.95 + bob(t, 1), 1.9], popE(P(.8, 2.0, t)));
      B.tiles.forEach(m => m.material.color.copy(C_GREEN));
      B.sc.f.set(t, { smile: .6, talk: 0, look: [0, 0] });
      B.L.forEach(f => f.f.set(t, { smile: .8, talk: 0, look: [0, 0] }));
    });
    const w = [4.0, 3.5, 3.5, 3.0];
    Wd.cam = cuts([
      [w[0], HH(crane([.6, 1.2, 1.0], { dur: w[0], dist0: 10, dist1: 9.4, h0: 3.5, h1: 2.6, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 71)],
      [w[1], HH(punch(insert([.6, 1.5, 1.0], { dur: w[1], dist0: 6.8, dist1: 6.3, h0: 2.2, h1: 2.0, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [1.2]), 72)],
      [w[2], HH(insert([TIMEL[0] + .6, 1.0, TL_Z], { dur: w[2], dist0: 6.4, dist1: 6.0, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 73)],
      [w[3], HH(pushIn([TREE[0], 1.9, TL_Z], { dur: w[3], dist0: 6.5, dist1: 5.2, h0: 1.9, h1: 2.1, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): the tree in full bloom on the left; the closed scroll with its padlock on the right; the listeners smile in the middle; the timeline is clean
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.tr.g.position.x = -4.6;
    B.sc.g.position.x = 3.9;
    B.sc.lock.visible = true; B.sc.lock.position.y = .3;
    B.sc.body.scale.y = .78; B.sc.body.position.y = .43;
    B.sca.g.visible = false;
    const bt = tag(Wd, 2.8, .55, 'שומר לשון', '#fff6d6', '#5a3a10', '#c9a050');
    Wd.occ = [B.sc.g, B.tr.g]; Wd.center = [1.0, 1.0]; Wd.ansD = 6.4;
    Wd.on(t => {
      B.tr.crown.material.color.copy(C_LIT);
      B.tr.bl.forEach(b => b.scale.setScalar(1));
      B.tr.g.scale.setScalar(1 + .03 * Math.sin(t * 2.2));
      B.sc.f.set(t, { smile: .6, talk: .3 * talkAmt(t, 37), look: [-1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: .9, talk: 0, look: [-1, 0] }));
      bt.set([2.2, 3.1 + bob(t, 1), .4], popE(P(.4, 1.4, t)));
    });
    Wd.camAns = cuts([[dur, HH(crane([1.0, 1.2, 0], { dur, dist0: 14.5, dist1: 13.4, h0: 1.0, h1: 2.4, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
