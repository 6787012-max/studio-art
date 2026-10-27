// shabbat-g21 story: "How do guests acquire a share in the Shabbat candles?" (Azamra 21) - 3D choreography per storyboards_v5.md (C).
// Boys + adult men only. Nobody lights anything: candles stay UNLIT in scenes 1-6 and light BY THEMSELVES in scene 7. Every world exposes people (.kippa) and occ.
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

  // ---------------------------------------------------------------- g21 props + people
  const NEIGH = Object.assign({}, LIFTER);                                              // the neighbour (the "other")
  const SON = { beardLen: .35, beard: '#3a2618', skin: SKIN[0], pants: '#1b1d24', coat: '#1f3a5a' };   // married son who lives elsewhere
  const mkTag = (Wd, text, w) => board(Wd, { w: w || 1.5, h: .44, draw: drawWord(text, '#fff4cf', '#7a1c1c', '#d9a63a'), cw: 512, frame: 0x6b3a1c, glow: 0xffd27a });
  function door(Wd, txt) {   // glowing numbered door; set(pos, scale, open 0..1, t)
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(box(1.06, 1.78, .1, 0x6b3a1c, { pos: [0, 0, -.02] }));
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(.88, 1.6), bm(0xfff0b0)); gl.position.z = .04; inner.add(gl);
    const hinge = new THREE.Group(); hinge.position.set(-.44, 0, .06); inner.add(hinge);
    hinge.add(box(.88, 1.6, .06, 0xc98a4a, { pos: [.44, 0, 0] }));
    const num = texPlane(.62, .72, (c, W, H) => { c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `800 ${H * .8}px ${FONT}`; c.lineJoin = 'round'; c.lineWidth = H * .1; c.strokeStyle = '#fff6d0'; c.strokeText(txt, W / 2, H / 2); c.fillStyle = '#8a1c1c'; c.fillText(txt, W / 2, H / 2); }, { cw: 256, ro: 5 });
    num.position.set(.44, 0, .05); hinge.add(num);
    const halo = glowSprite(3, 3.4, .5); halo.position.z = -.12; inner.add(halo);
    return { g, set(pos, s, open, t) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); hinge.rotation.y = -(open || 0) * 1.55; halo.material.opacity = .45 + .15 * Math.sin(t * 3 + s); g.rotation.y = .12 * Math.sin(t * .9); } };
  }
  function cloth(Wd) {   // the neighbour's own soft fabric handkerchief: navy check with a light border, draped with soft folds
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    const tex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#243f7a'; c.fillRect(0, 0, w, h); c.fillStyle = '#35559a'; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) c.fillRect(x * 28 + 16, y * 28 + 16, 28, 28);
      c.strokeStyle = '#f2ead2'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14); c.lineWidth = 5; c.strokeRect(30, 30, w - 60, h - 60); });
    const N = 14, S = .56, geo = new THREE.PlaneGeometry(S, S, N, N); geo.rotateX(-PI / 2);
    const mat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }); const mesh = new THREE.Mesh(geo, mat); g.add(mesh);
    const pos = geo.attributes.position, bx = [], bz = []; for (let k = 0; k < pos.count; k++) { bx.push(pos.getX(k)); bz.push(pos.getZ(k)); }
    return { g, set(p, s, t, grab) { g.visible = s > .01; if (!g.visible) return; g.position.set(p[0], p[1], p[2]); g.scale.setScalar(s); grab = grab || 0;
      for (let k = 0; k < pos.count; k++) { const u = bx[k], v = bz[k], d = (S / 2 - u) / S;   // d: 0 at the neighbour's hand edge (+x), 1 at the far edge
        const hang = -.5 * d * d * (1 - grab * .6), sagM = -.16 * Math.sin(PI * d) * grab, corner = -.22 * (v / (S / 2)) ** 2 * (.4 + .6 * grab) * (.3 + d);
        const fold = .03 * Math.sin(v * 22 + d * 5 + t * 1.3) * (.4 + d) + .018 * Math.sin(u * 30 - t * 1.7);
        pos.setY(k, hang + sagM + corner + fold); }
      pos.needsUpdate = true; geo.computeVertexNormals(); mesh.rotation.z = .04 * Math.sin(t * 1.4); } };
  }
  function greyOut(Pn, k) {   // desaturate a figure (the household) - kippa stays dark and readable
    let done = false; return t => { const F = Pn.figure; if (done || !F) return; done = true; const gc = new THREE.Color(0x9a9a9a);
      F.group.traverse(m => { if (m.isMesh && m !== Pn.kippa && m.material && m.material.color) { m.material = m.material.clone(); m.material.color.lerp(gc, k); } }); };
  }
  const pedestal = (Wd, x, y, z, col) => { Wd.add(cyl(.62, .68, .07, col, { pos: [x, y, z] })); const g = glowSprite(2.2, 2.2, .35); g.position.set(x, y + .02, z); g.rotation.x = 0; Wd.add(g); };

  // ---------------------------------------------------------------- 1. HOOK 0-14: Saba's table with UNLIT candles, the guests with suitcases, three glowing numbered doors float above
  function hook(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0), sp = sparks(Wd, 14, [0, 2.2, -.8], 2.2, 0xffe9a8, .14);
    const sc1 = suitcase(Wd, -2.0, -.95, .3), sc2 = suitcase(Wd, 2.0, -.95, -.3);
    const ds = [door(Wd, '1'), door(Wd, '2'), door(Wd, '3')], DX = [-1.8, 0, 1.8];
    Wd.on(t => { sp(t); ds.forEach((d, i) => d.set([DX[i], 2.45 + .08 * Math.sin(t * 1.6 + i * 2), -1.6], .62 * popE(P(1.0 + i * .6, 1.9 + i * .6, t)), .35 + .25 * Math.sin(t * 1.4 + i), t)); });
    boyK(Wd, YANKY, t => ({ pos: [-1.3, 0, -1.2], facing: face(.3, 1), gesture: t > 6 ? (t < 9 ? 'point' : 'think') : null, perform: t > 6 ? 0 : .5, brow: .4, smile: .2, look: t > 4 ? .3 : -.2 }));
    boyK(Wd, MENDY, t => ({ pos: [1.3, 0, -1.2], facing: face(-.3, 1), scale: MS, gesture: t > 8 ? (t < 11 ? 'shrug' : 'think') : null, perform: t > 8 ? 0 : .5, brow: .4, smile: .2, look: -.3 }));
    manK(Wd, SABA, t => ({ pos: [0, 0, -1.55], facing: 0, gesture: t < 5 ? 'wide' : null, perform: t < 5 ? 0 : .4, smile: 1, talk: .4 * talkAmt(t, 2) }), .5);
    Wd.occ = cd.occ; Wd.center = [0, 0]; Wd.qSize = 1.1; Wd.qPos = [.9, -.5, -.6];
    Wd.cam = seq([0, cine([C0(0, [0, 1.75, -.7], 5.8, 1.5, -14, 46), C0(5, [0, 1.7, -.7], 5.0, 1.2, 8, 46)])],
      [5, cine([C0(5, [0, 1.7, -.7], 5.0, 1.2, 8, 46), C0(10, [0, 1.65, -.7], 4.7, 1.0, -10, 46)])],
      [10, cine([C0(10, [0, 1.65, -.7], 4.7, 1.0, -10, 46), C0(14, [0, 1.75, -.7], 5.6, 1.5, 12, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: door 1 = money. Yanky gives a coin to Saba; then the neighbour gives a coin "for them"
  function s2(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0), cn1 = coin(Wd), cn2 = coin(Wd), dr = door(Wd, '1'), tag = mkTag(Wd, '1 — כסף'), th = [0, 1, 2, 3].map(() => thread(Wd));
    const sp = sparks(Wd, 12, [0, 1.5, -1.0], 2.0, 0xfff0b0, .13);
    const MX = -1.75, YX = -.55, SX = .75, NX = 2.05, GZ = -1.3, HY = 1.0;
    const p1 = t => arcPt([YX + .42, HY, GZ + .02], [SX - .42, HY, GZ + .02], sm(P(4.4, 6.0, t)), .1);
    const p2 = t => arcPt([NX - .42, HY, GZ + .02], [SX + .42, HY, GZ + .02], sm(P(10.0, 11.6, t)), .1);
    Wd.on(t => { sp(t);
      dr.set([0, 2.55 + .05 * Math.sin(t * 1.5), -2.0], .62 * popE(P(.2, 1.0, t)), sm(P(1.0, 2.4, t)), t);
      cn1.set(p1(t), .75 * popE(P(3.0, 3.8, t)) * (t > 12.4 ? 1 - P(12.4, 13.2, t) : 1), t * 3, t);
      cn2.set(p2(t), .75 * popE(P(8.8, 9.6, t)) * (t > 14.2 ? 1 - P(14.2, 15.0, t) : 1), t * 3 + 1, t);
      let n = 0; [[YX, 6.4], [MX, 12.0]].forEach(([x, t0]) => [-1, 1].forEach(s => { th[n].set([x, .95, GZ + .1], [s * CX, CY + .15, CZ], sm(P(t0 + (n % 2) * .45, t0 + 1.2 + (n % 2) * .45, t)), t, n); n++; }));
      tag.set([-1.6, 2.05 + .04 * Math.sin(t * 1.6), -1.3], popE(P(7.4, 8.4, t)) * .8, 0); });
    boyK(Wd, MENDY, t => ({ pos: [MX, 0, GZ + .1], facing: face(.6, 1), scale: MS, gesture: t > 13.2 ? 'thumb' : null, perform: .4, smile: .5 + .4 * sm(P(12.4, 13.6, t)), look: .3 }));
    boyK(Wd, YANKY, t => ({ pos: [YX, 0, GZ], facing: face(1, .2), gesture: t < 3.2 ? 'rest' : (t < 6.6 ? 'offer' : (t > 7 ? 'thumb' : 'rest')), perform: t < 3.2 ? .3 : 0, smile: .5 + .4 * sm(P(6.4, 7.6, t)), look: .2 }));
    manK(Wd, SABA, t => ({ pos: [SX, 0, GZ], facing: lerp(face(-1, .2), face(1, .2), sm(P(8.4, 9.4, t))), gesture: t < 3.6 ? 'rest' : (t < 12.6 ? 'offer' : 'thumb'), perform: t < 3.6 ? .3 : 0, smile: .6 + .4 * sm(P(12, 13, t)), talk: t > 12.8 ? .3 * talkAmt(t, 7) : 0 }), .6);
    manK(Wd, NEIGH, t => ({ pos: [NX, 0, GZ], facing: face(-1, .2), gesture: t < 8.2 ? 'rest' : (t < 11.8 ? 'offer' : 'point'), perform: t < 8.2 ? .3 : 0, smile: .6, talk: t > 8.4 && t < 10 ? .4 * talkAmt(t, 3) : 0 }), .2);
    Wd.occ = cd.occ.concat([cn1.g, cn2.g, tag.g, dr.g]); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0.0, 1.35, -.9], 5.2, 1.1, -14, 44), C0(4, [0.0, 1.35, -.9], 4.4, 1.0, 8, 44)])],
      [4, cine([C0(4, [0.0, 1.35, -.9], 4.4, 1.0, 10, 44), C0(9, [0.0, 1.35, -.9], 4.2, .9, -10, 44)])],
      [9, cine([C0(9, [0.0, 1.35, -.9], 4.2, .9, -10, 44), C0(dur, [0.0, 1.35, -.9], 5.0, 1.2, 10, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-46: door 2 = lifting. Mendy lifts the unlit candles a little and sets them down; then the neighbour lifts them "for them"
  function s3(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0), dr = door(Wd, '2'), tag = mkTag(Wd, '2 — הגבהה'), th = [0, 1, 2, 3].map(() => thread(Wd));
    const sp = sparks(Wd, 12, [0, 1.5, -1.0], 2.0, 0xffe9a8, .13);
    const YX = -2.1, BZ = -1.3, LZ = -.85;
    const km = t => P(6.9, 8.5, t), kn = t => P(7.4, 9.0, t);   // Mendy steps left, the neighbour steps in
    const mx = t => lerp(0, -1.15, sm(P(7.5, 9.0, t))), mz = t => lerp(LZ, -1.6, sm(P(6.7, 7.7, t))), nx = t => lerp(1.65, 0, sm(kn(t))), nz = t => lerp(BZ, LZ, sm(kn(t)));
    const lift1 = t => sm(P(3.2, 4.6, t)) * (1 - sm(P(5.2, 6.4, t))), lift2 = t => sm(P(9.4, 10.8, t)) * (1 - sm(P(11.4, 12.6, t)));
    Wd.on(t => { sp(t); cd.set(.22 * Math.max(lift1(t), lift2(t)));
      dr.set([0, 2.55 + .05 * Math.sin(t * 1.5), -2.0], .62 * popE(P(.2, 1.0, t)), sm(P(1.0, 2.4, t)), t);
      const kA = clamp(sm(P(6.6, 7.8, t)) * (1 - sm(P(8.2, 8.9, t))) + sm(P(12.4, 13.6, t)), 0, 1), kB = sm(P(12.8, 14.0, t)), ly = .22 * Math.max(lift1(t), lift2(t));
      [0, 1].forEach(i => th[i].set([mx(t), .95, mz(t) + .1], [(i ? 1 : -1) * CX, CY + .15 + ly, CZ], kA, t, i));
      [0, 1].forEach(i => th[2 + i].set([YX, .95, BZ + .1], [(i ? 1 : -1) * CX, CY + .15 + ly, CZ], kB, t, 2 + i));
      tag.set([-1.5, 2.05 + .04 * Math.sin(t * 1.6), -1.3], popE(P(13.2, 14.2, t)) * .8, 0); });
    boyK(Wd, YANKY, t => ({ pos: [YX, 0, BZ], facing: face(.5, 1), gesture: t > 14.4 ? 'thumb' : null, perform: .4, smile: .5 + .4 * sm(P(12.8, 14, t)), look: .3 }));
    boyK(Wd, MENDY, t => { const mv = t > 7.5 && t < 9.0; return { pos: [mx(t), 0, mz(t)], facing: mv ? face(-1, .3) : 0, scale: MS, walk: mv ? t * 6.5 : undefined, gesture: mv ? null : (t > 2.8 && t < 6.6 ? 'offer' : (t > 9.0 ? null : 'rest')), perform: (mv || t > 9.0 || t < 2.8) ? .4 : 0, smile: .5 + .4 * sm(P(6.6, 7.8, t)), look: .1 }; });
    manK(Wd, NEIGH, t => { const mv = t > 7.4 && t < 9.0; return { pos: [nx(t), 0, nz(t)], facing: mv ? face(-1, .3) : 0, walk: mv ? t * 6 : undefined, gesture: mv ? null : (t > 9.0 && t < 12.8 ? 'offer' : (t < 7.4 ? 'rest' : 'thumb')), perform: t < 7.4 ? .3 : 0, smile: .6, talk: t > 9.2 && t < 11 ? .4 * talkAmt(t, 3) : 0 }; }, .2);
    manK(Wd, SABA, t => ({ pos: [2.5, 0, -1.5], facing: face(-1, .6), gesture: t > 5 && t < 12 ? 'wide' : null, perform: (t > 5 && t < 12) ? 0 : .4, smile: .8, talk: t > 4 && t < 6 ? .3 * talkAmt(t, 6) : 0 }), .6);
    Wd.occ = cd.occ.concat([tag.g, dr.g]); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0.1, 1.35, -.9], 5.6, 1.1, -14, 44), C0(4, [0.1, 1.35, -.9], 4.8, 1.0, 8, 44)])],
      [4, cine([C0(4, [0.1, 1.35, -.9], 4.8, 1.0, 10, 44), C0(9, [0.1, 1.35, -.9], 4.6, .9, -10, 44)])],
      [9, cine([C0(9, [0.1, 1.35, -.9], 4.6, .9, -10, 44), C0(dur, [0.1, 1.35, -.9], 5.4, 1.2, 10, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 46-62: door 3 = kinyan sudar. The neighbour holds out his own handkerchief; Yanky lifts it a little
  function s4(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0), dr = door(Wd, '3'), tag = mkTag(Wd, '3 — בגד'), cl = cloth(Wd), th = [0, 1, 2, 3].map(() => thread(Wd));
    const sp = sparks(Wd, 12, [0, 1.5, -1.0], 2.0, 0xffe9a8, .13);
    const MX = -2.05, YX = -.75, NX = .85, BZ = -1.2, CLX = .05, CLY = 1.0, CLZ = -.85;
    const lift = t => sm(P(4.4, 5.6, t)) * (1 - sm(P(7.2, 8.4, t)));
    Wd.on(t => { sp(t);
      dr.set([0, 2.55 + .05 * Math.sin(t * 1.5), -2.0], .62 * popE(P(.2, 1.0, t)), sm(P(1.0, 2.4, t)), t);
      cl.set([CLX + .1, CLY + .2 * lift(t) + .02 * Math.sin(t * 2), CLZ], popE(P(1.8, 2.8, t)), t, lift(t));
      let n = 0; [YX, MX].forEach(x => [-1, 1].forEach(s => { th[n].set([x, .95, BZ + .1], [s * CX, CY + .15, CZ], sm(P(8.8 + (n >> 1) * .6 + (n % 2) * .4, 10.0 + (n >> 1) * .6 + (n % 2) * .4, t)), t, n); n++; }));
      tag.set([-1.5, 2.05 + .04 * Math.sin(t * 1.6), -1.3], popE(P(10.6, 11.6, t)) * .8, 0); });
    boyK(Wd, MENDY, t => ({ pos: [MX, 0, BZ + .1], facing: face(.6, 1), scale: MS, gesture: t > 11.4 ? 'thumb' : null, perform: .4, smile: .5 + .4 * sm(P(9.6, 11, t)), look: .3 }));
    boyK(Wd, YANKY, t => ({ pos: [YX, 0, BZ], facing: face(1, .3), gesture: t < 3.4 ? 'rest' : (t < 8.6 ? 'offer' : 'thumb'), perform: t < 3.4 ? .3 : 0, smile: .5 + .4 * sm(P(9, 10.4, t)), look: .1 }));
    manK(Wd, NEIGH, t => ({ pos: [NX, 0, BZ], facing: face(-1, .3), gesture: t < 1.8 ? 'rest' : (t < 8.8 ? 'offer' : 'point'), perform: t < 1.8 ? .3 : 0, smile: .6, talk: t > 2 && t < 4 ? .4 * talkAmt(t, 3) : 0 }), .2);
    manK(Wd, SABA, t => ({ pos: [2.2, 0, -1.5], facing: face(-1, .6), gesture: t > 8 ? 'wide' : null, perform: t > 8 ? 0 : .4, smile: .8, talk: 0 }), .6);
    Wd.occ = cd.occ.concat([tag.g, dr.g, cl.g]); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [-0.3, 1.35, -.9], 5.4, 1.1, -14, 44), C0(4, [-0.3, 1.35, -.9], 4.6, 1.0, 8, 44)])],
      [4, cine([C0(4, [-0.3, 1.35, -.9], 4.6, 1.0, 10, 44), C0(9, [-0.3, 1.35, -.9], 4.4, .9, -10, 44)])],
      [9, cine([C0(9, [-0.3, 1.35, -.9], 4.4, .9, -10, 44), C0(dur, [-0.3, 1.35, -.9], 5.2, 1.2, 10, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 62-76: WHO acquires for them. Household (grey, "?"), the neighbour (check), a married son with a suitcase (check)
  function s5(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, -2.0, []);
    const FX = [-1.95, 0, 2.0], FY = .5, FZ = -.2, bob = (t, i) => .06 * Math.sin(t * 1.5 + i * 1.7);
    const col = [0xc9c9c9, 0xf4e2b0, 0xf4e2b0]; FX.forEach((x, i) => pedestal(Wd, x, FY - .06, FZ, col[i]));
    const q = board(Wd, { w: .9, h: .9, draw: drawWord('?', '#e8e8e8', '#555555', '#8f8f8f'), cw: 256, frame: 0x777777, glow: 0xbbbbbb });
    const ck1 = mark3d(Wd, 'check', .8), ck2 = mark3d(Wd, 'check', .8), sk1 = shock(Wd, 0x6dff9a), sk2 = shock(Wd, 0x6dff9a);
    const g1 = glowSprite(3.2, 3.2, 0), g2 = glowSprite(3.2, 3.2, 0); g1.position.set(FX[1], FY + 1.0, FZ - .3); g2.position.set(FX[2], FY + 1.0, FZ - .3); Wd.add(g1); Wd.add(g2);
    const sc = suitcase(Wd, FX[2] + .8, FZ + .1, -.5);
    const sp = sparks(Wd, 12, [0, 1.8, FZ], 3.0, 0xffe9a8, .13);
    Wd.on(t => { sp(t); sc.position.y = FY + bob(t, 2);
      q.set([FX[0], FY + 1.95, FZ], popE(P(2.4, 3.4, t)) * .8, 0);
      ck1.set([FX[1], FY + 2.15, FZ], popE(P(4.6, 5.6, t)) * .8, .06 * Math.sin(t * 3)); sk1.set([FX[1], FY + 2.15, FZ], P(4.6, 5.6, t), 3.0); g1.material.opacity = .4 * sm(P(4.8, 5.8, t));
      ck2.set([FX[2], FY + 2.15, FZ], popE(P(7.2, 8.2, t)) * .8, .06 * Math.sin(t * 3 + 1)); sk2.set([FX[2], FY + 2.15, FZ], P(7.2, 8.2, t), 3.0); g2.material.opacity = .4 * sm(P(7.4, 8.4, t)); });
    const gA = manK(Wd, UNCLE, t => ({ pos: [FX[0] - .35, FY + bob(t, 0), FZ], facing: face(.3, 1), scale: .78 * popE(P(.3, 1.2, t)), gesture: t < 3 ? null : 'shrug', perform: t < 3 ? .4 : 0, brow: .5, smile: 0, look: .3 }), .5);
    const gB = boyK(Wd, SHUKI, t => ({ pos: [FX[0] + .45, FY + bob(t, 3), FZ], facing: face(-.3, 1), scale: .66 * popE(P(.6, 1.5, t)), gesture: null, perform: .4, brow: .5, smile: 0, look: -.2 }));
    const gu = greyOut(gA, .8), gv = greyOut(gB, .8); Wd.on(t => { gu(t); gv(t); });
    manK(Wd, NEIGH, t => ({ pos: [FX[1], FY + bob(t, 1), FZ], facing: face(0, 1), scale: .9 * popE(P(2.8, 3.8, t)), gesture: t > 5 ? 'thumb' : null, perform: t > 5 ? 0 : .4, smile: .4 + .5 * sm(P(4.6, 5.6, t)), talk: 0 }), .2);
    manK(Wd, SON, t => ({ pos: [FX[2] - .2, FY + bob(t, 2), FZ], facing: face(-.2, 1), scale: .9 * popE(P(5.4, 6.4, t)), gesture: t > 7.4 ? 'thumb' : null, perform: t > 7.4 ? 0 : .4, smile: .4 + .5 * sm(P(7.2, 8.2, t)) }), .7);
    Wd.occ = [q.g, ck1.g, ck2.g, sc]; Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.65, -.4], 6.0, 1.1, -10, 44), C0(4.5, [-.3, 1.6, -.4], 5.0, .9, 6, 44)])],
      [4.5, cine([C0(4.5, [-.3, 1.6, -.4], 5.0, .9, 6, 44), C0(9, [.4, 1.6, -.4], 5.0, .9, -8, 44)])],
      [9, cine([C0(9, [.4, 1.6, -.4], 5.0, .9, -8, 44), C0(dur, [0, 1.65, -.4], 6.0, 1.2, 10, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-88: the neighbour (check) lifts the candles for the boys; threads connect; "partner" tags
  function s6(dur) {
    const Wd = skyW(); room(Wd, 0xf4e8cc, false); table(Wd, 0, []);
    const cd = candles(Wd, 0, () => 0), th = [0, 1, 2, 3].map(() => thread(Wd)), ck = mark3d(Wd, 'check', .6);
    const tags = [0, 1].map(() => mkTag(Wd, 'שותף', 1.0));
    const sp = sparks(Wd, 12, [0, 1.5, -1.0], 2.0, 0xffe9a8, .13);
    const BX = [-2.0, 2.0], BZ = -1.25, LZ = -.85;
    const lift = t => sm(P(2.2, 3.5, t)) * (1 - sm(P(4.1, 5.2, t)));
    Wd.on(t => { sp(t); const ly = .22 * lift(t); cd.set(ly);
      ck.set([0, 2.7 + .04 * Math.sin(t * 2), LZ], popE(P(.8, 1.8, t)) * .8, .05 * Math.sin(t * 3));
      let n = 0; BX.forEach((x, bi) => [-1, 1].forEach(s => { th[n].set([x, .95, BZ + .1], [s * CX, CY + .15 + ly, CZ], sm(P(5.0 + n * .35, 6.2 + n * .35, t)), t, n); n++; }));
      tags.forEach((tg, i) => tg.set([BX[i], 2.1 + .04 * Math.sin(t * 1.6 + i), BZ + .2], popE(P(7.2 + i * .8, 8.2 + i * .8, t)) * .8, 0)); });
    boyK(Wd, YANKY, t => ({ pos: [BX[0], 0, BZ], facing: face(.6, 1), gesture: t > 9.4 ? 'thumb' : null, perform: .4, smile: .4 + .55 * sm(P(5.8, 7.8, t)), look: .25 }));
    boyK(Wd, MENDY, t => ({ pos: [BX[1], 0, BZ], facing: face(-.6, 1), scale: MS, gesture: null, perform: .4, smile: .4 + .55 * sm(P(5.8, 7.8, t)), look: -.25 }));
    manK(Wd, NEIGH, t => ({ pos: [0, 0, LZ], facing: 0, gesture: t > 1.6 && t < 5.4 ? 'offer' : (t > 5.4 ? 'thumb' : null), perform: t < 1.6 ? .4 : 0, smile: .6 + .3 * sm(P(5, 6, t)), talk: t > 5.4 ? .3 * talkAmt(t, 3) : 0 }), .2);
    Wd.occ = cd.occ.concat([ck.g].concat(tags.map(q => q.g))); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.35, -.9], 5.4, 1.1, -14, 44), C0(4, [0, 1.35, -.9], 4.4, 1.0, 8, 44)])],
      [4, cine([C0(4, [0, 1.35, -.9], 4.4, 1.0, 10, 44), C0(9, [0, 1.35, -.9], 4.2, .9, -10, 44)])],
      [9, cine([C0(9, [0, 1.35, -.9], 4.2, .9, -10, 44), C0(dur, [0, 1.35, -.9], 5.0, 1.2, 10, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 88-100: the candles light BY THEMSELVES; warm light; the three doors glow together; the boys smile and sit down
  function s7(dur) {
    const Wd = skyW({ hemi: .8, sun: .5 }); room(Wd, 0xf4e8cc, false); table(Wd, 0, [-.62, .62]);
    const kOn = t => sm(P(1.0, 3.0, t)), cd = candles(Wd, 0, (t, i) => sm(P(.8 + i * .5, 1.8 + i * .5, t)), 1.25);
    warmLight(Wd, kOn, [.8, .5]);
    const gl = glowAt(Wd.scene, 7, 0xffc070, 0); gl.position.set(0, 1.2, -.2); Wd.on(t => gl.material.opacity = .08 * kOn(t));
    const sp = sparks(Wd, 16, [0, 1.6, -.3], 2.0, 0xffe9a8, .14), ds = [door(Wd, '1'), door(Wd, '2'), door(Wd, '3')], DX = [-1.5, 0, 1.5];
    Wd.on(t => { sp(t); ds.forEach((d, i) => d.set([DX[i], 2.75 + .06 * Math.sin(t * 1.5 + i * 2), -1.8], .55 * popE(P(.4 + i * .3, 1.2 + i * .3, t)), 1, t + kOn(t) * 3)); });
    boyK(Wd, YANKY, t => Object.assign({ pos: [-.62, RB + .35 * (1 - sm(P(.2, 1.4, t))), -.82], facing: 0, smile: .6 + .4 * sm(P(2, 3.5, t)), perform: .3, look: .15 * Math.sin(t * .8), talk: .3 * talkAmt(t, 7) * sm(P(8, 9, t)) }, SIT));
    boyK(Wd, MENDY, t => Object.assign({ pos: [.62, RB + .35 * (1 - sm(P(.6, 1.8, t))), -.82], facing: 0, scale: MS, smile: .6 + .4 * sm(P(2.4, 4, t)), perform: .3, look: -.15 * Math.sin(t * .8), talk: .25 * talkAmt(t, 8) * sm(P(9, 10, t)) }, SIT));
    manK(Wd, SABA, t => ({ pos: [2.2, 0, -1.4], facing: face(-1, .5), gesture: null, perform: .4, smile: 1, talk: .2 * talkAmt(t, 5) }), .6);
    manK(Wd, NEIGH, t => ({ pos: [-2.2, 0, -1.4], facing: face(1, .5), gesture: null, perform: .4, smile: 1, talk: .2 * talkAmt(t, 2) }), .2);
    Wd.occ = cd.occ.concat(ds.map(d => d.g)); Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.2, -.6], 4.6, 1.2, 14, 42), C0(3.4, [0, 1.2, -.6], 4.0, .9, -8, 42)])],
      [3.4, cine([C0(3.4, [0, 1.2, -.6], 4.0, .9, -8, 42), C0(7, [0, 1.25, -.6], 3.8, .9, 10, 42)])],
      [7, cine([C0(7, [0, 1.25, -.6], 3.8, .9, 10, 42), C0(10.5, [0, 1.2, -.6], 3.5, .8, -8, 42)])],
      [10.5, cine([C0(10.5, [0, 1.2, -.6], 3.5, .8, -8, 42), C0(dur, [.2, 1.25, -.5], 4.6, 1.2, 12, 44)])]);
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
