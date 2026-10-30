import sys
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil, heavy_lock
from playwright.sync_api import sync_playwright
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_d')
JS = """t => { window.__seek(t); const V = window.__R.root.position.constructor; const out = {};
 for (const [k, o] of [['R', window.__R], ['B', window.__B]]) { let mn = 1e9, mx = -1e9, x0 = 1e9, x1 = -1e9; o.root.updateMatrixWorld(true);
  o.root.traverse(m => { if (!m.isMesh || !m.visible) return; const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i += 3) { const v = new V(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(m.matrixWorld); mn = Math.min(mn, v.y); mx = Math.max(mx, v.y); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); } });
  out[k] = [Math.round(mn), Math.round(mx), Math.round(mx - mn), Math.round(x1 - x0)]; }
 return JSON.stringify(out); }"""
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 320, 'height': 180})
        pg.goto('http://127.0.0.1:8791/productions/toldot07_films/film_d/film_d.html?nowarm=1', timeout=300000, wait_until='commit')
        pg.wait_for_function('window.__ready === true', timeout=900000)
        print(pg.evaluate(JS, float(sys.argv[1])))
    finally:
        b.close()
