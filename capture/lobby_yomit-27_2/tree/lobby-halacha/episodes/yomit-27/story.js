// yomit-27 story: "אפילו עטרות ודיבון" - שניים מקרא ואחד תרגום (halacha yomit 27). Storyboard A in storyboards_v28.md.
// Adapted from episodes/yomit-26/story.js (room, tags, faces, camera helpers kept; props and beats new).
// NO people, NO figures. Heroes: a CHUMASH (blue cover, face) standing on a shtender, a small TARGUM book (brown cover, face).
// Props: three lamps on a counter (right to left = readings), a parsha scroll-strip, a magnifier, place-name tiles,
// a calendar "שבת" with a small synagogue, a green vine, a gold book "ירושלמי".
// Everything is a function of local time t.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, popE, ease, prog, clamp, lerp, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const FB = { talk: 0, smile: .3, look: [0, 0], surprise: 0, open: 1 };
  const F = (f, t, o) => f.set(t, Object.assign({}, FB, o));
  const C4 = (dur, a, b, c, d) => cuts([[dur * .25, a], [dur * .25, b], [dur * .25, c], [dur * .25, d]]);

  // ---------------------------------------------------------------- positions (metres; back wall at z=-2.4, camera on +z)
  const SX = -.2, SZ = -.6;                    // reading stand (shtender) centre on the floor
  const CH = [SX, .93, SZ];                    // chumash origin (bottom centre), standing on the slanted board
  const TGX = -.85, TGZ = -.45;                // targum book on the floor, beside the stand
  const LAMP_X = [SX + .5, SX, SX - .5];       // counter lamps, RIGHT to LEFT = reading 1, 2, 3
  const LAMP_Y = 2.2, RAIL_Y = 2.12, LAMP_Z = SZ - .15;
  const VINE = [.85, 0, -.9];
  const BLD = [1.35, 0, -1.5];                 // small synagogue, right back
  const CAL = [1.2, 2.1, -2.27];               // calendar page "שבת", right back wall
  const GOLD_X = -1.35, GOLD_Z = -.9;          // gold Yerushalmi book (slides in at beat 6)
  const TAG_Y = 1.7;                           // beat tags stay between y 1.0 and 2.5
  const CLR_FLOOR = 0xb98a5a;
  const BLUEP = ['#dbe9ff', '#14408f', '#2f6ad0'];
  const GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'];
  const GREYP = ['#ececec', '#4a4a4a', '#9a9a9a'];
  const REDP = ['#ffe3e3', '#8a1a1a', '#d33b3b'];
  const GOLDP = ['#fff3c4', '#7a5200', '#d4a017'];

  // ---------------------------------------------------------------- tags (same helpers as yomit-26)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return;
      g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s * .8); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W2, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W2 * .03, H * .06, W2 * .94, H * .88, H * .3); c.fill();
    c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W2 * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W2 / 2, H * .54);
  };
  const T2 = (Wd, w, text, pal, h) => bb(Wd, w, h || .42, drawTag(text, pal[0], pal[1], pal[2]));

  // the calendar page "שבת" (Hebrew order: the earlier day is on the RIGHT; this page is a single day)
  const drawSab = (c, W, H) => {
    c.fillStyle = '#fffdf4'; c.fillRect(0, 0, W, H);
    c.lineWidth = H * .05; c.strokeStyle = '#8a5a2a'; c.strokeRect(H * .03, H * .03, W - H * .06, H * .94);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5a3a20';
    c.font = `700 ${H * .5}px ${FONT}`; c.fillText('שבת', W / 2, H * .55);
  };

  // the lamps: show the lit ones (times[i] = the second lamp i lights up)
  const lampsOn = (Y, times, t) => Y.lamps.forEach((L, i) => { const on = t > times[i]; L.lit.visible = on; L.dim.visible = !on; });
  // small sparkles around a centre c (radius r); they pop in at time a0
  function sparks(Wd, c, r) {
    return Array.from({ length: 6 }, (_, i) => { const b = ball(.045, 0xffe36a); b.visible = false; Wd.add(b);
      return { b, c, r, a: i / 6 * 2 * PI, i }; });
  }
  const sparkUp = (S, t, a0) => S.forEach(s => {
    const k = popE(P(a0, a0 + .6, t)); s.b.visible = k > .01;
    s.b.position.set(s.c[0] + Math.cos(s.a + t * 2) * s.r, s.c[1] + Math.sin(s.a + t * 2) * s.r, s.c[2]);
    s.b.scale.setScalar(Math.max(.001, k * (.8 + .4 * Math.abs(Math.sin(t * 4 + s.i)))));
  });

  // ---------------------------------------------------------------- objects
  // the reading stand: a base, a post and a slanted board
  function makeStand(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    const base = box(.7, .05, .5, 0x6a4a2a); base.position.set(SX, .025, SZ); g.add(base);
    const post = cyl(.05, .06, .85, 0x6a4a2a); post.position.set(SX, .45, SZ - .05); g.add(post);
    const slant = box(.8, .05, .55, 0x8a5a2a); slant.position.set(SX, .9, SZ + .02); slant.rotation.x = -.35; g.add(slant);
    return g;
  }
  // the chumash: a blue cover, a page block, a highlighted line "עטרות ודיבון", a label "חומש" and a face; origin = bottom centre
  function makeChumash(Wd) {
    const g = new THREE.Group(); g.position.set(CH[0], CH[1], CH[2]); g.rotation.x = -.35; Wd.add(g);
    const cover = box(.6, .85, .12, 0x14408f); cover.position.y = .425; g.add(cover);
    const pages = box(.5, .7, .02, 0xfffbf0); pages.position.set(0, .42, .07); g.add(pages);
    const hl = new THREE.Group(); hl.position.set(0, .2, .085); g.add(hl);
    hl.add(texPlane(.46, .12, drawTag('עטרות ודיבון', '#ffe36a', '#5a3a00', '#d4a017'), { cw: 512 }));
    const lab = texPlane(.26, .12, drawTag('חומש', '#14408f', '#ffffff', '#0a2a6a'), { cw: 256 });
    lab.position.set(0, .05, .09); g.add(lab);
    const f = face(Wd, { w: .36, parent: g, pos: [0, .66, .08], seed: 5 });
    return { g, f, hl };
  }
  // the targum book: a brown cover, a label "תרגום", a page flap that opens (empty pages), and a face
  function makeTargum(Wd) {
    const g = new THREE.Group(); g.position.set(TGX, 0, TGZ); Wd.add(g);
    const cover = box(.4, .55, .1, 0x7a4a24); cover.position.y = .275; g.add(cover);
    const lab = texPlane(.28, .1, drawTag('תרגום', '#fff3dc', '#5a3010', '#7a4a24'), { cw: 256 });
    lab.position.set(0, .05, .065); g.add(lab);
    const flap = new THREE.Group(); flap.position.set(0, .14, .07); g.add(flap);
    const pg = box(.34, .2, .02, 0xfffbf0); pg.position.set(0, .1, 0); flap.add(pg);
    const f = face(Wd, { w: .3, parent: g, pos: [0, .42, .07], seed: 7 });
    return { g, f, flap };
  }
  // the counter: a rail and three lamps (each lamp: a dim disc, a lit disc, a gold disc for the Yerushalmi beat)
  function makeLamps(Wd) {
    const rail = box(1.5, .05, .08, 0x6a4a2a); rail.position.set(SX, RAIL_Y, LAMP_Z); Wd.add(rail);
    return LAMP_X.map(x => {
      const dim = cyl(.12, .12, .08, 0x5a5a6a); dim.rotation.x = PI / 2; dim.position.set(x, LAMP_Y, LAMP_Z); Wd.add(dim);
      const lit = cyl(.12, .12, .1, 0xffc53a); lit.rotation.x = PI / 2; lit.position.set(x, LAMP_Y, LAMP_Z + .005); lit.visible = false; Wd.add(lit);
      const gold = cyl(.12, .12, .11, 0xd4a017); gold.rotation.x = PI / 2; gold.position.set(x, LAMP_Y, LAMP_Z + .01); gold.visible = false; Wd.add(gold);
      return { dim, lit, gold };
    });
  }
  // the parsha scroll-strip "פרשת מטות": a long cream strip behind everything; its x is set by each beat
  function makeStrip(Wd) {
    const g = new THREE.Group(); g.position.set(0, 1.5, -2.1); Wd.add(g);
    const sb = box(3.6, .32, .03, 0xf6e6c0); g.add(sb);
    const st = texPlane(1.3, .22, drawTag('פרשת מטות', '#f6e6c0', '#5a3010', '#b8862a'), { cw: 512 });
    st.position.z = .02; g.add(st);
    return g;
  }
  // the small synagogue: a box, a dome and a door (no people)
  function makeBld(Wd) {
    const g = new THREE.Group(); g.position.set(BLD[0], BLD[1], BLD[2]); Wd.add(g);
    const b = box(.6, .4, .4, 0xf0e6d0); b.position.y = .2; g.add(b);
    const d = ball(.2, 0x3f7ad0); d.scale.y = .7; d.position.y = .48; g.add(d);
    const dr = box(.14, .22, .02, 0x6a4a2a); dr.position.set(0, .11, .21); g.add(dr);
    return g;
  }
  // the green vine: a pot, a stem that grows tall, and leaves that pop out on it
  function makeVine(Wd) {
    const g = new THREE.Group(); g.position.set(VINE[0], 0, VINE[2]); Wd.add(g);
    const pot = box(.3, .22, .3, 0xb5532f); pot.position.y = .11; g.add(pot);
    const stem = new THREE.Group(); stem.position.y = .22; g.add(stem);
    const trunk = cyl(.03, .04, 1.2, 0x3f7a2a); trunk.position.y = .6; stem.add(trunk);
    const leaves = [.35, .6, .85, 1.1].map((h, i) => { const l = ball(.1, 0x3f9a4a); l.position.set(i % 2 ? .12 : -.12, h, .02); l.scale.setScalar(.001); stem.add(l); return l; });
    return { g, stem, leaves };
  }
  // the gold Yerushalmi book: a gold cover with a label; it starts off-screen left
  function makeGold(Wd) {
    const g = new THREE.Group(); g.position.set(GOLD_X, 0, GOLD_Z); Wd.add(g);
    const cv = box(.3, .42, .1, 0xd4a017); cv.position.y = .21; g.add(cv);
    const lb = texPlane(.26, .1, drawTag('ירושלמי', '#fff3c4', '#7a5200', '#b8862a'), { cw: 512 });
    lb.position.set(0, .3, .055); g.add(lb);
    return g;
  }
  // the magnifier: a rim and a lens disc facing the camera
  function makeMag(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    const rim = cyl(.17, .17, .03, 0x6a4a2a); rim.rotation.x = PI / 2; g.add(rim);
    const lens = cyl(.14, .14, .01, 0xbfe6ff); lens.rotation.x = PI / 2; lens.position.z = .02; g.add(lens);
    return g;
  }
  // the room: back wall, floor, rug, calendar and all the objects (beats show or hide them)
  function room(Wd) {
    const back = box(12, 6, .2, 0xf3e3c8); back.position.set(0, 2.5, -2.4); Wd.add(back);
    const floor = box(12, .1, 10, CLR_FLOOR); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const rug = box(3, .02, 2.2, 0xd9b38c); rug.position.set(-.3, .01, -.6); Wd.add(rug);
    const cal = texPlane(1.0, .6, drawSab, { cw: 512 }); cal.position.set(CAL[0], CAL[1], CAL[2]); Wd.add(cal);
    const Y = { stand: makeStand(Wd), chu: makeChumash(Wd), tg: makeTargum(Wd), lamps: makeLamps(Wd), strip: makeStrip(Wd),
                bld: makeBld(Wd), vine: makeVine(Wd), gold: makeGold(Wd), mag: makeMag(Wd) };
    Y.gold.position.x = -2.6;      // off-screen until beat 6
    Y.mag.visible = false;         // on only in beat 2
    return Y;
  }

  // ================================================================ HOOK 0-14: extreme close-up on the chumash face and its glowing line, pull out; the stand, the lamps and the targum appear; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    Wd.on(t => {
      Y.chu.hl.scale.setScalar(1 + .05 * Math.sin(t * 3));
      F(Y.chu.f, t, { smile: t > 6 ? .5 : .2, look: [0, .2], talk: t > 1 ? .5 * talkAmt(t, 61) : 0 });
      F(Y.tg.f, t, { smile: .2, look: [.3, .2], talk: t > 9 ? .4 * talkAmt(t, 62) : 0 });
    });
    Wd.occ = []; Wd.center = [SX, 1.2]; Wd.qPos = [SX - .2, SZ + .4];
    Wd.cam = C4(dur,
      HH(pullOut([SX, 1.25, SZ + .35], { dur: dur * .25, dist0: 1.3, dist1: 2.2, h0: 1.25, h1: 1.3, a0: 4, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([-.5, 1.2, -.4], { dur: dur * .25, dist0: 3.0, dist1: 3.2, h0: 1.1, h1: 1.4, a0: -4, a1: 6, fov0: 38, fov1: 42 }), 42),
      HH(truck([-.4, 1.1, -.4], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.2, h1: 1.3, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([SX, 1.2, SZ], { dur: dur * .25, dist0: 2.6, dist1: 2.3, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, good): the parsha strip slides past behind; lamps light right-to-left (reading, reading, targum); the targum hops; tag "שניים ואחד"
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const LT = [T2(Wd, .7, 'מקרא', BLUEP, .22), T2(Wd, .7, 'מקרא', BLUEP, .22), T2(Wd, .7, 'תרגום', GOLDP, .22)];
    const TG = T2(Wd, 2.0, 'שניים ואחד', BLUEP, .42);
    const LT_T = [3.4, 5.9, 8.4], LIT = [3, 5.5, 8];
    Wd.on(t => {
      Y.strip.position.x = lerp(1.8, -1.8, clamp(t / dur, 0, 1));
      lampsOn(Y, LIT, t);
      LT.forEach((L, i) => L.set([LAMP_X[i], 2.45, LAMP_Z], popE(P(LT_T[i], LT_T[i] + .5, t)), 0, 1));
      Y.tg.g.position.y = .3 * Math.max(0, Math.sin(PI * clamp((t - 8) / 1.4, 0, 1)));
      Y.bld.scale.setScalar(Math.max(.001, popE(P(0, 1, t))));
      TG.set([0, TAG_Y, .6], popE(P(9.5, 10.3, t)), 0, 1);
      F(Y.chu.f, t, { smile: t > 9 ? .8 : .3, look: [0, .2], talk: .5 * talkAmt(t, 63) });
      F(Y.tg.f, t, { smile: .2, look: [.4, .2], talk: t > 8 && t < 10 ? .6 * talkAmt(t, 64) : 0 });
    });
    Wd.occ = []; Wd.center = [SX, 1.6];
    Wd.cam = C4(dur,
      HH(truck([SX, 1.7, SZ + .3], { dur: dur * .25, dist0: 3.4, dist1: 3.2, h0: 1.6, h1: 1.8, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 11),
      HH(punch(pushIn([SX, 1.5, SZ], { dur: dur * .25, dist0: 2.8, dist1: 2.5, h0: 1.5, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [1.4]), 12),
      HH(insert([SX + .2, 2.1, SZ], { dur: dur * .25, dist0: 1.9, dist1: 1.8, h0: 1.9, h1: 2.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([SX, 1.7, SZ], { dur: dur * .25, dist0: 3.4, dist1: 3.2, h0: 1.6, h1: 1.8, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (14, good): a magnifier glides over the chumash line and enlarges it; place-name tiles pop out one by one; tag "עטרות ודיבון"
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    Y.mag.visible = true;
    const tiles = [['עטרות', [SX - .8, 1.0, SZ + .4]], ['דיבון', [SX + .75, 1.0, SZ + .4]],
                   ['יעזר', [SX - .85, 1.6, SZ + .2]], ['נמרה', [SX + .8, 1.6, SZ + .2]]]
      .map(([s, p], i) => ({ p, i, t: T2(Wd, .6, s, GREENP, .26) }));
    const TG = T2(Wd, 1.9, 'עטרות ודיבון', GOLDP, .42);
    Wd.on(t => {
      const k = sm(P(.5, dur - 2, t));
      Y.mag.position.set(lerp(SX - .6, SX + .35, k), 1.15 + .05 * Math.sin(t * 2), SZ + .5);
      Y.chu.hl.scale.setScalar(1 + .2 * popE(P(1.5, 2.5, t)));
      tiles.forEach(T => T.t.set(T.p, popE(P(4.5 + T.i * 1.3, 5.3 + T.i * 1.3, t)), 0, 1));
      TG.set([0, TAG_Y, .6], popE(P(1.2, 2.0, t)), 0, 1);
      F(Y.chu.f, t, { smile: .4, look: [.4, .2], talk: .4 * talkAmt(t, 71) });
      F(Y.tg.f, t, { smile: .2, look: [.5, .2] });
    });
    Wd.occ = []; Wd.center = [SX, 1.2];
    Wd.cam = C4(dur,
      HH(truck([SX, 1.3, SZ + .2], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 21),
      HH(pushIn([SX, 1.2, SZ], { dur: dur * .25, dist0: 2.6, dist1: 2.3, h0: 1.2, h1: 1.3, a0: -6, a1: 6, fov0: 40, fov1: 38 }), 22),
      HH(insert([SX, 1.2, SZ + .2], { dur: dur * .25, dist0: 1.8, dist1: 1.6, h0: 1.2, h1: 1.3, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(orbitShot([SX, 1.3, SZ], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (14, bad-neutral): the targum opens its flap onto empty pages; a grey "?" puffs out; the targum shrugs; tag "אין תרגום"
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const Q = T2(Wd, .6, '?', GREYP, .5);
    const TG = T2(Wd, 1.4, 'אין תרגום', REDP, .4);
    Wd.on(t => {
      Y.tg.flap.rotation.x = -1.5 * sm(P(1, 3.5, t));
      Y.tg.g.rotation.z = .3 * sm(P(4, 5, t)) + .04 * Math.sin(t * 7) * P(5, 7, t);
      Q.set([TGX + .15, .95 + .5 * P(4, 5.5, t), TGZ + .3], popE(P(3.8, 4.6, t)) * (1 - .3 * P(5.5, 7, t)), 0, 1 - P(6.5, 7.5, t));
      TG.set([-.5, 1.45, .2], popE(P(2.2, 3.0, t)), 0, 1);
      F(Y.tg.f, t, { smile: -.2, look: [-.5, .2], talk: .5 * talkAmt(t, 74) });
      F(Y.chu.f, t, { smile: -.1, look: [-.5, .2], talk: t < 3 ? .3 * talkAmt(t, 75) : 0 });
    });
    Wd.occ = []; Wd.center = [-.5, 1.0];
    Wd.cam = C4(dur,
      HH(truck([-.5, 1.1, -.5], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 31),
      HH(pushIn([-.5, 1.0, -.5], { dur: dur * .25, dist0: 2.6, dist1: 2.3, h0: 1.1, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), 32),
      HH(insert([TGX + .1, .8, TGZ + .1], { dur: dur * .25, dist0: 1.8, dist1: 1.7, h0: .9, h1: 1.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 33),
      HH(orbitShot([-.5, 1.1, -.5], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (16, good): the lamps light again right-to-left over the same glowing line; "במקום התרגום" under lamp 3; green check + sparkles; tag "שלוש פעמים"
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const LT = [T2(Wd, .7, 'מקרא', BLUEP, .22), T2(Wd, .7, 'מקרא', BLUEP, .22), T2(Wd, .95, 'במקום התרגום', GOLDP, .22)];
    const LT_T = [1.3, 2.8, 5.5], LIT = [1, 2.5, 4];
    const CK = mark3d(Wd, 'check', .6);
    const sp = sparks(Wd, [SX + 1.0, 1.5, SZ + .3], .3);
    const TG = T2(Wd, 1.8, 'שלוש פעמים', GREENP, .42);
    Wd.on(t => {
      lampsOn(Y, LIT, t);
      LT.forEach((L, i) => L.set([LAMP_X[i], 2.45, LAMP_Z], popE(P(LT_T[i], LT_T[i] + .5, t)), 0, 1));
      Y.chu.hl.scale.setScalar(1.1 + .06 * Math.sin(t * 4));
      CK.set([SX + 1.0, 1.5, SZ + .3], popE(P(9.4, 10.0, t)) * .9, 0);
      sparkUp(sp, t, 9.4);
      TG.set([0, TAG_Y, .6], popE(P(8.4, 9.2, t)), 0, 1);
      F(Y.chu.f, t, { smile: t > 9 ? 1 : .4, look: [0, .2], talk: t > 1 ? .5 * talkAmt(t, 76) : 0 });
      F(Y.tg.f, t, { smile: t > 9 ? .6 : 0, look: [.3, .2] });
    });
    Wd.occ = []; Wd.center = [SX, 1.7];
    Wd.cam = C4(dur,
      HH(truck([SX + .3, 1.7, SZ + .2], { dur: dur * .25, dist0: 3.4, dist1: 3.2, h0: 1.6, h1: 1.8, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 61),
      HH(punch(pushIn([SX, 1.6, SZ], { dur: dur * .25, dist0: 2.8, dist1: 2.5, h0: 1.6, h1: 1.7, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .5]), 62),
      HH(insert([SX + .2, 2.1, SZ], { dur: dur * .25, dist0: 1.9, dist1: 1.8, h0: 1.9, h1: 2.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 63),
      HH(orbitShot([SX, 1.7, SZ], { dur: dur * .25, dist0: 3.4, dist1: 3.2, h0: 1.6, h1: 1.8, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (14, good): the synagogue shows (label "עם הציבור"); the green vine grows tall beside the chumash, leaves pop out; tag "אריכות ימים"
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const BL = T2(Wd, 1.1, 'עם הציבור', BLUEP, .24);
    const TG = T2(Wd, 1.8, 'אריכות ימים', GREENP, .42);
    Wd.on(t => {
      lampsOn(Y, [0, 0, 0], t);
      Y.bld.scale.setScalar(Math.max(.001, popE(P(.5, 1.3, t))));
      BL.set([BLD[0], 1.0, BLD[2] + .5], popE(P(1.4, 2.2, t)), 0, 1);
      Y.vine.stem.scale.y = Math.max(.02, sm(P(1, 6, t)));
      Y.vine.leaves.forEach((l, i) => l.scale.setScalar(Math.max(.001, popE(P(3 + i * .7, 3.6 + i * .7, t)))));
      TG.set([VINE[0] - .05, TAG_Y, VINE[2] + .4], popE(P(6.5, 7.4, t)), 0, 1);
      F(Y.chu.f, t, { smile: .8, look: [.2, .2], talk: .4 * talkAmt(t, 81) });
      F(Y.tg.f, t, { smile: .5, look: [.4, .2] });
    });
    Wd.occ = []; Wd.center = [.5, 1.2];
    Wd.cam = C4(dur,
      HH(truck([.5, 1.3, -.9], { dur: dur * .25, dist0: 3.4, dist1: 3.2, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 71),
      HH(pushIn([VINE[0], 1.1, VINE[2]], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.1, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), 72),
      HH(insert([VINE[0], 1.3, VINE[2] + .3], { dur: dur * .25, dist0: 1.9, dist1: 1.8, h0: 1.3, h1: 1.5, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([.5, 1.3, -.9], { dur: dur * .25, dist0: 3.4, dist1: 3.2, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (14, good): the gold book "ירושלמי" slides in beside the targum; lamp 3 turns gold; an orange pulse runs to it; green check; tag "תרגום ירושלמי"
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    Y.gold.position.x = -2.6;
    const LT = T2(Wd, 1.0, 'יש מחמירים', GOLDP, .24);
    const TG = T2(Wd, 1.2, 'תרגום ירושלמי', GOLDP, .32);
    const CK = mark3d(Wd, 'check', .6);
    const sp = sparks(Wd, [-1.0, 1.5, SZ + .3], .3);
    const pul = ball(.09, 0xff8a1a); Wd.add(pul);
    Wd.on(t => {
      lampsOn(Y, [0, 0, 0], t);
      Y.lamps[2].gold.visible = t > 4;
      Y.gold.position.x = lerp(-2.6, GOLD_X, sm(P(.5, 2.5, t)));
      LT.set([GOLD_X, 1.0, GOLD_Z + .3], popE(P(4.2, 5.0, t)), 0, 1);
      const u = (t * .5) % 1;
      const a = [LAMP_X[2], LAMP_Y - .1, LAMP_Z], b = [GOLD_X, .45, GOLD_Z + .1];
      pul.position.set(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
      pul.scale.setScalar(Math.max(.001, popE(clamp(u * 4, 0, 1)) * (1 - .5 * u)));
      CK.set([-1.0, 1.5, SZ + .3], popE(P(9.2, 10.0, t)) * .9, 0);
      sparkUp(sp, t, 9.2);
      TG.set([-1.0, 1.35, -.3], popE(P(3.4, 4.2, t)), 0, 1);
      F(Y.chu.f, t, { smile: .8, look: [-.3, .2], talk: .4 * talkAmt(t, 86) });
      F(Y.tg.f, t, { smile: .8, look: [-.5, .2], talk: .4 * talkAmt(t, 87) });
    });
    Wd.occ = []; Wd.center = [-.5, 1.1];
    Wd.cam = C4(dur,
      HH(truck([-.5, 1.2, -.5], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 91),
      HH(punch(pushIn([GOLD_X + .3, 1.0, GOLD_Z], { dur: dur * .25, dist0: 2.6, dist1: 2.3, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .5]), 92),
      HH(insert([GOLD_X + .2, .9, GOLD_Z + .2], { dur: dur * .25, dist0: 1.8, dist1: 1.7, h0: .9, h1: 1.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 93),
      HH(orbitShot([-.5, 1.2, -.5], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 94));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the chumash with three lit lamps at one side, the gold book and the vine at the other; slow crane. NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    Y.gold.position.x = GOLD_X;
    Y.vine.stem.scale.y = 1;
    Y.vine.leaves.forEach(l => l.scale.setScalar(1));
    Y.bld.scale.setScalar(1);
    Y.lamps.forEach((L, i) => { L.lit.visible = true; L.dim.visible = false; L.gold.visible = i === 2; });
    const pul = ball(.09, 0xff8a1a); Wd.add(pul);
    Wd.on(t => {
      Y.strip.position.x = -.4 + .3 * Math.sin(t * .5);
      const u = (t * .5) % 1;
      const a = [LAMP_X[2], LAMP_Y - .1, LAMP_Z], b = [GOLD_X, .45, GOLD_Z + .1];
      pul.position.set(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
      pul.scale.setScalar(Math.max(.001, popE(clamp(u * 4, 0, 1)) * (1 - .5 * u)));
      F(Y.chu.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 3) });
      F(Y.tg.f, t, { smile: .6, look: [-.3, .2], talk: .3 * talkAmt(t, 4) });
    });
    Wd.occ = []; Wd.center = [0, 1.2]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur: dur, dist0: 5.2, dist1: 4.8, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
