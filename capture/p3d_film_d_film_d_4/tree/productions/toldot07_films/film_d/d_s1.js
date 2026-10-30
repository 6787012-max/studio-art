/* film_d shot 1: where can a ship stop (0 - 39.5 s). ASCII only. */
import { THREE, sm, cl, frac, V, KT, GA, GH, GM, R, B, TI, GULLS, ease, lin, lerp, lerp3, blinkAt, flags, fs, pose, talkL, CAMS, skyTo, show, bFace, rFace, G, sky } from './d_core.js';
import { SHIP, TUG, place, beach, beachSea, beachTick, beachY, harbour, hsea, harbourTick, wall } from './d_w1.js';
import { mapReset } from './d_map2.js';
import { MAP, L, mapTick, setRing, setDots, setPin, pinN, HAIFA } from './d_map.js';
const PI = Math.PI;
SHIP.rotation.order = 'YXZ'; TUG.rotation.order = 'YXZ';

export function setShip(sea, x, z, yaw, sc, roll, pitch, dy) {
  if (flags.collect) return; const f = sea.float(x, z, 80);
  SHIP.scale.setScalar(sc); SHIP.position.set(x, f.y - 50 * sc + (dy || 0), z); SHIP.rotation.set(roll + f.rx * 0.3, yaw, pitch + f.rz * 0.3);
}
export function gullFly(g, T, cx, cz, rad, y, ph, sp, flap) {
  const a = T * sp + ph, x = cx + rad * Math.cos(a), z = cz + rad * 0.6 * Math.sin(a), dx = -rad * Math.sin(a), dz = rad * 0.6 * Math.cos(a);
  g.root.visible = true; pose(g, { t: T, x, y: y + 40 * Math.sin(a * 2 + ph), z, yaw: Math.atan2(-dz, dx), fly: true, flap: flap == null ? 1 : flap, shadow: false }); fs(g, { expr: 'happy' });
}
const FG = KT.makeFgBlur('grass', { w: 420, h: 260, col: '#6f9a46', blur: 7 }); FG.visible = false; GA.add(FG);
const FG2 = KT.makeFgBlur('grass', { w: 420, h: 260, col: '#6f9a46', blur: 7, seed: 5 }); FG2.visible = false; GA.add(FG2);
const spl = [KT.makeSplash({ r: 36 }), KT.makeSplash({ r: 46 }), KT.makeSplash({ r: 30 })]; spl.forEach(s => { s.visible = false; GA.add(s); });
const ptA = (o, x, z, yaw, extra) => pose(o, Object.assign({ t: 0, x, z, yaw, walk: 0 }, extra), beachY(x, z));
const mapRock = (() => { const g = G(GM); g.visible = false; return g; })();

/* ship path on the open sea (shot-local time): approaches, then is tossed */
function shipState(lt) {
  const s1 = ease(lt, 4.5, 13.54), s2 = ease(lt, 13.54, 22.5);
  const z = lt < 4.5 ? lerp(-5200, -4750, lin(lt, 0, 4.5)) : (lt < 13.54 ? lerp(-4750, -1250, s1) : lerp(-1250, -300, s2));
  const x = lt < 4.5 ? lerp(-1500, -1420, lin(lt, 0, 4.5)) : (lt < 13.54 ? lerp(-1420, -420, s1) : lerp(-420, -300, s2));
  const yaw = lt < 13.54 ? lerp(-1.42, -1.1, s1) : lerp(-1.1, -0.95, s2);
  const k = ease(lt, 13.54, 17), roll = k * (0.24 * Math.sin(lt * 1.9) + 0.07 * Math.sin(lt * 3.4)) + (1 - k) * 0.02 * Math.sin(lt);
  const pitch = k * 0.07 * Math.sin(lt * 1.6 + 1) + 0.01 * Math.sin(lt * 0.7);
  return { x, z, yaw, roll, pitch, sc: 0.62 };
}

