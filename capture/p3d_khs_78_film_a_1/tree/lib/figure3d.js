// דמות תלת-ממדית שבנויה כולה בקוד (18/10/2026, יוסף: "הכול בקוד — יותר גמיש"), לפי האיורים שיוסף אהב:
// רב עם זקן מלא, פאות מסולסלות, משקפיים עגולים, כובע רחב שוליים או כיפה, מעיל שחור ארוך ופתוח עם דשים,
// ווסט אפור עם כפתורים, חולצה לבנה, חגורה עם אבזם זהב; וגם ילד. הכול פרמטרי (צבעים, אורך מעיל, זקן, כובע/כיפה).
//   שלד אמיתי (עצמות) + "עור" רציף: שרוול ורגל הם צינור אחד שמתכופף במרפק/ברך בלי תפר, והמעיל עוקב אחרי הגוף.
//   הפנים מצוירות בקוד על הראש (קנבס): עיניים שממצמצות, גבות, פה שזז בדיבור, לחיים.
// שימוש:  const F = figure(THREE, {kind:'rav'|'boy', hat:'hat'|'kippa'|'none', ...}); scene.add(F.group);
//         F.pose({...}) כל פריים; F.face({blink, mouth, brow, smile, look})
// צירים: Y למעלה, הדמות פונה ל-+Z, מטרים. A = צד ימין של הדמות (x שלילי), B = צד שמאל (x חיובי).
const TEXC = new Map(), cached = (k, f) => { if (!TEXC.has(k)) TEXC.set(k, f()); return TEXC.get(k); };   // מרקמים משותפים לכל הדמויות
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), sm = t => t * t * (3 - 2 * t);

