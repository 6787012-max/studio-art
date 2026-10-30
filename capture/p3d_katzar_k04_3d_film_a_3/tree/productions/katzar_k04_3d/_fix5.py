import io
p='C:/projects/_studio-animatzia/productions/katzar_k04_3d/film.js'
s=io.open(p,encoding='utf-8',newline='').read()
def R(a,b):
    global s
    assert a in s,a[:70]; s=s.replace(a,b,1)
R("u.set(_hv.x * 0.5 + 0.5, (top * 0.5 + 0.5) - hgt * 0.35, Math.max(0.1, hgt * 0.62));","u.set(_hv.x * 0.5 + 0.5, (top * 0.5 + 0.5) - hgt * 0.28, Math.max(0.07, hgt * 0.3));")
R("[[152, [-380, 300, 2400], [-60, 118, 1580], 30], [159, [-200, 280, 2150], [-60, 125, 1580], 29]]","[[152, [-380, 320, 2500], [-60, 170, 1580], 30], [159, [-200, 300, 2330], [-60, 175, 1580], 29]]")
io.open(p,'w',encoding='utf-8',newline='').write(s)
