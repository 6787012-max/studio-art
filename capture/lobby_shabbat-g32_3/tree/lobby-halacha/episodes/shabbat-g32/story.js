// shabbat-g32 story (11/11/2026) - lechem mishneh: lechatchila only hamotzi on bread; if only a cake, use it and eat from it in the meal. Storyboard: storyboards_v14.md section C.
// Objects only, no people: two challot under white covers (faces on the covers), a cake on a plate (face), a bread box (face), a knife + slice, a meter.
// Built from shabbat-g31 (camera, face, tag helpers kept).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, lowHero, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const bump = (t, a, b) => sm(P(a, a + .4, t)) * (1 - sm(P(b - .4, b, t)));
  const TOPY = .8, NUM = .6, TAG_Y = 1.65;
  const CH1 = [-.7, TOPY, -.1], CH2 = [.6, TOPY, -.1];   // challah slots
  const MZ = [-1.7, TOPY, .15];                           // cake home (plate)
  const FR = [.6, TOPY, .95];                             // front spot: the cake's bad try, later the slice plate
  const BB = [2.0, TOPY, -.5];                            // bread box (right, back)
  const MET = [0, 1.5, -.6];                              // meter centre (back, above the table)
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], pink: ['#ffe0ec', '#8a1a4a', '#e0508a'] };

  // ---------------------------------------------------------------- world: morning daylight, white Shabbat table, window on the back wall
  const kW = () => mkWorld({ skyTop: 0x9fd6f2, skyBottom: 0xfff1d8, fogColor: 0xf5ebd8, fogNear: 24, fogFar: 98, hemi: 1.1, sun: 1.0, sunPos: [-9, 22, 12], shadowExt: 10 });
  function sceneSet(Wd) {
    Wd.add(box(10, 5, .3, 0xfbeed8, { pos: [0, 2.5, -2.0] }));                       // warm back wall
    Wd.add(box(2.7, 1.9, .08, 0x6b4a2e, { pos: [-2.0, 2.4, -1.78] }));               // window frame
    Wd.add(box(2.3, 1.5, .04, 0xbfe9ff, { pos: [-2.0, 2.4, -1.72], ink: false }));   // daylight pane
    Wd.add(box(.05, 1.5, .05, 0x6b4a2e, { pos: [-2.0, 2.4, -1.68] }));                // mullion
    const sun = glowAt(Wd.scene, 2.4, 0xfff0b0, .3); sun.position.set(-1.6, 2.2, -1.5);
    Wd.add(box(10, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                    // floor (top at 0)
    Wd.add(box(5.0, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));               // white Shabbat tablecloth
    Wd.add(box(5.0, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));           // cloth drape
    for (const x of [-2.3, 2.3]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
  }

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g31)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, st) => (c, W, H) => {
    c.fillStyle = st[0]; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = st[2]; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = st[1]; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const tag = (Wd, text, style, w) => bb(Wd, w || 1.3, .5, drawTag(text, ST[style]), (w || 1.3) > 1.6 ? 900 : 520);

  // ---------------------------------------------------------------- cake on a plate (origin = plate centre on the table); face on the cake front
  function mkPlate(Wd, pos, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]);
    g.add(cyl(.6, .6, .04, 0xffffff, { pos: [0, .02, 0] }));                          // plate
    g.add(cyl(.3, .3, .26, 0xf2c9a0, { pos: [-.12, .17, 0] }));                       // cake
    g.add(cyl(.32, .32, .05, 0xff8fb0, { pos: [-.12, .305, 0] }));                    // pink frosting
    for (let i = 0; i < 6; i++) { const a = i * 1.1; g.add(ball(.022, 0x7a4a24, { pos: [-.12 + .24 * Math.cos(a), .34, .24 * Math.sin(a)], ink: false })); } // crumbs
    for (let i = 0; i < 3; i++) g.add(cyl(.13, .13, .05, 0xb8783a, { pos: [.32, .065 + i * .05, .05] }));  // cookie stack
    g.add(ball(.02, 0x3a2010, { pos: [.32, .19, .05], ink: false }));                 // chocolate chip
    const f = face(Wd, { w: .3, parent: g, pos: [-.12, .16, .33], seed: seed || 5 });
    return { g, f };
  }

  // ---------------------------------------------------------------- challah: golden loaf on a wooden board; white cloth cover (gold edge) drapes the middle; face on the cover front; cover lifts
  function mkChal(Wd, pos, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]);
    g.add(box(.7, .03, .5, 0x8a6a4a, { pos: [0, .015, 0] }));                         // wooden board
    const loaf = ball(.13, 0xd08a34, { pos: [0, .03 + .15, 0] }); loaf.scale.set(2.6, .9, 1.0); g.add(loaf);   // challah loaf (elongated)
    for (const x of [-.18, 0, .18]) { const b = ball(.05, 0xa8581e, { pos: [x, .03 + .27, 0], ink: false }); b.scale.set(1, .6, 1.4); g.add(b); } // braid bumps
    const cv = new THREE.Group(); cv.position.set(0, .03, 0); g.add(cv);             // cover pivot (bottom back edge)
    const dome = ball(.2, 0xfbf8f0, { pos: [0, .09, 0] }); dome.scale.set(1.3, .45, .85); cv.add(dome);   // white cloth
    const edge = ball(.2, 0xd9a63a, { pos: [0, .01, 0], ink: false }); edge.scale.set(1.34, .1, .87); cv.add(edge); // gold edge
    const f = face(Wd, { w: .22, parent: cv, pos: [0, .09, .18], seed: seed || 6 });
    return { g, f, setOpen(o) { cv.position.y = .03 + .05 * o; cv.rotation.x = -.2 * o; }, setX(x) { g.position.x = x; } };
  }

  // ---------------------------------------------------------------- bread box (back right): body with a face on the front, lid hinged at the back
  function mkBread(Wd, pos) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]);
    g.add(box(.7, .4, .45, 0x8a5a2e, { pos: [0, .2, 0] }));
    const lp = new THREE.Group(); lp.position.set(0, .4, -.22); g.add(lp);
    lp.add(box(.72, .05, .47, 0x6b4a2e, { pos: [0, .025, .22] }));
    const f = face(Wd, { w: .24, parent: g, pos: [0, .2, .24], seed: 8 });
    return { g, f, setOpen(o) { lp.rotation.x = -1.3 * o; } };
  }

  // ---------------------------------------------------------------- dotted outline of a missing item (a ring of small dots on the table)
  function mkSlot(Wd, pos) {
    const ds = []; for (let i = 0; i < 10; i++) { const d = ball(.025, 0xe0a030, { ink: false }); Wd.add(d); ds.push(d); }
    return { set(s) { ds.forEach((d, i) => { const a = i * 2 * PI / 10; d.position.set(pos[0] + .45 * Math.cos(a), TOPY + .02, pos[2] + .32 * Math.sin(a)); d.scale.setScalar(Math.max(.001, s)); }); } };
  }

  // ---------------------------------------------------------------- meter (back): grey track + gold fill that grows from the left
  function mkMeter(Wd) {
    Wd.add(box(1.5, .2, .1, 0xd8d0c0, { pos: [MET[0], MET[1], MET[2]] }));
    const fill = box(1.4, .14, .12, 0xf0b030, { pos: [MET[0], MET[1], MET[2] + .02], ink: false }); Wd.add(fill);
    return { set(u) { fill.scale.x = Math.max(.001, u); fill.position.x = MET[0] - .7 + .7 * u; } };
  }

  // ---------------------------------------------------------------- slice of cake (origin = bottom centre)
  function mkSlice(Wd, pos) {
    const sl = new THREE.Group(); Wd.add(sl); sl.position.set(pos[0], pos[1], pos[2]);
    sl.add(box(.2, .24, .18, 0xf2c9a0, { pos: [0, .12, 0] })); sl.add(box(.21, .05, .19, 0xff8fb0, { pos: [0, .26, 0] }));
    return sl;
  }

  // ---------------------------------------------------------------- small dots (sparkle ring)
  function mkDots(Wd, n, col, r) { const ds = []; for (let i = 0; i < n; i++) { const d = ball(r, col, { ink: false }); Wd.add(d); ds.push(d); } return ds; }

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up of the cake's face next to one challah, pull out; dotted outline where the second loaf should be; "?" above it
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const pl = mkPlate(Wd, MZ, 5), c1 = mkChal(Wd, CH1, 6), slot = mkSlot(Wd, CH2);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      slot.set(.85 + .15 * Math.sin(t * 3));
      qT.set([CH2[0], 1.45 + .05 * Math.sin(t * 2), CH2[2]], popE(P(1.0, 1.8, t)) * NUM * 1.3, .05 * Math.sin(t * 4), 1);
      pl.f.set(t, { talk: t > 1 ? .5 * talkAmt(t, 5) : 0, smile: -.5, look: [Math.sin(t * .9) * .3, 0] });
      c1.f.set(t, { talk: 0, smile: .1, look: [.3, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [pl.g]; Wd.qPos = [CH2[0], CH2[2]]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([MZ[0] - .12, MZ[1] + .3, MZ[2] + .3], { dur: 3.6, dist0: 1.0, dist1: 1.8, h0: .3, h1: .4, a0: -10, a1: 8, fov0: 30, fov1: 36 }), 1)],
      [4.4, HH(punch(truck([-.55, 1.2, 0],{ dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.2, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28: the second challah slides in under its cover; the dotted outline fades; counter "2"; gold tags "המוציא" pop over both
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const pl = mkPlate(Wd, MZ, 5), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7), slot = mkSlot(Wd, CH2);
    const h1 = tag(Wd, 'המוציא', 'gold', 1.4), h2 = tag(Wd, 'המוציא', 'gold', 1.4), cnt = tag(Wd, '2', 'blue', .8);
    Wd.on(t => {
      const sl = sm(P(.4, 1.8, t));
      c2.setX(lerp(CH2[0] + 1.8, CH2[0], sl)); c2.setOpen(.35 * bump(t, 2.0, 3.6));
      slot.set(1 - sl);
      h1.set([CH1[0], TAG_Y, .3], popE(P(.5, 1.2, t)) * NUM, .02 * Math.sin(t * 1.7));
      h2.set([CH2[0], TAG_Y, .3], popE(P(1.8, 2.6, t)) * NUM, .02 * Math.sin(t * 1.7));
      cnt.set([0, TAG_Y + .1, -.3], popE(P(2.6, 3.2, t)) * NUM, 0);
      c1.f.set(t, { talk: t > 3 ? .5 * talkAmt(t, 6) : 0, smile: sm(P(.5, 1.5, t)) * .8, look: [.3, 0] });
      c2.f.set(t, { talk: t > 3.5 ? .5 * talkAmt(t, 7) : 0, smile: sm(P(2.6, 3.4, t)) * .8, look: [-.3, 0] });
      pl.f.set(t, { talk: 0, smile: .1, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [h1.g, h2.g, cnt.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 4)],
      [4.0, HH(punch(pushIn([0, 1.2, .3], { dur: 4.0, dist0: 3.6, dist1: 3.2, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [1.8]), 5)],
      [3.5, HH(punch(insert([CH2[0], 1.1, .2], { dur: 3.5, dist0: 2.7, dist1: 2.6, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [2.6]), 6)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 7)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (bad): the cake jumps toward the front spot (the dotted outline) and wants to be the bread; its pink tag "מזונות" pulses; red cross; tag "לכתחילה"
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const pl = mkPlate(Wd, MZ, 5), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7), slot = mkSlot(Wd, FR);
    const mT = tag(Wd, 'מזונות', 'pink', 1.2), lT = tag(Wd, 'לכתחילה', 'orange', 1.4);
    const cr = mark3d(Wd, 'cross', .8), sk = shock(Wd, 0xff6060);
    Wd.on(t => {
      const u = sm(P(1.2, 3.0, t)), hp = Math.sin(PI * u);
      const cx = lerp(MZ[0], FR[0], u), cz = lerp(MZ[2], FR[2], u), cy = TOPY + .55 * hp;
      pl.g.position.set(cx, cy, cz);
      slot.set(sm(P(.2, 1.0, t)));
      const bad = P(3.4, 4.0, t);
      mT.set([cx - .1, TAG_Y, cz], popE(P(.6, 1.2, t)) * NUM * (1 + .08 * Math.sin(t * 6)), .03 * Math.sin(t * 2));
      cr.set([cx + .45, 1.3, cz + .2], popE(bad) * .9, .1 * Math.sin(t * 3));
      sk.set([cx + .45, 1.3, cz + .2], P(3.4, 4.4, t), 1.0);
      lT.set([-1.1, TAG_Y + .15, .3], popE(P(4.2, 4.9, t)) * NUM, 0);
      pl.f.set(t, { talk: t > 2 ? .5 * talkAmt(t, 5) : 0, smile: -.6 * sm(P(2.8, 3.4, t)), surprise: bump(t, 3.2, 4.8), look: [0, 0] });
      c1.f.set(t, { talk: 0, smile: .1, look: [.4, 0] });
      c2.f.set(t, { talk: 0, smile: .2, look: [.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [mT.g, lT.g, cr.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.2, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 8)],
      [4.0, HH(punch(pushIn([.2, 1.2, .5], { dur: 4.0, dist0: 3.6, dist1: 3.0, h0: .35, h1: .3, a0: 10, a1: -4, fov0: 42, fov1: 38 }), [3.6]), 9)],
      [3.5, HH(punch(insert([FR[0], 1.1, FR[2]], { dur: 3.5, dist0: 2.8, dist1: 2.6, h0: .2, h1: .25, a0: -6, a1: 6, fov0: 36, fov1: 34 }), [4.2]), 10)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 11)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (good): the cake slides back to its plate along a dotted arc; the challah cover lifts; both gold tags glow; green check between them
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const pl = mkPlate(Wd, FR, 5), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7);
    const h1 = tag(Wd, 'המוציא', 'gold', 1.4), h2 = tag(Wd, 'המוציא', 'gold', 1.4), chk = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      const u = sm(P(.4, 2.4, t)), hp = Math.sin(PI * u);
      pl.g.position.set(lerp(FR[0], MZ[0], u), TOPY + .45 * hp, lerp(FR[2], MZ[2], u));
      c2.setOpen(.35 * sm(P(1.0, 2.0, t)));
      const glow = 1 + .06 * Math.sin(t * 5);
      h1.set([CH1[0], TAG_Y, .3], NUM * glow, .02 * Math.sin(t * 1.7));
      h2.set([CH2[0], TAG_Y, .3], NUM * glow, .02 * Math.sin(t * 1.7));
      chk.set([0, 1.15, .3], popE(P(2.6, 3.4, t)) * .9, .04 * Math.sin(t * 3));
      sk.set([0, 1.15, .3], P(2.6, 3.6, t), 1.0);
      pl.f.set(t, { talk: t > 4 ? .3 * talkAmt(t, 5) : 0, smile: .2 + .5 * sm(P(3.0, 3.8, t)), look: [0, 0] });
      c1.f.set(t, { talk: 0, smile: .8, look: [-.2, 0] });
      c2.f.set(t, { talk: t > 3 ? .5 * talkAmt(t, 7) : 0, smile: .8, look: [-.2, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [h1.g, h2.g, chk.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 12)],
      [4.0, HH(punch(pushIn([0, 1.2, .2], { dur: 4.0, dist0: 3.4, dist1: 3.0, h0: .25, h1: .3, a0: -12, a1: 6, fov0: 40, fov1: 38 }), [3.2]), 13)],
      [3.5, HH(punch(insert([CH2[0], 1.1, .1], { dur: 3.5, dist0: 2.6, dist1: 2.5, h0: .15, h1: .2, a0: 12, a1: -6, fov0: 36, fov1: 34 }), [1.2]), 14)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 15)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (bad): new set-up - one challah is gone, only the cake is left; the bread box opens, empty, sad face; the cake slides over an arc into the slot; gentle tag "אין לו אלא עוגה"
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const pl = mkPlate(Wd, MZ, 5), c1 = mkChal(Wd, CH1, 6), br = mkBread(Wd, BB);
    const yT = tag(Wd, 'אין לו אלא עוגה', 'gold', 2.0);
    Wd.on(t => {
      const u = sm(P(.6, 2.6, t)), hp = Math.sin(PI * u);
      pl.g.position.set(lerp(MZ[0], CH2[0], u), TOPY + .6 * hp, lerp(MZ[2], CH2[2], u));
      br.setOpen(sm(P(.4, 1.4, t)));
      br.f.set(t, { talk: t > 2 ? .5 * talkAmt(t, 8) : 0, smile: -.6, look: [0, .2] });
      yT.set([-.4, TAG_Y, .3], popE(P(2.8, 3.6, t)) * NUM, .02 * Math.sin(t * 1.5));
      pl.f.set(t, { talk: t > 3 ? .4 * talkAmt(t, 5) : 0, smile: .2 + .5 * sm(P(3.0, 3.8, t)), look: [.3, 0] });
      c1.f.set(t, { talk: 0, smile: .4, look: [.3, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [yT.g, br.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 16)],
      [4.0, HH(punch(pushIn([1.0, 1.2, .2], { dur: 4.0, dist0: 3.8, dist1: 3.4, h0: .35, h1: .3, a0: 10, a1: -4, fov0: 40, fov1: 38 }), [1.4]), 17)],
      [3.5, HH(punch(insert([BB[0], 1.1, BB[2]], { dur: 3.5, dist0: 2.9, dist1: 2.8, h0: .2, h1: .25, a0: -10, a1: 10, fov0: 36, fov1: 34 }), [2.4]), 18)],
      [3.0, HH(lowHero([-.2, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 19)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-84 (neutral): a knife (a flat box) comes down and cuts a slice from the cake; the slice hops onto the front plate; the meter "בתוך הסעודה" fills
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const pl = mkPlate(Wd, CH2, 5), c1 = mkChal(Wd, CH1, 6);
    const knife = box(.05, .32, .44, 0xcfd6de, { pos: [CH2[0] - .1, TOPY + 1.6, CH2[2]] }); Wd.add(knife);
    Wd.add(cyl(.22, .22, .03, 0xffffff, { pos: [FR[0], TOPY + .015, FR[2]] }));   // front plate
    const sl = mkSlice(Wd, [CH2[0] - .1, TOPY + .3, CH2[2]]); sl.visible = false;
    const meter = mkMeter(Wd), mT = tag(Wd, 'בתוך הסעודה', 'gold', 1.8);
    Wd.on(t => {
      const down = sm(P(.8, 1.6, t)), up = sm(P(2.2, 3.0, t));
      const h = clamp(1 - down + up, 0, 1);
      knife.position.y = TOPY + .42 + 1.2 * h;
      sl.visible = t > 1.6;
      const hu = sm(P(1.8, 3.6, t));
      sl.position.set(lerp(CH2[0] - .1, FR[0], hu), lerp(TOPY + .3, TOPY + .03, hu) + .4 * Math.sin(PI * hu), lerp(CH2[2], FR[2], hu));
      meter.set(sm(P(3.4, 5.6, t)));
      mT.set([MET[0], MET[1] + .3, MET[2]], popE(P(.6, 1.4, t)) * NUM, 0);
      pl.f.set(t, { talk: t > 4 ? .4 * talkAmt(t, 5) : 0, smile: .3, look: [.3, 0] });
      c1.f.set(t, { talk: 0, smile: .5, look: [.4, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [mT.g, pl.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 20)],
      [4.0, HH(punch(pushIn([CH2[0], 1.2, 0], { dur: 4.0, dist0: 3.6, dist1: 3.2, h0: .3, h1: .3, a0: 10, a1: -6, fov0: 42, fov1: 40 }), [1.8]), 21)],
      [3.5, HH(punch(insert([FR[0], 1.1, FR[2]], { dur: 3.5, dist0: 2.8, dist1: 2.6, h0: .2, h1: .25, a0: -12, a1: 8, fov0: 36, fov1: 34 }), [3.6]), 22)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -12, a1: -4, fov0: 42, fov1: 40 }), 23)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 84-98 (good): the cake's pink tag "מזונות" spins out and the gold "המוציא" spins in; tag "קובע סעודה"; green check; sparkle ring; the cake smiles proudly
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const pl = mkPlate(Wd, CH2, 5), c1 = mkChal(Wd, CH1, 6);
    Wd.add(cyl(.22, .22, .03, 0xffffff, { pos: [FR[0], TOPY + .015, FR[2]] }));
    mkSlice(Wd, [FR[0], TOPY + .03, FR[2]]);
    const mT = tag(Wd, 'מזונות', 'pink', 1.2), gT = tag(Wd, 'המוציא', 'gold', 1.2), kT = tag(Wd, 'קובע סעודה', 'green', 1.8);
    const chk = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a);
    const ring = mkDots(Wd, 10, 0xffd166, .028);
    Wd.on(t => {
      // real flip around Y: 0 -> PI over 0.8 s; pink face shows until PI/2, gold after (x-scale = |cos|)
      const th = PI * sm(P(2.0, 2.8, t)), fl = Math.max(.001, Math.abs(Math.cos(th)));
      const tp = [CH2[0] - .1, TAG_Y, CH2[2]];
      const showPink = th < PI / 2;
      mT.set(tp, NUM, 0, showPink ? 1 : 0); mT.g.children[0].scale.x = fl;
      gT.set(tp, NUM, 0, showPink ? 0 : 1); gT.g.children[0].scale.x = fl;
      kT.set([1.45, TAG_Y, .3], popE(P(3.4, 4.2, t)) * NUM, .02 * Math.sin(t * 1.3));
      chk.set([1.2, 1.2, .3], popE(P(4.0, 4.8, t)) * .9, .04 * Math.sin(t * 3));
      sk.set([CH2[0] - .1, 1.2, CH2[2]], P(3.0, 4.2, t), 1.0);
      const rs = popE(P(3.0, 3.6, t));
      ring.forEach((d, i) => {
        const a = i * 2 * PI / 10 + t * 1.2;
        d.position.set(CH2[0] - .1 + .4 * Math.cos(a), TOPY + .5 + .3 * Math.sin(a), CH2[2] + .3);
        d.scale.setScalar(Math.max(.001, rs * (.9 + .1 * Math.sin(t * 5 + i))));
      });
      pl.f.set(t, { talk: t > 3 ? .5 * talkAmt(t, 5) : 0, smile: sm(P(2.6, 3.6, t)), look: [0, 0] });
      c1.f.set(t, { talk: 0, smile: .9, look: [.3, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [mT.g, gT.g, kT.g, chk.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.2, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 24)],
      [4.0, HH(punch(pushIn([CH2[0], 1.2, 0], { dur: 4.0, dist0: 3.6, dist1: 3.2, h0: .3, h1: .3, a0: 10, a1: -6, fov0: 42, fov1: 40 }), [3.2]), 25)],
      [3.5, HH(punch(insert([CH2[0] - .1, 1.1, .3], { dur: 3.5, dist0: 2.7, dist1: 2.6, h0: .2, h1: .25, a0: -14, a1: 8, fov0: 36, fov1: 34 }), [2.4]), 26)],
      [3.0, HH(pullOut([0, 1.3, 0], { dur: 3.0, dist0: 3.4, dist1: 4.6, h0: .4, h1: .8, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 27)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the table in sunlight; one challah on the left and the cake on the right, both smiling; slow crane over the middle
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const c1 = mkChal(Wd, [-1.8, TOPY, -.1], 6), pl = mkPlate(Wd, [1.9, TOPY, .3], 5);
    c1.setOpen(.35);
    Wd.on(t => {
      c1.f.set(t, { talk: .3 * talkAmt(t, 6), smile: 1, look: [0, 0] });
      pl.f.set(t, { talk: .3 * talkAmt(t, 5), smile: 1, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
