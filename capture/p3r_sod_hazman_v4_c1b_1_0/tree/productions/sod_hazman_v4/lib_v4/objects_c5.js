// objects_c5.js - set pieces for chapter c5 only: tilted-Earth orbit system, Jerusalem rooftop sun arcs, flashlight demo, chanukia, odometer drums, sun loop. No Hebrew, no people.
import { THREE, box, cyl, mesh, toon, ease, prog, clamp, lerp, rng, O, D2R, candle, textPlane, tube, reveal, arcPts, sunBall, sunDir, dayHalfAngle, goldRing, ringAnim } from './kit_c4567.js';

export const RO = 8, TILT = 23.5;
const Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
export const LAT = 31.8, LON = 35.2;
const pinLocal = (R) => { const phi = (LON + 180) * D2R, th = (90 - LAT) * D2R; return new THREE.Vector3(-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th)).multiplyScalar(R); };

// ---------------------------------------------------------------- Sun + orbit ring + tilted Earth (axis always tilted toward +x)
export function orbitWorld(Wd, o) {
  o = o || {}; const R = o.R || .9;
  O.skyDome(Wd, { top: 0x01030a, mid: 0x02061a, bot: 0x061030, stars: 1 });
  O.lighting(Wd, { key: [0xffffff, 0, [0, 50, 0]], hemi: [0x3a4a78, 0x101830, o.hemi === undefined ? .55 : o.hemi], noShadow: true, fog: null, points: [[0xfff0d8, 14, [.5, 0, 0], 0, 0]] });
  const sun = sunBall(Wd, 1.7); sun.position.set(.5, 0, 0);
  const ring = tube(Array.from({ length: 80 }, (_, i) => { const a = i / 80 * Math.PI * 2; return [Math.cos(a) * RO, 0, -Math.sin(a) * RO]; }), .028, 0x7a9ae0, { closed: true, seg: 160, op: .55 }); Wd.add(ring);
  const E = O.earth(Wd, { R, pos: [RO, 0, 0] }), em = E.userData.earth; E.rotation.z = -TILT * D2R;
  const axisM = new THREE.MeshBasicMaterial({ color: 0xffd060 }), axis = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, R * 3.3, 8), axisM); E.add(axis);
  const tipN = O.glow(R * .7, 0xffd060, .9); tipN.position.y = R * 1.65; E.add(tipN);
  const pin = new THREE.Group(); const pl = pinLocal(R * 1.01); pin.position.copy(pl); pin.add(new THREE.Mesh(new THREE.SphereGeometry(R * .06, 12, 8), O.basic(0xff4a3a))); const pg = O.glow(R * .5, 0xff6a50, .9); pin.add(pg); em.add(pin);
  const api = { sun, ring, E, em, pin, R, axis, tipN, pg,
    pos(th) { return new THREE.Vector3(Math.cos(th) * RO, 0, -Math.sin(th) * RO); },
    place(th, spin) { const p = api.pos(th); E.position.copy(p); em.rotation.y = spin || 0; return p; },
    // spin that brings Jerusalem to local noon (pin facing the sun best) at orbit angle th
    noonSpin(th) { const p = api.pos(th), toSun = new THREE.Vector3(.5, 0, 0).sub(p).normalize(); let best = 0, bd = -2; for (let i = 0; i < 360; i++) { const s = i / 360 * Math.PI * 2, d = pinLocal(1).applyAxisAngle(Y, s).applyAxisAngle(Z, -TILT * D2R); const dt = d.dot(toSun); if (dt > bd) { bd = dt; best = s; } } return best; },
    elevAt(th) { const s = api.noonSpin(th), p = api.pos(th), toSun = new THREE.Vector3(.5, 0, 0).sub(p).normalize(), d = pinLocal(1).applyAxisAngle(Y, s).applyAxisAngle(Z, -TILT * D2R); return 90 - Math.acos(clamp(d.dot(toSun), -1, 1)) / D2R * 1 + 0; } };
  return api;
}
// parallel rays toward a sphere (centre c, radius R) coming from direction dir (unit vector from centre toward the source)
export function sunRays(Wd, n) {
  const g = new THREE.Group(), rs = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1, 5), new THREE.MeshBasicMaterial({ color: 0xffd45a, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); g.add(m); rs.push(m); } Wd.add(g);
  const u = new THREE.Vector3(), v = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  return { group: g, rays: rs, set(c, R, dir, hit, len, k) { // hit: world point of the highlighted ray (pin)
    u.crossVectors(dir, up); if (u.lengthSq() < 1e-4) u.set(1, 0, 0); u.normalize(); v.crossVectors(u, dir).normalize();
    rs.forEach((m, i) => { let w; if (i === 0 && hit) { w = hit.clone().sub(c); w.addScaledVector(dir, -w.dot(dir)); } else { const a = (i - 1) / (rs.length - 1) * Math.PI * 2 + .3, rr = R * (.15 + .75 * ((i * 0.618) % 1)); w = u.clone().multiplyScalar(Math.cos(a) * rr).addScaledVector(v, Math.sin(a) * rr); }
      const wl = Math.min(w.length(), R * .98), d0 = Math.sqrt(Math.max(.0001, R * R - wl * wl)), start = c.clone().add(w).addScaledVector(dir, d0 + len), end = c.clone().add(w).addScaledVector(dir, d0);
      const mid = start.clone().add(end).multiplyScalar(.5); m.position.copy(mid); m.scale.set(i === 0 ? 2.4 : 1, len, i === 0 ? 2.4 : 1); m.quaternion.setFromUnitVectors(up, dir); m.material.opacity = (i === 0 ? .95 : .55) * k; m.visible = k > .01; }); } };
}

