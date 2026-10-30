D = 'C:/projects/_studio-animatzia/productions/toldot07_films/film_c/'

def edit(fn, pairs):
    s = open(D + fn, encoding='utf-8').read()
    for a, b in pairs:
        if a not in s:
            print('MISSING in', fn, ':', a[:80]); continue
        s = s.replace(a, b, 1)
    open(D + fn, 'w', encoding='utf-8').write(s)

edit('c_s3.js', [
 ("const rz = GD.z + 450, rx = GD.x + 60;", "const rz = GD.z + 340, rx = GD.x + 215;"),
 ("walk: walking || sliding ? 1 : 0, ph: sliding ? (d0 + 120 * (lt - 52.2)) / B.cycle : d0 / B.cycle, lean: walking ? 14 : sliding ? -10 : 0,",
  "walk: walking ? 1 : 0, ph: d0 / B.cycle, lean: walking ? 14 : sliding ? -16 : 0, headTilt: sliding ? -6 : 0,"),
 ("arms: sliding || lt >= 55.0 ? { l: { sz: 2.7, sx: 0.4, el: 0.2 }, r: { sz: 2.7, sx: 0.4, el: 0.2 } } : undefined }, by);",
  "arms: sliding || lt >= 55.0 ? { l: { sz: 1.9, sx: 0.9, el: 0.2 }, r: { sz: 1.9, sx: 0.9, el: 0.2 } } : undefined }, by);"),
 ("yaw: -PI / 2 + 0.3, walk: walking", "yaw: sliding || lt >= 55.0 ? -PI / 2 + 0.75 : -PI / 2 + 0.3, walk: walking"),
 ("yaw: -PI / 2 - 0.9, walk: 0, headTilt: lt > 52.2", "yaw: -PI / 2 - 1.5, walk: 0, headTilt: lt > 52.2"),
])
edit('c_s5.js', [
 ("pose(B, { t: T, x: -190, z: bz,", "pose(B, { t: T, x: lerp(-190, -170, ease(k, 3.7, 5.0)), z: bz,"),
 ("lerp(zE + 44, zE + 118, ease(k, 3.7, 5.0));", "lerp(zE + 44, zE + 132, ease(k, 3.7, 5.0));"),
 ("lerp(zE + 330, zE + 188, ease(k, 3.4, 4.2));", "lerp(zE + 330, zE + 180, ease(k, 3.4, 4.2));"),
 ("pose(R, { t: T, x: -105, z: rz,", "pose(R, { t: T, x: -72, z: rz,"),
 ("vig.visible = true; rprops.visible = true; fgb.visible = true;\n  const U", "vig.visible = true; rprops.visible = true; fgb.visible = false;\n  const U"),
])
print('ok')
