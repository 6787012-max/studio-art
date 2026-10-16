// בובה מקצועית מאיור אחד בתנוחת A (כמו Spine/Moho): גוף+ראש על רשת גמישה, זרועות רציפות שמתכופפות
// ברשת עם משקלות עצם (בלי תפר במרפק), דיסקת מרפק מעוגלת מתחת לכיפוף, כתפיות מעל ראש הזרוע (בלי תפר בכתף),
// כפות ידיים שמתחלפות בשורש כף היד, וצל רך של הזרועות על הגוף (עומק).
//   const L = await RIG2.load(dir);  const R = RIG2.renderer(L, W, H);
//   R.draw({ x, y, s,  tilt, nod, turn, brow, breath, sway, squash, beard:{x,y}, mouth, blink,
//            arms: { A:{u,e,w,hand}, B:{u,e,w,hand} } })      u/e/w במעלות (0=ימינה, 90=למטה), hand: own|relax|wave|point|thumb
(function () {
'use strict';
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(src)); i.src = src; });
const xhrJSON = src => new Promise((res, rej) => { const x = new XMLHttpRequest(); x.open('GET', src); x.onload = () => { try { res(JSON.parse(x.responseText)); } catch (e) { rej(e); } }; x.onerror = rej; x.send(); });
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const D = Math.PI / 180;

async function load(dir) {
  const L = await xhrJSON(dir + '/rig.json'); L.img = {};
  const files = { torso: 'torso.png' };
  for (const k of ['A', 'B']) { const a = L.arms[k]; files['arm' + k] = a.img; files['own' + k] = a.hand; files['cap' + k] = a.cap; }
  for (const [k, p] of Object.entries(L.patches)) files[k] = p.img;
  for (const [k, h] of Object.entries(L.hands)) files['g_' + k] = h.img;
  await Promise.all(Object.entries(files).map(async ([k, f]) => { L.img[k] = await loadImg(dir + '/' + f); }));
  for (const k of ['A', 'B']) L.arms[k].disc = elbowDisc(L, k);
  return L;
}

// מודד את רוחב השרוול במרפק מתוך האיור: מרכז ורדיוס לדיסקה שממלאת את הפינה החיצונית בכיפוף
function elbowDisc(L, k) {
  const R = L.arms[k], im = L.img['arm' + k], c = document.createElement('canvas');
  c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const px = g.getImageData(0, 0, c.width, c.height).data;
  const a = (x, y) => { x = Math.round(x - R.origin[0]); y = Math.round(y - R.origin[1]); return x < 0 || y < 0 || x >= c.width || y >= c.height ? 0 : px[(y * c.width + x) * 4 + 3]; };
  const S = R.shoulder, E = R.elbow, Wr = R.wrist;
  const t = Math.atan2(E[1] - S[1], E[0] - S[0]) / 2 + Math.atan2(Wr[1] - E[1], Wr[0] - E[0]) / 2, nx = -Math.sin(t), ny = Math.cos(t);
  const reach = sgn => { let d = 0; while (d < 400 && a(E[0] + nx * d * sgn, E[1] + ny * d * sgn) > 110) d++; return d; };
  const p = reach(1), m = reach(-1), r = (p + m) / 2 * .97;
  return { c: [E[0] + nx * (p - m) / 2, E[1] + ny * (p - m) / 2], r: Math.max(20, r) };
}

const VS = `#version 300 es
in vec2 aPos; in vec2 aUV; uniform vec2 uRes; out vec2 vUV;
void main(){ vUV = aUV; vec2 p = aPos / uRes * 2.0 - 1.0; gl_Position = vec4(p.x, -p.y, 0.0, 1.0); }`;
const FS = `#version 300 es
precision highp float; in vec2 vUV; uniform sampler2D uTex; uniform float uAlpha; uniform float uShade;
uniform vec2 uTexSize; uniform vec3 uMask; out vec4 o;
void main(){
  vec4 c = texture(uTex, vUV) * uAlpha;
  if (uMask.z > 0.0) c *= 1.0 - smoothstep(uMask.z * 0.9, uMask.z, distance(vUV * uTexSize, uMask.xy));
  o = uShade > 0.0 ? vec4(0.0, 0.0, 0.0, c.a * uShade) : c;
}`;

