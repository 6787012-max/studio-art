/* s1_art - one invented landscape painted twice: as a detailed aerial photo and as a clean simple map. No text. ASCII only. Deterministic (seeded). */
import { rng } from '../toldot10g_kit/gz_kit2.js';

export const ART = { W: 1568, H: 1120 };
const W = ART.W, H = ART.H;
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/* shared world data (canvas pixel coordinates) */
export function world() {
  const r = rng(2026);
  const hill = { cx: 1210, cy: 270, rx: 400, ry: 240 };
  const lake = { cx: 270, cy: 840, rx: 200, ry: 120 };
  const river = [[1130, 330], [1010, 430], [930, 540], [800, 610], [680, 690], [540, 750], [420, 800]];
  const river2 = [[330, 940], [350, 1010], [410, 1070], [440, 1130]];
  const villages = [{ x: 820, y: 430, n: 40, rr: 80 }, { x: 1060, y: 810, n: 32, rr: 70 }, { x: 440, y: 330, n: 24, rr: 60 }];
  const roads = [[[440, 330], [600, 380], [820, 430]], [[820, 430], [900, 580], [1000, 720], [1060, 810]], [[820, 430], [700, 540], [560, 650], [470, 740]], [[1060, 810], [1300, 880], [1568, 900]], [[440, 330], [300, 280], [140, 300], [0, 260]]];
  const houses = []; villages.forEach(v => { for (let i = 0; i < v.n; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * v.rr; houses.push([v.x + Math.cos(a) * d, v.y + Math.sin(a) * d * 0.75, 7 + r() * 5, 5 + r() * 4, r() * 0.5 - 0.25]); } });
  const trees = []; for (let i = 0; i < 1500; i++) { const hx = r(), hy = r(); let x, y;
    if (i < 700) { const a = r() * 6.28, d = Math.sqrt(r()); x = hill.cx + Math.cos(a) * hill.rx * d * 1.0; y = hill.cy + Math.sin(a) * hill.ry * d; }
    else if (i < 1000) { const k = Math.floor(r() * river.length); x = river[k][0] + (hx - 0.5) * 80; y = river[k][1] + (hy - 0.5) * 80; }
    else { x = hx * W; y = hy * H; }
    trees.push([x, y, 3.5 + r() * 4.5, r()]); }
  const parcels = []; const gx = 16, gy = 11; const jit = []; for (let j = 0; j <= gy; j++) { jit.push([]); for (let i = 0; i <= gx; i++) jit[j].push([(r() - 0.5) * 34, (r() - 0.5) * 34]); }
  for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
    const pt = (a, b) => [a * W / gx + (a > 0 && a < gx ? jit[b][a][0] : 0), b * H / gy + (b > 0 && b < gy ? jit[b][a][1] : 0)];
    const q = [pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1)]; const cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2;
    const inHill = ((cx - hill.cx) / hill.rx) ** 2 + ((cy - hill.cy) / hill.ry) ** 2 < 1.05, inLake = ((cx - lake.cx) / (lake.rx + 30)) ** 2 + ((cy - lake.cy) / (lake.ry + 30)) ** 2 < 1;
    const inVil = villages.some(v => Math.hypot(cx - v.x, cy - v.y) < v.rr + 40);
    if (!inHill && !inLake && !inVil) parcels.push({ q, k: Math.floor(r() * 6), ang: r() * 3.14, orchard: r() < 0.12 });
  }
  return { hill, lake, river, river2, villages, roads, houses, trees, parcels };
}

const blob = (g, cx, cy, rx, ry, seed, n = 28, wob = 0.12) => { const r = rng(seed); g.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, k = 1 + (r() - 0.5) * wob * 2; const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); };
const poly = (g, pts) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); };
const smooth = (g, pts) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } const l = pts[pts.length - 1]; g.lineTo(l[0], l[1]); };

