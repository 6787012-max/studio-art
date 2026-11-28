// halashon-27 story: "dan lechaf zechut" - a gold balance scale with a face weighs a small blue siddur that slips out of a little shul; a green notebook "בינוני" balances the scale; a parchment "בצדק תשפוט עמיתך"; the dark bubble "גנות" flies off and the stamp "לשון הרע" comes down.
// Talking objects only, NO people. Storyboard: storyboards_v28.md (B). COPY FROM halashon-26: same camera helpers, tags, faces, table set.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, handheld, punch, face, talkAmt, mark3d, shock, popE, ease, prog, lerp, texPlane, bill, FONT, fitText } = K;
  // whole-frame lift: every camera aims lower so the subject sits above the caption band
  const LIFT = .5;
  const lift = p => [p[0], p[1] - LIFT, p[2]];
  // every camera at most 6.5 from its target; anything further is pulled in and narrowed to 36 degrees so the heroes fill the frame
  const fit = o => { if (!o || o.dist0 === undefined) return o; if (o.dist0 <= 6.5 && o.dist1 <= 6.5) return o;
    return Object.assign({}, o, { dist0: Math.min(o.dist0, 6.5), dist1: Math.min(o.dist1, 6.5), fov0: 36, fov1: 36 }); };
  const pushIn = (p, o) => K.pushIn(lift(p), fit(o)), pullOut = (p, o) => K.pullOut(lift(p), fit(o)), truck = (p, o) => K.truck(lift(p), fit(o));
  const crane = (p, o) => K.crane(lift(p), fit(o)), insert = (p, o) => K.insert(lift(p), fit(o));
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const L3 = (a, b, s) => [lerp(a[0], b[0], s), lerp(a[1], b[1], s), lerp(a[2], b[2], s)];
  const RED = 0xe03131, DARK = 0x2b2b33, WOOD = 0x8a5a33, CREAM = 0xf4f1ea, BLUE = 0x2f6fd6, DKG = 0x4a4a55;
  const GREEN = 0x2fbf5b, GOLD = 0xd9a441, GLASS_C = 0xbfeaff, SHUL = 0xf4ead0, ROOF = 0x6a3a20, PANEL_C = 0x9a9aa5;
  const TOP = .99, PZ = .2;                                     // table top; the front row (z)
  const SCX = .6, SCZ = -1.0;                                   // the gold scale, back of the table
  const SIDX = -1.6, SIDPOS = [SIDX, TOP + .4, PZ + .3];        // the siddur, resting in front of the shul
  const SHX = -2.9, SHZ = PZ - .7, DOOR = [SHX, TOP + .4, PZ - .15]; // the little shul and its door
  const NBX = 2.6, NBPOS = [NBX, TOP + .55, PZ];                 // the green notebook (beat 4 and answer)
  const LENS = [SHX + .25, TOP + .45, PZ + .6];                  // the magnifier looks at the shul door
  const TAG_BAD = ['#ffe3e3', '#8a1010', '#c43030'];
  const TAG_NEU = ['#ffffff', '#222222', '#8a8a8a'];
  const TAG_GOLD = ['#fff6d6', '#5a3a10', '#c9a050'];
  const TAG_GREEN = ['#e8fff0', '#1f6a2a', '#3f9a4a'];

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
      const l = box(.2, TOP - .18, .2, WOOD); l.position.set(lx, (TOP - .18) / 2, lz); Wd.add(l);
    }
  }

  // ---------------------------------------------------------------- the little shul (box with a dome roof and a door on its front)
  function shul(Wd) {
    const g = new THREE.Group(); g.position.set(SHX, TOP, SHZ); Wd.add(g);
    const b = box(1.1, 1.0, .8, SHUL); b.position.y = .5; g.add(b);
    const r = cyl(0, .8, .5, ROOF); r.position.y = 1.25; g.add(r);
    const d = box(.3, .5, .06, DARK); d.position.set(0, .25, .43); g.add(d);
    return g;
  }

  // ---------------------------------------------------------------- the blue siddur with a face on its front (the person judged - never a person)
  function siddur(Wd, pos) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    g.add(box(.7, .8, .22, BLUE));
    const f = face(Wd, { w: .5, parent: g, pos: [0, .08, .13], seed: 71 });
    return { g, f };
  }

  // ---------------------------------------------------------------- the green notebook with a face (pops in on beat 4 and in the answer)
  function notebook(Wd) {
    const g = new THREE.Group(); g.position.set(NBPOS[0], NBPOS[1], NBPOS[2]); g.scale.setScalar(.001); Wd.add(g);
    g.add(box(.9, 1.1, .16, GREEN));
    const f = face(Wd, { w: .6, parent: g, pos: [0, .12, .11], seed: 51 });
    return { g, f };
  }

  // ---------------------------------------------------------------- the dark speech bubble with a face (label "גנות"), for beat 6
  function bubble(Wd) {
    const g = new THREE.Group(); g.scale.setScalar(.001); Wd.add(g);
    g.add(ball(.5, DKG));
    const f = face(Wd, { w: .48, parent: g, pos: [0, .05, .48], seed: 81 });
    return { g, f };
  }

  // ---------------------------------------------------------------- a magnifying glass (lens + gold rim + handle) that looks at the shul door
  function magnifier(Wd) {
    const g = new THREE.Group(); g.position.set(LENS[0], LENS[1], LENS[2]); g.scale.setScalar(.001); Wd.add(g);
    const rim = cyl(.56, .56, .08, GOLD); rim.rotation.x = PI / 2; g.add(rim);
    const lens = cyl(.48, .48, .05, GLASS_C); lens.rotation.x = PI / 2; lens.position.z = .05; g.add(lens);
    const h = box(.1, .6, .08, WOOD); h.position.set(.38, -.55, -.1); h.rotation.z = -.6; g.add(h);
    return { g, set(s, rot) { g.scale.setScalar(Math.max(.001, s)); g.rotation.z = rot || 0; } };
  }

  // ---------------------------------------------------------------- a circle of small balls (sparkles around a pan, or golden rays)
  function ring(Wd, c, r, n, col, sz) {
    const bs = Array.from({ length: n }, () => { const b = ball(sz, col); b.scale.setScalar(.001); Wd.add(b); return b; });
    return { set(s, spin) {
      bs.forEach((b, k) => {
        const a = k / n * 2 * PI + (spin || 0);
        b.position.set(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]);
        b.scale.setScalar(Math.max(.001, s));
      });
    } };
  }

  // ---------------------------------------------------------------- dots left behind by the siddur on its way out of the shul
  function trail(Wd) {
    const dots = [1, 2, 3, 4].map(k => { const d = ball(.05, DARK); d.scale.setScalar(.001); Wd.add(d); return { d, s: k / 5, k }; });
    return { set(t, t0) { dots.forEach(o => {
      const p = L3(DOOR, SIDPOS, o.s); o.d.position.set(p[0], TOP + .05, p[2]);
      o.d.scale.setScalar(Math.max(.001, popE(P(t0 + o.k * .2, t0 + o.k * .2 + .5, t)))); }); } };
  }

  // ---------------------------------------------------------------- the gold scale: centre post with a face, beam, two pans; the weights are children of the pans so they tilt with them
  // R > 0 = left pan (חובה) goes down; R < 0 = right pan (זכות) goes down. bow = forward bow of the whole scale.
  function scale(Wd) {
    const S = new THREE.Group(); S.position.set(SCX, TOP, SCZ); Wd.add(S);
    const bs = box(1.0, .08, .55, WOOD); bs.position.y = .04; S.add(bs);
    const post = box(.1, 1.2, .1, WOOD); post.position.y = .64; S.add(post);
    const hg = new THREE.Group(); hg.position.y = .7; S.add(hg);
    hg.add(ball(.3, GOLD));
    const fh = face(Wd, { w: .42, parent: hg, pos: [0, .02, .28], seed: 91 });
    const beam = new THREE.Group(); beam.position.y = 1.25; S.add(beam);
    beam.add(box(1.5, .07, .07, DARK));
    const mkPan = x => { const p = new THREE.Group(); p.position.set(x, -.25, 0); beam.add(p);
      const s = cyl(.22, .16, .05, PANEL_C); p.add(s); const st = box(.02, .24, .02, DARK); st.position.set(0, .12, 0); p.add(st); return p; };
    const pL = mkPan(-.62), pR = mkPan(.62);
    const lblL = tag(Wd, 1.0, .35, 'חובה', ...TAG_BAD);
    const lblR = tag(Wd, 1.0, .35, 'זכות', ...TAG_GREEN);
    return { S, fh, pL, pR, set(t, R, bow) {
      beam.rotation.z = R; S.rotation.x = bow || 0;
      lblL.set([SCX - .62, 1.4, SCZ + .6], 1); lblR.set([SCX + .62, 1.4, SCZ + .6], 1);
    } };
  }

  // a weight that drops onto a pan (local to the pan, so it tilts with it)
  function weight(pan, w, h, d, col) { const m = box(w, h, d, col); m.userData.rest = .12 + h / 2; m.visible = false; pan.add(m); return m; }
  function drop(m, t, a, b) { const k = sm(P(a, b, t)); m.visible = k > .02; m.position.y = lerp(1.1, m.userData.rest, k); }

  // ---------------------------------------------------------------- the whole set (same objects in every beat)
  function stage(Wd, sidPos) {
    base(Wd);
    const shulG = shul(Wd);
    const sid = siddur(Wd, sidPos || SIDPOS);
    const sc = scale(Wd);
    return { shulG, sid, sc };
  }

  // ================================================================ HOOK (14 s): extreme close-up on the magnifier at the shul door; the siddur slips out of the little door; the scale behind, pans level; "?" above; pulls out
  function hook(dur) {
    const Wd = mkWorld({}); const B = stage(Wd, DOOR);
    const mg = magnifier(Wd);
    const tr = trail(Wd);
    const qq = tag(Wd, .8, .8, '?', ...TAG_GOLD);
    Wd.qPos = [SIDX + .3, PZ + .6];
    Wd.occ = [B.sid.g, mg.g]; Wd.center = [-.6, 0];
    Wd.on(t => {
      mg.set(sm(P(0, .8, t)), -.2 * sm(P(0, 1.5, t)));
      const p = L3(DOOR, SIDPOS, sm(P(1.0, 3.6, t)));
      B.sid.g.position.set(p[0], p[1], p[2]);
      B.sid.f.set(t, { smile: .2, talk: talkAmt(t, 4), look: [1, 0] });
      tr.set(t, 1.0);
      B.sc.set(t, 0, 0);
      B.sc.fh.set(t, { smile: 0, talk: 0, look: [1, 0] });
      qq.set([SIDX + .3, 2.1 + .05 * Math.sin(t * 1.7), PZ + .6], popE(P(1.4, 2.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut(LENS, { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-.6, 1.2, 0], { dur: w[1], dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([SIDX, 1.4, PZ], { dur: w[2], dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.4, PZ], { dur: w[3], dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s): the siddur's slip out of the shul replays; the magnifier looks; the scale wobbles undecided; cards "לטוב" (green) and "לרע" (red) pop; tag "לטוב וגם לרע"
  function beat1(dur) {
    const Wd = mkWorld({}); const B = stage(Wd, DOOR);
    const mg = magnifier(Wd);
    const tr = trail(Wd);
    const tMain = tag(Wd, 2.8, .55, 'לטוב וגם לרע', ...TAG_GOLD);
    const tG = tag(Wd, 1.5, .45, 'לטוב', ...TAG_GREEN);
    const tB = tag(Wd, 1.5, .45, 'לרע', ...TAG_BAD);
    Wd.occ = [B.sid.g, B.sc.S]; Wd.center = [-.4, 1.4];
    Wd.on(t => {
      mg.set(sm(P(0, .8, t)) * (1 - sm(P(2.4, 3.0, t))), 0);
      const p = L3(DOOR, SIDPOS, sm(P(.4, 2.2, t)));
      B.sid.g.position.set(p[0], p[1], p[2]);
      tr.set(t, .4);
      B.sid.f.set(t, { smile: 0, talk: talkAmt(t, 4), look: [1, 0], surprise: 0 });
      B.sc.set(t, .14 * Math.sin(t * 3.4), 0);
      B.sc.fh.set(t, { smile: 0, talk: 0, look: [0, 1] });
      tG.set([2.2, 2.45, PZ + .8], popE(P(3.0, 3.8, t)));
      tB.set([-.2, 2.45, PZ + .8], popE(P(3.6, 4.4, t)));
      tMain.set([0, 1.9, PZ + .7], popE(P(.6, 1.4, t)));
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.4, 1.9, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [3.5, HH(punch(insert([SIDX, 1.5, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.2]), 22)],
      [3.5, HH(insert([SCX, 1.6, SCZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: -4, a1: 4, fov0: 40, fov1: 40 }), 23)],
      [3.5, HH(crane([0, 1.8, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, good): the gold badge "ירא שמים" clicks onto the siddur; a green weight drops into the right pan "זכות" and it goes DOWN; green check and sparkles; the scale smiles; tag "לכף זכות"
  function beat2(dur) {
    const Wd = mkWorld({}); const B = stage(Wd, SIDPOS);
    const bd = tag(Wd, 1.7, .45, 'ירא שמים', ...TAG_GOLD);
    const wG = weight(B.sc.pR, .24, .16, .24, GREEN);
    const ok = mark3d(Wd, 'check', 1.0);
    const sp = ring(Wd, [SCX + .62, 2.0, SCZ + .2], .45, 8, GOLD, .05);
    const tM = tag(Wd, 2.4, .5, 'לכף זכות', ...TAG_GREEN);
    Wd.occ = [B.sid.g, B.sc.S]; Wd.center = [-.2, 1.4];
    Wd.on(t => {
      bd.set([SIDX + .1, 2.2, PZ + .6], popE(P(.4, 1.2, t)));
      drop(wG, t, 1.2, 2.0);
      B.sc.set(t, -.3 * sm(P(2.0, 3.0, t)), 0);
      ok.set([SCX + .62, 2.4, SCZ + .6], popE(P(3.0, 3.8, t)) * .9, 0);
      sp.set(popE(P(3.0, 3.8, t)), t * 3);
      B.sc.fh.set(t, { smile: sm(P(2.6, 3.4, t)), talk: .5 * talkAmt(t, 5), look: [0, 1] });
      B.sid.f.set(t, { smile: .9, talk: talkAmt(t, 6), look: [0, 1] });
      tM.set([0, 2.0, PZ + .7], popE(P(.6, 1.4, t)));
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.2, 1.7, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [3.5, HH(punch(insert([SIDPOS[0], 1.9, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.5, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [1.1]), 32)],
      [3.5, HH(insert([SCX + .4, 1.8, SCZ], { dur: 3.5, dist0: 5.8, dist1: 5.4, h0: 1.5, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 33)],
      [3.5, HH(crane([0, 1.5, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad-leaning): a red weight lands in the left pan "חובה" and it tips a little, but the scale holds; then a bigger green weight on "זכות" outweighs it; tag "גם כשנראה לחובה"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = stage(Wd, SIDPOS);
    const wR = weight(B.sc.pL, .22, .16, .22, RED);
    const wG = weight(B.sc.pR, .4, .3, .4, GREEN);
    const tM = tag(Wd, 2.6, .5, 'גם כשנראה לחובה', ...TAG_NEU);
    Wd.occ = [B.sid.g, B.sc.S]; Wd.center = [-.2, 1.4];
    Wd.on(t => {
      drop(wR, t, .4, 1.2);
      drop(wG, t, 2.2, 3.0);
      const early = sm(P(.4, 1.2, t)), big = sm(P(2.4, 3.2, t));
      B.sc.set(t, .12 * early * (1 - big) - .3 * big, 0);
      B.sc.fh.set(t, { smile: -.4 + big, talk: .5 * talkAmt(t, 8), look: [0, 1] });
      B.sid.f.set(t, { smile: .3 + .4 * big, talk: talkAmt(t, 6), look: [0, 1] });
      tM.set([0, 2.35, PZ + 1.2], popE(P(.6, 1.4, t)));
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.2, 1.7, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 41)],
      [3.5, HH(punch(insert([SCX, 1.5, SCZ], { dur: 3.5, dist0: 6.2, dist1: 5.8, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 42, fov1: 42 }), [1.2]), 42)],
      [3.5, HH(insert([SIDPOS[0], 1.6, PZ], { dur: 3.5, dist0: 5.8, dist1: 5.4, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 43)],
      [3.5, HH(crane([.3, 1.5, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (16 s, good): the green notebook with the badge "בינוני" comes onto the stage; the pans are exactly level with a small "="; a small green feather drops on "זכות" and it tips; green check; tag "הספק שקול"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = stage(Wd, SIDPOS);
    const nb = notebook(Wd);
    const bd = tag(Wd, 1.4, .45, 'בינוני', ...TAG_NEU);
    const eq = tag(Wd, .7, .6, '=', ...TAG_NEU);
    const fe = weight(B.sc.pR, .26, .03, .14, GREEN);
    const ok = mark3d(Wd, 'check', 1.0);
    const sp = ring(Wd, [SCX + .62, 2.0, SCZ + .2], .45, 8, GOLD, .05);
    const tM = tag(Wd, 2.0, .5, 'הספק שקול', ...TAG_GREEN);
    Wd.occ = [B.sid.g, B.sc.S, nb.g]; Wd.center = [.2, 1.4];
    Wd.on(t => {
      nb.g.scale.setScalar(Math.max(.001, popE(P(.4, 1.2, t))));
      nb.f.set(t, { smile: .6, talk: talkAmt(t, 10), look: [-1, 0] });
      bd.set([NBX, 2.35, PZ + .6], popE(P(1.0, 1.6, t)));
      eq.set([SCX, 2.1, SCZ + .8], popE(P(.6, 1.2, t)));
      drop(fe, t, 2.6, 3.4);
      B.sc.set(t, -.1 * sm(P(2.6, 3.4, t)), 0);
      ok.set([SCX + .62, 2.4, SCZ + .6], popE(P(3.4, 4.2, t)) * .9, 0);
      sp.set(popE(P(3.4, 4.2, t)), t * 3);
      B.sc.fh.set(t, { smile: .2, talk: 0, look: [1, 0] });
      B.sid.f.set(t, { smile: .3, talk: talkAmt(t, 6) * .3, look: [1, 0] });
      tM.set([1.2, 2.0, PZ + .7], popE(P(.6, 1.4, t)));
    });
    Wd.cam = cuts([
      [4, HH(truck([.2, 1.7, 0], { dur: 4, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 45)],
      [4, HH(punch(insert([NBX, 1.6, PZ], { dur: 4, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [1.6]), 46)],
      [4, HH(insert([SCX, 1.8, SCZ], { dur: 4, dist0: 6.0, dist1: 5.6, h0: 1.5, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 47)],
      [4, HH(crane([0, 1.5, 0], { dur: 4, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 48)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, good): a parchment unrolls with "בצדק תשפוט עמיתך"; golden rays; the scale bows; tag "מצוות התורה"
  function beat5(dur) {
    const Wd = mkWorld({}); const B = stage(Wd, SIDPOS);
    const ban = tag(Wd, 3.0, .6, 'בצדק תשפוט עמיתך', ...TAG_GOLD);
    const rays = ring(Wd, [SCX, 1.7, SCZ + .2], .9, 12, GOLD, .07);
    const tM = tag(Wd, 2.2, .5, 'מצוות התורה', ...TAG_GOLD);
    Wd.occ = [B.sid.g, B.sc.S]; Wd.center = [0, 1.6];
    Wd.on(t => {
      B.sc.set(t, -.12 * sm(P(.5, 1.4, t)), .18 * sm(P(1.0, 2.0, t)) * (1 - sm(P(2.8, 3.6, t))));
      ban.set([0, 2.35, PZ + .6], sm(P(.2, 1.4, t)));
      rays.set(popE(P(.8, 1.8, t)), t * .6);
      tM.set([1.5, 1.9, PZ + .9], popE(P(1.4, 2.2, t)));
      B.sc.fh.set(t, { smile: sm(P(1.0, 2.0, t)), talk: talkAmt(t, 12), look: [0, 1], surprise: 0 });
      B.sid.f.set(t, { smile: .7, talk: 0, look: [1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.8, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 61)],
      [3.5, HH(punch(insert([0, 2.2, PZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [2.0]), 62)],
      [3.5, HH(insert([SCX, 1.6, SCZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 63)],
      [3.5, HH(crane([.4, 1.5, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): the scale tips to "חובה" wrongly; the dark bubble "גנות" flies off toward the shul; the stamp "לשון הרע" comes down on it; red cross + shock; tag "גם לשון הרע"
  function beat6(dur) {
    const Wd = mkWorld({}); const B = stage(Wd, SIDPOS);
    const bu = bubble(Wd);
    const tGn = tag(Wd, 1.3, .45, 'גנות', ...TAG_BAD);
    const stamp = tag(Wd, 2.2, .6, 'לשון הרע', ...TAG_BAD);
    const ck = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    const tM = tag(Wd, 2.4, .5, 'גם לשון הרע', ...TAG_BAD);
    const END = [-2.3, 2.2, PZ - .1];
    Wd.occ = [B.sid.g, B.sc.S]; Wd.center = [-.6, 1.6];
    Wd.on(t => {
      B.sc.set(t, .25 * sm(P(.3, 1.2, t)), 0);
      bu.g.scale.setScalar(Math.max(.001, popE(P(0, .4, t))));
      const fl = sm(P(.8, 2.4, t));
      const bp = L3([SCX - .62, 2.0, SCZ + .1], END, fl);
      bu.g.position.set(bp[0], bp[1] + .08 * Math.sin(t * 2), bp[2]);
      bu.f.set(t, { smile: -.4, talk: talkAmt(t, 15), surprise: sm(P(3.0, 3.6, t)), look: [1, 0] });
      tGn.set([bp[0], bp[1] + .7, bp[2] + .3], 1);
      stamp.set([END[0], lerp(2.6, 2.3, sm(P(3.0, 3.8, t))), END[2] + .8], popE(P(3.0, 3.8, t)));
      ck.set([END[0] + .2, END[1], END[2] + .6], popE(P(3.8, 4.6, t)) * .8, .05 * Math.sin(t * 4) * (t > 4.6 ? 1 : 0));
      sk.set([END[0] + .2, END[1], END[2] + .4], P(3.8, 4.6, t), 1.4);
      tM.set([0, 2.35, PZ + 1.2], popE(P(.6, 1.4, t)));
      B.sc.fh.set(t, { smile: -.6, talk: 0, look: [-1, 0] });
      B.sid.f.set(t, { smile: -.3, talk: 0, look: [1, 0] });
    });
    Wd.cam = cuts([
      [3.5, HH(truck([-.6, 1.8, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 71)],
      [3.5, HH(punch(insert([-1.4, 1.9, PZ - .2], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [3.0]), 72)],
      [3.5, HH(insert([SCX, 1.7, SCZ], { dur: 3.5, dist0: 5.6, dist1: 5.2, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 73)],
      [3.5, HH(crane([-1.0, 1.7, 0], { dur: 3.5, dist0: 6.5, dist1: 6.2, h0: 1.4, h1: 1.8, a0: 6, a1: -6, fov0: 42, fov1: 42 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): slow crane; the scale tipped to the green "זכות" side with a smiling face; the siddur with the gold badge on one side, the notebook "בינוני" on the other; NO red cross
  function answer(dur) {
    const Wd = mkWorld({}); const B = stage(Wd, [-2.5, TOP + .4, PZ + .3]);
    const nb = notebook(Wd); nb.g.scale.setScalar(1); nb.g.position.set(NBX, TOP + .55, PZ);
    const bd = tag(Wd, 1.7, .45, 'ירא שמים', ...TAG_GOLD);
    const bd2 = tag(Wd, 1.4, .45, 'בינוני', ...TAG_NEU);
    const wG = weight(B.sc.pR, .24, .16, .24, GREEN);
    Wd.occ = [B.sid.g, B.sc.S, nb.g]; Wd.center = [0, 1.4]; Wd.ansD = 6.4;
    Wd.on(t => {
      B.sc.set(t, -.25 * sm(P(0, 2, t)), 0);
      drop(wG, t, 1.0, 1.6);
      bd.set([-2.4, 2.2, PZ + .6], 1);
      bd2.set([NBX, 2.35, PZ + .6], 1);
      B.sc.fh.set(t, { smile: 1, talk: 0, look: [0, 0] });
      B.sid.f.set(t, { smile: 1, talk: 0, look: [1, 0] });
      nb.f.set(t, { smile: .8, talk: 0, look: [-1, 0] });
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur, dist0: 5.2, dist1: 4.8, h0: 1.0, h1: 2.2, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
