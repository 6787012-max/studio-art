/* full bodies for the cartoon animals (side view facing right, ground at y=0, units ~ px at scale 1).
   K.body(name, pose) -> svg string. Head = the approved 3/4 head drawn with st.noBust, mounted on the neck.
   pose: {ph: walk phase in cycles (drive it from distance travelled -> no foot sliding), walk: 0..1 stride amount,
          air: lift of whole body (jump), tuck: 0..1 legs fold, pitch: deg body tilt, bob: extra body y,
          headRot: deg, turn: 1..-1 head scaleX (head turn), headDy, tail: deg, flap: 0..1 (rooster wings),
          expr, talk, blink, look, ear, mo, eye, puff, tongue} */
(function () {
  const { P, mass, taper, OL } = K;
  const frac = x => x - Math.floor(x);
  const r = K.r;
  K.get = n => K.list.find(e => e.name === n);

  // closed path of a limb along quadratic p0-c-p1 with linear width w0 -> w1
  function limbD(p0, c, p1, w0, w1) {
    const N = 10, L = [], R = [];
    const B = t => { const u = 1 - t; return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]; };
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = B(Math.max(0, t - 0.02)), b = B(Math.min(1, t + 0.02));
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = (w0 + (w1 - w0) * t) / 2, p = B(t);
      L.push([p[0] - dy * w, p[1] + dx * w]); R.push([p[0] + dy * w, p[1] - dx * w]);
    }
    const pts = L.concat(R.reverse());
    return 'M' + pts.map(p => r(p[0]) + ' ' + r(p[1])).join('L') + 'Z';
  }
  K.limbD = limbD;
  /* ---------- walk cycle (2026-10-28b) ----------
     Each leg: stance = foot locked to the ground (slides back exactly S per duty -> root must move S/duty per cycle,
     see K.cycleLen), last 18% of stance = break-over (heel lifts, toe pinned, push-off), swing = lift high early
     with the hoof curled back, reach forward, toe up just before contact. Two-bone IK with a real knee/hock. */
  const sm01 = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  function footPath(ph, S, duty, lift) {
    const p = frac(ph);
    if (p < duty) { const u = p / duty; return { x: S / 2 - S * u, y: 0, st: u, q: -1 }; }
    const q = (p - duty) / (1 - duty), e = sm01(q);
    return { x: -S / 2 + S * e, y: -lift * Math.sin(Math.PI * Math.pow(q, 0.75)), st: -1, q };
  }
  K.footPath = footPath;
  // hoof angle (deg, + = toe down / curled back) for a foot state
  function hoofAng(f, curl) {
    if (f.q < 0) return f.st > 0.82 ? 35 * sm01((f.st - 0.82) / 0.18) : 0;
    const q = f.q, c = curl == null ? 1 : curl;
    if (q < 0.35) return 35 + 45 * c * sm01(q / 0.35);
    if (q < 0.8) return 35 + 45 * c - (47 + 45 * c) * sm01((q - 0.35) / 0.45);
    return -12 * (1 - sm01((q - 0.8) / 0.2));
  }
  // two-bone IK: joint on the side whose x-offset has the sign of `side` (+1 knee forward, -1 hock back).
  // if the target is out of reach the segments stretch (cartoon rubber) so a planted foot never slides.
  function ik(h, f, L1, L2, side) {
    const dx = f[0] - h[0], dy = f[1] - h[1], d = Math.hypot(dx, dy) || 1;
    let k = 1; if (d > (L1 + L2) * 0.995) k = d / ((L1 + L2) * 0.995);
    const a1 = L1 * k, a2 = L2 * k, dd = Math.max(d, Math.abs(a1 - a2) + 1);
    const a = (a1 * a1 - a2 * a2 + dd * dd) / (2 * dd), hg = Math.sqrt(Math.max(0, a1 * a1 - a * a));
    const ux = dx / d, uy = dy / d; let nx = -uy, ny = ux; if (nx * side < 0) { nx = -nx; ny = -ny; }
    return [h[0] + ux * a + nx * hg, h[1] + uy * a + ny * hg];
  }
  K.ik = ik; K.hoofAng = hoofAng;
  const rot = (p, a, c) => { const s = Math.sin(a), co = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * co - y * s, c[1] + x * s + y * co]; };
  const rv = (v, deg) => { const a = deg * Math.PI / 180, s = Math.sin(a), c = Math.cos(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };

  // hoof / paw shape in a local frame: origin = ankle (top centre), sole at y = h, toe toward +x
  function hoofLocal(sp) {
    const w = sp.legW[1] * 0.62, h = sp.hoofH;
    if (sp.paw) return { d: `M${r(-w * 1.05)} 0L${r(w * 0.9)} 0C${r(w * 1.9)} ${r(h * 0.2)} ${r(w * 2.3)} ${r(h * 0.75)} ${r(w * 1.9)} ${r(h)}L${r(-w * 1.15)} ${r(h)}C${r(-w * 1.4)} ${r(h * 0.6)} ${r(-w * 1.3)} ${r(h * 0.3)} ${r(-w * 1.05)} 0Z`, toe: [w * 2.0, h], w, h };
    return { d: `M${r(-w * 0.95)} 0L${r(w * 0.95)} 0L${r(w * 1.3)} ${r(h)}L${r(-w * 1.05)} ${r(h)}Z`, toe: [w * 1.3, h], w, h };
  }

  // one leg. hip = top of the limb (inside the torso), g = foot state {x,y,st,q} in ground coords, side = knee dir
  function leg(sp, hip, g, side, fill, hoofFill, tuckT) {
    const hl = hoofLocal(sp), H = hl.h;
    const stand = Math.max(10, -hip[1] - H);                 // hip -> ankle distance when standing
    const Ltot = stand * (sp.legK || 1.035), r1 = side < 0 ? 0.54 : 0.5;
    const L1 = Ltot * r1, L2 = Ltot - L1;
    let ang = hoofAng(g, sp.curl);
    let ankle;
    if (g.q < 0 && ang > 0.01) {                           // break-over: toe pinned on the ground
      const toe = [g.x + hl.toe[0], g.y];
      const v = rv(hl.toe, ang); ankle = [toe[0] - v[0], toe[1] - v[1]];
    } else ankle = [g.x, g.y - H];
    if (tuckT) { ankle = [ankle[0] + (tuckT[0] - ankle[0]) * tuckT[2], ankle[1] + (tuckT[1] - ankle[1]) * tuckT[2]]; ang += 60 * tuckT[2]; }
    const kn = ik(hip, ankle, L1, L2, side);
    const w0 = sp.legW[0], w1 = sp.legW[1], wk = w1 * 1.18 + (w0 - w1) * 0.12;
    const mid = (a, b, bulge) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [m[0] - dy / l * bulge, m[1] + dx / l * bulge]; };
    const parts = [P(limbD(hip, mid(hip, kn, -side * w0 * 0.12), kn, w0, wk), fill),
      P(limbD(kn, mid(kn, ankle, 0), ankle, wk * 0.96, w1), fill),
      P(`M${r(kn[0] - wk * 0.55)} ${r(kn[1])}a${r(wk * 0.55)} ${r(wk * 0.55)} 0 1 0 ${r(wk * 1.1)} 0a${r(wk * 0.55)} ${r(wk * 0.55)} 0 1 0 ${r(-wk * 1.1)} 0Z`, fill)];
    if (H > 0) parts.push(P(hl.d, hoofFill, `translate(${r(ankle[0])} ${r(ankle[1])}) rotate(${r(ang)})`));
    return parts;
  }

  function headSvg(sp, po) {
    const el = K.get(sp.head);
    const st = { expr: po.expr || 'neutral', talk: po.talk || null, blink: !!po.blink, look: po.look, ear: po.ear, mo: po.mo, eye: po.eye, puff: po.puff, tongue: po.tongue, noBust: true };
    const turn = po.turn == null ? 1 : po.turn, tx = Math.abs(turn) < 0.08 ? 0.08 * Math.sign(turn || 1) : turn;
    const hx = sp.headAt[0] + (po.headDx || 0), hy = sp.headAt[1] + (po.headDy || 0);
    return `<g transform="rotate(${r(po.headRot || 0)} ${r(hx)} ${r(hy)}) translate(${r(hx)} ${r(hy)}) scale(${r(sp.hs * tx * 1000) / 1000} ${sp.hs}) translate(${-sp.sock[0]} ${-sp.sock[1]})">${el.draw(st)}</g>`;
  }

  /* ---------- quadruped ----------
     diagonal-sequence walk: near(left)-fore pairs with far(right)-hind, near-hind with far-fore; the hind foot of a
     pair lands a little before its diagonal fore. Body: low just after each contact, high at passing (2 bobs/cycle),
     slight pitch rock once per cycle; head nods against the body; tail swings with the hips. */
  const GAIT = { nh: 0, ff: 0.1, fh: 0.5, nf: 0.6 };
  function quad(sp, po) {
    const walk = po.walk || 0, ph = po.ph || 0, tuck = po.tuck || 0;
    const A = sp.bobAmp * walk;
    const gaitBob = A * 0.7 * Math.cos(4 * Math.PI * (ph - 0.16));          // + = down (svg)
    const bob = gaitBob + (po.bob || 0);
    const deg = (po.pitch || 0) + 1.3 * walk * Math.sin(2 * Math.PI * (ph - 0.1));
    const pitch = deg * Math.PI / 180, piv = [0, -sp.legLen];
    const hipOf = x => rot([x, -sp.legLen + bob], pitch, piv);
    const S = sp.stride * (po.strideK || 1), duty = sp.duty || 0.62;
    const legsDef = [
      { x: sp.hindX, o: GAIT.nh, k: -1, far: 0 }, { x: sp.foreX, o: GAIT.nf, k: 1, far: 0 },
      { x: sp.hindX + sp.farDx, o: GAIT.fh, k: -1, far: 1 }, { x: sp.foreX + sp.farDx, o: GAIT.ff, k: 1, far: 1 }];
    const near = [], far = [];
    for (const L of legsDef) {
      const hip0 = hipOf(L.x), hip = [hip0[0], hip0[1] - 14];
      const f0 = footPath(ph + L.o, S, duty, sp.lift);
      const g = { x: L.x + f0.x * walk, y: f0.y * walk, st: walk > 0.05 ? f0.st : 0, q: walk > 0.05 ? f0.q : -1 };
      if (walk <= 0.05) { g.st = 0; g.q = -1; }
      const tk = tuck > 0 ? [hip0[0] + L.k * sp.legLen * 0.22, hip0[1] + sp.legLen * 0.55, tuck] : null;
      const prt = leg(sp, hip, g, L.k, L.far ? sp.farFill : sp.legFill, L.far ? sp.hoofFar : sp.hoof, tk);
      (L.far ? far : near).push(...prt);
    }
    // gait-driven secondary motion (added on top of whatever the scene asks for)
    const po2 = Object.assign({}, po, {
      headRot: (po.headRot || 0) - 3.2 * walk * Math.cos(4 * Math.PI * (ph - 0.22)),
      tail: (po.tail || 0) + 9 * walk * Math.sin(2 * Math.PI * (ph - 0.3)),
    });
    let s = '';
    const tailSvg = sp.tail ? sp.tail(po2) : '';
    s += mass(far, { tint: sp.tint, light: [8, -6], noShade: false });
    const up = `translate(0 ${r(bob)}) rotate(${r(deg)} ${piv[0]} ${r(piv[1] - bob)})`;
    s += `<g transform="${up}">` + tailSvg + '</g>';
    const torso = P(sp.torso, sp.fill, up), neck = P(sp.neck(po2), sp.neckFill || sp.fill, up);
    const extra = sp.bodyParts ? sp.bodyParts(po2).map(p => P(p.d, p.fill, up)) : [];
    s += mass([...near, torso, neck, ...extra], { tint: sp.tint, light: [12, -9],
      inner: sp.inner ? `<g transform="${up}">${sp.inner(po2)}</g>` : '',
      lines: sp.lines ? `<g transform="${up}">${sp.lines(po2)}</g>` : '' });
    s += `<g transform="${up}">${headSvg(sp, po2)}</g>`;
    return s;
  }

  /* ---------- bird (rooster): two-leg walk, ankle bends backward, toes curl in swing, head holds still in space
     and then thrusts forward once per step (the chicken head-bob) ---------- */
  function bird(sp, po) {
    const walk = po.walk || 0, ph = po.ph || 0, tuck = po.tuck || 0, duty = 0.6;
    const bob = 3.2 * walk * Math.cos(4 * Math.PI * (ph - 0.12)) + (po.bob || 0);
    const deg = (po.pitch || 0) + 2.5 * walk * Math.sin(2 * Math.PI * ph) + 4 * walk;
    const up = `translate(0 ${r(bob)}) rotate(${r(deg)} 0 -70)`;
    // head bob: hold (head fixed in world while the body advances) then a quick thrust
    const cyc = sp.stride / duty, u = frac(ph * 2 + 0.15), A = 0.7 * cyc / 2 * 0.8;
    let hdx, hdy;
    if (u < 0.7) { hdx = A * (0.5 - u / 0.7); hdy = 0; }
    else { const v = sm01((u - 0.7) / 0.3); hdx = -A / 2 + A * v; hdy = 5 * Math.sin(Math.PI * v); }
    const po2 = Object.assign({}, po, { headDx: (po.headDx || 0) + hdx * walk, headDy: (po.headDy || 0) + hdy * walk,
      headRot: (po.headRot || 0) + 4 * walk * Math.sin(Math.PI * 2 * u), tail: (po.tail || 0) + 6 * walk * Math.sin(2 * Math.PI * ph) });
    let s = '';
    const legsSvg = (o, fill, dx) => {
      const hip = [dx, -66 + bob];
      const f0 = footPath(ph + o, sp.stride, duty, 20);
      let g = { x: dx + f0.x * walk, y: f0.y * walk, q: walk > 0.05 ? f0.q : -1, st: walk > 0.05 ? f0.st : 0 };
      let ankle = [g.x, g.y - 4];
      const tw = tuck * 0.7; ankle = [ankle[0] + (hip[0] + 6 - ankle[0]) * tw, ankle[1] + (hip[1] + 30 - ankle[1]) * tw];
      const L = (66 - 4) * 1.04, kn = ik(hip, ankle, L * 0.5, L * 0.5, -1);
      const lg = [P(limbD(hip, [(hip[0] + kn[0]) / 2, (hip[1] + kn[1]) / 2], kn, 13, 9), fill), P(limbD(kn, [(kn[0] + ankle[0]) / 2, (kn[1] + ankle[1]) / 2], ankle, 9, 8), fill)];
      let a = g.q >= 0 ? (g.q < 0.75 ? 55 * Math.sin(Math.PI * g.q / 0.75) : -10 * Math.sin(Math.PI * (g.q - 0.75) / 0.25)) : (g.st > 0.85 ? 18 * sm01((g.st - 0.85) / 0.15) : 0);
      a += 50 * tw;
      const toes = P(`M-4 -4L30 -3Q34 0 30 3L4 3L18 10Q20 14 15 13L-2 4L-16 6Q-20 4 -16 1Z`, fill, `translate(${r(ankle[0])} ${r(ankle[1] + 1)}) rotate(${r(a)})`);
      return mass([...lg, toes], { tint: sp.tint, light: [4, -4] });
    };
    s += legsSvg(0.5, '#c9932a', 10);
    const tw = po2.tail || 0;
    const tail = [P('M-40 -120C-90 -150 -110 -210 -90 -250C-80 -210 -60 -180 -30 -160Z', '#2f5a4a'),
      P('M-44 -112C-110 -120 -140 -170 -136 -210C-116 -170 -86 -146 -40 -140Z', '#3a6b58'),
      P('M-46 -100C-104 -96 -136 -126 -146 -156C-120 -132 -84 -122 -44 -124Z', '#2f5a4a')];
    s += `<g transform="${up} rotate(${r(tw)} -40 -120)">` + mass(tail, { tint: sp.tint, light: [8, -6],
      lines: taper([-48, -150], [-82, -190], [-90, -236], 0.5, 3, 0.5, '#5d9c82') + taper([-52, -132], [-104, -150], [-128, -196], 0.5, 3, 0.5, '#5d9c82') + taper([-52, -114], [-100, -112], [-138, -146], 0.5, 3, 0.5, '#5d9c82') }) + '</g>';
    const pf = 1 + (po.puff || 0) * 0.6;
    const body = P(`M-58 -110C-62 -${r(160 * pf)} 10 -${r(176 * pf)} 52 -150C78 -132 80 -90 52 -66C20 -40 -40 -44 -56 -76C-62 -88 -60 -100 -58 -110Z`, '#c8522c', up);
    s += mass([body], { tint: sp.tint, light: [12, -8],
      inner: `<g transform="${up}"><path d="M-30 -60C-10 -50 30 -54 50 -70L60 -40L-40 -30Z" fill="#a8401f"/></g>` });
    const fl = po.flap || 0;
    const wing = P('M-34 -128C0 -140 40 -126 46 -100C30 -86 -10 -80 -40 -92C-50 -104 -46 -120 -34 -128Z', '#a8401f',
      `${up} rotate(${r(-fl * 55)} 30 -118)`);
    s += mass([wing], { tint: sp.tint, light: [6, -6], lines: `<g transform="${up} rotate(${r(-fl * 55)} 30 -118)">` +
      taper([-28, -108], [0, -112], [30, -112], 0.5, 2.6, 0.5, '#7a2a14') + taper([-30, -96], [0, -98], [26, -100], 0.5, 2.4, 0.5, '#7a2a14') + '</g>' });
    s += legsSvg(0, '#e8ad38', -8);
    s += `<g transform="${up}">${headSvg(sp, po2)}</g>`;
    return s;
  }

  /* ---------- specs ---------- */
  const SP = {};
  SP.donkey = {
    head: 'donkey', hs: 0.64, sock: [132, 214], headAt: [128, -286],
    legLen: 140, hindX: -78, foreX: 66, farDx: 18, stride: 62, lift: 26, bobAmp: 5, legW: [36, 19], hoofH: 15,
    fill: '#a59689', legFill: '#a59689', farFill: '#8a7b70', hoof: '#3d302b', hoofFar: '#2b221f', tint: '#bfb1bb',
    torso: 'M-114 -172C-122 -226 -60 -242 4 -236C64 -240 108 -222 112 -178C116 -132 84 -110 2 -112C-72 -108 -110 -126 -114 -172Z',
    neck: () => 'M40 -222C64 -264 86 -298 102 -314L150 -284C138 -240 126 -200 112 -156Z',
    bodyParts: () => [{ d: K.tufts([[112, -334], [92, -306], [76, -280], [60, -254], [44, -228], [30, -206]], [24, 26, 24, 26, 20], -1, 0.35, 'L60 -230L96 -290'), fill: '#3d302b' }],
    inner: () => '<path d="M-92 -128C-40 -108 50 -110 98 -136C92 -118 60 -112 2 -113C-60 -110 -86 -116 -92 -128Z" fill="#e6dacb"/>',
    lines: () => taper([-60, -150], [-30, -136], [10, -140], 0.5, 2.6, 0.5, '#7d6e64') + taper([60, -200], [82, -186], [92, -160], 0.5, 2.4, 0.5, '#7d6e64'),
    tail: po => { const a = po.tail || 0; return `<g transform="rotate(${r(a)} -108 -196)">` + mass([P(limbD([-108, -196], [-128, -160], [-124, -100], 11, 7), '#a59689'),
      P(K.tufts([[-132, -110], [-126, -84], [-116, -110]], [-16, -16], 1, 0.2), '#3d302b')], { tint: '#bfb1bb', light: [4, -4] }) + '</g>'; },
  };
  SP.cow = {
    head: 'cow', hs: 0.66, sock: [128, 214], headAt: [134, -250],
    legLen: 128, hindX: -86, foreX: 76, farDx: 18, stride: 56, lift: 22, bobAmp: 4, legW: [40, 22], hoofH: 14,
    fill: '#f4eee4', legFill: '#f4eee4', farFill: '#d9cfc2', hoof: '#4a3428', hoofFar: '#32231b', tint: '#cdbfc9',
    torso: 'M-128 -178C-134 -236 -70 -252 6 -246C76 -250 124 -232 126 -184C128 -130 92 -106 4 -108C-80 -104 -124 -122 -128 -178Z',
    neck: () => 'M56 -226C80 -256 100 -272 116 -280L160 -238C150 -204 138 -172 120 -146Z',
    bodyParts: () => [{ d: 'M-70 -116C-72 -96 -40 -92 -34 -114Z', fill: '#eaa39c' }],
    inner: () => '<path d="M-40 -250C-10 -230 -16 -190 -50 -180C-84 -172 -96 -200 -90 -230C-80 -248 -60 -254 -40 -250Z" fill="#7b4e36"/>' +
      '<path d="M50 -150C70 -160 98 -150 104 -126L80 -110L40 -112C36 -128 40 -142 50 -150Z" fill="#7b4e36"/>' +
      '<path d="M-128 -170C-110 -176 -100 -150 -110 -128L-128 -130Z" fill="#7b4e36"/>',
    lines: () => taper([-70, -116], [-62, -104], [-54, -110], 0.5, 2, 0.5, '#c27a74') + taper([-36, -114], [-44, -104], [-52, -110], 0.5, 2, 0.5, '#c27a74'),
    tail: po => { const a = po.tail || 0; return `<g transform="rotate(${r(a)} -122 -214)">` + mass([P(limbD([-122, -214], [-150, -170], [-140, -96], 8, 6), '#f4eee4'),
      P(K.tufts([[-150, -104], [-140, -74], [-130, -104]], [-16, -16], 1, 0.2), '#7b4e36')], { tint: '#cdbfc9', light: [4, -4] }) + '</g>'; },
  };
  SP.goat = {
    head: 'goat', hs: 0.68, sock: [140, 214], headAt: [108, -250],
    legLen: 124, hindX: -64, foreX: 58, farDx: 14, stride: 56, lift: 24, bobAmp: 5, legW: [28, 14], hoofH: 13,
    fill: '#e9e2d6', legFill: '#e9e2d6', farFill: '#cbc2b4', hoof: '#5a4a3c', hoofFar: '#3d3228', tint: '#c6bccb',
    torso: 'M-96 -168C-102 -212 -50 -224 2 -220C54 -224 94 -208 96 -170C98 -132 68 -114 0 -116C-60 -112 -92 -128 -96 -168Z',
    neck: () => 'M30 -206C50 -238 72 -262 92 -276L136 -246C124 -214 112 -184 96 -150Z',
    inner: () => '<path d="M-80 -130C-30 -114 40 -116 84 -136C78 -122 50 -116 0 -117C-50 -114 -74 -120 -80 -130Z" fill="#d8cfc0"/>',
    tail: po => { const a = (po.tail || 0) * 1.4; return `<g transform="rotate(${r(a)} -92 -196)">` + mass([P('M-88 -192C-104 -212 -118 -236 -110 -248C-96 -238 -86 -222 -78 -200Z', '#e9e2d6')], { tint: '#c6bccb', light: [4, -4] }) + '</g>'; },
  };
  SP.sheep = {
    head: 'sheep', hs: 0.56, sock: [160, 220], headAt: [96, -196],
    legLen: 100, hindX: -58, foreX: 54, farDx: 14, stride: 48, lift: 22, bobAmp: 4, legW: [20, 14], hoofH: 12,
    fill: '#f6f1e6', legFill: '#3d3532', farFill: '#2b2523', hoof: '#1d1816', hoofFar: '#120e0c', tint: '#c9c0d2', knee: 2,
    torso: K.scallop(K.circlePts(0, -158, 116, 76, 16, 0, [0, .06, -.03, .05, 0, .07, -.02]), 0.5),
    neck: () => 'M60 -190C80 -206 96 -214 110 -214L120 -160L70 -140Z',
    neckFill: '#f6f1e6',
    lines: () => taper([-60, -140], [-46, -152], [-30, -146], 0.5, 2.6, 0.5, '#b9b0c0') + taper([10, -120], [24, -132], [40, -126], 0.5, 2.6, 0.5, '#b9b0c0') + taper([-20, -196], [-6, -206], [10, -200], 0.5, 2.6, 0.5, '#b9b0c0'),
    tail: po => { const a = po.tail || 0; return `<g transform="rotate(${r(a)} -110 -170)">` + mass([P(K.scallop(K.circlePts(-122, -168, 20, 16, 7, 0), 0.5), '#f6f1e6')], { tint: '#c9c0d2', light: [4, -4] }) + '</g>'; },
  };
  SP.camel = {
    head: 'camel', hs: 0.6, sock: [150, 214], headAt: [212, -338],
    legLen: 190, hindX: -84, foreX: 74, farDx: 18, stride: 92, lift: 30, bobAmp: 6, legW: [36, 18], hoofH: 16, paw: true, knee: 8,
    fill: '#dcae6c', legFill: '#dcae6c', farFill: '#bf9258', hoof: '#a8703e', hoofFar: '#7f5430', tint: '#cdb3a8',
    torso: 'M-124 -240C-130 -282 -90 -296 -60 -300C-40 -372 40 -380 60 -300C100 -296 122 -276 120 -242C118 -196 84 -176 0 -178C-80 -174 -120 -194 -124 -240Z',
    neck: po => 'M70 -270C120 -262 140 -250 160 -282C180 -318 200 -340 214 -348L240 -316C220 -296 200 -250 176 -222C150 -196 110 -200 80 -206Z',
    inner: () => '<path d="M-40 -340C-20 -366 30 -366 46 -330C20 -344 -10 -346 -40 -340Z" fill="#efd29e"/>',
    lines: () => taper([-40, -230], [0, -214], [40, -226], 0.5, 2.6, 0.5, '#a8703e') + taper([110, -246], [140, -236], [156, -262], 0.5, 2.4, 0.5, '#a8703e'),
    tail: po => { const a = po.tail || 0; return `<g transform="rotate(${r(a)} -118 -262)">` + mass([P(limbD([-118, -262], [-136, -230], [-132, -188], 9, 6), '#dcae6c'),
      P(K.tufts([[-140, -196], [-132, -170], [-124, -196]], [-14, -14], 1, 0.2), '#a8703e')], { tint: '#cdb3a8', light: [4, -4] }) + '</g>'; },
  };
  SP.dog = {
    head: 'dog', hs: 0.58, sock: [150, 210], headAt: [90, -164],
    legLen: 78, hindX: -56, foreX: 50, farDx: 12, stride: 44, lift: 22, bobAmp: 5, legW: [24, 15], hoofH: 9, paw: true, knee: 3,
    fill: '#cf914f', legFill: '#cf914f', farFill: '#ad7440', hoof: '#f7efe2', hoofFar: '#d8cdbb', tint: '#d1b3b4',
    torso: 'M-84 -110C-88 -146 -40 -152 0 -148C44 -152 84 -140 84 -108C84 -80 56 -66 0 -68C-52 -64 -82 -78 -84 -110Z',
    neck: () => 'M34 -132C50 -152 66 -166 80 -174L112 -150C102 -126 88 -100 70 -86Z',
    inner: () => '<path d="M30 -78C50 -70 76 -84 84 -104L90 -60L30 -60Z" fill="#f7efe2"/><path d="M-40 -150C-20 -134 0 -134 14 -150Z" fill="#7a4a2c"/>',
    tail: po => { const a = po.tail || 0; return `<g transform="rotate(${r(a)} -80 -122)">` + mass([P('M-82 -126C-108 -140 -122 -168 -116 -190C-104 -180 -96 -160 -76 -142Z', '#cf914f'),
      P('M-116 -190C-122 -176 -118 -170 -110 -172Z', '#f7efe2')], { tint: '#d1b3b4', light: [4, -4] }) + '</g>'; },
  };
  SP.rooster = { head: 'rooster', hs: 0.5, sock: [160, 232], headAt: [44, -138], stride: 34, tint: '#d6b6c0', bird: true };
  K.BODY = SP;

  K.body = function (name, po) { const sp = SP[name]; return sp.bird ? bird(sp, po || {}) : quad(sp, po || {}); };
  // distance travelled per walk cycle (use ph = dist / K.cycleLen(name) to keep feet planted)
  K.cycleLen = (name, strideK) => { const sp = SP[name], k = strideK || 1; return sp.bird ? sp.stride * k / 0.6 : sp.stride * k / (sp.duty || 0.62); };
})();
