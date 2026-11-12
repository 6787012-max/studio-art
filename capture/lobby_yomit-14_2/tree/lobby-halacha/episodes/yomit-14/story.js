// yomit-14 story: "ציצית בלילה" (halacha yomit, R' Amram Fried). Storyboard A in storyboards_v15.md.
// Talking objects only: TALLIT KATAN "DAY" (white cloth, navy stripes, face, tag "יום"), TALLIT KATAN "NIGHT" (pale lilac, face, tag "רק ללילה"),
// THE SUN and THE MOON (faces, in the window), THE CLOCK (face, 24-dot ring). A room: back wall, window, bed, peg, chest, weekly strip. No people.
// Everything is a function of local time t. Copied from episodes/yomit-13/story.js (tags, camera helpers, face helpers).
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
  const setP = (o, p) => o.position.set(p[0], p[1], p[2]);
  const placeG = (g, p, ry, rx) => { g.position.set(p[0], p[1], p[2]); g.rotation.set(rx || 0, ry || 0, 0); };
  const col = (a, b, u) => new THREE.Color(a).lerp(new THREE.Color(b), u).getHex();

  // ---------------------------------------------------------------- positions (metres; back wall at z=-2.4, camera on +z)
  const SUN_P = [-2.7, 2.45, -2.1], MOON_P = [-1.7, 2.45, -2.1];          // in the window (left half / right half)
  const PEG = [-.2, 2.15, -2.2], DAY_HANG = [-.2, 1.75, -2.1];           // the day tallit hangs on the peg
  const DAY_FLOOR = [-.9, .8, .3], DAY_BED = [1.9, 1.5, -1.75];
  const NIGHT_BED = [.6, 1.5, -1.75], CHEST = [-2.0, 0, -1.6];
  const CLK = [2.6, 2.8, -2.15];
  const WEEK_X = [-.9, -.4, .1, .6, 1.1, 1.6, 2.1], WEEK_Y = 3.25, WEEK_Z = -2.12;
  const ICON_S = [1.15, 2.4, -1.9], ICON_M = [2.2, 2.4, -1.95];         // sun + moon icons over the day tallit
  const MTR = [NIGHT_BED[0], 2.5, NIGHT_BED[2] + .2];                    // the "מצווה" meter over the night tallit
  const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז'];
  const CLR_NAVY = 0x1d3f8f, CLR_NIGHT_CLOTH = 0xc9c3e0, CLR_NIGHT_STRIPE = 0x8c86b4;
  const CLR_OFF = 0x5a5f7a, CLR_LIT = 0xffd23a;
  const DOTS = 24, DOT_R = .75;

  // ---------------------------------------------------------------- tags (same as yomit-13)
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

  // ---------------------------------------------------------------- a tallit katan: cloth + two stripes + 4 strings + face (+z side)
  function makeTallit(Wd, cloth, stripe, seed) {
    const T = {}; T.g = new THREE.Group(); Wd.add(T.g);
    T.cloth = box(1.0, .75, .04, cloth); T.g.add(T.cloth);
    [.3, -.3].forEach(y => { const s = box(1.0, .09, .05, stripe); s.position.y = y; T.g.add(s); });
    T.strings = [-.46, -.15, .15, .46].map(x => { const c = cyl(.013, .013, .42, 0xffffff); c.position.set(x, -.585, .02); T.g.add(c); return c; });
    T.f = face(Wd, { w: .42, parent: T.g, pos: [0, .06, .03], seed });
    return T;
  }

  // ---------------------------------------------------------------- the room (fresh per beat; each beat sets its own heroes every frame)
  function room(Wd, skyL) {
    const Y = {};
    Y.back = box(12, 6, .2, 0xf3e3c8); Y.back.position.set(0, 2.5, -2.4); Wd.add(Y.back);
    const floor = box(12, .1, 10, 0xb98a5a); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    // window: left half (day or night, per beat), right half (night), wooden frame
    Y.skyL = box(1.0, 1.8, .05, skyL); Y.skyL.position.set(-2.7, 2.6, -2.3); Wd.add(Y.skyL);
    Y.skyR = box(1.0, 1.8, .05, 0x2b2f6b); Y.skyR.position.set(-1.7, 2.6, -2.3); Wd.add(Y.skyR);
    const WF = 0x8a5a32;
    [3.56, 1.64].forEach(y => { const b = box(2.2, .14, .14, WF); b.position.set(-2.2, y, -2.22); Wd.add(b); });
    [[-3.26, .14], [-1.14, .14], [-2.2, .1]].forEach(([x, w]) => { const b = box(w, 1.92, .14, WF); b.position.set(x, 2.6, -2.22); Wd.add(b); });
    Y.sun = grp(Wd, SUN_P); Y.sun.add(ball(.3, 0xffd23a));
    Y.sunF = face(Wd, { w: .32, parent: Y.sun, pos: [0, .02, .3], seed: 61 });
    Y.moon = grp(Wd, MOON_P); Y.moon.add(ball(.3, 0xe8ecff));
    Y.moonF = face(Wd, { w: .32, parent: Y.moon, pos: [0, .02, .3], seed: 62 });
    // bed (frame, mattress, headboard, pillow)
    Y.bed = box(3.0, .45, 1.4, 0x8a5a32); Y.bed.position.set(1.2, .22, -1.6); Wd.add(Y.bed);
    const mat = box(2.9, .25, 1.3, 0xffffff); mat.position.set(1.2, .575, -1.6); Wd.add(mat);
    const head = box(3.0, 1.6, .14, 0x8a5a32); head.position.set(1.2, .8, -2.26); Wd.add(head);
    const pil = box(.7, .22, .5, 0xfff4e6); pil.position.set(-.05, .9, -1.95); Wd.add(pil);
    // peg on the wall
    const peg = cyl(.04, .04, .34, 0x8a5a32); peg.rotation.x = PI / 2; peg.position.set(PEG[0], PEG[1], PEG[2]); Wd.add(peg);
    // round wall clock with face and two hands; 24 dots around it = the 24 hours
    Y.clk = grp(Wd, CLK);
    const rim = cyl(.6, .6, .06, 0x8a5a32); rim.rotation.x = PI / 2; rim.position.z = -.03; Y.clk.add(rim);
    const dial = cyl(.55, .55, .12, 0xffffff); dial.rotation.x = PI / 2; Y.clk.add(dial);
    Y.clkF = face(Wd, { w: .4, parent: Y.clk, pos: [0, -.22, .12], seed: 71 });
    Y.hh = new THREE.Group(); Y.hh.position.set(0, 0, .14); Y.clk.add(Y.hh);
    const hhb = box(.05, .26, .04, 0x2b2f6b); hhb.position.set(0, .13, 0); Y.hh.add(hhb);
    Y.hm = new THREE.Group(); Y.hm.position.set(0, 0, .15); Y.clk.add(Y.hm);
    const hmb = box(.035, .4, .035, 0x2b2f6b); hmb.position.set(0, .2, 0); Y.hm.add(hmb);
    Y.dots = Array.from({ length: DOTS }, (_, k) => {
      const a = -PI / 2 + 2 * PI * k / DOTS, d = ball(.06, 0x3a4060);
      d.position.set(CLK[0] + DOT_R * Math.cos(a), CLK[1] + DOT_R * Math.sin(a), CLK[2] + .05); Wd.add(d); return d;
    });
    // chest with a hinged lid (pivot on the back edge)
    Y.chest = box(1.4, 1.0, .9, 0x8a5a32); Y.chest.position.set(CHEST[0], .5, CHEST[2]); Wd.add(Y.chest);
    Y.lidP = grp(Wd, [CHEST[0], 1.0, CHEST[2] - .45]);
    Y.lid = box(1.4, .06, .9, 0xa8733c); Y.lid.position.set(0, .03, .45); Y.lidP.add(Y.lid);
    // the meter (background + fill, left-anchored)
    Y.mBg = box(1.6, .22, .08, 0x444a66); Y.mBg.position.set(MTR[0], MTR[1], MTR[2]); Wd.add(Y.mBg);
    Y.mFill = box(1.6, .18, .1, 0x3fdc6a); Wd.add(Y.mFill);
    Y.mBg.visible = false; Y.mFill.visible = false;                         // shown only in beats 3-4
    // weekly strip (7 boxes with letters), shown only in beat 6
    Y.wk = WEEK_X.map(x => { const b = box(.42, .42, .08, CLR_OFF); b.position.set(x, WEEK_Y, WEEK_Z); Wd.add(b); return b; });
    Y.wk.forEach(b => { b.visible = false; });
    Y.wkT = LETTERS.map(L => bb(Wd, .34, .34, drawTag(L, '#ffffff', '#1d2a5a', '#7a8794')));
    // sun and moon icons (beat 6)
    Y.iS = grp(Wd, ICON_S); Y.iS.add(ball(.2, 0xffd23a)); Y.iS.scale.setScalar(.001);
    Y.iM = grp(Wd, ICON_M); Y.iM.add(ball(.2, 0xe8ecff)); Y.iM.scale.setScalar(.001);
    // the moon stamp (beat 2): a moon-shaped disc with a bite
    Y.stamp = grp(Wd, [NIGHT_BED[0], 3.0, NIGHT_BED[2] + .5]);
    Y.stamp.add(ball(.2, 0xe8ecff)); const bite = ball(.17, 0x2b2f6b); bite.position.set(.09, .03, .08); Y.stamp.add(bite);
    Y.stamp.scale.setScalar(.001);
    // the two heroes
    Y.dT = makeTallit(Wd, 0xffffff, CLR_NAVY, 81);
    Y.nT = makeTallit(Wd, CLR_NIGHT_CLOTH, CLR_NIGHT_STRIPE, 82);
    // tags
    Y.tDay = bb(Wd, 1.0, .42, drawTag('יום', '#dbe9ff', '#14408f', '#2f6ad0'));
    Y.tNight = bb(Wd, 1.9, .46, drawTag('רק ללילה', '#ece8ff', '#2d2a6b', '#7a70c0'));
    Y.tKis = bb(Wd, 2.0, .46, drawTag('כסות לילה', '#ece8ff', '#2d2a6b', '#7a70c0'));
    Y.tPt = bb(Wd, 2.6, .46, drawTag('פטורה מציצית', '#ffe1e1', '#8a1010', '#c43030'));
    Y.tMitz = bb(Wd, 1.2, .46, drawTag('מצווה', '#fff1c2', '#6a3a00', '#d9a63a'));
    Y.tGam = bb(Wd, 1.6, .46, drawTag('גם ביום', '#e4f8e6', '#1f6a2a', '#3f9a4a'));
    Y.t24 = bb(Wd, 1.4, .46, drawTag('24 שעות', '#fff6c2', '#6a4a00', '#d9a63a'));
    Y.tBoth = bb(Wd, 2.0, .46, drawTag('ביום ובלילה', '#e4f8e6', '#1f6a2a', '#3f9a4a'));
    // marks and shocks
    Y.check = mark3d(Wd, 'check', 1.0); Y.cross = mark3d(Wd, 'cross', .6);
    Y.shockR = shock(Wd, 0xff7a7a); Y.shockG = shock(Wd, 0x6dff9a);
    Y.spark = [0, 1, 2, 3].map(() => { const s = ball(.07, 0xffe36a); s.visible = false; Wd.add(s); return s; });
    return Y;
  }

  // ---------------------------------------------------------------- HOOK 0-14: extreme close-up on the sleepy night tallit on the pillow; pull out to the room; moon in the window; "?" above it
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0x2b2f6b);
    Y.sun.scale.setScalar(.001);
    Wd.on(t => {
      const br = Math.sin(t * 2);
      placeG(Y.nT.g, NIGHT_BED, 0, -.12);
      Y.nT.g.scale.set(1, 1 + .02 * br, 1);                                  // breathing
      placeG(Y.dT.g, DAY_HANG, 0, 0);
      setP(Y.moon, [MOON_P[0], MOON_P[1] + .08 * br, MOON_P[2]]);
      Y.tNight.set([NIGHT_BED[0], 2.05, NIGHT_BED[2]], popE(P(1, 2, t)), 0, 1);
      Y.tDay.set([DAY_HANG[0], 2.55, DAY_HANG[2]], popE(P(2, 3, t)), 0, 1);
      F(Y.nT.f, t, { smile: -.6, look: [0, -.3], talk: .3 * talkAmt(t, 3) });
      F(Y.dT.f, t, { smile: .6, look: [-.4, .1] });
      F(Y.moonF, t, { smile: .2, look: [0, .2], talk: .5 * talkAmt(t, 4) });
    });
    Wd.occ = []; Wd.center = [.5, .5]; Wd.qPos = [NIGHT_BED[0], NIGHT_BED[2]];
    Wd.cam = cuts([
      [dur * .6, HH(pullOut([NIGHT_BED[0], 1.5, NIGHT_BED[2] + .1], { dur: dur * .6, dist0: 1.2, dist1: 7.0, h0: .2, h1: 1.5, a0: 6, a1: -10, fov0: 34, fov1: 46 }), 41)],
      [dur * .4, HH(truck([.4, .3, .6], { dur: dur * .4, dist0: 7.4, dist1: 7.2, h0: 1.0, h1: 1.2, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 42)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, good): daylight left with the sun, moon right; the day tallit hops off the peg and stands proud; both tags pop
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0x9fd8ff);
    Y.wk.forEach(b => { b.visible = false; });
    Wd.on(t => {
      const u = sm(P(2, 5.5, t));
      const dp = arcV(DAY_HANG, DAY_FLOOR, u, 1.1);
      placeG(Y.dT.g, dp, -.3 * u, 0);
      Y.dT.g.scale.setScalar(1 + .04 * u);                                    // stands proud
      Y.sun.scale.setScalar(Math.max(.001, popE(P(0, 1.2, t))));
      setP(Y.sun, [SUN_P[0], SUN_P[1] + .05 * Math.sin(t * 2), SUN_P[2]]);
      setP(Y.moon, [MOON_P[0], MOON_P[1] + .05 * Math.sin(t * 2 + 1), MOON_P[2]]);
      placeG(Y.nT.g, NIGHT_BED, 0, -.12);
      Y.tDay.set([dp[0], dp[1] + 1.0, dp[2]], popE(P(1.5, 2.5, t)), 0, 1);
      Y.tNight.set([NIGHT_BED[0], 2.05, NIGHT_BED[2]], popE(P(2.5, 3.5, t)), 0, 1);
      F(Y.dT.f, t, { smile: .8, look: [.3, 0], talk: t > 2 ? .6 * talkAmt(t, 1) : 0 });
      F(Y.nT.f, t, { smile: .1 + .4 * sm(P(7, 8, t)), look: [.2, -.1], talk: t > 7 ? .6 * talkAmt(t, 2) : 0 });
      F(Y.sunF, t, { smile: .8, talk: t < 7 ? .6 * talkAmt(t, 3) : 0 });
      F(Y.moonF, t, { smile: .6, talk: t >= 7 ? .6 * talkAmt(t, 4) : 0 });
    });
    Wd.occ = []; Wd.center = [-.3, 1.2];
    Wd.cam = cuts([
      [dur * .3, HH(truck([0, 1.0, -.6], { dur: dur * .3, dist0: 8.0, dist1: 7.6, h0: .9, h1: 1.0, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 11)],
      [dur * .35, HH(punch(pushIn([-.5, 1.1, .2], { dur: dur * .35, dist0: 5.0, dist1: 4.4, h0: .8, h1: .9, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .35 * .6]), 12)],
      [dur * .35, HH(insert([DAY_FLOOR[0], 1.2, DAY_FLOOR[2]], { dur: dur * .35, dist0: 2.6, dist1: 2.2, h0: .9, h1: 1.0, a0: -10, a1: 10, fov0: 36, fov1: 34 }), 13)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (14, bad): insert on the night tallit: "כסות לילה" grows on it; a moon stamp lands on it; red cross pulses
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0x9fd8ff);
    Y.wk.forEach(b => { b.visible = false; });
    const NP = NIGHT_BED;
    Wd.on(t => {
      placeG(Y.dT.g, DAY_FLOOR, 0, 0); Y.dT.g.scale.setScalar(1.04);
      placeG(Y.nT.g, NP, 0, -.12);
      Y.nT.g.scale.set(1, 1 + .015 * Math.sin(t * 2.5), 1);
      Y.tNight.set([NP[0], 2.05, NP[2]], 1 - sm(P(.2, 1.2, t)), 0, 1 - sm(P(.2, 1.2, t)));
      Y.tKis.set([NP[0], 2.05, NP[2]], popE(P(.5, 2, t)), 0, 1);
      const su = sm(P(2.5, 3.6, t));
      setP(Y.stamp, lerpV([NP[0] + .4, 3.0, NP[2] + .5], [NP[0] + .2, 1.7, NP[2] + .15], su));
      Y.stamp.scale.setScalar(Math.max(.001, popE(P(2.3, 2.9, t)) * .9));
      const cpos = [NP[0] - .55, 1.9, NP[2] + .2];
      Y.cross.set(cpos, popE(P(4, 5, t)) * .9 * (.85 + .15 * Math.sin(t * 6)), .08 * Math.sin(t * 4));
      Y.shockR.set(cpos, P(4, 4.8, t), 1.0);
      F(Y.nT.f, t, { smile: -.3, surprise: .6 * sm(P(4, 5, t)), talk: .6 * talkAmt(t, 11), look: [0, .1] });
      F(Y.dT.f, t, { smile: -.2, look: [-.4, .1], talk: .5 * talkAmt(t, 12) });
      F(Y.sunF, t, { smile: .4 });
      F(Y.moonF, t, { smile: .3 });
    });
    Wd.occ = []; Wd.center = [.6, 1.2];
    Wd.cam = cuts([
      [dur * .3, HH(truck([.2, 1.0, -.4], { dur: dur * .3, dist0: 7.6, dist1: 7.2, h0: .9, h1: .9, a0: 6, a1: -6, fov0: 46, fov1: 44 }), 21)],
      [dur * .35, HH(punch(pushIn([.6, 1.3, -1.6], { dur: dur * .35, dist0: 4.8, dist1: 4.2, h0: 1.0, h1: 1.1, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .35 * .4]), 22)],
      [dur * .35, HH(insert([NP[0] - .1, 1.5, NP[2]], { dur: dur * .35, dist0: 2.5, dist1: 2.1, h0: 1.0, h1: 1.1, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, bad): the "מצווה" meter over the night tallit drains to 0; its strings go grey; "פטורה מציצית"; it sighs
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0x9fd8ff);
    Y.wk.forEach(b => { b.visible = false; });
    Y.mBg.visible = true; Y.mFill.visible = true;
    Wd.on(t => {
      placeG(Y.dT.g, DAY_FLOOR, 0, 0); Y.dT.g.scale.setScalar(1.04);
      placeG(Y.nT.g, NIGHT_BED, 0, -.12 - .05 * Math.sin(t * 1.2));           // the sigh: leaning back and forth
      const lv = 1 - sm(P(1, 5, t));
      Y.mFill.scale.x = Math.max(.001, lv);
      Y.mFill.position.set(MTR[0] - .8 + .8 * Math.max(.001, lv), MTR[1], MTR[2] + .02);
      Y.tKis.set([NIGHT_BED[0], 2.05, NIGHT_BED[2]], 1, 0, 1 - sm(P(0, 1, t)));
      Y.tMitz.set([MTR[0], MTR[1] + .4, MTR[2]], popE(P(0, .8, t)), 0, 1);
      Y.tPt.set([NIGHT_BED[0], 2.05, NIGHT_BED[2]], popE(P(1.2, 2.2, t)), 0, 1);
      const cc = col(0xffffff, 0x66667a, sm(P(1, 5, t)));
      Y.nT.strings.forEach(s => s.material.color.setHex(cc));
      Y.cross.set([MTR[0] + .95, MTR[1] + .45, MTR[2]], popE(P(4.5, 5.5, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockR.set([MTR[0] + .95, MTR[1] + .45, MTR[2]], P(4.5, 5.3, t), 1.0);
      F(Y.nT.f, t, { smile: -.2 - .4 * sm(P(3, 4, t)), look: [0, -.3], talk: .5 * talkAmt(t, 31) });
      F(Y.dT.f, t, { smile: .2, look: [-.6, 0], talk: .5 * talkAmt(t, 32) });
    });
    Wd.occ = []; Wd.center = [.8, 1.6];
    Wd.cam = cuts([
      [dur * .35, HH(orbitShot([.4, 1.4, -1.2], { dur: dur * .35, dist0: 7.4, dist1: 7.0, h0: 1.0, h1: 1.2, a0: -18, a1: -4, fov0: 46, fov1: 46 }), 31)],
      [dur * .3, HH(punch(pushIn([MTR[0], MTR[1], MTR[2]], { dur: dur * .3, dist0: 4.6, dist1: 4.0, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .3 * .5]), 32)],
      [dur * .35, HH(insert([MTR[0] + .2, MTR[1], MTR[2]], { dur: dur * .35, dist0: 2.6, dist1: 2.2, h0: 1.4, h1: 1.5, a0: -8, a1: 8, fov0: 36, fov1: 34 }), 33)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, good): the night tallit slides into the chest and the lid closes; the day tallit jumps from the floor onto the bed; "גם ביום"; green check, strings shine
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0x9fd8ff);
    Y.wk.forEach(b => { b.visible = false; });
    Y.mBg.visible = true; Y.mFill.visible = true; Y.mFill.scale.x = .001;
    Wd.on(t => {
      const cu = sm(P(.5, 3.5, t));
      placeG(Y.nT.g, lerpV(NIGHT_BED, [CHEST[0], .65, CHEST[2]], cu), 0, -.12 * (1 - cu));
      Y.nT.g.scale.setScalar(Math.max(.001, 1 - sm(P(2.5, 3.6, t))));
      Y.lidP.rotation.x = -1.3 * (1 - sm(P(3.5, 5.5, t)));                  // lid open, then closes
      Y.tPt.set([NIGHT_BED[0], 2.05, NIGHT_BED[2]], 1, 0, 1 - sm(P(0, 1, t)));
      const uj = sm(P(1, 4.5, t));
      placeG(Y.dT.g, arcV(DAY_FLOOR, DAY_BED, uj, 1.6), 0, 0);
      Y.dT.g.scale.setScalar(1.04 - .04 * uj);
      Y.dT.strings.forEach(s => s.material.color.setHex(col(0xffffff, 0xfff3a0, sm(P(5, 6, t)))));
      Y.tGam.set([DAY_BED[0], DAY_BED[1] + 1.0, DAY_BED[2]], popE(P(5, 6, t)), 0, 1);
      const ck = [DAY_BED[0] + .9, DAY_BED[1] + .5, DAY_BED[2] + .2];
      Y.check.set(ck, popE(P(6, 7, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set(ck, P(6, 6.8, t), 1.2);
      F(Y.dT.f, t, { smile: .2 + .8 * sm(P(5, 6, t)), look: [0, .2], talk: .4 * talkAmt(t, 41) * sm(P(5, 6, t)) });
      F(Y.nT.f, t, { smile: -.3, look: [0, -.5] });
      F(Y.sunF, t, { smile: .6 });
      F(Y.moonF, t, { smile: .6 });
    });
    Wd.occ = []; Wd.center = [.2, 1.4];
    Wd.cam = cuts([
      [dur * .35, HH(truck([-.4, 1.0, -1.0], { dur: dur * .35, dist0: 7.4, dist1: 7.0, h0: .9, h1: 1.0, a0: 8, a1: -8, fov0: 46, fov1: 44 }), 41)],
      [dur * .3, HH(punch(pushIn([DAY_BED[0], 1.4, DAY_BED[2]], { dur: dur * .3, dist0: 4.8, dist1: 4.2, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .3 * .6]), 42)],
      [dur * .35, HH(insert([CHEST[0], 1.0, CHEST[2]], { dur: dur * .35, dist0: 3.0, dist1: 2.6, h0: 1.3, h1: 1.2, a0: 10, a1: -6, fov0: 38, fov1: 36 }), 43)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, good): the clock spins a full day; the 24 dots fill; sun -> moon -> sun cross the window in an arc; the day tallit turns once (a fresh swap); "24 שעות"
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0x9fd8ff);
    Y.wk.forEach(b => { b.visible = false; });
    Y.nT.g.scale.setScalar(.001); placeG(Y.nT.g, [CHEST[0], .65, CHEST[2]], 0, 0);   // night tallit is inside the chest
    Wd.on(t => {
      placeG(Y.dT.g, DAY_BED, 2 * PI * sm(P(0, 4, t)), 0);
      Y.dT.g.scale.setScalar(1);
      Y.hh.rotation.z = -2 * PI * t / dur;                                      // hour hand: one full turn in the beat
      Y.hm.rotation.z = -2 * PI * 12 * t / dur;                                 // minute hand: twelve turns
      Y.dots.forEach((d, k) => { const lit = sm(P(.5 + .1 * k, .8 + .1 * k, t)); d.scale.setScalar(Math.max(.001, .8 + .6 * lit)); d.material.color.setHex(col(0x3a4060, 0xffd23a, lit)); });
      Y.t24.set([CLK[0], CLK[1] + .95, CLK[2]], popE(P(1, 2, t)), 0, 1);
      const u1 = sm(P(0, 4.5, t));
      setP(Y.sun, arcV(SUN_P, MOON_P, u1, .8));
      setP(Y.moon, arcV(MOON_P, SUN_P, u1, -.8));
      const ck = [CLK[0] - .9, CLK[1], CLK[2] + .2];
      Y.check.set(ck, popE(P(4.5, 5.5, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set(ck, P(4.5, 5.3, t), 1.2);
      F(Y.dT.f, t, { smile: 1, look: [0, .2], talk: .3 * talkAmt(t, 53) });
      F(Y.sunF, t, { smile: .9, talk: t < 4.5 ? .5 * talkAmt(t, 51) : 0 });
      F(Y.moonF, t, { smile: .9, talk: t >= 4.5 ? .5 * talkAmt(t, 52) : 0 });
    });
    Wd.occ = []; Wd.center = [1.0, 2.0];
    Wd.cam = cuts([
      [dur * .35, HH(orbitShot([-.2, 1.8, -1.2], { dur: dur * .35, dist0: 9.5, dist1: 9.0, h0: 1.4, h1: 1.6, a0: -18, a1: -4, fov0: 46, fov1: 46 }), 81)],
      [dur * .3, HH(truck([.4, 1.7, -2.0], { dur: dur * .3, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 44, fov1: 44 }), 82)],
      [dur * .35, HH(punch(insert([CLK[0], CLK[1], CLK[2]], { dur: dur * .35, dist0: 2.6, dist1: 2.2, h0: 1.0, h1: 1.2, a0: -8, a1: 8, fov0: 36, fov1: 34 }), [dur * .35 * .6]), 83)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, good): the week strip lights day by day (א-ז); sun and moon icons glow together over the same tallit; green check; sparkles
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0x9fd8ff);
    Y.nT.g.scale.setScalar(.001); placeG(Y.nT.g, [CHEST[0], .65, CHEST[2]], 0, 0);
    Wd.on(t => {
      placeG(Y.dT.g, DAY_BED, 0, 0);
      Y.wk.forEach((b, i) => { b.visible = true; b.material.color.setHex(col(CLR_OFF, CLR_LIT, sm(P(.5 + .6 * i, 1.1 + .6 * i, t)))); });
      Y.wkT.forEach((tg, i) => tg.set([WEEK_X[i], WEEK_Y, WEEK_Z + .12], popE(P(.4 + .6 * i, 1.0 + .6 * i, t)), 0, 1));
      const pulse = popE(P(3, 4, t)) * (1 + .08 * Math.sin(t * 5));           // both icons pulse in the same phase
      Y.iS.scale.setScalar(Math.max(.001, pulse)); Y.iM.scale.setScalar(Math.max(.001, pulse));
      Y.tBoth.set([(ICON_S[0] + ICON_M[0]) / 2, ICON_S[1] + .6, ICON_S[2]], popE(P(4, 5, t)), 0, 1);
      const ck = [DAY_BED[0] + .9, DAY_BED[1] + .5, DAY_BED[2] + .2];
      Y.check.set(ck, popE(P(5, 6, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set(ck, P(5, 5.8, t), 1.4);
      const sp = [[.7, .5, .3], [-.6, .6, .3], [.2, .9, .5], [-.4, .2, .6]];
      Y.spark.forEach((s, i) => {
        s.position.set(DAY_BED[0] + sp[i][0], DAY_BED[1] + sp[i][1], DAY_BED[2] + sp[i][2]);
        s.visible = true; s.scale.setScalar(Math.max(.001, popE(P(5.8 + .2 * i, 6.6 + .2 * i, t)) * (.7 + .3 * Math.sin(t * 8 + i))));
      });
      F(Y.dT.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 61) });
      F(Y.sunF, t, { smile: .8, talk: .3 * talkAmt(t, 62) });
      F(Y.moonF, t, { smile: .8, talk: .3 * talkAmt(t, 63) });
    });
    Wd.occ = []; Wd.center = [.6, 2.0];
    Wd.cam = cuts([
      [dur * .35, HH(crane([.2, 2.0, -1.6], { dur: dur * .35, dist0: 7.0, dist1: 6.4, h0: .8, h1: 1.6, a0: 4, a1: -4, fov0: 46, fov1: 44 }), 91)],
      [dur * .35, HH(orbitShot([1.2, 1.4, -1.6], { dur: dur * .35, dist0: 6.8, dist1: 6.6, h0: .9, h1: 1.0, a0: -22, a1: 14, fov0: 44, fov1: 44 }), 92)],
      [dur * .3, HH(punch(insert([DAY_BED[0] + .4, 1.9, DAY_BED[2]], { dur: dur * .3, dist0: 2.8, dist1: 2.4, h0: 1.4, h1: 1.5, a0: -8, a1: 8, fov0: 36, fov1: 34 }), [dur * .3 * .6]), 93)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): warm morning light; the day tallit smiles on the bed; sun and moon in the window; slow crane over the room
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xffd9a0);
    Y.skyR.material.color.set(0xffc98a);
    Y.wk.forEach(b => { b.visible = false; });
    Y.nT.g.scale.setScalar(.001); placeG(Y.nT.g, [CHEST[0], .65, CHEST[2]], 0, 0);
    Wd.on(t => {
      placeG(Y.dT.g, DAY_BED, 0, 0);
      Y.tGam.set([DAY_BED[0], DAY_BED[1] + 1.0, DAY_BED[2]], popE(P(.5, 1.2, t)), 0, 1);
      Y.check.set([DAY_BED[0] + .9, DAY_BED[1] + .5, DAY_BED[2] + .2], popE(P(1, 2, t)) * .9, .05 * Math.sin(t * 3));
      F(Y.dT.f, t, { smile: 1, talk: .3 * talkAmt(t, 1), look: [0, .3] });
      F(Y.sunF, t, { smile: 1, talk: .2 * talkAmt(t, 2) });
      F(Y.moonF, t, { smile: 1, talk: .2 * talkAmt(t, 3) });
    });
    Wd.occ = [Y.bed]; Wd.center = [.6, 1.4]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([.8, 1.6, -1.6], { dur: dur, dist0: 8.2, dist1: 7.4, h0: .6, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
