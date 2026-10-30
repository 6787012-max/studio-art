import os, re
os.chdir('C:/projects/_studio-animatzia/productions/katzar_k04_3d')
s = open('film.js', encoding='utf-8', newline='').read()
crlf = '\r\n' in s
if crlf:
    s = s.replace('\r\n', '\n')


def R(a, b):
    global s
    assert a in s, a[:90]
    s = s.replace(a, b, 1)


# ---- G: walk phase planted at start/stop
R("""    if (s.stand) return { x: s.a.x, y: s.a.y, z: s.a.z, d: s.D0, sp: 0, i };
    let d, sp;""", """    if (s.stand) return { x: s.a.x, y: s.a.y, z: s.a.z, d: s.D0, sp: 0, i, ks: 0, ka: 0, Ds: s.D0, De: s.D0 };
    let d, sp;""")
R("""    const f = d / s.len; return { x: s.a.x + s.dx * f, y: s.a.y + s.dy * f, z: s.a.z + s.dz * f, d: s.D0 + d, sp: sp / Math.max(V, 1e-6), i };""",
  """    const f = d / s.len, ks = s.tout && u > s.T - s.tout ? sm((u - (s.T - s.tout)) / s.tout) : 0, ka = s.tin && u < s.tin ? 1 - sm(u / s.tin) : 0;
    return { x: s.a.x + s.dx * f, y: s.a.y + s.dy * f, z: s.a.z + s.dz * f, d: s.D0 + d, sp: sp / Math.max(V, 1e-6), i, ks, ka, Ds: s.D0, De: s.D0 + s.len };""")
R("walk: moving ? cl(b.sp * 2.5, 0.3, 1) : 0, D: b.d, slope: sl };", "walk: moving ? cl(b.sp * 3, 0.0, 1) : 0, D: b.d, slope: sl, ks: b.ks, ka: b.ka, Ds: b.Ds, De: b.De };")
R("/* ------------------------------------------------------------------ worlds */", """// walk phase: distance based (feet planted); within the ease-in / ease-out the phase is nudged so the stride rests on a half cycle (both feet planted) at every start and stop
const PH = (r, cyc) => { let ph = r.D / cyc; if (r.ks) ph += (Math.round(2 * r.De / cyc) / 2 - r.De / cyc) * r.ks; if (r.ka) ph += (Math.round(2 * r.Ds / cyc) / 2 - r.Ds / cyc) * r.ka; return ph; };

/* ------------------------------------------------------------------ worlds */""")
n0 = len(re.findall(r"ph: r\.D / ([\w.]+)\.cycle", s))
s = re.sub(r"ph: r\.D / ([\w.]+)\.cycle", r"ph: PH(r, \1.cycle)", s)
print('PH replaced', n0)

# ---- C: s03 sefer faces the camera, inside the frame
R("[[-2100, 70, 0, { yaw: -0.4 }], [-1040, 40, 0, { yaw: -0.55 }]]", "[[-2100, 120, 0, { yaw: -0.9 }], [-1200, 200, 0, { yaw: -1.2 }]]")

# ---- A: s04 chaos spread
a = s.index("function wander(")
b = s.index("const CHAOS =")
s = s[:a] + """function wander(id, seed, t0, t1) {
  const idx = Object.keys(CHAOS).indexOf(id);
  let x = -2100 + idx * 260 + (hash(seed) - 0.5) * 120, z = [300, 820, 560, 1020][idx % 4] + (hash(seed + 1) - 0.5) * 100;
  const keys = [[t0, x, z, 0]], n = Math.floor((t1 - t0) / 1.4);
  for (let i = 1; i <= n; i++) {
    const out = Math.atan2(-(z - 600), x + 700), ang = i === 1 ? out + (hash(seed + 7) - 0.5) * 1.0 : hash(seed + i * 3) * 6.283, d = i === 1 ? 700 : 420 + hash(seed + i * 5) * 260;
    x = cl(x + Math.cos(ang) * d, -2300, 900); z = cl(z - Math.sin(ang) * d * 0.7, 220, 1200); keys.push([t0 + i * (t1 - t0) / n, x, z, 0]);
  }
  return keys;
}
""" + s[b:]
R("""    const ride = chain(Math.max(tA, 52.0) + (id[0] === 'D' ? 0 : order), id[0] === 'D' ? 245 : 260, pairChain(0, 1, g[0], lane, -300).map(p => [p[1], p[2], p[3]]).length ? [[g[0], lane, 0], [RAMP_X0, lane, 0], [250, lane, 200], [DOORX[lane === LANE_A ? 'A' : 'B'], lane, 200], [DOORX[lane === LANE_A ? 'A' : 'B'], -300, 200]] : []);
    keys = keys.concat(ride.slice(1));""", """    const vv = id[0] === 'D' ? 245 : 260, pts = [[g[0], lane, 0], [RAMP_X0, lane, 0], [250, lane, 200], [DOORX[lane === LANE_A ? 'A' : 'B'], lane, 200], [DOORX[lane === LANE_A ? 'A' : 'B'], -300, 200]];
    const dur = chain(0, vv, pts)[4][0];
    const ride = chain(id[0] === 'D' ? Math.max(tA, 63.75 - dur + (id === 'D2' ? 0.4 : 0)) : Math.max(tA, 52.0) + order, vv, pts);
    keys = keys.concat(ride);   // stand at the gather point until the ride starts""")

