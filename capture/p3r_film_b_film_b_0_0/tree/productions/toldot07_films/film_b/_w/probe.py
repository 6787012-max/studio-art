import sys
sys.path.insert(0,'C:/projects/_studio-animatzia/tools')
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge',args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':320,'height':180})
    pg.goto('http://127.0.0.1:8790/productions/toldot07_films/film_b/film_b.html?hq=1&w=320&nowarm=1')
    pg.wait_for_function('window.__ready===true',timeout=600000)
    print(pg.evaluate(sys.argv[1]))
    b.close()
