// מריונטה: דמות עם שלד ומפרקים, הצללה, הבעות פנים ותנועה משנית.
//   הסצנה מחזירה "תנוחה גולמית" לכל רגע (rawPose(t)).
//   MARIONETTE.Sim מריץ עליה קפיצים דטרמיניסטיים: הזקן, הפאות ושולי המעיל נגררים אחרי הגוף,
//   והידיים ממשיכות קצת אחרי שהתנועה נעצרה (overshoot) — בלי שעון אמיתי, רק פונקציה של הזמן.
//   MARIONETTE.draw מצייר.
// קואורדינטות הדמות: 0,0 = הקרקע מתחת לאגן; y שלילי = למעלה. גובה כולל ~560 ביחידות.
// צד A = היד/הרגל שבצד שמאל של המסך, B = צד ימין. turn/look: שלילי = פונה שמאלה, חיובי = ימינה.
(function () {
'use strict';
const PI = Math.PI, D = PI / 180;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
const V = (x, y) => ({ x, y });
const add = (a, b) => V(a.x + b.x, a.y + b.y), sub = (a, b) => V(a.x - b.x, a.y - b.y), mul = (a, k) => V(a.x * k, a.y * k);
const rot = (v, a) => V(v.x * Math.cos(a) - v.y * Math.sin(a), v.x * Math.sin(a) + v.y * Math.cos(a));
const polar = (a, l) => V(Math.cos(a) * l, Math.sin(a) * l);
const len = v => Math.hypot(v.x, v.y), norm = v => { const l = len(v) || 1; return V(v.x / l, v.y / l); };
const perp = v => V(-v.y, v.x), dot = (a, b) => a.x * b.x + a.y * b.y;

// ---------- מסלולי זמן ----------
const EASE = {
  lin: x => x,
  io: x => x * x * (3 - 2 * x),
  io5: x => x < .5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2,
  out: x => 1 - Math.pow(1 - x, 3),
  in: x => x * x * x,
  back: x => { const k = 1.9; x -= 1; return 1 + (k + 1) * x * x * x + k * x * x; },
  step: x => x < 1 ? 0 : 1,
};
// [[זמן, ערך, הקלה], ...] — ההקלה של נקודה חלה על הקטע שמגיע אליה
function track(keys) {
  return t => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const k1 = keys[i];
      if (t <= k1[0]) {
        const k0 = keys[i - 1], f = EASE[k1[2] || 'io'];
        return k0[1] + (k1[1] - k0[1]) * f((t - k0[0]) / (k1[0] - k0[0]));
      }
    }
    return keys[keys.length - 1][1];
  };
}
// ערך בדיד (מחרוזת/מספר) לפי זמן: [[זמן, ערך], ...]
function steps(keys) { return t => { let v = keys[0][1]; for (const k of keys) if (t >= k[0]) v = k[1]; return v; }; }

// ---------- צבעים ותאורה ----------
const LIGHT = V(-0.82, -0.57);   // כיוון האור: חלון משמאל-למעלה
const PAL = {
  skin:   { base: '#f1c7a1', shadow: '#d69c79', rim: '#ffe0c2', line: '#9c634a', hi: 'rgba(255,244,222,.75)' },
  coat:   { base: '#2b3040', shadow: '#191c27', rim: '#8197c9', line: '#0b0d14', hi: 'rgba(255,212,160,.42)' },
  coatF:  { base: '#222633', shadow: '#14161e', rim: '#5b6d98', line: '#08090e' },
  lapel:  { base: '#323849', shadow: '#1d212c', line: '#0b0d14' },
  hat:    { base: '#1d1e25', shadow: '#0c0d11', rim: '#7184b0', line: '#050507', hi: 'rgba(255,212,160,.38)' },
  beard:  { base: '#4c3527', shadow: '#2f2119', rim: '#a8846a', line: '#22170f', hi: 'rgba(255,205,150,.4)' },
  shirt:  { base: '#f6f2e9', shadow: '#cfc6b6', line: '#958b7b' },
  pants:  { base: '#20222b', shadow: '#121319', rim: '#5d6c93', line: '#07080b', hi: 'rgba(255,212,160,.3)' },
  pantsF: { base: '#1a1b22', shadow: '#0e0f13', rim: '#454f6c', line: '#050506' },
  shoe:   { base: '#16161b', shadow: '#070709', rim: '#8d9cbd', line: '#000000', hi: 'rgba(255,220,170,.4)' },
};

