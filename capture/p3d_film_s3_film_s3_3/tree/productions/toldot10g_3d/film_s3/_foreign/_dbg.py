"""timing probe: python _dbg.py t t t ..."""
import sys, time, io
import psutil
from playwright.sync_api import sync_playwright
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
times = [float(x) for x in sys.argv[1:]]
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 1280, 'height': 720})
        pg.set_default_timeout(240000)
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)[:300]))
        pg.on('console', lambda m: errs.append(m.type + ' ' + m.text[:300]) if m.type in ('error', 'warning') else None)
        t0 = time.time()
        pg.goto('http://localhost:8790/productions/toldot10g_3d/film_s3/film_s3.html')
        print('goto', round(time.time() - t0, 1))
        try:
            pg.wait_for_function('window.__ready === true', timeout=420000)
        except Exception as e:
            print('TIMEOUT ready', str(e)[:100])
        print('ready', round(time.time() - t0, 1), pg.evaluate('window.__errors'))
        for t in times:
            a = time.time()
            pg.evaluate('t => window.__seek(t)', t)
            c = time.time()
            pg.screenshot(type='jpeg', quality=50)
            print('t', t, 'seek', round(c - a, 1), 'shot', round(time.time() - c, 1))
        print('errors:', pg.evaluate('window.__errors'), errs[:8])
    finally:
        b.close()
