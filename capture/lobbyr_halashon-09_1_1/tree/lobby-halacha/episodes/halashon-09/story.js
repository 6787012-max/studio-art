// halashon-09 story: "גם לאדם אחד" (Chafetz Chaim, Hilchot Lashon Hara, klal 2 seif 1) - storyboards_v10.md section B.
// Objects only, no human figure. Heroes: THE STORY (rolled note with a grey smudge and an "אמת" stamp, face),
// THE GOOD NAME (golden badge on a pedestal, face), LISTENER HOUSES (7 toy houses on a town map, each with a face;
// the windows turn red when the story reaches them). Diagram: counter "שומעים: N", red "עוון" meter column,
// red lines between houses, red crosses, cracks on the badge.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, orbitShot, crane, insert, handheld, punch, face, talkAmt,
    mark3d, shock, popE, ease, prog, clamp, arcPt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm;
  const P = (a, b, t) => clamp(prog(t, a, b), 0, 1);
  const HH = (c, sd) => handheld(c, .03, sd);

  const TB = .8;                                                       // table top
  const HOUSES = [[-1.3, .3], [-.5, -.5], [-.2, .5], [.6, -.45], [1.2, .35], [-1.2, -.6], [.1, -.05]];   // house 0 = first listener, house 6 = centre
  const NOTE0 = [1.45, TB + .7, .2];                                   // the story hovers beside the badge
  const BADGE = [2.35, TB + .67, .2];                                  // badge centre (on a pedestal)
  const MX = -2.35, MB = TB + .03;                                     // red meter column (left, on the table)
  const NM = [MX + .55, MB + .75, .2];                                 // the story beside the meter (beat 4)
  const HTOP = i => [HOUSES[i][0], TB + .52, HOUSES[i][1]];            // above a house roof
  const p3 = i => [HOUSES[i][0], TB + .2, HOUSES[i][1]];               // mid-height, for the red lines
  const TGT = [0, TB + .6, 0];
  const lk = (fx, tx) => [clamp((tx - fx) / 1.6, -1, 1), 0];
  const BAD = -.6, GOOD = .8;
  const C_WIN0 = new THREE.Color(0x9fd3ff), C_RED = new THREE.Color(0xe03a3a);
  const C_GOLD = new THREE.Color(0xf2c14e), C_DULL = new THREE.Color(0x8a7a5a);

  // ---------------------------------------------------------------- billboards / tags (copied from yomit-08-v2)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const drawStamp = drawTag('אמת', '#ffffff', '#b8201a', '#c43030');
  const drawBadge = (c, W, H) => {
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, 'שם טוב', { maxW: W * .8, maxLines: 1, max: H * .7, min: H * .3, lh: 1.1 });
    c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#5a3a00'; c.fillText(f.lines[0] || 'שם טוב', W / 2, H * .5);
  };

  // ---------------------------------------------------------------- world pieces
  const kW = () => mkWorld({ skyTop: 0xbfe2ff, skyBottom: 0xfff0d6, fogColor: 0xfff0d8, fogNear: 30, fogFar: 120, hemi: 1.1, sun: 1.0, sunPos: [-10, 20, 14], shadowExt: 12 });
  const kWarm = () => mkWorld({ skyTop: 0xffd2a0, skyBottom: 0xffe6bf, fogColor: 0xffdcb0, fogNear: 25, fogFar: 110, hemi: 1.0, sun: 1.15, sunPos: [-12, 9, 10], shadowExt: 12 });

  function stage(Wd) {   // floor, warm back wall, table with a town map and two small roads
    Wd.add(box(20, .1, 10, 0xdcc7a0, { pos: [0, -.05, 0], ink: false }));
    Wd.add(box(20, 4.5, .2, 0xf4e6c8, { pos: [0, 2.25, -1.8], ink: false }));
    Wd.add(box(5.6, TB, 2.5, 0x8a5a36, { pos: [0, TB / 2, 0] }));
    Wd.add(box(3.9, .03, 2.2, 0xf3e7c4, { pos: [0, TB + .015, 0], ink: false }));
    Wd.add(box(3.2, .006, .07, 0xb9a77e, { pos: [0, TB + .034, .15], ink: false }));
    Wd.add(box(.07, .006, 1.6, 0xb9a77e, { pos: [-.4, TB + .034, 0], ink: false }));
    Wd.add(box(.07, .006, 1.6, 0xb9a77e, { pos: [.9, TB + .034, 0], ink: false }));
  }

  // listener house: body, cone roof, two windows (turn red), a face on the front
  function mkHouse(Wd, i) {
    const [x, z] = HOUSES[i];
    const g = new THREE.Group(); g.position.set(x, TB + .03, z); Wd.add(g);
    g.add(box(.34, .3, .28, 0xfff1d6, { pos: [0, .15, 0] }));
    g.add(cyl(0, .1625, .13, 0xc8553d, { pos: [0, .365, 0] }));
    const wins = [-1, 1].map(sx => { const m = box(.065, .065, .01, 0x9fd3ff, { pos: [sx * .125, .14, .142], ink: false }); g.add(m); return m; });
    const f = face(Wd, { w: .17, parent: g, pos: [0, .13, .15], seed: i + 3 });
    return {
      g, f, wins, set(t, o) {
        o = o || {};
        g.position.y = TB + .03 + (o.dy || 0);
        wins.forEach(m => m.material.color.copy(C_WIN0).lerp(C_RED, o.red || 0));
        f.set(t, { smile: o.smile === undefined ? .2 : o.smile, talk: o.talk || 0, look: o.look || [0, 0], surprise: o.surprise || 0 });
      }
    };
  }

  // golden badge on a pedestal: text on the disk, face below it, cracks on the rim
  function mkBadge(Wd) {
    Wd.add(cyl(.08, .12, .25, 0x7a5a3a, { pos: [BADGE[0], TB + .125, BADGE[2]] }));
    const g = new THREE.Group(); g.position.set(BADGE[0], BADGE[1], BADGE[2]); Wd.add(g);
    const disk = cyl(.42, .42, .06, 0xf2c14e, { rot: [PI / 2, 0, 0] }); g.add(disk);
    const txt = texPlane(.7, .22, drawBadge, { cw: 512, ro: 7 }); txt.position.set(0, .2, .04); g.add(txt);
    const f = face(Wd, { w: .34, parent: g, pos: [0, -.1, .04], seed: 7 });
    const cr = [[.6, .27, .2], [-.5, -.3, .17], [.2, .3, -.22], [-1.0, -.25, -.27]].map(([a, x, y]) => {
      const m = box(.2, .012, .012, 0x3a2a1a, { pos: [x, y, .04], rot: [0, 0, a], ink: false }); m.visible = false; g.add(m); return m;
    });
    return {
      g, f, cr,
      upd(t, o) {
        o = o || {};
        g.scale.setScalar(o.shrink === undefined ? 1 : o.shrink);
        disk.material.color.copy(C_GOLD).lerp(C_DULL, o.dull || 0);
        cr.forEach((m, i) => { const s = o.cr ? (o.cr[i] || 0) : 0; m.visible = s > .01; m.scale.set(Math.max(.001, s), 1, 1); });
        f.set(t, { smile: o.smile === undefined ? BAD : o.smile, talk: o.talk || 0, look: o.look || [0, 0], surprise: o.surprise || 0 });
      }
    };
  }

  // the story: paper with rolled ends, a grey smudge, an "אמת" stamp (pops in), a face
  function mkNote(Wd, seed) {
    const g = new THREE.Group(); Wd.add(g);
    g.add(box(.42, .3, .012, 0xfffaf0, { pos: [0, 0, 0] }));
    g.add(cyl(.03, .03, .44, 0xe9d8b0, { pos: [0, .15, 0], rot: [0, 0, PI / 2] }));
    g.add(cyl(.03, .03, .44, 0xe9d8b0, { pos: [0, -.15, 0], rot: [0, 0, PI / 2] }));
    g.add(ball(.05, 0x4a4f57, { pos: [-.14, -.08, .01], scale: [1.2, .8, .3], ink: false }));
    const stamp = texPlane(.2, .08, drawStamp, { cw: 512, ro: 6 }); stamp.position.set(-.1, .08, .016); g.add(stamp);
    const f = face(Wd, { w: .18, parent: g, pos: [.08, -.04, .015], seed });
    return { g, stamp, f };
  }

  // red meter column: grey tube with a red fill that grows from the bottom
  function mkMeter(Wd) {
    Wd.add(box(.24, 1.3, .1, 0xe9e2d4, { pos: [MX, MB + .65, 0], ink: false }));
    const fill = new THREE.Group(); fill.position.set(MX, MB, .07); Wd.add(fill);
    fill.add(box(.18, 1.2, .08, 0xd63a3a, { pos: [0, .6, 0], ink: false }));
    return { set(u) { fill.scale.y = Math.max(.001, u); } };
  }

  // dotted arc from a to b (dots appear while u grows)
  function dotsPath(Wd, a, b, lift, n) {
    const ds = []; for (let i = 0; i < n; i++) { const d = ball(.024, 0xc0392b, { ink: false }); Wd.add(d); ds.push(d); }
    return {
      set(u) { ds.forEach((d, i) => { const k = (i + 1) / (n + 1); d.visible = k < u; if (!d.visible) return; const p = arcPt(a, b, k, lift); d.position.set(p[0], p[1], p[2]); }); }
    };
  }

  // red line between two points (grows from a to b)
  function mkLine(Wd, a, b) {
    const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz);
    const m = box(1, .014, .014, 0xd63a3a, { ink: false }); m.rotation.y = -Math.atan2(dz, dx); Wd.add(m);
    return { set(u) { const e = clamp(u, 0, 1); m.visible = e > .01; m.position.set(a[0] + dx * e / 2, a[1], a[2] + dz * e / 2); m.scale.x = Math.max(.001, L * e); } };
  }

  // the common set: stage, 7 houses, badge, 7 counters (one shown at a time), meter, "עוון" label
  function scene(warm) {
    const Wd = warm ? kWarm() : kW(); stage(Wd);
    const hs = HOUSES.map((_, i) => mkHouse(Wd, i));
    const B = mkBadge(Wd);
    const cnt = [1, 2, 3, 4, 5, 6, 7].map(n => bb(Wd, 1.5, .42, drawTag('שומעים: ' + n, '#fff4d6', '#5a1a10', '#c9a050'), 640));
    const meter = mkMeter(Wd);
    const tagM = bb(Wd, .9, .32, drawTag('עוון', '#ffdcdc', '#8a1010', '#c43030'), 512);
    return { Wd, hs, B, cnt, meter, tagM };
  }
  const showCount = (S, n, s, p) => S.cnt.forEach((b, i) => b.set(p || [0, 2.2, 0], i === n - 1 ? (s === undefined ? 1 : s) : 0));

  // ---------------------------------------------------------------- HOOK 0-14: the story whispers beside the badge; dots flow toward the first house; "?" floats
  function hook(dur) {
    const D = dur || 14, S = scene(), { Wd, hs, B } = S;
    const N = mkNote(Wd, 1), dots = dotsPath(Wd, NOTE0, HTOP(0), .9, 12);
    Wd.qPos = [1.1, .3]; Wd.qSize = .9;
    Wd.on(t => {
      const hov = .03 * Math.sin(t * 1.6);
      N.g.position.set(NOTE0[0], NOTE0[1] + hov, NOTE0[2]); N.g.rotation.z = .04 * Math.sin(t * 1.1);
      N.stamp.scale.setScalar(.0001);
      N.f.set(t, { talk: talkAmt(t, 1), smile: .2, look: lk(NOTE0[0], HOUSES[0][0]) });
      dots.set((t * .22) % 1);
      hs.forEach((h, i) => h.set(t, { smile: .2, look: lk(HOUSES[i][0], NOTE0[0]) }));
      B.upd(t, { smile: .2, look: [-.4, 0] });
    });
    Wd.occ = [N.g, B.g]; Wd.center = [0, 0];
    Wd.cam = cuts([
      [4.5, HH(pullOut(NOTE0, { dur: 4.5, dist0: .9, dist1: 3.8, h0: .1, h1: .9, a0: -10, a1: 8, fov0: 30, fov1: 42 }), 1)],
      [4.5, HH(truck([-.1, TB + .75, .2], { dur: 4.5, dist0: 4.4, dist1: 4.2, h0: .9, h1: .9, a0: -16, a1: -6, fov0: 42, fov1: 42 }), 2)],
      [D - 9, HH(punch(pushIn([-.9, TB + .6, .3], { dur: D - 9, dist0: 3.4, dist1: 2.9, h0: .5, h1: .4, a0: -6, a1: 2, fov0: 40, fov1: 38 }), [3.0]), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (t0 14): the story says it is forbidden even if true; stamp "אמת" pops; red X; badge frowns
  function s1(dur) {
    const D = dur || 14, S = scene(), { Wd, hs, B, meter } = S;
    const N = mkNote(Wd, 1), cross = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff5a5a);
    const XP = [NOTE0[0] + .45, NOTE0[1] + .4, NOTE0[2] + .3];
    Wd.on(t => {
      const hov = .03 * Math.sin(t * 1.6);
      N.g.position.set(NOTE0[0], NOTE0[1] + hov, NOTE0[2]); N.g.rotation.z = .05 * Math.sin(t * 1.3);
      N.stamp.scale.setScalar(popE(P(.6, 1.4, t)));
      N.f.set(t, { talk: talkAmt(t, 1), smile: BAD, look: lk(NOTE0[0], BADGE[0]), surprise: P(10, 10.4, t) * .6 });
      cross.set([XP[0], XP[1] + hov, XP[2]], popE(P(10, 10.9, t)) * .9, .05 * Math.sin(t * 3));
      sk.set(XP, P(10, 10.8, t), 1.0);
      B.upd(t, { smile: BAD, look: [-.3, 0], surprise: P(10, 10.4, t) * .8 });
      hs.forEach((h, i) => h.set(t, { smile: .1, look: lk(HOUSES[i][0], NOTE0[0]) }));
      meter.set(0);
    });
    Wd.occ = [N.g, B.g, cross.g]; Wd.center = [0, 0];
    Wd.cam = cuts([
      [4.5, HH(truck(TGT, { dur: 4.5, dist0: 6.0, dist1: 5.6, h0: 1.3, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 1)],
      [4.5, HH(pushIn([NOTE0[0], NOTE0[1] + .05, NOTE0[2]], { dur: 4.5, dist0: 2.6, dist1: 2.0, h0: .2, h1: .2, a0: -10, a1: -2, fov0: 40, fov1: 36 }), 2)],
      [D - 9, HH(punch(insert([BADGE[0] - .45, BADGE[1], BADGE[2]], { dur: D - 9, dist0: 2.0, dist1: 1.7, h0: .15, h1: .25, a0: 10, a1: 2, fov0: 36, fov1: 34 }), [1.0]), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (t0 28): the story flies to ONE house; its window turns red; counter "1"; badge gets one crack
  function s2(dur) {
    const D = dur || 14, S = scene(), { Wd, hs, B, cnt } = S;
    const N = mkNote(Wd, 2), dots = dotsPath(Wd, NOTE0, HTOP(0), .9, 12);
    const ARR = 4.4;
    Wd.on(t => {
      const u = sm(P(.6, ARR, t)), pos = arcPt(NOTE0, HTOP(0), u, .9);
      N.g.position.set(pos[0], pos[1], pos[2]);
      N.g.scale.setScalar(Math.max(.001, 1 - P(ARR, ARR + .6, t)));
      N.f.set(t, { talk: t > .5 && t < ARR + .3 ? talkAmt(t, 2) : 0, smile: BAD, look: lk(pos[0], HOUSES[0][0]) });
      dots.set(u);
      hs[0].set(t, { red: P(ARR, ARR + .6, t), smile: .2, talk: 0, surprise: .6 * P(ARR, ARR + .3, t) * (1 - P(ARR + .5, ARR + 1.2, t)), look: lk(HOUSES[0][0], NOTE0[0]) });
      hs.slice(1).forEach((h, i) => h.set(t, { smile: .2, look: lk(HOUSES[i + 1][0], NOTE0[0]) }));
      showCount(S, 1, popE(P(1.4, 2.1, t)), [-1.3, 1.95, .3]);
      B.upd(t, { smile: BAD, look: [-.3, 0], cr: [P(ARR + .6, ARR + 1.1, t), 0, 0, 0] });
    });
    Wd.occ = [N.g, B.g, hs[0].g]; Wd.center = [0, 0];
    Wd.cam = cuts([
      [4.0, HH(truck([-.4, 1.25, .2], { dur: 4.0, dist0: 6.0, dist1: 5.6, h0: .6, h1: .6, a0: -4, a1: 4, fov0: 40, fov1: 40 }), 4)],
      [5.0, HH(punch(insert([-1.425, .97, .44], { dur: 5.0, dist0: 1.7, dist1: 1.5, h0: .1, h1: .1, a0: -10, a1: -4, fov0: 36, fov1: 34 }), [.4]), 5)],
      [D - 9, HH(punch(pushIn([1.0, TB + .8, .2], { dur: D - 9, dist0: 3.4, dist1: 3.0, h0: .4, h1: .4, a0: 6, a1: -2, fov0: 40, fov1: 38 }), [.2]), 6)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (t0 42): the story copies itself; six copies fly to six more houses; windows turn red one by one; counter climbs 2..7
  function s3(dur) {
    const D = dur || 14, S = scene(), { Wd, hs, B, cnt } = S;
    const ARR = [2.4, 3.3, 4.2, 5.1, 6.0, 6.9], LAU = ARR.map(a => a - 1.3);
    const copies = ARR.map((a, k) => mkNote(Wd, 20 + k));
    Wd.on(t => {
      hs[0].set(t, { red: 1, smile: BAD, look: lk(HOUSES[0][0], NOTE0[0]) });
      ARR.forEach((a, k) => {
        const i = k + 1, h = hs[i];
        const pulse = P(a, a + .3, t) * (1 - P(a + .3, a + .9, t));
        h.set(t, { red: P(a + .1, a + .6, t), smile: BAD * .5, dy: .02 * pulse, surprise: .8 * pulse, talk: t > a ? .4 * talkAmt(t, i + 3) : 0, look: lk(HOUSES[i][0], HOUSES[0][0]) });
      });
      copies.forEach((c, k) => {
        const L = LAU[k], A = ARR[k];
        const ps = arcPt(HTOP(0), HTOP(k + 1), sm(P(L, A, t)), .9);
        c.g.position.set(ps[0], ps[1], ps[2]);
        c.g.scale.setScalar(Math.max(.001, popE(P(L, L + .35, t)) * (1 - P(A, A + .35, t))));
        c.f.set(t, { talk: t >= L && t < A + .2 ? talkAmt(t, k + 5) : 0, smile: BAD, look: lk(ps[0], HOUSES[k + 1][0]) });
      });
      const n = 1 + ARR.filter(a => t >= a).length;
      showCount(S, n);
      B.upd(t, { smile: BAD, cr: [1, 1, 0, 0].map((v, i) => (i === 2 ? P(5.4, 5.8, t) : v)) });
    });
    Wd.occ = [B.g, hs[0].g]; Wd.center = [0, 0];
    Wd.cam = cuts([
      [4.0, HH(orbitShot([-.7, TB + .6, 0], { dur: 4.0, dist0: 4.4, dist1: 4.6, h0: .6, h1: .8, a0: -20, a1: -6, fov0: 42, fov1: 42 }), 1)],
      [5.0, HH(punch(pushIn([-.2, TB + .6, 0], { dur: 5.0, dist0: 3.4, dist1: 2.9, h0: .4, h1: .3, a0: 8, a1: -4, fov0: 40, fov1: 38 }), [.2, 1.1, 2.0, 2.9], .05), 2)],
      [D - 9, HH(insert([.4, TB + .5, -.2], { dur: D - 9, dist0: 2.0, dist1: 1.7, h0: .25, h1: .2, a0: -6, a1: 10, fov0: 36, fov1: 34 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (t0 56): all seven windows red; the red meter column fills step by step, one step per house (punch on each step); the story speaks beside the meter
  function s4(dur) {
    const D = dur || 14, S = scene(), { Wd, hs, B, cnt, meter, tagM } = S;
    const ST = HOUSES.map((_, k) => .8 + k * 1.2);
    const N = mkNote(Wd, 40);
    Wd.on(t => {
      showCount(S, 7, 1, [.6, 1.5, 0]);
      const u = ST.reduce((s, a) => s + sm(P(a, a + .5, t)), 0) / HOUSES.length;
      meter.set(u);
      tagM.set([MX - .5, MB + 1.0, .2], popE(P(0, .6, t)) * .7, 0);
      N.g.position.set(NM[0], NM[1] + .03 * Math.sin(t * 1.5), NM[2]); N.g.rotation.z = .04 * Math.sin(t * 1.2);
      N.f.set(t, { talk: talkAmt(t, 9) * P(0, .3, t), smile: BAD, look: lk(NM[0], MX), surprise: 0 });
      hs.forEach((h, i) => {
        const k = ST[i], pulse = P(k, k + .5, t) * (1 - P(k + .5, k + 1.2, t));
        h.set(t, { red: 1, dy: .03 * pulse, smile: BAD * .5, surprise: pulse * .6, look: lk(HOUSES[i][0], MX) });
      });
      B.upd(t, { smile: BAD, cr: [1, 1, 0, 0] });
    });
    Wd.occ = [N.g, B.g, hs[6].g]; Wd.center = [0, 0];
    Wd.cam = cuts([
      [4.2, HH(truck([-.4, 1.2, 0], { dur: 4.2, dist0: 7.6, dist1: 7.2, h0: 1.4, h1: 1.2, a0: -8, a1: 6, fov0: 40, fov1: 40 }), 1)],
      [4.6, HH(punch(pushIn([MX + .3, MB + .62, .2], { dur: 4.6, dist0: 3.3, dist1: 3.0, h0: .2, h1: .3, a0: 12, a1: 4, fov0: 42, fov1: 40 }), ST.map(a => a + .5 - 4.2).filter(x => x > 0), .06), 4)],
      [D - 8.8, HH(orbitShot([-.2, TB + .6, 0], { dur: D - 8.8, dist0: 4.4, dist1: 4.2, h0: .6, h1: .7, a0: -22, a1: 14, fov0: 40, fov1: 40 }), 5)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (t0 70): the badge loses its shine, cracks spread, it shrinks; red lines connect all the houses
  function s5(dur) {
    const D = dur || 14, S = scene(), { Wd, hs, B, cnt } = S;
    const lines = [0, 1, 2, 3, 4, 5].map(k => mkLine(Wd, p3(6), p3(k)));
    Wd.on(t => {
      showCount(S, 7);
      B.upd(t, {
        smile: -.7, talk: .5 * talkAmt(t, 4), dull: P(4.4, 6.4, t), shrink: 1 - .3 * P(6.4, 8.0, t),
        cr: [1, 1, P(5.0, 5.4, t), P(6.0, 6.4, t)]
      });
      lines.forEach((l, k) => l.set(P(8.4 + k * .5, 9.2 + k * .5, t)));
      hs.forEach((h, i) => h.set(t, { red: 1, smile: -.3, look: lk(HOUSES[i][0], TGT[0]) }));
    });
    Wd.occ = [B.g, hs[6].g]; Wd.center = [0, 0];
    Wd.cam = cuts([
      [4.2, HH(truck(TGT, { dur: 4.2, dist0: 5.6, dist1: 5.2, h0: 1.3, h1: 1.2, a0: -8, a1: 8, fov0: 40, fov1: 40 }), 5)],
      [4.6, HH(punch(insert([BADGE[0] - .4, BADGE[1], BADGE[2]], { dur: 4.6, dist0: 2.1, dist1: 1.6, h0: .2, h1: .3, a0: -14, a1: -4, fov0: 36, fov1: 32 }), [.8, 1.8]), 6)],
      [D - 8.8, HH(orbitShot([-.1, TB + .6, 0], { dur: D - 8.8, dist0: 4.6, dist1: 4.2, h0: .7, h1: .7, a0: -24, a1: 24, fov0: 40, fov1: 40 }), 7)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (t0 85): each house gets a small red X over it; the houses look sad and each one speaks in turn
  function s6(dur) {
    const D = dur || 14, S = scene(), { Wd, hs, B, cnt } = S;
    const lines = [0, 1, 2, 3, 4, 5].map(k => mkLine(Wd, p3(6), p3(k)));
    const xs = HOUSES.map((_, i) => mark3d(Wd, 'cross', .42));
    const XA = HOUSES.map((_, i) => 1.0 + i * .9);
    Wd.on(t => {
      showCount(S, 7);
      lines.forEach(l => l.set(1));
      B.upd(t, { smile: -.7, dull: 1, shrink: .7, cr: [1, 1, 1, 1], talk: .3 * talkAmt(t, 12) });
      hs.forEach((h, i) => {
        const a = XA[i], pop = P(a, a + .45, t);
        xs[i].set([HTOP(i)[0], HTOP(i)[1] + .32, HTOP(i)[2] + .1], popE(pop) * .9, .05 * Math.sin(t * 3 + i));
        h.set(t, { red: 1, dy: -.02 * pop, smile: BAD, surprise: .8 * P(a, a + .25, t) * (1 - P(a + .6, a + 1.2, t)), talk: t > a + .4 ? .35 * talkAmt(t, i + 10) : 0, look: lk(HOUSES[i][0], TGT[0]) });
      });
    });
    Wd.occ = [B.g, hs[6].g]; Wd.center = [0, 0];
    Wd.cam = cuts([
      [4.2, HH(pushIn([-.2, TB + .6, 0], { dur: 4.2, dist0: 5.2, dist1: 4.2, h0: 1.2, h1: .9, a0: -5, a1: 5, fov0: 40, fov1: 38 }), 8)],
      [4.8, HH(truck([-.5, TB + .7, 0], { dur: 4.8, dist0: 3.0, dist1: 3.0, h0: .6, h1: .6, a0: -16, a1: 12, fov0: 38, fov1: 38, shift: [.5, 0, 0] }), 9)],
      [D - 9, HH(punch(insert([HOUSES[5][0], TB + .6, HOUSES[5][1]], { dur: D - 9, dist0: 1.8, dist1: 1.6, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 36, fov1: 34 }), [.2]), 10)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the town map at golden hour; badge shining whole; houses calm; the story rolled up and tied with a ribbon; slow crane
  function answerBg(dur) {
    const S = scene(true), { Wd, hs, B, cnt, meter, tagM } = S;
    const roll = new THREE.Group(); roll.position.set(1.75, TB + .075, .85); Wd.add(roll);
    roll.add(cyl(.07, .07, .42, 0xf4e8c8, { rot: [0, 0, PI / 2] }));
    roll.add(box(.045, .17, .17, 0xc0392b, { ink: false }));
    roll.add(ball(.03, 0xc0392b, { pos: [.03, .1, .03], ink: false }));
    cnt.forEach(b => b.set([0, 2.2, 0], 0));
    tagM.set([0, 0, 0], 0, 0);
    meter.set(0);
    Wd.on(t => {
      hs.forEach((h, i) => h.set(t, { smile: .6, look: lk(HOUSES[i][0], TGT[0]) }));
      B.upd(t, { smile: GOOD, talk: talkAmt(t, 7), dull: 0, shrink: 1, cr: [0, 0, 0, 0], look: [0, 0] });
      roll.rotation.z = .02 * Math.sin(t * .9);
    });
    Wd.occ = [B.g, roll]; Wd.center = [0, 0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane(TGT, { dur: 20, dist0: 6.0, dist1: 4.8, h0: .5, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 9)]]);
    Wd.cam = Wd.camAns;
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
