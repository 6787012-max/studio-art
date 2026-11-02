import sys, json
from playwright.sync_api import sync_playwright
page = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'])
    try:
        pg = b.new_page(viewport={'width': 640, 'height': 360})
        pg.goto('file:///C:/projects/_studio-animatzia/productions/sod_hazman_v4/' + page + '?hq=1', wait_until='commit', timeout=60000)
        pg.wait_for_function('window.__ready === true', timeout=120000)
        s = pg.evaluate('JSON.stringify(window.__shots)')
        print(s[:1800])
        print(pg.evaluate('window.__dur'))
    finally:
        b.close()
