/* film_e core: renderer, scene, skies, actors, HUD, helpers. Deterministic (function of t only). ASCII only. */
import { THREE, sm, cl, kf, D2R, frac, V, toon, part, ell, tube, lathe, tubeAlong, leafGeo, cone, OL } from '../../../lib/toon3d/toon3d.js';
import * as KT from '../../toldot07_kit/kit07.js';
import { makeRabbiA, makeBoy } from '../../haredi_cast/cast_people.js';
import * as KP from '../../haredi_cast/props_lesson.js';
import * as L from './e_lib.js';
import * as P from './e_props.js';
export { THREE, sm, cl, kf, D2R, frac, V, KT, KP, L, P, toon, part, ell, tube, lathe, tubeAlong, leafGeo, cone, OL };
export const { ease, lerp, lerpv, blinkAt, G, bx } = L;
const { M, rng } = KT;

export const Q = new URLSearchParams(location.search);
export const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
export const W = Q.has('w') ? +Q.get('w') : (HQ ? 1920 : 1280), H = Math.round(W * 9 / 16);
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.autoClear = false;
renderer.setClearColor('#bfe6f7', 1);
document.getElementById('wrap').appendChild(renderer.domElement);
export const scene = new THREE.Scene();
export const cam = new THREE.PerspectiveCamera(32, 16 / 9, 5, 60000);
export const ST = { t: 0, warm: false, faces: new Map() };

