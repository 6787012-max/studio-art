// במה תלת-ממדית לסרטים (18/10/2026): עולם אמיתי ב-three.js — קרקע, שמים, עננים, גשם, מפת תבליט של ארץ ישראל,
// חפצים בסגנון מצויר (צללה + קו מתאר), ומצלמה שטסה/מקיפה 360. הדמויות הן הדמויות המצוירות בקוד (people_pro.js)
// על "שלט" שתמיד פונה למצלמה — והציור עצמו מסתובב לפי הזווית שממנה מסתכלים (פנים / צד / גב).
// שימוש: import {film} from './stage3d.js'; film({W,H,title,kicker,recap,shots:[{dur,caps,build(S)}]})
// build(S) מחזיר {scene, cam(t)->{pos,look,fov}, update(t)}.  הכול דטרמיניסטי לפי הזמן (window.__seek).
import * as THREE from 'three';
import { figure, POSES, walkPose, mixPose, resolveGesture } from './figure3d.js';

// ---- runtime contract globals (23/10/2026): installed at module load, before any film() code runs ----
const FIN = Number.isFinite, num = (v, d) => FIN(v) ? v : d;
{
  const qs = (typeof location !== 'undefined' && location.search) || '';
  window.__HQ = window.__HQ === true || window.__HQ_RENDER === true || /[?&]hq=1(&|$)/.test(qs);
  window.__debug = window.__debug === true || /[?&]debug=1(&|$)/.test(qs);
  if (!window.__errors) window.__errors = [];
  if (!window.__errorsHooked) {
    window.__errorsHooked = true;
    const oe = console.error.bind(console), push = s => { try { window.__errors.push(String(s).slice(0, 500)); } catch (e) {} };
    console.error = (...a) => { push(a.map(x => (x && x.message) || String(x)).join(' ')); oe(...a); };
    window.addEventListener('error', e => push('Uncaught: ' + (e.message || e.error)));
    window.addEventListener('unhandledrejection', e => push('Unhandled rejection: ' + ((e.reason && e.reason.message) || e.reason)));
  }
}
let CUR_T = 0;
const ONCE = new Set();
function stageError(kind, msg) { if (ONCE.has(kind)) return; ONCE.add(kind); console.error('[STAGE3D_ERROR] ' + msg); }
// בודק מספר סופי; אחרת מחזיר את הערך הקודם התקין (או 0) ומדווח פעם אחת לכל סוג
function fin(v, prev, kind) { if (FIN(v)) return v; stageError(kind, 'non-finite ' + kind + ' at t=' + CUR_T.toFixed(2)); return FIN(prev) ? prev : 0; }
const D = Math.PI / 180, clamp = (v, a, b) => { v = +v; if (v !== v) return a; return Math.max(a, Math.min(b, v)); }, lerp = (a, b, t) => { const r = a + (b - a) * t; return FIN(r) ? r : (FIN(a) ? a : 0); };
const _E = f => t => f(FIN(t) ? t : 0);
export const ease = { io: _E(t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), out: _E(t => 1 - Math.pow(1 - t, 3)), in: _E(t => t * t * t), sm: _E(t => t * t * (3 - 2 * t)) };
export const prog = (t, a, b) => { const d = b - a; if (!FIN(d) || d === 0) return t >= b ? 1 : 0; return clamp((t - a) / d, 0, 1); };
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export { THREE, D, clamp, lerp, rng };

// ---------------- חומרים בסגנון מצויר ----------------
let GRAD = null;
function gradMap() { if (GRAD) return GRAD; const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 235, 235, 235, 255, 255, 255, 255, 255]); GRAD = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true; return GRAD; }
export const toon = (color, o) => new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: gradMap() }, o || {}));
function outlineMat(color, w) {
  const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normalize(normal) * ' + w.toFixed(4) + ';'); };
  m.customProgramCacheKey = () => 'ink' + w.toFixed(4);   // אחרת three.js משתמש באותו קוד צביעה (עובי הקו הראשון) לכל העוביים
  return m;
}
// קו מתאר: עטיפה הפוכה שמנופחת לאורך הנורמלים (לצורות עגולות) או בהגדלה (לקופסאות)
export function ink(mesh, w, color, scaleMode) {
  w = w === undefined ? .02 : w;
  const o = scaleMode ? new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: color || 0x15100c, side: THREE.BackSide })) : new THREE.Mesh(mesh.geometry, outlineMat(color || 0x15100c, w));
  if (scaleMode) { mesh.geometry.computeBoundingBox(); const b = mesh.geometry.boundingBox, s = new THREE.Vector3(); b.getSize(s); o.scale.set(1 + 2 * w / Math.max(s.x, 1e-3), 1 + 2 * w / Math.max(s.y, 1e-3), 1 + 2 * w / Math.max(s.z, 1e-3)); }
  o.raycast = () => {}; mesh.add(o); return mesh;
}
export function mesh(geo, mat, o) {
  const m = new THREE.Mesh(geo, mat); o = o || {};
  if (o.pos) m.position.set(...o.pos); if (o.rot) m.rotation.set(...o.rot); if (o.scale) (typeof o.scale === 'number' ? m.scale.setScalar(o.scale) : m.scale.set(...o.scale));
  m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false;
  if (o.ink !== false) ink(m, o.inkW, o.inkColor, o.box);
  return m;
}
export const box = (w, h, d, color, o) => mesh(new THREE.BoxGeometry(w, h, d), toon(color), Object.assign({ box: true }, o));
export const cyl = (rt, rb, h, color, o) => mesh(new THREE.CylinderGeometry(rt, rb, h, 28), toon(color), o);
export const ball = (r, color, o) => mesh(new THREE.SphereGeometry(r, 28, 18), toon(color), o);

// ---------------- טקסטורות מצוירות ----------------
export function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t;
}
const GROUNDS = {
  grass: ['#7fa35a', '#6d914c', '#8fb366'], sand: ['#e3c58f', '#d6b47b', '#eed3a0'], dry: ['#cfae7c', '#bf9b68', '#dcbd8c'],
  stone: ['#cdbfa6', '#b9aa90', '#ddd0b8'], paper: ['#efe4cc', '#e5d8bc', '#f5ecd8'], asphalt: ['#5d6066', '#54575d', '#686b71'], dark: ['#3a3f4a', '#333844', '#424754'],
};
export function groundTex(kind, rep) {
  const P = GROUNDS[kind] || GROUNDS.grass, r = rng(kind.length * 31 + 7);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = P[0]; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { g.fillStyle = r() < .5 ? P[1] : P[2]; g.globalAlpha = .25 + r() * .35; const s = 2 + r() * 9; g.beginPath(); g.ellipse(r() * w, r() * h, s, s * (.4 + r() * .6), r() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    if (kind === 'dry') { g.strokeStyle = 'rgba(90,60,30,.55)'; g.lineWidth = 2; for (let i = 0; i < 26; i++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 70; y += (r() - .5) * 70; g.lineTo(x, y); } g.stroke(); } }
    if (kind === 'stone') { g.strokeStyle = 'rgba(80,70,55,.35)'; g.lineWidth = 3; for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 64 % 2) * 64; x < w; x += 128) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); } } }
  }, rep || [8, 8]);
}

