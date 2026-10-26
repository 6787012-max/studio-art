// yomit-03 story: "grater / slicer / garlic crusher / masher on Yom Tov" (halacha yomit, R' Fried) - 3D choreography per storyboards_v4.md (A).
// Boys only (Moishy + little Dudi). Nobody touches a knife or a flame: every tool floats and works BY ITSELF (magic kitchen).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, plainRoom, diningTable, chair, mark3d, popE, lighting, glowAt, glowSprite,
    texPlane, toon, bm, FONT, fitText, lerpV, arcPt, shock, bill, booksTex, windowUnit, dotPath, rng } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.06 * d : ly];
  const CT = .72, TT = .76;                    // island top / table top (cloth)
  const TX = 3.0, TZ = -1.7;                   // dining table centre
  const BZ = -3.25;                            // the boys' standing line (behind island / table)
  const MOISHY = 3, DUDI = 2, DS = .88;

  // ---------------------------------------------------------------- boys
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(() => { const k = Pn.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }); return Pn; };   // dark navy velvet kippa
  const moishy = (Wd, fn) => boyK(Wd, MOISHY, t => Object.assign({ pos: [-3.0, 0, BZ], facing: .45, perform: .35, smile: .5 }, fn(t)));
  const dudi = (Wd, fn) => boyK(Wd, DUDI, t => Object.assign({ pos: [-.8, 0, BZ], facing: -.4, scale: DS, perform: .35, smile: .5 }, fn(t)));
  // a boy walking along the back line (x0 -> x1) between t0..t1: returns pos / facing / walk fields
  const strollX = (t, t0, t1, x0, x1, z0, z1, f0, f1) => { const u = clamp((t - t0) / (t1 - t0), 0, 1), mv = u > 0 && u < 1, zm = -2.65,
      z = u < .12 ? lerp(z0, zm, u / .12) : (u > .88 ? lerp(zm, z1, (u - .88) / .12) : zm);
    return { pos: [lerp(x0, x1, sm(u)), 0, z], facing: mv ? face(x1 - x0, .15) : (u <= 0 ? f0 : f1), walk: mv ? t * 9 : undefined, perform: mv ? 0 : .3 }; };

  // ---------------------------------------------------------------- billboards (tag, lamp)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .84, maxLines: 1, max: H * .64, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54); };
  const drawLamp = (c, W, H) => {
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.fillStyle = '#ffd84a'; c.beginPath(); c.arc(W / 2, H / 2, W * .44, 0, PI * 2); c.fill(); c.lineWidth = W * .06; c.strokeStyle = '#8a5a00'; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(W * .36, H * .3, W * .13, H * .07, -.5, 0, PI * 2); c.fill();
    c.fillStyle = '#5a2e00'; c.beginPath(); c.roundRect(W * .445, H * .2, W * .11, H * .36, W * .05); c.fill(); c.beginPath(); c.arc(W / 2, H * .72, W * .06, 0, PI * 2); c.fill(); };
  const drawChange = drawTag('שינוי', '#fff2b8', '#7a1c1c', '#d9a63a');
  const drawOnTable = drawTag('על השולחן', '#fff2b8', '#7a1c1c', '#d9a63a');
  const lampGlow = (Wd) => { const gl = glowSprite(1.8, 1.8, 0); gl.material.color.set(0xffe27a); Wd.add(gl); return gl; };

  // ---------------------------------------------------------------- rooms
  function kitchenRoom(Wd, noChairs) {
    const R = plainRoom(Wd, { HX: 6.2, HZ: 4.6, H: 3.5, beams: false, wall: 0xf8edd2 });
    // back counter + splash + uppers + window (kitchen side)
    Wd.add(box(5.7, .9, .7, 0xc9a574, { pos: [-3.3, .45, -4.25] })); Wd.add(box(5.8, .06, .8, 0x6a5a48, { pos: [-3.3, .93, -4.22] }));
    Wd.add(box(5.7, .85, .04, 0xeef2f6, { pos: [-3.3, 1.38, -4.58], ink: false }));
    windowUnit(Wd, -3.3, 1.5, -4.57, 0, 1.4, 1.7);
    Wd.add(box(1.8, .9, .4, 0xb98a58, { pos: [-5.2, 2.55, -4.4] })); Wd.add(box(1.8, .9, .4, 0xb98a58, { pos: [-1.4, 2.55, -4.4] }));
    Wd.add(box(.95, 2.2, .8, 0xeef2f6, { pos: [-.1, 1.1, -4.15] }));
    for (const dy of [.5, 1.6]) Wd.add(box(.05, .5, .05, 0x8a929c, { pos: [.3, dy + .2, -3.72], ink: false }));
    // dining side: window + curtains + bookcase
    windowUnit(Wd, 3.0, 1.0, -4.57, 0, 1.6, 2.1);
    for (const dx of [-1, 1]) Wd.add(box(.5, 2.4, .14, 0xb5503a, { pos: [3.0 + dx * 1.1, 1.9, -4.5], ink: false }));
    Wd.add(box(1.7, 2.7, .5, 0x7a4a2a, { pos: [5.2, 1.35, -4.3] })); const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.5), toon(0xffffff, { map: booksTex(5) })); sh.position.set(5.2, 1.35, -4.04); Wd.add(sh);
    // island (kitchen work table, boys stand behind it)
    Wd.add(box(2.5, .62, .95, 0xf0e4cc, { pos: [-2.2, .31, -1.75] })); Wd.add(box(2.7, .08, 1.05, 0xe2bd88, { pos: [-2.2, .68, -1.75] }));
    // the festive Yom Tov table
    diningTable(Wd, { x: TX, z: TZ, len: 3.2, wid: 1.1, cloth: 0xfffaf0, food: false });
    Wd.add(box(3.0, .012, .26, 0xd9a63a, { pos: [TX, TT + .008, TZ], ink: false }));
    Wd.add(box(.46, .09, .26, 0x244a86, { pos: [TX + 1.15, TT + .05, TZ - .34] })); Wd.add(ball(.13, 0xe3b25a, { pos: [TX + 1.15, TT + .1, TZ - .34], scale: [1.4, .5, 1], ink: false }));
    Wd.add(cyl(.05, .035, .16, 0xd8dde6, { pos: [TX - 1.2, TT + .1, TZ - .36] })); Wd.add(cyl(.09, .09, .02, 0xd8dde6, { pos: [TX - 1.2, TT + .03, TZ - .36], ink: false }));
    if (!noChairs) { chair(Wd, TX - .7, TZ - .95, 0, .46); chair(Wd, TX + .7, TZ - .95, 0, .46); }
    lighting(Wd, () => ({ hemi: 1.15, sun: 1.0, hemiColor: 0xfff1d8, sunColor: 0xfff1dc }));
    return R;
  }
  const kW = () => mkWorld({ skyTop: 0x9ad0f6, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 40, fogFar: 140, hemi: 1.15, sun: 1.0, sunPos: [-14, 26, 16], shadowExt: 14 });

  // ---------------------------------------------------------------- props
  function openCyl(Wd, rt, rb, h, col) {
    const g = new THREE.Group(); const side = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 32, 1, true), toon(col, { side: THREE.DoubleSide })); side.position.y = h / 2; side.castShadow = true; g.add(side);
    g.add(cyl(rb - .005, rb - .005, .02, 0xe8eef4, { pos: [0, .012, 0], ink: false }));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(rt, .018, 8, 32), toon(0xffffff)); rim.rotation.x = PI / 2; rim.position.y = h; g.add(rim); Wd.add(g); return g;
  }
  const mkBowl = Wd => openCyl(Wd, .27, .18, .2, 0x4a8fd0);
  const mkPlate = (Wd, r) => { const g = new THREE.Group(); g.add(cyl(r, r * .85, .03, 0xfffaf0, { pos: [0, .015, 0] })); const rm = new THREE.Mesh(new THREE.TorusGeometry(r * .93, .014, 6, 32), toon(0x3b6fd0)); rm.rotation.x = PI / 2; rm.position.y = .03; g.add(rm); Wd.add(g); return g; };
  function mkKnife(Wd) {   // origin = blade belly (cut point); blade extends along x, edge down
    const g = new THREE.Group(), s = new THREE.Group(); s.scale.setScalar(1.15); g.add(s); Wd.add(g);
    s.add(box(.34, .075, .012, 0xe2e8ee, { pos: [0, .0375, 0], inkW: .004 })); s.add(box(.15, .045, .026, 0x4a2c14, { pos: [.245, .06, 0], inkW: .004 })); s.add(box(.015, .05, .03, 0xd9a63a, { pos: [.17, .055, 0], ink: false })); return g; }
  function mkFork(Wd) {   // origin = tine tips, tines point down
    const g = new THREE.Group(), s = new THREE.Group(); s.scale.setScalar(1.3); g.add(s); Wd.add(g);
    s.add(box(.026, .22, .012, 0xdde3ea, { pos: [0, .2, 0], inkW: .004 })); s.add(box(.12, .03, .012, 0xdde3ea, { pos: [0, .09, 0], inkW: .004 }));
    for (const dx of [-.045, -.015, .015, .045]) s.add(box(.012, .08, .01, 0xdde3ea, { pos: [dx, .04, 0], ink: false })); return g; }
  const grDraw = coarse => (c, W, H) => { c.fillStyle = '#c4ccd4'; c.fillRect(0, 0, W, H); c.strokeStyle = '#6a737d'; c.lineWidth = W * .02; c.strokeRect(W * .02, H * .02, W * .96, H * .96);
    const nx = coarse ? 3 : 6, ny = coarse ? 6 : 12; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x = W * (.17 + (i + (j % 2) * .5) * (.7 / nx)), y = H * (.08 + j * (.84 / ny)); c.fillStyle = '#5a636d'; c.beginPath(); c.ellipse(x, y, W * (coarse ? .06 : .03), H * (coarse ? .026 : .014), 0, 0, PI * 2); c.fill(); c.fillStyle = '#e6ecf1'; c.beginPath(); c.ellipse(x, y - H * .01, W * (coarse ? .05 : .024), H * (coarse ? .014 : .007), 0, 0, PI * 2); c.fill(); } };
  function mkGrater(Wd) {   // origin = base centre; the grating face looks toward +z
    const g = new THREE.Group(), s = new THREE.Group(); s.rotation.x = -.12; g.add(s); Wd.add(g);
    s.add(box(.2, .36, .12, 0xb8c0c8, { pos: [0, .2, 0] })); s.add(box(.23, .02, .16, 0x8a929c, { pos: [0, .01, 0], ink: false }));
    const f = texPlane(.19, .34, grDraw(true), { cw: 256, opaque: true, ro: 2, depthWrite: true }); f.position.set(0, .2, .062); s.add(f);
    const b = texPlane(.19, .34, grDraw(false), { cw: 256, opaque: true, ro: 2, depthWrite: true }); b.position.set(0, .2, -.062); b.rotation.y = PI; s.add(b);
    const h = new THREE.Mesh(new THREE.TorusGeometry(.06, .014, 8, 20), toon(0xd62828)); h.position.set(0, .4, 0); h.castShadow = true; s.add(h); return g; }
  function mkCarrot(Wd) {
    const g = new THREE.Group(); Wd.add(g); g.add(cyl(.036, .012, .32, 0xff8a1f, { inkW: .005 })); g.add(cyl(.016, .026, .05, 0x3fae4a, { pos: [0, .18, 0], ink: false }));
    for (const y of [-.06, .02, .09]) g.add(cyl(.0375 - (y + .16) * .06, .0375 - (y + .16) * .06, .006, 0xd9660a, { pos: [0, y, 0], ink: false })); return g; }
  function mkSlicer(Wd) {   // origin = centre on the surface; plate at y = .30, blade slot at local x = +.2, handle on the left
    const g = new THREE.Group(); Wd.add(g);
    g.add(box(.66, .03, .28, 0xaab3bd, { pos: [0, .3, 0] })); g.add(box(.07, .032, .16, 0x3a3f48, { pos: [.2, .3, 0], ink: false })); g.add(box(.012, .02, .26, 0xe9eef2, { pos: [.235, .318, 0], rot: [0, 0, -.2], ink: false }));
    g.add(box(.2, .04, .07, 0x2fa84f, { pos: [-.38, .32, 0] }));
    for (const sz of [-1, 1]) { g.add(box(.04, .3, .035, 0x8a929c, { pos: [-.27, .15, sz * .135] })); g.add(box(.5, .02, .03, 0x8a929c, { pos: [-.03, .01, sz * .135], ink: false })); }
    return g; }
  function mkCrusher(Wd) {   // origin = hinge point (left); chamber near the hinge; handles to the right; returns {g, arm}
    const g = new THREE.Group(); Wd.add(g);
    g.add(box(.48, .03, .06, 0xb0b4bc, { pos: [.24, 0, 0] })); g.add(cyl(.06, .06, .035, 0x9aa0aa, { pos: [.1, .015, 0] })); g.add(box(.16, .03, .06, 0x2fa84f, { pos: [.5, 0, 0] }));
    const arm = new THREE.Group(); g.add(arm); arm.position.set(0, .035, 0);
    arm.add(box(.48, .026, .056, 0xb0b4bc, { pos: [.24, .013, 0] })); arm.add(cyl(.045, .045, .04, 0xd6dbe2, { pos: [.1, -.014, 0] })); arm.add(box(.16, .026, .056, 0x2fa84f, { pos: [.5, .013, 0] }));
    return { g, arm }; }
  function mkMasher(Wd) {   // origin = head bottom
    const g = new THREE.Group(); Wd.add(g);
    g.add(cyl(.15, .15, .022, 0xc3cad2, { pos: [0, .011, 0] })); g.add(box(.3, .016, .024, 0x8a929c, { pos: [0, .03, 0], ink: false })); g.add(box(.024, .016, .3, 0x8a929c, { pos: [0, .03, 0], ink: false }));
    for (const [dx, dz] of [[-.08, -.08], [.08, -.08], [-.08, .08], [.08, .08]]) g.add(cyl(.01, .01, .1, 0x8a929c, { pos: [dx * .5, .08, dz * .5], ink: false }));
    g.add(cyl(.02, .02, .3, 0x6a4326, { pos: [0, .24, 0] })); g.add(ball(.04, 0x6a4326, { pos: [0, .4, 0] })); return g; }
  const mkClove = Wd => { const m = ball(.028, 0xfff2d0, { scale: [1, 1.25, .8], inkW: .004 }); m.visible = false; Wd.add(m); return m; };

  // flying / resting little pieces: each spec {kind, col, sz, t0, d, from, to(t), lift, rot0, rot1}
  function chips(Wd, list) {
    const ms = list.map(o => { let m;
      if (o.kind === 'disc') { m = new THREE.Group(); m.add(cyl(o.sz[0], o.sz[0], o.sz[1], o.col, { inkW: .004 })); if (o.col2) m.add(cyl(o.sz[0] * .78, o.sz[0] * .78, o.sz[1] + .004, o.col2, { ink: false })); }
      else if (o.kind === 'ball') m = ball(o.sz[0], o.col, { inkW: .004 });
      else m = box(o.sz[0], o.sz[1], o.sz[2], o.col, { inkW: .004 });
      m.visible = false; Wd.add(m); return m; });
    Wd.on(t => list.forEach((o, i) => { const m = ms[i]; if (t < o.t0) { m.visible = false; return; } m.visible = true;
      const u = clamp((t - o.t0) / o.d, 0, 1), to = o.to(t), p = u >= 1 ? to : arcPt(o.from, to, sm(u), o.lift || 0); m.position.set(p[0], p[1], p[2]);
      const a = o.rot0 || [0, 0, 0], b = o.rot1 || a; m.rotation.set(lerp(a[0], b[0], sm(u)), lerp(a[1], b[1], sm(u)), lerp(a[2], b[2], sm(u))); }));
    return ms;
  }
  // heap offsets inside a bowl (local, bowl origin = base centre)
  const heapOff = (i, rank0) => { const k = i + (rank0 || 0), a = k * 2.39996, r = .12 * Math.sqrt(((k * 7) % 11 + 1) / 11); return [Math.cos(a) * r, .06 + (k % 5) * .016, Math.sin(a) * r * .9]; };
  const addV = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

  // cutter: a log (cucumber / tomato / carrot) that is consumed; pieces fly to the bowl.
  // o: {xb (right end), y, z, r, n, th, shape, col, core, times[], bowl(t)->origin, rank0, appear(t)->0..1, kind, mode:'knife'|'slicer', fall (flight d), lift, chipSz, chipCol}
  function cutter(Wd, o) {
    const n = o.n, th = o.th, L0 = o.shape === 'ball' ? 2 * o.r : n * th, xb = o.xb, xa0 = xb - L0, ap = o.appear || (() => 1);
    let log;
    if (o.shape === 'ball') log = ball(o.r, o.col, { inkW: .005 });
    else { log = cyl(o.r, o.r, L0, o.col, { rot: [0, 0, PI / 2], inkW: .005 }); log.add(cyl(o.r * .84, o.r * .84, .004, o.core || 0xcfe8a8, { pos: [0, L0 / 2, 0], ink: false })); }
    Wd.add(log);
    const cnt = t => o.times.reduce((a, tc) => a + sm(P(tc - .04, tc + .07, t)), 0), R = rng(o.seed || 5);
    Wd.on(t => { const a = ap(t), c = cnt(t), Lr = Math.max(.0001, L0 - th * c), sc = popE(a); log.visible = a > .01 && Lr > .006; log.position.set(xb - Lr / 2, o.y, o.z);
      if (o.shape === 'ball') log.scale.set(sc * Lr / L0, sc, sc); else log.scale.set(sc, sc * Lr / L0, sc); });
    const specs = o.times.map((tc, i) => { const off = heapOff(i, o.rank0), kind = o.kind || 'disc', cx = o.mode === 'slicer' ? xb - th / 2 : xa0 + th * i + th / 2;
      const rr = [R() * 1.2, R() * 6, PI / 2 * R()];
      return { kind, col: o.chipCol || o.col, col2: kind === 'disc' ? (o.shape === 'ball' ? 0xff8f7a : (o.core || 0xcfe8a8)) : undefined, sz: kind === 'disc' ? [o.r, th * .92] : [o.chipSz, o.chipSz, o.chipSz],
        t0: tc + .02, d: o.fall || .55, from: [cx, o.y, o.z], to: t => addV(o.bowl(t), off), lift: o.lift === undefined ? .3 : o.lift, rot0: kind === 'disc' ? [0, 0, PI / 2] : [0, 0, 0], rot1: kind === 'disc' ? [rr[0], rr[1], rr[2]] : rr }; });
    chips(Wd, specs);
    const knifeX = t => xa0 + th * (1 + o.times.reduce((a, tc) => a + sm(P(tc + .08, tc + .4, t)), 0));
    const hump = t => o.times.reduce((m, tc) => Math.max(m, sm(clamp(1 - Math.abs(t - tc) / .26, 0, 1))), 0);
    return { knifeX, hump, log };
  }
  // static decoration chips in a bowl
  function fillBowl(Wd, bowlPos, cols, n, rank0) { const specs = []; for (let i = 0; i < n; i++) { const off = heapOff(i, rank0 || 0); specs.push({ kind: 'disc', col: cols[i % cols.length][0], col2: cols[i % cols.length][1], sz: [.042, .03], t0: -1, d: .01, from: addV(bowlPos, off), to: () => addV(bowlPos, off), rot0: [.4 * (i % 3), i, .6 * (i % 4)] }); } return chips(Wd, specs); }

  // ---------------------------------------------------------------- shared little rigs
  const CUC = [0x2e8b3a, 0xcfe8a8], TOM = [0xd8342a, 0xff8f7a];
  const bobY = (t, a, f) => a * Math.sin(t * f);

  // ---------------------------------------------------------------- 1. HOOK 0-14: the five tools float above the island, Moishy scratches his head over the grater
  function hook(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const bw = mkBowl(Wd), kn = mkKnife(Wd), fk = mkFork(Wd), gr = mkGrater(Wd), cr = mkCrusher(Wd);
    fillBowl(Wd, [-3.35, CT + .2, -1.78], [CUC, TOM], 7);
    const spark = [], R = rng(11); for (let i = 0; i < 10; i++) { const s = glowSprite(.14, .14, 0); s.material.color.set(0xffe9a8); Wd.add(s); spark.push([s, R() * 6, R()]); }
    Wd.on(t => { const k = sm(P(.2, 1.2, t));
      bw.position.set(-3.35, CT + .2 + .04 * Math.sin(t * 1.3), -1.78); bw.scale.setScalar(.01 + .99 * popE(P(.2, 1.0, t)));
      kn.position.set(-2.8, CT + .2 + .05 * Math.sin(t * 1.5 + 1), -1.78); kn.rotation.z = .12 * Math.sin(t * 1.1); kn.scale.setScalar(.01 + .99 * popE(P(.4, 1.2, t)));
      fk.position.set(-2.4, CT + .06 + .05 * Math.sin(t * 1.4 + 2), -1.78); fk.rotation.z = .2 * Math.sin(t * 1.0 + 1); fk.scale.setScalar(.01 + .99 * popE(P(.6, 1.4, t)));
      gr.position.set(-2.0, CT + .12 + .05 * Math.sin(t * 1.2 + 3), -1.78); gr.rotation.y = .5 * Math.sin(t * .7); gr.scale.setScalar((.01 + .99 * popE(P(.8, 1.6, t))) * (1 + .07 * sm(P(4, 5, t))));
      cr.g.position.set(-1.45, CT + .2 + .05 * Math.sin(t * 1.6 + 4), -1.78); cr.g.rotation.z = .15 * Math.sin(t * 1.2); cr.g.scale.setScalar(.01 + .99 * popE(P(1.0, 1.8, t))); cr.arm.rotation.z = .3 + .1 * Math.sin(t * 2);
      spark.forEach(([s, ph, q]) => { s.position.set(-2.4 + 1.5 * Math.sin(t * .6 + ph), CT + .55 + .25 * Math.sin(t * .9 + ph * 2), -1.78 + .2 * Math.sin(t + ph)); s.material.opacity = .5 * k * (.5 + .5 * Math.sin(t * 2.5 + ph) ** 2); }); });
    Wd.occ = [bw, kn, fk, gr, cr.g];
    moishy(Wd, t => ({ pos: [-4.4, 0, -1.75], facing: .85 + .1 * Math.sin(t * .7), gesture: t > 4.6 && t < 9.2 ? 'think' : null, perform: t > 4.6 && t < 9.2 ? 0 : .5, brow: t > 4.6 ? .55 : .2, smile: t > 4.6 ? .05 : .4, look: t > 2 ? .5 * Math.sin(t * 1.2) : .3 }));
    dudi(Wd, t => ({ pos: [-.1, 0, -1.75], facing: -.85, gesture: t > 6.5 ? 'shrug' : null, perform: t > 6.5 ? 0 : .5, brow: .45, smile: .1, look: .3 }));
    Wd.center = [-2.2, -1.75]; Wd.qPos = [-3.6, -1.75]; Wd.qSize = 1.0;
    Wd.cam = seq([0, cine([C(0, [-.6, 1.0, -2.3], 9.0, 2.0, -26, 44), C(5, [-1.8, 1.0, -2.3], 6.4, 1.6, 6, 44)])],
      [5, cine([C(5, [-2.2, 1.25, -2.0], 5.2, 1.0, 24, 40), C(9, [-2.2, 1.25, -2.0], 4.8, .9, -8, 40)])],
      [9, cine([C(9, [-2.2, 1.05, -1.8], 5.4, .9, -30, 40), C(11.6, [-2.2, 1.05, -1.8], 5.0, .8, 18, 40)])],
      [11.6, cine([C(11.6, [-.4, 1.1, -2.2], 6.6, 1.6, 12, 44), C(14, [-.2, 1.2, -2.2], 9.2, 2.2, -18, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: Moishy's board: cucumber + tomato are cut by a floating knife, pieces fall into the bowl, green check
  function s2(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const BXc = -2.55, BZc = -1.8, bowlP = [-1.45, CT, -1.78];
    Wd.add(box(.95, .04, .52, 0xe0b070, { pos: [BXc, CT + .02, BZc] })); Wd.add(box(.9, .01, .46, 0xefc888, { pos: [BXc, CT + .045, BZc], ink: false }));
    const bw = mkBowl(Wd); bw.position.set(...bowlP);
    const ct = [0, 1, 2, 3, 4, 5, 6, 7].map(i => 2.0 + .62 * i), tt = [0, 1, 2, 3].map(i => 7.4 + .62 * i), YL = CT + .04 + .05;
    const cu = cutter(Wd, { xb: -2.25, y: YL, z: BZc, r: .05, n: 8, th: .055, col: CUC[0], core: CUC[1], times: ct, bowl: () => bowlP, appear: t => P(.3, 1.0, t), seed: 3 });
    const to = cutter(Wd, { xb: -2.5, y: CT + .04 + .085, z: BZc, r: .085, n: 4, th: .0425, shape: 'ball', col: TOM[0], times: tt, bowl: () => bowlP, rank0: 8, appear: t => P(6.4, 7.1, t), seed: 8 });
    const kn = mkKnife(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), gl = glowAt(Wd.scene, 2.2, 0x9dffb0, 0);
    Wd.occ = [kn, ck.g, sk.g];
    Wd.on(t => { const useT = t < 6.8, kx = useT ? cu.knifeX(t) : to.knifeX(t), hp = useT ? cu.hump(t) : to.hump(t), a = popE(P(.6, 1.4, t)) * (1 - sm(P(11.2, 11.9, t)));
      kn.visible = a > .01; kn.scale.setScalar(Math.max(.01, a)); kn.position.set(kx + .11, lerp(YL + .26, YL - .03, hp), BZc + .1 + .02 * Math.sin(t * 3)); kn.rotation.z = .12 - .2 * hp;
      const ok = popE(P(10.6, 11.5, t)); ck.set([bowlP[0], 1.3 + .05 * Math.sin(t * 3), bowlP[2]], ok * .85, .05 * Math.sin(t * 3)); sk.set([bowlP[0], 1.3, bowlP[2]], P(10.6, 11.5, t), .5);
      gl.position.set(bowlP[0], CT + .25, bowlP[2]); gl.material.opacity = .5 * sm(P(10.6, 11.6, t)); });
    moishy(Wd, t => ({ pos: [-3.95, 0, -1.75], facing: .85, gesture: t > 11 ? 'thumb' : null, perform: t > 11 ? 0 : .5, smile: .5 + .4 * sm(P(10.5, 11.5, t)), look: .3 * Math.sin(t * .9), talk: t > 11 ? .3 * talkAmt(t, 3) : 0 }));
    dudi(Wd, t => ({ pos: [-.1, 0, -1.75], facing: -.85, gesture: t > 11 ? 'cheer' : null, perform: t > 11 ? 0 : .45, smile: .5 + .4 * sm(P(10.5, 11.5, t)), look: -.3 * Math.sin(t * .8) }));
    Wd.center = [-2.0, BZ];
    Wd.cam = seq([0, cine([C(0, [-2.0, .95, -1.9], 6.0, 1.8, 26, 44), C(3.4, [-2.1, .95, -1.9], 4.6, 1.4, 12, 42)])],
      [3.4, cine([C(3.4, [-2.1, .9, -1.8], 3.9, 1.3, -22, 40), C(6.8, [-2.0, .9, -1.8], 4.0, 1.3, 8, 40)])],
      [6.8, cine([C(6.8, [-2.0, .9, -1.8], 4.2, 1.3, 26, 40), C(10.4, [-2.0, .95, -1.8], 4.4, 1.3, -6, 42)])],
      [10.4, cine([C(10.4, [-2.0, 1.0, -1.9], 4.8, 1.2, -16, 42), C(dur, [-2.0, 1.1, -2.0], 7.0, 1.8, 20, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-42: Dudi's plate: a floating fork mashes soft potatoes, the mash grows, green check
  function s3(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const PX = -2.4, PZ = -1.78, pl = mkPlate(Wd, .34); pl.position.set(PX, CT, PZ);
    const salad = mkBowl(Wd); salad.position.set(-1.2, CT, -1.7); fillBowl(Wd, [-1.2, CT, -1.7], [CUC, TOM], 12);
    const lumps = [[-.1, .0, .06, 0xe8c872], [.08, .02, -.04, 0xeccb7a], [-.01, -.07, -.03, 0xe0bc66], [.02, .09, .03, 0xe8c872]].map(([dx, dz, rz, col]) => { const m = ball(.095, col, { inkW: .005 }); Wd.add(m); return [m, dx, dz]; });
    const hits = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => 2.0 + .8 * i), N = hits.length;
    const fk = mkFork(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), gl = glowAt(Wd.scene, 2.0, 0x9dffb0, 0);
    const kk = t => hits.reduce((a, th) => a + sm(P(th - .05, th + .12, t)), 0) / N;
    const hump = t => hits.reduce((m, th) => Math.max(m, sm(clamp(1 - Math.abs(t - th) / .22, 0, 1))), 0);
    Wd.occ = [fk, ck.g];
    Wd.on(t => { const k = kk(t); lumps.forEach(([m, dx, dz], i) => { m.position.set(PX + dx * (1 + k * .9), CT + .03 + lerp(.09, .02 + .006 * i, k), PZ + dz * (1 + k * .9)); m.scale.set(lerp(1, 1.75 + .1 * i, k), lerp(1, .26, k), lerp(1, 1.7, k)); });
      const idx = Math.min(N - 1, Math.max(0, Math.round((t - 2.0) / .8))), tgt = [PX + .1 * Math.sin(idx * 2.1), 0, PZ + .08 * Math.cos(idx * 1.7)], hp = hump(t), a = popE(P(.5, 1.3, t)) * (1 - sm(P(9.9, 10.5, t)));
      fk.visible = a > .01; fk.scale.setScalar(Math.max(.01, a)); fk.position.set(tgt[0] + .02, lerp(CT + .35, CT + .09, hp), tgt[2]); fk.rotation.z = .25; fk.rotation.x = .1;
      const ok = popE(P(9.8, 10.7, t)); ck.set([PX, 1.3 + .05 * Math.sin(t * 3), PZ], ok * .85, .05 * Math.sin(t * 3)); sk.set([PX, 1.3, PZ], P(9.8, 10.7, t), 1.5);
      gl.position.set(PX, CT + .25, PZ); gl.material.opacity = .5 * sm(P(9.8, 10.8, t)); });
    dudi(Wd, t => ({ pos: [-3.95, 0, -1.75], facing: .85, gesture: t > 10.2 ? 'cheer' : null, perform: t > 10.2 ? 0 : .5, smile: .5 + .4 * sm(P(9.5, 10.5, t)), look: .3 * Math.sin(t * .9) }));
    moishy(Wd, t => ({ pos: [-.45, 0, -1.75], facing: -.85, gesture: t > 10.2 ? 'thumb' : (t > 3 && t < 7 ? 'point' : null), perform: (t > 10.2 || (t > 3 && t < 7)) ? 0 : .45, smile: .5 + .4 * sm(P(9.5, 10.5, t)), look: -.3 * Math.sin(t * .7) }));
    Wd.center = [-1.9, BZ];
    Wd.cam = seq([0, cine([C(0, [-2.2, .95, -1.9], 6.0, 1.8, -24, 44), C(3.6, [-2.1, .95, -1.9], 4.6, 1.4, -10, 42)])],
      [3.6, cine([C(3.6, [-2.2, .9, -1.8], 3.9, 1.3, 24, 40), C(7.4, [-2.2, .9, -1.8], 3.9, 1.3, -12, 40)])],
      [7.4, cine([C(7.4, [-2.2, .9, -1.8], 4.0, 1.2, -20, 40), C(10.2, [-2.1, .95, -1.8], 4.3, 1.2, 8, 41)])],
      [10.2, cine([C(10.2, [-2.1, 1.0, -1.9], 4.8, 1.2, 22, 42), C(dur, [-2.0, 1.1, -2.0], 7.0, 1.8, -18, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 42-58: grating a carrot; yellow "!"; grater + plate glide to the dining table; grating there, brighter check
  function s4(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const G0 = [-2.3, CT, -1.78], G1 = [TX, TT, -1.78], TG0 = 5.2, TG1 = 9.4, gu = t => sm(P(TG0, TG1, t));
    const gpos = t => { const u = gu(t); return u <= 0 ? G0 : (u >= 1 ? G1 : arcPt(G0, G1, u, .32)); };
    const pl = mkPlate(Wd, .36), gr = mkGrater(Wd), ca = mkCarrot(Wd);
    const R = rng(21), sh = [];
    const phases = [[1.0, 4.2], [9.9, 14.6]]; phases.forEach(([a, b]) => { for (let t0 = a, i = 0; t0 < b; t0 += .13, i++) sh.push(t0); });
    const specs = sh.map((t0, i) => { const sy = .26 - (i % 6) * .04, rx = (R() - .5) * .14, rz = (R() - .5) * .08, off = [(R() - .5) * .3, .035 + (i % 4) * .008, .13 + R() * .13];
      return { kind: 'box', col: i % 3 ? 0xff8a1f : 0xffa13a, sz: [.05, .01, .01], t0, d: .4, from: [0, 0, 0], fromFn: null, to: t => addV(gpos(t), off), lift: .0, rot0: [0, R() * 3, 0], rot1: [0, R() * 3, R() * 2], _s: [rx, sy, rz] }; });
    // shreds start at the grater face (follow the grater position at t0)
    const shMs = chips(Wd, specs.map(s => Object.assign({}, s, { from: addV(gpos(s.t0), [s._s[0], s._s[1], .05]) })));
    const lamp = bb(Wd, .55, .55, drawLamp, 256), lg = lampGlow(Wd), tag = bb(Wd, .95, .4, drawChange, 512), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), sk2 = shock(Wd, 0xfff0a0), gl = glowAt(Wd.scene, 2.6, 0x9dffb0, 0);
    const arcP = [0, .2, .4, .6, .8, 1].map(u => addV(arcPt(G0, G1, u, .06), [0, .08, .32])), nd0 = Wd.scene.children.length, dp = dotPath(Wd, arcP, { color: 0xffd166, r: .05, step: .3 });   // low arc just above the counter/table: never at head height
    Wd.occ = [pl, gr, ca, lamp.g, tag.g, ck.g, sk.g, sk2.g].concat(Wd.scene.children.slice(nd0));
    Wd.on(t => { const p = gpos(t); pl.position.set(p[0], p[1], p[2]); gr.position.set(p[0], p[1] + .03, p[2] - .12);
      // carrot strokes (only while grating)
      const g1 = t > 1.0 && t < 4.4, g2 = t > 9.9, ing = g1 || g2, ph = ((t - (g1 ? 1.0 : 9.9)) * 1.25) % 1, stroke = ing ? (ph < .6 ? 1 - ph / .6 : (ph - .6) / .4) : 1, ap = popE(P(.2, .9, t)) * (1 - sm(P(11.6, 12.2, t)) * 0);
      ca.visible = ap > .01 && !(t > 4.4 && t < 5.0 && false); ca.scale.setScalar(Math.max(.01, ap));
      if (ing) ca.position.set(p[0], p[1] + .05 + .24 * stroke, p[2] - .12 + .085 - .02 * stroke); else if (t < 1.0) ca.position.set(p[0] - .55, p[1] + .42 + .05 * Math.sin(t * 3), p[2] + .15); else ca.position.set(p[0] + .45, p[1] + .55 + .05 * Math.sin(t * 2.5), p[2] + .1);
      ca.rotation.set(-.55, 0, ing ? 0 : .5);
      const la = popE(P(4.3, 5.1, t)) * (1 - sm(P(11.2, 11.9, t))); lamp.set([p[0], p[1] + 1.0 + .05 * Math.sin(t * 3), p[2] - .05], la * 1.0, .06 * Math.sin(t * 5)); lg.position.set(p[0], p[1] + 1.0, p[2] - .1); lg.material.opacity = .55 * la;
      const tg = popE(P(5.0, 5.8, t)) * (1 - sm(P(9.2, 9.9, t))); const mid = arcPt(G0, G1, .5, .32); tag.set([mid[0], mid[1] + .95, mid[2] - .1], tg * 1.0, .03 * Math.sin(t * 3));
      dp.set(t < 9.4 ? P(4.9, 6.6, t) : 1 - P(9.4, 10.3, t), t);
      const ok = popE(P(12.0, 13.0, t)); ck.set([G1[0], 1.35 + .06 * Math.sin(t * 3), G1[2] - .1], ok * 1.0, .05 * Math.sin(t * 3)); sk.set([G1[0], 1.35, G1[2] - .1], P(12.0, 13.0, t), .55); sk2.set([G1[0], 1.35, G1[2] - .1], P(12.3, 13.4, t), .75);
      gl.position.set(G1[0], TT + .3, G1[2]); gl.material.opacity = .75 * sm(P(12.0, 13.0, t)); });
    moishy(Wd, t => { const w = strollX(t, 5.0, 9.4, -3.95, 1.05, -1.75, TZ, .85, .85); return Object.assign(w, { gesture: t > 13 ? 'thumb' : null, perform: (t > 13 || t > 5.0 && t < 9.4) ? 0 : .4, smile: .5 + .4 * sm(P(12, 13, t)), look: .2 * Math.sin(t * .8) }); });
    dudi(Wd, t => { const w = strollX(t, 5.3, 9.7, -.45, 4.95, -1.75, TZ, -.85, -.85); return Object.assign(w, { gesture: t > 13 ? 'cheer' : null, perform: (t > 13 || t > 5.3 && t < 9.7) ? 0 : .4, smile: .5 + .4 * sm(P(12, 13, t)) }); });
    Wd.center = [0, BZ];
    Wd.cam = seq([0, cine([C(0, [-2.2, .95, -1.9], 6.0, 1.7, 24, 44), C(2.6, [-2.2, .9, -1.9], 4.6, 1.4, 8, 41), C(4.9, [-2.2, .95, -1.9], 4.3, 1.3, -14, 41)])],
      [4.9, cine([C(4.9, [-2.0, 1.0, -1.9], 5.0, 1.5, -18, 43), C(7.0, [.5, 1.1, -1.9], 6.4, 1.8, 4, 45), C(9.6, [3.0, 1.0, -1.9], 5.4, 1.6, 16, 43)])],
      [9.6, cine([C(9.6, [3.0, .95, -1.9], 4.6, 1.3, 22, 41), C(12.0, [3.0, .95, -1.9], 4.4, 1.3, -8, 41)])],
      [12.0, cine([C(12.0, [3.0, 1.1, -2.0], 4.8, 1.2, -18, 42), C(dur, [3.0, 1.2, -2.0], 6.6, 1.7, 12, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-72: slicer: big round slices -> check; tiny cubes -> "!" and the slicer glides to the table -> check
  function s5(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const S0 = [-2.4, CT, -1.78], S1 = [TX - .1, TT, -1.78], TG0 = 9.0, TG1 = 11.4, su = t => sm(P(TG0, TG1, t)), spos = t => { const u = su(t); return u <= 0 ? S0 : (u >= 1 ? S1 : arcPt(S0, S1, u, .3)); };
    const sl = mkSlicer(Wd), bw = mkBowl(Wd), bowlAt = t => { const p = spos(t); return [p[0] + .4, p[1], p[2] + .02]; };
    const bigT = [0, 1, 2, 3, 4].map(i => 1.5 + .62 * i), cubT = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => 6.2 + .15 * i);
    // the logs are built in world coordinates at the island station and only used before the glide
    const bladeX = S0[0] + .2, ly = CT + .3 + .015 + .052;
    cutter(Wd, { xb: bladeX, y: ly, z: S0[2], r: .052, n: 5, th: .075, col: CUC[0], core: CUC[1], times: bigT, bowl: bowlAt, appear: t => P(.4, 1.1, t), mode: 'slicer', fall: .5, lift: .05, seed: 6 });
    cutter(Wd, { xb: bladeX, y: CT + .3 + .015 + .032, z: S0[2], r: .032, n: 14, th: .0143, col: 0xff8a1f, core: 0xffb060, times: cubT, bowl: bowlAt, rank0: 5, appear: t => P(5.3, 6.0, t), mode: 'slicer', kind: 'box', chipSz: .028, chipCol: 0xff8a1f, fall: .4, lift: .03, seed: 9 });
    const lamp = bb(Wd, .55, .55, drawLamp, 256), lg = lampGlow(Wd), tag = bb(Wd, .95, .4, drawChange, 512), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), ck2 = mark3d(Wd, 'check', 1.0), sk2 = shock(Wd, 0x6dff9a), gl = glowAt(Wd.scene, 2.4, 0x9dffb0, 0);
    const arcP = [0, .2, .4, .6, .8, 1].map(u => addV(arcPt(S0, S1, u, .3), [0, .45, .2])), dp = dotPath(Wd, arcP, { color: 0xffd166, r: .06, step: .3 });
    Wd.occ = [sl, bw, lamp.g, tag.g, ck.g, ck2.g];
    Wd.on(t => { const p = spos(t); sl.position.set(p[0], p[1], p[2]); bw.position.set(...bowlAt(t));
      const la = popE(P(8.5, 9.3, t)) * (1 - sm(P(11.4, 12.0, t))); lamp.set([p[0] + .1, p[1] + 1.0 + .05 * Math.sin(t * 3), p[2] - .05], la, .06 * Math.sin(t * 5)); lg.position.set(p[0] + .1, p[1] + 1.0, p[2] - .1); lg.material.opacity = .55 * la;
      const tg = popE(P(9.2, 10.0, t)) * (1 - sm(P(11.4, 12.0, t))); const mid = arcPt(S0, S1, .5, .3); tag.set([mid[0], mid[1] + .95, mid[2] - .1], tg, .03 * Math.sin(t * 3));
      dp.set(t < 11.4 ? P(9.0, 10.4, t) : 1 - P(11.4, 12.2, t), t);
      const o1 = popE(P(4.7, 5.5, t)) * (1 - sm(P(5.8, 6.3, t))); ck.set([S0[0] + .35, 1.3 + .05 * Math.sin(t * 3), S0[2] - .1], o1 * .8, .05 * Math.sin(t * 3)); sk.set([S0[0] + .35, 1.3, S0[2] - .1], P(4.7, 5.5, t), 1.5);
      const o2 = popE(P(12.0, 12.9, t)); ck2.set([S1[0] + .35, 1.3 + .05 * Math.sin(t * 3), S1[2] - .1], o2 * .9, .05 * Math.sin(t * 3)); sk2.set([S1[0] + .35, 1.3, S1[2] - .1], P(12.0, 12.9, t), 1.6);
      gl.position.set(S1[0] + .35, TT + .25, S1[2]); gl.material.opacity = .55 * sm(P(12.0, 13.0, t)); });
    moishy(Wd, t => { const w = strollX(t, 9.0, 11.6, -3.95, 1.05, -1.75, TZ, .85, .85); return Object.assign(w, { gesture: t > 12.4 ? 'thumb' : (t > 4.7 && t < 6.4 ? 'thumb' : null), perform: (t > 12.4 || (t > 4.7 && t < 6.4) || (t > 9.0 && t < 11.6)) ? 0 : .45, smile: .6, look: .2 * Math.sin(t * .8) }); });
    dudi(Wd, t => { const w = strollX(t, 8.5, 11.1, -.45, 4.95, -1.75, TZ, -.85, -.85); return Object.assign(w, { gesture: t > 12.4 ? 'cheer' : null, perform: (t > 12.4 || (t > 8.5 && t < 11.1)) ? 0 : .45, smile: .6 }); });
    Wd.center = [0, BZ];
    Wd.cam = seq([0, cine([C(0, [-2.2, .95, -1.9], 6.0, 1.7, -24, 44), C(2.4, [-2.2, .95, -1.8], 4.6, 1.4, -8, 41), C(4.7, [-2.2, .95, -1.8], 4.2, 1.3, 14, 41)])],
      [4.7, cine([C(4.7, [-2.2, .95, -1.8], 4.0, 1.2, 22, 40), C(8.6, [-2.2, .95, -1.8], 4.0, 1.2, -14, 40)])],
      [8.6, cine([C(8.6, [-2.2, 1.0, -1.9], 5.0, 1.5, -20, 43), C(10.0, [-.1, 1.05, -1.9], 6.4, 1.8, 0, 45), C(11.6, [3.0, 1.0, -1.9], 5.4, 1.6, 16, 43)])],
      [11.6, cine([C(11.6, [3.0, .98, -1.9], 4.6, 1.3, 20, 41), C(dur, [3.0, 1.05, -1.95], 5.6, 1.5, -14, 43)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 72-86: on the festive table: garlic crusher squeezes garlic, masher mashes potatoes; tags "on the table" + checks
  function s6(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const CX = 2.45, CZ = -1.72, MX = 3.7, MZ = -1.72;
    const cr = mkCrusher(Wd), dish = mkPlate(Wd, .14), cloves = [0, 1, 2].map(() => mkClove(Wd));
    const sqz = [1.6, 3.2, 4.8], close = t => sqz.reduce((m, ts) => Math.max(m, sm(clamp(1 - Math.abs(t - ts - .3) / .32, 0, 1))), 0);
    const chamber = [CX + .1, TT + .5, CZ];
    dish.position.set(chamber[0], TT, chamber[2]);
    const R = rng(13), strands = []; sqz.forEach((ts, k) => { for (let j = 0; j < 7; j++) { const ox = (R() - .5) * .12, oz = (R() - .5) * .1, r1 = [R(), R() * 3, R()]; strands.push({ kind: 'box', col: 0xfff2d0, sz: [.012, .06, .012], t0: ts + .32 + .05 * j, d: .4, from: [chamber[0] + (j - 3) * .012, chamber[1] - .04, chamber[2]], to: () => [chamber[0] + ox, TT + .04 + .01 * ((k * 7 + j) % 4), chamber[2] + oz], lift: 0, rot0: [0, 0, 0], rot1: r1 }); } });
    chips(Wd, strands);
    const pot = openCyl(Wd, .26, .22, .2, 0xa8b0ba); pot.position.set(MX, TT, MZ);
    const pots = [[-.09, .04], [.08, .06], [.0, -.08], [.1, -.06]].map(([dx, dz], i) => { const m = ball(.085, [0xe8c872, 0xe0bc66, 0xeccb7a, 0xe8c872][i], { inkW: .005 }); Wd.add(m); return [m, dx, dz]; });
    const mh = mkMasher(Wd), hits = [0, 1, 2, 3, 4, 5, 6].map(i => 7.2 + .72 * i), kk = t => hits.reduce((a, th) => a + sm(P(th - .05, th + .1, t)), 0) / hits.length, hump = t => hits.reduce((m, th) => Math.max(m, sm(clamp(1 - Math.abs(t - th) / .22, 0, 1))), 0);
    const tg1 = bb(Wd, 1.1, .42, drawOnTable, 512), tg2 = bb(Wd, 1.1, .42, drawOnTable, 512), c1 = mark3d(Wd, 'check', 1.0), c2 = mark3d(Wd, 'check', 1.0), s1 = shock(Wd, 0x6dff9a), s2k = shock(Wd, 0x6dff9a), g1 = glowAt(Wd.scene, 2.0, 0x9dffb0, 0), g2 = glowAt(Wd.scene, 2.0, 0x9dffb0, 0);
    Wd.occ = [cr.g, mh, tg1.g, tg2.g, c1.g, c2.g];
    Wd.on(t => { const ap = popE(P(.3, 1.1, t));
      cr.g.visible = ap > .01; cr.g.scale.setScalar(Math.max(.01, ap)); cr.g.position.set(CX - .02, TT + .46 + .02 * Math.sin(t * 1.5), CZ); cr.g.rotation.z = -.05; cr.arm.rotation.z = lerp(.5, 0, close(t));
      cloves.forEach((m, i) => { const ts = sqz[i], v = t > ts - .9 && t < ts + .6; m.visible = v && ap > .5; const press = sm(P(ts, ts + .3, t)); m.position.set(chamber[0], chamber[1] - .01 - .01 * press, chamber[2]); m.scale.set(1 - .3 * press, (1 - .85 * press) * 1.25, .8 - .2 * press); });
      const k = kk(t); pots.forEach(([m, dx, dz], i) => { m.position.set(MX + dx * (1 + k * .8), TT + .03 + lerp(.11, .035, k) + (i % 2) * .01, MZ + dz * (1 + k * .8)); m.scale.set(lerp(1, 1.5, k), lerp(1, .42, k), lerp(1, 1.5, k)); });
      const ma = popE(P(6.2, 7.0, t)), idx = Math.min(hits.length - 1, Math.max(0, Math.round((t - 7.2) / .72)));
      mh.visible = ma > .01; mh.scale.setScalar(Math.max(.01, ma)); mh.position.set(MX + .03 * Math.sin(idx * 2), lerp(TT + .52, TT + .17, hump(t)), MZ); mh.rotation.z = .08;
      const a1 = popE(P(1.0, 1.8, t)) * (1 - sm(P(5.8, 6.3, t))), a2 = popE(P(6.6, 7.4, t)) * (1 - sm(P(11.7, 12.2, t)));
      tg1.set([CX, TT + .85 + .03 * Math.sin(t * 2), CZ], a1, .03 * Math.sin(t * 3)); tg2.set([MX, TT + .85 + .03 * Math.sin(t * 2 + 1), MZ], a2, .03 * Math.sin(t * 3 + 1));
      const o1 = popE(P(6.0, 6.9, t)) * (1 - sm(P(7.4, 8.0, t))), o2 = popE(P(12.0, 12.9, t)); c1.set([CX, 1.3 + .05 * Math.sin(t * 3), CZ], o1 * .9, .05 * Math.sin(t * 3)); c2.set([MX, 1.3 + .05 * Math.sin(t * 3 + 1), MZ], o2 * .95, .05 * Math.sin(t * 3 + 1));
      s1.set([CX, 1.3, CZ], P(6.0, 6.9, t), 1.5); s2k.set([MX, 1.3, MZ], P(12.0, 12.9, t), 1.5);
      g1.position.set(CX, TT + .3, CZ); g1.material.opacity = .45 * sm(P(6.0, 6.9, t)) * (1 - sm(P(7.4, 8.2, t))); g2.position.set(MX, TT + .3, MZ); g2.material.opacity = .5 * sm(P(12.0, 13.0, t)); });
    moishy(Wd, t => ({ pos: [4.95, 0, TZ], facing: -.85, gesture: t > 12.3 ? 'thumb' : null, perform: t > 12.3 ? 0 : .45, smile: .6, look: -.3 * Math.sin(t * .8) }));
    dudi(Wd, t => ({ pos: [1.05, 0, TZ], facing: .85, gesture: t > 6.2 && t < 6.9 ? 'cheer' : null, perform: t > 6.2 && t < 6.9 ? 0 : .45, smile: .6, look: .3 * Math.sin(t * .7) }));
    Wd.center = [3.0, BZ];
    Wd.cam = seq([0, cine([C(0, [3.0, 1.0, -2.0], 6.4, 1.7, -22, 44), C(2.6, [3.0, 1.0, -1.8], 4.8, 1.3, 6, 41)])],
      [2.6, cine([C(2.6, [3.0, 1.05, -1.8], 4.4, 1.1, 18, 40), C(6.5, [3.0, 1.05, -1.8], 4.4, 1.1, -14, 40)])],
      [6.5, cine([C(6.5, [3.0, 1.0, -1.8], 4.8, 1.3, 16, 42), C(12.0, [3.0, 1.0, -1.8], 4.4, 1.1, -12, 40)])],
      [12.0, cine([C(12.0, [3.0, 1.1, -2.0], 4.8, 1.1, -16, 42), C(dur, [3.0, 1.2, -2.0], 6.8, 1.7, 14, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 86-100: recap on the table: the tools line up with checks and tags, the bowls glow, the boys smile
  function s7(dur) {
    const Wd = kW(); kitchenRoom(Wd);
    const ITEMS = [{ k: 'knife', x: 2.1, tag: false }, { k: 'fork', x: 2.55, tag: false }, { k: 'grater', x: 3.0, tag: true }, { k: 'slicer', x: 3.45, tag: true }, { k: 'crusher', x: 3.9, tag: true }, { k: 'masher', x: 4.35, tag: true }];
    const RZ = -1.45, T0 = .6, DT = .85;
    const mk = { knife: mkKnife, fork: mkFork, grater: mkGrater, slicer: mkSlicer, crusher: Wd2 => mkCrusher(Wd2).g, masher: mkMasher };
    const sc = { knife: .7, fork: .7, grater: .7, slicer: .36, crusher: .5, masher: .5 }, rotY = { knife: 0, fork: 0, grater: 0, slicer: 0, crusher: 0, masher: 0 }, yAdd = { knife: .03, fork: .01, grater: 0, slicer: 0, crusher: .03, masher: 0 };
    const objs = ITEMS.map(it => mk[it.k](Wd)), marks = ITEMS.map(() => mark3d(Wd, 'check', 1.0)), tags = ITEMS.map(it => it.tag ? bb(Wd, .72, .3, drawChange, 384) : null);
    const dish = ITEMS.map(() => null);
    const bowls = [2.45, 3.55].map((x, i) => { const b = mkBowl(Wd); b.position.set(x, TT, TZ - .52); fillBowl(Wd, [x, TT, TZ - .52], [CUC, TOM], 10, i * 3); const gl = glowAt(Wd.scene, 1.8, 0xffe08a, 0); gl.position.set(x, TT + .25, TZ - .5); return { b, gl }; });
    Wd.occ = objs.concat(marks.map(m => m.g), tags.filter(Boolean).map(t => t.g));
    Wd.on(t => { ITEMS.forEach((it, i) => { const ts = T0 + DT * i, u = P(ts, ts + .9, t), from = [it.x + (i < 2 ? -1.2 : 1.2) * (1 - 0), TT + 1.2, RZ - .6], to = [it.x, TT + (yAdd[it.k] || 0), RZ];
        const o = objs[i], p = u <= 0 ? from : arcPt(from, to, sm(u), .0); o.visible = u > .01; o.position.set(p[0], p[1], p[2]); o.scale.setScalar(sc[it.k] * Math.max(.01, popE(P(ts, ts + .5, t)))); o.rotation.y = (1 - sm(u)) * 1.2;
        const ck = popE(P(ts + .9, ts + 1.5, t)); marks[i].set([it.x, TT + .58 + .03 * Math.sin(t * 3 + i), RZ], ck * .3, .05 * Math.sin(t * 3 + i));
        if (tags[i]) tags[i].set([it.x, TT + .9 + .03 * Math.sin(t * 2 + i), RZ], popE(P(ts + 1.2, ts + 1.8, t)) * .6, 0); });
      bowls.forEach(({ gl }, i) => { gl.material.opacity = (.35 + .15 * Math.sin(t * 2.5 + i)) * sm(P(6.4, 7.6, t)); }); });
    moishy(Wd, t => ({ pos: [5.25, 0, TZ], facing: -.85, gesture: t > 8 ? (Math.sin(t * .9) > .2 ? 'thumb' : 'cheer') : null, perform: t > 8 ? 0 : .5, smile: .6 + .4 * sm(P(5, 7, t)), talk: .3 * talkAmt(t, 3) * sm(P(7, 8, t)), look: -.3 * Math.sin(t * .8) }));
    dudi(Wd, t => ({ pos: [.85, 0, TZ], facing: .85, gesture: t > 8.5 ? 'cheer' : null, perform: t > 8.5 ? 0 : .5, smile: .6 + .4 * sm(P(5, 7, t)), talk: .3 * talkAmt(t, 5) * sm(P(7, 8, t)), look: .3 * Math.sin(t * .7) }));
    Wd.center = [3.0, BZ];
    Wd.cam = seq([0, cine([C(0, [3.0, .95, -2.0], 6.2, 1.9, -20, 44), C(4.4, [3.0, .9, -1.8], 5.0, 1.6, 8, 42)])],
      [4.4, cine([C(4.4, [3.05, .95, -1.8], 4.6, 1.3, 22, 40), C(8.2, [3.05, .95, -1.8], 4.5, 1.3, -10, 40)])],
      [8.2, cine([C(8.2, [3.0, 1.05, -2.0], 4.8, 1.2, -20, 42), C(11.0, [3.0, 1.1, -2.0], 5.2, 1.4, 12, 43)])],
      [11.0, cine([C(11.0, [3.0, 1.1, -2.1], 5.4, 1.5, 12, 43), C(dur, [3.0, 1.15, -2.1], 6.6, 1.8, -14, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the Yom Tov table with the glowing salad, the two brothers smiling behind the card
  function answerBg(dur) {
    const Wd = kW(); kitchenRoom(Wd, true);
    [2.4, 3.6].forEach((x, i) => { const b = mkBowl(Wd); b.position.set(x, TT, TZ - .1); fillBowl(Wd, [x, TT, TZ - .1], [CUC, TOM], 12, i * 4); const gl = glowAt(Wd.scene, 1.8, 0xffe08a, .4); gl.position.set(x, TT + .25, TZ); });
    moishy(Wd, t => ({ pos: [3.55, 0, -2.55], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }));
    dudi(Wd, t => ({ pos: [2.45, 0, -2.55], facing: 0, scale: DS, smile: 1, perform: .5, talk: .4 * talkAmt(t, 3) }));
    Wd.center = [3.0, -2.2]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
