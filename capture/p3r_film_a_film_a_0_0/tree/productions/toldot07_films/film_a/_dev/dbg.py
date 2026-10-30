import sys
sys.path.insert(0,'C:/projects/_studio-animatzia/tools')
import heavy_lock
from playwright.sync_api import sync_playwright
heavy_lock.acquire('film_a_dbg')
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    try:
        pg=b.new_page(viewport={'width':1280,'height':720})
        pg.goto('http://localhost:8790/productions/toldot07_films/film_a/film_a.html?times=250')
        pg.wait_for_function('window.__ready===true',timeout=900000)
        pg.evaluate('t=>window.__seek(t)',250)
        print(pg.evaluate('()=>{const c=window.__o.cam;const d=new window.__o.cam.position.constructor();c.getWorldDirection(d);return [c.position.toArray(),d.toArray(),c.fov]}'))
    finally:
        b.close()
