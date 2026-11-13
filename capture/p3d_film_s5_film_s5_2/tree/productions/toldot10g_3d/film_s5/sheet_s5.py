"""Contact sheet (JPG) for film_s5 (toldot10g). usage: python sheet_s5.py [out.jpg] [t t t ...] ; default = 3 frames per shot -> SHEET_s5.jpg"""
import sys, os, io
import psutil
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
HERE = os.path.dirname(os.path.abspath(__file__)).replace('\\', '/')
DEFAULT = [1.5, 5.0, 12.0, 18.0, 26.0, 31.0, 36.0, 43.0, 50.0, 58.0, 64.0, 68.0, 73.0, 79.0, 83.0, 88.0, 93.0, 94.5, 99.0, 104.0, 113.0]
out = sys.argv[1] if len(sys.argv) > 1 else HERE + '/SHEET_s5.jpg'
times = [float(x) for x in sys.argv[2:]] or DEFAULT
frames = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 1280, 'height': 720})
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)[:300]))
        pg.on('console', lambda m: errs.append(m.type + ' ' + m.text[:300]) if m.type == 'error' else None)
        pg.goto('http://localhost:8790/productions/toldot10g_3d/film_s5/film_s5.html')
        try:
            pg.wait_for_function('window.__ready === true', timeout=420000)
        except Exception as e:
            errs.append('TIMEOUT ' + str(e)[:160])
        for t in times:
            pg.evaluate('t => window.__seek(t)', t)
            png = pg.screenshot(type='jpeg', quality=88)
            frames.append((t, Image.open(io.BytesIO(png)).convert('RGB')))
        print('errors:', pg.evaluate('window.__errors'), errs[:6])
    finally:
        b.close()
cols = 3; cw, ch = 533, 300
rows = (len(frames) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cw, rows * ch), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (t, im) in enumerate(frames):
    x, y = (i % cols) * cw, (i // cols) * ch
    sheet.paste(im.resize((cw, ch)), (x, y))
    d.rectangle([x, y, x + 60, y + 13], fill=(0, 0, 0)); d.text((x + 3, y + 2), 't=%.1f' % t, fill=(255, 255, 0))
sheet.save(out, quality=84)
print('saved', sheet.size, out)
