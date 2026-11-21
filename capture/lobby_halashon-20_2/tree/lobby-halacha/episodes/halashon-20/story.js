// halashon-20 story: "He told three people himself" (storyboards_v21.md, section B).
// Talking objects only, NO people. COPY FROM halashon-17: same tags, base, cups with faces, meter, lift and camera helpers.
// Heroes: THE REGISTER (the shop owner, face, back-middle), THE MESSAGE BALL (the business secret, gold lock),
// 3 LISTENER cups with faces (a row), an OUTSIDER cup (left), a teapot and a jar with faces, a door on the back wall, a stop sign.
window.STORY = function (K) {
  const { THREE, box, cyl, ball, mkWorld, cuts, handheld, punch, face, talkAmt,
          mark3d, shock, popE, ease, prog, clamp, lerp, texPlane, bill, arcPt, FONT, fitText } = K;
  // whole-frame lift: every camera aims lower so the subject sits above the caption band
  const LIFT = .5;
  const lift = p => [p[0], p[1] - LIFT, p[2]];
  const pushIn = (p, o) => K.pushIn(lift(p), o), pullOut = (p, o) => K.pullOut(lift(p), o), truck = (p, o) => K.truck(lift(p), o);
  const crane = (p, o) => K.crane(lift(p), o), insert = (p, o) => K.insert(lift(p), o);
  const PI = Math.PI, sm = ease.sm, P = (a, b, t) => prog(t, a, b);
  const HH = (c, sd) => handheld(c, .03, sd);
  const bob = (t, s) => Math.sin(t * 1.7 + s) * .05;
  const GOLD = 0xf2c14e, RED = 0xe03131, PAPER = 0xf4e4b8, LIT = 0xffd166, DARK = 0x2b2b33;
  const REGC = 0x4f6d8a, REGD = 0x2d3e4f, DISPC = 0xbfe9ff, BALLC = 0x3a86ff, CLOUD = 0xb6bcc6, WOOD = 0x8a5a33;
  const DOORC = 0x7a4a2a, COINC = 0xf2c14e, POTC = 0xd9735a, JARC = 0x7fb37a, SHELF = 0xa0703f, FCOL = 0xcfe6ff;
  const CUPC = [0xff9fb8, 0x9ee0a0, 0xffd27a], CUP4C = 0xc7b6ff;
  const TOP = .99, PZ = .1;                      // table top; the row of cups (z)
  const REG = [0, TOP, -1.0];                    // the register (the shop owner), back-middle
  const BUB0 = [.4, TOP + .32, -.3];             // the message ball (the business secret), in front of the register
  const CUPX = [2.2, 3.2, 4.2];                  // the three listeners
  const CUP4X = -3.4;                            // the outsider cup, left
  const TEAP = [-1.1, TOP, .95], JAR = [-4.6, TOP, .95];
  const DOOR = [-7.4, 1.15, -4.3];               // door on the back wall, left
  const METER = [-6.6, 1.0];                     // worry meter on the table, front-left
  const COIN = [-3.0, 2.2, -.2], CLD = [3.0, 2.2, -.2];   // the two outcomes of beat 2
  const TAG_BAD = ['#ffe3e3', '#8a1010', '#c43030'];
  const TAG_NEU = ['#ffffff', '#222222', '#8a8a8a'];
  const TAG_GOLD = ['#fff6d6', '#5a3a10', '#c9a050'];
  const TAG_GREEN = ['#e8fff0', '#1f6a2a', '#3f9a4a'];
  const TAG_BLUE = ['#e8f0ff', '#1f3f7a', '#4f78b8'];
  const TAG_STOP = ['#e03131', '#ffffff', '#ffffff'];

  // ---------------------------------------------------------------- tags (billboards with a visible opacity)
  const mkDraw = (text, bg, fg, border) => (c, W, H) => {
    c.fillStyle = bg; c.beginPath(); c.roundRect(W * .03, H * .06, W * .94, H * .88, H * .3); c.fill();
    if (border) { c.lineWidth = H * .07; c.strokeStyle = border; c.stroke(); }
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const f = fitText(c, text, { maxW: W * .86, maxLines: 1, max: H * .62, min: H * .2, lh: 1.1 });
    c.font = `700 ${f.size}px ${FONT}`; c.fillStyle = fg; c.fillText(f.lines[0] || '', W / 2, H * .54);
  };
  function tag(Wd, w, h, text, bg, fg, border) {
    const m = texPlane(w, h, mkDraw(text, bg, fg, border), { cw: 512, ro: 9 }), g = new THREE.Group(), inner = new THREE.Group();
    inner.add(m); g.add(inner); g.visible = false; Wd.add(g); bill(Wd, g);
    return { g, m, set(pos, s, a) {
      const al = a === undefined ? 1 : a; g.visible = s > .01 && al > .01; if (!g.visible) return;
      g.position.set(pos[0], pos[1], pos[2]); inner.scale.setScalar(s); m.material.opacity = al; } };
  }

  // ---------------------------------------------------------------- set: floor, back wall, long warm table with four legs
  function base(Wd) {
    const fl = box(26, .2, 9, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(26, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    const tb = box(17, .18, 3.0, 0xb07a4a); tb.position.set(-.1, TOP - .09, 0); Wd.add(tb);
    for (const lx of [-7.9, 7.9]) for (const lz of [-1.3, 1.3]) {
      const l = box(.2, TOP - .18, .2, 0x8a5a33); l.position.set(lx, (TOP - .18) / 2, lz); Wd.add(l);
    }
    Wd.center = [0, 0];
  }
  // shelves with coloured boxes on the back wall (the shop)
  function shelves(Wd) {
    [2.0, 2.7].forEach((y, k) => {
      const sh = box(7.2, .1, .45, SHELF); sh.position.set(0, y, -4.2); Wd.add(sh);
      [[-3.0, 0xff8fa3], [-2.2, 0x8fd3ff], [-1.4, 0xffe27a], [1.6, 0xb5f5a0], [2.4, 0xffb86b], [3.2, 0xd6b8ff]].forEach(([x, c], j) => {
        const bx = box(.5, .45 + .1 * ((j + k) % 2), .35, c); bx.position.set(x, y + .25, -4.2); Wd.add(bx);
      });
    });
  }

  // ---------------------------------------------------------------- a listener: a simple cup with a face (from halashon-17)
  function friend(Wd, x, z, y, seed, col) {
    const g = new THREE.Group(); g.position.set(x, y, z); Wd.add(g);
    const sau = cyl(.5, .5, .06, 0xf4f1ea); sau.position.y = .03; g.add(sau);
    const body = cyl(.36, .3, .8, col); body.position.y = .46; g.add(body);
    const f = face(Wd, { w: .46, parent: g, pos: [0, .5, .38], seed });
    return { g, body, f, col };
  }

  // ---------------------------------------------------------------- THE REGISTER: the shop owner, a cash register with a face on the +z side
  function register(Wd) {
    const g = new THREE.Group(); g.position.set(REG[0], REG[1], REG[2]); Wd.add(g);
    const body = box(1.3, 1.0, .9, REGC); body.position.y = .5; g.add(body);
    const top = box(1.5, .14, 1.0, REGD); top.position.y = 1.07; g.add(top);
    const disp = box(.7, .34, .06, DISPC); disp.position.set(0, 1.3, .25); disp.rotation.x = -.35; g.add(disp);
    const drawer = box(1.1, .2, .06, REGD); drawer.position.set(0, .3, .47); g.add(drawer);
    const f = face(Wd, { w: .8, parent: g, pos: [0, .66, .47], seed: 5 });
    return { g, body, f, disp };
  }

  // ---------------------------------------------------------------- THE SECRET: a message ball with a gold lock on its +z side
  function bubble(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const bl = ball(.3, PAPER); g.add(bl);
    const lk = new THREE.Group(); lk.position.set(0, -.02, .28); g.add(lk);
    const lb = box(.26, .2, .1, GOLD); lk.add(lb);
    const sh = box(.14, .12, .08, GOLD); sh.position.set(0, .15, 0); lk.add(sh);
    return { g, bl, lk, lb, sh };
  }
  const setLockColor = (B, c) => { B.bub.lb.material.color.set(c); B.bub.sh.material.color.set(c); };

  // ---------------------------------------------------------------- a teapot and a jar on the table (both with faces)
  function teapot(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const body = cyl(.36, .42, .5, POTC); body.position.y = .25; g.add(body);
    const lid = ball(.12, POTC); lid.position.y = .56; g.add(lid);
    const spout = box(.3, .08, .08, POTC); spout.position.set(.4, .35, 0); spout.rotation.z = -.5; g.add(spout);
    const f = face(Wd, { w: .4, parent: g, pos: [-.05, .3, .4], seed: 71 });
    return { g, f };
  }
  function jar(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const body = cyl(.26, .3, .7, JARC); body.position.y = .35; g.add(body);
    const lid = cyl(.3, .3, .1, WOOD); lid.position.y = .75; g.add(lid);
    const f = face(Wd, { w: .34, parent: g, pos: [0, .38, .3], seed: 72 });
    return { g, f };
  }

  // ---------------------------------------------------------------- the door on the back wall: a leaf that swings open to a glow
  function doorway(Wd) {
    const frame = box(1.8, 2.7, .1, WOOD); frame.position.set(DOOR[0], 1.35, -4.4); Wd.add(frame);
    const glow = box(1.2, 2.2, .05, 0xfff1c2); glow.position.set(DOOR[0], DOOR[1], -4.36); glow.visible = false; Wd.add(glow);
    const leaf = box(1.2, 2.2, .08, DOORC); leaf.position.set(DOOR[0], DOOR[1], DOOR[2]); Wd.add(leaf);
    const knob = ball(.07, GOLD); knob.position.set(DOOR[0] + .4, DOOR[1], DOOR[2] + .07); Wd.add(knob);
    return { leaf, glow, knob };
  }

  // ---------------------------------------------------------------- a stop sign (diamond) on the table
  function stopSign(Wd, p) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); Wd.add(g);
    const pl = box(.8, .8, .08, RED); pl.rotation.z = PI / 4; pl.position.y = .75; g.add(pl);
    const post = box(.08, .6, .08, WOOD); post.position.y = .3; g.add(post);
    return g;
  }

  // ---------------------------------------------------------------- the truth METER: a post and a bar; the green fill grows from the left (from halashon-17)
  function meter(Wd, x, z) {
    const g = new THREE.Group(); g.position.set(x, TOP, z); Wd.add(g);
    const post = box(.08, .8, .08, WOOD); post.position.y = .4; g.add(post);
    const bar = box(1.6, .3, .1, 0x59606b); bar.position.set(0, .95, 0); g.add(bar);
    const fill = box(1.6, .22, .14, 0x2fbf5b); fill.position.set(0, .95, .01); fill.scale.x = .001; g.add(fill);
    return { g, fill, set(f) { const k = Math.max(.001, f); fill.scale.x = k; fill.position.x = -.8 * (1 - k); } };
  }

  // ---------------------------------------------------------------- a moving arrow from a to b; s = how much of it is drawn (0..1)
  function arrow(Wd, col) {
    const g = new THREE.Group(); Wd.add(g);
    const st = box(1, .1, .1, col); g.add(st);
    const hd = ball(.14, col); g.add(hd);
    return { g, set(a, b, s) {
      g.visible = s > .01; if (!g.visible) return;
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      g.position.set(a[0], a[1], a[2]); g.rotation.z = Math.atan2(dy, dx);
      st.scale.x = Math.max(.001, len * s); st.position.x = len * s / 2;
      hd.position.x = len * s;
    } };
  }

  // ---------------------------------------------------------------- a flat disc facing the camera (sound rings)
  function ringDisc(Wd, p, col) { const r = cyl(.3, .3, .04, col); r.rotation.x = PI / 2; r.position.set(p[0], p[1], p[2]); Wd.add(r); return r; }

  // ---------------------------------------------------------------- piecewise walk on the table: pts [x,z] reached at times ts
  function walk(t, pts, ts) {
    if (t <= ts[0]) return pts[0];
    for (let i = 0; i < pts.length - 1; i++) {
      if (t < ts[i + 1]) { const u = sm(P(ts[i], ts[i + 1], t)); return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]; }
    }
    return pts[pts.length - 1];
  }

  // ---------------------------------------------------------------- the whole set (same objects in every beat; each beat animates what it needs)
  function build(Wd) {
    base(Wd); shelves(Wd);
    const reg = register(Wd);
    const bub = bubble(Wd, BUB0);
    const cups = CUPX.map((x, i) => friend(Wd, x, PZ, TOP, 20 + i, CUPC[i]));
    const cup4 = friend(Wd, CUP4X, PZ, TOP, 33, CUP4C);
    const tp = teapot(Wd, TEAP), jr = jar(Wd, JAR);
    const door = doorway(Wd);
    const me = meter(Wd, METER[0], METER[1]); me.set(0);
    const sign = tag(Wd, 4.2, .85, 'החנות של שמעון', ...TAG_GOLD); sign.set([0, 2.35, -4.2], 1);
    return { reg, bub, cups, cup4, tp, jr, door, me };
  }

  // ================================================================ HOOK (14 s): extreme close-up on the register's face, pulls out: it tells the three cups (sound rings, counter "3"); the outsider cup turns to the door; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const qq = tag(Wd, .8, .8, '?', ...TAG_GOLD);
    const cnt = tag(Wd, .9, .9, '3', ...TAG_GOLD);
    const rings = [0, .5].map(() => ringDisc(Wd, [0, 1.4, -.5], LIT));
    Wd.qPos = [REG[0], REG[2]];
    Wd.occ = [B.reg.g, B.cups[1].g]; Wd.center = [-.8, 0];
    Wd.on(t => {
      B.reg.f.set(t, { smile: .4, talk: talkAmt(t, 3), look: [1, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: .1, talk: 0, look: [0, 0] }));
      B.cup4.f.set(t, { smile: -.1, talk: 0, look: [-1, 0] });
      B.cup4.g.rotation.y = -.5 * sm(P(6, 9, t));
      B.bub.g.position.set(BUB0[0], BUB0[1] + .03 * Math.sin(t * 2.2), BUB0[2]);
      rings.forEach((r, i) => { const ph = (t * .5 + i * .5) % 1; r.position.x = .6 + 2.6 * ph; r.scale.setScalar(.5 + 1.8 * ph); });
      qq.set([REG[0], 2.6 + bob(t, 3), REG[2]], popE(P(1.4, 2.2, t)));
      cnt.set([CUPX[1], 2.3 + bob(t, 2), PZ], popE(P(2.4, 3.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut([0, 1.4, REG[2]], { dur: w[0], dist0: 1.3, dist1: 4.2, h0: .4, h1: 1.7, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([-1.0, 1.2, -.5], { dur: w[1], dist0: 12, dist1: 11.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([CUPX[1], 1.2, PZ], { dur: w[2], dist0: 7.4, dist1: 7.0, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.4, PZ], { dur: w[3], dist0: 12, dist1: 11.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, bad): the outsider cup walks to the secret, lifts it and carries it toward the door; the lock stops it - red cross; tag "בסתם אסור"
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const q = tag(Wd, 2.8, .6, 'בסתם אסור', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.3), sk = shock(Wd, 0xff7a7a);
    Wd.occ = [B.cup4.g, B.bub.g]; Wd.center = [-1.2, 1.2];
    Wd.on(t => {
      const cupX = t < 6 ? lerp(CUP4X, -.9, sm(P(1.0, 5.0, t))) : lerp(-.9, -2.6, sm(P(6.0, 9.0, t)));
      B.cup4.g.position.x = cupX;
      const carried = t > 5.6 && t < 9.4;
      const back = sm(P(9.4, 10.6, t));
      let bx = BUB0[0], by = BUB0[1];
      if (carried) { bx = cupX; by = TOP + 1.25 + bob(t, 2); }
      else if (t >= 9.4) { bx = lerp(-2.6, BUB0[0], back); by = lerp(TOP + 1.25, BUB0[1], back); }
      B.bub.g.position.set(bx, by, BUB0[2]);
      B.bub.g.rotation.y = .3 * Math.sin(t * 3) * (carried ? 1 : 0);
      q.set([0.0, 1.9 + bob(t, 1), PZ], popE(P(.4, 1.2, t)));
      cx.set([-2.6, 1.9, PZ + .6], popE(P(9.4, 10.2, t)) * .9, .05 * Math.sin(t * 4) * (t > 10.2 ? 1 : 0));
      sk.set([-2.6, 1.9, PZ + .6], P(9.4, 10.2, t), 1.2);
      B.reg.f.set(t, { smile: -.5, talk: .6 * talkAmt(t, 7) * (1 - sm(P(9.0, 9.6, t))), look: [-1, 0] });
      B.cup4.f.set(t, { smile: -.3, talk: 0, surprise: sm(P(9.2, 9.8, t)), look: [-1, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] }));
      B.tp.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
      B.jr.f.set(t, { smile: -.2, talk: 0, look: [-1, 0] });
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.6, 1.4, 0], { dur: w[0], dist0: 10.5, dist1: 9.8, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 21)],
      [w[1], HH(punch(insert([BUB0[0], 1.4, BUB0[2]], { dur: w[1], dist0: 5.6, dist1: 5.2, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [3.7]), 22)],
      [w[2], HH(pushIn([-2.0, 1.2, PZ], { dur: w[2], dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.5, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 23)],
      [w[3], HH(crane([0.6, 1.4, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, diagram): from the secret two dark arrows lead to a cracked coin "נזק" and a sad cloud "צער"; the register looks sad
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const coin = new THREE.Group(); coin.position.set(COIN[0], COIN[1], COIN[2]); Wd.add(coin);
    const cd = cyl(.5, .5, .12, COINC); cd.rotation.x = PI / 2; coin.add(cd);
    const crack = box(.06, .7, .14, 0x1e1e1e); crack.position.z = .08; crack.rotation.z = .35; coin.add(crack);
    const cloud = new THREE.Group(); cloud.position.set(CLD[0], CLD[1], CLD[2]); Wd.add(cloud);
    [[-.22, 0, .22], [.2, .06, .24], [0, .22, .2]].forEach(([x, y, r]) => { const c = ball(r, CLOUD); c.position.set(x, y, 0); cloud.add(c); });
    const a1 = arrow(Wd, DARK), a2 = arrow(Wd, DARK);
    const tMain = tag(Wd, 3.0, .6, 'נזק או צער', ...TAG_BAD);
    const tCoin = tag(Wd, 1.2, .5, 'נזק', ...TAG_BAD);
    const tCloud = tag(Wd, 1.2, .5, 'צער', ...TAG_NEU);
    Wd.occ = [B.reg.g, B.bub.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      const s1 = sm(P(1.8, 4.2, t)), s2 = sm(P(3.0, 5.4, t));
      const from = [BUB0[0] - .3, BUB0[1] + .2, BUB0[2]];
      a1.set(from, [COIN[0] + .5, COIN[1] - .2, COIN[2]], s1);
      a2.set(from, [CLD[0] - .6, CLD[1] - .2, CLD[2]], s2);
      coin.scale.setScalar(Math.max(.001, popE(P(3.8, 4.8, t))));
      crack.scale.y = Math.max(.001, sm(P(5.0, 6.0, t)));
      cloud.scale.setScalar(Math.max(.001, popE(P(5.4, 6.2, t))));
      cloud.position.y = CLD[1] + .08 * Math.sin(t * 2.2);
      coin.rotation.y = .2 * Math.sin(t * 1.6);
      B.bub.g.position.set(BUB0[0], BUB0[1] + .03 * Math.sin(t * 2.2), BUB0[2]);
      tMain.set([0, 2.3 + bob(t, 1), PZ], popE(P(.4, 1.2, t)));
      tCoin.set([COIN[0], 2.5 + bob(t, 2), COIN[2]], popE(P(4.8, 5.6, t)));
      tCloud.set([CLD[0], 2.5 + bob(t, 3), CLD[2]], popE(P(6.2, 7.0, t)));
      B.reg.f.set(t, { smile: -.6, talk: .5 * talkAmt(t, 9), look: [0, -.4] });
      B.cups.forEach(c => c.f.set(t, { smile: -.1, talk: 0, look: [-1, 0] }));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.0, 1.4, 0], { dur: w[0], dist0: 11.5, dist1: 11, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 31)],
      [w[1], HH(insert([COIN[0], 1.9, COIN[2]], { dur: w[1], dist0: 6.6, dist1: 6.2, h0: 1.9, h1: 2.0, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 32)],
      [w[2], HH(pushIn([0, 1.6, -.2], { dur: w[2], dist0: 7.0, dist1: 6.4, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 33)],
      [w[3], HH(crane([0, 1.4, 0], { dur: w[3], dist0: 9.5, dist1: 8.6, h0: 1.0, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, good): the register opens the lock; the secret splits into three small balls that fly to the three cups; counters 1, 2, 3 pop above them; tag "בפני שלושה"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const sp = [0, 1, 2].map(() => { const s = ball(.14, BALLC); s.visible = false; Wd.add(s); return s; });
    const nums = ['1', '2', '3'].map((s, k) => tag(Wd, .7, .7, s, ...TAG_BLUE));
    const tMain = tag(Wd, 3.0, .6, 'בפני שלושה', ...TAG_BLUE);
    Wd.occ = [B.reg.g, B.cups[1].g]; Wd.center = [1.2, 0.6];
    Wd.on(t => {
      const fall = sm(P(1.2, 3.0, t));
      B.bub.lk.position.y = -.02 - .9 * fall; B.bub.lk.rotation.z = 1.2 * fall;
      B.bub.lk.visible = t < 3.6;
      B.bub.g.position.set(BUB0[0], BUB0[1] + .03 * Math.sin(t * 2.2), BUB0[2]);
      sp.forEach((s, k) => {
        const u = sm(P(3.6 + .5 * k, 5.6 + .5 * k, t));
        const a = [BUB0[0], BUB0[1], BUB0[2]], b = [CUPX[k], TOP + 1.2, PZ];
        const p = arcPt(a, b, u, .8);
        s.visible = t > 3.6 + .5 * k && u < 1;
        s.position.set(p[0], p[1], p[2]);
        nums[k].set([CUPX[k], TOP + 1.25 + bob(t, k), PZ], popE(P(5.6 + .4 * k, 6.4 + .4 * k, t)));
      });
      tMain.set([0, 2.3 + bob(t, 4), PZ], popE(P(6.4, 7.2, t)));
      B.reg.f.set(t, { smile: .8, talk: .5 * talkAmt(t, 11), look: [0, -.2] });
      B.cups.forEach((c, i) => c.f.set(t, { smile: .2 + .5 * sm(P(5.6 + .4 * i, 6.4 + .4 * i, t)), talk: 0, look: [0, 0] }));
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.0, 1.4, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 41)],
      [w[1], HH(punch(insert([BUB0[0], 1.4, BUB0[2]], { dur: w[1], dist0: 5.8, dist1: 5.4, h0: 1.3, h1: 1.5, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [3.4]), 42)],
      [w[2], HH(pushIn([3.2, 1.3, PZ], { dur: w[2], dist0: 6.4, dist1: 5.8, h0: 1.3, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 43)],
      [w[3], HH(crane([1.0, 1.4, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s): the register relaxes and smiles; the calm worry meter "חושש" drops to zero; the lock dissolves; tag "אינו חושש"
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const tWorry = tag(Wd, 1.6, .55, 'חושש', ...TAG_NEU);
    const tMain = tag(Wd, 3.2, .6, 'אינו חושש', ...TAG_GREEN);
    B.me.g.position.set(-2.4, TOP, 0.9);
    Wd.occ = [B.reg.g, B.bub.g, B.me.g]; Wd.center = [-1.0, 1.0];
    Wd.on(t => {
      const dis = sm(P(1.0, 3.2, t));
      B.bub.lk.scale.setScalar(Math.max(.001, 1 - dis)); B.bub.lk.position.y = -.02 - 1.2 * dis; B.bub.lk.rotation.z = 1.4 * dis;
      B.bub.lk.visible = t < 3.4;
      B.bub.g.position.set(BUB0[0], BUB0[1] + .03 * Math.sin(t * 2.2), BUB0[2]);
      B.me.set(1 - sm(P(2.0, 7.0, t)));
      tWorry.set([-2.4, 2.1 + bob(t, 2), 0.9], popE(P(.2, 1.0, t)));
      tMain.set([0, 2.3 + bob(t, 5), PZ], popE(P(7.6, 8.4, t)));
      B.reg.f.set(t, { smile: lerp(-.2, .9, sm(P(2.0, 6.0, t))), talk: .4 * talkAmt(t, 13), look: [-1, -.2] });
      B.cups.forEach(c => c.f.set(t, { smile: .3, talk: 0, look: [0, 0] }));
      B.reg.disp.rotation.x = -.35 + .15 * Math.sin(t * 1.3);
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.0, 1.1, -.6], { dur: w[0], dist0: 7.2, dist1: 6.8, h0: 1.4, h1: 1.6, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.4, 0, 0] }), 51)],
      [w[1], HH(pushIn([-.5, 1.2, -.6], { dur: w[1], dist0: 6.2, dist1: 5.4, h0: 1.2, h1: 1.4, a0: -4, a1: 4, fov0: 42, fov1: 42 }), 52)],
      [w[2], HH(truck([-1.4, 1.1, -.4], { dur: w[2], dist0: 7.0, dist1: 6.6, h0: 1.3, h1: 1.5, a0: 4, a1: -4, fov0: 44, fov1: 44 }), 53)],
      [w[3], HH(crane([-1.0, 1.4, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, good): the middle cup lifts the secret and carries it past the teapot and the jar to the door; the door opens to a glow; green check; tag "מותר לגלות"
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const ck = mark3d(Wd, 'check', 1.2);
    const tMain = tag(Wd, 3.2, .6, 'מותר לגלות', ...TAG_GREEN);
    const PTS = [[CUPX[1], PZ], [TEAP[0], PZ], [JAR[0], PZ], [-7.0, -1.8]];
    const TS = [2.6, 5.4, 8.2, 11.4];
    Wd.occ = [B.cups[1].g, B.bub.g, B.door.glow]; Wd.center = [-1.0, 0.4];
    Wd.on(t => {
      // the secret: from its place to the cup's hold, then carried with the cup along the walk
      const hold = [CUPX[1], TOP + 1.25, PZ];
      const hu = sm(P(.6, 2.2, t));
      const wp = walk(t, PTS, TS);
      const carry = t > 2.2;
      const cx = carry ? wp[0] : CUPX[1], cz = carry ? wp[1] : PZ;
      B.cups[1].g.position.set(cx, TOP, cz);
      const hp = arcPt(BUB0, hold, hu, .6);
      const lift = sm(P(10.8, 12.6, t)) * .5;
      B.bub.g.position.set(carry ? cx : hp[0], carry ? TOP + 1.25 + lift : hp[1], carry ? cz : hp[2]);
      B.bub.g.position.y += .03 * Math.sin(t * 2.2);
      B.bub.lk.visible = false;
      // the door swings open (the leaf narrows to a sliver; the glow shows)
      const open = sm(P(10.4, 12.4, t));
      B.door.leaf.scale.x = Math.max(.04, 1 - .96 * open);
      B.door.leaf.position.x = DOOR[0] + .6 * open;
      B.door.glow.visible = open > .05;
      B.door.knob.position.x = DOOR[0] + .4 - .4 * open;
      ck.set([-7.0, 2.4, -1.6], popE(P(11.6, 12.6, t)) * .9, .05 * Math.sin(t * 4) * (t > 12.6 ? 1 : 0));
      tMain.set([0, 2.3 + bob(t, 6), PZ], popE(P(12.4, 13.2, t)));
      B.reg.f.set(t, { smile: .7, talk: .5 * talkAmt(t, 15), look: [-1, 0] });
      B.cups[1].f.set(t, { smile: .4, talk: .5 * talkAmt(t, 17) * (1 - sm(P(10.8, 11.6, t))), look: [-1, 0] });
      B.cups[0].f.set(t, { smile: .3, talk: 0, look: [-1, 0] });
      B.cups[2].f.set(t, { smile: .3, talk: 0, look: [-1, 0] });
      B.tp.f.set(t, { smile: .5, talk: .3 * talkAmt(t, 19) * sm(P(4.6, 5.4, t)), look: [-1, 0] });
      B.jr.f.set(t, { smile: .5, talk: .3 * talkAmt(t, 23) * sm(P(7.4, 8.2, t)), look: [-1, 0] });
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(crane([-1.8, 1.4, PZ], { dur: w[0], dist0: 8.6, dist1: 8.2, h0: 2.0, h1: 2.6, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 61)],
      [w[1], HH(insert([-1.4, .9, PZ], { dur: w[1], dist0: 6.4, dist1: 6.0, h0: 1.0, h1: 1.2, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 62)],
      [w[2], HH(punch(insert([DOOR[0] + .4, 1.5, -2.0], { dur: w[2], dist0: 8.0, dist1: 7.6, h0: 1.5, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [3.3]), 63)],
      [w[3], HH(truck([0.6, 1.2, -.4], { dur: w[3], dist0: 10.5, dist1: 9.6, h0: 1.4, h1: 2.2, a0: 6, a1: -6, fov0: 44, fov1: 42, shift: [.6, 0, 0] }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): the register says "אל תספרו!" beside a stop sign; the secret gets a red lock again; a cup that tries to carry it gets a red cross; tag "מקפיד = אסור"
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const stop = stopSign(Wd, [-3.0, TOP, -.4]);
    const tStop = tag(Wd, 1.2, .5, 'עצור', ...TAG_STOP);
    const tReg = tag(Wd, 2.8, .6, 'אל תספרו!', ...TAG_BAD);
    const tMain = tag(Wd, 3.6, .6, 'מקפיד = אסור', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    setLockColor(B, RED);
    Wd.occ = [B.reg.g, B.cups[0].g]; Wd.center = [-.4, 1.0];
    Wd.on(t => {
      stop.scale.setScalar(Math.max(.001, popE(P(.4, 1.2, t))));
      tStop.set([-3.0, 1.5 + bob(t, 1), -.4], popE(P(1.0, 1.8, t)));
      tReg.set([REG[0], 2.1 + bob(t, 2), REG[2]], popE(P(.6, 1.4, t)));
      // the cup leans toward the secret, is pushed back by the red lock; the lock flashes
      const lean = sm(P(2.0, 4.6, t)), back = sm(P(4.8, 6.0, t));
      const cupX = lerp(CUPX[0], .9, lean) + .3 * back;
      B.cups[0].g.position.x = cupX;
      B.cups[0].g.rotation.y = -.3 * lean;
      B.bub.g.position.set(BUB0[0], BUB0[1] + .03 * Math.sin(t * 2.2), BUB0[2]);
      B.bub.lk.visible = true;
      B.bub.lk.scale.setScalar(1 + .08 * Math.sin(t * 9) * (t > 4.6 && t < 6.2 ? 1 : 0));
      cx.set([2.0, 2.2, PZ + .6], popE(P(6.4, 7.2, t)) * .9, .05 * Math.sin(t * 4) * (t > 7.2 ? 1 : 0));
      sk.set([2.0, 2.2, PZ + .6], P(6.4, 7.2, t), 1.2);
      tMain.set([0, 2.3 + bob(t, 4), PZ], popE(P(7.6, 8.4, t)));
      B.reg.f.set(t, { smile: -.6, talk: .6 * talkAmt(t, 25), look: [0, -.2] });
      B.cups[0].f.set(t, { smile: -.3, talk: 0, surprise: sm(P(6.4, 7.0, t)), look: [1, 0] });
      B.cups[1].f.set(t, { smile: -.1, talk: 0, look: [0, 0] });
      B.cups[2].f.set(t, { smile: -.1, talk: 0, look: [0, 0] });
      B.tp.f.set(t, { smile: -.3, talk: 0, look: [0, 0] });
      B.jr.f.set(t, { smile: -.3, talk: 0, look: [0, 0] });
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.2, 1.4, 0], { dur: w[0], dist0: 11, dist1: 10.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 46, fov1: 46, shift: [.6, 0, 0] }), 71)],
      [w[1], HH(insert([REG[0], 1.8, REG[2] + .3], { dur: w[1], dist0: 5.8, dist1: 5.4, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 72)],
      [w[2], HH(insert([.9, 1.4, PZ], { dur: w[2], dist0: 6.4, dist1: 6.0, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 73)],
      [w[3], HH(crane([0, 1.4, 0], { dur: w[3], dist0: 11, dist1: 10.2, h0: 1.0, h1: 2.2, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): slow crane over the shop; the register in the middle-back smiling, the three cups at the bottom side, the secret floating between them; the shop sign on the wall
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bubAir = [3.2, 1.9, PZ];
    Wd.occ = [B.reg.g, B.cups[1].g]; Wd.center = [0, 1.2]; Wd.ansD = 6.4;
    Wd.on(t => {
      B.bub.g.position.set(bubAir[0] + .15 * Math.sin(t * .8), bubAir[1] + .12 * Math.sin(t * 1.5), bubAir[2]);
      B.bub.lk.visible = true;
      B.reg.f.set(t, { smile: .9, talk: .3 * talkAmt(t, 37), look: [0, 0] });
      B.cups.forEach(c => c.f.set(t, { smile: .9, talk: 0, look: [0, 0] }));
      B.reg.disp.rotation.x = -.35 + .1 * Math.sin(t * 1.1);
    });
    Wd.camAns = cuts([[dur, HH(crane([0.6, 1.2, -.6], { dur, dist0: 12, dist1: 11.2, h0: 1.0, h1: 2.4, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
