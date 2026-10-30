import os
os.chdir('C:/projects/_studio-animatzia/productions/katzar_k04_3d')
s = open('film.js', encoding='utf-8').read()
q = open('props.js', encoding='utf-8').read()


def R(a, b):
    global s
    assert a in s, a[:80]
    s = s.replace(a, b, 1)


def Q(a, b):
    global q
    assert a in q, a[:80]
    q = q.replace(a, b, 1)


# --- rings
Q(q[q.index("export function glowRing"):q.index("export function makeSparkles")], """export function glowRing(hex) {   // soft vertical halo arc (upper half circle, radius 1 in the xy plane) + a faint glow in the middle
  const g = new THREE.Group(), mk = o => new THREE.MeshBasicMaterial({ color: hex || '#ffcf6a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const m0 = mk(), m1 = mk();
  g.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 56, Math.PI), m0)); g.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.09, 8, 56, Math.PI), m1));
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: hex || '#ffcf6a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(2.4, 1.5, 1); sp.position.set(0, 0.35, 0); sp.renderOrder = 30; g.add(sp);
  g.userData.mats = [m0, m1, sp.material]; g.renderOrder = 30; return g;
}
""")
Q("[-420, 1000, 680], [420, 1000, 680], [0, 1500, 640], [-420, 1900, 640], [420, 1900, 640]", "[-420, 1000, 680], [420, 1000, 680], [-420, 1900, 640], [420, 1900, 640]")
R("r.rotation.x = -Math.PI / 2; ARKIN.add(r); pairRings.push(r);", "ARKIN.add(r); pairRings.push(r);")
a = s.index("  ringBochur.visible = ringK")
b = s.index("  // sparkles")
s = s[:a] + """  const setRing = (r, k) => { r.visible = k > 0.01; r.userData.mats[0].opacity = 0.5 * k; r.userData.mats[1].opacity = 0.12 * k; r.userData.mats[2].opacity = 0.28 * k; };
  setRing(ringBochur, ringK); ringBochur.position.set(BOH.x + 10, 150, 1665); ringBochur.rotation.set(0, Math.PI / 2, 0); ringBochur.scale.setScalar(95);
  const rk = rise(t, 195.5, 198);
  [[-165, 1495], [165, 1490]].forEach((p, i) => { const r = ringHall[i]; setRing(r, rk); r.position.set(p[0], 185, p[1]); r.rotation.set(0, 0, 0); r.scale.setScalar(165); });
  ringHall[2].visible = false;
  const spotC = [[-750, 150], [-250, 130], [260, 110], [750, 150]], ringY = [110, 85, 125, 62];
  pairRings.forEach((r, i) => { const on = rise(t, 70.5 + i * 0.8, 73 + i * 0.8) * (1 - rise(t, 83.8, 84.2)), bright = 1 + 0.8 * rise(t, 79.0, 80.5); setRing(r, Math.min(1.5, on * bright)); r.position.set(ARKIN_X + spotC[i][0], ringY[i], spotC[i][1]); r.rotation.set(0, 0, 0); r.scale.setScalar(125); });
""" + s[b:]
# --- ARK2 + rainbow + trees
R("tree(900, -1700, 1.6); tree(-1500, -1700, 1.8);", "tree(900, -3700, 1.6); tree(-1500, -3700, 1.8);")
R("const ARK = PR.makeArk(); OUT.add(ARK);", "const ARK = PR.makeArk(); OUT.add(ARK); const ARK2 = ARK.clone(true); ARK2.position.set(0, 0, -1300); OUT.add(ARK2);   // ARK2 = the same ark further back, used when seen through the hall window")
R("rainbow.position.set(0, -40, -1250);", "rainbow.position.set(0, -40, -2900); rainbow.scale.setScalar(1.5);")
R("OUT.visible = loc === 'out' || loc === 'hall';", "OUT.visible = loc === 'out' || loc === 'hall'; ARK.visible = loc === 'out'; ARK2.visible = loc === 'hall';")
# --- s01 camera
R("[5.5, [500, 800, 2400], [1000, 250, 250], 30], [13.6, [1280, 340, 1420], [1900, 250, 450], 30]", "[2.6, [1000, 700, 2200], [1500, 260, 350], 32], [5.0, [1390, 320, 1230], [1880, 250, 450], 30], [13.6, [1420, 320, 1180], [1900, 240, 450], 30]")
# --- s03 camera + sefer
R("[29.8, [-1250, 290, 1500], [-1560, 150, -150], 32], [36, [-1400, 280, 1380], [-1620, 150, -130], 32], [42.4, [-1480, 270, 1300], [-1650, 150, -140], 32]", "[29.8, [-1180, 290, 1550], [-1480, 150, -150], 34], [36, [-1230, 280, 1450], [-1500, 150, -130], 34], [42.4, [-1260, 270, 1400], [-1520, 150, -140], 34]")
R("[[-2100, 70, 0, { yaw: -0.4 }], [-1050, 60, 0, { yaw: -0.5 }]]", "[[-2100, 70, 0, { yaw: -0.4 }], [-1040, 40, 0, { yaw: -0.55 }]]")
# --- s04
a = s.index("function wander(")
b = s.index("const CHAOS =")
s = s[:a] + """function wander(id, seed, t0, t1) {
  const idx = Object.keys(CHAOS).indexOf(id);
  let x = -1800 + idx * 220 + (hash(seed) - 0.5) * 160, z = 300 + hash(seed + 1) * 700;
  const keys = [[t0, x, z, 0]], n = Math.floor((t1 - t0) / 1.4);
  for (let i = 1; i <= n; i++) { const ang = hash(seed + i * 3) * 6.283, d = 420 + hash(seed + i * 5) * 260; x = cl(x + Math.cos(ang) * d, -1900, 800); z = cl(z + Math.sin(ang) * d * 0.7, 250, 1100); keys.push([t0 + i * (t1 - t0) / n, x, z, 0]); }
  return keys;
}
""" + s[b:]
R("wander(id, CHAOS[id], 42.4, 49.5, 0, 700)", "wander(id, CHAOS[id], 42.4, 48.0)")
R("const t0 = 49.5; const arrive = chain(t0, 520,", "const t0 = 48.0; const arrive = chain(t0, 620,")
R("D1: [-1000, LANE_A], D2: [-1000, LANE_B], C1: [-1650, LANE_A], C2: [-1650, LANE_B], R1: [-2100, LANE_A], R2: [-2100, LANE_B], S1: [-2500, LANE_A], S2: [-2500, LANE_B], S3: [-2900, LANE_A], S4: [-2900, LANE_B], G1: [-3300, LANE_A], G2: [-3300, LANE_B]", "D1: [-1650, LANE_A], D2: [-1650, LANE_B], C1: [-2200, LANE_A], C2: [-2200, LANE_B], R1: [-2650, LANE_A], R2: [-2650, LANE_B], S1: [-3000, LANE_A], S2: [-3000, LANE_B], S3: [-3350, LANE_A], S4: [-3350, LANE_B], G1: [-3700, LANE_A], G2: [-3700, LANE_B]")
R("const ride = chain(Math.max(tA, 52.5) + (id[0] === 'D' ? 0 : order), 215 * (id[0] === 'D' ? 1 : 1.2),", "const ride = chain(Math.max(tA, 52.0) + (id[0] === 'D' ? 0 : order), id[0] === 'D' ? 245 : 260,")
R("const chaos = t < 50;", "const chaos = t < 48.4;")
R("pulse(t, 43.0, 44.5, 51.0, 52.8)", "pulse(t, 43.0, 44.5, 47.2, 48.8)")
R("cx = [-300, 500, -900, 100, 800][seg % 5]", "cx = [-1100, -300, -1500, -700, 100][seg % 5]")
R("kf(t, [[42.0, 0], [47, 1], [62, 0.85], [63.2, 0.5], [64.5, 0], [200, 0]])", "kf(t, [[41.9, 0], [42.0, 0.6], [45, 1], [62, 0.85], [63.2, 0.5], [64.5, 0], [200, 0]])")
# wind lines
R("const rainOut = PR.makeRain(900, 11); scene.add(rainOut);", """const rainOut = PR.makeRain(900, 11); scene.add(rainOut);
const WN = 150, wPos = new Float32Array(WN * 6), wGeo = new THREE.BufferGeometry(); wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
const wMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, depthWrite: false }), windLines = new THREE.LineSegments(wGeo, wMat); windLines.frustumCulled = false; windLines.renderOrder = 25; OUT.add(windLines);""")
R("  rainbow.visible = e.rainbow > 0.01;", """  windLines.visible = e.wind > 0.02; wMat.opacity = 0.75 * Math.min(1, e.wind);
  for (let i = 0; i < WN; i++) { const r3 = hash(i + 600), len = 180 + r3 * 260, x = ((hash(i) * 5600 + t * (2300 + r3 * 900)) % 5600) - 2800, y = 60 + hash(i + 300) * 900, z = -400 + hash(i + 900) * 2300, w = 30 * Math.sin(t * 4 + i);
    wPos[i * 6] = x; wPos[i * 6 + 1] = y; wPos[i * 6 + 2] = z; wPos[i * 6 + 3] = x + len; wPos[i * 6 + 4] = y + w; wPos[i * 6 + 5] = z; }
  wGeo.attributes.position.needsUpdate = true;
  rainbow.visible = e.rainbow > 0.01;""")
