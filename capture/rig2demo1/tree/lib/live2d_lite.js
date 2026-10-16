// דמות חיה מאיור שלם (בסגנון Live2D): האיור מצויר על רשת דקה, וכל נקודה ברשת זזה לפי פונקציית עיוות.
// כך הראש נוטה ומהנהן, החזה נושם, הגוף מתנדנד והזקן מתנדנד — בלי חיתוך לחלקים ובלי תפרים.
//   const L = await LIVE.load(dir)                  (dir/live.json + poses/*.png + patches/*.png — tools/live_build.py)
//   const R = LIVE.renderer(L, width, height)       (WebGL2, מחזיר R.canvas שאפשר לצייר על קנבס דו-ממדי)
//   R.draw({ x, y, s, pose, from, blend, tilt, nod, turn, breath, sway, squash, beard:{x,y}, mouth, blink })
//      x,y = מיקום נקודת הרגליים במסך; s = קנה מידה; pose/from/blend = מעבר רך בין תנוחות;
//      tilt = הטיית ראש במעלות; nod = הנהון בפיקסלים של האיור; turn = פנייה -1..1; breath = -1..1; sway = מעלות.
(function () {
'use strict';
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(src)); i.src = src; });
const xhrJSON = src => new Promise((res, rej) => { const x = new XMLHttpRequest(); x.open('GET', src); x.onload = () => { try { res(JSON.parse(x.responseText)); } catch (e) { rej(e); } }; x.onerror = rej; x.send(); });
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

async function load(dir) {
  const L = await xhrJSON(dir + '/live.json');
  L.img = {};
  await Promise.all(L.poses.map(async p => { L.img[p] = await loadImg(dir + '/poses/' + p + '.png'); }));
  await Promise.all(Object.entries(L.patches).map(async ([k, p]) => { L.img[k] = await loadImg(dir + '/patches/' + p.img); }));
  return L;
}

const VS = `#version 300 es
in vec2 aPos; in vec2 aUV; uniform vec2 uRes; out vec2 vUV;
void main(){ vUV = aUV; vec2 p = aPos / uRes * 2.0 - 1.0; gl_Position = vec4(p.x, -p.y, 0.0, 1.0); }`;
const FS = `#version 300 es
precision highp float; in vec2 vUV; uniform sampler2D uTex; uniform float uAlpha; out vec4 o;
void main(){ o = texture(uTex, vUV) * uAlpha; }`;

