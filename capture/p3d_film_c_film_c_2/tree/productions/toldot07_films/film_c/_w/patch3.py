import re
D = 'C:/projects/_studio-animatzia/productions/toldot07_films/film_c/'

def edit(fn, pairs):
    s = open(D + fn, encoding='utf-8').read()
    for a, b in pairs:
        if a not in s:
            print('MISSING in', fn, ':', a[:70]); continue
        s = s.replace(a, b, 1)
    open(D + fn, 'w', encoding='utf-8').write(s)

# ---------------- s5 (cliff + recap)
edit('c_s5.js', [
 ("const turf = new THREE.Mesh(new THREE.PlaneGeometry(3600, 900, 1, 1).rotateX(-PI / 2), toon('#86bb5c', { tint: '#6f9f4c', hi: 0 })); turf.position.set(0, TOP + 2, 800);",
  "const turf = new THREE.Mesh(new THREE.PlaneGeometry(3600, 920, 1, 1).rotateX(-PI / 2), toon('#86bb5c', { tint: '#6f9f4c', hi: 0 })); turf.position.set(0, TOP + 9, 770);"),
 ("t.position.set(x, TOP + 2, z); GK.add(t); }\n  for (let i = 0; i < 14", "t.position.set(x, TOP + 9, z); GK.add(t); }\n  for (let i = 0; i < 14"),
 ("b.position.set(x, TOP + 2, z); GK.add(b); }", "b.position.set(x, TOP + 9, z); GK.add(b); }"),
 ("[-1100 + i * 200, TOP + 2, 520]", "[-1100 + i * 200, TOP + 9, 520]"),
 ("[-1100 + i * 200, TOP + 50, 520]", "[-1100 + i * 200, TOP + 57, 520]"),
 ("const pieces = [0, 1, 2, 3, 4, 5]", "const topDress = cliff.root.children.filter(c => c.isGroup && Math.abs(c.position.y - TOP) < 1 && c.position.z >= 400);\nconst pieces = [0, 1, 2, 3, 4, 5]"),
 ("  show(GK, R, B); skyTo('day'); let cm;\n  if (!flags.collect) { cliff.update(T)", "  show(GK, R, B); skyTo('day'); let cm; topDress.forEach(v => { v.visible = lt < 33.62; });\n  if (!flags.collect) { cliff.update(T)"),
 # c1 staging (frame right = -x)
 ("pr(R, -340, 20, PI / 2 - 0.5, { headYaw: 0.2,", "pr(R, -130, 20, PI / 2 - 0.5, { headYaw: 0.2,"),
 ("pr(B, -170, 10, PI / 2 - 0.4, { headTilt: -4 });", "pr(B, -420, 10, PI / 2 - 0.5, { headTilt: -4 });"),
 ("l: [-250, 160, 30], f: 32 }]);", "l: [-270, 165, 30], f: 32 }]);"),
 ("p: [-180, 210, -800], p1: [-240, 210, -740],", "p: [-200, 210, -820], p1: [-250, 210, -760],"),
 # c2 staging
 ("pr(R, 20, 10, PI / 2 - 0.55, { headTilt: -4,", "pr(R, 250, 10, PI / 2 - 0.2, { headTilt: -4,"),
 ("pr(B, 190, 10, PI / 2 - 0.45, { headTilt: -6 });", "pr(B, -10, 10, PI / 2 - 0.5, { headTilt: -6 });"),
 # spray
 ("const ux = ((i * 37) % 17 - 8) * 30, uu = (wv - 0.28) / 0.62;\n      spray.set(i, 200 + ux, 10 + 120 * 4 * uu * (1 - uu) * (0.4 + (i % 5) / 5), face0(200) - 14 - 40 * uu, 7 * (1 - 0.6 * uu)); }",
  "const h1 = frac(Math.sin(i * 12.9898) * 43758.5453), h2 = frac(Math.sin(i * 78.233) * 12345.678), uu = (wv - 0.28) / 0.62;\n      spray.set(i, 200 + (h1 - 0.5) * 520, 12 + 150 * 4 * uu * (1 - uu) * (0.3 + h2), face0(200 + (h1 - 0.5) * 520) - 14 - 40 * uu * h2, (6 + 7 * h2) * (1 - 0.5 * uu)); }"),
 ("splash.scale.setScalar(2.2);", "splash.scale.setScalar(1.3);"),
 # c5 re-layout
 ("const bz = k < 3.2 ? lerp(zE + 150, zE + 38, step) : lerp(zE + 38, zE + 112, ease(k, 3.7, 5.0));", "const bz = k < 3.2 ? lerp(zE + 150, zE + 44, step) : lerp(zE + 44, zE + 118, ease(k, 3.7, 5.0));"),
 ("pose(B, { t: T, x: 90, z: bz, yaw: PI / 2 + (k < 3.2 ? 0.55 : lerp(0.55, -2.4, ease(k, 3.2, 3.9))),", "pose(B, { t: T, x: -190, z: bz, yaw: PI / 2 + 0.3 + lerp(0, 1.61, ease(k, 3.2, 3.9)),"),
 ("}, TOP + 2);\n    fs(B, bFace(T, { expr: k < 3.0 ? 'laugh'", "}, TOP + 9);\n    fs(B, bFace(T, { expr: k < 3.0 ? 'laugh'"),
 ("pose(R, { t: T, x: -80, z: rz, yaw: PI / 2 - 0.15,", "pose(R, { t: T, x: 40, z: rz, yaw: PI / 2 + lerp(0.1, 1.2, hold) - 0.5 * away,"),
 ("sx: away > 0.5 ? -0.6 : -0.15 * hold, el: 0.2, point: away > 0.5 } } }, TOP + 2);", "sx: away > 0.5 ? -0.6 : -0.15 * hold, el: 0.2, point: away > 0.5 } } }, TOP + 9);"),
 ("p: [-560, TOP + 190, zE + 1150], p1: [-500, TOP + 180, zE + 1090], l: [20, TOP + 100, zE + 170], l1: [30, TOP + 100, zE + 170], f: 33 }]);", "p: [-560, TOP + 200, zE + 1050], p1: [-500, TOP + 190, zE + 990], l: [-90, TOP + 110, zE + 160], l1: [-80, TOP + 110, zE + 160], f: 33 }]);"),
 # recap placement
 ("const [rx, rz] = at(760, -330), [bx, bz] = at(740, -120), SIT = 92;", "const [rx, rz] = at(900, -250), [bx, bz] = at(880, -75), SIT = 92;"),
])

