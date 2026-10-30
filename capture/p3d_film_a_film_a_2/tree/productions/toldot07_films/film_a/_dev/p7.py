import sys;sys.path.insert(0,'_dev')
from rp import P
a=P('a_lib.js')
# compass: add 4 diagonal points so it is a star, not a cross
a.rep("  g.userData.W = pts[3]; g.userData.pts = pts;","""  [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4].forEach(an => { const sh = new THREE.Shape(), L2 = R * 0.52; sh.moveTo(0, R * 0.09); sh.lineTo(L2, 0); sh.lineTo(0, -R * 0.09); sh.lineTo(-R * 0.08, 0); sh.lineTo(0, R * 0.09);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); part(g, geo, M('#d8a860', '#c09050', 0), 1.2, [0, 6, 0], [0, an, 0]); });
  g.userData.W = pts[3]; g.userData.pts = pts;""")
a.save()
_p=P('film_a.js');rep=_p.rep
# stage dressing + footprints
rep("dressBeach(BE.root, 100);","""function stageDress(grp, seed, x0, x1, z0, z1, nS, nT) {
  const r = KT.rng(seed);
  for (let i = 0; i < nS; i++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); const sh = KT.makeShell(i % 3 ? 'fan' : 'spiral', seed + i); sh.position.set(x, gY(x, z) + 1, z); sh.scale.setScalar(1.3 + r() * 0.9); grp.add(sh); }
  for (let i = 0; i < nT; i++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); const t = KT.makeGrassTuft(seed + 100 + i, { h: 45 + r() * 40, dry: i % 3 === 0 }); t.position.set(x, gY(x, z) - 3, z); grp.add(t); }
  for (let i = 0; i < 3; i++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0); const s = KT.makeStone(seed + 200 + i, 0.4 + r() * 0.5); s.position.set(x, gY(x, z) - 6, z); grp.add(s); }
}
dressBeach(BE.root, 100);
stageDress(BE.root, 700, -520, 560, 120, 270, 26, 16);""")
rep("dressBeach(BS.root, 400);","""dressBeach(BS.root, 400);
stageDress(BS.root, 800, -520, 520, 80, 280, 30, 18);""")
# footprints (a4 c3)
rep("const crabB = KT.makeCrab();","""const prints = new THREE.Group(); GB.add(prints); const printList = [];
for (let i = 0; i < 44; i++) { const m = part(prints, ell(14, 1.2, 8, 10, 6), M('#b88a52', '#a07a4a', 0), 0, [-700 + i * 25, gY(-700 + i * 25, 300 + (i % 2 ? 10 : -10)) + 1.2, 300 + (i % 2 ? 10 : -10)]); printList.push(m); }
prints.visible = false;
const crabB = KT.makeCrab();""")
rep("if (t >= 202.53 && t < 211.39) { packB.visible = true; stick.visible = true; }","""if (t >= 202.53 && t < 211.39) { packB.visible = true; stick.visible = true; }
    prints.visible = t >= 202.53 && t < 211.39; if (prints.visible) { const bx1 = boyWalkX(t); printList.forEach(m => { m.visible = m.position.x < bx1 - 40; }); }""")
rep("const tipaG = KT.makeTipa(); GB.add(tipaG.root);","const tipaG = KT.makeTipa(); GB.add(tipaG.root); tipaG.root.scale.setScalar(0.5);")
# a3 c4 staging (fence between camera and people, people left/right of the gate)
rep("""else if (t >= 138.07 && t < 145.7) { bB.x = -230; bB.z = 340; bB.yaw = Math.PI / 2 - 0.2; const pt = ease(t, 139, 139.8); B.face.expr = t < 142 ? 'surprised' : 'smile'; B.face.look = [0.4, 0]; bB.arms = { r: { sz: -1.35 * pt, sx: 0.15, el: 0.15, point: true } };
    bR.x = -120; bR.z = 360; bR.yaw = Math.PI / 2 + 0.1;""","""else if (t >= 138.07 && t < 145.7) { bB.x = 20; bB.z = 262; bB.yaw = Math.PI / 2 - 0.5; const pt = ease(t, 139, 139.8); B.face.expr = t < 142 ? 'surprised' : 'smile'; B.face.look = [0.4, 0]; bB.arms = { r: { sz: -1.35 * pt, sx: 0.15, el: 0.15, point: true } };
    bR.x = 190; bR.z = 272; bR.yaw = Math.PI / 2 + 0.5;""")