function renderer(L, W, H) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const gl = cv.getContext('webgl2', { premultipliedAlpha: true, alpha: true, preserveDrawingBuffer: true, antialias: true });
  if (!gl) throw new Error('webgl2 not available');
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  gl.useProgram(prog);
  const loc = { pos: gl.getAttribLocation(prog, 'aPos'), uv: gl.getAttribLocation(prog, 'aUV'), res: gl.getUniformLocation(prog, 'uRes'), a: gl.getUniformLocation(prog, 'uAlpha') };
  gl.uniform2f(loc.res, W, H);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const tex = {};
  for (const [k, im] of Object.entries(L.img)) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    tex[k] = { t, w: im.width, h: im.height };
  }
  // רשת: כל המשולשים של מלבן מחולק ל-nx*ny
  function grid(nx, ny) {
    const uv = [], idx = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) uv.push(i / nx, j / ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    return { nx, ny, uv: new Float32Array(uv), idx: new Uint16Array(idx), pos: new Float32Array(uv.length) };
  }
  const G = { body: grid(56, 72), patch: grid(10, 10) };
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const bPos = gl.createBuffer(), bUV = gl.createBuffer(), bIdx = gl.createBuffer();

  // ---------- פונקציית העיוות ----------
  const N = L.neck, F = L.face, hw = L.head_w, cx0 = L.center_x, fy = L.feet_y;
  function deform(x, y, s, out, k) {
    // ראש: משקל 1 מעל הצוואר, יורד ל-0 בכתפיים; ומתרחק לצדדים
    const wy = sm(N[1] + hw * .55, N[1] - hw * .05, y), wx = 1 - sm(hw * .9, hw * 1.6, Math.abs(x - N[0]));
    const w = wy * wx;
    let X = x, Y = y;
    if (w > 0) {
      const a = (s.tilt || 0) * Math.PI / 180, dx = x - N[0], dy = y - N[1];
      let hx = N[0] + dx * Math.cos(a) - dy * Math.sin(a), hy = N[1] + dx * Math.sin(a) + dy * Math.cos(a) + (s.nod || 0);
      // פנייה: הפנים זזות יותר מהשוליים (בליטה סביב מרכז הפנים)
      const fd = Math.hypot(x - F[0], (y - F[1]) * .9) / (hw * .55), bump = Math.exp(-fd * fd);
      hx += (s.turn || 0) * hw * .07 * bump;
      // זקן: נגרר אחרי תנועת הראש (קפיץ מבחוץ), רק באזור שמתחת לפה
      if (s.beard) { const bw = sm(F[1], F[1] + hw * .45, y) * Math.exp(-Math.pow((x - F[0]) / (hw * .5), 2)); hx += s.beard.x * bw; hy += s.beard.y * bw; }
      X = x + (hx - x) * w; Y = y + (hy - y) * w;
    }
    // נשימה: החזה מתרחב מעט (מתחת לצוואר ומעל המותניים)
    const chest = sm(N[1], N[1] + hw * .8, y) * (1 - sm(N[1] + hw * 1.6, N[1] + hw * 2.6, y));
    X += (X - cx0) * .012 * (s.breath || 0) * chest; Y -= hw * .02 * (s.breath || 0) * (1 - sm(N[1] - hw, N[1] + hw * 2.6, y));
    // נדנוד ומעיכה סביב הרגליים
    const sq = s.squash || 0, sw = (s.sway || 0) * Math.PI / 180;
    let rx = X - cx0, ry = Y - fy;
    ry *= 1 + .035 * sq; rx *= 1 - .025 * sq;
    const qx = rx * Math.cos(sw) - ry * Math.sin(sw), qy = rx * Math.sin(sw) + ry * Math.cos(sw);
    // אל המסך
    out[k] = s.x + qx * s.s; out[k + 1] = s.y + qy * s.s;
  }

  function drawMesh(g, texKey, ox, oy, s, alpha) {
    const T = tex[texKey];
    for (let i = 0, n = g.uv.length; i < n; i += 2) deform(ox + g.uv[i] * T.w, oy + g.uv[i + 1] * T.h, s, g.pos, i);
    gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferData(gl.ARRAY_BUFFER, g.pos, gl.STREAM_DRAW);
    gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bUV); gl.bufferData(gl.ARRAY_BUFFER, g.uv, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc.uv); gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.idx, gl.STATIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D, T.t); gl.uniform1f(loc.a, alpha);
    gl.drawElements(gl.TRIANGLES, g.idx.length, gl.UNSIGNED_SHORT, 0);
  }

  function face(s, alpha) {
    const P = L.patches;
    const m = 'mouth_' + (s.mouth || 'rest');
    if (P[m]) drawMesh(G.patch, m, P[m].origin[0], P[m].origin[1], s, alpha);
    if ((s.blink || 0) > .02) drawMesh(G.patch, 'eyes_closed', P.eyes_closed.origin[0], P.eyes_closed.origin[1], s, alpha * Math.min(1, s.blink * 1.4));
  }

  function draw(s) {
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    const b = s.blend === undefined ? 1 : s.blend;
    if (s.from && s.from !== s.pose && b < 1) { drawMesh(G.body, s.from, 0, 0, s, 1); face(s, 1); drawMesh(G.body, s.pose, 0, 0, s, b); face(s, b); }
    else { drawMesh(G.body, s.pose, 0, 0, s, 1); face(s, 1); }
    return cv;
  }
  return { canvas: cv, draw };
}

// סנכרון שפתיים: Rhubarb -> צורת פה
const VIS = { X: 'rest', A: 'mm', B: 'ee', C: 'ee', D: 'ah', E: 'oh', F: 'oh', G: 'ee', H: 'ah' };
const mouthAt = (cues, t) => { const c = cues.find(c => t >= c.start && t < c.end); return c ? VIS[c.value] || 'rest' : 'rest'; };

window.LIVE = { load, renderer, mouthAt };
})();