# --- s05 entry
R("[[INX + 900, sz - 200, 0], [INX + sx + 260, sz, 0], [INX + sx, sz, 0, { yaw: fy }]]", "[[INX + sx + 520, sz - 70, 0], [INX + sx, sz, 0, { yaw: fy }]]")
R("t0 = 63.2 + 0.5 + k * 1.1 + (id[1] === '2' ? 0.4 : 0);" if "t0 = 63.2 + 0.5 + k * 1.1" in s else "t0 = 63.0 + k * 1.0 + (id[1] === '2' ? 0.4 : 0);", "t0 = 62.2 + k * 0.45 + (id[1] === '2' ? 0.2 : 0);")
# --- s08 hall camera
R("[[152, [-420, 380, 2500], [-60, 260, 1580], 30], [159, [-200, 330, 2250], [-60, 270, 1580], 28]]", "[[152, [-380, 330, 2400], [-60, 140, 1580], 30], [159, [-200, 300, 2150], [-60, 150, 1580], 28]]")
# --- s10
R("a = lerp(0.3, -0.1, down) , R = lerp(850, 700, down), c = [BOYP.x + lerp(0, 90, down), lerp(110, 190, down), BOYP.z];\n  const hy = lerp(800, 260, down), look = [c[0], lerp(60, 190, down), c[2]];", "a = lerp(0.3, -0.1, down) , R = lerp(650, 900, down), c = [BOYP.x + lerp(0, 60, down), lerp(110, 190, down), BOYP.z];\n  const hy = lerp(620, 230, down), look = [c[0], lerp(60, 185, down), c[2]];")
R("fov: lerp(30, 29, down) };", "fov: 30 };")
R("r: { sz: lerp(0.1, 0.45, put), sx: lerp(0, 0.6, put), el: lerp(0.25, 0.35, put), curl: lerp(0.5, 0.3, put) } };\n    po.headTilt = 10 * put; po.headYaw = 0.45 * put;", "r: { sz: lerp(0.1, 0.04, put), sx: lerp(0, 0.52, put), el: lerp(0.25, 0.04, put), curl: lerp(0.5, 0.2, put), th: 0.3 } };\n    po.headTilt = 8 * put; po.headYaw = 0.35 * put;")
# --- s11
R("[193, [-60, 330, 2300], [-40, 200, 1500], 32], [199, [-30, 480, 2550], [0, 190, 1100], 40], [207, [0, 650, 2800], [0, 150, 800], 46]", "[193, [0, 290, 2480], [0, 170, 1500], 30], [198, [0, 340, 2560], [0, 180, 1400], 31], [203, [0, 480, 2680], [0, 200, 1000], 38], [207, [0, 650, 2800], [0, 150, 800], 46]")
open('film.js', 'w', encoding='utf-8').write(s)
open('props.js', 'w', encoding='utf-8').write(q)
print('ok')