// חלק מוצל: בסיס, "חרמש" צל בצד הרחוק מהאור, פס אור אחורי דק, וקו מתאר בגוון כהה של אותו צבע.
// ang = הסיבוב המקומי ביחס לעולם, כדי שכיוון האור יישאר קבוע גם בראש מוטה או ביד מסובבת.
function part(g, P, c, o) {
  o = o || {};
  const a = -(o.ang || 0), sh = o.sh === undefined ? 7 : o.sh, rm = o.rm === undefined ? 2.6 : o.rm;
  const s = rot(mul(LIGHT, sh), a), r = rot(V(LIGHT.x * rm, LIGHT.y * rm * .35), a);
  g.fillStyle = c.base; g.fill(P);
  if (sh > 0) {
    g.save(); g.clip(P);
    if (c.rim && rm > 0) { g.fillStyle = c.rim; g.fill(P); g.translate(r.x, r.y); g.fillStyle = c.shadow; g.fill(P); g.translate(-r.x, -r.y); }
    else { g.fillStyle = c.shadow; g.fill(P); }
    g.translate(s.x, s.y); g.fillStyle = c.base; g.fill(P);
    g.restore();
  }
  // נפח: מעבר צבע עדין לאורך כיוון האור (במקום צבע שטוח)
  if (o.vol) {
    const L = rot(LIGHT, a), c0 = o.vol.c, R = o.vol.r;
    const gr = g.createLinearGradient(c0.x + L.x * R, c0.y + L.y * R, c0.x - L.x * R, c0.y - L.y * R);
    gr.addColorStop(0, 'rgba(255,244,228,.16)'); gr.addColorStop(.5, 'rgba(255,244,228,0)'); gr.addColorStop(1, 'rgba(8,4,0,.2)');
    g.fillStyle = gr; g.fill(P);
  }
  // אור חלון חם על הקצה הפונה לחלון: מה שבצורה ואינו בצורה המוזזת הרחק מהאור
  if (c.hi && o.hi !== 0) {
    const d = rot(mul(LIGHT, -(o.hi || 2.4)), a), Q = new Path2D();
    Q.addPath(P); Q.addPath(P, new DOMMatrix().translate(d.x, d.y));
    g.save(); g.clip(P); g.fillStyle = c.hi; g.fill(Q, 'evenodd'); g.restore();
  }
  if (c.line) { g.strokeStyle = c.line; g.lineWidth = o.lw || 2.2; g.lineJoin = 'round'; g.stroke(P); }
}

// מסלול חלק דרך נקודות (Catmull-Rom). נקודה עם c:1 = פינה חדה.
function smoothPath(pts, closed, P) {
  P = P || new Path2D();
  const n = pts.length, at = i => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  const tan = i => { const p = at(i); if (p.c) return V(0, 0); return mul(sub(at(i + 1), at(i - 1)), 1 / 6); };
  P.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p1 = at(i), p2 = at(i + 1), t1 = tan(i), t2 = tan(i + 1);
    P.bezierCurveTo(p1.x + t1.x, p1.y + t1.y, p2.x - t2.x, p2.y - t2.y, p2.x, p2.y);
  }
  if (closed) P.closePath();
  return P;
}

// איבר: שני מקטעים (כתף-מרפק-שורש כף יד, או ירך-ברך-קרסול) כצורה אחת שמתחדדת, עם קצה עגול למעלה
function limbPath(a, b, c, wa, wb, wc) {
  const n1 = perp(norm(sub(b, a))), n2 = perp(norm(sub(c, b)));
  const nb = norm(add(n1, n2)), k = Math.max(.45, dot(nb, n1)), mb = mul(nb, wb / k);
  const P = new Path2D();
  P.moveTo(a.x + n1.x * wa, a.y + n1.y * wa);
  P.quadraticCurveTo(b.x + mb.x, b.y + mb.y, c.x + n2.x * wc, c.y + n2.y * wc);
  P.lineTo(c.x - n2.x * wc, c.y - n2.y * wc);
  P.quadraticCurveTo(b.x - mb.x, b.y - mb.y, a.x - n1.x * wa, a.y - n1.y * wa);
  const an = Math.atan2(n1.y, n1.x);
  P.arc(a.x, a.y, wa, an + PI, an, true);
  P.closePath();
  return P;
}
function capsule(P, a, b, w) {
  const n = mul(perp(norm(sub(b, a))), w), an = Math.atan2(n.y, n.x);
  P.moveTo(a.x + n.x, a.y + n.y); P.lineTo(b.x + n.x, b.y + n.y);
  P.arc(b.x, b.y, w, an, an + PI, false);
  P.lineTo(a.x - n.x, a.y - n.y);
  P.arc(a.x, a.y, w, an + PI, an, false);
  P.closePath();
  return P;
}

// IK של שני מקטעים. bend = 1/-1 בוחר לאיזה צד המפרק מתכופף.
function ik2(a, t, l1, l2, bend) {
  const d = sub(t, a), dist = clamp(len(d), Math.abs(l1 - l2) + .01, l1 + l2 - .01), ang = Math.atan2(d.y, d.x);
  const A = Math.acos(clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1));
  return { j: add(a, polar(ang + bend * A, l1)), e: add(a, polar(ang, dist)) };
}

// ---------- דיבור: צורות הגייה (זהות לאלה של people_lipsync.js ו-Rhubarb) ----------
const VISEME = {
  X: { open: 0, wide: 0, round: 0, teeth: 0, tongue: 0 },     // מנוחה
  A: { open: 0, wide: 0, round: 0, teeth: 0, tongue: 0 },     // מ, ב, פ — שפתיים סגורות
  B: { open: .22, wide: .6, round: 0, teeth: 1, tongue: 0 },  // ק, ס, ט
  C: { open: .55, wide: .3, round: 0, teeth: .8, tongue: .5 },// אֶ
  D: { open: 1, wide: .2, round: 0, teeth: .6, tongue: .9 },  // אָ פתוח
  E: { open: .6, wide: 0, round: .5, teeth: .3, tongue: .5 }, // אוֹ
  F: { open: .35, wide: 0, round: 1, teeth: 0, tongue: 0 },   // אוּ
  G: { open: .2, wide: .3, round: 0, teeth: 1, tongue: 0 },   // פ רפה, ו
  H: { open: .5, wide: .2, round: 0, teeth: .5, tongue: 1 },  // ל
};
// צורת הפה ברגע t, עם מעבר חלק (smoothstep) מהצורה הקודמת. cues = פלט tools/lipsync.py
function mouthAt(cues, t, blend) {
  blend = blend || .07; const i = cues.findIndex(c => t >= c.start && t < c.end);
  if (i < 0) return VISEME.X;
  const cur = VISEME[cues[i].value] || VISEME.X, prev = VISEME[(cues[i - 1] || {}).value] || VISEME.X;
  const k = Math.min(1, (t - cues[i].start) / blend), e = k * k * (3 - 2 * k), o = {};
  for (const key in cur) o[key] = prev[key] + (cur[key] - prev[key]) * e;
  return o;
}

