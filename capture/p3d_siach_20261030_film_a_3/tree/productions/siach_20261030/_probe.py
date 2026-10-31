# -*- coding: utf-8 -*-
import sys, json
from playwright.sync_api import sync_playwright
expr = sys.argv[1]
url = 'file:///C:/projects/_studio-animatzia/productions/siach_20261030/film_a.html?capture&hq=1&nowarm'
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 320, 'height': 180})
        pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
        pg.on('console', lambda m: errs.append(m.text[:400]) if m.type == 'error' else None)
        pg.goto(url, wait_until='load')
        pg.wait_for_function('window.__ready === true', timeout=240000)
        print(json.dumps(pg.evaluate(expr)))
    finally:
        b.close()
for e in errs[:10]:
    print('ERR', e)
