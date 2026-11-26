// yomit-25 story: "סיפור עם מוזיקה ושירה בפה" (halacha yomit 25). Storyboard A in storyboards_v26.md.
// Adapted from episodes/yomit-24/story.js (room, radio, calendar, tags, camera helpers kept; armchair and block dropped).
// NO people, NO figures. Heroes: a STORY BOOK with a face ("סיפור"), a SONG SHEET with a face ("שיר"), the RADIO with a face.
// Props: music notes, guitar / violin / drum on a shelf (greyed when silent), a medicine bottle with a green cross, a green heart, a counter "1".
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
  const BOOK = [-1.3, .58, -.6];                        // the story book on a low table (base = table top)
  const BOOKF = [BOOK[0], BOOK[1] + .5, BOOK[2] + .3];  // centre of the book's face (speech starts here)
  const RAD = [1.25, .58, -1.1];                        // the radio on a small table at the right
  const RADN = [1.25, 1.4, -.75];                       // where the notes leave the radio
  const SX = -.2, SONG_Z = -.5;                         // the song sheet stands on the floor
  const BTL = [.5, 0, -.5], HRT = [.5, 1.3, -.5];       // medicine bottle on the floor, green heart above it
  const TAG_Y = 1.75;                                   // beat tags (kept between y 1.0 and 2.5)
  const BARW = [-.45, 1.35, -1.0], STOP = [-.35, 1.45, -1.0];   // red barrier and where the notes stop
  const CLR_FLOOR = 0xb98a5a;
  const BLUEP = ['#dbe9ff', '#14408f', '#2f6ad0'];
  const GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'], WHITEP = ['#ffffff', '#2d3a6b', '#9aa7c4'];
  const REDP = ['#ffe3e3', '#8a1a1a', '#d33b3b'];

  // ---------------------------------------------------------------- tags (same helpers as yomit-24)
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
  const drawCross = (c, W, H) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#1f9a3a'; c.fillRect(W * .4, H * .15, W * .2, H * .7); c.fillRect(W * .15, H * .4, W * .7, H * .2);
  };

  // ---------------------------------------------------------------- objects
  // a low table (a top and one leg)
  function table(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], 0, p[2]); Wd.add(g);
    const top = box(.9, .06, .6, 0x8a5a2a); top.position.y = .55; g.add(top);
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
    const ind = box(.025, .08, .03, 0xffffff); ind.position.set(0, .08, .035); kg.add(ind);
    const f = face(Wd, { w: .3, parent: g, pos: [0, .47, .24], seed: 31 });
    return { g, f, kg };
  }
  // a music note: head + stem
  function note(Wd, c) {
    const g = new THREE.Group(); Wd.add(g);
    const h = ball(.07, c); g.add(h);
    const s = box(.03, .32, .03, c); s.position.set(.06, .16, 0); g.add(s);
    return g;
  }
  // notes leave a and travel to b one after another, periodically; optional fall after b (the barrier)
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
  // a glowing disc (spotlight) behind a hero; faces the camera
  function glowAt(Wd, p, r, c) {
    const d = cyl(r, r, .03, c); d.rotation.x = PI / 2; d.position.set(p[0], p[1], p[2]); Wd.add(d); return d;
  }
  // a green heart (two balls and a diamond), origin at p
  function heart(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    [-.08, .08].forEach(x => { const b = ball(.1, 0x3fb84a); b.position.set(x, .05, 0); g.add(b); });
    const dm = box(.16, .16, .05, 0x3fb84a); dm.rotation.z = PI / 4; dm.position.set(0, -.05, 0); g.add(dm);
    return g;
  }
  // the story book: a red cover with a pages block on a hinge at its left edge; the pages swing open; face and title on the pages
  function makeBook(Wd) {
    const g = new THREE.Group(); g.position.set(BOOK[0], BOOK[1], BOOK[2]); Wd.add(g);
    const cover = box(.8, 1.0, .14, 0xb8392b); cover.position.y = .5; g.add(cover);
    const pg = new THREE.Group(); pg.position.set(-.36, 0, .09); g.add(pg);
    const pages = box(.72, .95, .06, 0xfff7e6); pages.position.set(.36, .5, 0); pg.add(pages);
    const title = texPlane(.6, .2, drawTag('סיפור', '#fff7e6', '#8a1a1a', '#b8392b'), { cw: 512 });
    title.position.set(.36, .86, .04); pg.add(title);
    const f = face(Wd, { w: .46, parent: pg, pos: [.36, .45, .05], seed: 17 });
    return { g, pg, f };
  }
  // the song sheet: a standing page with a face and a title "שיר"; origin = bottom centre
  function makeSong(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    const sheet = box(.7, .95, .06, 0xfffdf0); sheet.position.y = .5; g.add(sheet);
    const title = texPlane(.56, .18, drawTag('שיר', '#fffdf0', '#1f2a5a', '#9aa7c4'), { cw: 512 });
    title.position.set(0, .86, .04); g.add(title);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .47, .05], seed: 52 });
    const bub = Array.from({ length: 4 }, () => { const b = ball(.06, 0xbfe3ff); b.visible = false; Wd.add(b); return b; });
    return { g, f, bub };
  }
  // the medicine bottle: a glass body, a white cap, a label with a green cross; origin = bottom centre
  function makeBottle(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    const body = cyl(.15, .15, .6, 0xdff3ff); body.position.y = .3; g.add(body);
    const cap = cyl(.085, .085, .12, 0xffffff); cap.position.y = .66; g.add(cap);
    const lab = texPlane(.26, .26, drawCross, { cw: 256 }); lab.position.set(0, .3, .155); g.add(lab);
    return g;
  }
  // the shelf on the back wall with a guitar, a violin and a drum; a grey "off" ring behind each
  function makeShelf(Wd) {
    const sh = box(2.0, .06, .35, 0x8a5a2a); sh.position.set(-2.0, 1.9, -2.1); Wd.add(sh);
    const gt = new THREE.Group(); gt.position.set(-2.5, 1.93, -2.0); Wd.add(gt);
    const gb = box(.34, .4, .08, 0xc8782a); gb.position.y = .2; gt.add(gb);
    const gn = box(.08, .36, .06, 0x6a4a2a); gn.position.y = .56; gt.add(gn);
    const vi = new THREE.Group(); vi.position.set(-2.0, 1.93, -2.0); Wd.add(vi);
    const vb = box(.24, .32, .07, 0xb5532f); vb.position.y = .16; vi.add(vb);
    const vn = cyl(.03, .03, .22, 0x2a1a10); vn.position.y = .42; vi.add(vn);
    const dr = new THREE.Group(); dr.position.set(-1.5, 1.93, -2.0); Wd.add(dr);
    const dm = cyl(.16, .16, .16, 0xd33b3b); dm.position.y = .08; dr.add(dm);
    const rings = [-2.5, -2.0, -1.5].map(x => { const r = cyl(.27, .27, .03, 0x9a9a9a); r.rotation.x = PI / 2; r.position.set(x, 2.15, -2.22); Wd.add(r); return r; });
    return { sh, grp: [gt, vi, dr], rings, all: [sh, gt, vi, dr, ...rings] };
  }
  // grey out (silent) or restore the colours of an instrument group
  const paint = (o, grey) => o.traverse(m => { if (m.isMesh) {
    if (m.userData.c === undefined) m.userData.c = m.material.color.getHex();
    m.material.color.setHex(grey ? 0x9a9a9a : m.userData.c); } });
  // la-la bubbles rising from the song sheet's mouth (x = where the sheet stands now)
  const bubbles = (Y, t, x, on) => Y.song.bub.forEach((b, i) => {
    const u = (t * .7 + i * .25) % 1;
    b.visible = on; b.position.set(x + .12 + .05 * Math.sin(t * 3 + i), .6 + u * 1.2, SONG_Z + .1);
    b.scale.setScalar(Math.max(.001, popE(clamp(u * 4, 0, 1)) * (1 - .5 * u)));
  });
  const bookOpen = (Y, u) => { Y.book.pg.rotation.y = -.7 * clamp(u, 0, 1); };
  // show or hide the heroes and props of a beat
  const setVis = (Y, o) => {
    Y.song.g.visible = !!o.song; Y.song.bub.forEach(b => { b.visible = false; });
    Y.bot.visible = !!o.bot; Y.hrt.visible = !!o.hrt;
    Y.shelf.all.forEach(x => { x.visible = !!o.shelf; });
  };

  // ---------------------------------------------------------------- the room (fresh per beat)
  function room(Wd) {
    const back = box(12, 6, .2, 0xf3e3c8); back.position.set(0, 2.5, -2.4); Wd.add(back);
    const floor = box(12, .1, 10, CLR_FLOOR); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const rug = box(3.2, .02, 2.2, 0xd9b38c); rug.position.set(-.5, .01, -.5); Wd.add(rug);
    table(Wd, RAD); table(Wd, [BOOK[0], 0, BOOK[2]]);
    const cal = texPlane(2.2, 1.1, drawCal, { cw: 512 }); cal.position.set(0, 2.6, -2.27); Wd.add(cal);
    const Y = { rad: makeRadio(Wd), book: makeBook(Wd), song: makeSong(Wd), bot: makeBottle(Wd), hrt: heart(Wd, HRT), shelf: makeShelf(Wd) };
    Y.song.g.position.set(SX, 0, SONG_Z); Y.bot.position.set(BTL[0], 0, BTL[2]);
    setVis(Y, {});
    return Y;
  }

  // ================================================================ HOOK 0-14: extreme close-up on the book's face, pull out; the book opens; speech lines float out, faint notes behind; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const lines = [T2(Wd, 1.0, 'היה פעם', WHITEP, .34), T2(Wd, 1.0, 'ילד קטן', WHITEP, .34)];
    const pale = Array.from({ length: 4 }, () => note(Wd, 0xc9d3e6));
    Wd.on(t => {
      bookOpen(Y, sm(P(3, 6, t)));
      lines.forEach((L, i) => {
        const u = P(4 + i * 1.4, 6.4 + i * 1.4, t);
        L.set(arcV(BOOKF, [-.2 + i * .5, 1.9 - i * .4, .4], sm(u), .3), popE(clamp(u * 3, 0, 1)), 0, 1);
      });
      emit(pale, BOOKF, [-.2, 2.3, -1.2], t, { per: 2.6, len: 2.0, h: .5 });
      F(Y.book.f, t, { smile: t > 6 ? .6 : .2, look: [0, .2], talk: t > 1 ? .5 * talkAmt(t, 91) : 0 });
      F(Y.rad.f, t, { smile: .2, look: [-.3, .2], talk: t > 1 ? .4 * talkAmt(t, 31) : 0 });
    });
    Wd.occ = []; Wd.center = [BOOK[0] + .4, 1.1]; Wd.qPos = [BOOK[0], BOOK[2] + .5];
    Wd.cam = C4(dur,
      HH(pullOut([BOOK[0], 1.2, BOOK[2] + .1], { dur: dur * .25, dist0: 1.3, dist1: 2.2, h0: 1.2, h1: 1.3, a0: 4, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([-.7, 1.1, -.6], { dur: dur * .25, dist0: 3.2, dist1: 3.6, h0: 1.1, h1: 1.4, a0: -4, a1: 6, fov0: 38, fov1: 42 }), 42),
      HH(truck([-.5, 1.1, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.3, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([-.4, 1.1, -.4], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, bad): the radio blasts notes; a red barrier stops them; the knob turns to zero; notes fall; red cross + shock; tag "לא שומעים"
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const notes = Array.from({ length: 4 }, () => note(Wd, 0x1a1a1a));
    const BAR = box(.08, 1.2, .8, 0xd33b3b); BAR.position.set(BARW[0], BARW[1], BARW[2]); Wd.add(BAR);
    const SH = shock(Wd, 0xff7a7a);
    const CRS = mark3d(Wd, 'cross', .5);
    const TG = T2(Wd, 1.8, 'לא שומעים', REDP, .42);
    Wd.on(t => {
      const hit = P(2.0, 2.6, t);
      emit(notes, RADN, STOP, t, { per: 3.0, len: 1.4, h: .4, fall: 1.2 });
      Y.rad.kg.rotation.z = -2.6 * sm(P(.6, 2.2, t));
      BAR.scale.setScalar(1 + .05 * Math.sin(t * 6) * hit);
      SH.set([BARW[0], BARW[1], BARW[2] + .05], hit, 1.0);
      CRS.set([-.45, 2.4, -.8], popE(P(2.6, 3.2, t)) * .9, 0);
      TG.set([0, TAG_Y, .6], popE(P(1.2, 2.0, t)), 0, 1);
      F(Y.rad.f, t, { smile: -.3, look: [-.5, .2], talk: t < 3 ? .6 * talkAmt(t, 22) : 0 });
      F(Y.book.f, t, { smile: -.4, look: [.5, .2], surprise: hit });
    });
    Wd.occ = []; Wd.center = [-.3, 1.2];
    Wd.cam = C4(dur,
      HH(truck([-.3, 1.2, -.5], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 11),
      HH(punch(pushIn([-.6, 1.0, -.6], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: 1.1, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [1.4]), 12),
      HH(insert([-.2, 1.4, -.9], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.4, h1: 1.5, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([-.3, 1.2, -.5], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (14, good-ish layer): the book is open; big white text lines float forward in front; pale notes drift slowly BEHIND them; tag "ברקע"
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const lines = [T2(Wd, 1.1, 'היה פעם', WHITEP, .36), T2(Wd, 1.1, 'ילד קטן', WHITEP, .36), T2(Wd, 1.1, 'ויום אחד', WHITEP, .36)];
    const pale = Array.from({ length: 4 }, () => note(Wd, 0xc9d3e6));
    const TG = T2(Wd, 1.2, 'ברקע', BLUEP, .42);
    Wd.on(t => {
      bookOpen(Y, sm(P(.5, 2.0, t)));
      lines.forEach((L, i) => {
        const u = sm(P(1.0 + i * .6, 3.0 + i * .6, t));
        L.set([-.6 + .1 * i, 1.2 - .3 * i, lerp(-.6, .5, u)], popE(clamp((t - .5 - i * .4) * 2, 0, 1)), 0, 1);
      });
      emit(pale, RADN, [-.9, 1.1, -1.6], t, { per: 3.0, len: 2.4, h: .3 });
      TG.set([0, TAG_Y, .6], popE(P(1.0, 1.8, t)), 0, 1);
      F(Y.book.f, t, { smile: .6, look: [0, .2], talk: .6 * talkAmt(t, 92) });
      F(Y.rad.f, t, { smile: .3, look: [-.4, .2] });
    });
    Wd.occ = []; Wd.center = [-.5, 1.2];
    Wd.cam = C4(dur,
      HH(truck([-.5, 1.2, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 21),
      HH(pushIn([-.9, 1.1, -.4], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.1, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), 22),
      HH(insert([-1.1, 1.2, -.3], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.2, h1: 1.3, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(orbitShot([-.5, 1.2, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (14, good): a slider: "סיפור" tall, "מוזיקה" small; the book smiles; green check + sparkles; tag "מותרת"
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const sBar = box(.26, 1, .14, 0x2f6ad0); Wd.add(sBar);
    const mBar = box(.26, 1, .14, 0x9aa7c4); Wd.add(mBar);
    const LS = T2(Wd, .7, 'סיפור', BLUEP, .3), LM = T2(Wd, .7, 'מוזיקה', WHITEP, .3);
    const CK = mark3d(Wd, 'check', .5);
    const sp = Array.from({ length: 6 }, () => { const b = ball(.05, 0xffe36a); b.visible = false; Wd.add(b); return b; });
    const TG = T2(Wd, 1.3, 'מותרת', GREENP, .42);
    Wd.on(t => {
      const k = sm(P(.5, 2.6, t));
      const hs = lerp(.5, 1.0, k), hm = lerp(.6, .3, k);
      sBar.scale.y = hs; sBar.position.set(-.45, hs / 2, -.5);
      mBar.scale.y = hm; mBar.position.set(.1, hm / 2, -.5);
      LS.set([-.45, hs + .3, -.4], popE(P(.5, 1.2, t)), 0, 1);
      LM.set([.1, hm + .25, -.4], popE(P(.8, 1.5, t)), 0, 1);
      const cs = popE(P(3.0, 3.6, t));
      CK.set([.75, 1.5, -.2], cs * .9, 0);
      sp.forEach((b, i) => { const a = i / 6 * 2 * PI + t, s = popE(P(3.2, 3.8, t)); b.visible = s > .01;
        b.position.set(.75 + Math.cos(a) * .45, 1.5 + Math.sin(a) * .35, -.2); b.scale.setScalar(Math.max(.001, s * (.8 + .4 * Math.abs(Math.sin(t * 4 + i))))); });
      TG.set([0, TAG_Y, .6], popE(P(2.6, 3.4, t)), 0, 1);
      bookOpen(Y, .3);
      F(Y.book.f, t, { smile: t > 2.5 ? 1 : .4, look: [0, .2], talk: .4 * talkAmt(t, 53) });
      F(Y.rad.f, t, { smile: .4, look: [-.4, .2] });
    });
    Wd.occ = []; Wd.center = [-.1, 1.0];
    Wd.cam = C4(dur,
      HH(truck([-.1, 1.2, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 31),
      HH(punch(pushIn([-.2, 1.0, -.4], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .5]), 32),
      HH(insert([-.2, 1.0, -.4], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.0, h1: 1.2, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 33),
      HH(orbitShot([-.1, 1.2, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (16, good): the song sheet hops in and sings (mouth opens, la-la bubbles); the instruments stand on a shelf, each with a grey "off" ring; tag "בלי כלי נגינה"
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    setVis(Y, { song: true, shelf: true });
    const TG = T2(Wd, 2.0, 'בלי כלי נגינה', BLUEP, .42);
    Wd.on(t => {
      const x = lerp(-2.6, SX, sm(P(0, 2.4, t)));
      const y = t < 2.4 ? Math.abs(Math.sin(t * 5)) * .25 : .03 * Math.abs(Math.sin(t * 4));
      Y.song.g.position.set(x, y, SONG_Z);
      bubbles(Y, t, x, t > 3);
      F(Y.song.f, t, { smile: t > 3 ? .8 : .3, look: [0, .3], talk: t > 3 ? .8 * talkAmt(t, 54) : 0 });
      Y.shelf.grp.forEach(g => paint(g, false));
      TG.set([0, TAG_Y, .6], popE(P(5.6, 6.4, t)), 0, 1);
      bookOpen(Y, .2);
      F(Y.book.f, t, { smile: .6, look: [.5, .3] });
      F(Y.rad.f, t, { smile: .3, look: [-.3, .2], talk: .3 * talkAmt(t, 55) });
    });
    Wd.occ = []; Wd.center = [-.6, 1.1];
    Wd.cam = C4(dur,
      HH(truck([-.6, 1.2, -.5], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 61),
      HH(punch(pushIn([SX, 1.0, -.5], { dur: dur * .25, dist0: 3.4, dist1: 3.0, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .5]), 62),
      HH(insert([SX, 1.1, -.3], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.1, h1: 1.2, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 63),
      HH(orbitShot([-.6, 1.2, -.5], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (14, good): the song sheet sings alone in a spotlight; a big counter "1" pops; the instruments stay silent and grey; green check; tag "ביחיד"
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    setVis(Y, { song: true, shelf: true });
    const GL = glowAt(Wd, [SX, 1.1, -2.2], 1.3, 0xfff1c2);
    const ONE = T2(Wd, .8, '1', WHITEP, .6);
    const CK = mark3d(Wd, 'check', .6);
    const TG = T2(Wd, 1.4, 'ביחיד', GREENP, .42);
    Wd.on(t => {
      GL.scale.setScalar(1 + .08 * Math.sin(t * 3));
      Y.song.g.position.set(SX, .03 * Math.abs(Math.sin(t * 4)), SONG_Z);
      bubbles(Y, t, SX, t > 1);
      F(Y.song.f, t, { smile: 1, look: [0, .3], talk: t > 1 ? .8 * talkAmt(t, 55) : 0 });
      Y.shelf.grp.forEach(g => paint(g, true));
      ONE.set([.45, 1.5, -.2], popE(P(1.0, 1.8, t)), 0, 1);
      CK.set([.75, 1.05, -.1], popE(P(3.0, 3.6, t)) * .9, 0);
      TG.set([0, TAG_Y, .6], popE(P(2.6, 3.4, t)), 0, 1);
      bookOpen(Y, .2);
      F(Y.book.f, t, { smile: .4, look: [.3, .2] });
      F(Y.rad.f, t, { smile: .3, look: [-.3, .2] });
    });
    Wd.occ = []; Wd.center = [.1, 1.1];
    Wd.cam = C4(dur,
      HH(truck([-.2, 1.2, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 71),
      HH(punch(pushIn([SX, 1.0, -.4], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .5]), 72),
      HH(insert([.3, 1.3, -.1], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.2, h1: 1.3, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([-.2, 1.2, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (14, good): the medicine bottle with a green cross glides in; notes flow from the radio into the green heart next to it; green check; tag "לצורך רפואי"
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    setVis(Y, { bot: true, hrt: true });
    const notes = Array.from({ length: 4 }, () => note(Wd, 0x1a1a1a));
    const CK = mark3d(Wd, 'check', .7);
    const TG = T2(Wd, 1.7, 'לצורך רפואי', GREENP, .42);
    Wd.on(t => {
      const bx = lerp(2.8, BTL[0], sm(P(0, 2.6, t)));
      Y.bot.position.set(bx, 0, BTL[2]);
      const hs = popE(P(2.6, 3.4, t)) * (1 + .08 * Math.sin(t * 5));
      Y.hrt.scale.setScalar(Math.max(.001, hs));
      emit(notes, RADN, HRT, t, { per: 2.4, len: 1.8, h: .6 });
      CK.set([.5, 2.4, -.3], popE(P(3.2, 3.8, t)) * .9, 0);
      TG.set([0, TAG_Y, .6], popE(P(3.4, 4.2, t)), 0, 1);
      bookOpen(Y, .3);
      F(Y.book.f, t, { smile: .8, look: [.3, .2] });
      F(Y.rad.f, t, { smile: .5, look: [-.5, .2], talk: .5 * talkAmt(t, 86) });
    });
    Wd.occ = []; Wd.center = [.2, 1.1];
    Wd.cam = C4(dur,
      HH(truck([0, 1.2, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 91),
      HH(punch(pushIn([BTL[0], 1.0, -.5], { dur: dur * .25, dist0: 3.2, dist1: 3.0, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .5]), 92),
      HH(insert([BTL[0], 1.3, -.5], { dur: dur * .25, dist0: 2.6, dist1: 2.4, h0: 1.2, h1: 1.3, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 93),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 3.8, dist1: 3.6, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 94));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the book, the song sheet singing and the bottle with the heart, all happy; slow crane. NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    setVis(Y, { song: true, bot: true, hrt: true });
    const notes = Array.from({ length: 3 }, () => note(Wd, 0x1a1a1a));
    const pale = Array.from({ length: 3 }, () => note(Wd, 0xc9d3e6));
    Wd.on(t => {
      emit(notes, RADN, HRT, t, { per: 2.4, len: 1.6, h: .5 });
      emit(pale, BOOKF, [-.2, 2.3, -1.2], t, { per: 2.8, len: 2.2, h: .4 });
      Y.song.g.position.set(SX, .03 * Math.abs(Math.sin(t * 4)), SONG_Z);
      bubbles(Y, t, SX, true);
      Y.hrt.scale.setScalar(1 + .08 * Math.sin(t * 5));
      bookOpen(Y, .3);
      F(Y.book.f, t, { smile: 1, look: [.3, .2] });
      F(Y.song.f, t, { smile: 1, look: [0, .3], talk: .4 * talkAmt(t, 3) });
      F(Y.rad.f, t, { smile: 1, look: [-.4, .2], talk: .4 * talkAmt(t, 4) });
    });
    Wd.occ = []; Wd.center = [0, 1.0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur: dur, dist0: 5.2, dist1: 4.8, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