function renderer(L, W, H) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const gl = cv.getContext('webgl2', { premultipliedAlpha: true, alpha: true, preserveDrawingBuffer: true, antialias: true });
  if (!gl) throw new Error('webgl2 not available');
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
  const U = n => gl.getUniformLocation(prog, n);
  const loc = { pos: gl.getAttribLocation(prog, 'aPos'), uv: gl.getAttribLocation(prog, 'aUV'), res: U('uRes'), a: U('uAlpha'), shade: U('uShade'), ts: U('uTexSize'), mask: U('uMask') };
  gl.uniform2f(loc.res, W, H); gl.enable(gl.BLEND); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const tex = {};
  for (const [k, im] of Object.entries(L.img)) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    tex[k] = { t, w: im.width, h: im.height };
  }
  function grid(nx, ny) {
    const uv = [], idx = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) uv.push(i / nx, j / ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    return { uv: new Float32Array(uv), idx: new Uint16Array(idx), pos: new Float32Array(uv.length), tuv: new Float32Array(uv.length) };
  }
  const G = { torso: grid(56, 72), arm: grid(20, 36), small: grid(10, 10), disc: grid(12, 12) };
  gl.bindVertexArray(gl.createVertexArray());
  const bPos = gl.createBuffer(), bUV = gl.createBuffer(), bIdx = gl.createBuffer();

  // ---------- עיוות אחד לכל הדמות: ראש (רק מעל הצוואר), נשימה, נטייה וכיווץ ----------
  const N = L.neck, F = L.face, hw = L.head_w, cx0 = L.center_x, fy = L.feet_y;
  const ep = L.patches.eyes_closed, BR = [ep.origin[0] + tex.eyes_closed.w / 2, ep.origin[1] + 14];
  function deform(x, y, s) {
    let X = x, Y = y;
    const below = sm(N[1] - hw * .12, N[1] + hw * .02, y);
    const w = sm(N[1] + hw * .2, N[1] + hw * .03, y) * (1 - below * sm(hw * .16, hw * .26, Math.abs(x - N[0])));
    if (w > 0) {
      const a = (s.tilt || 0) * D, dx = x - N[0], dy = y - N[1];
      let hx = N[0] + dx * Math.cos(a) - dy * Math.sin(a), hy = N[1] + dx * Math.sin(a) + dy * Math.cos(a) + (s.nod || 0) * (1 - sm(N[1] - hw * .3, N[1], y));
      const fd = Math.hypot(x - F[0], (y - F[1]) * .9) / (hw * .55); hx += (s.turn || 0) * hw * .07 * Math.exp(-fd * fd);
      if (s.brow) { const bd = Math.pow((x - BR[0]) / (hw * .24), 2) + Math.pow((y - BR[1]) / (hw * .05), 2); hy -= s.brow * hw * .018 * Math.exp(-bd); }
      if (s.beard) { const bw = sm(F[1], F[1] + hw * .3, y) * Math.exp(-Math.pow((x - F[0]) / (hw * .3), 2)); hx += s.beard.x * bw; hy += s.beard.y * bw; }
      X = x + (hx - x) * w; Y = y + (hy - y) * w;
    }
    const chest = sm(N[1], N[1] + hw * .3, y) * (1 - sm(N[1] + hw * .9, N[1] + hw * 1.4, y));
    X += (X - cx0) * .014 * (s.breath || 0) * chest; Y -= hw * .012 * (s.breath || 0) * (1 - sm(N[1] - hw * .5, N[1] + hw * 1.4, y));
    const sq = s.squash || 0, sw = (s.sway || 0) * D;
    const rx = (X - cx0) * (1 - .025 * sq), ry = (Y - fy) * (1 + .035 * sq);
    return [s.x + (rx * Math.cos(sw) - ry * Math.sin(sw)) * s.s, s.y + (rx * Math.sin(sw) + ry * Math.cos(sw)) * s.s];
  }

  // ---------- עצמות הזרוע ----------
  const rot = (p, c, d) => [c[0] + (p[0] - c[0]) * Math.cos(d) - (p[1] - c[1]) * Math.sin(d), c[1] + (p[0] - c[0]) * Math.sin(d) + (p[1] - c[1]) * Math.cos(d)];
  function armBones(k, a) {
    const R = L.arms[k], S = R.shoulder, E = R.elbow, Wr = R.wrist;
    const t1 = Math.atan2(E[1] - S[1], E[0] - S[0]), t2 = Math.atan2(Wr[1] - E[1], Wr[0] - E[0]);
    const d1 = a.u * D - t1, d2 = (a.u + (a.e || 0)) * D - t2, d3 = d2 + (a.w || 0) * D;
    const E2 = rot(E, S, d1), M1 = p => rot(p, S, d1);
    const M2 = p => { const q = rot(p, E, d2); return [q[0] + E2[0] - E[0], q[1] + E2[1] - E[1]]; };
    const W2 = M2(Wr);
    const M3 = p => { const q = rot(p, Wr, d3); return [q[0] + W2[0] - Wr[0], q[1] + W2[1] - Wr[1]]; };
    const Md = p => { const q = rot(p, E, (d1 + d2) / 2); return [q[0] + E2[0] - E[0], q[1] + E2[1] - E[1]]; };
    const L1 = Math.hypot(E[0] - S[0], E[1] - S[1]);
    // משקלות: שורש הזרוע צמוד לגוף (מוסתר מתחת לכתפייה), מעבר רך בין זרוע עליונה לאמה סביב המרפק
    const skin = p => {
      const t = ((p[0] - S[0]) * (E[0] - S[0]) + (p[1] - S[1]) * (E[1] - S[1])) / (L1 * L1);
      const w0 = 1 - sm(-.1, .16, t), w2 = sm(.86, 1.08, t), a1 = M1(p), a2 = M2(p);
      const x = (1 - w2) * a1[0] + w2 * a2[0], y = (1 - w2) * a1[1] + w2 * a2[1];
      return [w0 * p[0] + (1 - w0) * x, w0 * p[1] + (1 - w0) * y];
    };
    return { skin, M3, Md, W2, dir: a.u + (a.e || 0) + (a.w || 0) };
  }

  // מצייר רשת: map מקבל נקודה בקואורדינטות האיור המקורי ומחזיר נקודה על המסך
  function drawMesh(g, key, ox, oy, map, o) {
    o = o || {}; const T = tex[key], r = o.rect || [0, 0, T.w, T.h];
    for (let i = 0, n = g.uv.length; i < n; i += 2) {
      const tx = r[0] + g.uv[i] * (r[2] - r[0]), ty = r[1] + g.uv[i + 1] * (r[3] - r[1]);
      g.tuv[i] = tx / T.w; g.tuv[i + 1] = ty / T.h;
      const q = map(ox + tx, oy + ty); g.pos[i] = q[0] + (o.dx || 0); g.pos[i + 1] = q[1] + (o.dy || 0);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferData(gl.ARRAY_BUFFER, g.pos, gl.STREAM_DRAW);
    gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bUV); gl.bufferData(gl.ARRAY_BUFFER, g.tuv, gl.STREAM_DRAW);
    gl.enableVertexAttribArray(loc.uv); gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.idx, gl.STATIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D, T.t); gl.uniform1f(loc.a, o.alpha === undefined ? 1 : o.alpha);
    gl.uniform1f(loc.shade, o.shade || 0); gl.uniform2f(loc.ts, T.w, T.h);
    if (o.mask) gl.uniform3f(loc.mask, o.mask[0], o.mask[1], o.mask[2]); else gl.uniform3f(loc.mask, 0, 0, 0);
    gl.drawElements(gl.TRIANGLES, g.idx.length, gl.UNSIGNED_SHORT, 0);
  }

  // זרוע אחת: דיסקת מרפק -> שרוול רציף -> כף יד
  function drawArm(k, a, s, o) {
    const R = L.arms[k], B = armBones(k, a), body = (x, y) => deform(x, y, s), dc = R.disc;
    const lx = dc.c[0] - R.origin[0], ly = dc.c[1] - R.origin[1];
    drawMesh(G.disc, 'arm' + k, R.origin[0], R.origin[1], (x, y) => { const q = B.Md([x, y]); return body(q[0], q[1]); },
      Object.assign({ rect: [lx - dc.r, ly - dc.r, lx + dc.r, ly + dc.r], mask: [lx, ly, dc.r] }, o));
    drawMesh(G.arm, 'arm' + k, R.origin[0], R.origin[1], (x, y) => { const q = B.skin([x, y]); return body(q[0], q[1]); }, o);
    const hand = a.hand || 'relax';
    if (hand === 'own') drawMesh(G.small, 'own' + k, R.hand_origin[0], R.hand_origin[1], (x, y) => { const q = B.M3([x, y]); return body(q[0], q[1]); }, o);
    else {
      const h = L.hands[hand], norm = x => ((x + 540) % 360) - 180;
      const r1 = norm(B.dir - h.dir), r2 = norm(B.dir - (180 - h.dir));
      const flip = h.flip === 'upright' ? Math.abs(r2) < Math.abs(r1) : k === 'B';
      const ang = (flip ? r2 : r1) * D, sc = h.scale * (a.hscale || 1);
      drawMesh(G.small, 'g_' + hand, 0, 0, (x, y) => {
        let lx = (x - h.pivot[0]) * sc, ly = (y - h.pivot[1]) * sc; if (flip) lx = -lx;
        return body(B.W2[0] + lx * Math.cos(ang) - ly * Math.sin(ang), B.W2[1] + lx * Math.sin(ang) + ly * Math.cos(ang));
      }, o);
    }
    return deform(B.W2[0], B.W2[1], s);
  }

  const REST = { A: { u: 100, e: -6 }, B: { u: 80, e: 6 } };
  const RING = [[0, 0], [1, 0], [.7, .7], [0, 1], [-.7, .7], [-1, 0], [-.7, -.7], [0, -1], [.7, -.7]];
  function draw(s) {
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const body = (x, y) => deform(x, y, s), arms = s.arms || {};
    drawMesh(G.torso, 'torso', L.torso_origin[0], L.torso_origin[1], body);
    const P = L.patches, m = 'mouth_' + (s.mouth || 'rest');
    if (P[m]) drawMesh(G.small, m, P[m].origin[0], P[m].origin[1], body);
    if ((s.blink || 0) > .02) drawMesh(G.small, 'eyes_closed', P.eyes_closed.origin[0], P.eyes_closed.origin[1], body, { alpha: Math.min(1, s.blink * 1.4) });
    // צל רך של הזרועות — נופל רק על מה שכבר צויר (הגוף), לא על הרקע
    if (s.shadow !== 0) {
      gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
      const k0 = s.shadow || 1, off = [10 * s.s, 16 * s.s], bl = 9 * s.s;
      for (const k of ['A', 'B']) for (const [rx, ry] of RING)
        drawArm(k, arms[k] || REST[k], s, { shade: .07 * k0, dx: off[0] + rx * bl, dy: off[1] + ry * bl });
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
    const out = {};
    for (const k of ['A', 'B']) out[k] = drawArm(k, arms[k] || REST[k], s);
    // כתפיות מעל ראש הזרוע — מסתירות את החיבור
    for (const k of ['A', 'B']) { const R = L.arms[k]; drawMesh(G.small, 'cap' + k, R.cap_origin[0], R.cap_origin[1], body); }
    return out;
  }
  return { canvas: cv, draw };
}

const VIS = { X: 'rest', A: 'mm', B: 'ee', C: 'ee', D: 'ah', E: 'oh', F: 'oh', G: 'ee', H: 'ah' };
const mouthAt = (cues, t) => { const c = cues.find(c => t >= c.start && t < c.end); return c ? VIS[c.value] || 'rest' : 'rest'; };
window.RIG2 = { load, renderer, mouthAt };
})();
