import sys
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil, heavy_lock
from playwright.sync_api import sync_playwright
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_d')
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 320, 'height': 180})
        pg.goto('http://127.0.0.1:8791/productions/toldot07_films/film_d/film_d.html?nowarm=1', timeout=300000, wait_until='commit')
        pg.wait_for_function('window.__ready === true', timeout=900000)
        print(pg.evaluate("async () => { const m = await import('/productions/toldot07_films/film_d/d_map.js'); return JSON.stringify({H: m.HAIFA, A: m.ASHDOD}); }"))
    finally:
        b.close()
