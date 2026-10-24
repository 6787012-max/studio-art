// shabbat-g19b story: "Electric light for Shabbat candles?" (Azamra 19, last Q&A) - 3D choreography per storyboards_v3.md (B).
// Boys only (Yanky + little Mendy). Nobody lights anything: the lamp / tube / candles switch on BY THEMSELVES.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, plainRoom, diningTable, chair, candle, mark3d, qmark, board, drawWord,
    popE, lighting, glowAt, glowSprite, texPlane, openBook, toon, ink, bm, canvasTex, FONT, flamePath, fitText, planksTex, archShape, arcPt, lerpV, shock } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly || -.09 * d];
  const C0 = (t, tg, d, h, a, fov) => [t, tg, d, h, a, fov === undefined ? 44 : fov, .0001];
  const TY = .72, CT = TY + .04, SIT = { sit: true, groundY: 0 };
  const WARM = new THREE.Color(0xffe2b0), DIMC = new THREE.Color(0xc9b9a0);
  const mix = (a, b, k) => new THREE.Color().copy(a).lerp(b, clamp(k, 0, 1));
  const RB = .17;   // seated boys are raised so they sit up above the table (chest and face visible)
  const YANKY = 3, MENDY = 2, MS = .88;   // Mendy is the younger brother: a bit smaller

  // ---------------------------------------------------------------- shared props (inside this story only)
  function sunsetTex() {
    return canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5b6fd0'); gr.addColorStop(.55, '#ff9a5a'); gr.addColorStop(.9, '#ffd27a'); gr.addColorStop(1, '#ffe9a8'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff2c0'; c.beginPath(); c.arc(w * .6, h * .78, 20, 0, 7); c.fill(); c.fillStyle = '#7a4a4a'; for (const [x, bw, bh] of [[0, 30, 40], [28, 24, 62], [52, 30, 34], [82, 22, 52], [104, 30, 38]]) c.fillRect(x, h - bh, bw, bh); });
  }
  function sunsetWin(Wd, x, y0, z, w, h) {   // arched window with a sunset sky; dim(k) darkens the pane
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), bm(0xffffff, { map: sunsetTex() })); pn.position.z = .02;
    const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .05], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
    const c0 = new THREE.Color(0xffffff), c1 = new THREE.Color(0x6a6a98);
    return { g, dim(k) { pn.material.color.copy(c0).lerp(c1, clamp(k, 0, 1)); } };
  }
  function guestRoom(Wd, wall) {
    const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: wall, beams: false }), wins = [sunsetWin(Wd, -2.6, 1.0, -R.HZ + .02, 1.6, 2.1), sunsetWin(Wd, 2.6, 1.0, -R.HZ + .02, 1.6, 2.1)];
    for (const x of [-2.6, 2.6]) for (const dx of [-1, 1]) Wd.add(box(.4, 2.4, .12, 0xb5503a, { pos: [x + dx * 1.05, 1.9, -R.HZ + .12], ink: false }));
    Wd.add(box(2.2, .9, .5, 0x7a4a2a, { pos: [-4.2, .45, -R.HZ + .35] })); Wd.add(box(.9, .7, .08, 0x2f5a8a, { pos: [-4.2, 2.0, -R.HZ + .08], ink: false })); Wd.add(box(.78, .58, .09, 0xe9c26a, { pos: [-4.2, 2.0, -R.HZ + .1], ink: false }));
    Wd.add(box(1.5, 2.5, .12, 0x7a4a2a, { pos: [4.5, 1.25, -R.HZ + .08] }));
    for (const x of [-4, -1.3, 1.4, 4]) Wd.add(box(.3, .35, 3.4, 0x6a4326, { pos: [x, R.H - .18, -R.HZ + 1.7], ink: false }));
    return { R, wins, dim(k) { wins.forEach(w => w.dim(k)); } };
  }
  function wallClock(Wd, pos, r) {
    const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
    g.add(cyl(r, r, .1, 0xfff6e4, { rot: [PI / 2, 0, 0] }));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r, .06, 12, 40), toon(0x8a5a30)); ink(rim, .02); g.add(rim);
    const face = texPlane(r * 1.9, r * 1.9, (c, W, H) => { c.translate(W / 2, H / 2); for (let i = 0; i < 12; i++) { c.save(); c.rotate(i * PI / 6); c.fillStyle = i % 3 === 0 ? '#1c2745' : '#6a6f86'; c.fillRect(-W * .012, -H * .46, W * .024, i % 3 === 0 ? H * .1 : H * .06); c.restore(); } }, { cw: 512, ro: 3 }); face.position.z = .056; g.add(face);
    const mk = (len, wd, col) => { const p = new THREE.Group(); p.position.z = .08; p.add(box(wd, len, .03, col, { pos: [0, len / 2 - len * .12, 0], ink: false })); g.add(p); return p; };
    const hp = mk(r * .55, .07, 0x1c2745), mp = mk(r * .8, .045, 0xc4161c);
    return { g, set(h) { hp.rotation.z = -(h % 12) / 12 * 2 * PI; mp.rotation.z = -(h % 1) * 2 * PI; } };
  }
  function suitcase(Wd, x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; Wd.add(g);
    g.add(box(1.1, .2, .7, 0x8a4a2a, { pos: [0, .1, 0] })); g.add(box(.98, .04, .58, 0xe8d9b8, { pos: [0, .2, 0], ink: false }));
    g.add(box(.34, .1, .4, 0x2f6aa0, { pos: [-.3, .27, .02], rot: [0, .2, 0] })); g.add(box(.3, .08, .36, 0xe9e2d0, { pos: [.1, .26, -.02], rot: [0, -.15, 0] })); g.add(box(.26, .09, .34, 0x6a8f4a, { pos: [.36, .26, .04], rot: [0, .1, 0] }));
    const lid = new THREE.Group(); lid.position.set(0, .2, -.35); g.add(lid); lid.add(box(1.1, .08, .7, 0x8a4a2a, { pos: [0, 0, .35] })); lid.add(box(.98, .03, .58, 0xe8d9b8, { pos: [0, -.04, .35], ink: false }));
    const lidAng = k => -1.75 * k;   // k = 1 open, 0 closed
    lid.rotation.x = lidAng(1);
    return { g, open(k) { lid.rotation.x = lidAng(k); } };
  }
  const drawCandleIcon = (bg) => (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = '#f0c860'; c.lineWidth = H * .05; c.strokeRect(H * .06, H * .06, W - H * .12, H - H * .12);
    c.fillStyle = '#fff4d8'; c.fillRect(W * .465, H * .42, W * .07, H * .38); c.fillStyle = '#c9ced8'; c.fillRect(W * .4, H * .78, W * .2, H * .06); flamePath(c, W * .5, H * .29, H * .26); c.fillStyle = '#ffb21f'; c.fill(); c.lineWidth = H * .015; c.strokeStyle = '#8a3a00'; c.stroke(); };
  function candleBox(Wd, o) {   // box of candles with a candle icon on the lid; empty = open and hollow
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    g.add(box(.42, .14, .26, 0xa8283a, { pos: [0, .07, 0] })); g.add(box(.38, .02, .22, 0xf3e2bd, { pos: [0, .14, 0], ink: false }));
    if (!o.empty) for (let i = 0; i < 10; i++) g.add(cyl(.015, .015, .15, 0xfff4d8, { pos: [-.15 + i * .033, .2, 0], ink: false }));
    const fi = texPlane(.34, .11, drawCandleIcon('#8f1d2c'), { cw: 256, opaque: true, ro: 2, depthWrite: true }); fi.position.set(0, .07, .132); g.add(fi);
    const hinge = new THREE.Group(); hinge.position.set(0, .14, -.13); g.add(hinge); hinge.add(box(.42, .03, .26, 0xa8283a, { pos: [0, .015, .13] }));
    const ic = texPlane(.36, .22, drawCandleIcon('#8f1d2c'), { cw: 256, opaque: true, ro: 2, depthWrite: true }); ic.rotation.x = -PI / 2; ic.position.set(0, .034, .13); hinge.add(ic);
    return { g, set(pos, ry, s, openK, rz) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.rotation.set(0, ry || 0, rz || 0); g.scale.setScalar(s); hinge.rotation.x = -2.3 * clamp(openK, 0, 1); } };
  }
  function tableLamp(Wd, o) {   // small table lamp; o.on(t) = 0..1. The knob turns BY ITSELF.
    const g = new THREE.Group(); g.position.set(o.pos[0], o.pos[1], o.pos[2]); Wd.add(g);
    g.add(cyl(.13, .16, .05, 0x8a5a30, { pos: [0, .025, 0] })); g.add(cyl(.03, .035, .36, 0xd9a63a, { pos: [0, .23, 0] })); g.add(cyl(.045, .045, .07, 0xb0b4bc, { pos: [0, .44, 0] }));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.07, 14, 10), bm(0x8a8f98)); bulb.position.y = .53; g.add(bulb);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(.12, .25, .3, 28, 1, true), toon(0xf6e2b8, { side: THREE.DoubleSide, emissive: new THREE.Color(0xffb85a), emissiveIntensity: 0 })); shade.position.y = .55; shade.castShadow = false; g.add(shade);
    const knob = cyl(.025, .025, .05, 0x4a2a14, { pos: [.12, .06, 0], rot: [0, 0, PI / 2] }); g.add(knob);
    const gl = glowSprite(1.6, 1.6, 0); gl.material.color.set(0xffc060); gl.position.y = .5; g.add(gl);
    const pool = glowSprite(4.4, 4.4, 0); pool.material.color.set(0xffc070); pool.position.set(-1.0, .02 - o.pos[1] + TY + .06, .25); g.add(pool);
    const lt = new THREE.PointLight(0xffd08a, 0, 9); lt.position.y = .5; g.add(lt);
    const c0 = new THREE.Color(0x8a8f98), c1 = new THREE.Color(0xfff2c4);
    Wd.on(t => { const k = o.on(t); bulb.material.color.copy(c0).lerp(c1, k); shade.material.emissiveIntensity = .95 * k; gl.material.opacity = .85 * k; pool.material.opacity = .55 * k; lt.intensity = 1.6 * k; knob.rotation.y = -1.4 * k; });
    return g;
  }
  function clearBulb(Wd) {   // clear glass bulb with a visible glowing filament
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const glass = new THREE.MeshPhongMaterial({ color: 0xeaf6ff, transparent: true, opacity: .5, depthWrite: false, shininess: 120, specular: 0xffffff });
    const sph = new THREE.Mesh(new THREE.SphereGeometry(.5, 28, 20), glass); sph.position.y = .65; inner.add(sph); const rimM = new THREE.MeshBasicMaterial({ color: 0x7fb4dc, side: THREE.BackSide, transparent: true, opacity: .75, depthWrite: false, fog: false }); const rs = new THREE.Mesh(sph.geometry, rimM); rs.position.copy(sph.position); rs.scale.setScalar(1.07); inner.add(rs);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.25, .17, .36, 20), glass); neck.position.y = .15; inner.add(neck); const rn = new THREE.Mesh(neck.geometry, rimM); rn.position.copy(neck.position); rn.scale.set(1.1, 1.02, 1.1); inner.add(rn);
    inner.add(cyl(.18, .18, .3, 0xb4b9c2, { pos: [0, -.16, 0] })); for (const y of [-.06, -.14, -.22, -.3]) inner.add(cyl(.2, .2, .03, 0x8d939c, { pos: [0, y, 0], ink: false })); inner.add(cyl(.09, .13, .06, 0x6a6f78, { pos: [0, -.34, 0] }));
    const wireM = bm(0x8d939c); for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .5, 6), wireM); w.position.set(sx * .12, .46, 0); w.rotation.z = -sx * .05; inner.add(w); }
    const pts = []; for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector3(-.11 + .22 * i / 8, .72 + (i % 2 ? .09 : -.09), 0));
    const fm = bm(0x5a4a40), fil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .15), 90, .013, 6), fm); fil.renderOrder = 4; inner.add(fil);
    const g1 = glowSprite(1.0, 1.0, 0); g1.material.color.set(0xffb040); g1.position.set(0, .72, 0); inner.add(g1);
    const g2 = glowSprite(.4, .4, 0); g2.material.color.set(0xffffe0); g2.position.set(0, .72, 0); inner.add(g2);
    const fl1 = glowSprite(.4, .8, 0); fl1.material.color.set(0xff9a1f); fl1.position.set(0, .8, .02); inner.add(fl1);   // flame-like halo hugging the filament
    const fl2 = glowSprite(.16, .38, 0); fl2.material.color.set(0xfff0b0); fl2.position.set(0, .76, .03); inner.add(fl2);
    const c0 = new THREE.Color(0x5a4a40), c1 = new THREE.Color(0xfff6a8);
    return { g, inner, set(pos, s, ry, k, fk, gk) { g.visible = s > .01; if (!g.visible) return; gk = gk === undefined ? 1 : gk; glass.opacity = .5 * gk; rimM.opacity = .75 * gk; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); g.rotation.y = ry || 0; k = clamp(k || 0, 0, 1); fk = clamp(fk || 0, 0, 1);
      fm.color.copy(c0).lerp(c1, k); g1.material.opacity = .32 * k * (.92 + .08 * Math.sin(ry * 9 + 1)); g2.material.opacity = .45 * k; fl1.material.opacity = .42 * fk * (.9 + .1 * Math.sin(ry * 13)); fl2.material.opacity = .55 * fk; } };
  }
  function fluoTube(Wd) {   // white fluorescent tube
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const tm = bm(0xdfe6ee), tube = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 2.2, 20), tm); tube.rotation.z = PI / 2; inner.add(tube);
    for (const sx of [-1, 1]) { inner.add(cyl(.125, .125, .14, 0x9aa0aa, { pos: [sx * 1.12, 0, 0], rot: [0, 0, PI / 2] })); for (const dz of [-.03, .03]) inner.add(box(.1, .015, .015, 0xc9ced8, { pos: [sx * 1.24, 0, dz], ink: false })); }
    const gl = glowSprite(3.0, 1.1, 0); gl.material.color.set(0xd8ecff); inner.add(gl);
    const lt = new THREE.PointLight(0xe2efff, 0, 9); g.add(lt);
    const c0 = new THREE.Color(0xdfe6ee), c1 = new THREE.Color(0xffffff);
    return { g, inner, set(pos, s, ry, k) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); g.rotation.y = ry || 0; k = clamp(k || 0, 0, 1); tm.color.copy(c0).lerp(c1, k * .7); gl.material.opacity = .4 * k; lt.intensity = 1.5 * k; } };
  }
  function ghostCandle(Wd) {   // transparent candle: "missing"
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const mats = []; const gm = c => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .4, depthWrite: false, fog: false }); mats.push(m); return m; };
    const add = (geo, m, y) => { const q = new THREE.Mesh(geo, m); q.position.y = y; inner.add(q); return q; };
    add(new THREE.CylinderGeometry(.09, .12, .04, 18), gm(0xb8c4e0), .02); add(new THREE.CylinderGeometry(.022, .035, .2, 12), gm(0xb8c4e0), .14); add(new THREE.CylinderGeometry(.065, .035, .06, 14), gm(0xb8c4e0), .26);
    add(new THREE.CylinderGeometry(.05, .052, .42, 18), gm(0xffffff), .5); add(new THREE.ConeGeometry(.05, .16, 12), gm(0xaab4d0), .79);
    const gl = glowSprite(2.2, 2.2, 0); gl.material.color.set(0x8fb0ff); gl.position.y = .55; inner.add(gl);
    const wm = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 1, depthWrite: false, fog: false }), ol = new THREE.Group(); ol.scale.setScalar(1.1); inner.add(ol);
    [[new THREE.CylinderGeometry(.05, .052, .42, 12, 3), .5], [new THREE.CylinderGeometry(.09, .12, .04, 12), .02], [new THREE.CylinderGeometry(.065, .035, .06, 12), .26], [new THREE.ConeGeometry(.05, .16, 10), .79]].forEach(([geo, y]) => { const q = new THREE.Mesh(geo, wm); q.position.y = y; ol.add(q); });
    return { g, inner, set(pos, s, op) { g.visible = s > .01 && op > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); mats.forEach(m => m.opacity = .7 * op); gl.material.opacity = .5 * op; wm.opacity = 1 * op; } };
  }
  const drawNoCandle = (c, W, H) => { c.fillStyle = '#fffaf0'; c.fillRect(0, 0, W, H); c.strokeStyle = '#6b3a1c'; c.lineWidth = H * .03; c.strokeRect(H * .04, H * .04, W - H * .08, H - H * .08);
    c.fillStyle = '#fff4d8'; c.strokeStyle = '#8a7a50'; c.lineWidth = H * .012; c.fillRect(W * .44, H * .38, W * .12, H * .38); c.strokeRect(W * .44, H * .38, W * .12, H * .38); c.fillStyle = '#9aa0aa'; c.fillRect(W * .34, H * .76, W * .32, H * .06);
    flamePath(c, W * .5, H * .26, H * .24); c.fillStyle = '#ffb21f'; c.fill(); c.strokeStyle = '#8a3a00'; c.lineWidth = H * .015; c.stroke();
    const cx = W / 2, cy = H / 2, s = H * .4; c.strokeStyle = '#e03131'; c.lineWidth = H * .07; c.beginPath(); c.arc(cx, cy, s, 0, 7); c.stroke(); c.beginPath(); c.moveTo(cx - s * .7, cy - s * .7); c.lineTo(cx + s * .7, cy + s * .7); c.stroke(); };
  function sparkleMotes(Wd, n, center, rad, color, size) {
    const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(size || .16, size || .16, 0); s.material.color.set(color || 0xffe9a8); Wd.add(s); sp.push(s); }
    return t => sp.forEach((s, i) => { const a = i * 2.4 + t * (.5 + (i % 3) * .2); s.position.set(center[0] + Math.cos(a) * rad * (.6 + .4 * ((i * 7) % 5) / 4), center[1] + Math.sin(a * 1.3) * rad * .5 + ((i % 4) - 1.5) * .12, center[2] + Math.sin(a) * rad * .5); s.material.opacity = .35 + .45 * Math.sin(t * 2.2 + i * 1.7) ** 2; });
  }
  const shabbatTable = (Wd, x, z, food, noFront) => { diningTable(Wd, { x, z, len: 2.8, wid: 1.1, food: food !== false }); [-.55, .55].forEach(dx => chair(Wd, x + dx, z - .95, 0, .46)); if (!noFront) [-.55, .55].forEach(dx => chair(Wd, x + dx, z + .95, PI, .46)); };
  const sideTable = (Wd, x, z) => { Wd.add(box(.62, .06, .5, 0x8a5a30, { pos: [x, .6, z] })); for (const dx of [-.26, .26]) for (const dz of [-.2, .2]) Wd.add(box(.05, .6, .05, 0x6a4326, { pos: [x + dx, .3, z + dz], ink: false })); };
  const boyK = (Wd, i, fn) => { const P = boyP(Wd, i, fn); Wd.on(() => { const k = P.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }); return P; };   // dark navy velvet kippa: contrasts with brown hair and pale skin
  const seated = (Wd, fn) => { boyK(Wd, YANKY, t => Object.assign({ pos: [-.55, RB, -.82], facing: 0 }, SIT, fn(t, 0))); boyK(Wd, MENDY, t => Object.assign({ pos: [.55, RB, -.82], facing: 0, scale: MS }, SIT, fn(t, 1))); };
  const skyW = (o) => mkWorld(Object.assign({ skyTop: 0x6a7fd8, skyBottom: 0xffb37a, fogColor: 0xffc99a, fogNear: 40, fogFar: 140, hemi: 1.15, hemiSky: 0xfff0dc, hemiGround: 0x9a8660, sun: 1.3, sunColor: 0xffd9a8, sunPos: [-14, 26, 16] }, o || {}));
  const LAMP_POS = [2.3, .63, -.3];

  // ---------------------------------------------------------------- 1. HOOK 0-14: erev Shabbat, guest apartment, empty candle box, suitcase, clock near sunset, unlit lamp, "?"
  function hook(dur) {
    const Wd = skyW(), G = guestRoom(Wd); shabbatTable(Wd, 0, 0, true);
    const cb = candleBox(Wd, { empty: true }); Wd.on(t => cb.set([-.66, TY + .04, .05], .35, 1.25, .9 + .1 * Math.sin(t * 1.3), 0));
    const clk = wallClock(Wd, [0, 2.75, -4.4], .6); Wd.on(t => clk.set(5.55 + t * .03));
    const sc = suitcase(Wd, -3.2, 1.1, .5), sc2 = suitcase(Wd, 3.6, -2.4, -.4); sc2.open(1);
    sideTable(Wd, LAMP_POS[0], LAMP_POS[2]); tableLamp(Wd, { pos: LAMP_POS, on: () => 0 });
    // the sun sinks slowly in the window glow
    const sunG = glowSprite(4, 4, .55); sunG.material.color.set(0xffa040); sunG.position.set(-2.6, 2.1, -4.4); Wd.add(sunG); Wd.on(t => { sunG.material.opacity = .45 + .1 * Math.sin(t * .8); sunG.position.y = 1.9 - t * .02; });
    boyP(Wd, YANKY, t => ({ pos: [-1.05, 0, -1.55], facing: .15, gesture: t > 3 ? 'think' : null, perform: t > 3 ? 0 : .5, brow: .5, smile: 0, look: t > 5.5 && t < 8.5 ? .4 : -.3 }));
    boyP(Wd, MENDY, t => ({ pos: [1.05, 0, -1.5], facing: -.2, scale: MS, gesture: t > 6 ? 'shrug' : null, perform: t > 6 ? 0 : .5, brow: .5, smile: 0, look: .3 }));
    Wd.center = [0, 0]; Wd.qSize = 1.3;
    Wd.cam = seq([0, cine([C(0, [0, 1.1, 0], 7.6, 1.8, -20, 44), C(4, [0, 1.1, 0], 5.6, 1.3, 8, 44)])],
      [4, cine([C0(4, [-.66, 1.0, .05], 3.0, .5, 22, 42), C0(7.5, [-.66, 1.05, .05], 2.7, .4, -14, 42)])],
      [7.5, cine([C0(7.5, [0, 2.95, -3.6], 3.8, .2, -12, 42), C0(10.5, [0, 2.9, -3.6], 4.6, .3, 12, 42)])],
      [10.5, cine([C(10.5, [.3, 1.2, -.3], 8.6, 2.0, 14, 46), C(14, [.4, 1.3, -.3], 7.0, 1.6, -10, 46)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: the street; the boys run to a shop whose shutter is down ("closed" sign); the sun touches the horizon
  function s2(dur) {
    const Wd = mkWorld({ skyTop: 0x5b6fd0, skyBottom: 0xffb27a, fogColor: 0xffc58f, fogNear: 45, fogFar: 160, sun: 1.5, sunColor: 0xffc27a, sunPos: [-40, 14, 14], hemi: 1.15, hemiSky: 0xffe3c8, hemiGround: 0x8a6a50, shadowExt: 28, ground: 'stone', groundSize: 400 });
    Wd.add(box(120, .03, 6.4, 0x4a4d57, { pos: [2, .015, 3.4], ink: false })); Wd.add(box(120, .06, 2.4, 0xd9cfba, { pos: [2, .03, -1.0], ink: false }));
    for (let x = -50; x < 50; x += 4) Wd.add(box(1.4, .035, .28, 0xf0e8c8, { pos: [x, .04, 3.4], ink: false }));
    const house = (x, col) => { Wd.add(box(8, 5, 5, col, { pos: [x, 2.5, -4.6] })); const roof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 2.4, 4), toon(0xb5503a)); roof.rotation.y = PI / 4; roof.scale.z = .75; roof.position.set(x, 6.2, -4.6); roof.castShadow = true; ink(roof, .03); Wd.add(roof);
      Wd.add(box(1.3, 2.4, .2, 0x7a4a2a, { pos: [x, 1.2, -2.05] })); for (const dx of [-2.4, 2.4]) { Wd.add(box(1.3, 1.5, .2, 0xffe08a, { pos: [x + dx, 2.4, -2.05], ink: false })); Wd.add(box(1.5, .12, .3, 0xe6d6b2, { pos: [x + dx, 1.62, -1.95], ink: false })); } };
    house(-10, 0xf0d9b0); house(-20, 0xe9cfa0); house(-30, 0xf0d9b0); house(-1, 0xe8d5b0);
    // the small shop (x = 9): shutter down, sign "closed"
    Wd.add(box(7, 4.2, 4.4, 0xf4e0b8, { pos: [9, 2.1, -4.2] })); Wd.add(box(7.4, .4, 4.8, 0xc9a574, { pos: [9, 4.3, -4.2], ink: false }));
    Wd.add(box(.3, 2.9, .3, 0x6b3a1c, { pos: [5.7, 1.45, -1.95] })); Wd.add(box(.3, 2.9, .3, 0x6b3a1c, { pos: [12.3, 1.45, -1.95] })); Wd.add(box(6.9, .3, .3, 0x6b3a1c, { pos: [9, 3.0, -1.95] }));
    const sh = texPlane(6.2, 2.7, (c, W, H) => { c.fillStyle = '#8c96a8'; c.fillRect(0, 0, W, H); for (let y = 0; y < H; y += H / 22) { c.fillStyle = 'rgba(40,50,70,.55)'; c.fillRect(0, y, W, 4); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(0, y + 6, W, 3); } }, { cw: 512, opaque: true, ro: 2, depthWrite: true }); sh.position.set(9, 1.45, -1.9); Wd.add(sh);
    for (let i = 0; i < 7; i++) Wd.add(box(6.2, .045, .05, 0x5e6678, { pos: [9, .15 + i * .4, -1.86], ink: false }));
    const awn = box(7.2, .12, 1.4, 0xc4443a, { pos: [9, 3.22, -1.4], rot: [.28, 0, 0] }); Wd.add(awn); for (let i = 0; i < 7; i++) if (i % 2) Wd.add(box(.514, .125, 1.41, 0xfff4e0, { pos: [9 - 3.6 + .514 / 2 + i * .514, 3.22, -1.4], rot: [.28, 0, 0], ink: false }));
    const shopSign = board(Wd, { w: 2.8, h: .8, draw: drawWord('מכולת', '#fff4cf', '#7a1c1c', '#d9a63a'), cw: 640, frame: 0x6b3a1c }); shopSign.set([9, 3.85, -1.6], 1, 0);
    const closed = board(Wd, { w: 1.5, h: .6, draw: drawWord('סגור', '#ffffff', '#c4161c', '#c4161c'), cw: 512, frame: 0x6b3a1c, glow: 0xff7a7a }), cs = shock(Wd, 0xff7a7a);
    Wd.on(t => { closed.g.visible = true; closed.g.position.set(9, 1.75, -1.72); closed.g.rotation.y = 0; closed.inner.scale.setScalar(popE(P(2.0, 2.8, t)) * 1.15); closed.inner.rotation.z = .07 * Math.sin(t * 2.1 + 1) * sm(P(2.2, 3, t)); cs.set([9, 1.75, -1.5], P(2.8, 3.6, t), 3.4); });
    for (const x of [-4, 3.5, 14, 17]) { Wd.add(cyl(.18, .24, 2.4, 0x7a5232, { pos: [x, 1.2, -2.6] })); Wd.add(ball(1.3, 0x6fae57, { pos: [x, 3.3, -2.6], scale: [1, .9, 1] })); }
    for (const x of [-12, -2, 6, 15]) { Wd.add(cyl(.07, .09, 4, 0x333333, { pos: [x, 2, -1.2] })); const lb = new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff0c0, fog: false })); lb.position.set(x, 4.1, -1.2); Wd.add(lb); const gs = glowSprite(2, 2, .45); gs.position.copy(lb.position); Wd.add(gs); }
    const sunD = new THREE.Mesh(new THREE.SphereGeometry(3.2, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffd27a, fog: false })), sunG = glowSprite(30, 30, .85);
    sunG.material.color.set(0xffa040); Wd.add(sunD); Wd.add(sunG);
    Wd.on(t => { const y = lerp(10, 1.3, sm(P(0, 13.5, t))); sunD.position.set(26, y, -85); sunG.position.set(26, y, -86); });
    // the two boys run along the sidewalk and stop in front of the shutter; then "no candles" thought sign
    const x0 = -7.0, v = 2.9, xs = [x0, x0 - 1.0], TA = 4.6;
    const runX = (t, i) => Math.min(xs[i] + v * t, 6.6 - i * 1.15);
    boyP(Wd, YANKY, t => { const x = runX(t, 0), mv = x < 6.59; return { pos: [x, 0, -.5], facing: mv ? face(1, 0) : face(.5, -1), walk: mv ? t * 8 : undefined, perform: 0, gesture: mv ? null : (t < 8 ? 'wide' : 'headdown'), brow: mv ? 0 : .5, smile: 0 }; });
    boyP(Wd, MENDY, t => { const x = runX(t, 1), mv = x < 6.6 - 1.15 - .01; return { pos: [x, 0, -.35], facing: mv ? face(1, 0) : face(.5, -1), scale: MS, walk: mv ? t * 9 : undefined, perform: 0, gesture: mv ? null : (t < 9 ? 'shrug' : 'think'), brow: mv ? 0 : .5, smile: 0 }; });
    const nc = board(Wd, { w: 1.3, h: 1.3, draw: drawNoCandle, cw: 512, frame: 0x6b3a1c, glow: 0xff7a7a });
    Wd.on(t => nc.set([5.6, 2.25 + .06 * Math.sin(t * 1.6), -.2], popE(P(6.6, 7.5, t)) * .8, 0));
    Wd.center = [5, 0];
    Wd.cam = seq([0, cine([C0(0, [-3, 1.2, -.5], 6.8, .5, 14), C0(5.0, [3.4, 1.2, -.5], 6.6, .5, -14)])],
      [5.0, cine([C0(5.0, [7.2, 1.45, -1.0], 6.4, .2, -22, 42), C0(9.0, [7.0, 1.45, -1.0], 5.8, .1, 16, 42)])],
      [9.0, cine([C0(9.0, [7.6, 1.9, -1.4], 10.0, .8, 22, 46), C0(14, [7.2, 2.2, -1.4], 12.0, 1.0, -14, 48)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-44: three objects float up in a row: ghost candle (missing), clear bulb, white tube
  function s3(dur) {
    const Wd = skyW(), G = guestRoom(Wd); shabbatTable(Wd, 0, 0, true); sideTable(Wd, LAMP_POS[0], LAMP_POS[2]); tableLamp(Wd, { pos: LAMP_POS, on: () => 0 });
    const gh = ghostCandle(Wd), bu = clearBulb(Wd), tu = fluoTube(Wd); Wd.bulbG = bu.g;
    const X = [-1.05, 0, 1.0], rise = (a, t) => sm(P(a, a + 1.5, t)), Y0 = TY + .2, Y1 = 2.1;
    const sparks = sparkleMotes(Wd, 14, [0, 2.2, 0], 2.2, 0xffe9a8, .16);
    Wd.on(t => { sparks(t);
      const r0 = rise(1.2, t), r1 = rise(3.0, t), r2 = rise(4.8, t), lit = sm(P(6.4, 7.8, t));
      gh.set([X[0], lerp(Y0, 1.2, r0) + .05 * Math.sin(t * 1.5), .55], popE(P(1.2, 2.0, t)) * .85, 1 - .1 * lit);
      bu.set([X[1], lerp(1.6, 1.64, r1) + .04 * Math.sin(t * 1.4 + 1), .55], popE(P(3.0, 3.8, t)) * .55, .3 * Math.sin(t * .5), lit, 0);
      tu.set([X[2], lerp(Y0, 1.55, r2) + .05 * Math.sin(t * 1.3 + 2), .55], popE(P(4.8, 5.6, t)) * .42, .2 * Math.sin(t * .6), lit); });
    seated(Wd, (t, i) => { const up = sm(P(1.4, 2.6, t)); const look = (i ? -.35 : .35) * (.5 + .5 * Math.sin(t * .7)); return { smile: .2 + .5 * sm(P(4, 6, t)), brow: .35 * (1 - sm(P(8, 9.5, t))), perform: i ? .35 : 0, gesture: !i && t > 3.4 && t < 10 ? 'point' : (!i && t >= 10 ? 'thumb' : null), look, talk: .3 * talkAmt(t, i + 4) * sm(P(5, 6, t)), scale: i ? MS : undefined }; });
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.4, .4], 5.2, .1, 18), C0(5, [0, 1.38, .5], 3.9, .05, -8)])],
      [5, cine([C0(5, [0, 1.38, .5], 3.7, .04, -12), C0(9, [0, 1.38, .5], 3.6, .02, 12)])],
      [9, cine([C0(9, [0, 1.38, .5], 3.7, .04, 12), C0(14, [0, 1.4, .5], 4.6, .1, -10)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-58: camera dives into the clear bulb: the glowing filament looks like a tiny flame; big green check
  function s4(dur) {
    const Wd = mkWorld({ skyTop: 0xb8601c, skyBottom: 0xe8963a, fogColor: 0xd98a34, fogNear: 30, fogFar: 90, hemi: .95, sun: .55, sunColor: 0xfff1dc, sunPos: [-10, 20, 14], shadowExt: 10 });
    const fl = new THREE.Mesh(new THREE.CircleGeometry(40, 48), toon(0xc98238)); fl.rotation.x = -PI / 2; fl.position.y = -2.2; fl.receiveShadow = true; Wd.add(fl);
    const bu = clearBulb(Wd), S = 3.0;
    const sparks = sparkleMotes(Wd, 20, [0, 0, 0], 3.2, 0xffe6a0, .2), halo = glowAt(Wd.scene, 6, 0xffb040, 0); halo.position.set(0, 0, -1.2);
    const ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a);
    const cdl = candle(Wd, { pos: [-2.7, -1.35, -.5], h: .5, r: .04, holderColor: 0xe8d9b8, light: null, glowSize: 1.6, flame: t => sm(P(9.6, 10.4, t)), appear: t => P(9.2, 10, t) });
    Wd.on(t => { sparks(t);
      const k = sm(P(1.0, 2.6, t)), fk = sm(P(5.0, 7.2, t)) * (1 - .55 * sm(P(9.2, 10.8, t)));
      bu.set([0, -.72 * S, 0], popE(P(0, .9, t)) * S, .45 * Math.sin(t * .45) + .1, k * (.92 + .08 * Math.sin(t * 9)), fk, 1 - sm(P(2.5, 4.5, t)) + sm(P(9.0, 11, t)));
      halo.material.opacity = .16 * k;
      ck.set([1.4, .9 + .05 * Math.sin(t * 3), 1.0], popE(P(8.2, 9.2, t)) * 1.1, .06 * Math.sin(t * 3)); sk.set([1.4, .9, 1.0], P(8.2, 9.2, t), 3.4); });
    Wd.center = [0, 0]; Wd.noQ = true;
    Wd.cam = seq([0, cine([C0(0, [0, 0, 0], 8.0, 1.4, 28, 42), C0(3.5, [0, 0, 0], 4.2, .5, 14, 42), C0(7, [0, 0, 0], 1.3, .02, -8, 38)])],
      [7, cine([C0(7, [0, 0, 0], 1.3, .02, -8, 38), C0(8.5, [0, .05, 0], 1.7, .1, 6, 38), C0(11, [.1, .15, 0], 5.0, .8, 22, 44), C0(14, [0, .1, 0], 6.8, 1.2, -6, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-72: the fluorescent tube flickers on by itself: a smaller green check; a bracha (golden sefer glow)
  function s5(dur) {
    const Wd = skyW(), G = guestRoom(Wd); shabbatTable(Wd, 0, 0, true); sideTable(Wd, LAMP_POS[0], LAMP_POS[2]); tableLamp(Wd, { pos: LAMP_POS, on: () => 0 });
    const tu = fluoTube(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), bk = openBook(Wd, { text: 'ברכה' });
    const flick = t => { const a = P(1.4, 3.6, t); if (a <= 0) return 0; if (a >= 1) return 1; const s = Math.sin(a * 60) + Math.sin(a * 37 + 1); return s > 0 || a > .8 ? Math.max(.2, a) : .05; };
    const sparks = sparkleMotes(Wd, 14, [0, 2.3, 0], 1.6, 0xfff0c0, .15), sp2 = sparkleMotes(Wd, 12, [1.6, 2.1, .4], .6, 0xffe08a, .13);
    Wd.on(t => { sparks(t); sp2(t); tu.set([-.5, 1.95 + .07 * Math.sin(t * 1.3), .3], popE(P(.3, 1.2, t)) * .85, .3 + .2 * Math.sin(t * .5), flick(t));
      ck.set([1.0, 2.35, .6], popE(P(5.0, 6.0, t)) * .85, .05 * Math.sin(t * 3)); sk.set([1.0, 2.35, .6], P(5.0, 6.0, t), 3.0);
      bk.set([-1.8, 1.95 + .06 * Math.sin(t * 1.4), .5], popE(P(8.0, 9.0, t)) * .3, sm(P(8.6, 10, t))); bk.g.rotation.y = .25; });
    seated(Wd, (t, i) => { const w = sm(P(3.4, 4.6, t)); return { smile: .15 + .8 * w, brow: .3 * (1 - w), perform: i ? .4 : 0, gesture: !i && t > 6 ? 'thumb' : null, look: (i ? -.3 : .3) * (.5 + .5 * Math.sin(t * .8)), talk: .2 * talkAmt(t, i + 8) * w, scale: i ? MS : undefined }; });
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [0, 1.55, 0], 5.8, .6, -18), C0(4.2, [0, 1.55, .2], 4.6, .3, 14)])],
      [4.2, cine([C0(4.2, [.1, 1.6, .2], 4.4, .2, 20), C0(8.2, [.1, 1.6, .2], 4.5, .2, -22)])],
      [8.2, cine([C0(8.2, [-.1, 1.5, -.3], 4.8, .4, -14), C0(14, [0, 1.5, -.3], 5.8, .6, 24)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 72-86: the table lamp switches on BY ITSELF; warm light spreads over the table and challah; the boys smile
  function s6(dur) {
    const Wd = skyW({ hemi: .8, sun: .5 }), G = guestRoom(Wd); shabbatTable(Wd, 0, 0, true); sideTable(Wd, LAMP_POS[0], LAMP_POS[2]);
    const kOn = t => sm(P(3.4, 6.2, t));
    tableLamp(Wd, { pos: LAMP_POS, on: kOn });
    lighting(Wd, t => { const k = kOn(t); G.dim(k * .55); return { hemi: lerp(.8, .95, k), sun: lerp(.5, .8, k), hemiColor: mix(DIMC, WARM, k), sunColor: mix(new THREE.Color(0xc8cde8), new THREE.Color(0xfff1dc), k), sky: [mix(new THREE.Color(0x6a7fd8), new THREE.Color(0x4a5ab8), k).getHex(), mix(new THREE.Color(0xffb37a), new THREE.Color(0xe39a72), k).getHex()] }; });
    const gl = glowAt(Wd.scene, 6, 0xffc070, 0); gl.position.set(.4, 1.0, .1); Wd.on(t => gl.material.opacity = .42 * kOn(t));
    const sparks = sparkleMotes(Wd, 12, [.2, 1.3, .1], 1.5, 0xffe9a8, .13); Wd.on(t => sparks(t));
    seated(Wd, (t, i) => { const k = kOn(t); return { smile: .1 + .9 * k, brow: .3 * (1 - k), perform: .25 * k, gesture: null, look: (.5 - k * .5) * (i ? -1 : 1) * .6, talk: k > .8 ? .4 * talkAmt(t, i + 3) : 0, scale: i ? MS : undefined }; });
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [.6, 1.1, -.5], 4.4, .5, 20), C0(3.6, [1.4, 1.15, -.5], 3.4, .3, 10)])],
      [3.6, cine([C0(3.6, [1.0, 1.15, -.5], 3.0, .2, 14, 42), C0(7.4, [.5, 1.1, -.5], 3.0, .2, -14, 42)])],
      [7.4, cine([C0(7.4, [0, 1.1, -.6], 3.2, .75, -20, 42), C0(11, [0, 1.1, -.6], 2.8, .7, 16, 40)])],
      [11, cine([C0(11, [0, 1.1, -.6], 2.8, .15, 16, 40), C0(14, [0, 1.15, -.5], 4.6, .6, -10, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 86-100: next erev Shabbat, at home: the candle box packs itself into the suitcase first; candles burn on the home table
  function s7(dur) {
    const Wd = skyW(), G = guestRoom(Wd, 0xf2d9b8);
    Wd.add(box(1.4, 2.4, .5, 0x7a4a2a, { pos: [-4.2, 1.2, -4.0] }));   // home bookcase
    shabbatTable(Wd, 2.6, -1.2, true, true);
    const sc = suitcase(Wd, -1.4, -.9, .25), cb = candleBox(Wd, { empty: false });
    const T0 = 1.0, T1 = 3.6, closeK = t => 1 - sm(P(4.2, 5.6, t));
    Wd.on(t => { sc.open(closeK(t)); const u = P(T0, T1, t), p = arcPt([-3.6, 2.0, -3.7], [-1.4, .32, -.9], sm(u), .6); cb.set(p, .25 + u * .5, 1, 0, sin2(u) * .35); });
    const sin2 = u => Math.sin(PI * u);
    const sparks = sparkleMotes(Wd, 10, [-1.4, .8, -.9], .9, 0xffe9a8, .12); Wd.on(t => sparks(t));
    const cs = [1.3, 3.9].map((x, i) => candle(Wd, { pos: [x, CT, -1.2], h: .3, light: { color: 0xffb35a, i: .7, dist: 7 }, glowSize: 1.3, fs: 2.4, flame: t => sm(P(.9 + i * .4, 1.7 + i * .4, t)), appear: t => P(.3 + i * .2, .9 + i * .2, t) }));
    Wd.occ = [cb.g].concat(cs.map(c => c.g));
    const lampOff = (sideTable(Wd, 5.0, -3.4), tableLamp(Wd, { pos: [5.0, .63, -3.4], on: () => 0 }));
    const gl = glowAt(Wd.scene, 5, 0xffc070, 0); gl.position.set(2.6, 1.1, -1.0); Wd.on(t => gl.material.opacity = .12 * sm(P(8, 10, t)));
    lighting(Wd, t => ({ hemi: lerp(.8, .85, sm(P(7, 10, t))), sun: .7, hemiColor: mix(new THREE.Color(0xfff0dc), WARM, sm(P(7, 10, t))) }));
    boyK(Wd, YANKY, t => { if (t >= 6.4) return Object.assign({ pos: [3.15, RB, -2.02], facing: 0, smile: .9, perform: .3, talk: .25 * talkAmt(t, 7) * sm(P(8, 9, t)), look: -.1 }, SIT); const a = sm(P(T1 - .3, T1 + .6, t)); return { pos: [-2.7, 0, -.9], facing: PI / 2, gesture: t < T0 ? 'wide' : (t < T1 + .6 ? 'point' : (t < 6.2 ? 'finger' : 'thumb')), perform: 0, smile: t < T1 ? .3 : .95, brow: t < T1 ? .2 : 0, look: .1 }; });
    boyK(Wd, MENDY, t => Object.assign({ pos: [2.05, t < 6.3 ? -6 : RB, -2.02], facing: 0, scale: MS, smile: .4 + .55 * sm(P(8, 9.5, t)), perform: .3, talk: .3 * talkAmt(t, 6) * sm(P(9, 10, t)), look: .1 * Math.sin(t * .6) }, SIT));
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C0(0, [-2.5, .9, -2.2], 5.6, 1.0, 16), C0(4.0, [-2.3, .85, -1.6], 4.6, .6, -8)])],
      [4.0, cine([C0(4.0, [-1.9, .85, -.8], 3.8, .35, -20, 42), C0(6.4, [-1.8, .85, -.8], 3.6, .3, 14, 42)])],
      [6.4, cine([C0(6.4, [2.6, 1.15, -1.5], 3.4, .3, -14, 42), C0(10.5, [2.6, 1.15, -1.6], 2.9, .2, 10, 40)])],
      [10.5, cine([C0(10.5, [.8, 1.2, -1.2], 6.4, 1.2, 14, 44), C0(14, [.8, 1.3, -1.2], 5.6, .9, -10, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the Shabbat table with the lit lamp behind the card
  function answerBg(dur) {
    const Wd = skyW({ hemi: 1.2, sun: 1.1 }), G = guestRoom(Wd); G.dim(.2);
    shabbatTable(Wd, 0, 2.4, true); sideTable(Wd, 2.3, 2.1); tableLamp(Wd, { pos: [2.3, .63, 2.1], on: () => 1 });
    const gl = glowAt(Wd.scene, 7, 0xffc070, .4); gl.position.set(0, 1.2, 2.6);
    const sparks = sparkleMotes(Wd, 14, [0, 1.6, 2.4], 1.8, 0xffe9a8, .14); Wd.on(t => sparks(t));
    boyP(Wd, YANKY, t => Object.assign({ pos: [-.55, RB, 1.58], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }, SIT));
    boyP(Wd, MENDY, t => Object.assign({ pos: [.55, RB, 1.58], facing: 0, scale: MS, smile: 1, perform: .5, talk: .5 * talkAmt(t, 3) }, SIT));
    Wd.center = [0, 1.6]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