export function paintPhoto(Wd) {
  const c = cv(W, H), g = c.getContext('2d'), r = rng(11);
  g.fillStyle = '#8f8a58'; g.fillRect(0, 0, W, H);
  /* ground mottling */
  for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, rad = 40 + r() * 130, gr = g.createRadialGradient(x, y, 0, x, y, rad); const dk = r() < 0.5; gr.addColorStop(0, dk ? 'rgba(70,80,40,0.16)' : 'rgba(200,190,120,0.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  const pal = ['#b4a964', '#7f9a4a', '#c9b878', '#8a7a4a', '#6f8c3e', '#d1c28a'];
  Wd.parcels.forEach(p => {
    g.fillStyle = pal[p.k]; poly(g, p.q); g.closePath(); g.fill();
    g.save(); poly(g, p.q); g.closePath(); g.clip(); g.strokeStyle = 'rgba(60,50,20,0.28)'; g.lineWidth = 1.4;
    const cx = (p.q[0][0] + p.q[2][0]) / 2, cy = (p.q[0][1] + p.q[2][1]) / 2, ca = Math.cos(p.ang), sa = Math.sin(p.ang);
    for (let s = -90; s <= 90; s += p.orchard ? 14 : 6) { g.beginPath(); g.moveTo(cx - sa * s - ca * 100, cy + ca * s - sa * 100); g.lineTo(cx - sa * s + ca * 100, cy + ca * s + sa * 100); g.stroke(); }
    if (p.orchard) { g.fillStyle = 'rgba(40,90,40,0.85)'; for (let s = -90; s <= 90; s += 14) for (let u = -90; u <= 90; u += 12) { g.beginPath(); g.arc(cx - sa * s + ca * u, cy + ca * s + sa * u, 3.2, 0, 7); g.fill(); } }
    g.restore(); g.strokeStyle = 'rgba(50,60,30,0.55)'; g.lineWidth = 2.2; poly(g, p.q); g.closePath(); g.stroke();
  });
  /* hill */
  { const h = Wd.hill, gr = g.createRadialGradient(h.cx - 60, h.cy - 40, 20, h.cx, h.cy, h.rx); gr.addColorStop(0, '#6f8a46'); gr.addColorStop(0.55, '#55713a'); gr.addColorStop(1, 'rgba(70,95,50,0)'); g.fillStyle = gr; blob(g, h.cx, h.cy, h.rx, h.ry, 4, 32, 0.08); g.fill();
    for (let k = 1; k <= 6; k++) { g.strokeStyle = 'rgba(40,55,25,0.30)'; g.lineWidth = 2; blob(g, h.cx + 8, h.cy + 4, h.rx * (1 - k * 0.14), h.ry * (1 - k * 0.14), 40 + k, 32, 0.06); g.stroke(); } }
  /* lake and river */
  { const l = Wd.lake; const gr = g.createRadialGradient(l.cx, l.cy, 10, l.cx, l.cy, l.rx); gr.addColorStop(0, '#1f6f86'); gr.addColorStop(1, '#3c8a8a'); g.fillStyle = '#c9c081'; blob(g, l.cx, l.cy, l.rx + 14, l.ry + 12, 9, 30, 0.1); g.fill(); g.fillStyle = gr; blob(g, l.cx, l.cy, l.rx, l.ry, 9, 30, 0.1); g.fill(); }
  [Wd.river, Wd.river2].forEach(pts => { g.lineCap = 'round'; g.strokeStyle = '#c9c081'; g.lineWidth = 30; smooth(g, pts); g.stroke(); g.strokeStyle = '#2f7f8a'; g.lineWidth = 17; smooth(g, pts); g.stroke(); g.strokeStyle = 'rgba(150,215,225,0.55)'; g.lineWidth = 5; smooth(g, pts); g.stroke(); });
  /* roads */
  Wd.roads.forEach(pts => { g.lineJoin = 'round'; g.strokeStyle = '#d8cfa6'; g.lineWidth = 15; smooth(g, pts); g.stroke(); g.strokeStyle = '#b3a57a'; g.lineWidth = 9; smooth(g, pts); g.stroke(); g.strokeStyle = 'rgba(240,235,210,0.5)'; g.lineWidth = 1.5; g.setLineDash([14, 14]); smooth(g, pts); g.stroke(); g.setLineDash([]); });
  /* trees with shadows */
  Wd.trees.forEach(t => { const [x, y, s, k] = t; g.fillStyle = 'rgba(20,30,10,0.35)'; g.beginPath(); g.ellipse(x + s * 0.7, y + s * 0.6, s, s * 0.8, 0, 0, 7); g.fill();
    g.fillStyle = k < 0.5 ? '#2f5f2a' : '#3f7a34'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); g.fillStyle = 'rgba(190,230,130,0.5)'; g.beginPath(); g.arc(x - s * 0.3, y - s * 0.3, s * 0.45, 0, 7); g.fill(); });
  /* houses */
  Wd.houses.forEach(h => { const [x, y, w, d, a] = h; g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(30,25,10,0.4)'; g.fillRect(-w / 2 + 3, -d / 2 + 3, w, d); g.fillStyle = '#efe6d0'; g.fillRect(-w / 2, -d / 2, w, d);
    g.fillStyle = '#b5472c'; g.fillRect(-w / 2, -d / 2, w, d / 2); g.fillStyle = '#d96a44'; g.fillRect(-w / 2, -d / 2, w, d / 4); g.restore(); });
  /* grain and light fall-off */
  const gr = rng(99); for (let i = 0; i < 24000; i++) { g.fillStyle = gr() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,230,0.05)'; g.fillRect(gr() * W, gr() * H, 2, 2); }
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}