// ---------------------------------------------------------------- Jerusalem rooftop looking south, sun on its real daily arc
export function rooftop(Wd, o) {
  o = o || {}; const winter = !!o.winter, dec = winter ? -23.44 : 23.44, H = dayHalfAngle(LAT, dec);
  const sky = O.skyDome(Wd, { top: winter ? 0x6c94c8 : 0x3f86dc, mid: winter ? 0xaec6e0 : 0x8ec0f0, bot: winter ? 0xf0dcc0 : 0xfbeccc, stars: 0 });
  O.lighting(Wd, { key: [winter ? 0xffd9a8 : 0xfff3dc, winter ? 1.5 : 2.0, [0, 60, 40]], hemi: [winter ? 0xb8cce8 : 0xcfe2f8, 0x6a5a40, 1.0], fill: [0xa8c0ff, .25, [0, 5, -20]], target: [0, 0, 4], shadowExt: 18, shadowMap: 1024, fog: [winter ? 0xd8d8d0 : 0xe6e6d8, 60, 330] });
  Wd.scene.fog = new THREE.Fog(winter ? 0xd8d8d0 : 0xe6e6d8, 60, 330);
  const T = O.stoneTex(7, '#d6c49c'), floor = O.texBox(34, .5, 30, T, 0xffffff, { pos: [0, -.25, 4], inkW: .02 }); Wd.add(floor);
  Wd.add(O.texBox(34, 1.1, .5, T, 0xf0e6d0, { pos: [0, .55, 12], inkW: .03 })); for (let i = -8; i <= 8; i++) Wd.add(O.texBox(1.4, .35, .8, T, 0xfff4e0, { pos: [i * 2, 1.25, 12], inkW: .02 }));
  const C = O.city(Wd, { seed: 29, n: 60, litFrac: 0, area: [-70, 70, -16, -80], slope: .05, cypress: 6 }); C.group.rotation.y = Math.PI; C.glows.forEach(g => { g.visible = false; });
  const Hh = O.hills(Wd, { colors: [0x8a9a64, 0x9aa870, 0x7a8a58], list: [[-30, -150, 40, 12, 24], [45, -150, 44, 14, 26], [-90, -140, 34, 10, 20], [100, -140, 36, 11, 22]] }); Hh.rotation.y = Math.PI;
  O.olive(Wd, -10, 9, 1.0, 3); O.olive(Wd, 11, 9, 1.2, 5); O.pottedPlant(Wd, -6, 0, 9.5, 1.1);
  const D = 150, N = 46, dots = [], arcP = [];
  for (let i = 0; i <= N; i++) { const h = lerp(-H, H, i / N), d = sunDir(LAT, dec, h).v; arcP.push(d); const m = new THREE.Mesh(new THREE.SphereGeometry(.9, 8, 6), O.basic(0xffd45a)); m.position.set(d[0] * D, d[1] * D, d[2] * D); m.visible = d[1] > 0; Wd.add(m); dots.push(m); }
  const sun = sunBall(Wd, 6, { core: 0xfff0b0, halo: 0xffd070, halo2: 0xffb860 }); Wd.sun.castShadow = true;
  const api = { H, dec, sun, dots, arcP, setSun(k, lit) { const h = lerp(-H, H, clamp(k, 0, 1)), d = sunDir(LAT, dec, h).v; sun.position.set(d[0] * D, d[1] * D, d[2] * D); sun.visible = d[1] > .01;
      Wd.sun.position.set(d[0] * 60, Math.max(8, d[1] * 60), d[2] * 60 + 4); dots.forEach((m, i) => { const on = i / N <= k; m.material.color.setHex(on ? 0xffd45a : 0xe8d9a8); m.scale.setScalar(on ? 1.15 : .8); }); } };
  return api;
}
// camera that looks south and up from the roof (az: 0 = south). returns {pos, look}
export const roofCam = (x, y, z, alt, az) => { const a = (alt || 30) * D2R, b = (az || 0) * D2R; return { pos: [x, y, z], look: [x + Math.sin(b) * Math.cos(a) * 30, y + Math.sin(a) * 30, z + Math.cos(b) * Math.cos(a) * 30] }; };

