// yomit-11 story: "שילוח הקן בביצים ובגוזלים" (halacha yomit, R' Amram Frid). Storyboard A in storyboards_v12.md.
// Talking objects only: THE NEST (on a small tree), TWO EGGS (one with a small red dot = the "blood", no gore),
// TWO CHICKS, THE MOTHER DOVE (a bird). No people.
// Green ring under the dove = she is sitting (רובצת). Red dashes + red cross = she only stands beside the nest (not enough).
// W(x, y, z) = nest position + (x, y, z). punch() times are shot-local.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const NEST = [-.4, 1.0, -.6];
  const BRANCH = [1.6, .9, -.2];   // nest-relative centre of the branch beside the nest
  const SIDE = [1.6, .3, -.2];     // dove standing on that branch (dove group offset, nest-relative)
  const FB = { talk: 0, smile: .4, look: [0, 0], surprise: 0, open: 1 };
  const X = new THREE.Vector3(1, 0, 0);
  const W = (x, y, z) => [NEST[0] + x, NEST[1] + y, NEST[2] + z];

  // ---------------------------------------------------------------- tags (copied from yomit-10)
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

  // chick: yellow ball, small beak toward the camera, face
  function makeChick(Wd, parent, p, seed) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); parent.add(g);
    const body = ball(.2, 0xffd83a); body.scale.set(1, .95, 1); g.add(body);
    const beak = cyl(0, .05, .1, 0xf08a2b); beak.rotation.x = PI / 2; beak.position.set(0, -.12, .19); g.add(beak);
    return { g, f: face(Wd, { w: .28, parent: g, pos: [0, .04, .215], seed }) };
  }

  // ONE dove for every beat (copied from yomit-10): ellipsoid body, ball wings, face. Sets Y.dv, Y.df, Y.wl, Y.wr.
  function makeDove(Wd, Y, parent) {
    Y.dv = new THREE.Group(); parent.add(Y.dv);
    const body = ball(.4, 0x7d879c); body.scale.set(1, .8, 1.3); body.position.y = .95; Y.dv.add(body);
    Y.head = new THREE.Group(); Y.head.position.set(0, 1.42, .2); Y.dv.add(Y.head);
    Y.head.add(ball(.22, 0x7d879c));
    const beak = cyl(.001, .07, .18, 0xe59a2b); beak.rotation.x = PI / 2; beak.position.set(0, -.02, .36); Y.head.add(beak);
    Y.df = face(Wd, { w: .3, parent: Y.head, pos: [0, .02, .22], seed: 6 });
    Y.wl = ball(.3, 0x6a7389); Y.wl.scale.set(.3, .9, 1.2); Y.wl.position.set(-.42, .95, -.05); Y.dv.add(Y.wl);
    Y.wr = ball(.3, 0x6a7389); Y.wr.scale.set(.3, .9, 1.2); Y.wr.position.set(.42, .95, -.05); Y.dv.add(Y.wr);
    const tail = ball(.2, 0x6a7389); tail.scale.set(.9, .3, 1.3); tail.position.set(0, .9, -.5); Y.dv.add(tail);
  }

  // ---------------------------------------------------------------- the set: tree, nest, eggs, chicks, dove, branch, ring, ruler, tags, marks
  function yard(Wd) {
    const Y = {};
    const floor = box(10, .1, 9, 0x9fd27e); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const wall = box(10, 3.6, .2, 0xf7e4c2); wall.position.set(0, 1.8, -4); Wd.add(wall);
    const trunk = cyl(.16, .24, 1.05, 0x8a5a32); trunk.position.set(NEST[0], .52, NEST[2] - .15); Wd.add(trunk);
    // crown sits well BEHIND and above the nest, so it never hides the nest or the dove
    const crown = ball(1.0, 0x4fb35a); crown.position.set(NEST[0], 2.5, NEST[2] - 1.6); Wd.add(crown);
    const crown2 = ball(.7, 0x63c46b); crown2.position.set(NEST[0] + 1.0, 2.1, NEST[2] - 1.5); Wd.add(crown2);
    // nest (bowl + straw rim, face on the front)
    Y.nest = new THREE.Group(); Y.nest.position.set(NEST[0], NEST[1], NEST[2]); Wd.add(Y.nest);
    const bowl = cyl(.8, .6, .5, 0xa8733c); bowl.position.y = .25; Y.nest.add(bowl);
    const rim = cyl(.84, .8, .1, 0xc98f52); rim.position.y = .52; Y.nest.add(rim);
    Y.nf = face(Wd, { w: .62, parent: Y.nest, pos: [0, .22, .76], seed: 4 });
    // two eggs; the first has a small red dot on its shell
    Y.eggs = [[-.22, .62, .05], [.22, .6, .02]].map((p, i) => {
      const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Y.nest.add(g);
      const e = ball(.22, 0xfff8ec); e.scale.set(.9, 1.2, .95); g.add(e);
      if (i === 0) { const dot = ball(.045, 0xd62b2b); dot.position.set(.17, .1, .12); g.add(dot); }
      return { g, f: face(Wd, { w: .3, parent: g, pos: [0, .02, .23], seed: 5 + i }) };
    });
    // two chicks (scale 0 until they hatch)
    Y.chicks = [[-.3, .42, .06, 21], [.3, .4, .02, 22]].map(c => makeChick(Wd, Y.nest, [c[0], c[1], c[2]], c[3]));
    makeDove(Wd, Y, Y.nest);
    // branch beside the nest, dashed gap, green sitting ring
    Y.branch = box(1.6, .12, .2, 0x7a4f2a); Y.branch.position.set(BRANCH[0], BRANCH[1], BRANCH[2]); Y.nest.add(Y.branch);
    Y.dash = [.92, 1.02, 1.12].map(x => { const d = box(.1, .04, .04, 0xd62b2b); d.position.set(x, .6, 0); d.scale.setScalar(.001); Y.nest.add(d); return d; });
    Y.ring = new THREE.Mesh(new THREE.TorusGeometry(.9, .05, 8, 40), new THREE.MeshBasicMaterial({ color: 0x3fdc6a, transparent: true, opacity: 1 }));
    Y.ring.rotation.x = PI / 2; Y.ring.position.set(0, .56, 0); Y.ring.visible = false; Y.nest.add(Y.ring);
    // size ruler beside the chicks
    Y.ruler = new THREE.Group(); Y.ruler.position.set(NEST[0] + 1.7, 0, NEST[2] + .6); Y.ruler.visible = false; Wd.add(Y.ruler);
    const bar = box(.1, 1.8, .1, 0xf0d060); bar.position.y = .9; Y.ruler.add(bar);
    [.4, .8, 1.2, 1.6].forEach(y => { const tk = box(.22, .03, .03, 0x333333); tk.position.y = y; Y.ruler.add(tk); });
    // tags and marks
    Y.tEggs = bb(Wd, 1.1, .42, drawTag('ביצים', '#fff1c2', '#6a3a00', '#d9a63a'));
    Y.tChicks = bb(Wd, 1.3, .42, drawTag('גוזלים', '#fff6c8', '#6a4a00', '#e0b030'));
    Y.tRob = bb(Wd, 1.3, .46, drawTag('רובצת', '#f6fff2', '#1f6a2a', '#3f9a4a'));
    Y.tOm = bb(Wd, 1.3, .46, drawTag('עומדת', '#ffffff', '#1d2a5a', '#7a8794'));
    Y.tAm = bb(Wd, 1.0, .42, drawTag('האם', '#fff1c2', '#6a3a00', '#d9a63a'));
    Y.tBan = bb(Wd, 1.2, .42, drawTag('הבנים', '#fff1c2', '#6a3a00', '#d9a63a'));
    Y.cross = mark3d(Wd, 'cross', .6);
    Y.check = mark3d(Wd, 'check', 1.0);
    Y.shockR = shock(Wd, 0xff7a7a);
    Y.shockG = shock(Wd, 0x6dff9a);
    Y.arrA = arrow(Wd, 0x2a7ad6);
    Y.arrB = arrow(Wd, 0xffb42a);
    setChicks(Y, 0);
    return Y;
  }

  // every face in one call: nest, eggs, chicks, dove
  const setF = (Y, t, n = {}, e = {}, c = {}, d = {}) => {
    Y.nf.set(t, Object.assign({}, FB, n));
    Y.eggs.forEach(x => x.f.set(t, Object.assign({}, FB, e)));
    Y.chicks.forEach(x => x.f.set(t, Object.assign({}, FB, c)));
    Y.df.set(t, Object.assign({}, FB, d));
  };
  const setEggs = (Y, k) => Y.eggs.forEach(x => x.g.scale.setScalar(Math.max(.001, k)));
  const setChicks = (Y, k) => Y.chicks.forEach(x => x.g.scale.setScalar(Math.max(.001, k)));
  const wings = (Y, a) => { Y.wl.rotation.z = a; Y.wr.rotation.z = -a; };

  // ---------------------------------------------------------------- HOOK 0-14: close-up of a big chick's face in the nest, pulls out to the tree; "?" over the nest
  function hook(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.dv.visible = false; setEggs(Y, 0); setChicks(Y, 1.8);
    Wd.qPos = [NEST[0], NEST[2]];
    Wd.on(t => {
      setF(Y, t, { smile: .3, surprise: .25 * sm(P(9, 11, t)), look: [.1, .2] }, {}, { smile: .9, talk: .5 * talkAmt(t, 5), look: [.3, 0] }, {});
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([[dur, HH(pullOut([NEST[0] - .3, NEST[1] + .55, NEST[2]], { dur, dist0: 1.0, dist1: 5.4, h0: .3, h1: 1.0, a0: 6, a1: -12, fov0: 34, fov1: 44 }), 41)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14): the dove sits; an arrow shows the dove leaving; an arrow from the nest marked "הבנים"
  function s1(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.ring.visible = true; setChicks(Y, 0);
    Wd.on(t => {
      wings(Y, .04 * Math.sin(t * 2));
      Y.ring.scale.setScalar(1 + .03 * Math.sin(t * 3));
      Y.arrA.set(W(.5, 1.6, .3), W(1.9, 2.3, .3), sm(P(2, 4.5, t)));
      Y.tAm.set(W(2.1, 2.6, .3), popE(P(4, 5, t)), 0, 1);
      Y.arrB.set(W(-.9, .35, .2), W(-2.1, .35, .2), sm(P(5, 7, t)));
      Y.tBan.set(W(-2.4, .8, .2), popE(P(7, 8, t)), 0, 1);
      setF(Y, t, { smile: .3, look: [0, .3] }, { smile: .5 + .3 * Math.sin(t) }, {}, { talk: .6 * talkAmt(t, 1), smile: .4, look: [.5, .3] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [5, HH(truck([NEST[0], 1.4, NEST[2]], { dur: 5, dist0: 6.2, dist1: 6.2, h0: .6, h1: .9, a0: -8, a1: 8, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [4.5, HH(punch(pushIn([NEST[0] + .5, NEST[1] + .5, NEST[2]], { dur: 4.5, dist0: 4.2, dist1: 3.8, h0: .5, h1: .6, a0: -6, a1: 6, fov0: 42, fov1: 40 }), [2.6]), 32)],
      [4.5, HH(punch(insert(W(0, 1.2, 0), { dur: 4.5, dist0: 2.2, dist1: 1.9, h0: .35, h1: .4, a0: -8, a1: 6, fov0: 36, fov1: 34 }), [1.2]), 33)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28, good): close-up of the eggs; red dot on one egg; tag "ביצים"; green check; eggs smile
  function s2(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    setChicks(Y, 0); Y.ring.visible = true;
    Wd.on(t => {
      wings(Y, .03 * Math.sin(t * 2));
      Y.ring.scale.setScalar(1 + .03 * Math.sin(t * 3));
      Y.eggs.forEach((x, i) => { x.g.position.y = [.62, .6][i] + .03 * Math.sin(t * 4 + i); });
      Y.tEggs.set(W(-1.3, 1.3, .3), popE(P(1, 2, t)), 0, 1);
      Y.check.set(W(1.2, 1.4, .3), popE(P(3.5, 4.5, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set(W(1.2, 1.4, .3), P(3.5, 4.2, t), 1.5);
      setF(Y, t, { smile: .3 }, { smile: .9, talk: .4 * talkAmt(t, 3), look: [0, .4] }, {}, { talk: .3 * talkAmt(t, 2), smile: .6 });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [7, HH(punch(pushIn(W(0, .6, 0), { dur: 7, dist0: 4.2, dist1: 3.2, h0: .45, h1: .55, a0: -10, a1: 10, fov0: 42, fov1: 40 }), [1.2, 3.6]), 42)],
      [7, HH(truck(W(0, 1.0, 0), { dur: 7, dist0: 5.0, dist1: 4.6, h0: .6, h1: .7, a0: -16, a1: -4, fov0: 42, fov1: 42 }), 43)],
      [7, HH(orbitShot(W(0, .7, 0), { dur: 7, dist0: 3.0, dist1: 3.0, h0: .45, h1: .5, a0: -26, a1: -6, fov0: 40, fov1: 40 }), 44)],
      [7, HH(insert(W(0, .65, 0), { dur: 7, dist0: 1.9, dist1: 1.5, h0: .25, h1: .3, a0: -8, a1: 8, fov0: 36, fov1: 33 }), 45)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, good): eggs crack, chicks hatch and grow, the ruler grows; dove flies off; tag "גוזלים"; green check
  function s3(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.ring.visible = false; Y.ruler.visible = true;
    Wd.on(t => {
      const crack = sm(P(1, 2.2, t));
      setEggs(Y, 1 - crack);
      const hatch = sm(P(1.8, 3.2, t)), up = sm(P(4.5, 7, t));
      setChicks(Y, hatch * (1 + .8 * up));
      Y.ruler.scale.y = .2 + .8 * up;
      const u = sm(P(0, 2.5, t));   // dove flies off to the upper right
      Y.dv.position.set(lerp(0, 3.2, u), lerp(0, 3.0, u) + .3 * Math.sin(PI * u), lerp(0, -.8, u));
      Y.dv.visible = u < .99;
      wings(Y, Math.sin(t * 12) * (.1 + .5 * u));
      Y.tChicks.set(W(-1.4, 1.5, .3), popE(P(5.5, 6.5, t)), 0, 1);
      Y.check.set(W(1.2, 1.2, .3), popE(P(8, 9, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set(W(1.2, 1.2, .3), P(8, 8.8, t), 1.5);
      setF(Y, t, { smile: .6 }, {}, { smile: 1, talk: .5 * talkAmt(t, 4), look: [0, .4] }, {});
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [9, HH(punch(truck(W(.2, 1.3, 0), { dur: 9, dist0: 6.2, dist1: 6.0, h0: .6, h1: .8, a0: -6, a1: 6, fov0: 44, fov1: 44 }), [5.6, 8.4]), 51)],
      [11, HH(pushIn(W(0, .6, 0), { dur: 11, dist0: 3.8, dist1: 3.2, h0: .4, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 40 }), 52)],
      [10, HH(insert(W(0, .9, 0), { dur: 10, dist0: 2.2, dist1: 1.8, h0: .35, h1: .4, a0: -12, a1: 12, fov0: 36, fov1: 33 }), 53)],
      [12, HH(crane(W(0, .9, 0), { dur: 12, dist0: 4.4, dist1: 4.0, h0: .3, h1: 1.2, a0: -6, a1: 8, fov0: 42, fov1: 42 }), 54)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, good): big chicks; the dove comes back and settles DOWN on them; green ring glows; tag "רובצת"
  function s4(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    setEggs(Y, 0); setChicks(Y, 1.8); Y.ruler.visible = true; Y.ruler.scale.y = 1;
    Wd.on(t => {
      const u = sm(P(.5, 3.5, t));
      Y.dv.position.set(lerp(3.2, 0, u), lerp(3.0, 0, u) + .35 * Math.sin(PI * u), lerp(-.8, 0, u));
      wings(Y, Math.sin(t * 14) * (.5 * (1 - u)));
      Y.ring.visible = t > 3;
      Y.ring.material.opacity = .55 + .45 * Math.sin(t * 4);
      Y.ring.scale.setScalar(1 + .04 * Math.sin(t * 4));
      Y.tRob.set(W(1.3, 1.5, .3), popE(P(4, 5, t)), 0, 1);
      setF(Y, t, { smile: .8, look: [0, .3] }, {}, { smile: 1, talk: .5 * talkAmt(t, 7), look: [0, .5] }, { smile: .5, talk: .3 * talkAmt(t, 8), look: [0, -.2] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [14, HH(punch(truck(W(0, 1.3, 0), { dur: 14, dist0: 6.0, dist1: 5.4, h0: .8, h1: .9, a0: -12, a1: 10, fov0: 44, fov1: 42 }), [4.5]), 61)],
      [14, HH(pushIn(W(0, 1.2, 0), { dur: 14, dist0: 4.2, dist1: 3.4, h0: .5, h1: .6, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 62)],
      [14, HH(orbitShot(W(0, 1.0, 0), { dur: 14, dist0: 3.8, dist1: 3.8, h0: .5, h1: .7, a0: -30, a1: 20, fov0: 42, fov1: 42 }), 63)],
      [14, HH(insert(W(0, 1.2, 0), { dur: 14, dist0: 2.4, dist1: 2.0, h0: .4, h1: .45, a0: -10, a1: 10, fov0: 36, fov1: 33 }), 64)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, bad): the dove hops onto the branch beside the nest; dashed gap; big red cross; tag "עומדת"; dove surprised
  function s5(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    setEggs(Y, 0); setChicks(Y, 1.8); Y.ruler.visible = false;
    Wd.on(t => {
      const hop = sm(P(.5, 2.2, t));
      Y.dv.position.set(lerp(0, SIDE[0], hop), lerp(0, SIDE[1], hop) + .35 * Math.sin(PI * hop), lerp(0, SIDE[2], hop));
      wings(Y, Math.sin(t * 14) * (.5 * Math.sin(PI * hop)));
      Y.ring.visible = false;
      Y.dash.forEach((d, i) => d.scale.setScalar(Math.max(.001, popE(P(2.4 + .15 * i, 3.1 + .15 * i, t)))));
      Y.cross.set(W(1.0, 1.4, .3), popE(P(3, 3.8, t)) * .8, .05 * Math.sin(t * 3));
      Y.shockR.set(W(1.0, 1.4, .3), P(3, 4, t), 1.2);
      Y.dv.rotation.z = .08 * Math.sin(t * 14) * sm(P(3, 4, t));
      Y.tOm.set(W(2.1, 2.3, .3), popE(P(4.5, 5.5, t)), 0, 1);
      setF(Y, t, { smile: -.5, surprise: sm(P(3, 3.6, t)) }, {}, { smile: -.4, surprise: .7 * sm(P(3, 3.6, t)), look: [0, .4] },
           { surprise: sm(P(3, 3.6, t)), smile: -.6, talk: .5 * talkAmt(t, 5), look: [0, .5] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [18, HH(punch(truck(W(.4, 1.2, 0), { dur: 18, dist0: 6.4, dist1: 6.0, h0: .7, h1: .8, a0: -10, a1: 10, fov0: 44, fov1: 42 }), [3.4, 5.0]), 71)],
      [18, HH(pushIn(W(.8, 1.2, 0), { dur: 18, dist0: 4.4, dist1: 3.6, h0: .4, h1: .6, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 72)],
      [18, HH(insert(W(1.0, 1.2, 0), { dur: 18, dist0: 2.2, dist1: 1.8, h0: .3, h1: .3, a0: -14, a1: 10, fov0: 36, fov1: 33 }), 73)],
      [18, HH(orbitShot(W(.5, 1.1, 0), { dur: 18, dist0: 4.8, dist1: 4.6, h0: .6, h1: .7, a0: -24, a1: -8, fov0: 42, fov1: 42 }), 74)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, good): the dove hops back and sits (ring glows green); then flies up in a gentle arc; big green check; chicks smile
  function s6(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    setEggs(Y, 0); setChicks(Y, 1.8); Y.ruler.visible = false;
    Wd.on(t => {
      const u1 = sm(P(0, 2.5, t)), u2 = sm(P(4.5, 8.5, t));
      Y.dv.position.set(lerp(SIDE[0], 0, u1) + 1.0 * u2,
                        lerp(SIDE[1], 0, u1) + .35 * Math.sin(PI * u1) + 3.2 * u2 + .3 * Math.sin(PI * u2),
                        lerp(SIDE[2], 0, u1) - .8 * u2);
      wings(Y, Math.sin(t * 12) * (.08 + .5 * u2));
      Y.ring.visible = t > 2.5 && u2 < .02;
      Y.ring.material.opacity = .55 + .45 * Math.sin(t * 4);
      Y.ring.scale.setScalar(1 + .04 * Math.sin(t * 4));
      Y.check.set(W(1.2, 1.5, .3), popE(P(7, 8, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set(W(1.2, 1.5, .3), P(7, 7.8, t), 2.0);
      setF(Y, t, { smile: 1, look: [0, .4] }, {}, { smile: 1, talk: .4 * talkAmt(t, 10), look: [0, .6] }, { smile: 1, talk: .4 * talkAmt(t, 11), look: [0, .4] });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [28, HH(punch(pushIn(W(0, 1.2, 0), { dur: 28, dist0: 4.2, dist1: 4.0, h0: .5, h1: .8, a0: -6, a1: 6, fov0: 42, fov1: 42 }), [7.5]), 81)],
      [28, HH(orbitShot(W(.3, 1.2, 0), { dur: 28, dist0: 4.4, dist1: 4.2, h0: .5, h1: .7, a0: -30, a1: 30, fov0: 42, fov1: 42 }), 82)],
      [30, HH(crane(W(0, 1.4, 0), { dur: 30, dist0: 4.6, dist1: 5.6, h0: .4, h1: 1.6, a0: 6, a1: -6, fov0: 42, fov1: 42 }), 83)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): golden light, big chicks in the nest, the dove circles high in the sky, slow crane
  function answer(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    setEggs(Y, 0); setChicks(Y, 1.8); Y.ring.visible = false;
    const gl = glowAt(Wd.scene, 5, 0xffe08a, .3); gl.position.set(0, 1.6, -2.5);
    Wd.on(t => {
      gl.material.opacity = .25 + .08 * Math.sin(t * 2);
      const a = t * .35;
      Y.dv.visible = true;
      Y.dv.position.set(2.2 * Math.cos(a), 1.9 + .2 * Math.sin(t * 2), 1.2 * Math.sin(a) - .4);
      Y.dv.rotation.z = 0;
      wings(Y, .35 * Math.sin(t * 10));
      setF(Y, t, { smile: 1, talk: .3 * talkAmt(t, 1) }, {}, { smile: 1, talk: .3 * talkAmt(t, 2) }, { smile: 1, talk: .3 * talkAmt(t, 3) });
    });
    Wd.occ = [Y.nest]; Wd.center = [NEST[0] - 2.7, NEST[2] + 1.6]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([NEST[0] - 1.3, 2.1, NEST[2] + 1.4], { dur: 20, dist0: 8.2, dist1: 7.6, h0: .4, h1: .9, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
