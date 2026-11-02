// objects_c2.js - chapter c2 set pieces (evening-before-morning day, sunset, sun/moon, the 24h ring). No text: pips, rings, ticks, icons only.
import { THREE, box, cyl, ball, mesh, toon, canvasTex, rng, ease, prog, clamp, lerp } from '../../../lib/stage3d.js';
import * as O from './objects.js';
import { D2R, backOut, livePlane, mix3 } from './objects_c1b.js';

// ---------------------------------------------------------------- gold pseudo-letters (no real script): words made of bars, rising from the page
export function goldWords(n, o) {
  o = o || {}; const r = rng(o.seed || 9), out = [], gm = () => toon(0xf2bd2c, { emissive: 0x8a5a08 });
  for (let w = 0; w < n; w++) {
    const wg = new THREE.Group(), L = 3 + Math.floor(r() * 2);
    for (let i = 0; i < L; i++) { const lg = new THREE.Group(); lg.position.x = -i * .082; const kind = Math.floor(r() * 5), b = (bw, bh, x, y, rz) => lg.add(mesh(new THREE.BoxGeometry(bw, bh, .016), gm(), { inkW: .003, pos: [x, y, 0], rot: [0, 0, rz || 0] }));
      if (kind === 0) { b(.06, .013, 0, .034); b(.013, .08, .024, 0); } else if (kind === 1) { b(.013, .08, 0, 0); b(.05, .013, -.02, -.034); b(.036, .013, .0, .034); } else if (kind === 2) { b(.06, .013, 0, .034); b(.013, .08, -.024, 0); b(.013, .05, .024, -.014); }
      else if (kind === 3) { b(.013, .07, -.022, 0); b(.013, .07, .022, 0); b(.058, .013, 0, .034); } else { b(.06, .013, 0, -.034); b(.013, .08, 0, 0); b(.04, .013, -.012, .034, -.3); }
      wg.add(lg); }
    const gl = O.glow(.34, 0xffc860, .0); gl.position.set(-.1, 0, .03); wg.add(gl); out.push({ g: wg, gl, w: L * .082 });
  }
  return out;
}

