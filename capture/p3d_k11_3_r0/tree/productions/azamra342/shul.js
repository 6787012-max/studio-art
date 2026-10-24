// shul.js - dry land, village with a beit knesset (exterior) and a beit knesset interior, for azamra342 films.
//   buildDryland(Wd, {skip:[[x0,x1,z0,z1],..]})  cracked dry terrain + hills + dry bushes/rocks/olive trees (call with world({ground:undefined}))
//   buildVillage(Wd, {x, z})                      houses + beit knesset facade facing -z; returns {door:[x,0,z]}
//   buildShul(Wd, {})                             interior, floor y=0, x in +-8.5, z in +-6; aron on the +z wall; returns {HX,HZ,spots}
import { THREE, box, cyl, ball, toon, ink, canvasTex, groundTex, label, rng, clamp, lerp, ease } from '../../lib/stage3d.js';
import { fbm, archGeo } from './road.js';

const V2 = (x, y) => new THREE.Vector2(x, y), C = c => new THREE.Color(c), DUM = new THREE.Object3D();
function inst(geo, mat, items) { const m = new THREE.InstancedMesh(geo, mat, items.length);
  items.forEach((s, i) => { DUM.position.set(s.x, s.y, s.z); DUM.rotation.set(0, s.ry || 0, 0); DUM.scale.set(s.sx, s.sy, s.sz); DUM.updateMatrix(); m.setMatrixAt(i, DUM.matrix); if (s.col !== undefined) m.setColorAt(i, C(s.col)); });
  m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; return m; }
function archPts(cx, y0, w, h, n) { n = n || 12; const r = w / 2, yc = y0 + h - r, pts = [V2(cx - r, y0), V2(cx + r, y0)]; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI; pts.push(V2(cx + Math.cos(a) * r, yc + Math.sin(a) * r)); } return pts; }
function stoneTex(seed, cols, mortar) { const r = rng(seed || 1); return canvasTex(256, 256, (g, w, h) => { g.fillStyle = mortar || '#c4b190'; g.fillRect(0, 0, w, h);
  for (let row = 0; row < 4; row++) { let x = -r() * 60; const y = row * 64; while (x < w) { const bw = 70 + r() * 60; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.beginPath(); g.roundRect(x + 2, y + 2, bw - 4, 60, 5); g.fill(); x += bw; } } }, [.5, .5]); }
function planksTex() { const r = rng(31); return canvasTex(256, 256, (g, w, h) => { const cols = ['#a7754a', '#9c6c43', '#b07d50', '#94653e'];
  for (let y = 0; y < h; y += 32) { let x = -r() * 120; while (x < w) { const bw = 120 + r() * 140; g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(x, y, bw, 32); g.fillStyle = 'rgba(60,35,15,.5)'; g.fillRect(x, y, 2, 32); x += bw; } g.fillStyle = 'rgba(60,35,15,.55)'; g.fillRect(0, y, w, 2); } }, [8, 6]); }
function booksTex(seed, rowsN) { const r = rng(seed); return canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#5b391f'; g.fillRect(0, 0, w, h); const rows = rowsN || 6, rh = (h - 16) / rows, pal = ['#7a1f1f', '#1f3b6b', '#2f5a2f', '#5a3a1f', '#6b1f4a', '#22222c', '#8a6a2a', '#3c2a5a', '#9a3a1a'];
  for (let i = 0; i < rows; i++) { const y0 = 8 + i * rh; g.fillStyle = '#2e1a0e'; g.fillRect(10, y0, w - 20, rh - 10); let x = 12;
    while (x < w - 16) { const bw = 9 + r() * 15, bh = (rh - 14) * (.72 + r() * .26); if (x + bw > w - 12) break; g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x, y0 + rh - 10 - bh, bw - 1.5, bh); g.fillStyle = '#d9b45a'; g.fillRect(x + 1, y0 + rh - 10 - bh + bh * .12, bw - 3.5, 2.2); x += bw; }
    g.fillStyle = '#7a4d2a'; g.fillRect(0, y0 + rh - 10, w, 10); } g.strokeStyle = '#3a2412'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }); }
