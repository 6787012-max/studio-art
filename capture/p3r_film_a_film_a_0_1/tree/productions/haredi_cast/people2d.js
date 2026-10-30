/* haredi cast - 2D designs for the boy, the bochur and two rabbis (same elements2d kit and drawing method as
   productions/haredi_man/man2d.js, but every person has their own design object: proportions, face, beard, headwear, clothes).
   Registered as K.pHead34 / K.pHeadFront / K.pHeadSide / K.pHeadBack / K.pFront / K.pSide / K.pHand / K.pEyesFront /
   K.pMouthFront (all take (st|po, D) with D = one of K.P_D.boy | bochur | rabbiA | rabbiB), K.pCycle(D) = stride per cycle.
   Design fields beyond the man's: beardK none|full|short|pointed, bPoint (taper), glasses, hatK hat|hat2|kippa, pey (peyot
   length), hem (coat hem y, man = -58), lapels (open coat V), bx / by (body scale), hk (head scale), hsx / hsy (head shape),
   mouthDy (mouth shift for a beardless face), tzY (tzitzit top). */
(function () {
  const { P, mass, taper, eye, brow, mouth, OL } = K;
  const r = K.r;
  const sm01 = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  const rv = (v, deg) => { const a = deg * Math.PI / 180, s = Math.sin(a), c = Math.cos(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };

  /* ---------------- designs ---------------- */
  const BASE = {
    skin: '#f8d6b6', skinT: '#e8bcb0', noseC: '#f3caa9', blush: '#f09a88', lip: '#e0948a', nostril: '#c98a72',
    hair: '#4a3324', beard: '#62432f', beardT: '#c0a4a0', beardLine: '#3a2416', beardHi: '#8a6a52', grey: '#b8aca2', brow: '#5a3e2c',
    hat: '#34323d', hatT: '#8f8aa0', hatHi: '#6e6b80', band: '#1d1b22',
    coat: '#4a4e66', coatT: '#a7a3bd', coatHi: '#9094b0', coatFar: '#363a4d',
    pants: '#3c3f52', pantsFar: '#2c2e3d', shoe: '#2a282f', shoeHi: '#8a8798', shirt: '#f9f7f0', shirtT: '#cfccdb',
    nose: 1, noseLong: 1, bLen: 1, bW: 1, hatK: 'hat', crownH: 1, brimW: 1, bodyW: 1, belly: 1, browW: 10,
  };
  K.P_D = {
    boy: Object.assign({}, BASE, { name: 'boy (10)', skin: '#f9dabe', noseC: '#f4ccad', hair: '#5a3a22', beardT: '#c8aaa0', beardLine: '#3a2416', beardHi: '#7e5a40', brow: '#4a3020', browW: 8,
      beardK: 'none', hatK: 'kippa', hat: '#26315e', hatT: '#8a90b8', hatHi: '#56659e',
      coat: '#f7f5ef', coatT: '#c4c2d4', coatHi: '#dcdae6', coatFar: '#dddbe6', pants: '#2f3346', pantsFar: '#24273a',
      lapels: false, hem: -100, tzY: -104, bx: 0.74, by: 0.64, hk: 1.04, bodyW: 0.9, belly: 0.88, pey: 0.72, mouthDy: -12, btn: '#c9c6d4', crop: true,
      bounce: 1.9, swing: 1.35, armK: 0.82, handK: 0.85, footK: 0.85, shW: 0.82, stance: 1.0, strideK: 1.0, peyR: 1.05, eyeK: 1.0 }),
    bochur: Object.assign({}, BASE, { name: 'bochur (22)', hair: '#2a1e18', beard: '#2e231d', beardT: '#b4a6a8', beardLine: '#140e0b', beardHi: '#4d3d36', grey: '#5a4c44', brow: '#2a1e18', browW: 9,
      beardK: 'short', bLen: 0.4, bW: 0.94, glasses: true, coat: '#30323f', coatT: '#a3a0b8', coatHi: '#767a96', coatFar: '#25262f', pants: '#2c2d38', pantsFar: '#212129',
      hem: -88, bx: 0.86, by: 1.08, hk: 0.92, bodyW: 0.86, belly: 0.84, pey: 0.62, hsx: 0.92, hsy: 1.08,
      bounce: 1.2, swing: 1.1, armK: 0.82, handK: 0.95, footK: 1.0, shW: 0.86, stance: 0.85, strideK: 1.08, crownH: 0.86 }),
    rabbiA: Object.assign({}, BASE, { name: 'rabbi A (white beard)', skin: '#f6d3b8', hair: '#e4e1da', beard: '#eeece6', beardT: '#c4c2cc', beardLine: '#9a948e', beardHi: '#ffffff', grey: '#c2bdb6',
      brow: '#d2cec6', browW: 12, beardK: 'full', bLen: 1.12, bW: 1.1, glasses: true, coat: '#33354a', coatT: '#a3a0b8', coatHi: '#7d809c', coatFar: '#272838',
      hem: -36, bx: 1.1, by: 0.91, belly: 1.32, bodyW: 1.08, hk: 1.04, pey: 1.0, jawW: 1.12, hsx: 1.06, hsy: 0.98,
      bounce: 0.6, swing: 0.6, armK: 1.15, handK: 1.08, footK: 1.05, shW: 1.08, stance: 1.2, strideK: 0.72, crownH: 0.86 }),
    rabbiB: Object.assign({}, BASE, { name: 'rabbi B (grey, pointed)', skin: '#f3cfb0', noseC: '#efc6a6', hair: '#7a7470', beard: '#94908c', beardT: '#bdb8c4', beardLine: '#55504c', beardHi: '#c2beba', grey: '#d8d4d0',
      brow: '#7a746e', browW: 19, beardK: 'pointed', bLen: 1.4, bW: 0.82, bPoint: 0.66, hatK: 'hat2', brimW: 0.9, crownH: 0.8,
      coat: '#2e3142', coatT: '#a3a0b8', coatHi: '#757994', coatFar: '#232533', hem: -40, bx: 0.84, by: 1.1, belly: 0.84, bodyW: 0.84, hk: 0.98, hsx: 0.86, hsy: 1.2, pey: 0.9,
      bounce: 0.8, swing: 0.8, armK: 0.9, handK: 1.05, footK: 1.1, shW: 0.9, stance: 0.9, strideK: 1.15, calm: true }),
  };
  K.P_DEF = K.P_D.boy;

  /* ---------------- expressions (all warm) ---------------- */
  const SMILE = { top: 0.05, tilt: -0.2, bot: 0.17, pr: 0.62, look: [0.2, 0.04], b1: { raise: 6, inRaise: 8, arch: 8 }, b2: { raise: 6, inRaise: 8, arch: 8 }, m: { open: 0.13, smile: 0.85, teeth: 6 }, crinkle: 1 };
  const PRE = {
    smile: SMILE,
    neutral: SMILE,
    laugh: { blink: true, happy: true, b1: { raise: 12, inRaise: 13, arch: 10 }, b2: { raise: 12, inRaise: 13, arch: 10 }, m: { open: 0.75, smile: 0.95, teeth: 8, wide: 1.2 }, crinkle: 1.6 },
    explaining: { top: 0.02, tilt: -0.1, bot: 0.1, pr: 0.6, look: [0.32, 0], b1: { raise: 9, inRaise: 8, arch: 9 }, b2: { raise: 15, inRaise: 10, arch: 10 }, m: { open: 0.32, smile: 0.5, teeth: 7 }, crinkle: 0.6 },
    surprised: { top: 0, tilt: 0, bot: 0.03, pr: 0.52, look: [0.12, 0], b1: { raise: 17, inRaise: 17, arch: 10, gap: 8 }, b2: { raise: 18, inRaise: 18, arch: 10, gap: 8 }, m: { open: 0.42, smile: 0.25, round: 1, wide: 0.7 }, crinkle: 0 },
    thinking: { top: 0.08, tilt: -0.1, bot: 0.12, pr: 0.58, look: [0.5, -0.8], b1: { raise: 4, inRaise: 6, arch: 7 }, b2: { raise: 14, inRaise: 9, arch: 10 }, m: { open: 0, smile: 0.35, skew: -4 }, crinkle: 0.4 },
    proud: { blink: true, happy: true, b1: { raise: 9, inRaise: 7, arch: 9 }, b2: { raise: 9, inRaise: 7, arch: 9 }, m: { open: 0, smile: 1 }, crinkle: 1.3 },
    worried: { top: 0.04, tilt: 0.3, bot: 0.06, pr: 0.56, look: [-0.1, 0.1], b1: { raise: 2, inRaise: 13, arch: 4 }, b2: { raise: 2, inRaise: 13, arch: 4 }, m: { open: 0.08, smile: -0.2 }, crinkle: 0 },
  };
  K.P_EX = ['smile', 'laugh', 'explaining', 'surprised', 'thinking', 'proud'];
  K.P_TALK = ['X', 'A', 'E', 'O', 'U', 'M'];
  function face(st) {
    const E = Object.assign({}, PRE[st.expr || 'smile'] || SMILE);
    if (st.look) E.look = st.look;
    const m = Object.assign({}, E.m);
    if (st.talk) {
      const sm0 = Math.max(0.3, Math.min(0.6, (E.m.smile || 0) * 0.7));
      Object.assign(m, { X: { open: 0.1, smile: sm0, round: 0, teeth: 6 }, A: { open: 0.55, smile: sm0, round: 0, teeth: 7 }, E: { open: 0.28, smile: Math.max(0.45, sm0), round: 0, teeth: 7, wide: 1.12 },
        O: { open: 0.5, smile: 0.1, round: 1, wide: 0.78 }, U: { open: 0.28, smile: 0.1, round: 1, wide: 0.58 }, M: { open: 0, smile: sm0 * 0.6, press: 1 } }[st.talk]);
    }
    return { E, m, blink: st.blink || E.blink, happy: E.happy || (st.blink && (E.crinkle || 0) > 1) };
  }
  K.pFace = face;
  // front-facing face parts for the 3D head decals (same coords as manHeadFront)
  K.pEyesFront = (st, D) => { const f = face(st || {}); D = D || K.P_DEF;
    if (!f.blink) f.E = Object.assign({}, f.E, { top: Math.max(f.E.top || 0, 0.24), tilt: -0.12, pr: Math.max(f.E.pr || 0.5, 0.72), bot: Math.max(f.E.bot || 0, 0.2) });
    return eyes2(f, { x: 124, y: 134, rx: 19, ry: 22, side: -1 }, { x: 176, y: 134, rx: 19, ry: 22, side: 1 }, D); };
  K.pMouthFront = (st, D) => { D = D || K.P_DEF; const f = face(st || {});
    if (D.calm && !st.talk && (!st.expr || st.expr === 'smile' || st.expr === 'neutral')) f.m = { open: 0, smile: 0.55 };
    return (D.beardK === 'none' ? '' : `<ellipse cx="150" cy="${r(207 + f.m.open * 4)}" rx="17" ry="${r(7 + f.m.open * 14)}" fill="${D.lip}"/>`) + mouthAt(f, 150, 204, D.beardK === 'none' ? 30 : 34, 0); };
  K.pShoeAng = f => shoeAng(f);
  function eyes2(f, e1, e2, D, sk) {
    let s = '';
    for (const [e, b] of [[e1, f.E.b1], [e2, f.E.b2]]) {
      Object.assign(e, { top: f.E.top, tilt: f.E.tilt, bot: f.E.bot, pr: f.E.pr, look: f.E.look, blink: f.blink, happyClose: f.happy, lid: sk || D.skin, lw: 3.6 });
      s += eye(e);
      // smile lines at the outer corner
      const c = f.E.crinkle || 0;
      if (c > 0.2) { const ox = e.x + e.side * e.rx * 1.08, oy = e.y + e.ry * 0.25;
        s += taper([ox, oy], [ox + e.side * 6, oy + 2], [ox + e.side * 11 * Math.min(1.3, c), oy - 1], 0.5, 2.6, 0.4, '#c48a72');
        if (c > 1) s += taper([ox - e.side * 1, oy + 7], [ox + e.side * 5, oy + 11], [ox + e.side * 9, oy + 12], 0.5, 2.2, 0.4, '#c48a72'); }
    }
    s += brow(e1, Object.assign({ w: D.browW, len: 1.05 }, f.E.b1), D.brow) + brow(e2, Object.assign({ w: D.browW, len: 0.95 }, f.E.b2), D.brow);
    return s;
  }
  function mouthAt(f, x, y, w, rot) {
    const m = f.m;
    if (m.press) return taper([x - w * 0.42, y - 1], [x, y + 3], [x + w * 0.42, y - 1], 2, 4.6, 2) + taper([x - w * 0.18, y + 7], [x, y + 9], [x + w * 0.18, y + 7], 0.5, 2.2, 0.5, '#a0574a');
    return mouth({ x, y, w: w * (m.wide || 1), open: m.open, smile: m.smile, round: m.round, teeth: m.round ? 0 : (m.teeth || 0), rot: rot || 0, skew: m.skew || 0, inside: '#6a2224', tongue: '#e07a80', lw: 3.4 });
  }

  /* ---------------- shared pieces ---------------- */
  function beardPts(D, pts, cx, top) {
    return pts.map(p => [cx + (p[0] - cx) * D.bW * taperK(D, p[1], top), p[1] > top ? top + (p[1] - top) * D.bLen : p[1]]);
  }
  function taperK(D, y, top) { return D.bPoint ? 1 - D.bPoint * Math.max(0, Math.min(1, (y - top) / 92)) : 1; }
  const BX = (D, cx, top) => ([x, y]) => [cx + (x - cx) * D.bW * taperK(D, y, top), y > top ? top + (y - top) * D.bLen : y];
  // clump separation lines (dark) + a few light grey strands
  function beardLines(D, cx, top, dark, light) {
    const T = BX(D, cx, top);
    return dark.map(([a, b, c]) => taper(T(a), T(b), T(c), 0.6, 3.4, 0.6, D.beardLine)).join('') +
      light.map(([a, b, c]) => taper(T(a), T(b), T(c), 0.5, 2.4, 0.5, D.grey)).join('');
  }
  // ringlet (pe'ah) hanging from top point downwards; sizes vary, last loop is a loose curl
  function peah(x, y, len, D, sd, wid, seed) {
    sd = sd || 1; wid = wid || 9; seed = seed || 0;
    const n = Math.max(4, Math.round(len / 13));
    let s = mass([P(K.limbD([x, y - 12], [x + sd * 2, y + len * 0.35], [x + sd * 3, y + len * 0.7], wid * 1.0, wid * 0.7), D.hair)], { tint: D.beardT, light: [3, -3], w: 3.2 });
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), cx = x + sd * (3 * t + 2.2 * Math.sin(i * 1.7 + seed)), cy = y + t * len;
      const w = wid * (1.05 - 0.35 * t) * (1 + 0.14 * Math.sin(i * 2.3 + seed)), h = len / n * (0.9 + 0.15 * Math.cos(i * 1.9 + seed));
      const d = `M${r(cx - w)} ${r(cy)}C${r(cx - w)} ${r(cy - h * 0.9)} ${r(cx + w)} ${r(cy - h * 0.9)} ${r(cx + w)} ${r(cy)}C${r(cx + w)} ${r(cy + h * 0.9)} ${r(cx - w)} ${r(cy + h * 0.9)} ${r(cx - w)} ${r(cy)}Z`;
      s += `<g transform="rotate(${r(-sd * (14 + 8 * Math.sin(i + seed)))} ${r(cx)} ${r(cy)})">` + mass([P(d, D.hair)], { tint: D.beardT, light: [3, -3], w: 3,
        lines: taper([cx - w * 0.6, cy - h * 0.2], [cx, cy - h * 0.55], [cx + w * 0.55, cy - h * 0.25], 0.5, 2.2, 0.5, D.beardHi) }) + '</g>';
    }
    // loose curl at the end
    const ex = x + sd * 4, ey = y + len + 4;
    s += taper([ex, ey - 4], [ex + sd * 9, ey + 4], [ex + sd * 2, ey + 10], 1, 4.4, 1.2, OL) + taper([ex, ey - 4], [ex + sd * 9, ey + 4], [ex + sd * 2, ey + 10], 0.5, 2.2, 0.5, D.hair);
    return s;
  }
  function hat(D, cx, by, rx, ry, rot, view) {
    const bw = rx * D.brimW, ch = 60 * D.crownH, cw = view === 's' ? 54 : 52;
    let s = '';
    const brim = P(`M${cx - bw} ${by}C${cx - bw} ${by - ry * 1.3} ${cx + bw} ${by - ry * 1.3} ${cx + bw} ${by}C${cx + bw} ${by + ry * 1.35} ${cx - bw} ${by + ry * 1.35} ${cx - bw} ${by}Z`, D.hat);
    const brimLines = taper([cx - bw * 0.82, by + ry * 0.55], [cx, by + ry * 1.25], [cx + bw * 0.82, by + ry * 0.55], 0.5, 3, 0.5, D.hatHi);
    const crown = view === 's'
      ? P(`M${cx - cw} ${by + 2}C${cx - cw - 2} ${by - ch * 0.6} ${cx - cw + 4} ${by - ch} ${cx - cw * 0.4} ${by - ch * 1.02}C${cx - cw * 0.1} ${by - ch * 0.9} ${cx + cw * 0.15} ${by - ch * 0.9} ${cx + cw * 0.5} ${by - ch * 1.02}C${cx + cw} ${by - ch} ${cx + cw + 3} ${by - ch * 0.6} ${cx + cw} ${by + 2}Z`, D.hat)
      : P(`M${cx - cw} ${by + 4}C${cx - cw - 3} ${by - ch * 0.55} ${cx - cw + 2} ${by - ch * 0.95} ${cx - cw * 0.55} ${by - ch * 1.02}C${cx - cw * 0.25} ${by - ch * 1.06} ${cx - 8} ${by - ch * 0.98} ${cx} ${by - ch * 0.84}C${cx + 8} ${by - ch * 0.98} ${cx + cw * 0.25} ${by - ch * 1.06} ${cx + cw * 0.55} ${by - ch * 1.02}C${cx + cw - 2} ${by - ch * 0.95} ${cx + cw + 3} ${by - ch * 0.55} ${cx + cw} ${by + 4}Z`, D.hat);
    if (D.hatK === 'hat2_unused') { const c2 = cw * 0.9, h2 = ch * 1.16;
      crown.d = `M${cx - c2} ${by + 4}C${cx - c2 - 1} ${by - h2 * 0.75} ${cx - c2 * 0.62} ${by - h2 * 1.04} ${cx} ${by - h2 * 1.05}C${cx + c2 * 0.62} ${by - h2 * 1.04} ${cx + c2 + 1} ${by - h2 * 0.75} ${cx + c2} ${by + 4}Z`; }
    const band = `<path d="M${cx - cw - 6} ${by - 16}C${cx - cw * 0.3} ${by - 10} ${cx + cw * 0.3} ${by - 10} ${cx + cw + 6} ${by - 16}L${cx + cw + 6} ${by + 6}L${cx - cw - 6} ${by + 6}Z" fill="${D.band}"/>`;
    const crownLines = D.hatK === 'hat2_unused' ? taper([cx + cw * 0.5, by - ch * 0.95], [cx + cw * 0.8, by - ch * 0.6], [cx + cw * 0.82, by - 24], 0.5, 3.2, 0.5, D.hatHi) + taper([cx - cw + 6, by - 16], [cx, by - 9], [cx + cw - 6, by - 16], 0.5, 2.2, 0.5, D.hatHi) : ((view !== 's' ? taper([cx, by - ch * 0.82], [cx - 2, by - ch * 0.55], [cx + 2, by - ch * 0.3], 0.5, 3, 0.5, D.hatHi) : taper([cx - cw * 0.3, by - ch * 0.98], [cx, by - ch * 0.82], [cx + cw * 0.4, by - ch * 0.98], 0.5, 2.6, 0.5, D.hatHi)) +
      taper([cx + cw * 0.62, by - ch * 0.9], [cx + cw * 0.9, by - ch * 0.6], [cx + cw * 0.9, by - 24], 0.5, 3.2, 0.5, D.hatHi) +
      taper([cx - cw + 2, by - 16], [cx, by - 9], [cx + cw - 2, by - 16], 0.5, 2.2, 0.5, D.hatHi));
    s += `<g transform="rotate(${rot || 0} ${cx} ${by})">`;
    s += mass([brim], { tint: D.hatT, light: [8, -4], lines: brimLines + (D.hatK === 'hat2' ? taper([cx - bw * 0.9, by + 1], [cx - bw * 0.99, by - ry * 0.4], [cx - bw * 0.97, by - ry * 1.3 - 6], 0.6, 3.6, 0.6) + taper([cx + bw * 0.9, by + 1], [cx + bw * 0.99, by - ry * 0.4], [cx + bw * 0.97, by - ry * 1.3 - 6], 0.6, 3.6, 0.6) : '') });
    // (homburg: brim curl drawn as ink lines only)
    s += mass([crown], { tint: D.hatT, light: [10, -6], inner: band, lines: crownLines });
    s += '</g>';
    return s;
  }
  function kippa(D, cx, cy, rx, ry, rot) {
    const d = `M${cx - rx} ${cy + ry * 0.3}C${cx - rx} ${cy - ry * 1.1} ${cx + rx} ${cy - ry * 1.1} ${cx + rx} ${cy + ry * 0.3}C${cx + rx * 0.5} ${cy + ry * 0.05} ${cx - rx * 0.5} ${cy + ry * 0.05} ${cx - rx} ${cy + ry * 0.3}Z`;
    return `<g transform="rotate(${rot || 0} ${cx} ${cy})">` + mass([P(d, D.hat)], { tint: D.hatT, light: [6, -4],
      lines: taper([cx - rx * 0.5, cy - ry * 0.5], [cx, cy - ry * 0.8], [cx + rx * 0.5, cy - ry * 0.5], 0.5, 2.6, 0.5, D.hatHi) }) + '</g>';
  }
  function glasses(D, view) {
    if (!D.glasses) return '';
    const st = 'fill="#ffffff" fill-opacity=".14" stroke="#2b2626" stroke-width="3.6"', ln = (d, w) => `<path d="${d}" fill="none" stroke="#2b2626" stroke-width="${w || 3.4}" stroke-linecap="round"/>`;
    if (view === 's') return `<ellipse cx="192" cy="131" rx="14" ry="25" ${st}/>` + ln('M178 126L140 132');
    if (view === 'f') return `<ellipse cx="123" cy="134" rx="25" ry="25" ${st}/><ellipse cx="177" cy="134" rx="25" ry="25" ${st}/>` + ln('M146 128Q150 123 154 128') + ln('M98 130L84 132') + ln('M202 130L216 132');
    return `<ellipse cx="150" cy="134" rx="25" ry="26" ${st}/><ellipse cx="202" cy="131" rx="19" ry="25" ${st}/>` + ln('M174 128Q178 123 183 128') + ln('M125 130L106 131');
  }
  function curls(list, col) {
    return list.map(([x, y, s, a]) => `<g transform="translate(${x} ${y}) rotate(${a || 0}) scale(${s || 1})">` +
      taper([-8, -4], [-2, -11], [6, -5], 0.5, 2.8, 0.6, col) + taper([6, -5], [9, 2], [2, 4], 0.6, 2.2, 0.4, col) + '</g>').join('');
  }
  // small mustache with lifted corners: centre x,y, half width hw, sd = 1 both sides, 'r' right only (profile)
  function mustache(D, x, y, hw, lift, only) {
    const half = sd => P(`M${x - sd} ${y - 2}C${x + sd * hw * 0.5} ${y - 6} ${x + sd * hw * 0.95} ${y - 2} ${x + sd * hw * 1.15} ${r(y + 2 - lift)}` +
      `C${x + sd * hw * 1.22} ${r(y + 8 - lift * 0.5)} ${x + sd * hw * 0.8} ${y + 13} ${x + sd * hw * 0.45} ${y + 12}C${x + sd * hw * 0.2} ${y + 11} ${x + sd * 2} ${y + 10} ${x - sd} ${y + 7}Z`, D.beard);
    return mass(only === 'r' ? [half(1)] : [half(-1), half(1)], { tint: D.beardT, light: [5, -4], w: 3.6,
      lines: taper([x - hw * 0.2, y + 3], [x - hw * 0.55, y + 4], [x - hw * 0.9, y + 6], 0.5, 1.8, 0.4, D.grey) + taper([x + hw * 0.2, y + 3], [x + hw * 0.55, y + 4], [x + hw * 0.9, y + 6], 0.5, 1.8, 0.4, D.grey) });
  }

  /* ---------------- 3/4 head (main design, facing right) ---------------- */
  K.pHead34 = function (st, D) {
    D = D || K.P_DEF; st = st || {};
    const f = face(st);
    let s = '';
    const hairPts = D.hatK === 'kippa'
      ? (D.crop ? K.circlePts(150, 96, 58, 24, 15, Math.PI * 0.92, [0.02, -0.01, 0.03, 0]) : K.circlePts(150, 84, 66, 44, 15, Math.PI * 0.92, [0.06, -0.02, 0.08, 0, 0.05, -0.03, 0.07]))
      : K.circlePts(106, 112, 18, 28, 9, 0, [0.05, -0.04, 0.06, 0]);
    s += mass([P(K.scallop(hairPts, 0.42), D.hair)], { tint: D.beardT, light: [6, -6], lines: curls([[100, 104, 0.8, -10], [106, 126, 0.7, 10]], D.beardLine) });
    // face + ear (one mass)
    const faceP = P('M100 78L214 78C224 104 224 138 218 160C210 188 192 206 166 210C138 212 116 196 106 170C98 148 96 110 100 78Z', D.skin);
    const ear = P('M108 124C92 114 80 130 84 148C88 166 102 172 112 162Z', D.skin);
    s += mass([ear, faceP], { tint: D.skinT, light: [9, -5],
      inner: `<ellipse cx="146" cy="168" rx="15" ry="9" fill="${D.blush}" opacity=".45"/><ellipse cx="212" cy="164" rx="7" ry="7" fill="${D.blush}" opacity=".35"/>`,
      lines: taper([102, 132], [92, 142], [100, 156], 1, 3, 1, '#c48a72') });
    // beard: 4 clumps, cheeks left free (top edge low on the cheek)
    const top = 190, bd = D.beardK !== 'none', mdy = D.mouthDy || 0;
    if (bd) {
    const BP = beardPts(D, [[108, 132], [116, 160], [134, 180], [160, 190], [186, 196], [212, 194], [228, 190], [236, 208], [232, 230], [222, 248], [212, 262], [196, 276], [178, 282], [160, 276], [146, 264], [128, 256], [112, 240], [102, 214], [100, 186], [102, 158]], 166, top);
    s += mass([P(K.scallop(BP, [0.36, 0.3, 0.34, 0.3, 0.3, 0.4, 0.3]), D.beard)], { tint: D.beardT, light: [9, -7],
      shade: `<path d="M96 ${r(top + 44 * D.bLen)}C126 ${r(top + 84 * D.bLen)} 196 ${r(top + 90 * D.bLen)} 240 ${r(top + 44 * D.bLen)}L240 400L90 400Z" opacity=".5"/>`,
      lines: beardLines(D, 166, top,
        [[[146, 214], [154, 240], [158, 268]], [[192, 216], [204, 238], [212, 258]], [[124, 200], [118, 222], [128, 248]]],
        [[[168, 226], [174, 246], [176, 266]], [[134, 214], [134, 230], [140, 246]], [[214, 214], [222, 226], [222, 238]]]) });
    }
    // lips patch + mouth (below the mustache, clearly visible)
    const mx = 196, my = 206 + mdy;
    if (bd) s += `<ellipse cx="${mx}" cy="${r(my + 3 + f.m.open * 4)}" rx="17" ry="${r(7 + f.m.open * 14)}" fill="${D.lip}"/>`;
    s += mouthAt(f, mx, my, bd ? 34 : 30, -4);
    if (bd) s += `<g transform="translate(0 ${r(-Math.min(4, f.m.open * 7))})">` + mustache(D, 198, 183, D.beardK === 'short' ? 18 : 22, 2 + 3 * Math.max(0, f.m.smile)) + '</g>';
    // nose: small soft button, same tone as the cheeks, inside the face silhouette
    // nose: small (about 1/4 face width), cheek value, ink only on the shadow side, sits right on the mustache
    s += `<path d="M197 151C204 152 211 157 211 165C211 172 204 176 197 175C190 175 187 170 188 165C189 160 192 156 197 151Z" fill="${D.noseC}"/>` +
      taper([200, 152], [214, 161], [205, 175], 0.6, 3.2, 1) + taper([196, 175], [190, 174], [188, 169], 1, 2.4, 0.5) + taper([197, 168], [194, 165], [197, 162], 0.5, 2.2, 0.5, D.nostril) +
      `<circle cx="203" cy="158" r="1.8" fill="#fff" opacity=".55"/>`;
    // eyes + brows (near = left, bigger)
    s += eyes2(f, { x: 150, y: 133, rx: 20, ry: 25, side: -1 }, { x: 201, y: 130, rx: 16.5, ry: 23.5, side: 1 }, D) + glasses(D, '34');
    // pe'ah at the ear
    s += peah(98, 138, 70 * (D.pey || Math.min(1.2, D.bLen)), D, -1, 9, 0.4);
    if (D.hatK === 'kippa') s += D.crop ? kippa(D, 146, 70, 50, 24, -8) : kippa(D, 150, 52, 44, 22, -6);
    else s += hat(D, 156, 80, 100, 16, -4, 'f');
    return s;
  };

  /* ---------------- front head ---------------- */
  K.pHeadFront = function (st, D) {
    D = D || K.P_DEF; st = st || {};
    const f = face(st);
    let s = '<g transform="rotate(-2 150 160)">';
    if (D.hatK === 'kippa') s += mass([P(K.scallop((D.crop ? K.circlePts(150, 96, 60, 24, 15, Math.PI * 0.95, [0.02, -0.01, 0.03, 0]) : K.circlePts(150, 86, 70, 46, 15, Math.PI * 0.95, [0.06, -0.02, 0.08, 0])), 0.42), D.hair)], { tint: D.beardT, light: [6, -6], lines: curls([[110, 70, 1, 10], [150, 52, 1, -6], [190, 70, 1, 8]], D.beardLine) });
    const faceP = P('M96 78L204 78C214 120 212 162 198 190C182 210 118 210 102 190C88 162 86 120 96 78Z', D.skin);
    const e1 = P('M100 124C84 114 74 132 78 150C82 166 94 170 104 162Z', D.skin), e2 = P('M200 124C216 114 226 132 222 150C218 166 206 170 196 162Z', D.skin);
    s += mass([e1, e2, faceP], { tint: D.skinT, light: [9, -5],
      inner: `<ellipse cx="114" cy="168" rx="14" ry="9" fill="${D.blush}" opacity=".45"/><ellipse cx="186" cy="168" rx="14" ry="9" fill="${D.blush}" opacity=".45"/>`,
      lines: taper([96, 132], [86, 142], [92, 156], 1, 3, 1, '#c48a72') + taper([204, 132], [214, 142], [208, 156], 1, 3, 1, '#c48a72') });
    const top = 190, bd = D.beardK !== 'none', mdy = D.mouthDy || 0;
    if (bd)
    s += mass([P(K.scallop(beardPts(D, [[100, 130], [106, 162], [122, 182], [150, 190], [178, 182], [194, 162], [200, 130], [210, 158], [214, 192], [208, 226], [196, 254], [172, 276], [150, 282], [128, 276], [104, 254], [92, 226], [86, 192], [90, 158]], 150, top), [0.36, 0.3, 0.4, 0.3]), D.beard)], { tint: D.beardT, light: [9, -7],
      shade: `<path d="M84 ${r(top + 48 * D.bLen)}C120 ${r(top + 92 * D.bLen)} 180 ${r(top + 92 * D.bLen)} 216 ${r(top + 48 * D.bLen)}L220 400L80 400Z" opacity=".5"/>`,
      lines: beardLines(D, 150, top, [[[128, 214], [124, 240], [132, 264]], [[172, 214], [176, 240], [168, 264]], [[150, 236], [150, 256], [150, 276]]],
        [[[110, 206], [106, 222], [110, 238]], [[190, 206], [194, 222], [190, 238]], [[140, 244], [140, 258], [142, 270]]]) });
    if (bd) s += `<ellipse cx="150" cy="${r(207 + f.m.open * 4)}" rx="17" ry="${r(7 + f.m.open * 14)}" fill="${D.lip}"/>`;
    s += mouthAt(f, 150, 204 + mdy, bd ? 34 : 30, 0);
    if (bd) s += `<g transform="translate(0 ${r(-Math.min(4, f.m.open * 7))})">` + mustache(D, 150, 181, D.beardK === 'short' ? 17 : 21, 2 + 3 * Math.max(0, f.m.smile)) + '</g>';
    s += `<path d="M150 151C158 151 163 159 162 166C161 173 155 176 150 176C145 176 139 173 138 166C137 159 142 151 150 151Z" fill="${D.noseC}"/>` +
      taper([141, 171], [150, 179], [160, 171], 0.6, 3.2, 0.6) + taper([160, 171], [164, 166], [161, 160], 0.6, 2.2, 0.4) +
      `<ellipse cx="145" cy="171" rx="2.2" ry="1.4" fill="${D.nostril}"/><ellipse cx="155" cy="171" rx="2.2" ry="1.4" fill="${D.nostril}"/><circle cx="153" cy="159" r="1.6" fill="#fff" opacity=".5"/>`;
    s += eyes2(f, { x: 123, y: 133, rx: 20, ry: 25, side: -1 }, { x: 177, y: 133, rx: 20, ry: 25, side: 1 }, D) + glasses(D, 'f');
    s += peah(86, 136, 70 * (D.pey || Math.min(1.2, D.bLen)), D, -1, 9, 0.2) + peah(214, 136, 64 * (D.pey || Math.min(1.2, D.bLen)), D, 1, 8.5, 1.7);
    if (D.hatK === 'kippa') s += D.crop ? kippa(D, 150, 70, 52, 22, 0) : kippa(D, 150, 52, 44, 20, 0);
    else s += hat(D, 150, 80, 104, 12, 1, 'f');
    return s + '</g>';
  };

  /* ---------------- profile head (facing right) ---------------- */
  K.pHeadSide = function (st, D) {
    D = D || K.P_DEF; st = st || {};
    const f = face(st);
    let s = '';
    if (D.hatK === 'kippa') s += mass([P(K.scallop((D.crop ? K.circlePts(140, 96, 56, 24, 14, Math.PI * 0.92, [0.02, -0.01, 0.03, 0]) : K.circlePts(140, 84, 66, 44, 14, Math.PI * 0.92, [0.06, -0.02, 0.08, 0])), 0.42), D.hair)], { tint: D.beardT, light: [6, -6], lines: curls([[100, 80, 1, 10], [140, 54, 1, -6], [176, 64, 1, 8]], D.beardLine) });
    s += mass([P(K.scallop(K.circlePts(112, 120, 26, 40, 10, 0, [0.05, -0.04, 0.06, 0]), 0.42), D.hair)], { tint: D.beardT, light: [6, -6], lines: curls([[102, 110, 0.9, -10], [108, 138, 0.8, 10]], D.beardLine) });
    // profile: forehead, soft brow, small nose bump, cheek
    const head = P('M104 78L194 78C202 96 206 112 205 128C206 138 207 144 208 149C211 153 212 158 210 162C208 166 206 167 203 168C206 180 206 194 194 204C176 214 140 212 120 196C104 176 100 120 104 78Z', D.skin);
    const ear = P('M138 126C124 118 112 130 114 146C116 162 128 168 140 160Z', D.skin);
    s += mass([head], { tint: D.skinT, light: [9, -5], inner: `<ellipse cx="180" cy="168" rx="13" ry="8" fill="${D.blush}" opacity=".45"/>`,
      lines: taper([207, 163], [204, 161], [203, 165], 0.5, 2, 0.5, D.nostril) });
    s += mass([ear], { tint: D.skinT, light: [6, -4], lines: taper([134, 132], [122, 142], [130, 154], 1, 3, 1, '#c48a72') });
    // beard trimmed at the cheek line (cheek, eye and ear stay visible)
    const top = 190, bd = D.beardK !== 'none', mdy = D.mouthDy || 0;
    if (bd) {
    const BP = beardPts(D, [[140, 168], [156, 182], [178, 190], [200, 194], [216, 190], [226, 202], [226, 226], [216, 250], [194, 270], [168, 274], [146, 262], [130, 240], [124, 212], [128, 186]], 176, top);
    s += mass([P(K.scallop(BP, [0.36, 0.3, 0.4, 0.3]), D.beard)], { tint: D.beardT, light: [9, -7],
      lines: beardLines(D, 176, top, [[[160, 206], [164, 232], [172, 258]], [[196, 212], [204, 234], [204, 256]]], [[[180, 222], [184, 240], [186, 258]], [[142, 214], [142, 232], [148, 248]]]) });
    s += `<ellipse cx="210" cy="${r(207 + f.m.open * 4)}" rx="9" ry="${r(7 + f.m.open * 12)}" fill="${D.lip}"/>`;
    }
    s += mouthAt(f, bd ? 211 : 206, 204 + mdy, 20, -4);
    if (bd) s += `<g transform="translate(0 ${r(-Math.min(4, f.m.open * 7))})">` + mustache(D, 204, 181, 16, 2 + 3 * Math.max(0, f.m.smile), 'r') + '</g>';
    // profile eye: big, open, set forward
    const e = { x: 190, y: 130, rx: 12, ry: 23, side: 1 };
    Object.assign(e, { top: f.E.top, tilt: f.E.tilt * 0.6, bot: f.E.bot, pr: Math.min(0.78, (f.E.pr || 0.5) * 1.25), look: [0.55, (f.E.look || [0, 0])[1]], blink: f.blink, happyClose: f.happy, lid: D.skin, lw: 3.4 });
    s += eye(e) + brow(e, Object.assign({ w: D.browW, len: 1.4 }, f.E.b2), D.brow) + glasses(D, 's');
    if ((f.E.crinkle || 0) > 0.2) s += taper([176, 140], [170, 144], [164, 142], 0.5, 2.4, 0.4, '#c48a72');
    s += peah(132, 146, 62 * (D.pey || Math.min(1.2, D.bLen)), D, -1, 8.5, 0.9);
    if (D.hatK === 'kippa') s += D.crop ? kippa(D, 136, 70, 50, 20, -6) : kippa(D, 140, 52, 46, 18, -4);
    else s += hat(D, 154, 80, 110, 8, -5, 's');
    return s;
  };

  /* ---------------- back of head ---------------- */
  K.pHeadBack = function (st, D) {
    D = D || K.P_DEF;
    let s = '';
    for (const sd of D.beardK === 'none' ? [] : [-1, 1]) {
      const pts = [[150 + sd * 50, 160], [150 + sd * 64, 180], [150 + sd * 64, 208], [150 + sd * 52, 226], [150 + sd * 40, 214], [150 + sd * 40, 186]].map(p => [150 + (p[0] - 150) * D.bW, p[1] > 196 ? 196 + (p[1] - 196) * D.bLen : p[1]]);
      if (sd < 0) pts.reverse();
      s += mass([P(K.scallop(pts, 0.35), D.beard)], { tint: D.beardT, light: [8, -6] });
    }
    const e1 = P('M100 124C84 114 74 132 78 150C82 166 94 170 104 162Z', D.skin), e2 = P('M200 124C216 114 226 132 222 150C218 166 206 170 196 162Z', D.skin);
    const neck = P('M124 180L176 180L174 214L126 214Z', D.skin);
    s += mass([e1, e2, neck], { tint: D.skinT, light: [10, -6], lines: taper([96, 132], [86, 142], [92, 156], 1, 3, 1, '#c48a72') + taper([204, 132], [214, 142], [208, 156], 1, 3, 1, '#c48a72') });
    s += mass([P(K.scallop([[96, 78], [204, 78], [210, 120], [204, 158], [188, 182], [166, 196], [150, 198], [134, 196], [112, 182], [96, 158], [90, 120]], 0.36), D.hair)], { tint: D.beardT, light: [8, -6],
      lines: curls([[122, 112, 1, 0], [152, 132, 1.1, 10], [180, 112, 1, -10], [134, 162, 0.9, 6], [168, 162, 0.9, -8], [150, 184, 0.8, 0]], D.beardHi) });
    s += mass([P('M114 202C130 194 170 194 186 202L188 222L112 222Z', D.shirt)], { tint: D.shirtT, light: [4, -3], w: 3.8 });
    s += peah(88, 136, 66 * (D.pey || Math.min(1.2, D.bLen)), D, -1, 9, 0.3) + peah(212, 136, 60 * (D.pey || Math.min(1.2, D.bLen)), D, 1, 8.5, 1.9);
    if (D.hatK === 'kippa') s += D.crop ? kippa(D, 150, 72, 52, 24, 0) : kippa(D, 150, 60, 46, 22, 0);
    else s += hat(D, 150, 80, 104, 12, -1, 'b');
    return s;
  };

  for (const fn of ['pHead34', 'pHeadFront', 'pHeadSide', 'pHeadBack']) {
    const orig = K[fn];
    K[fn] = (st, D) => { D = D || K.P_DEF; const sx = D.hsx || 1, sy = D.hsy || 1, inner = orig(st, D);
      return sx === 1 && sy === 1 ? inner : `<g transform="translate(150 212) scale(${sx} ${sy}) translate(-150 -212)">${inner}</g>`; };
  }

  /* ---------------- hands (wrist at x,y; fingers along -y before rotation) ---------------- */
  K.pHand = function (type, x, y, ang, sc, flip, D) {
    D = D || K.P_DEF; sc = sc || 1;
    const SK = D.skin, parts = [], lines = [];
    const fing = (bx, by, tx, ty, w) => parts.push(P(K.limbD([bx, by], [(bx + tx) / 2, (by + ty) / 2], [tx, ty], w, w * 0.9), SK));
    const palm = P('M-15 -2C-17 -14 -17 -26 -14 -34C-6 -38 8 -38 15 -34C18 -24 18 -12 15 -2C6 4 -8 4 -15 -2Z', SK);
    parts.push(palm);
    const curled = () => { for (const [cx] of [[-9], [0], [9]]) parts.push(P(`M${cx - 6} -32a6 7 0 1 0 12 0a6 7 0 1 0 -12 0Z`, SK));
      lines.push(taper([-4.5, -40], [-4.5, -34], [-4, -28], 0.5, 2.4, 0.5) + taper([4.5, -40], [4.5, -34], [4, -28], 0.5, 2.4, 0.5) + taper([-14, -26], [-2, -22], [10, -26], 0.5, 2.2, 0.5, '#b97a62')); };
    if (type === 'open') { fing(-10, -30, -21, -56, 11.5); fing(0, -32, -1, -64, 12); fing(10, -30, 20, -56, 11.5); fing(-14, -12, -35, -24, 12);
      lines.push(taper([-8, -18], [0, -12], [8, -16], 0.5, 2.2, 0.5, '#b97a62')); }
    else if (type === 'point') { curled(); parts.splice(1, 1); fing(-9, -32, -9, -66, 11); fing(-14, -12, -10, -26, 11); }
    else if (type === 'fist') { curled(); fing(-15, -10, -6, -24, 11); }
    else if (type === 'thumb') { curled(); fing(12, -18, 42, -20, 12.5); ang = (ang || 0) - 90; }
    else if (type === 'side') { parts.length = 0;
      parts.push(P('M-10 0C-13 -12 -13 -28 -9 -40C-6 -48 4 -50 9 -43C13 -36 13 -20 11 0C5 4 -5 4 -10 0Z', SK));
      fing(8, -12, 13, -27, 9);
      lines.push(taper([-9, -34], [-4, -31], [1, -33], 0.5, 2, 0.5) + taper([-9, -26], [-4, -23], [1, -25], 0.5, 2, 0.5) + taper([3, -10], [7, -18], [7, -24], 0.5, 1.8, 0.5, '#b97a62')); }
    else if (type === 'hang') { parts.length = 0;   // back of the hand, fingers down, relaxed curl
      parts.push(P('M-14 0C-16 -10 -16 -22 -13 -30L13 -30C16 -22 16 -10 14 0C6 4 -6 4 -14 0Z', SK));
      const F = [[-10.5, 20, 2.5], [-3.5, 24, 1.5], [3.5, 23, 0.5], [10, 17, -1]];
      for (const [fx, len, bd] of F) parts.push(P(K.limbD([fx, -26], [fx + bd * 0.3, -26 - len * 0.6], [fx + bd, -26 - len], 7.6, 6.6), SK));
      fing(-13, -8, -19, -24, 9.5);
      for (let i = 0; i < 3; i++) { const xm = (F[i][0] + F[i + 1][0]) / 2, ln = Math.min(F[i][1], F[i + 1][1]); lines.push(taper([xm, -30], [xm + 0.6, -30 - ln * 0.5], [xm + 1, -24 - ln], 0.5, 2.4, 0.4)); }
      lines.push(taper([-11, -28], [0, -32], [12, -28], 0.5, 1.8, 0.5, '#c48a72')); }
    else if (type === 'relax') { fing(-10, -30, -9, -52, 11); fing(-1, -32, 1, -56, 11.5); fing(8, -31, 11, -53, 11); fing(15, -26, 17, -44, 10); fing(-14, -12, -26, -26, 11.5);
      lines.push(taper([-5, -38], [-4, -44], [-3, -48], 0.5, 2, 0.5) + taper([4, -38], [5, -44], [6, -48], 0.5, 2, 0.5) + taper([12, -34], [13, -38], [14, -42], 0.5, 1.8, 0.5)); }
    const t = `translate(${r(x)} ${r(y)}) rotate(${r(ang || 0)}) scale(${(flip ? -1 : 1) * sc} ${sc})`;
    return `<g transform="${t}">` + mass(parts, { tint: D.skinT, light: [6, -5], w: 3.8, lines: lines.join('') }) + '</g>';
  };
  function cuff(a, b, D, w) {
    w = w || 20;
    return mass([P(K.limbD(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b, w, w - 1), D.shirt)], { tint: D.shirtT, light: [4, -3], w: 3.8 });
  }
  // tzitzit: knot block at the top, 4 thin strands of different lengths, sway
  function tzitzit(x, y, D, n, sw) {
    n = n || 4; sw = sw || 0;
    let s = '', s2 = '';
    for (let i = 0; i < n; i++) {
      const xx = x + i * 2.8, len = 30 + 9 * Math.sin(i * 2.1 + 0.6), sw2 = sw * (0.6 + i * 0.15);
      const d = `M${r(xx)} ${y}Q${r(xx + sw2 * 0.5 - 1)} ${r(y + len * 0.5)} ${r(xx + sw2)} ${r(y + len)}`;
      s += `<path d="${d}" fill="none" stroke="${OL}" stroke-width="4.4" stroke-linecap="round"/>`;
      s2 += `<path d="${d}" fill="none" stroke="#fbfaf4" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    const kx = x + (n - 1) * 1.4;
    let k = '';
    for (let j = 0; j < 3; j++) k += `<ellipse cx="${r(kx + sw * 0.05 * j)}" cy="${r(y + 2 + j * 6)}" rx="5" ry="3.4" fill="#fbfaf4" stroke="${OL}" stroke-width="2.2"/>`;
    return s + s2 + k;
  }
  K.pTzitzit = tzitzit;
  const HS = 0.47; // head scale on the body
  const headAt = (fn, st, D, x, y, sock, rot) => `<g transform="translate(${r(x * (D.bx || 1))} ${r(y * (D.by || 1))}) rotate(${r(rot || 0)}) scale(${r(HS * (D.hk || 1) * 1000) / 1000}) translate(${-sock[0]} ${-sock[1]})">${fn(st, D)}</g>`;
  const SC = D => `<g transform="scale(${D.bx || 1} ${D.by || 1})">`;
  // hem remap: everything below the waist (-118) is squeezed / stretched so the man's hem (-58) lands on D.hem
  const HY = (D, y) => y <= -118 ? y : -118 + (y + 118) * ((D.hem == null ? -58 : D.hem) + 118) / 60;
  // smooth closed path through points (quadratic midpoint chain)
  const smoothD = pts => { const m = pts.map((p, i) => { const q = pts[(i + 1) % pts.length]; return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; });
    let d = `M${r(m[m.length - 1][0])} ${r(m[m.length - 1][1])}`; for (let i = 0; i < pts.length; i++) d += `Q${r(pts[i][0])} ${r(pts[i][1])} ${r(m[i][0])} ${r(m[i][1])}`; return d + 'Z'; };

  /* ---------------- front / 3/4 / back standing body: ONE merged outline (coat + sleeves + trousers) ---------------- */
  K.pFront = function (po, D) {
    D = D || K.P_DEF; po = po || {};
    const view = po.view || 'front', back = view === 'back', k34 = view === '34' ? 1 : 0;
    const bw = D.bodyW, be = D.belly;
    const sr = (1 - 0.3 * k34) * bw, sl = (1 + 0.08 * k34) * bw, cx = 12 * k34;
    const X = (x, y, bel) => [cx + x * (x > 0 ? sr : sl) * (bel ? be : 1), y];
    let s = SC(D);
    const hy = y => HY(D, y);
    // shoes (own small masses, under the trouser legs)
    const legX = sd => cx + (sd < 0 ? -15 : 19) * bw * (sd > 0 ? 1 - 0.2 * k34 : 1);
    for (const sd of [-1, 1]) {
      const lx = legX(sd) + k34 * 6 + sd * 1;
      const shoe = back ? `M${lx - 19} 0C${lx - 22} -20 ${lx + 20} -22 ${lx + 19} 0Z` : `M${lx - 19} 0C${lx - 22} -17 ${lx - 6} -22 ${lx + 4} -20C${lx + 18} -18 ${lx + 26 + k34 * 12} -10 ${lx + 24 + k34 * 12} 0Z`;
      s += mass([P(shoe, D.shoe)], { tint: D.hatT, light: [5, -4], lines: back ? '' : `<ellipse cx="${r(lx + 8 + k34 * 6)}" cy="-12" rx="7" ry="3.2" fill="${D.shoeHi}" opacity=".8"/>` });
    }
    const parts = [];
    // trouser legs (weight on the left leg: straight; right leg slightly out)
    for (const sd of [-1, 1]) { const lx = legX(sd);
      parts.push(P(K.limbD([lx - sd * 2, -96], [lx, -50], [lx + sd * 2, -12], 24, 21), D.pants)); }
    // arms: shoulder joint inside the coat silhouette -> round deltoid, no corner
    const armG = (sd, A) => {
      const s0 = sd > 0 ? sr : sl, sh = [cx + sd * 38 * s0, -200];
      const el = [cx + sd * (50 * s0 * be + (A.elx || 0)), -152 + (A.ely || 0)], wr = A.wr || [cx + sd * (47 * s0 * be + (A.wrx || 0)), -108 + (A.wry || 0)];
      return { sd, sh, el, wr, A };
    };
    const sleeve = g => [P(K.limbD(g.sh, [(g.sh[0] + g.el[0]) / 2 + g.sd * 3, (g.sh[1] + g.el[1]) / 2], g.el, 30, 23), D.coat),
      P(K.limbD(g.el, [(g.el[0] + g.wr[0]) / 2, (g.el[1] + g.wr[1]) / 2], g.wr, 23, 22), D.coat),
      P(`M${r(g.el[0] - 11.5)} ${r(g.el[1])}a11.5 11.5 0 1 0 23 0a11.5 11.5 0 1 0 -23 0Z`, D.coat)];
    const AL = Object.assign({ wrx: -9, wry: -2, elx: -2 }, po.armL || {}), AR = Object.assign({ wrx: -5, elx: -1 }, po.armR || {});
    const gL = armG(-1, AL), gR = armG(1, AR);
    // coat: upright, rounded shoulders, modest belly, flared asymmetric hem
    const pts = [X(0, -226), X(16, -225), X(31, -220), X(43, -210), X(49, -194), X(51, -170), X(50, -144, 1), X(51, -118, 1), X(52, hy(-96), 1), X(55, hy(-78)), X(59, hy(-58)), X(30, hy(-53)), X(4, hy(-55)),
      X(-26, hy(-54)), X(-61, hy(-62)), X(-57, hy(-80)), X(-53, hy(-96), 1), X(-51, -118, 1), X(-50, -144, 1), X(-51, -170), X(-49, -194), X(-43, -210), X(-31, -220), X(-16, -225)];
    if (k34) parts.push(...sleeve(gR));
    parts.push(P(smoothD(pts), D.coat));
    parts.push(...sleeve(gL));
    if (!k34) parts.push(...sleeve(gR));
    const fx = cx + 4 + 16 * k34;
    let inner = '', lines = '';
    // hem line over the trousers (overlapping fold) + soft shadow on the legs under the hem
    const hemL = X(-60, hy(-61)), hemR = X(58, hy(-58));
    lines += taper(hemL, [cx, hy(-48)], hemR, 1, 4.2, 1);
    const shade = `<path d="M${cx - 70} ${r(hy(-60))}Q${cx} ${r(hy(-46))} ${cx + 70} ${r(hy(-58))}L${cx + 70} ${r(hy(-40))}Q${cx} ${r(hy(-30))} ${cx - 70} ${r(hy(-42))}Z" opacity=".55"/>`;
    // inner contour of each front sleeve (arm against the torso) - no line on the shoulder top
    const armLine = g => taper([g.sh[0] - g.sd * 13, g.sh[1] + 24], [g.el[0] - g.sd * 12.5, g.el[1] + 2], [g.wr[0] - g.sd * 10.5, g.wr[1] - 2], 0.6, 3.8, 1);
    lines += armLine(gL) + (k34 ? '' : armLine(gR));
    for (const g of k34 ? [gL] : [gL, gR]) lines += taper([g.el[0] + g.sd * 2, g.el[1] - 7], [g.el[0] + g.sd * 9, g.el[1] - 2], [g.el[0] + g.sd * 7, g.el[1] + 4], 0.5, 2.6, 0.5) +
      taper([g.sh[0] + g.sd * 4, g.sh[1] - 4], [g.sh[0] + g.sd * 12, g.sh[1] + 2], [g.el[0] + g.sd * 10, g.el[1] - 16], 0.5, 3, 0.5, D.coatHi);
    for (const sd of [-1, 1]) { const lx = legX(sd); lines += taper([lx - 9, hy(-47)], [lx, hy(-43)], [lx + 9, hy(-47)], 0.5, 2.6, 0.5) + taper([lx - 3, -36], [lx + 1, -30], [lx - 1, -22], 0.5, 2, 0.5, D.coatHi); }
    if (!back && D.lapels === false) {
      // plain white shirt: button placket, small collar V
      lines += taper([fx, -224], [fx + 1, -170], [fx, hy(-56)], 0.5, 2.6, 0.5, D.coatHi);
      for (let yy = -204; yy < hy(-60); yy += 26) lines += `<circle cx="${r(fx + 4)}" cy="${yy}" r="3.2" fill="#fff" stroke="${D.btn}" stroke-width="1.5"/>`;
      lines += taper([cx + 30 * sr, -214], [cx + 46 * sr, -204], [cx + 50 * sr, -186], 0.5, 3, 0.5, D.coatHi);
    } else if (!back) {
      // coat open at the chest: white shirt V (about 1/4 of the torso width), lapels, front edge slightly open below
      inner += `<path d="M${cx - 23} -228L${cx + 25} -228L${fx + 2} -124Z" fill="${D.shirt}"/>`;
      inner += `<path d="M${cx - 6} -228L${cx + 8} -228L${fx + 2} -150Z" fill="${D.shirtT}" opacity=".35"/>`;
      lines += taper([cx - 25, -226], [cx - 12, -180], [fx + 1, -122], 1, 4, 1) + taper([cx + 27, -226], [cx + 16, -180], [fx + 3, -122], 1, 4, 1) +
        taper([fx + 2, -130], [fx + 1, hy(-96)], [fx - 3 + k34 * 4, hy(-54)], 0.8, 3.6, 1.2) +
        taper([cx - 16, -222], [cx - 28, -200], [cx - 24, -176], 0.5, 2.6, 0.5, D.coatHi) + taper([cx + 18, -222], [cx + 30, -200], [cx + 27, -176], 0.5, 2.6, 0.5, D.coatHi);
      for (const yy of [-116, -96].filter(v => v < hy(-62))) lines += `<circle cx="${r(fx + 9)}" cy="${yy}" r="4.4" fill="#16151b" stroke="${D.coatHi}" stroke-width="1.6"/>`;
      // light on the near shoulder / chest
      lines += taper([cx + 30 * sr, -214], [cx + 46 * sr, -204], [cx + 50 * sr, -186], 0.5, 3, 0.5, D.coatHi) + taper([cx - 30 * sl, -214], [cx - 44 * sl, -206], [cx - 48 * sl, -190], 0.5, 2.4, 0.5, D.coatHi);
    } else {
      inner += `<path d="M${cx - 22} -228L${cx + 22} -228L${cx + 20} -216L${cx - 20} -216Z" fill="${D.shirt}"/>`;
      lines += taper([cx, -214], [cx + 1, -150], [cx, -104], 0.5, 2.8, 0.5, D.coatHi) + taper([cx, -104], [cx, -80], [cx, -50], 1, 3.4, 1) +
        taper([cx - 40, -126], [cx, -122], [cx + 40, -126], 0.5, 3, 0.5, D.coatHi) + `<circle cx="${cx - 26}" cy="-124" r="4" fill="#16151b" stroke="${D.coatHi}" stroke-width="1.5"/><circle cx="${cx + 26}" cy="-124" r="4" fill="#16151b" stroke="${D.coatHi}" stroke-width="1.5"/>`;
    }
    s += mass(parts, { tint: D.coatT, light: [12, -8], inner, lines, shade });
    // tzitzit hanging out from under the coat at both sides
    const tzy = D.tzY || hy(-84);
    s += tzitzit(cx - 52 * sl, tzy, D, 4, -2) + tzitzit(cx + 42 * sr, tzy + 2, D, 4, 2);
    // cuffs + hands (hands about 3/4 of the face height)
    const hand = g => {
      const dir = [g.wr[0] - g.el[0], g.wr[1] - g.el[1]], dl = Math.hypot(...dir), ux = dir[0] / dl, uy = dir[1] / dl;
      const cE = [g.wr[0] + ux * 10, g.wr[1] + uy * 10], ang = Math.atan2(uy, ux) * 180 / Math.PI + 90;
      return K.pHand(g.A.hand || 'hang', cE[0] - ux * 3, cE[1] - uy * 3, ang + (g.A.ha || 0), g.A.hand ? 0.86 : 0.92, g.sd > 0 ? !!g.A.hand : !g.A.hand, D) + cuff([g.wr[0] - ux * 2, g.wr[1] - uy * 2], cE, D, 22);
    };
    s += hand(gR) + hand(gL);
    // neck + white collar, then the head (slight friendly tilt)
    s += mass([P(`M${cx - 13} -238L${cx + 13} -238L${cx + 12} -220L${cx - 12} -220Z`, D.skin)], { tint: D.skinT, light: [4, -3] });
    if (!back) s += mass([P(`M${cx - 33} -224Q${cx} -238 ${cx + 33} -224L${cx + 30} -213L${cx + 1} -204L${cx - 30} -213Z`, D.shirt)], { tint: D.shirtT, light: [3, -3], w: 3.6,
      lines: taper([cx - 19, -214], [cx - 8, -212], [cx + 1, -206], 0.5, 2, 0.5, D.shirtT) });
    s += '</g>';
    const hf = back ? K.pHeadBack : view === '34' ? K.pHead34 : K.pHeadFront;
    const sock = view === '34' ? [166, 210] : [150, 210];
    s += headAt(hf, po.face || {}, D, cx + (view === '34' ? 6 : 0), -216 + (po.headDy || 0), sock, po.headRot == null ? (back ? 0 : 3) : po.headRot);
    return s;
  };

  /* ---------------- side profile body + walk ---------------- */
  const LEG = { hipY: 118, L1: 56, L2: 56, sole: 12, stride: 66, duty: 0.6, lift: 24 };
  K.pCycle = D => LEG.stride / LEG.duty * ((D && D.bx) || 1);
  function shoeAng(f) { // + = heel up / toe down
    if (f.q < 0) return f.st > 0.72 ? 38 * sm01((f.st - 0.72) / 0.28) : 0;
    const q = f.q;
    if (q < 0.4) return 38 + 8 * Math.sin(Math.PI * q / 0.4);
    if (q < 0.85) return 38 - 56 * sm01((q - 0.4) / 0.45);
    return -18 * (1 - sm01((q - 0.85) / 0.15));
  }
  // bigger shoe with a rounded toe cap
  const SHOE = 'M-15 -6C-8 -16 12 -16 24 -11C38 -7 47 1 46 9L45 12L-16 12C-19 6 -18 -1 -15 -6Z';
  function legsAt(po, ph, walk, bob) {
    const out = [];
    for (const [o, far] of [[0.5, 1], [0, 0]]) {
      const hip = [far ? -4 : 4, -LEG.hipY + bob];
      const f0 = K.footPath(ph + o, LEG.stride, LEG.duty, LEG.lift);
      const g = { x: f0.x * walk + (far ? -7 : 7) * (1 - walk), y: f0.y * walk, st: walk > 0.05 ? f0.st : 0, q: walk > 0.05 ? f0.q : -1 };
      if (po.step && walk <= 0.05) { const s2 = K.footPath(po.step + o, 0, 0.6, 10); g.y = s2.y; g.q = s2.q; g.st = s2.st; }
      const ang = shoeAng(g);
      let ank;
      if (g.q < 0 && ang > 0.01) { const ball = [g.x + 26, g.y]; const v = rv([26, LEG.sole], ang); ank = [ball[0] - v[0], ball[1] - v[1]]; }
      else ank = [g.x, g.y - LEG.sole];
      const kn = K.ik(hip, ank, LEG.L1, LEG.L2, 1);
      out.push({ hip, kn, ank, ang, far });
    }
    return out;
  }
  K.pSide = function (po, D) {
    D = D || K.P_DEF; po = po || {};
    const walk = po.walk || 0, ph = po.ph || 0, bw = D.bodyW, be = D.belly;
    // + = down; body is highest at the passing pose (bounce)
    const bob = 4 * (D.bounce || 1) * walk * Math.cos(4 * Math.PI * (ph - 0.04)) + (po.bob || 0);
    const lean = (po.lean || 0) + 2.5 * walk;
    const up = `translate(0 ${r(bob)}) rotate(${r(lean)} 0 -104)`;
    const legs = legsAt(po, ph, walk, bob);
    let s = SC(D);
    const hy = y => HY(D, y);
    const sw = po.armSwing == null ? 1 : po.armSwing;
    const armA = o => -(30 * (D.swing || 1) * walk * sw) * Math.cos(2 * Math.PI * (ph + o - 0.08));
    const shTw = o => 3 * walk * Math.cos(2 * Math.PI * (ph + o - 0.08)); // shoulder rotation
    const arm = (far, a, bend, hand, ha, o) => {
      const sh = [(far ? -3 : 3) + shTw(o), -202];
      const el = [sh[0] + 46 * Math.sin(a * Math.PI / 180), sh[1] + 46 * Math.cos(a * Math.PI / 180)];
      const a2 = a + bend, wr = [el[0] + 40 * Math.sin(a2 * Math.PI / 180), el[1] + 40 * Math.cos(a2 * Math.PI / 180)];
      const col = far ? D.coatFar : D.coat;
      const ux = Math.sin(a2 * Math.PI / 180), uy = Math.cos(a2 * Math.PI / 180), cE = [wr[0] + ux * 10, wr[1] + uy * 10];
      return `<g transform="${up}">` + mass([P(`M${r(sh[0] - 15)} ${r(sh[1] + 2)}a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z`, col), P(K.limbD(sh, [(sh[0] + el[0]) / 2, (sh[1] + el[1]) / 2], el, 28, 23), col),
        P(K.limbD(el, [(el[0] + wr[0]) / 2, (el[1] + wr[1]) / 2], wr, 23, 22), col), P(`M${r(el[0] - 11.5)} ${r(el[1])}a11.5 11.5 0 1 0 23 0a11.5 11.5 0 1 0 -23 0Z`, col)],
        { tint: D.coatT, light: [8, -6], lines: far ? '' : taper([sh[0] + 9, sh[1] + 12], [el[0] + 9, el[1] - 6], [wr[0] + 8, wr[1] - 4], 0.5, 2.6, 0.5, D.coatHi) }) +
        K.pHand(hand || 'hang', cE[0] - ux * 3, cE[1] - uy * 3, 180 - a2 + (ha || 0), hand ? 0.84 : 0.86, !hand, D) + cuff([wr[0] - ux * 2, wr[1] - uy * 2], cE, D, 22) + '</g>';
    };
    const PA = po.arms || {};
    const bendA = o => 20 + 16 * walk * Math.max(0, Math.sin(2 * Math.PI * (ph + o - 0.33)));
    s += arm(true, PA.farA != null ? PA.farA : armA(0) - 2, PA.farB != null ? PA.farB : bendA(0), PA.farHand, PA.farHa, 0);
    for (const L of legs) {
      const fill = L.far ? D.pantsFar : D.pants;
      const parts = [P(K.limbD(L.hip, [(L.hip[0] + L.kn[0]) / 2 + 2, (L.hip[1] + L.kn[1]) / 2], L.kn, 27, 23), fill), P(K.limbD(L.kn, [(L.kn[0] + L.ank[0]) / 2, (L.kn[1] + L.ank[1]) / 2], L.ank, 23, 21), fill),
        P(`M${r(L.kn[0] - 11.5)} ${r(L.kn[1])}a11.5 11.5 0 1 0 23 0a11.5 11.5 0 1 0 -23 0Z`, fill),
        P(SHOE, L.far ? '#18161b' : D.shoe, `translate(${r(L.ank[0])} ${r(L.ank[1])}) rotate(${r(L.ang)})`)];
      s += mass(parts, { tint: D.hatT, light: [6, -5], lines: `<g transform="translate(${r(L.ank[0])} ${r(L.ank[1])}) rotate(${r(L.ang)})">` +
        `<ellipse cx="30" cy="-4" rx="8" ry="3.4" fill="${D.shoeHi}" opacity="${L.far ? 0.35 : 0.8}" transform="rotate(14 30 -4)"/>` + taper([-2, -10], [10, -12], [20, -10], 0.5, 2.2, 0.5, D.shoeHi) + '</g>' });
    }
    // coat - hem follows the knees with a short delay (secondary motion)
    const lag = legsAt(po, ph - 0.07, walk, bob);
    const kx = lag.map(L => L.kn[0]), kmin = Math.min(...kx), kmax = Math.max(...kx);
    const longK = Math.max(0, Math.min(1, (hy(-58) + 100) / 42));   // 0 = short jacket, 1 = long coat (hem follows the knees)
    const hb = [Math.min(-40 * bw, (kmin - 28) * longK - 40 * bw * (1 - longK)) - 5 * walk * longK, hy(-60) + bob * 0.5], hf = [Math.max(46 * bw, (kmax + 30) * longK + 46 * bw * (1 - longK)) + 3 * walk * longK, hy(-62) + bob * 0.5 - 7 * walk * longK * Math.max(0, (kmax - 10) / 30)];
    const hm = [(hb[0] + hf[0]) / 2, hy(-52) + bob * 0.5];
    const B = x => x * bw, E = x => x * bw * be;
    // upright: back line almost vertical, chest open, modest belly
    const coatD = `M24 -226C${B(36)} -220 ${B(42)} -204 ${B(42)} -184C${B(42)} -164 ${E(45)} -142 ${E(46)} -124C${E(46)} ${r(hy(-110))} ${B(42)} ${r(hy(-100))} ${B(42)} ${r(hy(-92))}` +
      `C${B(42)} ${r(hy(-80))} ${r(hf[0] - 2)} ${r(hy(-66))} ${r(hf[0])} ${r(hf[1] - bob * 0.5)}Q${r(hm[0])} ${r(hm[1] - bob * 0.5)} ${r(hb[0])} ${r(hb[1] - bob * 0.5)}` +
      `C${B(-38)} ${r(hy(-76))} ${B(-33)} ${r(hy(-100))} ${B(-32)} -128C${B(-33)} -168 ${B(-30)} -206 -18 -224Q2 -230 24 -226Z`;
    const cl = taper([B(-32), -110], [B(4), -104], [B(44), -108], 0.5, 2.6, 0.5, D.coatHi) +
      taper([r(hf[0] - 8), r(hf[1] - 6 - bob * 0.5)], [B(42), hy(-78)], [B(44), hy(-100)], 0.5, 3, 0.5, D.coatHi) +
      taper([B(26), -216], [B(38), -196], [B(40), -170], 0.5, 2.6, 0.5, D.coatHi) + taper([B(28), -222], [B(34), -196], [B(42), -150], 0.8, 3.4, 0.8) +
      (D.lapels === false ? `<circle cx="${r(E(43))}" cy="-150" r="3.2" fill="#fff" stroke="${D.btn}" stroke-width="1.5"/><circle cx="${r(E(43))}" cy="-124" r="3.2" fill="#fff" stroke="${D.btn}" stroke-width="1.5"/>` :
      `<circle cx="${r(E(43))}" cy="-128" r="4.2" fill="#16151b" stroke="${D.coatHi}" stroke-width="1.5"/>` + (hy(-108) > -108 ? '' : '') + `<circle cx="${r(B(41))}" cy="${r(Math.min(-108, hy(-70)))}" r="4.2" fill="#16151b" stroke="${D.coatHi}" stroke-width="1.5"/>`);
    s += `<g transform="${up}">` + mass([P(coatD, D.coat)], { tint: D.coatT, light: [12, -8], lines: cl,
      inner: D.lapels === false ? '' : `<path d="M16 -232L32 -226L38 -206L42 -168L34 -170L26 -204Z" fill="${D.shirt}"/>`,
      shade: `<path d="M-90 -66C-40 -58 40 -58 100 -76L100 10L-90 10Z" opacity=".45"/>` }) + '</g>';
    // collar + neck
    s += `<g transform="${up}">` + mass([P('M-14 -240L14 -240L16 -222L-12 -222Z', D.skin)], { tint: D.skinT, light: [4, -3] }) +
      mass([P('M-16 -228Q4 -236 26 -228L24 -216Q4 -222 -15 -216Z', D.shirt)], { tint: D.shirtT, light: [3, -3], w: 3.6 }) + '</g>';
    // tzitzit swinging at the near hip
    s += `<g transform="${up}">` + tzitzit(-6, D.tzY ? D.tzY + 4 : hy(-90), D, 4, -7 * walk * Math.sin(2 * Math.PI * (ph - 0.2)) - 2) + '</g>';
    // head sits on top of the shoulders, chin level, small nod in the walk (placed outside the body scale group)
    const nod = -1.8 * walk * Math.cos(4 * Math.PI * (ph - 0.1)) + (po.headRot || 0);
    const hfn = po.profile ? K.pHeadSide : K.pHead34;
    { const hx = po.profile ? 10 : 12, hy0 = -220 + (po.headDy || 0), la = lean * Math.PI / 180;
      const px = hx * Math.cos(la) - (hy0 + 104) * Math.sin(la), py = -104 + hx * Math.sin(la) + (hy0 + 104) * Math.cos(la) + bob;
      s += '</g>' + headAt(hfn, po.face || {}, D, px, py, po.profile ? [170, 210] : [166, 210], nod + lean * 0.2) + SC(D); }
    s += arm(false, PA.nearA != null ? PA.nearA : armA(0.5) - 2, PA.nearB != null ? PA.nearB : bendA(0.5), PA.nearHand, PA.nearHa, 0.5);
    return s + '</g>';
  };
})();
