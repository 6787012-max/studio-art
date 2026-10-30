p = 'C:/projects/_studio-animatzia/productions/toldot07_films/film_c/c_s5.js'
s = open(p, encoding='utf-8').read()
a = s.index('export function shot5(lt, T) {')
b = s.index('export const recapOff')
new = '''export function shot5(lt, T) {
  show(GB, R, B, GULL); skyTo('gold'); beachTick(T, { blow1: 0, blow2: 0.5, dune: 1 }); vig.visible = true; rprops.visible = true; fgb.visible = true;
  const U = sky.material.uniforms; U.uHasSun.value = 1; U.uSun.value.set(1.0, 0.80, 0.30); U.uDir.value.set(0.93, 0.12, -0.34).normalize();
  const P0 = [GD.x - 950, 300, GD.z - 260], F = [0.996, -0.09], RT = [0.09, 0.996];
  const at = (d, lat) => [P0[0] + F[0] * d + RT[0] * lat, P0[2] + F[1] * d + RT[1] * lat];
  const [rx, rz] = at(760, -330), [bx, bz] = at(740, -120), SIT = 92;
  const breathe = 1.2 * Math.sin(T * 1.7);
  const look = Math.sin(T * 0.45), turnR = 0.35 * look, turnB = 0.35 * Math.sin(T * 0.45 + 1.4);
  const pointB = ease(lt, 5.0, 6.0) * (1 - ease(lt, 10.5, 11.5)) + ease(lt, 14.5, 15.3) * (1 - ease(lt, 17.5, 18.4));
  pose(R, { t: T, x: rx, z: rz, yaw: 2.3, walk: 0, headYaw: turnR, headTilt: 3 * Math.sin(T * 0.6), bob: breathe * 0.5 }, gdH(rx, rz, 1) - SIT); fs(R, { expr: lt > 8 && lt < 12 ? 'explaining' : 'smile', talk: talkL(lt, 8, 12), blink: blinkAt(T, 0.1), look: [-0.4 + 0.3 * look, 0] });
  pose(B, { t: T, x: bx, z: bz, yaw: 2.2, walk: 0, headYaw: turnB, bob: breathe * 0.5, arms: { r: { sz: 0.2 + 1.2 * pointB, sx: 0.2, el: 0.3, point: pointB > 0.5 } } }, gdH(bx, bz, 1) - SIT); fs(B, bFace(T, { expr: pointB > 0.5 ? 'surprised' : 'smile', look: [-0.4 + 0.3 * Math.sin(T * 0.45 + 1.4), 0.1] }, 0.4));
  const a = T * 0.45; pose(GULL, { t: T, x: GD.x + 300 + 420 * Math.cos(a), y: 430 + 40 * Math.sin(a * 2), z: GD.z - 250 + 300 * Math.sin(a), yaw: -Math.atan2(Math.cos(a), -Math.sin(a)), fly: true, flap: 1, shadow: false }); fs(GULL, { expr: 'happy' });
  const c = CAMS(lt, [{ t0: 0, t1: 19.3, p: P0, p1: [GD.x - 840, 306, GD.z - 235], l: [GD.x + 150, 215, GD.z - 360], l1: [GD.x + 150, 220, GD.z - 340], f: 33 }]);
  POST.push(() => { fgb.position.copy(cam.position).add(V(-120, -66, -260).applyQuaternion(cam.quaternion)); fgb.quaternion.copy(cam.quaternion); });
  return c;
}
'''
s = s[:a] + new + s[b:]
open(p, 'w', encoding='utf-8').write(s)
print('ok')
