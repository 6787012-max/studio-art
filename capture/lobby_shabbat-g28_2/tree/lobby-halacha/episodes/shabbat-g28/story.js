// shabbat-g28 story: "may one add water to grape juice for kiddush?" (Azamra 28, Vayigash) - 3D choreography per storyboards_v8.md (C).
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

  // ---------------------------------------------------------------- props: silver kiddush cup, juice bottle, water jug, stream, grapes, tray, balance
  function cup(Wd, S) {   // origin at the base; liquid via setLiq(level 0..1, dilution 0..1)
    const g = new THREE.Group(); g.scale.setScalar(S); Wd.add(g);
    g.add(cyl(.1, .12, .025, SILV, { pos: [0, .0125, 0] })); g.add(cyl(.02, .03, .12, SILV, { pos: [0, .085, 0] })); g.add(ball(.04, SILV, { pos: [0, .1, 0], ink: false }));
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.088, .046, .15, 32, 1, true), toon(SILV, { side: THREE.DoubleSide, emissive: new THREE.Color(0x30343c) })); bowl.position.y = .22; g.add(bowl);
    g.add(cyl(.046, .046, .008, SILV, { pos: [0, .146, 0], ink: false }));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.088, .007, 8, 32), toon(0xf4f6fb, { emissive: new THREE.Color(0x40444c) })); rim.rotation.x = PI / 2; rim.position.y = .295; g.add(rim);
    const liqG = new THREE.Group(); liqG.position.y = .152; g.add(liqG);
    const liqMat = bm(0x4a1466);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(.08, .047, .138, 28), liqMat); liq.position.y = .069; liqG.add(liq);
    const api = { g, S, setLiq(l, d) { liqG.scale.set(Math.max(.2, (.047 + .042 * l + .006) / .08), Math.max(.001, l), Math.max(.2, (.047 + .042 * l + .006) / .08)); liqG.visible = l > .02; liqMat.color.copy(JUICE).lerp(DIL, d || 0); },
      set(p) { g.position.set(p[0], p[1], p[2]); }, surf(l) { return g.position.y + (.152 + .138 * l) * S; }, rimY() { return g.position.y + .3 * S; } };
    api.setLiq(.5, 0); return api;
  }
  function labelTex() {
    return (c, W, H) => { c.fillStyle = '#fff4d6'; c.fillRect(0, 0, W, H); c.strokeStyle = '#7a1c8a'; c.lineWidth = H * .035; c.strokeRect(H * .03, H * .03, W - H * .06, H - H * .06);
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillStyle = '#5a1470'; c.font = `900 ${H * .34}px ${FONT}`; c.fillText('100%', W / 2, H * .26);
      c.font = `800 ${H * .2}px ${FONT}`; c.fillText('מיץ ענבים', W / 2, H * .6);
      for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#7a2a9a' : '#5a1470'; c.beginPath(); c.arc(W * (.3 + i * .1), H * .84 - (i % 2) * H * .03, H * .05, 0, 7); c.fill(); } };
  }
  function bottle(Wd, S) {
    const g = new THREE.Group(); g.scale.setScalar(S); Wd.add(g);
    const GL = 0x3a1058;
    g.add(cyl(.12, .125, .34, GL, { pos: [0, .17, 0] })); g.add(cyl(.045, .12, .09, GL, { pos: [0, .385, 0] })); g.add(cyl(.036, .045, .12, GL, { pos: [0, .49, 0] }));
    const cap = cyl(.042, .042, .045, 0xd9a63a, { pos: [0, .57, 0] }); g.add(cap);
    const lab = texPlane(.22, .2, labelTex(), { cw: 512, opaque: true, ro: 2, depthWrite: true }); lab.position.set(0, .17, .128); g.add(lab);
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(.025, .3), new THREE.MeshBasicMaterial({ color: 0xcfa0ee, transparent: true, opacity: .35, fog: false })); hl.position.set(-.085, .17, .124); hl.rotation.y = -.5; g.add(hl);
    return { g, S, mouth: [0, .55], cap(v) { cap.visible = v; } };
  }
  function jug(Wd, S) {
    const g = new THREE.Group(); g.scale.setScalar(S); Wd.add(g);
    g.add(cyl(.105, .085, .3, 0x9fd6f6, { pos: [0, .15, 0] })); g.add(cyl(.1, .1, .02, 0xe8f6ff, { pos: [0, .3, 0], ink: false }));
    const wt = cyl(.095, .095, .02, 0x57b4ee, { pos: [0, .285, 0], ink: false }); g.add(wt);
    g.add(box(.09, .04, .07, 0x9fd6f6, { pos: [-.12, .29, 0] }));
    const hd = new THREE.Mesh(new THREE.TorusGeometry(.08, .016, 8, 20), toon(0x9fd6f6)); hd.position.set(.13, .16, 0); g.add(hd);
    return { g, S, mouth: [-.14, .3] };
  }
  function place(it, M, a) {   // put the mouth of a bottle/jug at point M with tilt a (z rotation)
    const c = Math.cos(a), s = Math.sin(a), mx = it.mouth[0], my = it.mouth[1], S = it.S;
    it.g.rotation.z = a; it.g.position.set(M[0] - S * (mx * c - my * s), M[1] - S * (mx * s + my * c), M[2]);
  }
  function stream(Wd) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10), bm(0x4a1466)); m.visible = false; Wd.add(m);
    return { g: m, set(x, z, yTop, yBot, col, vis) { const H = yTop - yBot; m.visible = vis && H > .01; if (!m.visible) return; m.material.color.set(col); m.position.set(x, (yTop + yBot) / 2, z); m.scale.set(.03, H, .03); } };
  }
  function grapes(Wd, n) {
    const gs = []; for (let i = 0; i < n; i++) { const b = ball(.075, i % 2 ? 0x6a2a8a : 0x4f1a70, { ink: false }); Wd.add(b); gs.push(b); const lf = box(.06, .01, .05, 0x4a8a3a, { pos: [0, .075, 0], ink: false }); b.add(lf); }
    return { gs, g: gs, set(cx, cz, rx, rz, t, k) { gs.forEach((b, i) => { const a = i * 2 * PI / n + t * .55; b.visible = k > .02; b.position.set(cx + Math.cos(a) * rx, TT + .075, cz + Math.sin(a) * rz); b.rotation.set(t * 2 + i, a * 2, 0); b.scale.setScalar(k); }); } };
  }
  function tray(Wd) { const g = new THREE.Group(); Wd.add(g); g.add(cyl(.72, .74, .035, 0xd8dde6, { pos: [0, 0, 0] })); g.add(cyl(.6, .62, .02, 0xeff2f8, { pos: [0, .02, 0], ink: false })); return g; }
  function sideTable(Wd, x, z) { Wd.add(box(.7, .08, .5, 0x8a5a30, { pos: [x, .8, z] })); for (const dx of [-1, 1]) for (const dz of [-1, 1]) Wd.add(box(.06, .8, .06, 0x6a4326, { pos: [x + dx * .3, .4, z + dz * .2], ink: false })); }
  function balance(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    g.add(cyl(.025, .025, 2.4, 0x8a8f99, { pos: [0, 1.2, 0], ink: false }));
    const beam = new THREE.Group(); g.add(beam); beam.add(box(2.4, .08, .08, 0xd8dde6)); beam.add(ball(.11, 0xe3b25a, { ink: false }));
    const mkPan = () => { const p = new THREE.Group(); g.add(p); p.add(cyl(.5, .2, .07, 0xd8dde6, { pos: [0, -.62, 0] })); for (const s of [-1, 1]) p.add(box(.018, .62, .018, 0xb8bec8, { pos: [s * .27, -.31, 0], rot: [0, 0, -s * .46], ink: false })); return p; };
    const pans = [mkPan(), mkPan()];
    const cA = mkPlaque(Wd, 'בורא פרי הגפן', 1.25, .5, '#ecdcff', '#3a1058', '#7a2a9a'), cB = mkPlaque(Wd, 'שהכל', 1.25, .5, '#d6ecff', '#103a58', '#2a6a9a');
    return { g, cards: [cA, cB], set(pos, s, t) {
      g.visible = s > .01; cA.g.visible = cB.g.visible = g.visible; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s);
      const a = (.2 * Math.sin(t * 1.25) + .09 * Math.sin(t * 2.7 + 1) + .05 * Math.sin(t * .5)) * s; beam.rotation.z = a;
      [-1, 1].forEach((sd, i) => { const ex = sd * 1.2 * Math.cos(a) * s, ey = sd * 1.2 * Math.sin(a) * s; pans[i].position.set(ex, ey, 0); pans[i].scale.setScalar(s);
        const card = i ? cB : cA; card.set([pos[0] + ex, pos[1] + ey - .62 * s + .36 * s, pos[2] + .04], .8 * s * popE(1), 0); }); } };
  }

  // people helpers
  const mois = (Wd, fn) => boyK(Wd, MOISHY, fn), ari = (Wd, fn) => boyK(Wd, ARI, fn);
  const abba = (Wd, fn) => manK(Wd, ABBA, fn, .5);

  // ---------------------------------------------------------------- 1. HOOK 0-14
  function hook(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const ck = cup(Wd, 1.7), bt = bottle(Wd, 1.3), jg = jug(Wd, 1.3), sp = sparks(Wd, 10, [0, 2.0, -.8], 2.0, 0xffe9a8, .12);
    ck.set([0, TT, -.38]); ck.setLiq(.3, 0);
    Wd.on(t => { sp(t);
      place(bt, [-.1, 1.27 + .02 * Math.sin(t * 1.7), -.36], -1.0 + .05 * Math.sin(t * 1.3)); bt.cap(false);
      place(jg, [.18, 1.1 + .02 * Math.sin(t * 1.5 + 1), -.3], .5 + .05 * Math.sin(t * 1.4));
      });
    mois(Wd, t => ({ pos: [-1.75, 0, -.95], facing: face(.6, 1), gesture: 'offer', perform: 0, smile: .5, look: .1 }));
    ari(Wd, t => ({ pos: [1.75, 0, -.95], facing: face(-.6, 1), gesture: 'offer', perform: 0, smile: .5, look: -.1 }));
    abba(Wd, t => ({ pos: [0, 0, -1.9], facing: 0, gesture: t > 4 ? 'think' : null, perform: t > 4 ? 0 : .4, smile: .4, brow: .3, look: .1, talk: 0 }));
    Wd.occ = [bt.g, jg.g, ck.g]; Wd.center = [0, 0]; Wd.qSize = 1.1; Wd.qPos = [-.9, -.9];
    Wd.cam = cine([C0(0, [0, 1.3, -.6], 3.5, .5, -14), C0(5, [0, 1.3, -.6], 3.2, .4, 8), C0(10, [0, 1.3, -.6], 3.3, .4, -8), C0(14, [0, 1.3, -.6], 3.2, .4, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: the bottle label "100% grape juice" zooms in, grapes roll around with a glow
  function s2(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const bt = bottle(Wd, 2.5), gr = grapes(Wd, 7), sp = sparks(Wd, 14, [0, 1.6, -.2], 1.5, 0xe6c4ff, .15), gl = glowAt(Wd.scene, 3.4, 0xd7a8ff, .22);
    gl.position.set(0, 1.5, -.5);
    Wd.on(t => { sp(t); const k = popE(P(.3, 1.6, t)); bt.g.visible = k > .02; bt.g.scale.setScalar(2.5 * k); bt.g.position.set(0, TT, -.15); bt.g.rotation.set(0, .25 * Math.sin(t * .5), 0);
      gr.set(0, -.12, .95, .38, t, popE(P(1.8, 3, t))); gl.material.opacity = .15 + .1 * Math.sin(t * 1.6); });
    mois(Wd, t => ({ pos: [-1.9, 0, -1.0], facing: face(.7, 1), gesture: null, perform: .4, smile: .8, look: .3 }));
    ari(Wd, t => ({ pos: [1.9, 0, -1.0], facing: face(-.7, 1), gesture: null, perform: .4, smile: .8, look: -.3 }));
    Wd.occ = [bt.g].concat(gr.g); Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [0, 1.4, -.3], 4.6, .8, -12), C0(5, [0, 1.45, -.25], 3.4, .6, 6), C0(10, [0, 1.45, -.2], 2.8, .5, -6), C0(dur, [0, 1.5, -.2], 3.3, .6, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-46: Ari pours a little water into the second cup; colour gets lighter; tag "juice + water" and grey ?
  function s3(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const A = cup(Wd, 1.8), B = cup(Wd, 1.8), jg = jug(Wd, 1.45), st = stream(Wd), tag = mkPlaque(Wd, 'מיץ + מים', 2.2, .7, '#fff4cf', '#5a1470', '#9a6ad0'), q = qmark(Wd, '#9aa0aa'), sp = sparks(Wd, 10, [0, 2.0, -.8], 2.2, 0xffe9a8, .12);
    A.set([-.85, TT, -.35]); A.setLiq(.6, 0); B.set([.7, TT, -.35]);
    const BM = [.7, 1.5, -.35];
    Wd.on(t => { sp(t);
      const tilt = sm(P(2.0, 4.2, t)) * (1 - sm(P(9, 11, t))), pour = P(3.6, 4.2, t) * (1 - P(8.4, 9, t));
      const lvl = lerp(.55, .85, sm(P(4.2, 8.6, t))), dil = sm(P(4.4, 9.4, t));
      B.setLiq(lvl, dil);
      const jx = lerp(1.35, BM[0] - .0, sm(P(.8, 2.6, t))) * 1; place(jg, [lerp(.7, BM[0] + .03, sm(P(.8, 2.6, t))), lerp(1.0, BM[1], sm(P(.8, 2.6, t))) + .02 * Math.sin(t * 1.7), BM[2]], .15 + 1.0 * tilt);
      st.set(BM[0] + .03, BM[2], BM[1] - .02, B.surf(lvl), 0x7fc4f0, pour > .2);
      tag.set([.6, 2.1 + .04 * Math.sin(t * 1.5), -.5], popE(P(8, 9.2, t)) * .6, .05 * Math.sin(t * 1.1));
      q.set([.6, 2.6 + .06 * Math.sin(t * 2), -.5], .55 * popE(P(10, 11, t)), .12 * Math.sin(t * 2.6)); });
    mois(Wd, t => ({ pos: [-1.9, 0, -.95], facing: face(.7, 1), gesture: t > 9 ? 'think' : null, perform: t > 9 ? 0 : .4, smile: .3, brow: .3, look: .3 }));
    ari(Wd, t => ({ pos: [2.2, 0, -.95], facing: face(-.7, 1), gesture: t > 0.5 && t < 9.5 ? 'offer' : null, perform: t > .5 && t < 9.5 ? 0 : .4, smile: .5, look: -.2 }));
    Wd.occ = [A.g, B.g, jg.g, st.g, tag.g, q.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [.1, 1.3, -.4], 3.3, .5, -12), C0(5, [.3, 1.3, -.4], 3.1, .4, 8), C0(10.5, [.2, 1.4, -.4], 3.3, .4, -8), C0(dur, [.1, 1.4, -.4], 3.4, .5, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 46-62: above the diluted cup two brachot cards wobble on a balance; it never settles
  function s4(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const B = cup(Wd, 1.8), bl = balance(Wd), q = qmark(Wd, '#9aa0aa'), sp = sparks(Wd, 12, [0, 2.4, -.5], 2.4, 0xffe9a8, .12);
    B.set([0, TT, -.3]); B.setLiq(.85, 1);
    Wd.on(t => { sp(t); bl.set([0, 2.52, -.35], popE(P(.4, 1.6, t)), t); q.set([0, 3.3 + .05 * Math.sin(t * 2), -.5], .55 * popE(P(5, 6, t)), .12 * Math.sin(t * 2.6)); });
    mois(Wd, t => ({ pos: [-2.35, 0, -.95], facing: face(.7, 1), gesture: t > 4 ? 'think' : null, perform: t > 4 ? 0 : .4, smile: .1, brow: .5, look: .3 }));
    ari(Wd, t => ({ pos: [2.35, 0, -.95], facing: face(-.7, 1), gesture: t > 7 ? 'shrug' : null, perform: t > 7 ? 0 : .4, smile: .1, brow: .5, look: -.3 }));
    Wd.occ = [B.g].concat(bl.cards.map(c => c.g)); Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [0, 1.5, -.4], 4.3, .5, -10), C0(5, [0, 1.5, -.4], 3.9, .4, 8), C0(10, [0, 1.55, -.4], 3.8, .4, -8), C0(dur, [0, 1.55, -.4], 4.0, .5, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 62-76: the diluted cup slides aside with a red X "not lechatchila"; the 100% cup moves to the centre on a silver tray with a green check
  function s5(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd);
    const tr = tray(Wd); tr.position.set(0, TT, -.15); tr.visible = false;
    const A = cup(Wd, 1.8), B = cup(Wd, 1.8), lab = mkPlaque(Wd, 'לא לכתחילה', 2.3, .62, '#ffe1e1', '#a01616', '#c03030'), x = mark3d(Wd, 'cross', .75), ck = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a), sx = shock(Wd, 0xff5a5a), sp = sparks(Wd, 12, [0, 2.0, -.5], 2.2, 0xffe9a8, .12);
    A.setLiq(.6, 0); B.setLiq(.85, 1);
    Wd.on(t => { sp(t);
      const u = sm(P(1.2, 4.2, t)), v = sm(P(5.2, 8.2, t));
      B.set([lerp(0, 1.05, u), TT, lerp(-.15, -.3, u)]);
      A.set([lerp(-.7, -.1, v), TT + .04 * v + .22 * Math.sin(PI * v), -.15]);
      tr.visible = v > .02; tr.scale.setScalar(popE(P(5, 6, t)));
      x.set([1.05, 1.7 + .04 * Math.sin(t * 2), -.3], popE(P(3.4, 4.4, t)) * .5, .05 * Math.sin(t * 3)); sx.set([1.05, 1.7, -.3], P(3.4, 4.4, t), 2.2);
      lab.set([1.05, 2.15 + .03 * Math.sin(t * 1.4), -.35], popE(P(4, 5.2, t)) * .55, .05 * Math.sin(t * 1.1));
      ck.set([-.1, 1.95 + .04 * Math.sin(t * 2), -.3], popE(P(8.4, 9.4, t)) * .6, .06 * Math.sin(t * 3)); sk.set([-.1, 1.95, -.3], P(8.4, 9.4, t), 2.4); });
    mois(Wd, t => ({ pos: [-1.9, 0, -.95], facing: face(.7, 1), gesture: t > 9 ? 'thumb' : null, perform: t > 9 ? 0 : .4, smile: .4 + .5 * sm(P(8, 10, t)), look: .3 }));
    ari(Wd, t => ({ pos: [2.0, 0, -.95], facing: face(-.7, 1), gesture: null, perform: .4, smile: .4 + .4 * sm(P(8, 10, t)), look: -.3 }));
    Wd.occ = [A.g, B.g, lab.g, x.g, ck.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [.4, 1.35, -.3], 3.4, .4, -10), C0(4.5, [.55, 1.35, -.3], 3.2, .3, 8), C0(9, [.45, 1.35, -.3], 3.2, .3, -8), C0(dur, [.45, 1.35, -.3], 3.4, .4, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-90: Moishy pours from the 100% bottle into the kiddush cup; Ari puts the water jug back on the side shelf and smiles
  function s6(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0); warm(Wd); sideTable(Wd, 1.45, -.45);
    const tr = tray(Wd); tr.position.set(0, TT, -.15);
    const A = cup(Wd, 1.8), bt = bottle(Wd, 1.5), jg = jug(Wd, 1.25), st = stream(Wd), sp = sparks(Wd, 12, [0, 2.0, -.5], 2.2, 0xffe9a8, .12);
    A.set([0, TT + .04, -.15]);
    const MM = [0, 1.5, -.15];
    Wd.on(t => { sp(t);
      const tilt = sm(P(.8, 2.6, t)) * (1 - sm(P(8.4, 10.2, t))), pour = P(2.4, 3, t) * (1 - P(8.2, 8.8, t));
      const lvl = lerp(.6, .97, sm(P(2.8, 8.2, t))); A.setLiq(lvl, 0);
      const bx = lerp(-1.0, MM[0], sm(P(.2, 2.0, t))) - .0; place(bt, [lerp(-.4, MM[0] - .0, sm(P(.3, 2.0, t))), lerp(1.65, MM[1] + .02 * Math.sin(t * 1.8), sm(P(.3, 2.0, t))), MM[2]], -.2 - 1.0 * tilt); bt.cap(tilt < .1);
      st.set(MM[0] - .0, MM[2], MM[1] - .02, A.surf(lvl), 0x4a1466, pour > .2);
      const w = sm(P(3, 8, t)); const jp = [lerp(.85, 1.45, w), lerp(.78, .86, w) + .08 * Math.sin(PI * w), lerp(-.35, -.45, w)];
      jg.g.visible = true; jg.g.position.set(jp[0], jp[1], jp[2]); jg.g.rotation.z = .15 * Math.sin(PI * w); });
    mois(Wd, t => ({ pos: [-1.7, 0, -.95], facing: face(.6, 1), gesture: t < 9 ? 'offer' : null, perform: t < 9 ? 0 : .4, smile: .6, look: .2 }));
    ari(Wd, t => ({ pos: [2.3, 0, -.95], facing: face(-.5, 1), gesture: t > 3 && t < 8 ? 'offer' : null, perform: t > 3 && t < 8 ? 0 : .4, smile: .4 + .5 * sm(P(8, 9.6, t)), look: -.2 }));
    Wd.occ = [A.g, bt.g, jg.g, st.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [.3, 1.35, -.3], 3.8, .4, -12), C0(4.5, [.2, 1.3, -.3], 3.6, .3, 8), C0(9, [.3, 1.3, -.3], 3.6, .3, -8), C0(dur, [.3, 1.3, -.3], 3.7, .4, 8)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 90-100: Abba stands and raises the full cup (kiddush pose), the boys stand around, warm glow; gold tag
  function s7(dur) {
    const Wd = skyW(); room(Wd); table(Wd, 0);
    lighting(Wd, () => ({ hemi: .98, sun: .62, hemiColor: WARM, sunColor: new THREE.Color(0xe8dcc8) }));
    const A = cup(Wd, 1.45), tag = mkPlaque(Wd, 'בורא פרי הגפן', 3.0, .78, '#ffe38a', '#4a2a00', '#d9a63a'), gl = glowAt(Wd.scene, 4.2, 0xffd27a, .3), sp = sparks(Wd, 14, [0, 1.8, -.8], 2.4, 0xffe9a8, .14);
    A.setLiq(.95, 0); gl.position.set(0, 1.6, -1.4);
    Wd.on(t => { sp(t); const r = sm(P(.3, 3, t));
      A.set([.02, lerp(.73, .81, r), -.78]);
      tag.set([0, 2.25 + .04 * Math.sin(t * 1.5), -1.2], popE(P(2, 3.2, t)) * .62, .05 * Math.sin(t * 1.1)); gl.material.opacity = .15 + .15 * sm(P(1, 4, t)); });
    abba(Wd, t => ({ pos: [0, 0, -1.3], facing: 0, gesture: 'offer', perform: 0, smile: .6, look: 0, talk: t > 3.5 ? .3 * talkAmt(t, 2) : 0 }));
    mois(Wd, t => ({ pos: [-1.15, 0, -1.1], facing: face(.6, 1), gesture: null, perform: .35, smile: .8, look: .2 }));
    ari(Wd, t => ({ pos: [1.15, 0, -1.1], facing: face(-.6, 1), gesture: null, perform: .35, smile: .8, look: -.2 }));
    Wd.occ = [A.g, tag.g]; Wd.center = [0, 0];
    Wd.cam = cine([C0(0, [0, 1.4, -1.0], 3.4, .4, -10), C0(4, [0, 1.4, -1.0], 3.1, .3, 6), C0(7, [0, 1.45, -1.0], 3.0, .3, -6), C0(dur, [0, 1.45, -1.0], 3.2, .4, 6)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: Abba and Moishy seated at the table with the full cup, candles burning far behind
  function answerBg(dur) {
    const Wd = skyW({ hemi: 1.2, sun: 1.1 }); room(Wd); table(Wd, 2.4); chair(Wd, -.65, 2.4 - .95, 0, .46); chair(Wd, .65, 2.4 - .95, 0, .46);
    const A = cup(Wd, 1.5); A.set([0, TT, 2.3]); A.setLiq(.95, 0);
    const gl = glowAt(Wd.scene, 6, 0xffc070, .2); gl.position.set(0, 1.2, 2.5);
    const sp = sparks(Wd, 14, [0, 1.6, 2.4], 1.8, 0xffe9a8, .14); Wd.on(t => sp(t));
    abba(Wd, t => Object.assign({ pos: [-.65, RB, 1.45], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }, SIT));
    ari(Wd, t => Object.assign({ pos: [.65, RB, 1.58], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 3) }, SIT));
    Wd.occ = [A.g]; Wd.center = [0, 1.6]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
