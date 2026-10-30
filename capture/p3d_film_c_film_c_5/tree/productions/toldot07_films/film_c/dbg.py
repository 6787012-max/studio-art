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
        pg.on('pageerror', lambda e: msgs.append('PAGEERR ' + str(e)[:400]))
        pg.goto('http://localhost:8790/productions/toldot07_films/film_c/film_c.html?hq=1&nowarm=1', timeout=120000, wait_until='commit')
        try:
            pg.wait_for_function('window.__ready === true', timeout=90000)
        except Exception as e:
            print('NOT READY')
        print(msgs[:12])
        print(pg.evaluate('JSON.stringify(window.__errors)'))
    finally:
        b.close()