export function figure(THREE, o) {
  o = Object.assign({ kind: 'rav', hat: 'kippa', glasses: true, beard: true, coatColor: '#1e1e22', vestColor: '#6e6f74', pantsColor: '#18181c',
    shirtColor: '#f7f6f2', skin: '#f2c49e', beardColor: '#3a2618', hairColor: '#2a1a10', hatColor: '#141416', buckle: '#d9a63a' }, o || {});
  const boy = o.kind === 'boy', S = boy ? .8 : 1, Q = (o.lite && !window.__HQ) ? .5 : 1;   // lite: פחות פוליגונים לדמויות רקע (כיתה שלמה) if (boy && !(arguments[1] || {}).hairColor) o.hairColor = '#4a2c18';   // ילד: נמוך יותר, ראש גדול יחסית
  const HS = o.headScale || (boy ? 1.36 : 1.32);   // headScale: ראש קטן יותר = נראה מבוגר יותר                     // ראש גדול כמו באיור (לילד עוד יותר)
  // ---------- חומרים: צביעה בשני גוונים (כמו איור) ----------
  const gd = new Uint8Array(o.depth ? [125, 125, 125, 255, 195, 195, 195, 255, 255, 255, 255, 255] : [165, 165, 165, 255, 255, 255, 255, 255]), grad = new THREE.DataTexture(gd, o.depth ? 3 : 2, 1, THREE.RGBAFormat);
  const FILT = o.soft === false ? THREE.NearestFilter : THREE.LinearFilter;   // רך = מעבר הדרגתי בין אור לצל
  grad.minFilter = grad.magFilter = FILT; grad.needsUpdate = true;
  const gds = new Uint8Array(o.depth ? [196, 196, 196, 255, 228, 228, 228, 255, 255, 255, 255, 255] : [214, 214, 214, 255, 255, 255, 255, 255]), gradSkin = new THREE.DataTexture(gds, o.depth ? 3 : 2, 1, THREE.RGBAFormat);
  gradSkin.minFilter = gradSkin.magFilter = FILT; gradSkin.needsUpdate = true;
  const T = (c, x) => new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: grad }, x || {}));
  const M = { coat: T(o.coatColor, { side: THREE.DoubleSide }), lining: T('#101012', { side: THREE.DoubleSide }), vest: T(o.vestColor), shirt: T(o.shirtColor, { side: THREE.DoubleSide }),
    pants: T(o.pantsColor), shoe: T('#0d0d10'), skin: new THREE.MeshToonMaterial({ color: o.skin, gradientMap: gradSkin }), beard: T(o.beardColor, { side: THREE.DoubleSide }), hair: T(o.hairColor), hat: T(o.hatColor, { side: THREE.DoubleSide }),
    band: T('#050506'), black: T('#0b0b0d'), gold: T(o.buckle), button: T(o.buttonColor || '#2a2a2e'), glass: T(o.glassColor || '#141414') };
  const coatOn = o.coat ?? !boy, vestOn = o.vest ?? !boy;
  if (o.shirtPattern === 'plaid') M.shirt = T('#ffffff', { map: plaidTex(o.shirtColor, o.plaidA || '#8a3b2a', o.plaidB || '#2f3f55'), side: THREE.DoubleSide });
  if (o.vestPattern === 'tweed') M.vest = T('#ffffff', { map: tweedTex(o.vestColor, 5, 2) });
  if (o.coatPattern === 'wool') M.coat = T('#ffffff', { map: tweedTex(o.coatColor, 6, 3, .5), side: THREE.DoubleSide });
  function plaidTex(base, a, b) {   // משבצות: שני פסים רחבים ושני פסים דקים
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, 128, 128); x.globalAlpha = .5; x.fillStyle = a; x.fillRect(0, 40, 128, 26); x.fillRect(40, 0, 26, 128);
    x.globalAlpha = .75; x.fillStyle = b; x.fillRect(0, 100, 128, 6); x.fillRect(100, 0, 6, 128); x.globalAlpha = .35; x.fillRect(0, 51, 128, 4); x.fillRect(51, 0, 4, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); return t;
  }
  function tweedTex(base, ru, rv, k) {   // אריג: נקודות בהירות/כהות ומשבצת עדינה
    k = k ?? 1; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, 128, 128);
    let q = 11; const rnd = () => (q = (q * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 900; i++) { x.fillStyle = rnd() < .5 ? `rgba(255,235,200,${.16 * k})` : `rgba(30,18,8,${.2 * k})`; x.fillRect(rnd() * 128, rnd() * 128, 1 + rnd() * 2.5, 1); }
    x.strokeStyle = `rgba(40,24,12,${.18 * k})`; x.lineWidth = 1.5; for (let i = 0; i < 128; i += 21) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(ru, rv); return t;
  }

  // ---------- שלד ----------
  const group = new THREE.Group(), B = {}, list = [], W = {};
  function bone(name, parent, wp) { const b = new THREE.Bone(); b.name = name; W[name] = new THREE.Vector3(...wp).multiplyScalar(S);
    if (parent) { b.position.copy(W[name]).sub(W[parent]); B[parent].add(b); } else { b.position.copy(W[name]); group.add(b); } B[name] = b; list.push(b); return b; }
  const hip = boy ? .74 : .95;
  bone('root', null, [0, 0, 0]); bone('hips', 'root', [0, hip / (S), 0].map((v, i) => i === 1 ? .95 : v));
  bone('spine', 'hips', [0, 1.12, 0]); bone('chest', 'spine', [0, 1.30, 0]); bone('neck', 'chest', [0, 1.49, 0]); bone('head', 'neck', [0, 1.57, 0]);
  for (const [s, sx] of [['A', -1], ['B', 1]]) {
    bone('sh' + s, 'chest', [sx * .17, 1.44, 0]); bone('arm' + s, 'sh' + s, [sx * .215, 1.43, 0]); bone('fore' + s, 'arm' + s, [sx * .335, 1.17, -.01]);
    bone('hand' + s, 'fore' + s, [sx * .435, .935, .03]);
    bone('thigh' + s, 'hips', [sx * .095, .93, 0]); bone('shin' + s, 'thigh' + s, [sx * .1, .5, .005]); bone('foot' + s, 'shin' + s, [sx * .105, .085, 0]);
  }
  group.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(list), IDX = n => list.indexOf(B[n]);

  // ---------- גאומטריה עם משקלות עצם ----------
  function skinned(pos, uv, idx, sw, mat) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); const si = [], wv = [];
    for (const w of sw) { const e = w.slice(0, 4); while (e.length < 4) e.push([0, 0]); const tot = e.reduce((a, q) => a + q[1], 0) || 1; for (const [b, x] of e) { si.push(b); wv.push(x / tot); } }
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(wv, 4)); g.computeVertexNormals();
    const m = new THREE.SkinnedMesh(g, mat); group.add(m); m.bind(skeleton); m.castShadow = true; m.frustumCulled = false; return m;
  }
  // צינור לאורך מסלול: כל טבעת עם רדיוסים ומשקלות משלה. ref = כיוון ייחוס לחישוב המסגרת
  function tube(rings, seg, mat, ref, capEnd) {
    const pos = [], idx = [], sw = [], uv = [], R = new THREE.Vector3(...(ref || [0, 0, 1]));
    rings.forEach((r, i) => { const p = r.p, a = rings[Math.max(0, i - 1)].p, c = rings[Math.min(rings.length - 1, i + 1)].p;
      const t = new THREE.Vector3().subVectors(c, a).normalize(), n = new THREE.Vector3().crossVectors(t, R).normalize(), b = new THREE.Vector3().crossVectors(n, t).normalize();
      for (let k = 0; k <= seg; k++) { const an = k / seg * Math.PI * 2, q = p.clone().addScaledVector(n, Math.cos(an) * r.rx).addScaledVector(b, Math.sin(an) * (r.rz || r.rx)); pos.push(q.x, q.y, q.z); sw.push(r.w); uv.push(k / seg, i / (rings.length - 1)); } });
    for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < seg; k++) { const a = i * (seg + 1) + k, b2 = a + 1, c = a + seg + 1, d = c + 1; idx.push(a, c, b2, b2, c, d); }
    if (capEnd) { const L = rings[rings.length - 1], ci = pos.length / 3; pos.push(L.p.x, L.p.y, L.p.z); sw.push(L.w); uv.push(0, 1); const base = (rings.length - 1) * (seg + 1); for (let k = 0; k < seg; k++) idx.push(base + k, ci, base + k + 1); }
    return skinned(pos, uv, idx, sw, mat);
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z).multiplyScalar(S);
  // יריעה סביב הגוף (מעיל/ווסט): טבעות אליפטיות לאורך הגב, עם פתח מלפנים (gap = חצי זווית הפתח במעלות)
  function lathe(rows, seg, mat, wfn, gapFn) {
    const pos = [], idx = [], sw = [], uv = [];
    rows.forEach((r, i) => { const gap = (gapFn ? gapFn(r.y, i) : 0) * Math.PI / 180;
      for (let k = 0; k <= seg; k++) { const an = gap + (Math.PI * 2 - 2 * gap) * k / seg, x = Math.sin(an) * r.rx, z = Math.cos(an) * r.rz + (r.dz || 0);
        pos.push(x * S, r.y * S, z * S); sw.push(wfn(r.y, x)); uv.push(k / seg, i / (rows.length - 1)); } });
    for (let i = 0; i < rows.length - 1; i++) for (let k = 0; k < seg; k++) { const a = i * (seg + 1) + k, b2 = a + 1, c = a + seg + 1, d = c + 1; idx.push(a, c, b2, b2, c, d); }
    return skinned(pos, uv, idx, sw, mat);
  }
  const prof = (keys, y) => { for (let i = 0; i < keys.length - 1; i++) { const [y0, a0, b0] = keys[i], [y1, a1, b1] = keys[i + 1]; if (y <= y0 && y >= y1) { const t = sm((y0 - y) / (y0 - y1)); return [lerp(a0, a1, t), lerp(b0, b1, t)]; } } const L = keys[y > keys[0][0] ? 0 : keys.length - 1]; return [L[1], L[2]]; };
  // משקלות גוף לפי גובה: חזה -> עמוד שדרה -> אגן; שולי המעיל נגררים מעט אחרי הירכיים בהליכה
  const bodyW = (y, x) => { const c = IDX('chest'), s = IDX('spine'), h = IDX('hips');
    if (y >= 1.27) return [[c, 1]]; if (y >= 1.07) { const t = (1.27 - y) / .2; return [[c, 1 - t], [s, t]]; } if (y >= .9) { const t = (1.07 - y) / .17; return [[s, 1 - t], [h, t]]; }
    const k = clamp((.85 - y) / .45, 0, 1) * .4; return [[h, 1 - k], [IDX(x < 0 ? 'thighA' : 'thighB'), k]]; };

  // ---------- רגליים ונעליים ----------
  for (const s of ['A', 'B']) {
    const hp = W['thigh' + s], kn = W['shin' + s], an = W['foot' + s], t = IDX('thigh' + s), sh = IDX('shin' + s), f = IDX('foot' + s);
    const L = (a, b, u) => a.clone().lerp(b, u).divideScalar(S);
    tube([{ p: V(...L(hp, kn, 0).toArray()), rx: .085, w: [[IDX('hips'), .5], [t, .5]] }, { p: V(...L(hp, kn, .35).toArray()), rx: .08, w: [[t, 1]] }, { p: V(...L(hp, kn, .85).toArray()), rx: .07, w: [[t, .8], [sh, .2]] },
      { p: V(...L(kn, an, .12).toArray()), rx: .066, w: [[t, .2], [sh, .8]] }, { p: V(...L(kn, an, .6).toArray()), rx: .062, w: [[sh, 1]] }, { p: V(...L(kn, an, 1).toArray()).add(V(0, .02, 0)), rx: .065, w: [[sh, 1]] }], 14, M.pants, [0, 0, 1]);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), M.shoe); shoe.scale.set(.06 * S, .045 * S, .125 * S); shoe.position.set(0, -.04 * S, .045 * S); B['foot' + s].add(shoe);
  }
  // ---------- גוף: חולצה, ווסט, חגורה, מעיל ----------
  const shirtK = [[1.53, .07, .075], [1.47, .12, .1], [1.3, .16, .12], [1.0, .165, .12]];
  if (coatOn || boy) lathe((vestOn || boy ? [1.53, 1.5, 1.46, 1.4, 1.32, 1.24] : [1.53, 1.5, 1.46, 1.4, 1.32, 1.24, 1.15, 1.06, .98]).map(y => { const [rx, rz] = prof(shirtK, y); return { y, rx, rz }; }), 24, M.shirt, bodyW);
  const vs = coatOn ? 1 : 1.1;   // בלי מעיל הווסט יושב מעל חולצה רחבה יותר
  const vestK = [[1.42, .155, .118], [1.3, .17, .126], [1.1, .168, .126], [.97, .172, .128]];
  if (vestOn) lathe([1.42, 1.38, 1.33, 1.27, 1.2, 1.12, 1.04, .98].map(y => { const [rx, rz] = prof(vestK, y); return { y, rx: rx * vs, rz: rz * vs }; }), 32, M.vest, bodyW, y => y > 1.24 ? lerp(4, 30, (y - 1.24) / .18) : 0);
  if (vestOn) for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.0085 * S, 10, 8), M.button), y = 1.21 - k * .065; b.position.set(0, (y - 1.3) * S, prof(vestK, y)[1] * vs * S + .002); B.chest.add(b); }
  lathe([1.0, .985, .97, .955].map(y => ({ y, rx: .178, rz: .132 })), 32, M.black, bodyW);
  lathe([.98, .93, .87, .81, .76].map((y, i) => ({ y, rx: .176 - i * .004, rz: .13 - i * .003 })), 32, M.pants, bodyW);   // 28/10: אגן מכנסיים — סוגר את הפער בין החגורה לרגליים
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(.05 * S, .032 * S, .01 * S), M.gold); buckle.position.set(0, (.97 - .95) * S, .136 * S); B.hips.add(buckle);
  const coatLen = o.coatLength || (boy ? 0 : .78);   // ז'קט של חליפה עד המותן (מעיל ארוך: coatLength .4)
  if (coatOn) {
    const coatK = [[1.48, .175, .115], [1.43, .225, .135], [1.32, .215, .14], [1.12, .2, .138], [.96, .205, .14], [.7, .235, .155], [.4, .27, .172]];
    const ys = []; for (let y = 1.48; y > coatLen + .001; y -= .035) ys.push(+y.toFixed(3)); ys.push(coatLen);
    const gap = y => y > 1.06 ? lerp(38, 7, sm((1.48 - y) / .42)) : y > .97 ? 7 : lerp(7, 34, sm((.97 - y) / Math.max(.05, .97 - coatLen)));   // דשים עד הכפתור, ואחריו השוליים נפתחים
    lathe(ys.map(y => { const [rx, rz] = prof(coatK, y); return { y, rx, rz }; }), 44, M.coat, bodyW, gap);
    // דשים: רצועה מקופלת לאורך שולי הפתח מהצווארון עד החזה
    for (const sd of [-1, 1]) {
      const pos = [], idx = [], sw = [], rowsY = []; for (let y = 1.47; y >= 1.07; y -= .02) rowsY.push(y);
      rowsY.forEach(y => { const [rx, rz] = prof(coatK, y), g = gap(y) * Math.PI / 180, wdt = lerp(.055, .008, sm((1.47 - y) / .4));
        const e = [Math.sin(g) * rx * sd, Math.cos(g) * rz], d = [Math.sin(g + .35) * (rx + .012) * sd, Math.cos(g + .35) * (rz + .012)];
        const dir = [d[0] - e[0], d[1] - e[1]], L = Math.hypot(...dir) || 1;
        pos.push(e[0] * S, y * S, (e[1] + .003) * S, (e[0] + dir[0] / L * wdt) * S, (y - .004) * S, (e[1] + dir[1] / L * wdt + .01) * S); sw.push(bodyW(y, e[0]), bodyW(y, e[0])); });
      for (let i = 0; i < rowsY.length - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      skinned(pos, null, idx, sw, T('#2a2a30', { side: THREE.DoubleSide }));
    }
    const jb = new THREE.Mesh(new THREE.SphereGeometry(.011 * S, 10, 8), M.button); jb.position.set(0, (1.01 - .95) * S, prof(coatK, 1.01)[1] * S + .004); B.hips.add(jb);
  } else {   // בלי מעיל (ילד, או איש בחולצה ווסט) — חולצה עד המותן
    const tk = boy ? [[1.53, .075, .08], [1.5, .1, .092], [1.47, .145, .105], [1.43, .178, .12], [1.2, .178, .12], [.96, .175, .125]] : [[1.53, .072, .078], [1.5, .12, .095], [1.44, .185, .12], [1.36, .17, .118], [1.2, .155, .112], [.96, .16, .118]];
    lathe((boy ? [1.53, 1.5, 1.47, 1.43, 1.4, 1.3, 1.2, 1.1, 1.0, .96] : [1.53, 1.5, 1.46, 1.42, 1.36, 1.3, 1.2, 1.1, 1.0, .96]).map(y => { const [rx, rz] = prof(tk, y); return { y, rx, rz }; }), 32, M.shirt, bodyW, y => y > 1.4 && !o.tie ? 14 : 0);
  }
  if (o.tie) {   // עניבה: קשר + להב שמתרחב ומתחדד, נשענת על החולצה
    const sh = new THREE.Shape([[-.017, 0], [.017, 0], [.012, -.036], [.03, -.3], [0, -.335], [-.03, -.3], [-.012, -.036]].map(([x, y]) => new THREE.Vector2(x * S, y * S)));
    const tg = new THREE.ExtrudeGeometry(sh, { depth: .006 * S, bevelEnabled: false }), tp = tg.attributes.position;   // מכופפת לפי קימור החולצה
    for (let i = 0; i < tp.count; i++) { const y = 1.497 + tp.getY(i) / S; tp.setZ(i, tp.getZ(i) + (prof(shirtK, y)[1] + .006) * S); } tg.computeVertexNormals();
    const tie = new THREE.Mesh(tg, T(o.tie)); tie.position.set(0, (1.497 - 1.3) * S, 0); B.chest.add(tie);
  }
  // ---------- זרועות: שרוול רציף מהכתף עד שורש כף היד ----------
  const sleeveMat = coatOn ? M.coat : M.shirt;
  for (const s of ['A', 'B']) {
    const sp = W['arm' + s], el = W['fore' + s], wr = W['hand' + s], a = IDX('arm' + s), f = IDX('fore' + s), ch = IDX('chest'), sx = s === 'A' ? -1 : 1;
    const P = (p, q, u) => p.clone().lerp(q, u); const inward = sp.clone().add(new THREE.Vector3(-sx * .06 * S, (boy ? -.07 : -.035) * S, 0));
    const big = boy ? .85 : coatOn ? 1 : .9, rings = [
      { p: inward, rx: .055 * big * S, w: [[ch, 1]] }, { p: P(sp, el, .04), rx: .066 * big * S, w: [[ch, .45], [a, .55]] }, { p: P(sp, el, .3), rx: .066 * big * S, w: [[a, 1]] },
      { p: P(sp, el, .78), rx: .06 * big * S, w: [[a, .85], [f, .15]] }, { p: P(sp, el, 1), rx: .058 * big * S, w: [[a, .5], [f, .5]] }, { p: P(el, wr, .2), rx: .06 * big * S, w: [[a, .12], [f, .88]] },
      { p: P(el, wr, .75), rx: .064 * big * S, w: [[f, 1]] }, { p: P(el, wr, .97), rx: .072 * big * S, w: [[f, 1]] }];
    tube(rings, 16, sleeveMat, [0, 0, 1]);
    { const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), sleeveMat); ball.scale.set(.062, .058, .06).multiplyScalar(big * S); ball.position.set(-sx * .03 * S, -.032 * S, 0); ball.castShadow = true; B['arm' + s].add(ball); }   // 28/10: כתף מעוגלת במקום קצה צינור חתוך
    if (coatOn) tube([{ p: P(el, wr, .95), rx: .068 * big * S, w: [[f, 1]] }, { p: P(el, wr, .99), rx: .066 * big * S, w: [[f, 1]] }], 16, M.lining, [0, 0, 1]);
    if (!coatOn) tube([{ p: P(el, wr, .9), rx: .04 * S, w: [[f, 1]] }, { p: P(el, wr, 1.03), rx: .036 * S, w: [[f, 1]] }], 14, M.skin, [0, 0, 1], true);   // 28/10: שורש כף יד מתחת לשרוול (בלי זה הכף ריחפה)
    if (coatOn) tube([{ p: P(el, wr, .92), rx: .052 * S, w: [[f, 1]] }, { p: P(el, wr, 1.04), rx: .05 * S, w: [[f, 1]] }], 14, M.shirt, [0, 0, 1], true);
    // כף יד: כף + ארבע אצבעות + אגודל, צמודים לעצם כף היד (אפשר לכופף כל אצבע)
    const hand = new THREE.Group(); B['hand' + s].add(hand); hand.position.set(0, -.012 * S, 0); hand.rotation.z = sx * .42;
    const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), M.skin); palm.scale.set(.039 * S, .048 * S, .019 * S); palm.position.y = -.04 * S; hand.add(palm);
    const fingers = [];
    for (let k = 0; k < 4; k++) { const fg = new THREE.Group(); fg.position.set((k - 1.5) * .017 * S * -sx, -.078 * S, 0); hand.add(fg);
      const len = [.042, .048, .045, .036][k] * S, l1 = len * .58, l2 = len * .5, fm = new THREE.Mesh(new THREE.CapsuleGeometry(.0085 * S, l1, 4, 10), M.skin); fm.position.y = -l1 / 2; fg.add(fm);
      const dj = new THREE.Group(); dj.position.y = -l1; dj.rotation.x = .28; fg.add(dj); const fd = new THREE.Mesh(new THREE.CapsuleGeometry(.0072 * S, l2, 4, 10), M.skin); fd.position.y = -l2 / 2; dj.add(fd); fingers.push(fg); }
    const th = new THREE.Group(); th.position.set(-sx * .03 * S, -.025 * S, .01 * S); th.rotation.z = sx * -.7; hand.add(th);
    const tm = new THREE.Mesh(new THREE.CapsuleGeometry(.0095 * S, .034 * S, 4, 10), M.skin); tm.position.y = -.02 * S; th.add(tm);
    B['hand' + s].userData = { fingers, thumb: th, hand };
  }
  // ---------- ראש ----------
  // הראש הוא משטח אחד שמפוסל בקוד: האף יוצא מהפנים עצמן (בלי "כדור" מודבק ובלי קו מתאר סביבו), עם לחיים,
  // קשת גבות וסנטר. הפנים המצוירות, השפם והשיער יושבים על אותו משטח מפוסל ולכן זזים איתו כיחידה אחת.
  const head = new THREE.Group(); B.head.add(head); const hc = (1.69 - 1.57) * S;   // מרכז הגולגולת ביחס לעצם הראש
  const R = [.104 * HS * S, .122 * HS * S * (o.faceLong || 1), .112 * HS * S];   // faceLong: פנים מוארכות
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.045 * S, .05 * S, .12 * S, 16), M.skin); neck.position.y = -.01 * S; B.neck.add(neck);
  const G = (x, y, cx, cy, sx, sy) => Math.exp(-((x - cx) * (x - cx) / (2 * sx * sx) + (y - cy) * (y - cy) / (2 * sy * sy)));
  const NY = -.14, ns = (o.nose || 1) * (boy ? .75 : 1.15);   // גובה קצה האף (ביחידות רדיוס) וגודלו
  function bump(x, y) {   // כמה הפנים בולטות קדימה בנקודה x,y (ביחידות רדיוס הגולגולת)
    const nose = ns * (Math.max(.15 * G(x, y, 0, NY, .085, .075), .065 * G(x, y, 0, NY + .15, .048, .11)) + .045 * (G(x, y, .085, NY - .04, .045, .04) + G(x, y, -.085, NY - .04, .045, .04)));
    const cheek = (boy ? .05 : .02) * (G(x, y, .46, -.16, .16, .13) + G(x, y, -.46, -.16, .16, .13));
    return nose + cheek + .03 * G(x, y, 0, .36, .45, .07) + (boy || !o.beard ? .05 * G(x, y, 0, -.78, .2, .12) : 0);
  }
  function sculpt(x, y, z, out) {   // נקודה על כדור יחידה -> נקודה על הראש המפוסל
    const w = sm(clamp(z * 2.2, 0, 1)), jaw = 1 - (boy ? .1 : o.beard ? .05 : .09) * sm(clamp((-y - .2) / .8, 0, 1));
    const nape = 1 - .3 * sm(clamp((-y - .25) / .6, 0, 1)) * sm(clamp(-z * 2, 0, 1));   // עורף: הגולגולת מצטמצמת אל הצוואר
    out[0] = x * jaw; out[1] = y; out[2] = (z < 0 ? z * nape : z) + bump(x, y) * w; return out;
  }
  const v3 = [0, 0, 0];
  const skG = new THREE.SphereGeometry(1, 128 * Q, 96 * Q, -Math.PI / 2), skp = skG.attributes.position;   // התפר מאחור, מתחת לשיער
  for (let i = 0; i < skp.count; i++) { sculpt(skp.getX(i), skp.getY(i), skp.getZ(i), v3); skp.setXYZ(i, v3[0], v3[1], v3[2]); }
  skG.computeVertexNormals();
  const skull = new THREE.Mesh(skG, M.skin); skull.scale.set(...R); skull.position.y = hc; head.add(skull);
  const earIn = T('#d99673');
  for (const sd of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), M.skin); ear.scale.set(.016 * S, .03 * HS * S, .022 * S); ear.position.set(sd * R[0] * .98, hc - .005 * S, -.005 * S); head.add(ear);
    const ec = new THREE.Mesh(new THREE.TorusGeometry(.011 * S, .0022 * S, 6, 18, Math.PI * 1.4), earIn); ec.scale.y = 1.5; ec.rotation.y = -Math.PI / 2; ec.position.set(sd * (R[0] * .98 + .0145 * S), hc - .005 * S, -.003 * S); head.add(ec); }
  // פנים מצוירות על חלק קדמי של אותו משטח מפוסל — מיפוי ישר מלפנים (x,y -> u,v)
  const fc = document.createElement('canvas'); fc.width = fc.height = 512; const fg = fc.getContext('2d'), ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.SRGBColorSpace;
  const fgeo = new THREE.SphereGeometry(1, 96 * Q, 72 * Q, Math.PI / 2 - 1.25, 2.5, .45, 2.15), fuv = [], fp = fgeo.attributes.position;
  for (let i = 0; i < fp.count; i++) { const x = fp.getX(i), y = fp.getY(i); fuv.push(x / 2 + .5, y / 2 + .5); sculpt(x, y, fp.getZ(i), v3); fp.setXYZ(i, v3[0] * 1.006, v3[1] * 1.006, v3[2] * 1.006); }
  fgeo.setAttribute('uv', new THREE.Float32BufferAttribute(fuv, 2)); fgeo.computeVertexNormals();
  const fmask = new THREE.Mesh(fgeo, new THREE.MeshBasicMaterial({ map: ftex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  fmask.scale.set(...R); fmask.position.y = hc; fmask.renderOrder = 3; head.add(fmask);
  // מ"מ של הקנבס: x,y בטווח -1..1 של רדיוס הגולגולת
  const FX = x => (x / 2 + .5) * 512, FY = y => (1 - (y / 2 + .5)) * 512;
  const ex = boy ? .37 : .39, ey = .13, MY = (boy || !o.beard) ? -.44 : -.41;
  let faceState = null;
  function drawFace(st) {
    const key = JSON.stringify(st); if (key === faceState) return; faceState = key;
    fg.clearRect(0, 0, 512, 512);
    const bl = clamp(st.blink || 0, 0, 1), lk = (st.look || 0) * 9, lky = -(st.lookY || 0) * 7, ink = '#2a170c';
    // לחיים: סומק רך
    for (const sd of [-1, 1]) { const cx = FX(sd * .5), cy = FY(-.15), cg = fg.createRadialGradient(cx, cy, 2, cx, cy, 58);
      cg.addColorStop(0, 'rgba(232,118,96,.30)'); cg.addColorStop(1, 'rgba(232,118,96,0)'); fg.fillStyle = cg; fg.fillRect(cx - 60, cy - 60, 120, 120); }
    if (o.age) {   // קמטים עדינים: מצח, "רגלי עורב" ושקיות מתחת לעיניים
      const a = o.age; fg.strokeStyle = `rgba(150,88,60,${.34 * a})`; fg.lineWidth = 3; fg.lineCap = 'round';
      fg.beginPath(); fg.moveTo(FX(-.2), FY(.55) + 3); fg.quadraticCurveTo(FX(0), FY(.55) - 5, FX(.2), FY(.55) + 3); fg.stroke();
      for (const sd of [-1, 1]) { for (const k of [-1, 0, 1]) { fg.beginPath(); fg.moveTo(FX(sd * (ex + .14)), FY(ey) + k * 6); fg.lineTo(FX(sd * (ex + .2)), FY(ey) + k * 10); fg.stroke(); }
        fg.beginPath(); fg.moveTo(FX(sd * (ex - .09)), FY(ey - .13)); fg.quadraticCurveTo(FX(sd * ex), FY(ey - .18), FX(sd * (ex + .09)), FY(ey - .13)); fg.stroke(); }
    }
    // אף: הבליטה עצמה תלת-ממדית; כאן רק צל רך בצד אחד, קווי כנפיים וברק קטן על הקצה — כמו באיור
    { const nx = FX(0), ny = FY(NY), k = ns;
      const sg = fg.createRadialGradient(nx + 16 * k, ny + 2, 2, nx + 16 * k, ny + 2, 30 * k); sg.addColorStop(0, 'rgba(185,100,72,.30)'); sg.addColorStop(1, 'rgba(185,100,72,0)'); fg.fillStyle = sg; fg.fillRect(nx - 20, ny - 50, 80, 90);
      fg.strokeStyle = 'rgba(150,78,52,.8)'; fg.lineWidth = 4; fg.lineCap = 'round';
      fg.beginPath(); fg.arc(nx - 22 * k, ny + 10 * k, 10 * k, Math.PI * .5, Math.PI * 1.3); fg.stroke();
      fg.beginPath(); fg.arc(nx + 22 * k, ny + 10 * k, 10 * k, -Math.PI * .3, Math.PI * .5); fg.stroke();
      fg.strokeStyle = 'rgba(160,84,58,.42)'; fg.lineWidth = 3.5; fg.beginPath(); fg.moveTo(nx + 9 * k, ny - 62 * k); fg.quadraticCurveTo(nx + 15 * k, ny - 26 * k, nx + 25 * k, ny - 2 * k); fg.stroke();
      fg.fillStyle = 'rgba(255,242,230,.6)'; fg.beginPath(); fg.ellipse(nx - 5 * k, ny - 7 * k, 7 * k, 4.5 * k, -.3, 0, 7); fg.fill(); }
    for (const sd of [-1, 1]) {
      // עין: שקד לבן קטן, קשתית חומה, אישון וברק; עפעף עליון כקו עבה
      const rw = boy ? 29 : 25, rh = boy ? 28 : 23;
      fg.save(); fg.translate(FX(sd * ex), FY(ey)); fg.scale(sd, 1);   // מכאן +x = החוצה מהפנים
      const gx = lk * sd;
      if (bl < .85) {
        const h = rh * (1 - bl), lid = -h * ((boy ? .85 : .62) - .35 * (st.wide || 0) - .3 * (st.squint || 0));
        const eye = () => { fg.beginPath(); fg.moveTo(-rw, 2); fg.bezierCurveTo(-rw * .6, -h * 1.25, rw * .6, -h * 1.25, rw, 2); fg.bezierCurveTo(rw * .6, h * .95, -rw * .6, h * .95, -rw, 2); fg.closePath(); };
        const lidPath = () => { fg.beginPath(); fg.moveTo(-rw - 3, 3); fg.bezierCurveTo(-rw * .55, lid, rw * .55, lid, rw + 3, 2); };
        eye(); fg.fillStyle = '#fbf7f0'; fg.fill();
        fg.save(); eye(); fg.clip();
        fg.fillStyle = boy ? '#6e4426' : '#5a3a22'; fg.beginPath(); fg.arc(gx, lky + 3, rw * .6, 0, 7); fg.fill();
        fg.fillStyle = '#120a06'; fg.beginPath(); fg.arc(gx, lky + 3, rw * .33, 0, 7); fg.fill();
        fg.fillStyle = '#ffffff'; fg.beginPath(); fg.arc(gx - rw * .18 * sd, lky - rw * .05, rw * .15, 0, 7); fg.fill();
        lidPath(); fg.lineTo(rw + 3, -h * 2); fg.lineTo(-rw - 3, -h * 2); fg.closePath(); fg.fillStyle = '#e8b48e'; fg.fill();
        lidPath(); fg.strokeStyle = 'rgba(110,60,40,.28)'; fg.lineWidth = 12; fg.stroke();
        fg.restore();
        fg.strokeStyle = ink; fg.lineWidth = 6; fg.lineCap = 'round'; lidPath(); fg.stroke();
        fg.strokeStyle = 'rgba(120,70,50,.4)'; fg.lineWidth = 2.5; fg.beginPath(); fg.moveTo(-rw * .65, h * .72); fg.quadraticCurveTo(0, h * 1.02, rw * .65, h * .72); fg.stroke();
      } else { fg.strokeStyle = ink; fg.lineWidth = 6; fg.lineCap = 'round'; fg.beginPath(); fg.moveTo(-rw, 0); fg.quadraticCurveTo(0, 9, rw, 0); fg.stroke(); }
      fg.restore();
      // גבה: משיכת מכחול מקושתת — עבה בצד הפנימי ומתחדדת החוצה
      const sad = st.sad || 0;
      fg.save(); fg.translate(FX(sd * (ex + .01)), FY(ey + .32) - (st.brow || 0) * 12); fg.scale(sd, boy ? 1.1 : 1.4); fg.rotate(sad * .3);
      fg.fillStyle = boy ? '#5a3520' : o.hairColor; fg.beginPath(); fg.moveTo(-36, 5); fg.quadraticCurveTo(-30, -12, 4, -14); fg.quadraticCurveTo(30, -15, 44, -1);
      fg.quadraticCurveTo(28, -5, 4, -3); fg.quadraticCurveTo(-22, -1, -36, 9); fg.closePath(); fg.fill(); fg.restore();
    }
    // פה (אצל הרב: בין השפם לזקן)
    const my = FY(MY), mw = (boy ? 30 : 23) + (st.smile || 0) * 8, op = clamp(st.mouth || 0, 0, 1);
    if (op > .05) { const hh = 8 + op * 34;
      fg.fillStyle = '#4a1410'; fg.beginPath(); fg.moveTo(FX(0) - mw, my); fg.quadraticCurveTo(FX(0), my - 5, FX(0) + mw, my); fg.quadraticCurveTo(FX(0), my + hh * 1.5, FX(0) - mw, my); fg.closePath(); fg.fill();
      fg.save(); fg.clip(); fg.fillStyle = '#fff'; fg.fillRect(FX(0) - mw, my - 6, mw * 2, 9); fg.fillStyle = '#c95a5a'; fg.beginPath(); fg.ellipse(FX(0), my + hh * 1.1, mw * .6, 6 + op * 8, 0, 0, 7); fg.fill(); fg.restore();
      fg.strokeStyle = '#3a120c'; fg.lineWidth = 4; fg.stroke(); }
    else { fg.strokeStyle = '#5a2418'; fg.lineWidth = 6; fg.lineCap = 'round'; fg.beginPath(); fg.moveTo(FX(0) - mw * .8, my); fg.quadraticCurveTo(FX(0), my + 10 + (st.smile || 0) * 10, FX(0) + mw * .8, my); fg.stroke(); }
    ftex.needsUpdate = true;
  }
  drawFace({});
  function curlTex(base, n, seed, hi) { return cached(['curl', base, n, seed, hi].join('|'), () => curlTex0(base, n, seed, hi)); }
  function curlTex0(base, n, seed, hi) {   // מרקם איור: צבע בסיס + תלתלים קטנים בהירים וכהים, מחזורי בשני הכיוונים
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, 256, 256); x.lineCap = 'round'; x.filter = 'blur(1.6px)';
    let q = seed; const rnd = () => (q = (q * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < n; k++) { const x0 = rnd() * 256, y0 = rnd() * 256, r = 5 + rnd() * 7, a0 = rnd() * 6.28, light = k % 2 === 0;
      x.strokeStyle = light ? (hi || 'rgba(150,104,66,.42)') : 'rgba(16,8,3,.34)'; x.lineWidth = light ? 3.2 : 3;
      for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) { x.beginPath(); x.arc(x0 + dx, y0 + dy, r, a0, a0 + 2.7); x.stroke(); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  // שיער: יריעה אחת עם קו שיער טבעי — מצח פתוח מלפנים, יורד לפאות-לחיים בצדדים ולעורף מאחור
  {
    const NT = 96 * Q, NP = 36 * Q, pos = [], nor = [], idx = [], huv = [], front = boy ? 1.05 : .98;
    const pmax = a => (a < .5 ? front : a < 1.45 ? lerp(front, 1.68, sm((a - .5) / .95)) : lerp(1.68, 2.35, sm(clamp((a - 1.45) / .9, 0, 1)))) + .025 * Math.sin(a * 9) + .07 * Math.exp(-a * a / .1) - .07 * Math.exp(-(a - .62) * (a - .62) / .04);
    for (let j = 0; j <= NP; j++) for (let i = 0; i <= NT; i++) {
      const th = lerp(-Math.PI, Math.PI, i / NT), ph = pmax(Math.abs(th)) * j / NP, rr = 1.03 + (boy ? .05 : .035) * sm(clamp(1 - ph / 1.6, 0, 1)) + .028 * Math.pow(Math.sin(th), 2) * sm(clamp((ph - .5) / .7, 0, 1)) * (1 - sm(clamp((ph - 1.45) / .3, 0, 1)));
      const ux = Math.sin(ph) * Math.sin(th), uy = Math.cos(ph), uz = Math.sin(ph) * Math.cos(th);
      pos.push(ux * R[0] * rr, hc + uy * R[1] * rr, uz * R[2] * rr);
      const n = new THREE.Vector3(ux / R[0], uy / R[1], uz / R[2]).normalize(); nor.push(n.x, n.y, n.z); huv.push(i / NT * 4, 1 - j / NP);
    }
    for (let j = 0; j < NP; j++) for (let i = 0; i < NT; i++) { const a = j * (NT + 1) + i, b2 = a + 1, c = a + NT + 1, d = c + 1; idx.push(a, c, b2, b2, c, d); }
    const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); hg.setAttribute('uv', new THREE.Float32BufferAttribute(huv, 2)); hg.setIndex(idx);
    head.add(new THREE.Mesh(hg, T('#ffffff', { map: curlTex(o.hairColor, o.hairCurls || 32, 3, o.hairHi) })));
  }
  // זקן (סבב 5, 18/10): נפח אחד רך שבנוי מקווצות — לא יריעה עם "דוגמה".
  //  - הקווצות הן רכסים אנכיים גליים בגאומטריה עצמה, והצל עליהן יוצר את המראה של שיער; המרקם רק מעמיק את המרווחים.
  //  - הקצה העליון על הלחי דק ונבלע בעור (בלי מדרגה ובלי קו); למטה כל קווצה מסתיימת בקצה מעוגל משלה.
  //  - מלא בלסת ובאמצע, צר יותר למטה; מאחור הוא עולה לאורך קו הלסת.
  if (o.beard && !boy) {
    const bLen = o.beardLength || 1, NL = o.beardLocks || 11, TH = 1.95, NT = 120 * Q, NS = 50 * Q, R1n = R[1] / S;
    const lockPh = (th, s) => (th + TH) / (2 * TH) * NL + .35 * Math.sin(s * 4.5 + th * 2.2) + .18 * Math.sin(th * 5.3 + 1);   // מרווחים לא אחידים   // מספר הקווצה (שבר) בנקודה
    const arc = u => { const f = u - Math.floor(u); return 1 - (2 * f - 1) * (2 * f - 1); };     // קשת 0..1..0 לכל קווצה
    // מרקם: בסיס, הכהיה כלפי מטה, מרווח כהה בין קווצות, ברק בצד המואר של כל קווצה (ובזקן מאפיר — קווצות שיבה)
    const btex = cached(['beard', o.beardColor, NL, o.beardHi].join('|'), () => {
    const bc = document.createElement('canvas'); bc.width = bc.height = 512; const bx = bc.getContext('2d');
    bx.fillStyle = o.beardColor; bx.fillRect(0, 0, 512, 512);
    const vg = bx.createLinearGradient(0, 0, 0, 512); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.2)'); bx.fillStyle = vg; bx.fillRect(0, 0, 512, 512);
    const thAt = (ph, s) => { let th = 0; for (let k = 0; k < 6; k++) th = (ph - .35 * Math.sin(s * 4.5 + th * 2.2) - .18 * Math.sin(th * 5.3 + 1)) * 2 * TH / NL - TH; return th; };
    const band = (off, col, w, blur) => { bx.filter = `blur(${blur}px)`; bx.strokeStyle = col; bx.lineWidth = w; bx.lineCap = 'round';
      for (let k = -1; k <= NL + 1; k++) { bx.beginPath(); for (let j = 0; j <= 48; j++) { const s = j / 48, u = (thAt(k + off, s) + TH) / (2 * TH); if (j) bx.lineTo(u * 512, s * 512); else bx.moveTo(u * 512, s * 512); } bx.stroke(); }
      bx.filter = 'none'; };
    band(.5, 'rgba(10,5,2,.26)', 20, 9);                                  // מרווח כהה ורך בין קווצות
    band(-.08, o.beardHi || 'rgba(176,128,86,.30)', 24, 10);             // גוף הקווצה המואר
    band(-.14, o.beardHi || 'rgba(205,160,112,.16)', 5, 2);              // נגיעת ברק עדינה
    const tg = bx.createLinearGradient(0, 0, 0, 512); tg.addColorStop(0, 'rgba(255,230,200,.08)'); tg.addColorStop(.6, 'rgba(0,0,0,0)'); tg.addColorStop(1, 'rgba(0,0,0,.14)'); bx.fillStyle = tg; bx.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(bc); t.colorSpace = THREE.SRGBColorSpace; return t; });
    const gb = new Uint8Array(o.depth ? [100, 100, 100, 255, 150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255] : [125, 125, 125, 255, 190, 190, 190, 255, 255, 255, 255, 255]);
    const gradB = new THREE.DataTexture(gb, o.depth ? 4 : 3, 1, THREE.RGBAFormat); gradB.minFilter = gradB.magFilter = FILT; gradB.needsUpdate = true;
    const MB = new THREE.MeshToonMaterial({ map: btex, gradientMap: gradB, side: THREE.DoubleSide });
    const pos = [], idx = [], buv = [];
    for (let j = 0; j <= NS; j++) for (let i = 0; i <= NT; i++) {
      // צורה (סבב 6, יוסף: "הזקן צריך להיות בתוך הסנטר, פחות ישר"): הזקן צומח מהלסת ומהסנטר. למעלה הוא צמוד ללחיים;
      // מתחת לסנטר הוא גוף אחד שמונח על החזה ומצטמצם לקצה מעוגל (צורת U), והגב שלו עולה באלכסון מהאוזן אל מתחת
      // לסנטר, כך שהצוואר נראה מאחוריו. אין "וילון" אנכי בצדדים.
      const c = lerp(-1, 1, i / NT), th0 = c * TH, s = j / NS, fp = Math.max(0, Math.cos(th0)), tip = 1.45 * bLen;
      const top = lerp(.08, -.47, Math.pow(fp, 1.4)) + .03 * arc(lockPh(th0, 0) + .5);
      const bot = -tip * (1 - .3 * Math.pow(Math.abs(c), 2.5)) - .07 * arc(lockPh(th0, 1) + .5);
      const yc = lerp(top, bot, s), er = Math.sqrt(Math.max(0, 1 - Math.min(1, yc * yc)));
      const u = clamp((-yc - .4) / Math.max(.3, tip - .4), 0, 1), th = c * lerp(TH, 1.45, sm(u)), wb = sm(clamp((-yc - .55) / .45, 0, 1));
      const ridge = .5 + .5 * Math.cos(2 * Math.PI * lockPh(th0, s));
      const thick = (.05 + .06 * Math.sin(Math.PI * Math.min(1, s * 1.3)) + .028 * ridge * (o.beardWob || 1)) * sm(clamp(s / .16, 0, 1));
      const hug = er * (1.008 + thick);
      const bx = Math.pow(Math.max(0, 1 - Math.pow(u, 2.4)), .45) * .9 + .18 + thick * .5;
      const bz = Math.pow(Math.max(0, 1 - Math.pow(u, 2.2)), .5) * .42 + .26 + thick * .5, zc = .18 + .3 * Math.pow(u, 1.3);
      pos.push(Math.sin(th) * R[0] * lerp(hug, bx, wb), hc + yc * R[1], R[2] * (zc * wb + Math.cos(th) * lerp(hug, bz, wb)));
      buv.push(i / NT, 1 - s);
    }
    for (let j = 0; j < NS; j++) for (let i = 0; i < NT; i++) { const a = j * (NT + 1) + i, b2 = a + 1, c = a + NT + 1, d = c + 1; idx.push(a, c, b2, b2, c, d); }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bg.setAttribute('uv', new THREE.Float32BufferAttribute(buv, 2)); bg.setIndex(idx); bg.computeVertexNormals();
    const bm = new THREE.Mesh(bg, MB); head.add(bm);
    // שפם: יריעה אחת שצמודה לשפה העליונה, עבה באמצע, ונשפכת בקצוות אל תוך הזקן
    const mp = [], mi = [], muv = [], NU = 48, NV = 10;
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
      const u = lerp(-1, 1, i / NU), v = j / NV, x = u * .42;
      const yt = NY - .12 - .07 * u * u - .012 * G(u, 0, 0, 0, .12, 1), yb = NY - .22 - .16 * u * u + .015 * Math.sin(u * 14);
      const y = lerp(yt, yb, v), z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
      sculpt(x, y, z, v3); const off = 1.012 + .06 * Math.pow(Math.sin(Math.PI * v), .7) * (1 - .45 * u * u);
      mp.push(v3[0] * off * R[0], hc + v3[1] * off * R[1], v3[2] * off * R[2]); muv.push(i / NU * .5, 1 - v * .3);
    }
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a = j * (NU + 1) + i, b2 = a + 1, c = a + NU + 1, d = c + 1; mi.push(a, c, b2, b2, c, d); }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(mp, 3)); mg.setAttribute('uv', new THREE.Float32BufferAttribute(muv, 2)); mg.setIndex(mi); mg.computeVertexNormals();
    head.add(new THREE.Mesh(mg, MB));
  }
  // פאות מסולסלות
  if (o.peyot ?? boy) for (const sd of [-1, 1]) {
    const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, a = u * Math.PI * 2 * 3, r = .008 * S * (1 - u * .2);
      const py = .02 * S - u * (boy ? .09 : .12) * S, yu = py / R[1], xs = R[0] * Math.sqrt(Math.max(.05, 1 - yu * yu - .09));
      pts.push(new THREE.Vector3(sd * (xs + .008 * S + Math.cos(a) * r * .6), hc + py, R[2] * .3 + Math.sin(a) * r)); }
    const pe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, .0105 * S, 10), M.hair); head.add(pe);
  }
  // משקפיים: true/'round' עגולים, 'big' עגולים גדולים עם מסגרת מתכת דקה, 'wire' קטנים ודקים ומעט אובליים
  if (o.glasses) {
    const gk = o.glasses === true ? 'round' : o.glasses, gr = { round: .031, big: .034, wire: .027 }[gk] * HS * S, gt = { round: .0027, big: .002, wire: .0014 }[gk] * HS * S, gsy = gk === 'wire' ? .8 : 1;
    const gy = hc + .016 * HS * S, gxc = .041 * HS * S;
    for (const sd of [-1, 1]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(gr, gt, 8, 40), M.glass); rim.scale.y = gsy; rim.position.set(sd * gxc, gy, R[2] * .95); rim.rotation.y = sd * .3; head.add(rim);
      const P = [new THREE.Vector3(sd * (gxc + gr * .95), gy, R[2] * .87), new THREE.Vector3(sd * R[0] * .9, gy, R[2] * .5), new THREE.Vector3(sd * R[0] * 1.05, gy - .004 * S, -.01 * S)];
      for (let k = 0; k < 2; k++) { const a0 = P[k], a1 = P[k + 1], seg = new THREE.Mesh(new THREE.CylinderGeometry(gt * .75, gt * .75, a0.distanceTo(a1), 6), M.glass);
        seg.position.copy(a0).add(a1).multiplyScalar(.5); seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a1.clone().sub(a0).normalize()); head.add(seg); } }
    const bridge = new THREE.Mesh(new THREE.TorusGeometry(gxc - gr * .95, gt * .9, 6, 12, Math.PI), M.glass); bridge.position.set(0, gy + .002 * S, R[2] * .97); head.add(bridge);
  }
  // כובע / כיפה
  if (o.hat === 'hat') {
    const hy = hc + R[1] * .62, brim = new THREE.Mesh(new THREE.CylinderGeometry(.205 * S, .205 * S, .012 * S, 48), M.hat); brim.position.y = hy; head.add(brim);
    const cp = []; const cr = R[0] * 1.16; [[0, cr], [.02, cr * 1.0], [.08, cr * .98], [.115, cr * .9], [.125, cr * .55], [.118, 0]].forEach(([y, r]) => cp.push(new THREE.Vector2(r, y * S)));
    const crown = new THREE.Mesh(new THREE.LatheGeometry(cp, 40), M.hat); crown.position.y = hy; crown.scale.z = 1.1; head.add(crown);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(cr * 1.005, cr * 1.01, .028 * S, 40, 1, true), M.band); band.position.y = hy + .02 * S; band.scale.z = 1.1; head.add(band);
  } else if (o.hat === 'kippa') {
    const k = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, .8), T(o.kippaColor || '#26397a', { side: THREE.DoubleSide })); const kr = boy ? 1.1 : 1.075; k.scale.set(R[0] * kr * 1.04, R[1] * kr * .98, R[2] * kr * 1.04); k.position.set(0, hc - R[1] * .012, 0); k.rotation.x = -.1; head.add(k);   // 28/10: כיפה צמודה לשיער (קצה יורד לגובה הרקות), בלי הגדלות חיצוניות
  }
  // ---------- תנועה ----------
  const rest = {}; for (const b of list) rest[b.name] = b.quaternion.clone();
  const tmpE = new THREE.Euler(), tmpQ = new THREE.Quaternion();
  const rot = (n, x, y, z) => { tmpE.set(x || 0, y || 0, z || 0, 'XYZ'); tmpQ.setFromEuler(tmpE); B[n].quaternion.copy(rest[n]).multiply(tmpQ); };
  // p: {armA:[x,y,z], foreA:[...], ... , fingers:{A:0..1, B:0..1}, pointA/B, hips:[...], y (קפיצה), turn (סיבוב כל הגוף)}
  function pose(p) {
    for (const b of list) b.quaternion.copy(rest[b.name]);
    for (const k of Object.keys(p)) if (B[k] && Array.isArray(p[k])) rot(k, ...p[k]);
    for (const s of ['A', 'B']) { const ud = B['hand' + s].userData, c = (p.fist && p.fist[s]) || 0, pt = (p.point && p.point[s]) || 0;
      ud.fingers.forEach((fg, k) => { fg.rotation.x = (k === 0 ? c * (1 - pt) : c) * 1.4 + .15; }); ud.thumb.rotation.x = c * .8; }
    B.root.position.y = (p.y || 0) * S; group.rotation.y = p.turn || 0;
    group.updateMatrixWorld(true);
  }
  group.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(head); const topY = bb.max.y;
  return { group, bones: B, skeleton, pose, face: drawFace, height: topY };
}

