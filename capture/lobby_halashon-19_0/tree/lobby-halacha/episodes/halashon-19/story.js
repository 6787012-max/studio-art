// halashon-19 story: "Mocking a derasha: 'there is nothing in it' is lashon hara, even if true" (storyboards_v20.md, section B).
// Talking objects only, NO people. Adapted from halashon-18 (COPY FROM).
// Heroes: a LECTERN with a face (gives the derasha), a TEAPOT with a face (the mocker, on a back bench),
// a COIN PURSE with a face (money damage), loose COINS and a "ממון" meter, a SHIELD with a heart "ואהבת לרעך כמוך".
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
  const GOLD = 0xf2c14e, RED = 0xe03131, PAPER = 0xf4e4b8, DARK = 0x2b2b33, WOOD = 0x8a5a33, DWOOD = 0x6b4a2a;
  const BOOKC = [0x3a86ff, 0xe03131, 0x2f9e44, 0x9c36b5, 0xf08c00];
  const STONE = 0x9aa0a8, CLOUD = 0x5b6270, TEAPOT = 0xe0a050, PURSEC = 0x8c4a2a, TABLE = 0xb07a4a, BENCH = 0x9a6a3a;
  const BULB = 0xfff3a0, FLOOR = 0xe9d3a0, WALL = 0xf6e7c6, SHIELDC = 0xd9a63a, DOORC = 0x7a5230;
  const C_RED = new THREE.Color(RED);
  const LEC = [0, 0];                         // lectern (floor point)
  const LEC_MOUTH = [0, 1.9, .45];            // where the golden words come out (lectern is 1.5x)
  const BENCH_Z = 1.7, BOOK_Y = .86;          // front listeners' bench and its open books
  const BOOKS = [-3.2, -1.6, 0, 1.6, 3.2];
  const TP = [3.4, -2.6], TP_TOP = .9;        // teapot on the back bench
  const PURSE = [-3.6, .9, .8];               // purse on its table (top at y .9)
  const METER = [-2.1, 0, .8];                // "ממון" meter
  const BUB = [3.4, 1.9, -2.2];               // teapot speech bubble
  const SHIELD = [5.6, 2.4, -4.3];            // shield with a heart on the back wall
  const BOOTH = [-5.6, -1.6];                 // private corner "בינו לבין עצמו"
  const TAG_BAD = ['#ffe3e3', '#8a1010', '#c43030'];
  const TAG_NEU = ['#ffffff', '#222222', '#8a8a8a'];
  const TAG_GOLD = ['#fff6d6', '#5a3a10', '#c9a050'];
  const TAG_GREEN = ['#e8fff0', '#1f6a2a', '#3f9a4a'];
  const TAG_BLUE = ['#e8f0ff', '#1f3f7a', '#4f78b8'];
  const TO = i => [BOOKS[i % BOOKS.length], BOOK_Y + .25, BENCH_Z];   // landing spot of golden word i
  const NW = 6;                                                        // golden words

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

  // ---------------------------------------------------------------- helpers
  function fly(m, i, u, h) { const p = arcPt(LEC_MOUTH, TO(i), clamp(u, 0, 1), h); m.position.set(p[0], p[1], p[2]); }
  function setBar(mesh, h) { mesh.scale.y = Math.max(.001, h); mesh.position.y = Math.max(.001, h) / 2; }
  // flat glowing letter tile (not a coin) for the golden words leaving the lectern
  function letterTile(Wd, ch) {
    const m = texPlane(.34, .34, (c, W, H) => {
      c.fillStyle = '#fff3c4'; c.beginPath(); c.roundRect(W * .08, H * .08, W * .84, H * .84, H * .2); c.fill();
      c.lineWidth = H * .07; c.strokeStyle = '#f2c14e'; c.stroke();
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `900 ${H * .62}px ${FONT}`; c.fillStyle = '#7a4a00'; c.fillText(ch, W / 2, H * .55);
    }, { cw: 256, ro: 4 });
    const g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    g.material = m.material;
    return g;
  }
  const redHood = (m, a) => m.material.color.set(new THREE.Color(0x7a7a84).lerp(C_RED, clamp(a, 0, 1)));

  // ---------------------------------------------------------------- the beit midrash: wall with shelves, benches, lectern, teapot bench, purse table, booth, shield
  function build(Wd) {
    const fl = box(26, .2, 11, FLOOR); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(26, 5, .3, WALL); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    [1.2, 2.0, 2.8].forEach((y, r) => {
      const sh = box(12, .1, .5, WOOD); sh.position.set(0, y, -4.3); Wd.add(sh);
      for (let k = 0; k < 12; k++) {
        const hgt = .5 + ((k * 7 + r * 3) % 4) * .1;
        const bk = box(.22, hgt, .34, BOOKC[(k + r) % 5]); bk.position.set(-5.5 + k * .95, y + hgt / 2 + .05, -4.3); Wd.add(bk);
      }
    });
    // front listeners' bench with open books
    const bt = box(9, .12, .7, BENCH); bt.position.set(0, .75, BENCH_Z); Wd.add(bt);
    [-4.3, 4.3].forEach(x => { const lg = box(.14, .75, .6, BENCH); lg.position.set(x, .375, BENCH_Z); Wd.add(lg); });
    const books = BOOKS.map(x => { const bk = box(.7, .06, .5, PAPER); bk.position.set(x, BOOK_Y, BENCH_Z); Wd.add(bk); return bk; });
    // back bench with the teapot
    const bb = box(3.6, .12, .7, BENCH); bb.position.set(TP[0], TP_TOP - .06, TP[1]); Wd.add(bb);
    [-1.6, 1.6].forEach(x => { const lg = box(.14, TP_TOP - .12, .6, BENCH); lg.position.set(TP[0] + x, (TP_TOP - .12) / 2, TP[1]); Wd.add(lg); });
    const tp = new THREE.Group(); tp.position.set(TP[0], TP_TOP, TP[1]); Wd.add(tp);
    const pot = cyl(.34, .4, .5, TEAPOT); pot.position.y = .25; tp.add(pot);
    const lid = cyl(.12, .14, .08, TEAPOT); lid.position.y = .54; tp.add(lid);
    const spout = box(.3, .08, .08, TEAPOT); spout.position.set(.45, .35, 0); spout.rotation.z = -.4; tp.add(spout);
    const fTp = face(Wd, { w: .36, parent: tp, pos: [0, .3, .39], seed: 44 });
    // lectern with a face on its front
    const lg = new THREE.Group(); lg.position.set(LEC[0], 0, LEC[1]); lg.scale.setScalar(1.5); Wd.add(lg);
    const base = box(.9, .08, .7, DWOOD); base.position.y = .04; lg.add(base);
    const body = box(.8, 1.1, .5, WOOD); body.position.y = .6; lg.add(body);
    const top = box(1.0, .1, .62, DWOOD); top.position.y = 1.2; top.rotation.x = -.35; lg.add(top);
    const fLec = face(Wd, { w: .5, parent: lg, pos: [0, .72, .27], seed: 11 });
    // coin purse on its table
    const table = box(1.6, .9, 1.2, TABLE); table.position.set(PURSE[0], .45, PURSE[2]); Wd.add(table);
    const pg = new THREE.Group(); pg.position.set(PURSE[0], PURSE[1], PURSE[2]); Wd.add(pg);
    const pbody = box(.9, .7, .6, PURSEC); pbody.position.y = .35; pg.add(pbody);
    const fPurse = face(Wd, { w: .5, parent: pg, pos: [0, .4, .31], seed: 21 });
    // "ממון" meter
    const mFrame = box(.42, 1.3, .3, DARK); mFrame.position.set(METER[0], .65, METER[2]); Wd.add(mFrame);
    const barM = box(.3, 1, .3, GOLD); barM.position.set(METER[0], 0, METER[2]); Wd.add(barM); setBar(barM, 1);
    const meterTag = tag(Wd, 1.2, .45, 'ממון', ...TAG_GOLD);
    // coins, golden words, bulb
    const coins = [0, 1, 2].map(() => { const c = cyl(.14, .14, .05, GOLD); c.visible = false; Wd.add(c); return c; });
    const words = Array.from({ length: NW }, (_, i) => letterTile(Wd, 'אבגדהו'[i]));
    const bulb = ball(.13, BULB); bulb.visible = false; Wd.add(bulb);
    // shield with a heart on the back wall
    const shield = cyl(.8, .8, .1, SHIELDC); shield.rotation.x = PI / 2; shield.position.set(SHIELD[0], SHIELD[1], SHIELD[2]); Wd.add(shield);
    const heart = ball(.22, RED); heart.position.set(SHIELD[0], SHIELD[1], SHIELD[2] + .12); Wd.add(heart);
    const shieldTag = tag(Wd, 3.8, .5, 'ואהבת לרעך כמוך', ...TAG_GOLD);
    // private corner with a closed door
    const booth = new THREE.Group(); Wd.add(booth);
    const bkW = box(1.8, 2.3, .12, DWOOD); bkW.position.set(BOOTH[0], 1.15, BOOTH[1] - .7); booth.add(bkW);
    [-.9, .9].forEach(x => { const s = box(.12, 2.3, 1.4, DWOOD); s.position.set(BOOTH[0] + x, 1.15, BOOTH[1]); booth.add(s); });
    const door = box(.9, 1.7, .08, DOORC); door.position.set(BOOTH[0], .85, BOOTH[1] + .7); booth.add(door);
    const boothTag = tag(Wd, 3.0, .5, 'בינו לבין עצמו', ...TAG_NEU);
    Wd.center = [0, 0];
    return { lec: { g: lg, f: fLec }, tp: { g: tp, f: fTp }, pg: { g: pg, f: fPurse }, books, barM, meterTag, coins, words, bulb,
             shield, heart, shieldTag, boothTag, booth };
  }

  // ================================================================ HOOK (14 s): extreme close-up on the lectern's face, pulls out; golden words float to the benches; on the back bench the teapot smirks and a grey bubble "אין בזה ממש" grows; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const qq = tag(Wd, .8, .8, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    const bub = tag(Wd, 3.0, .55, 'אין בזה ממש', ...TAG_NEU);
    const hp = [LEC[0], 1.08, .4];
    Wd.qPos = [TP[0], TP[1]];
    Wd.occ = [B.lec.g, B.tp.g]; Wd.center = [-1.0, 1.2];
    Wd.on(t => {
      B.lec.f.set(t, { smile: -.2, talk: .4 * talkAmt(t, 3), look: [1, 0] });
      B.tp.f.set(t, { smile: .3, talk: .3 * talkAmt(t, 4), look: [-1, 0] });
      B.words.forEach((w, i) => { const u = sm(P(1 + i * .4, 4.5 + i * .4, t)); w.visible = t > 1 + i * .4; fly(w, i, u, 1.0); });
      bub.set([BUB[0], BUB[1] + .1 + bob(t, 2), BUB[2]], popE(P(4, 7, t)));
      qq.set([BUB[0] + .3, BUB[1] + 1.0 + bob(t, 3), BUB[2]], popE(P(1.4, 2.2, t)));
      B.meterTag.set([METER[0], 1.6, METER[2]], popE(P(9, 9.8, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut(hp, { dur: w[0], dist0: 1.0, dist1: 3.4, h0: 1.2, h1: 1.5, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([1.4, 1.4, -0.6], { dur: w[1], dist0: 7.6, dist1: 7.0, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 44, fov1: 44 }), 52)],
      [w[2], HH(insert([3.0, 1.8, -1.8], { dur: w[2], dist0: 4.8, dist1: 4.5, h0: 1.5, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([1.2, 1.3, 0], { dur: w[3], dist0: 7.5, dist1: 7.0, h0: .8, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, good): the lectern gives the derasha; golden words fly to the open books on the bench; the benches' books bounce; tag "דרשה" above the lectern
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const tDar = tag(Wd, 2.0, .6, 'דרשה', ...TAG_GOLD);
    Wd.occ = [B.lec.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      B.words.forEach((w, i) => { const u = sm(P(1.0 + i * .3, 3.6 + i * .3, t)); w.visible = t > 1.0 + i * .3; fly(w, i, u, 1.0); });
      B.books.forEach((bk, i) => { bk.position.y = BOOK_Y + .05 * Math.max(0, Math.sin((t - 3.4) * 4 - i * .4)) * (t > 3.4 ? 1 : 0); });
      B.lec.f.set(t, { smile: 1, talk: .6 * talkAmt(t, 5) * sm(P(.4, 1, t)), look: [1, 0] });
      B.tp.f.set(t, { smile: 0, talk: 0, look: [-1, 0] });
      B.pg.f.set(t, { smile: .2, talk: .3 * talkAmt(t, 8) * sm(P(7, 8, t)), look: [1, 0] });
      tDar.set([0, 2.1 + bob(t, 1), .2], popE(P(1.5, 2.2, t)));
      B.meterTag.set([METER[0], 1.6, METER[2]], popE(P(10, 10.8, t)));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([0, 1.2, 0], { dur: w[0], dist0: 7.5, dist1: 7.0, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 21)],
      [w[1], HH(punch(insert([0, 1.2, .45], { dur: w[1], dist0: 4.6, dist1: 4.3, h0: 1.1, h1: 1.2, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.2]), 22)],
      [w[2], HH(pushIn([0, 1.1, 0], { dur: w[2], dist0: 4.0, dist1: 3.6, h0: 1.1, h1: 1.3, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 23)],
      [w[3], HH(crane([0.4, 1.4, BENCH_Z], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, bad): the teapot opens a bubble "אין מה לשמוע"; the golden words hanging in the air turn grey and fall; red cross + shock; tag "ללעוג"
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bub = tag(Wd, 3.0, .55, 'אין מה לשמוע', ...TAG_NEU);
    const tLag = tag(Wd, 2.0, .55, 'ללעוג', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.lec.g, B.tp.g]; Wd.center = [-.4, 1.2];
    Wd.on(t => {
      const fall = sm(P(5.2, 6.6, t));
      B.words.forEach((w, i) => {
        w.visible = true; w.material.color.set(t > 5.2 ? STONE : 0xffffff);
        fly(w, i, .55, 1.0); w.position.y += bob(t, i) - 1.1 * fall;
      });
      bub.set([BUB[0], BUB[1] + .1 + bob(t, 2), BUB[2]], popE(P(.6, 1.4, t)) * (1 - sm(P(12.6, 13.4, t))));
      B.tp.f.set(t, { smile: -.6, talk: .8 * talkAmt(t, 9) * (1 - sm(P(5.0, 5.8, t))), surprise: sm(P(5.6, 6.2, t)) * (1 - sm(P(7.5, 8.5, t))), look: [-1, 0] });
      B.lec.f.set(t, { smile: -.6 * sm(P(5.2, 5.8, t)), talk: 0, look: [1, 0] });
      cx.set([BUB[0] - .4, BUB[1] + .4, BUB[2] + .5], popE(P(5.6, 6.4, t)) * .9, .05 * Math.sin(t * 4) * (t > 6.4 ? 1 : 0));
      sk.set([BUB[0] - .4, BUB[1] + .4, BUB[2] + .5], P(5.6, 6.4, t), 1.2);
      tLag.set([1.1, 2.9, BUB[2]], popE(P(6.0, 6.8, t)));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([0, 1.4, 0], { dur: w[0], dist0: 12, dist1: 11.4, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 31)],
      [w[1], HH(punch(insert([BUB[0], 1.6, BUB[2]], { dur: w[1], dist0: 6.4, dist1: 6.0, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [5.8]), 32)],
      [w[2], HH(truck([-2.0, 1.2, .4], { dur: w[2], dist0: 8.6, dist1: 8.0, h0: 1.8, h1: 2.0, a0: 4, a1: -4, fov0: 42, fov1: 42 }), 33)],
      [w[3], HH(crane([-1.4, 1.4, 1.2], { dur: w[3], dist0: 9.8, dist1: 9.2, h0: 1.0, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): a big stamp "לשון הרע גמורה" slams on the bubble; red cross; the bubble cracks; tag "לשון הרע"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bub = tag(Wd, 3.0, .55, 'אין מה לשמוע', ...TAG_NEU);
    const stamp = tag(Wd, 3.6, .9, 'לשון הרע גמורה', ...TAG_BAD);
    const tLs = tag(Wd, 2.2, .55, 'לשון הרע', ...TAG_BAD);
    const crack = box(.05, .6, .04, 0x1e1e1e); crack.rotation.z = .3; crack.scale.y = .001; crack.position.set(BUB[0] + .6, BUB[1], BUB[2] + .12); Wd.add(crack);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.tp.g]; Wd.center = [-.6, 1.2];
    Wd.on(t => {
      bub.set([BUB[0], BUB[1] + bob(t, 2), BUB[2]], popE(P(0, .6, t)));
      const slam = t < 3.8 ? 0 : 1 + 1.6 * (1 - sm(P(3.8, 4.3, t)));
      stamp.set([BUB[0], 1.55, BUB[2] + .3], slam);
      sk.set([BUB[0], 1.55, BUB[2] + .5], P(4.3, 5.0, t), 1.4);
      crack.scale.y = Math.max(.001, sm(P(4.6, 5.6, t)));
      cx.set([BUB[0] + 2.6, 1.6, BUB[2] + .5], popE(P(4.6, 5.4, t)) * .9, .05 * Math.sin(t * 4) * (t > 5.4 ? 1 : 0));
      tLs.set([0, 3.2, -.6], popE(P(5.6, 6.4, t)));
      B.tp.f.set(t, { smile: -.6, talk: .8 * talkAmt(t, 11) * (1 - sm(P(3.6, 4.2, t))), surprise: .6 * sm(P(4.3, 4.8, t)), look: [-1, 0] });
      B.lec.f.set(t, { smile: -.6, talk: 0, surprise: .4 * sm(P(4.6, 5.2, t)), look: [1, 0] });
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([2.0, 1.4, 0], { dur: w[0], dist0: 12, dist1: 11.4, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 41)],
      [w[1], HH(punch(insert([BUB[0] + 1.0, 1.5, BUB[2]], { dur: w[1], dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [4.3]), 42)],
      [w[2], HH(pushIn([-.8, 1.2, 0], { dur: w[2], dist0: 6.0, dist1: 5.4, h0: 1.2, h1: 1.5, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 43)],
      [w[3], HH(crane([1.4, 1.3, 1.2], { dur: w[3], dist0: 9.0, dist1: 8.4, h0: 1.0, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, bad): coins roll off the purse; the "ממון" meter drops; a dark cloud of shame hangs over the lectern, which looks sad; red cross; tag "הזק וצער"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bub = tag(Wd, 3.0, .55, 'אין מה לשמוע', ...TAG_NEU);
    const cl = new THREE.Group(); Wd.add(cl);
    [[-.26, 0, .26], [.24, .06, .28], [0, .24, .24]].forEach(([x, y, r]) => { const c = ball(r, CLOUD); c.position.set(x, y, 0); cl.add(c); });
    cl.visible = false;
    B.coins.forEach(c => c.scale.set(2.3, 2.3, 2.3));
    const tHz = tag(Wd, 2.6, .55, 'הזק וצער', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.lec.g, B.pg.g]; Wd.center = [-1.0, 1.2];
    Wd.on(t => {
      bub.set([BUB[0], BUB[1] + bob(t, 2), BUB[2]], 1);
      B.coins.forEach((c, k) => {
        const u = P(2 + k * .5, 6 + k * .5, t);   // coins hop away from the purse along the table and off to the left, staying in view
        const p = [PURSE[0] - .1 - 3.0 * u, 1.3 + .7 * Math.abs(Math.sin(u * 9.4 + k)) * (1 - .5 * u), PURSE[2] + .35 - .5 * k];
        c.visible = t > 2 + k * .5; c.position.set(p[0], p[1], p[2]); c.rotation.z = t * 7; c.rotation.x = .5;
      });
      setBar(B.barM, 1 - .7 * sm(P(2.5, 6, t)));
      B.meterTag.set([METER[0], 1.6, METER[2]], popE(P(1.8, 2.6, t)));
      const cp = [0, 3.0 + bob(t, 4), .3];
      cl.position.set(cp[0], cp[1], cp[2]); cl.scale.setScalar(Math.max(.001, 2.0 * popE(P(3.4, 4.2, t)))); cl.visible = t > 3.4;
      tHz.set([-2.9, 3.3, .3], popE(P(4.6, 5.4, t)));
      cx.set([-1.2, 2.2, 1.0], popE(P(7.0, 7.8, t)) * .9, .05 * Math.sin(t * 4) * (t > 7.8 ? 1 : 0));
      sk.set([-1.2, 2.2, 1.0], P(7.0, 7.8, t), 1.2);
      B.lec.f.set(t, { smile: -.6, talk: 0, look: [1, 0] });
      B.pg.f.set(t, { smile: -.6, talk: .5 * talkAmt(t, 14) * sm(P(2, 2.6, t)) * (1 - sm(P(6, 7, t))), look: [1, 0] });
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.7, 2.35, 0.4], { dur: w[0], dist0: 8.0, dist1: 7.5, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 51)],
      [w[1], HH(insert([-3.2, 2.0, PURSE[2]], { dur: w[1], dist0: 5.6, dist1: 5.2, h0: 1.0, h1: 1.2, a0: -8, a1: 6, fov0: 44, fov1: 44 }), 52)],
      [w[2], HH(punch(pushIn([-.4, 2.4, .45], { dur: w[2], dist0: 7.4, dist1: 6.9, h0: 1.8, h1: 1.8, a0: 8, a1: -4, fov0: 44, fov1: 44 }), [7.4]), 53)],
      [w[3], HH(crane([-1.7, 2.4, 1.0], { dur: w[3], dist0: 8.6, dist1: 7.8, h0: 1.0, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): the teapot insists "but it is true" - the sign "אמת" appears by the bubble; a sign "גם על אמת אסור" under it; red cross on "אמת"; tag "אפילו על אמת"
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bub = tag(Wd, 3.0, .55, 'אין מה לשמוע', ...TAG_NEU);
    const sTrue = tag(Wd, 1.6, .55, 'אמת', ...TAG_GOLD);
    const sNo = tag(Wd, 3.4, .5, 'גם על אמת אסור', ...TAG_BAD);
    const tEv = tag(Wd, 3.4, .55, 'אפילו על אמת', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.tp.g]; Wd.center = [.6, 1.2];
    Wd.on(t => {
      bub.set([BUB[0], BUB[1] + bob(t, 2), BUB[2]], 1);
      sTrue.set([BUB[0] + 2.6, BUB[1] + .3 + bob(t, 5), BUB[2]], popE(P(1.4, 2.2, t)));
      sNo.set([BUB[0] + 2.6, BUB[1] - .5, BUB[2]], popE(P(4.6, 5.4, t)));
      cx.set([BUB[0] + 2.6, BUB[1] + .3, BUB[2] + .4], popE(P(6.0, 6.8, t)) * .9, .05 * Math.sin(t * 4) * (t > 6.8 ? 1 : 0));
      sk.set([BUB[0] + 2.6, BUB[1] + .3, BUB[2] + .4], P(6.0, 6.8, t), 1.1);
      tEv.set([0, 3.6, .3], popE(P(8.0, 8.8, t)));
      B.tp.f.set(t, { smile: -.6, talk: .8 * talkAmt(t, 17) * sm(P(1.4, 2.0, t)) * (1 - sm(P(8, 8.6, t))), surprise: .6 * sm(P(6.0, 6.6, t)), look: [-1, 0] });
      B.lec.f.set(t, { smile: -.6, talk: .4 * talkAmt(t, 18) * sm(P(4.8, 5.4, t)), look: [1, 0] });
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(crane([3.0, 1.4, -1.0], { dur: w[0], dist0: 8.6, dist1: 8.0, h0: 2.0, h1: 2.4, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 61)],
      [w[1], HH(punch(insert([BUB[0] + 1.2, 1.9, BUB[2]], { dur: w[1], dist0: 5.2, dist1: 4.8, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [6.8]), 62)],
      [w[2], HH(truck([-1.0, 1.4, 0], { dur: w[2], dist0: 10, dist1: 9.2, h0: 2.0, h1: 2.2, a0: 6, a1: -6, fov0: 44, fov1: 42 }), 63)],
      [w[3], HH(pushIn([.6, 1.4, 0], { dur: w[3], dist0: 6.4, dist1: 5.8, h0: 1.3, h1: 1.6, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, good): the teapot closes its bubble, walks quietly to the lectern and gives it a lightbulb (good advice); the heart glows; green check; tag "לייעץ בינו לבינו"
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bub = tag(Wd, 3.0, .55, 'אין מה לשמוע', ...TAG_NEU);
    const ck = mark3d(Wd, 'check', .8);
    const tAd = tag(Wd, 3.4, .55, 'לייעץ בינו לבינו', ...TAG_GREEN);
    // compact staging: booth, teapot's stop, lectern and the heart shield all within x -3.9..3.4
    const SH = [2.5, 2.4, -1.0];                  // shield+heart moved forward of the wall for this beat only
    B.shield.position.set(SH[0], SH[1], SH[2]); B.heart.position.set(SH[0], SH[1], SH[2] + .16);
    B.booth.position.set(2.6, 0, 0);              // booth centre x -3.0, door at z -0.9
    const BTOP = BOOK_Y + .02, STOP = [-1.5, BENCH_Z], MID = [1.7, BENCH_Z];   // teapot walks onto the front bench top (in front of the lectern)
    Wd.occ = [B.lec.g, B.tp.g]; Wd.center = [-.3, 1.2];
    Wd.on(t => {
      bub.set([BUB[0], BUB[1] + bob(t, 2), BUB[2]], 1 - sm(P(1.0, 2.0, t)));
      const w1 = sm(P(2.4, 4.4, t)), w2 = sm(P(4.8, 7.0, t));
      let tx, tz, ty;
      if (t < 4.6) { tx = lerp(TP[0], MID[0], w1); tz = lerp(TP[1], MID[1], w1); ty = lerp(TP_TOP, BTOP, w1); }
      else { tx = lerp(MID[0], STOP[0], w2); tz = MID[1]; ty = BTOP; }
      const walking = (t > 2.4 && t < 4.4) || (t > 4.8 && t < 7.0);
      B.tp.g.scale.setScalar(lerp(1, 1.5, w1));
      B.tp.g.position.set(tx, ty + .05 * Math.abs(Math.sin(t * 6)) * (walking ? 1 : 0), tz);
      B.bulb.visible = t > 7.4; B.bulb.scale.setScalar(1.8);
      const bp = arcPt([STOP[0], 2.0, STOP[1]], [-.1, 2.1, .5], sm(P(7.4, 9.2, t)), .6);
      B.bulb.position.set(bp[0], bp[1], bp[2]);
      const hs = .85 * (1 + .25 * sm(P(9.6, 10.6, t)));
      B.shield.scale.setScalar(hs); B.heart.scale.setScalar(hs * 1.4);
      ck.set([SH[0] + 1.1, SH[1] + .4, SH[2] + .6], popE(P(10.2, 11.0, t)) * .9, .05 * Math.sin(t * 4) * (t > 11 ? 1 : 0));
      tAd.set([.5, 3.3, .5], popE(P(10.4, 11.2, t)));
      B.boothTag.set([-3.0, 2.8, BOOTH[1] + .8], popE(P(3.0, 3.8, t)));
      B.tp.f.set(t, { smile: -.2 + 1.2 * sm(P(8.4, 9.8, t)), talk: .6 * talkAmt(t, 21) * sm(P(7.6, 8.4, t)) * (1 - sm(P(9.8, 10.4, t))), look: [1, 0] });
      B.lec.f.set(t, { smile: -.4 + 1.4 * sm(P(8.4, 9.8, t)), talk: .4 * talkAmt(t, 22) * sm(P(8.8, 9.6, t)), look: [-1, 0] });
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-.25, 1.8, .2], { dur: w[0], dist0: 8.2, dist1: 7.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.5, 0, 0] }), 71)],
      [w[1], HH(pushIn([-.25, 1.9, .2], { dur: w[1], dist0: 7.6, dist1: 7.0, h0: 1.0, h1: 1.2, a0: 10, a1: 2, fov0: 44, fov1: 42 }), 72)],
      [w[2], HH(punch(insert([-.25, 1.9, .2], { dur: w[2], dist0: 7.0, dist1: 6.6, h0: .9, h1: 1.1, a0: -12, a1: -4, fov0: 42, fov1: 42 }), [11.0 - 7.0]), 73)],
      [w[3], HH(crane([-.25, 1.8, .2], { dur: w[3], dist0: 8.6, dist1: 8.0, h0: 1.0, h1: 2.2, a0: 6, a1: -6, fov0: 46, fov1: 44 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): the lectern in the middle-back smiling with golden words in the air, the teapot at the bottom side quiet and smiling, the heart glowing on the shield
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    Wd.occ = [B.lec.g]; Wd.center = [0, 1.2]; Wd.ansD = 6.4;
    Wd.on(t => {
      B.tp.g.position.set(2.6, 0, 1.6);
      B.lec.f.set(t, { smile: .9, talk: .3 * talkAmt(t, 37), look: [1, 0] });
      B.tp.f.set(t, { smile: .7, talk: 0, look: [-1, 0] });
      B.words.forEach((w, i) => { w.visible = true; fly(w, i, .5, 1.0); w.position.y += bob(t, i); });
      const hs = 1.2 + .08 * Math.sin(t * 2);
      B.shield.scale.setScalar(hs); B.heart.scale.setScalar(hs);
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.2, 0], { dur, dist0: 12, dist1: 11.2, h0: 3.0, h1: 4.2, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