function curtainTex() { return canvasTex(330, 390, (g, w, h) => { g.fillStyle = '#1d3770'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e2b13a'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); g.lineWidth = 3; g.strokeRect(26, 26, w - 52, h - 52);
  // keter Torah (a crown) above two luchot with rounded tops - no other symbols
  g.fillStyle = '#e2b13a'; g.strokeStyle = '#a77a14'; g.lineWidth = 4; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(95, 160); g.lineTo(95, 96); g.lineTo(130, 124); g.lineTo(165, 76); g.lineTo(200, 124); g.lineTo(235, 96); g.lineTo(235, 160); g.closePath(); g.fill(); g.stroke();
  g.fillRect(90, 140, 150, 26); g.strokeRect(90, 140, 150, 26);
  for (const [x, y] of [[95, 90], [165, 70], [235, 90]]) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.stroke(); }
  g.fillStyle = '#f6ecd0'; g.strokeStyle = '#d9a63a'; g.lineWidth = 6;
  for (const x0 of [73, 173]) { g.beginPath(); g.moveTo(x0, 330); g.lineTo(x0, 238); g.arc(x0 + 42, 238, 42, Math.PI, 0); g.lineTo(x0 + 84, 330); g.closePath(); g.fill(); g.stroke(); } }); }

// ---------------- dry land ----------------
export function buildDryland(Wd, o) {
  o = o || {}; const skip = o.skip || [], ok = (x, z) => !skip.some(s => x > s[0] && x < s[1] && z > s[2] && z < s[3]);
  const hillH = (x, z) => ease.sm(clamp((Math.hypot(x, z - 30) - 130) / 90, 0, 1)) * (8 + 26 * fbm(x * .012 + 9, z * .012 + 5));
  const g = new THREE.PlaneGeometry(440, 440, 176, 176); g.rotateX(-Math.PI / 2); g.translate(0, 0, 30);
  const p = g.attributes.position, cols = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = hillH(x, z), n = fbm(x * .04, z * .04), hk = clamp(h / 28, 0, 1); p.setY(i, h);
    c.setRGB(.95 + .12 * n + hk * .05, .92 + .1 * n - hk * .05, .86 + .08 * n - hk * .14); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals();
  const gt = groundTex('dry', [110, 110]); const terr = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: gt, vertexColors: true })); terr.receiveShadow = true; Wd.add(terr);
  const r = rng(17), bush = [], rock = [], tuft = [], trunk = [], crown = [];
  for (let i = 0; i < 260; i++) { const x = (r() - .5) * 230, z = -40 + r() * 230; if (!ok(x, z)) continue; const y = hillH(x, z), s = .4 + r() * .7;
    if (i % 3 === 0) rock.push({ x, y: y + .15 * s, z, sx: s * .8, sy: s * .5, sz: s * .8, ry: r() * 3, col: ['#b59c78', '#a8906c', '#c4ab86'][i % 3] });
    else bush.push({ x, y: y + .3 * s, z, sx: s, sy: s * .6, sz: s, ry: r() * 3, col: ['#8a7a4e', '#7b6c44', '#9a8a5a', '#6e6a4a'][i % 4] }); }
  for (let i = 0; i < 520; i++) { const x = (r() - .5) * 200, z = -40 + r() * 200; if (!ok(x, z)) continue; tuft.push({ x, y: hillH(x, z) + .22, z, sx: .22, sy: .5 + r() * .3, sz: .22, col: ['#d8c27a', '#cbb26a', '#e3cf8a'][i % 3] }); }
  for (let i = 0; i < 22; i++) { const x = (r() - .5) * 200, z = -30 + r() * 180; if (!ok(x, z)) continue; const y = hillH(x, z), s = .8 + r() * .6; trunk.push({ x, y: y + .7 * s, z, sx: s, sy: s, sz: s }); crown.push({ x, y: y + 1.9 * s, z, sx: 1.5 * s, sy: .9 * s, sz: 1.5 * s, col: ['#8a9a62', '#7c8c58'][i % 2] }); }
  Wd.add(inst(new THREE.IcosahedronGeometry(1, 1), toon(0xffffff), bush)); Wd.add(inst(new THREE.DodecahedronGeometry(1, 0), toon(0xffffff), rock)); Wd.add(inst(new THREE.ConeGeometry(1, 1, 4), toon(0xffffff), tuft));
  Wd.add(inst(new THREE.CylinderGeometry(.14, .22, 1.4, 6), toon(0x6b4a30), trunk)); Wd.add(inst(new THREE.IcosahedronGeometry(1, 1), toon(0xffffff), crown));
  return { hillH };
}

