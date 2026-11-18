// halashon-17 story: "Who is the listener" (storyboards_v18.md, section B).
// Talking objects only, NO people. Adapted from halashon-16 (COPY FROM).
// Heroes: THE SCROLL (the story, face), a yellow SPONGE with a face (absorbs at once), 3 LISTENER cups with faces,
// the far HOUSE "מי שדיברו עליו", a BALL with a cloth band (lifnei iver), a truth METER.
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
  const GOLD = 0xf2c14e, GREEN = 0x2fbf5b, RED = 0xe03131, PAPER = 0xf4e4b8, LIT = 0xffd166, DARK = 0x2b2b33;
  const SPY = 0xf2d13b, SPD = 0x4a3320, FCOL = 0xcfe6ff, CLOTH = 0x1d1d22, BALLC = 0x3a86ff, STONE = 0x9aa0a8, CLOUD = 0xb6bcc6, WOOD = 0x8a5a33, PATHC = 0xc9a86a;
  const C_GREEN = new THREE.Color(GREEN), C_SPY = new THREE.Color(SPY), C_SPD = new THREE.Color(SPD);
  const TOP = .99;                       // table top surface (table = box at y .9, thickness .18)
  const SCR = [0, TOP, 0];               // the scroll (the story)
  const SPO = [-3.4, TOP, .2];           // the sponge (listener who absorbs at once)
  const CUPS = [2.2, 3.2, 4.2];          // three listeners who already heard
  const HOUSE = [9.4, -1.6];             // far house (floor, behind the table end)
  const PZ = 1.9;                        // floor path in front of the table
  const BOOK = [6.4, TOP + .95, .6];     // open book on the table, right
  const METER = [-6.6, -.2];             // truth meter on the table, left
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

  // ---------------------------------------------------------------- a listener: a simple cup with a face
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

  // ---------------------------------------------------------------- the SPONGE: a yellow block with holes and a face (+z side)
  function sponge(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const body = box(1.0, .7, .7, SPY); body.position.y = .35; g.add(body);
    const holes = [[-.28, .16], [.22, .14], [.3, .56], [-.2, .58]].map(([x, y]) => {
      const h = ball(.06, SPD); h.position.set(x, y, .36); g.add(h); return h;
    });
    const f = face(Wd, { w: .5, parent: g, pos: [0, .44, .37], seed: 61 });
    g.rotation.z = -.08;
    return { g, body, f, holes };
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
  const redHouse = (h, a) => h.body.material.color.set(new THREE.Color(h.col).lerp(C_RED, clamp(a, 0, 1)));
  const C_RED = new THREE.Color(RED);

  // ---------------------------------------------------------------- the truth METER: a post and a bar; the green fill grows from the left
  function meter(Wd, x, z) {
    const g = new THREE.Group(); g.position.set(x, TOP, z); Wd.add(g);
    const post = box(.08, .8, .08, WOOD); post.position.y = .4; g.add(post);
    const bar = box(1.6, .3, .1, 0x59606b); bar.position.set(0, .95, 0); g.add(bar);
    const fill = box(1.6, .22, .14, GREEN); fill.position.set(0, .95, .01); fill.scale.x = .001; g.add(fill);
    return { g, fill, set(f) { const k = Math.max(.001, f); fill.scale.x = k; fill.position.x = -.8 * (1 - k); } };
  }

  // ---------------------------------------------------------------- a magnifying glass (ring + glass + handle), faces the camera
  function lens(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    const ring = cyl(.42, .42, .06, GOLD); ring.rotation.x = PI / 2; g.add(ring);
    const glass = cyl(.36, .36, .02, 0xdff3ff); glass.rotation.x = PI / 2; glass.position.z = .04; g.add(glass);
    const hd = box(.08, .6, .06, WOOD); hd.position.set(.3, -.58, -.02); hd.rotation.z = -.7; g.add(hd);
    return g;
  }

  // ---------------------------------------------------------------- the whole set (same objects in every beat; each beat animates what it needs)
  function build(Wd) {
    base(Wd);
    const path = box(10.5, .02, .7, PATHC); path.position.set(0, .01, PZ); Wd.add(path);
    const sc = scroll(Wd, SCR);
    const sp = sponge(Wd, SPO);
    const L = CUPS.map((x, i) => friend(Wd, x, 0, TOP, 20 + i, FCOL));
    const hs = [house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1])];
    const me = meter(Wd, METER[0], METER[1]); me.set(0);
    const spot = cyl(.9, .9, .02, LIT); spot.position.set(SCR[0], TOP + .02, 0); spot.visible = false; Wd.add(spot);
    const lensG = lens(Wd); lensG.visible = false;
    const bg = new THREE.Group(); bg.position.set(-4.4, .28, PZ); Wd.add(bg);
    const bl = ball(.28, BALLC); bg.add(bl);
    const band = box(.6, .09, .05, CLOTH); band.position.set(0, .04, .27); bg.add(band);
    const block = box(.5, .42, .42, STONE); block.visible = false; Wd.add(block);
    return { path, sc, sp, L, hs, me, spot, lensG, bg, bl, band, block };
  }

  // ================================================================ HOOK (14 s): extreme close-up on the scroll's face, pulls out: 3 cups already heard on the right, the sponge leaning in on the left; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const qq = tag(Wd, .8, .8, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    Wd.qPos = [SCR[0], 0];
    Wd.occ = [B.sc.g, B.sp.g, B.L[1].g]; Wd.center = [-1.2, 1.2];
    Wd.on(t => {
      B.sc.f.set(t, { smile: .3, talk: .5 * talkAmt(t, 3), look: [-1, 0] });
      B.sp.f.set(t, { smile: .6, talk: 0, look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: .1, talk: 0, look: [-1, 0] }));
      B.hs.forEach(h => { h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }); });
      qq.set([SCR[0], 2.6 + bob(t, 3), .4], popE(P(1.4, 2.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut([0, 1.4, 0], { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-1.0, 1.2, 0], { dur: w[1], dist0: 12, dist1: 11.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([SPO[0], 1.2, SPO[2]], { dur: w[2], dist0: 7.4, dist1: 7.0, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.4, PZ], { dur: w[3], dist0: 12, dist1: 11.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, good): a spotlight sweeps from the scroll over to the sponge; a magnifying glass follows; tag "מי השומע?"; punch
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const q = tag(Wd, 2.8, .6, 'מי השומע?', ...TAG_GOLD);
    B.spot.visible = true;
    Wd.occ = [B.sc.g, B.sp.g]; Wd.center = [-1.6, 1.0];
    Wd.on(t => {
      const k = sm(P(1.0, 6.0, t));
      B.spot.position.x = lerp(SCR[0], SPO[0], k);
      B.lensG.visible = true;
      B.lensG.position.set(lerp(SCR[0] + .4, SPO[0] + .4, k), TOP + 1.3 + .08 * Math.sin(t * 2.4), .9);
      B.lensG.rotation.z = .12 * Math.sin(t * 2.4);
      q.set([SPO[0] + .4, 2.5 + bob(t, 1), .4], popE(P(6.6, 7.4, t)));
      B.sc.f.set(t, { smile: .3, talk: .9 * talkAmt(t, 7) * (1 - sm(P(6, 6.6, t))), look: [-1, 0] });
      B.sp.f.set(t, { smile: .2, talk: .6 * talkAmt(t, 5) * sm(P(6.4, 7, t)), surprise: .5 * sm(P(6.6, 7.2, t)), look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: .1, talk: 0, look: [1, 0] }));
      B.hs.forEach(h => h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.6, 1.4, 0], { dur: w[0], dist0: 10.5, dist1: 9.8, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [w[1], HH(punch(insert([SPO[0], 1.5, SPO[2]], { dur: w[1], dist0: 6.8, dist1: 6.4, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [3.7]), 22)],
      [w[2], HH(pushIn([-1.6, 1.2, 0], { dur: w[2], dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.5, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 23)],
      [w[3], HH(crane([1.0, 1.4, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s... 28 s beat, good-bad): a dark word-drop falls from the scroll onto the sponge; it is soaked at once, the sponge changes colour, meter "אמת" jumps to full; a cup holds the same drop outside with "?"
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const drop = ball(.16, DARK); drop.visible = false; Wd.add(drop);
    const outD = ball(.16, DARK); outD.position.set(CUPS[0], 2.1, .3); Wd.add(outD);
    const q = tag(Wd, .6, .6, '?', ...TAG_GOLD);
    const tg = tag(Wd, 2.6, .55, 'מקבל מיד', ...TAG_GREEN);
    const mt = tag(Wd, 1.2, .5, 'אמת', ...TAG_GREEN);
    const ck = mark3d(Wd, 'check', 1.2);
    Wd.occ = [B.sp.g, B.sc.g]; Wd.center = [-1.2, 1.2];
    Wd.on(t => {
      const fall = sm(P(2.0, 4.4, t));
      const dp = arcPt([SCR[0], 2.0, .6], [SPO[0] + .1, TOP + .8, .3], fall, .9);
      drop.visible = t > 2.0 && t < 4.6;
      drop.position.set(dp[0], dp[1], dp[2]);
      B.sp.body.material.color.lerpColors(C_SPY, C_SPD, sm(P(4.4, 5.8, t)));
      B.sp.g.scale.setScalar(1 + .04 * Math.sin(t * 6) * (t > 4.4 && t < 6 ? 1 : 0));
      B.me.set(sm(P(5.8, 6.1, t)));
      outD.position.y = 2.1 + .06 * Math.sin(t * 3);
      q.set([CUPS[0], 2.8 + bob(t, 2), .3], popE(P(2.6, 3.4, t)));
      tg.set([SPO[0], 2.3 + bob(t, 3), .4], popE(P(1.0, 1.8, t)));
      mt.set([METER[0], TOP + 1.5, METER[1]], popE(P(6.0, 6.6, t)));
      ck.set([SPO[0] + .3, 2.6, .9], popE(P(6.4, 7.2, t)) * .9, .05 * Math.sin(t * 4) * (t > 7.2 ? 1 : 0));
      B.sc.f.set(t, { smile: -.2, talk: .8 * talkAmt(t, 9) * (1 - sm(P(3.6, 4.4, t))), look: [1, 0] });
      B.sp.f.set(t, { smile: .6, talk: t < 4.4 ? .3 * talkAmt(t, 11) : 0, look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: -.1, talk: 0, look: [-1, 0] }));
      B.hs.forEach(h => h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.2, 1.4, 0], { dur: w[0], dist0: 11.5, dist1: 11, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 31)],
      [w[1], HH(insert([SPO[0] + .6, 1.6, SPO[2]], { dur: w[1], dist0: 7.0, dist1: 6.6, h0: 1.6, h1: 1.7, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 32)],
      [w[2], HH(insert([METER[0], 1.3, METER[1]], { dur: w[2], dist0: 6.8, dist1: 6.4, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 33)],
      [w[3], HH(crane([0.6, 1.4, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: 1.0, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): the sponge squeezes: three bigger dark drops with "+" fly to the far house; the crack grows; red cross; tag "מוסיף"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const drops = [0, 1, 2].map(j => {
      const d = ball(.2, DARK); d.visible = false; Wd.add(d);
      const pl = tag(Wd, .6, .6, '+', ...TAG_BAD);
      return { d, pl, s: 4.6 + 1.1 * j };
    });
    const tm = tag(Wd, 1.8, .55, 'מוסיף', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.3), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.sp.g, B.hs[0].g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      const sq = Math.max(0, Math.sin(t * 3.4)) * sm(P(1.5, 3.0, t));
      B.sp.g.scale.set(1 + .08 * sq, 1 - .14 * sq, 1 + .08 * sq);
      drops.forEach(({ d, pl, s }) => {
        const u = clamp((t - s) / 3.2, 0, 1);
        const p = arcPt([SPO[0] + .4, TOP + .7, .3], [HOUSE[0] - .8, 1.2, HOUSE[1] + .4], u, 1.6);
        const on = t > s && u < 1;
        d.visible = on; d.position.set(p[0], p[1], p[2]); d.scale.setScalar(1.3);
        pl.set([p[0], p[1] + .45, p[2]], on ? popE(clamp((t - s) / .5, 0, 1)) : 0);
      });
      B.hs[0].crack.scale.y = Math.max(.001, sm(P(4.0, 10.0, t)));
      redHouse(B.hs[0], sm(P(8.0, 10.0, t)));
      cx.set([HOUSE[0] - .4, 2.2, HOUSE[1] + .9], popE(P(9.6, 10.4, t)) * .9, .05 * Math.sin(t * 4) * (t > 10.4 ? 1 : 0));
      sk.set([HOUSE[0] - .4, 2.2, HOUSE[1] + .9], P(9.6, 10.4, t), 1.3);
      tm.set([SPO[0], 2.5 + bob(t, 2), .4], popE(P(.6, 1.4, t)));
      B.sp.f.set(t, { smile: -.4, talk: .7 * talkAmt(t, 13), look: [1, 0] });
      B.sc.f.set(t, { smile: -.3, talk: 0, look: [-1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: -.2, talk: 0, look: [1, 0] }));
      B.hs.forEach(h => h.f.set(t, { smile: -.6, talk: 0, surprise: sm(P(9.2, 9.8, t)), look: [-1, 0] }));
    });
    const w = [3.6, 3.6, 3.4, 3.4];
    Wd.cam = cuts([
      [w[0], HH(truck([.6, 1.4, 0], { dur: w[0], dist0: 12, dist1: 11.4, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 41)],
      [w[1], HH(insert([SPO[0] + .6, 1.6, SPO[2]], { dur: w[1], dist0: 7.4, dist1: 7.0, h0: 1.6, h1: 1.7, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 42)],
      [w[2], HH(insert([HOUSE[0], 1.4, HOUSE[1]], { dur: w[2], dist0: 7.6, dist1: 7.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 43)],
      [w[3], HH(crane([3.2, 1.2, 0], { dur: w[3], dist0: 9.5, dist1: 8.6, h0: .9, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, bad): the scroll opens only a tiny corner with three dots; a red barrier drops between the scroll and the sponge; red cross; tag "שום רמז"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const MIDX = (SCR[0] + SPO[0]) / 2;
    const bub = tag(Wd, 1.2, .55, '...', ...TAG_NEU);
    const barrier = box(.14, 1.8, 1.4, RED); Wd.add(barrier);
    const flap = box(.22, .34, .05, PAPER); Wd.add(flap);
    const kol = tag(Wd, 2.4, .55, 'שום רמז', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.sc.g, B.sp.g]; Wd.center = [-1.2, 1.2];
    Wd.on(t => {
      const open = sm(P(.8, 2.4, t));
      flap.position.set(.36 + .06 * open, TOP + 1.0 + .02 * Math.sin(t * 2), .3 + .08 * open);
      flap.rotation.y = -.5 * open;
      const drop = sm(P(2.4, 3.6, t));
      barrier.position.set(MIDX, lerp(3.6, TOP + .95, drop), .2);
      cx.set([MIDX, 2.6, .9], popE(P(3.8, 4.6, t)) * .9, .05 * Math.sin(t * 4) * (t > 4.6 ? 1 : 0));
      sk.set([MIDX, 2.6, .9], P(3.8, 4.6, t), 1.2);
      bub.set([SCR[0] + .9, 2.5 + bob(t, 1), .4], popE(P(.4, 1.2, t)));
      kol.set([MIDX, 3.05 + bob(t, 2), .4], popE(P(5.0, 5.8, t)));
      B.sc.f.set(t, { smile: -.3, talk: .3 * talkAmt(t, 17) * (1 - sm(P(.6, 1.2, t))), look: [1, 0] });
      B.sp.f.set(t, { smile: -.2, talk: .6 * talkAmt(t, 19) * sm(P(4.8, 5.2, t)), surprise: .4 * sm(P(4.6, 5.2, t)), look: [-1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: -.2, talk: 0, look: [1, 0] }));
      B.hs.forEach(h => h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.6, 1.4, 0], { dur: w[0], dist0: 10.5, dist1: 9.8, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 51)],
      [w[1], HH(insert([SCR[0] + .6, 2.2, .3], { dur: w[1], dist0: 6.6, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 52)],
      [w[2], HH(insert([MIDX, 1.8, .4], { dur: w[2], dist0: 6.6, dist1: 6.2, h0: 1.6, h1: 1.8, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([-1.0, 1.4, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): the scroll's word-block lands on the path as a stone "מכשול"; the blindfolded ball rolls into it and tumbles; red cross; open book with the gold line
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const book = new THREE.Group(); book.position.set(BOOK[0], BOOK[1], BOOK[2]); book.rotation.x = 1.1; Wd.add(book);
    const pgL = box(1.3, .06, 1.0, PAPER); pgL.position.x = -.62; book.add(pgL);
    const pgR = box(1.3, .06, 1.0, PAPER); pgR.position.x = .62; book.add(pgR);
    const spine = box(.14, .1, 1.0, WOOD); spine.position.y = .02; book.add(spine);
    B.block.visible = true;
    const mk = tag(Wd, 1.3, .5, 'מכשול', ...TAG_BAD);
    const gold = tag(Wd, 4.6, .6, 'לפני עיוור לא תתן מכשול', ...TAG_GOLD);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    const A = [0, 2.4, .4], END = [-1.2, .22, PZ];
    Wd.occ = [B.sc.g, B.bg, book]; Wd.center = [-1.0, 1.0];
    Wd.on(t => {
      const u = sm(P(.8, 2.6, t));
      const bp = arcPt(A, END, u, 1.0);
      B.block.position.set(bp[0], bp[1], bp[2]);
      mk.set([END[0], 1.2 + bob(t, 1), PZ], popE(P(3.0, 3.8, t)));
      const hit = clamp((t - 7.0) / 1.6, 0, 1);
      let bx = lerp(-4.4, -1.7, sm(P(4.4, 7.0, t))), by = .28, rz = 0;
      if (t > 7.0) { bx = -1.7 - .5 * sm(P(7.0, 8.6, t)); by = .28 + .45 * Math.sin(PI * hit); rz = -PI * 2 * hit; }
      B.bg.position.set(bx, by, PZ); B.bg.rotation.z = rz;
      cx.set([END[0], 1.5, PZ + .5], popE(P(7.4, 8.2, t)) * .9, .05 * Math.sin(t * 4) * (t > 8.2 ? 1 : 0));
      sk.set([END[0], 1.5, PZ + .5], P(7.4, 8.2, t), 1.2);
      const open = sm(P(8.6, 9.8, t));
      pgL.rotation.z = .3 * open; pgR.rotation.z = -.3 * open;
      gold.set([BOOK[0], 2.2 + bob(t, 2), BOOK[2] + .5], popE(P(8.8, 9.8, t)));
      B.sc.f.set(t, { smile: -.4, talk: .8 * talkAmt(t, 23) * (1 - sm(P(8.6, 9.4, t))), look: [-1, 0] });
      B.sp.f.set(t, { smile: .1, talk: 0, look: [-1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
      B.hs.forEach(h => h.f.set(t, { smile: -.3, talk: 0, look: [-1, 0] }));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(crane([-1.0, 1.4, PZ], { dur: w[0], dist0: 11, dist1: 10.4, h0: 2.0, h1: 2.8, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 61)],
      [w[1], HH(insert([-1.4, .7, PZ], { dur: w[1], dist0: 6.4, dist1: 6.0, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 62)],
      [w[2], HH(insert([BOOK[0], 1.5, BOOK[2]], { dur: w[2], dist0: 6.6, dist1: 6.2, h0: 1.5, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 63)],
      [w[3], HH(crane([-0.4, 1.2, 0], { dur: w[3], dist0: 10.5, dist1: 9.6, h0: 1.4, h1: 2.2, a0: 6, a1: -6, fov0: 44, fov1: 42 }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): the name tag "פלוני סיפר" peels off the bubble; a grey anonymous cloud "כך נשמע" floats to the sponge, which soaks it up; red cross
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const tagOwn = tag(Wd, 2.4, .5, 'פלוני סיפר', ...TAG_NEU);
    const cloud = new THREE.Group(); Wd.add(cloud);
    [[-.22, 0, .22], [.2, .06, .24], [0, .2, .2]].forEach(([x, y, r]) => { const c = ball(r, CLOUD); c.position.set(x, y, 0); cloud.add(c); });
    const cloudTag = tag(Wd, 1.9, .5, 'כך נשמע', ...TAG_NEU);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.sc.g, B.sp.g]; Wd.center = [-1.2, 1.2];
    Wd.on(t => {
      const peel = sm(P(1.2, 2.6, t));
      tagOwn.set([SCR[0], 2.6 + .9 * peel, .4], popE(P(0, .6, t)) * (1 - peel));
      const cl = sm(P(2.6, 3.6, t));
      const u = sm(P(4.6, 9.0, t));
      const cp = arcPt([SCR[0], 2.4, .4], [SPO[0] + .1, TOP + .9, .3], u, .35);
      cloud.position.set(cp[0], cp[1], cp[2]); cloud.scale.setScalar(Math.max(.001, cl));
      cloud.visible = t > 2.6 && u < 1;
      cloudTag.set([cp[0], cp[1] + .75, cp[2]], popE(P(3.2, 4.0, t)) * (u < 1 ? 1 : 0));
      B.sp.body.material.color.lerpColors(C_SPY, C_SPD, sm(P(8.6, 9.8, t)));
      cx.set([SPO[0] + .3, 2.5, .9], popE(P(10.2, 11.0, t)) * .9, .05 * Math.sin(t * 4) * (t > 11.0 ? 1 : 0));
      sk.set([SPO[0] + .3, 2.5, .9], P(10.2, 11.0, t), 1.2);
      B.sc.f.set(t, { smile: .2, talk: .7 * talkAmt(t, 29) * (1 - sm(P(6, 7, t))), look: [1, 0] });
      B.sp.f.set(t, { smile: -.5, talk: 0, surprise: .4 * sm(P(10.2, 10.8, t)), look: [1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
      B.hs.forEach(h => h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.2, 1.4, 0], { dur: w[0], dist0: 11.5, dist1: 11, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 71)],
      [w[1], HH(insert([0, 2.6, .4], { dur: w[1], dist0: 6.4, dist1: 6.0, h0: 2.2, h1: 2.3, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 72)],
      [w[2], HH(insert([SPO[0], 1.4, SPO[2]], { dur: w[2], dist0: 6.6, dist1: 6.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 73)],
      [w[3], HH(crane([0, 1.4, 0], { dur: w[3], dist0: 11, dist1: 10.2, h0: 1.0, h1: 2.2, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): the scroll rolled closed with a padlock on the left; the sponge light and dry in the middle; the cups smile on the right; a signpost "ירחק מזה" at the back; the house whole
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.sc.g.position.x = -3.2;
    B.sc.lock.visible = true; B.sc.lock.position.y = .3;
    B.sc.body.scale.y = .78; B.sc.body.position.y = .43;
    B.sp.g.position.x = .4;
    B.sp.body.material.color.copy(C_SPY);
    const post = box(.12, 2.0, .12, WOOD); post.position.set(.2, 1.0, -3.2); Wd.add(post);
    const sign = tag(Wd, 3.0, .75, 'ירחק מזה', ...TAG_GOLD);
    Wd.occ = [B.sc.g, B.sp.g]; Wd.center = [0, 1.2]; Wd.ansD = 6.4;
    Wd.on(t => {
      B.sc.f.set(t, { smile: .6, talk: .3 * talkAmt(t, 37), look: [1, 0] });
      B.sp.f.set(t, { smile: .9, talk: 0, look: [-1, 0] });
      B.L.forEach(f => f.f.set(t, { smile: .9, talk: 0, look: [0, 0] }));
      sign.set([.2, 2.2 + bob(t, 1), -3.1], popE(P(.4, 1.4, t)));
    });
    Wd.camAns = cuts([[dur, HH(crane([0.6, 1.2, 0], { dur, dist0: 12, dist1: 11.2, h0: 1.0, h1: 2.4, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