export function shot1(lt, T) {
  const A = lerp(5, 32, ease(lt, 13.54, 17.5));
  skyTo('morning', 'day', ease(lt, 0, 22));
  if (lt < 22.58) {                                                 /* ------------- beach (title, c1, c2) */
    show(GA, SHIP, R, B); place(SHIP, GA); beachTick(T, A, lerp(0.7, 1.5, ease(lt, 13.54, 17.5)));
    const ss = shipState(lt); setShip(beachSea, ss.x, ss.z, ss.yaw, ss.sc, ss.roll, ss.pitch);
    // gulls
    gullFly(GULLS[0], T, -300, -1400, 600, 520, 0, 0.35); gullFly(GULLS[1], T, 100, -1000, 520, 430, 2, 0.3); gullFly(GULLS[2], T, -700, -1800, 700, 640, 4, 0.28);
    spl.forEach(s => { s.visible = false; });
    let cm;
    if (lt < 4.5) {                                                 /* ---- title: calm establishing, ship far out, gulls */
      R.root.visible = B.root.visible = false;
      cm = CAMS(lt, [{ t0: 0, t1: 4.5, p: [-300, 72, 470], p1: [-190, 82, 380], l: [200, 360, -3000], f: 32 }]);
    } else if (lt < 13.54) {
      const pr = lt - 4.5; const bx = 90, bz = 330, rx = -150, rz = 300;
      const pt = ease(lt, 5.3, 6.2);
      if (lt < 8.6) {                                               /* ---- c1 a: OTS from behind, the boy points at the ship */
        ptA(R, rx, rz, PI / 2 - 0.1, { headYaw: 0.15, headTilt: 3 * Math.sin(T * 1.1) }); fs(R, rFace(T, { expr: 'smile', look: [0.2, 0.2] }));
        ptA(B, bx, bz, PI / 2 + 0.15, { headYaw: -0.1, arms: { r: { sz: 0.3 + 1.0 * pt, sx: 0.12, el: 0.8 - 0.6 * pt, point: pt > 0.5 } } });
        fs(B, bFace(T, { expr: pt > 0.4 ? 'surprised' : 'smile', look: [0.1, 0.2] }));
        cm = CAMS(lt, [{ t0: 4.5, t1: 8.6, p: [-30, 185, 1340], p1: [-10, 190, 1290], l: [-30, 150, -1500], l1: [-80, 150, -1500], f: 32 }]);
      } else if (lt < 11.4) {                                       /* ---- c1 b: MCU boy 3/4, pointing, excited */
        ptA(R, rx, rz, PI / 2 - 0.1, { headYaw: -0.1 }); fs(R, rFace(T, { expr: 'smile', look: [0.3, 0.1] }));
        ptA(B, bx, bz, PI / 2 + 0.35, { headYaw: -0.2, headTilt: 5 * Math.sin(T * 1.3), arms: { r: { sz: 1.3, sx: 0.1, el: 0.2, point: true } } });
        fs(B, bFace(T, { expr: 'surprised', look: [-0.4, -0.1], talk: talkL(lt, 8.8, 10.6) }));
        cm = CAMS(lt, [{ t0: 8.6, t1: 11.4, p: [330, 170, -560], p1: [290, 172, -530], l: [-30, 150, 315], f: 32 }]);
      } else {                                                      /* ---- c1 c: low angle from the sea, the ship plows toward us, foam bow wave */
        ptA(R, rx, rz, PI / 2, {}); fs(R, rFace(T)); ptA(B, bx, bz, PI / 2, {}); fs(B, bFace(T));
        cm = CAMS(lt, [{ t0: 11.4, t1: 13.54, p: [820, 100, -1050], p1: [740, 108, -1000], l: [-450, 130, -1650], f: 34 }]);
      }
    } else {
      const bx = 90, bz = 330, rx = -150, rz = 300;
      const wor = ease(lt, 17, 17.8);
      if (lt < 17.3) {                                              /* ---- c2 a: WS the ship rolls, drifts to the beach */
        ptA(R, rx, rz, PI / 2 - 0.1, { headYaw: 0.1, arms: { r: { sz: 0.2, sx: 0.5, el: 0.7 } } }); fs(R, rFace(T, { expr: 'worried', look: [0.2, 0.2] }));
        ptA(B, bx, bz, PI / 2 + 0.1, { headYaw: -0.1 }); fs(B, bFace(T, { expr: 'worried', look: [-0.1, 0.2] }));
        cm = CAMS(lt, [{ t0: 13.54, t1: 17.3, p: [-20, 190, 1160], p1: [-10, 185, 1060], l: [-120, 150, -700], f: 33 }]);
      } else if (lt < 20.2) {                                       /* ---- c2 b: CU boy worried (3/4), looks at the ship */
        ptA(R, rx, rz, PI / 2 - 0.1, {}); fs(R, rFace(T, { expr: 'worried', look: [0.2, 0.1] }));
        ptA(B, bx, bz, PI / 2 + 0.55, { headYaw: -0.15, headTilt: 7 * Math.sin(T * 2.2) * 0.4, lean: -4, arms: { r: { sz: 0.35, sx: 0.12, el: 1.5 }, l: { sz: 0.35, sx: 0.12, el: 1.5 } } });
        fs(B, bFace(T, { expr: 'worried', look: [-0.45, 0.05], blink: blinkAt(T, 0.6) }));
        cm = CAMS(lt, [{ t0: 17.3, t1: 20.2, p: [300, 172, -540], p1: [270, 174, -510], l: [-30, 150, 315], f: 32 }]);
      } else {                                                      /* ---- c2 c: low from the sand, the tossed ship close to the shore, spray */
        ptA(R, rx, rz, PI / 2, { headYaw: 0.1 }); fs(R, rFace(T, { expr: 'worried', look: [0.3, 0.2] })); ptA(B, bx, bz, PI / 2 + 0.2, { headYaw: -0.1 }); fs(B, bFace(T, { expr: 'worried' }));
        spl.forEach((s, i) => { s.visible = true; const u = frac(T * 0.55 + i * 0.33); s.position.set(ss.x - 120 + i * 120, 2, ss.z + 60 + 30 * i); s.scale.setScalar(0.6); s.userData.update(u); });
        cm = CAMS(lt, [{ t0: 20.2, t1: 22.58, p: [-560, 60, 150], p1: [-480, 70, 120], l: [-330, 100, -330], f: 36 }]);
      }
    }
    return cm;
  }
  if (lt < 30.06) {                                                 /* ------------- c3: the calm harbour basin */
    show(GH, SHIP, TUG, R, B); place(SHIP, GH); place(TUG, GH); skyTo('day'); harbourTick(T, 5, 0.04);
    const k = lt - 22.58;
    setShip(hsea, -100, 290, 0.12, 0.5, 0.012 * Math.sin(T * 1.0), 0.006 * Math.sin(T * 0.8), 0);
    if (!flags.collect) { const f = hsea.float(520, 160, 60); TUG.position.set(520, f.y - 8, 160); TUG.rotation.set(f.rx * 0.3, 2.4, f.rz * 0.3); TUG.scale.setScalar(1.2); }
    gullFly(GULLS[0], T, -300, 200, 700, 520, 0, 0.3);
    const rr = ease(k, 0.4, 1.6);
    if (lt < 26.3) {                                                /* ---- a: quay, the pair in front (faces 3/4 to camera, gap), the ship rests behind */
      pose(R, { t: T, x: -690, z: 715, yaw: -PI / 2 - 0.25, walk: 0, headYaw: 0.15, arms: { r: { sz: 0.9 + 0.5 * rr, sx: 0.15, el: 0.3, point: rr > 0.5 }, l: { sz: 0.2, sx: 0.3, el: 0.6 } } }, 55); fs(R, rFace(T, { expr: 'explaining', talk: talkL(lt, 23, 26.2), look: [0.3, 0.1] }));
      pose(B, { t: T, x: -350, z: 745, yaw: -PI / 2 + 0.15, walk: 0, headYaw: -0.1, headTilt: 3 * Math.sin(T * 0.9) }, 55); fs(B, bFace(T, { expr: 'smile', look: [-0.2, 0.1] }));
      return CAMS(lt, [{ t0: 22.58, t1: 26.3, p: [-400, 258, 1660], p1: [-440, 252, 1620], l: [-520, 195, 715], l1: [-520, 195, 715], f: 33 }]);
    }
    pose(R, { t: T, x: -480, z: 705, yaw: -1.1, walk: 0, headYaw: 0.1, arms: { l: { sz: 0.4, sx: 0.7, el: 1.0 }, r: { sz: 0.4, sx: 0.7, el: 1.0 } } }, 55); fs(R, rFace(T, { expr: 'smile', talk: talkL(lt, 26.4, 29), look: [0.3, 0.1] }));
    pose(B, { t: T, x: -140, z: 745, yaw: -0.25, walk: 0, headYaw: -0.1, headTilt: 4 }, 55); fs(B, bFace(T, { expr: 'laugh', look: [0.3, 0.1] }));
    return CAMS(lt, [{ t0: 26.3, t1: 30.06, p: [380, 250, 1300], p1: [340, 250, 1260], l: [-310, 135, 600], l1: [-310, 135, 600], f: 33 }]);
  }
  /* ------------- c4: map (Haifa bay glows, the straight coast), then the rabbi shrugs on the beach */
  const k = lt - 30.06;
  if (k < 5.1) {
    show(GM); skyTo('clear'); mapTick(T); mapReset();
    const hz = ease(k, 0.6, 1.6), run = ease(k, 2.6, 4.6);
    setRing(HAIFA[0], HAIFA[2], 46, hz, T); setPin(pinN, L(35.03, 32.8, 0), 0, T); pinS_off();
    setDots(k < 2.4 ? 0 : run, T);
    const cm = CAMS(k, [{ t0: 0, t1: 2.5, p: [900, 470, 1000], p1: [1200, 320, 780], l: [1500, 0, 470], l1: [1520, 0, 450], f: 34 }, { t0: 2.5, t1: 5.1, p: [1250, 230, 480], p1: [1260, 230, 760], l: [1510, 0, 470], l1: [1470, 0, 640], f: 32 }]);
    return cm;
  }
  show(GA, R, B, GULLS[0]); skyTo('day'); beachTick(T, 6, 0.9);
  const k2 = k - 5.1, sh = ease(k2, 0.6, 1.4), sw = Math.sin(k2 * 5) * 0.06 * (1 - ease(k2, 2.6, 3.2));
  ptA(R, 0, 250, PI / 2 - 0.35, { headTilt: 6 * sh, headYaw: 0.1, arms: { l: { sz: 0.3, sx: 0.9 * sh + 0.1, el: 1.0 * sh + 0.3, curl: 0.1 }, r: { sz: 0.3, sx: 0.9 * sh + 0.1, el: 1.0 * sh + 0.3, curl: 0.1 } } });
  fs(R, rFace(T, { expr: k2 < 0.6 ? 'thinking' : 'explaining', talk: talkL(lt, 36, 38.6), look: [0.1, 0.1] }));
  ptA(B, 230, 290, PI / 2 + 0.35, { headTilt: 6 * sh, arms: { l: { sz: 0.3, sx: 0.8 * sh, el: 1.0 * sh + 0.2 }, r: { sz: 0.3, sx: 0.8 * sh, el: 1.0 * sh + 0.2 } } });
  fs(B, bFace(T, { expr: k2 > 0.6 ? 'worried' : 'thinking', look: [-0.3, 0.1] }));
  gullFly(GULLS[0], T, 100, -300, 600, 380, 0, 0.3);
  return CAMS(lt, [{ t0: 35.16, t1: 39.1, p: [115, 190, -720], p1: [115, 192, -690], l: [115, 190, 250], f: 31 }]);
}
function pinS_off() { }