// ---------------- הבמה ----------------
export function makeStage(W, H) {
  const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
  const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return { renderer, glc, W, H };
}
export function world(o) {
  o = o || {};
  const scene = new THREE.Scene();
  if (o.fog !== false) scene.fog = new THREE.Fog(o.fogColor || o.skyBottom || 0xdfe8ef, o.fogNear || 40, o.fogFar || 220);
  // שמים: כיפה עם מעבר צבע
  const sky = new THREE.Mesh(new THREE.SphereGeometry(o.skyR || 600, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(o.skyTop || 0x7fb2e6) }, bot: { value: new THREE.Color(o.skyBottom || 0xf3e6cf) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying vec3 vP; void main(){ float k = smoothstep(-0.05, 0.55, vP.y); gl_FragColor = vec4(mix(bot, top, k), 1.0); }' }));
  sky.renderOrder = -10; scene.add(sky);
  const hemi = new THREE.HemisphereLight(o.hemiSky || 0xffffff, o.hemiGround || 0x8a7a60, o.hemi === undefined ? 1.25 : o.hemi); scene.add(hemi);
  const sun = new THREE.DirectionalLight(o.sunColor || 0xfff1dc, o.sun === undefined ? 1.9 : o.sun);
  sun.position.set(...(o.sunPos || [-30, 50, 25])); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera, ext = o.shadowExt || 30; sc.left = sc.bottom = -ext; sc.right = sc.top = ext; sc.near = 1; sc.far = 200; sun.shadow.bias = -.0005; sun.shadow.normalBias = .02;
  scene.add(sun); scene.add(sun.target);
  if (o.ground) { const g = new THREE.Mesh(new THREE.PlaneGeometry(o.groundSize || 400, o.groundSize || 400), new THREE.MeshLambertMaterial({ map: groundTex(o.ground, o.groundRep || [o.groundSize ? o.groundSize / 6 : 60, o.groundSize ? o.groundSize / 6 : 60]) }));
    g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g); }
  return { scene, sun, hemi, sky, updaters: [], add(x) { scene.add(x); return x; }, on(f) { this.updaters.push(f); return f; } };
}

// ---------------- דמויות על שלט שפונה למצלמה ----------------
const U_W = 320, U_TOP = -158, U_BOT = 178, M_PER_U = 1.75 / 307;   // גובה דמות 1.75 מטר
// ---------------- דמויות תלת-ממד בקוד (figure3d) — ברירת המחדל מ-18/10/2026 ----------------
// אותו ממשק כמו הדמויות המצוירות: look קבוע + fn(t) -> {pos, facing, gesture, perform, talk, walk, sit, look, smile, brow, seed, scale, hidden}
const PERSONS = new WeakMap();   // scene -> [person...] (the first one is the default "hero" for __heroBox)
export function person(Wd, look, fn, o) {
  const P = (window.__PEOPLE2D || (o && o.flat)) ? person2d(Wd, look, fn, o) : person3d(Wd, look, fn, o);
  const key = Wd.scene || Wd; if (!PERSONS.has(key)) PERSONS.set(key, []); PERSONS.get(key).push(P); return P;
}
// מצב אדם תקין: pos/facing/scale סופיים (אחרת הערך הקודם התקין)
function sanPerson(st, mem) {
  const pos = st.pos || [0, 0, 0];
  mem.x = fin(pos[0], mem.x, 'person pos'); mem.y = fin(pos[1] === undefined || pos[1] === null ? 0 : pos[1], mem.y, 'person pos'); mem.z = fin(pos[2], mem.z, 'person pos');
  mem.f = fin(st.facing === undefined || st.facing === null ? 0 : st.facing, mem.f, 'person facing');
  let sc = st.scale; if (sc === undefined || sc === null || sc === 0 || sc === false) sc = 1; mem.s = fin(sc, mem.s, 'person scale');
  return mem;
}
let N3D = 0;
function look3d(look) {   // look של הדמויות המצוירות -> אפשרויות figure3d (תמיד כיפה, לפי יוסף: "בלי כובע")
  const kid = look.kind === 'boy' || look.kid, bl = look.beardLen ?? .6;
  const o = { depth: true, hatColor: look.hatColor, vest: look.vest, coatLength: look.coatLength, hat: look.hat === 'none' ? 'none' : 'kippa', glasses: !!look.glasses, skin: look.skin, coatColor: look.coat, pantsColor: look.pants, lite: N3D > 2 && !window.__HQ };
  if (kid) o.kind = 'boy';
  else if (!bl) Object.assign(o, { beard: false, vest: false, headScale: 1.22, faceLong: 1.08 });
  else Object.assign(o, { beardColor: look.beard || '#3a2618', beardLength: clamp(.6 + bl * .5, .5, 1.2) });
  for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k];
  return o;
}
const PERF3 = ['explain', 'rest', 'finger', 'explainA', 'offer', 'heart', 'shrug', 'point', 'count', 'explain', 'think', 'wide', 'rest', 'hips'];
function pose3d(st, t) {
  const sd = st.seed ?? .37;
  let p = Object.assign({}, POSES.rest, st.sit ? POSES.sit : {});   // 30/10: בסיס רפוי (זרועות קרוב לגוף) לכל דמות
  if (st.walk !== undefined && st.walk !== null && st.walk !== false) p = walkPose(st.walk, 1);
  let gp = null;
  if (st.gesture) gp = POSES[resolveGesture(st.gesture)] || POSES.rest;   // alias map + unknown -> console.error once + rest
  else if (st.perform > 0) {   // מחליף תנועות לבד (כמו בדמויות המצוירות)
    const per = 2.5 + sd * 1.1, tt = t + sd * 13, k = Math.floor(tt / per), u = tt / per - k, N = PERF3.length, j = Math.floor(sd * N);
    const g0 = POSES[PERF3[(k - 1 + j + N * 99) % N]] || {}, g1 = POSES[PERF3[(k + j + N * 99) % N]] || {};
    gp = mixPose({}, mixPose(g0, g1, ease.sm(clamp(u / .22, 0, 1))), clamp(st.perform, 0, 1));
  }
  if (gp) { p = Object.assign({}, p); for (const k of Object.keys(gp)) if (!/^(thigh|shin|foot)/.test(k) && k !== 'y') p[k] = gp[k]; }
  return p;
}
function person3d(Wd, look, fn, o) {
  o = o || {}; let F = null; const turn = new THREE.Group();   // הדמות נבנית רק כשהשוט שלה מתרנדר בפעם הראשונה (טעינה מהירה)
  const mem = { x: 0, y: 0, z: 0, f: 0, s: 1 };
  const build = () => { const lo = look3d(look); P.lite = !!lo.lite; (window.__lite3d = window.__lite3d || []).push(P.lite); F = figure(THREE, lo); N3D++; turn.add(F.group); F.group.traverse(m => { if (m.isMesh) m.castShadow = true; }); P.figure = F; };
  const sh = new THREE.Mesh(new THREE.CircleGeometry(.42 * (o.scale || 1), 32), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: .45 }));
  sh.rotation.x = -Math.PI / 2; sh.renderOrder = 1;
  const g = new THREE.Group(); g.add(turn); g.add(sh); Wd.add(g);
  const P = { group: g, figure: null, shadow: sh, pos: [0, 0, 0], facing: 0 };
  const stAt = tt => Object.assign({}, look, fn ? fn(tt) : {});
  Wd.on((t, cam) => {
    const st = stAt(t);
    if (st.hidden) { g.visible = false; return; } g.visible = true; if (!F) build();
    sanPerson(st, mem); g.position.set(mem.x, mem.y, mem.z);
    g.scale.setScalar((o.scale || 1) * mem.s * .95); turn.rotation.y = mem.f;
    sh.position.set(0, .012 - mem.y + (st.groundY || 0), 0); sh.visible = st.shadow !== false;
    // תנוחה = ממוצע של 0.3 השניות האחרונות -> מעברים רכים בין תנועות, ועדיין דטרמיניסטי לפי הזמן
    let acc = pose3d(st, t); for (let k = 1; k <= 3; k++) { const tk = t - k * .1; acc = mixPose(acc, pose3d(stAt(tk), tk), 1 / (k + 1)); }
    const sd = st.seed ?? .37;
    acc.chest = (acc.chest || [0, 0, 0]).map((v, i) => v + (i === 0 ? .018 * Math.sin(t * 1.7 + sd * 9) + (st.gesture === 'pray' ? .07 + .07 * Math.sin(t * 5 + sd * 7) : 0) : 0));
    acc.head = (acc.head || [0, 0, 0]).map((v, i) => v + (i === 1 ? (st.look || 0) * .25 + .06 * Math.sin(t * .6 + sd * 5) : 0));
    F.pose(acc);
    const talk = clamp(st.talk || 0, 0, 1);
    F.face({ blink: ((t + sd * 7) % (3.1 + sd)) < .13 ? 1 : 0, mouth: Math.round(talk * 8) / 8, smile: st.smile ?? .35, brow: Math.round(((st.brow || 0) + talk * .25) * 8) / 8, look: Math.round(clamp(st.look || 0, -1, 1) * 6) / 10 });
  });
  return P;
}
function person2d(Wd, look, fn, o) {
  o = o || {};
  const res = o.res || 2.6, cw = Math.round(U_W * res), chh = Math.round((U_BOT - U_TOP) * res);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = chh; const cx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const sc = (o.scale || 1) * M_PER_U, hw = U_W / 2 * sc;
  const geo = new THREE.PlaneGeometry(U_W * sc, (U_BOT - U_TOP) * sc); geo.translate(0, ((165 - U_BOT) + (U_BOT - U_TOP) / 2) * sc, 0);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: .03, depthWrite: true, side: THREE.DoubleSide, fog: true });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = 2;
  const sh = new THREE.Mesh(new THREE.CircleGeometry(.42 * (o.scale || 1), 32), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: .55 }));
  sh.rotation.x = -Math.PI / 2; sh.renderOrder = 1;
  const g = new THREE.Group(); g.add(m); g.add(sh); Wd.add(g);
  const P = { group: g, plane: m, shadow: sh, pos: [0, 0, 0], facing: 0 }, mem2 = { x: 0, y: 0, z: 0, f: 0, s: 1 };
  Wd.on((t, cam) => {
    const st = Object.assign({}, look, fn ? fn(t) : {});
    if (st.hidden) { g.visible = false; return; } g.visible = true;
    sanPerson(st, mem2); g.position.set(mem2.x, mem2.y, mem2.z);
    sh.position.set(0, .012 - mem2.y + (st.groundY || 0), 0); sh.visible = st.shadow !== false;
    const ca = Math.atan2(cam.position.x - mem2.x, cam.position.z - mem2.z); m.rotation.y = ca;
    const yaw = (mem2.f - ca) / D;
    cx.clearRect(0, 0, cw, chh);
    PEOPLE.person(cx, Object.assign({}, st, { x: cw / 2, y: -U_TOP * res, s: res, yaw: yaw + (st.yawAdd || 0), t, pos: undefined }));
    tex.needsUpdate = true;
    if (st.tint !== undefined) mat.color.setRGB(st.tint, st.tint, st.tint * (st.tintB || 1));
  });
  return P;
}
let BLOB = null;
function blobTex() { if (BLOB) return BLOB; BLOB = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 62); r.addColorStop(0, 'rgba(0,0,0,.75)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); return BLOB; }

// ---------------- תווית עברית בעולם (שלט שפונה למצלמה) ----------------
export function label(Wd, text, o) {
  o = o || {};
  const fs = o.size || 64, pad = fs * .45, font = `${o.weight || 700} ${fs}px ${o.font || 'Assistant, Heebo, sans-serif'}`;
  const m0 = document.createElement('canvas').getContext('2d'); m0.font = font; const tw = m0.measureText(text).width;
  const tex = canvasTex(Math.ceil(tw + pad * 2), Math.ceil(fs * 1.5 + pad), (g, w, h) => {
    if (o.bg !== null) { g.fillStyle = o.bg || 'rgba(20,16,30,.78)'; g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, h * .3); g.fill(); }
    g.font = font; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = fs * .14; g.strokeText(text, w / 2, h / 2 + fs * .05); }
    g.fillStyle = o.color || '#fff'; g.fillText(text, w / 2, h / 2 + fs * .05);
  });
  const k = (o.height || .5) / tex.image.height;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: o.depthTest !== false, fog: false, transparent: true }));
  sp.scale.set(tex.image.width * k, tex.image.height * k, 1); if (o.pos) sp.position.set(...o.pos); sp.renderOrder = 5; Wd.add(sp); return sp;
}