// ---------------------------------------------------------------- flashlights on a grid floor
export function flashFloor(Wd) {
  O.skyDome(Wd, { top: 0x0a0c18, mid: 0x161a2c, bot: 0x2a2a3a, stars: 0 });
  O.lighting(Wd, { key: [0xfff0d8, .35, [3, 8, 6]], hemi: [0x5a6080, 0x201810, .6], fill: [0x6a60a0, .2, [-5, 3, 4]], rim: [0xffb070, .4, [0, 4, -6]], target: [0, 0, 0], shadowExt: 10, fog: null });
  const tex = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#2b2e44'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(140,160,220,.35)'; g.lineWidth = 3; for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } return c; })());
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(10, 6); tex.colorSpace = THREE.SRGBColorSpace;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), toon(0xffffff, { map: tex })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; Wd.add(fl);
  return fl;
}
export function flashlight(Wd, o) {
  o = o || {}; const G = new THREE.Group(), h = o.h || 2.4, col = o.color || 0xffe9b0; G.position.set(o.x || 0, h, 0); Wd.add(G);
  const head = new THREE.Group(); G.add(head); head.add(mesh(new THREE.CylinderGeometry(.16, .12, .5, 20), toon(0x2c3a4a), { inkW: .02, pos: [0, .35, 0] })); head.add(mesh(new THREE.CylinderGeometry(.24, .17, .22, 20), toon(0xc99a35), { inkW: .02, pos: [0, .0, 0] }));
  const lens = new THREE.Mesh(new THREE.CircleGeometry(.22, 20), O.basic(col)); lens.rotation.x = Math.PI / 2; lens.position.y = -.115; head.add(lens);
  const beamG = new THREE.CylinderGeometry(0, 1, 1, 28, 1, true); beamG.translate(0, -.5, 0);
  const beam = new THREE.Mesh(beamG, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); G.add(beam);
  const patch = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ map: O.glowTexture(), color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); patch.rotation.x = -Math.PI / 2; patch.position.y = .02; Wd.add(patch);
  const hw = Math.tan(13 * D2R);
  return { group: G, head, set(tiltDeg, k) { const th = tiltDeg * D2R, L = h / Math.cos(th), c = Math.cos(th); head.rotation.z = th; beam.rotation.z = th; beam.scale.set(L * hw, L, L * hw); beam.material.opacity = .16 * k;
      patch.position.set((o.x || 0) + h * Math.tan(th), .02, 0); patch.scale.set(L * hw * 1.25 / Math.pow(c, 1.4), 1, L * hw * 1.25); patch.rotation.z = 0; patch.material.opacity = clamp(Math.pow(c, 2.2) * (h / L) * k * 1.1, 0, 1); patch.visible = k > .01; return { L, c, area: Math.PI * (L * hw) * (L * hw) / Math.pow(c, 1.4) }; } };
}