# ---------------- s4
edit('c_s4.js', [
 ("clock.position.set(GD.x + 40, 520, GD.z + 120);", "clock.position.set(GD.x + 260, 500, GD.z + 430);"),
 ("pcs.push({ x, y, s: 17 + r() * 9, a: r() * 6 });", "pcs.push({ x, y, s: 11 + r() * 6, a: r() * 6 });"),
 ("const sh = W.makeParticles(70, '#ffffff', new THREE.SphereGeometry(1, 8, 6).scale(1, 0.7, 0.3)); g.add(sh.mesh); const pcs = [];\n  for (let i = 0; i < 70; i++)", "const sh = W.makeParticles(70, '#ffffff', new THREE.SphereGeometry(1, 8, 6).scale(1, 0.7, 0.3)); g.add(sh.mesh); const pcs = [];\n  for (let i = 0; i < 46; i++)"),
 ("p: [0, 240, 1300], p1: [0, 230, 1200], l: [0, 200, 0], f: 33 }", "p: [0, 235, 1080], p1: [0, 225, 1020], l: [0, 190, 0], f: 33 }"),
 ("part(grp, tubeAlong([V(A[0] + ux * r1, ay + uy * r1, 60), V((A[0] + mx) / 2 + 0, (ay + my) / 2 + 10, 66), V(mx, my + 4, 68)], 8,", "part(grp, tubeAlong([V(A[0] + ux * r1, ay + uy * r1, 60), V((A[0] + mx) / 2 + 0, (ay + my) / 2 + 10, 66), V(mx, my + 4, 68)], 5.5,"),
 ("part(grp, tubeAlong([V(Bq[0] - ux * r2, by - uy * r2, 60), V((Bq[0] + mx) / 2, (by + my) / 2 + 10, 66), V(mx, my + 4, 68)], 8,", "part(grp, tubeAlong([V(Bq[0] - ux * r2, by - uy * r2, 60), V((Bq[0] + mx) / 2, (by + my) / 2 + 10, 66), V(mx, my + 4, 68)], 5.5,"),
 ("function rockGeo2() { return W.rockGeo(190, 125, 110, 17, 0.2); }",
  "function rockGeo2() { const g0 = new THREE.IcosahedronGeometry(1, 1); const p = g0.attributes.position, r = rng(23);\n  for (let i = 0; i < p.count; i++) { const k = 1 + 0.16 * Math.sin(i * 12.9) + 0.1 * Math.cos(i * 7.7); p.setXYZ(i, p.getX(i) * 185 * k, Math.max(p.getY(i), -0.52) * 118 * k, p.getZ(i) * 110 * k); }\n  const g = g0.toNonIndexed(); g.computeVertexNormals(); return g; }"),
])

# ---------------- s3
edit('c_s3.js', [
 ("slideU = lin(lt, 52.2, 55.0), zs = lerp(GD.z + 90, GD.z + 360,", "slideU = lin(lt, 52.2, 55.0), zs = lerp(GD.z + 90, GD.z + 290,"),
 ("const rz = GD.z + 380, rx = GD.x + 250;", "const rz = GD.z + 500, rx = GD.x + 330;"),
])
print('done')
