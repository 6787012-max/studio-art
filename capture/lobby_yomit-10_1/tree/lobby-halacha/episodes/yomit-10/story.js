// yomit-10 story: "Shiluach haken in a private yard" (halacha yomit, R' Amram Frid). Choreography per storyboards_v11.md (A).
// Talking objects only: THE NEST, TWO EGGS, THE HOUSE (windows = eyes, door-less face) and THE MOTHER DOVE (a bird). No people.
// Gold beam = ownership (house -> eggs). Green tag "hefker" = ownership given up. Red cross = wrong.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, pushIn, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const HH = (c, sd) => handheld(c, .03, sd);
  const sm = ease.sm, P = (a, b, t) => prog(t, a, b), PI = Math.PI;
  const NEST = [-1.1, 0, -.5], HOUSE = [1.8, 0, -2.4];
  const BEAM_A = [1.55, .6, -1.7], BEAM_B = [-1.1, .78, -.45];
  const MID = [(BEAM_A[0] + BEAM_B[0]) / 2, .7, (BEAM_A[2] + BEAM_B[2]) / 2];
  const FB = { talk: 0, smile: .4, look: [0, 0], surprise: 0, open: 1 };
  const X = new THREE.Vector3(1, 0, 0);

  // ---------------------------------------------------------------- tags (text on a rounded plate, copied from yomit-08-v2)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return;
      g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill();
    c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const drawScroll = (c, W, H) => {
    c.fillStyle = '#fff4d6'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#c9a050'; c.lineWidth = H * .025; c.strokeRect(W * .05, H * .03, W * .9, H * .94);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, 'שילוח הקן', { maxW: W * .8, maxLines: 1, max: H * .12, min: H * .05, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = '#5a3a10'; c.fillText(f.lines[0] || '', W / 2, H * .2);
    c.fillStyle = '#ffd34a'; c.fillRect(W * .1, H * .46, W * .8, H * .1);
    c.fillStyle = '#8a6a40'; for (let i = 0; i < 4; i++) c.fillRect(W * .14, H * (.66 + i * .07), W * .72, H * .012);
  };

  // ---------------------------------------------------------------- ONE shared dove (used by every builder through yard()): ellipsoid body, ball wings, ball tail, head, beak, face. No box() anywhere.
  // origin = nest base; sets Y.dv (group), Y.head, Y.df (face), Y.wl / Y.wr (wings, rotate about z to flap)
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
    return Y;
  }

  // ---------------------------------------------------------------- the yard: fence, house, nest with eggs and dove, ownership beam, tags, marks
  function yard(Wd) {
    const Y = { glowMats: [] };
    const floor = box(10, .1, 9, 0x9fd27e); floor.position.set(0, -.05, -1.2); Wd.add(floor);
    const wall = box(10, 3.2, .2, 0xf7e4c2); wall.position.set(0, 1.6, -4); Wd.add(wall);
    // fence = the private domain (glows gold when the house claims the yard)
    Y.fence = new THREE.Group(); Wd.add(Y.fence);
    const add = (m, x, y, z) => { m.position.set(x, y, z); Y.fence.add(m); Y.glowMats.push(m); };
    for (let x = -4.6; x < 4.7; x += .46) add(box(.12, 1.1, .12, 0x8a5a32), x, .55, -3.2);
    for (let z = -2.8; z < 2.9; z += .46) { add(box(.12, 1.1, .12, 0x8a5a32), -4.6, .55, z); add(box(.12, 1.1, .12, 0x8a5a32), 4.6, .55, z); }
    [.75, .4].forEach(y => { add(box(9.3, .08, .08, 0xb07a44), 0, y, -3.2); add(box(.08, .08, 6, 0xb07a44), -4.6, y, -.2); add(box(.08, .08, 6, 0xb07a44), 4.6, y, -.2); });
    Y.glow = k => Y.glowMats.forEach(m => { m.material.emissive.set(0xffb42a); m.material.emissiveIntensity = .9 * clamp(k, 0, 1); });
    // house (face on the front wall: windows = eyes)
    Y.house = new THREE.Group(); Y.house.position.set(HOUSE[0], HOUSE[1], HOUSE[2]); Wd.add(Y.house);
    const hb = box(1.6, 1.1, 1.2, 0xf6e7c6); hb.position.y = .55; Y.house.add(hb);
    const hr = cyl(.01, 1.05, .8, 0xb5523b); hr.position.y = 1.5; Y.house.add(hr);
    Y.hf = face(Wd, { w: .85, parent: Y.house, pos: [0, .5, .62], seed: 3 });
    // nest (bowl, face on the front rim)
    Y.nest = new THREE.Group(); Y.nest.position.set(NEST[0], NEST[1], NEST[2]); Wd.add(Y.nest);
    const bowl = cyl(.8, .6, .5, 0xa8733c); bowl.position.y = .25; Y.nest.add(bowl);
    Y.nf = face(Wd, { w: .62, parent: Y.nest, pos: [0, .22, .76], seed: 4 });
    // two eggs with tiny faces
    Y.eggs = [[-.22, .62, .05], [.22, .6, .02]].map((p, i) => {
      const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Y.nest.add(g);
      const e = ball(.22, 0xfff8ec); e.scale.set(.9, 1.2, .95); g.add(e);
      return { g, f: face(Wd, { w: .3, parent: g, pos: [0, .02, .23], seed: 5 + i }) };
    });
    makeDove(Wd, Y, Y.nest);
    // ownership beam (world space)
    Y.beam = box(1, .09, .09, 0xffc83a); Y.beam.visible = false; Wd.add(Y.beam);
    Y.setBeam = (A, B, k) => {
      const b = Y.beam; b.visible = k > .01; if (!b.visible) return;
      const d = new THREE.Vector3(B[0] - A[0], B[1] - A[1], B[2] - A[2]), L = d.length();
      b.position.set(A[0] + d.x * k / 2, A[1] + d.y * k / 2, A[2] + d.z * k / 2);
      b.quaternion.setFromUnitVectors(X, d.normalize()); b.scale.set(L * k, 1, 1);
    };
    // tags and marks
    Y.tSheli = bb(Wd, .4, .18, drawTag('שלי?', '#fff1c2', '#6a3a00', '#d9a63a'), 256);
    Y.tHefker = bb(Wd, 1.3, .5, drawTag('הפקר', '#f6fff2', '#1f6a2a', '#3f9a4a'));
    Y.tLo = bb(Wd, 1.3, .4, drawTag('לא צריך!', '#ffffff', '#1d2a5a', '#7a8794'));
    Y.cross = mark3d(Wd, 'cross', .6);
    Y.check = mark3d(Wd, 'check', 1.0);
    Y.shockR = shock(Wd, 0xff7a7a);
    Y.shockG = shock(Wd, 0x6dff9a);
    return Y;
  }
  // every face in the yard in one call (h = house, n = nest, e = both eggs, d = dove); unspecified fields use the defaults
  const FBase = Object.assign;
  const setF = (Y, t, h = {}, n = {}, e = {}, d = {}) => {
    Y.hf.set(t, FBase({}, FB, h)); Y.nf.set(t, FBase({}, FB, n));
    Y.eggs.forEach(x => x.f.set(t, FBase({}, FB, e))); Y.df.set(t, FBase({}, FB, d));
  };
  const wings = (Y, a) => { Y.wl.rotation.z = a; Y.wr.rotation.z = -a; };

  // ---------------------------------------------------------------- HOOK 0-14: extreme close-up of the eggs under the dove, pulls out to the yard and the house; "?" over the nest
  function hook(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Wd.qPos = [NEST[0], NEST[2]];
    Wd.on(t => { Y.glow(0); wings(Y, .04 * Math.sin(t * 2));
      setF(Y, t, { smile: .3, look: [.2, 0] }, { surprise: .3 * sm(P(9, 11, t)), look: [0, .4] }, { smile: .5 + .3 * Math.sin(t) }, { talk: .4 * talkAmt(t, 6), smile: .1, look: [0, -.2] }); });
    Wd.occ = [Y.nest, Y.house]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([[dur, HH(pullOut([NEST[0], .75, NEST[2]], { dur, dist0: 1.0, dist1: 5.2, h0: .25, h1: .9, a0: 6, a1: -12, fov0: 34, fov1: 44 }), 41)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 1 (14): the nest is in a closed crate with a lock = "mezuman"; a scroll opens on the left
  function s1(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Y.fence.visible = false; Y.house.visible = false;
    Y.nest.position.set(NEST[0], 1.0, NEST[2]);
    const crate = box(1.9, 1.0, 1.2, 0x9b7450); crate.position.set(NEST[0], .5, NEST[2]); Wd.add(crate);
    const lock = box(.28, .24, .1, 0xf2c14e); lock.position.set(NEST[0], .55, NEST[2] + .66); Wd.add(lock);
    const sc = texPlane(1.7, 2.1, drawScroll, { cw: 512 }); sc.position.set(-3.3, 1.5, -.3); sc.rotation.y = .25; Wd.add(sc);
    const gl = glowAt(Wd.scene, 2.4, 0xffd27a, .35); gl.position.set(-3.3, 1.5, 0);
    const tag = bb(Wd, 1.3, .5, drawTag('מזומן', '#fff1c2', '#6a3a00', '#d9a63a'));
    Wd.on(t => {
      sc.scale.y = .08 + .92 * sm(P(0, 1.8, t)); gl.material.opacity = .2 + .2 * Math.sin(t * 3);
      lock.rotation.z = .14 * Math.sin(t * 9) * sm(P(2, 4, t));
      tag.set([NEST[0] + 1.3, 1.1, NEST[2] + .4], popE(P(5, 6.2, t)), 0, 1);
      setF(Y, t, {}, { talk: .6 * talkAmt(t, 4), smile: .4 }, { smile: .5 }, { smile: .2 });
    });
    Wd.occ = [Y.nest, crate]; Wd.center = [-2.0, -.5];
    Wd.cam = cuts([
      [5, HH(truck([-1.1, 1.2, -.5], { dur: 5, dist0: 5.0, dist1: 5.0, h0: .5, h1: .6, a0: -8, a1: 8, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 31)],
      [5, HH(pushIn([-.6, 1.1, -.5], { dur: 5, dist0: 4.4, dist1: 4.0, h0: .45, h1: .5, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 32)],
      [4, HH(punch(insert([NEST[0], 1.0, NEST[2] + .1], { dur: 4, dist0: 1.6, dist1: 1.3, h0: .25, h1: .2, a0: -8, a1: 6, fov0: 34, fov1: 31 }), [1.0]), 33)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 2 (28, bad): the fence glows, a gold beam runs from the house to the eggs; "שלי?" on the eggs
  function s2(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Wd.on(t => {
      Y.glow(sm(P(.5, 3, t))); Y.setBeam(BEAM_A, BEAM_B, sm(P(2, 5, t)));
      Y.tSheli.set([NEST[0] - .1, 2.05, NEST[2] + .3], popE(P(4.5, 5.5, t)), 0, 1);
      setF(Y, t, { talk: talkAmt(t, 1) * P(.5, 1, t), smile: .9, look: [-.5, 0] }, { smile: -.6, look: [.6, .3] }, { smile: .2, look: [0, .5] }, { smile: .3, talk: .2 * talkAmt(t, 6) });
      Y.dv.position.y = .02 * Math.sin(t * 2);
    });
    Wd.occ = [Y.nest, Y.house]; Wd.center = [-.3, -1.0];
    Wd.cam = cuts([
      [4.5, HH(pushIn([0, .9, -1.0], { dur: 4.5, dist0: 6.0, dist1: 5.2, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 44, fov1: 42 }), 42)],
      [4.5, HH(punch(truck([HOUSE[0] - .5, 1.0, -2.2], { dur: 4.5, dist0: 3.8, dist1: 3.6, h0: .4, h1: .45, a0: -20, a1: -6, fov0: 42, fov1: 42 }), [1.0]), 43)],
      [5, HH(insert([-.6, .85, -.7], { dur: 5, dist0: 2.2, dist1: 1.7, h0: .35, h1: .3, a0: -10, a1: 12, fov0: 36, fov1: 33 }), 44)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 3 (42, bad): a red cross over the nest; the dove is shocked; the beam stays connected
  function s3(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    const CX = [NEST[0] + 1.0, 1.2, NEST[2] + .3];
    Wd.on(t => {
      Y.glow(.9); Y.setBeam(BEAM_A, BEAM_B, 1);
      Y.cross.set(CX, popE(P(3, 3.8, t)) * .8, .05 * Math.sin(t * 3));
      Y.shockR.set(CX, P(3, 4, t), 1.2);
      Y.dv.rotation.z = .08 * Math.sin(t * 14) * sm(P(3, 4, t));
      setF(Y, t, { talk: .4 * talkAmt(t, 1) * (t < 3 ? 1 : 0), smile: .8 }, { surprise: t > 3 ? 1 : 0, smile: -.6, talk: t > 3 ? .4 * talkAmt(t, 7) : 0 }, { smile: -.2, look: [0, .4] }, { surprise: sm(P(3, 3.6, t)), smile: -.6, talk: .5 * talkAmt(t, 5), look: [0, .5] });
    });
    Wd.occ = [Y.nest, Y.house]; Wd.center = [-.4, -.9];
    Wd.cam = cuts([
      [5, HH(pushIn([NEST[0], 1.0, NEST[2]], { dur: 5, dist0: 3.4, dist1: 2.9, h0: .5, h1: .4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 51)],
      [4, HH(punch(orbitShot([(NEST[0] + HOUSE[0]) / 2, 1.0, -1.4], { dur: 4, dist0: 4.2, dist1: 4.0, h0: .6, h1: .6, a0: -24, a1: -10, fov0: 42, fov1: 42 }), [3.0]), 52)],
      [5, HH(punch(insert([NEST[0], 1.2, NEST[2]], { dur: 5, dist0: 1.8, dist1: 1.5, h0: .35, h1: .3, a0: -14, a1: 10, fov0: 34, fov1: 32 }), [3.0]), 53)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 4 (56, good): the house shakes its head left-right; the bubble "לא צריך!"; the beam flickers
  function s4(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Wd.on(t => {
      Y.glow(.6); Y.house.rotation.y = .22 * Math.sin(t * 7) * sm(P(1, 2, t)) * (1 - sm(P(6, 7.5, t)));
      Y.setBeam(BEAM_A, BEAM_B, .75 + .25 * Math.sin(t * 16));
      Y.tLo.set([2.7, 1.3, -1.6], popE(P(1.5, 2.5, t)), .05 * Math.sin(t * 4), 1);
      setF(Y, t, { talk: .6 * talkAmt(t, 1), smile: 1, look: [-.6, 0] }, { smile: .8, look: [1, 0] }, { smile: .6 }, { smile: .3, talk: .3 * talkAmt(t, 8) });
    });
    Wd.occ = [Y.nest, Y.house]; Wd.center = [.2, -1.2];
    Wd.cam = cuts([
      [4.5, HH(truck([(NEST[0] + HOUSE[0]) / 2, 1.0, -1.5], { dur: 4.5, dist0: 5.5, dist1: 5.3, h0: .45, h1: .5, a0: -10, a1: 10, fov0: 44, fov1: 42 }), 61)],
      [4.5, HH(punch(pushIn([HOUSE[0], 1.0, HOUSE[2]], { dur: 4.5, dist0: 3.8, dist1: 3.0, h0: .4, h1: .5, a0: -6, a1: 10, fov0: 42, fov1: 40 }), [1.6, 2.4]), 62)],
      [5, HH(insert([1.9, 1.5, -1.6], { dur: 5, dist0: 3.0, dist1: 2.6, h0: .3, h1: .3, a0: -16, a1: 8, fov0: 36, fov1: 33 }), 63)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 5 (72, good): the beam snaps and fades; the green "הפקר" tag pops over the eggs; the fence glow goes out
  function s5(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    Wd.on(t => {
      Y.glow(1 - sm(P(.8, 2, t)));
      Y.setBeam(BEAM_A, BEAM_B, 1 - sm(P(1, 1.8, t)));
      Y.shockG.set(MID, P(1.6, 2.4, t), 1.5);
      Y.tHefker.set([NEST[0] + 1.2, 1.2, NEST[2] + .5], popE(P(3, 4, t)), 0, 1);
      setF(Y, t, { smile: .5 }, { smile: 1, talk: .5 * talkAmt(t, 9) }, { smile: 1, look: [0, .6], talk: .3 * talkAmt(t, 8) }, { smile: .6 });
    });
    Wd.occ = [Y.nest, Y.house]; Wd.center = [NEST[0], NEST[2]];
    Wd.cam = cuts([
      [4, HH(insert([-.6, .8, -.5], { dur: 4, dist0: 1.9, dist1: 1.5, h0: .3, h1: .25, a0: -14, a1: 6, fov0: 36, fov1: 33 }), 71)],
      [5, HH(punch(pushIn([NEST[0], .9, NEST[2]], { dur: 5, dist0: 3.2, dist1: 2.7, h0: .4, h1: .35, a0: 6, a1: -6, fov0: 42, fov1: 40 }), [3.0]), 72)],
      [5, HH(crane([NEST[0], .9, NEST[2]], { dur: 5, dist0: 4.2, dist1: 3.8, h0: .2, h1: 1.4, a0: -6, a1: 8, fov0: 42, fov1: 42 }), 73)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- BEAT 6 (86, good): the dove lifts off the nest in a gentle arc; big green check; the eggs stay safe; slow orbit
  function s6(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    const CK = [NEST[0] + 1.0, 1.9, NEST[2]];
    Wd.on(t => {
      Y.glow(0);
      const u = sm(P(3, 8, t));
      Y.dv.position.set(lerp(0, -.9, u), lerp(.03 * Math.sin(t * 2), .8, u) + .3 * Math.sin(PI * u), lerp(0, -.4, u));
      wings(Y, Math.sin(t * 12) * (.08 + .5 * u));
      Y.check.set(CK, popE(P(7, 8, t)) * .9, .05 * Math.sin(t * 3));
      Y.shockG.set(CK, P(7, 7.8, t), 2.0);
      setF(Y, t, { smile: 1, talk: .3 * talkAmt(t, 1) }, { smile: 1, look: [0, .5] }, { smile: 1, look: [0, .8] }, { smile: 1, talk: .5 * talkAmt(t, 10), look: [0, .6] });
    });
    Wd.occ = [Y.nest, Y.house]; Wd.center = [-.9, -.6];
    Wd.cam = cuts([
      [5, HH(pushIn([NEST[0], 1.4, NEST[2]], { dur: 5, dist0: 3.6, dist1: 3.4, h0: .4, h1: .7, a0: -6, a1: 6, fov0: 42, fov1: 44 }), 81)],
      [4.5, HH(punch(orbitShot([NEST[0], 1.2, NEST[2]], { dur: 4.5, dist0: 4.0, dist1: 3.8, h0: .5, h1: .7, a0: -30, a1: 30, fov0: 42, fov1: 42 }), [7.0]), 82)],
      [4.5, HH(insert([NEST[0], .9, NEST[2]], { dur: 4.5, dist0: 1.6, dist1: 1.3, h0: .2, h1: .2, a0: 6, a1: -6, fov0: 34, fov1: 32 }), 83)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER (20): the yard in golden light, nest with eggs, house smiling, slow crane
  function answer(dur) {
    const Wd = mkWorld({}); const Y = yard(Wd);
    const gl = glowAt(Wd.scene, 5, 0xffe08a, .3); gl.position.set(0, 1.6, -2.5);
    Wd.on(t => {
      Y.glow(.4); gl.material.opacity = .25 + .08 * Math.sin(t * 2);
      Y.dv.position.y = .03 * Math.sin(t * 2);
      setF(Y, t, { smile: 1, talk: .4 * talkAmt(t, 1) }, { smile: 1, talk: .3 * talkAmt(t, 2) }, { smile: 1 }, { smile: 1, talk: .3 * talkAmt(t, 3) });
    });
    Wd.occ = [Y.nest, Y.house]; Wd.center = [-.4, -.5]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([-.4, 1.1, -.5], { dur: 20, dist0: 7.6, dist1: 7.0, h0: .5, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer };
};
