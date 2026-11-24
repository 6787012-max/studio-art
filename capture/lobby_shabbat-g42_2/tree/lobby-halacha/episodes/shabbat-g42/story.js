// shabbat-g42 story (24/11/2026) - washing clothes: on Thursday (Ezra's enactment), not on Friday; Shabbat clothes forgotten may be washed on Friday all day; Friday night is like Thursday.
// Section C of storyboards_v24.md. Objects only, no people. Copied from shabbat-g41 (wall calendar with a face, day pages, tags, camera helpers); the havdala cup is replaced by a washing machine.
// v3: calendar order right-to-left as Hebrew reads (screen left to right: שבת, יום שישי, ליל שישי, יום חמישי); machine on the far left (beats 2, 4, 5, hook) or left (1, 3, 6) so the halacha page stays visible; cross and tags mid-frame; shirt enters the machine on camera; answer shirt large on the right.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, crane, lowHero, insert, handheld, punch, pushIn, face, talkAmt,
          mark3d, shock, popE, ease, prog, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const cl01 = x => Math.min(1, Math.max(0, x));
  const TOPY = .8, NUM = .6;
  const MXL = -1.5, MXF = -2.5;                           // machine: left (-1.5) or far left (-2.5), so the halacha page on the board stays visible
  const BKR = 2.6;                                        // basket / shirt table position on the right
  const doorAt = x => [x, TOPY + .58, .7];                // the machine door, a point just in front of the glass
  const S = 1.5;                                          // calendar scale
  const BY = 2.1, BZ = -1.76;                             // calendar: centre height and depth on the back wall
  const PXL = { sab: -1.2, fri: -.4, lil: .4, thu: 1.2 }; // day pages, local (unscaled); screen left to right: שבת, יום שישי, ליל שישי, יום חמישי
  const PXW = { sab: -1.8, fri: -.6, lil: .6, thu: 1.8 }; // day pages, world x
  const SEED_M = 71, SEED_CAL = 62;
  const WHITE = new THREE.Color(0xfffdf6), GREEN = new THREE.Color(0x7fd97a), ORANGE = new THREE.Color(0xf0a050);
  const INK = '#1f2a44';
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], red: ['#ffe6e6', '#8a1010', '#e04040'] };
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

  // ---------------------------------------------------------------- world: day or night, warm wooden back wall, table with a white cloth
  const kW = night => night
    ? mkWorld({ skyTop: 0x1b2a55, skyBottom: 0x3a4f85, fogColor: 0x25345f, fogNear: 26, fogFar: 100, hemi: 1.0, sun: .7, sunPos: [-9, 22, 12], shadowExt: 10 })
    : mkWorld({ skyTop: 0x9ad0f6, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 30, fogFar: 110, hemi: 1.05, sun: .9, sunPos: [-9, 22, 12], shadowExt: 10 });
  function sceneSet(Wd, night) {
    Wd.add(box(12, 5, .3, night ? 0x7a4f32 : 0xe2c49a, { pos: [0, 2.5, -2.0] }));     // back wall (front face at z -1.85)
    Wd.add(box(12, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                    // floor (top at 0)
    Wd.add(box(6.4, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));                // white Shabbat tablecloth
    Wd.add(box(6.4, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));            // cloth drape
    for (const x of [-3.0, 3.0]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
  }

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g41)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, st) => (c, W, H) => {
    c.fillStyle = st[0]; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = st[2]; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = st[1]; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const drawPlain = (text) => (c, W, H) => {             // dark text on the paper, no border; the text fills the page width
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .94, maxLines: 1, max: H * .8, min: H * .18, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = INK; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const tag = (Wd, text, style, w) => bb(Wd, w, .5, drawTag(text, ST[style]), w > 1.6 ? 900 : 520);
  const tagS = (Wd, text, style, w) => bb(Wd, w, .26, drawTag(text, ST[style]), 520);
  const tagBig = (Wd, text, style) => tag(Wd, text, style, 2.2);   // large tag, 2.2 wide
  const mkDots = (Wd, n, c, r) => { const ds = []; for (let i = 0; i < n; i++) { const d = ball(r, c, { ink: false }); Wd.add(d); ds.push(d); } return ds; };
  // bubbles / foam rising from a point: each one loops up and fades in and out
  function flow(bs, t, base, amp, span) {
    bs.forEach((b, i) => { const ph = (t * .3 + i / bs.length) % 1; b.position.set(base[0] + .3 * Math.sin(i * 2.3 + t * .9), base[1] + span * ph, base[2]); b.scale.setScalar(Math.max(.001, Math.sin(PI * ph) * amp)); });
  }

  // ---------------------------------------------------------------- the wall calendar (scaled up): a board with a face and four day pages, screen left to right: שבת, יום שישי, ליל שישי, יום חמישי
  function mkCal(Wd, bx, seed) {
    const g = new THREE.Group(); g.position.set(bx, BY, BZ); g.scale.setScalar(S); Wd.add(g);
    g.add(box(3.3, 1.7, .08, 0xf1e7cf));                                                  // the board
    g.add(box(3.3, .14, .1, 0x2f6ad0, { pos: [0, .78, .02] }));                           // blue top strip
    const pages = {};
    const pg = (key, lx, text) => {
      const p = new THREE.Group(); p.position.set(lx, .12, .06); g.add(p);
      const b = box(.64, .6, .04, 0xfffdf6); p.add(b);
      const lab = texPlane(.6, .5, drawPlain(text), { cw: 512 }); lab.position.z = .025; p.add(lab);
      pages[key] = { p, box: b };
    };
    pg('sab', PXL.sab, 'שבת'); pg('fri', PXL.fri, 'יום שישי'); pg('lil', PXL.lil, 'ליל שישי'); pg('thu', PXL.thu, 'יום חמישי');
    const fc = face(Wd, { w: .34, parent: g, pos: [0, -.5, .1], seed });
    return { g, pages, fc };
  }

  // ---------------------------------------------------------------- the "=" sign between the night page and the Thursday page: two big green bars, s = 0..1 size
  function mkEq(Wd) {
    const a = box(.22, .11, .05, 0x1f6a2a, { pos: [1.2, BY + .3, BZ + .12], ink: false });
    const b = box(.22, .11, .05, 0x1f6a2a, { pos: [1.2, BY + .02, BZ + .12], ink: false });
    Wd.add(a); Wd.add(b);
    return { set(s) { const e = Math.max(.001, s); a.scale.setScalar(e); b.scale.setScalar(e); } };
  }

  // ---------------------------------------------------------------- the washing machine (hero): white body, round glass door, a face on the panel above the door, a drum that turns
  // origin = table top under the machine; the face sits on the +z side
  function mkMachine(Wd, x, z, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    g.add(box(1.3, 1.4, .9, 0xf4f7fb, { pos: [0, .7, 0] }));                              // white body
    g.add(box(1.36, .1, .96, 0x9aa6b4, { pos: [0, 1.45, 0] }));                           // top lid
    g.add(cyl(.4, .4, .06, 0xc9d3de, { pos: [0, .58, .47], rot: [PI / 2, 0, 0] }));        // door rim
    g.add(cyl(.34, .34, .05, 0x3e5f7a, { pos: [0, .58, .5], rot: [PI / 2, 0, 0] }));       // glass
    g.add(cyl(.04, .04, .05, 0x2a2d34, { pos: [.45, 1.02, .47], rot: [PI / 2, 0, 0] }));   // knob
    const f = face(Wd, { w: .4, parent: g, pos: [0, 1.2, .47], seed });
    const drum = new THREE.Group(); drum.position.set(0, .58, .54); g.add(drum);
    drum.add(cyl(.3, .3, .02, 0xbfd6ea, { rot: [PI / 2, 0, 0] }));
    const dc = [0xe04040, 0xf0c040, 0x3f7fd0, 0xffffff];
    for (let i = 0; i < 4; i++) { const a = i * PI / 2 + .6; drum.add(ball(.07, dc[i], { pos: [.16 * Math.cos(a), .16 * Math.sin(a), .03], ink: false })); }
    const shield = box(.8, .8, .05, 0xdfe8f2, { pos: [0, .58, .64] }); shield.scale.setScalar(.001); g.add(shield);   // a shutter that drops in front of the door (bad beats)
    return { g, f, shield, spin(ang) { drum.rotation.z = ang; } };
  }

  // ---------------------------------------------------------------- laundry basket with three ordinary garments (separate meshes, so they can hop out)
  function mkBasket(Wd, x, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    g.add(box(.9, .36, .62, 0xc9a574, { pos: [0, .18, 0] }));
    g.add(box(.94, .05, .66, 0x9a7a4a, { pos: [0, .36, 0] }));
    const cols = [0xe05a5a, 0x5a9ae0, 0xf0c040];
    const items = cols.map((c, i) => { const m = box(.26, .14, .22, c, { pos: [x + (i - 1) * .26, TOPY + .47, z + (i % 2) * .08 - .04] }); Wd.add(m); return m; });
    return { g, items, start: items.map(m => [m.position.x, m.position.y, m.position.z]) };
  }

  // ---------------------------------------------------------------- the white Shabbat shirt with a gold star and a hanger (a shirt shape only); sc = size; origin = centre of the body
  function mkShirt(Wd, sc) {
    const g = new THREE.Group(); Wd.add(g); g.scale.setScalar(sc);
    g.add(box(.42, .5, .05, 0xffffff, { pos: [0, 0, 0] }));
    g.add(box(.14, .38, .05, 0xffffff, { pos: [-.28, .06, 0], rot: [0, 0, .35] }));
    g.add(box(.14, .38, .05, 0xffffff, { pos: [.28, .06, 0], rot: [0, 0, -.35] }));
    g.add(ball(.05, 0xd9a63a, { pos: [0, .12, .04], ink: false }));                       // gold star
    g.add(box(.2, .03, .03, 0x9aa6b4, { pos: [0, .32, 0], ink: false }));                 // hanger bar
    g.add(box(.02, .14, .02, 0x9aa6b4, { pos: [0, .4, 0], ink: false }));                 // hanger hook
    return g;
  }

  // ---------------------------------------------------------------- old washboard in a tub (the hand-washing way), origin = table top
  function mkWashboard(Wd, x, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(1.2);
    g.add(box(.8, .4, .6, 0x6fa3c9, { pos: [0, .2, 0] }));                                // tub of water
    const bd = new THREE.Group(); bd.position.set(0, .8, 0); bd.rotation.x = -.18; g.add(bd);
    bd.add(box(.56, .95, .06, 0xd9a86a, { pos: [0, 0, 0] }));
    for (let i = 0; i < 4; i++) bd.add(box(.5, .04, .08, 0xb88a50, { pos: [0, -.3 + i * .2, .05], ink: false }));
    return g;
  }

  // ---------------------------------------------------------------- a thick arrow from a to b (both in the same z plane); s = 0..1 how much of it is drawn
  function mkArrow(Wd, hex) {
    const g = new THREE.Group(); Wd.add(g);
    const sh = box(1, .12, .08, hex, { ink: false }); g.add(sh);
    const hd = cyl(.001, .2, .3, hex, { ink: false }); hd.rotation.z = -PI / 2; g.add(hd);
    return { g, set(a, b, s) {
      g.visible = s > .01; if (!g.visible) return;
      const L = Math.max(.001, Math.hypot(b[0] - a[0], b[1] - a[1]) * s);
      g.position.set(a[0], a[1], a[2]); g.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
      sh.position.x = L / 2; sh.scale.x = L; hd.position.x = L + .05; hd.scale.setScalar(Math.min(1, s * 1.5));
    } };
  }

  // ---------------------------------------------------------------- a scroll lying on the table that unrolls (u = 0..1)
  function mkScroll(Wd, x, z) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    const paper = box(.9, .02, .5, 0xf3e3bb, { pos: [0, .01, 0] }); g.add(paper);
    const rl = cyl(.06, .06, .54, 0xb8925a, { pos: [-.45, .06, 0], rot: [PI / 2, 0, 0] }); g.add(rl);
    const rr = cyl(.06, .06, .54, 0xb8925a, { pos: [.45, .06, 0], rot: [PI / 2, 0, 0] }); g.add(rr);
    return { set(u) { const e = Math.max(.02, u); paper.scale.x = e; rl.position.x = -.45 * e; rr.position.x = .45 * e; } };
  }

  // ---------------------------------------------------------------- a progress bar that fills from the left (u = 0..1), 2.2 wide
  function mkBar(Wd, x, y, z) {
    const W = 2.2, g = new THREE.Group(); Wd.add(g); g.position.set(x, y, z);
    g.add(box(W, .32, .06, 0xdddddd, { pos: [W / 2, 0, 0] }));
    const fill = box(W, .26, .07, 0x3f9a4a, { pos: [W / 2, 0, .01], ink: false }); g.add(fill);
    return { set(u) { const e = Math.max(.001, u); fill.scale.x = e; fill.position.x = W / 2 * e; } };
  }

  // standard four-shot camera: wide -> medium on the action -> insert on the object that carries the halacha -> low hero
  // Z = pull-back factor: every distance is multiplied, so tags and panels stay inside the frame
  const Z = 1.35;
  const std = (n, c) => cuts([
    [3.5, HH(truck(c.wide, { dur: 3.5, dist0: (c.wd || 6.4) * Z, dist1: ((c.wd || 6.4) - .2) * Z, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4 * Z, dist1: 3.0 * Z, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6 * Z, dist1: 2.5 * Z, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4 * Z, dist1: 3.6 * Z, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the machine's face, pull out; the drum spins; the Friday page on the calendar glows; "?" above
  function hook(dur) {
    const Wd = kW(false); sceneSet(Wd, false);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const mc = mkMachine(Wd, MXF, 0, SEED_M);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      mc.spin(t * 2.4);
      mc.f.set(t, { talk: t > 2 ? .35 * talkAmt(t, SEED_M) : 0, smile: .2, look: [.3, 0] });
      col(cal.pages.fri.box, WHITE, ORANGE, P(3.0, 5.0, t));
      cal.fc.set(t, { talk: 0, smile: .3, look: [.6, 0] });
      qT.set([MXF, 2.4, .5], popE(P(1.4, 2.2, t)) * NUM, .05 * Math.sin(t * 4));
    });
    Wd.center = [0, 0]; Wd.occ = [qT.g]; Wd.qPos = [MXF, 0]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([MXF, 1.95, .5], { dur: 3.6, dist0: .7, dist1: 2.2, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([MXF + .2, 1.6, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.5, 0], { dur: 6.0, dist0: 3.4, dist1: 5.0, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (good): the machine on the left; a scroll "תקנת עזרא" unrolls mid-frame; the Thursday page (far right) turns green; green check mid-frame; tag "ביום חמישי"
  function s1(dur) {
    const Wd = kW(false); sceneSet(Wd, false);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const mc = mkMachine(Wd, MXL, 0, SEED_M);
    const scr = mkScroll(Wd, .9, .5);
    const bubs = mkDots(Wd, 6, 0xe6f6ff, .07);
    const ck = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const tN = tag(Wd, 'ביום חמישי', 'green', 2.4), tS = tagBig(Wd, 'תקנת עזרא', 'gold');
    Wd.on(t => {
      scr.set(sm(P(.4, 2.0, t)));
      tS.set([.9, 1.8, 1.2], popE(P(1.8, 2.6, t)) * NUM, 0);
      col(cal.pages.thu.box, WHITE, GREEN, P(3.0, 4.0, t));
      mc.spin(t * 2.8);
      mc.f.set(t, { talk: t > 4 ? .35 * talkAmt(t, SEED_M) : 0, smile: .3 + .6 * sm(P(4, 6, t)), look: [.4, 0] });
      flow(bubs, t, [MXL + .35, 1.2, .8], .9 * sm(P(4, 5, t)), 1.1);
      ck.set([-.6, 1.8, 1.2], popE(P(4.4, 5.2, t)) * .6, .04 * Math.sin(t * 3));
      sk.set([-.6, 1.8, 1.2], P(4.4, 5.2, t), 1.0);
      tN.set([0, .95, .9], popE(P(5.6, 6.4, t)) * NUM, 0);
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .3 + .4 * sm(P(4, 6, t)), look: [-.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, ck.g, tS.g];
    Wd.cam = std(4, { wide: [0, 1.5, 0], wd: 6.6, med: [.2, 1.6, .4], pm: 4.8, ins: [PXW.thu, BY + .18, BZ + .3], pi: 8.8 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (bad): the machine far left; the Friday page turns orange; the garments jump toward the door and bounce back; a red cross on the Friday page mid-frame; "אין לכבס" directly under it; tag "לא ביום שישי"
  function s2(dur) {
    const Wd = kW(false); sceneSet(Wd, false);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const mc = mkMachine(Wd, MXF, 0, SEED_M);
    const bk = mkBasket(Wd, BKR, .2);
    const cr = mark3d(Wd, 'cross', .6), sk = shock(Wd, 0xff6a6a);
    const tN = tag(Wd, 'לא ביום שישי', 'red', 2.6), tX = tagBig(Wd, 'אין לכבס', 'red');
    const crossAt = [PXW.fri, 2.25, 1.0];
    Wd.on(t => {
      col(cal.pages.fri.box, WHITE, ORANGE, sm(P(.4, 1.4, t)));
      mc.spin(t * 1.2);
      // the garments jump toward the door, bounce back when the shutter drops
      bk.items.forEach((m, i) => {
        const s0 = bk.start[i], tg = [MXF + (i - 1) * .3, TOPY + .58, 1.05];
        const p = pathAt(t, [[0, s0], [1.2, s0], [2.6, tg], [3.4, tg], [4.8, s0], [dur, s0]]);
        m.position.set(p[0], p[1], p[2]);
      });
      mc.shield.scale.setScalar(Math.max(.001, popE(P(3.0, 3.6, t))));
      cr.set(crossAt, popE(P(3.4, 4.0, t)) * .6, .04 * Math.sin(t * 3));
      sk.set(crossAt, P(3.4, 4.2, t), 1.0);
      tX.set([PXW.fri, 1.45, 1.0], popE(P(3.8, 4.4, t)) * NUM, 0);
      mc.f.set(t, { talk: .4 * talkAmt(t, SEED_M), smile: -.6, look: [.5, 0], surprise: sm(P(3.4, 4.0, t)) });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: -.4, look: [-.4, 0], surprise: sm(P(3.4, 4.0, t)) });
      tN.set([0, .95, .9], popE(P(5.0, 5.8, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, cr.g, tX.g];
    Wd.cam = std(8, { wide: [0, 1.5, 0], wd: 6.6, med: [-.4, 1.8, .6], pm: 3.6, ins: [PXW.fri, BY + .18, BZ + .3], pi: 9.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (neutral): the machine on the left, an old washboard on the right; two big arrows rise toward the green Thursday page (far right); tag "גם במכונה" big
  function s3(dur) {
    const Wd = kW(false); sceneSet(Wd, false);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const mc = mkMachine(Wd, MXL, 0, SEED_M);
    mkWashboard(Wd, 2.6, .2);
    const bubs = mkDots(Wd, 5, 0xffffff, .09);
    const a1 = mkArrow(Wd, 0x3f9a4a), a2 = mkArrow(Wd, 0x3f9a4a);
    const tN = tagBig(Wd, 'גם במכונה', 'blue');
    Wd.on(t => {
      col(cal.pages.thu.box, WHITE, GREEN, P(.6, 1.4, t));
      const grow = sm(P(1.6, 3.2, t));
      a1.set([3.2, 2.3, .75], [2.3, 2.7, .75], grow);
      a2.set([MXL + .75, 1.7, .75], [.6, 2.6, .75], grow);
      flow(bubs, t, [2.6, 1.9, .3], .8 * sm(P(.6, 1.2, t)), 1.0);
      mc.spin(t * 1.6);
      mc.f.set(t, { talk: .3 * talkAmt(t, SEED_M), smile: .5, look: [.4, 0] });
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .4, look: [.5, 0] });
      tN.set([0, 1.9, 1.2], popE(P(.4, 1.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    Wd.cam = std(12, { wide: [0, 1.6, 0], wd: 5.2, med: [.2, 1.9, .3], pm: 4.2, ins: [PXW.thu, BY + .18, BZ + .3], pi: 9.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-72 (good, 16 s): the machine far left; the Shabbat shirt is forgotten in the basket on the right and shakes; the Friday page turns green; the big shirt hops over to the machine and goes in; green check; tag "בגדי שבת" on screen from 58 s
  function s4(dur) {
    const Wd = kW(false); sceneSet(Wd, false);
    const cal = mkCal(Wd, 0, SEED_CAL);
    const mc = mkMachine(Wd, MXF, 0, SEED_M);
    mkBasket(Wd, BKR, .2);
    const sh = mkShirt(Wd, 2.0);
    const SH0 = [BKR, TOPY + .9, .3], DR = doorAt(MXF);
    const keys = [[0, SH0], [4.0, SH0], [8.0, DR]];
    const ck = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const tN = tagBig(Wd, 'בגדי שבת', 'green');
    Wd.on(t => {
      col(cal.pages.fri.box, WHITE, GREEN, P(.4, 1.2, t));
      const p = pathAt(t, keys);
      sh.position.set(p[0], p[1], p[2]);
      sh.rotation.z = t < 4.0 ? .2 * Math.sin(t * 14) : 0;
      sh.scale.setScalar(Math.max(.001, 2.0 * (1 - sm(P(7.6, 8.4, t)))));
      mc.spin(t * 2 + .5 * Math.max(0, t - 8) * Math.max(0, t - 8));
      mc.f.set(t, { talk: t > 9 ? .3 * talkAmt(t, SEED_M) : 0, smile: .2 + .7 * sm(P(8, 9.5, t)), look: [.4, 0] });
      ck.set([MXF + 1.2, 1.9, 1.0], popE(P(9.0, 9.8, t)) * .6, .04 * Math.sin(t * 3));
      sk.set([MXF + 1.2, 1.9, 1.0], P(9.0, 9.8, t), 1.0);
      tN.set([0, 1.9, 1.2], popE(P(2.0, 2.8, t)) * NUM, 0);
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .4 + .4 * sm(P(.4, 1.2, t)), look: [-.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, ck.g];
    Wd.cam = cuts([
      [3.5, HH(truck([0, 1.6, 0], { dur: 3.5, dist0: 7.0, dist1: 6.8, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), 30)],
      [4.0, HH(punch(pushIn([-.6, 1.7, .4], { dur: 4.0, dist0: 4.6, dist1: 4.0, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [3.0]), 31)],
      [4.5, HH(punch(insert([MXF + .1, 1.4, .6], { dur: 4.5, dist0: 3.6, dist1: 3.3, h0: .3, h1: .3, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [8.0]), 32)],
      [4.0, HH(lowHero([MXF, 1.0, 0], { dur: 4.0, dist0: 3.4 * Z, dist1: 3.6 * Z, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 33)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 72-86 (good): the machine far left; the Friday page is green; a sun travels an arc over it from morning to afternoon; a progress bar "כל היום" fills on the right; tag "כל היום" big
  function s5(dur) {
    const Wd = kW(false); sceneSet(Wd, false);
    const cal = mkCal(Wd, 0, SEED_CAL);
    cal.pages.fri.box.material.color.copy(GREEN);
    const mc = mkMachine(Wd, MXF, 0, SEED_M);
    const bar = mkBar(Wd, .2, 1.0, BZ + .12);
    const sunM = ball(.2, 0xffc23a, { ink: false }); Wd.add(sunM);
    const trail = mkDots(Wd, 9, 0xffd07a, .03);
    const tN = tagBig(Wd, 'כל היום', 'green');
    const sunAt = u => [lerp(-1.4, .2, u), 1.9 + 1.3 * Math.sin(PI * u), -1.2];
    Wd.on(t => {
      const u = sm(P(.6, 12.6, t));
      const s = sunAt(u); sunM.position.set(s[0], s[1], s[2]);
      trail.forEach((d, i) => { const q = sunAt(i / 8); d.position.set(q[0], q[1], q[2]); d.scale.setScalar(Math.max(.001, popE(P(.2 + .08 * i, 1.0 + .08 * i, t)) * .9)); });
      bar.set(sm(P(.8, 12.8, t)));
      mc.spin(t * 2.2);
      mc.f.set(t, { talk: .3 * talkAmt(t, SEED_M), smile: .6, look: [.2, 0] });
      cal.fc.set(t, { talk: 0, smile: .6, look: [-.4, 0] });
      tN.set([0, 1.9, 1.2], popE(P(1.4, 2.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g];
    Wd.cam = std(20, { wide: [0, 1.8, 0], wd: 5.2, med: [-.4, 2.0, -.6], pm: 3.6, ins: [PXW.fri, BY + .18, BZ + .3], pi: 8.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (good, night): the moon rises on the far right; the "ליל שישי" page turns green with a big "=" to the Thursday page; the ordinary garments go into the machine (left); green check; tag "ליל שישי" big
  function s6(dur) {
    const Wd = kW(true); sceneSet(Wd, true);
    const cal = mkCal(Wd, 0, SEED_CAL);
    cal.pages.thu.box.material.color.copy(GREEN);
    const mc = mkMachine(Wd, MXL, 0, SEED_M);
    const bk = mkBasket(Wd, -2.9, .2);
    const moon = ball(.3, 0xfff3c4, { ink: false }); Wd.add(moon);
    const eq = mkEq(Wd);
    const ck = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const tN = tagBig(Wd, 'ליל שישי', 'green');
    const DR = doorAt(MXL);
    Wd.on(t => {
      moon.position.set(3.1, lerp(1.2, 2.9, sm(P(.4, dur - .6, t))), -1.2);
      col(cal.pages.lil.box, WHITE, GREEN, P(1.0, 2.2, t));
      eq.set(popE(P(2.6, 3.4, t)));
      bk.items.forEach((m, i) => {
        const s0 = bk.start[i], t0 = 2.6 + .5 * i;
        const p = pathAt(t, [[t0, s0], [t0 + 1.8, DR]]);
        m.position.set(p[0], p[1], p[2]);
        m.scale.setScalar(Math.max(.001, 1 - sm(P(t0 + 1.2, t0 + 1.8, t))));
      });
      mc.spin(t * 2.4 + .4 * Math.max(0, t - 4) * Math.max(0, t - 4));
      mc.f.set(t, { talk: .3 * talkAmt(t, SEED_M), smile: .3 + .6 * sm(P(7, 9, t)), look: [.2, 0] });
      ck.set([MXL + 1.2, 1.9, 1.0], popE(P(8.6, 9.4, t)) * .6, .04 * Math.sin(t * 3));
      sk.set([MXL + 1.2, 1.9, 1.0], P(8.6, 9.4, t), 1.0);
      tN.set([0, 1.9, 1.2], popE(P(9.6, 10.4, t)) * NUM, 0);
      cal.fc.set(t, { talk: .2 * talkAmt(t, SEED_CAL), smile: .3 + .5 * sm(P(1, 2.5, t)), look: [.6, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = [tN.g, ck.g];
    Wd.cam = std(24, { wide: [.4, 1.7, 0], wd: 5.2, med: [.8, 1.9, -.6], pm: 4.0, ins: [1.2, BY + .18, BZ + .3], pi: 8.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the machine far left, fully outside the card; the clean Shabbat shirt, large, on its hanger on the right; the night and Thursday pages are green; slow crane; card centre free; NO red cross
  function answerBg(dur) {
    const Wd = kW(false); sceneSet(Wd, false);
    const cal = mkCal(Wd, 0, SEED_CAL);
    cal.pages.thu.box.material.color.copy(GREEN); cal.pages.lil.box.material.color.copy(GREEN);
    const mc = mkMachine(Wd, -3.6, 0, SEED_M);
    const RX = 3.6;
    Wd.add(box(.07, 1.9, .07, 0x9aa6b4, { pos: [RX, TOPY + .95, .3] }));                   // rack pole (about the machine's height)
    Wd.add(box(1.1, .07, .07, 0x9aa6b4, { pos: [RX, TOPY + 1.9, .3] }));                   // rack bar
    const sh = mkShirt(Wd, 2.6); const gl = glowAt(Wd.scene, 2.4, 0xffe9a0, .4);
    const eq = mkEq(Wd);
    Wd.on(t => {
      sh.position.set(RX, TOPY + 1.07, .3); sh.rotation.z = .03 * Math.sin(t * 1.2);
      gl.position.set(RX, TOPY + 1.07, .5); gl.material.opacity = .35 + .15 * Math.sin(t * 2.4);
      eq.set(1);
      mc.spin(t * 1.0);
      mc.f.set(t, { talk: .3 * talkAmt(t, SEED_M), smile: 1, look: [.5, 0] });
      cal.fc.set(t, { talk: .3 * talkAmt(t, SEED_CAL), smile: .7, look: [-.5, 0] });
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.0, .2], { dur: 20, dist0: 7.6, dist1: 6.8, h0: .1, h1: .9, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