// ---------------- ענן מצויר ----------------
export function cloud(o) {
  o = o || {}; const r = rng(o.seed || 1), g = new THREE.Group(), col = o.color || 0xf7f7f7, n = o.puffs || 7, s = o.size || 3;
  const mat = toon(col);
  for (let i = 0; i < n; i++) { const rr = s * (.45 + r() * .4); const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 20, 14), mat); b.position.set((i - (n - 1) / 2) * s * .55 + (r() - .5) * s * .3, (r() - .2) * s * .35, (r() - .5) * s * .5); b.castShadow = o.cast !== false; ink(b, s * .025, o.inkColor || 0x6a7280); g.add(b); }
  const base = new THREE.Mesh(new THREE.CylinderGeometry(s * n * .27, s * n * .27, s * .35, 24), mat); base.scale.z = .45; base.position.y = -s * .2; ink(base, s * .025, o.inkColor || 0x6a7280); g.add(base);
  if (o.pos) g.position.set(...o.pos); return g;
}

// ---------------- גשם (קווים נופלים, דטרמיניסטי) ----------------
export function rain(Wd, o) {
  o = o || {}; const n = o.count || 1500, r = rng(o.seed || 5), pos = new Float32Array(n * 6), base = [];
  for (let i = 0; i < n; i++) base.push([lerp(o.x0, o.x1, r()), lerp(o.z0, o.z1, r()), r()]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({ color: o.color || 0x9fb8d6, transparent: true, opacity: o.opacity || .7, fog: true });
  const ls = new THREE.LineSegments(geo, mat); ls.frustumCulled = false; Wd.add(ls);
  const top = o.top || 14, bot = o.bottom || 0, sp = o.speed || 14, len = o.len || .45;
  Wd.on(t => {
    const a = o.amount ? o.amount(t) : 1; ls.visible = a > .01; mat.opacity = (o.opacity || .7) * clamp(a * 1.4, 0, 1);
    const off = o.offset ? o.offset(t) : [0, 0];
    for (let i = 0; i < n; i++) { const b = base[i]; const h = top - bot, y = top - ((b[2] * h + t * sp) % h);
      const vis = i < n * a; const yy = vis ? y : -999;
      pos.set([b[0] + off[0], yy, b[1] + off[1], b[0] + off[0] - .06, yy + len, b[1] + off[1]], i * 6); }
    geo.attributes.position.needsUpdate = true;
  });
  return ls;
}

// ---------------- מפת תבליט של ארץ ישראל ----------------
// גובה משוער (מטרים) לפי קו אורך/רוחב: מישור החוף, רכס ההר המרכזי, השקע של הירדן וים המלח, רמת הגולן, הנגב והערבה.
export function relief(lon, lat) {
  const ridgeC = 35.18 + (lat - 31.7) * .07, ridgeA = lat > 32.9 ? 1050 : lat > 32.4 ? 520 : lat > 31.2 ? 900 : 650;
  let h = ridgeA * Math.exp(-Math.pow((lon - ridgeC) / (lat > 32.9 ? .22 : .17), 2));
  if (lat > 32.85 && lat < 33.1) h += 380 * Math.exp(-Math.pow((lon - 35.4) / .1, 2) - Math.pow((lat - 33.0) / .06, 2));   // מירון
  const riftC = lat > 31 ? 35.57 : 35.57 - (31 - lat) * .33, riftD = lat > 32.6 ? -200 : lat > 31.0 ? -390 : -60;
  h += (riftD - h * .9) * Math.exp(-Math.pow((lon - riftC) / .07, 2));
  if (lon > 35.66 && lat > 32.65) h = Math.max(h, 450 + (lat - 32.65) * 600);   // הגולן
  if (lat < 31.2) h = Math.max(h, (lat > 30.2 ? 450 : 300) * Math.exp(-Math.pow((lon - 34.9) / .35, 2)) * (1 - Math.exp(-Math.pow((lon - riftC) / .12, 2))));
  if (lon < 34.75 && lat > 31.4) h *= .25 + .75 * clamp((lon - 34.3) / .45, 0, 1);   // מישור החוף
  h += Math.max(0, h) * (.06 * Math.sin(lon * 47 + lat * 13) + .04 * Math.sin(lon * 23 - lat * 31));
  return h;
}
// כמות גשם שנתית משוערת (מ"מ) — לצביעה של מפת המשקעים
export function rainfall(lon, lat) {
  const h = relief(lon, lat), north = clamp((lat - 29.5) / 3.7, 0, 1);
  let r = 20 + 700 * Math.pow(north, 1.6) + h * .35 * north;
  const ridgeC = 35.18 + (lat - 31.7) * .07; if (lon > ridgeC + .05) r *= clamp(1 - (lon - ridgeC - .05) * 2.6, .2, 1);   // צל גשם
  if (lat > 32.9 && lon > 35.3 && lon < 35.5) r += 250; return Math.max(20, r);
}
export function rainColor(mm) {
  const S = [[0, [150, 105, 60]], [100, [214, 170, 100]], [250, [236, 214, 120]], [450, [140, 190, 110]], [650, [70, 150, 190]], [900, [35, 80, 160]]];
  for (let i = 1; i < S.length; i++) if (mm <= S[i][0]) { const k = (mm - S[i - 1][0]) / (S[i][0] - S[i - 1][0]); return S[i - 1][1].map((v, j) => lerp(v, S[i][1][j], k) / 255); }
  return S[S.length - 1][1].map(v => v / 255);
}
function inPoly(x, y, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if (((a[1] > y) !== (b[1] > y)) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) c = !c; } return c; }
// map3d: מחזיר קבוצה + פונקציות מיקום. 1 יחידה בעולם = 10 ק"מ (רוחב הארץ ~ 2 יחידות... מוגדל ב-scale)
export function map3d(o) {
  o = o || {}; const G = window.GEO, poly = (G.land || G.israel)[0], exag = o.exag || 10, S = o.scale || 1;
  const lon0 = 34.2, lon1 = 35.95, lat0 = 29.45, lat1 = 33.4, KX = 94 * S, KZ = 111 * S;   // יחידה אחת = 10 ק"מ כפול S; גובה מוגזם פי exag
  const X = lon => (lon - (lon0 + lon1) / 2) * KX / 10, Z = lat => -(lat - (lat0 + lat1) / 2) * KZ / 10, Hh = h => h / 10000 * exag * S;
  const NX = o.res || 150, NZ = Math.round(NX * 2.3), pos = [], col = [], idx = [], inside = [];
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    const lon = lerp(lon0, lon1, i / NX), lat = lerp(lat1, lat0, j / NZ), ins = inPoly(lon, lat, poly); inside.push(ins);
    const h = relief(lon, lat); pos.push(X(lon), ins ? Hh(Math.max(h, -420)) + .02 * S : -.05 * S, Z(lat));
    let c;
    if (o.mode === 'rain') c = rainColor(rainfall(lon, lat));
    else { const dz = clamp((h + 100) / 1300, 0, 1), south = clamp((31.3 - lat) / 1.2, 0, 1);
      const green = [.55, .68, .38], brown = [.62, .5, .34], sand = [.86, .74, .52], low = [.66, .74, .45];
      c = [0, 1, 2].map(k => lerp(lerp(low[k], green[k], dz * 1.4 > 1 ? 1 : dz * 1.4), brown[k], clamp((dz - .55) * 1.6, 0, 1)));
      c = c.map((v, k) => lerp(v, sand[k], south * .85 + (h < -100 ? .3 : 0))); }
    col.push(...c);
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1;
    if (inside[a] && inside[b] && inside[c]) idx.push(a, c, b); if (inside[b] && inside[c] && inside[d]) idx.push(b, c, d); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: false });
  const land = new THREE.Mesh(geo, mat); land.castShadow = true; land.receiveShadow = true;
  const grp = new THREE.Group(); grp.add(land);
  // קיר הצד של הלוח (כמו מפה על שולחן)
  const shape = new THREE.Shape(poly.map(p => new THREE.Vector2(X(p[0]), -Z(p[1]))));
  const base = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .35 * S, bevelEnabled: false }), toon(o.baseColor || 0xb59a72));
  base.rotation.x = -Math.PI / 2; base.position.y = -.33 * S; base.receiveShadow = true; ink(base, .02 * S, 0x3a2a1a); grp.add(base);
  // ימים
  // הים התיכון: מקו החוף (הקודקודים הראשונים של המצולע, מעזה עד ראש הנקרה) מערבה
  if (o.sea !== false) { const coast = []; for (const p of poly) { if (coast.length && (p[1] < coast[coast.length - 1][1] - .02 || p[0] > 35.12)) break; coast.push(p); }
    const sp = [[33.75, coast[0][1]], ...coast, [33.75, coast[coast.length - 1][1]]];
    const sea = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(sp.map(q => new THREE.Vector2(X(q[0]), -Z(q[1]))))), new THREE.MeshLambertMaterial({ color: o.seaColor || 0x4f93c6 }));
    sea.rotation.x = -Math.PI / 2; sea.position.y = -.02 * S; sea.receiveShadow = true; grp.add(sea); }
  for (const [name, lk] of Object.entries(G.lakes || {})) { const p = lk[0]; const sh = new THREE.Shape(p.map(q => new THREE.Vector2(X(q[0]), -Z(q[1]))));
    const lake = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshLambertMaterial({ color: 0x3f86c0 })); lake.rotation.x = -Math.PI / 2;
    const c = p.reduce((a, q) => [a[0] + q[0] / p.length, a[1] + q[1] / p.length], [0, 0]); lake.position.y = Hh(relief(c[0], c[1])) + .06 * S; grp.add(lake); }
  for (const [name, rv] of Object.entries(G.rivers || {})) for (const line of rv) {
    const pts = line.map(q => new THREE.Vector3(X(q[0]), Hh(relief(q[0], q[1])) + .05 * S, Z(q[1])));
    if (pts.length < 2) continue; const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 4, .05 * S, 6), new THREE.MeshLambertMaterial({ color: 0x3f86c0 })); grp.add(tube); }
  const at = (lon, lat, lift) => new THREE.Vector3(X(lon), Hh(Math.max(relief(lon, lat), -420)) + (lift || 0), Z(lat));
  return { group: grp, land, X, Z, H: (lon, lat) => Hh(relief(lon, lat)), at, mat, geo, setMode(mode) { const c = geo.attributes.color; for (let k = 0; k <= NZ; k++) for (let i = 0; i <= NX; i++) { const lon = lerp(lon0, lon1, i / NX), lat = lerp(lat1, lat0, k / NZ); const cc = mode === 'rain' ? rainColor(rainfall(lon, lat)) : null; if (cc) c.setXYZ(k * (NX + 1) + i, ...cc); } c.needsUpdate = true; } };
}
export const CITIES = { 'צפת': [35.496, 32.965], 'הר מירון': [35.40, 32.99], 'טבריה': [35.53, 32.79], 'חיפה': [34.99, 32.79], 'תל אביב': [34.78, 32.08],
  'ירושלים': [35.215, 31.778], 'בית שמש': [34.99, 31.75], 'יריחו': [35.45, 31.86], 'באר שבע': [34.79, 31.25], 'אילת': [34.95, 29.56], 'חברון': [35.1, 31.53] };

