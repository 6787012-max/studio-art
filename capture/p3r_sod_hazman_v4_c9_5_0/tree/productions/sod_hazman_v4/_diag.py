import sys, time, os
from playwright.sync_api import sync_playwright
try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass
page = sys.argv[1]; secs = int(sys.argv[2])
url = 'file:///C:/projects/_studio-animatzia/productions/sod_hazman_v4/' + page + '?hq=1'
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--allow-file-access-from-files', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.add_init_script('window.__HQ_RENDER=true')
        pg.on('pageerror', lambda e: print('PAGEERR', str(getattr(e, 'stack', e))[:500], flush=True))
        pg.on('console', lambda m: print('CON', m.type, m.text[:200], flush=True))
        t0 = time.time(); pg.goto(url, wait_until='commit', timeout=60000)
        while time.time() - t0 < secs:
            time.sleep(5)
            try:
                r = pg.evaluate('window.__ready === true')
            except Exception as e:
                r = 'eval-err ' + str(e)[:80]
            print(round(time.time() - t0), 'ready', r, flush=True)
            if r is True:
                break
    finally:
        b.close()
