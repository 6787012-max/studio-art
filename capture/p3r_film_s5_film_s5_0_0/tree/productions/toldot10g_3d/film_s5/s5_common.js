/* film_s5 shared helpers. ASCII only. */
import * as THREE from 'three';
import { track } from '../../gezer_trip/film_a/gz_kit2.js';
import * as K from '../kit10g.js';
export { THREE, K };
export const { cl, ramp, pop, C, hash2, sm, lam, phong, woodTex, noiseTex, shadowable } = K;
export const BASIC = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
export const M = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; };
export const Yaxis = new THREE.Vector3(0, 1, 0);
export const camTo = (cam, lt, keys) => { const c = track(lt, keys); cam.position.set(...c.p); cam.lookAt(...c.l); };
export const dirOf = (el, az) => { const e = el * Math.PI / 180, a = az * Math.PI / 180; return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)); };
export const LD = { top: '#79c3ee', hor: '#fbe9bd', sunC: '#fff1d0', sunI: 2.1, hemiI: 0.85, el: 32, az: 45 };
export const LG = { top: '#8c9db2', hor: '#cdd0d2', sunC: '#c9d3e0', sunI: 1.0, hemiI: 0.7 };
const c1 = new THREE.Color(), c2 = new THREE.Color();
const mixC = (a, b, k) => '#' + c1.set(a).lerp(c2.set(b), k).getHexString();
export const mixL = (a, b, k) => Object.assign({}, a, { top: mixC(a.top, b.top, k), hor: mixC(a.hor, b.hor, k), sunC: mixC(a.sunC, b.sunC, k), sunI: a.sunI + (b.sunI - a.sunI) * k, hemiI: a.hemiI + (b.hemiI - a.hemiI) * k });
export const WOOD = lam('#8a5a30', { map: woodTex(3, 2, 2) });
export const DARK = lam('#4a2c18', { map: woodTex(6, 3, 1) });
export const hillGentle = (x, z) => 13 * Math.exp(-Math.pow(x / 55, 2) - Math.pow((z + 88) / 38, 2)) + 6 * Math.exp(-Math.pow((x - 85) / 30, 2) - Math.pow((z + 40) / 30, 2));
