// tractorina_preview: shared kit for film_a.html (builder, 19/11/2026).
// Objects only: ATV quad bikes with headlamp eyes, one silver sedan with a sad face, hills, olive trees,
// stones, puddles, dust puffs, rope, signs and ONE raised-hand silhouette (s07). No people.
// Zero Hebrew here: every text is a vault ID resolved at run time through T().
// Deterministic: no Math.random, no Date. All motion is a function of the shot time t.
import { THREE, ease, prog, lerp, clamp, rng, box, cyl, ball, mesh, toon, label, world } from '../../../lib/stage3d.js';
import { installRichness } from '../../../lib/richness.js';

export { THREE, ease, prog, lerp, clamp, rng, box, cyl, ball, mesh, toon, world };

export const T = id => ((window.CAPTIONS_VAULT || {})[id] || id);

export const COL = {
  red: 0xd9463a, blue: 0x2f6fb5, yellow: 0xf2c230, green: 0x4f9a4a,
  silver: 0xc4ccd3, dark: 0x2a2420, mud: 0x6a4a2a, dust: 0xc9b08a, stone: 0x8e9196,
};
const WHITE = 0xfffbef, PUPIL = 0x15100c, TYRE = 0x1e1e22;

// world + richness probe (tools/verify_scene.py reads window.__richness)
export function shotWorld(o) {
  const Wd = world(Object.assign({ skyTop: 0x8ec5ef, skyBottom: 0xf6e7c4, sun: 2.1, hemi: 1.3 }, o || {}));
  const rich = installRichness(Wd.scene);
  Wd.on(rich.onFrame);
  return Wd;
}

// blink: 1 = open, small value = closed. Period and offset only; no randomness.
export function blink(t, period, off) {
  const p = period || 3.1, f = (((t + (off || 0)) % p) + p) % p;
  const k = f < .12 ? 1 - Math.abs(f - .06) / .06 : 0;
  return 1 - .88 * k;
}

function eye(r, parent, pos) {
  const e = new THREE.Group(); e.position.set(...pos); e.userData.kind = 'eye';
  e.add(ball(r, WHITE, { inkW: .012 }));
  const p = ball(r * .5, PUPIL, { ink: false, cast: false }); p.position.set(r * .62, 0, 0);
  e.add(p); e.userData.pupil = p; parent.add(e); return e;
}

// eyes: sy = blink/squint (1 open), dy/dz = pupil offset (looking)
export function setEyes(g, o) {
  o = o || {};
  for (const e of g.userData.eyes) {
    e.scale.set(1, o.sy === undefined ? 1 : o.sy, 1);
    e.userData.pupil.position.y = o.dy || 0;
    e.userData.pupil.position.z = o.dz || 0;
  }
}

// wheels: spin = rotation about the axle in radians
export function setWheels(g, spin) {
  for (const w of g.userData.wheels) { w.tyre.rotation.y = spin; w.hub.rotation.y = spin; }
}

function wheel(parent, x, y, z, rad, w, hubCol) {
  const piv = new THREE.Group(); piv.position.set(x, y, z); piv.rotation.z = Math.PI / 2;
  const tyre = cyl(rad, rad, w, TYRE, { inkW: .01 }); piv.add(tyre);
  const hub = cyl(rad * .55, rad * .55, w + .02, hubCol, { ink: false, cast: false }); piv.add(hub);
  parent.add(piv); return { piv, tyre, hub };
}

