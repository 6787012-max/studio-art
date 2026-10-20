// halashon-01 story: "even if it is true" - 3D choreography per storyboards_v2.md (A). Boys only.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, ease, prog, clamp, lerp, cine, seq, boyP, talkAmt, face, mkWorld, yardWorld, classRoom, desk, chair, bubble, stamp, imprint, shock, mark3d,
    openBook, testPaper, greyCloud, soccer, popE, shakeCam, lighting, glowAt, texPlane, board, drawWord, arcPt, lerpV, sparkles, glowSprite, bill } = K;
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const C = (t, tg, d, h, a, fov, ly) => [t, tg, d, h, a, fov === undefined ? 44 : fov, ly || -.09 * d];   // look point a little below the subject: it sits in the upper 2/3, above the caption band
  const SIT = { sit: true, groundY: 0 };
  const rays = Wd => { const arr = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 12), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(-5 + i * 2.2, 5, -4 + (i % 2)); m.rotation.z = .4; Wd.add(m); arr.push(m); }
    return k => arr.forEach((m, i) => m.material.opacity = k * (.16 + .06 * Math.sin(i * 2 + k * 3))); };

  // ---------------------------------------------------------------- the gossip choreography (shared by scene 3 and its rewind in scene 6). u = story time 0..16 (never depends on wall-clock)
  const DAV = [0, 0, 0], MOI = [1.15, 0, .35], YOS = [-6.5, 0, -3.3], EX = [[-3.4, 0, 2.6], [4.4, 0, -1.6], [-2.2, 0, -5.0]];
  const mouth = [.1, 1.12, .32], hov = [.55, 1.95, .7];
  function gossip(Wd, uF, o) {
    o = o || {};
    const big = bubble(Wd, { text: '55', w: 1.6, h: 1.15 }), kids = EX.map(() => bubble(Wd, { text: '55', w: 1.0, h: .72 }));
    const rings = EX.map(() => shock(Wd, 0xff9a9a)), cloud = greyCloud(Wd, { seed: 6, size: 1.0 });
    const target = EX.map((p, i) => [p[0], 1.45, p[2]]);
    const turnK = i => sm(P(7.0 + i * 1.0, 9.0 + i * 1.0, uF));   // set below per frame
    boyP(Wd, 1, t => { const u = uF(t); return Object.assign({ pos: DAV, facing: face(MOI[0], MOI[2]) + .25 * sm(P(9, 13, u)), talk: u < 2 ? .5 * talkAmt(t, 1) : 0, smile: .1, brow: .3, gesture: u > 9 ? 'think' : null, perform: u > 9 ? 0 : .3 }, o.david ? o.david(t, u) : {}); });
    boyP(Wd, 3, t => { const u = uF(t); return Object.assign({ pos: MOI, facing: face(DAV[0] - MOI[0], DAV[2] - MOI[2]) + sm(P(8, 11, u)) * (face(YOS[0] - MOI[0], YOS[2] - MOI[2]) - face(DAV[0] - MOI[0], DAV[2] - MOI[2])), gesture: 'lean', smile: 0 }, o.moishy ? o.moishy(t, u) : {}); });
    boyP(Wd, 2, t => { const u = uF(t), k = sm(P(8.5, 13, u)); return Object.assign({ pos: YOS, facing: face(1, .6), gesture: 'headdown', scale: 1 - .14 * k, smile: 0, brow: .5 * k, perform: 0 }, SIT); });
    EX.forEach((p, i) => boyP(Wd, 4 + i, t => { const u = uF(t), k = sm(P(7.6 + i * .9, 9.4 + i * .9, u)); return { pos: p, facing: lerp(face(0 - p[0], 0 - p[2]), face(YOS[0] - p[0], YOS[2] - p[2]), k), gesture: k > .3 ? 'think' : null, perform: k > .3 ? 0 : .3, smile: 0, brow: .4 * k }; }));
    const sunK = o.sunK || (() => 0);
    Wd.on(t => { const u = uF(t);
      // the big bubble: inflates at the mouth 0-1.6, hovers, flies across the yard 2-5.2, splits at 5.4
      const inf = popE(P(0, 1.6, u)), fly = sm(P(2.2, 5.2, u)), gone = P(5.2, 5.5, u);
      let pos = lerpV(mouth, hov, sm(P(0, 1.6, u))); if (u > 2.2) { pos = arcPt(hov, [4.6, 2.5, -.4], fly, 1.2); }
      big.set(pos, inf * (1 - gone) * (1 + .05 * Math.sin(t * 5)), 1, .06 * Math.sin(t * 3));
      kids.forEach((b, i) => { const t0 = 5.4 + i * .35, t1 = t0 + 1.9 + i * .25, k = P(t0, t1, u), s = popE(P(t0, t0 + .5, u)) * (1 - P(t1 - .3, t1, u));
        const p = arcPt([4.6, 2.5, -.4], target[i], sm(k), 1.0 + .3 * i); b.set(p, k > 0 ? s * .9 : 0, 1, .2 * Math.sin(t * 4 + i));
        rings[i].set(target[i], P(t1 - .3, t1 + .7, u), 1.6); });
      // yossi's grey cloud forms (9-13) and dissolves later (sunK)
      const cs = sm(P(8.8, 13, u)); cloud.set([YOS[0], 2.6 + .1 * Math.sin(t * 1.3), YOS[2]], cs * .95 * (1 - sunK(t)), 0); });
    return { mouth, hov };
  }

  // ---------------------------------------------------------------- 1. HOOK 0-14: classroom, test paper with 55, Yossi head down, David notices
  function hook(dur) {
    const Wd = mkWorld({ fogNear: 40, fogFar: 140 }); classRoom(Wd);
    const rows = [[-3.6, 2.5], [-0.4, 2.5], [2.4, 2.5], [5.2, 2.5], [-2.0, 4.3], [3.8, 4.3]];
    rows.forEach(([x, z]) => { desk(Wd, x, z - .8, 0); chair(Wd, x, z, PI, .3); });
    const paper = testPaper(Wd, '55');
    boyP(Wd, 2, t => Object.assign({ pos: [2.4, 0, 2.5], facing: PI, gesture: 'headdown', smile: 0, perform: 0, brow: .5 }, SIT));
    boyP(Wd, 1, t => { const k = sm(P(2.6, 4.2, t)); return Object.assign({ pos: [-0.4, 0, 2.5], facing: lerp(PI, PI / 2 + .35, k), gesture: k > .6 ? 'think' : null, perform: k > .6 ? 0 : .3, brow: .6 * k, smile: 0, look: .7 * k, talk: 0 }, SIT); });
    boyP(Wd, 4, t => Object.assign({ pos: [-3.6, 0, 2.5], facing: PI, perform: .5, talk: .2 * talkAmt(t, 2), smile: .3 }, SIT));
    boyP(Wd, 5, t => Object.assign({ pos: [5.2, 0, 2.5], facing: PI - .5, perform: .5, smile: .2 }, SIT));
    boyP(Wd, 6, t => Object.assign({ pos: [-2.0, 0, 4.3], facing: PI, perform: .6, talk: .3 * talkAmt(t, 3), smile: .4 }, SIT));
    Wd.on(t => { const k = popE(P(.6, 1.8, t)); paper.set([2.4, 2.3 + .09 * Math.sin(t * 1.6), 3.0], k * 1.1, PI + .3 * Math.sin(t * .8)); });
    // the "?" is kept at a fixed spot in the upper part of the frame (placed on the camera's view ray): always fully visible, medium size, never near the lens
    Wd.noQ = true; const qm = K.qmark(Wd, '#5ec8ff', 1.1), fw = new THREE.Vector3(), up = new THREE.Vector3(), rt = new THREE.Vector3();
    Wd.on((t, cam) => { cam.getWorldDirection(fw); up.set(0, 1, 0).applyQuaternion(cam.quaternion); rt.set(1, 0, 0).applyQuaternion(cam.quaternion);
      const p = cam.position.clone().addScaledVector(fw, 6.5).addScaledVector(up, 1.15).addScaledVector(rt, .9); qm.set([p.x, p.y + .08 * Math.sin(t * 1.7), p.z], K.popE(P(3.0, 4.0, t)) * 1.0, .12 * Math.sin(t * 1.1)); });
    Wd.center = [.6, 2.0];
    Wd.cam = seq([0, cine([C(0, [1.0, 1.0, 2.5], 8.0, 2.4, 205, 48, 0), C(5, [1.2, 1.1, 2.5], 5.8, 1.4, 172, 44, 0)])],
      [5, cine([C(5, [2.4, 1.5, 2.6], 5.8, .5, 205, 44), C(9, [2.4, 1.5, 2.6], 4.8, .45, 160, 42)])],
      [9, cine([C(9, [-0.2, 1.0, 2.5], 2.6, .3, 120, 42, 0), C(12, [0.3, 1.1, 2.5], 3.4, .6, 160, 42, 0), C(14, [1.2, 1.2, 2.5], 5.4, 1.4, 190, 44, 0)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 2. 14-28: schoolyard, Moishy runs up and leans in, David's bubble "55" inflates
  function s2(dur) {
    const Wd = yardWorld({ noBall: true }), tm = t => sm(P(.3, 3.7, t));
    boyP(Wd, 3, t => { const k = tm(t), m = lerp(7.5, 1.15, k), z = lerp(5.5, .35, k); const run = t < 3.7; return { pos: [m, 0, z], facing: run ? face(-6.35, -5.15) : face(-1.15, -.35), walk: run ? t * 9.5 : undefined, gesture: !run && t > 4 ? 'lean' : null, smile: .5, brow: .3, perform: 0 }; });
    boyP(Wd, 1, t => ({ pos: [0, 0, 0], facing: t < 1.2 ? face(0, 1) : face(1.15, .35), talk: t > 6.2 && t < 10 ? .3 + .7 * talkAmt(t, 1) : 0, smile: .1, brow: t > 4 ? .3 : 0, gesture: t > 6.4 && t < 10.5 ? 'explain' : null, perform: 0 }));
    boyP(Wd, 2, t => Object.assign({ pos: [-6.5, 0, -3.3], facing: face(1, .6), gesture: 'headdown', smile: 0, perform: 0 }, SIT));
    boyP(Wd, 4, t => ({ pos: [-3.4, 0, 2.6], facing: face(1, -.5), walk: t * 5.5 > 99 ? 0 : undefined, perform: .6, smile: .4 }));
    const b = bubble(Wd, { text: '55', w: 1.7, h: 1.2 }), r = shock(Wd, 0xffd27a);
    Wd.on(t => { const u = P(6.5, 8.2, t); const k = popE(u); b.set(lerpV([.1, 1.12, .32], [.45, 2.05, .7], sm(u)), k * (1 + .04 * Math.sin(t * 5)), 1, .05 * Math.sin(t * 3)); r.set([.45, 2.0, .7], P(7.6, 8.6, t), 2.4); });
    Wd.center = [.6, .4];
    Wd.cam = seq([0, cine([C(0, [6.2, .95, 4.6], 5.6, .9, 50, 44, 0), C(3.6, [1.6, 1.0, .6], 4.2, .7, 20, 42, 0)])],
      [3.6, cine([C(3.6, [.55, 1.0, .35], 3.8, .5, -42, 44, 0), C(8, [.55, 1.15, .4], 3.4, .6, 14, 42, 0)])],
      [8, cine([C(8, [.35, 1.55, .45], 3.6, .1, 22, 42, 0), C(14, [.45, 1.6, .5], 5.4, .9, -22, 44, 0)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 3. 28-44: WHAT-IF (desaturated, slow motion): the bubble flies, splits, boys look at Yossi, grey cloud
  function s3(dur) {
    const Wd = yardWorld({ noBall: true }); gossip(Wd, t => t);
    Wd.center = [0, 0];
    Wd.cam = seq([0, cine([C(0, [.5, 1.2, .3], 7.5, 2.0, -40, 44, 0), C(5.3, [2.4, 2.0, -.2], 8.5, 1.8, 15, 44, 0)])],
      [5.3, cine([C(5.3, [1.2, 1.4, -.5], 9.5, 2.4, 70, 46, 0), C(10, [0, 1.3, -.8], 9.0, 2.8, 140, 46, 0)])],
      [10, cine([C(10, [-3.8, 1.2, -2.2], 6.5, 1.6, 40, 44, 0), C(16, [-6.4, 2.0, -3.3], 7.0, 1.6, 10, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 4. 44-58: big stamp "emet" slams on the bubble, and still a red X: lashon hara
  function s4(dur) {
    const Wd = yardWorld({ noBall: true }), st = stamp(Wd, { text: 'אמת', color: 0x1f6fd0 }), im = imprint(Wd, { text: 'אמת', color: '#1f6fd0', w: 2.3, h: 1.05, rot: -.14, bg: 'rgba(255,252,240,.94)' }), b = bubble(Wd, { text: '55', w: 2.6, h: 1.85 });
    const x = mark3d(Wd, 'cross', 1.0), sk = shock(Wd, 0x9fd0ff), sk2 = shock(Wd, 0xff7a7a);
    const lab = board(Wd, { w: 2.9, h: .8, draw: drawWord('לשון הרע', '#ffecec', '#b01616'), cw: 768, frame: 0x7a1c1c, glow: 0xff5a5a });
    const BP = [0, 2.5, -.5];
    boyP(Wd, 1, t => ({ pos: [-3.0, 0, -1.2], facing: face(3.0, 1.2), talk: 0, smile: 0, brow: .4, gesture: t > 6 ? 'think' : null, perform: 0 }));
    boyP(Wd, 3, t => ({ pos: [3.0, 0, -1.2], facing: face(-3.0, 1.1), smile: 0, brow: .3, gesture: 'lean', perform: 0 }));
    Wd.on(t => {
      b.set([BP[0], BP[1] + .08 * Math.sin(t * 1.4), BP[2]], popE(P(0, 1.2, t)), 1, .04 * Math.sin(t * 2));
      const fall = P(2.5, 3.7, t), sy = t < 3.7 ? lerp(8.5, 3.45, Math.pow(fall, 2.4)) : lerp(3.45, 9, sm(P(4.8, 5.9, t)));
      st.set([0, sy, -.4], 0, t > 2.4 && t < 6);
      im.set([0, 2.5, .2], popE(P(3.7, 4.3, t)) * 1.1, 1); sk.set([0, 2.5, .3], P(3.7, 4.6, t), 2.6);
      x.set([2.7, 2.4, .6], popE(P(4.9, 5.7, t)) * 1.5, .06 * Math.sin(t * 4)); sk2.set([2.7, 2.4, .7], P(4.9, 5.7, t), 3);
      lab.set([0, .75, .5], popE(P(5.6, 6.4, t)) * 1.1, 0); });
    Wd.center = [0, 0];
    Wd.cam = shakeCam(seq([0, cine([C(0, [0, 2.1, 0], 8.8, .6, -20, 46, 0), C(3.5, [0, 2.4, 0], 7.0, 1.0, 5, 44, 0)])],
      [3.5, cine([C(3.5, [.2, 2.6, 0], 7.4, .0, 14, 42), C(8, [.5, 2.3, 0], 8.0, .4, -16, 44)])],
      [8, cine([C(8, [.3, 1.7, .2], 9.0, 2.0, -34, 46, 0), C(14, [.1, 1.8, .2], 8.2, 3.0, 22, 46, 0)])]), [[3.7, .09, .5], [4.9, .04, .3]]);
    return Wd;
  }

  // ---------------------------------------------------------------- 5. 58-70: open sefer in the sky with the verse
  function s5(dur) {
    const Wd = yardWorld({ noBall: true }), bk = openBook(Wd, { text: 'לא תלך רכיל בעמיך' }), ry = rays(Wd);
    const spark = [];
    for (let i = 0; i < 14; i++) { const s = glowSprite(.3, .3, .7); Wd.add(s); spark.push(s); }
    [[-1.7, 0, 0.8], [0, 0, 1.2], [1.7, 0, .8]].forEach((p, i) => boyP(Wd, [1, 3, 2][i], t => ({ pos: p, facing: face(-p[0], 5), look: 0, perform: .2, smile: .5, gesture: i === 1 && t > 5 ? 'point' : null, brow: .2, hidden: t > 3.1 })));
    Wd.on(t => { const k = popE(P(0, 1.6, t)); bk.set([0, 3.6 + .14 * Math.sin(t * 1.2), -1.2], k * 1.0, sm(P(1.4, 3.5, t))); ry(sm(P(1, 3, t)));
      spark.forEach((s, i) => { const a = t * .6 + i * 1.7, r = 2.4 + (i % 4) * .6; s.position.set(Math.cos(a) * r, 3.6 + Math.sin(a * 1.3 + i) * 1.6, -1 + Math.sin(a) * .8); s.material.opacity = .5 + .4 * Math.sin(t * 3 + i); }); });
    Wd.center = [0, 1];
    Wd.cam = seq([0, cine([C(0, [0, 1.0, .8], 6.0, .3, -15, 46), C(3.1, [0, 1.1, .8], 4.8, .3, 8, 44)])],
      [3.1, cine([C(3.1, [0, 3.7, -1.2], 9.0, .5, 18, 42), C(9, [.3, 3.7, -1.2], 5.8, .3, -8, 42)])],
      [9, cine([C(9, [1.2, 3.7, -1.2], 5.2, -.2, -26, 42, 0), C(12, [-.3, 3.5, -1.2], 7.6, .2, 18, 44, 0)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 6. 70-84: REWIND (4.3 s), then David covers his mouth, shakes his head, points to a ball: "let's play ball!"
  const RW = 4.3;
  function s6(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd); const uF = t => 16 * (1 - sm(clamp(t / RW, 0, 1)) * 1);
    const Tn = t => t - RW, fDM = face(MOI[0], MOI[2]);
    gossip(Wd, uF, {
      david: (t, u) => { const T = Tn(t); if (T < 0) return null;
        if (T < .5) return { gesture: null, smile: .1, talk: 0 };
        if (T < 2.3) return { gesture: 'mouth', brow: .5, facing: fDM + (T > 1.0 ? .42 * Math.sin((T - 1.0) * 11) : 0), talk: 0, perform: 0 };
        if (T < 4.8) return { gesture: 'point', facing: face(3.6, 2.2), talk: T > 2.8 ? .8 * talkAmt(t, 1) : 0, smile: .7, brow: 0, perform: 0 };
        return { gesture: 'explainA', facing: face(3.6, 1.6), smile: .9, talk: .3 * talkAmt(t, 1), perform: 0 }; },
      moishy: (t, u) => { const T = Tn(t); if (T < 0) return null;
        if (T < 4.2) return { gesture: 'lean', smile: .1 };
        if (T < 6.2) return { gesture: 'shrug', smile: .5, facing: fDM + .25 };
        return { gesture: 'thumb', smile: 1, facing: face(2.4, 1.9) }; } });
    const ballM = soccer(Wd, .15), b2 = bubble(Wd, { text: 'בוא נשחק כדור!', w: 2.1, h: 1.2, color: '#14612f', glow: 0x9dffb0 });
    Wd.on(t => { const T = Tn(t); ballM.position.set(3.6, .15, 2.2); ballM.rotation.y = 0;
      b2.set(lerpV([.1, 1.12, .32], [.9, 1.95, .8], sm(P(2.6, 3.9, T))), popE(P(2.6, 3.7, T)) * (1 - P(8.2, 9.0, T)), 1, .03 * Math.sin(t * 3)); });
    Wd.center = [1, 0];
    Wd.cam = seq([0, cine([C(0, [.2, 1.4, -.5], 11, 3.0, -30, 46, 0), C(RW, [0, 1.4, -.5], 8.0, 2.2, 40, 46, 0)])],
      [RW, cine([C(RW, [.2, 1.2, .3], 2.8, .3, 20, 42, 0), C(RW + 3.6, [.2, 1.2, .3], 2.5, .2, 56, 42, 0)])],
      [RW + 3.6, cine([C(RW + 3.6, [1.0, 1.55, 1.0], 5.4, .4, -30, 44), C(RW + 6.5, [1.2, 1.5, 1.1], 6.2, .6, 10, 44)])],
      [RW + 6.5, cine([C(RW + 6.5, [1.2, 1.4, .9], 5.8, .4, 36, 44), C(14, [1.4, 1.3, 1.0], 7.4, 1.4, -12, 44)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 7. 84-100: ball game, Yossi stands up and joins, the cloud dissolves into sunshine
  function ballGame(Wd, spec) {   // spec.players: [{pos}], spec.legs(t) -> [from,to,k]; returns ball update
    const bl = soccer(Wd, .15);
    return t => { const [a, b, k] = spec.leg(t); const A = spec.pos(a, t), B = spec.pos(b, t); const p = arcPt([A[0], 1.0, A[2]], [B[0], 1.0, B[2]], k, spec.lift === undefined ? .55 : spec.lift); bl.position.set(p[0], p[1], p[2]); bl.rotation.x = t * 6; return [a, b, k]; };
  }
  function s7(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd), TJ = 6.5;
    const slot = i => { const a = PI / 2 + i * (2 * PI / 5); return [Math.cos(a) * 2.9, 0, Math.sin(a) * 2.2 + .4]; };   // 0 David 1 Moishy 2 b4 3 b5 4 Yossi
    const legT = 1.25, ord1 = [0, 1, 2, 3], ord2 = [0, 1, 4, 2, 3];
    const sched = [], mk = () => { let t = 1.0, i = 0; while (t < 17) { const ord = t < TJ + 1.5 ? ord1 : ord2; const a = ord[i % ord.length]; sched.push({ t0: t, from: a, to: ord[(i + 1) % ord.length] }); i++; t += legT; } };
    mk();
    const leg = t => { let L = sched[0]; for (const s of sched) if (s.t0 <= t) L = s; return L; };
    const yp = t => { if (t < TJ) return YOS; const k = sm(P(TJ, TJ + 4.2, t)); return lerpV(YOS, slot(4), k); };
    const posOf = (i, t) => i === 4 ? yp(t) : slot(i);
    const near = (i, t) => { const L = leg(t), k = (t - L.t0) / legT; return { catching: L.to === i && k > .55, throwing: L.from === i && k < .25 && t > 1.2 }; };
    const upd = ballGame(Wd, { leg: t => { const L = leg(t); return [L.from, L.to, clamp((t - L.t0) / legT, 0, 1)]; }, pos: posOf });
    const players = [1, 3, 4, 5];
    players.forEach((pi, i) => boyP(Wd, pi, t => { const n = near(i, t), p = slot(i); const L = leg(t); const tgt = posOf(n.throwing ? L.to : (L.from === i ? L.to : L.from), t);
      return { pos: p, facing: face(tgt[0] - p[0], tgt[2] - p[2]), gesture: n.catching ? 'catchp' : n.throwing ? 'throwp' : null, perform: n.catching || n.throwing ? 0 : .4, smile: 1, talk: .5 * talkAmt(t, i) }; }));
    boyP(Wd, 2, t => { const stand = t > 2.4, p = yp(t), joined = t >= TJ + 4.2; const L = leg(t), n = near(4, t); const tgt = posOf(L.from === 4 ? L.to : L.from, t);
      if (!stand) return Object.assign({ pos: p, facing: face(1, .6), gesture: 'headdown', smile: 0, perform: 0 }, SIT);
      if (!joined) { const mv = t > TJ; return { pos: p, facing: t < TJ ? face(1, .8) : face(slot(4)[0] - p[0], slot(4)[2] - p[2]), walk: mv ? t * 5.6 : undefined, gesture: !mv && t < 4.4 ? 'bothup' : null, smile: 1, perform: 0, scale: 1 }; }
      return { pos: p, facing: face(tgt[0] - p[0], tgt[2] - p[2]), gesture: n.catching ? 'catchp' : n.throwing ? 'throwp' : null, perform: .3, smile: 1, talk: .4 * talkAmt(t, 9) }; });
    const cloud = greyCloud(Wd, { seed: 6, size: 1.0 }), glowRing = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: K.canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(120,255,160,.9)'); r.addColorStop(.6, 'rgba(90,230,140,.45)'); r.addColorStop(1, 'rgba(90,230,140,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })); glowRing.rotation.x = -PI / 2; Wd.add(glowRing);
    const sun = glowSprite(7, 7, 0); sun.position.set(-3, 6.5, -9); sun.material.color.set(0xfff0a0); Wd.add(sun);
    const stars = []; for (let i = 0; i < 16; i++) { const s = glowSprite(.28, .28, .8); s.material.color.set(0xb8ffd0); Wd.add(s); stars.push(s); }
    Wd.on(t => { upd(t); const dis = sm(P(1.0, 6.5, t)); cloud.set([YOS[0], 2.7 + .8 * dis, YOS[2]], (1 - dis) * .95, 0);
      const gk = sm(P(TJ - 1, TJ + 3, t)); glowRing.position.set(0, .03, .4); glowRing.scale.setScalar(.01 + gk * 4.4); glowRing.material.opacity = gk * (.8 + .15 * Math.sin(t * 3));
      sun.material.opacity = sm(P(1.5, 6, t)) * .75; ry(sm(P(2, 6, t)));
      stars.forEach((s, i) => { const a = t * .8 + i * 2.1, r = 2.6 + (i % 3) * .5; s.position.set(Math.cos(a) * r, .6 + (t * .5 + i * .37) % 2.6, .4 + Math.sin(a) * r * .75); s.material.opacity = gk * (.4 + .4 * Math.sin(t * 4 + i)); }); });
    lighting(Wd, t => ({ hemi: lerp(1.35, 1.75, sm(P(1, 6, t))), sun: lerp(1.5, 2.2, sm(P(1, 6, t))) }));
    Wd.center = [0, .4];
    Wd.cam = seq([0, cine([C(0, [-5.8, 1.0, -2.8], 4.6, .8, 30, 44, 0), C(3, [-5.6, 1.1, -2.6], 3.6, .6, 6, 42, 0)])],
      [3, cine([C(3, [-3.5, .7, -1.0], 8.0, 1.6, 55, 44), C(8, [-1.0, .6, .6], 7.0, 1.4, 10, 44)])],
      [8, cine([C(8, [0, 1.0, .5], 6.4, .9, -36, 44, 0), C(13, [0, 1.1, .5], 6.2, 1.2, 36, 44, 0)])],
      [13, cine([C(13, [0, 1.2, .4], 5.0, .4, 20, 44, 0), C(16, [0, 1.6, .4], 9.4, 2.4, -14, 44, 0)])]);
    return Wd;
  }

  // ---------------------------------------------------------------- 8. ANSWER 100-120: the boys laugh and play ball behind the card
  function answerBg(dur) {
    const Wd = yardWorld({ noBall: true }), ry = rays(Wd); ry(.8);
    const xs = [-3.4, -1.7, 0, 1.7, 3.4], ids = [1, 3, 2, 4, 5];
    const bl = soccer(Wd, .15), per = 1.1;
    const posI = i => [xs[i], 0, .1 + (i % 2) * .3];
    const leg = t => { const k = t / per, a = Math.floor(k) % 5, b = (a + 1) % 5; return [a, b, k - Math.floor(k)]; };
    ids.forEach((id, i) => boyP(Wd, id, t => { const [a, b, k] = leg(t), p = posI(i), to = posI(a === i ? b : a);
      return { pos: p, facing: face(to[0] - p[0], to[2] - p[2]) * .5, gesture: b === i && k > .5 ? 'catchp' : a === i && k < .25 ? 'throwp' : null, perform: .4, smile: 1, talk: .6 * talkAmt(t, i + 2), brow: .1 }; }));
    Wd.on(t => { const [a, b, k] = leg(t), A = posI(a), B = posI(b), p = arcPt([A[0], .95, A[2]], [B[0], .95, B[2]], k, .3); bl.position.set(p[0], p[1], p[2]); bl.rotation.x = t * 6; });
    lighting(Wd, () => ({ hemi: 1.7, sun: 2.1 }));
    Wd.center = [0, 0]; Wd.ansD = 7.4; return Wd;
  }

  // ---------------------------------------------------------------- colour grade + overlays (absolute film seconds)
  const grade = t => {
    if (t >= 28 && t < 44) return { sat: lerp(1, .18, sm(P(28, 28.7, t))) * 0 + lerp(1, .2, sm(P(28, 28.7, t))), bright: .96 };
    if (t >= 70 && t < 70 + RW) { const k = (t - 70) / RW; return { sat: lerp(.2, 1, sm(k)), bright: 1 }; }
    if (t >= 44 && t < 44.5) return { sat: lerp(.2, 1, (t - 44) / .5), bright: 1 };
    return { sat: 1 };
  };
  const overlay = (g, W, H, t) => {
    const s = H / 1080;
    if (t >= 28.4 && t < 43.8) {   // what-if: soft vignette + label
      const a = sm(P(28.4, 29.2, t)) * (1 - sm(P(43.2, 43.8, t))), gr = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .85); gr.addColorStop(0, 'rgba(20,30,60,0)'); gr.addColorStop(1, 'rgba(20,30,60,.55)');
      g.globalAlpha = a; g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(230,236,255,.92)'; g.beginPath(); g.roundRect(W / 2 - 230 * s, 34 * s, 460 * s, 96 * s, 30 * s); g.fill(); g.strokeStyle = '#6a78c8'; g.lineWidth = 6 * s; g.stroke();
      g.fillStyle = '#2a3680'; g.font = `700 ${64 * s}px Assistant, Heebo, sans-serif`; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('מה היה קורה?', W / 2, 84 * s); g.globalAlpha = 1; }
    if (t >= 70 && t < 70 + RW + .3) {   // rewind: scan lines, flicker band, big double arrows
      const a = 1 - P(70 + RW - .2, 70 + RW + .3, t); g.globalAlpha = a * .22; g.fillStyle = '#9fb4ff'; for (let y = 0; y < H; y += 8 * s) g.fillRect(0, y, W, 2 * s);
      const by = ((t - 70) * 900 * s) % H; g.globalAlpha = a * .25; g.fillStyle = '#ffffff'; g.fillRect(0, by, W, 38 * s);
      g.globalAlpha = a * .95; g.fillStyle = '#fff'; g.strokeStyle = '#1c2745'; g.lineWidth = 10 * s; g.lineJoin = 'round'; const cx = W / 2, cy = 110 * s, q = 52 * s;
      for (const dx of [-q * .95, q * .95]) { g.beginPath(); g.moveTo(cx + dx + q * .7, cy - q); g.lineTo(cx + dx - q * .7, cy); g.lineTo(cx + dx + q * .7, cy + q); g.closePath(); g.stroke(); g.fill(); }
      g.globalAlpha = 1; }
  };
  return { hook, scenes: [s2, s3, s4, s5, s6, s7], answer: answerBg, grade, overlay };
};
