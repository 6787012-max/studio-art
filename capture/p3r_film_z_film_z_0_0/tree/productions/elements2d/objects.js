/* objects with faces: sefer, kettle, stone, coin */
(function () {
  const { P, mass, taper, mouth, line, OL } = K;
  const EX3 = K.EX3, face = K.animalFace;
  function feat(st, f, e1, e2, lid, bw, mo) {
    let s = K.eyePair(f, e1, e2, lid, bw, mo.browCol || OL);
    const m = f.m;
    s += mouth(Object.assign({ open: m.open, smile: m.smile, round: m.round, teeth: m.round ? 0 : (mo.teeth || 0) }, mo, { w: mo.w * (m.wide || 1) }));
    return s;
  }

  /* ---------------- SEFER ---------------- */
  K.def('objects', 'sefer', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const COV = '#2b4d8c', SPINE = '#1f3a6d', PAGE = '#f3e7cc', GOLD = '#e3b24c', TINT = '#b9b2cf';
    const tilt = { neutral: -3, happy: 2, surprised: -1 }[ex];
    let s = `<g transform="rotate(${tilt} 150 270)">`;
    s += '<ellipse cx="150" cy="280" rx="86" ry="9" fill="#000" opacity=".12"/>';
    const spine = P('M70 70Q68 62 78 58L100 60L100 270L80 278Q70 280 70 272Z', SPINE);
    const pages = P('M80 58L190 46Q198 45 206 50L214 56L100 62Z', PAGE);
    const cover = P('M100 60L206 52Q220 51 220 64L220 260Q220 272 208 272L100 270Z', COV);
    const inner = `<path d="M118 78L202 72L202 252L118 254Z" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M124 85L196 80L196 245L124 247Z" fill="none" stroke="${GOLD}" stroke-width="1.4" opacity=".8"/>` +
      [[118, 78], [202, 72], [202, 252], [118, 254]].map(p => `<path d="M${p[0]} ${p[1] - 7}L${p[0] + 7} ${p[1]}L${p[0]} ${p[1] + 7}L${p[0] - 7} ${p[1]}Z" fill="${GOLD}"/>`).join('') +
      [92, 120, 220, 246].map(y => `<path d="M72 ${y + 4}L100 ${y - 2}L100 ${y + 6}L72 ${y + 12}Z" fill="${GOLD}"/>`).join('') +
      `<path d="M150 236L170 236L160 228Z" fill="${GOLD}" opacity=".0"/>`;
    const lines = taper([92, 58], [140, 52], [196, 48], 0.5, 1.6, 0.5, '#c9b48e') + taper([96, 61], [150, 55], [204, 52], 0.5, 1.4, 0.5, '#c9b48e') +
      taper([100, 62], [100, 160], [100, 270], 2, 3.6, 2) + taper([210, 70], [214, 150], [210, 250], 0.5, 4, 0.5, '#4f74b6');
    s += mass([spine, pages, cover], { tint: TINT, light: [10, -6], inner, lines,
      shade: `<path d="M100 236L230 226L230 290L100 290Z" opacity=".5"/>` });
    s += feat(st, f, { x: 140, y: 132, rx: 19, ry: 24, side: -1 }, { x: 180, y: 130, rx: 22, ry: 27, side: 1 }, COV, 8,
      { x: 162, y: 200, w: 54, rot: -2, teeth: 9, skew: ex === 'neutral' && !st.talk ? -3 : 0 });
    return s + '</g>';
  });

  /* ---------------- KETTLE ---------------- */
  K.def('objects', 'kettle', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const BODY = '#e0613e', LID = '#f2ead8', DARK = '#3b3532', TINT = '#d4b4bf';
    const lift = { neutral: 0, happy: -3, surprised: -14 }[ex];
    let s = '<g transform="translate(-4 6)">';
    s += '<ellipse cx="150" cy="276" rx="92" ry="9" fill="#000" opacity=".12"/>';
    const handle = P('M106 134C96 30 206 30 196 134L184 134C192 52 110 52 118 134Z', DARK);
    const spout = P('M206 196C230 186 246 158 258 132L276 138C268 170 252 212 214 240Z', BODY);
    const body = P('M98 262C66 230 70 150 150 132C230 150 236 230 204 262Q150 274 98 262Z', BODY);
    const base = P('M96 258Q150 272 206 258L208 268Q150 282 94 268Z', DARK);
    s += mass([handle, spout, base, body], { tint: TINT, light: [10, -8],
      lines: taper([92, 196], [96, 160], [122, 142], 1, 6, 1, '#fff6ea') + taper([256, 136], [266, 136], [274, 140], 1, 3, 1) +
        taper([210, 180], [216, 220], [196, 252], 0.5, 3, 0.5, '#b2452b'),
      shade: `<path d="M80 220Q150 246 222 220L230 290L70 290Z" opacity=".6"/>` });
    const lid = P(`M110 ${136 + lift}C116 ${112 + lift} 186 ${112 + lift} 192 ${136 + lift}Q150 ${144 + lift} 110 ${136 + lift}Z`, LID);
    const knob = P(`M140 ${116 + lift}C138 ${100 + lift} 162 ${100 + lift} 160 ${116 + lift}Z`, DARK);
    s += mass([knob, lid], { tint: TINT, light: [6, -6] });
    if (ex === 'surprised') s += ['M262 118C252 102 270 94 264 78', 'M280 114C274 98 290 92 286 76'].map(d => line(d, 5, '#c9d4dc')).join('');
    s += feat(st, f, { x: 132, y: 184, rx: 19, ry: 23, side: -1 }, { x: 172, y: 182, rx: 22, ry: 26, side: 1 }, BODY, 8,
      { x: 156, y: 236, w: 44, rot: -2, teeth: 7, skew: ex === 'neutral' && !st.talk ? -3 : 0 });
    return s + '</g>';
  });

  /* ---------------- STONE ---------------- */
  K.def('objects', 'stone', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const ROCK = '#aaa49a', TINT = '#b9b0c4', MOSS = '#7f9a52';
    const sq = { neutral: 1, happy: 1.02, surprised: 0.97 }[ex];
    let s = `<g transform="translate(150 266) scale(${2 - sq} ${sq}) translate(-150 -266)">`;
    s += '<ellipse cx="150" cy="268" rx="110" ry="10" fill="#000" opacity=".12"/>';
    const pts = [[42, 262], [40, 216], [56, 168], [88, 128], [132, 104], [178, 102], [218, 122], [248, 160], [262, 206], [258, 262]];
    const rock = P(K.scallop(pts, [0.02, 0.12, 0.14, 0.1, 0.12, 0.1, 0.14, 0.12, 0.06, 0.0]), ROCK);
    const lines = taper([88, 128], [106, 150], [100, 180], 0.5, 3.4, 0.5) + taper([218, 122], [210, 146], [226, 170], 0.5, 3, 0.5) +
      taper([60, 230], [80, 222], [84, 200], 0.5, 2.6, 0.5) + taper([236, 226], [228, 240], [240, 252], 0.5, 2.6, 0.5) +
      `<path d="M120 106C140 96 170 96 188 104C176 116 150 118 120 106Z" fill="${MOSS}"/>` +
      taper([132, 106], [150, 112], [176, 106], 0.5, 2, 0.5, '#5d7a38') +
      `<circle cx="70" cy="246" r="4" fill="#8d877d"/><circle cx="226" cy="198" r="3" fill="#8d877d"/><circle cx="214" cy="244" r="5" fill="#8d877d"/>`;
    s += mass([rock], { tint: TINT, light: [14, -10], lines,
      shade: `<path d="M40 236Q150 270 262 236L262 290L40 290Z" opacity=".5"/>` });
    s += feat(st, f, { x: 132, y: 170, rx: 19, ry: 23, side: -1 }, { x: 172, y: 168, rx: 22, ry: 26, side: 1 }, ROCK, 9,
      { x: 158, y: 224, w: 52, rot: -2, teeth: 8, skew: ex === 'neutral' && !st.talk ? -4 : 0 });
    return s + '</g>';
  });

  /* ---------------- COIN ---------------- */
  K.def('objects', 'coin', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const GOLD = '#f2c14a', EDGE = '#c98a22', RIM = '#d99d2c', TINT = '#d9c0a8';
    const rot = { neutral: -4, happy: 4, surprised: 0 }[ex];
    let s = `<g transform="rotate(${rot} 150 150)">`;
    s += '<ellipse cx="146" cy="276" rx="70" ry="8" fill="#000" opacity=".12"/>';
    const edge = P('M60 150C60 84 98 36 142 36L156 38C112 40 74 88 74 152C74 216 112 264 156 264L142 266C98 266 60 216 60 150Z', EDGE);
    const face0 = P('M74 150C74 86 112 38 156 38C206 38 244 88 244 150C244 214 206 264 156 264C112 264 74 214 74 150Z', GOLD);
    let reed = ''; for (let i = 0; i < 15; i++) { const a = -1.35 + i * 0.19, x = 142 - Math.cos(a) * 80 * 0.98, y = 151 + Math.sin(a) * 112; reed += `<path d="M${(x).toFixed(1)} ${y.toFixed(1)}l9 0" stroke="#a56c16" stroke-width="2.2" stroke-linecap="round"/>`; }
    const inner = `<ellipse cx="159" cy="151" rx="70" ry="94" fill="none" stroke="${RIM}" stroke-width="5"/>` +
      Array.from({ length: 28 }, (_, i) => { const a = i / 28 * Math.PI * 2; return `<circle cx="${(159 + Math.cos(a) * 78).toFixed(1)}" cy="${(151 + Math.sin(a) * 103).toFixed(1)}" r="2.2" fill="${RIM}"/>`; }).join('');
    s += mass([edge, face0], { tint: TINT, light: [12, -10], inner: reed + inner,
      lines: taper([206, 70], [232, 100], [236, 150], 1, 6, 1, '#fff2c4'),
      shade: `<path d="M70 200Q150 270 250 200L250 290L70 290Z" opacity=".55"/>` });
    s += feat(st, f, { x: 140, y: 130, rx: 19, ry: 23, side: -1 }, { x: 180, y: 128, rx: 22, ry: 26, side: 1 }, GOLD, 8,
      { x: 162, y: 190, w: 50, rot: -2, teeth: 8, skew: ex === 'neutral' && !st.talk ? -3 : 0 });
    return s + '</g>';
  });
})();