// ---------------- מצלמה ----------------
export function path(keys) {   // keys: [[t, [x,y,z], [lx,ly,lz], fov?], ...] — מעבר רך (ספליין) בין נקודות
  const P = new THREE.CatmullRomCurve3(keys.map(k => new THREE.Vector3(...k[1])), false, 'centripetal'), L = new THREE.CatmullRomCurve3(keys.map(k => new THREE.Vector3(...k[2])), false, 'centripetal');
  const T = keys.map(k => k[0]), n = keys.length - 1;
  // תנועה רציפה: מאיצים רק בהתחלה ומאטים רק בסוף (לא עוצרים בכל נקודה); שתי נקודות זהות ברצף = עמידה במקום
  if (n < 1) return () => ({ pos: keys[0][1].slice(), look: keys[0][2].slice(), fov: keys[0][3] });
  return t => { t = num(t, T[0]); let i = 0; while (i < n - 1 && t > T[i + 1]) i++; const dT = T[i + 1] - T[i], l = dT > 0 ? clamp((t - T[i]) / dT, 0, 1) : (t >= T[i + 1] ? 1 : 0);
    const m = 1 - l, u = n === 1 ? ease.io(l) : i === 0 ? l * l * (2 - l) : i === n - 1 ? 1 - m * m * (2 - m) : l, f = clamp((i + u) / n, 0, 1);
    const fov = keys[i][3] !== undefined ? lerp(keys[i][3], keys[i + 1][3] !== undefined ? keys[i + 1][3] : keys[i][3], u) : undefined;
    return { pos: P.getPoint(f).toArray(), look: L.getPoint(f).toArray(), fov }; };
}
export function orbit(center, r, h, a0, a1, t0, t1, fov) {   // הקפה סביב נקודה (מעלות)
  return t => { const u = ease.io(prog(t, t0, t1)), a = lerp(a0, a1, u) * D; return { pos: [center[0] + Math.sin(a) * r, center[1] + h, center[2] + Math.cos(a) * r], look: center, fov }; };
}
export function seq(...parts) { return t => { t = num(t, parts[0][0]); for (const [t0, f] of parts.slice().reverse()) if (t >= t0) return f(t); return parts[0][1](t); }; }