export function paintMap(Wd) {
  const c = cv(W, H), g = c.getContext('2d'), r = rng(12);
  g.fillStyle = '#f6f0dc'; g.fillRect(0, 0, W, H);
  /* faint paper grid */
  g.strokeStyle = 'rgba(160,140,100,0.16)'; g.lineWidth = 1.5; for (let x = 0; x <= W; x += 98) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 98) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  /* two pale field tints only */
  Wd.parcels.forEach(p => { if (p.k % 3 === 0) { g.fillStyle = 'rgba(214,226,170,0.55)'; poly(g, p.q); g.closePath(); g.fill(); } });
  /* hill: brown contour rings */
  { const h = Wd.hill; g.fillStyle = 'rgba(212,190,150,0.55)'; blob(g, h.cx, h.cy, h.rx, h.ry, 4, 32, 0.08); g.fill();
    for (let k = 0; k <= 5; k++) { g.strokeStyle = k % 2 ? '#c4a070' : '#a97c4a'; g.lineWidth = k % 2 ? 2 : 3.4; blob(g, h.cx + 8, h.cy + 4, h.rx * (1 - k * 0.17), h.ry * (1 - k * 0.17), 40 + k, 32, 0.06); g.stroke(); }
    g.fillStyle = '#7a4c24'; g.beginPath(); g.moveTo(h.cx + 8, h.cy - 40); g.lineTo(h.cx + 40, h.cy + 14); g.lineTo(h.cx - 24, h.cy + 14); g.closePath(); g.fill(); }
  /* lake and river in blue */
  { const l = Wd.lake; g.fillStyle = '#9fd4ec'; blob(g, l.cx, l.cy, l.rx, l.ry, 9, 30, 0.1); g.fill(); g.strokeStyle = '#3f8fc0'; g.lineWidth = 5; g.stroke(); }
  [Wd.river, Wd.river2].forEach(pts => { g.lineCap = 'round'; g.strokeStyle = '#4aa0d8'; g.lineWidth = 8; smooth(g, pts); g.stroke(); });
  /* roads: white casing, orange core */
  Wd.roads.forEach(pts => { g.lineJoin = 'round'; g.strokeStyle = '#ffffff'; g.lineWidth = 17; smooth(g, pts); g.stroke(); g.strokeStyle = '#e8923a'; g.lineWidth = 9; smooth(g, pts); g.stroke(); });
  /* villages: one red dot with white ring each, plus a soft blot for the built-up area */
  Wd.villages.forEach(v => { g.fillStyle = 'rgba(214,120,90,0.30)'; g.beginPath(); g.arc(v.x, v.y, v.rr * 0.8, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(v.x, v.y, 30, 0, 7); g.fill(); g.fillStyle = '#d2432b'; g.beginPath(); g.arc(v.x, v.y, 21, 0, 7); g.fill(); });
  g.strokeStyle = '#3a2a18'; g.lineWidth = 8; g.strokeRect(10, 10, W - 20, H - 20); g.strokeStyle = '#c9a24a'; g.lineWidth = 3; g.strokeRect(24, 24, W - 48, H - 48);
  return c;
}
