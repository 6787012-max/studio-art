// halashon-08 story: "and if I disparage myself too?" - 3D choreography per storyboards_v9.md (B). Boys only. Everything is a function of time.
// Grey bubble carries two boy ICONS (no words about anyone). Test sheets show scribbles + a grey mark only. Hebrew words in the 3D world come from H() (latin spelling), so this file holds no raw Hebrew.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, boyP, talkAmt, face, mkWorld, plainRoom, desk, mark3d, shock, qmark, popE, lighting,
    glowSprite, canvasTex, FONT, bill, fitText, archShape, toon, bm, booksTex } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly === undefined ? -.1 * d : ly];
  const occ = (Wd, g) => { (Wd.occ = Wd.occ || []).push(g); return g; };

  const HL = 'abgdhvzxtyKklMmNnsepPCcqrwT';
  const H = s => s.split('').map(ch => { const i = HL.indexOf(ch); return i < 0 ? ch : String.fromCharCode(0x5d0 + i); }).join('');
  const W_TAG1 = H('qvdM el ecmy'), W_TAG2 = H('el ecmv') + ' — ' + H('zh la mTqN'), W_STAMP = H('lwvN hre');

  // ---------------------------------------------------------------- people (navy velvet kippot, NO scaling of the kippa mesh)
  const boyK = (Wd, i, fn) => { const Pp = boyP(Wd, i, fn); Wd.on(() => { if (!Pp.kippa && Pp.figure) Pp.figure.group.traverse(m => { if (!Pp.kippa && m.isMesh && m.geometry && m.geometry.type === 'SphereGeometry' && Math.abs(m.geometry.parameters.thetaLength - .86) < .02) Pp.kippa = m; }); const k = Pp.kippa; if (k && !k._rc) { k._rc = 1; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }); return Pp; };
  const TZ = [-.6, 0, -2.0], YO = [1.8, 0, -2.0], DV = [-4.1, 0, -2.7];
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _k = new THREE.Vector3();
  const handMid = (per, fb) => { const B = per.figure && per.figure.bones; if (!B) return fb; B.handA.getWorldPosition(_a); B.handB.getWorldPosition(_b); return [(_a.x + _b.x) / 2, (_a.y + _b.y) / 2, (_a.z + _b.z) / 2]; };
  const handOne = (per, side, fb) => { const B = per.figure && per.figure.bones; if (!B) return fb; B['hand' + side].getWorldPosition(_a); return [_a.x, _a.y, _a.z]; };
  const headPos = (per, fb) => { if (!per.kippa) return fb; per.kippa.getWorldPosition(_k); return [_k.x, _k.y, _k.z]; };

  // custom arm poses, applied after the engine's own pose (the figure's pose() resets every bone each call, so a full pose is safe)
  const REST = { armA: [.04, 0, .3], foreA: [-.22, 0, .12], armB: [.04, 0, -.3], foreB: [-.22, 0, -.12] };
  const HOLD = { armA: [-.55, 0, .02], foreA: [-.85, -.9, 0], armB: [-.55, 0, -.02], foreB: [-.85, .9, 0] };
  const CHEST = { armA: REST.armA, foreA: REST.foreA, armB: [-.4, 0, -.4], foreB: [-1.7, 0, -1.2] };
  const EXPL = { armA: REST.armA, foreA: REST.foreA, armB: [-.4, 0, .22], foreB: [-1.05, .3, 0] };
  const PALM = { armA: [-.5, 0, -.05], foreA: [-2.2, 0, .2], armB: REST.armB, foreB: REST.foreB };
  const mixA = (a, b, u) => { const o = {}; for (const k in a) o[k] = a[k].map((v, i) => v + (b[k][i] - v) * u); return o; };
  const drive = (Wd, Pp, fn) => Wd.on(t => { if (!Pp.figure) return; const s = fn(t), pose = Object.assign({}, s.arms, { chest: [(s.chest || 0) + .018 * Math.sin(t * 1.7), 0, 0], hips: [0, 0, 0], head: s.head || [0, 0, 0] }); if (s.fist) pose.fist = s.fist; Pp.figure.pose(pose); });

  // ---------------------------------------------------------------- the classroom
  const dayTex = () => canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fbcf2'); gr.addColorStop(1, '#eaf6ff'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff'; for (const [x, y, r] of [[34, 70, 20], [60, 62, 26], [86, 74, 18], [80, 150, 18], [58, 156, 24]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.fillStyle = '#6aa65a'; c.fillRect(0, h - 36, w, 36); });
  function win(Wd, x, y0, z, w, h) {
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), bm(0xffffff, { map: dayTex() })); pn.position.z = .02;
    const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .05], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
  }
  // a test sheet lying on a desk: scribble lines + one grey mark, no words
  const sheetTex = canvasTex(256, 330, (c, W, Hh) => {
    c.fillStyle = '#fffdf6'; c.fillRect(0, 0, W, Hh); c.strokeStyle = '#1c2745'; c.lineWidth = 8; c.strokeRect(4, 4, W - 8, Hh - 8);
    c.strokeStyle = '#2b3558'; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round';
    for (let r = 0; r < 8; r++) { const y = Hh * (.34 + r * .075); let x = W * .12; c.beginPath(); c.moveTo(x, y); let i = 0; while (x < W * (.88 - (r % 3) * .12)) { const sg = 9 + 8 * Math.abs(Math.sin(x * .17 + r)), am = 7 + 9 * Math.abs(Math.sin(x * .09 + r * 2)); c.quadraticCurveTo(x + sg * .5, y - am, x + sg, y + (i % 2 ? 4 : -3)); x += sg; i++; } c.stroke(); }
    for (let r = 0; r < 2; r++) { const y = Hh * (.12 + r * .07); c.beginPath(); c.moveTo(W * .12, y); c.quadraticCurveTo(W * .3, y - 10, W * .5, y + 3); c.quadraticCurveTo(W * .6, y + 8, W * .66 - r * W * .1, y); c.stroke(); }
    c.fillStyle = 'rgba(122,128,146,.55)'; c.beginPath(); c.arc(W * .74, Hh * .16, W * .14, 0, 7); c.fill(); c.lineWidth = 9; c.strokeStyle = '#7a8092'; c.beginPath(); c.arc(W * .74, Hh * .16, W * .14, 0, 7); c.stroke(); });
  function classRoom(Wd) {
    const R = plainRoom(Wd, { HX: 5.8, HZ: 4.5, H: 4.6, wall: 0xf6ecd2, beams: false });
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.7), new THREE.MeshBasicMaterial({ map: canvasTex(512, 192, (c, w, h) => { c.fillStyle = '#2f5a46'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 6; c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(40 + i * 40, 50 + i * 28); c.bezierCurveTo(100 + i * 50, 20 + i * 36, 160, 90 + i * 20, 250 + i * 30, 56 + i * 24); c.stroke(); }
      c.beginPath(); c.arc(390, 96, 52, 0, 7); c.stroke(); c.beginPath(); c.moveTo(340, 150); c.lineTo(440, 150); c.stroke(); }), fog: false, toneMapped: false })); bd.position.set(-1.0, 2.4, -R.HZ + .07); Wd.add(bd);
    Wd.add(box(4.9, 2.0, .1, 0x8a5a34, { pos: [-1.0, 2.4, -R.HZ + .04] })); Wd.add(box(4.9, .08, .22, 0x8a5a34, { pos: [-1.0, 1.45, -R.HZ + .14], ink: false }));
    win(Wd, 4.0, 1.0, -R.HZ + .02, 1.5, 2.6); win(Wd, -4.9, 1.0, -R.HZ + .02, 1.3, 2.6);
    for (const [x, z] of [[-3.8, -3.3], [-1.9, -3.5], [1.0, -3.5], [3.8, -3.3], [-3.8, -4.1], [3.8, -4.1]]) {
      desk(Wd, x, z, PI); const sp = new THREE.Mesh(new THREE.PlaneGeometry(.34, .44), new THREE.MeshBasicMaterial({ map: sheetTex, fog: false, toneMapped: false })); sp.rotation.x = -PI / 2; sp.rotation.z = .2 * (x > 0 ? 1 : -1); sp.position.set(x + .1, .655, z + .02); Wd.add(sp); }
    Wd.add(box(1.7, .9, .5, 0x7a4a2a, { pos: [5.0, .45, -1.5] }));
    Wd.center = [.2, -2];
    return R;
  }
  const world = () => { const Wd = mkWorld({ skyTop: 0x6fb4f0, skyBottom: 0xfff0d2, hemi: 1.6, sun: 1.8 }); classRoom(Wd); return Wd; };
  const rays = Wd => { const arr = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 9), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(-5 + i * 2.2, 3.2, -4 + (i % 2)); m.rotation.z = .4; Wd.add(m); arr.push(m); }
    return k => arr.forEach((m, i) => m.material.opacity = k * (.14 + .05 * Math.sin(i * 2 + k * 3))); };
  const greenGlow = Wd => { const s = glowSprite(1, 1, 0); s.material.color.set(0x6dffa0); Wd.add(s); return (pos, w, a) => { s.position.set(pos[0], pos[1], pos[2]); s.scale.set(w, w * 1.15, 1); s.material.opacity = a; }; };

  // ---------------------------------------------------------------- the three boys
  const tzvika = (Wd, fn) => boyK(Wd, 3, t => Object.assign({ pos: TZ, facing: .85, gesture: null, perform: 0, talk: 0, smile: .1, brow: .25, look: .2, seed: .4 }, fn(t)));
  const yoeli = (Wd, fn) => boyK(Wd, 5, t => Object.assign({ pos: YO, facing: -.85 + .04 * Math.sin(t * .6), gesture: null, perform: 0, talk: 0, smile: .2, brow: .15, look: -.4, seed: .7 }, fn ? fn(t) : {}));
  const dovi = (Wd, fn) => boyK(Wd, 6, t => Object.assign({ pos: DV, facing: .55 + .05 * Math.sin(t * .5), gesture: null, perform: 0, talk: 0, smile: .45, brow: 0, look: .2, seed: .2 }, fn ? fn(t) : {}));

  // ---------------------------------------------------------------- flat textured props (all billboards)
  const GREYF = '#dfe2ea', INK = '#1c2745';
  const cloudCircles = (c, W, Hh, list, fill) => {
    c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = W * .026;
    for (const [x, y, r] of list) { c.beginPath(); c.arc(x * W, y * Hh, r * W, 0, 7); c.stroke(); }
    c.fillStyle = fill; for (const [x, y, r] of list) { c.beginPath(); c.arc(x * W, y * Hh, r * W, 0, 7); c.fill(); }
  };
  const CTX = {};
  const BUBT = canvasTex(880, 660, (c, W, Hh) => cloudCircles(c, W, Hh,
    [[.78, .84, .034], [.84, .91, .024], [.885, .96, .016], [.2, .55, .13], [.33, .34, .16], [.52, .27, .18], [.72, .34, .16], [.84, .55, .13], [.75, .72, .14], [.55, .76, .16], [.36, .74, .14], [.5, .5, .27]], GREYF));
  const SHADE = canvasTex(512, 480, (c, W, Hh) => { cloudCircles(c, W, Hh, [[.2, .55, .17], [.35, .35, .2], [.58, .3, .22], [.78, .45, .18], [.78, .68, .17], [.5, .72, .2], [.28, .72, .16], [.5, .52, .28]], '#5b6178'); });
  const PUFFT = canvasTex(256, 192, (c, W, Hh) => cloudCircles(c, W, Hh, [[.28, .62, .2], [.5, .42, .24], [.74, .6, .2], [.5, .66, .22]], GREYF));
  const iconTex = who => CTX['i' + who] || (CTX['i' + who] = canvasTex(256, 256, (c, W, Hh) => {
    const skin = who === 'T' ? '#dcb08a' : '#f4d9bf', ring = who === 'T' ? '#f0a040' : '#46b0cf';
    c.lineJoin = 'round'; c.lineCap = 'round'; c.fillStyle = ring; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); c.lineWidth = 9; c.strokeStyle = INK; c.stroke();
    c.save(); c.beginPath(); c.arc(128, 128, 112, 0, 7); c.clip();
    c.fillStyle = '#f4f6fb'; c.beginPath(); c.ellipse(128, 252, 84, 62, 0, 0, 7); c.fill(); c.lineWidth = 7; c.stroke();
    c.fillStyle = skin; c.beginPath(); c.ellipse(128, 120, 54, 62, 0, 0, 7); c.fill(); c.lineWidth = 7; c.stroke();
    c.fillStyle = '#1f2f70'; c.beginPath(); c.ellipse(128, 76, 40, 26, 0, PI, 2 * PI); c.closePath(); c.fill(); c.lineWidth = 6; c.stroke();
    c.fillStyle = INK; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(128 + sx * 20, 122, 6, 8, 0, 0, 7); c.fill(); }
    c.lineWidth = 6; c.beginPath(); c.arc(128, 138, 18, .25, PI - .25); c.stroke();
    c.restore(); }));
  const flatMesh = (tex, w, h, ro, col) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color: col === undefined ? 0xffffff : col, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = ro || 8; return m; };
  function flat(Wd, tex, w, h, ro) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    const m = flatMesh(tex, w, h, ro); inner.add(m); bill(Wd, g); return { g, inner, m };
  }
  // the speech bubble: one grey cloud holding two boy icons (Tzvika + Dovi); Dovi's icon can be shaded; it can pop away
  function bubble(Wd) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    const gl = glowSprite(3.4, 2.6, 0); gl.material.color.set(0xb7bccb); gl.position.z = -.1; inner.add(gl);
    const base = flatMesh(BUBT, 2.0, 1.5, 8), iT = flatMesh(iconTex('T'), .68, .68, 9), iD = flatMesh(iconTex('D'), .68, .68, 9), sh = flatMesh(SHADE, .86, .8, 10);
    iT.position.set(.46, .09, .01); iD.position.set(-.46, .09, .01); sh.position.set(-.46, .09, .02); sh.visible = false; [base, iT, iD, sh].forEach(m => inner.add(m));
    return { g, inner, sh, iD, set(pos, s, o) { o = o || {}; g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = o.rz || 0;
      iT.scale.setScalar(Math.max(.001, o.iT === undefined ? 1 : o.iT)); iD.scale.setScalar(Math.max(.001, o.iD === undefined ? 1 : o.iD)); iT.visible = (o.iT === undefined ? 1 : o.iT) > .01; iD.visible = (o.iD === undefined ? 1 : o.iD) > .01;
      const k = o.shade || 0, d = 1 - .5 * k; iD.material.color.setRGB(d, d, d * 1.03); sh.visible = k > .01; sh.position.y = .09 + (1 - ease.out(clamp(k * 1.25, 0, 1))) * .95; sh.material.opacity = Math.min(1, k * 1.6);
      const tn = 1 - .12 * (o.tint || 0); base.material.color.setRGB(tn, tn, tn * 1.03); gl.material.opacity = .4 * (o.a === undefined ? 1 : o.a); inner.children.forEach(m => { if (m.material && m !== gl) m.material.opacity = (m === sh ? Math.min(1, k * 1.6) : 1) * (o.a === undefined ? 1 : o.a); }); } };
  }
  const puff = Wd => { const f = flat(Wd, PUFFT, 1.0, .75, 8); return { g: f.g, set(pos, s, a, rz) { const on = s > .01 && a > .01; f.g.visible = on; if (!on) return; f.g.position.set(pos[0], pos[1], pos[2]); f.inner.scale.setScalar(s); f.inner.rotation.z = rz || 0; f.m.material.opacity = a; } }; };
  const tagTex = (text, w, h, lines) => canvasTex(w, h, (c, W, Hh) => {
    c.fillStyle = '#fff1bd'; c.beginPath(); c.roundRect(10, 10, W - 20, Hh - 20, 46); c.fill(); c.lineWidth = 12; c.strokeStyle = '#a8741a'; c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .86, maxLines: lines, max: Hh * (lines > 1 ? .3 : .5), min: Hh * .18, lh: 1.15 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = '#3a2410';
    const lh = f.size * 1.15, y0 = Hh * .5 - (f.lines.length - 1) * lh / 2; f.lines.forEach((l, i) => c.fillText(l, W / 2, y0 + i * lh)); });
  const tag = (Wd, text, w, h, lines) => { const f = flat(Wd, tagTex(text, 720, Math.round(720 * h / w), lines), w, h, 9); return { g: f.g, set(pos, s, a, rz) { const on = s > .01 && a > .01; f.g.visible = on; if (!on) return; f.g.position.set(pos[0], pos[1], pos[2]); f.inner.scale.setScalar(s); f.inner.rotation.z = rz || 0; f.m.material.opacity = a; } }; };
  const STAMPT = canvasTex(900, 400, (c, W, Hh) => {
    c.lineJoin = 'round'; c.fillStyle = 'rgba(232,234,241,.55)'; c.beginPath(); c.roundRect(24, 24, W - 48, Hh - 48, 38); c.fill();
    c.lineWidth = 26; c.strokeStyle = '#4a4f63'; c.beginPath(); c.roundRect(24, 24, W - 48, Hh - 48, 38); c.stroke(); c.lineWidth = 7; c.beginPath(); c.roundRect(60, 60, W - 120, Hh - 120, 22); c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, W_STAMP, { maxW: W * .76, maxLines: 1, max: Hh * .5, min: Hh * .2, lh: 1.1 }); c.font = `800 ${f.size}px ${FONT}`; c.fillStyle = '#4a4f63'; c.fillText(f.lines[0] || '', W / 2, Hh * .54); });
  const stamp = Wd => { const f = flat(Wd, STAMPT, 1.7, .755, 11); return { g: f.g, set(pos, s, rz, a) { f.g.visible = s > .01; if (!f.g.visible) return; f.g.position.set(pos[0], pos[1], pos[2]); f.inner.scale.setScalar(s); f.inner.rotation.z = rz; f.m.material.opacity = a === undefined ? 1 : a; } }; };
  // the held test sheet (scribbles + one grey mark)
  const sheet = Wd => { const f = flat(Wd, sheetTex, .5, .645, 10); return { g: f.g, set(pos, s, rz) { f.g.visible = s > .01; if (!f.g.visible) return; f.g.position.set(pos[0], pos[1], pos[2]); f.inner.scale.setScalar(s); f.inner.rotation.z = rz || 0; } }; };
  // a two-segment amber arrow in screen space (bill-boarded), grown from p0 to p1
  function arrow(Wd) {
    const g = new THREE.Group(); g.visible = false; Wd.add(g); bill(Wd, g);
    const mt = (col, ro) => new THREE.MeshBasicMaterial({ color: col, transparent: true, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide }), mk = (geo, col, ro) => { const m = new THREE.Mesh(geo, mt(col)); m.renderOrder = ro; return m; };
    const rot = new THREE.Group(); g.add(rot);
    const shO = mk(new THREE.PlaneGeometry(1, .17), 0x2a1a08, 11), sh = mk(new THREE.PlaneGeometry(1, .1), 0xf2a01c, 12), hdO = mk(new THREE.CircleGeometry(.26, 3), 0x2a1a08, 11), hd = mk(new THREE.CircleGeometry(.19, 3), 0xf2a01c, 12);
    [shO, sh, hdO, hd].forEach(m => rot.add(m));
    const fw = new THREE.Vector3(), rt = new THREE.Vector3(), up = new THREE.Vector3();
    return { g, set(p0, p1, k, cam) { g.visible = k > .01; if (!g.visible) return; rt.set(1, 0, 0).applyQuaternion(cam.quaternion); up.set(0, 1, 0).applyQuaternion(cam.quaternion);
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1], dz = p1[2] - p0[2], lx = dx * rt.x + dy * rt.y + dz * rt.z, ly = dx * up.x + dy * up.y + dz * up.z, L = Math.hypot(lx, ly), l = L * k;
      g.position.set(p0[0], p0[1], p0[2]); rot.rotation.z = Math.atan2(ly, lx); const sl = Math.max(.001, l - .12);
      shO.scale.set(sl + .03, 1, 1); shO.position.set(sl / 2, 0, 0); sh.scale.set(sl, 1, 1); sh.position.set(sl / 2, 0, .01); hdO.position.set(l - .1, 0, 0); hd.position.set(l - .1, 0, .01); } };
  }

  // hold points on the sheet
  const sheetPos = (tz, side, front) => { const hf = handMid(tz, [TZ[0] + .05, 1.0, TZ[2] + .2]), hs = handOne(tz, 'A', [TZ[0] + .3, .75, TZ[2] + .2]); return [lerp(hf[0], hs[0] - .02, side), lerp(hf[1] + (front === undefined ? .2 : front), hs[1] - .6, side), lerp(hf[2] + .2, hs[2] + .2, side)]; };

  const BP = [TZ[0] - .79, 2.42, TZ[2] + .15];   // bubble centre (tail over Tzvika)
  const TG = [-2.15, 1.95, TZ[2] + .5];    // the small tag between Tzvika and Yoeli
  const iconDpos = (cam, s) => { const rt = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion); return [BP[0] - rt.x * .46 * s + up.x * .09 * s, BP[1] - rt.y * .46 * s + up.y * .09 * s, BP[2] - rt.z * .46 * s + up.z * .09 * s + .1]; };

  // ---------------------------------------------------------------- 1. HOOK 0-14: Tzvika holds his test sheet, sighs, hand on his own chest, glances at far Dovi; big "?"
  function hook(dur) {
    const Wd = world(); lighting(Wd, t => ({ hemi: 1.6, sun: 1.8 }));
    const tz = tzvika(Wd, t => ({ facing: lerp(.85, -.75, sm(P(7.6, 9.6, t))) + .15 * sm(P(12.2, 13.8, t)), smile: .05, brow: t > 3.5 && t < 7 ? .5 : .3, look: lerp(.2, -.9, sm(P(8.2, 9.4, t))) * (1 - sm(P(12, 13.2, t))) + .2 * sm(P(12, 13.2, t)) }));
    yoeli(Wd, t => ({ brow: .15 })); dovi(Wd, t => ({ look: -.2 }));
    drive(Wd, tz, t => { const hold = sm(P(.1, 1, t)), toC = sm(P(6.2, 7.6, t)), sighK = Math.sin(PI * P(3.8, 5.8, t));
      const arms = mixA(mixA(REST, HOLD, hold), CHEST, toC);
      return { arms, chest: -.07 * sighK, head: [.13 + .16 * Math.sin(PI * P(3.8, 5.8, t)) * 0 + .1 * sighK - .13 * sm(P(8, 9, t)), -.4 * sm(P(8.2, 9.6, t)) * (1 - sm(P(12, 13.2, t))), 0] }; });
    const sh = sheet(Wd); occ(Wd, sh.g);
    Wd.on(t => { const side = sm(P(6.2, 7.6, t)); sh.set(sheetPos(tz, side, -.14), popE(P(.1, .9, t)) * .62, side * .12 - .04 * Math.sin(t * 1.3) * (1 - side)); });
    Wd.noQ = true; const qm = qmark(Wd, '#5ec8ff', 1.1), fw = new THREE.Vector3(), up = new THREE.Vector3(), rt = new THREE.Vector3();
    Wd.on((t, cam) => { cam.getWorldDirection(fw); up.set(0, 1, 0).applyQuaternion(cam.quaternion); rt.set(1, 0, 0).applyQuaternion(cam.quaternion);
      const p = cam.position.clone().addScaledVector(fw, 8).addScaledVector(up, 1.55).addScaledVector(rt, -.9); qm.set([p.x, p.y + .08 * Math.sin(t * 1.7), p.z], popE(P(3.4, 4.4, t)) * 1.1, .12 * Math.sin(t * 1.1)); });
    Wd.cam = cine([C(0, [-1.4, 1.3, -2.2], 6.2, .5, -14, 44, 0), C(5, [-1.4, 1.3, -2.2], 5.9, .45, 0, 44, 0), C(10, [-1.4, 1.3, -2.2], 5.9, .5, 10, 44, 0), C(14, [-1.4, 1.3, -2.2], 6.1, .45, 4, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: Tzvika talks; a grey speech cloud with two icons (Tzvika + Dovi) rises above him
  function s2(dur) {
    const Wd = world(); lighting(Wd, t => ({ hemi: lerp(1.6, 1.45, sm(P(2, 6, t))), sun: lerp(1.8, 1.6, sm(P(2, 6, t))) }));
    const tz = tzvika(Wd, t => ({ facing: .85 + .06 * Math.sin(t * .8), talk: t > 1.2 ? .4 * talkAmt(t, 3) : 0, smile: 0, brow: .2 }));
    yoeli(Wd, t => ({ brow: .22 })); dovi(Wd, t => ({}));
    drive(Wd, tz, t => ({ arms: mixA(HOLD, mixA(HOLD, EXPL, .0), 0), head: [.06, .1 * Math.sin(t * .9), 0], chest: 0 }));
    const bb = bubble(Wd), shT = sheet(Wd); occ(Wd, bb.g); occ(Wd, shT.g);
    Wd.on(t => { const k = popE(P(1.8, 3.0, t));
      bb.set([BP[0], BP[1] + .05 * Math.sin(t * 1.3), BP[2]], k * (1 + .02 * Math.sin(t * 2.4)), { iT: popE(P(3.4, 4.2, t)), iD: popE(P(4.6, 5.4, t)), tint: sm(P(7, 9, t)), rz: .02 * Math.sin(t * 1.1) });
      shT.set(sheetPos(tz, 0, -.14), .62, -.04 * Math.sin(t * 1.3)); });
    Wd.cam = cine([C(0, [-1.0, 1.35, -2.2], 5.1, .5, -14, 44, 0), C(5, [-1.0, 1.35, -2.2], 4.9, .45, 0, 44, 0), C(10, [-1.0, 1.35, -2.2], 4.9, .5, 10, 44, 0), C(16, [-1.0, 1.35, -2.2], 5.1, .45, 3, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-46: the grey cloud stretches toward far Dovi; a grey shade falls on Dovi's icon; red cross slams
  function s3(dur) {
    const Wd = world(); lighting(Wd, t => ({ hemi: lerp(1.45, 1.3, sm(P(1, 6, t))), sun: lerp(1.6, 1.45, sm(P(1, 6, t))) }));
    const tz = tzvika(Wd, t => ({ facing: .85, talk: t < 7 ? .4 * talkAmt(t, 3) : 0, smile: 0, brow: .2 }));
    yoeli(Wd, t => ({ brow: .25 })); dovi(Wd, t => ({}));
    drive(Wd, tz, t => ({ arms: mixA(HOLD, REST, sm(P(7, 8.4, t))), head: [.06, .1 * Math.sin(t * .9), 0], chest: 0 }));
    const bb = bubble(Wd), shT = sheet(Wd), x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0xff8a8a); occ(Wd, bb.g); occ(Wd, shT.g); occ(Wd, x.g);
    const N = 8, pf = []; for (let i = 0; i < N; i++) { const p = puff(Wd); pf.push(p); occ(Wd, p.g); }
    const endC = puff(Wd); occ(Wd, endC.g);
    const A = [BP[0] - 1.0, BP[1] - .1, BP[2]], Bz = [DV[0] - .1, 2.45, DV[2] + .3];
    Wd.on(t => {
      bb.set([BP[0], BP[1] + .04 * Math.sin(t * 1.3), BP[2]], 1 + .02 * Math.sin(t * 2.4), { tint: 1, shade: sm(P(5.4, 6.8, t)), rz: .02 * Math.sin(t * 1.1) });
      for (let i = 0; i < N; i++) { const u = i / (N - 1), t0 = 1.0 + i * .38, k = popE(P(t0, t0 + .5, t)), arc = Math.sin(PI * u) * .35;
        pf[i].set([lerp(A[0], Bz[0], u) + .04 * Math.sin(t * 1.4 + i), lerp(A[1], Bz[1], u) + arc * .5 - .35 * u * u * 0 + .05 * Math.sin(t * 1.7 + i * 1.3), lerp(A[2], Bz[2], u)], k * lerp(.55, .34, u), 1, .1 * Math.sin(t + i)); }
      endC.set([Bz[0] + .2, Bz[1] + .08 + .05 * Math.sin(t * 1.2), Bz[2]], popE(P(4.0, 5.2, t)) * .72, 1, .04 * Math.sin(t * 1.1));
      const xt = 7.2, xk = t > xt ? popE(P(xt, xt + .55, t)) : 0, xp = [BP[0] + 1.1, BP[1] + .45, BP[2] + .35]; x.set(xp, xk * .62, .06 * Math.sin(t * 3)); sk.set([xp[0], xp[1], xp[2] + .05], P(xt, xt + .8, t) * (t > xt ? 1 : 0), 1.3);
      shT.set(sheetPos(tz, sm(P(7, 8.4, t)), -.14), .66, -.04 * Math.sin(t * 1.3)); });
    Wd.cam = cine([C(0, [-1.8, 1.35, -2.3], 6.4, .5, -12, 44, 0), C(6, [-1.8, 1.35, -2.3], 6.1, .45, 2, 44, 0), C(11, [-1.8, 1.35, -2.3], 6.1, .5, 10, 44, 0), C(16, [-1.8, 1.35, -2.3], 6.3, .45, 3, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 46-60: "first about myself" tag next to Tzvika (hand on his own chest), an arrow continues to Dovi's icon; red cross stays
  function s4(dur) {
    const Wd = world(); lighting(Wd, t => ({ hemi: 1.3, sun: 1.45 }));
    const tz = tzvika(Wd, t => ({ facing: .35, look: .35, talk: t > 2.6 && t < 4.4 ? .25 * talkAmt(t, 3) : 0, smile: 0, brow: .35 }));
    yoeli(Wd, t => ({ brow: .25 })); dovi(Wd, t => ({}));
    drive(Wd, tz, t => { const c = sm(P(.8, 2.2, t)); return { arms: mixA(REST, CHEST, c), head: [.1, .08 * Math.sin(t * .9), 0], chest: 0 }; });
    const bb = bubble(Wd), shT = sheet(Wd), x = mark3d(Wd, 'cross', 1.0), tg = tag(Wd, W_TAG1, 1.5, .5, 1), ar = arrow(Wd); occ(Wd, bb.g); occ(Wd, shT.g); occ(Wd, x.g); occ(Wd, tg.g); occ(Wd, ar.g);
    const N = 8, pf = []; for (let i = 0; i < N; i++) { const p = puff(Wd); pf.push(p); occ(Wd, p.g); } const endC = puff(Wd); occ(Wd, endC.g);
    const A = [BP[0] - 1.0, BP[1] - .1, BP[2]], Bz = [DV[0] - .1, 2.45, DV[2] + .3];
    Wd.on((t, cam) => {
      bb.set([BP[0], BP[1] + .04 * Math.sin(t * 1.3), BP[2]], 1 + .02 * Math.sin(t * 2.4), { tint: 1, shade: 1, rz: .02 * Math.sin(t * 1.1) });
      for (let i = 0; i < N; i++) { const u = i / (N - 1), arc = Math.sin(PI * u) * .35; pf[i].set([lerp(A[0], Bz[0], u) + .04 * Math.sin(t * 1.4 + i), lerp(A[1], Bz[1], u) + arc * .5 + .05 * Math.sin(t * 1.7 + i * 1.3), lerp(A[2], Bz[2], u)], lerp(.55, .34, u), 1, .1 * Math.sin(t + i)); }
      endC.set([Bz[0] + .2, Bz[1] + .08 + .05 * Math.sin(t * 1.2), Bz[2]], .72, 1, .04 * Math.sin(t * 1.1));
      x.set([BP[0] + 1.1, BP[1] + .45, BP[2] + .35], .55, .06 * Math.sin(t * 3));
      const tk = popE(P(2.8, 3.8, t)); tg.set([TG[0], TG[1] + .05 * Math.sin(t * 1.5), TG[2]], tk * 1.0, 1, .03 * Math.sin(t * 1.2));
      shT.set(sheetPos(tz, 1), .78, -.04 * Math.sin(t * 1.3));
      const dpos = iconDpos(cam, 1), p0 = [TG[0] + .2, TG[1] + .3, TG[2] + .05]; ar.set(p0, [dpos[0] - .08, dpos[1] - .3, dpos[2]], ease.out(P(5.0, 7.4, t)), cam); });
    Wd.cam = cine([C(0, [-1.15, 1.3, -2.2], 5.5, .5, -14, 44, 0), C(5, [-1.15, 1.3, -2.2], 5.2, .45, 0, 44, 0), C(9, [-1.15, 1.3, -2.2], 5.2, .5, 10, 44, 0), C(14, [-1.15, 1.3, -2.2], 5.4, .45, 3, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 60-76: a big grey stamp lands on the bubble; a small tag "about himself - that does not fix it" floats by
  function s5(dur) {
    const Wd = world(); lighting(Wd, t => ({ hemi: lerp(1.3, 1.2, sm(P(2, 4, t))), sun: lerp(1.45, 1.3, sm(P(2, 4, t))) }));
    const tz = tzvika(Wd, t => ({ facing: .35, look: .35, smile: 0, brow: .35 }));
    yoeli(Wd, t => ({ brow: .25 })); dovi(Wd, t => ({}));
    drive(Wd, tz, t => ({ arms: CHEST, head: [.1, .06 * Math.sin(t * .9), 0], chest: 0 }));
    const bb = bubble(Wd), shT = sheet(Wd), st = stamp(Wd), tg = tag(Wd, W_TAG2, 1.9, .86, 2), sk = shock(Wd, 0xc9cde0); occ(Wd, bb.g); occ(Wd, shT.g); occ(Wd, st.g); occ(Wd, tg.g);
    Wd.on(t => {
      const hit = 2.2, d = P(.9, hit, t), land = t > hit ? 1 : 0, jolt = land * Math.sin(PI * P(hit, hit + .5, t)) * .06;
      bb.set([BP[0], BP[1] + .04 * Math.sin(t * 1.3) - jolt, BP[2]], 1 + .02 * Math.sin(t * 2.4), { tint: 1, shade: 1, rz: .02 * Math.sin(t * 1.1) });
      const sc = t < hit ? lerp(2.6, 1.0, ease.in(d)) : 1 + .05 * Math.exp(-(t - hit) * 6) * Math.cos((t - hit) * 18); const dropY = t < hit ? lerp(1.2, 0, ease.in(d)) : 0;
      st.set([BP[0] + .02, BP[1] - .02 + dropY - jolt, BP[2] + .4], t > .9 ? sc : 0, -.1 + .02 * Math.sin(t * 1.2) * land, t < hit ? Math.min(1, d * 1.5) : 1); sk.set([BP[0], BP[1], BP[2] + .45], P(hit, hit + .8, t) * land, 2.2);
      const u = P(5.0, 15.5, t), tx = lerp(3.6, 1.0, ease.out(u)), ty = 2.2 + .1 * Math.sin(t * 1.3); tg.set([tx, ty, TG[2] + .4], t > 5 ? popE(P(5, 6, t)) * (1 - sm(P(14.2, 15.5, t))) * 1.05 : 0, 1, .04 * Math.sin(t * 1.4));
      shT.set(sheetPos(tz, 1), .78, -.04 * Math.sin(t * 1.3)); });
    Wd.cam = cine([C(0, [-.8, 1.3, -2.2], 5.6, .5, -14, 44, 0), C(6, [-.8, 1.3, -2.2], 5.3, .45, 2, 44, 0), C(11, [-.8, 1.3, -2.2], 5.3, .5, 10, 44, 0), C(16, [-.8, 1.3, -2.2], 5.5, .45, 3, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-90: Yoeli gently raises an open palm and shakes his head; the bubble pops away; Tzvika nods
  function s6(dur) {
    const Wd = world(), ryz = rays(Wd); lighting(Wd, t => ({ hemi: lerp(1.2, 1.7, sm(P(6, 10, t))), sun: lerp(1.3, 1.95, sm(P(6, 10, t))) }));
    const tz = tzvika(Wd, t => ({ facing: .35, look: .35, smile: lerp(0, .5, sm(P(8, 10, t))), brow: lerp(.35, 0, sm(P(7, 9, t))) }));
    const yo = yoeli(Wd, t => ({ facing: -.7, smile: .15, brow: .2, look: -.5 })); dovi(Wd, t => ({ smile: .5 }));
    drive(Wd, tz, t => { const nod = Math.sin(2 * PI * P(7.4, 9.4, t) * 2) * Math.sin(PI * P(7.4, 9.4, t)); return { arms: mixA(CHEST, REST, sm(P(6.4, 8, t))), head: [.1 + .22 * nod, 0, 0], chest: 0 }; });
    drive(Wd, yo, t => { const up = sm(P(.9, 2.4, t)) * (1 - sm(P(10.5, 12, t))), shake = Math.sin((t - 2.2) * 5.6) * Math.min(1, P(2.2, 3, t)) * (1 - sm(P(6.5, 8, t))); return { arms: mixA(REST, PALM, up), head: [.03, -.35 * shake, 0], chest: 0, fist: { A: 0, B: 0 } }; });
    const bb = bubble(Wd), st = stamp(Wd), shT = sheet(Wd), sk = shock(Wd, 0xc9cde0); occ(Wd, bb.g); occ(Wd, st.g); occ(Wd, shT.g);
    const N = 9, ps = []; for (let i = 0; i < N; i++) { const p = puff(Wd); ps.push(p); occ(Wd, p.g); }
    const gg = greenGlow(Wd);
    Wd.on(t => {
      const pop = P(5.6, 6.3, t), bk = 1 - ease.in(clamp(pop, 0, 1)), vis = t < 6.3 ? 1 : 0, wob = 1 + .06 * Math.sin(t * 22) * P(5.4, 5.8, t);
      bb.set([BP[0], BP[1] + .04 * Math.sin(t * 1.3), BP[2]], vis * bk * wob, { tint: 1, shade: 1, rz: .02 * Math.sin(t * 1.1) });
      st.set([BP[0] + .02, BP[1] - .02, BP[2] + .4], vis * bk * wob, -.1, 1); sk.set([BP[0], BP[1], BP[2] + .45], P(6.2, 7, t) * (t > 6.2 ? 1 : 0), 2.6);
      for (let i = 0; i < N; i++) { const a = PI * (.06 + .88 * i / (N - 1)), u = P(6.1, 7.6, t); ps[i].set([BP[0] + Math.cos(a) * (.3 + 1.9 * ease.out(u)), BP[1] + .1 + Math.sin(a) * (.2 + 1.0 * ease.out(u)) - .1 * u * u, BP[2] + .3], t > 6.1 ? .46 * (1 - .6 * u) : 0, t > 6.1 ? 1 - ease.in(u) : 0, a); }
      const hp = headPos(tz, [TZ[0], 1.4, TZ[2]]); gg([hp[0] + .9, hp[1] + .2, TZ[2] - .6], 4.6 * sm(P(7, 11, t)), .35 * sm(P(7, 11, t))); ryz(.4 * sm(P(6, 11, t)));
      shT.set(sheetPos(tz, 1), .78, -.04 * Math.sin(t * 1.3)); });
    Wd.cam = cine([C(0, [-.8, 1.3, -2.2], 5.4, .5, -14, 44, 0), C(5, [-.8, 1.3, -2.2], 5.1, .45, 3, 44, 0), C(9, [-.8, 1.3, -2.2], 5.1, .5, 10, 44, 0), C(14, [-.8, 1.3, -2.2], 5.3, .45, 3, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 90-100: Dovi walks in; the three open a book together at a table; warm light; green check over the group
  const BKX = .2;
  function tableProp(Wd) {
    const g = new THREE.Group(); g.position.set(BKX, 0, -1.0); Wd.add(g);
    g.add(box(2.2, .07, .6, 0xc99a66, { pos: [0, .5, 0] })); for (const dx of [-1.0, 1.0]) for (const dz of [-.22, .22]) g.add(box(.07, .48, .07, 0x6a4326, { pos: [dx, .24, dz], ink: false }));
    return g;
  }
  const pageTex = canvasTex(256, 330, (c, W, Hh) => { c.fillStyle = '#fff7dc'; c.fillRect(0, 0, W, Hh); c.fillStyle = '#6a5030'; for (let r = 0; r < 12; r++) { let x = W * .88; const y = Hh * (.1 + r * .07); while (x > W * .16) { const l = 12 + ((r * 37 + x) % 31); c.fillRect(x - l, y, l, 7); x -= l + 8; } } });
  function bookProp(Wd) {
    const g = new THREE.Group(), lid = new THREE.Group(); g.visible = false; Wd.add(g); g.add(lid);
    g.add(box(1.08, .05, .72, 0x5a2e16, { pos: [0, 0, 0] })); g.add(box(.49, .09, .62, 0xf3e6c2, { pos: [.27, .07, 0], ink: false })); g.add(box(.49, .09, .62, 0xf3e6c2, { pos: [-.27, .07, 0], ink: false }));
    const pr = new THREE.Mesh(new THREE.PlaneGeometry(.47, .6), new THREE.MeshBasicMaterial({ map: pageTex, fog: false })); pr.rotation.x = -PI / 2; pr.position.set(.27, .1201, 0); g.add(pr);
    const pl = pr.clone(); pl.position.set(-.27, .1201, 0); g.add(pl);
    lid.position.set(0, .125, 0); lid.add(box(.54, .05, .68, 0x5a2e16, { pos: [-.27, .025, 0] }));
    const gl = glowSprite(2.6, 1.2, 0); gl.material.color.set(0xffd27a); Wd.add(gl);
    return { g, set(pos, s, open, glow) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); gl.position.set(pos[0], pos[1] + .3, pos[2] - .1); lid.rotation.z = -PI * (1 - open); lid.visible = open < .995; gl.material.opacity = (glow || 0) * .55; } };
  }
  function s7(dur) {
    const Wd = world(), ryz = rays(Wd), gg = greenGlow(Wd);
    lighting(Wd, t => ({ hemi: lerp(1.5, 1.85, sm(P(1.5, 6, t))), sun: lerp(1.7, 2.3, sm(P(1.5, 6, t))) }));
    tableProp(Wd);
    const XD = BKX - .75, XT = BKX, XY = BKX + .75, ZB = -2.25;
    const tz = boyK(Wd, 3, t => ({ pos: [XT, 0, ZB], facing: .45, gesture: null, perform: 0, talk: .15 * talkAmt(t, 2) * sm(P(5, 6, t)), smile: .5, brow: 0, look: .4, seed: .4 }));
    const yo = boyK(Wd, 5, t => ({ pos: [XY, 0, ZB], facing: 0 + .05 * Math.sin(t * .7), gesture: null, perform: 0, talk: 0, smile: .45, brow: 0, look: 0, seed: .7 }));
    const dv = boyK(Wd, 6, t => { const u = P(.2, 3.8, t), x = lerp(-5.6, XD, ease.sm(u)), walking = u > 0 && u < 1; return { pos: [x, 0, lerp(-2.7, ZB, ease.sm(u))], facing: walking ? lerp(1.25, .3, ease.sm(P(2.6, 3.8, t))) : .35, walk: walking ? t * 5.4 : undefined, gesture: null, perform: 0, talk: 0, smile: .55, brow: 0, look: .2, seed: .2 }; });
    const bk = bookProp(Wd), ck = mark3d(Wd, 'check', 1.0), sk = shock(Wd, 0x7dffa8); occ(Wd, bk.g); occ(Wd, ck.g);
    drive(Wd, tz, t => ({ arms: REST, head: [.2 * sm(P(5, 6, t)), .0, 0], chest: 0 }));
    drive(Wd, yo, t => ({ arms: mixA(REST, HOLD, .35 * sm(P(3.8, 5, t))), head: [.22 * sm(P(4.6, 5.6, t)), 0, 0], chest: 0 }));
    Wd.on(t => {
      const op = ease.sm(P(4.6, 6.2, t)); bk.set([BKX, .535, -1.0], popE(P(3.4, 4.4, t)) * .72, op, sm(P(5.4, 8, t)));
      const k = popE(P(6.6, 7.4, t)); ck.set([BKX, 2.3 + .04 * Math.sin(t * 1.8), -2.2], k * .6, .05 * Math.sin(t * 2.6)); sk.set([BKX, 2.3, -2.0], P(6.6, 7.4, t) * (t > 6.6 ? 1 : 0), 1.6);
      const gk = sm(P(5, 9, t)); gg([BKX, 1.3, -2.9], 3.0 + 1.4 * gk, .42 * gk); ryz(.4 * sm(P(3, 8, t))); });
    Wd.cam = cine([C(0, [BKX - .6, 1.25, -2.1], 5.0, .3, -10, 44, 0), C(4, [BKX, 1.25, -2.1], 4.2, .25, 4, 44, 0), C(7, [BKX, 1.25, -2.1], 4.1, .3, 10, 44, 0), C(10, [BKX, 1.25, -2.1], 4.3, .25, 3, 44, 0)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the three boys learn together behind the card
  function answerBg(dur) {
    const Wd = mkWorld({ skyTop: 0x6fb4f0, skyBottom: 0xfff0d2, hemi: 1.8, sun: 2.1 }); classRoom(Wd); const ry = rays(Wd); ry(.8);
    const xs = [-1.9, 0, 1.9], ids = [3, 5, 6];
    ids.forEach((id, i) => boyK(Wd, id, t => ({ pos: [xs[i], 0, .3 + (i === 1 ? .15 : 0)], facing: (i - 1) * -.45 + .06 * Math.sin(t * .8 + i), gesture: i === 1 ? 'explainA' : null, perform: i === 1 ? 0 : .35, smile: 1, talk: .5 * talkAmt(t, i + 2), brow: .1, look: 0, seed: .3 + i * .2 })));
    lighting(Wd, () => ({ hemi: 1.8, sun: 2.1 }));
    Wd.center = [0, 0]; Wd.ansD = 7.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
