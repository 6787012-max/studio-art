// yomit-08 story: "Challot baked in a meat oven - with cheese?" (halacha yomit, R' Fried) - 3D choreography per storyboards_v9.md (A).
// Abba (adult man, white shirt) + Shmulik (12). Bright home kitchen with a built-in oven. The oven glows warm inside but NO open flame is drawn;
// Abba handles the oven (door opens / closes by itself), the boy never touches it and stays well to the left.
// Tags: red = meat, blue = dairy, white/green = pareve.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mesh, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, mkWorld, plainRoom, diningTable, chair, mark3d, popE, lighting, glowAt, glowSprite,
    canvasTex, texPlane, toon, FONT, fitText, arcPt, shock, bill, windowUnit, person } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C0 = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? .0001 : ly];
  const OVX = 2.8, TOPY = .96;                          // oven centre x, counter top
  const PS = 1.25, PANC = [1.35, TOPY + .012, -4.1];                // pan spot on the counter (left of the oven)
  const SHELF_Z = -3.42, IN_Z = -4.22, OVY = .31;       // pan z on the open door / inside the oven, pan base level inside
  const TX = .5, TZ = -1.7, TTOP = .78;                 // dining table centre x / z / plate level
  const SKIN = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
  const ABBA = { beardLen: .8, beard: '#3a2618', skin: SKIN[1], pants: '#1b1d24', coat: '#f3f3ee' };   // white shirt
  const SHM = 2;
  const hsl = c => new THREE.Color(c);

  // ---------------------------------------------------------------- people (kippa found by shape, dark navy, never scaled)
  const findKippa = (Pn) => { let done = false; return () => { if (done || !Pn.figure) return; done = true;
    Pn.figure.group.traverse(m => { if (m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.thetaLength > .7 && m.geometry.parameters.thetaLength < .95) { Pn.kippa = m; m.material = m.material.clone(); m.material.color.set(0x1f2f70); } }); }; };
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(findKippa(Pn)); return Pn; };
  const manK = (Wd, look, fn, seed) => {
    const Pn = person(Wd, Object.assign({ kind: 'man', hat: 'kippa', glasses: false }, look), t => Object.assign({ seed: seed }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(Pn);
    Wd.on(findKippa(Pn)); return Pn;
  };
  const abba = (Wd, fn) => manK(Wd, ABBA, t => Object.assign({ pos: [3.8, 0, -3.15], facing: -.75, smile: .5 }, fn(t)), .5);
  const shmulik = (Wd, fn) => boyK(Wd, SHM, t => Object.assign({ pos: [.05, 0, -3.25], facing: .5, scale: 1.0, smile: .5, groundY: 0 }, fn(t)));

  // ---------------------------------------------------------------- billboards / tags
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = border; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54); };
  const drawMeat = drawTag('בשרי', '#ffdcdc', '#8a1010', '#c43030');
  const drawDairy = drawTag('חלבי', '#d9eaff', '#14408f', '#2f6ad0');
  const drawPareve = drawTag('פרווה', '#f6fff2', '#1f6a2a', '#3f9a4a');
  const drawDisp = drawTag('תבנית חד־פעמית', '#eef3f8', '#2a3a4a', '#7a8794');
  const drawPaper = drawTag('נייר אפייה אטום', '#fff4d6', '#5a3a10', '#c9a050');
  const drawToday = (c, W, H) => {   // clock icon + "today"
    c.fillStyle = '#fff6d6'; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = '#d9a63a'; c.stroke();
    const cx = W * .2, cy = H * .5, r = H * .3; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx, cy, r, 0, PI * 2); c.fill(); c.lineWidth = H * .05; c.strokeStyle = '#6a3a00'; c.stroke();
    c.lineCap = 'round'; c.lineWidth = H * .06; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - r * .7); c.moveTo(cx, cy); c.lineTo(cx + r * .5, cy + r * .2); c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, 'היום', { maxW: W * .56, maxLines: 1, max: H * .66, min: H * .2, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#6a3a00'; c.fillText('היום', W * .63, H * .54); };

  // ---------------------------------------------------------------- steam / cloud puffs
  function steam(Wd, n, tint) {
    const tex = canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(.5, 'rgba(236,241,250,.6)'); r.addColorStop(1, 'rgba(220,228,242,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); });
    const sp = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: 0 })); if (tint) s.material.color.set(tint); s.renderOrder = 7; s.visible = false; Wd.add(s); sp.push(s); }
    return (t, c, k, w) => sp.forEach((s, i) => { const ph = (t * .26 + i / n) % 1; s.visible = k > .01; if (!s.visible) return;
      s.position.set(c[0] + Math.sin(i * 2.3 + t * .8) * .07 * (1 + ph * 2), c[1] + ph * 1.0, c[2] + Math.cos(i * 1.7) * .05); const sc = (w || .4) * (.55 + ph * 1.3); s.scale.set(sc, sc, 1); s.material.opacity = k * .85 * Math.pow(Math.sin(PI * ph), .8); });
  }

  // ---------------------------------------------------------------- dough / challah
  function mkLoaf() {   // braided challah, origin = underside centre, long axis = x (about .8 long); bake(u): pale dough -> golden
    const g = new THREE.Group(), parts = [];
    const add = (b, raw, gold) => { g.add(b); parts.push([b, new THREE.Color(raw), new THREE.Color(gold)]); return b; };
    add(ball(.2, 0xd9bd86, { pos: [0, .07, 0], scale: [2.0, .5, .85], ink: false }), 0xd9bd86, 0xc07a1c);
    const raw = [0xf3e3bb, 0xecd9a8, 0xf7ebcb], gold = [0xe29a30, 0xd78a26, 0xeaa844];
    for (let s = 0; s < 3; s++) for (let i = 0; i < 9; i++) { const x = -.34 + i * .085, ph = i * 1.15 + s * 2.094, z = .085 * Math.sin(ph), y = .105 + .035 * Math.cos(ph), k = (i + s) % 3;
      add(ball(.062, raw[k], { pos: [x, y, z], scale: [1.4, .78, 1], rot: [0, .5 * Math.cos(ph), 0], inkW: .006 }), raw[k], gold[k]); }
    const seeds = []; for (let k = 0; k < 16; k++) { const a = k * 2.4; const sd = ball(.011, 0xfff2cf, { pos: [Math.cos(a) * .33 * (.4 + .6 * ((k * 5) % 7) / 6), .17 + .015 * (k % 3), Math.sin(a * 1.7) * .1], ink: false }); sd.visible = false; g.add(sd); seeds.push(sd); }
    return { g, bake(u) { parts.forEach(([m, a, b]) => { m.material.color.copy(a).lerp(b, u); m.material.emissive.setRGB(.1 * u, .05 * u, 0); }); seeds.forEach(s => { s.visible = u > .6; }); } };
  }
  function mkDough(Wd) {   // two braided loaves side by side (z +-), origin = underside centre between them
    const L = [mkLoaf(), mkLoaf()], g = new THREE.Group(); L.forEach(l => g.add(l.g)); g.visible = false; Wd.add(g);
    return { g, set(pos, s, bake, rise, ry) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.rotation.y = ry || 0; g.scale.setScalar(s);
      L.forEach((l, i) => { l.g.position.set(i ? .05 : -.05, 0, (i ? 1 : -1) * .165); l.g.rotation.y = (i ? -1 : 1) * .08; const r = rise || 0; l.g.scale.set(.78 * (1 + .1 * r), .78 * (1 + .34 * r), .78 * (1 + .18 * r)); l.bake(bake || 0); }); } };
  }

  // ---------------------------------------------------------------- pans: meat roasting pan (covered, red band), silver disposable pan, metal tray + baking paper
  function mkPan(Wd, kind) {   // origin = underside centre, about 1.0 x .62
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const R = { g, kind, topY: .04, grey: () => {}, unroll: () => {} };
    if (kind === 'meat') {
      const base = box(1.0, .12, .62, 0x7a2a2a, { pos: [0, .06, 0] }), band = box(1.03, .035, .65, 0xe03a3a, { pos: [0, .075, 0] }), lid = ball(.5, 0xb03a3a, { pos: [0, .12, 0], scale: [1, .42, .62] }), kn = ball(.06, 0x2a2f38, { pos: [0, .33, 0] });
      [base, band, lid, kn].forEach(m => inner.add(m)); for (const sd of [-1, 1]) inner.add(box(.12, .035, .07, 0x2a2f38, { pos: [sd * .57, .1, 0] }));
      const c0 = [base, band, lid].map(m => m.material.color.clone()), greyC = hsl(0x9a9ea6);
      R.grey = u => { [base, band, lid].forEach((m, i) => m.material.color.copy(c0[i]).lerp(greyC, u * (i === 1 ? 1 : .85))); };
      R.topY = .06;
    } else if (kind === 'alu') {
      const sil = 0xdde3ea; const em = new THREE.Color(0x2c333a);
      const bs = box(.9, .02, .52, sil, { pos: [0, .01, 0] }); bs.material.emissive = em; inner.add(bs);
      for (const sz of [-1, 1]) { const w = box(1.0, .075, .02, 0xeaf0f6, { pos: [0, .05, sz * .295], rot: [sz * .38, 0, 0] }); w.material.emissive = em; inner.add(w); }
      for (const sx of [-1, 1]) { const w = box(.02, .075, .62, 0xeaf0f6, { pos: [sx * .475, .05, 0], rot: [0, 0, -sx * .38] }); w.material.emissive = em; inner.add(w); }
      for (let i = 0; i < 6; i++) inner.add(box(.012, .008, .5, 0xc3cbd4, { pos: [-.38 + i * .152, .022, 0], ink: false }));
      R.topY = .03;
    } else {   // 'tray'
      const tr = box(1.0, .03, .62, 0x8f969f, { pos: [0, .015, 0] }); inner.add(tr);
      for (const sz of [-1, 1]) inner.add(box(1.0, .05, .025, 0xa9b0b8, { pos: [0, .045, sz * .3] })); for (const sx of [-1, 1]) inner.add(box(.025, .05, .6, 0xa9b0b8, { pos: [sx * .49, .045, 0] }));
      const sheet = box(.9, .01, .54, 0xd9bf88, { pos: [0, .036, 0], ink: false }); sheet.material.emissive = new THREE.Color(0x2a2418); inner.add(sheet);
      const lines = []; for (let i = 0; i < 5; i++) { const l = box(.9, .002, .012, 0xc9b88e, { pos: [0, .042, -.2 + i * .1], ink: false }); inner.add(l); lines.push(l); }
      const rollG = new THREE.Group(); inner.add(rollG); const roll = cyl(.075, .075, .58, 0xe9dcb8, { rot: [PI / 2, 0, 0] }); rollG.add(roll); rollG.add(box(.02, .02, .58, 0x8a6a30, { pos: [.075, 0, 0], ink: false }));
      R.unroll = u => { const e = clamp(u, 0, 1); sheet.visible = e > .01; sheet.scale.x = Math.max(.001, e); sheet.position.x = -.45 + .45 * e; lines.forEach(l => { l.visible = e > .02; l.scale.x = Math.max(.001, e); l.position.x = -.45 + .45 * e; });
        const rx = -.45 + .9 * e + (e > .999 ? 0 : 0); rollG.position.set(rx + .01, .105, 0); rollG.rotation.z = -e * 9; rollG.visible = e < .985; };
      R.unroll(0); R.topY = .045;
    }
    R.set = (pos, s, ry) => { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.y = ry || 0; };
    return R;
  }

  // ---------------------------------------------------------------- cheese plate (simple yellow wedges)
  function wedgeMesh(len, wd, h, color) {
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(len, -wd / 2); sh.lineTo(len, wd / 2); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); geo.rotateX(-PI / 2);
    const m = mesh(geo, toon(color), {}); m.material.emissive = new THREE.Color(0x2a1c00); return m;
  }
  function mkCheese(Wd) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(cyl(.5, .42, .05, 0xffffff, { pos: [0, .025, 0] })); const rm = new THREE.Mesh(new THREE.TorusGeometry(.46, .02, 8, 40), toon(0x3b6fd0)); rm.rotation.x = PI / 2; rm.position.y = .05; inner.add(rm);
    inner.add(cyl(.34, .34, .012, 0xf3f7fc, { pos: [0, .052, 0], ink: false }));
    [[-.2, -.1, .5, .3], [.02, .12, -2.0, .32], [-.1, .02, 1.9, .3]].forEach(([x, z, ry, len], i) => { const w = wedgeMesh(len, .27, .12, i === 1 ? 0xf9d548 : 0xf6c93a); w.position.set(x, .058, z); w.rotation.y = ry; inner.add(w);
      for (let k = 0; k < 2; k++) { const hx = x + Math.cos(-ry) * (.1 + k * .09), hz = z + Math.sin(-ry) * (.1 + k * .09) + (k ? .02 : -.02); inner.add(ball(.026, 0xd9a21f, { pos: [hx, .184, hz], scale: [1, .35, 1], ink: false })); } });
    return { g, set(pos, s, ry) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.y = ry || 0; } };
  }
  function mkSlice(Wd) {   // a slice of challah with a cheese wedge on it
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(box(.26, .05, .22, 0xf4d9a0, { pos: [0, 0, 0] })); inner.add(box(.265, .035, .03, 0xc9852a, { pos: [0, .005, .11] })); inner.add(box(.265, .035, .03, 0xc9852a, { pos: [0, .005, -.11] }));
    const w = wedgeMesh(.2, .18, .05, 0xf6c93a); w.position.set(-.08, .025, 0); w.rotation.y = .1; inner.add(w);
    return { g, set(pos, s, ry, rz) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.set(0, ry || 0, rz || 0); } };
  }
  function mkBoard(Wd) {   // wooden board (loaves are added by mkDough)
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(box(1.5, .05, .8, 0xb98a58, { pos: [0, .025, 0] })); inner.add(box(1.46, .01, .76, 0xcba06a, { pos: [0, .052, 0], ink: false }));
    return { g, set(pos, s, ry) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.y = ry || 0; } };
  }

  // ---------------------------------------------------------------- the kitchen with the oven
  function ovenUnit(Wd) {
    const X = OVX, ZC = -4.225, D = .75, bodyC = 0xe6eaee, em = [];
    const bx = (w, h, d, col, pos, o) => Wd.add(box(w, h, d, col, Object.assign({ pos }, o || {})));
    bx(.12, 1.9, D, bodyC, [X - .64, .95, ZC]); bx(.12, 1.9, D, bodyC, [X + .64, .95, ZC]); bx(1.4, .3, D, bodyC, [X, .15, ZC]); bx(1.4, .7, D, bodyC, [X, 1.55, ZC]);
    const cv = (w, h, d, col, pos, k) => { const b = bx(w, h, d, col, pos, { ink: false }); b.material.emissive = new THREE.Color(0); em.push([b, k]); return b; };
    cv(1.16, .9, .03, 0xb4631f, [X, .75, -4.58], 1.0); cv(1.16, .03, .7, 0x8a5a30, [X, .315, ZC], .8); cv(1.16, .03, .7, 0x8a5a30, [X, 1.185, ZC], .6); cv(.03, .9, .7, 0x9a5a28, [X - .58, .75, ZC], .8); cv(.03, .9, .7, 0x9a5a28, [X + .58, .75, ZC], .8);
    for (let i = 0; i < 6; i++) bx(.012, .012, .66, 0x555b66, [X - .5 + i * .2, .335, ZC], { ink: false });
    // control strip: static red meat plate + knobs (the boy never touches them)
    const plate = texPlane(.9, .34, drawMeat, { cw: 640, ro: 5 }); plate.position.set(X, 1.58, -3.845); Wd.add(plate);
    for (let i = 0; i < 4; i++) Wd.add(cyl(.045, .045, .05, 0x2a2d34, { pos: [X - .52 + i * .35 + (i > 1 ? .33 : 0), 1.38, -3.84], rot: [PI / 2, 0, 0], ink: false }));
    Wd.add(box(1.22, .03, .03, 0x8fa0b0, { pos: [X, 1.72, -3.84], ink: false }));
    // door: bottom-hinged, opens toward the room by itself
    const door = new THREE.Group(); door.position.set(X, .3, -3.85); Wd.add(door);
    const dc = 0xdfe4ea; door.add(box(1.16, .1, .06, dc, { pos: [0, .05, .03] })); door.add(box(1.16, .12, .06, dc, { pos: [0, .84, .03] }));
    for (const sd of [-1, 1]) door.add(box(.15, .66, .06, dc, { pos: [sd * .505, .45, .03] }));
    const glass = new THREE.Mesh(new THREE.BoxGeometry(.86, .66, .02), toon(0x6a7078, { transparent: true, opacity: .3, depthWrite: false })); glass.position.set(0, .45, .03); glass.renderOrder = 4; glass.material.emissive = new THREE.Color(0); door.add(glass);
    door.add(cyl(.025, .025, 1.0, 0xb8c0ca, { pos: [0, .86, .13], rot: [0, 0, PI / 2] })); for (const sd of [-1, 1]) door.add(box(.04, .04, .08, 0xb8c0ca, { pos: [sd * .45, .86, .09], ink: false }));
    const gl = glowAt(Wd.scene, 2.2, 0xff9a40, 0); gl.position.set(X, .75, -3.7);
    return { set(open, glow) { door.rotation.x = open * (PI / 2 - .015); em.forEach(([b, k]) => b.material.emissive.setRGB(1.0 * k * glow, .46 * k * glow, .1 * k * glow)); glass.material.emissive.setRGB(.5 * glow, .2 * glow, .04 * glow); gl.material.opacity = .22 * glow * (1 - .5 * open); } };
  }
  function kitchen(Wd, o) {
    o = o || {};
    plainRoom(Wd, { HX: 6.2, HZ: 4.6, H: 3.5, beams: false, wall: 0xf8edd2 });
    const L = OVX - .7, R = OVX + .7;
    for (const [x0, x1] of [[-6.1, L], [R, 6.1]]) {
      Wd.add(box(x1 - x0, .9, .7, 0xc9a574, { pos: [(x0 + x1) / 2, .45, -4.25] })); Wd.add(box(x1 - x0, .06, .8, 0x6a5a48, { pos: [(x0 + x1) / 2, .93, -4.22] })); Wd.add(box(x1 - x0, .34, .04, 0xeef2f6, { pos: [(x0 + x1) / 2, 1.13, -4.58], ink: false }));
    }
    windowUnit(Wd, -3.6, 1.15, -4.57, 0, 1.5, 1.9); windowUnit(Wd, 0.9, 1.75, -4.57, 0, 1.7, 1.0);
    Wd.add(box(1.7, .9, .4, 0xb98a58, { pos: [-5.2, 2.55, -4.4] }));
    Wd.add(box(1.0, 2.2, .8, 0xeef2f6, { pos: [5.55, 1.1, -4.1] })); for (const dy of [.6, 1.5]) Wd.add(box(.05, .45, .05, 0x8a929c, { pos: [5.12, dy + .2, -3.68], ink: false }));
    Wd.add(cyl(.2, .2, .4, 0xdfe8f2, { pos: [-1.5, TOPY + .2, -4.2] })); Wd.add(cyl(.21, .21, .06, 0x5a8a5a, { pos: [-1.5, TOPY + .43, -4.2] }));
    const ov = ovenUnit(Wd);
    if (o.table) {
      diningTable(Wd, { x: TX, z: TZ, len: 3.6, wid: 1.1, cloth: 0xffffff, food: false });
      Wd.add(box(3.4, .012, .24, 0xd9a63a, { pos: [TX, TTOP - .004, TZ - .42], ink: false }));
    }
    lighting(Wd, () => ({ hemi: 1.15, sun: 1.0, hemiColor: 0xfff1d8, sunColor: 0xfff1dc }));
    return { ov };
  }
  const kW = () => mkWorld({ skyTop: 0x9ad0f6, skyBottom: 0xfff0d2, fogColor: 0xfff0d8, fogNear: 40, fogFar: 140, hemi: 1.15, sun: 1.0, sunPos: [-14, 26, 16], shadowExt: 14 });
  const bob = (t, k) => .03 * Math.sin(t * 1.8 + k);
  const KT = [2.0, 1.4, -3.8], KH = [2.15, .95, -3.8];   // usual kitchen camera target

  // ---------------------------------------------------------------- 1. HOOK 0-14: the meat oven opens, golden challot come out; a cheese plate with a blue tag on the counter; Shmulik looks from one to the other
  function hook(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const ov = ki.ov; const pan = mkPan(Wd, 'alu'), dg = mkDough(Wd), ch = mkCheese(Wd), tgB = bb(Wd, 1.3, .5, drawDairy, 520), st = steam(Wd, 7), sk = shock(Wd, 0xffd166);
    Wd.on(t => {
      ov.set(sm(P(1.0, 2.8, t)), .55 + .15 * Math.sin(t * 1.4));
      const u = sm(P(2.6, 4.6, t)), v = sm(P(5.0, 7.2, t)); let pp = [OVX, OVY, lerp(IN_Z, SHELF_Z, u)]; if (v > 0) pp = [lerp(OVX, OVX - .3, v), lerp(OVY, 1.2, v) + .03 * Math.sin(t * 2.0) * v, lerp(SHELF_Z, -3.15, v)];
      const hs = t > 1.4 ? lerp(1, 1.1, v) : 0; pan.set(pp, hs, .25 * v * Math.sin(t * .7)); dg.set([pp[0], pp[1] + pan.topY * hs, pp[2]], hs, 1, .12 * sm(P(5.4, 8, t)), .25 * v * Math.sin(t * .7));
      st(t, [pp[0], pp[1] + .4, pp[2]], sm(P(3.0, 5.2, t)) * .8, .4);
      sk.set([OVX - .05, 1.2, -3.0], P(6.6, 7.4, t), 1.4);
      ch.set([PANC[0] - .05, TOPY + .012, -4.05], popE(P(5.6, 6.6, t)), .3 * Math.sin(t * .5) * 0 + .1);
      tgB.set([PANC[0] + .3, 2.0 + bob(t, 2), -3.8], popE(P(7.0, 8.0, t)) * .95, .03 * Math.sin(t * 1.9)); });
    abba(Wd, t => ({ gesture: t > 1 && t < 6 ? 'offer' : 'explain', perform: 0, smile: .55, talk: t > 6 ? .25 * talkAmt(t, 2) : 0, look: -.4 }));
    shmulik(Wd, t => { const u = sm(P(5.2, 8.0, t)); return { pos: [.45, 0, -3.25], facing: lerp(.85, .45, u), gesture: t > 8.5 ? 'think' : null, perform: t > 8.5 ? 0 : .3, smile: .35, brow: .6 * sm(P(8, 10, t)), look: lerp(.6, .3, u) }; });
    Wd.occ = [pan.g, dg.g, tgB.g, ch.g]; Wd.center = [1.8, -3.7]; Wd.qSize = .9; Wd.qPos = [1.15, -3.4];
    Wd.cam = seq([0, cine([C0(0, KH, 4.0, .4, -11, 44), C0(5, KH, 3.7, .4, 7, 44), C0(10, [KH[0] - .1, KH[1], KH[2]], 3.7, .4, -8, 44), C0(14, KH, 3.9, .45, 5, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: earlier today a covered meat pan (red tag) comes out of the very same oven; "today" badge
  function s2(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const ov = ki.ov; const pan = mkPan(Wd, 'meat'), tgR = bb(Wd, 1.3, .5, drawMeat, 520), bdg = bb(Wd, 1.5, .56, drawToday, 640), st = steam(Wd, 7), sk = shock(Wd, 0xffd166);
    Wd.on(t => {
      const open = sm(P(1.0, 2.8, t)) * (1 - sm(P(8.2, 10.0, t)));
      ov.set(open, .55 + .15 * Math.sin(t * 1.4));
      const u1 = sm(P(2.6, 5.4, t)), u2 = sm(P(6.0, 8.8, t)); let pp = [OVX, OVY, lerp(IN_Z, SHELF_Z, u1)]; if (t >= 6.0) pp = arcPt([OVX, OVY, SHELF_Z], PANC, u2, .55);
      pan.set(pp, t > 1.4 ? lerp(1, PS, u2) : 0, 0);
      st(t, [pp[0], pp[1] + .4, pp[2]], sm(P(3.0, 5.0, t)) * (1 - sm(P(9, 11, t)) * .5) * .75, .38);
      sk.set([PANC[0], PANC[1] + .2, PANC[2] + .3], P(8.6, 9.4, t), 1.2);
      tgR.set([pp[0], pp[1] + 1.1 + bob(t, 1), pp[2] + .2], popE(P(5.4, 6.4, t)) * .9, .03 * Math.sin(t * 1.7));
      bdg.set([OVX, 2.4 + bob(t, 3), -3.6], popE(P(.5, 1.5, t)) * (1 + .04 * Math.sin(t * 3)) * .95, .02 * Math.sin(t * 1.3)); });
    abba(Wd, t => ({ gesture: t < 9 ? 'offer' : 'explain', perform: 0, smile: .5, talk: t > 9 ? .25 * talkAmt(t, 2) : 0, look: -.4 }));
    shmulik(Wd, t => ({ pos: [.05, 0, -3.25], facing: .6, gesture: null, perform: .3, smile: .4 + .3 * sm(P(8, 11, t)), look: .5 }));
    Wd.occ = [pan.g, tgR.g, bdg.g]; Wd.center = [1.8, -3.8];
    Wd.cam = seq([0, cine([C0(0, KT, 4.4, .5, -10, 44), C0(5, KT, 4.1, .5, 8, 44), C0(10, [2.1, 1.35, -3.8], 4.1, .5, -8, 44), C0(dur, KT, 4.4, .55, 5, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-44: Shmulik's dough floats toward the red meat pan; the pan turns grey, red X slams; Abba gently stops it and the dough returns
  function s3(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const pan = mkPan(Wd, 'meat'), dg = mkDough(Wd), tgR = bb(Wd, 1.3, .5, drawMeat, 520), cr = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff5a5a), cl = steam(Wd, 6, 0x8a909c), pf = shock(Wd, 0xffffff);
    const DH = [1.0, 1.05, -3.3], DT = [PANC[0] - .05, PANC[1] + .78, PANC[2] + .02];
    Wd.on(t => {
      ki.ov.set(0, .45);
      const gr = sm(P(4.1, 5.0, t)); pan.grey(gr);
      const sc = 1 - sm(P(11.0, 12.0, t)); pan.set([PANC[0], PANC[1], PANC[2]], t > .2 ? Math.max(.001, sc * PS) : 0, 0);
      tgR.set([PANC[0] - .35, PANC[1] + 1.15 + bob(t, 1), PANC[2] + .15], popE(P(.3, 1.3, t)) * .9 * sc, .03 * Math.sin(t * 1.7));
      // dough: hovers at the boy's hand, drifts over the pan, bounces back when the pan turns grey
      let dp; const go = sm(P(1.4, 4.0, t)), back = sm(P(4.7, 7.4, t));
      if (t < 4.7) dp = arcPt(DH, DT, go, .25); else dp = arcPt(DT, DH, back, .3);
      const hov = (t < 1.4 || t > 7.4) ? .03 * Math.sin(t * 2.4) : 0; dg.set([dp[0], dp[1] + hov, dp[2]], PS, 0, 0, (t > 4.0 && t < 4.9) ? .0 : 0);
      pf.set([DT[0], DT[1] - .1, DT[2]], P(4.0, 4.7, t), 1.1);
      sk.set([PANC[0] + .62, PANC[1] + .85, PANC[2] + .35], P(4.1, 5.0, t), 1.3);
      cr.set([PANC[0] + .6, PANC[1] + .85, PANC[2] + .45], popE(P(4.1, 4.9, t)) * .6 * (1 - sm(P(10, 11, t))), .05 * Math.sin(t * 3));
      cl(t, [PANC[0], PANC[1] + .35, PANC[2] + .05], sm(P(4.4, 5.6, t)) * (1 - sm(P(8, 10, t))) * .7, .5); });
    abba(Wd, t => ({ gesture: t > 4.3 && t < 9 ? 'offer' : 'explain', perform: 0, smile: .5, talk: t > 4.5 && t < 11 ? .3 * talkAmt(t, 2) : 0, look: -.7, facing: -.85 }));
    shmulik(Wd, t => ({ pos: [.05, 0, -3.25], facing: .6, gesture: t > 1 && t < 4.6 ? 'offer' : null, perform: t > 1 && t < 4.6 ? 0 : .3, smile: .45 - .25 * sm(P(4, 5, t)) + .5 * sm(P(8, 10, t)), brow: .5 * sm(P(4.2, 5.2, t)) * (1 - sm(P(7, 8, t))), look: .45 }));
    Wd.occ = [pan.g, dg.g, tgR.g, cr.g]; Wd.center = [1.7, -3.8];
    Wd.cam = seq([0, cine([C0(0, [2.0, 1.3, -3.8], 4.3, .5, -10, 44), C0(5, [2.0, 1.35, -3.8], 4.0, .45, 6, 44), C0(10, [2.0, 1.35, -3.8], 4.1, .5, -7, 44), C0(dur, [2.1, 1.3, -3.8], 4.4, .55, 5, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-60: Abba brings a silver disposable pan; the dough goes onto it; green check
  function s4(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const pan = mkPan(Wd, 'alu'), dg = mkDough(Wd), tg = bb(Wd, 1.9, .5, drawDisp, 900), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), sp = shock(Wd, 0xffffff), gl = glowAt(Wd.scene, 2.2, 0x9dffb0, 0);
    const DH = [1.0, 1.05, -3.3];
    Wd.on(t => {
      ki.ov.set(0, .45);
      const a = popE(P(.3, 1.3, t)); pan.set([PANC[0], PANC[1] + .005, PANC[2]], a * PS * (1 + .02 * Math.sin(t * 2.2) * P(7, 8, t)), .02 * Math.sin(t * .8));
      sp.set([PANC[0], PANC[1] + .2, PANC[2] + .3], P(.3, 1.2, t), 1.2);
      tg.set([PANC[0] - .35, PANC[1] + 1.15 + bob(t, 1), PANC[2] + .15], popE(P(1.2, 2.3, t)) * .75, .03 * Math.sin(t * 1.6));
      const go = sm(P(2.8, 5.4, t)); let dp = arcPt(DH, [PANC[0], PANC[1] + pan.topY * PS + .03, PANC[2]], go, .4); const land = P(5.4, 6.2, t);
      dg.set([dp[0], dp[1] + (go < 1 ? .03 * Math.sin(t * 2.4) : -.012 * Math.exp(-land * 3) * Math.sin(land * 16)), dp[2]], PS, 0, .15 * sm(P(8, 15, t)), 0);
      ck.set([PANC[0] + .45, PANC[1] + .8 + .05 * Math.sin(t * 3), PANC[2] + .4], popE(P(5.8, 6.8, t)) * .6, .05 * Math.sin(t * 3)); sk.set([PANC[0] + .45, PANC[1] + .8, PANC[2] + .4], P(5.8, 6.7, t), 1.1);
      gl.position.set(PANC[0], PANC[1] + .25, PANC[2] + .2); gl.material.opacity = .4 * sm(P(5.6, 7, t)) * (.85 + .15 * Math.sin(t * 2.6)); });
    abba(Wd, t => ({ gesture: t < 3 ? 'offer' : (t > 6 ? 'explain' : null), perform: t > 3 && t < 6 ? .3 : 0, smile: .6, talk: t > 6.5 && t < 13 ? .3 * talkAmt(t, 2) : 0, look: -.5, facing: -.85 }));
    shmulik(Wd, t => ({ pos: [.05, 0, -3.25], facing: .6, gesture: t > 2.5 && t < 5.5 ? 'offer' : (t > 6.5 && t < 10.5 ? 'thumb' : null), perform: (t > 2.5 && t < 5.5) || (t > 6.5 && t < 10.5) ? 0 : .3, smile: .5 + .5 * sm(P(5.6, 7, t)), look: .45 }));
    Wd.occ = [pan.g, dg.g, tg.g, ck.g]; Wd.center = [1.7, -3.8];
    Wd.cam = seq([0, cine([C0(0, [2.0, 1.3, -3.8], 4.3, .5, -9, 44), C0(5, [2.0, 1.35, -3.8], 4.0, .45, 7, 44), C0(10, [2.0, 1.35, -3.8], 4.1, .5, -8, 44), C0(dur, [2.1, 1.3, -3.8], 4.4, .55, 4, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 60-74: second option: baking paper unrolls onto a tray; dough on it; green check
  function s5(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const pan = mkPan(Wd, 'tray'), dg = mkDough(Wd), tg = bb(Wd, 1.9, .5, drawPaper, 900), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), sp = shock(Wd, 0xffffff), gl = glowAt(Wd.scene, 2.2, 0x9dffb0, 0);
    const DH = [1.0, 1.05, -3.3];
    Wd.on(t => {
      ki.ov.set(0, .45);
      const a = popE(P(.2, 1.1, t)); pan.set([PANC[0], PANC[1], PANC[2]], a * PS, .02 * Math.sin(t * .8)); pan.unroll(sm(P(1.8, 4.6, t)));
      sp.set([PANC[0], PANC[1] + .2, PANC[2] + .3], P(.2, 1.1, t), 1.2);
      tg.set([PANC[0] - .35, PANC[1] + 1.15 + bob(t, 1), PANC[2] + .15], popE(P(1.0, 2.1, t)) * .75, .03 * Math.sin(t * 1.6));
      const go = sm(P(5.0, 7.6, t)); let dp = arcPt(DH, [PANC[0], PANC[1] + pan.topY * PS + .02, PANC[2]], go, .4); const land = P(7.6, 8.4, t);
      dg.set([dp[0], dp[1] + (go < 1 ? .03 * Math.sin(t * 2.4) : -.012 * Math.exp(-land * 3) * Math.sin(land * 16)), dp[2]], PS, 0, .12 * sm(P(9, 14, t)), 0);
      ck.set([PANC[0] + .45, PANC[1] + .8 + .05 * Math.sin(t * 3), PANC[2] + .4], popE(P(8.0, 9.0, t)) * .6, .05 * Math.sin(t * 3)); sk.set([PANC[0] + .45, PANC[1] + .8, PANC[2] + .4], P(8.0, 8.9, t), 1.1);
      gl.position.set(PANC[0], PANC[1] + .25, PANC[2] + .2); gl.material.opacity = .4 * sm(P(8, 9.2, t)) * (.85 + .15 * Math.sin(t * 2.6)); });
    abba(Wd, t => ({ gesture: t < 5 ? 'offer' : 'explain', perform: 0, smile: .6, talk: t > 1 && t < 12 ? .3 * talkAmt(t, 2) : 0, look: -.5, facing: -.85 }));
    shmulik(Wd, t => ({ pos: [.05, 0, -3.25], facing: .6, gesture: t > 4.8 && t < 7.8 ? 'offer' : (t > 9 && t < 12.5 ? 'thumb' : null), perform: (t > 4.8 && t < 7.8) || (t > 9 && t < 12.5) ? 0 : .3, smile: .5 + .5 * sm(P(8, 9.4, t)), look: .45 }));
    Wd.occ = [pan.g, dg.g, tg.g, ck.g]; Wd.center = [1.7, -3.8];
    Wd.cam = seq([0, cine([C0(0, [2.0, 1.3, -3.8], 4.3, .5, 8, 44), C0(5, [2.0, 1.35, -3.8], 4.0, .45, -6, 44), C0(9, [2.0, 1.35, -3.8], 4.1, .5, 7, 44), C0(dur, [2.1, 1.3, -3.8], 4.4, .55, -4, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 74-88: pan with dough goes into the oven, door closes, warm glow, challot rise and turn golden; they come out on the disposable pan; "pareve" tag lands
  function s6(dur) {
    const Wd = kW(); const ki = kitchen(Wd); const ov = ki.ov; const pan = mkPan(Wd, 'alu'), dg = mkDough(Wd), tg = bb(Wd, 1.3, .5, drawPareve, 520), sk = shock(Wd, 0x6dff9a), st = steam(Wd, 7), gl = glowAt(Wd.scene, 2.4, 0xffd27a, 0);
    const atShelf = [OVX, OVY, SHELF_Z];
    Wd.on(t => {
      const open = sm(P(.2, 1.4, t)) * (1 - sm(P(3.9, 5.0, t))) + sm(P(9.2, 10.3, t));
      const heat = .3 + .7 * sm(P(5.0, 7.5, t)) * (1 - .35 * sm(P(9.2, 11, t)));
      ov.set(Math.min(1, open), heat);
      // pan path: counter -> shelf -> inside (closed) ... inside -> shelf (open again)
      let pp; const a = sm(P(1.0, 2.8, t)), b = sm(P(2.8, 3.8, t)), c = sm(P(10.0, 11.6, t));
      if (t < 2.8) pp = arcPt([PANC[0], PANC[1] + .005, PANC[2]], atShelf, a, .5); else if (t < 9.8) pp = [OVX, OVY, lerp(SHELF_Z, IN_Z, b)]; else pp = [OVX, OVY, lerp(IN_Z, SHELF_Z, c)];
      const ps = t < 2.8 ? lerp(PS, 1, a) : 1; pan.set(pp, ps, 0);
      const bake = sm(P(5.6, 9.0, t)), rise = sm(P(5.2, 9.0, t));
      dg.set([pp[0], pp[1] + pan.topY * ps, pp[2]], ps, bake, rise, 0);
      st(t, [pp[0], pp[1] + .5, pp[2]], sm(P(10.6, 12, t)) * .75, .4);
      sk.set([OVX, .75, SHELF_Z + .2], P(11.4, 12.2, t), 1.2);
      gl.position.set(OVX, .9, -3.2); gl.material.opacity = .22 * heat * (1 - open * .3);
      const lu = P(11.6, 12.8, t); tg.set([OVX, lerp(1.9, .98, sm(lu)) + (lu >= 1 ? 1 : 0) * (.5 + .03 * Math.sin(t * 2) - .5 * 0) , SHELF_Z + .15], popE(P(11.2, 12.0, t)) * .95, .03 * Math.sin(t * 1.7)); });
    abba(Wd, t => ({ gesture: 'offer', perform: 0, smile: .6, talk: t > 4 ? .25 * talkAmt(t, 2) : 0, look: -.4 }));
    shmulik(Wd, t => ({ pos: [.05, 0, -3.25], facing: .75, gesture: t > 5.5 && t < 9 ? 'lean' : null, perform: t > 5.5 && t < 9 ? 0 : .3, smile: .5 + .4 * sm(P(8.5, 11, t)), look: .6 }));
    Wd.occ = [pan.g, dg.g, tg.g]; Wd.center = [2.0, -3.8];
    Wd.cam = seq([0, cine([C0(0, [1.95, 1.25, -3.9], 4.5, .5, -9, 44), C0(4.5, [2.1, 1.2, -3.9], 4.2, .4, 6, 44), C0(9, [2.2, 1.1, -3.9], 4.1, .4, -5, 44), C0(dur, [2.1, 1.2, -3.9], 4.3, .45, 5, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 88-100: Shavuot table: golden challot beside the cheese plate (blue tag); Shmulik takes a slice with cheese, smiles; green check
  const T7 = { bx: TX - .65, cx: TX + .5 };
  function tableScene(Wd, w) {
    const bd = mkBoard(Wd), dg = mkDough(Wd), ch = mkCheese(Wd), tgB = bb(Wd, 1.3, .5, drawDairy, 520);
    return { bd, dg, ch, tgB, put(t, ap) { const a = ap === undefined ? 1 : ap; bd.set([T7.bx, TTOP + .04, TZ - .02], a, .12); dg.set([T7.bx, TTOP + .1, TZ - .02], a * 1.25, 1, 0, .12); ch.set([T7.cx - .3, TTOP + .04, TZ - .02], Math.min(a, 1), .3); } };
  }
  function s7(dur) {
    const Wd = kW(); const ki = kitchen(Wd, { table: true }); const ts = tableScene(Wd), sl = mkSlice(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x6dff9a), gl = glowAt(Wd.scene, 2.6, 0xffe08a, .0);
    const HAND = [TX + 1.15, TTOP + .24, TZ - .75];
    Wd.on(t => {
      ts.put(t, popE(P(.1, 1.0, t)));
      ts.tgB.set([T7.cx - .25, TTOP + 1.1 + bob(t, 2), TZ + .05], popE(P(1.0, 2.0, t)) * .7, .03 * Math.sin(t * 1.7));
      const u = sm(P(3.2, 6.2, t)), sp = arcPt([T7.bx + .2, TTOP + .14, TZ - .02], HAND, u, .45);
      sl.set([sp[0], sp[1] + .02 * Math.sin(t * 3) * sm(P(5.5, 6.5, t)), sp[2]], t > 3.0 ? popE(P(3.0, 3.6, t)) : 0, .3 * u, .25 * u);
      ck.set([TX + 1.25, 2.0 + .05 * Math.sin(t * 3), TZ - .7], popE(P(6.6, 7.6, t)) * .55, .05 * Math.sin(t * 3)); sk.set([TX + 1.25, 2.0, TZ - .7], P(6.6, 7.5, t), 1.0);
      gl.position.set(TX, TTOP + .5, TZ); gl.material.opacity = .3 * sm(P(1, 3, t)) * (.85 + .15 * Math.sin(t * 2.4)); });
    abba(Wd, t => ({ pos: [-.75, 0, -2.5], facing: .55, gesture: 'explain', perform: 0, smile: .7, talk: t > 7 ? .25 * talkAmt(t, 2) : 0, look: .3 }));
    shmulik(Wd, t => ({ pos: [TX + 1.8, 0, -2.45], facing: -.55, gesture: t > 3 && t < 6.6 ? 'offer' : (t > 6.8 ? 'thumb' : null), perform: t > 3 && t < 9 ? 0 : .3, smile: .5 + .5 * sm(P(5.8, 7.5, t)), look: -.3 }));
    Wd.occ = [ts.bd.g, ts.dg.g, ts.ch.g, ts.tgB.g, sl.g, ck.g]; Wd.center = [TX, TZ];
    Wd.cam = seq([0, cine([C0(0, [TX + .2, 1.1, TZ - .2], 3.2, .8, -12, 44), C0(6, [TX + .25, 1.1, TZ - .2], 2.9, .75, 8, 44), C0(dur, [TX + .2, 1.12, TZ - .2], 3.15, .8, -5, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: golden challot and the cheese plate on the festive table, Abba seated, Shmulik beside, smiling
  function answerBg(dur) {
    const Wd = kW(); const ki = kitchen(Wd, { table: true }); const ts = tableScene(Wd), gl = glowAt(Wd.scene, 2.6, 0xffe08a, .3), SZ = TZ - .82;
    chair(Wd, -.8, SZ - .13, 0, .46); gl.position.set(0, 1.0, TZ + .05);
    Wd.on(t => { ts.put(t, 1); gl.material.opacity = .3 + .1 * Math.sin(t * 2.4); });
    manK(Wd, ABBA, t => Object.assign({ pos: [-.8, .2, SZ], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2), sit: true, groundY: 0 }), .5);
    boyK(Wd, SHM, t => ({ pos: [.95, 0, SZ - .05], facing: 0, smile: 1, perform: .5, talk: .4 * talkAmt(t, 3), groundY: 0 }));
    Wd.occ = [ts.bd.g, ts.dg.g, ts.ch.g]; Wd.center = [0, SZ]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
