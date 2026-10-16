// דמות תלת-ממדית: אברך עם כובע, משקפיים, זקן ופאות. בנויה מצורות תלת-ממד עם חומרים אמיתיים
// (עור, בד, לבד, נעליים מבריקות), שלד של מפרקים שאפשר לסובב, ופנים שמשתנות (גבות, עיניים, פה).
// הציור נעשה ב-three.js על המעבד בלבד (SwiftShader) — בלי כרטיס המסך.
// צירים: Y למעלה, הדמות פונה ל-+Z. צד A = יד/רגל ימין של הדמות (שמאל המסך כשהיא מולנו), B = שמאל.
import * as THREE from 'three';

const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
function canvasTex(w, h, draw, srgb) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}

// style='toon': צביעה בגוונים קבועים (כמו איור), בשילוב קווי מתאר שמצוירים אחר כך
let GRAD = null;
function toonGrad() {
  if (GRAD) return GRAD;
  GRAD = new THREE.DataTexture(new Uint8Array([95, 95, 95, 255, 165, 165, 165, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.generateMipmaps = false; GRAD.needsUpdate = true; return GRAD;
}
let GRAD_SOFT = null;
function toonGradSoft() {
  if (GRAD_SOFT) return GRAD_SOFT;
  GRAD_SOFT = new THREE.DataTexture(new Uint8Array([170, 170, 170, 255, 215, 215, 215, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  GRAD_SOFT.minFilter = GRAD_SOFT.magFilter = THREE.NearestFilter; GRAD_SOFT.generateMipmaps = false; GRAD_SOFT.needsUpdate = true; return GRAD_SOFT;
}
export function toonMaterials() {
  const T = (color, o) => new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: toonGrad() }, o || {}));
  return {
    skin: T('#f8cba4', { gradientMap: toonGradSoft() }), lip: T('#c45a4e'), mouth: T('#4a1418'), teeth: T('#ffffff'), tongue: T('#e07a80'),
    eyeW: T('#ffffff'), iris: T('#3b2414'), pupil: T('#0d0806'), hair: T('#6b4126'), brow: T('#3a2416'),
    coat: T('#2c3142', { side: THREE.DoubleSide }), lapel: T('#222634'), shirt: T('#ffffff'), pants: T('#23252f'),
    shoe: T('#1a1a20'), hat: T('#24262f', { side: THREE.DoubleSide }), band: T('#3a3f52', { side: THREE.DoubleSide }),
    frame: T('#1b1410'), button: T('#111216'), shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  };
}

export function materials() {
  const r = rng(17);
  const strands = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const x = r() * w; g.strokeStyle = r() < .5 ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.35)'; g.lineWidth = 1 + r() * 2.5;
      g.beginPath(); g.moveTo(x, -10); g.bezierCurveTo(x + 18 * (r() - .5), h * .3, x + 24 * (r() - .5), h * .65, x + 14 * (r() - .5), h + 10); g.stroke();
    }
  });
  const weave = canvasTex(256, 256, (g, w, h) => {
    const im = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, v = 128 + ((x + y) % 4 < 2 ? 14 : -14) + (r() - .5) * 30; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
  });
  weave.repeat.set(10, 10);
  const felt = canvasTex(256, 256, (g, w, h) => { const im = g.createImageData(w, h); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - .5) * 50; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); });
  felt.repeat.set(4, 4);
  return {
    skin: new THREE.MeshPhysicalMaterial({ color: '#eebd97', roughness: .52, sheen: .5, sheenColor: new THREE.Color('#ff9a7a'), sheenRoughness: .55 }),
    lip: new THREE.MeshPhysicalMaterial({ color: '#b5524a', roughness: .35 }),
    mouth: new THREE.MeshStandardMaterial({ color: '#3a0f12', roughness: .9 }),
    teeth: new THREE.MeshPhysicalMaterial({ color: '#fbf8f0', roughness: .25, clearcoat: .5 }),
    tongue: new THREE.MeshStandardMaterial({ color: '#cf6a72', roughness: .6 }),
    eyeW: new THREE.MeshPhysicalMaterial({ color: '#fbf8f2', roughness: .12, clearcoat: 1, clearcoatRoughness: .05 }),
    iris: new THREE.MeshPhysicalMaterial({ color: '#5a3518', roughness: .25, clearcoat: 1, clearcoatRoughness: .03 }),
    pupil: new THREE.MeshPhysicalMaterial({ color: '#0a0604', roughness: .1, clearcoat: 1, clearcoatRoughness: .02 }),
    hair: new THREE.MeshPhysicalMaterial({ color: '#4a3020', roughness: .78, bumpMap: strands, bumpScale: 2.2, sheen: .6, sheenColor: new THREE.Color('#a77a55'), sheenRoughness: .4 }),
    brow: new THREE.MeshStandardMaterial({ color: '#3a2618', roughness: .9 }),
    coat: new THREE.MeshPhysicalMaterial({ color: '#1c202b', roughness: .72, bumpMap: weave, bumpScale: .6, sheen: 1, sheenColor: new THREE.Color('#56648c'), sheenRoughness: .45, side: THREE.DoubleSide }),
    lapel: new THREE.MeshPhysicalMaterial({ color: '#151821', roughness: .45, sheen: .6, sheenColor: new THREE.Color('#5a6890') }),
    shirt: new THREE.MeshPhysicalMaterial({ color: '#f2eee4', roughness: .8, sheen: .3, sheenColor: new THREE.Color('#ffffff') }),
    pants: new THREE.MeshPhysicalMaterial({ color: '#17181e', roughness: .75, sheen: .8, sheenColor: new THREE.Color('#4a5270') }),
    shoe: new THREE.MeshPhysicalMaterial({ color: '#0c0c0f', roughness: .28, clearcoat: 1, clearcoatRoughness: .12 }),
    hat: new THREE.MeshPhysicalMaterial({ color: '#111216', roughness: .82, bumpMap: felt, bumpScale: .4, sheen: 1, sheenColor: new THREE.Color('#3d4356'), sheenRoughness: .5, side: THREE.DoubleSide }),
    band: new THREE.MeshPhysicalMaterial({ color: '#202330', roughness: .32, sheen: .5, sheenColor: new THREE.Color('#8090c0'), side: THREE.DoubleSide }),
    frame: new THREE.MeshPhysicalMaterial({ color: '#2b1f19', roughness: .28, clearcoat: .8 }),
    button: new THREE.MeshPhysicalMaterial({ color: '#0d0e12', roughness: .2, clearcoat: 1 }),
    shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  };
}

