import sys;sys.path.insert(0,'_dev')
from rp import P
_p=P('film_a.js');rep=_p.rep
# continents cameras
rep("sg(47.21, 49.9, 'M', [-300, 1000, 320], [-300, 0, -520], [-100, 950, 260], [-250, 0, -520], 40, 40, 'day');",
    "sg(47.21, 49.9, 'M', [-500, 1700, 1600], [-150, 0, -150], [-300, 1750, 1500], [-150, 0, -150], 38, 38, 'day');")
rep("sg(49.9, 52.3, 'M', [-100, 1100, -620], [-160, 0, 330], [60, 1050, -560], [-100, 0, 340], 40, 40, 'day');",
    "sg(49.9, 52.3, 'M', [300, 1700, 2000], [100, 0, 100], [200, 1650, 1950], [100, 0, 100], 38, 38, 'day');")
rep("sg(52.3, 54.58, 'M', [550, 1000, 700], [1650, 0, 100], [700, 950, 620], [1700, 0, 120], 40, 40, 'day');",
    "sg(52.3, 54.58, 'M', [1300, 1600, 1500], [600, 0, -100], [1100, 1600, 1450], [600, 0, -100], 38, 38, 'day');")
# boy insert right third
rep("sg(58.6, 62.72, 'B', [60, 180, -110], [20, 160, 320], [45, 178, -80], [20, 160, 320], 28, 27, 'day');",
    "sg(58.6, 62.72, 'B', [130, 180, -110], [140, 160, 320], [115, 178, -80], [135, 160, 320], 28, 27, 'day');")
rep("else if (t >= 58.6 && t < 62.72) { bB.x = 20; bB.z = 320; bB.yaw = Math.PI / 2;","else if (t >= 58.6 && t < 62.72) { bB.x = 20; bB.z = 320; bB.yaw = Math.PI / 2 - 0.55;")
# gate
rep("sg(77.43, 82.0, 'M', [-200, 1500, 1700], [-300, 0, 100], [-1450, 330, 650], [-1780, 40, 150], 34, 32, 'day');",
    "sg(77.43, 82.0, 'M', [-200, 1500, 1700], [-300, 0, 100], [-1250, 400, 400], [-1800, 40, 150], 34, 34, 'day');")
rep("sg(82.0, 87.73, 'M', [-1380, 190, 520], [-1780, 70, 140], [-1480, 150, 460], [-1860, 60, 150], 32, 34, 'day');",
    "sg(82.0, 87.73, 'M', [-1250, 340, 360], [-1800, 30, 150], [-1330, 300, 330], [-1880, 10, 160], 33, 32, 'day');")
rep("const gm = new THREE.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: 0.85, depthWrite: false });","const gm = new THREE.MeshBasicMaterial({ color: '#ffc21a', transparent: true, opacity: 0.95, depthWrite: false });")
rep("new THREE.TorusGeometry(70, 8, 8, 30, Math.PI), gm)","new THREE.TorusGeometry(70, 12, 8, 30, Math.PI), gm)")
rep("new THREE.CylinderGeometry(8, 8, 90, 10), gm)","new THREE.CylinderGeometry(12, 12, 90, 10), gm)")
rep("gate.userData.gm.opacity = 0.5 + 0.4 * pu; gate.userData.fill.material.opacity = (0.15 + 0.35 * pu) * g;","gate.userData.gm.opacity = 0.8 + 0.2 * pu; gate.userData.fill.material.opacity = (0.35 + 0.35 * pu) * g;")
rep("new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })); gate.add(fill);","new THREE.MeshBasicMaterial({ color: '#ffe070', transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })); gate.add(fill);")
# room staging a2 c4
rep("if (t < 70.5) { bR.x = 120; bR.z = -215;","if (t < 70.5) { bR.x = 225; bR.z = -185;")
rep("bB.x = -130; bB.z = 20; bB.yaw = -Math.PI / 2 + 0.75;","bB.x = -175; bB.z = 40; bB.yaw = -Math.PI / 2 + 0.7;")
_p.save()
