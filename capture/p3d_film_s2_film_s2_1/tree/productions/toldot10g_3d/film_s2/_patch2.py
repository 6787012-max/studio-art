import io
p = 'C:/projects/_studio-animatzia/productions/toldot10g_3d/film_s2/film_s2.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, 1)
rep("beam.material.opacity = 0.08 * k", "beam.material.opacity = 0.0 * k")
rep("bhalo.material.opacity = 0.5 * k", "bhalo.material.opacity = 0.3 * k")
rep("new THREE.PlaneGeometry(18, 12), BASIC('#ffffff', { map: haloTex()", "new THREE.PlaneGeometry(13, 8), BASIC('#ffffff', { map: haloTex()")
rep("oglow.material.opacity = 0.2 * kg", "oglow.material.opacity = 0.12 * kg")
rep("[15.5, [-6, 16, 32], [3, 5, -8]], [19.87, [-7, 12, 26], [3, 5, -12]]", "[15.5, [-6, 18, 34], [3, 2, -8]], [19.87, [-8, 13, 26], [3, -3, -12]]")
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('ok')
