// props.js - reusable animated 3D props for episode-specific stories (lobby-halacha template v3).
// Everything is a function of time set by the caller (api.set(...) inside the scene's Wd.on / per-frame function): deterministic, no Math.random / Date.
// Boys only. No open flame is ever held by a person: candles light "by themselves" (flame scale driven by time).
import { THREE, box, cyl, ball, toon, ink, canvasTex, cloud, clamp, lerp, ease, prog, rng } from '../../_studio-animatzia/lib/stage3d.js';
import { POSES } from '../../_studio-animatzia/lib/figure3d.js';
import { FONT, glowTex, glowSprite, bm, cine, fitText, planksTex, booksTex, windowUnit, chair, mkWorld } from './scenes.js';
const PI = Math.PI;

// extra gestures for the figure (registered into the shared POSES table; the engine file itself is not modified)
Object.assign(POSES, {
  mouth: { armB: [-.75, 0, .12], foreB: [-2.55, -.45, 0], head: [.04, 0, 0] },          // hand over the mouth
  lean: { chest: [.3, 0, 0], hips: [.06, 0, 0], head: [-.14, 0, 0] },                     // leaning in to listen / whisper
  headdown: { head: [.45, 0, 0], chest: [.16, 0, 0] },                                     // sad / ashamed
  catchp: { armA: [-.95, 0, -.25], armB: [-.95, 0, .25], foreA: [-.5, .3, 0], foreB: [-.5, -.3, 0] },
  throwp: { armB: [-2.3, 0, .15], foreB: [-.35, 0, 0], chest: [-.1, 0, 0] },
  cheer: { armA: [0, 0, -2.6], armB: [0, 0, 2.6], foreA: [0, 0, -.3], foreB: [0, 0, .3] },
  bothup: { armA: [-1.6, 0, -.3], armB: [-1.6, 0, .3], foreA: [-.4, 0, 0], foreB: [-.4, 0, 0] },
});

