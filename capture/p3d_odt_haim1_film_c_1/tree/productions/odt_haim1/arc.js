// arc.js - the recurring image of odt_haim1: eight big round floor discs on a gentle arc across the hall, numbered 1..8 in gold.
//   const A = buildArc(Wd);  A.pos(n) -> THREE.Vector3 (disc n, 1..8, centre on the floor);  A.light(n, amount 0..1.4);  A.R(n) radius
//   goldThread(Wd, fn) : fn(t) -> {a:[x,y,z], b:[x,y,z], amt:0..1}  a soft glowing golden thread (beads), pure function of t
import { THREE, canvasTex, cyl, clamp } from '../../lib/stage3d.js';

const GOLD = 0xc9a227;
export const discPos = n => { const s = (n - 1) / 7, x = -12 + 24 * s, z = -5 + 7.5 * (1 - (1 - s) * (1 - s)); return new THREE.Vector3(x, 0, z); };
export const discR = n => n === 5 ? 2.0 : 1.4;

const glowTex = (() => { let t = null; return () => t || (t = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,230,160,.95)'); r.addColorStop(.45, 'rgba(255,205,100,.45)'); r.addColorStop(1, 'rgba(255,190,80,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); })); })();
const numTex = n => canvasTex(256, 256, (g, w, h) => {
  g.strokeStyle = '#c9a227'; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(128, 128, 106, 0, 7); g.stroke();
  g.fillStyle = '#c9a227'; g.font = '700 150px Assistant, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 128, 136); });

export function buildArc(Wd) {
  const discs = [], root = new THREE.Group(); Wd.add(root);
  for (let n = 1; n <= 8; n++) {
    const R = discR(n), g = new THREE.Group(), p = discPos(n); g.position.copy(p); root.add(g);
    const body = cyl(R, R + .03, .07, 0x1f2a44, { pos: [0, .035, 0], cast: false }); g.add(body);
    const rim = new THREE.Mesh(new THREE.RingGeometry(R - .13, R - .05, 64), new THREE.MeshBasicMaterial({ color: GOLD, fog: false })); rim.rotation.x = -Math.PI / 2; rim.position.y = .076; g.add(rim);
    const numM = new THREE.MeshBasicMaterial({ map: numTex(n), transparent: true, depthWrite: false, color: 0xbbbbbb });
    const num = new THREE.Mesh(new THREE.CircleGeometry(R * .78, 48), numM); num.rotation.x = -Math.PI / 2; num.position.y = .08; g.add(num);
    const glowM = new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(R * 4.4, R * 4.4), glowM); glow.rotation.x = -Math.PI / 2; glow.position.y = .09; glow.renderOrder = 4; g.add(glow);
    const beamM = new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(R * .82, R * .95, 3.2, 32, 1, true), beamM); beam.position.y = 1.6; beam.renderOrder = 4; g.add(beam);
    discs.push({ g, body, numM, glowM, beamM, R });
  }
  const A = {
    discs, root, R: discR, pos: n => discPos(n).clone(),
    light(n, a) { const d = discs[n - 1]; a = clamp(a, 0, 1.4); d.glowM.opacity = Math.min(1, a * .75); d.beamM.opacity = a * .035; const c = .73 + .27 * Math.min(1, a); d.numM.color.setRGB(c, c, c); d.body.material.emissive.setRGB(.34 * a, .26 * a, .08 * a); d.g.scale.set(1, 1, 1); },
  };
  Wd.discs = A; return A;
}

export function goldThread(Wd, fn, o) {
  o = o || {}; const N = o.n || 26, grp = new THREE.Group(); Wd.add(grp);
  const core = new THREE.MeshBasicMaterial({ color: 0xffd45a, fog: false }), halo = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const cg = new THREE.SphereGeometry(.035, 8, 6), hg = new THREE.SphereGeometry(.09, 8, 6), beads = [];
  for (let i = 0; i < N; i++) { const c = new THREE.Mesh(cg, core), h = new THREE.Mesh(hg, halo); c.add(h); grp.add(c); beads.push(c); }
  Wd.on(t => { const s = fn(t), amt = clamp(s.amt === undefined ? 1 : s.amt, 0, 1); grp.visible = amt > .01; if (!grp.visible) return;
    const a = s.a, b = s.b, sag = (1 - amt) * .5 + .12;
    for (let i = 0; i < N; i++) { const u = i / (N - 1), reach = Math.min(1, amt * 1.15), uu = u * reach; const x = a[0] + (b[0] - a[0]) * uu, z = a[2] + (b[2] - a[2]) * uu, y = a[1] + (b[1] - a[1]) * uu - Math.sin(u * Math.PI) * sag * reach + Math.sin(t * 3 + i * .6) * .012;
      beads[i].position.set(x, y, z); const k = (.7 + .3 * Math.sin(t * 4 - i * .5)) * (1 - .4 * u * (1 - amt)); beads[i].scale.setScalar(Math.max(.01, k)); } });
  return grp;
}