# s04 camera
a = s.index("SHOTS[3].cam = t => {")
b = s.index("// s06: staged for the two rabbis")
s = s[:a] + """SHOTS[3].cam = t => {
  const grp = [['D1', 'D2', 'S3'], ['C1', 'C2', 'R1'], ['G1', 'G2', 'S4'], ['R2', 'S1', 'S2'], ['D1', 'D2', 'C1']];
  const cen = ids => { let x = 0, z = 0, n = 0; for (const id of ids) { const q = ACT[id].fn2(t); x += q.x; z += q.z; n++; } return [x / n, z / n]; };
  const wide = { p: [-700 + 60 * Math.sin(t * 0.7), 520, 3000], l: [-700, 140, 520], fov: 38 };
  const pans = (() => {
    const u = t - 45.2, seg = Math.max(0, Math.floor(u / 1.9)), f = u / 1.9 - seg, g0 = grp[seg % 4], g1 = grp[(seg + 1) % 4], wp = sm(cl((f - 0.8) / 0.2, 0, 1));
    const c0 = cen(g0), c1 = cen(g1), c = [lerp(c0[0], c1[0], wp), lerp(c0[1], c1[1], wp)], sw = lerp(0.35 * (seg % 2 ? -1 : 1), 0.35 * ((seg + 1) % 2 ? -1 : 1), wp);
    return { p: [c[0] + 900 * sw, 330 + 60 * Math.sin(seg), c[1] + 1500], l: [c[0], 150, c[1]], fov: 34 };
  })();
  const dn = (() => {
    const a = ACT.D1.fn2(t), b = ACT.D2.fn2(t), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, mz = (a.z + b.z) / 2, k = rise(t, 59.5, 62.5);
    return { p: [mx + lerp(650, 520, k), my + 175, mz + 1250], l: [mx + 120, my + 115, mz - 40 * k], fov: 30 };
  })();
  const mixC = (A, B, u) => ({ p: lerp3(A.p, B.p, u), l: lerp3(A.l, B.l, u), fov: lerp(A.fov, B.fov, u) });
  if (t < 45.2) return mixC(wide, wide, 0);
  const toD = rise(t, 50.8, 53.4);
  return toD <= 0 ? pans : mixC(pans, dn, toD);
};
""" + s[b:]
R("""    const chaos = t < 48.4;""", """    const chaos = t < 48.4;""")

# ---- D: s08 hall camera (subject higher in frame)
R("[[152, [-380, 330, 2400], [-60, 140, 1580], 30], [159, [-200, 300, 2150], [-60, 150, 1580], 28]]", "[[152, [-380, 300, 2400], [-60, 85, 1580], 30], [159, [-200, 280, 2150], [-60, 95, 1580], 28]]")

# ---- E: s10 camera closer
R("a = lerp(0.3, -0.1, down) , R = lerp(650, 900, down), c = [BOYP.x + lerp(0, 60, down), lerp(110, 190, down), BOYP.z];\n  const hy = lerp(620, 230, down), look = [c[0], lerp(60, 185, down), c[2]];",
  "a = lerp(0.3, -0.1, down) , R = lerp(430, 760, down), c = [BOYP.x + lerp(0, 50, down), lerp(110, 170, down), BOYP.z];\n  const hy = lerp(480, 220, down), look = [c[0], lerp(70, 170, down), c[2]];")

# ---- F: rings
R("const setRing = (r, k) => { r.visible = k > 0.01; r.userData.mats[0].opacity = 0.5 * k; r.userData.mats[1].opacity = 0.12 * k; r.userData.mats[2].opacity = 0.28 * k; };",
  "const setRing = (r, k) => { r.visible = k > 0.01; r.userData.mats[0].opacity = 0.32 * k; r.userData.mats[1].opacity = 0.07 * k; r.userData.mats[2].opacity = 0.16 * k; };")
R("r.position.set(p[0], 185, p[1]); r.rotation.set(0, 0, 0); r.scale.setScalar(165); });", "r.position.set(p[0], 150, p[1]); r.rotation.set(0, 0, 0); r.scale.setScalar(82); });")

open('film.js', 'w', encoding='utf-8', newline='').write(s.replace('\n', '\r\n') if crlf else s)
print('ok', crlf)