// ---------- שלד מתוך תנוחה ----------
const ARM_U = 70, ARM_F = 64, THIGH = 106, SHIN = 104, HEAD_R = 46, HS = 1.12, HEM_Y = -94;
function solve(p) {
  const s = {}, turn = p.turn || 0, at = Math.abs(turn), ft = turn >= 0 ? 1 : -1;
  const lean = p.lean || 0, br = p.breath || 0;
  const P = V(p.hipX || 0, -210 + (p.lift || 0));
  const up = v => add(P, rot(v, lean));
  const w = 50 * (1 - .26 * at), cs = turn * 13;
  Object.assign(s, { P, up, w, cs, turn, at, ft, lean });
  s.far = at > .22 ? (turn > 0 ? 'B' : 'A') : null;
  s.N = up(V(cs * .3, -170 - br * 1.6));
  s.sh = { A: up(V(-w + 9 + cs * .25, -153 - br * 2.2)), B: up(V(w - 9 + cs * .25, -153 - br * 2.2)) };
  s.arm = {};
  for (const k of ['A', 'B']) {
    const a = p.arms[k], S0 = s.sh[k], E = add(S0, polar(a.u, ARM_U)), W = add(E, polar(a.u + a.e, ARM_F));
    s.arm[k] = { S: S0, E, W, ang: a.u + a.e + (a.w || 0), hand: a.hand || 'relax', flip: a.flip || 1, thumbUp: a.thumbUp };
  }
  s.leg = {};
  for (const k of ['A', 'B']) {
    const sd = k === 'A' ? -1 : 1, H = add(P, V(sd * 15 * (1 - .45 * at) + turn * 3, 4)), F = p.feet[k];
    const r = ik2(H, F, THIGH, SHIN, -ft);
    s.leg[k] = { H, K: r.j, F: r.e, a: F.a || 0 };
  }
  s.headAng = (p.tilt || 0) + lean * .55;
  s.neckTop = add(s.N, rot(V(0, -12), lean));
  s.H = add(s.neckTop, rot(V(0, (-44 + (p.nod || 0) * 2) * HS), s.headAng));
  s.look = clamp(p.look || 0, -1, 1);
  const hw = v => add(s.H, rot(mul(v, HS), s.headAng));
  const yk = s.look * .75;
  s.anchor = {
    beard: hw(V(HEAD_R * Math.sin(yk) * .8, 92)),
    peyaA: hw(V(yawX(-38, yk).x + 2, 58)),
    peyaB: hw(V(yawX(38, yk).x - 2, 58)),
    hem: V(P.x, HEM_Y),
  };
  return s;
}
function yawX(x, yk) {
  const phi = Math.asin(clamp(x / HEAD_R, -1, 1)) + yk, c = clamp(phi, -PI / 2, PI / 2);
  return { x: HEAD_R * Math.sin(c), c: Math.cos(c), vis: Math.abs(phi) < PI / 2 - .12, phi };
}

// ---------- קפיצים: תנועה משנית ----------
// כל קפיץ "רודף" אחרי עוגן. כשהגוף נעצר, הקפיץ ממשיך, עובר את המטרה וחוזר — זה ה-follow-through.
class Sim {
  constructor(rawPose) { this.raw = rawPose; this.dt = 1 / 240; this.t = null; }
  _targets(t) {
    const p = this.raw(t), s = solve(p), W = v => V(p.x + v.x * p.sc, p.y + v.y * p.sc), tg = {};
    for (const k of ['A', 'B']) { const a = p.arms[k]; tg['u' + k] = a.u; tg['e' + k] = a.e; tg['w' + k] = a.w || 0; }
    for (const k in s.anchor) tg[k] = W(s.anchor[k]);
    return tg;
  }
  _init(t) {
    const tg = this._targets(t); this.t = t; this.st = {};
    for (const k in tg) this.st[k] = typeof tg[k] === 'number' ? { p: tg[k], v: 0 } : { p: V(tg[k].x, tg[k].y), v: V(0, 0) };
  }
  static K = { uA: [320, 23], eA: [300, 21], wA: [130, 9], uB: [320, 23], eB: [300, 21], wB: [130, 9],
               beard: [150, 9], peyaA: [95, 5.5], peyaB: [95, 5.5], hem: [70, 8] };
  at(t) {
    if (this.t === null || t < this.t - 1e-9) this._init(Math.min(t, 0));
    while (this.t < t - 1e-9) {
      const h = Math.min(this.dt, t - this.t); this.t += h;
      const tg = this._targets(this.t);
      for (const k in tg) {
        const st = this.st[k], [kk, c] = Sim.K[k];
        if (typeof tg[k] === 'number') { st.v += (kk * (tg[k] - st.p) - c * st.v) * h; st.p += st.v * h; }
        else {
          st.v.x += (kk * (tg[k].x - st.p.x) - c * st.v.x) * h; st.v.y += (kk * (tg[k].y - st.p.y) - c * st.v.y) * h;
          st.p.x += st.v.x * h; st.p.y += st.v.y * h;
        }
      }
    }
    const p = this.raw(t), s = solve(p), out = JSON.parse(JSON.stringify(p));
    for (const k of ['A', 'B']) { out.arms[k].u = this.st['u' + k].p; out.arms[k].e = this.st['e' + k].p; out.arms[k].w = this.st['w' + k].p; }
    const off = (k, lim) => {
      const a = s.anchor[k], cur = this.st[k].p, d = V((cur.x - p.x) / p.sc - a.x, (cur.y - p.y) / p.sc - a.y), l = len(d);
      return l > lim ? mul(d, lim / l) : d;
    };
    out.sec = { beard: off('beard', 16), peyaA: off('peyaA', 18), peyaB: off('peyaB', 18), hem: off('hem', 26) };
    return out;
  }
}

