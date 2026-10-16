// בובת חיתוכים מאיורים: כל חלק הוא תמונה, וכל תנועה בקוד.
//   SPRITE_RIG.load(dir) -> Promise<rig>    (dir/rig.json + dir/parts/*.png, נבנה ב-tools/rig_build.py)
//   SPRITE_RIG.draw(g, rig, pose)
// pose = { x, y (נקודת הקרקע בין הרגליים), sc, lean, squash, breath,
//          head: { rot, nod, mouth: 'rest'|'ah'|'ee'|'oh'|'mm', blink: 0..1 },
//          arms: { A: { u, e, w, hand: 'rest'|'wave'|'point'|'thumb' }, B: {...} } }
// זוויות במעלות, בכיוון המסך: 0 = ימינה, 90 = למטה. A = הזרוע שבצד שמאל של המסך (יד ימין של הדמות).
(function () {
'use strict';
const D = Math.PI / 180;
const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });

async function load(dir) {
  const rig = await (await fetch(dir + '/rig.json')).json();
  rig.img = {};
  await Promise.all(Object.entries(rig.parts).map(async ([k, p]) => { rig.img[k] = await loadImg(dir + '/parts/' + p.img); }));
  const J = rig.joints;
  rig.ground = [J.neck[0], 1100];
  return rig;
}
// עם XHR כשהדף פתוח מקובץ מקומי (fetch לא עובד על file://)
function loadSync(dir) {
  return new Promise((res, rej) => {
    const x = new XMLHttpRequest(); x.open('GET', dir + '/rig.json'); x.onload = async () => {
      try {
        const rig = JSON.parse(x.responseText); rig.img = {};
        await Promise.all(Object.entries(rig.parts).map(async ([k, p]) => { rig.img[k] = await loadImg(dir + '/parts/' + p.img); }));
        rig.ground = [rig.joints.neck[0], 1100]; res(rig);
      } catch (e) { rej(e); }
    }; x.onerror = rej; x.send();
  });
}

const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]];

function piece(g, rig, key, at, ang, flip) {
  const p = rig.parts[key], im = rig.img[key];
  g.save(); g.translate(at[0], at[1]); g.rotate(ang);
  if (flip) g.scale(-1, 1);
  g.drawImage(im, -p.pivot[0], -p.pivot[1]);
  g.restore();
}

// stage: 'upper' = הזרוע העליונה (מצוירת מאחורי המעיל, כדי שהמעיל יכסה את החיבור בכתף);
//        'lower' = האמה וכף היד (מלפנים)
function drawArm(g, rig, side, a, stage) {
  const J = rig.joints, S = J['shoulder' + side], E0 = J['elbow' + side], W0 = J['wrist' + side];
  const rest = side === 'A' ? 180 : 0;
  const tu = (a.u - rest) * D, tf = (a.u + (a.e || 0) - rest) * D, th = (a.u + (a.e || 0) + (a.w || 0) - rest) * D;
  const E = add(S, rot(sub(E0, S), tu)), Wr = add(E, rot(sub(W0, E0), tf));
  if (stage === 'upper') { piece(g, rig, 'upper' + side, S, tu); return Wr; }
  piece(g, rig, 'fore' + side, E, tf);
  if ((!a.hand || a.hand === 'rest') && rig.parts.hand_relax) a = Object.assign({}, a, { hand: 'relax' });
  if (!a.hand || a.hand === 'rest') piece(g, rig, 'hand' + side, Wr, th);
  else {
    const p = rig.parts['hand_' + a.hand], im = rig.img['hand_' + a.hand], dirW = a.u + (a.e || 0) + (a.w || 0);
    // כף היד מסובבת כך שכיוון "חיבור->אצבעות" שלה ימשיך את האמה.
    // 'side': תמונת ראי בצד B (כדי שהאגודל יפנה פנימה). 'upright': ראי או לא — מה שמשאיר את התמונה הכי ישרה
    // (אחרת אגודל למעלה מתהפך לאגודל למטה).
    const norm = x => ((x + 540) % 360) - 180;
    const r1 = norm(dirW - p.dir), r2 = norm(dirW - (180 - p.dir));
    const flip = p.flip === 'upright' ? Math.abs(r2) < Math.abs(r1) : side === 'B';
    const ang = (flip ? r2 : r1) * D + (a.hrot || 0) * D;
    g.save(); g.translate(Wr[0], Wr[1]); g.rotate(ang); if (flip) g.scale(-1, 1);
    const s = (a.hscale || 1) * p.scale; g.scale(s, s); g.drawImage(im, -p.pivot[0], -p.pivot[1]); g.restore();
  }
  return Wr;
}

function drawHead(g, rig, h) {
  const P = rig.parts, J = rig.joints, N = J.neck;
  g.save(); g.translate(N[0], N[1] + (h.nod || 0) * 6); g.rotate((h.rot || 0) * D); g.translate(-N[0], -N[1]);
  if (h.squash) { g.translate(N[0], N[1]); g.scale(1 - .04 * h.squash, 1 + .05 * h.squash); g.translate(-N[0], -N[1]); }
  g.drawImage(rig.img.head, P.head.origin[0], P.head.origin[1]);
  const m = h.mouth && h.mouth !== 'rest' ? 'mouth_' + h.mouth : null;
  if (m && P[m]) { g.globalAlpha = h.mouthAmt === undefined ? 1 : h.mouthAmt; g.drawImage(rig.img[m], P[m].origin[0], P[m].origin[1]); g.globalAlpha = 1; }
  if (h.blink > .01) { g.globalAlpha = Math.min(1, h.blink * 1.3); g.drawImage(rig.img.eyes_closed, P.eyes_closed.origin[0], P.eyes_closed.origin[1]); g.globalAlpha = 1; }
  g.restore();
}

function draw(g, rig, pose) {
  const G = rig.ground, sq = pose.squash || 0, br = pose.breath || 0;
  g.save();
  g.translate(pose.x, pose.y); g.scale(pose.sc * (1 - .03 * sq), pose.sc * (1 + .04 * sq + .006 * br));
  g.rotate((pose.lean || 0) * D); g.translate(-G[0], -G[1]);
  for (const s of ['A', 'B']) drawArm(g, rig, s, pose.arms[s], 'upper');
  const body = rig.parts.body; g.drawImage(rig.img.body, body.origin[0], body.origin[1]);
  drawHead(g, rig, pose.head || {});
  const wr = {};
  for (const s of ['A', 'B']) wr[s] = drawArm(g, rig, s, pose.arms[s], 'lower');
  g.restore();
  return wr;
}

// סנכרון שפתיים: צורת Rhubarb -> צורת פה של הבובה
const VIS = { X: 'rest', A: 'mm', B: 'ee', C: 'ee', D: 'ah', E: 'oh', F: 'oh', G: 'ee', H: 'ah' };
function mouthAt(cues, t) {
  const c = cues.find(c => t >= c.start && t < c.end);
  return c ? VIS[c.value] || 'rest' : 'rest';
}

window.SPRITE_RIG = { load, loadSync, draw, mouthAt, VIS };
})();
