// yomit-15 story: "כיבוד הורים - מחשבה, דיבור ומעשה" (halacha yomit, R' Amram Fried). Storyboard A in storyboards_v16.md.
// Parents = two armchairs (blue "אבא", rose "אמא") with gold crowns floating above. NO faces, NO bodies on them.
// Heroes (talking objects with faces): THOUGHT CLOUD, SPEECH BUBBLE, TRAY (plate + cup), SHOPPING BASKET, BLANKET.
// A coat on a hanger (no face) and a thermometer are moving diagrams. Copied from episodes/yomit-14/story.js (tags, camera, faces).
// Everything is a function of local time t. No people.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const lerpV = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
  const arcV = (a, b, u, h) => { const p = lerpV(a, b, u); p[1] += h * Math.sin(PI * u); return p; };
  const FB = { talk: 0, smile: .3, look: [0, 0], surprise: 0, open: 1 };
  const F = (f, t, o) => f.set(t, Object.assign({}, FB, o));
  const grp = (Wd, p) => { const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g); return g; };
  const placeG = (g, p, ry, rx) => { g.position.set(p[0], p[1], p[2]); g.rotation.set(rx || 0, ry || 0, 0); };
  const col = (a, b, u) => new THREE.Color(a).lerp(new THREE.Color(b), u).getHex();
  const C4 = (dur, a, b, c, d) => cuts([[dur * .25, a], [dur * .25, b], [dur * .25, c], [dur * .25, d]]);

  // ---------------------------------------------------------------- positions (metres; back wall at z=-2.4, camera on +z)
  const ABA = [-1.1, 0, -1.7], IMA = [1.2, 0, -1.7];                  // the two armchairs (parents)
  const CROWN_A = [-1.1, 1.95, -1.7], CROWN_I = [1.2, 1.6, -1.7];
  const TAG_A = [-1.1, 2.5, -1.7], TAG_I = [1.2, 2.05, -1.7];
  const TRAY_F = [.05, .75, .15];                                       // tray on a low side table (hook, beats 1-2), clear of the caption band
  const TRAY_SERVE = [0, .15, -.45];                                    // tray set down between the chairs (beat 5)
  const CIRC = [[-1.5, 1.25, .5], [0, 1.25, .5], [1.5, 1.25, .5]];      // lit circles: cloud, bubble, tray
  const CLOUD_UP = [-.25, 2.95, -1.05];                                 // cloud above the chairs
  const BUB_END = [.45, 1.8, -.7];                                      // bubble glides here (beat 4)
  const MTR = [-.7, 2.25, -1.05];                                       // meter "חשיבות" (left-anchored)
  const SHOP = [2.9, .6, -1.3], BASK_START = [2.6, .2, -.2], BASK_END = [1.45, .2, .05];
  const BLANK_START = [-2.6, 2.6, .2], BLANK_END = [-1.1, 1.1, -1.85];
  const COAT_START = [2.8, 2.6, -.3], COAT_END = [1.2, 1.85, -1.85];
  const TH = [2.7, 1.1, -.6];                                           // thermometer
  const SP = [0, 0, -.6];                                               // signpost (beats 1-2)
  const CLR_GOLD = 0xffd23a, CLR_LIT = 0xffd23a, CLR_OFF = 0x3a4060, CLR_BLUE = 0x2f5fb8, CLR_ROSE = 0xd9779a;

  // ---------------------------------------------------------------- tags (same helpers as yomit-14)
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
  // a gold crown: a ring with three points (parent = scene or a group)
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
    const WF = 0x8a5a32;                                                 // window frame
    [3.56, 1.64].forEach(y => { const b = box(3.2, .14, .14, WF); b.position.set(0, y, -2.3); Wd.add(b); });
    [-1.56, 1.56].forEach(x => { const b = box(.14, 1.92, .14, WF); b.position.set(x, 2.6, -2.3); Wd.add(b); });
    Y.tbl = box(1.4, .6, .9, 0x8a5a32); Y.tbl.position.set(TRAY_F[0], .3, TRAY_F[2]); Wd.add(Y.tbl);   // low table under the tray (hook, beats 1-4)
    Y.abaG = chair(Wd, ABA, 1.15, CLR_BLUE);                             // "אבא"
    Y.imaG = chair(Wd, IMA, .9, CLR_ROSE);                               // "אמא"
    Y.cA = makeCrown(Wd, CLR_GOLD); Y.cI = makeCrown(Wd, CLR_GOLD);
    // meter (background + fill, left-anchored); shown only in beats 3-4
    Y.mBg = box(1.4, .22, .08, 0x444a66); Y.mBg.position.set(MTR[0] + .7, MTR[1], MTR[2]); Wd.add(Y.mBg);
    Y.mFill = box(1.4, .18, .1, 0x3fdc6a); Wd.add(Y.mFill);
    Y.mBg.visible = false; Y.mFill.visible = false;
    // marks and shocks
    Y.check = mark3d(Wd, 'check', 1.0); Y.cross = mark3d(Wd, 'cross', .6);
    Y.shockR = shock(Wd, 0xff7a7a); Y.shockG = shock(Wd, 0x6dff9a);
    Y.spark = [0, 1, 2, 3].map(() => { const s = ball(.07, 0xffe36a); s.visible = false; Wd.add(s); return s; });
    // tags
    Y.T = {};
    Y.T.aba = bb(Wd, 1.0, .42, drawTag('אבא', '#dbe9ff', '#14408f', '#2f6ad0'));
    Y.T.ama = bb(Wd, 1.0, .42, drawTag('אמא', '#ffe1ec', '#8a1a4a', '#d9779a'));
    Y.T.cloud = bb(Wd, 1.2, .42, drawTag('מחשבה', '#ffffff', '#2d3a6b', '#9aa7c4'));
    Y.T.bub = bb(Wd, 1.2, .42, drawTag('דיבור', '#fff6d8', '#6a4a00', '#d9a63a'));
    Y.T.tray = bb(Wd, 1.2, .42, drawTag('מעשה', '#e4f8e6', '#1f6a2a', '#3f9a4a'));
    Y.T.kib = bb(Wd, 1.5, .46, drawTag('כיבוד', '#fff1c2', '#6a3a00', '#d9a63a'));
    Y.T.mora = bb(Wd, 1.5, .46, drawTag('מורא', '#dbe9ff', '#14408f', '#2f6ad0'));
    Y.T.meter = bb(Wd, 1.6, .4, drawTag('חשיבות', '#ffffff', '#2d3a6b', '#9aa7c4'));
    Y.T.king = bb(Wd, 2.6, .46, drawTag('כמו אל מלך', '#fff1c2', '#6a3a00', '#d9a63a'));
    Y.T.bask = bb(Wd, 1.2, .42, drawTag('קניות', '#e4f8e6', '#1f6a2a', '#3f9a4a'));
    Y.T.warm = bb(Wd, 1.2, .42, drawTag('חם', '#ffe1e1', '#8a1010', '#c43030'));
    Y.T.beh = bb(Wd, 1.4, .42, drawTag('בנחת', '#ece8ff', '#2d2a6b', '#7a70c0'));
    Y.T.dig = [1, 2, 3].map(n => bb(Wd, .45, .45, drawTag(String(n), '#ffffff', '#1d2a5a', '#7a8794')));
    return Y;
  }
  // the two parents: crowns bob, tags stay on
  function parents(Y, t) {
    placeG(Y.cA, [CROWN_A[0], CROWN_A[1] + .05 * Math.sin(t * 2), CROWN_A[2]], 0, 0);
    placeG(Y.cI, [CROWN_I[0], CROWN_I[1] + .05 * Math.sin(t * 2 + 1.5), CROWN_I[2]], 0, 0);
    Y.T.aba.set(TAG_A, 1, 0, 1);
    Y.T.ama.set(TAG_I, 1, 0, 1);
  }

  // ---------------------------------------------------------------- heroes (objects with faces; face on the +z side)
  function makeTray(Wd) {
    const T = {}; T.g = new THREE.Group(); Wd.add(T.g);
    T.body = box(1.0, .3, .7, 0x9a6a3a); T.g.add(T.body);
    T.plate = cyl(.3, .3, .04, 0xffffff); T.plate.position.set(-.18, .17, 0); T.g.add(T.plate);
    T.cup = cyl(.11, .09, .22, 0xf4f8ff); T.cup.position.set(.3, .21, .05); T.g.add(T.cup);
    T.liq = cyl(.095, .095, .2, 0x7a3a10); T.liq.position.set(.3, .21, .05); T.liq.scale.y = .001; T.g.add(T.liq);
    T.food = [[-.32, .26, .05, 0xff6b6b], [-.1, .28, .1, 0xffd23a], [-.2, .3, -.1, 0x6dff9a]].map(([x, y, z, c]) => {
      const b = ball(.1, c); b.position.set(x, y, z); b.scale.setScalar(.001); T.g.add(b); return b; });
    T.f = face(Wd, { w: .42, parent: T.g, pos: [0, 0, .36], seed: 91 });
    return T;
  }
  function makeCloud(Wd) {
    const C = {}; C.g = new THREE.Group(); Wd.add(C.g);
    [[0, 0, 0, .42], [-.35, -.08, 0, .28], [.35, -.06, 0, .3], [-.18, .25, 0, .28], [.2, .26, 0, .26]].forEach(([x, y, z, r]) => {
      const b = ball(r, 0xffffff); b.position.set(x, y, z); C.g.add(b); });
    C.f = face(Wd, { w: .5, parent: C.g, pos: [0, -.02, .42], seed: 92 });
    return C;
  }
  function makeBubble(Wd) {
    const B = {}; B.g = new THREE.Group(); Wd.add(B.g);
    B.body = box(1.1, .7, .2, 0xffffff); B.g.add(B.body);
    B.tail = cyl(0, .12, .3, 0xffffff); B.tail.position.set(-.3, -.5, 0); B.tail.rotation.z = .5; B.g.add(B.tail);
    B.f = face(Wd, { w: .5, parent: B.g, pos: [0, 0, .12], seed: 93 });
    return B;
  }
  function makeBasket(Wd) {
    const K2 = {}; K2.g = new THREE.Group(); Wd.add(K2.g);
    K2.body = box(.9, .5, .6, 0xc08a4a); K2.g.add(K2.body);
    const h = box(.9, .06, .06, 0x6b4a2a); h.position.set(0, .34, 0); K2.g.add(h);
    K2.items = [[-.22, .4, .05, 0xff6b6b], [0, .4, .1, 0xffd23a], [.22, .4, .02, 0x6dff9a]].map(([x, y, z, c]) => {
      const b = ball(.12, c); b.position.set(x, y, z); K2.g.add(b); return b; });
    K2.f = face(Wd, { w: .4, parent: K2.g, pos: [0, -.02, .31], seed: 94 });
    return K2;
  }
  function makeBlanket(Wd) {
    const L = {}; L.g = new THREE.Group(); Wd.add(L.g);
    L.body = box(1.3, .9, .1, 0xff9ec0); L.g.add(L.body);
    L.f = face(Wd, { w: .45, parent: L.g, pos: [0, .1, .06], seed: 95 });
    return L;
  }
  // moving diagrams without faces
  function makeCoat(Wd) {
    const c = {}; c.g = new THREE.Group(); Wd.add(c.g);
    c.body = box(.8, 1.0, .08, 0x3a4a6a); c.g.add(c.body);
    const hk = box(.4, .04, .04, 0x6b4a2a); hk.position.set(0, .56, 0); c.g.add(hk);
    return c;
  }
  function makeThermo(Wd) {
    const M = {}; M.g = grp(Wd, TH);
    const tube = cyl(.07, .07, 1.1, 0xdddddd); M.g.add(tube);
    M.fill = cyl(.045, .045, 1.0, 0x3a7ad8); M.fill.position.y = -.5; M.fill.scale.y = .001; M.g.add(M.fill);
    M.bulb = ball(.16, 0x3a7ad8); M.bulb.position.y = -.6; M.g.add(M.bulb);
    return M;
  }
  function makeSign(Wd) {
    const S = {}; S.g = grp(Wd, SP);
    S.pole = cyl(.06, .06, 3.1, 0x8a5a32); S.pole.position.y = 1.55; S.g.add(S.pole);
    S.bLb = box(1.5, .2, .08, CLR_GOLD); S.bLb.position.y = 2.9; S.g.add(S.bLb);       // "כיבוד" (gold, left)
    S.bRb = box(1.5, .2, .08, CLR_BLUE); S.bRb.position.y = 2.9; S.g.add(S.bRb);       // "מורא" (blue, right)
    return S;
  }
  function growSign(S, uL, uR) {
    const a = Math.max(.001, uL), b = Math.max(.001, uR);
    S.bLb.scale.x = a; S.bLb.position.x = -.75 * a;
    S.bRb.scale.x = b; S.bRb.position.x = .75 * b;
  }
  function makeCarpet(Wd) { const m = box(.9, .03, 2.1, 0xb0202a); Wd.add(m); carpetSet(m, 0); return m; }
  function carpetSet(m, u) { const a = Math.max(.001, u); m.scale.z = a; m.position.set(0, .02, .9 - 1.05 * a); }
  function makeShop(Wd) {
    const s = box(1.3, 1.2, 1.0, 0x6fa8dc); s.position.set(SHOP[0], SHOP[1], SHOP[2]); Wd.add(s);
    const roof = box(1.5, .15, 1.2, 0xc0402a); roof.position.set(SHOP[0], SHOP[1] + .68, SHOP[2]); Wd.add(roof);
  }

  // ---------------------------------------------------------------- HOOK 0-14: extreme close-up on the tray (it thinks deeds are the only way); pull out to the armchairs with crowns; cloud and bubble peek from the sides; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const T = makeTray(Wd), C = makeCloud(Wd), B = makeBubble(Wd);
    Wd.on(t => {
      parents(Y, t);
      const bob = Math.sin(t * 3);
      placeG(T.g, [TRAY_F[0], TRAY_F[1] + .03 * bob, TRAY_F[2]], .2 * Math.sin(t * 1.6), 0);   // tray wobbles on the floor
      placeG(C.g, [-2.6 + .1 * Math.sin(t), 2.0, -.4], 0, 0);
      placeG(B.g, [2.5, 2.2 + .08 * bob, -.4], 0, 0);
      Y.T.tray.set([TRAY_F[0], TRAY_F[1] + .95, TRAY_F[2]], popE(P(1, 2, t)), 0, 1);
      Y.T.cloud.set([-2.6, 2.7, -.4], popE(P(2.5, 3.5, t)), 0, 1);
      Y.T.bub.set([2.5, 2.9, -.4], popE(P(3.5, 4.5, t)), 0, 1);
      F(T.f, t, { smile: -.4, look: [0, .1], talk: .6 * talkAmt(t, 7) });
      F(C.f, t, { smile: .2, look: [.3, 0], talk: .3 * talkAmt(t, 8) });
      F(B.f, t, { smile: .2, look: [-.3, 0], talk: .3 * talkAmt(t, 9) });
    });
    Wd.occ = []; Wd.center = [0, .6]; Wd.qPos = [TRAY_F[0], TRAY_F[2] + .4];
    Wd.cam = C4(dur,
      HH(pullOut([TRAY_F[0], TRAY_F[1] + .4, TRAY_F[2]], { dur: dur * .25, dist0: 1.1, dist1: 1.8, h0: .5, h1: .7, a0: 4, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([0, .9, -.6], { dur: dur * .25, dist0: 3.2, dist1: 6.0, h0: .8, h1: 1.4, a0: -4, a1: 6, fov0: 38, fov1: 44 }), 42),
      HH(truck([0, .9, -.2], { dur: dur * .25, dist0: 6.6, dist1: 6.2, h0: 1.1, h1: 1.3, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([0, 1.0, -.2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14): a signpost grows from the floor with two branches: "כיבוד" (gold) and "מורא" (blue); both pop; the crowns bob
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const S = makeSign(Wd), T = makeTray(Wd), C = makeCloud(Wd), B = makeBubble(Wd);
    placeG(T.g, TRAY_F, 0, 0); placeG(C.g, [-1.9, 2.0, -.4], 0, 0); placeG(B.g, [1.9, 2.2, -.4], 0, 0);
    Wd.on(t => {
      parents(Y, t);
      const g1 = sm(P(0, 1.2, t)), gL = sm(P(1.2, 2.2, t)), gR = sm(P(2.2, 3.2, t));
      S.pole.scale.y = Math.max(.001, g1); S.pole.position.y = 1.55 * Math.max(.001, g1);
      growSign(S, gL, gR);
      Y.T.kib.set([SP[0] - 1.5, 3.3, SP[2]], popE(P(2.4, 3.0, t)), 0, 1);
      Y.T.mora.set([SP[0] + 1.5, 3.3, SP[2]], popE(P(3.2, 3.8, t)), 0, 1);
      F(C.f, t, { smile: .6, look: [.3, 0], talk: t > 1 ? .6 * talkAmt(t, 11) : 0 });
      F(B.f, t, { smile: .4, look: [-.3, 0], talk: t > 5 ? .5 * talkAmt(t, 12) : 0 });
      F(T.f, t, { smile: .3, talk: 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.0, -.6], { dur: dur * .25, dist0: 8.6, dist1: 8.0, h0: 1.2, h1: 1.5, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 11),
      HH(punch(pushIn([0, 2.4, -.6], { dur: dur * .25, dist0: 5.4, dist1: 4.6, h0: 1.4, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [1.4]), 12),
      HH(insert([CROWN_A[0], CROWN_A[1], CROWN_A[2]], { dur: dur * .25, dist0: 2.9, dist1: 2.5, h0: 1.5, h1: 1.8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([0, 1.6, -.6], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28): the branch gives three lit circles, counted 1-2-3; cloud, bubble and tray each hop into their circle
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const S = makeSign(Wd), T = makeTray(Wd), C = makeCloud(Wd), B = makeBubble(Wd);
    const D = CIRC.map(p => { const d = cyl(.75, .75, .05, CLR_OFF); d.rotation.x = PI / 2; d.position.set(p[0], p[1], p[2] - .5); Wd.add(d); return d; });
    const LIT_T = [1.2, 2.6, 4.0];
    const from = [[-2.6, 2.0, -.4], [2.5, 2.2, -.4], TRAY_F];
    Wd.on(t => {
      parents(Y, t);
      growSign(S, 1, 1 - sm(P(0, 1, t)));                                   // the blue branch folds back as the split starts
      S.pole.scale.y = 1; S.pole.position.y = 1.55;
      Y.T.kib.set([SP[0] - 1.5, 3.3, SP[2]], 1, 0, 1);
      D.forEach((d, i) => d.material.color.setHex(col(CLR_OFF, CLR_LIT, sm(P(LIT_T[i], LIT_T[i] + .5, t)))));
      CIRC.forEach((p, i) => Y.T.dig[i].set([p[0], p[1] + 1.45, p[2]], popE(P(LIT_T[i] - .4, LIT_T[i] + .4, t)), 0, 1));
      const hop = [sm(P(.5, 2.0, t)), sm(P(1.8, 3.4, t)), sm(P(3.0, 4.6, t))];
      placeG(C.g, arcV(from[0], CIRC[0], hop[0], .7), 0, 0);
      placeG(B.g, arcV(from[1], CIRC[1], hop[1], .7), 0, 0);
      placeG(T.g, arcV(from[2], CIRC[2], hop[2], .7), .3 * Math.sin(t * 2) * (1 - hop[2]), 0);
      Y.T.cloud.set([CIRC[0][0], CIRC[0][1] + .8, CIRC[0][2]], popE(P(1.0, 1.8, t)), 0, 1);
      Y.T.bub.set([CIRC[1][0], CIRC[1][1] + .8, CIRC[1][2]], popE(P(2.4, 3.2, t)), 0, 1);
      Y.T.tray.set([CIRC[2][0], CIRC[2][1] + .8, CIRC[2][2]], popE(P(3.8, 4.6, t)), 0, 1);
      F(C.f, t, { smile: .6, look: [0, 0], talk: t > 2 ? .6 * talkAmt(t, 21) : 0 });
      F(B.f, t, { smile: .5, look: [0, .1], talk: t > 3.6 ? .6 * talkAmt(t, 22) : 0 });
      F(T.f, t, { smile: .5, look: [0, .2], talk: t > 5 ? .5 * talkAmt(t, 23) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.5, .2], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 21),
      HH(punch(pushIn([0, 1.3, .5], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [1.6]), 22),
      HH(insert([CIRC[2][0], CIRC[2][1], CIRC[2][2]], { dur: dur * .25, dist0: 2.9, dist1: 2.5, h0: 1.3, h1: 1.4, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(crane([0, 2.0, -1.0], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: .9, h1: 1.6, a0: 4, a1: -4, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, good): the thought cloud floats above the armchairs; two small crowns grow inside it; "חשיבות" meter fills; sparkles; green check
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const C = makeCloud(Wd), B = makeBubble(Wd), T = makeTray(Wd);
    placeG(B.g, CIRC[1], 0, 0); placeG(T.g, CIRC[2], 0, 0);
    const cr1 = makeCrown(C.g, CLR_GOLD), cr2 = makeCrown(C.g, CLR_GOLD);
    cr1.position.set(-.28, .2, .3); cr2.position.set(.28, .2, .3);
    Y.mBg.visible = true; Y.mFill.visible = true;
    const SPK = [[.7, .4, .2], [-.7, .5, .2], [.5, -.3, .3], [-.5, -.2, .3]];
    Wd.on(t => {
      parents(Y, t);
      placeG(C.g, [CLOUD_UP[0] + .05 * Math.sin(t * 1.3), CLOUD_UP[1] + .12 * Math.sin(t * 1.1), CLOUD_UP[2]], 0, 0);
      const cs = Math.max(.001, sm(P(.8, 3.8, t)));
      cr1.scale.setScalar(cs); cr2.scale.setScalar(cs);
      const fill = sm(P(1, 6, t));
      Y.mFill.scale.x = Math.max(.001, fill); Y.mFill.position.set(MTR[0] + .7 * Math.max(.001, fill), MTR[1], MTR[2] + .02);
      Y.T.meter.set([MTR[0] + .7, MTR[1] + .45, MTR[2]], popE(P(0, 1, t)), 0, 1);
      Y.T.cloud.set([CLOUD_UP[0], CLOUD_UP[1] + .9, CLOUD_UP[2]], popE(P(.5, 1.5, t)), 0, 1);
      Y.spark.forEach((s, i) => {
        s.position.set(CLOUD_UP[0] + SPK[i][0], CLOUD_UP[1] + SPK[i][1], CLOUD_UP[2] + SPK[i][2]);
        s.visible = true; s.scale.setScalar(Math.max(.001, popE(P(5 + .3 * i, 6 + .3 * i, t)) * (.7 + .3 * Math.sin(t * 8 + i))));
      });
      Y.check.set([1.3, 2.6, -.9], popE(P(6, 7, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([1.3, 2.6, -.9], P(6, 6.8, t), 1.2);
      F(C.f, t, { smile: .8, look: [0, .2], talk: t > 1 ? .6 * talkAmt(t, 31) : 0 });
      F(B.f, t, { smile: .2, look: [-.4, 0] });
      F(T.f, t, { smile: .6, look: [0, .1], talk: .3 * talkAmt(t, 32) });
    });
    Wd.occ = []; Wd.center = [-.2, 2.0];
    Wd.cam = C4(dur,
      HH(truck([-.2, 1.6, -1.2], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.4, h1: 1.6, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 51),
      HH(punch(pushIn(CLOUD_UP, { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 2.6, h1: 2.8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 52),
      HH(insert([MTR[0] + .7, MTR[1], MTR[2]], { dur: dur * .25, dist0: 2.8, dist1: 2.4, h0: 2.0, h1: 2.2, a0: -8, a1: 8, fov0: 36, fov1: 34 }), 53),
      HH(orbitShot([-.2, 1.9, -1.2], { dur: dur * .25, dist0: 7.6, dist1: 7.2, h0: 1.6, h1: 1.8, a0: -16, a1: 4, fov0: 44, fov1: 44 }), 54));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, good): the speech bubble glides slowly along a calm wave ("בנחת") to the chairs; a red carpet unrolls; a big crown lands ("כמו אל מלך"); green check
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const C = makeCloud(Wd), B = makeBubble(Wd), T = makeTray(Wd);
    placeG(T.g, CIRC[2], 0, 0);
    const car = makeCarpet(Wd);
    const cr = makeCrown(Wd, CLR_GOLD);
    const dots = Array.from({ length: 14 }, () => { const d = ball(.035, 0x5a70c8); d.visible = false; Wd.add(d); return d; });
    Wd.on(t => {
      parents(Y, t);
      placeG(C.g, [CLOUD_UP[0], CLOUD_UP[1] + .12 * Math.sin(t * 1.1), CLOUD_UP[2]], 0, 0);
      const u = sm(P(1, 5, t));
      const bp = lerpV(CIRC[1], BUB_END, u); bp[1] += .14 * Math.sin(u * PI * 6);
      placeG(B.g, bp, 0, 0);
      dots.forEach((d, i) => {
        const k = (i + 1) / 14, q = lerpV(CIRC[1], BUB_END, k); q[1] += .14 * Math.sin(k * PI * 6);
        d.position.set(q[0], q[1], q[2] + .15); d.visible = k <= u;
      });
      Y.T.beh.set([bp[0], bp[1] + .6, bp[2]], popE(P(1, 2, t)), 0, 1);
      carpetSet(car, sm(P(1.5, 4, t)));
      const cy = .55 + 3.45 * (1 - sm(P(3.8, 5.2, t)));
      placeG(cr, [.05, cy, .1], 0, 0); cr.scale.setScalar(2.2);
      Y.T.king.set([.05, 2.5, .1], popE(P(10.5, 11.5, t)), 0, 1);   // shown only in the wide crane shot (the insert would be blocked by it)
      Y.check.set([.9, 1.1, .4], popE(P(6, 7, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([.9, 1.1, .4], P(6, 6.8, t), 1.2);
      F(B.f, t, { smile: .6, look: [0, .2], talk: .6 * talkAmt(t, 41) });
      F(C.f, t, { smile: .3, look: [-.2, 0] });
      F(T.f, t, { smile: .4, talk: 0 });
    });
    Wd.occ = []; Wd.center = [.1, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 8.0, dist1: 7.6, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 46, fov1: 44 }), 61),
      HH(punch(pushIn([0, .8, .2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 62),
      HH(insert([BUB_END[0], BUB_END[1], BUB_END[2]], { dur: dur * .25, dist0: 2.8, dist1: 2.4, h0: 1.7, h1: 1.8, a0: -8, a1: 8, fov0: 36, fov1: 34 }), 63),
      HH(crane([.05, 1.2, .1], { dur: dur * .25, dist0: 7.8, dist1: 6.4, h0: 2.6, h1: 1.8, a0: 8, a1: -8, fov0: 44, fov1: 42 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, good): the tray slides to the chairs; food pops onto the plate, the cup fills; the basket rolls in on an arrow path from the shop and its items hop in; green check
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    makeShop(Wd);
    const T = makeTray(Wd), B = makeBubble(Wd), BK = makeBasket(Wd);
    const car = makeCarpet(Wd); carpetSet(car, 1);
    const dx = BASK_END[0] - BASK_START[0], dz = BASK_END[2] - BASK_START[2];
    const arrows = [.3, .5, .7].map(f => { const a = box(.35, .05, .12, CLR_GOLD);
      a.position.set(BASK_START[0] + dx * f, .45, BASK_START[2] + dz * f); a.rotation.y = Math.atan2(-dz, dx); Wd.add(a); return a; });
    placeG(B.g, [-1.7, 1.3, -.2], 0, 0); Y.tbl.visible = false;
    Wd.on(t => {
      parents(Y, t);
      const ts = sm(P(.5, 3.0, t));
      placeG(T.g, lerpV(CIRC[2], TRAY_SERVE, ts), 0, 0);
      const tp = lerpV(CIRC[2], TRAY_SERVE, ts);
      T.food.forEach((b, i) => b.scale.setScalar(Math.max(.001, popE(P(3.2 + .5 * i, 3.9 + .5 * i, t)))));
      T.liq.scale.y = Math.max(.001, sm(P(3.5, 5.0, t)));
      Y.T.tray.set([tp[0], tp[1] + .8, tp[2]], popE(P(.4, 1.0, t)), 0, 1);
      const bs = sm(P(2.0, 5.0, t));
      const bp = lerpV(BASK_START, BASK_END, bs);
      placeG(BK.g, bp, 0, 0);
      BK.items.forEach((b, i) => { const k = sm(P(4.6 + .4 * i, 5.4 + .4 * i, t)); b.position.y = 1.2 - .82 * k; });
      arrows.forEach((a, i) => { const s = Math.max(.001, popE(P(1.4 + .5 * i, 2.2 + .5 * i, t)) * (1 - sm(P(3.8, 4.8, t)))); a.scale.set(s, s, s); });
      Y.T.bask.set([bp[0], bp[1] + .8, bp[2]], popE(P(2.5, 3.2, t)), 0, 1);
      const ck = [TRAY_SERVE[0] + .6, TRAY_SERVE[1] + .6, TRAY_SERVE[2] + .2];
      Y.check.set(ck, popE(P(6, 7, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set(ck, P(6, 6.8, t), 1.2);
      F(T.f, t, { smile: 1, look: [0, .2], talk: .5 * talkAmt(t, 51) });
      F(BK.f, t, { smile: .8, look: [-.3, .1], talk: t > 5 ? .5 * talkAmt(t, 52) : 0 });
      F(B.f, t, { smile: .4, look: [0, 0] });
    });
    Wd.occ = []; Wd.center = [.6, .8];
    Wd.cam = C4(dur,
      HH(crane([.4, .5, -1.2], { dur: dur * .25, dist0: 9.0, dist1: 8.2, h0: 1.4, h1: 1.8, a0: -6, a1: 8, fov0: 46, fov1: 44 }), 71),
      HH(punch(pushIn([0, 1.0, -.9], { dur: dur * .25, dist0: 5.8, dist1: 5.4, h0: 1.3, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), [dur * .25 * .5]), 72),
      HH(insert([BASK_END[0], .6, BASK_END[2]], { dur: dur * .25, dist0: 2.9, dist1: 2.5, h0: .8, h1: .9, a0: 10, a1: -10, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([.2, 1.0, -.4], { dur: dur * .25, dist0: 6.8, dist1: 6.6, h0: 1.0, h1: 1.2, a0: -20, a1: 12, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, good): only the two parents; a coat on a hanger settles on the blue chair's back ("להלביש"); a blanket with a face drapes over the pink chair's arm ("לכסות"); a thermometer beside the chairs goes from blue to warm; green check
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const L = makeBlanket(Wd), COAT = makeCoat(Wd), M = makeThermo(Wd);
    const tCoat = bb(Wd, 1.3, .42, drawTag('להלביש', '#dbe9ff', '#14408f', '#2f6ad0'));
    const tBlank = bb(Wd, 1.2, .42, drawTag('לכסות', '#ffe1ec', '#8a1a4a', '#d9779a'));
    const tHot = bb(Wd, .9, .42, drawTag('חם', '#ffe1e1', '#8a1010', '#c43030'));
    const CT = [-1.1, 1.7, -2.0];                        // coat settles on the blue chair's back
    const CS = [2.6, 2.6, -.3];                          // coat starts at the right
    const LB = [1.5, 1.0, -1.0];                         // blanket drapes over the pink chair's arm (in front of it)
    const LS = [-2.6, 1.6, .6];                          // blanket starts at the left, in front
    const TH6 = [-2.5, .9, -1.0];                        // thermometer beside the armchairs
    const SPK = [[.4, .3, .2], [-.4, .4, .2], [.1, .6, .3], [-.2, .1, .3]];
    Y.tbl.visible = false;
    Wd.on(t => {
      parents(Y, t);
      const cl = sm(P(.5, 3.0, t));
      placeG(COAT.g, arcV(CS, CT, cl, .6), 0, 0);
      COAT.g.rotation.z = .15 * (1 - cl) * Math.sin(t * 4);
      tCoat.set([-2.5, 2.2, -2.0], popE(P(2.5, 3.2, t)), 0, 1);
      const bl = sm(P(1.2, 4.2, t));
      placeG(L.g, arcV(LS, LB, bl, .9), 0, 0);
      L.g.rotation.z = .25 * (1 - bl) * Math.sin(t * 4);
      tBlank.set([2.5, 1.6, -1.0], popE(P(4.2, 5.0, t)), 0, 1);
      F(L.f, t, { smile: .3 + .7 * bl, look: [0, .2], talk: t > 3 ? .6 * talkAmt(t, 61) : 0 });
      placeG(M.g, TH6, 0, 0);
      const warm = sm(P(5, 9, t));
      M.bulb.material.color.setHex(col(0x3a7ad8, 0xff5a3a, warm));
      M.fill.material.color.setHex(col(0x3a7ad8, 0xff5a3a, warm));
      const fh = Math.max(.001, .25 + .75 * warm);
      M.fill.scale.y = fh; M.fill.position.y = -.5 + .5 * fh;
      tHot.set([TH6[0], TH6[1] + .9, TH6[2]], popE(P(4.5, 5.5, t)), 0, 1);
      Y.spark.forEach((s, i) => {
        s.position.set(LB[0] + SPK[i][0], LB[1] + SPK[i][1], LB[2] + SPK[i][2]);
        s.visible = true; s.scale.setScalar(Math.max(.001, popE(P(4.8 + .3 * i, 5.6 + .3 * i, t)) * (.7 + .3 * Math.sin(t * 8 + i))));
      });
      Y.check.set([.3, 2.4, -1.0], popE(P(6, 7, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([.3, 2.4, -1.0], P(6, 6.8, t), 1.2);
    });
    Wd.occ = []; Wd.center = [.05, 1.0];
    Wd.cam = C4(dur,
      HH(truck([.05, 1.0, -1.7], { dur: dur * .25, dist0: 8.0, dist1: 7.6, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 50, fov1: 50 }), 81),
      HH(punch(pushIn(CT, { dur: dur * .25, dist0: 4.6, dist1: 4.2, h0: 2.0, h1: 2.0, a0: -4, a1: 4, fov0: 40, fov1: 40 }), [dur * .25 * .5]), 82),
      HH(pushIn(LB, { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: 1.4, h1: 1.4, a0: 4, a1: -4, fov0: 40, fov1: 40 }), 83),
      HH(pushIn([.05, 1.2, -1.6], { dur: dur * .25, dist0: 6.4, dist1: 5.2, h0: 1.4, h1: 1.6, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 84));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): warm light; the armchairs in the middle-back; cloud, bubble and tray in a row at the bottom, their tags glowing one after the other; slow crane
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xffd9a0);
    const C = makeCloud(Wd), B = makeBubble(Wd), T = makeTray(Wd);
    const car = makeCarpet(Wd); carpetSet(car, 1); Y.tbl.visible = false;
    const cr = makeCrown(Wd, CLR_GOLD); placeG(cr, [.05, .55, .1], 0, 0); cr.scale.setScalar(2.2);
    Wd.on(t => {
      parents(Y, t);
      const bob = .04 * Math.sin(t * 2);
      placeG(C.g, [-1.7, .6 + bob, .5], 0, 0); placeG(B.g, [0, .6 - bob, .9], 0, 0); placeG(T.g, [1.7, .6 + bob, .5], 0, 0);
      Y.T.cloud.set([-1.7, 1.45, .5], popE(P(1, 2, t)) * (1 + .05 * Math.sin(t * 5)), 0, 1);
      Y.T.bub.set([0, 1.45, .9], popE(P(5, 6, t)) * (1 + .05 * Math.sin(t * 5)), 0, 1);
      Y.T.tray.set([1.7, 1.45, .5], popE(P(9, 10, t)) * (1 + .05 * Math.sin(t * 5)), 0, 1);
      F(C.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 1) });
      F(B.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 2) });
      F(T.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 3) });
    });
    Wd.occ = []; Wd.center = [0, .8]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur: dur, dist0: 8.2, dist1: 7.4, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
