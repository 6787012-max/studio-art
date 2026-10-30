/* toldot07 - 2D design of the sea characters (classic script, needs elements2d/core.js + animals.js loaded first).
   Same approved method as elements2d: one connected outline per mass, flat colour + ONE shadow tone (K.mass), heavy-lid eyes,
   strong brows, talk mouths, blink.  Everything in the 300 x 300 drawing box, front view (the drop) or 3/4 facing right.
   K.T7.EXPR             expression list: neutral happy curious surprised worried tired cheering
   K.T7.face(st, L)      eyes + brows + mouth for any character. L = {e1, e2 (eye specs), mo {x,y,w,teeth}, lid, bw, browCol}
   K.T7.TIPA_L           Tipa face layout (shared with the 3D decal so 2D and 3D are the same face)
   K.T7.tipa(st, v)      the drop. st = {expr, talk, blink, look, arms:'down'|'up'|'wave'|'point'|'hips', feet:true}
                         v = variant {kind:'tipa'|'small'|'big'|'sea'|'foam'}
   K.T7.grain(st)        sand grain from the Nile.  K.T7.fish(st)  K.T7.gull(st)  K.T7.crab(st)  K.T7.gust(st)
   Registered for the sheet as K.def('sea', name, EXPR, draw). */
(function () {
  const { P, mass, taper, eye, brow, mouth, line, talkMouth, OL } = K;
  const T7 = {}; K.T7 = T7;
  const EXPR = ['neutral', 'happy', 'curious', 'surprised', 'worried', 'tired', 'cheering'];
  T7.EXPR = EXPR;
  const PRE = {
    neutral:   { top: 0.26, tilt: 0.12, bot: 0, pr: 0.56, look: [0.1, 0.05], b1: { raise: 2, inRaise: 0, arch: 5 }, m: { open: 0, smile: 0.32 } },
    happy:     { top: 0.08, tilt: -0.1, bot: 0.3, pr: 0.58, look: [0, -0.05], b1: { raise: 9, inRaise: 11, arch: 8 }, m: { open: 0.42, smile: 0.85 } },
    curious:   { top: 0.04, tilt: 0, bot: 0, pr: 0.5, look: [0.55, -0.35], b1: { raise: 1, inRaise: -2, arch: 4 }, b2: { raise: 17, inRaise: 10, arch: 11 }, m: { open: 0.2, smile: 0.05, round: 0.8, wide: 0.55 } },
    surprised: { top: 0, tilt: 0, bot: 0, pr: 0.34, look: [0, 0], b1: { raise: 17, inRaise: 19, arch: 10, gap: 10 }, m: { open: 0.62, smile: 0, round: 1, wide: 0.8 } },
    worried:   { top: 0.18, tilt: 0.34, bot: 0.04, pr: 0.5, look: [-0.25, 0.1], b1: { raise: 0, inRaise: 15, arch: 3 }, m: { open: 0.22, smile: -0.55, wide: 0.75 } },
    tired:     { top: 0.56, tilt: 0.26, bot: 0.14, pr: 0.5, look: [0, 0.35], b1: { raise: -2, inRaise: 3, arch: 2 }, m: { open: 0.1, smile: -0.12, wide: 0.75 } },
    cheering:  { top: 0, tilt: 0, bot: 0, pr: 0.5, look: [0, 0], closed: true, b1: { raise: 13, inRaise: 15, arch: 10 }, m: { open: 0.78, smile: 1, wide: 1.1 } },
  };
  T7.PRE = PRE;

  /* face for every sea character */
  T7.face = function (st, L) {
    const E = PRE[st.expr] || PRE.neutral, lid = L.lid, bw = L.bw == null ? 8 : L.bw;
    const look = st.look || E.look;
    const e1 = Object.assign({ side: -1 }, L.e1), e2 = Object.assign({ side: 1 }, L.e2);
    for (const e of [e1, e2]) Object.assign(e, { top: E.top, tilt: E.tilt, bot: E.bot, pr: E.pr * (e.prk || 1), look, lid, blink: st.blink || E.closed, happyClose: !!E.closed }, st.eye || {});
    let s = eye(e1) + eye(e2);
    if (bw > 0) {
      const b1 = E.b1, b2 = E.b2 || E.b1;
      s += brow(e1, Object.assign({ w: bw * 0.9, len: 0.95 }, b1), L.browCol || OL) + brow(e2, Object.assign({ w: bw }, b2), L.browCol || OL);
    }
    const m = Object.assign({}, E.m);
    if (st.talk) Object.assign(m, talkMouth(st.talk, { smile: st.expr === 'happy' || st.expr === 'cheering' ? 0.5 : st.expr === 'worried' ? -0.3 : 0.15 }));
    if (st.mo) Object.assign(m, st.mo);
    const mo = L.mo;
    s += mouth({ x: mo.x, y: mo.y, w: mo.w * (m.wide || 1), open: m.open, smile: m.smile, round: m.round, teeth: m.round ? 0 : (mo.teeth == null ? 7 : mo.teeth), lw: mo.lw || 3.6, rot: mo.rot || 0 });
    if (st.expr === 'tired' && L.sweat) { const [x, y] = L.sweat; s += `<path d="M${x} ${y}C${x - 7} ${y + 12} ${x - 8} ${y + 20} ${x} ${y + 21}C${x + 8} ${y + 20} ${x + 7} ${y + 12} ${x} ${y}Z" fill="#bfe8fb" stroke="${OL}" stroke-width="3"/>`; }
    if (st.expr === 'cheering' && L.spark) for (const [x, y, r] of L.spark) s += `<path d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z" fill="#ffd84a" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>`;
    return s;
  };

  const e2p = (cx, cy, rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
  T7.e2p = e2p;

  /* ---------------- TIPA, the water drop ---------------- */
  // outline (right half, drawing coords): tip (150,34) -> widest (245,185) -> bottom (150,278). Shared with the 3D lathe.
  T7.DROP = { tip: [150, 34], c1: [168, 78], c2: [245, 128], mid: [245, 185], c3: [245, 240], c4: [205, 278], bot: [150, 278] };
  const DROP_D = 'M150 34C168 78 245 128 245 185C245 240 205 278 150 278C95 278 55 240 55 185C55 128 132 78 150 34Z';
  T7.TIPA_L = { e1: { x: 119, y: 166, rx: 25, ry: 31 }, e2: { x: 181, y: 166, rx: 25, ry: 31 }, mo: { x: 150, y: 224, w: 54, teeth: 8 }, bw: 8.5,
    sweat: [222, 120], spark: [[54, 70, 13], [252, 84, 10], [236, 40, 8]] };
  T7.VAR = {
    tipa:  { col: '#86cff3', belly: '#c3ecfc', tint: '#a8b6e6', sc: 1.0, lid: '#86cff3' },
    small: { col: '#9ad9f6', belly: '#d2f2fd', tint: '#a8b6e6', sc: 0.72, lid: '#9ad9f6', eyeK: 1.18 },
    big:   { col: '#69bde9', belly: '#b3e2f8', tint: '#9fa9de', sc: 1.25, lid: '#69bde9', eyeK: 0.9, kippa: true, bw: 11 },
    sea:   { col: '#3fb0b8', belly: '#9fe0dc', tint: '#9aaed0', sc: 1.0, lid: '#3fb0b8', salt: true },
    foam:  { col: '#eef8fd', belly: '#ffffff', tint: '#b8c6e2', sc: 0.9, lid: '#eef8fd', bubbles: true },
  };
  function armPart(side, mode, col) {
    // shoulder at (150 +- 92, 200); returns ellipse parts (arm + hand) in body colour
    const sx = 150 + side * 90, sy = 204;
    const ang = { down: 20, up: 150, wave: side > 0 ? 140 : 25, point: side > 0 ? 95 : 25, hips: 60 }[mode] || 20;   // degrees from straight down, outward
    const a = ang * Math.PI / 180, L = 34;
    const hx = sx + side * Math.sin(a) * L, hy = sy + Math.cos(a) * L;
    const mx = (sx + hx) / 2, my = (sy + hy) / 2, rot = side * -ang;
    return [P(e2p(mx, my, 10, 22), col, `rotate(${rot} ${mx} ${my})`), P(e2p(hx, hy, 12, 12), col)];
  }
  T7.tipa = function (st, v) {
    v = Object.assign({}, T7.VAR[(v && v.kind) || 'tipa'], v || {});
    const arms = st.arms || 'down';
    let s = `<g transform="translate(${150 - 150 * v.sc} ${292 - 292 * v.sc}) scale(${v.sc})">`;
    s += '<ellipse cx="150" cy="284" rx="96" ry="10" fill="#000" opacity=".12"/>';
    const parts = [P(DROP_D, v.col)];
    if (st.feet !== false) parts.unshift(P(e2p(118, 276, 22, 11), v.col), P(e2p(182, 276, 22, 11), v.col));
    parts.unshift(...armPart(-1, arms === 'up' ? 'up' : arms === 'hips' ? 'hips' : 'down', v.col), ...armPart(1, arms, v.col));
    let inner = `<path d="${e2p(150, 228, 70, 44)}" fill="${v.belly}" opacity=".85"/>`;
    if (v.salt) for (const [x, y] of [[96, 140], [206, 214], [108, 236], [190, 120], [80, 196]]) inner += `<path d="M${x} ${y - 5}L${x + 5} ${y}L${x} ${y + 5}L${x - 5} ${y}Z" fill="#ffffff"/>`;
    if (v.bubbles) for (const [x, y, r] of [[92, 150, 9], [206, 136, 7], [214, 232, 10], [84, 226, 6], [176, 96, 6]]) inner += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#b7d4ea" stroke-width="3"/>`;
    const hl = taper([92, 132], [100, 100], [126, 74], 2, 9, 2, '#ffffff') + `<circle cx="84" cy="152" r="6" fill="#fff"/>` +
      taper([212, 250], [228, 230], [234, 206], 1, 4, 1, '#ffffffaa');
    s += mass(parts, { tint: v.tint, light: [-12, -10], inner, lines: hl });
    if (v.kippa) s += mass([P('M112 96C122 70 178 70 188 96Q150 88 112 96Z', '#2a2f4a')], { tint: '#9a9ab8', light: [4, -4] });
    const L = Object.assign({}, T7.TIPA_L, { lid: v.lid, bw: v.bw || T7.TIPA_L.bw });
    if (v.eyeK) L.e1 = Object.assign({}, L.e1, { rx: L.e1.rx * v.eyeK, ry: L.e1.ry * v.eyeK }), L.e2 = Object.assign({}, L.e2, { rx: L.e2.rx * v.eyeK, ry: L.e2.ry * v.eyeK });
    s += T7.face(st, L);
    return s + '</g>';
  };

  /* ---------------- SAND GRAIN from the Nile ---------------- */
  T7.GRAIN_L = { e1: { x: 128, y: 160, rx: 19, ry: 24 }, e2: { x: 176, y: 158, rx: 21, ry: 26 }, mo: { x: 154, y: 210, w: 44, teeth: 7 }, bw: 8, sweat: [214, 112], spark: [[70, 90, 12], [236, 92, 10]] };
  T7.GRAIN_D = K.scallop([[80, 150], [96, 100], [146, 82], [206, 92], [232, 140], [236, 204], [210, 250], [150, 262], [94, 248], [72, 204]], [0.22, 0.18, 0.2, 0.24, 0.16, 0.2, 0.18, 0.22, 0.2, 0.16]);
  T7.grain = function (st) {
    const COL = '#e9c987', TINT = '#d1b4a4';
    let s = '<ellipse cx="152" cy="272" rx="84" ry="9" fill="#000" opacity=".12"/>';
    let inner = '';
    for (const [x, y, r, c] of [[104, 120, 4, '#c79a58'], [210, 120, 3.5, '#c79a58'], [100, 216, 4, '#fff6dc'], [214, 222, 3, '#c79a58'], [158, 240, 3, '#fff6dc'], [196, 98, 3, '#fff6dc']]) inner += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
    s += mass([P(T7.GRAIN_D, COL)], { tint: TINT, light: [-10, -8], inner, lines: taper([100, 128], [114, 100], [140, 92], 1, 6, 1, '#fff3d0') });
    s += T7.face(st, Object.assign({ lid: COL }, T7.GRAIN_L));
    return s;
  };

  /* ---------------- FISH (3/4, facing right) ---------------- */
  T7.FISH_L = { e1: { x: 188, y: 138, rx: 13, ry: 17, prk: 0.95 }, e2: { x: 220, y: 136, rx: 18, ry: 22 }, mo: { x: 236, y: 186, w: 30, teeth: 5, rot: -6 }, bw: 6.5, sweat: [250, 96], spark: [[150, 70, 10]] };
  T7.fish = function (st) {
    const BODY = '#4f9fe0', BELLY = '#ffd45a', FIN = '#f08a3c', TINT = '#aab0d8';
    const sw = st.swim || 0;
    let s = '';
    const tail = P(`M84 156C60 ${120 + sw * 10} 40 ${96 + sw * 14} 28 ${104 + sw * 12}C42 136 42 172 28 ${206 + sw * 12}C44 ${214 + sw * 14} 64 ${194 + sw * 10} 84 166Z`, FIN);
    const dorsal = P('M120 104C136 64 196 66 214 98Z', FIN);
    const body = P('M80 160C80 112 140 86 196 90C246 94 270 130 268 164C266 200 238 226 190 228C136 230 80 208 80 160Z', BODY);
    const fin2 = P('M150 200C150 230 168 246 184 244C186 226 178 210 164 198Z', FIN);
    const inner = `<path d="M84 176C120 214 200 232 266 176L270 240L80 240Z" fill="${BELLY}"/>` +
      `<path d="M128 96C138 130 138 196 124 222L110 214C122 186 122 126 112 100Z" fill="#ffffff" opacity=".9"/>`;
    s += mass([tail, dorsal, fin2, body], { tint: TINT, light: [-10, -8], inner, lines: taper([160, 150], [176, 170], [168, 196], 1, 4, 1) + taper([46, 130], [56, 156], [46, 182], 0.5, 2.6, 0.5, '#c86a2a') });
    s += T7.face(st, Object.assign({ lid: BODY }, T7.FISH_L));
    return s;
  };

  /* ---------------- SEAGULL (3/4, facing right) ---------------- */
  T7.GULL_L = { e1: { x: 168, y: 92, rx: 12, ry: 15, prk: 0.95 }, e2: { x: 196, y: 90, rx: 15, ry: 19 }, mo: { x: 230, y: 124, w: 18, teeth: 0 }, bw: 6, browCol: '#5d6470' };
  T7.gull = function (st) {
    const W = '#fbfbf7', G = '#a9b4c2', Y = '#f6c23a', O = '#ef8a3a', TINT = '#c3c3d6';
    const flap = st.flap || 0;
    let s = '<ellipse cx="150" cy="282" rx="70" ry="8" fill="#000" opacity=".12"/>';
    s += mass([P('M128 232L122 272L104 280L132 280L140 236Z', O), P('M164 232L166 272L150 280L178 280L176 234Z', O)], { tint: '#d4a8a0', light: [4, -4] });
    const body = P('M84 196C70 150 120 128 170 136C212 140 230 178 214 210C198 240 120 248 84 196Z', W);
    const tailp = P('M90 184L40 170L50 196L92 206Z', G);
    const head = P('M146 96C140 58 186 44 210 64C228 80 226 112 210 130C196 146 160 146 146 96Z', W);
    s += mass([tailp, body, head], { tint: TINT, light: [-8, -8] });
    if (flap > 0.3) s += mass([P('M150 150C120 90 70 60 30 56C50 90 90 130 130 176Z', G)], { tint: '#b9b2cf', light: [-6, -6], inner: '<path d="M30 56C40 66 52 76 62 84L50 92C44 80 36 68 30 56Z" fill="#454b56"/>' });
    else s += mass([P('M120 160C130 120 180 130 200 170C180 214 130 214 108 200Z', G)], { tint: '#b9b2cf', light: [-6, -6], inner: '<path d="M108 200C130 214 180 214 200 170L200 196L104 214Z" fill="#454b56"/>' });
    const op = st.talk ? ({ A: 1, O: 0.8, E: 0.5, X: 0.2 }[st.talk] || 0) : (st.expr === 'surprised' || st.expr === 'cheering' ? 0.9 : st.expr === 'happy' ? 0.35 : 0);
    s += mass([P(`M214 118C232 ${120 + op * 6} 248 ${124 + op * 14} 256 ${128 + op * 20}C244 ${134 + op * 18} 228 ${134 + op * 10} 214 130Z`, Y)], { tint: '#d9b07a', light: [3, -3] });
    if (op > 0.05) s += `<path d="M216 120L250 ${120 + op * 10}L216 ${124 + op * 6}Z" fill="#5a1618"/>`;
    s += mass([P('M214 100C236 98 254 104 264 114C252 120 232 122 214 120Z', Y)], { tint: '#d9b07a', light: [4, -3], lines: `<circle cx="252" cy="116" r="3" fill="#e2483a"/>` });
    s += T7.face(st, Object.assign({ lid: W }, T7.GULL_L, { mo: { x: 236, y: 120, w: 0.01, teeth: 0 } }));
    return s;
  };

  /* ---------------- CRAB (front) ---------------- */
  T7.CRAB_L = { e1: { x: 118, y: 92, rx: 17, ry: 21 }, e2: { x: 182, y: 92, rx: 17, ry: 21 }, mo: { x: 150, y: 196, w: 46, teeth: 6 }, bw: 7, sweat: [222, 150], spark: [[60, 60, 11], [244, 60, 11]] };
  T7.crab = function (st) {
    const R = '#e8573a', RD = '#c13f2a', TINT = '#d9a7b0', up = st.arms === 'up' ? 1 : 0;
    let s = '<ellipse cx="150" cy="270" rx="104" ry="10" fill="#000" opacity=".12"/>';
    const legs = [];
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const x0 = 150 + sd * (64 + i * 4), y0 = 196 + i * 12; legs.push(P(`M${x0} ${y0}L${x0 + sd * 46} ${y0 + 18 + i * 4}L${x0 + sd * 54} ${y0 + 46 + i * 6}L${x0 + sd * 42} ${y0 + 46 + i * 6}L${x0 + sd * 36} ${y0 + 26 + i * 4}L${x0} ${y0 + 12}Z`, RD)); }
    s += mass(legs, { tint: TINT, light: [-4, -4] });
    const arms = [];
    for (const sd of [-1, 1]) {
      const cy = up ? 70 : 140, cx = 150 + sd * 116;
      arms.push(P(`M${150 + sd * 70} 176L${cx - sd * 6} ${cy + 30}L${cx + sd * 6} ${cy + 40}L${150 + sd * 76} 192Z`, R));
      arms.push(P(`M${cx - 26} ${cy}C${cx - 30} ${cy - 30} ${cx + 30} ${cy - 34} ${cx + 28} ${cy + 4}C${cx + 26} ${cy + 34} ${cx - 22} ${cy + 36} ${cx - 26} ${cy}Z`, R));
    }
    s += mass(arms, { tint: TINT, light: [-6, -6], lines: [-1, 1].map(sd => { const cy = up ? 70 : 140, cx = 150 + sd * 116; return taper([cx - 20, cy - 4], [cx, cy - 12], [cx + 22, cy - 8], 1, 5, 1); }).join('') });
    const stalks = [P('M112 150L108 104L124 104L126 150Z', R), P('M174 150L176 104L192 104L188 150Z', R)];
    const body = P('M52 176C52 120 248 120 248 176C248 230 52 230 52 176Z', R);
    s += mass([...stalks, body], { tint: TINT, light: [-10, -8], lines: taper([84, 150], [110, 134], [140, 130], 1, 6, 1, '#ffb59e') + [100, 150, 200].map(x => `<circle cx="${x}" cy="${x === 150 ? 214 : 206}" r="4" fill="${RD}"/>`).join('') });
    s += mass([P(e2p(118, 92, 24, 27), R), P(e2p(182, 92, 24, 27), R)], { tint: TINT, light: [-4, -4] });
    s += T7.face(st, Object.assign({ lid: R }, T7.CRAB_L));
    return s;
  };

  /* ---------------- WIND GUST (cloud puff blowing to the right) ---------------- */
  T7.GUST_L = { e1: { x: 168, y: 128, rx: 16, ry: 20 }, e2: { x: 210, y: 126, rx: 18, ry: 22 }, mo: { x: 238, y: 176, w: 30, teeth: 0 }, bw: 7.5 };
  T7.gust = function (st) {
    const C = '#eaf5fd', TINT = '#b8c6e2', blow = st.blow == null ? 1 : st.blow;
    let s = '';
    for (let i = 0; i < 3; i++) { const y = 150 + (i - 1) * 46; s += taper([20 + i * 10, y + 10], [50, y - 10 - i * 6], [96, y], 1, 6, 1, '#9dc4e2'); }
    const puff = P(K.scallop([[70, 150], [96, 92], [160, 66], [226, 78], [262, 128], [254, 196], [206, 230], [130, 228], [80, 206]], [0.34, 0.3, 0.32, 0.3, 0.28, 0.32, 0.3, 0.34, 0.3]), C);
    const cheek = `<ellipse cx="226" cy="172" rx="${18 + 8 * blow}" ry="${14 + 6 * blow}" fill="#f7c6cf" opacity=".7"/>`;
    s += mass([puff], { tint: TINT, light: [-10, -8], inner: cheek, lines: taper([92, 160], [118, 196], [160, 206], 1, 4, 1, '#c5d6ea') });
    const F = Object.assign({}, st, st.talk ? {} : { mo: { open: 0.34 + 0.34 * blow, round: 1, smile: 0 } });
    s += T7.face(F, Object.assign({ lid: C }, T7.GUST_L));
    for (let i = 0; i < 3; i++) { const y = 160 + (i - 1) * 26; s += line(`M252 ${y}Q${272 + i * 4} ${y - 8} ${292} ${y + 2}`, 4, '#7fb2d8'); }
    return s;
  };

  for (const [n, f] of [['tipa', st => T7.tipa(st)], ['grain', T7.grain], ['fish', T7.fish], ['gull', T7.gull], ['crab', T7.crab], ['gust', T7.gust]]) K.def('sea', n, EXPR, f);
})();