// ---------- ציור ----------
function drawLeg(g, L, far, s) {
  const pal = far ? PAL.pantsF : PAL.pants;
  part(g, limbPath(L.H, L.K, L.F, 18, 14.5, 11.5), pal, { sh: 6, vol: { c: L.K, r: 60 } });
  drawShoe(g, L.F, L.a, s, far);
}
function drawShoe(g, F, a, s, far) {
  const d = s.turn >= 0 ? 1 : -1, Lh = 12 + 30 * s.at;
  g.save(); g.translate(F.x, F.y); g.rotate(a);
  const pts = [V(-9 * d, -5), V(-13 * d, 7), V(-10 * d, 14, 1), V((Lh - 3) * d, 14), V((Lh + 1) * d, 9), V((Lh - 7) * d, 1), V(5 * d, -6)];
  pts[2].c = 1;
  const P = smoothPath(pts, true);
  part(g, P, PAL.shoe, { ang: a, sh: 4, rm: 2 });
  g.fillStyle = far ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.13)';
  g.beginPath(); g.ellipse((Lh - 6) * d, 4, 5, 2.2, -.3 * d, 0, 2 * PI); g.fill();
  g.restore();
}

function drawCoat(g, s, sec) {
  const { P, up, w, cs } = s;
  const spread = Math.abs(s.leg.A.F.x - s.leg.B.F.x), hh = 55 + Math.max(0, spread - 26) * .3;
  const hx = P.x + sec.hem.x, hy = HEM_Y + Math.min(0, sec.hem.y) * .3;
  const sw = sec.hem.x * .25;
  const pts = [
    up(V(-17 + cs, -171)), up(V(-w + 4, -163)), up(V(-w - 3, -140)), up(V(-w - 2, -100)), up(V(-w + 5, -40)),
    V(hx - hh - sw, hy - 4), V(hx - hh * .45, hy + 3), V(hx + cs * .5, hy + 2), V(hx + hh * .45, hy + 3), V(hx + hh - sw, hy - 4),
    up(V(w - 5, -40)), up(V(w + 2, -100)), up(V(w + 3, -140)), up(V(w - 4, -163)), up(V(17 + cs, -171)),
  ];
  pts[5].c = pts[9].c = pts[0].c = pts[14].c = 1;
  const C = smoothPath(pts, true);
  const grd = g.createLinearGradient(P.x - w, 0, P.x + w, 0);
  grd.addColorStop(0, '#323848'); grd.addColorStop(1, PAL.coat.base);
  part(g, C, { ...PAL.coat, base: grd }, { sh: 10, rm: 3, hi: 3, vol: { c: up(V(0, -90)), r: 110 } });
  // חולצה וצווארון
  const vp = up(V(cs * .9, -112)), nl = up(V(-15 + cs, -170)), nr = up(V(15 + cs, -170));
  const S = new Path2D(); S.moveTo(nl.x, nl.y); S.lineTo(nr.x, nr.y); S.lineTo(vp.x, vp.y); S.closePath();
  part(g, S, PAL.shirt, { sh: 4 });
  for (const sd of [-1, 1]) {
    const L = new Path2D(), a = up(V(sd * 15 + cs, -171)), b = up(V(sd * 3 + cs, -158)), c = up(V(sd * 9 + cs, -150));
    L.moveTo(a.x, a.y); L.lineTo(b.x, b.y); L.lineTo(c.x, c.y); L.closePath();
    part(g, L, PAL.shirt, { sh: 2, lw: 1.6 });
  }
  for (const sd of [-1, 1]) {
    const L = new Path2D(), a = up(V(sd * 17 + cs, -171)), b = up(V(sd * 33 + cs * .9, -148)), c = up(V(sd * 21 + cs * .9, -138)), d = vp;
    L.moveTo(a.x, a.y); L.lineTo(b.x, b.y); L.lineTo(c.x, c.y); L.lineTo(d.x, d.y); L.closePath();
    part(g, L, PAL.lapel, { sh: 4, rm: 0 });
  }
  // קו סגירה וכפתורים
  g.strokeStyle = 'rgba(5,6,10,.85)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(vp.x, vp.y);
  const mid = up(V(cs * .9, -40)); g.quadraticCurveTo(mid.x, mid.y, hx + cs * .5, hy + 2); g.stroke();
  for (const by of [-92, -62]) {
    const b = up(V(cs * .9 + 6, by));
    g.fillStyle = '#0c0d12'; g.beginPath(); g.arc(b.x, b.y, 3.6, 0, 2 * PI); g.fill();
    g.fillStyle = 'rgba(160,180,220,.45)'; g.beginPath(); g.arc(b.x - 1, b.y - 1.2, 1.3, 0, 2 * PI); g.fill();
  }
}