// ---------------------------------------------------------------- chanukia (nine candles, lit one by one)
export function chanukia(Wd, o) {
  o = o || {}; const G = O.grp(Wd, { pos: o.pos, scale: o.scale || 1 }), mat = 0xc99a35; G.add(box(1.9, .12, .5, mat, { pos: [0, .06, 0], inkW: .01 })); G.add(cyl(.1, .16, .8, mat, { pos: [0, .5, 0], inkW: .012 }));
  const cs = []; for (let i = 0; i < 9; i++) { const x = (i - 4) * .22, hh = i === 4 ? .62 : .46; G.add(box(.1, .14, .1, mat, { pos: [x, .19 + (i === 4 ? .55 : 0), 0], inkW: .008 })); cs.push(candle(Wd, { pos: [0, 0, 0], h: .3, scale: .6 })); G.add(cs[i].group); cs[i].group.position.set(x, .26 + (i === 4 ? .55 : 0), 0); }
  return { group: G, tick(t, lit) { cs.forEach((c, i) => { const k = clamp(lit - i, 0, 1); c.tick(t, k, i * 1.3); }); } };
}
// ---------------------------------------------------------------- odometer drum (abstract marks, no glyphs): index 0..9 -> coloured band with i studs
export function drum(Wd, o) {
  o = o || {}; const G = O.grp(Wd, { pos: o.pos }), R = o.r || .9, W = o.w || .9, cols = [0xe05a4a, 0xe8883a, 0xf0c03a, 0x8ac04a, 0x3ab08a, 0x3a9ad0, 0x5a6ae0, 0x9a5ad0, 0xd05aa0, 0xe8e0d0];
  const dr = new THREE.Group(); G.add(dr); dr.add(mesh(new THREE.CylinderGeometry(R, R, W, 10, 1), toon(0x3a2a1a), { inkW: .03, rot: [0, 0, Math.PI / 2] }));
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), pl = new THREE.Group(); pl.rotation.x = -a; pl.position.set(0, 0, 0); dr.add(pl);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(W * .9, R * .6), toon(cols[i], { emissive: cols[i], emissiveIntensity: .15 })); p.position.set(0, 0, R * .81); p.rotation.y = 0; pl.add(p); for (let s = 0; s < i; s++) { const st = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), O.basic(0xffffff)); st.position.set(-W * .35 + (s % 5) * W * .17, -R * .15 + Math.floor(s / 5) * R * .22, R * .83); pl.add(st); } }
  G.add(box(W * 1.3, R * 2.5, .14, 0x5a3a1c, { pos: [0, 0, -R - .1], inkW: .015 })); [-1, 1].forEach(s => G.add(box(.1, R * 2.3, R * 2.6, 0x7a4a24, { pos: [s * (W * .65), 0, 0], inkW: .015 })));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.1, R * .78), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .0, blending: THREE.AdditiveBlending, depthWrite: false })); win.position.set(0, 0, R + .05); G.add(win);
  return { group: G, set(v, flash) { dr.rotation.x = v / 10 * Math.PI * 2; win.material.opacity = .35 * (flash || 0); } };
}

export const sunDirOf = (h, dec) => sunDir(LAT, dec, h).v;
