// halashon-13 story: "Three who all guard their tongue - may it still be retold?" (storyboards_v14.md, section B).
// Talking objects only, NO people. Heroes: THE STORY = a rolled scroll with a worried face (the secret), THREE LISTENER CUPS with a lock badge
// (each gets a "שומר לשון" shield tag), a MEGAPHONE gossip-trumpet (the 4th object), three SHIMON HOUSES on the floor (the town),
// moving diagram: dotted arcs from the listeners to the houses, houses light up, shields bounce the arcs, meter "התפשטות", counter "1 מתוך 3".
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, arcPt, FONT, fitText } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const split = (dur, ws) => { const tot = ws.reduce((a, b) => a + b, 0); return ws.map(w => dur * w / tot); };
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .05;
  const GOLD = 0xf2c14e, GREEN = 0x2fbf5b, RED = 0xe03131, DARK = 0x4a4f57, PAPER = 0xf4e4b8, LIT = 0xffd166;
  const C_GOOD = new THREE.Color(GREEN), C_BAD = new THREE.Color(RED);
  const TOP = .99;                    // table top surface (table = box at y .9, thickness .18)
  const LX = [-4.9, -2.8, -0.7];      // the three listeners
  const SX = 0.6;                     // the scroll (the story), on the table right of the listeners
  const MX = 2.6;                     // the megaphone (4th object), on the table
  const CEN = [-2.8, TOP + 1.1, 0];   // the spreading point, above the middle listener
  const HX = [4.4, 5.4, 6.4];         // three houses of the town, on the floor
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
    const fl = box(26, .2, 9, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(26, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    const tb = box(10.8, .18, 3.0, 0xb07a4a); tb.position.set(-1.1, TOP - .09, 0); Wd.add(tb);
    for (const lx of [-6.2, 4.0]) for (const lz of [-1.3, 1.3]) {
      const l = box(.2, TOP - .18, .2, 0x8a5a33); l.position.set(lx, (TOP - .18) / 2, lz); Wd.add(l);
    }
    Wd.center = [0, 0];
  }

  // ---------------------------------------------------------------- listener cup (face on the +z side) with a LOCK badge on top
  function cup(Wd, x, seed, col) {
    const g = new THREE.Group(); g.position.set(x, TOP, 0); Wd.add(g);
    const sau = cyl(.62, .62, .07, 0xf4f1ea); sau.position.y = .035; g.add(sau);
    const body = cyl(.42, .34, .8, col); body.position.y = .47; g.add(body);
    const rim = cyl(.44, .42, .06, 0xfff7e8); rim.position.y = .87; g.add(rim);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .5, .41], seed });
    const lock = new THREE.Group(); lock.position.set(0, 1.08, .3); g.add(lock);
    const lb = box(.3, .22, .12, GOLD); lb.position.y = 0; lock.add(lb);
    const ls = cyl(.07, .07, .14, GOLD); ls.position.y = .17; lock.add(ls);
    return { g, body, f, lock };
  }

  // ---------------------------------------------------------------- the STORY: an upright rolled scroll with a face on the +z side
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

  // ---------------------------------------------------------------- the MEGAPHONE gossip-trumpet (4th object), face on the front
  function megaphone(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const body = cyl(.36, .36, .6, 0xd9483b); body.position.y = .3; g.add(body);
    const horn = cyl(.12, .4, .5, 0xe8685c); horn.position.set(-.12, .92, 0); horn.rotation.z = PI / 2; g.add(horn);
    const f = face(Wd, { w: .42, parent: g, pos: [0, .42, .37], seed: 12 });
    return { g, body, f };
  }

  // ---------------------------------------------------------------- house of Shimon (face on the front = +z)
  function house(Wd, x, seed, col, roof) {
    const g = new THREE.Group(); g.position.set(x, 0, 0); Wd.add(g);
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

  // ---------------------------------------------------------------- shem-tov meter (good name): grey tube, green fill
  function meter(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const back = box(.38, 1.3, .14, 0xdde3ea); g.add(back);
    const fill = box(.28, 1.2, .2, GREEN); fill.position.z = .05; g.add(fill);
    return { g, set(v) { const h = clamp(v, .04, 1); fill.scale.y = h; fill.position.y = -.6 + .6 * h; fill.material.color.lerpColors(C_BAD, C_GOOD, h); } };
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

  // ================================================================ HOOK (14 s): extreme close-up of the scroll's worried face, pulls out to the three listeners with lock badges; "?" above the scroll
  function hook(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, [0xf2b8a2, 0xcfe6ff, 0xd9f2c8][i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const qq = tag(Wd, .8, .8, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    Wd.qPos = [SX, 0];
    Wd.occ = [sc.g, cups[2].g]; Wd.center = [-.8, 1.2];
    Wd.on(t => {
      sc.g.rotation.z = .04 * Math.sin(t * 2);
      sc.f.set(t, { smile: -.6, talk: .5 * talkAmt(t, 2), look: [0, 0] });
      cups.forEach((c, i) => c.f.set(t, { smile: .1, talk: .4 * talkAmt(t, 10 + i), look: [-1, 0] }));
      hs.forEach(h => h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
      qq.set([SX, 2.4 + bob(t, 3), .4], popE(P(1.0, 1.8, t)));
    });
    const w = split(dur, [5, 4.5, 4.5]);
    Wd.cam = cuts([
      [w[0], HH(pullOut([SX, 1.1, 0], { dur: w[0], dist0: 1.0, dist1: 5.5, h0: .3, h1: 1.8, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-1.2, 1.2, 0], { dur: w[1], dist0: 7.5, dist1: 7.2, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), 52)],
      [w[2], HH(pushIn([SX, 1.2, 0], { dur: w[2], dist0: 6.0, dist1: 4.6, h0: .8, h1: .7, a0: 6, a1: -8, fov0: 42, fov1: 40 }), 53)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, bad): the scroll is told to the three; normal case shown as a diagram: from the listeners the arcs branch out to the houses, houses light up one by one
  function beat1(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, [0xf2b8a2, 0xcfe6ff, 0xd9f2c8][i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const arcs = HX.map(x => arc(Wd, CEN, [x, 1.4, 0], 1.3, 6));
    const m = meter(Wd, [7.6, .7, .15]);
    const mt = tag(Wd, 2.4, .5, 'התפשטות', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const cnt = tag(Wd, 1.6, .6, '3', '#f2c14e', '#3a2600', '#8a5a00');
    Wd.occ = [sc.g, cups[0].g, cups[1].g, cups[2].g, hs[0].g, m.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      sc.f.set(t, { smile: -.6, talk: .8 * talkAmt(t, 7), look: [1, 0] });
      cups.forEach((c, i) => c.f.set(t, { smile: -.2, talk: .6 * talkAmt(t, 20 + i) * sm(P(1.5, 2.5, t)), look: [1, 0] }));
      hs.forEach((h, i) => {
        const lit = sm(P(3.0 + i * 2.2, 4.0 + i * 2.2, t));
        lightHouse(h, lit);
        h.f.set(t, { smile: -.2 + 1.2 * lit, talk: 0, look: [0, 0] });
      });
      arcs.forEach((a, i) => a(sm(P(2.2 + i * 2.2, 3.6 + i * 2.2, t))));
      m.set(lerp(1, .85, sm(P(5.0, 12.0, t))));
      cnt.set([-2.0, 2.9 + bob(t, 2), .4], popE(P(.4, 1.0, t)));
      mt.set([7.6, 1.6 + bob(t, 3), .3], popE(P(.8, 1.6, t)));
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(punch(truck([-1.0, 1.2, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.6, 0, 0] }), [1.6]), 1)],
      [w[1], HH(punch(truck([3.0, 1.4, 0], { dur: w[1], dist0: 13.5, dist1: 13, h0: 1.5, h1: 1.5, a0: 6, a1: -6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), [3.6]), 2)],
      [w[2], HH(crane([4.6, 1.2, 0], { dur: w[2], dist0: 10.5, dist1: 9.0, h0: .4, h1: 1.6, a0: 10, a1: -6, fov0: 42, fov1: 40 }), 3)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, bad): a green SHIELD tag "שומר לשון" pops on each listener (punch on each pop); green glow rings pulse
  function beat2(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, [0xf2b8a2, 0xcfe6ff, 0xd9f2c8][i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const m = meter(Wd, [7.6, .7, .15]);
    const shields = LX.map(x => tag(Wd, .95, .26, 'שומר לשון', '#e8fff0', '#1f6a2a', '#3f9a4a'));
    const rings = LX.map(() => { const r = new THREE.Mesh(new THREE.TorusGeometry(.5, .03, 8, 28), new THREE.MeshBasicMaterial({ color: GREEN })); r.rotation.x = PI / 2; Wd.add(r); return r; });
    Wd.occ = [sc.g, cups[0].g, cups[1].g, cups[2].g, hs[0].g, m.g]; Wd.center = [-1.0, 1.2];
    Wd.on(t => {
      sc.f.set(t, { smile: -.2, talk: .5 * talkAmt(t, 8), look: [1, 0] });
      cups.forEach((c, i) => c.f.set(t, { smile: .4 * sm(P(2.0 + i, 3.0 + i, t)), talk: .5 * talkAmt(t, 26 + i), look: [1, 0] }));
      LX.forEach((x, i) => {
        const pop = popE(P(1.0 + i * 2.2, 2.0 + i * 2.2, t));
        shields[i].set([x, 2.5 + bob(t, i), .4], pop);
        const ring = rings[i];
        const a = P(1.2 + i * 2.2, 2.6 + i * 2.2, t);
        ring.visible = a > .01 && a < 1.01;
        ring.position.set(x, TOP + .09, 0);
        const pulse = 1 + .18 * Math.sin(t * 6 + i);
        ring.scale.setScalar(Math.max(.001, a * pulse));
        ring.material.opacity = 1;
      });
      hs.forEach(h => { h.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      m.set(.85 + .02 * Math.sin(t * 4));
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-1.0, 1.2, 0], { dur: w[0], dist0: 9.5, dist1: 9.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.6, 0, 0] }), 22)],
      [w[1], HH(punch(insert([LX[1], 1.8, 0], { dur: w[1], dist0: 4.8, dist1: 4.4, h0: 1.2, h1: 1.3, a0: -8, a1: 8, fov0: 40, fov1: 38 }), [1.0, 3.2]), 23)],
      [w[2], HH(crane([-2.0, 1.5, 0], { dur: w[2], dist0: 6.5, dist1: 5.5, h0: .6, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, good): the arcs run out from the listeners and bounce off the green shield (shock); they retract; the houses stay dark; meter drops to 0; green check
  function beat3(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, [0xf2b8a2, 0xcfe6ff, 0xd9f2c8][i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const shields = LX.map(x => tag(Wd, .95, .26, 'שומר לשון', '#e8fff0', '#1f6a2a', '#3f9a4a'));
    const arcs = HX.map(x => arc(Wd, CEN, [x, 1.4, 0], 1.3, 6));
    const m = meter(Wd, [7.6, .7, .15]);
    const mt = tag(Wd, 2.4, .5, 'התפשטות', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const ck = mark3d(Wd, 'check', 1.4);
    const bounce = shock(Wd, 0x9fe8b5);
    Wd.occ = [sc.g, cups[0].g, cups[1].g, cups[2].g, hs[0].g, m.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      LX.forEach((x, i) => shields[i].set([x, 2.5 + bob(t, i), .4], 1));
      const out = sm(P(.8, 2.4, t)), back = sm(P(2.6, 3.8, t));
      arcs.forEach(a => a(out * (1 - back), GREEN));
      bounce.set([CEN[0] + .5, CEN[1], .5], P(2.2, 3.0, t), 1.4);
      sc.f.set(t, { smile: .6, talk: .5 * talkAmt(t, 7), look: [1, 0] });
      cups.forEach((c, i) => c.f.set(t, { smile: .6, talk: .4 * talkAmt(t, 27 + i), look: [1, 0] }));
      hs.forEach(h => { h.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      m.set(lerp(.85, 0, sm(P(4.0, 8.0, t))));
      mt.set([7.6, 1.6 + bob(t, 3), .3], popE(P(.4, 1.0, t)));
      ck.set([CEN[0], 3.2, .5], popE(P(8.0, 9.0, t)) * .9, .04 * Math.sin(t * 3));
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([1.5, 1.2, 0], { dur: w[0], dist0: 13, dist1: 13, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.8, 0, 0] }), 10)],
      [w[1], HH(punch(insert([LX[1], 1.8, 0], { dur: w[1], dist0: 6.3, dist1: 5.8, h0: 1.0, h1: 1.1, a0: -10, a1: 10, fov0: 40, fov1: 40 }), [2.8]), 11)],
      [w[2], HH(pullOut([CEN[0], 1.6, 0], { dur: w[2], dist0: 4.0, dist1: 8.0, h0: .9, h1: 1.4, a0: 8, a1: -8, fov0: 38, fov1: 44 }), 12)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, bad): the MEGAPHONE leans in toward the scroll; red cross slams in (shock); tag "אסור מן התורה"; the scroll hides
  function beat4(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, [0xf2b8a2, 0xcfe6ff, 0xd9f2c8][i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const mg = megaphone(Wd, [MX, TOP, .9]);
    const shields = LX.map(x => tag(Wd, .95, .26, 'שומר לשון', '#e8fff0', '#1f6a2a', '#3f9a4a'));
    const m = meter(Wd, [7.6, .7, .15]);
    const cx = mark3d(Wd, 'cross', 1.6), sk = shock(Wd, 0xff7a7a);
    const bad = tag(Wd, 3.2, .6, 'אסור מן התורה', '#ffe3e3', '#8a1010', '#c43030');
    Wd.occ = [sc.g, cups[0].g, mg.g, hs[0].g, m.g]; Wd.center = [.6, 1.2];
    Wd.on(t => {
      const lean = sm(P(.5, 2.4, t));
      mg.g.position.x = lerp(MX, SX + .9, lean);
      mg.g.position.z = lerp(.9, .5, lean);
      mg.g.rotation.y = lerp(0, -.5, lean);
      mg.f.set(t, { smile: .4, talk: .9 * talkAmt(t, 14) * lean, surprise: 0, look: [-1, 0] });
      sc.f.set(t, { smile: -.6, talk: 0, surprise: sm(P(2.4, 3.0, t)), look: [1, 0] });
      sc.g.scale.setScalar(Math.max(.001, 1 - sm(P(3.2, 4.2, t))));
      const slam = popE(P(2.4, 3.2, t));
      cx.set([SX, 2.0, .5], slam * .8, .05 * Math.sin(t * 4) * (t > 3.2 ? 1 : 0));
      sk.set([SX, 2.0, .5], P(2.4, 3.2, t), 1.6);
      bad.set([SX, 3.0, .4], popE(P(3.4, 4.4, t)));
      cups.forEach((c, i) => c.f.set(t, { smile: -.4, talk: .4 * talkAmt(t, 28 + i), look: [1, 0] }));
      hs.forEach(h => { h.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      LX.forEach((x, i) => shields[i].set([x, 2.5 + bob(t, i), .4], 1));
      m.set(lerp(.85, .6, sm(P(5, 9, t))));
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(punch(truck([-.2, 1.2, 0], { dur: w[0], dist0: 10.5, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.8, 0, 0] }), [2.6]), 31)],
      [w[1], HH(punch(insert([SX + .4, 1.8, 0], { dur: w[1], dist0: 5.6, dist1: 5.3, h0: 1.3, h1: 1.5, a0: -8, a1: 8, fov0: 40, fov1: 38 }), [3.4]), 32)],
      [w[2], HH(crane([MX - .4, 1.4, 0], { dur: w[2], dist0: 7.5, dist1: 6.6, h0: .6, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 33)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): two of the three lose their shield (fade); only ONE keeps it; the arcs stop at him; counter "1 מתוך 3"; red cross on the megaphone again
  function beat5(dur) {
    const Wd = mkWorld({}); base(Wd);
    const mg = megaphone(Wd, [MX, TOP, .9]);
    mg.g.position.x = SX + .9; mg.g.position.z = .5; mg.g.rotation.y = -.5;
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, [0xf2b8a2, 0xcfe6ff, 0xd9f2c8][i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const shields = LX.map(x => tag(Wd, .95, .26, 'שומר לשון', '#e8fff0', '#1f6a2a', '#3f9a4a'));
    const arcs = [arc(Wd, CEN, [HX[0], 1.4, 0], 1.3, 6)];
    const m = meter(Wd, [7.6, .7, .15]);
    const cx = mark3d(Wd, 'cross', 1.6);
    const cnt = tag(Wd, 2.0, .5, '1 מתוך 3', '#f2c14e', '#3a2600', '#8a5a00');
    Wd.occ = [cups[0].g, cups[1].g, cups[2].g, mg.g, hs[0].g]; Wd.center = [-.8, 1.2];
    Wd.on(t => {
      const lose = [sm(P(1.2, 2.6, t)), sm(P(1.6, 3.0, t))];
      shields[0].set([LX[0], 2.5 + bob(t, 0), .4], 1 - lose[0]);
      shields[1].set([LX[1], 2.5 + bob(t, 1), .4], 1 - lose[1]);
      shields[2].set([LX[2], 2.5 + bob(t, 2), .4], 1);
      arcs[0](sm(P(.4, 1.6, t)) * (1 - .0), GREEN);
      cups.forEach((c, i) => c.f.set(t, { smile: i === 2 ? .6 : -.4 * (1 - lose[Math.min(i, 1)]), talk: .4 * talkAmt(t, 30 + i), look: [1, 0] }));
      mg.f.set(t, { smile: -.6, talk: .6 * talkAmt(t, 16) * sm(P(3.5, 4.5, t)), look: [-1, 0] });
      hs.forEach(h => { h.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      cx.set([SX + .9, 2.1, .8], popE(P(5.0, 6.0, t)) * .8, 0);
      cnt.set([-2.8, 2.9 + bob(t, 4), .4], popE(P(4.2, 5.2, t)));
      m.set(.6);
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-1.2, 1.2, 0], { dur: w[0], dist0: 10.0, dist1: 9.8, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.6, 0, 0] }), 51)],
      [w[1], HH(punch(insert([LX[1], 2.2, 0], { dur: w[1], dist0: 5.8, dist1: 5.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 40, fov1: 40 }), [1.6, 3.0]), 52)],
      [w[2], HH(crane([MX - .4, 1.4, 0], { dur: w[2], dist0: 6.4, dist1: 5.6, h0: .6, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 53)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): the label "שלושה מפרסמים" gets a strike-through line; the scroll rolls itself shut with a lock; the megaphone shrinks away
  function beat6(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, [0xf2b8a2, 0xcfe6ff, 0xd9f2c8][i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const mg = megaphone(Wd, [SX + .9, TOP, .5]); mg.g.rotation.y = -.5;
    const shields = LX.map(x => tag(Wd, .95, .26, 'שומר לשון', '#e8fff0', '#1f6a2a', '#3f9a4a'));
    const lab = tag(Wd, 2.2, .42, 'שלושה מפרסמים', '#fff6d6', '#5a3a10', '#c9a050');
    const strike = box(2.0, .025, .05, RED); Wd.add(strike); strike.visible = false; strike.material.transparent = true; strike.material.opacity = .7;
    const m = meter(Wd, [7.6, .7, .15]);
    Wd.occ = [sc.g, cups[0].g, cups[1].g, cups[2].g, mg.g, hs[0].g]; Wd.center = [-.4, 1.2];
    Wd.on(t => {
      LX.forEach((x, i) => shields[i].set([x, 2.5 + bob(t, i), .4], 0));
      cups.forEach((c, i) => c.f.set(t, { smile: .3, talk: .3 * talkAmt(t, 36 + i), look: [1, 0] }));
      lab.set([SX, 3.1 + bob(t, 6), .4], popE(P(.4, 1.2, t)));
      const st = sm(P(1.6, 2.8, t));
      strike.visible = st > .01;
      strike.position.set(SX, 3.1 + bob(t, 6), .45);
      strike.scale.x = Math.max(.001, st);
      sc.f.set(t, { smile: .4, talk: 0, look: [0, 0] });
      const roll = sm(P(3.6, 5.2, t));
      sc.body.scale.y = lerp(1, .78, roll);
      sc.body.position.y = .55 * lerp(1, .78, roll);
      sc.lock.visible = roll > .5;
      sc.lock.position.y = .3 * lerp(1, .78, roll);
      mg.g.scale.setScalar(Math.max(.001, 1 - sm(P(5.0, 7.0, t))));
      mg.f.set(t, { smile: -.8, talk: 0, look: [-1, 0] });
      m.set(lerp(.6, 1, sm(P(2.0, 9.0, t))));
    });
    const w = split(dur, [8, 6]);
    Wd.cam = cuts([
      [w[0], HH(insert([SX, 2.75, 0], { dur: w[0], dist0: 3.0, dist1: 2.8, h0: 2.9, h1: 3.0, a0: -4, a1: 4, fov0: 40, fov1: 38 }), 41)],
      [w[1], HH(punch(truck([SX, 1.4, 0], { dur: w[1], dist0: 7.2, dist1: 6.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40, shift: [.6, 0, 0] }), [2.8]), 42)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): the scroll closed with its lock in the middle-bottom, the listeners at the sides, a green check, slow crane
  function answer(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [-2.0, TOP, 1.5]);
    sc.lock.visible = true; sc.lock.position.y = .3;
    sc.body.scale.y = .78; sc.body.position.y = .43;
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, [0xf2b8a2, 0xcfe6ff, 0xd9f2c8][i]));
    cups[1].g.position.z = -.8;
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    hs.forEach(h => lightHouse(h, 0));
    const bt = tag(Wd, 2.6, .55, 'שומרי לשון', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const m = meter(Wd, [7.6, .7, .15]);
    const ck = mark3d(Wd, 'check', 1.1);
    Wd.occ = [sc.g, cups[0].g, cups[2].g]; Wd.center = [-2.0, 1.0]; Wd.ansD = 6.4;
    Wd.on(t => {
      sc.f.set(t, { smile: .8, talk: .3 * talkAmt(t, 37), look: [0, 0] });
      cups.forEach((c, i) => c.f.set(t, { smile: 1, talk: .4 * talkAmt(t, 30 + i), look: [i < 2 ? 1 : -1, 0] }));
      hs.forEach((h, i) => h.f.set(t, { smile: .6, talk: 0, look: [0, 0] }));
      m.set(.9);
      bt.set([-2.0, 3.4 + bob(t, 1), .4], 0);
      ck.set([-2.0 + 1.2, 2.6, .5], popE(P(.5, 1.5, t)) * .45, 0);
    });
    Wd.camAns = cuts([[dur, HH(crane([-2.0, 1.2, 0], { dur, dist0: 10.0, dist1: 8.2, h0: .8, h1: 2.4, a0: 6, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
