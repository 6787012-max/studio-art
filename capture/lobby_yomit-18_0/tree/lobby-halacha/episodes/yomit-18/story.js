// yomit-18 story: "קימה בפני ההורים" (halacha yomit 18). Storyboard A in storyboards_v19.md.
// Copied from episodes/yomit-17/story.js (living room, armchairs with crowns, tags, camera helpers, faces).
// NO people, NO figures. Parents = the two armchairs with crowns (with faces). Son = a STOOL with a face:
// standing = tall, sitting = low; a HEIGHT METER beside the stool shows it in every beat.
// A door in the back wall; a folding screen hides the parents in beats 4-6 (only footprints and sound rings).
// Everything is a function of local time t.
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
  const DOOR = [0, 0, -2.0];                                            // the parents come in from the door (back wall, centre)
  const ABA = [-1.1, 0, -1.7], IMA = [1.2, 0, -1.7];                    // the two armchairs (parents)
  const ST0 = [0, 0, .1];                                               // the stool (son), on its own small rug
  const METER = [1.0, 0, .1], MH = 1.8;                                 // height meter beside the stool
  const SCR_Z = -.9;                                                    // folding screen depth
  const CLR_GOLD = 0xffd23a, CLR_BLUE = 0x2f5fb8, CLR_ROSE = 0xd9779a, CLR_ROOT = 0x5a3a20, CLR_GREY = 0x7a8090;
  const CLR_FLOOR = 0xb98a5a;
  const BLUEP = ['#dbe9ff', '#14408f', '#2f6ad0'], ROSEP = ['#ffe1ec', '#8a1a4a', '#d9779a'];
  const GOLDP = ['#fff1c2', '#6a3a00', '#d9a63a'], GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'];
  const WHITEP = ['#ffffff', '#2d3a6b', '#9aa7c4'], GREYP = ['#e6e6e6', '#444444', '#8a8a8a'];
  const REDP = ['#ffe3e3', '#8a1a1a', '#d33b3b'];

  // ---------------------------------------------------------------- tags (same helpers as yomit-17)
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
  // a floor arrow (shaft along +x from its origin, cone at the end); rotate it to point up
  function makeArrow(Wd, c, L) {
    const g = new THREE.Group(); Wd.add(g);
    const sh = box(L, .07, .1, c); sh.position.x = L / 2; g.add(sh);
    const hd = cyl(0, .18, .3, c); hd.position.x = L + .12; hd.rotation.z = -PI / 2; g.add(hd);
    return g;
  }
  // the stool (the son): a small wooden block with legs; face on the front
  function makeStool(Wd) {
    const S = { h: 1 }; S.g = new THREE.Group(); S.g.scale.setScalar(1.2); Wd.add(S.g);
    S.body = box(.8, .55, .6, 0x9a6a3a); S.body.position.y = .5; S.g.add(S.body);
    [[-.3, -.2], [.3, -.2], [-.3, .2], [.3, .2]].forEach(([x, z]) => { const l = box(.1, .45, .1, 0x6a4a2a); l.position.set(x, .2, z); S.g.add(l); });
    S.f = face(Wd, { w: .5, parent: S.g, pos: [0, .5, .31], seed: 84 });
    return S;
  }
  // stool height: h=1 standing tall, h=0 sitting low (the whole stool is squashed in height)
  function setH(S, h) { S.h = h; S.g.scale.set(1.2, 1.2 * (.55 + .45 * h), 1.2); }
  // height meter: a white tube with a green fill; fill = stool height
  function makeMeter(Wd, p) {
    const M = {}; M.g = new THREE.Group(); M.g.position.set(p[0], p[1], p[2]); Wd.add(M.g);
    const fr = box(.26, MH + .1, .06, 0xffffff); fr.position.y = MH / 2; M.g.add(fr);
    M.fill = box(.18, MH, .08, 0x6dff9a); M.fill.position.y = MH / 2; M.g.add(M.fill);
    M.set = h => { M.fill.scale.y = Math.max(.001, h); M.fill.position.y = MH * h / 2; };
    M.set(1);
    return M;
  }
  // folding screen: three panels in front of the parents; o = 0 (off to the right) .. 1 (in place)
  function makeScreen(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    [[-1.4, 0xf2a7bd], [0, 0xf7e08a], [1.4, 0x9fd8f0]].forEach(([x, c]) => {
      const p = box(1.4, 2.5, .12, c); p.position.set(x, 1.25, SCR_Z); g.add(p);
      const fr = box(.08, 2.52, .14, CLR_ROOT); fr.position.set(x + .7, 1.26, SCR_Z); g.add(fr);
    });
    return { g, set(o) { g.position.x = (1 - o) * 6; } };
  }
  // a crossed-out eye (the bubble icon for "without seeing")
  function eyeIcon(parent) {
    const g = new THREE.Group(); parent.add(g);
    const w = ball(.14, 0xffffff); w.scale.set(1.8, 1, .3); g.add(w);
    const pu = ball(.05, 0x2d3a6b); pu.position.z = .06; g.add(pu);
    const sl = box(.42, .05, .05, 0xd33b3b); sl.rotation.z = PI / 4; sl.position.z = .08; g.add(sl);
    return g;
  }
  // a footprint with two sound rings around it (hidden until its time)
  function makeFoot(Wd, p, rot) {
    const Fp = {};
    Fp.m = box(.3, .03, .44, 0x6a4a2a); Fp.m.position.set(p[0], .015, p[2]); Fp.m.rotation.y = rot || 0; Fp.m.visible = false; Wd.add(Fp.m);
    Fp.r1 = cyl(.34, .34, .012, CLR_GOLD); Fp.r2 = cyl(.26, .26, .014, CLR_FLOOR);
    [Fp.r1, Fp.r2].forEach(r => { r.position.set(p[0], .008, p[2]); r.visible = false; Wd.add(r); });
    Fp.t0 = 0;
    return Fp;
  }
  // show a footprint at time t0 and let its sound rings spread for .9 s
  function stepFoot(Fp, t, t0) {
    Fp.m.visible = t >= t0; Fp.m.scale.setScalar(Math.max(.001, popE(P(t0, t0 + .3, t))));
    const u = clamp(P(t0, t0 + .9, t), 0, 1), on = t >= t0 && u < 1;
    const s = .6 + 2.2 * u;
    Fp.r1.visible = on; Fp.r2.visible = on; Fp.r1.scale.set(s, 1, s); Fp.r2.scale.set(s * .8, 1, s * .8);
  }

  // ---------------------------------------------------------------- the living room (fresh per beat)
  // the parents' entry state: u=0 inside the door (small), u=1 in place
  function enterState(u, base) {
    return { off: [(DOOR[0] - base[0]) * (1 - u), 0, (DOOR[2] - base[2]) * (1 - u)], sc: lerp(.15, 1, u) };
  }
  // position of a part of a parent: its base + offset + local part position scaled
  const at = (base, st, loc) => [base[0] + st.off[0] + loc[0] * st.sc, loc[1] * st.sc, base[2] + st.off[2] + loc[2] * st.sc];
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
    setDoor(Y, 0);
    return Y;
  }
  function setDoor(Y, o) { Y.dpiv.rotation.y = -1.4 * o; }
  // the two parents: they walk in (uA, uI from 0 to 1); crowns bob; name tags only when in place and showTags is on
  function parents(Y, t, showTags, uA, uI) {
    const a = enterState(uA === undefined ? 1 : uA, ABA), b = enterState(uI === undefined ? 1 : uI, IMA);
    const on = showTags !== false;
    placeG(Y.abaG, [ABA[0] + a.off[0], 0, ABA[2] + a.off[2]], 0, 0); Y.abaG.scale.setScalar(1.15 * a.sc);
    placeG(Y.imaG, [IMA[0] + b.off[0], 0, IMA[2] + b.off[2]], 0, 0); Y.imaG.scale.setScalar(.9 * b.sc);
    const pa = at(ABA, a, [0, 1.95 + .05 * Math.sin(t * 2), 0]), pi = at(IMA, b, [0, 1.6 + .05 * Math.sin(t * 2 + 1.5), 0]);
    placeG(Y.cA, pa, 0, 0); Y.cA.scale.setScalar(a.sc);
    placeG(Y.cI, pi, 0, 0); Y.cI.scale.setScalar(b.sc);
    Y.T.aba.set(at(ABA, a, [0, 2.5, 0]), on && (uA === undefined || uA > .95) ? 1 : 0, 0, 1);
    Y.T.ama.set(at(IMA, b, [0, 2.05, 0]), on && (uI === undefined || uI > .95) ? 1 : 0, 0, 1);
  }
  // sparkles that fly from a to b (one after another)
  function sparks(Y, t, t0, a, b) {
    Y.spark.forEach((s, i) => {
      const u = clamp((t - t0 - i * .12) / 1.2, 0, 1);
      const p = lerpV(a, b, u); p[1] += .25 * Math.sin(PI * u) + .05 * i;
      s.position.set(p[0], p[1], p[2]); s.visible = u > 0 && u < 1;
      s.scale.setScalar(.8 + .4 * Math.sin(t * 12 + i));
    });
  }

  // ---------------------------------------------------------------- HOOK 0-14: extreme close-up on the stool's face; pull out; the armchairs glide out of the door toward the stool; "?" above the stool
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const Q = T2(Wd, .5, '?', WHITEP, .5);
    Wd.on(t => {
      const u = sm(P(0, 9, t));
      parents(Y, t, true, u, u);
      setH(S, 1); M.set(1);
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

  // ---------------------------------------------------------------- BEAT 1 (14, good): the parents walk in through the door (it swings open); the stool sits low, then rises tall, the meter jumps up; a gold arrow "קם" points up; tag "קימה"; sparkles
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const AR = makeArrow(Wd, CLR_GOLD, 1.3); AR.position.set(-.75, .1, .1); AR.rotation.z = PI / 2; AR.scale.setScalar(.001);
    const TK = T2(Wd, 1.2, 'קימה', GOLDP, .46);
    Wd.on(t => {
      const uC = sm(P(.5, 4.5, t));
      setDoor(Y, sm(P(0, 1.5, t)));
      parents(Y, t, true, uC, uC);
      const h = sm(P(5, 7, t));
      setH(S, h); M.set(h);
      placeG(S.g, ST0, .2 * Math.sin(t * 1.4) * (1 - h), 0);
      AR.scale.setScalar(Math.max(.001, popE(P(7, 8, t))));
      TK.set([-.75, 1.9, .1], popE(P(8, 9, t)), 0, 1);
      sparks(Y, t, 7.5, [0, 1.2, .1], [-.75, 1.5, .1]);
      F(S.f, t, { smile: t > 7 ? .8 : -.2, look: [0, .2], talk: t > 6 ? .6 * talkAmt(t, 7) : 0 });
      F(Y.fA, t, { smile: .4, look: [0, .2], talk: t > 1 ? .5 * talkAmt(t, 11) : 0 });
      F(Y.fI, t, { smile: .4, look: [0, .2], talk: t > 1 ? .5 * talkAmt(t, 12) : 0 });
    });
    Wd.occ = []; Wd.center = [-.2, 1.2];
    Wd.cam = C4(dur,
      HH(truck([-.2, 1.2, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.0, h0: 1.2, h1: 1.5, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 11),
      HH(pushIn([0, 1.0, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 12),
      HH(punch(insert([-.75, 1.0, .1], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: 1.0, h1: 1.2, a0: 8, a1: -8, fov0: 36, fov1: 34 }), [1.0]), 13),
      HH(orbitShot([-.2, 1.4, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28, neutral): the stool is already standing tall (meter full); the armchairs come out of the door along a dotted path; the stool looks around puzzled, a "?" over the meter (it cannot rise any more)
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const DOTS = [];
    [ABA, IMA].forEach(B => { for (let k = 1; k <= 5; k++) { const d = ball(.06, 0xffffff); Wd.add(d); DOTS.push({ d, f: k / 6, B }); } });
    const Q = T2(Wd, .5, '?', WHITEP, .5);
    Wd.on(t => {
      const uC = lerp(0, 1, sm(P(0, 8, t)));
      parents(Y, t, false, uC, uC);
      setH(S, 1); M.set(1);
      placeG(S.g, ST0, .35 * Math.sin(t * 1.2), 0);
      DOTS.forEach((o, k) => {
        const p = lerpV(DOOR, o.B, o.f);
        o.d.position.set(p[0], .05, p[2]);
        o.d.scale.setScalar(.7 + .4 * Math.sin(t * 5 + k));
      });
      Q.set([METER[0], 2.1, METER[2]], popE(P(3, 4, t)), 0, 1);
      F(Y.fA, t, { smile: .3, look: [0, .2] }); F(Y.fI, t, { smile: .3, look: [0, .2] });
      F(S.f, t, { smile: -.1, look: [.5, .2], talk: t > 2 ? .5 * talkAmt(t, 21) : 0 });
    });
    Wd.occ = []; Wd.center = [-.2, 1.0];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, .2], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 21),
      HH(punch(pushIn([-.6, 1.0, .2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 22),
      HH(insert([METER[0], 1.2, METER[2]], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.1, h1: 1.3, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(crane([0, 2.0, -1.0], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: .9, h1: 1.6, a0: 4, a1: -4, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, good): the stool lowers itself (tag "מתיישב"), waits, then rises tall with a big gold arrow up (tag "קם", meter jumps); green check; sparkles toward the armchairs
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const AR = makeArrow(Wd, CLR_GOLD, 1.5); AR.position.set(-.75, .1, .1); AR.rotation.z = PI / 2; AR.scale.setScalar(.001);
    const TM = T2(Wd, 1.3, 'מתיישב', BLUEP, .46), TK = T2(Wd, 1.0, 'קם', GOLDP, .46);
    Wd.on(t => {
      parents(Y, t, true);
      const dn = sm(P(.8, 3, t)), up = sm(P(5.5, 7, t));
      const h = clamp(1 - dn + up, 0, 1);
      setH(S, h); M.set(h);
      placeG(S.g, ST0, 0, 0);
      TM.set([0, 1.45, .1], popE(P(3, 3.8, t)) * (t < 5.5 ? 1 : 0), 0, 1);
      AR.scale.setScalar(Math.max(.001, popE(P(6.8, 7.8, t))));
      TK.set([0, 1.45, .1], popE(P(7.2, 8, t)), 0, 1);
      Y.check.set([.45, 1.25, .5], popE(P(9, 10, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([.45, 1.25, .5], P(9, 9.8, t), 1.2);
      sparks(Y, t, 9.5, [0, 1.0, .1], [-1.1, 1.6, -1.5]);
      F(S.f, t, { smile: t < 3 ? .6 : (t < 5.5 ? -.2 : .7), look: [0, .2], talk: (t < 3 || (t > 7 && t < 9)) ? .5 * talkAmt(t, 33) : 0 });
      F(Y.fA, t, { smile: .6, look: [0, .2] });
      F(Y.fI, t, { smile: .6, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [-.2, 1.2];
    Wd.cam = C4(dur,
      HH(truck([-.2, .5, -.4], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.0, h1: 1.1, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 31),
      HH(pushIn([-.2, .5, .2], { dur: dur * .25, dist0: 6.2, dist1: 5.8, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 32),
      HH(punch(insert([-.75, .8, .1], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: .9, h1: 1.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), [.9]), 33),
      HH(orbitShot([-.2, .6, -.6], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.0, h1: 1.1, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56): the folding screen slides in and hides the parents; only footprints appear one after another on the floor with sound rings "טק טק"; the stool (standing) turns toward the sound, its ear rings pulse; tag "רק שומע"
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 0);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const SCR = makeScreen(Wd);
    const FP = [0, 1, 2, 3, 4, 5].map(i => {
      const x = lerp(-1.8, 1.8, i / 5), z = -.55 + (i % 2 ? .08 : -.08);
      return makeFoot(Wd, [x, 0, z]);
    });
    const EL = cyl(.16, .16, .03, CLR_GOLD), ER = cyl(.16, .16, .03, CLR_GOLD);
    EL.rotation.z = PI / 2; ER.rotation.z = PI / 2; EL.position.set(-.5, .5, .05); ER.position.set(.5, .5, .05);
    S.g.add(EL); S.g.add(ER);
    const TK = T2(Wd, 1.3, 'רק שומע', WHITEP, .46);
    Wd.on(t => {
      parents(Y, t, false, 1, 1);
      SCR.set(sm(P(.5, 2, t)));
      setH(S, 1); M.set(1);
      const turn = sm(P(2, 4, t));
      placeG(S.g, ST0, .7 * turn, 0);
      const ear = t > 2.5 ? 1 + .25 * Math.sin(t * 9) : .001;
      EL.scale.setScalar(Math.max(.001, ear)); ER.scale.setScalar(Math.max(.001, ear));
      FP.forEach((Fp, i) => stepFoot(Fp, t, 3 + i));
      TK.set([0, 1.8, .1], popE(P(1.8, 2.6, t)), 0, 1);
      F(S.f, t, { smile: 0, look: [.6, .1], talk: t > 2 ? .4 * talkAmt(t, 41) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.1];
    Wd.cam = C4(dur,
      HH(truck([0, .6, -.2], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.0, h1: 1.1, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 61),
      HH(punch(pushIn([0, .5, .1], { dur: dur * .25, dist0: 5.6, dist1: 5.0, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 62),
      HH(crane([0, .1, -.4], { dur: dur * .25, dist0: 6.5, dist1: 6.0, h0: 3.0, h1: 2.8, a0: -4, a1: 4, fov0: 46, fov1: 46 }), 63),
      HH(orbitShot([0, .5, .1], { dur: dur * .25, dist0: 5.5, dist1: 5.2, h0: .9, h1: 1.0, a0: -14, a1: 10, fov0: 42, fov1: 42 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, good): the footprints walk from the front to the screen and vanish behind it; a glow on the screen edge; the stool, sitting low, rises tall at once (meter jumps); green check; tag "חייב לקום"
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 0);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const SCR = makeScreen(Wd); SCR.set(1);
    const FP = [0, 1, 2, 3, 4, 5, 6].map(i => makeFoot(Wd, [1.25 + (i % 2 ? .09 : -.09), 0, .75 - i * .36]));
    const GL = box(.6, .06, .16, CLR_GOLD); GL.position.set(1.25, 2.53, SCR_Z); Wd.add(GL);
    const TK = T2(Wd, 1.4, 'חייב לקום', GREENP, .46);
    Wd.on(t => {
      parents(Y, t, false, 0, 0);
      const h = sm(P(2, 2.6, t));
      setH(S, h); M.set(h);
      placeG(S.g, ST0, 0, 0);
      GL.scale.set(.8 + .4 * Math.sin(t * 5), 1, 1); GL.visible = t > 2;
      FP.forEach((Fp, i) => stepFoot(Fp, t, .6 + .8 * i));
      Y.check.set([.45, 1.25, .5], popE(P(6, 7, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([.45, 1.25, .5], P(6, 6.8, t), 1.2);
      TK.set([0, 1.8, .1], popE(P(6.6, 7.4, t)), 0, 1);
      F(S.f, t, { smile: t > 3 ? .6 : -.2, look: [0, .2], surprise: t > 1 && t < 2.5 ? 1 : 0, talk: .5 * talkAmt(t, 52) });
    });
    Wd.occ = []; Wd.center = [.5, 1.2];
    Wd.cam = C4(dur,
      HH(truck([.4, .6, -.4], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.1, h1: 1.2, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 71),
      HH(punch(pushIn([0, .5, -.2], { dur: dur * .25, dist0: 6.4, dist1: 5.8, h0: 1.0, h1: 1.1, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 72),
      HH(crane([1.25, .1, -.2], { dur: dur * .25, dist0: 6.5, dist1: 6.0, h0: 3.0, h1: 2.8, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 73),
      HH(orbitShot([0, .6, -.6], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.0, h1: 1.1, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, bad then good): the stool stays low with a bubble holding a crossed-out eye - red cross + shock; then it rises tall - green check; tag "גם בלי לראות"
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 0);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const SCR = makeScreen(Wd); SCR.set(1);
    const BUB = new THREE.Group(); BUB.position.set(0, 1.3, .45); Wd.add(BUB); BUB.scale.setScalar(.001);
    BUB.add(box(.8, .56, .04, 0xffffff));
    const EYE = eyeIcon(BUB); EYE.position.z = .05;
    const TK = T2(Wd, 1.9, 'גם בלי לראות', WHITEP, .46);
    Wd.on(t => {
      parents(Y, t, false, 0, 0);
      const h = sm(P(5.5, 6.8, t));
      setH(S, h); M.set(h);
      placeG(S.g, ST0, 0, 0);
      const bp = popE(P(.5, 1.2, t));
      BUB.scale.setScalar(Math.max(.001, bp));
      BUB.position.y = 1.3 + .04 * Math.sin(t * 3);
      Y.cross.set([0, 1.3, .6], popE(P(3, 3.6, t)) * .9, 0);
      Y.shockR.set([0, 1.3, .6], P(3, 3.6, t), 1.2);
      Y.check.set([.45, 1.25, .5], popE(P(8, 9, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([.45, 1.25, .5], P(8, 8.8, t), 1.2);
      TK.set([0, 1.8, .1], popE(P(1, 1.8, t)), 0, 1);
      F(S.f, t, { smile: t < 6 ? -.6 : .6, look: [0, .2], surprise: t > 2.8 && t < 4.2 ? 1 : 0, talk: .5 * talkAmt(t, 62) });
    });
    Wd.occ = []; Wd.center = [0, 1.1];
    Wd.cam = C4(dur,
      HH(truck([0, .6, -.4], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.1, h1: 1.2, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 81),
      HH(punch(pushIn([0, .5, .3], { dur: dur * .25, dist0: 6.0, dist1: 5.4, h0: 1.0, h1: 1.1, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 82),
      HH(insert([0, .9, .6], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.0, h1: 1.1, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 83),
      HH(orbitShot([0, .6, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.0, h1: 1.1, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 84));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): warm light; the armchairs middle-back with crowns; the door on the back wall; the stool at the bottom standing tall and smiling; the height meter full; two icons on the back wall: (1) a low-to-high arrow, (2) footprints with an up arrow
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, [1.0, 0, 1.4]);
    const ICX = [-1.2, 1.2];
    const ic1 = makeArrow(Wd, CLR_GOLD, .6); ic1.rotation.z = PI / 2;
    const ic2 = new THREE.Group(); Wd.add(ic2);
    [-.2, 0, .2].forEach((x, i) => { const b = box(.14, .02, .24, 0x6a4a2a); b.position.set(x, .01, i % 2 ? .05 : -.05); ic2.add(b); });
    const ua = makeArrow(Wd, CLR_GOLD, .4); ua.position.set(.4, 0, 0); ua.rotation.z = PI / 2; ic2.add(ua);
    const icons = [ic1, ic2];
    Wd.on(t => {
      parents(Y, t, true);
      icons.forEach((ic, i) => {
        const pop = popE(P(.5 + .8 * i, 1.5 + .8 * i, t));
        ic.position.set(ICX[i], 3.3 + .05 * Math.sin(t * 2 + i), -2.2);
        ic.scale.setScalar(Math.max(.001, pop));
      });
      setH(S, 1); M.set(1);
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
