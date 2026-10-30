import sys
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import heavy_lock
from playwright.sync_api import sync_playwright
heavy_lock.acquire('film_c')
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 400, 'height': 225}); msgs = []
        pg.on('console', lambda m: msgs.append(m.type + ' ' + m.text[:300]))
        pg.goto('http://localhost:8790/productions/toldot07_films/film_c/film_c.html?hq=1')
        pg.wait_for_function('window.__ready === true', timeout=900000)
        for t in [10, 100]:
            pg.evaluate('t => window.__seek(t)', t)
        print(msgs[:10])
        print(pg.evaluate('JSON.stringify({p: window.__dbgcam})'))
    finally:
        b.close()
