import io
p = 'C:/projects/_studio-animatzia/productions/katzar_k04_3d/film.js'
s = io.open(p, encoding='utf-8', newline='').read()
crlf = '\r\n' in s
s = s.replace('\r\n', '\n')


def R(a, b):
    global s
    assert a in s, a[:80]
    s = s.replace(a, b, 1)


# ---- vision overlay (golden staircase to a glowing book), screen space, with holes around the people
R("/* ------------------------------------------------------------------ small utils */", """const visMat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false,
  uniforms: { uVis: { value: 0 }, uTime: { value: 0 }, uCx: { value: 0.5 }, uY0: { value: 0.4 }, uY1: { value: 0.84 }, uW: { value: 0.2 }, uAsp: { value: 16 / 9 }, uH: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `varying vec2 vUv; uniform float uVis, uTime, uCx, uY0, uY1, uW, uAsp; uniform vec3 uH[3];
  void main(){
    vec2 p = vUv; float t = (p.y - uY0) / (uY1 - uY0); float tc = clamp(t, 0.0, 1.0);
    float hw = mix(uW, uW * 0.16, pow(tc, 0.75)); float dx = abs(p.x - uCx);
    float inside = step(0.0, t) * step(t, 1.0) * step(dx, hw);
    float d = 1.0 / (1.0 - 0.86 * tc); float fs = fract(d * 2.6);
    vec3 tread = vec3(1.0, 0.86, 0.42), riser = vec3(0.9, 0.58, 0.16);
    vec3 col = mix(riser, tread, step(0.22, fs));
    float run = exp(-pow((fract(tc * 0.9 - uTime * 0.28) - 0.5) * 5.0, 2.0));
    col += vec3(1.0, 0.95, 0.7) * run * 0.7;
    float rail = smoothstep(hw * 0.9, hw, dx) * inside;
    col = mix(col, vec3(1.0, 0.97, 0.8), rail * 0.8);
    vec2 bc = vec2(uCx, uY1 + 0.045);
    vec2 bq = (p - bc) * vec2(uAsp, 1.0);
    float book = (1.0 - smoothstep(0.075, 0.085, abs(bq.x) * 1.0 + abs(bq.y) * 2.0)) * step(-0.02, bq.y + 0.02);
    float halo = exp(-length(bq * vec2(1.0, 1.4)) * 7.0);
    float beam = exp(-pow(dx / (0.05 + 0.1 * clamp(t, 0.0, 1.2)), 2.0)) * smoothstep(-0.05, 0.2, t) * 0.25;
    float a = max(inside * 0.88, max(book, max(halo * 0.75, beam)));
    vec3 outc = col * inside + vec3(1.0, 0.95, 0.75) * (book + halo * 0.8) + vec3(1.0, 0.85, 0.5) * beam;
    outc = mix(vec3(1.0, 0.86, 0.5), outc, clamp(inside + book, 0.0, 1.0));
    for (int i = 0; i < 3; i++) { vec2 q = (p - uH[i].xy) * vec2(uAsp, 1.0); a *= mix(1.0, smoothstep(uH[i].z * 0.7, uH[i].z, length(q)), step(0.001, uH[i].z)); }
    gl_FragColor = vec4(outc, a * uVis);
  }` });
const visQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), visMat); visQuad.frustumCulled = false; visQuad.renderOrder = 11; scene.add(visQuad);
const _hv = new THREE.Vector3(), _hb = new THREE.Box3();
function holeFor(id, idx) {
  const A = ACT[id], u = visMat.uniforms.uH.value[idx];
  if (!A || !A.h.visible) { u.set(0, 0, 0); return; }
  A.h.updateMatrixWorld(true); _hb.setFromObject(A.h);
  _hv.set((_hb.min.x + _hb.max.x) / 2, _hb.max.y, (_hb.min.z + _hb.max.z) / 2).project(cam); const top = _hv.y;
  _hv.set((_hb.min.x + _hb.max.x) / 2, _hb.min.y, (_hb.min.z + _hb.max.z) / 2).project(cam); const bot = _hv.y;
  _hv.set((_hb.min.x + _hb.max.x) / 2, _hb.max.y, (_hb.min.z + _hb.max.z) / 2).project(cam);
  const hgt = Math.abs(top - bot) / 2;
  u.set(_hv.x * 0.5 + 0.5, (top * 0.5 + 0.5) - hgt * 0.35, Math.max(0.1, hgt * 0.62));
}

/* ------------------------------------------------------------------ small utils */""")
# STAIRS 3D off, overlay on (after the camera is set): in frame()
R("  camState.p = c.p; camState.l = c.l;", """  camState.p = c.p; camState.l = c.l;
  { const e = E(t), ve = e.vision; visMat.uniforms.uVis.value = Math.min(1, ve * 1.25); visMat.uniforms.uTime.value = t; visQuad.visible = ve > 0.01;
    const s6 = t < 130; visMat.uniforms.uCx.value = s6 ? 0.5 : 0.74; visMat.uniforms.uY0.value = s6 ? 0.36 : 0.3; visMat.uniforms.uY1.value = s6 ? 0.8 : 0.78; visMat.uniforms.uW.value = s6 ? 0.2 : 0.17;
    if (visQuad.visible) { if (s6) { holeFor('RA', 0); holeFor('RB', 1); visMat.uniforms.uH.value[2].set(0, 0, 0); } else { holeFor('BO', 0); visMat.uniforms.uH.value[1].set(0, 0, 0); visMat.uniforms.uH.value[2].set(0, 0, 0); } } }""")
