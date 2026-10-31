// halashon-07 story: "and if they only write, or only wink?" - 3D choreography per storyboards_v8.md (B). Boys only. Everything is a function of time.
// Grey clouds carry ICONS (mouth / pencil / eye / envelope). The note shows scribbles only. Hebrew words in the 3D world come from H() (latin spelling), so this file holds no raw Hebrew.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, boyP, talkAmt, face, yardWorld, board, shock, mark3d, qmark, popE, lighting,
    arcPt, glowSprite, canvasTex, FONT, bill, drawWord } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.1 * d : ly];
  const SIT = { sit: true, groundY: 0 };
  const occ = (Wd, g) => { (Wd.occ = Wd.occ || []).push(g); return g; };

  const HL = 'abgdhvzxtyKklMmNnsepPCcqrwT';
  const H = s => s.split('').map(ch => { const i = HL.indexOf(ch); return i < 0 ? ch : String.fromCharCode(0x5d0 + i); }).join('');
  const W_ENV = H('mktb mnxvM'), W_ALL = H('bkl havpnyM');

  // ---------------------------------------------------------------- people (navy velvet kippot, NO scaling of the kippa mesh)
  const boyK = (Wd, i, fn) => { const Pp = boyP(Wd, i, fn); Wd.on(() => { if (!Pp.kippa && Pp.figure) Pp.figure.group.traverse(m => { if (!Pp.kippa && m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && Math.abs(m.geometry.parameters.thetaLength - .86) < .02) Pp.kippa = m; }); const k = Pp.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }); return Pp; };
  const SZ = -3.3, XS = -7.4, XA = -5.5, XN = -3.2, ZN = -3.95, MID = (XS + XA) / 2;
  const shuki = (Wd, fn) => boyK(Wd, 3, t => Object.assign({ pos: [XS, 0, SZ], facing: .5 }, SIT, { perform: 0 }, fn(t)));
  const avi = (Wd, fn) => boyK(Wd, 5, t => Object.assign({ pos: [XA, 0, SZ], facing: -.3 }, SIT, { perform: 0 }, fn(t)));
  const nachum = Wd => boyK(Wd, 6, t => ({ pos: [XN, 0, ZN], facing: 1.2 + .06 * Math.sin(t * .45), gesture: null, perform: 0, talk: 0, smile: .3, brow: 0, look: .2, seed: .6 }));
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _k = new THREE.Vector3();
  const handMid = (per, fb) => { const B = per.figure && per.figure.bones; if (!B) return fb; B.handA.getWorldPosition(_a); B.handB.getWorldPosition(_b); return [(_a.x + _b.x) / 2, (_a.y + _b.y) / 2, (_a.z + _b.z) / 2]; };
  const headPos = (per, fb) => { if (!per.kippa) return fb; per.kippa.getWorldPosition(_k); return [_k.x, _k.y, _k.z]; };
  // a gentle wink: both eyes close softly (the figure has one blink value), a small smile, drawn over the figure's own face update
  const winkAt = (per, Wd, wins, smile) => Wd.on(t => { if (!per.figure) return; let k = 0; for (const [a, b] of wins) if (t > a && t < b) k = Math.sin(PI * (t - a) / (b - a)) > .35 ? 1 : 0; if (k) per.figure.face({ blink: 1, mouth: 0, smile: smile === undefined ? .6 : smile, brow: .1, look: .5 }); });

  // ---------------------------------------------------------------- world: a bench in a quiet corner (fence, wall); Nachum stands far to the right
  function world7() {
    const Wd = yardWorld({ noBall: true });
    Wd.add(box(1.5, .1, .55, 0x9a6a3e, { pos: [-8.0, .5, -3.5] })); Wd.add(box(1.5, .5, .08, 0x8a5a34, { pos: [-8.0, .78, -3.8] })); Wd.add(box(.1, .5, .5, 0x6a4326, { pos: [-8.7, .25, -3.5], ink: false }));
    Wd.add(box(.9, .1, .55, 0x9a6a3e, { pos: [-4.85, .5, -3.5] })); Wd.add(box(.9, .5, .08, 0x8a5a34, { pos: [-4.85, .78, -3.8] })); Wd.add(box(.1, .5, .5, 0x6a4326, { pos: [-4.45, .25, -3.5], ink: false }));
    for (let x = -9.6; x <= -1.0; x += .3) Wd.add(box(.14, 1.55, .05, 0xd9b27a, { pos: [x, .775, -4.7], ink: false }));
    for (const y of [.45, 1.15]) Wd.add(box(8.6, .1, .07, 0xa87a48, { pos: [-5.3, y, -4.62], ink: false }));
    Wd.add(box(.4, 1.7, 2.9, 0xe3cfa6, { pos: [-9.4, .85, -3.2] })); Wd.add(box(.6, .12, 3.1, 0xc9a574, { pos: [-9.4, 1.76, -3.2], ink: false }));
    Wd.add(box(.7, 1.2, 1.7, 0x5f9e4a, { pos: [-1.0, .6, -3.8] })); Wd.add(ball(.5, 0x6fae57, { pos: [-1.0, 1.25, -3.8], scale: [1, .7, 1.5] }));
    Wd.center = [MID, SZ];
    return Wd;
  }

  // ---------------------------------------------------------------- flat textured props (all billboards)
  const GREYF = '#dfe2ea', INK = '#1c2745', ICN = '#3d4358';
  const cloudCircles = (c, W, Hh, list, fill) => {
    c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = W * .028;
    for (const [x, y, r] of list) { c.beginPath(); c.arc(x * W, y * Hh, r * W, 0, 7); c.stroke(); }
    c.fillStyle = fill; for (const [x, y, r] of list) { c.beginPath(); c.arc(x * W, y * Hh, r * W, 0, 7); c.fill(); }
  };
  const ICONS = {
    mouth: (c, cx, cy, r) => {
      c.lineJoin = 'round'; c.lineCap = 'round'; cx -= r * .25;
      c.beginPath(); c.moveTo(cx - r * .85, cy); c.quadraticCurveTo(cx - r * .2, cy - r * .85, cx + r * .85, cy - r * .02); c.quadraticCurveTo(cx - r * .1, cy + r * 1.0, cx - r * .85, cy); c.closePath();
      c.fillStyle = '#9aa0b6'; c.fill(); c.lineWidth = r * .12; c.strokeStyle = ICN; c.stroke();
      c.beginPath(); c.ellipse(cx, cy + r * .08, r * .5, r * .17, -.05, 0, 7); c.fillStyle = ICN; c.fill();
      c.lineWidth = r * .1; for (let k = 1; k <= 2; k++) { c.beginPath(); c.arc(cx + r * .95, cy, r * (.28 + .3 * k), -.62, .62); c.stroke(); } },
    pencil: (c, cx, cy, r) => {
      c.save(); c.translate(cx, cy); c.rotate(-PI / 4); c.lineJoin = 'round'; c.lineWidth = r * .1; c.strokeStyle = ICN; const L = r * 1.25, w = r * .3;
      c.fillStyle = '#b4b9cb'; c.beginPath(); c.rect(-L, -w, L * 1.5, w * 2); c.fill(); c.stroke();
      c.fillStyle = '#8a90a6'; c.beginPath(); c.rect(-L, -w, L * .28, w * 2); c.fill(); c.stroke();
      c.fillStyle = '#e9d9c6'; c.beginPath(); c.moveTo(L * .5, -w); c.lineTo(L * 1.05, 0); c.lineTo(L * .5, w); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = ICN; c.beginPath(); c.moveTo(L * .9, -w * .3); c.lineTo(L * 1.05, 0); c.lineTo(L * .9, w * .3); c.closePath(); c.fill(); c.restore(); },
    eye: (c, cx, cy, r) => {
      c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - r, cy); c.quadraticCurveTo(cx, cy - r * 1.15, cx + r, cy); c.quadraticCurveTo(cx, cy + r * 1.15, cx - r, cy); c.closePath();
      c.fillStyle = '#f4f5f9'; c.fill(); c.lineWidth = r * .13; c.strokeStyle = ICN; c.stroke();
      c.beginPath(); c.arc(cx, cy, r * .4, 0, 7); c.fillStyle = '#7a8098'; c.fill(); c.stroke(); c.beginPath(); c.arc(cx, cy, r * .16, 0, 7); c.fillStyle = ICN; c.fill(); },
    wink: (c, cx, cy, r) => {   // a softly closed eye + a small sparkle
      c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = r * .17; c.strokeStyle = ICN; cx -= r * .2;
      c.beginPath(); c.moveTo(cx - r, cy - r * .1); c.quadraticCurveTo(cx, cy + r * .95, cx + r, cy - r * .1); c.stroke();
      c.lineWidth = r * .1; for (const a of [-.55, 0, .55]) { c.beginPath(); c.moveTo(cx + Math.sin(a) * r * .8, cy + r * .5 + Math.abs(a) * -r * .15); c.lineTo(cx + Math.sin(a) * r * 1.0, cy + r * .78); c.stroke(); }
      const sx = cx + r * 1.0, sy = cy - r * .8, sr = r * .42; c.fillStyle = '#f0c63a'; c.beginPath();
      for (let i = 0; i < 8; i++) { const a = i / 8 * 2 * PI, rr = i % 2 ? sr * .3 : sr; i ? c.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr) : c.moveTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } c.closePath(); c.fill(); c.lineWidth = r * .06; c.strokeStyle = ICN; c.stroke(); },
    env: (c, cx, cy, r) => {
      c.lineJoin = 'round'; c.lineCap = 'round'; const w = r * 1.3, h = r * .9;
      c.beginPath(); c.rect(cx - w, cy - h, w * 2, h * 2); c.fillStyle = '#eceef4'; c.fill(); c.lineWidth = r * .11; c.strokeStyle = ICN; c.stroke();
      c.beginPath(); c.moveTo(cx - w, cy - h); c.lineTo(cx, cy + h * .15); c.lineTo(cx + w, cy - h); c.stroke();
      c.beginPath(); c.moveTo(cx - w, cy + h); c.lineTo(cx - w * .35, cy - h * .05); c.moveTo(cx + w, cy + h); c.lineTo(cx + w * .35, cy - h * .05); c.stroke(); },
    blank: () => {},
  };
  const CTX = {};
  const cloudTex = kind => CTX[kind] || (CTX[kind] = canvasTex(768, 552, (c, W, Hh) => {
    cloudCircles(c, W, Hh, [[.2, .6, .16], [.34, .4, .19], [.54, .33, .22], [.74, .42, .19], [.84, .62, .15], [.7, .74, .18], [.5, .76, .2], [.3, .74, .17], [.5, .55, .27]], GREYF);
    ICONS[kind](c, W / 2, Hh * .55, Hh * .27); }));
  const RINGT = canvasTex(768, 720, (c, W, Hh) => {   // a grey cloud that wraps around something placed in its middle
    const L = []; for (let i = 0; i < 16; i++) { const a = i / 16 * 2 * PI; L.push([.5 + .36 * Math.cos(a), .5 + .36 * Math.sin(a), .13 + .02 * Math.sin(i * 2.3)]); }
    L.push([.5, .5, .38]); cloudCircles(c, W, Hh, L, GREYF); });
  function flat(Wd, tex, w, h, ro) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = ro || 8; inner.add(m);
    bill(Wd, g); return { g, inner, m };
  }
  function cloud(Wd, kind, w, h) {
    const f = flat(Wd, kind === 'ring' ? RINGT : cloudTex(kind), w || 1.6, h || 1.15, 8), gl = glowSprite((w || 1.6) * 1.9, (h || 1.15) * 2.0, 0); gl.material.color.set(0xb7bccb); gl.position.z = -.12; f.inner.add(gl);
    return { g: f.g, set(pos, s, a, rz, dark) { const on = s > .01 && (a === undefined || a > .01); f.g.visible = on; if (!on) return; f.g.position.set(pos[0], pos[1], pos[2]); f.inner.scale.setScalar(s); f.inner.rotation.z = rz || 0;
      const al = a === undefined ? 1 : a, d = 1 - .42 * (dark || 0); f.m.material.opacity = al; f.m.material.color.setRGB(d, d, d * 1.02); gl.material.opacity = .4 * al; } };
  }
  // the folded note: scribbles only, no letters
  const paperTex = canvasTex(256, 192, (c, W, Hh) => { c.fillStyle = '#fff3cf'; c.fillRect(0, 0, W, Hh); c.strokeStyle = INK; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, Hh - 10); });
  const squig = i => canvasTex(512, 64, (c, W, Hh) => {
    c.strokeStyle = '#2b3558'; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); let x = 6; c.moveTo(x, Hh * .6);
    while (x < W - 24) { const seg = 8 + 7 * Math.abs(Math.sin(x * .13 + i * 2.1)), amp = 10 + 16 * Math.abs(Math.sin(x * .071 + i)); if ((x * 7 + i * 31) % 97 < 9) { x += 20; c.moveTo(x, Hh * .6); continue; }
      c.quadraticCurveTo(x + seg * .5, Hh * .6 - amp, x + seg, Hh * .6 + (i % 2 ? 6 : -4)); x += seg; } c.stroke(); });
  function note(Wd) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const mat = tex => new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false });
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(.8, .6), mat(paperTex)); paper.renderOrder = 8; inner.add(paper);
    const lines = []; for (let i = 0; i < 5; i++) { const gm = new THREE.PlaneGeometry(.64, .08); gm.translate(.32, 0, 0); const l = new THREE.Mesh(gm, mat(squig(i))); l.position.set(-.32, .2 - i * .1, .002); l.renderOrder = 9; inner.add(l); lines.push(l); }
    bill(Wd, g);
    return { g, set(pos, s, rz, wr, fold, grey) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]);
      const f1 = sm(clamp(fold * 2, 0, 1)), f2 = sm(clamp(fold * 2 - 1, 0, 1)); inner.scale.set(s * (1 - .45 * f2), s * (1 - .5 * f1), s); inner.rotation.z = rz || 0;
      lines.forEach((l, i) => { l.scale.x = Math.max(.001, clamp((wr - i * .2) / .2, 0, 1)); l.visible = wr > i * .2 + .001; const d = 1 - .5 * grey; l.material.color.setRGB(d, d, d); });
      const d = 1 - .42 * grey; paper.material.color.setRGB(d, d, d * 1.03); } };
  }
  const pencilTex = canvasTex(512, 128, (c, W, Hh) => {
    c.lineJoin = 'round'; c.lineWidth = 7; c.strokeStyle = INK;
    c.fillStyle = '#f2c230'; c.beginPath(); c.rect(110, 30, 330, 68); c.fill(); c.stroke(); c.fillStyle = '#d99a1a'; c.fillRect(112, 56, 326, 14);
    c.fillStyle = '#e8a0a8'; c.beginPath(); c.rect(440, 30, 54, 68); c.fill(); c.stroke(); c.fillStyle = '#b9bcc6'; c.fillRect(436, 30, 10, 68);
    c.fillStyle = '#f3d9b0'; c.beginPath(); c.moveTo(110, 30); c.lineTo(22, 64); c.lineTo(110, 98); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#2b3558'; c.beginPath(); c.moveTo(48, 54); c.lineTo(22, 64); c.lineTo(48, 74); c.closePath(); c.fill(); });
  function pencil(Wd) { const f = flat(Wd, pencilTex, .6, .15, 10); return { g: f.g, set(pos, s, rz) { f.g.visible = s > .01; if (!f.g.visible) return; f.g.position.set(pos[0], pos[1], pos[2]); f.inner.scale.setScalar(s); f.inner.rotation.z = rz; } }; }
  const envTex = canvasTex(1024, 704, (c, W, Hh) => {
    c.fillStyle = '#fbf3dc'; c.fillRect(0, 0, W, Hh); c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 16; c.strokeRect(10, 10, W - 20, Hh - 20);
    c.lineWidth = 10; c.strokeStyle = '#9a8f78'; c.beginPath(); c.moveTo(14, 14); c.lineTo(W / 2, Hh * .42); c.lineTo(W - 14, 14); c.moveTo(14, Hh - 14); c.lineTo(W * .36, Hh * .5); c.moveTo(W - 14, Hh - 14); c.lineTo(W * .64, Hh * .5); c.stroke();
    c.fillStyle = '#d6262e'; c.beginPath(); c.arc(W / 2, Hh * .42, 34, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${Hh * .17}px ${FONT}`; c.lineJoin = 'round'; c.strokeStyle = '#fff6dc'; c.lineWidth = 12; c.strokeText(W_ENV, W / 2, Hh * .76); c.fillStyle = '#2b3558'; c.fillText(W_ENV, W / 2, Hh * .76); });
  const envelope = Wd => { const f = flat(Wd, envTex, 1.0, .69, 10); return { g: f.g, set(pos, s, rz) { f.g.visible = s > .01; if (!f.g.visible) return; f.g.position.set(pos[0], pos[1], pos[2]); f.inner.scale.setScalar(s); f.inner.rotation.z = rz || 0; } }; };
  const tileTex = kind => CTX['t' + kind] || (CTX['t' + kind] = canvasTex(384, 384, (c, W, Hh) => {
    c.lineJoin = 'round'; c.beginPath(); c.roundRect(14, 14, W - 28, Hh - 28, 56); c.fillStyle = GREYF; c.fill(); c.lineWidth = 14; c.strokeStyle = INK; c.stroke(); ICONS[kind](c, W / 2, Hh / 2, W * .27); }));
  const tile = (Wd, kind) => { const f = flat(Wd, tileTex(kind), 1.0, 1.0, 8); const gl = glowSprite(2.0, 2.0, 0); gl.material.color.set(0xb7bccb); gl.position.z = -.1; f.inner.add(gl);
    return { g: f.g, set(pos, s, a, rz) { const on = s > .01 && a > .01; f.g.visible = on; if (!on) return; f.g.position.set(pos[0], pos[1], pos[2]); f.inner.scale.setScalar(s); f.inner.rotation.z = rz || 0; f.m.material.opacity = a; gl.material.opacity = .35 * a; } }; };
  const rays = Wd => { const arr = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 12), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(-10 + i * 2.8, 5, -4 + (i % 2)); m.rotation.z = .4; Wd.add(m); arr.push(m); }
    return k => arr.forEach((m, i) => m.material.opacity = k * (.16 + .06 * Math.sin(i * 2 + k * 3))); };
  const greenGlow = Wd => { const s = glowSprite(1, 1, 0); s.material.color.set(0x6dffa0); Wd.add(s); return (pos, w, a) => { s.position.set(pos[0], pos[1], pos[2]); s.scale.set(w, w * 1.15, 1); s.material.opacity = a; }; };
  const dim = (Wd, k) => lighting(Wd, t => ({ hemi: lerp(1.25, 1.1, k(t)), sun: lerp(1.9, 1.55, k(t)) }));
  const Pw = (t, wr0, wr1) => P(wr0, wr1, t);

  // hold points relative to the people (computed from the hands, with the fallbacks used before the figures are built)
  const holdS = (sh, lift) => { const h = handMid(sh, [XS + .3, .95, SZ + .25]); return [h[0] + .7, h[1] + (lift === undefined ? .1 : lift), h[2] + .3]; };
  const holdA = (av, lift) => { const h = handMid(av, [XA - .3, .95, SZ + .25]); return [h[0] - .6, h[1] + (lift === undefined ? .1 : lift), h[2] + .3]; };

  // ---------------------------------------------------------------- 1. HOOK 0-14: Shuki takes out a note and a pencil, smiles at Avi, glances at far Nachum, big "?"
  function hook(dur) {
    const Wd = world7(), nt = note(Wd), pc = pencil(Wd); occ(Wd, nt.g); occ(Wd, pc.g);
    const sh = shuki(Wd, t => ({ gesture: t > 1.6 ? 'offer' : null, facing: t < 8 ? .5 + .08 * Math.sin(t * 1.3) : (t < 12 ? lerp(.5, .95, sm(P(8, 9.2, t))) : lerp(.95, .5, sm(P(12, 13.4, t)))), smile: t > 3 ? .6 : .3, brow: t > 6 ? .15 : 0, look: t > 8.4 && t < 12 ? .8 : 0, talk: 0 }));
    const av = avi(Wd, t => ({ gesture: null, facing: -.3, smile: .12, brow: .3, look: t > 5 && t < 8 ? -.5 : 0, talk: 0 }));
    nachum(Wd);
    Wd.on(t => {
      const hp = holdS(sh, -.1).map((v, i) => i === 0 ? v + .12 : v), k = popE(P(1.2, 2.1, t)), pk = sm(P(1.2, 2.2, t)), from = [XS + .75, .5, SZ + .3];
      const np = [lerp(from[0], hp[0], pk), lerp(from[1], hp[1], pk) + .05 * Math.sin(PI * pk), lerp(from[2], hp[2], pk)];
      nt.set(np, k * .72, .04 * Math.sin(t * 1.3), 0, 0, 0);
      pc.set([np[0] + .3, np[1] - .08 + .02 * Math.sin(t * 2.2), np[2] + .04], popE(P(1.5, 2.4, t)) * .75, .35 + .06 * Math.sin(t * 2.2)); });
    Wd.noQ = true; const qm = qmark(Wd, '#5ec8ff', 1.1), fw = new THREE.Vector3(), up = new THREE.Vector3(), rt = new THREE.Vector3();
    Wd.on((t, cam) => { cam.getWorldDirection(fw); up.set(0, 1, 0).applyQuaternion(cam.quaternion); rt.set(1, 0, 0).applyQuaternion(cam.quaternion);
      const p = cam.position.clone().addScaledVector(fw, 8).addScaledVector(up, 1.45).addScaledVector(rt, .2); qm.set([p.x, p.y + .08 * Math.sin(t * 1.7), p.z], popE(P(3.4, 4.4, t)) * 1.1, .12 * Math.sin(t * 1.1)); });
    Wd.cam = cine([C(0, [-5.7, .55, -3.4], 4.8, .3, -20, 44, 0), C(5, [-5.7, .55, -3.4], 4.5, .25, 2, 44, 0), C(10, [-5.5, .55, -3.4], 4.5, .35, 14, 44, 0), C(14, [-5.7, .55, -3.4], 4.7, .3, 6, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: DIBUR - Shuki leans and whispers; a grey cloud (mouth) rises from him; red cross slams
  function s2(dur) {
    const Wd = world7(); dim(Wd, t => sm(P(2, 6, t)));
    const sh = shuki(Wd, t => ({ pos: [lerp(XS, XA - .95, sm(P(1.2, 3, t))), 0, SZ], gesture: t > 1.8 ? 'lean' : null, facing: lerp(.5, .85, sm(P(1.5, 3, t))), smile: .15, brow: 0, talk: t > 2.4 && t < 11 ? .35 * talkAmt(t, 3) : (t >= 11 ? .25 * talkAmt(t, 3) : 0) }));
    avi(Wd, t => ({ gesture: null, facing: lerp(-.3, -.5, sm(P(1.5, 3, t))), smile: 0, brow: .3, look: .3, talk: 0 }));
    const pf = [], N = 4; for (let i = 0; i < N; i++) { const p = cloud(Wd, 'blank', 1.0, .72); pf.push(p); occ(Wd, p.g); }
    const cl = cloud(Wd, 'mouth'), x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff8a8a); occ(Wd, cl.g); occ(Wd, x.g);
    Wd.on(t => {
      const hp = headPos(sh, [XS, 1.1, SZ]), bx = hp[0] - .42, by = hp[1] + .32;
      pf.forEach((p, i) => { const t0 = 3.0 + i * .4, u = clamp((t - t0) / 1.5, 0, 1); p.set([bx + .1 * i + .05 * Math.sin(t * 2 + i), by + .15 * i + .1 * u, SZ + .1], popE(P(t0, t0 + .4, t)) * (.2 + .04 * i) * (1 - sm(P(t0 + 1.6, t0 + 2.2, t))), 1, 0, 0); });
      const cx = hp[0] - .15, cy = hp[1] + .78, grow = popE(P(4.6, 5.8, t));
      cl.set([cx + .05 * Math.sin(t * .8), cy + .06 * Math.sin(t * 1.3) + .12 * sm(P(5, 10, t)), SZ - .05], grow * (.8 + .1 * sm(P(5, 12, t))), 1, .04 * Math.sin(t * 1.1), sm(P(8, 9.5, t)));
      const xt = 8.2, xk = t > xt ? popE(P(xt, xt + .55, t)) : 0; x.set([cx, cy + .12 * sm(P(5, 10, t)), SZ + .3], xk * .6, .06 * Math.sin(t * 3)); sk.set([cx, cy + .12, SZ + .35], P(xt, xt + .8, t) * (t > xt ? 1 : 0), 1.2); });
    Wd.cam = cine([C(0, [-6.5, 1.1, -3.3], 4.0, .3, -20, 44, 0), C(5, [-6.5, 1.1, -3.3], 3.8, .25, 4, 44, 0), C(10, [-6.5, 1.1, -3.3], 3.8, .35, 18, 44, 0), C(16, [-6.5, 1.1, -3.3], 4.0, .3, 0, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-46: KTAV - Shuki writes scribbles, folds the note, slides it to Avi; it turns grey; red cross
  function s3(dur) {
    const Wd = world7(); dim(Wd, t => 1);
    const nt = note(Wd), pc = pencil(Wd), x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff8a8a); occ(Wd, nt.g); occ(Wd, pc.g); occ(Wd, x.g);
    const sh = shuki(Wd, t => ({ gesture: t > .6 && t < 11.2 ? 'offer' : null, facing: .5, smile: t > 9.5 ? .4 : .1, brow: 0, look: 0, talk: 0 }));
    const av = avi(Wd, t => ({ gesture: t > 8.8 && t < 13.5 ? 'offer' : null, facing: -.3, smile: 0, brow: .35, look: .3, talk: 0 }));
    Wd.on(t => {
      const hs = holdS(sh, -.08), ha = holdA(av, -.08 + .2 * sm(P(11.4, 12.6, t))), sl = sm(P(9.3, 11.6, t)), wr = P(1.6, 7.4, t), fold = P(7.8, 9.2, t);
      const base = [lerp(hs[0], ha[0], sl), lerp(hs[1], ha[1], sl) + .16 * Math.sin(PI * sl), lerp(hs[2], ha[2], sl)];
      const grey = sm(P(12, 13.2, t)), pop = popE(P(.3, 1.1, t));
      nt.set(base, pop * .8, .03 * Math.sin(t * 1.3) + (t > 10 ? -.1 * sl : 0), wr, fold, grey);
      const wv = wr > 0 && wr < 1 ? 1 : 0, tip = [base[0] - .3 + .3 * ((t * 1.7) % 1) + .02 * Math.sin(t * 17), base[1] + .1 - .22 * (Math.floor(wr * 5) % 5) / 5 * wv + .03 * Math.sin(t * 13), base[2] + .05];
      pc.set([tip[0] + .2 * Math.cos(.55), tip[1] + .2 * Math.sin(.55), tip[2]], popE(P(.6, 1.3, t)) * (1 - sm(P(8, 8.8, t))) * .85, .55);
      const xt = 12.4, xk = t > xt ? popE(P(xt, xt + .5, t)) : 0; x.set([base[0] - .1, base[1] + .2, base[2] + .35], xk * .5, .06 * Math.sin(t * 3)); sk.set([base[0] - .1, base[1] + .2, base[2] + .4], P(xt, xt + .8, t) * (t > xt ? 1 : 0), .5); });
    Wd.cam = cine([C(0, [MID, .7, -3.3], 3.6, .3, -18, 44, 0), C(6, [MID, .7, -3.3], 3.4, .25, 5, 44, 0), C(11, [MID, .7, -3.3], 3.3, .35, 14, 44, 0), C(16, [MID + .1, .7, -3.3], 3.4, .3, 2, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 46-60: REMEZ - Shuki winks and tilts toward Nachum; a small grey cloud (soft wink) above; red cross; the camera shows Nachum far, calm
  function s4(dur) {
    const Wd = world7(); dim(Wd, t => 1);
    const sh = shuki(Wd, t => ({ gesture: null, facing: (t < 5.4 ? lerp(.2, .1, sm(P(0, 3, t))) : lerp(.1, 1.0, sm(P(5.4, 6.8, t)))) + .03 * Math.sin(t * 1.6), smile: .5, brow: 0, look: t > 5.4 ? .8 : .1, talk: 0 }));
    avi(Wd, t => ({ gesture: null, facing: -.25, smile: 0, brow: .35, look: -.2, talk: 0 }));
    nachum(Wd); winkAt(sh, Wd, [[3.0, 3.55], [4.7, 5.25]], .6);
    const cl = cloud(Wd, 'wink'), x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff8a8a), pf = cloud(Wd, 'blank', 1.0, .72); occ(Wd, cl.g); occ(Wd, x.g); occ(Wd, pf.g);
    Wd.on(t => {
      const hp = headPos(sh, [XS, 1.1, SZ]), cx = hp[0] - .1, cy = hp[1] + .8;
      pf.set([cx + .05, hp[1] + .5, SZ + .05], popE(P(5.0, 5.5, t)) * .22 * (1 - sm(P(6.2, 6.8, t))), 1, 0, 0);
      cl.set([cx + .04 * Math.sin(t * 1.2), cy + .05 * Math.sin(t * 1.5), SZ - .05], popE(P(5.4, 6.4, t)) * .72, 1, .05 * Math.sin(t * 1.1), sm(P(8.4, 9.6, t)));
      const xt = 8.0, xk = t > xt ? popE(P(xt, xt + .55, t)) : 0; x.set([cx, cy, SZ + .3], xk * .7, .06 * Math.sin(t * 3)); sk.set([cx, cy, SZ + .35], P(xt, xt + .8, t) * (t > xt ? 1 : 0), 1.3); });
    Wd.cam = cine([C(0, [-5.5, 1.1, -3.4], 4.2, .3, -6, 44, 0), C(5, [-5.5, 1.1, -3.4], 3.9, .25, 2, 44, 0), C(9, [-5.5, 1.1, -3.4], 4.2, .3, 6, 44, 0), C(14, [-5.5, 1.1, -3.4], 4.4, .3, 3, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 60-76: SHOWING A LETTER - Shuki holds up an envelope with the sender's name; a grey cloud wraps it; red cross
  function s5(dur) {
    const Wd = world7(); dim(Wd, t => 1);
    const sh = shuki(Wd, t => ({ gesture: t > .8 ? 'offer' : null, facing: .55, smile: .3, brow: 0, look: 0, talk: 0 }));
    avi(Wd, t => ({ gesture: null, facing: -.3, smile: 0, brow: .35, look: .3, talk: 0 }));
    nachum(Wd);
    const ev = envelope(Wd), rg = cloud(Wd, 'ring', 1.2, 1.15), x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff8a8a); occ(Wd, ev.g); occ(Wd, rg.g); occ(Wd, x.g);
    const EP = [MID, 1.12, SZ + .05];
    Wd.on(t => {
      const hs = holdS(sh, -.1), u = sm(P(1.4, 3.6, t)), pop = popE(P(1.0, 1.9, t));
      const pos = [lerp(hs[0], EP[0], u), lerp(hs[1], EP[1], u) + .04 * Math.sin(t * 1.4) * u, lerp(hs[2], EP[2], u)];
      ev.set(pos, Math.min(pop, 1.04) * lerp(.7, .88, u), .03 * Math.sin(t * 1.2));
      rg.set([pos[0], pos[1], pos[2] - .08], sm(P(4.2, 5.4, t)) * 1.0, 1, .02 * Math.sin(t * 1.1), sm(P(8.2, 9.6, t)));
      const xt = 8.0, xk = t > xt ? popE(P(xt, xt + .55, t)) : 0; x.set([pos[0] + .28, pos[1] - .22, pos[2] + .3], xk * .5, .06 * Math.sin(t * 3)); sk.set([pos[0] + .28, pos[1] - .22, pos[2] + .35], P(xt, xt + .8, t) * (t > xt ? 1 : 0), 1.1); });
    Wd.cam = cine([C(0, [MID, 1.1, -3.3], 3.8, .3, -16, 44, 0), C(5, [MID, 1.1, -3.3], 3.5, .25, 4, 44, 0), C(10, [MID, 1.1, -3.3], 3.4, .35, 14, 44, 0), C(16, [MID, 1.1, -3.3], 3.6, .3, 2, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-90: four grey icons (mouth, pencil, eye, envelope), each crossed out, merge into one sign
  function s6(dur) {
    const Wd = world7(); dim(Wd, t => 1 - sm(P(11, 13, t)));
    shuki(Wd, t => ({ gesture: null, facing: .5, smile: .15, brow: 0, look: .2, talk: 0 }));
    avi(Wd, t => ({ gesture: null, facing: -.3, smile: .05, brow: .25, look: .2, talk: 0 }));
    const kinds = ['mouth', 'pencil', 'eye', 'env'], tl = kinds.map(k => tile(Wd, k)), xs = kinds.map(() => mark3d(Wd, 'cross', 1.0)), sks = kinds.map(() => shock(Wd, 0xff8a8a));
    const sg = board(Wd, { w: 3.5, h: .95, cw: 1024, frame: 0x6b3a1c, glow: 0xffd27a, draw: drawWord(W_ALL, '#fff3c4', '#a30f1c', '#b8870f') });
    tl.forEach(o => occ(Wd, o.g)); xs.forEach(o => occ(Wd, o.g)); occ(Wd, sg.g);
    const X0 = kinds.map((k, i) => MID + (i - 1.5) * 1.12), Y = 1.95, TT = [1.0, 2.8, 4.6, 6.4], gg = greenGlow(Wd);
    Wd.on(t => {
      const m = sm(P(9.2, 11, t));
      kinds.forEach((k, i) => { const k0 = popE(P(TT[i], TT[i] + .8, t)), px = lerp(X0[i], MID, m), pos = [px, Y + .05 * Math.sin(t * 1.4 + i) * (1 - m), SZ - .1 - .02 * i];
        tl[i].set(pos, k0 * (1 - .7 * m) * .98, 1 - sm(P(10.2, 11, t)), .05 * Math.sin(t * 1.2 + i));
        const xt = TT[i] + .9, xk = t > xt ? popE(P(xt, xt + .5, t)) : 0; xs[i].set([pos[0], pos[1], pos[2] + .3], xk * .6 * (1 - .8 * m), .06 * Math.sin(t * 3 + i));
        if (m > .6) xs[i].g.visible = false; sks[i].set([pos[0], pos[1], pos[2] + .35], P(xt, xt + .8, t) * (t > xt ? 1 : 0), .7); });
      sg.set([MID, Y, SZ - .2], popE(P(10.2, 11.3, t)) * (1 + .03 * Math.sin(t * 2.4)) * 1.0, 0); gg([MID, Y, SZ - .5], 5.0 * P(10.2, 12, t), .4 * P(10.5, 12.5, t)); });
    Wd.cam = cine([C(0, [MID, 1.15, -3.3], 4.3, .3, -14, 44, 0), C(6, [MID, 1.15, -3.3], 4.0, .25, 3, 44, 0), C(10, [MID, 1.15, -3.3], 3.9, .35, 10, 44, 0), C(14, [MID, 1.15, -3.3], 4.2, .3, 0, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 90-100: Avi gently pushes the note back and shakes his head; Shuki pockets it; warm light returns; green check over Avi
  function s7(dur) {
    const Wd = world7(), ryz = rays(Wd), gg = greenGlow(Wd);
    lighting(Wd, t => ({ hemi: lerp(1.1, 1.8, sm(P(1.5, 6, t))), sun: lerp(1.55, 2.3, sm(P(1.5, 6, t))) }));
    const nt = note(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x7dffa8); occ(Wd, nt.g); occ(Wd, ck.g);
    const sh = shuki(Wd, t => ({ gesture: t > 1.0 && t < 4.4 ? 'offer' : null, facing: .5, smile: t > 5 ? .6 : .1, brow: 0, look: 0, talk: 0 }));
    const av = avi(Wd, t => ({ gesture: t < 2.6 ? 'offer' : null, facing: -.3 + (t > 2.2 && t < 5.6 ? .2 * Math.sin((t - 2.2) * 5.2) * Math.min(1, (5.6 - t) / 1.2) : 0), smile: t > 5.4 ? .55 : 0, brow: t < 5 ? .25 : 0, look: t > 2.2 && t < 5.6 ? .5 * Math.sin((t - 2.2) * 5.2) : 0, talk: 0 }));
    Wd.on(t => {
      const ha = holdA(av, -.08), hs = holdS(sh, -.08), back = sm(P(.9, 2.6, t)), pk = sm(P(4.3, 6.0, t)), pocket = [XS + .62, .4, SZ + .3];
      let pos = [lerp(ha[0], hs[0], back), lerp(ha[1], hs[1], back) + .12 * Math.sin(PI * back), lerp(ha[2], hs[2], back)];
      pos = [lerp(pos[0], pocket[0], pk), lerp(pos[1], pocket[1], pk) + .08 * Math.sin(PI * pk), lerp(pos[2], pocket[2], pk)];
      nt.set(pos, 1 - sm(P(5.4, 6.2, t)), .03 * Math.sin(t * 1.3) - .1 * (1 - back), 1, 2, 1 - sm(P(5.5, 6.2, t)));
      const k = popE(P(6.2, 7.0, t)); ck.set([XA, 1.65 + .04 * Math.sin(t * 1.8), SZ + .2], k * .55, .05 * Math.sin(t * 2.6)); sk.set([XA, 1.65, SZ + .25], P(6.2, 7.0, t) * (t > 6.2 ? 1 : 0), 1.5);
      const gk = sm(P(5, 9, t)); gg([XA, 1.2, SZ - .55], 2.4 + 1.2 * gk, .45 * gk); ryz(.4 * sm(P(3, 8, t))); });
    Wd.cam = cine([C(0, [MID, .85, -3.3], 3.8, .3, -14, 44, 0), C(4, [MID, .85, -3.3], 3.5, .25, 4, 44, 0), C(7, [MID, .85, -3.3], 3.6, .35, 12, 44, 0), C(10, [MID, .85, -3.3], 3.9, .3, 4, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the boys play ball behind the card
  function answerBg(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd); ry(.8);
    const xs = [-3.4, -1.7, 0, 1.7, 3.4], ids = [3, 4, 1, 5, 6], bl = K.soccer(Wd, .15), per = 1.1;
    const posI = i => [xs[i], 0, .1 + (i % 2) * .3];
    const leg = t => { const k = t / per, a = Math.floor(k) % 5, b = (a + 1) % 5; return [a, b, k - Math.floor(k)]; };
    ids.forEach((id, i) => boyK(Wd, id, t => { const [a, b, k] = leg(t), p = posI(i), to = posI(a === i ? b : a);
      return { pos: p, facing: face(to[0] - p[0], to[2] - p[2]) * .5, gesture: b === i && k > .5 ? 'catchp' : a === i && k < .25 ? 'throwp' : null, perform: 0, smile: 1, talk: .6 * talkAmt(t, i + 2), brow: .1 }; }));
    occ(Wd, bl);
    Wd.on(t => { const [a, b, k] = leg(t), A = posI(a), B = posI(b), p = arcPt([A[0], .16, A[2] + .5], [B[0], .16, B[2] + .5], k, .1); bl.position.set(p[0], p[1], p[2]); bl.rotation.x = t * 9; });
    lighting(Wd, () => ({ hemi: 1.7, sun: 2.1 }));
    Wd.center = [0, 0]; Wd.ansD = 7.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
