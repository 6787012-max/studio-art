# -*- coding: utf-8 -*-
"""מרנדר סרט תלת-ממד בכמה חלקים במקביל בשרתים (GitHub), ומחבר אותם לסרט אחד.
    python productions/azamra342/render_parts.py <film_id> <total_seconds> [--part 70]
כל חלק = עותק של דף הסרט עם window.__T0 (שנייה התחלה), נשלח ב-capture_remote בנפרד; בסוף ffmpeg concat.
פלט: productions/azamra342/render/<film_id>/out.mp4"""
import argparse
import io
import math
import os
import subprocess
import sys
import threading

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
ap = argparse.ArgumentParser()
ap.add_argument('film'); ap.add_argument('total', type=float); ap.add_argument('--part', type=float, default=70)
a = ap.parse_args()
src = io.open(os.path.join(HERE, a.film + '.html'), encoding='utf-8').read()
n = max(1, math.ceil(a.total / a.part)); L = a.total / n
INC = ['productions/azamra342/road.js', 'productions/azamra342/shul.js', 'lib/people_pro.js', 'lib/stage3d.js', 'lib/figure3d.js', 'lib/geo_eretz.js', 'node_modules/three/build/three.module.js', 'node_modules/three/build/three.core.js']
outdir = os.path.join(HERE, 'render', a.film); os.makedirs(outdir, exist_ok=True)
res = {}


def one(i):
    t0, d = i * L, (L if i < n - 1 else a.total - i * L)
    page = os.path.join(HERE, '_part_%s_%d.html' % (a.film, i))
    io.open(page, 'w', encoding='utf-8').write(src.replace('<script type="importmap">', '<script>window.__T0=%.4f;</script>\n<script type="importmap">' % t0, 1))
    job = 'p3d_%s_%d' % (a.film, i)
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'capture_remote.py'), job, os.path.relpath(page, ROOT).replace('\\', '/'),
                        os.path.relpath(os.path.join(outdir, 'part%02d' % i), ROOT).replace('\\', '/'), '--dur', '%.4f' % d, '--include'] + INC,
                       cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
    res[i] = (r.returncode, (r.stdout or '')[-300:] + (r.stderr or '')[-300:])
    print('part %d/%d t0=%.1f d=%.1f -> rc=%d' % (i + 1, n, t0, d, r.returncode), flush=True)


th = []
for i in range(n):
    t = threading.Thread(target=one, args=(i,)); t.start(); th.append(t)
    import time; time.sleep(20)   # לא לדחוף לגיט את כל החלקים באותה שנייה
for t in th:
    t.join()
bad = [i for i in range(n) if res.get(i, (1,))[0] != 0 or not os.path.exists(os.path.join(outdir, 'part%02d' % i, 'out.mp4'))]
if bad:
    for i in bad:
        print('FAILED part', i, res.get(i))
    sys.exit(1)
lst = os.path.join(outdir, 'parts.txt')
io.open(lst, 'w').write(''.join("file '%s'\n" % os.path.join(outdir, 'part%02d' % i, 'out.mp4').replace('\\', '/') for i in range(n)))
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(outdir, 'out.mp4')], check=True)
d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(outdir, 'out.mp4')], capture_output=True, text=True).stdout)
print('joined %s: %.1fs (expected %.1f)' % (a.film, d, a.total))
