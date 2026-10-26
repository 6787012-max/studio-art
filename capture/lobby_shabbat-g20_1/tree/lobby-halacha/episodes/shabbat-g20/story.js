// shabbat-g20 story: "Guests for Shabbat - how do we have a share in the Shabbat candles?" (Azamra 20) - 3D choreography per storyboards_v4.md (C).
// Boys + adult men only. Nobody lights anything and nobody is shown blessing: the candles light BY THEMSELVES. Every world exposes people (.kippa) and occ.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, plainRoom, diningTable, chair, candle, mark3d, board, drawWord, bubble,
    bill, popE, lighting, glowAt, glowSprite, texPlane, toon, ink, bm, canvasTex, FONT, archShape, arcPt, shock, person, lookOf } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C0 = (t, tg, d, h, a, fov) => [t, tg, d, h, a, fov === undefined ? 44 : fov, .0001];
  const TY = .72, SIT = { sit: true, groundY: 0 };
  const WARM = new THREE.Color(0xffe2b0), DIMC = new THREE.Color(0xc9b9a0);
  const mix = (a, b, k) => new THREE.Color().copy(a).lerp(b, clamp(k, 0, 1));
  const RB = .17;   // seated boys are raised so they sit up above the table
  const YANKY = 3, MENDY = 2, SHUKI = 4, MS = .88;   // Mendy is the younger brother; Shuki the cousin (a bit taller)
  const SKIN = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
  const XS = 40;   // street part of the hook lives at x = 40 (far from the room)
  const CZ = -.22, CX = .55, CY = TY + .04 + .12;   // candle sticks: x = +-CX, z = CZ; base y of the candle body

  // ---------------------------------------------------------------- people
  const darkKippa = (P_) => { let done = false; return () => { const k = P_.kippa; if (k && !done) { done = true; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }; };
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(darkKippa(Pn)); return Pn; };
  const manK = (Wd, look, fn, seed) => {   // adult man (host / uncle), kippa fixed the same way as boys
    const Pn = person(Wd, Object.assign({ kind: 'man', hat: 'kippa', glasses: false }, look), t => Object.assign({ seed: seed }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(Pn);
    let fixed = false; Wd.on(() => { if (fixed || !Pn.figure) return; fixed = true; Pn.figure.group.traverse(m => { if (m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.thetaLength === .8) { m.scale.multiplyScalar(1.22); m.scale.y *= .94; m.rotation.x = 0; Pn.kippa = m; } }); });
    Wd.on(darkKippa(Pn)); return Pn;
  };
  const SABA = { beardLen: 1.2, beard: '#d9d6cf', skin: SKIN[1], glasses: true, pants: '#1b1d24', coat: '#23252e' };
  const LIFTER = { beardLen: .3, beard: '#8a8a8a', skin: SKIN[3], pants: '#1b1d24', coat: '#4a3a30' };
  const UNCLE = { beardLen: .7, beard: '#4a2c18', skin: SKIN[2], pants: '#1b1d24', coat: '#2a2d3a' };

  // ---------------------------------------------------------------- room + props
  function sunsetTex() {
    return canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5b6fd0'); gr.addColorStop(.55, '#ff9a5a'); gr.addColorStop(.9, '#ffd27a'); gr.addColorStop(1, '#ffe9a8'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff2c0'; c.beginPath(); c.arc(w * .6, h * .78, 20, 0, 7); c.fill(); c.fillStyle = '#7a4a4a'; for (const [x, bw, bh] of [[0, 30, 40], [28, 24, 62], [52, 30, 34], [82, 22, 52], [104, 30, 38]]) c.fillRect(x, h - bh, bw, bh); });
  }
  function sunsetWin(Wd, x, y0, z, w, h) {
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), bm(0xffffff, { map: sunsetTex() })); pn.position.z = .02;
    const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .05], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
  }
  function room(Wd, wall, home) {
    const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: wall, beams: false });
    for (const x of [-2.6, 2.6]) { sunsetWin(Wd, x, 1.0, -R.HZ + .02, 1.6, 2.1); for (const dx of [-1, 1]) Wd.add(box(.4, 2.4, .12, home ? 0xd9a05f : 0xb5503a, { pos: [x + dx * 1.05, 1.9, -R.HZ + .12], ink: false })); }
    Wd.add(box(2.2, .9, .5, 0x7a4a2a, { pos: [-4.2, .45, -R.HZ + .35] })); Wd.add(box(.9, .7, .08, 0x2f5a8a, { pos: [-4.2, 2.0, -R.HZ + .08], ink: false })); Wd.add(box(.78, .58, .09, 0xe9c26a, { pos: [-4.2, 2.0, -R.HZ + .1], ink: false }));
    Wd.add(box(1.5, 2.5, .12, 0x7a4a2a, { pos: [4.5, 1.25, -R.HZ + .08] }));
    for (const x of [-4, -1.3, 1.4, 4]) Wd.add(box(.3, .35, 3.4, 0x6a4326, { pos: [x, R.H - .18, -R.HZ + 1.7], ink: false }));
    if (home) Wd.add(box(1.4, 2.4, .5, 0x7a4a2a, { pos: [4.2, 1.2, -3.9] }));
    return R;
  }
  function table(Wd, z, chairs) {   // Shabbat table: cloth, challah, plates (no candles: those are separate). chairs: x list on the back side
    const z0 = z || 0; diningTable(Wd, { x: 0, z: z0, len: 2.8, wid: 1.1, food: false });
    Wd.add(box(.55, .1, .3, 0x244a86, { pos: [0, TY + .1, z0 + .14] })); Wd.add(ball(.16, 0xe3b25a, { pos: [0, TY + .15, z0 + .14], scale: [1.5, .6, 1] }));
    for (const x of [-1.05, -.35, .35, 1.05]) { Wd.add(cyl(.17, .15, .02, 0xffffff, { pos: [x, TY + .07, z0 + .38], ink: false })); Wd.add(cyl(.11, .1, .02, 0xe9eef7, { pos: [x, TY + .09, z0 + .38], ink: false })); }
    for (const x of [-1.05, 1.05]) Wd.add(cyl(.17, .15, .02, 0xffffff, { pos: [x, TY + .07, z0 - .38], ink: false }));
    (chairs || []).forEach(x => chair(Wd, x, z0 - .95, 0, .46));
  }
  function stick(g) {   // small silver candlestick below a candle body (candle body starts at the group origin)
    g.add(cyl(.1, .12, .03, 0xd8dde6, { pos: [0, -.105, 0] })); g.add(cyl(.022, .032, .07, 0xd8dde6, { pos: [0, -.065, 0] })); g.add(cyl(.065, .03, .04, 0xd8dde6, { pos: [0, -.02, 0] }));
  }
  function candles(Wd, z, flame, cx) {
    cx = cx || CX;   // two candles; flame(t, i) -> 0..1; returns {cs, set(dy)}
    const cs = [-1, 1].map((s, i) => { const c = candle(Wd, { pos: [s * cx, CY, z + CZ], h: .17, r: .032, holder: false, light: { color: 0xffb35a, i: .4, dist: 6 }, glowSize: .55, fs: 1.6, flame: t => flame(t, i) }); stick(c.g); return c; });
    return { cs, set(dy, dz) { cs.forEach((c, i) => c.g.position.set((i ? 1 : -1) * cx, CY + dy, z + CZ + (dz || 0))); }, occ: cs.map(c => c.g) };
  }
  function thread(Wd) {   // glowing golden thread between two points with a travelling spark
    const m = new THREE.MeshBasicMaterial({ color: 0xffc83a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const th = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1, 8), m); th.renderOrder = 7; th.visible = false; Wd.add(th);
    const sp = glowSprite(.3, .3, 0); sp.material.color.set(0xfff0b0); Wd.add(sp);
    const up = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3();
    return { set(a, b, k, t, ph) {
      th.visible = k > .01; sp.visible = k > .01; if (k <= .01) return; v.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const L = v.length();
      th.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); th.scale.set(1, Math.max(.001, L * clamp(k * 1.4, 0, 1)), 1); th.quaternion.setFromUnitVectors(up, v.clone().normalize());
      if (k < 1) { const u = k * 1.4; th.position.set(a[0] + v.x * Math.min(u, 1) / 2, a[1] + v.y * Math.min(u, 1) / 2, a[2] + v.z * Math.min(u, 1) / 2); }
      m.opacity = .8 * clamp(k * 2, 0, 1) * (.85 + .15 * Math.sin(t * 6 + (ph || 0)));
      const u = ((t * .5 + (ph || 0) * .37) % 1); sp.position.set(a[0] + v.x * u, a[1] + v.y * u, a[2] + v.z * u); sp.material.opacity = .85 * clamp(k * 2, 0, 1) * Math.sin(PI * u); } };
  }
  function speech(Wd, text, w, h) {   // single-line speech balloon (tail bottom-left), billboarded
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const face = texPlane(w, h, (c, W, H) => { const x0 = W * .03, y0 = H * .03, bw = W * .94, bh = H * .74, R = bh * .42;
      c.lineJoin = 'round'; c.beginPath(); c.roundRect(x0, y0, bw, bh, R); c.moveTo(W * .2, H * .74); c.lineTo(W * .1, H * .98); c.lineTo(W * .4, H * .74); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = W * .014; c.strokeStyle = '#1c2745'; c.stroke();
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; let sz = H * .5; c.font = `700 ${sz}px ${FONT}`; const mw = c.measureText(text).width; if (mw > bw * .8) { sz *= bw * .8 / mw; c.font = `700 ${sz}px ${FONT}`; }
      c.fillStyle = '#c4161c'; c.fillText(text, W / 2, y0 + bh / 2 + sz * .04); }, { cw: 768, ro: 8 });
    inner.add(face); bill(Wd, g);
    return { g, set(pos, sc) { g.visible = sc > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(sc); } };
  }
  function coin(Wd) {   // shiny golden perutah coin
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const body = cyl(.1, .1, .025, 0xffd24a, { rot: [PI / 2, 0, 0] }); body.material.emissive = new THREE.Color(0x6a4a00); inner.add(body);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.1, .014, 8, 28), toon(0xe0a020)); inner.add(rim);
    const gl = glowSprite(1.0, 1.0, .7); gl.material.color.set(0xffe27a); g.add(gl);
    const st = [0, 1, 2, 3].map(i => { const s = glowSprite(.22, .22, 0); s.material.color.set(0xffffff); g.add(s); return s; });
    return { g, set(pos, s, spin, t) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.y = spin || 0; gl.scale.set(s * 1.3 + .3, s * 1.3 + .3, 1); gl.material.opacity = .55 + .25 * Math.sin(t * 7);
      st.forEach((q, i) => { const a = t * 2.4 + i * 1.57; q.position.set(Math.cos(a) * .2 * s, Math.sin(a * 1.3) * .16 * s, .1); q.material.opacity = .4 + .5 * Math.sin(t * 5 + i * 2) ** 2; }); } };
  }
  function sparks(Wd, n, center, rad, color, size) {
    const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(size || .16, size || .16, 0); s.material.color.set(color || 0xffe9a8); Wd.add(s); sp.push(s); }
    return t => sp.forEach((s, i) => { const a = i * 2.4 + t * (.5 + (i % 3) * .2); s.position.set(center[0] + Math.cos(a) * rad * (.6 + .4 * ((i * 7) % 5) / 4), center[1] + Math.sin(a * 1.3) * rad * .4 + ((i % 4) - 1.5) * .1, center[2] + Math.sin(a) * rad * .5); s.material.opacity = .35 + .45 * Math.sin(t * 2.2 + i * 1.7) ** 2; });
  }
  function suitcase(Wd, x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; Wd.add(g);
    g.add(box(.5, .34, .2, 0x8a4a2a, { pos: [0, .17, 0] })); g.add(box(.52, .03, .22, 0xe8d9b8, { pos: [0, .2, 0], ink: false })); g.add(box(.2, .04, .05, 0x3a2a1a, { pos: [0, .38, 0] }));
    return g;
  }
  const skyW = (o) => mkWorld(Object.assign({ skyTop: 0x6a7fd8, skyBottom: 0xffb37a, fogColor: 0xffc99a, fogNear: 40, fogFar: 140, hemi: 1.15, hemiSky: 0xfff0dc, hemiGround: 0x9a8660, sun: 1.3, sunColor: 0xffd9a8, sunPos: [-14, 26, 16] }, o || {}));
  const warmLight = (Wd, kOn, base) => lighting(Wd, t => { const k = kOn(t); return { hemi: lerp(base ? base[0] : .85, 1.05, k), sun: lerp(base ? base[1] : .6, .9, k), hemiColor: mix(DIMC, WARM, k), sunColor: mix(new THREE.Color(0xe8dcc8), new THREE.Color(0xfff1dc), k) }; });
  const standY = 1.3;   // look target height for standing people

  // ---------------------------------------------------------------- 1. HOOK 0-14: street, the boys ring at Saba's door; then the table with unlit candles
  function hook(dur) {
    const Wd = skyW();
    // --- interior (origin)
    room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0);
    suitcase(Wd, -1.9, -1.45, .3); suitcase(Wd, 1.9, -1.35, -.3);
    // --- street (x = XS): the house wall with Saba's door and a bell
    const wx = XS - 3.25;
    Wd.add(box(12, .06, 14, 0xd9cfba, { pos: [XS, .03, 0], ink: false })); Wd.add(box(5, .03, 14, 0x4a4d57, { pos: [XS + 5.5, .015, 0], ink: false }));
    Wd.add(box(.5, 5, 14, 0xf0d9b0, { pos: [wx, 2.5, 0] })); Wd.add(box(.7, .3, 14, 0xc9a574, { pos: [wx, 5.1, 0], ink: false }));
    for (const z of [-4.4, 4.4]) { Wd.add(box(.1, 1.5, 1.3, 0xffe08a, { pos: [XS - 2.98, 2.5, z], ink: false })); Wd.add(box(.2, .12, 1.6, 0xe6d6b2, { pos: [XS - 2.9, 1.7, z], ink: false })); }
    Wd.add(box(.08, 2.34, 1.34, 0xffd890, { pos: [XS - 2.98, 1.17, 0], ink: false }));   // lit doorway
    const gl0 = glowSprite(4, 4, .6); gl0.position.set(XS - 2.8, 1.3, 0); Wd.add(gl0);
    for (const dz of [-.7, .7]) Wd.add(box(.12, 2.4, .08, 0x6b3a1c, { pos: [XS - 2.95, 1.2, dz] })); Wd.add(box(.12, .1, 1.5, 0x6b3a1c, { pos: [XS - 2.95, 2.4, 0] }));
    const hinge = new THREE.Group(); hinge.position.set(XS - 2.88, 0, -.65); Wd.add(hinge); hinge.add(box(.08, 2.3, 1.3, 0xc98a4a, { pos: [0, 1.15, .65] })); hinge.add(box(.03, .8, .9, 0xd9a05f, { pos: [.04, 1.6, .65], ink: false })); hinge.add(box(.03, .8, .9, 0xd9a05f, { pos: [.04, .6, .65], ink: false })); hinge.add(ball(.06, 0xd9a63a, { pos: [.07, 1.1, 1.1] }));
    const bell = box(.06, .16, .16, 0xe9c26a, { pos: [XS - 2.95, 1.4, 1.15] }); Wd.add(bell); const bshock = shock(Wd, 0xffd27a), bgl = glowSprite(.8, .8, 0); bgl.position.set(XS - 2.85, 1.4, 1.15); Wd.add(bgl);
    for (const [x, z] of [[XS + 1.5, -6], [XS + 3, 5.5]]) { Wd.add(cyl(.18, .24, 2.4, 0x7a5232, { pos: [x, 1.2, z] })); Wd.add(ball(1.3, 0x6fae57, { pos: [x, 3.3, z], scale: [1, .9, 1] })); }
    for (const z of [-5, 5]) { Wd.add(cyl(.07, .09, 4, 0x333333, { pos: [XS + 2.3, 2, z] })); const lb = new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff0c0, fog: false })); lb.position.set(XS + 2.3, 4.1, z); Wd.add(lb); const gs = glowSprite(2, 2, .45); gs.position.copy(lb.position); Wd.add(gs); }
    Wd.on(t => { hinge.rotation.y = sm(P(4.5, 5.7, t)) * 1.7; bell.position.x = XS - 2.95 + (t > 3.6 && t < 3.9 ? .03 : 0); bshock.set([XS - 2.85, 1.4, 1.15], P(3.6, 4.5, t), 2.6); bgl.material.opacity = t > 3.6 && t < 4.4 ? .9 * (1 - P(3.6, 4.4, t)) : 0; });
    // --- people (street part before 7 s, room part after)
    const ST = 7.0;
    boyK(Wd, YANKY, t => { if (t >= ST) return { pos: [-1.0, 0, -1.3], facing: .1, gesture: t > 9 ? 'think' : null, perform: t > 9 ? 0 : .5, brow: .5, smile: 0, look: t > 11 ? .4 : -.2 };
      const x = Math.max(XS - 1.5, XS + 3.2 - 1.7 * t), mv = x > XS - 1.5 + .001; return { pos: [x, 0, 0.1], facing: face(-1, 0), walk: mv ? t * 6 : undefined, gesture: mv ? null : 'rest', perform: 0, smile: .5 }; });
    boyK(Wd, MENDY, t => { if (t >= ST) return { pos: [1.0, 0, -1.3], facing: -.1, scale: MS, gesture: t > 11 ? 'shrug' : null, perform: t > 11 ? 0 : .5, brow: .5, smile: 0, look: .3 };
      const x = Math.max(XS - 1.5, XS + 3.2 - 1.7 * t), mv = x > XS - 1.5 + .001; return { pos: [x, 0, 1.15], facing: face(-1, 0), scale: MS, walk: mv ? t * 6.5 : undefined, gesture: mv ? null : (t > 3.0 && t < 4.2 ? 'point' : 'rest'), perform: 0, smile: .5 }; });
    manK(Wd, SABA, t => ({ pos: [XS - 2.55, 0, .05], facing: face(1, .15), hidden: t < 5.0 || t >= ST, gesture: 'wide', perform: 0, smile: 1, talk: .4 * talkAmt(t, 2) }), .5);
    Wd.occ = cd.occ;
    Wd.center = [0, 0]; Wd.qSize = 1.3; Wd.qPos = [0, 2.5, -.6];
    Wd.cam = seq([0, cine([C0(0, [XS - 1.2, 1.1, .6], 6.6, .9, -30, 44), C0(4, [XS - 1.6, 1.15, .6], 5.2, .6, -12, 44), C0(ST, [XS - 2.0, 1.2, .5], 4.6, .4, -4, 44)])],
      [ST, cine([C0(ST, [-.55, 1.0, -.1], 3.4, 1.15, 18, 42), C0(10, [-.1, 1.0, -.2], 3.0, 1.1, -14, 42)])],
      [10, cine([C0(10, [0, 1.15, -.7], 6.0, 1.7, -10, 44), C0(14, [0, 1.2, -.7], 7.4, 2.2, 12, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: flashback - the boys' own home, alone; candles light by themselves; green check
  function s2(dur) {
    const Wd = skyW({ hemi: .95, sun: .8, hemiSky: 0xffe6c0, skyTop: 0x7a8ad8 }); room(Wd, 0xf2d9b8, true); table(Wd, 0, [-.55, .55]);
    const kOn = t => sm(P(4.0, 5.2, t)), cd = candles(Wd, 0, (t, i) => sm(P(3.6 + i * .5, 4.4 + i * .5, t)), 1.15);
    warmLight(Wd, kOn, [.8, .5]);
    const gl = glowAt(Wd.scene, 6, 0xffc070, 0); gl.position.set(0, 1.1, 0); Wd.on(t => gl.material.opacity = .08 * kOn(t));
    const sp = sparks(Wd, 12, [0, 1.3, CZ], 1.5, 0xffe9a8, .13), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    Wd.on(t => { sp(t); ck.set([1.75, 2.0, -.7], popE(P(7.6, 8.6, t)) * .95, .06 * Math.sin(t * 3)); sk.set([1.75, 2.0, -.7], P(7.6, 8.6, t), 3.4); });
    boyK(Wd, YANKY, t => Object.assign({ pos: [-.55, RB, -.82], facing: 0, smile: .3 + .6 * kOn(t), brow: .2 * (1 - kOn(t)), perform: .3, look: (1 - kOn(t)) * .4, talk: kOn(t) > .8 ? .3 * talkAmt(t, 4) : 0 }, SIT));
    boyK(Wd, MENDY, t => Object.assign({ pos: [.55, RB, -.82], facing: 0, scale: MS, smile: .3 + .6 * kOn(t), brow: .2 * (1 - kOn(t)), perform: .35, look: -(1 - kOn(t)) * .4, talk: kOn(t) > .8 ? .25 * talkAmt(t, 5) : 0 }, SIT));
    Wd.occ = cd.occ.concat([ck.g]); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.15, -.5], 4.6, 1.0, 16), C0(4.5, [0, 1.15, -.5], 3.6, .8, -8)])],
      [4.5, cine([C0(4.5, [0, 1.2, -.5], 3.5, .9, -10, 42), C0(9, [.3, 1.25, -.5], 3.8, .9, 12, 42)])],
      [9, cine([C0(9, [.3, 1.25, -.5], 3.8, .9, 12, 42), C0(14, [0, 1.25, -.5], 5.6, 1.3, -14, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-44: at Saba's: Yanky gives the shiny perutah to Saba
  function s3(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0), cn = coin(Wd);
    const tag = board(Wd, { w: 1.0, h: .42, draw: drawWord('פרוטה', '#fff4cf', '#7a1c1c', '#d9a63a'), cw: 512, frame: 0x6b3a1c, glow: 0xffd27a });
    const sp = sparks(Wd, 10, [.45, 1.15, -1.2], .6, 0xfff0b0, .13);
    const YX = -.55, SX = .75, GZ = -1.3, HY = 1.0;
    // the coin: in Yanky's hand, then travels hand to hand, then rests in Saba's hand
    const pos = t => { const u = sm(P(6.0, 7.6, t)); return arcPt([YX + .42, HY, GZ + .02], [SX - .42, HY, GZ + .02], u, .1); };
    Wd.on(t => { sp(t * (t > 5 ? 1 : 0)); const a = popE(P(3.4, 4.2, t)), gone = t > 9.6 ? 1 - P(9.6, 10.4, t) : 1;
      cn.set(pos(t), .75 * a * gone, t * 3, t);
      tag.set([.1, 2.25 + .04 * Math.sin(t * 1.6), -1.0], popE(P(8.4, 9.4, t)) * .8, 0); });
    boyK(Wd, YANKY, t => ({ pos: [YX, 0, GZ], facing: face(1, 0), gesture: t < 3.2 ? 'rest' : (t < 8 ? 'offer' : 'thumb'), perform: 0, smile: .5 + .4 * sm(P(8, 9, t)), look: .2 }));
    boyK(Wd, MENDY, t => ({ pos: [-1.55, 0, GZ + .1], facing: face(1, .4), scale: MS, gesture: null, perform: .4, smile: .6, look: .3, talk: 0 }));
    manK(Wd, SABA, t => ({ pos: [SX, 0, GZ], facing: face(-1, 0), gesture: t < 5.5 ? 'rest' : (t < 9.5 ? 'offer' : 'thumb'), perform: 0, smile: .6 + .4 * sm(P(8.2, 9.2, t)), talk: t > 9.4 ? .3 * talkAmt(t, 7) : 0 }), .6);
    Wd.occ = cd.occ.concat([cn.g, tag.g]); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.1, -.9], 6.4, 1.2, 14), C0(3.6, [0, 1.1, -.9], 4.2, .8, -6)])],
      [3.6, cine([C0(3.6, [.1, 1.0, -1.2], 3.4, .9, -10, 42), C0(8.5, [.1, 1.0, -1.2], 3.0, .8, 12, 42)])],
      [8.5, cine([C0(8.5, [.1, 1.15, -1.0], 3.6, .8, 12, 44), C0(14, [0, 1.15, -.8], 6.0, 1.4, -12, 44), C0(dur, [0, 1.15, -.8], 6.7, 1.45, -2, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-58: golden threads connect the boys to the candlesticks; "partner" tags
  function s4(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0), BZ = -1.3, X = [-1.2, 1.2], th = [0, 1, 2, 3].map(() => thread(Wd));
    const tags = X.map(() => board(Wd, { w: 1.0, h: .42, draw: drawWord('שותף', '#fff4cf', '#1c2745', '#d9a63a'), cw: 512, frame: 0x6b3a1c, glow: 0xffd27a }));
    const sp = sparks(Wd, 14, [0, 1.2, -.6], 1.6, 0xffe9a8, .14);
    Wd.on(t => { sp(t); let n = 0;
      X.forEach((x, bi) => [-1, 1].forEach((s, ci) => { const k = sm(P(1.4 + n * .5, 2.9 + n * .5, t)); th[n].set([x, .95, BZ + .1], [s * CX, CY + .15, CZ], k, t, n); n++; }));
      tags.forEach((tg, i) => tg.set([X[i] + (i ? 1 : -1) * .95, 1.0 + .04 * Math.sin(t * 1.6 + i), BZ + .2], popE(P(5.4 + i * .8, 6.4 + i * .8, t)) * .8, 0)); });
    boyK(Wd, YANKY, t => ({ pos: [X[0], 0, BZ], facing: .15, gesture: t > 8 ? 'thumb' : null, perform: .4, smile: .4 + .55 * sm(P(3, 5, t)), look: .25, talk: t > 6 ? .25 * talkAmt(t, 8) : 0 }));
    boyK(Wd, MENDY, t => ({ pos: [X[1], 0, BZ], facing: -.15, scale: MS, perform: .4, smile: .4 + .55 * sm(P(3, 5, t)), look: -.25, talk: t > 7 ? .25 * talkAmt(t, 9) : 0 }));
    Wd.occ = cd.occ.concat(tags.map(q => q.g)); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.1, -.7], 6.2, 1.9, -18), C0(4.5, [0, 1.1, -.7], 4.8, 1.6, 10)])],
      [4.5, cine([C0(4.5, [0, 1.05, -.7], 4.4, 1.55, 12, 44), C0(9, [0, 1.05, -.7], 4.6, 1.6, -14, 44)])],
      [9, cine([C0(9, [0, 1.1, -.7], 4.8, 1.6, -14, 44), C0(14, [.2, 1.1, -.7], 6.6, 1.9, 12, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-72: the uncle lifts the candlesticks a little (on a tray); "he acquires a share for them"; threads to the boys
  function s5(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0), BZ = -1.0, TZ = CZ;
    const tray = box(1.6, .03, .34, 0xd8dde6, { pos: [0, TY + .06, TZ] }); Wd.add(tray);
    const bub = speech(Wd, 'זוכה עבורם', 2.6, 1.2), th = [0, 1, 2, 3].map(() => thread(Wd));
    const BX = [-1.8, 1.8], lift = t => sm(P(2.4, 3.9, t)) * (1 - sm(P(8.4, 9.8, t))), sp = sparks(Wd, 12, [0, 1.3, TZ], 1.4, 0xffe9a8, .13);
    Wd.on(t => { sp(t); const l = lift(t) * .28; tray.position.set(0, TY + .06 + l, TZ); cd.cs.forEach((c, i) => c.g.position.set((i ? 1 : -1) * CX, CY + l, TZ));
      bub.set([1.0, 2.55, BZ + .3], popE(P(4.2, 5.2, t)) * .7 * (1 - P(8.6, 9.6, t)), undefined);
      let n = 0; BX.forEach(x => [-1, 1].forEach(s => { th[n].set([x, .95, BZ + .3], [s * CX, CY + .15 + l, TZ], sm(P(9.2 + n * .25, 10.4 + n * .25, t)), t, n); n++; })); });
    boyK(Wd, YANKY, t => ({ pos: [BX[0], 0, BZ], facing: face(.6, 1), gesture: null, perform: .4, smile: .5 + .4 * sm(P(9, 11, t)), look: .3 }));
    boyK(Wd, MENDY, t => ({ pos: [BX[1], 0, BZ], facing: face(-.6, 1), scale: MS, perform: .4, smile: .5 + .4 * sm(P(9, 11, t)), look: -.3 }));
    // the host (UNCLE look) stands beside and gestures toward the boys; ANOTHER man (grey short beard) walks to the table and lifts the tray
    manK(Wd, UNCLE, t => ({ pos: [-1.0, 0, BZ + .2], facing: face(-.45, 1), gesture: t > 2.6 && t < 9.8 ? 'point' : 'rest', perform: t > 2.6 && t < 9.8 ? 0 : .3, smile: .6, look: -.2, talk: t > 2.6 && t < 4.2 ? .3 * talkAmt(t, 5) : 0 }), .4);
    manK(Wd, LIFTER, t => { const x = Math.max(0, 1.0 - .8 * t), mv = x > .001; return { pos: [x, 0, BZ + .2], facing: mv ? face(-1, 0) : face(0, 1), walk: mv ? t * 6 : undefined, gesture: mv ? null : (t < 10 ? 'offer' : 'thumb'), perform: 0, smile: .6, talk: t > 4.2 && t < 8 ? .45 * talkAmt(t, 3) : 0 }; }, .2);
    Wd.occ = cd.occ.concat([tray, bub.g]); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.15, -.5], 6.4, 1.4, -16), C0(3.5, [0, 1.1, -.5], 4.6, 1.0, 8)])],
      [3.5, cine([C0(3.5, [0, 1.15, -.5], 4.4, 1.3, 10, 44), C0(8.5, [0, 1.2, -.5], 4.8, 1.4, -12, 44)])],
      [8.5, cine([C0(8.5, [0, 1.15, -.5], 5.0, 1.2, -12, 44), C0(14, [0, 1.2, -.5], 6.4, 1.6, 14, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 72-86: Shuki gives ONE coin for all; threads from the coin to the three boys
  function s6(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0), cn = coin(Wd), BZ = -1.3, X = [-1.7, 0, 1.7], th = [0, 1, 2].map(() => thread(Wd));
    const HOV = [0, .98, -.02], sp = sparks(Wd, 12, HOV, 1.2, 0xfff0b0, .13);
    Wd.on(t => { sp(t); const u = sm(P(3.6, 5.4, t)), p = arcPt([X[0] + .45, 1.0, BZ + .05], HOV, u, .25), a = popE(P(2.4, 3.2, t));
      cn.set(p, .8 * a * (1 + .6 * sm(P(5.4, 6.2, t))), t * 3, t);
      th.forEach((q, i) => q.set(HOV, [X[i], .95, BZ + .1], sm(P(6.0 + i * .45, 7.2 + i * .45, t)), t, i)); });
    boyK(Wd, SHUKI, t => ({ pos: [X[0], 0, BZ], facing: face(.9, 0), scale: 1.04, gesture: t < 2.4 ? 'rest' : (t < 6 ? 'offer' : 'thumb'), perform: 0, smile: .5 + .4 * sm(P(5, 7, t)), look: .1 }));
    boyK(Wd, YANKY, t => ({ pos: [X[1], 0, BZ], facing: .1, perform: .4, smile: .5 + .4 * sm(P(6, 8, t)), look: -.3, talk: 0 }));
    boyK(Wd, MENDY, t => ({ pos: [X[2], 0, BZ], facing: -.15, scale: MS, perform: .4, smile: .5 + .4 * sm(P(6, 8, t)), look: -.3, gesture: null }));
    Wd.occ = cd.occ.concat([cn.g]); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [-.3, 1.1, -.8], 6.0, 1.4, 14), C0(4.0, [-.3, 1.1, -.8], 4.4, 1.0, -8)])],
      [4.0, cine([C0(4.0, [0, 1.05, -.7], 4.4, 1.4, -10, 44), C0(9, [0, 1.05, -.7], 4.2, 1.3, 12, 44)])],
      [9, cine([C0(9, [0, 1.1, -.7], 4.6, 1.2, 12, 44), C0(14, [0, 1.15, -.7], 6.2, 1.6, -12, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 86-100: the candles light BY THEMSELVES; warm light fills the room; the boys smile and sit down
  function s7(dur) {
    const Wd = skyW({ hemi: .8, sun: .5 }); room(Wd, 0xf4e8cc, false); table(Wd, 0, [-.62, 0, .62]);
    const kOn = t => sm(P(1.0, 3.0, t)), cd = candles(Wd, 0, (t, i) => sm(P(.8 + i * .5, 1.8 + i * .5, t)), 1.25);
    warmLight(Wd, kOn, [.8, .5]);
    const gl = glowAt(Wd.scene, 7, 0xffc070, 0); gl.position.set(0, 1.2, -.2); Wd.on(t => gl.material.opacity = .08 * kOn(t));
    const sp = sparks(Wd, 16, [0, 1.4, -.3], 1.8, 0xffe9a8, .14); Wd.on(t => sp(t));
    boyK(Wd, SHUKI, t => Object.assign({ pos: [0, RB, -.82], facing: 0, scale: 1.04, smile: .5 + .5 * kOn(t), perform: .3, look: .1 * Math.sin(t * .7), talk: t > 7 ? .3 * talkAmt(t, 6) : 0 }, SIT));
    boyK(Wd, YANKY, t => Object.assign({ pos: [-.62, RB + .35 * (1 - sm(P(.2, 1.4, t))), -.82], facing: 0, smile: .6 + .4 * sm(P(2, 3.5, t)), perform: .3, look: .15 * Math.sin(t * .8), talk: .3 * talkAmt(t, 7) * sm(P(8, 9, t)) }, SIT));
    boyK(Wd, MENDY, t => Object.assign({ pos: [.62, RB + .35 * (1 - sm(P(.6, 1.8, t))), -.82], facing: 0, scale: MS, smile: .6 + .4 * sm(P(2.4, 4, t)), perform: .3, look: -.15 * Math.sin(t * .8), talk: .25 * talkAmt(t, 8) * sm(P(9, 10, t)) }, SIT));
    Wd.occ = cd.occ; Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.15, -.6], 5.4, 1.2, 16), C0(3.4, [0, 1.2, -.6], 4.2, .9, -8)])],
      [3.4, cine([C0(3.4, [0, 1.2, -.6], 4.2, .9, -10, 44), C0(7, [0, 1.25, -.6], 4.0, .9, 10, 44)])],
      [7, cine([C0(7, [0, 1.25, -.6], 4.0, .9, 10, 44), C0(10.5, [0, 1.25, -.6], 3.4, .8, -8, 42)])],
      [10.5, cine([C0(10.5, [0, 1.25, -.5], 3.4, .8, -8, 42), C0(14, [.2, 1.3, -.5], 5.6, 1.4, 12, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the lit Shabbat table behind the card
  function answerBg(dur) {
    const Wd = skyW({ hemi: 1.2, sun: 1.1 }); room(Wd, 0xf4e8cc, false); table(Wd, 2.4, []); [-.55, .55].forEach(dx => chair(Wd, dx, 2.4 - .95, 0, .46));
    const cd = candles(Wd, 2.4, () => 1, 1.15), gl = glowAt(Wd.scene, 6, 0xffc070, .2); gl.position.set(0, 1.2, 2.5);
    const sp = sparks(Wd, 14, [0, 1.6, 2.4], 1.8, 0xffe9a8, .14); Wd.on(t => sp(t));
    boyK(Wd, YANKY, t => Object.assign({ pos: [-.55, RB, 1.58], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }, SIT));
    boyK(Wd, MENDY, t => Object.assign({ pos: [.55, RB, 1.58], facing: 0, scale: MS, smile: 1, perform: .5, talk: .5 * talkAmt(t, 3) }, SIT));
    Wd.occ = cd.occ; Wd.center = [0, 1.6]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
