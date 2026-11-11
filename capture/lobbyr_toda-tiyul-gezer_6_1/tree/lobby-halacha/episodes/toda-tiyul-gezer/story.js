// toda-tiyul-gezer story (11/11/2026): thank-you screen after the Tel Gezer + Eshtaol trip. Talking objects only, NO people.
// Built from halashon-13 (tag / base / face / shock / mark3d helpers). 9 beats + hook + answer. Calm, warm gold/amber/olive/stone palette.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pushIn, pullOut, truck, orbitShot, crane, lowHero, insert, handheld, punch, face, talkAmt,
          mark3d, popE, ease, prog, clamp, lerp, texPlane, bill, arcPt, dotPath, FONT, fitText } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const split = (dur, ws) => { const tot = ws.reduce((a, b) => a + b, 0); return ws.map(w => dur * w / tot); };
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .05;
  const GOLD = 0xf2c14e, GREEN = 0x2fbf5b, RED = 0xe03131, PAPER = 0xf4e4b8, LIT = 0xffd166, OLIVE = 0x7d8a4a, OLIVE2 = 0x97a35c,
        SAND = 0xd9b77a, STONE = 0xb8ad9d, DARK = 0x2a2420, TRUNK = 0x6b4a2b, DIM = 0x8a8070;
  const TOP = .99;                                   // table top surface (table = box at TOP - .09, thickness .18)

  // ---------------------------------------------------------------- small helpers
  const group = (Wd, pos) => { const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g); return g; };
  const mkGlow = (r, col, op) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op === undefined ? .5 : op, depthWrite: false, fog: false })); m.renderOrder = 6; return m; };
  const mkRing = (r, tube, col) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, fog: false })); return m; };

  // ---------------------------------------------------------------- tags (billboards with a visible opacity), as halashon-13
  const mkDraw = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill();
    if (border) { c.lineWidth = H * .07; c.strokeStyle = border; c.stroke(); }
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  function tag(Wd, w, h, text, bg, fg, border) {
    const m = texPlane(w, h, mkDraw(text, bg, fg, border), { cw: 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, a) {
      const al = a === undefined ? 1 : a; g.visible = s > .01 && al > .01; if (!g.visible) return;
      g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); m.material.opacity = al; } };
  }

  // ---------------------------------------------------------------- set pieces
  // back wall + layered hills + floor (returned so beats can brighten the world)
  function world(Wd, floorCol) {
    const fl = box(26, .2, 9, floorCol || 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(26, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    const h1 = box(26, 1.6, .3, OLIVE); h1.position.set(0, .8, -4.3); Wd.add(h1);
    const h2 = box(9, 1.1, .3, SAND); h2.position.set(3.5, .55, -4.0); Wd.add(h2);
    const h3 = box(7, .9, .3, OLIVE2); h3.position.set(-6.5, .45, -4.0); Wd.add(h3);
    return { wall, fl };
  }
  // scene(Wd, true) = world + wooden table (beats); scene(Wd, false) = world only (hook, sunrise, answer)
  function scene(Wd, table) {
    const env = world(Wd);
    if (table) {
      const tb = box(12, .18, 3.0, 0xb07a4a); tb.position.set(0, TOP - .09, 0); Wd.add(tb);
      for (const lx of [-5.6, 5.6]) for (const lz of [-1.3, 1.3]) { const l = box(.2, TOP - .18, .2, 0x8a5a33); l.position.set(lx, (TOP - .18) / 2, lz); Wd.add(l); }
    }
    Wd.center = [0, 0];
    return env;
  }
  // olive tree: trunk + two crowns (y = base height)
  function tree(Wd, x, y, z, s) {
    const k = s || 1, g = group(Wd, [x, y, z]);
    const tr = cyl(.08 * k, .1 * k, .7 * k, TRUNK); tr.position.y = .35 * k; g.add(tr);
    const c1 = ball(.5 * k, OLIVE); c1.position.y = .95 * k; g.add(c1);
    const c2 = ball(.34 * k, OLIVE2); c2.position.set(.22 * k, 1.2 * k, .08 * k); g.add(c2);
    return g;
  }
  // lantern (the recurring motif): flicker is automatic; o.face adds a face on the frame, o.s scales the whole lantern
  function lantern(Wd, pos, o) {
    o = o || {}; const s = o.s || 1, g = group(Wd, pos); g.scale.setScalar(s);
    const bs = cyl(.16, .2, .08, TRUNK); bs.position.y = .04; g.add(bs);
    const frame = cyl(.2, .15, .42, 0x8a5a33); frame.position.y = .3; g.add(frame);
    const fl = ball(.13, LIT); fl.position.y = .3; g.add(fl);
    const gl = mkGlow(.34, LIT, .35); gl.position.y = .3; g.add(gl);
    const roof = cyl(0, .27, .16, TRUNK); roof.position.y = .6; g.add(roof);
    const f = o.face ? face(Wd, { w: .3, parent: frame, pos: [0, .05, .21], seed: o.seed || 3 }) : null;
    return { g, f, fl, gl, set(t) {
      fl.scale.setScalar(1 + .07 * Math.sin(t * 13) + .04 * Math.sin(t * 5.3));
      gl.scale.setScalar(1 + .1 * Math.sin(t * 9 + 1)); } };
  }
  // sparkles drifting up (deterministic, no random)
  function sparkles(Wd, n, yTop) {
    const arr = []; for (let i = 0; i < n; i++) { const m = mkGlow(.06 + .03 * (i % 3), GOLD, .9); m.visible = false; Wd.add(m); arr.push(m); }
    return t => arr.forEach((m, i) => {
      const u = (t * .3 + i * .137) % 1; m.visible = u < .95; if (!m.visible) return;
      m.position.set(-6 + ((i * 2.31) % 12), .3 + u * (yTop || 3.4), -.6 + ((i * .77) % 1.4));
      m.material.opacity = .9 * Math.sin(u * PI); });
  }
  // stone steps: list of [x, topHeight]
  function steps(Wd, list) {
    list.forEach(([x, top]) => { const s = box(.72, top, .9, STONE); s.position.set(x, top / 2, -.2); Wd.add(s); });
  }
  // cave arch (dark doorway) with a glow inside; returns the glow so the beat can light it
  function cave(Wd, x) {
    const body = box(1.5, 1.2, .4, DARK); body.position.set(x, .6, -.6); Wd.add(body);
    const top = cyl(.75, .75, .4, DARK); top.rotation.x = PI / 2; top.position.set(x, 1.2, -.6); Wd.add(top);
    const gl = mkGlow(.6, LIT, 0); gl.scale.set(1, 1.3, .25); gl.position.set(x, .6, -.35); Wd.add(gl);
    return gl;
  }
  // a standing sun-like face object (used for the sun and for the answer)
  function sunObj(Wd, pos, r, seed) {
    const sg = group(Wd, pos); const sun = ball(r, GOLD); sg.add(sun);
    const sf = face(Wd, { w: r * .9, parent: sg, pos: [0, 0, r + .02], seed: seed || 30 });
    return { sg, sun, sf };
  }

  // ================================================================ HOOK (14 s): extreme close-up on the lantern with a face at the top step; pulls out to the staircase going down into the cave arch
  function hook(dur) {
    const Wd = mkWorld({}); scene(Wd, false);
    steps(Wd, [[1.6, 1.0], [.9, .86], [.2, .72], [-.5, .58], [-1.2, .44], [-1.9, .3], [-2.6, .16]]);
    const gl = cave(Wd, -3.9);
    tree(Wd, 3.2, 0, -1.2, 1.6); tree(Wd, 4.6, 0, -1.8, 1.9); tree(Wd, -5.4, 0, -1.0, 1.4);
    const L = lantern(Wd, [1.6, 1.0, .2], { face: true, s: 3.0, seed: 4 });
    const sp = sparkles(Wd, 12, 3.2);
    const qq = tag(Wd, .9, .9, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    Wd.qPos = [1.6, 0]; Wd.occ = [L.g]; Wd.center = [-.4, 0];
    Wd.on(t => {
      L.set(t); L.f.set(t, { smile: .6, talk: .6 * talkAmt(t, 3), look: [0, 0] });
      gl.material.opacity = .85 * sm(P(4, 12, t));           // light grows from below, out of the cave
      qq.set([1.6, 3.9 + bob(t, 3), .4], popE(P(1.0, 1.8, t)));
      sp(t);
    });
    const w = split(dur, [5, 4.5, 4.5]);
    Wd.cam = cuts([
      [w[0], HH(pullOut([1.6, 2.0, .2], { dur: w[0], dist0: 1.6, dist1: 6.5, h0: .1, h1: 2.0, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-1.0, 1.0, 0], { dur: w[1], dist0: 9.0, dist1: 8.6, h0: 1.8, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.0, 0, 0] }), 52)],
      [w[2], HH(crane([-3.0, .6, 0], { dur: w[2], dist0: 6.5, dist1: 6.0, h0: .6, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 53)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (Winberg): compass with a face, a route drawn on the map, pins drop, schedule board ticks
  function beat1(dur) {
    const Wd = mkWorld({}); scene(Wd, true);
    const CX = -4.6, cg = group(Wd, [CX, TOP + 1.3, 0]);
    const disc = cyl(.95, .95, .12, GOLD); disc.rotation.x = PI / 2; cg.add(disc);
    cg.add(mkRing(.98, .05, GOLD));
    const needle = box(.08, .95, .05, RED); needle.position.z = .07; cg.add(needle);
    const cf = face(Wd, { w: .8, parent: cg, pos: [0, 0, .1], seed: 1 });
    const map = box(3.6, .04, 2.0, PAPER); map.position.set(-1.0, TOP + .02, 0); Wd.add(map);
    const A = [-2.3, TOP + .1, -.3], B = [.3, TOP + .1, .4];
    const route = dotPath(Wd, [A, [-1.0, TOP + .1, -.6], B], { color: 0xb0541a, step: .22, r: .05 });
    const pin = p => { const g = group(Wd, [p[0], TOP + 1.8, p[2]]); const st = cyl(.04, .04, .32, GOLD); st.position.y = .16; g.add(st); const hd = ball(.1, GOLD); hd.position.y = .36; g.add(hd); return g; };
    const pinA = pin(A), pinB = pin(B);
    const board = box(1.9, 2.1, .1, 0xfff6d6); board.position.set(3.8, TOP + 1.25, 0); Wd.add(board);
    const rows = ['הליכה במדרגות', 'תל גזר', 'יער אשתאול'];
    const rowTags = rows.map(s => tag(Wd, 1.3, .38, s, '#ffffff', '#5a3a10', '#c9a050'));
    const ticks = [0, 1, 2].map(() => mark3d(Wd, 'check', .55));
    Wd.occ = [cg, pinA, pinB]; Wd.center = [-1.0, 0];
    Wd.on(t => {
      cf.set(t, { smile: .4 + .4 * sm(P(0, 1.5, t)), talk: .8 * talkAmt(t, 1), look: [1, 0] });
      needle.rotation.z = t * .5;
      route.set(sm(P(1.5, 6.5, t)), t);
      pinA.position.y = lerp(TOP + 1.8, TOP + .18, ease.out(P(.6, 1.6, t)));
      pinB.position.y = lerp(TOP + 1.8, TOP + .18, ease.out(P(3.2, 4.2, t)));
      rowTags.forEach((r, i) => r.set([3.5, TOP + 1.7 - i * .45 + bob(t, i), .3], popE(P(.8 + i * .6, 1.6 + i * .6, t))));
      ticks.forEach((k, i) => k.set([4.5, TOP + 1.7 - i * .45, .3], popE(P(3.0 + i * 1.8, 4.0 + i * 1.8, t))));
    });
    const w = split(dur, [3.5, 3, 3.5]);
    Wd.cam = cuts([
      [w[0], HH(insert([CX, TOP + 1.3, 0], { dur: w[0], dist0: 3.0, dist1: 2.6, h0: .2, h1: .3, a0: -10, a1: 8, fov0: 38, fov1: 36 }), 1)],
      [w[1], HH(pushIn([-2.4, TOP + .6, -.2], { dur: w[1], dist0: 6.8, dist1: 5.8, h0: 1.8, h1: 1.5, a0: -8, a1: 6, fov0: 42, fov1: 40 }), 2)],
      [w[2], HH(punch(insert([-2.0, TOP + .5, 0], { dur: w[2], dist0: 4.0, dist1: 3.6, h0: .6, h1: .6, a0: -10, a1: 10, fov0: 38, fov1: 36 }), [.8]), 3)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (Kirshner): frying pan with a face; pancakes flip in an arc onto a growing stack; syrup pours; plate counter
  function beat2(dur) {
    const Wd = mkWorld({}); scene(Wd, true);
    const PX = -3.0, pg = group(Wd, [PX, TOP + .9, 0]); pg.scale.setScalar(.65);
    const pan = cyl(.9, .9, .14, 0x3a3f46); pan.rotation.x = PI / 2; pg.add(pan);
    const handle = box(1.2, .14, .14, TRUNK); handle.position.set(-1.35, 0, .05); pg.add(handle);
    const pf = face(Wd, { w: .8, parent: pg, pos: [0, 0, .12], seed: 2 });
    const SX = .2;
    const plate = cyl(1.1, 1.1, .05, PAPER); plate.position.set(SX, TOP + .025, 0); Wd.add(plate);
    const cakes = []; for (let i = 0; i < 8; i++) { const c = cyl(.8, .8, .14, 0xe0a040); c.visible = false; Wd.add(c); cakes.push(c); }
    const syrup = cyl(.035, .035, 1.0, 0xc46a1a); syrup.visible = false; Wd.add(syrup);
    const counter = tag(Wd, .6, .6, '8', '#f2c14e', '#3a2600', '#8a5a00');
    Wd.occ = [pg, plate]; Wd.center = [0, 0];
    Wd.on(t => {
      pg.rotation.z = .1 * Math.sin(t * 3) * (t > 1 ? 1 : 0);
      pf.set(t, { smile: .8, talk: .7 * talkAmt(t, 4), look: [1, 0] });
      cakes.forEach((c, i) => {
        const ts = 1.2 + i * .85, u = P(ts, ts + .9, t);
        if (t < ts) { c.visible = false; return; }
        c.visible = true;
        const rest = [SX, TOP + .12 + i * .14, .2];
        const p = u < 1 ? arcPt([PX, TOP + .9, .3], rest, ease.io(u), 2.2) : rest;
        c.position.set(p[0], p[1], p[2]);
        c.rotation.x = u < 1 ? 2 * PI * u : 0;     // flip in the air
      });
      const pour = P(6.5, 8.2, t), ps = Math.max(.01, pour);
      syrup.visible = pour > .01; syrup.scale.y = ps;
      syrup.position.set(SX + .05, TOP + 2.1 - .5 * ps, .2);
      counter.set([4.6, TOP + 1.6 + bob(t, 2), .3], popE(P(8.2, 9.0, t)));
    });
    const w = split(dur, [3.5, 3, 3.5]);
    Wd.cam = cuts([
      [w[0], HH(lowHero([SX, TOP + .8, 0], { dur: w[0], dist0: 4.6, dist1: 4.2, h0: -.3, h1: -.1, a0: -10, a1: 8, fov0: 42, fov1: 40 }), 61)],
      [w[1], HH(punch(insert([-1.2, TOP + .9, 0], { dur: w[1], dist0: 6.2, dist1: 5.8, h0: .2, h1: .3, a0: -10, a1: 6, fov0: 42, fov1: 40 }), [.5]), 62)],
      [w[2], HH(crane([SX, TOP + .7, 0], { dur: w[2], dist0: 5.5, dist1: 5.0, h0: .3, h1: 1.6, a0: 6, a1: -6, fov0: 42, fov1: 42 }), 63)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (Yudlov): a stone pillar with a face holds up the heavy slab; a lit path stays open beneath; the trees sway, the pillar stays steady
  function beat3(dur) {
    const Wd = mkWorld({}); scene(Wd, true);
    const LP = -1.5, RP = 1.5, PH = 2.4;
    const pl = group(Wd, [LP, TOP, 0]), pr = group(Wd, [RP, TOP, 0]);
    const bl = box(.7, PH, .7, STONE); bl.position.y = PH / 2; pl.add(bl);
    const br = box(.7, PH, .7, STONE); br.position.y = PH / 2; pr.add(br);
    const sg = group(Wd, [0, TOP + PH + .28, 0]);
    const slab = box(3.9, .56, 1.0, 0xa39a8a); sg.add(slab);
    const pf = face(Wd, { w: .6, parent: pl, pos: [0, 1.4, .38], seed: 5 });
    const path = dotPath(Wd, [[-4.6, TOP + .08, .5], [4.6, TOP + .08, .5]], { color: LIT, step: .45, r: .05 });
    const orbs = [0, 1, 2, 3].map(() => { const o = ball(.14, LIT); Wd.add(o); return o; });
    const trees = [tree(Wd, -5.3, TOP, -.4, 1.2), tree(Wd, 5.3, TOP, -.4, 1.2)];
    Wd.occ = [pl, sg]; Wd.center = [0, 0];
    Wd.on(t => {
      pf.set(t, { smile: .6, talk: .8 * talkAmt(t, 5), look: [0, 0] });
      sg.rotation.z = .018 * Math.sin(t * 1.3);            // the slab sways a little; the pillars stay still
      path.set(sm(P(.5, 4.5, t)), t);
      orbs.forEach((o, i) => { const u = (t * .2 + i * .25) % 1; o.position.set(-4.6 + 9.2 * u, TOP + .25 + .04 * Math.sin(t * 4 + i), .5); });
      trees.forEach((tr, i) => { tr.rotation.z = .07 * Math.sin(t * 1.5 + i * 2.1); });
    });
    const w = split(dur, [4.5, 3, 2.5]);
    Wd.cam = cuts([
      [w[0], HH(pushIn([0, TOP + 1.3, 0], { dur: w[0], dist0: 7.5, dist1: 4.6, h0: 1.5, h1: 1.2, a0: -8, a1: 4, fov0: 42, fov1: 38 }), 71)],
      [w[1], HH(orbitShot([0, TOP + 1.5, 0], { dur: w[1], dist0: 5.6, dist1: 5.6, h0: .6, h1: .8, a0: -40, a1: 40, fov0: 40, fov1: 40 }), 72)],
      [w[2], HH(insert([LP, TOP + 1.6, .3], { dur: w[2], dist0: 2.6, dist1: 2.3, h0: .2, h1: .2, a0: -8, a1: 8, fov0: 36, fov1: 34 }), 73)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (Sorotzkin): twelve small candles with tiny faces; the carer lantern walks the row and each one lights in turn
  function beat4(dur) {
    const Wd = mkWorld({}); scene(Wd, true);
    const N = 12, X0 = -5.2, DX = .945, cand = [], Xs = [];
    for (let i = 0; i < N; i++) {
      const x = X0 + i * DX; Xs.push(x);
      const g = group(Wd, [x, TOP, 0]);
      const body = cyl(.17, .17, .5, PAPER); body.position.y = .25; g.add(body);
      const fl = ball(.09, DIM); fl.position.y = .6; g.add(fl);
      const gl = mkGlow(.2, LIT, 0); gl.position.y = .62; g.add(gl);
      const f = face(Wd, { w: .24, parent: g, pos: [0, .25, .18], seed: 20 + i });
      cand.push({ fl, gl, f });
    }
    const carer = lantern(Wd, [X0, TOP, -.75], { face: true, s: 1.3, seed: 9 });   // walks BEHIND the row so it never hides a candle
    const cnt = tag(Wd, 1.6, .5, 'כל אחד', '#fff6d6', '#5a3a10', '#c9a050');
    const sp = sparkles(Wd, 10, 3.0);
    const lightT = i => .4 + 8.4 * ((Xs[i] - X0) / (Xs[N - 1] - X0));   // when the carer passes candle i
    Wd.occ = [carer.g]; Wd.center = [0, .9];
    Wd.on(t => {
      carer.g.position.x = lerp(X0, Xs[N - 1], P(.4, 8.8, t));
      carer.set(t);
      carer.f.set(t, { smile: .8, talk: .5 * talkAmt(t, 9), look: [0, 0] });
      cand.forEach((c, i) => {
        const k = sm(P(lightT(i), lightT(i) + .5, t));
        c.gl.material.opacity = .55 * k;
        c.fl.material.color.set(new THREE.Color(DIM).lerp(new THREE.Color(LIT), k));
        c.f.set(t, { smile: -.2 + 1.0 * k, talk: .3 * talkAmt(t, 40 + i) * k, look: [0, 0] });
      });
      cnt.set([0, 2.4 + bob(t, 2), .6], popE(P(8.6, 9.4, t)));
      sp(t);
    });
    const w = split(dur, [3.5, 3, 2.5]);
    Wd.cam = cuts([
      [w[0], HH(truck(t => [lerp(-4.2, 4.2, clamp(t / w[0], 0, 1)), TOP + .5, .3], { dur: w[0], dist0: 9.0, dist1: 9.0, h0: 1.6, h1: 1.6, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [0, 0, 0] }), 81)],
      [w[1], HH(punch(insert([Xs[5], TOP + .6, .3], { dur: w[1], dist0: 2.4, dist1: 2.2, h0: .2, h1: .2, a0: -6, a1: 6, fov0: 38, fov1: 36 }), [1.0]), 82)],
      [w[2], HH(crane([0, TOP + .8, 0], { dur: w[2], dist0: 6.2, dist1: 6.0, h0: .5, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 83)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (Friedlander): the golden sun rises over the hills, beams fan out, flowers open, the whole valley brightens
  function beat5(dur) {
    const Wd = mkWorld({}); const env = scene(Wd, false);
    const sun = sunObj(Wd, [0, .2, -2.6], 1.0, 30);
    const beams = []; for (let i = 0; i < 10; i++) { const bg = new THREE.Group(); bg.rotation.z = i * PI / 5; sun.sg.add(bg); const b = box(.12, 1.0, .05, GOLD); b.position.y = 1.5; bg.add(b); beams.push(b); }
    const flowers = [-4.2, -2.6, -1.0, 1.0, 2.6, 4.2].map((x, i) => {
      const g = group(Wd, [x, 0, .8]); g.scale.setScalar(.01);
      const st = cyl(.03, .03, .5, 0x4f7a3a); st.position.y = .25; g.add(st);
      const pt = ball(.14, 0xf28fb0); pt.position.y = .55; g.add(pt);
      return { g, i };
    });
    const sp = sparkles(Wd, 12, 3.2);
    Wd.center = [0, -1.0]; Wd.occ = [sun.sg];
    Wd.on(t => {
      sun.sg.position.y = lerp(.2, 2.3, sm(P(.5, 5.0, t)));
      sun.sf.set(t, { smile: .9, talk: .6 * talkAmt(t, 31), look: [0, 0] });
      const bk = sm(P(3, 6, t));
      beams.forEach(b => { b.scale.y = Math.max(.01, bk); b.position.y = 1.0 + .5 * Math.max(.01, bk); });
      flowers.forEach(f => { f.g.scale.setScalar(Math.max(.01, sm(P(4 + f.i * .3, 7 + f.i * .3, t)))); });
      const k = sm(P(2, 8, t));
      env.wall.material.color.set(new THREE.Color(0x6f6a5c).lerp(new THREE.Color(0xf6e7c6), k));
      env.fl.material.color.set(new THREE.Color(0x7d7258).lerp(new THREE.Color(0xe9d3a0), k));
      sp(t);
    });
    const w = split(dur, [4, 3, 3]);
    Wd.cam = cuts([
      [w[0], HH(crane([0, .8, -1.0], { dur: w[0], dist0: 6.0, dist1: 6.0, h0: -.3, h1: 1.4, a0: -6, a1: 6, fov0: 42, fov1: 42 }), 91)],
      [w[1], HH(pushIn([0, 1.6, -2.6], { dur: w[1], dist0: 4.4, dist1: 3.2, h0: .3, h1: .2, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 92)],
      [w[2], HH(truck([0, .5, .6], { dur: w[2], dist0: 6.0, dist1: 6.0, h0: .4, h1: .5, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [6, 0, 0] }), 93)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (Klein + Schneider): tripod camera with a face, microphone with a face, laptop progress bar fills, gears turn, cable lights up
  function beat6(dur) {
    const Wd = mkWorld({}); scene(Wd, true);
    const TX = -3.6, tg = group(Wd, [TX, TOP, 0]);
    const tbody = box(.95, .62, .5, 0x2b2f36); tbody.position.y = 1.62; tg.add(tbody);
    const rec = ball(.06, RED); rec.position.set(.35, 1.98, .27); tg.add(rec);
    [[-.4, .3], [.4, .3], [0, -.4]].forEach(([x, z]) => { const leg = cyl(.03, .03, 1.3, DARK); leg.position.set(x * .8, .65, z * .8); leg.rotation.x = -z * .35; leg.rotation.z = x * .35; tg.add(leg); });
    const tf = face(Wd, { w: .5, parent: tbody, pos: [-.12, 0, .27], seed: 6 });
    const MX = -.6, mg = group(Wd, [MX, TOP, -.5]);
    const stand = cyl(.04, .04, 1.9, DARK); stand.position.y = .95; mg.add(stand);
    const headG = group(Wd, [MX, TOP + 2.0, -.5]);
    const head = ball(.34, 0x4a4f57); headG.add(head);
    const mf = face(Wd, { w: .46, parent: headG, pos: [0, 0, .33], seed: 7 });
    const rings = [0, 1].map(() => { const r = mkRing(.5, .03, 0x9fe8b5); Wd.add(r); return r; });
    const LXp = 2.6, lp = group(Wd, [LXp, TOP, 0]);
    const lbase = box(2.0, .1, 1.2, 0x9aa3ad); lbase.position.y = .05; lp.add(lbase);
    const scr = box(2.0, 1.3, .08, 0x23272d); scr.position.y = .75; lp.add(scr);
    const bar = box(1.6, .14, .03, 0x3a4150); bar.position.set(0, .95, .06); lp.add(bar);
    const fill = box(1.6, .14, .03, GREEN); fill.position.set(0, .95, .08); lp.add(fill);
    const gears = [[4.9, .42, GOLD], [5.9, .3, 0x8b93a0]].map(([x, r, c]) => {
      const g = group(Wd, [x, TOP + r + .05, 0]);
      const body = cyl(r, r, .14, c); body.rotation.x = PI / 2; g.add(body);
      for (let k = 0; k < 8; k++) { const a = k * PI / 4; const tooth = box(.12, .12, .16, c); tooth.position.set(Math.cos(a) * (r + .06), Math.sin(a) * (r + .06), 0); g.add(tooth); }
      return g;
    });
    const cable = dotPath(Wd, [[TX + .2, TOP + .05, .8], [.4, TOP + .05, 1.0], [LXp - 1.0, TOP + .05, .8]], { color: GOLD, step: .2, r: .05 });
    Wd.occ = [tbody, headG]; Wd.center = [0, 0];
    Wd.on(t => {
      tg.rotation.y = .04 * Math.sin(t * .9);
      tf.set(t, { smile: .6, talk: .5 * talkAmt(t, 6), look: [1, 0] });
      mf.set(t, { smile: .5, talk: .8 * talkAmt(t, 7), look: [0, 0] });
      const k = sm(P(.5, 2.0, t));
      rec.material.color.set(new THREE.Color(RED).lerp(new THREE.Color(GREEN), k));
      gears[0].rotation.z = t * .9; gears[1].rotation.z = -t * 1.35;
      const k2 = sm(P(2.0, 8.0, t));
      fill.position.x = -.8 + .8 * k2; fill.scale.x = Math.max(.001, k2);
      rings.forEach((r, i) => { const u = (t * .6 + i * .5) % 1; r.position.set(MX, TOP + 2.0, -.5 + .05); r.scale.setScalar(.6 + u); r.material.opacity = .6 * (1 - u); });
      cable.set(sm(P(1.0, 4.0, t)), t);
    });
    const w = split(dur, [3, 3, 3]);
    Wd.cam = cuts([
      [w[0], HH(insert([5.3, TOP + .45, 0], { dur: w[0], dist0: 3.2, dist1: 3.0, h0: .3, h1: .3, a0: -12, a1: 10, fov0: 40, fov1: 38 }), 101)],
      [w[1], HH(truck([.4, TOP + 1.1, 0], { dur: w[1], dist0: 10.0, dist1: 10.0, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [4, 0, 0] }), 102)],
      [w[2], HH(punch(pushIn([.6, TOP + 1.2, 0], { dur: w[2], dist0: 6.0, dist1: 4.8, h0: .6, h1: .5, a0: 6, a1: -6, fov0: 42, fov1: 40 }), [1.2]), 103)]]);
    return Wd;
  }

  // ================================================================ BEAT 7 (Rokmil): a drum with a face; notes rise and bounce on each hit; the torch grows stronger; the power bar fills
  function beat7(dur) {
    const Wd = mkWorld({}); scene(Wd, true);
    const DXd = -2.4, dg = group(Wd, [DXd, TOP + .6, 0]); dg.scale.setScalar(1.6);
    const ped = box(1.2, .6, 1.2, STONE); ped.position.set(DXd, TOP + .3, 0); Wd.add(ped);
    const body = cyl(.85, .85, .9, 0xb3262c); body.position.y = .45; dg.add(body);
    const skin = cyl(.87, .87, .07, PAPER); skin.position.y = .92; dg.add(skin);
    [.3, .7].forEach(y => { const b = mkRing(.86, .03, GOLD); b.rotation.x = PI / 2; b.position.y = y; dg.add(b); });
    const df = face(Wd, { w: 1.0, parent: dg, pos: [0, .45, .88], seed: 8 });
    const HITS = [1.0, 2.2, 3.4, 4.6, 5.8, 7.0];
    const notes = []; for (let i = 0; i < 6; i++) { const g = group(Wd, [DXd, TOP + 1.5, 0]); g.add(ball(.13, GOLD)); const st = box(.04, .4, .04, GOLD); st.position.set(.12, .2, 0); g.add(st); g.visible = false; notes.push(g); }
    const TX2 = 2.6, tch = group(Wd, [TX2, TOP, 0]);
    const stick = cyl(.08, .1, 1.0, TRUNK); stick.position.y = .5; tch.add(stick);
    const flame = cyl(0, .3, .7, 0xff8a2a); flame.position.y = 1.25; tch.add(flame);
    const core = mkGlow(.22, LIT, .7); core.position.y = 1.15; tch.add(core);
    const pbg = group(Wd, [.1, TOP + 2.6, 0]);
    const pback = box(1.8, .22, .1, 0x3a2f26); pbg.add(pback);
    const pfill = box(1.8, .22, .12, GREEN); pbg.add(pfill);
    const ptag = tag(Wd, 1.0, .4, 'כוח', '#fff6d6', '#5a3a10', '#c9a050');
    Wd.occ = [dg, tch]; Wd.center = [0, 0];
    Wd.on(t => {
      const n = HITS.filter(h => t >= h).length, k = n / 6;
      const hit = HITS.reduce((a, h) => { const d = t - h; return (d >= 0 && d < .25) ? Math.max(a, 1 - d / .25) : a; }, 0);
      dg.scale.setScalar(1.6 * (1 + .05 * hit));
      df.set(t, { smile: .7, talk: .7 * talkAmt(t, 8), look: [0, 0] });
      notes.forEach((g, i) => {
        const on = t > 1.0 + i * .5 && t < 9.2; g.visible = on; if (!on) return;
        g.position.set(DXd + (i - 2.5) * .8, TOP + 2.5 + .6 * Math.abs(Math.sin(t * PI * 1.5 + i * .9)), 0);
      });
      const fs = .4 + .12 * n;
      flame.scale.set(1, fs, 1); flame.position.y = 1.25 + .3 * (fs - .4);
      core.scale.setScalar(.7 + .2 * n);
      pfill.position.x = -.9 + .9 * k; pfill.scale.x = Math.max(.001, k);
      ptag.set([.1, TOP + 3.1 + bob(t, 1), .3], popE(P(.4, 1.2, t)));
    });
    const w = split(dur, [4, 3, 2]);
    Wd.cam = cuts([
      [w[0], HH(punch(pushIn([DXd, TOP + 1.3, 0], { dur: w[0], dist0: 5.6, dist1: 4.8, h0: .4, h1: .4, a0: -8, a1: 6, fov0: 38, fov1: 36 }), [1.0, 2.2, 3.4]), 111)],
      [w[1], HH(punch(truck([-1.0, TOP + 1.3, 0], { dur: w[1], dist0: 7.0, dist1: 7.0, h0: .5, h1: .7, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [1.5, 0, 0] }), [.6, 1.8]), 112)],
      [w[2], HH(punch(insert([TX2, TOP + 1.2, 0], { dur: w[2], dist0: 3.0, dist1: 2.7, h0: .3, h1: .4, a0: -8, a1: 8, fov0: 38, fov1: 36 }), [.4]), 113)]]);
    return Wd;
  }

  // ================================================================ BEAT 8 (the bus driver): a gold bus with a face drives along the winding road from the school to the stone arch on the hill; wheels turn; arrives; check
  function beat8(dur) {
    const Wd = mkWorld({}); scene(Wd, true);
    const sc = group(Wd, [-4.9, TOP, -.8]);
    const sb = box(1.5, 1.2, 1.0, 0xe8c99a); sb.position.y = .6; sc.add(sb);
    const roof = cyl(0, .95, .6, 0xb0541a); roof.rotation.y = PI / 4; roof.position.y = 1.5; sc.add(roof);
    [-.4, .4].forEach(x => { const wn = box(.3, .3, .04, 0x59606b); wn.position.set(x, .75, .51); sc.add(wn); });
    const door = box(.3, .5, .04, DARK); door.position.set(0, .25, .51); sc.add(door);
    const road = box(12, .02, .75, 0x4a4f57); road.position.set(0, TOP + .01, 0); Wd.add(road);
    const dashes = []; for (let k = 0; k < 12; k++) { const d = box(.35, .03, .06, GOLD); d.position.y = TOP + .03; Wd.add(d); dashes.push(d); }
    const hg = group(Wd, [5.0, TOP, -.5]);
    const hill = box(2.6, .9, 2.0, OLIVE); hill.position.y = .45; hg.add(hill);
    const pl1 = box(.22, .7, .3, STONE); pl1.position.set(-.5, 1.25, 0); hg.add(pl1);
    const pr1 = box(.22, .7, .3, STONE); pr1.position.set(.5, 1.25, 0); hg.add(pr1);
    const lin = box(1.4, .2, .3, STONE); lin.position.set(0, 1.7, 0); hg.add(lin);
    tree(Wd, 4.3, TOP + .9, -1.1, .8); tree(Wd, 5.7, TOP + .9, .1, .9);
    const XB0 = -4.2, XB1 = 2.8;
    const xb = t => lerp(XB0, XB1, sm(P(.6, 7.4, t)));
    const zb = x => .22 * Math.sin((x + 4.2) * .9);      // winding road
    const bus = group(Wd, [XB0, TOP, zb(XB0)]);
    const bb = box(2.0, .9, .9, 0xe9b949); bb.position.y = .55; bus.add(bb);
    [-.75, -.25, .25].forEach(x => { const wn = box(.4, .3, .04, 0x59606b); wn.position.set(x, .7, .46); bus.add(wn); });
    const bf = face(Wd, { w: .42, parent: bus, pos: [.7, .55, .47], seed: 11 });
    const wheels = [-.6, .6].map(x => {
      const wg = new THREE.Group(); wg.position.set(x, .2, .48); wg.rotation.x = PI / 2; bus.add(wg);
      const disc = cyl(.2, .2, .14, DARK); wg.add(disc);
      const mk = box(.05, .03, .34, GOLD); mk.position.y = .08; disc.add(mk);
      return disc;
    });
    const ck = mark3d(Wd, 'check', .9);
    Wd.occ = [bus, sc]; Wd.center = [0, 0];
    Wd.on(t => {
      const x = xb(t), dist = x - XB0;
      bus.position.x = x; bus.position.z = zb(x);
      wheels.forEach(d => { d.rotation.y = dist / .2; });
      dashes.forEach((d, k) => { d.position.x = -6 + ((k * 1.0 + dist * 1.8) % 12); });
      bf.set(t, { smile: .8, talk: .6 * talkAmt(t, 12), look: [1, 0] });
      ck.set([5.0, TOP + 2.1, .4], popE(P(7.6, 8.4, t)) * .9, 0);
    });
    const w = split(dur, [4, 2.5, 2.5]);
    Wd.cam = cuts([
      [w[0], HH(truck(t => [xb(t), TOP + .6, zb(xb(t))], { dur: w[0], dist0: 6.0, dist1: 6.0, h0: 1.2, h1: 1.2, a0: -10, a1: 10, fov0: 42, fov1: 42, shift: [0, 0, 0] }), 121)],
      [w[1], HH(insert(t => { const x = xb(t + w[0]); return [x + .7, TOP + .55, zb(x)]; }, { dur: w[1], dist0: 3.4, dist1: 3.3, h0: .1, h1: .1, a0: -6, a1: 6, fov0: 38, fov1: 38, shift: [0, 0, 0] }), 122)],
      [w[2], HH(crane([2.0, TOP + .8, 0], { dur: w[2], dist0: 8.5, dist1: 8.0, h0: .6, h1: 1.8, a0: -6, a1: 6, fov0: 42, fov1: 40, shift: [0, 0, 0] }), 123)]]);
    return Wd;
  }

  // ================================================================ BEAT 9 (the whole staff): shelves of sefarim; a big warm lantern in the middle; small lanterns light up one by one into a full circle of light; sparkles rise
  function beat9(dur) {
    const Wd = mkWorld({}); scene(Wd, true);
    const shelf = group(Wd, [0, 0, -3.3]);
    const frame = box(9.0, 3.0, .5, TRUNK); frame.position.y = 1.5; shelf.add(frame);
    const bookCols = [0x8a3b2b, 0x2f5fa0, 0x6b8a3a, 0xc9a050, 0x5a3a7a];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 11; c++) {
      const h = [.45, .55, .5][(r + c) % 3];
      const bk = box(.3, h, .3, bookCols[(r * 3 + c) % bookCols.length]); bk.position.set(-4.2 + c * .8, .3 + r * .7 + h / 2, .12); shelf.add(bk);
    }
    const CL = lantern(Wd, [0, TOP, 0], { face: true, s: 3.0, seed: 13 });
    const small = []; for (let k = 0; k < 12; k++) { const th = k * PI / 6 + PI / 2; small.push(lantern(Wd, [Math.cos(th) * 2.4, TOP, Math.sin(th) * 1.0], { s: .6 })); }
    const circ = mkRing(1, .03, GOLD); circ.rotation.x = PI / 2; circ.position.y = TOP + .03; circ.scale.set(.01, .01, 1); Wd.add(circ);
    const sp = sparkles(Wd, 14, 3.0);
    Wd.occ = [CL.g]; Wd.center = [0, 0];
    Wd.on(t => {
      CL.set(t); CL.f.set(t, { smile: .9, talk: .8 * talkAmt(t, 14), look: [0, 0] });
      CL.gl.material.opacity = .3 + .1 * Math.sin(t * 2);
      small.forEach((L, k) => {
        const a = P(1.0 + k * .55, 1.5 + k * .55, t), kk = sm(a);
        L.set(t); L.gl.material.opacity = .6 * kk;
        L.fl.material.color.set(new THREE.Color(DIM).lerp(new THREE.Color(LIT), kk));
        L.g.scale.setScalar(.6 * Math.max(.01, popE(a)));
      });
      const kc = Math.max(.01, sm(P(8.0, 9.2, t)));
      circ.scale.set(2.4 * kc, kc, 1);
      sp(t);
    });
    const w = split(dur, [3.5, 3, 3.5]);
    Wd.cam = cuts([
      [w[0], HH(crane([0, TOP + .9, 0], { dur: w[0], dist0: 4.4, dist1: 4.4, h0: .3, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 131)],
      [w[1], HH(pullOut([0, TOP + .9, 0], { dur: w[1], dist0: 3.2, dist1: 7.0, h0: .3, h1: 1.8, a0: 6, a1: -6, fov0: 38, fov1: 44 }), 132)],
      [w[2], HH(truck([0, 1.5, 0], { dur: w[2], dist0: 12.0, dist1: 12.0, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [3, 0, 0] }), 133)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): the staircase from the cave arch up into the Eshtaol forest; the heroes gathered at the sides and bottom, smiling; sparkles rise
  function answer(dur) {
    const Wd = mkWorld({}); scene(Wd, false);
    steps(Wd, [[-4.2, .22], [-3.5, .36], [-2.8, .5], [-2.1, .64], [-1.4, .78], [-.7, .92], [0, 1.06], [.7, 1.2]]);
    cave(Wd, -5.1);
    const hill = box(3.2, 1.5, 2.2, OLIVE2); hill.position.set(4.6, .75, -2.0); Wd.add(hill);
    tree(Wd, 3.6, 1.5, -1.6, 1.1); tree(Wd, 5.0, 1.5, -2.2, 1.3); tree(Wd, 6.0, 1.5, -1.4, 1.0);
    const sun = sunObj(Wd, [-4.6, 1.5, -.6], .6, 40); sun.sg.scale.setScalar(1.4);
    const L = lantern(Wd, [-4.4, 0, 1.2], { face: true, s: 2.0, seed: 41 });
    const cg = group(Wd, [4.5, 1.0, .9]); cg.scale.setScalar(1.4);
    const cdisc = cyl(.6, .6, .12, GOLD); cdisc.rotation.x = PI / 2; cg.add(cdisc);
    const cf = face(Wd, { w: .6, parent: cg, pos: [0, 0, .1], seed: 42 });
    const pg = group(Wd, [-2.6, .6, 2.4]); pg.scale.setScalar(1.2);
    const pan = cyl(.5, .5, .12, 0x3a3f46); pan.rotation.x = PI / 2; pg.add(pan);
    const pf = face(Wd, { w: .5, parent: pg, pos: [0, 0, .1], seed: 43 });
    const bus = group(Wd, [2.6, 0, 2.5]); bus.scale.setScalar(.9);
    const bb = box(2.0, .9, .9, 0xe9b949); bb.position.y = .55; bus.add(bb);
    const bf = face(Wd, { w: .5, parent: bus, pos: [.7, .55, .47], seed: 44 });
    const sp = sparkles(Wd, 16, 3.6);
    Wd.center = [0, 0]; Wd.ansD = 6.4;
    Wd.on(t => {
      sun.sf.set(t, { smile: 1, talk: .4 * talkAmt(t, 50), look: [0, 0] });
      L.set(t); L.f.set(t, { smile: 1, talk: .4 * talkAmt(t, 51), look: [0, 0] });
      cf.set(t, { smile: 1, talk: .4 * talkAmt(t, 52), look: [0, 0] });
      pf.set(t, { smile: 1, talk: .4 * talkAmt(t, 53), look: [0, 0] });
      bf.set(t, { smile: 1, talk: .4 * talkAmt(t, 54), look: [0, 0] });
      cg.rotation.z = .05 * Math.sin(t * 1.1);
      sp(t);
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.0, 0], { dur, dist0: 9.0, dist1: 8.0, h0: .6, h1: 2.2, a0: -6, a1: 6, fov0: 42, fov1: 42, ease: 'out' }), 141)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6, beat7, beat8, beat9], answer };
};
