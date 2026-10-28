// shabbat-g22 story: "Passing by the Shabbat candles" (Azamra 22, Chayei Sarah) - 3D choreography per storyboards_v6.md (C).
// Kitchen. Candles are ALREADY burning from the first frame; nobody lights them; no boy touches a candle, a flame, or opens the door (the hand stops before the handle).
// Boys only. Every world exposes people (.kippa) and occ (moving props).
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, plainRoom, diningTable, chair, mark3d, board, drawWord,
    bill, popE, lighting, glowAt, glowSprite, texPlane, toon, bm, canvasTex, archShape, arcPt, shock, dotPath } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const TY = .72, SIT = { sit: true, groundY: 0 };
  const WARM = new THREE.Color(0xffe2b0), DIMC = new THREE.Color(0xc9b9a0);
  const RB = .17;
  const DUDI = 3, NACHUM = 2, MS = .88;   // Dudi 12, Nachum 10 (smaller)
  const LANE = -2.55;                      // the passage in front of the counter
  const CTOP = .92, CXC = -1.05, CDX = .3, CZC = -3.95, CB = CTOP + .14;   // counter top, candle pair centre, candle z, candle origin y
  const HING = [3.0, -4.44], HANDLE = [3.88, 1.05, -4.36], DCX = 3.5, DCZ = -4.28, STY = .62;   // door hinge, handle, door-candle x/z, stool height

  // ---------------------------------------------------------------- helpers
  const darkKippa = (P_) => { let done = false; return () => { const k = P_.kippa; if (k && !done) { done = true; k.material = k.material.clone(); k.material.color.set(0x1f2f70); } }; };
  const boyK = (Wd, i, fn) => { const Pn = boyP(Wd, i, fn); Wd.on(darkKippa(Pn)); return Pn; };
  const cm = (t, tg, dh, E, az, fov) => [t, tg, dh, dh * Math.tan(E * PI / 180), az, fov || 44, .0001];
  const skyW = (o) => mkWorld(Object.assign({ skyTop: 0x6a7fd8, skyBottom: 0xffb37a, fogColor: 0xffc99a, fogNear: 40, fogFar: 140, hemi: 1.15, hemiSky: 0xfff0dc, hemiGround: 0x9a8660, sun: 1.3, sunColor: 0xffd9a8, sunPos: [-14, 26, 16] }, o || {}));
  const mix = (a, b, k) => new THREE.Color().copy(a).lerp(b, clamp(k, 0, 1));

  // path with smooth segments: keys [[t,x,z],...]; pos, vel, cumulative distance
  function mover(keys) {
    const pos = t => { if (t <= keys[0][0]) return [keys[0][1], keys[0][2]]; for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (t < b[0]) { const u = sm(P(a[0], b[0], t)); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; } } const l = keys[keys.length - 1]; return [l[1], l[2]]; };
    const vel = t => { const a = pos(t - .03), b = pos(t + .03); return [(b[0] - a[0]) / .06, (b[1] - a[1]) / .06]; };
    const cum = t => { let s = 0; for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1], L = Math.hypot(b[1] - a[1], b[2] - a[2]); if (t >= b[0]) s += L; else if (t > a[0]) s += L * sm(P(a[0], b[0], t)); } return s; };
    const speed = t => { const v = vel(t); return Math.hypot(v[0], v[1]); };
    return { pos, vel, cum, speed };
  }
  const angBlend = (a, b, k) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * k; };
  function walker(m, t, stand) {   // state for a boy that walks along mover m and stands facing `stand` when still
    const p = m.pos(t), v = m.vel(t), sp = Math.hypot(v[0], v[1]), k = sm(clamp((sp - .06) / .3, 0, 1));
    return { pos: [p[0], 0, p[1]], facing: sp > .02 ? angBlend(stand, face(v[0], v[1]), k) : stand, walk: sp > .07 ? m.cum(t) * 6.3 : undefined, perform: 0 };
  }

  // spring model: candle flames lean when someone walks past, then swing back
  function leans(cands, men, dur) {
    const dt = 1 / 60, N = Math.ceil((dur + 1) * 60), G = 70, Ks = 30, Cd = 3.4;
    const res = cands.map(c => { const ax = new Float32Array(N + 2), az = new Float32Array(N + 2); let x = 0, vx = 0, z = 0, vz = 0;
      for (let n = 0; n <= N + 1; n++) { const t = n * dt; ax[n] = x; az[n] = z; let Fx = 0, Fz = 0;
        for (const m of men) { const p = m.pos(t), v = m.vel(t), gx = Math.exp(-Math.pow((p[0] - c.x) / .9, 2)) * Math.exp(-Math.pow((p[1] - c.z) / 2.0, 2)); Fx += G * gx * v[0]; Fz += -.45 * G * gx * Math.hypot(v[0], v[1]); }
        vx += (Fx - Ks * x - Cd * vx) * dt; x += vx * dt; vz += (Fz - Ks * z - Cd * vz) * dt; z += vz * dt; }
      return t => { const f = clamp(t / dt, 0, N), i = Math.floor(f), u = f - i; return [.85 * Math.tanh(lerp(ax[i], ax[i + 1], u)), .6 * Math.tanh(lerp(az[i], az[i + 1], u))]; }; });
    return res;
  }

  // expanding soft air ripples spreading from a walking boy toward the counter
  function ripples(Wd, men, ys, o) {
    o = o || {}; const ARC = PI * .95, Tm = o.Tm || .55, S = 4, life = o.life || 2.0, slots = [];
    const mk = () => { const geo = new THREE.TorusGeometry(1, .012, 6, 40, ARC); geo.rotateZ(PI / 2 - ARC / 2); geo.rotateX(-PI / 2);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xfff6dc, transparent: true, opacity: 0, depthWrite: false, fog: false })); m.renderOrder = 6; m.visible = false; Wd.add(m); return m; };
    men.forEach(mv => ys.forEach(y => { for (let s = 0; s < S; s++) slots.push({ mv, y, s, m: mk() }); }));
    Wd.on(t => slots.forEach(q => { const n = Math.floor((t - q.s * Tm) / (S * Tm)), te = q.s * Tm + n * S * Tm, u = (t - te) / life;
      const ok = te >= 0 && u >= 0 && u <= 1 && q.mv.speed(te) > .15; q.m.visible = ok; if (!ok) return;
      const p = q.mv.pos(te); q.m.position.set(p[0], q.y, p[1]); q.m.scale.setScalar(.15 + 2.1 * u); q.m.material.opacity = (o.op || .5) * Math.sin(PI * u); }));
  }

  // candle with silver stick; flame leans: lean(t) -> [lx, lz]; flame(t) -> 0..1
  function fcandle(Wd, o) {
    const p = o.pos, h = o.h || .26, r = o.r || .038, g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const st = new THREE.Group(); st.scale.setScalar(1.4); g.add(st);
    st.add(cyl(.1, .12, .03, 0xd8dde6, { pos: [0, -.105, 0] })); st.add(cyl(.022, .032, .07, 0xd8dde6, { pos: [0, -.065, 0] })); st.add(cyl(.065, .03, .04, 0xd8dde6, { pos: [0, -.02, 0] }));
    g.add(cyl(r, r * 1.05, h, 0xfff4d8, { pos: [0, h / 2, 0] }));
    const flameG = new THREE.Group(); flameG.position.y = h + .005; g.add(flameG);
    const FS = o.fs || 1.5;
    const fl = new THREE.Mesh(new THREE.ConeGeometry(r * 1.5, r * 6, 12), bm(0xffa21f)); fl.position.y = r * 3; flameG.add(fl);
    const core = new THREE.Mesh(new THREE.SphereGeometry(r * 1.0, 12, 10), bm(0xfff6c4)); core.position.y = r * 1.4; flameG.add(core);
    const gl = glowSprite(.55 * (o.gs || 1), .55 * (o.gs || 1), .6); gl.position.y = r * 3; flameG.add(gl);
    const light = new THREE.PointLight(0xffc27a, 0, 5); flameG.add(light); light.position.y = r * 4;
    Wd.on(t => { const f = o.flame ? o.flame(t) : 1, ln = o.lean ? o.lean(t) : [0, 0], on = f > .01; flameG.visible = on;
      const fk = f * (1 + .08 * Math.sin(t * 11 + p[0] * 7) + .05 * Math.sin(t * 19 + p[2] * 5)), mag = Math.min(1, Math.hypot(ln[0], ln[1]));
      flameG.rotation.z = -ln[0] + .03 * Math.sin(t * 7 + p[0]); flameG.rotation.x = ln[1];
      flameG.scale.set(fk * FS * (1 - .12 * mag), Math.max(.001, fk) * FS * (1 + .1 * mag), fk * FS * (1 - .12 * mag));
      gl.material.opacity = .55 * clamp(f, 0, 1) * (.92 + .08 * Math.sin(t * 8 + p[0])); light.intensity = (o.li === undefined ? .3 : o.li) * clamp(f, 0, 1) * (.93 + .07 * Math.sin(t * 9 + p[0] * 3)); });
    return { g };
  }
  function sparks(Wd, n, center, rad, color, size) {
    const sp = []; for (let i = 0; i < n; i++) { const s = glowSprite(size || .14, size || .14, 0); s.material.color.set(color || 0xffe9a8); Wd.add(s); sp.push(s); }
    return t => sp.forEach((s, i) => { const a = i * 2.4 + t * (.4 + (i % 3) * .15); s.position.set(center[0] + Math.cos(a) * rad * (.6 + .4 * ((i * 7) % 5) / 4), center[1] + Math.sin(a * 1.3) * rad * .35 + ((i % 4) - 1.5) * .1, center[2] + Math.sin(a) * rad * .4); s.material.opacity = .3 + .4 * Math.sin(t * 2.2 + i * 1.7) ** 2; });
  }

  // ---------------------------------------------------------------- the kitchen
  function sunsetTex() {
    return canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5b6fd0'); gr.addColorStop(.55, '#ff9a5a'); gr.addColorStop(.9, '#ffd27a'); gr.addColorStop(1, '#ffe9a8'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#7a4a4a'; for (const [x, bw, bh] of [[0, 30, 40], [28, 24, 62], [52, 30, 34], [82, 22, 52], [104, 30, 38]]) c.fillRect(x, h - bh, bw, bh); });
  }
  function sunsetWin(Wd, x, y0, z, w, h) {
    const g = new THREE.Group(); g.position.set(x, y0, z); Wd.add(g);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
    const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 12), bm(0xffffff, { map: sunsetTex() })); pn.position.z = .02;
    const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
    g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
  }
  const JARS = [0xd9534f, 0xe8b23a, 0x6aa84f, 0x4a7fc4, 0xc27ba0, 0xf0e0b0, 0x8a5a30];
  function shelfUnit(Wd, x, z) {   // full shelving unit against the left wall
    Wd.add(box(.7, 2.0, 1.9, 0xb98a58, { pos: [x, 1.0, z] }));
    for (let l = 0; l < 4; l++) { const y = .35 + l * .5; Wd.add(box(.74, .05, 1.94, 0x8a5a30, { pos: [x + .02, y, z], ink: false }));
      for (let k = 0; k < 9; k++) { const c = JARS[(k + l * 3) % JARS.length]; if (k % 3 === 1) Wd.add(box(.2, .26, .14, c, { pos: [x + .06, y + .15, z - .8 + k * .2], ink: false })); else Wd.add(cyl(.075, .075, .26, c, { pos: [x + .06, y + .15, z - .8 + k * .2], ink: false })); } }
    for (let k = 0; k < 8; k++) Wd.add(cyl(.09, .09, .2, JARS[(k * 2) % JARS.length], { pos: [x + .04, 2.15, z - .8 + k * .23], ink: false }));
  }
  function counterStuff(Wd) {   // things on the counter, leaving a clear spot for the candles
    const y = CTOP;
    Wd.add(box(.7, .04, .4, 0xc89a5a, { pos: [-3.5, y + .02, -4.0] })); Wd.add(ball(.15, 0xe3b25a, { pos: [-3.5, y + .1, -4.0], scale: [1.6, .6, 1] }));
    Wd.add(cyl(.2, .14, .12, 0xd9534f, { pos: [-2.7, y + .06, -4.1] })); for (let i = 0; i < 4; i++) Wd.add(ball(.07, i % 2 ? 0xe8b23a : 0xd9534f, { pos: [-2.7 + (i - 1.5) * .06, y + .16, -4.1 + (i % 2) * .04], ink: false }));
    Wd.add(cyl(.09, .11, .3, 0x6aa84f, { pos: [-3.95, y + .15, -4.2] })); Wd.add(cyl(.1, .1, .22, 0xf0e0b0, { pos: [-3.1, y + .11, -4.3] }));
    Wd.add(cyl(.2, .2, .24, 0x8a8f9c, { pos: [.35, y + .12, -4.15] })); Wd.add(cyl(.2, .2, .03, 0x6a6f7c, { pos: [.35, y + .255, -4.15], ink: false }));
    for (let i = 0; i < 5; i++) Wd.add(cyl(.13, .13, .015, 0xffffff, { pos: [1.15, y + .01 + i * .016, -4.1], ink: false }));
    Wd.add(box(.5, .16, .3, 0x2f5a8a, { pos: [1.2, y + .1 + .04, -3.95] }));
  }
  function dishes(Wd, x, z) {   // table crowded with dishes
    const y = TY + .05;
    const stacks = [[-.9, -.25], [-.3, .3], [.2, -.3], [.7, .25], [1.1, -.2], [-.6, .3], [.5, 0]];
    stacks.forEach(([dx, dz], i) => { for (let k = 0; k < 4; k++) Wd.add(cyl(.17, .15, .02, k % 2 ? 0xffffff : 0xe9eef7, { pos: [x + dx, y + .02 + k * .025, z + dz], ink: false })); });
    [[-1.1, .25, 0x8a8f9c], [0, -.1, 0x6a6f7c], [.9, .0, 0x8a8f9c]].forEach(([dx, dz, c]) => { Wd.add(cyl(.2, .18, .22, c, { pos: [x + dx, y + .11, z + dz] })); Wd.add(cyl(.2, .2, .03, 0x5a5f6c, { pos: [x + dx, y + .235, z + dz], ink: false })); });
    [[-.45, -.05], [.45, .3], [1.25, .3], [-1.2, -.3]].forEach(([dx, dz], i) => Wd.add(ball(.15, JARS[i % JARS.length], { pos: [x + dx, y + .1, z + dz], scale: [1, .6, 1] })));
    Wd.add(box(.6, .04, .34, 0xc89a5a, { pos: [x + .1, y + .02, z + .38] })); Wd.add(ball(.13, 0xe3b25a, { pos: [x + .1, y + .09, z + .38], scale: [1.6, .6, 1] }));
    for (let i = 0; i < 6; i++) Wd.add(cyl(.04, .035, .1, 0xcfe6f0, { pos: [x - 1.0 + i * .13, y + .05, z - .42], ink: false }));
  }
  function kitchen(Wd, o) {
    o = o || {};
    const R = plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: 0xf4e8cc, beams: false });
    sunsetWin(Wd, CXC, 2.15, -R.HZ + .02, 1.4, 1.15); Wd.add(box(.36, 1.6, .1, 0xd9a05f, { pos: [CXC - 1.0, 2.8, -R.HZ + .1], ink: false })); Wd.add(box(.36, 1.6, .1, 0xd9a05f, { pos: [CXC + 1.0, 2.8, -R.HZ + .1], ink: false }));
    Wd.add(box(5.9, 1.2, .06, 0x8fc4c4, { pos: [-1.15, CTOP + .6, -4.47], ink: false })); Wd.add(box(2.1, 1.2, .08, 0x2a6670, { pos: [CXC, CTOP + .6, -4.45], ink: false }));
    Wd.add(box(5.9, .86, .8, 0xd9b27c, { pos: [-1.15, .43, -4.1] })); Wd.add(box(6.0, .06, .86, 0x8f6b46, { pos: [-1.15, CTOP - .03, -4.07] }));
    for (const x of [-3.7, -2.4, -.1, 1.1]) Wd.add(box(.04, .5, .03, 0x6a4326, { pos: [x, .5, -3.69], ink: false }));
    Wd.add(box(1.7, .8, .4, 0xcaa070, { pos: [-3.25, 2.55, -4.3] })); Wd.add(box(1.5, .8, .4, 0xcaa070, { pos: [1.05, 2.55, -4.3] }));
    Wd.add(box(.9, 2.0, .85, 0xdfe6ea, { pos: [-5.0, 1.0, -4.0] })); Wd.add(box(.05, .8, .06, 0x8a8f9c, { pos: [-4.52, 1.2, -3.7], ink: false }));
    counterStuff(Wd); shelfUnit(Wd, -5.0, -1.4);
    // side door (closed) on the back wall
    Wd.add(box(.1, 2.35, .14, 0x6b3a1c, { pos: [2.95, 1.17, -4.43] })); Wd.add(box(.1, 2.35, .14, 0x6b3a1c, { pos: [4.05, 1.17, -4.43] })); Wd.add(box(1.2, .12, .14, 0x6b3a1c, { pos: [3.5, 2.38, -4.43] }));
    Wd.add(box(1.0, 2.25, .06, 0xb77a3a, { pos: [3.5, 1.125, -4.44] })); Wd.add(box(.78, .85, .03, 0xc98a4a, { pos: [3.5, 1.7, -4.41], ink: false })); Wd.add(box(.78, .85, .03, 0xc98a4a, { pos: [3.5, .6, -4.41], ink: false }));
    Wd.add(ball(.05, 0xd9a63a, { pos: [3.88, 1.05, -4.39] })); Wd.add(box(.05, .035, .14, 0xd9a63a, { pos: [3.86, 1.05, -4.33], ink: false }));
    Wd.add(cyl(.28, .28, .06, 0xfff6e4, { pos: [4.85, 2.6, -4.45], rot: [PI / 2, 0, 0] })); Wd.add(box(.03, .2, .02, 0x1c2745, { pos: [4.85, 2.65, -4.41], ink: false })); Wd.add(box(.14, .03, .02, 0xc4161c, { pos: [4.9, 2.6, -4.41], ink: false }));
    // table
    const tz = o.tz === undefined ? -1.1 : o.tz, tx = o.tx === undefined ? .6 : o.tx;
    diningTable(Wd, { x: tx, z: tz, len: 2.6, wid: 1.1, food: false, cloth: o.full ? 0xe8d7b0 : 0xffffff });
    if (o.full) dishes(Wd, tx, tz); else { Wd.add(box(.55, .1, .3, 0x244a86, { pos: [tx, TY + .1, tz + .14] })); Wd.add(ball(.16, 0xe3b25a, { pos: [tx, TY + .15, tz + .14], scale: [1.5, .6, 1] }));
      for (const x of [-1.0, -.35, .35, 1.0]) { Wd.add(cyl(.17, .15, .02, 0xffffff, { pos: [tx + x, TY + .07, tz + .38], ink: false })); Wd.add(cyl(.17, .15, .02, 0xffffff, { pos: [tx + x, TY + .07, tz - .38], ink: false })); } }
    if (o.stool) { Wd.add(cyl(.17, .2, STY, 0x9a6a3e, { pos: [DCX, STY / 2, DCZ] })); }
    return R;
  }
  const baseLight = (Wd) => lighting(Wd, t => ({ hemi: 1.05, sun: .9, hemiColor: WARM, sunColor: new THREE.Color(0xfff1dc) }));
  const counterCandles = (Wd, lean, flame) => [-1, 1].map((s, i) => fcandle(Wd, { pos: [CXC + s * CDX, CB, CZC], lean: lean[i], flame: flame }));

  // ---------------------------------------------------------------- 1. HOOK 0-14: Dudi walks past the burning candles, the flames lean, he stops and looks at us
  function hook(dur) {
    const Wd = skyW(); kitchen(Wd, { full: true }); baseLight(Wd);
    const mv = mover([[0, -3.3, LANE], [4.6, .75, LANE]]);
    const ln = leans([{ x: CXC - CDX, z: CZC }, { x: CXC + CDX, z: CZC }], [mv], dur);
    const cds = counterCandles(Wd, ln); ripples(Wd, [mv], [1.3, 1.55], { op: .35 });
    const sp = sparks(Wd, 12, [CXC, 2.0, -3.2], 2.2, 0xffe9a8, .12); Wd.on(t => sp(t));
    boyK(Wd, DUDI, t => { const s = walker(mv, t, lerp(PI / 2, face(.1, 1), sm(P(4.4, 5.6, t))));
      if (t > 5.4) { s.gesture = t < 9.6 ? 'shrug' : 'think'; s.brow = .5; s.smile = 0; s.look = .3; s.perform = 0; } else { s.look = .2; s.smile = .3; }
      return s; });
    Wd.occ = cds.map(c => c.g); Wd.center = [0, 0]; Wd.qSize = 1.15; Wd.qPos = [-.2, LANE + .05];
    Wd.cam = cine([cm(0, [-2.6, 1.1, -2.7], 3.6, 34, -12, 46), cm(5, [-.5, 1.1, -2.7], 3.5, 34, 6, 46), cm(10, [.3, 1.15, -2.7], 3.3, 33, -6, 46), cm(14, [.5, 1.2, -2.7], 3.1, 32, 8, 46)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-30: slow motion close-up: air ripples sway the flames, they keep burning bright
  function s2(dur) {
    const Wd = skyW(); kitchen(Wd, { full: true }); baseLight(Wd);
    const mv = mover([[0, -3.5, LANE], [7.6, 1.2, LANE], [8.4, 1.2, LANE], [15.6, -3.5, LANE]]);
    const ln = leans([{ x: CXC - CDX, z: CZC }, { x: CXC + CDX, z: CZC }], [mv], dur);
    const cds = counterCandles(Wd, ln); ripples(Wd, [mv], [1.25, 1.5, 1.75], { op: .55, Tm: .6, life: 2.2 });
    const sp = sparks(Wd, 12, [CXC, 2.0, -3.4], 1.8, 0xffe9a8, .12); Wd.on(t => sp(t));
    boyK(Wd, DUDI, t => { const s = walker(mv, t, t < 8 ? PI / 2 : -PI / 2); s.smile = .35; s.look = .1; return s; });
    Wd.occ = cds.map(c => c.g);
    Wd.cam = cine([cm(0, [-1.9, 1.1, -2.8], 3.3, 36, -12, 44), cm(5, [-.5, 1.1, -2.8], 3.1, 36, 8, 44), cm(10, [-.7, 1.1, -2.8], 3.1, 36, -8, 44), cm(dur, [-1.4, 1.1, -2.8], 3.3, 36, 10, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 30-46: sign "kibui" with a grey lock, then label "movement != extinguishing" with a green check
  function lock(Wd) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
    inner.add(box(.5, .4, .2, 0x8a8f9c, { pos: [0, 0, 0] })); inner.add(box(.1, .14, .22, 0x3a3f4c, { pos: [0, -.02, 0], ink: false }));
    const sh = new THREE.Mesh(new THREE.TorusGeometry(.17, .05, 8, 20, PI), toon(0xb0b5c0)); sh.position.set(0, .2, 0); inner.add(sh);
    bill(Wd, g);
    return { g, set(pos, s, shut) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); sh.position.y = .2 - .06 * shut; } };
  }
  function s3(dur) {
    const Wd = skyW(); kitchen(Wd, { full: true }); baseLight(Wd);
    const mv = mover([[0, -3.9, LANE], [4.6, -3.9, LANE], [10.6, 1.1, LANE]]);
    const mn = mover([[0, 1.9, LANE]]);
    const ln = leans([{ x: CXC - CDX, z: CZC }, { x: CXC + CDX, z: CZC }], [mv], dur);
    const cds = counterCandles(Wd, ln); ripples(Wd, [mv], [1.3, 1.55], { op: .4 });
    const sign = board(Wd, { w: 1.5, h: .62, draw: drawWord('מכבה', '#eaeaea', '#4a4a52', '#8f8f99'), cw: 512, frame: 0x5a5a62, glow: 0xbbbbcc });
    const lk = lock(Wd);
    const label = board(Wd, { w: 3.0, h: .62, draw: drawWord('תזוזת השלהבת ≠ כיבוי', '#fff4cf', '#7a1c1c', '#d9a63a'), cw: 768, frame: 0x6b3a1c, glow: 0xffd27a });
    const ck = mark3d(Wd, 'check', .7), sk = shock(Wd, 0x6dff9a);
    const sp = sparks(Wd, 12, [CXC, 2.0, -3.4], 2.0, 0xffe9a8, .12); Wd.on(t => sp(t));
    Wd.on(t => { const fl = sm(P(.8, 3.6, t));
      sign.set([CXC - 1.55, lerp(1.1, 2.0, fl) + .04 * Math.sin(t * 1.6), CZC + .1], popE(P(.8, 1.8, t)) * .85, .12 * Math.sin(t * .9));
      lk.set([CXC - 1.0, lerp(1.0, 1.65, fl) + .04 * Math.sin(t * 1.6 + 1), CZC + .2], popE(P(3.6, 4.6, t)) * .8, sm(P(4.6, 5.2, t)));
      label.set([CXC + .75, 2.3 + .03 * Math.sin(t * 1.4), CZC], popE(P(8.0, 9.2, t)) * .9, 0);
      ck.set([CXC + 1.1, 1.65 + .04 * Math.sin(t * 2), CZC + .1], popE(P(10.2, 11.2, t)) * .8, .06 * Math.sin(t * 3)); sk.set([CXC + 1.1, 1.65, CZC + .1], P(10.2, 11.2, t), 2.6); });
    boyK(Wd, DUDI, t => { const s = walker(mv, t, face(.2, 1)); s.smile = .3 + .4 * sm(P(8, 10, t)); s.look = .1; if (t > 11) { s.gesture = 'thumb'; s.perform = 0; } return s; });
    boyK(Wd, NACHUM, t => { const s = walker(mn, t, face(-.6, 1)); s.scale = MS; s.smile = .4 + .5 * sm(P(9.6, 11, t)); s.look = -.2; s.perform = .3; if (t > 11.4) { s.gesture = 'point'; s.perform = 0; } return s; });
    Wd.occ = cds.map(c => c.g).concat([sign.g, lk.g, label.g, ck.g]);
    Wd.cam = cine([cm(0, [-1.4, 1.05, -2.8], 4.7, 32, -12, 44), cm(5, [-1.0, 1.05, -2.8], 4.5, 32, 6, 44), cm(11, [-.4, 1.05, -2.8], 4.4, 32, -8, 44), cm(dur, [-.1, 1.05, -2.8], 4.6, 32, 8, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 46-62: the kitchen from above: table full, shelf full, the counter is the only free spot (green glowing circle)
  function s4(dur) {
    const Wd = skyW(); kitchen(Wd, { full: true }); baseLight(Wd);
    const ln = [t => [.05 * Math.sin(t * 1.3), 0], t => [.05 * Math.sin(t * 1.3 + 1), 0]];
    const cds = counterCandles(Wd, ln);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.85, .035, 8, 48), new THREE.MeshBasicMaterial({ color: 0x4dff88, transparent: true, opacity: 0, depthWrite: false, fog: false })); ring.rotation.x = PI / 2; ring.position.set(CXC, CTOP + .03, CZC + .02); Wd.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(.85, 40), new THREE.MeshBasicMaterial({ color: 0x4dff88, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide })); disc.rotation.x = PI / 2; disc.position.set(CXC, CTOP + .025, CZC + .02); Wd.add(disc);
    const gl = glowSprite(2.6, 2.6, 0); gl.material.color.set(0x7dffa8); gl.position.set(CXC, CTOP + .5, CZC + .2); Wd.add(gl);
    const ck = mark3d(Wd, 'check', .6);
    Wd.on(t => { const k = sm(P(9.6, 11.0, t)), pu = .85 + .15 * Math.sin(t * 3); ring.material.opacity = .95 * k * pu; disc.material.opacity = .28 * k * pu; gl.material.opacity = .4 * k;
      ring.scale.setScalar(1.15 - .15 * k + .03 * Math.sin(t * 3)); disc.scale.copy(ring.scale); ck.set([CXC, 2.1 + .04 * Math.sin(t * 2), CZC + .2], popE(P(11.6, 12.6, t)) * .7, .05 * Math.sin(t * 3)); });
    const sp = sparks(Wd, 12, [CXC, 1.8, -3.4], 1.8, 0xffe9a8, .12); Wd.on(t => sp(t));
    const mD = mover([[0, 1.5, LANE], [4, 1.3, LANE], [8.5, -1.0, -2.7], [11, -1.2, LANE]]), mN = mover([[0, -.3, LANE], [4.4, -.5, -2.0], [7.6, -3.4, -1.7], [11, -2.3, LANE]]);
    boyK(Wd, DUDI, t => { const s = walker(mD, t, t < 9 ? face(.1, 1) : face(-.2, -.4)); if (t < 4) { s.gesture = 'point'; s.perform = 0; } else if (t > 12) { s.gesture = 'thumb'; s.perform = 0; } else s.perform = .3; s.brow = t < 9 ? .4 : 0; s.look = .2; s.smile = t > 11 ? .8 : .1; return s; });
    boyK(Wd, NACHUM, t => { const s = walker(mN, t, t < 8.5 ? face(-1, 0) : face(.3, -1)); s.scale = MS; if (t < 5) { s.gesture = 'shrug'; s.perform = 0; } else s.perform = .3; s.brow = .3; s.look = -.2; s.smile = t > 11 ? .8 : .1; return s; });
    Wd.occ = cds.map(c => c.g).concat([ck.g]);
    Wd.cam = cine([cm(0, [.9, .8, -1.8], 3.0, 60, 6, 44), cm(4.8, [.3, .8, -1.9], 2.9, 60, -4, 44), cm(7.4, [-3.2, .8, -2.0], 2.9, 58, 6, 44), cm(10.2, [-1.4, .8, -3.0], 2.8, 56, -2, 44), cm(dur, [-1.0, .85, -3.0], 3.0, 54, 6, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 62-76: Nachum also walks past, carefully; flames lean and come back; green check
  function s5(dur) {
    const Wd = skyW(); kitchen(Wd, { full: true }); baseLight(Wd);
    const mn = mover([[0, -3.8, LANE], [1.0, -3.8, LANE], [8.0, 1.2, LANE]]);
    const mdu = mover([[0, 1.5, LANE]]);
    const ln = leans([{ x: CXC - CDX, z: CZC }, { x: CXC + CDX, z: CZC }], [mn], dur);
    const cds = counterCandles(Wd, ln); ripples(Wd, [mn], [1.3, 1.55], { op: .4, Tm: .6 });
    const ck = mark3d(Wd, 'check', .8), sk = shock(Wd, 0x6dff9a), glo = glowAt(Wd.scene, 3.4, 0x6dff9a, 0); glo.position.set(CXC, 1.5, CZC + .3);
    Wd.on(t => { ck.set([CXC, 2.2 + .04 * Math.sin(t * 2), CZC + .1], popE(P(8.8, 9.8, t)) * .75, .06 * Math.sin(t * 3)); sk.set([CXC, 2.2, CZC + .1], P(8.8, 9.8, t), 3.0); glo.material.opacity = .25 * sm(P(8.9, 10, t)); });
    const sp = sparks(Wd, 12, [CXC, 2.0, -3.4], 2.0, 0xffe9a8, .12); Wd.on(t => sp(t));
    boyK(Wd, NACHUM, t => { const s = walker(mn, t, face(.3, 1)); s.scale = MS; s.look = .1; s.smile = .35 + .5 * sm(P(8, 10, t)); if (t < 1.0 || t > 8.4) { s.perform = .2; } if (t > 9.5) { s.gesture = 'thumb'; s.perform = 0; } return s; });
    boyK(Wd, DUDI, t => { const s = walker(mdu, t, face(-.5, 1)); s.smile = .5; s.look = -.2; s.perform = .3; if (t > 9.6) { s.gesture = 'thumb'; s.perform = 0; } return s; });
    Wd.occ = cds.map(c => c.g).concat([ck.g]);
    Wd.cam = cine([cm(0, [-2.0, 1.05, -2.8], 4.3, 34, -10, 44), cm(4.6, [-.7, 1.05, -2.8], 4.0, 34, 8, 44), cm(9, [-.2, 1.1, -2.8], 4.0, 34, -6, 44), cm(dur, [-.3, 1.1, -2.8], 4.4, 32, 8, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 76-90: a separate candle right against the door; the boy's hand stops before the handle; red X; dotted arc of the door
  function s6(dur) {
    const Wd = skyW(); kitchen(Wd, { full: true, stool: true }); baseLight(Wd);
    const mv = mover([[0, .4, -3.0], [3.6, 4.5, -2.25], [5.4, 4.35, -3.55], [9.0, 4.35, -3.55], [10.6, 4.5, -3.0]]);
    const trem = t => sm(P(8.2, 8.8, t)) * (1 - sm(P(11.4, 12.2, t)));
    const lean = t => [.4 * trem(t) * Math.sin(t * 5.5) + .05 * Math.sin(t * 1.3), -.35 * trem(t)];
    const dc = fcandle(Wd, { pos: [DCX, STY + .14, DCZ], lean: lean, fs: 1.5, gs: .55, li: .12 });
    const mk = (y, col) => { const m = new THREE.Mesh(new THREE.CircleGeometry(.95, 28, 0, 75 * PI / 180), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide })); m.rotation.x = PI / 2; m.position.set(HING[0], y, HING[1]); m.renderOrder = 4; Wd.add(m); return m; };
    const secF = mk(.05, 0xff3030), secC = mk(1.1, 0xff4a4a);
    const gh = new THREE.Group(); gh.position.set(HING[0], 0, HING[1]); Wd.add(gh); const ghm = new THREE.MeshBasicMaterial({ color: 0xff3a3a, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide });
    const gp = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.25, .06), ghm); gp.position.set(.5, 1.125, .05); gp.renderOrder = 5; gh.add(gp);
    const apts = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * 75 * PI / 180; apts.push([HING[0] + .88 * Math.cos(a), 1.06, HING[1] + .88 * Math.sin(a)]); }
    const dp = dotPath(Wd, apts, { step: .12, r: .065, color: 0xff3030 });
    const x = mark3d(Wd, 'cross', .9), sk = shock(Wd, 0xff5a5a);
    const sp = sparks(Wd, 10, [3.4, 1.8, -3.6], 1.6, 0xffe9a8, .12); Wd.on(t => sp(t));
    Wd.on(t => { const k = sm(P(7.6, 8.4, t)) * (1 - sm(P(12.4, 13.4, t))), pu = .8 + .2 * Math.sin(t * 4);
      secF.material.opacity = .55 * k * pu; secC.material.opacity = .3 * k * pu; ghm.opacity = .3 * k * pu; gh.rotation.y = -(42 * PI / 180) * (.5 - .5 * Math.cos(2 * PI * clamp((t - 8.4) / 3.2, 0, 1))); dp.set(sm(P(8.0, 10.4, t)) * (t > 12.4 ? 1 - sm(P(12.4, 13.4, t)) : 1), t);
      const pk = P(7.0, 7.8, t); x.set([DCX - .1, 2.6 + .04 * Math.sin(t * 2), -3.9], popE(pk) * .95 * (1 - sm(P(12.8, 13.6, t))), .05 * Math.sin(t * 3)); sk.set([DCX - .1, 2.6, -3.9], pk, 3.2); });
    boyK(Wd, DUDI, t => { const s = walker(mv, t, t < 9 ? face(-.42, -.69) : face(-.3, -.8)); s.look = .1; s.smile = 0; s.brow = .4;
      if (t >= 5.4 && t < 8.6) { s.gesture = 'point'; s.perform = 0; } else if (t >= 8.6 && t < 11) { s.gesture = 'shrug'; s.perform = 0; } else if (t >= 11) s.perform = .3;
      return s; });
    Wd.occ = [dc.g, x.g]; Wd.center = [0, 0];
    Wd.cam = cine([cm(0, [2.4, 1.0, -3.5], 5.0, 34, -20, 44), cm(5, [3.4, .95, -3.7], 4.6, 34, -24, 44), cm(9.5, [3.5, .95, -3.8], 4.4, 36, -20, 44), cm(dur, [3.4, .95, -3.8], 4.8, 34, -26, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 90-100: recap: counter candles sway (check), door candle (cross); the boys walk to the table and sit
  function s7(dur) {
    const Wd = skyW(); kitchen(Wd, { full: false, stool: true }); baseLight(Wd);
    [-1.85, -.55].forEach(x => chair(Wd, x + 1.1, -2.05, 0, .46));
    const mD = mover([[0, -2.8, LANE], [4.4, 0.1, LANE], [6.8, .65, -1.92]]), mN = mover([[0, 4.4, -2.7], [2.8, 4.4, -2.7], [7.4, 1.75, -1.92]]);
    const ln = leans([{ x: CXC - CDX, z: CZC }, { x: CXC + CDX, z: CZC }], [mD], dur);
    const cds = counterCandles(Wd, ln); ripples(Wd, [mD], [1.3, 1.55], { op: .35 });
    const dc = fcandle(Wd, { pos: [DCX, STY + .14, DCZ], lean: t => [.04 * Math.sin(t * 1.5), 0], gs: .55, li: .12 });
    const ck = mark3d(Wd, 'check', .8), x = mark3d(Wd, 'cross', .8);
    Wd.on(t => { const fade = 1 - sm(P(5.2, 6.2, t));
      ck.set([CXC, 2.2 + .04 * Math.sin(t * 2), CZC + .1], popE(P(.3, 1.2, t)) * .7 * fade, .05 * Math.sin(t * 3)); x.set([DCX - .1, 2.2 + .04 * Math.sin(t * 2 + 1), -3.9], popE(P(1.0, 1.9, t)) * .7 * fade, .05 * Math.sin(t * 3)); });
    const sp = sparks(Wd, 12, [1.4, 1.9, -3.4], 3.0, 0xffe9a8, .12); Wd.on(t => sp(t));
    boyK(Wd, DUDI, t => { const s = walker(mD, t, face(0, 1)); s.smile = .5; s.look = .1;
      if (t > 6.5) { Object.assign(s, SIT); s.pos = [.65, RB + .3 * (1 - sm(P(6.5, 7.5, t))), -1.92]; s.facing = 0; s.walk = undefined; s.perform = .3; s.smile = .9; } return s; });
    boyK(Wd, NACHUM, t => { const s = walker(mN, t, t < 2.8 ? face(-.3, 1) : face(0, 1)); s.scale = MS; s.smile = .5; s.look = -.1; if (t < 2.8) { s.gesture = 'shrug'; s.perform = 0; }
      if (t > 7.0) { Object.assign(s, SIT); s.pos = [1.75, RB + .3 * (1 - sm(P(7.0, 8.0, t))), -1.92]; s.facing = 0; s.walk = undefined; s.perform = .3; s.smile = .9; } return s; });
    Wd.occ = cds.map(c => c.g).concat([dc.g, ck.g, x.g]); Wd.center = [0, 0];
    Wd.cam = cine([cm(0, [1.3, 1.3, -3.3], 5.6, 30, 0, 44), cm(3.0, [1.3, 1.3, -3.2], 5.4, 30, 6, 44), cm(6.0, [1.1, 1.1, -2.2], 3.9, 28, -6, 44), cm(dur, [1.1, 1.1, -2.1], 3.4, 26, 4, 44)]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the boys at the Shabbat table, the burning candles on a counter beside them
  function answerBg(dur) {
    const Wd = skyW({ hemi: 1.2, sun: 1.1 });
    plainRoom(Wd, { HX: 5.5, HZ: 4.5, H: 3.6, wall: 0xf4e8cc, beams: false });
    sunsetWin(Wd, -2.6, 1.0, -4.48, 1.6, 2.1); sunsetWin(Wd, 2.6, 1.0, -4.48, 1.6, 2.1);
    diningTable(Wd, { x: 0, z: 2.4, len: 2.8, wid: 1.1, food: false });
    Wd.add(box(.55, .1, .3, 0x244a86, { pos: [0, TY + .1, 2.54] })); Wd.add(ball(.16, 0xe3b25a, { pos: [0, TY + .15, 2.54], scale: [1.5, .6, 1] }));
    for (const x of [-1.05, -.35, .35, 1.05]) { Wd.add(cyl(.17, .15, .02, 0xffffff, { pos: [x, TY + .07, 2.78], ink: false })); Wd.add(cyl(.17, .15, .02, 0xffffff, { pos: [x, TY + .07, 2.02], ink: false })); }
    [-.55, .55].forEach(dx => chair(Wd, dx, 2.4 - .95, 0, .46));
    Wd.add(box(1.6, .86, .8, 0xd9b27c, { pos: [-3.1, .43, 2.3] })); Wd.add(box(1.7, .06, .86, 0x8f6b46, { pos: [-3.1, CTOP - .03, 2.3] }));
    const cd = [-1, 1].map(s => fcandle(Wd, { pos: [-3.1 + s * .3, CB, 2.3], lean: t => [.1 * Math.sin(t * 1.2 + s), 0] }));
    const gl = glowAt(Wd.scene, 6, 0xffc070, .15); gl.position.set(-1.5, 1.4, 2.5);
    const sp = sparks(Wd, 14, [0, 1.6, 2.4], 1.8, 0xffe9a8, .14); Wd.on(t => sp(t));
    boyK(Wd, DUDI, t => Object.assign({ pos: [-.55, RB, 1.58], facing: 0, smile: 1, perform: .5, talk: .5 * talkAmt(t, 2) }, SIT));
    boyK(Wd, NACHUM, t => Object.assign({ pos: [.55, RB, 1.58], facing: 0, scale: MS, smile: 1, perform: .5, talk: .5 * talkAmt(t, 3) }, SIT));
    Wd.occ = cd.map(c => c.g); Wd.center = [0, 1.6]; Wd.ansD = 6.4; return Wd;
  }

  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg };
};
