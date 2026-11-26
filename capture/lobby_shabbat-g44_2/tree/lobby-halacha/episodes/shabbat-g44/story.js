// shabbat-g44 story (26/11/2026) - Rosh Chodesh falls on Friday: those who keep R Yehuda HaChassid's will do not cut nails on Rosh Chodesh, so one may cut on Thursday. Section C of storyboards_v26.md.
// Objects only, no people. Copied from shabbat-g43 (wall calendar with a face, nail clipper with a face, table, camera helpers).
// Calendar order is right-to-left: the earlier day is on the RIGHT (Wed, Thu, Fri, Shabbat).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, crane, lowHero, insert, handheld, punch, pushIn, face, talkAmt,
          mark3d, shock, popE, ease, prog, lerp, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const cl01 = x => Math.min(1, Math.max(0, x));
  const TOPY = .8, NUM = .38, SC = 1.35;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], red: ['#ffe6e6', '#8a1010', '#e04040'], night: ['#14233f', '#ffffff', '#3a5fa0'] };
  const CLX = -.6, CLZ = .2;                    // the nail clipper standing on the table
  const BY = 2.2, BZ = -1.76;                   // calendar: centre height and depth on the back wall
  const DAY = { wed: 1.05, thu: .35, fri: -.35, sat: -1.05 };   // local x of the day pages (earlier day on the right)
  const PY = .2;                                // day page centre height (local)
  const CLK_HOV = 1.4;                          // height of a hero hovering in front of the calendar
  const SEED_CLIP = 71, SEED_CAL = 62, SEED_SCR = 64;
  const WHITE = new THREE.Color(0xfffdf6), GREEN = new THREE.Color(0x7fd97a), SILVER = new THREE.Color(0xc8ced6), GOLD = new THREE.Color(0xf0c04a);
  const col = (m, a, b, u) => m.material.color.copy(a).lerp(b, cl01(u));
  const arc3 = (a, b, u, lift) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + lift * Math.sin(PI * u), lerp(a[2], b[2], u)];
  // keys = [[time, [x, y, z]], ...]: between two different points the object hops along an arc, otherwise it stays put
  function pathAt(t, keys) {
    if (t <= keys[0][0]) return keys[0][1].slice();
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, a] = keys[i], [t1, b] = keys[i + 1];
      if (t < t1) { const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); return arc3(a, b, sm(P(t0, t1, t)), d > .2 ? .8 : 0); }
    }
    return keys[keys.length - 1][1].slice();
  }

  // ---------------------------------------------------------------- world: night, warm wooden wall, table with white cloth
  const kW = () => mkWorld({ skyTop: 0x1b2a55, skyBottom: 0x3a4f85, fogColor: 0x25345f, fogNear: 26, fogFar: 100, hemi: 1.0, sun: .7, sunPos: [-9, 22, 12], shadowExt: 10 });
  function sceneSet(Wd) {
    Wd.add(box(12, 5, .3, 0x7a4f32, { pos: [0, 2.5, -2.0] }));                       // warm wooden back wall (front face at z -1.85)
    Wd.add(box(12, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                    // floor (top at 0)
    Wd.add(box(6.4, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));                // white Shabbat tablecloth
    Wd.add(box(6.4, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));            // cloth drape
    for (const x of [-3.0, 3.0]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
  }

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g43)
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

  // ---------------------------------------------------------------- the wall calendar: a board with a face, a blue header, four day pages (Wed, Thu, Fri, Shabbat in gold), a horizon line
  // bx = its centre x
  function mkCal(Wd, bx, seed, dy) {
    const yc = BY + (dy || 0);
    const g = new THREE.Group(); g.position.set(bx, yc, BZ); Wd.add(g);
    const wp = (lx, ly, lz) => [bx + lx, yc + ly, BZ + (lz || 0)];
    const hov = (lx, ly) => [bx + lx, yc + ly - 1.0, -1.2];     // base of a hero standing in front of a page (just under it)
    g.add(box(3.2, 2.4, .08, 0xf1e7cf));                          // the board (local y -1.2..1.2)
    const hd = new THREE.Group(); hd.position.set(0, 1.0, .08); g.add(hd);
    hd.add(box(3.2, .36, .06, 0x2f6ad0));
    const hl = texPlane(3.0, .3, drawTag('ערב שבת', ST.blue), { cw: 512 }); hl.position.z = .04; hd.add(hl);
    g.add(box(2.9, .03, .04, 0x14408f, { pos: [0, .5, .05] }));  // horizon line
    const pages = {};
    const pg = (key, lx, text, fill) => { const p = new THREE.Group(); p.position.set(lx, PY, .06); g.add(p);
      const b = box(.6, .5, .04, fill || 0xfffdf6); p.add(b);
      const lab = texPlane(.54, .35, drawPlain(text), { cw: 512 }); lab.position.z = .025; p.add(lab);
      pages[key] = { p, box: b }; };
    pg('wed', DAY.wed, 'רביעי');
    pg('thu', DAY.thu, 'חמישי');
    pg('fri', DAY.fri, 'שישי');
    pg('sat', DAY.sat, 'שבת', 0xf0c04a);                          // Shabbat page: gold, clean
    const fc = face(Wd, { w: .42, parent: g, pos: [-1.35, -.7, .1], seed });
    return { g, wp, hov, pages, fc };
  }

  // ---------------------------------------------------------------- heroes and props (origin = table top; face on the +z side)
  // silver nail clipper standing on the table: a body, a fixed top and a movable jaw that clicks
  function mkClipper(Wd, x, z, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(SC * .9);
    const S = 0xc8ced6;
    g.add(box(.36, .62, .12, S, { pos: [0, .36, 0] }));                       // silver body
    g.add(box(.3, .08, .14, 0x6a6e78, { pos: [0, .7, 0] }));                   // fixed top
    const jaw = new THREE.Group(); jaw.position.set(-.15, .72, 0); g.add(jaw); // hinge at the left end
    jaw.add(box(.3, .05, .15, 0xdfe6ee, { pos: [.15, .02, 0] }));             // movable jaw
    g.add(box(.12, .06, .08, 0x3a3a44, { pos: [.12, .8, 0] }));               // lever
    const f = face(Wd, { w: .26, parent: g, pos: [0, .36, .1], seed });
    return { g, f, setClick(c) { jaw.rotation.z = -.55 * cl01(c); } };
  }
  // the will scroll standing on the table: a paper that unrolls upward, a label, and a small clipper icon on it
  function mkScroll(Wd, x, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    const rollT = cyl(.05, .05, .74, 0x8a6a4a); rollT.rotation.z = PI / 2; rollT.position.set(0, .9, 0); g.add(rollT);
    const rollB = cyl(.05, .05, .74, 0x8a6a4a); rollB.rotation.z = PI / 2; rollB.position.set(0, 0, 0); g.add(rollB);
    const paper = new THREE.Group(); g.add(paper);            // scale.y grows from the bottom: it unrolls
    paper.add(box(.7, .9, .03, 0xf6ecd0, { pos: [0, .45, 0] }));
    const lab = texPlane(.6, .22, drawPlain('צוואה'), { cw: 512 }); lab.position.set(0, .8, .025); paper.add(lab);
    const ic = new THREE.Group(); ic.position.set(0, .4, .03); paper.add(ic);
    ic.add(box(.3, .1, .03, 0xc8ced6)); ic.add(box(.08, .05, .04, 0x6a6e78, { pos: [-.13, .0, 0] }));
    const seal = ball(.05, 0xc4161c, { ink: false }); seal.position.set(0, .12, .03); paper.add(seal);
    return { g, paper, iconAt: [x, TOPY + .4, z + .05] };
  }
  // growth-free barrier, lock and curved arrow pieces
  function mkLock(Wd) {
    const g = new THREE.Group(); Wd.add(g); g.scale.setScalar(.001);
    g.add(box(.2, .16, .06, 0x6a6e78, { pos: [0, 0, 0] }));
    g.add(cyl(.045, .045, .12, 0x9a9a9a, { pos: [0, .14, 0] }));
    return g;
  }
  // a row of small green balls from A to B that rise in an arc; the last one is the arrow head
  function mkArc(Wd, A, B, lift, n) {
    const segs = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, p = [lerp(A[0], B[0], u), lerp(A[1], B[1], u) + lift * Math.sin(PI * u), lerp(A[2], B[2], u)];
      const m = ball(i === n ? .09 : .04, 0x3f9a4a, { ink: false }); m.position.set(p[0], p[1], p[2]); m.scale.setScalar(.001); Wd.add(m); segs.push(m);
    }
    return segs;
  }
  // a dish on the table for the clippings
  function mkDish(Wd, x, z) {
    const d = cyl(.22, .16, .05, 0xdfe6ee, { pos: [x, TOPY + .03, z] }); Wd.add(d); return d;
  }
  // a small clock is not needed in this episode; the clipper and the calendar carry the story

  // standard four-shot camera: wide -> medium on the action -> insert on the object that carries the halacha -> low hero
  // Z = pull-back factor: every distance is multiplied, so tags and panels stay inside the frame
  const Z = 1.35;
  const std = (n, c) => cuts([
    [3.5, HH(truck([c.wide[0], c.wide[1], -1.0], { dur: 3.5, dist0: (c.wd || 6.4) * Z, dist1: ((c.wd || 6.4) - .2) * Z, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4 * Z, dist1: 3.0 * Z, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6 * Z, dist1: 2.5 * Z, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4 * Z, dist1: 3.6 * Z, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the clipper's face, pull out; the clipper clicks; the calendar behind with a moon hovering over the gold Friday and Shabbat pages; "?" above
  function hook(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL, -.45);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    cal.pages.fri.box.material.color.copy(GOLD);
    const moon = bb(Wd, .5, .5, drawCrescent, 256);
    const moonAt = cal.wp(-.7, .65, .2);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      cl.g.position.set(CLX, TOPY, CLZ);
      cl.setClick(Math.max(0, Math.sin(t * 6)));
      cl.f.set(t, { talk: t > 2 ? .35 * talkAmt(t, SEED_CLIP) : 0, smile: .2, look: [.3, 0] });
      cal.fc.set(t, { talk: 0, smile: .3, look: [.6, 0] });
      moon.set([moonAt[0], moonAt[1] + .03 * Math.sin(t * 3), moonAt[2]], popE(P(1.0, 2.0, t)) * .9, 0);
      qT.set([CLX, 2.1, CLZ], popE(P(1.4, 2.2, t)) * NUM, .05 * Math.sin(t * 4));
    });
    Wd.center = [0, 0]; Wd.occ = [qT.g]; Wd.qPos = [CLX, 0]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([CLX, 1.24, CLZ], { dur: 3.6, dist0: .6, dist1: 2.0, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([CLX + .2, 1.1, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.3, 0], { dur: 6.0, dist0: 3.2, dist1: 4.6, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (neutral): the moon "ראש חודש" glides down and lands on the Friday page; the page turns silver; tag "ראש חודש"
  function s1(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const moon = bb(Wd, .5, .5, drawCrescent, 256);
    const tN = tag(Wd, 'ראש חודש', 'blue', 2.4);
    const MS = cal.wp(DAY.fri, 1.0, .2), MA = cal.wp(DAY.fri, PY + .1, .2);
    Wd.on(t => {
      cl.g.position.set(CLX, TOPY, CLZ);
      cl.setClick(Math.max(0, Math.sin(t * 2.5)) * .4);
      cl.f.set(t, { talk: .4 * talkAmt(t, SEED_CLIP), smile: .4, look: [.3, 0] });
      const u = sm(P(.6, 2.6, t));
      moon.set([MS[0], lerp(MS[1], MA[1], u), MS[2]], popE(P(.4, 1.0, t)) * .9, 0);
      col(cal.pages.fri.box, WHITE, SILVER, P(2.4, 3.4, t));
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .3, look: [.6, 0] });
      tN.set([0, 2.2, -.5], popE(P(3.4, 4.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    Wd.cam = std(4, { wide: [0, 1.5, 0], wd: 2.6, med: [-.5, 1.9, -.4], pm: 2.6, ins: [DAY.fri, 2.3, -1.6], pi: 3.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (bad): the will scroll "צוואה" unrolls in front; on it a small clipper icon with a red cross; red cross + shock; tag "אין לגזוז"
  function s2(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const scr = mkScroll(Wd, 1.0, .6);
    const cr = mark3d(Wd, 'cross', .45), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'אין לגזוז', 'red', 2.2);
    const crossAt = [scr.iconAt[0], scr.iconAt[1], scr.iconAt[2] + .08];
    Wd.on(t => {
      cl.g.position.set(CLX, TOPY, CLZ);
      scr.paper.scale.y = Math.max(.03, sm(P(.4, 2.2, t)));
      cl.setClick(0);
      cr.set(crossAt, popE(P(3.0, 3.8, t)) * .45, .04 * Math.sin(t * 3));
      sk.set(crossAt, P(3.0, 3.8, t), 1.0);
      cl.f.set(t, { talk: .4 * talkAmt(t, SEED_CLIP), smile: -.5, look: [.6, 0], surprise: sm(P(3.0, 3.8, t)) });
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .2, look: [-.4, 0] });
      tN.set([0, 2.2, -.5], popE(P(4.2, 5.0, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g];
    Wd.cam = std(8, { wide: [.2, 1.5, 0], wd: 2.6, med: [.5, 1.4, .4], pm: 3.4, ins: [1.0, 1.3, .7], pi: 3.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (bad): the clipper hops from the Thursday side toward the Friday page and bumps into a red barrier; a lock icon on the Friday page; the clipper looks sad; red cross; tag "אי אפשר"
  function s3(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const cr = mark3d(Wd, 'cross', .5), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'אי אפשר', 'red', 2.0);
    const bar = box(.06, .9, .12, 0xe04040, { pos: [-.1, CLK_HOV, -1.2] }); Wd.add(bar);
    const lock = mkLock(Wd); lock.position.set(...cal.wp(DAY.fri, PY + .22, .2));
    const TH = cal.hov(DAY.thu, PY), STOP = [.22, CLK_HOV, -1.2];
    const keys = [[0, TH], [1.0, TH], [2.6, STOP], [dur, STOP]];
    const crossAt = [-.1, 1.9, -1.1];
    Wd.on(t => {
      const p = pathAt(t, keys);
      const shake = t > 2.6 && t < 3.6 ? .04 * Math.sin(t * 40) : 0;
      cl.g.position.set(p[0] + shake, p[1], p[2]);
      cl.setClick(0);
      lock.scale.setScalar(Math.max(.001, popE(P(2.0, 2.8, t))));
      cr.set(crossAt, popE(P(3.0, 3.8, t)) * .5, .04 * Math.sin(t * 3));
      sk.set(crossAt, P(3.0, 3.8, t), 1.0);
      cl.f.set(t, { talk: .4 * talkAmt(t, SEED_CLIP), smile: -.6, look: [-.3, 0], surprise: sm(P(3.0, 3.8, t)) });
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: -.2, look: [-.3, 0] });
      tN.set([0, 2.2, -.5], popE(P(4.0, 4.8, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g];
    Wd.cam = std(12, { wide: [0, 1.5, 0], wd: 2.6, med: [-.2, 1.8, -.3], pm: 3.4, ins: [-.1, 1.5, -1.2], pi: 3.2 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-72 (neutral, 16 s): the clipper turns and looks at the Thursday page to the right of Friday; a big "?" between them; the curved green arrow draws from Friday toward Thursday; tag "להקדים?"
  function s4(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const arrow = mkArc(Wd, [DAY.fri, CLK_HOV, -1.2], [DAY.thu, CLK_HOV, -1.2], .5, 10);
    const qT = tag(Wd, '?', 'grey', .8);
    const tN = tag(Wd, 'להקדים?', 'orange', 2.4);
    const STOP = [.22, CLK_HOV, -1.2];
    Wd.on(t => {
      cl.g.position.set(STOP[0], STOP[1], STOP[2]);
      cl.g.rotation.y = -.45 * sm(P(.2, 1.4, t));              // turns to look right, toward Thursday
      cl.setClick(0);
      cl.f.set(t, { talk: .3 * talkAmt(t, SEED_CLIP), smile: .1, look: [.8, 0] });
      arrow.forEach((m, i) => m.scale.setScalar(Math.max(.001, popE(P(1.2 + i * .45, 1.5 + i * .45, t)))));
      qT.set([0, 2.5, -.5], popE(P(.6, 1.4, t)) * .8, .05 * Math.sin(t * 3));
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .1, look: [.2, 0] });
      tN.set([0, 2.2, -.5], popE(P(5.0, 5.8, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, qT.g];
    const C4 = [-.4, 2.3, -1.6];                                                   // pulled back and higher: the header stays below the top 15% of the frame
    Wd.cam = cuts([
      [3.5, HH(truck([0, 2.2, -1.0], { dur: 3.5, dist0: 3.6, dist1: 3.4, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 16)],
      [4.0, HH(punch(pushIn(C4, { dur: 4.0, dist0: 4.9, dist1: 4.6, h0: .5, h1: .5, a0: 8, a1: -6, fov0: 40, fov1: 40 }), [3.0]), 17)],
      [3.5, HH(punch(insert([0, 2.3, -1.6], { dur: 3.5, dist0: 4.2, dist1: 3.9, h0: .3, h1: .3, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [9.6]), 18)],
      [5.0, HH(pullOut([0, 2.3, -1.6], { dur: 5.0, dist0: 5.0, dist1: 4.8, h0: .5, h1: .6, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 19)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 72-86 (good): the arrow is complete and the Thursday page lights green; the clipper clicks happily over it; white crescent clippings fall into the dish; green check + sparkles; tag "מותר"
  function s5(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const arrow = mkArc(Wd, [DAY.fri, CLK_HOV, -1.2], [DAY.thu, CLK_HOV, -1.2], .5, 10);
    arrow.forEach(m => m.scale.setScalar(1));
    const TH = [DAY.thu, CLK_HOV, -1.2];
    const dish = mkDish(Wd, DAY.thu, -.9);
    const flakes = [0, 1, 2, 3, 4, 5].map(i => { const m = box(.05, .02, .05, 0xffffff); Wd.add(m); return m; });
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const checkAt = cal.wp(DAY.thu + .22, PY + .27, .2);
    const tN = tag(Wd, 'מותר', 'green', 2.0);
    Wd.on(t => {
      cl.g.position.set(TH[0], TH[1], TH[2]);
      cl.g.rotation.y = -.45;
      cl.setClick(t > .6 && t < 4.5 ? Math.max(0, Math.sin(t * 9)) : 0);
      col(cal.pages.thu.box, WHITE, GREEN, P(.4, 1.2, t));
      flakes.forEach((m, i) => {
        const a = 1.6 + i * .35, u = sm(P(a, a + 1.2, t));
        m.position.set(TH[0] - .05 + .03 * i, lerp(TH[1] - .1, TOPY + .1, u), lerp(TH[2] + .25, -.9, u));
        m.rotation.z = t * 2 + i;
        m.scale.setScalar(t > a ? Math.max(.001, 1 - sm(P(a + 1.0, a + 1.3, t))) : .001);
      });
      chk.set(checkAt, popE(P(3.4, 4.2, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(checkAt, P(3.4, 4.2, t), 1.0);
      cl.f.set(t, { talk: .4 * talkAmt(t, SEED_CLIP), smile: .5 + .5 * sm(P(3.4, 4.2, t)), look: [.4, 0] });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .3 + .6 * sm(P(3.4, 4.2, t)), look: [.5, 0] });
      tN.set([0, 2.2, -.5], popE(P(3.6, 4.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, chk.g];
    Wd.cam = std(16, { wide: [0, 1.5, 0], wd: 2.6, med: [.2, 1.7, -.5], pm: 3.6, ins: [DAY.thu, 2.4, -1.6], pi: 3.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (good): the Thursday and Friday pages flip away and the calendar lands on Shabbat with a gold star; the clipper bows proudly; a green ribbon "לכבוד שבת"; tag "לשבת"
  function s6(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const cl = mkClipper(Wd, CLX, CLZ, SEED_CLIP);
    const star = ball(.12, 0xffc23a, { ink: false }); Wd.add(star);
    const rib = tag(Wd, 'לכבוד שבת', 'green', 2.0);
    const tN = tag(Wd, 'לשבת', 'gold', 2.0);
    const TH = cal.hov(DAY.thu, PY), SA = cal.hov(DAY.sat, PY);
    const keys = [[0, TH], [1.0, TH], [3.0, SA], [dur, SA]];
    const starAt = cal.wp(DAY.sat, PY + .3, .2), ribAt = cal.wp(DAY.sat + .6, -.9, .3);
    Wd.on(t => {
      const p = pathAt(t, keys);
      cl.g.position.set(p[0], p[1], p[2]);
      cl.g.rotation.y = 0;
      cl.g.rotation.x = .35 * sm(P(3.8, 4.6, t)) * (1 - sm(P(5.2, 6.0, t)));   // bow forward, then straighten
      cl.setClick(0);
      cal.pages.thu.p.scale.x = Math.max(.02, 1 - sm(P(.4, 1.6, t)));          // Thursday page flips away
      cal.pages.fri.p.scale.x = Math.max(.02, 1 - sm(P(1.2, 2.4, t)));         // Friday page flips away
      star.position.set(starAt[0], starAt[1], starAt[2]); star.scale.setScalar(Math.max(.001, popE(P(2.4, 3.2, t))));
      rib.set([ribAt[0], ribAt[1], ribAt[2]], popE(P(3.6, 4.4, t)) * .9, 0);
      cl.f.set(t, { talk: .4 * talkAmt(t, SEED_CLIP), smile: .6 + .4 * sm(P(3.8, 4.6, t)), look: [-.4, 0] });
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .5, look: [-.4, 0] });
      tN.set([0, 2.2, -.5], popE(P(5.4, 6.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, rib.g];
    Wd.cam = std(32, { wide: [0, 1.5, 0], wd: 2.6, med: [-.5, 1.8, -.4], pm: 4.2, ins: [DAY.sat, 2.4, -1.6], pi: 4.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the calendar on the right; the clipper happy over the green Thursday page; the Friday page silver with the moon; the Shabbat page gold with a star; slow crane; no red cross
  function answerBg(dur) {
    const Wd = kW(); sceneSet(Wd);
    const cal = mkCal(Wd, 1.9, SEED_CAL);
    cal.pages.thu.box.material.color.copy(GREEN);
    cal.pages.fri.box.material.color.copy(SILVER);
    const moon = bb(Wd, .5, .5, drawCrescent, 256);
    const moonAt = cal.wp(DAY.fri, PY + .1, .2);
    const star = ball(.12, 0xffc23a, { ink: false }); const starAt = cal.wp(DAY.sat, PY + .3, .2); star.position.set(starAt[0], starAt[1], starAt[2]); Wd.add(star);
    const cl = mkClipper(Wd, 0, 0, SEED_CLIP); cl.g.scale.setScalar(SC * 1.0);
    Wd.on(t => {
      const p = cal.hov(DAY.thu, PY);
      cl.g.position.set(p[0], p[1], p[2]);
      cl.setClick(Math.max(0, Math.sin(t * 3)) * .5);
      cl.f.set(t, { talk: .3 * talkAmt(t, SEED_CLIP), smile: 1, look: [-.5, 0] });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .7, look: [-.5, 0] });
      moon.set([moonAt[0], moonAt[1] + .02 * Math.sin(t * 2), moonAt[2]], .9, 0);
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([1.6, 1.6, -1.0], { dur: 20, dist0: 5.0, dist1: 4.6, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