// ATV quad bike, faces +x. big = the one with the biggest eyes (s05, s07).
export function atv(color, o) {
  o = o || {};
  const big = !!o.big, g = new THREE.Group(); g.userData.kind = 'atv';
  g.add(box(1.0, .26, .6, color, { pos: [0, .42, 0] }));
  g.add(box(.36, .12, .4, COL.dark, { pos: [-.12, .64, 0] }));           // seat
  g.add(box(.34, .2, .56, color, { pos: [.42, .42, 0] }));               // nose
  g.add(box(.05, .05, .5, COL.dark, { pos: [.2, .76, 0] }));             // handlebar
  g.add(box(.1, .06, .1, 0x333333, { pos: [-.58, .3, 0] }));             // rear hook
  g.add(box(.34, .06, .5, 0x9aa3ab, { pos: [.82, .22, 0] }));            // tow bar (front)
  const er = big ? .16 : .12;
  const L = eye(er, g, [.6, .6, .16]), R = eye(er, g, [.6, .6, -.16]);
  const wheels = [];
  for (const [x, z] of [[.36, .34], [.36, -.34], [-.36, .34], [-.36, -.34]]) wheels.push(wheel(g, x, .2, z, .2, .16, color));
  g.userData.eyes = [L, R]; g.userData.wheels = wheels; g.userData.big = big;
  return g;
}

// one silver sedan, faces +x, sad headlamp eyes with slanted brows and a sweat drop
export function sedan() {
  const g = new THREE.Group(); g.userData.kind = 'car';
  const DARK = 0x2a3440;
  g.add(box(1.5, .34, .7, COL.silver, { pos: [0, .43, 0] }));
  g.add(box(.9, .3, .62, 0xd3dbe0, { pos: [-.12, .8, 0] }));             // cabin
  g.add(box(.04, .22, .58, DARK, { pos: [.33, .8, 0], ink: false }));    // windscreen
  g.add(box(.06, .12, .6, 0x9aa3ab, { pos: [.77, .3, 0] }));             // grille
  const L = eye(.11, g, [.8, .52, .2]), R = eye(.11, g, [.8, .52, -.2]);
  for (const s of [1, -1]) {                                              // sad brows: inner ends up
    const b = box(.04, .035, .16, DARK, { pos: [.84, .66, s * .2], ink: false });
    b.rotation.x = s * .35; g.add(b);
  }
  g.add(box(.04, .04, .14, DARK, { pos: [.82, .3, 0], ink: false }));    // small sad mouth
  const wheels = [];
  for (const [x, z] of [[.5, .36], [.5, -.36], [-.5, .36], [-.5, -.36]]) wheels.push(wheel(g, x, .17, z, .17, .14, 0x8c96a0));
  const sweat = ball(.07, 0x6fbfff, { ink: false, cast: false, pos: [.35, 1.2, .42] });
  sweat.scale.set(.8, 1.3, .8); g.add(sweat);
  g.userData.eyes = [L, R]; g.userData.wheels = wheels; g.userData.sweat = sweat; g.userData.base = sweat.position.y;
  return g;
}

// far layer: soft hills in value steps (aerial perspective)
export function hills(Wd, z, seed, cols) {
  const r = rng(seed);
  for (let i = 0; i < 9; i++) {
    const h = ball(1, cols[i % cols.length], { ink: false, cast: false, receive: false });
    h.scale.set(12 + r() * 8, 4 + r() * 3, 5);
    h.position.set(-56 + i * 14 + r() * 4, -1.2, z);
    h.userData.kind = 'hill'; Wd.add(h);
  }
}

export function olive(Wd, x, z, s, seed) {
  const r = rng(seed), g = new THREE.Group(); g.userData.kind = 'tree';
  g.position.set(x, 0, z); g.scale.setScalar(s || 1);
  g.add(cyl(.08, .14, 1.4, COL.mud, { pos: [0, .7, 0] }));
  for (let i = 0; i < 4; i++) g.add(ball(.5 + r() * .2, 0x7d8a4a, { pos: [(r() - .5) * .9, 1.55 + r() * .3, (r() - .5) * .9] }));
  Wd.add(g); return g;
}

export function stone(Wd, x, y, z, s) {
  const m = ball(1, COL.stone, { pos: [x, y, z] });
  m.scale.set(s * 1.2, s * .7, s); m.userData.kind = 'rock'; Wd.add(m); return m;
}

export function puddle(Wd, x, z, r) {
  const p = cyl(r, r, .02, 0x5b8fb8, { pos: [x, .012, z], ink: false, cast: false });
  p.userData.kind = 'water'; Wd.add(p); return p;
}