// ---------------------------------------------------------------- small helpers
export const popE = k => { if (k <= 0) return 0; if (k >= 1) return 1; const c1 = 2.4, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };   // overshoot "pop"
export const sm = ease.sm;
export const bill = (Wd, o) => { Wd.on((t, cam) => { o.quaternion.copy(cam.quaternion); }); return o; };
export function texPlane(w, h, draw, o) {
  o = o || {}; const cw = o.cw || 512, tex = canvasTex(cw, Math.max(8, Math.round(cw * h / w)), draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: o.opaque ? false : true, side: THREE.DoubleSide, depthWrite: !!o.depthWrite, fog: false, toneMapped: false, color: o.color === undefined ? 0xffffff : o.color }));
  m.renderOrder = o.ro === undefined ? 6 : o.ro; return m;
}
const tint = (sp, c) => { sp.material.color.set(c); return sp; };
export function glowAt(g, w, color, op) { const s = tint(glowSprite(w, w, op === undefined ? .6 : op), color || 0xffd27a); g.add(s); return s; }
export function lerpV(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
export function arcPt(a, b, u, lift) { const p = lerpV(a, b, u); p[1] += Math.sin(PI * u) * lift; return p; }
// camera: add shake on top of a camera function; events [[t0, amplitude, duration], ...]
export function shakeCam(camFn, events) {
  return t => { const c = camFn(t); let a = 0; for (const [t0, amp, d] of events) { const k = (t - t0) / d; if (k >= 0 && k < 1) a += amp * (1 - k) * Math.sin(t * 90); }
    if (!a) return c; return { pos: [c.pos[0] + a * .6, c.pos[1] + a, c.pos[2]], look: c.look, fov: c.fov }; };
}
// lighting animated by time: fn(t) -> {hemi, sun, hemiColor, sunColor, sky:[top,bot], fog}
export function lighting(Wd, fn) {
  const c1 = new THREE.Color(), c2 = new THREE.Color();
  Wd.on(t => { const L = fn(t); if (L.hemi !== undefined) Wd.hemi.intensity = L.hemi; if (L.sun !== undefined) Wd.sun.intensity = L.sun;
    if (L.hemiColor !== undefined) Wd.hemi.color.set(L.hemiColor); if (L.hemiGround !== undefined) Wd.hemi.groundColor.set(L.hemiGround); if (L.sunColor !== undefined) Wd.sun.color.set(L.sunColor);
    if (L.sky) { Wd.sky.material.uniforms.top.value.set(L.sky[0]); Wd.sky.material.uniforms.bot.value.set(L.sky[1]); if (Wd.scene.fog) Wd.scene.fog.color.set(L.fog !== undefined ? L.fog : L.sky[1]); } });
}

// ---------------------------------------------------------------- speech bubble that inflates and flies
export function bubble(Wd, o) {
  const w = o.w || 1.4, h = o.h || 1.0, cw = 768, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
  const draw = (c, W, H) => { const x0 = W * .04, y0 = H * .04, bw = W * .92, bh = H * .74, R = bh * .42, left = o.tail !== 'br';
    const body = () => { c.beginPath(); c.roundRect(x0, y0, bw, bh, R); c.moveTo(left ? W * .2 : W * .8, H * .74); c.lineTo(left ? W * .1 : W * .9, H * .98); c.lineTo(left ? W * .4 : W * .6, H * .74); c.closePath(); };
    c.lineJoin = 'round'; body(); c.fillStyle = o.fill || '#ffffff'; c.fill(); c.lineWidth = W * .02; c.strokeStyle = o.stroke || '#1c2745'; c.stroke();
    c.beginPath(); c.roundRect(x0 + W * .035, y0 + W * .03, bw * .5, bh * .16, R * .3); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, o.text || '', { maxW: bw * .84, maxLines: 2, max: H * .56, min: H * .18, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = o.color || '#c4161c'; c.lineJoin = 'round';
    if (o.textStroke !== false) { c.strokeStyle = o.textStroke || '#ffffff'; c.lineWidth = f.size * .08; }
    const lh = f.size * 1.1, yy = y0 + bh / 2 - (f.lines.length - 1) * lh / 2 + f.size * .03; f.lines.forEach((l, i) => { if (o.textStroke !== false) c.strokeText(l, W / 2, yy + i * lh); c.fillText(l, W / 2, yy + i * lh); }); };
  const face = texPlane(w, h, draw, { cw, ro: 8 }); inner.add(face);
  const back = [];
  for (let i = 1; i <= 3; i++) { const b = texPlane(w, h, draw, { cw: 256, ro: 7, color: 0x6a5a7a }); b.position.z = -i * .035; inner.add(b); back.push(b); }
  const glow = tint(glowSprite(w * 2.2, h * 2.4, .0), o.glow || 0xffd27a); glow.position.z = -.12; inner.add(glow);
  bill(Wd, g);
  const api = { g, set(pos, s, a, rz) { const on = s > .01 && (a === undefined || a > .01); g.visible = on; if (!on) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0;
      const al = a === undefined ? 1 : a; face.material.opacity = al; back.forEach(b => b.material.opacity = al * .8); glow.material.opacity = (o.glowAmt === undefined ? .55 : o.glowAmt) * al; } };
  return api;
}

// ---------------------------------------------------------------- stamp that slams + the ink imprint
export function stamp(Wd, o) {
  const g = new THREE.Group(); g.visible = false; Wd.add(g); const col = o.color || 0xc4161c;
  g.add(cyl(.16, .2, 1.0, 0x6b3a1c, { pos: [0, 1.15, 0] })); g.add(ball(.3, 0xb0703a, { pos: [0, 1.75, 0] })); g.add(box(1.7, .3, 1.1, col, { pos: [0, .25, 0] })); g.add(box(1.5, .1, .95, 0x2a1a14, { pos: [0, .05, 0], ink: false }));
  const f = !o.faceText ? new THREE.Group() : texPlane(1.6, .26, (c, W, H) => { c.fillStyle = '#fff'; c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${H * .78}px ${FONT}`; c.fillText(o.text || '', W / 2, H * .55); }, { cw: 512, ro: 3, depthWrite: false }); f.position.set(0, .25, .56); g.add(f);
  return { g, set(pos, rz, on) { g.visible = on !== false; g.position.set(pos[0], pos[1], pos[2]); g.rotation.z = rz || 0; } };
}
export function imprint(Wd, o) {   // ink imprint of a stamp: ringed word; faces the camera
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
  const w = o.w || 1.5, h = o.h || .8, hex = o.color || '#c4161c';
  const m = texPlane(w, h, (c, W, H) => { if (o.bg) { c.fillStyle = o.bg; c.beginPath(); c.roundRect(H * .08, H * .08, W - H * .16, H - H * .16, H * .2); c.fill(); } c.strokeStyle = hex; c.fillStyle = hex; c.lineWidth = H * .07; c.beginPath(); c.roundRect(H * .08, H * .08, W - H * .16, H - H * .16, H * .2); c.stroke();
    c.lineWidth = H * .025; c.beginPath(); c.roundRect(H * .17, H * .17, W - H * .34, H - H * .34, H * .13); c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, o.text || '', { maxW: W * .72, maxLines: 1, max: H * .56, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillText(f.lines[0] || '', W / 2, H * .53); }, { cw: 640, ro: 9 });
  m.rotation.z = o.rot === undefined ? .14 : o.rot; inner.add(m); bill(Wd, g);
  return { g, set(pos, s, a) { g.visible = s > .01 && (a === undefined || a > .01); if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); m.material.opacity = a === undefined ? 1 : a; } };
}
export function shock(Wd, color) {   // expanding ring (impact)
  const m = new THREE.Mesh(new THREE.RingGeometry(.9, 1.0, 48), new THREE.MeshBasicMaterial({ color: color || 0xffe9a8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })); m.visible = false; m.renderOrder = 10;
  const g = new THREE.Group(); g.add(m); Wd.add(g); bill(Wd, g);
  return { g, set(pos, k, size) { m.visible = k > 0 && k < 1; if (!m.visible) return; g.position.set(pos[0], pos[1], pos[2]); m.scale.setScalar(.2 + (size || 2) * ease.out(k)); m.material.opacity = (1 - k) * .9; } };
}

// ---------------------------------------------------------------- big 3D check / cross
export function mark3d(Wd, kind, size) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
  const ok = kind === 'check', col = ok ? 0x2fbf5b : 0xe03131, em = new THREE.Color(col).multiplyScalar(.35);
  const bar = (len, a, cx, cy) => { const b = box(len, .24, .24, col, { pos: [cx, cy, 0], rot: [0, 0, a] }); b.material.emissive = em; return b; };
  const dot = (x, y) => { const b = ball(.12, col, { pos: [x, y, 0] }); b.material.emissive = em; return b; };
  if (ok) { inner.add(bar(.5, -.85, -.28, -.14)); inner.add(bar(1.0, .857, .18, .07)); inner.add(dot(-.42, .02)); inner.add(dot(-.14, -.3)); inner.add(dot(.5, .44)); }
  else { inner.add(bar(1.1, PI / 4, 0, 0)); inner.add(bar(1.1, -PI / 4, 0, 0)); [[-.39, -.39], [.39, .39], [-.39, .39], [.39, -.39]].forEach(p => inner.add(dot(p[0], p[1]))); }
  const gl = tint(glowSprite(2.6, 2.6, .5), ok ? 0x6dff9a : 0xff5a5a); gl.position.z = -.3; inner.add(gl); bill(Wd, g);
  return { g, set(pos, s, wob) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s * (size || 1)); inner.rotation.z = (wob || 0); } };
}

// ---------------------------------------------------------------- floating clock (hours float, e.g. 6.5)
export function clock(Wd, o) {
  const r = (o && o.r) || .8, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
  const disc = cyl(r, r, .14, 0xfff6e4, { rot: [PI / 2, 0, 0] }); inner.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, .07, 14, 48), toon(0xd9a63a)); rim.castShadow = true; ink(rim, .02); inner.add(rim);
  const face = texPlane(r * 1.9, r * 1.9, (c, W, H) => { c.translate(W / 2, H / 2); for (let i = 0; i < 12; i++) { c.save(); c.rotate(i * PI / 6); c.fillStyle = i % 3 === 0 ? '#1c2745' : '#6a6f86'; c.fillRect(-W * .012, -H * .46, W * .024, i % 3 === 0 ? H * .1 : H * .06); c.restore(); } }, { cw: 512, ro: 3 }); face.position.z = .075; inner.add(face);
  const mk = (len, wd, col) => { const p = new THREE.Group(); p.position.z = .1; const b = box(wd, len, .03, col, { pos: [0, len / 2 - len * .12, 0], ink: false }); p.add(b); inner.add(p); return p; };
  const hp = mk(r * .55, .075, 0x1c2745), mp = mk(r * .8, .05, 0xc4161c); inner.add(ball(.06, 0x1c2745, { pos: [0, 0, .11], ink: false }));
  bill(Wd, g);
  return { g, set(pos, s, hours, a) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); hp.rotation.z = -(hours % 12) / 12 * 2 * PI; mp.rotation.z = -(hours % 1) * 2 * PI; } };
}

// ---------------------------------------------------------------- candle with holder, burning flame, melting length, warm light
export function candle(Wd, o) {
  const p = o.pos, h = o.h || .26, r = o.r || .022, g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
  let cupTop = 0;
  if (o.holder !== false) { const hc = o.holderColor || 0xd8dde6; g.add(cyl(.09, .12, .04, hc, { pos: [0, .02, 0] })); g.add(cyl(.022, .035, .2, hc, { pos: [0, .14, 0] })); g.add(cyl(.065, .035, .06, hc, { pos: [0, .26, 0] })); cupTop = .29; }
  const bodyG = new THREE.Group(); bodyG.position.y = cupTop; g.add(bodyG); bodyG.add(cyl(r, r * 1.05, h, o.color || 0xfff4d8, { pos: [0, h / 2, 0] }));
  const flameG = new THREE.Group(); g.add(flameG);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(r * 1.5, r * 6, 12), bm(0xffa21f)); fl.position.y = r * 3; flameG.add(fl);
  const core = new THREE.Mesh(new THREE.SphereGeometry(r * 1.0, 12, 10), bm(0xfff6c4)); core.position.y = r * 1.4; flameG.add(core);
  const gl = glowSprite(.7 * (o.glowSize || 1), .7 * (o.glowSize || 1), .8); gl.position.y = r * 3; flameG.add(gl);
  let light = null; if (o.light) { light = new THREE.PointLight(o.light.color || 0xffc27a, 0, o.light.dist || 6); flameG.add(light); light.position.y = r * 4; }
  const FS = o.fs || 1;
  const api = { g, tip: () => { const q = new THREE.Vector3(); flameG.getWorldPosition(q); return [q.x, q.y + r * 3, q.z]; } };
  Wd.on(t => { if (o.appear) { const ap = o.appear(t); g.visible = ap > .01; g.scale.setScalar(Math.max(.01, popE(ap))); }
    const f = o.flame ? o.flame(t) : 1, L = o.len ? o.len(t) : 1, on = f > .01;
    bodyG.scale.y = Math.max(.001, L); bodyG.visible = L > .02; flameG.position.y = cupTop + h * L + .005; flameG.visible = on;
    const fk = f * (1 + .1 * Math.sin(t * 11 + p[0] * 7) + .06 * Math.sin(t * 19 + p[2] * 5)); flameG.scale.set(fk * (1 + .05 * Math.sin(t * 13)) * FS, Math.max(.001, fk) * FS, fk * FS);
    gl.material.opacity = .75 * clamp(f, 0, 1) * (.9 + .1 * Math.sin(t * 8 + p[0])); if (light) light.intensity = o.light.i * clamp(f, 0, 1) * (.92 + .08 * Math.sin(t * 9 + p[0] * 3)); });
  return api;
}

// ---------------------------------------------------------------- signs / doors / book / paper / cloud
export function board(Wd, o) {   // generic sign board: front canvas, frame, optional posts. returns {g, set(pos, s)}
  const w = o.w, h = o.h, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
  inner.add(box(w + .16, h + .16, .12, o.frame || 0x6b3a1c, { pos: [0, 0, -.07] }));
  const f = texPlane(w, h, o.draw, { cw: o.cw || 768, opaque: true, ro: 2, depthWrite: true }); f.position.z = .0; inner.add(f);
  if (o.posts) for (const sx of [-1, 1]) inner.add(box(.14, o.posts, .14, 0x6b3a1c, { pos: [sx * (w / 2 - .1), -h / 2 - o.posts / 2, -.07] }));
  if (o.glow) { const gl = tint(glowSprite(w * 1.8, h * 2, .45), o.glow); gl.position.z = -.3; inner.add(gl); }
  return { g, inner, set(pos, s, ry) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); g.rotation.y = ry || 0; } };
}
export function drawWord(text, bg, fg, border) {
  return (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = border || fg; c.lineWidth = H * .04; c.strokeRect(H * .06, H * .06, W - H * .12, H - H * .12);
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; const f = fitText(c, text, { maxW: W * .8, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 }); c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54); };
}
export function flamePath(c, cx, cy, s) {   // canvas flame (teardrop)
  c.beginPath(); c.moveTo(cx, cy - s * .62); c.bezierCurveTo(cx + s * .55, cy - s * .1, cx + s * .5, cy + s * .55, cx, cy + s * .55); c.bezierCurveTo(cx - s * .5, cy + s * .55, cx - s * .55, cy - s * .1, cx, cy - s * .62); c.closePath();
}
export function drawNoFlame(c, W, H) {
  c.fillStyle = '#fffaf0'; c.fillRect(0, 0, W, H); c.strokeStyle = '#6b3a1c'; c.lineWidth = H * .03; c.strokeRect(H * .04, H * .04, W - H * .08, H - H * .08);
  const cx = W / 2, cy = H / 2, s = H * .62; flamePath(c, cx, cy, s); c.fillStyle = '#ff9a1f'; c.fill(); c.lineWidth = s * .05; c.strokeStyle = '#8a3a00'; c.stroke();
  flamePath(c, cx, cy + s * .14, s * .5); c.fillStyle = '#ffe27a'; c.fill();
  c.strokeStyle = '#e03131'; c.lineWidth = s * .12; c.beginPath(); c.arc(cx, cy, s * .78, 0, 7); c.stroke(); c.beginPath(); c.moveTo(cx - s * .55, cy - s * .55); c.lineTo(cx + s * .55, cy + s * .55); c.stroke();
}
export function door(Wd, o) {   // o: {label, ok}; set(pos, openK, s)
  const g = new THREE.Group(); Wd.add(g); g.visible = false; const ok = !!o.ok, W = 1.5, H = 2.5;
  for (const sx of [-1, 1]) g.add(box(.14, H, .24, 0x6b3a1c, { pos: [sx * (W / 2 + .07), H / 2, 0] })); g.add(box(W + .28, .16, .24, 0x6b3a1c, { pos: [0, H + .08, 0] }));
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(W, H), bm(0xffffff, { map: canvasTex(64, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); if (ok) { gr.addColorStop(0, '#fff2b8'); gr.addColorStop(1, '#ffb347'); } else { gr.addColorStop(0, '#22222a'); gr.addColorStop(1, '#0e0e12'); } c.fillStyle = gr; c.fillRect(0, 0, w, h); }) })); inside.position.set(0, H / 2, -.1); g.add(inside);
  const hinge = new THREE.Group(); hinge.position.set(-W / 2, 0, .05); g.add(hinge); const panel = box(W, H, .1, ok ? 0xc98a4a : 0x8a4a3a, { pos: [W / 2, H / 2, 0] }); hinge.add(panel);
  hinge.add(box(W * .78, H * .38, .03, ok ? 0xd9a05f : 0x9a5a48, { pos: [W / 2, H * .72, .06], ink: false })); hinge.add(box(W * .78, H * .38, .03, ok ? 0xd9a05f : 0x9a5a48, { pos: [W / 2, H * .28, .06], ink: false })); hinge.add(ball(.07, 0xd9a63a, { pos: [W - .18, H * .45, .1] }));
  const sg = board(Wd, { w: 1.7, h: .62, draw: drawWord(o.label || '', ok ? '#eaffef' : '#ffecec', ok ? '#14612f' : '#9a1c1c'), cw: 640, frame: 0x4a2a14 }); g.add(sg.g); sg.set([0, H + .75, .1], 1, 0); sg.g.position.set(0, H + .75, .1);
  // sg.g was added to the scene by board(); re-parent to this door group
  return { g, set(pos, openK, s) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); g.scale.setScalar(s); hinge.rotation.y = -ease.sm(clamp(openK, 0, 1)) * 1.9; } };
}
export function openBook(Wd, o) {   // open sefer with a glowing verse on the right page. faces +z
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
  const pw = 1.9, ph = 2.5, r = rng(11);
  const page = (verse) => texPlane(pw, ph, (c, W, H) => { c.fillStyle = verse ? '#fff7dc' : '#f3e6c2'; c.fillRect(0, 0, W, H); c.strokeStyle = '#a9803a'; c.lineWidth = 6; c.strokeRect(W * .06, H * .05, W * .88, H * .9);
    if (!verse) { c.fillStyle = '#6a5030'; for (let i = 0; i < 17; i++) { let x = W * .9; const y = H * (.1 + i * .048); while (x > W * .12) { const l = 14 + r() * 34; c.fillRect(x - l, y, l, 7); x -= l + 9; } } }
    else { c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#3b2410'; const f = fitText(c, o.text || '', { maxW: W * .72, maxLines: 4, max: H * .15, min: H * .08, lh: 1.25 }); c.font = `700 ${f.size}px ${FONT}`; const lh = f.size * 1.25, y0 = H * .5 - (f.lines.length - 1) * lh / 2; f.lines.forEach((l, i) => c.fillText(l, W / 2, y0 + i * lh)); } }, { cw: 640, opaque: true, ro: 2, depthWrite: true });
  const L = page(false), R = page(true); L.position.set(-pw / 2 - .16, 0, .02); L.rotation.y = .22; R.position.set(pw / 2 + .16, 0, .02); R.rotation.y = -.22; inner.add(L); inner.add(R);
  inner.add(box(pw * 2 + .7, ph + .3, .16, 0x5a2e16, { pos: [0, 0, -.5] })); inner.add(box(.1, ph + .3, .1, 0x3a1c0c, { pos: [0, 0, -.32], ink: false }));
  const gl = tint(glowSprite(pw * 3.6, ph * 1.5, .7), 0xffd27a); gl.position.z = -.4; inner.add(gl);
  const gl2 = tint(glowSprite(pw * 1.6, ph * 1.0, .0), 0xfff0b0); gl2.position.set(pw / 2, 0, .2); inner.add(gl2);
  return { g, inner, glow2: gl2, set(pos, s, glowK) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); gl2.material.opacity = (glowK || 0) * .6; } };
}
export function testPaper(Wd, text) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); Wd.add(g);
  const f = texPlane(1.3, 1.7, (c, W, H) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); c.strokeStyle = '#c5cbe0'; c.lineWidth = 3; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(W * .1, H * (.4 + i * .045)); c.lineTo(W * .9, H * (.4 + i * .045)); c.stroke(); }
    c.fillStyle = '#2a3b7a'; for (let i = 0; i < 4; i++) c.fillRect(W * .12, H * (.08 + i * .04), W * (.5 - i * .06), H * .015);
    c.strokeStyle = '#d6141c'; c.lineWidth = W * .035; c.beginPath(); c.arc(W * .6, H * .24, W * .24, 0, 7); c.stroke(); c.fillStyle = '#d6141c'; c.font = `700 ${W * .33}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text || '55', W * .6, H * .255); }, { cw: 512, opaque: true, ro: 2, depthWrite: true });
  inner.add(f); inner.add(box(1.38, 1.78, .04, 0xdadada, { pos: [0, 0, -.03], ink: false })); const gl = tint(glowSprite(3, 3, .35), 0xff6a6a); gl.position.z = -.3; inner.add(gl);
  return { g, inner, set(pos, s, ry) { g.visible = s > .01; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); g.rotation.y = ry || 0; } };
}
export function greyCloud(Wd, o) {
  const c = cloud({ seed: (o && o.seed) || 4, size: (o && o.size) || 1.1, puffs: 6, color: 0x7d838e, inkColor: 0x3a3f48 }); c.visible = false; Wd.add(c);
  return { g: c, set(pos, s, rise) { c.visible = s > .01; if (!c.visible) return; c.position.set(pos[0], pos[1], pos[2]); c.scale.setScalar(s); } };
}

