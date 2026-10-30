"""usage: python _shot.py <out_sheet.jpg> <times_csv> [cols] [thumbw] [hq 0|1] [page]
Renders film_a.html at the given times (one browser, heavy_lock, idle priority, closed at the end) and makes a labelled JPG sheet."""
import sys, os, io, time
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil
import heavy_lock
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

out = sys.argv[1]
times = [float(x) for x in sys.argv[2].split(',')]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 640
hq = sys.argv[5] if len(sys.argv) > 5 else '0'
page = sys.argv[6] if len(sys.argv) > 6 else 'film_a.html'
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_a_shot')
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
imgs = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        W, H = (1920, 1080) if hq == '1' else (1280, 720)
        pg = b.new_page(viewport={'width': W, 'height': H})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        q = 'times=' + ','.join(str(t) for t in times) + ('&hq=1' if hq == '1' else '')
        if len(sys.argv) > 7 and sys.argv[7] == 'full':
            q = ('hq=1' if hq == '1' else 'x=1')
        pg.goto('http://localhost:8790/productions/toldot07_films/film_a/' + page + '?' + q)
        try:
            pg.wait_for_function('window.__ready === true', timeout=900000)
        except Exception as e:
            errs.append('TIMEOUT ' + str(e)[:160])
        for t in times:
            try:
                pg.evaluate('t => window.__seek(t)', t)
            except Exception as e:
                errs.append('seek %s: %s' % (t, str(e)[:200]))
            png = pg.screenshot(type='jpeg', quality=86)
            imgs.append((t, Image.open(io.BytesIO(png)).convert('RGB')))
        print('errors:', errs[:8], flush=True)
        print('window errors:', pg.evaluate('window.__errors')[:5], flush=True)
    finally:
        b.close()
th = int(tw * 9 / 16)
rows = (len(imgs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 24) + 6), (232, 226, 214))
d = ImageDraw.Draw(sheet)
for i, (t, im) in enumerate(imgs):
    x = 6 + (i % cols) * (tw + 6); y = 6 + (i // cols) * (th + 24)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y)); d.text((x + 2, y + th + 4), '%.2f' % t, fill=(20, 20, 20))
sheet.save(out, quality=86)
print('saved', out, sheet.size, flush=True)