const mesh = (geo, mat, opt) => {
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
  if (opt && opt.scale) m.scale.copy(opt.scale);
  if (opt && opt.rotation) m.rotation.copy(opt.rotation);
  return m;
};
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const joint = (parent, x, y, z, name) => { const j = at(new THREE.Object3D(), x, y, z); j.name = name || ''; parent.add(j); return j; };

// כף יד. pose: 'relax' | 'open' | 'point' | 'thumb'. האצבעות פונות ל--Y (יד תלויה).
function buildHand(M, side) {
  const g = new THREE.Group(), fingers = [], s = side;
  g.add(at(mesh(new THREE.SphereGeometry(.043, 24, 16), M.skin, { scale: new THREE.Vector3(1, 1.15, .55) }), 0, -.048, 0));
  [-.025, -.0085, .0085, .025].forEach((x, i) => {
    const base = joint(g, x * s, -.088, 0), L = [.036, .042, .041, .034][i];
    const f = at(mesh(new THREE.CapsuleGeometry(.0105, L, 6, 10), M.skin), 0, -L / 2, 0); base.add(f);
    const tip = joint(base, 0, -L, 0); const f2 = at(mesh(new THREE.CapsuleGeometry(.0098, L * .55, 6, 10), M.skin), 0, -L * .27, 0); tip.add(f2);
    fingers.push({ base, tip });
  });
  const tb = joint(g, .036 * s, -.03, .012);
  const th = at(mesh(new THREE.CapsuleGeometry(.0125, .034, 6, 10), M.skin), 0, -.02, 0); tb.add(th);
  const thTip = joint(tb, 0, -.04, 0); thTip.add(at(mesh(new THREE.CapsuleGeometry(.0115, .018, 6, 10), M.skin), 0, -.012, 0));
  const cuff = at(mesh(new THREE.CylinderGeometry(.047, .047, .03, 24), M.shirt), 0, .006, 0); g.add(cuff);
  g.userData.setPose = pose => {
    fingers.forEach((f, i) => {
      const spread = (i - 1.5) * (pose === 'open' ? .13 : .03) * s;
      let curl = .25, curl2 = .2;
      if (pose === 'relax') { curl = .55; curl2 = .55; }
      if (pose === 'open') { curl = .04; curl2 = .02; }
      if (pose === 'point' || pose === 'thumb') { curl = 1.5; curl2 = 1.6; }
      if (pose === 'point' && i === 0) { curl = 0; curl2 = 0; }
      f.base.rotation.set(curl, 0, spread); f.tip.rotation.set(curl2, 0, 0);
    });
    if (pose === 'thumb') { tb.rotation.set(-.2, 0, -2.6 * s); thTip.rotation.set(0, 0, 0); }
    else if (pose === 'open') { tb.rotation.set(.2, 0, .85 * s); thTip.rotation.set(0, 0, .2 * s); }
    else { tb.rotation.set(.7, 0, .45 * s); thTip.rotation.set(.5, 0, 0); }
  };
  g.userData.setPose('relax');
  return g;
}

