/* animals part 2: cow, sheep, goat, rooster, lion (same construction as the donkey) */
(function () {
  const { P, mass, taper, brow, mouth, OL } = K;
  const EX3 = K.EX3, face = K.animalFace;

  /* ---------------- COW ---------------- */
  K.def('animals', 'cow', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const BASE = '#f4eee4', PATCH = '#7b4e36', MUZ = '#eaa39c', HORN = '#efe0bd', TINT = '#cdbfc9', INEAR = '#e3a69e';
    const ea = st.ear || 0;
    const eL = `rotate(${({ neutral: 8, happy: -6, surprised: 22, angry: -14 }[ex]) + ea} 108 112)`;
    const eR = `rotate(${({ neutral: -4, happy: 8, surprised: -22, angry: 16 }[ex]) - ea} 216 108)`;
    let s = '<g transform="translate(10 22) scale(.9) rotate(-2 150 160)">';
    const neck = P('M70 320C80 270 94 228 110 200L214 196C224 236 234 278 250 320Z', BASE);
    if (!st.noBust) s += mass([neck], { tint: TINT, light: [12, -6], inner: `<path d="M180 250C200 236 236 244 250 270L256 330L170 330C162 300 166 266 180 250Z" fill="${PATCH}"/>`,
      shade: `<path d="M100 200C140 252 214 262 240 228L252 330L60 330Z"/>` });
    const earLp = P('M114 104C86 88 52 90 36 110C56 128 92 130 116 122Z', BASE, eL);
    const earRp = P('M210 98C238 82 272 84 288 100C270 120 236 122 210 116Z', PATCH, eR);
    const hornL = P('M126 74C108 62 98 44 104 26C116 38 130 52 144 62Z', HORN);
    const hornR = P('M186 62C202 52 212 36 206 18C222 28 226 54 206 72Z', HORN);
    const head = P('M98 114C94 72 140 52 178 56C214 60 230 92 224 126C222 146 226 160 234 172L120 204C104 184 98 152 98 114Z', BASE);
    const muz = P('M102 200C94 166 150 152 192 154C238 156 260 180 256 210C252 244 216 262 176 262C134 262 108 240 102 200Z', MUZ);
    const tuft = P(K.tufts([[134, 66], [150, 52], [168, 48], [186, 56]], [16, 20, 16], 1, 0.2, 'Q160 74 134 66'), PATCH);
    const inner = `<path d="M178 52C206 52 230 76 226 112C222 128 206 128 196 112C186 96 178 76 178 52Z" fill="${PATCH}"/>` +
      `<path d="M108 106C86 98 62 98 50 110C66 120 92 122 110 118Z" fill="${INEAR}" transform="${eL}"/>`;
    const lines = taper([116, 192], [146, 164], [192, 162], 1, 4, 1) +
      `<ellipse cx="146" cy="206" rx="8" ry="11" fill="#5a2a2a" transform="rotate(-20 146 206)"/><ellipse cx="214" cy="200" rx="10" ry="13" fill="#5a2a2a" transform="rotate(18 214 200)"/>` +
      taper([120, 70], [128, 58], [124, 42], 0.5, 2.4, 0.5, '#c9b48a') + taper([194, 58], [204, 48], [206, 32], 0.5, 2.4, 0.5, '#c9b48a');
    s += mass([earLp, hornL, hornR, earRp, head, muz, tuft], { tint: TINT, light: [12, -8], inner, lines,
      shade: `<path d="M96 216C126 272 222 280 258 222L266 300L80 300Z"/>` });
    const e1 = { x: 140, y: 118, rx: 19, ry: 25, side: -1 }, e2 = { x: 182, y: 114, rx: 24, ry: 29, side: 1 };
    s += K.eyePair(f, e1, e2, BASE, 0, OL);
    s += brow(e1, Object.assign({ w: 7, len: 0.9 }, f.E.brow), PATCH) + brow(e2, Object.assign({ w: 8.5 }, f.E.brow), '#3b261b');
    const m = f.m;
    s += mouth({ x: 182, y: 236, w: 70 * (m.wide || 1), open: m.open, smile: m.smile, round: m.round, teeth: m.round ? 0 : 10, rot: -4, skew: ex === 'neutral' && !st.talk ? -4 : 0 });
    return s + '</g>';
  });

  /* ---------------- SHEEP ---------------- */
  K.def('animals', 'sheep', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const WOOL = '#f6f1e6', FACE = '#3d3532', TINT = '#c9c0d2', MUZ = '#554a46';
    const ea = st.ear || 0;
    const eL = `rotate(${({ neutral: 10, happy: -4, surprised: -20, angry: 18 }[ex]) + ea} 112 118)`;
    const eR = `rotate(${({ neutral: -12, happy: 4, surprised: 20, angry: -18 }[ex]) - ea} 208 112)`;
    let s = '<g transform="translate(10 26) scale(.9) rotate(-3 150 160)">';
    const body = P(K.scallop(K.circlePts(158, 300, 128, 92, 15, Math.PI, [0, .06, -.03, .05, 0, .07, -.02]), 0.42), WOOL);
    if (!st.noBust) s += mass([body], { tint: TINT, light: [10, -10], shade: ``,
      lines: taper([120, 262], [130, 250], [146, 252], 0.5, 2.6, 0.5, '#b9b0c0') + taper([196, 258], [208, 246], [222, 250], 0.5, 2.6, 0.5, '#b9b0c0') });
    const earLp = P('M118 116C92 104 64 112 54 130C74 140 100 138 120 128Z', FACE, eL);
    const earRp = P('M204 108C230 94 258 100 268 118C248 130 222 130 202 122Z', FACE, eR);
    const head = P('M112 120C108 86 140 70 170 72C204 74 220 100 214 132C210 158 216 176 222 196C214 236 192 252 166 252C138 252 118 234 116 200C114 176 114 150 112 120Z', FACE);
    const cap = P(K.scallop(K.circlePts(162, 90, 80, 48, 14, Math.PI, [0, .08, -.04, .06, 0, .1, -.03]), 0.62), WOOL);
    s += mass([earLp, earRp, head, cap], { tint: TINT, light: [10, -8], lines:
      `<path d="M132 214C136 196 196 190 210 210C212 236 192 250 168 250C144 250 132 234 132 214Z" fill="${MUZ}"/>` +
      taper([150, 214], [146, 204], [158, 202], 1.5, 4.5, 1.5, '#1d1613') + taper([194, 210], [194, 200], [206, 200], 1.5, 5, 1.5, '#1d1613') +
      `<path d="M128 112C108 108 82 114 72 124C90 130 108 130 124 124Z" fill="#c98f8f" transform="${eL}"/>` +
      taper([140, 70], [150, 60], [164, 64], 0.5, 2.6, 0.5, '#c9c0cf') + taper([180, 66], [190, 58], [204, 66], 0.5, 2.6, 0.5, '#c9c0cf'),
      shade: `<path d="M108 200C130 262 216 262 228 200L240 270L100 270Z" opacity=".6"/>` });
    const e1 = { x: 146, y: 136, rx: 17, ry: 22, side: -1 }, e2 = { x: 184, y: 132, rx: 21, ry: 26, side: 1 };
    s += K.eyePair(f, e1, e2, FACE, 0, OL);
    s += brow(e1, Object.assign({ w: 6, len: 0.85 }, f.E.brow), '#9c918a') + brow(e2, Object.assign({ w: 7.5 }, f.E.brow), '#9c918a');
    const m = f.m;
    s += mouth({ x: 176, y: 232, w: 40 * (m.wide || 1), open: m.open, smile: m.smile, round: m.round, teeth: 0, rot: -4, inside: '#2a0d0f', lw: 3 });
    return s + '</g>';
  });

  /* ---------------- GOAT ---------------- */
  K.def('animals', 'goat', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const FUR = '#e9e2d6', HORN = '#9c8466', BEARD = '#d8cfc0', TINT = '#c6bccb', NOSE = '#d9b3a6', INEAR = '#d9aaa0';
    const ea = st.ear || 0;
    const eL = `rotate(${({ neutral: -6, happy: -16, surprised: 14, angry: 8 }[ex]) + ea} 118 108)`;
    const eR = `rotate(${({ neutral: 14, happy: 2, surprised: -14, angry: 24 }[ex]) - ea} 206 104)`;
    let s = '<g transform="translate(12 18) scale(.9) rotate(-3 150 160)">';
    const neck = P('M84 320C94 274 104 232 118 206L208 200C216 238 224 278 238 320Z', FUR);
    if (!st.noBust) s += mass([neck], { tint: TINT, light: [12, -6], shade: `<path d="M106 206C140 256 206 266 232 232L250 330L60 330Z"/>` });
    const hornL = P('M128 78C112 52 80 40 56 50C78 50 102 66 116 92Z', HORN);
    const hornR = P('M168 64C176 32 160 4 132 -2C152 14 158 40 150 70Z', HORN);
    const earLp = P('M120 104C96 104 70 118 62 140C84 142 108 128 124 118Z', FUR, eL);
    const earRp = P('M202 100C226 94 254 104 266 124C244 132 220 124 204 116Z', FUR, eR);
    const head = P('M114 116C110 80 140 62 172 62C204 64 220 92 214 124C210 150 216 176 220 196C214 228 196 244 172 246C146 246 126 230 122 204C118 176 116 146 114 116Z', FUR);
    const beard = P(K.tufts([[198, 228], [186, 252], [172, 268], [156, 252], [146, 232]], [-26, -34, -30, -22], 1, 0.15, 'L170 220'), BEARD);
    const fore = P(K.tufts([[140, 76], [158, 66], [178, 66], [196, 76]], [-14, -16, -12], 1, 0.2, 'Q170 90 140 76'), BEARD);
    const inner = `<path d="M198 104C222 98 246 106 256 120C240 124 220 120 204 112Z" fill="${INEAR}" transform="${eR}"/>` +
      `<path d="M150 214C152 198 202 192 212 210C212 228 196 238 178 238C160 238 150 228 150 214Z" fill="${NOSE}"/>`;
    const lines = taper([166, 210], [162, 200], [174, 198], 1.5, 4.5, 1.5) + taper([200, 206], [200, 196], [212, 196], 1.5, 5, 1.5) +
      taper([140, 78], [126, 62], [104, 54], 0.5, 2.2, 0.5, '#6c5a45') + taper([150, 70], [158, 40], [146, 14], 0.5, 2.2, 0.5, '#6c5a45') +
      taper([166, 256], [170, 244], [168, 232], 0.5, 2.2, 0.5, '#b0a594') + taper([184, 244], [186, 234], [190, 226], 0.5, 2, 0.5, '#b0a594');
    s += mass([hornL, hornR, earLp, earRp, head, beard, fore], { tint: TINT, light: [12, -8], inner, lines,
      shade: `<path d="M108 210C130 250 200 262 230 210L240 300L90 300Z" opacity=".7"/>` });
    s += K.eyePair(f, { x: 146, y: 124, rx: 17, ry: 22, side: -1 }, { x: 184, y: 120, rx: 22, ry: 26, side: 1 }, FUR, 8, '#5a4a3c', { bar: true, iris: '#c9a23a' });
    const m = f.m;
    s += mouth({ x: 186, y: 228, w: 36 * (m.wide || 1), open: m.open, smile: m.smile, round: m.round, teeth: 0, rot: -4, lw: 3 });
    return s + '</g>';
  });

  /* ---------------- ROOSTER ---------------- */
  K.def('animals', 'rooster', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const BODY = '#c8522c', HACK = '#eea23c', HACK2 = '#d77a2c', COMB = '#d8343a', BEAK = '#f2be3c', BEAK2 = '#d9962a', TINT = '#d6b6c0', FACEC = '#e9673f';
    let s = '<g transform="translate(6 18) scale(.92)">';
    const body = P('M70 330C60 270 80 220 120 204L220 200C250 230 262 280 256 330Z', BODY);
    const tail = P('M60 300C30 260 14 210 30 170C40 200 58 220 74 232C64 196 70 160 92 140C94 180 104 210 116 228Z', '#2f5a4a');
    if (!st.noBust) s += mass([tail, body], { tint: TINT, light: [12, -6], lines: taper([46, 196], [56, 230], [80, 256], 0.5, 3, 0.5, '#4f8a72') + taper([88, 168], [92, 200], [104, 226], 0.5, 3, 0.5, '#4f8a72') });
    const combB = ({ neutral: '', happy: 'rotate(-4 150 70)', surprised: 'rotate(-10 150 70) translate(0 -8)', angry: 'rotate(6 150 70)' }[ex]) + (st.ear ? ` rotate(${st.ear} 150 76)` : '');
    const pf = 1 + (st.puff || 0);
    const comb = P(K.scallop([[118, 78], [116, 54], [128, 36], [146, 26], [164, 22], [182, 28], [196, 44], [198, 64], [190, 78]], [0, .95, .95, .95, .95, .95, .8, .3, 0]), COMB, combB);
    const head = P('M112 110C106 76 136 58 166 60C198 62 216 88 214 118C212 140 206 160 196 176L124 180C114 160 112 134 112 110Z', FACEC);
    const hack = P(K.tufts([[214, 140], [222, 172], [226, 200], [214, 228], [190, 244], [160, 250], [130, 244], [104, 228], [92, 200], [96, 172], [106, 142]], [-26, -30, -28, -30, -28, -30, -28, -30, -26, -24].map(v => v * pf), 1, 0.15, 'L160 130'), HACK);
    s += mass([comb, hack, head], { tint: TINT, light: [10, -8],
      inner: `<path d="M98 200C120 230 200 236 224 200L230 260L90 260Z" fill="${HACK2}"/>`,
      lines: taper([130, 214], [140, 232], [146, 246], 0.5, 2.6, 0.5, '#b3622a') + taper([170, 216], [176, 234], [176, 248], 0.5, 2.6, 0.5, '#b3622a') + taper([200, 206], [202, 222], [196, 236], 0.5, 2.4, 0.5, '#b3622a'),
      shade: `<path d="M100 150C110 186 200 196 220 160L230 200L96 200Z" opacity=".5"/>` });
    const op = Math.min(1, (f.m.open || 0) * 1.6) + (ex === 'happy' && !st.talk ? 0.15 : 0);
    const wat = P('M150 150C140 170 142 198 158 204C174 198 176 172 166 150Z', COMB);
    const lower = P('M150 140C170 146 196 150 214 150C200 160 176 166 152 160Z', BEAK2, `rotate(${(op * 26).toFixed(1)} 152 146)`);
    const upper = P('M146 128C170 122 206 128 232 144C208 148 176 150 148 152C140 146 140 134 146 128Z', BEAK);
    s += mass([wat], { tint: TINT, light: [6, -6] });
    s += mass([lower], { tint: TINT, noShade: true });
    if (op > 0.05) s += `<path d="M152 152L200 154" stroke="#7a1e22" stroke-width="${(op * 10).toFixed(1)}" stroke-linecap="round" transform="rotate(${(op * 12).toFixed(1)} 152 146)"/>`;
    s += mass([upper], { tint: TINT, light: [0, -6], lines: taper([176, 134], [180, 132], [186, 133], 1, 3.5, 1) });
    s += K.eyePair(f, { x: 140, y: 106, rx: 16, ry: 21, side: -1 }, { x: 175, y: 102, rx: 20, ry: 25, side: 1 }, FACEC, 7.5, OL);
    return s + '</g>';
  });

  /* ---------------- LION ---------------- */
  K.def('animals', 'lion', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const FUR = '#eaa94a', MANE = '#b5521f', MANE2 = '#d9772e', MUZ = '#f8e6c4', NOSE = '#6b3424', TINT = '#d3b7b0';
    let s = '<g transform="translate(8 14) scale(.92)">';
    const body = P('M70 330C70 280 96 240 130 228L200 226C236 240 256 284 254 330Z', FUR);
    if (!st.noBust) s += mass([body], { tint: TINT, light: [12, -6] });
    const ring = K.circlePts(160, 146, 108, 112, 17, -Math.PI / 2 + 0.1, [0, .08, -.02, .1, .02, .07, -.03, .09]); ring.push(ring[0]);
    const mane = P(K.tufts(ring, [30, 36, 28, 38, 32, 34], 1, 0.3), MANE);
    const ring2 = K.circlePts(164, 140, 78, 82, 13, -Math.PI / 2 + 0.3, [0, .06, -.02, .07]); ring2.push(ring2[0]);
    s += mass([mane], { tint: TINT, light: [14, -10], inner: `<path d="${K.tufts(ring2, [22, 26, 20, 26], 1, 0.35)}" fill="${MANE2}"/>` });
    const earL = P('M104 92C92 66 112 50 132 64Z', FUR), earR = P('M200 62C222 50 240 70 224 92Z', FUR);
    const head = P('M108 120C104 82 136 62 166 62C200 62 226 84 224 120C222 150 230 176 220 200C204 230 176 238 158 238C130 236 110 220 104 196C98 170 110 150 108 120Z', FUR);
    const inner = `<path d="M110 92C106 76 116 68 126 72Z" fill="#c76b4c"/><path d="M208 70C220 66 228 76 222 88Z" fill="#c76b4c"/>` +
      `<path d="M126 196C120 166 150 154 176 156C206 158 222 174 220 196C218 222 196 234 172 234C146 234 130 222 126 196Z" fill="${MUZ}"/>`;
    const lines = taper([170, 186], [176, 196], [174, 208], 0.5, 3, 1) +
      `<path d="M156 164C162 154 196 152 204 162C204 176 186 186 180 186C172 186 156 176 156 164Z" fill="${NOSE}"/>` +
      `<circle cx="146" cy="194" r="2.2" fill="#a36a40"/><circle cx="140" cy="203" r="2.2" fill="#a36a40"/><circle cx="208" cy="190" r="2.2" fill="#a36a40"/><circle cx="212" cy="200" r="2.2" fill="#a36a40"/>`;
    s += mass([earL, earR, head], { tint: TINT, light: [12, -8], inner, lines,
      shade: `<path d="M98 200C130 250 210 250 232 200L240 260L90 260Z" opacity=".6"/>` });
    s += K.eyePair(f, { x: 146, y: 120, rx: 17, ry: 21, side: -1 }, { x: 186, y: 116, rx: 21, ry: 25, side: 1 }, FUR, 8.5, '#7a3418', { iris: '#d9a02a' });
    const m = f.m;
    s += mouth({ x: 180, y: 212, w: 50 * (m.wide || 1), open: m.open, smile: m.smile, round: m.round, teeth: m.round ? 0 : 8, rot: -3, skew: ex === 'neutral' && !st.talk ? -3 : 0 });
    return s + '</g>';
  });
})();
