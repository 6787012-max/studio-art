// yomit-20 story: "קימה באוטובוס" (halacha yomit 20). Storyboard A in storyboards_v21.md.
// COPY FROM episodes/yomit-19/story.js (helpers, faces, tags, camera kept). New set: a city bus, then a night bedroom with a face on the bed.
// NO people: the stool (the son), the armchair with a crown (the father), the bed, the bus seats. Everything is a function of local time t.
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
  // lying in bed (bed origin B0): tilted back, face up toward the camera; blanket covers the legs. cap = night cap cone
  const LIE_RX = -1.0;
  function lieStool(S, CAP, B0) {
    setH(S, 1);
    placeG(S.g, [B0[0] - .75, .415, B0[2] + .05], 0, LIE_RX);
    CAP.position.set(B0[0] - .75, 1.03, B0[2] - .9); CAP.rotation.set(LIE_RX, 0, 0);
  }
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


  // ================================================================ yomit-20 (fix round 2): the bus (B_) and the bedroom. Stool = son, crowned armchair = father, bed with a face.
  const B_SEAT = [[-2.6, -1.0], [-2.6, .3], [2.6, -1.0], [2.6, .3]];   // four bus seats (left and right of the aisle)
  const B_ST = [-2.6, .42, .3];         // the stool's seat (front row, left: nothing in front of it, so its face is seen)
  const B_AISLE = [.5, 0, .4];          // the father stands here in the aisle
  const B_DOORIN = [3.2, 0, -1.7];      // just inside the bus door
  const B_STAND = [-1.1, 0, .9];        // where the son stands in the aisle
  const B_on = (Wd, m, x, y, z) => { m.position.set(x, y, z); Wd.add(m); return m; };
  const B_add = (g, m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
  const B_BED_ST = [-.75, .4, -.7];     // the son in bed (bed origin [0,0,-.7]): lying under the blanket, face above it

  // the street outside the windows: buildings slide past (sp = speed); returns update(t, sp)
  function B_street(Wd) {
    B_on(Wd, box(26, 9, .1, 0xbfe6ff), 0, 3.5, -3.6);
    const HS = [1.4, 2.4, 1.0, 2.8, 1.8, 1.2, 2.5, 1.6, 2.1, 1.1, 2.6, 1.5];
    const bl = HS.map((h, i) => B_on(Wd, box(1.2, h, .2, [0xd9c9a8, 0xa9b8c8, 0xe0b0a0][i % 3]), 0, h / 2, -2.9));
    return (t, sp) => bl.forEach((m, i) => { const u = (i / bl.length + t * sp / 12) % 1; m.position.x = -6.5 + u * 13; });
  }
  // the bus interior: floor, back wall with windows and a door, blue seats, yellow handrails
  function B_bus(Wd) {
    B_on(Wd, box(10, .1, 8, 0x4a4f5a), 0, -.05, -.4);
    B_on(Wd, box(7.0, .5, .2, 0xf3e3c8), -1.2, .25, -2.2); B_on(Wd, box(1.2, .5, .2, 0xf3e3c8), 4.1, .25, -2.2);
    B_on(Wd, box(7.0, .6, .2, 0xf3e3c8), -1.2, 2.5, -2.2); B_on(Wd, box(1.2, .6, .2, 0xf3e3c8), 4.1, 2.5, -2.2);
    [-4.2, -2.8, -1.4, 0, 1.4, 4.3].forEach(x => B_on(Wd, box(.14, 1.7, .2, 0x2f5fb8), x, 1.35, -2.2));
    const leaf = B_on(Wd, box(1.0, 1.7, .08, 0x2f5fb8), 3.0, 1.35, -2.1);   // the door leaf (folds open)
    B_SEAT.forEach(([x, z]) => { B_on(Wd, box(.95, .42, .75, 0x2f5fb8), x, .21, z); B_on(Wd, box(.95, .9, .16, 0x14408f), x, .87, z - .38); });
    [[-1.5, 1.6], [1.5, 1.6]].forEach(([x, z]) => B_on(Wd, cyl(.04, .04, 2.4, 0xffd23a), x, 1.2, z));
    return { leaf, street: B_street(Wd) };
  }
  // four red dots above the seat backs (taken); set with scale
  function B_dots(Wd) {
    return B_SEAT.map(([x, z]) => { const d = B_on(Wd, ball(.1, 0xd33b3b), x, 1.5, z - .38); d.scale.setScalar(.001); return d; });
  }
  // the father: an armchair with a face and a crown; put(pos, yaw, scale, tagScale)
  function B_dad(Wd, label, w) {
    const g = chair(Wd, [0, 0, 0], .75, CLR_BLUE);
    const f = face(Wd, { w: .55, parent: g, pos: [0, .7, .52], seed: 85 });
    const c = makeCrown(Wd, CLR_GOLD);
    const T = T2(Wd, w || .9, label || 'אבא', BLUEP);
    return { g, f, c, T, put(p, ry, s, tg) {
      g.position.set(p[0], p[1], p[2]); g.rotation.set(0, ry || 0, 0); g.scale.setScalar(Math.max(.001, s));
      c.position.set(p[0], p[1] + 1.6 * s, p[2]); c.scale.setScalar(Math.max(.001, s));
      T.set([p[0], p[1] + 2.0, p[2]], tg || 0, 0, 1); } };
  }
  // the bed with a face on its front board (group at p); the blanket covers the pillow end, so the son can lie under it
  function B_bed(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    B_add(g, box(2.2, .35, 1.3, 0x8a5a30), 0, .175, 0);
    B_add(g, box(2.1, .25, 1.2, 0xffffff), 0, .475, 0);
    B_add(g, box(.6, .18, .5, 0xffffff), -.75, .66, -.3);
    B_add(g, box(2.1, .22, 1.22, 0x7aa8ff), .05, .66, 0);
    const f = face(Wd, { w: .6, parent: g, pos: [-.4, .45, .78], seed: 88 });
    return { g, f };
  }
  // the bedroom wall, window with stars and moon, door; returns update(t) for the stars
  function B_bedroom(Wd) {
    B_on(Wd, box(12, 6, .2, 0xf3e3c8), 0, 2.5, -2.4);
    B_on(Wd, box(12, .1, 8, 0xb98a5a), 0, -.05, -.4);
    B_on(Wd, box(3.4, .02, 2.2, 0xd9b38c), 0, .01, .4);
    B_on(Wd, box(1.9, 1.6, .08, 0x8a6a3a), -2.2, 2.0, -2.2);
    B_on(Wd, box(1.6, 1.3, .05, 0x14408f), -2.2, 2.0, -2.15);
    const moon = cyl(.22, .22, .04, 0xfff1c2); moon.rotation.x = PI / 2; B_on(Wd, moon, -2.5, 2.3, -2.12);
    B_on(Wd, box(1.3, 2.3, .08, 0x8a6a3a), 3.2, 1.15, -2.2);
    const st = [[-2.9, 2.8], [-1.6, 2.9], [-2.4, 1.3]].map(([x, y]) => B_on(Wd, ball(.05, 0xffffff), x, y, -2.1));
    return t => st.forEach((s, i) => s.scale.setScalar(.8 + .4 * Math.sin(t * 4 + i * 2)));
  }

  // ---------------------------------------------------------------- HOOK 0-14: extreme close-up on the son's face from the aisle (in front of him); all seats taken (red dots); the bus door folds open, the crowned father rolls in; "?" above
  function B_hook(dur) {
    const Wd = mkWorld({}); const BU = B_bus(Wd); const S = makeStool(Wd); const Dd = B_dad(Wd); const DOTS = B_dots(Wd);
    const Q = T2(Wd, .5, '?', WHITEP, .5);
    Wd.on(t => {
      BU.street(t, .6);
      DOTS.forEach((d, k) => d.scale.setScalar(Math.max(.001, popE(P(.3 + .3 * k, 1.2 + .3 * k, t)))));
      BU.leaf.scale.x = 1 - .9 * sm(P(2, 4, t));
      setH(S, .55 + .4 * Math.sin(t * 1.3));
      placeG(S.g, B_ST, .15 * Math.sin(t * 1.6), 0);
      F(S.f, t, { smile: -.2, look: [0, .1], talk: .6 * talkAmt(t, 7) });
      const u = sm(P(4, 9, t));
      Dd.put(lerpV(B_DOORIN, B_AISLE, u), 0, .75 * Math.max(.001, sm(P(3.5, 4.5, t))), 0);
      F(Dd.f, t, { smile: .3, talk: .3 * talkAmt(t, 9) });
      Q.set([B_ST[0], 1.8, B_ST[2]], popE(P(1, 2, t)), 0, 1);
    });
    Wd.occ = []; Wd.center = [-1.2, -.3]; Wd.qPos = [B_ST[0], B_ST[2]];
    Wd.cam = cuts([
      [6.5, HH(pullOut([B_ST[0], .85, B_ST[2]], { dur: 6.5, dist0: 1.5, dist1: 4.6, h0: .75, h1: 1.2, a0: 0, a1: -3, fov0: 34, fov1: 40, ease: 'out' }), 41)],
      [3.5, HH(truck([-.8, 1.0, -.2], { dur: 3.5, dist0: 7.2, dist1: 6.8, h0: 1.1, h1: 1.2, a0: -6, a1: 6, fov0: 44, fov1: 44 }), 42)],
      [2.0, HH(punch(insert([B_AISLE[0], 1.0, B_AISLE[2]], { dur: 2.0, dist0: 4.0, dist1: 3.6, h0: .9, h1: .9, a0: 8, a1: 2, fov0: 36, fov1: 34 }), [.6]), 43)],
      [dur - 12, HH(orbitShot([-.4, .9, -.4], { dur: dur - 12, dist0: 7.0, dist1: 6.8, h0: 1.0, h1: 1.2, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 44)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, neutral): the bus drives; a STOP sign "תחנה" over the door; the door opens; the father steps in; tag "אבא עלה"; the son notices
  function s1(dur) {
    const Wd = mkWorld({}); const BU = B_bus(Wd); const S = makeStool(Wd); const Dd = B_dad(Wd, 'אבא עלה', 1.4);
    const TST = T2(Wd, 1.1, 'תחנה', REDP, .42);
    Wd.on(t => {
      BU.street(t, .6);
      BU.leaf.scale.x = 1 - .9 * sm(P(0, 2, t));
      TST.set([2.2, 1.9, -1.0], popE(P(0, 1, t)) * (t < 8 ? 1 : 0), 0, 1);
      setH(S, .2); placeG(S.g, B_ST, 0, 0);
      F(S.f, t, { smile: -.1, look: [.6, 0], surprise: t > 5 ? .5 : 0, talk: .4 * talkAmt(t, 8) });
      const u = sm(P(2, 8, t));
      Dd.put(arcV(B_DOORIN, B_AISLE, u, .15), 0, .75 * Math.max(.001, sm(P(1.5, 2.5, t))), popE(P(4.5, 5.5, t)) * .95);
      F(Dd.f, t, { smile: .5, look: [-.6, 0], talk: .3 * talkAmt(t, 9) });
    });
    Wd.occ = []; Wd.center = [.2, .4];
    Wd.cam = C4(dur,
      HH(truck([0, 1.0, -.4], { dur: dur * .25, dist0: 9.0, dist1: 8.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 11),
      HH(pushIn([-.9, .9, -.3], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 12),
      HH(punch(insert([3.0, 1.2, -1.0], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: .9, h1: 1.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), [1.0]), 13),
      HH(orbitShot([.2, .8, -.4], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.0, h1: 1.2, a0: -14, a1: 10, fov0: 46, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28, good): the son stands tall on his seat, facing the father (gold arrow "קם"); green check; tag "לעמוד בפניו" (lowered)
  function s2(dur) {
    const Wd = mkWorld({}); const BU = B_bus(Wd); const S = makeStool(Wd); const Dd = B_dad(Wd);
    const AR = makeArrow(Wd, CLR_GOLD, 1.3); AR.rotation.z = PI / 2;
    const CK = mark3d(Wd, 'check', .9);
    const TK = T2(Wd, 2.0, 'לעמוד בפניו', GREENP, .46);
    Wd.on(t => {
      BU.street(t, .6); BU.leaf.scale.x = .05;
      const h = sm(P(.5, 3, t));
      setH(S, .2 + .8 * h);
      placeG(S.g, B_ST, 1.5 * sm(P(1.0, 2.5, t)), 0);
      AR.position.set(-1.7, .9, .9); AR.scale.setScalar(Math.max(.001, popE(P(2.5, 3.3, t))));
      CK.set([-1.6, 1.6, .9], popE(P(4, 5, t)) * .9, .05 * Math.sin(t * 3));
      TK.set([0, 1.95, -.6], popE(P(1.0, 1.8, t)), 0, 1);
      F(S.f, t, { smile: .6 * h, look: [.5, 0], talk: .6 * talkAmt(t, 3) });
      Dd.put(B_AISLE, 0, .75, 0);
      F(Dd.f, t, { smile: .6, look: [-.4, 0], talk: .3 * talkAmt(t, 4) });
    });
    Wd.occ = []; Wd.center = [-1.0, .5];
    Wd.cam = C4(dur,
      HH(truck([-.5, 1.0, -.2], { dur: dur * .25, dist0: 8.0, dist1: 7.6, h0: 1.1, h1: 1.2, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 21),
      HH(punch(pushIn([-1.4, .9, .2], { dur: dur * .25, dist0: 6.4, dist1: 5.8, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), [dur * .25 * .5]), 22),
      HH(insert([-2.6, 1.0, .3], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.0, h1: 1.1, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(orbitShot([-.6, .9, -.2], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.0, h1: 1.2, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, good): the seats light up red one by one (all taken); the son gets off and stands in the aisle; the father rolls onto his seat along a gold dotted path; green check; tag "לפנות את המקום" (lowered)
  function s3(dur) {
    const Wd = mkWorld({}); const BU = B_bus(Wd); const S = makeStool(Wd); const Dd = B_dad(Wd); const DOTS = B_dots(Wd);
    const PATH = makeDots(Wd, 5);
    const CK = mark3d(Wd, 'check', .9);
    const TK = T2(Wd, 2.6, 'לפנות את המקום', GOLDP, .46);
    Wd.on(t => {
      BU.street(t, .3); BU.leaf.scale.x = .05;
      DOTS.forEach((d, k) => d.scale.setScalar(Math.max(.001, popE(P(.5 + .5 * k, 1.1 + .5 * k, t)))));
      const u1 = sm(P(3.5, 5.5, t));
      placeG(S.g, arcV(B_ST, B_STAND, u1, .4), 1.5 * (1 - u1), 0);
      setH(S, 1);
      const u2 = sm(P(6.5, 9.5, t));
      Dd.put(arcV(B_AISLE, B_ST, u2, .5), 0, .75, 0);
      setDots(PATH, [B_AISLE[0], 1.0, B_AISLE[2]], [B_ST[0], 1.0, B_ST[2]], t, 5.5);
      CK.set([-1.6, 1.6, .9], popE(P(9.5, 10.5, t)) * .9, .05 * Math.sin(t * 3));
      TK.set([0, 1.95, -.6], popE(P(1.2, 2.0, t)), 0, 1);
      F(S.f, t, { smile: .4, look: [.4, 0], talk: .5 * talkAmt(t, 33) });
      F(Dd.f, t, { smile: .4, look: [-.3, 0], talk: .3 * talkAmt(t, 34) });
    });
    Wd.occ = []; Wd.center = [-1.2, .4];
    Wd.cam = C4(dur,
      HH(truck([-.6, 1.0, -.4], { dur: dur * .25, dist0: 8.2, dist1: 7.8, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 31),
      HH(pushIn([-1.2, .9, -.2], { dur: dur * .25, dist0: 7.0, dist1: 6.6, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 32),
      HH(punch(insert([-2.6, .9, .3], { dur: dur * .25, dist0: 4.4, dist1: 4.0, h0: 1.0, h1: 1.1, a0: 8, a1: -8, fov0: 36, fov1: 34 }), [.9]), 33),
      HH(orbitShot([-.6, .9, -.6], { dur: dur * .25, dist0: 7.4, dist1: 7.0, h0: 1.0, h1: 1.2, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, neutral): night bedroom; the son lies in the bed under the blanket, face and night cap above it; the father rolls in through the door; "?" pops; tag "במיטה"
  function s4(dur) {
    const Wd = mkWorld({}); const twk = B_bedroom(Wd); const BED = B_bed(Wd, [0, 0, -.7]); const S = makeStool(Wd); const Dd = B_dad(Wd);
    const CAP = cyl(0, .2, .4, 0xff5a8a); Wd.add(CAP);
    const Q = T2(Wd, .5, '?', WHITEP, .5); const TB = T2(Wd, 1.2, 'במיטה', GOLDP, .46);
    Wd.on(t => {
      twk(t);
      lieStool(S, CAP, [0, 0, -.7]);
      F(S.f, t, { smile: .2, look: [.4, 0], talk: .2 * talkAmt(t, 12) });
      F(BED.f, t, { smile: .5, look: [0, .2], talk: 0 });
      Dd.put(lerpV([3.2, 0, -1.7], [1.4, 0, .5], sm(P(2, 7, t))), 0, .75, 0);
      F(Dd.f, t, { smile: .3, look: [-.4, 0], talk: .3 * talkAmt(t, 13) });
      Q.set([0, 2.0, .3], popE(P(1, 2, t)), 0, 1);
      TB.set([-.75, 1.6, .3], popE(P(4, 5, t)), 0, 1);
    });
    Wd.occ = []; Wd.center = [-.3, -.4]; Wd.qPos = [0, .3];
    Wd.cam = C4(dur,
      HH(truck([0, 1.2, -.4], { dur: dur * .25, dist0: 8.0, dist1: 7.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 51),
      HH(pushIn([-.2, .9, -.6], { dur: dur * .25, dist0: 4.8, dist1: 4.4, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 52),
      HH(punch(insert([-.75, .9, -.7], { dur: dur * .25, dist0: 4.3, dist1: 4.1, h0: .8, h1: .9, a0: 8, a1: -8, fov0: 36, fov1: 34 }), [dur * .25 * .5]), 53),
      HH(orbitShot([-.2, .9, -.4], { dur: dur * .25, dist0: 7.2, dist1: 6.8, h0: 1.1, h1: 1.3, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 54));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, good): the son stays lying down in the bed (no rising); the father nods; "zzz" floats; the calm blue meter "לא חייב" beside the bed fills; tag "אינו חייב לקום" (lowered)
  function s5(dur) {
    const Wd = mkWorld({}); const twk = B_bedroom(Wd); const BED = B_bed(Wd, [0, 0, -.7]); const S = makeStool(Wd); const Dd = B_dad(Wd);
    const CAP = cyl(0, .2, .4, 0xff5a8a); Wd.add(CAP);
    const M = makeMeter(Wd, [2.2, 0, .4]); if (M.fill.material.color) M.fill.material.color.setHex(0x2f5fb8);
    const ML = T2(Wd, 1.2, 'לא חייב', BLUEP, .42);
    const ZZ = T2(Wd, .8, 'zzz', BLUEP, .4);
    const TK = T2(Wd, 2.6, 'אינו חייב לקום', GREYP, .46);
    Wd.on(t => {
      twk(t);
      lieStool(S, CAP, [0, 0, -.7]);
      F(S.f, t, { smile: .4, look: [.3, 0], talk: .2 * talkAmt(t, 14) });
      F(BED.f, t, { smile: .5, look: [0, .2], talk: 0 });
      M.set(sm(P(.5, 5, t)));
      ML.set([2.2, 2.2, .4], popE(P(.3, 1.0, t)), 0, 1);
      Dd.put([1.5, 0, .4], 0, .75, 0); Dd.g.rotation.x = .08 * Math.sin(t * 2.2);
      F(Dd.f, t, { smile: 1, look: [0, .2], talk: .2 * talkAmt(t, 15) });
      const fz = (t * .45) % 1;
      ZZ.set([-.1, 1.7 + .9 * fz, .2], popE(P(3, 4, t)), .1 * Math.sin(t), 1 - fz);
      TK.set([0, 2.0, .1], popE(P(.5, 1.3, t)), 0, 1);
    });
    Wd.occ = []; Wd.center = [.2, .2];
    Wd.cam = C4(dur,
      HH(truck([.2, 1.2, -.4], { dur: dur * .25, dist0: 8.4, dist1: 8.0, h0: 1.2, h1: 1.3, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 71),
      HH(punch(pushIn([-.2, .9, -.4], { dur: dur * .25, dist0: 6.0, dist1: 5.6, h0: .9, h1: 1.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), [dur * .25 * .5]), 72),
      HH(insert([2.2, .9, .4], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: .9, h1: 1.0, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([.2, .9, -.4], { dur: dur * .25, dist0: 7.6, dist1: 7.2, h0: 1.1, h1: 1.3, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, split frame): LEFT the son stands tall on the bus, gold star "הידור" glowing; RIGHT the son lies half-up in the bed under the blanket, grey dim star; tag "קימה שיש בה הידור" inside the frame
  function s6(dur) {
    const Wd = mkWorld({});
    B_on(Wd, box(14, .1, 8, 0x8a6a4a), 0, -.05, -.4);
    B_on(Wd, box(7, 6, .2, 0xf3e3c8), -3.5, 2.5, -2.4);     // left half: cream wall
    B_on(Wd, box(7, 6, .2, 0x1f2a4a), 3.5, 2.5, -2.4);      // right half: night-blue wall
    B_on(Wd, box(.08, 4.0, 3.0, CLR_GOLD), 0, 2.0, -1.2);   // the gold split line (shallow, so the tag stands in front of it)
    const SL = makeStool(Wd), SR = makeStool(Wd);
    const BB = [1.3, 0, -.5];
    const BED = B_bed(Wd, BB);
    const GLOW = cyl(.9, .9, .02, 0xfff1c2); GLOW.rotation.x = PI / 2; B_on(Wd, GLOW, -1.3, 1.6, -2.1);
    const STL = makeStar(Wd, [-1.3, 1.6, .2], 1.3), STR = makeStar(Wd, [BB[0] - .75, 1.65, -.5], 1.3);
    const CKL = mark3d(Wd, 'check', .8);
    const TK = T2(Wd, 4.0, 'קימה שיש בה הידור', GOLDP, .66);
    Wd.on(t => {
      setH(SL, 1); placeG(SL.g, [-1.3, 0, .2], .15 * Math.sin(t * 1.1), 0);
      setH(SR, 1); placeG(SR.g, [BB[0] - .75, .4, BB[2] + .23], 0, -.6);
      STL.set(1, 1 + .12 * Math.sin(t * 5)); STR.set(0, 1);
      GLOW.scale.setScalar(1 + .15 * Math.sin(t * 3));
      CKL.set([-.45, 1.0, .7], popE(P(3, 4, t)) * .9, .05 * Math.sin(t * 3));
      F(SL.f, t, { smile: 1, look: [0, .2], talk: .5 * talkAmt(t, 61) });
      F(SR.f, t, { smile: -.2, look: [.3, .3], talk: .2 * talkAmt(t, 62) });
      F(BED.f, t, { smile: 0, look: [0, .2], talk: 0 });
      TK.set([0, 2.3, .9], popE(P(.5, 1.2, t)), 0, 1);
    });
    Wd.occ = []; Wd.center = [0, 1.0];
    Wd.cam = C4(dur,
      HH(truck([0, 1.2, 0], { dur: dur * .25, dist0: 5.4, dist1: 5.1, h0: 1.2, h1: 1.3, a0: -5, a1: 5, fov0: 50, fov1: 50 }), 81),
      HH(punch(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 5.0, dist1: 4.6, h0: 1.0, h1: 1.1, a0: -4, a1: 4, fov0: 50, fov1: 48 }), [dur * .25 * .5]), 82),
      HH(truck([0, 1.2, 0], { dur: dur * .25, dist0: 4.8, dist1: 5.2, h0: 1.1, h1: 1.2, a0: 5, a1: -5, fov0: 50, fov1: 50 }), 83),
      HH(orbitShot([0, 1.2, -.2], { dur: dur * .25, dist0: 5.4, dist1: 5.0, h0: 1.2, h1: 1.4, a0: -8, a1: 7, fov0: 50, fov1: 50 }), 84));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the father in his seat (smiling), the son standing tall in the aisle, the street sliding past; slow crane
  function answer(dur) {
    const Wd = mkWorld({}); const BU = B_bus(Wd); const S = makeStool(Wd); const Dd = B_dad(Wd);
    Wd.on(t => {
      BU.street(t, .6); BU.leaf.scale.x = .05;
      setH(S, 1); placeG(S.g, B_STAND, .1 * Math.sin(t * 1.2), 0);
      F(S.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 3) });
      Dd.put(B_ST, 0, .75, 0);
      F(Dd.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 2) });
    });
    Wd.occ = []; Wd.center = [-1.2, .4]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([-1.2, 1.4, -.6], { dur: dur, dist0: 8.2, dist1: 7.4, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook: B_hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
