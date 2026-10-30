import sys
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil, heavy_lock
from playwright.sync_api import sync_playwright
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_z')
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 640, 'height': 360})
        pg.goto('http://localhost:8790/productions/toldot07_films/film_z/film_z.html?hq=1&nowarm=1')
        pg.wait_for_function('window.__ready === true', timeout=300000)
        pg.evaluate('window.__seek(70)')
        print(pg.evaluate('''() => { const t = window.__z.fgTufts[0]; const bb = new (t.constructor)(); let n=0, vis=[]; t.traverse(o=>{n++; if(o.isMesh) vis.push(o.visible)}); return JSON.stringify({vis:t.visible, pos:t.position, sc:t.scale, n, meshes: vis.length, dbg: window.__dbgcam}); }'''))
    finally:
        b.close()
