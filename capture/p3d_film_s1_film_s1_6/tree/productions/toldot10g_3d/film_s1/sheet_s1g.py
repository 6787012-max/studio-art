# -*- coding: utf-8 -*-
"""Build film_s1/SHEET_s1.jpg: 3 frames per shot with a time label (JPG only, width 1560).
   python productions/toldot10g_3d/film_s1/sheet_s1g.py   (run from C:/projects/_studio-animatzia). One browser, closed by stills.py."""
import glob
import os
import subprocess
import sys

from PIL import Image, ImageDraw

ROOT = 'C:/projects/_studio-animatzia'
OUT = ROOT + '/productions/toldot10g_3d/film_s1/_sheet_frames'
ROWS = [('a', [4, 13, 24]), ('b', [33, 41, 49]), ('c', [57, 63.8, 69]), ('d', [75, 79.6, 80.6, 83.6]), ('x', [88, 95, 102]), ('q', [108, 112.5, 114.2]), ('e', [119, 124.5, 134])]
times = [t for _, ts in ROWS for t in ts]
if '--skip-render' not in sys.argv:
    cmd = [sys.executable, ROOT + '/tools/stills.py', ROOT + '/productions/toldot10g_3d/film_s1/film_s1.html', OUT, '--times', ','.join(str(t) for t in times),
           '--size', '1280x720', '--fmt', 'jpg', '--timeout', '900']
    subprocess.run(cmd, check=True)
W, H = 390, 220
sheet = Image.new('RGB', (W * 4, (H + 0) * len(ROWS)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for r, (name, ts) in enumerate(ROWS):
    for c, t in enumerate(ts):
        cands = glob.glob(OUT + '/still_%05.2f.jpg' % t) or glob.glob(OUT + '/*%05.2f*.jpg' % t)
        if not cands:
            print('missing frame', t)
            continue
        im = Image.open(cands[0]).convert('RGB').resize((W, H), Image.LANCZOS)
        sheet.paste(im, (c * W, r * H))
        d.rectangle([c * W, r * H, c * W + 108, r * H + 16], fill=(0, 0, 0))
        d.text((c * W + 4, r * H + 2), 's1%s  t=%.1f' % (name, t), fill=(255, 255, 255))
sheet.save(ROOT + '/productions/toldot10g_3d/film_s1/SHEET_s1.jpg', quality=88)
print('saved', sheet.size)
