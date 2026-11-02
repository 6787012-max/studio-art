// watch.js - the antique pocket-watch character (an OBJECT with a live face; approved house style, dignified and curious, never childish).
//   const w = makeWatch(Wd, {scale: 1, lines: chapter.lines, mouth: null})
//   w.obj                       THREE.Group (face +z, bow ring up +y). Put it on a table, rotate it (obj.rotation.y) to look somewhere.
//   w.set({talk, lid, brow, look:[x,y], blink, eyes, shape, bob, nod})   direct control (everything 0..1 unless noted)
//   w.auto(t, over)             derives talk / blink / brow / head-bob from the timeline (watch lines) or from mouth.json, then calls set(...over)
// talk(t): watch lines (speaker 'watch') -> syllable rhythm ~5 Hz from rng with pauses at word gaps; if opts.mouth = {lineId:{t0, v:[per-frame 0..1]}}
// (mouth.json, 30 fps) has the line, that wins. Pure functions of t. Never any text on the object (the dial shows eyes, moustache-hands, mouth).
import * as THREE from 'three';
import { toon, ink, mesh, rng } from '../../../lib/stage3d.js';
import { wordSpans } from './caption3d.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), D2R = Math.PI / 180;
const vaultText = k => { const v = window.CAPTIONS_VAULT; return (v && typeof k === 'string' && Object.prototype.hasOwnProperty.call(v, k)) ? String(v[k]) : String(k); };

// optional: fetch mouth.json (call only when the file is known to exist, e.g. c1.html?mouth=mouth.json; a probe of a missing file would log a failed request)
export function loadMouth(url) {
  return new Promise(res => { try { const x = new XMLHttpRequest(); x.open('GET', url); x.onload = () => { try { res(JSON.parse(x.responseText)); } catch (e) { res(null); } }; x.onerror = () => res(null); x.send(); } catch (e) { res(null); } });
}

