// arachin3d shared prop: a real-looking Talmud volume. No Hebrew, no people. Deterministic.
// Hebrew book: front cover faces +z, spine on the RIGHT (x = +w/2), opens toward the right.
//
// usage:
//   import { makeBook } from './book3d.js';
//   const book = makeBook(THREE, { w: 3.0, h: 4.2, t: 0.9 });   // returns a THREE.Group, centred on its closed volume
//   scene.add(book);
//   book.setOpen(k);   // 0 = closed, 1 = lying fully open (two halves side by side, pages facing +z)
//   book.setFlip(u);   // 0..1 : 10 loose pages turn one after another from the left half to the right half (use while open)
//   book.setGlow(g);   // 0..1 : warm light coming out of the open pages
// The group recentres itself while opening, so the open spread stays centred on the group origin.
// Show it standing and tilted back a little (rotation.x about -0.25) or lying on a stand (rotation.x = -PI/2 + 0.5).

export function makeBook(THREE, o = {}) {
  const w = o.w || 3.0, h = o.h || 4.2, t = o.t || 0.9;
  const NAVY = o.navy || '#12233F', GOLD = o.gold || '#D9A93C', GOLDL = '#F3D98B', CREAM = '#F3EAD3';
  const cov = 0.07;                 // cover board thickness
  const lip = 0.09;                 // cover overhang past the page block
  const g = new THREE.Group();
  const inner = new THREE.Group();  // shifted in x while opening to keep the spread centred
  g.add(inner);

  const tex = (W, H, draw) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    draw(c.getContext('2d'), W, H);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx;
  };
  // cover: navy cloth, double gold frame, corner ornaments, centre medallion, title bar (blank gold plate)
  const coverTex = tex(768, 1076, (x, W, H) => {
    x.fillStyle = NAVY; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 2600; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.012 + ((i * 37) % 7) * 0.003) + ')'; x.fillRect((i * 193) % W, (i * 389) % H, 2, 2); }
    const fr = (m, lw) => { x.strokeStyle = GOLD; x.lineWidth = lw; x.strokeRect(m, m, W - 2 * m, H - 2 * m); };
    fr(44, 10); fr(70, 3); fr(118, 2);
    x.fillStyle = GOLD;
    [[70, 70], [W - 70, 70], [70, H - 70], [W - 70, H - 70]].forEach(([cx, cy]) => {
      x.save(); x.translate(cx, cy); x.rotate(Math.PI / 4); x.fillRect(-20, -20, 40, 40); x.restore();
    });
    // medallion
    x.save(); x.translate(W / 2, H * 0.56);
    x.strokeStyle = GOLD; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 120, 0, 7); x.stroke();
    x.lineWidth = 2.5; x.beginPath(); x.arc(0, 0, 100, 0, 7); x.stroke();
    for (let i = 0; i < 12; i++) { x.rotate(Math.PI / 6); x.beginPath(); x.moveTo(0, -92); x.lineTo(13, -46); x.lineTo(0, -30); x.lineTo(-13, -46); x.closePath(); x.fillStyle = i % 2 ? GOLD : GOLDL; x.fill(); }
    x.beginPath(); x.arc(0, 0, 22, 0, 7); x.fillStyle = GOLDL; x.fill();
    x.restore();
    // title plate
    const gr = x.createLinearGradient(0, H * 0.2, 0, H * 0.2 + 90); gr.addColorStop(0, GOLDL); gr.addColorStop(1, GOLD);
    x.fillStyle = gr; x.fillRect(W * 0.2, H * 0.2, W * 0.6, 90);
    x.strokeStyle = NAVY; x.lineWidth = 3; x.strokeRect(W * 0.2 + 9, H * 0.2 + 9, W * 0.6 - 18, 72);
  });
  // page face: cream paper with a Talmud-like layout drawn as grey line blocks (centre column + two commentary columns)
  const pageTex = tex(640, 900, (x, W, H) => {
    x.fillStyle = CREAM; x.fillRect(0, 0, W, H);
    const lines = (x0, y0, ww, hh, step, lw, a) => {
      x.strokeStyle = 'rgba(60,45,25,' + a + ')'; x.lineWidth = lw;
      for (let y = y0, i = 0; y < y0 + hh; y += step, i++) { const cut = (i * 53) % 9 === 0 ? ww * 0.35 : 0; x.beginPath(); x.moveTo(x0 + cut * (i % 2), y); x.lineTo(x0 + ww - cut * ((i + 1) % 2), y); x.stroke(); }
    };
    x.fillStyle = 'rgba(60,45,25,.75)'; x.fillRect(W * 0.36, 46, W * 0.28, 12);          // running head
    lines(W * 0.27, 96, W * 0.46, H * 0.56, 15, 5, 0.62);                                   // main text
    lines(54, 96, W * 0.17, H * 0.72, 10, 3, 0.45);                                         // outer commentary
    lines(W - 54 - W * 0.17, 96, W * 0.17, H * 0.72, 10, 3, 0.45);                          // inner commentary
    lines(W * 0.27, 96 + H * 0.58, W * 0.46, H * 0.16, 10, 3, 0.45);                        // lower wrap
    x.fillStyle = 'rgba(60,45,25,.8)'; x.fillRect(W * 0.27, 96, 46, 30);                    // initial word block
  });
  // page edges: fine parallel lines
  const edgeTex = tex(64, 512, (x, W, H) => {
    x.fillStyle = '#E9DDBF'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < W; i += 2) { x.fillStyle = 'rgba(120,95,55,' + (0.18 + ((i * 7) % 5) * 0.05) + ')'; x.fillRect(i, 0, 1, H); }
  });

  const M = THREE.MeshStandardMaterial;
  const mCover = new M({ map: coverTex, roughness: 0.62, metalness: 0.15 });
  const mNavy = new M({ color: NAVY, roughness: 0.7, metalness: 0.1 });
  const mGold = new M({ color: GOLD, roughness: 0.3, metalness: 0.85, emissive: 0x2a1800 });
  const mPage = new M({ map: pageTex, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
  const mEdge = new M({ map: edgeTex, roughness: 0.95, metalness: 0 });
  const mGlow = new THREE.MeshBasicMaterial({ color: 0xFFE2A8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });

  const box = (bw, bh, bd, mats) => new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mats);
  const pw = w - lip, ph = h - 2 * lip, halfT = (t - 2 * cov) / 2;
  // a half page block: side order of BoxGeometry materials = +x, -x, +y, -y, +z, -z
  const halfBlock = faceUp => box(pw, ph, halfT, [mEdge, mEdge, mEdge, mEdge, faceUp ? mPage : mEdge, faceUp ? mEdge : mPage]);

  // hinge line: x = +w/2, z = 0 (mid thickness). Everything is built relative to it.
  const hx = w / 2;
  // back half (static): back cover + back half of the pages
  const back = new THREE.Group(); inner.add(back);
  const backCover = box(w, h, cov, [mNavy, mNavy, mNavy, mNavy, mNavy, mCover]); backCover.position.set(0, 0, -t / 2 + cov / 2); back.add(backCover);
  const backPages = halfBlock(true); backPages.position.set(-lip / 2, 0, -halfT / 2); back.add(backPages);
  // front half (rotates about the hinge)
  const front = new THREE.Group(); front.position.set(hx, 0, 0); inner.add(front);
  const frontCover = box(w, h, cov, [mNavy, mNavy, mNavy, mNavy, mCover, mNavy]); frontCover.position.set(-w / 2, 0, t / 2 - cov / 2); front.add(frontCover);
  const frontPages = halfBlock(false); frontPages.position.set(-w / 2 - lip / 2, 0, halfT / 2); front.add(frontPages);
  // rounded spine + 4 raised gold bands
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(t / 2, t / 2, h, 28, 1, false, -Math.PI / 2, Math.PI), mNavy);
  spine.rotation.y = Math.PI / 2; spine.position.set(hx, 0, 0); spine.scale.z = 0.42; inner.add(spine);
  const bands = [];
  [-0.36, -0.14, 0.14, 0.36].forEach(f => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(t / 2 + 0.012, t / 2 + 0.012, 0.07, 28, 1, false, -Math.PI / 2, Math.PI), mGold);
    b.rotation.y = Math.PI / 2; b.position.set(hx, f * h, 0); b.scale.z = 0.46; inner.add(b); bands.push(b);
  });
  // loose pages that flip (thin, slightly bowed)
  const NP = o.pages || 10, loose = [];
  for (let i = 0; i < NP; i++) {
    const geo = new THREE.PlaneGeometry(pw, ph, 12, 1); geo.translate(-pw / 2, 0, 0);
    const p = new THREE.Mesh(geo, mPage); const hinge = new THREE.Group(); hinge.position.set(hx - lip / 2, 0, 0.004 * (i + 1)); hinge.add(p);
    hinge.visible = false; inner.add(hinge); loose.push({ hinge, p, base: geo.attributes.position.array.slice() });
  }
  // light from the pages
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.4, h * 1.25), mGlow); glow.position.set(0, 0, 0.5); g.add(glow);
  const light = new THREE.PointLight(0xFFE2A8, 0, 14, 1.6); light.position.set(0, 0, 1.6); g.add(light);

  let openK = 0;
  g.setOpen = k => {
    openK = Math.min(1, Math.max(0, k));
    const e = openK * openK * (3 - 2 * openK);
    front.rotation.y = e * Math.PI;                 // swings toward the viewer, lands on the right
    inner.position.x = -e * (w / 2);                // keep the spread centred
    spine.visible = e < 0.98; bands.forEach(b => (b.visible = e < 0.98));
  };
  g.setFlip = u => {
    u = Math.min(1, Math.max(0, u));
    loose.forEach((L, i) => {
      const a = Math.min(1, Math.max(0, u * (NP + 2.5) / 3.5 - i / 3.5));   // staggered, about 3 pages in the air at once
      L.hinge.visible = openK > 0.9 && a > 0.001 && a < 0.999;
      const e = a * a * (3 - 2 * a);
      L.hinge.rotation.y = e * Math.PI;
      const pos = L.p.geometry.attributes.position, bow = Math.sin(e * Math.PI) * 0.28;
      for (let v = 0; v < pos.count; v++) { const x0 = L.base[v * 3]; const f = -x0 / pw; pos.array[v * 3 + 2] = Math.sin(f * Math.PI) * bow * (0.6 + 0.4 * f); }
      pos.needsUpdate = true; L.p.geometry.computeVertexNormals();
    });
  };
  g.setGlow = k => { k = Math.min(1, Math.max(0, k)); mGlow.opacity = 0.14 * k; light.intensity = 9 * k; };
  g.userData.size = { w, h, t };
  g.setOpen(0); g.setFlip(0); g.setGlow(0);
  return g;
}

