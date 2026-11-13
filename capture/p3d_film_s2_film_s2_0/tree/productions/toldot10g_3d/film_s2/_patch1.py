import io
p = 'C:/projects/_studio-animatzia/productions/toldot10g_3d/film_s2/film_s2.js'
s = io.open(p, encoding='utf-8').read()
R = []
def rep(a, b):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, 1)

rep("[[0, [9, 14.6, 46], [0, 13.2, 0]], [8, [4, 14.8, 33], [0, 14.4, 0]], [17.44, [-1.5, 15.2, 23.5], [0, 14.9, 0]]]",
    "[[0, [8, 14.6, 38], [0, 13.4, 0]], [8, [3.5, 14.8, 29], [0, 14.4, 0]], [17.44, [-1.2, 15.2, 21.5], [0, 14.9, 0]]]")
rep("halo.material.opacity = 0.7 * hu * (0.65 + 0.35 * Math.sin(lt * 5)); halo.scale.setScalar(1 + 1.6 * ramp(lt, 14, 16.4) + 0.2 * Math.sin(lt * 6));",
    "halo.material.opacity = 0.4 * hu * (0.65 + 0.35 * Math.sin(lt * 5)); halo.scale.setScalar(0.8 + 0.7 * ramp(lt, 14, 16.4) + 0.1 * Math.sin(lt * 6));")
rep("tglow.material.opacity = 0.55 * ramp(lt, 8.5, 9.2)", "tglow.material.opacity = 0.2 * ramp(lt, 8.5, 9.2)")
rep("new THREE.BoxGeometry(1.0, 0.1, 0.2), lam('#1c1c22')); d.position.set(-6.5 + i * 1.44, 0.16, 0.2);",
    "new THREE.BoxGeometry(1.1, 0.14, 0.36), lam('#1c1c22')); d.position.set(-6.5 + i * 1.44, 0.2, -0.5);")
rep("pencil.position.set(px, 0.2 + 0.08 * Math.sin(lt * 14), 0.2);", "pencil.position.set(px, 0.2 + 0.08 * Math.sin(lt * 14), -0.5);")
rep("[[8.3, [52, 21, 28], [61, -1, -7]], [12, [57, 17, 24], [66, -1, -7]], [16.85, [67, 16, 21], [68, -1, -7]]]",
    "[[8.3, [48, 22, 30], [58, -1, -8]], [12, [56, 20, 27], [64, -1, -7]], [16.85, [64, 19, 25], [66, -1, -7]]]")
rep("paper.position.set(74, -1.45, -7); paper.rotation.y = -0.1; desk.add(paper);",
    """paper.position.set(74, -1.45, -7); paper.rotation.y = -0.1; desk.add(paper);
  [['#8a2f2a', 6, 1.0, 4.2, 0.3], ['#2f4a7a', 5.4, 0.9, 3.8, -0.2], ['#a8782a', 5, 0.9, 3.6, 0.4]].forEach(([c, w, h, d, ry], i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(c)); b.position.set(51, -1.55 + h / 2 + [0, 1.0, 1.9][i], 2); b.rotation.y = ry; b.castShadow = true; b.receiveShadow = true; desk.add(b); });
  const inkw = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 1.2, 16), phong('#1c1c24', { shininess: 80 })); inkw.position.set(85.5, -0.95, -11); inkw.castShadow = true; desk.add(inkw);
  const qu = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 7, 6), lam('#f4eedc')); qu.position.set(86.3, 2.3, -11); qu.rotation.z = -0.3; desk.add(qu);
  const cmp = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 0.6, 24), phong('#c9a24a', { shininess: 80 })); cmp.position.set(62, -1.2, 6); cmp.castShadow = true; desk.add(cmp);
  const cmf = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.64, 24), lam('#f2ead2')); cmf.position.set(62, -1.18, 6); desk.add(cmf);
  const cmn = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 3.4), lam('#b02a1c')); cmn.position.set(62, -0.85, 6); cmn.rotation.y = 0.6; desk.add(cmn);
  const scr = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 7, 14).rotateZ(Math.PI / 2), lam('#eadcae')); scr.position.set(80, -0.9, 4.5); scr.rotation.y = 0.25; scr.castShadow = true; desk.add(scr);""")

rep("new THREE.BoxGeometry(20, 30, 2.4), lam('#4a4a58', { map: noiseTex(57, 3, 4) })); stele.position.set(0, 15.2, -9);",
    "new THREE.BoxGeometry(14, 23.5, 2.4), lam('#4a4a58', { map: noiseTex(57, 3, 4) })); stele.position.set(0, 13, -9);")
