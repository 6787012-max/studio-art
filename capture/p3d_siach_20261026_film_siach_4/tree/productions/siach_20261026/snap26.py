# -*- coding: utf-8 -*-
"""snap26.py <film.html> <out_dir> <shot_id> [n] : JPG contact sheet (n frames of one shot, evenly spaced) at 640x360 per frame. JPG only."""
import io, os, sys, base64, time
sys.path.insert(0, 'C:/projects/_studio-animatzia/tools')
try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass
from playwright.sync_api import sync_playwright
from PIL import Image
from check import LAUNCH_ARGS

film, out, sid = sys.argv[1], sys.argv[2], sys.argv[3]
n = int(sys.argv[4]) if len(sys.argv) > 4 else 6
L0 = float(sys.argv[5]) if len(sys.argv) > 6 else None
L1 = float(sys.argv[6]) if len(sys.argv) > 6 else None
os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    br = p.chromium.launch(channel='msedge', headless=True, args=LAUNCH_ARGS)
    try:
        pg = br.new_page(viewport={'width': 1280, 'height': 720})
        pg.add_init_script('window.__HQ_RENDER = true;')
        errs = []
        pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.goto('file:///' + film.replace(os.sep, '/') + '?hq=1', wait_until='load', timeout=300000)
        pg.wait_for_function('window.__ready === true', timeout=300000)
        shots = pg.evaluate('window.__shots')
        sh = [s for s in shots if s['id'] == sid][0]
        frames = []
        for i in range(n):
            t = sh['start'] + 0.15 + (sh['dur'] - 0.3) * i / max(1, n - 1)
            if L0 is not None:
                t = sh['start'] + L0 + (L1 - L0) * i / max(1, n - 1)
            pg.evaluate('(t)=>window.__seek(t)', t)
            data = pg.evaluate("document.getElementById('c').toDataURL('image/jpeg',0.85)")
            im = Image.open(io.BytesIO(base64.b64decode(data.split(',')[1]))).convert('RGB').resize((640, 360))
            frames.append((t - sh['start'], im))
        cols = 3
        rows = (n + cols - 1) // cols
        sheet = Image.new('RGB', (640 * cols, 360 * rows), (20, 20, 20))
        from PIL import ImageDraw
        for i, (lt, im) in enumerate(frames):
            sheet.paste(im, ((i % cols) * 640, (i // cols) * 360))
            ImageDraw.Draw(sheet).text(((i % cols) * 640 + 6, (i // cols) * 360 + 4), '%s t=%.1f' % (sid, lt), fill=(255, 255, 0))
        fp = os.path.join(out, 'snap_%s%s.jpg' % (sid, ('_%g' % L0) if L0 is not None else ''))
        sheet.save(fp, quality=82)
        print('SHEET', fp, 'ERR', errs[:3])
    finally:
        br.close()
