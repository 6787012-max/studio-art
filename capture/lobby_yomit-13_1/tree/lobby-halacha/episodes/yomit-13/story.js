// yomit-13 story: "שילוח הקן פעמיים" (halacha yomit, R' Amram Fried). Storyboard A in storyboards_v14.md.
// Talking objects only: THE NEST (tree), THE EGGS (faces), THE MOTHER DOVE, TWO BASKETS (friend 1 = blue "חבר א", friend 2 = green "חבר ב"),
// three speech balloons 1-2-3 (the listeners), a padlock on the blue basket, a hill, a sky. No people. Everything is a function of t.
// Copied from episodes/yomit-12/story.js (tags, arrow, dove, camera helpers).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const X = new THREE.Vector3(1, 0, 0);
  const lerpV = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
  const arcV = (a, b, u, h) => { const p = lerpV(a, b, u); p[1] += h * Math.sin(PI * u); return p; };

  const NEST = [-1.2, 1.0, -.6];
  const SIT = [NEST[0], NEST[1] + .3, NEST[2]];                 // mother's origin when she sits on the eggs
  const OFF = [-3.4, 3.2, -.9];                                 // where the mother is sent to (up, left)
  const EGG_N = [[-.22, .62, .05], [.22, .6, .02]];
  const nestE = i => [NEST[0] + EGG_N[i][0], NEST[1] + EGG_N[i][1], NEST[2] + EGG_N[i][2]];
  const BLUE = [.6, .6, .9], GREEN0 = [2.2, 0, .9], GREEN_NEAR = [-.15, 0, .9];
  const blueE = i => [BLUE[0] + (i ? .2 : -.2), BLUE[1] + .62, BLUE[2] + .02];
  const NTOP = [NEST[0], NEST[1] + 1.2, NEST[2]];
  const BTOP = [BLUE[0], BLUE[1] + .95, BLUE[2]];
  const LK = [BLUE[0] + .55, BLUE[1] + .8, BLUE[2] + .25];                // padlock beside the eggs in the blue basket
  const BAL_SPLIT = [BLUE[0], 1.9, BLUE[2] - .2];
  const BAL_FAR = [[-.9, 2.6, -1.9], [.5, 2.9, -2.1], [1.9, 2.5, -1.9]];
  const BAL_HIDE = [[-1.0, 1.2, -4.0], [.6, 1.3, -4.2], [2.2, 1.1, -4.0]];   // far away, behind the hill
  const CLR = [0xff7aa2, 0xffd23a, 0x7ad6ff];
  const CLR_B = 0x3a7bd5, CLR_G = 0x3fb356;
  const FB = { talk: 0, smile: .3, look: [0, 0], surprise: 0, open: 1 };
  const F = (f, t, o) => f.set(t, Object.assign({}, FB, o));
  const wings = (D, a) => { D.wl.rotation.z = a; D.wr.rotation.z = -a; };
  const place = (D, p, ry) => { D.dv.position.set(p[0], p[1], p[2]); D.dv.rotation.y = ry || 0; };
  const setEgg = (Y, i, p, s = 1) => { const e = Y.eggs[i]; e.g.position.set(p[0], p[1], p[2]); e.g.scale.setScalar(Math.max(.001, s)); };
  const setBal = (Y, i, p, s) => { const b = Y.bal[i]; b.g.position.set(p[0], p[1], p[2]); b.g.visible = s > .01; b.g.scale.setScalar(Math.max(.001, s)); };

  // ---------------------------------------------------------------- tags (same as yomit-12)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return;
      g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W2, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W2 * .03, H * .06, W2 * .94, H * .88, H * .3); c.fill();
    c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W2 * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W2 / 2, H * .54);
  };

  // arrow from A to B (shaft + cone), grows with k
  function arrow(Wd, color) {
    const g = new THREE.Group(); Wd.add(g); g.visible = false;
    const sh = box(1, .07, .07, color); g.add(sh);
    const hd = cyl(0, .13, .26, color); hd.rotation.z = -PI / 2; g.add(hd);
    return { set(A, B, k) {
      g.visible = k > .01; if (!g.visible) return;
      const d = new THREE.Vector3(B[0] - A[0], B[1] - A[1], B[2] - A[2]), L = d.length();
      g.position.set(A[0], A[1], A[2]); g.quaternion.setFromUnitVectors(X, d.clone().normalize());
      sh.scale.x = Math.max(.001, L * k); sh.position.x = L * k / 2;
      hd.position.x = L * k; hd.visible = k > .7;
    } };
  }

  // the mother dove (same look as yomit-12). Sets D.dv, D.head, D.df, D.wl, D.wr.
  function makeDove(Wd, seed) {
    const D = {}; D.dv = new THREE.Group(); Wd.add(D.dv);
    const body = ball(.4, 0x7d879c); body.scale.set(1, .8, 1.3); body.position.y = .95; D.dv.add(body);
    D.head = new THREE.Group(); D.head.position.set(0, 1.42, .2); D.dv.add(D.head);
    D.head.add(ball(.22, 0x7d879c));
    const beak = cyl(.001, .07, .18, 0xe59a2b); beak.rotation.x = PI / 2; beak.position.set(0, -.02, .36); D.head.add(beak);
    D.df = face(Wd, { w: .3, parent: D.head, pos: [0, .02, .22], seed });
    D.wl = ball(.3, 0x6a7389); D.wl.scale.set(.3, .9, 1.2); D.wl.position.set(-.42, .95, -.05); D.dv.add(D.wl);
    D.wr = ball(.3, 0x6a7389); D.wr.scale.set(.3, .9, 1.2); D.wr.position.set(.42, .95, -.05); D.dv.add(D.wr);
    const tail = ball(.2, 0x6a7389); tail.scale.set(.9, .3, 1.3); tail.position.set(0, .9, -.5); D.dv.add(tail);
    return D;
  }

  // a basket with a face on its front (+z side)
  function makeBasket(Wd, p, color, seed) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const body = cyl(.5, .4, .5, color); body.position.y = .25; g.add(body);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.5, .05, 8, 28), new THREE.MeshBasicMaterial({ color: 0x7a4f2a }));
    rim.rotation.x = PI / 2; rim.position.y = .5; g.add(rim);
    return { g, f: face(Wd, { w: .42, parent: g, pos: [0, .26, .53], seed }) };
  }

  // ---------------------------------------------------------------- the set
  function yard(Wd) {
    const Y = {};
    Y.sky = box(16, 8, .2, 0x9fd8ff); Y.sky.position.set(0, 3, -4.4); Wd.add(Y.sky);
    const floor = box(12, .1, 10, 0x9fd27e); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    Y.hill = ball(2.6, 0x3f9a58); Y.hill.scale.set(1.5, .42, .6); Y.hill.position.set(1.6, 0, -2.8); Wd.add(Y.hill);
    const trunk = cyl(.16, .24, 1.05, 0x8a5a32); trunk.position.set(NEST[0], .52, NEST[2] - .15); Wd.add(trunk);
    const crown = ball(1.0, 0x4fb35a); crown.position.set(NEST[0], 2.5, -3.0); Wd.add(crown);
    const crown2 = ball(.7, 0x63c46b); crown2.position.set(NEST[0] + 1.0, 2.1, -2.9); Wd.add(crown2);
    // nest with face
    Y.nest = new THREE.Group(); Y.nest.position.set(NEST[0], NEST[1], NEST[2]); Wd.add(Y.nest);
    const bowl = cyl(.8, .6, .5, 0xa8733c); bowl.position.y = .25; Y.nest.add(bowl);
    const rim = cyl(.84, .8, .1, 0xc98f52); rim.position.y = .52; Y.nest.add(rim);
    Y.nf = face(Wd, { w: .62, parent: Y.nest, pos: [0, .22, .76], seed: 4 });
    // eggs (own groups in the world, moved every frame)
    Y.eggs = [0, 1].map(i => {
      const g = new THREE.Group(); Wd.add(g);
      const e = ball(.22, 0xfff8ec); e.scale.set(.9, 1.2, .95); g.add(e);
      if (i === 0) { const dot = ball(.045, 0xd62b2b); dot.position.set(.17, .1, .12); g.add(dot); }
      return { g, f: face(Wd, { w: .3, parent: g, pos: [0, .02, .23], seed: 5 + i }) };
    });
    Y.M = makeDove(Wd, 6); place(Y.M, SIT, 0);
    // the two friends' baskets
    Y.stump = box(.9, .6, .9, 0x8a5a32); Y.stump.position.set(BLUE[0], .3, BLUE[2]); Wd.add(Y.stump);
    Y.bk = makeBasket(Wd, BLUE, CLR_B, 11);
    Y.gk = makeBasket(Wd, GREEN0, CLR_G, 12);
    // padlock (stays on the blue basket until it opens and falls)
    Y.lk = new THREE.Group(); Wd.add(Y.lk); Y.lk.visible = false;
    Y.lk.add(box(.3, .24, .12, 0xffc53a));
    const sh = new THREE.Mesh(new THREE.TorusGeometry(.11, .035, 8, 20), new THREE.MeshBasicMaterial({ color: 0xc9c9c9 }));
    sh.position.y = .2; Y.lk.add(sh);
    // balloons = the three listeners (faces), each with a number tag
    Y.bal = CLR.map((c, i) => {
      const g = new THREE.Group(); Wd.add(g); g.visible = false; g.add(ball(.36, c));
      return { g, f: face(Wd, { w: .4, parent: g, pos: [0, .02, .37], seed: 20 + i }) };
    });
    // trails from the nest to the far balloons (dots)
    Y.trail = [0, 1, 2].map(() => Array.from({ length: 6 }, () => { const d = ball(.05, 0xfff3c0); d.visible = false; Wd.add(d); return d; }));
    // tags
    Y.tAm = bb(Wd, 1.0, .42, drawTag('האם', '#fff1c2', '#6a3a00', '#d9a63a'));
    Y.tBlue = bb(Wd, 1.3, .46, drawTag('חבר א', '#dbe9ff', '#14408f', '#2f6ad0'));
    Y.tGreen = bb(Wd, 1.3, .46, drawTag('חבר ב', '#e4f8e6', '#1f6a2a', '#3f9a4a'));
    Y.tShl = bb(Wd, 1.0, .42, drawTag('שלו', '#ffe1e1', '#8a1010', '#c43030'));
    Y.tQ = bb(Wd, .5, .5, drawTag('?', '#ffffff', '#1d2a5a', '#7a8794'));
    Y.tRet = bb(Wd, 2.0, .46, drawTag('חזרה לקן', '#e4f8e6', '#1f6a2a', '#3f9a4a'));
    Y.tHef = bb(Wd, 1.4, .5, drawTag('הפקר', '#fff6c2', '#6a4a00', '#d9a63a'));
    Y.tShil = bb(Wd, 1.5, .46, drawTag('שילוח', '#e4f8e6', '#1f6a2a', '#3f9a4a'));
    Y.tCnt = bb(Wd, .8, .7, drawTag('3', '#ffffff', '#1d2a5a', '#2f6ad0'));
    Y.tN = [1, 2, 3].map(n => bb(Wd, .5, .5, drawTag(String(n), '#ffffff', '#1d2a5a', '#7a8794')));
    // marks and arrows
    Y.check = mark3d(Wd, 'check', 1.0); Y.check2 = mark3d(Wd, 'check', 1.0); Y.cross = mark3d(Wd, 'cross', .6);
    Y.shockR = shock(Wd, 0xff7a7a); Y.shockG = shock(Wd, 0x6dff9a);
    Y.arrA = arrow(Wd, 0x2a7ad6); Y.arrG = arrow(Wd, 0x3fdc6a);
    Y.spark = [0, 1, 2, 3].map(() => { const s = ball(.07, 0xffe36a); s.visible = false; Wd.add(s); return s; });
    return Y;
  }

  // ---------------------------------------------------------------- HOOK 0-14: the nest, the eggs and the mother; the green friend waits with a "?"; extreme close-up pulls out
  function hook(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Wd.on(t => {
      place(Y.M, SIT, 0); wings(Y.M, .06 * Math.sin(t * 3));
      setEgg(Y, 0, nestE(0)); setEgg(Y, 1, nestE(1));
      Y.gk.g.position.set(GREEN0[0], .05 * Math.abs(Math.sin(t * 3)), GREEN0[2]);
      Y.tQ.set([GREEN0[0], 1.9 + .1 * Math.sin(t * 3), GREEN0[2]], popE(P(1, 2, t)), 0, 1);
      Y.tGreen.set([GREEN0[0], 1.15, GREEN0[2]], popE(P(2, 3, t)), 0, 1);
      Y.tBlue.set([BLUE[0], 1.75, BLUE[2]], popE(P(2.5, 3.5, t)), 0, 1);
      Y.tAm.set([SIT[0], SIT[1] + 1.9, SIT[2]], popE(P(3, 4, t)), 0, 1);
      F(Y.nf, t, { smile: -.6, look: [0, -.2] });
      Y.eggs.forEach(e => F(e.f, t, { smile: .2, surprise: .4 + .2 * Math.sin(t * 2) }));
      F(Y.M.df, t, { smile: .2, talk: .4 * talkAmt(t, 5), look: [0, .2] });
      F(Y.bk.f, t, { smile: 0, look: [.2, .2] });
      F(Y.gk.f, t, { smile: .2, talk: .6 * talkAmt(t, 6), look: [-.6, .3] });
    });
    Wd.occ = []; Wd.center = [.5, .5]; Wd.qPos = [GREEN0[0], GREEN0[2]];
    Wd.cam = cuts([
      [dur * .6, HH(pullOut([NEST[0], .8, NEST[2] + .3], { dur: dur * .6, dist0: 1.3, dist1: 7.0, h0: .3, h1: 1.5, a0: 8, a1: -10, fov0: 34, fov1: 46 }), 41)],
      [dur * .4, HH(truck([.4, .3, .6], { dur: dur * .4, dist0: 7.4, dist1: 7.2, h0: .9, h1: 1.0, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 42)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, good): the mother flies off in an arc; the eggs hop from the nest into the blue basket; green check
  function s1(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Wd.on(t => {
      const um = sm(P(1.5, 6, t)), mp = arcV(SIT, OFF, um, 1.0);
      place(Y.M, mp, -.2 * um); wings(Y.M, Math.sin(t * (um > .02 ? 14 : 2)) * (um > .02 ? .45 : .05));
      Y.arrA.set(NTOP, BTOP, sm(P(3, 4.5, t)));
      for (let i = 0; i < 2; i++) setEgg(Y, i, arcV(nestE(i), blueE(i), sm(P(4.5 + .4 * i, 8 + .4 * i, t)), 1.1));
      Y.tAm.set([mp[0], mp[1] + 1.0, mp[2]], popE(P(1, 2, t)), 0, 1);
      Y.tBlue.set([BLUE[0], 1.75, BLUE[2]], popE(P(.5, 1.5, t)), 0, 1);
      Y.check.set([BLUE[0], 2.2, BLUE[2]], popE(P(9, 10, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([BLUE[0], 2.2, BLUE[2]], P(9, 9.8, t), 1.2);
      F(Y.nf, t, { smile: .3, look: [.4, 0] });
      Y.eggs.forEach((e, i) => F(e.f, t, { smile: .5 + .3 * Math.sin(t), surprise: .5 * sm(P(4.5, 5, t)) * (1 - sm(P(8, 9, t))) }));
      F(Y.M.df, t, { smile: .4, talk: .5 * talkAmt(t, 1), look: [um * .5, .2] });
      F(Y.bk.f, t, { smile: .5 * sm(P(8, 9, t)), look: [0, .2] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0] * .3, NEST[2]];
    Wd.cam = cuts([
      [dur * .3, HH(truck([0, .9, -.2], { dur: dur * .3, dist0: 8.0, dist1: 7.6, h0: .8, h1: 1.0, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 31)],
      [dur * .35, HH(punch(pushIn([-.2, 1.2, .2], { dur: dur * .35, dist0: 5.0, dist1: 4.4, h0: .6, h1: .7, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .35 * .6]), 32)],
      [dur * .35, HH(insert([BLUE[0], 1.5, BLUE[2]], { dur: dur * .35, dist0: 2.6, dist1: 2.2, h0: .7, h1: .8, a0: -10, a1: 10, fov0: 36, fov1: 34 }), 33)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (14, bad): the eggs are in the blue basket and it has a padlock ("שלו"); green moves in; red cross pulses between them
  function s2(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    const mid = [(GREEN_NEAR[0] + BLUE[0]) / 2, 1.1, .9];
    setEgg(Y, 0, blueE(0)); setEgg(Y, 1, blueE(1));
    Wd.on(t => {
      const u = sm(P(.5, 3.5, t));
      const gp = lerpV(GREEN0, GREEN_NEAR, u); gp[1] = .08 * Math.abs(Math.sin(t * 5));
      Y.gk.g.position.set(gp[0], gp[1], gp[2]);
      Y.tGreen.set([gp[0], 1.15, gp[2]], t < 3.5 ? popE(P(.5, 1.2, t)) : 0, 0, 1);   // hidden once the green basket reaches the blue one (no tag clash)
      const lp = popE(P(1, 2, t));
      Y.lk.visible = lp > .01; Y.lk.position.set(LK[0], LK[1], LK[2]); Y.lk.scale.setScalar(Math.max(.001, lp));
      Y.tShl.set([BLUE[0], 1.55, BLUE[2]], popE(P(2, 3, t)), 0, 1);
      Y.cross.set(mid, popE(P(4, 5, t)) * .9 * (.85 + .15 * Math.sin(t * 6)), .08 * Math.sin(t * 4));
      Y.shockR.set(mid, P(4, 4.8, t), 1.0);
      const mp = [OFF[0] + .1 * Math.sin(t), OFF[1] + .1 * Math.sin(t * 1.3), OFF[2]];
      place(Y.M, mp, 0); wings(Y.M, .1 * Math.sin(t * 10));
      F(Y.nf, t, { smile: -.2, look: [.4, 0] });
      Y.eggs.forEach(e => F(e.f, t, { smile: -.3, surprise: .6 * sm(P(4, 5, t)) }));
      F(Y.M.df, t, { smile: .1, look: [.4, .2] });
      F(Y.bk.f, t, { smile: -.5, look: [0, .1], talk: .6 * talkAmt(t, 21) });
      F(Y.gk.f, t, { smile: -.3, surprise: .6 * sm(P(4, 5, t)), talk: .5 * talkAmt(t, 22), look: [-.5, .1] });
    });
    Wd.occ = [Y.nest]; Wd.center = [.4, .6];
    Wd.cam = cuts([
      [dur * .3, HH(truck([.2, 1.0, .3], { dur: dur * .3, dist0: 7.4, dist1: 7.0, h0: .9, h1: .9, a0: 6, a1: -6, fov0: 46, fov1: 44 }), 51)],
      [dur * .35, HH(punch(pushIn([.4, 1.1, .6], { dur: dur * .35, dist0: 4.8, dist1: 4.2, h0: .7, h1: .8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .35 * .4]), 52)],
      [dur * .35, HH(insert([BLUE[0] - .1, 1.5, BLUE[2]], { dur: dur * .35, dist0: 2.5, dist1: 2.1, h0: .75, h1: .8, a0: 8, a1: -8, fov0: 36, fov1: 34 }), 53)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (14, good): the eggs hop back along a green arrow into the nest; the nest smiles; tag "חזרה לקן"
  function s3(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Wd.on(t => {
      for (let i = 0; i < 2; i++) setEgg(Y, i, arcV(blueE(i), nestE(i), sm(P(.6 + .4 * i, 4.5 + .4 * i, t)), 1.1));
      Y.arrG.set(BTOP, NTOP, sm(P(0, 1.2, t)));
      Y.tRet.set([NEST[0] + .9, NEST[1] + 1.25, NEST[2] + .3], popE(P(5, 6, t)), 0, 1);
      Y.lk.position.set(LK[0], LK[1] + .05 * Math.sin(t * 3), LK[2]);
      const mp = [OFF[0] + .1 * Math.sin(t), OFF[1] + .1 * Math.sin(t * 1.3), OFF[2]];
      place(Y.M, mp, 0); wings(Y.M, .1 * Math.sin(t * 10));
      F(Y.nf, t, { smile: .2 + .8 * sm(P(5, 6, t)), talk: .4 * talkAmt(t, 31) });
      Y.eggs.forEach(e => F(e.f, t, { smile: .6 * sm(P(5, 6, t)), surprise: 0 }));
      F(Y.bk.f, t, { smile: 0, look: [-.4, .6] });
      F(Y.gk.f, t, { smile: 0, look: [-.8, .6], talk: .3 * talkAmt(t, 32) });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0] * .5, NEST[2]];
    Wd.cam = cuts([
      [dur * .35, HH(orbitShot([0, 1.2, -.2], { dur: dur * .35, dist0: 6.4, dist1: 6.2, h0: .8, h1: 1.0, a0: -20, a1: -6, fov0: 44, fov1: 44 }), 61)],
      [dur * .3, HH(punch(pushIn([NEST[0], 1.5, NEST[2]], { dur: dur * .3, dist0: 4.6, dist1: 4.0, h0: .6, h1: .8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .3 * .5]), 62)],
      [dur * .35, HH(insert([NEST[0] + .4, 1.6, NEST[2] + .4], { dur: dur * .35, dist0: 2.4, dist1: 2.0, h0: .9, h1: 1.0, a0: -8, a1: 8, fov0: 36, fov1: 34 }), 63)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (14): a big "הפקר" bubble hangs in front of the blue basket (insert shot, first 6 s); then it splits into three balloons that fly to 1-2-3; the padlock opens and falls
  function s4(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    place(Y.M, SIT, 0);
    const HEF = [BLUE[0], 1.9, BLUE[2] - .2];   // the bubble hangs here; the balloons split from the same spot
    Wd.on(t => {
      const bob = .06 * Math.sin(t * 3);
      const hs = 1.8 * popE(P(0, 1, t)) * (1 - sm(P(6, 6.8, t)));
      Y.tHef.set([HEF[0], HEF[1] + bob, HEF[2]], hs, 0, 1);
      const sp = popE(P(6, 6.8, t)), fly = sm(P(6.8, 9.5, t));
      for (let i = 0; i < 3; i++) {
        const p = lerpV(HEF, BAL_FAR[i], fly);
        setBal(Y, i, p, sp);
        Y.tN[i].set([p[0], p[1] + .6, p[2]], popE(P(8 + .2 * i, 8.8 + .2 * i, t)), 0, 1);
        F(Y.bal[i].f, t, { smile: .3, talk: .7 * talkAmt(t, 40 + i) * (sp > .5 ? 1 : 0), look: [0, .2] });
      }
      const lu = sm(P(7, 9.5, t));
      Y.lk.visible = true; Y.lk.position.set(LK[0] + .4 * lu, Math.max(.15, LK[1] - 1.8 * lu * lu), LK[2]); Y.lk.rotation.z = 2.2 * lu;
      F(Y.nf, t, { smile: .6 * sm(P(7, 8, t)) + .2, look: [0, .4] });
      Y.eggs.forEach(e => F(e.f, t, { smile: .8, talk: .2 * talkAmt(t, 41) }));
      F(Y.bk.f, t, { smile: .5, talk: .7 * talkAmt(t, 42), look: [0, .4] });
      F(Y.gk.f, t, { smile: .2, look: [-.4, .2] });
    });
    Wd.occ = []; Wd.center = [.6, 1.4];
    Wd.cam = cuts([
      [6.0, HH(insert([HEF[0], 1.9, HEF[2]], { dur: 6.0, dist0: 3.0, dist1: 2.7, h0: 1.4, h1: 1.5, a0: -6, a1: 6, fov0: 36, fov1: 34 }), 61)],
      [4.0, HH(punch(pushIn([.6, 1.8, -.4], { dur: 4.0, dist0: 5.2, dist1: 4.4, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [2.6]), 62)],
      [dur - 10, HH(crane([BLUE[0], 1.2, BLUE[2]], { dur: dur - 10, dist0: 3.0, dist1: 2.6, h0: .5, h1: 1.2, a0: 8, a1: -8, fov0: 38, fov1: 36 }), 63)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (14, good): the three listeners are far away, behind the hill; dotted lines back to the nest; counter "3"; green check
  function s5(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    place(Y.M, SIT, 0);
    Wd.on(t => {
      const uf = sm(P(0, 3.5, t));
      for (let i = 0; i < 3; i++) {
        const p = lerpV(BAL_FAR[i], BAL_HIDE[i], uf);
        setBal(Y, i, p, .9 - .3 * uf);
        Y.tN[i].set([p[0], p[1] + .6, p[2]], popE(P(.3 * i, .3 * i + .8, t)), 0, 1);
        F(Y.bal[i].f, t, { smile: .3, talk: .4 * talkAmt(t, 50 + i), look: [0, .3] });
        for (let k = 0; k < 6; k++) {
          const f = (k + 1) / 7, d = Y.trail[i][k], q = lerpV(NTOP, p, f);
          d.position.set(q[0], q[1], q[2]);
          d.scale.setScalar(Math.max(.001, popE(P(1 + .3 * k, 1.6 + .3 * k, t))));
          d.visible = true;
        }
      }
      Y.tCnt.set([.3, 2.9, .6], popE(P(3, 4, t)), 0, 1);
      Y.check.set([NEST[0] + 1.2, NEST[1] + 1.6, NEST[2] + .3], popE(P(4.5, 5.5, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([NEST[0] + 1.2, NEST[1] + 1.6, NEST[2] + .3], P(4.5, 5.3, t), 1.5);
      F(Y.nf, t, { smile: .6, talk: .3 * talkAmt(t, 51), look: [1, .4] });
      Y.eggs.forEach(e => F(e.f, t, { smile: .6 }));
      F(Y.bk.f, t, { smile: .2, look: [1, .4] });
      F(Y.gk.f, t, { smile: .8, look: [0, .4] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0] * .5, NEST[2] - .5];
    Wd.cam = cuts([
      [dur * .35, HH(orbitShot([-.2, 1.6, -1.2], { dur: dur * .35, dist0: 9.5, dist1: 9.0, h0: 1.4, h1: 1.6, a0: -18, a1: -4, fov0: 46, fov1: 46 }), 81)],
      [dur * .3, HH(truck([.4, 1.7, -2.0], { dur: dur * .3, dist0: 7.4, dist1: 7.0, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 44, fov1: 44 }), 82)],
      [dur * .35, HH(punch(insert([NEST[0] + .3, 1.6, NEST[2] + .3], { dur: dur * .35, dist0: 2.6, dist1: 2.2, h0: .8, h1: 1.0, a0: -8, a1: 8, fov0: 36, fov1: 34 }), [dur * .35 * .6]), 83)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (14, good): the mother flies back to the nest along a green arrow "שילוח"; green basket smiles; second green check; sparkles
  function s6(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Wd.on(t => {
      const um = sm(P(1, 6, t)), mp = arcV(OFF, SIT, um, .9);
      place(Y.M, mp, .3 * (1 - um)); wings(Y.M, Math.sin(t * (um < .98 ? 14 : 2)) * (um < .98 ? .45 : .05));
      Y.arrG.set([NEST[0] - 1.1, NEST[1] + 2.1, NEST[2]], [NEST[0] - .5, NEST[1] + 1.7, NEST[2]], sm(P(0, 1.2, t)));   // short arrow, not the long bar
      Y.tShil.set([NEST[0] - 1.0, 2.4, NEST[2] + .6], popE(P(1, 2, t)), 0, 1);
      Y.tAm.set([mp[0], mp[1] + 1.0, mp[2]], popE(P(.5, 1.2, t)), 0, 1);
      Y.eggs.forEach((e, i) => setEgg(Y, i, nestE(i), 1 + .04 * Math.sin(t * 4)));
      Y.check2.set([GREEN0[0], 1.7, GREEN0[2]], popE(P(5, 6, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([GREEN0[0], 1.7, GREEN0[2]], P(5, 5.8, t), 1.4);
      const sp = [[.6, .5, .2], [-.6, .6, .3], [.2, .9, .5], [-.3, .3, .6]];
      Y.spark.forEach((s, i) => {
        s.position.set(NTOP[0] + sp[i][0], NTOP[1] + sp[i][1], NTOP[2] + sp[i][2]);
        s.visible = true; s.scale.setScalar(Math.max(.001, popE(P(5.8 + .2 * i, 6.6 + .2 * i, t)) * (.7 + .3 * Math.sin(t * 8 + i))));
      });
      F(Y.nf, t, { smile: 1, talk: .3 * talkAmt(t, 71), look: [0, .3] });
      Y.eggs.forEach(e => F(e.f, t, { smile: 1, talk: .2 * talkAmt(t, 72) }));
      F(Y.M.df, t, { smile: .6, talk: .4 * talkAmt(t, 73), look: [0, .3] });
      F(Y.bk.f, t, { smile: .4, look: [-.5, .4] });
      F(Y.gk.f, t, { smile: 1, talk: .3 * talkAmt(t, 74), look: [-.4, .4] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0] * .3, NEST[2]];
    Wd.cam = cuts([
      [dur * .35, HH(crane([NEST[0] + .2, 1.5, NEST[2]], { dur: dur * .35, dist0: 6.4, dist1: 5.8, h0: .8, h1: 1.4, a0: 4, a1: -4, fov0: 44, fov1: 42 }), 91)],
      [dur * .35, HH(orbitShot([.6, .5, .4], { dur: dur * .35, dist0: 7.4, dist1: 7.0, h0: .6, h1: .8, a0: -22, a1: 14, fov0: 42, fov1: 42 }), 92)],
      [dur * .3, HH(punch(insert([1.4, 1.2, .7], { dur: dur * .3, dist0: 2.6, dist1: 2.2, h0: .6, h1: .7, a0: -8, a1: 8, fov0: 36, fov1: 34 }), [dur * .3 * .6]), 93)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): golden light; the mother sits on the nest; the two friends smile at the sides; slow crane over the tree
  function answer(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.sky.material.color.set(0xffd9a0);
    place(Y.M, SIT, 0);
    Y.stump.position.set(-2.6, .3, 1.2); Y.bk.g.position.set(-2.6, .6, 1.2); Y.gk.g.position.set(2.6, 0, 1.2);
    Wd.on(t => {
      wings(Y.M, .05 * Math.sin(t * 3));
      Y.eggs.forEach((e, i) => setEgg(Y, i, nestE(i)));
      Y.tBlue.set([-2.6, 1.75, 1.2], popE(P(.5, 1.2, t)), 0, 1);
      Y.tGreen.set([2.6, 1.15, 1.2], popE(P(.5, 1.2, t)), 0, 1);
      Y.check.set([NEST[0] + 1.2, NEST[1] + 1.6, NEST[2] + .3], popE(P(1, 2, t)) * .9, .05 * Math.sin(t * 3));
      F(Y.nf, t, { smile: 1, talk: .25 * talkAmt(t, 1) });
      Y.eggs.forEach(e => F(e.f, t, { smile: 1, talk: .2 * talkAmt(t, 2) }));
      F(Y.M.df, t, { smile: 1, talk: .3 * talkAmt(t, 3), look: [0, .3] });
      F(Y.bk.f, t, { smile: 1, talk: .3 * talkAmt(t, 4), look: [.4, .2] });
      F(Y.gk.f, t, { smile: 1, talk: .3 * talkAmt(t, 5), look: [-.4, .2] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([NEST[0] + .2, 1.5, NEST[2] + .4], { dur: dur, dist0: 8.2, dist1: 7.4, h0: .6, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