function drawArm(g, s, k, far) {
  const a = s.arm[k], pal = far ? PAL.coatF : PAL.coat;
  // שרוול
  part(g, limbPath(a.S, a.E, a.W, 13, 11.5, 10.5), pal, { sh: 6, vol: { c: a.E, r: 55 } });
  // שרוול לבן ויד
  g.save(); g.translate(a.W.x, a.W.y); g.rotate(a.ang);
  const cuff = new Path2D(); cuff.roundRect(-5, -10.5, 8, 21, 3);
  part(g, cuff, PAL.shirt, { ang: a.ang, sh: 2, lw: 1.5 });
  g.translate(2, 0);
  g.scale(1.3, 1.3 * a.flip);
  drawHand(g, a.hand, a.ang, a.flip, a.thumbUp);
  g.restore();
}

// כף יד מקומית: +x לאורך האמה, האגודל לכיוון -y
function drawHand(g, pose, ang, flip, thumbUp) {
  const P = new Path2D(), o = { ang: flip < 0 ? -ang : ang, sh: 3.5, rm: 1.6, lw: 1.8 };
  if (pose === 'open') {
    // כף פתוחה כצורה אחת: ארבע אצבעות עם "עמקים" ביניהן, ואגודל בצד
    const F = [[.32, 15, 9], [.11, 19.5, 3.2], [-.1, 21, -3.2], [-.32, 18.5, -9]], pts = [V(0, 9.5), V(11, 12.5)];
    pts[0].c = 1;
    F.forEach(([an, L, y], i) => {
      const dir = polar(an, 1), n = perp(dir), base = V(17, y), tip = add(base, mul(dir, L));
      if (i === 0) pts.push(add(base, mul(n, 4.4)));
      pts.push(add(add(tip, mul(dir, -2.5)), mul(n, 3.7)), add(tip, mul(dir, 1.4)), add(add(tip, mul(dir, -2.5)), mul(n, -3.7)));
      if (i < 3) { const v = V(19, (y + F[i + 1][2]) / 2); v.c = 1; pts.push(v); }
      else pts.push(add(base, mul(n, -4.2)));
    });
    const tb = V(9, -10), td = polar(-1.2, 1), tn = perp(td), tt = add(tb, mul(td, 15));
    const vt = V(14, -11.5); vt.c = 1; pts.push(vt);
    pts.push(add(add(tt, mul(td, -2)), mul(tn, 4)), add(tt, mul(td, 1.5)), add(add(tt, mul(td, -2)), mul(tn, -4)), V(2, -9.5));
    smoothPath(pts, true, P);
    part(g, P, PAL.skin, o);
    g.strokeStyle = 'rgba(156,99,74,.55)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(7, 4); g.quadraticCurveTo(12, -1, 10, -6); g.stroke();
  } else if (pose === 'point') {
    P.roundRect(0, -11, 24, 22, 9);
    capsule(P, V(16, -6), V(44, -7), 3.9);
    part(g, P, PAL.skin, o);
    const T = capsule(new Path2D(), V(5, -9), V(17, -12), 3.8); part(g, T, PAL.skin, o);
    g.strokeStyle = PAL.skin.line; g.lineWidth = 1.3; g.beginPath();
    for (const y of [-1, 5]) { g.moveTo(15, y); g.lineTo(23, y); } g.stroke();
  } else if (pose === 'thumb') {
    // אגרוף עם אגודל עבה שמצביע למעלה בעולם (לא ביחס לאמה)
    P.roundRect(0, -12, 27, 25, 10);
    part(g, P, PAL.skin, o);
    g.strokeStyle = PAL.skin.line; g.lineWidth = 1.4; g.beginPath();
    for (const y of [-5, 1.5, 7.5]) { g.moveTo(15, y); g.quadraticCurveTo(22, y - 1, 26, y + 1); } g.stroke();
    const w = rot(V(0, -1), -ang * flip), up = V(w.x, w.y * flip), b = V(11, -9), n = perp(up), tip = add(b, mul(up, 17));
    const T = smoothPath([add(b, mul(n, 6.5)), add(add(tip, mul(up, -3)), mul(n, 5.6)), add(tip, mul(up, 2.6)), add(add(tip, mul(up, -3)), mul(n, -5.6)), add(b, mul(n, -6.5))], true);
    part(g, T, PAL.skin, o);
    g.fillStyle = 'rgba(255,236,220,.85)'; g.beginPath(); const nl = add(tip, mul(up, -2.5)); g.ellipse(nl.x, nl.y, 3, 3.6, Math.atan2(up.y, up.x), 0, 2 * PI); g.fill();
  } else {
    smoothPath([V(0, -10), V(14, -12), V(28, -7), V(32, 2), V(25, 10), V(10, 11), V(0, 9)], true, P);
    part(g, P, PAL.skin, o);
    const T = new Path2D(); T.ellipse(12, -10, 8, 4.5, .45, 0, 2 * PI); part(g, T, PAL.skin, o);
    g.strokeStyle = 'rgba(156,99,74,.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(22, -3); g.quadraticCurveTo(27, 1, 24, 6); g.stroke();
  }
}