// ---------------------------------------------------------------- matchbox + match
export function matchbox(Wd, pos) {
  const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); Wd.add(g);
  const lab = canvasTex(256, 160, (c, W, H) => { c.fillStyle = '#c4161c'; c.fillRect(0, 0, W, H); c.fillStyle = '#ffe9a8'; c.fillRect(W * .08, H * .12, W * .84, H * .76); flamePath(c, W / 2, H / 2, H * .62); c.fillStyle = '#e03a1f'; c.fill(); c.strokeStyle = '#7a1c0c'; c.lineWidth = 6; c.stroke(); });
  const tray = box(.5, .07, .27, 0xd9b36a, { pos: [0, .045, 0] }); g.add(tray);
  const sleeve = new THREE.Mesh(new THREE.BoxGeometry(.4, .1, .29), [toon(0xc4161c), toon(0xc4161c), toon(0xffffff, { map: lab }), toon(0xc4161c), toon(0xc4161c), toon(0xc4161c)]); sleeve.position.set(-.04, .055, 0); sleeve.castShadow = true; ink(sleeve, .01); g.add(sleeve);
  const sticks = new THREE.Group(); tray.add(sticks); for (let i = 0; i < 5; i++) { sticks.add(cyl(.007, .007, .2, 0xe6c88a, { pos: [-.1 + i * .005, .05, -.09 + i * .045], rot: [0, 0, PI / 2], ink: false })); sticks.add(ball(.014, 0xc4161c, { pos: [.0 + i * .005, .05, -.09 + i * .045], ink: false })); }
  return { g, open(k) { tray.position.x = .22 * ease.sm(clamp(k, 0, 1)); sleeve.position.x = -.04; } };
}
export function matchStick(Wd) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
  inner.add(cyl(.011, .011, .26, 0xe6c88a, { pos: [0, .13, 0] })); const head = ball(.026, 0xc4161c, { pos: [0, .275, 0] }); inner.add(head);
  const spark = tint(glowSprite(.45, .45, 0), 0xffa030); spark.position.y = .3; inner.add(spark);
  return { g, inner, set(pos, rz, s, sparkK) { g.visible = (s === undefined ? 1 : s) > .01; g.position.set(pos[0], pos[1], pos[2]); inner.rotation.z = rz || 0; inner.scale.setScalar(s === undefined ? 1 : s); spark.material.opacity = sparkK || 0; spark.scale.setScalar(.25 + (sparkK || 0) * .7); } };
}

