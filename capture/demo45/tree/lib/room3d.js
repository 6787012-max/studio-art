// חדר לימוד תלת-ממדי: רצפת עץ, קיר טיח עם חיפוי, חלון קשתי זוהר, ארון ספרים מלא, שולחן עם גמרות ושטנדר.
import * as THREE from 'three';

const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const tex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 4; return t; };
const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };

export function buildRoom(scene, opts) {
  opts = opts || {};
  const r = rng(9), g = new THREE.Group();
  // רצפת עץ
  const planks = tex(1024, 1024, (c, w, h) => {
    const cols = ['#7e5131', '#8a5a36', '#734a2c', '#93623c', '#80532f'];
    for (let i = 0; i < 8; i++) {
      let y = 0; const x = i * w / 8;
      while (y < h) { const L = 180 + r() * 300; c.fillStyle = cols[Math.floor(r() * cols.length)]; c.fillRect(x, y, w / 8, L);
        for (let k = 0; k < 14; k++) { c.strokeStyle = `rgba(40,20,8,${.06 + r() * .08})`; c.lineWidth = 1 + r() * 2; c.beginPath(); const xx = x + r() * w / 8; c.moveTo(xx, y); c.bezierCurveTo(xx + 6, y + L * .3, xx - 6, y + L * .6, xx + 3, y + L); c.stroke(); }
        c.fillStyle = 'rgba(30,14,5,.6)'; c.fillRect(x, y, w / 8, 2); y += L; }
      c.fillStyle = 'rgba(30,14,5,.7)'; c.fillRect(x, 0, 3, h);
    }
  }, [3, 3]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshPhysicalMaterial({ map: planks, roughness: .42, clearcoat: .35, clearcoatRoughness: .35 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 1); floor.receiveShadow = true; g.add(floor);
  // קיר
  const plaster = tex(512, 512, (c, w, h) => { c.fillStyle = '#e4d3b4'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = r() < .5 ? 'rgba(120,90,50,.05)' : 'rgba(255,255,255,.07)'; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 3, 0, 7); c.fill(); } }, [6, 2]);
  const wallM = new THREE.MeshStandardMaterial({ map: plaster, roughness: .95 });
  const WZ = -2.4;
  g.add(box(14, 4, .1, wallM, 0, 2, WZ - .05));
  const wood = new THREE.MeshPhysicalMaterial({ color: '#5e3a22', roughness: .5, clearcoat: .4, clearcoatRoughness: .3 });
  const woodL = new THREE.MeshPhysicalMaterial({ color: '#7a5032', roughness: .5, clearcoat: .3 });
  g.add(box(14, .14, .06, wood, 0, .07, WZ + .03));
  g.add(box(7, .95, .05, woodL, -4.2, .48, WZ + .02));
  for (let x = -7.5; x < -.8; x += .62) g.add(box(.5, .7, .02, wood, x + .3, .5, WZ + .05));
  // חלון קשתי זוהר
  const winX = -2.3, winY = 1.75, ww = 1.3, wh = 1.6;
  const sky = tex(256, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#cfe6f6'); gr.addColorStop(.65, '#fff4dc'); gr.addColorStop(1, '#ffe7b8'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(130,160,110,.6)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(r() * w, h * .85 + r() * 30, 30 + r() * 30, 40 + r() * 30, 0, 0, 7); c.fill(); } });
  const shape = new THREE.Shape(); shape.moveTo(-ww / 2, -wh / 2); shape.lineTo(ww / 2, -wh / 2); shape.lineTo(ww / 2, wh / 2 - ww / 2); shape.absarc(0, wh / 2 - ww / 2, ww / 2, 0, Math.PI, false); shape.closePath();
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ map: sky, toneMapped: false }));
  const uv = glass.geometry.attributes.uv, pos = glass.geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / ww + .5, pos.getY(i) / wh + .5);
  glass.position.set(winX, winY, WZ + .01); g.add(glass);
  const frameM = new THREE.MeshPhysicalMaterial({ color: '#6b4528', roughness: .45, clearcoat: .4 });
  const fr = new THREE.Mesh(new THREE.ExtrudeGeometry((() => { const o = shape.clone(); const hole = new THREE.Path(); const s = .9; hole.moveTo(-ww / 2 * s, -wh / 2 + .06); hole.lineTo(ww / 2 * s, -wh / 2 + .06); hole.lineTo(ww / 2 * s, wh / 2 - ww / 2); hole.absarc(0, wh / 2 - ww / 2, ww / 2 * s, 0, Math.PI, false); hole.closePath(); o.holes.push(hole); return o; })(), { depth: .08, bevelEnabled: true, bevelSize: .01, bevelThickness: .01 }), frameM);
  fr.position.set(winX, winY, WZ); fr.castShadow = true; g.add(fr);
  g.add(box(.045, wh, .05, frameM, winX, winY, WZ + .04)); g.add(box(ww, .045, .05, frameM, winX, winY - .05, WZ + .04));
  g.add(box(ww + .3, .06, .2, frameM, winX, winY - wh / 2 - .03, WZ + .08));
  const glow = new THREE.PointLight('#ffe2b0', 4, 5, 1.6); glow.position.set(winX, winY, WZ + .6); g.add(glow);
  // ארון ספרים
  const bx0 = -.9, bx1 = 4.8, by1 = 2.55, bz = WZ + .2, shelves = [0, .5, 1.0, 1.5, 2.0, 2.5];
  g.add(box(bx1 - bx0, by1, .04, new THREE.MeshStandardMaterial({ color: '#2e1c10', roughness: .9 }), (bx0 + bx1) / 2, by1 / 2, bz - .18));
  for (const y of shelves) g.add(box(bx1 - bx0, .04, .38, wood, (bx0 + bx1) / 2, y + .02, bz));
  for (let x = bx0; x <= bx1 + .01; x += (bx1 - bx0) / 4) g.add(box(.06, by1 + .05, .4, wood, x, by1 / 2, bz));
  g.add(box(bx1 - bx0 + .2, .12, .44, wood, (bx0 + bx1) / 2, by1 + .08, bz));
  const COL = ['#5b1f1f', '#1f3a2e', '#20304f', '#3b2418', '#161616', '#6b2d16', '#2b2b3d', '#4d1a2a'];
  const spines = COL.map(cc => new THREE.MeshPhysicalMaterial({ color: cc, roughness: .55, clearcoat: .2, map: tex(64, 256, (c, w, h) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#d9b26a'; c.fillRect(4, 16, w - 8, 6); c.fillRect(4, h - 26, w - 8, 6); c.fillRect(14, 70, w - 28, 4); c.fillRect(10, 80, w - 20, 3);
  }) }));
  const bookGeo = new THREE.BoxGeometry(1, 1, 1), perMat = COL.map(() => []);
  for (let si = 0; si < shelves.length - 1; si++) {
    let x = bx0 + .05; const y0 = shelves[si] + .04;
    while (x < bx1 - .06) {
      if (r() < .05) { x += .06 + r() * .1; continue; }
      const w = .028 + r() * .028, h = .3 + r() * .12, d = .24 + r() * .06;
      perMat[Math.floor(r() * COL.length)].push([x + w / 2, y0 + h / 2, bz + .02 - (.3 - d) / 2, w, h, d]);
      x += w + .002;
    }
  }
  perMat.forEach((list, i) => {
    const im = new THREE.InstancedMesh(bookGeo, spines[i], list.length), m4 = new THREE.Matrix4();
    list.forEach(([x, y, z, w, h, d], k) => { m4.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d)); im.setMatrixAt(k, m4); });
    im.castShadow = im.receiveShadow = true; g.add(im);
  });
  // שולחן עם גמרות
  const tX = 2.1, tZ = -1.15;
  g.add(box(2.4, .06, .9, woodL, tX, .78, tZ));
  for (const [dx, dz] of [[-1.1, -.38], [1.1, -.38], [-1.1, .38], [1.1, .38]]) g.add(box(.07, .76, .07, wood, tX + dx, .38, tZ + dz));
  const page = new THREE.MeshStandardMaterial({ color: '#efe3c6', roughness: .9, map: tex(256, 256, (c, w, h) => { c.fillStyle = '#efe3c6'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(60,40,20,.55)'; for (let y = 30; y < h - 20; y += 12) c.fillRect(20, y, w - 40, 3); }) });
  for (const gx of [tX - .6, tX + .5]) {
    for (const s of [-1, 1]) { const pg = box(.34, .012, .46, page, gx + s * .17, .83, tZ); pg.rotation.z = -s * .12; g.add(pg); }
    g.add(box(.72, .03, .5, spines[0], gx, .815, tZ));
  }
  // שטנדר
  const sX = -1.55, sZ = -1.0, st = new THREE.Group();
  st.add(box(.06, 1.0, .06, wood, 0, .5, 0)); st.add(box(.42, .04, .32, wood, 0, .02, 0));
  const top = box(.56, .04, .42, woodL, 0, 1.08, 0); top.rotation.x = .45; st.add(top);
  const bk = box(.48, .02, .34, page, 0, 1.11, .01); bk.rotation.x = .45; st.add(bk);
  st.position.set(sX, 0, sZ); st.rotation.y = .3; st.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); g.add(st);
  // סגנון מצויר: כל חומר הופך לצביעה בשלושה גוונים קבועים, עם אותו צבע ואותה טקסטורה
  if (opts.toon) {
    const gm = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
    gm.minFilter = gm.magFilter = THREE.NearestFilter; gm.generateMipmaps = false; gm.needsUpdate = true;
    const cache = new Map();
    g.traverse(o => {
      if (!o.isMesh || o.material.isMeshBasicMaterial) return;
      if (!cache.has(o.material)) cache.set(o.material, new THREE.MeshToonMaterial({ color: o.material.color, map: o.material.map || null, gradientMap: gm }));
      o.material = cache.get(o.material);
    });
    glow.intensity = 1.5;
  }
  scene.add(g);
  return g;
}
