export function shot4b(lt, T) {
  show(GK, R, B); skyTo('day'); let cm;
  if (!flags.collect) { cliff.update(T); birdsK.userData.update(T); }
  tower.userData.roof.visible = false; tower.visible = label45.visible = bracket.visible = false; splash.visible = false; pieces.forEach(p => { p.visible = false; }); for (let i = 0; i < pcl.n; i++) pcl.hide(i); pcl.commit();
  for (let i = 0; i < spray.n; i++) spray.hide(i); spray.commit(); swash.visible = false;
  let er = 0.3; if (lt >= 18.92) er = lerp(0.3, 0.55, ease(lt, 18.92, 21.2)); if (lt >= 21.2) er = lerp(0.55, 0.9, ease(lt, 21.2, 24.6)); if (lt >= 24.6) er = 0.9;
  cliff.setErosion(er); notch2.userData.set(er); notch2.visible = true;
  { const u = cl((er - 0.55) / 0.35, 0, 1), fall = u * u; if (block) { block.visible = true; block.scale.setScalar(1); block.position.set(200, (TOP - 60) * (1 - fall) + 50 * fall, 352 - 312 * u); } }
  const pr = (o, x, z, yaw, extra) => pose(o, Object.assign({ t: T, x, z, yaw, walk: 0 }, extra), 3 + z * 0.03);
  if (lt < 9.28) {                                             /* c1: the kurkar cliff above the sea, the pair far from its base (clear sand gap) */
    if (lt < 4.6) { cm = CAMS(lt, [{ t0: 0.4, t1: 4.6, p: [-1000, 330, -950], p1: [-760, 320, -820], l: [-120, 190, 200], l1: [-120, 180, 200], f: 36 }]); }
    else cm = CAMS(lt, [{ t0: 4.6, t1: 9.28, p: [-180, 210, -800], p1: [-240, 210, -740], l: [-250, 160, 30], f: 32 }]);
    pr(R, -340, 20, PI / 2 - 0.5, { headYaw: 0.2, arms: { r: { sz: 1.0, sx: 0.2, el: 0.3, point: true } } }); fs(R, { expr: 'explaining', talk: talkL(lt, 5, 9), blink: blinkAt(T, 0.1), look: [0.3, 0.2] });
    pr(B, -170, 10, PI / 2 - 0.4, { headTilt: -4 }); fs(B, bFace(T, { expr: 'surprised', look: [0.3, 0.4] }, 0.5));
  } else if (lt < 18.92) {                                     /* c2: 45 m is like a 15-storey building */
    tower.visible = label45.visible = bracket.visible = true; tower.userData.roof.visible = lt > 14.6;
    tower.userData.fl.forEach((f, i) => { const u = ease(lt, 10.4 + i * 0.28, 10.9 + i * 0.28); f.visible = u > 0.01; f.scale.y = Math.max(0.01, u); });
    label45.visible = lt > 12.4; label45.scale.setScalar(0.5 + 0.5 * ease(lt, 12.4, 13.0)); POST.push(() => label45.quaternion.copy(cam.quaternion));
    bracket.scale.y = Math.max(0.01, ease(lt, 10.4, 15));
    pr(R, 20, 10, PI / 2 - 0.55, { headTilt: -4, arms: { r: { sz: 1.3, sx: 0.1, el: 0.3, point: true } } }); fs(R, { expr: 'explaining', talk: talkL(lt, 9.5, 14), blink: blinkAt(T, 0.1), look: [0.4, 0.5] });
    pr(B, 190, 10, PI / 2 - 0.45, { headTilt: -6 }); fs(B, bFace(T, { expr: lt > 15 ? 'surprised' : 'smile', look: [0.5, 0.5] }, 0.5));
    cm = lt < 14.2 ? CAMS(lt, [{ t0: 9.28, t1: 14.2, p: [-260, 190, -860], p1: [-160, 195, -820], l: [310, 190, 150], l1: [320, 200, 150], f: 38 }])
      : CAMS(lt, [{ t0: 14.2, t1: 18.92, p: [-60, 215, -980], p1: [60, 220, -940], l: [330, 205, 140], f: 40 }]);
  } else if (lt < 26.27) {                                     /* c3: waves hit the foot of the cliff, the notch deepens, a block falls (nobody near it) */
    R.root.visible = B.root.visible = false;
    const wv = frac(T / 2.4), wu = Math.sin(Math.PI * Math.min(1, wv * 1.25));
    swash.visible = true; swash.position.set(200 + 40 * Math.sin(T * 0.4), 4, face0(200) - 6 - 30 * (1 - wu)); swash.scale.set(1, 0.4 + 1.4 * wu, 1);
    for (let i = 0; i < spray.n; i++) { const hit = wv > 0.28 && wv < 0.9 ? 1 : 0; if (!hit) { spray.hide(i); continue; } const ux = ((i * 37) % 17 - 8) * 30, uu = (wv - 0.28) / 0.62;
      spray.set(i, 200 + ux, 10 + 120 * 4 * uu * (1 - uu) * (0.4 + (i % 5) / 5), face0(200) - 14 - 40 * uu, 7 * (1 - 0.6 * uu)); } spray.commit();
    if (!flags.collect) { const lu = (lt - 24.5) / 1.7; if (lu > 0 && lu < 1) { splash.position.set(200, 8, 40); splash.scale.setScalar(2.2); splash.userData.update(lu); } }
    cm = lt < 21.2 ? CAMS(lt, [{ t0: 18.92, t1: 21.2, p: [760, 170, -130], p1: [660, 160, -70], l: [200, 70, 340], f: 38 }])
      : CAMS(lt, [{ t0: 21.2, t1: 26.27, p: [820, 280, -420], p1: [700, 240, -330], l: [210, 230, 300], l1: [200, 90, 120], f: 40 }]);
  } else if (lt < 33.62) {                                     /* c4: the block crumbles in the waves and becomes sand again */
    R.root.visible = B.root.visible = false; show(...GX.slice(0, 3));
    notch2.userData.set(0.9); swash.visible = true; { const wv = frac(T / 2.0); swash.position.set(200, 4, 120 + 120 * Math.sin(Math.PI * wv)); swash.scale.set(1, 1.2, 1); }
    const k = lt - 26.27, cr = ease(k, 0.8, 4.2), sub = ease(k, 1.5, 6.0);
    if (block) { block.scale.setScalar(Math.max(0.01, 1 - 0.9 * sub)); block.position.y = 50 - 18 * sub; }
    pieces.forEach((p, i) => { p.visible = cr > 0.02 && sub < 0.95; const a = i * 1.1 + 0.4, d = 40 + 90 * cr; p.position.set(200 + Math.cos(a) * d * 1.4, 18, 40 - 20 * sub + Math.sin(a) * d * 0.6 - 60 * sub * (i % 2)); p.scale.setScalar(Math.max(0.01, (0.9 - 0.8 * sub)));
      p.rotation.set(cr * (i + 1) * 0.6, a, cr * 0.4); });
    for (let i = 0; i < pcl.n; i++) { const u = frac(k * 0.5 + i * 0.1618), a = i * 2.3; if (sub < 0.05) { pcl.hide(i); continue; } pcl.set(i, 200 + Math.cos(a) * 160 * u, 8 + 50 * Math.sin(Math.PI * u), 40 - 150 * u + Math.sin(a) * 70, 3.5 * (1 - u)); } pcl.commit();
    GX.slice(0, 3).forEach((g, i) => { const pop = ease(k, 0.9 + i * 0.3, 1.4 + i * 0.3), jump = Math.abs(Math.sin((k - 1.5) * 6 + i * 2)) * 26 * pop;
      pose(g, { t: T, x: 120 + i * 70, z: -20 + (i % 2) * 30, y: 6 + jump, yaw: -PI / 2 - 0.5 + 0.3 * i, walk: 0, shadow: true }); g.root.scale.setScalar(0.001 + 0.3 * pop);
      fs(g, { expr: 'cheering', blink: false, look: [0, 0] }); });
    cm = CAMS(lt, [{ t0: 26.27, t1: 33.62, p: [700, 190, -480], p1: [560, 160, -400], l: [200, 150, 120], l1: [190, 80, 60], f: 38 }]);
  } else {                                                     /* c5: OTS behind the rabbi: his arm holds the boy back from the edge, then points away */
    notch2.visible = false;
    const k = lt - 33.62, zE = 330, step = ease(k, 0.2, 3.0);
    const bz = k < 3.2 ? lerp(zE + 150, zE + 38, step) : lerp(zE + 38, zE + 112, ease(k, 3.7, 5.0));
    const hold = ease(k, 3.0, 3.8), away = ease(k, 6.0, 6.9);
    const rz = k < 3.4 ? lerp(zE + 380, zE + 330, step) : lerp(zE + 330, zE + 222, ease(k, 3.4, 4.2));
    const bWalk = k > 0.2 && k < 3.0;
    pose(B, { t: T, x: 90, z: bz, yaw: PI / 2 + (k < 3.2 ? 0.55 : lerp(0.55, -2.4, ease(k, 3.2, 3.9))), walk: bWalk ? 1 : 0, ph: step * 120 / B.cycle, lean: k > 3.0 && k < 3.8 ? -6 : 0, headYaw: k > 3.2 ? 0.0 : 0.3, headTilt: 3 * Math.sin(T * 0.8) }, TOP + 2);
    fs(B, bFace(T, { expr: k < 3.0 ? 'laugh' : (k > 6.4 ? 'proud' : 'worried'), look: [0.3, 0.1] }, 0.5));
    pose(R, { t: T, x: -80, z: rz, yaw: PI / 2 - 0.15, walk: (k < 3.4 && k > 0.4) || (k > 3.4 && k < 4.2) ? 1 : 0, ph: (k < 3.4 ? step * 50 : 50 + ease(k, 3.4, 4.2) * 108) / R.cycle, headYaw: 0.2 * Math.sin(T * 0.6),
      arms: { r: { sz: k < 3.0 ? 0.3 : (away > 0.5 ? 0.3 + 0.9 * away : 1.4 * hold + 0.1), sx: away > 0.5 ? -0.6 : -0.15 * hold, el: 0.2, point: away > 0.5 } } }, TOP + 2);
    fs(R, { expr: 'explaining', talk: talkL(lt, 36.5, 41.5), blink: blinkAt(T, 0.1), look: [-0.3, 0] });
    cm = CAMS(lt, [{ t0: 33.62, t1: 42.5, p: [-560, TOP + 190, zE + 1150], p1: [-500, TOP + 180, zE + 1090], l: [20, TOP + 100, zE + 170], l1: [30, TOP + 100, zE + 170], f: 33 }]);
  }
  return cm;
}