// ---------------- שכבת טקסט מעל התמונה (כתוביות, כותרת, סיכום) ----------------
const F_T = '"Secular One", Assistant, sans-serif', F_B = 'Assistant, Heebo, sans-serif';
const rtl = g => { g.direction = 'rtl'; try { g.lang = 'he'; } catch (e) {} };
// קטלוג כתוביות: מפתח שקיים ב-window.CAPTIONS_VAULT מוחלף בערך; אחרת המחרוזת נשארת כמות שהיא
const V = s => { const v = window.CAPTIONS_VAULT; return (v && typeof s === 'string' && Object.prototype.hasOwnProperty.call(v, s)) ? String(v[s]) : s; };
const isKey = s => { const v = window.CAPTIONS_VAULT; return !!(v && typeof s === 'string' && Object.prototype.hasOwnProperty.call(v, s)); };
function txt(g, s, x, y, font, fill, a, align, stroke, lw) { g.save(); g.globalAlpha = a; g.font = font; rtl(g); g.textAlign = align || 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 8; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y); g.restore(); }
function wrap(g, s, font, maxW) { g.font = font; rtl(g); const w = s.split(' '), L = []; let cur = ''; for (const x of w) { const t = cur ? cur + ' ' + x : x; if (g.measureText(t).width > maxW && cur) { L.push(cur); cur = x; } else cur = t; } if (cur) L.push(cur); return L; }
// פריסת כתובית: פונקציה אחת שמשמשת גם לציור וגם ל-window.__caption (g = קנבס מדידה בלבד)
function capLayout(g, W, H, s) {
  if (H > W) {   // portrait (Shorts): box <= .86W, font ~.062W (.05W if >4 lines), bottom edge at .80H (above phone UI), max 4 lines
    const pad = W * .03, maxW = W * .86 - pad * 2; let fs = W * .062, font = `700 ${Math.round(fs)}px ${F_B}`, L = wrap(g, s, font, maxW);
    if (L.length > 4) { fs = W * .05; font = `700 ${Math.round(fs)}px ${F_B}`; L = wrap(g, s, font, maxW); }
    const lh = fs * 1.28, tp = fs * .34, bh = L.length * lh + tp * 2, by = H * .80 - bh;
    let mw = 0; g.font = font; rtl(g); for (const l of L) mw = Math.max(mw, g.measureText(l).width);
    return { font, L, lh, bh, by, mw, tp, r: fs * .36, rect: { x: W / 2 - mw / 2 - pad, y: by, w: mw + pad * 2, h: bh } };
  }
  const font = `700 ${Math.round(H * .05)}px ${F_B}`, L = wrap(g, s, font, W * .78), lh = H * .064, bh = L.length * lh + H * .035, by = H - H * .05 - bh;
  let mw = 0; g.font = font; rtl(g); for (const l of L) mw = Math.max(mw, g.measureText(l).width);
  return { font, L, lh, bh, by, mw, tp: H * .022, r: H * .022, rect: { x: W / 2 - mw / 2 - H * .03, y: by, w: mw + H * .06, h: bh } };
}
let MEASURE = null;
const measureCtx = () => MEASURE || (MEASURE = document.createElement('canvas').getContext('2d'));
function caption(g, W, H, s, a) {
  const Ly = capLayout(measureCtx(), W, H, s), { font, L, lh, bh, by, rect, tp, r } = Ly;
  g.save(); g.globalAlpha = a * .8; g.fillStyle = 'rgba(14,12,26,.82)';
  g.beginPath(); g.roundRect(rect.x, rect.y, rect.w, rect.h, r); g.fill(); g.restore();
  L.forEach((l, i) => txt(g, l, W / 2, by + tp + lh * (i + .78), font, '#fff', a));
}
function titleCard(g, W, H, kicker, title, a, k, vk) {
  g.save(); g.globalAlpha = a * .55 * (vk === undefined ? 1 : vk); g.fillStyle = '#0d0b18'; g.fillRect(0, 0, W, H); g.restore();
  const dy = (1 - ease.out(k)) * H * .04, P = H > W;   // portrait: sizes keyed to W and shrunk to fit .9W
  const fit = (str, px, wt, fam) => { if (!P) return px; g.font = `${wt} ${px}px ${fam}`; rtl(g); const tw = g.measureText(str || '').width; return tw > W * .9 ? px * W * .9 / tw : px; };
  const kpx = fit(kicker, P ? W * .06 : H * .045, 700, F_B), tpx = fit(title, P ? W * .13 : H * .105, 400, F_T);
  txt(g, kicker, W / 2, H * .41 + dy, `700 ${Math.round(kpx)}px ${F_B}`, '#ffd166', a);
  txt(g, title, W / 2, H * .55 + dy, `400 ${Math.round(tpx)}px ${F_T}`, '#fff', a, 'center', 'rgba(10,8,20,.6)', P ? W * .012 : H * .012);
  g.save(); g.globalAlpha = a; g.fillStyle = '#ffd166'; const lw = W * .12 * ease.out(k); g.fillRect(W / 2 - lw / 2, H * .6, lw, H * .007); g.restore();
}
function recapCard(g, W, H, items, a, k) {
  g.save(); g.globalAlpha = a * .7; g.fillStyle = '#0d0b18'; g.fillRect(0, 0, W, H); g.restore();
  if (H > W) {   // portrait recap: sizes keyed to W, rows stacked in the .2H-.75H band, text wrapped to the row
    txt(g, 'מה למדנו?', W / 2, H * .25, `400 ${Math.round(W * .1)}px ${F_T}`, '#ffd166', a);
    const fs = W * .05, rh = H * .1;
    items.forEach((s, i) => { const ki = ease.out(clamp(k * items.length * 1.1 - i, 0, 1)); if (ki <= 0) return; const y = H * .34 + i * H * .14;
      g.save(); g.globalAlpha = a * ki; g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.roundRect(W * .06, y - rh * .5, W * .88, rh, W * .02); g.fill();
      g.fillStyle = '#7bd389'; g.beginPath(); g.arc(W * .87, y, W * .035, 0, 7); g.fill(); g.restore();
      txt(g, '✓', W * .87, y + W * .015, `900 ${Math.round(W * .04)}px ${F_B}`, '#0d2a14', a * ki);
      const L = wrap(g, s, `700 ${Math.round(fs)}px ${F_B}`, W * .72).slice(0, 2), lh = fs * 1.25;
      L.forEach((l, j) => txt(g, l, W * .81, y + fs * .35 - (L.length - 1) * lh / 2 + j * lh, `700 ${Math.round(fs)}px ${F_B}`, '#fff', a * ki, 'right')); });
    return;
  }
  txt(g, 'מה למדנו?', W / 2, H * .25, `400 ${Math.round(H * .085)}px ${F_T}`, '#ffd166', a);
  items.forEach((s, i) => { const ki = ease.out(clamp(k * items.length * 1.1 - i, 0, 1)); if (ki <= 0) return; const y = H * (.4 + i * .14);
    g.save(); g.globalAlpha = a * ki; g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.roundRect(W * .14, y - H * .065, W * .72, H * .1, H * .02); g.fill();
    g.fillStyle = '#7bd389'; g.beginPath(); g.arc(W * .82, y - H * .015, H * .028, 0, 7); g.fill(); g.restore();
    txt(g, '✓', W * .82, y + H * .002, `900 ${Math.round(H * .04)}px ${F_B}`, '#0d2a14', a * ki);
    txt(g, s, W * .78, y, `700 ${Math.round(H * .046)}px ${F_B}`, '#fff', a * ki, 'right'); });
}