rep("fence.position.set(-30, gY(0, 250), 250);","fence.position.set(105, gY(105, 150), 150);")
rep("const tx = t < 142 ? 340 : 330 - 260 * ease(t, 142.5, 145.6) * 0 + 120 * Math.sin((t - 142) * 0.9);","const tx = 0;")
rep("const px = t < 142 ? 340 : 340 - 240 * Math.abs(Math.sin(dx * 0.6));","const px = (t < 142 ? 340 : 340 - 240 * Math.abs(Math.sin(dx * 0.6))) - 115;")
rep("const ph = t < 142 ? 0 : (340 - px) / (tipaG.cycle || 120) + dx * 0.0;","const ph = 0;")
rep("sg(138.07, 142.0, 'B', [-760, 215, 700], [20, 90, 130], [-560, 205, 640], [60, 90, 130], 42, 38, 'day');","sg(138.07, 142.0, 'B', [105, 185, -230], [105, 112, 300], [105, 183, -200], [105, 112, 300], 40, 38, 'day');")
rep("sg(142.0, 145.7, 'B', [60, 170, -600], [100, 100, 80], [20, 168, -560], [90, 100, 80], 36, 35, 'day');","sg(142.0, 145.7, 'B', [320, 120, -90], [60, 135, 300], [290, 125, -100], [70, 135, 300], 38, 36, 'day');")
# a4 c3 walking + night sun real
rep("const SUNO = new THREE.Mesh(new THREE.CircleGeometry(15, 28), new THREE.MeshBasicMaterial({ color: '#ffd84a', depthTest: false, depthWrite: false })); SUNO.renderOrder = 56;","const SUNO = new THREE.Mesh(new THREE.CircleGeometry(15, 28), new THREE.MeshBasicMaterial({ color: '#fff0a0', depthTest: false, depthWrite: false })); SUNO.renderOrder = 56;")
rep("const SUNR = new THREE.Mesh(new THREE.RingGeometry(15, 18, 28), new THREE.MeshBasicMaterial({ color: '#261c19', depthTest: false, depthWrite: false })); SUNR.renderOrder = 56; SUNO.add(SUNR);","const SUNR = new THREE.Mesh(new THREE.CircleGeometry(34, 32), new THREE.MeshBasicMaterial({ color: '#ffd060', transparent: true, opacity: 0.28, depthTest: false, depthWrite: false })); SUNR.renderOrder = 55; SUNO.add(SUNR); const SUNR2 = new THREE.Mesh(new THREE.RingGeometry(15, 19, 32), new THREE.MeshBasicMaterial({ color: '#ff9a30', transparent: true, opacity: 0.9, depthTest: false, depthWrite: false })); SUNR2.renderOrder = 56; SUNO.add(SUNR2);")
rep("TALLY.visible = true; tallyBars.forEach","TALLY.visible = true; TALLY.scale.setScalar(1.5); TALLY.position.set(-44, -24, 0); tallyBars.forEach")
rep("sgf(202.53, 207.0, 'B', (t, u) => { const bx0 = boyWalkX(t); return { p: [bx0 + 120, 175, -250], l: [bx0 + 30, 150, 320], fov: 36 }; }, 'day');","sgf(202.53, 207.0, 'B', (t, u) => { const bx0 = boyWalkX(t); return { p: [bx0 + 190, 150, -90], l: [bx0 + 10, 128, 310], fov: 36 }; }, 'day');")
# sunset scene: compass foreground, sun x offset, c2b side view, c4 horizon, c5 scroll MCU
rep("sg(145.7, 150, 'S', [60, 230, -250], [-60, 150, 330], [20, 225, -210], [-60, 150, 330], 38, 36, 'late');","sg(145.7, 150, 'S', [-60, 180, -130], [-60, 118, 330], [-90, 176, -120], [-80, 118, 330], 38, 36, 'late');")
rep("sg(158.4, 162.18, 'S', [-125, 190, -200], [-125, 140, 350], [-110, 192, -190], [-125, 142, 350], 38, 37, 'late');","sg(158.4, 162.18, 'S', [-540, 150, 330], [0, 140, 340], [-500, 152, 330], [0, 142, 340], 36, 35, 'late');")
rep("sg(170.98, 175, 'S', [-10, 230, 880], [0, 175, -900], [-20, 228, 840], [0, 178, -900], 38, 36, 'sunset');","sg(170.98, 175, 'S', [-10, 235, 900], [-250, 395, -900], [-20, 233, 860], [-250, 398, -900], 38, 36, 'sunset');")
rep("sg(175, 179.02, 'S', [20, 215, 900], [-30, 160, -400], [0, 212, 860], [-30, 162, -400], 38, 36, 'sunset');","sg(175, 179.02, 'S', [20, 235, 900], [-250, 392, -900], [0, 232, 860], [-250, 395, -900], 38, 36, 'sunset');")
rep("sg(179.02, 183, 'S', [40, 190, -130], [20, 150, 340], [20, 188, -110], [20, 150, 340], 38, 36, 'sunset');","sg(179.02, 183, 'S', [-340, 172, 335], [0, 162, 335], [-310, 170, 335], [0, 162, 335], 30, 28, 'sunset');")
rep("sgf(183, 186.7, 'S', (t, u) => { const k = sm(u); return { p: [lerp(235, -420, k), 190, 330 - 280 * Math.sin(Math.PI * k)], l: [lerp(-40, 700, k), lerp(140, 130, k), lerp(340, -120, k)], fov: lerp(30, 38, k) }; }, 'sunset');","sg(183, 186.7, 'S', [-310, 170, 335], [0, 162, 335], [-360, 176, 335], [0, 162, 335], 28, 32, 'sunset');")
rep("const sunDoor = L.makeSunDoor(); sunDoor.scale.setScalar(1.9); sunDoor.position.set(0, -14, -7200);","const sunDoor = L.makeSunDoor(); sunDoor.scale.setScalar(1.9); sunDoor.position.set(-2700, -14, -7200);")
rep("SKYS.material.uniforms.uDir.value.set(0, sy, -1).normalize();","SKYS.material.uniforms.uDir.value.set(t < 241.9 ? -0.333 : 0, sy, -1).normalize();")
# pairSun poses
rep("""else if (t < 162.18) { bB.x = -190; bB.z = 340; bB.yaw = Math.PI / 2; const pt = ease(t, 155.2, 156.1);""","""else if (t < 162.18) { bB.x = -190; bB.z = 340; bB.yaw = Math.PI / 2; if (t >= 158.4) { bB.x = -60; bB.z = 300; bB.yaw = Math.PI / 2 + 0.5; } const pt = ease(t, 155.2, 156.1);""")
rep("B.face.expr = 'surprised'; B.face.look = [0.2, 0.2]; bR.x = -60; bR.z = 360; bR.yaw = Math.PI / 2 - 0.2; R.face.expr = 'explaining';","B.face.expr = 'surprised'; B.face.look = [0.2, 0.2]; bR.x = -60; bR.z = 360; bR.yaw = Math.PI / 2 - 0.2; if (t >= 158.4) { bR.x = -60; bR.z = 415; bR.yaw = Math.PI / 2 + 0.35; } R.face.expr = 'explaining';")
rep("else if (t < 186.7) { bB.x = -60; bB.z = 340; bB.yaw = 0.0; const lf","else if (t < 186.7) { bB.x = 0; bB.z = 340; bB.yaw = Math.PI - 0.4; const lf")
rep("bR.x = 100; bR.z = 380; bR.yaw = 2.9; R.face.expr = 'smile'; R.face.look = [-0.3, 0.1]; bR.arms = { l: { sz: -0.3, el: 0.9 } }; }\n  else { // recap","bR.x = 60; bR.z = 500; bR.yaw = Math.PI - 0.25; R.face.expr = 'smile'; R.face.look = [-0.3, 0.1]; bR.arms = { l: { sz: -0.3, el: 0.9 } }; }\n  else { // recap")
_p.save()
