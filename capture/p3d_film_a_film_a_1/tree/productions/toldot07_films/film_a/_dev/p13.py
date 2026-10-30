import sys;sys.path.insert(0,'_dev')
from rp import P
_p=P('film_a.js');rep=_p.rep
rep("if (k === 'B' && ((t >= 58.6 && t < 62.72) || (t >= 214.5 && t < 217.97))) { fgLeaf.visible = true;","if (k === 'B' && (t >= 214.5 && t < 217.97)) { fgLeaf.visible = true;")
rep("sg(109.5, 113, 'B', [30, 190, -210], [60, 150, 315], [10, 188, -180], [60, 150, 315], 36, 34, 'day');","""sg(109.5, 111.7, 'B', [-60, 190, -70], [-70, 175, 300], [-50, 188, -90], [-70, 175, 300], 28, 27, 'day');
sg(111.7, 113, 'B', [290, 80, -300], [160, 170, 330], [270, 85, -290], [160, 172, 330], 36, 35, 'day');""")
rep("bR.yaw = 2.9; R.face.expr = 'laugh'; bR.bob = 2.5 * Math.sin(t * 6);","bR.yaw = 2.55; R.face.expr = 'laugh'; bR.bob = 2.5 * Math.sin(t * 6);")
_p.save()
