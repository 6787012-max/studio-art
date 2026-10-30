"""usage: python snap.py <out_prefix> <w> <t1,t2,...> [query]  -> renders film_c.html at the given absolute times to JPG (heavy_lock, closed browser)."""
import sys, os
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil
import heavy_lock
from playwright.sync_api import sync_playwright
out, w, seeks = sys.argv[1], int(sys.argv[2]), [float(x) for x in sys.argv[3].split(',')]
q = sys.argv[4] if len(sys.argv) > 4 else 'hq=1'
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_c')
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': w, 'height': int(w * 9 / 16)})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
        pg.on('console', lambda m: errs.append(m.text[:400]) if m.type == 'error' else None)
        pg.goto('http://localhost:8790/productions/toldot07_films/film_c/film_c.html?' + q)
        try:
            pg.wait_for_function('window.__ready === true', timeout=900000)
        except Exception as e:
            errs.append('TIMEOUT ' + str(e)[:160])
        for t in seeks:
            try:
                pg.evaluate('t => window.__seek(t)', t)
            except Exception as e:
                errs.append('SEEK %.2f %s' % (t, str(e)[:300]))
                continue
            fn = '%s_%06.2f.jpg' % (out, t)
            pg.screenshot(path=fn, type='jpeg', quality=85)
            print('saved', fn, flush=True)
        print('errors:', errs[:6], pg.evaluate('window.__errors'), flush=True)
    finally:
        b.close()