// wooden sign: board + post + Hebrew label by vault ID (label().userData.text = true).
// o.parent: group to attach to (default Wd). o.post=false for a hanging board.
export function sign(Wd, key, pos, o) {
  o = o || {};
  const g = new THREE.Group(); g.userData.kind = 'sign'; g.position.set(...pos);
  const bw = o.w || 1.3, bh = .42;
  g.add(box(bw, bh, .06, 0xc9a06a, { pos: [0, 0, 0] }));
  if (o.post !== false) g.add(box(.08, 1.2, .08, COL.mud, { pos: [0, -bh / 2 - .6, 0] }));
  const sp = label(Wd, T(key), { size: o.size || 56, height: o.height || .26, bg: null, color: o.color || '#2a1a0a', weight: 800 });
  sp.userData.text = true; g.add(sp); sp.position.set(0, 0, .05);
  (o.parent || Wd).add(g);
  return g;
}

// puffs: small dust/mud balls that burst from a source {x,y,z,t0,dur,scale} and drift
export function puffs(Wd, n, seed, col, size) {
  const r = rng(seed), arr = [];
  for (let i = 0; i < n; i++) {
    const m = ball((size || .18) * (.6 + r() * .6), col || COL.dust, { ink: false, cast: false });
    m.visible = false; m.userData.kind = 'dust';
    m.userData.v = [(r() - .25) * 2.0, .9 + r() * 1.5, (r() - .5) * 1.6];
    Wd.add(m); arr.push(m);
  }
  return {
    set(t, s) {
      arr.forEach(m => {
        const u = t - s.t0;
        if (u < 0 || u > s.dur) { m.visible = false; return; }
        m.visible = true;
        const v = m.userData.v, k = u / s.dur;
        m.position.set(s.x + v[0] * u * .5, Math.max(.05, s.y + v[1] * u - .55 * u * u), s.z + v[2] * u * .5);
        m.scale.setScalar((.5 + .9 * k) * (s.scale || 1));
      });
    },
  };
}

// rope as a chain of small balls; set(a, b, sag, lift) with a, b = [x,y,z]
export function rope(Wd, n, col) {
  const g = new THREE.Group(); g.userData.kind = 'rope'; Wd.add(g);
  const balls = [];
  for (let i = 0; i < n; i++) { const b = ball(.035, col || 0xd9b26a, { ink: false, cast: false }); g.add(b); balls.push(b); }
  return {
    balls,
    set(a, b, sag, lift) {
      for (let i = 0; i < n; i++) {
        const s = i / (n - 1);
        const y = lerp(a[1], b[1], s) - (sag || 0) * Math.sin(Math.PI * s) + (lift ? lift(s) : 0);
        balls[i].position.set(lerp(a[0], b[0], s), y, lerp(a[2], b[2], s));
      }
    },
  };
}

// ONE raised-hand silhouette (flat black, no face) holding a silver whistle. Faces the camera (+z).
export function hand(Wd, pos) {
  const g = new THREE.Group(); g.userData.kind = 'hand';
  const m = new THREE.MeshBasicMaterial({ color: 0x0b0b0c });
  const part = (w, h, d, x, y, rz) => { const q = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); q.position.set(x, y, 0); q.rotation.z = rz || 0; g.add(q); };
  part(.22, .22, .06, 0, 0);
  for (let i = 0; i < 4; i++) part(.05, .2, .05, -.075 + i * .05, .2);
  part(.05, .16, .05, .14, .02, -.7);
  const wh = cyl(.03, .03, .12, 0xdfe6ec, { ink: false, cast: false, pos: [0, -.05, .08] });
  wh.rotation.x = Math.PI / 2; g.add(wh);
  const glint = ball(.04, 0xffffff, { ink: false, cast: false, pos: [0, -.05, .2] });
  glint.visible = false; g.add(glint); g.userData.glint = glint;
  g.position.set(...pos); Wd.add(g);
  return g;
}
