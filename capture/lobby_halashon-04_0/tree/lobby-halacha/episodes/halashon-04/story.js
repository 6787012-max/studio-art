// halashon-04 story: "and if they press me?" - 3D choreography per storyboards_v5.md (B). Boys + adult men only. Everything is a function of time.
// Grey bubbles carry ICONS ONLY (no words about anyone). Hebrew drawn in the 3D world is written as \u escapes. Every world exposes people (.kippa) and occ.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, yardWorld, mkWorld, plainRoom, desk, board, shock, mark3d, qmark,
    popE, lighting, arcPt, glowSprite, glowTex, canvasTex, FONT, bill, fitText, person, archShape, toon, bm, booksTex } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.14 * d : ly];
  const SKIN = ['#f0d2b4', '#e8c3a0', '#f4d9bf', '#dcb08a'];
  const MOTTY = 2, SHMULY = 3;
  const occ = (Wd, g) => { (Wd.occ = Wd.occ || []).push(g); return g; };
  const NU = 'נו?';

  // ---------------------------------------------------------------- people (navy velvet kippot)
  const boyK = (Wd, i, fn) => { const Pp = K.boyP(Wd, i, fn); Wd.on(() => { const k = Pp.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); k.scale.multiplyScalar(1.12); } }); return Pp; };
  const manK = (Wd, look, fn, seed) => {
    const Pn = person(Wd, Object.assign({ kind: 'man', hat: 'kippa', glasses: false }, look), t => Object.assign({ seed: seed }, fn(t)), { scale: 1 }); (Wd.people = Wd.people || []).push(Pn);
    let fixed = false; Wd.on(() => { if (fixed || !Pn.figure) return; fixed = true; Pn.figure.group.traverse(m => { if (m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.thetaLength === .8) { m.scale.multiplyScalar(1.22); m.scale.y *= .94; m.rotation.x = 0; Pn.kippa = m; } }); });
    Wd.on(() => { const k = Pn.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } });
    return Pn;
  };
  const ABBA = { beardLen: .8, beard: '#4a2c18', skin: SKIN[1], pants: '#1b1d24', coat: '#2f3342' };
  const REBBE = { beardLen: 1.0, beard: '#5a5a5a', skin: SKIN[2], glasses: true, pants: '#15151a', coat: '#1a1a20' };

  // ---------------------------------------------------------------- icons + bubbles (grey = lashon hara, cream = other)
  const GREY = { run: 1, tree: 1, ear: 1, frown: 1, dust: 1 };
  const ICONS = {
    frown: (c, cx, cy, r) => {
      c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .08; c.strokeStyle = '#3a3320'; c.stroke();
      c.fillStyle = '#3a3320'; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(cx + sx * r * .38, cy - r * .12, r * .1, r * .15, 0, 0, 7); c.fill(); }
      c.lineCap = 'round'; c.lineWidth = r * .1; c.beginPath(); c.moveTo(cx - r * .62, cy - r * .3); c.lineTo(cx - r * .2, cy - r * .5); c.moveTo(cx + r * .62, cy - r * .3); c.lineTo(cx + r * .2, cy - r * .5); c.stroke();
      c.lineWidth = r * .12; c.beginPath(); c.arc(cx, cy + r * .78, r * .42, PI * 1.12, PI * 1.88); c.stroke(); },
    run: (c, cx, cy, r) => {
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#243058'; c.lineWidth = r * .15;
      c.beginPath(); c.moveTo(cx + .1 * r, cy - .35 * r); c.lineTo(cx - .1 * r, cy + .15 * r); c.moveTo(cx, cy - .25 * r); c.lineTo(cx + .6 * r, cy - .05 * r); c.moveTo(cx, cy - .25 * r); c.lineTo(cx - .55 * r, cy - .45 * r);
      c.moveTo(cx - .1 * r, cy + .15 * r); c.lineTo(cx + .5 * r, cy + .3 * r); c.lineTo(cx + .42 * r, cy + .8 * r); c.moveTo(cx - .1 * r, cy + .15 * r); c.lineTo(cx - .5 * r, cy + .5 * r); c.lineTo(cx - .85 * r, cy + .38 * r); c.stroke();
      c.beginPath(); c.arc(cx + .2 * r, cy - .62 * r, r * .24, 0, 7); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .08; c.stroke();
      c.lineWidth = r * .07; c.globalAlpha = .55; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(cx - 1.05 * r, cy - .3 * r + i * .3 * r); c.lineTo(cx - .75 * r, cy - .3 * r + i * .3 * r); c.stroke(); } c.globalAlpha = 1; },
    nu: (c, cx, cy, r) => {
      c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${r * 1.3}px ${FONT}`; c.lineJoin = 'round';
      c.strokeStyle = '#ffffff'; c.lineWidth = r * .14; c.strokeText(NU, cx, cy + r * .05); c.fillStyle = '#243058'; c.fillText(NU, cx, cy + r * .05); },
    askfig: (c, cx, cy, r) => {   // "?" + a small figure = "what happened with him?"
      c.direction = 'ltr'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${r * 1.5}px ${FONT}`; c.lineJoin = 'round';
      c.strokeStyle = '#ffffff'; c.lineWidth = r * .14; c.strokeText('?', cx - r * .78, cy + r * .05); c.fillStyle = '#d6262e'; c.fillText('?', cx - r * .78, cy + r * .05);
      const fx = cx + r * .62; c.strokeStyle = '#243058'; c.lineWidth = r * .14; c.lineCap = 'round'; c.fillStyle = '#7f8aa8';
      c.beginPath(); c.moveTo(fx, cy - .1 * r); c.lineTo(fx, cy + .5 * r); c.moveTo(fx - .5 * r, cy + .02 * r); c.lineTo(fx + .5 * r, cy + .02 * r); c.moveTo(fx, cy + .5 * r); c.lineTo(fx - .35 * r, cy + 1.0 * r); c.moveTo(fx, cy + .5 * r); c.lineTo(fx + .35 * r, cy + 1.0 * r); c.stroke();
      c.beginPath(); c.arc(fx, cy - .45 * r, r * .32, 0, 7); c.fillStyle = '#f2c8a0'; c.fill(); c.lineWidth = r * .09; c.stroke(); },
    zip: (c, cx, cy, r) => {   // a closed zipper
      c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); c.roundRect(cx - r * 1.1, cy - r * .3, r * 2.2, r * .6, r * .3); c.fillStyle = '#f0c63a'; c.fill(); c.lineWidth = r * .1; c.strokeStyle = '#243058'; c.stroke();
      c.lineWidth = r * .09; for (let i = 0; i < 9; i++) { const x = cx - r * .85 + i * r * .2; c.beginPath(); c.moveTo(x, cy - r * .3 * (i % 2 ? .1 : .7)); c.lineTo(x, cy + r * .3 * (i % 2 ? .7 : .1)); c.stroke(); }
      c.beginPath(); c.arc(cx + r * .98, cy, r * .22, 0, 7); c.fillStyle = '#c9ced8'; c.fill(); c.stroke(); },
    dust: (c, cx, cy, r) => {
      c.fillStyle = '#8a90a2'; [[-.6, .3, .2], [-.2, -.35, .26], [.3, .25, .22], [.55, -.3, .16], [0, .55, .13], [-.8, -.25, .12]].forEach(([x, y, s]) => { c.beginPath(); c.arc(cx + x * r, cy + y * r, s * r, 0, 7); c.fill(); }); },
    tree: (c, cx, cy, r) => ICONS.run(c, cx, cy, r),
    ear: (c, cx, cy, r) => ICONS.run(c, cx, cy, r),
  };
  const BT = {};
  const bubTex = kind => BT[kind] || (BT[kind] = canvasTex(768, 552, (c, W, H) => {
    const x0 = W * .04, y0 = H * .04, bw = W * .92, bh = H * .74, R = bh * .42;
    c.lineJoin = 'round'; c.beginPath(); c.roundRect(x0, y0, bw, bh, R); c.moveTo(W * .2, H * .74); c.lineTo(W * .1, H * .98); c.lineTo(W * .4, H * .74); c.closePath();
    c.fillStyle = GREY[kind] ? '#e1e4ec' : (kind === 'zip' ? '#dff4ff' : (kind === 'nu' ? '#fff3c4' : '#ffffff')); c.fill(); c.lineWidth = W * .02; c.strokeStyle = '#1c2745'; c.stroke();
    ICONS[kind](c, W / 2, y0 + bh / 2, bh * (kind === 'nu' ? .34 : .36)); }));
  function bubble3(Wd, kind) {
    const w = 1.6, h = 1.15, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: bubTex(kind), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 8; inner.add(m);
    const gl = glowSprite(w * 2.2, h * 2.4, 0); gl.material.color.set(GREY[kind] ? 0xb7bccb : 0xffe6a0); gl.position.z = -.12; inner.add(gl);
    bill(Wd, g);
    return { g, set(pos, s, a, rz) { const on = s > .01 && (a === undefined || a > .01); g.visible = on; if (!on) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; const al = a === undefined ? 1 : a; m.material.opacity = al; gl.material.opacity = .4 * al; } };
  }
  // a stream of "nu?" bubbles that pop out beside Shmuly and sweep in an arc OVER Motty's head to his far side (never through a head)
  function swirl(Wd, o) {
    const bs = []; for (let i = 0; i < o.n; i++) { const b = bubble3(Wd, 'nu'); bs.push(b); occ(Wd, b.g); }
    const Pd = o.n * o.gap, until = o.until === undefined ? 1e9 : o.until;
    Wd.on(t => bs.forEach((b, i) => {
      const e = t - o.t0 - i * o.gap; if (e < 0) { b.set([0, 0, 0], 0); return; }
      const k = Math.floor(e / Pd), u = (e - k * Pd) / o.life, spawn = o.t0 + i * o.gap + k * Pd;
      if (u >= 1 || spawn > until) { b.set([0, 0, 0], 0); return; }
      const rr = [1, 1.18, 1.36, 1.08][i % 4], th = (o.th0 + (o.th1 - o.th0) * sm(u)) * PI / 180, c = o.c;
      b.set([c[0] + o.rx * rr * Math.cos(th), c[1] + o.ry * rr * Math.sin(th) + .06 * Math.sin(u * 9 + i), c[2] + .3], popE(P(0, .14, u)) * o.s * (1 + .08 * Math.sin(u * 8 + i)), 1 - sm(P(.8, 1, u)), .14 * Math.sin(u * 6 + i));
    }));
    return bs;
  }
  // thought bubble: the story path - (what happened) . . . -> (a grey bubble)
  const THT = {};
  const thoughtTex = () => THT.t || (THT.t = canvasTex(1024, 640, (c, W, H) => {
    const cl = [[190, 330, 150], [360, 210, 160], [580, 170, 170], [800, 220, 160], [860, 400, 140], [680, 480, 150], [440, 490, 150], [250, 440, 120]];
    c.lineJoin = 'round'; c.fillStyle = '#1c2745'; cl.forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r + 14, 0, 7); c.fill(); }); c.fillRect(250, 220, 560, 250);
    c.fillStyle = '#ffffff'; cl.forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }); c.fillRect(250, 220, 560, 250);
    ICONS.run(c, 270, 330, 130);
    const x0 = 620, y0 = 215, bw = 270, bh = 230; c.beginPath(); c.roundRect(x0, y0, bw, bh, 80); c.fillStyle = '#d3d7e2'; c.fill(); c.lineWidth = 12; c.strokeStyle = '#1c2745'; c.stroke();
    ICONS.frown(c, x0 + bw / 2, y0 + bh / 2, 82); }));
  function thought(Wd) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), new THREE.MeshBasicMaterial({ map: thoughtTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 8; inner.add(m);
    const dots = [-.28, 0, .28].map(x => { const d = new THREE.Mesh(new THREE.CircleGeometry(.09, 20), new THREE.MeshBasicMaterial({ color: 0xf0a81c, transparent: true, depthWrite: false, fog: false, toneMapped: false })); d.position.set(x - .06, .02, .01); d.renderOrder = 9; inner.add(d); return d; });
    const arrow = new THREE.Mesh(new THREE.CircleGeometry(.13, 3), new THREE.MeshBasicMaterial({ color: 0xf0a81c, transparent: true, depthWrite: false, fog: false, toneMapped: false })); arrow.position.set(.5, .02, .01); arrow.rotation.z = -PI / 2 + PI; arrow.rotation.z = 0; arrow.renderOrder = 9; inner.add(arrow);
    const trail = [[-.55, -1.28, .15], [-.7, -1.56, .105], [-.8, -1.8, .07]].map(([x, y, r]) => { const b = new THREE.Mesh(new THREE.CircleGeometry(r * 1.0, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, fog: false, toneMapped: false })); const ol = new THREE.Mesh(new THREE.CircleGeometry(r * 1.22, 24), new THREE.MeshBasicMaterial({ color: 0x1c2745, transparent: true, depthWrite: false, fog: false, toneMapped: false })); ol.position.set(x, y, -.002); b.position.set(x, y, 0); ol.renderOrder = 8; b.renderOrder = 9; inner.add(ol); inner.add(b); return [b, ol]; });
    bill(Wd, g);
    return { g, set(pos, s, a, dk, rz, t) { const on = s > .01 && (a === undefined || a > .01); g.visible = on; if (!on) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; const al = a === undefined ? 1 : a;
      m.material.opacity = al; dots.forEach((d, i) => { const k = popE(clamp(dk - i * .8, 0, 1)); d.scale.setScalar(Math.max(.001, k * (1 + .22 * Math.sin((t || 0) * 7 - i)))); d.material.opacity = al; });
      arrow.scale.setScalar(Math.max(.001, popE(clamp(dk - 2.4, 0, 1)))); arrow.material.opacity = al; trail.forEach(([b, ol]) => { b.material.opacity = al; ol.material.opacity = al; }); } };
  }
  const GT = {}; const greyTex = () => GT.t || (GT.t = canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(120,126,142,1)'); r.addColorStop(.65, 'rgba(140,146,162,.8)'); r.addColorStop(1, 'rgba(180,186,200,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); }));
  // grey dust puff (the "avak" of lashon hara): soft grey clouds + drifting specks
  function dustPuff(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g);
    const sp = []; for (let i = 0; i < 9; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: greyTex(), transparent: true, depthWrite: false, fog: false, opacity: 0 })); g.add(s); sp.push(s); }
    const sk = []; for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.CircleGeometry(.05, 12), new THREE.MeshBasicMaterial({ color: 0x8a90a2, transparent: true, depthWrite: false, fog: false })); g.add(b); sk.push(b); }
    bill(Wd, g);
    return { g, set(pos, s, a, t) { const on = s > .01 && a > .01; g.visible = on; if (!on) return; g.position.set(pos[0], pos[1], pos[2]);
      sp.forEach((q, i) => { const ang = i * 2.1 + t * .5; q.position.set(Math.cos(ang) * .32 * s, Math.sin(ang * 1.3) * .2 * s, 0); const z = (.55 + .12 * (i % 3)) * s; q.scale.set(z, z, 1); q.material.opacity = a; });
      sk.forEach((b, i) => { const ph = (t * .6 + i * .37) % 1; b.position.set((-.6 + i * .2) * s + .1 * Math.sin(t * 3 + i), (-.35 + ph * .9) * s, .02); b.scale.setScalar(s * (1 - ph * .6)); b.material.opacity = a * (1 - ph); }); } };
  }
  const motes = (Wd, n, col) => { const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(.22, .22, 0); s.material.color.set(col); Wd.add(s); sp.push(s); }
    return (t, c, rad, k) => sp.forEach((s, i) => { const a = t * .7 + i * 2.4, r = rad * (.7 + .3 * ((i * 7) % 5) / 4); s.position.set(c[0] + Math.cos(a) * r, c[1] + Math.sin(a * 1.3) * rad * .35, c[2] + .3 + Math.sin(a) * .3); s.material.opacity = k * (.35 + .45 * Math.sin(t * 3 + i * 1.7) ** 2); }); };
  const rays = Wd => { const arr = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 12), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(-8 + i * 2.8, 5, -4 + (i % 2)); m.rotation.z = .4; Wd.add(m); arr.push(m); }
    return k => arr.forEach((m, i) => m.material.opacity = k * (.16 + .06 * Math.sin(i * 2 + k * 3))); };

  // ---------------------------------------------------------------- rooms
  const dayTex = () => canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fbcf2'); gr.addColorStop(1, '#eaf6ff'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff'; for (const [x, y, r] of [[34, 70, 20], [60, 62, 26], [86, 74, 18], [80, 150, 18], [58, 156, 24]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.fillStyle = '#6aa65a'; c.fillRect(0, h - 36, w, 36); });
  function win(Wd, x, y0, z, w, h) {
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), bm(0xffffff, { map: dayTex() })); pn.position.z = .02;
    const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .05], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
  }
  function livingRoom(Wd) {
    const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: 0xf4e8cc, beams: false });
    for (const x of [-2.9, 2.9]) { win(Wd, x, 1.0, -R.HZ + .02, 1.5, 2.1); for (const dx of [-1, 1]) Wd.add(box(.4, 2.4, .12, 0xd9a05f, { pos: [x + dx * 1.0, 1.9, -R.HZ + .12], ink: false })); }
    Wd.add(box(5.2, .012, 3.4, 0x9a3a34, { pos: [.1, .006, -1.4], ink: false })); Wd.add(box(4.8, .016, 3.0, 0xd9a63a, { pos: [.1, .009, -1.4], ink: false })); Wd.add(box(4.5, .02, 2.7, 0x9a3a34, { pos: [.1, .012, -1.4], ink: false }));
    Wd.add(box(1.6, 2.5, .5, 0x7a4a2a, { pos: [-4.6, 1.25, -R.HZ + .35] })); const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.3), toon(0xffffff, { map: booksTex(8) })); sh.position.set(-4.6, 1.25, -R.HZ + .62); Wd.add(sh);
    Wd.add(box(.9, .7, .08, 0x2f5a8a, { pos: [0, 2.5, -R.HZ + .08], ink: false })); Wd.add(box(.78, .58, .09, 0xe9c26a, { pos: [0, 2.5, -R.HZ + .1], ink: false }));
    Wd.add(box(1.0, .5, .6, 0x7a4a2a, { pos: [4.6, .25, -R.HZ + .5] })); Wd.add(cyl(.05, .07, 1.6, 0x555a66, { pos: [4.6, 1.3, -R.HZ + .5] })); Wd.add(ball(.34, 0xfff0c0, { pos: [4.6, 2.2, -R.HZ + .5], ink: false }));
    return R;
  }
  function classRoom2(Wd) {
    const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: 0xf6ecd2, beams: false });
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.7), new THREE.MeshBasicMaterial({ map: canvasTex(512, 192, (c, w, h) => { c.fillStyle = '#2f5a46'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 6; c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(40 + i * 40, 50 + i * 28); c.bezierCurveTo(100 + i * 50, 20 + i * 36, 160, 90 + i * 20, 250 + i * 30, 56 + i * 24); c.stroke(); }
      c.beginPath(); c.arc(390, 96, 52, 0, 7); c.stroke(); c.beginPath(); c.moveTo(340, 150); c.lineTo(440, 150); c.stroke(); }), fog: false, toneMapped: false })); bd.position.set(-1.0, 2.15, -R.HZ + .07); Wd.add(bd);
    Wd.add(box(4.9, 2.0, .1, 0x8a5a34, { pos: [-1.0, 2.15, -R.HZ + .04] })); Wd.add(box(4.9, .08, .22, 0x8a5a34, { pos: [-1.0, 1.2, -R.HZ + .14], ink: false }));
    win(Wd, 3.3, 1.0, -R.HZ + .02, 1.5, 2.2); win(Wd, -4.6, 1.0, -R.HZ + .02, 1.3, 2.2);
    for (const [x, z] of [[-3.6, -3.2], [-1.8, -3.2], [1.8, -3.2], [3.6, -3.2], [-3.6, -4.0], [3.6, -4.0]]) desk(Wd, x, z, PI);
    Wd.add(box(1.7, .9, .5, 0x7a4a2a, { pos: [4.6, .45, -1.0] })); Wd.add(box(.1, 1.8, 2.6, 0x7a4a2a, { pos: [5.35, .9, -1.4] }));
    return R;
  }
  const armchair = (Wd, x, z, ry) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; Wd.add(g);
    g.add(box(1.0, .34, .9, 0x9a3a34, { pos: [0, .28, 0] })); g.add(box(1.0, .95, .2, 0x8a2f2a, { pos: [0, .82, -.42] }));
    for (const sx of [-1, 1]) g.add(box(.2, .55, .9, 0x8a2f2a, { pos: [sx * .5, .46, 0] }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(.08, .12, .08, 0x4a2c18, { pos: [sx * .42, .06, sz * .38], ink: false }));
    return g;
  };
  const roomW = () => mkWorld({ skyTop: 0x6fb4f0, skyBottom: 0xfff0d2, hemi: 1.6, sun: 1.8 });

  // ---------------------------------------------------------------- shared actors in the yard
  const M0 = [0, 0, 0], SH0 = [1.2, 0, .12];
  const mottyBase = { pos: M0 };

  // ---------------------------------------------------------------- 1. HOOK 0-14: Shmuly tugs Motty's sleeve, "nu?" bubbles around, big "?"
  function hook(dur) {
    const Wd = yardWorld({ noBall: true });
    boyK(Wd, MOTTY, t => ({ pos: [.05 * Math.sin(t * 5.2), 0, 0], facing: face(.75, .65) + .08 * Math.sin(t * 5.2), gesture: t > 8 ? 'shrug' : (t > 4 ? 'think' : null), perform: .3, talk: 0, smile: 0, brow: .6, look: .3 }));
    boyK(Wd, SHMULY, t => ({ pos: [SH0[0] + .07 * Math.sin(t * 5.2 + 1), 0, SH0[2]], facing: face(-1, -.1), gesture: 'point', perform: .4, talk: .75 * talkAmt(t, 3), smile: 0, brow: .3 }));
    swirl(Wd, { n: 11, gap: .55, life: 3.6, t0: .5, c: [0, 1.4, 0], rx: 1.45, ry: .95, th0: 62, th1: 215, s: .46 });
    Wd.noQ = true; const qm = qmark(Wd, '#5ec8ff', 1.1), fw = new THREE.Vector3(), up = new THREE.Vector3(), rt = new THREE.Vector3();
    Wd.on((t, cam) => { cam.getWorldDirection(fw); up.set(0, 1, 0).applyQuaternion(cam.quaternion); rt.set(1, 0, 0).applyQuaternion(cam.quaternion);
      const p = cam.position.clone().addScaledVector(fw, 8).addScaledVector(up, 2.5).addScaledVector(rt, -.2); qm.set([p.x, p.y + .08 * Math.sin(t * 1.7), p.z], popE(P(3.0, 4.0, t)) * 1.1, .12 * Math.sin(t * 1.1)); });
    Wd.center = [.6, 0];
    Wd.cam = cine([C(0, [.55, 1.5, 0], 4.5, .3, -20, 44, 0), C(5, [.55, 1.5, 0], 4.1, .25, 4, 44, 0), C(10, [.55, 1.5, 0], 4.0, .3, 16, 44, 0), C(14, [.55, 1.5, 0], 4.4, .3, 8, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: Motty alone, a grey bubble rises by itself -> red cross -> pops (twice)
  function s2(dur) {
    const Wd = yardWorld({ noBall: true });
    const A = [[2.6, 6.4], [8.6, 11.8]];
    boyK(Wd, MOTTY, t => { const tell = A.some(([a, b]) => t > a - .2 && t < a + 2.2), shock_ = A.some(([a, b]) => t > a + 2.4 && t < b + .8);
      return { pos: M0, facing: face(.55, .8) + (shock_ ? .2 * Math.sin(t * 6) : 0), gesture: shock_ ? 'headdown' : (t < 2.4 ? 'think' : null), perform: .3, talk: tell ? .5 * talkAmt(t, 2) : 0, smile: shock_ ? 0 : (t > 12.5 ? .3 : 0), brow: shock_ ? .7 : .3 }; });
    const bs = A.map(() => bubble3(Wd, 'frown')), xs = A.map(() => mark3d(Wd, 'cross', 1.0)), sk = A.map(() => shock(Wd, 0xff8a8a)), pk = A.map(() => shock(Wd, 0xd8dde8));
    bs.forEach(b => occ(Wd, b.g)); xs.forEach(x => occ(Wd, x.g));
    Wd.on(t => A.forEach(([a, b], i) => {
      const grow = popE(P(a, a + 1.4, t)), rise = sm(P(a, a + 3.0, t)), popOut = 1 - ease.in(P(b, b + .28, t)), s = grow * .85 * popOut * (1 + .03 * Math.sin(t * 4));
      const pos = [M0[0] + .1, 2.15 + .25 * rise + .05 * Math.sin(t * 1.6 + i), M0[2] + .2];
      bs[i].set(pos, t > b + .3 ? 0 : s, 1, .05 * Math.sin(t * 2 + i));
      const xt = a + 2.6, xs_ = t > xt ? popE(P(xt, xt + .55, t)) * (1 - sm(P(b + 1.6, b + 2.4, t))) : 0;
      xs[i].set([M0[0] + 1.5, 2.1 + .05 * rise, M0[2] + .3], xs_ * .55, .06 * Math.sin(t * 3));
      sk[i].set([M0[0] + 1.5, 2.1 + .05 * rise, M0[2] + .4], P(xt, xt + .8, t) * (t > xt ? 1 : 0), 1.3);
      pk[i].set(pos, P(b, b + .6, t) * (t > b ? 1 : 0), 2.0); }));
    Wd.center = [.3, 0];
    Wd.cam = cine([C(0, [.35, 1.55, 0], 4.4, .3, -22, 44, 0), C(5, [.4, 1.55, 0], 4.0, .25, 6, 44, 0), C(10, [.4, 1.55, 0], 4.0, .25, 16, 44, 0), C(14, [.4, 1.55, 0], 4.4, .3, -8, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-44: Shmuly presses harder; many "nu?" bubbles circle; a grey bubble tries -> same cross; zipper
  function s3(dur) {
    const Wd = yardWorld({ noBall: true });
    boyK(Wd, MOTTY, t => ({ pos: [.06 * Math.sin(t * 7), 0, 0], facing: face(.75, .65) + .1 * Math.sin(t * 7), gesture: t < 5 ? 'think' : (t < 9 ? 'headdown' : null), perform: .3, talk: 0, smile: 0, brow: .7 }));
    boyK(Wd, SHMULY, t => ({ pos: [SH0[0] + .1 * Math.sin(t * 7 + 1), 0, SH0[2]], facing: face(-1, -.1), gesture: t < 11 ? 'point' : 'shrug', perform: .4, talk: t < 10.5 ? .85 * talkAmt(t, 3) : 0, smile: 0, brow: .4 }));
    swirl(Wd, { n: 20, gap: .26, life: 3.4, t0: 0, until: 10, c: [0, 1.4, 0], rx: 1.4, ry: .95, th0: 62, th1: 220, s: .44 });
    const gb = bubble3(Wd, 'frown'), x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff8a8a), pk = shock(Wd, 0xd8dde8), zp = bubble3(Wd, 'zip'); occ(Wd, gb.g); occ(Wd, x.g); occ(Wd, zp.g);
    Wd.on(t => {
      const a = 4.2, b = 8.4, grow = popE(P(a, a + 1.2, t)), rise = sm(P(a, a + 3.0, t)), s = grow * .85 * (1 - ease.in(P(b, b + .28, t)));
      const pos = [M0[0] - .15, 2.3 + .2 * rise, M0[2] + .2]; gb.set(pos, t > b + .3 ? 0 : s, 1, .05 * Math.sin(t * 2));
      const xt = 6.2, xv = t > xt ? popE(P(xt, xt + .55, t)) * (1 - sm(P(b + 1.6, b + 2.4, t))) : 0; x.set([M0[0] + 1.5, 2.2, M0[2] + .3], xv * .55, .06 * Math.sin(t * 3)); sk.set([M0[0] + 1.5, 2.2, M0[2] + .4], P(xt, xt + .8, t) * (t > xt ? 1 : 0), 1.3); pk.set(pos, P(b, b + .6, t) * (t > b ? 1 : 0), 2.0);
      zp.set([M0[0] - 1.1, 1.5 + .04 * Math.sin(t * 2.2), M0[2] + .25], popE(P(9.6, 10.4, t)) * .5 * (1 + .04 * Math.sin(t * 5)), 1, .08 * Math.sin(t * 3)); });
    Wd.center = [.5, 0];
    Wd.cam = cine([C(0, [.45, 1.42, 0], 4.6, .3, -24, 44, 0), C(6, [.45, 1.42, 0], 4.2, .25, 8, 44, 0), C(11, [.4, 1.42, 0], 4.0, .25, 20, 44, 0), C(16, [.4, 1.42, 0], 4.4, .3, 0, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-60: living room: Abba asks, Motty's thought leads into a grey bubble
  function askScene(Wd, asker, askerPos, askerFace, seated, o) {
    // Motty on the left; the asker (Abba seated / Rebbe standing) on the right; both turned to each other
    const MP = [-1.3, 0, -1.7];
    boyK(Wd, MOTTY, t => ({ pos: MP, facing: face(.9, .55), gesture: o.mGesture(t), perform: .1, talk: 0, smile: 0, brow: o.mBrow(t) }));
    manK(Wd, asker, t => Object.assign({ pos: askerPos, facing: askerFace }, seated ? { sit: true, groundY: 0 } : {}, o.aState(t)), .5);
    const ab = bubble3(Wd, 'askfig'), th = thought(Wd); occ(Wd, ab.g); occ(Wd, th.g);
    const ax = askerPos[0], T0 = o.tq;
    Wd.on(t => { const k = popE(P(T0, T0 + .9, t)) * (1 - sm(P(o.tEndQ, o.tEndQ + .7, t)));
      ab.set([ax - .1, o.qy + .06 * Math.sin(t * 1.5), askerPos[2] + .2], k * .95 * (1 + .03 * Math.sin(t * 4)), 1, .05 * Math.sin(t * 2));
      const tk = popE(P(o.tTh, o.tTh + 1.0, t)) * (1 - sm(P(o.tEndTh, o.tEndTh + .8, t)));
      th.set([MP[0] - .35, 3.45, MP[2] + .2], tk * .62, 1, clamp(t - o.tTh - .6, 0, 4) * 1.0, .02 * Math.sin(t * 1.4), t); });
    return { MP };
  }
  function s4(dur) {
    const Wd = roomW(); livingRoom(Wd);
    const AP = [1.7, 0, -1.7], AF = face(-1, .4); armchair(Wd, AP[0], AP[2], AF);
    askScene(Wd, ABBA, AP, AF, true, { tq: 2.0, tEndQ: 10.4, qy: 2.95, tTh: 5.0, tEndTh: 13.6,
      mGesture: t => t < 4.6 ? null : (t < 11 ? 'headdown' : null), mBrow: t => t < 4.6 ? .2 : .6,
      aState: t => ({ gesture: t > 1.8 && t < 8 ? 'explain' : null, talk: t > 2 && t < 5.4 ? .5 * talkAmt(t, 5) : 0, smile: 0, perform: .3, brow: .1 }) });
    Wd.center = [.2, -1.7];
    Wd.cam = cine([C(0, [.2, 1.7, -1.7], 6.4, .4, -16, 44, 0), C(6, [.2, 1.75, -1.7], 5.9, .3, 6, 44, 0), C(11, [.2, 1.75, -1.7], 5.8, .3, 16, 44, 0), C(16, [.2, 1.7, -1.7], 6.2, .4, 2, 44, 0)]);
    return Wd;
  }
  // ---------------------------------------------------------------- 5. 60-74: classroom: the Rebbe asks the same
  function s5(dur) {
    const Wd = roomW(); classRoom2(Wd);
    const RP = [1.5, 0, -1.7], RF = face(-1, .45);
    askScene(Wd, REBBE, RP, RF, false, { tq: 1.6, tEndQ: 8.4, qy: 3.05, tTh: 4.0, tEndTh: 12.0,
      mGesture: t => t < 3.6 ? null : (t < 10 ? 'headdown' : null), mBrow: t => t < 3.6 ? .2 : .6,
      aState: t => ({ gesture: t > 1.4 && t < 6.6 ? 'offer' : null, talk: t > 1.6 && t < 4.4 ? .5 * talkAmt(t, 6) : 0, smile: 0, perform: .3, brow: .1 }) });
    Wd.center = [.1, -1.7];
    Wd.cam = cine([C(0, [.15, 1.7, -1.7], 6.4, .4, 16, 44, 0), C(6, [.15, 1.75, -1.7], 5.9, .3, -4, 44, 0), C(10, [.15, 1.75, -1.7], 5.8, .3, -14, 44, 0), C(14, [.15, 1.7, -1.7], 6.2, .4, -4, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 74-88: classroom: a grey bubble + cross, and a small dust puff + smaller cross; Motty lowers his eyes, zipper
  function s6(dur) {
    const Wd = roomW(); classRoom2(Wd);
    const MP = [-1.3, 0, -1.7], RP = [1.5, 0, -1.7];
    boyK(Wd, MOTTY, t => ({ pos: MP, facing: face(.9, .55), gesture: t > 2.4 ? 'headdown' : null, perform: .1, talk: 0, smile: 0, brow: .6 }));
    manK(Wd, REBBE, t => ({ pos: RP, facing: face(-1, .45), gesture: null, perform: .3, talk: 0, smile: 0, brow: .1 }), .5);
    const gb = bubble3(Wd, 'frown'), x1 = mark3d(Wd, 'cross', 1.0), x2 = mark3d(Wd, 'cross', .6), sk1 = shock(Wd, 0xff8a8a), sk2 = shock(Wd, 0xff8a8a), dp = dustPuff(Wd), zp = bubble3(Wd, 'zip');
    [gb, x1, x2, dp, zp].forEach(o => occ(Wd, o.g));
    Wd.on(t => {
      gb.set([MP[0] - .55, 2.95 + .06 * Math.sin(t * 1.6), MP[2] + .2], popE(P(1.2, 2.2, t)) * .8 * (1 + .03 * Math.sin(t * 4)), 1, .05 * Math.sin(t * 2));
      const x1k = t > 3.0 ? popE(P(3.0, 3.55, t)) : 0; x1.set([MP[0] + .65, 3.3, MP[2] + .3], x1k * 1.0, .06 * Math.sin(t * 3)); sk1.set([MP[0] + .65, 3.3, MP[2] + .4], P(3.0, 3.8, t) * (t > 3.0 ? 1 : 0), 1.3);
      const dk = popE(P(3.2, 4.4, t)); dp.set([MP[0] + 1.5, 2.75 + .06 * Math.sin(t * 1.8), MP[2] + .25], dk * 1.7, dk, t);
      const x2k = t > 5.4 ? popE(P(5.4, 5.95, t)) : 0; x2.set([MP[0] + 2.55, 3.45, MP[2] + .3], x2k * 1.0, .06 * Math.sin(t * 3)); sk2.set([MP[0] + 2.55, 3.45, MP[2] + .4], P(5.4, 6.2, t) * (t > 5.4 ? 1 : 0), 1.0);
      zp.set([MP[0] - 1.0, 1.6 + .04 * Math.sin(t * 2.2), MP[2] + .25], popE(P(9.4, 10.2, t)) * .5 * (1 + .04 * Math.sin(t * 5)), 1, .08 * Math.sin(t * 3)); });
    Wd.center = [.1, -1.7];
    Wd.cam = cine([C(0, [.3, 1.75, -1.7], 6.6, .4, 14, 44, 0), C(6, [.3, 1.8, -1.7], 6.1, .3, -2, 44, 0), C(10, [.3, 1.8, -1.7], 6.0, .3, -12, 44, 0), C(14, [.3, 1.75, -1.7], 6.4, .4, -2, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 88-100: recap row of three cards (cross each), Motty in the middle with closed lips, warm light
  const pict = {
    boy: (c, x, y, s, beard) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#243058'; c.lineWidth = s * .09; c.fillStyle = '#4a5a8a'; c.beginPath(); c.roundRect(x - s * .34, y + s * .1, s * .68, s * .9, s * .12); c.fill(); c.stroke();
      c.beginPath(); c.arc(x, y - s * .15, s * .3, 0, 7); c.fillStyle = '#f2c8a0'; c.fill(); c.stroke();
      c.beginPath(); c.arc(x, y - s * .22, s * .3, PI * 1.08, PI * 1.92); c.closePath(); c.fillStyle = '#1f2f70'; c.fill(); c.stroke();
      if (beard) { c.beginPath(); c.moveTo(x - s * .26, y - s * .08); c.quadraticCurveTo(x, y + s * .5, x + s * .26, y - s * .08); c.fillStyle = '#4a4a4a'; c.fill(); c.stroke(); } },
  };
  const cardDraw = (kind) => (c, w, h) => {
    c.fillStyle = '#fff6dc'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b8870f'; c.lineWidth = 10; c.strokeRect(10, 10, w - 20, h - 20);
    const cy = h * .6, S = h * .42;
    if (kind === 0) { pict.boy(c, w * .42, cy, S); c.beginPath(); c.roundRect(w * .52, h * .12, w * .38, h * .3, 36); c.fillStyle = '#d3d7e2'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#1c2745'; c.stroke(); ICONS.frown(c, w * .71, h * .27, h * .1); }
    if (kind === 1) { pict.boy(c, w * .3, cy, S); pict.boy(c, w * .62, cy, S); c.lineWidth = 8; c.strokeStyle = '#1c2745'; c.beginPath(); c.roundRect(w * .52, h * .08, w * .4, h * .26, 34); c.fillStyle = '#fff3c4'; c.fill(); c.stroke(); ICONS.nu(c, w * .72, h * .21, h * .09); c.beginPath(); c.roundRect(w * .07, h * .12, w * .3, h * .24, 30); c.fillStyle = '#d3d7e2'; c.fill(); c.stroke(); ICONS.frown(c, w * .22, h * .24, h * .08); }
    if (kind === 2) { pict.boy(c, w * .3, cy, S, true); pict.boy(c, w * .64, cy + S * .08, S * .85); c.lineWidth = 8; c.strokeStyle = '#1c2745'; c.beginPath(); c.roundRect(w * .1, h * .08, w * .42, h * .27, 34); c.fillStyle = '#ffffff'; c.fill(); c.stroke(); ICONS.askfig(c, w * .31, h * .21, h * .08);
      c.beginPath(); c.roundRect(w * .56, h * .12, w * .34, h * .24, 30); c.fillStyle = '#d3d7e2'; c.fill(); c.stroke(); ICONS.frown(c, w * .73, h * .24, h * .075); }
  };
  function s7(dur) {
    const Wd = yardWorld({ noBall: true }), ryz = rays(Wd), mt = motes(Wd, 12, 0xfff0a0), sparks = motes(Wd, 14, 0xb8ffd0);
    boyK(Wd, MOTTY, t => ({ pos: M0, facing: face(t < 1 ? .1 : t < 3.2 ? -.7 : t < 5.4 ? 0 : t < 7.4 ? .7 : .1, 1), gesture: t > 8.2 ? 'thumb' : (t > 7.2 ? 'headdown' : null), perform: .3, talk: 0, smile: t > 8 ? .9 : .1, brow: t > 8 ? 0 : .3 }));
    const CX = [-2.0, -.1, 1.8], cards = CX.map((x, i) => board(Wd, { w: 2.5, h: 1.8, cw: 640, frame: 0x6b3a1c, glow: 0xffd27a, draw: cardDraw(i) })), xs = CX.map(() => mark3d(Wd, 'cross', 1.0)), sks = CX.map(() => shock(Wd, 0xff8a8a)), zp = bubble3(Wd, 'zip');
    cards.forEach(c => occ(Wd, c.g)); xs.forEach(x => occ(Wd, x.g)); occ(Wd, zp.g);
    const CY = 2.65, T = [1.0, 3.2, 5.4], hg = glowSprite(1, 1, 0); hg.material.color.set(0xffd27a); Wd.add(hg);
    lighting(Wd, t => ({ hemi: lerp(1.3, 1.6, sm(P(2, 10, t))), sun: lerp(1.6, 2.0, sm(P(2, 10, t))) }));
    Wd.on(t => {
      cards.forEach((c, i) => { const k = popE(P(T[i] - .4, T[i] + .3, t)); c.set([CX[i], CY + .05 * Math.sin(t * 1.4 + i) + (t > T[i] - .4 ? .22 * Math.exp(-(t - T[i] + .4) * 3.5) * Math.sin((t - T[i] + .4) * 13) : 0), -.6], k * .56 * (1 - sm(P(8.4, 9.2, t))), .06 * Math.sin(t * .9 + i)); });
      xs.forEach((x, i) => { const k = t > T[i] + .5 ? popE(P(T[i] + .5, T[i] + 1.05, t)) : 0; x.set([CX[i] + .45, CY + .42, -.1], k * .65 * (1 - sm(P(8.4, 9.2, t))), .06 * Math.sin(t * 3 + i)); sks[i].set([CX[i] + .45, CY + .42, 0], P(T[i] + .5, T[i] + 1.3, t) * (t > T[i] + .5 ? 1 : 0), 1.3); });
      zp.set([M0[0] - 1.5, 1.5 + .04 * Math.sin(t * 2.2), M0[2] + .25], popE(P(.4, 1.2, t)) * .75 * (1 + .04 * Math.sin(t * 5)), 1, .08 * Math.sin(t * 3));
      const wk = sm(P(2, 10, t)); hg.position.set(0, 1.6, -1.2); hg.scale.set(1.5 + 3.5 * wk, 1.5 + 3.5 * wk, 1); hg.material.opacity = .5 * wk; ryz(.55 * sm(P(2.5, 8, t))); sparks(t, [0, 1.9, 0], 3.0, sm(P(4, 8, t))); mt(t, [0, 2.4, 0], 4.2, sm(P(3, 7, t))); });
    Wd.center = [0, 0];
    Wd.cam = cine([C(0, [0, 1.9, 0], 7.2, .35, -26, 46, 0), C(5, [0, 1.75, 0], 6.4, .3, -8, 46, 0), C(8.6, [0, 1.3, 0], 5.4, .3, 8, 46, 0), C(12, [0, .62, 0], 4.2, .25, 18, 46, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: boys play ball behind the card
  function answerBg(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd); ry(.8);
    const xs = [-3.4, -1.7, 0, 1.7, 3.4], ids = [1, SHMULY, MOTTY, 4, 5], bl = K.soccer(Wd, .15), per = 1.1;
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