// ---------------- village ----------------
export function buildVillage(Wd, o) {
  o = o || {}; const X = o.x || 0, Z = o.z || 0, r = rng(5), Gp = new THREE.Group(); Gp.position.set(X, 0, Z); Wd.add(Gp);
  const wallCols = ['#efe3c8', '#e8d8b8', '#f4ead2', '#e2d0ae'];
  for (let row = 0; row < 3; row++) for (let col = -3; col <= 3; col++) { if (row === 0 && Math.abs(col) <= 1) continue; const w = 4.5 + r() * 2.5, d = 4.5 + r() * 2, h = 3 + r() * 1.6, x = col * 10 + (r() - .5) * 2, z = 4 + row * 10 + (r() - .5) * 2;
    const hs = box(w, h, d, wallCols[Math.floor(r() * 4)], { pos: [x, h / 2, z] }); Gp.add(hs); Gp.add(box(w + .3, .25, d + .3, 0xd9c8a4, { pos: [x, h + .12, z] }));
    for (const sx of [-1, 1]) Gp.add(box(.7, 1.0, .08, 0x4a5a70, { pos: [x + sx * w * .22, h * .6, z - d / 2 - .03], ink: false }));
    Gp.add(box(.9, 1.7, .08, 0x6a4a2e, { pos: [x, .85, z - d / 2 - .03], ink: false }));
    if (r() < .4) { Gp.add(cyl(.9, .9, 1.1, 0xa9b0b8, { pos: [x + w * .2, h + .8, z] })); }
    if (r() < .35) { Gp.add(cyl(.12, .2, 3.4, 0x6b5238, { pos: [x + w / 2 + 1.6, 1.7, z - 1], ink: false })); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; Gp.add(box(.12, .06, 1.6, 0x8a9a4a, { pos: [x + w / 2 + 1.6 + Math.cos(a) * .8, 3.5, z - 1 + Math.sin(a) * .8], rot: [0, -a, .3], ink: false })); } } }
  // beit knesset facade (faces -z)
  const bk = new THREE.Group(); bk.position.set(0, 0, 0); Gp.add(bk);
  bk.add(box(14, 7.6, 11, 0xf3e8cf, { pos: [0, 3.8, 6] })); bk.add(box(14.6, .5, 11.6, 0xcdb88e, { pos: [0, .25, 6] }));
  for (const sx of [-1, 1]) { const rf = box(7.7, .35, 12, 0xc4673f, { pos: [sx * 3.4, 8.9, 6], rot: [0, 0, -sx * .34] }); bk.add(rf); }
  const tri = new THREE.Shape(); tri.moveTo(-7, 0); tri.lineTo(7, 0); tri.lineTo(0, 2.45); const tg = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: .4, bevelEnabled: false }), toon(0xf3e8cf)); tg.position.set(0, 7.6, .45); ink(tg, .03, 0x3a2a18); bk.add(tg);
  const fz = .5, glass = toon(0x4f7aa8, { emissive: 0x1a2f4a });
  for (const wx of [-4.6, 4.6]) { const sh = new THREE.Shape(archPts(wx, 1.6, 2.2, 4.4, 14)), gm = new THREE.Mesh(new THREE.ShapeGeometry(sh), glass); gm.position.z = fz - .04; bk.add(gm);
    const fr = new THREE.Mesh(archGeo(2.2, 2.2, .3, .25), toon(0xd9c08a)); fr.position.set(wx, 1.6, fz - .1); bk.add(fr); }
  { const sh = new THREE.Shape(archPts(0, .5, 2.6, 4.4, 14)), gm = new THREE.Mesh(new THREE.ShapeGeometry(sh), toon(0x5a3820)); gm.position.z = fz - .04; bk.add(gm);
    const fr = new THREE.Mesh(archGeo(2.6, 1.9, .4, .35), toon(0xd9c08a)); fr.position.set(0, .5, fz - .12); ink(fr, .03, 0x3a2a18); bk.add(fr); for (let i = 0; i < 3; i++) bk.add(box(4 + i * .8, .2, .8, 0xcdb88e, { pos: [0, .1 + i * .2, -.4 - (2 - i) * .5 ] })); }
  for (const sx of [-1, 1]) { Gp.add(cyl(.5, .7, 5, 0x3f6a38, { pos: [sx * 9.5, 2.5, -1.5] })); Gp.add(ball(1.2, 0x4a7a40, { pos: [sx * 9.5, 5.5, -1.5], scale: [.8, 1.8, .8] })); }
  return { door: [X, 0, Z - 1.2] };
}

