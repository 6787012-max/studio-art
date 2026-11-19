// halashon-18 story: "The majority decision" (storyboards_v19.md, section B).
// Talking objects only, NO people. Adapted from halashon-17 (COPY FROM).
// Heroes: seven GAVELS round a table (hero = minority gavel with a face, one majority gavel with a face),
// a SCALE in the middle, 7 vote balls (4 blue = majority, 3 grey = minority) into a glass JAR,
// a DOOR "חדר הקהל", the far HOUSE "מי שדיברו עליו", a speech BUBBLE, a teapot with a face ("אחר").
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
  const GOLD = 0xf2c14e, RED = 0xe03131, PAPER = 0xf4e4b8, DARK = 0x2b2b33, WOOD = 0x8a5a33, DWOOD = 0x6b4a2a;
  const GAVEL_MAJ = 0x7a4e2d, GAVEL_MIN = 0xb8c0cc, BALLC = 0x3a86ff, STONE = 0x9aa0a8, CLOUD = 0x5b6270;
  const FCOL = 0xcfe6ff, JARC = 0xdff3ff, TEAPOT = 0xe0a050, BLOCK = 0x8c8f99, TABLE = 0xb07a4a, PATHC = 0xc9a86a;
  const C_RED = new THREE.Color(RED);
  const TOP = .99;                       // table top surface (table = cylinder at y TOP-.09)
  const R = 2.6;                         // seats on a ring round the table
  const SEATS = [0, 1, 2, 3, 4, 5, 6].map(k => { const a = -.9 + k * 2 * PI / 7; return [R * Math.sin(a), R * Math.cos(a)]; });
  const HERO = 0;                        // minority gavel with a face (front left)
  const MAJ_FACE = 2;                    // one majority gavel with a face (front right)
  const VOTE_BLUE = [1, 2, 3, 4];        // majority -> blue balls
  const VOTE_GREY = [0, 5, 6];           // minority -> grey balls
  const DROP = [1, 2, 3, 4, 0, 5, 6];    // order of drops into the jar
  const SCALE = [0, TOP, 0];
  const JAR = [1.6, TOP, .6];
  const JAR_MOUTH = [JAR[0], TOP + .9, JAR[2]];
  const PAPER_POS = [-1.1, TOP, 1.0];
  const HOUSE = [9.4, -1.6];             // far house (floor, behind the table end)
  const PZ = 1.9;                        // floor path in front of the table
  const DOOR_X = -5.4;                   // door "חדר הקהל" on the back wall
  const OUT = [-4.4, 0, PZ];             // where the minority gavel stands outside the room
  const TAG_BAD = ['#ffe3e3', '#8a1010', '#c43030'];
  const TAG_NEU = ['#ffffff', '#222222', '#8a8a8a'];
  const TAG_GOLD = ['#fff6d6', '#5a3a10', '#c9a050'];
  const TAG_GREEN = ['#e8fff0', '#1f6a2a', '#3f9a4a'];
  const TAG_BLUE = ['#e8f0ff', '#1f3f7a', '#4f78b8'];
  const st = i => .6 + DROP.indexOf(i) * 1.05;   // drop start time of ball of seat i

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

  // ---------------------------------------------------------------- set: floor, back wall, round table, path, door
  function base(Wd) {
    const fl = box(26, .2, 11, 0xe9d3a0); fl.position.set(0, -.1, -.5); Wd.add(fl);
    const wall = box(26, 5, .3, 0xf6e7c6); wall.position.set(0, 2.5, -4.6); Wd.add(wall);
    const tb = cyl(2.9, 2.9, .18, TABLE); tb.position.set(0, TOP - .09, 0); Wd.add(tb);
    const leg = cyl(.22, .3, TOP - .18, WOOD); leg.position.set(0, (TOP - .18) / 2, 0); Wd.add(leg);
    const path = box(20, .02, .7, PATHC); path.position.set(0, .01, PZ); Wd.add(path);
    const door = box(1.3, 2.3, .14, DWOOD); door.position.set(DOOR_X, 1.15, -4.3); Wd.add(door);
    Wd.center = [0, 0];
  }

  // ---------------------------------------------------------------- a gavel: handle + head, face on the +z side of the head
  function gavel(Wd, pos, col, seed, withFace) {
    const g = new THREE.Group(); g.position.set(pos[0], TOP, pos[1]); Wd.add(g);
    const handle = cyl(.07, .07, .6, WOOD); handle.position.y = .3; g.add(handle);
    const bs = cyl(.2, .2, .06, WOOD); bs.position.y = .03; g.add(bs);
    const head = box(.62, .34, .36, col); head.position.y = .75; g.add(head);
    const f = withFace ? face(Wd, { w: .34, parent: g, pos: [0, .75, .19], seed }) : null;
    return { g, f };
  }

  // ---------------------------------------------------------------- the SCALE: post, tilting beam, two pans
  function scaleRig(Wd) {
    const g = new THREE.Group(); g.position.set(SCALE[0], SCALE[1], SCALE[2]); Wd.add(g);
    const post = cyl(.05, .05, .8, WOOD); post.position.y = .4; g.add(post);
    const beam = new THREE.Group(); beam.position.y = .8; g.add(beam);
    beam.add(box(1.8, .05, .05, WOOD));
    for (const s of [-1, 1]) {
      const str = cyl(.01, .01, .3, DARK); str.position.set(.9 * s, -.15, 0); beam.add(str);
      const pan = cyl(.28, .28, .04, GOLD); pan.position.set(.9 * s, -.3, 0); beam.add(pan);
    }
    return { g, beam };
  }

  // ---------------------------------------------------------------- house of Shimon (face on the front = +z) with a crack on its side
  function house(Wd, x, seed, col, roof, z = 0) {
    const g = new THREE.Group(); g.position.set(x, 0, z); Wd.add(g);
    const body = box(1.2, .9, .8, col); body.position.y = .45; g.add(body);
    const rf = cyl(0, .8, .6, roof); rf.position.y = 1.2; g.add(rf);
    const f = face(Wd, { w: .5, parent: g, pos: [0, .55, .41], seed });
    const wins = [-.42, .42].map(x => { const wn = box(.2, .22, .05, 0x59606b); wn.position.set(x, .55, .42); g.add(wn); return wn; });
    const crack = box(.05, .6, .04, 0x1e1e1e); crack.position.set(.42, .3, .41); crack.scale.y = .001; g.add(crack);
    return { g, body, f, col, wins, crack };
  }
  const redHouse = (h, a) => h.body.material.color.set(new THREE.Color(h.col).lerp(C_RED, clamp(a, 0, 1)));

  // ---------------------------------------------------------------- a vote-jar bar: unit box scaled in y, base on the table
  function setBar(mesh, h) { mesh.scale.y = Math.max(.001, h); mesh.position.y = TOP + Math.max(.001, h) / 2; }

  // ---------------------------------------------------------------- the whole set (same objects in every beat; each beat animates what it needs)
  function build(Wd) {
    base(Wd);
    const scale = scaleRig(Wd);
    const jar = cyl(.4, .4, .9, JARC); jar.position.set(JAR[0], TOP + .45, JAR[2]); Wd.add(jar);
    const jarLid = cyl(.42, .42, .05, GOLD); jarLid.position.set(JAR[0], TOP + .92, JAR[2]); Wd.add(jarLid);
    const barB = box(.3, 1, .3, BALLC); barB.position.set(.3, TOP, -1.2); Wd.add(barB); setBar(barB, .001);
    const barG = box(.3, 1, .3, STONE); barG.position.set(-.3, TOP, -1.2); Wd.add(barG); setBar(barG, .001);
    const paper = box(.8, .02, .6, PAPER); paper.position.set(PAPER_POS[0], TOP + .011, PAPER_POS[2]); Wd.add(paper);
    const G = SEATS.map((p, i) => gavel(Wd, p, (i === HERO || i === 5 || i === 6) ? GAVEL_MIN : GAVEL_MAJ, 30 + i, i === HERO || i === MAJ_FACE));
    const hs = house(Wd, HOUSE[0], 6, FCOL, 0x2f5fa0, HOUSE[1]);
    const lock = box(.3, .24, .1, GOLD); lock.position.set(DOOR_X + .45, 1.1, -4.2); lock.visible = false; Wd.add(lock);
    const doorTag = tag(Wd, 2.6, .5, 'חדר הקהל', ...TAG_NEU);
    const houseTag = tag(Wd, 3.2, .5, 'מי שדיברו עליו', ...TAG_NEU);
    return { scale, jar, barB, barG, paper, G, hs, lock, doorTag, houseTag };
  }

  // ================================================================ HOOK (14 s): extreme close-up on the minority gavel's face, pulls out to the round table with the seven gavels and the jar; "?" above
  function hook(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const H = SEATS[HERO]; const hp = [H[0], TOP + .75, H[1]];
    const qq = tag(Wd, .8, .8, '?', '#fff6d6', '#8a5a00', '#d9a63a');
    Wd.qPos = [H[0], H[1]];
    Wd.occ = [B.G[HERO].g, B.G[MAJ_FACE].g]; Wd.center = [-1.0, 1.2];
    Wd.on(t => {
      B.G[HERO].f.set(t, { smile: -.2, talk: .4 * talkAmt(t, 3), look: [1, 0] });
      B.G[MAJ_FACE].f.set(t, { smile: .3, talk: 0, look: [-1, 0] });
      B.doorTag.set([DOOR_X + 1.5, 1.5, -3.9], 1);
      qq.set([H[0], TOP + 1.5 + bob(t, 3), H[1] + .2], popE(P(1.4, 2.2, t)));
    });
    const w = [4, 3.5, 3.5, 3];
    Wd.cam = cuts([
      [w[0], HH(pullOut(hp, { dur: w[0], dist0: 1.3, dist1: 4.2, h0: 1.6, h1: 1.8, a0: 6, a1: -6, fov0: 36, fov1: 44 }), 51)],
      [w[1], HH(truck([0, 1.4, 0], { dur: w[1], dist0: 12, dist1: 11.5, h0: 1.8, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 44, shift: [.6, 0, 0] }), 52)],
      [w[2], HH(insert([JAR[0], 1.4, JAR[2]], { dur: w[2], dist0: 6.8, dist1: 6.5, h0: 1.5, h1: 1.6, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([0, 1.4, PZ], { dur: w[3], dist0: 12, dist1: 11.2, h0: .8, h1: 2.0, a0: -6, a1: 6, fov0: 42, fov1: 40 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 1 (14 s, good): seven gavels pop up one after another with a counter 1..7; the scale tips; tags "חוב" and "זכות" on the pans; tag "שבעה טובי העיר"
  function beat1(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const head = tag(Wd, 3.6, .6, 'שבעה טובי העיר', ...TAG_GOLD);
    const nums = SEATS.map((p, i) => tag(Wd, .5, .5, String(i + 1), ...TAG_NEU));
    const kh = tag(Wd, 1.1, .5, 'חוב', ...TAG_BLUE);
    const kz = tag(Wd, 1.1, .5, 'זכות', ...TAG_GREEN);
    Wd.occ = [B.scale.g]; Wd.center = [0, 1.2];
    Wd.on(t => {
      SEATS.forEach((p, i) => {
        const pop = popE(P(.6 + i * .9, 1.5 + i * .9, t));
        B.G[i].g.scale.setScalar(Math.max(.001, pop));
        nums[i].set([p[0], TOP + 1.25 + bob(t, i), p[1]], popE(P(1.2 + i * .9, 1.9 + i * .9, t)));
      });
      B.scale.beam.rotation.z = .16 * Math.sin(t * 2.2) * sm(P(6.5, 8.0, t));
      kh.set([-.9, TOP + 1.0, 0], popE(P(8.0, 8.6, t)));
      kz.set([.9, TOP + 1.0, 0], popE(P(8.4, 9.0, t)));
      head.set([0, 2.0, -2.4], popE(P(0, .8, t)));
      B.doorTag.set([DOOR_X + 1.5, 1.5, -3.9], 1);
      B.G[HERO].f.set(t, { smile: 0, talk: .6 * talkAmt(t, 5) * sm(P(.4, 1.0, t)), look: [1, 0] });
      B.G[MAJ_FACE].f.set(t, { smile: .3, talk: .5 * talkAmt(t, 6) * sm(P(7.0, 7.6, t)), look: [-1, 0] });
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([0, 1.4, 0], { dur: w[0], dist0: 11, dist1: 10.2, h0: 2.2, h1: 2.4, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 21)],
      [w[1], HH(punch(insert([0, 1.4, .4], { dur: w[1], dist0: 6.6, dist1: 6.2, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [3.7]), 22)],
      [w[2], HH(pushIn([-1.2, 1.2, 0], { dur: w[2], dist0: 5.0, dist1: 4.4, h0: 1.2, h1: 1.5, a0: -4, a1: 4, fov0: 42, fov1: 40 }), 23)],
      [w[3], HH(crane([1.0, 1.4, 0], { dur: w[3], dist0: 9.0, dist1: 8.0, h0: .8, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 24)]]);
    return Wd;
  }

  // ================================================================ BEAT 2 (14 s, good): each gavel drops a ball into the jar (4 blue, 3 grey); the bars grow 4 vs 3; the scale settles to the majority side; stamp "הוחלט"; all gavels nod; tag "אחר הרוב"; punch
  function beat2(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const balls = SEATS.map((_, i) => { const b = ball(.1, VOTE_BLUE.includes(i) ? BALLC : STONE); b.visible = false; Wd.add(b); return b; });
    const stamp = tag(Wd, 1.5, .55, 'הוחלט', ...TAG_GOLD);
    const nB = tag(Wd, .6, .5, '4', ...TAG_BLUE);
    const nG = tag(Wd, .6, .5, '3', ...TAG_NEU);
    const maj = tag(Wd, 3.0, .6, 'אחר הרוב', ...TAG_GOLD);
    const doneB = t => VOTE_BLUE.filter(i => t > st(i) + 1.5).length;
    const doneG = t => VOTE_GREY.filter(i => t > st(i) + 1.5).length;
    Wd.occ = [B.jar, B.G[MAJ_FACE].g]; Wd.center = [-.4, 1.2];
    Wd.on(t => {
      SEATS.forEach((p, i) => {
        const s0 = st(i), u = clamp((t - s0) / 1.5, 0, 1);
        const b = balls[i];
        const bp = arcPt([p[0], TOP + 1.0, p[1]], JAR_MOUTH, sm(u), 1.2);
        b.visible = t > s0 && u < 1;
        b.position.set(bp[0], bp[1], bp[2]);
        const nod = clamp((t - s0) / .45, 0, 1);
        B.G[i].g.rotation.x = nod > 0 && nod < 1 ? -.25 * Math.sin(PI * nod) : 0;
      });
      setBar(B.barB, .8 * doneB(t) / 4);
      setBar(B.barG, .8 * doneG(t) / 4);
      nB.set([.3, TOP + 1.05, -1.2], popE(P(9.0, 9.6, t)));
      nG.set([-.3, TOP + .85, -1.2], popE(P(9.0, 9.6, t)));
      B.scale.beam.rotation.z = -.14 * sm(P(9.2, 10.2, t));
      stamp.set([PAPER_POS[0], TOP + .9, PAPER_POS[2]], popE(P(10.2, 11.0, t)));
      maj.set([0, 2.2, -.5], popE(P(11.2, 11.9, t)));
      const nodAll = clamp((t - 11.4) / .6, 0, 1);
      B.G.forEach(G => { G.g.rotation.x = nodAll > 0 && nodAll < 1 ? -.14 * Math.sin(PI * nodAll) : G.g.rotation.x; });
      B.G[HERO].f.set(t, { smile: -.1 + .4 * sm(P(10.4, 11.2, t)), talk: 0, look: [1, 0] });
      B.G[MAJ_FACE].f.set(t, { smile: .2 + .8 * sm(P(10.4, 11.2, t)), talk: .6 * talkAmt(t, 9) * sm(P(10.0, 10.6, t)), look: [-1, 0] });
      B.doorTag.set([DOOR_X + 1.5, 1.5, -3.9], 1);
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([0, 1.4, 0], { dur: w[0], dist0: 11.5, dist1: 11, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 31)],
      [w[1], HH(insert([JAR[0], 1.6, JAR[2]], { dur: w[1], dist0: 6.8, dist1: 6.4, h0: 1.6, h1: 1.7, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 32)],
      [w[2], HH(punch(insert([-.1, 1.4, -1.0], { dur: w[2], dist0: 7.0, dist1: 6.6, h0: 1.6, h1: 1.7, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [11.2]), 33)],
      [w[3], HH(crane([-1.4, 1.4, PZ], { dur: w[3], dist0: 9.8, dist1: 9.2, h0: 1.0, h1: 2.0, a0: 6, a1: -6, fov0: 42, fov1: 40 }), 34)]]);
    return Wd;
  }

  // ================================================================ BEAT 3 (14 s, bad): the other gavels file out through the door "חדר הקהל"; outside the minority gavel opens a speech bubble with its own grey ball and an arrow at the jar ("they did it"); red cross + shock; the bubble bursts; tag "אסור לספר"
  function beat3(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const bub = tag(Wd, 2.8, .55, 'הם רבו עליי', ...TAG_NEU);
    const gb = ball(.13, STONE); gb.visible = false; Wd.add(gb);
    const arrow = box(1.6, .08, .08, RED); arrow.visible = false; Wd.add(arrow);
    const dx = JAR_MOUTH[0] - OUT[0], dz = JAR_MOUTH[2] - OUT[2], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    const exitTag = tag(Wd, 2.8, .55, 'אסור לספר', ...TAG_BAD);
    Wd.occ = [B.G[HERO].g]; Wd.center = [-2.2, 1.2];
    Wd.on(t => {
      B.G.forEach((G, i) => {
        if (i === HERO) return;
        const s0 = .3 + i * .22, u = sm(P(s0, s0 + 2.2, t)), s = 1 - sm(P(s0 + 1.6, s0 + 2.3, t));
        const p = arcPt([SEATS[i][0], TOP, SEATS[i][1]], [DOOR_X + .3, .9, -3.9], u, .6);
        G.g.position.set(p[0], p[1], p[2]); G.g.scale.setScalar(Math.max(.001, s)); G.g.visible = s > .01;
      });
      const hu = sm(P(1.5, 4.2, t));
      const hp = arcPt([SEATS[HERO][0], TOP, SEATS[HERO][1]], OUT, hu, .5);
      B.G[HERO].g.position.set(hp[0], hp[1], hp[2]);
      const pop = popE(P(4.8, 5.6, t)) * (1 - sm(P(7.6, 8.4, t)));
      bub.set([OUT[0] + .2, 2.0 + bob(t, 2), PZ + .2], pop);
      gb.visible = pop > .05; gb.position.set(OUT[0] - .35, 1.7, PZ + .3);
      arrow.visible = t > 6.0 && t < 8.0;
      arrow.position.set(OUT[0] + ux * 1.6, 1.25, PZ + uz * 1.6); arrow.rotation.y = Math.atan2(-uz, ux);
      cx.set([OUT[0] + .2, 2.2, PZ + .5], popE(P(6.0, 6.8, t)) * .9, .05 * Math.sin(t * 4) * (t > 6.8 ? 1 : 0));
      sk.set([OUT[0] + .2, 2.2, PZ + .5], P(6.0, 6.8, t), 1.2);
      exitTag.set([OUT[0] + 3.2, 2.2, PZ], popE(P(8.6, 9.4, t)));
      B.G[HERO].f.set(t, { smile: -.2 - .4 * sm(P(6.0, 6.6, t)), talk: .9 * talkAmt(t, 9) * sm(P(4.6, 5.2, t)) * (1 - sm(P(8.2, 8.8, t))), surprise: .6 * sm(P(6.0, 6.6, t)), look: [1, 0] });
      B.doorTag.set([DOOR_X + 1.5, 1.5, -3.9], 1);
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.2, 1.4, 0], { dur: w[0], dist0: 12, dist1: 11.4, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 41)],
      [w[1], HH(truck([-3.6, 1.0, .5], { dur: w[1], dist0: 9.6, dist1: 9.0, h0: 2.0, h1: 2.1, a0: 4, a1: -4, fov0: 42, fov1: 42 }), 42)],
      [w[2], HH(punch(insert([OUT[0] + .2, 1.2, PZ], { dur: w[2], dist0: 4.8, dist1: 4.4, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [7.0]), 43)],
      [w[3], HH(crane([-2.0, 1.3, PZ], { dur: w[3], dist0: 9.0, dist1: 8.4, h0: 1.0, h1: 2.0, a0: 6, a1: -6, fov0: 44, fov1: 42 }), 44)]]);
    return Wd;
  }

  // ================================================================ BEAT 4 (14 s, bad): the bubble flies along the path toward the house; a red barrier drops and cuts the path; the bubble stops and shakes; a dark cloud goes over the barrier to the house; the crack spreads on the house; red cross
  function beat4(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const BX = 5.9;                                  // barrier position on the path
    const S = [OUT[0] + .5, 1.9, PZ], E = [BX - .9, 1.4, PZ];
    const bub = tag(Wd, 2.6, .55, 'הם רבו עליי', ...TAG_NEU);
    const gb = ball(.13, STONE); Wd.add(gb);
    const barrier = box(.14, 1.8, 1.4, RED); Wd.add(barrier);
    const cl = new THREE.Group(); Wd.add(cl);
    [[-.22, 0, .22], [.2, .06, .24], [0, .2, .2]].forEach(([x, y, r]) => { const c = ball(r, CLOUD); c.position.set(x, y, 0); cl.add(c); });
    const cx = mark3d(Wd, 'cross', 1.3), sk = shock(Wd, 0xff7a7a);
    const barrierTag = tag(Wd, 1.8, .5, 'מחסום', ...TAG_BAD);
    Wd.occ = [B.hs.g, B.G[HERO].g]; Wd.center = [2.0, 1.2];
    Wd.on(t => {
      B.G[HERO].g.position.set(OUT[0], 0, OUT[2]);
      B.G[HERO].f.set(t, { smile: -.5, talk: .8 * talkAmt(t, 15) * (1 - sm(P(3.0, 3.6, t))), look: [1, 0] });
      const bu = sm(P(.4, 3.2, t));
      const bp = arcPt(S, E, bu, .6);
      const bounce = t > 3.2 ? .3 * Math.sin(PI * clamp((t - 3.2) / .8, 0, 1)) : 0;
      const pop = popE(P(0, .4, t)) * (1 - sm(P(6.6, 7.4, t)));
      bub.set([bp[0] - bounce, bp[1] + .2 + .04 * Math.sin(t * 9) * (t > 3.2 ? 1 : 0), bp[2]], pop);
      gb.position.set(bp[0] - bounce - .35, bp[1] - .2, bp[2] + .15); gb.visible = pop > .05;
      barrier.position.set(BX, lerp(3.6, .9, sm(P(2.6, 3.4, t))), PZ);
      barrierTag.set([BX, 2.2, PZ], popE(P(2.8, 3.6, t)));
      const cu = sm(P(5.0, 8.6, t));
      const cp = arcPt([BX - .8, 1.9, PZ], [HOUSE[0] - .4, 1.9, HOUSE[1] + .4], cu, 1.8);
      cl.position.set(cp[0], cp[1], cp[2]); cl.scale.setScalar(Math.max(.001, sm(P(4.8, 5.4, t))));
      cl.visible = t > 4.8;
      B.hs.crack.scale.y = Math.max(.001, sm(P(7.4, 10.0, t)));
      redHouse(B.hs, sm(P(8.6, 10.0, t)));
      B.houseTag.set([HOUSE[0], 2.0, HOUSE[1]], popE(P(0, .8, t)));
      cx.set([HOUSE[0] - .4, 2.0, HOUSE[1] + .9], popE(P(9.6, 10.4, t)) * .9, .05 * Math.sin(t * 4) * (t > 10.4 ? 1 : 0));
      sk.set([HOUSE[0] - .4, 2.0, HOUSE[1] + .9], P(9.6, 10.4, t), 1.3);
      B.hs.f.set(t, { smile: -.6, talk: 0, surprise: sm(P(9.6, 10.0, t)), look: [-1, 0] });
      B.doorTag.set([DOOR_X + 1.5, 1.5, -3.9], 1);
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([2.0, 1.4, 0], { dur: w[0], dist0: 14, dist1: 13.4, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 51)],
      [w[1], HH(insert([BX, 1.2, PZ], { dur: w[1], dist0: 6.4, dist1: 6.0, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 52)],
      [w[2], HH(insert([HOUSE[0], 1.4, HOUSE[1]], { dur: w[2], dist0: 7.6, dist1: 7.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 53)],
      [w[3], HH(crane([3.0, 1.3, PZ], { dur: w[3], dist0: 11, dist1: 10, h0: 1.0, h1: 2.0, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 54)]]);
    return Wd;
  }

  // ================================================================ BEAT 5 (14 s, bad): a teapot with a face ("אחר") comes along the path by chance; the minority gavel meets it and only sighs; a tiny bubble with a grey ball; red cross; tag "אפילו במקרה"
  function beat5(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const MEET = [-1.8, 0, PZ];
    const tp = new THREE.Group(); Wd.add(tp);
    const pot = cyl(.34, .4, .5, TEAPOT); pot.position.y = .25; tp.add(pot);
    const lid = cyl(.12, .14, .08, TEAPOT); lid.position.y = .54; tp.add(lid);
    const spout = box(.3, .08, .08, TEAPOT); spout.position.set(.45, .35, 0); spout.rotation.z = -.4; tp.add(spout);
    const tf = face(Wd, { w: .36, parent: tp, pos: [0, .3, .39], seed: 44 });
    const tiny = tag(Wd, 1.1, .45, '...', ...TAG_NEU);
    const sb = ball(.12, STONE); sb.visible = false; Wd.add(sb);
    const cx = mark3d(Wd, 'cross', 1.2), sk = shock(Wd, 0xff7a7a);
    const exitTag = tag(Wd, 3.2, .55, 'אפילו במקרה', ...TAG_BAD);
    Wd.occ = [B.G[HERO].g, tp]; Wd.center = [-1.4, 1.2];
    Wd.on(t => {
      const hu = sm(P(.6, 3.6, t)), hx = lerp(OUT[0], MEET[0], hu);
      B.G[HERO].g.position.set(hx, 0, PZ);
      const tx = lerp(4.6, -.4, sm(P(.6, 3.6, t)));
      tp.position.set(tx, 0, PZ);
      tf.set(t, { smile: .3, talk: .5 * talkAmt(t, 25) * sm(P(4.2, 4.8, t)), look: [-1, 0] });
      B.G[HERO].f.set(t, { smile: -.6 * sm(P(4.2, 4.8, t)), talk: .3 * talkAmt(t, 21) * sm(P(4.0, 4.6, t)), surprise: 0, look: [1, 0] });
      const tpop = popE(P(4.0, 4.6, t)) * (1 - sm(P(8.6, 9.2, t)));
      tiny.set([hx + .55, 1.45 + bob(t, 2), PZ + .2], tpop);
      sb.visible = tpop > .05; sb.position.set(hx + .4, 1.4, PZ + .25);
      cx.set([hx + .3, 2.0, PZ + .5], popE(P(6.2, 7.0, t)) * .9, .05 * Math.sin(t * 4) * (t > 7.0 ? 1 : 0));
      sk.set([hx + .3, 2.0, PZ + .5], P(6.2, 7.0, t), 1.2);
      exitTag.set([hx + 1.2, 2.2, PZ], popE(P(7.2, 8.0, t)));
      B.doorTag.set([DOOR_X + 1.5, 1.5, -3.9], 1);
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(crane([-1.8, 1.4, PZ], { dur: w[0], dist0: 8.6, dist1: 8.2, h0: 2.0, h1: 2.6, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 61)],
      [w[1], HH(insert([-1.8, 1.2, PZ], { dur: w[1], dist0: 4.8, dist1: 4.6, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), 62)],
      [w[2], HH(punch(insert([1.2, 1.2, PZ], { dur: w[2], dist0: 7.0, dist1: 6.6, h0: 1.2, h1: 1.4, a0: 6, a1: -6, fov0: 40, fov1: 40 }), [7.0]), 63)],
      [w[3], HH(truck([-1.2, 1.2, 0], { dur: w[3], dist0: 10.5, dist1: 9.6, h0: 1.6, h1: 2.0, a0: 6, a1: -6, fov0: 44, fov1: 42 }), 64)]]);
    return Wd;
  }

  // ================================================================ BEAT 6 (14 s, bad): a stormy grey cloud with "!" (the complaint) comes at the minority gavel; it pushes a heavy block "אשמה" toward the table - red cross + shock; the block slides back and sits on the stamped paper "הוחלט" (one decision of all); green check when the gavel stays quiet; tag "אף שהוא אמת"
  function beat6(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    const cl = new THREE.Group(); Wd.add(cl);
    [[-.22, 0, .22], [.2, .06, .24], [0, .2, .2]].forEach(([x, y, r]) => { const c = ball(r, CLOUD); c.position.set(x, y, 0); cl.add(c); });
    const bang = tag(Wd, .7, .7, '!', ...TAG_BAD);
    const block = box(.9, .6, .6, BLOCK); Wd.add(block);
    const bt = tag(Wd, 1.3, .5, 'אשמה', ...TAG_BAD);
    const cx = mark3d(Wd, 'cross', .8), sk = shock(Wd, 0xff7a7a);
    const ck = mark3d(Wd, 'check', .8);
    const quiet = tag(Wd, 3.2, .55, 'אף שהוא אמת', ...TAG_NEU);
    const BK1 = [-1.4, .3, PZ], BKP = [PAPER_POS[0], TOP + .3, PAPER_POS[2]];
    Wd.occ = [B.G[HERO].g, B.G[MAJ_FACE].g]; Wd.center = [-1.6, 1.2];
    Wd.on(t => {
      const cu = sm(P(.5, 4.0, t));
      const cp = arcPt([6.2, 2.1, PZ + .4], [OUT[0] + 1.2, 2.0, PZ + .4], cu, .6);
      cl.position.set(cp[0], cp[1], cp[2]); cl.visible = t > .5;
      bang.set([cp[0], cp[1] + .8, cp[2]], popE(P(.6, 1.2, t)) * (1 - sm(P(3.8, 4.4, t))));
      const pu = sm(P(4.6, 6.2, t));
      const hx = lerp(OUT[0], OUT[0] + .5, pu);
      B.G[HERO].g.position.set(hx, 0, PZ);
      const bu = sm(P(7.6, 9.6, t));
      const bp = t < 7.6 ? [lerp(hx + .9, BK1[0], pu), .3, PZ] : arcPt(BK1, BKP, bu, 1.4);
      block.position.set(bp[0], bp[1], bp[2]);
      bt.set([bp[0], bp[1] + .6, bp[2]], 1);
      cx.set([-1.4, 1.2, PZ + .5], popE(P(6.2, 7.0, t)) * .9, .05 * Math.sin(t * 4) * (t > 7.0 ? 1 : 0));
      sk.set([-1.4, 1.2, PZ + .5], P(6.2, 7.0, t), 1.2);
      ck.set([hx + .4, 1.9, PZ + .5], popE(P(10.6, 11.4, t)) * .9, .05 * Math.sin(t * 4) * (t > 11.4 ? 1 : 0));
      quiet.set([hx + 1.4, 2.2, PZ], popE(P(10.0, 10.8, t)));
      B.G[HERO].f.set(t, { smile: -.3 + 1.2 * sm(P(10.2, 11.2, t)), talk: 0, surprise: .8 * sm(P(6.2, 6.6, t)) * (1 - sm(P(7.0, 7.6, t))), look: [1, 0] });
      B.G[MAJ_FACE].f.set(t, { smile: .4, talk: 0, look: [-1, 0] });
      B.doorTag.set([DOOR_X + 1.5, 1.5, -3.9], 1);
    });
    const w = [3.5, 3.5, 3.5, 3.5];
    Wd.cam = cuts([
      [w[0], HH(truck([-1.2, 1.4, 0], { dur: w[0], dist0: 12, dist1: 11.4, h0: 2.0, h1: 2.2, a0: -6, a1: 6, fov0: 46, fov1: 46 }), 71)],
      [w[1], HH(punch(insert([-1.2, 1.2, PZ], { dur: w[1], dist0: 5.4, dist1: 5.0, h0: 1.2, h1: 1.4, a0: -6, a1: 6, fov0: 40, fov1: 40 }), [6.4]), 72)],
      [w[2], HH(insert([-1.0, 1.2, 1.0], { dur: w[2], dist0: 6.6, dist1: 6.2, h0: 1.4, h1: 1.6, a0: 6, a1: -6, fov0: 40, fov1: 40 }), 73)],
      [w[3], HH(crane([0.6, 1.3, 0], { dur: w[3], dist0: 10, dist1: 9.2, h0: 1.0, h1: 2.2, a0: -6, a1: 6, fov0: 44, fov1: 42 }), 74)]]);
    return Wd;
  }

  // ================================================================ ANSWER (20 s): the seven gavels stand together round the table, the jar and the stamped paper in front; a closed lock on the door; the minority gavel at the front left smiling
  function answer(dur) {
    const Wd = mkWorld({}); const B = build(Wd);
    B.lock.visible = true;
    const stamp = tag(Wd, 1.5, .55, 'הוחלט', ...TAG_GOLD);
    Wd.occ = [B.G[HERO].g]; Wd.center = [0, 1.2]; Wd.ansD = 6.4;
    Wd.on(t => {
      B.G[HERO].f.set(t, { smile: .9, talk: .3 * talkAmt(t, 37), look: [1, 0] });
      B.G[MAJ_FACE].f.set(t, { smile: .6, talk: 0, look: [0, 0] });
      B.doorTag.set([DOOR_X + 1.5, 1.5, -3.9], 1);
      stamp.set([PAPER_POS[0], TOP + .9, PAPER_POS[2]], 1);
    });
    Wd.camAns = cuts([[dur, HH(crane([0, 1.2, 0], { dur, dist0: 12, dist1: 11.2, h0: 3.0, h1: 4.2, a0: 6, a1: -6, fov0: 44, fov1: 42, ease: 'out' }), 25)]]);
    return Wd;
  }

  return { hook, scenes: [beat1, beat2, beat3, beat4, beat5, beat6], answer };
};
