// halashon-11 story: "Even 'it was heard that...' without saying from whom - still lashon hara" (storyboards_v12.md, section B).
// Talking objects only, NO people. Heroes: THE WORD (speech bubble, carries the gossip), THE GIFT "שמעתי ש..." (box that hides the word),
// THE HOUSE OF PLONI (its meter = good name), a gold badge on the answer. Moving diagram: grey stain path, meter, strike, zipper.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, arcPt, FONT, fitText } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const split = (dur, ws) => { const tot = ws.reduce((a, b) => a + b, 0); return ws.map(w => dur * w / tot); };
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .06;
  const GOLD = 0xf2c14e, GREEN = 0x2fbf5b, RED = 0xe03131, DARK = 0x4a4f57;
  const C_GOOD = new THREE.Color(GREEN), C_BAD = new THREE.Color(RED);
  const C_GOLD = new THREE.Color(GOLD), C_GLOW = new THREE.Color(0xfff3a0);
  const BUB = [-3.7, 1.6, .4];       // the word, home (left)
  const BOX = [-1.5, .55, 0];        // the gift "שמעתי ש..." on the floor
  const PX = 3.4;                    // the house of ploni (right)
  const TOP = [BOX[0], 1.5, .2];     // just above the gift lid
  const HFRONT = [PX - .2, .9, .5];  // front of the house
  const TAG_GOLD = ['#fff6d6', '#8a5a00', '#d9a63a'];

  // ---------------------------------------------------------------- tags (billboards with a visible opacity)
  function tag(Wd, w, h, text, bg, fg, border) {
    const draw = (c, W, H) => {
      c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill();
      c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
      const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
      c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54);
    };
    const m = texPlane(w, h, draw, { cw: 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, a) {
      const al = a === undefined ? 1 : a; g.visible = s > .01 && al > .01; if (!g.visible) return;
      g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); m.material.opacity = al; } };
  }
  const drawLabel = (c, W, H) => {
    c.fillStyle = '#fffdf2'; c.beginPath(); c.roundRect(W * .03, H * .1, W * .94, H * .8, H * .25); c.fill();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, 'שמעתי ש...', { maxW: W * .86, maxLines: 1, max: H * .6, min: H * .2, lh: 1.1 });
    c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#8a1f6a'; c.fillText(f.lines[0] || '', W / 2, H * .52);
  };

  // ---------------------------------------------------------------- set: floor + back wall (warm)
  function base(Wd) {
    const fl = box(16, .2, 9, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(16, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    Wd.center = [0, 0];
  }

  // ---------------------------------------------------------------- house (face on the front = +z)
  function house(Wd, x, seed, col, roof) {
    const g = new THREE.Group(); g.position.set(x, 0, 0); Wd.add(g);
    const body = box(1.2, .9, .8, col); body.position.y = .45; g.add(body);
    const rf = cyl(0, .8, .6, roof); rf.position.y = 1.2; g.add(rf);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .55, .41], seed });
    return { g, body, f };
  }

  // ---------------------------------------------------------------- THE WORD: speech bubble with a face and a tail
  function bubble(Wd, pos, col) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const body = box(1.3, .9, .14, col); g.add(body);
    const tail = cyl(0, .18, .32, col); tail.position.set(-.35, -.6, 0); tail.rotation.z = PI; g.add(tail);
    const f = face(Wd, { w: .62, parent: g, pos: [0, .05, .08], seed: 3 });
    return { g, body, f };
  }

  // ---------------------------------------------------------------- THE GIFT "שמעתי ש...": box with a lid (hinged at the back), ribbon, bow, face and label
  function gift(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const body = box(1.1, 1.1, 1.1, 0xff7ab6); g.add(body);
    const lid = new THREE.Group(); lid.position.set(0, .55, -.55); g.add(lid);
    const lb = box(1.12, .14, 1.12, 0xff8fc4); lb.position.set(0, .07, .55); lid.add(lb);
    const rib = box(.2, .04, 1.12, 0xffd34d); rib.position.set(0, .16, .55); lid.add(rib);
    const bow = new THREE.Group(); bow.position.set(0, .24, .55); lid.add(bow);
    for (const sx of [-1, 1]) { const lp = ball(.14, 0xe0405a); lp.scale.set(1.3, .7, .45); lp.position.set(sx * .17, .04, 0); lp.rotation.z = sx * .5; bow.add(lp); }
    const knot = ball(.07, 0xc02840); knot.position.set(0, .03, 0); bow.add(knot);
    const f = face(Wd, { w: .6, parent: g, pos: [0, .12, .57], seed: 6 });
    const lbl = texPlane(.9, .26, drawLabel, { cw: 512, ro: 9 }); lbl.position.set(0, -.3, .58); g.add(lbl);
    return { g, body, lid, f };
  }

  // ---------------------------------------------------------------- meter (good name): grey tube, green fill that rises or drops (fill grows from the bottom)
  function meter(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const back = box(.38, 1.3, .14, 0xdde3ea); g.add(back);
    const fill = box(.28, 1.2, .2, GREEN); fill.position.z = .05; g.add(fill);
    return { g, set(v) { const h = clamp(v, .04, 1); fill.scale.y = h; fill.position.y = -.6 + .6 * h; fill.material.color.lerpColors(C_BAD, C_GOOD, h); } };
  }

  // ---------------------------------------------------------------- the grey stain (gossip) and its dotted path
  function smudges(Wd, n) { const a = []; for (let i = 0; i < n; i++) { const d = ball(.17, DARK); d.visible = false; Wd.add(d); a.push(d); } return a; }
  const putStain = (d, p, sc, i, t) => {
    d.visible = sc > .01; if (!d.visible) return;
    d.position.set(p[0] + .06 * Math.sin(i * 2.1 + t * 7), p[1] + .06 * Math.cos(i * 1.3 + t * 6), p[2]);
    d.scale.setScalar(sc);
  };
  function dots(Wd, a, b, h, n) {
    const d = [];
    for (let k = 1; k <= n; k++) { const p = arcPt(a, b, k / (n + 1), h); const m = ball(.06, 0x6b7078); m.position.set(p[0], p[1], p[2]); m.visible = false; Wd.add(m); d.push(m); }
    return a2 => d.forEach(m => { m.visible = a2 > .01; m.scale.setScalar(Math.max(a2, .001)); });
  }

  // ---------------------------------------------------------------- THE GOOD NAME: gold badge with a face and two ear tabs (answer)
  // ================================================================ HOOK (14 s): extreme close-up of the gift with its label, pulls out to a street with houses; "?" floats over it
  function hook(dur) {
    const Wd = mkWorld({}); base(Wd);
    const gf = gift(Wd, BOX);
    const h1 = house(Wd, 1.0, 3, 0xf2b8a2, 0xb5472f);
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    Wd.qPos = [BOX[0], BOX[2]];
    Wd.occ = [gf.g, h1.g, ph.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      gf.g.rotation.z = .04 * Math.sin(t * 2);
      gf.f.set(t, { smile: .3, talk: .9 * talkAmt(t, 2), look: [0, 0] });
      h1.f.set(t, { smile: .4, talk: 0, look: [-1, 0] });
      ph.f.set(t, { smile: .3, talk: 0, look: [-1, 0] });
    });
    const w = split(dur, [5, 4.5, 4.5]);
    Wd.cam = cuts([
      [w[0], HH(pullOut([BOX[0], .9, 0], { dur: w[0], dist0: 1.5, dist1: 5.0, h0: .4, h1: 1.2, a0: 6, a1: -6, fov0: 36, fov1: 42 }), 51)],
      [w[1], HH(truck([0, 1.3, 0], { dur: w[1], dist0: 10.5, dist1: 10, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), 52)],
      [w[2], HH(pushIn([BOX[0] + .4, 1.0, 0], { dur: w[2], dist0: 6.0, dist1: 4.6, h0: .7, h1: .6, a0: 6, a1: -8, fov0: 42, fov1: 40 }), 53)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, bad): the word flies to ploni's house carrying a grey stain; the good-name meter drops; "לשון הרע" pops
  function beat1(dur) {
    const Wd = mkWorld({}); base(Wd);
    const bub = bubble(Wd, BUB, 0xffffff);
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, 1.1, .15]);
    const mt = tag(Wd, 1.7, .5, 'שם טוב', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const bad = tag(Wd, 2.4, .6, 'לשון הרע', '#ffe3e3', '#8a1010', '#c43030');
    const st = smudges(Wd, 5);
    Wd.occ = [ph.g, bub.g, m.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      const u = sm(P(1.2, 5.0, t));
      const bx = lerp(BUB[0], PX - 1.9, u), by = BUB[1] + bob(t, 2) * (1 - u);
      bub.g.position.set(bx, by, BUB[2]);
      bub.f.set(t, { talk: .9 * talkAmt(t, 4), smile: .4, look: [1, 0] });
      const v = sm(P(5.0, 8.0, t));
      st.forEach((d, i) => {
        const ang = i * 1.25 + t * 3;
        const p0 = [bx + .45 * Math.cos(ang) * (1 - v), by + .3 * Math.sin(ang) * (1 - v), BUB[2] + .25];
        const p1 = [PX - .1 + .1 * Math.cos(i), .9 + .25 * Math.sin(i * 1.7), .5];
        const p = [lerp(p0[0], p1[0], v), lerp(p0[1], p1[1], v), lerp(p0[2], p1[2], v)];
        const sc = popE(P(1.0 + i * .15, 2.0 + i * .15, t)) * (1 - sm(P(8.6, 9.6, t)));
        putStain(d, p, sc * .9, i, t);
      });
      m.set(lerp(1, .45, sm(P(8.0, 10.5, t))));
      ph.f.set(t, { smile: .6 - 1.2 * sm(P(8.0, 10.5, t)), talk: 0, look: [-1, 0] });
      mt.set([PX + 1.05, 2.25, .3], popE(P(.4, 1.2, t)));
      bad.set([0, 2.7, .4], popE(P(8.8, 9.8, t)));
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([0, 1.2, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), 1)],
      [w[1], HH(punch(insert([0.2, 1.3, 0], { dur: w[1], dist0: 6.0, dist1: 5.2, h0: .7, h1: .8, a0: -12, a1: 8, fov0: 40, fov1: 38 }), [1.0]), 2)],
      [w[2], HH(crane([PX - .6, 1.3, 0], { dur: w[2], dist0: 7.0, dist1: 6.0, h0: .4, h1: 1.6, a0: 10, a1: -6, fov0: 42, fov1: 40 }), 3)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, bad): the word jumps into the gift and hides; "ממי שמעת?" pops and gets a red strike
  function beat2(dur) {
    const Wd = mkWorld({}); base(Wd);
    const gf = gift(Wd, BOX);
    const bub = bubble(Wd, BUB, 0xffffff);
    const q = tag(Wd, 2.3, .6, 'ממי שמעת?', '#fff6d6', '#8a1010', '#c43030');
    const strike = box(2.2, .1, .14, RED); strike.visible = false; Wd.add(strike);
    Wd.occ = [gf.g, bub.g]; Wd.center = [-1.0, 1.2];
    Wd.on(t => {
      const j = ease.io(P(1.5, 4.0, t));
      const a = arcPt(BUB, [BOX[0], 1.4, .25], j, 1.8);
      bub.g.position.set(a[0], a[1] + (j < 1 ? 0 : bob(t, 2)), a[2]);
      bub.g.scale.setScalar(Math.max(.001, 1 - sm(P(4.0, 5.0, t))));
      bub.g.visible = t < 5.0;
      bub.f.set(t, { talk: .9 * talkAmt(t, 5) * (1 - j), smile: -.6, look: [0, -.5] });
      gf.g.rotation.z = t > 4 && t < 6.5 ? .14 * Math.sin((t - 4) * 16) * Math.exp(-(t - 4) * .6) : 0;
      gf.f.set(t, { smile: -.6, talk: t > 5.5 ? .8 * talkAmt(t, 8) : 0, look: [0, 0] });
      const yq = 2.25 + bob(t, 3);
      q.set([BOX[0], yq, .4], popE(P(5.6, 6.6, t)));
      strike.position.set(BOX[0], yq, .47);
      strike.rotation.z = .2;
      strike.scale.x = Math.max(.001, sm(P(8.0, 8.8, t)));
      strike.visible = t > 8.0;
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([BOX[0] + .4, 1.1, 0], { dur: w[0], dist0: 9, dist1: 8.5, h0: 1.2, h1: 1.5, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.2, 0, 0] }), 22)],
      [w[1], HH(punch(insert([BOX[0], 1.0, 0], { dur: w[1], dist0: 4.2, dist1: 3.6, h0: .6, h1: .8, a0: 8, a1: -8, fov0: 40, fov1: 38 }), [1.6, 4.0]), 23)],
      [w[2], HH(crane([BOX[0], 1.7, 0], { dur: w[2], dist0: 5.0, dist1: 4.6, h0: .4, h1: 1.8, a0: -10, a1: 4, fov0: 40, fov1: 42 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): an open sefer glows on a stand; a big red cross pops over the gift; the gift looks surprised
  function beat3(dur) {
    const Wd = mkWorld({}); base(Wd);
    const gf = gift(Wd, BOX);
    const SEF = [1.8, 0, -.5];
    const top = box(2.2, .1, 1.3, 0x9a6a3a); top.position.set(SEF[0], .8, SEF[2]); Wd.add(top);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dz]) => { const lg = box(.12, .78, .12, 0x7a4a2a); lg.position.set(SEF[0] + dx * .95, .39, SEF[2] + dz * .55); Wd.add(lg); });
    const sef = new THREE.Group(); sef.position.set(SEF[0], .86, SEF[2]); Wd.add(sef);
    const pL = box(.9, .06, 1.0, 0xfffaf0); pL.position.x = -.45; pL.rotation.z = .08; sef.add(pL);
    const pR = box(.9, .06, 1.0, 0xfffaf0); pR.position.x = .45; pR.rotation.z = -.08; sef.add(pR);
    const sp = box(.1, .1, 1.05, 0x6a3a10); sef.add(sp);
    const gl = glowAt(sef, 3.2, 0xffe08a, 0); gl.position.set(0, .4, 0);
    const cx = mark3d(Wd, 'cross', 1.4), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [gf.g, sef, cx.g]; Wd.center = [.2, 1.2];
    Wd.on(t => {
      gl.material.opacity = .25 + .35 * (.5 + .5 * Math.sin(t * 3)) * sm(P(.5, 1.5, t));
      gf.f.set(t, { smile: -.6, surprise: sm(P(5.0, 5.8, t)), talk: 0, look: [1, 0] });
      gf.g.position.x = BOX[0] + .05 * Math.sin(t * 30) * (t > 5 && t < 6.5 ? 1 : 0);
      cx.set([BOX[0], 2.5, .5], popE(P(5.0, 6.0, t)) * .9, .05 * Math.sin(t * 4));
      sk.set([BOX[0], 1.0, .5], P(5.0, 5.8, t), 2.2);
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([0, 1.0, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -10, a1: 10, fov0: 42, fov1: 42 }), 10)],
      [w[1], HH(punch(insert([0.1, 1.3, 0], { dur: w[1], dist0: 6.8, dist1: 6.2, h0: .9, h1: 1.0, a0: -14, a1: 14, fov0: 42, fov1: 42 }), [1.0]), 11)],
      [w[2], HH(pullOut([BOX[0], 1.2, 0], { dur: w[2], dist0: 4.2, dist1: 8.0, h0: .6, h1: 1.2, a0: 8, a1: -8, fov0: 38, fov1: 44 }), 12)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (16 s, bad): the gift opens by itself; the stain travels along the dotted path to ploni's house; the meter drops again
  function beat4(dur) {
    const Wd = mkWorld({}); base(Wd);
    const gf = gift(Wd, BOX);
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, 1.1, .15]);
    const mt = tag(Wd, 1.7, .5, 'שם טוב', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const bad = tag(Wd, 2.4, .6, 'לשון הרע', '#ffe3e3', '#8a1010', '#c43030');
    const st = smudges(Wd, 6);
    const path = dots(Wd, TOP, HFRONT, 1.6, 9);
    Wd.occ = [gf.g, ph.g, m.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      gf.lid.rotation.x = -1.25 * sm(P(1.0, 2.8, t));
      gf.f.set(t, { smile: -.6, talk: t > 1 ? .8 * talkAmt(t, 11) : 0, look: [0, .5] });
      path(sm(P(1.6, 3.0, t)));
      st.forEach((d, i) => {
        const u = clamp((t - 2.4 - i * .35) / 2.8, 0, 1);
        putStain(d, arcPt(TOP, HFRONT, u, 1.6), (u > 0 && u < 1) ? .9 : 0, i, t);
      });
      m.set(lerp(.45, .18, sm(P(7.5, 10.0, t))));
      ph.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] });
      bad.set([0, 2.7, .4], popE(P(10.5, 11.5, t)));
      mt.set([PX + 1.05, 2.25, .3], popE(P(.4, 1.2, t)));
    });
    const w = split(dur, [5, 5, 6]);
    Wd.cam = cuts([
      [w[0], HH(truck([-.5, 1.3, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), 31)],
      [w[1], HH(insert([BOX[0], .45, 0], { dur: w[1], dist0: 3.6, dist1: 3.2, h0: .5, h1: .6, a0: -10, a1: 8, fov0: 40, fov1: 38 }), 32)],
      [w[2], HH(punch(crane([PX - .4, 1.3, 0], { dur: w[2], dist0: 6.0, dist1: 5.2, h0: .4, h1: 1.6, a0: 10, a1: -6, fov0: 42, fov1: 40 }), [.5]), 33)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): the word with a named source ("מפי ראובן") and the gift send the same stain to the house; a "=" sign between them
  function beat5(dur) {
    const Wd = mkWorld({}); base(Wd);
    const bub = bubble(Wd, BUB, 0xffffff);
    const who = tag(Wd, 2.2, .55, 'מפי ראובן', '#fff6d6', '#5a3a10', '#c9a050');
    const gf = gift(Wd, BOX);
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, 1.1, .15]);
    const eq = tag(Wd, .9, .9, '=', '#ffffff', '#222a36', '#9aa0a8');
    const s1 = smudges(Wd, 4), s2 = smudges(Wd, 4);
    const p1s = [BUB[0], BUB[1], BUB[2] + .25];
    Wd.occ = [bub.g, gf.g, ph.g]; Wd.center = [-.6, 1.2];
    Wd.on(t => {
      bub.g.position.y = BUB[1] + bob(t, 2);
      bub.f.set(t, { talk: .8 * talkAmt(t, 9), smile: .3, look: [1, 0] });
      who.set([BUB[0], 2.45 + bob(t, 1), .4], popE(P(.2, 1.0, t)));
      gf.f.set(t, { smile: .2, talk: .6 * talkAmt(t, 12), look: [1, 0] });
      eq.set([-2.6, 1.0, .5], popE(P(1.0, 1.8, t)));
      s1.forEach((d, i) => { const u = clamp((t - 2.4 - i * .35) / 3.0, 0, 1); putStain(d, arcPt(p1s, HFRONT, u, 1.4), (u > 0 && u < 1) ? .9 : 0, i, t); });
      s2.forEach((d, i) => { const u = clamp((t - 2.9 - i * .35) / 3.0, 0, 1); putStain(d, arcPt(TOP, HFRONT, u, 1.4), (u > 0 && u < 1) ? .9 : 0, i + 4, t); });
      m.set(lerp(.18, .06, sm(P(6.5, 9.5, t))));
      ph.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] });
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-.4, 1.3, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), 51)],
      [w[1], HH(insert([-2.6, 1.0, 0], { dur: w[1], dist0: 5.0, dist1: 4.6, h0: .8, h1: .9, a0: -8, a1: 8, fov0: 40, fov1: 40 }), 52)],
      [w[2], HH(crane([PX - .6, 1.3, 0], { dur: w[2], dist0: 7.0, dist1: 6.0, h0: .4, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 53)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, good): a zipper closes across the word's mouth; the stain dissolves; the meter rises; the house smiles; a big green check
  function beat6(dur) {
    const Wd = mkWorld({}); base(Wd);
    const bub = bubble(Wd, BUB, 0xffffff);
    const seam = box(1.1, .07, .1, 0x3a3f47); seam.position.set(0, -.15, .12); bub.g.add(seam);
    const slide = ball(.07, 0x9aa0a8); slide.position.set(0, -.15, .16); bub.g.add(slide);
    const st = smudges(Wd, 5);
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, 1.1, .15]);
    const mt = tag(Wd, 2.2, .55, 'שמירת הלשון', '#e8fff0', '#1f6a2a', '#3f9a4a');
    const ck = mark3d(Wd, 'check', 1.2), sk = shock(Wd, 0xbff5c8);
    Wd.occ = [bub.g, ph.g, ck.g]; Wd.center = [.2, 1.2];
    Wd.on(t => {
      const u = sm(P(.8, 3.2, t));
      seam.scale.x = Math.max(.02, u); slide.position.x = lerp(-.55, .55, u);
      bub.g.position.y = BUB[1] + bob(t, 2);
      bub.f.set(t, { smile: 1, talk: 0, look: [1, 0] });
      st.forEach((d, i) => {
        const p = [HFRONT[0] + .25 * Math.cos(i * 1.3), HFRONT[1] + .2 * Math.sin(i * 1.7), HFRONT[2]];
        putStain(d, p, .9 * (1 - sm(P(1.0 + i * .2, 3.0 + i * .2, t))), i, t);
      });
      m.set(lerp(.06, 1, sm(P(3.0, 8.0, t))));
      ph.f.set(t, { smile: -.2 + 1.2 * sm(P(3.0, 5.0, t)), talk: 0, look: [0, 0] });
      mt.set([PX + 1.05, 2.25, .3], popE(P(.4, 1.2, t)));
      ck.set([PX, 2.7, .5], popE(P(8.5, 9.5, t)) * .9, .04 * Math.sin(t * 3));
      sk.set([PX, 2.7, .5], P(8.5, 10.0, t), 2.0);
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(insert([BUB[0], 1.5, .4], { dur: w[0], dist0: 4.4, dist1: 3.8, h0: .5, h1: .6, a0: -6, a1: 6, fov0: 36, fov1: 36 }), 41)],
      [w[1], HH(punch(truck([1.0, 1.2, 0], { dur: w[1], dist0: 9.5, dist1: 9.0, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 42, fov1: 42, shift: [1.2, 0, 0] }), [4.5]), 42)],
      [w[2], HH(crane([PX, 1.6, 0], { dur: w[2], dist0: 6.0, dist1: 5.0, h0: .5, h1: 1.8, a0: -8, a1: 6, fov0: 42, fov1: 40 }), 43)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): a calm street, ploni's house smiling with its gold badge and full meter, the zipped word at the side, slow crane
  function answer(dur) {
    const Wd = mkWorld({}); base(Wd);
    const bub = bubble(Wd, [-4.6, 1.5, .4], 0xfbfdff);
    const seam = box(1.1, .07, .1, 0x3a3f47); seam.position.set(0, -.15, .12); bub.g.add(seam);
    const side = house(Wd, -.9, 2, 0xbfe3c0, 0x2f7a4a);
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const badge = cyl(.42, .42, .1, GOLD); badge.rotation.x = PI / 2; badge.position.set(PX, 2.35, .3); Wd.add(badge);
    const bt = tag(Wd, 2.0, .55, 'שם טוב', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const m = meter(Wd, [PX + 1.05, 1.1, .15]);
    const ck = mark3d(Wd, 'check', 1.1);
    Wd.occ = [bub.g, ph.g, side.g, badge]; Wd.center = [0, 1.0]; Wd.ansD = 6.4;
    Wd.on(t => {
      bub.g.position.y = 1.5 + bob(t, 2);
      bub.f.set(t, { smile: 1, talk: .4 * talkAmt(t, 3), look: [.4, 0] });
      ph.f.set(t, { smile: 1, talk: .35 * talkAmt(t, 6), look: [0, 0] });
      side.f.set(t, { smile: 1, talk: .3 * talkAmt(t, 5), look: [0, 0] });
      const glow = .5 + .5 * Math.sin(t * 2.5);
      badge.material.color.lerpColors(C_GOLD, C_GLOW, glow);
      m.set(1);
      bt.set([PX, 2.85 + bob(t, 1), .4], 1);
      ck.set([PX + 1.2, 2.5], popE(P(.5, 1.5, t)) * .45, 0);
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.8, 0], { dur, dist0: 10.0, dist1: 8.2, h0: .8, h1: 2.4, a0: 6, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