// ---------------------------------------------------------------- flame jump arc, relay dots
export function flameArc(Wd, n) {
  n = n || 26; const sp = [], lead = tint(glowSprite(.8, .8, .0), 0xffb43a); Wd.add(lead);
  for (let i = 0; i < n; i++) { const s = tint(glowSprite(.3, .3, 0), 0xffc44a); s.renderOrder = 11; Wd.add(s); sp.push(s); }
  return { set(a, b, u, lift, fade) { const f = fade === undefined ? 1 : fade;
      sp.forEach((s, i) => { const q = (i / (n - 1)) * u, on = u > 0 && f > .01; s.material.opacity = on ? .85 * f : 0; if (!on) return; const p = arcPt(a, b, q, lift); s.position.set(p[0], p[1], p[2]); const k = .22 + .2 * (i / n); s.scale.set(k, k, 1); });
      lead.material.opacity = u > 0 && u < 1.0 ? 1 : 0; const p = arcPt(a, b, clamp(u, 0, 1), lift); lead.position.set(p[0], p[1], p[2]); lead.scale.set(.6, .6, 1); } };
}
export function dotPath(Wd, pts, o) {
  o = o || {}; const step = o.step || .32, dots = []; let acc = 0, total = 0; const seg = [];
  for (let i = 0; i < pts.length - 1; i++) { const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1], pts[i + 1][2] - pts[i][2]); seg.push(L); total += L; }
  for (let d = 0; d <= total; d += step) { let i = 0, rem = d; while (i < seg.length - 1 && rem > seg[i]) { rem -= seg[i]; i++; } const u = clamp(rem / seg[i], 0, 1); const p = lerpV(pts[i], pts[i + 1], u);
    const b = ball(o.r || .07, o.color || 0xffd166, { pos: p, ink: false }); b.material = new THREE.MeshBasicMaterial({ color: o.color || 0xffd166, fog: false }); b.visible = false; Wd.add(b); dots.push(b); }
  return { n: dots.length, set(u, t) { dots.forEach((b, i) => { const k = ease.out(clamp(u * (dots.length + 3) - i, 0, 1)); b.visible = k > .02; b.scale.setScalar(k * (1 + .35 * Math.max(0, Math.sin(t * 6 - i * .7)))); }); } };
}

