/* animals part 3: camel, dog (same construction as donkey/cow; 3/4 busts facing right; st.noBust = head only) */
(function () {
  const { P, mass, taper, brow, mouth, OL } = K;
  const EX3 = K.EX3, face = K.animalFace;

  /* ---------------- CAMEL ---------------- */
  K.def('animals', 'camel', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const FUR = '#dcae6c', MUZ = '#efd29e', TUFT = '#a8703e', TINT = '#cdb3a8', INEAR = '#c98a62';
    const ea = st.ear || 0;
    const eL = `rotate(${({ neutral: 0, happy: -10, surprised: 14, angry: -16 }[ex]) + ea} 112 92)`;
    const eR = `rotate(${({ neutral: 0, happy: 10, surprised: -14, angry: 18 }[ex]) - ea} 204 84)`;
    let s = '<g transform="translate(6 22) scale(.9) rotate(-3 150 160)">';
    if (!st.noBust) {
      const neck = P('M112 330C118 290 132 250 150 222L224 236C216 270 216 300 228 330Z', FUR);
      s += mass([neck], { tint: TINT, light: [12, -6], shade: `<path d="M130 240C160 270 210 276 230 250L240 340L100 340Z"/>` });
    }
    const earLp = P('M110 100C90 88 80 72 86 60C102 64 116 78 122 92Z', FUR, eL);
    const earRp = P('M194 80C204 62 220 54 230 58C228 74 216 86 204 92Z', FUR, eR);
    const head = P('M100 122C96 82 130 58 166 60C200 62 220 86 220 114C232 132 254 148 264 170C274 196 264 232 236 246C204 258 160 254 138 236C116 218 104 172 100 122Z', FUR);
    const tuft = P(K.tufts([[128, 70], [146, 56], [166, 52], [186, 56], [202, 68]], [16, 20, 18, 14], 1, 0.25, 'Q166 80 128 70'), TUFT);
    const inner = `<path d="M150 204C148 172 200 160 238 166C264 172 272 200 264 226C252 250 204 256 172 246C154 238 150 222 150 204Z" fill="${MUZ}"/>` +
      `<path d="M112 96C98 86 92 76 94 68C104 72 112 80 116 90Z" fill="${INEAR}" transform="${eL}"/>` +
      `<path d="M200 84C208 72 218 66 224 66C222 76 214 84 206 88Z" fill="${INEAR}" transform="${eR}"/>`;
    const lines = taper([206, 186], [214, 176], [226, 178], 1.5, 5, 1.5) + taper([246, 178], [252, 170], [260, 174], 1.5, 4.5, 1.5) +
      taper([240, 196], [242, 206], [238, 216], 1, 3.2, 1) +
      taper([120, 196], [138, 168], [160, 160], 1, 3.4, 1) +
      taper([136, 70], [140, 60], [150, 54], 0.5, 2.2, 0.5, '#7c5230') + taper([176, 62], [182, 54], [192, 56], 0.5, 2.2, 0.5, '#7c5230');
    s += mass([earLp, earRp, head, tuft], { tint: TINT, light: [12, -8], inner, lines,
      shade: `<path d="M110 200C140 262 230 270 268 220L276 300L90 300Z" opacity=".7"/>` });
    const e1 = { x: 140, y: 118, rx: 17, ry: 22, side: -1 }, e2 = { x: 178, y: 114, rx: 21, ry: 26, side: 1 };
    // camels: heavy sleepy lids by default
    const per = ex === 'neutral' ? { top: 0.56, tilt: 0.18 } : ex === 'angry' ? { top: 0.5 } : null;
    s += K.eyePair(f, e1, e2, FUR, 8, '#7c5230', per);
    const m = f.m;
    s += mouth({ x: 214, y: 232, w: 54 * (m.wide || 1), open: m.open, smile: m.smile, round: m.round, teeth: m.round ? 0 : 9, rot: -8, skew: ex === 'neutral' && !st.talk ? -4 : 0 });
    return s + '</g>';
  });

  /* ---------------- DOG ---------------- */
  K.def('animals', 'dog', EX3, function (st) {
    const f = face(st), ex = st.expr;
    const FUR = '#cf914f', WHITE = '#f7efe2', EAR = '#7a4a2c', NOSE = '#2a201d', TINT = '#d1b3b4';
    const ea = st.ear || 0;
    const eL = `rotate(${({ neutral: 0, happy: -8, surprised: -22, angry: 10 }[ex]) + ea} 116 100)`;
    const eR = `rotate(${({ neutral: 0, happy: 8, surprised: 22, angry: -12 }[ex]) - ea} 204 84)`;
    let s = '<g transform="translate(10 22) scale(.9) rotate(-3 150 160)">';
    if (!st.noBust) {
      const neck = P('M90 330C100 276 112 236 128 206L214 200C224 240 234 282 248 330Z', FUR);
      s += mass([neck], { tint: TINT, light: [12, -6], inner: `<path d="M150 230C170 220 200 228 210 250L222 340L150 340Z" fill="${WHITE}"/>`,
        shade: `<path d="M106 206C140 254 210 264 238 230L252 340L60 340Z"/>` });
    }
    const earLp = P('M118 96C90 92 70 122 74 160C78 188 98 196 110 176C120 150 124 120 118 96Z', EAR, eL);
    const earRp = P('M200 80C228 74 252 102 254 138C254 162 238 170 228 154C218 130 212 104 200 80Z', EAR, eR);
    const head = P('M104 130C98 86 132 60 168 62C206 64 228 92 222 130C220 150 216 164 210 176L120 184C108 166 104 150 104 130Z', FUR);
    const muz = P('M128 202C120 168 160 150 200 154C238 158 258 182 252 210C246 238 216 252 184 250C150 248 132 230 128 202Z', WHITE);
    const inner = `<path d="M158 64C168 90 172 122 168 156L186 156C182 122 180 90 174 64Z" fill="${WHITE}"/>`;
    const lines = `<path d="M202 170C202 156 238 154 242 166C242 182 226 190 220 190C210 190 202 182 202 170Z" fill="${NOSE}"/>` +
      `<ellipse cx="226" cy="164" rx="7" ry="3.5" fill="#fff" opacity=".55"/>` +
      taper([220, 190], [220, 198], [216, 206], 1, 3, 1) +
      taper([120, 196], [140, 166], [170, 160], 1, 3.4, 1) +
      `<circle cx="160" cy="214" r="2.4" fill="#b59a84"/><circle cx="168" cy="224" r="2.4" fill="#b59a84"/><circle cx="244" cy="206" r="2.2" fill="#b59a84"/>`;
    s += mass([head, muz, earRp], { tint: TINT, light: [12, -8], inner, lines,
      shade: `<path d="M110 206C140 262 230 268 260 214L270 300L90 300Z" opacity=".7"/>` });
    const m = f.m;
    s += K.eyePair(f, { x: 144, y: 122, rx: 17, ry: 22, side: -1 }, { x: 182, y: 118, rx: 21, ry: 26, side: 1 }, FUR, 8, '#5a3820');
    s += mouth({ x: 206, y: 220, w: 56 * (m.wide || 1), open: m.open, smile: m.smile, round: m.round, teeth: m.round ? 0 : 7, rot: -6, skew: ex === 'neutral' && !st.talk ? -4 : 0 });
    if (st.tongue && (m.open || 0) > 0.2) {
      const tg = P('M200 236C194 262 202 284 216 282C230 280 232 258 224 234Z', '#e3707c');
      s += mass([tg], { tint: TINT, light: [4, -4], lines: taper([212, 244], [212, 258], [214, 270], 0.5, 2.4, 0.5, '#b8505c') });
    }
    // near (left) ear in front of the head, floppy
    s += mass([earLp], { tint: TINT, light: [8, -6], lines: taper([108, 112], [98, 140], [96, 168], 0.5, 2.4, 0.5, '#5a3420') });
    return s + '</g>';
  });
})();