// ---------------- beit knesset interior ----------------
export function buildShul(Wd, o) {
  o = o || {}; const HX = 8.5, HZ = 6, H = 6.5, wood = 0x7a4a2a, woodD = 0x5e3a20;
  const wallTx = stoneTex(4, ['#efe4cc', '#e8dbbf', '#f3e9d4', '#e3d4b6'], '#cdbb98'), wallM = [toon(0xffffff, { map: wallTx }), toon(0xe2d3b5)];
  const wall = (L, holes, pos, ry) => { const sh = new THREE.Shape([V2(-L / 2, 0), V2(L / 2, 0), V2(L / 2, H), V2(-L / 2, H)]); for (const hx of holes) sh.holes.push(new THREE.Path(archPts(hx[0], hx[1], hx[2], hx[3])));
    const g = new THREE.ExtrudeGeometry(sh, { depth: .5, bevelEnabled: false, curveSegments: 12 }); g.translate(0, 0, -.25); const m = new THREE.Mesh(g, wallM); m.position.set(...pos); m.rotation.y = ry; m.receiveShadow = true; Wd.add(m); return m; };
  wall(2 * HX + .5, [], [0, 0, HZ + .25], 0); wall(2 * HX + .5, [[0, 0, 2.6, 4.4]], [0, 0, -HZ - .25], 0);
  for (const sx of [-1, 1]) wall(2 * HZ, [[-2.8, 1.0, 1.7, 3.4], [2.8, 1.0, 1.7, 3.4]], [sx * (HX + .25), 0, 0], sx * Math.PI / 2);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2 * HX, 2 * HZ), toon(0xffffff, { map: planksTex() })); fl.rotation.x = -Math.PI / 2; fl.position.y = .04; fl.receiveShadow = true; Wd.add(fl);
  const roof = box(2 * HX + 1.2, .35, 2 * HZ + 1.2, 0xd9c9a8, { pos: [0, H + .175, 0], ink: false }); Wd.add(roof);
  for (let x = -7.7; x <= 7.8; x += 2.2) Wd.add(box(.28, .3, 2 * HZ, 0x6a4326, { pos: [x, H - .15, 0], ink: false }));
  // aron kodesh on the +z wall (front faces -z)
  const ar = new THREE.Group(); ar.position.set(0, 0, HZ - .5); Wd.add(ar);
  ar.add(box(4.2, 5, .9, 0x6b4426, { pos: [0, 2.5, 0] })); ar.add(box(4.5, .3, 1.1, 0x5a3820, { pos: [0, 5.1, 0] }));
  const cur = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 3.9), new THREE.MeshLambertMaterial({ map: curtainTex() })); cur.rotation.y = Math.PI; cur.position.set(0, 2.55, -.47); ar.add(cur);
  ar.add(cyl(.5, .6, .5, 0xe2b13a, { pos: [0, 5.4, 0] })); ar.add(ball(.28, 0xe2b13a, { pos: [0, 5.85, 0] }));
  ar.add(box(5, .22, 1.2, 0x7a4a2a, { pos: [0, .11, -1.0] })); ar.add(box(4.4, .22, 1.2, 0x7a4a2a, { pos: [0, .33, -.9] }));
  const nt = new THREE.Mesh(new THREE.SphereGeometry(.16, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffd98a })); nt.position.set(0, 5.9, -.9); ar.add(nt); ar.add(cyl(.012, .012, .5, 0x333333, { pos: [0, 6.2, -.9], ink: false }));
  // tables, benches, books
  const br = rng(8); for (const sx of [-1, 1]) { const tx = sx * 5.4;
    Wd.add(box(1.05, .08, 6, 0x8a5a34, { pos: [tx, .78, 0] })); for (const dz of [-2.8, 2.8]) for (const dx of [-.42, .42]) Wd.add(box(.08, .74, .08, woodD, { pos: [tx + dx, .4, dz], ink: false }));
    for (const s2 of [-1, 1]) { Wd.add(box(.38, .06, 6, wood, { pos: [tx + s2 * .88, .46, 0] })); for (const dz of [-2.8, 0, 2.8]) Wd.add(box(.3, .44, .07, woodD, { pos: [tx + s2 * .88, .24, dz], ink: false })); }
    for (let i = 0; i < 6; i++) Wd.add(box(.28, .07, .34, [0x7a1f1f, 0x1f3b6b, 0x2f5a2f, 0x22222c][Math.floor(br() * 4)], { pos: [tx + (br() - .5) * .4, .86, -2.5 + i * .95 + br() * .3], rot: [0, br() * .5, 0], ink: false })); }
  // bookshelves on the -z wall and beside the aron
  const woodM = toon(wood); for (const [x, z, s, ry] of [[-5.2, -HZ + .3, 1, 0], [5.2, -HZ + .3, 2, 0], [-6.2, HZ - .3, 3, Math.PI], [6.2, HZ - .3, 4, Math.PI]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.2, .5), [woodM, woodM, woodM, woodM, toon(0xffffff, { map: booksTex(s) }), woodM]); m.position.set(x, 2.1, z); m.rotation.y = ry; m.castShadow = true; ink(m, .03, 0x2a1a10, true); Wd.add(m); }
  // amud and the shtender (the boy stands behind the shtender, facing +z)
  Wd.add(box(.95, 1.08, .75, 0x5e3720, { pos: [-2.8, .54, 4.0] }));
  const sht = new THREE.Group(); sht.position.set(0, 0, .55); Wd.add(sht); sht.add(box(.12, 1.0, .12, woodD, { pos: [0, .5, 0] })); sht.add(box(.6, .05, .6, woodD, { pos: [0, .025, 0] }));
  sht.add(box(.52, .04, .6, 0x7a4a2a, { pos: [0, 1.03, 0], rot: [.42, 0, 0] })); sht.add(box(.44, .02, .5, 0xf4ecd8, { pos: [0, 1.065, -.005], rot: [.42, 0, 0], ink: false }));
  // lamps
  const gl = canvasTex(128, 128, (g, w, h) => { const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64); rg.addColorStop(0, 'rgba(255,226,160,.9)'); rg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); });
  for (const [x, z] of [[-3.2, -2.6], [-3.2, 2.6], [3.2, -2.6], [3.2, 2.6]]) { const lm = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffe6a8 })); lm.position.set(x, 4.4, z); Wd.add(lm);
    Wd.add(cyl(.012, .012, 1.9, 0x333333, { pos: [x, 5.5, z], ink: false })); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: gl, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .45, fog: false })); sp.scale.set(1.8, 1.8, 1); sp.position.set(x, 4.4, z); Wd.add(sp); }
  return { HX, HZ, H, spots: { boy: [0, 0, -.35], shtender: [0, 0, .55], aron: [0, 0, HZ - .5] } };
}
