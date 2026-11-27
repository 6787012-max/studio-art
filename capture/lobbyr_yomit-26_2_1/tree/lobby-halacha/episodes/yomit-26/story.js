// yomit-26 story: "סעודת מצווה - נגינה מוקלטת בבין המצרים" (halacha yomit 26). Storyboard A in storyboards_v27.md.
// Adapted from episodes/yomit-25/story.js (room, radio, calendar, tags, camera helpers kept).
// NO people, NO figures. Heroes: a GEMARA book with a face and a ribbon "סיום", the RADIO with a face (recorded music).
// Props: festive table, cake, 4 plaques, instruments stage "תזמורת", 12-month ring, gold plaque "שבע ברכות".
// Everything is a function of local time t.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const arcV = (a, b, u, h) => { const p = a.map((v, k) => lerp(v, b[k], u)); p[1] += h * Math.sin(PI * clamp(u, 0, 1)); return p; };
  const FB = { talk: 0, smile: .3, look: [0, 0], surprise: 0, open: 1 };
  const F = (f, t, o) => f.set(t, Object.assign({}, FB, o));
  const C4 = (dur, a, b, c, d) => cuts([[dur * .25, a], [dur * .25, b], [dur * .25, c], [dur * .25, d]]);

  // ---------------------------------------------------------------- positions (metres; back wall at z=-2.4, camera on +z)
  const TB = [-0.1, 0, -0.5];                          // festive table (floor point)
  const GEM = [TB[0] + .1, .58, TB[2] - .1];           // Gemara base on the table top
  const GEMF = [GEM[0], GEM[1] + .5, GEM[2] + .3];     // centre of the Gemara's face
  const CAKE = [TB[0] + .7, .6, TB[2] - .15];
  const SHEVA = [TB[0] - .6, .58, TB[2] - .2];         // gold plaque, back-left
  const PLQ = [['ברית', .55], ['פדיון הבן', .2], ['בר מצווה', -.15], ['סיום', -.5]];   // right to left, front edge of the table
  const RAD = [1.25, .58, -1.1], RADN = [1.25, 1.4, -.75];   // radio on its small table, right side
  const STG_X0 = -2.2, STG_X1 = -1.6, STG_Z = -1.5;    // instruments stage: starts far left, stops at the barrier
  const BARX = -.8;                                    // red barrier (beat 2)
  const RING_C = [1.25, 1.6, -2.1];                    // 12-month ring, behind the radio
  const TBL = [TB[0] + .2, 1.1, TB[2]];                // where the radio notes land (table)
  const TAG_Y = 1.7;                                 // beat tags (kept between y 1.0 and 2.5, above the faces at y 1.2-1.4)
  const CLR_FLOOR = 0xb98a5a;
  const BLUEP = ['#dbe9ff', '#14408f', '#2f6ad0'];
  const GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'], WHITEP = ['#ffffff', '#2d3a6b', '#9aa7c4'];
  const REDP = ['#ffe3e3', '#8a1a1a', '#d33b3b'];
  const GOLDP = ['#fff3c4', '#7a5200', '#d4a017'];

  // ---------------------------------------------------------------- tags (same helpers as yomit-25)
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

  // the wall calendar: "בין המצרים"; the earlier day is on the RIGHT (Hebrew order)
  const drawCal = (c, W, H) => {
    c.fillStyle = '#fffdf4'; c.fillRect(0, 0, W, H);
    c.lineWidth = H * .05; c.strokeStyle = '#8a5a2a'; c.strokeRect(H * .03, H * .03, W - H * .06, H * .94);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5a3a20';
    c.font = `700 ${H * .2}px ${FONT}`; c.fillText('בין המצרים', W / 2, H * .25);
    c.font = `600 ${H * .14}px ${FONT}`;
    c.fillText('י״ז בתמוז', W * .8, H * .62);
    c.fillText('...', W / 2, H * .62);
    c.fillText('ט׳ באב', W * .2, H * .62);
  };

  // ---------------------------------------------------------------- objects
  // a table: a top and one leg
  function table(Wd, p, w, d, col) {
    const g = new THREE.Group(); g.position.set(p[0], 0, p[2]); Wd.add(g);
    const top = box(w, .06, d, col); top.position.y = .55; g.add(top);
    const leg = cyl(.08, .1, .52, 0x6a4a2a); leg.position.y = .27; g.add(leg);
    return g;
  }
  // a radio: a box with a round speaker grille, a face above it, a volume knob on the right, an antenna
  function makeRadio(Wd) {
    const g = new THREE.Group(); g.position.set(RAD[0], RAD[1], RAD[2]); Wd.add(g);
    const body = box(1.0, .7, .45, 0x3a3a48); body.position.y = .35; g.add(body);
    const ant = cyl(.02, .02, .7, 0x8a8a96); ant.position.set(-.35, 1.05, 0); ant.rotation.z = .2; g.add(ant);
    const grille = cyl(.15, .15, .03, 0x1a1a22); grille.rotation.x = PI / 2; grille.position.set(0, .15, .235); g.add(grille);
    const kg = new THREE.Group(); kg.position.set(.36, .18, .25); g.add(kg);
    const kn = cyl(.09, .09, .06, 0xd9a63a); kn.rotation.x = PI / 2; kg.add(kn);
    const f = face(Wd, { w: .3, parent: g, pos: [0, .47, .24], seed: 31 });
    return { g, f, kg };
  }
  // the Gemara: a blue cover with a face and a gold ribbon with the tag "סיום"; origin = bottom centre of the cover
  function makeGem(Wd) {
    const g = new THREE.Group(); g.position.set(GEM[0], GEM[1], GEM[2]); Wd.add(g);
    const cover = box(.7, .9, .14, 0x2a3f7a); cover.position.y = .45; g.add(cover);
    const rib = box(.08, .95, .03, 0xffc53a); rib.position.set(.22, .45, .085); g.add(rib);
    const tg = texPlane(.24, .16, drawTag('סיום', '#ffc53a', '#5a3a00', '#b8862a'), { cw: 512 });
    tg.position.set(.22, .2, .1); g.add(tg);
    const f = face(Wd, { w: .42, parent: g, pos: [-.1, .62, .08], seed: 17 });
    return { g, f };
  }
  // the instruments stage: a box with the tag "תזמורת" on its front, a guitar, a violin and a drum on top
  function makeStage(Wd) {
    const g = new THREE.Group(); g.position.set(STG_X0, 0, STG_Z); Wd.add(g);
    const st = box(1.5, .35, .9, 0x7a4aa0); st.position.y = .175; g.add(st);
    const tg = texPlane(.9, .22, drawTag('תזמורת', '#f3ecff', '#3a1f6a', '#7a4aa0'), { cw: 512 });
    tg.position.set(0, .175, .47); g.add(tg);
    const gt = new THREE.Group(); gt.position.set(-.45, .35, 0); g.add(gt);
    const gb = box(.34, .4, .08, 0xc8782a); gb.position.y = .2; gt.add(gb);
    const gn = box(.08, .36, .06, 0x6a4a2a); gn.position.y = .56; gt.add(gn);
    const vi = new THREE.Group(); vi.position.set(0, .35, 0); g.add(vi);
    const vb = box(.24, .32, .07, 0xb5532f); vb.position.y = .16; vi.add(vb);
    const vn = cyl(.03, .03, .22, 0x2a1a10); vn.position.y = .42; vi.add(vn);
    const dr = new THREE.Group(); dr.position.set(.45, .35, 0); g.add(dr);
    const dm = cyl(.16, .16, .16, 0xd33b3b); dm.position.y = .08; dr.add(dm);
    return { g, grp: [gt, vi, dr] };
  }
  // grey out (silent) or restore the colours of an instrument group
  const paint = (o, grey) => o.traverse(m => { if (m.isMesh) {
    if (m.userData.c === undefined) m.userData.c = m.material.color.getHex();
    m.material.color.setHex(grey ? 0x9a9a9a : m.userData.c); } });
  // a standing plaque with a label; origin = bottom centre; starts hidden (scale ~0)
  function makePlaque(Wd, p, text, pal, bkc) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const bk = box(.32, .2, .04, bkc || 0xfff7e6); bk.position.y = .1; g.add(bk);
    const tx = texPlane(.3, .18, drawTag(text, pal[0], pal[1], pal[2]), { cw: 512 });
    tx.position.set(0, .1, .03); g.add(tx);
    g.scale.setScalar(.001);
    return g;
  }
  // the festive cake with a small flag
  function makeCake(Wd) {
    const g = new THREE.Group(); g.position.set(CAKE[0], CAKE[1], CAKE[2]); Wd.add(g);
    const c = cyl(.14, .16, .1, 0xffd0e0); c.position.y = .05; g.add(c);
    const fl = box(.02, .14, .02, 0x6a4a2a); fl.position.y = .17; g.add(fl);
    const fg = box(.1, .06, .02, 0xd33b3b); fg.position.set(.05, .22, 0); g.add(fg);
    return g;
  }
  // the 12-month ring: 12 tiles in a circle; each tile has a dim and a gold box (gold = lit) and a note; two tiny tags "ברית" and "סיום" for beat 5
  function makeRing(Wd) {
    const g = new THREE.Group(); g.position.set(RING_C[0], RING_C[1], RING_C[2]); Wd.add(g);
    const tiles = [], notes = [];
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * 2 * PI, x = Math.cos(a) * .55, y = Math.sin(a) * .55;
      const dim = box(.16, .16, .04, 0x5a5a6a); dim.position.set(x, y, 0); g.add(dim);
      const gold = box(.16, .16, .05, 0xffc53a); gold.position.set(x, y, .005); gold.visible = false; g.add(gold);
      const nt = ball(.05, 0x1a1a1a); nt.position.set(x, y, .06); nt.visible = false; g.add(nt);
      tiles.push({ dim, gold }); notes.push(nt);
    }
    const mini = [[3, 'ברית'], [9, 'סיום']].map(([i, s]) => {
      const a = i / 12 * 2 * PI;
      const tg = texPlane(.2, .1, drawTag(s, '#fff7e6', '#8a1a1a', '#b8392b'), { cw: 256 });
      tg.position.set(Math.cos(a) * .55, Math.sin(a) * .55, .07); tg.visible = false; g.add(tg); return tg;
    });
    return { g, tiles, notes, mini };
  }
  // light the ring tiles that pass the test, and show their notes
  const ringLit = (Y, on) => Y.ring.tiles.forEach((tl, i) => {
    const lit = !!on(i); tl.gold.visible = lit; tl.dim.visible = !lit; Y.ring.notes[i].visible = lit; });
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
  // a music note: head + stem
  function note(Wd, c) {
    const g = new THREE.Group(); Wd.add(g);
    const h = ball(.07, c); g.add(h);
    const s = box(.03, .32, .03, c); s.position.set(.06, .16, 0); g.add(s);
    return g;
  }
  // notes leave a and travel to b one after another, periodically; optional fall after b
  function emit(notes, a, b, t, o) {
    const N = notes.length, per = o.per;
    notes.forEach((n, i) => {
      const k = (((t - i * per / N) % per) + per) % per;
      n.rotation.z = .3 * Math.sin(t * 6 + i);
      if (k < o.len) {
        const u = k / o.len, p = arcV(a, b, sm(u), o.h || 0);
        n.visible = true; n.position.set(p[0], p[1], p[2]);
        n.scale.setScalar(Math.max(.001, popE(clamp(u * 5, 0, 1)) * (1 - .3 * u)));
      } else if (o.fall && k - o.len < o.fall) {
        const f = k - o.len;
        n.visible = true; n.position.set(b[0], b[1] - 2.5 * f * f, b[2]);
        n.scale.setScalar(Math.max(.001, 1 - f * .8));
      } else n.visible = false;
    });
  }
  // plaques pop one by one (right to left) from time a0; a0 far in the past = already there, far in the future = hidden
  const plqPop = (Y, t, a0) => Y.plq.forEach((p, i) => p.scale.setScalar(Math.max(.001, popE(P(a0 + i * .35, a0 + i * .35 + .5, t)))));
  // show or hide the optional props of a beat (the stage and the table are always there)
  const setVis = (Y, o) => { Y.ring.g.visible = !!o.ring; Y.sheva.visible = !!o.sheva; };

  // ---------------------------------------------------------------- the room (fresh per beat)
  function room(Wd) {
    const back = box(12, 6, .2, 0xf3e3c8); back.position.set(0, 2.5, -2.4); Wd.add(back);
    const floor = box(12, .1, 10, CLR_FLOOR); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const rug = box(3.4, .02, 2.2, 0xd9b38c); rug.position.set(-.4, .01, -.6); Wd.add(rug);
    table(Wd, RAD, .9, .6, 0x8a5a2a);
    table(Wd, TB, 1.8, .6, 0xffffff);
    const cal = texPlane(2.2, 1.1, drawCal, { cw: 512 }); cal.position.set(0, 2.6, -2.27); Wd.add(cal);
    const Y = { rad: makeRadio(Wd), gem: makeGem(Wd), stage: makeStage(Wd), ring: makeRing(Wd), cake: makeCake(Wd),
                plq: PLQ.map(([s, x]) => makePlaque(Wd, [TB[0] + x, .58, TB[2] + .2], s, [GREENP[0], BLUEP[1], BLUEP[2]], 0xfff7e6)),
                sheva: makePlaque(Wd, SHEVA, 'שבע ברכות', GOLDP, 0xd4a017) };
    Y.sheva.visible = false;
    setVis(Y, {});
    return Y;
  }

  // ================================================================ HOOK 0-14: extreme close-up on the Gemara's face and ribbon, pull out; the festive table, the stage and the radio appear; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    Wd.on(t => {
      plqPop(Y, t, 99);
      F(Y.gem.f, t, { smile: t > 6 ? .5 : .2, look: [0, .2], talk: t > 1 ? .5 * talkAmt(t, 61) : 0 });
      F(Y.rad.f, t, { smile: .2, look: [-.3, .2], talk: t > 1 ? .4 * talkAmt(t, 62) : 0 });
    });
    Wd.occ = []; Wd.center = [GEM[0], 1.1]; Wd.qPos = [GEM[0], GEM[2] + .5];
    Wd.cam = C4(dur,
      HH(pullOut([GEMF[0], 1.2, GEMF[2] + .1], { dur: dur * .25, dist0: 1.3, dist1: 2.2, h0: 1.2, h1: 1.3, a0: 4, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([-.7, 1.1, -.6], { dur: dur * .25, dist0: 3.2, dist1: 3.6, h0: 1.1, h1: 1.4, a0: -4, a1: 6, fov0: 38, fov1: 42 }), 42),
      HH(truck([-.5, 1.1, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.3, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([-.4, 1.1, -.4], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, good): the four plaques pop one by one, right to left, each with sparkles; the Gemara smiles; tag "סעודת מצווה"
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const sp = PLQ.map(([, x]) => sparks(Wd, [TB[0] + x, .85, TB[2] + .2], .22));
    const TG = T2(Wd, 2.0, 'סעודת מצווה', BLUEP, .42);
    Wd.on(t => {
      plqPop(Y, t, 1.0);
      sp.forEach((S, i) => sparkUp(S, t, 1.0 + i * .35));
      TG.set([0, TAG_Y, .6], popE(P(3.2, 3.9, t)), 0, 1);
      F(Y.gem.f, t, { smile: t > 2.5 ? 1 : .3, look: [0, .2], talk: .5 * talkAmt(t, 63) });
      F(Y.rad.f, t, { smile: .3, look: [-.3, .2] });
    });
    Wd.occ = []; Wd.center = [TB[0], 1.1];
    Wd.cam = C4(dur,
      HH(truck([TB[0], 1.2, -.5], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 11),
      HH(punch(pushIn([TB[0], 1.0, -.5], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: 1.1, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [1.4]), 12),
      HH(insert([TB[0] + .2, .9, -.3], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.0, h1: 1.1, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([TB[0], 1.2, -.5], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (14, bad): the stage rolls toward the table; a red barrier rises; the instruments turn grey and shrink back; red cross + shock; tag "בלי תזמורת"
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const BAR = box(.08, 1.2, .8, 0xd33b3b); BAR.position.set(BARX, .6, STG_Z); BAR.scale.y = .001; Wd.add(BAR);
    const SH = shock(Wd, 0xff7a7a);
    const CRS = mark3d(Wd, 'cross', .5);
    const TG = T2(Wd, 1.4, 'בלי תזמורת', REDP, .42);
    Wd.on(t => {
      plqPop(Y, t, -10);
      const hit = P(1.8, 2.4, t);
      Y.stage.g.position.x = lerp(STG_X0, STG_X1, sm(P(.3, 1.8, t)));
      const up = sm(P(.4, 1.2, t));
      BAR.scale.y = Math.max(.001, up); BAR.position.y = .6 * up;
      SH.set([BARX, .9, STG_Z + .1], hit, 1.0);
      Y.stage.grp.forEach(g => { paint(g, t > 1.6); g.scale.setScalar(lerp(1, .8, sm(P(1.6, 2.4, t)))); });
      CRS.set([-.4, 2.3, -.9], popE(P(2.6, 3.2, t)) * .9, 0);
      TG.set([0, TAG_Y, .6], popE(P(1.2, 2.0, t)), 0, 1);
      F(Y.gem.f, t, { smile: -.4, look: [.5, .2], surprise: hit });
      F(Y.rad.f, t, { smile: -.2, look: [-.3, .2], talk: t < 3 ? .5 * talkAmt(t, 64) : 0 });
    });
    Wd.occ = []; Wd.center = [-1.2, 1.2];
    Wd.cam = C4(dur,
      HH(truck([-1.2, 1.2, -.8], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 11),
      HH(punch(pushIn([-1.2, 1.0, -.8], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: 1.1, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [1.4]), 12),
      HH(insert([-.9, 1.2, -.9], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.2, h1: 1.3, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([-1.2, 1.2, -.8], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (14, neutral-question): the radio hops in front; a big "?" above it; small notes come out hesitantly and stop in mid-air; tag "מוקלט?"
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const Q = T2(Wd, .8, '?', WHITEP, .5);
    const TG = T2(Wd, 1.5, 'מוקלט?', WHITEP, .42);
    const HOV = [[.55, 1.55, .35], [.85, 1.95, .45], [.2, 1.85, .5], [.9, 1.3, .4]];
    const notes = HOV.map(() => note(Wd, 0x1a1a1a));
    Wd.on(t => {
      plqPop(Y, t, -10);
      const u = P(0, 1.2, t), k = sm(u);
      const hx = lerp(RAD[0], .25, k), hz = lerp(RAD[2], .1, k), hy = RAD[1] + .35 * Math.sin(PI * clamp(u, 0, 1));
      Y.rad.g.position.set(hx, hy, hz);
      Q.set([hx + .2, hy + 1.3, hz], popE(P(.6, 1.2, t)), 0, 1);
      notes.forEach((n, i) => {
        const v = P(1.6 + i * .45, 2.6 + i * .45, t);
        const p = arcV([hx, hy + 1.0, hz + .1], HOV[i], sm(v), .1);
        n.visible = v > .01; n.position.set(p[0], p[1] + .03 * Math.sin(t * 3 + i), p[2]);
        n.scale.setScalar(Math.max(.001, popE(clamp(v * 4, 0, 1))));
      });
      TG.set([-.6, TAG_Y, .6], popE(P(2.4, 3.2, t)), 0, 1);
      F(Y.rad.f, t, { smile: .2, look: [.2, .2], talk: .5 * talkAmt(t, 65) });
      F(Y.gem.f, t, { smile: -.2, look: [.4, .2] });
    });
    Wd.occ = []; Wd.center = [.3, 1.4];
    Wd.cam = C4(dur,
      HH(truck([.2, 1.3, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 21),
      HH(pushIn([.3, 1.4, -.2], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.3, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), 22),
      HH(insert([.3, 1.5, .1], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.4, h1: 1.5, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(orbitShot([.2, 1.3, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (16, good): the 12-month ring appears behind the radio; each tile lights up with its note one after another; the radio's notes flow to the table; green check + sparkles; tag "יש להקל"
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    setVis(Y, { ring: true });
    const notes = Array.from({ length: 4 }, () => note(Wd, 0x1a1a1a));
    const CK = mark3d(Wd, 'check', .6);
    const sp = sparks(Wd, [.9, 2.1, -.2], .35);
    const TG = T2(Wd, 1.4, 'יש להקל', GREENP, .42);
    Wd.on(t => {
      plqPop(Y, t, -10);
      ringLit(Y, i => t > .8 + i * .45);
      if (t > 7) emit(notes, RADN, TBL, t, { per: 2.6, len: 1.8, h: .5 });
      else notes.forEach(n => { n.visible = false; });
      CK.set([.9, 2.1, -.2], popE(P(9.4, 10.0, t)) * .9, 0);
      sparkUp(sp, t, 9.4);
      TG.set([0, TAG_Y, .6], popE(P(8.6, 9.4, t)), 0, 1);
      F(Y.rad.f, t, { smile: t > 7 ? .8 : .3, look: [-.3, .2], talk: t > 7 ? .5 * talkAmt(t, 66) : 0 });
      F(Y.gem.f, t, { smile: .5, look: [.3, .2] });
    });
    Wd.occ = []; Wd.center = [1.0, 1.4];
    Wd.cam = C4(dur,
      HH(truck([.9, 1.4, -1.2], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.3, h1: 1.6, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 61),
      HH(punch(pushIn([1.2, 1.5, -1.5], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .5]), 62),
      HH(insert([1.25, 1.5, -1.0], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.4, h1: 1.5, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 63),
      HH(orbitShot([.9, 1.4, -1.2], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.3, h1: 1.6, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (14, good): the ring turns slowly; its tiles show the tiny plaques "ברית" and "סיום"; an orange pulse runs from the ring to the radio; tag "כמו כל השנה"
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    setVis(Y, { ring: true });
    const pul = ball(.09, 0xff8a1a); Wd.add(pul);
    const TG = T2(Wd, 1.5, 'כמו כל השנה', BLUEP, .42);
    Wd.on(t => {
      plqPop(Y, t, -10);
      ringLit(Y, () => true);
      Y.ring.g.rotation.z = .35 * t;
      Y.ring.mini.forEach(m => { m.visible = true; });
      const u = (t * .5) % 1, p = RING_C.map((v, k) => lerp(v, RADN[k], u));
      pul.position.set(p[0], p[1], p[2]); pul.scale.setScalar(Math.max(.001, popE(clamp(u * 4, 0, 1)) * (1 - .5 * u)));
      TG.set([0, TAG_Y, .6], popE(P(1.0, 1.8, t)), 0, 1);
      F(Y.rad.f, t, { smile: .5, look: [-.3, .2], talk: .4 * talkAmt(t, 67) });
      F(Y.gem.f, t, { smile: .4, look: [.3, .2] });
    });
    Wd.occ = []; Wd.center = [.9, 1.5];
    Wd.cam = C4(dur,
      HH(truck([.9, 1.5, -1.4], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.4, h1: 1.6, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 71),
      HH(punch(pushIn([1.2, 1.5, -1.5], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .5]), 72),
      HH(insert([1.25, 1.6, -1.2], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.5, h1: 1.6, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([.9, 1.5, -1.4], { dur: dur * .25, dist0: 4.2, dist1: 4.0, h0: 1.4, h1: 1.6, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (14, good): the gold plaque "שבע ברכות" pops on the table; the instruments regain their colour and play (notes burst); green check + sparkles; tag "גם כלי שיר"
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    setVis(Y, { sheva: true });
    const notes = Array.from({ length: 4 }, () => note(Wd, 0x1a1a1a));
    const CK = mark3d(Wd, 'check', .7);
    const sp = sparks(Wd, [-.35, 2.0, -.1], .35);
    const TG = T2(Wd, 1.4, 'גם כלי שיר', GREENP, .42);
    Wd.on(t => {
      plqPop(Y, t, -10);
      Y.sheva.scale.setScalar(Math.max(.001, popE(P(.6, 1.6, t))));
      Y.stage.grp.forEach(g => { paint(g, false); });
      if (t > 1.5) emit(notes, [STG_X1, 1.0, STG_Z], [STG_X1 + .3, 2.0, STG_Z + .2], t, { per: 1.6, len: 1.2, h: .4 });
      else notes.forEach(n => { n.visible = false; });
      CK.set([-.35, 2.0, -.1], popE(P(3.2, 3.8, t)) * .9, 0);
      sparkUp(sp, t, 3.2);
      TG.set([0, TAG_Y, .6], popE(P(3.4, 4.2, t)), 0, 1);
      F(Y.gem.f, t, { smile: .8, look: [-.3, .2] });
      F(Y.rad.f, t, { smile: .8, look: [-.5, .2], talk: .5 * talkAmt(t, 86) });
    });
    Wd.occ = []; Wd.center = [-.3, 1.2];
    Wd.cam = C4(dur,
      HH(truck([-.3, 1.2, -.5], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 91),
      HH(punch(pushIn([SHEVA[0], 1.0, -.5], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .5]), 92),
      HH(insert([SHEVA[0] + .1, 1.2, -.3], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.2, h1: 1.3, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 93),
      HH(orbitShot([-.3, 1.2, -.5], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 94));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the Gemara in the middle-back, the radio with soft notes at one side, the gold plaque at the other; slow crane. NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    setVis(Y, { sheva: true });
    Y.sheva.scale.setScalar(1);
    const notes = Array.from({ length: 3 }, () => note(Wd, 0x1a1a1a));
    const pale = Array.from({ length: 3 }, () => note(Wd, 0xc9d3e6));
    Wd.on(t => {
      plqPop(Y, t, -10);
      emit(notes, RADN, TBL, t, { per: 2.4, len: 1.6, h: .5 });
      emit(pale, [RAD[0] - .4, 1.9, RAD[2]], [-.3, 2.3, -1.6], t, { per: 2.8, len: 2.2, h: .4 });
      F(Y.gem.f, t, { smile: 1, look: [.3, .2], talk: .4 * talkAmt(t, 3) });
      F(Y.rad.f, t, { smile: 1, look: [-.4, .2], talk: .4 * talkAmt(t, 4) });
    });
    Wd.occ = []; Wd.center = [0, 1.0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur: dur, dist0: 5.2, dist1: 4.8, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
