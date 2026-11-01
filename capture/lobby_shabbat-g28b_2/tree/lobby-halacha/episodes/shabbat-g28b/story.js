// shabbat-g28b story: wine or grape juice for kiddush (Azamra 28, Vayigash) - 3D choreography per storyboards_v9.md (C). Candlesticks already burning far at the back; nobody near a flame; nobody drinks; no women.
// Abba (adult man) + Moishy (12) + Ari (10). Candlesticks ALREADY burning far at the back (sideboard), nobody near a flame. No women anywhere.
// Every world exposes people (.kippa) and occ (moving props).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, boyP, talkAmt, face, mkWorld, plainRoom, diningTable, chair, candle, mark3d, board, drawWord,
    bill, popE, lighting, glowAt, glowSprite, texPlane, toon, bm, canvasTex, FONT, archShape, shock, person } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C0 = (t, tg, d, h, a, fov) => [t, tg, d, h, a, fov === undefined ? 44 : fov, .0001];
  const TY = .72, TT = .76, SIT = { sit: true, groundY: 0 };
  const WARM = new THREE.Color(0xffe2b0);
  const RB = .17;
  const MOISHY = 0, ARI = 3;
  const SKIN = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
  const SILV = 0xdfe3ee;
  const JUICE = new THREE.Color(0x4a1466), DIL = new THREE.Color(0x9a5cd0);

  // ---------------------------------------------------------------- people
  const findKippa = (P_) => { let done = false; return () => { if (done || !P_.figure) return; done = true; P_.figure.group.traverse(m => { if (m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && (Math.abs(m.geometry.parameters.thetaLength - .86) < 1e-3 || m.geometry.parameters.thetaLength === .8)) { P_.kippa = m; m.material = m.material.clone(); m.material.color.set(0x2a40a0); } }); }; };
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(findKippa(Pn)); return Pn; };
  const manK = (Wd, look, fn, seed) => {
    const Pn = person(Wd, Object.assign({ kind: 'man', hat: 'kippa', glasses: false }, look), t => Object.assign({ seed: seed }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(Pn);
    Wd.on(findKippa(Pn)); return Pn;
  };
  const ABBA = { beardLen: .7, beard: '#3a2618', skin: SKIN[2], glasses: false, pants: '#1b1d24', coat: '#26293a' };

  // ---------------------------------------------------------------- room + table
  function sunsetTex() {
    return canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5b6fd0'); gr.addColorStop(.55, '#ff9a5a'); gr.addColorStop(.9, '#ffd27a'); gr.addColorStop(1, '#ffe9a8'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#7a4a4a'; for (const [x, bw, bh] of [[0, 30, 40], [28, 24, 62], [52, 30, 34], [82, 22, 52], [104, 30, 38]]) c.fillRect(x, h - bh, bw, bh); });
  }
  const NIGHT = new THREE.Color(0x3c4a8a);
  function nightWin(Wd, x, y0, z, w, h) {
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), bm(0xffffff, { map: sunsetTex() })); pn.position.z = .02;
    const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
    pn.material.color.copy(NIGHT);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(.13, 20), new THREE.MeshBasicMaterial({ color: 0xfff6d0, transparent: true, opacity: .9, fog: false })); moon.position.set(w * .12, h * .6, .03); g.add(moon);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .05], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
  }
  function room(Wd) {
    const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: 0xf4e8cc, beams: false });
    for (const x of [-2.6, 2.6]) { nightWin(Wd, x, 1.0, -R.HZ + .02, 1.6, 2.1); for (const dx of [-1, 1]) Wd.add(box(.4, 2.4, .12, 0xd9a05f, { pos: [x + dx * 1.05, 1.9, -R.HZ + .12], ink: false })); }
    Wd.add(box(1.5, 2.5, .12, 0x7a4a2a, { pos: [4.5, 1.25, -R.HZ + .08] }));
    for (const x of [-4, -1.3, 1.4, 4]) Wd.add(box(.3, .35, 3.4, 0x6a4326, { pos: [x, R.H - .18, -R.HZ + 1.7], ink: false }));
    // sideboard far at the back with two burning candlesticks (nobody near)
    const sx = -2.2, sz = -R.HZ + .45;
    Wd.add(box(1.7, .9, .5, 0x6a4326, { pos: [sx, .45, sz] })); Wd.add(box(1.8, .05, .56, 0x8a5a30, { pos: [sx, .925, sz], ink: false }));
    const cs = [-1, 1].map((s, i) => candle(Wd, { pos: [sx + s * .42, .95, sz], h: .2, r: .03, light: { color: 0xffb35a, i: .4, dist: 6 }, glowSize: .6, fs: 1.1, flame: () => 1 })); cs.forEach(c => c.g.scale.setScalar(1.9));
    return R;
  }
  function table(Wd, z0) {   // Shabbat table: cloth, two challot under a blue cover (left), plates
    diningTable(Wd, { x: 0, z: z0, len: 3.0, wid: 1.1, food: false });
    Wd.add(box(.62, .1, .34, 0x244a86, { pos: [-1.2, TY + .1, z0 - .12] })); Wd.add(ball(.17, 0xe3b25a, { pos: [-1.2, TY + .15, z0 - .12], scale: [1.5, .6, 1] }));
    for (const x of [-.7, .7]) { Wd.add(cyl(.17, .15, .02, 0xffffff, { pos: [x, TY + .07, z0 + .4], ink: false })); Wd.add(cyl(.11, .1, .02, 0xe9eef7, { pos: [x, TY + .09, z0 + .4], ink: false })); }
  }
  function sparks(Wd, n, center, rad, color, size) {
    const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(size || .14, size || .14, 0); s.material.color.set(color || 0xffe9a8); Wd.add(s); sp.push(s); }
    return t => sp.forEach((s, i) => { const a = i * 2.4 + t * (.4 + (i % 3) * .15); s.position.set(center[0] + Math.cos(a) * rad * (.6 + .4 * ((i * 7) % 5) / 4), center[1] + Math.sin(a * 1.3) * rad * .35 + ((i % 4) - 1.5) * .1, center[2] + Math.sin(a) * rad * .4); s.material.opacity = .3 + .4 * Math.sin(t * 2.2 + i * 1.7) ** 2; });
  }
  const skyW = (o) => mkWorld(Object.assign({ skyTop: 0x6a7fd8, skyBottom: 0xffb37a, fogColor: 0xffc99a, fogNear: 40, fogFar: 140, hemi: 1.15, hemiSky: 0xfff0dc, hemiGround: 0x9a8660, sun: 1.3, sunColor: 0xffd9a8, sunPos: [-14, 26, 16] }, o || {}));
  const warm = (Wd) => lighting(Wd, () => ({ hemi: 1.0, sun: .7, hemiColor: WARM, sunColor: new THREE.Color(0xf0e2cc) }));
  const mkPlaque = (Wd, text, w, h, bg, fg, bd) => board(Wd, { w: w, h: h, draw: drawWord(text, bg || '#fff4cf', fg || '#7a1c1c', bd || '#d9a63a'), cw: 768, frame: 0x6b3a1c, glow: 0xffd27a });
  function qmark(Wd, fill) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(texPlane(.7, .7, (c, W, H) => { c.font = `800 ${H * .9}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = H * .12; c.strokeStyle = '#2a2a30'; c.strokeText('?', W / 2, H / 2 + H * .04); c.fillStyle = fill || '#ffd34a'; c.fillText('?', W / 2, H / 2 + H * .04); }, { cw: 256, ro: 8 }));
    bill(Wd, g);
    return { g, set(pos, sc, rz) { g.visible = sc > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(sc); inner.rotation.z = rz || 0; } };
  }


  // ---------------------------------------------------------------- props: silver kiddush cup, bottles (wine / juice / natural juice), star, vine
  const WINE = 0x6e0f22;
  function cup(Wd, S) {   // origin at the base; liquid via setLiq(level 0..1, colour)
    const g = new THREE.Group(); g.scale.setScalar(S); Wd.add(g);
    g.add(cyl(.1, .12, .025, SILV, { pos: [0, .0125, 0] })); g.add(cyl(.02, .03, .12, SILV, { pos: [0, .085, 0] })); g.add(ball(.04, SILV, { pos: [0, .1, 0], ink: false }));
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.088, .046, .15, 32, 1, true), toon(SILV, { side: THREE.DoubleSide, emissive: new THREE.Color(0x30343c) })); bowl.position.y = .22; g.add(bowl);
    g.add(cyl(.046, .046, .008, SILV, { pos: [0, .146, 0], ink: false }));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.088, .007, 8, 32), toon(0xf4f6fb, { emissive: new THREE.Color(0x40444c) })); rim.rotation.x = PI / 2; rim.position.y = .295; g.add(rim);
    const liqG = new THREE.Group(); liqG.position.y = .152; g.add(liqG);
    const liqMat = bm(WINE);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(.08, .047, .138, 28), liqMat); liq.position.y = .069; liqG.add(liq);
    const api = { g, S, setLiq(l, col) { liqG.scale.set(Math.max(.2, (.047 + .042 * l + .006) / .08), Math.max(.001, l), Math.max(.2, (.047 + .042 * l + .006) / .08)); liqG.visible = l > .02; liqMat.color.set(col === undefined ? WINE : col); },
      set(p) { g.position.set(p[0], p[1], p[2]); }, surf(l) { return g.position.y + (.152 + .138 * l) * S; } };
    api.setLiq(.5); return api;
  }
  function labelTex(sp) {
    return (c, W, H) => { c.fillStyle = sp.bg; c.fillRect(0, 0, W, H); c.strokeStyle = sp.bd; c.lineWidth = H * .035; c.strokeRect(H * .03, H * .03, W - H * .06, H - H * .06);
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillStyle = sp.fg;
      if (sp.l2) { c.font = `900 ${H * .3}px ${FONT}`; c.fillText(sp.l1, W / 2, H * .32); c.font = `900 ${H * .27}px ${FONT}`; c.fillText(sp.l2, W / 2, H * .64); }
      else { c.font = `900 ${H * sp.fs}px ${FONT}`; c.fillText(sp.l1, W / 2, H * .4); }
      for (let i = 0; i < 5; i++) { c.fillStyle = sp.dots[i % 2]; c.beginPath(); c.arc(W * (.3 + i * .1), H * .87 - (i % 2) * H * .03, H * .045, 0, 7); c.fill(); } };
  }
  const SPEC = {
    wine: { glass: 0x5a0a18, hl: 0xff9aa8, cap: 0xd9a63a, shape: 0, bg: '#fff1d6', bd: '#8a1428', fg: '#7a0f20', l1: 'יין', fs: .46, dots: ['#8a1428', '#5a0a18'] },
    juice: { glass: 0x3a1058, hl: 0xcfa0ee, cap: 0xd9a63a, shape: 0, bg: '#fff4d6', bd: '#7a1c8a', fg: '#5a1470', l1: 'מיץ ענבים', fs: .3, dots: ['#7a2a9a', '#5a1470'] },
    nat: { glass: 0x7a3aa8, hl: 0xe8c8ff, cap: 0x4fae4f, shape: 1, bg: '#f2ffe6', bd: '#3e8a3e', fg: '#4a1a78', l1: 'מיץ ענבים', l2: 'טבעי', dots: ['#7a3aa8', '#4fae4f'] }
  };
  function bottle(Wd, kind, S) {   // origin at the base; shape 1 = squat natural-juice bottle
    const sp = SPEC[kind], sq = sp.shape === 1;
    const g = new THREE.Group(); g.scale.setScalar(S); Wd.add(g);
    const rb = sq ? .15 : .12, hb = sq ? .3 : .34;
    g.add(cyl(rb, rb + .005, hb, sp.glass, { pos: [0, hb / 2, 0] }));
    if (sq) { g.add(cyl(.07, rb, .07, sp.glass, { pos: [0, hb + .035, 0] })); g.add(cyl(.05, .07, .08, sp.glass, { pos: [0, hb + .11, 0] })); g.add(cyl(.05, .05, .05, sp.glass, { pos: [0, hb + .175, 0] })); }
    else { g.add(cyl(.045, .12, .09, sp.glass, { pos: [0, .385, 0] })); g.add(cyl(.036, .045, .12, sp.glass, { pos: [0, .49, 0] })); }
    const capY = sq ? hb + .22 : .57;
    const cap = cyl(.042, .042, .045, sp.cap, { pos: [0, capY, 0] }); if (sq) cap.scale.set(1.25, 1, 1.25); g.add(cap);
    const lab = texPlane(sq ? .3 : .24, .2, labelTex(sp), { cw: 512, opaque: true, ro: 2, depthWrite: true }); lab.position.set(0, hb * .5, rb + .008); g.add(lab);
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(.025, hb * .85), new THREE.MeshBasicMaterial({ color: sp.hl, transparent: true, opacity: .35, fog: false })); hl.position.set(-rb * .72, hb * .5, rb * .7); hl.rotation.y = -.5; g.add(hl);
    return { g, S, mouth: [0, capY - .02], top: capY + .03, cap(v) { cap.visible = v; } };
  }
  function place(it, M, a) {   // put the mouth of a bottle at point M with tilt a (z rotation)
    const c = Math.cos(a), s = Math.sin(a), mx = it.mouth[0], my = it.mouth[1], S = it.S;
    it.g.rotation.z = a; it.g.position.set(M[0] - S * (mx * c - my * s), M[1] - S * (mx * s + my * c), M[2]);
  }
  function stream(Wd) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10), bm(WINE)); m.visible = false; Wd.add(m);
    return { g: m, set(x, z, yTop, yBot, col, vis) { const H = yTop - yBot; m.visible = vis && H > .01; if (!m.visible) return; m.material.color.set(col); m.position.set(x, (yTop + yBot) / 2, z); m.scale.set(.035, H, .035); } };
  }
  function star(Wd, R) {   // gold five-point star, faces the camera (+z)
    const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? R * .45 : R, a = PI / 2 + i * PI / 5; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); } sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: R * .35, bevelEnabled: true, bevelThickness: R * .06, bevelSize: R * .06, bevelSegments: 2 }); geo.translate(0, 0, -R * .17);
    const m = new THREE.Mesh(geo, toon(0xffc83a, { emissive: new THREE.Color(0x7a5200) }));
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); inner.add(m); g.visible = false; Wd.add(g);
    const gl = glowSprite(R * 4, R * 4, .5); gl.material.color.set(0xffe27a); gl.position.z = -R * .4; inner.add(gl);
    return { g, set(pos, s, ry, rz) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.set(0, ry || 0, rz || 0); } };
  }
  function cluster(n, R, col1, col2) {   // hanging grape cluster
    const g = new THREE.Group(); let k = 0;
    for (let row = 0; row < 4; row++) for (let j = 0; j < 4 - row; j++) { const b = ball(R, (k++) % 2 ? col1 : col2, { ink: false, pos: [(j - (3 - row) / 2) * R * 1.8, -row * R * 1.55, ((j + row) % 2 - .5) * R * .5] }); g.add(b); }
    return g;
  }
  function vine(Wd) {   // a green canopy that grows over the two bottles, clusters hanging
    const g = new THREE.Group(); Wd.add(g);
    const stems = [], parts = [];
    const pathL = new THREE.CatmullRomCurve3([[0, .8, 0], [-.15, 1.3, .02], [-.5, 1.75, 0], [-1.0, 2.0, .02], [-1.5, 2.1, 0]].map(a => new THREE.Vector3(a[0], a[1], a[2])));
    const pathR = new THREE.CatmullRomCurve3([[0, .8, 0], [.15, 1.35, .02], [.5, 1.8, 0], [1.0, 2.05, .02], [1.5, 2.15, 0]].map(a => new THREE.Vector3(a[0], a[1], a[2])));
    for (const path of [pathL, pathR]) {
      const geo = new THREE.TubeGeometry(path, 40, .04, 8, false); const m = new THREE.Mesh(geo, toon(0x6a8a2e)); g.add(m); stems.push({ geo, tot: geo.index.count });
      [[.35, 1], [.55, 0], [.75, 1], [.92, 0]].forEach(([u, side], ii) => {
        const p = path.getPoint(u), lf = new THREE.Group(); lf.position.copy(p);
        const leaf = ball(.17, 0x4ea03a, { ink: false, scale: [1.5, .22, 1.15] }); leaf.position.set(side ? .12 : -.12, .02, 0); lf.add(leaf); lf.rotation.z = side ? -.5 : .5; g.add(lf); parts.push({ o: lf, u, k: 1 });
        if (ii !== 1) { const cl = cluster(10, .075, 0x6a2a8a, 0x4f1a70); cl.position.set(p.x, p.y - .06, p.z + .04); cl.scale.setScalar(1.35); g.add(cl); parts.push({ o: cl, u: u + .04, k: 1.35 }); }
      });
    }
    const mid = cluster(10, .09, 0x6a2a8a, 0x4f1a70); mid.position.set(0, 1.35, .05); mid.scale.setScalar(1.45); g.add(mid); parts.push({ o: mid, u: .15, k: 1.45 });
    return { g, set(gr) { g.visible = gr > .01; stems.forEach(s => s.geo.setDrawRange(0, Math.floor(s.tot * clamp(gr, 0, 1) / 3) * 3)); parts.forEach(p => { p.o.scale.setScalar(Math.max(.001, p.k * popE(clamp((gr - p.u) * 6, 0, 1)))); }); } };
  }

  // people helpers
  const mois = (Wd, fn) => boyK(Wd, MOISHY, fn), ari = (Wd, fn) => boyK(Wd, ARI, fn);
  const abba = (Wd, fn) => manK(Wd, ABBA, fn, .5);
  const stand = (Wd, b, x, y) => { b.g.visible = true; b.g.position.set(x, TT, 0); };

  // ---------------------------------------------------------------- 1. HOOK 0-14: wine bottle and juice bottle on the table, Moishy looks from one to the other, big ?
  function hook(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const w = bottle(Wd, 'wine', 1.8), j = bottle(Wd, 'juice', 1.8), sp = sparks(Wd, 10, [0, 2.0, -.8], 2.0, 0xffe9a8, .12);
    Wd.on(t => { sp(t);
      w.g.position.set(-.98, TT, -.25); w.g.rotation.set(0, .22 + .12 * Math.sin(t * .9), .035 * Math.sin(t * 1.7));
      j.g.position.set(.72, TT, -.25); j.g.rotation.set(0, -.22 + .12 * Math.sin(t * .8 + 1), .035 * Math.sin(t * 1.6 + 1)); });
    mois(Wd, t => ({ pos: [-2.3, 0, -.95], facing: face(.6 + .5 * Math.sin(t * .9), 1), gesture: 'offer', perform: 0, smile: .3, brow: .3, look: Math.sin(t * .9) * .5 }));
    ari(Wd, t => ({ pos: [2.2, 0, -.95], facing: face(-.6, 1), gesture: 'offer', perform: 0, smile: .5, look: -.1 }));
    abba(Wd, t => ({ pos: [0, 0, -1.9], facing: 0, gesture: t > 4 ? 'think' : null, perform: t > 4 ? 0 : .4, smile: .4, brow: .3, look: .1, talk: 0 }));
    Wd.occ = [w.g, j.g]; Wd.center = [0, 0]; Wd.qSize = 1.1; Wd.qPos = [0, -.9];
    Wd.cam = cine([C0(0, [0, 1.3, -.5], 3.5, .5, -14), C0(5, [0, 1.3, -.5], 3.2, .4, 8), C0(10, [0, 1.3, -.5], 3.3, .4, -8), C0(14, [0, 1.3, -.5], 3.2, .4, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: the grape-juice bottle glows, green check pops
  function s2(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const w = bottle(Wd, 'wine', 1.9), j = bottle(Wd, 'juice', 2.2), ck = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a), sp = sparks(Wd, 14, [.7, 1.7, -.2], 1.3, 0xe6c4ff, .15), gl = glowAt(Wd.scene, 3.2, 0xd7a8ff, .22);
    gl.position.set(.7, 1.5, -.6);
    Wd.on(t => { sp(t);
      w.g.position.set(-.8, TT, -.25); w.g.rotation.set(0, .2 + .08 * Math.sin(t * .7), 0);
      const k = 1 + .03 * Math.sin(t * 2.2); j.g.position.set(.7, TT, -.2); j.g.rotation.set(0, -.2 + .1 * Math.sin(t * .6), 0); j.g.scale.setScalar(2.2 * k);
      gl.material.opacity = .15 + .12 * Math.sin(t * 1.6) + .12 * sm(P(1, 3, t));
      ck.set([.7, 2.45 + .04 * Math.sin(t * 2), -.2], popE(P(3, 4, t)) * .6, .06 * Math.sin(t * 3)); sk.set([.7, 2.45, -.2], P(3, 4, t), 2.4); });
    mois(Wd, t => ({ pos: [-2.0, 0, -1.0], facing: face(.7, 1), gesture: null, perform: .4, smile: .6, look: .3 }));
    ari(Wd, t => ({ pos: [2.2, 0, -1.0], facing: face(-.7, 1), gesture: t > 5 ? 'thumb' : null, perform: t > 5 ? 0 : .4, smile: .8, look: -.3 }));
    Wd.occ = [w.g, j.g, ck.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [.1, 1.45, -.3], 3.8, .6, -12), C0(5, [.1, 1.5, -.25], 3.4, .5, 6), C0(10, [.1, 1.5, -.2], 3.2, .4, -6), C0(dur, [.1, 1.5, -.2], 3.5, .5, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-46: a vine with big clusters grows behind both bottles; tag over both
  function s3(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const w = bottle(Wd, 'wine', 1.7), j = bottle(Wd, 'juice', 1.7), vn = vine(Wd), tag = mkPlaque(Wd, 'בורא פרי הגפן', 2.8, .72, '#ecdcff', '#3a1058', '#7a2a9a'), sp = sparks(Wd, 12, [0, 2.2, -.8], 2.2, 0xffe9a8, .12);
    vn.g.position.set(0, TT - .1, -.75);
    Wd.on(t => { sp(t);
      w.g.position.set(-.55, TT, -.1); w.g.rotation.set(0, .15 + .06 * Math.sin(t * .8), 0);
      j.g.position.set(.55, TT, -.1); j.g.rotation.set(0, -.15 + .06 * Math.sin(t * .7), 0);
      vn.set(sm(P(.8, 6.5, t))); vn.g.rotation.z = .012 * Math.sin(t * 1.2);
      tag.set([0, 2.95 + .03 * Math.sin(t * 1.5), -.5], popE(P(7.5, 8.7, t)) * .55, .04 * Math.sin(t * 1.1)); });
    mois(Wd, t => ({ pos: [-2.4, 0, -1.0], facing: face(.7, 1), gesture: null, perform: .4, smile: .6, look: .3 }));
    ari(Wd, t => ({ pos: [2.4, 0, -1.0], facing: face(-.7, 1), gesture: null, perform: .4, smile: .6, look: -.3 }));
    Wd.occ = [w.g, j.g, vn.g, tag.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [0, 1.7, -.4], 4.4, .7, -10), C0(5, [0, 1.75, -.4], 4.1, .6, 6), C0(10, [0, 1.8, -.4], 4.0, .6, -6), C0(dur, [0, 1.8, -.4], 4.2, .6, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 46-62: gold star "mitzva min hamuvchar" lands on the wine bottle
  function s4(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const w = bottle(Wd, 'wine', 2.1), j = bottle(Wd, 'juice', 1.8), st = star(Wd, .34), shk = shock(Wd, 0xffd24a), tag = mkPlaque(Wd, 'מצוה מן המובחר', 2.9, .72, '#fff0b8', '#5a3a00', '#d9a63a'), gl = glowAt(Wd.scene, 3.0, 0xffd27a, .2), sp = sparks(Wd, 12, [-.7, 2.2, -.4], 1.4, 0xffe27a, .13);
    const WX = -.7, topY = TT + 2.1 * w.top;
    gl.position.set(WX, 1.6, -.6);
    Wd.on(t => { sp(t);
      w.g.position.set(WX, TT, -.15); w.g.rotation.set(0, .18 + .06 * Math.sin(t * .8), 0);
      j.g.position.set(.75, TT, -.15); j.g.rotation.set(0, -.2 + .06 * Math.sin(t * .7), 0);
      const d = P(1, 3.4, t), fall = d * d, y = lerp(topY + 1.8, topY + .26, fall) + (t > 3.4 ? .04 * Math.abs(Math.sin((t - 3.4) * 5)) * Math.exp(-(t - 3.4) * 1.5) : 0);
      st.set([WX, y + .03 * Math.sin(t * 2) * (d >= 1 ? 1 : 0), -.15], popE(P(.8, 1.4, t)), t * 2.2 * (1 - sm(P(2.8, 3.6, t))), .1 * Math.sin(t * 1.3));
      shk.set([WX, topY + .26, -.15], P(3.4, 4.4, t), 2.4);
      gl.material.opacity = .08 + .2 * sm(P(3, 5, t));
      tag.set([.75, 2.75 + .03 * Math.sin(t * 1.5), -.4], popE(P(4.6, 5.8, t)) * .55, .04 * Math.sin(t * 1.1)); });
    mois(Wd, t => ({ pos: [-2.3, 0, -1.0], facing: face(.7, 1), gesture: t > 5 ? 'thumb' : null, perform: t > 5 ? 0 : .4, smile: .5 + .4 * sm(P(3, 6, t)), look: .3 }));
    ari(Wd, t => ({ pos: [2.5, 0, -1.0], facing: face(-.7, 1), gesture: null, perform: .4, smile: .6, look: -.3 }));
    Wd.occ = [w.g, j.g, st.g, tag.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [0, 1.7, -.3], 4.3, .6, -10), C0(5, [-.05, 1.7, -.3], 4.0, .5, 6), C0(10, [0, 1.75, -.3], 4.0, .5, -6), C0(dur, [0, 1.75, -.3], 4.2, .6, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 62-76: a third bottle (natural juice) slides in; the gold star stays on the wine
  function s5(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const w = bottle(Wd, 'wine', 2.0), j = bottle(Wd, 'juice', 1.7), n = bottle(Wd, 'nat', 1.9), st = star(Wd, .32), tag = mkPlaque(Wd, 'בלי חומר משמר', 2.8, .7, '#e6ffd6', '#1f5a1f', '#3e8a3e'), sp = sparks(Wd, 12, [0, 2.3, -.4], 2.2, 0xffe9a8, .12);
    const topY = TT + 2.0 * w.top;
    Wd.on(t => { sp(t);
      w.g.position.set(-1.0, TT, -.15); w.g.rotation.set(0, .2 + .05 * Math.sin(t * .8), 0);
      j.g.position.set(.1, TT, -.3); j.g.rotation.set(0, -.15 + .05 * Math.sin(t * .7), 0);
      const u = sm(P(.8, 3.6, t)); n.g.visible = P(.8, 1, t) > 0; n.g.scale.setScalar(1.9 * (.5 + .5 * sm(P(.8, 3.0, t)))); n.g.position.set(lerp(1.15, 1.2, u), TT, lerp(.5, -.1, u)); n.g.rotation.set(0, -.25 + .35 * (1 - u) + .05 * Math.sin(t * .9), 0);
      st.set([-1.0, topY + .24 + .03 * Math.sin(t * 2), -.15], 1, .35 * Math.sin(t * .9), .1 * Math.sin(t * 1.3));
      tag.set([.6, 2.9 + .03 * Math.sin(t * 1.5), -.3], popE(P(4.4, 5.6, t)) * .58, .04 * Math.sin(t * 1.1)); });
    mois(Wd, t => ({ pos: [-2.4, 0, -1.0], facing: face(.7, 1), gesture: t > 6 ? 'think' : null, perform: t > 6 ? 0 : .4, smile: .4, brow: .3, look: .3 }));
    ari(Wd, t => ({ pos: [2.7, 0, -1.2], facing: face(-.7, 1), gesture: null, perform: .4, smile: .5, look: -.3 }));
    Wd.occ = [w.g, j.g, n.g, st.g, tag.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [.1, 1.65, -.2], 4.5, .6, -10), C0(5, [.1, 1.65, -.2], 4.2, .5, 6), C0(10, [.1, 1.7, -.2], 4.2, .5, -6), C0(dur, [.1, 1.7, -.2], 4.4, .6, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-90: Abba pours from the wine bottle into the silver cup; the boys stand beside him
  function s6(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const A = cup(Wd, 1.8), w = bottle(Wd, 'wine', 1.5), st = stream(Wd), sp = sparks(Wd, 12, [0, 2.0, -.5], 2.2, 0xffe9a8, .12);
    A.set([.1, TT, -.15]);
    const MM = [.1, 1.5, -.15];
    Wd.on(t => { sp(t);
      const tilt = sm(P(.8, 2.6, t)) * (1 - sm(P(8.4, 10.2, t))), pour = P(2.4, 3, t) * (1 - P(8.2, 8.8, t));
      const lvl = lerp(.02, .95, sm(P(2.8, 8.2, t))); A.setLiq(lvl, WINE);
      place(w, [lerp(-.7, MM[0], sm(P(.3, 2.0, t))), lerp(1.7, MM[1] + .02 * Math.sin(t * 1.8), sm(P(.3, 2.0, t))), MM[2]], -.2 - 1.0 * tilt); w.cap(tilt < .1);
      st.set(MM[0], MM[2], MM[1] - .02, A.surf(lvl), WINE, pour > .2); });
    abba(Wd, t => ({ pos: [-1.9, 0, -1.0], facing: face(.6, 1), gesture: t < 9 ? 'offer' : null, perform: t < 9 ? 0 : .4, smile: .6, look: .2, talk: 0 }));
    mois(Wd, t => ({ pos: [1.5, 0, -1.0], facing: face(-.6, 1), gesture: null, perform: .35, smile: .7, look: -.2 }));
    ari(Wd, t => ({ pos: [2.5, 0, -1.2], facing: face(-.6, 1), gesture: null, perform: .35, smile: .7, look: -.2 }));
    Wd.occ = [A.g, w.g, st.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [.3, 1.35, -.3], 3.9, .4, -12), C0(4.5, [.3, 1.3, -.3], 3.7, .3, 8), C0(9, [.3, 1.3, -.3], 3.7, .3, -8), C0(dur, [.3, 1.3, -.3], 3.8, .4, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 90-100: Abba raises the cup, the boys listen, "amen" tag, green check
  function s7(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0);
    lighting(Wd, () => ({ hemi: .98, sun: .62, hemiColor: WARM, sunColor: new THREE.Color(0xe8dcc8) }));
    const A = cup(Wd, 1.45), tag = mkPlaque(Wd, 'אמן', 1.7, .7, '#ffe38a', '#4a2a00', '#d9a63a'), ck = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a), gl = glowAt(Wd.scene, 4.2, 0xffd27a, .3), sp = sparks(Wd, 14, [0, 1.8, -.8], 2.4, 0xffe9a8, .14);
    A.setLiq(.95, WINE); gl.position.set(0, 1.6, -1.4);
    Wd.on(t => { sp(t); const r = sm(P(.3, 3, t));
      A.set([.02, lerp(.73, .81, r), -.78]);
      tag.set([-.95, 2.15 + .04 * Math.sin(t * 1.5), -1.0], popE(P(3, 4.2, t)) * .62, .05 * Math.sin(t * 1.1));
      ck.set([1.0, 2.2 + .04 * Math.sin(t * 2), -1.0], popE(P(5, 6, t)) * .6, .06 * Math.sin(t * 3)); sk.set([1.0, 2.2, -1.0], P(5, 6, t), 2.4);
      gl.material.opacity = .15 + .15 * sm(P(1, 4, t)); });
    abba(Wd, t => ({ pos: [0, 0, -1.3], facing: 0, gesture: 'offer', perform: 0, smile: .6, look: 0, talk: t > 3.5 ? .3 * talkAmt(t, 2) : 0 }));
    mois(Wd, t => ({ pos: [-1.15, 0, -1.1], facing: face(.6, 1), gesture: null, perform: .35, smile: .8, look: .2 }));
    ari(Wd, t => ({ pos: [1.15, 0, -1.1], facing: face(-.6, 1), gesture: null, perform: .35, smile: .8, look: -.2 }));
    Wd.occ = [A.g, tag.g, ck.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [0, 1.45, -1.0], 3.5, .4, -10), C0(4, [0, 1.45, -1.0], 3.2, .3, 6), C0(7, [0, 1.5, -1.0], 3.1, .3, -6), C0(dur, [0, 1.5, -1.0], 3.3, .4, 6)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: Abba and Ari seated at the table with the full cup, candles burning far behind
  function answerBg(dur) {
    const Wd = skyW({ hemi: 1.2, sun: 1.1 }); room(Wd); table(Wd, 2.4); chair(Wd, -.65, 2.4 - .95, 0, .46); chair(Wd, .65, 2.4 - .95, 0, .46);
    const A = cup(Wd, 1.5); A.set([0, TT, 2.3]); A.setLiq(.95, WINE);
    const gl = glowAt(Wd.scene, 6, 0xffc070, .2); gl.position.set(0, 1.2, 2.5);
    const sp = sparks(Wd, 14, [0, 1.6, 2.4], 1.8, 0xffe9a8, .14); Wd.on(t => sp(t));
    abba(Wd, t => Object.assign({ pos: [-.65, RB, 1.45], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }, SIT));
    ari(Wd, t => Object.assign({ pos: [.65, RB, 1.58], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 3) }, SIT));
    Wd.occ = [A.g]; Wd.center = [0, 1.6]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
