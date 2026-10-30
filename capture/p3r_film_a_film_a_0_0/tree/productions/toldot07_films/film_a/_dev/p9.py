import sys;sys.path.insert(0,'_dev')
from rp import P
_p=P('film_a.js');rep=_p.rep
rep("const BENCH_X = 330; const bench = PROPS.bench(); bench.root.position.set(BENCH_X, gY(BENCH_X, 460) - 4, 460); bench.root.rotation.y = Math.PI / 2;","const BENCH_X = 420; const bench = PROPS.bench(); bench.root.position.set(BENCH_X, gY(BENCH_X, 470) - 4, 470); bench.root.rotation.y = Math.PI + 0.6;")
NEW = """    const bz = 470, q = t - 241.9; bR.x = BENCH_X; bR.z = bz; bR.yaw = Math.PI + 0.6; bR.bob = 52; bR.walk = 0; bB.x = -260; bB.z = bz; bB.yaw = -0.6; bB.bob = 1.5 * Math.sin(t * 1.3);
    R.face.expr = 'smile'; R.face.look = [0.25, 0]; B.face.look = [0.3, 0.05]; R.face.talk = null; B.face.expr = 'smile';
    bR.headYaw = 0.12 * Math.sin(t * 0.9) + (q > 6 && q < 8 ? 0.25 : 0); bB.headYaw = 0.15 * Math.sin(t * 0.7 + 1) - (q > 3 && q < 5 ? 0.25 : 0); bR.headTilt = 3 * Math.sin(t * 0.5); bB.headTilt = 2 * Math.sin(t * 0.8 + 2);
    bR.arms = { l: { sz: -0.55, el: 1.2 }, r: { sz: -0.3, el: 1.0 } }; bB.arms = { r: { sz: 0.08, el: 0.4 }, l: { sz: 0.08, el: 0.4 } };
    if (q > 8 && q < 11) { const g1 = ease(t, 250, 250.8) * (1 - ease(t, 252.2, 253)); R.face.expr = 'explaining'; R.face.talk = talkAt(t, 250.2, 252.6, 0.4); bR.arms = { l: { sz: -0.55, el: 1.2 }, r: { sz: -0.55 - 0.55 * g1, sx: 0.25 * g1, el: 1.0 - 0.3 * g1 } }; }
    if (q > 12 && q < 15) { const g2 = ease(t, 254.4, 255.2) * (1 - ease(t, 256.2, 257)); B.face.expr = 'surprised'; bB.arms = { r: { sz: 0.08 - 1.3 * g2, sx: 0.2 * g2, el: 0.4 - 0.2 * g2, point: true }, l: { sz: 0.08, el: 0.4 } }; }
    if (q > 16 && q < 19.5) { const g3 = ease(t, 258.2, 259) * (1 - ease(t, 260.4, 261.2)); R.face.expr = 'laugh'; bR.bob = 52 + 2 * Math.sin(t * 6) * g3; bB.arms = { r: { sz: 0.08 - 0.5 * g3, sx: 0.1, el: 0.4 + 0.6 * g3 }, l: { sz: 0.08, el: 0.4 } }; } }"""
L = _p.s.split(_p.nl)
a = [k for k, l in enumerate(L) if 'const bz = 460; bR.x = BENCH_X + 8' in l][0]
assert 'sw = Math.sin((t - 241.9)' in L[a+3], L[a+3][:60]
L[a:a+4] = NEW.split('\n')
_p.s = _p.nl.join(L)
rep("tipaS.pose({ t, x: -460, y: gY(-460, 390) - 2, z: 390, yaw: Math.PI / 2 - 0.3, arms: 'down' }); tipaS.root.position.y = gY(-460, 390) - 2;","tipaS.pose({ t, x: -400, y: gY(-400, 540) - 2, z: 540, yaw: -0.6, arms: 'down' }); tipaS.root.position.y = gY(-400, 540) - 2;")
rep("sg(241.9, 252, 'S', [-60, 270, 1000], [130, 170, 330], [-40, 270, 990], [135, 170, 330], 38, 36, 'late');","sg(241.9, 252, 'S', [80, 330, 1620], [80, 270, 400], [80, 328, 1590], [80, 270, 400], 38, 37, 'late');")
rep("sg(252, 264, 'S', [-40, 270, 990], [135, 170, 330], [-70, 268, 1010], [128, 170, 330], 36, 36, 'late');","sg(252, 264, 'S', [80, 328, 1590], [80, 270, 400], [75, 326, 1560], [80, 270, 400], 37, 36.4, 'late');")
rep("if (k === 'S' && t >= 241.9) { VIG.material.opacity = 0.62; }","if (k === 'S' && t >= 241.9) { VIG.material.opacity = 0.3; }")
rep("else if (t >= 237 && t < 241.9) { bR.x = 100; bR.z = 340; bR.yaw = 3.0;","else if (t >= 237 && t < 241.9) { bR.x = 215; bR.z = 340; bR.yaw = Math.PI / 2 + 0.55;")
rep("bB.x = -30; bB.z = 310; bB.yaw = 0.15; B.face.expr = 'smile'; const wr = Math.sin(t * 9);","bB.x = -30; bB.z = 310; bB.yaw = Math.PI / 2 - 0.55; B.face.expr = 'smile'; const wr = Math.sin(t * 9);")
rep("notebook.position.set(-30 + 36, gY(-30, 310) + 118, 310 - 4); notebook.rotation.set(0, 0, -0.5);","notebook.position.set(-30 + 22, gY(-30, 310) + 118, 310 - 30); notebook.rotation.set(0, 0.6, -0.5);")
rep("sg(237, 241.9, 'B', [40, 190, -150], [35, 150, 325], [20, 188, -130], [35, 152, 325], 38, 36, 'day');","sg(237, 241.9, 'B', [92, 190, -190], [92, 150, 330], [92, 188, -165], [92, 150, 330], 46, 43, 'day');")
_p.save()
