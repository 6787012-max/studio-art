import sys
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil, heavy_lock
from playwright.sync_api import sync_playwright
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_d')
T = float(sys.argv[1])
JS = """t => { window.__seek(t); const c = window.__dbgcam; const THREE = window.__THREE; const out = [];
  const p = window.__cam.position; window.__scene.traverse(o => { if (!o.isMesh) return; let v = true, q = o; while (q) { if (!q.visible) { v = false; break; } q = q.parent; } if (!v) return;
    o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); if (bb.containsPoint(p)) out.push([o.geometry.type, bb.min.toArray().map(Math.round), bb.max.toArray().map(Math.round), (o.parent && o.parent.name) || '']); });
  const gp = o => { let v = true, q = o.root; while (q) { if (!q.visible) { v = false; break; } q = q.parent; } return [o.root.position.toArray().map(Math.round), v]; }; return JSON.stringify({ B: gp(window.__B), R: gp(window.__R), cam: c, inside: out.slice(0, 12), n: out.length }); }"""
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 320, 'height': 180})
        pg.goto('http://127.0.0.1:8791/productions/toldot07_films/film_d/film_d.html?hq=1&dbg=1', timeout=300000, wait_until='commit')
        pg.wait_for_function('window.__ready === true', timeout=900000)
        print(pg.evaluate(JS, T))
    finally:
        b.close()
