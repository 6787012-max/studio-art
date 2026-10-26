// halashon-03 story: "once or a habit?" - 3D choreography per storyboards_v4.md (B). Boys only. Everything is a function of time.
// Hebrew words that are drawn inside the 3D world are written as \u escapes.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, yardWorld, board, shock, mark3d, qmark,
    popE, shakeCam, lighting, arcPt, lerpV, glowSprite, canvasTex, FONT, bill, fitText } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.14 * d : ly];
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const SIT = { sit: true, groundY: 0 };
  const W_SIGN = 'בעלי לשון הרע', W_TORAH = 'תורת ה׳', W_HEFKER = 'הפקר';

  // extra head pose (look up) registered into the shared pose table from here (the engine file itself is not modified); falls back to 'point'
  let LOOKUP = false;
  try { import(new URL('../../_studio-animatzia/lib/figure3d.js', location.href).href).then(m => { if (m && m.POSES) { m.POSES.lookup = { head: [-.5, 0, 0], chest: [-.06, 0, 0] }; m.POSES.lookupw = { head: [-.5, 0, 0], chest: [-.06, 0, 0], armA: [-.3, 0, -.5], armB: [-.3, 0, .5], foreA: [-.5, 0, 0], foreB: [-.5, 0, 0] }; LOOKUP = true; } }).catch(() => {}); } catch (e) {}

  const rays = Wd => { const arr = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 12), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(-8 + i * 2.8, 5, -4 + (i % 2)); m.rotation.z = .4; Wd.add(m); arr.push(m); }
    return k => arr.forEach((m, i) => m.material.opacity = k * (.16 + .06 * Math.sin(i * 2 + k * 3))); };
  const dimmer = (Wd, kf) => {   // mild grey world: sky, light, fog (never dark)
    const t1 = new THREE.Color(0x4f9fe8), t2 = new THREE.Color(0x8e97a8), b1 = new THREE.Color(0xfff0d2), b2 = new THREE.Color(0xc4c8d2);
    Wd.on(t => { const k = kf(t); Wd.hemi.intensity = lerp(1.5, 1.2, k); Wd.sun.intensity = lerp(1.9, 1.5, k);
      Wd.sky.material.uniforms.top.value.copy(t1).lerp(t2, k); Wd.sky.material.uniforms.bot.value.copy(b1).lerp(b2, k); if (Wd.scene.fog) Wd.scene.fog.color.copy(b1).lerp(b2, k); }); };
  const occ = (Wd, g) => { (Wd.occ = Wd.occ || []).push(g); return g; };

  // ---------------------------------------------------------------- layout
  const BB = [[-7.35, 0, -3.3], [-6.5, 0, -3.3], [-5.65, 0, -3.3]], BID = [3, 4, 5];   // the three "regulars" on the bench
  const YK = [.8, 0, -1.0], LS = [-.6, 0, -.7];                                       // Yanky and a listener
  const CAL = [-3.0, 2.2, -2.4];                                                       // wall calendar floating between them
  const SCP = [-1.0, 0, -1.8], YKS = [2.9, 0, -1.0];                                                         // balance scale base

  // ---------------------------------------------------------------- boys
  const boyK = (Wd, i, fn) => { const Pp = boyP(Wd, i, fn); Wd.on(() => { const k = Pp.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }); return Pp; };   // dark navy velvet kippa
  const benchBoys = (Wd, fn) => BB.forEach((p, j) => boyK(Wd, BID[j], t => Object.assign({ pos: p, facing: .35 - .3 * j }, SIT, fn(t, j))));
  const chat = (t, j) => ({ perform: .7, talk: .75 * talkAmt(t, j + 2), smile: .25, brow: .2 });
  const standBy = (Wd, fn) => boyK(Wd, 1, t => Object.assign({ pos: YK, facing: face(-.6, .8) }, fn(t)));
  const listener = (Wd, fn) => boyK(Wd, 6, t => Object.assign({ pos: LS, facing: face(.7, .6) }, fn(t)));

  // ---------------------------------------------------------------- grey speech bubbles with icons only (no words)
  const ICONS = {
    frown: (c, cx, cy, r) => {
      c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .08; c.strokeStyle = '#3a3320'; c.stroke();
      c.fillStyle = '#3a3320'; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(cx + sx * r * .38, cy - r * .12, r * .1, r * .15, 0, 0, 7); c.fill(); }
      c.lineCap = 'round'; c.lineWidth = r * .1; c.beginPath(); c.moveTo(cx - r * .62, cy - r * .3); c.lineTo(cx - r * .2, cy - r * .5); c.moveTo(cx + r * .62, cy - r * .3); c.lineTo(cx + r * .2, cy - r * .5); c.stroke();
      c.lineWidth = r * .12; c.beginPath(); c.arc(cx, cy + r * .78, r * .42, PI * 1.12, PI * 1.88); c.stroke(); },
    run: (c, cx, cy, r) => {   // a running figure = "what he did"
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#243058'; c.lineWidth = r * .15;
      c.beginPath(); c.moveTo(cx + .1 * r, cy - .35 * r); c.lineTo(cx - .1 * r, cy + .15 * r); c.moveTo(cx, cy - .25 * r); c.lineTo(cx + .6 * r, cy - .05 * r); c.moveTo(cx, cy - .25 * r); c.lineTo(cx - .55 * r, cy - .45 * r);
      c.moveTo(cx - .1 * r, cy + .15 * r); c.lineTo(cx + .5 * r, cy + .3 * r); c.lineTo(cx + .42 * r, cy + .8 * r); c.moveTo(cx - .1 * r, cy + .15 * r); c.lineTo(cx - .5 * r, cy + .5 * r); c.lineTo(cx - .85 * r, cy + .38 * r); c.stroke();
      c.beginPath(); c.arc(cx + .2 * r, cy - .62 * r, r * .24, 0, 7); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .08; c.stroke();
      c.lineWidth = r * .07; c.globalAlpha = .55; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(cx - 1.05 * r, cy - .3 * r + i * .3 * r); c.lineTo(cx - .75 * r, cy - .3 * r + i * .3 * r); c.stroke(); } c.globalAlpha = 1; },
    tree: (c, cx, cy, r) => {   // a family tree = "his fathers"
      const N = [[0, -.68], [-.55, -.02], [.55, -.02], [-.85, .66], [-.28, .66], [.28, .66], [.85, .66]], E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
      c.lineCap = 'round'; c.strokeStyle = '#243058'; c.lineWidth = r * .1; E.forEach(([a, b]) => { c.beginPath(); c.moveTo(cx + N[a][0] * r, cy + N[a][1] * r); c.lineTo(cx + N[b][0] * r, cy + N[b][1] * r); c.stroke(); });
      N.forEach(([x, y], i) => { c.beginPath(); c.arc(cx + x * r, cy + y * r, r * (i === 0 ? .25 : .2), 0, 7); c.fillStyle = i === 0 ? '#f0c63a' : '#f7e7a6'; c.fill(); c.lineWidth = r * .07; c.stroke(); }); },
    ear: (c, cx, cy, r) => {   // an ear = "I heard"
      c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(cx - .3 * r, cy + .8 * r);
      c.bezierCurveTo(cx - .85 * r, cy + .2 * r, cx - .75 * r, cy - .85 * r, cx + .05 * r, cy - .85 * r); c.bezierCurveTo(cx + .8 * r, cy - .85 * r, cx + .85 * r, cy - .05 * r, cx + .38 * r, cy + .3 * r);
      c.bezierCurveTo(cx + .1 * r, cy + .5 * r, cx + .2 * r, cy + .85 * r, cx - .3 * r, cy + .8 * r); c.closePath(); c.fillStyle = '#f2c8a0'; c.fill(); c.lineWidth = r * .11; c.strokeStyle = '#243058'; c.stroke();
      c.beginPath(); c.moveTo(cx - .12 * r, cy + .3 * r); c.bezierCurveTo(cx - .5 * r, cy - .1 * r, cx - .35 * r, cy - .55 * r, cx, cy - .5 * r); c.bezierCurveTo(cx + .35 * r, cy - .5 * r, cx + .4 * r, cy - .05 * r, cx + .1 * r, cy + .08 * r); c.stroke(); },
  };
  const BT = {};
  const bubTex = kind => BT[kind] || (BT[kind] = canvasTex(768, 552, (c, W, H) => {
    const x0 = W * .04, y0 = H * .04, bw = W * .92, bh = H * .74, R = bh * .42;
    c.lineJoin = 'round'; c.beginPath(); c.roundRect(x0, y0, bw, bh, R); c.moveTo(W * .2, H * .74); c.lineTo(W * .1, H * .98); c.lineTo(W * .4, H * .74); c.closePath();
    c.fillStyle = '#e1e4ec'; c.fill(); c.lineWidth = W * .02; c.strokeStyle = '#1c2745'; c.stroke();
    ICONS[kind](c, W / 2, y0 + bh / 2, bh * .36); }));
  function bubble3(Wd, kind) {
    const w = 1.6, h = 1.15, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: bubTex(kind), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 8; inner.add(m);
    const gl = glowSprite(w * 2.2, h * 2.4, 0); gl.material.color.set(0xb7bccb); gl.position.z = -.12; inner.add(gl);
    bill(Wd, g);
    return { g, set(pos, s, a, rz) { const on = s > .01 && (a === undefined || a > .01); g.visible = on; if (!on) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; const al = a === undefined ? 1 : a; m.material.opacity = al; gl.material.opacity = .4 * al; } };
  }
  const KINDS = ['run', 'tree', 'ear', 'frown'];
  // a continuous stream of bubbles popping up ABOVE the three heads and floating up (never through a head)
  function stream(Wd, o) {
    const bs = []; for (let i = 0; i < o.n; i++) { const b = bubble3(Wd, KINDS[i % KINDS.length]); bs.push(b); occ(Wd, b.g); }
    const Pd = o.n * o.gap, until = o.until === undefined ? 1e9 : o.until;
    Wd.on(t => bs.forEach((b, i) => {
      const e = t - o.t0 - i * o.gap; if (e < 0) { b.set([0, 0, 0], 0); return; }
      const k = Math.floor(e / Pd), u = (e - k * Pd) / o.life, spawn = o.t0 + i * o.gap + k * Pd;
      if (u >= 1 || spawn > until) { b.set([0, 0, 0], 0); return; }
      const j = i % 3, hp = BB[j], su = sm(u);
      b.set([hp[0] + (j - 1) * 1.15 * su + .22 * Math.sin(u * 5 + i * 1.3), 2.8 + 2.5 * u + .08 * Math.sin(u * 7 + i), hp[2] + .25 + .35 * u], popE(P(0, .16, u)) * .8 * (1 + .1 * u), 1 - sm(P(.78, 1, u)), .12 * Math.sin(u * 6 + i));
    }));
    return bs;
  }

  // ---------------------------------------------------------------- wall calendar with flipping pages
  const NT = {};
  const numTex = n => NT[n] || (NT[n] = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#fffaf0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d9c9a0'; c.lineWidth = 8; c.strokeRect(8, 8, w - 16, h - 16);
    c.direction = 'ltr'; c.font = `700 ${h * .66}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = '#ffffff'; c.lineWidth = h * .05; c.strokeText('' + n, w / 2, h * .54); c.fillStyle = '#1d2a5a'; c.fillText('' + n, w / 2, h * .54); }));
  function calendar(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    g.add(box(2.2, 2.65, .12, 0x6b3a1c, { pos: [0, 0, -.1] })); g.add(box(2.2, .5, .14, 0xc4161c, { pos: [0, 1.075, -.02] }));
    [-.6, .6].forEach(x => g.add(ball(.09, 0xe8e8e8, { pos: [x, 1.0, .08] })));
    const mk = () => new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: numTex(1), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false }));
    const base = mk(); base.position.set(0, -.28, 0); base.renderOrder = 3; g.add(base);
    const hinge = new THREE.Group(); hinge.position.set(0, .67, .02); g.add(hinge); const flap = mk(); flap.position.set(0, -.95, 0); flap.renderOrder = 4; hinge.add(flap);
    const dn = d => ((Math.floor(d) - 1) % 30 + 30) % 30 + 1;
    return { g, set(pos, s, day, ry) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); g.rotation.y = ry || 0;
      const f = day - Math.floor(day), a = f < .5 ? sm(f / .5) * PI * .95 : PI;
      flap.material.map = numTex(dn(day)); base.material.map = numTex(dn(day + 1)); hinge.rotation.x = -a; flap.visible = f < .5 && a < PI * .56; } };
  }

  // ---------------------------------------------------------------- the sign that lowers over the bench
  function signBoard(Wd) {
    const W = 3.6, H = 1.0, g = new THREE.Group(); g.visible = false; Wd.add(g); const sw = new THREE.Group(); g.add(sw);
    sw.add(box(W + .22, H + .22, .14, 0x6b3a1c, { pos: [0, 0, -.08] }));
    const face_ = (lit) => canvasTex(1024, 288, (c, w, h) => {
      c.fillStyle = lit ? '#fff0b8' : '#a9afbd'; c.fillRect(0, 0, w, h); c.strokeStyle = lit ? '#b8870f' : '#7a8091'; c.lineWidth = 12; c.strokeRect(14, 14, w - 28, h - 28);
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, W_SIGN, { maxW: w * .86, maxLines: 1, max: h * .62, min: h * .3, lh: 1.1 });
      c.font = `700 ${f.size}px ${FONT}`; c.lineJoin = 'round'; c.strokeStyle = lit ? '#ffffff' : '#c9ceda'; c.lineWidth = f.size * .08; c.strokeText(f.lines[0], w / 2, h * .55); c.fillStyle = lit ? '#a30f1c' : '#5d6272'; c.fillText(f.lines[0], w / 2, h * .55); });
    const off = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: face_(false), fog: false, toneMapped: false })); sw.add(off);
    const on = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: face_(true), transparent: true, opacity: 0, fog: false, toneMapped: false })); on.position.z = .006; on.renderOrder = 5; sw.add(on);
    for (const sx of [-1, 1]) sw.add(cyl(.03, .03, 14, 0x555a66, { pos: [sx * (W / 2 - .3), H / 2 + 7, -.1], ink: false }));
    const bulbs = []; for (let i = 0; i < 9; i++) for (const sy of [-1, 1]) { const b = ball(.065, 0x8a8f99, { pos: [-W / 2 + .2 + i * (W - .4) / 8, sy * (H / 2 + .02), .02], ink: false }); sw.add(b); bulbs.push(b); }
    const gl = glowSprite(W * 1.9, H * 2.8, 0); gl.material.color.set(0xffd27a); gl.position.z = -.3; sw.add(gl);
    const cA = new THREE.Color(0x8a8f99), cB = new THREE.Color(0xfff0a0), tmp = new THREE.Color();
    return { g, sw, set(pos, s, L, rz) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); sw.rotation.z = rz || 0; on.material.opacity = L; gl.material.opacity = .8 * L;
      bulbs.forEach((b, i) => b.material.color.copy(tmp.copy(cA).lerp(cB, L * (.6 + .4 * Math.sin(i * 1.7 + L * 9) ** 2)))); } };
  }
  const motes = (Wd, n, col) => { const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(.22, .22, 0); s.material.color.set(col); Wd.add(s); sp.push(s); }
    return (t, c, rad, k) => sp.forEach((s, i) => { const a = t * .7 + i * 2.4, r = rad * (.7 + .3 * ((i * 7) % 5) / 4); s.position.set(c[0] + Math.cos(a) * r, c[1] + Math.sin(a * 1.3) * rad * .35, c[2] + .3 + Math.sin(a) * .3); s.material.opacity = k * (.35 + .45 * Math.sin(t * 3 + i * 1.7) ** 2); }); };

  // ---------------------------------------------------------------- the balance scale (right pan sinks onto a block)
  const PS = .4, PILE = []; { const rows = [5, 4, 3, 2]; let k = 0; rows.forEach((n, r) => { for (let q = 0; q < n; q++) { PILE.push([(q - (n - 1) / 2) * .46 + (rnd(k) - .5) * .08 + (r % 2 ? .05 : -.05), .26 + r * .3, (rnd(k + 7) - .5) * .12]); k++; } }); }
  function rig(Wd, O) {
    const g = new THREE.Group(); g.position.set(O[0], 0, O[2]); Wd.add(g); const AX = 1.8, PY = 2.72, DROP = 1.6;
    g.add(box(2.0, .12, 1.2, 0x7a4a2a, { pos: [0, .06, 0] })); g.add(cyl(.1, .15, 2.7, 0x6b3a1c, { pos: [0, 1.4, 0] })); g.add(ball(.2, 0xd9a21b, { pos: [0, PY, 0] }));
    g.add(box(1.9, .32, 1.3, 0x8a5a34, { pos: [1.65, .16, 0] }));   // block under the right pan
    const beam = new THREE.Group(); beam.position.set(0, PY, 0); g.add(beam); beam.add(box(AX * 2 + .1, .14, .16, 0xd9a21b)); [-1, 1].forEach(s => beam.add(ball(.11, 0xd9a21b, { pos: [s * AX, 0, 0] })));
    const pans = [-1, 1].map(s => { const p = cyl(.82, .62, .14, 0xd9a21b); g.add(p); const st = [-1, 1].map(() => { const c = cyl(.018, .018, 1, 0x5a4a30, { ink: false }); g.add(c); return c; }); return { p, st, s }; });
    const place = tilt => pans.map(({ p, st, s }) => { const ex = s * AX * Math.cos(tilt), ey = PY - s * AX * Math.sin(tilt), py = ey - DROP; p.position.set(ex, py, 0);
      st.forEach((c, q) => { const rx = ex + (q ? .72 : -.72), ry = py + .07, dx = rx - ex, dy = ry - ey, len = Math.hypot(dx, dy); c.position.set((ex + rx) / 2, (ey + ry) / 2, 0); c.scale.set(1, len, 1); c.rotation.z = Math.atan2(-dx, dy); });
      return [O[0] + ex, py + .07, O[2]]; });
    return { g, moving: [beam, pans[0].p, pans[1].p], setTilt(tilt) { beam.rotation.z = -tilt; return place(tilt); }, block: [O[0] + 1.65, .32, O[2]] };
  }

  // ---------------------------------------------------------------- 1. HOOK 0-14: split picture - Yanky tells once (one bubble) / the bench boys tell all the time (many bubbles) / calendar between
  function hook(dur) {
    const Wd = yardWorld({ noBall: true });
    standBy(Wd, t => ({ gesture: t > 2.4 && t < 6 ? 'explain' : (t > 7 ? 'shrug' : null), perform: 0, talk: t > 2.6 && t < 5.8 ? .7 * talkAmt(t, 1) : 0, smile: 0, brow: t > 6 ? .4 : .1 }));
    listener(Wd, t => ({ gesture: t < 2.4 ? 'lean' : (t < 7 ? 'think' : null), perform: t > 7 ? .5 : 0, talk: 0, smile: 0, brow: .2 }));
    benchBoys(Wd, chat);
    stream(Wd, { n: 15, gap: .45, life: 3.8, t0: 1.2 });
    const yb = bubble3(Wd, 'frown'), cal = calendar(Wd); occ(Wd, yb.g); occ(Wd, cal.g);
    Wd.on(t => { yb.set([YK[0] + .1, 2.85 + .1 * sm(P(4.6, 9, t)) + .05 * Math.sin(t * 1.6), YK[2] + .2], popE(P(4.2, 5.2, t)) * .85 * (1 + .03 * Math.sin(t * 4)), 1, .05 * Math.sin(t * 2));
      cal.set([CAL[0] + .6, CAL[1] + .06 * Math.sin(t * 1.3), CAL[2]], popE(P(.3, 1.3, t)), 1 + t * 1.15 + .02 * t * t, -.12 + .05 * Math.sin(t * .5)); });
    Wd.noQ = true; const qm = qmark(Wd, '#5ec8ff', 1.1), fw = new THREE.Vector3(), up = new THREE.Vector3(), rt = new THREE.Vector3();
    Wd.on((t, cam) => { cam.getWorldDirection(fw); up.set(0, 1, 0).applyQuaternion(cam.quaternion); rt.set(1, 0, 0).applyQuaternion(cam.quaternion);
      const p = cam.position.clone().addScaledVector(fw, 8).addScaledVector(up, 2.6).addScaledVector(rt, 0); qm.set([p.x, p.y + .08 * Math.sin(t * 1.7), p.z], popE(P(3.0, 4.0, t)) * 1.1, .12 * Math.sin(t * 1.1)); });
    Wd.center = [-3, -2];
    Wd.cam = cine([C(0, [-2.8, 2.0, -2.0], 12.0, 1.0, -18, 46, -.4), C(5, [-2.9, 2.2, -2.0], 11, .8, 2, 46, -.4), C(10, [-2.8, 2.2, -2.0], 10.4, 1.2, 18, 46, -.4), C(14, [-2.6, 2.2, -2.0], 11, 1.4, 10, 46, -.4)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: Yanky slips once: one bubble, a red cross, hand over the mouth
  function s2(dur) {
    const Wd = yardWorld({ noBall: true });
    standBy(Wd, t => { if (t < 3.2) return { gesture: 'lean', talk: .6 * talkAmt(t, 1), brow: .1, perform: 0, smile: .1, facing: face(-1, .5) };
      if (t < 4.6) return { gesture: 'explain', talk: .6 * talkAmt(t, 1), brow: .2, perform: 0, smile: 0, facing: face(-.8, .8) };
      if (t < 6.4) return { gesture: null, talk: 0, brow: .5, perform: 0, smile: 0, facing: face(-.3, 1) };
      if (t < 12.5) return { gesture: 'mouth', talk: 0, brow: .5, perform: 0, smile: 0, facing: face(-.3, 1) + (t > 8 ? .35 * Math.sin((t - 8) * 8) * (1 - P(8, 12.5, t)) : 0) };
      return { gesture: 'headdown', talk: 0, brow: .5, perform: 0, smile: 0, facing: face(-.4, 1) }; });
    listener(Wd, t => ({ gesture: t < 5 ? 'think' : (t < 9 ? 'lean' : null), perform: t < 9 ? 0 : .3, talk: 0, smile: 0, brow: t < 5 ? .1 : .5, facing: face(.7, .6) + (t > 6 ? .25 : 0) }));
    const yb = bubble3(Wd, 'frown'), x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff8a8a), dust = shock(Wd, 0xffd0d0); occ(Wd, yb.g); occ(Wd, x.g);
    Wd.on(t => { const k = popE(P(3.0, 4.2, t)) * (1 - sm(P(11.2, 12.4, t)));
      yb.set([YK[0] + .1 - .25 * sm(P(4, 12, t)), 2.85 + .08 * Math.sin(t * 1.6) + .22 * sm(P(4.2, 11, t)), YK[2] + .2], k * .85 * (1 + .03 * Math.sin(t * 4)), 1, .05 * Math.sin(t * 2));
      const xs = t > 5.4 ? popE(P(5.4, 6.0, t)) * (1 - sm(P(12.6, 13.4, t))) : 0; x.set([YK[0] + 1.75, 2.95, YK[2] + .3], xs * 1.0, .06 * Math.sin(t * 3));
      sk.set([YK[0] + 1.75, 2.95, YK[2] + .4], P(5.4, 6.2, t) * (t > 5.4 ? 1 : 0), 1.3); dust.set([YK[0] + 1.75, 2.95, YK[2] + .4], P(5.55, 6.5, t) * (t > 5.55 ? 1 : 0), 1.9); });
    Wd.center = [0, -1];
    Wd.cam = seq([0, cine([C(0, [.2, 2.1, -.9], 8.8, .6, -26, 44, -1.0), C(5, [.3, 2.2, -.9], 7.8, .4, 8, 44, -1.0), C(7.4, [.4, 2.2, -.9], 7.4, .4, 20, 44, -1.0)])],
      [7.4, cine([C(7.4, [1.3, 2.1, -.9], 7.8, .3, -18, 44, -1.1), C(11, [1.5, 2.1, -.9], 7.2, .3, 8, 44, -1.1), C(14, [1.5, 2.1, -.9], 8.0, .5, 22, 44, -1.1)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-44: the bench: the same boys every day, the calendar flips, icon bubbles stream up
  function s3(dur) {
    const Wd = yardWorld({ noBall: true });
    benchBoys(Wd, chat);
    const cal = calendar(Wd); occ(Wd, cal.g);
    stream(Wd, { n: 15, gap: .45, life: 3.8, t0: 0 });
    Wd.on(t => cal.set([CAL[0] + .7, CAL[1] - .1 + .06 * Math.sin(t * 1.3), CAL[2] - .5], 1, 1 + 1.1 * t + .06 * t * t, -.25 + .05 * Math.sin(t * .5)));
    Wd.center = [-5, -3];
    Wd.cam = seq([0, cine([C(0, [-5.0, 2.0, -3.0], 10.8, 1.0, -24, 46, -.2), C(7, [-4.8, 2.1, -3.0], 10, .9, 14, 46, -.2)])],
      [7, cine([C(7, [-5.2, 2.3, -3.2], 9.2, .5, 30, 46, -.4), C(14, [-5.0, 2.4, -3.2], 10, 1.0, -2, 46, -.4)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-58: the sign lowers over the bench and lights up; the boys look up at it
  function s4(dur) {
    const Wd = yardWorld({ noBall: true });
    const look = (j) => t => { const k = P(4.6, 5.4, t); const g = LOOKUP ? 'lookup' : 'point';
      if (t < 2.4) return chat(t, j);
      if (t < 4.6) return { perform: .3, talk: .3 * talkAmt(t, j + 2), smile: 0, brow: .2 };
      if (t < 10.5) return { gesture: g, perform: 0, talk: 0, smile: 0, brow: .5 };
      return { gesture: LOOKUP ? 'lookupw' : 'wide', perform: 0, talk: 0, smile: 0, brow: .5 }; };
    BB.forEach((p, j) => boyK(Wd, BID[j], t => Object.assign({ pos: p, facing: .3 - .3 * j }, SIT, look(j)(t))));
    stream(Wd, { n: 15, gap: .45, life: 3.8, t0: 0, until: .2 });
    const sg = signBoard(Wd), mt = motes(Wd, 10, 0xffe9a8); occ(Wd, sg.g); const ring = shock(Wd, 0xffd27a);
    const SY = 3.55, SZ = -3.95;
    Wd.on(t => { const d = P(1.4, 3.9, t), fall = d < 1 ? (1 - Math.pow(1 - d, 2)) : 1, y0 = 10 - (10 - SY) * fall, bounce = t > 3.9 ? .18 * Math.exp(-(t - 3.9) * 3.2) * Math.sin((t - 3.9) * 9) : 0;
      const L = sm(P(4.1, 5.0, t)); sg.set([BB[1][0], t < 1.4 ? 12 : y0 + bounce + .04 * Math.sin(t * 1.3) * L, SZ], 1, L * (.85 + .15 * Math.sin(t * 5)), (t > 3.9 ? .035 * Math.exp(-(t - 3.9) * 1.5) * Math.sin((t - 3.9) * 6) : 0));
      mt(t, [BB[1][0], SY + .2, SZ], 2.3, L); ring.set([BB[1][0], SY, SZ + .3], P(4.1, 5.3, t) * (t > 4.1 ? 1 : 0), 4.5); });
    Wd.center = [-6.5, -3];
    Wd.cam = seq([0, cine([C(0, [-6.2, 2.6, -3.4], 10.4, 1.0, 20, 46, -.7), C(5, [-6.3, 2.7, -3.4], 9.4, .8, 4, 46, -.7), C(8, [-6.4, 2.7, -3.4], 8.8, .5, -18, 46, -.7)])],
      [8, cine([C(8, [-6.5, 2.3, -3.4], 7.4, .4, 24, 44, -.7), C(14, [-6.5, 2.5, -3.4], 9.6, 1.2, -6, 46, -.7)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-72: the scale: one small bubble vs a huge pile; the right pan drops heavily
  function s5(dur) {
    const Wd = yardWorld({ noBall: true }), R = rig(Wd, SCP); R.moving.forEach(o => occ(Wd, o));
    dimmer(Wd, t => .5 * sm(P(8, 11, t)));
    benchBoys(Wd, (t, j) => (t > 10.2 && t < 12.5) ? { gesture: 'bothup', perform: 0, talk: 0, brow: .5, smile: 0 } : chat(t, j));
    standBy(Wd, t => ({ pos: YKS, facing: face(-1, .3), gesture: t < 9.8 ? 'think' : 'headdown', perform: 0, talk: 0, smile: 0, brow: .4 }));
    const lb = bubble3(Wd, 'frown'); occ(Wd, lb.g);
    const pile = PILE.map((_, i) => { const b = bubble3(Wd, KINDS[(i * 3 + 1) % 4]); occ(Wd, b.g); return b; });
    const TL = i => i < 10 ? 1.8 + i * .6 : 10.0 + (i - 10) * .05, FLY = i => i < 10 ? 1.3 : .8;
    const sk = shock(Wd, 0xd8cdbd); const puffs = []; for (let i = 0; i < 8; i++) { const s = glowSprite(1.0, 1.0, 0); s.material.color.set(0xd8cdbd); Wd.add(s); puffs.push(s); }
    Wd.on(t => {
      let n = 0; for (let i = 0; i < 10; i++) n += sm(P(TL(i) - .1, TL(i) + .25, t));
      const T1 = 10.3, base = -.045 + .017 * n, tilt = t < 9.7 ? base : (t < T1 ? lerp(base, .42, ease.in(P(9.7, T1, t))) : .42 - .07 * Math.exp(-(t - T1) * 4) * Math.abs(Math.sin((t - T1) * 8)));
      const pans = R.setTilt(tilt), pl = pans[0], pr = pans[1];
      lb.set([pl[0], pl[1] + .36, pl[2]], popE(P(.3, 1.2, t)) * .62, 1, .03 * Math.sin(t * 2));
      pile.forEach((b, i) => { const tl = TL(i), ts = tl - FLY(i), loc = PILE[i], tgt = [pr[0] + loc[0], pr[1] + loc[1], pr[2] + loc[2]];
        if (t < ts) { b.set([0, 0, 0], 0); return; }
        const sc = PS;
        if (t >= tl) { const q = t - tl; b.set(tgt, sc * (1 + .22 * Math.exp(-q * 7) * Math.sin(q * 26)), 1, .06 * Math.sin(i * 2 + t * 1.5)); return; }
        const u = (t - ts) / FLY(i), src = i < 10 ? [BB[i % 3][0], 3.5, BB[i % 3][2] + .3] : [pr[0] + (i - 11.5) * .5, 7.5 + (i % 3) * .5, pr[2] + .1];
        b.set(arcPt(src, tgt, sm(u), i < 10 ? 1.3 : 0), sc * (i < 10 ? popE(P(0, .2, u)) : 1.5 - .5 * u), 1, .15 * Math.sin(u * 8 + i)); });
      sk.set([R.block[0], R.block[1] + .05, R.block[2] + .6], P(T1, T1 + 1.0, t) * (t > T1 ? 1 : 0), 2.2);
      puffs.forEach((s, i) => { const q = t - T1 - .05 * (i % 3); if (q < 0 || q > 1.6) { s.material.opacity = 0; return; } const a = i * .8 + .3, r = .5 + 1.5 * (q / 1.6);
        s.position.set(R.block[0] + Math.cos(a) * r, R.block[1] + .3 + .7 * (q / 1.6), R.block[2] + .4 + Math.sin(a) * r * .6); s.scale.set(1 + 1.4 * q, 1 + 1.4 * q, 1); s.material.opacity = .55 * (1 - q / 1.6); }); });
    Wd.center = [-1.0, -1.8];
    Wd.cam = shakeCam(seq([0, cine([C(0, [-1.8, 2.3, -2.2], 13, 1.2, -16, 46, -.9), C(6.5, [-1.6, 2.3, -2.0], 11, .9, 10, 46, -.6)])],
      [6.5, cine([C(6.5, [1.2, 2.4, -1.8], 8.2, .4, -26, 46, -.5), C(10.2, [1.0, 2.2, -1.8], 7.8, .3, -12, 46, -.4), C(14, [1.3, 2.4, -1.8], 9.0, .8, -22, 46, -.5)])]), [[10.3, .06, .6]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 72-86: the golden fence round the green garden: the bubbles trample it, the fence falls flat, a sign pops up
  function s6(dur) {
    const Wd = yardWorld({ noBall: true });
    const GC = [1.4, 0, -1.0], GW = 5.2, GD = 3.2;
    dimmer(Wd, t => .5 * sm(P(4, 9, t)));
    benchBoys(Wd, (t, j) => t > 5.7 ? { hidden: true } : chat(t, j));   // out of frame after the cut to the garden close-up
    const lawn = box(GW - .2, .05, GD - .2, 0x63b34a, { pos: [GC[0], .035, GC[2]], ink: false }); Wd.add(lawn);
    const NB = 14, LX = i => -3.1 + (i % 3) * .15, LZ = i => GC[2] + [-1.1, -.35, .4, .95, -.8, .1, .7, -.2, 1.0, -1.0, .5, -.5, .2, .8][i], VV = i => 1.5 + (i % 2) * .15, TLB = i => 2.4 + i * .5, TSB = i => TLB(i) - 1.2;
    // flowers: crush time computed analytically from the bubble paths
    const flowers = []; const fcol = [0xe03a3a, 0xf2c230, 0xf26fb0, 0xffffff, 0xb06be0];
    for (let a = 0; a < 7; a++) for (let b = 0; b < 4; b++) { const fx = GC[0] - 2.1 + a * .7 + (rnd(a * 4 + b) - .5) * .2, fz = GC[2] - 1.15 + b * .76 + (rnd(a * 4 + b + 9) - .5) * .15;
      const g = new THREE.Group(); g.position.set(fx, .05, fz); Wd.add(g); g.add(cyl(.02, .02, .4, 0x2f8f3a, { pos: [0, .2, 0], ink: false })); const hd = ball(.11, fcol[(a + b * 2) % 5], { pos: [0, .46, 0], ink: false }); g.add(hd);
      let ct = 1e9; for (let i = 0; i < NB; i++) if (Math.abs(LZ(i) - fz) < .55) ct = Math.min(ct, TLB(i) + (fx - LX(i)) / VV(i));
      flowers.push({ g, hd, ct, col: new THREE.Color(fcol[(a + b * 2) % 5]) }); }
    for (const [dx, dz, s] of [[-1.9, -1.0, 1], [1.95, -1.05, 1.1], [0, -1.2, .9]]) { Wd.add(cyl(.09 * s, .12 * s, .8 * s, 0x7a5232, { pos: [GC[0] + dx, .4 * s, GC[2] + dz] })); Wd.add(ball(.55 * s, 0x4fa04a, { pos: [GC[0] + dx, 1.1 * s, GC[2] + dz], scale: [1, .9, 1] })); }
    // fence: four panels hinged at their base, falling inward
    const mkPanel = (len, along) => { const g = new THREE.Group(); Wd.add(g); const n = Math.round(len); for (let k = 0; k <= n; k++) { const q = -len / 2 + k * len / n; g.add(box(.13, .9, .13, 0xd9a21b, { pos: along === 'x' ? [q, .45, 0] : [0, .45, q] })); }
      for (const y of [.3, .66]) g.add(box(along === 'x' ? len : .07, .08, along === 'x' ? .07 : len, 0xe8b830, { pos: [0, y, 0] })); return g; };
    const pF = mkPanel(GW, 'x'), pB = mkPanel(GW, 'x'), pL = mkPanel(GD, 'z'), pR = mkPanel(GD, 'z');
    pF.position.set(GC[0], 0, GC[2] + GD / 2); pB.position.set(GC[0], 0, GC[2] - GD / 2); pL.position.set(GC[0] - GW / 2, 0, GC[2]); pR.position.set(GC[0] + GW / 2, 0, GC[2]);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(2.3, .56), new THREE.MeshBasicMaterial({ map: canvasTex(768, 192, (c, w, h) => { c.fillStyle = '#1d2a5a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8b830'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, W_TORAH, { maxW: w * .8, maxLines: 1, max: h * .7, min: h * .3, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = '#ffd966'; c.fillText(f.lines[0], w / 2, h * .54); }), fog: false, toneMapped: false })); lab.position.set(0, .48, .09); pF.add(lab);
    const FT = [[pL, 3.6, 'z', 1], [pF, 5.0, 'x', 1], [pB, 6.2, 'x', -1], [pR, 7.0, 'z', -1]], shocks = FT.map(() => shock(Wd, 0xd8cdbd));
    // trampling bubbles
    const bub = []; for (let i = 0; i < NB; i++) { const b = bubble3(Wd, KINDS[i % 4]); bub.push(b); occ(Wd, b.g); }
    const hef = board(Wd, { w: 2.7, h: 1.0, cw: 768, frame: 0x5a1010, glow: 0xff7a7a, posts: 1.3, draw: (c, w, h) => { c.fillStyle = '#c4161c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffd0d0'; c.lineWidth = 12; c.strokeRect(14, 14, w - 28, h - 28); c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, W_HEFKER, { maxW: w * .8, maxLines: 1, max: h * .66, min: h * .3, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.lineJoin = 'round'; c.strokeStyle = '#5a0a10'; c.lineWidth = f.size * .08; c.strokeText(f.lines[0], w / 2, h * .55); c.fillStyle = '#ffffff'; c.fillText(f.lines[0], w / 2, h * .55); } });
    occ(Wd, hef.g); const hk = shock(Wd, 0xff7a7a), hk2 = shock(Wd, 0xffd0d0);
    const brown = new THREE.Color(0x8a6a3c), green = new THREE.Color(0x63b34a), fb = new THREE.Color(0x7a5a30), tmp = new THREE.Color();
    Wd.on(t => {
      lawn.material.color.copy(green).lerp(brown, sm(P(6, 10, t)));
      flowers.forEach(f => { const k = sm(P(f.ct - .15, f.ct + .25, t)); f.g.scale.set(1 + .3 * k, 1 - .88 * k, 1 + .3 * k); f.hd.material.color.copy(f.col).lerp(fb, k); });
      FT.forEach(([pn, tf, ax, sg], i) => { const q = P(tf, tf + .9, t), th = (sm(q) * 1.0 + (q >= 1 ? .03 * Math.exp(-(t - tf - .9) * 6) * Math.sin((t - tf - .9) * 14) : 0)) * (PI / 2) * .985;
        pn.rotation.set(ax === 'x' ? -sg * th : 0, 0, ax === 'z' ? -sg * th : 0);
        const pos = ax === 'x' ? [pn.position.x, .15, pn.position.z + (i === 1 ? -.6 : .6)] : [pn.position.x + (i === 0 ? .6 : -.6), .15, pn.position.z]; shocks[i].set(pos, P(tf + .8, tf + 1.8, t) * (t > tf + .8 ? 1 : 0), 2.4); });
      bub.forEach((b, i) => { const ts = TSB(i), tl = TLB(i), u = (t - ts) / 1.2, land = [LX(i), .5, LZ(i)];
        if (t < ts) { b.set([0, 0, 0], 0); return; }
        if (t < tl) { b.set(arcPt([BB[i % 3][0], 3.9, BB[i % 3][2] + .3], land, sm(u), 1.0), .66 * popE(P(0, .2, u)), 1, .15 * Math.sin(u * 8 + i)); return; }
        const q = t - tl, x = land[0] + VV(i) * q, endx = GC[0] + GW / 2 + 1.1; if (x > endx + 1.0) { b.set([0, 0, 0], 0); return; }
        b.set([x, .43 + .3 * Math.abs(Math.sin(q * 6.5 + i)), land[2] + .14 * Math.sin(q * 2 + i)], .66, 1 - sm(P(endx, endx + 1.0, x)), .3 * Math.sin(q * 6.5 + i)); });
      const hs = popE(P(9.4, 10.2, t)); hef.set([GC[0], 2.0 - .12 * (1 - sm(P(9.4, 10.2, t))), GC[2] + .2], hs, .04 * Math.sin(t * 2.4) * hs); hk.set([GC[0], 2.0, GC[2] + .5], P(9.4, 10.4, t) * (t > 9.4 ? 1 : 0), 2.0); hk2.set([GC[0], 1.4, GC[2] + .5], P(9.55, 10.7, t) * (t > 9.55 ? 1 : 0), 1.4);
    });
    Wd.center = [-1, -1];
    Wd.cam = seq([0, cine([C(0, [-2.2, 1.5, -2.0], 13.5, 1.6, -22, 46, -.2), C(5.5, [-.8, 1.4, -1.4], 11.5, 1.8, 6, 46, -.2)])],
      [5.5, cine([C(5.5, [3.0, .9, -.8], 8.0, 2.6, -22, 46, -.3), C(9.4, [2.6, 1.2, -.9], 7.4, 2.0, -4, 46, -.3), C(14, [2.4, 1.5, -.9], 8.6, 1.5, 16, 46, -.3)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 86-100: recap (one bubble + normal cross / the bench: sign, bigger cross, heavy pan); then the boys stand, the bubbles pop, the sun returns
  function s7(dur) {
    const Wd = yardWorld({ noBall: true }), R = rig(Wd, SCP), ryz = rays(Wd); R.moving.forEach(o => occ(Wd, o));
    const TS = 8.0;   // the turning point
    standBy(Wd, t => ({ pos: YKS, gesture: t < TS ? 'headdown' : (t < TS + 1.5 ? null : 'thumb'), perform: 0, talk: t > TS + 1 ? .4 * talkAmt(t, 1) : 0, smile: t < TS ? 0 : 1, brow: t < TS ? .5 : 0 }));
    listener(Wd, t => ({ pos: [4.1, 0, -.9], gesture: t < TS ? 'think' : null, perform: t < TS ? 0 : .5, talk: 0, smile: t < TS ? 0 : 1, brow: t < TS ? .4 : 0, facing: face(-.8, .6) }));
    const bst = (t, j) => { const st = P(TS - .1, TS + .5, t), mv = P(TS + .3, TS + 1.2, t);
      if (t < TS) return chat(t, j);
      return { sit: false, groundY: 0, pos: [BB[j][0] + .25 * (j - 1) * mv, 0, BB[j][2] + .75 * sm(mv)], walk: mv > 0 && mv < 1 ? t * 5.6 : undefined, facing: .35 - .3 * j + (j - 1) * -.25, gesture: t > TS + 1.6 ? (j === 1 ? 'cheer' : (j === 0 ? 'wave' : 'thumb')) : null, perform: 0, talk: .5 * talkAmt(t, j), smile: 1, brow: 0 }; };
    BB.forEach((p, j) => boyK(Wd, BID[j], t => Object.assign({ pos: p, facing: .35 - .3 * j }, SIT, bst(t, j))));
    const yb = bubble3(Wd, 'frown'), lb = bubble3(Wd, 'frown'), xs = mark3d(Wd, 'cross', 1.0), xb = mark3d(Wd, 'cross', 1.0), sg = signBoard(Wd), mt = motes(Wd, 12, 0xfff0a0), sparks = motes(Wd, 14, 0xb8ffd0);
    [yb, lb, xs, xb, sg].forEach(o => occ(Wd, o.g)); const sk1 = shock(Wd, 0xff8a8a), sk2 = shock(Wd, 0xff8a8a), sk3 = shock(Wd, 0xd8cdbd);
    const pile = PILE.map((_, i) => { const b = bubble3(Wd, KINDS[(i * 3 + 1) % 4]); occ(Wd, b.g); return b; });
    lighting(Wd, t => ({ hemi: lerp(1.45, 1.75, sm(P(TS, TS + 3, t))), sun: lerp(1.8, 2.2, sm(P(TS, TS + 3, t))) }));
    Wd.on(t => {
      const out = (a, d) => 1 - sm(P(a, a + d, t));
      // Yanky's side
      yb.set([YKS[0] + .1, 2.85 + .05 * Math.sin(t * 1.6), YKS[2] + .2], popE(P(.5, 1.4, t)) * .85 * (t < TS + .2 ? 1 : out(TS + .2, .3)), 1, .05 * Math.sin(t * 2));
      xs.set([YKS[0] + 1.75, 2.95, YKS[2] + .3], popE(P(1.6, 2.2, t)) * 1.0 * out(TS + .3, .3), .06 * Math.sin(t * 3)); sk1.set([YKS[0] + 1.75, 2.95, YKS[2] + .4], P(1.6, 2.6, t) * (t > 1.6 ? 1 : 0), 1.4);
      // the bench: sign, bigger cross
      const sgs = popE(P(3.0, 3.8, t)) * (t < TS ? 1 : 0); const rise = sm(P(TS + .1, TS + 1.4, t));
      sg.set([BB[1][0], 3.55 + 7 * rise, -3.95], t < TS ? sgs : 1, t < TS ? sm(P(3.4, 4.0, t)) : 1 - rise, 0); mt(t, [BB[1][0], 3.75, -3.95], 2.3, sm(P(3.4, 4.0, t)) * (1 - rise));
      xb.set([BB[1][0], 5.55, -3.6], popE(P(4.2, 4.8, t)) * 2.1 * out(TS - .2, .3), .05 * Math.sin(t * 3)); sk2.set([BB[1][0], 5.55, -3.3], P(4.2, 5.4, t) * (t > 4.2 ? 1 : 0), 2.6);
      // the scale: pile pops in, the right pan drops heavily, then everything pops away and the pans level out
      const T1 = 5.9, base = -.045, tilt = t < 5.3 ? base : (t < T1 ? lerp(base, .42, ease.in(P(5.3, T1, t))) : .42 - .07 * Math.exp(-(t - T1) * 4) * Math.abs(Math.sin((t - T1) * 8)));
      const tl2 = tilt * (1 - sm(P(TS + .7, TS + 2.4, t))); const pans = R.setTilt(tl2), pl = pans[0], pr = pans[1];
      lb.set([pl[0], pl[1] + .36, pl[2]], popE(P(3.9, 4.5, t)) * .62 * out(TS + .1, .3), 1, .03 * Math.sin(t * 2));
      pile.forEach((b, i) => { const loc = PILE[i], a0 = 4.4 + i * .06, a1 = TS + .15 + i * .05; let s = popE(P(a0, a0 + .3, t)) * PS; if (t > a1) s *= (1 + .3 * P(a1, a1 + .12, t)) * (1 - P(a1 + .12, a1 + .24, t));
        b.set([pr[0] + loc[0], pr[1] + loc[1], pr[2] + loc[2]], s, 1, .06 * Math.sin(i * 2 + t * 1.5)); });
      sk3.set([R.block[0], R.block[1] + .05, R.block[2] + .6], P(T1, T1 + 1.0, t) * (t > T1 ? 1 : 0), 2.2);
      ryz(sm(P(TS + .2, TS + 3, t))); sparks(t, [-2.5, 2.4, -2.0], 5.0, sm(P(TS + .6, TS + 2.5, t))); });
    Wd.center = [-3, -2];
    Wd.cam = seq([0, cine([C(0, [-2.2, 2.5, -2.0], 14.5, 1.0, -18, 46, -.8), C(4.6, [-2.3, 2.6, -2.2], 13.2, .8, 2, 46, -.6), C(7.9, [-2.4, 2.6, -2.2], 12.6, 1.2, 18, 46, -.6)])],
      [7.9, cine([C(7.9, [-5.6, 1.9, -2.6], 7.6, .5, 30, 44, -.3), C(11, [-5.4, 2.0, -2.6], 7.2, .4, 0, 44, -.3), C(14, [-1.4, 2.2, -2.2], 13.5, 1.2, -14, 46, -.5)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the boys laugh and play ball behind the card
  function answerBg(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd); ry(.8);
    const xs = [-3.4, -1.7, 0, 1.7, 3.4], ids = [1, 3, 2, 4, 5], bl = K.soccer(Wd, .15), per = 1.1;
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
