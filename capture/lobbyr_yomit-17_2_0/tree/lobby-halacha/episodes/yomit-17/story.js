// yomit-17 story: "מורא אב ואם" (halacha yomit 17). Storyboard A in storyboards_v18.md.
// Copied from episodes/yomit-16/story.js (living room, two armchairs with crowns, tags, camera helpers, faces).
// NO people, NO figures. Parents = the two armchairs with crowns (with faces). Son = a small wooden STOOL with a face.
// Royal THRONE with a big crown appears in beat 1 only. Everything is a function of local time t.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const lerpV = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
  const arcV = (a, b, u, h) => { const p = lerpV(a, b, u); p[1] += h * Math.sin(PI * clamp(u, 0, 1)); return p; };
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
  const ST0 = [0, 0, .1];                                               // the stool (son), on its own small rug
  const CLR_GOLD = 0xffd23a, CLR_BLUE = 0x2f5fb8, CLR_ROSE = 0xd9779a, CLR_ROOT = 0x5a3a20, CLR_GREY = 0x7a8090;
  const CLR_FLOOR = 0xb98a5a;
  const BLUEP = ['#dbe9ff', '#14408f', '#2f6ad0'], ROSEP = ['#ffe1ec', '#8a1a4a', '#d9779a'];
  const GOLDP = ['#fff1c2', '#6a3a00', '#d9a63a'], GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'];
  const WHITEP = ['#ffffff', '#2d3a6b', '#9aa7c4'], GREYP = ['#e6e6e6', '#444444', '#8a8a8a'];
  const REDP = ['#ffe3e3', '#8a1a1a', '#d33b3b'];

  // ---------------------------------------------------------------- tags (same helpers as yomit-16)
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
  const T2 = (Wd, w, text, pal, h) => bb(Wd, w, h || .42, drawTag(text, pal[0], pal[1], pal[2]));

  // ---------------------------------------------------------------- an armchair (the parents; a face on the seat front)
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
  // a floor arrow (shaft along +x from its origin, cone at the end)
  function makeArrow(Wd, c, L) {
    const g = new THREE.Group(); Wd.add(g);
    const sh = box(L, .07, .1, c); sh.position.x = L / 2; g.add(sh);
    const hd = cyl(0, .18, .3, c); hd.position.x = L + .12; hd.rotation.z = -PI / 2; g.add(hd);
    return g;
  }
  // a throne with a big gold crown (beat 1 only); starts under the floor and rises
  function makeThrone(Wd) {
    const TH = new THREE.Group(); TH.position.set(2.8, -1.8, -1.9); Wd.add(TH);
    const seat = box(1.3, .5, 1.1, 0x7a2a8a); seat.position.y = .35; TH.add(seat);
    const back = box(1.3, 1.5, .25, 0x7a2a8a); back.position.set(0, 1.15, -.42); TH.add(back);
    [-.65, .65].forEach(x => { const a = box(.2, .5, 1.1, CLR_GOLD); a.position.set(x, .75, 0); TH.add(a); });
    const cr = makeCrown(TH, CLR_GOLD); cr.position.set(0, 2.05, -.4); cr.scale.setScalar(2.4);
    return TH;
  }
  // the stool (the son): a small wooden block with legs; face on the front
  function makeStool(Wd) {
    const S = {}; S.g = new THREE.Group(); S.g.scale.setScalar(1.2); Wd.add(S.g);
    S.body = box(.8, .55, .6, 0x9a6a3a); S.body.position.y = .5; S.g.add(S.body);
    [[-.3, -.2], [.3, -.2], [-.3, .2], [.3, .2]].forEach(([x, z]) => { const l = box(.1, .45, .1, 0x6a4a2a); l.position.set(x, .2, z); S.g.add(l); });
    S.f = face(Wd, { w: .5, parent: S.g, pos: [0, .5, .31], seed: 84 });
    return S;
  }

  // ---------------------------------------------------------------- the living room (fresh per beat)
  function room(Wd, skyCol) {
    const Y = {};
    Y.back = box(12, 6, .2, 0xf3e3c8); Y.back.position.set(0, 2.5, -2.4); Wd.add(Y.back);
    const floor = box(12, .1, 10, CLR_FLOOR); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const rug = box(3.6, .02, 2.6, 0xd9b38c); rug.position.set(0, .01, -.1); Wd.add(rug);
    const srug = box(.9, .03, .7, 0xc0584a); srug.position.set(ST0[0], .015, ST0[2]); Wd.add(srug);   // the stool's own rug
    Y.sky = box(3.0, 1.8, .05, skyCol); Y.sky.position.set(0, 2.5, -2.33); Wd.add(Y.sky);
    const WF = 0x8a5a32;
    [3.56, 1.64].forEach(y => { const b = box(3.2, .14, .14, WF); b.position.set(0, y, -2.3); Wd.add(b); });
    [-1.56, 1.56].forEach(x => { const b = box(.14, 1.92, .14, WF); b.position.set(x, 2.6, -2.3); Wd.add(b); });
    Y.abaG = chair(Wd, ABA, 1.15, CLR_BLUE);                             // "אבא"
    Y.imaG = chair(Wd, IMA, .9, CLR_ROSE);                               // "אמא"
    Y.fA = face(Wd, { w: .55, parent: Y.abaG, pos: [0, .7, .52], seed: 85 });
    Y.fI = face(Wd, { w: .5, parent: Y.imaG, pos: [0, .7, .52], seed: 86 });
    Y.cA = makeCrown(Wd, CLR_GOLD); Y.cI = makeCrown(Wd, CLR_GOLD);
    // marks and shocks
    Y.check = mark3d(Wd, 'check', 1.0); Y.cross = mark3d(Wd, 'cross', .6);
    Y.shockR = shock(Wd, 0xff7a7a); Y.shockG = shock(Wd, 0x6dff9a);
    Y.spark = [0, 1, 2, 3, 4].map(() => { const s = ball(.07, 0xffe36a); s.visible = false; Wd.add(s); return s; });
    Y.T = { aba: T2(Wd, 1.0, 'אבא', BLUEP), ama: T2(Wd, 1.0, 'אמא', ROSEP) };
    return Y;
  }
  // the two parents: crowns bob; their name tags stay on unless the beat flies them in
  function parents(Y, t, showTags) {
    placeG(Y.cA, [CROWN_A[0], CROWN_A[1] + .05 * Math.sin(t * 2), CROWN_A[2]], 0, 0);
    placeG(Y.cI, [CROWN_I[0], CROWN_I[1] + .05 * Math.sin(t * 2 + 1.5), CROWN_I[2]], 0, 0);
    const on = showTags !== false;
    Y.T.aba.set(TAG_A, on ? 1 : 0, 0, 1);
    Y.T.ama.set(TAG_I, on ? 1 : 0, 0, 1);
  }

  // ---------------------------------------------------------------- HOOK 0-14: extreme close-up on the stool's face; pull out to the armchairs with crowns; "?" above the stool
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const S = makeStool(Wd);
    const Q = T2(Wd, .5, '?', WHITEP, .5);
    Wd.on(t => {
      parents(Y, t, true);
      placeG(S.g, [ST0[0], ST0[1] + .03 * Math.sin(t * 3), ST0[2]], .25 * Math.sin(t * 1.6), 0);
      Q.set([ST0[0], 1.6, ST0[2]], popE(P(1, 2, t)), 0, 1);
      F(Y.fA, t, { smile: .3 }); F(Y.fI, t, { smile: .3 });
      F(S.f, t, { smile: -.2, look: [0, .1], talk: .6 * talkAmt(t, 7) });
    });
    Wd.occ = []; Wd.center = [0, .8]; Wd.qPos = [ST0[0], ST0[2] + .4];
    Wd.cam = C4(dur,
      HH(pullOut([ST0[0], .6, ST0[2]], { dur: dur * .25, dist0: 1.1, dist1: 1.8, h0: .6, h1: .7, a0: 4, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([0, .9, -.6], { dur: dur * .25, dist0: 3.2, dist1: 6.0, h0: .8, h1: 1.4, a0: -4, a1: 6, fov0: 38, fov1: 44 }), 42),
      HH(truck([0, .9, -.2], { dur: dur * .25, dist0: 6.6, dist1: 6.2, h0: 1.1, h1: 1.3, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([0, 1.0, -.2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, good): a royal throne rises beside the armchairs; a big "=" pops between the throne and the armchairs; the stool bows to them; tag "כמו מלך"; green check
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const S = makeStool(Wd); const TH = makeThrone(Wd);
    const EQ1 = box(.36, .07, .08, CLR_GOLD), EQ2 = box(.36, .07, .08, CLR_GOLD);
    EQ1.position.set(1.95, 1.25, -.5); EQ2.position.set(1.95, 1.0, -.5); Wd.add(EQ1); Wd.add(EQ2);
    EQ1.scale.setScalar(.001); EQ2.scale.setScalar(.001);
    const TK = T2(Wd, 1.7, 'כמו מלך', GOLDP, .46);
    const CHK = Y.check, bow = { v: 0 };
    Wd.on(t => {
      parents(Y, t, true);
      const u = sm(P(.5, 2.5, t));
      TH.position.y = lerp(-1.8, 0, u);
      const eq = Math.max(.001, popE(P(2.5, 3.5, t)));
      EQ1.scale.setScalar(eq); EQ2.scale.setScalar(eq);
      TK.set([1.95, 2.2, -.5], popE(P(3.2, 4.2, t)), 0, 1);
      const q = clamp(P(3, 5.5, t), 0, 1);
      const bw = .35 * Math.sin(PI * q);
      placeG(S.g, [ST0[0], ST0[1], ST0[2]], 0, -bw);
      F(Y.fA, t, { smile: .6 * u, talk: t > 1 ? .5 * talkAmt(t, 11) : 0, look: [0, .1] });
      F(Y.fI, t, { smile: .6 * u, talk: t > 1 ? .4 * talkAmt(t, 12) : 0, look: [0, .1] });
      F(S.f, t, { smile: .6, look: [0, .2], talk: t > 1 ? .6 * talkAmt(t, 13) : 0 });
      CHK.set([0, 1.6, ST0[2]], popE(P(9.5, 10.5, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([0, 1.6, ST0[2]], P(9.5, 10.2, t), 1.2);
    });
    Wd.occ = []; Wd.center = [.2, 1.2];
    Wd.cam = C4(dur,
      HH(truck([.2, 1.2, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.0, h0: 1.2, h1: 1.5, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 11),
      HH(punch(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [1.4]), 12),
      HH(insert([1.95, 1.2, -.5], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: 1.5, h1: 1.6, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([.2, 1.4, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28, bad): a gold ring on the floor around the father's armchair ("המקום של אבא"); the stool hops toward it - red cross - and bounces back to its own rug - green check
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const S = makeStool(Wd);
    const RC = [-1.1, 0, -1.4];
    const ring = new THREE.Group(); ring.position.set(RC[0], 0, RC[2]); Wd.add(ring);
    const ro = cyl(.85, .85, .03, CLR_GOLD); ro.position.y = .015; ring.add(ro);
    const ri = cyl(.68, .68, .035, CLR_FLOOR); ri.position.y = .02; ring.add(ri);
    const TR = T2(Wd, 2.2, 'המקום של אבא', GOLDP, .46);
    const TGT = [-1.1, 0, -.55];
    Wd.on(t => {
      parents(Y, t, true);
      const uF = sm(P(2, 6, t)), uB = sm(P(6.3, 9, t));
      const p = t < 6.3 ? arcV(ST0, TGT, uF, .35) : arcV(TGT, ST0, uB, .3);
      placeG(S.g, [p[0], p[1], p[2]], 0, 0);
      ro.material.color.setHex(col(CLR_GOLD, 0xfff6d0, .5 + .5 * Math.sin(t * 3)));
      TR.set([-2.5, 1.3, -1.4], popE(P(0, 1, t)), 0, 1);
      Y.cross.set([-1.1, 1.2, -.5], popE(P(6, 6.8, t)) * .9, 0);
      Y.shockR.set([-1.1, 1.2, -.5], P(6, 6.8, t), 1.2);
      Y.check.set([0, 1.5, ST0[2]], popE(P(10, 11, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([0, 1.5, ST0[2]], P(10, 10.8, t), 1.2);
      F(Y.fA, t, { smile: -.2, look: [0, .2] }); F(Y.fI, t, { smile: .3, look: [0, .2] });
      const hit = t > 5.6 && t < 8;
      F(S.f, t, { smile: t > 6 ? -.6 : .2, surprise: hit ? 1 : 0, look: [0, .2], talk: .5 * talkAmt(t, 71) });
    });
    Wd.occ = []; Wd.center = [-.2, 1.0];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, .2], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 21),
      HH(punch(pushIn([-.6, 1.0, .2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [6.2]), 22),
      HH(insert([-1.1, .6, -.5], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: .7, h1: .8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(crane([0, 2.0, -1.0], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: .9, h1: 1.6, a0: 4, a1: -4, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, bad): the parents' speech bubble "דברי אבא"; the stool's bubble "לא נכון" crashes into it - red cross; then a second stool bubble "דבריכם נראים" with a small judge's scale - red cross; tag "לא סותר, לא מכריע"
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const S = makeStool(Wd);
    const PB = T2(Wd, 1.7, 'דברי אבא', BLUEP, .42);
    const SB1 = T2(Wd, 1.3, 'לא נכון', REDP, .42);
    const SB2 = T2(Wd, 1.9, 'דבריכם נראים', WHITEP, .42);
    const SC = new THREE.Group(); Wd.add(SC);
    const beam = box(.5, .04, .04, CLR_GOLD); SC.add(beam);
    const stick = box(.04, .3, .04, CLR_GOLD); stick.position.y = -.17; SC.add(stick);
    [-.25, .25].forEach(x => { const pan = cyl(.1, .1, .02, CLR_GOLD); pan.position.set(x, -.04, 0); SC.add(pan); });
    const TL = T2(Wd, 2.4, 'לא סותר, לא מכריע', GREYP, .46);
    const IMP1 = [-.7, 2.1, -.9], IMP2 = [-.6, 2.1, -.9], PBP = [-1.1, 2.4, -1.0];
    Wd.on(t => {
      parents(Y, t, true);
      PB.set(PBP, popE(P(0, 1, t)), 0, 1);
      TL.set([0, 3.2, -.6], popE(P(.5, 1.5, t)), 0, 1);
      // bubble 1: flies in, hits, falls away
      const u1 = sm(P(1, 3.5, t));
      const p1 = arcV([0, 1.2, .5], IMP1, u1, .4);
      const fall1 = sm(P(4, 5.6, t));
      SB1.set([p1[0], p1[1] - .7 * fall1, p1[2]], popE(P(1, 1.8, t)), 0, 1 - fall1);
      Y.cross.set([-.9, 2.3, -.8], popE(P(3.8, 4.4, t)) * .9, 0);
      Y.shockR.set(IMP1, P(3.8, 4.4, t), 1.2);
      // bubble 2 with the scale: arrives after the first one is gone
      const u2 = sm(P(6, 9, t));
      const p2 = arcV([0, 1.2, .5], IMP2, u2, .4);
      SB2.set([p2[0], p2[1], p2[2]], popE(P(6, 6.8, t)), 0, 1);
      SC.position.set(p2[0] + 1.25, p2[1] + .1, p2[2]);
      SC.rotation.z = .12 * Math.sin(t * 3);
      SC.scale.setScalar(Math.max(.001, popE(P(6, 6.8, t))));
      Y.cross.set([-.7, 2.45, -.8], popE(P(9, 9.6, t)) * .9, 0);
      Y.shockR.set(IMP2, P(9, 9.6, t), 1.2);
      F(Y.fA, t, { smile: -.3, look: [0, .2], talk: t < 6 ? .6 * talkAmt(t, 31) : 0 });
      F(Y.fI, t, { smile: -.2, look: [0, .2], talk: t > 6 && t < 11 ? .5 * talkAmt(t, 32) : 0 });
      F(S.f, t, { smile: -.6, look: [0, .2], surprise: (t > 3.6 && t < 5) || (t > 8.8 && t < 10.2) ? 1 : 0, talk: .5 * talkAmt(t, 33) });
    });
    Wd.occ = []; Wd.center = [-.2, 1.6];
    Wd.cam = C4(dur,
      HH(truck([-.2, 1.5, -.4], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 31),
      HH(punch(pushIn([-.4, 1.8, -.4], { dur: dur * .25, dist0: 6.2, dist1: 5.8, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 32),
      HH(insert([-.7, 2.1, -.8], { dur: dur * .25, dist0: 3.8, dist1: 3.4, h0: 1.9, h1: 2.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 33),
      HH(orbitShot([-.2, 1.8, -.6], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.6, h1: 1.8, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, good): a name sticker with a scribbled private name (no real name) flies at the armchair - red cross - and falls; then the gold tag "אבא" flies and sticks on the father's chair, "אמא" on the mother's - green check
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const S = makeStool(Wd);
    const STK = new THREE.Group(); Wd.add(STK);
    STK.add(box(.5, .32, .03, 0xffffff));
    [.08, 0, -.08].forEach(y => { const l = box(.36, .03, .02, 0x6a6a7a); l.position.set(0, y, .02); STK.add(l); });
    const FA = T2(Wd, 1.0, 'אבא', GOLDP, .42), FI = T2(Wd, 1.0, 'אמא', ROSEP, .42);
    const SS = [0, 1.2, .5], SE = [-.9, 1.25, -1.15], FLY = [.3, 2.0, .2];
    Wd.on(t => {
      parents(Y, t, false);
      const u = sm(P(1, 4, t));
      const fall = sm(P(4.5, 6.5, t));
      const p = arcV(SS, SE, u, .5);
      const py = p[1] * (1 - fall) + .18 * fall;
      placeG(STK, [p[0], py, p[2]], 0, 0); STK.rotation.z = .3 * fall + .08 * Math.sin(t * 2.5) * (1 - fall);
      Y.cross.set([SE[0], SE[1], SE[2] + .1], popE(P(4, 4.6, t)) * .9, 0);
      Y.shockR.set(SE, P(4, 4.8, t), 1.2);
      const fa = sm(P(6.5, 8.5, t)), fi = sm(P(9.5, 11.5, t));
      const pa = arcV(FLY, TAG_A, fa, .6), pi = arcV(FLY, TAG_I, fi, .6);
      FA.set(pa, popE(P(6.5, 7, t)), 0, 1);
      FI.set(pi, popE(P(9.5, 10, t)), 0, 1);
      Y.check.set([0, 3.1, -.8], popE(P(12, 13, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([0, 3.1, -.8], P(12, 12.8, t), 1.2);
      F(Y.fA, t, { smile: fa > .9 ? .6 : .1, look: [0, .1] });
      F(Y.fI, t, { smile: fi > .9 ? .6 : .1, look: [0, .1] });
      F(S.f, t, { smile: .3, look: [0, .3], surprise: t > 4 && t < 5 ? 1 : 0, talk: .5 * talkAmt(t, 41) });
    });
    Wd.occ = []; Wd.center = [-.2, 1.6];
    Wd.cam = C4(dur,
      HH(truck([-.2, 1.5, -.4], { dur: dur * .25, dist0: 8.0, dist1: 7.6, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 46, fov1: 44 }), 61),
      HH(punch(pushIn([-.6, 1.6, -.4], { dur: dur * .25, dist0: 5.6, dist1: 5.0, h0: 1.6, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 62),
      HH(insert([-.9, 1.6, -1.1], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: 1.6, h1: 1.7, a0: -8, a1: 8, fov0: 36, fov1: 34 }), 63),
      HH(crane([.2, 1.8, -.4], { dur: dur * .25, dist0: 7.8, dist1: 6.6, h0: 2.2, h1: 1.8, a0: 8, a1: -8, fov0: 44, fov1: 42 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, bad then good): a ribbon of word-blocks flows out of the armchair; the stool's bubble "לא באמצע" pushes into the middle and cuts it - red cross; the ribbon runs to its end, a "סוף" dot - only then the stool's bubble appears - green check
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const S = makeStool(Wd);
    const RA = [-1.1, 1.25, -.9], RE = [1.1, 1.25, -.9], CUT = [-.3, 1.25, -.9];
    const RB = Array.from({ length: 8 }, (_, i) => { const m = box(.22, .14, .08, [0xff6fa0, 0xffd23a, 0x6dd6ff, 0x9aff6d][i % 4]); Wd.add(m); return m; });
    const END = ball(.07, CLR_GOLD); END.position.set(1.25, 1.25, -.9); Wd.add(END); END.scale.setScalar(.001);
    const SB1 = T2(Wd, 1.7, 'לא באמצע', REDP, .42);
    const SB2 = T2(Wd, 1.2, 'בסוף', GREENP, .42);
    const ribPos = (i, t) => {
      if (t < 7) return lerpV(RA, RE, fract(t * .15 + i / 8));
      const from = lerpV(RA, RE, fract(7 * .15 + i / 8));
      return lerpV(from, [-1.1 + .3 * i, 1.25, -.9], sm(P(7, 9.5, t)));
    };
    Wd.on(t => {
      parents(Y, t, true);
      RB.forEach((m, i) => {
        const p = ribPos(i, t);
        m.position.set(p[0], p[1], p[2]);
        const hidden = t >= 3.6 && t < 7 && p[0] > CUT[0];
        m.scale.setScalar(hidden ? .001 : 1);
      });
      END.scale.setScalar(Math.max(.001, popE(P(9.5, 10.3, t))));
      const u1 = sm(P(1, 3.5, t));
      const p1 = arcV([0, 1.5, .5], [CUT[0], CUT[1] + .35, -.6], u1, .4);
      SB1.set(p1, popE(P(1, 1.8, t)) * (t < 5.5 ? 1 : 0), 0, 1);
      Y.cross.set([CUT[0], CUT[1] + .4, -.7], popE(P(3.5, 4.1, t)) * .9, 0);
      Y.shockR.set([CUT[0], CUT[1] + .3, -.7], P(3.5, 4.2, t), 1.2);
      SB2.set([.9, 2.0, -.6], popE(P(10.5, 11.3, t)), 0, 1);
      Y.check.set([.9, 2.8, -.6], popE(P(11.8, 12.6, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([.9, 2.8, -.6], P(11.8, 12.5, t), 1.2);
      F(Y.fA, t, { smile: t < 7 ? -.2 : .3, look: [0, .2], talk: .5 * talkAmt(t, 51) });
      F(Y.fI, t, { smile: .1, look: [0, .2] });
      F(S.f, t, { smile: t < 7 ? -.5 : .6, look: [0, .2], surprise: t > 3.4 && t < 5 ? 1 : 0, talk: .5 * talkAmt(t, 52) });
    });
    Wd.occ = []; Wd.center = [0, 1.5];
    Wd.cam = C4(dur,
      HH(truck([0, 1.3, -.4], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.3, h1: 1.5, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 71),
      HH(punch(pushIn([0, 1.4, -.4], { dur: dur * .25, dist0: 6.4, dist1: 5.8, h0: 1.5, h1: 1.7, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 72),
      HH(insert([-.3, 1.25, -.8], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: 1.3, h1: 1.4, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([0, 1.5, -.6], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.4, h1: 1.6, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, bad then good): a big floor arrow from the father's armchair points right, tag "כך"; the stool's arrow points left (opposite) - red cross; it swings round and lines up with the parents' arrow - green check, sparkles
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xbfe6ff);
    const S = makeStool(Wd);
    const PA = makeArrow(Wd, 0x2f6ad0, 1.6); placeG(PA, [-1.1, .04, -.2], 0, 0);
    const SA = makeArrow(Wd, 0xd9477a, .9); placeG(SA, [-1.1, .04, .35], PI, 0);
    const TK = T2(Wd, .9, 'כך', BLUEP, .42);
    const TH2 = T2(Wd, 1.0, 'הפך', REDP, .42);
    const SPX = [-.2, 1.0, .4];
    Wd.on(t => {
      parents(Y, t, true);
      TK.set([-.1, .95, -.2], popE(P(.5, 1.5, t)), 0, 1);
      const sw = sm(P(5, 7.5, t));
      placeG(SA, [-1.1, .04, .35], PI * (1 - sw), 0);
      TH2.set([-2.0, .95, .35], popE(P(3, 3.8, t)) * (t < 7.5 ? 1 : 0), 0, 1);
      Y.cross.set([-2.0, .8, .35], popE(P(3, 3.6, t)) * .9, 0);
      Y.shockR.set([-2.0, .6, .35], P(3, 3.6, t), 1.2);
      Y.check.set([0, 1.6, .35], popE(P(8, 9, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([0, 1.6, .35], P(8, 8.8, t), 1.2);
      Y.spark.forEach((s, i) => {
        s.position.set(SPX[0] + .5 * Math.cos(i * 1.6 + t), SPX[1] + .4 * Math.sin(i * 1.6 + t), SPX[2] + .1);
        s.visible = t > 8; s.scale.setScalar(Math.max(.001, popE(P(8.5 + .3 * i, 9.2 + .3 * i, t)) * (.7 + .3 * Math.sin(t * 8 + i))));
      });
      F(Y.fA, t, { smile: .3, look: [0, .2], talk: .4 * talkAmt(t, 61) });
      F(Y.fI, t, { smile: .3, look: [0, .2] });
      F(S.f, t, { smile: t < 7 ? -.6 : .5, look: [0, .2], surprise: t > 3 && t < 4.5 ? 1 : 0, talk: .5 * talkAmt(t, 62) });
    });
    Wd.occ = []; Wd.center = [-.3, 1.0];
    Wd.cam = C4(dur,
      HH(truck([.2, 1.2, -1.0], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.4, h1: 1.5, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 81),
      HH(truck([0, 1.4, -1.0], { dur: dur * .25, dist0: 9.2, dist1: 8.6, h0: 1.4, h1: 1.6, a0: -10, a1: 10, fov0: 46, fov1: 44 }), 82),
      HH(insert([-.8, .5, -.1], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: .9, h1: 1.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 83),
      HH(orbitShot([-.2, 1.2, -.4], { dur: dur * .25, dist0: 7.6, dist1: 7.2, h0: 1.4, h1: 1.6, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 84));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): warm light; the armchairs in the middle-back, the throne faint behind; the stool at the bottom smiling; a row of five small icons on the back wall (ring, bubble, name tag, ribbon, arrow); slow crane
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd, 0xffd9a0);
    const S = makeStool(Wd);
    const TH = makeThrone(Wd); TH.scale.setScalar(.8); TH.position.set(2.8, 0, -2.1);
    const icons = [];
    const ringI = new THREE.Group(); ringI.add(cyl(.28, .28, .04, CLR_GOLD)); icons.push(ringI);
    const bubI = ball(.25, 0xdbe9ff); icons.push(bubI);
    const tagI = box(.5, .3, .05, 0xffffff); icons.push(tagI);
    const ribI = new THREE.Group(); [0, .1, -.1].forEach((y, i) => { const b = box(.5, .06, .05, 0xff6fa0); b.position.y = y; b.rotation.z = .3 * (i - 1); ribI.add(b); }); icons.push(ribI);
    const arrI = makeArrow(Wd, 0x2f6ad0, .6); arrI.position.set(-.3, 0, 0); arrI.rotation.z = 0; icons.push(arrI);
    const ICX = [-2.4, -1.2, 0, 1.2, 2.4];
    icons.forEach((ic, i) => { if (ic.parent !== Wd) Wd.add(ic); });
    Wd.on(t => {
      parents(Y, t, true);
      placeG(TH, [2.8, 0, -2.1], 0, 0);
      icons.forEach((ic, i) => {
        const pop = popE(P(.5 + .8 * i, 1.5 + .8 * i, t));
        ic.position.set(ICX[i] - (i === 4 ? .3 : 0), 3.3 + .05 * Math.sin(t * 2 + i), -2.2);
        ic.scale.setScalar(Math.max(.001, pop));
      });
      placeG(S.g, [0, 0, 1.4], 0, 0);
      F(Y.fA, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 1) });
      F(Y.fI, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 2) });
      F(S.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 3) });
    });
    Wd.occ = []; Wd.center = [0, 1.0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur: dur, dist0: 8.2, dist1: 7.4, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
