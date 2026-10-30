import sys;sys.path.insert(0,'_dev')
from rp import P
_p=P('film_a.js');rep=_p.rep
rep("fence.position.set(105, gY(105, 150), 150);","fence.position.set(105, gY(105, 360), 360);")
rep("bB.x = 20; bB.z = 262; bB.yaw = Math.PI / 2 - 0.5;","bB.x = 20; bB.z = 240; bB.yaw = Math.PI / 2 - 0.5;")
rep("bR.x = 190; bR.z = 272; bR.yaw = Math.PI / 2 + 0.5;","bR.x = 190; bR.z = 250; bR.yaw = Math.PI / 2 + 0.5;")
rep("sg(138.07, 142.0, 'B', [105, 185, -230], [105, 112, 300], [105, 183, -200], [105, 112, 300], 40, 38, 'day');","sg(138.07, 142.0, 'B', [105, 185, -280], [105, 140, 300], [105, 183, -250], [105, 140, 300], 42, 40, 'day');")
rep("sg(142.0, 145.7, 'B', [320, 120, -90], [60, 135, 300], [290, 125, -100], [70, 135, 300], 38, 36, 'day');","sg(142.0, 145.7, 'B', [105, 110, -170], [105, 150, 300], [105, 115, -150], [105, 150, 300], 46, 44, 'day');")
rep("sg(158.4, 162.18, 'S', [-540, 150, 330], [0, 140, 340], [-500, 152, 330], [0, 142, 340], 36, 35, 'late');","sg(158.4, 162.18, 'S', [-680, 165, 330], [0, 150, 340], [-640, 165, 330], [0, 150, 340], 38, 37, 'late');")
rep("const sefGlowS = mkGlow(340); sefGlowS.position.set(130, gY(130, 300) + 135, 300);","const sefGlowS = mkGlow(340); sefGlowS.material.depthTest = true; sefGlowS.position.set(130, gY(130, 300) + 135, 360);")
rep("bR.x = 60; bR.z = 500; bR.yaw = Math.PI - 0.25;","bR.x = 520; bR.z = 500; bR.yaw = Math.PI - 0.25;")
_p.save()
