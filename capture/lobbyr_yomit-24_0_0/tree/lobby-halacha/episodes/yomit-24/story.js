// yomit-24 story: "שירים בבין המצרים" (halacha yomit 24). Storyboard A in storyboards_v25.md.
// Copied from episodes/yomit-22/story.js (room, tags, chair, ear, camera helpers).
// NO people, NO figures. Adult = a big armchair "גדול"; small child = a toy block "גיל 6"; the radio plays.
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
  const ARM = [-1.1, 0, -1.6];                 // the big armchair "גדול" (the adult)
  const BLK = [0, 0, .1];                      // the toy block "גיל 6" (the child), on its rug
  const RAD = [1.25, .58, -1.1];               // the radio on a small table at the right (table top at y .58)
  const EAR = [-1.1, 1.95, -.9];               // the ear icon in front of the armchair's back
  const HRT = [-2.5, 1.9, -.6], BARP = [-2.5, .6, -.6];   // health heart and its green bar (beat 1)
  const RADN = [1.25, 1.4, -.75];              // where the notes leave the radio
  const TAG_Y = 1.9;                           // beat tags, lower than the frame top (they were cut at the top at 2.3)
  const CLR_FLOOR = 0xb98a5a;
  const BLUEP = ['#dbe9ff', '#14408f', '#2f6ad0'], ROSEP = ['#ffe1ec', '#8a1a4a', '#d9779a'];
  const GREENP = ['#e4f8e6', '#1f6a2a', '#3f9a4a'], WHITEP = ['#ffffff', '#2d3a6b', '#9aa7c4'];
  const REDP = ['#ffe3e3', '#8a1a1a', '#d33b3b'], GREYP = ['#e6e6e6', '#444444', '#8a8a8a'];
  const STEPS = [0, 1, 2, 3, 4, 5].map(i => ({ x: 1.0 + i * .3, h: .22 * (i + 1) }));   // the height ruler (6 steps)
  const LAND = STEPS.map(s => [s.x, s.h, .2]);                                          // where the block stands on each step
  const STOP = [-.35, 1.45, -1.0], BARW = [-.45, 1.35, -1.0];                             // notes stop at the red barrier

  // ---------------------------------------------------------------- tags (same helpers as yomit-22)
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
  // an armchair (the adult "גדול"): a face on the seat front
  function chair(Wd, p, s, c) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); g.scale.setScalar(s); Wd.add(g);
    const seat = box(1.2, .5, 1.0, c); seat.position.set(0, .35, 0); g.add(seat);
    const back = box(1.2, 1.0, .22, c); back.position.set(0, .95, -.4); g.add(back);
    [-.6, .6].forEach(x => { const a = box(.2, .6, 1.0, c); a.position.set(x, .7, 0); g.add(a); });
    return g;
  }
  // the toy block (the child "גיל 6"): a coloured cube with a face on its front; origin = its bottom centre
  function makeBlock(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    const body = box(.7, .7, .7, 0xff7a3a); body.position.y = .35; g.add(body);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .38, .37], seed: 66 });
    return { g, f };
  }
  // a big ear icon (they hear): a flat skin-coloured ear with a darker inner part
  function ear(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const o = ball(.3, 0xf2b8a0); o.scale.set(.7, 1.1, .45); g.add(o);
    const i = ball(.14, 0xc07a68); i.position.z = .08; i.scale.set(.7, 1.1, .5); g.add(i);
    return g;
  }
  // a music note: black head + stem
  function note(Wd, c) {
    const g = new THREE.Group(); Wd.add(g);
    const h = ball(.07, c); g.add(h);
    const s = box(.03, .32, .03, c); s.position.set(.06, .16, 0); g.add(s);
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
  // a low table (a top and one leg)
  function table(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], 0, p[2]); Wd.add(g);
    const top = box(.9, .06, .6, 0x8a5a2a); top.position.y = .55; g.add(top);
    const leg = cyl(.08, .1, .52, 0x6a4a2a); leg.position.y = .27; g.add(leg);
    return g;
  }
  // a dotted "intent" arrow from a to b (grey, empty): dots and a small grey head
  function dotArrow(Wd, a, b, n) {
    const dots = [];
    for (let i = 1; i <= n; i++) { const u = i / (n + 1); const d = ball(.05, 0x8a8a96); d.position.set(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)); Wd.add(d); dots.push(d); }
    const hd = cyl(0, .12, .25, 0x8a8a96); hd.rotation.z = -PI / 2; hd.position.set(b[0] - .1, b[1], b[2]); Wd.add(hd);
    return dots;
  }
  // a glowing disc behind the armchair (faces the camera)
  function glowAt(Wd, p, r, c) {
    const d = cyl(r, r, .03, c); d.rotation.x = PI / 2; d.position.set(p[0], p[1], p[2]); Wd.add(d); return d;
  }
  // notes leave a (the radio) and travel to b one after another, periodically; optional fall after b (the barrier)
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

  // ---------------------------------------------------------------- the living room (fresh per beat)
  function room(Wd) {
    const Y = {};
    const back = box(12, 6, .2, 0xf3e3c8); back.position.set(0, 2.5, -2.4); Wd.add(back);
    const floor = box(12, .1, 10, CLR_FLOOR); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const rug = box(3.6, .02, 2.6, 0xd9b38c); rug.position.set(0, .01, -.1); Wd.add(rug);
    const brug = box(.9, .03, .7, 0xc0584a); brug.position.set(BLK[0], .015, BLK[2]); Wd.add(brug);   // the block's own rug
    table(Wd, RAD);
    const cal = texPlane(2.2, 1.1, drawCal, { cw: 512 }); cal.position.set(0, 2.6, -2.27); Wd.add(cal);
    Y.abaG = chair(Wd, ARM, 1.2, 0x2f5fb8);
    Y.fA = face(Wd, { w: .55, parent: Y.abaG, pos: [0, .7, .52], seed: 85 });
    Y.ear = ear(Wd, EAR);
    Y.rad = makeRadio(Wd);
    Y.blk = makeBlock(Wd);
    Y.T = { arm: T2(Wd, .9, 'גדול', BLUEP, .4), blk: T2(Wd, .9, 'גיל 6', ROSEP, .4) };
    return Y;
  }
  // labels that stay: the adult's label (the block's label is placed by each beat)
  const armLabel = (Y, t) => Y.T.arm.set([ARM[0] - .85, 1.3, -1.0], 1, 0, 1);   // above the armchair's left arm, clear of the beat tags

  // ================================================================ HOOK 0-14: extreme close-up on the radio's face, pull out; notes float out of it; the armchair turns to the radio; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const notes = Array.from({ length: 4 }, () => note(Wd, 0x1a1a1a));
    Wd.on(t => {
      emit(notes, RADN, [-1.0, 2.4, -1.2], t, { per: 2.4, len: 1.8, h: .6 });
      Y.abaG.rotation.y = 1.27 * sm(P(4, 7, t));
      armLabel(Y, t);
      Y.blk.g.position.set(BLK[0], 0, BLK[2]);
      Y.T.blk.set([BLK[0], 1.15, BLK[2] + .6], 1, 0, 1);
      F(Y.rad.f, t, { smile: t > 3 ? .6 : .2, look: [-.3, .2], talk: t > 1 ? .6 * talkAmt(t, 31) : 0 });
      F(Y.fA, t, { smile: .2, look: [t > 4 ? 1 : 0, .2] });
      F(Y.blk.f, t, { smile: .2, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [1.0, 1.0]; Wd.qPos = [RAD[0], RAD[2] + .6];
    Wd.cam = C4(dur,
      HH(pullOut([RAD[0], 1.0, RAD[2]], { dur: dur * .25, dist0: 1.3, dist1: 2.2, h0: .9, h1: 1.1, a0: 4, a1: -4, fov0: 34, fov1: 36 }), 41),
      HH(pullOut([0, 1.0, -.6], { dur: dur * .25, dist0: 3.2, dist1: 6, h0: .9, h1: 1.4, a0: -4, a1: 6, fov0: 38, fov1: 44 }), 42),
      HH(truck([0, 1.0, -.2], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.1, h1: 1.3, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 43),
      HH(punch(pushIn([0, 1.0, -.2], { dur: dur * .25, dist0: 5, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 38 }), [dur * .25 * .6]), 44));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, healthy): the armchair "גדול" in a spotlight; a green heart and a green bar fill up next to it; tag "בריא"
  function s1(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const notes = Array.from({ length: 3 }, () => note(Wd, 0x1a1a1a));
    const GL = glowAt(Wd, [ARM[0], 1.1, -2.2], 1.3, 0xfff1c2);
    const HG = new THREE.Group(); HG.position.set(HRT[0], HRT[1], HRT[2]); Wd.add(HG);
    [-.08, .08].forEach(x => { const b = ball(.1, 0x3fb84a); b.position.set(x, .05, 0); HG.add(b); });
    const dm = box(.16, .16, .05, 0x3fb84a); dm.rotation.z = PI / 4; dm.position.set(0, -.05, 0); HG.add(dm);
    const BGB = box(.26, 1.0, .14, 0xd8d8e0); BGB.position.set(BARP[0], BARP[1] + .5, BARP[2]); Wd.add(BGB);
    const FG = new THREE.Group(); FG.position.set(BARP[0], BARP[1], BARP[2] + .02); Wd.add(FG);
    const fill = box(.22, 1.0, .16, 0x3fb84a); fill.position.y = .5; FG.add(fill);
    const CK = mark3d(Wd, 'check', .45);
    const TB = T2(Wd, 1.0, 'בריא', GREENP, .42);
    Wd.on(t => {
      emit(notes, RADN, [-1.0, 2.4, -1.2], t, { per: 2.6, len: 1.8, h: .6 });
      GL.scale.setScalar(1 + .08 * Math.sin(t * 3));
      HG.scale.setScalar(Math.max(.001, popE(P(1.0, 1.8, t))) * (1 + .08 * Math.sin(t * 5)));
      FG.scale.y = Math.max(.001, sm(P(2.0, 4.0, t)));
      CK.set([HRT[0], 2.0, HRT[2] + .2], popE(P(3.0, 3.6, t)) * .9, 0);
      TB.set([0, TAG_Y, .6], popE(P(1.4, 2.2, t)), 0, 1);
      armLabel(Y, t);
      Y.blk.g.position.set(BLK[0], 0, BLK[2]);
      Y.T.blk.set([BLK[0], 1.15, BLK[2] + .6], 1, 0, 1);
      F(Y.fA, t, { smile: t > 2 ? .7 : .3, look: [0, .3], talk: t > 4 ? .5 * talkAmt(t, 12) : 0 });
      F(Y.rad.f, t, { smile: .4, look: [-.4, .2], talk: .5 * talkAmt(t, 13) });
      F(Y.blk.f, t, { smile: .3, look: [-.5, .2] });
    });
    Wd.occ = []; Wd.center = [-.3, 1.2];
    Wd.cam = C4(dur,
      HH(punch(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), [1.4]), 11),
      HH(pushIn([-1.1, .9, -1.0], { dur: dur * .25, dist0: 5.2, dist1: 4.6, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 12),
      HH(insert([-2.1, 1.5, -.6], { dur: dur * .25, dist0: 4.2, dist1: 4, h0: 1.4, h1: 1.5, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 13),
      HH(orbitShot([-.3, 1.4, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 14));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (14, bad): the notes float toward the armchair's ear; a red barrier stops them, they fall and fade; the radio's volume knob turns to zero; red cross + shock; tag "אסור לשמוע"
  function s2(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const notes = Array.from({ length: 4 }, () => note(Wd, 0x1a1a1a));
    const BAR = box(.08, 1.2, .8, 0xd33b3b); BAR.position.set(BARW[0], BARW[1], BARW[2]); Wd.add(BAR);
    const SH = shock(Wd, 0xff7a7a);
    const CRS = mark3d(Wd, 'cross', .6);
    const TG = T2(Wd, 1.6, 'אסור לשמוע', REDP, .42);
    Wd.on(t => {
      const hit = P(2.0, 2.6, t);
      emit(notes, RADN, STOP, t, { per: 3.0, len: 1.4, h: .4, fall: 1.2 });
      Y.rad.kg.rotation.z = -2.6 * sm(P(.6, 2.2, t));
      BAR.scale.setScalar(1 + .05 * Math.sin(t * 6) * hit);
      SH.set([BARW[0], BARW[1], BARW[2] + .05], hit, 1.0);
      CRS.set([-.35, 2.05, -.8], popE(P(2.6, 3.2, t)) * .9, 0);
      Y.ear.scale.setScalar(1 + .05 * Math.sin(t * 4));
      TG.set([0, TAG_Y, .6], popE(P(1.2, 2.0, t)), 0, 1);
      armLabel(Y, t);
      Y.blk.g.position.set(BLK[0], 0, BLK[2]);
      Y.T.blk.set([BLK[0], 1.15, BLK[2] + .6], 1, 0, 1);
      F(Y.rad.f, t, { smile: -.3, look: [-.5, .2], talk: t < 3 ? .6 * talkAmt(t, 22) : 0 });
      F(Y.fA, t, { smile: -.5, look: [0, .3], surprise: hit, talk: t > 2 ? .4 * talkAmt(t, 23) : 0 });
      F(Y.blk.f, t, { smile: 0, look: [-.5, .2] });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(crane([0, 1.8, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.0, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 21),
      HH(punch(pushIn([-.2, 1.2, .2], { dur: dur * .25, dist0: 6, dist1: 5.6, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 22),
      HH(insert([-.4, 1.6, -1.0], { dur: dur * .25, dist0: 4.2, dist1: 4, h0: 1.6, h1: 1.8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 23),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -14, a1: 10, fov0: 44, fov1: 44 }), 24));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (14, neutral): the toy block "גיל 6" hops up a height ruler; the steps light green one by one and it stops on the 6th; tag "עד גיל שש"
  function s3(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const steps = STEPS.map(s => { const b = box(.26, s.h, .45, 0xb0b8c8); b.position.set(s.x, s.h / 2, .2); Wd.add(b); return b; });
    STEPS.forEach((s, i) => T2(Wd, .24, String(i + 1), WHITEP, .24).set([s.x, s.h + .12, .75], 1, 0, 1));
    const TG = T2(Wd, 1.2, 'עד גיל שש', BLUEP, .42);
    const blockAt = t => {
      let from = [BLK[0], 0, BLK[2]];
      for (let i = 0; i < LAND.length; i++) {
        const u = (t - (1.0 + i * 1.2)) / .9;
        if (u < 0) return from;
        if (u < 1) return arcV(from, LAND[i], sm(u), .7);
        from = LAND[i];
      }
      return from;
    };
    Wd.on(t => {
      const p = blockAt(t);
      Y.blk.g.position.set(p[0], p[1], p[2]);
      steps.forEach((b, i) => b.material.color.setHex(t > 1.9 + i * 1.2 ? 0x3fb84a : 0xb0b8c8));
      Y.T.blk.set([p[0], p[1] + 1.1, p[2] + .4], 1, 0, 1);
      TG.set([0, TAG_Y, .6], popE(P(2.0, 2.8, t)), 0, 1);
      armLabel(Y, t);
      F(Y.blk.f, t, { smile: t > 7 ? 1 : .4, look: [1, .2], talk: t > 6 ? .6 * talkAmt(t, 44) : 0 });
      F(Y.fA, t, { smile: .2, look: [0, .2] });
      F(Y.rad.f, t, { smile: .3, look: [-.3, .2] });
    });
    Wd.occ = []; Wd.center = [1.0, 1.0];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 31),
      HH(punch(pushIn([1.0, 1.2, .2], { dur: dur * .25, dist0: 6, dist1: 5.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 32),
      HH(insert([1.8, 1.4, .2], { dur: dur * .25, dist0: 4.4, dist1: 4.2, h0: 1.2, h1: 1.4, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 33),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 34));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (16, good): notes dance around the toy block, it bounces to the rhythm; green check + sparkles; tag "מותר"
  function s4(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const notes = Array.from({ length: 6 }, () => note(Wd, 0x1a1a1a));
    const sp = Array.from({ length: 6 }, () => { const b = ball(.05, 0xffe36a); b.visible = false; Wd.add(b); return b; });
    const CK = mark3d(Wd, 'check', .9);
    const TG = T2(Wd, 1.0, 'מותר', GREENP, .42);
    const cx = BLK[0], cz = BLK[2];
    Wd.on(t => {
      const bounce = Math.abs(Math.sin(t * 6)) * .25;
      Y.blk.g.position.set(cx, bounce, cz);
      Y.blk.g.rotation.z = .08 * Math.sin(t * 6);
      notes.forEach((n, i) => {
        const a = t * 1.8 + i * PI / 3;
        n.visible = true;
        n.position.set(cx + 1.0 * Math.cos(a), 1.1 + .3 * Math.sin(t * 3 + i), cz + .6 * Math.sin(a));
        n.rotation.z = .3 * Math.sin(t * 6 + i);
        n.scale.setScalar(Math.max(.001, popE(P(.5 + i * .2, 1.0 + i * .2, t))));
      });
      sp.forEach((b, k) => {
        const a = k / 6 * 2 * PI + t, s = popE(P(6, 6.6, t));
        b.visible = s > .01; b.position.set(cx + Math.cos(a) * .75, 1.1 + Math.sin(a) * .45, cz + .3);
        b.scale.setScalar(Math.max(.001, s * (.8 + .4 * Math.abs(Math.sin(t * 4 + k)))));
      });
      CK.set([cx, 1.9, cz + .3], popE(P(7, 7.8, t)) * .9, 0);
      TG.set([0, TAG_Y, .6], popE(P(6.6, 7.4, t)), 0, 1);
      armLabel(Y, t);
      Y.T.blk.set([cx, 1.3, cz + .3], 1, 0, 1);
      F(Y.blk.f, t, { smile: 1, look: [0, .2], talk: .6 * talkAmt(t, 47) });
      F(Y.rad.f, t, { smile: .6, look: [-.8, .2], talk: .5 * talkAmt(t, 48) });
      F(Y.fA, t, { smile: .1, look: [.6, .2] });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 61),
      HH(punch(pushIn([0, 1.2, .2], { dur: dur * .25, dist0: 6, dist1: 5.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 62),
      HH(insert([0, 1.6, .2], { dur: dur * .25, dist0: 4.2, dist1: 4, h0: 1.4, h1: 1.6, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 63),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 64));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (14, neutral): the radio plays for the block; the armchair turns away from the radio; notes drift past behind it; a grey dotted "intent" arrow stays empty; tag "ברקע"
  function s5(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const toBlk = Array.from({ length: 3 }, () => note(Wd, 0x1a1a1a));
    const drift = Array.from({ length: 3 }, () => note(Wd, 0x1a1a1a));
    dotArrow(Wd, [ARM[0] + .5, 1.1, -.9], [RAD[0] - .5, 1.1, -.9], 7);
    const TG = T2(Wd, 1.5, 'ברקע', BLUEP, .42);
    Wd.on(t => {
      emit(toBlk, RADN, [BLK[0] + .2, 1.0, .2], t, { per: 2.4, len: 1.6, h: .5 });
      emit(drift, RADN, [-2.6, 1.3, -2.2], t, { per: 3.0, len: 2.2, h: .4 });
      Y.abaG.rotation.y = 2.6;
      armLabel(Y, t);
      Y.blk.g.position.set(BLK[0], .05 * Math.abs(Math.sin(t * 5)), BLK[2]);
      Y.T.blk.set([BLK[0], 1.15, BLK[2] + .6], 1, 0, 1);
      TG.set([0, TAG_Y, .6], popE(P(3.0, 3.8, t)), 0, 1);
      F(Y.blk.f, t, { smile: .9, look: [1, .2], talk: .4 * talkAmt(t, 73) });
      F(Y.rad.f, t, { smile: .6, look: [-.5, .2], talk: .6 * talkAmt(t, 74) });
      F(Y.fA, t, { smile: .1, look: [0, .2] });
    });
    Wd.occ = []; Wd.center = [0, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 71),
      HH(punch(pushIn([-.4, 1.2, .2], { dur: dur * .25, dist0: 6, dist1: 5.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 72),
      HH(insert([-.7, 1.5, -.9], { dur: dur * .25, dist0: 4.2, dist1: 4, h0: 1.5, h1: 1.6, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 73),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 74));
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (14, good): the armchair's ear stays closed (turned away); the grey intent arrow shows a small "0"; green check for the armchair; tag "בלי כוונה"
  function s6(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const toBlk = Array.from({ length: 3 }, () => note(Wd, 0x1a1a1a));
    const drift = Array.from({ length: 3 }, () => note(Wd, 0x1a1a1a));
    dotArrow(Wd, [ARM[0] + .5, 1.1, -.9], [RAD[0] - .5, 1.1, -.9], 7);
    const ZERO = T2(Wd, .4, '0', GREYP, .4);
    const CK = mark3d(Wd, 'check', .8);
    const TG = T2(Wd, 1.3, 'בלי כוונה', GREENP, .42);
    Wd.on(t => {
      emit(toBlk, RADN, [BLK[0] + .2, 1.0, .2], t, { per: 2.4, len: 1.6, h: .5 });
      emit(drift, RADN, [-2.6, 1.3, -2.2], t, { per: 3.0, len: 2.2, h: .4 });
      Y.ear.rotation.y = 1.4;
      Y.abaG.rotation.y = 0;
      armLabel(Y, t);
      ZERO.set([.2, 1.6, -.9], popE(P(1.0, 1.6, t)), 0, 1);
      CK.set([ARM[0] - .9, 1.6, -.9], popE(P(2.4, 3.0, t)) * .9, 0);
      TG.set([0, TAG_Y, .6], popE(P(3.4, 4.2, t)), 0, 1);
      Y.blk.g.position.set(BLK[0], .05 * Math.abs(Math.sin(t * 5)), BLK[2]);
      Y.T.blk.set([BLK[0], 1.15, BLK[2] + .6], 1, 0, 1);
      F(Y.fA, t, { smile: .9, look: [0, .2] });
      F(Y.blk.f, t, { smile: .6, look: [1, .2] });
      F(Y.rad.f, t, { smile: .5, look: [-.5, .2], talk: .5 * talkAmt(t, 86) });
    });
    Wd.occ = []; Wd.center = [-.3, 1.2];
    Wd.cam = C4(dur,
      HH(truck([0, 1.4, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -8, a1: 8, fov0: 46, fov1: 44 }), 91),
      HH(punch(pushIn([-.6, 1.2, .2], { dur: dur * .25, dist0: 6, dist1: 5.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .25 * .5]), 92),
      HH(insert([-.8, 1.3, -.6], { dur: dur * .25, dist0: 4.2, dist1: 4, h0: 1.3, h1: 1.4, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 93),
      HH(orbitShot([0, 1.2, -.4], { dur: dur * .25, dist0: 5.2, dist1: 4.8, h0: 1.2, h1: 1.4, a0: -12, a1: 10, fov0: 44, fov1: 44 }), 94));
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the radio and the toy block happy on one side, the armchair calm on the other, the calendar behind; slow crane. NO red cross.
  function answer(dur) {
    const Wd = mkWorld({}); const Y = room(Wd);
    const notes = Array.from({ length: 3 }, () => note(Wd, 0x1a1a1a));
    Wd.on(t => {
      emit(notes, RADN, [BLK[0] + .2, 1.0, .2], t, { per: 2.4, len: 1.6, h: .5 });
      Y.blk.g.position.set(BLK[0], .03 * Math.abs(Math.sin(t * 4)), BLK[2]);
      Y.abaG.rotation.y = 0;
      armLabel(Y, t);
      Y.T.blk.set([BLK[0], 1.15, BLK[2] + .6], 1, 0, 1);
      F(Y.blk.f, t, { smile: 1, look: [0, .2], talk: .4 * talkAmt(t, 3) });
      F(Y.rad.f, t, { smile: 1, look: [-.4, .2], talk: .4 * talkAmt(t, 4) });
      F(Y.fA, t, { smile: .2, look: [0, .2], talk: .3 * talkAmt(t, 5) });
    });
    Wd.occ = []; Wd.center = [0, 1.0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([0, 1.6, -1.0], { dur: dur, dist0: 5.2, dist1: 4.8, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