/* ---------------------------------------------------------------- gradient skies (night / underwater) */
function gradSky(stops, stars) {
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, depthTest: false,
    uniforms: { c0: { value: new THREE.Color(stops[0][1]) }, c1: { value: new THREE.Color(stops[1][1]) }, c2: { value: new THREE.Color(stops[2][1]) }, c3: { value: new THREE.Color(stops[3][1]) }, y: { value: new THREE.Vector4(...stops.map(s => s[0])) } },
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 c0, c1, c2, c3; uniform vec4 y; varying vec3 vD;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      void main(){ vec3 d = normalize(vD); float v = d.y; vec3 c = mix(c0, c1, smoothstep(y.x, y.y, v)); c = mix(c, c2, smoothstep(y.y, y.z, v)); c = mix(c, c3, smoothstep(y.z, y.w, v));
        ${stars ? 'vec3 q = floor(d * 140.0); float s = step(0.9965, h(q)) * smoothstep(0.08, 0.35, v); c += vec3(1.0, 0.97, 0.85) * s;' : ''}
        gl_FragColor = vec4(c, 1.0); }` });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(30000, 24, 14), m); mesh.renderOrder = -1000; mesh.frustumCulled = false; return mesh;
}
export const SKY = { day: KT.makeSky({ palette: 'day' }), winter: KT.makeSky({ palette: 'winter' }),
  night: gradSky([[-0.2, '#14224e'], [0.02, '#1c3566'], [0.3, '#12234f'], [0.9, '#0a1334']], true),
  under: gradSky([[-0.9, '#16588c'], [-0.1, '#2c86bb'], [0.35, '#5ec0dc'], [1.0, '#b6ecf6']], false),
  dusk: gradSky([[-0.2, '#f6a86a'], [0.08, '#ec8c7c'], [0.34, '#6e6aa8'], [0.9, '#2c3c7a']], false),
  dawn: gradSky([[-0.2, '#f6b87a'], [0.05, '#f4c48a'], [0.3, '#9cc4e0'], [0.9, '#5a9ad0']], false) };
Object.values(SKY).forEach(s => { s.visible = false; scene.add(s); });

/* ---------------------------------------------------------------- worlds registry */
export const WORLD = {};
export const addWorld = (name, g, sky, extra) => { g.visible = false; scene.add(g); WORLD[name] = Object.assign({ g, sky, upd: () => { } }, extra || {}); return WORLD[name]; };
export const gy = (x, z) => z < 0 ? -20 : Math.min(z * 0.03, 30) + 18 * Math.sin(x * 0.004) * Math.sin(z * 0.006) * sm(z / 600);

/* ---------------------------------------------------------------- actors */
export const AC = {};
export const reg = (id, o, people) => { AC[id] = { id, o, people: !!people }; scene.add(o.root); o.root.visible = false; return AC[id]; };
reg('rabbi', makeRabbiA(), true); reg('boy', makeBoy(), true);
reg('tipa', KT.makeTipa()); reg('tipaB', KT.makeTipa({ kind: 'sea' })); reg('tipaS', KT.makeTipa({ kind: 'small' })); reg('tipaC', KT.makeTipa());
reg('crab', KT.makeCrab());
const FC = { f0: { body: '#4f9fe0', belly: '#ffd45a', fin: '#f08a3c' }, f1: { body: '#f08a3c', belly: '#ffe6a0', fin: '#e0513c' }, f2: { body: '#55b87a', belly: '#e8f4b0', fin: '#2f8a6a' },
  f3: { body: '#8a6ad8', belly: '#f4e0ff', fin: '#d95fa0' }, f4: { body: '#ffd45a', belly: '#fff6c8', fin: '#f08a3c' }, f5: { body: '#e86a8a', belly: '#ffd8e0', fin: '#a84a9a' }, f6: { body: '#3f6ad8', belly: '#bfe0ff', fin: '#ffd45a' } };
for (const k in FC) reg(k, KT.makeFish(FC[k]));
reg('dolphin', P.makeDolphin());
reg('turtle', P.makeTurtle(false));
for (let i = 0; i < 8; i++) reg('baby' + i, P.makeTurtle(true));
export const hideAuto = [];
export const AUTOHIDE = [];
export const ENVP = { p: null };

export const cupHand = P.makeCup(); AC.boy.o.arms[1].wr.add(cupHand); cupHand.position.set(0, -14, 0); cupHand.rotation.set(0, 0, 0); cupHand.visible = false; cupHand.scale.setScalar(0.9);
/* soft foreground blurs */
export const fgGrass = KT.makeFgBlur('grass', { w: 260, h: 160, col: '#6f9a4a', blur: 7 }), fgRock = KT.makeFgBlur('rock', { w: 260, h: 170, col: '#6b655c', blur: 8 }), fgLeaves = KT.makeFgBlur('leaves', { w: 260, h: 170, col: '#5a8a46', blur: 7 });
export const fgWeed = KT.makeFgBlur('leaves', { w: 260, h: 170, col: '#2f8a63', blur: 7 }), fgReef = KT.makeFgBlur('rock', { w: 260, h: 170, col: '#a85a5a', blur: 8 }), fgDark = KT.makeFgBlur('rock', { w: 260, h: 170, col: '#1c2a44', blur: 8 });
[fgGrass, fgRock, fgLeaves, fgWeed, fgReef, fgDark].forEach(f => { f.visible = false; scene.add(f); });
export const FGM = { grass: fgGrass, rock: fgRock, leaves: fgLeaves, weed: fgWeed, reef: fgReef, dark: fgDark };

/* ---------------------------------------------------------------- put actors (warm mode records face states) */
const qlook = l => l ? [Math.round(l[0] * 4) / 4, Math.round(l[1] * 4) / 4] : [0, 0];
export function put(id, po, face) {
  const a = AC[id]; face = Object.assign({}, face); if (face.look) face.look = qlook(face.look);
  if (ST.warm) { if (a.o.noFace) return; const k = id + JSON.stringify(face); if (!ST.faces.has(k)) ST.faces.set(k, [a, face]); return; }
  a.o.pose(Object.assign({ t: ST.t }, po)); if (a.people) a.o.root.position.y = po.y || 0;
  a.o.root.visible = true; if (!a.o.noFace) a.o.root.scale.setScalar(po.scale || 1); a.o.face.set(face);
}
export const talk = (t, a, b, rate) => (t > a && t < b && frac(t * 0.9) < 0.74) ? 'AEOXUM'[Math.floor(t * (rate || 9)) % 6] : null;
export const hideAll = () => { Object.values(AC).forEach(a => { a.o.root.visible = false; }); AUTOHIDE.forEach(o => { o.visible = false; }); [fgGrass, fgRock, fgLeaves, fgWeed, fgReef, fgDark].forEach(o => o.visible = false); };

/* ---------------------------------------------------------------- HUD (2D overlay drawn per frame) */
export const hudCv = document.createElement('canvas'); hudCv.width = W; hudCv.height = H;
export const hx = hudCv.getContext('2d');
const hudTex = new THREE.CanvasTexture(hudCv); hudTex.colorSpace = THREE.NoColorSpace;
const hudScene = new THREE.Scene(), hudCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
export const hudMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: hudTex, transparent: true, depthTest: false, depthWrite: false })); hudScene.add(hudMesh);
export const HUD = { on: false };
export const scr = v => { const p = (Array.isArray(v) ? V(...v) : v.clone()).project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z]; };
export function hudBegin() { hx.clearRect(0, 0, W, H); HUD.on = false; }
export function hudEnd() { hudMesh.visible = HUD.on; if (HUD.on) hudTex.needsUpdate = true; }
export function renderHud() { if (!HUD.on) return; renderer.clearDepth(); renderer.render(hudScene, hudCam); }
export const px = v => v * W / 1920;
export function txt(s, x, y, size, o) { o = o || {}; HUD.on = true; hx.save(); hx.translate(x, y); hx.scale(o.k || 1, o.k || 1); hx.font = `900 ${px(size)}px "Arial Black", Arial, sans-serif`; hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.lineJoin = 'round';
  hx.lineWidth = px(size) * 0.22; hx.strokeStyle = '#261c19'; hx.strokeText(s, 0, 0); hx.fillStyle = o.col || '#fff6d6'; hx.fillText(s, 0, 0); hx.restore(); }
/* full-screen tint (alpha 0..1) with an optional bright hole around screen point (cx, cy, r) */
export function tint(col, a, hole) { if (a <= 0.003) return; HUD.on = true; hx.save(); hx.fillStyle = col; hx.globalAlpha = a; hx.fillRect(0, 0, W, H);
  if (hole) { hx.globalCompositeOperation = 'destination-out'; const g = hx.createRadialGradient(hole[0], hole[1], 0, hole[0], hole[1], hole[2]); g.addColorStop(0, `rgba(0,0,0,${hole[3] == null ? 0.85 : hole[3]})`); g.addColorStop(1, 'rgba(0,0,0,0)'); hx.globalAlpha = 1; hx.fillStyle = g; hx.fillRect(0, 0, W, H); }
  hx.restore(); }
export function glowAt(x, y, r, col, a) { HUD.on = true; hx.save(); hx.globalCompositeOperation = 'lighter'; const g = hx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); hx.globalAlpha = a == null ? 1 : a; hx.fillStyle = g; hx.fillRect(x - r, y - r, 2 * r, 2 * r); hx.restore(); }
