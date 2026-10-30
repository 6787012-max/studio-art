D = 'C:/projects/_studio-animatzia/productions/toldot07_films/film_c/'

def edit(fn, pairs):
    s = open(D + fn, encoding='utf-8').read()
    for a, b in pairs:
        if a not in s:
            print('MISSING in', fn, ':', a[:70]); continue
        s = s.replace(a, b, 1)
    open(D + fn, 'w', encoding='utf-8').write(s)

edit('c_s3.js', [
 ("const rz = GD.z + 500, rx = GD.x + 330;", "const rz = GD.z + 450, rx = GD.x + 60;"),
 ("const px = GD.x - 760, pz = GD.z + 760, py = gdH(px, pz, kk) + 130; cm = CAMS(lt, [{ t0: 52.2, t1: 56.5, p: [px, py, pz], p1: [px + 40, py, pz - 20], l: [GD.x + 40, py - 60, GD.z + 230], l1: [GD.x + 60, py - 55, GD.z + 240], f: 34 }]);",
  "const px = GD.x - 560, pz = GD.z + 560, py = gdH(px, pz, kk) + 150, ly = gdH(GD.x, zz, kk) + 80; cm = { p: [px, py, pz], l: [GD.x + 60, ly, lerp(GD.z + 140, GD.z + 300, lin(lt, 52.2, 55.0))], fov: 34 };"),
 ("const f = [GD.x + 40 - px, GD.z + 230 - pz]", "const f = [GD.x + 60 - px, GD.z + 240 - pz]"),
])
edit('c_s4.js', [
 ("pose(B, { t: T, x: GD.x - 280, z: GD.z + 200, yaw: 2.6,", "pose(B, { t: T, x: GD.x - 240, z: GD.z + 270, yaw: 2.6,"),
 ("gdH(GD.x - 280, GD.z + 200, 1)); fs(B, bFace(T, { expr: lt > 4 ? 'surprised' : 'smile', look: [-0.4, 0.3] }, 0.3));", "gdH(GD.x - 240, GD.z + 270, 1)); fs(B, bFace(T, { expr: lt > 4 ? 'surprised' : 'smile', look: [-0.4, 0.3] }, 0.3));"),
])
s = open(D + 'c_s4.js', encoding='utf-8').read()
a = s.index('function rockGeo2() {')
b = s.index('\n// triptych')
s = s[:a] + '''function rockGeo2() { const g = ell(185, 118, 108, 11, 7), p = g.attributes.position, f = [1.3, 2.9, 4.4];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + 0.15 * Math.sin(x / 185 * 3.3 + f[0]) * Math.sin(y / 118 * 3.9 + f[1]) + 0.1 * Math.sin(z / 108 * 4.1 + f[2]); p.setXYZ(i, x * k, Math.max(y * k, -118 * 0.38), z * k); }
  g.computeVertexNormals(); return g; }''' + s[b:]
open(D + 'c_s4.js', 'w', encoding='utf-8').write(s)

edit('c_s5.js', [
 ("const rz = k < 3.4 ? lerp(zE + 380, zE + 330, step) : lerp(zE + 330, zE + 222, ease(k, 3.4, 4.2));", "const rz = k < 3.4 ? lerp(zE + 380, zE + 330, step) : lerp(zE + 330, zE + 188, ease(k, 3.4, 4.2));"),
 ("pose(R, { t: T, x: 40, z: rz,", "pose(R, { t: T, x: -105, z: rz,"),
 ("splash.scale.setScalar(1.3);", "splash.scale.setScalar(0.8);"),
 ("const [rx, rz] = at(900, -250), [bx, bz] = at(880, -75), SIT = 92;", "const [rx, rz] = at(800, 120), [bx, bz] = at(790, 290), SIT = 40;"),
 ("pose(R, { t: T, x: rx, z: rz, yaw: 2.3, walk: 0, headYaw: turnR,", "R.root.scale.setScalar(0.42); B.root.scale.setScalar(0.42);\n  pose(R, { t: T, x: rx, z: rz, yaw: 2.3, walk: 0, headYaw: turnR,"),
 ("l: [GD.x + 150, 215, GD.z - 360], l1: [GD.x + 150, 220, GD.z - 340], f: 33 }]);", "l: [GD.x + 150, 360, GD.z - 360], l1: [GD.x + 150, 365, GD.z - 340], f: 33 }]);"),
])
print('done')