// ---------------------------------------------------------------- two big day blocks: the dark evening block and the bright morning block
const blockTex = (dark) => canvasTex(512, 384, (c, w, h) => {
  const gr = c.createLinearGradient(0, 0, 0, h); if (dark) { gr.addColorStop(0, '#0d1638'); gr.addColorStop(1, '#27367a'); } else { gr.addColorStop(0, '#ffe6a0'); gr.addColorStop(1, '#ffb248'); } c.fillStyle = gr; c.fillRect(0, 0, w, h);
  const r = rng(dark ? 3 : 4);
  if (dark) { c.fillStyle = '#f4efd8'; c.beginPath(); c.arc(256, 190, 96, 0, 7); c.fill(); c.fillStyle = '#1c2a62'; c.beginPath(); c.arc(300, 170, 92, 0, 7); c.fill(); for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,255,255,${.5 + r() * .5})`; c.beginPath(); c.arc(r() * w, r() * h, 1.5 + r() * 3, 0, 7); c.fill(); } }
  else { c.save(); c.translate(256, 192); c.strokeStyle = '#fff6c8'; c.lineWidth = 12; c.lineCap = 'round'; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 112, Math.sin(a) * 112); c.lineTo(Math.cos(a) * 160, Math.sin(a) * 160); c.stroke(); } c.fillStyle = '#fffbe0'; c.beginPath(); c.arc(0, 0, 92, 0, 7); c.fill(); c.restore(); }
  c.strokeStyle = dark ? 'rgba(180,200,255,.5)' : 'rgba(150,90,10,.5)'; c.lineWidth = 10; c.strokeRect(10, 10, w - 20, h - 20); });
export function dayBlocks(Wd) {
  const mk = dark => { const side = toon(dark ? 0x1b2660 : 0xf2a63a, { emissive: dark ? 0x060a22 : 0x6a3a08 }), face = toon(0xffffff, { map: blockTex(dark), emissive: dark ? 0x10183c : 0x7a4a10 }); const m = mesh(new THREE.BoxGeometry(1.9, 1.4, .7), [side, side, side, side, face, side], { inkW: .02, box: true }); return m; };
  const dk = mk(true), br = mk(false), R = {}; Wd.add(dk); Wd.add(br);
  const gD = O.glow(3.4, 0x5a78ff, 0), gB = O.glow(3.8, 0xffc060, 0); Wd.add(gD); Wd.add(gB);
  const slab = box(5.6, .18, 1.6, 0x5a5666, { pos: [0, -.1, 0], inkW: .02 }); Wd.add(slab);
  const trailD = O.glow(2.2, 0x6a88ff, 0), trailB = O.glow(2.2, 0xffd080, 0); Wd.add(trailD); Wd.add(trailB);
  R.slab = slab; R.set = (kd, kb, g) => { const pos = (m, x0, x1, k, gl, tr) => { const e = ease.out(k), x = lerp(x0, x1, e); m.position.set(x, .7 + (1 - e) * .0, 0); m.visible = k > 0; gl.position.set(x, .75, -.1); gl.material.opacity = k > 0 ? (.25 + .6 * Math.exp(-Math.pow((k - 1) * 14, 2) * .02) * (k < 1 ? 1 : 0)) : 0;
      tr.position.set(x + (x0 > x1 ? .9 : -.9) * (1 - e) * 3, .75, .1); tr.material.opacity = k > 0 && k < 1 ? .7 * (1 - e) : 0; m.rotation.y = (x0 > x1 ? -1 : 1) * (1 - e) * .25; };
    pos(dk, 7.5, 1.05, kd, gD, trailD); pos(br, -7.5, -1.05, kb, gB, trailB); R.dk = dk; R.br = br; };
  R.set(0, 0, 0); return R;
}

// ---------------------------------------------------------------- Shabbat candles on a white cloth (candles only)
export function candles(Wd, o) {
  o = o || {}; const g = O.grp(Wd, o), R = { flames: [] };
  g.add(box(2.4, .1, 1.1, 0x6a4526, { pos: [0, .75, 0], inkW: .01 })); [[-1.1, -.45], [1.1, -.45], [-1.1, .45], [1.1, .45]].forEach(([x, z]) => g.add(box(.08, .75, .08, 0x5a3a1c, { pos: [x, .375, z], inkW: .006 })));
  g.add(box(2.7, .03, 1.35, 0xf4f1ea, { pos: [0, .815, 0], inkW: .006 })); g.add(box(2.7, .5, .03, 0xf4f1ea, { pos: [0, .58, .68], inkW: .004 }));
  [-.4, .4].forEach(x => { const s = O.grp(Wd, { pos: [x, .83, -.1] }); g.add(s); s.add(cyl(.15, .2, .05, 0xc9ccd6, { pos: [0, .025, 0], inkW: .006 })); s.add(cyl(.03, .04, .5, 0xc9ccd6, { pos: [0, .3, 0], inkW: .005 })); s.add(cyl(.09, .04, .09, 0xc9ccd6, { pos: [0, .58, 0], inkW: .005 }));
    s.add(cyl(.045, .05, .5, 0xfaf3df, { pos: [0, .83, 0], inkW: .005 })); const fl = new THREE.Mesh(new THREE.ConeGeometry(.04, .13, 10), new THREE.MeshBasicMaterial({ color: 0xffb030, fog: false })); fl.position.y = 1.15; s.add(fl); const gl = O.glow(.7, 0xffb050, 0); gl.position.y = 1.15; s.add(gl); R.flames.push({ fl, gl }); });
  const pl = new THREE.PointLight(0xffa850, 0, 6, 2); pl.position.set(0, 2.1, .1); g.add(pl); R.light = pl; R.g = g;
  R.set = (lit, t) => { R.flames.forEach((f, i) => { const fk = lit * (.9 + .1 * Math.sin(t * 11 + i * 2)); f.fl.visible = lit > .02; f.fl.scale.set(fk, fk * (1 + .12 * Math.sin(t * 13 + i)), fk); f.gl.material.opacity = .8 * lit * (.85 + .15 * Math.sin(t * 9 + i * 3)); f.gl.scale.setScalar(.7 * (.9 + .1 * Math.sin(t * 7 + i))); }); pl.intensity = 2.6 * lit; };
  R.set(0, 0); return R;
}

// ---------------------------------------------------------------- three stars + the day tile (3 pips on the front, 4 on the back)
export function starSet(Wd, list) {
  const R = { items: [] };
  list.forEach(p => { const g = new THREE.Group(); g.position.set(...p); const gl = O.glow(10, 0xdce8ff, 0); g.add(gl); const bar = (w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); g.add(m); return m; };
    const b1 = bar(5.4, .35), b2 = bar(.35, 5.4); Wd.add(g); R.items.push({ g, gl, b1, b2 }); });
  R.set = (ks, t) => R.items.forEach((s, i) => { const k = clamp(ks[i] || 0, 0, 1), e = backOut(k), tw = .85 + .15 * Math.sin(t * 3 + i * 2); s.gl.material.opacity = .9 * k * tw; s.b1.material.opacity = s.b2.material.opacity = k * tw; s.g.scale.setScalar(Math.max(.001, e)); });
  return R;
}
const pipTex = (n, dark) => canvasTex(512, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); if (dark) { gr.addColorStop(0, '#1d2a66'); gr.addColorStop(1, '#0d1638'); } else { gr.addColorStop(0, '#ffe9a8'); gr.addColorStop(1, '#ffb855'); } c.fillStyle = gr; c.fillRect(0, 0, w, h);
  const P = { 3: [[256, 120], [140, 340], [372, 340]], 4: [[150, 150], [362, 150], [150, 362], [362, 362]], 2: [[170, 256], [342, 256]] }[n]; P.forEach(([x, y]) => { c.shadowColor = dark ? '#ffd060' : '#fff'; c.shadowBlur = 30; c.fillStyle = dark ? '#ffd870' : '#2a3a7a'; c.beginPath(); c.arc(x, y, 52, 0, 7); c.fill(); }); c.shadowBlur = 0; c.strokeStyle = dark ? '#ffcb5a' : '#a8681a'; c.lineWidth = 16; c.strokeRect(10, 10, w - 20, h - 20); });
export function dayTile(Wd, o) {
  o = o || {}; const g = O.grp(Wd, o), edge = toon(0xd9a21f), f3 = toon(0xffffff, { map: pipTex(3, true), emissive: 0x181c3a }), f4 = toon(0xffffff, { map: pipTex(4, false), emissive: 0x6a4a10 });
  const m = mesh(new THREE.BoxGeometry(1.5, 1.5, .16), [edge, edge, edge, edge, f3, f4], { inkW: .02, box: true }); g.add(m); const gl = O.glow(4.2, 0xffd070, 0); gl.position.z = -.2; g.add(gl);
  return { g, m, gl, flip(k) { m.rotation.y = Math.PI * ease.io(clamp(k, 0, 1)); m.position.z = Math.sin(Math.PI * clamp(k, 0, 1)) * .5; gl.material.opacity = .25 + .6 * Math.sin(Math.PI * clamp(k, 0, 1)); } };
}

// ---------------------------------------------------------------- the 24 h ring (midnight at the top, noon at the bottom, sunset at the left)
export function dayRing(Wd, o) {
  o = o || {}; const R0 = 1.5, g = O.grp(Wd, o), R = { g, R0 };
  const tex = canvasTex(1024, 1024, (c, W, H) => { const C = 512, hue = h => { const e = -Math.cos(h / 24 * Math.PI * 2), k = clamp((e + .12) / .5, 0, 1), s = k * k * (3 - 2 * k), dawn = Math.exp(-Math.pow(e / .18, 2));
      const A = [14, 24, 66], B = [255, 222, 120], D = [240, 128, 64]; const m = [0, 1, 2].map(i => lerp(A[i], B[i], s) * (1 - dawn * .7) + D[i] * dawn * .7); return `rgb(${m.map(Math.round).join(',')})`; };
    c.fillStyle = '#10163a'; c.beginPath(); c.arc(C, C, 512, 0, 7); c.fill(); for (let i = 0; i < 24; i++) { const a0 = (i / 24) * Math.PI * 2 - Math.PI / 2 - Math.PI / 24, a1 = a0 + Math.PI / 12; c.fillStyle = hue(i); c.beginPath(); c.moveTo(C, C); c.arc(C, C, 470, a0 + .004, a1 - .004); c.closePath(); c.fill(); }
    c.fillStyle = '#10163a'; c.beginPath(); c.arc(C, C, 230, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,230,160,.8)'; c.lineWidth = 6; c.beginPath(); c.arc(C, C, 230, 0, 7); c.stroke();
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 - Math.PI / 2, big = i % 6 === 0; c.strokeStyle = big ? '#fff2c0' : 'rgba(255,255,255,.55)'; c.lineWidth = big ? 9 : 4; c.beginPath(); c.moveTo(C + Math.cos(a) * (big ? 405 : 430), C + Math.sin(a) * (big ? 405 : 430)); c.lineTo(C + Math.cos(a) * 470, C + Math.sin(a) * 470); c.stroke(); }
    c.fillStyle = '#f4efd8'; c.beginPath(); c.arc(C, 130, 52, 0, 7); c.fill(); c.fillStyle = '#10163a'; c.beginPath(); c.arc(C + 24, 118, 48, 0, 7); c.fill(); // moon at the top
    c.save(); c.translate(C, 894); c.strokeStyle = '#fff0b0'; c.lineWidth = 9; c.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 54, Math.sin(a) * 54); c.lineTo(Math.cos(a) * 84, Math.sin(a) * 84); c.stroke(); } c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.fill(); c.restore(); });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R0, 96), toon(0xffffff, { map: tex, emissive: 0x303040 })); g.add(disc);
  g.add(mesh(new THREE.TorusGeometry(R0 * 1.01, .06, 14, 96), toon(0xd9a21f), { inkW: .012, pos: [0, 0, .02] })); g.add(mesh(new THREE.CylinderGeometry(R0 * 1.03, R0 * 1.03, .14, 64), toon(0x6a4a1c), { inkW: .012, rot: [Math.PI / 2, 0, 0], pos: [0, 0, -.08] }));
  g.add(cyl(.3, .45, 1.4, 0x5a3a1c, { pos: [0, -R0 - .55, -.1], inkW: .012 })); g.add(box(1.6, .12, .9, 0x5a3a1c, { pos: [0, -R0 - 1.25, -.1], inkW: .012 }));
  const pin = (col, glowCol) => { const p = new THREE.Group(); p.add(new THREE.Mesh(new THREE.SphereGeometry(.12, 20, 14), O.basic(col))); const st = cyl(.015, .015, .22, 0xcfcfd8, { pos: [0, -.2, 0], ink: false }); p.add(st); const gl = O.glow(1.0, glowCol, 0); p.add(gl); p.userData.gl = gl; g.add(p); return p; };
  R.mid = pin(0x9aa0b4, 0xb8c0ff); R.sun = pin(0xffc428, 0xffc040); const at = (p, phi) => { const a = phi * D2R, r = R0 * 1.0; p.position.set(Math.sin(a) * r, Math.cos(a) * r, .13); p.rotation.z = -a; p.children[1].position.set(0, -.2, 0); };
  at(R.mid, 0); at(R.sun, 270);
  const sw = box(.05, R0 * .98, .03, 0xfff0a0, { pos: [0, R0 * .49, .06], ink: false }); sw.material = new THREE.MeshBasicMaterial({ color: 0xfff0a0, fog: false }); const swg = new THREE.Group(); swg.add(sw); g.add(swg); const swGlow = O.glow(.9, 0xffe080, 0); swGlow.position.set(0, R0 * .98, .1); swg.add(swGlow); R.swGlow = swGlow; R.sw = swg;
  R.wedge = new THREE.Mesh(new THREE.RingGeometry(R0 * .5, R0 * .97, 48, 1, Math.PI / 2, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd060, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); R.wedge.position.z = .05; g.add(R.wedge);
  // state: sweep phi (deg clockwise from the top, null = hidden), glows 0..1
  R.set = (phi, midG, sunG, wedgeK, t) => { R.sw.visible = phi !== null; if (phi !== null) { R.sw.rotation.z = -phi * D2R; R.swGlow.material.opacity = .8; }
    R.mid.userData.gl.material.opacity = midG * (.6 + .3 * Math.sin(t * 3)); R.sun.userData.gl.material.opacity = sunG * (.7 + .3 * Math.sin(t * 4)); R.sun.scale.setScalar(1 + .35 * sunG * (.5 + .5 * Math.sin(t * 4))); R.mid.scale.setScalar(1 + .15 * midG);
    R.wedge.material.opacity = .22 * wedgeK; };
  R.set(null, 0, 0, 0, 0); return R;
}

// ---------------------------------------------------------------- beams of light that place the sun and the moon in the sky
export function lightBeams(Wd, o) {
  o = o || {}; const SP = o.sunPos || [-3.2, 2.4, -2], MP = o.moonPos || [3.4, 2.1, -2.8], R = {};
  const beam = (to, col, w) => { const h = 40, g = new THREE.Group(); g.position.set(to[0], to[1] + h, to[2]); const m = new THREE.Mesh(new THREE.CylinderGeometry(w * .35, w, h, 20, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); g.add(m); Wd.add(g); return { g, m, to, h }; };
  const bS = beam(SP, 0xffd890, .9), bM = beam(MP, 0xb8c8ff, .7);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(.85, 28, 18), O.basic(0xffd23a)); sun.position.set(...SP); Wd.add(sun); const sg = O.glow(6, 0xffc060, 0); sg.position.set(...SP); Wd.add(sg);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(.6, 28, 18), toon(0xf4efd8, { emissive: 0x8a8a80 })); moon.position.set(...MP); Wd.add(moon); const mg = O.glow(4.4, 0xaec4ff, 0); mg.position.set(...MP); Wd.add(mg);
  const crt = (x, y, z, r) => { const c = new THREE.Mesh(new THREE.CircleGeometry(r, 14), new THREE.MeshBasicMaterial({ color: 0xc8c4b0 })); c.position.set(MP[0] + x, MP[1] + y, MP[2] + z); moon.parent.add(c); c.lookAt(MP[0] + x * 2, MP[1] + y * 2, MP[2] + 4 + z); }; [[-.2, .15, .58, .09], [.18, -.12, .58, .12], [.05, .3, .52, .06], [-.25, -.2, .5, .07]].forEach(a => crt(...a));
  R.set = (kbs, ks, kbm, km, t) => { [[bS, kbs], [bM, kbm]].forEach(([b, k]) => { const e = ease.out(clamp(k, 0, 1)); b.g.scale.set(1, Math.max(.001, e), 1); b.g.position.y = b.to[1] + b.h * e; b.g.position.y = b.to[1] + b.h * e * 1; b.m.material.opacity = k > 0 ? .5 * Math.min(1, k * 3) * (k < 1 ? 1 : Math.max(.2, 1 - (k - 1) * 3)) : 0; });
    // beams hang from the top: a cylinder centred on y, so shift by half its (scaled) height
    [[bS, kbs], [bM, kbm]].forEach(([b, k]) => { const e = ease.out(clamp(k, 0, 1)); b.g.position.y = b.to[1] + b.h * e * .5; });
    const es = backOut(clamp(ks, 0, 1)), em = backOut(clamp(km, 0, 1)); sun.scale.setScalar(Math.max(.001, es)); sg.material.opacity = .85 * clamp(ks, 0, 1) * (.9 + .1 * Math.sin(t * 3)); moon.scale.setScalar(Math.max(.001, em)); mg.material.opacity = .7 * clamp(km, 0, 1); moon.rotation.y = t * .1; };
  R.SP = SP; R.MP = MP; R.set(0, 0, 0, 0, 0); return R;
}

// ---------------------------------------------------------------- the sun becomes a giant clock face, the moon becomes a calendar ring of 30 phases
export function sunClockSet(Wd, o) {
  o = o || {}; const R = {}, C = [0, 1.7, 0], g = O.grp(Wd, { pos: C });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 20), O.basic(0xffd23a)); g.add(sun); const sg = O.glow(7, 0xffc060, .8); g.add(sg); const rays = new THREE.Group(); g.add(rays); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, rr = new THREE.Mesh(new THREE.BoxGeometry(.1, .5, .02), O.basic(0xffe49a)); rr.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0); rr.rotation.z = a - Math.PI / 2; rays.add(rr); }
  const clk = O.wallClock(Wd, { r: 1.05 }); clk.group.parent && clk.group.parent.remove(clk.group); g.add(clk.group); clk.group.position.z = .05;
  const ring = new THREE.Group(); g.add(ring); const balls = [], N = 30;
  for (let i = 0; i < N; i++) { const p = i / N, m = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.17, 18, 12), O.basic(0xf4efd8)); m.add(b); const off = (p < .5 ? -4 * p : 4 * (1 - p)) * .17; if (p > .02) { const d = new THREE.Mesh(new THREE.SphereGeometry(.176, 18, 12), O.basic(0x0c1226)); d.position.set(off, 0, .03); m.add(d); } else { b.material = O.basic(0x2a3050); }
    m.visible = false; ring.add(m); balls.push(m); }
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.6, .012, 6, 120), new THREE.MeshBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0, fog: false })); g.add(orbit);
  R.g = g; R.hero = clk.group;
  // kc: sun -> clock morph (0..1), kr: moon ring forms (0..1)
  R.set = (kc, kr, t) => { const e = ease.io(clamp(kc, 0, 1)); sun.scale.setScalar(Math.max(.001, 1 - ease.in(clamp(kc * 1.4, 0, 1)))); sun.visible = kc < .72; rays.visible = kc < .8; rays.rotation.z = t * .2; rays.scale.setScalar(1 + .1 * Math.sin(t * 2)); sg.material.opacity = .8 - .35 * e;
    clk.group.visible = kc > .25; const s = backOut(clamp((kc - .25) / .75, 0, 1)); clk.group.scale.setScalar(Math.max(.001, s)); clk.group.rotation.y = (1 - clamp((kc - .25) / .75, 0, 1)) * Math.PI * .8; clk.setTime(7200 + t * 1800 * ease.sm(clamp(kc, 0, 1)), Math.floor(t * 3) * Math.PI / 30);
    orbit.material.opacity = .5 * clamp(kr, 0, 1); ring.rotation.z = t * .12;
    balls.forEach((m, i) => { const k = clamp(kr * 1.8 - i / N * .8, 0, 1), e2 = ease.out(k), a = i / N * Math.PI * 2; m.visible = k > 0; const r = 2.6 * e2; m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); m.scale.setScalar(Math.max(.01, e2)); }); };
  R.set(0, 0, 0); return R;
}

// ---------------------------------------------------------------- many clocks orbit the sun like pupils around their teacher
export function clockOrbit(Wd, o) {
  o = o || {}; const N = o.n || 15, R = { clocks: [] }, g = O.grp(Wd, { pos: [0, 1.6, 0] }), r = rng(88);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 20), O.basic(0xffd23a)); g.add(sun); g.add(O.glow(8, 0xffc060, .8)); const rays = new THREE.Group(); g.add(rays); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = new THREE.Mesh(new THREE.BoxGeometry(.08, .45, .02), O.basic(0xffe49a)); rr.position.set(Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0); rr.rotation.z = a - Math.PI / 2; rays.add(rr); } R.sun = sun; R.rays = rays;
  for (let i = 0; i < N; i++) { const hold = new THREE.Group(), c = O.wallClock(Wd, { r: .34 }); c.group.parent && c.group.parent.remove(c.group); hold.add(c.group); g.add(hold); R.clocks.push({ hold, c, i, rad: 3.4 + (i % 3) * .55, tilt: (r() - .5) * .5, ph: r() * 6.28, S0: Math.floor(r() * 12) * 3600 + Math.floor(r() * 60) * 60 }); }
  R.set = (t, k) => { rays.rotation.z = t * .15; R.clocks.forEach(o2 => { const a = o2.i / N * Math.PI * 2 + t * (.22 - (o2.i % 3) * .03), x = Math.cos(a) * o2.rad * ease.out(clamp(k, 0, 1)), z = Math.sin(a) * o2.rad * .45 * ease.out(clamp(k, 0, 1)); o2.hold.position.set(x, o2.tilt + Math.sin(t * .5 + o2.ph) * .12, z); o2.hold.lookAt(x * 2, o2.hold.position.y, z * 2); o2.hold.scale.setScalar(Math.max(.01, ease.out(clamp(k * 1.5 - o2.i / N * .5, 0, 1)))); o2.c.setTime(o2.S0 + t * 600, Math.floor(t * 2 + o2.i) * Math.PI / 30); }); };
  R.set(0, 1); return R;
}

// ---------------------------------------------------------------- the year counter (live digits) and a timeline road with a tick every 100 years
export function yearCounter() {
  const P = livePlane(2.6, .95, 640, 234); const c = P.c; let last = '';
  P.set = (v, target) => { const s = String(Math.floor(v)).padStart(4, '0'), key = s + '|' + Math.round((v % 1) * 12); if (key === last) return; last = key; c.clearRect(0, 0, 640, 234);
    const bg = c.createLinearGradient(0, 0, 0, 234); bg.addColorStop(0, 'rgba(14,22,60,.92)'); bg.addColorStop(1, 'rgba(8,12,36,.92)'); c.fillStyle = bg; c.beginPath(); c.roundRect(6, 6, 628, 222, 34); c.fill(); c.strokeStyle = '#ffc84a'; c.lineWidth = 7; c.stroke();
    c.font = '900 168px Heebo, Assistant, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'ltr'; c.shadowColor = 'rgba(255,190,60,.9)'; c.shadowBlur = 26; const done = v >= target - .5;
    for (let i = 0; i < 4; i++) { const x = 105 + i * 143; c.save(); c.beginPath(); c.rect(x - 70, 20, 140, 194); c.clip(); const fr = i === 3 ? (v % 1) : 0; c.fillStyle = done ? '#fff3b0' : '#ffd870'; c.fillText(s[i], x, 124 - fr * 0, 140); c.restore(); }
    P.touch(); }; return P;
}
export function yearRoad(Wd, o) {
  o = o || {}; const g = O.grp(Wd), L = o.len || 160; g.add(box(3.2, .06, L, 0x2a3260, { pos: [0, -.03, -L / 2 + 5], inkW: .01 }));
  for (let i = 0; i < 58; i++) { const z = 4 - i * 2.6, big = i % 5 === 0; g.add(box(big ? 3.4 : 2.4, .08, .12, big ? 0xffc84a : 0x7a88c8, { pos: [0, .01, z], ink: false })); if (big) { const gl = O.glow(1.2, 0xffc060, .6); gl.position.set(0, .4, z); g.add(gl); g.add(cyl(.05, .05, .6, 0xffc84a, { pos: [1.8, .3, z], inkW: .005 })); g.add(cyl(.05, .05, .6, 0xffc84a, { pos: [-1.8, .3, z], inkW: .005 })); } }
  return g;
}

// ---------------------------------------------------------------- tiny helpers shared by c2 / c3
export const flatSky = (Wd, c0, c1, c2, stars) => O.skyDome(Wd, { top: c0, mid: c1, bot: c2, stars: stars === undefined ? 0 : stars });
// sky + sun cycle for the Jerusalem hills (u: 0 bright day, .38 sun at the hills, .62 twilight, 1 night)
export function cityCycle(Wd, o) {
  o = o || {}; const sky = O.skyDome(Wd, {}), col = k => new THREE.Color(k);
  O.lighting(Wd, { key: [0xffe0b0, 1.5, [14, 30, -22]], hemi: [0xbcd0f0, 0x4a3a30, 1.0], rim: [0x6f8cff, .5, [-25, 30, -50]], target: [0, 4, -30], shadowExt: 75, shadowMap: 2048, fog: [0xd9a080, 45, 300] });
  O.hills(Wd, { colors: [0x24384a, 0x2c4650, 0x1f3040], list: [[-30, -118, 30, 15, 22], [38, -118, 34, 17, 24], [-78, -112, 28, 12, 18], [90, -112, 30, 13, 20], [-10, -170, 70, 22, 30], [60, -170, 60, 20, 30]] });
  const C = O.city(Wd, { seed: 29, n: 56, litFrac: .22, area: [-58, 58, -12, -62], slope: .05, cypress: 6 }), SX = o.sunX === undefined ? 7 : o.sunX;
  const sun = new THREE.Mesh(new THREE.SphereGeometry(o.sunR || 6, 28, 16), O.basic(0xffe9a0)); Wd.add(sun); const sg = O.glow(90, 0xffc070, 0), sg2 = O.glow(240, 0xffa860, 0); Wd.add(sg); Wd.add(sg2);
  const keys = [[0, 0x5a90d8, 0xbcd8f0, 0xfbe6c0], [.3, 0x4a78c8, 0xf0a870, 0xffd08a], [.42, 0x3a4a98, 0xe8884e, 0xffa060], [.62, 0x1a2a64, 0x5a4a88, 0xe88a5a], [1, 0x050a22, 0x142458, 0x4c4a78]];
  const skyAt = u => { let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++; const k = clamp((u - keys[i][0]) / (keys[i + 1][0] - keys[i][0]), 0, 1), e = ease.sm(k); return [1, 2, 3].map(j => col(keys[i][j]).lerp(col(keys[i + 1][j]), e)); };
  const keyD = col(0xfff0d8), keyS = col(0xff9a60), keyN = col(0x9db8ff), fogD = col(0xc8d8e8), fogS = col(0xd9a080), fogN = col(0x1b2850), axis = new THREE.Vector3(.26, .93, -.26).normalize();
  const api = { sky, C, sun, SX, apply(u) {
    const [top, mid, bot] = skyAt(u); sky.uni.top.value.copy(top); sky.uni.mid.value.copy(mid); sky.uni.bot.value.copy(bot); sky.starU.uA.value = ease.sm(prog(u, .5, .9)); sky.stars.quaternion.setFromAxisAngle(axis, u * 1.2);
    const sy = lerp(40, 19.6, ease.sm(prog(u, .0, .42))); const below = ease.sm(prog(u, .42, .56)); const y = lerp(sy, -12, below); sun.position.set(SX, y, -150); sg.position.copy(sun.position); sg2.position.copy(sun.position);
    sg.material.opacity = .8 * (1 - ease.sm(prog(u, .5, .6))) * ease.sm(prog(u, .0, .3) + .3); sg2.material.opacity = .45 * (1 - ease.sm(prog(u, .5, .62))); sun.visible = y > -11; sun.material.color.setHex(0xffe9a0).lerp(col(0xffa860), ease.sm(prog(u, .2, .5)));
    const kc = u < .42 ? keyD.clone().lerp(keyS, ease.sm(prog(u, .2, .42))) : keyS.clone().lerp(keyN, ease.sm(prog(u, .5, .75))); Wd.sun.color.copy(kc); Wd.sun.intensity = lerp(1.7, .35, ease.sm(prog(u, .3, .75))); Wd.sun.position.set(lerp(30, -30, ease.sm(prog(u, .2, .8))), lerp(28, 40, prog(u, .3, .8)), -22);
    Wd.hemi.color.copy(col(0xbfd4f0).lerp(col(0x4a5c92), ease.sm(prog(u, .4, .9)))); Wd.hemi.intensity = lerp(1.1, .9, ease.sm(prog(u, .3, .9)));
    Wd.scene.fog.color.copy(fogD.clone().lerp(fogS, ease.sm(prog(u, .1, .4))).lerp(fogN, ease.sm(prog(u, .5, .85))));
    C.winMat.color.set(0x39404a).lerp(col(0xffd488), ease.sm(prog(u, .4, .75))); C.glows.forEach(gl => { gl.material.opacity = .55 * ease.sm(prog(u, .4, .75)); }); } };
  return api;
}
