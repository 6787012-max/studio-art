// yomit-02 story: "extinguishing fire on Yom Tov" (halacha yomit, R' Fried) - 3D choreography per storyboards_v3.md (C).
// Boys only; nobody holds a match or an open flame and nobody touches a stove knob: everything moves "by itself" (magic floating objects).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, plainRoom, nightWindow, candle, mark3d, shock, popE, lighting, glowAt, glowSprite, lerpV, arcPt, shakeCam,
    archShape, booksTex, canvasTex, toon, texPlane, bill, bm, board, drawWord, flameArc, flamePath, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.09 * d : ly];
  const NIGHT = new THREE.Color(0x1a2550), DAYC = new THREE.Color(0x9ad4ff), WARMN = new THREE.Color(0xf6dcb0), DAYL = new THREE.Color(0xfff4e0);
  const mixC = (a, b, k) => new THREE.Color().copy(a).lerp(b, clamp(k, 0, 1));
  const BA = -4.2, BB = -1.2, DR = [-4.2, -1.7], DRY = .75, FL = [DR[0], DRY + .29 + .26 + .06, DR[1]];   // beds x, dresser xz, candle base y, flame centre
  const HIPZ = -3.72;

  // ---------------------------------------------------------------- generic helpers
  function bb(Wd, w, h, draw, cw) {   // billboard picture with opacity: set(pos, s, rz, a)
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  function skyWin(Wd, x, y0, z, w, h) {   // arched window: night -> day (set(k))
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const mat = new THREE.MeshBasicMaterial({ color: 0x1a2550, fog: false }), pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), mat); pn.position.z = .02; g.add(pn);
    const sun = glowSprite(1.3, 1.3, 0); sun.material.color.set(0xffe08a); sun.position.set(0, h * .3, .04); g.add(sun);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .06], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .06], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
    return { set(k) { mat.color.copy(NIGHT).lerp(DAYC, k); sun.material.opacity = k * .95; sun.position.y = lerp(h * .25, h * .5, k); } };
  }
  const flash = (g, W, H, t0, t) => { if (t >= t0 - .04 && t < t0 + .32) { g.fillStyle = '#ffffff'; g.globalAlpha = .5 * (1 - clamp((t - t0) / .36, 0, 1)); g.fillRect(0, 0, W, H); g.globalAlpha = 1; } };

  // ---------------------------------------------------------------- icons (canvas)
  const drawWind = (c, W, H) => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    const line = (y, len, curl) => { const p = () => { c.beginPath(); c.moveTo(W * .1, y); c.bezierCurveTo(W * .35, y - H * .1, W * .55, y + H * .1, W * (.2 + len), y); if (curl) c.arc(W * (.2 + len), y - H * .075, H * .075, PI / 2, -PI * .9, true); };
      p(); c.strokeStyle = '#1c2745'; c.lineWidth = H * .13; c.stroke(); p(); c.strokeStyle = '#e8f6ff'; c.lineWidth = H * .075; c.stroke(); };
    line(H * .32, .6, true); line(H * .52, .7, false); line(H * .72, .5, true);
  };
  const drawZ = (c, W, H) => { c.font = `italic 800 ${H * .95}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = '#1c2745'; c.lineWidth = H * .12; c.strokeText('Z', W / 2, H * .54); c.fillStyle = '#ffffff'; c.fillText('Z', W / 2, H * .54); };
  const drawLowerSign = (c, W, H) => {   // big flame + red down-arrow
    c.fillStyle = '#fff8e6'; c.beginPath(); c.roundRect(W * .03, H * .03, W * .94, H * .94, W * .1); c.fill(); c.lineWidth = W * .03; c.strokeStyle = '#1c2745'; c.stroke();
    flamePath(c, W * .38, H * .5, H * .62); c.fillStyle = '#ff8a1f'; c.fill(); c.strokeStyle = '#7a1c0c'; c.lineWidth = W * .02; c.stroke(); flamePath(c, W * .38, H * .6, H * .3); c.fillStyle = '#ffe27a'; c.fill();
    c.fillStyle = '#1c2745'; c.beginPath(); c.moveTo(W * .72, H * .2); c.lineTo(W * .86, H * .2); c.lineTo(W * .86, H * .52); c.lineTo(W * .95, H * .52); c.lineTo(W * .79, H * .8); c.lineTo(W * .63, H * .52); c.lineTo(W * .72, H * .52); c.closePath(); c.fill();
  };
  const drawDial = (c, W, H) => {
    c.fillStyle = '#dfe5ea'; c.fillRect(0, 0, W, H); c.strokeStyle = '#6a7480'; c.lineWidth = W * .02; c.lineCap = 'round';
    for (let i = -4; i <= 4; i++) { const a = i * .15 + .0, r0 = W * .3, r1 = W * (i % 2 ? .35 : .38); c.beginPath(); c.moveTo(W / 2 - Math.sin(a) * r0 * -1 * -1, H / 2 - Math.cos(a) * r0); c.lineTo(W / 2 - Math.sin(a) * r1 * -1 * -1, H / 2 - Math.cos(a) * r1); c.stroke(); }
    flamePath(c, W * .22, H * .2, W * .3); c.fillStyle = '#ff8a1f'; c.fill(); c.lineWidth = W * .015; c.strokeStyle = '#7a1c0c'; c.stroke();
    flamePath(c, W * .8, H * .22, W * .13); c.fillStyle = '#9aa7b4'; c.fill(); c.strokeStyle = '#4a5560'; c.stroke();
  };
  const drawPotFace = sur => (c, W, H) => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const sx of [-1, 1]) { const ex = W / 2 + sx * W * .2, ey = H * .5; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, ey, W * .12, H * (sur ? .3 : .22), 0, 0, PI * 2); c.fill(); c.lineWidth = H * .05; c.strokeStyle = '#1c2745'; c.stroke();
      c.fillStyle = '#1c2745'; c.beginPath(); c.arc(ex + (sur ? 0 : sx * -W * .045 + W * .05), ey + (sur ? 0 : H * .03), W * (sur ? .05 : .065), 0, PI * 2); c.fill();
      c.lineWidth = H * .08; c.beginPath(); if (sur) { c.moveTo(ex - W * .1, ey - H * .4); c.lineTo(ex + W * .1, ey - H * .4); } else { c.moveTo(ex - sx * W * .12, ey - H * .36); c.lineTo(ex + sx * W * .1, ey - H * .22); } c.stroke(); }
    c.lineWidth = H * .07; c.beginPath(); if (sur) c.ellipse(W / 2, H * .84, W * .06, H * .1, 0, 0, PI * 2); else { c.moveTo(W * .38, H * .8); c.quadraticCurveTo(W * .5, H * .96, W * .66, H * .78); } c.stroke();
  };
  const drawBoard = kind => (c, W, H) => {
    const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#fff8e6'); gr.addColorStop(1, '#ffe9b8'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#1c2745'; c.lineWidth = W * .02; c.strokeRect(W * .03, H * .03, W * .94, H * .94); c.lineCap = 'round'; c.lineJoin = 'round';
    const flame = (x, y, s) => { flamePath(c, x, y, s); c.fillStyle = '#ff8a1f'; c.fill(); c.lineWidth = W * .012; c.strokeStyle = '#7a1c0c'; c.stroke(); flamePath(c, x, y + s * .12, s * .45); c.fillStyle = '#ffe27a'; c.fill(); };
    if (kind === 'puff') {
      c.fillStyle = '#fff4d8'; c.fillRect(W * .62, H * .42, W * .14, H * .45); c.strokeStyle = '#1c2745'; c.lineWidth = W * .015; c.strokeRect(W * .62, H * .42, W * .14, H * .45); flame(W * .69, H * .3, H * .3);
      const line = (y, len) => { const p = () => { c.beginPath(); c.moveTo(W * .08, y); c.bezierCurveTo(W * .2, y - H * .07, W * .3, y + H * .07, W * len, y); }; p(); c.strokeStyle = '#1c2745'; c.lineWidth = H * .085; c.stroke(); p(); c.strokeStyle = '#8fd0ff'; c.lineWidth = H * .045; c.stroke(); };
      line(H * .3, .5); line(H * .5, .55); line(H * .7, .5);
    } else if (kind === 'match') {
      c.save(); c.translate(W * .5, H * .62); c.rotate(-.5); c.fillStyle = '#e6c88a'; c.fillRect(-W * .025, -H * .38, W * .05, H * .6); c.strokeStyle = '#1c2745'; c.lineWidth = W * .012; c.strokeRect(-W * .025, -H * .38, W * .05, H * .6);
      c.fillStyle = '#c4161c'; c.beginPath(); c.arc(0, -H * .4, W * .05, 0, PI * 2); c.fill(); c.stroke(); flame(0, -H * .62, H * .32); c.restore();
      c.strokeStyle = '#1c2745'; c.lineWidth = H * .045; for (const sx of [-1, 1]) for (const dy of [.3, .5]) { c.beginPath(); c.moveTo(W * (.5 + sx * .3), H * dy); c.lineTo(W * (.5 + sx * .36), H * (dy + .05)); c.lineTo(W * (.5 + sx * .3), H * (dy + .1)); c.stroke(); }
    } else {
      c.fillStyle = '#c3cad2'; c.beginPath(); c.roundRect(W * .26, H * .38, W * .48, H * .34, W * .04); c.fill(); c.lineWidth = W * .015; c.strokeStyle = '#1c2745'; c.stroke(); c.fillStyle = '#4fb0ff'; c.fillRect(W * .28, H * .36, W * .44, H * .05);
      c.fillStyle = '#ffffff'; for (const [x, y, r] of [[.38, .3, .06], [.5, .26, .075], [.62, .3, .06]]) { c.beginPath(); c.arc(W * x, H * y, W * r, 0, PI * 2); c.fill(); c.stroke(); }
      c.fillStyle = '#4aa3ff'; for (let i = 0; i < 7; i++) { flamePath(c, W * (.3 + i * .066), H * .84, H * .12); c.fill(); }
      c.fillStyle = '#4fb0ff'; for (const x of [.22, .78]) { c.beginPath(); c.ellipse(W * x, H * .55, W * .022, H * .045, 0, 0, PI * 2); c.fill(); c.stroke(); }
    }
  };

  // ---------------------------------------------------------------- bedroom
  function bed(Wd, x) {
    Wd.add(box(1.2, .46, 2.2, 0x8a5a34, { pos: [x, .23, -3.45] })); Wd.add(box(1.14, .14, 2.1, 0xf6f1e6, { pos: [x, .53, -3.45], ink: false }));
    Wd.add(box(1.3, .95, .08, 0x6a4326, { pos: [x, .88, -4.57] })); Wd.add(box(.62, .12, .36, 0xffffff, { pos: [x, .66, -4.22] }));
  }
  function bedroom(Wd) {
    const R = plainRoom(Wd, { HX: 5, HZ: 4.6, H: 3.4, beams: false }), sw = skyWin(Wd, 2.0, 1.0, -R.HZ + .02, 1.5, 2.0);
    Wd.add(box(2.2, 2.6, .4, 0x7a4a2a, { pos: [.2, 1.3, -R.HZ + .25] })); const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.4), toon(0xffffff, { map: booksTex(5) })); sh.position.set(.2, 1.3, -R.HZ + .46); Wd.add(sh);
    Wd.add(box(1.5, 2.6, .6, 0xa8764a, { pos: [3.9, 1.3, -4.3] })); for (const dx of [-.38, .38]) Wd.add(box(.04, 2.3, .03, 0x6a4326, { pos: [3.9 + dx * 0 + (dx < 0 ? -.02 : .02), 1.3, -3.99], ink: false }));
    Wd.add(cyl(1.9, 1.9, .02, 0xb04a3a, { pos: [-2.7, .011, -2.5], scale: [1, 1, .62], ink: false })); Wd.add(cyl(1.5, 1.5, .022, 0xe8c36a, { pos: [-2.7, .012, -2.5], scale: [1, 1, .62], ink: false }));
    bed(Wd, BA); bed(Wd, BB);
    Wd.add(box(1.4, .7, .5, 0x8a5a34, { pos: [DR[0], .35, DR[1]] })); Wd.add(box(1.5, .05, .56, 0x6a4326, { pos: [DR[0], .725, DR[1]] }));
    for (const dy of [.18, .4, .6]) { Wd.add(box(1.3, .02, .02, 0x4a2c16, { pos: [DR[0], dy, DR[1] + .26], ink: false })); Wd.add(ball(.03, 0xd9a63a, { pos: [DR[0], dy - .08 + .0, DR[1] + .27], ink: false })); }
    return { R, sw };
  }
  const bedLight = (Wd, kF) => lighting(Wd, t => { const k = kF(t); return { hemi: lerp(.85, 1.05, k), sun: lerp(.4, .8, k), hemiColor: mixC(WARMN, DAYL, k), sunColor: mixC(new THREE.Color(0xffe2b8), DAYL, k) }; });
  const bedCandle = (Wd, flame, len) => candle(Wd, { pos: [DR[0], DRY, DR[1]], h: .26, light: { color: 0xffb35a, i: .3, dist: 5 }, glowSize: .9, flame, len });
  function beam(Wd, kF) {   // light rays from the candle flame into Bentzi's face
    const from = FL, to = [BA, 1.28, HIPZ + .25], sp = [];
    for (let i = 0; i < 8; i++) { const s = glowSprite(.7, .7, 0); s.material.color.set(0xffe6a0); Wd.add(s); sp.push(s); }
    const fg = glowSprite(1.1, 1.1, 0); fg.material.color.set(0xfff0b8); Wd.add(fg);
    Wd.on(t => { const k = kF(t); sp.forEach((s, i) => { const u = (i + .5) / sp.length, p = lerpV(from, to, u); s.position.set(p[0], p[1], p[2]); s.scale.set(.5 + u * 1.1, .5 + u * 1.1, 1); s.material.opacity = .05 * k * (.85 + .15 * Math.sin(t * 6 + i)); });
      fg.position.set(to[0], to[1], to[2] + .15); fg.material.opacity = .05 * k * (.9 + .1 * Math.sin(t * 7)); });
  }
  // a boy in bed: k = 0 lying on the back (0..1 sits up), roll = turn to the side (toward the left wall), eyes = eyelid closure (undefined = natural blinking)
  function bedBoy(Wd, id, x, sc, fn) {
    const Pn = boyP(Wd, id, t => { const s = fn(t); return { pos: [x, 0, HIPZ + (s.zs || 0)], facing: 0, sit: s.k > .5, groundY: .6, shadow: false, scale: sc, gesture: s.gesture || null, perform: 0, smile: s.smile === undefined ? .3 : s.smile, brow: s.brow || 0, look: s.look || 0, talk: s.talk || 0, hidden: s.hidden }; });
    Wd.on(t => { const g = Pn.group; if (!g.visible || !Pn.figure) return; const s = fn(t), k = s.k, r = (s.roll || 0) * (1 - k), a = -PI / 2 * (1 - k), h = sc * lerp(.71, .3, k);
      const hipY = lerp(.6 + sc * .95 * (.12 * Math.cos(r) + .25 * Math.sin(r)), .6, k);
      g.rotation.set(a, 0, r, 'ZXY'); g.position.set(x, hipY - h * Math.cos(a), HIPZ + (s.zs || 0) - h * Math.sin(a));
      if (s.eyes !== undefined) { const tk = clamp(s.talk || 0, 0, 1); Pn.figure.face({ blink: s.eyes, mouth: Math.round(tk * 8) / 8, smile: s.smile === undefined ? .3 : s.smile, brow: Math.round((((s.brow || 0)) + tk * .25) * 8) / 8, look: Math.round(clamp(s.look || 0, -1, 1) * 6) / 10 }); } });
    return Pn;
  }
  function blanket(Wd, x, col, sc, fn) {   // the blanket follows the boy: fn -> {k, roll, cover}
    const G = new THREE.Group(); Wd.add(G); const main = box(1.16, 1, 1, col, { ink: false }); G.add(main);
    const fl = [-1, 1].map(sx => { const f = box(.05, .4, 1, col, { pos: [sx * .6, 0, 0], ink: false }); G.add(f); return f; });
    const fold = box(1.18, 1, .12, 0xffffff, { ink: false }); Wd.add(fold); const ff = box(1.16, .4, .05, col, { ink: false }); Wd.add(ff);
    Wd.on(t => { const s = fn(t), k = s.k, rr = (s.roll || 0) / (PI / 2) * (1 - k), zb = lerp(lerp(-3.45, -3.76 + (sc < 1 ? .1 : 0), s.cover), -3.42, k), L = -2.4 - zb, zc = (-2.4 + zb) / 2;
      const yc = lerp(.86 + rr * .27, .8, k) + (sc < 1 ? -.05 : 0), th = lerp(.18 - rr * .06, .16, k);
      G.position.set(x, 0, zc); G.scale.set(1, 1, L); main.position.y = yc; main.scale.y = th; fl.forEach(f => { f.position.y = yc - th / 2 - .15; });
      fold.position.set(x, yc + .005, zb + .06); fold.scale.y = th + .02; ff.position.set(x, yc - th / 2 - .15, -2.38); });
  }
  // sleeping "Z" letters
  function zzz(Wd, base, kF) {
    const zs = [0, 1, 2].map(i => bb(Wd, .5, .5, drawZ, 256));
    Wd.on(t => { const k = kF(t); zs.forEach((z, i) => { const u = ((t * .32 + i / 3) % 1), s = (.5 + u * .8) * k * (u < .1 ? u / .1 : 1) * (u > .85 ? (1 - u) / .15 : 1); z.set([base[0] + u * .5 + .06 * Math.sin(t * 2 + i), base[1] + u * 1.2, base[2] + u * .2], s, .25 * Math.sin(t * 1.5 + i), 1); }); });
  }

  // ---------------------------------------------------------------- 1. HOOK: bedroom, a bright candle shines straight into Bentzi's eyes
  function hook(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }), { sw } = bedroom(Wd); sw.set(0); bedLight(Wd, () => 0);
    bedCandle(Wd, () => 1);
    const kb = t => ({ k: 1, roll: 0, cover: 0 }), kb2 = t => ({ k: 0, roll: 0, cover: .5 });
    blanket(Wd, BA, 0x3b6fd0, 1, kb); blanket(Wd, BB, 0xe08a3a, .78, kb2);
    beam(Wd, t => sm(P(.8, 2.4, t)));
    const cov = t => t > 1.8 && Math.sin(t * 1.15 + .4) > .1;
    bedBoy(Wd, 2, BA, 1, t => { const c = cov(t); return { k: 1, gesture: c ? 'think' : null, eyes: c ? .85 : .62, brow: .9, smile: 0, look: c ? 0 : .5 * Math.sin(t * 1.7), talk: 0 }; });
    bedBoy(Wd, 3, BB, .78, t => ({ k: 0, eyes: 1, smile: .35, brow: 0 }));
    Wd.center = [BA + 1.5, -2.2]; Wd.qPos = [-3.6, -2.6]; Wd.qSize = 1.5;
    Wd.cam = seq([0, cine([C(0, [-2.9, 1.0, -2.8], 8.2, 1.7, 28, 44), C(5, [-3.2, 1.1, -2.9], 6.2, 1.3, -12, 44)])],
      [5, cine([C(5, [BA, 1.15, -3.2], 3.6, 1.0, 52, 40), C(9, [BA, 1.15, -3.3], 3.1, .9, 24, 38)])],
      [9, cine([C(9, [DR[0], 1.3, DR[1] + .1], 2.7, .2, 34, 40), C(11.6, [DR[0], 1.3, DR[1]], 2.2, .1, 6, 38)])],
      [11.6, cine([C(11.6, [-3.4, 1.1, -2.6], 4.6, 1.0, 14, 42), C(14, [-2.8, 1.1, -2.6], 7.6, 1.8, -18, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: a puff of air floats toward the flame - FREEZE - red X slams - the puff disappears
  const TF = 5.6, TR = 9.4;
  function s2(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }), { sw } = bedroom(Wd); sw.set(0); bedLight(Wd, () => 0);
    const S0 = [-1.0, 1.95, -.2], E0 = [DR[0] + .55, FL[1] + .12, DR[1] + .25], U = tt => sm(P(1.2, TF, tt));
    const tt = t => t < TF ? t : t < TR ? TF : Math.max(0, TF - (t - TR) * ((TF - 1.2) / 3.0));
    bedCandle(Wd, t => 1 - .6 * Math.pow(U(tt(t)), 1.4));
    blanket(Wd, BA, 0x3b6fd0, 1, () => ({ k: 1, roll: 0, cover: 0 })); blanket(Wd, BB, 0xe08a3a, .78, () => ({ k: 0, roll: 0, cover: .5 }));
    beam(Wd, () => 1);
    const wind = bb(Wd, 1.1, 1.1, drawWind, 384), trail = []; for (let i = 0; i < 7; i++) { const s = glowSprite(.4, .4, 0); s.material.color.set(0xd8f0ff); Wd.add(s); trail.push(s); }
    const x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff7a7a);
    Wd.on(t => { const q = tt(t), u = U(q), a = sm(P(.5, 1.4, t)) * (1 - sm(P(TR + 1.4, TR + 2.8, t))), p = arcPt(S0, E0, u, .35), wob = [0, .06 * Math.sin(t * 5), 0];
      wind.set([p[0] + wob[0], p[1] + wob[1], p[2]], .5 + .08 * Math.sin(t * 4) + .2 * (1 - u), .12 * Math.sin(t * 3), a);
      trail.forEach((s, i) => { const uu = Math.max(0, u - (i + 1) * .045), pp = arcPt(S0, E0, uu, .35); s.position.set(pp[0], pp[1] + .05 * Math.sin(t * 6 + i), pp[2]); s.material.opacity = .5 * a * (1 - i / 8) * (u > .03 ? 1 : 0); s.scale.setScalar(.25 + .12 * Math.sin(t * 7 + i)); });
      const sl = P(TF + .1, TF + .4, t), back = P(TR - .8, TR, t);
      x.set([E0[0] + .12, E0[1] + .42, E0[2] + .3], (t > TF + .1 ? lerp(1.2, .38, ease.out(sl)) : 0) * (1 - sm(back)), .04 * Math.sin(t * 9) * (t > TF && t < TR ? 1 : 0)); sk.set([E0[0] + .12, E0[1] + .42, E0[2] + .35], P(TF + .1, TF + 1.0, t), .7); });
    bedBoy(Wd, 2, BA, 1, t => { const c = t < 1.3, hope = t >= 1.3 && t < TF, st = t >= TF && t < TR;
      return { k: 1, gesture: c ? 'think' : (hope ? 'think' : (st ? 'shrug' : (t < TR + 2 ? 'shrug' : 'headdown'))), eyes: c ? .85 : hope ? .12 : st ? 0 : .3, brow: c ? .9 : hope ? .5 : st ? .7 : .4, smile: hope ? .35 : st ? 0 : .05, look: hope ? .6 * Math.sin(t * 1.2) : (st ? .3 * Math.sin(t * 2) : -.3), talk: 0 }; });
    bedBoy(Wd, 3, BB, .78, t => ({ k: 0, eyes: 1, smile: .35, hidden: t > 3.7 && t < TR + .1 }));
    Wd.center = [BA, -2.5];
    Wd.cam = shakeCam(seq([0, cine([C(0, [-2.7, 1.3, -1.9], 5.6, .7, 22, 44), C(3.6, [-3.1, 1.3, -1.9], 4.4, .4, 8, 42)])],
      [3.6, cine([C(3.6, [-3.6, 1.6, -1.8], 3.4, .3, 28, 40), C(TF, [-3.8, 1.62, -1.7], 2.8, .2, 10, 38), C(TR, [-3.85, 1.62, -1.7], 3.0, .3, -14, 38)])],
      [TR, cine([C(TR, [-3.6, 1.3, -2.2], 3.4, .5, -26, 40), C(12, [-3.4, 1.2, -2.6], 5.2, .9, 8, 42), C(dur, [-3.0, 1.1, -2.8], 7.2, 1.5, 22, 44)])]), [[TF + .1, .02, .5]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-42: Bentzi turns to the wall, pulls the blanket up, Zzz - the candle keeps burning
  function s3(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }), { sw } = bedroom(Wd); sw.set(0); bedLight(Wd, () => 0);
    bedCandle(Wd, () => 1);
    const roll = t => sm(P(2.4, 4.4, t)) * (PI / 2), cover = t => sm(P(3.6, 6.4, t)), kb = t => ({ k: 0, roll: roll(t), cover: cover(t) });
    blanket(Wd, BA, 0x3b6fd0, 1, kb); blanket(Wd, BB, 0xe08a3a, .78, () => ({ k: 0, roll: 0, cover: .5 }));
    bedBoy(Wd, 2, BA, 1, t => ({ k: 0, roll: roll(t), gesture: t < 2 ? 'think' : (t < 6.6 ? 'heart' : null), eyes: t < 2 ? .8 : (t < 4.6 ? .6 : lerp(.6, 1, sm(P(4.6, 6, t)))), brow: t < 4.6 ? .8 : .1, smile: t < 4.6 ? 0 : .3, look: 0 }));
    bedBoy(Wd, 3, BB, .78, () => ({ k: 0, eyes: 1, smile: .35 }));
    zzz(Wd, [BA - .1, 1.45, -4.1], t => sm(P(6.0, 7.0, t))); zzz(Wd, [BB + .1, 1.2, -4.0], t => .6 * sm(P(1, 2, t)));
    Wd.center = [BA, -2.5];
    Wd.cam = seq([0, cine([C(0, [BA + .3, .9, -3.2], 4.2, 2.3, 34, 42), C(4.2, [BA + .1, .95, -3.3], 3.6, 1.9, -8, 40)])],
      [4.2, cine([C(4.2, [BA, .95, -3.9], 3.2, 2.0, 30, 40), C(8.0, [BA, .95, -4.0], 3.4, 1.9, 50, 40)])],
      [8.0, cine([C(8.0, [DR[0] + .1, 1.3, DR[1]], 2.2, .1, 16, 40), C(10.8, [DR[0], 1.3, DR[1]], 2.6, .1, -12, 40)])],
      [10.8, cine([C(10.8, [-3.3, 1.1, -2.9], 4.2, 1.0, -22, 42), C(dur, [-3.0, 1.1, -2.8], 7.0, 1.8, 12, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- kitchen
  const CTOP = .96, KZ = -4.2;
  function stoveBurner(Wd, cx, lvl) {
    const g = new THREE.Group(); g.position.set(cx, CTOP + .03, KZ); Wd.add(g); const N = 14, cs = [], ins = [];
    for (let i = 0; i < N; i++) { const a = i / N * PI * 2, m = new THREE.Mesh(new THREE.ConeGeometry(.03, .18, 8), bm(0x4aa3ff, { transparent: true, opacity: .92 })); m.position.set(Math.cos(a) * .15, .09, Math.sin(a) * .15); g.add(m); cs.push(m);
      const m2 = new THREE.Mesh(new THREE.ConeGeometry(.015, .1, 6), bm(0xeaf7ff)); m2.position.set(Math.cos(a) * .15, .055, Math.sin(a) * .15); g.add(m2); ins.push(m2); }
    const gl = glowSprite(1.1, 1.1, .4); gl.material.color.set(0x8fc8ff); gl.position.y = .12; g.add(gl); const lt = new THREE.PointLight(0x9ac8ff, 0, 4); lt.position.y = .35; g.add(lt);
    Wd.on(t => { const L = lvl(t); g.visible = L > .02; cs.forEach((m, i) => { const f = 1 + .14 * Math.sin(t * 13 + i * 1.7) + .07 * Math.sin(t * 23 + i); m.scale.set(.6 + .4 * L, Math.max(.01, L) * f, .6 + .4 * L); m.position.y = .09 * Math.max(.01, L) * f; ins[i].scale.set(.6 + .4 * L, Math.max(.01, L) * f, .6 + .4 * L); ins[i].position.y = .055 * Math.max(.01, L) * f; });
      gl.material.opacity = .55 * Math.min(1, L); gl.scale.setScalar(.7 + .4 * L); lt.intensity = .8 * L; });
    return g;
  }
  function stoveKnob(Wd, cx) {
    const dial = texPlane(.34, .34, drawDial, { cw: 256, opaque: true, ro: 2, depthWrite: true }); dial.position.set(cx, .8, -3.795); Wd.add(dial);
    const g = new THREE.Group(); g.position.set(cx, .8, -3.78); Wd.add(g);
    g.add(cyl(.07, .07, .07, 0x8f98a3, { pos: [0, 0, .02], rot: [PI / 2, 0, 0] })); g.add(box(.03, .08, .02, 0xd62828, { pos: [0, .045, .06], ink: false }));
    return { set(a) { g.rotation.z = a; } };
  }
  function kitchen(Wd, o) {
    o = o || {}; const R = plainRoom(Wd, { HX: 5, HZ: 4.6, H: 3.4, beams: false, wall: 0xf1ead8 });
    const tile = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.2), toon(0xffffff, { map: canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#eef2f5' : '#cfd8df'; g.fillRect(i * 32, j * 32, 32, 32); } }, [5, 2]) })); tile.rotation.x = -PI / 2; tile.position.set(0, .004, -2.5); tile.receiveShadow = true; Wd.add(tile);
    for (const sx of [-1, 1]) { Wd.add(box(4.25, .9, .85, 0xc9a574, { pos: [sx * 2.875, .45, -4.17] })); Wd.add(box(4.3, .06, .95, 0x4a4038, { pos: [sx * 2.875, .93, -4.15] })); Wd.add(box(4.3, .7, .05, 0xe9eef2, { pos: [sx * 2.875, 1.3, -4.57], ink: false })); }
    Wd.add(box(3.4, .9, .45, 0xb98a58, { pos: [-2.8, 2.55, -4.35] })); Wd.add(box(2.2, .9, .45, 0xb98a58, { pos: [2.6, 2.55, -4.35] }));
    nightWindow(Wd, 3.0, 1.2, -R.HZ + .02, 0, 1.2, 1.5); Wd.add(box(1.1, 2.3, .85, 0xeef2f6, { pos: [4.45, 1.15, -4.1], ink: true }));
    Wd.add(box(1.5, .9, .8, 0xdfe5ea, { pos: [0, .45, KZ] })); Wd.add(box(1.5, .05, .8, 0x25282e, { pos: [0, CTOP - .025, KZ] }));
    Wd.add(box(1.2, .5, .03, 0xaab3bd, { pos: [0, .4, -3.79], ink: false })); Wd.add(box(.9, .04, .05, 0x6a7480, { pos: [0, .62, -3.76], ink: false }));
    Wd.add(box(1.5, .5, .6, 0xb5bcc4, { pos: [0, 2.45, -4.3] })); Wd.add(box(.3, .9, .3, 0xb5bcc4, { pos: [0, 3.0, -4.4] }));
    for (const cx of [-.38, .38]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.17, .03, 8, 24), toon(0x15171a)); r.rotation.x = PI / 2; r.position.set(cx, CTOP + .02, KZ); Wd.add(r); Wd.add(cyl(.07, .07, .03, 0x15171a, { pos: [cx, CTOP + .02, KZ], ink: false }));
      Wd.add(box(.62, .025, .03, 0x15171a, { pos: [cx, CTOP + .05, KZ], ink: false })); Wd.add(box(.03, .025, .62, 0x15171a, { pos: [cx, CTOP + .05, KZ], ink: false })); }
    lighting(Wd, () => ({ hemi: 1.25, sun: .9, hemiColor: 0xfff0d8 }));
    return R;
  }
  // a floating match (scaled up), with its own flame; head position given
  const ML = .52;
  function litMatch(Wd) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); inner.scale.setScalar(1.9); g.visible = false; Wd.add(g);
    inner.add(cyl(.011, .011, .26, 0xe6c88a, { pos: [0, .13, 0] })); inner.add(ball(.026, 0xc4161c, { pos: [0, .275, 0] }));
    const fg = new THREE.Group(); fg.position.y = .29; inner.add(fg); const f1 = new THREE.Mesh(new THREE.ConeGeometry(.03, .13, 10), bm(0xff9a1f)); f1.position.y = .065; fg.add(f1); const f2 = new THREE.Mesh(new THREE.ConeGeometry(.017, .08, 8), bm(0xfff2a8)); f2.position.y = .04; fg.add(f2);
    const gl = glowSprite(.5, .5, .8); gl.position.y = .07; fg.add(gl); const lt = new THREE.PointLight(0xffb35a, 0, 3); lt.position.y = .08; fg.add(lt);
    return { g, head(h, rz) { return [h[0] + Math.sin(rz) * ML, h[1] - Math.cos(rz) * ML, h[2]]; },
      set(headPos, rz, fK, s, t) { g.visible = (s === undefined ? 1 : s) > .01; if (!g.visible) return; const b = [headPos[0] + Math.sin(rz) * ML, headPos[1] - Math.cos(rz) * ML, headPos[2]]; g.position.set(b[0], b[1], b[2]); inner.rotation.z = rz; g.scale.setScalar(s === undefined ? 1 : s);
        fg.visible = fK > .02; const f = fK * (1 + .12 * Math.sin(t * 15) + .06 * Math.sin(t * 27)); fg.scale.set(Math.max(.01, fK) * (1 + .1 * Math.sin(t * 11)), Math.max(.01, f), Math.max(.01, fK)); lt.intensity = .7 * fK; } };
  }
  function yahr(Wd, pos) {   // glass memorial candle, burning
    const c = candle(Wd, { pos, h: .13, r: .03, holder: false, fs: .55, color: 0xfff4d8, glowSize: .8, light: { color: 0xffb35a, i: .9, dist: 7 }, flame: () => 1 });
    const glass = cyl(.085, .075, .21, 0xe04a3a, { pos: [pos[0], pos[1] + .105, pos[2]], ink: false }); glass.material.transparent = true; glass.material.opacity = .5; glass.material.depthWrite = false; Wd.add(glass);
    Wd.add(cyl(.09, .09, .015, 0xb0b6c0, { pos: [pos[0], pos[1] + .008, pos[2]], ink: false })); return c;
  }

  // ---------------------------------------------------------------- 4. 42-56: a match passes the fire (never shaken!) - it is laid on a plate and goes out by itself
  function s4(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }); kitchen(Wd);
    const GX = -3.3, Y1 = -2.4, Y2 = -1.85, Z = -4.0, PX = -1.1;
    const tipG = [GX, CTOP + .13 + .1, Z], tip1 = [Y1, CTOP + .29 + .26 + .04, Z], tip2 = [Y2, CTOP + .29 + .26 + .04, Z];
    const T1 = 5.7, T2 = 7.4, TG = 3.2, SH0 = 8.3, XT = 9.5, TL = 10.6;
    yahr(Wd, [GX, CTOP, Z]);
    candle(Wd, { pos: [Y1, CTOP, Z], h: .26, light: { color: 0xffb35a, i: .8, dist: 6 }, glowSize: .9, flame: t => sm(P(T1 + .2, T1 + .9, t)) });
    candle(Wd, { pos: [Y2, CTOP, Z], h: .26, light: { color: 0xffb35a, i: .8, dist: 6 }, glowSize: .9, flame: t => sm(P(T2 + .2, T2 + .9, t)) });
    Wd.add(cyl(.27, .21, .03, 0xffffff, { pos: [PX, CTOP + .015, Z + .05] })); const rim = new THREE.Mesh(new THREE.TorusGeometry(.26, .018, 8, 28), toon(0x3b6fd0)); rim.rotation.x = PI / 2; rim.position.set(PX, CTOP + .035, Z + .05); Wd.add(rim);
    const m = litMatch(Wd), a0 = flameArc(Wd, 18), a1 = flameArc(Wd, 18), a2 = flameArc(Wd, 18), x = mark3d(Wd, 'cross', 1.0), ck = mark3d(Wd, 'check', 1.1), sk = shock(Wd, 0xff7a7a);
    const smoke = []; for (let i = 0; i < 6; i++) { const s = glowSprite(.3, .3, 0); s.material.color.set(0xb8bcc4); Wd.add(s); smoke.push(s); }
    const H0 = [-3.95, 1.6, Z + .05], HG = [GX - .3, tipG[1] + .1, Z], H1 = [Y1 - .33, tip1[1] + .06, Z], H2 = [Y2 - .33, tip2[1] + .06, Z], HP = [PX + .14, CTOP + .06, Z + .05];
    const state = t => {   // match head, tilt, flame
      let h, rz = -.75, f = 0;
      if (t < 3.0) { h = lerpV(H0, HG, sm(P(1.2, 3.0, t))); h[1] += .05 * Math.sin(t * 3); f = 0; }
      else if (t < T1) { const u = sm(P(TG + .4, T1 - .1, t)); h = arcPt(HG, H1, u, .3); f = sm(P(TG, TG + .6, t)); }
      else if (t < T2) { h = arcPt(H1, H2, sm(P(T1 + 1.0, T2 - .1, t)), .12); h[1] += .02 * Math.sin(t * 4); f = 1; }
      else if (t < SH0) { h = H2.slice(); h[1] += .03 * Math.sin(t * 3.5); f = 1; }
      else if (t < XT) { const k = P(SH0, XT, t); h = H2.slice(); h[0] += .08 * Math.sin(t * 40) * k; h[1] += .05 * Math.cos(t * 33) * k; rz = -.75 + .55 * Math.sin(t * 38) * k; f = 1 + .35 * k; }
      else if (t < TL) { h = H2.slice(); h[1] += .04 * Math.sin(t * 3); f = 1; }
      else { const u = sm(P(TL, TL + 1.7, t)); h = arcPt(H2, HP, u, .2); rz = lerp(-.75, -PI / 2 + .12, sm(P(TL + .9, TL + 2.0, t))); f = 1 - sm(P(TL + 1.6, TL + 3.3, t)); }
      return { h, rz, f }; };
    Wd.on(t => { const s = state(t), ap = sm(P(.3, 1.1, t)); m.set(s.h, s.rz, s.f, ap, t);
      const hd = s.h; a0.set(tipG, [HG[0], HG[1], HG[2]], P(TG, TG + .6, t), .15, 1 - sm(P(TG + 1.0, TG + 1.8, t))); a1.set([H1[0], H1[1] + .04, Z], tip1, P(T1, T1 + .6, t), .2, 1 - sm(P(T1 + 1.2, T1 + 2.0, t))); a2.set([H2[0], H2[1] + .04, Z], tip2, P(T2, T2 + .6, t), .2, 1 - sm(P(T2 + 1.2, T2 + 2.0, t)));
      const sl = P(XT, XT + .3, t), back = P(TL - .9, TL - .1, t); x.set([Y2 + .15, tip2[1] + .45, Z + .3], (t > XT ? lerp(1.2, .45, ease.out(sl)) : 0) * (1 - sm(back)), .04 * Math.sin(t * 9)); sk.set([Y2 + .15, tip2[1] + .45, Z + .35], P(XT, XT + .9, t), .9);
      ck.set([PX + .15, CTOP + .95, Z + .2], popE(P(TL + 2.2, TL + 3.0, t)) * 1.0, .05 * Math.sin(t * 3));
      smoke.forEach((sp, i) => { const u = ((t - (TL + 2.0) - i * .35) / 2.0), on = u > 0 && u < 1; sp.material.opacity = on ? .35 * Math.sin(PI * u) : 0; sp.position.set(PX - .2 + .1 * Math.sin(t * 3 + i) + u * .1, CTOP + .1 + u * .8, Z + .05); sp.scale.setScalar(.2 + u * .5); }); });
    Wd.center = [-2.4, Z];
    Wd.cam = seq([0, cine([C(0, [-2.6, 1.3, Z], 6.6, 1.0, 22, 44), C(3.2, [-3.0, 1.3, Z], 4.4, .5, 6, 42)])],
      [3.2, cine([C(3.2, [-2.9, 1.35, Z], 3.0, .4, -18, 40), C(T1 + .2, [-2.4, 1.4, Z], 3.2, .3, 12, 40), C(7.2, [-2.2, 1.45, Z], 3.6, .4, -10, 42)])],
      [7.2, cine([C(7.2, [-2.2, 1.55, Z], 3.0, .3, 14, 40), C(XT + .2, [Y2 - .1, 1.6, Z], 2.2, .2, -8, 38), C(TL, [Y2, 1.6, Z], 2.6, .3, 10, 38)])],
      [TL, cine([C(TL, [-1.8, 1.45, Z], 3.2, .5, -14, 40), C(dur, [-1.6, 1.4, Z], 4.4, .8, 16, 42)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 56-70: the gas knob starts to turn BY ITSELF toward low - red X - it returns
  function s5(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }); kitchen(Wd);
    const TK0 = 2.8, TK1 = 7.0, XT = 7.2, TB0 = 9.6, TB1 = 11.4, KA = .62;
    const ang = t => lerp(KA, -KA, sm(P(TK0, TK1, t))) * (1 - sm(P(TB0, TB1, t))) + lerp(KA, KA, 0) * sm(P(TB0, TB1, t)) * 1;   // 0.62 (big flame) -> -0.62 (small flame) -> back to 0.62
    const level = t => 1 - .62 * sm(P(TK0 + .6, TK1, t)) * (1 - sm(P(TB0, TB1, t)));
    stoveBurner(Wd, -.38, level); stoveBurner(Wd, .38, () => 0);
    const kn = stoveKnob(Wd, -.38), kn2 = stoveKnob(Wd, .38); kn2.set(-1.3);
    const sign = bb(Wd, 1.3, 1.3, drawLowerSign, 384), x = mark3d(Wd, 'cross', 1.1), sk = shock(Wd, 0xff7a7a);
    Wd.on(t => { kn.set(ang(t) + (t > XT && t < TB0 ? .03 * Math.sin(t * 30) : 0)); const sa = sm(P(TK0 + .4, TK0 + 1.3, t)) * (1 - sm(P(TB1 - .6, TB1 + .2, t)));
      sign.set([-.38, 1.62 + .04 * Math.sin(t * 1.8), -3.75], .6 * sa, .06 * Math.sin(t * 2), sa);
      const sl = P(XT, XT + .3, t); x.set([-.38, 1.62, -3.55], (t > XT ? lerp(1.2, .45, ease.out(sl)) : 0) * (1 - sm(P(TB0 - .5, TB0 + .3, t))), .04 * Math.sin(t * 9)); sk.set([-.38, 1.62, -3.5], P(XT, XT + .9, t), .8); });
    Wd.center = [0, KZ];
    Wd.cam = seq([0, cine([C(0, [0, 1.5, KZ], 7.4, 1.2, 24, 44), C(2.8, [-.3, 1.2, KZ + .3], 3.6, .6, 8, 42)])],
      [2.8, cine([C(2.8, [-.38, 1.4, -3.9], 3.1, .4, 20, 38), C(5.2, [-.38, 1.45, -3.9], 3.0, .35, 6, 38), C(XT + .4, [-.38, 1.5, -3.9], 3.3, .3, -14, 40)])],
      [XT + .4, cine([C(XT + .4, [-.38, 1.3, KZ], 3.2, .5, -22, 40), C(TB1, [-.38, 1.1, KZ], 2.6, .4, 6, 38)])],
      [TB1, cine([C(TB1, [-.1, 1.4, KZ], 3.8, .8, 16, 42), C(dur, [0, 1.5, KZ], 6.8, 1.4, -14, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 70-84: a sneaky pot of water floats onto the flame and "boils over" - red X - the pot floats away
  function s6(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }); kitchen(Wd);
    const TD = 4.4, TB = 5.0, TO = 7.0, XT = 8.7, TLV = 9.7;
    const level = t => 1 - .62 * sm(P(TO + .6, XT - .2, t)) * (1 - sm(P(TLV, TLV + 1.2, t)));
    stoveBurner(Wd, -.38, level); stoveBurner(Wd, .38, () => 0); const kn = stoveKnob(Wd, -.38), kn2 = stoveKnob(Wd, .38); kn.set(KAS); kn2.set(-1.3);
    // the pot
    const pg = new THREE.Group(); pg.visible = false; Wd.add(pg); const inP = new THREE.Group(); pg.add(inP);
    inP.add(cyl(.3, .27, .36, 0xc3cad2, { pos: [0, .18, 0] })); inP.add(cyl(.325, .325, .045, 0x9aa3ae, { pos: [0, .36, 0] })); for (const sx of [-1, 1]) inP.add(box(.2, .05, .07, 0x7a828c, { pos: [sx * .4, .3, 0] }));
    const wat = cyl(.285, .285, .02, 0x4fb0ff, { pos: [0, .335, 0], ink: false }); wat.material = bm(0x4fb0ff); inP.add(wat);
    const foam = []; for (let i = 0; i < 9; i++) { const a = i * 2.4, r = i === 0 ? 0 : .12 + (i % 3) * .06, b = ball(.08 + (i % 3) * .015, 0xffffff, { pos: [Math.cos(a) * r, .36, Math.sin(a) * r], ink: false }); b.material = bm(0xf4fbff); inP.add(b); foam.push(b); }
    const drips = []; for (let i = 0; i < 10; i++) { const b = ball(.035, 0x7fc8ff, { ink: false }); b.material = bm(0x7fc8ff); b.visible = false; inP.add(b); drips.push(b); }
    const f1 = texPlane(.5, .3, drawPotFace(false), { cw: 256, ro: 5 }), f2 = texPlane(.5, .3, drawPotFace(true), { cw: 256, ro: 5 }); for (const f of [f1, f2]) { f.position.set(0, .19, .31); inP.add(f); }
    const steam = []; for (let i = 0; i < 6; i++) { const s = glowSprite(.4, .4, 0); s.material.color.set(0xffffff); Wd.add(s); steam.push(s); }
    const x = mark3d(Wd, 'cross', 1.1), sk = shock(Wd, 0xff7a7a);
    const S = [-3.2, 2.3, -3.3], HOV = [-.38, 1.7, -4.05], SIT = [-.38, CTOP + .1, KZ + .0], OUT = [3.6, 3.0, -3.0];
    const pot = t => { if (t < TD) return arcPt(S, HOV, sm(P(.6, TD - .6, t)), .4); if (t < TLV) return lerpV(HOV, SIT, sm(P(TD - .6, TD + .2, t))); return arcPt(SIT, OUT, sm(P(TLV, TLV + 2.6, t)), .9); };
    const foamK = t => sm(P(TB + .6, TO + 1.4, t)) * (1 - sm(P(TLV + .6, TLV + 2.4, t))), dripK = t => sm(P(TO, TO + .5, t)) * (1 - sm(P(XT + .6, XT + 1.0, t)));
    Wd.on(t => { const p = pot(t), ap = sm(P(.3, 1.0, t)), sneaky = t < TD, k = foamK(t);
      pg.visible = ap > .01; pg.scale.setScalar(Math.max(.01, ap)); pg.position.set(p[0], p[1] + (sneaky ? .04 * Math.sin(t * 5) : (t > TLV ? 0 : .012 * Math.sin(t * 30) * (t > TB ? 1 : 0))), p[2]);
      pg.rotation.z = (sneaky ? .12 * Math.sin(t * 3.4) : 0) + (t > XT && t < TLV ? .05 * Math.sin(t * 40) : 0) + (t > TLV ? -.2 * sm(P(TLV, TLV + 1.6, t)) : 0); inP.rotation.y = 0;
      f1.visible = t < XT; f2.visible = t >= XT;
      foam.forEach((b, i) => { b.position.y = .36 + k * (.1 + (i % 4) * .035) + .02 * Math.sin(t * 9 + i); b.scale.setScalar(.4 + k * (.7 + (i % 3) * .1)); b.visible = k > .02; });
      const dk = dripK(t); drips.forEach((b, i) => { const ph = (t * 1.5 + i / drips.length) % 1, ang = (i % 5 - 2) * .42, rr = .33 + ph * .06; b.visible = dk > .05; b.position.set(Math.sin(ang) * rr, .37 - ph * ph * .85, Math.cos(ang) * rr * .8 + .0); b.scale.setScalar(dk * (1 - ph * .3)); });
      steam.forEach((s, i) => { const u = ((t - i * .3) * .5) % 1, on = dk > .05; s.material.opacity = on ? .4 * dk * Math.sin(PI * u) : 0; s.position.set(-.38 + (i - 2.5) * .08, CTOP + .1 + u * .7, KZ + .3); s.scale.setScalar(.25 + u * .5); });
      const sl = P(XT, XT + .3, t); x.set([-.38, 1.95, -3.7], (t > XT ? lerp(1.1, .45, ease.out(sl)) : 0) * (1 - sm(P(TLV - .3, TLV + .5, t))), .04 * Math.sin(t * 9)); sk.set([-.38, 1.95, -3.65], P(XT, XT + .9, t), 1.0); });
    Wd.center = [0, KZ];
    Wd.cam = seq([0, cine([C(0, [-.8, 1.5, KZ + .4], 7.2, 1.2, -20, 44), C(TD, [-.5, 1.5, KZ + .2], 4.6, .6, 10, 42)])],
      [TD, cine([C(TD, [-.38, 1.35, KZ + .2], 3.4, .3, -16, 40), C(TO + .6, [-.38, 1.4, KZ + .2], 2.6, .2, 14, 38), C(XT + .4, [-.38, 1.5, KZ + .2], 3.2, .3, -6, 40)])],
      [XT + .4, cine([C(XT + .4, [0, 1.8, KZ], 4.4, .5, 24, 42), C(TLV + 2, [1, 2.2, KZ], 5.4, .8, 6, 44)])],
      [TLV + 2, cine([C(TLV + 2, [0, 1.5, KZ], 6.6, 1.2, -14, 44), C(dur, [0, 1.5, KZ], 7.6, 1.5, 10, 44)])]);
    return Wd;
  }
  const KAS = .62;

  // ---------------------------------------------------------------- 7. 84-100: the three red X in a row, then morning light: Bentzi wakes up rested
  function s7(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }), { sw } = bedroom(Wd);
    const kM = t => sm(P(4.0, 8.5, t)); sw.set(0); bedLight(Wd, kM); Wd.on(t => sw.set(kM(t)));
    bedCandle(Wd, t => 1 - sm(P(5.2, 6.6, t)), t => 1 - .6 * sm(P(5.2, 6.6, t)));
    const WK = 7.4;   // wake time
    const kk = t => t >= WK + .8 ? 1 : 0, kB = t => t >= WK + 4.0 ? 1 : 0;   // sit-up happens exactly at a camera cut
    blanket(Wd, BA, 0x3b6fd0, 1, t => ({ k: kk(t), roll: 0, cover: lerp(.6, 0, kk(t)) })); blanket(Wd, BB, 0xe08a3a, .78, t => ({ k: kB(t), roll: 0, cover: .5 * (1 - kB(t)) }));
    bedBoy(Wd, 2, BA, 1, t => { const aw = sm(P(WK, WK + .8, t)); return { k: kk(t), eyes: lerp(1, 0, aw), gesture: t > WK + 2.6 && t < WK + 4.6 ? 'up' : (t > WK + 5.4 && t < WK + 7 ? 'thumb' : null), smile: lerp(.3, 1, aw), brow: 0, look: 0, talk: 0 }; });
    bedBoy(Wd, 3, BB, .78, t => { const aw = sm(P(WK + 2.2, WK + 3.0, t)); return { k: kB(t), eyes: lerp(1, 0, aw), gesture: t > WK + 4.6 ? 'cheer' : null, smile: lerp(.3, 1, aw), brow: 0 }; });
    const bds = ['puff', 'match', 'pot'].map(kd => board(Wd, { w: 1.9, h: 1.9, draw: drawBoard(kd), cw: 512, frame: 0x6b3a1c, glow: 0xffb050 })), xs = [0, 1, 2].map(() => mark3d(Wd, 'cross', 1.1));
    Wd.on(t => { bds.forEach((b, i) => { const s0 = .5 + i * 1.4, a = popE(P(s0 - .3, s0 + .5, t)) * (1 - sm(P(5.0, 6.0, t))); b.set([(i - 1) * 2.4, 2.15 + .06 * Math.sin(t * 1.6 + i) + sm(P(5, 6, t)) * 1.2, -1.4], a * 1.0, (i - 1) * -.18); });
      xs.forEach((m, i) => { const s0 = .9 + i * 1.4, a = popE(P(s0, s0 + .45, t)) * (1 - sm(P(4.8, 5.8, t))); m.set([(i - 1) * 2.4 + .6, 2.75, -.9], a * .9, .05 * Math.sin(t * 5 + i)); }); });
    zzz(Wd, [BA - .1, 1.45, -4.1], t => (1 - sm(P(WK - .8, WK, t))) * sm(P(1, 2, t)));
    Wd.center = [-2.7, -2.0];
    Wd.cam = seq([0, cine([C(0, [0, 2.0, -1.4], 8.6, .8, -14, 46), C(3.0, [0, 2.0, -1.4], 8.0, .6, 8, 46), C(5.6, [0, 2.0, -1.4], 7.4, .5, 0, 46)])],
      [5.6, cine([C(5.6, [-3.0, 1.2, -3.2], 5.4, 1.4, 18, 44), C(WK + .8, [-3.9, 1.2, -3.6], 3.8, 1.1, 36, 42)])],
      [WK + .8, cine([C(WK + .8, [BA + .4, 1.15, -3.7], 3.0, .9, 40, 40), C(WK + 4.0, [BA + .3, 1.2, -3.6], 3.2, .7, 12, 40)])],
      [WK + 4.0, cine([C(WK + 4.0, [-2.7, 1.2, -3.4], 4.8, .8, -14, 44), C(dur, [-2.7, 1.2, -3.2], 6.2, 1.2, 12, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: bright morning bedroom, the two brothers sit up smiling behind the card
  function answerBg(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }), { sw } = bedroom(Wd); sw.set(1); bedLight(Wd, () => 1);
    bedCandle(Wd, () => 0, () => .4);
    bedBoy(Wd, 2, BA, 1, t => ({ k: 1, zs: .95, smile: 1, gesture: Math.sin(t * .8) > .6 ? 'thumb' : null, brow: 0, talk: .4 * talkAmt(t, 3), look: .3 * Math.sin(t * .7) }));
    bedBoy(Wd, 3, BB, .78, t => ({ k: 1, zs: .95, smile: 1, brow: 0, gesture: Math.sin(t * .9 + 1) > .7 ? 'cheer' : null, talk: .3 * talkAmt(t, 5), look: -.3 * Math.sin(t * .6) }));
    const gl = glowAt(Wd.scene, 9, 0xffd890, .35); gl.position.set(-2.7, 1.5, -2.0);
    Wd.center = [-2.7, -2.1]; Wd.ansD = 6.4; return Wd;
  }

  const grade = t => {
    if (t >= 14 + TF + .1 && t < 14 + TR) { const k = sm(P(14 + TF + .1, 14 + TF + .35, t)) * (1 - sm(P(14 + TR - .3, 14 + TR, t))); return { sat: lerp(1, .5, k), contrast: lerp(1, 1.12, k), bright: lerp(1, 1.05, k) }; }
    return { sat: 1 };
  };
  const overlay = (g, W, H, t) => { flash(g, W, H, 14 + TF + .1, t); flash(g, W, H, 42 + 9.5, t); flash(g, W, H, 56 + 7.2, t); flash(g, W, H, 70 + 8.7, t); };
  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg, grade, overlay };
};
