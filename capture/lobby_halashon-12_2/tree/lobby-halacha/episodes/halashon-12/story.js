// halashon-12 story: "It was said in front of three - may I retell it?" (storyboards_v13.md, section B).
// Talking objects only, NO people. Heroes: TEAPOT ראובן (pours the gossip), THREE LISTENER CUPS, THE FRIEND CUP (the 4th, heard it from one of them),
// THE FIFTH CUP (far away, next listener), THE GOSSIP NOTE (grey, sticker "נאמר בפני 3"), SHIMON'S HOUSE (shem-tov meter), gold "3" counter.
// Moving diagram: dark pour dots, counter ticks, note hop along dotted arc, gate drop, red cross, mask, zipper, meter, green check.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, arcPt, FONT, fitText } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const split = (dur, ws) => { const tot = ws.reduce((a, b) => a + b, 0); return ws.map(w => dur * w / tot); };
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .05;
  const GOLD = 0xf2c14e, GREEN = 0x2fbf5b, RED = 0xe03131, DARK = 0x4a4f57, TEA = 0x3d2415;
  const C_GOOD = new THREE.Color(GREEN), C_BAD = new THREE.Color(RED);
  const TOP = .99;                    // table top surface (table = box at y .9, thickness .18)
  const LX = [-3.2, -2.0, -0.8];      // the three listeners
  const FX = 1.4;                     // the friend (4th cup)
  const FIVE = 3.2;                   // the fifth cup, far away on the table
  const TX = -5.0;                    // the teapot ראובן
  const PX = 5.6;                     // Shimon's house (floor, right of the table)
  const NOTE0 = [FX, 2.3, 0];         // the note hovering above the friend
  const BIN = [2.7, TOP + .3, .6];    // the bin on the table
  const GATE_X = 2.3;                 // the gate between the friend and the fifth cup
  const TAG_GOLD = ['#fff6d6', '#8a5a00', '#d9a63a'];

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

  // ---------------------------------------------------------------- set: floor, back wall, table with four legs (warm)
  function base(Wd) {
    const fl = box(16, .2, 9, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(16, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    const tb = box(10.8, .18, 3.0, 0xb07a4a); tb.position.set(-1.1, TOP - .09, 0); Wd.add(tb);
    for (const lx of [-6.2, 4.0]) for (const lz of [-1.3, 1.3]) {
      const l = box(.2, TOP - .18, .2, 0x8a5a33); l.position.set(lx, (TOP - .18) / 2, lz); Wd.add(l);
    }
    Wd.center = [0, 0];
  }

  // ---------------------------------------------------------------- listener / friend / fifth cup (face on the +z side)
  function cup(Wd, x, seed, col) {
    const g = new THREE.Group(); g.position.set(x, TOP, 0); Wd.add(g);
    const sau = cyl(.62, .62, .07, 0xf4f1ea); sau.position.y = .035; g.add(sau);
    const body = cyl(.42, .34, .8, col); body.position.y = .47; g.add(body);
    const rim = cyl(.44, .42, .06, 0xfff7e8); rim.position.y = .87; g.add(rim);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .5, .41], seed });
    return { g, body, f };
  }

  // ---------------------------------------------------------------- teapot ראובן (spout tip at local (.85, .93); tilts around its base)
  function teapot(Wd, x, seed) {
    const g = new THREE.Group(); g.position.set(x, TOP, 0); Wd.add(g);
    const body = ball(.55, 0x3f5f8a); body.scale.set(1, .9, 1); body.position.y = .5; g.add(body);
    const sp = cyl(.08, .16, .7, 0x3f5f8a); sp.position.set(.6, .68, 0); sp.rotation.z = -PI / 4; g.add(sp);
    const lid = cyl(.14, .18, .12, 0xd9e6f5); lid.position.y = 1.02; g.add(lid);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .5, .56], seed });
    return { g, f, x };
  }

  // ---------------------------------------------------------------- pour: a chain of dark dots along an arc, grows with progress s
  function pour(Wd, n, col) {
    const d = []; for (let k = 0; k < n; k++) { const m = ball(.07, col); m.visible = false; Wd.add(m); d.push(m); }
    return (a, b, h, s) => d.forEach((m, k) => {
      const u = (k + 1) / (n + 1), on = s > u;
      m.visible = on; if (!on) return;
      const p = arcPt(a, b, u, h); m.position.set(p[0], p[1], p[2]);
    });
  }

  // ---------------------------------------------------------------- THE GOSSIP NOTE: grey crumpled note with a face and the sticker "נאמר בפני 3"
  function note(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const body = box(.7, .7, .12, DARK); g.add(body);
    const crumple = box(.5, .3, .14, 0x3a3f47); crumple.position.set(.08, .2, 0); crumple.rotation.z = .4; g.add(crumple);
    const f = face(Wd, { w: .42, parent: g, pos: [0, .05, .1], seed: 9 });
    const st = texPlane(.6, .2, mkDraw('נאמר בפני 3', '#fff6d6', '#8a1010', '#d9a63a'), { cw: 512, ro: 9 });
    st.position.set(0, -.22, .075); g.add(st);
    return { g, body, f, st };
  }

  // ---------------------------------------------------------------- house of Shimon (face on the front = +z)
  function house(Wd, x, seed, col, roof) {
    const g = new THREE.Group(); g.position.set(x, 0, 0); Wd.add(g);
    const body = box(1.2, .9, .8, col); body.position.y = .45; g.add(body);
    const rf = cyl(0, .8, .6, roof); rf.position.y = 1.2; g.add(rf);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .55, .41], seed });
    return { g, body, f };
  }

  // ---------------------------------------------------------------- shem-tov meter (good name): grey tube, green fill
  function meter(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const back = box(.38, 1.3, .14, 0xdde3ea); g.add(back);
    const fill = box(.28, 1.2, .2, GREEN); fill.position.z = .05; g.add(fill);
    return { g, set(v) { const h = clamp(v, .04, 1); fill.scale.y = h; fill.position.y = -.6 + .6 * h; fill.material.color.lerpColors(C_BAD, C_GOOD, h); } };
  }

  // ---------------------------------------------------------------- dotted arc path (lights up with a2 in 0..1)
  function dots(Wd, a, b, h, n) {
    const d = [];
    for (let k = 1; k <= n; k++) { const p = arcPt(a, b, k / (n + 1), h); const m = ball(.06, 0x6b7078); m.position.set(p[0], p[1], p[2]); m.visible = false; Wd.add(m); d.push(m); }
    return a2 => d.forEach(m => { m.visible = a2 > .01; m.scale.setScalar(Math.max(a2, .001)); });
  }

  // ---------------------------------------------------------------- zipper on the friend's mouth: u 0 = open, 1 = closed
  function zipper(g) {
    const seam = box(.7, .05, .05, 0x3a3f47); seam.position.set(0, .3, .43); g.add(seam);
    const slide = ball(.06, 0x9aa0a8); slide.position.set(0, .3, .47); g.add(slide);
    return { seam, set(u) { seam.scale.x = Math.max(.02, u); slide.position.x = lerp(-.35, .35, u); } };
  }

  // ---------------------------------------------------------------- gate (drops in front of the path)
  function gate(Wd, x) {
    const g = new THREE.Group(); g.position.set(x, TOP, 0); Wd.add(g);
    const panel = box(.12, 1.2, .9, 0xd9483b); panel.position.y = .6; g.add(panel);
    const bar = box(.3, .12, 1.0, GOLD); bar.position.y = 1.2; g.add(bar);
    return { g, set(u) { g.position.y = TOP + (1 - u) * 3.0; } };
  }

  // ================================================================ HOOK (14 s): extreme close-up of the note with its sticker, pulls out to the table of cups; "?" above the friend
  function hook(dur) {
    const Wd = mkWorld({}); base(Wd);
    const nt = note(Wd, NOTE0);
    const cups = [cup(Wd, LX[0], 1, 0xf2b8a2), cup(Wd, LX[1], 2, 0xcfe6ff), cup(Wd, LX[2], 3, 0xd9f2c8), cup(Wd, FX, 4, 0xffd6a0), cup(Wd, FIVE, 5, 0xe0d4f5)];
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    Wd.qPos = [FX, 0];
    Wd.occ = [nt.g, cups[3].g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      nt.g.position.y = NOTE0[1] + bob(t, 1);
      nt.g.rotation.z = .05 * Math.sin(t * 2);
      nt.f.set(t, { smile: -.6, talk: .8 * talkAmt(t, 2), look: [0, 0] });
      cups.forEach((c, i) => c.f.set(t, { smile: .2, talk: i === 3 ? 0 : .5 * talkAmt(t, 10 + i), look: [0, .2] }));
      ph.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
    });
    const w = split(dur, [5, 4.5, 4.5]);
    Wd.cam = cuts([
      [w[0], HH(pullOut([NOTE0[0], NOTE0[1], 0], { dur: w[0], dist0: 1.0, dist1: 5.5, h0: .3, h1: 1.8, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([0, 1.2, 0], { dur: w[1], dist0: 7.0, dist1: 6.8, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), 52)],
      [w[2], HH(pushIn([FX, 1.2, 0], { dur: w[2], dist0: 6.0, dist1: 4.6, h0: .8, h1: .7, a0: 6, a1: -8, fov0: 42, fov1: 40 }), 53)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, bad): the teapot ראובן pours three dark streams into the three listeners; the counter ticks 1-2-3; Shimon's meter drops
  function beat1(dur) {
    const Wd = mkWorld({}); base(Wd);
    const tp = teapot(Wd, TX, 7);
    const cups = [cup(Wd, LX[0], 1, 0xf2b8a2), cup(Wd, LX[1], 2, 0xcfe6ff), cup(Wd, LX[2], 3, 0xd9f2c8), cup(Wd, FX, 4, 0xffd6a0), cup(Wd, FIVE, 5, 0xe0d4f5)];
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, .7, .15]);
    const mt = tag(Wd, 1.7, .5, 'שם טוב', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const hs = tag(Wd, 1.2, .45, 'שמעון', '#fff6d6', '#5a3a10', '#c9a050');
    const cnt = [1, 2, 3].map(n => tag(Wd, .9, .9, String(n), '#f2c14e', '#3a2600', '#8a5a00'));
    const streams = LX.map(() => pour(Wd, 6, TEA));
    Wd.occ = [tp.g, cups[0].g, cups[1].g, cups[2].g, ph.g, m.g]; Wd.center = [-.6, 1.2];
    Wd.on(t => {
      const tilt = -.55 * sm(P(.6, 2.2, t));
      tp.g.rotation.z = tilt;
      const c = Math.cos(tilt), s = Math.sin(tilt);
      const tip = [TX + (.85 * c - .93 * s), TOP + (.85 * s + .93 * c), 0];
      streams.forEach((st, i) => st(tip, [LX[i], TOP + .9, 0], 1.0, sm(P(1.8 + i * .3, 4.2 + i * .3, t))));
      cnt.forEach((k, i) => {
        const pop = popE(P(1.2 + i * 1.4, 1.8 + i * 1.4, t));
        const fade = i < 2 ? 1 - sm(P(2.6 + i * 1.4, 3.0 + i * 1.4, t)) : 1;
        k.set([-2.0, 3.0 + bob(t, i), .4], pop * fade);
      });
      cups.slice(0, 3).forEach((c2, i) => c2.f.set(t, { smile: -.2, talk: .7 * talkAmt(t, 20 + i) * sm(P(2, 3, t)), look: [-1, 0] }));
      cups[3].f.set(t, { smile: .3, talk: 0, look: [-1, 0] });
      cups[4].f.set(t, { smile: .2, talk: 0, look: [-1, 0] });
      tp.f.set(t, { smile: .4, talk: .9 * talkAmt(t, 7), look: [1, 0] });
      m.set(lerp(1, .8, sm(P(6.0, 10.0, t))));
      ph.f.set(t, { smile: .6 - 1.4 * sm(P(6.0, 10.0, t)), talk: 0, look: [-1, 0] });
      hs.set([PX, 2.0, .4], 1);
      mt.set([PX + 1.05, 1.6, .3], popE(P(.4, 1.2, t)));
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(punch(truck([-1.1, 1.2, 0], { dur: w[0], dist0: 12, dist1: 11.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.6, 0, 0] }), [1.6, 3.0]), 1)],
      [w[1], HH(punch(insert([TX + .4, 1.4, 0], { dur: w[1], dist0: 6.4, dist1: 5.6, h0: .9, h1: 1.0, a0: -12, a1: 8, fov0: 40, fov1: 38 }), [1.0]), 2)],
      [w[2], HH(crane([PX - .3, 1.2, 0], { dur: w[2], dist0: 7.5, dist1: 6.4, h0: .4, h1: 1.6, a0: 10, a1: -6, fov0: 42, fov1: 40 }), 3)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, bad): the listener cup slides over to the friend; the gossip note hops along a dotted arc into the friend's cup
  function beat2(dur) {
    const Wd = mkWorld({}); base(Wd);
    const cups = [cup(Wd, LX[0], 1, 0xf2b8a2), cup(Wd, LX[1], 2, 0xcfe6ff), cup(Wd, LX[2], 3, 0xd9f2c8), cup(Wd, FX, 4, 0xffd6a0), cup(Wd, FIVE, 5, 0xe0d4f5)];
    const nt = note(Wd, [LX[2], 2.3, 0]);
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, .7, .15]);
    const mt = tag(Wd, 1.7, .5, 'שם טוב', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const A = [.4, 2.2, 0], B = [FX, 2.2, 0];
    const path = dots(Wd, A, B, .4, 7);
    Wd.occ = [cups[2].g, cups[3].g, nt.g, ph.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      cups[2].g.position.x = lerp(LX[2], .4, sm(P(.5, 2.5, t)));
      cups[2].f.set(t, { smile: -.2, talk: .7 * talkAmt(t, 21), look: [1, 0] });
      cups[0].f.set(t, { smile: -.2, talk: 0, look: [1, 0] });
      cups[1].f.set(t, { smile: -.2, talk: 0, look: [1, 0] });
      const u = sm(P(3.0, 5.6, t));
      const hop = arcPt(A, B, u, .4);
      nt.g.position.set(hop[0], hop[1] + bob(t, 4) * (1 - u), hop[2]);
      nt.g.visible = t < 6.2;
      nt.g.scale.setScalar(Math.max(.001, 1 - sm(P(5.2, 6.2, t))));
      nt.f.set(t, { smile: -.6, talk: .7 * talkAmt(t, 22) * (1 - u), look: [1, 0] });
      path(sm(P(2.6, 3.4, t)) * (1 - sm(P(6.2, 6.8, t))));
      cups[3].f.set(t, { smile: .4, talk: 0, look: [-1, 0] });
      cups[4].f.set(t, { smile: .2, talk: 0, look: [-1, 0] });
      m.set(.8 + .02 * Math.sin(t * 4));
      ph.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] });
      mt.set([PX + 1.05, 1.6, .3], popE(P(.4, 1.2, t)));
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-.2, 1.2, 0], { dur: w[0], dist0: 10.5, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.8, 0, 0] }), 22)],
      [w[1], HH(punch(insert([.9, 1.8, 0], { dur: w[1], dist0: 4.8, dist1: 4.4, h0: 1.2, h1: 1.3, a0: -8, a1: 8, fov0: 40, fov1: 38 }), [2.0]), 23)],
      [w[2], HH(crane([FX, 1.5, 0], { dur: w[2], dist0: 6.5, dist1: 5.5, h0: .6, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): the friend holds the sticker "נאמר בפני 3" up proudly and turns toward the fifth cup; the dotted path lights up
  function beat3(dur) {
    const Wd = mkWorld({}); base(Wd);
    const cups = [cup(Wd, LX[0], 1, 0xf2b8a2), cup(Wd, LX[1], 2, 0xcfe6ff), cup(Wd, LX[2], 3, 0xd9f2c8), cup(Wd, FX, 4, 0xffd6a0), cup(Wd, FIVE, 5, 0xe0d4f5)];
    cups[2].g.position.x = .4;
    const sticker = tag(Wd, 2.2, .6, 'נאמר בפני 3', '#fff6d6', '#8a1010', '#d9a63a');
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, .7, .15]);
    const path = dots(Wd, [FX, 2.1, 0], [FIVE, 2.1, 0], 1.2, 7);
    Wd.occ = [cups[3].g, cups[4].g, ph.g, m.g]; Wd.center = [.9, 1.2];
    Wd.on(t => {
      cups[3].g.rotation.y = .6 * sm(P(.5, 2.2, t));
      cups[3].f.set(t, { smile: -.6, talk: .8 * talkAmt(t, 23), look: [1, 0] });
      const up = sm(P(1.0, 2.4, t));
      sticker.set([FX, 2.2 + .5 * up + bob(t, 5), .5], popE(P(.8, 1.8, t)));
      path(sm(P(2.4, 4.0, t)));
      cups[4].f.set(t, { smile: -.6, talk: .5 * talkAmt(t, 24), look: [-1, 0] });
      cups[0].f.set(t, { smile: -.2, talk: 0, look: [1, 0] });
      cups[1].f.set(t, { smile: -.2, talk: 0, look: [1, 0] });
      cups[2].f.set(t, { smile: -.2, talk: .4 * talkAmt(t, 25), look: [1, 0] });
      m.set(.8 - .1 * sm(P(3, 8, t)));
      ph.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(punch(truck([.9, 1.2, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -8, a1: 8, fov0: 42, fov1: 42, shift: [1, 0, 0] }), [1.8]), 10)],
      [w[1], HH(insert([FX, 1.6, 0], { dur: w[1], dist0: 5.0, dist1: 4.6, h0: 1.0, h1: 1.1, a0: -10, a1: 10, fov0: 40, fov1: 40 }), 11)],
      [w[2], HH(pullOut([2.2, 1.6, 0], { dur: w[2], dist0: 4.0, dist1: 8.0, h0: .9, h1: 1.4, a0: 8, a1: -8, fov0: 38, fov1: 44 }), 12)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, bad): a big red cross slams onto the path (shock); a gate drops in front of the path; the tag "אסור לספר הלאה"
  function beat4(dur) {
    const Wd = mkWorld({}); base(Wd);
    const cups = [cup(Wd, LX[0], 1, 0xf2b8a2), cup(Wd, LX[1], 2, 0xcfe6ff), cup(Wd, LX[2], 3, 0xd9f2c8), cup(Wd, FX, 4, 0xffd6a0), cup(Wd, FIVE, 5, 0xe0d4f5)];
    cups[2].g.position.x = .4;
    cups[3].g.rotation.y = .6;
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, .7, .15]);
    const path = dots(Wd, [FX, 2.1, 0], [FIVE, 2.1, 0], 1.2, 7);
    const gt = gate(Wd, GATE_X);
    const cx = mark3d(Wd, 'cross', 1.5), sk = shock(Wd, 0xff7a7a);
    const bad = tag(Wd, 3.2, .6, 'אסור לספר הלאה', '#ffe3e3', '#8a1010', '#c43030');
    Wd.occ = [cups[3].g, cups[4].g, gt.g, ph.g]; Wd.center = [1.0, 1.2];
    Wd.on(t => {
      gt.set(sm(P(1.2, 3.2, t)));
      path(sm(P(.2, 1.0, t)));
      const slam = popE(P(1.8, 2.6, t));
      cx.set([GATE_X, 2.0, .5], slam * .7, .05 * Math.sin(t * 4) * (t > 2.6 ? 1 : 0));
      sk.set([GATE_X, 2.0, .5], P(1.8, 2.6, t), 1.6);
      bad.set([GATE_X, 3.0, .4], popE(P(3.5, 4.5, t)));
      cups[3].f.set(t, { smile: -.6, talk: t > 2.6 ? .8 * talkAmt(t, 14) : 0, surprise: sm(P(1.8, 2.4, t)), look: [1, 0] });
      cups[4].f.set(t, { smile: -.6, talk: 0, surprise: sm(P(2.2, 3.0, t)), look: [-1, 0] });
      cups[2].f.set(t, { smile: -.6, talk: .5 * talkAmt(t, 15), look: [1, 0] });
      cups[0].f.set(t, { smile: -.2, talk: 0, look: [1, 0] });
      cups[1].f.set(t, { smile: -.2, talk: 0, look: [1, 0] });
      m.set(lerp(.8, .55, sm(P(5, 9, t))));
      ph.f.set(t, { smile: -.8, talk: 0, look: [-1, 0] });
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(punch(truck([1.0, 1.2, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1, 0, 0] }), [2.2]), 31)],
      [w[1], HH(punch(insert([GATE_X, 2.0, 0], { dur: w[1], dist0: 6.0, dist1: 5.7, h0: 1.4, h1: 1.5, a0: -8, a1: 8, fov0: 40, fov1: 38 }), [.2]), 32)],
      [w[2], HH(crane([PX - 1.2, 1.3, 0], { dur: w[2], dist0: 8.0, dist1: 6.8, h0: .5, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 33)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): the friend turns back and puts on a mask over its face; the source name tag "מפי ראובן" flips blank; the red cross stays; tag "גם בלי שם"
  function beat5(dur) {
    const Wd = mkWorld({}); base(Wd);
    const cups = [cup(Wd, LX[0], 1, 0xf2b8a2), cup(Wd, LX[1], 2, 0xcfe6ff), cup(Wd, LX[2], 3, 0xd9f2c8), cup(Wd, FX, 4, 0xffd6a0), cup(Wd, FIVE, 5, 0xe0d4f5)];
    cups[2].g.position.x = .4;
    const nt = note(Wd, [0, 1.25, .1]); cups[3].g.add(nt.g);
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, .7, .15]);
    const gt = gate(Wd, GATE_X); gt.set(1);
    const cx = mark3d(Wd, 'cross', 1.5);
    const nameT = tag(Wd, 1.6, .45, 'מפי ראובן', '#fff6d6', '#5a3a10', '#c9a050');
    const blankT = tag(Wd, 1.6, .45, ' ', '#f4f4f4', '#f4f4f4', '#9aa0a8');
    const gm = tag(Wd, 2.4, .55, 'גם בלי שם', '#ffe3e3', '#8a1010', '#c43030');
    Wd.occ = [cups[2].g, cups[3].g, cups[4].g, ph.g]; Wd.center = [.2, 1.2];
    Wd.on(t => {
      cx.set([GATE_X, 2.0, .5], .7, 0);
      cups[3].g.rotation.y = lerp(.6, 0, sm(P(.8, 2.4, t)));
      cups[3].f.set(t, { smile: -.6, talk: t < 2.0 ? .7 * talkAmt(t, 16) : 0, look: [-1, 0] });
      cups[2].f.set(t, { smile: -.6, talk: t < 2.6 ? .6 * talkAmt(t, 17) : 0, look: [-1, 0] });
      cups[0].f.set(t, { smile: -.2, talk: 0, look: [1, 0] });
      cups[1].f.set(t, { smile: -.2, talk: 0, look: [1, 0] });
      cups[4].f.set(t, { smile: -.6, talk: 0, look: [-1, 0] });
      nameT.set([.4, 2.35 + bob(t, 1), .4], 1 - sm(P(2.6, 3.2, t)));
      nameT.g.children[0].rotation.y = PI * sm(P(2.0, 2.8, t));
      blankT.set([.4, 2.35 + bob(t, 1), .4], sm(P(2.8, 3.4, t)));
      blankT.g.children[0].rotation.y = -PI * .5 * (1 - sm(P(2.8, 3.8, t)));
      gm.set([FX, 3.0, .4], popE(P(4.0, 5.0, t)));
      m.set(.55);
      ph.f.set(t, { smile: -.8, talk: 0, look: [-1, 0] });
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-.4, 1.2, 0], { dur: w[0], dist0: 10.5, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.6, 0, 0] }), 51)],
      [w[1], HH(punch(insert([.9, 2.0, 0], { dur: w[1], dist0: 5.2, dist1: 5.0, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 40, fov1: 40 }), [.6]), 52)],
      [w[2], HH(crane([FX, 1.5, 0], { dur: w[2], dist0: 6.0, dist1: 5.4, h0: .6, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 53)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, good): the sticker cracks and fades to "?"; the friend's zipper closes; the note shrinks into the bin; the meter rises; a green check
  function beat6(dur) {
    const Wd = mkWorld({}); base(Wd);
    const cups = [cup(Wd, LX[0], 1, 0xf2b8a2), cup(Wd, LX[1], 2, 0xcfe6ff), cup(Wd, LX[2], 3, 0xd9f2c8), cup(Wd, FX, 4, 0xffd6a0), cup(Wd, FIVE, 5, 0xe0d4f5)];
    cups[2].g.position.x = .4;
    const zp = zipper(cups[3].g);
    const nt = note(Wd, [FX + .3, 2.3, .6]);
    const bin = new THREE.Group(); bin.position.set(BIN[0], TOP, BIN[2]); Wd.add(bin);
    const bb = cyl(.34, .26, .6, 0x6b7078); bb.position.y = .3; bin.add(bb);
    const bt2 = cyl(.3, .3, .02, 0x2a2e33); bt2.position.y = .6; bin.add(bt2);
    const ss = tag(Wd, 2.2, .6, 'נאמר בפני 3', '#fff6d6', '#8a1010', '#d9a63a');
    const qq = tag(Wd, .8, .8, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const m = meter(Wd, [PX + 1.05, .7, .15]);
    const mt = tag(Wd, 1.7, .5, 'שם טוב', '#e8fff0', '#1f6a2a', '#3f9a4a');
    const st = tag(Wd, 2.6, .55, 'שמירת הלשון', '#e8fff0', '#1f6a2a', '#3f9a4a');
    const ck = mark3d(Wd, 'check', 1.2), sk = shock(Wd, 0xbff5c8);
    Wd.occ = [cups[3].g, ph.g, ck.g, bin]; Wd.center = [.6, 1.2];
    Wd.on(t => {
      zp.set(sm(P(.8, 3.2, t)));
      cups[3].f.set(t, { smile: .5 + .5 * sm(P(1.0, 3.0, t)), talk: 0, look: [0, 0] });
      cups[0].f.set(t, { smile: .6, talk: .5 * talkAmt(t, 18), look: [0, 0] });
      cups[1].f.set(t, { smile: .6, talk: .5 * talkAmt(t, 19), look: [0, 0] });
      cups[2].f.set(t, { smile: .6, talk: 0, look: [0, 0] });
      cups[4].f.set(t, { smile: .4, talk: 0, look: [-1, 0] });
      const sh = sm(P(1.5, 3.0, t));
      ss.set([FX, 2.5 + bob(t, 5), .5], 1 - .5 * sh, 1 - sh);
      qq.set([FX, 2.5 + bob(t, 6), .5], popE(P(2.6, 3.4, t)));
      const u = sm(P(4.0, 7.0, t));
      const hop = arcPt([FX + .3, 2.3, .6], [BIN[0], TOP + .9, BIN[2]], u, 1.0);
      nt.g.position.set(hop[0], hop[1], hop[2]);
      nt.g.scale.setScalar(Math.max(.001, 1 - u));
      nt.g.visible = u < .99;
      nt.f.set(t, { smile: -.6, talk: 0, look: [0, 0] });
      m.set(lerp(.55, 1, sm(P(3.0, 8.0, t))));
      ph.f.set(t, { smile: -.6 + 1.4 * sm(P(3.0, 5.0, t)), talk: .4 * talkAmt(t, 26) * sm(P(5, 6, t)), look: [0, 0] });
      mt.set([PX + 1.05, 1.6, .3], popE(P(.4, 1.2, t)));
      st.set([-1.1, 3.2, .4], popE(P(1.0, 2.0, t)));
      ck.set([FX + .3, 2.9, .5], popE(P(8.5, 9.5, t)) * .9, .04 * Math.sin(t * 3));
      sk.set([FX + .3, 2.9, .5], P(8.5, 10.0, t), 2.0);
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(insert([FX, 1.5, 0], { dur: w[0], dist0: 4.6, dist1: 4.2, h0: 1.0, h1: 1.1, a0: -6, a1: 6, fov0: 40, fov1: 38 }), 41)],
      [w[1], HH(punch(truck([.5, 1.2, 0], { dur: w[1], dist0: 10.5, dist1: 10, h0: 1.4, h1: 1.6, a0: -8, a1: 8, fov0: 42, fov1: 42, shift: [1, 0, 0] }), [4.6]), 42)],
      [w[2], HH(crane([FX + .6, 2.0, 0], { dur: w[2], dist0: 6.0, dist1: 5.5, h0: .8, h1: 1.8, a0: 0, a1: 0, fov0: 42, fov1: 40 }), 43)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): a warm table, the cups smiling, the zipper closed, Shimon's house with a gold badge and a full meter; slow crane
  function answer(dur) {
    const Wd = mkWorld({}); base(Wd);
    const cups = [cup(Wd, LX[0], 1, 0xf2b8a2), cup(Wd, LX[1], 2, 0xcfe6ff), cup(Wd, LX[2], 3, 0xd9f2c8), cup(Wd, FX, 4, 0xffd6a0), cup(Wd, FIVE, 5, 0xe0d4f5)];
    cups[2].g.position.x = .4;
    const zp = zipper(cups[3].g);
    const ph = house(Wd, PX, 6, 0xcfe6ff, 0x2f5fa0);
    const badge = cyl(.42, .42, .1, GOLD); badge.rotation.x = PI / 2; badge.position.set(PX, 2.35, .3); Wd.add(badge);
    const bt = tag(Wd, 2.0, .55, 'שם טוב', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const m = meter(Wd, [PX + 1.05, .7, .15]);
    const ck = mark3d(Wd, 'check', 1.1);
    Wd.occ = [cups[3].g, ph.g, badge]; Wd.center = [0, 1.0]; Wd.ansD = 6.4;
    Wd.on(t => {
      zp.set(1);
      cups.forEach((c, i) => c.f.set(t, { smile: 1, talk: .4 * talkAmt(t, 30 + i), look: [i < 2 ? 1 : -1, 0] }));
      ph.f.set(t, { smile: 1, talk: .35 * talkAmt(t, 36), look: [0, 0] });
      const glow = .5 + .5 * Math.sin(t * 2.5);
      badge.material.color.lerpColors(new THREE.Color(GOLD), new THREE.Color(0xfff3a0), glow);
      m.set(1);
      bt.set([PX, 2.85 + bob(t, 1), .4], 1);
      ck.set([PX + 1.2, 2.5, .5], popE(P(.5, 1.5, t)) * .45, 0);
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.8, 0], { dur, dist0: 10.0, dist1: 8.2, h0: .8, h1: 2.4, a0: 6, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