rep("new THREE.BoxGeometry(24, 1.6, 4.4), stoneM); sb.position.set(0, 0.8, -9);", "new THREE.BoxGeometry(17, 1.4, 4.2), stoneM); sb.position.set(0, 0.7, -9);")
rep("new THREE.PlaneGeometry(15.5, 28), BASIC('#ffffff', { map: ot, transparent: true, opacity: 0, depthWrite: false })); outline.position.set(0, 15.6, -7.75);",
    "new THREE.PlaneGeometry(10.4, 19), BASIC('#ffffff', { map: ot, transparent: true, opacity: 0, depthWrite: false })); outline.position.set(0, 13.4, -7.75);")
rep("new THREE.PlaneGeometry(34, 44), BASIC('#ffffff', { map: haloTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); oglow.position.set(0, 16, -7.2);",
    "new THREE.PlaneGeometry(22, 30), BASIC('#ffffff', { map: haloTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); oglow.position.set(0, 13.4, -7.2);")
rep("oglow.material.opacity = 0.5 * kg", "oglow.material.opacity = 0.2 * kg")
rep("outline.position.y = 15.6 + 0.12", "outline.position.y = 13.4 + 0.1")
rep("lec.position.set(0, 0, 2); shadowable(lec);", "lec.position.set(0, 0, 2); lec.scale.setScalar(1.5); shadowable(lec);")
rep("book.scale.setScalar(0.66); book.position.set(0, 6.95, 2.05);", "book.scale.setScalar(1.0); book.position.set(0, 10.45, 2.1);")
rep("new THREE.PlaneGeometry(14, 10), BASIC('#ffffff', { map: haloTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); bhalo.position.set(0, 8.0, 2.9);",
    "new THREE.PlaneGeometry(18, 12), BASIC('#ffffff', { map: haloTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); bhalo.position.set(0, 12.4, 3.4);")
rep("bhalo.material.opacity = 0.75 * k", "bhalo.material.opacity = 0.5 * k")
rep("new THREE.ConeGeometry(5.5, 16, 24, 1, true).translate(0, 8, 0), ADD('#ffe6a0', 0)); beam.position.set(0, 7.2, 2.1);",
    "new THREE.ConeGeometry(7.5, 20, 24, 1, true).translate(0, 10, 0), ADD('#ffe6a0', 0)); beam.position.set(0, 10.6, 2.1);")
rep("beam.material.opacity = 0.16 * k", "beam.material.opacity = 0.08 * k")
rep("(hash2(i, 6) - 0.5) * 9 + 0.4 * Math.sin(lt + i), 7.4 + f * 14,", "(hash2(i, 6) - 0.5) * 12 + 0.4 * Math.sin(lt + i), 10.9 + f * 14,")
rep("[[0, [3, 6.2, 31], [0, 12.5, -4]], [3.8, [1.2, 6.8, 25], [0, 11.5, -4]], [7.49, [-1.5, 7.6, 18.5], [0, 10.6, -3]]]",
    "[[0, [3, 8, 40], [0, 13.5, -4]], [3.8, [1.2, 9, 34], [0, 12.8, -4]], [7.49, [-1.5, 10, 28], [0, 12.4, -3]]]")

rep("s.mat.emissive.setRGB(0.5 * l * 0.55, 0.42 * l * 0.55, 0.16 * l * 0.55)", "s.mat.emissive.setRGB(0.5 * l * 0.28, 0.42 * l * 0.28, 0.16 * l * 0.28)")
rep("s.glow.material.opacity = 0.2 * l", "s.glow.material.opacity = 0.09 * l")
rep("new THREE.SphereGeometry(0.62, 18, 14), BASIC('#ff4a1e')); const jh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12)",
    "new THREE.SphereGeometry(0.9, 18, 14), BASIC('#ff4a1e')); const jh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12)")

rep("[[0, [-9, 20, 60], [-1, 0, -10]], [4, [-5, 24, 58], [0, 0, -10]], [8.13, [-2, 28, 55], [1, 0, -9]]]",
    "[[0, [-10, 30, 50], [-1, 0, -6]], [4, [-6, 34, 48], [0, 0, -6]], [8.13, [-3, 38, 46], [1, 0, -5]]]")
rep("const RZ = -9.0,", "const RZ = -2.0,")
rep("[15.5, [-6, 14, 34], [3, 6, -8]], [19.87, [-8, 7, 28], [2, 8, -10]]", "[15.5, [-6, 16, 32], [3, 5, -8]], [19.87, [-7, 12, 26], [3, 5, -12]]")
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('patched', any(ord(c) > 127 for c in s))