// ---------- תנוחות מוכנות ומחזור הליכה (כל הזוויות ברדיאנים; סימן ציר X = קדימה, Z = הרחקה מהגוף) ----------
export const POSES = {
  rest: {},
  explain: { armB: [-.35, 0, .25], foreB: [-1.0, .3, 0], point: { B: 0 }, fist: { B: .15 } },
  point: { armB: [-1.15, 0, .55], foreB: [-.15, 0, 0], point: { B: 1 }, fist: { B: 1 } },
  wave: { armB: [0, 0, 1.25], foreB: [0, 0, 1.55], fist: { B: 0 } },
  heart: { armB: [-.55, 0, .1], foreB: [-1.9, -.5, 0] },
  wide: { armA: [-.3, 0, -.75], armB: [-.3, 0, .75], foreA: [-.6, 0, 0], foreB: [-.6, 0, 0] },
  think: { armB: [-.3, 0, .2], foreB: [-2.35, -.4, 0], fist: { B: .8 }, head: [.12, 0, .1] },
  up: { armA: [0, 0, -2.4], armB: [0, 0, 2.4], foreA: [0, 0, -.2], foreB: [0, 0, .2] },
  // תנועות שהסרטים (people_pro) משתמשים בהן
  explainA: { armA: [-.35, 0, -.25], foreA: [-1.0, -.3, 0], fist: { A: .15 } },
  finger: { armB: [-.45, 0, .3], foreB: [-2.0, .2, 0], point: { B: 1 }, fist: { B: 1 } },
  count: { armB: [-.55, 0, .12], foreB: [-1.45, .5, 0], armA: [-.5, 0, -.08], foreA: [-1.3, 0, .45], point: { A: 1 }, fist: { A: 1 } },
  hips: { armA: [.25, 0, -.55], foreA: [-.35, 0, 1.35], armB: [.25, 0, .55], foreB: [-.35, 0, -1.35], fist: { A: .7, B: .7 } },
  pray: { armA: [-.5, 0, .3], foreA: [-1.45, 0, .75], armB: [-.5, 0, -.3], foreB: [-1.45, 0, -.75], head: [.12, 0, 0] },   // אמה: z מסובב פנימה (A חיובי, B שלילי); y רק מסובב סביב עצמה
  thumb: { armB: [-.45, 0, .2], foreB: [-1.35, .3, 0], fist: { B: 1 } },
  offer: { armA: [-.55, 0, .02], foreA: [-.85, -.9, 0], armB: [-.55, 0, -.02], foreB: [-.85, .9, 0] },
  shrug: { armA: [.05, 0, -.25], foreA: [-1.0, 0, -.7], armB: [.05, 0, .25], foreB: [-1.0, 0, .7], head: [0, 0, .12] },
  sit: { thighA: [-1.5, 0, 0], thighB: [-1.5, 0, 0], shinA: [1.5, 0, 0], shinB: [1.5, 0, 0], y: -.43 },
};
// legacy / alternative gesture names -> canonical POSES keys
export const GESTURE_ALIAS = { pointFwd: 'point', pointA: 'explainA', bless: 'offer', stop: 'up', cross: 'rest' };
const _badGestures = new Set(), _own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
export function resolveGesture(name) {
  if (typeof name === 'string') {
    if (_own(POSES, name)) return name;
    if (_own(GESTURE_ALIAS, name)) return GESTURE_ALIAS[name];
  }
  const key = String(name);
  if (!_badGestures.has(key)) { _badGestures.add(key); console.error('[STAGE3D_ERROR] Unknown gesture: ' + key); }
  return 'rest';
}
export function mixPose(a, b, u) {
  const out = {}; const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) { const x = a[k], y = b[k];
    if (k === 'point' || k === 'fist') { out[k] = {}; for (const s of ['A', 'B']) out[k][s] = lerp((x && x[s]) || 0, (y && y[s]) || 0, u); }
    else if (Array.isArray(x) || Array.isArray(y)) { const p = x || [0, 0, 0], q = y || [0, 0, 0]; out[k] = [0, 1, 2].map(i => lerp(p[i], q[i], u)); }
    else out[k] = lerp(x || 0, y || 0, u); }
  return out;
}
export function walkPose(ph, amt) {   // ph = פאזה ברדיאנים, amt = 0..1
  const s = Math.sin(ph), c = Math.cos(ph), k = amt || 1;
  return { thighA: [s * .45 * k, 0, 0], thighB: [-s * .45 * k, 0, 0], shinA: [Math.max(0, -c) * .7 * k, 0, 0], shinB: [Math.max(0, c) * .7 * k, 0, 0],
    footA: [-s * .2 * k, 0, 0], footB: [s * .2 * k, 0, 0], armA: [-s * .35 * k, 0, -.05], armB: [s * .35 * k, 0, .05], foreA: [-.25 * k, 0, 0], foreB: [-.25 * k, 0, 0],
    hips: [0, s * .08 * k, 0], chest: [0, -s * .1 * k, 0], y: -Math.abs(Math.sin(ph)) * .02 * k };
}
