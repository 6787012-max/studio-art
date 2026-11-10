// yomit-12 story: "שילוח הקן אחרי השקיעה" (halacha yomit, R' Amram Fried). Storyboard A in storyboards_v13.md.
// Talking objects only: THE NEST (tree top), EGGS (faces), TWO IDENTICAL DOVES (MOTHER and FATHER, only the tags tell them apart),
// THE SUN and THE MOON (faces), a hill, a sky that goes day -> sunset -> night. No people. Everything is a function of t.
// Copied in spirit from episodes/yomit-11/story.js (tags, arrow, face sets, camera helpers).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const NEST = [-.4, 1.0, -.6];
  const SIT = [NEST[0], NEST[1] + .3, NEST[2]];                 // dove origin when it sits on the eggs
  const PERCH = [NEST[0] + 1.6, NEST[1] + .33, NEST[2] - .2];   // dove origin on the branch
  const FAR_R = [NEST[0] + 2.8, NEST[1] + 1.9, NEST[2] + .2];   // mother hovers here after she flies off
  const FAR_L = [NEST[0] - 2.6, NEST[1] + 1.9, NEST[2] + .2];   // father comes in from here
  const TTC = [0, .04, 1.0], DY0 = -.53;                        // turntable centre; dove origin when it stands on it (feet at y .1)
  const FB = { talk: 0, smile: .4, look: [0, 0], surprise: 0, open: 1 };
  const X = new THREE.Vector3(1, 0, 0);
  const W = (x, y, z) => [NEST[0] + x, NEST[1] + y, NEST[2] + z];
  const lerpV = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
  const arcV = (a, b, u, h) => { const p = lerpV(a, b, u); p[1] += h * Math.sin(PI * u); return p; };
  const onTT = (x, z = 0) => [TTC[0] + x, DY0, TTC[2] + z];
  const sunP = u => [lerp(.8, 2.6, u), lerp(2.8, -.9, u) + .9 * Math.sin(PI * u), -3.5];   // arc: high -> over the top -> below the hill (hidden)
  const moonP = u => [lerp(2.6, -2.9, u), lerp(-.3, 3.2, u) + .6 * Math.sin(PI * u), -3.5];
  const C_DAY = new THREE.Color(0x9fd8ff), C_SET = new THREE.Color(0xff9a4a), C_NIGHT = new THREE.Color(0x1a2550);
  const skyAt = (Y, k) => { const c = new THREE.Color(); if (k <= 1) c.copy(C_DAY).lerp(C_SET, k); else c.copy(C_SET).lerp(C_NIGHT, Math.min(1, k - 1)); Y.sky.material.color.copy(c); };
  const starK = k => clamp((k - 1.3) * 2, 0, 1);

  // ---------------------------------------------------------------- tags (same as yomit-11)
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

  // ONE dove for both parents (identical look). Parent is the world. Sets D.dv, D.head, D.df, D.wl, D.wr.
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
  const wings = (D, a) => { D.wl.rotation.z = a; D.wr.rotation.z = -a; };
  const place = (D, p, ry) => { D.dv.position.set(p[0], p[1], p[2]); D.dv.rotation.y = ry || 0; };

  // ---------------------------------------------------------------- the set
  function yard(Wd) {
    const Y = {};
    Y.sky = box(16, 8, .2, 0x9fd8ff); Y.sky.position.set(0, 3, -4.4); Wd.add(Y.sky);
    const floor = box(12, .1, 10, 0x9fd27e); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    Y.hill = ball(2.6, 0x3f9a58); Y.hill.scale.set(1.5, .42, .6); Y.hill.position.set(1.6, 0, -2.8); Wd.add(Y.hill);
    const trunk = cyl(.16, .24, 1.05, 0x8a5a32); trunk.position.set(NEST[0], .52, NEST[2] - .15); Wd.add(trunk);
    const crown = ball(1.0, 0x4fb35a); crown.position.set(NEST[0], 2.5, NEST[2] - 1.6); Wd.add(crown);
    const crown2 = ball(.7, 0x63c46b); crown2.position.set(NEST[0] + 1.0, 2.1, NEST[2] - 1.5); Wd.add(crown2);
    // nest + eggs
    Y.nest = new THREE.Group(); Y.nest.position.set(NEST[0], NEST[1], NEST[2]); Wd.add(Y.nest);
    const bowl = cyl(.8, .6, .5, 0xa8733c); bowl.position.y = .25; Y.nest.add(bowl);
    const rim = cyl(.84, .8, .1, 0xc98f52); rim.position.y = .52; Y.nest.add(rim);
    Y.nf = face(Wd, { w: .62, parent: Y.nest, pos: [0, .22, .76], seed: 4 });
    Y.eggs = [[-.22, .62, .05], [.22, .6, .02]].map((p, i) => {
      const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Y.nest.add(g);
      const e = ball(.22, 0xfff8ec); e.scale.set(.9, 1.2, .95); g.add(e);
      if (i === 0) { const dot = ball(.045, 0xd62b2b); dot.position.set(.17, .1, .12); g.add(dot); }
      return { g, f: face(Wd, { w: .3, parent: g, pos: [0, .02, .23], seed: 5 + i }) };
    });
    // green ring around the nest rim = she is sitting (רובצת)
    Y.ring = new THREE.Mesh(new THREE.TorusGeometry(.9, .05, 8, 40), new THREE.MeshBasicMaterial({ color: 0x3fdc6a, transparent: true, opacity: 1 }));
    Y.ring.rotation.x = PI / 2; Y.ring.position.set(NEST[0], NEST[1] + .62, NEST[2]); Y.ring.visible = false; Wd.add(Y.ring);
    // branch beside the nest
    Y.branch = box(1.6, .12, .2, 0x7a4f2a); Y.branch.position.set(NEST[0] + 1.6, NEST[1] + .9, NEST[2] - .2); Wd.add(Y.branch);
    // turntable on the grass (rotates; a stripe shows the turn)
    Y.tt = cyl(1.4, 1.4, .12, 0xd9c79a); Y.tt.position.set(TTC[0], TTC[1], TTC[2]); Wd.add(Y.tt);
    const stripe = box(2.6, .02, .08, 0x9a7a4a); stripe.position.y = .065; Y.tt.add(stripe);
    // doves (world space)
    Y.M = makeDove(Wd, 6); Y.F = makeDove(Wd, 7);
    // sun, moon, stars, sun path dots
    Y.sun = ball(.5, 0xffd23a); Y.sun.position.set(2.8, 2.3, -3.5); Wd.add(Y.sun);
    Y.sunF = face(Wd, { w: .6, parent: Y.sun, pos: [0, 0, .5], seed: 8 });
    Y.sunG = glowAt(Wd.scene, 3.2, 0xffd27a, .5); Y.sunG.position.set(2.8, 2.3, -3.5);
    Y.moon = ball(.45, 0xf4f1d8); Y.moon.position.set(2.6, -.3, -3.5); Y.moon.visible = false; Wd.add(Y.moon);
    Y.moonF = face(Wd, { w: .5, parent: Y.moon, pos: [0, 0, .46], seed: 9 });
    Y.stars = [[-3.4, 3.8], [-2.2, 4.4], [-.8, 3.9], [.4, 4.6], [1.9, 3.9], [3.2, 4.5], [-3.0, 2.9], [-1.4, 3.1], [2.6, 3.0], [.8, 3.4], [-4.2, 4.0], [3.8, 3.4]].map(([x, y]) => {
      const s = ball(.05, 0xffffff); s.position.set(x, y, -4.2); s.scale.setScalar(.001); Wd.add(s); return s; });
    Y.dots = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => { const d = ball(.05, 0xfff3c0); const p = sunP(i / 8); d.position.set(p[0], p[1], p[2]); d.visible = false; Wd.add(d); return d; });
    // tags and marks
    Y.tEggs = bb(Wd, 1.1, .42, drawTag('ביצים', '#fff1c2', '#6a3a00', '#d9a63a'));
    Y.tAm = bb(Wd, 1.0, .42, drawTag('האם', '#fff1c2', '#6a3a00', '#d9a63a'));
    Y.tAv = bb(Wd, 1.6, .6, drawTag('אב', '#e4ecff', '#14408f', '#2f6ad0'));
    Y.tLish = bb(Wd, 1.5, .46, drawTag('לשלח?', '#ffe1e1', '#8a1010', '#c43030'));
    Y.tRob = bb(Wd, 2.2, .46, drawTag('האם רובצת', '#f6fff2', '#1f6a2a', '#3f9a4a'));
    Y.tSh = bb(Wd, 2.4, .72, drawTag('שקיעה', '#ffe9c8', '#6a2a00', '#e07a2a'));
    Y.tZz = bb(Wd, .8, .4, drawTag('z z', '#ffffff', '#1d2a5a', '#7a8794'));
    Y.tQs = [0, 1, 2].map(() => bb(Wd, .5, .5, drawTag('?', '#ffffff', '#1d2a5a', '#7a8794')));
    Y.tEq = bb(Wd, .5, .45, drawTag('=', '#ffffff', '#1d2a5a', '#7a8794'));
    Y.cross = mark3d(Wd, 'cross', .6); Y.check = mark3d(Wd, 'check', 1.0);
    Y.shockR = shock(Wd, 0xff7a7a); Y.shockG = shock(Wd, 0x6dff9a);
    Y.arrA = arrow(Wd, 0x2a7ad6); Y.arrG = arrow(Wd, 0x3fdc6a);
    // magnifying glass (ring + handle), slides over the turntable
    Y.mag = new THREE.Group(); Wd.add(Y.mag); Y.mag.visible = false;
    Y.mag.add(new THREE.Mesh(new THREE.TorusGeometry(.42, .06, 8, 36), new THREE.MeshBasicMaterial({ color: 0x9a6a3a })));
    Y.mag.add(new THREE.Mesh(new THREE.CircleGeometry(.4, 32), new THREE.MeshBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: .35 })));
    const hd = box(.08, .7, .08, 0x6a4a2a); hd.position.set(.45, -.5, 0); hd.rotation.z = -PI / 4; Y.mag.add(hd);
    return Y;
  }

  // every face in one call: nest, eggs, mother, father
  const setF = (Y, t, n = {}, e = {}, m = {}, f = {}) => {
    Y.nf.set(t, Object.assign({}, FB, n));
    Y.eggs.forEach(x => x.f.set(t, Object.assign({}, FB, e)));
    Y.M.df.set(t, Object.assign({}, FB, m));
    Y.F.df.set(t, Object.assign({}, FB, f));
  };
  const setEggs = (Y, k) => Y.eggs.forEach(x => x.g.scale.setScalar(Math.max(.001, k)));

  // ---------------------------------------------------------------- HOOK 0-14: two identical doves on the turntable, shell game; "?" between them; pull out
  function hook(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.tt.visible = true;
    Wd.on(t => {
      const k1 = sm(P(3, 4.2, t)), k2 = sm(P(7, 8.2, t));
      const sw = k1 - k2, hop = Math.sin(PI * k1) * (1 - k2) + Math.sin(PI * k2);
      const xM = lerp(-1, 1, sw), xF = -xM;
      place(Y.M, [xM, DY0 + .4 * hop, TTC[2]], 0);
      place(Y.F, [xF, DY0 + .4 * hop, TTC[2]], 0);
      wings(Y.M, .05 * Math.sin(t * 3)); wings(Y.F, .05 * Math.sin(t * 3 + 1));
      setF(Y, t, { smile: .3, look: [0, .2] }, { smile: .2 + .3 * Math.sin(t) }, { smile: .3, talk: .6 * talkAmt(t, 5), look: [xM * .3, .2] }, { smile: .3, talk: .4 * talkAmt(t, 6), look: [xF * .3, .2] });
    });
    Wd.occ = []; Wd.center = [0, 1.0]; Wd.qPos = [0, 1.0];
    Wd.cam = cuts([
      [dur * .6, HH(pullOut([0, .9, 1.0], { dur: dur * .6, dist0: 1.1, dist1: 5.6, h0: .4, h1: 1.5, a0: 8, a1: -10, fov0: 34, fov1: 46 }), 41)],
      [dur * .4, HH(truck([0, 1.2, 1.0], { dur: dur * .4, dist0: 4.8, dist1: 4.6, h0: .8, h1: .9, a0: -8, a1: 8, fov0: 44, fov1: 44 }), 42)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14, good): the mother sits on the eggs; blue arrow; she flies off; tag "האם"; eggs stay
  function s1(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.F.dv.visible = false;
    Wd.on(t => {
      const u = sm(P(3, 7.5, t)), mp = arcV(SIT, FAR_R, u, .8);
      place(Y.M, mp, -.3 * u);
      wings(Y.M, Math.sin(t * (u > .02 ? 14 : 2)) * (u > .02 ? .45 : .05));
      Y.arrA.set([SIT[0] + .2, SIT[1] + 1.2, SIT[2] + .4], FAR_R, sm(P(1, 3, t)));
      Y.tAm.set([mp[0], mp[1] + 1.0, mp[2]], popE(P(1, 2, t)), 0, 1);
      Y.tEggs.set(W(-1.4, 1.3, .3), popE(P(4, 5, t)), 0, 1);
      setF(Y, t, { smile: .3, look: [0, .3] }, { smile: .5 + .3 * Math.sin(t) }, { smile: .4, talk: .5 * talkAmt(t, 1), look: [u * .5, .2] }, {});
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [dur * .35, HH(truck(W(0, 1.4, 0), { dur: dur * .35, dist0: 6.2, dist1: 6.2, h0: .6, h1: .9, a0: -8, a1: 8, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [dur * .35, HH(punch(pushIn(W(.9, 1.2, 0), { dur: dur * .35, dist0: 4.4, dist1: 3.8, h0: .5, h1: .6, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .35 * .5]), 32)],
      [dur * .3, HH(insert(W(0, 1.2, 0), { dur: dur * .3, dist0: 2.4, dist1: 2.0, h0: .35, h1: .4, a0: -8, a1: 6, fov0: 36, fov1: 34 }), 33)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (14, bad): daylight; the father lands on the eggs; red cross; "לשלח?"; eggs surprised
  function s2(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    const crossAt = [SIT[0] + 1.1, SIT[1] + 1.6, SIT[2] + .3];
    const tagAv = texPlane(1.4, .52, drawTag('אב', '#e4ecff', '#14408f', '#2f6ad0'), { cw: 512, ro: 9 });
    tagAv.position.set(-.8, 1.25, .35); tagAv.visible = false; Y.F.dv.add(tagAv);
    Wd.on(t => {
      const u = sm(P(.5, 4, t)), fp = arcV(FAR_L, SIT, u, .9);
      place(Y.F, fp, .3 * (1 - u));
      wings(Y.F, Math.sin(t * 12) * (.1 + .5 * (1 - u)));
      place(Y.M, arcV(FAR_R, PERCH, sm(P(0, 2.5, t)), .6), 0);
      wings(Y.M, Math.sin(t * 12) * (.4 * (1 - sm(P(0, 2.5, t)))));
      const pa = popE(P(3.5, 4.5, t)); tagAv.scale.setScalar(Math.max(.001, pa)); tagAv.visible = pa > .01;   // "אב" rides on the father (inside the dove group, always in frame)
      Y.cross.set(crossAt, popE(P(5, 6, t)) * .9 * (.85 + .15 * Math.sin(t * 6)), .08 * Math.sin(t * 4));
      Y.shockR.set(crossAt, P(5, 5.8, t), 1.2);
      Y.tLish.set([SIT[0] + 1.2, SIT[1] + 2.4, SIT[2] + .3], popE(P(5.5, 6.5, t)), 0, 1);
      setF(Y, t, { smile: -.3 }, { smile: -.2, surprise: .6 * sm(P(4, 5, t)) }, { smile: -.5, look: [.4, .2] },
           { smile: -.6, surprise: sm(P(5, 5.8, t)), talk: .6 * talkAmt(t, 2), look: [0, .2] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [dur * .3, HH(truck(W(0, 1.2, 0), { dur: dur * .3, dist0: 6.4, dist1: 6.0, h0: .6, h1: .7, a0: -10, a1: 6, fov0: 44, fov1: 42 }), 51)],
      [dur * .4, HH(punch(pushIn(W(0, 1.0, 0), { dur: dur * .4, dist0: 4.2, dist1: 3.4, h0: .45, h1: .5, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [dur * .4 * .5]), 52)],
      [dur * .3, HH(insert(W(.9, 1.4, .3), { dur: dur * .3, dist0: 2.2, dist1: 1.8, h0: .4, h1: .45, a0: -10, a1: 10, fov0: 36, fov1: 33 }), 53)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (14, bad): both doves stand on the turntable, it turns; magnifier slides over; "?" pop; "="; red cross pulses
  function s3(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Wd.on(t => {
      const a = t > 3 ? .7 * Math.sin((t - 3) * .8) : 0, u = sm(P(.5, 3.2, t));
      Y.tt.rotation.y = a;
      const mT = [TTC[0] - .9 * Math.cos(a), DY0, TTC[2] + .9 * Math.sin(a)];
      const fT = [TTC[0] + .9 * Math.cos(a), DY0, TTC[2] - .9 * Math.sin(a)];
      place(Y.M, arcV(PERCH, mT, u, .9), a);
      place(Y.F, arcV(SIT, fT, u, .9), a);
      wings(Y.M, .1 * Math.sin(t * 8) * (1 - u)); wings(Y.F, .1 * Math.sin(t * 8) * (1 - u));
      const mu = sm(P(4, 7, t));
      Y.mag.visible = mu > .01; Y.mag.position.set(lerp(-2.6, 0, mu), .95, 1.7);
      const qp = [[-.9, 2.0, 1.0], [.9, 2.1, 1.0], [0, 2.5, 1.0]];
      Y.tQs.forEach((q, i) => q.set(qp[i], popE(P(2 + 3 * i, 3 + 3 * i, t)), 0, 1));
      Y.tEq.set([0, 1.5, 1.0], popE(P(9, 10, t)), 0, 1);
      Y.cross.set([0, 3.0, 1.0], popE(P(6, 7, t)) * .9 * (.85 + .15 * Math.sin(t * 6)), 0);
      Y.shockR.set([0, 3.0, 1.0], P(6, 7, t), 1.2);
      setF(Y, t, { smile: .2 }, { smile: -.3, surprise: .4 * sm(P(2, 3, t)) },
           { smile: -.5, surprise: .7 * sm(P(2, 3, t)), talk: .4 * talkAmt(t, 3), look: [mu * .3, .3] },
           { smile: -.5, surprise: .7 * sm(P(5, 6, t)), talk: .4 * talkAmt(t, 4), look: [0, .3] });
    });
    Wd.occ = []; Wd.center = [0, 1.0];
    Wd.cam = cuts([
      [dur * .3, HH(orbitShot([0, .6, 1.0], { dur: dur * .3, dist0: 5.6, dist1: 5.4, h0: .5, h1: .7, a0: -24, a1: -8, fov0: 42, fov1: 42 }), 61)],
      [dur * .3, HH(pushIn([0, .9, 1.0], { dur: dur * .3, dist0: 3.6, dist1: 3.0, h0: .4, h1: .5, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 62)],
      [dur * .4, HH(punch(insert([0, .95, 1.0], { dur: dur * .4, dist0: 2.2, dist1: 2.0, h0: .35, h1: .4, a0: -10, a1: 10, fov0: 36, fov1: 34 }), [dur * .4 * .6]), 63)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (14, sunset): the sun sinks behind the hill; sky turns orange; arc track; tag "שקיעה"; doves look up at the sun
  function s4(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.dots.forEach(d => { d.visible = true; });
    Wd.on(t => {
      const u = sm(P(0, 14, t)), sp = sunP(u);
      Y.sun.position.set(sp[0], sp[1], sp[2]); Y.sunG.position.set(sp[0], sp[1], sp[2]);
      const k = sm(P(0, 6, t)) + sm(P(6, 14, t));   // 0 day -> 1 orange/pink (~t62) -> 2 dark blue (~t70)
      skyAt(Y, k);
      Y.stars.forEach((s, i) => s.scale.setScalar(Math.max(.001, starK(k) * (.7 + .3 * Math.sin(t * 3 + i)))));
      Y.tSh.set([-1.2, 2.3, .3], popE(P(1, 2, t)), 0, 1);
      place(Y.M, onTT(-.9), 0); place(Y.F, onTT(.9), 0);
      wings(Y.M, .05 * Math.sin(t * 2)); wings(Y.F, .05 * Math.sin(t * 2 + 1));
      setF(Y, t, { smile: .4, look: [.3, .6] }, { smile: .4 + .3 * sm(P(1, 3, t)), look: [0, .5] },
           { smile: .2, talk: .3 * talkAmt(t, 7), look: [.4, .6] }, { smile: .2, talk: .2 * talkAmt(t, 8), look: [.4, .6] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [dur * .35, HH(truck(W(.4, 1.2, 0), { dur: dur * .35, dist0: 7.0, dist1: 6.6, h0: .8, h1: .9, a0: -6, a1: 8, fov0: 46, fov1: 44 }), 71)],
      [dur * .35, HH(pushIn([1.0, 1.6, -2.0], { dur: dur * .35, dist0: 4.6, dist1: 3.6, h0: .6, h1: .7, a0: -4, a1: 6, fov0: 42, fov1: 40 }), 72)],
      [dur * .3, HH(crane(W(0, .8, 0), { dur: dur * .3, dist0: 5.0, dist1: 5.6, h0: .4, h1: 1.6, a0: -6, a1: 10, fov0: 42, fov1: 42 }), 73)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (14, good): night; the moon rises; the mother sits on the nest (green ring); the father sleeps on the branch (eyes closed, z z)
  function s5(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.sun.visible = false; Y.sunG.visible = false;
    Wd.on(t => {
      const k = 1 + sm(P(0, 5, t));
      skyAt(Y, k);
      const st = starK(k);
      Y.stars.forEach((s, i) => s.scale.setScalar(Math.max(.001, st * (.7 + .3 * Math.sin(t * 3 + i)))));
      const mu = sm(P(0, 5, t)), mp = moonP(mu);
      Y.moon.visible = true; Y.moon.position.set(mp[0], mp[1], mp[2]);
      Y.moonF.set(t, { smile: 1, talk: 0, look: [0, 0], surprise: 0, open: (t % 3) < .22 ? .15 : 1 });
      const uM = sm(P(.5, 3.6, t)), uF = sm(P(.5, 3.6, t));
      place(Y.M, arcV(onTT(-.9), SIT, uM, .9), 0); wings(Y.M, .5 * Math.sin(t * 12) * (1 - uM));
      const fp = arcV(onTT(.9), PERCH, uF, 1.0);
      place(Y.F, fp, 0); wings(Y.F, .5 * Math.sin(t * 12) * (1 - uF));
      const sleepK = sm(P(3.6, 5.2, t));
      Y.F.head.rotation.x = .35 * sleepK;
      Y.ring.visible = t > 3.8; Y.ring.material.opacity = .55 + .45 * Math.sin(t * 4); Y.ring.scale.setScalar(1 + .04 * Math.sin(t * 4));
      Y.tRob.set([NEST[0] - 1.5, NEST[1] + 1.1, NEST[2] + .3], popE(P(5, 6, t)), 0, 1);
      Y.tZz.set([fp[0] + .5, fp[1] + 1.9 + .15 * Math.sin(t * 2), fp[2]], popE(P(5, 6, t)) * sleepK, 0, 1);
      Y.check.set([NEST[0] + 1.2, NEST[1] + 1.6, NEST[2] + .3], popE(P(8, 9, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([NEST[0] + 1.2, NEST[1] + 1.6, NEST[2] + .3], P(8, 8.8, t), 1.5);
      setF(Y, t, { smile: .6, look: [0, .3] }, { smile: .8, talk: .3 * talkAmt(t, 9) }, { smile: .8, talk: .4 * talkAmt(t, 10), look: [0, .4] },
           { smile: .3, open: 1 - sleepK, look: [0, -.3] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      // every shot is aimed between the nest and the moon (upper-left), so the moon stays in frame
      [dur * .3, HH(truck([-1.6, 2.0, -1.8], { dur: dur * .3, dist0: 9.0, dist1: 8.6, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 46, fov1: 44 }), 81)],
      [dur * .35, HH(punch(pushIn([-1.1, 1.8, -1.2], { dur: dur * .35, dist0: 6.6, dist1: 5.8, h0: .8, h1: .9, a0: -4, a1: 4, fov0: 44, fov1: 42 }), [dur * .35 * .6]), 82)],
      [dur * .35, HH(crane([-.9, 1.9, -1.0], { dur: dur * .35, dist0: 4.8, dist1: 4.4, h0: .6, h1: 1.0, a0: -8, a1: 8, fov0: 40, fov1: 40 }), 83)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (14, good): moonlit; the mother is sent off in a gentle arc toward the moon; green arrow; big green check; eggs smile; moon winks
  function s6(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.sun.visible = false; Y.sunG.visible = false;
    const OFF = [NEST[0] - 2.2, NEST[1] + 2.4, NEST[2] - .4];
    Wd.on(t => {
      skyAt(Y, 2);
      Y.stars.forEach((s, i) => s.scale.setScalar(.7 + .3 * Math.sin(t * 3 + i)));
      Y.moon.visible = true; Y.moon.position.set(-2.9, 3.2, -3.5);
      Y.moonF.set(t, { smile: 1, look: [0, 0], open: (t % 3) < .22 ? .15 : 1 });
      const u = sm(P(1.5, 6.5, t)), mp = arcV(SIT, OFF, u, .6);
      place(Y.M, mp, -.4 * u);
      wings(Y.M, Math.sin(t * 12) * (.1 + .5 * u));
      place(Y.F, PERCH, 0); Y.F.head.rotation.x = .35;
      Y.ring.visible = t < 1.5 || u < .02; Y.ring.material.opacity = .55 + .45 * Math.sin(t * 4);
      Y.arrG.set([NEST[0], NEST[1] + 1.4, NEST[2] + .4], OFF, sm(P(1, 4, t)));
      Y.tAm.set([mp[0], mp[1] + 1.0, mp[2]], popE(P(2, 3, t)), 0, 1);
      Y.check.set([NEST[0] + 1.0, NEST[1] + 2.0, NEST[2] + .3], popE(P(5.5, 6.5, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set([NEST[0] + 1.0, NEST[1] + 2.0, NEST[2] + .3], P(5.5, 6.3, t), 1.8);
      Y.tZz.set([PERCH[0] + .5, PERCH[1] + 1.9 + .15 * Math.sin(t * 2), PERCH[2]], popE(P(.5, 1.5, t)), 0, 1);
      setF(Y, t, { smile: .8, look: [0, .4] }, { smile: 1, talk: .3 * talkAmt(t, 11) }, { smile: .6, talk: .4 * talkAmt(t, 12), look: [-.4, .3] },
           { smile: .4, open: 0, look: [0, -.3] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [dur * .35, HH(crane(W(0, 1.4, 0), { dur: dur * .35, dist0: 5.6, dist1: 5.0, h0: .6, h1: 1.2, a0: 4, a1: -4, fov0: 42, fov1: 42 }), 91)],
      [dur * .35, HH(orbitShot(W(-.2, 1.5, 0), { dur: dur * .35, dist0: 4.2, dist1: 4.0, h0: .5, h1: .7, a0: -24, a1: 14, fov0: 42, fov1: 42 }), 92)],
      [dur * .3, HH(punch(insert(W(.6, 1.4, 0), { dur: dur * .3, dist0: 2.4, dist1: 2.0, h0: .4, h1: .45, a0: -8, a1: 8, fov0: 36, fov1: 34 }), [dur * .3 * .6]), 93)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): calm night garden, moon and stars; mother on the nest, father asleep; slow crane over the nest and eggs
  function answer(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    skyAt(Y, 2); Y.sun.visible = false; Y.sunG.visible = false; Y.dots.forEach(d => { d.visible = false; });
    Y.moon.visible = true; Y.moon.position.set(-2.9, 3.2, -3.5);
    const gl = glowAt(Wd.scene, 5, 0xffe08a, .2); gl.position.set(-2.9, 3.2, -3.6);
    Y.ring.visible = true;
    place(Y.M, SIT, 0); place(Y.F, PERCH, 0); Y.F.head.rotation.x = .35;
    Wd.on(t => {
      Y.stars.forEach((s, i) => s.scale.setScalar(.7 + .3 * Math.sin(t * 2 + i)));
      Y.ring.material.opacity = .55 + .45 * Math.sin(t * 2); Y.ring.scale.setScalar(1 + .03 * Math.sin(t * 3));
      Y.moonF.set(t, { smile: 1, talk: .2 * talkAmt(t, 4), open: (t % 3) < .22 ? .15 : 1 });
      Y.tZz.set([PERCH[0] + .5, PERCH[1] + 1.9 + .15 * Math.sin(t * 2), PERCH[2]], popE(P(.5, 1.5, t)), 0, 1);
      setF(Y, t, { smile: 1, look: [0, .3] }, { smile: 1, talk: .3 * talkAmt(t, 1) }, { smile: 1, talk: .3 * talkAmt(t, 2), look: [0, .4] },
           { smile: .4, open: 0, look: [0, -.3] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0] - 2.7, NEST[2] + 1.6]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[dur, HH(crane([NEST[0] - 1.3, 2.1, NEST[2] + 1.4], { dur: dur, dist0: 8.2, dist1: 7.6, h0: .4, h1: .9, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
