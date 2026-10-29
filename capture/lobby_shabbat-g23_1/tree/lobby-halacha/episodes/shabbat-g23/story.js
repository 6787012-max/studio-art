// shabbat-g23 story: "Abba forgot to light - is he included in the fine of an extra candle?" (Azamra 23, Toldot) - 3D choreography per storyboards_v7.md (C).
// Adult man (Abba) + boy (Ari). Nobody lights anything: candlesticks UNLIT in scenes 1-5, ALREADY burning in scenes 6-7 and the answer card. No women anywhere.
// Every world exposes people (.kippa) and occ (moving props).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, boyP, talkAmt, face, mkWorld, plainRoom, diningTable, chair, candle, mark3d, board, drawWord,
    bill, popE, lighting, glowAt, glowSprite, texPlane, toon, bm, canvasTex, FONT, archShape, shock, person, clock } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C0 = (t, tg, d, h, a, fov) => [t, tg, d, h, a, fov === undefined ? 44 : fov, .0001];
  const TY = .72, SIT = { sit: true, groundY: 0 };
  const WARM = new THREE.Color(0xffe2b0), DIMC = new THREE.Color(0xd2bfa0);
  const mix = (a, b, k) => new THREE.Color().copy(a).lerp(b, clamp(k, 0, 1));
  const RB = .17;
  const ARI = 3;
  const SKIN = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
  const CZ = -.22;   // candle line on the table (z offset)

  // ---------------------------------------------------------------- people
  const findKippa = (P_) => { let done = false; return () => { if (done || !P_.figure) return; done = true; P_.figure.group.traverse(m => { if (m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && (Math.abs(m.geometry.parameters.thetaLength - .86) < 1e-3 || m.geometry.parameters.thetaLength === .8)) { P_.kippa = m; m.material = m.material.clone(); m.material.color.set(0x1f2f70); } }); }; };   // the figure lib sizes the kippa itself (28/10): never scale it
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(findKippa(Pn)); return Pn; };
  const manK = (Wd, look, fn, seed) => {   // adult man
    const Pn = person(Wd, Object.assign({ kind: 'man', hat: 'kippa', glasses: false }, look), t => Object.assign({ seed: seed }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(Pn);
    Wd.on(findKippa(Pn)); return Pn;
  };
  const ABBA = { beardLen: .7, beard: '#3a2618', skin: SKIN[2], glasses: false, pants: '#1b1d24', coat: '#26293a' };

  // path helpers (as in g22)
  function mover(keys) {
    const pos = t => { if (t <= keys[0][0]) return [keys[0][1], keys[0][2]]; for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (t < b[0]) { const u = sm(P(a[0], b[0], t)); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; } } const l = keys[keys.length - 1]; return [l[1], l[2]]; };
    const vel = t => { const a = pos(t - .03), b = pos(t + .03); return [(b[0] - a[0]) / .06, (b[1] - a[1]) / .06]; };
    const cum = t => { let s = 0; for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1], L = Math.hypot(b[1] - a[1], b[2] - a[2]); if (t >= b[0]) s += L; else if (t > a[0]) s += L * sm(P(a[0], b[0], t)); } return s; };
    return { pos, vel, cum };
  }
  const angBlend = (a, b, k) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * k; };
  function walker(m, t, stand) {
    const p = m.pos(t), v = m.vel(t), sp = Math.hypot(v[0], v[1]), k = sm(clamp((sp - .06) / .3, 0, 1));
    return { pos: [p[0], 0, p[1]], facing: sp > .02 ? angBlend(stand, face(v[0], v[1]), k) : stand, walk: sp > .07 ? m.cum(t) * 6.3 : undefined, perform: 0 };
  }

  // ---------------------------------------------------------------- room + props
  function sunsetTex() {
    return canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5b6fd0'); gr.addColorStop(.55, '#ff9a5a'); gr.addColorStop(.9, '#ffd27a'); gr.addColorStop(1, '#ffe9a8'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#7a4a4a'; for (const [x, bw, bh] of [[0, 30, 40], [28, 24, 62], [52, 30, 34], [82, 22, 52], [104, 30, 38]]) c.fillRect(x, h - bh, bw, bh); });
  }
  const NIGHT = new THREE.Color(0x3c4a8a), DAYC = new THREE.Color(0xffffff);
  function sunsetWin(Wd, x, y0, z, w, h) {   // returns setK(k): 0 = sunset, 1 = night
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), bm(0xffffff, { map: sunsetTex() })); pn.position.z = .02;
    const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(.13, 20), new THREE.MeshBasicMaterial({ color: 0xfff6d0, transparent: true, opacity: 0, fog: false })); moon.position.set(w * .12, h * .6, .03); g.add(moon);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .05], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
    return k => { pn.material.color.copy(DAYC).lerp(NIGHT, clamp(k, 0, 1)); moon.material.opacity = clamp((k - .4) / .5, 0, 1); };
  }
  function room(Wd, nightFn) {
    const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: 0xf4e8cc, beams: false });
    const ws = [];
    for (const x of [-2.6, 2.6]) { ws.push(sunsetWin(Wd, x, 1.0, -R.HZ + .02, 1.6, 2.1)); for (const dx of [-1, 1]) Wd.add(box(.4, 2.4, .12, 0xd9a05f, { pos: [x + dx * 1.05, 1.9, -R.HZ + .12], ink: false })); }
    Wd.on(t => { const k = nightFn(t); ws.forEach(f => f(k)); });
    Wd.add(box(2.2, .9, .5, 0x7a4a2a, { pos: [-4.2, .45, -R.HZ + .35] })); Wd.add(box(.9, .7, .08, 0x2f5a8a, { pos: [-4.2, 2.0, -R.HZ + .08], ink: false })); Wd.add(box(.78, .58, .09, 0xe9c26a, { pos: [-4.2, 2.0, -R.HZ + .1], ink: false }));
    Wd.add(box(1.5, 2.5, .12, 0x7a4a2a, { pos: [4.5, 1.25, -R.HZ + .08] }));   // the front door (right)
    for (const x of [-4, -1.3, 1.4, 4]) Wd.add(box(.3, .35, 3.4, 0x6a4326, { pos: [x, R.H - .18, -R.HZ + 1.7], ink: false }));
    Wd.add(box(1.4, 2.4, .5, 0x7a4a2a, { pos: [4.2, 1.2, -3.9] }));
    return R;
  }
  function table(Wd, z0) {   // Shabbat table: cloth, challah, plates (candlesticks are separate)
    diningTable(Wd, { x: 0, z: z0, len: 2.8, wid: 1.1, food: false });
    Wd.add(box(.55, .1, .3, 0x244a86, { pos: [0, TY + .1, z0 + .14] })); Wd.add(ball(.16, 0xe3b25a, { pos: [0, TY + .15, z0 + .14], scale: [1.5, .6, 1] }));
    for (const x of [-1.05, -.35, .35, 1.05]) { Wd.add(cyl(.17, .15, .02, 0xffffff, { pos: [x, TY + .07, z0 + .38], ink: false })); Wd.add(cyl(.11, .1, .02, 0xe9eef7, { pos: [x, TY + .09, z0 + .38], ink: false })); }
    for (const x of [-1.05, 1.05]) Wd.add(cyl(.17, .15, .02, 0xffffff, { pos: [x, TY + .07, z0 - .38], ink: false }));
  }
  // two silver candlesticks with candles; flame(t,i) -> 0..1 (0 = unlit)
  function sticks(Wd, z, flame, cx) {
    cx = cx || .55;
    const cs = [-1, 1].map((s, i) => candle(Wd, { pos: [s * cx, TY + .03, z + CZ], h: .2, r: .03, light: { color: 0xffb35a, i: .45, dist: 6 }, glowSize: .6, fs: 1.1, flame: t => flame(t, i) })); cs.forEach(c => c.g.scale.setScalar(1.3));
    return { cs, occ: cs.map(c => c.g) };
  }
  // candelabrum with two sockets (+ a ghost third socket, translucent red); base on y0 at pos
  function candelabrum(Wd, o) {
    const p = o.pos, s = o.s || 1, g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); g.scale.setScalar(s); Wd.add(g);
    const SIL = 0xd8dde6;
    g.add(cyl(.2, .24, .05, SIL, { pos: [0, .025, 0] })); g.add(cyl(.05, .09, .12, SIL, { pos: [0, .11, 0] })); g.add(cyl(.032, .04, .4, SIL, { pos: [0, .35, 0] })); g.add(ball(.065, SIL, { pos: [0, .3, 0], ink: false }));
    g.add(box(.64, .045, .045, SIL, { pos: [0, .34, 0] }));
    for (const sx of [-1, 1]) { g.add(box(.045, .2, .045, SIL, { pos: [sx * .3, .44, 0] })); g.add(cyl(.065, .035, .05, SIL, { pos: [sx * .3, .55, 0] })); }
    g.add(cyl(.065, .035, .05, SIL, { pos: [0, .58, 0] }));
    const cands = [-1, 1].map((sx, i) => { const c = candle(Wd, { pos: [p[0] + sx * .3 * s, p[1] + .575 * s, p[2]], h: .2, r: .03, holder: false, light: { color: 0xffb35a, i: .4, dist: 6 }, glowSize: .6, fs: 1.15, flame: t => o.flame ? o.flame(t, i) : 0 }); c.g.scale.setScalar(s); return c; });
    const gm = () => new THREE.MeshBasicMaterial({ color: 0xff5a5a, transparent: true, opacity: 0, depthWrite: false, fog: false });
    const gm1 = gm(), gm2 = gm();
    const gc = new THREE.Mesh(new THREE.CylinderGeometry(.065, .035, .05, 14), gm1); gc.position.set(0, .58, 0); g.add(gc);
    const gb = new THREE.Mesh(new THREE.CylinderGeometry(.03, .032, .2, 12), gm2); gb.position.set(0, .7, 0); g.add(gb);
    const gl = glowSprite(.9, .9, 0); gl.material.color.set(0xff6a6a); gl.position.set(0, .7, 0); g.add(gl);
    return { g, cands, occ: cands.map(c => c.g), ghost(k, t) { const v = clamp(k, 0, 1) * (.8 + .2 * Math.sin(t * 6)); gm1.opacity = .6 * v; gm2.opacity = .7 * v; gl.material.opacity = .5 * v; } };
  }
  function qmark(Wd) {   // small floating question mark
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(texPlane(.7, .7, (c, W, H) => { c.font = `800 ${H * .9}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = H * .12; c.strokeStyle = '#3a2a05'; c.strokeText('?', W / 2, H / 2 + H * .04); c.fillStyle = '#ffd34a'; c.fillText('?', W / 2, H / 2 + H * .04); }, { cw: 256, ro: 8 }));
    bill(Wd, g);
    return { g, set(pos, sc, rz) { g.visible = sc > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(sc); inner.rotation.z = rz || 0; } };
  }
  function arrow(Wd) {   // chunky grey-red arrow pointing to -x ("away"); set(pos, s)
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(box(.8, .17, .17, 0xb05050, { pos: [.2, 0, 0] }));
    const hd = new THREE.Mesh(new THREE.ConeGeometry(.24, .42, 14), toon(0xb05050)); hd.rotation.z = PI / 2; hd.position.set(-.38, 0, 0); inner.add(hd);
    return { g, set(pos, s) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); } };
  }
  function sparks(Wd, n, center, rad, color, size) {
    const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(size || .14, size || .14, 0); s.material.color.set(color || 0xffe9a8); Wd.add(s); sp.push(s); }
    return t => sp.forEach((s, i) => { const a = i * 2.4 + t * (.4 + (i % 3) * .15); s.position.set(center[0] + Math.cos(a) * rad * (.6 + .4 * ((i * 7) % 5) / 4), center[1] + Math.sin(a * 1.3) * rad * .35 + ((i % 4) - 1.5) * .1, center[2] + Math.sin(a) * rad * .4); s.material.opacity = .3 + .4 * Math.sin(t * 2.2 + i * 1.7) ** 2; });
  }
  function suitcase(Wd) {
    const g = new THREE.Group(); Wd.add(g);
    g.add(box(.5, .34, .2, 0x8a4a2a, { pos: [0, .17, 0] })); g.add(box(.52, .03, .22, 0xe8d9b8, { pos: [0, .2, 0], ink: false })); g.add(box(.2, .04, .05, 0x3a2a1a, { pos: [0, .38, 0] }));
    return g;
  }
  function sunIcon(Wd) {   // a setting sun icon: disc + rays + glow
    const g = new THREE.Group(); Wd.add(g);
    const disc = ball(.34, 0xffc83a, { ink: false }); disc.material = bm(0xffc83a); g.add(disc);
    const rays = new THREE.Group(); g.add(rays); for (let i = 0; i < 10; i++) { const a = i / 10 * 2 * PI, r = box(.1, .26, .05, 0xffd86a, { ink: false }); r.material = bm(0xffd86a); r.position.set(Math.cos(a) * .6, Math.sin(a) * .6, 0); r.rotation.z = a - PI / 2; rays.add(r); }
    const gl = glowSprite(2.4, 2.4, .5); gl.position.z = -.1; g.add(gl); bill(Wd, g);
    return { g, set(pos, k, t) { g.position.set(pos[0], pos[1], pos[2]); rays.rotation.z = t * .3; disc.material.color.setRGB(1, lerp(.78, .42, k), lerp(.23, .12, k)); gl.material.color.setRGB(1, lerp(.85, .5, k), lerp(.5, .25, k)); } };
  }
  const skyW = (o) => mkWorld(Object.assign({ skyTop: 0x6a7fd8, skyBottom: 0xffb37a, fogColor: 0xffc99a, fogNear: 40, fogFar: 140, hemi: 1.15, hemiSky: 0xfff0dc, hemiGround: 0x9a8660, sun: 1.3, sunColor: 0xffd9a8, sunPos: [-14, 26, 16] }, o || {}));
  const light = (Wd, kFn, lo, hi) => lighting(Wd, t => { const k = kFn(t); return { hemi: lerp(hi[0], lo[0], k), sun: lerp(hi[1], lo[1], k), hemiColor: mix(WARM, DIMC, k), sunColor: mix(new THREE.Color(0xfff1dc), new THREE.Color(0xe8dcc8), k) }; });
  const HI = [1.05, .9], LO = [.9, .62];
  const mkPlaque = (Wd, text, w, h) => board(Wd, { w: w, h: h, draw: drawWord(text, '#fff4cf', '#7a1c1c', '#d9a63a'), cw: 768, frame: 0x6b3a1c, glow: 0xffd27a });

  // ---------------------------------------------------------------- 1. HOOK 0-14: Friday afternoon, Ari with a suitcase waves goodbye and leaves; Abba stays alone; the sun starts to set
  function hook(dur) {
    const Wd = skyW(); room(Wd, () => 0); table(Wd, 0); light(Wd, () => 0, LO, HI);
    const cd = sticks(Wd, 0, () => 0), sp = sparks(Wd, 12, [0, 2.2, -.8], 2.2, 0xffe9a8, .13), sc = suitcase(Wd), sun = sunIcon(Wd);
    const mA = mover([[0, 1.7, -1.0], [3.0, 1.7, -1.0], [8.6, 4.0, -3.4]]);
    Wd.on(t => { sp(t); sun.set([2.6, lerp(2.9, 1.45, sm(P(1, 14, t))), -4.2], sm(P(1, 14, t)), t);
      const p = mA.pos(t); sc.visible = t < 10.6; sc.position.set(p[0] + .38, 0, p[1] + .12); sc.rotation.y = .3; });
    const ari = boyK(Wd, ARI, t => { const s = walker(mA, t, t < 3 ? face(-.5, 1) : (t < 10.6 ? face(-.2, 1) : face(-.3, 1)));
      if (t < 3) { s.gesture = 'wave'; s.smile = .9; s.perform = 0; s.look = -.2; } else if (t > 8.8 && t < 10.6) { s.facing = face(-.5, 1); s.gesture = 'wave'; s.smile = .9; s.perform = 0; } else { s.smile = .7; s.look = .1; }
      if (t > 10.6) s.hidden = true; return s; });
    manK(Wd, ABBA, t => ({ pos: [-.8, 0, -1.25], facing: face(.5, 1), gesture: t < 3.4 ? 'wave' : (t < 9.5 ? null : 'think'), perform: t < 3.4 ? 0 : .4, smile: t < 8 ? .8 : .1, brow: t > 9.5 ? .5 : 0, look: t > 8 ? .2 : -.2, talk: t < 3 ? .3 * talkAmt(t, 2) : 0 }), .5);
    Wd.occ = cd.occ.concat([sc]); Wd.center = [0, 0]; Wd.qSize = 1.1; Wd.qPos = [-.9, -.9];
    Wd.cam = cine([C0(0, [.1, 1.1, -1.0], 4.3, 1.1, -14, 44), C0(4, [.7, 1.1, -1.5], 4.5, 1.0, 8, 44), C0(8.5, [1.3, 1.15, -2.0], 4.7, .8, -8, 44), C0(11, [.7, 1.2, -1.5], 4.6, 1.0, 10, 44), C0(14, [.4, 1.15, -1.0], 4.0, 1.0, -8, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: sunset: the window goes dark; Abba comes in from shul, the unlit candlesticks, hand to forehead; clock "already Shabbat"
  function s2(dur) {
    const Wd = skyW(); const nk = t => sm(P(.5, 7, t)); room(Wd, nk); table(Wd, 0); light(Wd, nk, LO, HI);
    const cd = sticks(Wd, 0, () => 0), sp = sparks(Wd, 12, [0, 2.0, -.8], 2.0, 0xffe9a8, .13);
    const clk = clock(Wd, { r: .5 }), lab = mkPlaque(Wd, 'כבר שבת', 1.5, .5);
    const q = qmark(Wd);
    Wd.on(t => { sp(t); clk.set([1.75, 2.05 + .04 * Math.sin(t * 1.5), -.4], .95 * popE(P(8.2, 9.2, t)), 6 + .6 * sm(P(8.4, 12, t)), 0); lab.set([1.75, 1.35 + .03 * Math.sin(t * 1.4), -.4], popE(P(9.4, 10.4, t)) * .85, 0); });
    const mv = mover([[0, 4.1, -3.3], [6.2, .0, -1.55]]);
    manK(Wd, ABBA, t => { const s = walker(mv, t, face(0, 1)); s.smile = 0; s.brow = t > 7.4 ? .6 : .1; s.look = .1;
      if (t >= 7.4 && t < 12) { s.gesture = 'think'; s.perform = 0; } else if (t >= 12.2) { s.gesture = 'shrug'; s.perform = 0; } else s.perform = s.walk === undefined ? .4 : 0; return s; }, .5);
    Wd.occ = cd.occ.concat([clk.g, lab.g]); Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [1.3, 1.1, -2.0], 4.4, 1.0, -12, 44), C0(5, [.6, 1.1, -1.2], 4.0, .9, 8, 44), C0(9, [.7, 1.2, -.8], 3.7, .8, -8, 44), C0(dur, [.5, 1.2, -.7], 3.9, .9, 10, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-46: the plaque "fine: an extra candle every Shabbat" appears; a small question mark hovers toward Abba
  function s3(dur) {
    const Wd = skyW(); room(Wd, () => 1); table(Wd, 0); light(Wd, () => 1, LO, HI);
    const cd = sticks(Wd, 0, () => 0), sp = sparks(Wd, 12, [0, 2.0, -.8], 2.0, 0xffe9a8, .13);
    const pl = mkPlaque(Wd, 'קנס: נר נוסף בכל שבת', 3.0, .72), q = qmark(Wd);
    Wd.on(t => { sp(t);
      pl.set([lerp(-1.0, -.45, sm(P(1.2, 15, t))), 2.45 + .04 * Math.sin(t * 1.5), -.9], popE(P(1.2, 2.4, t)) * .88, .05 * Math.sin(t * .9));
      q.set([lerp(1.9, 1.15, sm(P(5, 15, t))), 1.95 + .1 * Math.sin(t * 2.2), -1.1], popE(P(5, 6, t)) * 1.0, .12 * Math.sin(t * 2.6)); });
    manK(Wd, ABBA, t => ({ pos: [0, 0, -1.55], facing: 0, gesture: t < 7 ? null : (t < 11 ? 'shrug' : 'think'), perform: t < 7 ? .4 : 0, smile: 0, brow: .6, look: .1 + .1 * Math.sin(t * .7) }), .5);
    Wd.occ = cd.occ.concat([pl.g, q.g]); Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [0, 1.3, -1.0], 4.6, 1.0, -12, 44), C0(5, [0, 1.35, -1.0], 4.3, .8, 8, 44), C0(10.5, [.1, 1.35, -1.0], 4.2, .8, -8, 44), C0(dur, [0, 1.35, -1.0], 4.5, .9, 10, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 46-62: the plaque gets the label "said about a woman" (text only) and slides away from Abba; green check over Abba
  function s4(dur) {
    const Wd = skyW(); room(Wd, () => 1); table(Wd, 0); light(Wd, () => 1, LO, HI);
    const cd = sticks(Wd, 0, () => 0), sp = sparks(Wd, 12, [0, 2.0, -.8], 2.0, 0xffe9a8, .13);
    const pl = mkPlaque(Wd, 'קנס: נר נוסף בכל שבת', 3.0, .72), lb = mkPlaque(Wd, 'נאמר באשה', 2.0, .6);
    const ck = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a), q = qmark(Wd);
    Wd.on(t => { sp(t);
      const sl = sm(P(6.4, 11, t)), sc = 1 - sm(P(9.6, 11.4, t));
      pl.set([lerp(-.45, -4.3, sl), lerp(2.45, 2.3, sl) + .04 * Math.sin(t * 1.5), -.9], .88 * sc * popE(P(0, .6, t)), .05 * Math.sin(t * .9) + .25 * sl);
      lb.set([lerp(-1.45, -4.6, sl), lerp(1.9, 1.75, sl) + .03 * Math.sin(t * 1.4), -.85], popE(P(2.6, 3.8, t)) * .9 * sc, .05 * Math.sin(t * 1.1) + .25 * sl);
      q.set([lerp(1.15, 2.4, sm(P(5, 8, t))), 1.95 + .1 * Math.sin(t * 2.2), -1.1], popE(P(0, .4, t)) * (1 - sm(P(5, 7, t))), .12 * Math.sin(t * 2.6));
      ck.set([.95, 2.25 + .04 * Math.sin(t * 2), -1.2], popE(P(10.6, 11.6, t)) * .85, .06 * Math.sin(t * 3)); sk.set([.95, 2.25, -1.2], P(10.6, 11.6, t), 2.6); });
    manK(Wd, ABBA, t => ({ pos: [0, 0, -1.55], facing: 0, gesture: t < 3 ? 'shrug' : (t > 11 ? 'thumb' : null), perform: t < 3 || t > 11 ? 0 : .4, smile: .85 * sm(P(8, 11, t)), brow: .5 * (1 - sm(P(6, 9, t))), look: .1, talk: t > 11.5 ? .25 * talkAmt(t, 4) : 0 }), .5);
    Wd.occ = cd.occ.concat([pl.g, lb.g, ck.g, q.g]); Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [-.2, 1.35, -1.0], 4.6, .9, -12, 44), C0(5, [-.3, 1.35, -1.0], 4.5, .8, 8, 44), C0(9, [-1.2, 1.4, -1.0], 4.4, .8, -6, 44), C0(11.5, [.1, 1.4, -1.0], 4.2, .8, 6, 44), C0(dur, [.1, 1.4, -1.0], 4.0, .8, -8, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 62-76: comparison "man": candelabrum with 2 sockets + green check; the third ghost socket with a red X fades out
  function s5(dur) {
    const Wd = skyW(); room(Wd, () => 1); table(Wd, 0); light(Wd, () => 1, LO, HI);
    const cdl = candelabrum(Wd, { pos: [.2, TY + .03, 0], s: 1.7, flame: () => 0 });
    const lab = mkPlaque(Wd, 'איש', 1.3, .7), ck = mark3d(Wd, 'check', .8), x = mark3d(Wd, 'cross', .75), sk = shock(Wd, 0x6dff9a), sx = shock(Wd, 0xff5a5a);
    const sp = sparks(Wd, 12, [0, 2.0, -.2], 2.2, 0xffe9a8, .13);
    Wd.on(t => { sp(t);
      cdl.ghost(sm(P(.6, 1.6, t)) * (1 - sm(P(8.0, 10.6, t))), t);
      lab.set([-1.5, 1.95 + .04 * Math.sin(t * 1.5), .2], popE(P(.2, 1.2, t)) * .85, .05 * Math.sin(t * 1.1));
      ck.set([1.1, 1.95 + .04 * Math.sin(t * 2), .3], popE(P(3.6, 4.6, t)) * .8, .06 * Math.sin(t * 3)); sk.set([1.1, 1.95, .3], P(3.6, 4.6, t), 2.4);
      const px = P(6.0, 7.0, t), fx = 1 - sm(P(10.6, 11.8, t)); x.set([.2, 2.5 + .04 * Math.sin(t * 2 + 1), .3], popE(px) * .75 * fx, .05 * Math.sin(t * 3)); sx.set([.2, 2.5, .3], px, 2.6); });
    manK(Wd, ABBA, t => ({ pos: [2.7, 0, -.9], facing: face(-.5, 1), gesture: t > 4.6 ? 'thumb' : null, perform: t > 4.6 ? 0 : .4, smile: .9, look: -.2, talk: .25 * talkAmt(t, 6) * sm(P(5, 6, t)) }), .5);
    Wd.occ = cdl.occ.concat([lab.g, ck.g, x.g]); Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [.2, 1.4, -.2], 4.5, .7, -12, 44), C0(4.5, [.4, 1.4, -.2], 4.2, .6, 8, 44), C0(9, [.3, 1.45, -.2], 4.1, .6, -8, 44), C0(dur, [.4, 1.45, -.2], 4.4, .7, 8, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-90: the next Friday night: two candles ALREADY burning (nobody near the flame), Abba sits smiling at the table
  function s6(dur) {
    const Wd = skyW(); room(Wd, () => 1); table(Wd, 0); chair(Wd, 0, -.95, 0, .46);
    lighting(Wd, () => ({ hemi: .98, sun: .62, hemiColor: WARM, sunColor: new THREE.Color(0xe8dcc8) }));
    const cd = sticks(Wd, 0, () => 1, .66), sp = sparks(Wd, 14, [0, 1.8, -.6], 2.2, 0xffe9a8, .14);
    const gl = glowAt(Wd.scene, 5, 0xffc070, .16); gl.position.set(0, 1.3, -.3);
    Wd.on(t => sp(t));
    manK(Wd, ABBA, t => Object.assign({ pos: [0, RB + .0, -.95], facing: 0, smile: .9, perform: .4, look: .1 * Math.sin(t * .7), talk: .35 * talkAmt(t, 3) * sm(P(3, 4, t)), gesture: t > 8 && t < 11 ? 'explain' : null }, SIT), .5);
    Wd.occ = cd.occ; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [0, 1.15, -.5], 3.5, .8, -14, 44), C0(4.5, [0, 1.2, -.5], 3.1, .6, 8, 44), C0(9, [0, 1.2, -.5], 3.0, .6, -8, 44), C0(dur, [0, 1.2, -.5], 3.4, .8, 10, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 90-100: recap: plaque "fine" with an arrow pointing away; candelabrum with 2 burning candles + check; Ari comes home and hugs Abba
  function s7(dur) {
    const Wd = skyW(); room(Wd, () => 1); table(Wd, 0);
    lighting(Wd, () => ({ hemi: .98, sun: .62, hemiColor: WARM, sunColor: new THREE.Color(0xe8dcc8) }));
    const cdl = candelabrum(Wd, { pos: [-.1, TY + .03, 0], s: 1.5, flame: () => 1 });
    const pl = mkPlaque(Wd, 'קנס', 1.5, .62), ar = arrow(Wd), ck = mark3d(Wd, 'check', .8);
    const sp = sparks(Wd, 14, [.2, 1.8, -.4], 2.6, 0xffe9a8, .14);
    Wd.on(t => { sp(t);
      const dr = sm(P(0, 8, t));
      pl.set([lerp(-1.2, -1.5, dr), 2.05 + .04 * Math.sin(t * 1.5), .4], popE(P(0, .8, t)) * .75, .05 * Math.sin(t * 1.1) + .2 * dr);
      ar.set([lerp(-1.2, -1.7, dr), 1.5 + .03 * Math.sin(t * 2), .4], popE(P(.8, 1.8, t)) * .8);
      ck.set([.75, 2.3 + .03 * Math.sin(t * 2), .4], popE(P(1.4, 2.4, t)) * .55, .06 * Math.sin(t * 3)); });
    const mA = mover([[0, 4.3, -3.2], [5.2, 2.5, -.75]]);
    manK(Wd, ABBA, t => ({ pos: [1.75, 0, -.75], facing: t < 4 ? face(-.4, 1) : face(1, 0), gesture: t > 5.4 ? 'wide' : null, perform: t > 5.4 ? 0 : .4, smile: .9, look: .1 }), .5);
    boyK(Wd, ARI, t => { const s = walker(mA, t, face(-1, 0)); if (t > 5.4) { s.gesture = 'wide'; s.perform = 0; } s.smile = .9; s.look = .1; return s; });
    Wd.occ = cdl.occ.concat([pl.g, ar.g, ck.g]); Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [.3, 1.3, -.4], 5.0, .9, -10, 44), C0(4, [.6, 1.3, -.5], 4.6, .8, 6, 44), C0(7, [.9, 1.3, -.6], 4.2, .6, -6, 44), C0(dur, [.8, 1.3, -.6], 4.4, .8, 6, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: Abba and Ari at the burning-candle table behind the card
  function answerBg(dur) {
    const Wd = skyW({ hemi: 1.2, sun: 1.1 }); room(Wd, () => 1); table(Wd, 2.4); chair(Wd, -.55, 2.4 - .95, 0, .46); chair(Wd, .55, 2.4 - .95, 0, .46);
    const cd = sticks(Wd, 2.4, () => 1, 1.15), gl = glowAt(Wd.scene, 6, 0xffc070, .2); gl.position.set(0, 1.2, 2.5);
    const sp = sparks(Wd, 14, [0, 1.6, 2.4], 1.8, 0xffe9a8, .14); Wd.on(t => sp(t));
    manK(Wd, ABBA, t => Object.assign({ pos: [-.55, RB, 1.45], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }, SIT), .5);
    boyK(Wd, ARI, t => Object.assign({ pos: [.55, RB, 1.58], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 3) }, SIT));
    Wd.occ = cd.occ; Wd.center = [0, 1.6]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