// a shelf row of closed volumes seen spine-on (for a bookshelf shot). Returns a Group; volume i is group.children[i].
export function makeShelfRow(THREE, n = 9, o = {}) {
  const hgt = o.h || 4.2, tk = o.t || 0.9, dep = o.d || 3.0, gap = 0.06;
  const cols = [0x12233F, 0x5a1620, 0x12233F, 0x1d4a36, 0x12233F, 0x3a2a5c, 0x12233F, 0x5a1620, 0x12233F, 0x1d4a36];
  const gold = new THREE.MeshStandardMaterial({ color: 0xD9A93C, roughness: 0.3, metalness: 0.85, emissive: 0x2a1800 });
  const row = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const v = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: cols[i % cols.length], roughness: 0.7, metalness: 0.1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(tk, hgt, dep), m); body.position.z = -dep / 2; v.add(body);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(tk / 2, tk / 2, hgt, 20, 1, false, -Math.PI / 2, Math.PI), m); sp.scale.z = 0.4; v.add(sp);
    [-0.36, -0.14, 0.14, 0.36].forEach(f => { const b = new THREE.Mesh(new THREE.CylinderGeometry(tk / 2 + 0.012, tk / 2 + 0.012, 0.07, 20, 1, false, -Math.PI / 2, Math.PI), gold); b.scale.z = 0.44; b.position.y = f * hgt; v.add(b); });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(tk * 0.62, hgt * 0.14), gold); plate.position.set(0, hgt * 0.24, tk * 0.2 + 0.01); v.add(plate);
    v.position.x = (i - (n - 1) / 2) * (tk + gap);
    row.add(v);
  }
  row.userData = { pitch: tk + gap, h: hgt, t: tk, d: dep };
  return row;
}