// ---------------------------------------------------------------- rooms: classroom + dining table
export function classRoom(Wd) {
  const HX = 8, HZ = 6, H = 4;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2 * HX, 2 * HZ), toon(0xffffff, { map: planksTex([8, 6]) })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; Wd.add(fl);
  const wallC = 0xf6ecd2;
  Wd.add(box(2 * HX, H, .4, wallC, { pos: [0, H / 2, -HZ - .2], ink: false })); Wd.add(box(2 * HX, H, .4, wallC, { pos: [0, H / 2, HZ + .2], ink: false }));
  for (const sx of [-1, 1]) Wd.add(box(.4, H, 2 * HZ, wallC, { pos: [sx * (HX + .2), H / 2, 0], ink: false }));
  Wd.add(box(2 * HX, 1.0, .12, 0xb98a58, { pos: [0, .5, -HZ + .06], ink: false }));
  Wd.add(box(5.2, 1.9, .12, 0x2f5a46, { pos: [-1.5, 2.3, -HZ + .08] })); Wd.add(box(5.5, .12, .2, 0x8a5a34, { pos: [-1.5, 1.28, -HZ + .12], ink: false }));   // blackboard
  Wd.add(box(5.5, .12, .14, 0x8a5a34, { pos: [-1.5, 3.3, -HZ + .1], ink: false }));
  for (const [x, w] of [[1.2, 1.7], [4.8, 1.7]]) windowUnit(Wd, x, 1.0, HZ - .02, PI, w, 2.3);   // windows + bookcase on the BACK wall (+z): the camera shoots the boys from the board side
  Wd.add(box(1.4, 2.7, .12, 0x7a4a2a, { pos: [-2.6, 1.35, HZ - .08] }));
  Wd.add(box(3.0, 3.2, .5, 0x7a4a2a, { pos: [-HX + 1.8, 1.6, HZ - .4] })); const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.0), toon(0xffffff, { map: booksTex(8) })); sh.position.set(-HX + 1.8, 1.6, HZ - .66); sh.rotation.y = PI; Wd.add(sh);
  for (let x = -7; x <= 7.1; x += 3.5) Wd.add(box(.3, .4, 2 * HZ, 0x6a4326, { pos: [x, H - .2, 0], ink: false }));
  for (const x of [-4, 0, 4]) { const lp = new THREE.Group(); lp.position.set(x, H - 1.2, -2.5); Wd.add(lp); lp.add(cyl(.02, .02, .8, 0x333333, { pos: [0, .6, 0], ink: false })); lp.add(cyl(.3, .45, .3, 0xd9a63a)); lp.add(new THREE.Mesh(new THREE.SphereGeometry(.18, 12, 10), bm(0xfff0c0))); }
  return { HX, HZ, H };
}
export function desk(Wd, x, z, ry) {   // student desk; the sitter (facing the board, -z when ry = 0 ... use ry = PI) sits at +z side
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; Wd.add(g);
  g.add(box(1.0, .06, .6, 0xc99a66, { pos: [0, .62, 0] })); for (const dx of [-.44, .44]) for (const dz of [-.24, .24]) g.add(box(.05, .6, .05, 0x6a4326, { pos: [dx, .3, dz], ink: false }));
  g.add(box(.3, .06, .4, 0x244a86, { pos: [-.2, .68, 0], rot: [0, .15, 0] })); g.add(box(.26, .04, .36, 0xf4ecd8, { pos: [.22, .66, .03], rot: [0, -.1, 0], ink: false }));
  return g;
}
export function diningTable(Wd, o) {   // o: {x, z, len, wid, cloth, food, dark}  table top y = .72
  const g = new THREE.Group(); g.position.set(o.x || 0, 0, o.z || 0); Wd.add(g); const L = o.len || 2.6, Wi = o.wid || 1.1, TY = .72, cloth = o.cloth === undefined ? 0xffffff : o.cloth;
  g.add(box(L, .06, Wi, 0x9a6a3e, { pos: [0, TY, 0] })); g.add(box(L + .1, .02, Wi + .1, cloth, { pos: [0, TY + .04, 0], ink: false }));
  for (const sz of [-1, 1]) g.add(box(L + .1, .34, .02, cloth, { pos: [0, TY - .14, sz * (Wi / 2 + .05)], ink: false })); for (const sx of [-1, 1]) g.add(box(.02, .34, Wi + .1, cloth, { pos: [sx * (L / 2 + .05), TY - .14, 0], ink: false }));
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) g.add(box(.08, TY, .08, 0x6a4326, { pos: [dx * (L / 2 - .1), TY / 2, dz * (Wi / 2 - .1)], ink: false }));
  if (o.food !== false) {
    const n = Math.max(2, Math.round(L / .75)); for (let i = 0; i < n; i++) { const x = -L / 2 + .45 + i * ((L - .9) / Math.max(1, n - 1)); for (const sz of [-1, 1]) { g.add(cyl(.17, .15, .02, 0xffffff, { pos: [x, TY + .07, sz * .33], ink: false })); g.add(ball(.06, i % 2 ? 0xd98a3a : 0x8a9a4a, { pos: [x, TY + .1, sz * .33], scale: [1, .5, 1], ink: false })); } }
    g.add(box(.55, .1, .3, 0x244a86, { pos: [0, TY + .1, 0] })); g.add(ball(.16, 0xe3b25a, { pos: [0, TY + .15, 0], scale: [1.5, .6, 1] }));   // challah under a cover
    g.add(cyl(.045, .03, .13, 0xd8dde6, { pos: [L / 2 - .4, TY + .12, 0] })); g.add(cyl(.09, .09, .02, 0xd8dde6, { pos: [L / 2 - .4, TY + .06, 0], ink: false }));
  }
  return g;
}
export function toyTruck(Wd, pos, ry) {
  const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); g.rotation.y = ry || 0; Wd.add(g);
  g.add(box(.5, .16, .24, 0xe8a317, { pos: [0, .17, 0] })); g.add(box(.2, .2, .24, 0xd6411f, { pos: [.2, .3, 0] })); g.add(box(.3, .1, .22, 0x8a8f96, { pos: [-.08, .3, 0] }));
  for (const dx of [-.16, .16]) for (const dz of [-.13, .13]) g.add(cyl(.07, .07, .05, 0x1d1d22, { pos: [dx, .07, dz], rot: [PI / 2, 0, 0] }));
  return g;
}
export function soccer(Wd, r) { const b = ball(r || .14, 0xf4f4f4); const dots = new THREE.Group(); [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(d => { const q = new THREE.Mesh(new THREE.CircleGeometry((r || .14) * .42, 6), new THREE.MeshBasicMaterial({ color: 0x20242c, side: THREE.DoubleSide })); q.position.set(d[0] * (r || .14) * 1.005, d[1] * (r || .14) * 1.005, d[2] * (r || .14) * 1.005); q.lookAt(0, 0, 0); b.add(q); }); Wd.add(b); return b; }

// ---------------------------------------------------------------- generic rooms for the Shabbat / Yom Tov films
const nightTex = () => canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0c1738'); gr.addColorStop(1, '#27386a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  c.fillStyle = '#fff6c8'; for (const [x, y, r] of [[20, 30, 2], [90, 50, 2.5], [60, 100, 1.8], [100, 140, 2], [30, 170, 2.2]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } });
export function nightWindow(Wd, x, y0, z, ry, w, h) {   // arched window with a night sky (faces +z when ry = 0)
  const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.y = ry; Wd.add(g);
  const fr = new THREE.Mesh(new THREE.ShapeGeometry(archShape2(w + .24, h + .12)), toon(0x8a5a30)); fr.position.z = .01; g.add(fr);
  const pn = new THREE.Mesh(new THREE.ShapeGeometry(archShape2(w, h), 12), bm(0xffffff, { map: nightTex() })); pn.position.z = .02;
  const uv = pn.geometry.attributes.uv, pos = pn.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h); g.add(pn);
  g.add(box(.07, h - w / 2, .06, 0x8a5a30, { pos: [0, (h - w / 2) / 2, .05], ink: false })); g.add(box(w, .07, .06, 0x8a5a30, { pos: [0, h * .45, .05], ink: false })); g.add(box(w + .5, .1, .4, 0xe6d6b2, { pos: [0, -.04, .18], ink: false }));
  return g;
}
function archShape2(w, h) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, PI, false); s.lineTo(-w / 2, 0); return s; }
// plain room: floor, 4 walls, wainscot, ceiling beams. o: {HX, HZ, H, wall}. windows are added by the caller.
export function plainRoom(Wd, o) {
  o = o || {}; const HX = o.HX || 6, HZ = o.HZ || 5, H = o.H || 3.6, wallC = o.wall === undefined ? 0xf4e8cc : o.wall, ext = o.front === false ? 0 : 0, apron = 10;
  // the front wall (+z) is left open (a stage set): the camera may stand outside; the floor continues as an apron so nothing looks empty
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2 * HX, 2 * HZ + apron), toon(0xffffff, { map: planksTex([HX * .9, (HZ + apron / 2) * .9]) })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; fl.position.z = apron / 2; Wd.add(fl);
  Wd.add(box(2 * HX, H, .4, wallC, { pos: [0, H / 2, -HZ - .2], ink: false }));
  for (const sx of [-1, 1]) Wd.add(box(.4, H, 2 * HZ + apron, wallC, { pos: [sx * (HX + .2), H / 2, apron / 2], ink: false }));
  Wd.add(box(2 * HX, 1.0, .12, 0xb98a58, { pos: [0, .5, -HZ + .06], ink: false }));
  for (const sx of [-1, 1]) Wd.add(box(.12, 1.0, 2 * HZ + apron, 0xb98a58, { pos: [sx * (HX - .06), .5, apron / 2], ink: false }));
  if (o.beams !== false) for (let x = -HX + 1.5; x <= HX - 1.4; x += 3) Wd.add(box(.3, .35, 2 * HZ + apron, 0x6a4326, { pos: [x, H - .18, apron / 2], ink: false }));
  return { HX, HZ, H };
}
// banquet hall: bigger room, background tables, curtains + night windows on the back wall (z = -HZ), chandeliers. returns {bulbs, setLights(k)}
export function hallRoom(Wd) {
  const R = plainRoom(Wd, { HX: 10, HZ: 7.5, H: 5, wall: 0xf1e3c6 }), bulbs = [], glows = [];
  for (const x of [-6.5, -2.2, 2.2, 6.5]) { nightWindow(Wd, x, 1.2, -R.HZ + .02, 0, 1.6, 3.0); for (const dx of [-1, 1]) Wd.add(box(.5, 3.6, .14, 0x8a2a3a, { pos: [x + dx * 1.15, 2.5, -R.HZ + .14], ink: false })); }
  Wd.add(box(18.6, .12, .12, 0xd9a63a, { pos: [0, 4.3, -R.HZ + .14], ink: false }));
  for (const [x, z] of [[-7, -3.2], [7, -3.2], [-7, 3.5], [7, 3.5]]) diningTable(Wd, { x, z, len: 3.0, wid: 1.1, cloth: 0xf4efe4, food: false });
  for (const [x, z] of [[-4.2, -1.5], [4.2, -1.5], [0, -4.2]]) { const lp = new THREE.Group(); lp.position.set(x, R.H - 1.3, z); Wd.add(lp); lp.add(cyl(.02, .02, 1.2, 0x333333, { pos: [0, .9, 0], ink: false })); lp.add(cyl(.5, .5, .1, 0xd9a63a));
    const b = new THREE.Mesh(new THREE.SphereGeometry(.24, 14, 12), new THREE.MeshBasicMaterial({ color: 0xfff0c0, fog: false })); b.position.y = -.2; lp.add(b); bulbs.push(b); const gs = glowSprite(2.4, 2.4, .6); gs.position.y = -.2; lp.add(gs); glows.push(gs); }
  const c0 = new THREE.Color(0x555a66), c1 = new THREE.Color(0xfff0c0), tmp = new THREE.Color();
  return Object.assign(R, { setLights(k) { bulbs.forEach(b => b.material.color.copy(tmp.copy(c0).lerp(c1, k))); glows.forEach(g => g.material.opacity = .6 * k); } });
}
export function qmark(Wd, color, size) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; Wd.add(g);
  for (let j = 0; j < 4; j++) { const m = texPlane(size, size, (c, w, h) => { c.font = `700 ${h * .9}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; if (j < 3) { c.fillStyle = '#2a2a2a'; c.fillText('?', w / 2, h * .54); } else { c.strokeStyle = '#2a2a2a'; c.lineWidth = h * .08; c.strokeText('?', w / 2, h * .54); c.fillStyle = color || '#9aa0ab'; c.fillText('?', w / 2, h * .54); } }, { cw: 256, ro: 6 }); m.position.z = -(3 - j) * .03; inner.add(m); }
  bill(Wd, g); return { g, set(pos, s, rz) { g.visible = s > .01; if (!g.visible) return; g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); inner.rotation.z = rz || 0; } };
}
// picture-in-picture: a second small world rendered with its own renderer (used by a story's overlay): returns {draw(g, t, x, y, w, h, filter)}
export function insetView(Wd2, camFn, W, H) {
  W = W || 640; H = H || 360; const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
  const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true, alpha: false }); renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.shadowMap.enabled = true;
  const cam = new THREE.PerspectiveCamera(45, W / H, .05, 500);
  return { draw(g, t, x, y, w, h, filter) { const c = camFn(t); cam.position.set(...c.pos); cam.lookAt(...c.look); cam.fov = c.fov || 45; cam.updateProjectionMatrix(); for (const f of Wd2.updaters) f(t, cam); renderer.render(Wd2.scene, cam);
      g.save(); g.beginPath(); g.roundRect(x, y, w, h, 26); g.clip(); if (filter) g.filter = filter; g.drawImage(glc, x, y, w, h); g.restore(); } };
}
export { cine };
