// shabbat-g31 story (10/11/2026) - kiddush on mezonot in the morning, then the bread meal: lechatchila kiddush again (hiddur mitzva, not chiyuv). Storyboard: storyboards_v13.md section C.
// Objects only, no people: silver kiddush cup, cake + cookies plate (mezonot), two challot under white cloth covers (faces on the covers), timeline bar (boker -> seuda), a balance (chiyuv / hiddur).
// Built from shabbat-g30 (camera, face, tag and bar helpers kept).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, crane, lowHero, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TOPY = .8, OS = 1.5, NUM = .6;
  const BAR_Y = 1.25, BAR_Z = .3, TAG_Y = 1.65;   // lowered: tags stay under the top HUD band
  const BL = -.9, BR = .9;                         // bar segment centres (bar is shorter so its tags stay in frame)
  const MZ = [-1.5, TOPY, .15];                    // cake + cookies plate ("mezonot")
  const CH1 = [1.2, TOPY, -.1], CH2 = [1.95, TOPY, -.1];   // two challot
  const CUP0 = [0, TOPY, 0];
  const BAL = [.1, TOPY, 1.0], BAL_S = 1.2;        // balance (chiyuv / hiddur), beat 6 only
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'] };
  const bump = (t, a, b) => sm(P(a, a + .4, t)) * (1 - sm(P(b - .4, b, t)));

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

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g30)
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

  // ---------------------------------------------------------------- silver kiddush cup (origin = foot centre on the table, scaled OS)
  function mkCup(Wd, pos, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(OS);
    const sil = 0xd6dce4, dark = 0xb4bcc7;
    g.add(cyl(.13, .13, .03, dark, { pos: [0, .015, 0] }));
    g.add(cyl(.035, .035, .1, dark, { pos: [0, .08, 0] }));
    g.add(cyl(.2, .14, .2, sil, { pos: [0, .23, 0] }));
    const wine = cyl(.12, .12, 1, 0x7a0c1c, { pos: [0, .14, 0], ink: false }); g.add(wine);
    const f = face(Wd, { w: .2, parent: g, pos: [0, .25, .2], seed: seed || 1 });
    return { g, f, top: TOPY + .33 * OS, setWine(u) { const H = Math.max(.001, u * .18); wine.visible = u > .005; wine.scale.y = H; wine.position.y = .14 + H / 2; } };
  }

  // ---------------------------------------------------------------- mezonot plate: a cake (frosting, crumbs) and a cookie stack on one plate; face on the cake front
  function mkPlate(Wd) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(MZ[0], MZ[1], MZ[2]);
    g.add(cyl(.6, .6, .04, 0xffffff, { pos: [0, .02, 0] }));                          // plate
    g.add(cyl(.3, .3, .26, 0xf2c9a0, { pos: [-.12, .17, 0] }));                       // cake
    g.add(cyl(.32, .32, .05, 0xff8fb0, { pos: [-.12, .305, 0] }));                    // pink frosting
    for (let i = 0; i < 6; i++) { const a = i * 1.1; g.add(ball(.022, 0x7a4a24, { pos: [-.12 + .24 * Math.cos(a), .34, .24 * Math.sin(a)], ink: false })); } // crumbs
    for (let i = 0; i < 3; i++) g.add(cyl(.13, .13, .05, 0xb8783a, { pos: [.32, .065 + i * .05, .05] }));  // cookie stack
    g.add(ball(.02, 0x3a2010, { pos: [.32, .19, .05], ink: false }));                 // chocolate chip
    const f = face(Wd, { w: .3, parent: g, pos: [-.12, .16, .33], seed: 5 });
    return { g, f };
  }

  // ---------------------------------------------------------------- challah: golden elongated loaf with braid bumps on a wooden board; white cloth cover (gold edge) drapes the middle; face on the cover front; cover lifts when it smiles
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

  // ---------------------------------------------------------------- balance: post on the table, beam pivot; right pan sinks under a big golden star; left pan high and empty
  function mkBal(Wd, pos) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(BAL_S);
    g.add(box(.8, .04, .4, 0x6b4a2e, { pos: [0, .02, 0] }));                          // base
    g.add(box(.08, .6, .08, 0x6b4a2e, { pos: [0, .3, 0] }));                          // post
    const pv = new THREE.Group(); pv.position.set(0, .6, 0); g.add(pv);               // beam pivot
    pv.add(box(1.6, .05, .05, 0xd9a63a));
    const pans = [];
    for (const sx of [-.7, .7]) {
      const pan = new THREE.Group(); pan.position.set(sx, -.25, 0); pv.add(pan);
      pan.add(cyl(.24, .24, .04, 0xc8c8c8, { pos: [0, 0, 0] }));                     // pan (left stays empty)
      pan.add(box(.015, .25, .015, 0x6b4a2e, { pos: [0, .125, 0] }));                // string
      pans.push(pan);
    }
    const star = ball(.2, 0xffe066, { pos: [0, .24, 0], ink: false }); pans[1].add(star);
    const sparks = []; for (let i = 0; i < 8; i++) { const d = ball(.045, 0xfff6c0, { ink: false }); pans[1].add(d); sparks.push(d); }
    return {
      g, setTilt(a) { pv.rotation.z = a; },
      setStar(sp, t) {
        star.scale.setScalar(Math.max(.001, sp));
        sparks.forEach((d, i) => { const a = i * PI / 4 + t * 1.4; d.position.set(.34 * Math.cos(a), .24 + .34 * Math.sin(a), 0); d.scale.setScalar(Math.max(.001, sp * (.8 + .2 * Math.sin(t * 6 + i)))); });
      }
    };
  }

  // ---------------------------------------------------------------- timeline bar: morning segment (blue, left) then meal segment (gold, right); marker = current time
  function mkBar(Wd) {
    Wd.add(box(1.8, .16, .14, 0x2f6ad0, { pos: [BL, BAR_Y, BAR_Z] }));
    Wd.add(box(1.8, .16, .14, 0xd9a63a, { pos: [BR, BAR_Y, BAR_Z] }));
    Wd.add(cyl(0, .16, .26, 0xd9a63a, { pos: [1.95, BAR_Y, BAR_Z], rot: [0, 0, -PI / 2] }));   // arrow head: boker -> seuda
    const gB = glowAt(Wd.scene, 1.6, 0x6aa8ff, 0); gB.position.set(BL, BAR_Y, BAR_Z + .05);
    const gG = glowAt(Wd.scene, 1.6, 0xffd27a, 0); gG.position.set(BR, BAR_Y, BAR_Z + .05);
    const mk = ball(.1, 0xffd166, { pos: [BL, BAR_Y + .27, BAR_Z + .15], ink: false }); Wd.add(mk);   // marker floats above the bar
    const bT = tag(Wd, 'בוקר', 'blue', 1.0), sT = tag(Wd, 'סעודה', 'gold', 1.0);
    return { gB, gG, mk, bT, sT };
  }
  const barTags = (bar, nb, ns) => { bar.bT.set([BL, BAR_Y, BAR_Z + .16], nb, 0); bar.sT.set([BR, BAR_Y, BAR_Z + .16], ns, 0); };

  // ---------------------------------------------------------------- small dots (path / sparkle ring)
  function mkDots(Wd, n, col, r) { const ds = []; for (let i = 0; i < n; i++) { const d = ball(r, col, { ink: false }); Wd.add(d); ds.push(d); } return ds; }

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up of the cake slice with crumbs, pull out to the table
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const pl = mkPlate(Wd), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7);
    const cup = mkCup(Wd, CUP0, 1); cup.setWine(.9);
    Wd.on(t => {
      cup.setWine(.9 + .03 * Math.sin(t * 1.3));
      cup.f.set(t, { talk: t > 5 ? .5 * talkAmt(t, 1) : 0, smile: t > 9 ? .6 : .1, look: [Math.sin(t * .8) * .4, .3] });
      pl.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, 5) : 0, smile: .3, look: [Math.sin(t * .9) * .3, 0] });
      c1.f.set(t, { talk: 0, smile: .1, look: [-.3, 0] });
      c2.f.set(t, { talk: 0, smile: .1, look: [-.3, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g]; Wd.qPos = [-.2, -.3]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([MZ[0] - .12, MZ[1] + .3, MZ[2] + .3], { dur: 3.6, dist0: 1.0, dist1: 1.8, h0: .3, h1: .4, a0: -10, a1: 8, fov0: 30, fov1: 36 }), 1)],
      [4.4, HH(punch(truck([-.6, 1.2, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.2, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28: the cup does a small kiddush hop over the plate; tags "קידוש" and "מזונות"; marker on "בוקר"
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bar = mkBar(Wd), pl = mkPlate(Wd), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7);
    const cup = mkCup(Wd, CUP0, 1); cup.setWine(.85);
    const kT = tag(Wd, 'קידוש', 'gold', 1.0), mT = tag(Wd, 'מזונות', 'orange', 1.2);
    Wd.on(t => {
      const s = P(3.0, 5.6, t), hp = Math.sin(PI * s);
      const cx = -.8 * hp, cy = TOPY + .6 * hp, cz = .5 * hp;                          // hop out over the plate and back
      cup.g.position.set(cx, cy, cz);
      cup.f.set(t, { talk: t > 4.5 ? .5 * talkAmt(t, 1) : 0, smile: sm(P(2.6, 3.6, t)) * .9, look: [cx < -.2 ? -.6 : 0, .3] });
      kT.set([0, TAG_Y, .3], popE(P(2.2, 2.9, t)) * NUM, .02 * Math.sin(t * 1.7));
      mT.set([MZ[0], TAG_Y, .3], popE(P(.9, 1.6, t)) * NUM, .02 * Math.sin(t * 1.3));
      barTags(bar, popE(P(.4, 1.2, t)) * NUM, popE(P(1.4, 2.2, t)) * NUM);
      bar.mk.position.x = BL;
      bar.gB.material.opacity = .6 + .2 * Math.sin(t * 2.5); bar.gG.material.opacity = .15;
      pl.f.set(t, { talk: t > 1 ? .5 * talkAmt(t, 5) : 0, smile: sm(P(1, 2, t)) * .7, look: [0, 0] });
      c1.f.set(t, { talk: 0, smile: .2, look: [-.3, 0] });
      c2.f.set(t, { talk: 0, smile: .2, look: [-.3, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, kT.g, mT.g, bar.bT.g, bar.sT.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.4, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -10, a1: 8, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 4)],
      [4.0, HH(punch(insert([0, 1.1, 0], { dur: 4.0, dist0: 3.0, dist1: 2.8, h0: .25, h1: .3, a0: -14, a1: 4, fov0: 36, fov1: 34 }), [.6]), 5)],
      [3.5, HH(lowHero([-.6, 1.0, 0], { dur: 3.5, dist0: 2.8, dist1: 2.6, h0: -.15, h1: -.08, a0: -16, a1: -4, fov0: 42, fov1: 40 }), 6)],
      [3.0, HH(pullOut([0, 1.3, 0], { dur: 3.0, dist0: 3.0, dist1: 4.4, h0: .35, h1: .7, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 7)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (good): a big golden seal stamps the morning segment "יצא ידי חובה"; the cup smiles
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bar = mkBar(Wd), pl = mkPlate(Wd), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7);
    const cup = mkCup(Wd, CUP0, 1); cup.setWine(.85);
    const seal = new THREE.Group(); seal.position.set(-.2, BAR_Y, BAR_Z + .35); Wd.add(seal);
    seal.add(cyl(.3, .3, .03, 0xb8860b, { pos: [0, 0, -.01], rot: [PI / 2, 0, 0], ink: false }));
    seal.add(cyl(.25, .25, .05, 0xffc23d, { rot: [PI / 2, 0, 0] }));
    const yT = tag(Wd, 'יצא ידי חובה', 'gold', 1.8);
    const ok = shock(Wd, 0xffd166);
    Wd.on(t => {
      const sp = popE(P(1.0, 1.7, t));
      seal.scale.setScalar(Math.max(.001, sp)); seal.rotation.z = (1 - sp) * -.9;
      ok.set([-.2, BAR_Y, BAR_Z + .35], P(1.6, 2.5, t), 1.0);
      yT.set([-.2, TAG_Y, .3], popE(P(2.0, 2.8, t)) * NUM, .02 * Math.sin(t * 1.7));
      barTags(bar, NUM, NUM);
      bar.mk.position.x = BL;
      bar.gB.material.opacity = .4 + .4 * sm(P(1.0, 1.8, t)); bar.gG.material.opacity = .15;
      cup.f.set(t, { talk: t > 2.6 ? .5 * talkAmt(t, 1) : 0, smile: .2 + .7 * sm(P(1.8, 2.8, t)), look: [-.2, .3] });
      pl.f.set(t, { talk: 0, smile: .3, look: [0, 0] });
      c1.f.set(t, { talk: 0, smile: .2, look: [-.3, 0] });
      c2.f.set(t, { talk: 0, smile: .2, look: [-.3, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, yT.g, seal, bar.bT.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.5, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: 10, a1: -6, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 8)],
      [4.0, HH(punch(pushIn([-.2, 1.4, .5], { dur: 4.0, dist0: 3.6, dist1: 3.0, h0: .4, h1: .3, a0: 10, a1: -4, fov0: 42, fov1: 38 }), [1.7]), 9)],
      [3.5, HH(punch(insert([-.2, 1.4, .5], { dur: 3.5, dist0: 2.6, dist1: 2.5, h0: .25, h1: .25, a0: -6, a1: 6, fov0: 36, fov1: 34 }), [2.2]), 10)],
      [3.0, HH(pullOut([-.2, 1.3, 0], { dur: 3.0, dist0: 3.6, dist1: 4.6, h0: .4, h1: .7, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 11)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (neutral): the marker slides from "בוקר" to "סעודה"; the two challot slide in, the covers lift a little, they smile; tag "סעודת הפת"
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bar = mkBar(Wd), pl = mkPlate(Wd), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7);
    const cup = mkCup(Wd, CUP0, 1); cup.setWine(.85);
    const sT2 = tag(Wd, 'סעודת הפת', 'gold', 1.7);
    Wd.on(t => {
      const u = sm(P(.5, 2.8, t));
      bar.mk.position.x = lerp(BL, BR, u);
      bar.gB.material.opacity = .7 * (1 - u) + .15; bar.gG.material.opacity = .7 * u + .15;
      barTags(bar, NUM, NUM);
      c1.setX(lerp(CH1[0] + 1.6, CH1[0], sm(P(.3, 2.6, t)))); c2.setX(lerp(CH2[0] + 1.6, CH2[0], sm(P(.6, 2.9, t))));
      c1.setOpen(.35 * sm(P(3.0, 4.0, t))); c2.setOpen(.35 * sm(P(3.3, 4.3, t)));
      c1.f.set(t, { talk: t > 4 ? .4 * talkAmt(t, 6) : 0, smile: sm(P(2.5, 3.5, t)), look: [-.3, 0] });
      c2.f.set(t, { talk: t > 4.5 ? .4 * talkAmt(t, 7) : 0, smile: sm(P(2.8, 3.8, t)), look: [-.3, 0] });
      sT2.set([1.6, TAG_Y, .3], popE(P(2.8, 3.5, t)) * NUM, .02 * Math.sin(t * 1.5));
      cup.f.set(t, { talk: 0, smile: .2, look: [.6, .2] });
      pl.f.set(t, { talk: 0, smile: .2, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [sT2.g, c2.g, cup.g, bar.bT.g, bar.sT.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 12)],
      [4.0, HH(punch(pushIn([1.5, 1.2, 0], { dur: 4.0, dist0: 3.4, dist1: 3.0, h0: .25, h1: .3, a0: -12, a1: 6, fov0: 40, fov1: 38 }), [3.4]), 13)],
      [3.5, HH(punch(insert([1.5, 1.1, .1], { dur: 3.5, dist0: 2.6, dist1: 2.5, h0: .15, h1: .2, a0: 12, a1: -6, fov0: 36, fov1: 34 }), [1.0]), 14)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 15)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (open question): the cup looks left and right; small evenly spaced dots run as an arc from the plate to the challot; "?" and "שוב?" tags below the top band
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bar = mkBar(Wd), pl = mkPlate(Wd), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7);
    const cup = mkCup(Wd, CUP0, 1); cup.setWine(.85);
    c1.setOpen(.35); c2.setOpen(.35);
    const qT = tag(Wd, '?', 'grey', .8), loopT = tag(Wd, 'שוב?', 'orange', 1.2);
    const dots = mkDots(Wd, 9, 0xe0a030, .022);
    const arcAt = u => [lerp(MZ[0] + .4, CH1[0] - .3, u), TOPY + .45 + .3 * Math.sin(PI * u), .6];
    Wd.on(t => {
      bar.mk.position.x = BR; bar.gG.material.opacity = .6 + .2 * Math.sin(t * 2.5); bar.gB.material.opacity = .15;
      barTags(bar, NUM, NUM);
      cup.f.set(t, { talk: t > 6 ? .4 * talkAmt(t, 1) : 0, smile: t > 3 ? 0 : .2, look: [Math.sin(t * 1.6) * .9, .3] });
      qT.set([-.9, TAG_Y + .1, .6], popE(P(.5, 1.3, t)) * NUM * 1.3, .05 * Math.sin(t * 4));
      loopT.set([.3, TAG_Y + .1, .6], popE(P(1.5, 2.2, t)) * NUM, .02 * Math.sin(t * 2));
      dots.forEach((d, i) => {
        const [dx, dy, dz] = arcAt(i / (dots.length - 1));
        d.position.set(dx, dy, dz);
        d.scale.setScalar(Math.max(.001, popE(P(1.0 + i * .2, 1.4 + i * .2, t))));
      });
      pl.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, 5) : 0, smile: .3, look: [.4, 0] });
      c1.f.set(t, { talk: 0, smile: .2, look: [-.6, 0] });
      c2.f.set(t, { talk: 0, smile: .2, look: [-.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, qT.g, loopT.g, bar.bT.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.2, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 16)],
      [4.0, HH(punch(pushIn([0, 1.3, .4], { dur: 4.0, dist0: 3.8, dist1: 3.4, h0: .35, h1: .3, a0: 10, a1: -4, fov0: 40, fov1: 38 }), [1.4, 2.6]), 17)],
      [3.5, HH(punch(insert([-.2, 1.4, .4], { dur: 3.5, dist0: 2.9, dist1: 2.8, h0: .2, h1: .25, a0: -10, a1: 10, fov0: 36, fov1: 34 }), [.9]), 18)],
      [3.0, HH(lowHero([-.2, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 19)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-84 (good): the cup hops to the first challah and makes kiddush again; small gold sparkle ring; tag "לכתחילה ראוי"; green check beside it
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bar = mkBar(Wd), pl = mkPlate(Wd), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7);
    const cup = mkCup(Wd, CUP0, 1); cup.setWine(.85);
    c1.setOpen(.35); c2.setOpen(.35);
    const lT = tag(Wd, 'לכתחילה ראוי', 'green', 1.6), chk = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a);
    const ring = mkDots(Wd, 10, 0xffd166, .028);
    Wd.on(t => {
      const u = sm(P(.5, 2.6, t));
      const cx = lerp(0, CH1[0] - .2, u), cz = lerp(0, .6, u);
      const cy = TOPY + .5 * Math.sin(PI * u) + .3 * Math.sin(PI * P(3.4, 4.2, t));
      cup.g.position.set(cx, cy, cz);
      cup.f.set(t, { talk: t > 3 ? .5 * talkAmt(t, 1) : 0, smile: sm(P(3.6, 4.4, t)) * .4 + sm(P(4.4, 5.0, t)) * .6, look: [.2, .2] });
      const rx = CH1[0], ry = TOPY + .3, rz = .3, rs = popE(P(4.2, 4.8, t));
      ring.forEach((d, i) => {
        const a = i * 2 * PI / 10 + t * 1.2;
        d.position.set(rx + .4 * Math.cos(a), ry + .4 * Math.sin(a), rz);
        d.scale.setScalar(Math.max(.001, rs * (.9 + .1 * Math.sin(t * 5 + i))));
      });
      lT.set([1.0, TAG_Y, .3], popE(P(3.6, 4.4, t)) * NUM, .02 * Math.sin(t * 1.3));
      chk.set([2.4, TAG_Y, .4], popE(P(5.6, 6.4, t)) * .9, .04 * Math.sin(t * 3));
      sk.set([2.4, TAG_Y, .4], P(5.6, 6.5, t), 1.0);
      barTags(bar, NUM, NUM);
      bar.mk.position.x = BR; bar.gG.material.opacity = .8; bar.gB.material.opacity = .15;
      c1.f.set(t, { talk: 0, smile: sm(P(3.8, 4.6, t)), look: [.3, 0] });
      c2.f.set(t, { talk: 0, smile: sm(P(4.0, 4.8, t)), look: [.3, 0] });
      pl.f.set(t, { talk: 0, smile: .3, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, lT.g, chk.g, bar.sT.g, bar.bT.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 20)],
      [3.5, HH(punch(pushIn([1.0, 1.2, .3], { dur: 3.5, dist0: 3.6, dist1: 3.2, h0: .3, h1: .3, a0: 10, a1: -6, fov0: 42, fov1: 40 }), [4.2]), 21)],
      [4.0, HH(punch(insert([CH1[0], 1.1, .3], { dur: 4.0, dist0: 2.8, dist1: 2.6, h0: .2, h1: .25, a0: -12, a1: 8, fov0: 36, fov1: 34 }), [6.2]), 22)],
      [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.2, dist1: 3.4, h0: -.1, h1: -.05, a0: -12, a1: -4, fov0: 42, fov1: 40 }), 23)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 84-98 (neutral, no red cross): balance. Left pan "חיוב מן הדין" stays high and empty; right pan sinks under a big golden star "הידור מצווה"
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const pl = mkPlate(Wd), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7);
    const cup = mkCup(Wd, [1.5, TOPY, .6], 1); cup.setWine(.85);
    c1.setOpen(.35); c2.setOpen(.35);
    const bal = mkBal(Wd, BAL);
    const lT = tag(Wd, 'חיוב מן הדין', 'grey', 1.4), gT = tag(Wd, 'הידור מצווה', 'gold', 1.4);
    Wd.on(t => {
      bal.setTilt(-.28 * sm(P(1.2, 3.2, t)));
      bal.setStar(popE(P(2.4, 3.2, t)), t);
      lT.set([BAL[0] - .84, TAG_Y + .1, BAL[2] + .2], popE(P(.4, 1.2, t)) * NUM, 0);
      gT.set([BAL[0] + .84, TAG_Y + .1, BAL[2] + .2], popE(P(1.0, 1.8, t)) * NUM, 0);
      cup.f.set(t, { talk: t > 2 ? .5 * talkAmt(t, 1) : 0, smile: .9, look: [-.6, .2] });
      c1.f.set(t, { talk: 0, smile: .8, look: [-.3, 0] });
      c2.f.set(t, { talk: 0, smile: .8, look: [-.3, 0] });
      pl.f.set(t, { talk: 0, smile: .4, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [bal.g, lT.g, gT.g, cup.g];
    Wd.cam = cuts([
      [3.5, HH(truck([-.2, 1.3, 0], { dur: 3.5, dist0: 6.0, dist1: 5.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 24)],
      [4.0, HH(punch(pushIn([BAL[0], 1.3, BAL[2]], { dur: 4.0, dist0: 3.6, dist1: 3.2, h0: .35, h1: .3, a0: 12, a1: -4, fov0: 42, fov1: 40 }), [2.6]), 25)],
      [3.5, HH(punch(insert([BAL[0], 1.2, BAL[2]], { dur: 3.5, dist0: 2.7, dist1: 2.6, h0: .2, h1: .25, a0: -14, a1: 8, fov0: 36, fov1: 34 }), [3.0]), 26)],
      [3.0, HH(pullOut([0, 1.3, 0], { dur: 3.0, dist0: 3.4, dist1: 4.6, h0: .4, h1: .8, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 27)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 98-118: the morning table in sunlight; cup and challot smiling; timeline glows; slow crane. Heroes kept to the sides and front
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bar = mkBar(Wd), pl = mkPlate(Wd), c1 = mkChal(Wd, CH1, 6), c2 = mkChal(Wd, CH2, 7);
    const cup = mkCup(Wd, [-.7, TOPY, .9], 9); cup.setWine(.85);
    c1.setOpen(.35); c2.setOpen(.35);
    Wd.on(t => {
      const pulse = .4 + .2 * Math.sin(t * 2.4);
      bar.gB.material.opacity = pulse * .6 + .15; bar.gG.material.opacity = pulse * sm(P(4, 8, t));
      cup.f.set(t, { talk: .4 * talkAmt(t, 9), smile: 1, look: [0, 0] });
      c1.f.set(t, { talk: .3 * talkAmt(t, 6), smile: 1, look: [0, 0] });
      c2.f.set(t, { talk: .3 * talkAmt(t, 7), smile: 1, look: [0, 0] });
      pl.f.set(t, { talk: .3 * talkAmt(t, 5), smile: 1, look: [0, 0] });
      bar.mk.position.x = BR;
      barTags(bar, NUM, NUM);
    });
    Wd.center = [0, 0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
