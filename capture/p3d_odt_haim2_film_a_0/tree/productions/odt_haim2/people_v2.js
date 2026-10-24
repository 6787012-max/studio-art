// people_v2.js - looks and helpers for the odt_haim2 films (owned by film_a builder; other films import it).
//   INSTR2, GROUP16[16], men(Wd, look, fn, o) -> a man with a small plain white NAME TAG on the left chest
//   NEUTRAL_HALL(o) -> options for hallWorld() with a near-neutral key light (#fff1dc)
//   circleSpots(cx, cz, r, n, a0deg) -> n positions on a circle, facing the centre
import { THREE, man } from './hall.js';

// instructor: calm, white shirt visible, VISIBLE blue kippa
export const INSTR2 = { coat: '#2a2f3a', beard: '#4a3424', beardLen: .45, hat: 'kippa', hatColor: '#2A4A8A', skin: '#eccaa8', pants: '#1b1d24', seed: .5 };

const COATS = ['#2b3a5a', '#3a3a40', '#4a3a2e', '#2e4a3e'];
const SKINS = ['#eccaa8', '#e6bf9a', '#f0d2b4', '#dcb08a', '#e9c4a0', '#f0d2b4', '#e2b894', '#eccaa8', '#dcb08a', '#f0d2b4', '#e6bf9a', '#e2b894', '#e9c4a0', '#eccaa8', '#f0d2b4', '#dcb08a'];
const BEARDS = [.3, 0, .35, 0, 0, .25, 0, .3, .35, 0, 0, .3, 0, .25, .3, 0];   // about half with short beards
const KIPPOT = ['#E8E0C8', '#2A4A8A'];
export const GROUP16 = Array.from({ length: 16 }, (_, i) => ({
  coat: COATS[(i * 3 + (i >> 2)) % 4], hat: 'kippa', hatColor: KIPPOT[(i + (i >> 2)) % 2], beard: ['#3a2a1e', '#2b2018', '#5a4030'][i % 3], beardLen: BEARDS[i],
  skin: SKINS[i], pants: '#1b1d24', seed: .13 + i * .11,
}));

// hall options: near neutral key light so white shirts stay white
export function NEUTRAL_HALL(o) { return Object.assign({ sunColor: 0xfff1dc, sun: 1.7, hemi: 1.7, hemiSky: 0xffffff, hemiGround: 0xe6d2b8 }, o || {}); }

// a man with a small plain white name tag on his left chest (no text)
export function men(Wd, look, fn, o) {
  const P = man(Wd, look, fn, o); let done = false;
  if (look.tag === false) return P;
  Wd.on(() => {
    if (done || !P.figure) return; done = true;
    const tag = new THREE.Mesh(new THREE.BoxGeometry(.085, .055, .014), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    tag.position.set(.085, 1.3, .16); tag.castShadow = false; P.figure.group.add(tag);
  });
  return P;
}

// n positions on a circle (angle from +z towards +x, degrees), facing the centre
export function circleSpots(cx, cz, r, n, a0) {
  const out = [];
  for (let i = 0; i < n; i++) { const a = ((a0 || 0) + 360 * i / n) * Math.PI / 180, x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r; out.push({ x, z, a, f: Math.atan2(cx - x, cz - z) }); }
  return out;
}
