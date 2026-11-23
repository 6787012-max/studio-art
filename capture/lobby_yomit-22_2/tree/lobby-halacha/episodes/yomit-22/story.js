// yomit-22 story: "לא להזכיר את שם ההורים" (halacha yomit 22). Storyboard A in storyboards_v23.md.
// Copied from episodes/yomit-21/story.js (living room, armchairs with crowns, stool with a face, tags, camera helpers).
// NO people, NO figures. Parents = armchairs with crowns; son = a STOOL with a face; a friend = a BALL with a face.
// Everything is a function of local time t.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const lerpV = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
  const arcV = (a, b, u, h) => { const p = lerpV(a, b, u); p[1] += h * Math.sin(PI * clamp(u, 0, 1)); return p; };
  const FB = { talk: 0, smile: .3, look: [0, 0], surprise: 0, open: 1 };
  const F = (f, t, o) => f.set(t, Object.assign({}, FB, o));
  const placeG = (g, p, ry, rx) => { g.position.set(p[0], p[1], p[2]); g.rotation.set(rx || 0, ry || 0, 0); };
  const C4 = (dur, a, b, c, d) => cuts([[dur * .25, a], [dur * .25, b], [dur * .25, c], [dur * .25, d]]);

  // ---------------------------------------------------------------- positions (metres; back wall at z=-2.4, camera on +z)
  const DOOR = [0, 0, -2.0];                                            // the door in the back wall
  const ABA = [-1.1, 0, -1.7], IMA = [1.2, 0, -1.7];                    // the two armchairs (parents)
  const ST0 = [0, 0, .1];                                               // the stool (son), on its own rug
  const FR0 = [-1.25, .35, .25];                                        // the friend ball "חבר"
  const GOLD_AB = [-1.1, 3.0, -1.5];                                    // gold bubble above the armchair "אבא"
  const CROWN_A = [-1.1, 1.95, -1.7], CROWN_I = [1.2, 1.6, -1.7];       // where the crowns sit
  const SHIELD_A = [-1.1, 2.0, -.8];                                    // where a "שם" card stops in front of the crown
  const LA = [-1.1, .95, -.7], LM = [1.2, .95, -.7];                    // the gold cards land in front of the armchairs
  const TAG_Y = 2.5;                                                    // beat tags, centred above the action
  const CLR_GOLD = 0xffd23a, CLR_ROOT = 0x5a3a20, CLR_FLOOR = 0xb98a5a, CLR_GREYA = 0x8a8a96;
  const BLUEP = ['#dbe9ff', '#14408f', '#2f6ad0'], ROSEP = ['#ffe1ec', '#8a1a4a', '#d9779a'];
  const GOLDP = ['#fff1c2', '#6a3a00', '#d9a63a'], GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'];
  const WHITEP = ['#ffffff', '#2d3a6b', '#9aa7c4'], GREYP = ['#e6e6e6', '#444444', '#8a8a8a'];
  const REDP = ['#ffe3e3', '#8a1a1a', '#d33b3b'];
  // dotted outline of an armchair spot (12 points on its rectangle), shifted by dx
  const outlineAt = dx => {
    const R = [[-1.75, .1], [-.45, .1], [-.45, 2.2], [-1.75, 2.2]], o = [];
    for (let k = 0; k < 4; k++) { const a = R[k], b = R[(k + 1) % 4];
      for (let j = 0; j < 3; j++) o.push([lerp(a[0], b[0], j / 3) + dx, lerp(a[1], b[1], j / 3)]); }
    return o;
  };
  const OUT = outlineAt(0).concat(outlineAt(2.3));                      // the armchair "אבא" spot and the "אמא" spot

  // ---------------------------------------------------------------- tags (same helpers as yomit-21)
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
  // a floor/air arrow (shaft along +x from its origin, cone at the end)
  function makeArrow(Wd, c, L) {
    const g = new THREE.Group(); Wd.add(g);
    const sh = box(L, .07, .1, c); sh.position.x = L / 2; g.add(sh);
    const hd = cyl(0, .18, .3, c); hd.position.x = L + .12; hd.rotation.z = -PI / 2; g.add(hd);
    return g;
  }
  // the stool (the son): a small wooden block with legs; face on the front
  function makeStool(Wd) {
    const S = {}; S.g = new THREE.Group(); S.g.scale.setScalar(1.2); S.g.position.set(ST0[0], 0, ST0[2]); Wd.add(S.g);
    S.body = box(.8, .55, .6, 0x9a6a3a); S.body.position.y = .5; S.g.add(S.body);
    [[-.3, -.2], [.3, -.2], [-.3, .2], [.3, .2]].forEach(([x, z]) => { const l = box(.1, .45, .1, 0x6a4a2a); l.position.set(x, .2, z); S.g.add(l); });
    S.f = face(Wd, { w: .5, parent: S.g, pos: [0, .5, .31], seed: 84 });
    return S;
  }
  // the friend (a ball with a face, the "חבר")
  function friend(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    g.add(ball(.35, 0x3fb8c8));
    const f = face(Wd, { w: .42, parent: g, pos: [0, 0, .36], seed: 88 });
    return { g, f };
  }
  // a big ear icon (they hear): a flat skin-coloured ear with a darker inner part
  function ear(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const o = ball(.3, 0xf2b8a0); o.scale.set(.7, 1.1, .45); g.add(o);
    const i = ball(.14, 0xc07a68); i.position.z = .08; i.scale.set(.7, 1.1, .5); g.add(i);
    return g;
  }
  // a lane on the floor (a thin strip from A to B)
  function lane(Wd, A, B) {
    const dx = B[0] - A[0], dz = B[2] - A[2], L = Math.hypot(dx, dz);
    const b = box(L, .05, .14, 0xd8c9b0); b.position.set((A[0] + B[0]) / 2, .03, (A[2] + B[2]) / 2); b.rotation.y = -Math.atan2(dz, dx); Wd.add(b);
  }
  // a table (a top and one leg)
  function table(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], 0, p[2]); Wd.add(g);
    const top = box(.9, .06, .6, 0x8a5a2a); top.position.y = .55; g.add(top);
    const leg = cyl(.08, .1, .52, 0x6a4a2a); leg.position.y = .27; g.add(leg);
    return g;
  }
  // an open book on a flat base: the right page turns over (turn 0..1)
  function makeBook(Wd, p, s) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); g.scale.setScalar(s || 1); Wd.add(g);
    const cov = box(.95, .05, .7, 0x7a3a10); cov.position.y = .025; g.add(cov);
    const pl = box(.42, .04, .62, 0xfff8e8); pl.position.set(-.22, .06, 0); g.add(pl);
    const piv = new THREE.Group(); piv.position.set(0, .06, 0); g.add(piv);
    const pr = box(.42, .04, .62, 0xfff8e8); pr.position.set(.22, 0, 0); piv.add(pr);
    return { g, piv };
  }
  // small icons (question tags and light bulbs) that go back and forth between two points, one after another
  function icons(Wd, n) {
    return Array.from({ length: n }, (_, i) => {
      if (i % 2 === 0) return T2(Wd, .36, '?', WHITEP, .36);
      const m = ball(.11, 0xffe36a); m.visible = false; Wd.add(m);
      return { set(p, s) { m.visible = s > .01; m.position.set(p[0], p[1], p[2]); m.scale.setScalar(Math.max(.001, s)); } };
    });
  }
  function bounceIcons(I, P1, P2, t, t0) {
    I.forEach((ic, i) => {
      const c = (t - t0 - i * .9) / 1.6;
      if (c < 0) { ic.set(P1, 0); return; }
      const k = Math.floor(c), ph = c - k;
      const from = k % 2 === 0 ? P1 : P2, to = k % 2 === 0 ? P2 : P1;
      ic.set(arcV(from, to, sm(ph), .5), popE(clamp(ph * 5, 0, 1)));
    });
  }
  // a glowing disc behind a crown (faces the camera)
  function glowAt(Wd, p, r, c) {
    const d = cyl(r, r, .03, c); d.rotation.x = PI / 2; d.position.set(p[0], p[1], p[2]); Wd.add(d); return d;
  }

  // ---------------------------------------------------------------- the living room (fresh per beat)
  function room(Wd) {
    const Y = {};
    Y.back = box(12, 6, .2, 0xf3e3c8); Y.back.position.set(0, 2.5, -2.4); Wd.add(Y.back);
    const floor = box(12, .1, 10, CLR_FLOOR); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const rug = box(3.6, .02, 2.6, 0xd9b38c); rug.position.set(0, .01, -.1); Wd.add(rug);
    const srug = box(.9, .03, .7, 0xc0584a); srug.position.set(ST0[0], .015, ST0[2]); Wd.add(srug);   // the stool's own rug
    // the door in the back wall (its panel swings open into the room)
    const DF = box(1.3, 2.3, .1, CLR_ROOT); DF.position.set(0, 1.15, -2.27); Wd.add(DF);
    Y.dpiv = new THREE.Group(); Y.dpiv.position.set(-.5, 0, -2.2); Wd.add(Y.dpiv);
    const dp = box(1.0, 2.1, .08, 0xb07a44); dp.position.set(.5, 1.05, 0); Y.dpiv.add(dp);
    const kn = ball(.04, CLR_GOLD); kn.position.set(.9, 1.05, .06); Y.dpiv.add(kn);
    Y.abaG = chair(Wd, ABA, 1.15, 0x2f5fb8);                             // "אבא"
    Y.imaG = chair(Wd, IMA, .9, 0xd9779a);                               // "אמא"
    Y.fA = face(Wd, { w: .55, parent: Y.abaG, pos: [0, .7, .52], seed: 85 });
    Y.fI = face(Wd, { w: .5, parent: Y.imaG, pos: [0, .7, .52], seed: 86 });
    Y.cA = makeCrown(Wd, CLR_GOLD); Y.cI = makeCrown(Wd, CLR_GOLD);
    Y.check = mark3d(Wd, 'check', 1.0); Y.cross = mark3d(Wd, 'cross', .6);
    Y.shockR = shock(Wd, 0xff7a7a); Y.shockG = shock(Wd, 0x6dff9a);
    Y.T = { aba: T2(Wd, 1.0, 'אבא', BLUEP), ama: T2(Wd, 1.0, 'אמא', ROSEP) };
    setDoor(Y, 0);
    return Y;
  }
  function setDoor(Y, o) { Y.dpiv.rotation.y = -1.4 * o; }
  // the two parents: they walk in or out (uA, uI from 0 to 1); crowns follow; name tags only when in place and showTags is on
  function parents(Y, t, showTags, uA, uI) {
    const enter = (u, base) => ({ off: [(DOOR[0] - base[0]) * (1 - u), 0, (DOOR[2] - base[2]) * (1 - u)], sc: lerp(.15, 1, u) });
    const at = (base, st, loc) => [base[0] + st.off[0] + loc[0] * st.sc, loc[1] * st.sc, base[2] + st.off[2] + loc[2] * st.sc];
    const a = enter(uA === undefined ? 1 : uA, ABA), b = enter(uI === undefined ? 1 : uI, IMA);
    const on = showTags !== false;
    placeG(Y.abaG, [ABA[0] + a.off[0], 0, ABA[2] + a.off[2]], 0, 0); Y.abaG.scale.setScalar(1.15 * a.sc);
    placeG(Y.imaG, [IMA[0] + b.off[0], 0, IMA[2] + b.off[2]], 0, 0); Y.imaG.scale.setScalar(.9 * b.sc);
    const pa = at(ABA, a, [0, 1.95 + .05 * Math.sin(t * 2), 0]), pi = at(IMA, b, [0, 1.6 + .05 * Math.sin(t * 2 + 1.5), 0]);
    placeG(Y.cA, pa, 0, 0); Y.cA.scale.setScalar(a.sc);
    placeG(Y.cI, pi, 0, 0); Y.cI.scale.setScalar(b.sc);
    Y.T.aba.set(at(ABA, a, [0, 2.5, 0]), on && (uA === undefined || uA > .95) ? 1 : 0, 0, 1);
    Y.T.ama.set(at(IMA, b, [0, 2.05, 0]), on && (uI === undefined || uI > .95) ? 1 : 0, 0, 1);
  }

  // ================================================================ HOOK 0-14: extreme close-up on the stool's face, pull out; the stool gives a white card "שם" to the friend ball "חבר" (green check); it turns, holds another "שם" card; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    const FD = friend(Wd, FR0);
    const CKF = mark3d(Wd, 'check', .45);
    const C1 = T2(Wd, .9, 'שם', WHITEP, .42);                             // the card that goes to the friend
    const C2 = T2(Wd, .9, 'שם', WHITEP, .42);                             // the card the stool keeps for the armchairs
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      const ry = -.7 * sm(P(1, 3, t)) + .7 * sm(P(5.5, 7, t));
      placeG(S.g, [ST0[0], ST0[1] + .03 * Math.sin(t * 3), ST0[2]], ry, 0);
      C1.set(arcV([0, 1.0, .35], [FR0[0], .95, .3], sm(P(2, 4, t)), .6), popE(P(1.9, 2.3, t)), 0, 1);
      CKF.set([FR0[0], 1.25, FR0[2]], popE(P(4.2, 5, t)) * .9, 0);
      C2.set([0, 1.5 + .05 * Math.sin(t * 2.5), .35], popE(P(6, 7, t)), 0, 1);
      F(FD.f, t, { smile: t > 4.5 ? .8 : .2, look: [.5, .3], talk: t > 4 ? .6 * talkAmt(t, 88) : 0 });
      F(S.f, t, { smile: t > 6 ? -.2 : .3, look: [.3, .3], talk: t > 6 && t < 9 ? .6 * talkAmt(t, 7) : 0 });
      F(Y.fA, t, { smile: .4, look: [0, .2] });
      F(Y.fI, t, { smile: .2, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [-.3, .9]; Wd.qPos = [.35, .3];
    Wd.cam = C4(dur,
      HH(pullOut([0, .6, .3], { dur: dur * .25, dist0: 1.3, dist1: 2.2, h0: .6, h1: .8, a0: 4, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([0, .9, -.6], { dur: dur * .25, dist0: 3.2, dist1: 6.0, h0: .8, h1: 1.4, a0: -4, a1: 6, fov0: 38, fov1: 44 }), 42),
      HH(truck([0, .9, -.2], { dur: dur * .25, dist0: 6.6, dist1: 6.2, h0: 1.1, h1: 1.3, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([0, 1.0, -.2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, bad): a white card "שם" flies from the stool toward the armchair "אבא" and hits an invisible shield in front of the crown; red cross + shock; tag "שם הוריו"
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    const C1 = T2(Wd, .9, 'שם', WHITEP, .42);
    const SH = cyl(.75, .75, .05, 0x7fd0ff); SH.rotation.x = PI / 2; SH.position.set(-1.1, 2.0, -.95); Wd.add(SH);   // the shield
    const TG = T2(Wd, 1.5, 'שם הוריו', REDP, .42);
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      const u = sm(P(.6, 2.0, t)), hit = P(2.0, 2.6, t);
      const slide = .3 * sm(P(2.6, 3.4, t));
      const jit = .05 * Math.sin(t * 40) * (1 - hit);
      C1.set([lerp(0, SHIELD_A[0], u) + jit, lerp(1.0, SHIELD_A[1], u) - slide, lerp(.35, SHIELD_A[2], u)], popE(P(.2, .6, t)), 0, 1);
      SH.visible = t > .5; SH.scale.setScalar(1 + .25 * Math.sin(PI * hit));
      Y.shockR.set([-1.1, 2.0, -.9], hit, 1.2);
      Y.cross.set([-1.1, 2.6, -.8], popE(P(2.2, 2.9, t)) * .9, 0);
      Y.cA.rotation.z = .3 * sm(P(2.0, 2.8, t));
      TG.set([0, TAG_Y, .6], popE(P(2.8, 3.6, t)), 0, 1);
      F(S.f, t, { smile: -.4, look: [-.8, .2], talk: t < 2 ? .7 * talkAmt(t, 71) : 0 });
      F(Y.fA, t, { smile: t < 2 ? .4 : -.5, look: [0, .2], surprise: sm(P(2.0, 2.6, t)), talk: t > 2 ? .6 * talkAmt(t, 72) : 0 });
      F(Y.fI, t, { smile: .1, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [-.3, 1.2];
    Wd.cam = C4(dur,
      HH(punch(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.2, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), [1.4]), 11),
      HH(pushIn([-.6, 1.6, -1.0], { dur: dur * .25, dist0: 5.8, dist1: 5.2, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 12),
      HH(insert([-1.1, 2.4, -1.2], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 2.3, h1: 2.5, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([-.3, 1.4, -.4], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28, bad): two lanes, one to "אבא" and one to "אמא"; a "שם" card tries each lane and both hit a shield with a red cross; the crowns glow; tag "אבא ואמא"
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    lane(Wd, [0, .05, .35], [-1.1, .05, -1.2]);
    lane(Wd, [0, .05, .35], [1.2, .05, -1.2]);
    const CA = T2(Wd, .9, 'שם', WHITEP, .42), CB = T2(Wd, .9, 'שם', WHITEP, .42);
    const SHA = cyl(.75, .75, .05, 0x7fd0ff); SHA.rotation.x = PI / 2; SHA.position.set(-1.1, 2.0, -.95); Wd.add(SHA);
    const SHI = cyl(.75, .75, .05, 0x7fd0ff); SHI.rotation.x = PI / 2; SHI.position.set(1.2, 2.0, -.95); Wd.add(SHI);
    const GLA = glowAt(Wd, CROWN_A, .4, CLR_GOLD), GLI = glowAt(Wd, [CROWN_I[0], CROWN_I[1], CROWN_I[2]], .34, CLR_GOLD);
    const CRA = mark3d(Wd, 'cross', .55), CRI = mark3d(Wd, 'cross', .55);
    const SHKA = shock(Wd, 0xff7a7a), SHKI = shock(Wd, 0xff7a7a);
    const TG = T2(Wd, 1.5, 'אבא ואמא', REDP, .42);
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      const uA = sm(P(.6, 2.0, t)), uI = sm(P(2.6, 3.8, t));
      const hitA = P(2.0, 2.6, t), hitI = P(3.8, 4.4, t);
      CA.set(arcV([0, 1.0, .35], [-1.1, 2.0, -.75], uA, .5), popE(P(.2, .6, t)), 0, 1);
      CB.set(arcV([0, 1.0, .35], [1.2, 2.0, -.75], uI, .5), popE(P(2.4, 2.8, t)), 0, 1);
      SHKA.set([-1.1, 2.0, -.9], hitA, 1.0); SHKI.set([1.2, 2.0, -.9], hitI, 1.0);
      CRA.set([-1.1, 2.6, -.8], popE(P(2.2, 2.8, t)) * .9, 0);
      CRI.set([1.2, 2.6, -.8], popE(P(4.0, 4.6, t)) * .9, 0);
      const pulse = 1 + .2 * Math.sin(t * 4);
      GLA.scale.setScalar(t > 2 ? pulse : .001); GLI.scale.setScalar(t > 4 ? pulse : .001);
      TG.set([0, TAG_Y, .6], popE(P(.6, 1.4, t)), 0, 1);
      F(S.f, t, { smile: -.5, look: [0, .3], talk: t < 4.5 ? .6 * talkAmt(t, 21) : 0 });
      F(Y.fA, t, { smile: -.3, look: [0, .2], surprise: hitA, talk: t > 2 ? .6 * talkAmt(t, 22) : 0 });
      F(Y.fI, t, { smile: -.3, look: [0, .2], surprise: hitI, talk: t > 4 ? .6 * talkAmt(t, 23) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(crane([0, 1.8, -.4], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.0, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 21),
      HH(punch(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.6, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 22),
      HH(insert([-1.1, 2.0, -.8], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.9, h1: 2.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, bad): a big ear icon above the armchairs (they hear); the stool lifts a white card "שם" - red cross + shock; tag "בפניהם"
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    const EAR = ear(Wd, [0, 2.0, -1.9]);                                  // above the two armchairs, between them
    const CK = T2(Wd, .9, 'שם', WHITEP, .42);
    const CRS = mark3d(Wd, 'cross', .6);
    const SHK = shock(Wd, 0xff7a7a);
    const TG = T2(Wd, 1.3, 'בפניהם', REDP, .42);
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      const lift = sm(P(.8, 2.2, t)), hit = P(2.4, 3.0, t);
      CK.set([-.75, lerp(1.0, 1.7, lift), .45], popE(P(.4, .9, t)), 0, 1);
      SHK.set([-.75, 1.7, .45], hit, 1.0);
      CRS.set([-.75, 2.2, .45], popE(P(2.8, 3.4, t)) * .9, 0);
      const pulse = 1 + .08 * Math.sin(t * 4);
      EAR.visible = t > .4; EAR.scale.setScalar(1.4 * pulse);
      TG.set([0, TAG_Y, .6], popE(P(3.4, 4.2, t)), 0, 1);
      F(S.f, t, { smile: -.6, look: [0, .3], talk: .6 * talkAmt(t, 91) });
      F(Y.fA, t, { smile: .3, look: [0, .6], surprise: hit, talk: t < 2 ? .5 * talkAmt(t, 92) : 0 });
      F(Y.fI, t, { smile: .3, look: [0, .6], talk: t > 1 ? .5 * talkAmt(t, 93) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.4];
    Wd.cam = C4(dur,
      HH(punch(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 46, fov1: 44 }), [2.8]), 31),
      HH(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.6, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 32),
      HH(insert([0, 2.6, -.6], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 2.4, h1: 2.6, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 33),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, bad): both armchairs roll out through the door and the door closes; the dotted outlines of the empty spots appear; the stool talks to the friend "חבר" and a white card "שם" pops in its speech - red cross; tag "שלא בפניהם"
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    const FD = friend(Wd, FR0);
    const CK = T2(Wd, .9, 'שם', WHITEP, .42);
    const CRS = mark3d(Wd, 'cross', .6);
    const SHK = shock(Wd, 0xff7a7a);
    const DT = OUT.map(([x, y]) => { const d = ball(.06, 0x6a6a7a); d.visible = false; d.position.set(x, y, -1.6); Wd.add(d); return d; });
    const TG = T2(Wd, 1.9, 'שלא בפניהם', REDP, .42);
    Wd.on(t => {
      setDoor(Y, sm(P(0, .9, t)) - sm(P(4.0, 4.8, t)));
      const uA = 1 - sm(P(1.0, 3.2, t)), uI = 1 - sm(P(1.4, 3.6, t));
      parents(Y, t, false, uA, uI);
      Y.abaG.visible = uA > .02; Y.cA.visible = uA > .02;
      Y.imaG.visible = uI > .02; Y.cI.visible = uI > .02;
      DT.forEach((d, i) => { const k = P(3.6 + (i % 12) * .03, 4.0 + (i % 12) * .03, t); d.visible = k > 0; d.scale.setScalar(Math.max(.001, popE(k))); });
      CK.set([-.3, 1.75, .3], popE(P(4.6, 5.2, t)), 0, 1);
      SHK.set([-.3, 2.0, .3], P(5.8, 6.4, t), .9);
      CRS.set([-.3, 2.3, .3], popE(P(5.8, 6.4, t)) * .9, 0);
      TG.set([0, TAG_Y, .6], popE(P(6.8, 7.6, t)), 0, 1);
      F(S.f, t, { smile: -.6, look: [-.5, .2], talk: t > 4.4 ? .6 * talkAmt(t, 101) : 0 });
      F(FD.f, t, { smile: t > 4 ? -.3 : .3, look: [.6, .2], talk: t > 4.8 ? .5 * talkAmt(t, 103) : 0 });
      F(Y.fA, t, { smile: -.2, look: [0, .2], talk: t < 3 ? .6 * talkAmt(t, 102) : 0 });
      F(Y.fI, t, { smile: .3, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [-.4, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.2, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 61),
      HH(punch(pushIn([-.4, 1.2, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [2.5]), 62),
      HH(insert([-.3, 1.8, .3], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.6, h1: 1.8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 63),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, neutral diagram): the parents sit in place; a pointing ARROW from the white card "שם" to the armchair "אבא" grows and glows orange; the armchair's ring lights red; tag "כשמתכוון אליהם"
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    const CP = [-.45, 1.3, .3], TP = [-1.0, 1.7, -1.2];
    const CK = T2(Wd, .9, 'שם', WHITEP, .42);
    const dx = TP[0] - CP[0], dy = TP[1] - CP[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
    const ARW = makeArrow(Wd, 0xff9a3a, L); ARW.rotation.z = ang; ARW.position.set(CP[0], CP[1], CP[2] - .2);
    const RG = glowAt(Wd, [CROWN_A[0], 1.95, CROWN_A[2]], .45, 0xff5a4a);
    const TG = T2(Wd, 1.7, 'כשמתכוון אליהם', WHITEP, .42);
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      CK.set([CP[0], CP[1] + .04 * Math.sin(t * 3), CP[2]], popE(P(.2, .8, t)), 0, 1);
      const u = sm(P(1.2, 2.6, t));
      ARW.scale.x = Math.max(.001, u);
      ARW.visible = t > 1.0;
      const glow = .5 + .5 * Math.sin(t * 4);
      RG.scale.setScalar(.001 + 1.0 * sm(P(2.6, 3.4, t)) * (1 + .15 * glow));
      TG.set([0, TAG_Y, .6], popE(P(3.0, 3.8, t)), 0, 1);
      F(S.f, t, { smile: .2, look: [-.6, .3], talk: t < 3 ? .6 * talkAmt(t, 111) : 0 });
      F(Y.fA, t, { smile: .2, look: [0, .2], talk: t > 3 ? .5 * talkAmt(t, 112) : 0 });
      F(Y.fI, t, { smile: .2, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [-.4, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.2, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 71),
      HH(punch(pushIn([-.4, 1.2, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 72),
      HH(insert([-.7, 1.6, -.3], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.5, h1: 1.6, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, good): the stool sends gold cards "אבא" and "אמא" instead; they land softly in front of the armchairs; the crowns shine, sparkles, green check; tag "כבוד הורים"
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    const GA = T2(Wd, 1.0, 'אבא', GOLDP, .42), GM = T2(Wd, 1.0, 'אמא', GOLDP, .42);
    const GLA = glowAt(Wd, CROWN_A, .42, CLR_GOLD), GLI = glowAt(Wd, CROWN_I, .36, CLR_GOLD);
    const SPA = Array.from({ length: 6 }, () => { const b = ball(.05, 0xffe36a); b.visible = false; Wd.add(b); return b; });
    const SPI = Array.from({ length: 6 }, () => { const b = ball(.05, 0xffe36a); b.visible = false; Wd.add(b); return b; });
    const CKB = mark3d(Wd, 'check', .9);
    const TG = T2(Wd, 1.6, 'כבוד הורים', GREENP, .42);
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      const sA = sm(P(.8, 2.2, t)), sM = sm(P(1.6, 3.0, t));
      GA.set(arcV([0, 1.0, .3], LA, sA, .8), popE(P(.6, 1.0, t)), 0, 1);
      GM.set(arcV([0, 1.0, .3], LM, sM, .8), popE(P(1.4, 1.8, t)), 0, 1);
      const shine = 1 + .15 * Math.sin(t * 3);
      GLA.scale.setScalar(t > 2.4 ? shine : .001); GLI.scale.setScalar(t > 3.2 ? shine : .001);
      const spr = (arr, c, t0) => arr.forEach((b, k) => {
        const a = k / 6 * 2 * PI + t * .7, r = .4 * sm(P(t0, t0 + 1.2, t)), s = popE(P(t0, t0 + .6, t));
        b.visible = s > .01; b.position.set(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * .6, c[2]); b.scale.setScalar(Math.max(.001, s));
      });
      spr(SPA, CROWN_A, 2.6); spr(SPI, CROWN_I, 3.4);
      CKB.set([0, 1.6, -.4], popE(P(3.6, 4.4, t)) * .9, 0);
      TG.set([0, TAG_Y, .6], popE(P(3.8, 4.6, t)), 0, 1);
      F(S.f, t, { smile: .8, look: [0, .3], talk: t < 2.4 ? .5 * talkAmt(t, 121) : 0 });
      F(Y.fA, t, { smile: t > 2.4 ? .9 : .3, look: [0, .2], talk: t > 2.4 ? .4 * talkAmt(t, 122) : 0 });
      F(Y.fI, t, { smile: t > 3.2 ? .9 : .3, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(crane([0, 1.8, -.4], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.0, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 81),
      HH(punch(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.6, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 82),
      HH(insert([-.1, 1.5, -.7], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.6, h1: 1.7, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 83),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 84));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the armchairs in the back, both crowns shining, the gold cards "אבא" and "אמא" in front of them; the stool at the front smiling; slow crane. NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 0);
    const S = makeStool(Wd);
    const GA = T2(Wd, 1.0, 'אבא', GOLDP, .42), GM = T2(Wd, 1.0, 'אמא', GOLDP, .42);
    const GLA = glowAt(Wd, CROWN_A, .42, CLR_GOLD), GLI = glowAt(Wd, CROWN_I, .36, CLR_GOLD);
    const GLW = glowAt(Wd, GOLD_AB, 1.2, CLR_GOLD);
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      const shine = 1 + .1 * Math.sin(t * 3);
      GLA.scale.setScalar(shine); GLI.scale.setScalar(shine); GLW.scale.setScalar(.5 + .05 * Math.sin(t * 3));
      GA.set(LA, 1, 0, 1); GM.set(LM, 1, 0, 1);
      F(S.f, t, { smile: 1, look: [.3, .2], talk: .4 * talkAmt(t, 3) });
      F(Y.fA, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 1) });
      F(Y.fI, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 2) });
    });
    Wd.occ = []; Wd.center = [0, 1.0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur: dur, dist0: 8.2, dist1: 7.4, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
