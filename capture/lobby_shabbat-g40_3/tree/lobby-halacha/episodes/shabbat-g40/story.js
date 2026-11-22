// shabbat-g40 story (22/11/2026) - borei meorei ha'esh: a light bulb is fire, but covered in glass; the havdala fire must be open. Section C of storyboards_v22.md.
// Objects only, no people. Copied from shabbat-g39 and rebuilt for the candle / bulb / glass shell / lantern storyline.
// Heroes: a braided havdala candle with a face (open flame), a light bulb with a face (glass shell, glowing filament),
// the fire card "מאורי האש" with a face, a glass lantern with a face on its door (beat 6), a small wine cup (answer).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, pullOut, truck, crane, lowHero, insert, handheld, punch, pushIn, face, talkAmt,
          mark3d, shock, popE, ease, prog, lerp, glowAt, texPlane, bill, fitText, FONT } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const cl01 = x => Math.min(1, Math.max(0, x));
  const at = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  const TOPY = .8, NUM = .6;
  const ST = { gold: ['#fff4c2', '#7a5a00', '#d9a63a'], green: ['#f6fff2', '#1f6a2a', '#3f9a4a'], blue: ['#d9eaff', '#14408f', '#2f6ad0'],
               orange: ['#ffe4c4', '#8a3a00', '#e07a20'], grey: ['#ececec', '#4a4a4a', '#9a9a9a'], red: ['#ffe6e6', '#8a1010', '#e04040'] };
  const SC = 1.35;
  const CX = -.9, CZ = 0;                       // braided havdala candle (on its holder)
  const BX = 1.1, BZ = 0;                       // light bulb on its socket
  const LX = -.3, LZ = 0;                       // glass lantern (beat 6)
  const GX = -2.6, GZ = .2;                     // small wine cup at the side
  const HOV = [.1, 1.9, .3];                    // the fire card hovers between the candle and the bulb
  const CARD = 0xe07a20;                        // fire card colour
  const SEED_C = 51, SEED_B = 52, SEED_F = 53, SEED_G = 31, SEED_L = 54;
  const DIM = new THREE.Color(0x8c8a80), HOTG = new THREE.Color(0xfff7d0), COLF = new THREE.Color(0x4a1a0a), HOTF = new THREE.Color(0xff4a10);

  // ---------------------------------------------------------------- world: night, dark-blue window with stars, table with white cloth
  const kW = () => mkWorld({ skyTop: 0x0b1633, skyBottom: 0x2a3d6e, fogColor: 0x1d2a52, fogNear: 24, fogFar: 98, hemi: .7, sun: .45, sunPos: [-9, 22, 12], shadowExt: 10 });
  function sceneSet(Wd) {
    Wd.add(box(12, 5, .3, 0x3b3260, { pos: [0, 2.5, -2.0] }));                        // dusk wall
    Wd.add(box(2.7, 1.9, .08, 0x6b4a2e, { pos: [-3.4, 2.4, -1.78] }));                // window frame (left)
    Wd.add(box(2.3, 1.5, .04, 0x0d1d44, { pos: [-3.4, 2.4, -1.72], ink: false }));    // night sky pane
    Wd.add(box(.05, 1.5, .05, 0x6b4a2e, { pos: [-3.4, 2.4, -1.68] }));                 // mullion
    const stars = [[-3.8, 2.85], [-3.1, 3.05], [-3.4, 2.1]].map(p => { const s = ball(.05, 0xfff3b0, { pos: [p[0], p[1], -1.66], ink: false }); Wd.add(s); return s; });
    Wd.add(box(12, .12, 3.6, 0x8a6a4a, { pos: [0, -.06, -.4] }));                     // floor (top at 0)
    Wd.add(box(6.4, .1, 2.6, 0xfbf8f0, { pos: [0, TOPY - .05, 0] }));                // white Shabbat tablecloth
    Wd.add(box(6.4, .14, .03, 0xe6d6b4, { pos: [0, TOPY - .14, 1.31] }));            // cloth drape
    for (const x of [-3.0, 3.0]) for (const z of [-1.1, 1.1]) Wd.add(box(.1, TOPY - .1, .1, 0x5a3c24, { pos: [x, (TOPY - .1) / 2, z] }));
    return { stars };
  }
  const animScene = (E, t) => E.stars.forEach((s, i) => s.scale.setScalar(.8 + .3 * Math.sin(t * 3 + i * 2)));

  // ---------------------------------------------------------------- billboards / tags (same pattern as shabbat-g39)
  function bb(Wd, w, h, draw, cw) {
    const m = texPlane(w, h, draw, { cw: cw || 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group(); inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, rz, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; m.material.opacity = a === undefined ? 1 : a; } };
  }
  const drawTag = (text, st) => (c, W, H) => {
    c.fillStyle = st[0]; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill(); c.lineWidth = H * .07; c.strokeStyle = st[2]; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = st[1]; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  const tag = (Wd, text, style, w) => bb(Wd, w, .5, drawTag(text, ST[style]), w > 1.6 ? 900 : 520);
  const tagS = (Wd, text, style, w) => bb(Wd, w, .26, drawTag(text, ST[style]), 520);      // small label
  const mkDots = (Wd, n, col, r) => { const ds = []; for (let i = 0; i < n; i++) { const d = ball(r, col, { ink: false }); Wd.add(d); ds.push(d); } return ds; };
  // a flat glass pane (transparent) for the lantern walls
  const pane = (parent, w, h, d, p) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: .28, depthWrite: false, fog: false })); m.position.set(p[0], p[1], p[2]); parent.add(m); return m; };

  // ---------------------------------------------------------------- the heroes (origin = table top; face on the +z side)
  function mkCandle(Wd, x, z, seed) {                // braided havdala candle with a face; flame is a cone that lights up
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    g.add(cyl(.16, .16, .04, 0x6b4a2e, { pos: [0, .02, 0] }));                         // holder dish
    const body = new THREE.Group(); body.position.y = .04; g.add(body);
    body.add(cyl(.1, .1, .6, 0xf0d890, { pos: [0, .3, 0] }));                          // braided wax
    for (let i = 0; i < 4; i++) body.add(cyl(.107, .107, .035, 0xc9a24a, { pos: [0, .1 + i * .14, 0], ink: false }));
    const f = face(Wd, { w: .2, parent: body, pos: [0, .34, .11], seed });
    const flame = cyl(.012, .07, .22, 0xffb347, { pos: [0, .71, 0], ink: false }); body.add(flame);
    const core = ball(.035, 0xfff2b0, { pos: [0, .62, 0], ink: false }); body.add(core);
    const glow = glowAt(Wd.scene, 1.4, 0xffb347, 0);
    return { g, f, flame, core, glow, x, z };
  }
  function litC(C, k, t) {                           // k = 0 unlit .. 1 open flame
    const f = Math.max(.001, k), fl = 1 + .08 * Math.sin(t * 13) + .04 * Math.sin(t * 23);
    C.flame.scale.set(f * fl, Math.max(.001, k * (1 + .2 * Math.sin(t * 9 + 1))), f * fl);
    C.core.scale.setScalar(Math.max(.001, k));
    C.glow.position.set(C.x, TOPY + .75, C.z); C.glow.material.opacity = .4 * k;
  }
  function mkBulb(Wd, x, z, seed) {                  // light bulb with a face: glass shell (transparent) and a filament inside
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    g.add(cyl(.12, .12, .08, 0x9a9a9a, { pos: [0, .04, 0] }));                         // socket cap
    g.add(cyl(.11, .08, .36, 0x7a7a7a, { pos: [0, .2, 0] }));                          // socket neck (reaches the glass)
    const gl = new THREE.Group(); gl.position.y = .6; g.add(gl);                       // glass centre
    const glass = new THREE.Mesh(new THREE.SphereGeometry(.27, 28, 20), new THREE.MeshBasicMaterial({ color: 0xfff7d0, transparent: true, opacity: .3, depthWrite: false, fog: false }));
    glass.renderOrder = 3; gl.add(glass);
    const fil = ball(.08, 0x4a1a0a, { pos: [0, -.03, 0], ink: false }); gl.add(fil);
    const f = face(Wd, { w: .26, parent: gl, pos: [0, .03, .27], seed });
    const glow = glowAt(Wd.scene, 1.9, 0xffe9a0, 0);
    return { g, gl, glass, fil, f, glow, x, z };
  }
  function litB(B, k, t) {                           // k = 0 dim .. 1 glowing; the filament goes red-hot with k
    B.glass.material.color.copy(DIM).lerp(HOTG, k); B.glass.material.opacity = .22 + .14 * k;
    B.fil.material.color.copy(COLF).lerp(HOTF, k);
    B.fil.scale.setScalar(Math.max(.001, .9 + k * (.25 + .08 * Math.sin(t * 17))));
    B.glow.position.set(B.x, TOPY + .6, B.z); B.glow.material.opacity = .55 * k;
  }
  // the fire card "מאורי האש": a flat orange card with a face; origin = its centre, moved by the beat
  function mkCard(Wd, col, seed) {
    const g = new THREE.Group(); Wd.add(g);
    g.add(box(.5, .6, .06, col));
    const f = face(Wd, { w: .34, parent: g, pos: [0, .02, .05], seed });
    return { g, f };
  }
  // havdala wine cup: silver, wine level set by setLevel
  function mkGoblet(Wd, x, z, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z); g.scale.setScalar(SC * 1.4);
    const S = 0xc8ced6;
    g.add(cyl(.11, .11, .02, S, { pos: [0, .01, 0] }));
    g.add(cyl(.025, .025, .2, S, { pos: [0, .12, 0] }));
    g.add(cyl(.12, .085, .2, S, { pos: [0, .33, 0] }));
    const wine = cyl(.112, .09, .18, 0x6a0a1e, { pos: [0, .34, 0] }); g.add(wine);
    const glint = ball(.022, 0xffffff, { ink: false }); g.add(glint);
    const f = face(Wd, { w: .2, parent: g, pos: [0, .33, .1], seed });
    return { g, f, glint, setLevel(L) { const l = Math.max(.02, L); wine.scale.y = l; wine.position.y = .25 + .09 * l; } };
  }
  // glass lantern with a face on its wooden door; a candle inside; the door hinges on its left edge
  function mkLantern(Wd, x, z, seed) {
    const g = new THREE.Group(); Wd.add(g); g.position.set(x, TOPY, z);
    const WOOD = 0x6b3a1c;
    pane(g, .44, .6, .02, [0, .4, -.22]); pane(g, .02, .6, .44, [-.22, .4, 0]); pane(g, .02, .6, .44, [.22, .4, 0]);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(.04, .72, .04, WOOD, { pos: [sx * .22, .4, sz * .22] }));
    g.add(box(.56, .08, .56, WOOD, { pos: [0, .78, 0] }));
    g.add(cyl(0, .2, .12, WOOD, { pos: [0, .9, 0] }));
    g.add(cyl(.05, .05, .3, 0xf0d890, { pos: [0, .25, 0] }));                          // candle inside
    const flame = cyl(.012, .05, .16, 0xffb347, { pos: [0, .43, 0], ink: false }); g.add(flame);
    const core = ball(.025, 0xfff2b0, { pos: [0, .36, 0], ink: false }); g.add(core);
    const door = new THREE.Group(); door.position.set(-.22, .1, .25); g.add(door);
    door.add(box(.44, .6, .03, 0x8a5a2e, { pos: [.22, .3, 0] }));
    const f = face(Wd, { w: .3, parent: door, pos: [.22, .3, .03], seed });
    return { g, door, flame, core, f, x, z };
  }

  // standard four-shot camera: wide -> medium on the action -> insert on the object that carries the halacha -> low hero
  // Z = pull-back factor: every distance is multiplied, so tags and panels stay inside the frame
  const Z = 1.35;
  const std = (n, c) => cuts([
    [3.5, HH(truck(c.wide, { dur: 3.5, dist0: (c.wd || 6.4) * Z, dist1: ((c.wd || 6.4) - .2) * Z, h0: .6, h1: .5, a0: -8, a1: 8, fov0: 42, fov1: 42 }), n)],
    [4.0, HH(punch(pushIn(c.med, { dur: 4.0, dist0: 3.4 * Z, dist1: 3.0 * Z, h0: .3, h1: .3, a0: 8, a1: -6, fov0: 42, fov1: 40 }), [c.pm]), n + 1)],
    [3.5, HH(punch(insert(c.ins, { dur: 3.5, dist0: 2.6 * Z, dist1: 2.5 * Z, h0: .2, h1: .25, a0: -10, a1: 8, fov0: 36, fov1: 34 }), [c.pi]), n + 2)],
    [3.0, HH(lowHero([0, 1.0, 0], { dur: 3.0, dist0: 3.4 * Z, dist1: 3.6 * Z, h0: -.1, h1: -.05, a0: -10, a1: -2, fov0: 42, fov1: 40 }), n + 3)]
  ]);

  // ---------------------------------------------------------------- 0. HOOK 0-14: extreme close-up on the bulb's face, pull out; the holder is EMPTY (dotted outline "אין נר"); the card hovers; "?" above
  function hook(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const C = mkCandle(Wd, CX, CZ, SEED_C); C.g.visible = false;                       // the candle is not lit yet: the holder is empty
    const B = mkBulb(Wd, BX, BZ, SEED_B);
    const FC = mkCard(Wd, CARD, SEED_F);
    const hold = mkDots(Wd, 14, 0xb08a4a, .03);
    const hT = tagS(Wd, 'אין נר', 'grey', 1.2);
    const qT = tag(Wd, '?', 'grey', .8);
    Wd.on(t => {
      animScene(E, t);
      litB(B, 1, t); B.f.set(t, { talk: t > 1 ? .4 * talkAmt(t, SEED_B) : 0, smile: .6, look: [-.4, 0] });
      hold.forEach((d, i) => { const a = i * 2 * PI / 14; d.position.set(CX + .2 * Math.cos(a), TOPY + .6 + .5 * Math.sin(a), CZ); d.scale.setScalar(Math.max(.001, popE(P(.2, 1.0, t)) * (.7 + .3 * Math.sin(t * 3 + i)))); });
      hT.set([CX - .35, 1.2, 0], popE(P(.8, 1.6, t)) * .9, 0);
      FC.g.position.set(HOV[0], HOV[1] + .05 * Math.sin(t * 2), HOV[2]); FC.g.scale.setScalar(Math.max(.001, popE(P(.4, 1.2, t))));
      FC.f.set(t, { talk: t > 3 ? .4 * talkAmt(t, SEED_F) : 0, smile: .3, look: [.5, 0] });
      qT.set([HOV[0], 2.75, 0], popE(P(1.4, 2.2, t)) * NUM, .05 * Math.sin(t * 4));
    });
    Wd.center = [0, 0]; Wd.occ = [qT.g, hT.g, B.g]; Wd.qPos = [HOV[0], 0]; Wd.qSize = .9;
    Wd.cam = cuts([
      [3.6, HH(pullOut([BX, 1.42, BZ], { dur: 3.6, dist0: .9, dist1: 1.9, h0: .35, h1: .5, a0: -10, a1: 8, fov0: 30, fov1: 38 }), 1)],
      [4.4, HH(punch(truck([0, 1.1, 0], { dur: 4.4, dist0: 3.4, dist1: 3.4, h0: .4, h1: .4, a0: -12, a1: 12, fov0: 40, fov1: 40 }), [2.4]), 2)],
      [6.0, HH(pullOut([0, 1.1, 0], { dur: 6.0, dist0: 3.2, dist1: 4.8, h0: .4, h1: .7, a0: 6, a1: -6, fov0: 40, fov1: 42 }), 3)]
    ]);
    return Wd;
  }

  // ---------------------------------------------------------------- 1. BEAT 14-28 (neutral): the havdala candle appears and lights up; the card "מאורי האש" glows and flies to the flame; tag "על נר דולק"
  function s1(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const C = mkCandle(Wd, CX, CZ, SEED_C);
    const B = mkBulb(Wd, BX, BZ, SEED_B);
    const FC = mkCard(Wd, CARD, SEED_F);
    const tOn = tag(Wd, 'על נר דולק', 'orange', 2.0);
    Wd.on(t => {
      animScene(E, t);
      C.g.scale.setScalar(Math.max(.001, popE(P(0, 1.0, t))));
      litC(C, sm(P(1.0, 2.6, t)), t);
      C.f.set(t, { talk: t > 2 ? .5 * talkAmt(t, SEED_C) : 0, smile: .5, look: [.5, 0] });
      litB(B, 1, t); B.f.set(t, { talk: .2 * talkAmt(t, SEED_B), smile: .3, look: [-.5, 0] });
      const u = sm(P(3.2, 6.0, t));
      const p = at(HOV, [CX, 1.95, .3], u);
      FC.g.position.set(p[0], p[1] + .04 * Math.sin(t * 2), p[2]);
      FC.g.scale.setScalar(1 + .06 * Math.sin(t * 6) * u);
      FC.f.set(t, { talk: t > 4 ? .4 * talkAmt(t, SEED_F) : 0, smile: .2 + .5 * u, look: [-.5, 0] });
      tOn.set([.4, 2.3, 0], popE(P(6.2, 7.0, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tOn.g];
    Wd.cam = std(4, { wide: [0, 1.2, 0], wd: 6.4, med: [CX, 1.3, CZ], pm: 2.6, ins: [CX, 1.4, CZ], pi: .8 });
    return Wd;
  }

  // ---------------------------------------------------------------- 2. BEAT 28-42 (neutral): diagram - inside the bulb the filament glows red-hot, little sparks rise; label "חשמל = אש"; tag "נידון כאש"
  function s2(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const C = mkCandle(Wd, CX, CZ, SEED_C);
    const B = mkBulb(Wd, BX, BZ, SEED_B);
    const FC = mkCard(Wd, CARD, SEED_F);
    const sp = mkDots(Wd, 6, 0xffa040, .025);
    const lab = tagS(Wd, 'חשמל = אש', 'orange', 2.0);
    const tN = tag(Wd, 'נידון כאש', 'orange', 2.0);
    Wd.on(t => {
      animScene(E, t);
      litC(C, 1, t); C.f.set(t, { talk: .3 * talkAmt(t, SEED_C), smile: .4, look: [1, 0] });
      litB(B, 1, t); B.f.set(t, { talk: .5 * talkAmt(t, SEED_B), smile: .4, look: [0, 0] });
      sp.forEach((d, i) => { const v = (t * .9 + i / 6) % 1; d.position.set(BX + .05 * Math.sin(i * 2.1 + t * 4), 1.45 + .45 * v, BZ + .02); d.scale.setScalar(Math.max(.001, Math.sin(PI * v))); });
      FC.g.position.set(-1.7, TOPY + .3 + .03 * Math.sin(t * 2), .4);
      FC.f.set(t, { talk: .3 * talkAmt(t, SEED_F), smile: .2, look: [1, 0] });
      lab.set([BX, 2.1, 0], popE(P(.8, 1.6, t)) * .9, 0);
      tN.set([-1.2, 2.3, 0], popE(P(5.0, 5.8, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [lab.g, tN.g];
    Wd.cam = std(8, { wide: [0, 1.2, 0], wd: 6.6, med: [BX - .3, 1.3, BZ], pm: 4.4, ins: [BX, 1.45, BZ], pi: 5.0 });
    return Wd;
  }

  // ---------------------------------------------------------------- 3. BEAT 42-56 (bad): the card flies at the bulb and bounces off its glass; red cross + shock; tag "לא לנר הבדלה"
  function s3(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const C = mkCandle(Wd, CX, CZ, SEED_C);
    const B = mkBulb(Wd, BX, BZ, SEED_B);
    const FC = mkCard(Wd, CARD, SEED_F);
    const TX = BX - .5;                                                                 // the card stops at the glass edge
    const cr = mark3d(Wd, 'cross', .6), sk = shock(Wd, 0xff6a6a);
    const tNo = tag(Wd, 'לא לנר הבדלה', 'red', 2.6);
    Wd.on(t => {
      animScene(E, t);
      litC(C, 1, t); C.f.set(t, { talk: .3 * talkAmt(t, SEED_C), smile: .3, look: [1, 0] });
      litB(B, 1, t);
      const u = sm(P(.6, 2.6, t)), b = Math.sin(PI * cl01(P(2.6, 3.6, t)));          // b = bounce after the glass
      const p = at(HOV, [TX, 1.4, 0], u);
      FC.g.position.set(p[0] - .28 * b, p[1] + .06 * b, p[2]);
      FC.g.rotation.z = .3 * b;
      FC.f.set(t, { talk: .4 * talkAmt(t, SEED_F), smile: -.2 - .4 * b, look: [1, 0] });
      B.f.set(t, { talk: .2 * talkAmt(t, SEED_B), smile: -.4, look: [-1, 0], surprise: sm(P(2.8, 3.4, t)) });
      cr.set([TX, 1.85, .2], popE(P(2.8, 3.4, t)) * .6, .04 * Math.sin(t * 3));
      sk.set([TX, 1.4, .1], P(2.8, 3.8, t), 1.0);
      tNo.set([0, 2.3, 0], popE(P(3.6, 4.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tNo.g, cr.g];
    Wd.cam = std(12, { wide: [0, 1.3, 0], wd: 6.6, med: [BX - .3, 1.3, BZ], pm: 4.6, ins: [BX - .3, 1.4, BZ], pi: 4.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 4. BEAT 56-70 (neutral): diagram - a transparent glass shell around the bulb is highlighted with a pulsing blue outline; label "זכוכית"; shield icon; light rays pass out; tag "מכוסה בזכוכית"
  function s4(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const C = mkCandle(Wd, CX, CZ, SEED_C);
    const B = mkBulb(Wd, BX, BZ, SEED_B);
    const FC = mkCard(Wd, CARD, SEED_F);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(.36, 28, 20), new THREE.MeshBasicMaterial({ color: 0x7ab8ff, transparent: true, opacity: .25, depthWrite: false, fog: false }));
    shell.position.set(BX, TOPY + .6, BZ); Wd.add(shell);
    const ring = mkDots(Wd, 16, 0x2f6ad0, .03);
    const rays = mkDots(Wd, 8, 0xffe9a0, .03);
    const shield = cyl(.2, 0, .26, 0x2f6ad0, { pos: [BX + .75, 1.75, 0] }); Wd.add(shield);
    const lab = tagS(Wd, 'זכוכית', 'blue', 1.2);
    const tC = tag(Wd, 'מכוסה בזכוכית', 'blue', 2.6);
    Wd.on(t => {
      animScene(E, t);
      litC(C, 1, t); C.f.set(t, { talk: .3 * talkAmt(t, SEED_C), smile: .3, look: [1, 0] });
      litB(B, .35, t); B.f.set(t, { talk: .3 * talkAmt(t, SEED_B), smile: -.3, look: [0, 0] });
      const pulse = .5 + .5 * Math.sin(t * 4);
      shell.material.opacity = .15 + .2 * pulse; shell.scale.setScalar(1 + .04 * pulse);
      ring.forEach((d, i) => { const a = i * 2 * PI / 16 + .3 * t; d.position.set(BX + .42 * Math.cos(a), TOPY + .6 + .42 * Math.sin(a), BZ); d.scale.setScalar(Math.max(.001, popE(P(.8, 1.6, t)) * (.7 + .3 * pulse))); });
      rays.forEach((d, i) => { const v = (t * .5 + i / 8) % 1, a = i * 2 * PI / 8, r = .3 + .8 * v; d.position.set(BX + r * Math.cos(a), TOPY + .6 + r * Math.sin(a), BZ + .05); d.scale.setScalar(Math.max(.001, Math.sin(PI * v))); });
      FC.g.position.set(-1.6, TOPY + .3 + .03 * Math.sin(t * 2), .4);
      FC.f.set(t, { talk: .3 * talkAmt(t, SEED_F), smile: -.2, look: [1, 0] });
      lab.set([BX, 1.95, 0], popE(P(1.0, 1.8, t)) * .9, 0);
      shield.scale.setScalar(Math.max(.001, popE(P(1.8, 2.6, t))));
      tC.set([-.6, 2.3, 0], popE(P(3.4, 4.2, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tC.g, lab.g];
    Wd.cam = std(16, { wide: [0, 1.4, 0], wd: 6.6, med: [BX, 1.4, BZ], pm: 2.6, ins: [BX, 1.4, BZ], pi: 3.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 5. BEAT 70-86 (good): the braided candle's flame is open to the air; the card lands on it; green check; sparkles; tag "אש גלויה"
  function s5(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const C = mkCandle(Wd, CX, CZ, SEED_C);
    const B = mkBulb(Wd, BX, BZ, SEED_B);
    const FC = mkCard(Wd, CARD, SEED_F);
    const spk = mkDots(Wd, 10, 0xfff2a0, .03);
    const chk = mark3d(Wd, 'check', .6), sk = shock(Wd, 0x6dff9a);
    const tS = tag(Wd, 'אש גלויה', 'green', 2.1);
    Wd.on(t => {
      animScene(E, t);
      litC(C, 1, t); C.f.set(t, { talk: .4 * talkAmt(t, SEED_C), smile: .3 + .6 * sm(P(3.4, 4.2, t)), look: [.5, 0] });
      litB(B, .15, t); B.f.set(t, { talk: 0, smile: -.4, look: [-1, 0] });
      const u = sm(P(.8, 3.0, t));
      const p = at(HOV, [CX, 1.95, .3], u);
      FC.g.position.set(p[0], p[1] + .03 * Math.sin(t * 2), p[2]);
      FC.f.set(t, { talk: .4 * talkAmt(t, SEED_F), smile: .6, look: [-.5, 0] });
      const pop = popE(P(3.4, 4.2, t));
      spk.forEach((d, i) => { const a = i * 2 * PI / 10 + 2 * t; d.position.set(CX + .5 * Math.cos(a), 1.95 + .45 * Math.sin(a), .3); d.scale.setScalar(Math.max(.001, pop * (.6 + .4 * Math.sin(t * 7 + i)))); });
      chk.set([CX + .55, 1.6, .3], popE(P(3.6, 4.3, t)) * .6, .04 * Math.sin(t * 3));
      sk.set([CX + .55, 1.6, .3], P(3.6, 4.6, t), 1.0);
      tS.set([0, 2.3, 0], popE(P(3.6, 4.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tS.g, chk.g];
    Wd.cam = std(20, { wide: [0, 1.2, 0], wd: 6.8, med: [CX, 1.4, CZ], pm: 4.6, ins: [CX, 1.5, CZ], pi: 4.6 });
    return Wd;
  }

  // ---------------------------------------------------------------- 6. BEAT 86-100 (good): a glass lantern with a candle inside; red cross while the door is closed; the door swings open, the flame is seen, the card lands - green check; tag "רואים את השלהבת"
  function s6(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const L = mkLantern(Wd, LX, LZ, SEED_L);
    const FC = mkCard(Wd, CARD, SEED_F);
    const cr = mark3d(Wd, 'cross', .6), chk = mark3d(Wd, 'check', .6);
    const skR = shock(Wd, 0xff6a6a), skG = shock(Wd, 0x6dff9a);
    const tA = tag(Wd, 'רואים את השלהבת', 'green', 2.9);
    const LAND = [LX + .85, TOPY + .5, .3];
    Wd.on(t => {
      animScene(E, t);
      const fl = 1 + .08 * Math.sin(t * 13);
      L.flame.scale.set(fl, 1 + .2 * Math.sin(t * 9 + 1), fl); L.core.scale.setScalar(1);
      const op = sm(P(3.4, 4.6, t));
      L.door.rotation.y = -.8 * op;
      L.f.set(t, { talk: .3 * talkAmt(t, SEED_L), smile: -.5 + 1.2 * op, look: [0, 0] });
      const u = sm(P(3.8, 5.0, t));
      const p = at([1.4, 1.9, .3], LAND, u);
      FC.g.position.set(p[0], p[1] + .03 * Math.sin(t * 2), p[2]);
      FC.f.set(t, { talk: .4 * talkAmt(t, SEED_F), smile: .3 + .5 * u, look: [-1, 0] });
      cr.set([LX, 2.0, .3], popE(P(1.2, 2.0, t)) * .6 * (1 - sm(P(3.4, 3.8, t))), .04 * Math.sin(t * 3));
      skR.set([LX, 2.0, .3], P(1.2, 2.0, t), 1.0);
      chk.set([LAND[0], LAND[1] + .65, .3], popE(P(4.6, 5.2, t)) * .6, .04 * Math.sin(t * 3));
      skG.set([LAND[0], LAND[1] + .65, .3], P(4.6, 5.6, t), 1.0);
      tA.set([0, 2.3, 0], popE(P(4.6, 5.4, t)) * NUM, 0);
    });
    Wd.center = [0, 0]; Wd.occ = [tA.g, cr.g, chk.g];
    Wd.cam = std(24, { wide: [0, 1.3, 0], wd: 6.6, med: [LX, 1.4, LZ], pm: 4.6, ins: [LX, 1.5, LZ], pi: 4.4 });
    return Wd;
  }

  // ---------------------------------------------------------------- ANSWER 100-120: the braided candle at the front-left, smiling; the bulb at the right dimmed with a small cross; the wine cup beside the candle; slow crane
  function answerBg(dur) {
    const Wd = kW(); const E = sceneSet(Wd);
    const C = mkCandle(Wd, -1.5, .6, SEED_C); C.g.scale.setScalar(1.15);
    const B = mkBulb(Wd, 1.5, -.4, SEED_B);
    const G = mkGoblet(Wd, GX, -.1, SEED_G); G.setLevel(.8);
    const cr = mark3d(Wd, 'cross', .6);
    Wd.on(t => {
      animScene(E, t);
      litC(C, 1, t); C.f.set(t, { talk: .3 * talkAmt(t, SEED_C), smile: 1, look: [.5, 0] });
      litB(B, .15, t); B.f.set(t, { talk: 0, smile: -.4, look: [-.5, 0] });
      G.glint.position.set(.12 * Math.cos(t * .9), .44, .12 * Math.sin(t * .9));
      G.f.set(t, { talk: .3 * talkAmt(t, SEED_G), smile: .6, look: [.5, 0] });
      cr.set([1.5, 2.0, -.4], popE(P(0, 1, t)) * .6, .04 * Math.sin(t * 3));
    });
    Wd.center = [0, 0]; Wd.occ = []; Wd.ansD = 6.4;
    Wd.camAns = cuts([[20, HH(crane([0, 1.5, .2], { dur: 20, dist0: 7.4, dist1: 6.4, h0: .1, h1: 1.1, a0: 8, a1: -6, fov0: 42, fov1: 42, ease: 'out' }), 28)]]);
    return Wd;
  }

  return { hook, scenes: [s1, s2, s3, s4, s5, s6], answer: answerBg };
};
