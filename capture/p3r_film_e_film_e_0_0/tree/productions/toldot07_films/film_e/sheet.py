"""usage: python sheet.py <out_dir> <times_csv> [width=960] [cols=3] [sheet_name=sheet.jpg]
Renders film_e.html at the given global times (JPG) and builds a labelled contact sheet (JPG)."""
import sys, os, time
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
import psutil
import heavy_lock
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

out = sys.argv[1]
times = [float(x) for x in sys.argv[2].split(',')]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 960
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 3
name = sys.argv[5] if len(sys.argv) > 5 else 'sheet.jpg'
psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
heavy_lock.acquire('film_e_sheet')
os.makedirs(out, exist_ok=True)
h = round(w * 9 / 16)
files = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': w, 'height': h})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        t0 = time.time()
        pg.goto('http://127.0.0.1:8790/productions/toldot07_films/film_e/film_e.html?hq=1&w=%d&v=%d%s' % (w, int(time.time()), '&nowarm=1' if len(sys.argv)>6 else ''))
        try:
            pg.wait_for_function('window.__ready === true', timeout=900000)
        except Exception as e:
            errs.append('TIMEOUT ' + str(e)[:160])
        print('ready in %.1fs warm=%s' % (time.time() - t0, pg.evaluate('window.__nwarm')), flush=True)
        for t in times:
            try:
                pg.evaluate('t => window.__seek(t)', t)
            except Exception as e:
                errs.append('seek %.2f: %s' % (t, str(e)[:200]))
            fn = os.path.join(out, 't_%07.2f.jpg' % t)
            pg.screenshot(path=fn, type='jpeg', quality=86, timeout=240000); print('shot', t, flush=True)
            files.append((t, fn))
        print('errors:', [e[:160] for e in errs[:4]], flush=True)
        print('window errors:', [e[:300] for e in pg.evaluate('window.__errors')[:3]], flush=True)
    finally:
        b.close()
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w + (cols + 1) * 6, rows * (h + 24) + 6), (232, 226, 214))
d = ImageDraw.Draw(sheet)
for i, (t, fn) in enumerate(files):
    im = Image.open(fn).convert('RGB')
    x = 6 + (i % cols) * (w + 6); y = 6 + (i // cols) * (h + 24)
    sheet.paste(im, (x, y + 20)); d.text((x + 2, y + 4), 't=%.2f' % t, fill=(30, 30, 30))
sheet.save(os.path.join(out, name), quality=84)
print('saved', os.path.join(out, name), flush=True)
