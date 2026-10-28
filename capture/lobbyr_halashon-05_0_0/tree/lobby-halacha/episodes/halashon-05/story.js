// halashon-05 story: "even if it costs me my livelihood?" - 3D choreography per storyboards_v6.md (B). Men + one boy only. Everything is a function of time.
// Grey bubbles carry ICONS / one short word only; Hebrew drawn in the 3D world is written as \u escapes. Every world exposes people (.kippa) and occ.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, boyP, talkAmt, face, mkWorld, plainRoom, board, shock, mark3d, qmark,
    popE, lighting, glowSprite, canvasTex, FONT, bill, person, archShape, toon, bm, booksTex, nightWindow } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.14 * d : ly];
  const SKIN = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
  const SHLOIMY = 3;
  const occ = (Wd, g) => { (Wd.occ = Wd.occ || []).push(g); return g; };
  const T_AVODA = 'עבודה', T_PETI = 'פתי?', T_SHIFT = 'המשמרת שלך', T_LAAV = 'לאו',
    T_RACHIL1 = 'לא תלך', T_RACHIL2 = 'רכיל', T_LH = 'לשון הרע', T_NIS = '₪';

  // ---------------------------------------------------------------- people (navy velvet kippot)
  const boyK = (Wd, i, fn) => { const Pp = K.boyP(Wd, i, fn); Wd.on(() => { const k = Pp.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); k.scale.multiplyScalar(1.12); } }); return Pp; };
  const manK = (Wd, look, fn, seed) => {
    const Pn = person(Wd, Object.assign({ kind: 'man', hat: 'kippa', glasses: false }, look), t => Object.assign({ seed: seed }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(Pn);
    let fixed = false; Wd.on(() => { if (fixed || !Pn.figure) return; fixed = true; Pn.figure.group.traverse(m => { if (m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.thetaLength === .8) { m.scale.multiplyScalar(1.22); m.scale.y *= .94; m.rotation.x = 0; Pn.kippa = m; } }); });
    Wd.on(() => { const k = Pn.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } });
    return Pn;
  };
  const LEVI = { beardLen: .8, beard: '#4a2c18', skin: SKIN[1], pants: '#1b1d24', coat: '#2f3342' };
  const COW1 = { beardLen: .5, beard: '#2b2118', skin: SKIN[0], pants: '#26282f', coat: '#4a5a78' };
  const COW2 = { beardLen: .7, beard: '#6a4a2a', skin: SKIN[3], pants: '#1d1f26', coat: '#5a4a3c' };

  // ---------------------------------------------------------------- icons + bubbles (grey = gossip / mockery, cream = other)
  const GREY = { gossip: 1, peti: 1 };
  const ICONS = {
    gossip: (c, cx, cy, r) => {   // a face, crossed out
      c.beginPath(); c.arc(cx, cy, r * .82, 0, 7); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .07; c.strokeStyle = '#3a3320'; c.stroke();
      c.fillStyle = '#3a3320'; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(cx + sx * r * .3, cy - r * .12, r * .08, r * .12, 0, 0, 7); c.fill(); }
      c.lineCap = 'round'; c.lineWidth = r * .09; c.beginPath(); c.arc(cx, cy + r * .5, r * .34, PI * 1.15, PI * 1.85); c.stroke();
      c.strokeStyle = '#d6262e'; c.lineWidth = r * .16; c.beginPath(); c.arc(cx, cy, r * .98, 0, 7); c.stroke(); c.beginPath(); c.moveTo(cx - r * .7, cy - r * .7); c.lineTo(cx + r * .7, cy + r * .7); c.stroke(); },
    peti: (c, cx, cy, r) => {
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${r * 1.45}px ${FONT}`; c.lineJoin = 'round';
      c.strokeStyle = '#ffffff'; c.lineWidth = r * .16; c.strokeText(T_PETI, cx, cy + r * .05); c.fillStyle = '#3a4258'; c.fillText(T_PETI, cx, cy + r * .05); },
    zip: (c, cx, cy, r) => {
      c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); c.roundRect(cx - r * 1.1, cy - r * .3, r * 2.2, r * .6, r * .3); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .1; c.strokeStyle = '#243058'; c.stroke();
      c.lineWidth = r * .09; for (let i = 0; i < 9; i++) { const x = cx - r * .85 + i * r * .2; c.beginPath(); c.moveTo(x, cy - r * .3 * (i % 2 ? .1 : .7)); c.lineTo(x, cy + r * .3 * (i % 2 ? .7 : .1)); c.stroke(); }
      c.beginPath(); c.arc(cx + r * .98, cy, r * .22, 0, 7); c.fillStyle = '#c9ced8'; c.fill(); c.stroke(); },
  };
  const BT = {};
  const bubTex = kind => BT[kind] || (BT[kind] = canvasTex(768, 552, (c, W, H) => {
    const x0 = W * .04, y0 = H * .04, bw = W * .92, bh = H * .74, R = bh * .42;
    c.lineJoin = 'round'; c.beginPath(); c.roundRect(x0, y0, bw, bh, R); c.moveTo(W * .2, H * .74); c.lineTo(W * .1, H * .98); c.lineTo(W * .4, H * .74); c.closePath();
    c.fillStyle = GREY[kind] ? '#dfe2ea' : (kind === 'zip' ? '#dff4ff' : '#ffffff'); c.fill(); c.lineWidth = W * .02; c.strokeStyle = '#1c2745'; c.stroke();
    ICONS[kind](c, W / 2, y0 + bh / 2, bh * (kind === 'peti' ? .36 : .4)); }));
  function bubble3(Wd, kind) {
    const w = 1.6, h = 1.15, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: bubTex(kind), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 8; inner.add(m);
    const gl = glowSprite(w * 2.0, h * 2.2, 0); gl.material.color.set(GREY[kind] ? 0xb7bccb : 0xffe6a0); gl.position.z = -.12; inner.add(gl);
    bill(Wd, g);
    return { g, set(pos, s, a, rz) { const on = s > .01 && (a === undefined || a > .01); g.visible = on; if (!on) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; const al = a === undefined ? 1 : a; m.material.opacity = al; gl.material.opacity = .34 * al; } };
  }
  // a stream of grey "crossed-out face" bubbles that pop up beside the coworkers, rise and fade (always above head height)
  function gossip(Wd, o) {
    const bs = []; for (let i = 0; i < o.n; i++) { const b = bubble3(Wd, 'gossip'); bs.push(b); occ(Wd, b.g); }
    const Pd = o.n * o.gap, until = o.until === undefined ? 1e9 : o.until;
    Wd.on(t => bs.forEach((b, i) => {
      const e = t - o.t0 - i * o.gap; if (e < 0) { b.set([0, 0, 0], 0); return; }
      const k = Math.floor(e / Pd), u = (e - k * Pd) / o.life, spawn = o.t0 + i * o.gap + k * Pd;
      if (u >= 1 || spawn > until) { b.set([0, 0, 0], 0); return; }
      const sx = o.xs[(i + k) % o.xs.length];
      b.set([sx + .12 * Math.sin(u * 5 + i), o.y0 + (o.y1 - o.y0) * sm(u) + .05 * Math.sin(u * 9 + i), o.z], popE(P(0, .18, u)) * o.s * (1 + .05 * Math.sin(u * 8 + i)), 1 - sm(P(.78, 1, u)), .1 * Math.sin(u * 6 + i));
    }));
    return bs;
  }
  const motes = (Wd, n, col) => { const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(.22, .22, 0); s.material.color.set(col); Wd.add(s); sp.push(s); }
    return (t, c, rad, k) => sp.forEach((s, i) => { const a = t * .7 + i * 2.4, r = rad * (.7 + .3 * ((i * 7) % 5) / 4); s.position.set(c[0] + Math.cos(a) * r, c[1] + Math.sin(a * 1.3) * rad * .35, c[2] + .3 + Math.sin(a) * .3); s.material.opacity = k * (.35 + .45 * Math.sin(t * 3 + i * 1.7) ** 2); }); };
  const rays = Wd => { const arr = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 12), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(-8 + i * 2.8, 5, -4 + (i % 2)); m.rotation.z = .4; Wd.add(m); arr.push(m); }
    return k => arr.forEach((m, i) => m.material.opacity = k * (.16 + .06 * Math.sin(i * 2 + k * 3))); };

  // ---------------------------------------------------------------- props: money bag, sefer, hanging sign, zipper at the mouth
  function moneyBag(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    g.add(ball(.2, 0xd2a24c, { pos: [0, .2, 0], scale: [1, .95, 1] })); g.add(cyl(.075, .11, .1, 0xd2a24c, { pos: [0, .41, 0] })); g.add(cyl(.09, .09, .035, 0xb8322e, { pos: [0, .44, 0], ink: false })); g.add(cyl(.15, .08, .12, 0xd2a24c, { pos: [0, .52, 0] }));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.26, .26), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (c, w, h) => { c.font = `700 ${h * .8}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5a3a10'; c.fillText(T_NIS, w / 2, h * .54); }), transparent: true, depthWrite: false, toneMapped: false, fog: false }));
    m.position.set(0, .2, .213); m.renderOrder = 6; g.add(m);
    return { g, set(pos, s, rz) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); g.rotation.z = rz || 0; } };
  }
  function seferProp(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    g.add(box(.8, 1.0, .26, 0x1f3a78, { pos: [0, .5, 0] })); g.add(box(.7, .92, .2, 0xf6ecd0, { pos: [.03, .5, 0], ink: false })); g.add(box(.09, 1.02, .28, 0xc99a2a, { pos: [-.37, .5, 0] }));
    const cv = new THREE.Mesh(new THREE.PlaneGeometry(.7, .9), new THREE.MeshBasicMaterial({ map: canvasTex(384, 480, (c, w, h) => { c.fillStyle = '#1f3a78'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8c04a'; c.lineWidth = 12; c.strokeRect(22, 22, w - 44, h - 44); c.lineWidth = 4; c.strokeRect(40, 40, w - 80, h - 80);
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 92px ${FONT}`; c.fillStyle = '#ffe9a0'; c.fillText(T_RACHIL1, w / 2, h * .38); c.fillText(T_RACHIL2, w / 2, h * .64); }), toneMapped: false, fog: false }));
    cv.position.set(.02, .5, .132); g.add(cv);
    const gl = glowSprite(2.6, 2.8, 0); gl.material.color.set(0xffe08a); gl.position.set(0, .5, -.25); g.add(gl);
    return { g, gl, set(pos, s, glow) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); gl.material.opacity = glow; } };
  }
  function signBoard(Wd, text, w, h, frame, bg, fg) {
    return board(Wd, { w, h, cw: 640, frame, glow: 0xffe6a0, draw: (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = H * .05; c.strokeRect(H * .07, H * .07, W - H * .14, H - H * .14);
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${H * .5}px ${FONT}`; c.fillStyle = fg; c.fillText(text, W / 2, H * .54); } });
  }
  // gold zipper that sits right on the man's mouth (a billboard glued to the head)
  function zipMouth(Wd, pers) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.42, .21), new THREE.MeshBasicMaterial({ map: canvasTex(256, 128, (c, w, h) => { ICONS.zip(c, w / 2, h / 2, 52); }), transparent: true, depthWrite: false, toneMapped: false, fog: false })); m.renderOrder = 9; g.add(m);
    bill(Wd, g); const wp = new THREE.Vector3();
    return { g, set(s, cam) { const k = pers.kippa; g.visible = s > .01 && !!k; if (!g.visible) return; k.getWorldPosition(wp); const dir = cam.position.clone().sub(wp).normalize(); g.position.set(wp.x + dir.x * .2, wp.y - .14 + dir.y * .2, wp.z + dir.z * .2); g.scale.setScalar(s * 1.3); } };
  }

  // ---------------------------------------------------------------- rooms
  const dayTex = () => canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fbcf2'); gr.addColorStop(1, '#eaf6ff'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff'; for (const [x, y, r] of [[34, 70, 20], [60, 62, 26], [86, 74, 18], [80, 150, 18], [58, 156, 24]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.fillStyle = '#6aa65a'; c.fillRect(0, h - 36, w, 36); });
  function win(Wd, x, y0, z, w, h) {
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), bm(0xffffff, { map: dayTex() })); pn.position.z = .02;
    const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .05], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
  }
  function livingRoom(Wd, night) {
    const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: night ? 0xf0dcb4 : 0xf4e8cc, beams: false });
    for (const x of [-2.9, 2.9]) { if (night) nightWindow(Wd, x, 1.0, -R.HZ + .02, 0, 1.5, 2.1); else win(Wd, x, 1.0, -R.HZ + .02, 1.5, 2.1); for (const dx of [-1, 1]) Wd.add(box(.4, 2.4, .12, 0xd9a05f, { pos: [x + dx * 1.0, 1.9, -R.HZ + .12], ink: false })); }
    Wd.add(box(5.2, .012, 3.4, 0x9a3a34, { pos: [.1, .006, -1.4], ink: false })); Wd.add(box(4.8, .016, 3.0, 0xd9a63a, { pos: [.1, .009, -1.4], ink: false })); Wd.add(box(4.5, .02, 2.7, 0x9a3a34, { pos: [.1, .012, -1.4], ink: false }));
    Wd.add(box(1.6, 2.5, .5, 0x7a4a2a, { pos: [-4.6, 1.25, -R.HZ + .35] })); const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.3), toon(0xffffff, { map: booksTex(8) })); sh.position.set(-4.6, 1.25, -R.HZ + .62); Wd.add(sh);
    Wd.add(box(.9, .7, .08, 0x2f5a8a, { pos: [0, 2.5, -R.HZ + .08], ink: false })); Wd.add(box(.78, .58, .09, 0xe9c26a, { pos: [0, 2.5, -R.HZ + .1], ink: false }));
    Wd.add(box(1.0, .5, .6, 0x7a4a2a, { pos: [4.6, .25, -R.HZ + .5] })); Wd.add(cyl(.05, .07, 1.6, 0x555a66, { pos: [4.6, 1.3, -R.HZ + .5] })); Wd.add(ball(.34, 0xfff0c0, { pos: [4.6, 2.2, -R.HZ + .5], ink: false }));
    if (night) { const lg = glowSprite(5.5, 5.5, .6); lg.position.set(4.6, 2.2, -R.HZ + 1.0); Wd.add(lg); }
    return R;
  }
  // a small bright office: windows, a wall of file shelves, a coffee corner, a wall clock
  function office(Wd) {
    const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: 0xf6ecd2, beams: false });
    win(Wd, -4.3, 1.0, -R.HZ + .02, 1.5, 2.2); win(Wd, 4.5, 1.0, -R.HZ + .02, 1.3, 2.2);
    Wd.add(box(2.2, 2.4, .5, 0x7a4a2a, { pos: [-1.9, 1.2, -R.HZ + .3] })); const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.2), toon(0xffffff, { map: booksTex(10) })); sh.position.set(-1.9, 1.2, -R.HZ + .57); Wd.add(sh);
    Wd.add(box(1.4, .9, .6, 0x8a5a34, { pos: [.9, .45, -R.HZ + .5] })); Wd.add(box(.36, .5, .3, 0x4a4f5c, { pos: [.6, 1.15, -R.HZ + .5] })); Wd.add(cyl(.07, .06, .12, 0xfff6e4, { pos: [1.15, .96, -R.HZ + .6] })); Wd.add(cyl(.07, .06, .12, 0xfff6e4, { pos: [1.4, .96, -R.HZ + .5] }));
    Wd.add(cyl(.32, .32, .06, 0xfff6e4, { pos: [.9, 2.7, -R.HZ + .08], rot: [PI / 2, 0, 0] })); Wd.add(box(.03, .24, .02, 0x1c2745, { pos: [.9, 2.78, -R.HZ + .13], ink: false })); Wd.add(box(.2, .03, .02, 0x1c2745, { pos: [.98, 2.7, -R.HZ + .13], ink: false }));
    Wd.add(box(.7, .5, .06, 0x2f5a8a, { pos: [-4.7, 1.8, -R.HZ + .08], ink: false }));
    return R;
  }
  const officeChair = (Wd, x, z, ry) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; Wd.add(g);
    g.add(box(.56, .08, .52, 0x35466a, { pos: [0, .4, 0] })); g.add(box(.56, .6, .08, 0x35466a, { pos: [0, .75, -.26] })); g.add(cyl(.04, .04, .36, 0x555a66, { pos: [0, .2, 0], ink: false })); g.add(cyl(.28, .28, .04, 0x555a66, { pos: [0, .02, 0], ink: false }));
    return g;
  };
  function table(Wd, x, z, w, d) {
    const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g);
    g.add(box(w, .06, d, 0xc99a66, { pos: [0, .74, 0] })); for (const dx of [-1, 1]) for (const dz of [-1, 1]) g.add(box(.06, .72, .06, 0x6a4326, { pos: [dx * (w / 2 - .06), .36, dz * (d / 2 - .06)], ink: false }));
    return g;
  }
  const roomW = () => mkWorld({ skyTop: 0x6fb4f0, skyBottom: 0xfff0d2, hemi: 1.6, sun: 1.8 });

  // shared office layout (z = -1.8): coworkers' table on the left, Levi's desk on the right
  const TBL = [-.8, 0, -1.8], C1P = [-1.75, 0, -1.8], C2P = [.15, 0, -1.8], LP = [3.0, 0, -1.8], DESK = [2.2, 0, -1.8], BAG = [2.15, .77, -1.95];
  const C1F = face(1, .3), C2F = face(-1, .3), LF = face(-1, .3);
  function officeSet(Wd, o) {
    office(Wd); table(Wd, TBL[0], TBL[2], 1.3, 1.0); officeChair(Wd, C1P[0], C1P[2], C1F); officeChair(Wd, C2P[0], C2P[2], C2F);
    Wd.add(box(.3, .02, .22, 0xf4ecd8, { pos: [TBL[0] - .15, .78, TBL[2] + .1], rot: [0, .2, 0], ink: false })); Wd.add(cyl(.06, .05, .1, 0xfff6e4, { pos: [TBL[0] + .3, .8, TBL[2] - .1], ink: false }));
    const dk = table(Wd, DESK[0], DESK[2], .8, 1.5); officeChair(Wd, LP[0], LP[2], LF); Wd.add(box(.3, .02, .22, 0xf4ecd8, { pos: [DESK[0] + .1, .78, DESK[2] + .4], rot: [0, -.2, 0], ink: false }));
    const SIT = { sit: true, groundY: 0 };
    manK(Wd, COW1, t => Object.assign({ hidden: !!(o.hide1 && o.hide1(t)), pos: C1P, facing: C1F + (o.c1 ? o.c1(t) : 0), perform: .35, smile: .35, brow: .1, talk: o.t1 ? .55 * talkAmt(t, 3) * o.t1(t) : 0, gesture: null }, SIT), .3);
    manK(Wd, COW2, t => Object.assign({ pos: C2P, facing: C2F + (o.c2 ? o.c2(t) : 0), perform: .35, smile: .35, brow: .1, talk: o.t2 ? .55 * talkAmt(t, 5) * o.t2(t) : 0, gesture: null }, SIT), .7);
    const lv = manK(Wd, LEVI, t => Object.assign({ pos: LP, facing: LF + (o.lf ? o.lf(t) : 0), perform: o.lp === undefined ? .3 : o.lp, smile: o.ls ? o.ls(t) : .1, brow: o.lb ? o.lb(t) : .1, look: o.ll ? o.ll(t) : 0, talk: 0, gesture: null }, SIT), .5);
    return lv;
  }

  // ---------------------------------------------------------------- 1. HOOK 0-14: Shloimy asks Abba; big "?" over a 3D money bag + a sign "work"
  function hook(dur) {
    const Wd = roomW(); livingRoom(Wd);
    boyK(Wd, SHLOIMY, t => ({ pos: [-1.15 + .03 * Math.sin(t * 1.3), 0, -1.7], facing: face(1, .35), gesture: t < 9.5 ? (t % 5 < 2.6 ? 'explain' : 'point') : 'shrug', perform: .2, talk: t < 9.5 ? .7 * talkAmt(t, 3) : 0, smile: 0, brow: .5, look: .2 }));
    manK(Wd, LEVI, t => ({ pos: [1.15, 0, -1.7], facing: face(-1, .4), gesture: t < 5 ? 'rest' : (t < 10 ? 'think' : 'explain'), perform: .15, talk: 0, smile: .1, brow: .35 }), .5);
    const bag = moneyBag(Wd), sg = signBoard(Wd, T_AVODA, 1.3, .55, 0x6b3a1c, '#fff6dc', '#1c2745'); occ(Wd, bag.g); occ(Wd, sg.g);
    Wd.noQ = true; const qm = qmark(Wd, '#5ec8ff', 1.1), fw = new THREE.Vector3(), up = new THREE.Vector3(), rt = new THREE.Vector3();
    Wd.on((t, cam) => {
      bag.set([0, .95 + .06 * Math.sin(t * 1.7), -1.8], popE(P(.4, 1.4, t)) * 1.5, .08 * Math.sin(t * 1.5));
      sg.set([-.12, 2.2 + .05 * Math.sin(t * 1.4 + 1), -1.9], popE(P(1.0, 2.0, t)), .12 * Math.sin(t * .9)); sg.inner.rotation.z = .04 * Math.sin(t * 1.8);
      cam.getWorldDirection(fw); up.set(0, 1, 0).applyQuaternion(cam.quaternion); rt.set(1, 0, 0).applyQuaternion(cam.quaternion);
      const p = cam.position.clone().addScaledVector(fw, 6).addScaledVector(up, 1.55).addScaledVector(rt, 1.5); qm.set([p.x, p.y + .08 * Math.sin(t * 1.7), p.z], popE(P(3.0, 4.0, t)) * 1.5, .12 * Math.sin(t * 1.1)); });
    Wd.center = [0, -1.7];
    Wd.cam = cine([C(0, [0, 1.0, -1.7], 4.8, .3, -16, 44, 0), C(5, [0, 1.0, -1.7], 4.4, .25, 4, 44, 0), C(10, [0, 1.0, -1.7], 4.3, .3, 14, 44, 0), C(14, [0, 1.0, -1.7], 4.6, .3, 6, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: the office; coworkers talk, grey "crossed-out face" clouds rise; Levi works
  function s2(dur) {
    const Wd = roomW();
    officeSet(Wd, { t1: t => 1, t2: t => 1, c1: t => .12 * Math.sin(t * 1.1), c2: t => .1 * Math.sin(t * 1.3 + 1), lp: .3, ll: t => t > 9 ? .4 : 0 });
    const bg = moneyBag(Wd); occ(Wd, bg.g);
    gossip(Wd, { n: 6, gap: 1.35, life: 3.8, t0: 1.0, until: 9.5, xs: [-1.75, .15], y0: 2.0, y1: 3.1, z: -1.5, s: .66 });
    Wd.on(t => bg.set(BAG, 1.25));
    Wd.center = [.8, -1.8];
    Wd.cam = cine([C(0, [-.8, 1.55, -1.8], 5.0, .35, -18, 44, 0), C(6, [-.4, 1.55, -1.8], 5.3, .3, 6, 44, 0), C(11, [1.3, 1.5, -1.8], 5.5, .3, 12, 44, 0), C(16, [1.3, 1.45, -1.8], 5.2, .3, 0, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-44: Levi does not join; gold zipper on his mouth; back to work; green glow
  function s3(dur) {
    const Wd = roomW();
    const lv = officeSet(Wd, { hide1: t => t > 9.2, t1: t => 1, t2: t => 1, c1: t => .1 * Math.sin(t * 1.1), c2: t => .1 * Math.sin(t * 1.3), lp: .3,
      lf: t => .5 * sm(P(3.6, 5.6, t)), ll: t => t < 3.5 ? .5 : 0, ls: t => .1 + .35 * sm(P(6, 8, t)), lb: t => t < 3.5 ? .35 : .1 });
    const bg = moneyBag(Wd); occ(Wd, bg.g); const zp = zipMouth(Wd, lv);
    const gl = glowSprite(4, 4, 0); gl.material.color.set(0x7dffa8); Wd.add(gl); const sp = motes(Wd, 12, 0xb8ffd0);
    gossip(Wd, { n: 4, gap: 1.35, life: 3.8, t0: .2, until: 1.5, xs: [-1.75, .15], y0: 2.0, y1: 3.1, z: -1.5, s: .66 });
    Wd.on((t, cam) => {
      bg.set(BAG, 1.25); zp.set(popE(P(2.4, 3.3, t)) * (1 + .03 * Math.sin(t * 5)), cam);
      const k = sm(P(4.5, 7.5, t)); gl.position.set(LP[0] - .2, 1.2, LP[2] - .4); gl.scale.set(3.6 + .25 * Math.sin(t * 1.6), 3.6 + .25 * Math.sin(t * 1.6), 1); gl.material.opacity = .62 * k; sp(t, [LP[0] - .2, 1.2, LP[2]], 1.5, k); });
    Wd.center = [1.2, -1.8];
    Wd.cam = cine([C(0, [.8, 1.4, -1.8], 5.8, .3, -10, 44, 0), C(7, [1.1, 1.4, -1.8], 5.3, .25, 4, 44, 0), C(11, [2.3, 1.3, -1.8], 4.4, .25, 12, 44, 0), C(14, [2.1, 1.35, -1.8], 4.6, .3, 4, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-58: a small grey cloud near the coworkers; the "your shift" sign wobbles; the money bag shrinks
  function s4(dur) {
    const Wd = roomW();
    officeSet(Wd, { t1: t => t < 9 ? 1 : .3, t2: t => 1, c2: t => (t > 2 ? .5 * sm(P(2, 3, t)) : 0) + .08 * Math.sin(t * 1.3), c1: t => .1 * Math.sin(t * 1.1), lp: .15, lf: t => .15, lb: t => .1 + .35 * sm(P(4, 7, t)), ls: t => 0 });
    const bg = moneyBag(Wd), cl = bubble3(Wd, 'peti'), sg = signBoard(Wd, T_SHIFT, 1.9, .6, 0x8a2f2a, '#fff6dc', '#8a2f2a'); occ(Wd, bg.g); occ(Wd, cl.g); occ(Wd, sg.g);
    Wd.on(t => {
      cl.set([TBL[0] + .1, 2.35 + .05 * Math.sin(t * 1.5), -1.5], popE(P(1.4, 2.4, t)) * .8 * (1 + .04 * Math.sin(t * 3)), 1, .06 * Math.sin(t * 2));
      const amp = .1 + .12 * sm(P(3, 6, t)); sg.set([2.45, 2.55, -4.25], popE(P(.4, 1.2, t)), 0); sg.inner.rotation.z = amp * Math.sin(t * 3.2) * (1 - .35 * sm(P(9, 14, t)));
      const shrink = 1 - .45 * sm(P(5.5, 9.5, t)); bg.set([BAG[0], BAG[1], BAG[2]], 1.25 * shrink * (1 + .03 * Math.sin(t * 6) * sm(P(5.5, 9.5, t)) * (1 - sm(P(9.5, 10, t)))), .1 * Math.sin(t * 3) * sm(P(5.5, 9.5, t))); });
    Wd.center = [1.2, -1.8];
    Wd.cam = cine([C(0, [.6, 1.6, -1.8], 5.4, .3, -14, 44, 0), C(5, [1.0, 1.65, -1.9], 5.2, .25, 6, 44, 0), C(9, [1.2, 1.55, -1.9], 5.0, .25, 16, 44, 0), C(14, [1.3, 1.5, -1.8], 5.0, .3, 4, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-76: a big balance scale: money bag vs the sefer "do not go as a talebearer"; the sefer side goes down
  function balance(Wd, bag, sef) {
    const g = new THREE.Group(); g.position.set(0, 0, -1.6); Wd.add(g);
    g.add(cyl(.75, .85, .14, 0x8a5a30, { pos: [0, .07, 0] })); g.add(cyl(.09, .13, 2.45, 0xd9a63a, { pos: [0, 1.3, 0] })); g.add(ball(.2, 0xd9a63a, { pos: [0, 2.6, 0] }));
    const beam = new THREE.Group(); beam.position.set(0, 2.6, 0); g.add(beam); beam.add(box(3.5, .12, .14, 0xd9a63a, {})); for (const sx of [-1, 1]) beam.add(ball(.09, 0xb8862a, { pos: [sx * 1.75, 0, 0] }));
    const pans = [-1, 1].map(() => { const p = cyl(.62, .5, .07, 0xd9a63a, {}); g.add(p); return p; });
    const rods = [0, 1, 2, 3].map(() => { const r = box(.025, 1, .025, 0x8a6a2a, { ink: false }); g.add(r); return r; });
    g.add(bag.g); g.add(sef.g);
    const rod = (r, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); r.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0); r.scale.y = L; r.rotation.z = Math.atan2(-dx, dy); };
    return { g, set(th, s) {
      g.scale.setScalar(Math.max(.001, s)); beam.rotation.z = th; const ex = 1.75 * Math.cos(th), ey = 1.75 * Math.sin(th), L = 1.15, out = [];
      [-1, 1].forEach((sx, i) => { const E = [sx * ex, 2.6 + sx * ey], Pc = [E[0], E[1] - L]; pans[i].position.set(Pc[0], Pc[1], 0); rod(rods[i * 2], E, [Pc[0] - .55, Pc[1] + .03]); rod(rods[i * 2 + 1], E, [Pc[0] + .55, Pc[1] + .03]); out.push([Pc[0], Pc[1] + .04]); });
      return out; } };
  }
  function s5(dur) {
    const Wd = roomW(); office(Wd);
    manK(Wd, LEVI, t => ({ pos: [-3.3, 0, -1.2], facing: face(1, .35), gesture: t < 8 ? 'think' : 'heart', perform: .1, talk: 0, smile: t < 8 ? 0 : .6, brow: t < 8 ? .3 : 0 }), .5);
    const bag = moneyBag(Wd), sef = seferProp(Wd), bal = balance(Wd, bag, sef), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x7dffa8); occ(Wd, ck.g);
    const gl = glowSprite(5, 5, 0); gl.material.color.set(0x7dffa8); Wd.add(gl); const mt = motes(Wd, 14, 0xffe08a);
    Wd.on(t => {
      const th = -.36 * popE(P(4.2, 6.8, t)) + .05 * Math.sin(t * 1.4) * (1 - sm(P(3.5, 5, t))) + .012 * Math.sin(t * 2.6) * sm(P(8, 9, t));
      const pp = bal.set(th, popE(P(0, 1.2, t)));
      bag.set([pp[0][0], pp[0][1], 0], popE(P(.9, 1.7, t)) * 1.25, .04 * Math.sin(t * 2));
      sef.set([pp[1][0], pp[1][1], 0], popE(P(1.8, 2.7, t)) * 1.2, .35 + .2 * Math.sin(t * 2.2) + .35 * sm(P(5, 8, t)));
      const kk = t > 7.2 ? popE(P(7.2, 7.8, t)) : 0; ck.set([1.2, 3.35, -1.2], kk * .95, .05 * Math.sin(t * 3)); sk.set([1.2, 3.35, -1.1], P(7.2, 8.0, t) * (t > 7.2 ? 1 : 0), 1.4);
      gl.position.set(pp[1][0], pp[1][1] + .6, -2.1); gl.scale.set(4.2, 4.2, 1); gl.material.opacity = .5 * sm(P(6, 9, t)); mt(t, [pp[1][0], pp[1][1] + .6, -1.6], 1.5, sm(P(5.5, 8.5, t))); });
    Wd.center = [-.2, -1.6];
    Wd.cam = cine([C(0, [-.3, 1.85, -1.6], 6.4, .35, -14, 44, 0), C(5, [-.2, 1.85, -1.6], 5.9, .3, 4, 44, 0), C(11, [.1, 1.85, -1.6], 5.7, .3, 14, 44, 0), C(18, [-.2, 1.85, -1.6], 6.1, .3, 2, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-90: three golden plaques "lav", "lav", "lav" - lashon hara among them, same frame
  function plaqueDraw(i) {
    return (c, W, H) => { c.fillStyle = '#fff6dc'; c.fillRect(0, 0, W, H); c.strokeStyle = '#b8870f'; c.lineWidth = H * .035; c.strokeRect(H * .05, H * .05, W - H * .1, H - H * .1);
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      if (i === 1) {
        c.font = `800 ${H * .42}px ${FONT}`; c.fillStyle = '#1c2745'; c.fillText(T_LAAV, W / 2, H * .34);
        c.beginPath(); c.roundRect(W * .1, H * .6, W * .8, H * .26, H * .08); c.fillStyle = '#ffe9a0'; c.fill(); c.lineWidth = H * .02; c.strokeStyle = '#b8870f'; c.stroke();
        c.font = `800 ${H * .2}px ${FONT}`; c.fillStyle = '#7a1c1c'; c.fillText(T_LH, W / 2, H * .735);
      } else { c.font = `800 ${H * .5}px ${FONT}`; c.fillStyle = '#1c2745'; c.fillText(T_LAAV, W / 2, H * .45); c.fillStyle = '#d9a63a'; for (const dx of [-1, 0, 1]) { c.beginPath(); c.arc(W / 2 + dx * W * .1, H * .82, H * .035, 0, 7); c.fill(); } }
    };
  }
  function s6(dur) {
    const Wd = roomW(); office(Wd); const ryz = rays(Wd), mt = motes(Wd, 16, 0xffe08a);
    const CX = [-2.55, 0, 2.55], CY = 2.2, T = [.9, 2.6, 4.3];
    const pl = CX.map((x, i) => board(Wd, { w: 2.3, h: 1.65, cw: 768, frame: 0xd9a63a, glow: 0xffd27a, draw: plaqueDraw(i) }));
    const sh = glowSprite(2.6, 4.2, 0); sh.material.color.set(0xfff0b0); Wd.add(sh);
    const sks = CX.map(() => shock(Wd, 0xffd27a));
    pl.forEach(p => occ(Wd, p.g));
    Wd.on(t => {
      pl.forEach((p, i) => { const k = popE(P(T[i] - .4, T[i] + .4, t)); p.set([CX[i], CY + .06 * Math.sin(t * 1.4 + i) + (t > T[i] - .4 ? .25 * Math.exp(-(t - T[i] + .4) * 3.2) * Math.sin((t - T[i] + .4) * 13) : 0), -1.6], k * 1.0, .1 * Math.sin(t * .8 + i)); p.inner.rotation.z = .02 * Math.sin(t * 1.3 + i); sks[i].set([CX[i], CY, -1.5], P(T[i], T[i] + .9, t) * (t > T[i] ? 1 : 0), 1.8); });
      const u = P(6.5, 12, t), sx = lerp(-4.2, 4.2, sm(u)); sh.position.set(sx, CY, -1.3); sh.material.opacity = .55 * Math.sin(PI * u) * (u > 0 && u < 1 ? 1 : 0);
      ryz(.45 * sm(P(3, 8, t))); mt(t, [0, CY, -1.2], 4.2, sm(P(3, 7, t))); });
    Wd.center = [0, -1.6];
    Wd.cam = cine([C(0, [0, 2.1, -1.6], 6.8, .35, -18, 44, 0), C(5, [0, 2.1, -1.6], 6.3, .3, 0, 44, 0), C(9, [0, 2.1, -1.6], 6.0, .3, 14, 44, 0), C(14, [0, 2.1, -1.6], 6.4, .3, 4, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 90-100: evening, Levi comes home, Shloimy runs to him; warm light; small check over the zipper icon
  function s7(dur) {
    const Wd = mkWorld({ skyTop: 0x2a3a6e, skyBottom: 0xf6c890, hemi: 1.6, sun: 1.2 }); livingRoom(Wd, true);
    lighting(Wd, t => ({ hemi: lerp(1.5, 1.75, sm(P(3, 9, t))), sun: lerp(1.1, 1.4, sm(P(3, 9, t))) }));
    const ryz = rays(Wd), mt = motes(Wd, 12, 0xffe6a0), sparks = motes(Wd, 12, 0xb8ffd0);
    const lx = t => lerp(4.4, 1.5, sm(P(0, 3.4, t))), sx = t => lerp(-3.6, .35, sm(P(.8, 3.2, t)));
    manK(Wd, LEVI, t => { const mv = t < 3.4; return { pos: [lx(t), 0, -1.7], facing: mv ? face(-1, .1) : face(-1, .25), walk: mv ? t * 5.6 : undefined, gesture: !mv ? (t < 6.5 ? 'offer' : 'heart') : null, perform: 0, talk: 0, smile: t > 3.2 ? .9 : .3, brow: 0 }; }, .5);
    boyK(Wd, SHLOIMY, t => { const mv = t > .8 && t < 3.2; return { pos: [sx(t), 0, -1.7], facing: mv || t < .8 ? face(1, .1) : face(1, .15), walk: mv ? t * 9 : undefined, gesture: t < .8 ? 'rest' : (t > 3.2 ? (t < 6.5 ? 'up' : 'thumb') : null), perform: 0, talk: t > 3.6 ? .5 * talkAmt(t, 3) : 0, smile: t > 3 ? 1 : .5, brow: 0 }; });
    const zi = bubble3(Wd, 'zip'), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x7dffa8); occ(Wd, zi.g); occ(Wd, ck.g);
    Wd.on(t => {
      zi.set([.95, 2.45 + .05 * Math.sin(t * 1.8), -1.7], popE(P(3.4, 4.2, t)) * .85 * (1 + .03 * Math.sin(t * 5)), 1, .06 * Math.sin(t * 2.4));
      const kk = t > 4.4 ? popE(P(4.4, 5.0, t)) : 0; ck.set([1.95, 2.45, -1.5], kk * .6, .05 * Math.sin(t * 3)); sk.set([1.95, 2.45, -1.4], P(4.4, 5.2, t) * (t > 4.4 ? 1 : 0), 1.1);
      ryz(.4 * sm(P(2, 8, t))); mt(t, [.8, 2.0, -1.7], 3.6, sm(P(2, 6, t))); sparks(t, [.9, 2.4, -1.7], 2.0, sm(P(4.4, 7, t))); });
    Wd.center = [.8, -1.7];
    Wd.cam = cine([C(0, [1.0, 1.3, -1.7], 5.6, .35, -18, 44, 0), C(4, [.9, 1.4, -1.7], 4.6, .3, 4, 44, 0), C(7, [.9, 1.4, -1.7], 4.3, .25, 14, 44, 0), C(10, [.9, 1.4, -1.7], 4.1, .25, 8, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the office, calm and friendly, behind the card
  function answerBg(dur) {
    const Wd = roomW(); office(Wd); const ry = rays(Wd); ry(.7);
    const xs = [-2.6, 0, 2.6];
    [[COW1, 0, .3, 'explain'], [LEVI, 1, .5, 'thumb'], [COW2, 2, .7, 'explainA']].forEach(([lk, i, sd, g]) => manK(Wd, lk, t => ({ pos: [xs[i], 0, .1], facing: face(i === 1 ? 0 : (i === 0 ? .5 : -.5), 1), gesture: i === 1 ? 'thumb' : (t % 6 < 3 ? g : null), perform: .3, smile: .8, brow: 0, talk: i === 1 ? 0 : .4 * talkAmt(t, i + 2) }), sd));
    lighting(Wd, () => ({ hemi: 1.7, sun: 2.1 }));
    Wd.center = [0, 0]; Wd.ansD = 7.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