// גיאומטריית זקן: כדור שמעוצב כזקן מלא — רחב בלחיים, מתחדד ויורד למטה
function beardGeometry() {
  const geo = new THREE.SphereGeometry(.15, 64, 48), p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    if (v.y < 0) { const k = -v.y / .15; v.y *= 1.6; v.x *= 1 - .42 * k * k; v.z *= 1 - .2 * k; }
    if (v.y > .02) v.y = .02 + (v.y - .02) * .35;
    if (v.y < -.08) { const k = Math.min(1, (-.08 - v.y) / .1), an = Math.atan2(v.z, v.x); v.y -= .016 * k * (.5 + .5 * Math.sin(an * 11)); }
    if (v.z < 0) v.z *= .22;   // רק מלפנים — לא קסדה סביב הראש
    v.z *= .82;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals(); return geo;
}

// פאה מסולסלת: צינור לאורך סליל
function peyaGeometry(side) {
  const pts = [];
  for (let i = 0; i <= 160; i++) {
    const k = i / 160, a = k * Math.PI * 2 * 3.2, rr = .009 + .015 * Math.min(1, k * 3);
    pts.push(new THREE.Vector3(Math.cos(a) * rr * side + k * .01 * side, -k * .2, Math.sin(a) * rr + k * .012));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 320, .0105, 10, false);
}

function hatGroup(M) {
  const g = new THREE.Group();
  const prof = [[0, .168], [.045, .165], [.08, .152], [.1, .118], [.11, .06], [.116, 0]].map(([r, y]) => new THREE.Vector2(r, y));
  const crown = new THREE.LatheGeometry(prof, 64), cp = crown.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < cp.count; i++) {
    v.fromBufferAttribute(cp, i); const r = Math.hypot(v.x, v.z);
    if (r < .085) v.y -= .028 * (1 - r / .085) * Math.min(1, (.09 - Math.abs(v.x)) / .09 + .3);   // שקע בכתר
    if (v.y > .1 && v.z > 0) v.y -= .012 * (v.z / .11) * ((v.y - .1) / .07);                     // צביטה קדמית
    cp.setXYZ(i, v.x, v.y, v.z);
  }
  crown.computeVertexNormals();
  g.add(mesh(crown, M.hat));
  const top = mesh(new THREE.CircleGeometry(.05, 32), M.hat); top.rotation.x = -Math.PI / 2; top.position.y = .14; // סוגר את קודקוד הכתר
  g.add(top);
  g.add(at(mesh(new THREE.CylinderGeometry(.1175, .1185, .03, 64, 1, true), M.band), 0, .016, 0));
  const bprof = [[.112, .002], [.2, -.002], [.226, .004], [.228, .011], [.205, .01], [.112, .013]].map(([r, y]) => new THREE.Vector2(r, y));
  const brim = new THREE.LatheGeometry(bprof, 96), bp = brim.attributes.position;
  for (let i = 0; i < bp.count; i++) { v.fromBufferAttribute(bp, i); v.y += .32 * v.x * v.x - .1 * Math.max(0, v.z) * Math.max(0, v.z); bp.setXYZ(i, v.x, v.y, v.z); }
  brim.computeVertexNormals();
  g.add(mesh(brim, M.hat));
  return g;
}

function coatGeometry() {
  const prof = [[.06, .47], [.12, .458], [.185, .43], [.214, .38], [.218, .3], [.205, .16], [.193, .04], [.2, -.1], [.226, -.25], [.255, -.4], [.262, -.418], [.245, -.424]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(prof, 72), p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); v.z *= .68; p.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  geo.userData.rest = Float32Array.from(p.array);
  return geo;
}

