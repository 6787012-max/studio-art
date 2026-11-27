// shabbat-g45 story (27/11/2026) - erev Shabbat after mincha: a short action that does not need fixing oneself is permitted;
// a long "fixed" job (burning many discs) after mincha is forbidden; lechatchila from mincha gedola, some say mincha ketana.
// Section C of storyboards_v27.md. Objects only, no people. Copied from shabbat-g44 (table, wall, tags, camera and face helpers).
// Timeline order is right-to-left: noon on the RIGHT, sunset on the LEFT.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, crane, lowHero, insert, handheld, punch, pushIn, face, talkAmt,
          mark3d, shock, popE, ease, prog, lerp, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const cl01 = x => Math.min(1, Math.max(0, x));
  const TOPY = .8, NUM = .38, Z = 1.35;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], red: ['#ffe6e6', '#8a1010', '#e04040'], night: ['#14233f', '#ffffff', '#3a5fa0'] };
  const BY = 2.2, BZ = -1.76, DAY = { wed: 1.05, thu: .35, fri: -.35, sat: -1.05 }, PY = .2;
  const MON = [-1.7, TOPY, -.5], BUR = [-.5, TOPY, 0], STK = [.5, TOPY, -.3], GLS = [1.5, TOPY, -.6], CLK = [1.9, 2.5], TLZ = .8;
  const DREST = [-.5, TOPY + .3, .8], DIN = [-.5, TOPY + .3, .1];          // the disc outside the burner / inside its slot
  const SEED_MON = 71, SEED_DISC = 72, SEED_CLK = 73, SEED_CAL = 62;
  const WHITE = new THREE.Color(0xfffdf6), GREEN = new THREE.Color(0x7fd97a), SILVER = new THREE.Color(0xc8ced6), GOLD = new THREE.Color(0xf0c04a);
  const ORANGE = new THREE.Color(0xe07a20), BROWN = new THREE.Color(0xb08a5a), DARKC = new THREE.Color(0x553300), FLAME = new THREE.Color(0xffc23a), PAPER = new THREE.Color(0xf6ecd0);
  const col = (m, a, b, u) => m.material.color.copy(a).lerp(b, cl01(u));
  const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  // keys = [[time, [x, y, z]], ...]: eased straight slide between keys, held before the first and after the last
  function slide(t, keys) {
    if (t <= keys[0][0]) return keys[0][1].slice();
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, a] = keys[i], [t1, b] = keys[i + 1];
      if (t < t1) return lerp3(a, b, sm(P(t0, t1, t)));
    }
    return keys[keys.length - 1][1].slice();
  }

  // ---------------------------------------------------------------- world: night, warm wooden wall, table with white cloth, sky strip on the wall
  const kW = () => mkWorld({ skyTop: 0x1b2a55, skyBottom: 0x3a4f85, fogColor: 0x25345f, fogNear: 26, fogFar: 100, hemi: 1.0, sun: .7, sunPos: [-9, 22, 12], shadowExt: 10 });
  function sceneSet(Wd) {
    Wd.add(box(12, 5, .3, 0x7a4f32, { pos: [0, 2.5, -2.0] }));                       // warm wooden back wall (front face at z -1.85)
    Wd.add(box(12, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                    // floor (top at 0)
    Wd.add(box(6.4, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));                // white Shabbat tablecloth
    Wd.add(box(6.4, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));            // cloth drape
    for (const x of [-3.0, 3.0]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
    Wd.add(box(4.6, 1.0, .03, 0x2b4a7a, { pos: [0, 4.2, -1.84] }));                  // sky strip on the back wall (the sun path)
  }

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g44)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const INK = '#1f2a44';
  const drawTag = (text, st) => (c, W, H) => {
    c.fillStyle = st[0]; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = st[2]; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = st[1]; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const drawCrescent = (c, W, H) => { c.fillStyle = '#fffdf6'; c.beginPath(); c.arc(W / 2, H / 2, H * .44, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(W * .66, H * .42, H * .38, 0, Math.PI * 2); c.fill(); c.globalCompositeOperation = 'source-over'; };
  const drawPlain = (text) => (c, W, H) => {             // dark text on the paper, no border
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .9, maxLines: 1, max: H * .66, min: H * .18, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = INK; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const tag = (Wd, text, style, w) => bb(Wd, w, .5, drawTag(text, ST[style]), w > 1.6 ? 900 : 520);

  // ---------------------------------------------------------------- the wall calendar (hook only): a board with a face, a blue header, four day pages, Shabbat in gold
  function mkCal(Wd, bx, seed, dy) {
    const yc = BY + (dy || 0);
    const g = new THREE.Group(); g.position.set(bx, yc, BZ); Wd.add(g);
    const wp = (lx, ly, lz) => [bx + lx, yc + ly, BZ + (lz || 0)];
    const hov = (lx, ly) => [bx + lx, yc + ly - 1.0, -1.2];
    g.add(box(3.2, 2.4, .08, 0xf1e7cf));
    const hd = new THREE.Group(); hd.position.set(0, 1.0, .08); g.add(hd);
    hd.add(box(3.2, .36, .06, 0x2f6ad0));
    const hl = texPlane(3.0, .3, drawTag('ערב שבת', ST.blue), { cw: 512 }); hl.position.z = .04; hd.add(hl);
    g.add(box(2.9, .03, .04, 0x14408f, { pos: [0, .5, .05] }));
    const pages = {};
    const pg = (key, lx, text, fill) => { const p = new THREE.Group(); p.position.set(lx, PY, .06); g.add(p);
      const b = box(.6, .5, .04, fill || 0xfffdf6); p.add(b);
      const lab = texPlane(.54, .35, drawPlain(text), { cw: 512 }); lab.position.z = .025; p.add(lab);
      pages[key] = { p, box: b }; };
    pg('wed', DAY.wed, 'רביעי');
    pg('thu', DAY.thu, 'חמישי');
    pg('fri', DAY.fri, 'שישי');
    pg('sat', DAY.sat, 'שבת', 0xf0c04a);
    const fc = face(Wd, { w: .42, parent: g, pos: [-1.35, -.7, .1], seed });
    return { g, wp, hov, pages, fc };
  }

  // ---------------------------------------------------------------- heroes and props (origin = table top unless noted; face on the +z side)
  // desk computer: a screen with a face under a progress bar (green fill grows from the left)
  function mkMonitor(Wd, x, z, seed) {
    const g = new THREE.Group(); g.position.set(x, TOPY, z); Wd.add(g);
    g.add(box(.5, .04, .36, 0x3a3a44, { pos: [0, .02, 0] }));
    g.add(cyl(.07, .1, .5, 0x3a3a44, { pos: [0, .27, 0] }));
    g.add(box(1.3, .9, .08, 0x1f2a44, { pos: [0, 1.0, 0] }));
    g.add(box(1.2, .8, .02, 0x2f3d60, { pos: [0, 1.0, .05] }));
    g.add(box(.9, .1, .02, 0x9a9a9a, { pos: [0, 1.4, .07] }));
    const fill = box(.9, .1, .025, 0x3f9a4a, { pos: [0, 1.4, .08] }); g.add(fill);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .85, .1], seed });
    return { g, f, setBar(u) { const v = cl01(u); fill.scale.x = Math.max(.001, v); fill.position.x = -.45 + .45 * v; } };
  }
  // the burner box: the disc slides into its slot on the front
  function mkBurner(Wd, x, z) {
    const g = new THREE.Group(); g.position.set(x, TOPY, z); Wd.add(g);
    g.add(box(.8, .3, .6, 0x6a6e78, { pos: [0, .15, 0] }));
    g.add(box(.5, .04, .05, 0x2a2a30, { pos: [0, .28, .31] }));
    return g;
  }
  // one shiny disc standing upright, a face on its front (origin = disc centre)
  function mkDisc(Wd, seed) {
    const g = new THREE.Group(); Wd.add(g);
    const d = cyl(.2, .2, .03, 0xbfe0ff); d.rotation.x = PI / 2; g.add(d);
    const f = face(Wd, { w: .34, parent: g, pos: [0, 0, .04], seed });
    return { g, f };
  }
  // a tall stack of discs lying flat (ten, rising from the table)
  function mkStack(Wd, x, z) {
    const ds = [];
    for (let i = 0; i < 10; i++) { const m = cyl(.2, .2, .03, 0xbfe0ff, { pos: [x, TOPY + .02 + i * .045, z] }); m.scale.setScalar(.001); Wd.add(m); ds.push(m); }
    return ds;
  }
  // hourglass: the top half turns round its centre
  function mkGlass(Wd, x, z) {
    const g = new THREE.Group(); g.position.set(x, TOPY, z); Wd.add(g);
    const piv = new THREE.Group(); piv.position.set(0, .3, 0); g.add(piv);
    piv.add(box(.34, .03, .34, 0x8a6a4a, { pos: [0, .2, 0] })); piv.add(box(.34, .03, .34, 0x8a6a4a, { pos: [0, -.2, 0] }));
    piv.add(cyl(.13, .03, .18, 0xdfeeff, { pos: [0, .1, 0] })); piv.add(cyl(.03, .13, .18, 0xdfeeff, { pos: [0, -.1, 0] }));
    return piv;
  }
  // an empty office chair behind the desk, back toward the wall (no person)
  function mkChair(Wd, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g);
    g.add(box(.5, .08, .5, 0x3a4a6a, { pos: [0, .45, 0] }));
    g.add(box(.5, .7, .07, 0x3a4a6a, { pos: [0, .85, -.25] }));
    g.add(cyl(.04, .04, .4, 0x6a6e78, { pos: [0, .2, 0] }));
    return g;
  }
  // round wall clock with a face under the dial; two hands on their own pivots
  function mkClock(Wd, x, y, seed) {
    const g = new THREE.Group(); g.position.set(x, y, -1.8); Wd.add(g);
    const rim = cyl(.64, .64, .04, 0x3a3a44); rim.rotation.x = PI / 2; rim.position.z = -.02; g.add(rim);
    const dial = cyl(.6, .6, .05, 0xfffdf6); dial.rotation.x = PI / 2; dial.position.z = .02; g.add(dial);
    const hour = new THREE.Group(); hour.position.z = .06; g.add(hour); hour.add(box(.05, .3, .03, 0x14408f, { pos: [0, .15, 0] }));
    const min = new THREE.Group(); min.position.z = .07; g.add(min); min.add(box(.04, .45, .03, 0x2f6ad0, { pos: [0, .22, 0] }));
    const f = face(Wd, { w: .3, parent: g, pos: [0, -.3, .08], seed });
    return { g, hour, min, f };
  }
  // the sun on the back wall's sky strip: u = 0 at the right, u = 1 at the left and lower
  function mkSun(Wd) {
    const s = ball(.2, 0xffc23a, { ink: false }); Wd.add(s);
    return { set(u) { s.position.set(lerp(1.8, -1.2, u), lerp(4.25, 3.65, u) + .12 * Math.sin(PI * u), -1.78); } };
  }
  // the Friday afternoon time line on the table front: noon on the right, sunset on the left
  function mkTimeline(Wd) {
    Wd.add(box(2.8, .05, .05, 0xb08a5a, { pos: [0, TOPY + .03, TLZ] }));
    const seg = box(2.1, .07, .07, 0xb08a5a, { pos: [.7, TOPY + .06, TLZ] }); Wd.add(seg); seg.scale.x = .001;
    const gd = ball(.09, 0xfffdf6, { ink: false }); gd.position.set(.7, TOPY + .1, TLZ); Wd.add(gd);
    const kt = ball(.09, 0xfffdf6, { ink: false }); kt.position.set(-.2, TOPY + .1, TLZ); Wd.add(kt);
    const walker = ball(.12, 0xffc23a, { ink: false }); Wd.add(walker);
    const gl = tag(Wd, 'מנחה גדולה', 'grey', 1.0), kl = tag(Wd, 'מנחה קטנה', 'grey', 1.0);
    return { seg, gd, kt, walker, gl, kl };
  }
  // two Shabbat candles in silver holders; the flames glow when lit
  function mkCandles(Wd, x, z) {
    const fl = [];
    for (const dx of [-.14, .14]) {
      const h = cyl(.08, .1, .05, 0xc8ced6, { pos: [x + dx, TOPY + .025, z] }); Wd.add(h);
      const c = cyl(.035, .035, .3, 0xfffdf6, { pos: [x + dx, TOPY + .2, z] }); Wd.add(c);
      const f = ball(.05, 0xffd27a, { ink: false }); f.position.set(x + dx, TOPY + .4, z); Wd.add(f); fl.push(f);
    }
    return fl;
  }
  // the old scroll on the table: a paper that unrolls upward, two labels, and a small icon of three discs
  function mkScroll(Wd, x, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    const rollT = cyl(.05, .05, .74, 0x8a6a4a); rollT.rotation.z = PI / 2; rollT.position.set(0, .9, 0); g.add(rollT);
    const rollB = cyl(.05, .05, .74, 0x8a6a4a); rollB.rotation.z = PI / 2; g.add(rollB);
    const paper = new THREE.Group(); g.add(paper);            // scale.y grows from the bottom: it unrolls
    const sheet = box(.7, .9, .03, 0xf6ecd0, { pos: [0, .45, 0] }); paper.add(sheet);
    const l1 = texPlane(.6, .2, drawPlain('תקנת חז״ל'), { cw: 512 }); l1.position.set(0, .78, .025); paper.add(l1);
    const l2 = texPlane(.6, .2, drawPlain('מלאכת קבע'), { cw: 512 }); l2.position.set(0, .5, .025); paper.add(l2);
    for (let i = 0; i < 3; i++) { const d = cyl(.09, .09, .03, 0xbfe0ff, { pos: [0, .2 + i * .03, .03] }); d.rotation.x = PI / 2; paper.add(d); }
    return { g, paper, sheet, iconAt: [x, TOPY + .26, z + .1] };
  }

  // standard four-shot camera: wide -> medium on the action -> insert on the object that carries the halacha -> low hero
  const std = (n, c) => cuts([
    [3.5, HH(truck([c.wide[0], c.wide[1], -1.0], { dur: 3.5, dist0: (c.wd || 6.4) * Z, dist1: ((c.wd || 6.4) - .2) * Z, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4 * Z, dist1: 3.0 * Z, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6 * Z, dist1: 2.5 * Z, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4 * Z, dist1: 3.6 * Z, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the disc's face, pull out; the disc slides into the burner; the calendar with "שישי" behind; "?" above
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, -.5, SEED_CAL, -.45);
    const clk = mkClock(Wd, CLK[0], CLK[1], SEED_CLK);
    const mon = mkMonitor(Wd, MON[0], MON[2], SEED_MON);
    mkBurner(Wd, BUR[0], BUR[2]);
    const disc = mkDisc(Wd, SEED_DISC);
    cal.pages.fri.box.material.color.copy(GOLD);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      disc.g.position.set(...slide(t, [[0, DREST], [6, DREST], [9, DIN], [dur, DIN]]));
      disc.f.set(t, { talk: t > 1 && t < 6 ? .35 * talkAmt(t, SEED_DISC) : 0, smile: .3, look: [.2, 0] });
      mon.setBar(0);
      mon.f.set(t, { talk: 0, smile: .2, look: [.5, 0] });
      clk.hour.rotation.z = -PI / 6 - .03 * t;
      clk.f.set(t, { talk: 0, smile: .3, look: [-.4, 0] });
      cal.fc.set(t, { talk: 0, smile: .3, look: [.6, 0] });
      qT.set([DREST[0], 2.1, DREST[2]], popE(P(1.4, 2.2, t)) * .8, .05 * Math.sin(t * 4));
    });
    Wd.center = [0, 0]; Wd.occ = [qT.g]; Wd.qPos = [DREST[0], DREST[2]]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([DREST[0], DREST[1], DREST[2]], { dur: 3.6, dist0: .6, dist1: 2.0, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([-.5, 1.2, .3], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.3, 0], { dur: 6.0, dist0: 3.2, dist1: 4.6, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (good): the monitor's bar fills fast; the disc pops out of the burner happy; green check + sparkles; tag "פעולה קצרה"
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const clk = mkClock(Wd, CLK[0], CLK[1], SEED_CLK);
    const mon = mkMonitor(Wd, MON[0], MON[2], SEED_MON);
    mkBurner(Wd, BUR[0], BUR[2]);
    const disc = mkDisc(Wd, SEED_DISC);
    const ck = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const tN = tag(Wd, 'פעולה קצרה', 'green', 2.4);
    const CHK = [DREST[0], 1.9, DREST[2]];
    Wd.on(t => {
      mon.setBar(sm(P(.6, 2.8, t)));
      mon.f.set(t, { talk: .3 * talkAmt(t, SEED_MON), smile: .6, look: [-.3, 0] });
      disc.g.position.set(...slide(t, [[0, DIN], [3.8, DIN], [5.4, DREST], [dur, DREST]]));
      disc.f.set(t, { talk: .4 * talkAmt(t, SEED_DISC), smile: sm(P(5.4, 6.2, t)), look: [.2, 0] });
      clk.hour.rotation.z = -PI / 6;
      clk.f.set(t, { talk: 0, smile: .5, look: [-.4, 0] });
      ck.set(CHK, popE(P(5.8, 6.6, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(CHK, P(5.8, 6.6, t), 1.0);
      tN.set([0, 2.2, -.5], popE(P(6.4, 7.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, ck.g];
    Wd.cam = std(4, { wide: [-.6, 1.4, .2], wd: 2.6, med: [-.9, 1.5, -.2], pm: 3.0, ins: [-.5, 1.1, .8], pi: 3.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (neutral-long): a tall stack of discs grows next to the monitor; the bar crawls; the hourglass turns; the empty chair rolls up to the desk; tag "זמן רב"
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const mon = mkMonitor(Wd, MON[0], MON[2], SEED_MON);
    mkBurner(Wd, BUR[0], BUR[2]);
    const stk = mkStack(Wd, STK[0], STK[2]);
    const gl = mkGlass(Wd, GLS[0], GLS[2]);
    const ch = mkChair(Wd, 2.7, -1.45);
    const clk = mkClock(Wd, CLK[0], CLK[1], SEED_CLK);
    const tN = tag(Wd, 'זמן רב', 'orange', 2.0);
    Wd.on(t => {
      mon.setBar(.1 + .2 * (t / dur));
      mon.f.set(t, { talk: .3 * talkAmt(t, SEED_MON), smile: -.2, look: [.2, 0] });
      stk.forEach((m, i) => { const a = .6 + i * .9; m.scale.setScalar(Math.max(.001, popE(P(a, a + .5, t)))); });
      gl.rotation.z = PI * sm(P(1.0, 5.0, t));
      ch.position.x = lerp(2.7, 2.0, sm(P(2.0, 6.0, t)));
      clk.hour.rotation.z = -PI / 6 - .03 * t;
      clk.f.set(t, { talk: .3 * talkAmt(t, SEED_CLK), smile: 0, look: [-.3, 0] });
      tN.set([0, 2.2, -.5], popE(P(7.0, 8.0, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    Wd.cam = std(8, { wide: [0, 1.5, 0], wd: 2.6, med: [-.4, 1.6, -.3], pm: 3.0, ins: [STK[0], 1.35, STK[2]], pi: 3.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (bad): the wall clock hands move to the afternoon; the sun drops; a red barrier comes down in front of the stack; red cross + shock; tag "אחרי מנחה"
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const mon = mkMonitor(Wd, MON[0], MON[2], SEED_MON);
    mkBurner(Wd, BUR[0], BUR[2]);
    const stk = mkStack(Wd, STK[0], STK[2]);
    const clk = mkClock(Wd, CLK[0], CLK[1], SEED_CLK);
    const sun = mkSun(Wd);
    const bar = box(.9, .9, .08, 0xe04040); Wd.add(bar);
    const cr = mark3d(Wd, 'cross', .5), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'אחרי מנחה', 'red', 2.2);
    const CRS = [STK[0], 1.95, .5];
    Wd.on(t => {
      stk.forEach(m => m.scale.setScalar(1));
      bar.position.set(STK[0], lerp(2.7, 1.3, sm(P(.8, 2.2, t))), .4);
      sun.set(P(0, dur, t));
      clk.hour.rotation.z = lerp(-PI / 6, -PI * .6, sm(P(.5, dur, t)));
      clk.f.set(t, { talk: .3 * talkAmt(t, SEED_CLK), smile: -.2, look: [.3, 0] });
      cr.set(CRS, popE(P(3.2, 4.0, t)) * .5, .04 * Math.sin(t * 3));
      sk.set(CRS, P(3.2, 4.0, t), 1.0);
      mon.f.set(t, { talk: .3 * talkAmt(t, SEED_MON), smile: -.6, look: [.4, 0], surprise: sm(P(3.2, 4.0, t)) });
      mon.setBar(.3);
      tN.set([0, 2.2, -.5], popE(P(4.4, 5.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g];
    Wd.cam = std(12, { wide: [.2, 1.5, 0], wd: 2.6, med: [.3, 1.6, 0], pm: 3.4, ins: [.5, 1.55, .2], pi: 3.2 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-72 (neutral, 16 s): the old scroll "תקנת חז״ל" unrolls; on it "מלאכת קבע" and a crossed icon of the disc stack; orange pulse; tag "מלאכת קבע"
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const scr = mkScroll(Wd, -.2, -1.0);
    const stk = mkStack(Wd, STK[0], STK[2]);
    const cr = mark3d(Wd, 'cross', .32), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'מלאכת קבע', 'orange', 2.4);
    Wd.on(t => {
      stk.forEach(m => m.scale.setScalar(1));
      scr.paper.scale.y = Math.max(.03, sm(P(.4, 2.6, t)));
      col(scr.sheet, PAPER, ORANGE, .6 * (.5 + .5 * Math.sin(t * 6)) * sm(P(3.0, 4.0, t)));
      cr.set([scr.iconAt[0], scr.iconAt[1], scr.iconAt[2]], popE(P(3.2, 4.0, t)) * .32, .04 * Math.sin(t * 3));
      sk.set([scr.iconAt[0], scr.iconAt[1], scr.iconAt[2]], P(3.2, 4.0, t), 1.0);
      tN.set([0, 2.2, -.5], popE(P(4.6, 5.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g];
    Wd.cam = cuts([
      [4.0, HH(truck([-.2, 1.4, -.6], { dur: 4.0, dist0: 3.6, dist1: 3.4, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 40)],
      [4.0, HH(punch(pushIn([-.2, 1.2, -1.0], { dur: 4.0, dist0: 3.4, dist1: 3.0, h0: .4, h1: .4, a0: 8, a1: -6, fov0: 40, fov1: 40 }), [3.0]), 41)],
      [4.0, HH(punch(insert([-.2, 1.2, -1.0], { dur: 4.0, dist0: 2.8, dist1: 2.6, h0: .3, h1: .3, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [9.0]), 42)],
      [4.0, HH(lowHero([-.2, 1.0, -1.0], { dur: 4.0, dist0: 3.6, dist1: 3.6, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 43)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 72-86 (good): the sun walks along the time line from noon (right) to the left; the gedola marker lights orange and the line to its left turns orange; tag "לכתחילה"
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const mon = mkMonitor(Wd, MON[0], MON[2], SEED_MON);
    const tl = mkTimeline(Wd);
    const tN = tag(Wd, 'לכתחילה', 'green', 2.0);
    Wd.on(t => {
      mon.setBar(1);
      mon.f.set(t, { talk: .4 * talkAmt(t, SEED_MON), smile: .5 + .4 * sm(P(3.4, 4.2, t)), look: [.3, 0] });
      tl.walker.position.set(lerp(1.4, -1.4, sm(P(.5, 6.0, t))), TOPY + .2, TLZ);
      col(tl.gd, WHITE, ORANGE, sm(P(1.0, 3.0, t)));
      const sg = sm(P(3.0, 5.0, t));
      col(tl.seg, BROWN, ORANGE, sg);
      tl.seg.scale.x = Math.max(.001, sg); tl.seg.position.x = .7 - 1.05 * sg;
      tl.gl.set([.7, 1.2, TLZ + .1], popE(P(.6, 1.4, t)) * .8, 0);
      tN.set([0, 2.2, -.5], popE(P(3.6, 4.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    Wd.cam = std(20, { wide: [0, 1.4, .5], wd: 2.6, med: [.1, 1.3, .8], pm: 3.6, ins: [0, 1.1, .8], pi: 3.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (good): the second marker "מנחה קטנה" lights orange; a small label "יש אומרים" beside it; the candles at the left end glow softly; tag "יש אומרים"
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const mon = mkMonitor(Wd, MON[0], MON[2], SEED_MON);
    const tl = mkTimeline(Wd);
    const fl = mkCandles(Wd, -2.5, .7);
    const side = tag(Wd, 'יש אומרים', 'orange', 1.1);
    const tN = tag(Wd, 'יש אומרים', 'orange', 2.0);
    Wd.on(t => {
      mon.setBar(1);
      mon.f.set(t, { talk: .4 * talkAmt(t, SEED_MON), smile: .4, look: [.3, 0] });
      tl.walker.position.set(-1.4, TOPY + .2, TLZ);
      col(tl.gd, WHITE, ORANGE, 1);
      col(tl.seg, BROWN, ORANGE, 1);
      col(tl.kt, WHITE, ORANGE, sm(P(1.0, 3.0, t)));
      tl.kl.set([-.2, 1.2, TLZ + .1], popE(P(.6, 1.4, t)) * .8, 0);
      side.set([-.2, 1.8, TLZ + .1], popE(P(2.6, 3.4, t)) * .8, 0);
      const glow = sm(P(2.0, 6.0, t)) * (.6 + .4 * Math.sin(t * 2));
      fl.forEach(f => col(f, DARKC, FLAME, glow));
      tN.set([0, 2.2, -.5], popE(P(5.4, 6.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    Wd.cam = std(24, { wide: [0, 1.4, .5], wd: 2.6, med: [-.9, 1.3, .6], pm: 3.6, ins: [-.7, 1.1, .8], pi: 3.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: one happy disc with a green check on one side; the stack under a cloth on the other; the candles at the back ready for Shabbat; no red cross
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const DA = [-1.0, TOPY + .3, .3];
    const disc = mkDisc(Wd, SEED_DISC);
    const stk = mkStack(Wd, 1.0, -.3);
    const cloth = box(.7, .05, .7, 0xfbf8f0, { pos: [1.0, TOPY + .52, -.3] }); Wd.add(cloth);
    const fl = mkCandles(Wd, -.2, -1.1);
    const clk = mkClock(Wd, CLK[0], CLK[1], SEED_CLK);
    const ck = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => {
      stk.forEach(m => m.scale.setScalar(1));
      disc.g.position.set(DA[0], DA[1], DA[2]);
      disc.f.set(t, { talk: .3 * talkAmt(t, SEED_DISC), smile: 1, look: [-.4, 0] });
      ck.set([DA[0], 2.0, DA[2]], popE(P(.8, 1.6, t)) * .6, .04 * Math.sin(t * 3));
      sk.set([DA[0], 2.0, DA[2]], P(.8, 1.6, t), 1.0);
      fl.forEach(f => col(f, DARKC, FLAME, .6 + .3 * Math.sin(t * 3)));
      clk.hour.rotation.z = -PI / 6;
      clk.f.set(t, { talk: .2 * talkAmt(t, SEED_CLK), smile: .8, look: [-.3, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.6, -1.0], { dur: 20, dist0: 5.2, dist1: 4.8, h0: .9, h1: 1.6, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