R("STAIRS.visible = vis > 0.01;", "STAIRS.visible = false;")

# ---- s02 sefer foreground
R("const rs = mkRoute(chain(19.2, 150, [[-1700, 70, 0, { yaw: -0.5 }], [-900, 60, 0, { yaw: -0.6 }], [-900, 60, 0, { wait: 8, yaw: -0.6 }], [-1700, 70, 0]]));",
  "const rs = mkRoute(chain(18.2, 200, [[-1300, 560, 0, { yaw: -0.4 }], [-540, 560, 0, { wait: 6.6, yaw: -1.2 }], [-1300, 560, 0]]));")
R("if (t >= 19.2 && t < 29.6) { r = rs.at(t); which = 1; }", "if (t >= 18.2 && t < 29.6) { r = rs.at(t); which = 1; }")
R("const q = which === 1 ? (t > 20.8 && t < 26.6)", "const q = which === 1 ? (t > 21.2 && t < 27.0)")
# s03 sefer slightly clear of the goat
R("[-1200, 200, 0, { wait: 20, yaw: -1.2 }]]", "[-1130, 240, 0, { wait: 20, yaw: -1.2 }]]")

# ---- s01 headroom, s02 ramp higher in frame
R("[5.0, [1390, 320, 1230], [1880, 250, 450], 30], [13.6, [1420, 320, 1180], [1900, 240, 450], 30]]", "[5.0, [1390, 320, 1230], [1880, 285, 450], 30], [13.6, [1420, 320, 1180], [1900, 280, 450], 30]]")
R("cam: hermite([[13.6, [-980, 330, 1500], [-760, 190, -150], 32], [22, [-420, 330, 1450], [-250, 210, -120], 32], [29.8, [-60, 340, 1400], [100, 230, -110], 32]])",
  "cam: hermite([[13.6, [-1000, 330, 1750], [-780, 110, -150], 36], [22, [-440, 330, 1650], [-300, 130, -120], 34], [29.8, [-80, 340, 1650], [60, 150, -110], 36]])")

# ---- s05 depth rows + margin, softer-but-visible rings
R("const [sx, sz] = spots[id], k = pairIdx[id[0]]", "const [sx0, sz0] = spots[id], sx = sx0 * 0.86, sz = sz0 + (id[1] === '2' ? 75 : -35), k = pairIdx[id[0]]")
R("const spotC = [[-750, 150], [-250, 130], [260, 110], [750, 150]]", "const spotC = [[-645, 150], [-215, 130], [225, 110], [645, 150]]")
R("r.userData.mats[0].opacity = 0.55 * k; r.userData.mats[1].opacity = 0.11 * k; r.userData.mats[2].opacity = 0.16 * k;", "r.userData.mats[0].opacity = 0.75 * k; r.userData.mats[1].opacity = 0.16 * k; r.userData.mats[2].opacity = 0.2 * k;")

