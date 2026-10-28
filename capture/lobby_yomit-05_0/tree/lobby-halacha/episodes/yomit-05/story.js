// yomit-05 story: "Tefillat HaShla on Shabbat" (halacha yomit, R' Fried) - 3D choreography per storyboards_v6.md (A).
// Abba (adult man, seated) + his son Moishy (12, seated) at a bright Shabbat day table. Nobody touches a flame; icons, bubbles, booklet float by themselves.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, plainRoom, diningTable, chair, mark3d, popE, lighting, glowAt, glowSprite,
    texPlane, toon, FONT, fitText, arcPt, shock, bill, booksTex, windowUnit, person, clock } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C0 = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? .0001 : ly];
  const TT = .72, TZ = -1.7, SZ = TZ - .82;          // table top / table z / seated line
  const AX = -1.25, MX = 1.25, RBM = .2, RB = .17;       // Abba x, Moishy x, seat raise (man / boy)
  const SIT = { sit: true, groundY: 0 };
  const SKIN = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
  const MOISHY = 4, MS = 1.0;
  const ABBA = { beardLen: .8, beard: '#3a2618', skin: SKIN[1], pants: '#1b1d24', coat: '#23252e' };

  // ---------------------------------------------------------------- people
  const darkKippa = (P_) => { let done = false; return () => { const k = P_.kippa; if (k && !done) { done = true; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }; };
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(darkKippa(Pn)); return Pn; };
  const manK = (Wd, look, fn, seed) => {
    const Pn = person(Wd, Object.assign({ kind: 'man', hat: 'kippa', glasses: false }, look), t => Object.assign({ seed: seed }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(Pn);
    let fixed = false; Wd.on(() => { if (fixed || !Pn.figure) return; fixed = true; Pn.figure.group.traverse(m => { if (m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.thetaLength === .8) { m.scale.multiplyScalar(1.22); m.scale.y *= .94; m.rotation.x = 0; Pn.kippa = m; } }); });
    Wd.on(darkKippa(Pn)); return Pn;
  };
  const abba = (Wd, fn) => manK(Wd, ABBA, t => Object.assign({ pos: [AX, RBM, SZ], facing: .2, smile: .5 }, SIT, fn(t)), .5);
  const moishy = (Wd, fn) => boyK(Wd, MOISHY, t => Object.assign({ pos: [MX, RB, SZ], facing: -.3, scale: MS, smile: .5 }, SIT, fn(t)));

  // ---------------------------------------------------------------- billboards
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .84, maxLines: 1, max: H * .64, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54); };
  const drawBanner = drawTag('שבת', '#eceff4', '#4a5568', '#9aa4b4');
  const drawShabbatGold = drawTag('שבת', '#fff2b8', '#7a1c1c', '#d9a63a');
  const drawZmana = drawTag('זמנה', '#fff2b8', '#7a1c1c', '#d9a63a');
  // half-lit check with a small "?" badge
  const drawHalfCheck = (c, W, H) => {
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = '#b9c2cc'; c.lineWidth = W * .15; c.beginPath(); c.moveTo(W * .2, H * .54); c.lineTo(W * .42, H * .76); c.lineTo(W * .8, H * .26); c.stroke();
    c.save(); c.beginPath(); c.rect(0, 0, W * .5, H); c.clip();
    c.strokeStyle = '#3fcf6a'; c.lineWidth = W * .15; c.beginPath(); c.moveTo(W * .2, H * .54); c.lineTo(W * .42, H * .76); c.lineTo(W * .8, H * .26); c.stroke(); c.restore();
    c.fillStyle = '#ffb84a'; c.beginPath(); c.arc(W * .82, H * .18, W * .15, 0, PI * 2); c.fill(); c.lineWidth = W * .025; c.strokeStyle = '#8a5a10'; c.stroke();
    c.fillStyle = '#4a2a00'; c.font = `800 ${W * .22}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', W * .82, H * .2); };

  // ---------------------------------------------------------------- room
  function room(Wd, calX, cal, seats) {
    const R = plainRoom(Wd, { HX: 6.2, HZ: 4.6, H: 3.5, beams: false, wall: 0xf8edd2 });
    windowUnit(Wd, -3.6, 1.0, -4.57, 0, 1.6, 2.1); windowUnit(Wd, 3.6, 1.0, -4.57, 0, 1.6, 2.1);
    for (const x of [-3.6, 3.6]) for (const dx of [-1, 1]) Wd.add(box(.5, 2.4, .14, 0xe3b25a, { pos: [x + dx * 1.1, 1.9, -4.5], ink: false }));
    Wd.add(box(1.7, 2.7, .5, 0x7a4a2a, { pos: [-5.4, 1.35, -4.3] })); const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.5), toon(0xffffff, { map: booksTex(5) })); sh.position.set(-5.4, 1.35, -4.04); Wd.add(sh);
    diningTable(Wd, { x: 0, z: TZ, len: 3.4, wid: 1.1, cloth: 0xffffff, food: false });
    Wd.add(box(.55, .1, .3, 0x244a86, { pos: [-.85, TT + .1, TZ + .3] })); Wd.add(ball(.15, 0xe3b25a, { pos: [-.85, TT + .15, TZ + .3], scale: [1.5, .5, 1], ink: false }));
    Wd.add(cyl(.05, .035, .16, 0xd8dde6, { pos: [.9, TT + .1, TZ + .3] })); Wd.add(cyl(.09, .09, .02, 0xd8dde6, { pos: [.9, TT + .03, TZ + .3], ink: false }));
    (seats || [AX, MX]).forEach(x => chair(Wd, x, SZ - .13, 0, .46));
    // siddur on a little stand (centre of the table)
    Wd.add(box(.46, .05, .34, 0x6a4326, { pos: [0, TT + .06, TZ + .12] })); const sd = box(.4, .045, .3, 0x7a1c1c, { pos: [0, TT + .13, TZ + .12], rot: [-.5, 0, 0] }); Wd.add(sd);
    Wd.add(box(.36, .02, .26, 0xfff6e4, { pos: [0, TT + .147, TZ + .115], rot: [-.5, 0, 0], ink: false }));
    if (cal !== false) wallCalendar(Wd, calX === undefined ? 3.4 : calX);
    lighting(Wd, () => ({ hemi: 1.15, sun: 1.0, hemiColor: 0xfff1d8, sunColor: 0xfff1dc }));
    return R;
  }
  const kW = () => mkWorld({ skyTop: 0x9ad0f6, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 40, fogFar: 140, hemi: 1.15, sun: 1.0, sunPos: [-14, 26, 16], shadowExt: 14 });

  // wall calendar: page A (month) can flip up over the top to reveal page B (erev rosh chodesh sivan). cal.flip(k) k 0..1
  function wallCalendar(Wd, x) {
    const w = 1.5, h = 1.9, y0 = 1.2, z = -4.52, Wd_ = Wd;
    const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g);
    g.add(box(w + .14, h + .14, .05, 0x7a4a2a, { pos: [0, y0 + h / 2, -.03] }));
    const pageB = texPlane(w, h, (c, W, H) => { c.fillStyle = '#fffaf0'; c.fillRect(0, 0, W, H); c.fillStyle = '#c4161c'; c.fillRect(0, 0, W, H * .2);
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.font = `800 ${H * .13}px ${FONT}`; c.fillText('סיוון', W / 2, H * .105);
      c.fillStyle = '#1d2a5a'; const f = fitText(c, 'ערב ראש חודש', { maxW: W * .86, maxLines: 1, max: H * .13, min: 30, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillText('ערב ראש חודש', W / 2, H * .44); c.fillText('סיון', W / 2, H * .6);
      c.strokeStyle = '#d9a63a'; c.lineWidth = W * .02; c.strokeRect(W * .06, H * .27, W * .88, H * .46); }, { cw: 512, ro: 2, opaque: true });
    pageB.position.set(0, y0 + h / 2, .0); g.add(pageB);
    const hinge = new THREE.Group(); hinge.position.set(0, y0 + h, .03); g.add(hinge);
    const pageA = texPlane(w, h, (c, W, H) => { c.fillStyle = '#fffaf0'; c.fillRect(0, 0, W, H); c.fillStyle = '#2f6fb0'; c.fillRect(0, 0, W, H * .2);
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.font = `800 ${H * .13}px ${FONT}`; c.fillText('אייר', W / 2, H * .105);
      c.strokeStyle = '#b8c0cc'; c.lineWidth = 3; for (let i = 0; i <= 7; i++) { c.beginPath(); c.moveTo(W * (.06 + i * .88 / 7), H * .26); c.lineTo(W * (.06 + i * .88 / 7), H * .94); c.stroke(); }
      for (let j = 0; j <= 5; j++) { c.beginPath(); c.moveTo(W * .06, H * (.26 + j * .68 / 5)); c.lineTo(W * .94, H * (.26 + j * .68 / 5)); c.stroke(); }
      c.fillStyle = '#ffe9a8'; c.fillRect(W * (.06 + 4 * .88 / 7), H * (.26 + 3 * .68 / 5), W * .88 / 7, H * .68 / 5); }, { cw: 512, ro: 3, opaque: true });
    pageA.position.set(0, -h / 2, .0); hinge.add(pageA);
    const cal = { flip(k) { hinge.rotation.x = -PI * k; pageA.visible = k < .8; hinge.visible = pageA.visible; } };
    Wd.cal = cal; return cal;
  }

  // ---------------------------------------------------------------- props
  function booklet(Wd) {   // small booklet "Tefillat HaShla"; faces +z. set(pos, s, rotY, glow)
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(box(.3, .4, .035, 0x1d2a5a, { pos: [0, 0, 0] })); inner.add(box(.28, .38, .02, 0xfff6e4, { pos: [.012, 0, -.004], ink: false }));
    const cover = texPlane(.27, .37, (c, W, H) => { c.fillStyle = '#1d2f6a'; c.fillRect(0, 0, W, H); c.strokeStyle = '#e3b25a'; c.lineWidth = W * .035; c.strokeRect(W * .07, H * .05, W * .86, H * .9);
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffe9a8'; c.font = `800 ${H * .17}px ${FONT}`; c.fillText('תפילת', W / 2, H * .36); c.fillText('השל״ה', W / 2, H * .6);
      c.fillStyle = '#e3b25a'; c.fillRect(W * .3, H * .76, W * .4, H * .02); }, { cw: 256, ro: 4 });
    cover.position.z = .0215; inner.add(cover);
    const gl = glowSprite(1.4, 1.4, 0); gl.material.color.set(0xffe08a); gl.position.z = -.12; inner.add(gl);
    return { g, set(pos, s, ry, glow, rz) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.y = ry || 0; inner.rotation.z = rz || 0; gl.material.opacity = glow || 0; gl.scale.set(1.4 * s + .2, 1.4 * s + .2, 1); } };
  }
  // request / spiritual icon bubbles (billboard). kind: coin | house | med | sefer | heart
  function iconBub(Wd, kind, w) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const draw = (c, W, H) => {
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath(); c.ellipse(W / 2, H * .45, W * .46, H * .42, 0, 0, PI * 2); c.moveTo(W * .3, H * .8); c.lineTo(W * .2, H * .98); c.lineTo(W * .46, H * .86); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = W * .025; c.strokeStyle = '#1c2745'; c.stroke();
      const cx = W / 2, cy = H * .45, s = W * .3;
      if (kind === 'coin') { c.fillStyle = '#ffcf3a'; c.beginPath(); c.arc(cx, cy, s * .85, 0, PI * 2); c.fill(); c.lineWidth = s * .12; c.strokeStyle = '#a67a10'; c.stroke(); c.lineWidth = s * .07; c.beginPath(); c.arc(cx, cy, s * .6, 0, PI * 2); c.stroke(); c.fillStyle = '#a67a10'; c.fillRect(cx - s * .08, cy - s * .38, s * .16, s * .76); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(cx - s * .35, cy - s * .4, s * .15, s * .08, -.6, 0, PI * 2); c.fill(); }
      else if (kind === 'house') { c.fillStyle = '#f3d9a4'; c.fillRect(cx - s * .7, cy - s * .1, s * 1.4, s * .95); c.lineWidth = s * .08; c.strokeStyle = '#6a4326'; c.strokeRect(cx - s * .7, cy - s * .1, s * 1.4, s * .95); c.fillStyle = '#c4452a'; c.beginPath(); c.moveTo(cx - s * .9, cy - s * .08); c.lineTo(cx, cy - s * .95); c.lineTo(cx + s * .9, cy - s * .08); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#6a4326'; c.fillRect(cx - s * .17, cy + s * .25, s * .34, s * .6); c.fillStyle = '#9ad0f6'; c.fillRect(cx + s * .3, cy + s * .1, s * .27, s * .27); c.fillRect(cx - s * .57, cy + s * .1, s * .27, s * .27); }
      else if (kind === 'med') { c.fillStyle = '#b5702a'; c.beginPath(); c.roundRect(cx - s * .5, cy - s * .35, s, s * 1.15, s * .18); c.fill(); c.lineWidth = s * .08; c.strokeStyle = '#6a3a10'; c.stroke(); c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(cx - s * .6, cy - s * .8, s * 1.2, s * .5, s * .12); c.fill(); c.stroke(); c.fillStyle = '#fffaf0'; c.fillRect(cx - s * .38, cy - s * .12, s * .76, s * .62); c.fillStyle = '#d82a2a'; c.fillRect(cx - s * .08, cy - .0 * s, s * .16, s * .45); c.fillRect(cx - s * .22, cy + s * .14, s * .44, s * .16); }
      else if (kind === 'sefer') { c.fillStyle = '#8a1c1c'; c.beginPath(); c.roundRect(cx - s * .6, cy - s * .85, s * 1.2, s * 1.7, s * .1); c.fill(); c.lineWidth = s * .08; c.strokeStyle = '#4a0c0c'; c.stroke(); c.fillStyle = '#fff6e4'; c.fillRect(cx - s * .5, cy + s * .62, s * 1.0, s * .13); c.strokeStyle = '#e3b25a'; c.lineWidth = s * .09; c.strokeRect(cx - s * .42, cy - s * .7, s * .84, s * 1.2); c.fillStyle = '#e3b25a'; c.fillRect(cx - s * .2, cy - s * .35, s * .4, s * .09); c.fillRect(cx - s * .28, cy - s * .12, s * .56, s * .09); c.fillRect(cx - s * .2, cy + s * .11, s * .4, s * .09); }
      else { const gr = c.createRadialGradient(cx, cy, 0, cx, cy, s * 1.3); gr.addColorStop(0, '#fff0a0'); gr.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = gr; c.beginPath(); c.arc(cx, cy, s * 1.3, 0, PI * 2); c.fill();
        c.fillStyle = '#ff5a7a'; c.beginPath(); c.moveTo(cx, cy + s * .8); c.bezierCurveTo(cx - s * 1.3, cy - s * .1, cx - s * .6, cy - s * .95, cx, cy - s * .35); c.bezierCurveTo(cx + s * .6, cy - s * .95, cx + s * 1.3, cy - s * .1, cx, cy + s * .8); c.fill(); c.lineWidth = s * .08; c.strokeStyle = '#a0203a'; c.stroke();
        c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(cx - s * .45, cy - s * .25, s * .2, s * .12, -.6, 0, PI * 2); c.fill(); }
    };
    const face_ = texPlane(w, w, draw, { cw: 384, ro: 8 }); inner.add(face_);
    const gl = glowSprite(w * 1.9, w * 1.9, 0); gl.material.color.set(kind === 'heart' || kind === 'sefer' ? 0xffd27a : 0xcfd6e2); gl.position.z = -.05; inner.add(gl); bill(Wd, g);
    const white = new THREE.Color(0xffffff), grey = new THREE.Color(0x8e929c), col = new THREE.Color();
    return { g, set(pos, s, a, greyK, rz, glow) { const on = s > .01 && (a === undefined || a > .01); g.visible = on; if (!on) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0;
      col.copy(white).lerp(grey, greyK || 0); face_.material.color.copy(col); face_.material.opacity = a === undefined ? 1 : a; gl.material.opacity = (glow || 0) * (a === undefined ? 1 : a); } };
  }
  // thought cloud above Abba's head; set(pos, s, light 0..1, t)
  function thoughtCloud(Wd) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const puffs = [[0, 0, .36], [-.42, -.05, .29], [.44, -.03, .3], [-.17, .22, .32], [.2, .22, .3], [0, -.16, .32]].map(p => { const b = ball(p[2], 0xdfe4ee, { pos: [p[0], p[1], 0], inkW: .008 }); b.material = b.material.clone(); inner.add(b); return b; });
    const t1 = ball(.1, 0xdfe4ee, { pos: [-.62, -.5, 0], inkW: .006 }), t2 = ball(.065, 0xdfe4ee, { pos: [-.8, -.75, 0], inkW: .006 }); inner.add(t1); inner.add(t2);
    const gl = glowSprite(2.4, 1.9, 0); gl.material.color.set(0xffe08a); gl.position.z = .25; inner.add(gl);
    const sp = [0, 1, 2, 3, 4, 5].map(() => { const s = glowSprite(.2, .2, 0); s.material.color.set(0xfff2b8); inner.add(s); return s; });
    const grey = new THREE.Color(0xdfe4ee), warm = new THREE.Color(0xfff4c8), emi = new THREE.Color(0xffd978), col = new THREE.Color();
    return { g, set(pos, s, light, t) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); col.copy(grey).lerp(warm, light);
      puffs.forEach(p => { p.material.color.copy(col); if (p.material.emissive) p.material.emissive.copy(emi).multiplyScalar(light * .5); });
      gl.material.opacity = .65 * light; sp.forEach((q, i) => { const a = t * 1.2 + i * 1.05; q.position.set(Math.cos(a) * .42 * (.5 + .5 * ((i * 5) % 3) / 2), Math.sin(a * 1.3) * .22 + .05, .3); q.material.opacity = light * (.4 + .5 * Math.sin(t * 3 + i * 2) ** 2); }); } };
  }
  const sparks = (Wd, n, center, rad, color, size) => { const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(size || .14, size || .14, 0); s.material.color.set(color || 0xffe9a8); Wd.add(s); sp.push(s); }
    return (t, k) => sp.forEach((s, i) => { const a = i * 2.4 + t * (.5 + (i % 3) * .2); s.position.set(center[0] + Math.cos(a) * rad * (.6 + .4 * ((i * 7) % 5) / 4), center[1] + Math.sin(a * 1.3) * rad * .35 + ((i % 4) - 1.5) * .08, center[2] + Math.sin(a) * rad * .4); s.material.opacity = (k === undefined ? 1 : k) * (.3 + .45 * Math.sin(t * 2.2 + i * 1.7) ** 2); }); };
  const bob = (t, k) => .04 * Math.sin(t * 1.8 + k);
  const STAND = [0, TT + .3, TZ + .12];   // bubbles rise from the siddur

  // request bubbles rising from the siddur, banner pushing them down; shared by scenes 2 and 3
  function bubbleScene(Wd, kinds, bx, by, bs, tStart, tBan, dur, banner) {
    const bubs = kinds.map(k => iconBub(Wd, k, bs)), ban = bb(Wd, 1.0, .42, drawBanner, 512), sp = sparks(Wd, 8, [0, 1.5, TZ], 1.2, 0xffe9a8, .12);
    const arrs = bubs.map((_, i) => tStart + 1.1 * i);
    Wd.on(t => { const push = sm(P(tBan + 1.4, tBan + 5.2, t)), by0 = lerp(3.4, 2.5, sm(P(tBan, tBan + 2.0, t))) - 0.55 * push;
      bubs.forEach((b, i) => { const u = sm(P(arrs[i], arrs[i] + 1.8, t)), p = arcPt([STAND[0], STAND[1], STAND[2]], [bx[i], by[i] + .05 * Math.sin(t * 1.5 + i * 2), TZ], u, .0);
        const pop = popE(P(arrs[i], arrs[i] + .9, t)), fade = 1 - sm(P(tBan + 2.2 + .3 * i, tBan + 4.6, t)), sink = .35 * push;
        b.set([p[0], p[1] - sink, p[2]], bs > 0 ? pop : 0, fade, sm(P(tBan + 1.4, tBan + 3.4, t)) * .8, .06 * Math.sin(t * 1.7 + i * 2), banner ? .5 : .6); });
      ban.set([0, by0 + bob(t, 1), TZ - .15], 1.3 * popE(P(tBan - .3, tBan + .6, t)), .02 * Math.sin(t * 1.4), 1); sp(t, sm(P(1, 3, t))); });
    Wd.occ = bubs.map(b => b.g).concat([ban.g]);
    return { bubs, ban };
  }

  const HOOKCAM = null;

  // ---------------------------------------------------------------- 1. HOOK 0-14
  function hook(dur) {
    const Wd = kW(); room(Wd); const bk = booklet(Wd), sp = sparks(Wd, 10, [0, 1.6, TZ], 1.5, 0xffe9a8, .13);
    Wd.on(t => { sp(t, sm(P(.5, 2, t))); bk.set([AX + .85, .92 + bob(t, 0) * 1.5, SZ + .9], 1.5 * popE(P(.3, 1.2, t)), .35 * Math.sin(t * .8) - .15, .45 + .15 * Math.sin(t * 2.4), .05 * Math.sin(t * 1.3)); });
    abba(Wd, t => ({ facing: .25, gesture: t > 1.2 && t < 8 ? 'offer' : null, perform: t > 8 ? .4 : 0, smile: .5, talk: t > 3 && t < 6 ? .25 * talkAmt(t, 2) : 0, look: .2 }));
    moishy(Wd, t => ({ facing: -.4, gesture: t > 6 ? 'think' : null, perform: t > 6 ? 0 : .3, brow: .5, smile: .1, look: -.3 }));
    Wd.occ = [bk.g]; Wd.center = [0, SZ]; Wd.qSize = 1.2; Wd.qPos = [-1.35, -1.7];
    Wd.cam = seq([0, cine([C0(0, [-.2, 1.17, -2.2], 3.9, .7, -12, 44), C0(5, [-.2, 1.17, -2.2], 3.4, .6, 8, 44)])],
      [5, cine([C0(5, [-.2, 1.17, -2.2], 3.4, .6, 8, 44), C0(10, [0, 1.17, -2.2], 3.2, .6, -10, 44)])],
      [10, cine([C0(10, [0, 1.17, -2.2], 3.2, .6, -10, 44), C0(14, [0, 1.17, -2.2], 3.7, .8, 10, 45)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: request bubbles (coin, house, medicine) rise from the siddur; the grey "Shabbat" banner pushes them down
  function s2(dur) {
    const Wd = kW(); room(Wd); bubbleScene(Wd, ['coin', 'house', 'med'], [-.22, .1, .36], [1.9, 2.15, 1.85], .58, 1.0, 7.6, dur);
    abba(Wd, t => ({ facing: .25, gesture: t < 7 ? 'explain' : null, perform: t < 7 ? 0 : .4, smile: .5, talk: t > 1 && t < 7 ? .3 * talkAmt(t, 2) : 0, look: .2 }));
    moishy(Wd, t => ({ facing: -.35, gesture: t > 9 ? 'think' : null, perform: t > 9 ? 0 : .3, brow: t > 8 ? .4 : .1, smile: .3, look: -.25 }));
    Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [0, 1.22, -2.0], 3.4, .5, 14, 44), C0(5, [0, 1.22, -2.0], 3.1, .5, -6, 44)])],
      [5, cine([C0(5, [0, 1.22, -2.0], 3.1, .5, -6, 44), C0(11, [0, 1.22, -2.0], 3.2, .5, 10, 44)])],
      [11, cine([C0(11, [0, 1.22, -2.0], 3.2, .5, 10, 44), C0(dur, [0, 1.5, -2.0], 3.6, .6, -8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-44: spiritual bubbles (sefer, glowing heart) - also pushed down
  function s3(dur) {
    const Wd = kW(); room(Wd); bubbleScene(Wd, ['sefer', 'heart'], [-.3, .3], [2.0, 2.15], .6, 1.0, 6.4, dur, true);
    abba(Wd, t => ({ facing: .25, gesture: t < 6 ? 'explain' : null, perform: t < 6 ? 0 : .4, smile: .5, talk: t > 1 && t < 6 ? .3 * talkAmt(t, 3) : 0, look: .2 }));
    moishy(Wd, t => ({ facing: -.35, gesture: t > 8 ? 'shrug' : null, perform: t > 8 ? 0 : .3, brow: t > 7 ? .4 : .1, smile: .3, look: -.25 }));
    Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [0, 1.22, -2.0], 3.4, .5, -14, 44), C0(4.5, [0, 1.22, -2.0], 3.0, .5, 6, 44)])],
      [4.5, cine([C0(4.5, [0, 1.22, -2.0], 3.0, .5, 6, 44), C0(9.5, [0, 1.22, -2.0], 3.1, .5, -10, 44)])],
      [9.5, cine([C0(9.5, [0, 1.22, -2.0], 3.1, .5, -10, 44), C0(dur, [0, 1.5, -2.0], 3.5, .6, 8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-58: the wall calendar flips to "erev rosh chodesh Sivan", a "Shabbat" tag lands on it; the booklet glows on the table
  function s4(dur) {
    const Wd = kW(); room(Wd, 0); const cal = Wd.cal, tag = bb(Wd, 1.0, .42, drawShabbatGold, 512), bk = booklet(Wd), sk = shock(Wd, 0xffd166), gl = glowAt(Wd.scene, 1.8, 0xfff0a0, 0), sp = sparks(Wd, 10, [0, 1.6, -2.4], 1.8, 0xffe9a8, .13);
    Wd.on(t => { cal.flip(sm(P(2.4, 4.6, t)));
      tag.set([.5, 1.2 + .05 * Math.sin(t * 1.8) + 0, -4.2], .95 * popE(P(5.2, 6.2, t)), .06 * Math.sin(t * 1.9)); sk.set([.5, 1.2, -4.2], P(5.2, 6.0, t), .8);
      gl.position.set(0, 1.0, TZ + .05); gl.material.opacity = .55 * sm(P(7, 9, t));
      bk.set([0, 1.1 + bob(t, 2) * 1.5, TZ + .05], 1.8 * popE(P(7.0, 8.0, t)), .3 * Math.sin(t * .9), .5 * sm(P(7, 9, t)) + .12 * Math.sin(t * 2.5) * sm(P(7, 9, t)), .05 * Math.sin(t * 1.4)); sp(t, sm(P(7, 9, t))); });
    abba(Wd, t => ({ facing: .2, gesture: t > 3 && t < 7 ? 'point' : null, perform: t < 3 || t > 7 ? .4 : 0, smile: .5, look: .2 }));
    moishy(Wd, t => ({ facing: -.3, gesture: null, perform: .35, smile: .5, brow: .2, look: -.2 }));
    Wd.occ = [tag.g, bk.g]; Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [0, 1.45, -3.0], 3.9, .3, -10, 44), C0(5, [0, 1.45, -3.1], 3.7, .3, 6, 44)])],
      [5, cine([C0(5, [0, 1.45, -3.1], 3.7, .3, 6, 44), C0(8, [0, 1.35, -2.7], 3.5, .4, -6, 44)])],
      [8, cine([C0(8, [0, 1.35, -2.7], 3.5, .4, -6, 44), C0(dur, [0, 1.2, -2.4], 3.8, .5, 8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-76: Abba sits, lips closed, eyes on the booklet; a thought cloud above his head fills with light; green check
  function s5(dur) {
    const Wd = kW(); room(Wd); const bk = booklet(Wd), cl = thoughtCloud(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), sp = sparks(Wd, 10, [AX + .3, 2.4, SZ], 1.2, 0xfff0b0, .12);
    const CP = [AX + .5, 2.42, SZ + .1];
    Wd.on(t => { const lg = sm(P(3.2, 11, t));
      bk.set([AX + .5, .9 + bob(t, 1) * 1.2, SZ + 1.0], 1.3 * popE(P(.3, 1.2, t)), .1 * Math.sin(t * .8), .35 + .15 * Math.sin(t * 2.4), .03 * Math.sin(t * 1.3));
      cl.set([CP[0], CP[1] + .05 * Math.sin(t * 1.4), CP[2]], popE(P(2.0, 3.2, t)) * .85, lg, t);
      ck.set([AX + 1.5, 2.3 + .05 * Math.sin(t * 3), SZ + .1], popE(P(11.4, 12.4, t)) * .55, .05 * Math.sin(t * 3)); sk.set([AX + 1.5, 2.3, SZ + .1], P(11.4, 12.3, t), .6); sp(t, lg); });
    abba(Wd, t => ({ facing: .1, gesture: 'rest', perform: 0, smile: .35, talk: 0, look: 0, brow: .05 }));
    moishy(Wd, t => ({ facing: -.4, gesture: null, perform: .12, smile: .35 + .3 * sm(P(12, 14, t)), brow: 0, look: -.3 }));
    Wd.occ = [bk.g, cl.g, ck.g]; Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [-.3, 1.32, -2.2], 3.5, .5, -12, 44), C0(6, [-.3, 1.32, -2.2], 3.1, .5, 8, 44)])],
      [6, cine([C0(6, [-.3, 1.32, -2.2], 3.1, .5, 8, 44), C0(12, [-.2, 1.32, -2.2], 3.4, .5, -8, 44)])],
      [12, cine([C0(12, [-.2, 1.32, -2.2], 3.4, .5, -8, 44), C0(dur, [-.1, 1.3, -2.2], 3.8, .6, 10, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-90: clock icon "zmana" beside the booklet; a half-lit check with a "?" by Abba's mouth
  function s6(dur) {
    const Wd = kW(); room(Wd); const bk = booklet(Wd), clk = clock(Wd, { r: .4 }), tg = bb(Wd, 1.0, .42, drawZmana, 512), hc = bb(Wd, .6, .6, drawHalfCheck, 256), gl = glowAt(Wd.scene, 1.2, 0xfff0a0, 0), sp = sparks(Wd, 8, [-.2, 1.6, SZ + .3], 1.2, 0xffe9a8, .12);
    Wd.on(t => {
      bk.set([-.3, .98 + bob(t, 1) * 1.2, SZ + .85], 1.3 * popE(P(.3, 1.1, t)), .12 * Math.sin(t * .8), .4 + .15 * Math.sin(t * 2.4), .03 * Math.sin(t * 1.3));
      clk.set([.2, 1.72 + bob(t, 0) * 1.5, SZ + .4], popE(P(1.6, 2.5, t)) * 1.0, 6 + t * .35, 1);
      tg.set([.26, 1.2 + bob(t, 2), SZ + .4], .72 * popE(P(2.6, 3.4, t)), .03 * Math.sin(t * 1.7));
      const h = popE(P(5.6, 6.6, t)); hc.set([AX + .8, 1.58 + .05 * Math.sin(t * 2.2), SZ + .45], h * .62, .05 * Math.sin(t * 2.6)); gl.position.set(AX + .8, 1.58, SZ + .4); gl.material.opacity = .35 * h * (.7 + .3 * Math.sin(t * 3)); sp(t, sm(P(5, 7, t))); });
    abba(Wd, t => ({ facing: .1, gesture: 'rest', perform: 0, smile: .3, talk: t > 6.5 ? .22 * talkAmt(t, 3) * sm(P(6.5, 8, t)) : 0, look: 0 }));
    moishy(Wd, t => ({ facing: -.4, gesture: t > 8 ? 'think' : null, perform: t > 8 ? 0 : .12, smile: .3, brow: .25, look: -.3 }));
    Wd.occ = [bk.g, clk.g, tg.g, hc.g]; Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [-.1, 1.22, -2.2], 3.4, .5, 14, 44), C0(4.5, [-.1, 1.22, -2.2], 3.0, .4, -4, 44)])],
      [4.5, cine([C0(4.5, [-.3, 1.22, -2.2], 3.0, .4, -4, 44), C0(9, [-.45, 1.22, -2.2], 2.8, .4, 12, 44)])],
      [9, cine([C0(9, [-.45, 1.22, -2.2], 2.8, .4, 12, 44), C0(dur, [-.2, 1.55, -2.2], 3.9, .5, -8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 90-100: recap - ordinary request bubbles grey and faded; the thought cloud glows with a check; Moishy smiles at Abba
  function s7(dur) {
    const Wd = kW(); room(Wd); const kinds = ['coin', 'house', 'med'], bs = kinds.map(k => iconBub(Wd, k, .5)), cl = thoughtCloud(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), sp = sparks(Wd, 10, [AX + .3, 2.4, SZ], 1.2, 0xfff0b0, .12);
    Wd.on(t => { const a = popE(P(.3, 1.2, t));
      bs.forEach((b, i) => b.set([-2.95 + i * .45, 1.5 + .3 * (i % 2) + .05 * Math.sin(t * 1.5 + i * 2), SZ + .2], a * 1.0, .5, .95, .05 * Math.sin(t * 1.7 + i), 0));
      cl.set([AX + .5, 2.5 + .05 * Math.sin(t * 1.4), SZ + .1], popE(P(.8, 1.8, t)) * .85, 1, t);
      ck.set([AX + 1.5, 2.3 + .05 * Math.sin(t * 3), SZ + .1], popE(P(2.6, 3.6, t)) * .55, .05 * Math.sin(t * 3)); sk.set([AX + 1.5, 2.3, SZ + .1], P(2.6, 3.5, t), .6); sp(t, 1); });
    abba(Wd, t => ({ facing: .1, gesture: 'rest', perform: .2, smile: .6, talk: 0, look: 0 }));
    moishy(Wd, t => ({ facing: -.55, gesture: t > 4 ? 'thumb' : null, perform: t > 4 ? 0 : .25, smile: .9 + .1 * sm(P(1, 3, t)), brow: 0, look: -.3 }));
    Wd.occ = bs.map(b => b.g).concat([cl.g, ck.g]); Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [-.4, 1.37, -2.2], 4.0, .5, -12, 44), C0(5, [-.4, 1.37, -2.2], 3.7, .5, 8, 44)])],
      [5, cine([C0(5, [-.4, 1.37, -2.2], 3.7, .5, 8, 44), C0(dur, [-.4, 1.65, -2.2], 4.0, .6, -8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120
  function answerBg(dur) {
    const Wd = kW(); room(Wd, 3.4, true, [-.58, .58]); const bk = booklet(Wd), gl = glowAt(Wd.scene, 2.4, 0xffe08a, .35);
    gl.position.set(0, 1.0, TZ + .05);
    Wd.on(t => { bk.set([0, 1.0 + bob(t, 1) * 1.4, TZ + .1], 1.7, .25 * Math.sin(t * .8), .5 + .15 * Math.sin(t * 2.4), .04 * Math.sin(t * 1.3)); });
    manK(Wd, ABBA, t => Object.assign({ pos: [-.58, RBM, SZ], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }, SIT), .5);
    boyK(Wd, MOISHY, t => Object.assign({ pos: [.58, RB, SZ], facing: 0, scale: MS, smile: 1, perform: .5, talk: .4 * talkAmt(t, 3) }, SIT));
    Wd.occ = [bk.g]; Wd.center = [0, SZ]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
