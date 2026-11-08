// shabbat-g29b story (08/11/2026) - how much to drink from the kiddush cup. Storyboard: storyboards_v11.md section C.
// Objects only, no people: silver kiddush cup, glass measuring beakers, dark wine bottle (all with cartoon faces from K.face).
// Scale: a beaker is 150 units full (the captions' 150 / 44 / 38). The 86 diagram beaker is its own scale.
// Number tags sit BESIDE the beakers at the liquid line, never in the top 18% of the frame.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, orbitShot, crane, lowHero, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, canvasTex, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TOPY = .8, CAP = 150, OS = 1.5;      // OS = prop scale (props read bigger in frame)
  const NUM = .6;                            // number tags are drawn at 60% size
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'], orange: ['#ffe4c4', '#8a3a00', '#e07a20'] };
  const bob = (t, k) => .03 * Math.sin(t * 1.8 + k);

  // ---------------------------------------------------------------- world / set (night Shabbat table, warm wall, two candles)
  const kW = () => mkWorld({ skyTop: 0x1b2038, skyBottom: 0x3d3350, fogColor: 0x2b2a40, fogNear: 22, fogFar: 96, hemi: 1.0, sun: .9, sunPos: [-10, 24, 14], shadowExt: 10 });
  function sceneSet(Wd) {
    Wd.add(box(10, 5, .3, 0xf4e2bf, { pos: [0, 2.5, -2.0] }));                       // warm back wall
    Wd.add(box(10, .12, 3.6, 0x6a4a2e, { pos: [0, -.06, -.4] }));                    // floor (top at 0)
    Wd.add(box(5.0, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));               // white Shabbat tablecloth
    Wd.add(box(5.0, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));           // cloth drape
    for (const x of [-2.3, 2.3]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
    const cd = [-1.2, 1.2].map(x => {                                                // two lit candles (set dressing only)
      Wd.add(cyl(.045, .045, .34, 0xfff4dc, { pos: [x, TOPY + .17, -1.0] }));
      const fl = ball(.035, 0xffb84a, { pos: [x, TOPY + .4, -1.0], scale: [.8, 1.4, .8], ink: false }); Wd.add(fl);
      const gl = glowAt(Wd.scene, 1.3, 0xffb84a, .5); gl.position.set(x, TOPY + .42, -1.0);
      return { fl, gl };
    });
    Wd.on(t => cd.forEach((c, i) => { const k = 1 + .08 * Math.sin(t * 9 + i * 2); c.fl.scale.set(.8 * k, 1.4 * k, .8); c.gl.material.opacity = .45 + .08 * Math.sin(t * 7 + i); }));
  }

  // ---------------------------------------------------------------- billboards / tags (copied pattern from yomit-08-v2)
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

  // ---------------------------------------------------------------- silver kiddush cup: origin = foot centre on the table (scaled OS); face on the +z side of the bowl
  function mkCup(Wd, pos, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(OS);
    const sil = 0xd6dce4, dark = 0xb4bcc7;
    g.add(cyl(.13, .13, .03, dark, { pos: [0, .015, 0] }));
    g.add(cyl(.035, .035, .1, dark, { pos: [0, .08, 0] }));
    g.add(cyl(.2, .14, .2, sil, { pos: [0, .23, 0] }));
    const wine = cyl(.12, .12, 1, 0x7a0c1c, { pos: [0, .14, 0], ink: false }); g.add(wine);
    const mark = box(.32, .012, .02, 0xe0a030, { pos: [0, .23, .205], ink: false }); mark.visible = false; g.add(mark);
    const f = face(Wd, { w: .2, parent: g, pos: [0, .25, .2], seed: seed || 1 });
    return { g, f, mark, top: TOPY + .33 * OS, setWine(u) { const H = Math.max(.001, u * .18); wine.visible = u > .005; wine.scale.y = H; wine.position.y = .14 + H / 2; } };
  }

  // ---------------------------------------------------------------- glass measuring beaker: origin = table point; setMl(ml) on a CAP scale; printed scale with numbers on the right
  // o.ticks = [[ml, colour, lineWidth, label]]; o.hi = ml whose line glows bright once the wine reaches it
  function mkBeaker(Wd, o) {
    const g = new THREE.Group(); Wd.add(g); const s = (o.s || 1) * OS; g.position.set(o.pos[0], o.pos[1], o.pos[2]); g.scale.setScalar(s);
    const cap = o.cap || CAP;
    const wine = cyl(.185, .185, 1, 0x8a1424, { pos: [0, .5, 0], ink: false }); g.add(wine);
    const glass = cyl(.2, .2, .8, 0xdcecf8, { pos: [0, .4, 0], ink: false });
    glass.material.transparent = true; glass.material.opacity = .3; glass.material.depthWrite = false; glass.renderOrder = 6; g.add(glass);
    const ticks = texPlane(.3, .8, (c, W, H) => {
      const ty = ml => H * (1 - (.03 + clamp(ml / cap, 0, 1) * .72) / .8);
      for (const [ml, col, lw, lab] of (o.ticks || [])) {
        c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(W * .03, ty(ml)); c.lineTo(W * .4, ty(ml)); c.stroke();
        if (lab) { c.direction = 'rtl'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#1d2a3a'; c.font = `800 ${Math.round(H * .075)}px ${FONT}`; c.fillText(lab, W * .45, ty(ml)); }
      }
    }, { cw: 256, ro: 7 });
    ticks.position.set(.2, .4, .205); g.add(ticks);
    let hm = null;
    if (o.hi !== undefined) { hm = box(.26, .03, .03, 0xffd166, { pos: [0, .03 + clamp(o.hi / cap, 0, 1) * .72, .215], ink: false }); hm.material.emissive = new THREE.Color(0xffa020); hm.visible = false; g.add(hm); }
    const f = face(Wd, { w: .17, parent: g, pos: [-.05, .6, .205], seed: o.seed || 2 });
    return {
      g, f, s, R: .2 * s, top: TOPY + s * .8,
      setMl(ml) {
        const u = clamp(ml / cap, 0, 1), H = Math.max(.001, u * .72); wine.visible = u > .005; wine.scale.y = H; wine.position.y = .03 + H / 2;
        if (hm) hm.visible = o.hi !== undefined && ml >= o.hi - .5;
      },
      surf(ml) { return TOPY + s * (.03 + clamp(ml / cap, 0, 1) * .72); }
    };
  }

  // ---------------------------------------------------------------- dark red wine bottle (scaled OS): origin = base centre; set(u) tilts it from rest (u=0) to over the beaker (u=1); returns the mouth point
  function mkBottle(Wd, o) {
    const g = new THREE.Group(); Wd.add(g); g.scale.setScalar(OS); const col = 0x4e0b18, k = .9, L = .92;
    g.add(cyl(.13, .14, .5, col, { pos: [0, .25, 0] }));
    g.add(cyl(.05, .13, .18, col, { pos: [0, .58, 0] }));
    g.add(cyl(.045, .045, .26, 0x3a0812, { pos: [0, .75, 0] }));
    g.add(cyl(.055, .055, .05, 0x1a1a1a, { pos: [0, .9, 0] }));
    g.add(box(.17, .14, .01, 0xf4ead2, { pos: [0, .15, .14], ink: false }));
    const f = face(Wd, { w: .15, parent: g, pos: [0, .36, .14], seed: o.seed || 3 });
    return {
      g, f,
      set(u, rest, pour) {
        const px = lerp(rest[0], pour[0] + L * OS * Math.sin(k), u), py = lerp(TOPY, TOPY + .95 * OS - L * OS * Math.cos(k), u), pz = lerp(rest[1], pour[1], u), th = k * u;
        g.position.set(px, py, pz); g.rotation.z = th;
        return [px - L * OS * Math.sin(th), py + L * OS * Math.cos(th), pz];
      }
    };
  }

  // ---------------------------------------------------------------- wine stream from the bottle mouth down to the liquid
  function mkStream(Wd) {
    const m = cyl(.014, .014, 1, 0x8a1424, { ink: false }); Wd.add(m); m.visible = false;
    return { set(top, bottom, x, z, on) { const h = top - bottom; m.visible = !!on && h > .02; if (!m.visible) return; m.scale.y = h; m.position.set(x, bottom + h / 2, z); } };
  }

  // ---------------------------------------------------------------- arrow pointing +x from its origin (rotate y by PI to point left)
  function mkArrow(Wd, col) {
    const g = new THREE.Group(); Wd.add(g); g.visible = false;
    g.add(box(.3, .03, .03, col, { pos: [.15, 0, 0], ink: false }));
    g.add(cyl(0, .06, .09, col, { pos: [.33, 0, 0], rot: [0, 0, -PI / 2], ink: false }));
    return { g, set(pos, s, ry) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); g.rotation.y = ry || 0; } };
  }

  // ---------------------------------------------------------------- 0. HOOK 0-14: close-up of the cup's wine rim, pulling out to the Shabbat table; "?" over the cup
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cup = mkCup(Wd, [0, TOPY, 0], 1), rim = cup.top;
    Wd.on(t => {
      cup.setWine(.9 + .03 * Math.sin(t * 1.3));
      cup.f.set(t, { talk: t > 4 ? .5 * talkAmt(t, 1) : 0, smile: t > 9 ? .6 : .1, look: [Math.sin(t * .8) * .4, .3] });
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g]; Wd.qPos = [0, -.1]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([0, rim, 0], { dur: 3.6, dist0: 1.3, dist1: 1.9, h0: .15, h1: .35, a0: -10, a1: 8, fov0: 30, fov1: 36 }), 1)],
      [4.4, HH(punch(orbitShot([0, rim - .2, 0], { dur: 4.4, dist0: 1.9, dist1: 2.1, h0: .35, h1: .4, a0: -20, a1: 20, fov0: 38, fov1: 38 }), [2.4]), 2)],
      [6.0, HH(pushIn([0, TOPY + .4, 0], { dur: 6.0, dist0: 2.3, dist1: 2.0, h0: .35, h1: .25, a0: 12, a1: -6, fov0: 40, fov1: 38 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28: an open sefer glows; golden tag "from the Torah" pops beside the cup; the cup stands tall
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cup = mkCup(Wd, [0, TOPY, 0], 1); cup.setWine(.85);
    const bk = new THREE.Group(); bk.position.set(1.2, TOPY, -.5); bk.scale.setScalar(OS); Wd.add(bk);
    bk.add(box(.8, .1, .56, 0x5a1f1f, { pos: [0, .05, 0] })); bk.add(box(.74, .08, .5, 0xf7efdb, { pos: [0, .1, 0], ink: false }));
    const gl = glowAt(Wd.scene, 2.0, 0xffd27a, 0); gl.position.set(1.2, TOPY + .3, -.5);
    const tg = tag(Wd, 'מן התורה', 'gold'), sk = shock(Wd, 0xffd166);
    Wd.on(t => {
      cup.g.position.y = TOPY + .035 * sm(P(1, 3, t)) + .008 * Math.sin(t * 2);
      cup.f.set(t, { talk: t > 4.5 ? .5 * talkAmt(t, 1) : 0, smile: sm(P(3, 5, t)) * .9, look: [0, .4] });
      gl.material.opacity = .75 * sm(P(1, 3, t)) * (.9 + .1 * Math.sin(t * 3));
      tg.set([0, TOPY + .85 + bob(t, 1), .35], popE(P(4, 5, t)) * .6, .03 * Math.sin(t * 1.7));
      sk.set([0, TOPY + .85, .35], P(4, 4.9, t), 1.2);
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, tg.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.2, .1], { dur: 3.5, dist0: 4.4, dist1: 4.2, h0: .6, h1: .5, a0: -10, a1: 8, fov0: 42, fov1: 42, shift: [-.5, 0, 0] }), 4)],
      [4.0, HH(punch(insert([0, 1.2, 0], { dur: 4.0, dist0: 2.6, dist1: 2.4, h0: .25, h1: .3, a0: -14, a1: 4, fov0: 36, fov1: 34 }), [.6]), 5)],
      [3.5, HH(lowHero([0, .9, 0], { dur: 3.5, dist0: 2.6, dist1: 2.4, h0: -.2, h1: -.1, a0: -16, a1: -4, fov0: 42, fov1: 40 }), 6)],
      [3.0, HH(pullOut([0, 1.2, 0], { dur: 3.0, dist0: 3.0, dist1: 3.9, h0: .35, h1: .7, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 7)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42: bottle pours into the beaker; printed 50/100/150 scale; the 150 line lights up and is labelled when reached
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bk = mkBeaker(Wd, { pos: [0, TOPY, 0], cap: CAP, hi: 150, ticks: [[50, '#2a3a4a', 3, '50'], [100, '#2a3a4a', 3, '100'], [150, '#ffd166', 9, '150']], seed: 2 });
    const bt = mkBottle(Wd, { seed: 3 }), st = mkStream(Wd);
    const tg = tag(Wd, '150 סמ״ק', 'green'), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    const REST = [1.6, -.4], POUR = [0, 0];
    Wd.on(t => {
      const pour = sm(P(.5, 2, t)) * (1 - sm(P(7.5, 9, t)));
      const ml = 150 * sm(P(2, 7, t));
      bk.setMl(ml);
      const m = bt.set(pour, REST, POUR);
      st.set(m[1], bk.surf(ml), m[0], m[2], pour > .95 && t < 8);
      bk.f.set(t, { talk: t > 8 ? .5 * talkAmt(t, 2) : 0, smile: sm(P(8, 9, t)), look: [0, 0] });
      bt.f.set(t, { talk: t < 7 ? .3 * talkAmt(t, 3) : 0, smile: .5, look: [-.3, 0] });
      tg.set([-(bk.R + .5), bk.surf(150) + bob(t, 1), .1], popE(P(6.6, 7.6, t)) * NUM, .03 * Math.sin(t * 1.7));
      ck.set([-(bk.R + .5), bk.surf(150) - .35, .1], popE(P(8, 8.8, t)) * .5, .05 * Math.sin(t * 3));
      sk.set([-(bk.R + .5), bk.surf(150) - .35, .1], P(8, 8.9, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [bk.g, bt.g, tg.g, ck.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 4.6, dist1: 4.4, h0: .6, h1: .5, a0: -12, a1: 6, fov0: 42, fov1: 42, shift: [-.6, 0, 0] }), 8)],
      [4.0, HH(punch(pushIn([0, 1.3, 0], { dur: 4.0, dist0: 3.6, dist1: 3.2, h0: .4, h1: .3, a0: 14, a1: -4, fov0: 42, fov1: 40 }), [3.4]), 9)],
      [3.5, HH(punch(insert([.2, 1.3, .05], { dur: 3.5, dist0: 3.0, dist1: 2.8, h0: .2, h1: .25, a0: -16, a1: 8, fov0: 36, fov1: 34 }), [.8]), 10)],
      [3.0, HH(crane([0, 1.2, 0], { dur: 3.0, dist0: 3.6, dist1: 4.2, h0: .2, h1: .9, a0: -8, a1: 6, fov0: 40, fov1: 42 }), 11)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56: the beaker drains from 150 to empty (all), refills and stops just above the half line; "רוב" beside the half line
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bk = mkBeaker(Wd, { pos: [0, TOPY, 0], cap: CAP, ticks: [[75, '#e0a030', 7, 'חצי'], [150, '#2a3a4a', 3, '150']], seed: 4 });
    const tg = tag(Wd, 'רוב', 'gold'), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      const ml = t < .5 ? 150 : t < 4 ? 150 * (1 - sm(P(.5, 4, t))) : t < 5.5 ? 0 : 80 * sm(P(5.5, 8, t));
      bk.setMl(ml);
      bk.f.set(t, { talk: t > 1 && t < 11 ? .4 * talkAmt(t, 4) : 0, smile: t < 5 ? .9 : .6, look: [0, 0] });
      tg.set([bk.R + .5, bk.surf(75) + bob(t, 1), .1], popE(P(8, 8.8, t)) * NUM, .03 * Math.sin(t * 1.7));
      ck.set([-(bk.R + .5), bk.surf(80), .1], popE(P(9.5, 10.3, t)) * .5, .05 * Math.sin(t * 3));
      sk.set([-(bk.R + .5), bk.surf(80), .1], P(9.5, 10.2, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [bk.g, tg.g, ck.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 4.6, dist1: 4.4, h0: .6, h1: .5, a0: 10, a1: -6, fov0: 42, fov1: 42, shift: [.5, 0, 0] }), 12)],
      [4.0, HH(punch(insert([0, 1.3, .1], { dur: 4.0, dist0: 3.1, dist1: 2.9, h0: .2, h1: .25, a0: -18, a1: 6, fov0: 36, fov1: 34 }), [1.4]), 13)],
      [3.5, HH(punch(lowHero([0, 1.0, 0], { dur: 3.5, dist0: 3.2, dist1: 3.0, h0: -.15, h1: -.05, a0: -20, a1: -2, fov0: 42, fov1: 40 }), [.9, 2.4]), 14)],
      [3.0, HH(pullOut([0, 1.2, 0], { dur: 3.0, dist0: 3.6, dist1: 4.4, h0: .4, h1: .7, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 15)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-72: a smaller beaker; the bottle pours only to the 44 line; "44" tag beside the liquid line; check
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bk = mkBeaker(Wd, { pos: [0, TOPY, 0], cap: CAP, s: .8, ticks: [[44, '#e0a030', 7, '44'], [100, '#2a3a4a', 3, '100']], seed: 5 });
    const bt = mkBottle(Wd, { seed: 6 }), st = mkStream(Wd);
    const tg = tag(Wd, '44 סמ״ק', 'orange', 1.1), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    const REST = [1.6, -.4], POUR = [0, 0];
    Wd.on(t => {
      const pour = sm(P(.5, 2, t)) * (1 - sm(P(6.8, 8.2, t)));
      const ml = 44 * sm(P(2, 6, t));
      bk.setMl(ml);
      const m = bt.set(pour, REST, POUR);
      st.set(m[1], bk.surf(ml), m[0], m[2], pour > .95 && t < 7);
      bk.f.set(t, { talk: t > 7 ? .5 * talkAmt(t, 5) : 0, smile: sm(P(7, 8, t)), look: [0, 0] });
      bt.f.set(t, { talk: t < 6 ? .3 * talkAmt(t, 6) : 0, smile: .5, look: [-.3, 0] });
      tg.set([-(bk.R + .5), bk.surf(44) + bob(t, 1), .1], popE(P(6.8, 7.8, t)) * NUM, .03 * Math.sin(t * 1.7));
      ck.set([-(bk.R + .5), bk.surf(44) - .3, .1], popE(P(8.5, 9.3, t)) * .5, .05 * Math.sin(t * 3));
      sk.set([-(bk.R + .5), bk.surf(44) - .3, .1], P(8.5, 9.4, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [bk.g, bt.g, tg.g, ck.g];
    Wd.cam = cuts([
      [4.0, HH(truck([0, 1.3, 0], { dur: 4.0, dist0: 4.6, dist1: 4.4, h0: .6, h1: .5, a0: -10, a1: 8, fov0: 42, fov1: 42, shift: [-.4, 0, 0] }), 16)],
      [4.0, HH(punch(pushIn([0, 1.3, .1], { dur: 4.0, dist0: 3.6, dist1: 3.2, h0: .3, h1: .3, a0: 12, a1: -4, fov0: 42, fov1: 40 }), [3.0]), 17)],
      [4.0, HH(punch(insert([0, 1.1, .05], { dur: 4.0, dist0: 3.0, dist1: 2.8, h0: .15, h1: .2, a0: -10, a1: 14, fov0: 36, fov1: 34 }), [.9]), 18)],
      [4.0, HH(lowHero([0, 1.0, 0], { dur: 4.0, dist0: 3.2, dist1: 3.4, h0: -.15, h1: -.05, a0: -12, a1: -4, fov0: 42, fov1: 40 }), 19)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 72-86: diagram - an 86 beaker; bright "חצי" line at the middle; the 44 level sits just above it; arrow at the small gap; camera pulled back
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const bk = mkBeaker(Wd, { pos: [0, TOPY, 0], cap: 86, s: .8, ticks: [[43, '#ffd166', 10, 'חצי'], [86, '#2a3a4a', 3, '86']], seed: 6 });
    const tgA = tag(Wd, '86 סמ״ק', 'blue', 1.1), tgR = tag(Wd, '44 סמ״ק', 'orange', 1.1), ar = mkArrow(Wd, 0xe0a030), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    const gap = bk.surf(44);
    Wd.on(t => {
      bk.setMl(44 * sm(P(1, 4, t)));
      bk.f.set(t, { talk: t > 2 ? .4 * talkAmt(t, 6) : 0, smile: sm(P(6, 8, t)), look: [-.3, 0] });
      tgA.set([bk.R + .5, bk.top - .1 + bob(t, 2), .1], popE(P(1.5, 2.5, t)) * NUM, .02 * Math.sin(t * 1.3));
      ar.set([bk.R + .5, gap, .15], popE(P(6, 7, t)), PI);
      tgR.set([bk.R + .95, gap, .1], popE(P(6.5, 7.5, t)) * NUM, .03 * Math.sin(t * 1.7));
      ck.set([-(bk.R + .5), gap, .1], popE(P(10, 11, t)) * .5, .05 * Math.sin(t * 3));
      sk.set([-(bk.R + .5), gap, .1], P(10, 10.9, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [bk.g, tgA.g, tgR.g, ar.g, ck.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.4, 0], { dur: 3.5, dist0: 3.9, dist1: 3.7, h0: .5, h1: .4, a0: -12, a1: 8, fov0: 42, fov1: 42, shift: [.4, 0, 0] }), 20)],
      [4.0, HH(punch(pushIn([0, 1.4, 0], { dur: 4.0, dist0: 3.7, dist1: 3.4, h0: .4, h1: .3, a0: 10, a1: -6, fov0: 42, fov1: 40 }), [3.0]), 21)],
      [3.5, HH(punch(orbitShot([0, 1.35, 0], { dur: 3.5, dist0: 3.5, dist1: 3.5, h0: .4, h1: .6, a0: -18, a1: 18, fov0: 42, fov1: 42 }), [2.8]), 22)],
      [3.0, HH(pullOut([0, 1.4, 0], { dur: 3.0, dist0: 3.4, dist1: 3.9, h0: .4, h1: .6, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 23)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100: the cup nods; a small 38 level in a beaker; "38" tag beside the liquid line; check
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cup = mkCup(Wd, [-.8, TOPY, 0], 7); cup.setWine(.8);
    const bk = mkBeaker(Wd, { pos: [.7, TOPY, 0], cap: CAP, s: .8, ticks: [[38, '#e07a20', 7, '38']], seed: 8 });
    const tgB = tag(Wd, '38 סמ״ק', 'orange', 1.1), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      bk.setMl(38 * sm(P(.5, 2.5, t)));
      cup.g.rotation.x = .12 * Math.sin((t - 5) * 2.6) * (t > 5 && t < 9.5 ? 1 : 0);
      cup.f.set(t, { talk: t > 1 && t < 12 ? .4 * talkAmt(t, 7) : 0, smile: .3 + .6 * sm(P(4, 6, t)), look: [0, -.1] });
      bk.f.set(t, { talk: t > 2 && t < 8 ? .4 * talkAmt(t, 8) : 0, smile: .2 + .5 * sm(P(4, 5, t)), look: [.4, 0] });
      tgB.set([-.05, bk.surf(38) + bob(t, 2), .4], popE(P(2, 3, t)) * NUM, .03 * Math.sin(t * 1.3));
      ck.set([-.8, cup.top + .3 + bob(t, 3), .1], popE(P(7.5, 8.5, t)) * .5, .05 * Math.sin(t * 3));
      sk.set([-.8, cup.top + .3, .1], P(7.5, 8.4, t), 1.0);
    });
    Wd.center = [0, 0]; Wd.occ = [cup.g, bk.g, tgB.g, ck.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.3, 0], { dur: 3.5, dist0: 4.8, dist1: 4.6, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 24)],
      [3.5, HH(punch(insert([.5, 1.2, .05], { dur: 3.5, dist0: 3.0, dist1: 2.8, h0: .2, h1: .25, a0: -14, a1: 8, fov0: 36, fov1: 34 }), [.5]), 25)],
      [4.0, HH(punch(lowHero([-.8, 1.0, 0], { dur: 4.0, dist0: 3.2, dist1: 3.0, h0: -.1, h1: -.05, a0: -14, a1: -6, fov0: 42, fov1: 40 }), [.6]), 26)],
      [3.0, HH(pullOut([0, 1.2, 0], { dur: 3.0, dist0: 3.8, dist1: 4.4, h0: .4, h1: .8, a0: 6, a1: -8, fov0: 42, fov1: 44 }), 27)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: cup and three beakers (150 / 44 / 38) with scale numbers; their marks glow; no tags over the card; slow crane
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cup = mkCup(Wd, [-2.0, TOPY, 0], 9); cup.setWine(.85);
    const b1 = mkBeaker(Wd, { pos: [-.7, TOPY, 0], cap: CAP, hi: 150, ticks: [[150, '#ffd166', 9, '150']], seed: 10 });
    const b2 = mkBeaker(Wd, { pos: [.6, TOPY, 0], cap: CAP, s: .8, ticks: [[44, '#e0a030', 6, '44']], seed: 11 });
    const b3 = mkBeaker(Wd, { pos: [1.9, TOPY, 0], cap: CAP, s: .8, ticks: [[38, '#e07a20', 6, '38']], seed: 12 });
    b1.setMl(150); b2.setMl(44); b3.setMl(38);
    const g1 = glowAt(Wd.scene, 1.0, 0xffd27a, .4), g2 = glowAt(Wd.scene, 1.0, 0xffd27a, .4), g3 = glowAt(Wd.scene, 1.0, 0xffd27a, .4);
    g1.position.set(-.7, b1.surf(150), .3); g2.position.set(.6, b2.surf(44), .3); g3.position.set(1.9, b3.surf(38), .3);
    Wd.on(t => {
      const pulse = .4 + .2 * Math.sin(t * 2.4);
      g1.material.opacity = pulse; g2.material.opacity = pulse; g3.material.opacity = pulse;
      cup.f.set(t, { talk: .4 * talkAmt(t, 9), smile: 1, look: [0, 0] });
      b1.f.set(t, { talk: .3 * talkAmt(t, 10), smile: 1, look: [0, 0] });
      b2.f.set(t, { talk: .3 * talkAmt(t, 11), smile: 1, look: [0, 0] });
      b3.f.set(t, { talk: .3 * talkAmt(t, 12), smile: 1, look: [0, 0] });
    });
    Wd.center = [0, 0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
