import io
p='film_a.js'
s=io.open(p,encoding='utf-8',newline='').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a,s.count(a))
    s=s.replace(a,b)
# a1 staging: wider gap, 3/4 faces
rep("const R = { po: { t, x: 110, z: 330, yaw: 1.2, walk: 0 }","const R = { po: { t, x: 175, z: 330, yaw: 1.2, walk: 0 }")
rep("const B = { po: { t, x: -30, z: 300, yaw: Math.PI / 2 - 0.15, walk: 0 }","const B = { po: { t, x: -70, z: 300, yaw: Math.PI / 2 - 0.15, walk: 0 }")
rep("const xr = lerp(x0 + 120, 110, w), xb = lerp(x0, -30, w)","const xr = lerp(x0 + 120, 175, w), xb = lerp(x0, -70, w)")
rep("bR.yaw = lerp(1.25, 3.0, tu);","bR.yaw = lerp(1.25, 2.6, tu);")
rep("bB.yaw = lerp(Math.PI / 2 - 0.15, 0.35, tu);","bB.yaw = lerp(Math.PI / 2 - 0.15, 0.55, tu);")
rep("bR.yaw = 3.05; R.face.expr = 'laugh';","bR.yaw = 2.55; R.face.expr = 'laugh';")
rep("else if (t >= 33.6 && t < 37.9) { bB.yaw = 0.2;","else if (t >= 33.6 && t < 37.9) { bB.yaw = 0.6;")
io.open(p,'w',encoding='utf-8',newline='').write(s)
