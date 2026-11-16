// yomit-16 story: "כיבוד הורים - הכרת הטוב, טרחה ואריכות ימים" (halacha yomit 16). Storyboard A in storyboards_v17.md.
// Copied from episodes/yomit-15/story.js (living room, two armchairs with crowns, tags, camera helpers, faces).
// NO people, NO figures. Parents = the two armchairs with crowns.
// Heroes (talking objects with faces): GIFT BOX with a bow, TRAY, HEAVY STONE, HOURGLASS.
// Moving diagrams: mitzva blocks, root that glows, thank-you ribbon, staircase to a light, bracha card, ramp, days ribbon, gates.
// Everything is a function of local time t.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const lerpV = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
  const arcV = (a, b, u, h) => { const p = lerpV(a, b, u); p[1] += h * Math.sin(PI * u); return p; };
  const fract = x => x - Math.floor(x);
  const FB = { talk: 0, smile: .3, look: [0, 0], surprise: 0, open: 1 };
  const F = (f, t, o) => f.set(t, Object.assign({}, FB, o));
  const placeG = (g, p, ry, rx) => { g.position.set(p[0], p[1], p[2]); g.rotation.set(rx || 0, ry || 0, 0); };
  const col = (a, b, u) => new THREE.Color(a).lerp(new THREE.Color(b), u).getHex();
  const C4 = (dur, a, b, c, d) => cuts([[dur * .25, a], [dur * .25, b], [dur * .25, c], [dur * .25, d]]);

  // ---------------------------------------------------------------- positions (metres; back wall at z=-2.4, camera on +z)
  const ABA = [-1.1, 0, -1.7], IMA = [1.2, 0, -1.7];                    // the two armchairs (parents)
  const CROWN_A = [-1.1, 1.95, -1.7], CROWN_I = [1.2, 1.6, -1.7];
  const TAG_A = [-1.1, 2.5, -1.7], TAG_I = [1.2, 2.05, -1.7];
  const TABLE = [.05, .3, .15];                                         // low table under the gift (hook, beats 1-2)
  const GIFT_F = [.05, .9, .15];                                        // gift box on the table
  const TRAY4 = [1.0, .15, .6];                                       // tray keeps serving on the floor (beat 4)
  const MTR = [-.7, 2.25, -1.05];                                       // meter (beat 5)
  const HP = [0, .9, -.4];                                              // hourglass in front, between the chairs (beat 6)
  const CLR_GOLD = 0xffd23a, CLR_BLUE = 0x2f5fb8, CLR_ROSE = 0xd9779a, CLR_ROOT = 0x5a3a20, CLR_GREY = 0x7a8090;
  const ROOTS = [[-1.1, -1.0, 0, 1.6], [1.2, -1.0, 0, 1.6], [.05, -1.3, PI / 2, 1.4], [-.6, -1.5, -.4, 1.2], [.9, -1.55, .5, 1.1]];
  const BLUEP = ['#dbe9ff', '#14408f', '#2f6ad0'], ROSEP = ['#ffe1ec', '#8a1a4a', '#d9779a'];
  const GOLDP = ['#fff1c2', '#6a3a00', '#d9a63a'], GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'];
  const WHITEP = ['#ffffff', '#2d3a6b', '#9aa7c4'], GREYP = ['#e6e6e6', '#444444', '#8a8a8a'];

  // ---------------------------------------------------------------- tags (same helpers as yomit-15)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return;
      g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W2, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W2 * .03, H * .06, W2 * .94, H * .88, H * .3); c.fill();
    c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W2 * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W2 / 2, H * .54);
  };

  // ---------------------------------------------------------------- an armchair (no face, no body)
  function chair(Wd, p, s, c) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); g.scale.setScalar(s); Wd.add(g);
    const seat = box(1.2, .5, 1.0, c); seat.position.set(0, .35, 0); g.add(seat);
    const back = box(1.2, 1.0, .22, c); back.position.set(0, .95, -.4); g.add(back);
    [-.6, .6].forEach(x => { const a = box(.2, .6, 1.0, c); a.position.set(x, .7, 0); g.add(a); });
    return g;
  }
  // a gold crown: a ring with three points
  function makeCrown(parent, c) {
    const g = new THREE.Group(); parent.add(g);
    g.add(cyl(.22, .22, .08, c));
    [-.16, 0, .16].forEach(x => { const k = cyl(0, .07, .2, c); k.position.set(x, .14, 0); g.add(k); });
    return g;
  }

  // ---------------------------------------------------------------- the living room (fresh per beat)
  function room(Wd, skyCol) {
    const Y = {};
    Y.back = box(12, 6, .2, 0xf3e3c8); Y.back.position.set(0, 2.5, -2.4); Wd.add(Y.back);
    const floor = box(12, .1, 10, 0xb98a5a); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const rug = box(3.6, .02, 2.6, 0xd9b38c); rug.position.set(0, .01, -.1); Wd.add(rug);
    Y.sky = box(3.0, 1.8, .05, skyCol); Y.sky.position.set(0, 2.5, -2.33); Wd.add(Y.sky);
    const WF = 0x8a5a32;
    [3.56, 1.64].forEach(y => { const b = box(3.2, .14, .14, WF); b.position.set(0, y, -2.3); Wd.add(b); });
    [-1.56, 1.56].forEach(x => { const b = box(.14, 1.92, .14, WF); b.position.set(x, 2.6, -2.3); Wd.add(b); });
    Y.tbl = box(1.4, .6, .9, 0x8a5a32); Y.tbl.position.set(TABLE[0], TABLE[1], TABLE[2]); Wd.add(Y.tbl);
    Y.abaG = chair(Wd, ABA, 1.15, CLR_BLUE);                             // "אבא"
    Y.imaG = chair(Wd, IMA, .9, CLR_ROSE);                               // "אמא"
    Y.cA = makeCrown(Wd, CLR_GOLD); Y.cI = makeCrown(Wd, CLR_GOLD);
    // meter (background + fill, left-anchored); shown in beat 5
    Y.mBg = box(1.4, .22, .08, 0x444a66); Y.mBg.position.set(MTR[0] + .7, MTR[1], MTR[2]); Wd.add(Y.mBg);
    Y.mFill = box(1.4, .18, .1, 0x3fdc6a); Wd.add(Y.mFill);
    Y.mBg.visible = false; Y.mFill.visible = false;
    // roots under the floor line in front of the chairs (glow = the root of the good deed)
    Y.roots = ROOTS.map(([x, z, ry, len]) => { const m = box(len, .05, .08, CLR_ROOT); m.position.set(x, .04, z); m.rotation.y = ry; Wd.add(m); return m; });
    // marks and shocks
    Y.check = mark3d(Wd, 'check', 1.0); Y.cross = mark3d(Wd, 'cross', .6);
    Y.shockR = shock(Wd, 0xff7a7a); Y.shockG = shock(Wd, 0x6dff9a);
    Y.spark = [0, 1, 2, 3].map(() => { const s = ball(.07, 0xffe36a); s.visible = false; Wd.add(s); return s; });
    // tags
    Y.T = {};
    const TG = (k, w, text, p, h) => { Y.T[k] = bb(Wd, w, h || .42, drawTag(text, p[0], p[1], p[2])); };
    TG('aba', 1.0, 'אבא', BLUEP); TG('ama', 1.0, 'אמא', ROSEP);
    TG('gift', 1.5, 'הכרת הטוב', GOLDP, .46); TG('tray', 1.2, 'מעשה', GREENP);
    TG('stone', 1.2, 'טרחה', WHITEP); TG('hour', 1.6, 'אריכות ימים', GREENP);
    TG('mitz', 1.8, 'כיבוד אב ואם', GOLDP, .46); TG('top', 2.2, 'חמורה שבחמורות', GOLDP, .46);
    TG('root', 1.5, 'הכרת הטוב', GOLDP); TG('cradle', 2.2, 'הביאו אותו לעולם', WHITEP, .46);
    TG('thank', 2.4, 'הכרת טובה לה׳', GOLDP, .46);
    TG('noB', 1.5, 'אין ברכה', GREYP); TG('qs', 1.5, 'מכמה טעמים', WHITEP);
    TG('q', .5, '?', WHITEP, .5);
    TG('meter', 1.6, 'צער וטרחה', WHITEP, .4);
    TG('gateH', 1.8, 'העולם הזה', WHITEP, .46); TG('gateB', 1.8, 'העולם הבא', GOLDP, .46);
    return Y;
  }
  // the two parents: crowns bob, tags stay on
  function parents(Y, t) {
    placeG(Y.cA, [CROWN_A[0], CROWN_A[1] + .05 * Math.sin(t * 2), CROWN_A[2]], 0, 0);
    placeG(Y.cI, [CROWN_I[0], CROWN_I[1] + .05 * Math.sin(t * 2 + 1.5), CROWN_I[2]], 0, 0);
    Y.T.aba.set(TAG_A, 1, 0, 1);
    Y.T.ama.set(TAG_I, 1, 0, 1);
  }
  // the roots glow gold as the good deed takes root (u = 0 dark, 1 gold)
  function glow(Y, u) { Y.roots.forEach(m => m.material.color.setHex(col(CLR_ROOT, CLR_GOLD, u))); }

  // ---------------------------------------------------------------- heroes (objects with faces; face on the +z side)
  function makeGift(Wd) {
    const G = {}; G.g = new THREE.Group(); Wd.add(G.g);
    G.body = box(.9, .6, .6, 0xd64a6a); G.g.add(G.body);
    const ribbon = box(.14, .62, .64, CLR_GOLD); G.g.add(ribbon);
    [-.14, .14].forEach(x => { const b = ball(.13, CLR_GOLD); b.position.set(x, .36, 0); G.g.add(b); });
    G.f = face(Wd, { w: .45, parent: G.g, pos: [0, -.04, .36], seed: 81 });
    return G;
  }
  function makeTray(Wd) {
    const T = {}; T.g = new THREE.Group(); Wd.add(T.g);
    T.body = box(1.0, .3, .7, 0x9a6a3a); T.g.add(T.body);
    T.plate = cyl(.3, .3, .04, 0xffffff); T.plate.position.set(-.18, .17, 0); T.g.add(T.plate);
    T.cup = cyl(.11, .09, .22, 0xf4f8ff); T.cup.position.set(.3, .21, .05); T.g.add(T.cup);
    T.liq = cyl(.095, .095, .2, 0x7a3a10); T.liq.position.set(.3, .21, .05); T.liq.scale.y = .001; T.g.add(T.liq);
    T.food = [[-.32, .26, .05, 0xff6b6b], [-.1, .28, .1, 0xffd23a], [-.2, .3, -.1, 0x6dff9a]].map(([x, y, z, c]) => {
      const b = ball(.1, c); b.position.set(x, y, z); T.g.add(b); return b; });
    T.f = face(Wd, { w: .42, parent: T.g, pos: [0, 0, .36], seed: 91 });
    return T;
  }
  function makeStone(Wd) {
    const S = {}; S.g = new THREE.Group(); Wd.add(S.g);
    S.body = ball(.42, CLR_GREY); S.g.add(S.body);
    S.f = face(Wd, { w: .36, parent: S.g, pos: [0, 0, .42], seed: 82 });
    return S;
  }
  function makeHour(Wd) {
    const H = {}; H.g = new THREE.Group(); Wd.add(H.g);
    H.top = cyl(.3, .05, .42, 0xf3d9a0); H.top.position.y = .24; H.g.add(H.top);
    H.bot = cyl(.05, .3, .42, 0xf3d9a0); H.bot.position.y = -.24; H.g.add(H.bot);
    [.5, -.5].forEach(y => { const c = cyl(.34, .34, .06, 0x8a5a32); c.position.y = y; H.g.add(c); });
    H.sand = cyl(.16, .04, .2, 0xffc23a); H.sand.position.y = -.36; H.g.add(H.sand);
    H.drop = ball(.04, 0xffc23a); H.g.add(H.drop);
    H.f = face(Wd, { w: .42, parent: H.g, pos: [0, 0, .33], seed: 83 });
    return H;
  }
  // a glowing tree root, flat on the floor, lit with the root tag
  function makeGate(Wd, x, c) {
    const g = new THREE.Group(); g.position.set(x, 0, -1.2); Wd.add(g);
    const l = box(.14, 1.7, .14, c); l.position.set(-.5, .85, 0); g.add(l);
    const r = box(.14, 1.7, .14, c); r.position.set(.5, .85, 0); g.add(r);
    const tp = box(1.14, .14, .14, c); tp.position.set(0, 1.7, 0); g.add(tp);
    return [l.material, r.material, tp.material];
  }

  // ---------------------------------------------------------------- HOOK 0-14: extreme close-up on the gift box; pull out to the armchairs with crowns; the roots glow faintly; "?" above the gift
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const G = makeGift(Wd);
    Wd.on(t => {
      parents(Y, t);
      glow(Y, .25 + .15 * Math.sin(t * 2));
      placeG(G.g, [GIFT_F[0], GIFT_F[1] + .03 * Math.sin(t * 3), GIFT_F[2]], .25 * Math.sin(t * 1.6), 0);
      Y.T.gift.set([GIFT_F[0], GIFT_F[1] + .8, GIFT_F[2]], popE(P(1, 2, t)), 0, 1);
      F(G.f, t, { smile: -.2, look: [0, .1], talk: .6 * talkAmt(t, 7) });
    });
    Wd.occ = []; Wd.center = [0, .6]; Wd.qPos = [GIFT_F[0], GIFT_F[2] + .4];
    Wd.cam = C4(dur,
      HH(pullOut([GIFT_F[0], GIFT_F[1] + .1, GIFT_F[2]], { dur: dur * .25, dist0: 1.1, dist1: 1.8, h0: .5, h1: .7, a0: 4, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([0, .9, -.6], { dur: dur * .25, dist0: 3.2, dist1: 6.0, h0: .8, h1: 1.4, a0: -4, a1: 6, fov0: 38, fov1: 44 }), 42),
      HH(truck([0, .9, -.2], { dur: dur * .25, dist0: 6.6, dist1: 6.2, h0: 1.1, h1: 1.3, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([0, 1.0, -.2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14): a column of mitzva blocks grows in front; the block "כיבוד אב ואם" rises above all others and turns gold; tag "חמורה שבחמורות"; punch
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const G = makeGift(Wd); placeG(G.g, GIFT_F, 0, 0);
    const HB = [.6, .9, 2.2, 1.0, .7], BX = [-1.8, -.9, 0, .9, 1.8];
    const blocks = BX.map(x => { const m = box(.38, 1, .38, CLR_GREY); m.position.set(x, 0, 1.1); m.scale.y = .001; Wd.add(m); return m; });
    Wd.on(t => {
      parents(Y, t); glow(Y, .15);
      const h2 = Math.max(.001, sm(P(1.0, 2.2, t)) * HB[2]);
      blocks.forEach((m, i) => { const s = i === 2 ? h2 : Math.max(.001, sm(P(.4 + .3 * i, 1.4 + .3 * i, t)) * HB[i]); m.scale.y = s; m.position.y = s * .5; });
      blocks[2].material.color.setHex(col(CLR_GREY, CLR_GOLD, sm(P(2.6, 3.6, t))));
      Y.T.mitz.set([0, h2 + .35, 1.1], popE(P(2.6, 3.4, t)), 0, 1);
      Y.T.top.set([0, 3.05, 1.1], popE(P(4, 5, t)), 0, 1);
      Y.T.gift.set([GIFT_F[0], GIFT_F[1] + .8, GIFT_F[2]], 0, 0, 1);   // hidden here: no overlap with the blocks' tags
      F(G.f, t, { smile: .6, look: [0, .1], talk: t > 1 ? .6 * talkAmt(t, 11) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.0, -.6], { dur: dur * .25, dist0: 8.6, dist1: 8.0, h0: 1.2, h1: 1.5, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 11),
      HH(punch(pushIn([0, 1.6, .6], { dur: dur * .25, dist0: 7.0, dist1: 6.4, h0: 1.6, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [1.4]), 12),
      HH(insert([0, 2.2, 1.1], { dur: dur * .25, dist0: 4.8, dist1: 4.2, h0: 1.5, h1: 1.8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([0, 1.6, -.6], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28): a tree grows beside the blue chair; its glowing root carries "הכרת הטוב"; a pink ribbon of thanks flows from the gift to the chairs; a cradle with a star pops above the chairs ("הביאו אותו לעולם")
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const G = makeGift(Wd); placeG(G.g, GIFT_F, 0, 0);
    const tree = new THREE.Group(); tree.position.set(-2.4, 0, -1.3); Wd.add(tree);
    const trunk = cyl(.12, .16, 1.6, 0x8a5a32); trunk.position.y = .8; tree.add(trunk);
    const crown = ball(.6, 0x3fae5a); crown.position.y = 1.9; tree.add(crown);
    const cradle = new THREE.Group(); cradle.position.set(0, 2.3, -1.7); Wd.add(cradle);
    const cb = box(.7, .14, .42, 0x8a5a32); cradle.add(cb);
    const star = ball(.14, CLR_GOLD); star.position.y = .3; cradle.add(star);
    const RS = [GIFT_F[0], GIFT_F[1] + .4, GIFT_F[2]], RE = [.05, 1.5, -1.6];
    const RIB = Array.from({ length: 6 }, () => { const b = ball(.08, 0xff6fa0); Wd.add(b); return b; });
    Wd.on(t => {
      parents(Y, t); glow(Y, sm(P(2, 3, t)));
      tree.scale.setScalar(Math.max(.001, sm(P(0, 2, t))));
      Y.T.root.set([-1.1, .5, -1.0], popE(P(2.5, 3.5, t)), 0, 1);
      RIB.forEach((b, i) => { const p = arcV(RS, RE, fract(t * .3 + i / 6), .5); b.position.set(p[0], p[1], p[2]); b.scale.setScalar(Math.max(.001, popE(P(1, 2, t)))); });
      cradle.scale.setScalar(Math.max(.001, popE(P(5, 6, t))));
      star.position.y = .3 + .05 * Math.sin(t * 4);
      Y.T.cradle.set([0, 2.85, -1.7], popE(P(5.4, 6.4, t)), 0, 1);
      Y.T.gift.set([GIFT_F[0], GIFT_F[1] + .8, GIFT_F[2]], 1, 0, 1);
      Y.check.set([-1.9, 2.6, -.4], popE(P(7, 8, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([-1.9, 2.6, -.4], P(7, 7.8, t), 1.2);
      F(G.f, t, { smile: .5, look: [0, .1], talk: .5 * talkAmt(t, 71) });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.5, .2], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 21),
      HH(punch(pushIn([0, 1.3, .5], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [1.6]), 22),
      HH(insert([-1.1, .4, -1.0], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: .8, h1: .9, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(crane([0, 2.0, -1.0], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: .9, h1: 1.6, a0: 4, a1: -4, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, good): a golden staircase rises from between the armchairs to a bright light in the sky; the thank-you ball climbs the steps; "הכרת טובה לה׳"; green check
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const SP = Array.from({ length: 7 }, (_, i) => [-.5 + .45 * i, .2 + .3 * i, -1.0 - .12 * i]);
    const steps = SP.map(p => { const s = box(.6, .18, .7, CLR_GOLD); s.position.set(p[0], p[1], p[2]); s.scale.setScalar(.001); Wd.add(s); return s; });
    const LIGHT = [2.4, 2.5, -2.0];
    const light = ball(.35, 0xfff3a0); light.position.set(LIGHT[0], LIGHT[1], LIGHT[2]); light.scale.setScalar(.001); Wd.add(light);
    const rib = ball(.1, 0xff6fa0); Wd.add(rib);
    Wd.on(t => {
      parents(Y, t); glow(Y, .8);
      steps.forEach((s, i) => s.scale.setScalar(Math.max(.001, sm(P(.4 + .4 * i, 1.2 + .4 * i, t)))));
      light.scale.setScalar(Math.max(.001, sm(P(3, 5, t)) * (1 + .08 * Math.sin(t * 5))));
      const k = P(3.5, 7.5, t) * 6, i0 = Math.min(5, Math.floor(k)), f = clamp(k - i0, 0, 1);
      const q = lerpV(SP[i0], SP[i0 + 1], f);
      rib.position.set(q[0], q[1] + .18, q[2]); rib.scale.setScalar(Math.max(.001, popE(P(3, 3.8, t))));
      Y.T.thank.set([-1.2, 2.2, -.9], popE(P(4, 5, t)), 0, 1);
      Y.spark.forEach((s, i) => {
        s.position.set(LIGHT[0] + .5 * Math.cos(i * 1.6), LIGHT[1] + .5 * Math.sin(i * 1.6), LIGHT[2] + .1);
        s.visible = true; s.scale.setScalar(Math.max(.001, popE(P(5 + .3 * i, 6 + .3 * i, t)) * (.7 + .3 * Math.sin(t * 8 + i))));
      });
      Y.check.set([-1.9, 2.4, -.4], popE(P(6, 7, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([-1.9, 2.4, -.4], P(6, 6.8, t), 1.2);
    });
    Wd.occ = []; Wd.center = [.4, 1.5];
    Wd.cam = C4(dur,
      HH(truck([.4, 1.5, -1.2], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.4, h1: 1.6, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 51),
      HH(punch(pushIn([.8, 1.4, -1.2], { dur: dur * .25, dist0: 6.6, dist1: 6.2, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 52),
      HH(insert(LIGHT, { dur: dur * .25, dist0: 2.8, dist1: 2.4, h0: 2.4, h1: 2.5, a0: -8, a1: 8, fov0: 36, fov1: 34 }), 53),
      HH(orbitShot([.4, 1.6, -1.2], { dur: dur * .25, dist0: 7.6, dist1: 7.2, h0: 1.6, h1: 1.8, a0: -16, a1: 4, fov0: 44, fov1: 44 }), 54));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, good): a bracha card floats in and lands between the chairs with a grey "אין ברכה" tag; a "?" with "מכמה טעמים" pops; the tray keeps serving anyway
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    Y.tbl.visible = false;
    const T = makeTray(Wd); placeG(T.g, TRAY4, 0, 0);
    const CARD = new THREE.Group(); Wd.add(CARD);
    CARD.add(box(.6, .8, .04, 0xf6f0dc));
    [.2, 0, -.2].forEach(y => { const l = box(.44, .04, .05, 0x7a6a50); l.position.set(0, y, .03); CARD.add(l); });
    const CS = [-2.8, 2.2, -.2], CE = [-.8, 1.6, .2];
    Wd.on(t => {
      parents(Y, t); glow(Y, .1);
      const u = sm(P(1, 5, t));
      placeG(CARD, arcV(CS, CE, u, .5), 0, 0); CARD.rotation.z = .12 * Math.sin(t * 2.5) * (1 - u * .5);
      Y.T.noB.set([CE[0], CE[1] + .55, CE[2]], popE(P(2.5, 3.5, t)), 0, 1);
      Y.T.qs.set([CE[0], CE[1] + 1.0, CE[2]], popE(P(4, 5, t)), 0, 1);
      Y.T.q.set([.5, CE[1] + 1.0, CE[2]], popE(P(4.5, 5.5, t)) * (1 + .06 * Math.sin(t * 4)), 0, 1);
      placeG(T.g, [TRAY4[0], TRAY4[1] + .02 * Math.sin(t * 4), TRAY4[2]], .2 * Math.sin(t * 1.4), 0);
      T.food.forEach((b, i) => b.scale.setScalar(1 + .05 * Math.sin(t * 4 + i)));
      Y.T.tray.set([TRAY4[0], TRAY4[1] + .8, TRAY4[2]], popE(P(0, .8, t)), 0, 1);
      F(T.f, t, { smile: .5, look: [0, .1], talk: .6 * talkAmt(t, 41) });
    });
    Wd.occ = []; Wd.center = [.2, 1.5];
    Wd.cam = C4(dur,
      HH(truck([.2, 1.4, -.4], { dur: dur * .25, dist0: 8.0, dist1: 7.6, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 46, fov1: 44 }), 61),
      HH(punch(pushIn([-.8, 1.6, .2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 62),
      HH(insert([CE[0], CE[1], CE[2]], { dur: dur * .25, dist0: 2.8, dist1: 2.4, h0: 1.6, h1: 1.7, a0: -8, a1: 8, fov0: 36, fov1: 34 }), 63),
      HH(crane([.2, 1.6, .1], { dur: dur * .25, dist0: 7.8, dist1: 6.4, h0: 2.2, h1: 1.8, a0: 8, a1: -8, fov0: 44, fov1: 42 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, good): the tray climbs a steep ramp to the chairs, carrying the heavy stone "טרחה"; a sweat drop pops; the meter "צער וטרחה" fills; at the top a green check
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    Y.tbl.visible = false;
    const RA = [-2.6, 0, .4], RB = [-.6, 1.0, .4];
    const ramp = box(2.24, .12, .8, 0x9a6a3a); ramp.position.set(-1.6, .5, .4); ramp.rotation.z = Math.atan2(1, 2); Wd.add(ramp);
    const T = makeTray(Wd), S = makeStone(Wd);
    const sweat = cyl(0, .09, .22, 0x6dd6ff); Wd.add(sweat);
    Y.mBg.visible = true; Y.mFill.visible = true;
    Wd.on(t => {
      parents(Y, t);
      const u = sm(P(1, 9, t));
      const p = lerpV(RA, RB, u);
      placeG(T.g, [p[0], p[1] + .3, p[2]], 0, 0); T.g.rotation.z = Math.atan2(1, 2);
      placeG(S.g, [p[0], p[1] + .6, p[2]], 0, 0);
      sweat.position.set(p[0] + .4, p[1] + .8 + .05 * Math.sin(t * 6), p[2]);
      sweat.scale.setScalar(Math.max(.001, popE(P(2.5, 3.5, t))));
      Y.T.stone.set([p[0], p[1] + 1.15, p[2]], popE(P(.5, 1.5, t)), 0, 1);
      Y.T.tray.set([p[0] - .6, p[1] + .9, p[2]], popE(P(1, 2, t)), 0, 1);
      const fill = Math.max(.001, u);
      Y.mFill.scale.x = fill; Y.mFill.position.set(MTR[0] + .7 * fill, MTR[1], MTR[2] + .02);
      Y.T.meter.set([MTR[0] + .7, MTR[1] + .3, MTR[2]], popE(P(0, 1, t)), 0, 1);
      Y.check.set([-.6, 1.9, .4], popE(P(8, 9, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([-.6, 1.9, .4], P(8, 8.8, t), 1.2);
      F(S.f, t, { smile: -.3 + 1.2 * u, look: [0, .2], talk: .5 * talkAmt(t, 51) });
      F(T.f, t, { smile: .4, look: [0, .1], talk: .3 * talkAmt(t, 52) });
    });
    Wd.occ = []; Wd.center = [-1.2, 1.0];
    Wd.cam = C4(dur,
      HH(truck([-1.0, 1.2, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.2, h0: 1.4, h1: 1.6, a0: -10, a1: 6, fov0: 46, fov1: 44 }), 71),
      HH(punch(pushIn([-1.2, 1.0, .4], { dur: dur * .25, dist0: 7.0, dist1: 6.4, h0: 1.0, h1: 1.1, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 72),
      HH(insert([-1.2, .6, .4], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: .7, h1: .8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([-.8, 1.4, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.4, h1: 1.6, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, good): the hourglass in front sands down; a long ribbon of days unrolls toward the back; two gates glow: "העולם הזה" (left) and "העולם הבא" (right, gold); green check, sparkles
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    Y.tbl.visible = false;
    const H = makeHour(Wd); placeG(H.g, HP, 0, 0);
    const TILES = Array.from({ length: 10 }, (_, i) => { const m = box(.26, .04, .5, i % 2 ? CLR_GOLD : 0xffffff); m.position.set(.6 + .32 * i, .03, .9); m.scale.x = .001; Wd.add(m); return m; });
    const GH = makeGate(Wd, -2.2, 0x5a7aa0), GB = makeGate(Wd, 2.6, 0x8a6a20);
    Wd.on(t => {
      parents(Y, t);
      TILES.forEach((m, i) => { m.scale.x = Math.max(.001, popE(P(1 + .25 * i, 2 + .25 * i, t))); });
      const gl = sm(P(2, 3, t)) * (.6 + .4 * Math.sin(t * 3));
      GH.forEach(m => m.color.setHex(col(0x5a7aa0, 0xe8f6ff, gl)));
      GB.forEach(m => m.color.setHex(col(0x8a6a20, CLR_GOLD, gl)));
      Y.T.gateH.set([-2.2, 2.25, -1.2], popE(P(3, 4, t)), 0, 1);
      Y.T.gateB.set([2.6, 2.25, -1.2], popE(P(4, 5, t)), 0, 1);
      H.drop.position.set(0, .18 - .36 * fract(t * .6), .0);
      H.drop.visible = t > 1;
      Y.T.hour.set([HP[0], HP[1] + .7, HP[2]], .5 * popE(P(0, 1, t)), 0, 1);   // half size, under the top of the screen
      Y.spark.forEach((s, i) => {
        s.position.set(HP[0] + .6 * Math.cos(i * 1.6 + t), HP[1] + .5 * Math.sin(i * 1.6 + t), HP[2] + .2);
        s.visible = true; s.scale.setScalar(Math.max(.001, popE(P(6.5 + .3 * i, 7.3 + .3 * i, t)) * (.7 + .3 * Math.sin(t * 8 + i))));
      });
      Y.check.set([0, 2.6, -.4], popE(P(6, 7, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([0, 2.6, -.4], P(6, 6.8, t), 1.2);
      F(H.f, t, { smile: .7, look: [0, .2], talk: .5 * talkAmt(t, 91) });
    });
    Wd.occ = []; Wd.center = [.6, 1.0];
    Wd.cam = C4(dur,
      HH(truck([.2, 1.2, -1.0], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.4, h1: 1.5, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 81),
      HH(truck([0, 1.4, -1.0], { dur: dur * .25, dist0: 9.2, dist1: 8.6, h0: 1.4, h1: 1.6, a0: -10, a1: 10, fov0: 46, fov1: 44 }), 82),
      HH(insert([HP[0], HP[1], HP[2]], { dur: dur * .25, dist0: 3.2, dist1: 2.8, h0: 1.0, h1: 1.1, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 83),
      HH(orbitShot([.2, 1.4, -1.0], { dur: dur * .25, dist0: 7.6, dist1: 7.2, h0: 1.4, h1: 1.6, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 84));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): warm light; the armchairs in the middle-back; gift box, tray and hourglass in a row at the bottom, their tags glowing one after the other; the roots glow under the floor; slow crane
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xffd9a0);
    Y.tbl.visible = false;
    const G = makeGift(Wd), T = makeTray(Wd), H = makeHour(Wd);
    Wd.on(t => {
      parents(Y, t); glow(Y, .6 + .2 * Math.sin(t * 2));
      const bob = .04 * Math.sin(t * 2);
      placeG(G.g, [-1.7, .3 + bob, .5], 0, 0); placeG(T.g, [0, .15 - bob, .9], 0, 0); placeG(H.g, [1.7, .45 + bob, .5], 0, 0);
      Y.T.gift.set([-1.7, 1.25, .5], popE(P(1, 2, t)) * (1 + .05 * Math.sin(t * 5)), 0, 1);
      Y.T.tray.set([0, 1.1, .9], popE(P(5, 6, t)) * (1 + .05 * Math.sin(t * 5)), 0, 1);
      Y.T.hour.set([1.7, 1.45, .5], popE(P(9, 10, t)) * (1 + .05 * Math.sin(t * 5)), 0, 1);
      F(G.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 1) });
      F(T.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 2) });
      F(H.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 3) });
    });
    Wd.occ = []; Wd.center = [0, .8]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur: dur, dist0: 8.2, dist1: 7.4, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
