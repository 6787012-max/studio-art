// halashon-06 story: "and if they think I'm crazy?" - 3D choreography per storyboards_v7.md (B). Boys only. Everything is a function of time.
// Grey clouds carry ICONS (no words about anyone); the only words drawn in the 3D world are the signs of the halacha itself.
// Hebrew words inside the 3D world are produced by H() from a latin spelling (see HL below), so this file holds no raw Hebrew.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, yardWorld, board, shock, mark3d, qmark, popE, lighting,
    arcPt, glowSprite, canvasTex, FONT, bill, fitText, drawWord, texPlane } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.1 * d : ly];
  const SIT = { sit: true, groundY: 0 };
  const occ = (Wd, g) => { (Wd.occ = Wd.occ || []).push(g); return g; };

  // latin -> hebrew spelling: index i of HL is the code point 0x5d0 + i
  const HL = 'abgdhvzxtyKklMmNnsepPCcqrwT';
  const H = s => s.split('').map(ch => { const i = HL.indexOf(ch); return i < 0 ? ch : String.fromCharCode(0x5d0 + i); }).join('');
  const W_MAD = H('mwvge') + '?', W_NOWAY = H('ayN laN llkT'), W_FORBID = H('asvr lhctrP');
  const W_FOOL = H('wvth'), W_FOOL2 = H('kl ymyv'), W_WICKED = H('rwe'), W_WICKED2 = H('weh axT'), W_LIGHT = H('avr hgnvz');

  // ---------------------------------------------------------------- people (navy velvet kippot, NO scaling of the kippa mesh)
  const boyK = (Wd, i, fn) => { const Pp = boyP(Wd, i, fn); Wd.on(() => { if (!Pp.kippa && Pp.figure) Pp.figure.group.traverse(m => { if (!Pp.kippa && m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && Math.abs(m.geometry.parameters.thetaLength - .86) < .02) Pp.kippa = m; }); const k = Pp.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }); return Pp; };
  const ID = { Y: 1, F1: 3, F2: 4, F3: 5, F4: 6 }, SZ = -3.3;
  const LAY = { A: { F1: -7.45, Y: -6.7, F2: -5.95, F3: -5.2 }, B: { F1: -7.45, F2: -6.7, F3: -5.95, Y: -5.2 } };
  const FAC = { A: { F1: .4, Y: 0, F2: -.35, F3: -.45 }, B: { F1: .4, F2: .3, F3: .35, Y: .55 } };
  const FR = ['F1', 'F2', 'F3'];
  const seat = (Wd, lay, role, fn) => { const x = LAY[lay][role]; return boyK(Wd, ID[role], t => Object.assign({ pos: [x, 0, SZ], facing: FAC[lay][role] }, SIT, fn(t))); };
  const chat = (t, j) => ({ perform: .7, talk: .75 * talkAmt(t, j + 2), smile: .25, brow: .2, gesture: ((t * .45 + j * 1.7) % 4) < 1.1 ? 'explain' : null });
  const friends = (Wd, lay, fn) => FR.forEach((r, j) => seat(Wd, lay, r, t => fn(t, j)));
  const ynow = (Wd, lay, fn) => seat(Wd, lay, 'Y', fn);

  // ---------------------------------------------------------------- the yard with a longer bench, a fence behind, a wall and a hedge at the ends (nowhere to go)
  function world6() {
    const Wd = yardWorld({ noBall: true });
    Wd.add(box(.9, .1, .55, 0x9a6a3e, { pos: [-4.85, .5, -3.5] })); Wd.add(box(.9, .5, .08, 0x8a5a34, { pos: [-4.85, .78, -3.8] })); Wd.add(box(.1, .5, .5, 0x6a4326, { pos: [-4.45, .25, -3.5], ink: false }));
    for (let x = -9.6; x <= -2.2; x += .3) Wd.add(box(.14, 1.55, .05, 0xd9b27a, { pos: [x, .775, -4.7], ink: false }));
    for (const y of [.45, 1.15]) Wd.add(box(7.6, .1, .07, 0xa87a48, { pos: [-5.9, y, -4.62], ink: false }));
    Wd.add(box(.4, 1.7, 2.9, 0xe3cfa6, { pos: [-8.4, .85, -3.2] })); Wd.add(box(.6, .12, 3.1, 0xc9a574, { pos: [-8.4, 1.76, -3.2], ink: false }));
    Wd.add(box(.7, 1.2, 1.7, 0x5f9e4a, { pos: [-3.1, .6, -3.8] })); Wd.add(ball(.5, 0x6fae57, { pos: [-3.1, 1.25, -3.8], scale: [1, .7, 1.5] }));
    return Wd;
  }

  // ---------------------------------------------------------------- icons + clouds (grey = lashon hara)
  const GREY = { run: 1, tree: 1, ear: 1, frownx: 1, mad: 1 };
  const ICONS = {
    frown: (c, cx, cy, r) => {
      c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .08; c.strokeStyle = '#3a3320'; c.stroke();
      c.fillStyle = '#3a3320'; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(cx + sx * r * .38, cy - r * .12, r * .1, r * .15, 0, 0, 7); c.fill(); }
      c.lineCap = 'round'; c.lineWidth = r * .1; c.beginPath(); c.moveTo(cx - r * .62, cy - r * .3); c.lineTo(cx - r * .2, cy - r * .5); c.moveTo(cx + r * .62, cy - r * .3); c.lineTo(cx + r * .2, cy - r * .5); c.stroke();
      c.lineWidth = r * .12; c.beginPath(); c.arc(cx, cy + r * .78, r * .42, PI * 1.12, PI * 1.88); c.stroke(); },
    run: (c, cx, cy, r) => {
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#243058'; c.lineWidth = r * .15;
      c.beginPath(); c.moveTo(cx + .1 * r, cy - .35 * r); c.lineTo(cx - .1 * r, cy + .15 * r); c.moveTo(cx, cy - .25 * r); c.lineTo(cx + .6 * r, cy - .05 * r); c.moveTo(cx, cy - .25 * r); c.lineTo(cx - .55 * r, cy - .45 * r);
      c.moveTo(cx - .1 * r, cy + .15 * r); c.lineTo(cx + .5 * r, cy + .3 * r); c.lineTo(cx + .42 * r, cy + .8 * r); c.moveTo(cx - .1 * r, cy + .15 * r); c.lineTo(cx - .5 * r, cy + .5 * r); c.lineTo(cx - .85 * r, cy + .38 * r); c.stroke();
      c.beginPath(); c.arc(cx + .2 * r, cy - .62 * r, r * .24, 0, 7); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .08; c.stroke(); },
    tree: (c, cx, cy, r) => {
      const N = [[0, -.68], [-.55, -.02], [.55, -.02], [-.85, .66], [-.28, .66], [.28, .66], [.85, .66]], E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
      c.lineCap = 'round'; c.strokeStyle = '#243058'; c.lineWidth = r * .1; E.forEach(([a, b]) => { c.beginPath(); c.moveTo(cx + N[a][0] * r, cy + N[a][1] * r); c.lineTo(cx + N[b][0] * r, cy + N[b][1] * r); c.stroke(); });
      N.forEach(([x, y], i) => { c.beginPath(); c.arc(cx + x * r, cy + y * r, r * (i === 0 ? .25 : .2), 0, 7); c.fillStyle = i === 0 ? '#f0c63a' : '#f7e7a6'; c.fill(); c.lineWidth = r * .07; c.stroke(); }); },
    ear: (c, cx, cy, r) => {
      c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(cx - .3 * r, cy + .8 * r);
      c.bezierCurveTo(cx - .85 * r, cy + .2 * r, cx - .75 * r, cy - .85 * r, cx + .05 * r, cy - .85 * r); c.bezierCurveTo(cx + .8 * r, cy - .85 * r, cx + .85 * r, cy - .05 * r, cx + .38 * r, cy + .3 * r);
      c.bezierCurveTo(cx + .1 * r, cy + .5 * r, cx + .2 * r, cy + .85 * r, cx - .3 * r, cy + .8 * r); c.closePath(); c.fillStyle = '#f2c8a0'; c.fill(); c.lineWidth = r * .11; c.strokeStyle = '#243058'; c.stroke();
      c.beginPath(); c.moveTo(cx - .12 * r, cy + .3 * r); c.bezierCurveTo(cx - .5 * r, cy - .1 * r, cx - .35 * r, cy - .55 * r, cx, cy - .5 * r); c.bezierCurveTo(cx + .35 * r, cy - .5 * r, cx + .4 * r, cy - .05 * r, cx + .1 * r, cy + .08 * r); c.stroke(); },
    frownx: (c, cx, cy, r) => {   // a crossed-out face
      ICONS.frown(c, cx, cy, r * .9); c.strokeStyle = '#d6262e'; c.lineCap = 'round'; c.lineWidth = r * .17; c.beginPath(); c.arc(cx, cy, r * 1.02, 0, 7); c.moveTo(cx - r * .72, cy + r * .72); c.lineTo(cx + r * .72, cy - r * .72); c.stroke(); },
    mad: (c, cx, cy, r) => {
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${r * 1.12}px ${FONT}`; c.lineJoin = 'round';
      c.strokeStyle = '#ffffff'; c.lineWidth = r * .14; c.strokeText(W_MAD, cx, cy + r * .05); c.fillStyle = '#3a4258'; c.fillText(W_MAD, cx, cy + r * .05); },
    zip: (c, cx, cy, r) => {
      c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); c.roundRect(cx - r * 1.1, cy - r * .3, r * 2.2, r * .6, r * .3); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .1; c.strokeStyle = '#243058'; c.stroke();
      c.lineWidth = r * .09; for (let i = 0; i < 9; i++) { const x = cx - r * .85 + i * r * .2; c.beginPath(); c.moveTo(x, cy - r * .3 * (i % 2 ? .1 : .7)); c.lineTo(x, cy + r * .3 * (i % 2 ? .7 : .1)); c.stroke(); }
      c.beginPath(); c.arc(cx + r * .98, cy, r * .22, 0, 7); c.fillStyle = '#c9ced8'; c.fill(); c.stroke(); },
  };
  const BT = {};
  const bubTex = kind => BT[kind] || (BT[kind] = canvasTex(768, 552, (c, W, Hh) => {
    const x0 = W * .04, y0 = Hh * .04, bw = W * .92, bh = Hh * .74, R = bh * .42;
    c.lineJoin = 'round'; c.beginPath(); c.roundRect(x0, y0, bw, bh, R); c.moveTo(W * .2, Hh * .74); c.lineTo(W * .1, Hh * .98); c.lineTo(W * .4, Hh * .74); c.closePath();
    c.fillStyle = GREY[kind] ? '#e1e4ec' : '#dff4ff'; c.fill(); c.lineWidth = W * .02; c.strokeStyle = '#1c2745'; c.stroke();
    ICONS[kind](c, W / 2, y0 + bh / 2, bh * (kind === 'mad' ? .34 : .36)); }));
  function bubble3(Wd, kind) {
    const w = 1.6, h = 1.15, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: bubTex(kind), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 8; inner.add(m);
    const gl = glowSprite(w * 2.2, h * 2.4, 0); gl.material.color.set(GREY[kind] ? 0xb7bccb : 0xffe6a0); gl.position.z = -.12; inner.add(gl);
    bill(Wd, g);
    return { g, set(pos, s, a, rz) { const on = s > .01 && (a === undefined || a > .01); g.visible = on; if (!on) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; const al = a === undefined ? 1 : a; m.material.opacity = al; gl.material.opacity = .4 * al; } };
  }
  const KINDS = ['frownx', 'run', 'ear', 'frownx', 'tree'];
  // a stream of grey clouds that pop up ABOVE the three friends and drift outward (never through a head)
  function stream(Wd, o) {
    const bs = []; for (let i = 0; i < o.n; i++) { const b = bubble3(Wd, KINDS[i % KINDS.length]); bs.push(b); occ(Wd, b.g); }
    const Pd = o.n * o.gap, until = o.until === undefined ? 1e9 : o.until, xs = o.xs || [LAY.A.F1, LAY.A.F2, LAY.A.F3], cx = o.cx === undefined ? LAY.A.Y : o.cx;
    Wd.on(t => bs.forEach((b, i) => {
      const e = t - o.t0 - i * o.gap; if (e < 0) { b.set([0, 0, 0], 0); return; }
      const k = Math.floor(e / Pd), u = (e - k * Pd) / o.life, spawn = o.t0 + i * o.gap + k * Pd;
      if (u >= 1 || spawn > until) { b.set([0, 0, 0], 0); return; }
      const x0 = xs[i % xs.length], su = sm(u), sc = o.s * (1 + (o.grow || 0) * P(o.t0, o.t0 + 14, t));
      b.set([x0 + (x0 - cx) * .9 * su + .22 * Math.sin(u * 5 + i * 1.3), (o.y0 || 1.85) + 1.0 * u + .08 * Math.sin(u * 7 + i), SZ + .25 + .35 * u], popE(P(0, .16, u)) * sc * (1 + .1 * u), 1 - sm(P(.78, 1, u)), .12 * Math.sin(u * 6 + i));
    }));
    return bs;
  }
  const motes = (Wd, n, col) => { const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(.22, .22, 0); s.material.color.set(col); Wd.add(s); sp.push(s); }
    return (t, c, rad, k) => sp.forEach((s, i) => { const a = t * .7 + i * 2.4, r = rad * (.7 + .3 * ((i * 7) % 5) / 4); s.position.set(c[0] + Math.cos(a) * r, c[1] + Math.sin(a * 1.3) * rad * .35, c[2] + .3 + Math.sin(a) * .3); s.material.opacity = k * (.35 + .45 * Math.sin(t * 3 + i * 1.7) ** 2); }); };
  const rays = Wd => { const arr = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 12), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(-8 + i * 2.8, 5, -4 + (i % 2)); m.rotation.z = .4; Wd.add(m); arr.push(m); }
    return k => arr.forEach((m, i) => m.material.opacity = k * (.16 + .06 * Math.sin(i * 2 + k * 3))); };
  const greenGlow = Wd => { const s = glowSprite(1, 1, 0); s.material.color.set(0x6dffa0); Wd.add(s); return (pos, w, a) => { s.position.set(pos[0], pos[1], pos[2]); s.scale.set(w, w * 1.15, 1); s.material.opacity = a; }; };

  // ---------------------------------------------------------------- 1. HOOK 0-14: the full bench, grey clouds rise above the three friends, Yanky in the middle, a fence behind, big "?"
  function hook(dur) {
    const Wd = world6();
    friends(Wd, 'A', chat);
    ynow(Wd, 'A', t => ({ gesture: t > 8 ? 'think' : null, perform: .25, talk: 0, smile: 0, brow: .55, facing: .22 * Math.sin(t * .7) }));
    stream(Wd, { n: 15, gap: .5, life: 3.8, t0: .6, s: .62 });
    Wd.noQ = true; const qm = qmark(Wd, '#5ec8ff', 1.1), fw = new THREE.Vector3(), up = new THREE.Vector3(), rt = new THREE.Vector3();
    Wd.on((t, cam) => { cam.getWorldDirection(fw); up.set(0, 1, 0).applyQuaternion(cam.quaternion); rt.set(1, 0, 0).applyQuaternion(cam.quaternion);
      const p = cam.position.clone().addScaledVector(fw, 8).addScaledVector(up, 1.25).addScaledVector(rt, -.5); qm.set([p.x, p.y + .08 * Math.sin(t * 1.7), p.z], popE(P(3.0, 4.0, t)) * 1.1, .12 * Math.sin(t * 1.1)); });
    Wd.center = [-6.3, -3.3];
    Wd.cam = cine([C(0, [-6.3, 1.12, -3.3], 4.9, .3, -20, 44, 0), C(5, [-6.3, 1.12, -3.3], 4.5, .25, 2, 44, 0), C(10, [-6.3, 1.12, -3.3], 4.3, .35, 16, 44, 0), C(14, [-6.3, 1.12, -3.3], 4.6, .3, 8, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: the clouds grow; Yanky looks left and right (wall, fence); a sign "nowhere to go"
  function s2(dur) {
    const Wd = world6();
    friends(Wd, 'A', chat);
    ynow(Wd, 'A', t => { const a = .95 * sm(P(2.5, 5, t)) * Math.sin((t - 2.5) * 1.15); return { gesture: null, perform: .25, talk: 0, smile: 0, brow: .6, facing: t < 2.5 ? 0 : a }; });
    stream(Wd, { n: 18, gap: .46, life: 4.0, t0: 0, s: .6, grow: .35 });
    const sg = board(Wd, { w: 2.2, h: .62, cw: 768, frame: 0x6b3a1c, glow: 0xffd27a, draw: drawWord(W_NOWAY, '#fff3c4', '#a30f1c', '#b8870f') }); occ(Wd, sg.g);
    Wd.on(t => { const k = popE(P(5.6, 6.6, t)) * (1 - sm(P(14.6, 15.8, t))); sg.set([LAY.A.Y, 2.3 + .04 * Math.sin(t * 1.5), SZ + .85], k * .85, .035 * Math.sin(t * 1.3)); });
    Wd.center = [-6.3, -3.3];
    Wd.cam = cine([C(0, [-6.5, 1.12, -3.3], 4.7, .3, -24, 44, 0), C(5, [-6.6, 1.12, -3.3], 4.4, .25, 4, 44, 0), C(10, [-6.4, 1.12, -3.3], 4.5, .35, 20, 44, 0), C(16, [-6.3, 1.12, -3.3], 4.7, .3, -6, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-44: Yanky closes his lips (gold zipper), calm folded hands, a soft green glow
  function s3(dur) {
    const Wd = world6(), gg = greenGlow(Wd), sp = motes(Wd, 12, 0xb8ffd0);
    friends(Wd, 'A', chat);
    ynow(Wd, 'A', t => ({ gesture: t < 5 ? null : 'pray', perform: .25, talk: t < 3.2 ? .3 * talkAmt(t, 1) : 0, smile: t > 7 ? .35 : 0, brow: t < 5 ? .6 : .1, facing: t < 3 ? .2 * Math.sin(t * 1.3) : 0 }));
    stream(Wd, { n: 12, gap: .62, life: 4.0, t0: 0, s: .55 });
    const zp = bubble3(Wd, 'zip'); occ(Wd, zp.g);
    Wd.on(t => { zp.set([LAY.A.Y, 1.9 + .05 * Math.sin(t * 2.2), SZ + .1], popE(P(4.0, 4.9, t)) * .55 * (1 + .04 * Math.sin(t * 5)), 1 - sm(P(11.5, 12.6, t)), .06 * Math.sin(t * 3));
      const k = sm(P(5.2, 8.5, t)); gg([LAY.A.Y, 1.15, SZ - .55], 2.6 + 1.6 * k, .62 * k * (.9 + .1 * Math.sin(t * 2.2))); sp(t, [LAY.A.Y, 2.15, SZ], 1.3, k); });
    Wd.center = [-6.7, -3.3];
    Wd.cam = cine([C(0, [-6.6, 1.07, -3.3], 4.6, .3, -22, 44, 0), C(5, [-6.65, 1.02, -3.3], 4.0, .2, 6, 44, 0), C(10, [-6.65, 1.07, -3.3], 4.1, .25, 18, 44, 0), C(14, [-6.6, 1.12, -3.3], 4.5, .3, 4, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-58: a small grey cloud with the word, a friend shrugs, Yanky calm; then the big sign over a grey cloud + red cross
  function s4(dur) {
    const Wd = world6(), gg = greenGlow(Wd);
    seat(Wd, 'A', 'F1', t => chat(t, 0));
    seat(Wd, 'A', 'F2', t => (t > 2.8 && t < 8) ? { gesture: 'shrug', perform: .2, talk: 0, smile: 0, brow: .3 } : chat(t, 1));
    seat(Wd, 'A', 'F3', t => chat(t, 2));
    ynow(Wd, 'A', t => ({ gesture: 'pray', perform: .25, talk: 0, smile: t > 11 ? .3 : 0, brow: .15, facing: 0 }));
    stream(Wd, { n: 8, gap: .9, life: 4.0, t0: 0, until: 5.5, s: .5 });
    const md = bubble3(Wd, 'mad'), sg = board(Wd, { w: 3.0, h: .8, cw: 1024, frame: 0x6b3a1c, glow: 0xff9a9a, draw: drawWord(W_FORBID, '#fff3c4', '#a30f1c', '#b8870f') }),
      x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff8a8a), pk = shock(Wd, 0xd8dde8); occ(Wd, md.g); occ(Wd, sg.g); occ(Wd, x.g);
    Wd.on(t => {
      const grow = P(5.6, 7.2, t), mp = [lerp(-5.55, LAY.A.Y + .1, sm(grow)), lerp(1.85, 1.9, sm(grow)) + .05 * Math.sin(t * 1.6), SZ + .15];
      md.set(mp, popE(P(1.4, 2.4, t)) * lerp(.62, .78, sm(grow)) * (1 + .03 * Math.sin(t * 4)), 1, .05 * Math.sin(t * 2));
      const d = P(6.2, 8.0, t), fall = d < 1 ? (1 - Math.pow(1 - d, 2)) : 1, bounce = t > 8 ? .12 * Math.exp(-(t - 8) * 3.2) * Math.sin((t - 8) * 9) : 0;
      sg.set([LAY.A.Y + .1, t < 6.2 ? 12 : 9 - (9 - 2.62) * fall + bounce + .03 * Math.sin(t * 1.4), SZ - .3], 1, .02 * Math.sin(t * 1.1));
      const xt = 8.6, xk = t > xt ? popE(P(xt, xt + .55, t)) : 0; x.set([LAY.A.Y + .1, 1.9, SZ + .45], xk * .8, .06 * Math.sin(t * 3)); pk.set(mp, P(xt + .5, xt + 1.3, t) * (t > xt + .5 ? 1 : 0), 2.0); sk.set([LAY.A.Y + .1, 1.9, SZ + .5], P(xt, xt + .8, t) * (t > xt ? 1 : 0), 1.4);
      const k = sm(P(8.8, 11, t)); gg([LAY.A.Y, 1.15, SZ - .55], 2.8 + 1.0 * k, .5 * k); });
    Wd.center = [-6.3, -3.3];
    Wd.cam = cine([C(0, [-6.3, 1.17, -3.3], 4.6, .3, -20, 44, 0), C(6, [-6.3, 1.22, -3.3], 4.3, .25, 4, 44, 0), C(10, [-6.3, 1.22, -3.3], 4.5, .35, 16, 44, 0), C(14, [-6.3, 1.22, -3.3], 4.7, .3, 2, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-74: the two-sided plaque turns: side A (fool all his days) green check, side B (wicked one hour) red cross
  const plDraw = (l1, l2, bg, fg, bd) => (c, W, Hh) => {
    c.fillStyle = bg; c.fillRect(0, 0, W, Hh); c.strokeStyle = bd; c.lineWidth = Hh * .05; c.strokeRect(Hh * .07, Hh * .07, W - Hh * .14, Hh - Hh * .14);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.font = `700 ${Hh * .44}px ${FONT}`; c.strokeStyle = '#ffffff'; c.lineWidth = Hh * .04; c.strokeText(l1, W / 2, Hh * .34); c.fillStyle = fg; c.fillText(l1, W / 2, Hh * .34);
    c.font = `700 ${Hh * .27}px ${FONT}`; c.fillText(l2, W / 2, Hh * .74); };
  function plaque(Wd) {
    const w = 3.4, h = 1.4, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(box(w + .2, h + .2, .16, 0x6b3a1c, { pos: [0, 0, -.08] }));
    const fA = texPlane(w, h, plDraw(W_FOOL, W_FOOL2, '#eaffef', '#14612f', '#2fbf5b'), { cw: 1024, opaque: true, ro: 2, depthWrite: true }); fA.position.z = .005; inner.add(fA);
    const fB = texPlane(w, h, plDraw(W_WICKED, W_WICKED2, '#ffecec', '#9a1c1c', '#e03131'), { cw: 1024, opaque: true, ro: 2, depthWrite: true }); fB.position.z = -.165; fB.rotation.y = PI; inner.add(fB);
    const gl = glowSprite(w * 1.7, h * 2.1, .45); gl.position.z = -.4; inner.add(gl);
    return { g, inner, set(pos, s, ry) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); inner.rotation.y = ry || 0; } };
  }
  function s5(dur) {
    const Wd = world6(), gg = greenGlow(Wd);
    friends(Wd, 'A', (t, j) => t < 4 ? chat(t, j) : { gesture: 'think', perform: .3, talk: 0, smile: 0, brow: .4 });
    ynow(Wd, 'A', t => ({ gesture: 'pray', perform: .25, talk: 0, smile: t > 13 ? .45 : 0, brow: .1, facing: 0 }));
    stream(Wd, { n: 6, gap: .8, life: 3.6, t0: 0, until: 3.5, s: .5 });
    const pl = plaque(Wd), ck = mark3d(Wd, 'check', 1.0), cx = mark3d(Wd, 'cross', 1.0), s1 = shock(Wd, 0x7dffa8), s2_ = shock(Wd, 0xff8a8a), s3_ = shock(Wd, 0x7dffa8); [pl, ck, cx].forEach(o => occ(Wd, o.g));
    const PX = -6.3, PY = 2.4, PZ = -3.5, MX = -4.35;
    Wd.on(t => {
      const ry = t < 5.4 ? 0 : (t < 7.6 ? PI * sm(P(5.4, 7.6, t)) : (t < 11 ? PI : PI + PI * sm(P(11, 13, t)))), pop = popE(P(0, 1.2, t));
      pl.set([PX, PY + .04 * Math.sin(t * 1.3), PZ], pop * .78, ry + .03 * Math.sin(t * 1.1));
      const c1 = t > 3 && t < 5.4 ? popE(P(3, 3.55, t)) : (t > 13.2 ? popE(P(13.2, 13.75, t)) : 0), c2 = t > 8.4 && t < 11 ? popE(P(8.4, 8.95, t)) : 0;
      ck.set([MX, PY, PZ + .5], c1 * .75, .06 * Math.sin(t * 3)); cx.set([MX, PY, PZ + .5], c2 * .75, .06 * Math.sin(t * 3));
      s1.set([MX, PY + .05, PZ + .55], P(3, 3.8, t) * (t > 3 ? 1 : 0), 1.3); s2_.set([MX, PY + .05, PZ + .55], P(8.4, 9.2, t) * (t > 8.4 ? 1 : 0), 1.3); s3_.set([MX, PY + .05, PZ + .55], P(13.2, 14, t) * (t > 13.2 ? 1 : 0), 1.3);
      const k = sm(P(12, 15, t)); gg([LAY.A.Y, 1.15, SZ - .55], 2.8 + 1.0 * k, .5 * k); });
    Wd.center = [-6.0, -3.3];
    Wd.cam = cine([C(0, [-6.0, 1.17, -3.3], 4.7, .3, -18, 44, 0), C(6, [-6.0, 1.22, -3.3], 4.4, .25, 6, 44, 0), C(11, [-6.0, 1.22, -3.3], 4.4, .35, 18, 44, 0), C(16, [-6.0, 1.17, -3.3], 4.7, .3, 0, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 74-88: a big "x100" counter ticks up while gold coins and stars pour into a glowing chest beside Yanky
  const CT = {};
  const cntTex = n => CT[n] || (CT[n] = canvasTex(512, 256, (c, W, Hh) => {
    c.fillStyle = '#1d2a5a'; c.fillRect(0, 0, W, Hh); c.strokeStyle = '#ffd34d'; c.lineWidth = 14; c.strokeRect(12, 12, W - 24, Hh - 24);
    c.direction = 'ltr'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.font = `700 ${Hh * .62}px ${FONT}`; c.strokeStyle = '#7a4a00'; c.lineWidth = Hh * .06; c.strokeText('×' + n, W / 2, Hh * .54); c.fillStyle = '#ffd34d'; c.fillText('×' + n, W / 2, Hh * .54); }));
  function counter(Wd) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(box(2.7, 1.45, .14, 0x6b3a1c, { pos: [0, 0, -.08] }));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.25), new THREE.MeshBasicMaterial({ map: cntTex(1), fog: false, toneMapped: false })); inner.add(m);
    const gl = glowSprite(5, 3.4, .5); gl.position.z = -.3; gl.material.color.set(0xffd27a); inner.add(gl); bill(Wd, g);
    return { g, set(pos, s, v, wob) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = wob || 0; m.material.map = cntTex(v); } };
  }
  function chest(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    g.add(box(1.3, .55, .85, 0x8a4a22, { pos: [0, .275, 0] })); for (const x of [-.5, .5]) g.add(box(.12, .57, .88, 0xd9a21b, { pos: [x, .275, 0], ink: false })); g.add(box(.2, .2, .06, 0xffd34d, { pos: [0, .5, .44], ink: false }));
    const hinge = new THREE.Group(); hinge.position.set(0, .55, -.42); g.add(hinge); hinge.add(box(1.3, .16, .85, 0xa05a2a, { pos: [0, .08, .42] })); for (const x of [-.5, .5]) hinge.add(box(.12, .18, .88, 0xd9a21b, { pos: [x, .08, .42], ink: false })); hinge.rotation.x = -1.95;
    const mound = ball(.5, 0xf5c242, { pos: [0, .52, 0], scale: [1.15, .3, .75], ink: false }); mound.material.emissive = new THREE.Color(0x7a5200); g.add(mound);
    const gl = glowSprite(3.2, 2.6, 0); gl.material.color.set(0xffd27a); gl.position.set(0, .9, .1); g.add(gl);
    return { g, set(pos, s, fill, glow) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); mound.scale.set(1.15, .3 + .22 * fill, .75); mound.position.y = .52 + .05 * fill; gl.material.opacity = glow; } };
  }
  const starGeo = (() => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? .06 : .15, a = i / 10 * 2 * PI + PI / 2; if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); return new THREE.ShapeGeometry(s); })();
  function s6(dur) {
    const Wd = world6(), CP = [-3.7, 0, -2.3];
    friends(Wd, 'B', (t, j) => t < 2 ? chat(t, j) : { gesture: j === 1 ? 'wide' : null, perform: .4, talk: .4 * talkAmt(t, j), smile: .7, brow: .1, facing: FAC.B[FR[j]] + .25 });
    ynow(Wd, 'B', t => ({ gesture: t > 8 ? 'thumb' : 'pray', perform: .25, talk: 0, smile: .5, brow: .05, facing: .6 }));
    const ch = chest(Wd), ct = counter(Wd); occ(Wd, ch.g); occ(Wd, ct.g);
    const N = 30, coins = [];
    for (let i = 0; i < N; i++) { const g = new THREE.Group(), star = i % 3 === 2; g.visible = false; Wd.add(g);
      if (star) { const m = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: 0xffe066, side: THREE.DoubleSide, fog: false })); g.add(m); g.scale.setScalar(1.3); }
      else { const c = cyl(.15, .15, .04, 0xf5c242, { rot: [PI / 2, 0, 0], ink: false }); c.material.emissive = new THREE.Color(0x6a4a00); g.add(c); }
      coins.push(g); occ(Wd, g); }
    const sk = shock(Wd, 0xffd27a), sk2 = shock(Wd, 0xfff0a0), sparks = motes(Wd, 12, 0xffe9a0), LIFE = 1.15, GAP = .4, T0 = 1.6;
    const VAL = [[2.0, 1], [2.9, 2], [3.6, 5], [4.3, 10], [5.0, 25], [5.7, 50], [6.5, 100]];
    Wd.on(t => {
      ch.set(CP, popE(P(.2, 1.2, t)), P(1.5, 13, t), .55 + .15 * Math.sin(t * 4) * P(2, 4, t));
      let v = 1; VAL.forEach(([tt, n]) => { if (t >= tt) v = n; });
      const cp = t > 6.5 ? 1 + .1 * Math.exp(-(t - 6.5) * 5) * Math.sin((t - 6.5) * 20) : 1;
      ct.set([CP[0], 2.45 + .04 * Math.sin(t * 1.4), CP[2] - .1], popE(P(1.2, 2.0, t)) * cp * .62, v, .03 * Math.sin(t * 1.2));
      coins.forEach((g, i) => { const e = t - T0 - i * GAP; if (e < 0) { g.visible = false; return; }
        const k = Math.floor(e / (N * GAP)), u = (e - k * N * GAP) / LIFE, sp = T0 + i * GAP + k * N * GAP; if (u >= 1 || sp > 13.4) { g.visible = false; return; }
        const sx = .5 * Math.sin(i * 2.1), tx = .22 * Math.sin(i * 1.7); g.visible = true;
        g.position.set(lerp(CP[0] + sx, CP[0] + tx, u), lerp(3.0, .72, u * u), lerp(CP[2] - .1, CP[2], u)); g.rotation.set(.3 * Math.sin(i), t * 8 + i, 0); });
      const kk = P(6.5, 7.5, t); sk.set([CP[0], 2.45, CP[2] + .2], kk * (t > 6.5 ? 1 : 0), 2.0); sk2.set([CP[0], .8, CP[2] + .3], P(1.5, 2.5, t) * (t > 1.5 ? 1 : 0), .9);
      sparks(t, [CP[0], 1.3, CP[2]], 1.3, sm(P(3, 8, t))); });
    Wd.center = [-4.8, -3.0];
    Wd.cam = cine([C(0, [-5.0, 1.07, -3.0], 5.0, .3, -16, 44, 0), C(5, [-4.9, 1.12, -3.0], 4.6, .25, 6, 44, 0), C(9, [-4.9, 1.12, -3.0], 4.6, .35, 18, 44, 0), C(14, [-4.9, 1.12, -3.0], 5.0, .3, 2, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 88-100: every second of silence a small ray of hidden light gathers above Yanky; the bell; the boys stand
  function bell(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g); const sw = new THREE.Group(); g.add(sw);
    sw.add(cyl(.5, .1, .7, 0xe5b12a, { pos: [0, -.45, 0] })); sw.add(cyl(.55, .5, .1, 0xc9921a, { pos: [0, -.85, 0] })); sw.add(ball(.14, 0x6b4a14, { pos: [0, -.98, 0] })); sw.add(ball(.09, 0xe5b12a, { pos: [0, -.06, 0] }));
    return { g, set(pos, s, ang) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); sw.rotation.z = ang; } };
  }
  function s7(dur) {
    const Wd = world6(), ryz = rays(Wd), gg = greenGlow(Wd), TS = 8.4, YX = LAY.A.Y;
    friends(Wd, 'A', (t, j) => { if (t < TS - .3) return t < 3 ? chat(t, j) : { gesture: null, perform: .3, talk: 0, smile: .3, brow: .2 };
      const mv = P(TS + .2, TS + 1.3, t), x = LAY.A[FR[j]]; return { sit: false, groundY: 0, pos: [x + .15 * (j - 1) * mv, 0, SZ + .8 * sm(mv)], walk: mv > 0 && mv < 1 ? t * 5.6 : undefined, facing: FAC.A[FR[j]] + (j - 1) * -.2, gesture: t > TS + 1.6 ? (j === 1 ? 'cheer' : (j === 0 ? 'wave' : 'thumb')) : null, perform: 0, talk: .5 * talkAmt(t, j), smile: 1, brow: 0 }; });
    ynow(Wd, 'A', t => { if (t < TS - .3) return { gesture: 'pray', perform: .25, talk: 0, smile: .3 + .3 * P(5, 8, t), brow: .05, facing: 0 };
      const mv = P(TS + .2, TS + 1.3, t); return { sit: false, groundY: 0, pos: [YX, 0, SZ + .8 * sm(mv)], walk: mv > 0 && mv < 1 ? t * 5.6 : undefined, facing: 0, gesture: t > TS + 1.6 ? 'thumb' : null, perform: 0, talk: t > TS + 1.2 ? .4 * talkAmt(t, 1) : 0, smile: 1, brow: 0 }; });
    // the light: a glow above Yanky + fan of rays that grows, and one small ray gathers in every second
    const fan = [], N = 7, LC = [YX, 2.35, SZ - .3];
    for (let i = 0; i < 9; i++) { const grp = new THREE.Group(); grp.position.set(LC[0], LC[1] - .4, LC[2]); grp.rotation.z = (i - 4) * .26; Wd.add(grp);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, 3.2), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.y = 1.7; grp.add(m); fan.push(m); }
    const bold = glowSprite(1, 1, 0); bold.material.color.set(0xfff0b0); Wd.add(bold);
    const streaks = []; for (let i = 0; i < N; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.12, .8), new THREE.MeshBasicMaterial({ color: 0xfff6c4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.visible = false; Wd.add(m); streaks.push(m); }
    const lbl = board(Wd, { w: 2.3, h: .62, cw: 640, frame: 0x6b3a1c, glow: 0xffe9a8, draw: drawWord(W_LIGHT, '#fff3c4', '#7a4a00', '#b8870f') }); occ(Wd, lbl.g);
    const bl = bell(Wd), rg = shock(Wd, 0xffe27a), rg2 = shock(Wd, 0xffe27a); occ(Wd, bl.g);
    Wd.add(box(.1, 2.8, .1, 0x555a66, { pos: [-8.4, 1.4, -3.5], ink: false })); Wd.add(box(1.4, .08, .08, 0x555a66, { pos: [-7.75, 2.77, -3.5], ink: false }));
    lighting(Wd, t => ({ hemi: lerp(1.5, 1.8, sm(P(2, 10, t))), sun: lerp(1.9, 2.3, sm(P(2, 10, t))) }));
    const TA = i => 1.2 + i * 1.15;
    Wd.on(t => {
      let n = 0; for (let i = 0; i < N; i++) n += sm(P(TA(i) + .9, TA(i) + 1.2, t));
      const fk = n / N, pulse = .9 + .1 * Math.sin(t * 3);
      bold.position.set(LC[0], LC[1], LC[2]); const bw = 1.1 + 2.4 * fk; bold.scale.set(bw, bw, 1); bold.material.opacity = (.1 + .5 * fk) * pulse;
      fan.forEach((m, i) => m.material.opacity = fk * (.14 + .1 * Math.sin(i * 1.9 + t * 2)));
      streaks.forEach((m, i) => { const e = t - TA(i), u = e / 1.2; if (u < 0 || u >= 1) { m.visible = false; return; } m.visible = true; const sd = i % 2 ? 1 : -1, sx = LC[0] + sd * (1.8 + .2 * (i % 3)), sy = 1.85 + .3 * (i % 3), a = sm(u);
        const px = lerp(sx, LC[0], a), py = lerp(sy, LC[1] - .1, a), dx = LC[0] - sx, dy = LC[1] - .1 - sy; m.position.set(px, py, LC[2] + .25); m.rotation.z = Math.atan2(dy, dx) - PI / 2; m.material.opacity = .95 * Math.sin(PI * Math.min(1, u * 1.05)) ; });
      lbl.set([YX + .6, 2.95, SZ - .3], popE(P(5.5, 6.4, t)) * .8, 1);
      const ang = t > 6.8 ? .5 * Math.sin((t - 6.8) * 7.5) * Math.exp(-(t - 6.8) * .22) : 0; bl.set([-7.95, 2.75, -3.4], popE(P(6.4, 7, t)) * .7, ang);
      rg.set([-7.95, 2.25, -3.1], P(6.9, 8.0, t) * (t > 6.9 ? 1 : 0), 2.6); rg2.set([-7.95, 2.25, -3.1], P(7.8, 8.9, t) * (t > 7.8 ? 1 : 0), 2.6);
      const gk = sm(P(3, 9, t)); gg([YX, 1.2, SZ - .55], 2.4 + 1.2 * gk, .45 * gk); ryz(.35 * sm(P(4, 9, t))); });
    Wd.center = [-6.5, -3.0];
    Wd.cam = cine([C(0, [-6.6, 1.22, -3.3], 4.9, .3, -18, 44, 0), C(5, [-6.6, 1.27, -3.3], 4.6, .25, 4, 44, 0), C(9, [-6.6, 1.27, -3.1], 4.8, .4, 16, 44, 0), C(12, [-6.6, 1.22, -3.0], 5.1, .3, 6, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the boys play ball behind the card
  function answerBg(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd); ry(.8);
    const xs = [-3.4, -1.7, 0, 1.7, 3.4], ids = [3, 4, 1, 5, 6], bl = K.soccer(Wd, .15), per = 1.1;
    const posI = i => [xs[i], 0, .1 + (i % 2) * .3];
    const leg = t => { const k = t / per, a = Math.floor(k) % 5, b = (a + 1) % 5; return [a, b, k - Math.floor(k)]; };
    ids.forEach((id, i) => boyK(Wd, id, t => { const [a, b, k] = leg(t), p = posI(i), to = posI(a === i ? b : a);
      return { pos: p, facing: face(to[0] - p[0], to[2] - p[2]) * .5, gesture: b === i && k > .5 ? 'catchp' : a === i && k < .25 ? 'throwp' : null, perform: .4, smile: 1, talk: .6 * talkAmt(t, i + 2), brow: .1 }; }));
    occ(Wd, bl);
    Wd.on(t => { const [a, b, k] = leg(t), A = posI(a), B = posI(b), p = arcPt([A[0], .16, A[2] + .5], [B[0], .16, B[2] + .5], k, .1); bl.position.set(p[0], p[1], p[2]); bl.rotation.x = t * 9; });
    lighting(Wd, () => ({ hemi: 1.7, sun: 2.1 }));
    Wd.center = [0, 0]; Wd.ansD = 7.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
