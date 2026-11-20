// yomit-19 story: "קימה כשההורים מוחלים" (halacha yomit 19). Storyboard A in storyboards_v20.md.
// Copied from episodes/yomit-18/story.js (living room, armchairs with crowns, stool with a face, height meter, tags, camera helpers).
// NO people, NO figures. Parents = armchairs with crowns; son = a STOOL with a face; a gold scroll "מחילה" is held by the armchairs; a mitzva star and a jar of stars count the rises.
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
  // ================================================================ yomit-19 helpers: scroll, star, jar, small stools, dots, flyers
  const drawScroll = (text, bg, fg) => (c, W2, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W2 * .03, H * .08, W2 * .94, H * .84, H * .14); c.fill();
    c.lineWidth = H * .05; c.strokeStyle = '#8a6a3a'; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W2 * .84, maxLines: 1, max: H * .5, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W2 / 2, H * .5);
  };
  // a scroll: a paper with a word on it and two rods (scale.y unrolls it)
  function makeScroll(Wd, text, bg, fg) {
    const g = new THREE.Group(); Wd.add(g);
    g.add(texPlane(1.0, .6, drawScroll(text, bg, fg), { cw: 512 }));
    [.3, -.3].forEach(y => { const r = cyl(.045, .045, 1.1, 0x8a6a3a); r.rotation.z = PI / 2; r.position.set(0, y, .03); g.add(r); });
    return g;
  }
  // a mitzva star: a grey star (not yet) and a gold star (lit); set(lit 0/1, scale)
  function makeStar(Wd, p, s) {
    const St = { g: new THREE.Group(), gold: new THREE.Group(), grey: new THREE.Group() };
    St.g.position.set(p[0], p[1], p[2]); St.g.scale.setScalar(s || 1); Wd.add(St.g);
    St.g.add(St.gold); St.g.add(St.grey);
    [[St.gold, CLR_GOLD], [St.grey, 0x8a8a96]].forEach(([grp, c]) => {
      grp.add(ball(.14, c));
      for (let i = 0; i < 5; i++) {
        const a = i * 2 * PI / 5 + PI / 2;
        const sp = cyl(0, .1, .22, c); sp.position.set(Math.cos(a) * .24, Math.sin(a) * .24, 0); sp.rotation.z = a - PI / 2; grp.add(sp);
      }
    });
    St.set = (lit, sc) => { St.gold.visible = lit > .5; St.grey.visible = lit <= .5; St.g.scale.setScalar(Math.max(.001, sc === undefined ? 1 : sc)); };
    St.set(0, 1);
    return St;
  }
  // a jar of mitzva stars: three stars sit inside it; set(k, scale) shows star k
  function makeJar(Wd, p) {
    const J = { g: new THREE.Group(), stars: [] }; J.g.position.set(p[0], p[1], p[2]); Wd.add(J.g);
    const glass = cyl(.34, .3, .8, 0xbfe6ff); glass.position.y = .4; J.g.add(glass);
    const lid = cyl(.36, .36, .08, CLR_ROOT); lid.position.y = .84; J.g.add(lid);
    for (let k = 0; k < 3; k++) { const s = ball(.12, CLR_GOLD); s.position.set((k - 1) * .14, .25, 0); s.scale.setScalar(.001); J.g.add(s); J.stars.push(s); }
    J.set = (k, s) => J.stars[k].scale.setScalar(Math.max(.001, s));
    return J;
  }
  // three flying stars (hidden until they fly)
  function makeFlyers(Wd, n) {
    return Array.from({ length: n }, () => { const f = ball(.12, CLR_GOLD); f.visible = false; Wd.add(f); return f; });
  }
  // small props stools (no faces) with a low meter each
  function smallStools(Wd, xs) {
    return xs.map(x => {
      const g = new THREE.Group(); g.position.set(x, 0, ST0[2]); Wd.add(g);
      const b = box(.56, .34, .5, 0x9a6a3a); b.position.y = .17; g.add(b);
      const fr = box(.12, .6, .04, 0xffffff); fr.position.set(.42, .3, .1); g.add(fr);
      const fl = box(.08, .6, .06, 0x6dff9a); fl.position.set(.42, .3, .12); g.add(fl);
      return { g, fl };
    });
  }
  // the armchairs at given x (they slide in or stay); crowns and name tags follow them
  function placeChairs(Y, xa, xi) {
    placeG(Y.abaG, [xa, 0, ABA[2]], 0, 0); Y.abaG.scale.setScalar(1.15);
    placeG(Y.imaG, [xi, 0, IMA[2]], 0, 0); Y.imaG.scale.setScalar(.9);
    placeG(Y.cA, [xa, 1.95, ABA[2]], 0, 0); Y.cA.scale.setScalar(1);
    placeG(Y.cI, [xi, 1.6, IMA[2]], 0, 0); Y.cI.scale.setScalar(1);
    Y.T.aba.set([xa, 2.5, ABA[2]], 0, 0, 1); Y.T.ama.set([xi, 2.05, IMA[2]], 0, 0, 1);
  }
  // dots on a path a -> b that pop one after another from time t0
  function makeDots(Wd, n) {
    return Array.from({ length: n }, () => { const d = ball(.06, 0xffffff); d.visible = false; Wd.add(d); return d; });
  }
  function setDots(D, a, b, t, t0) {
    D.forEach((d, k) => {
      const u = clamp((t - t0 - k * .15) / .5, 0, 1);
      const p = lerpV(a, b, (k + 1) / (D.length + 1));
      d.visible = u > 0; d.position.set(p[0], p[1], p[2]); d.scale.setScalar(Math.max(.001, popE(u)));
    });
  }

  // ---------------------------------------------------------------- HOOK 0-14: extreme close-up on the stool's face, pull out; the armchairs come out of the door; the stool hesitates between low and high; "?" above; at the end the armchairs hold up the scroll "מחלנו"
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const Scr = makeScroll(Wd, 'מחלנו', '#fff6dc', '#5a3a10');
    const Q = T2(Wd, .5, '?', WHITEP, .5);
    Wd.on(t => {
      const u = sm(P(0, 9, t));
      parents(Y, t, true, u, u);
      const hs = .55 + .4 * Math.sin(t * 1.3);
      setH(S, hs); M.set(hs);
      placeG(S.g, [ST0[0], ST0[1] + .03 * Math.sin(t * 3), ST0[2]], .25 * Math.sin(t * 1.6), 0);
      Scr.position.set(0, 1.5, -1.35); Scr.scale.setScalar(Math.max(.001, popE(P(8, 9.4, t))));
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

  // ---------------------------------------------------------------- BEAT 1 (14, neutral): a row of small stools stays LOW (grey meters, no cross); the armchairs slide in behind them; sign "רבים אינם קמים"
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const S = makeStool(Wd); S.g.visible = false; const M = makeMeter(Wd, METER); M.g.visible = false;
    const SM = smallStools(Wd, [-2.3, -1.1, .1, 1.3]);
    const TK = T2(Wd, 2.9, 'רבים אינם קמים', GREYP, .46);
    Wd.on(t => {
      const u = sm(P(0, 4, t));
      placeChairs(Y, lerp(-4.2, ABA[0], u), lerp(4.2, IMA[0], u));
      SM.forEach((s, i) => { s.g.position.y = .03 * Math.sin(t * 2 + i); s.fl.scale.y = .2; s.fl.position.y = .06; });
      TK.set([0, 1.35, .1], popE(P(1, 2, t)), 0, 1);
      F(Y.fA, t, { smile: 0, look: [.3, .2], talk: t > 4 ? .5 * talkAmt(t, 11) : 0 });
      F(Y.fI, t, { smile: 0, look: [.3, .2], talk: t > 4 ? .5 * talkAmt(t, 12) : 0 });
    });
    Wd.occ = []; Wd.center = [0, 1.0];
    Wd.cam = C4(dur,
      HH(truck([0, 1.0, -.4], { dur: dur * .25, dist0: 9.0, dist1: 8.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 11),
      HH(pushIn([-.4, .6, .2], { dur: dur * .25, dist0: 6.0, dist1: 5.4, h0: .8, h1: .9, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 12),
      HH(punch(insert([1.72, .4, .1], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: .6, h1: .7, a0: 8, a1: -8, fov0: 36, fov1: 34 }), [1.0]), 13),
      HH(orbitShot([0, .8, -.4], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.0, h1: 1.2, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28, neutral): the armchairs hold the scroll "מחילה" open with a gold glow; each crown lowers gently (they give up the honour); tag "מוחלים על כבודם"
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const Scr = makeScroll(Wd, 'מחילה', '#fff6dc', '#5a3a10');
    const GLW = cyl(.95, .95, .02, CLR_GOLD); GLW.rotation.x = PI / 2; GLW.position.set(0, 1.5, -1.5); Wd.add(GLW);
    const TK = T2(Wd, 2.4, 'מוחלים על כבודם', BLUEP, .46);
    Wd.on(t => {
      parents(Y, t, false, 1, 1);
      const down = sm(P(3, 6, t));
      Y.cA.position.y = 1.95 - .4 * down; Y.cI.position.y = 1.6 - .4 * down;
      Scr.position.set(0, 1.5, -1.35); Scr.scale.set(1, lerp(.35, 1, sm(P(0, 2.5, t))), 1);
      GLW.scale.setScalar(1 + .12 * Math.sin(t * 4));
      TK.set([0, 2.25, -1.2], popE(P(1, 1.8, t)), 0, 1);
      setH(S, 1); M.set(1);
      placeG(S.g, ST0, .3 * Math.sin(t * 1.2), 0);
      F(Y.fA, t, { smile: .3, look: [0, .2], talk: .5 * talkAmt(t, 21) });
      F(Y.fI, t, { smile: .3, look: [0, .2], talk: .5 * talkAmt(t, 22) });
      F(S.f, t, { smile: 0, look: [0, .5], talk: .3 * talkAmt(t, 23) });
    });
    Wd.occ = []; Wd.center = [0, 1.0];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, .2], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 21),
      HH(punch(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 5.0, dist1: 4.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 22),
      HH(insert([0, 1.5, -1.3], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.4, h1: 1.5, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(crane([0, 2.0, -1.0], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: .9, h1: 1.6, a0: 4, a1: -4, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, neutral then good): a stamp "כבודו מחול" falls onto the scroll; dots lead from the scroll to the stool; the stool relaxes and lowers a little; tag "כבודו מחול"
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const Scr = makeScroll(Wd, 'מחילה', '#fff6dc', '#5a3a10');
    const SG = box(.5, .3, .07, 0x8a1a1a); SG.visible = false; Wd.add(SG);
    const DOTS = makeDots(Wd, 5);
    const TK = T2(Wd, 2.3, 'כבודו מחול', GOLDP, .46);
    Wd.on(t => {
      parents(Y, t, false, 1, 1);
      Scr.position.set(0, 1.5, -1.35); Scr.scale.set(1, 1, 1);
      SG.visible = t > .5;
      SG.position.set(0, lerp(2.7, 1.5, sm(P(.6, 1.4, t))), -1.2);
      Y.shockG.set([0, 1.5, -1.2], P(1.4, 2.2, t), 1.2);
      TK.set([0, 2.3, -1.2], popE(P(1.8, 2.6, t)), 0, 1);
      setDots(DOTS, [0, 1.25, -1.1], [0, 1.0, .1], t, 2.6);
      const h = 1 - .5 * sm(P(2.6, 4.2, t));
      setH(S, h); M.set(h);
      placeG(S.g, ST0, 0, 0);
      F(S.f, t, { smile: t > 2.6 ? .4 : -.1, look: [0, .3], talk: t > 1 ? .5 * talkAmt(t, 33) : 0 });
      F(Y.fA, t, { smile: .4, look: [0, .3] }); F(Y.fI, t, { smile: .4, look: [0, .3] });
    });
    Wd.occ = []; Wd.center = [0, 1.1];
    Wd.cam = C4(dur,
      HH(truck([0, .9, -.4], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 31),
      HH(pushIn([0, 1.0, .2], { dur: dur * .25, dist0: 6.2, dist1: 5.8, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 32),
      HH(punch(insert([0, 1.5, -1.2], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: 1.4, h1: 1.5, a0: 8, a1: -8, fov0: 36, fov1: 34 }), [.9]), 33),
      HH(orbitShot([0, .9, -.6], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.0, h1: 1.2, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, good): the stool rises tall anyway (meter jumps, gold arrow "קם"); the mitzva star lights up gold with a ring and a green check; sparkles fly to the armchairs; tag "מקיים מצוה"
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const Scr = makeScroll(Wd, 'מחילה', '#fff6dc', '#5a3a10');
    const AR = makeArrow(Wd, CLR_GOLD, 1.3); AR.position.set(-.75, .1, .1); AR.rotation.z = PI / 2; AR.scale.setScalar(.001);
    const ST = makeStar(Wd, [0, 2.05, -.9], 1);
    const TK = T2(Wd, 1.6, 'מקיים מצוה', GREENP, .42);
    Wd.on(t => {
      parents(Y, t, false, 1, 1);
      Scr.position.set(0, 1.5, -1.35); Scr.scale.set(1, 1, 1);
      const h = .5 + .5 * sm(P(1.2, 2.6, t));
      setH(S, h); M.set(h);
      placeG(S.g, ST0, 0, 0);
      AR.scale.setScalar(Math.max(.001, popE(P(2.8, 3.6, t))));
      const lit = t > 4.4 ? 1 : 0;
      ST.set(lit, lit ? 1 + .12 * Math.sin(t * 6) : 1);
      Y.shockG.set([0, 2.05, -.9], P(4.4, 5.2, t), 1.2);
      Y.check.set([-.7, 2.05, -.7], popE(P(5.2, 6, t)) * .9, .05 * Math.sin(t * 3));
      sparks(Y, t, 4.8, [0, 2.05, -.9], [-1.1, 2.0, -1.7]);
      TK.set([1.5, 2.25, -.9], popE(P(5, 5.8, t)), 0, 1);
      F(S.f, t, { smile: t > 4 ? 1 : .2, look: [0, .3], talk: .5 * talkAmt(t, 41) });
      F(Y.fA, t, { smile: 1, look: [0, .2] }); F(Y.fI, t, { smile: 1, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [0, 1.3];
    Wd.cam = C4(dur,
      HH(truck([0, 1.6, -.4], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 51),
      HH(punch(pushIn([0, 1.4, .2], { dur: dur * .25, dist0: 5.8, dist1: 5.2, h0: 1.0, h1: 1.1, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 52),
      HH(insert([0, 2.05, -.9], { dur: dur * .25, dist0: 4.0, dist1: 3.8, h0: 2.1, h1: 2.3, a0: 6, a1: -6, fov0: 36, fov1: 34 }), 53),
      HH(orbitShot([0, 1.5, -.4], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 54));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, good): a counter. Three times the stool rises; each time one star flies into the jar "מצוות" and stays there; the stars pile up; the armchairs smile; tag "בכל פעם"
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, METER);
    const JAR = makeJar(Wd, [1.7, 0, -.3]);
    const FL = makeFlyers(Wd, 3);
    const TK = T2(Wd, 2.0, 'בכל פעם', GOLDP, .46);
    const TJ = T2(Wd, 1.1, 'מצוות', GOLDP, .42);
    const STS = [.5, 3.3, 6.1];
    const A = [0, 1.25, .2], B = [1.7, 1.0, -.3];
    Wd.on(t => {
      parents(Y, t, false, 1, 1);
      let h = .3;
      STS.forEach((t0, k) => {
        h += .7 * (sm(P(t0, t0 + .5, t)) - (k < 2 ? sm(P(t0 + 1.4, t0 + 1.9, t)) : 0));
        const fu = clamp((t - t0 - .6) / .9, 0, 1);
        FL[k].visible = t > t0 + .6 && fu < 1;
        const p = arcV(A, B, fu, .9); FL[k].position.set(p[0], p[1], p[2]);
        JAR.set(k, popE(P(t0 + 1.4, t0 + 1.8, t)));
      });
      setH(S, h); M.set(h);
      placeG(S.g, ST0, 0, 0);
      TK.set([0, 2.4, .1], popE(P(.2, .9, t)), 0, 1);
      TJ.set([1.7, 1.55, -.3], popE(P(.4, 1.1, t)), 0, 1);
      F(Y.fA, t, { smile: .9, look: [0, .2], talk: .4 * talkAmt(t, 51) });
      F(Y.fI, t, { smile: .9, look: [0, .2], talk: .4 * talkAmt(t, 52) });
      F(S.f, t, { smile: h > .6 ? .8 : .1, look: [.4, .2], talk: .5 * talkAmt(t, 53) });
    });
    Wd.occ = []; Wd.center = [.6, 1.1];
    Wd.cam = C4(dur,
      HH(truck([.5, 1.0, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.2, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 71),
      HH(punch(pushIn([0, .9, .2], { dur: dur * .25, dist0: 5.6, dist1: 5.0, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 72),
      HH(insert([1.7, .6, -.3], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: .7, h1: .8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([.4, 1.0, -.4], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.1, h1: 1.3, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, split frame): LEFT the stool low with the grey scroll "מחלו" (no cross, grey); RIGHT the stool standing tall with a shining star and a green check; a glow behind the right side; tag "גם כשמחלו"
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    [Y.abaG, Y.imaG, Y.cA, Y.cI, Y.T.aba.g, Y.T.ama.g].forEach(o => { o.visible = false; });
    const DIV = box(.06, 1.8, .8, CLR_GOLD); DIV.position.set(0, .9, -1.3); Wd.add(DIV);
    const SL = makeStool(Wd), SR = makeStool(Wd);
    setH(SL, .3); setH(SR, 1);
    const SCL = makeScroll(Wd, 'מחלו', '#e6e6e6', '#444444');
    const STR = makeStar(Wd, [1.1, 2.2, -.3], 1);
    const GLR = cyl(1.0, 1.0, .02, 0xfff1c2); GLR.rotation.x = PI / 2; GLR.position.set(1.1, 1.3, -1.0); Wd.add(GLR);
    const TK = T2(Wd, 2.6, 'גם כשמחלו', GOLDP, .46);
    Wd.on(t => {
      placeG(SL.g, [-1.1, 0, .1], .15 * Math.sin(t * 1.1), 0);
      placeG(SR.g, [1.1, .03 * Math.sin(t * 3), .1], 0, 0);
      SCL.position.set(-1.1, 1.5, -.6); SCL.scale.setScalar(.8);
      STR.set(1, 1 + .12 * Math.sin(t * 5));
      GLR.scale.setScalar(1 + .15 * Math.sin(t * 3));
      Y.shockG.set([1.1, 2.2, -.3], P(3, 3.8, t), 1.2);
      Y.check.set([1.1, 1.3, .65], popE(P(3, 4, t)) * .9, .05 * Math.sin(t * 3));
      TK.set([0, 2.3, .1], popE(P(.5, 1.2, t)), 0, 1);
      F(SL.f, t, { smile: -.2, look: [.4, .3], talk: .4 * talkAmt(t, 61) });
      F(SR.f, t, { smile: 1, look: [0, .3], talk: .5 * talkAmt(t, 62) });
    });
    Wd.occ = []; Wd.center = [0, 1.1];
    Wd.cam = C4(dur,
      HH(truck([0, .3, -.2], { dur: dur * .25, dist0: 9.4, dist1: 9.0, h0: 1.4, h1: 1.5, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 81),
      HH(punch(pushIn([0, .3, .2], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 82),
      HH(insert([1.1, 1.6, -.3], { dur: dur * .25, dist0: 6.4, dist1: 6.0, h0: 1.4, h1: 1.5, a0: 8, a1: -8, fov0: 40, fov1: 38 }), 83),
      HH(orbitShot([0, .4, -.4], { dur: dur * .25, dist0: 8.6, dist1: 8.2, h0: 1.4, h1: 1.5, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 84));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the armchairs middle-back with crowns and the scroll "מחילה"; the stool at the front standing tall and smiling; the jar of stars glowing at the side; slow crane
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd); setDoor(Y, 1);
    const S = makeStool(Wd); const M = makeMeter(Wd, [1.0, 0, 1.4]);
    const Scr = makeScroll(Wd, 'מחילה', '#fff6dc', '#5a3a10');
    const JAR = makeJar(Wd, [1.7, 0, 1.0]);
    Wd.on(t => {
      parents(Y, t, true);
      Scr.position.set(0, 1.5, -1.35); Scr.scale.set(1, 1, 1);
      setH(S, 1); M.set(1);
      placeG(S.g, [0, 0, 1.4], .1 * Math.sin(t * 1.2), 0);
      JAR.set(0, 1); JAR.set(1, 1); JAR.set(2, 1);
      Y.shockG.set([1.7, .95, 1.0], fract(t / 1.6), 1.2);
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
