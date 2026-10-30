// yomit-06 story: "Pidyon haben - silver granules" (halacha yomit, R' Fried) - 3D choreography per storyboards_v7.md (A).
// Abba + the Kohen (adult men) + Mendy (12, standing). The baby is never shown (a closed white cradle-basket far in the background only).
// Nobody touches a flame; props (bowl, granules, pouch, tags) move by themselves.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mesh, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, mkWorld, plainRoom, diningTable, chair, mark3d, popE, lighting, glowAt, glowSprite,
    texPlane, toon, FONT, fitText, arcPt, shock, bill, windowUnit, person } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C0 = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? .0001 : ly];
  const TT = .72, TZ = -1.7, SZ = TZ - .82;          // table top / table z / seated line
  const AX = -1.7, KX = 1.7, RBM = .2;                 // Abba x, Kohen x, seat raise (man)
  const SIT = { sit: true, groundY: 0 };
  const SKIN = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
  const ABBA = { beardLen: .8, beard: '#3a2618', skin: SKIN[1], pants: '#1b1d24', coat: '#23252e' };
  const KOHEN = { beardLen: 1.0, beard: '#f2f2ee', skin: SKIN[0], pants: '#1b1d24', coat: '#2b2c36' };
  const SHOP = { beardLen: .7, beard: '#55504a', skin: SKIN[3], pants: '#2a2622', coat: '#4a3a2a' };
  const MENDY = 2;

  // ---------------------------------------------------------------- people (kippa found by shape, dark navy, never scaled)
  const findKippa = (Pn) => { let done = false; return () => { if (done || !Pn.figure) return; done = true;
    Pn.figure.group.traverse(m => { if (m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.thetaLength > .7 && m.geometry.parameters.thetaLength < .95) { Pn.kippa = m; m.material = m.material.clone(); m.material.color.set(0x1f2f70); } }); }; };
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(findKippa(Pn)); return Pn; };
  const manK = (Wd, look, fn, seed) => {
    const Pn = person(Wd, Object.assign({ kind: 'man', hat: 'kippa', glasses: false }, look), t => Object.assign({ seed: seed }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(Pn);
    Wd.on(findKippa(Pn)); return Pn;
  };
  const abba = (Wd, fn) => manK(Wd, ABBA, t => Object.assign({ pos: [AX, RBM, SZ], facing: .25, smile: .5 }, SIT, fn(t)), .5);
  const kohen = (Wd, fn) => manK(Wd, KOHEN, t => Object.assign({ pos: [KX, RBM, SZ], facing: -.25, smile: .5 }, SIT, fn(t)), .3);
  const mendy = (Wd, fn) => boyK(Wd, MENDY, t => Object.assign({ pos: [2.45, 0, SZ + .25], facing: -.55, scale: 1.0, smile: .5, groundY: 0 }, fn(t)));

  // ---------------------------------------------------------------- billboards / tags
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54); };
  const drawCoinsTag = drawTag('מטבעות מהכהן', '#fff2b8', '#6a3a00', '#c98a1a');
  const drawSilverTag = drawTag('כסף טהור', '#eef3fa', '#1d2a5a', '#8a96a8');
  const drawBuyTag = drawTag('קניית מטבעות מהכהן', '#fff2b8', '#6a3a00', '#c98a1a');
  const drawStar = (c, W, H) => {
    const cx = W / 2, cy = H * .53, R = W * .47, r = R * .52; c.lineJoin = 'round';
    c.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r : R; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } c.closePath();
    const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ffe68a'); gr.addColorStop(1, '#f0b020'); c.fillStyle = gr; c.fill(); c.lineWidth = W * .035; c.strokeStyle = '#a86a00'; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, 'מהודר', { maxW: W * .5, maxLines: 1, max: H * .2, min: 20, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#7a1c1c'; c.fillText('מהודר', cx, cy + H * .03); };
  const drawLevi = (c, W, H) => { const g = c.createRadialGradient(W * .4, H * .35, W * .05, W / 2, H / 2, W * .5); g.addColorStop(0, '#8fc4ff'); g.addColorStop(1, '#2f6fb0');
    c.fillStyle = g; c.beginPath(); c.arc(W / 2, H / 2, W * .46, 0, PI * 2); c.fill(); c.lineWidth = W * .05; c.strokeStyle = '#173f73'; c.stroke(); c.lineWidth = W * .02; c.strokeStyle = '#d6e9ff'; c.beginPath(); c.arc(W / 2, H / 2, W * .36, 0, PI * 2); c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `800 ${W * .3}px ${FONT}`; c.fillStyle = '#ffffff'; c.fillText('לוי', W / 2, H * .53); };
  const drawBechor = (c, W, H) => { const g = c.createRadialGradient(W * .4, H * .35, W * .05, W / 2, H / 2, W * .5); g.addColorStop(0, '#ffeea0'); g.addColorStop(1, '#f0b020');
    c.fillStyle = g; c.beginPath(); c.arc(W / 2, H / 2, W * .46, 0, PI * 2); c.fill(); c.lineWidth = W * .05; c.strokeStyle = '#a86a00'; c.stroke(); c.lineWidth = W * .02; c.strokeStyle = '#fff6cc'; c.beginPath(); c.arc(W / 2, H / 2, W * .36, 0, PI * 2); c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `800 ${W * .26}px ${FONT}`; c.fillStyle = '#6a2a00'; c.fillText('בכור', W / 2, H * .53); };
  const drawScroll = (c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff3cf'); g.addColorStop(1, '#f1d99a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#b8862a'; c.lineWidth = H * .04; c.strokeRect(W * .03, H * .08, W * .94, H * .84);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, 'קח את הלויים', { maxW: W * .8, maxLines: 1, max: H * .38, min: 20, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#4a2a10'; c.fillText('קח את הלויים', W / 2, H * .46);
    c.font = `700 ${H * .15}px ${FONT}`; c.fillStyle = '#8a5a20'; c.fillText('במדבר ג׳', W / 2, H * .8); };
  const drawSign = (c, W, H) => { c.fillStyle = '#1d2f6a'; c.beginPath(); c.roundRect(W * .02, H * .08, W * .96, H * .84, H * .2); c.fill(); c.lineWidth = H * .06; c.strokeStyle = '#e3b25a'; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, 'פדיון הבן', { maxW: W * .84, maxLines: 1, max: H * .62, min: 30, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#ffe9a8'; c.fillText('פדיון הבן', W / 2, H * .53); };

  // ---------------------------------------------------------------- materials
  const silver = () => { const m = toon(0xe6ecf4); m.emissive.set(0x4c5666); return m; };
  const silverGlow = () => { const m = toon(0xcdd6e3); m.emissive.set(0x4e5b70); return m; };
  const sparks = (Wd, n, center, rad, color, size) => { const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(size || .14, size || .14, 0); s.material.color.set(color || 0xffe9a8); Wd.add(s); sp.push(s); }
    return (t, k) => sp.forEach((s, i) => { const a = i * 2.4 + t * (.5 + (i % 3) * .2); s.position.set(center[0] + Math.cos(a) * rad * (.6 + .4 * ((i * 7) % 5) / 4), center[1] + Math.sin(a * 1.3) * rad * .35 + ((i % 4) - 1.5) * .08, center[2] + Math.sin(a) * rad * .4); s.material.opacity = (k === undefined ? 1 : k) * (.3 + .45 * Math.sin(t * 2.2 + i * 1.7) ** 2); }); };
  const bob = (t, k) => .04 * Math.sin(t * 1.8 + k);

  // ---------------------------------------------------------------- props
  function coinPile(Wd) {   // gold coins in stacks; set(pos, s, ry, glow)
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const stacks = [[-.17, .05, 6], [.1, .1, 4], [-.02, -.12, 3], [.2, -.1, 2]];
    stacks.forEach(s => { for (let i = 0; i < s[2]; i++) { const c = cyl(.12, .12, .028, 0xffc93a, { pos: [s[0] + .006 * (i % 2), .014 + i * .03, s[1]], rot: [0, i * .7, 0] }); c.material.emissive.set(0x6a4200); inner.add(c); } });
    [[.0, .22, .3, .5], [-.24, -.04, .1, -.7]].forEach(p => { const c = cyl(.12, .12, .028, 0xffd44a, { pos: [p[0], .2, p[1]], rot: [p[2] * 3, p[3], .4] }); c.material.emissive.set(0x6a4200); inner.add(c); });
    const gl = glowSprite(1.3, 1.3, 0); gl.material.color.set(0xffd27a); gl.position.set(0, .2, -.2); inner.add(gl);
    return { g, set(pos, s, ry, glow) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.set(.45, ry || 0, 0); gl.material.opacity = glow || 0; } };
  }
  function sack(Wd) {   // cream pouch with silver granules; set(pos, s, ry, rz, glow)
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const cream = 0xf1e6cf;
    inner.add(ball(.26, cream, { pos: [0, .26, 0], scale: [1, 1, .85] })); inner.add(cyl(.085, .14, .16, cream, { pos: [0, .52, 0] }));
    inner.add(ball(.13, cream, { pos: [0, .64, 0], scale: [1.35, .55, 1.35] })); inner.add(cyl(.105, .105, .045, 0xd9a63a, { pos: [0, .54, 0] }));
    for (let i = 0; i < 18; i++) { const a = i * 2.4, r = .06 + .05 * ((i * 5) % 4) / 3; const gr = ball(.036, 0xf4f8fd, { pos: [Math.cos(a) * r, .7 + .02 * (i % 3), Math.sin(a) * r * .8], ink: false }); gr.material = silverGlow(); inner.add(gr); }
    const lab = texPlane(.26, .26, (c, W, H) => { c.fillStyle = '#eef3fa'; c.beginPath(); c.arc(W / 2, H / 2, W * .46, 0, PI * 2); c.fill(); c.lineWidth = W * .05; c.strokeStyle = '#8a96a8'; c.stroke();
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'ltr'; c.font = `800 ${W * .42}px ${FONT}`; c.fillStyle = '#3a4a68'; c.fillText('Ag', W / 2, H * .54); }, { cw: 256, ro: 4 });
    lab.position.set(0, .27, .225); inner.add(lab);
    const gl = glowSprite(1.4, 1.4, 0); gl.material.color.set(0xcfe6ff); gl.position.set(0, .35, -.3); inner.add(gl);
    return { g, set(pos, s, ry, rz, glow) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.set(0, ry || 0, rz || 0); gl.material.opacity = glow || 0; } };
  }
  function tray(Wd) { Wd.add(cyl(.46, .42, .035, 0xe2e8f0, { pos: [0, TT + .02, TZ], ink: false })); Wd.add(cyl(.38, .38, .02, 0xf6f9fd, { pos: [0, TT + .045, TZ], ink: false })); }
  function cradle(Wd) {   // closed white cradle-basket with a ribbon, on a small table, far in the background
    const g = new THREE.Group(); g.position.set(-3.3, 0, -3.7); Wd.add(g);
    g.add(box(.9, .6, .55, 0xfffdf6, { pos: [0, .3, 0] }));
    const bsk = new THREE.Group(); bsk.position.set(0, .62, 0); g.add(bsk);
    bsk.add(cyl(.34, .28, .22, 0xfffcf5, { pos: [0, .11, 0], scale: [1.2, 1, .8] })); bsk.add(ball(.34, 0xffffff, { pos: [0, .22, 0], scale: [1.2, .55, .8] }));
    bsk.add(box(.07, .03, .6, 0x6aa8ff, { pos: [0, .5 * .55 + .24, 0], rot: [0, 0, 0], ink: false })); bsk.add(ball(.07, 0x6aa8ff, { pos: [-.08, .5, .0] })); bsk.add(ball(.07, 0x6aa8ff, { pos: [.08, .5, .0] })); bsk.add(ball(.04, 0x4a88e0, { pos: [0, .49, 0] }));
    Wd.on(t => { bsk.rotation.z = .035 * Math.sin(t * 1.3); });
  }

  // ---------------------------------------------------------------- rooms
  function hall(Wd, seats, signOn) {
    plainRoom(Wd, { HX: 6.2, HZ: 4.6, H: 3.6, beams: false, wall: 0xf8edd2 });
    windowUnit(Wd, -3.6, 1.0, -4.57, 0, 1.6, 2.1); windowUnit(Wd, 3.6, 1.0, -4.57, 0, 1.6, 2.1);
    for (const x of [-3.6, 3.6]) for (const dx of [-1, 1]) Wd.add(box(.5, 2.4, .14, 0xe3b25a, { pos: [x + dx * 1.1, 1.9, -4.5], ink: false }));
    diningTable(Wd, { x: 0, z: TZ, len: 3.4, wid: 1.1, cloth: 0xffffff, food: false });
    tray(Wd);
    (seats || [AX, KX]).forEach(x => chair(Wd, x, SZ - .13, 0, .46));
    if (signOn !== false) { const sg = texPlane(1.9, .5, drawSign, { cw: 640, ro: 2, opaque: true }); sg.position.set(-1.0, 2.72, -4.5); Wd.add(sg); }
    cradle(Wd);
    lighting(Wd, () => ({ hemi: 1.15, sun: 1.0, hemiColor: 0xfff1d8, sunColor: 0xfff1dc }));
  }
  const kW = () => mkWorld({ skyTop: 0x9ad0f6, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 40, fogFar: 140, hemi: 1.15, sun: 1.0, sunPos: [-14, 26, 16], shadowExt: 14 });

  function cup(Wd, x, y, z, k, s) {   // silver cups / kiddush cups on a shelf
    const A = m => { m.material.emissive.set(0x4c5666); Wd.add(m); };
    if (k % 3 === 0) { A(cyl(.06 * s, .06 * s, .014 * s, 0xe6ecf4, { pos: [x, y + .007 * s, z], ink: false })); A(cyl(.014 * s, .014 * s, .12 * s, 0xe6ecf4, { pos: [x, y + .07 * s, z], ink: false })); A(cyl(.085 * s, .05 * s, .11 * s, 0xe6ecf4, { pos: [x, y + .18 * s, z] })); }
    else if (k % 3 === 1) { A(cyl(.07 * s, .05 * s, .2 * s, 0xe6ecf4, { pos: [x, y + .1 * s, z] })); A(box(.02 * s, .1 * s, .05 * s, 0xe6ecf4, { pos: [x + .085 * s, y + .12 * s, z], ink: false })); }
    else { A(cyl(.05 * s, .05 * s, .02 * s, 0xe6ecf4, { pos: [x, y + .01 * s, z], ink: false })); A(cyl(.016 * s, .016 * s, .22 * s, 0xe6ecf4, { pos: [x, y + .13 * s, z], ink: false })); A(cyl(.03 * s, .016 * s, .05 * s, 0xe6ecf4, { pos: [x, y + .26 * s, z], ink: false })); }
  }
  function shop(Wd) {
    plainRoom(Wd, { HX: 6.2, HZ: 4.6, H: 3.6, beams: false, wall: 0xf6f0e2 });
    windowUnit(Wd, -4.4, 1.2, -4.57, 0, 1.4, 1.8); windowUnit(Wd, 4.4, 1.2, -4.57, 0, 1.4, 1.8);
    Wd.add(box(9.4, 3.2, .22, 0xdcc9a4, { pos: [0, 1.8, -4.4], ink: false }));
    [.98, 1.7, 2.42].forEach((y, r) => { Wd.add(box(9.0, .06, .42, 0x8a5a32, { pos: [0, y, -4.2] })); for (let i = 0; i < 10; i++) { const x = -3.9 + i * .87 + (r % 2) * .2; cup(Wd, x, y + .03, -4.2, i + r, 1.0 + .25 * ((i + r) % 2)); } });
    Wd.add(box(3.9, .95, .72, 0x6a4326, { pos: [0, .475, -1.9] })); Wd.add(box(4.1, .06, .84, 0xece0c4, { pos: [0, .98, -1.9] }));
    Wd.add(cyl(.34, .3, .035, 0xe2e8f0, { pos: [-1.4, 1.03, -1.85], ink: false }));
    lighting(Wd, () => ({ hemi: 1.15, sun: 1.0, hemiColor: 0xfff1d8, sunColor: 0xfff1dc }));
  }

  // ---------------------------------------------------------------- the scale (display shows the weight); returns pan top, display redraw, heap control
  const SSC = 1.5, SX = 0, SY = 1.01, SZ_ = -1.9;
  function scaleProp(Wd) {
    const g = new THREE.Group(); g.position.set(SX, SY, SZ_); g.scale.setScalar(SSC); Wd.add(g);
    g.add(box(.9, .3, .6, 0xe9edf3, { pos: [0, .15, 0] })); g.add(box(.94, .03, .64, 0xb9c2cf, { pos: [0, .015, 0], ink: false }));
    g.add(cyl(.05, .05, .1, 0xc8d0dc, { pos: [0, .35, 0], ink: false })); const pan = cyl(.3, .3, .03, 0xe6ecf4, { pos: [0, .415, 0] }); pan.material.emissive.set(0x4c5666); g.add(pan);
    const cv = document.createElement('canvas'); cv.width = 700; cv.height = 280; const cx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(.7, .28), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false })); disp.position.set(0, .15, .302); disp.renderOrder = 3; g.add(disp);
    let key = '';
    const GMIN = 70, GMAX = 110, gx = v => .08 + .84 * clamp((v - GMIN) / (GMAX - GMIN), 0, 1);
    const draw = (v, fin, pulse) => {
      const k = fin ? 'F' + Math.round(pulse * 8) : 'N' + Math.round(v); if (k === key) return; key = k; const W = 700, H = 280;
      cx.clearRect(0, 0, W, H); cx.fillStyle = '#10161f'; cx.beginPath(); cx.roundRect(0, 0, W, H, 26); cx.fill();
      cx.fillStyle = fin ? '#c9f7c0' : '#d8ecd2'; cx.beginPath(); cx.roundRect(14, 14, W - 28, H - 28, 18); cx.fill();
      cx.textBaseline = 'middle'; cx.textAlign = 'center';
      if (fin) { cx.fillStyle = '#0d5a24'; cx.direction = 'ltr'; cx.font = `800 ${H * .44}px ${FONT}`; cx.fillText('96–101', W * .6, H * .36); cx.direction = 'rtl'; cx.font = `800 ${H * .3}px ${FONT}`; cx.fillText('גרם', W * .17, H * .38); }
      else { cx.fillStyle = '#16301c'; cx.direction = 'ltr'; cx.font = `800 ${H * .46}px ${FONT}`; cx.fillText(String(Math.round(v)), W * .6, H * .36); cx.direction = 'rtl'; cx.font = `800 ${H * .3}px ${FONT}`; cx.fillText('גרם', W * .17, H * .38); }
      const by = H * .76, bh = H * .1; cx.fillStyle = '#8fa88c'; cx.fillRect(W * .08, by - bh / 2, W * .84, bh);
      cx.fillStyle = '#22b455'; cx.fillRect(W * (gx(96)), by - bh * .9, W * (gx(101) - gx(96)), bh * 1.8);
      const mv = fin ? 98.5 : v; const mx = W * gx(mv); cx.fillStyle = fin ? '#0d5a24' : '#16301c'; cx.beginPath(); cx.moveTo(mx, by - bh * 1.1); cx.lineTo(mx - 13, by - bh * 2.6); cx.lineTo(mx + 13, by - bh * 2.6); cx.closePath(); cx.fill();
      tex.needsUpdate = true; };
    draw(0, false, 0);
    // heap of granules on the pan
    const heap = new THREE.Group(); heap.position.set(0, .43, 0); g.add(heap);
    const hb = ball(.24, 0xf4f8fd, { pos: [0, 0, 0], scale: [1, .6, 1], ink: false }); hb.material = silverGlow(); heap.add(hb);
    const gr = []; for (let i = 0; i < 40; i++) { const a = i * 2.39996, r = .22 * Math.sqrt((i + .5) / 40), y = .13 * Math.sqrt(Math.max(0, 1 - (r / .24) ** 2)); const b = ball(.034, 0xf4f8fd, { pos: [Math.cos(a) * r, y, Math.sin(a) * r], ink: false }); b.material = silverGlow(); heap.add(b); gr.push(b); }
    const hgl = glowSprite(1.0, 1.0, 0); hgl.material.color.set(0xdff0ff); hgl.position.set(0, .15, .1); heap.add(hgl);
    const zoneGl = glowSprite(.8, .35, 0); zoneGl.material.color.set(0x6dff9a); zoneGl.position.set(.09, .12, .32); g.add(zoneGl);
    const api = { g, pan: () => [SX, SY + .43 * SSC, SZ_], draw,
      setHeap(k, glow) { heap.visible = k > .01; hb.scale.set(k, .6 * k, k); gr.forEach((b, i) => { b.visible = k > .25 + .7 * i / gr.length; b.scale.setScalar(.6 + .4 * k); }); hgl.material.opacity = (glow || 0); },
      zone(a) { zoneGl.material.opacity = a; } };
    api.setHeap(0, 0); return api;
  }
  // silver pouring bowl above the scale, tilting by itself; granules fall from its mouth to the pan
  function bowlPour(Wd, sc) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const sm_ = silver(); sm_.side = THREE.DoubleSide; const wall = mesh(new THREE.CylinderGeometry(.17, .1, .22, 28, 1, true), sm_); inner.add(wall);
    const bot = cyl(.1, .1, .02, 0xe6ecf4, { pos: [0, -.11, 0], ink: false }); bot.material.emissive.set(0x4c5666); inner.add(bot);
    const fill = ball(.14, 0xf4f8fd, { pos: [0, .03, 0], scale: [1, .5, 1], ink: false }); fill.material = silverGlow(); inner.add(fill);
    const rim = cyl(.175, .175, .016, 0xcfd6e0, { pos: [0, .11, 0], ink: false }); rim.material.emissive.set(0x4c5666); inner.add(rim); rim.visible = false;
    const N = 44, gs = []; for (let i = 0; i < N; i++) { const b = ball(.03 * SSC, 0xf4f8fd, { ink: false }); b.material = silverGlow(); b.visible = false; Wd.add(b); gs.push(b); }
    const pan = sc.pan(); const MOUTH = [.2, 2.5, SZ_];
    return { g, set(t0, t1, t) {   // pouring between t0 and t1
      const appear = popE(P(t0 - 1.6, t0 - .7, t)), leave = 1 - sm(P(t1 + .4, t1 + 1.4, t)), s = appear * leave; g.visible = s > .01;
      const tilt = sm(P(t0 - .8, t0 + .5, t)) * (1 - sm(P(t1, t1 + .6, t))) * 1.4;
      g.scale.setScalar(Math.max(s, .001) * 1.5); inner.rotation.z = tilt; fill.scale.y = .5 * (1 - .8 * clamp((t - t0) / (t1 - t0), 0, 1) * (tilt > .1 ? 1 : 0)) + .02; fill.visible = fill.scale.y > .03;
      const mx = -.17 * Math.cos(tilt) - .11 * Math.sin(tilt), my = -.17 * Math.sin(tilt) + .11 * Math.cos(tilt);
      g.position.set(MOUTH[0] - mx * 1.5 * s, MOUTH[1] - my * 1.5 * s + .05 * Math.sin(t * 1.6), MOUTH[2]);
      const mouth = [g.position.x + mx * 1.5 * s, g.position.y + my * 1.5 * s, MOUTH[2]];
      const act = t > t0 && t < t1 + .4;
      gs.forEach((b, i) => { if (!act) { b.visible = false; return; } const T = 1.15, u = (((t - t0) / T + i / N) % 1 + 1) % 1; const ly = Math.max(0, 1 - (t - t1) * 3);
        const ang = i * 2.4; b.visible = (t - t0) / T + i / N > 1 || i / N < (t - t0) / T ? (t < t1 || u < 1 - (t - t1) / T) : false;
        const ex = pan[0] + Math.cos(ang) * .22, ez = pan[2] + Math.sin(ang) * .22 * .8, ey = pan[1] + .06; const q = u * u;
        b.position.set(lerp(mouth[0] - .02 * Math.cos(ang), ex, u), lerp(mouth[1], ey, q), lerp(mouth[2], ez, u)); }); } };
  }

  // ---------------------------------------------------------------- 1. HOOK 0-14: two choices float over the table
  function hook(dur) {
    const Wd = kW(); hall(Wd); const cp = coinPile(Wd), sk = sack(Wd), t1 = bb(Wd, 1.0, .4, drawCoinsTag, 512), t2 = bb(Wd, .8, .4, drawSilverTag, 512), spk = sparks(Wd, 10, [0, 2.0, TZ], .8, 0xffe9a8, .13);
    Wd.on(t => { const a = popE(P(.5, 1.5, t)), sw = .5 + .5 * Math.sin(t * 1.1);
      cp.set([-.7, 1.5 + bob(t, 0), TZ - .55], .88 * a, .5 + .35 * Math.sin(t * .8), .5);
      sk.set([.7, 1.32 + bob(t, 2), TZ - .55], .9 * a, .3 * Math.sin(t * .7), .04 * Math.sin(t * 1.4), .5);
      t1.set([-.68, 1.18 + bob(t, 1), TZ - .3], .66 * popE(P(1.2, 2.0, t)), .03 * Math.sin(t * 1.6)); t2.set([.68, 1.18 + bob(t, 3), TZ - .3], .66 * popE(P(1.4, 2.2, t)), .03 * Math.sin(t * 1.7)); spk(t, sm(P(.5, 2, t))); });
    abba(Wd, t => ({ facing: .3, gesture: t > 1.2 && t < 9 ? 'explain' : null, perform: t > 9 ? .4 : 0, smile: .5, talk: t > 3 && t < 7 ? .25 * talkAmt(t, 2) : 0, look: .2 }));
    kohen(Wd, t => ({ facing: -.3, gesture: null, perform: .3, smile: .5, look: -.2 }));
    mendy(Wd, t => ({ pos: [0, 0, SZ - .55], facing: 0, gesture: t > 5 ? 'think' : null, perform: t > 5 ? 0 : .3, brow: .5, smile: .1, look: Math.sin(t * 1.3) * .8 }));
    Wd.occ = [cp.g, sk.g, t1.g, t2.g]; Wd.center = [0, SZ]; Wd.qSize = .9; Wd.qPos = [-1.6, -2.4];
    Wd.cam = seq([0, cine([C0(0, [.1, 1.3, -2.2], 3.7, .6, -10, 44), C0(5, [.1, 1.3, -2.2], 3.4, .6, 8, 44)])],
      [5, cine([C0(5, [.1, 1.3, -2.2], 3.4, .6, 8, 44), C0(10, [.1, 1.3, -2.2], 3.3, .6, -8, 44)])],
      [10, cine([C0(10, [.1, 1.3, -2.2], 3.3, .6, -8, 44), C0(14, [.1, 1.32, -2.2], 3.35, .65, -6, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: a scroll opens "take the Levites"; Levi tokens pair one-to-one with firstborn tokens
  function s2(dur) {
    const Wd = kW(); hall(Wd, [AX, KX], false); const spk = sparks(Wd, 12, [0, 1.6, TZ], 1.5, 0xffe9a8, .12);
    const scrollG = new THREE.Group(), rolls = [], sheet = texPlane(1.5, .62, drawScroll, { cw: 768, ro: 8 }); const sin_ = new THREE.Group(); sin_.add(sheet); scrollG.add(sin_); scrollG.visible = false; Wd.add(scrollG); bill(Wd, scrollG);
    [-1, 1].forEach(sd => { const r = cyl(.055, .055, .74, 0x8a5a32, {}); r.rotation.x = 0; scrollG.add(r); rolls.push(r); });
    const N = 4, XS = [-.69, -.23, .23, .69], LY = 1.98, BY = 1.34;
    const lev = [], bec = [], beams = [];
    for (let i = 0; i < N; i++) { lev.push(bb(Wd, .5, .5, drawLevi, 256)); bec.push(bb(Wd, .5, .5, drawBechor, 256));
      const bm = box(.05, .3, .05, 0xfff2b8, { pos: [0, 0, 0], ink: false }); bm.material.emissive.set(0xffd978); bm.visible = false; Wd.add(bm); beams.push(bm); }
    const rings = XS.map(() => shock(Wd, 0x6dff9a));
    const startL = XS.map(x => [x * .3, 2.45]), startB = XS.map(x => [x * .4, 1.0]);
    Wd.on(t => { const o = popE(P(.5, 1.6, t)), op = sm(P(1.2, 3.4, t));
      scrollG.visible = o > .01; scrollG.position.set(0, 2.5 + bob(t, 0), TZ - .3); const w = lerp(.08, 1, op);
      sheet.scale.set(w, 1, 1); sin_.scale.setScalar(Math.max(o, .001)); rolls.forEach((r, k) => { r.position.x = (k ? 1 : -1) * (.75 * w + .02) * Math.max(o, .001); r.scale.setScalar(Math.max(o, .001)); });
      for (let i = 0; i < N; i++) { const t0 = 3.4 + 1.5 * i, u = sm(P(t0, t0 + 1.6, t)), a = popE(P(t0 - .8, t0 - .2, t));
        const pl = arcPt([startL[i][0], startL[i][1], TZ - .1], [XS[i], LY, TZ - .1], u, .25), pb = arcPt([startB[i][0], startB[i][1], TZ - .1], [XS[i], BY, TZ - .1], u, -.2);
        lev[i].set([pl[0], pl[1] + .03 * Math.sin(t * 1.7 + i), pl[2]], a * .84, .03 * Math.sin(t * 1.5 + i)); bec[i].set([pb[0], pb[1] + .03 * Math.sin(t * 1.9 + i), pb[2]], a * .84, .03 * Math.sin(t * 1.6 + i));
        const bk = sm(P(t0 + 1.4, t0 + 2.2, t)); beams[i].visible = bk > .01; beams[i].position.set(XS[i], (LY + BY) / 2, TZ - .12); beams[i].scale.set(1, bk * (LY - BY - .46) / .3, 1);
        rings[i].set([XS[i], (LY + BY) / 2, TZ - .1], P(t0 + 2.0, t0 + 2.8, t), 1.1); }
      spk(t, sm(P(1, 3, t))); });
    abba(Wd, t => ({ facing: .3, gesture: t < 9 ? 'explain' : null, perform: t < 9 ? 0 : .4, smile: .5, talk: t > 1 && t < 9 ? .3 * talkAmt(t, 2) : 0, look: .2 }));
    kohen(Wd, t => ({ facing: -.3, gesture: null, perform: .3, smile: .5, look: -.2 }));
    mendy(Wd, t => ({ pos: [2.15, 0, SZ + .25], facing: -.5, gesture: null, perform: .3, brow: .2, smile: .4, look: -.3 }));
    Wd.occ = [scrollG].concat(lev.map(b => b.g), bec.map(b => b.g)); Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [.1, 1.42, -2.2], 3.9, .5, 12, 44), C0(6, [.1, 1.42, -2.2], 3.5, .5, -6, 44)])],
      [6, cine([C0(6, [.1, 1.42, -2.2], 3.5, .5, -6, 44), C0(12, [.1, 1.42, -2.2], 3.4, .5, 10, 44)])],
      [12, cine([C0(12, [.1, 1.42, -2.2], 3.4, .5, 10, 44), C0(dur, [.1, 1.42, -2.2], 3.8, .5, -8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-46: silver-ware shop, granules poured into a small scale, display shows 96-101
  function s3(dur) {
    const Wd = kW(); shop(Wd); const sc = scaleProp(Wd), bw = bowlPour(Wd, sc), spk = sparks(Wd, 10, [0, 2.0, SZ_], 1.0, 0xe6f0ff, .12);
    Wd.on(t => { const pk = clamp((t - 2.6) / 7.6, 0, 1), fin = t > 11.4; sc.setHeap(sm(pk) * .9 + .1 * (pk > 0 ? 1 : 0), .3 * sm(pk)); sc.draw(96 * sm(pk), fin, .5 + .5 * Math.sin(t * 3)); sc.zone(fin ? .55 + .2 * Math.sin(t * 3) : 0);
      bw.set(2.6, 10.2, t); spk(t, sm(P(2.5, 5, t))); });
    abba(Wd, t => ({ pos: [-1.85, 0, -1.55], sit: false, groundY: 0, facing: .95, gesture: t < 2 ? 'rest' : (t > 11.6 ? 'thumb' : null), perform: t > 2 && t < 11.6 ? .25 : 0, smile: .6, look: .3 }));
    manK(Wd, SHOP, t => ({ pos: [1.5, 0, -2.6], facing: -.15, gesture: t < 10.4 ? 'explain' : 'rest', perform: 0, smile: .6, talk: t > 1 && t < 10 ? .3 * talkAmt(t, 4) : 0, look: -.1 }), .8);
    Wd.occ = [bw.g]; Wd.center = [0, -2.2];
    Wd.cam = seq([0, cine([C0(0, [-.3, 1.6, -2.0], 4.2, .5, -10, 44), C0(5, [-.3, 1.6, -2.0], 3.7, .5, 6, 44)])],
      [5, cine([C0(5, [-.3, 1.6, -2.0], 3.7, .5, 6, 44), C0(11, [-.25, 1.6, -2.0], 3.5, .5, -6, 44)])],
      [11, cine([C0(11, [-.25, 1.6, -2.0], 3.5, .5, -6, 44), C0(dur, [-.1, 1.65, -2.0], 3.9, .6, 8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 46-60: close-up of the scale: the number rolls up and stops in the green zone; the tag glows
  function s4(dur) {
    const Wd = kW(); shop(Wd); const sc = scaleProp(Wd), bw = bowlPour(Wd, sc), tg = bb(Wd, 1.0, .4, drawSilverTag, 512), spk = sparks(Wd, 10, [0, 2.0, SZ_], .9, 0xe6f0ff, .12), shk = shock(Wd, 0x6dff9a);
    Wd.on(t => { const pk = clamp((t - 1.0) / 6.6, 0, 1), fin = t > 8.0; sc.setHeap(sm(pk) * .85 + .15, .35 * sm(pk) + (fin ? .3 : 0)); sc.draw(96 * sm(pk), fin, .5 + .5 * Math.sin(t * 3)); sc.zone(fin ? .6 + .2 * Math.sin(t * 3) : 0);
      bw.set(1.0, 7.4, t); tg.set([.85, 2.25 + bob(t, 1), SZ_ + .2], 1.0 * popE(P(8.2, 9.2, t)), .03 * Math.sin(t * 1.7)); shk.set([.85, 2.25, SZ_ + .2], P(8.2, 9.0, t), .9); spk(t, sm(P(.5, 3, t)) * .8 + fin * .3); });
    abba(Wd, t => ({ pos: [-1.85, 0, -1.55], sit: false, groundY: 0, facing: .95, gesture: null, perform: .2, smile: .6, look: .3, hidden: true }));
    manK(Wd, SHOP, t => ({ pos: [1.7, 0, -2.6], facing: -.15, gesture: 'explain', perform: 0, smile: .6, talk: t < 8 ? .25 * talkAmt(t, 4) : 0, look: -.1 }), .8);
    Wd.occ = [bw.g, tg.g]; Wd.center = [0, -2.2];
    Wd.cam = seq([0, cine([C0(0, [0, 1.52, -1.95], 3.0, .35, -8, 44), C0(5, [0, 1.52, -1.95], 2.8, .3, 6, 44)])],
      [5, cine([C0(5, [0, 1.52, -1.95], 2.8, .3, 6, 44), C0(10, [.05, 1.52, -1.95], 2.7, .3, -6, 44)])],
      [10, cine([C0(10, [.05, 1.52, -1.95], 2.7, .3, -6, 44), C0(dur, [.1, 1.56, -1.95], 3.0, .35, 8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 60-76: Abba hands the pouch over the silver tray to the Kohen; green check
  function s5(dur) {
    const Wd = kW(); hall(Wd, [-1.2, 1.2]); const pc = sack(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), spk = sparks(Wd, 12, [0, 1.9, TZ], .7, 0xffe9a8, .13);
    const A = [-.3, 1.12, TZ - .3], M = [0, 1.5, TZ - .3], Kp = [.3, 1.12, TZ - .3];
    Wd.on(t => { const a = popE(P(.3, 1.2, t)), u = sm(P(2.4, 6.4, t)); let p; if (u < .5) p = arcPt(A, M, u * 2, .0); else p = arcPt(M, Kp, (u - .5) * 2, .0);
      const lift = Math.sin(PI * u) * .05; pc.set([p[0], p[1] + lift + bob(t, 1) * .6, p[2]], (.85 + .1 * Math.sin(PI * u)) * a, (u - .5) * -.7, .06 * Math.sin(t * 2), .3 + .4 * sm(P(6, 8, t)));
      ck.set([0, 2.15 + .05 * Math.sin(t * 3), TZ - .3], popE(P(7.2, 8.2, t)) * .62, .05 * Math.sin(t * 3)); sk.set([0, 2.15, TZ - .3], P(7.2, 8.1, t), .8); spk(t, sm(P(5.5, 8, t))); });
    abba(Wd, t => ({ pos: [-1.2, RBM, SZ], facing: .3, gesture: t < 7 ? 'offer' : null, perform: t < 7 ? 0 : .3, smile: .5, look: .2 }));
    kohen(Wd, t => ({ pos: [1.2, RBM, SZ], facing: -.3, gesture: t > 2.5 && t < 11 ? 'offer' : null, perform: t > 2.5 && t < 11 ? 0 : .3, smile: .5 + .4 * sm(P(7, 9, t)), look: -.2 }));
    mendy(Wd, t => ({ pos: [1.8, 0, SZ + .25], facing: -.5, gesture: null, perform: .2, smile: .5 + .4 * sm(P(8, 10, t)), brow: 0, look: -.3 }));
    Wd.occ = [pc.g, ck.g]; Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [0, 1.35, -2.2], 3.2, .5, -10, 44), C0(6, [0, 1.35, -2.2], 2.9, .5, 6, 44)])],
      [6, cine([C0(6, [0, 1.35, -2.2], 2.9, .5, 6, 44), C0(12, [0, 1.4, -2.2], 3.0, .5, -6, 44)])],
      [12, cine([C0(12, [0, 1.4, -2.2], 3.0, .5, -6, 44), C0(dur, [0, 1.45, -2.2], 3.3, .6, 6, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-90: comparison - coins with a small plain check vs the pouch with a big golden star "mehudar"
  function s6(dur) {
    const Wd = kW(); hall(Wd); const cp = coinPile(Wd), pc = sack(Wd), tg = bb(Wd, 1.15, .4, drawBuyTag, 640), st = bb(Wd, 1.3, 1.3, drawStar, 512), ckS = mark3d(Wd, 'check', 1.0), ckB = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0xffd166), spk = sparks(Wd, 14, [.66, 2.0, TZ], .6, 0xffe9a8, .13);
    Wd.on(t => { const a = popE(P(.4, 1.3, t));
      cp.set([-.66, 1.62 + bob(t, 0), TZ - .45], 1.0 * a, .5 + .3 * Math.sin(t * .8), .35);
      pc.set([.66, 1.3 + bob(t, 2), TZ - .45], 1.0 * a, .3 * Math.sin(t * .7), .04 * Math.sin(t * 1.4), .4 + .3 * sm(P(5, 7, t)));
      tg.set([-.52, 1.28 + bob(t, 1), TZ - .1], .78 * popE(P(1.4, 2.2, t)), .03 * Math.sin(t * 1.6));
      ckS.set([-.66, 2.2 + .03 * Math.sin(t * 2.4), TZ + .1], .3 * popE(P(3.0, 3.8, t)), .05 * Math.sin(t * 2.6));
      st.set([.66, 2.3 + bob(t, 3) * 1.5, TZ + .1], .6 * popE(P(5.0, 6.2, t)), .06 * Math.sin(t * 1.9)); sk.set([.66, 2.3, TZ + .1], P(5.0, 6.0, t), .9); spk(t, sm(P(5, 7, t))); });
    abba(Wd, t => ({ facing: .3, gesture: t < 5 ? 'explain' : null, perform: t < 5 ? 0 : .3, smile: .5, talk: t > 1 && t < 5 ? .25 * talkAmt(t, 3) : 0, look: .2 }));
    kohen(Wd, t => ({ facing: -.3, gesture: null, perform: .3, smile: .5, look: -.2 }));
    mendy(Wd, t => ({ pos: [2.15, 0, SZ + .25], facing: -.5, gesture: t > 8 ? 'think' : null, perform: t > 8 ? 0 : .25, smile: .4, brow: .2, look: -.3 }));
    Wd.occ = [cp.g, pc.g, tg.g, st.g, ckS.g]; Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [0, 1.6, -2.2], 3.7, .5, 10, 44), C0(5, [0, 1.6, -2.2], 3.5, .5, -6, 44)])],
      [5, cine([C0(5, [0, 1.6, -2.2], 3.5, .5, -6, 44), C0(9, [.1, 1.6, -2.2], 3.4, .5, 8, 44)])],
      [9, cine([C0(9, [.1, 1.6, -2.2], 3.4, .5, 8, 44), C0(dur, [.05, 1.65, -2.2], 3.7, .6, -8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 90-100: Mendy smiles with a thumbs-up; Abba and the Kohen shake hands; warm light
  function s7(dur) {
    const Wd = kW(); hall(Wd, [-1.5, 1.5]); const gl = glowAt(Wd.scene, 2.6, 0xffe08a, 0), spk = sparks(Wd, 14, [0, 2.15, SZ + .3], .6, 0xfff0b0, .13);
    Wd.on(t => { gl.position.set(0, 1.4, SZ - .6); gl.material.opacity = .3 * sm(P(1, 4, t)); spk(t, sm(P(1, 3, t))); });
    manK(Wd, ABBA, t => ({ pos: [-.5, 0, SZ + .1], facing: .75, gesture: 'offer', perform: 0, smile: .9, talk: 0, look: .2 }), .5);
    manK(Wd, KOHEN, t => ({ pos: [.5, 0, SZ + .1], facing: -.75, gesture: 'offer', perform: 0, smile: .9, talk: 0, look: -.2 }), .3);
    boyK(Wd, MENDY, t => ({ pos: [1.95, 0, SZ + .35], facing: -.6, gesture: t > 1.6 ? 'thumb' : null, perform: t > 1.6 ? 0 : .25, smile: .9 + .1 * sm(P(.5, 2, t)), brow: 0, look: -.3, groundY: 0 }));
    Wd.occ = []; Wd.center = [0, SZ];
    Wd.cam = seq([0, cine([C0(0, [.5, 1.35, -2.3], 3.6, .5, -10, 44), C0(5, [.5, 1.35, -2.3], 3.2, .5, 8, 44)])],
      [5, cine([C0(5, [.5, 1.35, -2.3], 3.2, .5, 8, 44), C0(dur, [.45, 1.4, -2.3], 3.6, .6, -8, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120
  function answerBg(dur) {
    const Wd = kW(); hall(Wd, [-.58, .58]); const pc = sack(Wd), gl = glowAt(Wd.scene, 2.4, 0xffe08a, .35);
    gl.position.set(0, 1.0, TZ + .05);
    Wd.on(t => { pc.set([0, .98 + bob(t, 1) * 1.2, TZ + .1], 1.5, .25 * Math.sin(t * .8), .04 * Math.sin(t * 1.3), .5 + .15 * Math.sin(t * 2.4)); });
    manK(Wd, ABBA, t => Object.assign({ pos: [-.58, RBM, SZ], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }, SIT), .5);
    manK(Wd, KOHEN, t => Object.assign({ pos: [.58, RBM, SZ], facing: 0, smile: 1, perform: .5, talk: .4 * talkAmt(t, 3) }, SIT), .3);
    Wd.occ = [pc.g]; Wd.center = [0, SZ]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
