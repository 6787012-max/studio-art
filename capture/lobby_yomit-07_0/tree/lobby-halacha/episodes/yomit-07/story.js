// yomit-07 story: "Shavuot on Friday - eruv tavshilin" (halacha yomit, R' Fried) - 3D choreography per storyboards_v8.md (A).
// Abba (adult man) + Dudi (12). Bright home kitchen with a wall calendar. Nobody touches a flame: the pot is open with water / closed with steam only,
// no flame is drawn at all; candles are NOT drawn (the Shabbat-candles line is a text badge only).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mesh, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, mkWorld, plainRoom, diningTable, chair, mark3d, popE, lighting, glowAt, glowSprite,
    canvasTex, texPlane, toon, FONT, fitText, arcPt, shock, bill, windowUnit, person } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C0 = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? .0001 : ly];
  const TX = .2, TZ = -1.7, TTOP = .78;                 // kitchen table centre x / z / plate level
  const STX = 3.6, POT0 = [3.42, .96, -4.18];            // stove x, burner centre (pot base)
  const CALX = .3, CALY = 1.95, CALZ = -4.5;            // wall calendar (3 days: Sat | Fri | Thu, right to left reading)
  const CX = { sh: -.7, fr: .3, th: 1.3 };               // calendar column centres
  const SKIN = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
  const ABBA = { beardLen: .8, beard: '#3a2618', skin: SKIN[1], pants: '#1b1d24', coat: '#f3f3ee' };   // white shirt
  const DUDI = 2;

  // ---------------------------------------------------------------- people (kippa found by shape, dark navy, never scaled)
  const findKippa = (Pn) => { let done = false; return () => { if (done || !Pn.figure) return; done = true;
    Pn.figure.group.traverse(m => { if (m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.thetaLength > .7 && m.geometry.parameters.thetaLength < .95) { Pn.kippa = m; m.material = m.material.clone(); m.material.color.set(0x1f2f70); } }); }; };
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(findKippa(Pn)); return Pn; };
  const manK = (Wd, look, fn, seed) => {
    const Pn = person(Wd, Object.assign({ kind: 'man', hat: 'kippa', glasses: false }, look), t => Object.assign({ seed: seed }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(Pn);
    Wd.on(findKippa(Pn)); return Pn;
  };
  const abba = (Wd, fn) => manK(Wd, ABBA, t => Object.assign({ pos: [4.8, 0, -3.1], facing: -.8, smile: .5 }, fn(t)), .5);
  const dudi = (Wd, fn) => boyK(Wd, DUDI, t => Object.assign({ pos: [2.5, 0, -3.2], facing: 0, scale: 1.0, smile: .5, groundY: 0 }, fn(t)));

  // ---------------------------------------------------------------- billboards / tags
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54); };
  const starPath = (c, cx, cy, R, r) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r : R; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } c.closePath(); };
  const drawForTag = drawTag('לשם עירוב', '#fff2b8', '#6a3a00', '#c98a1a');
  const drawMeatTag = drawTag('יש עושים על בשר או דג חשוב', '#eef3fa', '#1d2a5a', '#8a96a8');
  const drawKezayit = drawTag('כזית', '#fff6d6', '#6a3a00', '#d9a63a');
  const drawKebeitza = drawTag('כביצה', '#ffe9a8', '#6a3a00', '#d9a63a');
  const drawForShabbat = drawTag('לשבת', '#dfe9ff', '#1d2a5a', '#5a78c8');
  const drawCandlesBadge = drawTag('גם בשביל נרות שבת', '#fff7de', '#6a3a00', '#e3b25a');
  const drawWholeLoaf = (c, W, H) => {   // "פת שלמה ★ הידור" (right to left: words, star, word)
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff0a8'); g.addColorStop(1, '#f6c640');
    c.fillStyle = g; c.beginPath(); c.roundRect(W * .02, H * .06, W * .96, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = '#b87a10'; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#6a2a00';
    c.font = `800 ${H * .5}px ${FONT}`; c.fillText('פת שלמה', W * .72, H * .54);
    starPath(c, W * .43, H * .5, H * .3, H * .15); c.fillStyle = '#e8a010'; c.fill(); c.lineWidth = H * .04; c.strokeStyle = '#8a4a00'; c.stroke();
    c.fillStyle = '#7a1c1c'; c.font = `800 ${H * .5}px ${FONT}`; c.fillText('הידור', W * .2, H * .54); };

  // ---------------------------------------------------------------- steam puffs (normal blending, soft white-grey)
  function steam(Wd, n) {
    const tex = canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(.5, 'rgba(236,241,250,.6)'); r.addColorStop(1, 'rgba(220,228,242,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); });
    const sp = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: 0 })); s.renderOrder = 7; s.visible = false; Wd.add(s); sp.push(s); }
    return (t, c, k, w) => sp.forEach((s, i) => { const ph = (t * .26 + i / n) % 1; s.visible = k > .01; if (!s.visible) return;
      s.position.set(c[0] + Math.sin(i * 2.3 + t * .8) * .07 * (1 + ph * 2), c[1] + ph * 1.0, c[2] + Math.cos(i * 1.7) * .05); const sc = (w || .4) * (.55 + ph * 1.3); s.scale.set(sc, sc, 1); s.material.opacity = k * .85 * Math.pow(Math.sin(PI * ph), .8); });
  }

  // ---------------------------------------------------------------- props: pot / lid / egg / bowl / challah / platter / lock / arrow / scroll
  function potBody(parent, s, withWater) {
    const inner = new THREE.Group(); inner.scale.setScalar(s); parent.add(inner);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(.3, .27, .3, 36, 1, true), toon(0xa8b0ba, { side: THREE.DoubleSide })); wall.position.y = .15; wall.castShadow = true; inner.add(wall);
    inner.add(cyl(.27, .27, .02, 0x8a929c, { pos: [0, .01, 0], ink: false }));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.3, .02, 8, 36), toon(0xe9edf2)); rim.rotation.x = PI / 2; rim.position.y = .3; inner.add(rim);
    for (const sd of [-1, 1]) inner.add(box(.14, .04, .05, 0x3a3f48, { pos: [sd * .36, .25, 0] }));
    if (withWater) { const w = cyl(.285, .285, .01, 0x72c4f2, { pos: [0, .2, 0], ink: false }); w.material.emissive.set(0x24506e); inner.add(w); }
    return inner;
  }
  function mkPot(Wd, s, withWater) { const g = new THREE.Group(); Wd.add(g); potBody(g, s, withWater); return g; }
  function mkLid(Wd, s) {
    const g = new THREE.Group(), inner = new THREE.Group(); inner.scale.setScalar(s); g.add(inner); Wd.add(g);
    inner.add(cyl(.32, .32, .025, 0xc2cad4, { pos: [0, 0, 0] })); inner.add(ball(.05, 0x3a3f48, { pos: [0, .05, 0] })); inner.add(cyl(.04, .05, .04, 0x3a3f48, { pos: [0, .025, 0], ink: false })); return g;
  }
  function mkClosed(Wd, s) { const g = mkPot(Wd, s, false), lid = mkLid(Wd, s); Wd.scene.remove(lid); lid.position.y = .3 * s + .013 * s; g.add(lid); return g; }
  function mkEgg(Wd, r) {   // cooked egg (tan shell), origin = egg centre
    const g = new THREE.Group(); Wd.add(g); const e = ball(r, 0xedd1a6, { scale: [1, 1.3, 1] }); e.material.emissive.set(0x3a2a14); g.add(e);
    const hl = ball(r * .22, 0xfff4dc, { pos: [-r * .38, r * .55, r * .72], scale: [1, 1.4, .5], ink: false }); g.add(hl); return g;
  }
  function mkBowl(Wd) { const g = new THREE.Group(); const side = new THREE.Mesh(new THREE.CylinderGeometry(.28, .18, .2, 32, 1, true), toon(0x4a8fd0, { side: THREE.DoubleSide })); side.position.y = .1; side.castShadow = true; g.add(side);
    g.add(cyl(.18, .18, .02, 0xe8eef4, { pos: [0, .012, 0], ink: false })); const rm = new THREE.Mesh(new THREE.TorusGeometry(.28, .018, 8, 32), toon(0xffffff)); rm.rotation.x = PI / 2; rm.position.y = .2; g.add(rm); Wd.add(g); return g; }
  function mkChallah(Wd) {   // braided challah, origin = underside centre, long axis = x (about .8 long)
    const g = new THREE.Group(); Wd.add(g);
    g.add(ball(.2, 0xc07a1c, { pos: [0, .07, 0], scale: [2.0, .5, .85], ink: false }));
    const cols = [0xe29a30, 0xd78a26, 0xeaa844];
    for (let s = 0; s < 3; s++) for (let i = 0; i < 9; i++) { const x = -.34 + i * .085, ph = i * 1.15 + s * 2.094, z = .085 * Math.sin(ph), y = .105 + .035 * Math.cos(ph);
      const b = ball(.062, cols[(i + s) % 3], { pos: [x, y, z], scale: [1.4, .78, 1], rot: [0, .5 * Math.cos(ph), 0], inkW: .006 }); g.add(b); }
    for (let k = 0; k < 16; k++) { const a = k * 2.4; g.add(ball(.011, 0xfff2cf, { pos: [Math.cos(a) * .33 * (.4 + .6 * ((k * 5) % 7) / 6), .17 + .015 * (k % 3), Math.sin(a * 1.7) * .1], ink: false })); }
    return g;
  }
  const ER = .12;
  function platter(Wd) {   // white plate with a blue rim + the cooked egg + the challah; set(pos, s, ry, eggX, loafU, glow)
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const plate = new THREE.Group(); inner.add(plate); plate.add(cyl(.72, .58, .045, 0xffffff, { pos: [0, .022, 0] }));
    const rm = new THREE.Mesh(new THREE.TorusGeometry(.66, .022, 8, 48), toon(0x3b6fd0)); rm.rotation.x = PI / 2; rm.position.y = .05; plate.add(rm);
    plate.add(cyl(.52, .52, .012, 0xf3f7fc, { pos: [0, .049, 0], ink: false }));
    const egg = mkEgg(Wd, ER); Wd.scene.remove(egg); inner.add(egg); const loaf = mkChallah(Wd); Wd.scene.remove(loaf); inner.add(loaf);
    const gl = glowSprite(2.2, 2.2, 0); gl.material.color.set(0xffe9a8); gl.position.set(0, .3, -.1); inner.add(gl);
    return { g, inner, plate, egg, loaf, parts: () => [plate, egg, loaf], set(pos, s, ry, eggX, loafU, glow) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.y = ry || 0;
      egg.position.set(eggX, .05 + ER * 1.3, 0); loaf.visible = loafU > .001; const u = clamp(loafU, 0, 1), e = sm(u);
      loaf.position.set(lerp(1.75, .27, e), .05 * sm(P(.55, .9, u)) + .22 * Math.sin(PI * clamp(P(.5, .9, u), 0, 1)) * (u < .95 ? 1 : 0), .0); loaf.rotation.y = (1 - e) * .5;
      gl.material.opacity = glow || 0; } };
  }
  function lockProp(Wd) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const body = box(.22, .17, .07, 0x8a929c, { pos: [0, 0, 0] }); body.material.emissive = new THREE.Color(0x000000); inner.add(body);
    inner.add(ball(.022, 0x2a2f38, { pos: [0, .01, .04], ink: false })); inner.add(box(.014, .05, .01, 0x2a2f38, { pos: [0, -.03, .04], ink: false }));
    const sh = new THREE.Group(); sh.position.set(-.065, .085, 0); inner.add(sh);
    const tor = new THREE.Mesh(new THREE.TorusGeometry(.065, .02, 10, 20, PI), toon(0xd2d9e3)); tor.position.x = .065; tor.castShadow = true; sh.add(tor);
    sh.add(cyl(.02, .02, .07, 0xd2d9e3, { pos: [0, -.035, 0], ink: false })); sh.add(cyl(.02, .02, .05, 0xd2d9e3, { pos: [.13, -.025, 0], ink: false }));
    const gl = glowSprite(1.1, 1.1, 0); gl.material.color.set(0x6dff9a); gl.position.z = -.06; inner.add(gl);
    const grey = new THREE.Color(0x8a929c), green = new THREE.Color(0x2fae55);
    return { g, set(pos, s, open, shake, glow) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = shake || 0;
      sh.rotation.y = open * 2.3; sh.position.y = .085 + .06 * open; body.material.color.copy(grey).lerp(green, open); body.material.emissive.setRGB(0, .12 * open, 0); gl.material.opacity = glow || 0; } };
  }
  const AR = { x0: CX.fr - .02, x1: CX.sh + .02, y0: 2.34, h: .72, z: -4.44 };
  const arcAt = u => [lerp(AR.x0, AR.x1, u), AR.y0 + AR.h * Math.sin(PI * u), AR.z];
  function arrowProp(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g); const N = 30, segs = [];
    for (let i = 0; i < N; i++) { const a = arcAt(i / N), b = arcAt((i + 1) / N), dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      const s = box(len * 1.2, .08, .05, 0x2a3f78, { pos: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, AR.z], rot: [0, 0, Math.atan2(dy, dx)], ink: false }); s.material.emissive.set(0x0d1838); g.add(s); segs.push(s); }
    const e0 = arcAt(.985), e1 = arcAt(1), th = Math.atan2(e1[1] - e0[1], e1[0] - e0[0]);
    const head = cyl(0, .13, .28, 0x2a3f78, { pos: [e1[0] + Math.cos(th) * .05, e1[1] + Math.sin(th) * .05, AR.z], rot: [0, 0, th - PI / 2], ink: false }); head.material.emissive.set(0x0d1838); head.visible = false; g.add(head);
    return { g, set(u) { g.visible = u > .01; segs.forEach((s, i) => { s.visible = (i + 1) / N <= u + 1e-6; }); head.visible = u >= .999; } };
  }
  const drawScroll = (c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff7da'); g.addColorStop(1, '#f6e2a6'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#b8862a'; c.lineWidth = H * .035; c.strokeRect(W * .03, H * .07, W * .94, H * .86);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, 'נוסח העירוב', { maxW: W * .8, maxLines: 1, max: H * .26, min: 20, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#4a2a10'; c.fillText('נוסח העירוב', W / 2, H * .22);
    c.strokeStyle = 'rgba(120,84,36,.55)'; c.lineWidth = H * .028; c.lineCap = 'round';   // scribble lines, no readable words
    for (let r = 0; r < 4; r++) { const y = H * (.42 + r * .13); c.beginPath(); c.moveTo(W * .12, y); for (let x = W * .12; x < W * (r === 3 ? .55 : .88); x += W * .04) c.lineTo(x + W * .02, y + (((x / (W * .04)) | 0) % 2 ? -1 : 1) * H * .018); c.stroke(); } };
  const board = (c, W, H) => {
    c.fillStyle = '#fffaf0'; c.fillRect(0, 0, W, H); c.fillStyle = '#d9463a'; c.fillRect(0, 0, W, H * .13);
    c.fillStyle = '#fff'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(W * (i + .5) / 7, H * .065, H * .022, 0, PI * 2); c.fill(); }
    c.strokeStyle = '#c9b88e'; c.lineWidth = 5; for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(W * k / 3, H * .13); c.lineTo(W * k / 3, H); c.stroke(); }
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#8a5a32'; c.font = `700 ${H * .12}px ${FONT}`;
    ['ש׳', 'ו׳', 'ה׳'].forEach((l, k) => c.fillText(l, W * (k + .5) / 3, H * .9)); };
  const drawShavuot = (c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffe68a'); g.addColorStop(1, '#f0b020'); c.fillStyle = g; c.beginPath(); c.roundRect(W * .03, H * .05, W * .94, H * .9, H * .16); c.fill();
    c.lineWidth = H * .06; c.strokeStyle = '#a86a00'; c.stroke(); c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, 'שבועות', { maxW: W * .84, maxLines: 1, max: H * .46, min: 20, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#6a2a00'; c.fillText('שבועות', W / 2, H * .53); };
  const drawShabbat = (c, W, H) => { c.fillStyle = '#e4edff'; c.beginPath(); c.roundRect(W * .03, H * .05, W * .94, H * .9, H * .16); c.fill();
    c.lineWidth = H * .06; c.strokeStyle = '#3b5aa8'; c.stroke(); c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, 'שבת', { maxW: W * .84, maxLines: 1, max: H * .5, min: 20, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#1d2a5a'; c.fillText('שבת', W / 2, H * .53); };
  const drawErev = (c, W, H) => { c.fillStyle = '#e4f6d8'; c.beginPath(); c.roundRect(W * .03, H * .05, W * .94, H * .9, H * .16); c.fill();
    c.lineWidth = H * .06; c.strokeStyle = '#3f8a3a'; c.stroke(); c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, 'ערב החג', { maxW: W * .84, maxLines: 1, max: H * .42, min: 20, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#1f5a2a'; c.fillText('ערב החג', W / 2, H * .53); };
  const drawFrame = (c, W, H) => { c.lineWidth = W * .035; c.strokeStyle = '#ffcf3a'; c.shadowColor = 'rgba(255,200,40,.9)'; c.shadowBlur = W * .05; c.beginPath(); c.roundRect(W * .04, H * .04, W * .92, H * .92, W * .08); c.stroke(); };

  // ---------------------------------------------------------------- the kitchen
  function wallCard(Wd, w, h, draw, cw) { const m = texPlane(w, h, draw, { cw: cw || 400, ro: 6 }); m.visible = false; m.position.z = CALZ + .015; Wd.add(m);
    return { m, set(x, y, s, ry, a) { m.visible = s > .01 && a !== 0; if (!m.visible) return; m.position.set(x, y, CALZ + .02); m.scale.setScalar(s); m.rotation.y = ry || 0; m.material.opacity = a === undefined ? 1 : a; } }; }
  function kitchen(Wd, o) {
    o = o || {};
    plainRoom(Wd, { HX: 6.2, HZ: 4.6, H: 3.5, beams: false, wall: 0xf8edd2 });
    Wd.add(box(12.2, .9, .7, 0xc9a574, { pos: [0, .45, -4.25] })); Wd.add(box(12.3, .06, .8, 0x6a5a48, { pos: [0, .93, -4.22] }));
    Wd.add(box(12.2, .34, .04, 0xeef2f6, { pos: [0, 1.13, -4.58], ink: false }));
    windowUnit(Wd, -3.6, 1.15, -4.57, 0, 1.5, 1.9);
    Wd.add(box(1.7, .9, .4, 0xb98a58, { pos: [-5.2, 2.55, -4.4] }));
    Wd.add(box(1.0, 2.2, .8, 0xeef2f6, { pos: [5.55, 1.1, -4.1] })); for (const dy of [.6, 1.5]) Wd.add(box(.05, .45, .05, 0x8a929c, { pos: [5.12, dy + .2, -3.68], ink: false }));
    // stove (cold, closed: no flame drawn anywhere)
    Wd.add(box(1.3, .93, .76, 0xe8ecf0, { pos: [STX, .465, -4.2] })); Wd.add(box(1.22, .03, .66, 0x2b2e36, { pos: [STX, .945, -4.2], ink: false }));
    for (const [bx, bz, br] of [[POT0[0], POT0[2], .22], [3.97, -4.38, .13], [3.97, -4.0, .13]]) { const t = new THREE.Mesh(new THREE.TorusGeometry(br, .018, 6, 28), toon(0x555b66)); t.rotation.x = PI / 2; t.position.set(bx, .968, bz); Wd.add(t); }
    Wd.add(box(1.0, .5, .03, 0x4a4f58, { pos: [STX, .4, -3.81] })); Wd.add(box(.8, .26, .02, 0x8fa0b0, { pos: [STX, .42, -3.79], ink: false }));
    for (let i = 0; i < 4; i++) Wd.add(cyl(.035, .035, .05, 0x2a2d34, { pos: [STX - .45 + i * .3, .84, -3.8], rot: [PI / 2, 0, 0], ink: false }));
    Wd.add(box(1.5, .3, .85, 0xd5dae0, { pos: [STX, 2.95, -4.15] })); Wd.add(box(.55, .6, .5, 0xd5dae0, { pos: [STX, 3.35, -4.3] }));
    // eggs bowl on the counter
    const bowl = mkBowl(Wd); bowl.position.set(2.0, .96, -4.15);
    for (const [ex, ez] of [[-.07, .03], [.09, -.02]]) { const e = mkEgg(Wd, .085); e.position.set(2.0 + ex, .96 + .06 + .085 * 1.3 * .6, -4.15 + ez); }
    // wall calendar (table scenes get a plain window there instead, so floating tags stay readable)
    let cards = null; const calObjs = [];
    if (o.table) windowUnit(Wd, CALX, 1.15, -4.57, 0, 1.9, 1.7);
    else {
      calObjs.push(Wd.add(box(3.24, 1.5, .08, 0x8a5a32, { pos: [CALX, CALY, CALZ - .04] })));
      const bd = texPlane(3.0, 1.3, board, { cw: 960, ro: 2, opaque: true, depthWrite: true }); bd.position.set(CALX, CALY, CALZ + .001); calObjs.push(Wd.add(bd));
      calObjs.push(Wd.add(ball(.05, 0xd9a63a, { pos: [CALX - 1.4, CALY + .65, CALZ + .02], ink: false }))); calObjs.push(Wd.add(ball(.05, 0xd9a63a, { pos: [CALX + 1.4, CALY + .65, CALZ + .02], ink: false })));
      cards = { fr: wallCard(Wd, .88, .66, drawShavuot, 440), sh: wallCard(Wd, .88, .66, drawShabbat, 440), th: wallCard(Wd, .88, .66, drawErev, 440) };
    }
    if (o.table) {
      diningTable(Wd, { x: TX, z: TZ, len: 3.6, wid: 1.1, cloth: 0xffffff, food: false });
      Wd.add(box(3.4, .012, .24, 0xd9a63a, { pos: [TX, TTOP - .004, TZ - .42], ink: false }));
    }
    lighting(Wd, () => ({ hemi: 1.15, sun: 1.0, hemiColor: 0xfff1d8, sunColor: 0xfff1dc }));
    return { cards, calObjs };
  }
  const cardsOn = (ki, t) => { if (!ki.cards) return; land(ki.cards.fr, 'fr', t, -3, -2, true); land(ki.cards.sh, 'sh', t, -3, -2, true); land(ki.cards.th, 'th', t, -3, -2, true); };
  const kW = () => mkWorld({ skyTop: 0x9ad0f6, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 40, fogFar: 140, hemi: 1.15, sun: 1.0, sunPos: [-14, 26, 16], shadowExt: 14 });
  const CY = .0, cardPos = k => [CX[k], 1.93];
  const bob = (t, k) => .03 * Math.sin(t * 1.8 + k);
  // a card landing on the calendar: drops from above with an overshoot pop and settles
  const land = (card, k, t, t0, t1, flat) => { const u = P(t0, t1, t), p = popE(u); const [x, y] = cardPos(k); card.set(x, y + (1 - sm(clamp(u * 1.4, 0, 1))) * .9, flat ? 1 : .4 + .6 * p, 0, u > 0 ? 1 : 0); };

  // ---------------------------------------------------------------- 1. HOOK 0-14: the calendar gets "Shavuot" on Friday next to "Shabbat"; Dudi holds the pot lid, looks at the pot, then at the calendar
  function hook(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const pot = mkPot(Wd, 1.4, true), lid = mkLid(Wd, .75), st = steam(Wd, 7), s1 = shock(Wd, 0xffd166), s2 = shock(Wd, 0x9fb8ff);
    pot.position.set(POT0[0], POT0[1], POT0[2]);
    Wd.on(t => { land(ki.cards.fr, 'fr', t, 3.0, 4.0); land(ki.cards.sh, 'sh', t, 4.4, 5.4);
      s1.set([CX.fr, 1.93, CALZ + .2], P(3.8, 4.7, t), 1.2); s2.set([CX.sh, 1.93, CALZ + .2], P(5.2, 6.1, t), 1.2);
      const fa = lerp(.6, -.6, sm(P(6.0, 8.5, t)));
      const lx = 1.92 - .62, lz = -2.5 + .15;
      lid.position.set(lx, 1.08 + .02 * Math.sin(t * 1.6), lz); lid.rotation.set(-1.45, 0, .1 * Math.sin(t * 1.3));
      st(t, [POT0[0], POT0[1] + .45, POT0[2]], .55, .4); });
    dudi(Wd, t => { const u = sm(P(6.0, 8.5, t)); return { pos: [1.92, 0, -2.5], facing: lerp(.6, -.6, u), gesture: 'wide', perform: 0, smile: .35, brow: .5 * sm(P(8, 10, t)), look: lerp(.5, -.5, u), talk: 0 }; });
    Wd.occ = [lid]; Wd.center = [1.3, -3.6]; Wd.qSize = .9; Wd.qPos = [1.5, -3.5];
    Wd.cam = seq([0, cine([C0(0, [1.5, 1.15, -3.3], 4.1, .3, -12, 44), C0(5, [1.5, 1.15, -3.3], 3.8, .3, 6, 44)])],
      [5, cine([C0(5, [1.5, 1.15, -3.3], 3.8, .3, 6, 44), C0(10, [1.55, 1.15, -3.3], 3.7, .3, -8, 44)])],
      [10, cine([C0(10, [1.55, 1.15, -3.3], 3.7, .3, -8, 44), C0(14, [1.55, 1.17, -3.3], 3.9, .35, 4, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: the calendar zooms; an arrow from Friday (holiday) to Shabbat with a small grey lock on it
  function s2(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const ar = arrowProp(Wd), lk = lockProp(Wd), tok = mkClosed(Wd, .55), st = steam(Wd, 4), sk = shock(Wd, 0xff7a6a);
    Wd.on(t => { land(ki.cards.fr, 'fr', t, -3, -2, true); land(ki.cards.sh, 'sh', t, -3, -2, true);
      ar.set(sm(P(1.0, 4.0, t)));
      const pk = arcAt(.5), lp = popE(P(4.2, 5.2, t)); lk.set([pk[0], pk[1] + .02, AR.z + .03], .95 * lp * (1 + .0), 0, (P(8.2, 8.5, t) * (1 - P(8.5, 9.2, t)) + P(12.3, 12.6, t) * (1 - P(12.6, 13.4, t))) * .18 * Math.sin(t * 60), 0);
      // a closed steaming pot token rides the arrow toward Shabbat, is stopped by the lock and bounces back (twice)
      const cyc = (t - 5.8) % 6.2, run = t >= 5.8 && t < 5.8 + 12.4; let u = 0;
      if (run) { if (cyc < 2.4) u = .31 * sm(cyc / 2.4); else if (cyc < 3.2) u = .31 - .06 * Math.sin(PI * (cyc - 2.4) / .8) * .0 - .0; else u = .31 * (1 - sm((cyc - 3.2) / 2.2)) ; }
      const stuck = run && cyc > 2.2 && cyc < 3.0; sk.set([pk[0] - .16, pk[1], AR.z + .1], run && cyc > 2.3 && cyc < 3.0 ? (cyc - 2.3) / .7 : 0, .8);
      const ap = run ? popE(P(0, .5, cyc)) * (1 - sm(P(5.4, 6.0, cyc))) : 0; const q = arcAt(Math.max(.02, u)); tok.visible = ap > .01;
      tok.position.set(q[0], q[1] + .1, AR.z + .12); tok.scale.setScalar(Math.max(.01, ap));
      st(t, [q[0], q[1] + .38, AR.z + .12], ap * .55, .2); });
    Wd.occ = [tok]; Wd.center = [-.2, -4.2];
    Wd.cam = seq([0, cine([C0(0, [-.15, 2.1, -4.4], 3.9, .3, -10, 44), C0(5, [-.15, 2.1, -4.4], 3.4, .3, 8, 44)])],
      [5, cine([C0(5, [-.15, 2.1, -4.4], 3.4, .3, 8, 44), C0(10, [-.2, 2.15, -4.4], 3.3, .3, -8, 44)])],
      [10, cine([C0(10, [-.2, 2.15, -4.4], 3.3, .3, -8, 44), C0(dur, [-.2, 2.15, -4.4], 3.6, .35, 6, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-44: the calendar flips back to Thursday ("erev hachag"); Abba puts a pot on the stove, an egg goes in, a tag "leshem eruv"
  function s3(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const pot = mkPot(Wd, 1.4, true), egg = mkEgg(Wd, .1), tg = bb(Wd, 1.1, .42, drawForTag, 512), st = steam(Wd, 8), spl = shock(Wd, 0xbfe6ff);
    const fr = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.25), new THREE.MeshBasicMaterial({ map: canvasTex(256, 320, drawFrame), transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide })); fr.renderOrder = 8; fr.visible = false; Wd.add(fr);
    const bubbles = []; for (let i = 0; i < 6; i++) { const b = ball(.03, 0xffffff, { ink: false }); Wd.add(b); bubbles.push(b); }
    const HAND = [4.1, .68, -2.7], WATERY = POT0[1] + .2 * 1.4;
    Wd.on(t => { land(ki.cards.fr, 'fr', t, -3, -2, true); land(ki.cards.sh, 'sh', t, -3, -2, true);
      // pointer frame slides Friday -> Thursday, then the Thursday card flips in
      const m = sm(P(1.2, 2.8, t)); fr.visible = t > .6 && t < 4.6; fr.position.set(lerp(CX.fr, CX.th, m), CALY - .1, CALZ + .03); fr.material.opacity = sm(P(.6, 1.2, t)) * (1 - sm(P(3.8, 4.5, t)));
      const fu = P(3.0, 4.2, t); const [hx, hy] = cardPos('th'); ki.cards.th.set(hx, hy, fu > 0 ? .5 + .5 * popE(fu) : 0, (1 - sm(clamp(fu * 1.6, 0, 1))) * PI / 2 * 0 + (1 - sm(clamp(fu * 1.6, 0, 1))) * 1.45, fu > 0 ? 1 : 0);
      // pot: carried in Abba's hands, floats over to the burner
      const u = sm(P(6.2, 8.4, t)); let p = arcPt(HAND, POT0, u, .3); p = [p[0], p[1] + (t > 8.4 ? -.02 * Math.exp(-(t - 8.4) * 4) * Math.sin((t - 8.4) * 20) : 0), p[2]]; pot.position.set(p[0], p[1], p[2]); pot.visible = t > 4.4;
      // egg: out of the bowl, over to the pot, drops into the water
      const eu = P(9.2, 11.0, t); let ep; if (eu < .72) ep = arcPt([2.0, 1.1, -4.15], [3.42, 1.9, -4.18], eu / .72, .5); else ep = arcPt([3.42, 1.9, -4.18], [3.42, WATERY + .06, -4.18], (eu - .72) / .28, 0);
      egg.visible = t > 9.0; egg.position.set(ep[0], ep[1] + (t > 11.0 ? .015 * Math.sin(t * 5) : 0), ep[2]); egg.rotation.z = (1 - eu) * 1.2 * (eu < 1 ? 1 : 0);
      spl.set([3.42, WATERY + .03, -4.1], P(10.9, 11.6, t), .9);
      const boil = sm(P(11.0, 12.5, t)); bubbles.forEach((b, i) => { const a = i * 1.1 + t * .6, r = .1 + .2 * ((i * 5) % 4) / 3, ph = (t * 1.3 + i * .37) % 1; b.visible = boil > .1; b.position.set(POT0[0] + Math.cos(a) * r, WATERY + .02 + .03 * Math.sin(PI * ph), POT0[2] + Math.sin(a) * r * .8); b.scale.setScalar((.5 + .7 * Math.sin(PI * ph)) * boil + .001); });
      tg.set([3.4, 2.2 + bob(t, 1), -3.9], popE(P(11.8, 12.8, t)) * .9, .03 * Math.sin(t * 1.7));
      st(t, [POT0[0], WATERY + .05, POT0[2]], sm(P(8.8, 11.5, t)) * .7, .4); });
    abba(Wd, t => ({ pos: [5.0, 0, -3.1], facing: -.8, hidden: t < 4.4, gesture: t < 9 ? 'offer' : 'explain', perform: 0, smile: .6, talk: t > 11 ? .3 * talkAmt(t, 2) : 0, look: -.3 }));
    Wd.occ = [pot, egg, tg.g]; Wd.center = [3.4, -3.8];
    Wd.cam = seq([0, cine([C0(0, [CALX + .2, 1.9, -4.4], 4.2, .3, -9, 44), C0(4.6, [CALX + .3, 1.9, -4.4], 3.9, .3, 7, 44), C0(7.6, [3.6, 1.65, -3.7], 3.7, .35, -9, 44), C0(12, [3.9, 1.65, -3.7], 3.6, .35, 6, 44), C0(dur, [3.9, 1.7, -3.7], 3.9, .4, -4, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-58: on a white plate a big cooked egg; green check; a smaller tag floats by
  function s4(dur) {
    const Wd = kW(); const ki = kitchen(Wd, { table: true }); const pl = platter(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), tg = bb(Wd, 1.9, .42, drawMeatTag, 900), gl = glowAt(Wd.scene, 2.0, 0x9dffb0, 0);
    Wd.on(t => { cardsOn(ki, t); const a = popE(P(.3, 1.3, t)); pl.set([TX, TTOP, TZ], 1.0 * a, .25 * Math.sin(t * .6) * 0 + .15 * Math.sin(t * .5), 0, 0, .25 + .2 * sm(P(3, 4.5, t)));
      pl.egg.rotation.z = .06 * Math.sin(t * 1.5); pl.egg.position.y += .012 * Math.sin(t * 2.2);
      ck.set([TX - .1, 1.7 + .05 * Math.sin(t * 3), TZ], popE(P(3.0, 4.0, t)) * .55, .05 * Math.sin(t * 3)); sk.set([TX - .1, 1.7, TZ], P(3.0, 3.9, t), 1.0);
      gl.position.set(TX, TTOP + .35, TZ); gl.material.opacity = .4 * sm(P(3, 4.2, t));
      const u = P(5.8, 12.5, t); tg.set([lerp(.95, .8, sm(u)), 1.85 + .04 * Math.sin(t * 2), TZ + .1], .6 * popE(P(5.6, 6.6, t)) * (1 - sm(P(12.2, 13.2, t))), .03 * Math.sin(t * 1.6)); });
    abba(Wd, t => ({ pos: [-.95, 0, -2.7], facing: .55, gesture: t < 9 ? 'explain' : 'rest', perform: 0, smile: .6, talk: t > 1 && t < 9 ? .3 * talkAmt(t, 2) : 0, look: .3 }));
    dudi(Wd, t => ({ pos: [1.55, 0, -2.7], facing: -.55, gesture: null, perform: .3, smile: .5 + .4 * sm(P(3.5, 5, t)), look: -.3 }));
    Wd.occ = [pl.plate, pl.egg, pl.loaf, ck.g, tg.g]; Wd.center = [TX, TZ];
    Wd.cam = seq([0, cine([C0(0, [TX, 1.1, TZ], 3.4, .8, -12, 44), C0(5, [TX, 1.1, TZ], 3.1, .75, 8, 44)])],
      [5, cine([C0(5, [TX, 1.1, TZ], 3.1, .75, 8, 44), C0(10, [TX, 1.1, TZ], 3.15, .75, -8, 44)])],
      [10, cine([C0(10, [TX, 1.1, TZ], 3.15, .75, -8, 44), C0(dur, [TX, 1.12, TZ], 3.4, .8, 6, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-74: a loaf of challah slides in next to the egg; three tags rise one by one
  function s5(dur) {
    const Wd = kW(); const ki = kitchen(Wd, { table: true }); const pl = platter(Wd), t1 = bb(Wd, 1.0, .42, drawKezayit, 480), t2 = bb(Wd, 1.0, .42, drawKebeitza, 480), t3 = bb(Wd, 2.0, .46, drawWholeLoaf, 900), sk = shock(Wd, 0xffd166);
    const TY = [1.4, 1.85, 2.4], TS = [.62, .72, .78];
    Wd.on(t => { cardsOn(ki, t); const lu = P(1.0, 3.6, t), eggX = lerp(0, -.4, sm(P(1.9, 3.6, t)));
      pl.set([TX, TTOP, TZ], 1.0, 0, eggX, lu, .3); pl.egg.position.y += .012 * Math.sin(t * 2.2);
      sk.set([TX + .3, TTOP + .2, TZ], P(3.4, 4.1, t), 1.2);
      [[t1, 4.2], [t2, 6.6], [t3, 9.0]].forEach(([tg, ts], i) => { const k = sm(P(ts, ts + 1.1, t)), a = popE(P(ts, ts + .9, t)); tg.set([TX + .1, lerp(TTOP + .9, TY[i], k) + .03 * Math.sin(t * 2 + i), TZ], TS[i] * a, .02 * Math.sin(t * 1.7 + i)); }); });
    abba(Wd, t => ({ pos: [-1.5, 0, -2.7], facing: .55, gesture: t > 4 && t < 13 ? 'explain' : null, perform: t > 4 && t < 13 ? 0 : .3, smile: .6, talk: t > 4 && t < 12 ? .3 * talkAmt(t, 2) : 0, look: .3 }));
    dudi(Wd, t => ({ pos: [2.05, 0, -2.7], facing: -.55, gesture: null, perform: .3, smile: .6, look: -.3 }));
    Wd.occ = [pl.plate, pl.egg, pl.loaf, t1.g, t2.g, t3.g]; Wd.center = [TX, TZ];
    Wd.cam = seq([0, cine([C0(0, [TX, 1.3, TZ], 4.0, .9, 10, 44), C0(6, [TX, 1.3, TZ], 3.7, .8, -6, 44)])],
      [6, cine([C0(6, [TX, 1.4, TZ], 3.7, .8, -6, 44), C0(11, [TX, 1.45, TZ], 3.9, .8, 8, 44)])],
      [11, cine([C0(11, [TX, 1.45, TZ], 3.9, .8, 8, 44), C0(dur, [TX, 1.45, TZ], 4.1, .85, -6, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 74-88: Abba holds the plate with egg + loaf; a glowing scroll "nusach ha'eruv" opens beside him; Dudi listens
  function s6(dur) {
    const Wd = kW(); const ki = kitchen(Wd, { table: true }); const pl = platter(Wd), gl = glowAt(Wd.scene, 3.0, 0xffe08a, 0);
    const scrollG = new THREE.Group(), sheet = texPlane(1.5, 0.95, drawScroll, { cw: 768, ro: 8 }), sin_ = new THREE.Group(); sin_.add(sheet); scrollG.add(sin_); scrollG.visible = false; Wd.add(scrollG); bill(Wd, scrollG);
    const rolls = [-1, 1].map(() => { const r = cyl(.055, .055, 1.0, 0x8a5a32, {}); r.rotation.x = 0; r.rotation.z = PI / 2 * 0; scrollG.add(r); return r; });
    const AX = -.9, HANDP = [AX + .32, .78, -2.1];
    Wd.on(t => { cardsOn(ki, t); const lift = sm(P(.8, 2.6, t)); const p = arcPt([TX, TTOP, TZ], HANDP, lift, 0);
      pl.set([p[0], p[1] + .018 * Math.sin(t * 1.7) * lift, p[2]], lerp(1.0, .52, lift), .1 * Math.sin(t * .6) * lift, -.4, 1, .35);
      const o = popE(P(3.0, 4.2, t)), op = sm(P(3.6, 5.6, t)), w = lerp(.08, 1, op);
      scrollG.visible = o > .01; scrollG.position.set(.6, 1.7 + .04 * Math.sin(t * 1.5), -2.3); sheet.scale.set(w, 1, 1); sin_.scale.setScalar(Math.max(o, .001));
      rolls.forEach((r, k) => { r.position.set((k ? 1 : -1) * (.75 * w + .02) * Math.max(o, .001), 0, 0); r.scale.setScalar(Math.max(o, .001)); r.scale.y = .95 * Math.max(o, .001); });
      gl.position.set(.6, 1.7, -2.5); gl.material.opacity = (.32 + .08 * Math.sin(t * 2.4)) * sm(P(3.4, 5.4, t)); });
    abba(Wd, t => ({ pos: [AX, 0, -2.75], facing: .35, gesture: 'offer', perform: 0, smile: .6, talk: t > 4.5 && t < 13 ? .35 * talkAmt(t, 2) : 0, look: .35 }));
    dudi(Wd, t => ({ pos: [2.15, 0, -2.7], facing: -.6, gesture: 'lean', perform: 0, smile: .5 + .3 * sm(P(8, 11, t)), look: -.4 }));
    Wd.occ = [pl.plate, pl.egg, pl.loaf, scrollG]; Wd.center = [.6, -2.3];
    Wd.cam = seq([0, cine([C0(0, [.55, 1.3, -2.3], 4.2, .7, -10, 44), C0(6, [.55, 1.35, -2.3], 3.7, .6, 8, 44)])],
      [6, cine([C0(6, [.55, 1.35, -2.3], 3.7, .6, 8, 44), C0(11, [.6, 1.4, -2.3], 3.8, .6, -8, 44)])],
      [11, cine([C0(11, [.6, 1.4, -2.3], 3.8, .6, -8, 44), C0(dur, [.55, 1.4, -2.3], 4.1, .65, 6, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 88-100: Friday: the grey lock opens and turns green; the pot steams, tag "for Shabbat"; Dudi smiles; text-only badge
  function s7(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const ar = arrowProp(Wd), lk = lockProp(Wd), tok = mkClosed(Wd, .55), pot = mkPot(Wd, 1.4, true), lid = mkLid(Wd, 1.4), st = steam(Wd, 9), st2 = steam(Wd, 4), tg = bb(Wd, .9, .42, drawForShabbat, 400), bg = bb(Wd, 2.0, .46, drawCandlesBadge, 800), sk = shock(Wd, 0x6dff9a);
    pot.position.set(POT0[0], POT0[1], POT0[2]);
    Wd.on(t => { const hide = t > 5.9; ki.calObjs.forEach(o => { o.visible = !hide; }); if (hide) { ['fr', 'sh', 'th'].forEach(k => ki.cards[k].set(0, 0, 0)); } else cardsOn(ki, t);
      ar.set(hide ? 0 : 1); const pk = arcAt(.5), open = sm(P(1.2, 2.6, t)); lk.set([pk[0], pk[1] + .02, AR.z + .03], hide ? 0 : .95, open, 0, .45 * open); sk.set([pk[0], pk[1], AR.z + .1], P(2.4, 3.3, t), .7);
      const u = sm(P(3.0, 5.2, t)), q = arcAt(lerp(.02, .98, u)); tok.visible = t > 2.9 && t < 5.5; const ta = popE(P(2.9, 3.4, t)) * (1 - sm(P(5.0, 5.5, t)));
      tok.position.set(q[0], q[1] + .1, AR.z + .12); tok.scale.setScalar(Math.max(.01, ta));
      st2(t, [q[0], q[1] + .38, AR.z + .12], ta * .5, .2);
      lid.position.set(POT0[0], POT0[1] + .3 * 1.4 + .03, POT0[2]); lid.rotation.z = .03 * Math.sin(t * 7) * sm(P(5, 7, t));
      st(t, [POT0[0], lid.position.y + .05, POT0[2]], sm(P(5.4, 7.2, t)) * .85, .45);
      tg.set([POT0[0] + .05, 2.0 + bob(t, 1), -3.9], popE(P(7.2, 8.2, t)) * .95, .03 * Math.sin(t * 1.7)); bg.set([4.0, 2.4 + bob(t, 2), -3.6], popE(P(8.8, 9.8, t)) * .8, .0); });
    dudi(Wd, t => ({ pos: [2.7, 0, -2.9], facing: .55, gesture: t > 8 ? 'thumb' : null, perform: t > 8 ? 0 : .3, smile: .6 + .4 * sm(P(5.5, 7.5, t)), look: .3 }));
    Wd.occ = [tok, tg.g, bg.g]; Wd.center = [1.6, -3.8];
    Wd.cam = seq([0, cine([C0(0, [CALX - .3, 2.3, -4.4], 3.9, .3, -9, 44), C0(3.9, [CALX - .4, 2.3, -4.4], 3.6, .3, 8, 44), C0(5.7, [3.6, 1.2, -3.4], 3.4, .3, -4, 44), C0(dur, [3.6, 1.22, -3.4], 3.5, .3, 3, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the festive plate with egg + challah glowing on the table, Abba seated and Dudi beside, smiling
  function answerBg(dur) {
    const Wd = kW(); const ki = kitchen(Wd, { table: true }); const pl = platter(Wd), gl = glowAt(Wd.scene, 2.6, 0xffe08a, .3), SZ = TZ - .82;
    chair(Wd, -.8, SZ - .13, 0, .46); gl.position.set(0, 1.0, TZ + .05);
    Wd.on(t => { cardsOn(ki, t); pl.set([0, TTOP, TZ + .3], .7, .1 * Math.sin(t * .6), -.4, 1, .35 + .12 * Math.sin(t * 2.4)); });
    manK(Wd, ABBA, t => Object.assign({ pos: [-.8, .2, SZ], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2), sit: true, groundY: 0 }), .5);
    boyK(Wd, DUDI, t => ({ pos: [.95, 0, SZ - .05], facing: 0, smile: 1, perform: .5, talk: .4 * talkAmt(t, 3), groundY: 0 }));
    Wd.occ = [pl.plate, pl.egg, pl.loaf]; Wd.center = [0, SZ]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
