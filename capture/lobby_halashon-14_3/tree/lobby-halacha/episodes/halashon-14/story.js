// halashon-14 story: "Warned 'don't reveal' - even after one or two were told, the third may not" (storyboards_v15.md, section B).
// Talking objects only, NO people. Adapted from halashon-13.
// Heroes: THE SCROLL (the secret, face), THREE LISTENER CUPS (each with a gold LOCK RING), a PADLOCK BUBBLE "אל תגלו",
// a MEGAPHONE (the gossip), three SHIMON HOUSES (the town). Moving diagram: dotted arcs (the rumour) from listeners to houses,
// rings crack and fall, counters, red crosses, shield tag, scroll closes with a lock.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, arcPt, FONT, fitText } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const split = (dur, ws) => { const tot = ws.reduce((a, b) => a + b, 0); return ws.map(w => dur * w / tot); };
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .05;
  const GOLD = 0xf2c14e, GREEN = 0x2fbf5b, RED = 0xe03131, PAPER = 0xf4e4b8, LIT = 0xffd166;
  const C_GOOD = new THREE.Color(GREEN), C_BAD = new THREE.Color(RED);
  const TOP = .99;                    // table top surface (table = box at y .9, thickness .18)
  const LX = [-4.9, -2.8, -0.7];      // the three listeners
  const LCOL = [0xf2b8a2, 0xcfe6ff, 0xd9f2c8];
  const SX = 0.6;                     // the scroll (the secret), on the table right of the listeners
  const MX = 2.6;                     // the megaphone, on the table
  const CEN = [-2.8, TOP + 1.1, 0];   // spreading point above the middle listener
  const HX = [4.4, 5.4, 6.4];         // three houses of the town, on the floor
  // crowd for beat 2: 6 in the front row, 4 behind (z -0.9); index 7 is the one who "opens his mouth"
  const CROWD = [[-6.0, 0], [-4.9, 0], [-3.8, 0], [-2.8, 0], [-1.7, 0], [-0.7, 0],
                 [-5.3, -.9], [-3.8, -.9], [-2.3, -.9], [-0.8, -.9]];
  const TALKER = 7;
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

  // ---------------------------------------------------------------- listener cup (face on the +z side) with a small LOCK badge on top
  function cup(Wd, x, seed, col, z = 0) {
    const g = new THREE.Group(); g.position.set(x, TOP, z); Wd.add(g);
    const sau = cyl(.62, .62, .07, 0xf4f1ea); sau.position.y = .035; g.add(sau);
    const body = cyl(.42, .34, .8, col); body.position.y = .47; g.add(body);
    const rim = cyl(.44, .42, .06, 0xfff7e8); rim.position.y = .87; g.add(rim);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .5, .41], seed });
    const lock = new THREE.Group(); lock.position.set(0, 1.08, .3); g.add(lock);
    const lb = box(.3, .22, .12, GOLD); lb.position.y = 0; lock.add(lb);
    const ls = cyl(.07, .07, .14, GOLD); ls.position.y = .17; lock.add(ls);
    return { g, body, f, lock };
  }

  // ---------------------------------------------------------------- the padlock RING: a gold band around the cup's neck (horizontal torus)
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

  // ---------------------------------------------------------------- the MEGAPHONE gossip-trumpet, face on the front
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

  // ================================================================ HOOK (14 s): extreme close-up of the scroll whispering, pulls out; padlock bubble above the three; arrows already going out from listeners 1 and 2; "?" over listener 3
  function hook(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, LCOL[i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const ar = [arc(Wd, [LX[0], TOP + 1.1, 0], [HX[0], 1.4, 0], 1.3, 6), arc(Wd, [LX[1], TOP + 1.1, 0], [HX[1], 1.4, 0], 1.3, 6)];
    const bub = tag(Wd, 2.6, .6, 'אל תגלו', '#ffe3e3', '#8a1010', '#c43030');
    const qq = tag(Wd, .8, .8, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    Wd.qPos = [LX[2], 0];
    Wd.occ = [sc.g, cups[2].g, bub.g]; Wd.center = [-.8, 1.2];
    Wd.on(t => {
      sc.g.rotation.z = .04 * Math.sin(t * 2);
      sc.f.set(t, { smile: -.6, talk: .5 * talkAmt(t, 2), look: [0, 0] });
      cups.forEach((c, i) => c.f.set(t, { smile: .1, talk: .4 * talkAmt(t, 10 + i), look: [-1, 0] }));
      hs.forEach(h => h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
      ar.forEach(a => a(1));
      bub.set([-2.8, 3.3 + bob(t, 1), .4], popE(P(.8, 1.6, t)));
      qq.set([LX[2], 2.5 + bob(t, 3), .4], popE(P(1.0, 1.8, t)));
    });
    const w = split(dur, [5, 4.5, 4.5]);
    Wd.cam = cuts([
      [w[0], HH(pullOut([SX, 1.1, 0], { dur: w[0], dist0: 1.0, dist1: 5.5, h0: .3, h1: 1.8, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-1.2, 1.2, 0], { dur: w[1], dist0: 7.5, dist1: 7.2, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), 52)],
      [w[2], HH(pushIn([SX, 1.2, 0], { dur: w[2], dist0: 6.0, dist1: 4.6, h0: .8, h1: .7, a0: 6, a1: -8, fov0: 42, fov1: 40 }), 53)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, bad): the scroll speaks; three dotted arcs reach the three listeners; the padlock bubble pops above them (punch); a gold lock ring settles on each neck
  function beat1(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, LCOL[i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const arcs = LX.map(x => arc(Wd, [SX, TOP + 1.1, 0], [x, TOP + 1.0, 0], .9, 6));
    const rings = LX.map(x => ring(Wd, x, 0));
    const bub = tag(Wd, 2.6, .6, 'אל תגלו', '#ffe3e3', '#8a1010', '#c43030');
    Wd.occ = [sc.g, cups[0].g, cups[1].g, cups[2].g, hs[0].g]; Wd.center = [-1.0, 1.2];
    Wd.on(t => {
      sc.f.set(t, { smile: -.6, talk: .8 * talkAmt(t, 7), look: [1, 0] });
      cups.forEach(c => c.f.set(t, { smile: .1, talk: 0, look: [1, 0] }));
      hs.forEach(h => { h.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      arcs.forEach((a, i) => a(sm(P(1.4 + i * .8, 2.6 + i * .8, t))));
      bub.set([-2.8, 3.3 + bob(t, 1), .4], popE(P(.6, 1.4, t)));
      rings.forEach((r, i) => {
        const a = sm(P(3.0 + i * 1.2, 4.4 + i * 1.2, t));
        r.visible = a > .01;
        r.position.set(LX[i], TOP + .92, 0);
        r.scale.setScalar(lerp(1.9, 1, a));
      });
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(punch(truck([-1.0, 1.2, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.6, 0, 0] }), [1.0]), 1)],
      [w[1], HH(punch(truck([-1.0, 1.4, 0], { dur: w[1], dist0: 9.5, dist1: 9.2, h0: 1.5, h1: 1.5, a0: 6, a1: -6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), [2.4]), 2)],
      [w[2], HH(crane([-1.0, 1.2, 0], { dur: w[2], dist0: 10.0, dist1: 8.6, h0: .4, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 3)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, bad): wide - many more listeners crowd around, label "בפני רבים"; the lock rings stay; one of them opens its mouth: red cross + tag "לשון הרע"
  function beat2(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = CROWD.map(([x, z], i) => cup(Wd, x, i + 1, LCOL[i % 3], z));
    const rings = CROWD.map(([x, z]) => ring(Wd, x, z));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const cnt = tag(Wd, 2.8, .55, 'בפני רבים', '#f2c14e', '#3a2600', '#8a5a00');
    const bad = tag(Wd, 2.4, .5, 'לשון הרע', '#ffe3e3', '#8a1010', '#c43030');
    const cx = mark3d(Wd, 'cross', 1.5), sk = shock(Wd, 0xff7a7a);
    const tx = CROWD[TALKER][0];
    Wd.occ = [sc.g, cups[0].g, cups[3].g, cups[TALKER].g, hs[0].g]; Wd.center = [-2.0, 1.2];
    Wd.on(t => {
      sc.f.set(t, { smile: .2, talk: 0, look: [-1, 0] });
      cups.forEach((c, i) => {
        const talker = i === TALKER;
        c.f.set(t, {
          smile: talker ? -.8 : .3,
          talk: talker ? .9 * talkAmt(t, 40) * sm(P(2.6, 3.0, t)) * (1 - sm(P(4.2, 4.8, t))) : 0,
          surprise: talker ? sm(P(3.0, 3.6, t)) : 0,
          look: [-1, 0]
        });
      });
      rings.forEach((r, i) => {
        r.visible = true;
        r.position.set(CROWD[i][0], TOP + .92, CROWD[i][1]);
        r.scale.setScalar(1 + .04 * Math.sin(t * 3 + i));
      });
      hs.forEach(h => { h.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      cnt.set([-4.4, 3.0 + bob(t, 5), .4], popE(P(.4, 1.2, t)));
      bad.set([tx, 3.5 + bob(t, 4), .2], popE(P(3.0, 3.8, t)));
      cx.set([tx, 2.7, .2], popE(P(2.9, 3.6, t)) * .9, .05 * Math.sin(t * 4) * (t > 3.6 ? 1 : 0));
      sk.set([tx, 2.7, .2], P(2.9, 3.6, t), 1.2);
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-2.0, 1.2, 0], { dur: w[0], dist0: 15, dist1: 14, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [w[1], HH(punch(insert([tx, 2.2, 0], { dur: w[1], dist0: 5.4, dist1: 5.0, h0: 1.5, h1: 1.8, a0: -8, a1: 8, fov0: 40, fov1: 38 }), [.3]), 22)],
      [w[2], HH(crane([-2.4, 1.4, 0], { dur: w[2], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 23)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): insert on listener 2 - a tiny word-bubble slips out sideways (label "במקרה"); a red cross stamps it; the bubble shrinks back into the cup
  function beat3(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, LCOL[i]));
    const rings = LX.map(x => ring(Wd, x, 0));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const slip = tag(Wd, .9, .45, 'מה?', '#ffffff', '#222222', '#8a8a8a');
    const lab = tag(Wd, 2.0, .5, 'במקרה', '#fff6d6', '#5a3a10', '#c9a050');
    const cx = mark3d(Wd, 'cross', 1.3), sk = shock(Wd, 0xff7a7a);
    const SLIP_X = LX[1] + .45, STAMP_X = SLIP_X + 1.3;
    Wd.occ = [sc.g, cups[0].g, cups[1].g, cups[2].g, hs[0].g]; Wd.center = [-1.6, 1.2];
    Wd.on(t => {
      const out = sm(P(.6, 2.0, t)), back = sm(P(3.0, 4.0, t)), k = out * (1 - back);
      slip.set([SLIP_X + 1.3 * k, 1.5 + .25 * k + .03 * Math.sin(t * 6), .5], Math.max(.001, k));
      lab.set([LX[1], 2.5 + bob(t, 1), .4], popE(P(.5, 1.2, t)) * (1 - sm(P(4.8, 5.6, t))));
      cx.set([STAMP_X, 1.6, .5], popE(P(2.6, 3.2, t)) * .8, 0);
      sk.set([STAMP_X, 1.6, .5], P(2.6, 3.2, t), 1.2);
      sc.f.set(t, { smile: -.6, talk: .5 * talkAmt(t, 7), look: [1, 0] });
      cups.forEach((c, i) => c.f.set(t, {
        smile: i === 1 ? -.8 : .2,
        talk: i === 1 ? .9 * talkAmt(t, 44) * out * (1 - back) : 0,
        surprise: i === 1 ? sm(P(2.6, 3.0, t)) : 0,
        look: [1, 0]
      }));
      rings.forEach((r, i) => { r.visible = true; r.position.set(LX[i], TOP + .92, 0); r.scale.setScalar(1 + .04 * Math.sin(t * 3 + i)); });
      hs.forEach(h => { h.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-1.0, 1.2, 0], { dur: w[0], dist0: 12, dist1: 11.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.6, 0, 0] }), 31)],
      [w[1], HH(punch(insert([LX[1] + .6, 1.8, 0], { dur: w[1], dist0: 5.6, dist1: 5.2, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 40, fov1: 38 }), [.3]), 32)],
      [w[2], HH(crane([-1.6, 1.2, 0], { dur: w[2], dist0: 8.0, dist1: 7.2, h0: .6, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 33)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, bad->turn): listeners 1 and 2 break their lock rings (rings shake, crack and fall); arrows run to two houses which light up; a question mark grows over listener 3
  function beat4(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, LCOL[i]));
    const rings = LX.map(x => ring(Wd, x, 0));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const ar = [arc(Wd, [LX[0], TOP + 1.1, 0], [HX[0], 1.4, 0], 1.3, 6), arc(Wd, [LX[1], TOP + 1.1, 0], [HX[1], 1.4, 0], 1.3, 6)];
    const qq = tag(Wd, .8, .8, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    Wd.occ = [sc.g, cups[2].g, hs[0].g, hs[1].g]; Wd.center = [-.6, 1.4];
    Wd.on(t => {
      sc.f.set(t, { smile: .4, talk: .5 * talkAmt(t, 9), look: [0, 0] });
      cups.forEach((c, i) => c.f.set(t, {
        smile: i < 2 ? .8 * sm(P(3.6, 4.6, t)) : -.2,
        talk: i < 2 ? .3 * talkAmt(t, 46 + i) * sm(P(3.6, 4.2, t)) : 0,
        look: [i < 2 ? 1 : -1, 0]
      }));
      rings.forEach((r, i) => {
        if (i < 2) {
          const crack = sm(P(1.0 + i * .4, 2.0 + i * .4, t)), fall = sm(P(2.4 + i * .4, 3.8 + i * .4, t));
          const shake = Math.sin(t * 40) * .025 * (crack > 0 && fall < 1 ? 1 : 0);
          r.visible = fall < .99;
          r.position.set(LX[i] + shake, TOP + .92 - 2.6 * fall, 0);
          r.rotation.set(PI / 2 + 1.1 * fall, 0, 0);
          r.scale.setScalar(1 + .04 * Math.sin(t * 3 + i));
        } else {
          r.visible = true; r.position.set(LX[i], TOP + .92, 0);
          r.scale.setScalar(1 + .04 * Math.sin(t * 3 + i));
        }
      });
      ar[0](sm(P(3.2, 4.2, t)), RED);
      ar[1](sm(P(3.8, 4.8, t)), RED);
      lightHouse(hs[0], sm(P(4.2, 5.0, t)));
      lightHouse(hs[1], sm(P(4.8, 5.6, t)));
      lightHouse(hs[2], 0);
      hs.forEach((h, i) => h.f.set(t, { smile: -.2 + .8 * sm(P(4.2 + i * .6, 5.4 + i * .6, t)), talk: 0, look: [-1, 0] }));
      qq.set([LX[2], 2.6 + bob(t, 3), .4], popE(P(4.2, 6.0, t)) * (1 + .1 * Math.sin(t * 3)));
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([.8, 1.2, 0], { dur: w[0], dist0: 14, dist1: 13.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.6, 0, 0] }), 51)],
      [w[1], HH(punch(insert([-2.2, 1.6, 0], { dur: w[1], dist0: 8.5, dist1: 8.0, h0: 1.3, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [2.4]), 52)],
      [w[2], HH(crane([3.0, 1.4, 0], { dur: w[2], dist0: 12, dist1: 10, h0: .6, h1: 1.8, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 53)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): the megaphone leans in to listener 3 ("כולם כבר יודעים!"); listener 3's gold ring glows red; red cross on the megaphone; tag "השלישי - אסור"
  function beat5(dur) {
    const Wd = mkWorld({}); base(Wd);
    const mg = megaphone(Wd, [MX, TOP, .9]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, LCOL[i]));
    const r3 = ring(Wd, LX[2], 0);
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const bub = tag(Wd, 2.8, .55, 'כולם כבר יודעים!', '#fff6d6', '#5a3a10', '#c9a050');
    const bad = tag(Wd, 2.8, .5, 'השלישי - אסור', '#ffe3e3', '#8a1010', '#c43030');
    const cx = mark3d(Wd, 'cross', 1.5), sk = shock(Wd, 0xff7a7a);
    const goldC = new THREE.Color(GOLD), redC = new THREE.Color(RED);
    Wd.occ = [cups[2].g, mg.g, hs[0].g]; Wd.center = [-.4, 1.2];
    Wd.on(t => {
      const lean = sm(P(.5, 2.6, t));
      mg.g.position.x = lerp(MX, LX[2] + 1.3, lean);
      mg.g.position.z = lerp(.9, .6, lean);
      mg.g.rotation.y = lerp(0, -.5, lean);
      mg.f.set(t, { smile: .4, talk: .9 * talkAmt(t, 14) * lean, look: [-1, 0] });
      const mx = mg.g.position.x;
      bub.set([mx + .3, 2.5 + bob(t, 2), .6], popE(P(1.0, 1.8, t)));
      const slam = popE(P(3.0, 3.8, t));
      cx.set([mx, 2.4, .8], slam * .8, .05 * Math.sin(t * 4) * (t > 3.8 ? 1 : 0));
      sk.set([mx, 2.2, .8], P(3.0, 3.8, t), 1.3);
      bad.set([LX[2], 3.2 + bob(t, 3), .4], popE(P(4.2, 5.2, t)));
      const glow = sm(P(2.0, 3.0, t));
      r3.visible = true;
      r3.position.set(LX[2], TOP + .92, 0);
      r3.material.color.lerpColors(goldC, redC, glow);
      r3.scale.setScalar(1 + .12 * glow * Math.sin(t * 8) + .03);
      cups.forEach((c, i) => c.f.set(t, {
        smile: i === 2 ? -.6 : -.2,
        talk: 0,
        surprise: i === 2 ? sm(P(3.6, 4.6, t)) : 0,
        look: [1, 0]
      }));
      hs.forEach(h => { h.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-.8, 1.2, 0], { dur: w[0], dist0: 10.5, dist1: 10.2, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [.6, 0, 0] }), 61)],
      [w[1], HH(punch(insert([LX[2] + .5, 2.0, 0], { dur: w[1], dist0: 5.8, dist1: 5.4, h0: 1.4, h1: 1.5, a0: -8, a1: 8, fov0: 40, fov1: 38 }), [.4]), 62)],
      [w[2], HH(crane([MX - .4, 1.4, 0], { dur: w[2], dist0: 7.0, dist1: 6.2, h0: .6, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 40 }), 63)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, good): listener 3 smiles; a shield tag "שומר" grows on it; an arrow toward a house bounces back (shock); the scroll rolls shut with a lock; green check
  function beat6(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [SX, TOP, 0]);
    const cups = LX.map((x, i) => cup(Wd, x, i + 1, LCOL[i]));
    const hs = HX.map((x, i) => house(Wd, x, 6 + i, 0xcfe6ff, 0x2f5fa0));
    const r3 = ring(Wd, LX[2], 0);
    const shield = tag(Wd, 1.3, .4, 'שומר', '#e8fff0', '#1f6a2a', '#3f9a4a');
    const arcBack = arc(Wd, [LX[2] + .4, TOP + 1.1, 0], [HX[2], 1.4, 0], 1.3, 6);
    const bounce = shock(Wd, 0x9fe8b5);
    const ck = mark3d(Wd, 'check', 1.4);
    Wd.occ = [sc.g, cups[0].g, cups[2].g, hs[0].g]; Wd.center = [-.4, 1.2];
    Wd.on(t => {
      const out = sm(P(1.6, 3.2, t)), back = sm(P(3.4, 4.6, t));
      arcBack(out * (1 - back), GREEN);
      bounce.set([LX[2] + .9, TOP + 1.2, .5], P(3.2, 4.0, t), 1.3);
      shield.set([LX[2], 2.6 + bob(t, 2), .4], popE(P(.8, 2.0, t)));
      const roll = sm(P(4.8, 6.4, t));
      sc.body.scale.y = lerp(1, .78, roll);
      sc.body.position.y = .55 * lerp(1, .78, roll);
      sc.lock.visible = roll > .5;
      sc.lock.position.y = .3 * lerp(1, .78, roll);
      sc.f.set(t, { smile: .4 * sm(P(4.8, 6.0, t)), talk: 0, look: [0, 0] });
      cups.forEach((c, i) => c.f.set(t, { smile: i === 2 ? .8 * sm(P(.2, 1.2, t)) + .2 : -.2, talk: 0, look: [1, 0] }));
      r3.visible = true; r3.position.set(LX[2], TOP + .92, 0);
      r3.material.color.set(GREEN);
      r3.scale.setScalar(1 + .04 * Math.sin(t * 3));
      hs.forEach(h => { h.f.set(t, { smile: -.6, talk: 0, look: [-1, 0] }); lightHouse(h, 0); });
      ck.set([SX, 2.7, .5], popE(P(6.6, 7.6, t)) * .9, .04 * Math.sin(t * 3));
    });
    const w = split(dur, [8, 6]);
    Wd.cam = cuts([
      [w[0], HH(punch(insert([(LX[2] + SX) / 2, 1.9, 0], { dur: w[0], dist0: 4.6, dist1: 4.4, h0: 1.7, h1: 1.9, a0: -4, a1: 4, fov0: 40, fov1: 38 }), [7.0]), 71)],
      [w[1], HH(pullOut([SX, 1.4, 0], { dur: w[1], dist0: 7.0, dist1: 8.0, h0: 1.1, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 72)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): the closed scroll with its lock on the left, listener 3 smiling on the right, a green check, slow crane at morning light
  function answer(dur) {
    const Wd = mkWorld({}); base(Wd);
    const sc = scroll(Wd, [-4.6, TOP, 1.0]);
    sc.lock.visible = true; sc.lock.position.y = .3;
    sc.body.scale.y = .78; sc.body.position.y = .43;
    const c3 = cup(Wd, 2.2, 3, LCOL[2], .3);
    const r3 = ring(Wd, 2.2, .3);
    const bt = tag(Wd, 2.6, .55, 'שומר לשון', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const ck = mark3d(Wd, 'check', 1.1);
    Wd.occ = [sc.g, c3.g]; Wd.center = [-1.4, 1.0]; Wd.ansD = 6.4;
    Wd.on(t => {
      sc.f.set(t, { smile: .8, talk: .3 * talkAmt(t, 37), look: [1, 0] });
      c3.f.set(t, { smile: 1, talk: .4 * talkAmt(t, 30), look: [-1, 0] });
      r3.visible = true; r3.position.set(2.2, TOP + .92, .3);
      r3.material.color.set(GREEN);
      r3.scale.setScalar(1 + .04 * Math.sin(t * 3));
      bt.set([-4.6, 3.4 + bob(t, 1), 1.0], popE(P(.4, 1.2, t)));
      ck.set([2.2, 2.7, .5], popE(P(.5, 1.5, t)) * .45, 0);
    });
    Wd.camAns = cuts([[dur, HH(crane([-1.4, 1.2, 0], { dur, dist0: 10.0, dist1: 8.2, h0: .8, h1: 2.4, a0: 6, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