// ---------------------------------------------------------------- face painting (1024 canvas, centre 512,512, dial radius ~470)
const CX = 512, ink0 = '#23150a';
function paintFace(c, s) {
  c.clearRect(0, 0, 1024, 1024);
  let g = c.createRadialGradient(CX, 470, 40, CX, CX, 500); g.addColorStop(0, '#fbf1d6'); g.addColorStop(.75, '#efdcae'); g.addColorStop(1, '#d9bd7e');
  c.fillStyle = g; c.beginPath(); c.arc(CX, CX, 480, 0, 7); c.fill();
  // fine engraved rings
  c.strokeStyle = 'rgba(90,58,20,.55)'; c.lineWidth = 3; [468, 452, 380].forEach(r => { c.beginPath(); c.arc(CX, CX, r, 0, 7); c.stroke(); });
  c.strokeStyle = 'rgba(90,58,20,.35)'; c.lineWidth = 2; c.setLineDash([3, 9]); c.beginPath(); c.arc(CX, CX, 460, 0, 7); c.stroke(); c.setLineDash([]);
  // minute track + hour marks (thin, engraved)
  c.strokeStyle = '#6a4a1c'; c.lineCap = 'round';
  for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, big = i % 5 === 0, r0 = big ? 400 : 424, r1 = 446; c.lineWidth = big ? 6 : 2; c.beginPath(); c.moveTo(CX + Math.sin(a) * r0, CX - Math.cos(a) * r0); c.lineTo(CX + Math.sin(a) * r1, CX - Math.cos(a) * r1); c.stroke(); }
  // faint roman numerals (Latin letters) behind the face
  c.save(); c.globalAlpha = .17; c.fillStyle = '#4a2e10'; c.font = '700 74px "Times New Roman", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'ltr';
  ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((t, i) => { const a = i * Math.PI / 6, r = 330; c.fillText(t, CX + Math.sin(a) * r, CX - Math.cos(a) * r); }); c.restore();
  // eyes: almond, heavy upper lids (about a quarter of the iris is always covered), small pupils
  const open = clamp(s.eyes, 0, 1) * (1 - clamp(s.blink, 0, 1));
  [-1, 1].forEach(side => {
    const ex = CX + side * 148, ey = 430, rx = 92, ry = 58;
    c.save(); c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, 7); c.clip();
    c.fillStyle = '#f7f1e2'; c.fillRect(ex - rx, ey - ry, rx * 2, ry * 2);
    const ix = ex + s.look[0] * 34, iy = ey + 4 + s.look[1] * 24;
    let ig = c.createRadialGradient(ix, iy, 6, ix, iy, 44); ig.addColorStop(0, '#c98a2a'); ig.addColorStop(.65, '#7a4510'); ig.addColorStop(1, '#3a200a');
    c.fillStyle = ig; c.beginPath(); c.arc(ix, iy, 44, 0, 7); c.fill();
    c.fillStyle = '#120a04'; c.beginPath(); c.arc(ix, iy, 19, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(ix - 13, iy - 14, 7, 0, 7); c.fill();
    const cover = clamp(.27 + (1 - open) * .73, 0, 1), yEdge = ey - ry + ry * 2 * cover;
    c.fillStyle = '#d9b564'; c.beginPath(); c.moveTo(ex - rx - 4, ey - ry - 8); c.lineTo(ex + rx + 4, ey - ry - 8); c.lineTo(ex + rx + 4, yEdge - side * 3);
    c.quadraticCurveTo(ex, yEdge + 12 * (1 - cover) + 4, ex - rx - 4, yEdge + side * 3); c.closePath(); c.fill();
    c.strokeStyle = ink0; c.lineWidth = 7; c.beginPath(); c.moveTo(ex + rx + 4, yEdge - side * 3); c.quadraticCurveTo(ex, yEdge + 12 * (1 - cover) + 4, ex - rx - 4, yEdge + side * 3); c.stroke();
    c.restore();
    c.strokeStyle = ink0; c.lineWidth = 7; c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, 7); c.stroke();
    // thin curved brow; brow -1..1 (raised and arched when positive)
    const b = clamp(s.brow, -1, 1), by = ey - ry - 40 - b * 26;
    const innerY = by + 8 + (b < 0 ? -b * 20 : -b * 4), outerY = by + 12 + b * 6;
    c.strokeStyle = '#3a2210'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - side * 100, innerY);
    c.quadraticCurveTo(ex + side * 10, by - 26 - b * 14, ex + side * 108, outerY); c.stroke();
  });
  // moustache-hands
  const sway = s.talk * 6, mp = 566;
  c.lineCap = 'round'; c.lineJoin = 'round';
  [-1, 1].forEach(side => {
    const w = (lw, col) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(CX, mp);
      c.bezierCurveTo(CX + side * 70, mp + 22 + sway, CX + side * 150, mp + 14, CX + side * 206, mp - 6 - sway * .6);
      c.bezierCurveTo(CX + side * 240, mp - 18, CX + side * 250, mp - 50, CX + side * 228, mp - 64); c.stroke(); };
    w(28, ink0); w(17, '#5a3a14'); w(5, '#c9964a');
  });
  c.fillStyle = ink0; c.beginPath(); c.arc(CX, mp, 20, 0, 7); c.fill(); c.fillStyle = '#e4b24a'; c.beginPath(); c.arc(CX, mp, 12, 0, 7); c.fill();
  // mouth: clearly readable opening, from a calm closed line to a wide open mouth
  const mx = CX, my = 730, tk = clamp(s.talk, 0, 1), wid = 78 * (1 - .28 * s.shape) + tk * 10, hgt = 4 + tk * 112 * (.8 + .3 * s.shape);
  if (tk < .05) { c.strokeStyle = ink0; c.lineWidth = 11; c.beginPath(); c.moveTo(mx - 78, my + 6); c.quadraticCurveTo(mx, my + 26 + s.smile * 14, mx + 78, my + 6); c.stroke(); }
  else {
    const cy = my + hgt * .55;
    c.fillStyle = '#4a1010'; c.beginPath(); c.ellipse(mx, cy, wid, hgt, 0, 0, 7); c.fill();
    c.save(); c.beginPath(); c.ellipse(mx, cy, wid, hgt, 0, 0, 7); c.clip();
    c.fillStyle = '#e8837a'; c.beginPath(); c.ellipse(mx, cy + hgt * .7, wid * .7, hgt * .5, 0, 0, 7); c.fill();
    if (hgt > 28) { c.fillStyle = '#fffdf2'; c.fillRect(mx - wid * .8, cy - hgt, wid * 1.6, hgt * .28); }
    c.restore(); c.strokeStyle = ink0; c.lineWidth = 10; c.beginPath(); c.ellipse(mx, cy, wid, hgt, 0, 0, 7); c.stroke();
  }
}

function faceTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { cv, ctx: cv.getContext('2d'), tex: t };
}

// ---------------------------------------------------------------- the object
export function makeWatch(Wd, o) {
  o = o || {};
  const S = o.scale || 1, R = .5;
  const obj = new THREE.Group(), body = new THREE.Group(); obj.add(body); body.scale.setScalar(S);
  const GOLD = 0xd9a21f, GOLD_L = 0xf2c84a, GOLD_D = 0x9a6a12;
  // case: thick disc, axis = z
  const caseM = mesh(new THREE.CylinderGeometry(R, R, .2, 56), toon(GOLD), { inkW: .018, rot: [Math.PI / 2, 0, 0] }); body.add(caseM);
  const rim = mesh(new THREE.TorusGeometry(R * .96, .05, 14, 64), toon(GOLD_L), { inkW: .012, pos: [0, 0, .09] }); body.add(rim);
  const rimB = mesh(new THREE.TorusGeometry(R * .96, .05, 14, 64), toon(GOLD_D), { inkW: .012, pos: [0, 0, -.09] }); body.add(rimB);
  const ft = faceTexture();
  const dial = new THREE.Mesh(new THREE.CircleGeometry(R * .93, 72), new THREE.MeshBasicMaterial({ map: ft.tex })); dial.position.z = .106; body.add(dial);
  const glint = new THREE.Mesh(new THREE.CircleGeometry(R * .93, 40), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: .0, color: 0xffffff }));
  glint.position.z = .112; body.add(glint);
  // crown + bow + chain
  body.add(mesh(new THREE.CylinderGeometry(.075, .085, .14, 18), toon(GOLD_L), { inkW: .012, pos: [0, R + .06, 0] }));
  body.add(mesh(new THREE.CylinderGeometry(.1, .1, .05, 18), toon(GOLD_D), { inkW: .01, pos: [0, R + .14, 0] }));
  const bow = mesh(new THREE.TorusGeometry(.17, .04, 14, 36), toon(GOLD_L), { inkW: .012, pos: [0, R + .33, 0] }); body.add(bow);
  const chain = new THREE.Group(); body.add(chain);
  const links = [], NL = 16; for (let i = 0; i < NL; i++) { const l = mesh(new THREE.TorusGeometry(.055, .017, 8, 16), toon(i % 2 ? GOLD : GOLD_L), { inkW: .006, rot: [0, i % 2 ? 0 : Math.PI / 2, 0] }); l.scale.set(1, 1.5, 1); chain.add(l); links.push(l); }
  const chainPos = i => { const u = i / (NL - 1); // from bow top, arcing out and down to the table (local units)
    return [Math.sin(u * 2.4) * .62 + .08, R + .52 - u * u * 1.42 - u * .1, Math.sin(u * 3.0) * .18 + u * .28]; };
  links.forEach((l, i) => { const p = chainPos(i), q = chainPos(Math.min(NL - 1, i + 1)); l.position.set(...p); l.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2; });
  // hinged front lid (hinge on the left edge): decorative engraved cover
  const hinge = new THREE.Group(); hinge.position.set(-R * 1.0, 0, .17); body.add(hinge);
  const lidPivot = new THREE.Group(); lidPivot.position.set(R * 1.0, 0, 0); hinge.add(lidPivot);
  const lid = mesh(new THREE.CylinderGeometry(R * 1.02, R * 1.02, .07, 56), toon(GOLD), { inkW: .016, rot: [Math.PI / 2, 0, 0] }); lidPivot.add(lid);
  [.82, .6, .34].forEach((k, i) => lidPivot.add(mesh(new THREE.TorusGeometry(R * k, .014, 8, 56), toon(i % 2 ? GOLD_D : GOLD_L), { inkW: .004, pos: [0, 0, .04] })));
  lidPivot.add(mesh(new THREE.SphereGeometry(.07, 14, 10), toon(0xc0392b), { inkW: .008, pos: [0, 0, .06] }));
  hinge.add(mesh(new THREE.CylinderGeometry(.04, .04, .5, 12), toon(GOLD_D), { inkW: .008, pos: [0, 0, 0] }));
  body.children.forEach(m => { m.castShadow = true; });

  const st = { talk: 0, lid: 0, brow: 0, look: [0, 0], blink: 0, eyes: 1, shape: 0, smile: 0, bob: 0, nod: 0 };
  function set(p) {
    if (p) { for (const k in p) if (p[k] !== undefined) st[k] = p[k]; }
    st.look = Array.isArray(st.look) ? st.look : [0, 0];
    hinge.rotation.y = -clamp(st.lid, 0, 1) * 120 * D2R;
    body.position.y = st.bob * .03 * S; body.rotation.x = st.nod * -.06;
    glint.material.opacity = .0;
    paintFace(ft.ctx, st); ft.tex.needsUpdate = true;
  }
  set({});

  // ---- timeline-driven behaviour
  const lines = (o.lines || []).filter(l => l.cap && l.speaker === 'watch'), mouth = o.mouth || null, FPS = o.fps || 30;
  const info = lines.map((l, k) => { const text = vaultText(l.cap); const sp = wordSpans(l, text, .97);
    const syl = sp.map((s, i) => { const n = Math.max(1, Math.round(s.text.length / 2.6)), r = rng(900 + k * 131 + i * 17); const amps = []; for (let j = 0; j < n; j++) amps.push(.55 + r() * .45); return { n, amps }; });
    return { l, text, sp, syl, q: /\?\s*$/.test(text) }; });
  function talkAt(t) {
    let talk = 0, shape = 0, stress = 0, q = 0, active = null;
    for (const L of info) {
      if (t < L.l.t0 - .05 || t > L.l.t1 + .35) continue; active = L;
      if (L.q && t >= L.l.t0 - .3 && t <= L.l.end + .6) q = 1;
      if (mouth && mouth[L.l.id]) { const m = mouth[L.l.id], i = Math.floor((t - m.t0) * FPS); talk = i >= 0 && i < m.v.length ? clamp(m.v[i], 0, 1) : 0; shape = (Math.floor((t - m.t0) * 6) % 2) * .8; }
      else for (let i = 0; i < L.sp.length; i++) {
        const s = L.sp[i]; if (t < s.t0 || t >= s.t1) continue;
        const u = (t - s.t0) / (s.t1 - s.t0), n = L.syl[i].n, body = .86;   // last 14 % of a word = closed (word gap)
        if (u < body) { const x = u / body * n, j = Math.min(n - 1, Math.floor(x)), f = x - j; talk = L.syl[i].amps[j] * Math.pow(Math.sin(Math.PI * f), .75); shape = (j + i) % 2 ? .85 : .1; }
        if (s.gold) stress = Math.max(stress, Math.sin(Math.PI * clamp((t - s.t0) / .28, 0, 1)));
      }
    }
    return { talk, shape, stress, q, active: !!active };
  }
  // blinks every 3-5 s (deterministic), each 0.16 s
  const rb = rng(4242), blinks = []; { let tt = 1.4; for (let i = 0; i < 80; i++) { blinks.push(tt); tt += 3 + rb() * 2; } }
  const blinkAt = t => { for (let i = 0; i < blinks.length; i++) { const d = t - blinks[i]; if (d >= 0 && d < .16) return Math.sin(Math.PI * d / .16); if (blinks[i] > t) break; } return 0; };
  function auto(t, over) {
    const k = talkAt(t), p = { talk: k.talk, shape: k.shape, blink: blinkAt(t), brow: k.q ? .8 : (k.active ? .15 : 0), bob: k.stress, nod: k.stress * .8 + Math.sin(t * .8) * .15 };
    set(Object.assign(p, over || {})); return k;
  }
  return { obj, body, set, auto, talkAt, state: st, hinge, chain };
}
