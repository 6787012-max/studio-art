// halashon-02 story: "one story - many prohibitions" - 3D choreography per storyboards_v3.md (A). Boys only. Everything is a function of time.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, yardWorld, board, shock, mark3d,
    openBook, greyCloud, soccer, popE, shakeCam, lighting, texPlane, arcPt, lerpV, glowSprite, canvasTex, FONT, bill } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.14 * d : ly];
  const Cf = f => (t, tg, d, h, a, fov) => C(t, tg, d, h, a, fov, -f * d);
  const SIT = { sit: true, groundY: 0 };
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const rays = Wd => { const arr = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 12), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(-5 + i * 2.2, 5, -4 + (i % 2)); m.rotation.z = .4; Wd.add(m); arr.push(m); }
    return k => arr.forEach((m, i) => m.material.opacity = k * (.16 + .06 * Math.sin(i * 2 + k * 3))); };

  // ---------------------------------------------------------------- layout (shared by all scenes)
  const SH = [-1.2, 0, 0], AV = [-.05, 0, .41], CH = [-6.5, 0, -3.3];            // Shmuli, Avi, Chaim (sits on the bench)
  const EXA = [-3.01, 0, -1.42], EXB = [2.03, 0, -3.37], EXC = [-4.87, 0, -3.07];       // extra boys
  const TW = [3.6, 0, -2.0];                                                      // tower base
  const CP = [-.4, 2.55, -3.7];                                                   // counter centre
  const mouth = [SH[0] + .1, 1.12, SH[2] + .32], hov = [-.9, 2.25, .2], HV = [-1.3, 2.85, .3], GP = [-.1, 2.75, .4];   // hov = hook only; HV/GP = bubble hover / sag in the episode (kept above the heads)
  const BK = [-1.9, 3.45, -1.0];
  const N = 26, kindOf = i => ((i * 7 + 2) % 5 < 3) ? 0 : 1;                       // 0 = red lav, 1 = blue asei

  // ---------------------------------------------------------------- props local to this episode
  function frownBubble(Wd) {   // grey speech bubble with a frowning-face icon (no words)
    const w = 1.6, h = 1.15, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const draw = (c, W, H) => {
      const x0 = W * .04, y0 = H * .04, bw = W * .92, bh = H * .74, R = bh * .42;
      c.lineJoin = 'round'; c.beginPath(); c.roundRect(x0, y0, bw, bh, R); c.moveTo(W * .2, H * .74); c.lineTo(W * .1, H * .98); c.lineTo(W * .4, H * .74); c.closePath();
      c.fillStyle = '#e1e4ec'; c.fill(); c.lineWidth = W * .02; c.strokeStyle = '#1c2745'; c.stroke();
      const cx = W / 2, cy = y0 + bh / 2, r = bh * .36;
      c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = W * .014; c.strokeStyle = '#3a3320'; c.stroke();
      c.fillStyle = '#3a3320'; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(cx + sx * r * .38, cy - r * .12, r * .1, r * .15, 0, 0, 7); c.fill(); }
      c.lineCap = 'round'; c.lineWidth = r * .1; c.beginPath(); c.moveTo(cx - r * .62, cy - r * .3); c.lineTo(cx - r * .2, cy - r * .5); c.moveTo(cx + r * .62, cy - r * .3); c.lineTo(cx + r * .2, cy - r * .5); c.stroke();
      c.lineWidth = r * .12; c.beginPath(); c.arc(cx, cy + r * .78, r * .42, PI * 1.12, PI * 1.88); c.stroke();
    };
    const face_ = texPlane(w, h, draw, { cw: 768, ro: 8 }); inner.add(face_);
    const gl = glowSprite(w * 2.2, h * 2.4, 0); gl.material.color.set(0xb7bccb); gl.position.z = -.12; inner.add(gl);
    bill(Wd, g);
    return { g, set(pos, s, a, rz) { const on = s > .01 && (a === undefined || a > .01); g.visible = on; if (!on) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; const al = a === undefined ? 1 : a; face_.material.opacity = al; gl.material.opacity = .4 * al; } };
  }

  function counter(Wd) {   // freestanding score board with a flipping display: '?' / digits / dots / green zero
    const W = 2.9, H = 1.6, g = new THREE.Group(); g.visible = false; Wd.add(g);
    g.add(box(W + .24, H + .24, .18, 0xd9a21b, { pos: [0, 0, -.1] })); g.add(box(W, H, .1, 0x1b2440, { pos: [0, 0, -.02] }));
    for (const sx of [-1, 1]) g.add(box(.16, 2.0, .16, 0x6b3a1c, { pos: [sx * (W / 2 - .3), -H / 2 - 1.0, -.1] }));
    const gl = glowSprite(W * 1.6, H * 1.8, .25); gl.position.z = -.3; g.add(gl);
    const T = {};
    const mk = (k, txt, col) => { T[k] = canvasTex(256, 256, (c, w, h) => { c.font = `700 ${h * .86}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = '#000'; c.lineWidth = h * .06; c.strokeText(txt, w / 2, h * .54); c.fillStyle = col; c.fillText(txt, w / 2, h * .54); }); };
    for (let d = 0; d < 10; d++) mk('' + d, '' + d, '#ffd54a'); mk('?', '?', '#ff9a3c'); mk('g0', '0', '#6dff9a');
    const mkW = (k, txt, col, fs) => { T[k] = canvasTex(512, 256, (c, w, h) => { c.font = `700 ${h * fs}px ${FONT}`; c.direction = k === 'many' ? 'rtl' : 'ltr'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = '#000'; c.lineWidth = h * .06; c.strokeText(txt, w / 2, h * .54); c.fillStyle = col; c.fillText(txt, w / 2, h * .54); }); };
    mkW('w1', '1+', '#ffd54a', .8); mkW('w2', '1++', '#ffd54a', .8); mkW('many', 'הרבה!', '#ff7a3c', .78);
    const disp = new THREE.Group(); disp.position.z = .05; g.add(disp);
    const mkP = () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), new THREE.MeshBasicMaterial({ map: T['?'], transparent: true, side: THREE.DoubleSide, fog: false, toneMapped: false })); m.renderOrder = 6; disp.add(m); return m; };
    const pT = mkP(), pO = mkP(), pW = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.25), new THREE.MeshBasicMaterial({ map: T.many, transparent: true, side: THREE.DoubleSide, fog: false, toneMapped: false })); pW.renderOrder = 6; disp.add(pW);
    return { g, set(pos, s, st) { g.visible = s > .01; if (!g.visible) return; st = st || {}; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s);
      pW.visible = !!st.word; if (pW.visible) pW.material.map = T[st.word]; pT.visible = !st.word && st.tens !== undefined && st.tens !== null; pO.visible = !st.word; if (pT.visible) { pT.material.map = T[st.tens]; pT.position.x = -.55; }
      pO.material.map = T[st.ones]; pO.position.x = pT.visible ? .55 : 0;
      const f = st.flip || 0; disp.rotation.x = 2 * PI * sm(f); disp.scale.setScalar(1 + .3 * Math.sin(PI * clamp(f, 0, 1))); gl.material.opacity = .25 + (st.glow || 0) * .5; } };
  }

  function mkTags(Wd) {   // red (lav) / blue (asei) 3D tag blocks with a word on both faces
    const lab = (txt, col) => canvasTex(256, 96, (c, w, h) => { c.font = `700 ${h * .8}px ${FONT}`; c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = h * .1; c.strokeText(txt, w / 2, h * .54); c.fillStyle = col; c.fillText(txt, w / 2, h * .54); });
    const tx = [lab('לאו', '#fff'), lab('עשה', '#fff')], cols = [0xe03131, 0x2f6fe0], out = [];
    for (let i = 0; i < N; i++) {
      const k = kindOf(i), g = new THREE.Group(); g.visible = false; Wd.add(g);
      g.add(box(.92, .36, .5, cols[k], { pos: [0, 0, 0] }));
      for (const sgn of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.8, .3), new THREE.MeshBasicMaterial({ map: tx[k], transparent: true, fog: false, toneMapped: false })); m.position.z = sgn * .255; if (sgn < 0) m.rotation.y = PI; g.add(m); }
      out.push(g);
    }
    return out;
  }

  function dimmer(Wd, kf) {   // grey world: sky, light, fog
    const c1 = new THREE.Color(), t1 = new THREE.Color(0x4f9fe8), t2 = new THREE.Color(0x8e97a8), b1 = new THREE.Color(0xfff0d2), b2 = new THREE.Color(0xc4c8d2);
    Wd.on(t => { const k = kf(t); Wd.hemi.intensity = lerp(1.5, 1.0, k); Wd.sun.intensity = lerp(1.9, 1.2, k);
      Wd.sky.material.uniforms.top.value.copy(t1).lerp(t2, k); Wd.sky.material.uniforms.bot.value.copy(b1).lerp(b2, k); if (Wd.scene.fog) Wd.scene.fog.color.copy(b1).lerp(b2, k); });
  }

  // ---------------------------------------------------------------- the whole "bubble + tags + tower + counter" story, as a function of story time G (G = film seconds - 14)
  const ATT = i => { if (i === 0) return [.55, .5, .35]; const b = i * 2.4 + .5, r = .5 + .38 * (((i * 5) % 3) / 2); return [Math.cos(b) * r * 1.15, Math.sin(b) * r * .8, .3 + (i % 4) * .05]; };
  const SPAWN = i => { const a = i * 2.399 + .4, R = 7 + ((i * 5) % 4); return [hov[0] + Math.cos(a) * R, 1.0 + ((i * 37) % 7) * .85, hov[2] + Math.sin(a) * R * .55]; };
  const SLOT = i => { const layer = Math.floor(i / 2), side = i % 2; return [TW[0] + (side ? .5 : -.5) + (layer % 2 ? .13 : -.13) + .05 * (rnd(i) - .5), .19 + layer * .375, TW[2] + .05 * (rnd(i + 9) - .5)]; };
  const bubC = G => lerpV(HV, GP, sm(P(25.5, 29.0, G)));
  const bubS = G => 1 + .35 * sm(P(14.5, 25, G));
  const tStart = i => i === 0 ? 5.5 : 14.6 + (i - 1) * .4, tEnd = i => tStart(i) + (i === 0 ? 2.6 : 1.5), tw0 = i => 30.4 + i * .28;

  function gossip(Wd, Gf, o) {
    o = o || {};
    const Bf = o.B || (() => 1), bub = frownBubble(Wd), cnt = counter(Wd), tags = mkTags(Wd), ring = shock(Wd, 0xff8a8a);
    const book = openBook(Wd, { text: 'לא תלך רכיל בעמיך' });
    const legend = board(Wd, { w: 2.7, h: 1.5, cw: 768, frame: 0x6b3a1c, glow: 0xffe29a, posts: .9, draw: (c, W, H) => {
      c.fillStyle = '#fff7e0'; c.fillRect(0, 0, W, H); c.strokeStyle = '#a9803a'; c.lineWidth = H * .04; c.strokeRect(H * .05, H * .05, W - H * .1, H - H * .1);
      c.direction = 'rtl'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.font = `700 ${H * .26}px ${FONT}`;
      [['#e03131', 'אדום = לאו', .3], ['#2f6fe0', 'כחול = עשה', .7]].forEach(([col, txt, y]) => { c.fillStyle = col; c.beginPath(); c.roundRect(W * .08, H * (y - .13), W * .22, H * .26, H * .05); c.fill(); c.fillStyle = '#2a1a0a'; c.fillText(txt, W * .92, H * y); }); } });
    const shG = new THREE.Group(); Wd.add(shG);
    const dx = CH[0] - TW[0], dz = CH[2] - TW[2], shM = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (c, w, h) => { const r = c.createRadialGradient(128, 128, 10, 128, 128, 128); r.addColorStop(0, 'rgba(25,30,45,.95)'); r.addColorStop(.65, 'rgba(25,30,45,.6)'); r.addColorStop(1, 'rgba(25,30,45,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -6 }));
    shM.rotation.x = -PI / 2; shM.position.y = .045; shM.renderOrder = 2; shG.add(shM); shG.rotation.y = -Math.atan2(dz, dx);
    const clouds = [greyCloud(Wd, { seed: 6, size: 1.0 }), greyCloud(Wd, { seed: 3, size: 1.0 }), greyCloud(Wd, { seed: 8, size: 1.0 })];
    const shK = G => sm(P(44.6, 51, G));
    dimmer(Wd, G => shK(G) * (o.shadowOn === false ? 0 : 1));
    Wd.on(t => {
      const G = Gf(t), B = Bf(t), bc0 = bubC(G), bs0 = bubS(G);
      // book: pops in at G 2.6-4.2, the page glows, leaves after the tag has flown (G 11-12.4)
      const bk = popE(P(2.6, 4.2, G)) * (1 - sm(P(11, 12.4, G)));
      book.set([BK[0], BK[1] + .12 * Math.sin(G * 1.2), BK[2]], bk * .6, sm(P(3.6, 5.2, G)) * (1 - sm(P(10.5, 12, G))));
      // bubble: hovers, grows heavier with every tag, sags to the ground (G 25.5-29), is emptied and fades while the tower is built
      const fade = 1 - sm(P(30, 32.5, G)), bob = .06 * Math.sin(G * 1.4);
      const bcw = [bc0[0], bc0[1] + bob, bc0[2]], bp = lerpV(mouth, bcw, B);
      bub.set(bp, bs0 * B * (1 + .04 * Math.sin(G * 5)) * (1 + .1 * sm(P(25.5, 29, G))), fade, .2 * sm(P(25.5, 29, G)) + .04 * Math.sin(G * 2));
      // tags
      for (let i = 0; i < N; i++) {
        const g = tags[i], att = ATT(i), a0 = tStart(i), a1 = tEnd(i), w0 = tw0(i), w1 = w0 + 1.1;
        const attW = (Gx) => { const bc = bubC(Gx), s = .8 + .2 * bubS(Gx); return [bc[0] + att[0] * s, bc[1] + att[1] * s, bc[2] + att[2]]; };
        let pos, rx = 0, ry = 0, rz = 0, s = .62, vis = true;
        if (G < a0 - (i === 0 ? .9 : 0)) vis = false;
        else if (G < a0) { pos = [BK[0] + 1.05, BK[1] + .12 * Math.sin(G * 1.2), BK[2] + .3]; s = .62 * popE(P(a0 - .9, a0, G)); ry = 0; }
        else if (G < a1) { const k = sm(P(a0, a1, G)), from = i === 0 ? [BK[0] + 1.05, BK[1], BK[2] + .3] : SPAWN(i); pos = arcPt(from, attW(a1), k, i === 0 ? 1.0 : 1.6 + (i % 3) * .5); ry = (1 - k) * (6 + i % 3 * 2); rz = (1 - k) * 3 * (i % 2 ? 1 : -1); rx = (1 - k) * 2; }
        else if (G < w0) { pos = attW(G); rz = .35 * Math.sin(i * 2.4 + 1) + .05 * Math.sin(G * 3 + i); ry = .15 * Math.sin(i + G); }
        else { const k = sm(P(w0, w1, G)), sl = SLOT(i); pos = arcPt(attW(w0), sl, k, 1.8 + (i % 3) * .3); s = lerp(.62, 1, k); ry = (1 - k) * (5 + i % 3) + (rnd(i + 3) - .5) * .16 * k; rz = (1 - k) * .35 * Math.sin(i * 2.4 + 1) * 0; rx = (1 - k) * 1.5;
          if (G > w1) pos = [sl[0], sl[1], sl[2]]; if (G > w1 && G < w1 + .35) { const q = (G - w1) / .35; pos[1] += .08 * Math.sin(PI * q) * (1 - q); } }
        g.visible = vis; if (vis) { g.position.set(pos[0], pos[1], pos[2]); g.rotation.set(rx, ry, rz); g.scale.setScalar(s); } }
      ring.set([bc0[0] + ATT(0)[0], bc0[1] + ATT(0)[1], bc0[2] + .5], P(8.0, 9.0, G) * (G > 8.0 ? 1 : 0), 1.6);
      // counter: '?' -> flips to 1 -> spins fast -> many (dots)
      const cop = o.cntOverride ? o.cntOverride(t, G) : null; let st;
      if (cop) st = cop;
      else if (G < 9.6) st = { ones: '?' };
      else if (G < 14.5) st = { ones: '1', flip: P(9.6, 10.6, G), glow: 1 - P(10.6, 12, G) };
      else if (G < 19) st = { word: 'w1', flip: P(14.5, 15.6, G), glow: .6 };
      else if (G < 23) st = { word: 'w2', flip: P(19, 20.1, G), glow: .7 };
      else st = { word: 'many', flip: P(23, 24.2, G), glow: .6 + .3 * sm(P(23, 26, G)) };
      cnt.set(CP, o.cntHidden ? o.cntHidden(t) : 1, st);
      // legend, shadow, clouds
      legend.set([TW[0] + 2.7, 1.5, TW[2] + .4], popE(P(38, 39.6, G)), 0);
      const sk = shK(G), len = lerp(3, 15, sk), cx = lerp(TW[0], (TW[0] + CH[0]) / 2, sk), cz = lerp(TW[2], (TW[2] + CH[2]) / 2, sk);
      shG.position.set(cx, 0, cz); shM.scale.set(len, lerp(2, 9, sk), 1); shM.material.opacity = sk * .8; shG.visible = sk > .01;
      clouds[0].set([CH[0] + .2, 2.7 + .12 * Math.sin(G * 1.3), CH[2]], sm(P(46, 52, G)) * .6, 0);
      clouds[1].set([-2.4, 5.4 + .15 * Math.sin(G), -2.6], sm(P(47, 54, G)) * 1.1, 0);
      clouds[2].set([TW[0] + .3, 6.6 + .15 * Math.sin(G * .9), TW[2]], sm(P(45, 52, G)) * 1.2, 0);
    });
    Wd.gprops = { bub: bub.g, tags };
    return { cnt };
  }

  // boys, as a function of story time (same function drives the rewind)
  function boysG(Wd, Gf, o) {
    o = o || {};
    const sk = G => sm(P(44.6, 51, G)), up = (G, i) => G > 31 + i * .7 && G < 58.5;
    boyP(Wd, 1, t => { const G = Gf(t), base = { pos: SH, facing: G < 30 ? face(AV[0] - SH[0], AV[2] - SH[2]) : face(TW[0] - SH[0], TW[2] - SH[2]) - .2, smile: 0 };
      if (G < 13) return Object.assign(base, { gesture: G > 2.5 ? 'explain' : 'lean', talk: .5 * talkAmt(t, 1), brow: .3, perform: 0 });
      if (G < 30) return Object.assign(base, { gesture: null, talk: 0, brow: .5, perform: .3, facing: face(HV[0] - SH[0], HV[2] - SH[2]) + .1 });
      return Object.assign(base, { gesture: up(G, 0) ? 'bothup' : null, talk: up(G, 0) ? .6 * talkAmt(t, 4) : 0, brow: .5, perform: .25 }); });
    boyP(Wd, 3, t => { const G = Gf(t), base = { pos: AV, facing: G < 30 ? face(SH[0] - AV[0], SH[2] - AV[2]) : face(TW[0] - AV[0], TW[2] - AV[2]) + .1, smile: 0 };
      if (G < 14) return Object.assign(base, { gesture: G < 9 ? 'lean' : 'think', brow: .3, perform: 0, talk: 0 });
      if (G < 30) return Object.assign(base, { gesture: 'think', brow: .5, perform: 0, facing: face(HV[0] - AV[0], HV[2] - AV[2]) - .1 });
      return Object.assign(base, { gesture: up(G, 1) ? 'bothup' : null, talk: up(G, 1) ? .6 * talkAmt(t, 5) : 0, brow: .5, perform: .25 }); });
    [[4, EXA], [5, EXB], [6, EXC]].forEach(([id, p], j) => boyP(Wd, id, t => { const G = Gf(t), looking = G > 14 && G < 31 ? face(HV[0] - p[0], HV[2] - p[2]) : G >= 31 ? face(TW[0] - p[0], TW[2] - p[2]) : face(SH[0] - p[0], SH[2] - p[2]) + .3 * (j - 1);
      const u = up(G, 2 + j); return { pos: p, facing: looking, gesture: u ? 'bothup' : (G > 14 && G < 31 ? 'think' : null), perform: u ? .2 : .4, smile: G < 14 ? .4 : 0, brow: G < 14 ? 0 : .45, talk: u ? .6 * talkAmt(t, 6 + j) : (G < 14 ? .25 * talkAmt(t, 6 + j) : 0) }; }));
    boyP(Wd, 2, t => { const G = Gf(t), k = sk(G), o2 = o.chaim ? o.chaim(t, G) : null; if (o2) return Object.assign({ pos: CH, facing: face(1, .6), scale: 1 - .14 * k }, o2, SIT);
      return Object.assign({ pos: CH, facing: face(1, .6), gesture: G > 20 ? 'headdown' : null, scale: 1 - .14 * k, smile: G > 20 ? 0 : .25, brow: .55 * k, perform: .5 }, SIT); });
  }

  // ---------------------------------------------------------------- 1. HOOK 0-14: schoolyard, Shmuli leans to Avi, a frowning bubble inflates, Chaim far away, the counter shows "?"
  function hook(dur) {
    const Wd = yardWorld({ noBall: true });
    const bub = frownBubble(Wd), cnt = counter(Wd);
    boyP(Wd, 1, t => ({ pos: SH, facing: face(AV[0] - SH[0], AV[2] - SH[2]), gesture: 'lean', talk: t > 1 && t < 9 ? .5 * talkAmt(t, 1) : .15 * talkAmt(t, 1), smile: .1, brow: .3, perform: 0 }));
    boyP(Wd, 3, t => ({ pos: AV, facing: face(SH[0] - AV[0], SH[2] - AV[2]), gesture: t < 7 ? 'lean' : 'think', smile: 0, brow: t > 5 ? .35 : .1, perform: 0 }));
    boyP(Wd, 4, t => ({ pos: EXA, facing: face(1, -.3), perform: .5, talk: .25 * talkAmt(t, 3), smile: .4 }));
    boyP(Wd, 5, t => ({ pos: EXB, facing: face(-1, -.2), perform: .5, talk: .2 * talkAmt(t, 4), smile: .4 }));
    boyP(Wd, 2, t => Object.assign({ pos: CH, facing: face(1, .6), gesture: null, smile: .3, perform: .55, talk: 0 }, SIT));
    Wd.on(t => { const k = popE(P(3.2, 5.4, t)); const bp = lerpV(mouth, hov, sm(P(3.2, 5.4, t)));
      bub.set([bp[0], bp[1] + .06 * Math.sin(t * 1.4), bp[2]], k * (1 + .04 * Math.sin(t * 5)), 1, .05 * Math.sin(t * 3));
      cnt.set(CP, popE(P(.4, 1.6, t)), { ones: '?', glow: .5 + .3 * Math.sin(t * 2.2) }); });
    Wd.noQ = true; const qm = K.qmark(Wd, '#5ec8ff', 1.1), fw = new THREE.Vector3(), up = new THREE.Vector3(), rt = new THREE.Vector3();
    Wd.on((t, cam) => { cam.getWorldDirection(fw); up.set(0, 1, 0).applyQuaternion(cam.quaternion); rt.set(1, 0, 0).applyQuaternion(cam.quaternion);
      const p = cam.position.clone().addScaledVector(fw, 6.5).addScaledVector(up, 1.15).addScaledVector(rt, 1.9); qm.set([p.x, p.y + .08 * Math.sin(t * 1.7), p.z], popE(P(3.0, 4.0, t)) * 1.0, .12 * Math.sin(t * 1.1)); });
    Wd.center = [-1, -1];
    Wd.cam = cine([C(0, [-2.9, 1.7, -1.2], 10.8, 2.0, -16, 46), C(3, [-1.1, 1.7, -.2], 6.2, .8, -14, 44), C(4.6, [-.8, 1.8, .2], 5.0, .4, 16, 44, -.6), C(9, [-.8, 1.8, .2], 5.2, .5, 26, 44, -.6), C(14, [-2.0, 1.8, -1.2], 8.6, 1.4, -8, 46)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: a sefer opens, the verse glows, a red tag flies to the bubble, the counter flips to 1
  function s2(dur) {
    const Wd = yardWorld({ noBall: true }), Gf = t => t; boysG(Wd, Gf); gossip(Wd, Gf);
    Wd.center = [-1, -1];
    Wd.cam = cine([C(0, [-1.5, 2.2, 0], 7.2, -.1, -20, 46, -.65), C(4.5, [-1.4, 2.3, -.4], 7.6, -.1, 8, 46, -.65), C(7.5, [-1.2, 2.3, -.2], 7.0, -.1, 22, 46, -.65), C(10.5, [-1.0, 2.3, -.8], 7.2, -.1, -8, 46, -.65), C(14, [-.9, 2.3, -.8], 8.0, -.1, -20, 46, -.65)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-44: tags of both colours fly in from all sides and stick, the counter spins, the bubble sags
  function s3(dur) {
    const Wd = yardWorld({ noBall: true }), Gf = t => 14 + t; boysG(Wd, Gf); gossip(Wd, Gf);
    Wd.center = [-1, -1];
    Wd.cam = cine([C(0, [-.9, 2.3, -.5], 8.6, -.1, -24, 46, -.45), C(5, [-.7, 2.2, .1], 7.6, -.1, 10, 46, -.1), C(9.5, [-.6, 2.2, .3], 7.2, -.1, 28, 46, -.1), C(12.5, [-.5, 2.2, .5], 7.0, -.1, 30, 46, -.1), C(16, [-.3, 2.2, .3], 7.2, -.1, 6, 46, -.1)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-58: the tags rise from the pile and stack into a tall tower; legend
  function s4(dur) {
    const Wd = yardWorld({ noBall: true }), Gf = t => 30 + t; boysG(Wd, Gf); gossip(Wd, Gf);
    Wd.center = [1, -1];
    Wd.cam = cine([C(0, [-.3, 2.2, .4], 7.0, -.1, 22, 48, -.1), C(3.5, [1.8, 2.4, -1.6], 7.0, -1.3, -30, 54, -1.0), C(8, [2.4, 2.8, -1.8], 7.6, -1.5, -28, 54, -1.0), C(11, [1.0, 2.5, -1.0], 10.0, .7, -30, 50), C(14, [1.0, 2.4, -1.0], 11.0, 1.3, -10, 50)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-72: the tower casts a grey shadow over the yard and over Chaim; grey clouds
  function s5(dur) {
    const Wd = yardWorld({ noBall: true }), Gf = t => 44 + t; boysG(Wd, Gf); gossip(Wd, Gf);
    Wd.center = [-2, -2];
    Wd.cam = seq([0, cine([C(0, [1.0, 2.4, -1.0], 11.0, 1.3, -10, 50), C(5, [-2.4, 1.8, -2.4], 9.0, .8, 14, 48)])],
      [5, cine([C(5, [-5.9, 1.7, -3.2], 4.8, .5, 20, 44, -.45), C(14, [-5.7, 1.8, -3.2], 5.0, .9, 6, 44, -.5)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 72-86: REWIND, then Shmuli covers his mouth, shakes his head; the counter drops to 0 and a green check pops
  const RW = 4.3;
  function s6(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd);
    const Gf = t => lerp(58, 2, sm(clamp(t / RW, 0, 1))), Bf = t => 1 - sm(P(RW - 1.7, RW - .1, t)), Tn = t => t - RW;
    const cntO = (t, G) => { const T = Tn(t); if (T < 3.4) return null; return { ones: 'g0', flip: P(3.4, 4.5, T), glow: 1 }; };
    boyP(Wd, 1, t => { const G = Gf(t), T = Tn(t);
      if (T < 0) return { pos: SH, facing: face(TW[0] - SH[0], TW[2] - SH[2]) - .2, gesture: G < 30 ? 'explain' : null, brow: .5, talk: 0, perform: .25, smile: 0 };
      if (T < .5) return { pos: SH, facing: face(AV[0] - SH[0], AV[2] - SH[2]), gesture: null, smile: .1, talk: 0, perform: .3 };
      if (T < 3.0) return { pos: SH, facing: face(AV[0] - SH[0], AV[2] - SH[2]) + (T > 1.1 ? .42 * Math.sin((T - 1.1) * 11) : 0), gesture: 'mouth', brow: .5, talk: 0, perform: 0, smile: 0 };
      return { pos: SH, facing: face(AV[0] - SH[0], AV[2] - SH[2]) + .15, gesture: null, smile: .9, talk: T > 4 ? .3 * talkAmt(t, 1) : 0, brow: 0, perform: .5 }; });
    boyP(Wd, 3, t => { const G = Gf(t), T = Tn(t);
      if (T < 0) return { pos: AV, facing: face(TW[0] - AV[0], TW[2] - AV[2]) + .1, gesture: G < 30 ? 'think' : null, brow: .45, perform: .25, smile: 0 };
      if (T < 3.4) return { pos: AV, facing: face(SH[0] - AV[0], SH[2] - AV[2]), gesture: 'lean', smile: 0, brow: .2, perform: 0 };
      if (T < 5.0) return { pos: AV, facing: face(SH[0] - AV[0], SH[2] - AV[2]), gesture: null, smile: .9, perform: .5 };
      return { pos: AV, facing: face(SH[0] - AV[0], SH[2] - AV[2]) + .2, gesture: 'thumb', smile: 1, perform: 0 }; });
    [[4, EXA], [5, EXB], [6, EXC]].forEach(([id, p], j) => boyP(Wd, id, t => { const T = Tn(t), G = Gf(t); return { pos: p, facing: T < 0 ? face(TW[0] - p[0], TW[2] - p[2]) : face(SH[0] - p[0], SH[2] - p[2]) + .3 * (j - 1), gesture: T < 0 && G > 31 ? 'bothup' : null, perform: .45, smile: T > 3 ? .9 : (T < 0 ? 0 : .2), brow: T > 3 ? 0 : .4, talk: T > 4 ? .3 * talkAmt(t, 6 + j) : 0 }; }));
    boyP(Wd, 2, t => { const G = Gf(t), T = Tn(t), k = sm(P(44.6, 51, G));
      return Object.assign({ pos: CH, facing: face(1, .6), scale: 1 - .14 * k }, T < 4.4 ? { gesture: 'headdown', smile: 0, brow: .5 * k, perform: .4 } : { gesture: null, smile: .6, brow: 0, perform: .55, look: 0 }, SIT); });
    const g = gossip(Wd, Gf, { B: Bf, cntOverride: cntO });
    const ok = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x7dffa4), ok2 = shock(Wd, 0xb9ffd0);
    Wd.on(t => { const T = Tn(t); const k = popE(P(4.1, 5.0, T)); ok.set([CP[0] + 2.35, CP[1] + .3, CP[2] + .5], k * 1.5, .06 * Math.sin(t * 3)); sk.set([CP[0] + 2.35, CP[1] + .3, CP[2] + .6], P(4.1, 5.2, T), 3); ok2.set([CP[0], CP[1], CP[2] + .5], P(3.4, 4.6, T), 3.4); ry(sm(P(1.5, 6, T))); });
    Wd.center = [-1, -1];
    Wd.cam = seq([0, cine([C(0, [1.0, 2.4, -1.0], 12.0, 2.5, -20, 48), C(RW, [-.5, 2.0, -.6], 8.6, 1.6, 20, 46)])],
      [RW, cine([C(RW, [-1.1, 1.55, .1], 2.9, .2, 24, 44, -.3), C(RW + 3.0, [-1.1, 1.55, .1], 2.7, .2, -8, 44, -.3)])],
      [RW + 3.0, cine([C(RW + 3.0, [-.4, 2.3, -1.6], 6.0, .4, -10, 46, -1.2), C(RW + 5.8, [-.4, 2.3, -1.6], 6.4, .6, 8, 46, -1.2)])],
      [RW + 5.8, cine([C(RW + 5.8, [0, 1.5, .35], 3.0, .2, -24, 44, -.3), C(14, [.1, 1.5, .35], 3.3, .3, 18, 44, -.3)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 86-100: the boys, Chaim included, play ball in the sun; the counter in the background shows a green 0
  function ballGame(Wd, spec) {
    const bl = soccer(Wd, .15);
    return t => { const [a, b, k] = spec.leg(t); const A = spec.pos(a, t), B = spec.pos(b, t); const p = arcPt([A[0], 1.0, A[2]], [B[0], 1.0, B[2]], k, spec.lift === undefined ? .55 : spec.lift); bl.position.set(p[0], p[1], p[2]); bl.rotation.x = t * 6; return [a, b, k]; };
  }
  function s7(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd), TJ = 5.5, YOS = CH;
    const slot = i => { const a = PI / 2 + i * (2 * PI / 5); return [Math.cos(a) * 2.9, 0, Math.sin(a) * 2.2 + .4]; };
    const legT = 1.25, ord1 = [0, 1, 2, 3], ord2 = [0, 1, 4, 2, 3];
    const sched = []; { let t = 1.0, i = 0; while (t < 17) { const ord = t < TJ + 1.5 ? ord1 : ord2; const a = ord[i % ord.length]; sched.push({ t0: t, from: a, to: ord[(i + 1) % ord.length] }); i++; t += legT; } }
    const leg = t => { let L = sched[0]; for (const s of sched) if (s.t0 <= t) L = s; return L; };
    const SF = [-6.0, 0, -2.5], yp = t => { if (t < 2.4) return YOS; if (t < TJ) return lerpV([-6.3, 0, -2.9], SF, sm(P(2.4, TJ, t))); const k = sm(P(TJ, TJ + 4.2, t)); return lerpV(SF, slot(4), k); };
    const posOf = (i, t) => i === 4 ? yp(t) : slot(i);
    const near = (i, t) => { const L = leg(t), k = (t - L.t0) / 1.25; return { catching: L.to === i && k > .55, throwing: L.from === i && k < .25 && t > 1.2 }; };
    ballGame(Wd, { leg: t => { const L = leg(t); return [L.from, L.to, clamp((t - L.t0) / 1.25, 0, 1)]; }, pos: posOf });
    [1, 3, 4, 5].forEach((pi, i) => boyP(Wd, pi, t => { const n = near(i, t), p = slot(i); const L = leg(t); const tgt = posOf(n.throwing ? L.to : (L.from === i ? L.to : L.from), t);
      return { pos: p, facing: face(tgt[0] - p[0], tgt[2] - p[2]), gesture: n.catching ? 'catchp' : n.throwing ? 'throwp' : null, perform: n.catching || n.throwing ? 0 : .4, smile: 1, talk: .5 * talkAmt(t, i) }; }));
    boyP(Wd, 2, t => { const stand = t > 2.4, p = yp(t), joined = t >= TJ + 4.2; const L = leg(t), n = near(4, t); const tgt = posOf(L.from === 4 ? L.to : L.from, t);
      if (!stand) return Object.assign({ pos: p, facing: face(1, .6), gesture: 'headdown', smile: .2, perform: .4 }, SIT);
      if (!joined) { const mv = t > TJ; return { pos: p, facing: t < TJ ? face(1, .8) : face(slot(4)[0] - p[0], slot(4)[2] - p[2]), walk: mv ? t * 5.6 : undefined, gesture: !mv && t < 4.4 ? 'bothup' : null, smile: 1, perform: 0, scale: 1 }; }
      return { pos: p, facing: face(tgt[0] - p[0], tgt[2] - p[2]), gesture: n.catching ? 'catchp' : n.throwing ? 'throwp' : null, perform: .3, smile: 1, talk: .4 * talkAmt(t, 9) }; });
    const cnt = counter(Wd), ok = mark3d(Wd, 'check', 1.0);
    const glowRing = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(120,255,160,.9)'); r.addColorStop(.6, 'rgba(90,230,140,.45)'); r.addColorStop(1, 'rgba(90,230,140,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })); glowRing.rotation.x = -PI / 2; Wd.add(glowRing);
    const sun = glowSprite(7, 7, 0); sun.position.set(-3, 6.5, -9); sun.material.color.set(0xfff0a0); Wd.add(sun);
    const stars = []; for (let i = 0; i < 16; i++) { const s = glowSprite(.28, .28, .8); s.material.color.set(0xb8ffd0); Wd.add(s); stars.push(s); }
    Wd.on(t => { cnt.set(CP, 1, { ones: 'g0', glow: 1 }); ok.set([CP[0] + 2.35, CP[1] + .3, CP[2] + .5], 1.4, .06 * Math.sin(t * 3));
      const gk = sm(P(TJ - 1, TJ + 3, t)); glowRing.position.set(0, .03, .4); glowRing.scale.setScalar(.01 + gk * 4.4); glowRing.material.opacity = gk * (.8 + .15 * Math.sin(t * 3));
      sun.material.opacity = sm(P(.5, 4, t)) * .75; ry(sm(P(.5, 4, t)));
      stars.forEach((s, i) => { const a = t * .8 + i * 2.1, r = 2.6 + (i % 3) * .5; s.position.set(Math.cos(a) * r, .6 + (t * .5 + i * .37) % 2.6, .4 + Math.sin(a) * r * .75); s.material.opacity = gk * (.4 + .4 * Math.sin(t * 4 + i)); }); });
    lighting(Wd, t => ({ hemi: lerp(1.5, 1.75, sm(P(.5, 5, t))), sun: lerp(1.9, 2.2, sm(P(.5, 5, t))) }));
    Wd.center = [0, .4];
    Wd.cam = seq([0, cine([C(0, [-5.8, 1.0, -2.8], 4.6, .8, 30, 44, 0), C(3, [-5.6, 1.1, -2.6], 3.6, .6, 6, 42, 0)])],
      [3, cine([C(3, [-5.7, 1.2, -2.9], 4.4, .5, 30, 44, -.4), C(5.5, [-5.2, 1.3, -2.5], 6.0, .8, 15, 44, -.9), C(7.6, [-3.0, 1.0, -1.4], 8.0, 2.8, 50, 44, -1.0), C(9.8, [.4, 1.0, .2], 8.0, 3.0, 20, 44, -1.0)])],
      [9.8, cine([C(9.8, [0, 1.3, -.4], 6.4, 1.0, -30, 46, -.8), C(13, [0, 1.4, -.4], 6.4, 1.0, 36, 46, -.8)])],
      [13, cine([C(13, [0, 1.5, -.4], 6.2, .8, 20, 46, 0), C(16, [0, 1.8, -.4], 10.0, 2.6, -14, 46, 0)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the boys laugh and play ball behind the card
  function answerBg(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd); ry(.8);
    const xs = [-3.4, -1.7, 0, 1.7, 3.4], ids = [1, 3, 2, 4, 5];
    const bl = soccer(Wd, .15), per = 1.1;
    const posI = i => [xs[i], 0, .1 + (i % 2) * .3];
    const leg = t => { const k = t / per, a = Math.floor(k) % 5, b = (a + 1) % 5; return [a, b, k - Math.floor(k)]; };
    ids.forEach((id, i) => boyP(Wd, id, t => { const [a, b, k] = leg(t), p = posI(i), to = posI(a === i ? b : a);
      return { pos: p, facing: face(to[0] - p[0], to[2] - p[2]) * .5, gesture: b === i && k > .5 ? 'catchp' : a === i && k < .25 ? 'throwp' : null, perform: .4, smile: 1, talk: .6 * talkAmt(t, i + 2), brow: .1 }; }));
    Wd.on(t => { const [a, b, k] = leg(t), A = posI(a), B = posI(b), p = arcPt([A[0], .95, A[2]], [B[0], .95, B[2]], k, .3); bl.position.set(p[0], p[1], p[2]); bl.rotation.x = t * 6; });
    lighting(Wd, () => ({ hemi: 1.7, sun: 2.1 }));
    Wd.center = [0, 0]; Wd.ansD = 7.4; return Wd;
  }

  // ---------------------------------------------------------------- colour grade + overlays (absolute film seconds)
  const grade = t => {
    if (t >= 72 && t < 72 + RW) { const k = (t - 72) / RW; return { sat: lerp(.2, 1, sm(k)), bright: 1 }; }
    return { sat: 1 };
  };
  const overlay = (g, W, H, t) => {
    const s = H / 1080;
    if (t >= 72 && t < 72 + RW + .3) {   // rewind: scan lines, flicker band, big double arrows
      const a = 1 - P(72 + RW - .2, 72 + RW + .3, t); g.globalAlpha = a * .22; g.fillStyle = '#9fb4ff'; for (let y = 0; y < H; y += 8 * s) g.fillRect(0, y, W, 2 * s);
      const by = ((t - 72) * 900 * s) % H; g.globalAlpha = a * .25; g.fillStyle = '#ffffff'; g.fillRect(0, by, W, 38 * s);
      g.globalAlpha = a * .95; g.fillStyle = '#fff'; g.strokeStyle = '#1c2745'; g.lineWidth = 10 * s; g.lineJoin = 'round'; const cx = W / 2, cy = 110 * s, q = 52 * s;
      for (const dx of [-q * .95, q * .95]) { g.beginPath(); g.moveTo(cx + dx + q * .7, cy - q); g.lineTo(cx + dx - q * .7, cy); g.lineTo(cx + dx + q * .7, cy + q); g.closePath(); g.stroke(); g.fill(); }
      g.globalAlpha = 1; }
  };
  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg, grade, overlay };
};
