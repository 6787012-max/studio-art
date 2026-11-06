// yomit-09 story: "מאכל חלבי על הפלטה" (Halacha Yomit #9) - storyboards_v10.md section A.
// No people. Heroes: THE PLATA (hot plate, face on front edge), THE DAIRY POT (blue tag "חלבי", face), THE FOIL ROLL (face on its end cap).
// Diagram beats: heat from the plata, red cross between pot and plate, foil sheet unrolling across the plate top, green check.
// Scenes: hook 0-14, then s1 14-28, s2 28-42, s3 42-56, s4 56-72 (16 s), s5 72-86, s6 86-100, answer 100-120.
window.STORY = function (K) {
  const { THREE, box, cyl, mkWorld, cuts, pushIn, pullOut, truck, orbitShot, crane, insert, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, glowAt, texPlane, canvasTex, bill, fitText, FONT, arcPt, plainRoom, lighting, windowUnit } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const TOPY = .96;                       // counter top
  const PX = .9, PZ = -3.85;              // plata centre on the counter
  const SURF = TOPY + .27;                // plata top surface (foil sheet sits here)
  const DX = -1.0, DZ = -3.55;            // dairy pot rest spot (left of the plata)
  const RXP = PX + .85;                   // foil roll parked spot (right of the plata, close enough to feed the sheet)
  const AX = -1.5, AR = 1.1;              // answer layout: plata left, roll right (both inside the frame, card above the plata)
  const bob = (t, k) => .03 * Math.sin(t * 1.8 + k);

  // ---------------------------------------------------------------- tags
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54); };
  const drawDairy = drawTag('חלבי', '#d9eaff', '#14408f', '#2f6ad0');

  // ---------------------------------------------------------------- steam puffs (heat waves)
  function steam(Wd, n, tint) {
    const tex = canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(.5, 'rgba(240,240,236,.6)'); r.addColorStop(1, 'rgba(220,226,236,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); });
    const sp = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: 0 })); if (tint) s.material.color.set(tint); s.renderOrder = 7; s.visible = false; Wd.add(s); sp.push(s); }
    return (t, c, k, w) => sp.forEach((s, i) => { const ph = (t * .26 + i / n) % 1; s.visible = k > .01; if (!s.visible) return;
      s.position.set(c[0] + Math.sin(i * 2.3 + t * .8) * .07 * (1 + ph * 2), c[1] + ph * 1.0, c[2] + Math.cos(i * 1.7) * .05); const sc = (w || .4) * (.55 + ph * 1.3); s.scale.set(sc, sc, 1); s.material.opacity = k * .85 * Math.pow(Math.sin(PI * ph), .8); });
  }

  // ---------------------------------------------------------------- the hot plate (plata)
  function mkPlata(Wd, x, z) {
    const g = new THREE.Group(); g.position.set(x, TOPY, z); Wd.add(g);
    g.add(box(1.3, .26, .9, 0x3c4048, { pos: [0, .13, 0] }));
    const burners = [-.3, .3].map(bx => { const b = cyl(.17, .17, .02, 0x2a2d33, { pos: [bx, .27, -.1], ink: false }); b.material.emissive = new THREE.Color(0); g.add(b); return b; });
    const strips = [-.4, 0, .4].map(sx => { const b = box(.3, .03, .02, 0xff7a2a, { pos: [sx, .03, .456], ink: false }); b.material.emissive = new THREE.Color(0); g.add(b); return b; });
    const sheet = box(1.3, .012, .9, 0xe4eaf2, { pos: [0, .27, 0], ink: false }); sheet.material.emissive = new THREE.Color(0x2a2e36); sheet.visible = false; g.add(sheet);
    const f = face(Wd, { w: .4, parent: g, pos: [0, .1, .47], seed: 3 });
    const gl = glowAt(Wd.scene, 2.4, 0xff7a2a, 0); gl.position.set(x, TOPY + .3, z + .2);
    return {
      g, f,
      heat(h) { const k = clamp(h, 0, 1); burners.forEach(b => b.material.emissive.setRGB(k, .42 * k, .1 * k)); strips.forEach(b => b.material.emissive.setRGB(k, .42 * k, .1 * k)); gl.material.opacity = .35 * k; },
      unroll(e) { const u = clamp(e, 0, 1); sheet.visible = u > .01; sheet.scale.x = Math.max(.001, u); sheet.position.x = .65 - .65 * u; },
    };
  }

  // ---------------------------------------------------------------- the dairy pot
  function mkPot(Wd, seed) {
    const g = new THREE.Group(); Wd.add(g);
    g.add(cyl(.2, .22, .3, 0xbfe6ff, { pos: [0, .15, 0] }));
    g.add(cyl(.215, .215, .035, 0x8fc3ec, { pos: [0, .31, 0], ink: false }));
    g.add(box(.16, .03, .03, 0x6a7a8a, { pos: [.27, .24, 0], ink: false }));
    const f = face(Wd, { w: .26, parent: g, pos: [0, .15, .215], seed });
    return { g, f, set(p) { g.position.set(p[0], p[1], p[2]); } };
  }

  // ---------------------------------------------------------------- the foil roll (axis along z, rolls along x)
  function mkRoll(Wd, seed) {
    const holder = new THREE.Group(); Wd.add(holder);
    const spin = new THREE.Group(); spin.position.set(0, .12, 0); holder.add(spin);
    spin.add(cyl(.12, .12, .5, 0xdfe6ee, { rot: [PI / 2, 0, 0], ink: false }));
    spin.add(box(.035, .035, .52, 0x8a929c, { pos: [.12, 0, 0], ink: false }));
    const f = face(Wd, { w: .3, parent: holder, pos: [0, .12, .27], seed });
    return { holder, f, set(x, z, ang) { holder.position.set(x, TOPY, z); spin.rotation.z = ang || 0; } };
  }

  // ---------------------------------------------------------------- room (counter + back wall, warm colours)
  const kW = () => mkWorld({ skyTop: 0x9ad0f6, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 40, fogFar: 140, hemi: 1.15, sun: 1.0, sunPos: [-14, 26, 16], shadowExt: 14 });
  function room(Wd) {
    plainRoom(Wd, { HX: 6.2, HZ: 4.6, H: 3.5, beams: false, wall: 0xf3d9a8 });
    Wd.add(box(7.0, .9, .9, 0xc9a574, { pos: [0, .45, -3.9] }));
    Wd.add(box(7.0, .06, .95, 0x6a5a48, { pos: [0, .93, -3.9] }));
    windowUnit(Wd, -3.2, 1.2, -4.57, 0, 1.4, 1.8);
    Wd.add(box(2.6, .8, .4, 0xb98a58, { pos: [2.0, 2.4, -4.4] }));
    lighting(Wd, () => ({ hemi: 1.15, sun: 1.0, hemiColor: 0xfff1d8, sunColor: 0xfff1dc }));
  }

  // ---------------------------------------------------------------- 1. HOOK 0-14: the dairy pot looks at the glowing plata, a "?" floats
  function hook(dur) {
    const Wd = kW(); room(Wd);
    const pl = mkPlata(Wd, PX, PZ), pot = mkPot(Wd, 5), st = steam(Wd, 7, 0xffd9b0);
    Wd.on(t => {
      pl.heat(.55 + .15 * Math.sin(t * 2.2)); pl.unroll(0);
      pl.f.set(t, { smile: .2, look: [0, 0], open: 1 });
      pot.set([DX, TOPY, DZ]); pot.f.set(t, { smile: .3, look: [1, 0], open: 1 });
      st(t, [PX, SURF + .05, PZ], .75, .4);
    });
    Wd.occ = [pl.g, pot.g]; Wd.center = [-.1, -3.7]; Wd.qSize = .9; Wd.qPos = [DX + .1, DZ];
    Wd.cam = cuts([
      [4.2, HH(pullOut([DX, 1.1, DZ], { dur: 4.2, dist0: 1.3, dist1: 2.7, h0: .08, h1: .5, a0: -12, a1: 8, fov0: 30, fov1: 40 }), 1)],
      [4.8, HH(punch(orbitShot([(DX + PX) / 2, 1.2, DZ + .1], { dur: 4.8, dist0: 3.4, dist1: 3.2, h0: .45, h1: .6, a0: -26, a1: 14, fov0: 40, fov1: 40 }), [2.2]), 2)],
      [5.0, HH(insert([PX, 1.2, PZ + .3], { dur: 5, dist0: 1.7, dist1: 1.35, h0: .25, h1: .3, a0: 14, a1: -6, fov0: 36, fov1: 34 }), 3)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: plata wakes up, heat rises
  function s1(dur) {
    const Wd = kW(); room(Wd);
    const pl = mkPlata(Wd, PX, PZ), pot = mkPot(Wd, 5), st = steam(Wd, 7);
    Wd.on(t => {
      const wake = sm(P(.3, 1.8, t));
      pl.heat(.25 + .6 * wake * (.85 + .15 * Math.sin(t * 6)));
      st(t, [PX, SURF + .05, PZ], sm(P(1.2, 3, t)) * .8, .42);
      pl.f.set(t, { open: wake, smile: .6 * wake, look: [0, .2], talk: t > 2.5 ? talkAmt(t, 1) : 0 });
      pot.set([DX, TOPY, DZ]); pot.f.set(t, { smile: .3, look: [1, 0] });
    });
    Wd.occ = [pl.g, pot.g]; Wd.center = [-.1, -3.7];
    Wd.cam = cuts([
      [4, HH(truck([-.05, 1.05, -3.7], { dur: 4, dist0: 5.0, dist1: 4.8, h0: .45, h1: .5, a0: -6, a1: 6, fov0: 42, fov1: 42, shift: [0, 0, 0] }), 4)],
      [5, HH(pushIn([PX - .35, 1.15, PZ], { dur: 5, dist0: 3.6, dist1: 2.9, h0: .3, h1: .25, a0: -6, a1: 4, fov0: 42, fov1: 40 }), 5)],
      [5, HH(insert([PX, 1.2, PZ + .3], { dur: 5, dist0: 1.9, dist1: 1.6, h0: .2, h1: .2, a0: 10, a1: -4, fov0: 36, fov1: 34 }), 6)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-42: the dairy pot hops in from the left, blue tag pops, plata looks at it
  function s2(dur) {
    const Wd = kW(); room(Wd);
    const pl = mkPlata(Wd, PX, PZ), pot = mkPot(Wd, 5), tg = bb(Wd, 1.3, .5, drawDairy, 520), st = steam(Wd, 6);
    const potAt = t => arcPt([-3.2, TOPY, DZ], [DX, TOPY, DZ], sm(P(.2, 1.8, t)), .6);
    Wd.on(t => {
      pl.heat(.7 + .1 * Math.sin(t * 2.2)); pl.unroll(0);
      pl.f.set(t, { open: 1, smile: .3, look: [-.9, 0], talk: 0 });
      const pp = potAt(t); pot.set(pp);
      pot.f.set(t, { smile: .5, look: [1, 0], talk: t > 2.6 ? talkAmt(t, 2) : 0 });
      tg.set([pp[0], TOPY + .6, DZ], popE(P(2.2, 3.0, t)) * .9, .03 * Math.sin(t * 1.7));
      st(t, [PX, SURF + .05, PZ], .5, .4);
    });
    Wd.occ = [pl.g, pot.g, tg.g]; Wd.center = [-.1, -3.7];
    Wd.cam = cuts([
      [4, HH(punch(truck([-.05, 1.05, -3.7], { dur: 4, dist0: 5.0, dist1: 4.8, h0: .4, h1: .4, a0: -10, a1: 6, fov0: 42, fov1: 42, shift: [0, 0, 0] }), [2.3]), 7)],
      [5, HH(pushIn([DX + .2, 1.15, DZ], { dur: 5, dist0: 3.0, dist1: 2.5, h0: .25, h1: .25, a0: -10, a1: -2, fov0: 42, fov1: 40 }), 8)],
      [5, HH(orbitShot([(DX + PX) / 2, 1.2, DZ], { dur: 5, dist0: 3.6, dist1: 3.4, h0: .35, h1: .4, a0: 14, a1: -14, fov0: 40, fov1: 40 }), 9)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 42-56: the pot stops in the air above the bare plata, red cross pops, pot surprised
  function s3(dur) {
    const Wd = kW(); room(Wd);
    const pl = mkPlata(Wd, PX, PZ), pot = mkPot(Wd, 5), tg = bb(Wd, 1.3, .5, drawDairy, 520), cr = mark3d(Wd, 'cross', .9), sk = shock(Wd, 0xff5a5a), st = steam(Wd, 5, 0xffb070);
    const HOV = SURF + .55, XR = [PX + .55, 1.5, PZ + .5];
    const potAt = t => { const u = sm(P(0, 3.0, t)); const p = arcPt([DX, TOPY, DZ], [PX, HOV, PZ + .2], u, .45); if (t > 3.0) p[1] += .02 * Math.sin(t * 4); return p; };
    Wd.on(t => {
      pl.heat(.85 + .1 * Math.sin(t * 5)); pl.unroll(0);
      const pp = potAt(t); pot.set(pp);
      pot.f.set(t, { open: 1, smile: .3 - .9 * sm(P(3.0, 3.5, t)), surprise: sm(P(3.0, 3.4, t)), look: [0, .4], talk: t > 3.6 ? talkAmt(t, 3) : 0 });
      tg.set([pp[0], pp[1] + .45, pp[2]], popE(P(.1, .9, t)) * .9, .03 * Math.sin(t * 1.6));
      pl.f.set(t, { open: 1, smile: -.2 * sm(P(3.2, 3.8, t)), surprise: .4 * sm(P(3.2, 3.8, t)), look: [0, .8], talk: 0 });
      cr.set(XR, popE(P(3.2, 4.0, t)) * .6, .05 * Math.sin(t * 3));
      sk.set(XR, P(3.2, 3.9, t), 1.3);
      st(t, [PX, SURF + .05, PZ], .6, .4);
    });
    Wd.occ = [pl.g, pot.g, tg.g, cr.g]; Wd.center = [.2, -3.7];
    Wd.cam = cuts([
      [4, HH(punch(pushIn([PX - 1.0, 1.4, PZ + .2], { dur: 4, dist0: 4.6, dist1: 3.6, h0: .5, h1: .3, a0: -22, a1: -4, fov0: 44, fov1: 42 }), [3.2]), 10)],
      [5, HH(orbitShot([PX, 1.45, PZ + .2], { dur: 5, dist0: 3.5, dist1: 3.2, h0: .25, h1: .35, a0: 30, a1: -12, fov0: 40, fov1: 38 }), 11)],
      [5, HH(insert([PX + .4, 1.5, PZ + .3], { dur: 5, dist0: 1.8, dist1: 1.5, h0: .15, h1: .25, a0: -6, a1: 4, fov0: 36, fov1: 34 }), 12)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 56-72 (16 s): pot steps back, foil roll rolls in, the foil sheet unrolls across the plata
  function s4(dur) {
    const Wd = kW(); room(Wd);
    const pl = mkPlata(Wd, PX, PZ), pot = mkPot(Wd, 5), roll = mkRoll(Wd, 9), sp = shock(Wd, 0xffffff);
    const HOV = SURF + .55;
    const potAt = t => arcPt([PX, HOV, PZ + .2], [DX, TOPY, DZ], sm(P(0, 2.4, t)), .5);
    Wd.on(t => {
      pl.heat(.7 + .1 * Math.sin(t * 2.2));
      const e = sm(P(3.4, 8.0, t)), rx = lerp(4.3, RXP, sm(P(.6, 3.2, t)));
      pl.unroll(e);
      roll.set(rx, PZ + .15, -(4.3 - rx) / .12 - e * 2.5);
      roll.f.set(t, { open: 1, smile: .8 * sm(P(2.5, 3.5, t)), look: [-1, 0] });
      pot.set(potAt(t)); pot.f.set(t, { open: 1, smile: .3 + .5 * sm(P(4, 7, t)), look: [1, 0] });
      pl.f.set(t, { open: 1, smile: .9, look: [0, .1], talk: t > 1 ? talkAmt(t, 1) : 0 });
      sp.set([PX + .2, SURF + .05, PZ + .2], P(7.6, 8.5, t), 1.8);
    });
    Wd.occ = [pl.g, pot.g, roll.holder]; Wd.center = [.6, -3.7];
    Wd.cam = cuts([
      [4, HH(truck([1.8, 1.1, -3.7], { dur: 4, dist0: 4.9, dist1: 4.6, h0: .4, h1: .45, a0: -8, a1: 6, fov0: 42, fov1: 42, shift: [1.2, 0, 0] }), 12)],
      [6, HH(punch(insert([RXP - .15, 1.15, PZ + .1], { dur: 6, dist0: 1.9, dist1: 1.6, h0: .45, h1: .4, a0: 24, a1: 10, fov0: 36, fov1: 34 }), [3.6]), 13)],
      [6, HH(pullOut([PX, 1.2, PZ + .2], { dur: 6, dist0: 2.4, dist1: 3.8, h0: .35, h1: .6, a0: 6, a1: -6, fov0: 38, fov1: 42 }), 14)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 72-86: the dairy pot lands softly on the foil, small bounce, all three smile
  function s5(dur) {
    const Wd = kW(); room(Wd);
    const pl = mkPlata(Wd, PX, PZ), pot = mkPot(Wd, 5), roll = mkRoll(Wd, 9), tg = bb(Wd, 1.3, .5, drawDairy, 520), sk = shock(Wd, 0xffffff);
    const LAND = 3.2;
    const potAt = t => { const p = arcPt([DX, TOPY, DZ], [PX, SURF + .02, PZ], sm(P(.6, LAND, t)), .9); if (t > LAND) p[1] += .035 * Math.exp(-(t - LAND) * 4) * Math.abs(Math.sin((t - LAND) * 12)); return p; };
    Wd.on(t => {
      pl.heat(.4 + .1 * Math.sin(t * 2)); pl.unroll(1);
      const pp = potAt(t); pot.set(pp);
      tg.set([pp[0], pp[1] + .6, pp[2]], popE(P(.3, 1.2, t)) * .85, .03 * Math.sin(t * 1.6));
      sk.set([PX, SURF + .05, PZ], P(LAND, LAND + .9, t), 1.6);
      pot.f.set(t, { open: 1, smile: .4 + .6 * sm(P(LAND, LAND + 1.5, t)), look: [0, 0], talk: t > 3.6 ? talkAmt(t, 2) : 0 });
      pl.f.set(t, { open: 1, smile: .2 + .8 * sm(P(3.4, 4.6, t)), look: [0, -.2] });
      roll.set(RXP, PZ + .15, -(4.3 - RXP) / .12 - 2.5);
      roll.f.set(t, { open: 1, smile: .8 * sm(P(1, 2.5, t)), look: [-.8, 0] });
    });
    Wd.occ = [pl.g, pot.g, roll.holder, tg.g]; Wd.center = [.2, -3.7];
    Wd.cam = cuts([
      [4, HH(punch(truck([(DX + PX) / 2, 1.2, -3.7], { dur: 4, dist0: 4.5, dist1: 4.3, h0: .5, h1: .5, a0: -10, a1: 6, fov0: 42, fov1: 42, shift: [-.8, 0, 0] }), [LAND]), 15)],
      [5, HH(insert([PX, 1.45, PZ + .2], { dur: 5, dist0: 2.1, dist1: 1.9, h0: .25, h1: .15, a0: -14, a1: -2, fov0: 36, fov1: 34 }), 16)],
      [5, HH(crane([PX, 1.3, PZ + .1], { dur: 5, dist0: 3.6, dist1: 3.2, h0: .2, h1: 1.3, a0: 4, a1: -4, fov0: 42, fov1: 40 }), 17)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 86-100: steam rises from the covered plata with the pot, big green check, slow orbit
  function s6(dur) {
    const Wd = kW(); room(Wd);
    const pl = mkPlata(Wd, PX, PZ), pot = mkPot(Wd, 5), roll = mkRoll(Wd, 9), st = steam(Wd, 7), ck = mark3d(Wd, 'check', 1.1), sk = shock(Wd, 0x6dff9a);
    const CK = [PX + .35, SURF + .85, PZ + .3];   // above the pot, inside the frame
    Wd.on(t => {
      pl.unroll(1); pl.heat(.4 + .1 * Math.sin(t * 2));
      pot.set([PX, SURF + .02, PZ]); pot.f.set(t, { open: 1, smile: 1, look: [0, 0], talk: t < 9 ? talkAmt(t, 2) : 0 });
      pl.f.set(t, { open: 1, smile: 1, look: [0, .1] });
      roll.set(RXP, PZ + .15, -(4.3 - RXP) / .12 - 2.5);
      roll.f.set(t, { open: 1, smile: 1, look: [-.8, 0] });
      st(t, [PX, SURF + .3, PZ], sm(P(.5, 2.5, t)) * .9, .45);
      ck.set(CK, popE(P(3.0, 3.6, t)) * 1.0, .05 * Math.sin(t * 3));
      sk.set(CK, P(3.0, 3.6, t), 2.0);
    });
    Wd.occ = [pl.g, pot.g, roll.holder, ck.g]; Wd.center = [.2, -3.7];
    Wd.cam = cuts([
      [5, HH(punch(orbitShot([PX, 1.25, PZ], { dur: 5, dist0: 3.4, dist1: 3.2, h0: .35, h1: .5, a0: -24, a1: 20, fov0: 40, fov1: 40 }), [3.0]), 18)],
      [5, HH(insert([PX - .1, 1.35, PZ + .3], { dur: 5, dist0: 1.9, dist1: 1.7, h0: .2, h1: .3, a0: 6, a1: -2, fov0: 36, fov1: 34 }), 19)],
      [4, HH(crane([PX, 1.5, PZ], { dur: 4, dist0: 3.6, dist1: 4.2, h0: .25, h1: .8, a0: 0, a1: -6, fov0: 42, fov1: 42 }), 20)]]);
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: covered plata with the steaming dairy pot, three faces smiling, slow crane
  function answerBg(dur) {
    const Wd = kW(); room(Wd);
    const pl = mkPlata(Wd, AX, PZ), pot = mkPot(Wd, 5), roll = mkRoll(Wd, 9), st = steam(Wd, 7);
    Wd.on(t => {
      pl.unroll(1); pl.heat(.4 + .1 * Math.sin(t * 2));
      pot.set([AX, SURF + .02, PZ]); pot.f.set(t, { open: 1, smile: 1, look: [0, 0], talk: .5 * talkAmt(t, 2) });
      pl.f.set(t, { open: 1, smile: 1, look: [0, 0] });
      roll.set(AR, PZ + .15, -(4.3 - AR) / .12 - 2.5);
      roll.f.set(t, { open: 1, smile: 1, look: [-.8, 0] });
      st(t, [AX, SURF + .3, PZ], .8, .45);
    });
    Wd.occ = [pl.g, pot.g, roll.holder]; Wd.center = [AX, PZ + 1.0]; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([AX, 2.2, PZ + 1.0], { dur: 20, dist0: 7.2, dist1: 6.0, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
