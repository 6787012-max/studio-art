// motion3d.js - pure functions of t: movement along paths, small motions, camera moves, and crowds.
// Everything is deterministic (no Math.random / Date). Camera helpers return cam(t) -> {pos, look, fov}, directly usable as `cam` of a shot.
import { THREE, person, rng, clamp, lerp, ease, D } from './stage3d.js';

const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const P3 = p => p.length === 2 ? [p[0], 0, p[1]] : p;               // [x,z] or [x,y,z]
const E = { io: ease.io, out: ease.out, in: ease.in, sm: ease.sm, lin: x => x };

// ---------------- value helpers ----------------
export const bob = (t, amp, freq, ph) => (amp === undefined ? .05 : amp) * Math.sin(t * Math.PI * 2 * (freq || 1) + (ph || 0));
export const sway = (t, amp, freq, ph) => (amp === undefined ? .08 : amp) * Math.sin(t * Math.PI * 2 * (freq || .3) + (ph || 0)) * Math.cos(t * Math.PI * 2 * (freq || .3) * .37 + (ph || 0) * 1.7);
export const pulse = (t, base, amp, freq, ph) => (base === undefined ? 1 : base) + (amp === undefined ? .1 : amp) * Math.sin(t * Math.PI * 2 * (freq || 1) + (ph || 0));
export function shake(t, amp, freq, seed) {   // smooth deterministic noise in [-amp, amp] (sum of incommensurate sines)
  const s = (seed || 0) * 12.9898, f = (freq || 8) * Math.PI * 2;
  return (amp === undefined ? .02 : amp) * (Math.sin(t * f + s) * .5 + Math.sin(t * f * 1.93 + s * 2.3) * .3 + Math.sin(t * f * 3.17 + s * 4.1) * .2);
}
export function tween(keys, easing) {   // keys [[t, v], ...], v number or array; eased between keys; holds before/after
  const e = typeof easing === 'function' ? easing : E[easing || 'io'], n = keys.length;
  return t => { if (t <= keys[0][0]) return keys[0][1]; if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (i < n - 2 && t > keys[i + 1][0]) i++;
    const k = e((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])), a = keys[i][1], b = keys[i + 1][1];
    return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], k)) : lerp(a, b, k); };
}

// ---------------- follow: walk along a polyline ----------------
// pts [[x,z] | [x,y,z], ...]; o {speed m/s (1.4), t0 (0), loop (false), y (0), turn (smoothing distance, 1.2), rate (walk radians per metre, 6.3)}
// returns t -> { pos, facing, walk }  (walk is omitted while standing: before t0, after the end) - spread it straight into person()'s fn.
export function follow(pts, o) {
  o = o || {}; const A = pts.map(P3), sp = o.speed || 1.4, t0 = o.t0 || 0, y0 = o.y || 0, tn = o.turn || 1.2, rate = o.rate || 6.3;
  const cum = [0]; for (let i = 1; i < A.length; i++) cum.push(cum[i - 1] + Math.hypot(A[i][0] - A[i - 1][0], A[i][2] - A[i - 1][2]));
  const L = cum[cum.length - 1];
  const at = s => { s = clamp(s, 0, L); let i = 0; while (i < A.length - 2 && s > cum[i + 1]) i++; const k = (s - cum[i]) / Math.max(cum[i + 1] - cum[i], 1e-6); return mix3(A[i], A[i + 1], k); };
  return t => {
    let s = (t - t0) * sp; const moving = s > 0 && (o.loop || s < L);
    if (o.loop) s = ((s % L) + L) % L; s = clamp(s, 0, L);
    const p = at(s), a = at(s - tn), b = at(s + tn), dx = b[0] - a[0], dz = b[2] - a[2];
    const out = { pos: [p[0], p[1] + y0, p[2]], facing: Math.hypot(dx, dz) > 1e-4 ? Math.atan2(dx, dz) : 0 };
    if (moving) out.walk = s * rate; return out;
  };
}

