// yomit-21 story: "לא לסתור את דברי ההורים" (halacha yomit 21). Storyboard A in storyboards_v22.md.
// Copied from episodes/yomit-19/story.js (living room, armchairs with crowns, stool with a face, tags, camera helpers).
// NO people, NO figures. Parents = armchairs with crowns; son = a STOOL with a face; speech = gold / grey rounded tags.
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
  const GOLD_AB = [-1.1, 3.0, -1.5];                                    // gold bubble "דברי אבא" above the armchair
  const GUEST_B = [1.2, 2.75, -1.5];                                     // bubble of the guest armchair (beat 3)
  const TAG_Y = 2.5;                                                    // beat tags, centred above the action
  const CLR_GOLD = 0xffd23a, CLR_ROOT = 0x5a3a20, CLR_FLOOR = 0xb98a5a, CLR_GREYA = 0x8a8a96;
  const BLUEP = ['#dbe9ff', '#14408f', '#2f6ad0'], ROSEP = ['#ffe1ec', '#8a1a4a', '#d9779a'];
  const GOLDP = ['#fff1c2', '#6a3a00', '#d9a63a'], GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'];
  const WHITEP = ['#ffffff', '#2d3a6b', '#9aa7c4'], GREYP = ['#e6e6e6', '#444444', '#8a8a8a'];
  const REDP = ['#ffe3e3', '#8a1a1a', '#d33b3b'];
  // the outline of the armchair that is gone (beat 4): 12 points on its rectangle
  const OUT = (() => {
    const R = [[-1.75, .1], [-.45, .1], [-.45, 2.2], [-1.75, 2.2]], o = [];
    for (let k = 0; k < 4; k++) { const a = R[k], b = R[(k + 1) % 4];
      for (let j = 0; j < 3; j++) o.push([lerp(a[0], b[0], j / 3), lerp(a[1], b[1], j / 3)]); }
    return o;
  })();

  // ---------------------------------------------------------------- tags (same helpers as yomit-19)
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
  // the stool (the son): a small wooden block with legs; face on the front
  function makeStool(Wd) {
    const S = { h: 1 }; S.g = new THREE.Group(); S.g.scale.setScalar(1.2); S.g.position.set(ST0[0], 0, ST0[2]); Wd.add(S.g);
    S.body = box(.8, .55, .6, 0x9a6a3a); S.body.position.y = .5; S.g.add(S.body);
    [[-.3, -.2], [.3, -.2], [-.3, .2], [.3, .2]].forEach(([x, z]) => { const l = box(.1, .45, .1, 0x6a4a2a); l.position.set(x, .2, z); S.g.add(l); });
    S.f = face(Wd, { w: .5, parent: S.g, pos: [0, .5, .31], seed: 84 });
    return S;
  }
  function setH(S, h) { S.h = h; S.g.scale.set(1.2, 1.2 * (.55 + .45 * h), 1.2); }
  // a table (a top and one leg)
  function table(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], 0, p[2]); Wd.add(g);
    const top = box(.9, .06, .6, 0x8a5a2a); top.position.y = .55; g.add(top);
    const leg = cyl(.08, .1, .52, 0x6a4a2a); leg.position.y = .27; g.add(leg);
    return g;
  }
  // a pedestal (a round plinth) at x
  function pedestal(Wd, x) {
    const c = cyl(.55, .6, .7, 0xf3e3c8); c.position.set(x, .35, -.2); Wd.add(c); return c;
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
  // a weather icon (a grey cloud with three rain drops that bob)
  function weather(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    [[-.18, .12, 0], [0, .24, 0], [.2, .12, 0]].forEach(([x, y, z]) => { const b = ball(.2, 0xdfe6f2); b.position.set(x, y, z); g.add(b); });
    const rain = [-.16, 0, .16].map(x => { const r = cyl(.03, .03, .22, 0x3f8fd8); r.position.set(x, -.05, .18); g.add(r); return r; });
    return { g, rain };
  }
  // a wooden gavel (head lying flat, handle down)
  function gavel(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    const head = box(.6, .24, .26, 0x9a6a3a); g.add(head);
    const hd = box(.12, .7, .12, 0x6a4a2a); hd.position.set(0, -.45, 0); g.add(hd);
    return { g };
  }
  // a lock on top of a bubble (a shield-like sign of "not to be touched")
  function addLock(B) {
    const l = new THREE.Group(); l.position.set(0, .36, .03); B.g.add(l);
    l.add(box(.18, .14, .05, 0x6a3a00));
    const sh = cyl(.06, .06, .05, 0xd9a63a); sh.rotation.x = PI / 2; sh.position.y = .1; l.add(sh);
    return l;
  }
  // cracks on a bubble (grow with u)
  function cracks(B) {
    const cs = [.4, -.5, 1.5].map(r => { const c = box(.05, .9, .03, 0x2a1a08); c.rotation.z = r; c.position.z = .03; c.visible = false; B.g.add(c); return c; });
    return u => cs.forEach(c => { c.visible = u > .02; c.scale.y = Math.max(.001, u); });
  }
  // a grey arrow from A toward B: it tries, hits the bubble and bounces back; call the returned fn with t
  function tryArrow(Wd, A, B, t0) {
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]), ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    const g = makeArrow(Wd, CLR_GREYA, .6); g.rotation.z = ang; g.visible = false;
    return t => {
      const u = sm(P(t0, t0 + 1.1, t)) * (1 - .3 * Math.sin(PI * P(t0 + 1.1, t0 + 1.9, t)));
      const s = Math.max(0, len - .6) * u;
      g.visible = t > t0; g.position.set(A[0] + Math.cos(ang) * s, A[1] + Math.sin(ang) * s, A[2]);
    };
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

  // ================================================================ HOOK 0-14: extreme close-up on the stool's face, pull out; the grey bubble "זה לא נכון" grows from the stool toward the gold "דברי אבא"; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    const GB = T2(Wd, 2.0, 'דברי אבא', GOLDP, .5);
    const GR = T2(Wd, 1.9, 'זה לא נכון', GREYP, .5);
    const Q = T2(Wd, .5, '?', WHITEP, .5);
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      placeG(S.g, [ST0[0], ST0[1] + .03 * Math.sin(t * 3), ST0[2]], .25 * Math.sin(t * 1.6), 0);
      GB.set(GOLD_AB, popE(P(.8, 1.8, t)), 0, 1);
      const g = sm(P(4, 9, t));
      GR.set(lerpV([.1, 1.9, .3], [-.3, 2.4, -.8], g), popE(P(3.8, 5, t)) * (.7 + .3 * g), 0, 1);
      Q.set([-.6, 1.95, .3], popE(P(1, 2, t)), 0, 1);
      F(S.f, t, { smile: -.6, look: [.2, .3], talk: t > 3.5 ? .6 * talkAmt(t, 7) : 0 });
      F(Y.fA, t, { smile: .4, look: [0, .2], talk: t < 4 ? .8 * talkAmt(t, 5) : 0 });
      F(Y.fI, t, { smile: .2, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [0, .9]; Wd.qPos = [ST0[0], ST0[2] + .4];
    Wd.cam = C4(dur,
      HH(pullOut([0, .6, .3], { dur: dur * .25, dist0: 1.3, dist1: 2.2, h0: .6, h1: .8, a0: 4, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([0, .9, -.6], { dur: dur * .25, dist0: 3.2, dist1: 6.0, h0: .8, h1: 1.4, a0: -4, a1: 6, fov0: 38, fov1: 44 }), 42),
      HH(truck([0, .9, -.2], { dur: dur * .25, dist0: 6.6, dist1: 6.2, h0: 1.1, h1: 1.3, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([0, 1.0, -.2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, bad): the grey bubble "זה לא נכון" crashes into the gold bubble and cracks it; red cross + shock; the armchair's crown tilts; tag "לסתור = אסור"
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    const GB = T2(Wd, 2.0, 'דברי אבא', GOLDP, .5);
    const GR = T2(Wd, 1.9, 'זה לא נכון', GREYP, .5);
    const TG = T2(Wd, 1.3, 'לסתור = אסור', REDP, .42);
    const CK = cracks(GB);
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      const u = sm(P(0, 1.4, t)), hit = P(1.4, 2.2, t), jit = .06 * Math.sin(t * 40) * (1 - hit);
      const pG = lerpV([-.3, 2.4, -.8], [-.2, 2.55, -1.0], u);
      GR.set([pG[0] + jit, pG[1], pG[2]], 1, 0, 1);
      GB.set([GOLD_AB[0] + jit * .5, GOLD_AB[1], GOLD_AB[2]], 1, 0, 1);
      CK(P(1.4, 2.6, t));
      Y.shockR.set([-1.1, 3.0, -1.2], hit, 1.2);
      Y.cross.set([-1.1, 3.0, -1.0], popE(P(1.6, 2.2, t)) * .9, 0);
      Y.cA.rotation.z = .3 * sm(P(1.4, 2.8, t));
      TG.set([0, TAG_Y, .6], popE(P(2.8, 3.6, t)), 0, 1);
      F(S.f, t, { smile: -.6, look: [0, .3], surprise: sm(P(1.4, 2.2, t)), talk: t < 1.4 ? .7 * talkAmt(t, 71) : 0 });
      F(Y.fA, t, { smile: t < 1.4 ? .4 : -.5, look: [0, .2], surprise: sm(P(1.4, 2.2, t)), talk: t > 1.4 ? .6 * talkAmt(t, 72) : 0 });
      F(Y.fI, t, { smile: .1, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [-.3, 1.2];
    Wd.cam = C4(dur,
      HH(punch(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.2, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), [1.4]), 11),
      HH(pushIn([-.6, 1.6, -1.0], { dur: dur * .25, dist0: 5.8, dist1: 5.2, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 12),
      HH(insert([-1.1, 2.9, -1.5], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 2.7, h1: 2.9, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([-.3, 1.4, -.4], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28, neutral): diagram - two pedestals: the open book "תורה" on the left, the weather icon "ענייני העולם" on the right; a gold bubble "אבא אמר" with a lock over each; grey arrows try each and bounce off; tag "בתורה ובעולם"
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    [Y.abaG, Y.imaG, Y.cA, Y.cI].forEach(o => { o.visible = false; });
    pedestal(Wd, -1.4); pedestal(Wd, 1.4);
    const BK = makeBook(Wd, [-1.4, .72, -.2], 1);
    const WX = weather(Wd, [1.4, .72, -.2]);
    const L1 = T2(Wd, .9, 'תורה', BLUEP, .4), L2 = T2(Wd, 1.7, 'ענייני העולם', GREYP, .4);
    const BL = T2(Wd, 1.8, 'אבא אמר', GOLDP, .5), BR = T2(Wd, 1.8, 'אבא אמר', GOLDP, .5);
    addLock(BL); addLock(BR);
    const ta = tryArrow(Wd, [0, 1.0, .4], [-1.0, 1.9, -.2], 1.5);
    const tb = tryArrow(Wd, [0, 1.0, .4], [1.0, 1.9, -.2], 4.0);
    const TG = T2(Wd, 1.6, 'בתורה ובעולם', GOLDP, .42);
    Wd.on(t => {
      WX.rain.forEach((rn, i) => { rn.position.y = -.05 + .04 * Math.sin(t * 4 + i); });
      BK.piv.rotation.z = 0;
      BL.set([-1.4, 2.0, -.2], popE(P(.5, 1.3, t)), 0, 1);
      BR.set([1.4, 2.0, -.2], popE(P(3.0, 3.8, t)), 0, 1);
      L1.set([-1.4, .3, .5], popE(P(0, .6, t)), 0, 1);
      L2.set([1.4, .3, .5], popE(P(.3, 1, t)), 0, 1);
      ta(t); tb(t);
      TG.set([0, TAG_Y, .6], popE(P(.8, 1.6, t)), 0, 1);
    });
    Wd.occ = []; Wd.center = [0, 1.0];
    Wd.cam = C4(dur,
      HH(crane([0, 1.8, -.4], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.0, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 21),
      HH(punch(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.6, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 22),
      HH(insert([-1.4, 1.1, -.2], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.0, h1: 1.1, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(orbitShot([0, 1.0, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.0, h1: 1.2, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, bad): the armchair "אבא" and a guest armchair without crown "אורח" each have a bubble; the stool raises a wooden gavel over the gold bubble; the stamp "צודק!" tries to land and bounces off; red cross + shock; tag "לא להכריע"
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    Y.cI.visible = false;                                                 // the guest armchair has no crown
    const S = makeStool(Wd);
    const GB = T2(Wd, 2.0, 'דברי אבא', GOLDP, .5);
    const GG = T2(Wd, 1.8, 'דברי אורח', WHITEP, .5);
    const GU = T2(Wd, 1.0, 'אורח', GREYP, .42);
    const GV = gavel(Wd);
    const ST = T2(Wd, 1.3, 'צודק!', GOLDP, .42);
    const CK = cracks(GB);
    const TG = T2(Wd, 1.5, 'לא להכריע', REDP, .42);
    Wd.on(t => {
      parents(Y, t, false, 1, 1);
      const gu = sm(P(0, 1.8, t));
      const gp = arcV([0, 1.6, .1], [-1.1, 2.9, -1.2], gu, .8);
      GV.g.position.set(gp[0], gp[1], gp[2]); GV.g.rotation.z = .3 * Math.sin(t * 2);
      const fall = sm(P(2.0, 2.8, t)), bounce = .2 * Math.sin(PI * P(2.8, 3.6, t));
      ST.set([-.55, lerp(3.5, 3.2, fall) + bounce, -1.0], popE(P(2.0, 2.3, t)), 0, 1);
      const hit = P(2.8, 3.4, t);
      CK(1);
      GB.set([GOLD_AB[0] + .05 * Math.sin(t * 40) * (1 - hit), GOLD_AB[1], GOLD_AB[2]], 1, 0, 1);
      Y.shockG.set(GOLD_AB, hit, 1.2);
      Y.cross.set([-1.1, 3.0, -1.0], popE(P(2.9, 3.6, t)) * .9, 0);
      GU.set([IMA[0], 2.05, IMA[2]], popE(P(1, 1.6, t)), 0, 1);
      GG.set(GUEST_B, popE(P(.5, 1.2, t)), 0, 1);
      TG.set([0, TAG_Y, .6], popE(P(3.4, 4.2, t)), 0, 1);
      F(S.f, t, { smile: -.6, look: [0, .3], talk: .6 * talkAmt(t, 91) });
      F(Y.fA, t, { smile: -.3, look: [0, .2], surprise: hit, talk: t < 2 ? .6 * talkAmt(t, 92) : 0 });
      F(Y.fI, t, { smile: .3, look: [0, .2], talk: t > 1 ? .5 * talkAmt(t, 93) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(punch(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 46, fov1: 44 }), [2.8]), 31),
      HH(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.6, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 32),
      HH(insert([-1.1, 3.0, -1.5], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 2.8, h1: 2.9, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 33),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, bad): the armchair "אבא" rolls out through the door, the door closes; the stool, alone, grows the grey bubble "זה לא נכון" toward the dotted outline of the empty spot; red cross; tag "גם שלא בפניו"
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd);
    const GR = T2(Wd, 1.9, 'זה לא נכון', GREYP, .5);
    const DT = OUT.map(([x, y]) => { const d = ball(.07, 0xffffff); d.visible = false; d.position.set(x, y, -1.6); Wd.add(d); return d; });
    const TG = T2(Wd, 1.9, 'גם שלא בפניו', REDP, .42);
    Wd.on(t => {
      setDoor(Y, sm(P(0, .9, t)) - sm(P(3.4, 4.4, t)));
      const uA = 1 - sm(P(1.0, 3.2, t));
      parents(Y, t, false, uA, 1);
      const out = uA > .02;
      Y.abaG.visible = out; Y.cA.visible = out;                          // the armchair is gone once it is through the door
      const gu = sm(P(4.6, 6.4, t));
      GR.set(lerpV([.1, 1.9, .3], [-1.1, 1.6, -1.2], gu), popE(P(4.4, 5, t)) * (.6 + .4 * gu), 0, 1);
      DT.forEach((d, i) => { const k = P(4.4 + i * .04, 4.8 + i * .04, t); d.visible = k > 0; d.scale.setScalar(Math.max(.001, popE(k))); });
      Y.cross.set([-1.1, 1.6, -1.1], popE(P(6.0, 6.8, t)) * .9, 0);
      Y.shockR.set([-1.1, 1.6, -1.2], P(6.0, 6.8, t), 1.2);
      TG.set([0, TAG_Y, .6], popE(P(7.2, 8, t)), 0, 1);
      F(S.f, t, { smile: -.6, look: [-.5, .2], talk: t > 4.4 ? .6 * talkAmt(t, 101) : 0 });
      F(Y.fA, t, { smile: -.2, look: [0, .2], talk: t < 3 ? .6 * talkAmt(t, 102) : 0 });
      F(Y.fI, t, { smile: .3, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [-.4, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.2, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 61),
      HH(punch(pushIn([-.4, 1.2, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [2.5]), 62),
      HH(insert([-1.1, 1.6, -1.2], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.5, h1: 1.6, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 63),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, good): the armchair comes back through the door and sits at the little table with the open book; the stool sits on the other side; question tags and light bulbs go back and forth between them, pages turn; green check; tag "לומדים יחד"
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    Y.imaG.visible = false; Y.cI.visible = false;
    const S = makeStool(Wd);
    table(Wd, [0, 0, -.25]);
    const BK = makeBook(Wd, [0, .58, -.25], 1);
    const IC = icons(Wd, 4);
    const TG = T2(Wd, 1.6, 'לומדים יחד', GREENP, .42);
    const AP = [-1.1, 0, -.25], SP = [1.1, 0, -.25];
    const P1 = [-1.1, 1.3, .3], P2 = [1.1, 1.3, .2];
    Wd.on(t => {
      const u = sm(P(.8, 2.8, t));
      const pA = lerpV(DOOR, AP, u), sc = lerp(.15, 1.15, u);
      setDoor(Y, sm(P(0, .6, t)) - sm(P(3.2, 4.0, t)));
      placeG(Y.abaG, pA, 0, 0); Y.abaG.scale.setScalar(sc);
      placeG(Y.cA, [pA[0], 1.95 * sc / 1.15, pA[2]], 0, 0); Y.cA.scale.setScalar(sc);
      Y.abaG.visible = true; Y.cA.visible = true;
      placeG(S.g, SP, -.25, 0);
      BK.piv.rotation.z = PI * .9 * (1 - Math.cos(t * 2.1)) / 2;
      bounceIcons(IC, P1, P2, t, 1.0);
      Y.check.set([0, 1.9, -.25], popE(P(4.2, 5, t)) * .9, .05 * Math.sin(t * 3));
      TG.set([0, TAG_Y, .6], popE(P(.4, 1.2, t)), 0, 1);
      F(S.f, t, { smile: .8, look: [-.5, .3], talk: .5 * talkAmt(t, 111) });
      F(Y.fA, t, { smile: .8, look: [.5, .3], talk: .5 * talkAmt(t, 112) });
    });
    Wd.occ = []; Wd.center = [0, 1.0];
    Wd.cam = C4(dur,
      HH(truck([0, 1.0, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.2, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 71),
      HH(punch(pushIn([0, .9, .2], { dur: dur * .25, dist0: 5.6, dist1: 5.0, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 72),
      HH(insert([0, .7, -.25], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: .7, h1: .8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([0, 1.0, -.4], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.1, h1: 1.3, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, split frame): LEFT the grey bubble "זה לא נכון" crashes into the gold bubble, cracks it, red cross; RIGHT the open book on its table with question tags and bulbs going both ways, green check, the right half glows bigger; tag "בלימוד - מותר"
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    [Y.abaG, Y.imaG, Y.cA, Y.cI].forEach(o => { o.visible = false; });
    const DIV = box(.06, 2.8, .8, CLR_GOLD); DIV.position.set(0, 1.2, -1.3); Wd.add(DIV);
    const GB = T2(Wd, 1.9, 'דברי אבא', GOLDP, .5);
    const GR = T2(Wd, 1.6, 'זה לא נכון', GREYP, .45);
    const CK = cracks(GB);
    table(Wd, [1.1, 0, -.3]);
    const BK = makeBook(Wd, [1.1, .58, -.3], 1);
    const IC = icons(Wd, 4);
    const GLR = cyl(.5, .5, .02, 0xfff1c2); GLR.rotation.x = PI / 2; GLR.position.set(1.1, 1.3, -2.0); Wd.add(GLR);
    const TG = T2(Wd, 1.4, 'בלימוד - מותר', GREENP, .42);
    const LX = -.85;                                                       // the left half's centre
    Wd.on(t => {
      const u = sm(P(0, 1.2, t)), hit = P(1.2, 2.0, t), jit = .05 * Math.sin(t * 40) * (1 - hit);
      GR.set(lerpV([LX, .8, .4], [LX, 1.7, -.1], u), 1, 0, 1);
      GB.set([LX + jit, 2.05, -.4], 1, 0, 1);
      CK(P(1.2, 2.4, t));
      Y.cross.set([LX, 2.05, -.1], popE(P(1.6, 2.4, t)) * .9, 0);
      Y.shockR.set([LX, 2.05, -.2], hit, 1.2);
      BK.piv.rotation.z = PI * .9 * (1 - Math.cos(t * 2.1)) / 2;
      bounceIcons(IC, [.55, 1.5, -.3], [1.65, 1.5, -.3], t, 2.5);
      Y.check.set([1.5, 1.4, -.3], popE(P(4.5, 5.3, t)) * .9, .05 * Math.sin(t * 3));
      GLR.scale.setScalar(1 + .1 * Math.sin(t * 3) + .3 * sm(P(4, 6, t)));
      TG.set([1.1, 2.0, .2], popE(P(.6, 1.4, t)), 0, 1);
      F(Y.fA, t, { smile: .3, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [.3, 1.3];
    Wd.cam = C4(dur,
      HH(punch(truck([-.05, 1.5, -.3], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.4, h1: 1.5, a0: 0, a1: 0, fov0: 46, fov1: 44 }), [1.2]), 81),
      HH(pushIn([-.05, 1.5, -.3], { dur: dur * .25, dist0: 6.0, dist1: 5.6, h0: 1.3, h1: 1.4, a0: 0, a1: 0, fov0: 42, fov1: 40 }), 82),
      HH(insert([1.2, 1.3, -.3], { dur: dur * .25, dist0: 3.6, dist1: 3.4, h0: 1.2, h1: 1.3, a0: 8, a1: -8, fov0: 38, fov1: 36 }), 83),
      HH(orbitShot([-.05, 1.5, -.4], { dur: dur * .25, dist0: 7.0, dist1: 6.6, h0: 1.4, h1: 1.5, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 84));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the armchair "אבא" middle-back with its gold bubble whole and shining; the stool at the bottom side smiling beside the open book; slow crane
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 0);
    const S = makeStool(Wd);
    const GB = T2(Wd, 2.0, 'דברי אבא', GOLDP, .5);
    const GLW = cyl(1.2, 1.2, .02, CLR_GOLD); GLW.rotation.x = PI / 2; GLW.position.set(-1.1, 3.0, -1.6); Wd.add(GLW);
    table(Wd, [-.2, 0, 1.2]);
    const BK = makeBook(Wd, [-.2, .58, 1.2], 1);
    Wd.on(t => {
      parents(Y, t, true, 1, 1);
      GB.set(GOLD_AB, 1 + .06 * Math.sin(t * 3), 0, 1);
      GLW.scale.setScalar(1 + .1 * Math.sin(t * 3));
      BK.piv.rotation.z = 0;
      placeG(S.g, [-1.5, 0, 1.2], 0, 0);
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
