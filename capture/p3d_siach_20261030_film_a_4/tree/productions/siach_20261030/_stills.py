# -*- coding: utf-8 -*-
"""Capture JPG stills at given times: python _stills.py <outdir> t1 t2 ... (ASCII only)."""
import sys, os
from playwright.sync_api import sync_playwright
out = sys.argv[1]; times = [float(x) for x in sys.argv[2:]]
os.makedirs(out, exist_ok=True)
url = 'file:///C:/projects/_studio-animatzia/productions/siach_20261030/film_a.html?capture&hq=1'
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 1280, 'height': 720})
        pg.on('pageerror', lambda e: errs.append((getattr(e,'stack',None) or str(e))[:900]))
        pg.on('console', lambda m: errs.append(m.text[:500]) if m.type == 'error' else None)
        pg.goto(url, wait_until='load')
        try:
            pg.wait_for_function('window.__ready === true', timeout=int(os.environ.get('RDY', '90000')))
        except Exception:
            print('NOT READY; errors:', pg.evaluate('window.__errors'))
            for e in errs[:8]: print('ERR', e)
            sys.exit(1)
        for t in times:
            pg.evaluate('t => window.__seek(t)', t)
            pg.screenshot(path=os.path.join(out, 'f_%06.2f.jpg' % t), type='jpeg', quality=82)
            hb = pg.evaluate('t => window.__heroBox(t)', t)
            print('t=%.1f' % t, 'hero', None if not hb else (round(hb['heightFrac'], 2), round(hb['bottomFrac'], 2), hb['visible']))
    finally:
        b.close()
for e in errs[:10]:
    print('ERR', e)
