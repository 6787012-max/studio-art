import sys
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import heavy_lock
from playwright.sync_api import sync_playwright
heavy_lock.acquire('k04proj')
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'])
    try:
        pg = b.new_page(viewport={'width': 640, 'height': 360})
        pg.goto('file:///C:/projects/_studio-animatzia/productions/katzar_k04_3d/film_a.html?capture&nowarm', wait_until='load')
        pg.wait_for_function('window.__ready === true', timeout=120000)
        print(pg.evaluate('''() => { const out = []; for (const t of [204, 208]) { window.__seek(t); const A = window.__ACT; out.push(t); } return out; }'''))
    finally:
        b.close()
