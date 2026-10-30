import io
p='C:/projects/_studio-animatzia/productions/katzar_k04_3d/film.js'
s=io.open(p,encoding='utf-8',newline='').read()
def R(a,b,n=1):
    global s
    assert a in s,a[:70]; s=s.replace(a,b,n)
R("float hw = mix(uW, uW * 0.16, pow(tc, 0.75));","float hw = mix(uW, uW * 0.3, pow(tc, 0.8));")
R("smoothstep(0.075, 0.085, abs(bq.x) * 1.0 + abs(bq.y) * 2.0)","smoothstep(0.14, 0.16, abs(bq.x) * 0.8 + abs(bq.y) * 3.2)")
R("vec2 bc = vec2(uCx, uY1 + 0.045);","vec2 bc = vec2(uCx, uY1 + 0.05);")
R("visMat.uniforms.uY0.value = s6 ? 0.36 : 0.3; visMat.uniforms.uY1.value = s6 ? 0.8 : 0.78; visMat.uniforms.uW.value = s6 ? 0.2 : 0.17;","visMat.uniforms.uY0.value = s6 ? 0.2 : 0.14; visMat.uniforms.uY1.value = s6 ? 0.8 : 0.78; visMat.uniforms.uW.value = s6 ? 0.36 : 0.3;")
R("pulse(t, 160, 164.5, 174, 177.5) * 0.75","pulse(t, 160, 164.5, 172.5, 175.6) * 0.75")
# table back in s06/s07
R("GEM.visible = !(t >= 129.2 && t < 153.5) || bkOn;","const early = t < 129.2; TABLE.position.z = early ? 830 : 940; GEM.visible = !(t >= 129.2 && t < 153.5) || bkOn;")
R("GEM.position.set(t >= 153.5 && t < 176 ? -60 : -40, 118, t >= 153.5 && t < 176 ? 960 : 960);","GEM.position.set(t >= 153.5 && t < 176 ? -60 : -40, 118, early ? 850 : 960);")
R("[84, [-200, 400, 2330], [0, 170, 1580], 30],","[84, [-200, 400, 2330], [0, 150, 1580], 30],")
R("[92, [-60, 410, 2260], [10, 175, 1580], 30],","[92, [-60, 410, 2260], [10, 155, 1580], 30],")
R("[110.5, [40, 410, 2270], [0, 185, 1580], 31],\n  [116, [60, 410, 2260], [0, 180, 1580], 30],\n  [125.9, [30, 410, 2250], [10, 180, 1580], 30]]);","[110.5, [40, 410, 2270], [0, 165, 1580], 31],\n  [116, [60, 410, 2260], [0, 160, 1580], 30],\n  [125.9, [30, 410, 2250], [10, 160, 1580], 30]]);")
R("hermite([[125.9, [30, 410, 2250], [10, 180, 1580], 30], [129.2, [10, 390, 2100], [-40, 190, 1580], 29]])","hermite([[125.9, [30, 410, 2250], [10, 160, 1580], 30], [129.2, [10, 390, 2100], [-40, 175, 1580], 29]])")
# s08 hall
R("[[152, [-380, 300, 2400], [-60, 85, 1580], 30], [159, [-200, 280, 2150], [-60, 95, 1580], 28]]","[[152, [-380, 300, 2400], [-60, 118, 1580], 30], [159, [-200, 280, 2150], [-60, 125, 1580], 29]]")
# s11 spacing
R("return { x: 330, y: 0, z: 1500, yaw: -1.45, slope: 0, po };","return { x: 270, y: 0, z: 1500, yaw: -1.45, slope: 0, po };")
R("return { x: -330, y: 0, z: 1500, yaw: -1.7, slope: 0, po };","return { x: -270, y: 0, z: 1500, yaw: -1.7, slope: 0, po };")
R("SH1.position.set(330 + 22, 0, 1500 - 800); SH2.position.set(22, 0, 1480 - 800); SH3.position.set(-330 + 22, 0, 1500 - 800);","SH1.position.set(270 + 22, 0, 1500 - 800); SH2.position.set(22, 0, 1480 - 800); SH3.position.set(-270 + 22, 0, 1500 - 800);")
R("[[-165, 1495], [165, 1490]]","[[-135, 1495], [135, 1490]]")
R("r.scale.set(150, 78, 150); });","r.scale.set(122, 70, 122); });")
io.open(p,'w',encoding='utf-8',newline='').write(s)
