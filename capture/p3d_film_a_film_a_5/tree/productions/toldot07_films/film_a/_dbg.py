import sys, os
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil, heavy_lock
from playwright.sync_api import sync_playwright
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_a_dbg')
t = sys.argv[1]; js = sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 640, 'height': 360})
        pg.goto('http://localhost:8790/productions/toldot07_films/film_a/film_a.html?times=' + t)
        pg.wait_for_function('window.__ready === true', timeout=600000)
        for tt in t.split(','):
            pg.evaluate('t => window.__seek(t)', float(tt))
            print(tt, pg.evaluate(js))
    finally:
        b.close()
