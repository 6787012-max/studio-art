/* animals - 3/4 busts facing right. Each: draw(st) st={expr:'neutral'|'happy'|'surprised', talk:'X'|'A'|'E'|'O'|null, blink:bool} */
(function () {
  const { P, mass, taper, eye, brow, mouth, line, talkMouth, tufts, OL } = K;
  const EX3 = ['neutral', 'happy', 'surprised'];
  K.EX3 = EX3;

  // shared expression presets for animal eyes/brows/mouth
  function face(st) {
    const ex = st.expr;
    const E = {
      neutral: { top: 0.42, tilt: 0.28, bot: 0, pr: 0.58, look: [0.3, 0.15], brow: { raise: 0, inRaise: -2, arch: 4 }, m: { open: 0, smile: 0.14 } },
      happy: { top: 0.2, tilt: -0.12, bot: 0.22, pr: 0.6, look: [0.2, -0.05], brow: { raise: 8, inRaise: 11, arch: 9 }, m: { open: 0.36, smile: 0.75 } },
      surprised: { top: 0, tilt: 0, bot: 0, pr: 0.36, look: [0, 0], brow: { raise: 17, inRaise: 20, arch: 10, gap: 10 }, m: { open: 0.62, smile: 0, round: 1 } },
      angry: { top: 0.36, tilt: -0.5, bot: 0.08, pr: 0.5, look: [0.35, 0.1], brow: { raise: 6, inRaise: -12, arch: 1, gap: 3 }, m: { open: 0, smile: -0.45 } },
    }[ex];
    if (st.look) E.look = st.look;
    if (st.eye) Object.assign(E, st.eye);
    const m = Object.assign({}, E.m);
    if (st.talk) Object.assign(m, talkMouth(st.talk, { smile: ex === 'happy' ? 0.5 : ex === 'neutral' ? 0.1 : ex === 'angry' ? -0.4 : 0 }));
    if (st.mo) Object.assign(m, st.mo);
    return { E, m, blink: st.blink };
  }
  K.animalFace = face;
  // apply preset to a pair of eyes and draw eyes + brows
  K.eyePair = function (f, e1, e2, lid, bw, browCol, per) {
    for (const e of [e1, e2]) Object.assign(e, { top: f.E.top, tilt: f.E.tilt, bot: f.E.bot, pr: f.E.pr * (e.prk || 1), look: f.E.look, blink: f.blink, lid }, per || {});
    let s = eye(e1) + eye(e2);
    if (bw) s += brow(e1, Object.assign({ w: bw * 0.85, len: 0.9 }, f.E.brow), browCol) + brow(e2, Object.assign({ w: bw }, f.E.brow), browCol);
    return s;
  };

  /* ---------------- DONKEY ---------------- */
  K.def('animals', 'donkey', EX3, function (st) {
    const f = face(st), E = f.E, ex = st.expr;
    const FUR = '#a59689', MUZ = '#e6dacb', EAR = '#d7aba3', MANE = '#3d302b', TINT = '#bfb1bb';
    const ea = st.ear || 0;
    const earR = `rotate(${({ neutral: 16, happy: 4, surprised: -12, angry: 30 }[ex]) + ea} 196 84)`;
    const earL = `rotate(${({ neutral: -2, happy: -16, surprised: 8, angry: -24 }[ex]) - ea * 0.7} 136 84)`;
    let s = '<g transform="translate(14 24) scale(.9) rotate(-3 150 160)">';
    // neck + mane (behind)
    const neck = P('M76 320C86 270 98 226 114 196L212 196C220 236 228 276 244 320Z', FUR);
    const mane = P(tufts([[122, 66], [102, 104], [86, 146], [74, 190], [64, 236], [56, 282], [52, 326]], [40, 30, 44, 34, 40, 30], 1, 0.55,
      'L110 320L150 100'), MANE);
    if (!st.noBust) s += mass([mane, neck], { tint: TINT, light: [12, -6],
      shade: `<path d="M104 200C140 250 210 262 236 230L250 330L60 330Z"/>`,
      lines: taper([156, 278], [170, 300], [176, 322], 1, 3.4, 2) });
    // head mass
    const earRp = P('M176 86C180 44 208 10 248 2C248 34 228 70 202 94Z', FUR, earR);
    const earLp = P('M120 90C104 54 106 26 118 4C138 24 152 54 148 88Z', FUR, earL);
    const head = P('M112 108C106 70 146 50 182 56C212 62 222 92 218 122C216 140 222 152 232 166L150 204C120 198 100 178 102 150C102 130 112 122 112 108Z', FUR);
    const muz = P('M116 202C106 168 150 148 192 150C230 152 250 176 248 206C246 242 216 264 178 264C142 264 122 240 116 202Z', MUZ);
    const fore = P('M126 78Q120 50 146 36Q144 48 152 56Q160 30 192 32Q178 44 182 56Q198 50 210 62Q190 80 162 78Q138 86 126 78Z', MANE);
    const innerR = `<path d="M188 84C192 50 212 22 238 12C234 36 218 62 202 84Z" fill="${EAR}" transform="${earR}"/>`;
    const innerL = `<path d="M126 86C116 58 116 32 120 18C132 36 140 58 140 84Z" fill="${EAR}" transform="${earL}"/>`;
    const lines = taper([122, 190], [146, 160], [186, 158], 1, 4, 1) +
      taper([212, 160], [232, 168], [240, 182], 1, 2.6, 1) +
      taper([140, 206], [134, 190], [150, 188], 2, 5, 2) + taper([206, 198], [204, 182], [222, 184], 2, 6.5, 2) +
      taper([158, 252], [178, 260], [198, 252], 1, 2.6, 1) +
      taper([150, 74], [156, 60], [170, 50], 1, 2.4, 0.5, '#6a5a52') + taper([176, 74], [182, 64], [196, 58], 1, 2.2, 0.5, '#6a5a52') +                  // chin crease
      `<g transform="${earR}">${taper([192, 86], [206, 52], [236, 16], 1, 3, 1)}</g>`;
    s += mass([earLp, earRp, head, muz, fore], { tint: TINT, light: [12, -8], inner: innerL + innerR,
      shade: `<path d="M104 214C130 270 216 276 252 222L262 300L90 300Z"/>`,
      lines });
    s += K.eyePair(f, { x: 139, y: 116, rx: 19, ry: 25, side: -1 }, { x: 180, y: 112, rx: 24, ry: 29, side: 1 }, FUR, 9, OL,
      ex === 'neutral' ? null : null);
    const m = f.m;
    s += mouth({ x: 182, y: 230, w: 66 * (m.wide || 1), open: m.open, smile: m.smile, round: m.round, teeth: m.round ? 0 : 14, rot: -5, skew: ex === 'neutral' && !st.talk ? -5 : 0 });
    return s + '</g>';
  });
})();