function drawHead(g, s, f, sec) {
  const yk = s.look * .75, ny = (f.nod || 0) * 5, ang = s.headAng;
  const Y = x => yawX(x, yk);
  const hsq = f.headSquash || 0;
  g.save(); g.translate(s.H.x, s.H.y); g.rotate(ang); g.scale(HS * (1 - .05 * hsq), HS * (1 + .07 * hsq));
  // צוואר
  const nk = new Path2D(); nk.roundRect(-14 + Y(0).x * .2, 30, 28, 34, 6);
  part(g, nk, { ...PAL.skin, base: '#d9a888' }, { ang, sh: 4 });
  // אוזניים מאחור
  const ears = [-1, 1].map(sd => { const e = Y(sd * 45); return { sd, e, front: Math.abs(e.phi) < 1.2 }; });
  const ear = e => { const E = new Path2D(); E.ellipse(e.e.x, 4 + ny, 8 * Math.max(.45, 1 - e.e.c * .2), 13, 0, 0, 2 * PI);
    part(g, E, PAL.skin, { ang, sh: 3 }); g.strokeStyle = 'rgba(156,99,74,.6)'; g.lineWidth = 1.4; g.beginPath(); g.arc(e.e.x, 5 + ny, 4.5, -1.2, 1.4); g.stroke(); };
  ears.filter(e => !e.front && e.e.vis !== false).forEach(ear);
  // ראש
  const Hd = new Path2D(); Hd.ellipse(0, 0, HEAD_R + 2, 54, 0, 0, 2 * PI);
  const hg = g.createRadialGradient(-14, -14, 6, 0, 0, 62); hg.addColorStop(0, '#f8d5b3'); hg.addColorStop(1, PAL.skin.base);
  part(g, Hd, { ...PAL.skin, base: hg }, { ang, sh: 9, rm: 3 });
  g.save(); g.clip(Hd);
  // צל של שוליים הכובע על המצח
  const hs = g.createLinearGradient(0, -40, 0, -14); hs.addColorStop(0, 'rgba(80,40,25,.42)'); hs.addColorStop(1, 'rgba(80,40,25,0)');
  g.fillStyle = hs; g.fillRect(-60, -60, 120, 48);
  // סומק
  for (const sd of [-1, 1]) { const c = Y(sd * 27); if (!c.vis) continue;
    const bl = g.createRadialGradient(c.x, 14 + ny, 1, c.x, 14 + ny, 13); bl.addColorStop(0, `rgba(235,110,95,${.2 + (f.smile || 0) * .14})`); bl.addColorStop(1, 'rgba(235,110,95,0)');
    g.fillStyle = bl; g.fillRect(c.x - 14, ny, 28, 28); }
  g.restore();
  ears.filter(e => e.front && e.e.vis !== false && Math.abs(e.e.phi) < 1.2 && Math.abs(yk) > .15).forEach(ear);
  // זקן
  const bl = sec.beard, outer = [[-44, -8], [-47, 18], [-42, 46], [-27, 70]], inner = [[40, -5], [30, 9], [13, 17], [0, 19], [-13, 17], [-30, 9], [-40, -5]];
  const bp = [];
  outer.forEach(([x, y]) => bp.push(V(Y(x).x, y + ny * .6)));
  bp.push(V(Y(0).x * .85 + bl.x, 92 + ny * .4 + bl.y));
  outer.slice().reverse().forEach(([x, y], i) => { const q = V(Y(-x).x, y + ny * .6); if (i === 0) { q.x += bl.x * .45; q.y += bl.y * .3; } bp.push(q); });
  bp[3].x += bl.x * .45; bp[3].y += bl.y * .3;
  bp[0].c = 1; bp[bp.length - 1].c = 1;
  inner.forEach(([x, y]) => bp.push(V(Y(x).x, y + ny)));
  const B = smoothPath(bp, true);
  part(g, B, PAL.beard, { ang, sh: 7, rm: 2.4, vol: { c: V(Y(0).x, 40), r: 55 } });
  g.save(); g.clip(B); g.strokeStyle = 'rgba(25,15,10,.35)'; g.lineWidth = 1.6;
  for (let i = 0; i < 11; i++) { const x = -36 + i * 7.2, xx = Y(x).x; g.beginPath(); g.moveTo(xx, 24 + Math.abs(x) * .3 + ny); g.quadraticCurveTo(xx + 3, 52, xx * .7 + bl.x * .5, 82 + bl.y * .5); g.stroke(); }
  g.strokeStyle = 'rgba(190,150,120,.22)'; for (let i = 0; i < 6; i++) { const xx = Y(-30 + i * 9).x; g.beginPath(); g.moveTo(xx - 2, 30 + ny); g.quadraticCurveTo(xx, 50, xx * .8 - 3, 70); g.stroke(); }
  g.restore();
  // פה
  const mx = Y(0).x, my = 31 + ny, sm = f.smile || 0, op = f.open || 0, oo = f.o || 0;
  const mw = (14 + sm * 6 - oo * 7) * Math.max(.6, Y(0).c);
  const vm = f.mouth;
  if (vm && (vm.open > .04 || vm.round > .3)) {
    // צורת הגייה (viseme) מתוך סנכרון השפתיים
    const w = mw * (1 - .42 * vm.round) + vm.wide * 4, h = 2.5 + vm.open * 14 + vm.round * 3, cy = my + h * .35;
    const Mo = new Path2D(); Mo.ellipse(mx, cy, w, h, 0, 0, 2 * PI);
    g.fillStyle = '#4a1518'; g.fill(Mo);
    g.save(); g.clip(Mo);
    if (vm.tongue > 0) { g.fillStyle = `rgba(217,110,120,${vm.tongue})`; g.beginPath(); g.ellipse(mx, cy + h * .8, w * .7, h * .6, 0, 0, 2 * PI); g.fill(); }
    if (vm.teeth > 0) { g.fillStyle = `rgba(251,250,245,${vm.teeth})`; g.fillRect(mx - w, cy - h, 2 * w, h * .5); }
    g.restore();
    g.strokeStyle = '#6e2a22'; g.lineWidth = 1.8 + vm.round * 1.6; g.stroke(Mo);
  } else if (op > .04 || oo > .04) {
    const M = new Path2D(), h = 3 + op * 15 + oo * 9;
    if (oo > op) M.ellipse(mx, my + h * .3, mw * .55, h * .65, 0, 0, 2 * PI);
    else { M.moveTo(mx - mw, my - sm * 3); M.quadraticCurveTo(mx, my + 1, mx + mw, my - sm * 3); M.quadraticCurveTo(mx, my + h * 1.5, mx - mw, my - sm * 3); M.closePath(); }
    g.fillStyle = '#4a1518'; g.fill(M);
    g.save(); g.clip(M);
    g.fillStyle = '#d96e78'; g.beginPath(); g.ellipse(mx, my + h * 1.05, mw * .6, h * .45, 0, 0, 2 * PI); g.fill();
    g.fillStyle = '#fbfaf5'; g.fillRect(mx - mw, my - 6, mw * 2, 6.5 + (oo > op ? 0 : 0));
    g.restore();
    g.strokeStyle = '#6e2a22'; g.lineWidth = 1.8; g.stroke(M);
  } else {
    g.strokeStyle = '#6e2a22'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
    g.moveTo(mx - mw, my - sm * 5); g.quadraticCurveTo(mx, my + sm * 6 - 1, mx + mw, my - sm * 5); g.stroke();
  }
  // שפם
  const ms = new Path2D(), mt = Y(0).x;
  smoothPath([V(mt, 19 + ny), V(mt + 12 * Y(0).c, 20 + ny), V(Y(18).x, 28 + ny - sm * 3), V(Y(15).x, 31 + ny - sm * 3, 1),
              V(mt, 25 + ny), V(Y(-15).x, 31 + ny - sm * 3), V(Y(-18).x, 28 + ny - sm * 3), V(mt - 12 * Y(0).c, 20 + ny)], true, ms);
  part(g, ms, PAL.beard, { ang, sh: 3, rm: 1.5, lw: 1.6 });
  // אף
  const nx = Y(0).x, pr = 9 * Math.sin(yk);
  const Ns = smoothPath([V(nx - 2, -6 + ny), V(nx + pr * .6 + 6, 6 + ny), V(nx + pr + 7, 15 + ny), V(nx + pr, 19 + ny), V(nx - 7 + pr * .3, 17 + ny), V(nx - 8 + pr * .2, 11 + ny)], true);
  part(g, Ns, { ...PAL.skin, base: '#eab894' }, { ang, sh: 4, rm: 1.5, lw: 1.8 });
  g.fillStyle = 'rgba(255,240,225,.6)'; g.beginPath(); g.ellipse(nx + pr * .7 + 1, 8 + ny, 2, 3.5, -.3, 0, 2 * PI); g.fill();
  // עיניים, משקפיים, גבות
  const eyes = [-1, 1].map(sd => ({ sd, e: Y(sd * 18) }));
  const lookX = (f.px || 0) * 3.2 + s.look * 1.2, lookY = (f.py || 0) * 2.8;
  for (const { sd, e } of eyes) {
    if (!e.vis) continue;
    const ex = e.x, ey = -3 + ny, cw = Math.max(.35, e.c), open = clamp((f.eyeOpen === undefined ? 1 : f.eyeOpen) * (sd < 0 ? 1 - (f.wink || 0) : 1));
    const rx = 8.2 * cw * (1 + (f.wide || 0) * .12), ry = 9.6 * (1 + (f.wide || 0) * .18);
    const top = ey - ry + (1 - open) * ry * 2, bot = ey + ry - sm * 2.6 * open;
    if (open > .08) {
      g.save(); const E = new Path2D(); E.ellipse(ex, ey, rx, ry, 0, 0, 2 * PI); g.clip(E);
      g.beginPath(); g.rect(ex - rx - 2, top, rx * 2 + 4, Math.max(0, bot - top)); g.clip();
      g.fillStyle = '#fffdf8'; g.fill(E);
      const ix = ex + lookX * cw, iy = ey + lookY;
      g.fillStyle = '#4a2e1c'; g.beginPath(); g.ellipse(ix, iy, 5.4 * cw, 5.6, 0, 0, 2 * PI); g.fill();
      g.fillStyle = '#120a06'; g.beginPath(); g.ellipse(ix, iy, 2.8 * cw, 3, 0, 0, 2 * PI); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(ix - 1.8 * cw, iy - 2.2, 1.8, 0, 2 * PI); g.fill();
      g.beginPath(); g.arc(ix + 1.6 * cw, iy + 1.8, .8, 0, 2 * PI); g.fill();
      g.fillStyle = 'rgba(120,70,50,.18)'; g.fillRect(ex - rx, top, rx * 2, 3);
      g.restore();
    }
    // עפעף עליון — קו עבה שנותן הבעה
    g.strokeStyle = '#2b1a12'; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath();
    if (open > .08) { g.ellipse(ex, ey, rx, ry, 0, PI * 1.12, PI * 1.88); g.moveTo(ex, top); }
    else { g.moveTo(ex - rx, ey + 1); g.quadraticCurveTo(ex, ey + 5 + sm * 2, ex + rx, ey + 1); }
    g.stroke();
  }
  // משקפיים
  g.strokeStyle = '#2a211d'; g.lineWidth = 2.6;
  const lens = eyes.filter(q => q.e.vis);
  for (const { e } of lens) { g.beginPath(); g.ellipse(e.x, -2 + ny, 14 * Math.max(.35, e.c), 13, 0, 0, 2 * PI); g.stroke();
    g.save(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(e.x - 6 * e.c, -9 + ny); g.lineTo(e.x - 1 * e.c, -13 + ny); g.stroke(); g.restore(); }
  if (lens.length === 2) { g.beginPath(); g.moveTo(lens[0].e.x + 13 * lens[0].e.c, -4 + ny); g.quadraticCurveTo(nx, -9 + ny, lens[1].e.x - 13 * lens[1].e.c, -4 + ny); g.stroke(); }
  for (const er of ears.filter(e => e.e.vis !== false && Math.abs(e.e.phi) < 1.35 && Math.abs(yk) > .2)) {
    const ln = eyes.find(q => q.sd === er.sd && q.e.vis); if (!ln) continue;
    g.beginPath(); g.moveTo(ln.e.x + er.sd * 13 * ln.e.c, -4 + ny); g.lineTo(er.e.x, -2 + ny); g.stroke();
  }
  for (const { sd, e } of eyes) {
    if (!e.vis) continue;
    const up = ((f.browUp || 0) + (sd < 0 ? f.browA || 0 : f.browB || 0)) * 6, sad = (f.browSad || 0) * 5, cw = Math.max(.4, e.c);
    const inr = V(e.x - sd * 9 * cw, -21 - up + (f.browAngry || 0) * 4 - sad + ny), out = V(e.x + sd * 11 * cw, -22 - up * .8 + sad * .6 + ny);
    g.strokeStyle = PAL.beard.base; g.lineWidth = 5.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(inr.x, inr.y);
    g.quadraticCurveTo((inr.x + out.x) / 2, Math.min(inr.y, out.y) - 4, out.x, out.y); g.stroke();
  }
  // פאות — סלסול מתנדנד
  for (const sd of [-1, 1]) {
    const r = Y(sd * 40); if (!r.vis) continue;
    const o = sd < 0 ? sec.peyaA : sec.peyaB, root = V(r.x, -18), tip = V(r.x + sd * 2 + o.x, 58 + o.y);
    g.lineCap = 'round';
    for (const [col, wd] of [[PAL.beard.line, 7.5], [PAL.beard.base, 5], ['rgba(190,150,120,.55)', 1.6]]) {
      g.strokeStyle = col; g.lineWidth = wd; g.beginPath();
      for (let i = 0; i <= 28; i++) {
        const k = i / 28, base = V(lerp(root.x, tip.x, k * k * .4 + k * .6), lerp(root.y, tip.y, k)), amp = 1.5 + k * 5.5;
        const q = add(base, V(Math.sin(k * PI * 5) * amp * sd, Math.cos(k * PI * 5) * amp * .35));
        if (i === 0) g.moveTo(q.x, q.y); else g.lineTo(q.x, q.y);
      }
      g.stroke();
    }
  }
  // כובע
  const hx = HEAD_R * Math.sin(yk) * .12;
  const brimBack = new Path2D(); brimBack.ellipse(hx * .8, -33, 76, 13, 0, PI, 2 * PI);
  brimBack.lineTo(hx * .8 + 76, -33); brimBack.closePath();
  part(g, brimBack, PAL.hat, { ang, sh: 3, rm: 0 });
  const cp = [V(hx - 41, -34), V(hx - 44, -64), V(hx - 38, -92), V(hx - 22, -101), V(hx - 4, -93), V(hx + 6, -93), V(hx + 24, -101), V(hx + 40, -92), V(hx + 45, -64), V(hx + 42, -34)];
  cp[0].c = cp[cp.length - 1].c = 1;
  const Cr = smoothPath(cp, true);
  part(g, Cr, PAL.hat, { ang, sh: 9, rm: 3, hi: 3, vol: { c: V(hx, -66), r: 48 } });
  const band = new Path2D(); band.moveTo(hx - 42, -48); band.quadraticCurveTo(hx, -44, hx + 43, -48); band.lineTo(hx + 42, -35); band.quadraticCurveTo(hx, -31, hx - 41, -35); band.closePath();
  part(g, band, { base: '#2c2f3b', shadow: '#15161c', rim: '#8d9cc4', line: '#050507' }, { ang, sh: 4, rm: 1.6, lw: 1.4 });
  const brimF = new Path2D(); brimF.ellipse(hx * .8, -33, 76, 13, 0, 0, PI); brimF.closePath();
  part(g, brimF, PAL.hat, { ang, sh: 4, rm: 2 });
  g.strokeStyle = 'rgba(150,170,215,.35)'; g.lineWidth = 2; g.beginPath(); g.ellipse(hx * .8, -34, 74, 11.5, 0, PI * 1.05, PI * 1.6); g.stroke();
  g.restore();
}

// הדמות כולה. p = תנוחה אחרי Sim (כולל p.sec)
function draw(g, p) {
  const s = solve(p), sec = p.sec || { beard: V(0, 0), peyaA: V(0, 0), peyaB: V(0, 0), hem: V(0, 0) };
  // מתיחה ומעיכה: גובה ורוחב משתנים בכיוונים הפוכים (הנפח נשמר), סביב נקודת הקרקע
  const sq = p.squash || 0;
  g.save(); g.translate(p.x, p.y); g.scale(p.sc * (1 - .035 * sq), p.sc * (1 + .05 * sq));
  g.lineCap = 'round'; g.lineJoin = 'round';
  const order = s.far === 'B' ? ['B', 'A'] : ['A', 'B'];
  for (const k of order) drawLeg(g, s.leg[k], k === s.far, s);
  if (s.far) drawArm(g, s, s.far, true);
  drawCoat(g, s, sec);
  drawHead(g, s, p.face || {}, sec);
  for (const k of ['A', 'B']) if (k !== s.far) drawArm(g, s, k, false);
  g.restore();
  return s;
}

window.MARIONETTE = { Sim, solve, draw, track, steps, EASE, VISEME, mouthAt, ik2, PAL, LIGHT, part, smoothPath, V, add, sub, mul, rot, polar, clamp, lerp, D };
})();
