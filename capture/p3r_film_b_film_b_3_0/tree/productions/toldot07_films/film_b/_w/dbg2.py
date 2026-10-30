import sys, time, io
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil, heavy_lock
from playwright.sync_api import sync_playwright
from PIL import Image
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_b_dbg')
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 640, 'height': 360})
        pg.goto('http://127.0.0.1:8790/productions/toldot07_films/film_b/film_b.html?hq=1&w=640&nowarm=1&v=%d' % int(time.time()))
        pg.wait_for_function('window.__ready === true', timeout=600000)
        pg.evaluate("(()=>{const w=window.__dbg.WORLD.beachS; w.mirror.userData.setOp=()=>{}; w.mirror.visible=false;})()")
        names = pg.evaluate("window.__dbg.WORLD.beachS.g.children.map((c,i)=>i+':'+c.type+':'+(c.children.length))")
        print(names)
        def px():
            pg.evaluate('t => window.__seek(t)', 20)
            im = Image.open(io.BytesIO(pg.screenshot(type='png'))).convert('RGB')
            return im.getpixel((370, 310))
        print('base', px())
        n = len(names)
        for i in range(n):
            pg.evaluate("i=>{const c=window.__dbg.WORLD.beachS.g.children[i]; c.userData._v=c.visible; c.visible=false;}", i)
            # showWorld resets only group; child visibility persists
            v = px()
            pg.evaluate("i=>{const c=window.__dbg.WORLD.beachS.g.children[i]; c.visible=c.userData._v;}", i)
            if v != px.__defaults__ if False else True:
                print(i, names[i], v)
    finally:
        b.close()