export function buildCharacter(M) {
  M = M === 'toon' ? toonMaterials() : (M || materials());
  const root = new THREE.Group();
  const pelvis = joint(root, 0, .8, 0, 'pelvis');
  const spine = joint(pelvis, 0, 0, 0, 'spine');
  const chest = joint(spine, 0, .38, 0, 'chest');
  // מעיל, חולצה, דשים, כפתורים
  const coatGeo = coatGeometry(), coat = mesh(coatGeo, M.coat); spine.add(coat);
  const front = joint(spine, 0, .4, .132); front.rotation.x = -.32;
  const vshape = new THREE.Shape(); vshape.moveTo(-.05, .07); vshape.lineTo(.05, .07); vshape.lineTo(0, -.09); vshape.closePath();
  front.add(at(mesh(new THREE.ShapeGeometry(vshape), M.shirt), 0, 0, .002));
  for (const s of [-1, 1]) {
    const l = new THREE.Shape(); l.moveTo(.048 * s, .072); l.lineTo(.11 * s, .03); l.lineTo(.068 * s, -.008); l.lineTo(.004 * s, -.092); l.lineTo(0, -.092); l.closePath();
    front.add(at(mesh(new THREE.ExtrudeGeometry(l, { depth: .005, bevelEnabled: true, bevelSize: .003, bevelThickness: .003, bevelSegments: 2 }), M.lapel), 0, 0, .001));
  }
  [.24, .14, .04].forEach(y => spine.add(at(mesh(new THREE.SphereGeometry(.011, 16, 12), M.button, { scale: new THREE.Vector3(1, 1, .5) }), .013, y, .134)));
  const seam = mesh(new THREE.BoxGeometry(.004, .74, .004), M.lapel); seam.position.set(0, -.05, .14); seam.rotation.x = -.1; spine.add(seam);
  for (const s of [-1, 1]) chest.add(at(mesh(new THREE.SphereGeometry(.078, 32, 24), M.coat, { scale: new THREE.Vector3(1, .78, .9) }), .175 * s, .02, -.005));
  const collar = mesh(new THREE.TorusGeometry(.068, .018, 12, 40, Math.PI * 1.25), M.coat); collar.rotation.set(Math.PI / 2, 0, Math.PI * .375 + Math.PI / 2); collar.position.set(0, .455, -.005); collar.scale.set(1, .8, 1); spine.add(collar);
  for (const s of [-1, 1]) { const pk = mesh(new THREE.BoxGeometry(.1, .012, .02), M.lapel); pk.position.set(.12 * s, -.06, .142); pk.rotation.set(-.12, .5 * s, 0); spine.add(pk); }
  // צוואר וראש
  const neck = joint(chest, 0, .07, .005, 'neck');
  neck.add(at(mesh(new THREE.CylinderGeometry(.05, .058, .1, 24), M.skin), 0, .02, 0));
  const head = joint(neck, 0, .2, .012, 'head'); head.scale.setScalar(1.32);
  const skullGeo = new THREE.SphereGeometry(.13, 64, 48), sp = skullGeo.attributes.position, sv = new THREE.Vector3();
  for (let i = 0; i < sp.count; i++) { sv.fromBufferAttribute(sp, i); if (sv.y < .02) { const k = Math.min(1, (.02 - sv.y) / .1); sv.x *= 1 + .1 * k * (1 - k) * 2; sv.z *= 1 + .06 * k; } sp.setXYZ(i, sv.x, sv.y, sv.z); }
  skullGeo.computeVertexNormals();
  const skull = mesh(skullGeo, M.skin, { scale: new THREE.Vector3(1, 1.1, 1.05) }); head.add(skull);
  head.add(mesh(new THREE.SphereGeometry(.134, 48, 32, Math.PI, Math.PI, Math.PI * .3, Math.PI * .5), M.hair, { scale: new THREE.Vector3(1.01, 1.1, 1.07) }));
  for (const s of [-1, 1]) head.add(at(mesh(new THREE.SphereGeometry(.03, 24, 16), M.skin, { scale: new THREE.Vector3(.45, 1, .75) }), .128 * s, -.005, -.005));
  const nose = at(mesh(new THREE.SphereGeometry(.026, 32, 24), M.skin, { scale: new THREE.Vector3(1, 1.05, 1.25) }), 0, -.015, .135); head.add(nose);
  // עיניים: לובן, קשתית ואישון שמסתובבים יחד (מבט), ועפעף עליון לעצימה
  const eyes = [];
  for (const s of [-1, 1]) {
    const eg = joint(head, .047 * s, .018, .108);
    eg.add(mesh(new THREE.SphereGeometry(.03, 32, 24), M.eyeW, { scale: new THREE.Vector3(1, 1.22, 1) }));
    const look = joint(eg, 0, 0, 0);
    look.add(at(mesh(new THREE.SphereGeometry(.0165, 24, 16), M.iris, { scale: new THREE.Vector3(1, 1, .4) }), 0, 0, .026));
    look.add(at(mesh(new THREE.SphereGeometry(.0082, 16, 12), M.pupil, { scale: new THREE.Vector3(1, 1, .4) }), 0, 0, .0292));
    look.add(at(mesh(new THREE.SphereGeometry(.0045, 12, 8), M.shine, { scale: new THREE.Vector3(1, 1, .3) }), -.006, .007, .0305));
    const lid = joint(eg, 0, 0, 0);
    lid.add(mesh(new THREE.SphereGeometry(.0315, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.skin, { scale: new THREE.Vector3(1, 1.22, 1) }));
    const lidLine = at(mesh(new THREE.TorusGeometry(.0314, .0026, 8, 32, Math.PI), M.brow), 0, 0, 0); lidLine.rotation.set(0, Math.PI / 2, 0); lid.add(lidLine);
    eyes.push({ eg, look, lid, s });
    const brow = joint(head, .048 * s, .07, .122);
    brow.add(mesh(new THREE.CapsuleGeometry(.0085, .046, 6, 12), M.brow, { rotation: new THREE.Euler(0, 0, Math.PI / 2) }));
    eyes[eyes.length - 1].brow = brow;
  }
  // משקפיים
  const glasses = joint(head, 0, .018, .15);
  for (const s of [-1, 1]) {
    glasses.add(at(mesh(new THREE.TorusGeometry(.039, .0038, 10, 48), M.frame), .048 * s, 0, 0));
    const arm = mesh(new THREE.CylinderGeometry(.0028, .0028, .15, 8), M.frame); arm.rotation.x = Math.PI / 2; arm.rotation.z = .25 * s;
    arm.position.set(.092 * s, 0, -.07); glasses.add(arm);
  }
  const bridge = mesh(new THREE.TorusGeometry(.012, .0032, 8, 16, Math.PI), M.frame); bridge.position.y = .004; glasses.add(bridge);
  // זקן, שפם, פה
  const beard = at(mesh(beardGeometry(), M.hair), 0, -.05, .035); head.add(beard);
  const mouthG = joint(head, 0, -.072, .152, 'mouth');
  const mouthOpen = mesh(new THREE.SphereGeometry(.03, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.mouth); mouthOpen.rotation.x = Math.PI; mouthG.add(mouthOpen);
  const teeth = at(mesh(new THREE.BoxGeometry(.044, .009, .006), M.teeth), 0, -.003, .004); mouthG.add(teeth);
  const tongue = at(mesh(new THREE.SphereGeometry(.018, 16, 12), M.tongue, { scale: new THREE.Vector3(1.2, .5, .6) }), 0, -.016, .002); mouthG.add(tongue);
  const lips = mesh(new THREE.TorusGeometry(.03, .0045, 8, 40, Math.PI), M.lip); lips.rotation.z = Math.PI; mouthG.add(lips);
  for (const s of [-1, 1]) {
    const m = mesh(new THREE.CapsuleGeometry(.0145, .042, 6, 12), M.hair); m.position.set(.024 * s, -.052, .158); m.rotation.set(0, .25 * s, (Math.PI / 2 - .45) * s); head.add(m);
  }
  // פאות
  const peyot = [];
  for (const s of [-1, 1]) { const pj = joint(head, .128 * s, .0, .072); pj.add(mesh(peyaGeometry(s), M.hair)); peyot.push(pj); }
  // כובע
  const hat = hatGroup(M); hat.position.set(0, .088, -.006); hat.rotation.x = -.06; head.add(hat);
  // ידיים
  const arms = {};
  for (const [k, s] of [['A', -1], ['B', 1]]) {
    const sh = joint(chest, .2 * s, .0, -.005, 'sh' + k);
    sh.add(at(mesh(new THREE.CapsuleGeometry(.055, .22, 8, 16), M.coat), 0, -.12, 0));
    const el = joint(sh, 0, -.25, 0, 'el' + k);
    el.add(at(mesh(new THREE.CapsuleGeometry(.05, .2, 8, 16), M.coat), 0, -.1, 0));
    el.add(at(mesh(new THREE.CylinderGeometry(.056, .054, .045, 24), M.lapel), 0, -.205, 0));
    const wr = joint(el, 0, -.23, 0, 'wr' + k);
    const hand = buildHand(M, s); wr.add(hand);
    arms[k] = { sh, el, wr, hand };
  }
  // רגליים
  const legs = {};
  for (const [k, s] of [['A', -1], ['B', 1]]) {
    const hip = joint(pelvis, .088 * s, -.02, 0, 'hip' + k);
    const thigh = at(mesh(new THREE.CapsuleGeometry(.06, .3, 8, 16), M.pants), 0, -.18, 0); thigh.visible = false; hip.add(thigh);
    const kn = joint(hip, 0, -.37, 0, 'kn' + k);
    kn.add(at(mesh(new THREE.CapsuleGeometry(.058, .28, 8, 16), M.pants), 0, -.18, 0));
    const an = joint(kn, 0, -.36, 0, 'an' + k);
    an.add(at(mesh(new THREE.SphereGeometry(.07, 32, 20), M.shoe, { scale: new THREE.Vector3(.82, .55, 1.75) }), 0, -.035, .05));
    legs[k] = { hip, kn, an };
  }
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  head.traverse(o => { if (o.isMesh) o.receiveShadow = false; });

  const C = { root, pelvis, spine, chest, neck, head, eyes, glasses, beard, peyot, hat, arms, legs, coat, coatGeo, mouth: { g: mouthG, open: mouthOpen, teeth, tongue, lips }, M };

  // פנים: browUp, smile, open, o, blink, wink, look (x,y)
  C.setFace = f => {
    const blink = f.blink || 0;
    eyes.forEach(e => {
      const shut = Math.min(1, blink + (e.s < 0 ? (f.wink || 0) : 0));
      e.lid.rotation.x = -1.45 + shut * 1.95 - (f.wide || 0) * .25 + (f.smile || 0) * .12;
      e.look.rotation.set(-(f.lookY || 0) * .35, (f.lookX || 0) * .45, 0);
      e.brow.position.y = .066 + (f.browUp || 0) * .012 + (e.s < 0 ? f.browA || 0 : f.browB || 0) * .012;
      e.brow.rotation.z = -e.s * ((f.browUp || 0) * .08 + (f.browSad || 0) * .2);
    });
    const sm = f.smile || 0, op = Math.max(f.open || 0, (f.o || 0) * .8), oo = f.o || 0;
    const w = 1 + sm * .35 - oo * .45;
    mouthOpen.scale.set(w, .12 + op * 1.1, .5 + op * .3);
    mouthOpen.visible = op > .03;
    teeth.visible = op > .1 && oo < .5; teeth.scale.set(w, 1, 1);
    tongue.visible = op > .3;
    lips.scale.set(w, .25 + sm * .35 + op * .2, 1);
    lips.rotation.z = Math.PI;
  };
  C.setFace({ smile: .3 });

  // שולי המעיל עוקבים אחרי הברכיים (והזזה משנית): כל קודקוד מתחת למותניים זז לפי הצד שלו
  C.deformCoat = (hemX, hemZ) => {
    const p = coatGeo.attributes.position, rest = coatGeo.userData.rest;
    const kA = new THREE.Vector3(), kB = new THREE.Vector3();
    legs.A.kn.getWorldPosition(kA); legs.B.kn.getWorldPosition(kB); spine.worldToLocal(kA); spine.worldToLocal(kB);
    for (let i = 0; i < p.count; i++) {
      const x = rest[i * 3], y = rest[i * 3 + 1], z = rest[i * 3 + 2];
      const k = Math.max(0, Math.min(1, (-.02 - y) / .4));
      if (k <= 0) { p.setXYZ(i, x, y, z); continue; }
      const side = Math.max(0, Math.min(1, .5 + x / .4)), kn = kA.clone().lerp(kB, side);
      p.setXYZ(i, x + (kn.x - .088 * (side * 2 - 1)) * k * .5 + (hemX || 0) * k * k, y, z + kn.z * k * .75 + (hemZ || 0) * k * k);
    }
    p.needsUpdate = true; coatGeo.computeVertexNormals();
  };
  return C;
}
