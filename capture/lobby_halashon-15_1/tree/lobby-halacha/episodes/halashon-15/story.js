// halashon-15 story: "Forbidden even to one other person - 'your friend has a friend'" (storyboards_v16.md, section B).
// Talking objects only, NO people. Adapted from halashon-14 (COPY FROM).
// Heroes: THE SCROLL (the story, face), LISTENER 1 (hero cup with a lock ring), a CHAIN OF SIX FRIEND cups (tag "חבר"),
// a FAR HOUSE "מי שדיברו עליו", two PADLOCK BUBBLES with different words, a small balance scale,
// one unrelated cup "אחר" on the floor. Moving diagram: dotted arcs, a word-bubble hopping along the chain, numbered counter, red crosses.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, arcPt, FONT, fitText } = K;
  // whole-frame lift: every camera aims lower so the subject sits above the caption band
  const LIFT = .9;
  const lift = p => [p[0], p[1] - LIFT, p[2]];
  const pushIn = (p, o) => K.pushIn(lift(p), o), pullOut = (p, o) => K.pullOut(lift(p), o), truck = (p, o) => K.truck(lift(p), o);
  const crane = (p, o) => K.crane(lift(p), o), insert = (p, o) => K.insert(lift(p), o);
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .05;
  const pulse = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);
  const GOLD = 0xf2c14e, GREEN = 0x2fbf5b, RED = 0xe03131, PAPER = 0xf4e4b8, LIT = 0xffd166, GREY = 0x6b6f76;
  const C_RED = new THREE.Color(RED), C_GREY = new THREE.Color(GREY), C_GREEN = new THREE.Color(GREEN);
  const TOP = .99;                    // table top surface (table = box at y .9, thickness .18)
  const LX1 = -6.9;                   // listener 1 (hero)
  const SX = -4.3;                    // the scroll (the story)
  const SCX = -1.2;                   // the small balance scale
  const FX = [1.0, 2.2, 3.4, 4.6, 5.8, 7.0];   // the chain of six friends on the table
  const HOUSE = [9.6, -1.6];          // the far house (on the floor, behind the table end)
  const UN = [-10.6, 1.8];            // the unrelated cup on the floor, far to the side
  const LCOL = 0xf2b8a2, FCOL = 0xcfe6ff, UCOL = 0xf7c59f;
  const TAG_BAD = ['#ffe3e3', '#8a1010', '#c43030'];

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

  // ---------------------------------------------------------------- listener cup (face on the +z side) with a small LOCK badge on top
  function cup(Wd, x, seed, col, z = 0) {
    const g = new THREE.Group(); g.position.set(x, TOP, z); Wd.add(g);
    const sau = cyl(.62, .62, .07, 0xf4f1ea); sau.position.y = .035; g.add(sau);
    const body = cyl(.42, .34, .8, col); body.position.y = .47; g.add(body);
    const rim = cyl(.44, .42, .06, 0xfff7e8); rim.position.y = .87; g.add(rim);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .5, .41], seed });
    const lock = new THREE.Group(); lock.position.set(0, 1.08, .3); g.add(lock);
    const lb = box(.3, .22, .12, GOLD); lock.add(lb);
    const ls = cyl(.07, .07, .14, GOLD); ls.position.y = .17; lock.add(ls);
    return { g, body, f, lock };
  }

  // ---------------------------------------------------------------- a friend: a simple cup with a face (no lock)
  function friend(Wd, x, z, y, seed, col) {
    const g = new THREE.Group(); g.position.set(x, y, z); Wd.add(g);
    const sau = cyl(.5, .5, .06, 0xf4f1ea); sau.position.y = .03; g.add(sau);
    const body = cyl(.36, .3, .8, col); body.position.y = .46; g.add(body);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .5, .38], seed });
    return { g, body, f, col };
  }

  // ---------------------------------------------------------------- the padlock RING: a gold band around a cup's neck (horizontal torus)
  function ring(Wd, x, z) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(.5, .035, 8, 28), new THREE.MeshBasicMaterial({ color: GOLD }));
    r.rotation.x = PI / 2; r.position.set(x, TOP + .92, z); Wd.add(r); return r;
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

  // ---------------------------------------------------------------- house of Shimon (face on the front = +z)
  function house(Wd, x, seed, col, roof, z = 0) {
    const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g);
    const body = box(1.2, .9, .8, col); body.position.y = .45; g.add(body);
    const rf = cyl(0, .8, .6, roof); rf.position.y = 1.2; g.add(rf);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .55, .41], seed });
    const wins = [-.42, .42].map(x => { const wn = box(.2, .22, .05, 0x59606b); wn.position.set(x, .55, .42); g.add(wn); return wn; });
    return { g, body, f, col, wins };
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

  // ================================================================ HOOK (14 s): extreme close-up on listener 1 holding a tiny word-bubble behind its lock; pulls out; one single friend waits with a dotted arrow "רק לו?"; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); base(Wd);
    const l1 = cup(Wd, LX1, 1, LCOL);
    const fr = FX.map((x, i) => friend(Wd, x, 0, TOP, 20 + i, FCOL));
    const hs = [house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1])];
    const ar = arc(Wd, [LX1, TOP + 1.1, 0], [FX[0], TOP + 1.1, 0], .9, 6);
    const tiny = tag(Wd, .9, .4, 'לאחד', '#fff6d6', '#5a3a10', '#c9a050');
    const rq = tag(Wd, 1.8, .5, 'רק לו?', '#ffffff', '#222222', '#8a8a8a');
    const qq = tag(Wd, .8, .8, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    Wd.qPos = [FX[0], 0];
    Wd.occ = [l1.g, fr[0].g]; Wd.center = [-3.2, 1.2];
    Wd.on(t => {
      l1.f.set(t, { smile: .1, talk: .4 * talkAmt(t, 2), look: [1, 0] });
      l1.g.rotation.z = .03 * Math.sin(t * 2);
      fr.forEach((f, i) => f.f.set(t, { smile: -.1, talk: 0, look: [-1, 0] }));
      hs.forEach(h => { h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      ar(1);
      tiny.set([LX1 + .5, 1.9 + bob(t, 4), -.4], popE(P(.4, 1.2, t)));
      rq.set([(LX1 + FX[0]) / 2, 2.6 + bob(t, 3), .4], popE(P(1.0, 1.8, t)));
      qq.set([FX[0], 2.5 + bob(t, 3), .4], popE(P(1.4, 2.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut([LX1, 1.35, 0], { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-3.2, 1.2, 0], { dur: w[1], dist0: 12, dist1: 11.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([(LX1 + FX[0]) / 2, 1.6, 0], { dur: w[2], dist0: 7.0, dist1: 6.6, h0: 1.5, h1: 1.7, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.2, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .6, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, neutral): the scroll speaks; a padlock bubble pops over the listener; then a second, differently worded bubble pops beside it and an "=" pulses between them
  function beat1(dur) {
    const Wd = mkWorld({}); base(Wd);
    const l1 = cup(Wd, LX1, 1, LCOL);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const fr = FX.map((x, i) => friend(Wd, x, 0, TOP, 20 + i, FCOL));
    const hs = [house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1])];
    const bA = tag(Wd, 2.8, .6, 'אל תדברו מזה כלל', ...TAG_BAD);
    const bB = tag(Wd, 2.8, .6, 'שלא ייוודע דבר', ...TAG_BAD);
    const eq = tag(Wd, .6, .6, '=', '#fff6d6', '#5a3a10', '#c9a050');
    Wd.occ = [sc.g, l1.g, fr[0].g]; Wd.center = [-4.2, 1.2];
    Wd.on(t => {
      sc.f.set(t, { smile: .3, talk: .8 * talkAmt(t, 7), look: [1, 0] });
      l1.f.set(t, { smile: -.2, talk: .4 * talkAmt(t, 3) * sm(P(.4, 1.4, t)), look: [1, 0] });
      fr.forEach(f => f.f.set(t, { smile: 0, talk: 0, look: [1, 0] }));
      hs.forEach(h => { h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      bA.set([-6.4, 3.3 + bob(t, 1), .4], popE(P(.6, 1.6, t)));
      bB.set([-2.2, 3.3 + bob(t, 2), .4], popE(P(4.0, 5.2, t)));
      eq.set([-4.3, 3.3 + bob(t, 3), .4], popE(P(6.0, 7.0, t)) * (1 + .12 * Math.sin(t * 6)));
    });
    const w = [3.5, 3.9, 3.5, 3.1];
    Wd.cam = cuts([
      [w[0], HH(truck([-4.2, 1.2, 0], { dur: w[0], dist0: 14, dist1: 13.5, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 1)],
      [w[1], HH(punch(insert([-4.3, 2.9, 0], { dur: w[1], dist0: 7.6, dist1: 7.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [1.0, 2.2]), 2)],
      [w[2], HH(pushIn([SX, 1.4, 0], { dur: w[2], dist0: 6.5, dist1: 5.8, h0: 1.0, h1: 1.2, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 3)],
      [w[3], HH(crane([-3.0, 1.2, 0], { dur: w[3], dist0: 10, dist1: 9, h0: .8, h1: 2.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 4)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, bad): insert on the two bubbles ("אל תדברו מזה כלל" / "שלא ייוודע דבר"); each drops a lock ring on listener 1; the balance scale tilts and settles level; a small mouth-bubble opens and gets a red cross
  function beat2(dur) {
    const Wd = mkWorld({}); base(Wd);
    const l1 = cup(Wd, LX1, 1, LCOL);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const fr = FX.map((x, i) => friend(Wd, x, 0, TOP, 20 + i, FCOL));
    const hs = [house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1])];
    const bA = tag(Wd, 2.8, .6, 'אל תדברו מזה כלל', ...TAG_BAD);
    const bB = tag(Wd, 2.8, .6, 'שלא ייוודע דבר', ...TAG_BAD);
    const ringA = ring(Wd, LX1, 0), ringB = ring(Wd, LX1, 0);
    const sk_ = scale(Wd);
    const mouth = tag(Wd, 1.9, .5, 'רק בשקט', '#ffffff', '#222222', '#8a8a8a');
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [l1.g, sk_.g, bA.g, bB.g]; Wd.center = [-3.6, 1.4];
    Wd.on(t => {
      bA.set([-6.4, 3.3 + bob(t, 1), .4], popE(P(.0, .8, t)));
      bB.set([-2.2, 3.3 + bob(t, 2), .4], popE(P(.0, .8, t)));
      ringA.visible = t > 1.0; ringA.position.set(LX1, lerp(3.2, TOP + .92, sm(P(1.2, 2.6, t))), 0);
      ringB.visible = t > 2.6; ringB.position.set(LX1, lerp(3.2, TOP + 1.18, sm(P(2.8, 4.2, t))), 0);
      sk_.beam.rotation.z = lerp(.22, 0, sm(P(4.4, 6.4, t)));
      const mouthOn = popE(P(7.5, 8.5, t));
      mouth.set([LX1 + .8, 2.5 + bob(t, 5), .5], mouthOn);
      cx.set([LX1 + .8, 2.4, .7], popE(P(9.0, 10.0, t)) * .9, .05 * Math.sin(t * 4) * (t > 10 ? 1 : 0));
      sk.set([LX1 + .8, 2.4, .7], P(9.0, 10.0, t), 1.2);
      l1.f.set(t, { smile: -.4, talk: .9 * talkAmt(t, 9) * sm(P(7.5, 8.0, t)) * (1 - sm(P(10.5, 11.5, t))), surprise: sm(P(9.0, 9.6, t)), look: [1, 0] });
      l1.g.rotation.z = 0;
      sc.f.set(t, { smile: .1, talk: 0, look: [1, 0] });
      fr.forEach(f => f.f.set(t, { smile: .1, talk: 0, look: [-1, 0] }));
      hs.forEach(h => { h.f.set(t, { smile: -.4, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
    });
    const w = [3.5, 3.8, 3.7, 3.0];
    Wd.cam = cuts([
      [w[0], HH(truck([-3.6, 1.4, 0], { dur: w[0], dist0: 14, dist1: 13.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [w[1], HH(punch(insert([-4.3, 2.9, 0], { dur: w[1], dist0: 7.6, dist1: 7.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [1.2]), 22)],
      [w[2], HH(pushIn([LX1, 1.6, 0], { dur: w[2], dist0: 5.0, dist1: 4.4, h0: 1.3, h1: 1.6, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 23)],
      [w[3], HH(crane([SCX, 1.4, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): listener 1 leans toward ONE unrelated cup far to the side ("אחר"); a dotted arrow starts to grow toward it and is stamped by a red cross; tag "אסור"
  function beat3(dur) {
    const Wd = mkWorld({}); base(Wd);
    const l1 = cup(Wd, LX1, 1, LCOL);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const fr = FX.map((x, i) => friend(Wd, x, 0, TOP, 20 + i, FCOL));
    const un = friend(Wd, UN[0], UN[1], 0, 30, UCOL);
    const hs = [house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1])];
    const toUn = arc(Wd, [LX1 - .4, TOP + 1.1, 0], [UN[0] + .4, 1.2, UN[1]], 1.4, 7);
    const unTag = tag(Wd, 1.2, .5, 'אחר', '#fff6d6', '#5a3a10', '#c9a050');
    const bad = tag(Wd, 1.8, .5, 'אסור', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.3), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [l1.g, un.g, sc.g, unTag.g]; Wd.center = [-7.2, 1.2];
    Wd.on(t => {
      const lean = sm(P(.6, 2.4, t));
      l1.g.position.x = LX1 - .5 * lean;
      l1.g.rotation.z = .15 * lean;
      l1.f.set(t, { smile: -.6, talk: .4 * talkAmt(t, 12) * lean, look: [-1, 0] });
      const grow = sm(P(2.0, 5.0, t));
      toUn(grow, RED);
      cx.set([UN[0] + 1.0, 1.6, 1.0], popE(P(5.2, 6.0, t)) * .9, .05 * Math.sin(t * 4) * (t > 6 ? 1 : 0));
      sk.set([UN[0] + 1.0, 1.6, 1.0], P(5.2, 6.0, t), 1.2);
      unTag.set([UN[0], 2.0 + bob(t, 4), UN[1]], popE(P(.4, 1.2, t)));
      bad.set([UN[0] + .4, 2.5 + bob(t, 2), 1.9], popE(P(6.0, 6.8, t)));
      un.f.set(t, { smile: -.4, talk: 0, surprise: sm(P(5.2, 5.8, t)), look: [1, 0] });
      sc.f.set(t, { smile: -.4, talk: .4 * talkAmt(t, 8), look: [-1, 0] });
      fr.forEach(f => f.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
      hs.forEach(h => { h.f.set(t, { smile: -.4, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
    });
    const w = [3.5, 3.8, 3.7, 3.0];
    Wd.cam = cuts([
      [w[0], HH(truck([-7.0, 1.4, 0], { dur: w[0], dist0: 16, dist1: 15.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 31)],
      [w[1], HH(punch(insert([-8.6, 1.7, .6], { dur: w[1], dist0: 6.8, dist1: 6.4, h0: 1.4, h1: 1.6, a0: -8, a1: 8, fov0: 40, fov1: 38 }), [1.7]), 32)],
      [w[2], HH(crane([UN[0] + .5, 1.4, 1.0], { dur: w[2], dist0: 9.5, dist1: 8.4, h0: .9, h1: 2.0, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 33)],
      [w[3], HH(pushIn([LX1, 1.4, 0], { dur: w[3], dist0: 7.0, dist1: 6.2, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, bad): the camera trucks to the far house "מי שדיברו עליו"; a second arrow tries to go straight to it; a bigger red cross (shock) and tag "כל שכן"
  function beat4(dur) {
    const Wd = mkWorld({}); base(Wd);
    const l1 = cup(Wd, LX1, 1, LCOL);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const fr = FX.map((x, i) => friend(Wd, x, 0, TOP, 20 + i, FCOL));
    const hs = [house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1])];
    const toHouse = arc(Wd, [LX1, TOP + 1.1, 0], [HOUSE[0], 2.0, HOUSE[1]], 2.8, 9);
    const kol = tag(Wd, 2.0, .55, 'כל שכן', ...TAG_BAD);
    const hname = tag(Wd, 2.6, .5, 'מי שדיברו עליו', '#e8f0ff', '#1f3f7a', '#4f78b8');
    const cx = mark3d(Wd, 'cross', 1.3), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [hs[0].g, l1.g, hname.g]; Wd.center = [3.0, 1.4];
    Wd.on(t => {
      sc.f.set(t, { smile: -.4, talk: .3 * talkAmt(t, 9), look: [1, 0] });
      l1.f.set(t, { smile: -.4, talk: .5 * talkAmt(t, 2), look: [1, 0] });
      fr.forEach(f => f.f.set(t, { smile: -.2, talk: 0, look: [1, 0] }));
      toHouse(sm(P(2.0, 6.0, t)), RED);
      lightHouse(hs[0], sm(P(5.4, 6.2, t)));
      hs[0].f.set(t, { smile: -.6, talk: .4 * talkAmt(t, 15) * sm(P(5.0, 5.6, t)), surprise: sm(P(6.4, 7.0, t)), look: [-1, 0] });
      hname.set([HOUSE[0], 2.2 + bob(t, 1), HOUSE[1] + .4], popE(P(.6, 1.4, t)));
      kol.set([HOUSE[0] - 1.9, 2.7 + bob(t, 3), HOUSE[1] + .4], popE(P(7.4, 8.4, t)));
      cx.set([HOUSE[0] - 1.5, 2.4, HOUSE[1] + .9], popE(P(6.4, 7.4, t)) * .9, .05 * Math.sin(t * 4) * (t > 7.6 ? 1 : 0));
      sk.set([HOUSE[0] - 1.5, 2.4, HOUSE[1] + .9], P(6.4, 7.4, t), 1.6);
    });
    const w = [4.0, 3.6, 3.4, 3.0];
    Wd.cam = cuts([
      [w[0], HH(truck([3.0, 1.4, 0], { dur: w[0], dist0: 16, dist1: 15, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 46, fov1: 44, shift: [.6, 0, 0] }), 51)],
      [w[1], HH(punch(insert([HOUSE[0], 1.6, HOUSE[1]], { dur: w[1], dist0: 7.5, dist1: 7.0, h0: 1.6, h1: 1.8, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.6]), 52)],
      [w[2], HH(crane([2.0, 1.8, 0], { dur: w[2], dist0: 11, dist1: 12, h0: 1.0, h1: 2.6, a0: -6, a1: 6, fov0: 42, fov1: 42 }), 53)],
      [w[3], HH(truck([-2.0, 1.3, 0], { dur: w[3], dist0: 13, dist1: 12.6, h0: 1.6, h1: 1.8, a0: 6, a1: -6, fov0: 44, fov1: 44 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): a word-bubble hops from listener 1 to friend 1, to friend 2, ... to friend 6, then to the far house; each friend lights red as it is reached, a numbered counter grows 1..6, and the house lights red
  function beat5(dur) {
    const Wd = mkWorld({}); base(Wd);
    const l1 = cup(Wd, LX1, 1, LCOL);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const fr = FX.map((x, i) => friend(Wd, x, 0, TOP, 20 + i, FCOL));
    const hs = [house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1])];
    const word = tag(Wd, .9, .45, 'סוד', '#ffffff', '#222222', '#8a8a8a');
    const nums = FX.map((x, i) => tag(Wd, .5, .5, String(i + 1), '#fff6d6', '#5a3a10', '#c9a050'));
    const stops = [[LX1, TOP + 1.5, .3], ...FX.map(x => [x, TOP + 1.6, .3]), [HOUSE[0], 2.4, HOUSE[1]]];
    const HOP = .9, GAP = 1.4, T0 = 1.0;
    const hopStart = k => T0 + GAP * k;
    const arrive = j => hopStart(j - 1) + HOP;       // arrival at stop j (j = 1..7)
    const cross = mark3d(Wd, 'cross', 2.2), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [l1.g, fr[2].g, fr[3].g, hs[0].g]; Wd.center = [3.0, 1.4];
    Wd.on(t => {
      // bubble position along the hop chain
      let pos = stops[0], vis = t >= T0 - .2 && t <= arrive(7) + .2;
      for (let k = 0; k < 7; k++) {
        const u = clamp((t - hopStart(k)) / HOP, 0, 1);
        if (t >= hopStart(k)) {
          const a = stops[k], b = stops[k + 1];
          pos = u >= 1 ? b : arcPt(a, b, u, 1.2);
        }
      }
      word.set([pos[0], pos[1] + .35 + bob(t, 2), pos[2] + .2], vis ? popE(P(.2, .8, t)) : 0);
      fr.forEach((f, i) => {
        const lit = sm(P(arrive(i + 1), arrive(i + 1) + .5, t));
        f.body.material.color.lerpColors(new THREE.Color(FCOL), C_RED, lit);
        f.f.set(t, { smile: lit > .5 ? -.8 : .1, talk: 0, surprise: lit, look: [1, 0] });
        f.g.scale.setScalar(1 + .06 * pulse(t, arrive(i + 1), .4));
        nums[i].set([FX[i], 2.5 + bob(t, i), .4], popE(P(arrive(i + 1), arrive(i + 1) + .6, t)));
      });
      redHouse(hs[0], sm(P(arrive(7), arrive(7) + .5, t)));
      hs[0].f.set(t, { smile: -.6, talk: 0, surprise: sm(P(arrive(7), arrive(7) + .5, t)), look: [-1, 0] });
      l1.f.set(t, { smile: -.2, talk: .4 * talkAmt(t, 5), look: [1, 0] });
      sc.f.set(t, { smile: -.4, talk: 0, look: [1, 0] });
      cross.set([HOUSE[0] - .6, 2.9, HOUSE[1] + .6], popE(P(arrive(7), arrive(7) + .6, t)) * .8, 0);
      sk.set([HOUSE[0] - .6, 2.9, HOUSE[1] + .6], P(arrive(7), arrive(7) + .6, t), 1.2);
    });
    const w = [4.0, 3.9, 3.6, 2.5];
    Wd.cam = cuts([
      [w[0], HH(truck([3.0, 1.2, 0], { dur: w[0], dist0: 17, dist1: 16.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 61)],
      [w[1], HH(punch(insert([4.6, 1.5, 0], { dur: w[1], dist0: 9.6, dist1: 9.2, h0: 1.5, h1: 1.7, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [3.0, 6.0]), 62)],
      [w[2], HH(punch(insert([HOUSE[0], 1.4, HOUSE[1]], { dur: w[2], dist0: 7.5, dist1: 7.0, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [1.0]), 63)],
      [w[3], HH(crane([2.0, 1.4, 0], { dur: w[3], dist0: 12, dist1: 10.5, h0: 1.0, h1: 2.4, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, good): the chain seen from above; a dotted arrow links each friend to the next; a ribbon "חברך - חבר יש לו" unrolls over the chain; the links pulse one by one
  function beat6(dur) {
    const Wd = mkWorld({}); base(Wd);
    const l1 = cup(Wd, LX1, 1, LCOL);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const fr = FX.map((x, i) => friend(Wd, x, 0, TOP, 20 + i, FCOL));
    const hs = [house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1])];
    const links = FX.slice(0, -1).map((x, j) => arc(Wd, [x + .4, TOP + 1.1, 0], [FX[j + 1] - .4, TOP + 1.1, 0], .4, 4));
    const ribbon = tag(Wd, 7.2, .95, 'חברך - חבר יש לו', '#e8fff0', '#1f6a2a', '#3f9a4a');
    Wd.occ = [fr[0].g, fr[3].g, fr[5].g]; Wd.center = [4.0, 1.0];
    Wd.on(t => {
      links.forEach((a, j) => a(sm(P(1.0 + .6 * j, 2.0 + .6 * j, t)), GREEN));
      fr.forEach((f, i) => {
        const on = sm(P(3.0 + .3 * i, 4.0 + .3 * i, t));
        f.body.material.color.lerpColors(new THREE.Color(FCOL), C_GREEN, on);
        f.f.set(t, { smile: .8 * on + .1, talk: 0, look: [0, 0] });
        f.g.scale.setScalar(1 + .12 * pulse(t, 5.0 + .45 * i, .3));
      });
      l1.f.set(t, { smile: .5, talk: .3 * talkAmt(t, 6), look: [1, 0] });
      sc.f.set(t, { smile: .3, talk: 0, look: [0, 0] });
      hs.forEach(h => { h.f.set(t, { smile: -.4, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      ribbon.set([3.6, 2.05 + .4 * bob(t, 1), .3], .72 * popE(P(2.5, 4.5, t)));
    });
    const w = [4.5, 4.0, 3.5, 2.0];
    Wd.cam = cuts([
      [w[0], HH(crane([4.0, 1.0, 0], { dur: w[0], dist0: 9.5, dist1: 11, h0: 3.5, h1: 6.0, a0: 8, a1: -6, fov0: 44, fov1: 42 }), 71)],
      [w[1], HH(punch(insert([3.0, 1.6, 0], { dur: w[1], dist0: 8.2, dist1: 7.8, h0: 1.7, h1: 1.9, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.2]), 72)],
      [w[2], HH(truck([5.5, 1.3, 0], { dur: w[2], dist0: 11, dist1: 10.5, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 42, fov1: 42 }), 73)],
      [w[3], HH(pushIn([4.0, 2.0, 0], { dur: w[3], dist0: 8, dist1: 6.5, h0: 2.2, h1: 2.0, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): the closed scroll with its lock on the left, listener 1 smiling with a shield and a closed padlock on the right; the chain stays dark (nothing passed)
  function answer(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [-8.2, TOP, 0]);
    sc.lock.visible = true; sc.lock.position.y = .3;
    sc.body.scale.y = .78; sc.body.position.y = .43;
    const l1 = cup(Wd, -4.6, 1, LCOL);
    const r1 = ring(Wd, -4.6, 0);
    const fr = FX.map((x, i) => { const f = friend(Wd, x, 0, TOP, 20 + i, GREY); f.body.material.color.set(C_GREY); return f; });
    const shieldTag = tag(Wd, 1.6, .5, 'שומר', '#e8fff0', '#1f6a2a', '#3f9a4a');
    const bt = tag(Wd, 2.8, .55, 'שומר לשון', '#fff6d6', '#5a3a10', '#c9a050');
    const ck = mark3d(Wd, 'check', 1.1);
    Wd.occ = [sc.g, l1.g]; Wd.center = [-3.0, 1.0]; Wd.ansD = 6.4;
    Wd.on(t => {
      sc.f.set(t, { smile: .6, talk: .3 * talkAmt(t, 37), look: [1, 0] });
      l1.f.set(t, { smile: 1, talk: .4 * talkAmt(t, 30), look: [-1, 0] });
      r1.visible = true; r1.position.set(-4.6, TOP + .92, 0);
      r1.material.color.set(GREEN);
      r1.scale.setScalar(1 + .04 * Math.sin(t * 3));
      fr.forEach(f => f.f.set(t, { smile: -.5, talk: 0, look: [1, 0] }));
      shieldTag.set([-4.6, 2.6 + bob(t, 2), .4], popE(P(.8, 2.0, t)));
      bt.set([-6.4, 3.6 + bob(t, 1), 1.0], popE(P(.4, 1.2, t)));
      ck.set([-2.2, 2.7, .5], popE(P(.5, 1.5, t)) * .45, 0);
    });
    Wd.camAns = cuts([[dur, HH(crane([1.0, 1.2, 0], { dur, dist0: 14, dist1: 12.4, h0: 1.0, h1: 2.4, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
