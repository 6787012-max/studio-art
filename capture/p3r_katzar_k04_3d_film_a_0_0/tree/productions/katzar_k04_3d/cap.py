# -*- coding: utf-8 -*-
"""Quick JPG stills of film_a.html:  python cap.py <out_dir> t1,t2,... [--w 960]   (heavy_lock, idle priority, JPG only)"""
import os, sys, time
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass
from playwright.sync_api import sync_playwright
import heavy_lock

out = sys.argv[1]; times = [float(x) for x in sys.argv[2].split(',')]
w = 960
if '--w' in sys.argv: w = int(sys.argv[sys.argv.index('--w') + 1])
h = w * 9 // 16
os.makedirs(out, exist_ok=True)
url = 'file:///C:/projects/_studio-animatzia/productions/katzar_k04_3d/film_a.html?capture&hq=1'
if '--nowarm' in sys.argv: url += '&nowarm'
heavy_lock.acquire('k04stills')
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--allow-file-access-from-files', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': w, 'height': h})
        pg.add_init_script('window.__HQ_RENDER = true;')
        pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
        pg.on('console', lambda m: errs.append(m.text[:400]) if m.type == 'error' else None)
        t0 = time.time()
        pg.goto(url, wait_until='load')
        try:
            pg.wait_for_function('window.__ready === true', timeout=240000)
        except Exception:
            print('NOT READY', errs[:6]); raise SystemExit(2)
        print('ready %.1fs warm=%s' % (time.time() - t0, pg.evaluate('window.__nwarm')))
        for t in times:
            t1 = time.time()
            pg.evaluate('window.__seek(%f)' % t)
            path = os.path.join(out, 'f_%06.2f.jpg' % t)
            pg.screenshot(path=path, type='jpeg', quality=88)
            print('t=%.2f draw+shot %.2fs' % (t, time.time() - t1), flush=True)
    finally:
        b.close()
for e in errs[:10]:
    print('ERR', e)
