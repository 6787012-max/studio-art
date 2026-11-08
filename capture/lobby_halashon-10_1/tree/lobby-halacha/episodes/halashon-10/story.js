// halashon-10 story: "What is allowed in front of three" (Chafetz Chaim 2:2). Storyboard B (storyboards_v11.md). Talking objects only, NO people.
// Heroes: THE WORD (speech bubble), THE TWO-FACED CUBE (green smile side / grey frown side), THREE LISTENER HOUSES, THE GOOD NAME (gold badge, far right).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, arcPt, FONT, fitText } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const split = (dur, ws) => { const tot = ws.reduce((a, b) => a + b, 0); return ws.map(w => dur * w / tot); };
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .06;
  const GOLD = 0xf2c14e, GREEN = 0x2fbf5b, RED = 0xe03131, CUBE_GREY = 0x9aa0a8;
  const HX = [-2.2, 0, 2.2];                                   // three houses (row on the map)
  const HCOL = [0xf2b8a2, 0xbfe3c0, 0xb8d4f2], HROOF = [0xb5472f, 0x2f7a4a, 0x2f5fa0];
  const BUB = [-3.7, 1.6, .4];                                  // word bubble home (left)
  const BADGE = [5.2, 1.0, 0];                                  // the friend's good name (far right)
  const C_DIRTY = new THREE.Color(0x6f7682), C_CLEAN = new THREE.Color(0xfbfdff);
  const C_GOLD = new THREE.Color(GOLD), C_GLOW = new THREE.Color(0xfff3a0);
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

  // ---------------------------------------------------------------- set: floor + back wall (warm)
  function base(Wd) {
    const fl = box(16, .2, 9, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(16, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    Wd.center = [0, 0];
  }

  // ---------------------------------------------------------------- listener house (face on the front = +z)
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

  // ---------------------------------------------------------------- THE GOOD NAME: gold badge with a face and two ear tabs
  function badge(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    const disc = cyl(.8, .8, .14, GOLD); disc.rotation.x = PI / 2; g.add(disc);
    const earL = ball(.2, GOLD); earL.position.set(-.85, 0, 0); g.add(earL);
    const earR = ball(.2, GOLD); earR.position.set(.85, 0, 0); g.add(earR);
    const f = face(Wd, { w: .9, parent: g, pos: [0, 0, .08], seed: 5 });
    return { g, earL, earR, f };
  }

  // ================================================================ HOOK (14 s): three houses, big "3" floats, the word wonders with a "?"
  function hook(dur) {
    const Wd = mkWorld({}); base(Wd);
    const hs = HX.map((x, i) => house(Wd, x, i + 1, HCOL[i], HROOF[i]));
    const bub = bubble(Wd, BUB, 0xffffff);
    const big = tag(Wd, 1.3, 1.3, '3', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    Wd.qPos = [BUB[0], BUB[2]];
    Wd.occ = [hs[0].g, hs[1].g, hs[2].g, bub.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      big.set([0, 3.0 + bob(t, 1), .3], popE(P(.4, 1.4, t)));
      bub.g.position.y = BUB[1] + bob(t, 2);
      bub.f.set(t, { talk: .9 * talkAmt(t, 4), smile: .3, look: [.6, 0] });
      hs.forEach(h => h.f.set(t, { smile: .4, look: [-.4, 0], talk: 0 }));
    });
    const w = split(dur, [5, 4.5, 4.5]);
    Wd.cam = cuts([
      [w[0], HH(pullOut(BUB, { dur: w[0], dist0: 1.5, dist1: 4.4, h0: .25, h1: 1.1, a0: 6, a1: -6, fov0: 36, fov1: 42 }), 1)],
      [w[1], HH(truck([0, 1.3, 0], { dur: w[1], dist0: 9.0, dist1: 9.6, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.3, 0, 0] }), 2)],
      [w[2], HH(pushIn([.2, 1.4, 0], { dur: w[2], dist0: 5.2, dist1: 4.2, h0: .8, h1: .6, a0: 10, a1: -4, fov0: 42, fov1: 40 }), 3)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s): the golden "3" lands above the three houses; each house lights up in turn (1, 2, 3)
  function beat1(dur) {
    const Wd = mkWorld({}); base(Wd);
    const hs = HX.map((x, i) => house(Wd, x, i + 1, HCOL[i], HROOF[i]));
    const gl = hs.map(h => { const s = glowAt(h.g, 2.6, 0xffe08a, 0); s.position.set(0, .5, .3); return s; });
    const cnt = HX.map((x, i) => tag(Wd, .6, .6, String(i + 1), TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]));
    const big = tag(Wd, 1.3, 1.3, '3', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const bub = bubble(Wd, BUB, 0xffffff);
    Wd.occ = [hs[0].g, hs[1].g, hs[2].g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      big.set([0, lerp(4.6, 2.75, ease.out(P(.4, 1.4, t))) + bob(t, 1), .3], popE(P(.3, 1.1, t)));
      hs.forEach((h, i) => {
        const u = P(2 + i * 2.6, 2.6 + i * 2.6, t);
        gl[i].material.opacity = .75 * u;
        cnt[i].set([HX[i], 1.85 + .04 * Math.sin(t * 2 + i), .3], popE(u));
        h.f.set(t, { smile: .3 + .6 * u, look: [0, 0], talk: 0 });
      });
      bub.g.position.y = BUB[1] + bob(t, 2);
      bub.f.set(t, { talk: t > 9 ? .8 * talkAmt(t, 6) : 0, smile: .4, look: [.6, 0] });
    });
    const w = split(dur, [4.5, 4.5, 5]);
    Wd.cam = cuts([
      [w[0], HH(punch(truck([0, 1.2, 0], { dur: w[0], dist0: 10.5, dist1: 9.5, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.2, 0, 0] }), [1.3]), 4)],
      [w[1], HH(insert([0, 1.5, 0], { dur: w[1], dist0: 6.4, dist1: 5.6, h0: .6, h1: .8, a0: -12, a1: 10, fov0: 40, fov1: 38 }), 5)],
      [w[2], HH(crane([0, 2.2, 0], { dur: w[2], dist0: 6.0, dist1: 4.6, h0: .3, h1: 1.6, a0: 8, a1: -4, fov0: 42, fov1: 40 }), 6)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, good): a meter with two zones; the needle settles in "not a full disgrace" (green)
  function beat2(dur) {
    const Wd = mkWorld({}); base(Wd);
    const gz = box(1.6, .45, .22, GREEN); gz.position.set(-.8, 1.4, .02); Wd.add(gz);
    const rz = box(1.6, .45, .22, RED); rz.position.set(.8, 1.4, .02); Wd.add(rz);
    const nd = ball(.22, 0xffffff); Wd.add(nd);
    const gT = tag(Wd, 1.9, .6, 'לא גנאי גמור', '#e8fff0', '#1f6a2a', '#3f9a4a');
    const rT = tag(Wd, 1.9, .6, 'גנאי גמור', '#ffe3e3', '#8a1010', '#c43030');
    const bub = bubble(Wd, BUB, 0xffffff);
    Wd.occ = [bub.g, gT.g]; Wd.center = [-1.0, 1.2];
    Wd.on(t => {
      const u = ease.io(P(1.6, 3.8, t));
      nd.position.set(lerp(1.2, -.6, u) + .03 * Math.sin(t * 9) * (1 - u), 1.4, .28);
      nd.scale.setScalar(popE(P(.6, 1.2, t)));
      gT.set([-1.0, 2.2, 0], popE(P(.2, 1.0, t)));
      rT.set([1.0, 2.2, 0], popE(P(.2, 1.0, t)));
      bub.g.position.y = BUB[1] + bob(t, 2);
      bub.f.set(t, { smile: -.2 + 1.2 * sm(P(3.5, 5.0, t)), talk: .6 * talkAmt(t, 5) * sm(P(.5, 1.5, t)), look: [1, 0] });
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-.5, 1.4, 0], { dur: w[0], dist0: 9.5, dist1: 8.5, h0: 1.2, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.3, 0, 0] }), 7)],
      [w[1], HH(insert([-.8, 1.5, 0], { dur: w[1], dist0: 5.0, dist1: 4.2, h0: .5, h1: .7, a0: 6, a1: -8, fov0: 40, fov1: 38 }), 8)],
      [w[2], HH(crane([-2.4, 1.4, 0], { dur: w[2], dist0: 5.0, dist1: 6.0, h0: .4, h1: 1.8, a0: -10, a1: 4, fov0: 40, fov1: 42 }), 9)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, good): the two-faced cube spins: smiling green side ("לטובה"), then the grey frowning side ("לרעה")
  function beat3(dur) {
    const Wd = mkWorld({}); base(Wd);
    const cube = new THREE.Group(); cube.position.set(0, 2.0, 0); Wd.add(cube);
    cube.add(box(1.0, 1.0, 1.0, CUBE_GREY));
    const plate = box(.98, .98, .04, 0x14c24a); plate.material.emissive.set(0x0b5e24); plate.position.z = .515; cube.add(plate);
    const bk = new THREE.Group(); bk.rotation.y = PI; cube.add(bk);
    const fF = face(Wd, { w: .62, parent: cube, pos: [0, 0, .53], seed: 2 });
    const fB = face(Wd, { w: .62, parent: bk, pos: [0, 0, .53], seed: 7 });
    const bub = bubble(Wd, BUB, 0xffffff);
    const T1 = tag(Wd, 1.8, .6, 'לטובה', '#e8fff0', '#1f6a2a', '#3f9a4a');
    const T2 = tag(Wd, 1.8, .6, 'לרעה', '#ffe3e3', '#8a1010', '#c43030');
    Wd.occ = [cube, bub.g]; Wd.center = [-.8, 1.2];
    Wd.on(t => {
      const rot = .6 * t; cube.rotation.y = rot;
      const c = Math.cos(rot);
      fF.set(t, { smile: 1, talk: .8 * talkAmt(t, 2), look: [0, 0] });
      fB.set(t, { smile: -.6, talk: 0, look: [0, 0] });
      T1.set([-1.3, 2.0 + bob(t, 3), .4], popE(P(.2, 1.0, t)) * (c > 0 ? 1 : .55), 1);
      T2.set([1.3, 2.0 + bob(t, 3), .4], popE(P(.2, 1.0, t)) * (c < 0 ? 1 : .55), 1);
      bub.g.position.y = BUB[1] + bob(t, 2);
      bub.f.set(t, { smile: .5, talk: 0, look: [.8, 0] });
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([0, 1.0, 0], { dur: w[0], dist0: 11.0, dist1: 10.5, h0: 1.4, h1: 1.6, a0: -10, a1: 10, fov0: 42, fov1: 42 }), 10)],
      [w[1], HH(insert([0, 1.5, 0], { dur: w[1], dist0: 5.6, dist1: 5.0, h0: .6, h1: .7, a0: -18, a1: 18, fov0: 38, fov1: 36 }), 11)],
      [w[2], HH(pullOut([0, 1.2, 0], { dur: w[2], dist0: 5.0, dist1: 8.0, h0: .6, h1: 1.2, a0: 8, a1: -8, fov0: 38, fov1: 44 }), 12)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (16 s): dotted arcs travel from the three houses along the map to the good name's ears
  function beat4(dur) {
    const Wd = mkWorld({}); base(Wd);
    const hs = HX.map((x, i) => house(Wd, x, i + 1, HCOL[i], HROOF[i]));
    const bg = badge(Wd, BADGE);
    const bt = tag(Wd, 2.0, .6, 'שם טוב', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const bub = bubble(Wd, [-5.0, 1.6, .4], 0xffffff);
    const EAR = [BADGE[0] - .85, BADGE[1], .4];
    const from = HX.map(x => [x, 1.7, .5]);
    const stat = [], mov = [];
    for (let j = 0; j < 3; j++) {
      for (let k = 1; k <= 8; k++) { const d = ball(.04, 0xffe9a8); Wd.add(d); stat.push({ d, j, k }); }
      for (let i = 0; i < 4; i++) { const d = ball(.1, 0xffd34d); Wd.add(d); mov.push({ d, j, i }); }
    }
    Wd.occ = [hs[0].g, hs[1].g, hs[2].g, bg.g]; Wd.center = [1.2, 1.0];
    Wd.on(t => {
      stat.forEach(o => { const p = arcPt(from[o.j], EAR, o.k / 9, 1.6); o.d.position.set(p[0], p[1], p[2]); });
      mov.forEach(o => { const u = (t * .45 + o.i / 4 + o.j * .17) % 1; const p = arcPt(from[o.j], EAR, u, 1.6); o.d.position.set(p[0], p[1], p[2]); o.d.scale.setScalar(.6 + .4 * Math.sin(PI * u)); });
      const glow = .5 + .5 * Math.sin(t * 5);
      bg.earL.material.color.lerpColors(C_GOLD, C_GLOW, glow);
      bg.earR.material.color.lerpColors(C_GOLD, C_GLOW, glow);
      bg.f.set(t, { smile: .6 + .3 * glow, look: [-.6, 0] });
      bt.set([BADGE[0], 2.2 + bob(t, 4), .3], popE(P(.2, 1.0, t)));
      hs.forEach(h => h.f.set(t, { smile: .5, look: [1, 0], talk: 0 }));
      bub.g.position.y = 1.6 + bob(t, 2);
      bub.f.set(t, { talk: .7 * talkAmt(t, 7), smile: .5, look: [1, 0] });
    });
    const w = split(dur, [5.5, 5.5, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([1.5, 1.2, 0], { dur: w[0], dist0: 13.0, dist1: 12.2, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.2, 0, 0] }), 13)],
      [w[1], HH(crane([1.0, 1.4, 0], { dur: w[1], dist0: 8.5, dist1: 8.0, h0: .6, h1: 1.4, a0: -14, a1: 10, fov0: 42, fov1: 40 }), 14)],
      [w[2], HH(pushIn([4.9, 1.2, 0], { dur: w[2], dist0: 4.2, dist1: 3.0, h0: .6, h1: .7, a0: -6, a1: 8, fov0: 40, fov1: 38 }), 15)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, good): the word's grey stain is wiped off by a sponge; it becomes clean and shiny; green check
  function beat5(dur) {
    const Wd = mkWorld({}); base(Wd);
    const bub = bubble(Wd, [0, 1.5, .4], 0xffffff); bub.body.material.color.copy(C_DIRTY);
    const sp = box(.55, .3, .2, 0xfff3c4); Wd.add(sp);
    const ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0xbff5c8), sk2 = shock(Wd, 0xffffaa);
    const tg = tag(Wd, 3.0, .6, 'בלי לשון גנאי', '#f6fff2', '#1f6a2a', '#3f9a4a');
    const bg = badge(Wd, [3.3, 1.0, 0]);
    Wd.occ = [bub.g, tg.g, ck.g]; Wd.center = [.3, 1.4];
    Wd.on(t => {
      const u = sm(P(.6, 4.2, t));
      bub.body.material.color.lerpColors(C_DIRTY, C_CLEAN, u);
      sp.visible = t < 4.6; sp.position.set(lerp(-1.4, 1.4, u), 2.1 + .05 * Math.sin(t * 6), .45);
      bub.f.set(t, { smile: -.2 + 1.2 * u, talk: .4 * talkAmt(t, 8), look: [0, 0] });
      bg.f.set(t, { smile: 1, talk: 0, look: [0, 0] });
      ck.set([1.6, 2.6, .5], popE(P(3.8, 4.8, t)) * .9, .04 * Math.sin(t * 3));
      sk.set([1.6, 2.6, .5], P(3.8, 4.6, t), 1.0);
      sk2.set([0, 1.5, .5], P(4.2, 5.0, t), 2.6);
      tg.set([0, 2.9 + bob(t, 1), .4], popE(P(3.0, 3.9, t)));
    });
    const w = split(dur, [4, 5, 5]);
    Wd.cam = cuts([
      [w[0], HH(insert([0, 1.5, 0], { dur: w[0], dist0: 3.2, dist1: 2.6, h0: .4, h1: .5, a0: -12, a1: 8, fov0: 38, fov1: 36 }), 16)],
      [w[1], HH(punch(truck([1.2, 1.2, 0], { dur: w[1], dist0: 9.0, dist1: 8.5, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 42, fov1: 42 }), [.8]), 17)],
      [w[2], HH(crane([1.6, 2.2, 0], { dur: w[2], dist0: 4.6, dist1: 3.6, h0: .2, h1: 1.2, a0: 10, a1: -6, fov0: 40, fov1: 40 }), 18)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): a dark grey word tries to reach the three houses; a red barrier and a big red cross stop it; the badge stays safe
  function beat6(dur) {
    const Wd = mkWorld({}); base(Wd);
    const hs = HX.map((x, i) => house(Wd, x, i + 1, HCOL[i], HROOF[i]));
    const bub = bubble(Wd, [-5.4, 1.6, .4], 0x5d6470);
    const wall = box(.3, 2.4, 1.8, RED); wall.position.set(-3.1, 1.2, .2); Wd.add(wall);
    const cx = mark3d(Wd, 'cross', 1.3), sk = shock(Wd, 0xff7a7a);
    const big = tag(Wd, 1.3, 1.3, '3', TAG_GOLD[0], TAG_GOLD[1], TAG_GOLD[2]);
    const bg = badge(Wd, BADGE);
    Wd.occ = [bub.g, hs[0].g, bg.g]; Wd.center = [-.5, 1.2];
    Wd.on(t => {
      const u = sm(P(1, 4, t));
      const bump = t > 4.4 ? .25 * Math.sin(clamp((t - 4.4) * 3, 0, PI)) : 0;
      bub.g.position.x = lerp(-5.4, -3.6, u) - bump;
      bub.g.position.y = 1.6 + bob(t, 2);
      const sur = (t > 4.4 && t < 7.0) ? 1 : 0;
      bub.f.set(t, { smile: -.6 - .3 * sm(P(4.4, 5.0, t)), surprise: sur, talk: t < 4.2 ? .8 * talkAmt(t, 9) : 0, look: [1, 0] });
      cx.set([-3.1, 2.1, .5], popE(P(4.2, 5.0, t)) * .6, .05 * Math.sin(t * 4));
      sk.set([-3.1, 1.5, .5], P(4.3, 5.0, t), 2.2);
      big.set([0, 3.0 + bob(t, 1), .3], 1);
      hs.forEach(h => h.f.set(t, { smile: 0, look: [-.4, 0], talk: 0, surprise: sur * .6 }));
      bg.f.set(t, { smile: 1, talk: 0, look: [0, 0] });
    });
    const w = split(dur, [5, 4, 5]);
    Wd.cam = cuts([
      [w[0], HH(truck([-.5, 1.3, 0], { dur: w[0], dist0: 11, dist1: 10, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.3, 0, 0] }), 19)],
      [w[1], HH(insert([-3.3, 1.7, 0], { dur: w[1], dist0: 6.0, dist1: 5.2, h0: .7, h1: .8, a0: -14, a1: 6, fov0: 36, fov1: 34 }), 20)],
      [w[2], HH(pushIn([-4.0, 1.3, 0], { dur: w[2], dist0: 5.5, dist1: 4.2, h0: .6, h1: .5, a0: 6, a1: -8, fov0: 42, fov1: 40 }), 21)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): three calm houses, the clean shining word, the shining good name, slow crane
  function answer(dur) {
    const Wd = mkWorld({}); base(Wd);
    const hs = HX.map((x, i) => house(Wd, x, i + 1, HCOL[i], HROOF[i]));
    const bub = bubble(Wd, [-4.6, 1.5, .4], 0xfbfdff);
    const bg = badge(Wd, [4.6, 1.2, 0]);
    const ck = mark3d(Wd, 'check', 1.1);
    Wd.occ = [bub.g, bg.g, hs[0].g, hs[1].g, hs[2].g]; Wd.center = [0, 1.0]; Wd.ansD = 6.4;
    Wd.on(t => {
      bub.g.position.y = 1.5 + bob(t, 2);
      bub.f.set(t, { smile: 1, talk: .45 * talkAmt(t, 3), look: [.4, 0] });
      hs.forEach((h, i) => h.f.set(t, { smile: 1, talk: .35 * talkAmt(t, i + 4), look: [0, 0] }));
      bg.f.set(t, { smile: 1, talk: .3 * talkAmt(t, 5), look: [0, 0] });
      const glow = .5 + .5 * Math.sin(t * 2.5);
      bg.earL.material.color.lerpColors(C_GOLD, C_GLOW, glow);
      bg.earR.material.color.lerpColors(C_GOLD, C_GLOW, glow);
      ck.set([4.8, .4 + .03 * Math.sin(t * 2)], popE(P(.5, 1.5, t)) * .45, 0);
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.8, 0], { dur, dist0: 10.0, dist1: 8.2, h0: .8, h1: 2.4, a0: 6, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
