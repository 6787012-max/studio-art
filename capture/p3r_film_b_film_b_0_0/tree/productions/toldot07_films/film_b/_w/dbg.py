import sys, time
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil, heavy_lock
from playwright.sync_api import sync_playwright
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_b_dbg')
js = sys.argv[1]; out = sys.argv[2]; t = float(sys.argv[3])
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 640, 'height': 360})
        pg.goto('http://127.0.0.1:8790/productions/toldot07_films/film_b/film_b.html?hq=1&w=640&nowarm=1&v=%d' % int(time.time()))
        pg.wait_for_function('window.__ready === true', timeout=600000)
        print(pg.evaluate(js))
        pg.evaluate('t => window.__seek(t)', t)
        pg.screenshot(path=out, type='jpeg', quality=85)
        print(pg.evaluate('window.__errors'))
    finally:
        b.close()