// ---------------- סרט: רצף שוטים עם מעברים ----------------
export function film(cfg) {
  const W = cfg.W || 1920, H = cfg.H || 1080, XF = cfg.xf || .6;
  // viewport fix: canvas always fills the viewport width (screenshots/tools see the whole frame)
  if (!document.getElementById('stage3d-viewport')) {
    const stl = document.createElement('style'); stl.id = 'stage3d-viewport';
    stl.textContent = 'html,body{margin:0}canvas{width:100vw !important;height:auto !important;display:block}'; document.head.appendChild(stl);
  }
  const main = document.getElementById('c'); main.width = W; main.height = H; const mg = main.getContext('2d', { willReadFrequently: false });
  const ST = makeStage(W, H), tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tg = tmp.getContext('2d');
  const cams = {}, shots = []; let T0 = 0;
  for (const s of cfg.shots) { const w = s.build(); w.t0 = T0; w.dur = s.dur; w.wide = !!s.wide; w.caps = s.caps || []; w.capAt = s.capAt; w.id = s.id || ('s' + String(shots.length + 1).padStart(2, '0')); w.scene3 = w.scene; shots.push(w); T0 += s.dur; }
  const RC = cfg.recap ? (cfg.recapDur || 9) : 0, DUR = T0 + RC;
  const camera = new THREE.PerspectiveCamera(45, W / H, .05, 2000);
  const lastCam = { pos: [0, 1.6, 6], look: [0, 0, 0], fov: 45, roll: 0 };
  const vec3 = (v, prev, kind) => { const a = Array.isArray(v) ? v : (v && v.toArray ? v.toArray() : []); const o = [0, 1, 2].map(i => fin(a[i], prev[i], kind)); return o; };
  function renderShot(w, lt) {
    const c = w.cam(lt) || {};
    const pos = vec3(c.pos, lastCam.pos, 'camera pos'), look = vec3(c.look, lastCam.look, 'camera look');
    let fov = c.fov ? c.fov : 45; if (!FIN(fov) || fov < 1 || fov > 170) { stageError('camera fov', 'non-finite camera fov at t=' + CUR_T.toFixed(2)); fov = lastCam.fov; }
    lastCam.pos = pos; lastCam.look = look; lastCam.fov = fov;
    camera.position.set(...pos); camera.lookAt(...look); camera.fov = fov; camera.updateProjectionMatrix();
    if (c.roll) camera.rotateZ(fin(c.roll, 0, 'camera roll'));
    for (const f of w.updaters) f(lt, camera); if (w.update) w.update(lt, camera);
    ST.renderer.render(w.scene, camera);
  }
  function capsAt(w, lt) {
    const n = w.caps.length; if (!n) return null; const lead = .5, per = (w.dur - lead - .4) / n;
    for (let i = n - 1; i >= 0; i--) { const t0 = w.capAt ? w.capAt[i] : lead + i * per, t1 = w.capAt ? (w.capAt[i + 1] || w.dur - .3) : t0 + per - .15;
      if (lt >= t0 && lt < t1) return { s: w.caps[i], a: clamp((lt - t0) / .3, 0, 1) * clamp((t1 - lt) / .3, 0, 1) }; }
    return null;
  }
  function locate(t) {
    const tt = Math.min(t, T0 - .001); let i = 0; while (i < shots.length - 1 && tt >= shots[i + 1].t0) i++;
    return { tt, i, w: shots[i], lt: tt - shots[i].t0 };
  }
  function debugOverlay(g, t, shot) {
    g.save(); g.lineWidth = Math.max(1, H / 540);
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.beginPath();
    for (const k of [1 / 3, 2 / 3]) { g.moveTo(W * k, 0); g.lineTo(W * k, H); g.moveTo(0, H * k); g.lineTo(W, H * k); } g.stroke();
    g.strokeStyle = 'rgba(0,255,120,.9)'; g.setLineDash([H / 54, H / 108]);
    if (H > W) g.strokeRect(W * .07, H * .56, W * .86, H * .24);     // portrait: caption zone (max .86W, bottom edge .80H above phone UI)
    else g.strokeRect(W * .11, H * .78, W * .78, H * .17);           // safe caption zone (max width .78W, bottom .05H margin)
    g.strokeStyle = 'rgba(255,200,0,.7)'; g.strokeRect(W * .05, H * .05, W * .9, H * .9);   // title-safe
    g.setLineDash([]); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(6, 6, H * .4, H * .045);
    g.fillStyle = '#7CFF9B'; g.font = `700 ${Math.round(H * .03)}px monospace`; g.direction = 'ltr'; g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillText('t=' + t.toFixed(2) + ' shot=' + shot, 12, 9); g.restore();
  }
  function frame(t) {
    t = num(t, 0); CUR_T = t;
    const { tt, i, w, lt } = locate(t);
    if (i > 0 && lt < XF) { renderShot(shots[i - 1], tt - shots[i - 1].t0); tg.drawImage(ST.glc, 0, 0); renderShot(w, lt);
      mg.drawImage(tmp, 0, 0); mg.globalAlpha = ease.sm(lt / XF); mg.drawImage(ST.glc, 0, 0); mg.globalAlpha = 1; }
    else { renderShot(w, lt); mg.drawImage(ST.glc, 0, 0); }
    // film badge in the corner
    const ttl = cfg.title ? V(cfg.title) : null;
    if (ttl) { const u = H > W ? W * 9 / 16 : H; mg.save(); mg.globalAlpha = .85; mg.font = `700 ${Math.round(u * .028)}px ${F_B}`; rtl(mg); const tw = mg.measureText(ttl).width; mg.fillStyle = 'rgba(14,12,26,.7)';
      mg.beginPath(); mg.roundRect(W - tw - u * .085, u * .03, tw + u * .055, u * .05, u * .015); mg.fill(); mg.restore(); txt(mg, ttl, W - u * .058, u * .065, `700 ${Math.round(u * .028)}px ${F_B}`, '#ffd166', .95, 'right'); }
    if (t < T0) { const c = capsAt(w, lt); if (c) caption(mg, W, H, V(c.s), c.a); }
    if (cfg.kicker && t < 4.2) { const a = clamp(t / .4, 0, 1) * clamp((4.2 - t) / .6, 0, 1); titleCard(mg, W, H, V(cfg.kicker), ttl, a, clamp(t / 1.2, 0, 1), cfg.veilEnd ? clamp(1 - (t - .4) / (cfg.veilEnd - .4), 0, 1) : undefined); }
    if (RC && t > T0 - .8) { const k = clamp((t - T0 + .8) / .8, 0, 1); recapCard(mg, W, H, cfg.recap.map(V), k, clamp((t - T0) / (RC * .55), 0, 1)); }
    if (cfg.fadeIn !== false && t < .5) { mg.fillStyle = `rgba(0,0,0,${1 - t / .5})`; mg.fillRect(0, 0, W, H); }
    if (t > DUR - .6) { mg.fillStyle = `rgba(0,0,0,${clamp((t - DUR + .6) / .6, 0, 1)})`; mg.fillRect(0, 0, W, H); }
    if (window.__debug) debugOverlay(mg, t, t >= T0 ? 'recap' : w.id);
  }
  // __T0: part of a film (parallel render on several servers) - the page starts at this second
  const OFF = window.__T0 || 0;
  const seek = t => frame(Math.max(0, num(t, 0) + OFF));
  window.__dur = DUR; window.__seek = seek; window.__recapStart = T0;
  // ---- runtime contract (CONTRACT.md) ----
  window.__shots = (() => {
    const a = []; if (cfg.kicker) a.push({ id: 'title', index: 0, start: 0, dur: 4.2, end: 4.2, t0: 0, caps: [], capAt: null, card: true, shotIndex: -1 });
    shots.forEach((w, k) => a.push({ id: w.id, index: a.length, start: w.t0, dur: w.dur, end: w.t0 + w.dur, t0: w.t0, caps: w.caps.map(V), capAt: w.capAt || null, wide: !!w.wide, shotIndex: k }));
    if (RC) a.push({ id: 'recap', index: a.length, start: T0, dur: RC, end: DUR, t0: T0, caps: [], capAt: null, card: true, shotIndex: -1 });
    return a; })();
  const cssScale = () => { const r = main.getBoundingClientRect(); return { k: (r.width || W) / W, cw: r.width || W, ch: r.height || H }; };
  window.__caption = t => {
    t = Math.max(0, num(t, 0) + OFF); if (t >= T0) return null;
    const { w, lt } = locate(t), c = capsAt(w, lt); if (!c) return null;
    const text = V(c.s), L = capLayout(measureCtx(), W, H, text), { k, cw, ch } = cssScale();
    return { id: isKey(c.s) ? c.s : null, text, rect: { x: L.rect.x * k, y: L.rect.y * k, w: L.rect.w * k, h: L.rect.h * k }, canvasW: cw, canvasH: ch, dir: 'rtl', lang: 'he', alpha: c.a };
  };
  const heroOf = w => {
    const h = w.hero || cfg.hero; if (h) return h;
    const ps = PERSONS.get(w.scene3 || w.scene); return ps && ps[0] || null;
  };
  window.__heroBox = t => {
    const tt = Math.max(0, num(t, 0) + OFF); frame(tt);   // renders at t so camera + poses are current
    const { w } = locate(tt), hero = heroOf(w); if (!hero) return null;
    const obj = (hero.figure && hero.figure.group) || hero.plane || hero.group || hero; if (!obj || !obj.updateWorldMatrix) return null;
    const bx = new THREE.Box3().setFromObject(obj, true); if (bx.isEmpty()) return null;
    const { k, cw, ch } = cssScale(); camera.updateMatrixWorld();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, front = 0, vp = new THREE.Vector3();
    for (let m = 0; m < 8; m++) {
      vp.set(m & 1 ? bx.max.x : bx.min.x, m & 2 ? bx.max.y : bx.min.y, m & 4 ? bx.max.z : bx.min.z).applyMatrix4(camera.matrixWorldInverse);
      if (vp.z >= -camera.near) continue;   // behind (or on) the camera plane
      front++; vp.applyMatrix4(camera.projectionMatrix);
      const px = (vp.x * .5 + .5) * cw, py = (1 - (vp.y * .5 + .5)) * ch; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
    }
    const g = hero.group || obj, shown = g.visible !== false;
    if (!front) return { x: 0, y: 0, w: 0, h: 0, visible: false, behindCamera: true, heightFrac: 0 };
    const vis = shown && x1 > 0 && x0 < cw && y1 > 0 && y0 < ch;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, visible: vis, behindCamera: false, heightFrac: (y1 - y0) / ch, partlyBehind: front < 8 };
  };
  window.__sceneHash = () => {
    const hw = H > W ? 108 : 192, hh = H > W ? 192 : 108, c = document.createElement('canvas'); c.width = hw; c.height = hh; const g = c.getContext('2d'); g.drawImage(main, 0, 0, hw, hh);
    const d = g.getImageData(0, 0, hw, hh).data; let h = 0x811c9dc5;
    for (let j = 0; j < d.length; j++) { h ^= d[j]; h = Math.imul(h, 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  };
  const loadJSON = url => new Promise((res, rej) => {
    const xhr = () => { const r = new XMLHttpRequest(); r.open('GET', url); r.onload = () => { try { res(JSON.parse(r.responseText)); } catch (e) { rej(e); } }; r.onerror = () => rej(new Error('xhr failed')); r.send(); };
    if (location.protocol === 'file:') return xhr();
    fetch(url).then(r => r.json()).then(res, xhr);
  });
  const vaultP = cfg.vault ? loadJSON(cfg.vault).then(v => { window.CAPTIONS_VAULT = Object.assign(window.CAPTIONS_VAULT || {}, v); })
    .catch(e => console.error('[STAGE3D_ERROR] vault load failed: ' + cfg.vault)) : Promise.resolve();
  Promise.all([document.fonts.load(`400 40px "Secular One"`), document.fonts.load(`700 40px Assistant`)]).catch(() => {}).then(() => vaultP).then(() => { frame(0); window.__ready = true; });
}
