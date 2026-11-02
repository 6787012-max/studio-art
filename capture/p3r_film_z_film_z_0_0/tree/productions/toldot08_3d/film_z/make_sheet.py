"""usage: python make_sheet.py <out_sheet.jpg> <t1,t2,...> [cols]  - renders film_z frames (JPG only) and builds a labelled contact sheet <= 1600 px wide."""
import sys, os, io
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

out = sys.argv[1]
times = [float(x) for x in sys.argv[2].split(',')]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
frames = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 1280, 'height': 720})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        pg.goto('http://127.0.0.1:8790/productions/toldot08_3d/film_z/film_z.html' + (('?' + sys.argv[4]) if len(sys.argv) > 4 else ''))
        try:
            pg.wait_for_function('window.__ready === true', timeout=800000)
        except Exception as e:
            errs.append('TIMEOUT ' + str(e)[:160])
        for t in times:
            try:
                pg.evaluate('t => window.__seek(t)', t)
            except Exception as e:
                errs.append('seek %s: %s' % (t, str(e)[:200]))
            data = pg.screenshot(type='jpeg', quality=82)
            frames.append((t, Image.open(io.BytesIO(data)).convert('RGB')))
        print('ERRS', errs[:6], flush=True)
    finally:
        b.close()
tw = min(780, 1600 // cols)
th = int(tw * 9 / 16)
rows = (len(frames) + cols - 1) // cols
sheet = Image.new('RGB', (tw * cols, th * rows), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (t, im) in enumerate(frames):
    im = im.resize((tw, th))
    x, y = (i % cols) * tw, (i // cols) * th
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + 90, y + 18], fill=(0, 0, 0))
    d.text((x + 4, y + 3), 't=%.1f' % t, fill=(255, 255, 0))
sheet.save(out, quality=82)
print('saved', out, sheet.size)