// ---------------- camera helpers ----------------
const look3 = (l, t) => typeof l === 'function' ? l(t) : l;
// dolly: straight move a -> b, looking at a fixed point (or look(t)); o {t0, t1, fov0, fov1, ease}
export function dolly(a, b, look, t0, t1, o) {
  o = o || {}; const e = E[o.ease || 'io'];
  return t => { const k = e(clamp((t - t0) / (t1 - t0), 0, 1)); return { pos: mix3(a, b, k), look: look3(look, t), fov: lerp(o.fov0 || 45, o.fov1 || o.fov0 || 45, k) }; };
}
// crane: orbit around `center` at radius r while rising from height h0 to h1 and turning a0 -> a1 degrees; o {lookDy, fov0, fov1}
export function crane(center, r, h0, h1, a0, a1, t0, t1, o) {
  o = o || {};
  return t => { const k = ease.io(clamp((t - t0) / (t1 - t0), 0, 1)), a = lerp(a0, a1, k) * D;
    return { pos: [center[0] + Math.sin(a) * r, center[1] + lerp(h0, h1, k), center[2] + Math.cos(a) * r], look: [center[0], center[1] + (o.lookDy || 1), center[2]], fov: lerp(o.fov0 || 45, o.fov1 || o.fov0 || 45, k) }; };
}
// pushIn: from `pos` move toward `look` by the fraction `amount` (0.5 = half way) while the fov narrows a little; o {fov0, fov1, ease}
export function pushIn(pos, look, amount, t0, t1, o) {
  o = o || {}; const e = E[o.ease || 'io'];
  return t => { const k = e(clamp((t - t0) / (t1 - t0), 0, 1)), l = look3(look, t); return { pos: mix3(pos, l, k * amount), look: l, fov: lerp(o.fov0 || 45, o.fov1 || (o.fov0 || 45) - 8, k) }; };
}
// camShake: wraps any cam(t) with a small deterministic hand-held shake
export function camShake(cam, amp, freq) {
  amp = amp === undefined ? .03 : amp;
  return t => { const c = cam(t); return Object.assign({}, c, { pos: [c.pos[0] + shake(t, amp, freq, 1), c.pos[1] + shake(t, amp, freq, 2), c.pos[2] + shake(t, amp, freq, 3)], look: [c.look[0] + shake(t, amp * .6, freq, 4), c.look[1] + shake(t, amp * .6, freq, 5), c.look[2]] }); };
}

// ---------------- crowd ----------------
const COATS = ['#2b2b33', '#3a3a46', '#4a3b30', '#2f3b4c', '#58493a', '#33423a', '#463a4a'], SKINS = ['#efcfb0', '#f0d2b4', '#e6bf9a', '#d9ac86', '#f3d9bf'], BEARDS = ['#3a2618', '#2a2018', '#6b5a48', '#8a8a86'];
// crowd(Wd, n, area, look, seed): n people (men and boys only) in area {x0,x1,z0,z1}; `look` = a base look (or array of looks to pick from) merged with random variety.
// ~40% walk back and forth on short paths, the rest stand and gesture. Returns the array of person() handles. Use few (<= 14) - each figure costs render time.
export function crowd(Wd, n, area, look, seed, o) {
  o = o || {}; const r = rng(seed || 1), a = area.x0 === undefined ? { x0: area[0], z0: area[1], x1: area[2], z1: area[3] } : area, out = [];
  const bases = Array.isArray(look) ? look : [look || {}], gest = ['rest', 'explain', 'rest', 'offer', 'think', 'rest', 'point', 'hips'];
  for (let i = 0; i < n; i++) {
    const kid = r() < (o.kids === undefined ? .25 : o.kids), base = bases[Math.floor(r() * bases.length)];
    const lk = Object.assign({ kind: kid ? 'boy' : undefined, coat: COATS[Math.floor(r() * COATS.length)], skin: SKINS[Math.floor(r() * SKINS.length)], pants: '#1f2128', hat: 'kippa',
      beard: BEARDS[Math.floor(r() * BEARDS.length)], beardLen: kid ? 0 : (r() < .15 ? 0 : .4 + r() * .5), glasses: !kid && r() < .2 }, base);
    const x = lerp(a.x0, a.x1, r()), z = lerp(a.z0, a.z1, r()), sd = r(), sc = (kid ? .8 : .95 + r() * .1) * (o.scale || 1), face = r() * 6.28;
    let fn;
    if (r() < (o.walkers === undefined ? .4 : o.walkers)) {
      const ang = r() * 6.28, len = 3 + r() * 5, x2 = clamp(x + Math.sin(ang) * len, a.x0, a.x1), z2 = clamp(z + Math.cos(ang) * len, a.z0, a.z1);
      const f = follow([[x, z], [x2, z2], [x, z]], { loop: true, speed: .9 + r() * .5, t0: -sd * 10 });
      fn = t => Object.assign({ scale: sc, seed: sd, smile: .4 }, f(t));
    } else {
      const g = gest[Math.floor(r() * gest.length)], talker = r() < .3;   // decided once, outside fn: fn must stay a pure function of t
      fn = t => ({ pos: [x, 0, z], facing: face + shake(t, .25, .1, sd * 9), scale: sc, seed: sd, gesture: g, talk: talker ? .5 + .5 * Math.sin(t * 7 + sd * 20) : 0, smile: .45 });
    }
    out.push(person(Wd, lk, fn, o.person));
  }
  return out;
}