# ---- s06 / s07 cameras: bigger rabbis, table low
a = s.index("SHOTS[5].cam = hermite([")
b = s.index("// s08: street tracking")
s = s[:a] + """SHOTS[5].cam = hermite([
  [84, [-200, 400, 2330], [0, 170, 1580], 30],
  [92, [-60, 410, 2260], [10, 175, 1580], 30],
  [97, [-30, 420, 2330], [10, 215, 1580], 32],
  [101, [0, 430, 2400], [0, 260, 1500], 34],
  [105, [0, 420, 2330], [0, 225, 1560], 32],
  [110.5, [40, 410, 2270], [0, 185, 1580], 31],
  [116, [60, 410, 2260], [0, 180, 1580], 30],
  [125.9, [30, 410, 2250], [10, 180, 1580], 30]]);
""" + s[b:]
R("hermite([[125.9, [30, 310, 2450], [20, 225, 1580], 30], [129.2, [30, 300, 2350], [-60, 230, 1580], 29]])", "hermite([[125.9, [30, 410, 2250], [10, 180, 1580], 30], [129.2, [10, 390, 2100], [-40, 190, 1580], 29]])")

# ---- s08 arrows thin and small; hall camera
R("a.position.set(-60 + 100 * Math.cos(aa), 80 + (i % 3) * 90, (side > 0 ? 480 + 40 * (i % 3) : -(650 + 120 * (i % 3)))); a.rotation.y = -aa; a.scale.setScalar(Math.max(0.001, 0.9 * sk)); });",
  "a.position.set(-60 + 90 * Math.cos(aa), 120 + (i % 3) * 70, (side > 0 ? 420 + 30 * (i % 3) : -(600 + 80 * (i % 3)))); a.rotation.y = -aa; a.scale.setScalar(Math.max(0.001, 0.32 * sk)); });")

# ---- s09 camera: back off a little
R("R = lerp(820, 640, u), c = [BOH.x, 165, BOH.z];", "R = lerp(980, 800, u), c = [BOH.x, 150, BOH.z];")

# ---- s10
R("po.headTilt = 22 * sad - 4 * (1 - sad);", "po.headTilt = 9 * sad - 4 * (1 - sad);")
R("a = lerp(0.3, -0.1, down) , R = lerp(430, 820, down), c = [BOYP.x + lerp(0, 50, down), lerp(110, 170, down), BOYP.z];\n  const hy = lerp(480, 230, down), look = [c[0], lerp(100, 232, down), c[2]];",
  "a = lerp(0.62, -0.05, down) , R = lerp(780, 1050, down), c = [BOYP.x + lerp(0, 60, down), lerp(110, 160, down), BOYP.z];\n  const hy = lerp(700, 250, down), look = [c[0], lerp(90, 215, down), c[2]];")
R("fov: 30 + 5 * Math.sin(Math.PI * down) };", "fov: 30 + 4 * Math.sin(Math.PI * down) };")

# ---- s11: closer, table lower in frame; animals out on the grass
R("hermite([[193, [0, 290, 2480], [0, 170, 1500], 30], [198, [0, 340, 2560], [0, 180, 1400], 31], [203, [0, 480, 2680], [0, 200, 1000], 38]",
  "hermite([[193, [0, 300, 2300], [0, 120, 1500], 30], [198, [0, 340, 2420], [0, 140, 1400], 31], [203, [0, 480, 2680], [0, 200, 1000], 38]")
R("D1: [-420, 520], D2: [-330, 640], S1: [-110, 500], S2: [-40, 610], C1: [210, 470], C2: [330, 590], R1: [470, 540], R2: [540, 650], S3: [-600, 640], S4: [-520, 520], G1: [640, 470], G2: [700, 600]",
  "D1: [-420, 220], D2: [-330, 340], S1: [-110, 200], S2: [-40, 310], C1: [210, 170], C2: [330, 290], R1: [470, 240], R2: [540, 350], S3: [-600, 340], S4: [-520, 220], G1: [640, 170], G2: [700, 300]")

io.open(p, 'w', encoding='utf-8', newline='').write(s.replace('\n', '\r\n') if crlf else s)
print('ok')
